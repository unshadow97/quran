/**
 * Speech recognition, off the main thread.
 *
 * Whisper holds the thread for seconds at a time. This app is a reader before
 * it is anything else, so the page has to stay scrollable while it thinks —
 * which means the model lives here and never touches the UI thread.
 *
 * The model is fetched from the Hugging Face CDN on first use and then cached
 * by the browser, so this is a one-time download rather than a per-recitation
 * one. Nothing is uploaded: the audio is decoded on the device and transcribed
 * on the device, which for a recording of somebody reciting Quran is the only
 * defensible default.
 */
import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

/** Per-part precision; see DTYPE in ./index.ts for why it is not uniform. */
export type Dtype = NonNullable<Parameters<typeof pipeline>[2]>['dtype'];

export type WorkerRequest =
  | { kind: 'load'; model: string; dtype: Dtype }
  | { kind: 'transcribe'; id: number; audio: Float32Array; language: string | null };

export type WorkerResponse =
  | { kind: 'progress'; file: string; loaded: number; total: number }
  | { kind: 'ready'; model: string }
  | { kind: 'loadFailed'; message: string }
  | { kind: 'result'; id: number; text: string; chunks: { text: string; timestamp: [number, number | null] }[] }
  | { kind: 'failed'; id: number; message: string };

let recogniser: AutomaticSpeechRecognitionPipeline | null = null;
let loadedModel: string | null = null;
let loading: Promise<void> | null = null;

const post = (message: WorkerResponse) => self.postMessage(message);

async function load(model: string, dtype: Dtype): Promise<void> {
  if (loadedModel === model && recogniser) return;
  if (loading) return loading;

  loading = (async () => {
    /*
     * Precision is set per part, not for the whole model.
     *
     * A blanket `q8` downloads and then fails to start: ONNX Runtime Web
     * rejects the quantised decoder embeddings with "Missing required scale
     * … embed_tokens.weight_merged_0_scale". The encoder quantises cleanly
     * and is the bulk of the weights, so it carries the saving; the decoder
     * stays at a precision the runtime will actually load.
     */
    recogniser = await pipeline('automatic-speech-recognition', model, {
      dtype,
      progress_callback: (progress: { status: string; file?: string; loaded?: number; total?: number }) => {
        if (progress.status !== 'progress') return;
        post({
          kind: 'progress',
          file: progress.file ?? '',
          loaded: progress.loaded ?? 0,
          total: progress.total ?? 0,
        });
      },
    });
    loadedModel = model;
  })();

  try {
    await loading;
    post({ kind: 'ready', model });
  } catch (error) {
    recogniser = null;
    loadedModel = null;
    post({ kind: 'loadFailed', message: (error as Error).message });
  } finally {
    loading = null;
  }
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  if (request.kind === 'load') {
    void load(request.model, request.dtype);
    return;
  }

  if (request.kind === 'transcribe') {
    void (async () => {
      try {
        if (!recogniser) throw new Error('The recogniser is not loaded yet.');

        const output = await recogniser(request.audio, {
          /*
           * Omitted entirely for a model that only speaks one language.
           *
           * Whisper fine-tuned on a single language is exported without the
           * multilingual head, and transformers.js then *throws* rather than
           * ignoring the option: "Cannot specify `task` or `language`". The
           * Quran model is one of those, so passing Arabic to it would fail
           * every transcription in the app — found by running it, not by
           * reading about it.
           */
          ...(request.language ? { language: request.language, task: 'transcribe' as const } : {}),
          /*
           * Segment timestamps, not word ones.
           *
           * `return_timestamps: 'word'` fails outright on these exports —
           * "Model outputs must contain cross attentions to extract
           * timestamps", because they were not exported with
           * `output_attentions=True`. Segments are what this model can
           * honestly give, and the caller does not turn them into per-word
           * timings: spreading a phrase's span evenly across its words would
           * put a mistake marker at a moment nothing was said.
           */
          return_timestamps: true,
          // Long recitations exceed Whisper's 30-second window, so it has to
          // be chunked. The stride is overlap, which is what stops a word
          // being cut in half at a boundary and read as two wrong ones.
          chunk_length_s: 30,
          stride_length_s: 5,
        });

        const result = Array.isArray(output) ? output[0] : output;
        post({
          kind: 'result',
          id: request.id,
          text: String(result?.text ?? ''),
          chunks: (result?.chunks ?? []) as { text: string; timestamp: [number, number | null] }[],
        });
      } catch (error) {
        post({ kind: 'failed', id: request.id, message: (error as Error).message });
      }
    })();
  }
});

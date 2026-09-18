# Third-party terms

Almost nothing in this application is ours. The Quran, the printed page, the
recitations and the translations are other people's work, and each comes with
terms. This file records what they are and how this project complies. It is an
audit of the terms as published, not legal advice.

## The one rule that governs everything

**This application must stay free.** Not a preference — a condition. The Quran
text and all three translations are permitted for *non-commercial use only*;
anything else requires permission from the translator or publisher. Selling it,
putting advertising on it, or charging for any part of it breaks the terms the
text itself is here under.

## Quran text

| | |
|---|---|
| Source | Tanzil.net Uthmani, fetched through AlQuran.cloud |
| Terms | Free for non-commercial use, with attribution, unmodified |
| Compliance | Free app, credited in Settings, and verified unaltered — `npm run quran:verify` compares against Quran.com and reports zero letter differences |

## Translations

| | |
|---|---|
| Malay | Abdullah Muhammad Basmeih |
| English | Saheeh International |
| Indonesian | Kementerian Agama RI |
| Terms | Tanzil publishes these for non-commercial purposes only; other use needs the translator's or publisher's permission. Using more than three in one application requires a link back to <https://tanzil.net/trans/> |
| Compliance | Free app; exactly three translations; credited in Settings |

## Mushaf page fonts

| | |
|---|---|
| Source | King Fahd Glorious Quran Printing Complex — QCF V2, the V4 COLRv1 tajweed build, Uthmanic Hafs and the surah-name face |
| Terms | The Complex grants permission, free of charge, to use, copy and distribute the font software. They retain ownership. It may not be sold, modified, altered, translated, reverse-engineered, decompiled or disassembled |
| Compliance | Committed byte-for-byte as downloaded, never modified, never sold. `public/fonts/*/NOTICE.md` carries the provenance of each |

## Reciter audio

| | |
|---|---|
| Source | EveryAyah.com |
| Terms | The licensing of individual recitations is not established |
| Compliance | **Not redistributed.** Audio is streamed from EveryAyah and no recitation is bundled with this project. If EveryAyah is unavailable, only the listen button stops working |

## Page layout and word meanings

| | |
|---|---|
| Source | Quran.com API |
| Use | Glyph codes (which word sits on which page and line) and the word-by-word glosses |

## On-device transcription

| | |
|---|---|
| Model | OpenAI Whisper, in the ONNX conversions published by `onnx-community` |
| Runtime | Transformers.js (Hugging Face) |
| Note | Downloaded by the reader's browser only when they ask for it, and run there. Nothing is uploaded |

## Software dependencies

Audited with `license-checker` over the production tree: 48 MIT, 14
BSD-3-Clause, 12 Apache-2.0, 5 ISC, 1 0BSD and the usual dual-licensed few.
All permissive.

Two are not, and neither reaches a reader:

- `sharp` / `@img/sharp-*` — Apache-2.0 **and** LGPL-3.0-or-later. A build-time
  image tool.
- `caniuse-lite` — CC-BY-4.0. Build-time browser data.

Both were checked against the published output and neither appears in it.

## This project's own code

MIT, in LICENSE. That covers the code and nothing else: anyone reusing it
commercially would have to source their own text, translations and fonts under
terms that permit it.

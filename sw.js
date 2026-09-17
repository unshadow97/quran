/*
 * Service worker.
 *
 * Hand-written rather than generated: the caching this app needs is simple and
 * specific, and a build plugin would add a moving part with nothing to gain.
 *
 * Strategy:
 *   - Quran data (/quran/*): cache-first and kept forever. It is immutable,
 *     and having it offline is what makes the reader usable on a plane or in a
 *     masjid with no signal.
 *   - Static build assets (/_next/static/*): cache-first, content-hashed.
 *   - Navigations: network-first with a cached shell fallback.
 *   - Everything else, including /api/*: straight to the network. Analysis
 *     results must never be served from a cache.
 */

// Bumped to v7: the search index was rebuilt so that the mushaf's spelling and
// the reader's reduce to the same thing — without it, ٱلْعَٰلَمِينَ could not be
// found by typing العالمين, and voice search could barely find anything at all
// because a recogniser emits modern orthography. `/quran/` is cache-first, so
// a device holding the old index would keep searching it forever.
//
// Bump this whenever bytes behind an immutable path change. It last moved at
// v11. It moved at v10 for the KFGQPC V4 page fonts under /fonts/qcf-v4/, and
// again here so a device that took any of the versions in between lets go of
// them cleanly.
const VERSION = 'v33';
const QURAN_CACHE = `quranic-data-${VERSION}`;
const ASSET_CACHE = `quranic-assets-${VERSION}`;
const PAGE_CACHE = `quranic-pages-${VERSION}`;

const KEEP = new Set([QURAN_CACHE, ASSET_CACHE, PAGE_CACHE]);

/*
 * Where this copy of the app lives, taken from the worker's own registration
 * rather than assumed to be the root.
 *
 * The same build is served from the root of a Worker, from a folder inside a
 * GitHub Pages site, and from inside an APK. A rule written as "/quran/" only
 * matches in the first of those, and a service worker that matches nothing
 * caches nothing: the app would look like it works and then be blank with no
 * signal. The scope is exactly the directory the worker was registered from,
 * so it is the one thing here that is always true.
 */
const BASE = new URL('./', self.registration.scope).pathname;
const at = (path) => BASE + path;

self.addEventListener('install', (event) => {
  // The metadata index is needed by every screen, so seed it eagerly.
  event.waitUntil(
    caches
      .open(QURAN_CACHE)
      .then((cache) => cache.addAll([at('quran/meta.json')]))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KEEP.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || (await refresh) || fetch(request);
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) || (await cache.match(BASE));
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET is cacheable, and cross-origin requests are none of our business.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Analysis and any other API call must always hit the network.
  if (url.pathname.startsWith(at('api/'))) return;

  if (url.pathname === at('quran/meta.json')) {
    // The index gains fields when the dataset is rebuilt, so serve the cached
    // copy for speed but refresh it in the background.
    event.respondWith(staleWhileRevalidate(request, QURAN_CACHE));
    return;
  }

  if (url.pathname.startsWith(at('quran/'))) {
    event.respondWith(cacheFirst(request, QURAN_CACHE));
    return;
  }

  // Mushaf page fonts: one per page, immutable, and needed for the page to
  // render at all. Cache-first so a page you have read stays readable offline.
  if (url.pathname.startsWith(at('fonts/'))) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (url.pathname.startsWith(at('_next/static/')) || url.pathname.startsWith(at('icons/'))) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGE_CACHE));
  }
});

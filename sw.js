// =========================================================
// Service Worker — versioned cache + offline fallback
// Uses paths relative to the SW's own location, so this
// keeps working if the site is deployed under a subpath
// (e.g. GitHub Pages: username.github.io/repo/).
// =========================================================

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `sultan-portfolio-${CACHE_VERSION}`;

const BASE = self.registration ? new URL('./', self.location).pathname : './';

const ASSETS_TO_CACHE = [
  '',
  'index.html',
  'css/style.css',
  'js/script.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
].map((path) => new URL(path, self.location).toString());

// ---- install: pre-cache app shell ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ---- activate: drop old cache versions ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('sultan-portfolio-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ---- fetch: network-first for navigation, cache-first for static assets ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (fonts CDN, external APIs, etc.) — let them
  // hit the network normally so we never accidentally cache something we
  // can't safely reuse offline.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(new URL('index.html', self.location).toString())))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});

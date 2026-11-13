// Local Speedtest — Minimal Service Worker for PWA installability.
// Cache essential shell assets; network-first for dynamic data with cache fallback.

const CACHE_NAME = 'local-speedtest-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favicon.svg',
  '/speedtest.js',
  '/speedtest_worker.js'
];

// Install: cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
});

// Activate: clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch: network-first for dynamic data, cache-first for shell assets.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Shell assets: cache-first.
  if (SHELL_ASSETS.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        fetch(event.request).then((networkResp) => {
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          return networkResp;
        }).catch(() => cached)
      )
    );
    return;
  }

  // Dynamic API/data: network-first with cache fallback.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

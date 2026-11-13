// Local Speedtest — Minimal Service Worker for PWA installability.
// Cache essential shell assets; never proxy speedtest traffic.

const CACHE_NAME = 'local-speedtest-v2';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favicon.svg',
  '/speedtest.js',
  '/speedtest_worker.js',
  '/results.html',
  '/manifest.json'
];

// Install: cache the app shell, tolerating individual asset failures.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        SHELL_ASSETS.map((url) => cache.add(url).catch(() => {}))
      )
    )
  );
  self.skipWaiting();
});

// Activate: clean up old caches and claim existing clients.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: never proxy speedtest traffic. Service workers drop XHR upload
// progress events, so POST /empty (upload), /garbage (download), /getIP and
// /results/* must bypass the SW and be handled by the browser natively.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Non-GET or cross-origin requests: let the browser handle them natively.
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Speedtest endpoints: bypass the SW entirely.
  if (
    pathname === '/empty' ||
    pathname === '/garbage' ||
    pathname === '/getIP' ||
    pathname.startsWith('/results/')
  ) {
    return;
  }

  // Shell assets: network-first, update cache on success, fall back to cache.
  if (SHELL_ASSETS.includes(pathname)) {
    event.respondWith(
      fetch(event.request).then((resp) => {
        if (resp.ok) {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        }
        return resp;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: let the browser handle it natively.
  return;
});

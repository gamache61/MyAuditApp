const CACHE_NAME = 'appaudit-v3.0-secure';
const UI_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(UI_ASSETS)));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // SECURITY: Strictly bypass cache for any Proxy API calls
  if (url.pathname.startsWith('/api/')) {
    return; // Force network usage
  }

  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
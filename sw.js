const CACHE_NAME = 'appaudit-v3.6';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => {
    return Promise.all(keys.map((key) => {
      if (key !== CACHE_NAME) return caches.delete(key);
    }));
  }));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('googleapis.com')) return;
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
const CACHE_NAME = 'sakura-monitor-v1';
const urlsToCache = [
  '/',
  '/frontend/index.html',
  '/frontend/style.css',
  '/frontend/app.js',
  '/frontend/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Hanya intercept HTTP/S request, abaikan WebSocket (ws/wss)
  if (event.request.url.startsWith('http')) {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            if (response) return response;
            return fetch(event.request).catch(() => {
                // Fallback sederhana jika offline total
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
          })
      );
  }
});
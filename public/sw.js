self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nova-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/static/js/main.js',
        '/static/css/main.css',
        '/models/tiny-llama.onnx'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

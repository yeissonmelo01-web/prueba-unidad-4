```javascript
const CACHE_NAME = 'securecam-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación del Service Worker y cacheo de recursos base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Creando caché de SecureCam...');
      return cache.addAll(ASSETS);
    })
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Limpiando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercepción de peticiones para servir contenido offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});

---

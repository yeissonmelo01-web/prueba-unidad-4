const CACHE_NAME = 'securecam-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icono-192.png.jpeg',
  './icono-512.png.png'
];

// Instalación del Service Worker y cacheo de recursos base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Creando caché de SecureCam...');
      // Usamos .addAll de manera segura con rutas relativas
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
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
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones para servir contenido offline
self.addEventListener('fetch', event => {
  // Solo procesar peticiones locales HTTP/HTTPS (ignorar extensiones de Chrome u otros protocolos)
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

// Service Worker para caché offline
const CACHE_NAME = 'taller-diego-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Assets estáticos para cachear
const STATIC_ASSETS = [
  '/views/inventory.html',
  '/views/service.html',
  '/views/index.html',
  '/styles/css/inventory.css',
  '/styles/css/side_bar.css',
  '/styles/css/header.css',
  '/styles/css/main.css',
  '/assets/icons/home.png',
  '/assets/icons/package.png',
  '/assets/icons/toolbox.png',
  '/assets/icons/search.png',
  'https://fonts.googleapis.com/css2?family=Istok+Web:wght@400;700&display=swap'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => console.error('Error cacheando assets:', err))
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== API_CACHE) {
            console.log('Service Worker: Limpiando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia para API: Network First, Cache Fallback
  if (url.pathname.startsWith('/api/v1/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clonar la respuesta para cachearla
          const responseClone = response.clone();
          caches.open(API_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar desde caché
          return caches.match(request);
        })
    );
    return;
  }

  // Estrategia para assets estáticos: Cache First, Network Fallback
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          console.log('Service Worker: Sirviendo desde caché:', request.url);
          return cached;
        }

        return fetch(request)
          .then(response => {
            // Cachear la nueva respuesta
            if (request.method === 'GET' && response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
      })
      .catch(err => {
        console.error('Service Worker: Error en fetch:', err);
      })
  );
});

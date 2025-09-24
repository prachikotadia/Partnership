// Simple Service Worker - Handles caching gracefully
const CACHE_NAME = 'bondly-glow-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Fetch event with error handling
self.addEventListener('fetch', (event) => {
  // Skip chrome-extension and other unsupported schemes
  if (event.request.url.startsWith('chrome-extension:') ||
      event.request.url.startsWith('moz-extension:') ||
      event.request.url.startsWith('safari-extension:') ||
      event.request.url.startsWith('ms-browser-extension:')) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch((error) => {
          console.log('Service Worker: Fetch failed', error);
          // Return a fallback response or let the browser handle it
          return new Response('Network error', { status: 408 });
        });
      })
      .catch((error) => {
        console.log('Service Worker: Cache match failed', error);
        // Let the browser handle the request normally
        return fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

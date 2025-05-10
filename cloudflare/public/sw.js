/**
 * Service Worker for Soundmaster Website
 * Provides offline functionality and performance optimizations
 */

const CACHE_NAME = 'soundmaster-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/news.html',
  '/on_demand.html',
  '/team.html',
  '/schedule.html',
  '/playlists.html',
  '/contacts.html',
  '/css/modern.css',
  '/js/api-client.js',
  '/js/content-loader.js',
  '/images/logo.jpg'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Roboto:wght@300;400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        // Cache local assets
        await cache.addAll(ASSETS_TO_CACHE);
        
        // Cache external resources
        const externalCachePromises = EXTERNAL_RESOURCES.map(url => {
          return fetch(url, { mode: 'no-cors' })
            .then(response => {
              return cache.put(url, response);
            })
            .catch(error => {
              console.error(`Failed to cache external resource: ${url}`, error);
            });
        });
        
        return Promise.all(externalCachePromises);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for API requests, cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For API requests, use network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Check if the request is for an external resource
  const isExternalResource = EXTERNAL_RESOURCES.some(extUrl => event.request.url.includes(extUrl));
  
  if (isExternalResource) {
    // For external resources, use network-first with fallback to cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For static assets, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(response => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response to store in cache
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  }
});

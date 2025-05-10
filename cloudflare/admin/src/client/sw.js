/**
 * Soundmaster Admin Dashboard Service Worker
 */

const CACHE_NAME = 'soundmaster-admin-cache-v1';

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/css/admin.css',
  '/js/admin.js',
  '/js/dashboard.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch(error => {
        console.error('Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - network-first strategy for API requests, cache-first for static assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdn.jsdelivr.net') && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // API requests - network first
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Don't cache API responses with errors
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
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache responses with errors
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
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // For HTML pages, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/login.html');
            }
            
            return new Response('Network error occurred', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-media-uploads') {
    event.waitUntil(syncMediaUploads());
  } else if (event.tag === 'sync-content-updates') {
    event.waitUntil(syncContentUpdates());
  }
});

// Function to sync media uploads when back online
async function syncMediaUploads() {
  try {
    // Get pending uploads from IndexedDB
    const pendingUploads = await getPendingUploads();
    
    if (pendingUploads.length === 0) {
      return;
    }
    
    // Process each pending upload
    for (const upload of pendingUploads) {
      try {
        // Attempt to upload
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${upload.token}`
          },
          body: upload.formData
        });
        
        if (response.ok) {
          // Remove from pending uploads if successful
          await removePendingUpload(upload.id);
          
          // Notify the client
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'UPLOAD_SYNCED',
              id: upload.id,
              success: true
            });
          });
        }
      } catch (error) {
        console.error('Failed to sync upload:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncMediaUploads:', error);
  }
}

// Function to sync content updates when back online
async function syncContentUpdates() {
  try {
    // Get pending content updates from IndexedDB
    const pendingUpdates = await getPendingContentUpdates();
    
    if (pendingUpdates.length === 0) {
      return;
    }
    
    // Process each pending update
    for (const update of pendingUpdates) {
      try {
        // Attempt to update
        const response = await fetch(update.url, {
          method: update.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${update.token}`
          },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          // Remove from pending updates if successful
          await removePendingContentUpdate(update.id);
          
          // Notify the client
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'CONTENT_SYNCED',
              id: update.id,
              success: true
            });
          });
        }
      } catch (error) {
        console.error('Failed to sync content update:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncContentUpdates:', error);
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB code
async function getPendingUploads() {
  // This would retrieve pending uploads from IndexedDB
  return [];
}

async function removePendingUpload(id) {
  // This would remove a pending upload from IndexedDB
}

async function getPendingContentUpdates() {
  // This would retrieve pending content updates from IndexedDB
  return [];
}

async function removePendingContentUpdate(id) {
  // This would remove a pending content update from IndexedDB
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'hcverse-pwa-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './bundle.js',
  './bundle.css',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[HCVerse ServiceWorker] Pre-caching offline pages (resilient)');
      // Resiliently add assets one-by-one so any individual 404 does not crash install
      const cachePromises = ASSETS_TO_CACHE.map(url => {
        return cache.add(url).catch(err => {
          console.warn(`[HCVerse ServiceWorker] Asset cache skipped: ${url}`, err);
        });
      });
      return Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[HCVerse ServiceWorker] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only intercept HTTP/HTTPS GET requests representing static files/origins
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bypass API calls so that live feeds & chat don't serve outdated information from cache
  if (event.request.url.includes('/api/') || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch new assets lazily in background to update cache (stale-while-revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* handle silent fallback */});
        
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback to cached index.html for SPA router support when user is totally offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html', { ignoreSearch: true });
        }
      });
    })
  );
});

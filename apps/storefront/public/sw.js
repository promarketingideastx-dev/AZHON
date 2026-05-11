// AZHON Safe PWA Service Worker
// Implements a strict Network-First for documents, and Cache-First for static assets.
// NO FAKE OFFLINE CHECKOUT. NO FAKE DATA.

const CACHE_NAME = 'azhon-pwa-cache-v4';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/', // Fallback, though we use network-first for documents
  '/logo-v2.png',
  '/icon-pwa-192.png',
  '/icon-pwa-512.png',
  '/manifest.json',
  '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. DANGEROUS/DYNAMIC ROUTES: Network ONLY.
  // We NEVER cache API, auth callbacks, or specific dynamic POSTs.
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/auth/') ||
    event.request.method !== 'GET'
  ) {
    return; // Let the browser handle it natively
  }

  // 2. STATIC ASSETS (Images, Next.js JS/CSS chunks): Cache-First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
    url.pathname.match(/font/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Cache the new static asset
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. HTML DOCUMENTS / APP ROUTES: Network-First
  // This ensures users always see the latest products, but gives a basic fallback if offline.
  const acceptHeader = event.request.headers.get('accept');
  if (event.request.mode === 'navigate' || (acceptHeader && acceptHeader.includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          // If offline and trying to navigate, we try to return the root page from cache as a fallback,
          // but realistically they will just see Chrome's standard offline dino, which is SAFE.
          return caches.match('/');
        })
    );
    return;
  }
});

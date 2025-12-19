// --- CONFIGURATION ---
// IMPORTANT: Increment this number (v1 -> v2) every time you update the app!
const CACHE_NAME = 'bunny-kanji-v2'; 

const ASSETS = [
  './',
  './index.html',
  './joyo_kanji_final.csv',
  './manifest.json',
  './icon_big.png',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

// 1. INSTALL: Cache all files
self.addEventListener('install', (e) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE: Delete old caches (The Cleanup Phase)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Tell the active service worker to take control of the page immediately
  return self.clients.claim();
});

// 3. FETCH: Serve from Cache, fall back to Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
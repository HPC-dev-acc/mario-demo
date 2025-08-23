const CACHE_NAME = 'mario-demo-cache';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './version.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

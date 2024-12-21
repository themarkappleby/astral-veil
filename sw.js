const CACHE_NAME = 'astral-veil-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/index.js',
  '/src/gameLoop.js',
  '/src/components.js',
  '/src/state.js',
  '/src/util.js',
  '/src/styles/reset.css',
  '/src/styles/colors.css',
  '/src/styles/styles.css',
  '/libs/preact.min.js',
  '/libs/htm.min.js',
  '/libs/hooks.umd.min.js',
  '/libs/fontawesome/css/fontawesome.min.css',
  '/libs/fontawesome/css/solid.min.css',
  '/libs/fontawesome/webfonts/fa-solid-900.ttf',
  '/libs/fontawesome/webfonts/fa-solid-900.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

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
}); 
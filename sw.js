// iBisne — Service Worker
// § 00.PWA — stale-while-revalidate (HTML/CSS/JS) + cache-first (imágenes)

// Bump esta versión cada vez que cambie un asset crítico para invalidar caché viejo
const CACHE = 'ibisne-v5.3.4';

const PRECACHE = [
  '/',
  '/index.html',
  '/quiz.html',
  '/no.html',
  // v5.0 · marketplace/inversionistas/portal/cliente quedan dormidos
  // (siguen en repo · sin link público · sin precache)
  '/legal/privacidad.html',
  '/legal/terminos.html',
  '/manifest.webmanifest',
  '/design-system-v2/tokens.css',
  '/assets/quiz/styles.css',
  '/assets/quiz/ui.js',
  '/assets/quiz/icons.js',
  '/assets/quiz/hud.js',
  '/assets/quiz/ambient.js',
  '/assets/quiz/loader.js',
  '/assets/quiz/prefs.js',
  '/assets/quiz/i18n.js',
  '/assets/quiz/pwa.js',
  '/assets/quiz/pwa-modal.css',
  '/data/pricing.js',
  '/data/scoring.js',
  '/data/inference.js',
  '/data/discovery.js',
  '/data/inversor.js',
  '/data/consultoria.js',
  '/brand/iBisne_blanco.png',
  '/assets/pwa/icon-192.png',
  '/assets/pwa/icon-512.png',
  '/assets/pwa/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => null)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const isImage = (req) => req.destination === 'image' || /\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/i.test(new URL(req.url).pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isImage(req)) {
    // cache-first
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // stale-while-revalidate (HTML/CSS/JS y todo lo demás)
  e.respondWith(
    caches.match(req).then((hit) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
        return res;
      }).catch(() => hit);
      return hit || fetchPromise;
    })
  );
});

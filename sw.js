// iBisne — Service Worker
// § 00.PWA — v11.3 · network-first (HTML/CSS/JS) + cache-first (imágenes)
// Cambio v11.3 vs v11.0-v11.2: antes era stale-while-revalidate · servía cache
// primero y refrescaba en background · obligaba al usuario a recargar 2x para
// ver cambios. Network-first siempre intenta red fresca; solo usa cache si
// hay error de red (offline). Cambios visibles instantáneo.

// Bump esta versión cada vez que cambie un asset crítico para invalidar caché viejo
const CACHE = 'ibisne-v19.6.0';

const PRECACHE = [
  '/',
  '/index.html',
  '/quiz.html',
  '/checkout.html',
  '/legal/privacidad.html',
  '/legal/terminos.html',
  '/manifest.webmanifest',
  '/design-system-v2/tokens.css',
  '/design-system-v2/components.css',
  '/design-system-v2/components-extra.css',
  '/assets/sitio/landing.css',
  '/assets/sitio/landing-animations.js',
  '/assets/sitio/quiz-guiado.css',
  '/assets/sitio/quiz-guiado.js',
  '/assets/sitio/checkout.css',
  '/assets/sitio/checkout.js',
  '/data/precios-v13.js',
  '/assets/quiz/icons.js',
  '/assets/quiz/pwa.js',
  '/assets/quiz/pwa-modal.css',
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
    ).then(() => self.clients.claim()).then(() => {
      // v11.3 · Notificar a todos los clientes que hay nueva versión activa
      // → pwa.js escucha este mensaje y hace location.reload() para que el
      // usuario vea los cambios sin tener que hacer nada manual.
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          try { client.postMessage({ type: 'SW_NEW_VERSION', cache: CACHE }); } catch (_) {}
        });
      });
    })
  );
});

const isImage = (req) => req.destination === 'image' || /\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/i.test(new URL(req.url).pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isImage(req)) {
    // cache-first (imágenes raramente cambian)
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // v11.3 · network-first para HTML/CSS/JS y todo lo demás
  // Siempre intenta red fresca primero. Si responde OK, actualiza cache y sirve.
  // Si la red falla (offline o error), cae al cache. Resultado: usuario siempre
  // ve la versión más reciente cuando hay conexión.
  e.respondWith(
    fetch(req).then((res) => {
      // Solo cachear respuestas válidas (200 OK)
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
      }
      return res;
    }).catch(() => caches.match(req))
  );
});

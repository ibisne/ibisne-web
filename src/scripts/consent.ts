/**
 * Consentimiento y Google Analytics.
 * - localStorage.ib_consent = 'all' | 'essential' (misma clave que el sitio anterior).
 * - GA solo se carga con 'all'. El script de gtag se inyecta desde este modulo
 *   (sin scripts inline, compatible con la CSP).
 * - Reabrible desde cualquier elemento con [data-open-consent].
 */
const KEY = 'ib_consent';
const GA_ID = 'G-XEW1TZEMNL';
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

type Consent = 'all' | 'essential';

interface GAWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [k: `ga-disable-${string}`]: boolean | undefined;
}
const w = window as unknown as GAWindow;

function read(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'all' || v === 'essential' ? v : null;
  } catch {
    return null;
  }
}

function write(v: Consent): void {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* almacenamiento bloqueado: la decision vale solo en esta pagina */
  }
}

/* ---------- Google Analytics ---------- */
let gaLoaded = false;
let lastPath = '';

function scriptURL(): string {
  // Trusted Types, si el navegador/CSP los exige. Solo se admite el origen de GA.
  const tt = (window as unknown as { trustedTypes?: { createPolicy(n: string, o: object): { createScriptURL(s: string): string } } })
    .trustedTypes;
  if (!tt) return GA_SRC;
  try {
    const policy = tt.createPolicy('ib-ga', {
      createScriptURL: (u: string) => {
        if (u !== GA_SRC) throw new TypeError('URL de script no permitida');
        return u;
      },
    });
    return policy.createScriptURL(GA_SRC);
  } catch {
    return GA_SRC;
  }
}

function loadGA(): void {
  if (gaLoaded) return;
  gaLoaded = true;
  w[`ga-disable-${GA_ID}`] = false;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag exige el objeto `arguments`, no un array.
    // eslint-disable-next-line prefer-rest-params
    (w.dataLayer as unknown[]).push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA_ID, { anonymize_ip: true });
  lastPath = location.pathname + location.search;

  const s = document.createElement('script');
  s.async = true;
  s.src = scriptURL();
  document.head.appendChild(s);
}

function disableGA(): void {
  w[`ga-disable-${GA_ID}`] = true;
}

// Paginas vistas en navegacion SPA (la carga inicial ya la cuenta `config`).
document.addEventListener('astro:page-load', () => {
  if (!gaLoaded || !w.gtag) return;
  const path = location.pathname + location.search;
  if (path === lastPath) return;
  lastPath = path;
  w.gtag('event', 'page_view', { page_title: document.title, page_location: location.href, page_path: path });
});

/* ---------- Banner ---------- */
function banner(): HTMLElement | null {
  return document.getElementById('consent');
}

function show(focus = false): void {
  const el = banner();
  if (!el) return;
  el.hidden = false;
  if (focus) el.querySelector<HTMLElement>('[data-consent="all"]')?.focus();
}

function hide(): void {
  const el = banner();
  if (el) el.hidden = true;
}

function decide(v: Consent): void {
  write(v);
  hide();
  if (v === 'all') loadGA();
  else disableGA();
}

document.addEventListener('click', (e) => {
  const t = e.target as Element | null;
  if (!t) return;
  const choice = t.closest<HTMLElement>('[data-consent]');
  if (choice && choice.closest('#consent')) {
    decide(choice.dataset.consent === 'all' ? 'all' : 'essential');
    return;
  }
  const opener = t.closest('[data-open-consent]');
  if (opener) {
    e.preventDefault();
    show(true);
  }
});

function init(): void {
  const saved = read();
  if (saved === 'all') loadGA();
  else if (saved === null) show();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

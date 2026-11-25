/**
 * Navegacion movil sin menu: flechas sutiles en las orillas (SwipeHint.astro) y deslizar el
 * dedo en horizontal. Orden del mundo: Inicio · Trabajo · Contacto. Deslizar "pulsa" la flecha,
 * asi el ClientRouter y el viaje de camara hacen lo de siempre.
 */
const MOBILE = 'not ((min-width: 1024px) and (min-height: 700px))';
const ORDER = [
  { href: '/', label: 'Inicio' },
  { href: '/trabajo/', label: 'Trabajo' },
  { href: '/contacto/', label: 'Contacto' },
];

function indexFor(pathname: string): number {
  if (pathname === '/' || pathname === '') return 0;
  if (pathname.startsWith('/trabajo')) return 1;
  if (pathname.startsWith('/contacto')) return 2;
  return -1;
}

function setArrow(a: HTMLAnchorElement | null, to: { href: string; label: string } | null): void {
  if (!a) return;
  if (to) {
    a.href = to.href;
    a.setAttribute('aria-label', `Ir a ${to.label}`);
    a.removeAttribute('aria-hidden');
    a.removeAttribute('tabindex');
    a.removeAttribute('data-off');
  } else {
    a.setAttribute('aria-hidden', 'true');
    a.setAttribute('tabindex', '-1');
    a.setAttribute('data-off', '');
  }
}

const hint = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-swipe-hint]');

/** Alinea las flechas con la ruta dada. Legales y 404 quedan sin flechas ni deslizar. */
function sync(pathname: string): void {
  const h = hint();
  if (!h) return;
  const i = indexFor(pathname);
  const inFicha = i === 1 && pathname !== '/trabajo/' && pathname !== '/trabajo';
  const prev = i === -1 ? null : inFicha ? ORDER[1] : (ORDER[i - 1] ?? null);
  const next = i === -1 || inFicha ? null : (ORDER[i + 1] ?? null);
  setArrow(h.querySelector<HTMLAnchorElement>('[data-pg="prev"]'), prev);
  setArrow(h.querySelector<HTMLAnchorElement>('[data-pg="next"]'), next);
}

function syncScroll(): void {
  const h = hint();
  if (!h) return;
  const down = window.scrollY > 80;
  if (down !== h.hasAttribute('data-scrolled')) h.toggleAttribute('data-scrolled', down);
}

let wired = false;
export function initSwipeNav(): void {
  if (wired) return;
  wired = true;
  sync(location.pathname);
  syncScroll();
  // la flecha responde al tocar, no al llegar
  document.addEventListener('astro:before-preparation', (ev) => {
    const to = (ev as Event & { to?: URL }).to;
    if (to) sync(to.pathname);
  });
  document.addEventListener('astro:page-load', () => {
    sync(location.pathname);
    syncScroll();
  });
  window.addEventListener('scroll', syncScroll, { passive: true });

  const mq = window.matchMedia(MOBILE);
  const EDGE = 24; // el borde es del gesto "atras" del sistema
  let x0 = 0;
  let y0 = 0;
  let t0 = 0;
  let live = false;

  window.addEventListener(
    'touchstart',
    (e) => {
      live = false;
      if (!mq.matches || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
      if (document.documentElement.hasAttribute('data-entry-hold') || document.querySelector('dialog[open]')) return;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('.scroll-x, input, textarea, select, [data-no-swipe]')) return;
      x0 = t.clientX;
      y0 = t.clientY;
      t0 = e.timeStamp;
      live = true;
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length !== 1) live = false;
    },
    { passive: true },
  );
  window.addEventListener('touchcancel', () => (live = false), { passive: true });
  window.addEventListener(
    'touchend',
    (e) => {
      if (!live) return;
      live = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.6 || e.timeStamp - t0 > 800) return;
      // el dedo va a la izquierda = avanzar (la pagina siguiente esta a la derecha)
      const a = hint()?.querySelector<HTMLAnchorElement>(`[data-pg="${dx < 0 ? 'next' : 'prev'}"]`);
      if (a && !a.hasAttribute('data-off')) a.click();
    },
    { passive: true },
  );
}

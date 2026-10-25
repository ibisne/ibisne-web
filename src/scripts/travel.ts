/**
 * Motor de transiciones "viaje" de iBisne.
 *
 * Cada pagina registra `registerPage(id, { focal, exit, enter })`. Al navegar
 * (ClientRouter) se ejecuta el `exit` de la pagina que sale MIENTRAS se descarga
 * la siguiente, y el `enter` de la que llega justo despues del cambio de DOM.
 * En carga directa se ejecuta `enter` sin origen (entrada suave).
 *
 * Si una pagina no define hooks, el motor usa los de serie, que animan los
 * elementos marcados con:
 *   [data-travel-bg]  capas de fondo (scale + blur alrededor del punto focal)
 *   [data-travel-ui]  piezas de interfaz (fundido al salir, cascada al entrar)
 *
 * Solo Web Animations API. Sin librerias.
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';

export type PageId = 'home' | 'trabajo' | 'contacto' | 'legal' | '404';
/** forward = acercarse al punto focal · back = volver a Inicio · fade = solo fundido · boot = carga directa */
export type Direction = 'forward' | 'back' | 'fade' | 'boot';

export interface Focal {
  /** 0..1 desde la izquierda del escenario */
  x: number;
  /** 0..1 desde arriba del escenario */
  y: number;
}

export interface TravelCtx {
  /** Pagina que ejecuta el hook */
  page: PageId;
  /** exit: pagina de destino. enter: null */
  to: PageId | null;
  /** enter: pagina de origen (null = carga directa). exit: null */
  from: PageId | null;
  direction: Direction;
  /** prefers-reduced-motion: reduce */
  reduced: boolean;
  /** <main id="page"> */
  root: HTMLElement;
  /** Capas [data-travel-bg] del root */
  bg: HTMLElement[];
  /** Piezas [data-travel-ui] del root, en orden de documento */
  ui: HTMLElement[];
  /** Punto focal relevante (destino en exit, origen en enter); centro si no hay */
  focal: Focal;
  /** Animaciones de serie: se pueden llamar y complementar */
  defaults: { exit(): Animation[]; enter(): Animation[] };
}

/**
 * Importante: crea las animaciones de forma SINCRONA. El motor retira el estado
 * de arranque (html[data-boot]) justo despues de llamar a `enter`; si la
 * animacion se crea tarde, la pagina parpadea completa un cuadro.
 */
export type TravelHook = (ctx: TravelCtx) => void | Animation | Animation[] | Promise<unknown>;

export interface PageDef {
  /** Punto focal por pagina vecina: donde estaba/esta el elemento que lleva a ella */
  focal?: Partial<Record<PageId, Focal>>;
  exit?: TravelHook;
  enter?: TravelHook;
}

const registry = new Map<PageId, PageDef>();

export function registerPage(id: PageId, def: PageDef): void {
  registry.set(id, def);
}

/* ---------- Constantes de la spec ---------- */
const EXIT_MS = 650;
const ENTER_MS = 700;
const UI_OUT_MS = 250;
const UI_IN_MS = 520;
const STAGGER_MS = 40;
const STAGGER_MAX_MS = 560;
const FADE_MS = 200;
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SCALE_FAR = 2.6;
const CENTER: Focal = { x: 0.5, y: 0.5 };

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const isReduced = () => reducedQuery.matches;

let active: Animation[] = [];
/** Origen de la navegacion en curso; se consume en astro:page-load. undefined = nada pendiente */
let pendingFrom: PageId | undefined;

/* ---------- Utilidades ---------- */
function pageIdFromPath(pathname: string): PageId {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/trabajo')) return 'trabajo';
  if (pathname.startsWith('/contacto')) return 'contacto';
  if (pathname.startsWith('/legal')) return 'legal';
  return '404';
}

function currentPageId(): PageId {
  const v = document.documentElement.dataset.page;
  return v === 'home' || v === 'trabajo' || v === 'contacto' || v === 'legal' || v === '404' ? v : 'legal';
}

function getRoot(): HTMLElement | null {
  return document.getElementById('page');
}

function dispatchB(name: 'b:dissolve' | 'b:assemble'): void {
  window.dispatchEvent(new CustomEvent(name));
}

function track(list: Animation[]): Animation[] {
  active.push(...list);
  return list;
}

function cancelActive(): void {
  for (const a of active) {
    try {
      a.cancel();
    } catch {
      /* animacion ya liberada */
    }
  }
  active = [];
}

function toList(r: void | Animation | Animation[] | Promise<unknown>): Animation[] {
  if (!r || typeof (r as Promise<unknown>).then === 'function') return [];
  return Array.isArray(r) ? r : [r as Animation];
}

function finishedAll(list: Animation[]): Promise<unknown> {
  return Promise.allSettled(list.map((a) => a.finished));
}

function makeCtx(page: PageId, to: PageId | null, from: PageId | null, direction: Direction, root: HTMLElement): TravelCtx {
  const def = registry.get(page);
  const other = to ?? from;
  const focal = (other && def?.focal?.[other]) || CENTER;
  const ctx: TravelCtx = {
    page,
    to,
    from,
    direction,
    reduced: isReduced(),
    root,
    bg: Array.from(root.querySelectorAll<HTMLElement>('[data-travel-bg]')),
    ui: Array.from(root.querySelectorAll<HTMLElement>('[data-travel-ui]')),
    focal,
    defaults: { exit: () => defaultExit(ctx), enter: () => defaultEnter(ctx) },
  };
  return ctx;
}

/* ---------- Animaciones de serie ---------- */
function fadeRoot(root: HTMLElement, dir: 'in' | 'out'): Animation[] {
  const k = dir === 'out' ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }];
  return [root.animate(k, { duration: FADE_MS, easing: 'linear', fill: 'both' })];
}

function defaultExit(ctx: TravelCtx): Animation[] {
  const { root, bg, ui, reduced, direction, focal } = ctx;
  if (reduced || direction === 'fade' || (!bg.length && !ui.length)) return fadeRoot(root, 'out');

  const out: Animation[] = [];
  const back = direction === 'back';
  const origin = `${(focal.x * 100).toFixed(2)}% ${(focal.y * 100).toFixed(2)}%`;
  const toScale = back ? 0.82 : SCALE_FAR;
  const toBlur = back ? 8 : 10;

  for (const el of bg) {
    el.style.transformOrigin = origin;
    el.style.willChange = 'transform, filter, opacity';
    out.push(
      el.animate(
        [
          { transform: 'scale(1)', filter: 'blur(0px)' },
          { transform: `scale(${toScale})`, filter: `blur(${toBlur}px)` },
        ],
        { duration: EXIT_MS, easing: EASE_IN, fill: 'both' },
      ),
      // El fondo se apaga en el ultimo tramo para que el corte de DOM no se note.
      el.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.62 }, { opacity: 0, offset: 1 }], {
        duration: EXIT_MS,
        easing: 'linear',
        fill: 'both',
      }),
    );
  }
  for (const el of ui) {
    out.push(
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: UI_OUT_MS, easing: 'ease-out', fill: 'both' }),
    );
  }
  return out;
}

function defaultEnter(ctx: TravelCtx): Animation[] {
  const { root, bg, ui, reduced, direction, focal } = ctx;
  if (reduced || direction === 'fade' || (!bg.length && !ui.length)) return fadeRoot(root, 'in');

  const out: Animation[] = [];
  const boot = direction === 'boot';
  const back = direction === 'back';
  const origin = `${(focal.x * 100).toFixed(2)}% ${(focal.y * 100).toFixed(2)}%`;
  const fromScale = boot ? 1.06 : back ? SCALE_FAR : 1.35;
  const fromBlur = boot ? 0 : back ? 10 : 8;
  const dur = boot ? 900 : ENTER_MS;

  for (const el of bg) {
    el.style.transformOrigin = origin;
    out.push(
      el.animate(
        [
          { transform: `scale(${fromScale})`, filter: `blur(${fromBlur}px)` },
          { transform: 'scale(1)', filter: 'blur(0px)' },
        ],
        { duration: dur, easing: EASE_OUT, fill: 'both' },
      ),
      el.animate([{ opacity: 0, offset: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1, offset: 1 }], {
        duration: dur,
        easing: 'linear',
        fill: 'both',
      }),
    );
  }

  const base = boot ? 180 : Math.round(ENTER_MS * 0.45);
  ui.forEach((el, i) => {
    const delay = base + Math.min(i * STAGGER_MS, STAGGER_MAX_MS);
    out.push(
      el.animate(
        [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: UI_IN_MS, delay, easing: EASE_OUT, fill: 'both' },
      ),
    );
  });

  // La B se rearma cuando el fondo ya casi asento.
  window.setTimeout(() => dispatchB('b:assemble'), base);
  return out;
}

/* ---------- Ejecucion ---------- */
async function runHook(
  hook: TravelHook | undefined,
  ctx: TravelCtx,
  fallback: () => Animation[],
): Promise<Animation[]> {
  let list: Animation[];
  let pending: Promise<unknown> | undefined;
  if (hook) {
    try {
      const r = hook(ctx);
      list = toList(r);
      if (r && typeof (r as Promise<unknown>).then === 'function') pending = r as Promise<unknown>;
    } catch (err) {
      console.error('[travel] hook fallo, uso animacion de serie', err);
      list = fallback();
    }
  } else {
    list = fallback();
  }
  track(list);
  if (pending) await pending.catch(() => undefined);
  return list;
}

async function runExit(from: PageId, to: PageId, signal: AbortSignal): Promise<void> {
  const root = getRoot();
  if (!root) return;
  cancelActive();
  const direction: Direction = from === 'legal' || from === '404' ? 'fade' : to === 'home' ? 'back' : 'forward';
  const ctx = makeCtx(from, to, null, direction, root);
  root.style.pointerEvents = 'none';
  dispatchB('b:dissolve');
  signal.addEventListener('abort', () => {
    cancelActive();
    root.style.pointerEvents = '';
  });
  const list = await runHook(registry.get(from)?.exit, ctx, () => defaultExit(ctx));
  await finishedAll(list);
}

function runEnter(from: PageId | null): void {
  const root = getRoot();
  if (!root) {
    document.documentElement.removeAttribute('data-boot');
    return;
  }
  cancelActive();
  const page = currentPageId();
  const direction: Direction =
    from === null ? 'boot' : page === 'legal' || page === '404' || from === 'legal' || from === '404' ? 'fade' : page === 'home' ? 'back' : 'forward';
  const ctx = makeCtx(page, null, from, direction, root);
  const hook = registry.get(page)?.enter;

  let list: Animation[];
  try {
    list = toList(hook ? hook(ctx) : undefined);
    if (!hook) list = defaultEnter(ctx);
  } catch (err) {
    console.error('[travel] enter fallo, uso animacion de serie', err);
    list = defaultEnter(ctx);
  }
  track(list);
  // Con las animaciones ya creadas (fill: both mantiene el primer cuadro) se revela la pagina.
  document.documentElement.removeAttribute('data-boot');
  root.style.pointerEvents = '';
  // Al terminar, el estado final = estado natural: se liberan capas compuestas.
  const mine = list;
  void finishedAll(mine).then(() => {
    for (const a of mine) {
      try {
        a.cancel();
      } catch {
        /* ya liberada */
      }
    }
    active = active.filter((a) => !mine.includes(a));
    for (const el of root.querySelectorAll<HTMLElement>('[data-travel-bg]')) el.style.willChange = '';
  });
}

/* ---------- Integracion con ClientRouter ---------- */
document.addEventListener('astro:before-preparation', (ev) => {
  const e = ev as TransitionBeforePreparationEvent;
  const from = currentPageId();
  const to = pageIdFromPath(e.to.pathname);
  if (e.to.pathname === e.from.pathname) return; // mismo documento (query/hash)

  pendingFrom = from;
  const original = e.loader;
  e.loader = async () => {
    const exiting = runExit(from, to, e.signal);
    try {
      await Promise.all([original(), exiting]);
    } catch (err) {
      cancelActive();
      throw err;
    }
  };
});

// El DOM nuevo ya esta puesto (con html[data-boot] heredado del documento nuevo).
document.addEventListener('astro:after-swap', () => {
  if (!document.documentElement.hasAttribute('data-boot')) document.documentElement.setAttribute('data-boot', '');
  // Seguro: la pagina nueva nunca se queda oculta si page-load no llega.
  window.setTimeout(() => document.documentElement.removeAttribute('data-boot'), 2500);
});

// Los scripts de la pagina nueva ya corrieron y registraron sus hooks.
document.addEventListener('astro:page-load', () => {
  if (pendingFrom === undefined) return; // carga inicial: la resuelve boot()
  const from = pendingFrom;
  pendingFrom = undefined;
  runEnter(from);
});

/* ---------- Carga directa ---------- */
let booted = false;
function boot(): void {
  if (booted) return;
  booted = true;
  runEnter(null);
}
// Los scripts modulos de la pagina se ejecutan antes de DOMContentLoaded, asi
// que para entonces ya registraron sus hooks.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else queueMicrotask(boot);

// Seguro: si algo fallo, la pagina nunca se queda oculta.
window.setTimeout(() => document.documentElement.removeAttribute('data-boot'), 2000);

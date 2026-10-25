/**
 * Coreografia de la interfaz durante el viaje del mundo.
 *
 * El viaje en si lo hace el motor WebGL (src/scripts/world/): un solo canvas persistente que
 * mueve la camara entre estaciones y nunca se ve negro. Aqui solo se sincroniza la UI de cada
 * pagina con ese viaje:
 *
 *   salida   world 'start' -> el <main> saliente se desvanece y sus piezas [data-travel-ui] se
 *            van hacia donde viaja el mundo, con desenfoque (300 ms, arranca de inmediato)
 *   cambio   el DOM se intercambia en la fase 'mid' (connectRouter espera a world 'mid', ~66 %
 *            del viaje: la camara ya frena)
 *   entrada  astro:page-load (justo despues de 'mid') -> las piezas [data-travel-ui] entran en
 *            cascada desde el lado contrario (ui-motion.ts)
 *
 * Marca con [data-travel-ui] las piezas que deben entrar en cascada. Una pagina sin marcas
 * entra con un fundido de todo el <main>; una que lleva [data-travel-self] anima su propia
 * entrada (Contacto). Con reduced motion todo es un fundido de 200 ms.
 * Los hooks de `registerPage` (enter) siguen funcionando por compatibilidad, pero ya no hacen falta.
 * Solo Web Animations API. Sin librerias.
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { connectRouter, onTravel } from './world';
import {
  NO_TRAVEL,
  UI_EASE_IN,
  UI_EASE_OUT,
  UI_EXIT_MS,
  UI_IN_MS,
  UI_STAGGER_MAX_MS,
  UI_STAGGER_MS,
  inFrames,
  outFrames,
  travelVector,
} from './ui-motion';
import type { TravelVector } from './ui-motion';

export type PageId = 'home' | 'trabajo' | 'proyecto' | 'contacto' | 'legal' | '404';
/** forward = ir a otra estacion · back = volver a Inicio · fade = legales/404 · boot = carga directa */
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
  /** Capas [data-travel-bg] del root (compat: solo se les aplica un fundido) */
  bg: HTMLElement[];
  /** Piezas [data-travel-ui] del root, en orden de documento */
  ui: HTMLElement[];
  /** Sin uso: el mundo ya decide el encuadre. Se conserva por compatibilidad */
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
  /** Sin efecto (el mundo encuadra solo). Compat */
  focal?: Partial<Record<PageId, Focal>>;
  /** Sin efecto: la salida es siempre el fundido de serie. Compat */
  exit?: TravelHook;
  /** Reemplaza la entrada de serie de esta pagina */
  enter?: TravelHook;
}

const registry = new Map<PageId, PageDef>();

export function registerPage(id: PageId, def: PageDef): void {
  registry.set(id, def);
}

/* ---------- Constantes ---------- */
const EXIT_MS = UI_EXIT_MS;
const FADE_MS = 200;
const BOOT_IN_MS = 640;
const STAGGER_MS = UI_STAGGER_MS;
const STAGGER_MAX_MS = UI_STAGGER_MAX_MS;
const ENTER_DELAY_MS = 0;
const BOOT_DELAY_MS = 260;
const EASE_IN = UI_EASE_IN;
const EASE_OUT = UI_EASE_OUT;
const CENTER: Focal = { x: 0.5, y: 0.5 };

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const isReduced = () => reducedQuery.matches;

let active: Animation[] = [];
/** Origen de la navegacion en curso (se consume en astro:page-load). undefined = ninguna pendiente */
let pendingFrom: PageId | undefined;
let exiting = false;
/** Sentido del ultimo viaje (lo da el mundo en 'start') */
let vec: TravelVector = NO_TRAVEL;

/* ---------- Utilidades ---------- */
function currentPageId(): PageId {
  const v = document.documentElement.dataset.page;
  return v === 'home' || v === 'trabajo' || v === 'proyecto' || v === 'contacto' || v === 'legal' || v === '404' ? v : 'legal';
}

function getRoot(): HTMLElement | null {
  return document.getElementById('page');
}

function cancelAll(list: Animation[]): void {
  for (const a of list) {
    try {
      a.cancel();
    } catch {
      /* animacion ya liberada */
    }
  }
}

function toList(r: void | Animation | Animation[] | Promise<unknown>): Animation[] {
  if (!r || typeof (r as Promise<unknown>).then === 'function') return [];
  return Array.isArray(r) ? r : [r as Animation];
}

function makeCtx(page: PageId, to: PageId | null, from: PageId | null, direction: Direction, root: HTMLElement): TravelCtx {
  const ctx: TravelCtx = {
    page,
    to,
    from,
    direction,
    reduced: isReduced(),
    root,
    bg: Array.from(root.querySelectorAll<HTMLElement>('[data-travel-bg]')),
    ui: Array.from(root.querySelectorAll<HTMLElement>('[data-travel-ui]')),
    focal: CENTER,
    defaults: { exit: () => defaultExit(ctx), enter: () => defaultEnter(ctx) },
  };
  return ctx;
}

/* ---------- Animaciones de serie ---------- */
function defaultExit(ctx: TravelCtx): Animation[] {
  const dur = ctx.reduced ? FADE_MS : EXIT_MS;
  const out = [ctx.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: EASE_IN, fill: 'both' })];
  if (ctx.reduced) return out;
  // las piezas se van hacia donde viaja el mundo; el desenfoque solo en ellas, no en todo <main>
  const frames = outFrames(vec);
  for (const el of ctx.ui) out.push(el.animate(frames, { duration: dur, easing: EASE_IN, fill: 'both' }));
  return out;
}

function defaultEnter(ctx: TravelCtx): Animation[] {
  const { root, bg, ui, reduced, direction } = ctx;
  // la pagina anima su propia entrada (Contacto: contact-enter.ts)
  if (root.querySelector('[data-travel-self]')) return [];
  if (reduced || (!bg.length && !ui.length)) {
    return [root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: 'linear', fill: 'both' })];
  }
  const boot = direction === 'boot';
  const base = boot ? BOOT_DELAY_MS : ENTER_DELAY_MS;
  const out: Animation[] = [];
  for (const el of bg) {
    out.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: base, easing: 'linear', fill: 'both' }));
  }
  // carga directa: subida corta; viaje: desde el lado contrario, con desenfoque
  const frames = boot
    ? [
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ]
    : inFrames(vec);
  const duration = boot ? BOOT_IN_MS : UI_IN_MS;
  ui.forEach((el, i) => {
    const delay = base + Math.min(i * STAGGER_MS, STAGGER_MAX_MS);
    out.push(el.animate(frames, { duration, delay, easing: EASE_OUT, fill: 'both' }));
  });
  return out;
}

/* ---------- Salida ---------- */
function runExit(): void {
  if (exiting) return;
  const root = getRoot();
  if (!root) return;
  exiting = true;
  cancelAll(active);
  const ctx = makeCtx(currentPageId(), null, null, 'forward', root);
  root.style.pointerEvents = 'none';
  active = defaultExit(ctx);
}

/* ---------- Entrada ---------- */
function runEnter(from: PageId | null): void {
  const root = getRoot();
  if (!root) {
    document.documentElement.removeAttribute('data-boot');
    return;
  }
  cancelAll(active);
  active = [];
  const page = currentPageId();
  const direction: Direction =
    from === null ? 'boot' : page === 'legal' || page === '404' || from === 'legal' || from === '404' ? 'fade' : page === 'home' ? 'back' : 'forward';
  const ctx = makeCtx(page, null, from, direction, root);
  const hook = registry.get(page)?.enter;

  let list: Animation[];
  try {
    list = hook ? toList(hook(ctx)) : defaultEnter(ctx);
  } catch (err) {
    console.error('[travel] enter fallo, uso animacion de serie', err);
    list = defaultEnter(ctx);
  }
  active = list;
  // Con las animaciones ya creadas (fill: both mantiene el primer cuadro) se revela la pagina.
  document.documentElement.removeAttribute('data-boot');
  root.style.pointerEvents = '';
  // Al terminar, el estado final = estado natural: se liberan capas compuestas.
  const mine = list;
  void Promise.allSettled(mine.map((a) => a.finished)).then(() => {
    cancelAll(mine);
    active = active.filter((a) => !mine.includes(a));
  });
}

/* ---------- Integracion con el mundo y el ClientRouter ---------- */
// connectRouter: pide goTo(estacion destino) y retiene el cambio de DOM hasta la fase 'mid'.
connectRouter();

document.addEventListener('astro:before-preparation', (ev) => {
  const e = ev as TransitionBeforePreparationEvent;
  if (e.to.pathname === e.from.pathname) return; // mismo documento (query/hash)
  pendingFrom = currentPageId();
});

// El viaje arranco: la interfaz saliente se va antes de 'mid'. Solo si hay un cambio de pagina
// en curso (un goTo de realineacion no debe apagar una pagina que se queda).
onTravel((phase, from, to) => {
  if (phase !== 'start') return;
  vec = travelVector(from, to);
  if (pendingFrom !== undefined) runExit();
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
  exiting = false;
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

/**
 * En movil, un cambio de viewport a mitad de una View Transition hace que el navegador
 * la aborte y la promesa rechace con "Transition was aborted because of invalid state".
 * Es inofensivo (el router ya navego); solo se silencia ese rechazo concreto.
 */
window.addEventListener('unhandledrejection', (ev) => {
  const r = ev.reason as { name?: string; message?: string } | undefined;
  if (!r) return;
  const name = String(r.name ?? '');
  const msg = String(r.message ?? '');
  const isTransition = /transition/i.test(msg) || /view.?transition/i.test(msg);
  if ((name === 'AbortError' || name === 'InvalidStateError') && isTransition) ev.preventDefault();
  else if (/Transition was aborted because of invalid state/i.test(msg)) ev.preventDefault();
});

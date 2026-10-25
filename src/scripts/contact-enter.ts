/**
 * Movimiento de Contacto sobre el mundo WebGL persistente.
 *
 * - Salida: al empezar un viaje desde 'contacto' (onTravel 'start'), las piezas se van hacia
 *   donde viaja el mundo, con desenfoque, antes de que el motor cambie el DOM (fase 'mid').
 * - Entrada: en astro:page-load (llega justo despues de 'mid') las piezas marcadas con
 *   [data-ct-in] entran desde el lado contrario en cascada, en orden de lectura (arriba a
 *   abajo, izquierda a derecha). Mismo patron que travel.ts (ui-motion.ts); la pagina lleva
 *   [data-travel-self] para que travel.ts no le sume un fundido de todo el <main>.
 *   Con movimiento reducido: un solo fundido de 200 ms, sin desplazamiento.
 *
 * Solo Web Animations API; las animaciones se crean de forma sincrona y se cancelan al
 * terminar para no dejar estilos retenidos (hover, foco y transformaciones siguen libres).
 * No depende de travel.ts: si el motor no emite eventos, la pagina entra igual.
 */
import { lastTravel, onTravel } from './world';
import { NO_TRAVEL, UI_EASE_IN, UI_EASE_OUT, UI_EXIT_MS, UI_IN_MS, inFrames, outFrames, travelVector } from './ui-motion';
import type { TravelVector } from './ui-motion';

const EASE_OUT = UI_EASE_OUT;
const IN_MS = UI_IN_MS;
const BOOT_IN_MS = 520;
const OUT_MS = UI_EXIT_MS;
const STAGGER_MS = 40;
const STAGGER_MAX_MS = 480;
const BOOT_DELAY_MS = 120;
const VEIL_IN_MS = 700;
const REDUCED_MS = 200;
/** Si el ultimo 'mid' fue hace menos de esto, la entrada viene de un viaje */
const TRAVEL_WINDOW_MS = 1500;

let installed = false;
let exited = false;
let leaving: Animation[] = [];
let vec: TravelVector = NO_TRAVEL;

const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;
const pieces = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('.ct [data-ct-in]'));
const veils = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('.ct [data-ct-veil]'));

/** Orden de lectura: por filas (tolerancia 12 px) y luego de izquierda a derecha */
function readingOrder(list: HTMLElement[]): HTMLElement[] {
  const rows = list.map((el) => {
    const r = el.getBoundingClientRect();
    return { el, row: Math.round(r.top / 12), left: r.left };
  });
  rows.sort((a, b) => a.row - b.row || a.left - b.left);
  return rows.map((r) => r.el);
}

function release(a: Animation): void {
  a.finished.then(() => a.cancel()).catch(() => {});
}

function playIn(viaTravel: boolean): void {
  exited = false;
  leaving.forEach((a) => a.cancel());
  leaving = [];

  const list = pieces();
  const start = viaTravel ? 0 : BOOT_DELAY_MS;

  if (reduced()) {
    for (const el of [...veils(), ...list]) {
      release(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUCED_MS, easing: 'linear', fill: 'both' }));
    }
  } else {
    for (const el of veils()) {
      release(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: VEIL_IN_MS, easing: EASE_OUT, fill: 'both' }));
    }
    const ordered = readingOrder(list);
    const step = Math.min(STAGGER_MS, STAGGER_MAX_MS / Math.max(ordered.length, 1));
    const travelIn = viaTravel ? inFrames(vec) : null;
    ordered.forEach((el, i) => {
      const isOpt = el.hasAttribute('data-opt');
      const from = isOpt
        ? { opacity: 0, transform: 'translateY(14px) scale(0.98)' }
        : { opacity: 0, transform: 'translateY(12px)' };
      const to = { opacity: 1, transform: 'translateY(0) scale(1)' };
      const frames = travelIn ?? [from, to];
      release(el.animate(frames, { duration: travelIn ? IN_MS : BOOT_IN_MS, delay: start + i * step, easing: EASE_OUT, fill: 'both' }));
    });
  }

  // La pagina llega oculta (html[data-boot]); se muestra una vez creadas las animaciones de entrada.
  document.documentElement.removeAttribute('data-boot');
}

function playOut(): void {
  if (exited) return;
  exited = true;
  if (reduced()) {
    leaving = [...veils(), ...pieces()].map((el) =>
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: REDUCED_MS, easing: 'linear', fill: 'forwards' }),
    );
    return;
  }
  const frames = outFrames(vec);
  leaving = [
    ...veils().map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT_MS, easing: UI_EASE_IN, fill: 'forwards' })),
    ...pieces().map((el) => el.animate(frames, { duration: OUT_MS, easing: UI_EASE_IN, fill: 'forwards' })),
  ];
}

/** Instalar una sola vez (el modulo corre una vez por sesion con ClientRouter) */
export function initContactMotion(): void {
  if (installed) return;
  installed = true;

  onTravel((phase, from, to) => {
    if (phase === 'start') vec = travelVector(from, to);
    if (phase === 'start' && from === 'contacto' && document.querySelector('.ct')) playOut();
    // Viaje que no cambio de pagina (misma estacion o navegacion fallida): la interfaz regresa
    if (phase === 'end' && exited && document.querySelector('.ct')) playIn(true);
  });

  document.addEventListener('astro:page-load', () => {
    if (!document.querySelector('.ct')) return;
    // el modulo puede cargarse despues del 'mid' (primera visita por SPA): se consulta al motor
    const lt = lastTravel();
    const viaTravel = performance.now() - lt.at < TRAVEL_WINDOW_MS;
    if (viaTravel) vec = travelVector(lt.from, lt.to);
    playIn(viaTravel);
  });
}

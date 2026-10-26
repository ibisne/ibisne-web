/**
 * Cursor propio (DOM): un circulo difuminado que sigue al puntero con inercia, se vuelve
 * anillo nitido sobre lo interactivo, se contrae al hacer clic y se separa en RGB cuando
 * el mouse va rapido (coherente con el glitch del mundo).
 *
 * Solo con mouse real ((hover: hover) and (pointer: fine)) y sin prefers-reduced-motion;
 * si no, no hace nada y queda la flecha nativa. La flecha se oculta (html[data-custom-cursor="on"])
 * solo despues del primer movimiento del mouse, y vuelve en cuanto llega un toque.
 * El elemento persiste entre paginas (transition:persist en Cursor.astro); este modulo
 * corre una vez. Su rAF solo vive mientras el circulo se mueve: en reposo, costo cero.
 * Solo escribe transform y opacity (sin layout).
 */

const FINE = window.matchMedia('(hover: hover) and (pointer: fine)');
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Inercia del seguimiento: fraccion por cuadro a 60 fps (1 = pegado al puntero) */
const LERP = 0.28;
/** Separacion RGB: velocidad (px/s) desde la que aparece, a la que llega al maximo, y maximo en px */
const SPLIT_FROM = 700;
const SPLIT_FULL = 3200;
const SPLIT_PX = 5;

const INTERACTIVE = 'a[href], button, [role="button"], .card, summary, label[for], select, [data-cursor-hover]';
const DISABLED = ':disabled, [aria-disabled="true"]';
const TEXT = 'input, textarea, [contenteditable]:not([contenteditable="false"])';

const root = document.querySelector<HTMLElement>('[data-cursor]');
const pos = root?.querySelector<HTMLElement>('[data-cursor-pos]') ?? null;
const ghostM = root?.querySelector<HTMLElement>('[data-cursor-m]') ?? null;
const ghostC = root?.querySelector<HTMLElement>('[data-cursor-c]') ?? null;

let enabled = false;
let visible = false;
let raf = 0;
let last = 0;
let tx = 0;
let ty = 0;
let x = 0;
let y = 0;
let speed = 0;
let splitOn = false;
const html = document.documentElement;

function setState(el: HTMLElement, key: string, on: boolean): void {
  if (on) el.dataset[key] = '';
  else delete el.dataset[key];
}

function show(): void {
  if (!root || visible) return;
  visible = true;
  html.dataset.customCursor = 'on';
  root.dataset.visible = '';
}

function hide(): void {
  if (!root) return;
  visible = false;
  delete root.dataset.visible;
  setState(root, 'down', false);
}

function kick(): void {
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
}

function tick(now: number): void {
  raf = 0;
  if (!pos) return;
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  const k = 1 - Math.pow(1 - LERP, dt * 60);
  const dx = (tx - x) * k;
  const dy = (ty - y) * k;
  x += dx;
  y += dy;
  const v = Math.hypot(dx, dy) / dt;
  speed += (v - speed) * Math.min(1, dt * 18);
  pos.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

  const s = Math.min(1, Math.max(0, (speed - SPLIT_FROM) / (SPLIT_FULL - SPLIT_FROM)));
  if (ghostM && ghostC && (s > 0.01 || splitOn)) {
    splitOn = s > 0.01;
    const len = Math.hypot(tx - x, ty - y) || 1;
    // las copias de color quedan detras del movimiento, a los lados de la direccion
    const ox = ((tx - x) / len) * s * SPLIT_PX;
    const oy = ((ty - y) / len) * s * SPLIT_PX;
    ghostM.style.transform = `translate3d(${(-ox).toFixed(1)}px, ${(-oy).toFixed(1)}px, 0)`;
    ghostC.style.transform = `translate3d(${(ox * 0.6).toFixed(1)}px, ${(oy * 0.6).toFixed(1)}px, 0)`;
    const o = splitOn ? (s * 0.85).toFixed(2) : '0';
    ghostM.style.opacity = o;
    ghostC.style.opacity = o;
  }
  if (Math.abs(tx - x) > 0.15 || Math.abs(ty - y) > 0.15 || speed > 2 || splitOn) raf = requestAnimationFrame(tick);
  else speed = 0;
}

function hoverFrom(target: EventTarget | null): void {
  if (!root) return;
  const el = target instanceof Element ? target : null;
  const text = !!el?.closest(TEXT);
  const off = !text && !!el?.closest(DISABLED);
  const hit = !text && !off && !!el?.closest(INTERACTIVE);
  setState(root, 'hover', hit);
  setState(root, 'off', off);
  // sobre un campo de texto manda el cursor nativo (no se ocultan los dos)
  setState(root, 'text', text);
}

const onMove = (e: PointerEvent) => {
  if (e.pointerType === 'touch') {
    // tactil en un equipo hibrido: vuelve la flecha nativa hasta el proximo mouse
    hide();
    delete html.dataset.customCursor;
    return;
  }
  tx = e.clientX;
  ty = e.clientY;
  if (!visible) {
    x = tx;
    y = ty;
    speed = 0;
    show();
    hoverFrom(e.target);
  }
  kick();
};
const onOver = (e: PointerEvent) => {
  if (e.pointerType !== 'touch') hoverFrom(e.target);
};
const onDown = (e: PointerEvent) => {
  if (root && e.pointerType !== 'touch' && e.button === 0) setState(root, 'down', true);
};
const onUp = () => {
  if (root) setState(root, 'down', false);
};
const onOut = (e: MouseEvent) => {
  // el mouse salio de la ventana
  if (!e.relatedTarget) hide();
};
const onSwap = () => {
  // ClientRouter reemplaza los atributos de <html> en cada navegacion
  if (enabled && visible) html.dataset.customCursor = 'on';
  if (root) setState(root, 'hover', false);
};

function enable(): void {
  if (enabled || !root) return;
  enabled = true;
  root.dataset.on = '';
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  window.addEventListener('pointercancel', onUp, { passive: true });
  window.addEventListener('blur', hide);
  document.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('mouseout', onOut);
  document.addEventListener('astro:after-swap', onSwap);
}

function disable(): void {
  if (!enabled || !root) return;
  enabled = false;
  hide();
  delete root.dataset.on;
  delete html.dataset.customCursor;
  cancelAnimationFrame(raf);
  raf = 0;
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerdown', onDown);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onUp);
  window.removeEventListener('blur', hide);
  document.removeEventListener('pointerover', onOver);
  document.removeEventListener('mouseout', onOut);
  document.removeEventListener('astro:after-swap', onSwap);
}

function sync(): void {
  if (FINE.matches && !REDUCE.matches) enable();
  else disable();
}

if (root && pos) {
  sync();
  FINE.addEventListener('change', sync);
  REDUCE.addEventListener('change', sync);
}

export {};

/**
 * Glitch de los titulares (DOM), SOLO donde pasa el mouse o el dedo. El texto vive encima del
 * canvas, asi que el shader del mundo no lo toca: aqui se glitchea en DOM, con la misma estela e
 * intensidad que el glitch local del mundo (onGlitchFrame), y nada mas lo dispara (ni rafagas
 * globales, ni micro-glitches, ni viajes). Sin puntero en movimiento, el texto queda limpio.
 *
 * Cada `[data-glitch-text]` recibe dos capas espejo (aria-hidden, sin seleccion ni clics):
 * cian y magenta con mix-blend-mode: screen, superpuestas exactamente; fuera del glitch, en
 * opacity 0 (sin costo). Durante el glitch cada capa muestra 1-3 rebanadas delgadas recortadas
 * (clip-path: polygon) a un tramo horizontal de LOCAL_R px alrededor del cursor o de un punto de
 * su estela reciente, corridas en X (±6-18 px segun intensidad): solo las letras bajo el puntero
 * se descomponen; las demas quedan intactas. El patron cambia cada 40-60 ms.
 * Legibilidad: nunca mas de MAX_ON_MS seguidos (luego descansa REST_MS); el titular original no
 * se mueve. Reduced motion o mundo estatico: nada (el mundo no emite cuadros).
 * Imagenes (logo-titulo de las fichas): mascara con el mismo <img> (cian/magenta exactos); el
 * clon del <img> va con alt="" y aria-hidden.
 * Rects: se miden en resize, scroll y carga de pagina, nunca por cuadro.
 */
import { onGlitchFrame } from './world';
import type { GlitchFeed } from './world';

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
/** tope de glitch continuo y descanso obligado despues, ms */
const MAX_ON_MS = 240;
const REST_MS = 140;
/** salto de patron, ms (aleatorio en el rango) */
const STEP_MIN_MS = 40;
const STEP_MAX_MS = 60;
/** corrimiento de las capas de color, px CSS (minimo y maximo segun intensidad) */
const SHIFT_MIN = 6;
const SHIFT_MAX = 18;
/** radio de la zona glitcheada alrededor del cursor y de su estela, px CSS */
const LOCAL_R = 150;
/** intensidad minima para encender (debajo, apagado) */
const ON_MIN = 0.12;

interface Target {
  el: HTMLElement;
  layers: HTMLElement[];
  /** caja del titular, px CSS de la ventana (las capas la cubren) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** donde hay letras de verdad (un h1 de bloque es mas ancho que su texto) */
  hx: number;
  hy: number;
  hw: number;
  hh: number;
  on: boolean;
  onSince: number;
  restUntil: number;
  nextStep: number;
}

let targets: Target[] = [];
let dirty = true;
/** puntos de la estela en px CSS con su peso (ya por la intensidad); mismo arreglo cada cuadro */
const pts = Array.from({ length: 6 }, () => ({ x: 0, y: 0, w: 0 }));

function buildLayer(el: HTMLElement, tone: 'c' | 'm'): HTMLElement {
  const layer = document.createElement('span');
  layer.className = `tg-layer tg-layer--${tone}`;
  layer.setAttribute('aria-hidden', 'true');
  const imgs = el.querySelectorAll('img');
  if (imgs.length) {
    // titular de imagen: mascara del mismo <img>, posicionada al medir
    for (const img of imgs) {
      const m = document.createElement('span');
      m.className = 'tg-mask';
      const clone = img.cloneNode(false) as HTMLImageElement;
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('srcset');
      clone.removeAttribute('class');
      clone.className = 'tg-mask__img';
      m.append(clone);
      layer.append(m);
    }
  } else {
    for (const n of el.childNodes) {
      // solo lo visible: el texto para lectores de pantalla no se duplica
      if (n instanceof HTMLElement && n.classList.contains('sr-only')) continue;
      layer.append(n.cloneNode(true));
    }
    for (const n of layer.querySelectorAll('[id]')) n.removeAttribute('id');
  }
  return layer;
}

function scan(): void {
  for (const t of targets) for (const l of t.layers) l.remove();
  targets = [];
  if (REDUCE.matches) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-glitch-text]')) {
    // las capas se anclan al titular (absolute, inset 0)
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const layers = [buildLayer(el, 'c'), buildLayer(el, 'm')];
    el.append(...layers);
    targets.push({ el, layers, x: 0, y: 0, w: 0, h: 0, hx: 0, hy: 0, hw: 0, hh: 0, on: false, onSince: 0, restUntil: 0, nextStep: 0 });
  }
  dirty = true;
}

const range = document.createRange();

function measure(): void {
  dirty = false;
  for (const t of targets) {
    const r = t.el.getBoundingClientRect();
    t.x = r.left;
    t.y = r.top;
    t.w = r.width;
    t.h = r.height;
    // caja de las letras reales (sin las capas): union de los nodos de texto visibles o del <img>.
    // Un h1 con spans de bloque mide todo el ancho; el texto, no.
    let l = Infinity;
    let tp = Infinity;
    let rt = -Infinity;
    let bt = -Infinity;
    const add = (b: DOMRect) => {
      if (b.width <= 1 || b.height <= 1) return;
      l = Math.min(l, b.left);
      tp = Math.min(tp, b.top);
      rt = Math.max(rt, b.right);
      bt = Math.max(bt, b.bottom);
    };
    for (const k of t.el.childNodes) {
      if (k instanceof HTMLElement && (k.classList.contains('tg-layer') || k.classList.contains('sr-only'))) continue;
      if (k instanceof HTMLImageElement) {
        add(k.getBoundingClientRect());
        continue;
      }
      const tw = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
      for (let n = k.nodeType === Node.TEXT_NODE ? k : tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.textContent?.trim()) continue;
        range.selectNodeContents(n);
        add(range.getBoundingClientRect());
      }
      if (k instanceof HTMLElement) for (const im of k.querySelectorAll('img')) add(im.getBoundingClientRect());
    }
    const ok = l < rt && tp < bt;
    t.hx = ok ? l : r.left;
    t.hy = ok ? tp : r.top;
    t.hw = ok ? rt - l : r.width;
    t.hh = ok ? bt - tp : r.height;
    // mascaras de imagen: en el sitio exacto del <img> original
    const imgs = t.el.querySelectorAll<HTMLImageElement>(':scope img:not(.tg-mask__img)');
    if (!imgs.length) continue;
    for (const layer of t.layers) {
      const masks = layer.querySelectorAll<HTMLElement>('.tg-mask');
      imgs.forEach((img, i) => {
        const m = masks[i];
        if (!m) return;
        const ir = img.getBoundingClientRect();
        m.style.left = `${ir.left - r.left}px`;
        m.style.top = `${ir.top - r.top}px`;
        m.style.width = `${ir.width}px`;
        m.style.height = `${ir.height}px`;
        m.style.setProperty('--tg-src', `url("${(img.currentSrc || img.src).replace(/"/g, '%22')}")`);
      });
    }
  }
}

/** distancia de un punto a la caja de letras (0 dentro) */
function distRect(px: number, py: number, t: Target): number {
  const dx = Math.max(t.hx - px, 0, px - (t.hx + t.hw));
  const dy = Math.max(t.hy - py, 0, py - (t.hy + t.hh));
  return Math.hypot(dx, dy);
}

/** peso de cada punto de la estela sobre este titular; devuelve el maximo */
function weigh(t: Target, f: GlitchFeed, out: { x: number; y: number; w: number }[]): number {
  let m = 0;
  for (let i = 0; i < out.length; i++) {
    const p = f.trail[i];
    const o = out[i];
    o.x = p.x * f.w;
    o.y = (1 - p.y) * f.h;
    const d = distRect(o.x, o.y, t) / LOCAL_R;
    const fall = d <= 0.3 ? 1 : d >= 1 ? 0 : 1 - (d - 0.3) / 0.7;
    o.w = p.z * fall * f.mouse;
    m = Math.max(m, o.w);
  }
  return m;
}

/**
 * 1-3 rebanadas delgadas, cada una solo en un tramo horizontal alrededor de un punto de la estela
 * (sorteado por peso). Un solo polygon: cada rectangulo sale y vuelve a la esquina (0,0) por la
 * misma linea, asi los tramos no se unen.
 */
function slices(t: Target, ps: { x: number; y: number; w: number }[], total: number): string {
  const n = 1 + Math.floor(Math.random() * 3);
  const out: string[] = ['0 0'];
  const px = (v: number) => `${v.toFixed(1)}px`;
  for (let i = 0; i < n; i++) {
    let r = Math.random() * total;
    let p = ps[0];
    for (const q of ps) {
      r -= q.w;
      if (r <= 0) {
        p = q;
        break;
      }
    }
    const sh = 4 + Math.random() * 10;
    // centro vertical cerca del punto, dentro del titular
    const cy = Math.min(t.h - sh / 2, Math.max(sh / 2, p.y - t.y + (Math.random() - 0.5) * LOCAL_R * 0.7));
    const half = LOCAL_R * (0.4 + 0.5 * Math.random()) * (0.6 + 0.4 * p.w);
    const lx = p.x - t.x + (Math.random() - 0.5) * LOCAL_R * 0.3;
    const x0 = Math.max(0, lx - half);
    const x1 = Math.min(t.w, lx + half);
    if (x1 - x0 < 8) continue;
    const y0 = cy - sh / 2;
    const y1 = cy + sh / 2;
    out.push(`${px(x0)} ${px(y0)}`, `${px(x1)} ${px(y0)}`, `${px(x1)} ${px(y1)}`, `${px(x0)} ${px(y1)}`, `${px(x0)} ${px(y0)}`, '0 0');
  }
  return out.length > 1 ? `polygon(${out.join(', ')})` : 'inset(50%)';
}

function off(t: Target): void {
  if (!t.on) return;
  t.on = false;
  for (const l of t.layers) {
    l.style.opacity = '0';
    l.style.clipPath = '';
    l.style.transform = '';
  }
}

function frame(f: GlitchFeed): void {
  if (!targets.length) return;
  if (f.mouse <= 0) {
    for (const t of targets) off(t);
    return;
  }
  if (dirty) measure();
  const now = performance.now();
  for (const t of targets) {
    if (t.w === 0 || t.y > f.h || t.y + t.h < 0) {
      off(t);
      continue;
    }
    const amp = Math.min(1, weigh(t, f, pts) * 1.15);
    if (amp < ON_MIN || now < t.restUntil) {
      off(t);
      continue;
    }
    if (!t.on) {
      t.on = true;
      t.onSince = now;
      t.nextStep = 0;
      for (const l of t.layers) l.style.opacity = '1';
    } else if (now - t.onSince > MAX_ON_MS) {
      // legibilidad: nunca mas de MAX_ON_MS seguidos
      off(t);
      t.restUntil = now + REST_MS;
      continue;
    }
    if (now >= t.nextStep) {
      t.nextStep = now + STEP_MIN_MS + Math.random() * (STEP_MAX_MS - STEP_MIN_MS);
      const k = Math.min(1, amp * 1.3);
      let total = 0;
      for (const p of pts) total += p.w;
      t.layers.forEach((l, i) => {
        const dir = (i === 0 ? 1 : -1) * (Math.random() < 0.25 ? -1 : 1);
        const sh = dir * (SHIFT_MIN + (SHIFT_MAX - SHIFT_MIN) * Math.random()) * Math.max(0.45, k);
        l.style.clipPath = slices(t, pts, total);
        l.style.transform = `translate3d(${sh.toFixed(1)}px, 0, 0)`;
      });
    }
  }
}

if (!REDUCE.matches) {
  scan();
  onGlitchFrame(frame);
  document.addEventListener('astro:page-load', () => {
    scan();
    // las piezas entran animadas: volver a medir cuando se asientan
    setTimeout(() => (dirty = true), 900);
  });
  const mark = () => (dirty = true);
  window.addEventListener('resize', mark, { passive: true });
  window.addEventListener('scroll', mark, { passive: true, capture: true });
  document.fonts?.ready.then(mark);
}
REDUCE.addEventListener('change', () => {
  if (REDUCE.matches) {
    for (const t of targets) off(t);
    for (const t of targets) for (const l of t.layers) l.remove();
    targets = [];
  }
});

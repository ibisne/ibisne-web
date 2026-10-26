/**
 * Micro-glitches (solo CPU; el dibujo vive en postFrag). Rectangulos chicos de la imagen
 * (MICRO_GLITCH_W_* x MICRO_GLITCH_H_* px CSS) que desplazan en X y separan RGB solo la
 * porcion de escena que cubren, duran 80-200 ms y van rotando de lugar: cada ranura, al
 * terminar, espera una pausa aleatoria y reaparece en otra posicion. No son particulas: es
 * la imagen la que se descompone. Evitan el titular y los textos de UI (prueba de punto
 * contra el DOM al nacer). active = 0: el motor no corre el pase por ellos.
 * Sin micro-glitches con prefers-reduced-motion (y en modo estatico el motor no los pide).
 * Sin allocations por cuadro.
 */
import { Vector4 } from 'three';
import {
  MICRO_GLITCH_AMP_MAX,
  MICRO_GLITCH_AMP_MIN,
  MICRO_GLITCH_DUR_MAX_S,
  MICRO_GLITCH_DUR_MIN_S,
  MICRO_GLITCH_H_MAX_PX,
  MICRO_GLITCH_H_MIN_PX,
  MICRO_GLITCH_MOBILE_AMP_K,
  MICRO_GLITCH_MOBILE_PAUSE_K,
  MICRO_GLITCH_MOBILE_SLOTS,
  MICRO_GLITCH_PAUSE_MAX_S,
  MICRO_GLITCH_PAUSE_MIN_S,
  MICRO_GLITCH_RGB_PX,
  MICRO_GLITCH_SHIFT_PX,
  MICRO_GLITCH_SLOTS,
  MICRO_GLITCH_STEP_MS,
  MICRO_GLITCH_W_MAX_PX,
  MICRO_GLITCH_W_MIN_PX,
} from './config';

const rand = (a: number, b: number) => a + (b - a) * Math.random();

/** lo que no debe quedar detras de un micro-glitch: textos, controles, tarjetas, header */
const AVOID =
  'h1, h2, h3, h4, p, li, a, button, label, input, textarea, select, summary, figcaption, blockquote, nav, header, footer, dialog, [role="dialog"], .card, [data-world-avoid]';
/** holgura alrededor del rectangulo para la prueba contra el DOM, px CSS */
const PAD = 14;

/** Un micro-glitch visto desde fuera (px CSS, y desde arriba; amp 0 = apagado) */
export interface MicroBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly amp: number;
}

interface Slot {
  /** hora (s, reloj del motor) en que nace; mientras no nace, inactivo */
  at: number;
  /** hora en que termina */
  end: number;
  /** hora del proximo salto de patron */
  step: number;
  /** px CSS: x, y (desde arriba), ancho, alto */
  x: number;
  y: number;
  w: number;
  h: number;
  amp: number;
}

export class MicroGlitch {
  /** cuantos estan visibles este cuadro (0 = ninguno: el pase no corre por ellos) */
  active = 0;
  /** por ranura: x0, y0, x1, y1 en px del buffer (y hacia arriba). Mismo arreglo cada cuadro */
  readonly rects: Vector4[] = Array.from({ length: MICRO_GLITCH_SLOTS }, () => new Vector4());
  /** por ranura: desplazamiento px buffer, RGB px buffer, semilla, intensidad (0 = apagado) */
  readonly params: Vector4[] = Array.from({ length: MICRO_GLITCH_SLOTS }, () => new Vector4());

  private slots: Slot[] = Array.from({ length: MICRO_GLITCH_SLOTS }, () => ({ at: 0, end: 0, step: 0, x: 0, y: 0, w: 0, h: 0, amp: 0 }));
  /** los mismos objetos, de solo lectura (para el glitch de los titulares) */
  readonly boxes: readonly MicroBox[] = this.slots;
  private started = false;
  private reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor(private mobile: () => boolean) {}

  private pause(): number {
    return rand(MICRO_GLITCH_PAUSE_MIN_S, MICRO_GLITCH_PAUSE_MAX_S) * (this.mobile() ? MICRO_GLITCH_MOBILE_PAUSE_K : 1);
  }

  /** busca un lugar libre de texto/UI; false si no hay (se reintenta tras otra pausa) */
  private place(s: Slot, cw: number, ch: number): boolean {
    for (let k = 0; k < 8; k++) {
      const w = Math.round(rand(MICRO_GLITCH_W_MIN_PX, MICRO_GLITCH_W_MAX_PX));
      // alto sesgado a lo delgado (de 3 a 18 px, la mayoria de menos de 10)
      const h = Math.round(MICRO_GLITCH_H_MIN_PX + (MICRO_GLITCH_H_MAX_PX - MICRO_GLITCH_H_MIN_PX) * Math.pow(Math.random(), 1.8));
      const x = rand(cw * 0.03, cw * 0.97 - w);
      const y = rand(ch * 0.06, ch * 0.96 - h);
      if (this.clear(x, y, w, h) && !this.overlaps(s, x, y, w, h)) {
        s.x = x;
        s.y = y;
        s.w = w;
        s.h = h;
        return true;
      }
    }
    return false;
  }

  /** ningun punto del rectangulo (con holgura) cae sobre texto o UI */
  private clear(x: number, y: number, w: number, h: number): boolean {
    const ys = [y - PAD, y + h * 0.5, y + h + PAD];
    const xs = [x - PAD, x + w * 0.5, x + w + PAD];
    for (const py of ys) {
      for (const px of xs) {
        const el = document.elementFromPoint(px, py);
        if (el && el.closest(AVOID)) return false;
      }
    }
    return true;
  }

  /** no encima de otro micro-glitch vivo (se leeria como uno grande) */
  private overlaps(self: Slot, x: number, y: number, w: number, h: number): boolean {
    for (const o of this.slots) {
      if (o === self || o.amp === 0) continue;
      if (x < o.x + o.w + 30 && x + w + 30 > o.x && y < o.y + o.h + 30 && y + h + 30 > o.y) return true;
    }
    return false;
  }

  /**
   * @param time  reloj del motor (s)
   * @param cw    ancho y alto de la ventana, px CSS; dpr del buffer
   * @param busy  viaje en curso: no nacen nuevos (el viaje ya trae su glitch)
   */
  update(time: number, cw: number, ch: number, dpr: number, busy: boolean): void {
    this.active = 0;
    const n = this.mobile() ? MICRO_GLITCH_MOBILE_SLOTS : MICRO_GLITCH_SLOTS;
    if (this.reduce.matches || MICRO_GLITCH_AMP_MAX <= 0) {
      for (const p of this.params) p.w = 0;
      return;
    }
    if (!this.started) {
      this.started = true;
      // arranque escalonado: no aparecen todos juntos
      this.slots.forEach((s, i) => (s.at = time + 0.6 + i * 0.35 + this.pause()));
    }
    const kMob = this.mobile() ? MICRO_GLITCH_MOBILE_AMP_K : 1;
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i];
      const p = this.params[i];
      if (i >= n) {
        s.amp = 0;
        p.w = 0;
        continue;
      }
      // termino: pausa y nace en otro lugar
      if (s.amp > 0 && time >= s.end) {
        s.amp = 0;
        s.at = time + this.pause();
      }
      if (s.amp === 0 && time >= s.at) {
        if (!busy && this.place(s, cw, ch)) {
          s.amp = rand(MICRO_GLITCH_AMP_MIN, MICRO_GLITCH_AMP_MAX) * kMob;
          s.end = time + rand(MICRO_GLITCH_DUR_MIN_S, MICRO_GLITCH_DUR_MAX_S);
          s.step = 0;
        } else {
          s.at = time + this.pause();
        }
      }
      if (s.amp === 0) {
        p.w = 0;
        continue;
      }
      this.active++;
      // patron nuevo cada ~MICRO_GLITCH_STEP_MS: la porcion salta, como senal que se reconecta
      if (time >= s.step) {
        s.step = time + (MICRO_GLITCH_STEP_MS / 1000) * rand(0.7, 1.3);
        p.z = Math.floor(Math.random() * 997) + Math.random();
      }
      this.rects[i].set(s.x * dpr, (ch - s.y - s.h) * dpr, (s.x + s.w) * dpr, (ch - s.y) * dpr);
      p.x = MICRO_GLITCH_SHIFT_PX * dpr * s.amp;
      p.y = MICRO_GLITCH_RGB_PX * dpr * s.amp;
      p.w = s.amp;
    }
  }
}

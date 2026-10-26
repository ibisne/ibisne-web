/**
 * Estela del mouse para el glitch local (solo CPU; el dibujo vive en postFrag).
 * Guarda las posiciones del puntero con su hora, mide la velocidad y entrega al shader
 * GLITCH_TRAIL_POINTS puntos repartidos en los ultimos GLITCH_TRAIL_MS (el 0 es el cursor)
 * con su peso, mas una intensidad por velocidad que sube rapido y, al detenerse, baja en
 * linea recta hasta 0 en GLITCH_TRAIL_FADE_S (~300 ms). amp = 0 en reposo: el motor no corre el pase. Sin allocations por cuadro.
 */
import { Vector3 } from 'three';
import {
  GLITCH_TRAIL_AMP_MAX,
  GLITCH_TRAIL_ATTACK_S,
  GLITCH_TRAIL_CURVE,
  GLITCH_TRAIL_FADE_S,
  GLITCH_TRAIL_MS,
  GLITCH_TRAIL_POINTS,
  GLITCH_TRAIL_SPEED_MAX,
  GLITCH_TRAIL_SPEED_MIN,
  GLITCH_TRAIL_STEP_MS,
  GLITCH_TRAIL_TOUCH_K,
} from './config';

/** muestras guardadas (a 240 Hz cubre ~1 s, de sobra para 150 ms) */
const CAP = 256;
/** ventana para medir la velocidad, ms */
const SPEED_WIN = 40;

export class MouseTrail {
  /** 0..1 intensidad de este cuadro (0 = sin glitch del mouse) */
  amp = 0;
  /** semilla del patron (salta cada GLITCH_TRAIL_STEP_MS) */
  seed = 0;
  /** velocidad medida, px CSS/s (diagnostico) */
  speed = 0;
  /** x, y en uv de pantalla (0..1, y hacia arriba), z = peso. Mismo arreglo cada cuadro */
  readonly points: Vector3[] = Array.from({ length: GLITCH_TRAIL_POINTS }, () => new Vector3());

  private t = new Float64Array(CAP);
  private x = new Float32Array(CAP);
  private y = new Float32Array(CAP);
  private head = -1;
  private n = 0;
  private gain = 1;
  /** pico de intensidad del movimiento actual: fija la pendiente del apagado */
  private peak = 0;
  private nextSeedAt = 0;
  private reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /** Una posicion del puntero (px CSS de la ventana) con su hora (performance.now) */
  push(time: number, x: number, y: number, touch: boolean): void {
    this.head = (this.head + 1) % CAP;
    this.t[this.head] = time;
    this.x[this.head] = x;
    this.y[this.head] = y;
    this.n = Math.min(CAP, this.n + 1);
    this.gain = touch ? GLITCH_TRAIL_TOUCH_K : 1;
  }

  /** El puntero salio de la ventana: la estela no debe unir la salida con la proxima entrada */
  reset(): void {
    this.n = 0;
    this.head = -1;
  }

  /** posicion interpolada a la hora tq (dentro de la historia; fuera, el extremo) */
  private at(tq: number, out: Vector3): void {
    let i = this.head;
    for (let k = 0; k < this.n - 1; k++) {
      const j = (i - 1 + CAP) % CAP;
      if (this.t[j] <= tq) {
        const span = this.t[i] - this.t[j];
        const f = span > 0 ? Math.min(1, Math.max(0, (tq - this.t[j]) / span)) : 1;
        out.x = this.x[j] + (this.x[i] - this.x[j]) * f;
        out.y = this.y[j] + (this.y[i] - this.y[j]) * f;
        return;
      }
      i = j;
    }
    out.x = this.x[i];
    out.y = this.y[i];
  }

  /**
   * @param now  performance.now() del cuadro
   * @param dt   segundos desde el cuadro anterior
   * @param cw   ancho y alto de la ventana, px CSS
   */
  update(now: number, dt: number, cw: number, ch: number): void {
    if (this.reduce.matches || this.n === 0) {
      this.amp = 0;
      this.speed = 0;
      return;
    }
    // velocidad: recorrido de las muestras de los ultimos SPEED_WIN ms
    let dist = 0;
    let i = this.head;
    let oldest = this.t[i];
    for (let k = 0; k < this.n - 1; k++) {
      const j = (i - 1 + CAP) % CAP;
      if (now - this.t[j] > SPEED_WIN) break;
      dist += Math.hypot(this.x[i] - this.x[j], this.y[i] - this.y[j]);
      oldest = this.t[j];
      i = j;
    }
    // si la ultima muestra ya es vieja, el mouse esta quieto
    const span = Math.max(this.t[this.head] - oldest, 8);
    this.speed = now - this.t[this.head] > SPEED_WIN ? 0 : (dist / span) * 1000;

    const v = Math.min(1, Math.max(0, (this.speed - GLITCH_TRAIL_SPEED_MIN) / (GLITCH_TRAIL_SPEED_MAX - GLITCH_TRAIL_SPEED_MIN)));
    const target = Math.pow(v, GLITCH_TRAIL_CURVE) * GLITCH_TRAIL_AMP_MAX * this.gain;
    if (dt > 0) {
      if (target > this.amp) this.amp += (target - this.amp) * (1 - Math.exp(-dt / GLITCH_TRAIL_ATTACK_S));
      else this.amp = Math.max(target, this.amp - (this.peak * dt) / GLITCH_TRAIL_FADE_S);
    }
    this.peak = Math.max(this.peak, this.amp);
    if (this.amp < 0.01) this.amp = 0;
    if (this.amp === 0) {
      this.peak = 0;
      return;
    }

    if (now >= this.nextSeedAt) {
      this.nextSeedAt = now + GLITCH_TRAIL_STEP_MS * (0.7 + Math.random() * 0.6);
      this.seed = Math.floor(Math.random() * 997) + Math.random();
    }
    const last = GLITCH_TRAIL_POINTS - 1;
    for (let k = 0; k <= last; k++) {
      const p = this.points[k];
      this.at(now - (k / last) * GLITCH_TRAIL_MS, p);
      p.x = p.x / cw;
      p.y = 1 - p.y / ch;
      // el cursor pesa 1; el punto mas viejo, 0.35
      p.z = 1 - (k / last) * 0.65;
    }
  }
}

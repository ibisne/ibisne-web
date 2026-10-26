/**
 * Reloj del glitch (solo CPU; el dibujo vive en postFrag). Decide cuando hay rafaga,
 * su intensidad y la semilla del patron. Tres fuentes, se toma la mayor:
 * - rafagas esporadicas (GLITCH_EVERY_*), cada una partida en tramos de 35-70 ms con
 *   semilla nueva: el patron salta, como una senal digital que se reconecta;
 * - mouse rapido: adelanta la siguiente rafaga (el glitch del mouse en si es local: trail.ts);
 * - viaje: proporcional a la velocidad de camara, en tramos alternos (tartamudeo).
 * level = 0 entre rafagas: el motor no corre el pase y la imagen queda limpia.
 */
import {
  GLITCH_AMP_MAX,
  GLITCH_AMP_MIN,
  GLITCH_BURST_MAX_S,
  GLITCH_BURST_MIN_S,
  GLITCH_EVERY_MAX_S,
  GLITCH_EVERY_MIN_S,
  GLITCH_GAP_CHANCE,
  GLITCH_LINE_CHANCE,
  GLITCH_MOBILE_AMP_K,
  GLITCH_MOBILE_EVERY_K,
  GLITCH_MOUSE_PULL,
  GLITCH_MOUSE_SPEED,
  GLITCH_STEP_MAX_S,
  GLITCH_STEP_MIN_S,
  GLITCH_TRAVEL,
  GLITCH_TRAVEL_DUTY,
} from './config';

const rand = (a: number, b: number) => a + (b - a) * Math.random();

export class Glitch {
  /** 0..1 intensidad de este cuadro (0 = imagen limpia) */
  level = 0;
  /** semilla del patron del tramo actual */
  seed = 0;
  /** 0..1 lineas de escaneo en este tramo */
  lines = 0;
  private nextAt = 0;
  private burstEnd = 0;
  private burstAmp = 0;
  private burstLines = true;
  private segEnd = 0;
  private segAmp = 0;
  private segLines = 0;
  private travelOn = 0;
  private move = 0;
  private mouseV = 0;
  private lastTime = 0;
  private reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor(private mobile: () => boolean) {}

  /** distancia recorrida por el mouse, en anchos de pantalla */
  pointer(dist: number): void {
    this.move += dist;
  }

  /** Fuerza una rafaga ahora (depuracion; en desarrollo: __worldGL.glitch.trigger(2, 0.9)). */
  trigger(dur = GLITCH_BURST_MAX_S, amp = GLITCH_AMP_MAX, time = this.lastTime): void {
    this.startBurst(time, dur, amp, true);
  }

  private startBurst(time: number, dur: number, amp: number, lines: boolean): void {
    this.burstEnd = time + dur;
    this.burstAmp = amp * (this.mobile() ? GLITCH_MOBILE_AMP_K : 1);
    this.burstLines = lines;
    this.segEnd = 0;
  }

  private schedule(time: number): void {
    const k = this.mobile() ? GLITCH_MOBILE_EVERY_K : 1;
    this.nextAt = time + rand(GLITCH_EVERY_MIN_S, GLITCH_EVERY_MAX_S) * k;
  }

  /** @param speed velocidad de viaje 0..1 (la del pase) */
  update(time: number, dt: number, speed: number): void {
    this.lastTime = time;
    if (this.reduce.matches) {
      this.level = 0;
      this.move = 0;
      return;
    }
    if (!this.nextAt) this.schedule(time);

    // mouse: velocidad suavizada en anchos de pantalla por segundo
    if (dt > 0) {
      const v = this.move / dt;
      this.mouseV += (v - this.mouseV) * (1 - Math.pow(0.8, dt * 60));
      this.move = 0;
      if (this.mouseV > GLITCH_MOUSE_SPEED) this.nextAt -= dt * GLITCH_MOUSE_PULL;
    }

    if (time >= this.nextAt && time >= this.burstEnd) {
      this.startBurst(time, rand(GLITCH_BURST_MIN_S, GLITCH_BURST_MAX_S), rand(GLITCH_AMP_MIN, GLITCH_AMP_MAX), true);
      this.schedule(time);
    }

    const bursting = time < this.burstEnd;
    const traveling = speed > 0.02;
    if ((bursting || traveling) && time >= this.segEnd) {
      // tramo nuevo: patron nuevo
      this.segEnd = time + rand(GLITCH_STEP_MIN_S, GLITCH_STEP_MAX_S);
      this.seed = Math.floor(Math.random() * 997) + Math.random();
      this.segAmp = Math.random() < GLITCH_GAP_CHANCE ? 0 : rand(0.45, 1);
      this.segLines = this.burstLines && Math.random() < GLITCH_LINE_CHANCE ? rand(0.6, 1) : 0;
      this.travelOn = Math.random() < GLITCH_TRAVEL_DUTY ? rand(0.5, 1) : 0;
    }

    const b = bursting ? this.burstAmp * this.segAmp : 0;
    const t = traveling ? GLITCH_TRAVEL * speed * this.travelOn * (this.mobile() ? GLITCH_MOBILE_AMP_K : 1) : 0;
    this.level = Math.max(b, t);
    this.lines = bursting && b > 0 ? this.segLines : 0;
  }
}

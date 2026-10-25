/**
 * Modo estatico: sin WebGL o con prefers-reduced-motion.
 * Las capas son <img> (las mismas que sirven de textura al modo WebGL, asi no se
 * descargan dos veces). Cambiar de estacion = fundido cruzado entre dos pilas de
 * capas con distinto encuadre. Nunca hay negro: la pila vieja sigue debajo hasta
 * que la nueva termina de aparecer.
 *
 * Se anima con WAAPI (no con transition CSS) porque global.css fuerza
 * transition-duration a 0.01ms bajo reduced motion.
 */
import type { StationPose } from './config';

const FADE_MS = 420;

export class StaticWorld {
  private front: HTMLElement;
  private back: HTMLElement;
  private anim: Animation | null = null;
  private incoming: HTMLElement | null = null;

  constructor(private host: HTMLElement) {
    const first = host.querySelector<HTMLElement>('[data-world-stack]');
    if (!first) throw new Error('world: falta [data-world-stack]');
    this.front = first;
    const clone = first.cloneNode(true) as HTMLElement;
    clone.style.opacity = '0';
    first.after(clone);
    this.back = clone;
  }

  /** Aplica el encuadre de una estacion a una pila */
  private frame(stack: HTMLElement, pose: StationPose): void {
    stack.style.setProperty('--u', pose.u.toFixed(4));
    stack.style.filter = pose.dim < 0.99 ? `brightness(${pose.dim.toFixed(3)})` : '';
  }

  set(pose: StationPose): void {
    this.complete();
    this.frame(this.front, pose);
    this.front.style.opacity = '1';
    this.back.style.opacity = '0';
  }

  /** Cierra el fundido en curso de golpe (otro viaje empezo). */
  private complete(): void {
    const a = this.anim;
    if (!a || !this.incoming) return;
    this.anim = null;
    this.back = this.front;
    this.front = this.incoming;
    this.incoming = null;
    this.back.style.opacity = '0';
    a.cancel();
  }

  /** Fundido cruzado. Resuelve true al terminar, false si otro viaje lo corto. */
  fadeTo(pose: StationPose): Promise<boolean> {
    this.complete();
    const incoming = this.back;
    this.frame(incoming, pose);
    incoming.style.opacity = '1';
    // la que entra va encima
    this.host.appendChild(incoming);
    const a = incoming.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: 'ease-in-out', fill: 'both' });
    this.anim = a;
    this.incoming = incoming;
    return a.finished.then(
      () => {
        if (this.anim !== a) return false;
        this.complete();
        return true;
      },
      () => false,
    );
  }
}

export const STATIC_FADE_MS = FADE_MS;

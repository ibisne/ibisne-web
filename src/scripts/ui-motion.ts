/**
 * Fotogramas compartidos de la interfaz durante el viaje del mundo (travel.ts y
 * contact-enter.ts). La UI acompana a la camara: sale hacia donde se va el mundo y la
 * nueva entra desde el lado contrario, con un desenfoque leve que imita la velocidad.
 *
 * Direccion: +1 = el viaje va a la derecha del panorama (hacia Contacto), -1 = a la
 * izquierda (hacia Inicio), 0 = sin desplazamiento lateral (Trabajo <-> ficha, legales):
 * entonces la UI se acerca o se aleja (escala) segun el empuje en Z.
 */
import { STATIONS } from './world/config';
import type { Station } from './world/config';

export const UI_EASE_IN = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
export const UI_EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const UI_EXIT_MS = 300;
export const UI_IN_MS = 760;
export const UI_STAGGER_MS = 60;
export const UI_STAGGER_MAX_MS = 560;

const SHIFT_OUT = 64;
const SHIFT_IN = 80;
const BLUR = 'blur(6px)';

export interface TravelVector {
  /** -1, 0 o 1 en X */
  dir: number;
  /** -1 = la camara avanza (Z hacia la escena), 1 = retrocede, 0 = nada */
  dz: number;
}

export const NO_TRAVEL: TravelVector = { dir: 0, dz: 0 };

export function travelVector(from: Station, to: Station): TravelVector {
  const a = STATIONS[from];
  const b = STATIONS[to];
  if (!a || !b) return NO_TRAVEL;
  const du = b.u - a.u;
  const dzz = b.z - a.z;
  return {
    dir: Math.abs(du) > 1e-4 ? Math.sign(du) : 0,
    dz: Math.abs(dzz) > 1e-4 ? Math.sign(dzz) : 0,
  };
}

function moveOut(v: TravelVector): string {
  if (v.dir) return `translateX(${-v.dir * SHIFT_OUT}px)`;
  // avanzar: la UI pasa junto a la camara (crece); retroceder: se queda atras (encoge)
  return v.dz < 0 ? 'scale(1.06)' : 'scale(0.95)';
}

function moveIn(v: TravelVector): string {
  if (v.dir) return `translateX(${v.dir * SHIFT_IN}px)`;
  return v.dz < 0 ? 'scale(0.94)' : 'scale(1.05)';
}

export function outFrames(v: TravelVector): Keyframe[] {
  return [
    { opacity: 1, transform: 'none', filter: 'none' },
    { opacity: 0, transform: moveOut(v), filter: BLUR },
  ];
}

export function inFrames(v: TravelVector): Keyframe[] {
  return [
    { opacity: 0, transform: moveIn(v), filter: BLUR },
    { opacity: 1, transform: 'none', filter: 'none' },
  ];
}

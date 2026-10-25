/**
 * Integracion opcional con el ClientRouter de Astro: la pagina saliente pide la
 * estacion destino y el cambio de DOM espera a la fase 'mid' del viaje.
 * Llamar UNA vez (por ejemplo desde el <script> de Base.astro). Reemplaza el
 * enganche de travel.ts: no dejes los dos activos.
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { currentStation, goTo, onTravel, stationForPath } from './engine';
import type { Station, TravelPhase } from './config';

let connected = false;

/** Promesa que se resuelve en la proxima fase indicada de cualquier viaje */
export function nextPhase(phase: TravelPhase): Promise<void> {
  return new Promise((resolve) => {
    const off = onTravel((p) => {
      if (p === phase) {
        off();
        resolve();
      }
    });
  });
}

export function connectRouter(opts: { stationFor?: (url: URL) => Station } = {}): void {
  if (connected) return;
  connected = true;
  const stationFor = opts.stationFor ?? ((u: URL) => stationForPath(u.pathname));

  document.addEventListener('astro:before-preparation', (ev) => {
    const e = ev as TransitionBeforePreparationEvent;
    if (e.to.pathname === e.from.pathname) return;
    const to = stationFor(e.to);
    const original = e.loader;
    e.loader = async () => {
      const mid = nextPhase('mid');
      void goTo(to);
      await Promise.all([original(), mid]);
    };
  });

  // si la navegacion fallo o llego por otra via, la camara se alinea con el documento real
  document.addEventListener('astro:page-load', () => {
    const s = stationFor(new URL(location.href));
    if (s !== currentStation()) void goTo(s);
  });
}

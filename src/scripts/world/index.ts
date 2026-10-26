/**
 * API publica del mundo WebGL persistente. Integracion: ver ./README.md
 */
export {
  initWorld,
  goTo,
  setBMode,
  setBAnchor,
  onTravel,
  currentStation,
  lastTravel,
  stationForPath,
  getWorldStats,
  onGlitchFrame,
  destroyWorld,
  quality,
} from './engine';
export type { GlitchFeed, TravelListener, WorldStats } from './engine';
export { connectRouter, nextPhase } from './router';
export { STATIONS } from './config';
export type { Station, Quality, BMode, TravelPhase } from './config';

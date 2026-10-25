/**
 * Constantes del mundo. Todo lo que se afina a ojo vive aqui.
 *
 * Unidades: la camara base esta en el origen mirando a -Z. Las profundidades son
 * distancias a la camara base. El viaje entre estaciones NO traslada la camara:
 * mueve una posicion de panorama `p` (0..1, eje X del arte) y cada capa desplaza
 * su textura a su propia velocidad (parallax de viaje). El mouse SI mueve la
 * camara (parallax real por perspectiva).
 */

export type Station = 'home' | 'trabajo' | 'proyecto' | 'contacto' | 'legal';
export type Quality = 'high' | 'low' | 'static';
export type BMode = 'assembled' | 'dissolved' | 'hidden';
export type TravelPhase = 'start' | 'mid' | 'end';

export interface StationPose {
  /** posicion en el panorama, 0 = izquierda, 1 = derecha */
  u: number;
  /** desplazamiento de la camara en Z (negativo = hacia la ciudad) */
  z: number;
  /** brillo global de la escena (1 = normal) */
  dim: number;
  /** ganancia del parallax por mouse en esta estacion (1 = Inicio) */
  mouse: number;
}

export const STATIONS: Record<Station, StationPose> = {
  home: { u: 0.17, z: 0, dim: 1, mouse: 1 },
  trabajo: { u: 0.5, z: 0, dim: 1.0, mouse: 1.25 },
  proyecto: { u: 0.5, z: -2.0, dim: 0.95, mouse: 1.2 },
  // el apice de la piramide (u ~0.79 del arte medio) cae en el hueco entre columnas
  contacto: { u: 0.805, z: 0, dim: 0.96, mouse: 1.35 },
  legal: { u: 0.5, z: 0.15, dim: 0.62, mouse: 0.8 },
};

/* ---------- Camara ---------- */
export const FOV = 40; // vertical, grados
/** Traslacion maxima de la camara por mouse (unidades de mundo). Por lado a 1440x900:
 *  px = MOUSE_X * 1236 / profundidad (traslacion pura, antes del pivote). */
export const MOUSE_X = 0.19;
export const MOUSE_Y = 0.115;
/** Giro leve (roll) por mouse, radianes */
export const MOUSE_ROLL = 0.018;
/** La camara gira hacia la B mientras se traslada (0 = sin giro, 1 = la B queda fija).
 *  Con 0.6 la capa media casi no se mueve, la cercana va con el mouse y la lejana en contra. */
export const PIVOT = 0.6;
/** Ganancia maxima de mouse entre estaciones (dimensiona el margen de los planos) */
export const MOUSE_GAIN_MAX = 1.35;
/** Inercia del mouse: dos etapas en cascada (arranque suave), lerp por cuadro a 60 fps */
export const MOUSE_LERP = 0.1;

/* ---------- Capas ---------- */
export interface LayerSpec {
  depth: number;
  /** zoom del arte dentro del plano: mas zoom = la capa corre mas en el viaje */
  zoom: number;
  /** centro vertical del arte (0 abajo, 1 arriba); 'bottom' = pegado abajo */
  vAnchor: number | 'bottom';
  /** sobremedida del plano frente al frustum (margen para mouse y giro) */
  overscan: number;
}
export const LAYERS: Record<'far' | 'mid2' | 'mid' | 'near', LayerSpec> = {
  // overscan = holgura extra; el margen del mouse se calcula aparte (layerMargin)
  far: { depth: 32, zoom: 1.0, vAnchor: 0.5, overscan: 1.03 },
  // horizonte lejano: la misma ciudad media, mas lejos y desfasada (cuarta profundidad)
  mid2: { depth: 15, zoom: 1.15, vAnchor: 0.5, overscan: 1.03 },
  mid: { depth: 9, zoom: 1.3, vAnchor: 0.46, overscan: 1.03 },
  near: { depth: 2.6, zoom: 1.4, vAnchor: 'bottom', overscan: 1.04 },
};
/** desfase de mid2 en el panorama: muestra las torres de Trabajo como horizonte */
export const MID2_OFFSET = 0.3;
/**
 * Margen por lado (unidades de mundo) que necesita un plano a profundidad d para que el
 * mouse no muestre su borde, con la ganancia maxima: traslacion menos giro de pivote (van
 * en sentidos opuestos sobre el plano) mas lo que barre el roll en las esquinas.
 */
export function layerMargin(d: number, halfW: number, halfH: number): [number, number] {
  const mx = MOUSE_X * MOUSE_GAIN_MAX;
  const my = MOUSE_Y * MOUSE_GAIN_MAX;
  const yaw = Math.atan(mx / B_DEPTH) * PIVOT;
  const pitch = Math.atan(my / B_DEPTH) * PIVOT;
  const roll = MOUSE_ROLL * MOUSE_GAIN_MAX;
  const tx = Math.abs(d * Math.tan(yaw) - mx);
  const ty = Math.abs(d * Math.tan(pitch) - my);
  return [tx + roll * halfH + 0.02, ty + roll * halfW + 0.02];
}

/** En retrato (movil) el zoom extra se reduce a esta fraccion */
export const PORTRAIT_ZOOM_FACTOR = 0.55;

/** Aspecto objetivo del panorama completo (3 x 16:9) */
export const PANORAMA_ASPECT = 5.33;

/* ---------- Color ---------- */
// Tokens de src/styles/tokens.css (--ink, --cyan, --magenta) en 0..1.
export const INK = 0x0b0820;
export const HAZE: [number, number, number] = [0.16, 0.12, 0.42];
export const CYAN: [number, number, number] = [0.302, 0.953, 1.0];
export const MAGENTA: [number, number, number] = [1.0, 0.243, 0.647];

/* ---------- B ---------- */
export const B_DEPTH = 5.2;
export const B_PARTICLES_HIGH = 22000;
export const B_PARTICLES_LOW = 8000;
export const B_MAX_TILT = (36 * Math.PI) / 180;
/** giro de la B: dos etapas en cascada (arranque suave) */
export const B_TILT_LERP = 0.08;
export const B_ASSEMBLE_S = 1.2;
export const B_DISSOLVE_S = 0.9;
/** radio del remolino del cursor, en alturas de B */
export const B_CURSOR_RADIUS = 0.42;
/** grosor de la B (volumen), en alturas de B */
export const B_THICKNESS = 0.07;

/* ---------- Glitch (pase de post-proceso, glitch.ts + postFrag) ---------- */
// Senal digital que se reconecta: rafagas breves y esporadicas; entre rafagas, imagen limpia
// (el pase no corre). Sin glitch en modo estatico ni con prefers-reduced-motion.
/** Pausa entre rafagas, segundos (aleatoria en el rango) */
export const GLITCH_EVERY_MIN_S = 4;
export const GLITCH_EVERY_MAX_S = 9;
/** Duracion de cada rafaga, segundos */
export const GLITCH_BURST_MIN_S = 0.12;
export const GLITCH_BURST_MAX_S = 0.28;
/** Intensidad de una rafaga (0..1, aleatoria en el rango). 1 = cortes de GLITCH_SLICE_SHIFT */
export const GLITCH_AMP_MIN = 0.55;
export const GLITCH_AMP_MAX = 0.95;
/** Una rafaga salta de patron cada 35-70 ms (tramos): eso la hace "digital" y no ruido */
export const GLITCH_STEP_MIN_S = 0.035;
export const GLITCH_STEP_MAX_S = 0.07;
/** Probabilidad de que un tramo de la rafaga quede limpio (parpadeo de reconexion) */
export const GLITCH_GAP_CHANCE = 0.2;
/** Desplazamiento maximo en X de una rebanada, en anchos de pantalla (con intensidad 1) */
export const GLITCH_SLICE_SHIFT = 0.035;
/** Separacion RGB maxima, en anchos de pantalla (dentro de una rebanada; fuera, ~30 %) */
export const GLITCH_RGB = 0.007;
/** Fraccion de zonas de pantalla con macrobloques a intensidad 1 (zonas de 6x6 bloques) */
export const GLITCH_BLOCK_ZONES = 0.07;
/** Probabilidad de que un tramo traiga 1-2 lineas de escaneo cian/magenta */
export const GLITCH_LINE_CHANCE = 0.45;
/** Mouse rapido: velocidad (anchos de pantalla por segundo) desde la que reacciona */
export const GLITCH_MOUSE_SPEED = 2.2;
/** Mouse rapido: segundos que adelanta la siguiente rafaga por cada segundo de movimiento rapido */
export const GLITCH_MOUSE_PULL = 1.5;
/** Mouse rapido: micro-glitch (probabilidad por segundo, intensidad, duracion y pausa minima) */
export const GLITCH_MOUSE_RATE = 0.9;
export const GLITCH_MOUSE_AMP = 0.3;
export const GLITCH_MOUSE_DUR_S = 0.09;
export const GLITCH_MOUSE_COOLDOWN_S = 1.4;
/** Viaje: intensidad maxima (por velocidad de camara 0..1; pico a mitad del viaje) */
export const GLITCH_TRAVEL = 0.55;
/** Viaje: fraccion de tramos con glitch (el resto limpio: tartamudeo, no ruido constante) */
export const GLITCH_TRAVEL_DUTY = 0.5;
/** Movil: pausas mas largas (factor) y glitch mas suave (factor de intensidad) */
export const GLITCH_MOBILE_EVERY_K = 1.7;
export const GLITCH_MOBILE_AMP_K = 0.6;

/* ---------- Viaje ---------- */
export const TRAVEL_MIN_S = 1.6;
export const TRAVEL_MAX_S = 2.2;
/** empuje de camara hacia la escena a mitad de viaje lateral */
export const TRAVEL_PUSH = 1.0;
/** Momento del cambio de DOM (fraccion del viaje): la UI nueva llega con la camara frenando */
export const TRAVEL_MID_K = 0.66;
/**
 * Movil / modo scroll (mismo umbral que global.css): el viaje dura esta fraccion. Con el dedo
 * en la mano 1.6-2.2 s se siente lento y la UI se queda en blanco; ~1.0-1.4 s se siente directo.
 */
export const TRAVEL_MOBILE_K = 0.62;
export const MOBILE_QUERY = 'not ((min-width: 1024px) and (min-height: 700px))';
/** Mosaico por teselas en el pase de viaje (firma tipo emotion). Apagado: decidir con Eduardo */
export const POST_MOSAIC = false;

/* ---------- Calidad ---------- */
export const DPR_HIGH = 1.5;
export const DPR_MOBILE = 1.25;
export const DPR_LOW = 1.0;
export const FPS_PROBE_S = 2;
export const FPS_MIN = 45;
/** Tactil en reposo (sin viaje ni dedo encima): se pinta como mucho cada MOBILE_IDLE_FRAME_MS
 *  (~30 fps). La deriva es lenta y la B respira; a 30 fps no se nota y el telefono gasta la mitad. */
export const MOBILE_IDLE_FRAME_MS = 28;

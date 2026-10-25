/**
 * Unica fuente de los assets del mundo (se usa SOLO en el servidor, desde World.astro).
 *
 * Contrato: src/assets/world/{far,mid,near}.{webp,png,jpg,avif}
 *   far  = capa lejana, panorama ultra ancho (cielo, valle, piramides)
 *   mid  = capa media, ciudad con circuitos SOBRE NEGRO (se suma, blending aditivo)
 *   near = siluetas de primer plano SOBRE NEGRO (se suma) o con transparencia
 *
 * Mientras no existan, se usan los fondos c4 repetidos en espejo 3 veces (para
 * llegar a ~3 x 16:9) y la capa cercana se dibuja en runtime (siluetas procedurales).
 * Cuando el agente PANORAMA deje los archivos finales, no hay que tocar codigo:
 * el glob los encuentra en el siguiente build.
 */
import type { ImageMetadata } from 'astro';
import fondo from '../../assets/bg/c4-fondo.png';
import ciudad from '../../assets/bg/c4-ciudad.png';
import bTrim from '../../assets/b/b-trim.png';

export type LayerName = 'far' | 'mid' | 'near';
export type LayerBlend = 'normal' | 'add' | 'alpha';

export interface WorldLayerAsset {
  name: LayerName;
  image: ImageMetadata;
  /** veces que se repite (en espejo) el arte a lo ancho del panorama */
  repeat: number;
  blend: LayerBlend;
  placeholder: boolean;
}

const files = import.meta.glob<{ default: ImageMetadata }>('../../assets/world/*.{webp,png,jpg,jpeg,avif}', {
  eager: true,
});

function findWorld(name: LayerName): ImageMetadata | null {
  for (const [path, mod] of Object.entries(files)) {
    const base = path.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '');
    if (base === name) return mod.default;
  }
  return null;
}

/** Repeticiones del placeholder 16:9 para acercarse al aspecto del panorama final */
const PLACEHOLDER_REPEAT = 3;

function layer(name: LayerName, fallback: ImageMetadata | null, blend: LayerBlend): WorldLayerAsset | null {
  const final = findWorld(name);
  if (final) return { name, image: final, repeat: 1, blend, placeholder: false };
  if (!fallback) return null;
  return { name, image: fallback, repeat: PLACEHOLDER_REPEAT, blend, placeholder: true };
}

/** Capas en orden de pintado. `near` es null mientras no exista: el motor la dibuja. */
export const worldLayers = {
  far: layer('far', fondo, 'normal') as WorldLayerAsset,
  mid: layer('mid', ciudad, 'add'),
  // La cercana final llega "sobre negro": se suma. Si llega con alfa real, cambia a 'alpha'.
  near: layer('near', null, 'add'),
};

/** Silueta de la B (blanca con alfa), fuente del muestreo de particulas */
export const bSilhouette: ImageMetadata = bTrim;

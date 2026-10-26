/**
 * Precarga de la entrada: lo necesario para navegar sin tirones despues del loader.
 *
 *   mundo     texturas en GPU, B montada y shaders precalentados (whenWorldReady)
 *   fuentes   document.fonts.ready
 *   paginas   el HTML de Inicio / Trabajo / Contacto (las que no son la actual) y sus <img>
 *             (logos, mockups) con el mismo srcset/sizes que usaran, decodificadas
 *   audio     solo con experiencia completa (prepareAmbient; generativo = nada que bajar)
 *
 * El progreso es real (peso por tarea) y nunca retrocede. No bloquea: quien llama decide
 * cuanto espera; lo pendiente sigue cargando detras.
 */
import { whenWorldReady } from './world';
import { prepareAmbient } from './ambient';

const PAGES = ['/', '/trabajo/', '/contacto/'];
const PAGE_WEIGHT = 3;
const IMG_CONCURRENCY = 6;

export interface PreloadOpts {
  audio: boolean;
  onProgress?: (p: number) => void;
}

export function preloadSite(opts: PreloadOpts): Promise<void> {
  const total = 4 + 1 + PAGE_WEIGHT * PAGES.length + (opts.audio ? 1 : 0);
  let done = 0;
  let reported = 0;
  const add = (w: number) => {
    done += w;
    const p = Math.min(1, done / total);
    if (p > reported) {
      reported = p;
      opts.onProgress?.(p);
    }
  };
  const task = (w: number, p: Promise<unknown>) => p.then(() => add(w)).catch(() => add(w));

  const current = location.pathname;
  seedSeen();
  const tasks: Promise<unknown>[] = [
    task(4, whenWorldReady()),
    task(1, document.fonts ? document.fonts.ready : Promise.resolve()),
    ...PAGES.map((path) => (path === current ? (add(PAGE_WEIGHT), Promise.resolve()) : preloadPage(path, (w) => add(w * PAGE_WEIGHT)))),
  ];
  if (opts.audio) tasks.push(task(1, prepareAmbient()));
  return Promise.all(tasks).then(() => undefined);
}

const seen = new Set<string>();
/** Las imagenes del documento actual ya estan pedidas: no se vuelven a bajar */
function seedSeen(): void {
  for (const img of document.images) {
    const key = img.getAttribute('srcset') || img.getAttribute('src');
    if (key) seen.add(key);
  }
}

async function preloadPage(path: string, progress: (fraction: number) => void): Promise<void> {
  let html = '';
  try {
    const res = await fetch(path, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(String(res.status));
    html = await res.text();
  } catch {
    progress(1);
    return;
  }
  progress(0.2);
  // Sin DOMParser (es un sumidero de Trusted Types): solo se leen los atributos de cada <img>.
  // Lo que ya esta en este documento (capas del mundo, logo del header) no se repite: ver seedSeen.
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => attrs(m[0])).filter((a) => {
    const key = a.srcset || a.src || '';
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!imgs.length) {
    progress(0.8);
    return;
  }
  const share = 0.8 / imgs.length;
  let i = 0;
  const worker = async () => {
    while (i < imgs.length) {
      const src = imgs[i++];
      await decodeLike(src);
      progress(share);
    }
  };
  await Promise.all(Array.from({ length: Math.min(IMG_CONCURRENCY, imgs.length) }, worker));
}

type Attrs = Record<string, string | undefined>;

const ENT: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' };
function attrs(tag: string): Attrs {
  const out: Attrs = {};
  for (const m of tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const v = m[2] ?? m[3] ?? m[4] ?? '';
    out[m[1].toLowerCase()] = v.replace(/&(amp|quot|#39|lt|gt);/g, (e) => ENT[e]);
  }
  return out;
}

/** Baja y decodifica la misma variante que elegira el <img> real (mismo srcset y sizes). */
function decodeLike(a: Attrs): Promise<void> {
  const img = new Image();
  img.decoding = 'async';
  if (a.sizes) img.sizes = a.sizes;
  if (a.srcset) img.srcset = a.srcset;
  if (a.src) img.src = a.src;
  return img.decode().catch(() => undefined);
}

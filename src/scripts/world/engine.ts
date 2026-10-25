/**
 * Motor del mundo: renderer, camara, bucle, viaje entre estaciones, calidad
 * adaptativa y modo estatico. La API publica se reexporta desde ./index.ts.
 */
import { ColorManagement, LinearSRGBColorSpace, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import {
  B_DEPTH,
  B_PARTICLES_HIGH,
  B_PARTICLES_LOW,
  B_THICKNESS,
  DPR_HIGH,
  DPR_LOW,
  DPR_MOBILE,
  FOV,
  FPS_MIN,
  FPS_PROBE_S,
  INK,
  LAYERS,
  MID2_OFFSET,
  MOUSE_LERP,
  MOUSE_ROLL,
  MOUSE_X,
  MOUSE_Y,
  PIVOT,
  STATIONS,
  MOBILE_IDLE_FRAME_MS,
  MOBILE_QUERY,
  TRAVEL_MAX_S,
  TRAVEL_MID_K,
  TRAVEL_MOBILE_K,
  TRAVEL_MIN_S,
  TRAVEL_PUSH,
} from './config';
import type { BMode, Quality, Station, StationPose, TravelPhase } from './config';
import { Layer } from './layers';
import type { LayerBlend, LayerName, LayerSource } from './layers';
import { BMatrix } from './bmatrix';
import { Glitch } from './glitch';
import type { BPointer } from './bmatrix';
import { TravelPass } from './post';
import { StaticWorld, STATIC_FADE_MS } from './static';
import { glyphAtlas, loadImage, nearPlaceholder, sampleB } from './procedural';

ColorManagement.enabled = false;
const clearV = new Vector3();

export type TravelListener = (phase: TravelPhase, from: Station, to: Station) => void;

/* ======================= estado de modulo ======================= */

/** Calidad vigente. 'static' hasta que WebGL pinta su primer cuadro. */
export let quality: Quality = 'static';

const listeners = new Set<TravelListener>();
let station: Station = 'home';
const cur: StationPose = { ...STATIONS.home };
/** Posicion en el panorama de cada capa. En reposo todas valen cur.u; en el viaje la
 *  cercana se adelanta y la lejana se atrasa (desfase de profundidad). */
type DepthLane = 'near' | 'mid2' | 'far';
const lane: Record<DepthLane, number> = { near: cur.u, mid2: cur.u, far: cur.u };
const setLanes = (u: number) => {
  lane.near = lane.mid2 = lane.far = u;
};
let bWanted: BMode | null = null;
let gl: GLWorld | null = null;
let still: StaticWorld | null = null;
let rootEl: HTMLElement | null = null;
let started = false;

interface Travel {
  from: Station;
  to: Station;
  a: StationPose;
  b: StationPose;
  /** de donde sale cada capa (un viaje que corta a otro no da saltos) */
  aLane: Record<DepthLane, number>;
  t0: number;
  dur: number;
  dir: number;
  midDone: boolean;
  endDone: boolean;
  bDone: boolean;
  resolve: () => void;
  timers: number[];
}
let travel: Travel | null = null;

/* ======================= utilidades ======================= */

export function stationForPath(pathname: string): Station {
  const p = pathname.replace(/\/index\.html$/, '/');
  if (p === '/' || p === '') return 'home';
  if (/^\/trabajo\/?$/.test(p)) return 'trabajo';
  if (/^\/trabajo\/[^/]+\/?$/.test(p)) return 'proyecto';
  if (/^\/contacto\/?$/.test(p)) return 'contacto';
  return 'legal';
}

function initialStation(): Station {
  const attr = document.documentElement.dataset.worldStation;
  if (attr && attr in STATIONS) return attr as Station;
  return stationForPath(location.pathname);
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function emit(phase: TravelPhase, from: Station, to: Station): void {
  for (const cb of [...listeners]) {
    try {
      cb(phase, from, to);
    } catch (err) {
      console.error('[world] onTravel', err);
    }
  }
}

/** Ultimo cambio de DOM ('mid'): una pagina cuyo script se carga DESPUES del cambio
 *  (primera visita por SPA) no alcanzo a oir el evento; lo consulta aqui. */
let lastMid: { at: number; from: Station; to: Station } = { at: -Infinity, from: 'home', to: 'home' };
export function lastTravel(): { at: number; from: Station; to: Station } {
  return lastMid;
}

function markMid(t: Travel): void {
  if (t.midDone) return;
  t.midDone = true;
  lastMid = { at: performance.now(), from: t.from, to: t.to };
  emit('mid', t.from, t.to);
}

function markEnd(t: Travel): void {
  markMid(t);
  if (t.endDone) return;
  t.endDone = true;
  for (const id of t.timers) window.clearTimeout(id);
  Object.assign(cur, t.b);
  setLanes(t.b.u);
  if (travel === t) travel = null;
  emit('end', t.from, t.to);
  gl?.travelEnded(t);
  t.resolve();
}

/** Otro viaje empezo: el viejo nunca deja a nadie esperando 'mid'. */
function supersede(t: Travel): void {
  markMid(t);
  t.endDone = true;
  for (const id of t.timers) window.clearTimeout(id);
  t.resolve();
}

/* ======================= API publica ======================= */

export function onTravel(cb: TravelListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Estacion de destino del ultimo goTo (o la actual en reposo) */
export function currentStation(): Station {
  return station;
}

export function goTo(to: Station, opts: { instant?: boolean } = {}): Promise<void> {
  if (!(to in STATIONS)) to = 'legal';
  const from = station;
  station = to;
  if (travel) {
    // el viaje nuevo sale de donde va la camara ahora mismo
    supersede(travel);
    travel = null;
  }
  const a: StationPose = { ...cur };
  const b: StationPose = { ...STATIONS[to] };
  const du = b.u - a.u;
  const dir = du === 0 ? (to === 'home' ? -1 : 1) : Math.sign(du);
  const same = Math.abs(du) < 1e-4 && Math.abs(b.z - a.z) < 1e-4 && Math.abs(b.dim - a.dim) < 1e-4;
  // sin escena lista todavia (texturas cargando) el cambio es inmediato
  const instant = !!opts.instant || !started || same || (gl !== null && !gl.isReady);

  return new Promise<void>((resolve) => {
    const dist = Math.max(Math.abs(du) / 0.66, Math.abs(b.z - a.z) / 1.35 * 0.4, Math.abs(b.dim - a.dim) * 0.3);
    const speed = window.matchMedia(MOBILE_QUERY).matches ? TRAVEL_MOBILE_K : 1;
    const dur = gl ? (TRAVEL_MIN_S + (TRAVEL_MAX_S - TRAVEL_MIN_S) * clamp01(dist)) * 1000 * speed : STATIC_FADE_MS;
    const t: Travel = {
      from,
      to,
      a,
      b,
      aLane: { ...lane },
      t0: performance.now(),
      dur,
      dir,
      midDone: false,
      endDone: false,
      bDone: false,
      resolve,
      timers: [],
    };
    emit('start', from, to);
    gl?.travelStarted(t, instant);

    if (instant) {
      Object.assign(cur, b);
      setLanes(b.u);
      still?.set(b);
      markEnd(t);
      return;
    }
    travel = t;
    if (gl) {
      // el bucle avanza el viaje; los timers garantizan las fases si la pestana se oculta
      t.timers.push(window.setTimeout(() => markMid(t), dur * TRAVEL_MID_K + 60));
      t.timers.push(window.setTimeout(() => markEnd(t), dur + 150));
    } else if (still) {
      t.timers.push(window.setTimeout(() => markMid(t), dur / 2));
      void still.fadeTo(b).then(() => markEnd(t));
      t.timers.push(window.setTimeout(() => markEnd(t), dur + 300));
    } else {
      markEnd(t);
    }
  });
}

export function setBMode(mode: BMode): void {
  bWanted = mode;
  gl?.setB(mode);
}

/** La B se coloca sobre este elemento (centro y alto) cuando la camara esta en Inicio. */
export function setBAnchor(el: HTMLElement | null): void {
  gl?.setAnchor(el);
}

export interface WorldStats {
  quality: Quality;
  station: Station;
  ready: boolean;
  fps: number;
  /** fps (mediana) medidos al arrancar; decide la calidad */
  probeFps: number;
  dpr: number;
  particles: number;
  glyphs: number;
  /** intensidad del glitch en este cuadro (0 = imagen limpia) */
  glitch: number;
  /** desplazamiento en px CSS de cada capa con el mouse en el borde (traslacion pura) */
  parallaxPx: { far: number; mid2: number; mid: number; near: number; b: number };
  traveling: boolean;
  b: ReturnType<BMatrix['debug']> | null;
}

export function getWorldStats(): WorldStats {
  return gl
    ? gl.stats()
    : {
        quality,
        station,
        ready: false,
        fps: 0,
        probeFps: 0,
        dpr: 1,
        particles: 0,
        glyphs: 0,
        glitch: 0,
        parallaxPx: { far: 0, mid2: 0, mid: 0, near: 0, b: 0 },
        traveling: !!travel,
        b: null,
      };
}

/** Una sola vez por documento. El canvas debe estar dentro de [data-world]. */
export function initWorld(canvas: HTMLCanvasElement): void {
  if (started) return;
  started = true;
  const root = canvas.closest<HTMLElement>('[data-world]');
  if (!root) throw new Error('[world] el canvas debe vivir dentro de [data-world]');
  rootEl = root;
  station = initialStation();
  Object.assign(cur, STATIONS[station]);
  setLanes(cur.u);

  const host = root.querySelector<HTMLElement>('[data-world-static]');
  if (host) {
    still = new StaticWorld(host);
    still.set(cur);
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    toStatic();
    return;
  }
  try {
    gl = new GLWorld(canvas, root);
  } catch (err) {
    console.warn('[world] WebGL no disponible, modo estatico', err);
    gl = null;
    toStatic();
    return;
  }
  reduce.addEventListener('change', () => {
    if (reduce.matches) toStatic();
  });
  void gl.load().catch((err) => {
    console.warn('[world] no se pudo montar la escena, modo estatico', err);
    toStatic();
  });
}

/** Libera todo (pruebas o desmontaje manual). */
export function destroyWorld(): void {
  gl?.dispose();
  gl = null;
  if (rootEl) {
    delete rootEl.dataset.worldReady;
    rootEl.dataset.worldMode = 'static';
  }
  quality = 'static';
}

function toStatic(): void {
  if (gl) {
    gl.dispose();
    gl = null;
  }
  quality = 'static';
  if (rootEl) {
    delete rootEl.dataset.worldReady;
    rootEl.dataset.worldMode = 'static';
    // Respaldo definitivo (reduced-motion, sin WebGL o fallo de escena); a diferencia de
    // worldMode, que arranca en 'static' mientras carga. Las paginas lo usan para mostrar la B estatica.
    rootEl.dataset.worldFallback = '';
  }
  still?.set(cur);
}

/* ======================= mundo WebGL ======================= */

function readLayers(root: HTMLElement): { name: LayerName; img: HTMLImageElement; repeat: number; blend: LayerBlend }[] {
  const stack = root.querySelector('[data-world-stack]');
  if (!stack) return [];
  return [...stack.querySelectorAll<HTMLImageElement>('img[data-world-layer]')].map((img) => ({
    name: img.dataset.worldLayer as LayerName,
    img,
    repeat: Number(img.dataset.repeat ?? '1') || 1,
    blend: (img.dataset.blend as LayerBlend) ?? 'add',
  }));
}

class GLWorld {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private layers: Partial<Record<LayerName, Layer>> = {};
  private b: BMatrix | null = null;
  private pass = new TravelPass();
  private glitch: Glitch;
  private mobileMq = window.matchMedia(MOBILE_QUERY);
  private lastCX = -1;
  private lastCY = -1;
  private tanHalf = Math.tan(((FOV / 2) * Math.PI) / 180);

  private raf = 0;
  private last = 0;
  private time = 0;
  private running = false;
  private ready = false;
  private disposed = false;

  private cw = 1;
  private ch = 1;
  private dpr = 1;
  private dprCap: number;
  private coarse: boolean;
  private res = new Vector2(1, 1);
  private glow = new Vector2(0.5, 0.5);

  // puntero
  private px = 0;
  private py = 0;
  private sx = 0;
  private sy = 0;
  private sx2 = 0;
  private sy2 = 0;
  private mouse = false;
  private mouseIn = false;
  private touchUntil = 0;
  private bptr: BPointer = { x: 0, y: 0, active: false };

  // B
  private anchorEl: HTMLElement | null = null;
  private anchorDirty = true;
  private anchor = { cx: 0, cy: 0, h: 0, set: false };
  private ro: ResizeObserver;
  private anchorRo: ResizeObserver | null = null;
  private lastDir = 1;

  // viaje
  private lastP = cur.u;
  private lastZ = cur.z;
  private postS = 0;
  private postZ = 0;

  // fps
  private probeStart = 0;
  private probeDts: number[] = [];
  private probeArmed = false;
  private probeFps = 0;
  private probed = false;
  private fpsWin: number[] = [];
  private fpsNow = 0;

  private off: (() => void)[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private root: HTMLElement,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.renderer.setClearColor(INK, 1);
    this.coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const startLow = this.coarse || mem <= 4;
    quality = 'static'; // hasta el primer cuadro
    this.initialQuality = startLow ? 'low' : 'high';
    this.dprCap = this.coarse ? DPR_MOBILE : DPR_HIGH;
    this.camera = new PerspectiveCamera(FOV, 1, 0.05, 100);
    this.glitch = new Glitch(() => this.coarse || this.mobileMq.matches);

    // solo en desarrollo: acceso desde la consola para depurar capas
    if (import.meta.env.DEV) (window as unknown as { __worldGL?: unknown }).__worldGL = this;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.listen();
    this.resize();
  }
  private initialQuality: 'high' | 'low';

  get isReady(): boolean {
    return this.ready;
  }

  /* ---------- carga ---------- */

  async load(): Promise<void> {
    const max = this.renderer.capabilities.maxTextureSize;
    const found = readLayers(this.root);
    const decoded = await Promise.all(
      found.map(async (l) => {
        try {
          // El <img> lleva srcset/sizes: su naturalWidth viene corregido por densidad y no
          // coincide con los pixeles reales (three reservaria mal la textura). Se carga una
          // copia sin srcset con la URL ya elegida: sale de la cache HTTP, sin red.
          if (!(l.img.complete && l.img.naturalWidth)) {
            await new Promise((r) => {
              l.img.addEventListener('load', r, { once: true });
              l.img.addEventListener('error', r, { once: true });
            });
          }
          const img = await loadImage(l.img.currentSrc || l.img.src);
          return { ...l, img };
        } catch {
          return null;
        }
      }),
    );
    if (this.disposed) return;
    const ok = decoded.filter((l): l is NonNullable<typeof l> => !!l);
    if (!ok.some((l) => l.name === 'far')) throw new Error('falta la capa lejana');
    const sources: LayerSource[] = ok.map((l) => ({ name: l.name, image: l.img, repeat: l.repeat, blend: l.blend }));
    if (!sources.some((s) => s.name === 'near')) {
      sources.push({ name: 'near', image: nearPlaceholder(), repeat: 1, blend: 'alpha' });
    }
    for (const s of sources) {
      const layer = new Layer(s, max);
      this.layers[s.name] = layer;
      this.scene.add(layer.mesh);
    }
    // cuarta profundidad: la ciudad media otra vez, lejos y desfasada (misma textura, sin costo de red)
    const mid = this.layers.mid;
    const midSrc = sources.find((s) => s.name === 'mid');
    if (mid && midSrc) {
      const layer = new Layer({ ...midSrc, name: 'mid2', shared: mid.texture, offset: MID2_OFFSET }, max);
      this.layers.mid2 = layer;
      this.scene.add(layer.mesh);
    }
    this.resize();
    this.applyQuality(this.initialQuality);
    // primer cuadro sincronico (sube texturas), luego se revela
    this.last = performance.now();
    this.renderFrame(0);
    this.ready = true;
    quality = this.initialQuality;
    this.root.dataset.worldMode = 'gl';
    this.root.dataset.worldReady = '';
    this.start();
    this.probeStart = 0;
    void this.loadB();
  }

  private async loadB(): Promise<void> {
    const src = this.canvas.dataset.bSrc;
    if (!src) {
      this.probeArmed = true;
      return;
    }
    try {
      const [img, atlas] = await Promise.all([loadImage(src), glyphAtlas()]);
      if (this.disposed) return;
      const count = quality === 'low' ? B_PARTICLES_LOW : B_PARTICLES_HIGH;
      const sample = sampleB(img, count, B_THICKNESS);
      this.b = new BMatrix(sample, atlas, count);
      this.scene.add(this.b.group);
      this.findAnchor();
      const mode = bWanted ?? (station === 'home' && !travel ? 'assembled' : 'hidden');
      this.b.setMode(mode, this.lastDir);
    } catch (err) {
      console.warn('[world] la B no se pudo montar', err);
    }
    this.probeArmed = true;
  }

  /* ---------- calidad ---------- */

  private applyQuality(q: 'high' | 'low'): void {
    const native = window.devicePixelRatio || 1;
    this.dpr = Math.min(native, q === 'low' ? Math.min(this.dprCap, this.coarse ? DPR_MOBILE : DPR_LOW) : this.dprCap);
    this.b?.setCount(q === 'low' ? B_PARTICLES_LOW : B_PARTICLES_HIGH);
    this.pass.taps = q === 'low' ? 4 : 7;
    if (this.ready) quality = q;
    this.resize();
  }

  /**
   * Mide los primeros FPS_PROBE_S segundos (tras armar la B y un calentamiento) con
   * la MEDIANA del tiempo por cuadro: los tirones de subida de texturas o de
   * compilacion no cuentan, una GPU lenta si.
   */
  private probe(now: number, dt: number): void {
    if (this.probed || document.hidden || !this.probeArmed) return;
    if (!this.probeStart) {
      this.probeStart = now + 700;
      this.probeDts = [];
      return;
    }
    if (now < this.probeStart) return;
    this.probeDts.push(dt);
    if ((now - this.probeStart) / 1000 >= FPS_PROBE_S) {
      this.probed = true;
      const sorted = [...this.probeDts].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] || 1 / 60;
      const fps = 1 / median;
      this.probeFps = fps;
      if (fps < FPS_MIN && quality === 'high') {
        console.info(`[world] ${fps.toFixed(0)} fps: calidad baja`);
        this.applyQuality('low');
      }
    }
  }

  /* ---------- tamano ---------- */

  private resize(): void {
    if (this.disposed) return;
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.cw = w;
    this.ch = h;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const l of Object.values(this.layers)) l?.resize(this.tanHalf, w / h);
    const bw = Math.floor(w * this.dpr);
    const bh = Math.floor(h * this.dpr);
    this.res.set(bw, bh);
    this.pass.setSize(bw, bh);
    this.anchorDirty = true;
    // setSize vacia el canvas y ResizeObserver corre antes de pintar: sin este cuadro inmediato
    // (rotar el telefono, cambiar de tamano) se veria un destello vacio hasta el siguiente rAF.
    if (this.ready) this.renderFrame(0);
  }

  /* ---------- puntero ---------- */

  private listen(): void {
    const on = <K extends keyof WindowEventMap>(t: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      window.addEventListener(t, fn, o);
      this.off.push(() => window.removeEventListener(t, fn, o));
    };
    const setXY = (e: PointerEvent) => {
      this.px = (e.clientX / this.cw) * 2 - 1;
      this.py = -((e.clientY / this.ch) * 2 - 1);
    };
    on(
      'pointermove',
      (e) => {
        setXY(e);
        if (e.pointerType === 'touch') this.touchUntil = performance.now() + 1200;
        else {
          this.mouse = true;
          this.mouseIn = true;
          // recorrido del mouse para el glitch reactivo (anchos de pantalla)
          if (this.lastCX >= 0) this.glitch.pointer(Math.hypot(e.clientX - this.lastCX, e.clientY - this.lastCY) / this.cw);
          this.lastCX = e.clientX;
          this.lastCY = e.clientY;
        }
      },
      { passive: true },
    );
    on(
      'pointerdown',
      (e) => {
        setXY(e);
        if (e.pointerType === 'touch') this.touchUntil = performance.now() + 1200;
      },
      { passive: true },
    );
    on('pointerup', (e) => {
      if (e.pointerType === 'touch') this.touchUntil = performance.now() + 700;
    });
    on('blur', () => {
      this.mouseIn = false;
    });
    on('scroll', () => (this.anchorDirty = true), { passive: true });
    on('resize', () => (this.anchorDirty = true), { passive: true });
    const leave = (e: MouseEvent) => {
      if (!e.relatedTarget) this.mouseIn = false;
    };
    document.addEventListener('mouseout', leave);
    this.off.push(() => document.removeEventListener('mouseout', leave));

    const vis = () => {
      if (document.hidden) this.stop();
      else if (this.ready) this.start();
    };
    document.addEventListener('visibilitychange', vis);
    this.off.push(() => document.removeEventListener('visibilitychange', vis));

    const pageLoad = () => {
      this.findAnchor();
      window.setTimeout(() => (this.anchorDirty = true), 900);
    };
    document.addEventListener('astro:page-load', pageLoad);
    this.off.push(() => document.removeEventListener('astro:page-load', pageLoad));

    const lost = (e: Event) => {
      e.preventDefault();
      console.warn('[world] contexto WebGL perdido, modo estatico');
      toStatic();
    };
    this.canvas.addEventListener('webglcontextlost', lost);
    this.off.push(() => this.canvas.removeEventListener('webglcontextlost', lost));
  }

  /* ---------- B ---------- */

  setB(mode: BMode): void {
    this.b?.setMode(mode, this.lastDir);
  }

  setAnchor(el: HTMLElement | null): void {
    this.anchorRo?.disconnect();
    this.anchorRo = null;
    this.anchorEl = el;
    if (el) {
      this.anchorRo = new ResizeObserver(() => (this.anchorDirty = true));
      this.anchorRo.observe(el);
    }
    this.anchorDirty = true;
  }

  private findAnchor(): void {
    const el = document.querySelector<HTMLElement>('[data-world-b]');
    if (el && el !== this.anchorEl) this.setAnchor(el);
    else if (!el && this.anchorEl && !this.anchorEl.isConnected) this.setAnchor(null);
    this.anchorDirty = true;
  }

  private measureAnchor(): void {
    this.anchorDirty = false;
    const el = this.anchorEl;
    if (el?.isConnected) {
      const r = el.getBoundingClientRect();
      if (r.height > 4) {
        // nunca mas ancha que el 80 % de la pantalla (al girar 36 grados no se corta)
        const maxH = (this.cw * 0.8) / (this.b?.aspect ?? 0.95);
        this.anchor = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: Math.min(r.height, maxH), set: true };
        return;
      }
    }
    if (this.anchor.set && !el) return; // conservar la ultima posicion conocida
    const vh = window.innerHeight;
    const vw = this.cw;
    this.anchor =
      vw < vh
        ? { cx: vw / 2, cy: vh * 0.36, h: Math.min(vh * 0.32, vw * 0.72), set: false }
        : { cx: vw / 2, cy: vh * 0.46, h: Math.min(vh * 0.46, 440), set: false };
  }

  /** pantallas por unidad de panorama a una profundidad, interpolado entre capas */
  private lambdaAt(d: number): number {
    const f = this.layers.far?.lambda ?? 3;
    const m = this.layers.mid?.lambda ?? f * 1.3;
    const n = this.layers.near?.lambda ?? m * 1.4;
    const k = 1 / d;
    const kf = 1 / LAYERS.far.depth;
    const km = 1 / LAYERS.mid.depth;
    const kn = 1 / LAYERS.near.depth;
    if (k <= km) return f + (m - f) * clamp01((k - kf) / (km - kf));
    return m + (n - m) * Math.min(1.5, Math.max(0, (k - km) / (kn - km)));
  }

  /* ---------- viaje ---------- */

  travelStarted(t: Travel, instant: boolean): void {
    this.lastDir = t.dir;
    const b = this.b;
    if (t.to !== 'home') {
      if (b && b.mode === 'assembled') {
        if (instant) b.setMode('hidden');
        else b.setMode('dissolved', t.dir);
      }
    } else if (b && (instant || t.from === 'home')) {
      t.bDone = true;
      b.setMode('assembled', -t.dir);
    }
  }

  travelEnded(t: Travel): void {
    if (t.to === 'home' && !t.bDone && this.b) {
      t.bDone = true;
      this.b.setMode('assembled', -t.dir);
    }
    this.anchorDirty = true;
  }

  private stepTravel(now: number): void {
    const t = travel;
    if (!t) return;
    const k = clamp01((now - t.t0) / t.dur);
    // salida rapida y aterrizaje largo (pico de velocidad hacia k ~0.44)
    const kk = Math.pow(k, 0.85);
    const e = easeInOutCubic(kk);
    const bu = t.b.u;
    cur.u = t.a.u + (bu - t.a.u) * e;
    cur.z = t.a.z + (t.b.z - t.a.z) * e;
    cur.dim = t.a.dim + (t.b.dim - t.a.dim) * e;
    cur.mouse = t.a.mouse + (t.b.mouse - t.a.mouse) * e;
    // desfase de profundidad: alineadas en k = 0 y k = 1, separadas en medio
    lane.near = t.aLane.near + (bu - t.aLane.near) * easeInOutCubic(clamp01(kk * 1.22));
    lane.mid2 = t.aLane.mid2 + (bu - t.aLane.mid2) * easeInOutCubic(clamp01((kk - 0.09) / 0.91));
    lane.far = t.aLane.far + (bu - t.aLane.far) * easeInOutCubic(clamp01((kk - 0.18) / 0.82));
    if (k >= TRAVEL_MID_K) markMid(t);
    if (t.to === 'home' && !t.bDone && k >= 0.55 && this.b) {
      t.bDone = true;
      this.b.setMode('assembled', -t.dir);
    }
    if (k >= 1) markEnd(t);
  }

  /** empuje en Z a mitad de un viaje lateral */
  private breath(now: number): number {
    const t = travel;
    if (!t) return 0;
    const k = clamp01((now - t.t0) / t.dur);
    return -TRAVEL_PUSH * Math.sin(Math.PI * k) * Math.min(1, Math.abs(t.b.u - t.a.u) / 0.2);
  }

  /* ---------- bucle ---------- */

  private start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    // tactil en reposo: ~30 fps (el telefono no se calienta). Viaje y dedo encima, a pleno ritmo.
    if (
      this.coarse &&
      !travel &&
      now >= this.touchUntil &&
      this.postS < 0.004 &&
      this.glitch.level < 0.001 &&
      now - this.last < MOBILE_IDLE_FRAME_MS
    )
      return;
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    this.stepTravel(now);
    this.renderFrame(dt, now);
    if (dt > 0) this.probe(now, dt);
    this.fpsWin.push(now);
    while (this.fpsWin.length && now - this.fpsWin[0] > 1000) this.fpsWin.shift();
    this.fpsNow = this.fpsWin.length;
  };

  private renderFrame(dt: number, now = performance.now()): void {
    const time = this.time;
    const kM = 1 - Math.pow(1 - MOUSE_LERP, dt * 60);

    // objetivo de camara: mouse real, o deriva automatica en tactil
    let tx = 0;
    let ty = 0;
    const driftX = Math.sin(time * 0.19) * 0.5 + Math.sin(time * 0.071 + 2) * 0.22;
    const driftY = Math.sin(time * 0.13 + 1.3) * 0.38;
    if (this.mouse) {
      if (this.mouseIn) {
        tx = this.px;
        ty = this.py;
      }
    } else {
      tx = driftX;
      ty = driftY;
    }
    // dos etapas en cascada: velocidad inicial cero, asentamiento ~0.75 s
    this.sx += (tx - this.sx) * kM;
    this.sy += (ty - this.sy) * kM;
    this.sx2 += (this.sx - this.sx2) * kM;
    this.sy2 += (this.sy - this.sy2) * kM;

    const touching = now < this.touchUntil;
    if (this.mouse) {
      this.bptr.x = this.px;
      this.bptr.y = this.py;
      this.bptr.active = this.mouseIn;
    } else {
      this.bptr.x = touching ? this.px : driftX * 0.6;
      this.bptr.y = touching ? this.py : driftY * 0.6;
      this.bptr.active = touching;
    }
    const gTarget = this.mouse ? (this.mouseIn ? [this.px, this.py] : [0, -0.1]) : touching ? [this.px, this.py] : [driftX, driftY];
    const kG = 1 - Math.pow(0.9, dt * 60);
    this.glow.x += (gTarget[0] * 0.5 + 0.5 - this.glow.x) * kG;
    this.glow.y += (gTarget[1] * 0.5 + 0.5 - this.glow.y) * kG;

    const cam = this.camera;
    const gain = this.mouseGain();
    const camX = this.sx2 * MOUSE_X * gain;
    const camY = this.sy2 * MOUSE_Y * gain;
    const camZ = cur.z + this.breath(now);
    cam.position.set(camX, camY, camZ);
    // pivote sobre la B: la camara gira hacia ella mientras se traslada
    cam.rotation.set(-Math.atan(camY / B_DEPTH) * PIVOT, Math.atan(camX / B_DEPTH) * PIVOT, -this.sx2 * MOUSE_ROLL * gain);
    cam.updateMatrixWorld();

    // velocidad del viaje -> intensidad del pase
    const lamMid = this.layers.mid?.lambda ?? 4;
    const vp = dt > 0 ? (Math.abs(cur.u - this.lastP) / dt) * lamMid : 0;
    const vz = dt > 0 ? Math.abs(cur.z - this.lastZ) / dt : 0;
    this.lastP = cur.u;
    this.lastZ = cur.z;
    const kP = 1 - Math.pow(0.75, dt * 60);
    this.postS += (clamp01(vp / 2.6) - this.postS) * kP;
    this.postZ += (clamp01(vz / 1.6) - this.postZ) * kP;
    if (!travel && dt > 0) {
      this.postS *= 0.8;
      this.postZ *= 0.8;
    }

    // capas
    const camDist = LAYERS.near.depth + camZ;
    const nearAlpha = clamp01((camDist - 0.7) / 1.0);
    for (const l of Object.values(this.layers)) {
      if (!l) continue;
      const u = l.name === 'mid' ? cur.u : lane[l.name];
      l.update(u, cur.dim, time, this.glow, this.res, l.name === 'near' ? nearAlpha : 1);
    }

    // glitch: rafagas esporadicas, mouse rapido y viaje (velocidad del pase)
    this.glitch.update(time, dt, this.postS);

    // B
    if (this.b) {
      if (this.anchorDirty) this.measureAnchor();
      const a = this.anchor;
      const fh = 2 * B_DEPTH * this.tanHalf;
      const fw = fh * (this.cw / this.ch);
      const x = (a.cx / this.cw - 0.5) * fw - (cur.u - STATIONS.home.u) * this.lambdaAt(B_DEPTH) * fw;
      const y = -(a.cy / this.ch - 0.5) * fh;
      const h = (a.h / this.ch) * fh;
      this.b.update(dt, time, cam, this.bptr, { x, y, z: -B_DEPTH, h }, a.h, this.dpr);
      // la capa cercana (y un poco la media) se apartan de la B: el primer plano no la tapa
      const pres = this.b.presence;
      clearV.set(x, y, -B_DEPTH).project(cam);
      const r = (a.h / this.ch) * 0.62;
      this.layers.near?.setClear(clearV.x * 0.5 + 0.5, clearV.y * 0.5 + 0.5, r, 0.85 * pres);
      this.layers.mid?.setClear(clearV.x * 0.5 + 0.5, clearV.y * 0.5 + 0.5, r * 1.15, 0.4 * pres);
      this.layers.mid2?.setClear(clearV.x * 0.5 + 0.5, clearV.y * 0.5 + 0.5, r * 1.2, 0.5 * pres);
    }

    // pintar
    if (this.postS > 0.004 || this.postZ > 0.004 || this.glitch.level > 0.001) {
      this.pass.render(this.renderer, this.scene, cam, this.postS, this.postZ, -this.lastDir, this.glitch);
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, cam);
    }
  }

  /* ---------- diagnostico ---------- */

  /** Ganancia de mouse: la de la estacion, y en pantallas angostas proporcional al aspecto
   *  (el FOV vertical es fijo, asi que el mismo desplazamiento pesa mas sobre un ancho chico). */
  private mouseGain(): number {
    const aspect = this.cw / this.ch;
    return cur.mouse * Math.min(1, Math.max(0.5, aspect / 1.6));
  }

  stats(): WorldStats {
    // desplazamiento (px CSS, con signo) de un plano a profundidad d con el mouse en el borde derecho:
    // traslacion menos el giro de pivote. Positivo = se mueve contra el cursor (parallax de
    // primer plano); negativo = acompana al cursor (fondo, por el pivote).
    const gain = this.mouseGain();
    const camX = MOUSE_X * gain;
    const yaw = Math.atan(camX / B_DEPTH) * PIVOT;
    const px = (d: number) => ((camX / d - Math.tan(yaw)) / (2 * this.tanHalf * (this.cw / this.ch))) * this.cw;
    return {
      quality,
      station,
      ready: this.ready,
      fps: this.fpsNow,
      probeFps: Math.round(this.probeFps),
      dpr: this.dpr,
      particles: this.b?.particleCount ?? 0,
      glyphs: this.b?.glyphCount ?? 0,
      glitch: this.glitch.level,
      parallaxPx: {
        far: px(LAYERS.far.depth),
        mid2: px(LAYERS.mid2.depth),
        mid: px(LAYERS.mid.depth),
        near: px(LAYERS.near.depth),
        b: px(B_DEPTH),
      },
      traveling: !!travel,
      b: this.b?.debug() ?? null,
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.ro.disconnect();
    this.anchorRo?.disconnect();
    for (const f of this.off) f();
    for (const l of Object.values(this.layers)) l?.dispose();
    this.b?.dispose();
    this.pass.dispose();
    this.renderer.dispose();
  }
}

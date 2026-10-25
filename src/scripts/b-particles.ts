/**
 * B de particulas (canvas 2D).
 *
 * Muestrea la silueta de la B desde una imagen con alfa, la rearma con
 * ~2200 particulas que van a su sitio con un resorte, se apartan del cursor
 * (~90px) y vuelven. Unos pocos glifos tipo matrix caen dentro de la silueta.
 *
 * Rendimiento: arreglos tipados reservados una sola vez, particulas agrupadas
 * por color (un fillStyle por grupo), cero allocations por cuadro, DPR <= 2,
 * pausa con document.hidden y fuera de viewport.
 *
 * Eventos (en window): 'b:dissolve' (explota hacia afuera 300ms) y 'b:assemble'.
 * Modo estatico (B dibujada una vez + brillo CSS) cuando: prefers-reduced-motion,
 * o la pantalla es menor a 1024x700 (layout con scroll).
 */

const MAX_PARTICLES = 2200;
const EDGE_SHARE = 0.32; // proporcion de particulas sobre el contorno
const GRID_W = 220; // resolucion del muestreo (px de rejilla)
const PAD = 0.18; // margen del canvas alrededor de la B (fraccion)
const CURSOR_R = 90; // px CSS
const DISSOLVE_MS = 300;
const GLYPHS = ['B', '0', '1', '2', '4', '7', '8', '9', 'B', 'I', 'S', 'N', 'E', '<', '>', '+', '/', '=', 'B'];
const BUCKETS = 4;
// [r,g,b] por grupo: blanco, cian, magenta, blanco frio
const COLORS = ['rgb(255,255,255)', 'rgb(77,243,255)', 'rgb(255,92,178)', 'rgb(200,238,255)'];
const BUCKET_ALPHA = [1, 0.95, 0.85, 0.9];
const BUCKET_SIZE = [2.5, 2.7, 2.7, 1.9];
const STREAMS = 14;
const TRAIL = 6;

const lockMq = window.matchMedia('(min-width: 1024px) and (min-height: 700px)');
const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');

interface Sample {
  n: number;
  nx: Float32Array;
  ny: Float32Array;
  col: Uint8Array;
  gw: number;
  gh: number;
  mask: Uint8Array; // 1 = dentro de la silueta
}

const sampleCache = new Map<string, Promise<Sample>>();

function loadSample(src: string): Promise<Sample> {
  let p = sampleCache.get(src);
  if (!p) {
    p = buildSample(src);
    sampleCache.set(src, p);
  }
  return p;
}

async function buildSample(src: string): Promise<Sample> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  const gw = GRID_W;
  const gh = Math.round(GRID_W * (img.naturalHeight / img.naturalWidth));
  const off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  const c = off.getContext('2d', { willReadFrequently: true });
  if (!c) throw new Error('canvas 2d no disponible');
  c.drawImage(img, 0, 0, gw, gh);
  const data = c.getImageData(0, 0, gw, gh).data;

  const mask = new Uint8Array(gw * gh);
  const inside: number[] = [];
  const edge: number[] = [];
  for (let i = 0; i < gw * gh; i++) mask[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = y * gw + x;
      if (!mask[i]) continue;
      const isEdge = x === 0 || y === 0 || x === gw - 1 || y === gh - 1 || !mask[i - 1] || !mask[i + 1] || !mask[i - gw] || !mask[i + gw];
      (isEdge ? edge : inside).push(i);
    }
  }

  const nEdge = Math.round(MAX_PARTICLES * EDGE_SHARE);
  const nIn = MAX_PARTICLES - nEdge;
  const pts: number[] = []; // [gx, gy] planos
  darts(edge, nEdge, 2.1, gw, gh, pts);
  darts(inside, nIn, 3.4, gw, gh, pts);

  // Mezcla para que cortar por intensidad conserve la proporcion borde/interior.
  const total = pts.length / 2;
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = order[i];
    order[i] = order[j];
    order[j] = t;
  }
  const nx = new Float32Array(total);
  const ny = new Float32Array(total);
  const col = new Uint8Array(total);
  for (let k = 0; k < total; k++) {
    const o = order[k];
    nx[k] = pts[o * 2] / gw;
    ny[k] = pts[o * 2 + 1] / gh;
    const r = Math.random();
    col[k] = r < 0.5 ? 0 : r < 0.76 ? 1 : r < 0.9 ? 2 : 3;
  }
  return { n: total, nx, ny, col, gw, gh, mask };
}

/** Muestreo por dardos con distancia minima (tipo ruido azul), en coordenadas de rejilla. */
function darts(cands: number[], want: number, minDist: number, gw: number, gh: number, out: number[]): void {
  for (let i = cands.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = cands[i];
    cands[i] = cands[j];
    cands[j] = t;
  }
  const cell = minDist / Math.SQRT2;
  const cw = Math.ceil(gw / cell) + 1;
  const ch = Math.ceil(gh / cell) + 1;
  const hash = new Int32Array(cw * ch).fill(-1);
  const px: number[] = [];
  const py: number[] = [];
  const d2 = minDist * minDist;
  for (let a = 0; a < cands.length && px.length < want; a++) {
    const idx = cands[a];
    const x = (idx % gw) + Math.random();
    const y = ((idx / gw) | 0) + Math.random();
    const cx = (x / cell) | 0;
    const cy = (y / cell) | 0;
    let ok = true;
    for (let yy = Math.max(0, cy - 2); yy <= Math.min(ch - 1, cy + 2) && ok; yy++) {
      for (let xx = Math.max(0, cx - 2); xx <= Math.min(cw - 1, cx + 2); xx++) {
        const q = hash[yy * cw + xx];
        if (q >= 0) {
          const dx = px[q] - x;
          const dy = py[q] - y;
          if (dx * dx + dy * dy < d2) {
            ok = false;
            break;
          }
        }
      }
    }
    if (!ok) continue;
    hash[cy * cw + cx] = px.length;
    px.push(x);
    py.push(y);
  }
  for (let i = 0; i < px.length; i++) out.push(px[i], py[i]);
}

type State = 'on' | 'dissolving' | 'gone';

class BParticles {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly interactive: boolean;
  private readonly intensity: number;

  private sample: Sample | null = null;
  private n = 0;
  private nx = new Float32Array(0);
  private ny = new Float32Array(0);
  private px = new Float32Array(0);
  private py = new Float32Array(0);
  private vx = new Float32Array(0);
  private vy = new Float32Array(0);
  private ph = new Float32Array(0);
  private wake = new Float32Array(0); // segundos hasta que la particula se libera
  private bucketEnd = new Int32Array(BUCKETS);

  // geometria en px CSS
  private cw = 0;
  private ch = 0;
  private bw = 0;
  private bh = 0;
  private ox = 0;
  private oy = 0;
  private sc = 1;
  private gs = 11;
  private font = '';

  // glifos
  private gx = new Float32Array(STREAMS);
  private gy = new Float32Array(STREAMS);
  private gv = new Float32Array(STREAMS);
  private gc = new Uint8Array(STREAMS * TRAIL);

  private state: State = 'on';
  private stateT = 0; // segundos desde el cambio de estado / ensamblado
  private time = 0;
  private fade = 1; // alfa global
  private last = 0;
  private raf = 0;
  private visible = true;
  private destroyed = false;
  private animated = false;

  private mx = -1e4;
  private my = -1e4;
  private rect: DOMRect | null = null;
  private rectAt = 0;
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;

  constructor(private readonly root: HTMLElement) {
    const canvas = root.querySelector('canvas');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) throw new Error('canvas 2d no disponible');
    this.canvas = canvas;
    this.ctx = ctx;
    this.interactive = root.dataset.interactive !== 'false';
    this.intensity = Math.min(1.2, Math.max(0.2, Number(root.dataset.intensity) || 1));
    this.animated = lockMq.matches && !reduceMq.matches;
    root.dataset.mode = this.animated ? 'live' : 'static';

    window.addEventListener('b:dissolve', this.onDissolve);
    window.addEventListener('b:assemble', this.onAssemble);
    document.addEventListener('visibilitychange', this.syncLoop);
    lockMq.addEventListener('change', this.onMode);
    reduceMq.addEventListener('change', this.onMode);
    if (this.interactive) {
      window.addEventListener('pointermove', this.onPointer, { passive: true });
      document.documentElement.addEventListener('pointerleave', this.onLeave);
      window.addEventListener('blur', this.onLeave);
    }
    this.io = new IntersectionObserver((es) => {
      this.visible = es[es.length - 1].isIntersecting;
      this.syncLoop();
    });
    this.io.observe(root);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(root);

    void loadSample(root.dataset.src ?? '')
      .then((s) => {
        if (this.destroyed) return;
        this.sample = s;
        this.init();
      })
      .catch((err) => {
        console.error('[b-particles]', err);
        root.dataset.mode = 'static'; // queda el brillo CSS
      });
  }

  destroy = (): void => {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('b:dissolve', this.onDissolve);
    window.removeEventListener('b:assemble', this.onAssemble);
    document.removeEventListener('visibilitychange', this.syncLoop);
    lockMq.removeEventListener('change', this.onMode);
    reduceMq.removeEventListener('change', this.onMode);
    window.removeEventListener('pointermove', this.onPointer);
    document.documentElement.removeEventListener('pointerleave', this.onLeave);
    window.removeEventListener('blur', this.onLeave);
    this.io?.disconnect();
    this.ro?.disconnect();
  };

  /* ---------- Preparacion ---------- */
  private init(): void {
    const s = this.sample as Sample;
    const n = Math.min(s.n, Math.round(MAX_PARTICLES * Math.min(1, this.intensity)));
    this.n = n;
    this.nx = new Float32Array(n);
    this.ny = new Float32Array(n);
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.ph = new Float32Array(n);
    this.wake = new Float32Array(n);

    // Orden por grupo de color (conteo) para dibujar con un solo fillStyle por grupo.
    const counts = new Int32Array(BUCKETS);
    for (let i = 0; i < n; i++) counts[s.col[i]]++;
    const start = new Int32Array(BUCKETS);
    let acc = 0;
    for (let b = 0; b < BUCKETS; b++) {
      start[b] = acc;
      acc += counts[b];
      this.bucketEnd[b] = acc;
    }
    const fill = start.slice();
    for (let i = 0; i < n; i++) {
      const k = fill[s.col[i]]++;
      this.nx[k] = s.nx[i];
      this.ny[k] = s.ny[i];
      this.ph[k] = Math.random() * Math.PI * 2;
    }
    for (let g = 0; g < STREAMS; g++) this.resetStream(g, true);
    this.resize(true);
    this.assemble();
    this.syncLoop();
  }

  private resize(first = false): void {
    const bw = this.root.clientWidth;
    const bh = this.root.clientHeight;
    if (!bw || !bh) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = bw * (1 + PAD * 2);
    const ch = bh * (1 + PAD * 2);
    const k = this.bw ? bw / this.bw : 1;
    if (!first && this.n && k !== 1) {
      for (let i = 0; i < this.n; i++) {
        this.px[i] *= k;
        this.py[i] *= k;
        this.vx[i] *= k;
        this.vy[i] *= k;
      }
    }
    this.bw = bw;
    this.bh = bh;
    this.cw = cw;
    this.ch = ch;
    this.ox = (cw - bw) / 2;
    this.oy = (ch - bh) / 2;
    this.sc = Math.min(1.5, Math.max(0.7, bh / 560));
    this.gs = Math.round(11 * this.sc);
    this.font = `500 ${this.gs}px "Geist Variable", ui-monospace, monospace`;
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.rect = null;
    if (this.n && !this.animated) this.drawStatic();
  }

  /** Coloca las particulas dispersas alrededor y programa su llegada escalonada. */
  private assemble(): void {
    const cx = this.cw / 2;
    const cy = this.ch / 2;
    const rmax = Math.max(this.bw, this.bh) * 0.62;
    for (let i = 0; i < this.n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rmax * (0.55 + Math.random() * 0.75);
      this.px[i] = cx + Math.cos(a) * r;
      this.py[i] = cy + Math.sin(a) * r;
      this.vx[i] = 0;
      this.vy[i] = 0;
      this.wake[i] = Math.random() * 0.55;
    }
    this.state = 'on';
    this.stateT = 0;
    this.fade = 0;
    this.root.classList.remove('is-dissolved');
    if (!this.animated) this.drawStatic();
    this.syncLoop();
  }

  /* ---------- Eventos ---------- */
  private onDissolve = (): void => {
    if (!this.n) return;
    if (!this.animated) {
      this.root.classList.add('is-dissolved');
      return;
    }
    const cx = this.cw / 2;
    const cy = this.ch / 2;
    for (let i = 0; i < this.n; i++) {
      const dx = this.px[i] - cx;
      const dy = this.py[i] - cy;
      const d = Math.hypot(dx, dy) || 1;
      const sp = (6 + Math.random() * 14) * this.sc;
      this.vx[i] = (dx / d) * sp + (Math.random() - 0.5) * 3;
      this.vy[i] = (dy / d) * sp + (Math.random() - 0.5) * 3;
    }
    this.root.classList.add('is-dissolved');
    this.state = 'dissolving';
    this.stateT = 0;
    this.syncLoop();
  };

  private onAssemble = (): void => {
    if (!this.n) return;
    this.assemble();
  };

  private onMode = (): void => {
    const was = this.animated;
    this.animated = lockMq.matches && !reduceMq.matches;
    this.root.dataset.mode = this.animated ? 'live' : 'static';
    if (was === this.animated || !this.n) return;
    if (this.animated) this.assemble();
    else this.drawStatic();
    this.syncLoop();
  };

  private onPointer = (e: PointerEvent): void => {
    if (!this.animated || !fineMq.matches) return;
    const now = e.timeStamp;
    if (!this.rect || now - this.rectAt > 400) {
      this.rect = this.canvas.getBoundingClientRect();
      this.rectAt = now;
    }
    this.mx = e.clientX - this.rect.left;
    this.my = e.clientY - this.rect.top;
  };

  private onLeave = (): void => {
    this.mx = -1e4;
    this.my = -1e4;
  };

  /* ---------- Bucle ---------- */
  private syncLoop = (): void => {
    const run =
      !this.destroyed && this.n > 0 && this.animated && this.visible && !document.hidden && this.state !== 'gone';
    if (run && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!run && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  };

  private frame = (now: number): void => {
    this.raf = 0;
    if (this.destroyed) return;
    if (!this.root.isConnected) {
      this.destroy();
      return;
    }
    const dt = Math.min(2.5, (now - this.last) / 16.667);
    this.last = now;
    this.time += dt / 60;
    this.stateT += dt / 60;
    this.step(dt);
    this.draw();
    this.syncLoop(); // raf es 0 aqui: reprograma el siguiente cuadro si corresponde
  };

  private step(dt: number): void {
    const n = this.n;
    const px = this.px;
    const py = this.py;
    const vx = this.vx;
    const vy = this.vy;
    const ph = this.ph;

    if (this.state === 'dissolving') {
      const drag = Math.pow(0.95, dt);
      for (let i = 0; i < n; i++) {
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
        vx[i] *= drag;
        vy[i] *= drag;
      }
      this.fade = Math.max(0, 1 - (this.stateT * 1000) / DISSOLVE_MS);
      if (this.stateT * 1000 >= DISSOLVE_MS) {
        this.state = 'gone';
        this.fade = 0;
      }
      return;
    }

    this.fade = Math.min(1, this.fade + dt / 24); // ~400ms de aparicion
    const K = 0.055;
    const damp = Math.pow(0.84, dt);
    const amp = 0.7 * this.sc;
    const t = this.time;
    const ox = this.ox;
    const oy = this.oy;
    const bw = this.bw;
    const bh = this.bh;
    const mx = this.mx;
    const my = this.my;
    const R = CURSOR_R;
    const R2 = R * R;
    const push = 2.6 * this.sc;
    const st = this.stateT;
    const wake = this.wake;
    const nx = this.nx;
    const ny = this.ny;

    for (let i = 0; i < n; i++) {
      if (st < wake[i]) continue;
      const p = ph[i];
      const tx = ox + nx[i] * bw + Math.sin(t * 0.9 + p) * amp;
      const ty = oy + ny[i] * bh + Math.cos(t * 0.75 + p * 1.3) * amp;
      let ax = (tx - px[i]) * K;
      let ay = (ty - py[i]) * K;
      const dx = px[i] - mx;
      const dy = py[i] - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 1;
        const f = 1 - d / R;
        const g = f * f * push;
        ax += (dx / d) * g;
        ay += (dy / d) * g;
      }
      vx[i] = (vx[i] + ax * dt) * damp;
      vy[i] = (vy[i] + ay * dt) * damp;
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
    }

    // glifos
    const stepN = (11 * this.sc * 1.25) / bh;
    for (let g = 0; g < STREAMS; g++) {
      this.gy[g] += (this.gv[g] * dt) / 60;
      if (this.gy[g] - TRAIL * stepN > 1.05) this.resetStream(g, false);
      if (Math.random() < 0.06) this.gc[g * TRAIL + ((Math.random() * TRAIL) | 0)] = (Math.random() * GLYPHS.length) | 0;
    }
  }

  private resetStream(g: number, initial: boolean): void {
    this.gx[g] = 0.08 + Math.random() * 0.84;
    this.gy[g] = initial ? Math.random() * 1.2 - 0.1 : -Math.random() * 0.4;
    this.gv[g] = 0.22 + Math.random() * 0.34;
    for (let k = 0; k < TRAIL; k++) this.gc[g * TRAIL + k] = (Math.random() * GLYPHS.length) | 0;
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cw, this.ch);
    if (this.state === 'gone' || this.fade <= 0.002) return;
    ctx.globalCompositeOperation = 'lighter';
    this.drawParticles(this.fade);
    if (this.state === 'on' && this.fade > 0.6) this.drawGlyphs(this.fade);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  private drawParticles(fade: number): void {
    const ctx = this.ctx;
    const px = this.px;
    const py = this.py;
    const k = this.intensity > 1 ? 1 : this.intensity;
    let from = 0;
    for (let b = 0; b < BUCKETS; b++) {
      const to = this.bucketEnd[b];
      ctx.fillStyle = COLORS[b];
      ctx.globalAlpha = BUCKET_ALPHA[b] * fade * (0.55 + 0.45 * k);
      const s = Math.max(1.1, BUCKET_SIZE[b] * this.sc);
      const h = s / 2;
      for (let i = from; i < to; i++) ctx.fillRect(px[i] - h, py[i] - h, s, s);
      from = to;
    }
  }

  private drawGlyphs(fade: number): void {
    const ctx = this.ctx;
    const gs = this.gs;
    ctx.font = this.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const stepN = (gs * 1.25) / this.bh;
    const mask = (this.sample as Sample).mask;
    const gw = (this.sample as Sample).gw;
    const gh = (this.sample as Sample).gh;
    for (let g = 0; g < STREAMS; g++) {
      const nxg = this.gx[g];
      const gxi = (nxg * gw) | 0;
      for (let k = 0; k < TRAIL; k++) {
        const ny = this.gy[g] - k * stepN;
        if (ny < 0 || ny >= 1) continue;
        if (!mask[((ny * gh) | 0) * gw + gxi]) continue;
        const head = k === 0;
        ctx.fillStyle = head ? COLORS[0] : COLORS[1];
        ctx.globalAlpha = (head ? 0.7 : 0.42 * (1 - k / TRAIL)) * fade * (0.5 + 0.5 * Math.min(1, this.intensity));
        ctx.fillText(GLYPHS[this.gc[g * TRAIL + k]], this.ox + nxg * this.bw, this.oy + ny * this.bh);
      }
    }
  }

  /** Modo estatico: particulas en su sitio, una sola vez. */
  private drawStatic(): void {
    if (!this.n || !this.cw) return;
    for (let i = 0; i < this.n; i++) {
      this.px[i] = this.ox + this.nx[i] * this.bw;
      this.py[i] = this.oy + this.ny[i] * this.bh;
    }
    this.fade = 1;
    this.state = 'on';
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cw, this.ch);
    ctx.globalCompositeOperation = 'lighter';
    this.drawParticles(1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}

/* ---------- Montaje ---------- */
const instances = new WeakMap<HTMLElement, BParticles>();

export function mountBParticles(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-bparticles]')) {
    if (instances.has(el)) continue;
    try {
      instances.set(el, new BParticles(el));
    } catch (err) {
      console.error('[b-particles] no se pudo montar', err);
      el.dataset.mode = 'static';
    }
  }
}

mountBParticles();
document.addEventListener('astro:page-load', mountBParticles);

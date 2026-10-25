/**
 * Texturas generadas en runtime con canvas 2D (sin creditos, sin descargas):
 * - atlas de glifos (codigo + numerales mayas de barras y puntos)
 * - muestreo de la silueta de la B, mascara y halo
 * - capa cercana provisional (siluetas de escalinatas, obeliscos y cables)
 */

export type Rng = () => number;

/** PRNG determinista (mulberry32) */
export function rng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas2d(w: number, h: number, readback = false): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', readback ? { willReadFrequently: true } : undefined);
  if (!ctx) throw new Error('canvas 2d no disponible');
  return [c, ctx];
}

/* ---------------- Atlas de glifos ---------------- */

const CODE_GLYPHS = [
  '0', '1', '0', '1', '{', '}', '<', '>', '/', '\\', ';', '=', '+', '*', '[', ']',
  '(', ')', '#', '$', '%', '&', '|', '~', '^', ':', '0', '1', '?', '!', '0', '1',
  'B', '<', '/', '>', '{', '}', '1', '0', '=', '>', '0', '1',
];

/** Numeral maya (0..19) en una celda: barras de 5, puntos de 1, concha para el cero */
function drawMaya(ctx: CanvasRenderingContext2D, n: number, cx: number, cy: number, s: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  if (n === 0) {
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.34, s * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.04);
    ctx.quadraticCurveTo(0, s * 0.1, s * 0.22, -s * 0.04);
    ctx.moveTo(-s * 0.12, -s * 0.15);
    ctx.lineTo(-s * 0.08, s * 0.02);
    ctx.moveTo(s * 0.12, -s * 0.15);
    ctx.lineTo(s * 0.08, s * 0.02);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const barH = s * 0.1;
  const gap = s * 0.06;
  const dotR = s * 0.06;
  const total = bars * barH + Math.max(0, bars - 1) * gap + (dots ? dotR * 2 + gap : 0);
  let y = total / 2;
  for (let i = 0; i < bars; i++) {
    ctx.fillRect(-s * 0.36, y - barH, s * 0.72, barH);
    y -= barH + gap;
  }
  if (dots) {
    const step = dotR * 2.6;
    const x0 = -((dots - 1) * step) / 2;
    for (let i = 0; i < dots; i++) {
      ctx.beginPath();
      ctx.arc(x0 + i * step, y - dotR, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Atlas 8x8 de 64 glifos blancos sobre transparente (512 px). */
export async function glyphAtlas(): Promise<HTMLCanvasElement> {
  const font = '600 40px "Geist Variable", "Geist", ui-monospace, monospace';
  try {
    await Promise.race([document.fonts.load(font), new Promise((r) => setTimeout(r, 800))]);
  } catch {
    /* sin fuente: monospace del sistema */
  }
  const CELL = 64;
  const [c, ctx] = canvas2d(CELL * 8, CELL * 8);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font;
  for (let i = 0; i < 64; i++) {
    const cx = (i % 8) * CELL + CELL / 2;
    const cy = Math.floor(i / 8) * CELL + CELL / 2;
    if (i < CODE_GLYPHS.length) ctx.fillText(CODE_GLYPHS[i], cx, cy + 2);
    else drawMaya(ctx, (i - CODE_GLYPHS.length) % 20, cx, cy, CELL);
  }
  return c;
}

/* ---------------- Silueta de la B ---------------- */

/** margen del lienzo del halo; el plano del halo mide 1 / (1 - 2 * HALO_PAD) alturas de B */
export const HALO_PAD = 0.18;

export interface BSample {
  /** ancho / alto */
  aspect: number;
  positions: Float32Array; // xyz en alturas de B, centrado
  rand: Float32Array; // vec4
  edge: Float32Array; // 1 = contorno
  scatter: Float32Array; // vec3
  /** silueta (alfa) para que los glifos sepan si estan dentro */
  mask: HTMLCanvasElement;
  /** silueta difuminada para el halo */
  halo: HTMLCanvasElement;
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  return img;
}

export function sampleB(img: HTMLImageElement, count: number, thickness: number): BSample {
  const aspect = img.naturalWidth / img.naturalHeight;
  const gh = 320;
  const gw = Math.round(gh * aspect);
  const [mask, mctx] = canvas2d(gw, gh, true);
  mctx.drawImage(img, 0, 0, gw, gh);
  const data = mctx.getImageData(0, 0, gw, gh).data;
  const inside = new Uint8Array(gw * gh);
  for (let i = 0; i < gw * gh; i++) inside[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  const edges: number[] = [];
  const fill: number[] = [];
  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      const i = y * gw + x;
      if (!inside[i]) continue;
      if (!inside[i - 1] || !inside[i + 1] || !inside[i - gw] || !inside[i + gw]) edges.push(i);
      else fill.push(i);
    }
  }
  const r = rng(20261025);
  const positions = new Float32Array(count * 3);
  const rand = new Float32Array(count * 4);
  const scatter = new Float32Array(count * 3);
  const edge = new Float32Array(count);
  const T = thickness / 2;
  for (let n = 0; n < count; n++) {
    const onEdge = r() < 0.3 && edges.length > 0;
    const list = onEdge ? edges : fill.length ? fill : edges;
    const i = list[Math.floor(r() * list.length)];
    edge[n] = onEdge ? 1 : 0;
    const px = (i % gw) + r();
    const py = Math.floor(i / gw) + r();
    positions[n * 3] = (px / gh) - aspect / 2;
    positions[n * 3 + 1] = 0.5 - py / gh;
    // volumen: contorno a lo largo del grosor, relleno en las dos caras
    positions[n * 3 + 2] = onEdge ? (r() * 2 - 1) * T : (r() < 0.5 ? -1 : 1) * T * (0.55 + r() * 0.45);
    rand[n * 4] = r();
    rand[n * 4 + 1] = r();
    rand[n * 4 + 2] = r();
    rand[n * 4 + 3] = r();
    // direccion de dispersion: esfera aleatoria
    const th = r() * Math.PI * 2;
    const ph = Math.acos(r() * 2 - 1);
    scatter[n * 3] = Math.sin(ph) * Math.cos(th);
    scatter[n * 3 + 1] = Math.sin(ph) * Math.sin(th) * 0.7;
    scatter[n * 3 + 2] = Math.cos(ph);
  }

  // halo: reducir y volver a ampliar varias veces = desenfoque barato y portable
  const HS = 256;
  const pad = HALO_PAD;
  const [halo, hctx] = canvas2d(HS, HS);
  const [tmp, tctx] = canvas2d(32, 32);
  const w = HS * (1 - pad * 2);
  hctx.drawImage(img, (HS - w * aspect) / 2, HS * pad, w * aspect, w);
  for (const size of [64, 32, 20]) {
    tmp.width = size;
    tmp.height = size;
    tctx.imageSmoothingQuality = 'high';
    tctx.drawImage(halo, 0, 0, size, size);
    hctx.clearRect(0, 0, HS, HS);
    hctx.imageSmoothingQuality = 'high';
    hctx.drawImage(tmp, 0, 0, HS, HS);
  }
  return { aspect, positions, rand, edge, scatter, mask, halo };
}

/* ---------------- Capa cercana provisional ---------------- */

/**
 * Siluetas oscuras de primer plano con luz de borde cian/magenta, fondo transparente.
 * Se usa solo mientras no exista src/assets/world/near.*
 */
export function nearPlaceholder(): HTMLCanvasElement {
  const W = 3072;
  const H = 640;
  const [c, ctx] = canvas2d(W, H);
  const r = rng(7);
  const ink = '#06041a';
  const cyan = 'rgba(77,243,255,';
  const mag = 'rgba(255,62,165,';

  const rim = (path: Path2D, color: string, a: number) => {
    ctx.save();
    ctx.shadowColor = color + a + ')';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = color + a + ')';
    ctx.lineWidth = 2;
    ctx.stroke(path);
    ctx.restore();
  };

  // escalinatas (piramides escalonadas cortadas por el borde inferior)
  let x = -120;
  while (x < W) {
    const w = 360 + r() * 520;
    const h = 120 + r() * 220;
    const steps = 5 + Math.floor(r() * 4);
    const p = new Path2D();
    p.moveTo(x, H);
    for (let s = 0; s < steps; s++) {
      const yy = H - (h * (s + 1)) / steps;
      const inset = (w * 0.38 * (s + 1)) / steps;
      p.lineTo(x + inset - (w * 0.38) / steps, yy + h / steps);
      p.lineTo(x + inset - (w * 0.38) / steps, yy);
      p.lineTo(x + inset, yy);
    }
    const top = H - h;
    const cxp = x + w / 2;
    p.lineTo(cxp + (cxp - (x + w * 0.38)), top);
    for (let s = steps - 1; s >= 0; s--) {
      const yy = H - (h * (s + 1)) / steps;
      const inset = (w * 0.38 * (s + 1)) / steps;
      p.lineTo(x + w - inset, yy);
      p.lineTo(x + w - inset + (w * 0.38) / steps, yy);
      p.lineTo(x + w - inset + (w * 0.38) / steps, yy + h / steps);
    }
    p.lineTo(x + w, H);
    p.closePath();
    ctx.fillStyle = ink;
    ctx.fill(p);
    rim(p, r() < 0.6 ? cyan : mag, 0.55);
    x += w * (0.75 + r() * 0.9);
  }

  // obeliscos
  for (let i = 0; i < 9; i++) {
    const ox = r() * W;
    const ow = 26 + r() * 30;
    const oh = 260 + r() * 300;
    const p = new Path2D();
    p.moveTo(ox, H);
    p.lineTo(ox + ow * 0.12, H - oh);
    p.lineTo(ox + ow / 2, H - oh - ow * 0.7);
    p.lineTo(ox + ow * 0.88, H - oh);
    p.lineTo(ox + ow, H);
    p.closePath();
    ctx.fillStyle = ink;
    ctx.fill(p);
    rim(p, r() < 0.5 ? cyan : mag, 0.7);
    // luz en la punta
    ctx.save();
    ctx.fillStyle = cyan + '0.9)';
    ctx.shadowColor = cyan + '1)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(ox + ow / 2, H - oh - ow * 0.55, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // cables colgando (catenarias)
  for (let i = 0; i < 7; i++) {
    const x0 = r() * W;
    const x1 = x0 + 300 + r() * 700;
    const y0 = 60 + r() * 200;
    const y1 = 60 + r() * 200;
    const sag = 80 + r() * 160;
    const p = new Path2D();
    p.moveTo(x0, y0);
    p.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1);
    ctx.save();
    ctx.strokeStyle = 'rgba(10,8,32,0.95)';
    ctx.lineWidth = 3;
    ctx.stroke(p);
    ctx.restore();
    rim(p, r() < 0.5 ? cyan : mag, 0.35);
  }
  return c;
}

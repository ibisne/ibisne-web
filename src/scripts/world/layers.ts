/**
 * Capas de imagen del panorama: planos a distinta profundidad frente a una camara
 * en perspectiva. Cada plano cubre su frustum (con margen para el mouse) y muestra
 * una ventana del panorama centrada en la posicion de viaje `p`. El zoom de cada
 * capa decide cuantas pantallas recorre por unidad de panorama (parallax de viaje).
 */
import {
  AdditiveBlending,
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
} from 'three';
import type { IUniform } from 'three';
import { HAZE, LAYERS, layerMargin, PORTRAIT_ZOOM_FACTOR } from './config';
import type { LayerSpec } from './config';
import { layerFrag, layerVert } from './shaders';

export type LayerName = 'far' | 'mid2' | 'mid' | 'near';
export type LayerBlend = 'normal' | 'add' | 'alpha';

export interface LayerSource {
  name: LayerName;
  image: HTMLImageElement | HTMLCanvasElement;
  repeat: number;
  blend: LayerBlend;
  /** textura ya subida de otra capa (mid2 reutiliza la de mid) */
  shared?: Texture;
  /** desfase de la ventana en el panorama (sin tope: el espejo continua el arte) */
  offset?: number;
}

// haze sube con la distancia: atmosfera por profundidad
const LOOK: Record<LayerName, { bright: number; glow: number; haze: number; order: number }> = {
  far: { bright: 0.95, glow: 0.14, haze: 0.2, order: 0 },
  mid2: { bright: 0.3, glow: 0.35, haze: 0.35, order: 0.5 },
  mid: { bright: 0.5, glow: 1.0, haze: 0.16, order: 1 },
  near: { bright: 0.6, glow: 0.35, haze: 0, order: 6 },
};


function makeTexture(img: HTMLImageElement | HTMLCanvasElement, maxSize: number): Texture {
  let src: HTMLImageElement | HTMLCanvasElement = img;
  const w = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const h = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  if (w > maxSize || h > maxSize) {
    const k = maxSize / Math.max(w, h);
    const c = document.createElement('canvas');
    c.width = Math.floor(w * k);
    c.height = Math.floor(h * k);
    c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
    src = c;
  }
  const tex = src instanceof HTMLCanvasElement ? new CanvasTexture(src) : new Texture(src);
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export class Layer {
  readonly name: LayerName;
  readonly spec: LayerSpec;
  readonly mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  /** pantallas (anchos de viewport) que recorre la capa por unidad de panorama */
  lambda = 1;
  private spanX = 0.3;
  private tex: Texture;
  private tileAspect: number;
  private repeat: number;
  private u: Record<string, IUniform>;
  private look: (typeof LOOK)[LayerName];
  private ownsTex: boolean;
  readonly offset: number;

  constructor(src: LayerSource, maxTexture: number) {
    this.name = src.name;
    this.spec = LAYERS[src.name];
    this.look = LOOK[src.name];
    const w = src.image instanceof HTMLImageElement ? src.image.naturalWidth : src.image.width;
    const h = src.image instanceof HTMLImageElement ? src.image.naturalHeight : src.image.height;
    this.tileAspect = w / h;
    this.repeat = src.repeat;
    this.offset = src.offset ?? 0;
    this.ownsTex = !src.shared;
    this.tex = src.shared ?? makeTexture(src.image, maxTexture);
    this.u = {
      uMap: { value: this.tex },
      uRepeat: { value: src.repeat },
      uCenter: { value: new Vector2(0.5, 0.5) },
      uSpan: { value: new Vector2(0.3, 1) },
      uBright: { value: this.look.bright },
      uGlow: { value: this.look.glow },
      uGlowPos: { value: new Vector2(0.5, 0.5) },
      uRes: { value: new Vector2(1, 1) },
      uHaze: { value: new Vector3(...HAZE) },
      uHazeAmt: { value: this.look.haze },
      uDim: { value: 1 },
      uAlpha: { value: 1 },
      uTime: { value: 0 },
      uClear: { value: new Vector3(0.5, 0.5, 0.2) },
      uClearAmt: { value: 0 },
    };
    const mode = src.name === 'far' ? 'MODE_FAR' : src.blend === 'alpha' ? 'MODE_ALPHA' : 'MODE_ADD';
    const mat = new ShaderMaterial({
      uniforms: this.u,
      vertexShader: layerVert,
      fragmentShader: layerFrag,
      defines: { [mode]: '' },
      transparent: src.name !== 'far',
      blending: mode === 'MODE_ADD' ? AdditiveBlending : NormalBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(new PlaneGeometry(1, 1), mat);
    this.mesh.position.z = -this.spec.depth;
    this.mesh.renderOrder = this.look.order;
    this.mesh.frustumCulled = false;
  }

  /** Ajusta el plano al frustum de su profundidad */
  resize(tanHalf: number, aspect: number): void {
    const d = this.spec.depth;
    const fh = 2 * d * tanHalf;
    const fw = fh * aspect;
    const [mx, my] = layerMargin(d, fw / 2, fh / 2);
    const pw = fw * this.spec.overscan + mx * 2;
    const ph = fh * this.spec.overscan + my * 2;
    this.mesh.scale.set(pw, ph, 1);
    const pAspect = pw / ph;
    const panAspect = this.tileAspect * this.repeat;
    const portrait = aspect < 1;
    let zoom = portrait ? 1 + (this.spec.zoom - 1) * PORTRAIT_ZOOM_FACTOR : this.spec.zoom;
    let spanX = pAspect / (panAspect * zoom);
    if (spanX > 1) {
      zoom = pAspect / panAspect;
      spanX = 1;
    }
    const spanY = 1 / zoom;
    this.spanX = spanX;
    this.lambda = pw / fw / spanX;
    const span = this.u.uSpan.value as Vector2;
    span.set(spanX, spanY);
    const va = this.spec.vAnchor;
    const v = va === 'bottom' ? spanY / 2 + 0.002 : Math.min(Math.max(va, spanY / 2), 1 - spanY / 2);
    (this.u.uCenter.value as Vector2).y = v;
  }

  update(p: number, dim: number, time: number, glow: Vector2, res: Vector2, alpha = 1): void {
    const half = this.spanX / 2;
    // con desfase la ventana puede pasar del borde: el shader continua el arte en espejo
    (this.u.uCenter.value as Vector2).x = this.offset ? p + this.offset : Math.min(Math.max(p, half), 1 - half);
    this.u.uDim.value = dim;
    this.u.uTime.value = time;
    this.u.uAlpha.value = alpha;
    (this.u.uGlowPos.value as Vector2).copy(glow);
    (this.u.uRes.value as Vector2).copy(res);
    this.mesh.visible = alpha > 0.003;
  }

  /** Atenua la capa alrededor de un punto de pantalla (la B), para que no la tape */
  setClear(x: number, y: number, r: number, amt: number): void {
    (this.u.uClear.value as Vector3).set(x, y, r);
    this.u.uClearAmt.value = amt;
  }

  get texture(): Texture {
    return this.tex;
  }

  dispose(): void {
    if (this.ownsTex) this.tex.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

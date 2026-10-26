/**
 * Fragmentos de glitch flotando a varias profundidades: astillas delgadas y grupos de
 * pixeles que giran lento, con borde RGB (cian/magenta desplazados), cortes de senal
 * (se apagan o se desfasan un instante) y reaccion al paso del mouse. Dos lotes: detras
 * de la capa cercana y delante de ella. Todo el movimiento vive en el shader; por cuadro
 * solo se escriben uniforms (sin allocations). Constantes FRAG_* en config.ts.
 */
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector2, Vector3, Vector4 } from 'three';
import type { IUniform } from 'three';
import {
  CYAN,
  FRAG_ALPHA,
  FRAG_DRIFT,
  FRAG_FAR_MAX,
  FRAG_FLICKER_RATE,
  FRAG_FRONT_SHARE,
  FRAG_JUMP_CHANCE,
  FRAG_MOUSE_PUSH_PX,
  FRAG_MOUSE_RADIUS_PX,
  FRAG_MOUSE_SHARE,
  FRAG_NEAR_MIN,
  FRAG_OFF_CHANCE,
  FRAG_RGB,
  FRAG_RGB_JUMP,
  FRAG_SIZE_MAX_PX,
  FRAG_SIZE_MIN_PX,
  FRAG_SPIN_MAX,
  FRAG_SPIN_MIN,
  LAYERS,
  MAGENTA,
} from './config';
import { fragFrag, fragVert } from './shaders';
import { rng } from './procedural';

export interface FragFrame {
  time: number;
  /** posicion en el panorama (cur.u) */
  p: number;
  tanHalf: number;
  aspect: number;
  /** vistas por unidad de panorama de la capa lejana, media y cercana */
  lamFar: number;
  lamMid: number;
  lamNear: number;
  dim: number;
  dpr: number;
  res: Vector2;
  /** cursor en NDC */
  mx: number;
  my: number;
  /** 0..1 intensidad del mouse (la de la estela) */
  mouseAmp: number;
}

export class Fragments {
  readonly back: Points<BufferGeometry, ShaderMaterial>;
  readonly front: Points<BufferGeometry, ShaderMaterial>;
  private u: Record<string, IUniform>;
  private nBack: number;
  private nFront: number;

  constructor(max: number) {
    const r = rng(7);
    this.nFront = Math.round(max * FRAG_FRONT_SHARE);
    this.nBack = max - this.nFront;
    const nearD = LAYERS.near.depth;
    const make = (n: number, dMin: number, dMax: number, bias: number) => {
      const f = new Float32Array(n * 4);
      const g = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        const k = Math.pow(r(), bias);
        const d = dMin + (dMax - dMin) * k;
        f[i * 4] = r();
        f[i * 4 + 1] = r();
        f[i * 4 + 2] = d;
        f[i * 4 + 3] = r();
        // cerca = grande; lejos = chico (tamano aparente, no de mundo: siempre 6-24 px)
        const near = 1 - (d - FRAG_NEAR_MIN) / (FRAG_FAR_MAX - FRAG_NEAR_MIN);
        const size = FRAG_SIZE_MIN_PX + (FRAG_SIZE_MAX_PX - FRAG_SIZE_MIN_PX) * Math.pow(near, 1.6) * (0.75 + r() * 0.5);
        const px = Math.min(FRAG_SIZE_MAX_PX, Math.max(FRAG_SIZE_MIN_PX, size));
        // grupos de pixeles solo en los grandes (en chico se leen como punto)
        g[i * 4] = px > 12 && r() < 0.45 ? 0.8 : 0.2;
        const spin = FRAG_SPIN_MIN + (FRAG_SPIN_MAX - FRAG_SPIN_MIN) * r();
        g[i * 4 + 1] = r() < 0.5 ? -spin : spin;
        g[i * 4 + 2] = px;
        g[i * 4 + 3] = r() < FRAG_MOUSE_SHARE ? 1 : 0;
      }
      const geo = new BufferGeometry();
      geo.setAttribute('aF', new BufferAttribute(f, 4));
      geo.setAttribute('aG', new BufferAttribute(g, 4));
      // three necesita un atributo position para contar vertices
      geo.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
      return geo;
    };
    this.u = {
      uTime: { value: 0 },
      uP: { value: 0 },
      uTanHalf: { value: 0.36 },
      uAspect: { value: 1.6 },
      uLam: { value: new Vector3(3, 4, 6) },
      uInvD: { value: new Vector3(1 / LAYERS.far.depth, 1 / LAYERS.mid.depth, 1 / LAYERS.near.depth) },
      uDim: { value: 1 },
      uDpr: { value: 1 },
      uRes: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0, 0) },
      uMAmp: { value: 0 },
      uK: { value: new Vector4(FRAG_ALPHA, FRAG_DRIFT, FRAG_MOUSE_RADIUS_PX, FRAG_MOUSE_PUSH_PX) },
      uFlick: { value: new Vector4(FRAG_FLICKER_RATE, FRAG_OFF_CHANCE, FRAG_JUMP_CHANCE, FRAG_RGB_JUMP) },
      uRgb: { value: FRAG_RGB },
      uClear: { value: new Vector4(0.5, 0.5, 0.1, 0) },
      uCyan: { value: new Vector3(...CYAN) },
      uMagenta: { value: new Vector3(...MAGENTA) },
    };
    const mat = new ShaderMaterial({
      uniforms: this.u,
      vertexShader: fragVert,
      fragmentShader: fragFrag,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.back = new Points(make(this.nBack, nearD + 0.4, FRAG_FAR_MAX, 1.5), mat);
    this.front = new Points(make(this.nFront, FRAG_NEAR_MIN, nearD - 0.2, 1), mat);
    // detras de la cercana (6) y delante de ella; la B va en 2-4
    this.back.renderOrder = 4.5;
    this.front.renderOrder = 7;
    this.back.frustumCulled = false;
    this.front.frustumCulled = false;
  }

  get count(): number {
    const c = (p: Points) => Math.min(p.geometry.drawRange.count, p.geometry.getAttribute('aF').count);
    return c(this.back) + c(this.front);
  }

  setCount(count: number): void {
    const f = Math.min(this.nFront, Math.round(count * FRAG_FRONT_SHARE));
    this.front.geometry.setDrawRange(0, f);
    this.back.geometry.setDrawRange(0, Math.min(this.nBack, count - f));
  }

  /** Zona despejada alrededor de la B (uv de pantalla, radio en altos de pantalla, cantidad 0..1) */
  setClear(x: number, y: number, r: number, amt: number): void {
    (this.u.uClear.value as Vector4).set(x, y, r, amt);
  }

  update(o: FragFrame): void {
    this.u.uTime.value = o.time;
    this.u.uP.value = o.p;
    this.u.uTanHalf.value = o.tanHalf;
    this.u.uAspect.value = o.aspect;
    (this.u.uLam.value as Vector3).set(o.lamFar, o.lamMid, o.lamNear);
    this.u.uDim.value = o.dim;
    this.u.uDpr.value = o.dpr;
    (this.u.uRes.value as Vector2).copy(o.res);
    (this.u.uMouse.value as Vector2).set(o.mx, o.my);
    this.u.uMAmp.value = o.mouseAmp;
  }

  dispose(): void {
    this.back.geometry.dispose();
    this.front.geometry.dispose();
    this.back.material.dispose();
  }
}

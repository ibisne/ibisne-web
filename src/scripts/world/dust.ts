/**
 * Polvo y escombros flotando a varias profundidades. Dos lotes: detras de la capa
 * cercana y delante de ella (bokeh grande y tenue). Todo el movimiento ocurre en
 * el shader: deriva lenta, flotacion, y desplazamiento de viaje segun profundidad.
 */
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector3 } from 'three';
import type { IUniform } from 'three';
import { DUST_FAR_MAX, DUST_NEAR_MIN, LAYERS } from './config';
import { dustFrag, dustVert } from './shaders';
import { rng } from './procedural';

const FRONT_SHARE = 0.22;

export class Dust {
  readonly back: Points<BufferGeometry, ShaderMaterial>;
  readonly front: Points<BufferGeometry, ShaderMaterial>;
  private u: Record<string, IUniform>;
  private nBack: number;
  private nFront: number;

  constructor(count: number) {
    const r = rng(42);
    this.nFront = Math.round(count * FRONT_SHARE);
    this.nBack = count - this.nFront;
    const nearD = LAYERS.near.depth;
    const make = (n: number, dMin: number, dMax: number, bias: number) => {
      const a = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        a[i * 4] = r();
        a[i * 4 + 1] = r();
        // mas densidad cerca: distribucion sesgada hacia dMin
        a[i * 4 + 2] = dMin + (dMax - dMin) * Math.pow(r(), bias);
        a[i * 4 + 3] = r();
      }
      const g = new BufferGeometry();
      g.setAttribute('aD', new BufferAttribute(a, 4));
      // three necesita un atributo position para contar vertices
      g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
      return g;
    };
    this.u = {
      uTime: { value: 0 },
      uP: { value: 0 },
      uTanHalf: { value: 0.36 },
      uAspect: { value: 1.6 },
      uPxPerUnit: { value: 1000 },
      uLam: { value: new Vector3(3, 4, 6) },
      uInvD: { value: new Vector3(1 / LAYERS.far.depth, 1 / LAYERS.mid.depth, 1 / LAYERS.near.depth) },
      uSpeed: { value: 0 },
      uDim: { value: 1 },
    };
    const mat = new ShaderMaterial({
      uniforms: this.u,
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.back = new Points(make(this.nBack, nearD, DUST_FAR_MAX, 1.7), mat);
    this.front = new Points(make(this.nFront, DUST_NEAR_MIN, nearD, 1), mat);
    this.back.renderOrder = 4;
    this.front.renderOrder = 7;
    this.back.frustumCulled = false;
    this.front.frustumCulled = false;
  }

  get count(): number {
    const c = (p: Points) => Math.min(p.geometry.drawRange.count, p.geometry.getAttribute('aD').count);
    return c(this.back) + c(this.front);
  }

  setCount(count: number): void {
    const f = Math.min(this.nFront, Math.round(count * FRONT_SHARE));
    this.front.geometry.setDrawRange(0, f);
    this.back.geometry.setDrawRange(0, Math.min(this.nBack, count - f));
  }

  update(o: {
    time: number;
    p: number;
    tanHalf: number;
    aspect: number;
    pxPerUnit: number;
    lam: [number, number, number];
    speed: number;
    dim: number;
  }): void {
    this.u.uTime.value = o.time;
    this.u.uP.value = o.p;
    this.u.uTanHalf.value = o.tanHalf;
    this.u.uAspect.value = o.aspect;
    this.u.uPxPerUnit.value = o.pxPerUnit;
    (this.u.uLam.value as Vector3).set(...o.lam);
    this.u.uSpeed.value = o.speed;
    this.u.uDim.value = o.dim;
  }

  dispose(): void {
    this.back.geometry.dispose();
    this.front.geometry.dispose();
    this.back.material.dispose();
  }
}

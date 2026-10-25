/**
 * La B matrix en GPU.
 * - 8k a 32k particulas muestreadas de la silueta (contorno + dos caras = volumen).
 * - Glifos (codigo y numerales mayas) que llueven dentro de la silueta, en columnas.
 * - Halo difuminado detras.
 * - Interaccion: el cursor se proyecta al plano de la B (rayo contra plano rotado);
 *   alrededor hay remolino con flujo rizado y arrastre. Cursor, presencia y giro del
 *   remolino van con resortes subamortiguados, asi el regreso rebota un poco.
 * - La B entera gira (yaw/pitch hasta 36 grados) hacia el cursor con inercia de dos etapas.
 * - Modos: assembled / dissolved (polvo que se va en la direccion del viaje) / hidden.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Points,
  Ray,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import type { IUniform } from 'three';
import {
  B_ASSEMBLE_S,
  B_CURSOR_RADIUS,
  B_DISSOLVE_S,
  B_MAX_TILT,
  B_PARTICLES_HIGH,
  B_THICKNESS,
  B_TILT_LERP,
  CYAN,
  MAGENTA,
} from './config';
import type { BMode } from './config';
import { HALO_PAD } from './procedural';
import type { BSample } from './procedural';
import { bFrag, bVert, glyphFrag, glyphVert, haloFrag, haloVert } from './shaders';

/** Resorte de segundo orden (Euler semi implicito) */
class Spring {
  x: number;
  v = 0;
  constructor(
    x: number,
    private k: number,
    private c: number,
  ) {
    this.x = x;
  }
  step(target: number, dt: number): number {
    const a = this.k * (target - this.x) - this.c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

const GLYPH_ROWS = 24;
const tmpV = new Vector3();
const tmpN = new Vector3();
const ray = new Ray();
const plane = new Plane();

export interface BPointer {
  /** NDC -1..1 del cursor (o de la deriva en tactil) */
  x: number;
  y: number;
  /** hay un puntero real encima (mouse o dedo tocando) */
  active: boolean;
}

export class BMatrix {
  readonly group = new Group();
  readonly aspect: number;
  private points: Points<BufferGeometry, ShaderMaterial>;
  private glyphs: Points<BufferGeometry, ShaderMaterial>;
  private halo: Mesh<PlaneGeometry, ShaderMaterial>;
  private shared: Record<string, IUniform>;
  private pu: Record<string, IUniform>;
  private gu: Record<string, IUniform>;
  private hu: Record<string, IUniform>;
  private textures: CanvasTexture[] = [];
  private total: number;
  private glyphTotal: number;

  private cx = new Spring(0, 140, 17);
  private cy = new Spring(0, 140, 17);
  private hover = new Spring(0, 55, 7);
  private swirl = new Spring(1, 50, 9);
  private vel = new Vector2();
  private lastLocal = new Vector2();
  private hasLast = false;
  private speedS = 0;
  private yaw = 0;
  private pitch = 0;
  private yaw1 = 0;
  private pitch1 = 0;
  /** alfa de las particulas segun la cantidad (setCount); el hover lo sube */
  private baseAlpha = 0.5;

  mode: BMode = 'hidden';
  private dissolve = 1;
  private dTarget = 1;
  private dRate = 1 / B_DISSOLVE_S;

  constructor(sample: BSample, atlas: HTMLCanvasElement, count: number) {
    this.aspect = sample.aspect;
    this.total = sample.positions.length / 3;
    this.shared = {
      uTime: { value: 0 },
      uCursor: { value: new Vector2(9, 9) },
      uCursorVel: { value: new Vector2() },
      uHover: { value: 0 },
      uSwirl: { value: 1 },
      uRadius: { value: B_CURSOR_RADIUS },
      uDissolve: { value: 1 },
      uTravelDir: { value: 1 },
    };

    // --- particulas ---
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(sample.positions, 3));
    g.setAttribute('aRand', new BufferAttribute(sample.rand, 4));
    g.setAttribute('aScatter', new BufferAttribute(sample.scatter, 3));
    g.setAttribute('aEdge', new BufferAttribute(sample.edge, 1));
    this.pu = {
      ...this.shared,
      uPxScale: { value: 1 },
      uDensity: { value: 1 },
      uAlpha: { value: 0.5 },
      uCyan: { value: new Vector3(...CYAN) },
      uMagenta: { value: new Vector3(...MAGENTA) },
    };
    this.points = new Points(
      g,
      new ShaderMaterial({
        uniforms: this.pu,
        vertexShader: bVert,
        fragmentShader: bFrag,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;

    // --- glifos ---
    const cell = 1 / GLYPH_ROWS;
    const cols = Math.floor(this.aspect / cell);
    const streams = 3;
    const trail = 18;
    const n = cols * streams * trail;
    this.glyphTotal = n;
    const ga = new Float32Array(n * 4);
    let i = 0;
    for (let s = 0; s < streams; s++) {
      for (let c = 0; c < cols; c++) {
        const seed = (Math.sin(c * 91.7 + s * 17.3) * 43758.5453) % 1;
        for (let k = 0; k < trail; k++) {
          ga[i++] = c;
          ga[i++] = k;
          ga[i++] = Math.abs(seed);
          ga[i++] = s;
        }
      }
    }
    const gg = new BufferGeometry();
    gg.setAttribute('aG', new BufferAttribute(ga, 4));
    gg.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
    const maskTex = new CanvasTexture(sample.mask);
    maskTex.generateMipmaps = false;
    maskTex.minFilter = LinearFilter;
    const atlasTex = new CanvasTexture(atlas);
    atlasTex.flipY = false;
    atlasTex.generateMipmaps = false;
    atlasTex.minFilter = LinearFilter;
    this.textures.push(maskTex, atlasTex);
    this.gu = {
      ...this.shared,
      uMask: { value: maskTex },
      uAtlas: { value: atlasTex },
      uCell: { value: cell },
      uRows: { value: GLYPH_ROWS },
      uAspect: { value: this.aspect },
      uTrail: { value: trail },
      uFrontZ: { value: B_THICKNESS / 2 + 0.004 },
      uCellPx: { value: 12 },
      uAlpha: { value: 1.0 },
      uCyan: { value: new Vector3(...CYAN) },
    };
    this.glyphs = new Points(
      gg,
      new ShaderMaterial({
        uniforms: this.gu,
        vertexShader: glyphVert,
        fragmentShader: glyphFrag,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.glyphs.frustumCulled = false;
    this.glyphs.renderOrder = 4;

    // --- halo ---
    const haloTex = new CanvasTexture(sample.halo);
    haloTex.generateMipmaps = false;
    haloTex.minFilter = LinearFilter;
    this.textures.push(haloTex);
    this.hu = {
      uMap: { value: haloTex },
      uCyan: { value: new Vector3(...CYAN) },
      uMagenta: { value: new Vector3(...MAGENTA) },
      uAlpha: { value: 0.4 },
      uTime: this.shared.uTime,
    };
    const hs = 1 / (1 - HALO_PAD * 2);
    this.halo = new Mesh(
      new PlaneGeometry(hs * 1.08, hs * 1.08),
      new ShaderMaterial({
        uniforms: this.hu,
        vertexShader: haloVert,
        fragmentShader: haloFrag,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.halo.position.z = -B_THICKNESS;
    this.halo.renderOrder = 2;
    this.halo.frustumCulled = false;

    this.group.add(this.halo, this.points, this.glyphs);
    this.group.visible = false;
    this.setCount(count);
  }

  /** Cuantas particulas dibujar (el muestreo es aleatorio: cualquier prefijo es uniforme) */
  setCount(count: number): void {
    const n = Math.min(count, this.total);
    this.points.geometry.setDrawRange(0, n);
    // menos particulas = mas grandes y mas brillantes, misma lectura
    this.pu.uDensity.value = Math.min(1.7, Math.pow(B_PARTICLES_HIGH / n, 0.38));
    this.baseAlpha = Math.min(1, 0.62 * Math.pow(B_PARTICLES_HIGH / n, 0.4));
    this.pu.uAlpha.value = this.baseAlpha;
    // glifos: en baja calidad, una sola corriente por columna
    const low = n < 16000;
    this.glyphs.geometry.setDrawRange(0, low ? this.glyphTotal / 2 : this.glyphTotal);
  }

  /** 0..1 cuanto se ve la B (0 oculta o hecha polvo) */
  get presence(): number {
    return this.group.visible ? 1 - this.dissolve : 0;
  }

  get particleCount(): number {
    return this.points.geometry.drawRange.count;
  }
  get glyphCount(): number {
    return this.glyphs.geometry.drawRange.count;
  }

  setMode(mode: BMode, travelDir = 1): void {
    this.shared.uTravelDir.value = travelDir;
    if (mode === 'hidden') {
      this.mode = 'hidden';
      this.dissolve = 1;
      this.dTarget = 1;
      this.group.visible = false;
      return;
    }
    if (mode === 'dissolved') {
      if (this.mode === 'hidden') return;
      this.mode = 'dissolved';
      this.dTarget = 1;
      this.dRate = 1 / B_DISSOLVE_S;
      return;
    }
    this.mode = 'assembled';
    this.dTarget = 0;
    this.dRate = 1 / B_ASSEMBLE_S;
    this.group.visible = true;
  }

  /**
   * @param layout posicion/altura de la B en mundo (ya con el desplazamiento de viaje)
   * @param bpx alto de la B en px CSS en pantalla
   */
  update(
    dt: number,
    time: number,
    camera: PerspectiveCamera,
    ptr: BPointer,
    layout: { x: number; y: number; z: number; h: number },
    bpx: number,
    dpr: number,
  ): void {
    // disolucion
    if (this.dissolve !== this.dTarget) {
      const step = this.dRate * dt;
      this.dissolve = this.dTarget > this.dissolve ? Math.min(this.dTarget, this.dissolve + step) : Math.max(this.dTarget, this.dissolve - step);
      if (this.dissolve >= 1 && this.dTarget >= 1) this.group.visible = false;
    }
    if (!this.group.visible) return;
    this.shared.uDissolve.value = this.dissolve;
    this.shared.uTime.value = time;

    this.group.position.set(layout.x, layout.y, layout.z);
    this.group.scale.setScalar(layout.h);

    // centro de la B en NDC para orientar el giro
    tmpV.set(layout.x, layout.y, layout.z).project(camera);
    const dx = ptr.x - tmpV.x;
    const dy = ptr.y - tmpV.y;
    const k = 1 - Math.pow(1 - B_TILT_LERP, dt * 60);
    const ty = Math.max(-1, Math.min(1, dx * 1.15)) * B_MAX_TILT + Math.sin(time * 0.31) * 0.035;
    const tp = -Math.max(-1, Math.min(1, dy * 1.15)) * B_MAX_TILT * 0.9 + Math.sin(time * 0.23 + 1) * 0.025;
    // dos etapas en cascada: arranca con velocidad cero, se siente con peso
    this.yaw1 += (ty - this.yaw1) * k;
    this.pitch1 += (tp - this.pitch1) * k;
    this.yaw += (this.yaw1 - this.yaw) * k;
    this.pitch += (this.pitch1 - this.pitch) * k;
    this.group.rotation.set(this.pitch, this.yaw, 0);
    this.group.updateMatrixWorld(true);

    // cursor al plano local de la B
    let lx = 9;
    let ly = 9;
    let hit = false;
    if (ptr.active) {
      camera.updateMatrixWorld();
      ray.origin.setFromMatrixPosition(camera.matrixWorld);
      ray.direction.set(ptr.x, ptr.y, 0.5).unproject(camera).sub(ray.origin).normalize();
      tmpN.set(0, 0, 1).applyQuaternion(this.group.quaternion);
      plane.setFromNormalAndCoplanarPoint(tmpN, this.group.position);
      if (ray.intersectPlane(plane, tmpV)) {
        this.group.worldToLocal(tmpV);
        lx = tmpV.x;
        ly = tmpV.y;
        hit = true;
      }
    }
    const dist = Math.hypot(lx, ly);
    const near = hit ? 1 - smooth(0.7, 1.3, dist) : 0;

    // velocidad del cursor en alturas de B por segundo
    if (hit && this.hasLast && dt > 0) {
      const vx = (lx - this.lastLocal.x) / dt;
      const vy = (ly - this.lastLocal.y) / dt;
      const kv = 1 - Math.pow(1 - 0.18, dt * 60);
      this.vel.x += (Math.max(-4, Math.min(4, vx)) - this.vel.x) * kv;
      this.vel.y += (Math.max(-4, Math.min(4, vy)) - this.vel.y) * kv;
    } else {
      this.vel.multiplyScalar(Math.pow(0.9, dt * 60));
    }
    if (hit) {
      this.lastLocal.set(lx, ly);
      this.hasLast = true;
    } else this.hasLast = false;
    const speed = this.vel.length();
    this.speedS += (speed - this.speedS) * (1 - Math.pow(0.85, dt * 60));

    const sdt = Math.min(dt, 1 / 30);
    if (hit) {
      // si el cursor estaba lejos, el centro del remolino salta (no cruza la B)
      if (this.hover.x < 0.02 && Math.abs(this.cx.x - lx) + Math.abs(this.cy.x - ly) > 0.6) {
        this.cx.x = lx;
        this.cy.x = ly;
        this.cx.v = this.cy.v = 0;
      }
      this.cx.step(lx, sdt);
      this.cy.step(ly, sdt);
    }
    this.hover.step(near, sdt);
    this.swirl.step(1.1 + Math.min(this.speedS * 0.55, 2.3), sdt);

    (this.shared.uCursor.value as Vector2).set(this.cx.x, this.cy.x);
    (this.shared.uCursorVel.value as Vector2).copy(this.vel);
    this.shared.uHover.value = this.hover.x;
    this.shared.uSwirl.value = this.swirl.x;
    // el cursor adelgaza la silueta localmente: se compensa con mas alfa global
    const hv = smooth(0.2, 0.8, this.hover.x);
    this.pu.uAlpha.value = Math.min(1, this.baseAlpha * (1 + 0.25 * hv));

    const scale = Math.max(0.6, Math.min(1.6, bpx / 420));
    this.pu.uPxScale.value = dpr * scale;
    this.gu.uCellPx.value = (bpx / GLYPH_ROWS) * dpr * 0.95;
    this.hu.uAlpha.value = 0.38 * (1 - this.dissolve) * (0.85 + 0.15 * Math.sin(time * 0.8));
  }

  /** Estado para diagnostico */
  debug(): { hover: number; swirl: number; dissolve: number; yawDeg: number; pitchDeg: number } {
    return {
      hover: this.hover.x,
      swirl: this.swirl.x,
      dissolve: this.dissolve,
      yawDeg: (this.yaw * 180) / Math.PI,
      pitchDeg: (this.pitch * 180) / Math.PI,
    };
  }

  dispose(): void {
    for (const t of this.textures) t.dispose();
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.glyphs.geometry.dispose();
    this.glyphs.material.dispose();
    this.halo.geometry.dispose();
    this.halo.material.dispose();
  }
}

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

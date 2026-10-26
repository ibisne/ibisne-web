/**
 * Pase de post-proceso: solo corre mientras la camara se mueve o hay glitch. La escena
 * se pinta a un render target y un triangulo a pantalla completa la compone con
 * aberracion cromatica, estela direccional y un vortice leve (proporcionales a la
 * velocidad), con el glitch global (rebanadas, RGB, macrobloques, lineas; ver glitch.ts) y
 * con el glitch local del mouse (estela; ver trail.ts) y con los micro-glitches (rectangulos
 * chicos de la imagen; ver micro.ts). En reposo, entre rafagas, sin micro-glitch vivo y con el
 * mouse quieto se pinta directo a pantalla (cero costo extra).
 */
import {
  BufferAttribute,
  BufferGeometry,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
} from 'three';
import type { Camera, IUniform, WebGLRenderer } from 'three';
import {
  CYAN,
  GLITCH_BLOCK_ZONES,
  GLITCH_RGB,
  GLITCH_SLICE_SHIFT,
  GLITCH_TRAIL_BAND_MAX_PX,
  GLITCH_TRAIL_BAND_MIN_PX,
  GLITCH_TRAIL_POINTS,
  GLITCH_TRAIL_RADIUS_PX,
  GLITCH_TRAIL_RGB_PX,
  GLITCH_TRAIL_SHIFT_PX,
  MAGENTA,
  MICRO_GLITCH_SLOTS,
  POST_MOSAIC,
} from './config';
import type { MicroGlitch } from './micro';
import type { MouseTrail } from './trail';
import { postFrag, postVert } from './shaders';

export class TravelPass {
  private rt: WebGLRenderTarget;
  private scene = new Scene();
  private cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private mesh: Mesh<BufferGeometry, ShaderMaterial>;
  private u: Record<string, IUniform>;
  taps = 7;

  constructor() {
    this.rt = new WebGLRenderTarget(2, 2, {
      depthBuffer: false,
      stencilBuffer: false,
      format: RGBAFormat,
      type: UnsignedByteType,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      generateMipmaps: false,
    });
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    g.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
    this.u = {
      tScene: { value: this.rt.texture },
      uRes: { value: new Vector2(1, 1) },
      uSpeed: { value: 0 },
      uZoom: { value: 0 },
      uDir: { value: 1 },
      uTaps: { value: this.taps },
      uMosaic: { value: POST_MOSAIC ? 1 : 0 },
      uGlitch: { value: 0 },
      uGSeed: { value: 0 },
      uGLines: { value: 0 },
      uGlitchK: { value: new Vector3(GLITCH_SLICE_SHIFT, GLITCH_RGB, GLITCH_BLOCK_ZONES) },
      uMTrail: { value: Array.from({ length: GLITCH_TRAIL_POINTS }, () => new Vector3()) },
      uMAmp: { value: 0 },
      uMSeed: { value: 0 },
      uMK: { value: new Vector4() },
      uMBand: { value: GLITCH_TRAIL_BAND_MAX_PX / GLITCH_TRAIL_BAND_MIN_PX },
      uMicro: { value: Array.from({ length: MICRO_GLITCH_SLOTS }, () => new Vector4()) },
      uMicroK: { value: Array.from({ length: MICRO_GLITCH_SLOTS }, () => new Vector4()) },
      uMicroOn: { value: 0 },
      uCyan: { value: new Vector3(...CYAN) },
      uMagenta: { value: new Vector3(...MAGENTA) },
    };
    this.mesh = new Mesh(
      g,
      new ShaderMaterial({
        uniforms: this.u,
        vertexShader: postVert,
        fragmentShader: postFrag,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  /** w, h en px del buffer; dpr para pasar las medidas del glitch del mouse de px CSS a buffer */
  setSize(w: number, h: number, dpr = 1): void {
    this.rt.setSize(Math.max(2, w), Math.max(2, h));
    (this.u.uRes.value as Vector2).set(w, h);
    (this.u.uMK.value as Vector4).set(
      GLITCH_TRAIL_RADIUS_PX * dpr,
      GLITCH_TRAIL_SHIFT_PX * dpr,
      GLITCH_TRAIL_RGB_PX * dpr,
      GLITCH_TRAIL_BAND_MIN_PX * dpr,
    );
  }

  render(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    speed: number,
    zoom: number,
    dir: number,
    glitch: { level: number; seed: number; lines: number },
    trail: MouseTrail,
    micro: MicroGlitch,
  ): void {
    this.u.uSpeed.value = speed;
    this.u.uZoom.value = zoom;
    this.u.uDir.value = dir;
    // sin viaje la estela no existe: una sola muestra (rafaga de glitch en reposo)
    this.u.uTaps.value = speed > 0.004 || zoom > 0.004 ? this.taps : 1;
    this.u.uGlitch.value = glitch.level;
    this.u.uGSeed.value = glitch.seed;
    this.u.uGLines.value = glitch.lines;
    this.u.uMTrail.value = trail.points;
    this.u.uMAmp.value = trail.amp;
    this.u.uMSeed.value = trail.seed;
    this.u.uMicro.value = micro.rects;
    this.u.uMicroK.value = micro.params;
    this.u.uMicroOn.value = micro.active > 0 ? 1 : 0;
    renderer.setRenderTarget(this.rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.cam);
  }

  /** Compila el programa del pase y reserva su render target (el primer viaje no tropieza con eso) */
  compile(renderer: WebGLRenderer): Promise<unknown> {
    renderer.initRenderTarget(this.rt);
    return renderer.compileAsync(this.scene, this.cam);
  }

  /** Pinta el pase una vez en un target diminuto: sube buffers y enlaza el programa sin tocar el canvas */
  probe(renderer: WebGLRenderer, target: WebGLRenderTarget): void {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.cam);
  }

  dispose(): void {
    this.rt.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

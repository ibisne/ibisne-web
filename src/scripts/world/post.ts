/**
 * Pase de viaje: solo corre mientras la camara se mueve. La escena se pinta a un
 * render target y un triangulo a pantalla completa la compone con aberracion
 * cromatica, estela direccional y un vortice leve, proporcionales a la velocidad.
 * En reposo se pinta directo a pantalla (cero costo extra).
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
  WebGLRenderTarget,
} from 'three';
import type { Camera, IUniform, WebGLRenderer } from 'three';
import { POST_MOSAIC } from './config';
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

  setSize(w: number, h: number): void {
    this.rt.setSize(Math.max(2, w), Math.max(2, h));
    (this.u.uRes.value as Vector2).set(w, h);
  }

  render(renderer: WebGLRenderer, scene: Scene, camera: Camera, speed: number, zoom: number, dir: number): void {
    this.u.uSpeed.value = speed;
    this.u.uZoom.value = zoom;
    this.u.uDir.value = dir;
    this.u.uTaps.value = this.taps;
    renderer.setRenderTarget(this.rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.cam);
  }

  dispose(): void {
    this.rt.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

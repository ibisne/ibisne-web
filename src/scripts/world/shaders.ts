/**
 * GLSL del mundo. Cadenas estaticas: three las compila con la API de WebGL
 * (no hay eval ni new Function; la CSP sin 'unsafe-eval' no aplica a shaders).
 * Todo el color se trabaja en espacio sRGB (gestion de color de three apagada),
 * igual que el CSS: sumar = mix-blend-mode plus/screen aproximado.
 */

/* ---------------- Capas de imagen ---------------- */

export const layerVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Defines: MODE_FAR (opaca con bruma), MODE_ADD (sobre negro, se suma),
 * MODE_ALPHA (con transparencia).
 */
export const layerFrag = /* glsl */ `
uniform sampler2D uMap;
uniform float uRepeat;
uniform vec2 uCenter;   // centro de la ventana en el panorama (u, v)
uniform vec2 uSpan;     // tamano de la ventana (u, v)
uniform float uBright;
uniform float uGlow;    // luz extra alrededor del cursor
uniform vec2 uGlowPos;  // cursor en uv de pantalla
uniform vec2 uRes;
uniform vec3 uHaze;
uniform float uHazeAmt;
uniform float uDim;
uniform float uAlpha;
uniform float uTime;
uniform vec3 uClear;     // zona despejada alrededor de la B: x, y (uv de pantalla), radio
uniform float uClearAmt;
varying vec2 vUv;

void main() {
  vec2 uv = uCenter + (vUv - 0.5) * uSpan;
  // espejo: el arte se repite sin costura
  float tx = 1.0 - abs(mod(uv.x * uRepeat, 2.0) - 1.0);
  vec4 tex = texture2D(uMap, vec2(tx, clamp(uv.y, 0.001, 0.999)));
  vec2 s = gl_FragCoord.xy / uRes;
  vec2 dg = (s - uGlowPos) * vec2(uRes.x / uRes.y, 1.0);
  float g = exp(-dot(dg, dg) / 0.11);
  vec2 dc = (s - uClear.xy) * vec2(uRes.x / uRes.y, 1.0);
  float clearM = 1.0 - uClearAmt * exp(-dot(dc, dc) / max(uClear.z * uClear.z, 1e-4));
  vec3 col = tex.rgb;

#ifdef MODE_FAR
  col = mix(col, uHaze, uHazeAmt);
  // banda de bruma en el horizonte
  float band = exp(-pow((uv.y - 0.4) / 0.16, 2.0));
  col += uHaze * band * 0.35;
  col *= uBright + uGlow * g;
  gl_FragColor = vec4(col * uDim, 1.0);
#endif

#ifdef MODE_ADD
  // respiracion lenta de la luz de la ciudad
  float breathe = 0.92 + 0.08 * sin(uTime * 0.6 + uv.x * 9.0);
  col *= (uBright * breathe + uGlow * g);
  col += uHaze * uHazeAmt * tex.rgb;
  gl_FragColor = vec4(col * uDim * uAlpha * clearM, 1.0);
#endif

#ifdef MODE_ALPHA
  col *= uBright + uGlow * g;
  gl_FragColor = vec4(col * uDim * clearM, tex.a * uAlpha);
#endif
}
`;

/* ---------------- Flujo y desplazamiento compartidos por la B ---------------- */

const bCommon = /* glsl */ `
uniform float uTime;
uniform vec2 uCursor;     // cursor en espacio local de la B (alturas de B)
uniform vec2 uCursorVel;
uniform float uHover;     // 0..1 (resorte: puede pasarse de 1 o bajar de 0)
uniform float uSwirl;     // angulo del remolino en el centro (rad)
uniform float uRadius;
uniform float uDissolve;  // 0 armada, 1 polvo
uniform float uTravelDir; // -1 o 1

// rizo analitico de un potencial de senos (divergencia cero, barato)
vec2 flow(vec2 p, float t) {
  float a = 1.3 * p.x + t;
  float b = 1.7 * p.y - 0.8 * t;
  float e = 2.9 * p.x + 2.1 * p.y - 1.3 * t;
  float dx = 1.3 * cos(a) * cos(b) + 1.45 * cos(e);
  float dy = -1.7 * sin(a) * sin(b) + 1.05 * cos(e);
  return vec2(dy, -dx);
}

vec3 bDisplace(vec3 p, float seed, out float f) {
  vec2 q = p.xy;
  q += flow(q * 5.0 + seed * 3.0, uTime * 0.35) * 0.0045;
  vec2 d = q - uCursor;
  float r2 = dot(d, d);
  f = uHover * exp(-r2 / (uRadius * uRadius));
  float ang = uSwirl * f * (0.65 + 0.7 * seed);
  float s = sin(ang);
  float c = cos(ang);
  d = mat2(c, s, -s, c) * d;
  d *= 1.0 + f * 0.9;
  q = uCursor + d;
  q += flow(q * 7.0 + seed, uTime * 0.9) * f * 0.09;
  q += uCursorVel * f * 0.06;
  // golpe de gas: empuje radial proporcional a la velocidad del cursor
  float sp = min(length(uCursorVel), 4.0);
  q += (d / max(length(d), 1e-4)) * f * sp * 0.05;
  float z = p.z + f * (seed - 0.35) * 0.9;
  return vec3(q, z);
}

float dissolveAmt(float stagger) {
  float s = clamp(uDissolve * 1.6 - stagger * 0.6, 0.0, 1.0);
  return s * s * (3.0 - 2.0 * s);
}
`;

/* ---------------- Particulas de la B ---------------- */

export const bVert = /* glsl */ `
${bCommon}
uniform float uPxScale;   // dpr * escala de la B en pantalla
uniform float uDensity;   // compensa tamano cuando hay menos particulas
uniform float uAlpha;
uniform vec3 uCyan;
uniform vec3 uMagenta;
attribute vec4 aRand;     // x semilla, y escalonado, z tipo, w fase
attribute vec3 aScatter;
attribute float aEdge;    // 1 = contorno
varying vec3 vColor;
varying float vAlpha;

void main() {
  float f;
  vec3 p = bDisplace(position, aRand.x, f);
  float s = dissolveAmt(aRand.y);
  p += aScatter * s * (0.5 + aRand.w * 1.2);
  p.x += uTravelDir * s * s * (1.4 + aRand.z * 3.0);
  p.y += (aRand.w - 0.5) * s * 0.4;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float kind = aRand.z;
  float base = kind > 0.95 ? 4.2 : (kind > 0.72 ? 2.6 : 1.7);
  gl_PointSize = max(1.0, base * uPxScale * uDensity * (1.0 + aEdge * 0.2) * (1.0 + f * 0.3) * (1.0 - s * 0.35));

  float tw = 0.5 + 0.5 * sin(uTime * (0.7 + aRand.w * 2.4) + aRand.y * 40.0);
  tw = kind > 0.95 ? mix(0.25, 1.0, tw * tw * tw) : mix(0.55, 1.0, tw);

  float g = clamp(0.5 - position.y * 0.95 + (aRand.w - 0.5) * 0.7, 0.0, 1.0);
  vec3 col = mix(uCyan, uMagenta, step(0.6, g + (aRand.x - 0.5) * 0.35));
  col = kind > 0.9 ? mix(col, vec3(1.0), 0.75) : col;
  // el cursor enciende
  col = mix(col, vec3(1.0), clamp(f * 0.2, 0.0, 0.25));

  float fade = 1.0 - smoothstep(0.7, 1.0, uDissolve) ;
  vAlpha = uAlpha * tw * (1.0 + aEdge * 0.9) * (1.0 + f * 0.4) * (1.0 - s * 0.55) * fade;
  vColor = col;
}
`;

export const bFrag = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor, a * a * vAlpha);
}
`;

/* ---------------- Glifos que llueven dentro de la B ---------------- */

export const glyphVert = /* glsl */ `
${bCommon}
uniform sampler2D uMask;
uniform float uCell;
uniform float uRows;
uniform float uAspect;
uniform float uTrail;
uniform float uFrontZ;
uniform float uCellPx;
uniform float uAlpha;
attribute vec4 aG;         // x columna, y indice en la estela, z semilla, w corriente
varying float vA;
varying float vHead;
varying vec2 vCell;

float h1(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  float speed = 5.0 + aG.z * 8.0;
  float cycle = uRows + uTrail + 6.0;
  float head = floor(mod(uTime * speed + aG.z * 97.0 + aG.w * cycle * 0.5, cycle)) - 3.0;
  float row = head - aG.y;
  float x = (aG.x + 0.5) * uCell - uAspect * 0.5;
  float y = 0.5 - (row + 0.5) * uCell;
  vec2 muv = vec2(x / uAspect + 0.5, y + 0.5);
  float inside = 0.0;
  if (muv.y > 0.0 && muv.y < 1.0) inside = step(0.5, texture2D(uMask, muv).a);

  float f;
  vec3 p = bDisplace(vec3(x, y, uFrontZ), aG.z, f);
  float s = dissolveAmt(aG.z);
  p.x += uTravelDir * s * s * (1.6 + aG.z * 2.5);
  p.y += (aG.z - 0.5) * s * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uCellPx;

  float trail = pow(1.0 - aG.y / uTrail, 1.5);
  float fade = 1.0 - smoothstep(0.5, 0.9, uDissolve);
  vA = inside * trail * uAlpha * fade * (1.0 + f * 0.6);
  vHead = aG.y < 0.5 ? 1.0 : 0.0;
  float gi = floor(h1(vec2(aG.x * 7.0 + row, floor(uTime * (1.5 + aG.z * 4.0)) + aG.w * 13.0)) * 64.0);
  vCell = vec2(mod(gi, 8.0), floor(gi / 8.0));
}
`;

export const glyphFrag = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uCyan;
varying float vA;
varying float vHead;
varying vec2 vCell;
void main() {
  vec2 uv = (vCell + gl_PointCoord) / 8.0;
  float a = texture2D(uAtlas, uv).a;
  vec3 col = mix(uCyan, vec3(1.0), vHead);
  gl_FragColor = vec4(col, a * vA * (vHead > 0.5 ? 1.0 : 0.8));
}
`;

/* ---------------- Halo de la B ---------------- */

export const haloVert = layerVert;
export const haloFrag = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uCyan;
uniform vec3 uMagenta;
uniform float uAlpha;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 e = smoothstep(0.0, 0.22, vUv) * smoothstep(1.0, 0.78, vUv);
  float a = texture2D(uMap, vUv).a * e.x * e.y;
  vec3 col = mix(uMagenta, uCyan, smoothstep(0.15, 0.85, vUv.y + 0.15 * sin(uTime * 0.4)));
  gl_FragColor = vec4(col, a * uAlpha);
}
`;

/* ---------------- Polvo y escombros ---------------- */

export const dustVert = /* glsl */ `
uniform float uTime;
uniform float uP;          // posicion en el panorama
uniform float uTanHalf;
uniform float uAspect;
uniform float uPxPerUnit;  // px de dibujo por unidad a distancia 1
uniform vec3 uLam;         // viewports por unidad de panorama: lejana, media, cercana
uniform vec3 uInvD;        // 1/profundidad de lejana, media, cercana
uniform float uSpeed;
uniform float uDim;
attribute vec4 aD;         // x, y (0..1), profundidad, semilla
varying float vA;
varying float vShard;
varying float vSpin;
varying vec3 vColor;

float lambdaAt(float d) {
  float k = 1.0 / d;
  if (k <= uInvD.y) return mix(uLam.x, uLam.y, clamp((k - uInvD.x) / (uInvD.y - uInvD.x), 0.0, 1.0));
  return mix(uLam.y, uLam.z, clamp((k - uInvD.y) / (uInvD.z - uInvD.y), 0.0, 1.5));
}

void main() {
  float d = aD.z;
  float seed = aD.w;
  float hh = d * uTanHalf;
  float hw = hh * uAspect;
  float W = hw * 2.0 * 1.35;
  float shift = -uP * lambdaAt(d) * hw * 2.0;
  float drift = uTime * (0.012 + seed * 0.03) * hw;
  float x = mod(aD.x * W + shift + drift, W) - W * 0.5;
  float yf = fract(aD.y + uTime * 0.004 * (0.4 + seed));
  float y = (yf - 0.5) * hh * 2.3 + sin(uTime * (0.25 + seed * 0.4) + seed * 30.0) * hh * 0.03;
  vec4 mv = modelViewMatrix * vec4(x, y, -d, 1.0);
  gl_Position = projectionMatrix * mv;

  vShard = step(0.86, seed);
  float worldSize = vShard > 0.5 ? 0.03 : 0.011;
  float near = 1.0 - smoothstep(1.5, 4.5, d);
  worldSize *= 1.0 + near * 2.4;
  gl_PointSize = clamp(worldSize * uPxPerUnit / -mv.z, 1.0, 56.0);

  float tw = 0.6 + 0.4 * sin(uTime * (0.5 + seed * 1.7) + seed * 50.0);
  float fog = exp(-d * 0.06);
  float edge = smoothstep(0.0, 0.08, yf) * smoothstep(1.0, 0.92, yf);
  vA = (0.25 + 0.6 * fog) * tw * edge * (1.0 - near * 0.35) * uDim * (1.0 + uSpeed * 0.8);
  vSpin = seed * 40.0 + uTime * (0.3 + seed);
  vColor = seed < 0.18 ? vec3(1.0, 0.45, 0.78) : mix(vec3(0.62, 0.92, 1.0), vec3(0.95, 0.95, 1.0), fract(seed * 7.0));
}
`;

export const dustFrag = /* glsl */ `
varying float vA;
varying float vShard;
varying float vSpin;
varying vec3 vColor;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float a;
  if (vShard > 0.5) {
    float s = sin(vSpin);
    float c = cos(vSpin);
    q = mat2(c, s, -s, c) * q;
    vec2 e = abs(q) * vec2(1.0, 2.2);
    a = smoothstep(0.32, 0.22, max(e.x, e.y)) * 0.85;
  } else {
    a = smoothstep(0.5, 0.0, length(q));
    a *= a;
  }
  gl_FragColor = vec4(vColor, a * vA);
}
`;

/* ---------------- Pase de viaje: aberracion, estela y vortice ---------------- */

export const postVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const postFrag = /* glsl */ `
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uSpeed;   // 0..1 velocidad lateral
uniform float uZoom;    // 0..1 velocidad en Z
uniform float uDir;     // -1 o 1
uniform int uTaps;
uniform float uMosaic;  // 0 apagado, 1 mosaico por teselas
varying vec2 vUv;

float hash1(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

void main() {
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 c = (vUv - 0.5) * asp;
  float r = length(c);
  // vortice leve, mas fuerte al centro
  float ang = uDir * uSpeed * 0.35 * (1.0 - smoothstep(0.0, 1.0, r));
  float sn = sin(ang);
  float cs = cos(ang);
  c = mat2(cs, sn, -sn, cs) * c;
  c *= 1.0 - uZoom * 0.05 * r;
  vec2 uv = c / asp + 0.5;

  if (uMosaic > 0.5) {
    float cell = mix(1.0, 40.0, smoothstep(0.55, 1.0, uSpeed));
    vec2 g = floor(uv * uRes / cell);
    float h = fract(sin(dot(g, vec2(12.9898, 78.233))) * 43758.5453);
    uv = mix(uv, (g + 0.5) * cell / uRes, step(h, smoothstep(0.5, 1.0, uSpeed) * 0.85));
    uv.x += uDir * (hash1(floor(uv.y * 28.0)) - 0.5) * 0.03 * smoothstep(0.6, 1.0, uSpeed);
  }

  vec2 dir = vec2(uDir, 0.0);
  vec2 ab = dir * uSpeed * 0.014 + (uv - 0.5) * (uSpeed + uZoom) * 0.01;
  vec2 bl = dir * uSpeed * 0.04 + (uv - 0.5) * uZoom * 0.04;
  vec3 acc = vec3(0.0);
  float n = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uTaps) break;
    float t = float(i) / max(float(uTaps - 1), 1.0) - 0.5;
    vec2 o = uv + bl * t;
    acc.r += texture2D(tScene, o + ab).r;
    acc.g += texture2D(tScene, o).g;
    acc.b += texture2D(tScene, o - ab).b;
    n += 1.0;
  }
  gl_FragColor = vec4(acc / n, 1.0);
}
`;

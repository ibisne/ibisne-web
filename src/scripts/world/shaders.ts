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
uniform float uGather;    // entrada: 1 dispersa por la pantalla, 0 la B
uniform vec2 uSpread;     // media pantalla en alturas de B
uniform vec2 uSpreadC;    // centro de la pantalla relativo a la B

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

// Entrada: cuanto sigue dispersa una pieza segun su distancia al centro (r 0..1, 1 = borde).
// Las de afuera se ordenan primero.
float gatherAmt(float r) {
  float k = clamp((1.0 - uGather) * 1.7 - (1.0 - r) * 0.7, 0.0, 1.0);
  return 1.0 - k * k * (3.0 - 2.0 * k);
}

// posicion dispersa: h en [-1, 1]^2 sobre toda la pantalla, con deriva lenta y un giro que
// se cierra al ordenarse (espiral hacia la B)
vec3 spreadPos(vec2 h, float z, float seed, float g) {
  vec2 q = uSpreadC + h * uSpread;
  q += flow(q * 0.9 + seed * 5.0, uTime * 0.22) * 0.035;
  float a = (1.0 - g) * (0.9 + seed * 0.6);
  float s = sin(a);
  float c = cos(a);
  return vec3(mat2(c, s, -s, c) * q, z);
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

  // entrada: dispersa por toda la pantalla -> la B
  float gk = 0.0;
  if (uGather > 0.0) {
    vec2 h = vec2(fract(aRand.x * 7.31 + aRand.w * 3.17), fract(aRand.y * 5.13 + aRand.x * 9.71)) * 2.0 - 1.0;
    gk = gatherAmt(length(h) * 0.7071);
    p = mix(p, spreadPos(h, (aRand.w - 0.5) * 0.8, aRand.x, gk), gk);
  }

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
  vAlpha = uAlpha * tw * (1.0 + aEdge * 0.9 * (1.0 - gk)) * (1.0 + f * 0.4) * (1.0 - s * 0.55) * fade * (1.0 + 0.3 * gk);
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

  // entrada: lluvia por toda la pantalla mientras esta dispersa; al ordenarse cada glifo se
  // apaga en su columna y reaparece dentro de la B (nunca cruza la pantalla encendido)
  float gk = 0.0;
  float rainA = 1.0;
  if (uGather > 0.0) {
    float cols = floor(uAspect / uCell);
    vec2 h = vec2(((aG.x + 0.5) / cols) * 2.0 - 1.0 + (aG.w - 1.0) * (0.66 / cols), y * 2.0);
    gk = gatherAmt(length(vec2(h.x, clamp(h.y, -1.0, 1.0))) * 0.7071);
    if (gk > 0.5) {
      p = vec3(uSpreadC + h * uSpread, uFrontZ);
      inside = 1.0;
      rainA = (gk - 0.5) * 2.0 * 0.7;
    } else {
      rainA = 1.0 - gk * 2.0;
    }
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uCellPx;

  float trail = pow(1.0 - aG.y / uTrail, 1.5);
  float fade = 1.0 - smoothstep(0.5, 0.9, uDissolve);
  vA = inside * trail * uAlpha * fade * (1.0 + f * 0.6) * rainA;
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

/* ---------------- Pase de post-proceso: viaje (aberracion, estela, vortice) y glitch ---------------- */

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
uniform float uGlitch;  // 0..1 intensidad del glitch (0 = limpio)
uniform float uGSeed;   // semilla del tramo (cambia cada 35-70 ms)
uniform float uGLines;  // 0..1 lineas de escaneo
uniform vec3 uGlitchK;  // GLITCH_SLICE_SHIFT, GLITCH_RGB, GLITCH_BLOCK_ZONES
uniform vec3 uMTrail[6]; // glitch del mouse: estela (xy en uv de pantalla, z peso); 0 = cursor
uniform float uMAmp;     // 0..1 intensidad por velocidad (0 = sin glitch del mouse)
uniform float uMSeed;
uniform vec4 uMK;        // radio, corte, RGB y alto minimo de rebanada, en px del buffer
uniform float uMBand;    // alto maximo / minimo de rebanada
uniform vec4 uMicro[4];  // micro-glitches: rectangulo x0, y0, x1, y1 en px del buffer
uniform vec4 uMicroK[4]; // desplazamiento px, RGB px, semilla, intensidad (0 = apagado)
uniform float uMicroOn;  // 1 si hay alguno vivo
uniform vec3 uCyan;
uniform vec3 uMagenta;
varying vec2 vUv;

float hash1(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
float hash2(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

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

  // glitch: rebanadas horizontales desplazadas, macrobloques en pocas zonas, RGB y lineas
  float gAb = 0.0;
  float gSign = 1.0;
  vec3 gAdd = vec3(0.0);
  if (uGlitch > 0.001) {
    float s = uGSeed;
    float nb = 3.0 + floor(hash1(s * 1.7) * 6.0); // 3..8 rebanadas
    float shift = 0.0;
    float inAny = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      if (fi >= nb) break;
      float y0 = hash1(s + fi * 3.17);
      float hg = mix(0.004, 0.075, pow(hash1(s + fi * 7.73), 2.2)); // alto variable
      float inb = step(y0, vUv.y) * step(vUv.y, y0 + hg);
      shift += inb * (hash1(s + fi * 13.31) * 2.0 - 1.0);
      inAny = max(inAny, inb);
    }
    uv.x += clamp(shift, -1.0, 1.0) * uGlitchK.x * uGlitch;
    gSign = hash1(s * 4.9) > 0.5 ? 1.0 : -1.0;
    gAb = uGlitchK.y * uGlitch * (0.3 + 0.7 * inAny);

    // macrobloques: bloques de 16-40 px (a 900 de alto) en zonas chicas; pixelan y saltan
    float bs = mix(16.0, 40.0, hash1(s * 2.3)) * max(uRes.y / 900.0, 0.5);
    vec2 px = vUv * uRes;
    vec2 cell = floor(px / bs);
    float zone = hash2(floor(cell / 6.0) + s);
    float on = step(1.0 - uGlitchK.z * uGlitch, zone) * step(0.4, hash2(cell + s * 1.3));
    vec2 q = (cell + 0.5) * bs / uRes;
    q.x += floor((hash2(cell + s * 2.1) - 0.5) * 4.0) * bs / uRes.x;
    uv = mix(uv, q, on);
    gAb += on * uGlitchK.y * uGlitch * 0.6;

    // 1-2 lineas de escaneo finas, en un tramo del ancho
    if (uGLines > 0.0) {
      float lw = 1.25 / uRes.y;
      float y1 = hash1(s * 5.1);
      float y2 = hash1(s * 9.7);
      float x1 = hash1(s * 6.3) * 0.6;
      float x2 = hash1(s * 8.9) * 0.6;
      float l1 = (1.0 - smoothstep(0.0, lw, abs(vUv.y - y1))) * step(x1, vUv.x) * step(vUv.x, x1 + 0.4 + hash1(s * 3.3) * 0.4);
      float l2 = step(0.5, hash1(s * 8.3)) * (1.0 - smoothstep(0.0, lw, abs(vUv.y - y2))) * step(x2, vUv.x) * step(vUv.x, x2 + 0.3 + hash1(s * 2.7) * 0.4);
      gAdd = (uCyan * l1 + uMagenta * l2) * 0.42 * uGLines * uGlitch;
    }
  }

  // micro-glitches: rectangulos chicos de la escena desplazados en X con RGB separado, en
  // 1-3 sub-filas con corte propio; solo dentro de su rectangulo (bordes duros, como senal)
  if (uMicroOn > 0.5) {
    vec2 p = vUv * uRes;
    for (int i = 0; i < 4; i++) {
      vec4 R = uMicro[i];
      vec4 K = uMicroK[i];
      if (K.w <= 0.0) continue;
      if (p.x < R.x || p.x >= R.z || p.y < R.y || p.y >= R.w) continue;
      float rows = 1.0 + floor(hash1(K.z * 1.9) * 3.0);
      float sub = floor((p.y - R.y) / max(R.w - R.y, 1.0) * rows);
      float hs = hash1(sub * 5.31 + K.z) * 2.0 - 1.0;
      // cada sub-fila con su propio largo: borde derecho irregular
      float cut = mix(0.55, 1.0, hash1(sub * 2.17 + K.z * 0.7));
      if (p.x > mix(R.x, R.z, cut)) continue;
      float sh = sign(hs) * (0.4 + 0.6 * abs(hs)) * K.x;
      uv.x += sh / uRes.x;
      gAb = max(gAb, K.y / uRes.x);
      gAdd += mix(uCyan, uMagenta, step(0.5, hash1(sub + K.z * 3.3))) * 0.07 * K.w;
    }
  }

  // glitch local del mouse: rebanadas cortas desplazadas y RGB dentro de una capsula alrededor
  // del cursor y de su estela de los ultimos ~150 ms (no toca el resto de la pantalla)
  if (uMAmp > 0.001) {
    vec2 p = vUv * uRes;
    float m = 0.0;
    for (int i = 0; i < 5; i++) {
      vec2 a = uMTrail[i].xy * uRes;
      vec2 sg = uMTrail[i + 1].xy * uRes - a;
      float l2 = dot(sg, sg);
      float h = l2 > 0.5 ? clamp(dot(p - a, sg) / l2, 0.0, 1.0) : 0.0;
      float d = length(p - a - sg * h);
      float w = mix(uMTrail[i].z, uMTrail[i + 1].z, h);
      m = max(m, w * (1.0 - smoothstep(0.25, 1.0, d / uMK.x)));
    }
    m *= uMAmp;
    if (m > 0.002) {
      float s = uMSeed;
      // alto de rebanada por tramo; tramos horizontales cortos (6-14 altos de rebanada)
      float bh = uMK.w * mix(1.0, uMBand, hash1(s * 3.7));
      float row = floor(p.y / bh);
      float col = floor(p.x / (bh * mix(6.0, 14.0, hash1(row * 0.71 + s))));
      float on = step(1.0 - (0.35 + 0.45 * min(m * 1.4, 1.0)), hash1(row * 1.37 + s * 0.11));
      on *= step(0.25, hash2(vec2(row, col) + s));
      float hs = hash1(row * 4.13 + s * 2.9) * 2.0 - 1.0;
      // nunca casi cero: una rebanada encendida siempre se nota corrida
      float sh = sign(hs) * (0.4 + 0.6 * abs(hs)) * uMK.y * m * on;
      uv.x += sh / uRes.x;
      gAb = max(gAb, uMK.z / uRes.x * m * (0.55 + 0.45 * on));
      gAdd += mix(uCyan, uMagenta, step(0.5, hash1(row + s))) * 0.06 * m * on;
    }
  }

  vec2 dir = vec2(uDir, 0.0);
  vec2 ab = dir * uSpeed * 0.014 + (uv - 0.5) * (uSpeed + uZoom) * 0.01;
  // el glitch solo completa la aberracion del viaje hasta su propio maximo (no la duplica)
  ab.x += gSign * max(0.0, gAb - abs(ab.x));
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
  gl_FragColor = vec4(acc / n + gAdd, 1.0);
}
`;

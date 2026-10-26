# Mundo WebGL persistente (`src/scripts/world/`)

Un solo `<canvas>` para todo el sitio, montado una vez y conservado entre páginas con
`transition:persist`. El canvas es opaco y siempre pinta la escena: **nunca hay cuadro
negro**, ni en la carga (se ven las capas `<img>` hasta el primer cuadro WebGL) ni en
los viajes (la cámara se mueve por el panorama mientras el DOM cambia).

Three.js por npm (`three@0.186`), sin CDN, sin `eval`, sin scripts inline: cumple la CSP
de `vercel.json` tal como está.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.ts` | API pública (lo único que deben importar las páginas). |
| `engine.ts` | Renderer, cámara, bucle, viaje entre estaciones, calidad adaptativa, modo estático. |
| `config.ts` | **Todo lo que se afina a ojo**: estaciones, profundidades, zoom por capa, amplitud del mouse, partículas de la B, glitch, duraciones. |
| `assets.ts` | Única fuente de los assets (solo servidor). Usa `src/assets/world/{far,mid,near}.*` si existen; si no, `c4-fondo` / `c4-ciudad` repetidas en espejo y una capa cercana procedural. |
| `layers.ts` | Capas de imagen (planos a distinta Z, ventana del panorama según la posición de viaje). |
| `bmatrix.ts` | La B en GPU: partículas, glifos que llueven, halo, remolino con resortes y giro hacia el cursor. |
| `glitch.ts` | Reloj del glitch global (solo CPU): cuándo hay ráfaga, su intensidad y la semilla del patrón. |
| `trail.ts` | Estela del mouse (solo CPU): velocidad, intensidad del glitch local y los 6 puntos de los últimos 150 ms. |
| `fragments.ts` | Fragmentos de glitch flotando (astillas y grupos de píxeles que giran, con borde RGB). |
| `post.ts` | Pase de post-proceso: viaje (aberración cromática, estela, vórtice), glitch global y glitch local del mouse. Solo corre mientras hay movimiento, ráfaga o mouse en movimiento. |
| `procedural.ts` | Atlas de glifos (código y numerales mayas), muestreo de la silueta, capa cercana provisional. |
| `static.ts` | Modo estático: fundido cruzado entre dos pilas de `<img>`. |
| `router.ts` | Enganche opcional con el ClientRouter (`connectRouter`). |
| `../../components/World.astro` | El `<div data-world>` persistente: `<img>` de las capas (respaldo y fuente de texturas) y el `<canvas>`. |
| `../../components/Cursor.astro` + `../cursor.ts` | Cursor propio (DOM, fuera de WebGL): círculo difuminado persistente. Ver "Cursor" abajo. |

## API (`import { ... } from '../scripts/world'`)

```ts
initWorld(canvas: HTMLCanvasElement): void
// Una vez por documento. World.astro ya lo llama solo; no hace falta llamarlo a mano.

goTo(station: 'home'|'trabajo'|'proyecto'|'contacto'|'legal', opts?: { instant?: boolean }): Promise<void>
// Viaje de cámara 1.6–2.2 s (easeInOutCubic, empuje leve en Z, aberración según velocidad).
// Se resuelve al terminar. Un goTo nuevo corta al anterior y sale desde donde va la cámara.
// Siempre emite start → mid → end (aunque la estación sea la misma, o la pestaña esté oculta).
// legal = trabajo atenuado. Para 404 usa 'legal'.

onTravel(cb: (phase: 'start'|'mid'|'end', from: Station, to: Station) => void): () => void
// Devuelve la función para desuscribirse.

setBMode('assembled'|'dissolved'|'hidden'): void
// Orden inmediata a la B. NO hace falta llamarla en la navegación normal: goTo ya
// deshace la B al salir de 'home' (polvo en la dirección del viaje) y la rearma al
// llegar a 'home' (1.2 s, empieza al 55 % del viaje).

setBAnchor(el: HTMLElement | null): void
// La B se centra en ese elemento y toma su alto (en Inicio). Más cómodo: pon
// data-world-b en el elemento; el motor lo busca solo en cada astro:page-load.
// La B nunca pasa del 80 % del ancho de pantalla.

quality: 'high' | 'low' | 'static'          // binding vivo
currentStation(): Station
stationForPath(pathname: string): Station   // '/'→home, '/trabajo/'→trabajo, '/trabajo/<slug>/'→proyecto, '/contacto/'→contacto, resto→legal
connectRouter(opts?): void                  // integración con ClientRouter (abajo)
nextPhase(phase): Promise<void>             // próxima fase de cualquier viaje
getWorldStats(): WorldStats                 // diagnóstico: fps, calidad, partículas, fragmentos, glitch, post, parallax en px
destroyWorld(): void                        // libera GPU y listeners (pruebas)
```

Estación inicial: `<html data-world-station="...">` si existe; si no, sale de la URL.

## Integración en Base.astro (exacta)

1. Importa y monta el mundo **una vez**, antes del header y de `<main>`:

   ```astro
   ---
   import World from '../components/World.astro';
   ---
   <body>
     <a class="skip-link" href="#page">Saltar al contenido</a>
     <World />
     <Header />
     <main id="page" tabindex="-1">...</main>
   ```

   `World.astro` ya trae `transition:persist="world"`, su `<script>` (llama a
   `initWorld`) y sus estilos (`position:fixed`, `z-index: var(--z-bg)`,
   `pointer-events:none`, alto `100lvh`).

2. Conecta el router en el `<script>` de Base, **en lugar de** `travel.ts`:

   ```astro
   <script>
     import { connectRouter } from '../scripts/world';
     connectRouter();
   </script>
   ```

   Qué hace: en `astro:before-preparation` pide `goTo(estación destino)` y envuelve
   `e.loader` para que el cambio de DOM espere a la fase `'mid'` del viaje (y a la
   descarga del documento). En `astro:page-load` alinea la cámara con la URL real
   (navegación fallida, atrás/adelante). No dejes activos `travel.ts` y
   `connectRouter` a la vez: los dos envuelven el loader.

3. Las páginas sincronizan su UI con el viaje:

   ```ts
   import { onTravel } from '../scripts/world';
   // registrar UNA vez (el módulo corre una sola vez con ClientRouter)
   onTravel((phase, from, to) => {
     if (phase === 'start') { /* la UI saliente se va (antes de 'mid') */ }
     if (phase === 'end')   { /* opcional: remates de la UI entrante */ }
   });
   ```

   La UI entrante puede animarse en `astro:page-load`, que llega justo después de
   `'mid'` (el DOM nuevo ya está). Con `fill:'both'` y animaciones síncronas, como hoy.

4. Quita los fondos propios de las páginas (`.hm { background: var(--ink) }`, capas
   `bg-layer` de imagen, `HomeLayerImg`, `home-light.ts`): taparían el
   canvas. `body` puede conservar `background: var(--ink)` (el canvas va encima).
   Para legibilidad del texto, viñetas o vidrio en CSS encima del canvas.

5. En Inicio, marca dónde va la B: `<div data-world-b class="..."></div>` con el alto
   deseado (por ejemplo `height: min(40vh, 360px)`). Si no hay ancla, la B va centrada
   con alto `min(46vh, 440px)` (retrato: `min(32vh, 72vw)`, más arriba).

6. View Transitions nativas: global.css ya deja `::view-transition-*(root)` sin
   animación y oculta `old(root)`; así la captura dura un cuadro y el canvas sigue vivo.
   No pongas `view-transition-name` al mundo.

## Comportamiento

- **Escena**: lejana (Z 22, opaca, bruma índigo y banda de horizonte), media (Z 9,
  aditiva sobre negro, se enciende alrededor del cursor), cercana (Z 2.6, aditiva; se
  aparta alrededor de la B para no taparla y se desvanece al empujar hacia `proyecto`).
  El polvo (se leía como confeti) se retiró el 25-oct-2026; en su lugar flotan **fragmentos de
  glitch** (abajo).
- **Fragmentos de glitch** (`fragments.ts`, `FRAG_*`): 96 en escritorio (64 en calidad baja, 32
  en táctil o pantalla chica), en dos lotes: detrás de la capa cercana (Z 3 a 20) y delante de
  ella (Z 1.5 a 2.4, renderOrder 7). Astillas delgadas y grupos de píxeles de 6-24 px aparentes
  (grandes los cercanos), aditivos y con alfa bajo, borde RGB (magenta y cian desplazados),
  giro lento (0.12-0.55 rad/s) con volteo aparente, deriva lateral lenta y parallax de viaje por
  profundidad (el del mouse sale solo de la cámara). Cortes de señal por tramos: 12 % de los
  tramos se apagan y 6 % se desfasan un instante (salto de ~9 px y RGB fuerte). La mitad
  reacciona al mouse rápido: se aparta hasta 26 px y se glitchea dentro de 160 px del cursor. Se
  apagan alrededor de la B. Todo en el shader (`Points`), sin allocations por cuadro.
- **Mouse = cámara** con inercia (lerp 0.06): ±50 px la cercana, ±14 la media, ±6 la
  lejana a 1440 px, roll ±0.7°. Táctil: deriva automática suave; tocar la B la agita.
- **La B**: 32 000 partículas (alta) / 8 000 (baja), contorno reforzado, volumen (dos
  caras + costado), glifos (código + numerales mayas) en columnas tipo matrix dentro de
  la silueta, halo. Gira hasta 25° hacia el cursor; remolino con flujo rizado, arrastre
  con la velocidad del cursor y regreso con resortes subamortiguados.
- **Calidad**: DPR ≤ 1.5 (táctil ≤ 1.25; baja en escritorio 1.0). Arranca en `low` en
  táctil o con `deviceMemory ≤ 4`; si no, mide 2 s tras armar la B (mediana del tiempo
  por cuadro) y baja a `low` si da < 45 fps. Pausa con `document.hidden`.
- **Glitch global** (señal digital que se reconecta): cada 8-15 s, una ráfaga suave (0.35-0.65)
  de 100-220 ms partida en tramos de 35-70 ms, cada tramo con patrón nuevo (algunos limpios): 3-8 rebanadas
  horizontales de alto variable desplazadas en X, separación RGB, macrobloques que pixelan y
  saltan en pocas zonas chicas y, a veces, 1-2 líneas de escaneo cian/magenta. Entre ráfagas
  la imagen queda limpia y el pase no corre (costo cero). Mouse rápido: adelanta un poco la
  siguiente ráfaga (ya no dispara micro-glitch de pantalla completa: eso lo hace el glitch local).
  Viaje: rebanadas y bloques en tramos
  alternos, proporcionales a la velocidad de cámara (pico a mitad del viaje); su RGB solo
  completa la aberración del viaje hasta su propio máximo, no la duplica. Móvil: pausas ×1.7 e
  intensidad ×0.6. Estático / `prefers-reduced-motion`: sin glitch. Constantes `GLITCH_*` en
  `config.ts`; para forzar una ráfaga en desarrollo: `__worldGL.glitch.trigger(2, 0.9)`.
- **Glitch local del mouse** (`trail.ts` + `postFrag`, `GLITCH_TRAIL_*`): al mover el mouse,
  rebanadas horizontales cortas desplazadas (hasta 16 px) y separación RGB (hasta 3.5 px) dentro
  de una cápsula de 150 px de radio alrededor del cursor y de su estela de los últimos 150 ms
  (6 puntos, el más viejo pesa 0.35). Intensidad por velocidad: < 140 px/s nada, 800 px/s 0.06
  (apenas vibra), 1500 px/s 0.18, 3000 px/s 0.55, ≥ 4000 px/s 0.85 (máximo; nunca ilegible).
  Al detenerse se apaga en 80-200 ms y el pase deja de correr. Táctil: el arrastre del dedo da
  el mismo efecto ×0.3. Medido con `getWorldStats().mouseGlitch` / `.mouseSpeed` / `.post`.
- **Estático** (sin WebGL, `prefers-reduced-motion`, o contexto perdido): las `<img>`
  encuadradas en la estación; `goTo` = fundido cruzado de 420 ms entre dos pilas.

## Cursor (`src/components/Cursor.astro` + `src/scripts/cursor.ts`)

DOM, no WebGL (funciona aunque el mundo caiga a estático). Montado en `Base.astro` con
`transition:persist="cursor"`; el módulo corre una vez.

- Solo con `(hover: hover) and (pointer: fine)` y sin `prefers-reduced-motion`; si no, no
  existe y queda la flecha nativa. La flecha se oculta con `html[data-custom-cursor="on"]`
  (se pone tras el primer movimiento del mouse y se repone en `astro:after-swap`, porque el
  ClientRouter reemplaza los atributos de `<html>`). `input`, `textarea` y `contenteditable`
  conservan su cursor nativo y ahí el círculo se oculta.
- Círculo difuminado de 36 px que sigue con inercia (lerp 0.28 por cuadro a 60 fps); sobre
  `a[href]`, `button`, `[role=button]`, `.card`, `summary`, `label[for]`, `select` y
  `[data-cursor-hover]` se encoge a un punto y aparece un anillo nítido de 54 px (cian con filo
  de tinta, se lee sobre el índigo y sobre botones blancos); deshabilitado (`:disabled`,
  `aria-disabled`): anillo punteado tenue; clic: se contrae a 0.72. Con el mouse rápido (> 700
  px/s) dos copias magenta/cian se separan hasta 5 px detrás del movimiento.
- Sin `mix-blend-mode`: `screen` lo borraba sobre los botones blancos y `difference` lo volvía
  amarillo sobre el índigo.
- `pointer-events: none` y `z-index: var(--z-cursor)` (100, encima del banner de cookies, que
  sigue clicable). Se oculta al salir el mouse de la ventana, con `blur` y ante un toque
  (equipos híbridos). El foco por teclado conserva su anillo `:focus-visible`.
- Rendimiento: su propio rAF solo vive mientras el círculo se mueve (en reposo, cero); solo
  escribe `transform` y `opacity`.

## Cambiar a los assets finales

Deja `far`, `mid`, `near` (`.webp` o `.png`) en `src/assets/world/`. Nada más: el glob
de `assets.ts` los toma en el siguiente build. Contrato: panorama ancho (~3×16:9), con
Inicio ~0.17, Trabajo ~0.5, Contacto ~0.83 en el eje X; `mid` y `near` sobre negro (se
suman). Si `near` llega con transparencia real, cambia su `blend` a `'alpha'` en
`assets.ts`.

## Ajustes rápidos (`config.ts`)

- Más o menos profundidad del mouse: `MOUSE_X` / `MOUSE_Y`.
- Velocidad relativa de las capas al viajar: `LAYERS.*.zoom`.
- Encuadre/brillo de cada estación: `STATIONS`.
- Fuerza de la B: `B_CURSOR_RADIUS`, `B_MAX_TILT`; brillo de capas en `layers.ts` (`LOOK`).
- Glitch: frecuencia `GLITCH_EVERY_MIN_S` / `GLITCH_EVERY_MAX_S`, duración `GLITCH_BURST_*`,
  intensidad `GLITCH_AMP_*`, corte `GLITCH_SLICE_SHIFT`, RGB `GLITCH_RGB`, bloques
  `GLITCH_BLOCK_ZONES`, líneas `GLITCH_LINE_CHANCE`, mouse `GLITCH_MOUSE_*`, viaje
  `GLITCH_TRAVEL*`, móvil `GLITCH_MOBILE_*`. Para apagarlo: `GLITCH_AMP_MIN = GLITCH_AMP_MAX = 0`
  y `GLITCH_TRAVEL = 0`.
- Glitch del mouse: radio `GLITCH_TRAIL_RADIUS_PX`, estela `GLITCH_TRAIL_MS`, sensibilidad
  `GLITCH_TRAIL_SPEED_MIN` / `_MAX` / `_CURVE`, tope `GLITCH_TRAIL_AMP_MAX`, caída
  `GLITCH_TRAIL_DECAY_S`, corte y RGB `GLITCH_TRAIL_SHIFT_PX` / `GLITCH_TRAIL_RGB_PX`, alto de
  rebanada `GLITCH_TRAIL_BAND_*`, táctil `GLITCH_TRAIL_TOUCH_K`. Apagarlo: `GLITCH_TRAIL_AMP_MAX = 0`.
- Fragmentos: cantidad `FRAG_HIGH` / `FRAG_LOW` / `FRAG_MOBILE`, tamaño `FRAG_SIZE_*`, alfa
  `FRAG_ALPHA`, giro `FRAG_SPIN_*`, cortes `FRAG_FLICKER_RATE` / `FRAG_OFF_CHANCE` /
  `FRAG_JUMP_CHANCE`, RGB `FRAG_RGB*`, mouse `FRAG_MOUSE_*`. Apagarlos: los tres conteos en 0.
- Cursor: constantes al inicio de `src/scripts/cursor.ts` (`LERP`, `SPLIT_*`) y tamaños
  `--size` / `--ring` en `Cursor.astro`.

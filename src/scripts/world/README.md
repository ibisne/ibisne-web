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
| `config.ts` | **Todo lo que se afina a ojo**: estaciones, profundidades, zoom por capa, amplitud del mouse, partículas, duraciones. |
| `assets.ts` | Única fuente de los assets (solo servidor). Usa `src/assets/world/{far,mid,near}.*` si existen; si no, `c4-fondo` / `c4-ciudad` repetidas en espejo y una capa cercana procedural. |
| `layers.ts` | Capas de imagen (planos a distinta Z, ventana del panorama según la posición de viaje). |
| `bmatrix.ts` | La B en GPU: partículas, glifos que llueven, halo, remolino con resortes y giro hacia el cursor. |
| `dust.ts` | Polvo y escombros a varias profundidades. |
| `post.ts` | Pase de viaje (aberración cromática, estela, vórtice). Solo corre mientras hay movimiento. |
| `procedural.ts` | Atlas de glifos (código y numerales mayas), muestreo de la silueta, capa cercana provisional. |
| `static.ts` | Modo estático: fundido cruzado entre dos pilas de `<img>`. |
| `router.ts` | Enganche opcional con el ClientRouter (`connectRouter`). |
| `../../components/World.astro` | El `<div data-world>` persistente: `<img>` de las capas (respaldo y fuente de texturas) y el `<canvas>`. |

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
getWorldStats(): WorldStats                 // diagnóstico: fps, calidad, partículas, parallax en px
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
  aparta alrededor de la B para no taparla y se desvanece al empujar hacia `proyecto`),
  polvo y escombros (~440 / 170) delante y detrás de la cercana.
- **Mouse = cámara** con inercia (lerp 0.06): ±50 px la cercana, ±14 la media, ±6 la
  lejana a 1440 px, roll ±0.7°. Táctil: deriva automática suave; tocar la B la agita.
- **La B**: 32 000 partículas (alta) / 8 000 (baja), contorno reforzado, volumen (dos
  caras + costado), glifos (código + numerales mayas) en columnas tipo matrix dentro de
  la silueta, halo. Gira hasta 25° hacia el cursor; remolino con flujo rizado, arrastre
  con la velocidad del cursor y regreso con resortes subamortiguados.
- **Calidad**: DPR ≤ 1.5 (táctil ≤ 1.25; baja en escritorio 1.0). Arranca en `low` en
  táctil o con `deviceMemory ≤ 4`; si no, mide 2 s tras armar la B (mediana del tiempo
  por cuadro) y baja a `low` si da < 45 fps. Pausa con `document.hidden`.
- **Estático** (sin WebGL, `prefers-reduced-motion`, o contexto perdido): las `<img>`
  encuadradas en la estación; `goTo` = fundido cruzado de 420 ms entre dos pilas.

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

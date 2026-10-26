# Guía de desarrollo · sitio 2026

Astro 5 estático. Solo `src/` y `public/` entran al build; los `.html` de la raíz son del sitio viejo y Astro los ignora.

```
npm run dev      # servidor local
npm run build    # genera dist/
npm run preview  # sirve dist/
npx astro check  # tipos
```

## Layout y página

Cada página usa `src/layouts/Base.astro`:

```astro
<Base title="Trabajo" description="..." page="trabajo">
  <div class="stage">
    <div class="bg-layer" data-travel-bg> ...fondo... </div>
    <div class="ui-layer"> <h1 data-travel-ui>...</h1> ... </div>
  </div>
</Base>
```

Props de `Base`: `title`, `description`, `page` (`home|trabajo|contacto|legal|404`, va a `<html data-page>`), `legalFooter` (`none|full`, solo Contacto y legales llevan pie; alias booleano `footerLegal`), `image`, `noindex`, `rawTitle`. Slot `head` para meter algo extra al `<head>`.

- `page` gobierna el scroll: en `home|trabajo|contacto` con pantalla de 1024x700 o más no hay scroll (`html,body{height:100dvh;overflow:hidden}`). Por debajo, scroll normal. `legal` y `404` siempre scrollean.
- El header es `position:fixed` y flota encima: el contenido que no use `.ui-layer` debe llevar `.under-header` (padding-top = `--header-h`).
- Los fondos van en `.bg-layer` (absoluto, `inset:0`, llega hasta arriba por debajo del header).
- Cookies: cualquier elemento con `data-open-consent` reabre el banner (úsalo en la página de Cookies).
- Utilidades de `global.css`: `.btn`, `.btn-outline`, `.btn-solid`, `.pill` (`.is-active`), `.glass`, `.label`, `.title` + `.title__thin` / `.title__bold`, `.lead`, `.container`, `.scroll-x` (solo con scroll), `.only-lock` / `.only-scroll`, `.sr-only`.
- Colores y medidas: solo tokens de `src/styles/tokens.css`.

## Motor de viaje (`src/scripts/travel.ts`)

Se carga solo desde `Base`. Cada página registra sus puntos focales y, si quiere, sus propios hooks. Pon el registro en un `<script>` de la página (se ejecuta una vez; el registro es global):

```astro
<script>
  import { registerPage } from '../scripts/travel';

  registerPage('home', {
    // Punto focal en el fondo de ESTA página por cada página vecina (0..1).
    // En exit = hacia dónde se zoomea; en enter (volviendo) = de dónde se aleja.
    focal: { trabajo: { x: 0.72, y: 0.62 }, contacto: { x: 0.22, y: 0.64 } },

    // Opcionales: reemplazan la animación de serie.
    exit(ctx) {
      const base = ctx.defaults.exit(); // la de serie (Animation[])
      return [...base, ctx.root.animate(/* ... */)];
    },
    enter(ctx) {
      return ctx.defaults.enter();
    },
  });
</script>
```

Sin hooks, el motor anima de serie lo que esté marcado en el DOM:

- `[data-travel-bg]`: capas de fondo. Salida 650 ms ease-in: `scale 1 → 2.6` con `transform-origin` en el punto focal, `blur 0 → 10px`, y se apaga al final. Entrada 700 ms ease-out: `scale 1.35 → 1`, `blur 8 → 0`. Si se vuelve a Inicio, es inverso: la página que sale se aleja (`0.82`) y Inicio entra desde `scale 2.6 → 1` alrededor del punto focal.
- `[data-travel-ui]`: interfaz. Sale con opacidad 1 → 0 en 250 ms; entra en cascada (stagger 40 ms, `translateY 12px → 0`, opacidad) cuando el fondo ya va a 45 %.
- Todo overlay decorativo de una página (viñeta, velo) debe llevar `data-travel-bg`: la salida lo apaga con el `<main>`, pero al llegar el DOM nuevo aparece entero en un cuadro si nadie lo anima (en Inicio la viñeta oscurecía ~20 % de golpe a 2/3 del viaje).
- Con `prefers-reduced-motion` todo es un fundido de 200 ms sobre `<main>`. Si la página no tiene ni `data-travel-bg` ni `data-travel-ui`, también.
- Legal y 404 usan fundido.

### Contrato de los hooks

```ts
exit(ctx) / enter(ctx)  // devuelven void | Animation | Animation[] | Promise
```

`ctx`: `page` (quien ejecuta), `to` (destino, solo en exit), `from` (origen, solo en enter; `null` en carga directa), `direction` (`forward | back | fade | boot`), `reduced`, `root` (`<main id="page">`), `bg[]`, `ui[]`, `focal`, `defaults.exit()` / `defaults.enter()`.

Reglas:

1. **Crea las animaciones de forma síncrona** dentro de `enter`. El motor retira `html[data-boot]` (que mantiene `<main>` en `opacity:0`) justo después de llamar al hook; si la animación se crea tarde, la página parpadea un cuadro. Usa `fill: 'both'`.
2. Devuelve las `Animation[]` si quieres que el motor espere a que terminen (exit) o las libere (enter). Si no devuelves nada, el motor no espera ni limpia.
3. `exit` corre mientras se descarga la página siguiente; la navegación espera a que ambas terminen.
4. En carga directa se llama a `enter` con `from === null` y `direction === 'boot'` (entrada suave: fondo `scale 1.06 → 1`, UI en cascada).
5. Lógica de inicialización de la página (montar widgets, listeners): usa `document.addEventListener('astro:page-load', ...)`, no código suelto; los módulos corren una sola vez pero el DOM cambia en cada navegación.
6. Seguros: el CSS revela `<main>` a los 2.2 s aunque el JS falle, y `<noscript>` lo muestra siempre.

## La B

La B ya no es un componente: la dibuja el motor del mundo (WebGL, `src/scripts/world/`). Inicio solo deja el ancla `<div data-world-b>`. Cuando el mundo cae al respaldo estatico (reduced-motion, sin WebGL o fallo de escena; `engine.ts` pone `data-world-fallback` en `[data-world]`), Inicio muestra la silueta `src/assets/b/b-trim.png` con brillo CSS. La 404 usa esa misma silueta estatica sin ancla.

## Entrada inmersiva y música

`src/components/Entry.astro` (montado una vez en `Base`, persistente) + `src/scripts/entry.ts`.

- **Primera visita** (cualquier URL): `<dialog>` modal "¿Cómo quieres entrar?" con "Entrar con experiencia" (música + efectos) y "Entrar sin sonido". Escape = sin sonido. La elección queda en `localStorage.ib_entry` (`immersive` | `quiet`) y no se vuelve a preguntar.
- **Loader = la B del mundo**, no una animación aparte: mientras se pregunta, la B de partículas (`bmatrix.ts`) está dispersa por toda la pantalla con la escena velada y glitch de rebanadas/RGB; tras la elección se ordena de afuera hacia adentro hasta su lugar. El avance real de la precarga (`preload.ts`: mundo, fuentes, HTML e imágenes de Inicio/Trabajo/Contacto, música solo con experiencia) decide cuánto se arma, con tope: ~2.3 s tras elegir, ~1 s en recargas. Al abrir el velo, en Inicio la B queda en su sitio; en otra página se disuelve como en los viajes. API en `world/README.md` (`introBegin`, `introProgress`, `introEnd`).
- Mientras corre, la UI espera oculta (`html[data-entry-hold]`, `entry-gate.ts`) y `travel.ts` retrasa su cascada de arranque hasta que se abre el velo.
- Sin WebGL o con `prefers-reduced-motion`: fundido simple (~530 ms). Sin JS: no aparece (`<noscript>` en `Base`); si el JS no llega, el seguro CSS la retira a los 4 s.
- **Música** (`src/scripts/ambient.ts`): si al compilar existe `public/audio/ambient.mp3` (o `.ogg`), `Entry.astro` deja su ruta en `data-ambient-*` y se usa ese archivo en loop (solo se descarga con experiencia). Si no existe, respaldo generativo con Web Audio. Volumen 0.3, fundido de 2 s al entrar, se pausa con la pestaña oculta. Nunca suena sin gesto: en la primera visita el clic de "Entrar con experiencia"; en recargas con `immersive`, el primer clic o tecla en la página.
- **Control de sonido**: `src/components/SoundToggle.astro` en el header (escritorio junto a "Hablemos"; móvil a la derecha del logo). `aria-pressed` = suena; cambiarlo guarda `ib_entry`.

## Cursor propio

`src/components/Cursor.astro` (montado una vez en `Base`, persistente) + `src/scripts/cursor.ts`. Solo con mouse real y sin reduced motion: oculta la flecha nativa (`html[data-custom-cursor="on"]`) y pinta un círculo difuminado que se vuelve anillo sobre `a[href]`, `button`, `[role=button]`, `.card`, `summary`, `label[for]`, `select`. Para que otro elemento active el anillo, ponle `data-cursor-hover`. Los campos de texto conservan su cursor nativo. Círculo de 54 px; anillo de 81 px. Detalle en `src/scripts/world/README.md` ("Cursor").

## Glitch del mundo y de los titulares

- El glitch vive en la imagen (pase de post del mundo): ráfagas globales, micro-glitches que rotan de lugar y el glitch local del mouse o del dedo. No hay partículas flotando. Constantes en `src/scripts/world/config.ts` (`GLITCH_*`, `GLITCH_TRAIL_*`, `MICRO_GLITCH_*`).
- Los titulares son DOM y se glitchean aparte, solo bajo el mouse o el dedo (las letras cercanas al puntero, no el titular entero): `src/scripts/text-glitch.ts` (importado en `Base`). Para que un titular participe, ponle `data-glitch-text`. El titular y el subtítulo de Inicio lo llevan. No lo pongas en nav, botones, filtros ni texto largo (más de una frase). Los micro-glitches evitan solos titulares, textos y controles; para que eviten otra zona, `data-world-avoid`.
- Táctil: el dedo hace de mouse con eventos `touch*` pasivos. En Inicio la sección `.hm` lleva `touch-action: none` (pantalla fija); en Trabajo y Contacto el scroll queda intacto. No pongas links ni botones dentro de `.hm` sin revisar eso.

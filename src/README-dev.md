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

Props de `Base`: `title`, `description`, `page` (`home|trabajo|contacto|legal|404`, va a `<html data-page>`), `legalFooter` (`none|mini|full`, alias booleano `footerLegal`), `image`, `noindex`, `rawTitle`. Slot `head` para meter algo extra al `<head>`.

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


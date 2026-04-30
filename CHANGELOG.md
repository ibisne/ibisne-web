# CHANGELOG — VAULT v2

Formato: cambios listados por versión con prefix tipo `fix(scope):` para auditabilidad.

---

## site-v0.2 — Fase 4 · Home rebuild (Ruta A)

> Aplicada el 2026-04-26. Rebuild completo de `pages/index.html` tras copy-audit que detectó 14 ítems inventados en v0.1. Ruta A aprobada por Eduardo.

- **fix(home/copy): replace all panel descriptions with LOCKED verbatim subtitles from TEXTOS-RESPALDO.md**
  CGP → "Nosotros cobramos cuando tú ganas. Revenue share 12 meses, sin fees, sin pitch decks."
  SC → "Tu capital trabaja con el mismo equipo que lo despliega. Sin intermediarios, sin gestores pasivos."
  Emergente → "Amazon y Mercado Libre te venden visibilidad…Emergente es lo contrario." (abreviado último fragmento per Eduardo)
  VL → "La incubadora donde no te damos consejos — te damos un equipo que construye tu producto contigo."
- **fix(home/hero): 2-tier h1 hierarchy** — `h1.t-hero` (201px) + `p.t-display` (115px, `--text-secondary`) + `p.t-body` (17px, `--text-secondary`). Verde phosphor solo en `operamos` (`.t-accent`).
- **fix(home): eliminate Tesis section** — 3 `.editorial-card` con copy inventado eliminados completamente.
- **fix(home/track): stats-only metrics-row** — 4 stats LOCKED: `9 marcas` · `2 públicas + 7 NDA` · `16+ años` · `5 sectores`. Párrafo narrativo inventado eliminado.
- **fix(home/cta): simplify CTA final** — LOCKED "¿Ya te cansaste de jugar? Hagamos bisne." + un solo `.btn-accent`. Email input y btn-line "Soy inversionista" eliminados.
- **fix(home/footer): real emails + correct sitemap** — Cols: Verticales · iBisne · Aplicar · Contacto. Emails: eduardo@ibisne.com · proyectos@ibisne.com · legal@ibisne.com. Eliminado `hola@ibisne.com`.
- **fix(home/email): topbar + mobile overlay email → proyectos@ibisne.com** (antes hola@ibisne.com).
- **chore(home): bump ?v=2.4.2 → ?v=2.4.4** en 4 `<link>` + `<script>`.

### Verificación post-rebuild

```
copy: todos los 4 paneles con texto LOCKED verbatim ✓
tesis: eliminada (tesisExists: false) ✓
track: 4 stats · "Portafolio activo" · "+ 7 bajo NDA" · "eCommerce LATAM" · "En portafolio" ✓
cta: LOCKED + btn-accent solo (sin form, sin btn-line) ✓
footer: 3 emails reales · VAULT v2.4.4 ✓
motion.js: v2.4.4 · prefers-reduced-motion guard activo en preview (no bug de markup) ✓
consola: 0 errores · 0 warnings ✓
```

- **fix(motion): initHorizontal funciona bajo prefers-reduced-motion** (v2.4.5)
  El early return `if (reducedMotion) return` desactivaba el feature completo. Fix: se elimina el guard y en `loop()` se usa `current = reducedMotion ? target : lerp(...)` — snap instantáneo en lugar de lerp. El scroll horizontal funciona en todos los sistemas. Verificado con `reducedMotion: true` en el preview: track traduce correctamente, progress indicator actualiza, cero errores de consola.
- **chore(home): bump ?v=2.4.4 → ?v=2.4.5** para forzar recarga de motion.js.
- **fix(home/hero): override .hero h1 specificity para respetar --fs-display**
  `.hero h1` en components-extra.css fuerza `--fs-hero` (201px) sobre cualquier clase. Se añade `style="font-size: var(--fs-display)"` en el h1 para usar el token correcto sin hardcodear px. Resultado: h1 = 115px · línea 2 = 72px · hero = 850px → cabe en 900px.

---

## site-v0.1 — Fase 4 · Home v2 (pages/index.html)

> Aplicada el 2026-04-25. Primera página real construida sobre VAULT v2.4.2. No bumpea versión del sistema (no se tocó `/design-system-v2/`).

- **feat(home): build pages/index.html consuming VAULT v2.4.2 only**
  Arquitectura hub & spoke: home institucional · 6 secciones · 4 verticales como golpe de teatro horizontal.
  - Hero con copy LOCKED ("Si funciona, es porque lo operamos. Si lo operamos, es porque invertimos." + "¿Ya te cansaste de jugar? Hagamos bisne.")
  - `.verticals-horizontal` con las 4 verticales (Commerce Growth · Smart Capital · Emergente · Venture Lab) — sticky+scroll lateral en ≥1024px, stack vertical en mobile.
  - 3 `.editorial-card` derivados de la tesis Smart Capital (mercado probado · ejecución propia · digital como palanca de margen).
  - `.metrics-row` con `.metric.is-key` en `9` (marcas portafolio) — la única key metric en phosphor del home.
  - `.cta-final` con form de email + botones "Hagamos bisne" (accent) y "Soy inversionista" (line).
  - Footer 4 cols (Verticales · Compañía · Recursos · Contacto).
  - Navbar v2.2 completo: topbar utility + main row con mega-menu sobre Verticales (4 cards de las verticales) + nav-mobile-bar + nav-overlay full-screen para ≤768px.
- **decisión(verde): un solo `.t-accent` en hero ("operamos") + un solo `.metric.is-key` ("9 marcas")**
  Iteración: la primera versión tenía 2 palabras phosphor en hero ("operamos" + "invertimos") y otra en CTA final. Reducido a 1 sola por sección decisiva. Cumple política phosphor escaso.
- **chore(home): paths relativos `../design-system-v2/...?v=2.4.2`** en `<link>` y `<script>`. Cache-bust alineado con sistema.

### Verificación preview

```
3 viewports verificados: 1440 (desktop) · 768 (tablet) · 375 (mobile)
6 secciones renderizando: hero · verticales · tesis · track · cta · footer
0 errores de consola · 0 warnings
4 CSS de VAULT cargados desde paths relativos
motion.js init OK (window.__VAULT__ expuesto, grain inyectado)
verticales colapsan correctamente a stack vertical en mobile
metrics-row colapsa a 2x2 en mobile
hero typography masiva sin overflow horizontal
CTA accent full-width en mobile
```

---

## v2.4.2 — Fase 2 · Depuración · cierre completo

> Aplicada el 2026-04-25 sobre v2.4.0. Cubre las 3 tandas pendientes: tokenización (11 tokens nuevos), refactor SPA listener leaks (M-W1/W2/W3) y FAQ animation refactor (CE-W1).
> Verificado en preview: cero errores/warnings, FAQ colapsa a 0px y abre a altura natural sin magic number, tokens nuevos resolviendo, visual del UI Kit intacto.

### Tokenización (11 tokens nuevos · Tanda 3)

> Decisión: el AUDIT proponía 10. Subí a 11 al separar `--fs-nano: 10px` y `--fs-pico: 9px` porque grep encontró 5 ocurrencias de 9px (3 más que el audit detectó). Tokens defendibles caso por caso, no inflados.

- **fix(tokens): add `--fs-input` (18px), `--fs-base` (14px), `--fs-card-title` (22px), `--fs-nano` (10px), `--fs-pico` (9px)** — extiende escala tipográfica para cubrir tamaños internos que estaban hardcodeados.
- **fix(tokens): add `--field-textarea-min-h` (96px), `--field-textarea-max-h` (320px)** — shape del textarea expuesto.
- **fix(tokens): add `--bg-scrim` (rgba(13,17,23,0.6))** — scrim sobre imágenes, antes hex hardcoded en `.case-tile .ct-tag`.
- **fix(tokens): add `--hero-offset` (144px)** — padding-top del hero sobre nav fijo.
- **fix(tokens): add `--z-raised` (5), `--z-nav-locked` (101)** — sustituyen `z-index: 5` literal y `calc(var(--z-overlay) + 1)`.
- **fix(components): replace literal font-sizes/spacing with new tokens** (12 hits en `components.css` + `components-extra.css`).

### SPA listener leaks · refactor (Tanda 2)

- **fix(motion): introduce `spaControllers[]` + `abortSpaControllers()` for SPA-bound listeners** (M-W1)
  Cada `initScrollStack` y `initHorizontal` ahora registra sus listeners de `scroll`/`resize` con `AbortController`. `navigate()` aborta todos antes del `replaceWith` para evitar que los listeners viejos se acumulen referenciando elementos que ya no están en DOM.
- **fix(motion): bind mega-menu `document` listeners once via delegation** (M-W2)
  Antes `keydown`/`click` se agregaban dentro del forEach de items (multiplicaba listeners por reinit). Ahora se bind una sola vez con guard `initMegaMenu._docBound` y delega al estado actual del DOM (`querySelectorAll('[aria-expanded="true"]')`).
- **fix(motion+css): replace `!important` overrides on `.verticals-horizontal` mobile with `.is-mobile` class coordination** (M-W3)
  `setHeight()` agrega/quita `.is-mobile` en la sección y cancela el `rAF` cuando entra a mobile. CSS pasa de `height: auto !important` y `transform: none !important` a selectores `.verticals-horizontal.is-mobile`. Sin `!important`, sin race condition con el loop.
- **fix(motion): include `initHorizontal(newMain)` in SPA reinit** (bonus encontrado al refactorizar)
  Faltaba en el batch de re-inits de `navigate()`. Antes la sección horizontal no se reactivaba post-navegación.

### FAQ animation refactor (CE-W1)

- **fix(faq): replace `max-height: 0 → 500px` with `grid-template-rows: minmax(0, 0fr) → minmax(0, 1fr)`**
  Anima a la altura natural del contenido. Sin magic number. `minmax(0, …)` fuerza el min-row a 0 (default trataría min-content y dejaría 32px de padding residual visible).
  Soporte: Chrome 117+ / Firefox 119+ / Safari 17.2+.
- **fix(faq): add `.faq-panel-inner { min-height: 0; overflow: hidden; }`** para que el child del grid pueda colapsar.

### Cache-bust

- **chore(ui-kit): bump `?v=2.4.0` → `?v=2.4.2`** (`2.4.1` intermedio quemado en iteración del fix de FAQ).

### Verificación post-cierre

```
tokens nuevos resuelven correctamente:
  --fs-input=18px, --fs-base=14px, --fs-card-title=22px, --fs-nano=10px,
  --fs-pico=9px, --field-textarea-min-h=96px, --field-textarea-max-h=320px,
  --bg-scrim=rgba(13,17,23,0.6), --hero-offset=144px, --z-raised=5, --z-nav-locked=101

FAQ panel: closed=0px ✓ · opened=86.375px ✓ · transición simétrica
window.__VAULT__ expuesto · cero errores y warnings de consola
visual del UI Kit idéntico al baseline (hairlines, mint eyebrows, tipografía masiva)
```

---

## v2.4.0 — Fase 2 · Depuración (parcial · safe fixes)

> Aplicada el 2026-04-25 sobre el AUDIT.md de Fase 1.
> **Esta versión cubre solo los fixes mecánicos sin decisión de diseño.** Pendientes (tokenización + refactor SPA listeners + FAQ animation) requieren aprobación de Eduardo antes de aplicarse.
> Verificado en preview: cero errores/warnings de consola, regla `:focus-visible` activa, tokens migrados, visual intacto.

### CRITICAL fixes

- **fix(motion): remove orphan `initMagnetic()` call breaking SPA navigation** (M-C1)
  Línea 279 de motion.js llamaba `initMagnetic(newMain)` después de cada navegación SPA. La función fue purgada en v2.2.2 pero la llamada quedó huérfana. Generaba `ReferenceError` silencioso en cada nav. Eliminada.
- **fix(motion): expose teardown for cursor rAF loop** (M-C2)
  `initCursor` ejecutaba `requestAnimationFrame(tick)` recursivo sin guardar id. Ahora el loop se almacena en `cursorRaf` y se expone `initCursor.cancel()` para teardown futuro (SPA, theme reset, etc.).
- **fix(a11y): add `:focus-visible` to interactive elements (WCAG 2.4.7 / 2.4.11)** (C-C1)
  6 grupos de elementos interactivos no tenían focus state visible. Agregada regla compartida en `components.css`: `outline: 2px solid var(--accent-mint); outline-offset: 3px;` para `.btn`, `.link`, `.link-arrow`, `.field input/textarea/select`, `.nav-toggle`, `.nav-links a`, `.nav-mega-trigger`, `.nav-topbar .tb-social a`. Solo se activa con teclado (no con click).

### WARN fixes

- **fix(motion): respect `prefers-reduced-motion` in `initReveals`, `initScrollStack`, `initHorizontal`, `initBgFade`** (M-W4)
  Las 4 funciones ahora hacen `if (reducedMotion) return` al inicio. Antes solo `initCursor`, `initGrain`, `initPageTransitions` lo respetaban.
- **fix(components-extra): remove duplicate `.tier-table-wrap` declaration in mobile media query** (CE-W2)
  La regla en L1257 duplicaba L961-966. Eliminada.

### NIT fixes

- **fix(tokens): remove orphan tokens `--fw-semibold`, `--r-none`, `--z-sticky`** (T-N2/N3/N5)
  Los 3 estaban declarados en tokens.css y nunca referenciados.
- **fix(tokens): retire legacy alias `--bg-elevated`, migrate 6 usages to `--bg-paper`** (T-N1)
  Migración aplicada en `components-extra.css` (4 usos), `icons-reference.html` (1), `UI Kit.html` (1). Alias eliminado de tokens.css.
- **fix(tokens): mark `--z-modal` as reserved in comment** (T-N6)
  Documenta intent (modales/dialog futuros, no usado todavía).
- **fix(components): remove empty `.btn-line` rule** (C-N1)
  Selector con solo comentario interno, sin declaraciones. Eliminado.
- **fix(components): remove redundant `box-sizing` declarations on `.field` and inputs** (C-N2)
  Ya está aplicado globalmente en `*, *::before, *::after`. 2 redundancias eliminadas.
- **chore(motion): clean stale "magnetic" references in comments** (M-N1)
  Header (línea 4) y comentario inline (líneas 187, 277) actualizados para reflejar el estado real post-purga v2.2.2.

### Cache-bust

- **chore(ui-kit): bump `?v=2.3.6` → `?v=2.4.0`** en los 4 `<link>` y el `<script>` de `UI Kit.html`.

---

## Pendiente — requiere decisión de Eduardo antes de aplicar

Los siguientes fixes del AUDIT.md NO se aplicaron en v2.4.0 porque requieren decisiones de diseño:

### Tanda 3 · Tokenización (10 tokens nuevos)
- C-W2 + CE-W4 a CE-W8: crear `--fs-input` (18px), `--fs-base` (14px), `--fs-nano` (9px), `--fs-card-title` (22px), `--field-textarea-min-h` (96px), `--field-textarea-max-h` (320px), `--bg-scrim`, `--hero-offset`, `--z-raised`, `--z-nav-locked`.
- Tokens nuevos = decisión de diseño (extiende escala tipográfica). Eduardo decide.

### Refactor SPA listener leaks (motion.js)
- M-W1: scroll listeners en `initScrollStack` / `initHorizontal` se acumulan en cada nav SPA — requiere `AbortController` o tracking manual.
- M-W2: `document` keydown/click multiplicados por mega-menu item — requiere event delegation.
- M-W3: limpiar `!important` de `.verticals-horizontal` en mobile coordinando con motion.js (introducir clase `.is-mobile`).
- Cada uno introduce un patrón nuevo (AbortController, delegation, viewport flag). Eduardo decide alcance.

### FAQ animation refactor (CE-W1)
- `.faq-panel { max-height: 0 → 500px }` — magic number frágil, anima layout cada frame.
- Alternativas: ResizeObserver + JS, o `interpolate-size: allow-keywords` (Chrome 129+). Cambia behavior visual sutilmente.

### NIT batch separado
- C-W3 (extraer `.nav-row-inner`), C-N3 / C-N4 (naming `.eyebrow` vs `.section-num`, `.t-body` vs `.t-secondary`), CE-N3/N4 (~12 spacing/font hardcoded en components-extra), M-N2 (dead `.menu-close` selector).
- Trivial pero no urgente. Aplicar cuando se acuerde un batch de cleanup.

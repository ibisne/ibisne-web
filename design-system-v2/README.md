# VAULT · iBisne Design System v2.2

Antítesis de Operator Grid. Si Operator es operador-en-trinchera, VAULT es socio en penthouse.
Editorial, escaso, premium. Un solo acento verde phosphor escasamente. La tipografía hace el trabajo.

> Esta carpeta vive **en paralelo** a `/design-system/` (Operator Grid). Las dos propuestas
> coexisten para que los socios elijan. **No mezclar tokens entre v1 y v2** — cada sistema tiene
> su propia paleta, type stack y filosofía.

---

## Reglas duras (no negociables)

1. **Verde phosphor `#3DFF7F` aparece máximo 5–7 veces** en todo el home. Reservado para: cursor en hover de buttons, indicador activo del navbar, una métrica clave, un divider de sección crítica, un sl-num del scroll-stack. Si lo ves en cada botón, lo arruinaste — bórralo y replantea.
2. **Hairlines 1px solamente.** Bordes en `var(--bg-line)`. Cero box-shadows decorativos. Cero gradientes.
3. **Tipografía masiva neo-grotesk hace el trabajo.** Hero `clamp(72px,14vw,220px)` con tracking `-0.04em` y weight 500. Inter Tight (Söhne fallback). El espacio negativo es la decoración.
4. **Custom cursor blob obligatorio.** Punto 4px + blob 40→80→100px con `lerp(0.12)` en `requestAnimationFrame`. `mix-blend-mode: difference` sobre links, llena verde sobre buttons, label "VIEW" sobre `[data-cursor="view"]`. Cursor nativo oculto. Desactivado en touch (`pointer: coarse`).
5. **Scroll-driven storytelling sticky+capas** en al menos una sección. Cálculo de progress vía `getBoundingClientRect()`, no scroll-snap CSS.
6. **Page transitions con overlay negro** que cubre 800ms y descubre 1000ms. SPA-lite intercepta `<a>` internos del mismo origen.
7. **Sin emojis. Sin iconos de librería externa** (Lucide, Heroicons, FontAwesome, Material). Usa solo el set propio en `icons-reference.html` (16 iconos stroke 1px `currentColor`).
8. **Imagineria editorial.** Placeholders sólidos `#14191F` con label monospace `[ FOTO · 16:9 · OFICINA CDMX ]`. Nunca generar imágenes random. Imágenes reales en `grayscale(1)` por default → color en hover.
9. **Solo 3 botones**: `.btn-primary`, `.btn-line`, `.btn-ghost`. Si necesitas un cuarto, replantea el patrón.
10. **Spacing escala 8px estricta.** Padding seccional `--sp-10` (160px) desktop, `--sp-8` (80px) móvil.
11. **Dark only**, hasta nuevo aviso.

---

## Estructura

```
/design-system-v2/
├─ tokens.css            ← color, type, spacing, motion. Único punto de verdad.
├─ components.css        ← reset, grid, section, buttons, links, inputs, navbar, footer.
├─ components-extra.css  ← hero, split, metrics, editorial-card, case-tile,
│                          marquee, scroll-stack, faq, cta-final, bottom-nav móvil.
├─ motion.css            ← reveals, cursor base, page-transition overlay, magnetic.
├─ motion.js             ← cursor lerp+rAF, split-text, scroll-stack, magnetic,
│                          marquee duplicate, faq, navbar scroll state, page-transitions SPA-lite.
├─ icons-reference.html  ← 16 iconos minimal stroke 1px.
├─ UI Kit.html           ← style guide navegable con manifiesto y todos los componentes.
└─ README.md             ← este archivo.
```

---

## Cómo importar en una página

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

<link rel="stylesheet" href="../design-system-v2/tokens.css">
<link rel="stylesheet" href="../design-system-v2/components.css">
<link rel="stylesheet" href="../design-system-v2/components-extra.css">
<link rel="stylesheet" href="../design-system-v2/motion.css">

<!-- al final del <body> -->
<script src="../design-system-v2/motion.js"></script>
```

`motion.js` se auto-inicializa al `DOMContentLoaded`. No necesita configuración.

---

## Componentes incluidos

### Foundations
- Color (8 tokens), type scale (6 niveles + mono), spacing (escala 8px), motion (3 easings + 4 durations), grid 12-col gutter 24px max-w 1440px.

### Core
- Botones: `.btn-primary` (underline animado), `.btn-line` (borde 1px → fill), `.btn-ghost` (solo texto). Modificador `.btn-sm`.
- Inputs minimal: `.field` con línea inferior 1px y label flotante.
- Links: `.link` (underline thickness 1px offset 4px), `.link-arrow` (mono uppercase con underline animado al hover).

### Layout
- `.nav` fija top h:72px con `.is-scrolled` (background blur). 5 links + 1 CTA.
- `.footer` full-bleed con `.footer-mark` masivo + 4 columnas.
- `.section` con padding seccional `--sp-10` / `--sp-8` mobile y `.section-num.is-corner` en mono.

### Patterns
- `.hero` h1 masivo + lead + actions + scroll indicator.
- `.split` 50/50 con `.is-flip`.
- `.metrics-row` 4 stats. `.metric.is-key` para la una métrica que va en verde.
- `.editorial-card` numerada · long-form · foto pequeña.
- `.case-tile` con hover mask grayscale → color + meta floating.
- `.marquee` infinito 40s, pausa en hover, contenido auto-duplicado por JS.
- `.scroll-stack` con 4 `.scroll-layer` apiladas vía sticky + JS de progress.
- `.faq` accordion sin chevron — solo línea que rota 90°.
- `.cta-final` full-bleed con tipografía gigante.

### Mobile (v2.2)
- En ≤768px la navbar colapsa a `.nav-mobile-bar` con solo logo + `.nav-toggle` (hamburguesa SVG).
- Tap → `.nav-overlay` full-screen `position: fixed; inset: 0; background: var(--bg-deep)`.
- Estructura del overlay (eyebrows con `—`, no `//`): Sitemap (5 links display), Verticales (chips 2×2), Connect + Preferencias en row dual, CTA accent full-width, Legal inline + foot con © y versión.
- Cierre vía botón ×, ESC, click en cualquier `<a>`, click en backdrop.
- `body.menu-locked` bloquea scroll del fondo. Inner del overlay tiene `overflow-y: auto` + `min-height: 100dvh` con `padding-bottom: env(safe-area-inset-bottom)`.

### Desktop nav (v2.2)
- Estructura de 2 filas: `.nav-topbar` (36px, mono micro, locations + social + toggles dummy idioma/theme) + `.nav-main` (72px, logo + 6 links + CTA).
- Mega-menu sobre "Verticales" (`<li class="has-mega">`) con 4 cards inline (1 por vertical). Hover open + click toggle + Esc/click-outside close.
- `.nav.is-scrolled` aplica blur+bg al scrollear. Hairline 1px en uniones. Sin glow.

---

## Atributos de comportamiento

| Atributo | Aplica en | Qué hace |
|---|---|---|
| `data-reveal="word"` | headings | split por palabras + IO reveal con stagger |
| `data-reveal="char"` | headings hero | split por letras |
| `data-stagger="40"` | con `data-reveal` | ms entre cada item (default 40ms) |
| `data-fade` | bloques no-tipográficos | fade-up al entrar viewport |
| `data-magnetic` | buttons | sigue cursor con lerp dentro de radio 100px |
| `data-cursor="view"` | imágenes / case-tiles | blob muestra label "VIEW" |
| `data-cursor="read"` | textos largos | blob muestra label "READ" |

---

## Verde — política v2.2.7 (3 tiers)

VAULT usa el verde en **3 niveles** para darle contraste editorial sin diluir el acento:

| Token | Hex | Tier | Uso |
|---|---|---|---|
| `--accent` | `#3DFF7F` | **Phosphor** (decisivo) | CTAs accent, métricas clave, progress active, blink cursor, hover sólidos |
| `--accent-mint` | `#AEFFC8` | **Mint** (informacional) | Eyebrows, section-nums, hover de links, arrows, mega-menu numbers |
| `--accent-soft` / `--accent-glow` | rgba(61,255,127, 0.08 / 0.35) | **Soft** (atmósfera) | Backgrounds sutiles, glows decorativos selectos |

**Regla:** el phosphor sólido sigue escaso (CTAs y un par de microinteracciones). El **mint** aparece en lugares informacionales — el ojo lo lee como "verde de iBisne" pero no compite con el phosphor. Esto da ~25% más presencia de verde en el sistema sin perder jerarquía.

**Botón `.btn-accent`**: verde phosphor sólido, texto bg-deep. Hover oscurece el verde (`color-mix 75% accent + 25% black`), texto se mantiene oscuro. Reservado para CTAs decisivos: nav APLICAR, CTA-final, cta-block premium, CTA del overlay móvil.

## Verde phosphor — checklist de uso

Si el sitio tiene más de 7 apariciones de `var(--accent)`, hay que reducir. Apariciones permitidas en el home:

- [ ] Cursor blob en hover de buttons (1, dinámico)
- [ ] Indicador activo del navbar (`.nav-links a.is-active::before`)
- [ ] Tick animado del scroll-indicator del hero
- [ ] Una métrica `.metric.is-key` en `.metrics-row`
- [ ] El sl-num de la primera capa del `.scroll-stack`
- [ ] Underline de `.btn-primary` en hover (dinámico, dura 240ms)
- [ ] Hover de `.bn-fab` en el bottom-nav móvil

Cualquier uso adicional requiere defensa explícita.

---

## Voice & copy

- Editorial > técnico. Frases más largas, tono de socio, no de operador-en-trinchera.
- "Capital operativo para LATAM" → "Construimos negocios. No solo los financiamos."
- Stats con storytelling: "$42M desplegado" → "Cuarenta y dos millones de dólares. Cuarenta y siete equipos. Una sola tesis."
- Sin spanglish técnico (el estilo Operator Grid lo usa, VAULT lo evita).
- Negaciones con confianza: "No somos un fondo." "Si no funciona contigo, no estamos haciendo nuestro trabajo."

---

## Roadmap

1. **Fonts** — VAULT usa Inter Tight (Google Fonts) como primario. Cuando exista licencia de Söhne (Klim Type Foundry), reemplazar `--font-display` y `--font-body` apuntando a `/assets/fonts/` con `@font-face`.
2. **Imágenes reales** — primera pasada de stock editorial curado (Unsplash, licencia free) ya aplicada en 6 páginas (`assets/img/stock/`); 13 placeholders se mantienen para fotografía dirigida real (6 retratos del equipo, 4 portfolio companies, 2 portafolio público, 1 formulario decorativo). Treatment fijo: `filter: grayscale(1)` default → `grayscale(0)` en hover de la card.
3. **Páginas internas** — el sistema SPA-lite ya está activo. Cuando se construyan `nosotros.html`, `portafolio.html`, etc., funciona automáticamente sin código adicional, siempre que cada página tenga un `<main>` y los mismos imports CSS+JS.
4. **Toggle theme** — VAULT por ahora es dark only. Si se decide habilitar light theme, todos los tokens están preparados para ser sobreescritos en un selector `[data-theme="light"]`.

---

## Qué NO hacer

- No mezclar `var(--cyan)` u otros tokens de `/design-system/` con VAULT.
- No agregar variantes nuevas de botón sin removerlas de la lista de 3.
- No usar `var(--accent)` decorativamente. Es un acento de información, no de estilo.
- No usar emojis ni iconos de librería externa.
- No introducir gradientes, glows, neon, scanlines o efectos cyberpunk — eso es Operator Grid, esto es VAULT.
- No agregar JS frameworks (React/Vue/Svelte). HTML + CSS + vanilla JS, igual que v1.

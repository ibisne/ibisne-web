# VAULT · iBisne Design System — Handoff doc

> **VAULT (v2) es el sistema de diseño OFICIAL de iBisne.**
> El otro sistema (`/design-system/` "Operator Grid" v1) es legacy y queda solo en `pages/index.html`. Todo nuevo trabajo de UI debe consumir VAULT.

Si abres un chat nuevo para iterar este sistema, lee este archivo completo antes de tocar código. No infieras nada del v1; los dos sistemas son intencionalmente antitéticos.

Versión actual: **v2.3.6** · Última iteración real: la mega-card del nav desktop con padding 24/22px y min-height 180px.

---

## 1. Contexto de proyecto y de usuario

- **Empresa**: iBisne — holding LATAM con **4 verticales operativas** (no es un fondo VC tradicional). Capital + ejecución, mentalidad operadora, base en Guadalajara.
- **Usuario**: Eduardo Carriola, CEO. Español mexicano directo. Sin corporativismo. Le molestan los rodeos. Cuando dice "no funciona" o "se ve feo" tiene razón el 99% del tiempo — el bug es real, no perceptual.
- **Las 4 verticales** (sitemap canónico, no inventar):
  1. **Commerce Growth Partner** — rev share 12 meses, sin fees, sin equity dilutivo
  2. **Smart Capital** — vehículo de inversión 0% fee, tickets $25K · $100K · $250K USD
  3. **Emergente** — marketplace anti-monopolio, comisión regresiva 1–30%, pre-launch
  4. **Venture Lab** — idea-stage builder, equity 15–30% + capital $50–200K USD
- **Sitemap real del sitio** (vive ya construido en `/pages/index.html` v1, debe replicarse en v2 cuando se construyan páginas):
  `Home · Verticales · Portafolio · Nosotros · Blog · Contacto`
  No inventar otros (Manifiesto, Tesis, Equipo, Notas — esos NO son del sitio real, son nombres del UI Kit como demos).

---

## 2. Filosofía VAULT

**Antítesis** de Operator Grid v1 (cyberpunk-tech denso, cyan/violet, scanlines, glow). VAULT es **editorial, escaso, premium** — socio en penthouse, no operador en trinchera.

### Reglas duras (no negociables)

1. **Dark only.** Hasta nuevo aviso.
2. **Hairlines 1px solamente.** Nada de bordes gruesos, nada de box-shadows decorativos, nada de gradientes (excepción justificada: `.scroll-indicator .line` linear-gradient porque comunica fade del tick, no decoración).
3. **Tipografía masiva neo-grotesk hace el trabajo.** Inter Tight (Google Fonts) + JetBrains Mono. Söhne queda como aspiracional cuando exista licencia (Klim Type Foundry).
4. **Espacio negativo es la decoración.** Padding seccional 160px desktop / 80px mobile. Escala 8px estricta.
5. **Sin emojis. Sin iconos de librería externa** (Lucide, Heroicons, FontAwesome, Material). Solo el set propio en `icons-reference.html` (16 iconos stroke 1px `currentColor`).
6. **Sin scale/magnet/jiggle en buttons.** Hover sobrio (split-flap label + cambio de color/border).
7. **Cero parallax decorativo en imágenes.** La tipografía y los fondos cargan el ritmo.
8. **Cursor blob obligatorio** (vive en `motion.js`, desactivado en `pointer: coarse`).
9. **Imágenes en `grayscale(1)` por default** → color en hover. Placeholders editoriales: cuadros sólidos `#14191F` con label monospace `[ FOTO · 16:9 · OFICINA CDMX ]`. Nunca generar imágenes random.

### Markers de sección

- `§ NN.NN` — numeración (`§ 04.5 · Building blocks`). En mono micro, color mint.
- `—` (em dash) seguido de label — usado en eyebrows internos del overlay móvil (`— Sitemap` antes; ahora se quitaron porque eran ruido) y en numeración secundaria (`— Regla 01`).
- **NUNCA usar `//`**. Es marker del v1 Operator Grid. Si lo ves, es bug.

### Comunicación con Eduardo

- **No hablar con corporativismo.** Frases cortas.
- **Aceptar errores rápido** y arreglarlos sin explicación elaborada cuando el bug es real (ha pasado: cache, specificity wars, padding ignorado).
- **Antes de inventar copy o sitemap, verificar en el v1.** El v1 tiene la verdad de iBisne.
- **Las propuestas con tradeoffs** (más accent vs menos, full-width vs inline, etc.) — exponer el tradeoff y preguntar, no decidir solo.

---

## 3. Sistema de color (3 tiers de verde)

```css
--bg-deep:    #0A0E13;   /* abismo — hero, CTA final, manifesto, mega-panel */
--bg:         #0D1117;   /* base — la mayoría */
--bg-paper:   #14191F;   /* elevado — data sections, hovers de cards */
--bg-line:    #1E242B;   /* hairlines 1px */

--text-primary:   #F2F2F2;   /* nunca #FFF puro */
--text-secondary: #8B9099;
--text-muted:     #4A5058;

--accent:       #3DFF7F;   /* PHOSPHOR (decisivo) — CTAs accent, métrica clave, blink cursor, progress active */
--accent-mint:  #AEFFC8;   /* MINT (informacional) — eyebrows, section-nums, hover de links, arrows */
--accent-glow:  rgba(61, 255, 127, 0.35);   /* atmósfera — backgrounds sutiles */
--accent-soft:  rgba(61, 255, 127, 0.08);   /* atmósfera */
```

### Política del verde (post v2.2.7)

| Tier | Donde aparece |
|---|---|
| **Phosphor sólido** | `.btn-accent` (nav APLICAR, CTA-final ENVIAR, CTA-block, CTA del overlay móvil), `.metric.is-key .num`, `.h-progress-line.is-active`, `.cta-input-wrap::after` (blink), nav active dot, cursor blob hover sobre buttons, `.tag.is-status.is-active` |
| **Mint** | Todos los `.eyebrow`, todos los `.section-num`, hover de `.link`, hover del arrow en `.menu-link`/`.link-arrow`, nav-links hover y active state, mega-card hover footer, mega-eyebrow |
| **Soft / glow** | Backgrounds atmosféricos selectos (poco usado por ahora) |

**Regla de oro**: el phosphor es el "sí" decisivo. Mint es información viva. Si el componente no es decisivo NI informacional, va en muted/secondary.

---

## 4. Estructura de archivos

```
/design-system-v2/
├─ tokens.css            ← color, type, spacing, motion, z-index, keyframes ambient
├─ components.css        ← reset, grid, section, type helpers, links, BUTTONS, inputs, navbar, footer
├─ components-extra.css  ← hero, split, metrics, editorial-card, case-tile, marquee,
│                          scroll-stack, faq, cta-final, NAV OVERLAY mobile, tag, blockquote,
│                          stat-callout, tier-table, note, cta-block, toggle, icon-btn,
│                          horizontal verticales, ambient (drift/breathe), grain, page-transition
├─ motion.css            ← reveals, cursor, page-transition overlay, grain, reduced-motion
├─ motion.js             ← cursor (lerp+rAF), split-text reveals, scroll-stack, marquee,
│                          FAQ, navbar scroll state, MEGA MENU, NAV MOBILE TOGGLE,
│                          horizontal verticales, BG fade observer, page-transitions SPA-lite,
│                          grain shuffler
├─ icons-reference.html  ← 16 iconos minimal stroke 1px
├─ UI Kit.html           ← style guide navegable. ÚNICO archivo de "página" en el v2 hoy.
│                          Versión bumpeada vía `?v=X.Y.Z` en cada `<link>` y `<script>`.
├─ README.md             ← doc del sistema
└─ HANDOFF.md            ← este archivo
```

**El UI Kit.html es el demo navegable.** No hay `index.html` v2 todavía. Cuando se construyan páginas reales (home, verticales, etc.), heredan los 4 CSS + motion.js + estructura del nav.

---

## 5. Componentes ya construidos en VAULT

### Foundations
- Color (4 bg + 3 text + 4 accent), type scale (6 niveles + mono), spacing (escala 8px), motion (3 easings + 5 durations), grid 12-col gutter 24px max-w 1440px, z-index (`--z-base` 1, `--z-sticky` 20, `--z-nav` 50, `--z-cursor` 90, `--z-overlay` 100, `--z-page-transition` 105, `--z-modal` 110).

### Core (components.css)
- **Botones** — `.btn` base + `.btn-primary`, `.btn-line`, `.btn-ghost`, `.btn-accent` (4 variantes). Modificador `.btn-sm`. Estados: `[disabled]`, `.is-loading`. Con icon: `.btn-icon` + SVG leading o trailing.
  - Hover `.btn-accent`: bg verde se oscurece (`color-mix(in srgb, var(--accent) 75%, black)`), texto se mantiene en bg-deep. Decisión basada en feedback iterado (no se vuelve blanco, no se "despinta").
- **Split-flap label**: `<span class="btn-label" data-text="LABEL">LABEL</span>` con dobles pseudo (`::before` original, `::after` duplicado), invisible vía `visibility: hidden` + `overflow: hidden`. Hover desliza ambos -100%, 60ms delay en el segundo.
- **Inputs** — `.field` con label flotante. Focus pasa la línea inferior a mint, label a mint. Resize solo vertical. `box-sizing: border-box` para no desbordar.
- **Links** — `.link` (underline thickness 1px offset 4px, hover a mint), `.link-arrow` (mono uppercase con underline animado).

### Layout
- **Navbar de 2 filas** desktop: `.nav-topbar` (36px, mono, slogan + locations + social + ES/EN toggle) + `.nav-main` (72px, logo + 6 links + theme toggle + APLICAR).
- **Mega-menu** sobre "Verticales": panel 920px con 4 cards (sin números, sin "Ver vertical →" — solo title + tag), padding 24/22px interno, hover bg-paper y border mint. JS: hover open + click toggle + Esc/click-outside close.
- **Nav mobile bar** (≤768px): `VAULT logo · toggle theme · hamburger/×` (un solo `.nav-toggle` con SVGs internos toggleables vía `aria-expanded`). Permanece visible encima del overlay (z-index sube cuando `body.menu-locked`).
- **Footer** — `.footer-mark` masivo + 4 cols.
- **Section** — padding 160/80, `.section-num.is-corner` mono mint en esquina, `.eyebrow` con line de 24px y texto mono mint.

### Patterns (components-extra.css)
- `.hero` — h1 masivo + lead + actions + scroll indicator
- `.split` (.is-flip) — 50/50 imagen+texto alternable
- `.metrics-row` — 4 stats con `.metric.is-key` para LA métrica focal
- `.editorial-card` — long-form numerada
- `.case-tile` — hover mask grayscale → color
- `.marquee` infinito 40s con pausa en hover (auto-duplicate vía JS)
- `.scroll-stack` — sticky storytelling, **paneles full-bleed 100vw × 100vh** (rediseñado en v2.2 — antes era inset 8% como cards flotantes, Eduardo lo odió)
- `.verticals-horizontal` — golpe de teatro sticky + scroll lateral, 4 paneles full-bleed con progress lines laterales (mint)
- `.faq` — accordion sin chevron, línea que rota 90°
- `.cta-final` — full-bleed con tipografía gigante + input email con cursor parpadeante
- `.cta-block` — variante compacta para CTAs inline (1 col en mobile, button full-width)

### Building blocks
- `.tag` (con `.is-solid` y `.is-status`/`.is-active`)
- `.toggle` (pill ES/EN, sun/moon)
- `.blockquote` — pull quote editorial. **Mobile colapsa a stack vertical** (mark arriba, body, attr).
- `.stat-callout` — un solo número focal grande (variante focal del metrics-row). Mobile colapsa a 1 col, unit como block debajo.
- `.tier-table` — comparación de planes con scroll horizontal interno en mobile via `<div class="tier-table-wrap">` envolviendo la `<table>`.
- `.note` y `.note.is-regulatory` — disclaimers tipo CNBV con border-left vertical
- `.icon-btn` — botón cuadrado 40×40

### Mobile overlay (`.nav-overlay`)
- Full-screen, sin scroll posible (`overflow: hidden`).
- 5 zonas: SITEMAP (6 links, sin numbers ni guiones decorativos) → CONNECT (4 social full-width altos) → CTA accent full-width → FOOT (legal inline + idioma toggle + ©).
- **NO tiene su propio header.** El `.nav-mobile-bar` (logo + theme toggle + hamburger/×) permanece visible encima del overlay con z-index `calc(var(--z-overlay) + 1)`.
- `body.menu-locked` bloquea scroll del fondo.
- Cierre vía: hamburger toggle (mismo botón, ícono cambia con `aria-expanded`), Esc, click en `<a>`, click en backdrop.

### Ambient motion (decoración perpetua sutil)
- **Grain**: SVG turbulence con `feTurbulence`, `mix-blend-mode: overlay`, opacity 0.04, JS reshuffle background-position cada 200ms.
- **Hairline drift** (`.hairline-drift`): keyframes 18s ease-in-out alternate translateY 1px. Disponible como utility, no muy usado todavía.
- **Type breathe** (`.t-breathe`): keyframes 8s sobre el `42` del metrics is-key. letter-spacing -0.04 ↔ -0.038 + opacity 1 ↔ 0.94. El sitio "respira".
- **Page transitions**: overlay negro con `IBISNE` mark, sube 800ms, swap `<main>`, baja 1000ms. SPA-lite intercepta `<a>` internos.
- **Reveals**: `data-reveal="word"` o `data-reveal="char"` con stagger 40ms (override con `data-stagger`).

---

## 6. Issues conocidos / decisiones difíciles aprendidas

### Specificity wars
- `.nav-links a` (specificity 0,1,1) tenía `padding: 4px 0` + `text-transform: uppercase` y heredaba a `.nav-mega-card` (que es un `<a>` adentro). Resultado: el padding generoso de la card era ignorado.
- **Fix v2.3.5**: doble selector `.nav-links a.nav-mega-card, .nav-mega-card` + `!important` en padding/text-transform/letter-spacing/font-family.
- **Lección**: cuando un componente vive dentro de un selector de mayor specificity, hay que ganarle el cascade. No basta con definir la regla con la clase del componente.

### Cache del navegador
- El UI Kit tiene `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">` + `?v=X.Y.Z` en cada `<link>` y `<script>`.
- Cada cambio de CSS/JS bumpea la versión (formato semver).
- Si Eduardo dice "veo lo viejo" → es cache pegado del navegador. Recomendar `Ctrl+Shift+R` o ventana incógnita.
- Localmente el preview tool mete a veces viewport raro (`window.innerWidth: 728` aunque preset sea mobile 375). Las CSS media queries reaccionan al viewport real del browser; el visual del preview es engañoso a veces.

### Subagentes y modelos
- Eduardo pide explícitamente que se delegue a Sonnet/Haiku para evitar gastar Opus innecesario. **CSS isolated tasks** (agregar building blocks, refactor de un solo archivo) son ideales para Sonnet. **HTML markup cruzado + design judgment** se queda en main.
- Patrón: el agente principal escribe el spec del CSS exacto, lo pasa a un subagent Sonnet con la instrucción de "edit este archivo, sin búsquedas amplias". Si el subagent vuelve con "plan" en vez de ejecutar, aplicar el edit en main directamente.

### Mega-menu — múltiples iteraciones
1. v1: cards bordeadas pesadas con bg-paper → "se ve disonante con el sistema"
2. v2: lista plana editorial → "se ve plano, sin estructura"
3. v3: cards en grid 2x2 con números + tagline + "Ver vertical →" → "amontonado, números innecesarios"
4. v4 (actual v2.3.6): grid 4 cols, cards `padding: 24px 22px`, `min-height: 180px`, **solo title + descripción**, sin números ni botón secundario.
- **Lección**: en VAULT, "menos es más" no es slogan — es regla. Cuando hay duda, quitar.

### Botones full-width en mobile
- Todos los botones de **acción** (no de demo): `.hero-actions .btn`, `.cta-foot .btn`, `.cta-block .cb-actions .btn`, `.menu-cta .btn` → `width: 100%` en `≤768px`.
- Los botones de **demo** del UI Kit (en `.demo-row`) NO se hacen full-width — son documentación de tamaño natural.
- El nav `.btn-sm` y `.icon-btn` tampoco se hacen full-width.

---

## 7. Cómo iterar

### Servir local
```powershell
cd C:\Users\ibisn\OneDrive\Desktop\iBisneVC
python -m http.server 8787
```
Abrir: `http://localhost:8787/design-system-v2/UI%20Kit.html`

### Ver mobile real
DevTools (`F12`) → device toolbar (`Ctrl+Shift+M`) → iPhone SE / iPhone 12 / Pixel.

### Cuando hay queja sobre un componente específico
1. Verificar primero si es **cache** (Ctrl+Shift+R o incógnito).
2. Si no es cache, abrir DevTools → Computed Styles del elemento → ver qué selector está ganando.
3. Si hay specificity war, subir specificity o usar `!important` puntual.
4. Bumpear `?v=X.Y.Z` en `UI Kit.html` (todos los `<link>` y `<script>` lo tienen).

### Antes de tocar
- Leer este HANDOFF.md
- Leer `README.md`
- Si es la primera vez con el repo: leer también `/CLAUDE.md` raíz (tiene contexto del v1 y reglas globales)
- **NUNCA** mezclar tokens de v1 (`--cyan`, `--violet`) con v2 (`--accent`, `--accent-mint`)

---

## 8. Pendientes y roadmap

### Inmediato
- v2.3.6 funcional. Si Eduardo lanza nueva queja, iterar sobre lo que diga literalmente.
- Verificar todas las fonts cargan (Inter Tight de Google Fonts + JetBrains Mono).

### Próximas fases (cuando Eduardo lo pida)
- Construir `pages/index-v2.html` aplicando VAULT al home real con el copy oficial (Hero LOCKED del Operator Grid: "Si funciona, es porque lo operamos…").
- Construir `pages/verticales/*.html` — cuatro páginas de las 4 verticales.
- Migrar `pages/index.html` (Operator Grid v1) a VAULT, o decidir si v1 queda como histórico.
- Sustituir placeholders editoriales por fotografía dirigida real cuando exista.
- Habilitar light theme cuando se decida (todos los tokens están preparados para `[data-theme="light"]` override).
- Resolver licencia de Söhne (Klim Type Foundry) para reemplazar Inter Tight como `--font-display`.

### Componentes no priorizados (agregar si Eduardo los pide)
- Tabs / Breadcrumb / Pagination (para blog y portfolio internos)
- Code block / pre (para memos técnicos)
- Logo wall estático (alternativa al marquee)
- Newsletter inline form
- Modal / dialog (para deck-request, aplicaciones LP)

---

## 9. Lo que NO hacer (errores cometidos en sesiones pasadas)

- **No inventar copy/sitemap/labels.** Si no recuerdas algo de iBisne, leer el v1 (`pages/index.html`) o pedir a Eduardo.
- **No usar `//` como markers.** Es del v1. VAULT usa `§` y `—`.
- **No agregar gradientes, glow, scale, magnet, jiggle, parallax, blur decorativo.** Lo que sea cyberpunk-y rompe el sistema.
- **No usar emojis.** Ni en UI ni en docs (a menos que Eduardo pida explícito).
- **No usar iconos de librerías** (Lucide, Heroicons, Material, FA). Solo el set propio.
- **No introducir frameworks JS.** Vanilla JS. Punto.
- **No mezclar magnetic con VAULT** — el código legacy fue purgado en v2.2.2; no reintroducirlo.
- **No introducir nuevos botones** sin defenderlo y removerlos del baseline. Hay 4 (`primary`, `line`, `ghost`, `accent`) + `sm` modifier + estados (disabled, loading, with icon). Cubre todo.
- **No agregar verde fuera del sistema de 3 tiers.** Si necesitas un verde, usa `--accent`, `--accent-mint`, `--accent-glow`, o `--accent-soft`. Si necesitas un cuarto, defenderlo.
- **No tocar `/design-system/` (v1 Operator Grid).** Ese sistema está congelado. Cualquier cambio se hace en `/design-system-v2/`.

---

## 10. Cierre

Si lees esto en un chat nuevo, los siguientes mensajes deberían:

1. Confirmar al usuario que entendiste que **VAULT (v2) es el sistema oficial**.
2. Mencionar la versión actual (`v2.3.6` en el momento de este handoff).
3. Preguntar qué quiere iterar antes de tocar código.
4. **No pedir contexto** que ya está aquí. No re-explorar el repo si la pregunta cae bajo "lo que ya está construido".

Si Eduardo dice "se ve raro" sin más contexto, pedir screenshot y elemento específico — los problemas en este sistema casi siempre son: cache pegado, specificity de CSS, o un padding/gap del nav heredándose. Diagnosticar en ese orden.

— Generado al cierre de la sesión que terminó en `v2.3.6` con la mega-card padding 24/22.

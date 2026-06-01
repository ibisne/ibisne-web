# CLAUDE.md — iBisne web

Instrucciones permanentes para cualquier sesión de Claude Code en este repo.

## Contexto del proyecto

iBisne es un **holding LATAM** con vocación operativa (no fondo VC tradicional). El sitio web debe transmitir: capital + ejecución, mentalidad operadora, autoridad.

**El sitio web actual (v16.0.0) es una SPA landing única con pricing simplificado + Powerups ×4 + quiz inline 2-steps.** Páginas activas: `index.html` (SPA landing 11 secciones · sin segmented pago · Powerups features dentro de cada card · sin sección Mantenimiento en home) · `quiz.html` (cotizador completo · intacto desde v11.8). Categorías cubiertas en el pricing toggle: **Webs · Apps móviles · Ecommerce · CRM · ERP · SaaS · IA & Automatización** (7 categorías · 21 planes totales). Cualquier referencia histórica a marketplace 3-sided, portal inversor, co-financiamiento Spark/Build/Grow/Scale o "3 puertas" pertenece al modelo v4 que fue MATADO en v5.0 (2026-05) · esas pantallas se purgaron en v8.1.0. Si necesitas rescatar algo, vive en git history.

**v16.0 · Pricing simplificado + Powerups ×4 + features extensas.** Soluciona 6 puntos de feedback de Eduardo sobre v15.0:
- **Powerups dentro de cada card**: cuando se activa el master toggle, las 5 capacidades aparecen como features adicionales con divider "Con Powerups activados" dentro de cada plan (CSS `display:none/flex` según `.pt-panel.is-powerups-on`).
- **Powerups ×4 al precio base (+300%)**: deja de ser "5 features sumadas +43%" y se vuelve "transformación premium del proyecto". Sitio Web $10k → $40k. Reparto interno: animaciones +75% · dark/light +30% · multi-idioma +90% · multi-moneda +60% · PWA +45% = suma 300%.
- **Eliminado segmented mes/exhibición**: precio único por plan. `state.exhibicion` y `DATA.exhibicion`/`mensualidad` eliminados.
- **Features extensas concepto-por-línea**: refactor de los 21 planes en `data/precios-v13.js`. Ej: "SEO base + Analytics (GA4)" → 2 líneas separadas con copy mejorado ("SEO adaptado al objetivo" + "Analytics (GA4) configurado"). Cada card tiene 7-14 features según el plan.
- **Sección §07 Mantenimiento eliminada del home · reemplazada por "Después del lanzamiento"** (3 cards sin precio que mencionan mantenimiento + soporte + marketing como módulos que se definen en checkout futuro). `mantenimiento[]` queda en `data/precios-v13.js` para reuso futuro.
- **Quiz inline simplificado a 2 steps**: Plan → Form (sin step de mantenimiento). `htmlStep2`, `state.selectedMantenimiento`, `selectMantenimiento` eliminados del JS.
- **Soporte movido a `plan.checkout.soporte`** (string · no se renderiza en home · queda en data para checkout).
- **FAQ ajustado**: pregunta de pago mes/exhibición eliminada; pregunta de Powerups actualizada a +300% explicando que las features aparecen dentro de cada card; pregunta de mantenimiento reformulada apuntando al checkout.



**v15.0 · Pulido UX (8 puntos de Eduardo).** Soluciona feedback sobre v14.0 ("se ve plano, todo blanco, simple"):
- **Tokens fix crítico**: `--bg-paper #FFFFFF → #FAFAFA` (gris papel sutil). Antes era idéntico a `--bg` y la alternancia de secciones bg-base/bg-paper era invisible. Ahora se distinguen claramente. `--bg-deep` queda como estaba (backward compat con 404.html, toggle-switch knob, etc.).
- **Topbar utility nuevo** (`.site-topbar` arriba del header sticky): mensaje izq "Cotiza tu proyecto en 3 min · sin compromiso" + tb-toggle ES/EN + sep + tb-toggle MXN/USD (toggles visuales por ahora, sin scope de i18n). Sticky `top: 0`, header pasa a `top: 36px`. Mobile (<600px) topbar oculto.
- **Nav principal reorganizado** (grid `1fr·auto·1fr`): logo izq · nav centro · actions der (theme toggle dark/light circular icon-only + botón azul "Contacto"). El botón Contacto reemplaza al "Cotizar ahora" y abre modal con 3 cards (WhatsApp · Email · Teléfono). Theme toggle persiste en localStorage key dedicada `ibisne-site-theme` (no interfiere con UI Kit ni cotizador).
- **Eyebrows refactoreados** (CSS + 7 HTML): eliminada la línea decorativa `.eyebrow::before` 24×1px y el em-dash inicial. Todos en sentence case ("Lo que hacemos" en lugar de "— LO QUE HACEMOS"). Tamaño de fuente sube de micro a small para legibilidad.
- **Pricing controls single-row**: el master toggle Powerups era un bloque grande full-width con title+sub+pct; ahora es un pill compacto inline `[switch 32×18 · "Powerups +43%"]` al mismo height del segmented control de pago. Pills info-only de los 5 powerups viven debajo de los controles, siempre visibles, se iluminan cuando master está on.
- **Quiz inline** (pieza más compleja · `pricing-table.js` reescrito a 620L): cada card de plan tiene botón "Seleccionar" uniforme. Click → highlight card + aparece **step 2** debajo con 3 cards de mantenimiento (Básico $5k · Premium $10k · **Sin mantenimiento $0** card neutral). Click una opción → **step 3** con form de captura (nombre · email · empresa). Submit → abre WhatsApp con prefill completo (categoría + plan + mantenimiento + pago + powerups + datos) + POST async a `/api/lead.js` (webhook Slack + Resend). Confirmación inline con link de respaldo. switchCategoria reinicia state.selectedPlanId + steps.
- **FAQ 2-col desktop**: grid `1fr 1fr` en ≥900px con spacing apretado. Más compacto, menos scroll en desktop.
- **Microinteracciones**: 6 grids con `data-reveal-stagger="40-60"` (servicios, diferenciadores, pasos, mantenimiento, testimonios, FAQ). Activa `initRevealStagger` de motion.js que ya estaba implementado pero no usado · cards entran progresivas al viewport.

**v14.0 · SPA Landing única (pivot multipágina → SPA).** El sitio era multipágina (`index.html` v13.3 + `webs.html` v13.2 + páginas pendientes apps/shopify/software/clientes). Eduardo decidió consolidar todo en una sola landing larga enfocada en venta. Estructura de la SPA (11 secciones · scroll vertical):
- **§ 00 Header sticky** · logo + nav anchors (#servicios, #diferenciadores, #pricing, #mantenimiento, #faq) + CTA azul Cotizar ahora.
- **§ 01 Hero** · h1 "Construye lo que tu negocio merece" con fondo de **video tech** (cae a fallback CSS hermoso: gradient angular dark + SVG dots flotantes + vignette · cuando dropees `.mp4`/`.webm` en `/assets/hero/` los browsers los servirán automáticamente). 2 CTAs (Ver precios + Cotizar ahora).
- **§ 02 Social proof** · marquee con nombres de clientes (placeholders ProFutbol · Medical Mexicanna · SEM Endomap · etc.).
- **§ 03 Servicios** · 7 cards (Web · Apps · Ecom · CRM · ERP · SaaS · IA) + 1 "A la medida" que linkea al cotizador.
- **§ 04 Diferenciadores** · 5 cards (Soporte dedicado · 24/7 · 0→launch · 1 año · Imperios).
- **§ 05 Cómo trabajamos** · 4 pasos numerados.
- **§ 06 ★ PRICING con TOGGLE** · pieza central. Tabs horizontales de 7 categorías → renderiza un solo bloque dinámico (2-4 planes según categoría). Segmented mes/exhibición (-20%) + master toggle Powerups todo-o-nada (+43%) + tabla comparativa colapsable. Cada plan tiene CTA a WhatsApp con prefill (categoría + plan + estado de toggles).
- **§ 07 Mantenimiento** · Básico $5k + Premium $10k (heredado v13.2 expandido con marketing).
- **§ 08 Testimonios** · 3 placeholders genéricos (Eduardo provee reales después).
- **§ 09 FAQ extendido** · 10 preguntas incluyendo una por categoría.
- **§ 10 CTA final** · "Empieza esta semana" + 2 CTAs.
- **§ 11 Footer 4 cols** · Brand · Sitio · Empezar · Legal.

**Datos v14.0**: `data/precios-v13.js` con 7 categorías × 21 planes totales. Hereda exhibición -20%, powerups +43%, mantenimiento de v13.2. Rangos: Webs $1k-$10k · Apps $20k-$80k · Ecommerce $15k-$90k · CRM $40k-$90k · ERP $50k-$200k · SaaS $45k-$280k · IA $12k-$60k.

**JS v14.0**: `assets/sitio/pricing-table.js` reescrito como `renderSPA(el, initialCategoria)`. Lee `data-pricing-spa="webs"`. Renderiza shell (tabs + controles globales) una vez, re-renderiza solo el panel interno al cambiar categoría (sin flicker). Mantiene state de exhibición + powerupsOn al cambiar categoría.

**CSS v14.0**: `assets/sitio/pricing-table.css` agrega `.pt-cat-tabs` (tabs horizontales scroll) + `.pt-cat-head` (title + tagline dinámicos) + grid `[data-plans]` para soportar 2/3/4 cols según categoría.

**Eliminadas en v14.0**: `webs.html` (su contenido se absorbe en SPA · redirect 301 en `vercel.json` de `/webs.html` y `/webs` → `/#pricing`). `data/precios-v12.js` queda como histórico (no se carga en producción, lo reemplaza precios-v13.js).

**v13.2 · Design System Apple-like completado al 100%.** Rework completo del DS de dark editorial verde a **light Apple monocromático**:
- **Color**: blanco/negro Apple (`#FFFFFF`/`#1D1D1F`) + grises (`#F5F5F7`, `#86868B`) + azul Apple `#0071E3` exclusivo (focus, links, CTA recomendado, toggle iOS on) + rojo `#E5484D` para errores. **Cero verde** (phosphor y mint eliminados · alias-legacy convertidos a `--text-muted`).
- **Tipografía**: Inter Tight sentence case en todo · mono uppercase reservado SÓLO a numéricos (`.metric .num .unit`, `.sc-num`, `.h-panel-num`, `.h-progress-num`, `.sl-num`, `.ec-num`, `.scroll-indicator`, `.tag`, `.placeholder`, `.t-mono`). 30 selectores refactoreados de mono→display.
- **Motion**: motion.js 717→498 (-219L) eliminando `initCursor` + `initGrain` + `initScrollStack` + `initHorizontal`. motion.css 230→154 (-76L). Total ~295L de teatro eliminado.
- **Pricing v13.2** (`assets/sitio/pricing-table.{js,css}` + `data/precios-v12.js`): pago mes a mes (÷12 cuotas Visa/Mastercard/Amex) vs **pago en exhibición -20%** (era -25%). Powerups **todo-o-nada** vía master toggle iOS-style "Activar Powerups (+43%)" que habilita los 5 simultáneo (animaciones +10% · dark/light +5% · multi-idioma +15% · multi-moneda +8% · **PWA +5%** nuevo). Pills info-only se iluminan cuando master está on.
- **Mantenimiento expandido** con marketing: Básico ($5k/mes "Tuyo que no muere") = 12 piezas + 2 redes + 1 historia + soporte horario oficina; Premium ($10k/mes "Acompañamiento 360°") = 20 piezas + 4 redes + 3 historias + reportes + 2 reuniones + soporte 24/7 teléfono+Meet.
- **Webs**: featureRows comparativos con fila "Soporte técnico" (email 48h · WA+email oficina · ampliable 24/7). 3 links `cotizador.html`→`quiz.html` fixeados. Header + footer dentro de `.container 1320` alineados al contenido.
- **UI Kit** (`design-system-v2/UI Kit.html`) ahora con toggle Light/Dark de preview en topbar (localStorage persistente). icons-reference y HANDOFF.md migrados a v13.2. Sections legacy `verticales-horizontal` y `scroll-stack` ocultas con `hidden` (CSS preservado para histórico).

**v11.8 · Cart bottom-bar ELIMINADO · pagos inline en #/resultado.** El cart bottom-bar fijo abajo (de v11.0-v11.7) se eliminó por completo. El wizard ahora ocupa el ancho completo del viewport sin barra inferior persistente. Payment plan + código descuento + CTAs PayPal/WhatsApp se renderizan inline como sección `<article class="rk-card rk-payment-inline">` dentro de la pantalla `#/resultado`. Funciones `renderCartContent`, `bindCart`, `flyToCart` eliminadas (~390 líneas). `refreshCart` queda no-op para no romper call sites legacy. Funciones nuevas: `renderPaymentPlanInline(calc)` + `bindResultadoPayment()`. CSS §17 (~150 líneas) y §19 (fly-to-cart) eliminados. Tokens `--ds-cart-w` y `--ds-cart-peek` removidos del cotizador. Trade-off: no hay TOTAL en tiempo real durante subflow (Eduardo lo aceptó).

**v11.7 · fix labels cortados (descenders).** `line-clamp:1` cortaba descenders (g, p, y) por overflow:hidden con line-height tight. Cambio a `white-space:nowrap + text-overflow:ellipsis` que respeta altura natural de la fuente.

**v11.6 · Pricing escalado + cart bar CTA cuando vacío + line-clamp + grid 3-col.**
1. **Pricing**: 212 opciones con `add: 500` reasignadas a valor proporcional al base del servicio (web-bio +1000 · landing +1500 · funnel +2500 · sitio +3500 · apps +2500-6500 · ecom +1500-5500 · plat +1000-7500). Cada opción se siente como compromiso real, no "casi gratis".
2. **Cart bar copy**: cuando cart está vacío, el header muestra "Configura tu cotización ↑" en accent-mint en lugar del em dash "TOTAL · — MXN" (que era casi invisible). Cuando hay items, TOTAL animado normal.
3. **line-clamp 1 en labels** + **line-clamp 2 en subtitles** de cards (mega/service/sf/type). Garantiza que el `height` fijo no se rompa con labels de 2 líneas (ej. "Bio link / Página de enlaces"). Texto largo → ellipsis ···.
4. **Grid escala progresiva** mobile(1) → tablet(2) → desktop(3). Eduardo prefirió 3×3 sobre 4×4. Plataformas con 9 servicios queda 3×3 perfecto sin huérfanas.

**v11.5 · Grid 4-col desktop + cards compactas + type-cards con precio.** (superseded by v11.6)
1. Type-cards (chooser de tipo del servicio) muestran "desde +$X" calculado vía `calcTypeMinPrice(servicio, tipoId)` · suma base + primera opción default de cada pregunta `byType[tipoId]` · consistente con service-cards.

**v11.4 · Cards altura FIJA + cart bar muestra TOTAL siempre visible.**
1. `.mega-card/.service-card/.sf-card/.type-card` con `height: clamp(240px, 18vw, 256px)` (height fijo, no min-height) + `justify-content: space-between` · TODAS las cards verticales del wizard tienen EXACTAMENTE la misma altura sin importar contenido · cero variación visual entre pantallas.
2. Header del cart bottom-bar muestra "TOTAL · $X MXN" siempre visible (colapsado y expandido) · animateNumber + flash al cambiar · usuario ve cifras subir sin tener que abrir el cart.

**v11.3 · Service Worker network-first + auto-reload.** El SW pasó de `stale-while-revalidate` a `network-first` para HTML/CSS/JS · siempre intenta red fresca; solo cae al cache si hay error de red (offline). Las imágenes mantienen cache-first. Además, al activar una versión nueva, el SW notifica a los clientes y `pwa.js` hace `location.reload()` automático · usuarios ven cambios instantáneo después de cualquier deploy, sin hard reload manual.

**v11.2 · cart real-time + altura de cards estable + copy progresivo.**
1. `computeCart()` ahora incluye el servicio "en configuración" (State.subflow) en el subtotal y total · cart bottom-bar refleja la cifra real desde el primer click en un servicio (no solo después de confirmarlo).
2. `.mega-card/.service-card/.sf-card/.type-card` con `min-height: clamp(200px, 18vw, 224px)` · todas las cards verticales tienen la misma altura visual sin importar contenido (badge, foot extra, subtítulos largos).
3. Service-card precio: "desde $X" → "desde +$X" · el "+" comunica que ese servicio va a SUMAR al carrito (no es un total estático).

**v11.1 · layout estable entre pantallas del wizard.** Grids unificados: `.mega-grid/.service-grid/.sf-grid/.type-grid` comparten misma anatomía (1col mobile · 2col ≥768 · 2col ≥1100, gap `sp-4` desktop/tablet, gap `sp-3` mobile). Type-grid ya no salta a 3col en desktop. `.addon-list` alinea `margin-top: sp-4` con el resto. Resultado: entre catálogo → servicios → tipo → preguntas → addons → confirm, las cards mantienen mismo ancho/padding/gap; solo varía la cantidad.

## El design system OFICIAL es **VAULT (v2)** — `/design-system-v2/`

> **VAULT es el sistema oficial.** Vive en `/design-system-v2/`.
> Antes de tocar cualquier archivo de UI: **leer `/design-system-v2/HANDOFF.md` completo + `/design-system-v2/README.md`** en cada sesión nueva.
>
> Estética: editorial dark, hairlines 1px, tipografía masiva neo-grotesk (Inter Tight), 3 tiers de verde (phosphor `#3DFF7F` + mint `#AEFFC8` + soft).
>
> Versión actual: ver `?v=X.Y.Z` en `<link>` y `<script>` de `design-system-v2/UI Kit.html`.

### El sistema "Operator Grid" (v1) es legacy

Vivía en `/design-system/` y `/pages/index.html` con estética cyberpunk-tech (cyan/violet, scanlines, glow). Esas carpetas se eliminaron del repo (v1 vive solo en git history). **No resucitar** salvo que Eduardo lo pida explícito. Cualquier nuevo trabajo de UI consume VAULT v2.

Si encuentras código v1 mezclado en archivos nuevos (markers `//`, tokens `--cyan`/`--violet`, fuentes Space Grotesk, glow, scanlines) → es bug, limpiar.

## Reglas duras (VAULT v2)

1. **No tocar `/design-system-v2/tokens.css`, `components.css`, `components-extra.css`, `motion.css`, `motion.js` sin justificación.** Son el contrato. Si faltan tokens o componentes, pídelos a Eduardo antes de inventar.
2. **No hardcodear colores, fonts, sizes, spacings.** Todo sale de `tokens.css` v2 (variables `--bg-*` / `--text-*` / `--accent` / `--accent-mint` / `--accent-glow` / `--sp-*` / `--fs-*` / `--font-*`). El cotizador define una capa mínima propia en `assets/quiz/styles.css` (`--hud-h`, `--ds-cart-w`, clamps de título) — todo lo demás consume VAULT.
3. **No instalar librerías de UI** (shadcn, Material, Chakra, Tailwind UI, Bootstrap, etc.). CSS vanilla intencionalmente.
4. **No usar emojis** en UI a menos que Eduardo lo pida explícito.
5. **No usar iconos de librerías externas** (Lucide, Heroicons, FontAwesome). Solo el set propio en `/design-system-v2/icons-reference.html` + `assets/quiz/icons.js` (stroke 1px `currentColor`).
6. **Hay 4 botones**: `.btn-primary`, `.btn-line`, `.btn-ghost`, `.btn-accent` + modificador `.btn-sm` + estados (`[disabled]`, `.is-loading`, con icon `.btn-icon`). Cubren todo. No crear variantes nuevas sin defenderlo.
7. **No crear gradientes nuevos.** El único permitido es el linear-gradient interno de `.scroll-indicator .line` (comunica fade del tick, no decoración). Cero gradientes en el resto.
8. **Hairlines 1px** solamente. Cero box-shadows decorativos. Cero glow. Cero scanlines. Cero efectos cyberpunk.
9. **No animaciones decorativas.** Si una animación no comunica un estado, dato o feedback, no va.
10. **Dark only** hasta que Eduardo decida light.
11. **Mobile**: el HUD persistente arriba (`<header class="hud">`) y el menú mobile (`<nav class="hud-mobile-menu" id="hud-menu">`) son el patrón actual. El hamburger (`#hud-hamburger`) abre el menú · NO usar drawers laterales ni navs inferiores.
12. **Markers de sección**: `§ NN.NN` (numeración) y `—` (em dash). **NUNCA `//`** — eso es del v1 Operator Grid.
13. **Verde phosphor escaso, mint informacional.** Política Apple monocromática: phosphor SOLO en (a) `.btn-primary`, (b) precio TOTAL final del cotizador, (c) card seleccionada/agregada. Mint informacional (eyebrows, highlights de texto). Ver `/design-system-v2/HANDOFF.md` sección "Política del verde".

## Sistema antiguo (Operator Grid v1) — eliminado del repo

Vivía en `/design-system/` (tokens cyberpunk) y `/pages/` (Home + verticales + portafolio). **Borrado del repo** en pivotes v5→v8. Solo subsiste en git history. **No resucitar** salvo petición explícita de Eduardo.

- Si construyes una página nueva → consume **VAULT (v2)**.
- Si ves código v1 colándose en archivos nuevos → es bug, limpiar.

Indicadores de código v1 que NO debe vivir en v2:
- Tokens `--cyan`, `--violet`, `--grad-brand`, `--grad-fade`
- Fuentes Space Grotesk, Chakra Petch
- Markers `//` en eyebrows
- Clases con scanlines, glow, neon
- 7 botones (en v1) — en v2 son 4

## Estructura del repo (actual · v11.8.0)

```
/
├─ index.html                  ← Home (hero + highlights · entrada al cotizador)
├─ quiz.html                   ← Cotizador completo (entrypoint principal)
├─ no.html                     ← Pantalla de salida amable ("ya tengo agencia")
├─ 404.html                    ← 404 brandeada
├─ legal/                      ← privacidad.html + terminos.html + contrato.html (v9.0)
├─ api/lead.js                 ← Vercel function · webhook Slack + Web3Forms email
├─ assets/
│   ├─ pwa/                    ← iconos PWA (192, 512, apple-touch)
│   └─ quiz/                   ← TODO el JS/CSS del cotizador vive aquí
│       ├─ styles.css          ← 976 líneas · consume VAULT v2 + capa mínima propia
│       ├─ ui.js               ← motor del quiz (render catálogo/subflow/confirm/datos/resultado)
│       ├─ i18n.js             ← ES/EN · helper L() · IBISNE_I18N_DATA
│       ├─ icons.js            ← set propio · NUNCA Lucide/etc
│       ├─ hud.js              ← HUD superior + menú mobile
│       ├─ prefs.js            ← lang/currency/theme prefs
│       ├─ loader.js           ← loader animation
│       ├─ ambient.js          ← background dots/scan
│       ├─ pwa.js              ← PWA install detection
│       └─ pwa-modal.css       ← modal de install instructions
├─ brand/                      ← logos iBisne (192/512 PNG + iBisne_blanco)
├─ data/
│   └─ pricing-v9.js           ← ÚNICO · motor adaptativo · 4 mega × 22 servicios × tipos × add-ons
├─ design-system-v2/           ← VAULT v2 OFICIAL · contrato intocable
│   ├─ tokens.css              ← --bg-* --text-* --accent (#3DFF7F) --sp-* --fs-* --font-*
│   ├─ components.css
│   ├─ components-extra.css
│   ├─ motion.css              ← cargada por UI Kit · NO por el sitio en producción
│   ├─ motion.js               ← cargada por UI Kit · NO por el sitio en producción
│   ├─ HANDOFF.md              ← LEER al iniciar sesión nueva de UI
│   ├─ README.md
│   ├─ icons-reference.html
│   └─ UI Kit.html
├─ docs/crm/                   ← planificación CRM (NO en producción)
├─ sw.js                       ← SW PWA · CACHE = 'ibisne-vX.Y.Z'
├─ manifest.webmanifest
├─ vercel.json
├─ robots.txt
├─ sitemap.xml
└─ CLAUDE.md                   ← este archivo
```

**Repo unificado · sin código muerto · sin pantallas legacy.** El sitio servido es exactamente lo que se ve en el árbol arriba. Si te encuentras editando algo que no aparece aquí, párate y verifica.

## Estructura del Home actual (`index.html` · v9.0 expandido)

1. **HUD persistente** (`<header class="hud">`) — brand, social (IG/LI/X), lang/currency, theme/music, install CTA, hunter CTA (WhatsApp), hamburger mobile.
2. **Mobile menu** (`<nav class="hud-mobile-menu" id="hud-menu">`) — sección Navegar (anchors al home largo), Redes, Preferencias, CTA hunter, CTA install.
3. **§01 Hero** — eyebrow mono (`§ COTIZA TU SERVICIO · SIN COMPROMISO`), h1 grande con `.highlight` mint, sub, 2 CTAs (`Cotizar ahora →` → `quiz.html` y `Ya tengo agencia` → `no.html`).
4. **§02 Cómo trabajamos** — 4 pasos numerados (cotizas online · WhatsApp · firmamos · construimos).
5. **§03 Diferenciadores** — 5 hl-cards (Soporte dedicado, 24/7, De 0 al lanzamiento, Un año de seguimiento, Imperios no proyectos).
6. **§04 Clientes** — logo wall + 6 cards placeholder con nombres reales (ProFutbol · Medical Mexicanna · SEM Endomap · Semillas Endémicas Mexicanna · DCI Península · Hidrosite). Logos reales pendientes.
7. **§05 Sobre iBisne** — mini-bio + 4 tags (sin management fee · sin equity dilutivo · capital operativo · base GDL).
8. **§06 FAQ** — 7 preguntas frecuentes (`<details>/<summary>` nativos · sin JS).
9. **§07 CTA final** — bloque grande "Pon tu proyecto en marcha esta semana" + 2 CTAs.
10. **§08 Footer extendido** — 4 cols (Brand · Sitio · Empezar · Legal) con sitemap visible + bottom row (copyright + versión).

Home scrolleable (no más "sin scroll" · v9.0). Anchors internos: `#hero`, `#como-trabajamos`, `#clientes`, `#sobre`, `#faq`, `#cta-final`.

## Flujo del cotizador (`quiz.html` · v9.0 adaptativo)

Hash routing externo (sin cambios desde v8):
```
#/catalog → (subflow interno por step) → #/datos → #/loading → #/resultado
```

Subflow interno (NUEVO en v9.0 · steps en `State.subflow.step`):
```
catalog → servicio → tipo → q (×6-9) → addons → confirm
```

- **4 megas** (Web · Apps · Ecommerce · **Plataformas & Automatización**) → 22 servicios visibles.
- **Pregunta inicial `tipo`** (3-8 tipos por servicio · ej. web-sitio tiene 8: corporate-básico · portal-miembros · blog-magazine · etc.).
- **Preguntas core adaptativas** según tipo elegido (`subflow.byType[tipoId]`) + shared (acabado, plazo).
- **Sección add-ons** dedicada al final · 19 add-ons globales con `aplica:[serviciosIds]` (chatbot básico, calendario, idioma extra, dark/light, animaciones premium, multi-tenant, auditoría smart contract, etc.).
- Motor de precio: `base + Σ add, luego × muls + Σ addOns`. Sin multiplicadores plazo/modo globales (esos son preguntas shared).
- **Cart sin pills** Plazo/Modo. Cada item muestra tipo (mint) + add-ons inline con precio.
- Carrito persistente `localStorage` (`ibisne.cart.v7`). Folio `ibisne.folio`. Leads en `ibisne.leads` / `ibisne.lead.last`.
- Handover al final → PayPal con monto pre-fill (`paypal.me/iBisne/{monto}MXN`) + WhatsApp hunter (`+52 33 2957 5274`) con payload completo (folio + tipo + config + extras + totales).

## Cómo iterar

- **Cambios de copy:** libres, no piden aprobación.
- **Cambios de layout dentro del sistema:** libres si usan componentes existentes en `assets/quiz/styles.css` y tokens VAULT v2.
- **Cambios al design system VAULT v2 (`/design-system-v2/`):** requieren confirmación del usuario antes de tocar. El cotizador no toca esa carpeta · sólo la consume.
- **Cambios de pricing/catálogo:** `data/pricing-v9.js` es la fuente única.
- **Imágenes:** siempre placeholders de color sólido + label hasta que el usuario provea assets reales. No generar imágenes random.
- **SW bump:** al cambiar assets críticos (HTML/CSS/JS del cotizador o de la SPA), bumpear `CACHE = 'ibisne-vX.Y.Z'` en `sw.js` línea 5 para invalidar PWA instaladas. Actual: `v16.0.0`. Desde v11.3 el SW es **network-first** y al activar nueva versión notifica a clientes que disparan `location.reload()` automático.

## Voice & copy

- Directo, operativo. "Capital operativo para LATAM" > "Empoderando emprendedores".
- Spanglish controlado: rev share, equity, pipeline, ticket, runway, due diligence — sin traducir.
- Datos sobre adjetivos: "$42M desplegado en 47 empresas" > "Mucha experiencia invirtiendo".
- Negaciones con confianza: "Sin management fee. Sin equity dilutivo."
- Frases cortas. Punto seco. Siguiente.

## Performance

- Imágenes en WebP/AVIF con fallback. Iconos PWA en `assets/pwa/`.
- Fonts con `display=swap` (ya configurado · Inter Tight + JetBrains Mono).
- `pwa.js` con `defer`. Resto de scripts del cotizador en orden de dependencia (pricing → loader → prefs → i18n → icons → ambient → hud → ui).
- No agregar JS frameworks (React/Vue/Svelte) a menos que el usuario lo pida explícitamente. HTML + CSS + vanilla JS es suficiente y consistente con el sistema.
- Mobile-first real: base = móvil 1col · carrito bottom-sheet en quiz · sidebar sticky ≥1100px.

## Workflow git/deploy

- **Producción**: branch `main` de https://github.com/ibisne/ibisne-web · Vercel auto-deploya · URL https://www.ibisne.com.
- **Trabajo**: branch `claude/<sufijo>` → PR a `main` → merge `--merge` → verificar deploy.
- **Reglas duras**: NUNCA commitear sin autorización explícita ("dale", "adelante", "commit"). NUNCA `git add -A`/`.`. NUNCA push directo a `main`. NUNCA `--force` ni `--amend` salvo petición explícita.
- **Co-Authored-By trailer obligatorio**: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- Estilo de commit: `tipo(scope): mensaje` · tipos: `feat`, `fix`, `docs`, `chore`, `copy`. Scope: `vX.Y.Z` o `pwa`/`mobile`/`result`/etc.

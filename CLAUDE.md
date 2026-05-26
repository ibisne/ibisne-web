# CLAUDE.md — iBisne web

Instrucciones permanentes para cualquier sesión de Claude Code en este repo.

## Contexto del proyecto

iBisne es un **holding LATAM** con vocación operativa (no fondo VC tradicional). El sitio web debe transmitir: capital + ejecución, mentalidad operadora, autoridad.

**El sitio web actual (v9.0.0) es un cotizador puro tipo carrito** para servicios tech B2B. Vive en `index.html` (entrada) + `quiz.html` (cotizador completo). Cualquier referencia histórica a marketplace 3-sided, portal inversor, co-financiamiento Spark/Build/Grow/Scale o "3 puertas" pertenece al modelo v4 que fue MATADO en v5.0 (2026-05) · esas pantallas se purgaron en v8.1.0. Si necesitas rescatar algo, vive en git history.

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

## Estructura del repo (actual · v9.0.0)

```
/
├─ index.html                  ← Home (hero + highlights · entrada al cotizador)
├─ quiz.html                   ← Cotizador completo (entrypoint principal)
├─ no.html                     ← Pantalla de salida amable ("ya tengo agencia")
├─ 404.html                    ← 404 brandeada
├─ legal/                      ← privacidad.html + terminos.html
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
│   └─ pricing.js              ← ÚNICO · motor de precios · 4 mega × 18 servicios × subflows
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

## Estructura del Home actual (`index.html`)

1. **HUD persistente** (`<header class="hud">`) — brand, social (IG/LI/X), lang/currency, theme/music, install CTA, hunter CTA (WhatsApp), hamburger mobile.
2. **Mobile menu** (`<nav class="hud-mobile-menu" id="hud-menu">`) — overlay con redes, prefs, CTA hunter, CTA install.
3. **Hero block** — eyebrow mono (`§ COTIZA TU SERVICIO · SIN COMPROMISO`), h1 grande con `.highlight` mint, sub, 2 CTAs (`Cotizar ahora →` → `quiz.html#/servicio/1` y `Ya tengo agencia` → `no.html`).
4. **Highlights grid** (5 `.hl-card`) — Soporte dedicado, Acompañamiento 24/7, De 0 al lanzamiento, Un año de seguimiento, Imperios no proyectos. Cada card: icono mint + título + descripción corta.
5. **Footer legal-strip** — email + privacidad + términos.

Home pensado para entrar **sin scroll en desktop** (hero + highlights en una sola vista, layout vertical centrado, `min-height: 100vh`). En mobile el grid baja a 2 columnas.

## Flujo del cotizador (`quiz.html`)

Hash routing:
```
#/catalog → #/servicio/<id> → #/subflow/<id> → #/confirm → #/datos → #/loading → #/resultado
```

- 4 megaCategorías (Web · Apps · Ecommerce · Auto) → 18 servicios visibles → subflows compactos (4-6 preguntas).
- Sin step de contexto (eliminado v7.0.2). Sin "No sé" como opción.
- Motor de precio: `base + Σ add, luego × muls`; `computeCart` aplica plazo×modo + IVA 16%.
- Carrito persistente `localStorage` (`ibisne.cart.v6`). Leads `ibisne.leads`/`ibisne.lead.last`. Folio `ibisne.folio`.
- Handover blindado al final → PayPal one-time (paypal.me/iBisne) o WhatsApp hunter (`+52 33 2957 5274`).

## Cómo iterar

- **Cambios de copy:** libres, no piden aprobación.
- **Cambios de layout dentro del sistema:** libres si usan componentes existentes en `assets/quiz/styles.css` y tokens VAULT v2.
- **Cambios al design system VAULT v2 (`/design-system-v2/`):** requieren confirmación del usuario antes de tocar. El cotizador no toca esa carpeta · sólo la consume.
- **Cambios de pricing/catálogo:** `data/pricing.js` es la fuente única.
- **Imágenes:** siempre placeholders de color sólido + label hasta que el usuario provea assets reales. No generar imágenes random.
- **SW bump:** al cambiar assets críticos (HTML/CSS/JS del cotizador), bumpear `CACHE = 'ibisne-vX.Y.Z'` en `sw.js` línea 5 para invalidar PWA instaladas. Actual: `v9.0.0`.

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

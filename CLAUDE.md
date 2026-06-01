# CLAUDE.md — iBisne web

Instrucciones permanentes para cualquier sesión de Claude Code en este repo.

## Contexto del proyecto

iBisne es un **holding LATAM** con vocación operativa (no fondo VC tradicional). El sitio web debe transmitir: capital + ejecución, mentalidad operadora, autoridad.

**El sitio web actual (v19.0.0) es un funnel de 3 pantallas con propósito único.** Páginas activas: `index.html` (landing lead-gen con scroll · 9 secciones · convencer + capturar + dirigir al cotizador) · `quiz.html` (**cotizador guiado 1-viewport sin scroll** · sidebar DARK con cards verticales grandes 1/7 altura + main planes + toggles Powerups/Mantenimiento + stepper 1→2→3) · `checkout.html` (estilo Shopify adaptado · form izq con toggles editables + métodos de pago + MSI + summary lateral der · POST a /api/lead.js + WhatsApp prefill · sin pago real). Categorías: **Webs · Apps · Ecommerce · CRM · ERP · SaaS · IA & Automatización** (7 categorías · 21 planes desde `data/precios-v13.js`). Cualquier referencia histórica a marketplace 3-sided, portal inversor, co-financiamiento Spark/Build/Grow/Scale o "3 puertas" pertenece al modelo v4 que fue MATADO en v5.0 (2026-05) · esas pantallas se purgaron en v8.1.0. Si necesitas rescatar algo, vive en git history.

**v19.4 · Cotizador con cards expandidas (Modo Pro + Mantenimiento inline) + visual hero premium + logo real.** Eduardo bajó 5 puntos al ver el cotizador. Cambios:
- **Logo real en quiz + checkout** (`quiz.html` + `checkout.html`): reemplaza `<span>iBisne</span>` por `<img src="brand/iBisne_blanco.png" class="qg-logo-img/co-logo-img">` con filter invert(1) en light · none en dark (mismo patrón landing).
- **Cards de cotizador expandidas** (`assets/sitio/quiz-guiado.{js,css}`): el render ahora muestra TODAS las features base (sin slice 0,6) + sección **"Con Modo Pro"** con 5 features (animaciones · claro y oscuro · varios idiomas · varias monedas · app instalable) + sección **"Con Mantenimiento"** con 4 features highlights (modificaciones · piezas gráficas · soporte WA+email · actualizaciones de seguridad) + hint Premium ("+ Soporte 24/7 y reportes mensuales en Premium"). Estados disabled (opacity 0.42 + gris) por default · se vuelven active (color azul Apple) cuando el toggle Modo Pro está on o el segmented Mantenimiento es Básico/Premium · `recalc()` aplica clases `.is-powerups-on`, `.is-mant-basico`, `.is-mant-premium` en cada `.qg-plan`. **"+N más en checkout" ELIMINADO** (ya no hay nada oculto).
- **Hero visual premium** (`assets/sitio/landing.css`): reemplazado el `<video>` no-existente (referenciaba archivos que nunca subimos desde v14) por mesh gradient animado (3 radial gradients · blur 60px · drift 18s alternate) + grid pattern con mask radial + 10 particles SVG inline animados (cy values con stagger 6-12s). Hero queda con fondo dark dramático (`#0a0a0c` + tints azul/púrpura) sin descargar nada externo · 0 KB extra de assets. Textos del hero forzados a blanco para contraste sobre fondo dark.
- **prefers-reduced-motion**: mesh y particles detenidos respetando preferencia OS.
- **Footer "v19.3.1" → "v19.4.0"** · SW `'ibisne-v19.4.0'`.

**v19.3 · Mega rework de copywriting + posicionamiento de marca.** Eduardo: *"sigues usando 'Precio cerrado' · ni siquiera sé qué es eso · cómo vamos a vender si no comunicamos lo que somos · somos un grupo de expertos arquitectos de software · certificados Shopify Partner · creamos tecnología para empresas de todos los niveles · desde una bio en 4 horas o web básica en 2 días"*. Cambios:
- **H1 hero** "Todo lo digital de tu negocio. Precio cerrado." → **"Arquitectos de software. Tu negocio en línea sin sorpresas."** (posiciona QUIÉNES somos + diferenciador en cristiano)
- **Sub hero** menciona expertise certificado + tiempos REALES (4 horas bio · 2 días web · semanas sistemas) + cierre con beneficio terminal ("tú no tocas código")
- **Sección NUEVA §02.5 "Quiénes somos"** (`index.html` entre social-proof y servicios · `id="somos"`): eyebrow + h2 + sub + 3 credenciales (Shopify Partner certificado · Equipo dedicado por proyecto · Operamos toda LATAM). Anchor agregado al nav del header.
- **7 service cards · todas con TIEMPO real**: páginas web 4h-2d-2sem · apps 4-8 sem · tienda Shopify 3-5d / a medida 2-4 sem · CRM 2-3 sem · ERP 4-12 sem · SaaS 4-6 sem · IA chatbot 3-5d / integraciones 2-3 sem.
- **Diferenciador "Precio cerrado"** → **"Sin sorpresas en la factura"** (lenguaje accesible para PyME · "el precio que cotizamos al inicio es el que pagas al final · cero costos ocultos").
- **Cotizador · toggle Powerups** ahora se llama **"Modo Pro · Destaca de tu competencia"** (sin "+300%" ni "×4 precio" en el UI · eso era jerga matemática que asustaba · el cálculo backend se mantiene · el delta se muestra como `+$X,XXX` absoluto en el checkout).
- **Checkout · toggle Powerups** ahora "Activar Modo Pro" + sub vendedor + summary muestra "Modo Pro · 5 capacidades · destaca tu proyecto" (sin matemática).
- **FAQ Powerups** completamente reescrita: pregunta "¿Qué es el Modo Pro y cuándo me conviene?" + respuesta que vende ("transforma tu proyecto en algo que destaca · se ve como Apple, Stripe o Linear").
- **Meta OG/Twitter** alineadas al copy nuevo · description con tiempos reales.
- **WhatsApp prefill** (`checkout.js`) usa "Modo Pro" en lugar de "Powerups premium (+300%)" · payload del POST limpio sin matemática.
- **Footer "v19.2.0" → "v19.3.0"** · SW `'ibisne-v19.3.0'`.

**v19.1 · Performance cleanup · -50 KB/página + scripts defer.** Eduardo reportó lag. Audit identificó CSS huérfano + scripts blocking. Cambios: (a) `index.html` quita `motion.css` (5.2 KB · reglas dependían de motion.js que ya no carga · GSAP cubre los reveals); (b) `quiz.html` y `checkout.html` quitan `components-extra.css` (45.1 KB · 0 selectores usados ahí · audit confirmó 0 hits con grep exhaustivo de los 82 selectores únicos vs HTMLs); (c) los 3 scripts del cotizador y checkout (icons.js + precios-v13.js + quiz-guiado.js/checkout.js) ahora con `defer` (corren en orden tras parse · cero blocking de render); (d) bumps de versión asset `?v=19.0.0` → `19.1.0` para invalidar cache; (e) SW `ibisne-v19.1.0` para activar el cleanup en PWAs instaladas; (f) footer "v19.0.0" → "v19.1.0". Ahorro neto: ~50 KB en quiz + checkout, ~5 KB en landing. Render no bloqueado por scripts del motor. **Sin cambios funcionales · solo limpieza.**

**v19.0 · Auditoría integral + cotizador sidebar DARK + checkout extendido (toggles editables + MSI + métodos de pago) + landing pulida.** Eduardo pidió auditoría completa + 5 mejoras concretas. PR consolidado · 10 archivos · 0 nuevos.
- **Cotizador sidebar DARK con cards verticales grandes 1/7 altura** (`assets/sitio/quiz-guiado.css`): sidebar `#1D1D1F` light · `#000` dark · contraste fuerte vs main blanco. `.qg-cat-list` `flex: 1` divide altura del viewport entre 7 cards. Cada `.qg-cat-item` es card vertical (icono arriba 28px · label abajo) con `flex: 1` (todas mismo alto) · `min-height: 56px` fallback laptop pequeña. Activa azul Apple `var(--accent-blue)` con shadow. Mobile (<900px): mantiene tabs horizontales scroll-x. Sustituye los items 18px planos del v17.
- **Stepper 1→2→3** compartido entre quiz/checkout (`.qg-stepper` en quiz-guiado.css · reusado por checkout.css con `.co-main > .qg-stepper { grid-column: 1 / -1; }`). Indica progreso de compra · paso activo azul · paso done negro · paso pending gris.
- **Toggle Powerups label más amigable**: `"×4 precio"` → `"Premium +300%"` (menos alarmante sin perder claridad). El JS muestra el delta calculado dinámico en el checkout.
- **Theme persist cross-page** (script inline en `<head>` de quiz.html y checkout.html antes del CSS): lee `localStorage['ibisne-site-theme']` y aplica `data-theme` antes del render · sin FOUC. Si Eduardo activa dark en la landing, navega al quiz/checkout y mantiene dark.
- **CTA persistente mobile** (`.qg-mobile-asesor` en quiz.html): cuando sidebar colapsa a tabs horizontales en mobile y se pierde el sidebar-foot con "Hablar con asesor", aparece un FAB sticky abajo del main. Solo visible <900px.
- **Checkout extendido** (`assets/sitio/checkout.{js,css}`):
  - **Toggles Powerups + Mantenimiento EDITABLES** (era read-only desde URL params): `.co-config-section` con switch iOS-style Powerups (delta `+$X,XXX` dinámico) + segmented Mantenimiento (Sin/Básico/Premium). Cada cambio → `updateSummary()` re-renderiza el summary lateral live.
  - **Métodos de pago visuales** (`.co-pay-section` · grid 2×2): 5 cards seleccionables · Transferencia (activa default) · SPEI · Mercado Pago · OXXO Spin · Criptomonedas (4 últimas con badge "Próximamente"). Estado va al WhatsApp prefill + payload.
  - **Meses sin intereses 1/3/6/9/12** (`.co-msi-section` · segmented): muestra cuota mensual calculada inline `$X,XXX/mes × N meses · total $X,XXX`. Default 1 pago (sin MSI).
  - **Spinner inline** en botón submit (`.co-submit-spinner` con animación CSS · respeta `prefers-reduced-motion`).
  - **Summary meta** al pie del summary lateral: muestra método de pago + plazo elegido.
- **Modal contacto fix dark** (`index.html` · `.contact-modal-panel`): agregado `border: 1px solid var(--bg-line)` + override dark con `box-shadow: 0 0 0 1px var(--bg-line)` para evitar shadow invisible sobre fondo negro.
- **Landing copy refinement** (`index.html`):
  - **H1 hero**: "Construye lo que tu negocio merece" → **"Tu stack digital completo. Precio cerrado."** (más específico · diferenciador en el headline).
  - **§04 Diferenciadores · 5 cards ortogonales** (era 3 de 5 repetían "soporte"): Soporte dedicado · Precio cerrado · Velocidad de entrega · Stack completo in-house · Imperios no proyectos.
  - **FAQ +5 críticas de compra**: pagos + MSI · garantía/revisiones · plazo de arranque · propiedad del código · LATAM/USD. Total ahora 14 preguntas (era 9).
  - **CTA final "Hablar con un asesor"** ahora abre modal contacto (consistencia con hero · antes era `wa.me` directo). Añadido `cta-final-contact-btn` al array de openBtns del handler.
  - **OG/Twitter tags** actualizados al H1 nuevo.
- **Cleanup técnico**: footer "v14.0.0" → "v19.0.0" (estaba desactualizado · visible al público). Quitada carga doble de `motion.js` (la landing solo necesita GSAP · evita doble animación stagger). Bump versiones `?v=18.0.0` → `?v=19.0.0` en assets del landing.
- **SW v19.0.0** con PRECACHE extendido (ahora incluye `checkout.html`, `landing.css`, `landing-animations.js`, `quiz-guiado.{css,js}`, `checkout.{css,js}`, `precios-v13.js`).

**v18.0 · Landing premium con GSAP + dark mode fixes + sticky CTA.** Rework absoluto de la landing (cotizador y checkout NO se tocan). Soluciona 6 puntos de feedback de Eduardo sobre v17:
- **Botones premium** (`assets/sitio/landing.css`): `.btn-blue` con gradient linear + box-shadow capas + spring physics (cubic-bezier 0.34, 1.56) + shimmer pseudo-element angular que pasa al hover + lift `-2px translateY` + scale `1.02`. `.btn-ghost-light` con opacity boost + bg suave. `.btn-dark` con shadow dramático. Focus-visible ring azul 3px global (a11y fix).
- **Bug crítico dark mode FIXED**: el `.hero-actions .btn-blue` antes usaba `color: var(--text-primary)` que en dark se vuelve `#F5F5F7` (blanco) sobre fondo blanco = invisible. Ahora `color: #1D1D1F` hardcoded en ambas themes via regla específica `.hero-actions .btn-blue`.
- **Dark mode surfaces hierarchy** (`tokens.css`): antes `--bg-paper = --bg-subtle = --bg-deep = #1D1D1F` (igual · sin diferencia). Ahora 3 niveles: `--bg #000` · `--bg-deep #0A0A0C` · `--bg-paper #161618` · `--bg-subtle #1F1F22`. `--text-muted` subido `#6E6E73 → #8E8E93` para mejor ratio AA.
- **Secciones respiradas** (de 80px → 200px padding · `--section-pad-xl: var(--sp-11)`): `main > .section` con padding-y de 200px desktop, 120px tablet, 64px mobile. Hero `min-height: 92vh`. CTA final `padding 250px`. Una sección por viewport en desktop · ya no se ven 2 al mismo tiempo.
- **Sticky CTA flotante** (`.cta-floating`): aparece bottom-right tras scroll 100px con `opacity 0 → 1 + translateY(24px) → 0 + scale(0.92) → 1` en spring. Pulse sutil cada 4s. Se oculta cuando footer entra al viewport (IntersectionObserver). Hide en `prefers-reduced-motion`.
- **GSAP + ScrollTrigger** vía jsdelivr CDN (~115KB total · cdn.jsdelivr.net agregado al CSP de `vercel.json`). `assets/sitio/landing-animations.js` (276L): Hero entrance timeline con SplitText DIY por palabras (60ms stagger) + section reveals con `start: 'top 80%'` + cards stagger + marquee parallax scrub + button hovers. `gsap.matchMedia()` con condition `(prefers-reduced-motion: no-preference)` para que reduced-motion desactive todo.
- **Progressive enhancement guard**: `[data-anim]` y `[data-anim-stagger] > *` ocultos con CSS por default. JS marca `html[data-gsap-ready]` al cargar GSAP. Si JS no carga, CSS guard `html:not([data-gsap-ready])` restaura visibility. Funciona offline / CSP block / browser sin JS.
- **Tokens versión** bumpeada a `?v=3.3.0` por el cambio dark.

**v17.0 · Pivot mayor · Landing lead-gen + Cotizador guiado 1-viewport + Checkout.** Cambio de arquitectura completo:
- **Funnel directo**: landing convence → cotizador configura → checkout cierra.
- **Cotizador NUEVO** (`quiz.html` reemplazado completamente · 56L HTML + 329L JS + 514L CSS): sidebar izq (7 categorías clickables) + main der (header + toggles Powerups ×4 / Mantenimiento Sin/Básico/Premium + grid de planes). Layout 1-viewport sin scroll en desktop (≥900px); mobile colapsa sidebar a tabs horizontales scroll-x + planes apilan abajo. Cada plan tiene botón **"Elegir plan"** que navega a `/checkout.html?cat=X&plan=Y&pwr=0/1&mant=sin/basico/premium`. Lee `data/precios-v13.js`.
- **Checkout NUEVO** (`checkout.html` + 334L JS + 313L CSS): estilo Shopify adaptado · grid 2-col (form izq · summary lateral der sticky). Lee URL params, renderiza resumen del paquete (precio plan + Powerups si on + Mantenimiento si elegido). Form completo: nombre · email · teléfono · empresa · timeline · información adicional. Submit → POST `/api/lead.js` + `window.open(WhatsApp)` + confirmación inline. **Sin pago real** (Eduardo lo dejó "captura + asesor").
- **Landing simplificada** (`index.html`): eliminadas §06 Pricing toggle y §07 Después del lanzamiento. Hero CTA "Cotizar mi proyecto" → `/quiz.html`. 7 cards de servicios linkean a `/quiz.html?cat=<categoria>` (deep-link con categoría preseleccionada). Sin pricing en el home. Resto similar a v16 (topbar utility + nav + hero + servicios + diferenciadores + cómo trabajamos + testimonios + FAQ + CTA final + footer).
- **ELIMINADO** (~6000 líneas legacy): `data/pricing-v9.js` (2846L) · `data/precios-v12.js` (163L) · `assets/quiz/ui.js` (2003L) · `assets/quiz/{ambient,hud,prefs,loader,i18n}.js` · `assets/quiz/styles.css` (1205L) · `assets/sitio/pricing-table.{js,css}` (514L+582L) · `no.html`. El cotizador adaptativo viejo v9 (wizard de 6-9 preguntas con catálogo `pricing-v9.js` de 22 servicios + addOns) MUERTO. El motor era 2003L de JS — ya no.
- **CONSERVADO**: `assets/quiz/icons.js` (set propio) + `assets/quiz/pwa.js` (install detection) + `assets/quiz/pwa-modal.css`. Datos: `data/precios-v13.js` (21 planes) único catálogo activo.
- **404.html**: link a `/quiz.html` (sin hash legacy).
- SW v17.0.0 + PRECACHE limpio (sin archivos eliminados).



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
- **SW bump:** al cambiar assets críticos (HTML/CSS/JS del cotizador, checkout o landing), bumpear `CACHE = 'ibisne-vX.Y.Z'` en `sw.js` línea 5 para invalidar PWA instaladas. Actual: `v18.0.0`. Desde v11.3 el SW es **network-first** y al activar nueva versión notifica a clientes que disparan `location.reload()` automático.

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

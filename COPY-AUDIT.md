# COPY-AUDIT.md — Diff línea por línea: `pages/index.html` vs copy LOCKED

> Generado: 2026-04-26 · Sin opinión, solo diff exacto.
> Fuentes LOCKED consultadas: `TEXTOS-RESPALDO.md` (§HOME, §COMMERCE GROWTH, §SMART CAPITAL, §EMERGENTE, §VENTURE LAB, §PORTAFOLIO) + memoria `project_copy_hero.md` + `project_copy_commerce_growth.md` + `project_copy_smart_capital.md` + `project_copy_emergente.md` + `project_copy_venture_lab.md`.
> Convención: ✅ match textual · 🟡 mezcla (frases LOCKED + paráfrasis o composición) · ❌ paráfrasis sin justificación · 🔴 INVENTADO (sin LOCKED) · ⚠️ Falta LOCKED para este slot · ⏭ navegación / no aplica

---

## Resumen ejecutivo

- **Único copy LOCKED que el home tiene autorizado en `TEXTOS-RESPALDO.md §HOME`** es:
  - Hero título (2 líneas)
  - Hero subtítulo (1 línea)
  - CTA principal "Hagamos bisne"

- **Todo lo demás del home es trabajo de composición.** El plan original era hub & spoke: el home no debería copiar copy de las verticales internas — debería tener su propio copy (no escrito todavía) o quedarse con SOLO el hero LOCKED hasta que Eduardo escriba el resto.

- **El home actual mezcla 3 cosas**: (a) hero LOCKED textual ✅, (b) frases LOCKED de las páginas internas reusadas en home (sin autorización explícita), (c) párrafos completos INVENTADOS sin base en LOCKED.

---

## Conteo

| Categoría | # |
|---|---|
| ✅ Match textual con LOCKED | **6** |
| 🟡 Mezcla (LOCKED + composición) | **9** |
| ❌ Paráfrasis sin justificación | **3** |
| 🔴 INVENTADO (sin base LOCKED) | **14** |
| ⚠️ Falta LOCKED para este slot | **8** |
| ⏭ Navegación / labels técnicos | **6** |

---

## 1 · `<head>` — meta y title

### 1.1 · meta description (L6)
**Actual:** `iBisne · Holding LATAM de 4 verticales operativas. Capital + ejecución. Si funciona, es porque lo operamos.`
**LOCKED:** No existe LOCKED para meta description.
**Estado:** ⚠️ Falta LOCKED · 🟡 reusa frase del hero LOCKED + composición.

### 1.2 · title (L10)
**Actual:** `iBisne — Si funciona, es porque lo operamos.`
**LOCKED hero título:** `Si funciona, es porque lo operamos.`
**Estado:** ✅ Match textual con LOCKED hero.

---

## 2 · NAVBAR · mega-menu cards (L100–119)

> Estas tags describen cada vertical en 1 línea desde el menú del nav. NO existe LOCKED específico para "tag corto del mega-menu". Lo más cercano son los HERO de cada vertical interna.

### 2.1 · Commerce Growth (L105)
**Actual:** `Rev share 12 meses con empresas que ya facturan. Sin fees fijos, sin equity dilutivo.`
**LOCKED hero CGP (subtítulo):** `Nosotros cobramos cuando tú ganas. Revenue share 12 meses, sin fees, sin pitch decks.`
**Estado:** ❌ Paráfrasis.
- Datos del LOCKED: "Revenue share 12 meses" + "sin fees" → conservados.
- INVENTADO: "con empresas que ya facturan" (la audiencia se infiere pero no es del subtítulo LOCKED), "sin fees fijos" (LOCKED dice "sin fees" sin "fijos"), "sin equity dilutivo" (no aparece en NINGÚN LOCKED de CGP).
- AUSENTE: "sin pitch decks" (LOCKED) no se usó.

### 2.2 · Smart Capital (L109)
**Actual:** `Vehículo de inversión 0% fee. Tickets $25K · $100K · $250K USD.`
**LOCKED hero SC (subtítulo):** `Tu capital trabaja con el mismo equipo que lo despliega. Sin intermediarios, sin gestores pasivos.`
**LOCKED stat strip / tiers:** `0% fees · management fee anual` + tiers $25K/$100K/$250K USD.
**Estado:** 🟡 Datos numéricos LOCKED ✅. La frase descriptiva del subtítulo LOCKED **no se usó** — se sustituyó por composición.

### 2.3 · Emergente (L113)
**Actual:** `Marketplace anti-monopolio. Comisión regresiva 1–30%.`
**LOCKED hero Emergente (título):** `El marketplace que no te compite.`
**LOCKED stat strip:** `30% · comisión máxima · nunca más` (no menciona "regresiva 1–30%" en hero).
**Estado:** 🟡 Datos correctos. "anti-monopolio" es término del tono LOCKED (memoria `project_copy_emergente`) pero no del copy textual del hero.

### 2.4 · Venture Lab (L117)
**Actual:** `Idea-stage builder: equity 15–30% + capital $50–200K USD.`
**LOCKED hero VL (título):** `Tu idea no necesita mentoría. Necesita código, arquitectura y capital.`
**LOCKED estructura del deal:** equity 15–30%, capital USD $50K-$200K.
**Estado:** 🟡 Datos LOCKED correctos. La frase del título LOCKED **no se usó** — se sustituyó por composición tipo bullet.

---

## 3 · HERO (L194–215)

### 3.1 · section-num (L196)
**Actual:** `§ 00.HOME`
**LOCKED:** No existe.
**Estado:** ⏭ marker estructural del design system.

### 3.2 · eyebrow (L198)
**Actual:** `§ Holding LATAM · 4 verticales operativas`
**LOCKED:** No existe eyebrow LOCKED para home.
**Estado:** 🔴 INVENTADO.

### 3.3 · h1 (L199)
**Actual:** `Si funciona, es porque lo operamos.<br/>Si lo operamos, es porque invertimos.`
**LOCKED hero título:** `Si funciona, es porque lo operamos. / Si lo operamos, es porque invertimos.`
**Estado:** ✅ MATCH TEXTUAL.

### 3.4 · lead (L201)
**Actual:** `¿Ya te cansaste de jugar? Hagamos bisne.`
**LOCKED hero subtítulo:** `¿Ya te cansaste de jugar? Hagamos bisne.`
**Estado:** ✅ MATCH TEXTUAL.

### 3.5 · CTA primario (L204)
**Actual:** `Hagamos bisne`
**LOCKED CTA principal:** `Hagamos bisne`
**Estado:** ✅ MATCH TEXTUAL.

### 3.6 · CTA secundario (L205)
**Actual:** `Ver verticales →`
**LOCKED:** No existe CTA secundario LOCKED en home.
**Estado:** 🔴 INVENTADO.

### 3.7 · hero-foot t-mono (L208)
**Actual:** `— Guadalajara · CDMX · Bogotá · Medellín`
**LOCKED:** Sitemap menciona Guadalajara como base. No hay LOCKED para footer del hero.
**Estado:** 🔴 INVENTADO (datos derivados de memoria, no de TEXTOS-RESPALDO).

---

## 4 · VERTICALES horizontales (L218–304)

> 4 paneles full-bleed con num + h2 + desc + meta. NINGUNO de estos slots tiene LOCKED en `TEXTOS-RESPALDO.md §HOME`. Lo que el home está haciendo es **componer descripciones de las verticales** sin autorización.

### 4.1 · Panel 1 · Commerce Growth (L229–246)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| num | `— 01 / 04 · Vertical operativa` | — | 🔴 INVENTADO |
| h2 | `Commerce Growth.` | LOCKED nav: "Commerce Growth Partner" | ❌ truncado (falta "Partner") |
| desc | `Rev share 12 meses con empresas que ya facturan. Sin fees fijos, sin equity dilutivo. Cobramos sobre el crecimiento incremental — si no crece, no cobramos.` | LOCKED hero CGP subtítulo: `Nosotros cobramos cuando tú ganas. Revenue share 12 meses, sin fees, sin pitch decks.` | 🟡 Mezcla: "Rev share 12 meses" ✅, "sin fees" ✅. Inventado: "sin equity dilutivo", "Cobramos sobre el crecimiento incremental — si no crece, no cobramos" (la última frase parafrasea FAQ §7.01 "si no hay crecimiento, no hay factura" pero no es textual). Ausente: "sin pitch decks". |
| meta tag 1 | `Founders` | — | ⏭ |
| meta tag 2 | `15–20% Share` | LOCKED CGP §3: `Cobramos un % de lo que generamos juntos. El modelo se adapta al proyecto` | 🔴 INVENTADO. **El número 15–20% NO existe en NINGÚN LOCKED de CGP.** El modelo LOCKED dice explícitamente que el % se adapta — no hay rango cerrado. |
| meta tag 3 | `12 meses` | LOCKED ✅ | ✅ |
| link | `Ver mecánica →` | — | 🔴 INVENTADO |

### 4.2 · Panel 2 · Smart Capital (L247–264)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| num | `— 02 / 04 · Vertical de inversión` | — | 🔴 INVENTADO |
| h2 | `Smart Capital.` | LOCKED ✅ | ✅ |
| desc | `Vehículo de inversión 0% management fee. Tickets $25K · $100K · $250K USD. Hurdle 8% antes de carry. Para LPs que quieren exposición a LATAM sin pagar la prima del fondo tradicional.` | LOCKED hero SC subtítulo: `Tu capital trabaja con el mismo equipo que lo despliega. Sin intermediarios, sin gestores pasivos.` | 🟡 Datos LOCKED ✅ (0% fee, tickets, hurdle 8%). El subtítulo LOCKED del hero NO se usó. La oración final ("Para LPs que quieren exposición a LATAM sin pagar la prima del fondo tradicional") es 🔴 INVENTADA. |
| meta | `LPs · 2–5 años · 0% fee` | LOCKED stat strip: `0% fees · 2-5 años · 8% hurdle` | ✅ datos LOCKED |
| link | `Ver términos →` | LOCKED CTA secundario hero SC: `Ver tesis` | ❌ Distinto |

### 4.3 · Panel 3 · Emergente (L265–282)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| num | `— 03 / 04 · Pre-launch` | LOCKED hero eyebrow: `EMERGENTE · VERTICAL 03 · PRÓXIMAMENTE` | 🟡 Conserva la idea ("Pre-launch" ≈ "PRÓXIMAMENTE") pero no es textual. |
| h2 | `Emergente.` | LOCKED ✅ | ✅ |
| desc | `Marketplace anti-monopolio operado por fundadores, para fundadores. Comisión regresiva 1–30%. Los primeros 50 fundadores se quedan con su tier de por vida.` | LOCKED hero Emergente: `El marketplace que no te compite.` + subtítulo `[...] una plataforma honesta, operada por fundadores, para fundadores.` + LOCKED §8 título: `Los primeros 50 fundadores se quedan con su tier de por vida.` | 🟡 Mezcla 3 fragmentos LOCKED de partes distintas: "operado por fundadores, para fundadores" ✅ (subtítulo hero, casi textual — el LOCKED dice "operada"), "Los primeros 50 fundadores se quedan con su tier de por vida" ✅ (textual del CTA §8). Recompuesto sin orden LOCKED. |
| meta tag 1 | `Founders LATAM` | — | 🔴 INVENTADO |
| meta tag 2 | `1–30% comisión` | LOCKED tabla tiers: `1-30% regresivo` | ✅ datos LOCKED |
| meta tag 3 | `2026 launch` | — | 🔴 INVENTADO (la fecha aparece en CGP cases pero no como meta de Emergente) |
| link | `Lee el manifiesto →` | LOCKED CTA secundario hero Emergente: `Lee el manifiesto` | ✅ |

### 4.4 · Panel 4 · Venture Lab (L283–300)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| num | `— 04 / 04 · Idea-stage` | LOCKED hero eyebrow: `VENTURE LAB · VERTICAL 04 · INCUBADORA OPERATIVA` | ❌ Distinto. La keyword LOCKED es "incubadora operativa", no "idea-stage". |
| h2 | `Venture Lab.` | LOCKED ✅ | ✅ |
| desc | `Tu idea no necesita mentoría. Necesita código, arquitectura y capital. Equipo técnico interno + capital $50–200K USD + equity 15–30%. Construimos hasta que escala.` | LOCKED hero VL título: `Tu idea no necesita mentoría. Necesita código, arquitectura y capital.` + LOCKED stat strip: `∞ · horizonte — construimos hasta que escala` | 🟡 1ª oración ✅ TEXTUAL. "Construimos hasta que escala" ✅ TEXTUAL (del stat). Las cifras intermedias ($50–200K, 15–30%) son datos LOCKED de §6 pero recombinados. |
| meta | `Idea-stage · 15–30% equity · 24 meses` | LOCKED §6: equity 15-30%, horizonte mínimo 24 meses ✅ datos | ✅ datos LOCKED |
| link | `Ver cómo operamos →` | LOCKED hero CTA secundario VL: `Ver cómo operamos` | ✅ MATCH |

---

## 5 · TESIS (L307–342)

### 5.1 · eyebrow (L310)
**Actual:** `§ La tesis`
**LOCKED:** No existe.
**Estado:** 🔴 INVENTADO.

### 5.2 · h2 (L312)
**Actual:** `Invertimos donde capital y ejecución se multiplican.`
**LOCKED Smart Capital §4 TESIS título:** `Invertimos donde capital y ejecución se multiplican.`
**Estado:** ✅ MATCH TEXTUAL — pero es copy de la página interna Smart Capital, **reusado en home sin autorización explícita** (`TEXTOS-RESPALDO §HOME` no incluye sección de tesis).

### 5.3 · Editorial card 01 (L315–322)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| ec-num | `— 01 / Tesis` | — | ⏭ |
| h3 | `Negocios con mercado probado, no experimentos.` | LOCKED SC §4: `━ Negocios con mercado probado, no experimentos.` | ✅ MATCH TEXTUAL (es copy de SC reusado en home) |
| body | `No invertimos en SaaS B2B con TAM en San Francisco. Operamos en commerce, fintech vertical y software de servicio para LATAM. Si el mercado ya existe y nosotros podemos ejecutarlo, lo evaluamos. Para ideas desde cero existe Venture Lab.` | LOCKED SC §4 más cercano: `El corazón — ecommerce de alto impacto en industrias ya consolidadas. [...] El radar — Web, paid media, SaaS, apps móviles, CRM, POS, blockchain, dapps, AI aplicada. Si podemos operarla y el mercado ya existe, la evaluamos. No invertimos en experimentos. Para ideas desde cero, existe Venture Lab.` | 🔴 INVENTADO en su mayoría. "No invertimos en SaaS B2B con TAM en San Francisco" + "fintech vertical y software de servicio para LATAM" → NO existen en NINGÚN LOCKED. La última oración es paráfrasis cercana. |

### 5.4 · Editorial card 02 (L324–331)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| h3 | `Operaciones donde nosotros mismos podemos ejecutar.` | LOCKED SC §4: `━ Operaciones donde nosotros mismos podemos ejecutar.` | ✅ MATCH TEXTUAL |
| body | `Capital operativo, no pasivo. Equipo adentro del negocio. Cada vertical tiene un operador senior asignado que vive el día a día con el founder. Si no podemos operarlo, no lo evaluamos.` | LOCKED SC §4: contexto general; LOCKED CGP §3: `Entramos como socio operativo, no proveedor. Equipo adentro, tecnología nuestra, capital si hace falta.` | 🔴 INVENTADO. "Cada vertical tiene un operador senior asignado que vive el día a día con el founder" — esta frase no aparece en NINGÚN LOCKED. La estructura jerárquica "operador senior por vertical" no está documentada en TEXTOS-RESPALDO. |

### 5.5 · Editorial card 03 (L333–340)

| Slot | Actual | LOCKED | Estado |
|---|---|---|---|
| h3 | `Transformación digital como palanca de margen, no como pitch.` | LOCKED SC §4: `━ Transformación digital como palanca de margen, no pitch.` | 🟡 Casi textual — agrega "como" antes de "pitch". Diff: "no pitch" → "no como pitch". |
| body | `Ecommerce de alto impacto, POS y CRM desde cero, apps con integración blockchain, dashboards en vivo, automatizaciones que ahorran horas-equipo. La tecnología no es la entrega — es la palanca para multiplicar el margen del negocio que ya existe.` | LOCKED CGP §4 lista de evidencia: `Ecommerce Shopify Plus con 7 cifras mensuales. POS y CRM desde cero para cadenas retail. Apps iOS/Android con integración blockchain. Dashboards en vivo para founders que viajan. Automatizaciones que ahorran 40 horas-equipo por semana.` | 🟡 La lista de tecnologías es paráfrasis del LOCKED CGP §4 (con detalles operativos quitados). La oración de cierre ("La tecnología no es la entrega — es la palanca...") es 🔴 INVENTADA. |

---

## 6 · TRACK RECORD (L345–376)

### 6.1 · eyebrow (L348)
**Actual:** `§ Track record`
**LOCKED:** No existe.
**Estado:** 🔴 INVENTADO.

### 6.2 · h2 (L350)
**Actual:** `El portafolio activo.`
**LOCKED Smart Capital §6 título:** `El portafolio activo.`
**Estado:** ✅ MATCH TEXTUAL — copy de SC reusado en home.

### 6.3 · Stats (L353–370)

| Stat | Num + unit | Label | LOCKED | Estado |
|---|---|---|---|---|
| 1 (key) | `9 marcas` | `Portafolio activo` | LOCKED §6 SC: "9 marcas donde capital y operación se cruzan" | ✅ dato; label 🔴 inventado |
| 2 | `4 verticales` | `Operativas` | LOCKED CLAUDE.md: "4 verticales operativas" | ✅ dato; label 🟡 |
| 3 | `16 años+` | `eCommerce LATAM` | LOCKED memoria Eduardo: "16+ años en eCommerce LatAm" | ✅ dato; label 🟡 |
| 4 | `0% fee` | `Smart Capital` | LOCKED SC stat strip | ✅ dato; label ⏭ |

### 6.4 · body (L372–374)
**Actual:** `Nueve marcas en operación. Cuatro verticales. Una sola tesis: capital con ejecución. Dos públicas (Medical Mexicanna · DCI de la Península). Siete bajo NDA — firma confidencialidad y te mostramos el track record completo.`
**LOCKED CGP §6 portafolio NDA:** `7 marcas más en portafolio activo — todas lanzan mayo 2026. Firma confidencialidad y te mostramos el track record completo.`
**LOCKED SC §6:** `Case 1 — Grupo Semillas Endémicas Mexicanna [...] Case 2 — DCI de la Península [...] 7 cards bloqueadas bajo NDA [...] Firma confidencialidad y desbloquea el portafolio completo →`
**Estado:** 🟡 La frase de cierre `firma confidencialidad y te mostramos el track record completo` ✅ TEXTUAL del LOCKED. El resto del párrafo (numerología "Nueve marcas... Cuatro verticales... Una sola tesis: capital con ejecución") es 🔴 INVENTADO en su composición.

---

## 7 · CTA FINAL (L379–399)

### 7.1 · t-mono (L381)
**Actual:** `§ 04 · Cierre`
**Estado:** ⏭ marker estructural.

### 7.2 · h2 (L382)
**Actual:** `Si funciona, es porque lo operamos contigo.`
**LOCKED:** No existe LOCKED para CTA final del home. La frase parafrasea el hero LOCKED ("Si funciona, es porque lo operamos") agregando "contigo".
**Estado:** 🔴 INVENTADO. **Modificar el hero LOCKED es exactamente lo que la regla #1 prohíbe.**

### 7.3 · t-mono pequeño (L385)
**Actual:** `— Empieza la conversación`
**LOCKED:** No existe.
**Estado:** 🔴 INVENTADO.

### 7.4 · placeholder input (L387)
**Actual:** `tu@correo.com`
**Estado:** ⏭ placeholder técnico.

### 7.5 · body párrafo (L389–391)
**Actual:** `Aplicaciones abiertas para fundadores facturando, LPs con ticket mínimo $25K USD, y emprendedores idea-stage con dedicación full-time.`
**LOCKED:** No existe en home. Datos sí existen dispersos en LOCKED de cada vertical (ticket mínimo SC $25K USD, dedicación full-time VL).
**Estado:** 🔴 INVENTADO en composición. Datos correctos pero párrafo no autorizado.

### 7.6 · btn-accent (L394)
**Actual:** `Hagamos bisne`
**LOCKED:** ✅ CTA hero home.
**Estado:** ✅ MATCH TEXTUAL.

### 7.7 · btn-line (L395)
**Actual:** `Soy inversionista`
**LOCKED:** No existe.
**Estado:** 🔴 INVENTADO.

---

## 8 · FOOTER (L404–447)

### 8.1 · footer-mark (L406)
**Actual:** `IBISNE`
**Estado:** ⏭ marca.

### 8.2 · Columna Verticales (L409–415)
**Actual:** `Verticales` con 4 links a las páginas de las verticales con sus nombres LOCKED (Commerce Growth Partner, Smart Capital, Emergente, Venture Lab).
**Estado:** ⏭ navegación con nombres LOCKED ✅.

### 8.3 · Columna Compañía (L417–423)
**Actual:** `Compañía` con links: Equipo, Portafolio, Blog.
**LOCKED sitemap:** `/nosotros → Equipo (6 miembros)` ✅, `/portafolio` ✅, `/blog` ✅.
**Estado:** ⏭ navegación. Header "Compañía" 🔴 INVENTADO (sitemap no usa esa categoría).

### 8.4 · Columna Recursos (L425–431)
**Actual:** `Recursos` con links: `Aplicar como founder`, `Aplicar como LP`, `Aplicar con idea`.
**LOCKED sitemap:** `/contacto → Contacto / Aplicar (forms multi-paso)`.
**Estado:** 🔴 INVENTADO. La categorización en 3 tipos de aplicar (founder/LP/idea) no aparece en LOCKED. Header "Recursos" 🔴 INVENTADO.

### 8.5 · Columna Contacto (L433–440)
**Actual:** `Contacto` con email `hola@ibisne.com`, WhatsApp, locations.
**LOCKED:** Memoria Eduardo: emails individuales por miembro. `hola@ibisne.com` no aparece como email oficial en LOCKED.
**Estado:** 🔴 INVENTADO el email `hola@ibisne.com` (LOCKED tiene `eduardo@ibisne.com`, `guillermo@ibisne.com`, etc., pero no genérico).

### 8.6 · footer-meta (L443)
**Actual:** `© 2026 · iBisne · Holding LATAM` + `VAULT · v2.4.2`
**Estado:** ⏭ legal/sistema.

---

## 9 · NAV-OVERLAY (mobile, L143–189)

Solo elementos LOCKED:
- Sitemap menu-link labels (Home, Verticales, Portafolio, Nosotros, Blog, Contacto): ⏭ navegación con sitemap LOCKED ✅.
- CTA del overlay: `Hagamos bisne` ✅ MATCH LOCKED.

Sin hallazgos adicionales.

---

## 10 · Recomendación

**No es un find-and-replace.** El daño no es de palabras sueltas — es estructural:

- **3 secciones completas del home no tienen LOCKED**: Tesis (3 cards), Track record (body), CTA final (h2 + body + btn secundario). Esas secciones se compusieron desde fragmentos de las páginas internas + invención.
- **2 secciones tienen LOCKED parcial**: Hero (✅ todo respeta LOCKED) y Footer (sitemap LOCKED ✅, pero categorías "Compañía"/"Recursos" y email genérico inventados).
- **Las descripciones de las 4 verticales en la sección horizontal** son recombinaciones — no hay LOCKED de "tag corto del vertical para el home", solo el hero completo de cada vertical.

**Las dos rutas razonables**:

**Ruta A · Rebuild desde cero del home con copy 100% literal del LOCKED**
- Hero completo (LOCKED respetado, sin tocar).
- Verticales: usar texto del subtítulo hero LOCKED de cada vertical, sin recombinar.
- Eliminar Tesis del home (es copy de SC, no del home) o sustituir por placeholder explícito que diga "Sección pendiente — Eduardo escribirá copy LOCKED".
- Eliminar Track record body inventado; mantener solo los 4 stats con datos LOCKED.
- Reemplazar CTA final h2 inventado por una repetición del hero LOCKED o eliminar la sección hasta que Eduardo escriba copy.
- Footer: cambiar headers a categorías LOCKED del sitemap.
- **Costo**: 1 sesión Sonnet, ~30 min.
- **Riesgo de regresión**: bajo — el LOCKED es contractual.

**Ruta B · Find-and-replace quirúrgico**
- Solo posible para ~6 fixes textuales identificados (h2 CTA final, "como pitch"→"pitch", "Commerce Growth"→"Commerce Growth Partner", num eyebrow VL, link "Ver términos"→"Ver tesis"). El resto requiere rewrite porque no hay LOCKED equivalente.
- **No resuelve** las 3 secciones inventadas de raíz (Tesis bodies, Track body, CTA h2/body, Footer cols).

---

**Mi lectura sin opinión sobre estética**: Ruta A es la única que cumple la regla "no inventar copy". Ruta B deja inventos vivos.

**STOP.** No toqué `pages/index.html`. Esperando decisión de Eduardo sobre A vs B (o tercera vía: pausar Fase 4 hasta que escriba copy LOCKED para home completo).

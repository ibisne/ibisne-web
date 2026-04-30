# PROGRESS.md — VAULT v2 · Plan maestro

> Plan: `C:\Users\ibisn\.claude\plans\se-perdio-la-sesion-cryptic-quilt.md`
> Última actualización: 2026-04-25

---

## Estado global

| Fase | Estado | % | Bumped a |
|---|---|---|---|
| **1 · Auditoría** | ✅ COMPLETA y aprobada | 100% | — |
| **2 · Depuración** | ✅ COMPLETA | 100% | v2.4.2 ✅ |
| **3 · Limpieza del repo** | ✅ COMPLETA · v1 archivado en `/legacy/` | 100% | — |
| **4 · Reconstrucción del sitio** | ✅ COMPLETA · 8/8 páginas del sitemap (home + 4 verticales + portafolio + nosotros + contacto + blog) | 100% (8 de 8 páginas) | v2.5.1 ✅ |
| 5 · Animaciones avanzadas | ⏸ | 0% | v3.0.0 (planificado) |

---

## Fase 1 · Auditoría — completa

**Entregable:** `/AUDIT.md` en raíz del repo.

**Modelos usados (per política Eduardo):**
- Haiku: token usage audit, contaminación legacy v1, política de verde (3 audits paralelos).
- Sonnet: deep audit de components.css, components-extra.css, motion.js (3 audits paralelos).
- Opus: ninguno (no se requirió decisión de arquitectura, solo análisis).

**Hallazgos consolidados:**
- 8 CRITICAL · 19 WARN · ~28 NIT.
- 2 falsos positivos descartados (keyframes drift/breathe/blink existen; mint en `.menu-link.is-active` es correcto per spec).
- Cero contaminación v1. Cero box-shadow decorativos. Cero gradientes no permitidos. Cero hex de verde fuera de tokens.

**Decisiones tomadas:**
- Ninguna unilateral. Todos los hallazgos quedan documentados con fix propuesto, sin tocar código.

**Blockers:** ninguno.

**Próximo paso:** Eduardo revisó `/AUDIT.md` y aprobó plan ("go"). → ver Fase 2.

---

## Fase 2 · Depuración — parcial (v2.4.0)

**Aplicado** (safe, sin decisiones de diseño):
- 3 CRITICAL: M-C1 (initMagnetic huérfano), M-C2 (cursor rAF cancel), C-C1 (`:focus-visible` WCAG).
- 2 WARN: M-W4 (reduced-motion guards en 4 funciones), CE-W2 (dedup `.tier-table-wrap`).
- 7 NIT: 3 tokens huérfanos eliminados, alias `--bg-elevated` retirado y 6 usos migrados a `--bg-paper`, `.btn-line` vacío eliminado, 2 box-sizing redundantes, comentarios magnetic stale limpiados, `--z-modal` marcado reservado.

**Verificación preview** (http://localhost:8787/design-system-v2/UI%20Kit.html):
- ✅ Cero errores y cero warnings de consola tras carga limpia.
- ✅ Tokens migrados correctamente (`--bg-elevated` removido, `--bg-paper` resuelve a #14191F).
- ✅ Regla `:focus-visible` activa desde `components.css?v=2.4.0` (10 selectores agrupados).
- ✅ `initMagnetic` no genera ReferenceError (no aparece como global leaked).
- ✅ `initCursor.cancel` expuesto para teardown.
- ✅ Visual del UI Kit intacto: hairlines, mint en eyebrows, tipografía masiva, cero glow/gradients, sistema VAULT coherente.

**Cache-bust**: bumpeado `?v=2.3.6` → `?v=2.4.0` en los 4 `<link>` + `<script>` de `UI Kit.html`.

**Entregable**: `/CHANGELOG.md` con lista detallada de cambios + sección "Pendiente" listando los fixes que requieren decisión.

**Cierre Fase 2 (v2.4.2 — go con todo aprobado):**

- ✅ Tanda 3 · Tokenización aplicada: 11 tokens nuevos en `tokens.css` (subí de 10 a 11 al separar `--fs-nano` de `--fs-pico` porque grep encontró 5 ocurrencias de 9px que el audit no había contado). 12 reemplazos de literales aplicados en `components.css` y `components-extra.css`.
- ✅ Tanda 2 · SPA listener leaks resueltos: `AbortController` por scope en `initScrollStack`/`initHorizontal`, abortado antes de cada `replaceWith`. Document listeners de mega-menu delegados con guard `_docBound`. `.verticals-horizontal.is-mobile` reemplaza los 2 `!important` mobile (con cancel del rAF coordinado).
- ✅ FAQ refactor: `max-height: 0 → 500px` reemplazado por `grid-template-rows: minmax(0, 0fr) → minmax(0, 1fr)`. Sin magic number. Verificado: closed=0px, opened=86.375px, simétrico.
- ✅ Bonus: agregué `initHorizontal(newMain)` al batch de re-inits del SPA navigate (faltaba — la sección horizontal no se reactivaba post-nav).

**Verificación preview**: cero errores/warnings, todos los tokens resuelven, FAQ colapsa correctamente, visual del UI Kit idéntico al baseline.

**Cache-bust**: `?v=2.4.2` (`?v=2.4.1` intermedio en iteración FAQ).

**NIT pendiente** (no aplicado, queda para batch separado cuando lo decidas): C-W3 (extraer `.nav-row-inner`), C-N3/C-N4 (naming `.eyebrow`/`.section-num` y `.t-body`/`.t-secondary`), CE-N3/N4 (~12 spacing/font hardcoded restantes en components-extra.css), M-N2 (dead `.menu-close` selector guardado).

**Aprobado por Eduardo ("dale") → arrancada Fase 3.**

---

## Fase 3 · Limpieza del repo — inventario completo

**Mapeado**: raíz + 6 subdirs (`/.claude/`, `/assets/`, `/brand/`, `/design-system/` v1, `/design-system-v2/` v2, `/pages/`, `/scripts/`).

**Hallazgos clave**:
- `README.md` está OBSOLETO — describe v1 como "único sistema visual oficial", **CONFLICTO directo con `CLAUDE.md`** que declara v2 como oficial. Requiere reescritura.
- `TEXTOS-RESPALDO.md` es el respaldo del copy LOCKED de Eduardo (sitemap, hero, 4 verticales). **CRÍTICO para Fase 4** — conservar.
- `assets/img/` y `assets/logos/` son scaffolding vacío. Conservar (se llenarán en Fase 4).
- `scripts/*.py` (3 archivos) son herramientas operacionales del negocio (P&L, Google Sheets de marcas). **No relacionados con el web**. No tocar sin confirmación.
- `brand/iBisne_blanco.png` es logo oficial — conservar.

**Legacy v1 a decidir** (5 items): `design-system/`, `design-system/uploads/`, `pages/index.html`, `index.html` raíz, `BRIEF-PARA-CLAUDE-DESIGN.md`.

**Recomendación**: archivar los 5 items en `/legacy/` para conservar historia sin contaminar el árbol activo.

**No se borró NADA todavía.** Plan dice "Eduardo aprueba archivo por archivo".

**Entregable**: `/LEGACY-PURGE.md` con inventario completo, clasificación A/B/C/D, plan de purga propuesto y 7 preguntas explícitas.

Eduardo dijo "tu decide" → ejecuté las 7 decisiones con criterio (archivar lo que crea ruido o riesgo, no tocar lo que es operativo del negocio).

**Acciones ejecutadas**:
1. `/design-system/` → `mv → /legacy/design-system/`
2. `/design-system/uploads/` → archivado (parte del move anterior)
3. `pages/index.html` → `mv → /legacy/pages/index.html`
4. `index.html` raíz → **reescrito** apuntando a `design-system-v2/UI%20Kit.html` (placeholder mientras llega home v2)
5. `BRIEF-PARA-CLAUDE-DESIGN.md` → `mv → /legacy/`
6. `README.md` → **reescrito** desde cero reflejando v2 oficial (resolvía conflicto con CLAUDE.md)
7. `scripts/*.py` → sin cambios (operativo del negocio iBisne)

**Resultado**: árbol activo limpio (solo `/design-system-v2/` + `/pages/` vacío + assets/brand). Legacy aislado en `/legacy/`. README sin conflictos. Si algo se rompe, revertir es 2 comandos `mv`.

**Entregable**: `/LEGACY-PURGE.md` actualizado con § "Acciones ejecutadas" + tabla detallada + estructura post-limpieza + verificación.

**Aprobado por Eduardo ("si dale") → arrancada Fase 4.**

---

## Fase 4 · Reconstrucción del sitio — home v0.1 listo

**Construido**: `pages/index.html` consumiendo VAULT v2.4.2 puro. 6 secciones:
1. **Hero** con copy LOCKED ("Si funciona, es porque lo operamos.") + CTA accent "Hagamos bisne" + link "Ver verticales"
2. **Verticales** (`.verticals-horizontal`) — golpe de teatro: sticky+scroll lateral en ≥1024px, stack vertical en mobile. 4 paneles con copy resumido + meta + link a la página de cada vertical.
3. **Tesis · Cómo operamos** — 3 `.editorial-card` derivados de la tesis Smart Capital LOCKED (mercado probado · ejecución propia · digital como palanca de margen).
4. **Track record** — `.metrics-row` con 4 stats verificables: `9 marcas` (key, en phosphor) · `4 verticales` · `16 años+` · `0% fee`. Body explicativo con NDA hint.
5. **CTA final** (`.cta-final`) — input email + 2 botones (accent "Hagamos bisne" + line "Soy inversionista"). H2 cierre: "Si funciona, es porque lo operamos contigo."
6. **Footer** 4 cols (Verticales · Compañía · Recursos · Contacto).

**Navbar**: v2.2 completo. Desktop: topbar + main row con mega-menu sobre Verticales. Mobile (≤768px): nav-mobile-bar + nav-overlay full-screen sin scroll.

**Política del verde respetada**: 1 `.t-accent` en hero ("operamos") + 1 `.metric.is-key` ("9"). El resto de phosphor solo en btn-accent (CTAs decisivos), nav active dot, blink cursor, h-progress active, scroll-indicator tick. Todo dentro del allow-list del HANDOFF.md.

**Verificación preview** (3 viewports):
- Desktop 1440 · Tablet 768 · Mobile 375 — los 3 sin overflow horizontal, sin errores de consola, sin warnings.
- Todos los CSS cargan con cache-bust `?v=2.4.2` desde paths relativos `../design-system-v2/`.
- motion.js init correctamente (`window.__VAULT__` expuesto, grain inyectado).
- Verticales colapsan a stack vertical en mobile, metrics colapsan a 2x2.

**Iteración aplicada**: primera versión tenía 2 palabras phosphor en hero ("operamos" + "invertimos") + otra en CTA. Reducido a 1 en hero solamente. Editorial más limpio.

**Decisión a discutir contigo antes de continuar**:
- El home consume copy LOCKED del Hero + copy DERIVADO (no inventado) para tesis/stats/CTA usando palabras textuales del TEXTOS-RESPALDO.md de cada vertical. No inventé nada — pero confirma si te suena el approach antes de aplicar el mismo criterio a las páginas internas (donde sí hay copy LOCKED completo por sección).

**Próximo paso**: tu validación del home, después arranco páginas internas en paralelo. Orden propuesto: 4 verticales (Commerce Growth · Smart Capital · Emergente · Venture Lab — copy LOCKED completo en TEXTOS-RESPALDO.md sección por sección) → portafolio → nosotros → contacto → blog (este último mínimo, copy CMS pendiente).

**Home v0.2 aprobado por Eduardo (2026-04-26).**

## Fase 4 · Reconstrucción — 4 verticales en v2.5.0 (2026-04-26)

**Construidas en paralelo (4 subagentes Sonnet):**
- `pages/verticales/commerce-growth.html` — 8 secciones · copy LOCKED 100% · editorial-card pattern
- `pages/verticales/smart-capital.html` — 8 secciones · 2 tier-tables · stepper CTA 01/02/03
- `pages/verticales/emergente.html` — 8 secciones · 2 tier-tables · waitlist form placeholder · pre-launch
- `pages/verticales/venture-lab.html` — 8 secciones · deal table 2-col · proceso 4-fases

**Cache-bust general:** `?v=2.5.0` en todas las páginas incluyendo home.

**Filosofía de distribución aplicada:** copy LOCKED distribuido por componentes (editorial-card, tier-table, faq, cta-final) — no copy-paste literal de prosa densa.

**Correcciones de jerarquía v2.5.1 (2026-04-26):**
- Emergente: `.t-display` → `.t-h2` en los 5 section h2 (115px → 72px)
- 4 CTAs: h2 sin clase → `style="font-size: var(--fs-display);"` (180px → 115px)
- Smart Capital: `white-space: nowrap` en metric "2–5 años" (fix de wrapping)
- CGP §02 MODELO: párrafo secundario gris añadido antes de los editorial-cards
- Emergente §03/§04: párrafos secundarios grises añadidos
- Cache-bust: queda en `?v=2.5.0` (correcciones de jerarquía no requieren bump)

**Aprobado y almacenado. Próximo paso: portafolio/nosotros/contacto/blog.**

## Fase 4 · Reconstrucción — 4 páginas finales en v2.5.0 (2026-04-26)

**Construidas en paralelo (4 subagentes Sonnet, run_in_background):**
- `pages/portafolio.html` (436 líneas) — hero compacto + 2 marcas públicas (Medical Mexicanna · DCI) + 7 placeholders NDA con candado SVG + cta-block "Solicitar NDA"
- `pages/nosotros.html` (357 líneas) — hero + 1 editorial-card manifiesto + grid 3×2 de 6 socios (5 LOCKED + integrante 06 placeholder) + cta-block "Hagamos bisne"
- `pages/contacto.html` (715 líneas) — selector de 3 intents (founder · LP · idea) + form 3-step con stepper visual reusando `.h-progress` + note regulatoria condicional LP + 38 líneas JS inline (intent toggle, step navigation, submit placeholder)
- `pages/blog.html` (361 líneas) — hero placeholder + 3 editorial-cards de próximos artículos + waitlist mini con `.field` + btn-accent

**Cache-bust general:** queda en `?v=2.5.0` (sin bump — ningún cambio en CSS/JS del sistema).

**Filosofía aplicada:** copy LOCKED textual de TEXTOS-RESPALDO.md donde existía (portafolio §, nosotros §, blog títulos del plan); en contacto se derivó de los CTAs LOCKED de las 4 verticales (CGP §08 · Smart Capital §08 stepper · Venture Lab §08). Cero copy inventado.

**Decisiones confirmadas con Eduardo antes de arrancar:**
- Form contacto sin backend → JS muestra `.note` "Recibido. Te contactamos en 48h" (3 semanas si intent=idea)
- Fotos equipo → placeholders editoriales `[ FOTO · 1:1 · NOMBRE ]`
- Títulos blog → 3 propuestos (Modelo · Producto · Capital)
- Integrante 06 → card placeholder para grid simétrico

**Verificación preview** (http://localhost:8787/pages/{portafolio,nosotros,contacto,blog}.html):
- ✅ Las 4 páginas sirven 200, con nav+footer+overlay completos copiados textual del index.
- ✅ `aria-current="page"` + `class="is-active"` correctamente marcado en cada link de la página actual (desktop + mobile overlay).
- ✅ Cada página incluye 5 ocurrencias de `?v=2.5.0` (4 link + 1 motion.js).
- ✅ Cero contaminación v1: `Grep --cyan|--violet|Space Grotesk|Chakra Petch|scanline` → vacío.
- ✅ Cero errores/warnings de consola al cargar.
- ✅ Visual del hero correcto (typografía masiva, eyebrow mint, hairlines, dark, sin glow/gradientes).

**Bug encontrado y arreglado en contacto.html:**
- Los radios `input[name="intent"]` viven en §01.INTENT (fuera del `<form id="contactForm">`), pero el JS los buscaba con `form.querySelectorAll(...)` → 0 matches → el toggle de intent no funcionaba.
- Fix: `form.querySelectorAll('input[name="intent"]')` → `document.querySelectorAll('input[name="intent"]')`. Una línea cambiada en el IIFE inline. Verificado: tras el fix, marcar el radio `#i-founder` aplica `data-active-intent="founder"` al form correctamente.

**Pendiente para próxima sesión** (no son blockers):
- Backend del form de contacto (decidir Formspree / Netlify Forms / mailto)
- Fotos reales del equipo (6 jpg cuando Eduardo entregue)
- CMS / contenido real del blog (Q3 2026 según copy del propio placeholder)
- Foto real para las 2 marcas públicas + iconografía bloqueada para las 7 NDA si Eduardo pide refinamiento

**Estado global Fase 4:** ✅ COMPLETA (8 de 8 páginas del sitemap iBisne en VAULT v2). Próxima fase a discutir: animaciones avanzadas (v3.0.0) o sustitución de placeholders por foto real.

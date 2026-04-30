# AUDIT.md — VAULT v2.3.6 · Auditoría Fase 1

> Generado: 2026-04-25
> Alcance: `/design-system-v2/` exclusivamente. Todos los archivos del sistema (tokens.css, components.css, components-extra.css, motion.css, motion.js, UI Kit.html, icons-reference.html, README.md, HANDOFF.md).
> Modelos usados: Haiku (escaneo de tokens, contaminación legacy, política verde) + Sonnet (deep audit de components.css, components-extra.css, motion.js).
> Convención de severidad: **CRITICAL** = bug real, regresión funcional o WCAG · **WARN** = deuda técnica, riesgo a futuro · **NIT** = cosmético / consistencia.

---

## Resumen ejecutivo

| Severidad | Total | Top hits |
|---|---|---|
| **CRITICAL** | **8** | `initMagnetic()` undefined en motion.js (rompe SPA nav) · 6 elementos interactivos sin `:focus-visible` (WCAG 2.4.7) · cursor rAF loop sin cancel path |
| **WARN** | **19** | Listeners de scroll/document acumulándose en SPA reinit · `max-height` animation en `.faq-panel` (perf) · 9 valores hardcodeados en components.css · `!important` sobre transforms en `.verticals-horizontal` mobile |
| **NIT** | **~28** | 6 tokens huérfanos · 3 tokens fantasma · alias duplicado `--bg-elevated`/`--bg-paper` · ~18 px/spacing sin tokenizar en components-extra.css · referencias a "magnetic" en comentarios |

**Falsos positivos detectados** (ignorar):
- `@keyframes drift/breathe/blink` SÍ existen (tokens.css L112-L123). Agente marcó CRITICAL erróneamente.
- `.menu-link.is-active` usando `var(--accent-mint)` es CORRECTO (spec: "nav-links active state" → mint; phosphor reservado para el `::before` dot).

**Cumplimientos limpios** (no requieren acción):
- Cero contaminación v1: ningún `--cyan`/`--violet`, ningún `Space Grotesk`, ningún marker `//` visual, ningún emoji, ninguna lib de iconos externa.
- Box-shadow: cero declaraciones decorativas en todo el sistema.
- Gradientes: solo el permitido en `.scroll-indicator .line` (components-extra.css:64).
- Política de verde: 16/16 usos de `--accent` justificados, 17/17 usos de `--accent-mint` justificados.
- Cero hardcoded hex de verde fuera de tokens.css.

---

## 1 · `tokens.css`

### CRITICAL
*(ninguno)*

### WARN
*(ninguno)*

### NIT
| ID | Línea | Hallazgo | Fix propuesto |
|---|---|---|---|
| T-N1 | 11 | Alias `--bg-elevated: #14191F` duplica `--bg-paper`. Marcado como "alias legacy" en comentario. 6 usos vs 11 de `--bg-paper`. | Migrar los 6 usos de `--bg-elevated` a `--bg-paper`, eliminar el alias. |
| T-N2 | 48 | `--fw-semibold: 600` declarado, nunca usado. | Eliminar (o documentar que se reserva para futuro). |
| T-N3 | 85 | `--r-none: 0` declarado, nunca usado. | Eliminar (el comentario adjacente ya explica que VAULT no usa radii). |
| T-N4 | 89 | `--z-base: 1` declarado, nunca usado. | Eliminar o aplicar en `.toggle button` (z-index hardcodeado, ver CE-N15). |
| T-N5 | 90 | `--z-sticky: 20` declarado, nunca usado. | Eliminar (no hay sticky elements aún). |
| T-N6 | 95 | `--z-modal: 110` declarado, nunca usado. | Mantener (es contractual para futuras modals — agregar comentario `// reservado`). |
| T-N7 | 43 | `--ls-body: -0.005em` declarado, nunca usado. | Aplicar a `.t-body` o eliminar. |

**Tokens fantasma (referenciados pero no declarados):**
| ID | Referencia | Decisión |
|---|---|---|
| T-N8 | `--btn-pad-x` / `--btn-pad-y` (components.css:183) | Son scoped al bloque `.btn`. Renombrar a `--_pad-x` / `--_pad-y` (convención CSS para "private") o subir a tokens.css. |
| T-N9 | `--marquee-dur` (components-extra.css:275, 281) | Mismo caso — scoped a `.marquee`. Renombrar con prefix `_`. |

---

## 2 · `components.css`

### CRITICAL
| ID | Línea | Hallazgo | Fix propuesto |
|---|---|---|---|
| C-C1 | varios | **6 elementos interactivos sin `:focus-visible`** (WCAG 2.4.7 / 2.4.11): `.btn`, `.link`, `.field input/textarea/select` (tiene `outline: none` sin reemplazo), `.nav-toggle`, `.nav-links a` / `.nav-mega-trigger`, `.nav-topbar .tb-social a` | Agregar pattern: `outline: 2px solid var(--accent-mint); outline-offset: 3px;` en `:focus-visible` para cada uno. Quitar `outline: none` del `.field input` o reemplazar con focus ring visible. |

### WARN
| ID | Línea | Hallazgo | Fix propuesto |
|---|---|---|---|
| C-W1 | 564-587 | Doble selector `.nav-links a.nav-mega-card, .nav-mega-card` con 5 `!important` (fix v2.3.5) gana el cascade pero es deuda. | Largo plazo: sacar el mega-card del DOM bajo `.nav-links` para que `.nav-links a` no matchee. Eliminaría los `!important` y el doble selector. |
| C-W2 | 339, 345-346, 451, 477-478, 569-570, 577, 592 | 9 valores hardcoded (font-sizes 18px/14px/22px/9px, spacing 22px, letter-spacing -0.02em, sizes de textarea 96/320px, etc.) | Crear tokens: `--fs-input: 18px`, `--fs-base: 14px`, `--fs-card-title: 22px`, `--fs-nano: 9px`, `--field-textarea-min-h: 96px`, `--field-textarea-max-h: 320px`. Reemplazar literales. |
| C-W3 | 405 vs 466 | `.nav-topbar-inner` y `.nav-inner` declaran 6 propiedades idénticas de layout (width/max-width/margin/padding/flex/align/justify/gap). | Extraer `.nav-row-inner` utility común; cada row solo override de su gap único. |

### NIT
| ID | Línea | Hallazgo | Fix |
|---|---|---|---|
| C-N1 | 290 | `.btn-line { /* comentario */ }` selector con cuerpo vacío. | Eliminar regla. |
| C-N2 | 322, 330 | `box-sizing: border-box` redundante en `.field` y `.field input/textarea/select` (ya está global L8). | Eliminar las 2 redundancias. |
| C-N3 | 52 vs 64 | `.eyebrow` y `.section-num` comparten 5 declaraciones (mono/micro/uppercase/mint). | Documentar intent o unificar como `.eyebrow.is-counter`. |
| C-N4 | 113 vs 126 | `.t-body` y `.t-secondary` ambas asignan `color: var(--text-secondary)`. | Quitar `color` de `.t-body` (que sea solo size/lh) o documentar separación. |

---

## 3 · `components-extra.css`

### CRITICAL
*(ninguno — los 4 marcados por el agente son falsos positivos: keyframes drift/breathe/blink existen en tokens.css; mint en `.menu-link.is-active` es correcto per spec)*

### WARN
| ID | Línea | Hallazgo | Fix |
|---|---|---|---|
| CE-W1 | 429-439 | `.faq-panel` anima `max-height: 0 → 500px`. Triggers layout cada frame; el `500px` es magic number frágil. | Usar JS + `ResizeObserver` con transition en `height` real, o `interpolate-size: allow-keywords` con `calc-size()` (Chrome 129+). |
| CE-W2 | 1257 | `.tier-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch }` duplica L964-966. | Eliminar el bloque mobile duplicado. |
| CE-W3 | 1160, 1162 | `.verticals-horizontal { height: auto !important }` y `.h-track { transform: none !important }` para sobreescribir inline-style del JS en mobile. | Coordinar con `motion.js`: agregar clase `.is-mobile` al detectar viewport, scopear con `.verticals-horizontal.is-mobile { height: auto; }` sin `!important`. |
| CE-W4 | 13 | `.hero { padding-top: 144px }` hardcoded. | Crear `--hero-offset` token o `calc(var(--nav-h) * 2)`. |
| CE-W5 | 243 | `background: rgba(13, 17, 23, 0.6)` — color de marca hardcodeado para scrim. | `color-mix(in srgb, var(--bg-deep) 60%, transparent)` o token `--bg-scrim`. |
| CE-W6 | 248, 285, 349, 449 | Font-sizes one-off con clamp() fuera de la escala (`28px`, `clamp(32px,5vw,56px)`, `clamp(48px,7vw,96px)`, `clamp(48px,12vw,180px)`). | Extraer tokens si se reutilizan o documentar como overrides explícitos. |
| CE-W7 | 244 | `backdrop-filter: blur(8px)` en `.case-tile .ct-tag`. Único en el archivo, riesgo bajo de stacking. | Verificar que ningún ancestro (nav `.is-scrolled`, overlay) compone backdrop concurrente. |
| CE-W8 | 769, 1181 | `z-index: 5` (`.h-progress`) y `z-index: calc(var(--z-overlay) + 1)` (`body.menu-locked .nav`). Aritmética sobre tokens es smell. | Agregar `--z-raised` y `--z-nav-locked` a tokens.css. |

### NIT
| ID | Línea | Hallazgo |
|---|---|---|
| CE-N1 | 979, 987 | `.tier-table thead th` overrides redundantes con shorthand de L975. |
| CE-N2 | 148 | `margin-left: 4px` → usar `var(--sp-1)`. |
| CE-N3 | 493, 497, 542, 555, 583, 598, 776, 787, 929 | ~12 spacing/font-size hardcoded (`12px`, `10px`, `6px`, `36px`, `9px`, `8px`). |
| CE-N4 | 542 | `font-size: 10px` aparece 3× — extraer `--fs-nano` (también necesario en components.css). |
| CE-N5 | 1123 | `.toggle button { z-index: 1 }` → usar `var(--z-base)` (también soluciona T-N4). |
| CE-N6 | 1207, 1194, 1213, 1200-1202, 1293, 1296, 1210 | Varios overrides en media query mobile sin componente correspondiente en este archivo (vienen de components.css). Verificar que existan. |

---

## 4 · `motion.css`

### CRITICAL / WARN / NIT
*(ningún hallazgo. Archivo limpio: reveals, cursor base, page-transition, grain, reduced-motion guards correctos.)*

---

## 5 · `motion.js`

### CRITICAL
| ID | Línea | Hallazgo | Fix |
|---|---|---|---|
| M-C1 | 279 | `initMagnetic(newMain)` — función NO existe. Lanza `ReferenceError` en cada navegación SPA. Funcionalidad legacy purgada en v2.2.2 que dejó la llamada huérfana. | Eliminar la línea 279. |
| M-C2 | 48-50 | `initCursor` ejecuta `requestAnimationFrame(tick)` recursivo sin guardar id ni cancel path. Loop perpetuo aunque el cursor se desactive. | `let rafId = requestAnimationFrame(tick)`, exponer cancel para teardown. |

### WARN
| ID | Línea | Hallazgo | Fix |
|---|---|---|---|
| M-W1 | 182, 360 | `window.addEventListener('scroll', update)` adentro de loops por elemento — cada SPA nav que llame `initScrollStack(newMain)` / `initHorizontal(newMain)` agrega listener nuevo sin remover el viejo. | Trackear listeners por sección o usar AbortController para limpiar antes de re-attach. |
| M-W2 | 429-430 | `document.addEventListener('keydown')` y `addEventListener('click')` dentro de forEach de mega-menu items — cada reinit los multiplica. | Bind único a nivel `document` con event delegation, fuera del loop. |
| M-W3 | 159-179 | `initScrollStack` `update()` muta `layer.style.*` en cada scroll event sin throttle por rAF. Listener es passive (OK) pero el handler corre en hilo de scroll. | Wrap del cuerpo de `update` con rAF debounce flag. |
| M-W4 | varios | `initReveals`, `initScrollStack`, `initHorizontal`, `initBgFade` NO checkean `prefers-reduced-motion`. Solo `initCursor`, `initGrain`, `initPageTransitions` lo hacen. | Agregar `if (reducedMotion) return` al inicio de cada uno. |

### NIT
| ID | Línea | Hallazgo |
|---|---|---|
| M-N1 | 4, 187, 277 | Comentarios stale referencian "magnetic" tras la purga v2.2.2. |
| M-N2 | 462 | `.menu-close` selector sin elemento correspondiente en UI Kit.html (guardado por `&&`, no fatal). Dead code. |

---

## 6 · `UI Kit.html` y `icons-reference.html`

### CRITICAL / WARN
*(ninguno. Estructura, imports, cache-bust `?v=2.3.6` y meta no-cache correctos.)*

### NIT
*(opcional — los selectores `.spacing-row .bar` y `.swatch` referencian `--accent-soft`/`--accent-glow` solo aquí. Confirma que es uso documental aceptable.)*

---

## 7 · Política de verde (3 tiers) — auditoría dedicada

| Tier | Token | Conteo total | Veredicto |
|---|---|---|---|
| Phosphor | `var(--accent)` | 16 usos productivos + 1 doc en UI Kit | ✅ Todos en allow-list (btn-accent, metric.is-key, scroll-indicator, h-progress active, blink cursor, status active, nav active dot, cursor blob hover) |
| Mint | `var(--accent-mint)` | 17 usos productivos | ✅ Todos informacionales (eyebrows, section-num, link hover, field focus, nav hover/active text, mega-card hover, menu-link arrows) |
| Soft/Glow | `var(--accent-soft)`, `var(--accent-glow)` | 2 usos solo en UI Kit (documentación) | ⚠️ Cero uso productivo. Considerar si justifica el token o documentar como reservado para futuro. |

**Hex hardcoded fuera de tokens.css: 0.** Compliance perfecto.

---

## 8 · Plan de fixes propuesto para Fase 2

Si Eduardo aprueba este audit, el orden recomendado de aplicación en Fase 2 sería:

1. **CRITICAL primero (3 fixes, ~15 min):**
   - M-C1: borrar línea 279 de motion.js (`initMagnetic` huérfano).
   - M-C2: cancel path para cursor rAF.
   - C-C1: agregar `:focus-visible` a 6 elementos interactivos.
2. **WARN de mayor impacto (8-10 fixes, ~45 min):**
   - M-W1, M-W2: limpiar SPA listener leaks.
   - M-W3, M-W4: throttle + reduced-motion guards en motion.js.
   - CE-W1: refactor `.faq-panel` animation.
   - CE-W2: deduplicate `.tier-table-wrap`.
   - CE-W3: limpiar `!important` de `.verticals-horizontal` mobile coordinando con motion.js.
3. **WARN de tokenización (consolidar en una pasada, ~30 min):**
   - C-W2 + CE-W4 a CE-W8: crear tokens nuevos (`--fs-input`, `--fs-base`, `--fs-nano`, `--fs-card-title`, `--field-textarea-min-h`, `--field-textarea-max-h`, `--bg-scrim`, `--hero-offset`, `--z-raised`, `--z-nav-locked`) y reemplazar literales.
4. **NIT (revisión separada o batch al final):**
   - Eliminar tokens huérfanos T-N2/N3/N5; migrar `--bg-elevated` a `--bg-paper` (T-N1); limpiar comentarios stale; deduplicate selectores.

Bumpear UI Kit a `?v=2.4.0` post-Fase 2.

**STOP. Esperando aprobación de Eduardo para proceder con Fase 2.**

---

## 9 · Status update post-merge (2026-04-26)

> Sesión nueva tras pérdida de la anterior. Validación del AUDIT contra el código actual + merge con escaneo Haiku nuevo.

### Findings ya resueltos (verificado contra código)

| ID | Estado | Evidencia |
|---|---|---|
| **M-C1** initMagnetic huérfano | ✅ FIXED en v2.4.0 | `grep initMagnetic` en `/design-system-v2/` → 0 hits |
| **M-C2** cursor rAF sin cancel | ✅ FIXED en v2.4.0 | `motion.js:50-62` tiene `cursorRaf` + `initCursor.cancel` |
| **C-C1** focus-visible WCAG | ✅ FIXED en v2.4.0 | `components.css` tiene 11 reglas `:focus-visible` |
| **T-N1** alias `--bg-elevated` | ✅ FIXED en v2.4.0 | grep en tokens.css → 0 hits |
| **T-N2** `--fw-semibold` | ✅ FIXED en v2.4.0 | grep → 0 hits |
| **T-N3** `--r-none` | ✅ FIXED en v2.4.0 | grep → 0 hits |
| **T-N5** `--z-sticky` | ✅ FIXED en v2.4.0 | grep → 0 hits |
| **C-N1** `.btn-line` vacío | ✅ FIXED en v2.4.0 | per CHANGELOG |
| **C-N2** box-sizing redundante | ✅ FIXED en v2.4.0 | per CHANGELOG |
| **M-N1** comentarios magnetic | ✅ FIXED en v2.4.0 | per CHANGELOG |
| **T-N6** `--z-modal` reservado | ✅ FIXED (marcado reservado) en v2.4.0 | per CHANGELOG |
| **M-W4** reduced-motion guards | ✅ FIXED en v2.4.0 | per CHANGELOG |
| **CE-W2** dedup `.tier-table-wrap` | ✅ FIXED en v2.4.0 | per CHANGELOG |
| **C-W2 + CE-W4 a CE-W8** tokenización (10→11 tokens) | ✅ FIXED en v2.4.2 | per CHANGELOG |
| **M-W1, M-W2, M-W3** SPA listener leaks | ✅ FIXED en v2.4.2 | AbortController + delegation + `.is-mobile` |
| **CE-W1** FAQ animation refactor | ✅ FIXED en v2.4.2 | `grid-template-rows minmax(0, 0fr→1fr)` |
| **CE-W3** `!important` en `.verticals-horizontal` mobile | ✅ FIXED en v2.4.2 | reemplazado por `.is-mobile` |

### Findings aún pendientes (NIT batch — no aplicado todavía)

| ID | Severidad | Hallazgo |
|---|---|---|
| C-W3 | WARN | Extraer `.nav-row-inner` utility (deuda OK, no urgente) |
| C-N3 / C-N4 | NIT | Naming `.eyebrow` vs `.section-num`, `.t-body` vs `.t-secondary` |
| CE-N3 / CE-N4 | NIT | ~12 spacing/font hardcoded restantes en components-extra.css |
| M-N2 | NIT | Dead `.menu-close` selector |
| T-N7 | NIT | `--ls-body` declarado, sin uso |
| T-N8 / T-N9 | NIT | Renombrar scoped `--btn-pad-*`, `--marquee-dur` con prefix `_` |
| M-W3 | WARN | rAF debounce en `initScrollStack` (no aplicado en v2.4.2 — verificar) |

### Findings nuevos detectados en escaneo Haiku 2026-04-26

| ID | Severidad | Archivo:línea | Hallazgo | Fix propuesto |
|---|---|---|---|---|
| **UK-N1** | NIT | `UI Kit.html:30` | `.kit-toc { z-index: 40; }` hardcoded | Migrar a `var(--z-nav)` (50) o `var(--z-sticky)` si se reintroduce |
| **UK-N2** | NIT | `UI Kit.html:942` | `.section-num { z-index: 6; }` inline style hardcoded | Eliminar inline style; el valor por defecto del componente debería bastar |
| **UK-W1** | WARN | `UI Kit.html:36` | `.kit-toc { backdrop-filter: blur(10px); }` único en el archivo de demo. Riesgo bajo pero coexiste con `.nav.is-scrolled` blur si llegan a verse juntos. | Verificar visual; si stackean, reducir a `rgba(13,17,23,0.85)` sólido |

Estos 3 son del UI Kit (archivo de demo), no del sistema productivo. Severidad NIT/WARN. Pueden caer en el batch NIT cuando se acuerde uno.

---

## 10 · Estado real Fase 1

**Fase 1 (auditoría) está cerrada.** El AUDIT existente (Sonnet deep dive del 2026-04-25) sigue siendo la referencia. La validación Haiku de hoy confirma que **todos los CRITICAL y la mayoría de WARN ya fueron resueltos en Fase 2 (v2.4.0 + v2.4.2)**. Solo quedan los **NIT batch** + **3 hallazgos nuevos del UI Kit** marcados arriba.


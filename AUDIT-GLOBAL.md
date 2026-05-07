# AUDIT-GLOBAL.md — Auditoría holística post-migración

> Generado: 2026-05-04 · MacBook M1
> Alcance: copy + UX/UI + arquitectura + a11y/perf en las 8 páginas activas + design-system-v2.
> Método: 4 agentes Explore en paralelo (copy, UX/UI, arquitectura, a11y/perf) + verificación manual de hallazgos críticos contra el código.
> Convención: **CRITICAL** = bug real / regresión funcional / WCAG · **WARN** = deuda técnica / inconsistencia visible · **NIT** = cosmético / consistencia.

---

## Resumen ejecutivo

| Bucket | CRITICAL | WARN | NIT |
|---|---|---|---|
| Copy | 0 | 4 | 5 |
| UX/UI | 2 | 5 | 3 |
| Arquitectura | 3 | 2 | 3 |
| A11y / Perf | 2 | 4 | 4 |
| **Total** | **7** | **15** | **15** |

**Falsos positivos descartados (verificados contra código):**
- ❌ "Footer falta en los 4 verticales" → existe en los 4 (`grep -l <footer pages/verticales/*.html` → 4).
- ❌ "`.btn:focus-visible` está vacío" → existe en `components.css:380` aplicando a `.btn`, `.link`, `.link-arrow`, `.field input/textarea/select`, `.nav-toggle`, `.nav-links a`, `.nav-mega-trigger`.
- ❌ "intent cards usan inline `padding`" → tienen clase propia `.intent-card` declarada en el `<style>` de [contacto.html:26](pages/contacto.html:26).

**Recomendación de orden de aplicación:**
1. CRITICAL de copy + UX/UI + a11y (bugs visibles, bajo riesgo).
2. CRITICAL de arquitectura (form backend + duplicación).
3. WARN priorizados por usuario.
4. NIT solo si sobra tiempo o son trivial.

---

## 1 · Copy & contenido

### CRITICAL
*(ninguno — todos los hallazgos son drift menor o presentación)*

### WARN
| ID | Página · sección | Hallazgo | Fix propuesto |
|---|---|---|---|
| CP-W1 | [portafolio.html](pages/portafolio.html) · hero | "Todas lanzan mayo 2026" no está en TEXTOS-RESPALDO (es update copy, no LOCKED). Hoy es 2026-05-04 — ya estamos en mayo. | Verificar con Eduardo: ¿lanzamiento real o copy aspiracional? Cambiar a fecha verificable o eliminar. |
| CP-W2 | [contacto.html](pages/contacto.html) · success messages | "Recibido. Venture Lab opera con cohortes — te contactamos en hasta 3 semanas." vs venture-lab.html dice "Respuesta en 3 semanas" (sin "hasta"). | Alinear: usar "3 semanas" en ambos o "hasta 3 semanas" en ambos. |
| CP-W3 | [commerce-growth.html](pages/verticales/commerce-growth.html) · case 1 | El case 1 alterna entre "Grupo Semillas Endémicas Mexicanna" y "Medical Mexicanna" en distintas secciones. | Decidir un nombre canónico y usarlo (la marca pública es "Medical Mexicanna"). |
| CP-W4 | Verticales · section markers | Verticales usan `§ 00.00` (formato `NN.NN`); home usa `§ 00.HOME`, `§ 01.VERTICALES` (formato `NN.NOMBRE`). | Estandarizar a `§ NN.NOMBRE` (más legible) en todas las páginas, o documentar el patrón mixto en HANDOFF. |

### NIT
| ID | Hallazgo | Fix |
|---|---|---|
| CP-N1 | [contacto.html](pages/contacto.html) intent cards: `·` (middle dot) en metadata, otras secciones usan `—` (em dash). | Estandarizar a `—`. |
| CP-N2 | [emergente.html](pages/verticales/emergente.html) hero: lead text dividido en 4 líneas, rompe ritmo. | Re-flow en 2 líneas. |
| CP-N3 | [smart-capital.html](pages/verticales/smart-capital.html) FAQ 03: "¿Hay auditoría?" suena coloquial para audiencia LP. | "¿Existe auditoría externa?" |
| CP-N4 | [venture-lab.html](pages/verticales/venture-lab.html) L118: `<br>` innecesario antes de "Desde la arquitectura técnica…". | Eliminar `<br>`, dejar fluir como 2 frases. |
| CP-N5 | [blog.html](pages/blog.html): "Q3 2026 — MODELO" en h3, otras secciones omiten el em dash. | Estandarizar formato del eyebrow editorial. |

---

## 2 · UX / UI

### CRITICAL
| ID | Página · componente | Hallazgo | Fix propuesto |
|---|---|---|---|
| UX-C1 | [portafolio.html:129](pages/portafolio.html:129) · nav | "Aplicar" usa `.btn-line` mientras las otras 8 páginas usan `.btn-accent`. Inconsistencia de jerarquía visual del CTA principal. **Verificado.** | Cambiar a `class="btn btn-accent btn-sm"`. |
| UX-C2 | [contacto.html](pages/contacto.html) · form | Sin estados de error/validación. No hay `:invalid`, `aria-invalid`, ni contenedor de mensaje de error. | Agregar `.field.is-error` + estilos `:invalid` + container `<p class="field-error">` + lógica en el IIFE. |

### WARN
| ID | Página · componente | Hallazgo | Fix |
|---|---|---|---|
| UX-W1 | [portafolio.html:141](pages/portafolio.html:141) · mobile overlay | `<a href="#verticales">` rota — la sección `#verticales` solo existe en home. **Verificado: solo portafolio tiene esta link rota.** | `href="/pages/index.html#verticales"`. |
| UX-W2 | [nosotros.html](pages/nosotros.html) team grid en tablet | En 768px, el último item de cada fila conserva `border-right`, queda colgado. | Media query `@media (max-width: 1024px) .team-grid > *:nth-child(2n) { border-right: 0; }`. |
| UX-W3 | [contacto.html](pages/contacto.html) form stepper en mobile | Los progress numbers en `top: -18px` se traslapan al wrap. | Stack vertical bajo 480px o eliminar el offset negativo. |
| UX-W4 | Mega-menu cards | Se aplica `.is-active` a `.nav-mega-card` pero **no hay regla CSS** para ese estado. | Agregar en components.css: `.nav-mega-card.is-active { border-color: var(--accent-mint); }`. |
| UX-W5 | [portafolio.html](pages/portafolio.html) · hero | Hero compacto sin `.scroll-indicator`; resto de páginas tienen indicador completo. | Si es intencional, OK. Si no, añadir `.scroll-indicator` al final del hero. |

### NIT
| ID | Hallazgo | Fix |
|---|---|---|
| UX-N1 | NDA tiles en portafolio sin estado visual de "locked" más allá del icono. | Opcional: `.case-tile.is-locked { opacity: 0.7; cursor: default; }`. |
| UX-N2 | Editorial cards públicos en portafolio con `padding: 0` overrides — visualmente difieren de los del blog. | Decidir si el modificador es intencional; si no, unificar. |
| UX-N3 | Waitlist form en [blog.html](pages/blog.html) sin `max-width` mobile override. | Media query con `padding: 0 var(--grid-edge)`. |

---

## 3 · Arquitectura de software

### CRITICAL
| ID | Hallazgo | Fix propuesto |
|---|---|---|
| AR-C1 | **Duplicación masiva nav + footer**. ~111 LOC de nav + ~40 LOC de footer × 9 páginas = **~595 LOC duplicadas**. Cualquier cambio en nav requiere editar 9 archivos. | Build-step Node mínimo (~30 LOC) que parsee `<!-- include: partials/nav.html -->` y emita los HTML finales. Mantiene "no framework" del CLAUDE.md (un script de build no es framework). Alternativa más simple: SSI si el host lo soporta. |
| AR-C2 | **Form sin backend**. [contacto.html](pages/contacto.html) tiene `action=""` `method="post"` — el JS muestra mensaje de éxito pero **no envía nada**. | Decidir entre: Formspree (gratis hasta 50 envíos/mes, drop-in), Netlify Forms (si deploy en Netlify), o endpoint propio. Recomendación: Formspree para v1, migrar después si volumen lo justifica. |
| AR-C3 | **OG / Twitter Card meta tags ausentes** en las 9 páginas. Compartir el sitio en LinkedIn/WhatsApp/Twitter usará defaults del browser. | Agregar bloque OG estándar en `<head>` de cada página (con título y descripción únicos por página + 1 OG image común a generar). |

### WARN
| ID | Hallazgo | Fix |
|---|---|---|
| AR-W1 | `motion.js` re-init en SPA-nav — `initReveals/initRevealStagger/initScrollStack` se llaman doble en algunas rutas. AbortController está bien, pero falta guard para prevenir doble bind. | Flag `_initialized` por scope o pasar siempre el `controller` explícito. |
| AR-W2 | `window.__VAULT__` expone los 9 inits globalmente. OK para debug, pero no debería estar en producción sin documentar. | Gate con `if (window.location.hostname === 'localhost')` o documentar como API de debug. |

### NIT
| ID | Hallazgo | Fix |
|---|---|---|
| AR-N1 | `components-extra.css` (1308 LOC) es catch-all — mezcla case-tile, intent-card, team-grid, faq, etc. | Si cresta, partir por dominio (`components-cards.css`, `components-form.css`, `components-table.css`). No urgente. |
| AR-N2 | Cache-bust `?v=X.Y.Z` es manual en N archivos. Drift detectado en este audit (de 2.5.0 ↔ 2.6.2). | Script `bump-version.js` que reemplaza en todos los HTML del repo. |
| AR-N3 | [index.html](index.html) raíz tiene meta refresh + JS redirect + anchor — overengineered. | Funciona; simplificar solo si molesta. |

---

## 4 · A11y & Performance

### CRITICAL
| ID | Página | Categoría | Hallazgo | Fix |
|---|---|---|---|---|
| AP-C1 | Todas | a11y | **Mobile overlay sin keyboard escape**: no se cierra con `Esc`, no atrapa focus dentro, no devuelve focus al toggle al cerrar. | En `motion.js` → `initNavMobile`: bind `keydown` con `Escape`, focus-trap dentro del overlay, `requestFocus()` al toggle al cerrar. |
| AP-C2 | [contacto.html](pages/contacto.html) | a11y | Intent radiogroup sin `<fieldset>` + `<legend>` (visualmente oculto). El `role="radiogroup"` actual está sobre un `<div>`. | Wrappear con `<fieldset role="radiogroup" aria-labelledby="intent-legend">` + legend visualmente oculto con `.sr-only`. |

### WARN
| ID | Categoría | Hallazgo | Fix |
|---|---|---|---|
| AP-W1 | a11y | `aria-current="page"` en desktop nav **y** mobile overlay simultáneamente — duplicado para SR. | Mantener solo en uno (preferible desktop) o usar JS para sincronizar exclusivamente. |
| AP-W2 | a11y | Form de contacto: transiciones entre steps sin `aria-live` región — SR no anuncia el cambio. | Agregar `<div role="status" aria-live="polite" class="sr-only" id="step-announcer">` y poblarlo en cada cambio de step. |
| AP-W3 | perf | `motion.js` cargado sin `defer`. Custom cursor + reveals + scroll-stack ejecutan en DOMContentLoaded. | Agregar `defer` al `<script src=...motion.js>`. |
| AP-W4 | perf | 3 CSS files (~65K sin gzip) bloqueantes en `<head>`. | Medir gzip real con Lighthouse antes de optimizar. Si > 20K gzipped, considerar critical-path inline + lazy load del resto. |

### NIT
| ID | Categoría | Hallazgo | Fix |
|---|---|---|---|
| AP-N1 | a11y | Skip-to-content link ausente. | Opcional: `<a href="#main" class="skip-link">Saltar al contenido</a>` antes del nav, oculto fuera de pantalla, visible al focus. |
| AP-N2 | a11y | SVGs inline sin `width`/`height` (solo `viewBox`). | Agregar `width="24" height="24"` para evitar layout shift. |
| AP-N3 | perf | UI Kit.html tiene `Cache-Control: no-cache, no-store` — correcto para iteración pero no debería estar en páginas de prod. **Verificado: solo está en UI Kit, las 8 páginas no.** | OK, no acción. |
| AP-N4 | perf | Google Fonts: 2 familias × 3 weights cada una. Si LCP sufre, considerar preload del weight crítico (600). | Medir antes de optimizar. |

---

## Plan de aplicación propuesto

### Tanda 1 · Bugs visibles + a11y crítico (bajo riesgo, alto valor)
- UX-C1, UX-W1: link CTA portafolio + link mobile rota.
- AP-C1, AP-C2: keyboard escape en overlay + fieldset en intent.
- CP-W2, CP-W3, CP-W4: alineación copy "3 semanas", nombre Mexicanna, section markers.
- AP-W3: `defer` en motion.js.

### Tanda 2 · Form + meta (decisiones de Eduardo)
- AR-C2: backend del form (Formspree vs alternativa).
- AR-C3: bloque OG meta tags (necesito 1 OG image de Eduardo o genero placeholder editorial).
- UX-C2: estados de error en form.

### Tanda 3 · Animaciones (#6 del usuario)
- Hamburger → overlay con clip-path circular.
- Page transitions con SPA nav existente.
- Indicador phosphor animado en nav-main al cambiar página.
- Micro-feedback en `.btn-accent` al click.

### Tanda 4 · Arquitectura mayor (decisión)
- AR-C1: build-step para include partials. Cambia el flujo de trabajo. Puede esperar.

### Tanda 5 · NIT cosméticos
- Solo si sobra tiempo o si hay decisión específica.

---

## Verificación post-aplicación

Para cada tanda:
1. Smoke test 3 viewports (1440 / 768 / 375) en las páginas tocadas.
2. Consola limpia (cero errors/warns).
3. Lighthouse run en home + contacto post-tanda 1 y 2.
4. Bump `?v=2.6.3` → `?v=2.7.0` cuando se aplique tanda 1+2 + commit.

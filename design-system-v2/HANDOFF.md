# VAULT · iBisne Design System — Handoff doc

> **VAULT (v3 · Apple-like) es el sistema de diseño OFICIAL de iBisne.**
> Vive en `/design-system-v2/`. El "v2" del path es histórico; el sistema interno está en **v13.2** alineado con la versión del sitio.

Si abres un chat nuevo para iterar este sistema, lee este archivo completo antes de tocar código. **No infieras nada del v2 dark editorial original** — ese fue reemplazado por v13 Apple-like en 2026-05.

**Versión actual: v13.2** (alineada con sitio · ver `?v=3.2.0` en `<link>` y `<script>` del UI Kit).

---

## 1. Contexto

- **Empresa**: iBisne — holding LATAM con vocación operativa (no fondo VC tradicional). Capital + ejecución.
- **Sitio actual (v12)**: multipágina con categorías web/apps/shopify/software/clientes/cotizador/contacto. La página `webs.html` es el primer slice production-ready; el resto se construye sobre el mismo VAULT.
- **Cotizador (`quiz.html`)** vive aislado en `assets/quiz/*` y consume tokens VAULT pero tiene una capa propia mínima. NO se toca al iterar el design system.
- **Usuario**: Eduardo Carriola, CEO. Español mexicano directo. Cuando dice "se ve feo" o "no funciona" tiene razón el 99% del tiempo — diagnosticar primero cache/specificity, después percepción.

---

## 2. Filosofía v13.2

**Apple-like, light-first, casi monocromático.** El sitio debe sentirse "producto SaaS premium", no "terminal cyberpunk" (que era v2) ni "panel admin" (que era v1).

### Reglas duras (no negociables)

1. **Light por default.** `[data-theme="dark"]` existe como override opcional pero la experiencia canónica del producto es light Apple (`#FFFFFF` fondo, `#1D1D1F` texto). El UI Kit incluye toggle Light/Dark para previsualizar ambos.
2. **Paleta monocromática + 2 acentos limitados:**
   - Negro `#1D1D1F` + blanco `#FFFFFF` + grises Apple (`#F5F5F7`, `#E5E5EA`, `#86868B`) cubren el 90% del sistema.
   - **Azul Apple `#0071E3`** — exclusivo para focus visible, hover de links, CTA de plan recomendado, toggles iOS-style activos. Ningún uso decorativo.
   - **Rojo `#E5484D`** — exclusivo para errores, status indicators críticos.
   - **Cero verde.** Cero phosphor. Cero mint. Cualquier `--accent-mint` que sobreviva en código es alias-legacy a gris `#86868B` por compatibilidad.
3. **Hairlines 1px solamente.** Cero box-shadows decorativos. Cero glow. Cero scanlines. Cero gradientes (excepción justificada única: `.scroll-indicator .line` que comunica fade del tick).
4. **Tipografía Inter Tight sentence case.** Mono uppercase (JetBrains Mono) está RESERVADO a numéricos (`.metric .num .unit`, `.sc-num`, `.h-panel-num`, `.h-progress-num`, `.scroll-indicator`, `.editorial-card .ec-num`, `.tag`, `.placeholder`) + la utility `.t-mono` cuando se invoca explícitamente. El resto del sistema usa Inter Tight con tracking apretado `-0.005em`.
5. **Sin emojis** en UI a menos que Eduardo lo pida explícito.
6. **Sin iconos de librerías externas** (Lucide, Heroicons, FontAwesome, Material). Solo el set propio en `icons-reference.html` + `assets/quiz/icons.js`.
7. **4 botones nada más**: `.btn-primary`, `.btn-line`, `.btn-ghost`, `.btn-accent` + modificador `.btn-sm` + estados (`[disabled]`, `.is-loading`, con icon `.btn-icon`). El componente pricing extiende con `.btn-dark`, `.btn-blue`, `.btn-ghost-light` que son variantes de mismo skeleton (botones Apple negro/azul/línea light). No crear más sin defenderlo.
8. **Sin animaciones decorativas.** Si una animación no comunica un estado, dato o feedback, no va. El cursor custom blob, el grain shuffler, el scroll-stack editorial y el horizontal verticales fueron eliminados en v13.2 (motion.js de 717 → ~460 líneas).
9. **Mobile-first compactness.** Las cards no superan altura cómoda en móvil; las listas usan interlineado 1.35 (no editorial 1.6); el padding seccional baja a `var(--sp-6)` en `≤767px` desde `var(--sp-9)` desktop.
10. **Markers de sección**: `§ NN.NN` (numeración) y `—` (em dash). **NUNCA `//`** — eso fue del v1 Operator Grid.

### Política del color (v13.2)

| Categoría | Donde aparece | Token |
|---|---|---|
| **Primario texto/borde** | Headings, body, `.btn-primary` bg, card recomendada border, banner "Más popular" | `--text-primary` (`#1D1D1F`) |
| **Secundario texto** | Subheaders, párrafos secundarios, descripciones | `--text-secondary` (`#424245`) |
| **Muted texto** | Eyebrows, meta, hints, placeholders | `--text-muted` (`#86868B`) |
| **Bg subtle** | Cards tenues sobre fondo blanco (pricing cards, mantenimiento cards) | `--bg-subtle` (`#F5F5F7`) |
| **Bg paper** | Secciones que necesitan ligero contraste vs base | `--bg-paper` |
| **Hairline** | Líneas 1px en cards, separadores | `--bg-line` (border-color suave) |
| **Azul Apple** | Focus visible, link hover/active, CTA recomendado bg, toggle iOS on, tab activo underline, status indicators positivos | `--accent-blue` (`#0071E3`) |
| **Rojo Apple** | Error states, status indicators críticos | `--danger` (`#E5484D`) |

**Regla de oro**: si una decoración no es texto o estructura, primero ver si se puede expresar con espacio blanco + jerarquía. El color es la última herramienta, no la primera.

---

## 3. Sistema de color v13.2 (extracto de tokens.css)

```css
/* Light · base */
--bg:             #FFFFFF;
--bg-subtle:      #F5F5F7;        /* gris Apple sutil · cards */
--bg-paper:       #FAFAFA;
--bg-deep:        #1D1D1F;        /* inverso · usado en .bg-deep secciones */
--bg-line:        rgba(0,0,0,0.08);
--bg-line-strong: rgba(0,0,0,0.18);

--text-primary:   #1D1D1F;        /* negro Apple, no #000 */
--text-secondary: #424245;
--text-muted:     #86868B;

--accent:         #1D1D1F;        /* el "acento" es el negro · monocromático */
--accent-blue:    #0071E3;        /* exclusivo: focus, links, CTA recomendado, toggle on */
--accent-blue-hover: #0062C4;
--accent-mint:    #86868B;        /* LEGACY alias a gris para no romper código viejo */

--danger:         #E5484D;        /* errores, status críticos */

/* Dark override · activo con [data-theme="dark"] */
[data-theme="dark"] {
  --bg:           #000000;
  --bg-subtle:    #1C1C1E;
  --text-primary: #F5F5F7;
  --accent-blue:  #2997FF;        /* azul Apple dark */
  ...
}
```

---

## 4. Tipografía v13.2

| Token | Familia | Uso |
|---|---|---|
| `--font-display` | Inter Tight 400/500/600 | **Casi todo el sistema** — headings, body, botones, eyebrows, footer headings, tab triggers, modal eyebrows, pricing card names. Sentence case con `letter-spacing: -0.005em` por default. |
| `--font-body` | Inter Tight | Alias para texto corrido |
| `--font-mono` | JetBrains Mono 400/500 | **Reservado a numéricos y técnicos**: unidades de métricas, numeración seccional (`.sc-num`, `.h-panel-num`, `.h-progress-num`, `.sl-num`, `.ec-num`), `.scroll-indicator`, `.tag` general, `.placeholder` utility, y la clase explícita `.t-mono`. NADA más. |

### Escala (clamps mobile→desktop)
- `--fs-hero`: `clamp(40px, 6.5vw, 76px)` (era 220px en v2 · radicalmente reducido)
- `--fs-h2`: `clamp(28px, 4vw, 48px)`
- `--fs-h3`: `clamp(22px, 2.6vw, 32px)`
- `--fs-card-title`: `clamp(17px, 1.4vw, 19px)`
- `--fs-body`: `clamp(15px, 1.05vw, 17px)`
- `--fs-base`: 15px (botones, inputs, copy default)
- `--fs-small`: 13px
- `--fs-micro`: 11px

### Regla mono uppercase
**Sólo conservar mono uppercase en los siguientes selectores** (lista exhaustiva post-v13.2):

`components.css`:
- `.t-mono` (utility class explícita)

`components-extra.css`:
- `.scroll-indicator`
- `.metric .num .unit`
- `.editorial-card .ec-num`
- `.scroll-layer .sl-num`
- `.placeholder` (helper para wireframes)
- `.h-panel-num`
- `.h-progress-num`
- `.tag` (chips genéricos)
- `.stat-callout .sc-num .unit`

Si necesitas un nuevo "marker técnico" en mono uppercase, defender el caso. Por default, **Inter Tight sentence case** gana.

---

## 5. Estructura de archivos

```
/design-system-v2/
├─ tokens.css            ← color, type, spacing, motion, z-index. v13.1 light Apple por default · dark via [data-theme="dark"]
├─ components.css        ← reset, grid, section, type, links, BUTTONS, inputs, navbar, footer
├─ components-extra.css  ← hero, split, metrics, editorial-card, case-tile, marquee, faq,
│                          cta-final, NAV OVERLAY mobile, tag, blockquote, stat-callout,
│                          tier-table, note, cta-block, toggle-switch, search-field, modal, tabs
├─ motion.css            ← reveals, page-transition overlay, reduced-motion. v13.2 podado (sin cursor, sin grain)
├─ motion.js             ← reveals, marquee, FAQ, navbar, mega-menu, nav-mobile, page-transitions, modal, tabs.
│                          v13.2 podado · sin initCursor, initGrain, initScrollStack, initHorizontal (~460 lineas)
├─ icons-reference.html  ← 16 iconos minimal stroke 1px · light Apple v13.2
├─ UI Kit.html           ← style guide navegable con toggle Light/Dark · v13.2
├─ README.md             ← doc breve del sistema
└─ HANDOFF.md            ← este archivo
```

### Capa del cotizador (no parte del DS)
`assets/quiz/styles.css` — capa mínima propia del cotizador, consume tokens VAULT + define `--hud-h`, clamps de título, layout del wizard. NUNCA tocar al iterar el DS.

### Capa de las páginas del sitio
`assets/sitio/*.css` + `assets/sitio/*.js` — componentes específicos del producto (ej. pricing-table). Consumen tokens VAULT.

---

## 6. Componentes ya construidos en VAULT v13.2

### Foundations
- Color light Apple + dark override
- Type scale (8 niveles + mono reservado)
- Spacing (escala 8px)
- Motion (3 easings + 5 durations)
- Z-index escalonado
- Grid 12-col gutter 24px max-w 1320px (era 1440 en v2)

### Buttons (4 + 3 variantes pricing)
- `.btn-primary` (negro Apple sólido, hover opacity)
- `.btn-line` (border + texto secondary)
- `.btn-ghost` (sin border)
- `.btn-accent` (= `.btn-primary` ahora, monocromático)
- `.btn-dark`, `.btn-blue`, `.btn-ghost-light` (variantes específicas del pricing-table)

### Inputs
- `.field` con label flotante. **Focus visible en azul Apple** (no gris).
- `.search-field` (v12 F1) con icono inline.
- `.toggle-switch` iOS-style. **On en azul Apple** (`#0071E3`).

### Layout
- `.section` padding adaptativo (160/80 era v2, ahora `--sp-9`/`--sp-6` con clamps · más compacto)
- `.container` max-width 1320
- `.nav` (v2 multi-row) — pendiente refactor en v12-Fase6 a header v3 unificado
- `.footer-mark` masivo + cols

### Patterns activos
- `.hero` Apple-compacto (max-width 720 hero-inner)
- `.faq` accordion nativo `<details>/<summary>` sin chevron, línea que rota 90°
- `.cta-final` con tipografía gigante + actions
- `.cta-block` variante compacta inline
- `.tier-table` comparativo + scroll horizontal mobile (en pricing-table.css hay variante `cmp` más densa)
- `.blockquote` editorial colapsable a stack mobile
- `.tab-trigger` con underline azul Apple en active
- `.modal-dialog` (v12 F1)

### Pricing (assets/sitio/pricing-table.{css,js})
- 3 `.pricing-card` con bg `--bg-subtle`, recomendada con border negro + banner "Más popular"
- `.pt-seg` segmented control (Pago mes a mes · Pago en exhibición -20%)
- `.pt-powerups-master-toggle` switch iOS-style todo-o-nada (+43% activa los 5 Powerups simultáneamente: animaciones, dark/light, multi-idioma, multi-moneda, PWA)
- `.pt-powerups-pills` info-only que se iluminan cuando master está on
- `.pt-compare` botón "Comparar todos los planes" + tabla `.cmp` densa colapsable

---

## 7. Lo que se eliminó en v13 (no resucitar)

| Eliminado | Por qué |
|---|---|
| Verde phosphor `#3DFF7F` + mint `#AEFFC8` + glow | Eduardo decidió monocromático Apple-like; los 3 tiers de verde eran ruido cyberpunk |
| Cursor custom blob (`initCursor` 62L JS + 78L CSS) | Decorativo, no comunica estado · performance penalty global rAF |
| Grain SVG turbulence + reshuffle 200ms (`initGrain` 15L) | Decorativo · solo agrega ruido visual |
| Scroll-stack editorial (`initScrollStack` 42L) | Storytelling editorial, no flujo SaaS |
| Horizontal verticales (`initHorizontal` 58L) | Era para 4 verticales del holding v1; el sitio v12 no las usa |
| Hairline drift + type breathe keyframes | Decorativos perpetuos · ruido sin valor |
| Mono uppercase en `.eyebrow`, `.section-num`, `.hero-eyebrow`, `.footer-col h4`, `.case-tile .ct-tag/.ct-meta`, `.split-meta`, `.scroll-layer .sl-meta`, `.h-panel-meta`, `.blockquote .bq-attr`, `.stat-callout .sc-eyebrow`, `.tier-table thead/tbody th`, `.note-tag`, `.cb-eyebrow`, `.modal-dialog-eyebrow`, `.tab-trigger`, `.menu-eyebrow`, `.menu-legal a`, `.menu-foot-meta`, `.btn`, `.link-arrow`, `.field label`, `.nav-topbar`, `.nav-links`, `.nav-mega-eyebrow`, `.metric .label` | Hacía sentir "developer tool" en lugar de "producto SaaS". Refactoreados a Inter Tight sentence case con tracking apretado. |

---

## 8. Cómo iterar

### Servir local
```bash
cd /Users/macbookair/Documents/Proyectos/ibisne-web
python3 -m http.server 8787
```
Abrir: `http://localhost:8787/design-system-v2/UI%20Kit.html`

### Ver mobile real
DevTools → device toolbar → iPhone 14 Pro (393×852) / Pixel 7 (412×915).

### Cuando hay queja sobre un componente
1. **Cache** (Ctrl+Shift+R o incógnito). El SW del sitio es **network-first** desde v11.3 y notifica clientes en activate, pero el UI Kit usa headers no-cache + `?v=X.Y.Z`.
2. **Specificity**: DevTools → Computed → ver qué selector gana. Subir specificity o aplicar `!important` puntual.
3. **Bump `?v=`** en UI Kit links cuando cambies tokens/components.

### Antes de tocar
- Leer este HANDOFF.md
- Leer `README.md` (resumen del sistema)
- Leer `/CLAUDE.md` raíz (contexto global del repo, reglas duras del proyecto)
- **NUNCA** mezclar tokens muertos (`--cyan`, `--violet` del v1; `--accent-mint` queda solo como alias-legacy)

### Workflow git/deploy
- Branch personal `claude/<sufijo>` → PR a `main` → merge → Vercel auto-deploya a `https://www.ibisne.com`
- **NUNCA** commitear sin autorización explícita ("dale", "adelante", "commit")
- **NUNCA** `git add -A` o `git add .`
- **NUNCA** push directo a `main`
- **NUNCA** `--force` ni `--amend` salvo petición explícita
- Co-Authored-By trailer obligatorio: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`

---

## 9. Lo que NO hacer (errores cometidos antes)

- **No reintroducir verde phosphor/mint** salvo que Eduardo lo pida explícitamente. Si necesitas un color para destacar, usar `--accent-blue` o `--text-primary`.
- **No usar `text-transform: uppercase` + `var(--font-mono)`** fuera de la lista whitelistada en §4. Si lo necesitas, defender el caso.
- **No agregar emojis** en UI ni en docs.
- **No agregar gradientes, glow, scale, jiggle, magnet, parallax, blur decorativo, scanlines.**
- **No introducir frameworks JS** (React/Vue/Svelte). Vanilla. Punto.
- **No usar iconos de librerías externas.** Solo el set propio.
- **No introducir nuevos botones** sin defenderlo. Hay 4 + 3 variantes del pricing.
- **No tocar `quiz.html` ni `assets/quiz/*`** al iterar el DS. El cotizador vive aislado.
- **No tocar `tokens.css`, `components.css`, `components-extra.css`, `motion.css`, `motion.js`** sin justificación. Son el contrato. Si faltan tokens o componentes, pedir a Eduardo antes de inventar.

---

## 10. Cierre

Si lees esto en un chat nuevo, los siguientes mensajes deberían:

1. Confirmar que entendiste que **VAULT v13.2 Apple-like es el sistema oficial**.
2. Mencionar la versión actual (`v13.2` · `?v=3.2.0` en assets del kit).
3. Preguntar qué quiere iterar antes de tocar código.
4. **No pedir contexto** que ya está aquí. No re-explorar el repo si la pregunta cae bajo "lo que ya está construido".

Si Eduardo dice "se ve raro" sin más contexto, pedir screenshot y elemento específico — los problemas casi siempre son: cache pegado, specificity de CSS, o un padding heredándose.

— Generado al cierre de v13.2: completar el DS al 100% en estética Apple-like (light + cero verde + mono reservado a numéricos + motion podado).

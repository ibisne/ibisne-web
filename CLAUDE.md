# CLAUDE.md — iBisne web

Instrucciones permanentes para cualquier sesión de Claude Code en este repo.

## Contexto del proyecto

iBisne es un **holding LATAM de 4 verticales operativas** (no un fondo VC tradicional). El sitio web debe transmitir: capital + ejecución, mentalidad operadora, autoridad.

## El design system OFICIAL es **VAULT (v2)** — `/design-system-v2/`

> **VAULT es el sistema oficial.** Vive en `/design-system-v2/`.
> Antes de tocar cualquier archivo de UI: **leer `/design-system-v2/HANDOFF.md` completo + `/design-system-v2/README.md`** en cada sesión nueva.
>
> Estética: editorial dark, hairlines 1px, tipografía masiva neo-grotesk (Inter Tight), 3 tiers de verde (phosphor `#3DFF7F` + mint `#AEFFC8` + soft).
>
> Versión actual: ver `?v=X.Y.Z` en `<link>` y `<script>` de `design-system-v2/UI Kit.html`.

### El sistema "Operator Grid" (v1) es legacy

Vive en `/design-system/` y `/pages/index.html`. Estaba pensado con estética cyberpunk-tech (cyan/violet, scanlines, glow). **No tocar** salvo que Eduardo lo pida explícito. Cualquier nuevo trabajo de UI consume VAULT.

Si encuentras código v1 mezclado en archivos nuevos (markers `//`, tokens `--cyan`/`--violet`, fuentes Space Grotesk, glow, scanlines) → es bug, limpiar.

## Reglas duras (VAULT v2)

1. **No tocar `/design-system-v2/tokens.css`, `components.css`, `components-extra.css`, `motion.css`, `motion.js` sin justificación.** Son el contrato. Si faltan tokens o componentes, pídelos a Eduardo antes de inventar.
2. **No hardcodear colores, fonts, sizes, spacings.** Todo sale de `tokens.css` v2 (variables `--bg-*` / `--text-*` / `--accent` / `--accent-mint` / `--accent-glow` / `--sp-*` / `--fs-*` / `--font-*`).
3. **No instalar librerías de UI** (shadcn, Material, Chakra, Tailwind UI, Bootstrap, etc.). CSS vanilla intencionalmente.
4. **No usar emojis** en UI a menos que Eduardo lo pida explícito.
5. **No usar iconos de librerías externas** (Lucide, Heroicons, FontAwesome). Solo el set propio en `/design-system-v2/icons-reference.html` (16 iconos stroke 1px `currentColor`).
6. **Hay 4 botones**: `.btn-primary`, `.btn-line`, `.btn-ghost`, `.btn-accent` + modificador `.btn-sm` + estados (`[disabled]`, `.is-loading`, con icon `.btn-icon`). Cubren todo. No crear variantes nuevas sin defenderlo.
7. **No crear gradientes nuevos.** El único permitido es el linear-gradient interno de `.scroll-indicator .line` (comunica fade del tick, no decoración). Cero gradientes en el resto.
8. **Hairlines 1px** solamente. Cero box-shadows decorativos. Cero glow. Cero scanlines. Cero efectos cyberpunk.
9. **No animaciones decorativas.** Si una animación no comunica un estado, dato o feedback, no va.
10. **Dark only** hasta que Eduardo decida light.
11. **Mobile (≤768px)** = `.nav-mobile-bar` (logo + theme toggle + hamburger/×) permanece visible encima de un overlay full-screen sin scroll. El overlay tiene: sitemap (6 links), connect (4 social full-width), CTA accent, legal + idioma + ©. Nunca drawer lateral.
12. **Markers de sección**: `§ NN.NN` (numeración) y `—` (em dash). **NUNCA `//`** — eso es del v1 Operator Grid.
13. **Verde phosphor escaso, mint informacional.** Ver `/design-system-v2/HANDOFF.md` sección "Política del verde".

## Sistema antiguo (Operator Grid v1 — `/design-system/`)

Es **legacy**, no deprecado. Vive intacto en `/design-system/` y `/pages/index.html`. **No tocar** salvo que Eduardo lo pida explícito.

- Si construyes una página nueva → consume **VAULT (v2)**, no v1.
- Si ves código mezclado v1+v2 en un archivo nuevo → es bug, limpiar.

Indicadores de código v1 que NO debe vivir en v2:
- Tokens `--cyan`, `--violet`, `--grad-brand`, `--grad-fade`
- Fuentes Space Grotesk, Chakra Petch
- Markers `//` en eyebrows
- Clases con scanlines, glow, neon
- 7 botones (en v1) — en v2 son 4

## Estructura esperada del repo

```
/
├─ design-system/          ← intocable salvo extender tokens
│   ├─ UI Kit.html
│   ├─ tokens.css
│   ├─ components.css
│   ├─ components-extra.css
│   ├─ motion.css
│   ├─ motion.js
│   ├─ icons-reference.html
│   └─ README.md
├─ pages/
│   ├─ index.html          ← Home
│   ├─ verticales/
│   │   ├─ commerce-growth.html
│   │   ├─ smart-capital.html
│   │   ├─ emergente.html
│   │   └─ venture-lab.html
│   ├─ portafolio.html
│   ├─ nosotros.html
│   ├─ blog.html
│   └─ contacto.html
└─ assets/
    ├─ img/                ← fotografía real / AI art dirigido
    └─ logos/              ← logos de portfolio companies
```

## Estructura del Home (orden recomendado)

1. **Navbar sticky** (desktop) / Bottom nav (mobile) — usar `.navbar` y `.bottom-nav`
2. **Hero** — h1 con `data-scramble`, eyebrow `§ 00.HOME`, CTA primary + ghost, stats inline (4 números clave)
3. **Verticales** — grid de 4 `.vertical-card` con tags de color
4. **Cómo operamos** — 6 `.feature` (capital operativo, rev share, building, thesis LATAM, 0% fee, marketplace)
5. **Stats / track record** — 4 `.stat` cards
6. **Testimonios** — 3 `.testimonial` (founder, LP, founder de Lab)
7. **CTA block** — `.cta-block` con HUD frame
8. **Footer** — `.footer` con § numeración

Cada sección con `.section-head` + `.eyebrow` + `.section-num`.

## Cómo iterar

- **Cambios de copy:** libres, no piden aprobación.
- **Cambios de layout dentro del sistema:** libres si usan componentes existentes.
- **Cambios al design system (tokens, componentes nuevos):** requieren confirmación del usuario antes de tocar `/design-system/`.
- **Imágenes:** siempre placeholders de color sólido + label hasta que el usuario provea assets reales. No generar imágenes random.

## Voice & copy

- Directo, operativo. "Capital operativo para LATAM" > "Empoderando emprendedores".
- Spanglish controlado: rev share, equity, pipeline, ticket, runway, due diligence — sin traducir.
- Datos sobre adjetivos: "$42M desplegado en 47 empresas" > "Mucha experiencia invirtiendo".
- Negaciones con confianza: "Sin management fee. Sin equity dilutivo."
- Frases cortas. Punto seco. Siguiente.

## Performance

- Imágenes en WebP/AVIF con fallback.
- Fonts con `display=swap` (ya configurado).
- `motion.js` es defer, no bloquea.
- No agregar JS frameworks (React/Vue/Svelte) a menos que el usuario lo pida explícitamente. HTML + CSS + vanilla JS es suficiente y consistente con el sistema.

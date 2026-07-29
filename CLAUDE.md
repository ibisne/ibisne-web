# CLAUDE.md — iBisne web

Instrucciones permanentes para cualquier sesión de Claude Code en este repo.

> **Reescrito en v21 (2026-07-26).** La versión anterior describía un funnel de cotizador
> (`quiz.html` + `checkout.html` + `data/precios-v13.js` + design system VAULT en
> `design-system-v2/`). **Nada de eso existe en el repo.** Si lees una referencia a un
> cotizador, a "Powerups", a "Modo Pro" o a VAULT v2, es historia muerta que vive solo en
> git history. Este archivo describe el sitio real.

## Qué es iBisne

Venture builder y tech studio en Zapopan, Jalisco. Construye productos de software (SaaS,
CRM, ERP, apps, IA, blockchain) para fundadores y empresas, tiene productos propios que
financió (iBroker, iFutbol, iPool) y, en los proyectos con potencial de liderar, entra con
capital como socio ("Smart Capital"). Vocación operativa, no fondo VC tradicional.

## Arquitectura del sitio

**Sitio estático generado por `build.py`** (Python, f-strings, sin templating engine, sin
npm, sin frameworks). Deploy automático en Vercel desde `main`. URL: https://www.ibisne.com

```
build.py              ← ÚNICA fuente de verdad del sitio. 59 páginas salen de aquí.
_serve.py             ← server local: python _serve.py 8787
assets/site/dossier.css ← ÚNICO CSS del sitio (System D · Dossier oscuro)
content/insights/*.html ← cuerpos de artículo (fragmentos, no páginas)
content/legal/*.html  ← textos legales de Eduardo (fragmentos)
../ibisne-cv/cv-data.json ← fuente de los 31 proyectos del portafolio (fuera del repo)
MESSAGING.md          ← LEER SIEMPRE antes de tocar copy. Es la ley de tono.
SITEMAP.md            ← estructura de páginas y su propósito
legal/nda-mutuo.md    ← borrador de NDA (documento de trabajo, no se publica)
```

**Flujo:** editar `build.py` → `python build.py` → se regeneran los HTML → commit de
`build.py` **y** de los HTML generados (Vercel sirve los archivos commiteados, no compila).

### Páginas

`/` · `/servicios/` (Capacidades, 3 dominios) · `/servicios/{producto,comercio,frontera}/` ·
`/como-trabajamos/` · `/inversion/` · `/portafolio/` (+31 fichas) · `/por-que-ibisne/` ·
`/estudio/` · `/insights/` (+10 artículos) · `/contacto/` · `/legal/{5}` · `404.html`

### Funciones clave de `build.py`

- `base(title, desc, body, active, canonical)` — shell HTML de **todas** las páginas. Aquí
  viven `<head>`, Google Analytics y el `GTAG`.
- `header(active)` + `NAV` — nav desktop y menú móvil.
- `FOOTER`, `LOADER`, `SPRITE`, `SCRIPTS`, `GTAG` — constantes de layout.
- Helpers reutilizables: `ic(name)` (iconos del sprite), `crumb()`, `contacto_band()`,
  `estandar_grid()`, `pf_card()`, `write()`, `strip_dashes()`, `sitemap()`.
- Datos: `DOMINIOS` (3), `PROTOCOLO` (5 fases), `COMPROMISOS` (4), `ESTANDAR`, `VENTAJAS`,
  `INSIGHTS`, `DOMAIN_PROJECTS`.

## ⛔ Regla de negocio #1 · la Homepage es un Tech Studio

**La Homepage no menciona "invertimos", "socios", "ponemos capital", "financiamos" ni
"Smart Capital" en ningún párrafo narrativo.** Es una regla de negocio de Eduardo, no una
preferencia de estilo: hablar de inversión en la portada espanta a los clientes corporativos
(solo quieren pagar desarrollo) y genera paranoia en los emprendedores (creen que iBisne
quiere su idea). Se pierden ambos públicos.

Las divisiones aparecen en el home solo como **pills sin explicación** (`Tech Studio`,
`Smart Capital`, `Venture Builder`) y como links de nav/footer. `/inversion/`,
`/como-trabajamos/`, `/estudio/`, `/por-que-ibisne/` y `/portafolio/` sí pueden hablar
de inversión.

Ojo con los efectos colaterales: `TOPMSG` y `FOOTER` son globales y salen en la home; los
insights destacados del home filtran la categoría "Inversión"; y "socio" en cualquier
acepción también rompe la regla. Detalle completo en `MESSAGING.md`.

**Antes de dar por terminado cualquier cambio en el home, corre esta prueba:**

```bash
grep -oiE "invertimos|socios|ponemos capital|financiamos|financiado|skin in the game" index.html
```

Debe devolver cero. `Smart Capital` solo puede aparecer una vez, como texto del pill.

**Y esta otra sobre TODO el sitio** (v30), porque "socio" y el precio viejo se filtraron
antes hasta los artículos:

```bash
grep -rniE "socios?\b|socied|25[.,]?000|a tu nombre desde|primer commit" --include='*.html' . \
  | grep -viE "sociedad mercantil|asociaci"
```

También debe devolver cero. Se excluyen **"sociedad mercantil"** y **"asociación"**: son
términos jurídicos correctos dentro de los legales (la forma societaria de la empresa), no
el uso comercial que la regla prohíbe. La alarma vigila el copy de venta, no el derecho.

## Reglas duras

1. **Nunca editar los `.html` generados a mano.** Se sobreescriben en el siguiente build.
   Todo cambio de contenido va en `build.py`.
2. **`strip_dashes()` elimina em/en dashes** de todo el HTML final (`—` → `,`). Usa `·`
   (interpunto) como separador visual, que es lo que hace el resto del sitio.
3. **Leer `MESSAGING.md` antes de escribir copy.** Regla de oro: hablar siempre en
   positivo, nunca de lo que no somos. Prohibido "agencia" y "paquete", incluso para
   negarlos. Tratamiento: **tuteo**.
4. **No enumerar los 8 tipos de sistema** (sitios, ecommerce, apps, CRM, ERP, SaaS, IA,
   Web3) como lista. Eso reconstruye el catálogo de agencia que se mató en v21. Hablar de
   los **3 dominios**.
5. **CSS solo en `assets/site/dossier.css`**, sobre los tokens de `:root`. Cero colores
   hardcodeados. Verificar siempre el modo claro (`data-mode="light"`).
   Verificarlo **con recarga limpia**, no cambiando `data-mode` en vivo: las transiciones
   de `border-color` devuelven valores a medio interpolar y dan lecturas falsas.
6. **Rejillas: nunca escribir `grid-template-columns` a mano.** Usar `gcls(n, dense)`
   (build.py), que deriva las columnas del conteo para que no queden huecos. Regla: elegir
   `c` tal que `n % c == 0`; si no existe, 3 columnas con el primer item a fila completa.
   Los grids densos (ficha técnica) admiten 4 columnas; las cards con párrafo no, porque
   la medida de línea cae a ~32 caracteres: esas van 2×2 en `.g-narrow`.
   ⚠️ **`.g` controla SOLO las columnas, nunca el `gap`.** El gap es identidad de cada
   componente: `.std-grid` dibuja divisores hairline con `gap:1px` + fondo `--hair`, y si
   `.g` le impone 1.25rem ese fondo se ve como bandas grises gruesas. Pasó en v24 y fue la
   regresión más visible del sitio. Cada clase declara el suyo con `.clase.g { --g-gap }`.
7. **Fondos de hero**: `bg_for(clave)` reparte las 5 imágenes de `assets/bg/*.webp` de
   forma estable por página. Son **oscuras**: en modo claro su opacidad baja a .14 o
   manchan el fondo. Si se agregan más, optimizar a WebP ≤200 KB (los originales de
   `Fondo/` pesan 1-3 MB cada uno).
8. **Sin librerías de UI, sin iconos de terceros, sin emojis.** Los iconos salen del sprite
   SVG inline en `build.py` (`SPRITE`), vía `ic("nombre")`.
9. **Sistema móvil (v26).** El home medía 14.861px (18 pantallas) porque era un diseño de
   escritorio colapsado a una columna. Reglas:
   - **Colecciones visuales van en carrusel** (`.rail`): portafolios, insights y proyectos
     relacionados. Base `scroll-snap` (soporte universal) + `::scroll-marker` tras
     `@supports`; sin soporte queda un scroll horizontal usable. Un bloque de 6 cards pasa
     de ~1.800px a ~260px.
   - **Las rejillas de texto NO van en carrusel** (estándar, ventajas, compromisos):
     esconder texto tras un gesto perjudica lectura y SEO.
   - **El hub `/portafolio/` tampoco**: tiene filtros y debe verse completo.
   - **Cards horizontales en móvil**: icono a la izquierda, texto a la derecha. Ahorra
     ~55px por card.
   - **Barra de acción inferior** (`.actionbar`): en móvil se ocultan el CTA del header y
     el dock social, así que sin ella no había ninguna vía de contacto en todo el scroll.
     Respeta `env(safe-area-inset-bottom)`.
   - **Targets táctiles ≥44px** siempre (Fitts: el dedo mide ~7mm).
   - **Al tocar el CSS, subir `?v=` en `build.py`**, o el navegador sirve el CSS viejo y
     parece que los cambios no aplicaron.
10. **Al borrar páginas**: `write()` nunca elimina archivos huérfanos. Hay que `git rm -r`
   las carpetas viejas **y** agregar los redirects 301 en `vercel.json` en el mismo commit.
   Nunca desplegar el borrado sin el redirect.
11. **Imágenes**: placeholders hasta que Eduardo entregue assets reales. No generar imágenes.
    Los covers de insights usan a propósito los fondos genéricos de `assets/bg/`: son
    placeholder hasta que su diseñador entregue las definitivas.

## El Protocolo iBisne

`/como-trabajamos/` es la pieza de conversión más importante del sitio. Cuatro fases
(Sesión cero · Lectura · Sprint de Validación · Dos puertas) más cuatro reglas de operación.
Existe para responder los dos miedos reales del fundador: que le roben la idea y que le
inflen el precio para empujarlos a un esquema de capital.

**Sprint de Validación: se cotiza a la medida**, cobrado al inicio y acreditable íntegro
contra el desarrollo. No hay precio fijo publicado: un SaaS multi-tenant y una app no
cuestan lo mismo. Aplica solo a productos de software; sitios y tiendas se cotizan directo.

### Reglas de negocio de v30 (las tres son duras)

1. **La titularidad del código NO se transfiere antes del contrato.** Durante el Sprint se
   construye el núcleo, se muestra en sesión y se entrega la guía, pero el código y la
   plataforma pasan a nombre del cliente **al cerrar el desarrollo**. El sitio llegó a
   publicar lo contrario ("a tu nombre desde el primer commit") y era falso.
   ⚠️ **Cero verbos de retención** al redactarlo ("conservamos", "hasta que", "no se
   entrega"): se lee como demo prestada. El enunciado avanza hacia el traspaso y siempre
   va junto a lo que el cliente **sí** se lleva ese día.
2. **Prohibido "socio" y "sociedad" en todo el sitio**, artículos incluidos. Términos
   válidos: **Smart Capital · Venture Capital · Incubadora**. La propuesta de capital se
   presenta **después** del análisis, nunca como promesa de entrada.
3. **Sin precio fijo del Sprint.** Se cotiza a la medida según el sistema.

### La titularidad depende del modelo de entrada (v31)

Dato de negocio que no estaba escrito en ningún lado y que rige tanto el copy como los
Términos y Condiciones:

| Modelo | Qué pasa con la IP al liquidar |
|---|---|
| **Venta** (proyecto de cliente) | **Todo pasa al cliente**: código, plataforma y piezas. |
| **Venture Capital / Incubadora** | **iBisne conserva total o parcialmente** los activos que desarrolló, en calidad de inversor del proyecto. |

Por eso el copy del Protocolo ("el código y la plataforma pasan a tu nombre al cerrar el
desarrollo") es correcto: quien recorre el Protocolo y elige la puerta de Desarrollo está
en modelo Venta. Los §8 y §19 de los T&C reflejan ambos casos.

### Legales (v31)

Los textos son de Eduardo, portados de sus `.docx`. Viven en **`content/legal/*.html`** y
se inyectan con `legal_body(slug)`, igual que los insights: son ~38k caracteres y como
constantes de Python harían inmanejable `build.py`.

Páginas: `terminos` · `privacidad` · `cancelacion` · `cookies` · `aviso-legal`.
Al portarlos se actualizó el marco comercial (decían "tiendas virtuales" y "ecommerce y
marketing digital", de una etapa anterior del negocio) y se sustituyó "socios" societario
por "accionistas" / "aliados comerciales", para que el grep de control de v30 siga siendo
fiable sin excepciones.

### Consentimiento y Analytics (v31)

**Google Analytics NO carga sin consentimiento.** `GTAG` ya no inyecta el script: define
`window.ibLoadGA()` y solo lo ejecuta si `localStorage.ib_consent === 'all'`. El banner
`CONSENT` ofrece "Aceptar" y "Solo esenciales". Si tocas el banner, verifica que sigue
condicionando la carga: sin eso, el banner es decoración y las analíticas corren sin
permiso.

### Dos reglas que NO se pueden romper (v22)

Ambas nacieron de un error real que Eduardo corrigió. Si una sesión futura las reintroduce,
es una regresión:

1. **Nunca usar el NDA (ni contratos, firmas o abogados) como argumento de venta.** Genera
   fricción y posiciona a iBisne como proveedor defensivo en lugar de autoridad técnica. El
   acuerdo existe en `legal/nda-mutuo.md` pero se maneja en el **onboarding**, no en el sitio.
2. **Nunca prometer propiedad sobre "ideas".** El art. 14 de la Ley Federal del Derecho de
   Autor excluye expresamente "las ideas en sí mismas" de la protección. Lo protegible es el
   activo tangible: código, software y plataforma, que es lo que sí se afirma. Usar "idea"
   como punto de partida narrativo sí es válido (el H1 del home se queda); el error es
   prometer **propiedad** sobre ella.

La confianza se transmite por trayectoria, rigor operativo y propiedad del activo tangible.
Ver `MESSAGING.md` para las 4 reglas publicables.

⚠️ **No prometer no competencia por vertical** hasta que Eduardo lo confirme con abogado:
bloquearía a iBroker/iFutbol/iPool.

## Analytics

Google Analytics (gtag.js, `G-XEW1TZEMNL`) se instaló el 2026-07-25 en la constante `GTAG`
de `build.py`. **Desde v31 solo carga con consentimiento** (ver más abajo). `www.googletagmanager.com` está
permitido en el `script-src` de la CSP de `vercel.json`. **No hay datos históricos previos
a esa fecha**, así que las decisiones de SEO no pueden apoyarse en tráfico medido todavía.

## Voice & copy

- Referencia de tono: **Index Ventures**. Editorial, sereno, seguro, humano, premium.
- Directo y operativo. "Capital operativo para LATAM" > "Empoderando emprendedores".
- Spanglish controlado: rev share, equity, pipeline, ticket, runway, due diligence.
- Datos sobre adjetivos. Frases cortas. Punto seco. Siguiente.
- Negaciones con confianza, pero **sin nombrar lo que se niega** (regla de `MESSAGING.md`).

## Workflow git/deploy

- **Producción**: branch `main` · Vercel auto-deploya · https://www.ibisne.com
- **Trabajo**: commit + push directo a `main` (autorización permanente de Eduardo desde
  2026-07-25: "sube todo no me preguntes ya solo yo reviso"). Él revisa después del push.
- **Reglas duras**: NUNCA `git add -A`/`.` (usar `git add -u` o archivos específicos).
  NUNCA `--force` ni `--amend` salvo petición explícita.
- **Co-Authored-By obligatorio**: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- Estilo de commit: `tipo(scope): mensaje` · tipos: `feat`, `fix`, `docs`, `chore`, `copy`.

## Verificación antes de subir

```bash
python build.py && python _serve.py 8787
```

Revisar: home, `/como-trabajamos/`, los 3 dominios, consola sin errores, sin 404 en red,
responsive a 375px y modo claro. El `sitemap.xml` se regenera solo desde `main()`.

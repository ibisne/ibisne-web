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
build.py              ← ÚNICA fuente de verdad del sitio. 58 páginas salen de aquí.
_serve.py             ← server local: python _serve.py 8787
assets/site/dossier.css ← ÚNICO CSS del sitio (System D · Dossier oscuro)
content/insights/*.html ← cuerpos de artículo (fragmentos, no páginas)
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
`/estudio/` · `/insights/` (+10 artículos) · `/contacto/` · `/legal/{4}` · `404.html`

### Funciones clave de `build.py`

- `base(title, desc, body, active, canonical)` — shell HTML de **todas** las páginas. Aquí
  viven `<head>`, Google Analytics y el `GTAG`.
- `header(active)` + `NAV` — nav desktop y menú móvil.
- `FOOTER`, `LOADER`, `SPRITE`, `SCRIPTS`, `GTAG` — constantes de layout.
- Helpers reutilizables: `ic(name)` (iconos del sprite), `crumb()`, `contacto_band()`,
  `estandar_grid()`, `pf_card()`, `write()`, `strip_dashes()`, `sitemap()`.
- Datos: `DOMINIOS` (3), `PROTOCOLO` (5 fases), `COMPROMISOS` (4), `ESTANDAR`, `VENTAJAS`,
  `INSIGHTS`, `DOMAIN_PROJECTS`.

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
6. **Sin librerías de UI, sin iconos de terceros, sin emojis.** Los iconos salen del sprite
   SVG inline en `build.py` (`SPRITE`), vía `ic("nombre")`.
7. **Al borrar páginas**: `write()` nunca elimina archivos huérfanos. Hay que `git rm -r`
   las carpetas viejas **y** agregar los redirects 301 en `vercel.json` en el mismo commit.
   Nunca desplegar el borrado sin el redirect.
8. **Imágenes**: placeholders hasta que Eduardo entregue assets reales. No generar imágenes.

## El Protocolo iBisne

`/como-trabajamos/` es la pieza de conversión más importante del sitio. Existe para
responder los dos miedos reales del fundador (que le roben la idea, que le inflen el precio
para forzar una sociedad) con compromisos verificables, no con adjetivos.

**Sprint de Validación: $25,000 MXN**, cobrado al inicio, acreditable íntegro contra el
desarrollo. El precio se publica a propósito: es la señal anti-inflación. Aplica solo a
productos de software; sitios y tiendas se cotizan directo.

⚠️ **No prometer no competencia por vertical** hasta que Eduardo lo confirme con abogado:
bloquearía a iBroker/iFutbol/iPool. Los 4 compromisos publicables están en `MESSAGING.md`.

## Analytics

Google Analytics (gtag.js, `G-XEW1TZEMNL`) se instaló el 2026-07-25 en la constante `GTAG`
de `build.py`, inyectada por `base()` en las 58 páginas. `www.googletagmanager.com` está
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

# CLAUDE.md · iBisne web (sitio 2026)

Guía permanente para cualquier sesión de Claude Code en este repo.

> **Reescrito el 25-oct-2026.** El sitio anterior (`build.py`, `dossier.css`, 59 páginas
> generadas, promo de landing pages, cotizador, Protocolo, insights, portafolio con fichas)
> **ya no existe**. Si lees una referencia a eso, es historia que vive solo en git. Este
> archivo describe el sitio Astro nuevo.

## Qué es iBisne en el sitio

Tech studio en Zapopan, Jalisco. Mensaje principal (no cambiarlo sin orden de Eduardo):

- **"Diseñamos tecnología para marcas selectas."** (titular)
- **"Construimos hoy la tecnología que tu empresa necesitará mañana."** (subtítulo)

Concepto visual **04 "Arquitectos del futuro"**: cyberpunk mexicano, índigo noche con
magenta y cian, la B de iBisne hecha de partículas. Fuente de diseño: Figma
`54mYjircEIEBYJfnolMMyR`, hoja "MVPs · Home iBisne". Frames: **18:2** Home · **26:2 / 26:114**
Trabajo (reposo / hover) · **28:2** transición · **46:2** Contacto.

## Arquitectura

**Astro 5 estático** en la raíz del repo. Solo `src/` y `public/` entran al build. Deploy
automático de Vercel desde `main`. URL: https://www.ibisne.com

```
src/pages/        index · trabajo/ · contacto/ · legal/[slug] (privacidad, terminos, cookies, aviso-legal) · 404
src/layouts/Base.astro   shell de todas las páginas (head, header, consent, scroll por página)
src/components/   Header, Consent, LegalFooter, HomeLayerImg, contact-option, work-*
src/scripts/      travel.ts (motor de viaje), world/ (mundo WebGL), entry.ts (entrada inmersiva + loader), ambient.ts (música), consent.ts, home-light, work-gallery, contact-enter
src/data/brands.ts      datos de las marcas de Trabajo
src/content/legal/*.md  textos legales
src/styles/       tokens.css + global.css
src/assets/       bg/ (fondos), logos/, mockups/, b/ (silueta de la B)
public/           iconos, og.jpg, manifest, robots, sw.js
scripts/prune-dist.mjs  limpia imágenes huérfanas de dist/ tras el build
```

Detalle del motor de viaje, la B y los props de `Base`: **`src/README-dev.md`**.
Léelo antes de tocar transiciones o layout.

- **Motor `travel.ts`**: navegación SPA con `ClientRouter`. Cada página registra puntos
  focales y hooks con `registerPage`; salida = zoom al punto focal con blur, entrada en
  cascada. Los hooks crean sus animaciones de forma **síncrona**. Con reduced motion todo
  es un fundido de 200 ms.
- **La B**: la dibuja el mundo WebGL (`src/scripts/world/`). Sin WebGL o con reduced-motion se muestra la silueta estática `src/assets/b/b-trim.png` (Inicio y 404).
- **Scroll**: en Inicio, Trabajo y Contacto **no hay scroll en escritorio ≥1024x700**
  (`100dvh`, `overflow:hidden`). Debajo de eso (móvil) hay scroll normal, layout apilado,
  efectos simplificados y tap en lugar de hover. Legales y 404 siempre scrollean. El pie legal (`LegalFooter`)
  solo aparece en Contacto y en las páginas legales; Inicio, Trabajo y fichas no llevan enlace
  "Privacidad" (el banner de cookies conserva el suyo).
- **Estilos**: solo tokens de `src/styles/tokens.css` (`--ink #0B0820`, `--magenta #FF3EA5`,
  `--cyan #4DF3FF`, `--text`...). Cero colores hardcodeados. **Geist es la ÚNICA
  tipografía** (titular: primera línea 100, segunda 700). Tarjeta estándar `.card` (vidrio
  oscuro, borde cian con glow en hover/foco) compartida por Trabajo y Contacto. Sin
  librerías de UI, sin emojis, sin CDN.
- **Imágenes**: `<Image>` de `astro:assets`, fondos en webp ≤250 KB a 1920 de ancho.

### Cómo agregar una marca a Trabajo (`src/data/brands.ts`)

1. Logo **blanco, PNG recortado** a su caja (sin márgenes) en `src/assets/logos/` e import
   arriba del archivo. Mockup horizontal webp en `src/assets/mockups/`.
2. Añade el objeto a `brands` (el orden del arreglo es el orden en pantalla): `slug`,
   `name`, `logo`, `mockup`, `nicho`, `tipos`, `stack`, `resumen` (1-2 frases para el modal
   "Ver resumen técnico"), `url` si es pública, `propio: true` si es producto propio.
3. **Si `logo` es `null`**, la UI pinta sola el placeholder "LOGO PENDIENTE". No inventes logos.
4. **Los `tipos` son PROVISIONALES**, pendientes de confirmar con Eduardo (hay un comentario
   `TIPOS PROVISIONALES` en el archivo). No los presentes como definitivos.
5. **URLs de staging (`*.ibisne-apps.com`) quedan ocultas** (comentadas) hasta que el
   proyecto tenga dominio propio. Nunca las publiques como enlace.
6. `year` está ausente a propósito: ninguna fuente declara el año del proyecto.

## Flujo de trabajo

```bash
npm ci               # instalar
npm run dev          # servidor local
npm run build        # astro build + prune-dist (deja dist/ listo)
npx astro check      # tipos
```

Antes de decir "listo": `npm run build` y `npx astro check` sin errores, abrir la página,
consola limpia, sin 404 en red, 375px, y 1024x700 sin scroll en Inicio/Trabajo/Contacto.

- **Producción**: rama `main`, Vercel auto-deploya. El trabajo vive en `sitio-2026` hasta el corte.
- **Commit y push directo a `main` autorizados** por Eduardo ("sube todo, no me preguntes,
  yo reviso"). Aplica cuando él lo pida o el flujo lo indique; no hagas commit por iniciativa
  en medio de una tarea ajena.
- **Reglas duras de git**: NUNCA `git add -A` ni `git add .` (usa `git add -u` o archivos
  específicos). NUNCA `--force` ni `--amend` salvo petición explícita.
- **Co-Authored-By obligatorio** al final del commit, con el modelo que corre la sesión.
- Estilo de commit: `tipo(scope): mensaje` · tipos `feat`, `fix`, `docs`, `chore`, `copy`.
  Commits largos: por PowerShell (el Bash los bloquea en esta máquina).

## Contacto (datos oficiales)

- **WhatsApp 33 3723 7525** → `https://wa.me/523337237525`, en **todos** los "Hablemos".
- Correo: **proyectos@ibisne.com**
- Instagram **@ibisnemx** · Facebook **/ibisnecom**
- Fuente única en el código: `src/components/contact-data.ts`. No dupliques estos datos.

## Reglas de contenido (siguen vigentes)

Lee `MESSAGING.md` antes de escribir copy.

- **Tuteo** siempre. Español de México.
- Prohibido **"agencia"** y **"paquete"**, incluso para negarlos. Hablar en positivo, sin
  nombrar lo que no somos.
- Prohibido **"socio" / "socios" / "sociedad"** (salvo "sociedad mercantil" en legales).
- **Sin guiones largos** (— –). Usa coma, punto o `·`.
- **No prometer propiedad sobre "ideas"** (art. 14 LFDA excluye las ideas). Lo protegible es
  el activo tangible: código, software, plataforma.
- **No usar NDA, contratos, firmas ni abogados como argumento de venta.**
- **No prometer no competencia por vertical** hasta que Eduardo lo confirme con abogado.
- **La Home no habla de inversión ni de proyectos.** Nada de "invertimos", "ponemos
  capital", "financiamos", "Smart Capital". Los proyectos viven **solo en Trabajo**.
- **"Estudio" está retirado del nav** por ahora. Nav: INICIO · TRABAJO · CONTACTO.
- Sin emojis. Sin catálogo de servicios enumerado como lista de agencia.

## Legales

Cuatro páginas en `src/content/legal/*.md`, publicadas el **25-oct-2026** y **PENDIENTES
de revisión de abogado (semana del 26-oct-2026)**. Cada `.md` lleva al final el comentario
`<!-- PENDIENTE: revisión de abogado, semana del 26-oct-2026 -->`; quítalo solo cuando el
abogado apruebe. Puntos a llevarle:

- **S.A.S. vs S.A.P.I.**: el texto dice "iBisne S.A.S. de C.V."; validar la forma societaria real.
- **Cláusulas §4 y §17 de renuncia** en Términos.
- **Penalizaciones del §10** en Términos.
- **Autoridad de datos personales tras la reforma de 2025** (Privacidad): quién es la
  autoridad y cómo se nombra.

No edites el fondo jurídico por tu cuenta; los textos son de Eduardo.

## Analítica y seguridad

- **Google Analytics `G-XEW1TZEMNL` solo carga con consentimiento**: `localStorage.ib_consent === 'all'`
  (`'essential'` = no carga). Lo inyecta un módulo (`consent.ts`), no HTML inline. Si tocas
  el banner, verifica que sigue condicionando la carga.
- **CSP enforcing** en `vercel.json` con `script-src 'self' https://www.googletagmanager.com`
  (**sin `unsafe-inline`**). Cualquier script nuevo va como **módulo/archivo**, nunca inline
  ni con `on*=`. `style-src` sí admite inline (Astro). Mantén `frame-ancestors 'none'` y
  `inlineStylesheets: 'never'` en `astro.config.mjs`.
- Si agregas un dominio externo (fuente, imagen, API), amplía la CSP en el mismo cambio.
- `media-src 'self'` en la CSP: la música de la entrada (`public/audio/ambient.mp3`) solo se
  descarga con "Entrar con experiencia" y nunca suena sin un clic. Detalle en `src/README-dev.md`.

## Corte desde el sitio viejo

- `vercel.json` lleva **16 redirects 301**: `/servicios/**`, `/como-trabajamos/`, `/inversion/`,
  `/por-que-ibisne/`, `/estudio/`, `/insights/**` → `/`; `/portafolio/**` → `/trabajo/`;
  `/legal/cancelacion/` → `/legal/terminos/`; más `/webs`, `/webs.html`, `/index.html`,
  `/contacto/index.html`, `/assets/og-default.png` y `/sitemap.xml` → `/sitemap-index.xml`.
- **`/promos/**` y `/empecemos/` ya no existen y redirigen a `/contacto/`**, por decisión de
  Eduardo. No las revivas.
- **`public/sw.js` es un kill-switch** que retira service workers del sitio viejo en los
  visitantes recurrentes. **Se conserva tal cual**; no registres ningún service worker nuevo.
- Sin cadenas de redirects: cada regla apunta al destino final.
- Al borrar una página nueva, agrega su redirect en el mismo commit.

## Higgsfield (assets generados)

Los fondos `c4-*` (escritorio) y `m-*` (móvil) de `src/assets/bg/` y la silueta de la B se
generaron con Higgsfield; **los créditos de esa generación ya se usaron**. No regeneres
fondos sin pedirlo a Eduardo; si hace falta variar, edita/recorta lo existente.

## Reglas de negocio que siguen vigentes

Fuera del sitio, pero rigen conversaciones y documentos:

| Modelo de entrada | Qué pasa con la IP al liquidar |
|---|---|
| **Venta** (proyecto de cliente) | Todo pasa al cliente: código, plataforma y piezas. |
| **Venture Capital / Incubadora** | iBisne conserva total o parcialmente los activos que desarrolló, como inversor del proyecto. |

La titularidad se transfiere **al cerrar el desarrollo**, nunca antes. Términos válidos
para capital: Smart Capital · Venture Capital · Incubadora.

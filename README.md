# iBisne · sitio web

Tech studio en Zapopan, Jalisco. Sitio estático en **Astro 5** (Inicio, Trabajo, Contacto y legales).
Producción: https://www.ibisne.com

## Correr

```bash
npm ci               # instalar dependencias
npm run dev          # servidor local (http://localhost:4321)
npm run build        # genera dist/ (incluye limpieza de imágenes huérfanas)
npm run preview      # sirve dist/
npx astro check      # revisión de tipos
```

Requiere Node 20 o superior.

## Desplegar

Vercel despliega solo al hacer push a `main` (`vercel.json`: `npm ci` + `npm run build`,
salida `dist/`). No hay pasos manuales. Las cabeceras de seguridad, la CSP y los
redirects 301 del sitio viejo viven en `vercel.json`.

## Estructura

- `src/pages/` páginas · `src/layouts/` shell · `src/components/` · `src/scripts/` (motor de transiciones, partículas, consentimiento)
- `src/data/brands.ts` marcas de Trabajo · `src/content/legal/` textos legales
- `public/` iconos, `og.jpg`, manifest, `sw.js` (kill-switch del sitio viejo)

Guía de desarrollo del motor de viaje y la B de partículas: `src/README-dev.md`.
Reglas del proyecto para Claude Code: `CLAUDE.md`. Tono y copy: `MESSAGING.md`.

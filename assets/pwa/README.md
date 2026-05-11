# PWA icons — iBisne

Esta carpeta contiene los iconos consumidos por `/manifest.webmanifest` y las meta tags `apple-touch-icon`.

## Iconos pendientes de generar

| Archivo | Tamaño | Purpose | Notas |
|---|---|---|---|
| `icon-192.png` | 192x192 | any | logo iBisne sobre `#0D1117`, padding ~15% |
| `icon-512.png` | 512x512 | any | logo iBisne sobre `#0D1117`, padding ~15% |
| `icon-maskable-512.png` | 512x512 | maskable | safe area 80% (padding 20% en cada lado) — Android recorta los bordes |
| `apple-touch-icon.png` | 180x180 | iOS home screen | logo iBisne sobre `#0D1117`, padding ~15%, sin transparencia |

## Fuente

- Logo: `/brand/iBisne_blanco.png` (logo blanco sobre fondo oscuro).
- Background color: `#0D1117` (el mismo que `theme_color`).
- Accent (no usar en iconos por defecto): `#3DFF7F`.

## Recomendaciones para generarlos

Opciones (elegir una):

1. **realfavicongenerator.net** — sube `iBisne_blanco.png`, configura background `#0D1117`, descarga el paquete, copia solo los 4 archivos de arriba aquí.
2. **PWA Asset Generator** (CLI):
   ```
   npx pwa-asset-generator brand/iBisne_blanco.png assets/pwa \
     --background "#0D1117" \
     --padding "15%" \
     --opaque true \
     --icon-only
   ```
   Después generar el maskable con `--padding "20%"` aparte y renombrar.
3. **Figma / Sketch** — exportar manualmente con las medidas exactas.

## Validación

- Maskable.app (https://maskable.app/editor) para previsualizar `icon-maskable-512.png` sobre máscaras de Android.
- Lighthouse PWA audit en Chrome DevTools.

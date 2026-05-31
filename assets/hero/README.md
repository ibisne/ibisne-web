# /assets/hero/

Carpeta para el video de fondo del hero de la SPA (`/index.html` § 01).

## Cómo agregar un video stock

1. Descarga un video tech apropiado de:
   - **Mixkit** — https://mixkit.co/free-stock-video/abstract/ (license libre uso comercial, sin atribución)
   - **Coverr** — https://coverr.co/ (CC0)
   - **Pexels** — https://pexels.com/videos/ (license libre uso comercial)
   - **Pixabay** — https://pixabay.com/videos/ (CC0)

2. Tema sugerido: tech abstracto · partículas, data flow, network nodes, code on screen, holographic UI. Loop seamless preferido.

3. Optimiza con ffmpeg (ya disponible local · v8.1.1):

   ```bash
   # MP4 H.264 (compatibilidad universal) · ~1.5MB target
   ffmpeg -i tu-video.mp4 -vcodec libx264 -crf 28 -preset slow \
          -an -movflags +faststart -vf "scale=1920:-2" \
          assets/hero/tech.mp4

   # WebM VP9 (mejor compresión, browsers modernos)
   ffmpeg -i tu-video.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 \
          -an -vf "scale=1920:-2" assets/hero/tech.webm

   # Poster image (primer frame) para fallback mobile
   ffmpeg -i tu-video.mp4 -vframes 1 -vf "scale=1920:-2" \
          assets/hero/poster.webp
   ```

4. Verifica tamaños: idealmente `<2MB` cada video · poster `<200KB`.

5. Bump SW: cambia `CACHE` en `/sw.js` para invalidar PWA instaladas.

## Fallback actual (sin video)

El hero ya tiene un fallback CSS hermoso (gradient angular dark + SVG dots flotantes + vignette) que se renderiza si los archivos de video no existen. Es performante, no requiere assets externos y se ve "tech" sin caer en lo decorativo.

Cuando dropees los videos reales en esta carpeta, automáticamente los browsers que soporten `<video>` los reproducirán encima del fallback CSS, sin tocar HTML/JS.

## Archivos esperados

- `tech.webm` (preferred, VP9)
- `tech.mp4` (fallback, H.264)
- `poster.webp` (frame fallback mobile + preview de carga)

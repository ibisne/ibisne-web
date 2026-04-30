# iBisne · sitio web

Holding LATAM de 4 verticales operativas (Commerce Growth Partner · Smart Capital · Emergente · Venture Lab). Base en Guadalajara. Capital + ejecución, mentalidad operadora.

---

## Sistema de diseño OFICIAL: VAULT (v2)

> Vive en `/design-system-v2/`. Versión actual: ver `?v=X.Y.Z` en el `<head>` de `UI Kit.html`.

Estética: editorial dark, hairlines 1px, tipografía masiva neo-grotesk (Inter Tight + JetBrains Mono), 3 tiers de verde (phosphor `#3DFF7F` decisivo + mint `#AEFFC8` informacional + soft atmosférico). 4 botones, sin emojis, sin iconos de librería externa, sin gradientes/glow/scanlines.

**Antes de tocar UI**: leer `/design-system-v2/HANDOFF.md` completo + `/design-system-v2/README.md`. Esos dos archivos son la ley del repo.

---

## Estructura del repo

```
iBisneVC/
├─ index.html                    ← redirect temporal al UI Kit v2 mientras se construye el home
├─ design-system-v2/             ← VAULT — sistema oficial (intocable)
│   ├─ tokens.css
│   ├─ components.css
│   ├─ components-extra.css
│   ├─ motion.css
│   ├─ motion.js
│   ├─ icons-reference.html
│   ├─ UI Kit.html               ← style guide navegable
│   ├─ HANDOFF.md                ← contexto + reglas duras + issues conocidos
│   └─ README.md
├─ pages/                        ← páginas del sitio (en construcción · Fase 4)
├─ assets/
│   ├─ img/                      ← fotografía dirigida (vacío hasta Fase 4)
│   └─ logos/                    ← logos de portfolio companies (vacío hasta Fase 4)
├─ brand/
│   └─ iBisne_blanco.png         ← logo oficial
├─ legacy/                       ← v1 "Operator Grid" archivado · NO consumir
│   ├─ design-system/
│   ├─ pages/index.html
│   └─ BRIEF-PARA-CLAUDE-DESIGN.md
├─ scripts/                      ← herramientas operativas del negocio (P&L, sheets) — fuera del scope web
├─ TEXTOS-RESPALDO.md            ← copy LOCKED del sitio (sitemap, hero, 4 verticales)
├─ CLAUDE.md                     ← instrucciones permanentes para cualquier sesión
├─ AUDIT.md                      ← Fase 1 · auditoría VAULT
├─ CHANGELOG.md                  ← cambios versionados del sistema
├─ LEGACY-PURGE.md               ← Fase 3 · plan de archivado
└─ PROGRESS.md                   ← estado del plan maestro (5 fases)
```

---

## Setup en MacBook (M1)

El proyecto se continúa en MacBook. Para dejarlo listo de un jalón:

```bash
chmod +x setup.sh
./setup.sh
```

`setup.sh` verifica `python3` + `git`, crea el venv para los scripts de P&L, abre VS Code, levanta el dev server en `http://localhost:8787/` y al final imprime un resumen con URLs y cómo detener el server (`kill $(cat .devserver.pid)`). Es idempotente.

---

## Cómo correr local (manual)

```bash
cd ~/path/al/repo   # en Windows: cd C:\Users\ibisn\OneDrive\Desktop\iBisneVC
python3 -m http.server 8787
```

Abrir `http://localhost:8787/` (redirige al UI Kit) o directo `http://localhost:8787/design-system-v2/UI%20Kit.html`.

Para forzar reload sin cache: `Ctrl+Shift+R`. Cada cambio bumpear `?v=X.Y.Z` en el `<head>` de `UI Kit.html`.

---

## Sistema viejo "Operator Grid" (v1)

Archivado en `/legacy/`. Era cyberpunk-tech (cyan/violet, scanlines, glow, 7 botones, Space Grotesk). **No consumir**, **no mezclar**, **no resucitar**. Indicadores de contaminación v1 que nunca deben aparecer en v2:

- Tokens `--cyan`, `--violet`, `--grad-brand`, `--grad-fade`
- Fuentes `Space Grotesk`, `Chakra Petch`, `Space Mono`
- Markers `//` en eyebrows (v2 usa `§` y `—`)
- Clases con `scanlines`, `glow`, `neon`
- 7 variantes de botón (v2 son 4: `.btn-primary`, `.btn-line`, `.btn-ghost`, `.btn-accent`)
- Box-shadows decorativos, gradientes (excepción única permitida: `.scroll-indicator .line`)

---

## Voice & copy

Directo, operativo, mexicano. "Capital operativo para LATAM" > "Empoderando emprendedores". Spanglish controlado: rev share, equity, pipeline, ticket, runway, due diligence — sin traducir. Datos sobre adjetivos: "$42M desplegado en 47 empresas". Negaciones con confianza: "Sin management fee. Sin equity dilutivo." Frases cortas. Punto seco. Siguiente.

Copy LOCKED del sitio en `TEXTOS-RESPALDO.md`.

---

## Plan de trabajo (5 fases)

Ver `PROGRESS.md` para estado actual.

1. **Auditoría VAULT** ✅ — `AUDIT.md`
2. **Depuración** ✅ — `CHANGELOG.md` (v2.4.2)
3. **Limpieza del repo** ✅ — `LEGACY-PURGE.md` (v1 archivado en `/legacy/`)
4. **Reconstrucción del sitio** — 8 páginas consumiendo VAULT (en curso)
5. **Animaciones e interacciones avanzadas** — pendiente

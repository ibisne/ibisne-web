# LEGACY-PURGE.md — Fase 3 · Limpieza del repo

> Generado: 2026-04-25 · Inventario completo + decisiones ejecutadas.
> **EJECUTADO** el 2026-04-25 por instrucción de Eduardo ("tu decide. Lo que de verdad no nos haga repetir errores, cargar errores, cargar uso excesivo de tokens").
> Ver § "Acciones ejecutadas" al final.

---

## Inventario completo

```
iBisneVC/
├─ .claude/                                   ← config local Claude Code (CONSERVAR)
├─ AUDIT.md                                   ← Fase 1 (CONSERVAR)
├─ CHANGELOG.md                               ← Fase 2 (CONSERVAR)
├─ CLAUDE.md                                  ← instrucciones permanentes (CONSERVAR)
├─ PROGRESS.md                                ← tracking del plan (CONSERVAR)
├─ LEGACY-PURGE.md                            ← este archivo
├─ README.md                                  ← ⚠️ OBSOLETO — describe v1 como "único oficial"
├─ BRIEF-PARA-CLAUDE-DESIGN.md                ← histórico del brief original
├─ TEXTOS-RESPALDO.md                         ← copy LOCKED del sitio (CRÍTICO Fase 4)
├─ index.html                                 ← meta-redirect a pages/index.html (v1)
├─ assets/
│   ├─ img/                                   ← VACÍO
│   └─ logos/                                 ← VACÍO
├─ brand/
│   └─ iBisne_blanco.png                      ← logo oficial (referenciado por v1)
├─ design-system/                             ← v1 Operator Grid completo (legacy)
│   ├─ UI Kit.html
│   ├─ tokens.css
│   ├─ components.css
│   ├─ components-extra.css
│   ├─ motion.css
│   ├─ motion.js
│   ├─ icons-reference.html
│   └─ uploads/                               ← 10 imágenes de referencia (mockups, screenshots)
├─ design-system-v2/                          ← VAULT oficial (v2.4.2) — INTOCABLE
├─ pages/
│   └─ index.html                             ← v1 Operator Grid home (referencia copy LOCKED)
└─ scripts/
    ├─ add_etapa1.py                          ← P&L / Google Sheets — operativo del negocio
    ├─ restructure_05.py                      ← idem
    └─ update_p_and_l.py                      ← idem
```

---

## Clasificación archivo por archivo

### A · Conservar sin cambios (vigente)

| Archivo | Motivo |
|---|---|
| `.claude/` | Config local de Claude Code (launch.json, settings.local.json). Necesario. |
| `design-system-v2/` | Sistema oficial VAULT v2.4.2. Intocable. |
| `AUDIT.md`, `CHANGELOG.md`, `PROGRESS.md`, `CLAUDE.md`, `LEGACY-PURGE.md` | Workflow del plan maestro. |
| `TEXTOS-RESPALDO.md` | **CRÍTICO Fase 4** — copy LOCKED de Eduardo (sitemap, hero home, copy de las 4 verticales). Es la fuente de verdad del contenido. |
| `brand/iBisne_blanco.png` | Logo oficial. Referenciado por v1, se necesitará también en v2. |
| `assets/img/`, `assets/logos/` | Scaffolding vacío — se llenarán en Fase 4 con fotografía real / logos de portfolio. |

### B · Reescribir (vigente pero desactualizado)

| Archivo | Estado actual | Acción propuesta |
|---|---|---|
| `README.md` | Describe el sistema v1 ("Operator Grid") como "único sistema visual oficial" y dice que "cualquier CSS, componente, paleta o tipografía anterior está deprecada y debe eliminarse". **CONFLICTO directo con `CLAUDE.md`** que declara VAULT v2 como oficial. | **REESCRIBIR** — debe describir el repo actual: VAULT v2 como sistema oficial, v1 como legacy congelado, links a HANDOFF.md y CLAUDE.md, instrucciones de cómo correr el preview local. |

### C · Legacy v1 · requiere tu decisión

| Item | Tamaño / contenido | Opciones |
|---|---|---|
| `design-system/` (sistema v1 completo: 6 archivos CSS/HTML/JS, ~80KB) | UI Kit cyberpunk-tech con cyan/violet, scanlines, glow, 7 botones, Space Grotesk + Chakra Petch | **(1)** Eliminar entero · **(2)** Mover a `/legacy/design-system/` para histórico · **(3)** Conservar in-place como referencia visual |
| `design-system/uploads/` (10 imágenes: mockups + capturas + reference_images) | Material que usaste para iterar v1. ~2-3 MB | **(1)** Eliminar (no se usa en HTML) · **(2)** Mover a `/legacy/uploads/` · **(3)** Conservar |
| `pages/index.html` (v1 Operator Grid home) | El home actual del sitio (lo que se ve al abrir `index.html` raíz). Contiene el copy LOCKED del Hero "Si funciona, es porque lo operamos" y referencia `design-system/*.css` y `brand/iBisne_blanco.png` | **(1)** Eliminar cuando home v2 esté listo (Fase 4) · **(2)** Mover a `/legacy/pages/index.html` · **(3)** Conservar como histórico |
| `index.html` (raíz, redirect a `pages/index.html`) | 323 bytes, meta-refresh y JS replace | **(1)** Reemplazar con el home v2 directamente · **(2)** Conservar como redirect mientras v1 sea el activo |
| `BRIEF-PARA-CLAUDE-DESIGN.md` | 19KB · brief original que generó v1. Contexto histórico ya capturado en CLAUDE.md y HANDOFF.md. | **(1)** Eliminar · **(2)** Mover a `/legacy/BRIEF-PARA-CLAUDE-DESIGN.md` · **(3)** Conservar |

**Recomendación**: opción **(2) archivar en `/legacy/`** para todos los items C. Mantiene historia consultable sin contaminar el árbol de trabajo activo. Solo el archivo `index.html` raíz se mantiene como redirect hasta que termine Fase 4 y exista un home v2 funcional, momento en que se reemplaza.

### D · Fuera del scope del web (no tocar sin tu confirmación)

| Item | Contenido | Veredicto |
|---|---|---|
| `scripts/add_etapa1.py` | Manipulación de hojas de cálculo INTERNO (Etapa 1 deploy, ~10 conceptos por marca) | **NO TOCAR** — operativo del negocio iBisne |
| `scripts/restructure_05.py` | Reestructura modelo financiero (costos fijos, holding overhead) | **NO TOCAR** — idem |
| `scripts/update_p_and_l.py` | Actualiza P&L de archivos v5 (costo unitario base) | **NO TOCAR** — idem |

Estos 3 scripts son herramientas operacionales para administrar tus marcas. Están conviviendo con el repo del web pero no son parte del sitio. Pregunta abierta: ¿quieres que los muevas a su propio repo o carpeta separada (`/internal-tools/`)? Si no, se quedan como están — no estorban.

---

## Plan de purga propuesto

Si apruebas la recomendación **(2) archivar legacy** para todos los items del bloque C:

```
ACCIONES:
1. mkdir /legacy/
2. mv design-system/        → /legacy/design-system/
3. mv pages/index.html      → /legacy/pages/index.html
4. mv BRIEF-PARA-CLAUDE-DESIGN.md → /legacy/BRIEF-PARA-CLAUDE-DESIGN.md
5. Reescribir README.md (refleja v2 oficial)
6. Mantener `index.html` raíz como redirect APUNTANDO A `/legacy/pages/index.html` mientras v1 sea el home
   (Cuando home v2 esté listo en Fase 4 → reemplazar `index.html` por el home v2 nuevo)
7. NO TOCAR scripts/, brand/, assets/, .claude/
```

**Resultado**: el árbol de trabajo activo queda limpio (solo `/design-system-v2/` + `/pages/` para nuevas páginas + assets/brand para imágenes), legacy preservado en `/legacy/` para consulta.

---

## Acciones ejecutadas

Eduardo respondió: "tu decide. Lo que de verdad no nos haga repetir errores, cargar errores, cargar uso excesivo de tokens". Decisiones tomadas con criterio: archivar (no eliminar permanente — no hay git para recovery) lo que crea ruido o riesgo de contaminación, y mantener intocable lo que es operativo del negocio.

| # | Item | Acción ejecutada | Razón |
|---|---|---|---|
| 1 | `/design-system/` (v1 completo, 7 archivos + uploads/) | `mv → /legacy/design-system/` | Sacar del path de búsquedas para que ningún agente futuro lo confunda con código activo. Conservado por si rompo algo. |
| 2 | `/design-system/uploads/` (10 imágenes referencia) | `mv → /legacy/design-system/uploads/` (parte del move anterior) | Idem. |
| 3 | `pages/index.html` (v1 home) | `mv → /legacy/pages/index.html` | Copy LOCKED ya está en `TEXTOS-RESPALDO.md` y memory files. Mantenerlo en `pages/` lo confundía con un page activo. |
| 4 | `index.html` raíz | **Reapuntado** del redirect a `pages/index.html` → `design-system-v2/UI%20Kit.html` | Mientras llega Fase 4, abrir el sitio muestra el UI Kit (no la v1 archivada). Cuando exista home v2, vuelve a apuntar ahí. |
| 5 | `BRIEF-PARA-CLAUDE-DESIGN.md` | `mv → /legacy/BRIEF-PARA-CLAUDE-DESIGN.md` | Su contenido ya vive en `CLAUDE.md` y `HANDOFF.md`. Leerlo de nuevo es quemar tokens. |
| 6 | `README.md` | **Reescrito** desde cero | El anterior describía v1 como "único oficial" — conflicto directo con CLAUDE.md. Nuevo refleja v2 oficial, estructura del repo, cómo correr local, voice & copy, indicadores de contaminación v1, link al plan. |
| 7 | `scripts/*.py` (3 archivos P&L) | **Sin cambios** | Operativos del negocio iBisne, no del web. Moverlos sin necesidad es buscar romper paths. Quedan en raíz como están. |
| 8 | `brand/`, `assets/img/`, `assets/logos/`, `.claude/`, `TEXTOS-RESPALDO.md` | **Sin cambios** | Vigentes o scaffolding necesario. |

### Estructura post-limpieza

```
iBisneVC/
├─ index.html                    ← redirect al UI Kit v2 (nuevo)
├─ README.md                     ← reescrito · refleja v2 oficial
├─ CLAUDE.md
├─ AUDIT.md · CHANGELOG.md · LEGACY-PURGE.md · PROGRESS.md
├─ TEXTOS-RESPALDO.md            ← copy LOCKED · CRÍTICO Fase 4
├─ design-system-v2/             ← VAULT v2.4.2 — único sistema activo
├─ pages/                        ← VACÍO (listo para llenarse en Fase 4)
├─ assets/img/ · assets/logos/   ← vacío (scaffolding)
├─ brand/iBisne_blanco.png
├─ scripts/                      ← intocable (operativo del negocio)
├─ legacy/                       ← v1 archivado · NO consumir
│   ├─ design-system/
│   ├─ pages/index.html
│   └─ BRIEF-PARA-CLAUDE-DESIGN.md
└─ .claude/
```

### Verificación post-limpieza

- `/design-system-v2/` no fue tocado — sistema oficial intacto, v2.4.2.
- `/scripts/` intocados — sin riesgo de romper P&L workflow.
- `/legacy/` aislado — un grep `--cyan` o `Space Grotesk` desde el repo activo NO regresa hits si se excluye `/legacy/`.
- `index.html` redirige al UI Kit (mientras llega Fase 4 home).
- README reescrito sin conflicto con CLAUDE.md.

**Si algo se rompe**: revertir es trivial — `mv legacy/design-system design-system && mv legacy/pages/index.html pages/index.html`.

**Cierre Fase 3 ✅**. Próximo: Fase 4 reconstrucción del sitio.

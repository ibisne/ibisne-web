# iBisne · Playbooks · borrador para validación

> **Estado**: v0.1 borrador propuesto por Claude
> **Acción de Eduardo**: revisar cada playbook · marcar ❌ cambios · agregar/quitar pasos
> **Después**: seedear este contenido en `playbooks` + `playbook_steps` de Supabase

---

## Cómo leer este documento

Cada playbook tiene:

- **Tech stack default** (lo que el arquitecto puede ajustar)
- **Tiempo total estimado** (suma de todos los pasos)
- **Pasos numerados** con esta estructura:

```
N · Nombre del paso              [TIPO · ROL_EJECUTA → ROL_APRUEBA · TIEMPO]
   Inputs requeridos:
   · ...
   Outputs esperados:
   · ...
   Checklist (sub-tareas):
   · ...
   Recursos sugeridos:
   · ...
```

**Tipos**: `input` · `review` · `build` · `deploy` · `handoff`
**Roles**: `kam` · `arq` · `sr` · `jr` · `cliente`

---

## Pasos base · presentes en TODOS los playbooks

Estos 4 pasos arrancan cualquier proyecto. Cambian solo los siguientes según tipo.

### 1 · Master doc del cliente · `input · kam → sr · 2h`
Toda la info de la empresa antes de cualquier ejecución.
- **Inputs**: lead convertido (datos contacto, vertical, subtipo)
- **Outputs**: doc Notion con sección Empresa / Industria / Competidores / Producto / Tono de marca / Stakeholders clave
- **Checklist**: completar 8 secciones · entrevista 30 min con cliente · grabar
- **Recursos**: Template Notion "iBisne master doc v3"

### 2 · Brief firmado · `input · kam → cliente · 4h`
El cliente llena el brief de su proyecto y firma.
- **Inputs**: Master doc completo
- **Outputs**: PDF brief firmado con 20 respuestas · link de aprobación cliente
- **Checklist**: envío link al cliente · cliente llena 20 preguntas · revisar respuestas · firmar
- **Recursos**: Form de brief en portal cliente · plantilla email recordatorio

### 3 · Discovery call · resumen · `input · kam → sr · 1.5h`
Call de 1 hora cliente + KAM + Sr para alinear expectativas.
- **Inputs**: Brief firmado
- **Outputs**: grabación Loom · resumen escrito 200-400 palabras · 3-5 acuerdos clave
- **Checklist**: agendar · ejecutar 60 min · grabar · resumir · enviar resumen al cliente
- **Recursos**: Loom · Calendly del KAM · template resumen

### 4 · Tech stack declarado · `review · arq → founder · 2h`
El arquitecto declara plataforma, framework, servicios y firma. **Aquí divergen los playbooks**.
- **Inputs**: Master doc + Brief + Discovery resumen
- **Outputs**: registro en tabla `tech_stacks` · justificación escrita · costos infra estimados · firma founder
- **Checklist**: evaluar sugerencia automática · ajustar si necesario · escribir justificación · firmar
- **Recursos**: Wireframe 10 · Playbook tech_stack_default · histórico de proyectos similares

---

# Los 10 playbooks

---

## 1 · Bio-link simple
**Tech stack default**: HTML + CSS · Hostinger · sin CMS · sin animaciones
**Tiempo total**: ~14h
**Tipo**: `bio-link`

> Un bio-link tipo Linktree para creators / influencers / negocios pequeños. Página única vertical con foto, descripción, links a sus redes y CTA principal.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 1h |
| 2 | Brief simple (5 preguntas) | input | kam → cliente | 1h |
| 3 | Discovery quick · 15 min | input | kam → sr | 0.5h |
| 4 | Tech stack default (HTML+CSS) | review | arq → founder | 0.5h |
| 5 | Recolectar assets (foto, logo, links, copy) | input | jr → kam | 1h |
| 6 | Diseñar la página en HTML + CSS | build | jr → sr | 4h |
| 7 | QA mobile-first (priorityIG/TikTok) | review | jr → sr | 1h |
| 8 | Deploy a Hostinger + dominio cliente | deploy | sr → arq | 2h |
| 9 | Capacitación 15 min + handoff | handoff | kam → founder | 1h |

**Pasos eliminados vs Sitio completo**: sitemap, wireframing, design system, MVP, desarrollo cross-page · no aplican (es 1 sola página).

---

## 2 · Landing animada
**Tech stack default**: Astro · Vercel · sin CMS · GSAP animaciones
**Tiempo total**: ~40h
**Tipo**: `landing`

> Landing de 1 página con animaciones cinemáticas, captura de email, secciones tipo storytelling. Lanzamiento de producto, evento, campaña.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief landing (objetivo conversión) | input | kam → cliente | 3h |
| 3 | Discovery call · 30 min | input | kam → sr | 1h |
| 4 | Tech stack default (Astro + GSAP) | review | arq → founder | 1h |
| 5 | Wireframe single-page (5-8 secciones) | build | jr → sr | 3h |
| 6 | Storyboard de animaciones (con video refs) | build | jr → sr | 4h |
| 7 | Moodboard + tokens visuales | build | jr → sr | 4h |
| 8 | Maquetado responsive (sin animaciones) | build | jr → sr | 8h |
| 9 | Implementación animaciones GSAP | build | jr → sr | 6h |
| 10 | Captura email + integración Resend | build | jr → sr | 2h |
| 11 | QA mobile + Lighthouse > 90 | review | jr → sr | 3h |
| 12 | Deploy Vercel + dominio + Plausible | deploy | sr → arq | 2h |
| 13 | Handoff (cómo editar copy sin código) | handoff | kam → founder | 1h |

---

## 3 · Página de leads (quiz)
**Tech stack default**: Next 14 · Vercel · MDX para preguntas · captura webhook
**Tiempo total**: ~35h
**Tipo**: `leads-page`

> Quiz tipo "encuestar para cualificar" antes de que el lead llegue al equipo. Igual que el quiz de ibisne.com.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief enfoque conversión + scoring lógico | input | kam → cliente | 4h |
| 3 | Discovery call + sesión scoring | input | kam → sr | 2h |
| 4 | Tech stack (Next + scoring custom) | review | arq → founder | 1h |
| 5 | Diseñar árbol de preguntas (sitemap del quiz) | build | jr → sr | 4h |
| 6 | Lógica de scoring + ramas de respuesta | build | sr → arq | 4h |
| 7 | UI mobile-first + transiciones | build | jr → sr | 6h |
| 8 | Integración webhook a CRM cliente | build | sr → arq | 4h |
| 9 | QA con datos reales + A/B inicial | review | jr → sr | 3h |
| 10 | Deploy + analytics + funnels Plausible | deploy | sr → arq | 3h |
| 11 | Capacitación (cómo leer leads que llegan) | handoff | kam → founder | 2h |

---

## 4 · Sitio web completo
**Tech stack default**: Next 15 · Sanity · Vercel · GSAP · Plausible · Resend
**Tiempo total**: ~85h
**Tipo**: `sitio-completo`

> Hub de marca multi-página con CMS editable, blog, contacto, animaciones cinemáticas, SEO crítico.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief aprobado | input | kam → cliente | 4h |
| 3 | Discovery call · resumen | input | kam → sr | 1.5h |
| 4 | Tech stack declarado | review | arq → founder | 2h |
| 5 | Sitemap aprobado | build | jr → cliente | 4h |
| 6 | Wireframing aprobado | build | jr → sr | 8h |
| 7 | Design system / moodboard | build | jr → sr | 8h |
| 8 | MVP / prototipo navegable | build | jr → sr | 16h |
| 9 | Desarrollo final | build | jr → sr | 32h |
| 10 | QA cross-browser | review | jr → sr | 6h |
| 11 | Deploy producción | deploy | sr → arq | 3h |
| 12 | Capacitación + handoff | handoff | kam → founder | 4h |

---

## 5 · Single product (ecom 1 producto)
**Tech stack default**: Next 15 · Stripe Checkout · Vercel · Resend
**Tiempo total**: ~50h
**Tipo**: `single-product`

> Landing optimizada para vender UN producto · pago directo Stripe · sin catálogo.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief producto + pricing | input | kam → cliente | 3h |
| 3 | Discovery + sesión Stripe setup | input | kam → sr | 1h |
| 4 | Tech stack (Next + Stripe) | review | arq → founder | 1h |
| 5 | Setup cuenta Stripe + productos | build | sr → arq | 3h |
| 6 | Wireframe page (hero + features + checkout) | build | jr → sr | 4h |
| 7 | Design + tokens producto | build | jr → sr | 6h |
| 8 | Desarrollo + integración Stripe | build | jr → sr | 16h |
| 9 | Email confirmación (Resend) | build | jr → sr | 3h |
| 10 | QA · flujo compra completo | review | jr → sr | 4h |
| 11 | Deploy + analytics conversión | deploy | sr → arq | 3h |
| 12 | Capacitación cobros + soporte | handoff | kam → founder | 4h |

---

## 6 · Ecommerce Shopify (catálogo)
**Tech stack default**: Shopify · Liquid · tema custom · pagos Shopify
**Tiempo total**: ~70h
**Tipo**: `shopify`

> Tienda Shopify con tema personalizado, catálogo manejado por el cliente.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief Shopify (productos, envíos, fiscal) | input | kam → cliente | 5h |
| 3 | Discovery + setup Shopify Plan | input | kam → sr | 2h |
| 4 | Tech stack (Shopify + apps) | review | arq → founder | 1h |
| 5 | Setup tienda + planes envío + fiscal MX | build | sr → arq | 6h |
| 6 | Carga catálogo inicial (cliente entrega CSV) | input | cliente → kam | 4h |
| 7 | Diseño tema custom (Figma) | build | jr → sr | 8h |
| 8 | Desarrollo tema Liquid | build | sr → arq | 20h |
| 9 | Configurar apps (Klaviyo, reviews, etc.) | build | jr → sr | 6h |
| 10 | QA flujo compra + envío MX | review | jr → sr | 5h |
| 11 | Deploy tienda live + dominio | deploy | sr → arq | 4h |
| 12 | Capacitación admin Shopify | handoff | kam → founder | 7h |

---

## 7 · Ecommerce headless
**Tech stack default**: Next 15 · Medusa · Stripe · Vercel
**Tiempo total**: ~120h
**Tipo**: `headless-commerce`

> Frontend custom + backend headless · máximo control, velocidad, SEO.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief headless (catálogo, integraciones, fiscal) | input | kam → cliente | 6h |
| 3 | Discovery profundo + planning sesión | input | kam → sr | 3h |
| 4 | Tech stack headless | review | arq → founder | 2h |
| 5 | Setup Medusa backend + admin | build | sr → arq | 12h |
| 6 | Migración / carga inicial productos | build | jr → sr | 8h |
| 7 | Sitemap + wireframe frontend | build | jr → sr | 6h |
| 8 | Design system ecom | build | jr → sr | 12h |
| 9 | Desarrollo frontend Next | build | sr → arq | 36h |
| 10 | Integración Stripe + envíos | build | sr → arq | 12h |
| 11 | QA · stress test 1000 productos | review | jr → sr | 10h |
| 12 | Deploy · CDN · monitoring | deploy | arq → founder | 6h |
| 13 | Capacitación admin Medusa | handoff | kam → founder | 5h |

---

## 8 · App híbrida (RN/Expo)
**Tech stack default**: React Native · Expo · EAS · Supabase backend
**Tiempo total**: ~150h
**Tipo**: `app-hybrida`

> App móvil iOS + Android compartiendo código · publicada en App Store + Play Store.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief app (features, audiencia, plataformas) | input | kam → cliente | 6h |
| 3 | Discovery + roadmap feature | input | kam → sr | 4h |
| 4 | Tech stack (RN + Expo + backend) | review | arq → founder | 3h |
| 5 | Crear cuenta Apple Dev + Google Play | input | cliente → kam | 4h |
| 6 | Wireframe + flow de pantallas | build | jr → sr | 12h |
| 7 | Design system mobile | build | jr → sr | 16h |
| 8 | Setup proyecto Expo + Supabase | build | sr → arq | 8h |
| 9 | Desarrollo · auth + pantallas core | build | jr → sr | 50h |
| 10 | Push notifications + analytics | build | sr → arq | 8h |
| 11 | QA en devices reales (5 modelos) | review | jr → sr | 12h |
| 12 | Screenshots stores + textos ASO | build | kam → cliente | 6h |
| 13 | Build & submit · App Store | deploy | sr → arq | 8h |
| 14 | Build & submit · Play Store | deploy | sr → arq | 5h |
| 15 | Capacitación + dashboard analytics | handoff | kam → founder | 6h |

---

## 9 · SaaS custom
**Tech stack default**: Next 15 · Supabase · Stripe Billing · Vercel
**Tiempo total**: ~200h
**Tipo**: `saas-custom`

> Producto digital con subscripción mensual · auth multi-tenant · dashboard admin.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 3h |
| 2 | Brief SaaS · features + pricing | input | kam → cliente | 8h |
| 3 | Discovery + roadmap (3 meses) | input | kam → sr | 4h |
| 4 | Tech stack SaaS | review | arq → founder | 3h |
| 5 | Diseño de schema BD (multi-tenant + roles) | build | sr → arq | 8h |
| 6 | Sitemap + wireframe (15+ pantallas) | build | jr → sr | 14h |
| 7 | Design system extensivo | build | jr → sr | 20h |
| 8 | Setup auth (Supabase) + roles + RLS | build | sr → arq | 12h |
| 9 | Integración Stripe Billing (3-4 tiers) | build | sr → arq | 12h |
| 10 | MVP feature 1 · navegable | build | sr → arq | 24h |
| 11 | Features 2-N (iteración) | build | sr → arq | 60h |
| 12 | Admin dashboard interno | build | jr → sr | 16h |
| 13 | QA + load testing | review | sr → arq | 10h |
| 14 | Deploy producción + monitoring | deploy | arq → founder | 4h |
| 15 | Handoff + docs admin | handoff | kam → founder | 4h |

---

## 10 · AI chatbot
**Tech stack default**: Next 15 · OpenAI · Pinecone (RAG) · Vercel
**Tiempo total**: ~80h
**Tipo**: `ai-chatbot`

> Chatbot inteligente con RAG sobre docs del cliente · embebible en sitios web.

| # | Paso | Tipo | Rol → Aprueba | Tiempo |
|---|---|---|---|---|
| 1 | Master doc del cliente | input | kam → sr | 2h |
| 2 | Brief chatbot · use case + docs source | input | kam → cliente | 4h |
| 3 | Discovery + sesión de "qué responde" | input | kam → sr | 3h |
| 4 | Tech stack AI | review | arq → founder | 2h |
| 5 | Collectar y limpiar docs del cliente | input | jr → sr | 6h |
| 6 | Setup OpenAI account + Pinecone | build | sr → arq | 3h |
| 7 | Pipeline embeddings · ingesta docs | build | sr → arq | 8h |
| 8 | Prompt engineering + system prompts | build | sr → arq | 8h |
| 9 | UI del chat (mobile-first) | build | jr → sr | 8h |
| 10 | Backend retrieval + streaming | build | sr → arq | 10h |
| 11 | Sistema de feedback (👍👎 + correcciones) | build | jr → sr | 4h |
| 12 | Embed widget en sitio cliente | build | jr → sr | 4h |
| 13 | QA · 50 conversaciones reales | review | sr → arq | 6h |
| 14 | Deploy + dashboard analytics conversaciones | deploy | sr → arq | 4h |
| 15 | Handoff + cómo iterar prompts | handoff | kam → founder | 4h |

---

## Faltantes (decidir si los hacemos en MVP1 o después)

### 11 · Web3 / DApp
**Tech stack default**: Next · Solidity · Hardhat · Wagmi · Vercel
**Tiempo**: ~180h
**Pasos clave extra vs SaaS**: smart contract development, audit, testnet → mainnet deployment, integración wallets.

### 12 · MVP no-code
**Tech stack default**: Bubble.io / Glide / Softr · sin código
**Tiempo**: ~30h
**Para**: validar idea antes de invertir en custom · todos los clientes B2C con poca certeza de product-market fit.

### 13 · Marketplace multi-vendor
**Tech stack default**: Next + Medusa + Stripe Connect
**Tiempo**: ~250h
**Pasos clave extra**: onboarding de vendedores, payouts automáticos, sistema de comisiones.

---

## Preguntas para Eduardo · valida antes de seedear

1. **Los tiempos estimados** ¿son realistas según lo que vives hoy?
2. **Los roles**: ¿el KAM cierra Brief o lo cierra cliente? · ¿el Sr Coder revisa todo o solo build steps?
3. **Aprobador del paso 4 (Tech stack)**: ¿siempre Founder o puede ser solo Arquitecto?
4. **Paso "Master doc"**: ¿es el KAM quien lo llena o el cliente? Hoy escribí `kam → sr`
5. **¿Falta algún playbook crítico?** Pensé en estos 10 + 3 candidatos. ¿Hay otro tipo que reciben seguido?
6. **Bio-link**: ¿realmente sin sitemap/wireframe/design? Yo asumí HTML+CSS directo. Si quieres pasos intermedios, dime.
7. **App nativa iOS / Android puras**: las dejé fuera porque sus pasos son casi idénticos a "App híbrida" + Apple/Google review. ¿Las quieres separadas o agrupadas?
8. **Tiempos de "Capacitación + handoff"**: ¿real? algunos los puse 1h (Bio-link) y otros 7h (Shopify). ¿Es proporcional al producto entregado?

---

## Después de tu validación

1. Marcamos ❌ los pasos que no aplican o cambiamos tiempos
2. Convierto este doc a SQL inserts para los seeds
3. Cargo los 10 (o más) playbooks en Supabase al hacer Fase 1
4. El sistema queda listo para que el primer proyecto real instancie sus pasos desde un template

---

*Generado por Claude · esperando tu feedback antes de seedear*

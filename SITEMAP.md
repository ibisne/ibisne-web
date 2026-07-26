# iBisne · Sitemap (sitio robusto)

> Sistema de diseño: **UI kit Dossier · modo oscuro**. Voz: ver `MESSAGING.md` (positiva, premium, editorial tipo Index Ventures).
> Iconografía: **Lucide inline, stroke 1.75** (la de las cotizaciones). Fotos de equipo/servicios: **placeholders** hasta que Eduardo las entregue.

**Navegación (header):** Capacidades · Cómo trabajamos · Portafolio · Inversión · Estudio · Insights · **[Hablemos]**

---

## 1. Inicio · `/` (home robusto → `home-dossier.html`)
Resume todo el sitio.
1. Header + CTA **Hablemos**.
2. **Hero** — "Del concepto al liderazgo de su categoría."
3. **Creamos · Escalamos · Invertimos** — los 3 verbos.
4. **El estándar iBisne** — highlights incluidos (breve).
5. **Portafolio destacado** — proyectos fuertes → `/portafolio`.
6. **Por qué iBisne** — diferenciadores (ventajas).
7. **Inversión (Smart Capital)** — iBroker/iFutbol/iPool → `/inversion`.
8. **Insights destacados** — 3 notas → `/insights` *(placeholder).*
9. **Contacto** — "Cuéntanos tu proyecto".
10. Footer + WhatsApp.

## 2. Capacidades · `/servicios`
**3 dominios de ingeniería** (v21, sustituyen al catálogo plano de 8 servicios):
- `/servicios/producto` — SaaS multi-tenant · CRM · ERP · Apps y PWA.
- `/servicios/comercio` — E-commerce · Sitios y plataformas · Páginas de campaña · Pagos.
- `/servicios/frontera` — Agentes de IA · Datos y RAG · Web3 y contratos · Automatización.
- **El estándar iBisne** (highlights) como refuerzo.

> Las 8 URLs viejas (`sitios-web`, `ecommerce`, `apps`, `crm`, `erp`, `saas`, `ia`, `web3`)
> están redirigidas 301 a su dominio en `vercel.json`. No revivirlas.

## 2b. Cómo trabajamos · `/como-trabajamos` **(pieza central de conversión)**
El **Protocolo iBisne**: 5 fases (Resguardo · Sesión cero · Lectura · Sprint de Validación · Dos puertas),
4 compromisos firmados, ancla de precio del Sprint ($25,000 MXN acreditable) y la bifurcación
desarrollo/sociedad. Existe para responder los dos miedos del fundador: robo de idea e inflación
de precio. Ver `MESSAGING.md` para el detalle de los compromisos publicables.

## 3. Inversión / Smart Capital · `/inversion`
- Tesis: cuando vemos potencial, entramos con capital y co-construimos.
- Qué buscamos (tracción, márgenes, producto, mentalidad) — en positivo.
- Casos propios: iBroker · iFutbol · iPool (financiados por iBisne).

## 4. Portafolio · `/portafolio`
- Los **32 proyectos** con captura real, **filtrable por vertical y estado**.
- Ficha por proyecto (fuente `ibisne-cv/cv-data.json`).

## 5. Por qué iBisne / Ventajas · `/por-que-ibisne`
- Los diferenciadores desarrollados como "por qué contratarnos": skin in the game · tecnología propia · escalabilidad por diseño · el estándar incluido · criterio de inversionista · velocidad · selectividad premium.

## 6. Estudio / Nosotros · `/estudio`
- Quiénes somos · nuestra historia · **el Código iBisne** (valores en positivo).
- **Equipo** — cards founder-first estilo Index. *(placeholder: fotos del equipo.)*

## 7. Insights / Perspectivas (blog) · `/insights`
- Artículos y notas (partnerships, lanzamientos, aprendizajes), estructura tipo Index `/perspectives`.
- *(placeholder: contenido de artículos.)*

## 8. Contacto · `/contacto`
- "Cuéntanos tu proyecto" → form → `api/lead.js`. Oficina Zapopan, Jalisco.

## 9. Legal (footer)
- `/legal/privacidad` · `/legal/terminos` (ya existen).

---
**Fases de build:** (1) home robusto → (2) Servicios · Inversión · Portafolio · Por qué iBisne → (3) Estudio/Equipo · Insights · Contacto.

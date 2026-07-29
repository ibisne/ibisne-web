# iBisne · Lógica comunicacional

> Referencia de tono: **Index Ventures** — editorial, sereno, humano, portafolio y personas al frente.
> Regla de oro: **hablamos en positivo** de lo que somos y a dónde vamos. Nunca de lo que "no somos".

## Posicionamiento (1 frase)
iBisne es una **fábrica de negocios digitales de alto impacto**: **creamos, escalamos e invertimos** en los proyectos destinados a liderar su categoría.

## ⛔ REGLA DE NEGOCIO INQUEBRANTABLE · la Homepage es un Tech Studio

**La Homepage NO menciona "invertimos", "socios", "ponemos capital", "financiamos" ni
"Smart Capital" en ningún párrafo narrativo. Cero.**

Razón comercial, no estilística: hablar de inversión en la portada **espanta a los clientes
corporativos** (solo quieren pagar por desarrollo) y **genera paranoia en los emprendedores**
(creen que iBisne quiere quedarse con su idea). Se pierden los dos públicos a la vez.

La Homepage vende **capacidad técnica**: SaaS, CRM, ERP, apps, metodologías ágiles, MVPs,
viabilidad técnica y escalabilidad. Nada más.

Las divisiones de inversión sobreviven en el home **solo como pills limpios sin explicación**:
`Tech Studio` → `/servicios/` · `Smart Capital` → `/inversion/` · `Venture Builder` → `/portafolio/`.
Los links del nav y del footer también están permitidos: son navegación, no narrativa.

### Matiz del alcance (v25, aclarado por Eduardo)
Lo prohibido es el **lenguaje narrativo que el cliente entiende y que lo asusta**:
"invertimos", "nos volvemos socios", "ponemos capital", "financiamos".
**"Venture Capital" como etiqueta de categoría sí se puede usar**: es jerga de nicho que el
cliente promedio no decodifica ni le da importancia. Por eso el home tiene una sección
titulada "Venture Capital" cuyo cuerpo NO menciona dinero:
> "Proyectos que no soltamos al entregar. Aquí no solo escribimos el código: seguimos
> dentro. Los construimos, los operamos y crecemos con ellos."

El home separa **Clientes** (proyectos de cliente) y **Venture Capital** (donde iBisne
participa). Las listas están en `build_home()` y se excluyen entre sí por código: ningún
proyecto puede salir en las dos secciones.

⚠️ **iBroker, iPool e iFutbol NO son productos propios.** El CRM los marca como
"Modelo de entrada: Inversión" y la tesis de iBroker menciona terceros. Llamarlos
"Venture Builder" fue un error de v24, corregido en v25.

Corolarios que ya mordieron una vez:
- El **topbar** y el **footer** son globales y aparecen EN la home: también deben estar limpios.
- La sección de **insights destacados del home** filtra la categoría "Inversión" y el artículo
  `skin-in-the-game`. Siguen publicados y visibles en `/insights/`.
- Cuidado con **"socio"** en cualquier acepción: "la diferencia entre un proveedor y un socio"
  también rompía la regla.
- `/inversion/`, `/como-trabajamos/`, `/estudio/` y `/por-que-ibisne/` **sí** pueden hablar de
  inversión. La regla aplica a la Homepage.

## Idea central (hero)
- Eyebrow: **ninguno**. El hero arranca directo con el H1 (decisión de Eduardo, v23.1).
- H1: **Convertimos visiones en activos tecnológicos.**
- Sub: *Diseñamos, desarrollamos y escalamos productos digitales de alto impacto. Somos los arquitectos tecnológicos que transforman tu visión en una plataforma robusta, segura y lista para liderar el mercado.*

## Narrativa · los 3 verbos
1. **Creamos** — productos digitales de punta a punta: e-commerce, plataformas, apps, CRM, ERP, SaaS, IA y Web3. Diseño, ingeniería y estrategia bajo un mismo techo.
2. **Escalamos** — arquitectura pensada para crecer. Performance medible y seguridad de nivel empresarial.
3. **Optimizamos** — auditorías de viabilidad, diseño de flujos y MVPs ágiles para mitigar riesgos antes de un lanzamiento a gran escala.

## Capacidades · 3 dominios (v21, sustituyen al catálogo de 8 servicios)
1. **Producto y plataformas** (`/servicios/producto/`) — SaaS multi-tenant, CRM, ERP, apps y PWA.
2. **Comercio digital** (`/servicios/comercio/`) — e-commerce, sitios, páginas de campaña, pagos.
3. **IA y frontera** (`/servicios/frontera/`) — agentes, RAG, automatización, Web3 y contratos.

> Regla: las webs y tiendas se nombran **dentro** de un dominio, nunca como gancho principal.

## El Protocolo iBisne (`/como-trabajamos/`)
Cuatro fases: **01 Sesión cero · 02 Lectura · 03 Sprint de Validación · 04 Dos puertas**.

Existe para responder los dos miedos reales del fundador: que le roben la idea y que le
inflen el precio para empujarlo a un esquema de capital. **El eje de confianza es técnico y ético, no
contractual** (v22).

Las 4 reglas publicadas ("Cómo operamos"):
- **La discreción es estándar** · accesos nominales, repositorios aislados, información solo entre quienes construyen.
- **El activo pasa a tu nombre** · código y plataforma **al cerrar el desarrollo** (carve-out: frameworks previos de iBisne).
- **La lectura es tuya** · el análisis se va contigo, trabajes con nosotros o no.
- **El precio va primero** · cotización cerrada con 60 días de vigencia, antes de cualquier conversación de capital.

**Sprint de Validación: se cotiza a la medida**, cobrado al inicio y acreditable íntegro. Un
SaaS multi-tenant y una app no cuestan lo mismo, por eso no hay precio fijo publicado.
Aplica solo a productos de software; sitios y tiendas se cotizan directo.

### Cuatro errores que NO se pueden repetir

1. **Nunca usar el NDA como argumento de venta.** Exigir firmas en la portada genera
   fricción y desconfianza, y posiciona a iBisne como proveedor defensivo en lugar de
   autoridad técnica. Las firmas de élite no lo hacen. El acuerdo existe (ver
   `legal/nda-mutuo.md`) pero se maneja en el **onboarding**, nunca en la comunicación pública.
2. **Nunca prometer propiedad sobre "ideas".** En México las ideas no son objeto de
   propiedad intelectual: el art. 14 de la Ley Federal del Derecho de Autor excluye
   expresamente "las ideas en sí mismas". Lo protegible es el activo tangible: **código,
   software, plataforma**. Decir "tu idea es tuya" es legalmente falso y suena amateur.
   *Ojo:* usar la palabra "idea" como punto de partida narrativo sí es correcto (el H1 del
   home, "Convertimos ideas en imperios digitales.", se queda). El error es prometer
   **propiedad** sobre ella.
> **La titularidad depende del modelo de entrada** (v31): en modelo **Venta** todo pasa al
> cliente al liquidar; en **Venture Capital / Incubadora** iBisne conserva total o
> parcialmente lo que desarrolló, como inversor. El copy del Protocolo habla del primer
> caso, que es donde desemboca la puerta de Desarrollo.

3. **Nunca decir que el código es del cliente antes del contrato** (v30). El sitio llegó a
   publicar "a tu nombre desde el primer commit", y es **falso**: la titularidad se
   transfiere **al cerrar el desarrollo**. Redactarlo mal se lee como demo prestada, así
   que la regla de escritura es: **cero verbos de retención** ("conservamos", "hasta que",
   "no se entrega"). El enunciado siempre avanza hacia el traspaso, y siempre va
   acompañado de lo que el cliente **sí** se lleva ese día.
4. **Nunca escribir "socio" ni "sociedad"** (v30). Asusta al cliente corporativo que solo
   quiere desarrollo. Términos permitidos: **Smart Capital · Venture Capital · Incubadora**.
   Aplica a **todo el sitio**, artículos incluidos. Y la propuesta de capital se presenta
   siempre **después** del análisis, nunca como promesa de entrada.

> **No prometer** no competencia por vertical hasta que Eduardo lo confirme con su abogado
> (bloquearía a iBroker/iFutbol/iPool).

## Por qué iBisne (diferenciadores)
- **Compromiso con el resultado** — nos medimos por lo que la plataforma logra en producción.
- **Tecnología propia** — dueños de la infraestructura, de punta a punta.
- **Escalabilidad por diseño** — construimos para durar y crecer.
- **El estándar incluido** — CMS, dark/white, multi-idioma, PWA, PageSpeed, analytics: siempre.
- **Criterio de inversionista** — cada decisión pesa en términos de negocio.
- **Velocidad (digital foundry)** — del concepto al lanzamiento sin fricción.
- **Selectividad premium** — un número limitado de proyectos, elegidos por su potencial.

## Tono de voz
Editorial · sereno · seguro · humano · **premium**. Siempre **afirmativo**. Frases claras, con aire. Bilingüe-ready (ES/EN).

## Léxico
- **Usar:** negocios/productos digitales de alto impacto · escalar · de punta a punta · venture builder · co-construir · liderar su categoría · Smart Capital · dominio (no "servicio") · Protocolo · Sprint de Validación.
- **Evitar:** "agencia" (ni para negarla) · "paquete" (ni para negarlo) · "sitios web para un rato" · "cotizador/venta" · "postúlate" · "brutal/depredador/sin piedad" · listas de 8 servicios · **NDA, contratos, firmas y abogados como argumento de venta** · **prometer propiedad sobre ideas**.

## Tratamiento
**Tuteo**, siempre. ("Cuéntanos tu proyecto", "tu idea es tuya"). Nunca "usted".

## Portafolio · grupos públicos (v24)
El CRM clasifica por "Modelo de entrada"; en el sitio se traduce así:
- CRM "Venta" → **Clientes** (16 proyectos). "Venta" está en la lista de Evitar, no se publica.
- CRM "Inversión" → **Inversión** (15 proyectos, incluye iBroker, iPool, iFutbol, DCI, THCC, Eleva, BreakIt).
- CRM "Incubadora" → **Incubadora**. Vacía por ahora: la pestaña no se imprime hasta que tenga proyectos.

> Del CRM **solo** sale el par slug → categoría. Nunca montos, contactos, utilidades ni cap table.
> El mapa vive en `MODELO_PROJECTS` (build.py), no en `cv-data.json`, que es externo.

## CTA
- Botón (nav/hero): **"Hablemos"** — corto, ejecutivo, premium.
- CTA secundario del hero: **"Cómo trabajamos"** → `/como-trabajamos/`.
- Cierre del Protocolo: **"Cuéntanos el proyecto. Te decimos cómo se construye."**
- Sección de contacto: **"Cuéntanos tu proyecto"** → `api/lead.js`.

// data/pricing-v9.js — v9.0 · Catálogo adaptativo · 4 megas · 22 servicios
//
// NUEVA ARQUITECTURA (vs v8.6.1):
//   · 4 megas: Web · Apps · Ecommerce · Plataformas & Automatización
//   · Plataformas&Auto absorbe los 5 servicios de Automatizaciones v8
//     y añade 4 nuevos: saas, crm, erp, blockchain (total 9 servicios)
//   · Cada servicio tiene `tipos[]` (3-8 por servicio) · pregunta inicial adaptativa
//   · `subflow[id]` ahora es { byType: {...}, shared: [...] }
//     - byType: preguntas específicas del tipo elegido
//     - shared: preguntas comunes (acabado, plazo, idiomas) que aplican a todos los tipos
//   · NUEVO top-level: `addOns[]` · 19 capacidades extra con `aplica:[]` por servicio
//   · ELIMINADO: modificadores.plazo y modificadores.modo · viven como preguntas shared
//
// IMPORTANTE: Este archivo NO se carga en producción todavía.
//   data/pricing.js (v8.6.1) sigue siendo el activo. La activación de pricing-v9
//   ocurre en Fase 2 cuando el ui.js soporte el nuevo esquema (tipos + addOns).
//   Esto evita romper main entre PRs.

window.IBISNE_PRICING_V9 = {

  // ═══════════════════════════════════════════════════════════════════
  // MEGA-CATEGORÍAS (4)
  // ═══════════════════════════════════════════════════════════════════
  megaCategorias: [
    {
      id: 'web', label: 'Desarrollo web', icon: 'sitio',
      summary: 'Tu presencia en internet',
      info: 'Desde una página de enlaces hasta un sitio completo con CMS, portal de miembros o multi-idioma.',
      serviciosIds: ['web-bio', 'web-landing', 'web-funnel', 'web-sitio'],
    },
    {
      id: 'apps', label: 'Apps', icon: 'app',
      summary: 'Tu negocio en el bolsillo del cliente',
      info: 'Aplicaciones nativas o web (PWA). Elige plataforma y nosotros nos encargamos del resto.',
      serviciosIds: ['app-pwa', 'app-android', 'app-ios', 'app-ambas', 'app-desktop'],
    },
    {
      id: 'ecommerce', label: 'Ecommerce', icon: 'ecommerce',
      summary: 'Vende tus productos online',
      info: 'Desde una landing de 1 producto hasta una tienda multi-producto, Shopify o app nativa.',
      serviciosIds: ['ec-mini', 'ec-shopify', 'ec-tienda', 'ec-app'],
    },
    {
      id: 'plat', label: 'Plataformas & Automatización', icon: 'serverapp',
      summary: 'Tu infraestructura operativa',
      info: 'SaaS, CRM, ERP, blockchain, chatbots, integraciones, procesos · todo lo que tu equipo opera por dentro.',
      serviciosIds: [
        'plat-saas', 'plat-crm', 'plat-erp', 'plat-blockchain',
        'plat-chatbot', 'plat-agenda', 'plat-integraciones', 'plat-procesos', 'plat-asesoria'
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // SERVICIOS · 22 total · indexados por id
  // ═══════════════════════════════════════════════════════════════════
  servicios: {

    // ── WEB (4 servicios) ────────────────────────────────────────────
    'web-bio': {
      label: 'Bio link / Página de enlaces', base: 6250, tier: 'micro',
      tiempo: '3-7 días', icon: 'sitio', megaId: 'web',
      subtitle: 'Tu IG en una sola liga · redes, productos, WhatsApp',
      tipos: [
        { id: 'linktree',       label: 'Linktree-style',  summary: 'Enlaces simples · 1 columna' },
        { id: 'bento',          label: 'Bento',           summary: 'Cards con preview · grid 2-col' },
        { id: 'mini-portfolio', label: 'Mini-portfolio',  summary: '1-page + galería de trabajos' },
      ],
    },
    'web-landing': {
      label: 'Landing page', base: 20000, tier: 'medio',
      tiempo: '1-2 sem', icon: 'sitio', megaId: 'web',
      subtitle: 'Una página que convence y convierte',
      tipos: [
        { id: 'lead-gen',       label: 'Lead-gen',         summary: 'Captura email/teléfono · scoring básico' },
        { id: 'producto',       label: 'Producto',         summary: 'Vender 1 producto · CTA al checkout' },
        { id: 'evento',         label: 'Evento',           summary: 'Registro + agenda + recordatorios' },
        { id: 'pre-lanzamiento', label: 'Pre-lanzamiento', summary: 'Waitlist + countdown · expectativa' },
        { id: 'venta-servicios', label: 'Venta de servicios', summary: 'Consultor / freelance / agencia' },
      ],
    },
    'web-funnel': {
      label: 'Funnel de ventas', base: 37500, tier: 'medio',
      tiempo: '2-4 sem', icon: 'leads', megaId: 'web',
      subtitle: 'Multi-paso · convierte mejor que una landing',
      tipos: [
        { id: 'venta-directa', label: 'Venta directa',     summary: '1 producto · checkout integrado' },
        { id: 'captura-leads', label: 'Captura de leads',  summary: 'Form + nurturing email' },
        { id: 'upsell',        label: 'Upsell',            summary: 'Orden bump + 1-click upsell' },
        { id: 'webinar',       label: 'Seminario web',     summary: 'Registro + recordatorios + replay' },
      ],
    },
    'web-sitio': {
      label: 'Sitio web completo', base: 62500, tier: 'grande',
      tiempo: '3-8 sem', icon: 'sitio', megaId: 'web',
      subtitle: 'Tu casa digital completa · CMS opcional · multi-idioma',
      tipos: [
        { id: 'corporate-basico',    label: 'Corporate básico',     summary: '5-10 secciones · sin CMS' },
        { id: 'corporate-completo',  label: 'Corporate completo',   summary: '10+ secciones · CMS · blog' },
        { id: 'portal-miembros',     label: 'Portal de miembros',   summary: 'Login + área privada + niveles' },
        { id: 'blog-magazine',       label: 'Blog / magazine',      summary: 'CMS de artículos · categorías · autores' },
        { id: 'catalogo-no-tx',      label: 'Catálogo no-tx',       summary: 'Productos sin checkout · contacto' },
        { id: 'docs-wiki',           label: 'Docs / wiki',          summary: 'Documentación · búsqueda · versiones' },
        { id: 'multi-idioma-serio',  label: 'Multi-idioma serio',   summary: '3+ idiomas · CMS multilingüe' },
        { id: 'editorial-story',     label: 'Editorial storytelling', summary: 'Long-form · animaciones scroll' },
      ],
    },

    // ── APPS (5 servicios · mismos 6 tipos) ──────────────────────────
    'app-pwa': {
      label: 'Web app (PWA)', base: 45000, tier: 'medio',
      tiempo: '3-8 sem', icon: 'app', megaId: 'apps',
      subtitle: 'Funciona en cualquier dispositivo · instalable sin stores',
      tipos: 'APP_TIPOS', // marker · se expande abajo
    },
    'app-android': {
      label: 'App de Android', base: 87500, tier: 'grande',
      tiempo: '5-14 sem', icon: 'app', megaId: 'apps',
      subtitle: 'Nativa · Google Play · usuarios MX/LATAM',
      tipos: 'APP_TIPOS',
    },
    'app-ios': {
      label: 'App de iPhone', base: 112500, tier: 'grande',
      tiempo: '5-14 sem', icon: 'app', megaId: 'apps',
      subtitle: 'Nativa · App Store · usuarios premium',
      tipos: 'APP_TIPOS',
    },
    'app-ambas': {
      label: 'iPhone + Android', base: 162500, tier: 'grande',
      tiempo: '6-16 sem', icon: 'app', megaId: 'apps',
      subtitle: 'Cross-platform · cobertura total · 1 codebase',
      tipos: 'APP_TIPOS',
    },
    'app-desktop': {
      label: 'App de escritorio', base: 125000, tier: 'grande',
      tiempo: '5-14 sem', icon: 'serverapp', megaId: 'apps',
      subtitle: 'Windows/Mac/Linux · uso intensivo · sin browser',
      tipos: 'APP_TIPOS',
    },

    // ── ECOMMERCE (4 servicios · mismos 4 tipos) ─────────────────────
    'ec-mini': {
      label: 'Landing de 1 producto', base: 20000, tier: 'medio',
      tiempo: '1-2 sem', icon: 'ecommerce', megaId: 'ecommerce',
      subtitle: 'Una página · checkout integrado · arranca a vender hoy',
      tipos: 'EC_TIPOS',
    },
    'ec-shopify': {
      label: 'Tienda en Shopify', base: 30000, tier: 'medio',
      tiempo: '2-4 sem', icon: 'ecommerce', megaId: 'ecommerce',
      subtitle: 'Plataforma robusta · apps ecosystem · low maintenance',
      tipos: 'EC_TIPOS',
    },
    'ec-tienda': {
      label: 'Tienda en código propio', base: 87500, tier: 'grande',
      tiempo: '3-12 sem', icon: 'ecommerce', megaId: 'ecommerce',
      subtitle: 'Headless · velocidad y SEO máximo · sin lock-in',
      tipos: 'EC_TIPOS',
    },
    'ec-app': {
      label: 'Ecommerce app nativa', base: 137500, tier: 'grande',
      tiempo: '6-14 sem', icon: 'app', megaId: 'ecommerce',
      subtitle: 'iOS+Android · checkout in-app · push para abandono',
      tipos: 'EC_TIPOS',
    },

    // ── PLATAFORMAS & AUTOMATIZACIÓN (9 servicios) ───────────────────
    // 5 heredados de v8 Automatizaciones:
    'plat-chatbot': {
      label: 'Chatbot con IA', base: 20000, tier: 'medio',
      tiempo: '1-4 sem', icon: 'chatbot', megaId: 'plat',
      subtitle: 'WhatsApp/web/redes · reglas o IA · conectado a tus sistemas',
      tipos: [
        { id: 'faq',         label: 'FAQ',               summary: 'Responde preguntas frecuentes 24/7' },
        { id: 'leads',       label: 'Captura leads',     summary: 'Pre-califica + handoff a humano' },
        { id: 'postventa',   label: 'Atención postventa', summary: 'Tracking · devoluciones · soporte' },
        { id: 'asistente-ia', label: 'Asistente IA',     summary: 'LLM conectado a tu base · conversacional' },
      ],
    },
    'plat-agenda': {
      label: 'Agendamiento automático', base: 12500, tier: 'medio',
      tiempo: '1-2 sem', icon: 'edit', megaId: 'plat',
      subtitle: 'Cliente reserva solo · recordatorios · sincronizado',
      tipos: [
        { id: '1-a-1',      label: '1 a 1',           summary: 'Un profesional · horario fijo' },
        { id: 'equipo',     label: 'Equipo',          summary: 'Varios profesionales · routing' },
        { id: 'multi-sede', label: 'Multi-sede',      summary: 'Sucursales · staff por ubicación' },
        { id: 'con-pagos',  label: 'Con pagos',       summary: 'Reserva = pago anticipado' },
      ],
    },
    'plat-integraciones': {
      label: 'Integraciones entre sistemas', base: 17500, tier: 'medio',
      tiempo: '1-3 sem', icon: 'partnership', megaId: 'plat',
      subtitle: 'Que tus sistemas se hablen · sin copy-paste manual',
      tipos: [
        { id: '2-sistemas',   label: '2 sistemas',       summary: 'A↔B · uni o bidireccional' },
        { id: 'hub-multi',    label: 'Hub multi',        summary: '3+ sistemas · routing centralizado' },
        { id: 'etl-batch',    label: 'ETL batch',        summary: 'Movimientos programados · grandes volúmenes' },
        { id: 'tiempo-real',  label: 'Tiempo real',      summary: 'Webhooks · sub-segundo · push' },
      ],
    },
    'plat-procesos': {
      label: 'Automatización de procesos', base: 30000, tier: 'medio',
      tiempo: '2-5 sem', icon: 'serverapp', megaId: 'plat',
      subtitle: 'Operación interna sin clicks · workflow + reglas',
      tipos: [
        { id: 'aprobaciones', label: 'Aprobaciones',     summary: 'Multi-step · notificaciones · audit log' },
        { id: 'reportes',     label: 'Reportes',         summary: 'Generación automática · email · dashboard' },
        { id: 'extraccion',   label: 'Extracción datos', summary: 'PDFs/emails/forms → tabla estructurada' },
        { id: 'multi-paso',   label: 'Multi-paso',       summary: 'Workflow complejo · ramas condicionales' },
      ],
    },
    'plat-asesoria': {
      label: 'Asesoría / Capacitación', base: 2497.5, tier: 'micro',
      tiempo: 'agendable', icon: 'partnership', megaId: 'plat',
      subtitle: 'Tu equipo aprende · nosotros enseñamos · 1 sesión o serie',
      tipos: [
        { id: 'estrategia',      label: 'Estrategia',        summary: 'Roadmap tech para tu negocio' },
        { id: 'ia',              label: 'IA',                summary: 'Cómo aplicar IA en tu operación' },
        { id: 'ecommerce',       label: 'Ecommerce',         summary: 'Cómo escalar tu tienda · funnels' },
        { id: 'formacion-equipo', label: 'Formación equipo', summary: 'Capacitación técnica a tu staff' },
      ],
    },
    // 4 nuevos · blockchain SIEMPRE el más alto (decisión Eduardo)
    'plat-crm': {
      label: 'CRM a la medida', base: 62500, tier: 'grande',
      tiempo: '4-10 sem', icon: 'partnership', megaId: 'plat',
      subtitle: 'Pipeline · contactos · automatizaciones · sin pagar por usuario',
      tipos: [
        { id: 'ventas',                  label: 'Ventas',                  summary: 'Pipeline · deals · forecasting' },
        { id: 'atencion-cliente',        label: 'Atención cliente',        summary: 'Tickets · SLA · base de conocimiento' },
        { id: 'inmobiliaria',            label: 'Inmobiliaria',            summary: 'Propiedades · matching · agentes' },
        { id: 'servicios-profesionales', label: 'Servicios profesionales', summary: 'Casos · horas · facturación' },
      ],
    },
    'plat-saas': {
      label: 'SaaS / Plataforma propia', base: 87500, tier: 'grande',
      tiempo: '6-16 sem', icon: 'app', megaId: 'plat',
      subtitle: 'Tu producto digital · multi-tenant · suscripciones',
      tipos: [
        { id: 'vertical-niche',  label: 'Vertical de nicho', summary: 'Para industria específica · profundo' },
        { id: 'horizontal-tool', label: 'Horizontal',        summary: 'Cross-industry · una capacidad clara' },
        { id: 'marketplace',     label: 'Marketplace 2-sided', summary: 'Oferta + demanda · matching' },
        { id: 'b2b-internal',    label: 'B2B interna',       summary: 'Para clientes empresa · enterprise' },
      ],
    },
    'plat-erp': {
      label: 'ERP a la medida', base: 162500, tier: 'grande',
      tiempo: '8-20 sem', icon: 'serverapp', megaId: 'plat',
      subtitle: 'Operación end-to-end · módulos integrados · reemplaza Excel',
      tipos: [
        { id: 'manufactura',    label: 'Manufactura',    summary: 'Producción · inventario · BOM · planta' },
        { id: 'retail',         label: 'Retail',         summary: 'POS · stock · multi-sucursal · proveedores' },
        { id: 'servicios',      label: 'Servicios',      summary: 'Proyectos · horas · facturación · recursos' },
        { id: 'multi-vertical', label: 'Multi-vertical', summary: 'Holding · varias unidades de negocio' },
      ],
    },
    'plat-blockchain': {
      label: 'Blockchain · smart contracts', base: 187500, tier: 'grande',
      tiempo: '6-16 sem', icon: 'serverapp', megaId: 'plat',
      subtitle: 'Solidity / Rust · auditable · Ethereum, Polygon, Solana',
      tipos: [
        { id: 'token-utility',   label: 'Token utility',          summary: 'ERC-20 · pagos · governance' },
        { id: 'nft-collection',  label: 'NFT coleccionable',      summary: 'ERC-721/1155 · drop · marketplace' },
        { id: 'defi-basico',     label: 'DeFi básico',            summary: 'Staking · swap · vault simple' },
        { id: 'smart-contract-biz', label: 'Smart contract negocio', summary: 'Lógica B2B onchain · audit-grade' },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // SUBFLOW · preguntas adaptativas por servicio
  //   Estructura: subflow[servicioId] = { byType: {tipoId: [Q]}, shared: [Q] }
  //   - byType: preguntas específicas que se cargan según el tipo elegido
  //   - shared: preguntas comunes a todos los tipos del servicio
  //              (típicamente acabado + plazo + idiomas cuando aplica)
  //
  //   Formato Q:
  //     { id, label, help?, multi?: boolean,
  //       opciones: [{ id, label, subtitle?, add?: number, mul?: number, flag?: string }] }
  // ═══════════════════════════════════════════════════════════════════
  subflow: {

    // ─── WEB · web-bio (referencia · servicio más simple) ────────────
    // Tipo 'linktree' tiene preguntas distintas a 'bento' y 'mini-portfolio'
    // pero los 3 comparten acabado + plazo (no idiomas, bio link es 1 solo)
    'web-bio': {
      byType: {
        'linktree': [
          { id: 'enlaces', label: '¿Cuántos enlaces?', opciones: [
            { id: 'pocos',    label: 'Pocos · 3 a 5',     add: 0 },
            { id: 'medianos', label: 'Medianos · 6 a 12', add: 3750 },
            { id: 'muchos',   label: 'Muchos · 13+',      add: 8750 },
          ]},
          { id: 'redes', label: '¿Iconos de redes?', multi: true, help: 'Sugerimos máximo 5 para no saturar.', opciones: [
            { id: 'ig',       label: 'Instagram',  add: 500 },
            { id: 'tiktok',   label: 'TikTok',     add: 500 },
            { id: 'x',        label: 'X / Twitter', add: 500 },
            { id: 'linkedin', label: 'LinkedIn',   add: 500 },
            { id: 'youtube',  label: 'YouTube',    add: 500 },
            { id: 'spotify',  label: 'Spotify',    add: 750 },
          ]},
          { id: 'whatsapp', label: '¿WhatsApp directo?', opciones: [
            { id: 'no',       label: 'No',                            add: 0 },
            { id: 'directo',  label: 'Sí · mensaje genérico',         add: 1250 },
            { id: 'plantillas', label: 'Sí · con plantillas de venta', add: 3000 },
          ]},
          { id: 'tracking', label: '¿Tracking de clicks?', opciones: [
            { id: 'no',       label: 'No',                  add: 0 },
            { id: 'analytics', label: 'Sí · GA4',            add: 2500 },
            { id: 'pixel',    label: 'Sí · GA4 + Meta pixel', add: 4000 },
          ]},
        ],
        'bento': [
          { id: 'cards', label: '¿Cuántas cards?', opciones: [
            { id: 'pocas',    label: '4-6 cards · grid 2x2 o 2x3', add: 0 },
            { id: 'medianas', label: '7-12 cards · grid amplio',   add: 5000 },
            { id: 'muchas',   label: '13+ cards · scroll vertical', add: 12500 },
          ]},
          { id: 'preview', label: '¿Preview en cards?', help: 'Imagen, video o embed dentro de cada card.', opciones: [
            { id: 'estatica', label: 'Imagen estática',                        add: 0 },
            { id: 'embed',    label: 'Embed dinámico · IG/YT/Spotify',          add: 7500 },
            { id: 'mixto',    label: 'Mixto · estática + embed selectivo',      add: 4500 },
          ]},
          { id: 'cta', label: '¿CTA principal?', opciones: [
            { id: 'whatsapp', label: 'WhatsApp · botón flotante',        add: 1500 },
            { id: 'form',     label: 'Form de captura · email/teléfono',  add: 3000 },
            { id: 'both',     label: 'Ambos',                              add: 4000 },
          ]},
          { id: 'tracking', label: '¿Tracking de clicks?', opciones: [
            { id: 'no',        label: 'No',                  add: 0 },
            { id: 'analytics', label: 'Sí · GA4',            add: 2500 },
            { id: 'pixel',     label: 'Sí · GA4 + Meta pixel', add: 4000 },
          ]},
        ],
        'mini-portfolio': [
          { id: 'galeria', label: '¿Tamaño de galería?', opciones: [
            { id: 'pequena', label: 'Pequeña · 6-12 piezas',  add: 5000 },
            { id: 'media',   label: 'Media · 13-30 piezas',   add: 12500 },
            { id: 'grande',  label: 'Grande · 31+ piezas',    add: 22500 },
          ]},
          { id: 'detalle', label: '¿Detalle por pieza?', opciones: [
            { id: 'overlay',     label: 'Overlay · título + tag',            add: 0 },
            { id: 'lightbox',    label: 'Lightbox · descripción + multi-img', add: 5000 },
            { id: 'caso-corto',  label: 'Caso corto · 1-2 párrafos por pieza', add: 10000 },
          ]},
          { id: 'sobre-ti', label: '¿Sección "sobre ti"?', opciones: [
            { id: 'no',     label: 'No · solo galería + contacto',     add: 0 },
            { id: 'breve',  label: 'Breve · 1 párrafo + foto',         add: 2500 },
            { id: 'amplia', label: 'Amplia · bio + servicios + cliente', add: 6000 },
          ]},
          { id: 'contacto', label: '¿Cómo te contactan?', opciones: [
            { id: 'whatsapp',  label: 'WhatsApp directo',                add: 1500 },
            { id: 'form',      label: 'Form de contacto',                add: 3000 },
            { id: 'agenda',    label: 'Agenda · reservar llamada',       add: 6500 },
            { id: 'all',       label: 'Todos los anteriores',            add: 9000 },
          ]},
        ],
      },
      shared: [
        // Acabado SHARED · todos los tipos de bio terminan con esta pregunta
        { id: 'acabado', label: '¿Acabado del diseño?', opciones: [
          { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
          { id: 'balance',   label: 'Balance · calidad/precio óptimo',       mul: 1.0 },
          { id: 'premium',   label: 'Premium · animaciones + pulido máximo', mul: 1.35, flag: 'animacion-pro' },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', help: 'Express duplica el equipo · cuesta más pero entrega antes.', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    // ─── WEB · web-landing ──────────────────────────────────────────
    'web-landing': {
      byType: {
        'lead-gen': [
          { id: 'magnet', label: '¿Qué ofreces a cambio del lead?', opciones: [
            { id: 'pdf',       label: 'PDF / ebook descargable',              add: 0 },
            { id: 'webinar',   label: 'Acceso a webinar grabado',             add: 3000 },
            { id: 'consulta',  label: 'Consulta/diagnóstico gratuito',        add: 5000 },
            { id: 'descuento', label: 'Cupón de descuento',                   add: 2500 },
          ]},
          { id: 'form-len', label: '¿Tamaño del formulario?', opciones: [
            { id: 'corto', label: 'Corto · solo email',          add: 0 },
            { id: 'medio', label: 'Medio · 3-5 campos',          add: 3500 },
            { id: 'largo', label: 'Largo · 6+ campos · scoring', add: 8500 },
          ]},
          { id: 'thank-you', label: '¿Página de gracias?', opciones: [
            { id: 'simple',     label: 'Simple · "gracias, revisa tu email"',     add: 0 },
            { id: 'upsell',     label: 'Con upsell · oferta inmediata',           add: 7500 },
            { id: 'video',      label: 'Con video · onboarding',                  add: 5000 },
          ]},
          { id: 'auto-email', label: '¿Email de confirmación?', opciones: [
            { id: 'no',        label: 'No · sólo notificación interna',           add: 0 },
            { id: 'simple',    label: 'Sí · email genérico',                      add: 2000 },
            { id: 'secuencia', label: 'Sí · secuencia de 3-5 emails (nurture)',   add: 10000 },
          ]},
          { id: 'integraciones', label: '¿Conexión a tus sistemas?', multi: true, opciones: [
            { id: 'crm',     label: 'CRM (HubSpot/Pipedrive)', add: 7500 },
            { id: 'sheets',  label: 'Google Sheets',           add: 2500 },
            { id: 'mail',    label: 'Mailchimp / ConvertKit',  add: 4000 },
            { id: 'whatsapp', label: 'WhatsApp directo',       add: 3000 },
          ]},
        ],
        'producto': [
          { id: 'producto-tipo', label: '¿Tipo de producto?', opciones: [
            { id: 'fisico',  label: 'Físico · envío',           add: 0 },
            { id: 'digital', label: 'Digital · descarga',       add: 0 },
            { id: 'servicio', label: 'Servicio · agenda',       add: 2500 },
          ]},
          { id: 'pasarela-principal', label: '¿Cómo cobras?', opciones: [
            { id: 'tarjeta',   label: 'Tarjeta · Stripe/Mercado Pago', add: 5000 },
            { id: 'spei-oxxo', label: 'Tarjeta + SPEI/OXXO',           add: 8000 },
            { id: 'completo',  label: 'Multi-pasarela · tarjeta + SPEI + PayPal', add: 12500 },
          ]},
          { id: 'video-hero', label: '¿Video en el hero?', opciones: [
            { id: 'no',        label: 'No · solo imagen',                  add: 0 },
            { id: 'embed',     label: 'Sí · embed YouTube/Vimeo',          add: 2000 },
            { id: 'produccion', label: 'Sí · producción incluida (1-2 min)', add: 25000 },
          ]},
          { id: 'social-proof', label: '¿Social proof?', multi: true, opciones: [
            { id: 'testimonios',  label: 'Testimonios escritos',  add: 2500 },
            { id: 'video-test',   label: 'Testimonios en video',  add: 6000 },
            { id: 'logos',        label: 'Logos de clientes',     add: 1500 },
            { id: 'reviews',      label: 'Reviews · estrellas',   add: 3500 },
          ]},
          { id: 'urgencia', label: '¿Mecanismos de urgencia?', multi: true, opciones: [
            { id: 'countdown', label: 'Countdown timer',          add: 2500 },
            { id: 'stock',     label: 'Stock limitado visible',   add: 2000 },
            { id: 'bonos',     label: 'Bonos por tiempo limitado', add: 3500 },
          ]},
        ],
        'evento': [
          { id: 'modalidad', label: '¿Modalidad del evento?', opciones: [
            { id: 'presencial', label: 'Presencial · sede física', add: 2500 },
            { id: 'online',     label: 'Online · streaming/Zoom',  add: 0 },
            { id: 'hibrido',    label: 'Híbrido · ambos',          add: 5000 },
          ]},
          { id: 'duracion', label: '¿Duración del evento?', opciones: [
            { id: 'horas',  label: 'Pocas horas · masterclass/workshop', add: 0 },
            { id: 'dia',    label: '1 día completo',                      add: 2500 },
            { id: 'multi',  label: 'Multi-día · conferencia/festival',    add: 7500 },
          ]},
          { id: 'agenda', label: '¿Agenda del evento?', opciones: [
            { id: 'simple', label: 'Simple · lista de horarios',          add: 0 },
            { id: 'tracks', label: 'Tracks paralelos · filtros',          add: 5000 },
            { id: 'app',    label: 'Mini app · favoritos + recordatorios', add: 12500 },
          ]},
          { id: 'tickets', label: '¿Tickets / RSVP?', opciones: [
            { id: 'rsvp-gratis', label: 'RSVP gratis · sólo registro',     add: 0 },
            { id: 'una-tier',    label: 'Pago · 1 tipo de ticket',         add: 6000 },
            { id: 'multi-tier',  label: 'Pago · múltiples tiers (early/VIP/general)', add: 12500 },
          ]},
          { id: 'recordatorios', label: '¿Recordatorios automáticos?', multi: true, opciones: [
            { id: 'email-1week', label: 'Email 1 semana antes', add: 1500 },
            { id: 'email-1day',  label: 'Email 1 día antes',    add: 1500 },
            { id: 'whatsapp',    label: 'WhatsApp 1h antes',    add: 3500 },
            { id: 'calendar',    label: 'Add to calendar (.ics)', add: 2000 },
          ]},
        ],
        'pre-lanzamiento': [
          { id: 'goal-leads', label: '¿Cuántos leads esperas captar?', opciones: [
            { id: 'pocos', label: 'Pocos · <500',     add: 0 },
            { id: 'medio', label: 'Medio · 500-5000', add: 3000 },
            { id: 'mucho', label: 'Mucho · 5000+',    add: 7500 },
          ]},
          { id: 'countdown', label: '¿Countdown visible?', opciones: [
            { id: 'no',     label: 'No · sólo "próximamente"',          add: 0 },
            { id: 'fecha',  label: 'Sí · con fecha exacta',              add: 2000 },
            { id: 'gamif',  label: 'Sí · con micro-recompensas por compartir', add: 6500 },
          ]},
          { id: 'referidos', label: '¿Sistema de referidos?', opciones: [
            { id: 'no',         label: 'No · solo waitlist',              add: 0 },
            { id: 'simple',     label: 'Sí · link único · ranking',       add: 8500 },
            { id: 'recompensas', label: 'Sí · con recompensas por hito',  add: 15000 },
          ]},
          { id: 'preview', label: '¿Preview del producto?', opciones: [
            { id: 'no',        label: 'No · solo descripción',           add: 0 },
            { id: 'imagenes',  label: 'Imágenes / mockups',              add: 3000 },
            { id: 'video',     label: 'Video teaser',                    add: 7500 },
            { id: 'demo',      label: 'Demo interactivo / preview limitado', add: 17500 },
          ]},
          { id: 'launch-email', label: '¿Email de lanzamiento?', opciones: [
            { id: 'no',     label: 'No · solo nos avisas tú',             add: 0 },
            { id: 'simple', label: 'Sí · 1 email de "ya disponible"',     add: 2000 },
            { id: 'serie',  label: 'Sí · serie pre-launch (3-5 emails)',  add: 8500 },
          ]},
        ],
        'venta-servicios': [
          { id: 'tipo-servicio', label: '¿Tipo de servicio?', opciones: [
            { id: 'consultoria', label: 'Consultoría / coaching',        add: 0 },
            { id: 'agencia',     label: 'Agencia / equipo',              add: 3500 },
            { id: 'freelance',   label: 'Freelance / 1 persona',         add: 0 },
            { id: 'estudio',     label: 'Estudio creativo · portafolio fuerte', add: 7500 },
          ]},
          { id: 'paquetes', label: '¿Tienes paquetes/tiers?', opciones: [
            { id: 'uno',   label: '1 servicio único',         add: 0 },
            { id: 'tres',  label: '2-3 paquetes (tier table)', add: 4500 },
            { id: 'custom', label: 'Custom · cotización por proyecto', add: 2000 },
          ]},
          { id: 'casos', label: '¿Casos de éxito?', opciones: [
            { id: 'no',         label: 'No tengo aún',                       add: 0 },
            { id: 'logos',      label: 'Sólo logos de clientes',             add: 1500 },
            { id: 'cards',      label: 'Cards con métricas',                 add: 5000 },
            { id: 'pages',      label: 'Página por caso · detalle completo', add: 12500 },
          ]},
          { id: 'cta-principal', label: '¿CTA principal?', opciones: [
            { id: 'calendly',  label: 'Agenda en Calendly · directo',         add: 3000 },
            { id: 'form',      label: 'Form de cotización · multi-step',      add: 5500 },
            { id: 'whatsapp',  label: 'WhatsApp · conversación inmediata',    add: 2000 },
            { id: 'todos',     label: 'Los 3 · usuario elige',                add: 9000 },
          ]},
          { id: 'proceso', label: '¿Sección "cómo trabajamos"?', opciones: [
            { id: 'no',       label: 'No · directo al CTA',                  add: 0 },
            { id: 'pasos',    label: 'Sí · 3-5 pasos numerados',             add: 2500 },
            { id: 'timeline', label: 'Sí · timeline con duración por fase',   add: 5500 },
          ]},
        ],
      },
      shared: [
        { id: 'acabado', label: '¿Acabado del diseño?', opciones: [
          { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
          { id: 'balance',   label: 'Balance · calidad/precio óptimo',       mul: 1.0 },
          { id: 'premium',   label: 'Premium · animaciones + pulido máximo', mul: 1.35, flag: 'animacion-pro' },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    // ─── WEB · web-funnel ───────────────────────────────────────────
    'web-funnel': {
      byType: {
        'venta-directa': [
          { id: 'producto-precio', label: '¿Rango de precio?', opciones: [
            { id: 'bajo',  label: 'Bajo · <$500 · impulso',           add: 0 },
            { id: 'medio', label: 'Medio · $500-$3,000 · considerado', add: 5000 },
            { id: 'alto',  label: 'Alto · $3,000+ · investigado',     add: 12500 },
          ]},
          { id: 'pasos', label: '¿Cuántos pasos en el funnel?', opciones: [
            { id: 'corto', label: '2-3 pasos · landing → checkout', add: 0 },
            { id: 'medio', label: '4-6 pasos · educación + objeciones', add: 12500 },
            { id: 'largo', label: '7+ pasos · multi-touch',         add: 32500 },
          ]},
          { id: 'video-vsl', label: '¿Video de ventas (VSL)?', opciones: [
            { id: 'no',          label: 'No · solo texto + imágenes',           add: 0 },
            { id: 'embed',       label: 'Sí · embed (tú lo grabas)',            add: 3500 },
            { id: 'produccion',  label: 'Sí · producción incluida (5-15 min)',  add: 45000 },
          ]},
          { id: 'pasarela', label: '¿Pasarelas de pago?', opciones: [
            { id: 'una',      label: 'Una · tarjeta principal',              add: 5000 },
            { id: 'multi',    label: 'Multi · tarjeta + SPEI/OXXO + PayPal', add: 12500 },
            { id: 'crypto',   label: 'Multi + crypto · USDT/BTC',            add: 22500 },
          ]},
          { id: 'reportes', label: '¿Analítica del funnel?', opciones: [
            { id: 'basico',     label: 'Básico · GA4 + Meta pixel',          add: 0 },
            { id: 'dashboard',  label: 'Dashboard · conversión por paso',    add: 10000 },
            { id: 'multitouch', label: 'Atribución multi-touch · UTM tagging', add: 22500 },
          ]},
        ],
        'captura-leads': [
          { id: 'magnet', label: '¿Lead magnet?', opciones: [
            { id: 'pdf',      label: 'PDF / ebook',                          add: 0 },
            { id: 'webinar',  label: 'Webinar evergreen',                    add: 5000 },
            { id: 'mini-curso', label: 'Mini-curso por email (5-7 días)',    add: 12500 },
            { id: 'calculator', label: 'Calculadora / quiz interactivo',     add: 17500 },
          ]},
          { id: 'paginas', label: '¿Cuántas páginas en el funnel?', opciones: [
            { id: 'tres', label: '3 páginas · opt-in + gracias + entrega',     add: 0 },
            { id: 'cinco', label: '5 páginas · + tripwire + upsell',           add: 12500 },
            { id: 'siete', label: '7+ páginas · multi-step nurture',           add: 25000 },
          ]},
          { id: 'nurture', label: '¿Secuencia de nurture?', opciones: [
            { id: 'corta', label: 'Corta · 3-5 emails',           add: 7500 },
            { id: 'media', label: 'Media · 6-10 emails',          add: 15000 },
            { id: 'larga', label: 'Larga · 11+ emails · branches', add: 27500 },
          ]},
          { id: 'crm', label: '¿Integración con CRM?', opciones: [
            { id: 'sheets',     label: 'Google Sheets · básico',  add: 2500 },
            { id: 'hubspot',    label: 'HubSpot · pipeline',      add: 10000 },
            { id: 'custom',     label: 'CRM custom · API propia', add: 25000 },
          ]},
          { id: 'tripwire', label: '¿Oferta tripwire (low-ticket)?', opciones: [
            { id: 'no',     label: 'No · solo lead magnet',                  add: 0 },
            { id: 'simple', label: 'Sí · 1 oferta low-ticket post opt-in',   add: 6500 },
            { id: 'stack',  label: 'Sí · stack de ofertas (tripwire + OTO)', add: 15000 },
          ]},
        ],
        'upsell': [
          { id: 'oferta-principal', label: '¿Precio oferta principal?', opciones: [
            { id: 'bajo',  label: '<$500',         add: 0 },
            { id: 'medio', label: '$500-$3000',    add: 5000 },
            { id: 'alto',  label: '$3000+',        add: 15000 },
          ]},
          { id: 'orden-bump', label: '¿Order bump?', opciones: [
            { id: 'no',    label: 'No · solo upsell post-compra',       add: 0 },
            { id: 'uno',   label: 'Sí · 1 bump en checkout',            add: 5000 },
            { id: 'multi', label: 'Sí · múltiples bumps · checkbox',    add: 10000 },
          ]},
          { id: 'upsells', label: '¿Cuántos upsells post-compra?', opciones: [
            { id: 'uno',  label: '1 upsell · 1 downsell',                  add: 10000 },
            { id: 'dos',  label: '2 upsells · 2 downsells',                add: 22500 },
            { id: 'tres', label: '3+ upsells · cadena completa',           add: 37500 },
          ]},
          { id: '1-click', label: '¿1-click checkout para upsells?', opciones: [
            { id: 'no',  label: 'No · reintroducir tarjeta',             add: 0 },
            { id: 'si',  label: 'Sí · tarjeta guardada · 1 click',       add: 17500, flag: 'auth-or-api' },
          ]},
          { id: 'split-test', label: '¿Setup para split-test?', opciones: [
            { id: 'no',       label: 'No · 1 versión fija',                add: 0 },
            { id: 'manual',   label: 'Sí · A/B con plataforma externa',    add: 5000 },
            { id: 'integrado', label: 'Sí · A/B nativo · sin extra tool',  add: 15000 },
          ]},
        ],
        'webinar': [
          { id: 'tipo-webinar', label: '¿Live o evergreen?', opciones: [
            { id: 'evergreen', label: 'Evergreen · pre-grabado on-demand', add: 0 },
            { id: 'live',      label: 'Live · fechas programadas',         add: 7500 },
            { id: 'hibrido',   label: 'Híbrido · live + replay automático', add: 12500 },
          ]},
          { id: 'plataforma', label: '¿Plataforma del webinar?', opciones: [
            { id: 'zoom',       label: 'Zoom · estándar',                  add: 2500 },
            { id: 'webinarjam', label: 'WebinarJam / EverWebinar',         add: 6500 },
            { id: 'custom',     label: 'Player custom · sin marca externa', add: 17500 },
          ]},
          { id: 'recordatorios', label: '¿Recordatorios pre-webinar?', multi: true, opciones: [
            { id: 'email-1week', label: 'Email 1 semana antes',  add: 1500 },
            { id: 'email-1day',  label: 'Email 1 día antes',     add: 1500 },
            { id: 'email-1h',    label: 'Email 1 hora antes',    add: 1500 },
            { id: 'whatsapp',    label: 'WhatsApp 15 min antes', add: 3500 },
            { id: 'sms',         label: 'SMS 15 min antes',      add: 3500 },
          ]},
          { id: 'oferta-cierre', label: '¿Oferta de cierre durante el webinar?', opciones: [
            { id: 'no',       label: 'No · solo educación',                       add: 0 },
            { id: 'soft',     label: 'Soft sell · CTA al final',                  add: 2500 },
            { id: 'fast-action', label: 'Fast-action · bono por compra inmediata', add: 7500 },
            { id: 'stack',    label: 'Stack completo · bonos + countdown',         add: 12500 },
          ]},
          { id: 'replay', label: '¿Replay?', opciones: [
            { id: 'no',         label: 'No · sólo live',                          add: 0 },
            { id: '24h',        label: 'Sí · 24h con countdown',                   add: 5000 },
            { id: 'permanente', label: 'Sí · disponible permanente',               add: 2500 },
          ]},
        ],
      },
      shared: [
        { id: 'acabado', label: '¿Acabado del diseño?', opciones: [
          { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
          { id: 'balance',   label: 'Balance · calidad/precio óptimo',       mul: 1.0 },
          { id: 'premium',   label: 'Premium · animaciones + pulido máximo', mul: 1.35, flag: 'animacion-pro' },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    // ─── WEB · web-sitio ───────────────────────────────────────────
    'web-sitio': {
      byType: {
        'corporate-basico': [
          { id: 'secciones', label: '¿Cuántas secciones?', opciones: [
            { id: 'cinco', label: '5 secciones · esencial',           add: 0 },
            { id: 'ocho',  label: '8 secciones · estándar',           add: 15000 },
            { id: 'diez',  label: '10 secciones · amplio',            add: 32500 },
          ]},
          { id: 'casos', label: '¿Sección de casos/proyectos?', opciones: [
            { id: 'no',    label: 'No · sólo presentación',           add: 0 },
            { id: 'grid',  label: 'Sí · grid simple (logos + nombre)', add: 5000 },
            { id: 'cards', label: 'Sí · cards con detalle por caso',   add: 12500 },
          ]},
          { id: 'equipo', label: '¿Sección equipo?', opciones: [
            { id: 'no',     label: 'No',                                 add: 0 },
            { id: 'simple', label: 'Sí · fotos + nombres + cargo',       add: 3500 },
            { id: 'rich',   label: 'Sí · bio + redes + responsabilidades', add: 7500 },
          ]},
          { id: 'contacto', label: '¿Cómo te contactan?', opciones: [
            { id: 'form',     label: 'Form de contacto',                 add: 3000 },
            { id: 'multi',    label: 'Form + WhatsApp + teléfono',       add: 5500 },
            { id: 'calendar', label: 'Form + Calendly embebido',         add: 8500 },
          ]},
          { id: 'blog-lite', label: '¿Blog ligero?', opciones: [
            { id: 'no',      label: 'No',                                add: 0 },
            { id: 'estatico', label: 'Estático · markdown manual',       add: 7500 },
          ]},
        ],
        'corporate-completo': [
          { id: 'secciones', label: '¿Cuántas secciones principales?', opciones: [
            { id: 'diez',     label: '10-15 secciones',                  add: 15000 },
            { id: 'quince',   label: '16-25 secciones',                  add: 35000 },
            { id: 'multi',    label: '25+ secciones · multi-nivel',      add: 65000 },
          ]},
          { id: 'cms', label: '¿Qué CMS?', opciones: [
            { id: 'sanity',   label: 'Sanity · estructurado, moderno',   add: 25000 },
            { id: 'wordpress', label: 'WordPress · familiar a marketing', add: 15000 },
            { id: 'strapi',   label: 'Strapi · headless self-hosted',    add: 32500 },
          ]},
          { id: 'roles-cms', label: '¿Cuántos roles editores?', opciones: [
            { id: 'uno',  label: '1 editor · todos los permisos',         add: 0 },
            { id: 'tres', label: '2-3 roles (admin/editor/lectura)',      add: 5000 },
            { id: 'multi', label: '4+ roles · permisos granulares',       add: 12500 },
          ]},
          { id: 'blog', label: '¿Blog completo?', opciones: [
            { id: 'no',    label: 'No · sólo páginas',                    add: 0 },
            { id: 'basico', label: 'Sí · básico · listado + post',        add: 12500 },
            { id: 'avanz',  label: 'Sí · avanzado · categorías + autores + relacionados', add: 22500 },
          ]},
          { id: 'sub-sitios', label: '¿Sub-sitios por unidad de negocio?', opciones: [
            { id: 'no',    label: 'No · 1 sitio único',                   add: 0 },
            { id: 'dos',   label: 'Sí · 2-3 sub-sitios',                  add: 25000 },
            { id: 'multi', label: 'Sí · 4+ sub-sitios · template compartido', add: 50000 },
          ]},
          { id: 'integraciones', label: '¿Integraciones?', multi: true, opciones: [
            { id: 'crm',       label: 'CRM · HubSpot/Salesforce',         add: 12500 },
            { id: 'analytics', label: 'GA4 + GTM + dashboard',            add: 7500 },
            { id: 'auth-sso',  label: 'SSO empresa · Okta/Azure',         add: 22500, flag: 'auth-or-api' },
          ]},
        ],
        'portal-miembros': [
          { id: 'niveles', label: '¿Cuántos niveles de membresía?', opciones: [
            { id: 'uno', label: '1 nivel · acceso o no',           add: 5000 },
            { id: 'tres', label: '2-3 niveles · tier table',       add: 17500 },
            { id: 'multi', label: '4+ niveles · permisos granulares', add: 35000 },
          ]},
          { id: 'auth', label: '¿Cómo se autentican?', opciones: [
            { id: 'email', label: 'Email + password',                add: 7500 },
            { id: 'redes', label: 'Email + redes (Google/Apple)',    add: 12500 },
            { id: 'sso',   label: 'SSO empresa (Okta/Azure)',        add: 27500, flag: 'auth-or-api' },
            { id: 'custom', label: 'Custom · biometría / magic link', add: 22500 },
          ]},
          { id: 'pagos', label: '¿Pagos recurrentes?', opciones: [
            { id: 'no',         label: 'No · sólo invitación manual',   add: 0 },
            { id: 'stripe',     label: 'Stripe · una pasarela',         add: 12500 },
            { id: 'mercadopago', label: 'Mercado Pago · LATAM',         add: 12500 },
            { id: 'multi',       label: 'Multi-pasarela · Stripe + MP', add: 22500 },
          ]},
          { id: 'contenido', label: '¿Tipo de contenido privado?', multi: true, opciones: [
            { id: 'cursos',     label: 'Cursos · video + módulos',      add: 22500 },
            { id: 'descargas',  label: 'Descargas · biblioteca',        add: 7500 },
            { id: 'foros',      label: 'Foros · comunidad',             add: 17500 },
            { id: 'streaming',  label: 'Streaming en vivo',             add: 32500 },
            { id: 'documentos', label: 'Documentos · wiki/manuales',    add: 10000 },
          ]},
          { id: 'interaccion', label: '¿Interacción social?', opciones: [
            { id: 'no',     label: 'No',                                 add: 0 },
            { id: 'basico', label: 'Básico · comentarios',               add: 5000 },
            { id: 'forum',  label: 'Foro · threads + replies',           add: 22500 },
            { id: 'dm',     label: 'DMs entre miembros',                 add: 27500 },
          ]},
          { id: 'progreso', label: '¿Tracking de progreso?', opciones: [
            { id: 'no',         label: 'No',                              add: 0 },
            { id: 'completado', label: 'Sí · marca por contenido',        add: 5000 },
            { id: 'gamif',      label: 'Sí · puntos + badges + ranking',  add: 17500 },
          ]},
        ],
        'blog-magazine': [
          { id: 'frecuencia', label: '¿Frecuencia de publicación?', opciones: [
            { id: 'baja',  label: 'Baja · 1-2 posts/mes',                add: 0 },
            { id: 'media', label: 'Media · 1-2 posts/semana',            add: 5000 },
            { id: 'alta',  label: 'Alta · diario · sala de redacción',   add: 15000 },
          ]},
          { id: 'autores', label: '¿Cuántos autores?', opciones: [
            { id: 'uno',  label: '1 autor · personal',                   add: 0 },
            { id: 'pocos', label: '2-5 autores · firmas',                add: 5000 },
            { id: 'multi', label: '6+ autores · perfil público',         add: 12500 },
          ]},
          { id: 'taxonomia', label: '¿Taxonomía?', opciones: [
            { id: 'tags',    label: 'Sólo tags',                          add: 0 },
            { id: 'cats',    label: 'Categorías + tags',                  add: 3500 },
            { id: 'series',  label: 'Categorías + tags + series',         add: 8500 },
          ]},
          { id: 'busqueda', label: '¿Buscador?', opciones: [
            { id: 'no',       label: 'No · sólo nav',                     add: 0 },
            { id: 'nativo',   label: 'Sí · nativo · keyword match',        add: 5000 },
            { id: 'algolia',  label: 'Sí · Algolia · instant search',     add: 15000 },
          ]},
          { id: 'newsletter', label: '¿Newsletter?', opciones: [
            { id: 'no',     label: 'No',                                  add: 0 },
            { id: 'basico', label: 'Sí · form + envío manual',            add: 3500 },
            { id: 'auto',   label: 'Sí · digest automático semanal',      add: 12500 },
          ]},
          { id: 'monetiz', label: '¿Monetización?', multi: true, opciones: [
            { id: 'ads',      label: 'Ads displayadsense',                 add: 5000 },
            { id: 'sponsor',  label: 'Posts patrocinados',                 add: 2500 },
            { id: 'paywall',  label: 'Paywall · contenido premium',        add: 22500 },
          ]},
        ],
        'catalogo-no-tx': [
          { id: 'productos', label: '¿Tamaño del catálogo?', opciones: [
            { id: 'pocos',   label: 'Pocos · <50 productos',              add: 0 },
            { id: 'medio',   label: 'Medio · 50-300',                     add: 15000 },
            { id: 'grande',  label: 'Grande · 300+',                      add: 37500 },
          ]},
          { id: 'filtros', label: '¿Filtros y búsqueda?', opciones: [
            { id: 'simple',  label: 'Simple · categorías + tags',         add: 0 },
            { id: 'avanzado', label: 'Avanzado · multi-atributo',         add: 10000 },
            { id: 'facet',   label: 'Faceted · Algolia/ElasticSearch',    add: 25000 },
          ]},
          { id: 'detalle', label: '¿Detalle por producto?', opciones: [
            { id: 'simple', label: 'Simple · imagen + descripción',       add: 0 },
            { id: 'galeria', label: 'Galería + specs estructurados',      add: 7500 },
            { id: '360',     label: 'Galería + 360° + descarga PDF',      add: 17500 },
          ]},
          { id: 'cta', label: '¿CTA de contacto?', opciones: [
            { id: 'form',     label: 'Form de cotización por producto',   add: 5000 },
            { id: 'whatsapp', label: 'WhatsApp directo con producto',     add: 4000 },
            { id: 'lista',    label: 'Lista de cotización (multi-producto)', add: 12500 },
          ]},
          { id: 'b2b', label: '¿Funciones B2B?', multi: true, opciones: [
            { id: 'login',   label: 'Login para distribuidores',          add: 15000, flag: 'auth-or-api' },
            { id: 'precios', label: 'Precios diferenciados por cuenta',   add: 17500 },
            { id: 'export',  label: 'Export catálogo a Excel/PDF',        add: 7500 },
          ]},
        ],
        'docs-wiki': [
          { id: 'volumen', label: '¿Volumen de contenido?', opciones: [
            { id: 'pequeno', label: 'Pequeño · 20-50 docs',               add: 0 },
            { id: 'medio',   label: 'Medio · 50-200 docs',                add: 12500 },
            { id: 'grande',  label: 'Grande · 200+ docs',                 add: 30000 },
          ]},
          { id: 'estructura', label: '¿Estructura?', opciones: [
            { id: 'plana',   label: 'Plana · 1 nivel de categorías',      add: 0 },
            { id: 'jerarq',  label: 'Jerárquica · multi-nivel',           add: 7500 },
            { id: 'tags',    label: 'Jerárquica + tags + relacionados',   add: 15000 },
          ]},
          { id: 'busqueda', label: '¿Buscador?', opciones: [
            { id: 'nativo',  label: 'Nativo · keyword match',             add: 5000 },
            { id: 'algolia', label: 'Algolia · instant + sugerencias',    add: 17500 },
          ]},
          { id: 'versionado', label: '¿Versionado?', opciones: [
            { id: 'no',  label: 'No · versión única',                     add: 0 },
            { id: 'rama', label: 'Sí · ramas por versión (v1/v2)',        add: 12500 },
            { id: 'git',  label: 'Sí · git-backed · histórico completo',  add: 27500 },
          ]},
          { id: 'feedback', label: '¿Feedback en docs?', multi: true, opciones: [
            { id: 'util',     label: '¿Te fue útil? thumbs up/down',      add: 2500 },
            { id: 'comments', label: 'Comentarios por sección',           add: 7500 },
            { id: 'edits',    label: 'Suggest edits · contributor flow',  add: 17500, flag: 'auth-or-api' },
          ]},
        ],
        'multi-idioma-serio': [
          { id: 'idiomas', label: '¿Cuántos idiomas?', opciones: [
            { id: 'tres',  label: '3 idiomas',                            add: 22500 },
            { id: 'cinco', label: '4-5 idiomas',                          add: 47500 },
            { id: 'siete', label: '6+ idiomas',                           add: 85000 },
          ]},
          { id: 'cms-multi', label: '¿CMS multilingüe?', opciones: [
            { id: 'sanity', label: 'Sanity · estructurado',              add: 27500 },
            { id: 'strapi', label: 'Strapi · open-source',                add: 32500 },
            { id: 'wpml',   label: 'WordPress + WPML',                    add: 17500 },
          ]},
          { id: 'auto-trans', label: '¿Auto-traducción IA?', opciones: [
            { id: 'no',     label: 'No · sólo traductor humano',          add: 0 },
            { id: 'gpt',    label: 'Sí · GPT/DeepL como draft',           add: 12500 },
            { id: 'edit',   label: 'Sí · auto + editor humano review',    add: 25000 },
          ]},
          { id: 'localizacion', label: '¿Localización avanzada?', multi: true, opciones: [
            { id: 'monedas',  label: 'Monedas por país',                  add: 7500 },
            { id: 'fechas',   label: 'Formatos de fecha por locale',      add: 2500 },
            { id: 'imagenes', label: 'Imágenes regionalizadas',           add: 10000 },
            { id: 'contenido', label: 'Contenido específico por mercado', add: 17500 },
          ]},
          { id: 'seo-multi', label: '¿SEO multi-idioma?', opciones: [
            { id: 'basico',    label: 'Básico · hreflang + sitemap',      add: 5000 },
            { id: 'avanzado',  label: 'Avanzado · keyword research por mercado', add: 22500 },
          ]},
        ],
        'editorial-story': [
          { id: 'piezas', label: '¿Cuántas piezas long-form?', opciones: [
            { id: 'pocas',   label: 'Pocas · 3-8 piezas',                 add: 0 },
            { id: 'medio',   label: 'Medio · 9-20 piezas',                add: 15000 },
            { id: 'mucho',   label: 'Mucho · 20+ piezas',                 add: 35000 },
          ]},
          { id: 'scroll-anim', label: '¿Nivel de animaciones scroll?', opciones: [
            { id: 'sutil',    label: 'Sutil · fade + parallax básico',    add: 7500 },
            { id: 'medio',    label: 'Medio · pin + reveals secuenciales', add: 17500 },
            { id: 'gsap',     label: 'Avanzado · GSAP timelines complejos', add: 37500, flag: 'animacion-pro' },
          ]},
          { id: 'media-rich', label: '¿Media embebida?', multi: true, opciones: [
            { id: 'video-inline', label: 'Video inline · loop autoplay',  add: 5000 },
            { id: 'audio',        label: 'Audio · narración por sección', add: 12500 },
            { id: 'data-viz',     label: 'Visualizaciones de datos',      add: 22500 },
            { id: 'interactive',  label: 'Componentes interactivos',      add: 25000 },
          ]},
          { id: 'reading-flow', label: '¿UX de lectura?', opciones: [
            { id: 'basico',    label: 'Básico · texto + media',           add: 0 },
            { id: 'progress',  label: 'Con progress bar + estimated time', add: 5000 },
            { id: 'chapters',  label: 'Chapters · nav lateral activa',    add: 12500 },
          ]},
          { id: 'share', label: '¿Compartir?', multi: true, opciones: [
            { id: 'social',    label: 'Botones sociales',                 add: 1500 },
            { id: 'quote',     label: 'Click-to-tweet por quote',         add: 3500 },
            { id: 'image-card', label: 'Generate share card por sección', add: 8500 },
          ]},
        ],
      },
      shared: [
        { id: 'idiomas-base', label: '¿Idiomas base del sitio?', help: 'Para sitios serios multi-idioma, considera el tipo "multi-idioma serio". Aquí es para casos simples.', opciones: [
          { id: 'uno',   label: 'Un solo idioma',                         add: 0 },
          { id: 'dos',   label: 'Dos idiomas',                            add: 27500 },
        ]},
        { id: 'acabado', label: '¿Acabado del diseño?', opciones: [
          { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
          { id: 'balance',   label: 'Balance · calidad/precio óptimo',       mul: 1.0 },
          { id: 'premium',   label: 'Premium · animaciones + pulido máximo', mul: 1.35, flag: 'animacion-pro' },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    // ─── APPS · 1 set compartido aplicado a los 5 servicios ──
    // El precio base ya refleja la complejidad de la plataforma elegida
    // (PWA $45k → ambas $162.5k). Las preguntas byType son idénticas porque
    // ramifican la INTENCIÓN de la app, no la plataforma técnica.
    'app-pwa':     'APP_SUBFLOW_V9_MARKER',
    'app-android': 'APP_SUBFLOW_V9_MARKER',
    'app-ios':     'APP_SUBFLOW_V9_MARKER',
    'app-ambas':   'APP_SUBFLOW_V9_MARKER',
    'app-desktop': 'APP_SUBFLOW_V9_MARKER',

    // ─── ECOMMERCE · 1 set compartido aplicado a los 4 servicios ──
    // Igual lógica: precio base refleja la plataforma (ec-mini $20k →
    // ec-app $137.5k). Las preguntas byType ramifican TIPO de producto vendido.
    'ec-mini':    'EC_SUBFLOW_V9_MARKER',
    'ec-shopify': 'EC_SUBFLOW_V9_MARKER',
    'ec-tienda':  'EC_SUBFLOW_V9_MARKER',
    'ec-app':     'EC_SUBFLOW_V9_MARKER',

    // ─── PLATAFORMAS & AUTOMATIZACIÓN · 9 servicios distintos ──────
    // Cada servicio tiene sus propios byType (NO compartidos) porque las
    // preguntas que distinguen "chatbot tipo FAQ" de "ERP tipo manufactura"
    // son fundamentalmente distintas.

    'plat-chatbot': {
      byType: {
        'faq': [
          { id: 'volumen', label: '¿Volumen de preguntas?', opciones: [
            { id: 'bajo',  label: 'Bajo · <500/mes',          add: 0 },
            { id: 'medio', label: 'Medio · 500-5000/mes',     add: 5000 },
            { id: 'alto',  label: 'Alto · 5000+/mes',         add: 15000 },
          ]},
          { id: 'fuentes', label: '¿De dónde sale la info?', multi: true, opciones: [
            { id: 'docs',     label: 'Documentos · PDFs/manuales',  add: 5000 },
            { id: 'web',      label: 'Página web · scrape',         add: 7500 },
            { id: 'notion',   label: 'Notion / Confluence',         add: 8500 },
            { id: 'sheets',   label: 'Google Sheets / Excel',       add: 3500 },
          ]},
          { id: 'fallback', label: '¿Fallback a humano?', opciones: [
            { id: 'no',       label: 'No · sólo bot',                add: 0 },
            { id: 'email',    label: 'Sí · escala por email',        add: 3500 },
            { id: 'whatsapp', label: 'Sí · escala a WhatsApp humano', add: 7500 },
            { id: 'live',     label: 'Sí · chat en vivo handoff',    add: 15000 },
          ]},
          { id: 'idiomas', label: '¿Multi-idioma?', opciones: [
            { id: 'es',    label: 'Solo español',                  add: 0 },
            { id: 'es-en', label: 'Español + inglés',              add: 5000 },
            { id: 'multi', label: '3+ idiomas',                    add: 12500 },
          ]},
        ],
        'leads': [
          { id: 'calificacion', label: '¿Pre-calificación?', opciones: [
            { id: 'basico',   label: 'Básico · 3-4 preguntas',         add: 0 },
            { id: 'scoring',  label: 'Scoring · puntuación automática', add: 8500 },
            { id: 'avanzado', label: 'Avanzado · scoring + branching',  add: 17500 },
          ]},
          { id: 'destino', label: '¿A dónde llega el lead?', multi: true, opciones: [
            { id: 'email',    label: 'Email a equipo de ventas',        add: 2500 },
            { id: 'crm',      label: 'CRM · HubSpot/Pipedrive',         add: 10000 },
            { id: 'sheets',   label: 'Google Sheets',                   add: 3500 },
            { id: 'whatsapp', label: 'WhatsApp del vendedor',           add: 5000 },
          ]},
          { id: 'agenda', label: '¿Agenda de cita?', opciones: [
            { id: 'no',       label: 'No · sólo captura',               add: 0 },
            { id: 'simple',   label: 'Sí · link a Calendly',            add: 3500 },
            { id: 'integrado', label: 'Sí · agenda dentro del chatbot', add: 12500 },
          ]},
          { id: 'follow-up', label: '¿Follow-up automático?', opciones: [
            { id: 'no',     label: 'No',                               add: 0 },
            { id: 'email',  label: 'Sí · email a 24h sin respuesta',    add: 5000 },
            { id: 'multi',  label: 'Sí · secuencia 3-5 touches',        add: 12500 },
          ]},
        ],
        'postventa': [
          { id: 'casos', label: '¿Qué tipo de casos atiende?', multi: true, opciones: [
            { id: 'tracking',  label: 'Tracking de envíos',             add: 7500 },
            { id: 'devolucion', label: 'Devoluciones / cambios',        add: 10000 },
            { id: 'factura',    label: 'Facturación',                   add: 5000 },
            { id: 'soporte',    label: 'Soporte técnico básico',        add: 12500 },
          ]},
          { id: 'integracion-tienda', label: '¿Integración con tu tienda?', opciones: [
            { id: 'shopify',   label: 'Shopify · API directa',          add: 12500 },
            { id: 'wooc',      label: 'WooCommerce',                    add: 10000 },
            { id: 'custom',    label: 'Tienda custom · API propia',     add: 22500 },
            { id: 'no',        label: 'No · sólo manual',               add: 0 },
          ]},
          { id: 'sla', label: '¿Tiempo de respuesta esperado?', opciones: [
            { id: 'instantaneo', label: 'Instantáneo · 100% bot',       add: 0 },
            { id: 'humano-2h',   label: 'Humano fallback en 2h',         add: 12500 },
            { id: 'humano-15m',  label: 'Humano fallback en 15 min',     add: 25000 },
          ]},
          { id: 'csat', label: '¿Medir satisfacción?', opciones: [
            { id: 'no',     label: 'No',                                add: 0 },
            { id: 'simple', label: 'Sí · thumbs up/down post-conversación', add: 3500 },
            { id: 'csat',   label: 'Sí · CSAT 1-5 + comentario',        add: 7500 },
          ]},
        ],
        'asistente-ia': [
          { id: 'modelo', label: '¿Modelo de IA?', opciones: [
            { id: 'openai',     label: 'OpenAI · GPT-4 turbo',          add: 0 },
            { id: 'anthropic',  label: 'Anthropic · Claude',            add: 0 },
            { id: 'gemini',     label: 'Google · Gemini',               add: 0 },
            { id: 'local',      label: 'Modelo local · privacidad',     add: 35000 },
          ]},
          { id: 'memoria', label: '¿Memoria de conversación?', opciones: [
            { id: 'no',         label: 'No · cada conversación es nueva', add: 0 },
            { id: 'sesion',     label: 'Sí · dentro de la sesión',       add: 5000 },
            { id: 'persistente', label: 'Sí · persistente por usuario',   add: 17500 },
          ]},
          { id: 'tools', label: '¿Tools/funciones disponibles?', multi: true, opciones: [
            { id: 'search',     label: 'Buscar en tu base de docs',      add: 12500 },
            { id: 'api-call',   label: 'Llamar APIs internas',           add: 17500 },
            { id: 'agenda',     label: 'Agendar citas',                  add: 12500 },
            { id: 'orden',      label: 'Crear órdenes/registros',        add: 22500 },
          ]},
          { id: 'guardrails', label: '¿Reglas y guardrails?', opciones: [
            { id: 'basico',    label: 'Básico · prompt fijo',            add: 5000 },
            { id: 'tematico',  label: 'Sí · temas permitidos/prohibidos', add: 12500 },
            { id: 'compliance', label: 'Sí · compliance + audit log',    add: 27500 },
          ]},
        ],
      },
      shared: [
        { id: 'canales', label: '¿Dónde vive el chatbot?', multi: true, help: 'Cada canal extra suma · puedes elegir múltiples.', opciones: [
          { id: 'web',      label: 'Sitio web · widget',                add: 0 },
          { id: 'whatsapp', label: 'WhatsApp Business',                 add: 7500 },
          { id: 'messenger', label: 'Facebook Messenger',               add: 5000 },
          { id: 'instagram', label: 'Instagram DM',                     add: 5000 },
          { id: 'telegram',  label: 'Telegram',                          add: 5000 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-agenda': {
      byType: {
        '1-a-1': [
          { id: 'duraciones', label: '¿Tipos de cita?', opciones: [
            { id: 'una',  label: '1 duración · 30 min o 1h',           add: 0 },
            { id: 'dos',  label: '2-3 duraciones',                     add: 2500 },
            { id: 'multi', label: '4+ duraciones con precios distintos', add: 6500 },
          ]},
          { id: 'volumen', label: '¿Volumen de citas/mes?', opciones: [
            { id: 'bajo',  label: 'Bajo · <20',                        add: 0 },
            { id: 'medio', label: 'Medio · 20-100',                    add: 3500 },
            { id: 'alto',  label: 'Alto · 100+',                       add: 8500 },
          ]},
          { id: 'buffer', label: '¿Buffer entre citas?', opciones: [
            { id: 'no',     label: 'No · back-to-back OK',             add: 0 },
            { id: 'fijo',   label: 'Sí · buffer fijo',                  add: 1500 },
            { id: 'flex',   label: 'Sí · buffer variable por tipo',     add: 4500 },
          ]},
          { id: 'cancel', label: '¿Política de cancelación?', opciones: [
            { id: 'libre',     label: 'Libre · sin restricciones',     add: 0 },
            { id: 'plazo',     label: 'Sólo hasta X horas antes',      add: 2500 },
            { id: 'penalty',   label: 'Cobra fee por cancelación tardía', add: 5500 },
          ]},
        ],
        'equipo': [
          { id: 'staff', label: '¿Cuántos profesionales?', opciones: [
            { id: 'pocos',  label: 'Pocos · 2-5',                       add: 5000 },
            { id: 'medio',  label: 'Medio · 6-15',                      add: 12500 },
            { id: 'grande', label: 'Grande · 16+',                      add: 27500 },
          ]},
          { id: 'routing', label: '¿Cómo se asigna?', opciones: [
            { id: 'eligible', label: 'Cliente elige profesional',       add: 0 },
            { id: 'auto',     label: 'Auto · round-robin',              add: 5000 },
            { id: 'skill',    label: 'Auto · por skill/disponibilidad', add: 12500 },
          ]},
          { id: 'compartido', label: '¿Calendario compartido?', opciones: [
            { id: 'no',       label: 'No · cada uno el suyo',            add: 0 },
            { id: 'admin',    label: 'Sí · admin ve todo',                add: 5000 },
            { id: 'cross',    label: 'Sí · cross-staff visible',          add: 10000 },
          ]},
          { id: 'permisos', label: '¿Permisos por staff?', opciones: [
            { id: 'iguales',   label: 'Todos iguales',                   add: 0 },
            { id: 'roles',     label: 'Roles · admin/staff/lectura',     add: 7500 },
          ]},
        ],
        'multi-sede': [
          { id: 'sedes', label: '¿Cuántas sedes?', opciones: [
            { id: 'pocas',  label: 'Pocas · 2-5',                       add: 10000 },
            { id: 'medio',  label: 'Medio · 6-15',                      add: 22500 },
            { id: 'multi',  label: 'Multi · 16+',                       add: 45000 },
          ]},
          { id: 'staff-por-sede', label: '¿Staff por sede?', opciones: [
            { id: 'fijo',     label: 'Staff fijo por sede',              add: 0 },
            { id: 'rotativo', label: 'Staff rotativo entre sedes',       add: 10000 },
          ]},
          { id: 'inventario', label: '¿Recursos por sede (salas/equipos)?', opciones: [
            { id: 'no',       label: 'No · sólo staff',                  add: 0 },
            { id: 'salas',    label: 'Sí · salas/cubículos',             add: 7500 },
            { id: 'equipos',  label: 'Sí · salas + equipos especializados', add: 17500 },
          ]},
          { id: 'reportes-sede', label: '¿Reportes por sede?', opciones: [
            { id: 'no',       label: 'No · agregado total',              add: 0 },
            { id: 'basico',   label: 'Sí · ocupación por sede',          add: 5000 },
            { id: 'completo', label: 'Sí · revenue + utilización + staff', add: 15000 },
          ]},
        ],
        'con-pagos': [
          { id: 'pasarela', label: '¿Pasarela de pago?', opciones: [
            { id: 'stripe',     label: 'Stripe · tarjeta',                add: 7500 },
            { id: 'mercadopago', label: 'Mercado Pago · LATAM',           add: 7500 },
            { id: 'multi',      label: 'Multi · Stripe + MP + PayPal',    add: 15000 },
          ]},
          { id: 'momento', label: '¿Cuándo cobra?', opciones: [
            { id: 'reserva',  label: 'Al reservar · 100%',               add: 0 },
            { id: 'anticipo', label: 'Al reservar · anticipo + resto post-cita', add: 5000 },
            { id: 'post',     label: 'Post-cita · habilitas cobro luego',  add: 2500 },
          ]},
          { id: 'cancel-refund', label: '¿Política de reembolso?', opciones: [
            { id: 'no-refund', label: 'No-refund',                       add: 0 },
            { id: 'plazo',     label: 'Refund automático si cancela con X horas', add: 5000 },
            { id: 'manual',    label: 'Refund manual · revisión caso a caso', add: 7500 },
          ]},
          { id: 'facturacion', label: '¿Facturación CFDI?', opciones: [
            { id: 'no',       label: 'No · sólo recibo',                  add: 0 },
            { id: 'manual',   label: 'Sí · manual por staff',             add: 5000 },
            { id: 'auto',     label: 'Sí · automática post-pago',         add: 17500 },
          ]},
        ],
      },
      shared: [
        { id: 'recordatorios', label: '¿Recordatorios?', multi: true, opciones: [
          { id: 'email',    label: 'Email · 24h y 1h antes',             add: 1500 },
          { id: 'sms',      label: 'SMS · 1h antes',                     add: 3500 },
          { id: 'whatsapp', label: 'WhatsApp · 1h antes',                 add: 5000 },
        ]},
        { id: 'sync', label: '¿Sincronización con calendarios?', multi: true, opciones: [
          { id: 'google',  label: 'Google Calendar',                     add: 3500 },
          { id: 'outlook', label: 'Outlook / Microsoft 365',             add: 3500 },
          { id: 'ical',    label: 'iCal (Apple)',                        add: 2500 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-integraciones': {
      byType: {
        '2-sistemas': [
          { id: 'sistemas', label: '¿Qué sistemas conectas?', multi: true, opciones: [
            { id: 'crm',     label: 'CRM (HubSpot/Salesforce)',           add: 0 },
            { id: 'erp',     label: 'ERP (SAP/NetSuite)',                 add: 10000 },
            { id: 'ecommerce', label: 'Ecommerce (Shopify/WooC)',         add: 0 },
            { id: 'contab',  label: 'Contabilidad (CONTPAQi/Aspel)',      add: 7500 },
            { id: 'google',  label: 'Google Workspace · Sheets/Drive',    add: 0 },
            { id: 'otro',    label: 'Sistema propio · API REST',          add: 5000 },
          ]},
          { id: 'direccion', label: '¿Dirección del flujo?', opciones: [
            { id: 'una',  label: 'A → B · una dirección',                 add: 0 },
            { id: 'bi',   label: 'A ↔ B · bidireccional',                 add: 7500 },
          ]},
          { id: 'frecuencia', label: '¿Frecuencia?', opciones: [
            { id: 'manual', label: 'Manual · trigger por usuario',         add: 0 },
            { id: 'hora',   label: 'Cada hora',                            add: 2500 },
            { id: 'minuto', label: 'Cada minuto',                          add: 5000 },
            { id: 'real',   label: 'Tiempo real · webhook',                add: 10000 },
          ]},
          { id: 'transformacion', label: '¿Transformación de datos?', opciones: [
            { id: 'no',      label: 'No · pasa tal cual',                 add: 0 },
            { id: 'mapping', label: 'Mapping de campos',                   add: 3500 },
            { id: 'logica',  label: 'Lógica condicional · reglas',         add: 12500 },
          ]},
        ],
        'hub-multi': [
          { id: 'cantidad', label: '¿Cuántos sistemas?', opciones: [
            { id: 'tres',   label: '3 sistemas',                          add: 5000 },
            { id: 'cinco',  label: '4-5 sistemas',                        add: 12500 },
            { id: 'multi',  label: '6+ sistemas',                         add: 27500 },
          ]},
          { id: 'orquestacion', label: '¿Cómo orquesta el hub?', opciones: [
            { id: 'star',     label: 'Star · hub central · cada sistema una ruta', add: 0 },
            { id: 'pipeline', label: 'Pipeline · ramas y branches',       add: 12500 },
            { id: 'event-bus', label: 'Event bus · pub/sub',              add: 27500 },
          ]},
          { id: 'monitoring', label: '¿Monitoreo?', opciones: [
            { id: 'logs',     label: 'Logs básicos',                       add: 2500 },
            { id: 'dashboard', label: 'Dashboard de salud + alertas',      add: 12500 },
            { id: 'oncall',    label: 'Dashboard + on-call WhatsApp 24/7', add: 27500 },
          ]},
          { id: 'reintentos', label: '¿Política de reintentos?', opciones: [
            { id: 'manual', label: 'Manual',                              add: 0 },
            { id: 'simple', label: 'Auto · 3 reintentos exponencial',     add: 5000 },
            { id: 'queue',  label: 'Auto · dead letter queue',            add: 12500 },
          ]},
        ],
        'etl-batch': [
          { id: 'volumen', label: '¿Volumen por batch?', opciones: [
            { id: 'chico',  label: 'Chico · <10k registros',              add: 0 },
            { id: 'medio',  label: 'Medio · 10k-100k',                    add: 7500 },
            { id: 'grande', label: 'Grande · 100k-1M',                    add: 17500 },
            { id: 'big',    label: 'Big · 1M+',                           add: 37500 },
          ]},
          { id: 'frecuencia-batch', label: '¿Cuándo corre?', opciones: [
            { id: 'diario',   label: 'Diario · nocturno',                  add: 0 },
            { id: 'horario',  label: 'Cada hora',                          add: 5000 },
            { id: 'on-demand', label: 'On-demand · trigger manual',        add: 3500 },
          ]},
          { id: 'destino', label: '¿Destino del ETL?', opciones: [
            { id: 'db',         label: 'Base de datos · Postgres/MySQL',  add: 5000 },
            { id: 'warehouse',  label: 'Data warehouse · BigQuery/Snowflake', add: 17500 },
            { id: 'lake',       label: 'Data lake · S3/GCS',              add: 12500 },
          ]},
          { id: 'validacion', label: '¿Validación de calidad?', opciones: [
            { id: 'basica',    label: 'Básica · counts + duplicados',     add: 2500 },
            { id: 'reglas',    label: 'Reglas custom de validación',       add: 10000 },
            { id: 'reconciliacion', label: 'Reconciliación con sistema fuente', add: 17500 },
          ]},
        ],
        'tiempo-real': [
          { id: 'latencia', label: '¿Latencia objetivo?', opciones: [
            { id: 'segundos', label: '<5 segundos',                       add: 0 },
            { id: 'sub-seg',  label: '<1 segundo',                        add: 12500 },
            { id: 'milisec',  label: '<100ms · ultra low',                add: 27500 },
          ]},
          { id: 'volumen-rt', label: '¿Eventos por segundo?', opciones: [
            { id: 'bajo',  label: 'Bajo · <100/s',                        add: 0 },
            { id: 'medio', label: 'Medio · 100-1k/s',                     add: 10000 },
            { id: 'alto',  label: 'Alto · 1k+/s',                         add: 22500 },
          ]},
          { id: 'transporte', label: '¿Tecnología de transporte?', opciones: [
            { id: 'webhook',   label: 'Webhooks HTTP',                    add: 0 },
            { id: 'pubsub',    label: 'Pub/sub · Google Pub/Sub o SNS',   add: 10000 },
            { id: 'kafka',     label: 'Kafka · streams',                  add: 22500 },
          ]},
          { id: 'fallback-rt', label: '¿Fallback si falla destino?', opciones: [
            { id: 'reintento',  label: 'Reintento exponencial',           add: 2500 },
            { id: 'queue',      label: 'Queue + retry · garantía at-least-once', add: 10000 },
            { id: 'exactly',    label: 'Exactly-once · idempotencia',     add: 22500 },
          ]},
        ],
      },
      shared: [
        { id: 'auth', label: '¿Autenticación entre sistemas?', opciones: [
          { id: 'api-key',  label: 'API keys',                            add: 0 },
          { id: 'oauth',    label: 'OAuth 2.0',                            add: 5000 },
          { id: 'mtls',     label: 'mTLS · certificados',                  add: 12500 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-procesos': {
      byType: {
        'aprobaciones': [
          { id: 'tipo-aprob', label: '¿Qué se aprueba?', multi: true, opciones: [
            { id: 'gastos',    label: 'Gastos / requisiciones',           add: 0 },
            { id: 'vacaciones', label: 'Vacaciones / permisos',           add: 5000 },
            { id: 'contratos', label: 'Contratos',                        add: 10000 },
            { id: 'compras',   label: 'Órdenes de compra',                add: 7500 },
            { id: 'otro',      label: 'Otro · custom',                    add: 5000 },
          ]},
          { id: 'niveles', label: '¿Niveles de aprobación?', opciones: [
            { id: 'uno',  label: '1 nivel · jefe directo',                add: 0 },
            { id: 'dos',  label: '2 niveles · jefe + área',               add: 5000 },
            { id: 'multi', label: '3+ niveles · matriz por monto',        add: 12500 },
          ]},
          { id: 'condicional', label: '¿Reglas condicionales?', opciones: [
            { id: 'no',     label: 'No · flujo lineal fijo',              add: 0 },
            { id: 'monto',  label: 'Sí · escala según monto',             add: 7500 },
            { id: 'multi',  label: 'Sí · multi-variable (monto+tipo+area)', add: 17500 },
          ]},
          { id: 'audit', label: '¿Audit log?', opciones: [
            { id: 'simple', label: 'Simple · quién aprobó y cuándo',      add: 2500 },
            { id: 'completo', label: 'Completo · diff + comentarios + adjuntos', add: 10000 },
          ]},
        ],
        'reportes': [
          { id: 'cantidad', label: '¿Cuántos reportes?', opciones: [
            { id: 'pocos',  label: '1-3 reportes',                        add: 0 },
            { id: 'medio',  label: '4-10 reportes',                       add: 7500 },
            { id: 'multi',  label: '11+ reportes',                        add: 17500 },
          ]},
          { id: 'frecuencia-rep', label: '¿Frecuencia?', opciones: [
            { id: 'mensual',  label: 'Mensual',                           add: 0 },
            { id: 'semanal',  label: 'Semanal',                           add: 2500 },
            { id: 'diario',   label: 'Diario',                            add: 5000 },
            { id: 'on-demand', label: 'On-demand · usuario gatilla',      add: 3500 },
          ]},
          { id: 'fuentes-rep', label: '¿Fuentes de datos?', multi: true, opciones: [
            { id: 'db',       label: 'Base de datos interna',             add: 0 },
            { id: 'sheets',   label: 'Google Sheets / Excel',             add: 3500 },
            { id: 'apis',     label: 'APIs externas (ads/analytics)',     add: 10000 },
            { id: 'warehouse', label: 'Data warehouse',                   add: 7500 },
          ]},
          { id: 'distribucion', label: '¿Cómo se distribuye?', multi: true, opciones: [
            { id: 'email',    label: 'Email PDF/Excel',                    add: 1500 },
            { id: 'dashboard', label: 'Dashboard web visible',             add: 7500 },
            { id: 'slack',     label: 'Slack/Teams · canal',               add: 3500 },
            { id: 'drive',     label: 'Google Drive · carpeta',            add: 2500 },
          ]},
        ],
        'extraccion': [
          { id: 'fuente', label: '¿De dónde extraes?', opciones: [
            { id: 'pdfs',     label: 'PDFs · facturas/contratos',         add: 12500 },
            { id: 'emails',   label: 'Emails · texto + adjuntos',         add: 10000 },
            { id: 'forms',    label: 'Forms web · captura estructurada',  add: 5000 },
            { id: 'imagenes', label: 'Imágenes · OCR',                    add: 17500 },
          ]},
          { id: 'volumen-ext', label: '¿Volumen?', opciones: [
            { id: 'bajo',  label: 'Bajo · <100/mes',                      add: 0 },
            { id: 'medio', label: 'Medio · 100-1000/mes',                 add: 7500 },
            { id: 'alto',  label: 'Alto · 1000+/mes',                     add: 17500 },
          ]},
          { id: 'precision', label: '¿Nivel de precisión?', opciones: [
            { id: 'best',  label: 'Best-effort · 80%+ OK',                add: 0 },
            { id: 'alta',  label: 'Alta · 95%+ con validación humana',    add: 12500 },
            { id: 'critica', label: 'Crítica · 99%+ · double-check',      add: 27500 },
          ]},
          { id: 'destino-ext', label: '¿Dónde van los datos?', opciones: [
            { id: 'sheets',  label: 'Google Sheets',                      add: 2500 },
            { id: 'db',      label: 'Base de datos',                      add: 5000 },
            { id: 'erp',     label: 'ERP existente',                       add: 12500 },
            { id: 'crm',     label: 'CRM',                                add: 7500 },
          ]},
        ],
        'multi-paso': [
          { id: 'pasos', label: '¿Cuántos pasos en el workflow?', opciones: [
            { id: 'pocos',  label: 'Pocos · 3-5 pasos',                   add: 0 },
            { id: 'medio',  label: 'Medio · 6-12 pasos',                  add: 12500 },
            { id: 'multi',  label: 'Multi · 13+ pasos',                   add: 27500 },
          ]},
          { id: 'branches', label: '¿Branches condicionales?', opciones: [
            { id: 'no',     label: 'No · workflow lineal',                add: 0 },
            { id: 'pocas',  label: 'Pocas · 2-3 ramas',                   add: 7500 },
            { id: 'muchas', label: 'Muchas · árbol de decisiones',        add: 22500 },
          ]},
          { id: 'humanos', label: '¿Pasos con humano-en-loop?', opciones: [
            { id: 'no',     label: 'No · 100% automático',                add: 0 },
            { id: 'simple', label: 'Sí · 1-2 puntos de revisión humana',  add: 5000 },
            { id: 'multi',  label: 'Sí · múltiples revisiones',           add: 12500 },
          ]},
          { id: 'errores', label: '¿Manejo de errores?', opciones: [
            { id: 'log',     label: 'Log · revisión manual',              add: 0 },
            { id: 'retry',   label: 'Auto-retry · 3 intentos',            add: 5000 },
            { id: 'rollback', label: 'Auto-retry + rollback parcial',     add: 15000 },
          ]},
        ],
      },
      shared: [
        { id: 'usuarios', label: '¿Cuántos usuarios?', opciones: [
          { id: 'micro', label: '1-5',                                    add: 0 },
          { id: 'pyme',  label: '6-25',                                   add: 5000 },
          { id: 'media', label: '26-100',                                 add: 15000 },
          { id: 'enterp', label: '100+',                                  add: 35000 },
        ]},
        { id: 'plataforma-proc', label: '¿Stack?', opciones: [
          { id: 'nocode', label: 'No-code · Zapier/Make/n8n', mul: 0.7 },
          { id: 'low',    label: 'Low-code · Retool/Internal', mul: 0.85 },
          { id: 'medida', label: 'A la medida · código propio', mul: 1.0 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-asesoria': {
      byType: {
        'estrategia': [
          { id: 'alcance', label: '¿Alcance de la consultoría?', opciones: [
            { id: 'sesion',   label: '1 sesión · 1h',                     add: 0 },
            { id: 'taller',   label: 'Taller · 4h con tu equipo',         add: 5000 },
            { id: 'sprint',   label: 'Sprint · 2 días intensivos',        add: 17500 },
            { id: 'retainer', label: 'Retainer · 3 meses · 4 sesiones/mes', add: 47500 },
          ]},
          { id: 'foco', label: '¿Foco principal?', multi: true, opciones: [
            { id: 'roadmap',  label: 'Roadmap tech a 12 meses',           add: 2500 },
            { id: 'stack',    label: 'Decisiones de stack',               add: 1500 },
            { id: 'arquitectura', label: 'Arquitectura de sistemas',      add: 3500 },
            { id: 'equipo',   label: 'Cómo armar/escalar tu equipo tech', add: 2500 },
          ]},
          { id: 'entregables', label: '¿Entregables?', multi: true, opciones: [
            { id: 'memo',     label: 'Memo escrito · 5-10 págs',          add: 2500 },
            { id: 'deck',     label: 'Deck de presentación',              add: 3500 },
            { id: 'roadmap-doc', label: 'Roadmap document detallado',      add: 5000 },
            { id: 'workshop',  label: 'Workshop con tu equipo',           add: 7500 },
          ]},
        ],
        'ia': [
          { id: 'nivel-equipo', label: '¿Nivel técnico de tu equipo?', opciones: [
            { id: 'cero',     label: 'Cero · no han usado IA',            add: 0 },
            { id: 'basico',   label: 'Básico · ChatGPT diario',           add: 0 },
            { id: 'medio',    label: 'Medio · usan API/Cursor',           add: 1500 },
            { id: 'avanzado', label: 'Avanzado · ya hacen prompts custom', add: 3500 },
          ]},
          { id: 'foco-ia', label: '¿Foco?', multi: true, opciones: [
            { id: 'productividad', label: 'Productividad diaria',         add: 1500 },
            { id: 'producto',      label: 'IA en tu producto',            add: 3500 },
            { id: 'agentes',       label: 'Agentes autónomos',            add: 5000 },
            { id: 'rag',           label: 'RAG · IA con tu data',         add: 5000 },
          ]},
          { id: 'modalidad-ia', label: '¿Modalidad?', opciones: [
            { id: 'demo',     label: 'Demo · 1.5h hands-on',              add: 2500 },
            { id: 'taller',   label: 'Taller · 4h con casos reales',      add: 5000 },
            { id: 'inmersion', label: 'Inmersión · 2 días con tu equipo', add: 17500 },
          ]},
        ],
        'ecommerce': [
          { id: 'etapa', label: '¿Etapa de tu tienda?', opciones: [
            { id: 'cero',   label: 'Cero · no he lanzado',                add: 0 },
            { id: 'lanzado', label: 'Lanzada · 0-$50k/mes',                add: 0 },
            { id: 'creci',   label: 'Creciendo · $50k-$500k/mes',          add: 2500 },
            { id: 'escala',  label: 'Escala · $500k+/mes',                 add: 5000 },
          ]},
          { id: 'foco-ec', label: '¿Foco?', multi: true, opciones: [
            { id: 'funnels',   label: 'Funnels de conversión',            add: 2500 },
            { id: 'ads',       label: 'Estrategia de ads',                add: 3500 },
            { id: 'logistica', label: 'Logística / fulfillment',          add: 1500 },
            { id: 'retencion', label: 'Retención · email/CRM',            add: 2500 },
            { id: 'unit',      label: 'Unit economics',                   add: 3500 },
          ]},
          { id: 'modalidad-ec', label: '¿Modalidad?', opciones: [
            { id: 'audit',    label: 'Auditoría · 1.5h + memo',           add: 2500 },
            { id: 'taller',   label: 'Taller · 4h con tu equipo',         add: 5000 },
            { id: 'sprint',   label: 'Sprint · 2 días',                   add: 15000 },
          ]},
        ],
        'formacion-equipo': [
          { id: 'tamano-equipo', label: '¿Tamaño del equipo a capacitar?', opciones: [
            { id: 'chico',  label: 'Chico · 1-5 personas',                add: 0 },
            { id: 'medio',  label: 'Medio · 6-15 personas',               add: 2500 },
            { id: 'grande', label: 'Grande · 16+ personas',               add: 7500 },
          ]},
          { id: 'tema-form', label: '¿Tema?', multi: true, opciones: [
            { id: 'js',       label: 'JavaScript / TypeScript',           add: 0 },
            { id: 'react',    label: 'React / Next.js',                   add: 0 },
            { id: 'node',     label: 'Node.js · backend',                 add: 0 },
            { id: 'db',       label: 'Bases de datos · SQL',              add: 0 },
            { id: 'cloud',    label: 'Cloud (AWS/GCP)',                   add: 1500 },
            { id: 'devops',   label: 'DevOps / CI-CD',                    add: 1500 },
            { id: 'ia',       label: 'IA y prompts',                      add: 1500 },
            { id: 'producto', label: 'Producto / discovery',              add: 0 },
          ]},
          { id: 'formato-form', label: '¿Formato?', opciones: [
            { id: 'sesion',  label: 'Sesión única · 2h',                  add: 0 },
            { id: 'curso',   label: 'Curso · 4 sesiones × 2h',            add: 7500 },
            { id: 'bootcamp', label: 'Bootcamp · 5 días intensivos',      add: 25000 },
          ]},
        ],
      },
      shared: [
        { id: 'modalidad-presencia', label: '¿Presencial o remoto?', opciones: [
          { id: 'remoto',   label: 'Remoto · Zoom/Meet',                 add: 0 },
          { id: 'gdl',      label: 'Presencial · Guadalajara',           add: 1500 },
          { id: 'mx',       label: 'Presencial · CDMX/MTY/cualquier MX', add: 4500 },
        ]},
        { id: 'plazo', label: '¿Cuándo lo necesitas?', opciones: [
          { id: 'flexible', label: 'Flexible · próximas semanas',         mul: 0.95 },
          { id: 'normal',   label: 'Normal · 1-2 semanas',                mul: 1.0 },
          { id: 'express',  label: 'Express · esta semana',               mul: 1.5 },
        ]},
      ],
    },

    'plat-crm': {
      byType: {
        'ventas': [
          { id: 'pipeline', label: '¿Etapas del pipeline?', opciones: [
            { id: 'simple',  label: '3-5 etapas · estándar',              add: 0 },
            { id: 'medio',   label: '6-10 etapas · con sub-etapas',       add: 7500 },
            { id: 'multi',   label: 'Múltiples pipelines por equipo/producto', add: 17500 },
          ]},
          { id: 'forecasting', label: '¿Forecasting?', opciones: [
            { id: 'no',         label: 'No',                              add: 0 },
            { id: 'simple',     label: 'Sí · weighted pipeline',          add: 7500 },
            { id: 'avanzado',   label: 'Sí · con ML predictivo',          add: 27500 },
          ]},
          { id: 'comisiones', label: '¿Comisiones?', opciones: [
            { id: 'no',     label: 'No',                                  add: 0 },
            { id: 'flat',   label: 'Sí · % flat sobre venta',             add: 5000 },
            { id: 'tiers',  label: 'Sí · tiers + bonos',                  add: 12500 },
            { id: 'multi',  label: 'Sí · multi-variable (volumen+margen+tipo)', add: 22500 },
          ]},
          { id: 'actividades', label: '¿Tracking de actividades?', multi: true, opciones: [
            { id: 'calls',    label: 'Llamadas',                          add: 2500 },
            { id: 'emails',   label: 'Emails · sync con Gmail/Outlook',   add: 7500 },
            { id: 'meetings', label: 'Reuniones · sync con Calendar',      add: 5000 },
            { id: 'whatsapp', label: 'Mensajes WhatsApp',                  add: 7500 },
          ]},
        ],
        'atencion-cliente': [
          { id: 'canales-cs', label: '¿Canales de entrada?', multi: true, opciones: [
            { id: 'email',     label: 'Email',                            add: 0 },
            { id: 'whatsapp',  label: 'WhatsApp',                         add: 7500 },
            { id: 'chat-web',  label: 'Chat web',                         add: 5000 },
            { id: 'redes',     label: 'Redes sociales · IG/FB',           add: 5000 },
            { id: 'tel',       label: 'Teléfono · logging manual',        add: 2500 },
          ]},
          { id: 'sla', label: '¿SLA?', opciones: [
            { id: 'no',       label: 'No · best-effort',                  add: 0 },
            { id: 'basico',   label: 'Sí · 1 tier · respuesta en Xh',     add: 5000 },
            { id: 'multi',    label: 'Sí · multi-tier por prioridad',     add: 15000 },
          ]},
          { id: 'kb', label: '¿Base de conocimiento?', opciones: [
            { id: 'no',     label: 'No',                                  add: 0 },
            { id: 'simple', label: 'Sí · interna para staff',             add: 7500 },
            { id: 'public', label: 'Sí · pública con búsqueda',           add: 17500 },
          ]},
          { id: 'csat-cs', label: '¿Encuestas CSAT?', opciones: [
            { id: 'no',      label: 'No',                                 add: 0 },
            { id: 'auto',    label: 'Sí · auto post-resolución',          add: 5000 },
            { id: 'nps',     label: 'Sí · CSAT + NPS trimestral',         add: 10000 },
          ]},
        ],
        'inmobiliaria': [
          { id: 'propiedades', label: '¿Inventario de propiedades?', opciones: [
            { id: 'chico',   label: 'Chico · <100 props',                 add: 0 },
            { id: 'medio',   label: 'Medio · 100-1000',                   add: 12500 },
            { id: 'grande',  label: 'Grande · 1000+',                     add: 32500 },
          ]},
          { id: 'matching', label: '¿Matching cliente-propiedad?', opciones: [
            { id: 'manual',  label: 'Manual',                             add: 0 },
            { id: 'reglas',  label: 'Auto · reglas (precio/zona/recámaras)', add: 10000 },
            { id: 'ml',      label: 'Auto · ML · comportamiento del lead', add: 27500 },
          ]},
          { id: 'agentes', label: '¿Asignación de agentes?', opciones: [
            { id: 'manual',   label: 'Manual',                            add: 0 },
            { id: 'rr',       label: 'Round-robin',                        add: 5000 },
            { id: 'territorio', label: 'Por territorio/zona',              add: 10000 },
          ]},
          { id: 'documentos', label: '¿Gestión documental?', opciones: [
            { id: 'no',      label: 'No · solo links externos',           add: 0 },
            { id: 'storage', label: 'Sí · storage por propiedad',         add: 7500 },
            { id: 'firma',   label: 'Sí · storage + firma electrónica',   add: 22500 },
          ]},
        ],
        'servicios-profesionales': [
          { id: 'casos', label: '¿Estructura de trabajo?', opciones: [
            { id: 'proyectos', label: 'Proyectos · timeline + entregables', add: 0 },
            { id: 'casos',     label: 'Casos · legal/contable',           add: 5000 },
            { id: 'retainers', label: 'Retainers · horas mensuales',      add: 7500 },
          ]},
          { id: 'horas', label: '¿Tracking de horas?', opciones: [
            { id: 'no',      label: 'No · facturación fija',              add: 0 },
            { id: 'timer',   label: 'Sí · timer integrado',                add: 7500 },
            { id: 'reportes', label: 'Sí · timer + reportes de utilización', add: 17500 },
          ]},
          { id: 'facturacion-sp', label: '¿Facturación?', opciones: [
            { id: 'externa',  label: 'Externa · sin integración',          add: 0 },
            { id: 'manual',   label: 'Generar PDF · enviar manual',        add: 5000 },
            { id: 'cfdi',     label: 'CFDI automática · SAT',              add: 22500 },
          ]},
          { id: 'gastos', label: '¿Gastos por proyecto?', opciones: [
            { id: 'no',     label: 'No',                                  add: 0 },
            { id: 'manual', label: 'Sí · captura manual',                 add: 5000 },
            { id: 'ocr',    label: 'Sí · captura foto recibo + OCR',      add: 17500 },
          ]},
        ],
      },
      shared: [
        { id: 'usuarios-crm', label: '¿Cuántos usuarios?', opciones: [
          { id: 'micro', label: '1-5',                                    add: 0 },
          { id: 'pyme',  label: '6-25',                                   add: 7500 },
          { id: 'media', label: '26-100',                                 add: 22500 },
          { id: 'enterp', label: '100+',                                  add: 50000 },
        ]},
        { id: 'permisos-crm', label: '¿Sistema de permisos?', opciones: [
          { id: 'iguales', label: 'Todos iguales',                        add: 0 },
          { id: 'roles',   label: 'Roles (admin/sales/lectura)',          add: 5000 },
          { id: 'granular', label: 'Granular · permisos por field',        add: 15000 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-saas': {
      byType: {
        'vertical-niche': [
          { id: 'industria', label: '¿Qué industria?', opciones: [
            { id: 'salud',    label: 'Salud',                             add: 5000 },
            { id: 'legal',    label: 'Legal',                             add: 5000 },
            { id: 'inmob',    label: 'Inmobiliaria',                      add: 2500 },
            { id: 'educ',     label: 'Educación',                         add: 0 },
            { id: 'fitness',  label: 'Fitness / wellness',                add: 0 },
            { id: 'otro',     label: 'Otro · custom',                     add: 2500 },
          ]},
          { id: 'funciones-core', label: '¿Funciones core?', multi: true, opciones: [
            { id: 'agenda',   label: 'Agenda / scheduling',               add: 12500 },
            { id: 'pagos',    label: 'Pagos / facturación',                add: 17500 },
            { id: 'crm',      label: 'CRM básico',                         add: 10000 },
            { id: 'reportes', label: 'Reportes / dashboard',              add: 10000 },
            { id: 'mobile',   label: 'App mobile del cliente final',      add: 35000 },
          ]},
          { id: 'compliance', label: '¿Compliance específico?', multi: true, opciones: [
            { id: 'hipaa',    label: 'HIPAA (salud)',                      add: 27500 },
            { id: 'gdpr',     label: 'GDPR (Europa)',                      add: 10000 },
            { id: 'pci',      label: 'PCI DSS (pagos)',                    add: 22500 },
            { id: 'sat',      label: 'CFDI/SAT (México)',                  add: 15000 },
          ]},
        ],
        'horizontal-tool': [
          { id: 'capacidad', label: '¿Qué capacidad central?', opciones: [
            { id: 'productividad', label: 'Productividad · tasks/notes/docs', add: 0 },
            { id: 'colaboracion',  label: 'Colaboración · chat/whiteboard',    add: 7500 },
            { id: 'datos',         label: 'Datos / analytics',                 add: 12500 },
            { id: 'automation',    label: 'Automatización / workflows',        add: 17500 },
          ]},
          { id: 'integraciones-saas', label: '¿Integraciones de día 1?', opciones: [
            { id: 'pocas',  label: 'Pocas · 3-5 (Slack/Google/MS365)',    add: 7500 },
            { id: 'medio',  label: 'Medio · 10-15',                      add: 22500 },
            { id: 'multi',  label: 'Multi · 20+ (marketplace)',          add: 50000 },
          ]},
          { id: 'colaboracion-multi', label: '¿Multi-usuario simultáneo?', opciones: [
            { id: 'no',     label: 'No · 1 usuario por sesión',           add: 0 },
            { id: 'comments', label: 'Sí · comentarios async',            add: 5000 },
            { id: 'realtime', label: 'Sí · realtime · presencia + cursores', add: 32500 },
          ]},
        ],
        'marketplace': [
          { id: 'sides', label: '¿Tipo de marketplace?', opciones: [
            { id: 'p2p',     label: 'P2P · usuario↔usuario',              add: 0 },
            { id: 'b2c',     label: 'B2C · vendedores verificados ↔ consumidor', add: 5000 },
            { id: 'b2b',     label: 'B2B · empresas ↔ empresas',          add: 12500 },
          ]},
          { id: 'inventario-mp', label: '¿Inventario?', opciones: [
            { id: 'servicios', label: 'Servicios · sin stock',            add: 0 },
            { id: 'productos', label: 'Productos · stock por vendedor',   add: 17500 },
            { id: 'mixto',     label: 'Mixto · servicios + productos',    add: 22500 },
          ]},
          { id: 'pagos-mp', label: '¿Modelo de pagos?', opciones: [
            { id: 'directo',  label: 'Directo · vendedor cobra',          add: 0 },
            { id: 'split',    label: 'Split · comisión a plataforma',     add: 22500 },
            { id: 'escrow',   label: 'Escrow · liberación condicionada',  add: 47500 },
          ]},
          { id: 'matching-mp', label: '¿Matching/búsqueda?', opciones: [
            { id: 'basica',  label: 'Búsqueda + filtros',                 add: 5000 },
            { id: 'algolia', label: 'Algolia · instant search',           add: 17500 },
            { id: 'ml',      label: 'ML · recomendaciones personalizadas', add: 37500 },
          ]},
          { id: 'reputacion', label: '¿Sistema de reputación?', multi: true, opciones: [
            { id: 'ratings', label: 'Ratings 1-5',                        add: 5000 },
            { id: 'reviews', label: 'Reviews escritos',                   add: 5000 },
            { id: 'badges',  label: 'Badges / verificaciones',             add: 7500 },
            { id: 'disputas', label: 'Sistema de disputas',                add: 22500 },
          ]},
        ],
        'b2b-internal': [
          { id: 'tipo-cliente', label: '¿Tipo de cliente B2B?', opciones: [
            { id: 'pyme',    label: 'PYMEs · self-serve',                 add: 0 },
            { id: 'media',   label: 'Empresa media · onboarding light',   add: 7500 },
            { id: 'enterp',  label: 'Enterprise · onboarding white-glove', add: 22500 },
          ]},
          { id: 'sso', label: '¿SSO?', opciones: [
            { id: 'no',      label: 'No · email/password',                add: 0 },
            { id: 'google',  label: 'Google Workspace',                   add: 7500 },
            { id: 'sso-multi', label: 'SSO multi (Okta/Azure/Auth0)',     add: 22500 },
          ]},
          { id: 'permisos-saas', label: '¿Sistema de permisos?', opciones: [
            { id: 'simple', label: 'Simple · admin/user',                 add: 0 },
            { id: 'rbac',   label: 'RBAC · roles configurables',          add: 12500 },
            { id: 'abac',   label: 'ABAC · atributos · granular',         add: 32500 },
          ]},
          { id: 'auditoria-saas', label: '¿Audit log?', opciones: [
            { id: 'basico',   label: 'Básico · logins + cambios críticos', add: 5000 },
            { id: 'completo', label: 'Completo · todas las acciones',      add: 17500 },
            { id: 'soc2',     label: 'Completo · SOC 2 ready',             add: 47500 },
          ]},
        ],
      },
      shared: [
        { id: 'billing-saas', label: '¿Modelo de billing?', opciones: [
          { id: 'flat',     label: 'Flat · 1 plan único',                add: 0 },
          { id: 'tiers',    label: 'Tiers · free + pro + enterprise',    add: 17500 },
          { id: 'usage',    label: 'Usage-based · pago por consumo',     add: 27500 },
          { id: 'hybrid',   label: 'Híbrido · tiers + usage',            add: 37500 },
        ]},
        { id: 'multi-tenant-saas', label: '¿Multi-tenant?', opciones: [
          { id: 'no',       label: 'No · single-tenant',                  add: 0 },
          { id: 'shared',   label: 'Shared · 1 DB · tenant_id',           add: 17500 },
          { id: 'isolated', label: 'Isolated · DB por tenant',            add: 47500 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-erp': {
      byType: {
        'manufactura': [
          { id: 'produccion', label: '¿Cómo es tu producción?', opciones: [
            { id: 'discreta',  label: 'Discreta · piezas',                add: 0 },
            { id: 'continua',  label: 'Continua · process/química',       add: 17500 },
            { id: 'mixta',     label: 'Mixta · ambas',                    add: 27500 },
          ]},
          { id: 'bom', label: '¿BOM (lista de materiales)?', opciones: [
            { id: 'simple',  label: 'Simple · 1 nivel',                   add: 7500 },
            { id: 'multi',   label: 'Multi-nivel · sub-ensambles',        add: 22500 },
            { id: 'variant', label: 'Multi-nivel + variantes (color/talla)', add: 42500 },
          ]},
          { id: 'planta', label: '¿Control de planta?', multi: true, opciones: [
            { id: 'wo',       label: 'Work orders',                        add: 17500 },
            { id: 'maquinas', label: 'Asignación de máquinas',             add: 12500 },
            { id: 'turnos',   label: 'Turnos de personal',                 add: 10000 },
            { id: 'calidad',  label: 'Control de calidad · QC',            add: 17500 },
          ]},
          { id: 'mrp', label: '¿MRP (planificación)?', opciones: [
            { id: 'basico',   label: 'Básico · reorder points',            add: 12500 },
            { id: 'avanzado', label: 'Avanzado · forecasting + capacidad', add: 37500 },
          ]},
        ],
        'retail': [
          { id: 'sucursales', label: '¿Cuántas sucursales?', opciones: [
            { id: 'una',    label: '1 sucursal',                          add: 0 },
            { id: 'pocas',  label: '2-5',                                  add: 15000 },
            { id: 'medio',  label: '6-20',                                add: 37500 },
            { id: 'multi',  label: '20+',                                 add: 75000 },
          ]},
          { id: 'pos', label: '¿POS integrado?', opciones: [
            { id: 'externo', label: 'Externo · solo recibe datos',         add: 5000 },
            { id: 'web',     label: 'POS web · navegador',                 add: 22500 },
            { id: 'tablet',  label: 'POS app · iPad/Android',              add: 42500 },
          ]},
          { id: 'inventario-retail', label: '¿Manejo de inventario?', opciones: [
            { id: 'simple',     label: 'Simple · total por SKU',           add: 0 },
            { id: 'por-sucursal', label: 'Por sucursal',                   add: 12500 },
            { id: 'transferencias', label: 'Por sucursal + transferencias', add: 27500 },
          ]},
          { id: 'proveedores', label: '¿Gestión de proveedores?', multi: true, opciones: [
            { id: 'compras',     label: 'Órdenes de compra',               add: 10000 },
            { id: 'recepcion',   label: 'Recepción · merma + devolución',  add: 12500 },
            { id: 'cuentas-x-pagar', label: 'Cuentas por pagar',           add: 12500 },
          ]},
        ],
        'servicios': [
          { id: 'proyectos-erp', label: '¿Estructura de proyectos?', opciones: [
            { id: 'simples', label: 'Simples · 1 nivel',                  add: 0 },
            { id: 'wbs',     label: 'WBS · multi-nivel',                  add: 17500 },
            { id: 'metodo',  label: 'Metodologías (waterfall/agile/scrum)', add: 27500 },
          ]},
          { id: 'recursos', label: '¿Gestión de recursos?', multi: true, opciones: [
            { id: 'horas',    label: 'Timesheet · horas por proyecto',    add: 12500 },
            { id: 'cap',      label: 'Capacidad · planeación a 3 meses',  add: 17500 },
            { id: 'skill',    label: 'Skill matrix · asignación por skill', add: 22500 },
          ]},
          { id: 'facturacion-erp', label: '¿Facturación?', opciones: [
            { id: 'fija',     label: 'Por proyecto · fee fijo',            add: 5000 },
            { id: 'tym',      label: 'Time & materials',                   add: 15000 },
            { id: 'milestone', label: 'Por milestones',                     add: 17500 },
            { id: 'cfdi',     label: 'CFDI integrada · SAT',                add: 22500 },
          ]},
          { id: 'rentabilidad', label: '¿Análisis de rentabilidad?', opciones: [
            { id: 'no',       label: 'No',                                add: 0 },
            { id: 'basico',   label: 'Sí · costo vs ingreso por proyecto', add: 10000 },
            { id: 'avanzado', label: 'Sí · margen + utilización + forecast', add: 27500 },
          ]},
        ],
        'multi-vertical': [
          { id: 'unidades', label: '¿Cuántas unidades de negocio?', opciones: [
            { id: 'dos',   label: '2-3',                                  add: 22500 },
            { id: 'cinco', label: '4-7',                                  add: 47500 },
            { id: 'multi', label: '8+',                                   add: 95000 },
          ]},
          { id: 'consolidacion', label: '¿Consolidación financiera?', opciones: [
            { id: 'manual',     label: 'Manual · exporta a Excel',        add: 0 },
            { id: 'automatica', label: 'Automática · multi-empresa',      add: 32500 },
            { id: 'multi-moneda', label: 'Auto + multi-moneda',           add: 47500 },
          ]},
          { id: 'intercompany', label: '¿Operaciones intercompañía?', opciones: [
            { id: 'no',       label: 'No · cada UN aislada',              add: 0 },
            { id: 'simple',   label: 'Sí · transferencias básicas',       add: 17500 },
            { id: 'avanzado', label: 'Sí · netting + transfer pricing',   add: 47500 },
          ]},
          { id: 'reportes-grupo', label: '¿Reportes consolidados?', opciones: [
            { id: 'basico',   label: 'Básico · P&L + Balance',            add: 7500 },
            { id: 'completo', label: 'Completo · KPIs por UN',            add: 17500 },
            { id: 'bi',       label: 'BI · dashboard ejecutivo',          add: 42500 },
          ]},
        ],
      },
      shared: [
        { id: 'modulos-erp', label: '¿Módulos adicionales?', multi: true, help: 'Marca los que NO están en el tipo de ERP elegido pero quieres incluir.', opciones: [
          { id: 'contab',   label: 'Contabilidad',                       add: 27500 },
          { id: 'rrhh',     label: 'RRHH · nómina',                      add: 42500 },
          { id: 'mkt',      label: 'Marketing · campañas',                add: 17500 },
          { id: 'ventas',   label: 'Ventas / pipeline',                   add: 22500 },
          { id: 'compras',  label: 'Compras / proveedores',               add: 17500 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },

    'plat-blockchain': {
      byType: {
        'token-utility': [
          { id: 'red', label: '¿Red blockchain?', opciones: [
            { id: 'ethereum', label: 'Ethereum · mainnet',                add: 17500 },
            { id: 'polygon',  label: 'Polygon · gas barato',              add: 0 },
            { id: 'arbitrum', label: 'Arbitrum · L2',                     add: 5000 },
            { id: 'solana',   label: 'Solana · alto throughput',          add: 12500 },
            { id: 'bsc',      label: 'BNB Chain',                          add: 0 },
          ]},
          { id: 'supply', label: '¿Supply del token?', opciones: [
            { id: 'fijo',     label: 'Fijo · max supply al deploy',       add: 0 },
            { id: 'mintable', label: 'Mintable · owner puede crear más',  add: 5000 },
            { id: 'algoritmo', label: 'Algorítmico · reglas de emisión',  add: 17500 },
          ]},
          { id: 'caracteristicas', label: '¿Características?', multi: true, opciones: [
            { id: 'burn',      label: 'Burnable',                          add: 2500 },
            { id: 'pause',     label: 'Pausable',                          add: 3500 },
            { id: 'governance', label: 'Governance · voting',              add: 22500 },
            { id: 'staking',   label: 'Staking · rewards',                 add: 32500 },
            { id: 'vesting',   label: 'Vesting · liberación temporizada',  add: 12500 },
          ]},
          { id: 'distribucion', label: '¿Cómo se distribuye?', opciones: [
            { id: 'airdrop', label: 'Airdrop · whitelist',                 add: 7500 },
            { id: 'ico',     label: 'ICO / IDO · presale',                 add: 27500 },
            { id: 'liquidity', label: 'Liquidity pool · DEX',              add: 17500 },
            { id: 'mixto',   label: 'Mixto · varios mecanismos',           add: 37500 },
          ]},
        ],
        'nft-collection': [
          { id: 'estandar-nft', label: '¿Estándar?', opciones: [
            { id: '721',  label: 'ERC-721 · pieza única',                  add: 0 },
            { id: '1155', label: 'ERC-1155 · ediciones múltiples',         add: 7500 },
            { id: 'metaplex', label: 'Metaplex (Solana)',                  add: 5000 },
          ]},
          { id: 'tamano-coleccion', label: '¿Tamaño?', opciones: [
            { id: 'small',   label: 'Pequeña · 100-1000 piezas',           add: 0 },
            { id: 'medio',   label: 'Media · 1k-10k piezas',               add: 12500 },
            { id: 'pfp',     label: 'PFP · 10k+ piezas algorítmicas',      add: 32500 },
          ]},
          { id: 'metadata', label: '¿Metadata storage?', opciones: [
            { id: 'centralizado', label: 'Centralizado · S3/Cloudflare',  add: 0 },
            { id: 'ipfs',         label: 'IPFS · descentralizado',         add: 10000 },
            { id: 'arweave',      label: 'Arweave · permanente onchain',   add: 22500 },
          ]},
          { id: 'mecanica-mint', label: '¿Mecánica de mint?', opciones: [
            { id: 'fcfs',       label: 'FCFS · open public',               add: 5000 },
            { id: 'whitelist',  label: 'Whitelist · presale + public',     add: 17500 },
            { id: 'dutch',      label: 'Dutch auction · precio decreciente', add: 27500 },
          ]},
          { id: 'royalties', label: '¿Royalties?', opciones: [
            { id: 'no',     label: 'No · 0%',                              add: 0 },
            { id: 'flat',   label: 'Flat · %  fijo en cada venta secundaria', add: 7500 },
          ]},
        ],
        'defi-basico': [
          { id: 'producto-defi', label: '¿Qué producto DeFi?', opciones: [
            { id: 'swap',     label: 'Swap · AMM simple',                 add: 32500 },
            { id: 'staking',  label: 'Staking · lock & rewards',          add: 22500 },
            { id: 'lending',  label: 'Lending · borrow/lend pools',       add: 50000 },
            { id: 'vault',    label: 'Vault · yield aggregator',          add: 47500 },
          ]},
          { id: 'tokens-soportados', label: '¿Tokens soportados?', opciones: [
            { id: 'pocos',  label: 'Pocos · 3-5',                         add: 0 },
            { id: 'medio',  label: 'Medio · 10-20',                       add: 12500 },
            { id: 'multi',  label: 'Multi · permissionless',              add: 32500 },
          ]},
          { id: 'fees-defi', label: '¿Estructura de fees?', opciones: [
            { id: 'flat',     label: 'Flat · % fijo por tx',              add: 0 },
            { id: 'tiered',   label: 'Tiered · descuento por volumen',    add: 17500 },
            { id: 'dinamico', label: 'Dinámico · según liquidez',         add: 32500 },
          ]},
          { id: 'governance-defi', label: '¿Governance?', opciones: [
            { id: 'no',       label: 'No · params fijos por owner',       add: 0 },
            { id: 'multisig', label: 'Multisig · 3-5 firmantes',          add: 17500 },
            { id: 'dao',      label: 'DAO · token holders votan',         add: 47500 },
          ]},
        ],
        'smart-contract-biz': [
          { id: 'logica', label: '¿Tipo de lógica?', opciones: [
            { id: 'pagos',      label: 'Pagos automáticos · escrow',      add: 22500 },
            { id: 'royalties',  label: 'Royalties · split automatizado',  add: 17500 },
            { id: 'subscripcion', label: 'Suscripciones onchain',         add: 32500 },
            { id: 'eventos',    label: 'Eventos · ticketing/membresía',   add: 27500 },
            { id: 'custom',     label: 'Custom · lógica B2B específica',  add: 42500 },
          ]},
          { id: 'integracion-offchain', label: '¿Integración off-chain?', opciones: [
            { id: 'no',       label: 'No · 100% onchain',                 add: 0 },
            { id: 'webhook',  label: 'Webhook · backend tradicional',     add: 12500 },
            { id: 'oraculo',  label: 'Oráculo · datos externos onchain',  add: 27500 },
          ]},
          { id: 'gas-management', label: '¿Manejo de gas?', opciones: [
            { id: 'user',     label: 'Usuario paga gas',                  add: 0 },
            { id: 'sponsor',  label: 'Plataforma sponsorea (meta-tx)',    add: 27500 },
            { id: 'optimizado', label: 'Optimización extrema · batch',    add: 17500 },
          ]},
          { id: 'multi-chain', label: '¿Multi-chain?', opciones: [
            { id: 'uno',  label: '1 chain',                               add: 0 },
            { id: 'dos',  label: '2 chains · puente simple',              add: 32500 },
            { id: 'multi', label: '3+ chains',                            add: 75000 },
          ]},
        ],
      },
      shared: [
        { id: 'frontend-bc', label: '¿Frontend?', opciones: [
          { id: 'no',         label: 'Solo contracts · sin UI',            add: 0 },
          { id: 'basico',     label: 'UI básica · conectar wallet + acción', add: 22500 },
          { id: 'completo',   label: 'UI completa · dashboards + analítica', add: 65000 },
        ]},
        { id: 'auditoria-base', label: '¿Auditoría?', opciones: [
          { id: 'interna',  label: 'Solo interna · tests exhaustivos',    add: 0 },
          { id: 'firma',    label: 'Auditoría con firma de auditor',      add: 32500 },
          { id: 'completa', label: 'Auditoría completa + bug bounty',     add: 87500 },
        ]},
        { id: 'plazo', label: '¿Plazo deseado?', opciones: [
          { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
          { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
          { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
        ]},
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADD-ONS GLOBALES · capacidades extra · multi-select al final del subflow
  //   Cada add-on tiene precio fijo (no varía por servicio) y array `aplica`
  //   con los servicioIds donde puede agregarse. Si el servicio elegido no
  //   está en `aplica`, el add-on no se muestra.
  // ═══════════════════════════════════════════════════════════════════
  addOns: [
    {
      id: 'chatbot-basico', label: 'Chatbot básico', icon: 'chatbot',
      summary: 'FAQ automatizado + fallback a humano',
      price: 7500,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda','ec-app',
               'app-pwa','app-android','app-ios','app-ambas',
               'plat-saas','plat-crm'],
    },
    {
      id: 'calendario', label: 'Calendario / agendamiento', icon: 'edit',
      summary: 'Booking embebido · sincroniza con Google/Outlook',
      price: 5000,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda',
               'app-pwa','app-android','app-ios','app-ambas',
               'plat-saas','plat-crm'],
    },
    {
      id: 'pasarela-extra', label: 'Pasarela adicional', icon: 'ecommerce',
      summary: 'Mercado Pago / Stripe / PayPal / SPEI / OXXO · una extra',
      price: 2500,
      aplica: ['web-funnel',
               'ec-mini','ec-shopify','ec-tienda','ec-app',
               'app-pwa','app-android','app-ios','app-ambas',
               'plat-saas'],
    },
    {
      id: 'idioma-extra', label: 'Idioma adicional', icon: 'sitio',
      summary: 'Traducción + UI multilingüe · precio por idioma',
      price: 5000,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda','ec-app',
               'app-pwa','app-android','app-ios','app-ambas',
               'plat-saas','plat-crm','plat-erp'],
    },
    {
      id: 'dark-light', label: 'Dark / Light mode', icon: 'sitio',
      summary: 'Switch de tema + persistencia · auto-detect del SO',
      price: 3500,
      aplica: ['web-sitio',
               'app-pwa','app-android','app-ios','app-ambas','app-desktop',
               'plat-saas','plat-crm','plat-erp'],
    },
    {
      id: 'animaciones-premium', label: 'Animaciones premium', icon: 'star',
      summary: 'Scroll-driven · micro-interacciones · GSAP/Framer Motion',
      price: 7500,
      aplica: ['web-bio','web-landing','web-funnel','web-sitio'],
    },
    {
      id: 'newsletter', label: 'Newsletter / email marketing', icon: 'partnership',
      summary: 'Mailchimp / Klaviyo · forms + automatizaciones básicas',
      price: 5000,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda','ec-app',
               'plat-saas','plat-crm'],
    },
    {
      id: 'whatsapp-business', label: 'WhatsApp Business API', icon: 'chatbot',
      summary: 'Mensajería masiva · templates · conexión con CRM',
      price: 7500,
      aplica: ['web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda','ec-app',
               'plat-saas','plat-crm','plat-chatbot'],
    },
    {
      id: 'analytics-avanzado', label: 'Analytics avanzado', icon: 'serverapp',
      summary: 'GA4 + Mixpanel/Amplitude · funnels + cohorts',
      price: 5000,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda','ec-app',
               'app-pwa','app-android','app-ios','app-ambas',
               'plat-saas','plat-crm','plat-erp'],
    },
    {
      id: 'pixel-publicitario', label: 'Pixel publicitario', icon: 'leads',
      summary: 'Meta · TikTok · LinkedIn · audiencias remarketing',
      price: 2500,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda','ec-app'],
    },
    {
      id: 'crm-basico', label: 'CRM básico integrado', icon: 'partnership',
      summary: 'HubSpot/Pipedrive · contactos + pipeline simple',
      price: 7500,
      aplica: ['web-landing','web-funnel','web-sitio',
               'ec-mini','ec-shopify','ec-tienda'],
    },
    {
      id: 'login-redes', label: 'Login con redes sociales', icon: 'partnership',
      summary: 'Google / Apple / Facebook · 1-click signup',
      price: 3500,
      aplica: ['web-sitio',
               'app-pwa','app-android','app-ios','app-ambas',
               'ec-shopify','ec-tienda','ec-app',
               'plat-saas','plat-crm'],
    },
    {
      id: 'pwa-installable', label: 'PWA installable', icon: 'app',
      summary: 'Service worker + manifest · "Add to home" en mobile',
      price: 5000,
      aplica: ['web-sitio',
               'ec-mini','ec-shopify','ec-tienda',
               'plat-saas','plat-crm'],
    },
    {
      id: 'app-stores-submission', label: 'Publicación en stores', icon: 'app',
      summary: 'Google Play + App Store · review handling · screenshots',
      price: 5000,
      aplica: ['app-android','app-ios','app-ambas',
               'ec-app'],
    },
    {
      id: 'multi-tenant', label: 'Multi-tenant', icon: 'serverapp',
      summary: 'Una instalación · múltiples clientes con datos aislados',
      price: 25000,
      aplica: ['plat-saas','plat-crm','plat-erp'],
    },
    {
      id: 'auditoria-smart-contract', label: 'Auditoría smart contract', icon: 'shield',
      summary: 'Revisión por seguridad externa · firma de auditor',
      price: 15000,
      aplica: ['plat-blockchain'],
    },
    {
      id: 'oraculo-precio', label: 'Oráculo de precio', icon: 'serverapp',
      summary: 'Chainlink o equivalente · datos off-chain → on-chain',
      price: 10000,
      aplica: ['plat-blockchain'],
    },
    {
      id: 'soporte-24-7', label: 'Soporte 24/7 · 90 días', icon: 'shield',
      summary: 'WhatsApp prioritario · SLA de respuesta < 2h',
      price: 12500,
      aplica: ['web-sitio',
               'app-android','app-ios','app-ambas','app-desktop',
               'ec-tienda','ec-app',
               'plat-saas','plat-crm','plat-erp','plat-blockchain'],
    },
    {
      id: 'backup-automatizado', label: 'Backup automatizado', icon: 'shield',
      summary: 'Snapshots diarios · retención 30 días · restore 1-click',
      price: 3500,
      aplica: ['web-sitio',
               'ec-shopify','ec-tienda','ec-app',
               'plat-saas','plat-crm','plat-erp'],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // MODIFICADORES (vacío en v9 · acabado/plazo viven como preguntas shared)
  // Se mantiene la key por compatibilidad estructural · cero efecto.
  // ═══════════════════════════════════════════════════════════════════
  modificadores: {},

  // ═══════════════════════════════════════════════════════════════════
  // HELPERS · portados de v8 con ajustes para v9.
  // - getSpeed: sin plazoMul/modoMul · esos ahora viven como preguntas
  //   shared dentro del subflow y afectan total directamente.
  // - getStack: STACK_MAP actualizado a IDs v9 (web-bio · plat-* · etc.)
  // ═══════════════════════════════════════════════════════════════════
  getTier(total){
    if (total <= 0)       return { id: 'empty',      label: '—'           };
    if (total < 5000)     return { id: 'express',    label: 'EXPRESS'     };
    if (total < 25000)    return { id: 'starter',    label: 'STARTER'     };
    if (total < 80000)    return { id: 'standard',   label: 'STANDARD'    };
    if (total < 200000)   return { id: 'pro',        label: 'PRO'         };
    return                      { id: 'enterprise', label: 'ENTERPRISE'  };
  },
  getTeam(total, flags){
    const team = ['KAM'];
    if (total >= 1500)                                         team.push('Frontend');
    if (total >= 15000 || (flags && flags.has('auth-or-api'))) team.push('Backend');
    if (flags && flags.has('animacion-pro'))                   team.push('UX/UI');
    if (total >= 40000)                                        team.push('PM');
    if (flags && (flags.has('ia') || flags.has('blockchain'))) team.push('DevOps');
    if (total >= 80000)                                        team.push('QA');
    return team;
  },
  getSpeed(total, flags){
    let score = 50;
    if (total < 10000)        score = 25;
    else if (total < 50000)   score = 45;
    else if (total < 150000)  score = 65;
    else                      score = 85;
    if (flags && flags.has('animacion-pro'))                   score += 8;
    if (flags && (flags.has('ia') || flags.has('blockchain'))) score += 10;
    return Math.max(0, Math.min(100, score));
  },
  getSpeedText(speed){
    if (speed < 35) return 'Tu proyecto apunta a entregables rápidos. Cero burocracia · iteramos en el camino.';
    if (speed < 70) return 'Tu proyecto balancea alcance y pulido. Calidad de producción estándar.';
    return 'Tu proyecto apunta a un producto premium · acabado de alta gama.';
  },
  getSpeedZone(speed){
    if (speed < 35) return 'mvp';
    if (speed < 70) return 'estandar';
    return 'premium';
  },
  getStack(servicios){
    if (!Array.isArray(servicios) || servicios.length === 0) {
      return ['Stack a definir según alcance', 'Tecnología adecuada', 'Hosting confiable'];
    }
    const STACK_MAP = {
      // Web (4) · IDs v9 (web-bio en vez de web-biolink)
      'web-bio':            ['HTML + CSS · ultra ligero', 'Deploy en Vercel'],
      'web-landing':        ['Astro / Next.js', 'TailwindCSS', 'Deploy en Vercel'],
      'web-funnel':         ['Next.js + integraciones', 'Email automation', 'Analytics avanzado'],
      'web-sitio':          ['Next.js / Astro', 'CMS (Sanity/Strapi)', 'Deploy en Vercel'],
      // Apps (5)
      'app-pwa':            ['React/Next.js PWA', 'Service Worker + Manifest'],
      'app-android':        ['React Native / Flutter / Kotlin', 'Google Play Console'],
      'app-ios':            ['React Native / Flutter / Swift', 'App Store Connect'],
      'app-ambas':          ['React Native / Flutter', 'Google Play + App Store'],
      'app-desktop':        ['Electron / Tauri', 'Auto-update'],
      // Ecommerce (4)
      'ec-mini':            ['Next.js / Astro single-page', 'Stripe / Mercado Pago', 'Deploy en Vercel'],
      'ec-shopify':         ['Shopify + apps oficiales', 'Theme customization', 'Apps de terceros'],
      'ec-tienda':          ['Next.js + headless CMS', 'Pasarela integrada', 'Deploy en Vercel + Railway'],
      'ec-app':             ['React Native / Flutter', 'Firebase + pagos in-app', 'App Store + Google Play'],
      // Plataformas heredados de Auto v8 (5) · IDs v9 (plat-* en vez de auto-*)
      'plat-chatbot':       ['LLM (OpenAI/Anthropic) + n8n', 'WhatsApp Business API'],
      'plat-agenda':        ['Cal.com / Calendly API + custom', 'Google Calendar sync'],
      'plat-integraciones': ['Zapier / Make / n8n', 'APIs REST + webhooks'],
      'plat-procesos':      ['n8n / scripts custom', 'Dashboards en Metabase/Retool'],
      'plat-asesoria':      ['1-a-1 con Eduardo + equipo iBisne'],
      // Plataformas nuevos v9 (4)
      'plat-crm':           ['Next.js + Postgres', 'Auth + roles', 'API REST + webhooks'],
      'plat-saas':          ['Next.js multi-tenant', 'Postgres + Redis', 'Stripe billing', 'Auth + SSO'],
      'plat-erp':           ['Next.js + módulos', 'Postgres + ETL', 'Reportes + BI'],
      'plat-blockchain':    ['Solidity / Rust', 'Ethereum / Polygon / Solana', 'Hardhat + Foundry', 'Auditoría'],
    };
    const unique = new Set();
    for (const s of servicios) {
      const tech = STACK_MAP[s.id];
      if (tech) tech.forEach(t => unique.add(t));
    }
    if (unique.size === 0) return ['Stack adecuado al alcance', 'Tecnología según necesidad'];
    return Array.from(unique).slice(0, 4);
  },
  getTime(servicios){
    if (!Array.isArray(servicios) || servicios.length === 0) return '—';
    let top = servicios[0];
    for (const s of servicios) {
      if ((s.calculatedPrice || s.base || 0) > (top.calculatedPrice || top.base || 0)) top = s;
    }
    return top.tiempo || '4-8 sem';
  },

  // v9 · helpers internos para add-ons
  addOnsForService(servicioId){
    return (this.addOns || []).filter(a => (a.aplica || []).includes(servicioId));
  },
  findAddOn(addOnId){
    return (this.addOns || []).find(a => a.id === addOnId) || null;
  },

  // ═══════════════════════════════════════════════════════════════════
  // META · info para debug/tooling
  // ═══════════════════════════════════════════════════════════════════
  meta: {
    version: '9.0.0',
    schemaRev: 'tipos-adaptativos+addons-globales+helpers-portados',
    activatedInProd: true,                     // v9 ya cargado en quiz.html (Fase 2)
    serviciosCount: 22,
    addOnsCount: 19,
    notes: 'Fase 2 activa · ui.js consume IBISNE_PRICING_V9 directamente · pricing.js v8 sigue en repo (pendiente eliminar en Fase 4).',
  },
};

// Expandir markers compartidos · IIFE corre al cargar el archivo
//   - Tipos compartidos: 'APP_TIPOS', 'EC_TIPOS'
//   - Subflows compartidos: 'APP_SUBFLOW_V9_MARKER', 'EC_SUBFLOW_V9_MARKER'
// Esto evita duplicar la definición ~20 veces en el JS.
(function expandSharedMarkers(){

  // ── Tipos compartidos ────────────────────────────────────────────
  const APP_TIPOS = [
    { id: 'catalogo',         label: 'Catálogo',             summary: 'Browse productos/contenido · sin transacciones' },
    { id: 'contenido',        label: 'Contenido',            summary: 'Feed · video · audio · descubrimiento' },
    { id: 'transacciones',    label: 'Transacciones',        summary: 'Compra-venta interna · marketplace' },
    { id: 'productividad',    label: 'Productividad interna', summary: 'Herramienta para tu equipo' },
    { id: 'social-comunidad', label: 'Social / comunidad',   summary: 'Perfiles · interacción · feed social' },
    { id: 'servicios-citas',  label: 'Servicios / citas',    summary: 'Booking · suscripciones · agenda' },
  ];
  const EC_TIPOS = [
    { id: 'fisico',  label: 'Producto físico',  summary: 'Te lo enviamos al cliente' },
    { id: 'digital', label: 'Producto digital', summary: 'Descarga · curso · ebook' },
    { id: 'servicio', label: 'Servicio',        summary: 'Booking · suscripción · sesión' },
    { id: 'mixto',   label: 'Mixto',            summary: 'Físico + digital + servicio combinados' },
  ];

  // ── Subflows compartidos ─────────────────────────────────────────
  // Apps · mismas 5 preguntas byType (×6 tipos) + shared (acabado + plazo)
  // Las preguntas distinguen INTENCIÓN, no PLATAFORMA (esa ya está en el servicio).
  const APP_SUBFLOW_V9 = {
    byType: {
      'catalogo': [
        { id: 'productos-app', label: '¿Tipo de catálogo?', opciones: [
          { id: 'productos',  label: 'Productos físicos · con stock',     add: 0 },
          { id: 'servicios',  label: 'Servicios · con prestadores',        add: 5000 },
          { id: 'contenido',  label: 'Contenido · cursos/biblioteca',      add: 7500 },
        ]},
        { id: 'tamano-cat-app', label: '¿Tamaño del catálogo?', opciones: [
          { id: 'chico',  label: '<100 items',                              add: 0 },
          { id: 'medio',  label: '100-1000',                                add: 12500 },
          { id: 'grande', label: '1000+',                                   add: 27500 },
        ]},
        { id: 'busqueda-app', label: '¿Búsqueda y filtros?', opciones: [
          { id: 'basica',  label: 'Básica · categorías + tags',             add: 0 },
          { id: 'avanzada', label: 'Avanzada · multi-atributo',             add: 12500 },
          { id: 'algolia',  label: 'Algolia · instant + sugerencias',       add: 27500 },
        ]},
        { id: 'detalle-app', label: '¿Detalle por item?', opciones: [
          { id: 'simple',  label: 'Simple · imagen + descripción',          add: 0 },
          { id: 'galeria', label: 'Galería + specs',                        add: 7500 },
          { id: 'rich',    label: 'Rich · video + 360° + reviews',          add: 22500 },
        ]},
        { id: 'cta-app', label: '¿CTA principal?', opciones: [
          { id: 'whatsapp', label: 'WhatsApp directo',                      add: 2500 },
          { id: 'form',     label: 'Form de cotización in-app',             add: 5000 },
          { id: 'compra',   label: 'Compra in-app (requiere checkout)',     add: 22500 },
        ]},
      ],
      'contenido': [
        { id: 'tipo-contenido', label: '¿Tipo de contenido?', multi: true, opciones: [
          { id: 'video',  label: 'Video on-demand',                        add: 22500 },
          { id: 'audio',  label: 'Audio / podcast',                        add: 12500 },
          { id: 'texto',  label: 'Texto · artículos/libros',               add: 5000 },
          { id: 'live',   label: 'Streaming en vivo',                      add: 45000 },
        ]},
        { id: 'feed-app', label: '¿Feed personalizado?', opciones: [
          { id: 'cronologico', label: 'Cronológico · sin personalización',  add: 0 },
          { id: 'tematico',    label: 'Temático · categorías que sigues',   add: 7500 },
          { id: 'ml-feed',     label: 'ML · recomendaciones personalizadas', add: 32500 },
        ]},
        { id: 'social-cont', label: '¿Interacción social?', multi: true, opciones: [
          { id: 'likes',    label: 'Likes / favoritos',                     add: 2500 },
          { id: 'comments', label: 'Comentarios',                           add: 5000 },
          { id: 'share',    label: 'Compartir externo',                     add: 2500 },
          { id: 'follow',   label: 'Follow de creators',                    add: 7500 },
        ]},
        { id: 'monetizacion-cont', label: '¿Monetización?', opciones: [
          { id: 'gratis',      label: 'Gratis · ads o sponsor',             add: 0 },
          { id: 'suscripcion', label: 'Suscripción · paywall',              add: 22500 },
          { id: 'pago-x-item', label: 'Pago por item',                      add: 17500 },
          { id: 'mixto',       label: 'Mixto · freemium',                   add: 32500 },
        ]},
        { id: 'descarga-offline', label: '¿Descarga offline?', opciones: [
          { id: 'no', label: 'No · siempre online',                         add: 0 },
          { id: 'si', label: 'Sí · cache local + DRM básico',                add: 17500 },
        ]},
      ],
      'transacciones': [
        { id: 'tipo-tx', label: '¿Tipo de transacción?', opciones: [
          { id: 'compra-venta', label: 'Compra-venta · marketplace',        add: 5000 },
          { id: 'subasta',      label: 'Subastas',                          add: 27500 },
          { id: 'tickets',      label: 'Tickets / boletos',                  add: 12500 },
          { id: 'remesas',      label: 'Transferencias / remesas',          add: 47500 },
        ]},
        { id: 'pasarela-app', label: '¿Pasarelas in-app?', multi: true, opciones: [
          { id: 'apple-pay',    label: 'Apple Pay',                          add: 7500 },
          { id: 'google-pay',   label: 'Google Pay',                         add: 7500 },
          { id: 'tarjeta',      label: 'Tarjeta · Stripe/MercadoPago',       add: 10000 },
          { id: 'spei-oxxo',    label: 'SPEI/OXXO',                          add: 10000 },
          { id: 'crypto',       label: 'Crypto · USDT/BTC',                  add: 22500 },
        ]},
        { id: 'kyc', label: '¿KYC / verificación de identidad?', opciones: [
          { id: 'no',     label: 'No · sólo email',                          add: 0 },
          { id: 'basico', label: 'Básico · CURP/RFC + selfie',               add: 17500 },
          { id: 'kyc-pro', label: 'Pro · proveedor externo (Mati/Truora)',   add: 32500 },
        ]},
        { id: 'historial-tx', label: '¿Historial y comprobantes?', opciones: [
          { id: 'simple',  label: 'Simple · lista de movimientos',           add: 2500 },
          { id: 'detalle', label: 'Detalle · comprobante PDF',               add: 7500 },
          { id: 'cfdi',    label: 'CFDI · facturación automática',           add: 22500 },
        ]},
        { id: 'limites', label: '¿Límites y compliance?', opciones: [
          { id: 'no',       label: 'No · sin límites',                       add: 0 },
          { id: 'limites',  label: 'Límites por usuario/día',                add: 7500 },
          { id: 'aml',      label: 'Límites + alertas AML',                  add: 22500 },
        ]},
      ],
      'productividad': [
        { id: 'modulos-prod', label: '¿Módulos core?', multi: true, opciones: [
          { id: 'tasks',    label: 'Tasks · lista + asignación',             add: 7500 },
          { id: 'docs',     label: 'Documentos · markdown',                  add: 12500 },
          { id: 'chat',     label: 'Chat interno · canales',                 add: 17500 },
          { id: 'wiki',     label: 'Wiki · base de conocimiento',            add: 12500 },
          { id: 'calendar', label: 'Calendar interno',                       add: 10000 },
        ]},
        { id: 'colaboracion-prod', label: '¿Multi-usuario simultáneo?', opciones: [
          { id: 'no',        label: 'No · 1 usuario por sesión',             add: 0 },
          { id: 'async',     label: 'Comentarios async',                     add: 5000 },
          { id: 'realtime',  label: 'Realtime · presencia + cursores',       add: 27500 },
        ]},
        { id: 'integraciones-prod', label: '¿Integraciones de día 1?', opciones: [
          { id: 'ninguna',  label: 'Ninguna · sólo internas',                 add: 0 },
          { id: 'google',   label: 'Google Workspace',                       add: 7500 },
          { id: 'office',   label: 'Microsoft 365',                          add: 7500 },
          { id: 'multi',    label: 'Multi · Google + MS + Slack',            add: 17500 },
        ]},
        { id: 'permisos-prod', label: '¿Permisos?', opciones: [
          { id: 'iguales',  label: 'Todos iguales',                          add: 0 },
          { id: 'roles',    label: 'Roles · admin/editor/lectura',           add: 5000 },
          { id: 'granular', label: 'Granular · por workspace/folder',        add: 17500 },
        ]},
        { id: 'reportes-prod', label: '¿Dashboards / reportes?', opciones: [
          { id: 'no',      label: 'No',                                      add: 0 },
          { id: 'basico',  label: 'Básico · counts + estados',                add: 5000 },
          { id: 'custom',  label: 'Custom · dashboards configurables',        add: 22500 },
        ]},
      ],
      'social-comunidad': [
        { id: 'estructura-social', label: '¿Estructura social?', opciones: [
          { id: 'feed',     label: 'Feed plano · sin grupos',                add: 0 },
          { id: 'grupos',   label: 'Grupos / comunidades',                   add: 17500 },
          { id: 'multi',    label: 'Grupos + subgrupos + roles',             add: 32500 },
        ]},
        { id: 'tipos-post', label: '¿Tipos de post?', multi: true, opciones: [
          { id: 'texto',   label: 'Texto + imagen',                          add: 0 },
          { id: 'video',   label: 'Video corto · feed estilo TikTok',        add: 27500 },
          { id: 'audio',   label: 'Audio · clubhouse-style',                  add: 22500 },
          { id: 'polls',   label: 'Encuestas',                               add: 5000 },
          { id: 'eventos', label: 'Eventos / meetups',                       add: 12500 },
        ]},
        { id: 'moderacion', label: '¿Moderación?', opciones: [
          { id: 'sin',      label: 'Sin moderación · sólo reportes',          add: 0 },
          { id: 'mods',     label: 'Moderadores manuales',                    add: 7500 },
          { id: 'auto-ai',  label: 'Auto · IA + revisión humana',             add: 27500 },
        ]},
        { id: 'mensajes-dm', label: '¿Mensajes directos?', opciones: [
          { id: 'no',      label: 'No · solo público',                        add: 0 },
          { id: 'dm',      label: 'DM 1-a-1',                                 add: 12500 },
          { id: 'grupos-dm', label: 'DM + grupos privados',                   add: 22500 },
        ]},
        { id: 'monetizacion-soc', label: '¿Monetización?', multi: true, opciones: [
          { id: 'creators',  label: 'Tip a creators',                         add: 15000 },
          { id: 'premium',   label: 'Suscripción premium',                    add: 22500 },
          { id: 'badges',    label: 'Badges/items comprables',                add: 12500 },
        ]},
      ],
      'servicios-citas': [
        { id: 'profesionales', label: '¿Cuántos profesionales?', opciones: [
          { id: 'uno',    label: '1 profesional',                             add: 0 },
          { id: 'equipo', label: 'Equipo · 2-10',                             add: 7500 },
          { id: 'marketplace', label: 'Marketplace · 11+',                    add: 22500 },
        ]},
        { id: 'modalidad-cita', label: '¿Modalidad?', opciones: [
          { id: 'presencial', label: 'Sólo presencial',                       add: 0 },
          { id: 'online',     label: 'Sólo online · videollamada in-app',     add: 17500 },
          { id: 'hibrido',    label: 'Híbrido · cliente elige',               add: 22500 },
        ]},
        { id: 'pagos-cita', label: '¿Pagos?', opciones: [
          { id: 'no',       label: 'No · gratis o cobra externo',             add: 0 },
          { id: 'reserva',  label: 'Al reservar · 100%',                       add: 12500 },
          { id: 'anticipo', label: 'Anticipo + resto post-cita',               add: 17500 },
          { id: 'suscripcion', label: 'Suscripción · X citas/mes',             add: 22500 },
        ]},
        { id: 'historial-cita', label: '¿Historial del cliente?', opciones: [
          { id: 'simple',  label: 'Simple · citas pasadas',                   add: 2500 },
          { id: 'expediente', label: 'Expediente · notas privadas',           add: 12500 },
          { id: 'archivos',  label: 'Expediente + archivos adjuntos',         add: 22500 },
        ]},
        { id: 'recordatorios-cita', label: '¿Recordatorios?', multi: true, opciones: [
          { id: 'push',     label: 'Push notification',                       add: 2500 },
          { id: 'email',    label: 'Email',                                   add: 1500 },
          { id: 'sms',      label: 'SMS',                                     add: 3500 },
          { id: 'whatsapp', label: 'WhatsApp',                                add: 5000 },
        ]},
      ],
    },
    shared: [
      { id: 'login-app', label: '¿Login del usuario?', opciones: [
        { id: 'no',       label: 'No · uso sin login (sólo browse)',         add: 0 },
        { id: 'email',    label: 'Email + password',                          add: 12500 },
        { id: 'redes',    label: 'Email + redes (Google/Apple)',              add: 22500 },
        { id: 'perfiles', label: 'Login + perfiles de usuario',                add: 35000, flag: 'auth-or-api' },
      ]},
      { id: 'acabado', label: '¿Acabado del diseño?', opciones: [
        { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
        { id: 'balance',   label: 'Balance · calidad/precio óptimo',       mul: 1.0 },
        { id: 'premium',   label: 'Premium · animaciones + pulido máximo', mul: 1.35, flag: 'animacion-pro' },
      ]},
      { id: 'plazo', label: '¿Plazo deseado?', opciones: [
        { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
        { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
        { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
      ]},
    ],
  };

  // Ecommerce · mismas 4 preguntas byType (×4 tipos) + shared (pagos + acabado + plazo)
  const EC_SUBFLOW_V9 = {
    byType: {
      'fisico': [
        { id: 'catalogo-fisico', label: '¿Tamaño del catálogo?', opciones: [
          { id: 'chico',  label: '1-25 productos',                          add: 0 },
          { id: 'medio',  label: '26-200 productos',                        add: 15000 },
          { id: 'grande', label: '200+ productos',                          add: 35000 },
        ]},
        { id: 'envios', label: '¿Logística de envíos?', opciones: [
          { id: 'manual',  label: 'Manual · imprimes guías',                add: 0 },
          { id: 'integrado', label: 'Integrado · DHL/Estafeta/FedEx',       add: 12500 },
          { id: 'multi',    label: 'Multi-courier + cotizador automático',  add: 22500 },
        ]},
        { id: 'inventario-fisico', label: '¿Manejo de inventario?', opciones: [
          { id: 'basico',  label: 'Básico · stock por SKU',                  add: 5000 },
          { id: 'avanzado', label: 'Avanzado · multi-warehouse',             add: 15000 },
          { id: 'erp',      label: 'Conectado a ERP existente',              add: 22500 },
        ]},
        { id: 'devoluciones', label: '¿Sistema de devoluciones?', opciones: [
          { id: 'no',       label: 'No · solo email manual',                 add: 0 },
          { id: 'simple',   label: 'Simple · form + autorización manual',    add: 7500 },
          { id: 'auto',     label: 'Automatizado · guía de retorno + refund', add: 17500 },
        ]},
      ],
      'digital': [
        { id: 'tipo-digital', label: '¿Tipo de producto digital?', opciones: [
          { id: 'descarga',  label: 'Descarga · ebook/template/PDF',         add: 0 },
          { id: 'curso',     label: 'Curso · video + módulos',               add: 17500 },
          { id: 'software',  label: 'Software · licencia',                   add: 22500 },
          { id: 'membresia', label: 'Membresía · acceso recurrente',         add: 12500 },
        ]},
        { id: 'entrega-digital', label: '¿Entrega?', opciones: [
          { id: 'email',   label: 'Email automático · link',                 add: 2500 },
          { id: 'area',    label: 'Área de cliente · biblioteca',             add: 12500 },
          { id: 'streaming', label: 'Streaming · player propio · DRM básico', add: 22500 },
        ]},
        { id: 'drm', label: '¿Protección?', opciones: [
          { id: 'no',     label: 'No · descarga libre',                       add: 0 },
          { id: 'token',  label: 'Link con token · expiración',                add: 5000 },
          { id: 'fingerprint', label: 'Watermark / fingerprint',              add: 12500 },
        ]},
        { id: 'actualizaciones', label: '¿Actualizaciones del producto?', opciones: [
          { id: 'no',     label: 'No · versión única',                        add: 0 },
          { id: 'free',   label: 'Updates gratis · de por vida',              add: 5000 },
          { id: 'paid',   label: 'Updates pagados · per version',             add: 12500 },
        ]},
      ],
      'servicio': [
        { id: 'tipo-servicio-ec', label: '¿Tipo de servicio?', opciones: [
          { id: 'cita',     label: 'Citas · 1 sesión',                       add: 7500 },
          { id: 'sub',      label: 'Suscripción · acceso recurrente',        add: 12500 },
          { id: 'paquete',  label: 'Paquete · X sesiones',                   add: 10000 },
        ]},
        { id: 'agenda-ec', label: '¿Cómo se agenda?', opciones: [
          { id: 'externa',  label: 'Externa · Calendly link post-compra',    add: 2500 },
          { id: 'integrada', label: 'Integrada · agenda dentro del checkout', add: 17500 },
        ]},
        { id: 'recordatorios-ec', label: '¿Recordatorios?', multi: true, opciones: [
          { id: 'email',    label: 'Email',                                   add: 1500 },
          { id: 'whatsapp', label: 'WhatsApp',                                add: 5000 },
          { id: 'sms',      label: 'SMS',                                     add: 3500 },
        ]},
        { id: 'gestion-clientes', label: '¿Historial del cliente?', opciones: [
          { id: 'no',         label: 'No · solo notificaciones',              add: 0 },
          { id: 'basico',     label: 'Básico · citas pasadas',                add: 5000 },
          { id: 'expediente', label: 'Expediente · notas + archivos',         add: 15000 },
        ]},
      ],
      'mixto': [
        { id: 'cantidad-categorias', label: '¿Cuántas categorías de producto?', opciones: [
          { id: 'dos',  label: 'Dos · físico + digital o físico + servicio', add: 5000 },
          { id: 'tres', label: 'Tres · físico + digital + servicio',          add: 12500 },
        ]},
        { id: 'bundles', label: '¿Bundles cross-categoría?', opciones: [
          { id: 'no',     label: 'No · venta separada',                       add: 0 },
          { id: 'manual', label: 'Sí · bundles manuales',                     add: 7500 },
          { id: 'config', label: 'Sí · configurador · cliente arma bundle',   add: 17500 },
        ]},
        { id: 'envios-mixto', label: '¿Envíos / entrega?', opciones: [
          { id: 'separados', label: 'Separados · físico envía, digital descarga', add: 5000 },
          { id: 'agendada',  label: 'Agendada · una sola entrega coordinada',  add: 15000 },
        ]},
        { id: 'pricing-mixto', label: '¿Pricing dinámico?', opciones: [
          { id: 'fijo',     label: 'Fijo · precio cerrado',                   add: 0 },
          { id: 'descuento', label: 'Descuento por bundle (10-20%)',           add: 5000 },
          { id: 'config',    label: 'Configurador con precio dinámico',        add: 15000 },
        ]},
      ],
    },
    shared: [
      { id: 'pagos-ec', label: '¿Pasarelas de pago?', multi: true, opciones: [
        { id: 'tarjeta-nac', label: 'Tarjeta nacional · Stripe/Mercado Pago', add: 10000 },
        { id: 'tarjeta-int', label: 'Tarjeta internacional',                  add: 10000 },
        { id: 'spei-oxxo',   label: 'SPEI / OXXO',                            add: 8500 },
        { id: 'paypal',      label: 'PayPal',                                 add: 7500 },
      ]},
      { id: 'acabado', label: '¿Acabado del diseño?', opciones: [
        { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
        { id: 'balance',   label: 'Balance · calidad/precio óptimo',       mul: 1.0 },
        { id: 'premium',   label: 'Premium · animaciones + pulido máximo', mul: 1.35, flag: 'animacion-pro' },
      ]},
      { id: 'plazo', label: '¿Plazo deseado?', opciones: [
        { id: 'flexible', label: 'Flexible · cuando salga',  mul: 0.95 },
        { id: 'normal',   label: 'Normal · plazo estándar',  mul: 1.0 },
        { id: 'express',  label: 'Express · más rápido',     mul: 1.5 },
      ]},
    ],
  };

  // ── Expansión final · sustituir markers por contenido real ───────
  const S = window.IBISNE_PRICING_V9.servicios;
  for (const id of Object.keys(S)) {
    if (S[id].tipos === 'APP_TIPOS') S[id].tipos = APP_TIPOS;
    if (S[id].tipos === 'EC_TIPOS')  S[id].tipos = EC_TIPOS;
  }
  const SF = window.IBISNE_PRICING_V9.subflow;
  for (const id of Object.keys(SF)) {
    if (SF[id] === 'APP_SUBFLOW_V9_MARKER') SF[id] = APP_SUBFLOW_V9;
    if (SF[id] === 'EC_SUBFLOW_V9_MARKER')  SF[id] = EC_SUBFLOW_V9;
  }
})();

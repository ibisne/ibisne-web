// data/pricing.js — v6.0.2 · Catálogo jerárquico de 2 niveles
//
// Cambio principal vs v6.0.1: en lugar de 7 categorías al mismo nivel,
// agrupamos en 4 MEGA-categorías que contienen sub-categorías:
//
//   1. Tecnología       (sitios · tiendas · apps · web3)
//   2. Marketing y branding (redes · branding · contenido · impresos)
//   3. Automatización e IA  (sin subs · va directo a servicios)
//   4. Asesoría y capacitación (sin subs)
//
// El cliente ve solo 4 cards al inicio. Tap → ve sub-categorías
// (o directo servicios si no hay subs). Tap → ve servicios. Cada nivel
// con back button. "Ir orientando de poco a poco" como pidió Eduardo.
//
// servicios[] ahora es un objeto plano indexado por ID para lookup O(1):
//   servicios['web-bio'] → { ... }

window.IBISNE_PRICING = {

  // ═══ SECTORES · contexto · no gate · sugiere ═════════════════════════
  sectores: [
    { id: 'arquitecto',    label: 'Arquitectura',          icon: 'sitio' },
    { id: 'dentista',      label: 'Dentista / Salud',      icon: 'shield' },
    { id: 'restaurante',   label: 'Restaurante / Café',    icon: 'ecommerce' },
    { id: 'ecommerce',     label: 'Vendo productos',       icon: 'ecommerce' },
    { id: 'coach',         label: 'Coach / Mentor',        icon: 'partnership' },
    { id: 'influencer',    label: 'Influencer / Creator',  icon: 'star' },
    { id: 'b2b',           label: 'B2B / SaaS',            icon: 'serverapp' },
    { id: 'inmobiliaria',  label: 'Inmobiliaria',          icon: 'marketplace' },
    { id: 'abogado',       label: 'Abogado / Consultor',   icon: 'shield' },
    { id: 'educacion',     label: 'Educación / Cursos',    icon: 'edit' },
    { id: 'ong',           label: 'Fundación / ONG',       icon: 'partnership' },
    { id: 'otro',          label: 'Otro · cuéntame',       icon: 'arrow' },
  ],

  // ═══ "YA TENGO" · descarta opciones · ahorra preguntas ═══════════════
  yaTengo: [
    { id: 'web',         label: 'Sitio web',                icon: 'sitio' },
    { id: 'identidad',   label: 'Identidad / logo',         icon: 'dtc' },
    { id: 'redes',       label: 'Redes sociales activas',   icon: 'leads' },
    { id: 'cms',         label: 'Sistema para administrar', icon: 'edit' },
    { id: 'pasarela',    label: 'Pasarela de pago',         icon: 'fintech' },
    { id: 'marketing',   label: 'Marketing andando',        icon: 'saas' },
  ],

  // ═══ MEGA-CATEGORÍAS (4) · primer nivel del catálogo ═════════════════
  // Nombres simples y directos (no técnicos). Cada una con `info`:
  // texto plano que aparece al tocar la (i) · sin entrar a la categoría.
  megaCategorias: [
    {
      id: 'web',
      label: 'Desarrollo web',
      summary: 'Tu presencia en internet',
      icon: 'sitio',
      info: 'Todo lo que vive en un navegador: desde una página simple con tus enlaces, una landing para captar clientes, un sitio completo de marca, hasta una tienda en línea o un marketplace. Si tus clientes lo abren desde una computadora o el navegador del celular, va aquí.',
      subCategorias: [
        { id: 'sitios',  label: 'Sitios web',     icon: 'sitio',
          subtitle: 'Bio-link, landing, sitio completo',
          info: 'Páginas web informativas o de captación. Desde un bio-link de 1 página hasta un sitio completo multi-página con blog y secciones.',
          serviciosIds: ['web-bio', 'landing-simple', 'landing-pro', 'sitio-web'] },
        { id: 'tiendas', label: 'Tiendas online', icon: 'ecommerce',
          subtitle: 'De 1 producto a marketplace',
          info: 'Vender por internet: desde una página de un solo producto, una tienda Shopify gestionable, hasta una plataforma multi-vendedor donde cobras comisión.',
          serviciosIds: ['ecommerce-1prod', 'ecommerce-shopify', 'ecommerce-pro', 'marketplace'] },
        { id: 'web3',    label: 'Web3 · Blockchain', icon: 'coin',
          subtitle: 'NFT, cripto, contratos',
          info: 'Proyectos en blockchain: colecciones NFT, token propio, apps con contratos inteligentes o finanzas descentralizadas.',
          serviciosIds: ['blockchain'] },
      ],
    },
    {
      id: 'apps',
      label: 'Apps',
      summary: 'Aplicaciones para celular',
      icon: 'app',
      info: 'Aplicaciones que se instalan en el celular (App Store / Google Play). Desde una app rápida con herramientas no-code para validar tu idea en semanas, hasta una app profesional para iPhone y Android con backend propio.',
      // Sin subCategorias · va directo a servicios
      serviciosIds: ['app-nocode', 'app-ios-android'],
    },
    {
      id: 'marketing',
      label: 'Marketing',
      summary: 'Que te conozcan y te compren',
      icon: 'leads',
      info: 'Todo lo que pone tu marca frente al cliente: posts para redes, campañas de anuncios pagados, email marketing, tu logo e identidad visual, fotos y video profesional, y material impreso como tarjetas o brochures.',
      subCategorias: [
        { id: 'redes-ads', label: 'Redes y campañas', icon: 'leads',
          subtitle: 'Posts, ads, email, SEO',
          info: 'Contenido para redes sociales, campañas de anuncios pagados (Meta/Google/TikTok), email marketing, copywriting y SEO.',
          serviciosIds: ['posts-10-redes', 'posts-30-redes', 'qr-personalizado', 'email-setup', 'copy-landing', 'campania-ads', 'social-mensual', 'seo-basico', 'estrategia-90d'] },
        { id: 'branding',  label: 'Branding e identidad', icon: 'dtc',
          subtitle: 'Logo, manual, rebrand',
          info: 'La identidad visual de tu marca: logo express, identidad básica o pro con manual completo, o un rebrand total.',
          serviciosIds: ['logo-express', 'identidad-basica', 'identidad-pro', 'rebrand-full'] },
        { id: 'contenido', label: 'Fotos y video',   icon: 'camera',
          subtitle: 'Sesiones foto, video, blog',
          info: 'Contenido visual profesional: sesiones fotográficas, videos cortos para redes, video corporativo o artículos de blog con SEO.',
          serviciosIds: ['sesion-foto-1h', 'video-corto', 'sesion-foto-full', 'video-corporativo', 'blog-posts'] },
        { id: 'impresos',  label: 'Impresos físicos', icon: 'edit',
          subtitle: 'Tarjetas, flyers, papelería',
          info: 'Material impreso físico: tarjetas de presentación, flyers, brochures o papelería corporativa completa. Diseño + impresión incluidos.',
          serviciosIds: ['tarjetas-500', 'flyers-1000', 'brochure-tri', 'papeleria-full'] },
      ],
    },
    {
      id: 'auto',
      label: 'Automatizaciones',
      summary: 'Que el trabajo repetitivo se haga solo',
      icon: 'chatbot',
      info: 'Tecnología que trabaja por ti sin que tengas que estar presente: bots de WhatsApp que responden solos, chatbots con IA entrenados con tu negocio, automatizaciones que conectan tus herramientas, configuración de CRM, o consultoría y capacitación para tu equipo.',
      subCategorias: [
        { id: 'bots-ia',   label: 'Bots e IA',       icon: 'chatbot',
          subtitle: 'WhatsApp, chatbot IA, workflows, CRM',
          info: 'Bots de WhatsApp, chatbots con IA, automatizaciones Zapier/Make, configuración de CRM y automatización end-to-end.',
          serviciosIds: ['bot-wa-basico', 'zapier-basico', 'chatbot-ia', 'crm-setup', 'automatizacion-end-end'] },
        { id: 'consultoria', label: 'Consultoría y talleres', icon: 'partnership',
          subtitle: 'Asesoría 1-a-1, capacitación',
          info: 'Asesoría 1-a-1 por hora, talleres grupales o capacitación intensiva para tu equipo.',
          serviciosIds: ['asesoria-1h', 'taller-grupal', 'capacitacion-equipo'] },
      ],
    },
  ],

  // ═══ SERVICIOS · catálogo plano indexado por ID ══════════════════════
  servicios: {
    // ── Tecnología · Sitios web ────────────────────────────────────
    'web-bio':           { label: 'Bio-link · 1 página',           base: 1499,   tier: 'micro',  tiempo: '24-48hrs',  icon: 'biolink',
                           subtitle: 'Una sola página con tus enlaces, contacto y productos destacados', subflow: true,
                           tags: ['influencer','coach','sin-web'] },
    'landing-simple':    { label: 'Landing simple',                base: 2999,   tier: 'micro',  tiempo: '48hrs',     icon: 'landing',
                           subtitle: 'Una página de captación · formulario + botón de venta', subflow: true,
                           tags: ['coach','b2b','sin-web'] },
    'landing-pro':       { label: 'Landing de venta pro',          base: 19999,  tier: 'medio',  tiempo: '1-2 sem',   icon: 'leads',
                           subtitle: 'Landing avanzada con copy, animaciones, integraciones y A/B', subflow: true,
                           tags: ['coach','b2b','influencer'] },
    'sitio-web':         { label: 'Sitio web completo',            base: 71500,  tier: 'medio',  tiempo: '4-8 sem',   icon: 'sitio',
                           subtitle: 'Sitio multi-página con secciones, blog, contacto', subflow: true,
                           tags: ['arquitecto','restaurante','b2b','abogado','inmobiliaria','sin-web'] },

    // ── Tecnología · Tiendas online ───────────────────────────────
    'ecommerce-1prod':   { label: 'Tienda · 1 producto',           base: 28500,  tier: 'medio',  tiempo: '2-5 sem',   icon: 'ecommerce',
                           subtitle: 'Página dedicada a vender UN producto · pasarela integrada', subflow: true,
                           tags: ['ecommerce','coach'] },
    'ecommerce-shopify': { label: 'Tienda Shopify',                base: 97500,  tier: 'medio',  tiempo: '4-10 sem',  icon: 'ecommerce',
                           subtitle: 'Tienda con varios productos · panel para administrar todo', subflow: true,
                           tags: ['ecommerce'] },
    'ecommerce-pro':     { label: 'Tienda online avanzada',        base: 234000, tier: 'grande', tiempo: '8-16 sem',  icon: 'saas',
                           subtitle: 'Tienda construida desde cero · velocidad y SEO máximos', subflow: true,
                           tags: ['ecommerce'] },
    'marketplace':       { label: 'Marketplace multi-vendor',      base: 416000, tier: 'grande', tiempo: '12-24 sem', icon: 'marketplace',
                           subtitle: 'Plataforma donde varios vendedores publican y tú cobras comisión', subflow: true,
                           tags: ['ecommerce','b2b'] },

    // ── Tecnología · Apps móviles ─────────────────────────────────
    'app-nocode':        { label: 'App rápida (no-code)',          base: 45500,  tier: 'medio',  tiempo: '4-10 sem',  icon: 'nocode',
                           subtitle: 'App armada con herramientas visuales · validas idea en semanas', subflow: true,
                           tags: ['b2b','coach','educacion'] },
    'app-ios-android':   { label: 'App iPhone + Android',          base: 286000, tier: 'grande', tiempo: '12-22 sem', icon: 'hybrid',
                           subtitle: 'Una sola app para iOS y Android · backend incluido', subflow: true,
                           tags: ['b2b','educacion'] },

    // ── Tecnología · Web3 ─────────────────────────────────────────
    'blockchain':        { label: 'Proyecto Web3 / cripto',        base: 234000, tier: 'grande', tiempo: '10-20 sem', icon: 'coin',
                           subtitle: 'NFTs, contratos inteligentes, DeFi · proyectos en blockchain', subflow: true,
                           tags: ['b2b'] },

    // ── Marketing · Redes y campañas ──────────────────────────────
    'posts-10-redes':    { label: '10 posts redes con tu logo',    base: 499,    tier: 'micro',  tiempo: '8hrs express', icon: 'leads',
                           subtitle: 'Instagram + Facebook · diseño con tu logo · listos para postear', subflow: true,
                           tags: ['dentista','restaurante','arquitecto','influencer','coach','abogado','inmobiliaria','sin-marketing'] },
    'posts-30-redes':    { label: '30 posts redes mensuales',      base: 1999,   tier: 'micro',  tiempo: '48hrs',     icon: 'leads',
                           subtitle: '30 piezas/mes · texto + diseño · listos para programar', subflow: true,
                           tags: ['dentista','restaurante','influencer','coach','sin-marketing'] },
    'qr-personalizado':  { label: 'Código QR personalizado',       base: 299,    tier: 'micro',  tiempo: '8hrs',      icon: 'arrow',
                           subtitle: 'QR con tu logo y colores · imprimes o usas digital · 1 link' },
    'email-setup':       { label: 'Email marketing · setup',       base: 799,    tier: 'micro',  tiempo: '24hrs',     icon: 'leads',
                           subtitle: 'Mailchimp/Brevo setup · plantilla de bienvenida + lista importada' },
    'copy-landing':      { label: 'Copywriting de landing',        base: 1499,   tier: 'micro',  tiempo: '48hrs',     icon: 'edit',
                           subtitle: 'Textos persuasivos para tu landing · headline + 4 secciones + CTA' },
    'campania-ads':      { label: 'Campaña Ads 30 días',           base: 9999,   tier: 'medio',  tiempo: 'setup 48hrs', icon: 'saas',
                           subtitle: 'Meta o Google Ads · 30 días · setup + creativos + optimización', subflow: true,
                           tags: ['ecommerce','coach','b2b','dentista','restaurante'] },
    'social-mensual':    { label: 'Manejo de redes · 1 mes',       base: 7999,   tier: 'medio',  tiempo: '1 mes',     icon: 'star',
                           subtitle: '20 posts + 30 stories + 4 reels · publicación + reporte mensual', subflow: true,
                           tags: ['dentista','restaurante','influencer','coach','arquitecto'] },
    'seo-basico':        { label: 'SEO técnico básico',            base: 4999,   tier: 'medio',  tiempo: '1-2 sem',   icon: 'saas',
                           subtitle: 'Auditoría + on-page + sitemap + schema · primera página Google',
                           tags: ['sin-marketing'] },
    'estrategia-90d':    { label: 'Estrategia marketing · 90 días', base: 52000, tier: 'grande', tiempo: '3 meses',   icon: 'partnership',
                           subtitle: 'Estrategia full-funnel · ads multi-canal · email · contenidos · prensa', subflow: true },

    // ── Marketing · Branding e identidad ──────────────────────────
    'logo-express':      { label: 'Logo express',                  base: 999,    tier: 'micro',  tiempo: '48hrs',     icon: 'dtc',
                           subtitle: 'Logo + 2 versiones (color/blanco) · PDF + PNG · 3 propuestas',
                           tags: ['sin-identidad'] },
    'identidad-basica':  { label: 'Identidad básica',              base: 4999,   tier: 'medio',  tiempo: '3-5 días',  icon: 'dtc',
                           subtitle: 'Logo + paleta + tipografías + usos básicos · PDF entregable',
                           tags: ['sin-identidad'] },
    'identidad-pro':     { label: 'Identidad pro · manual',        base: 19999,  tier: 'medio',  tiempo: '2-3 sem',   icon: 'partnership',
                           subtitle: 'Manual completo · isotipo + naming + storytelling + aplicaciones',
                           tags: ['sin-identidad'] },
    'rebrand-full':      { label: 'Rebrand completo',              base: 78000,  tier: 'grande', tiempo: '6-10 sem',  icon: 'star',
                           subtitle: 'Investigación + reposicionamiento + identidad nueva + aplicaciones' },

    // ── Marketing · Contenido ─────────────────────────────────────
    'sesion-foto-1h':    { label: 'Sesión fotográfica · 1 hora',   base: 1999,   tier: 'micro',  tiempo: '1 día',     icon: 'camera',
                           subtitle: 'Producto, lugar o retrato · 1 hora + 20 fotos editadas',
                           tags: ['arquitecto','restaurante','dentista'] },
    'video-corto':       { label: 'Video corto · 30 segundos',     base: 1499,   tier: 'micro',  tiempo: '3 días',    icon: 'star',
                           subtitle: 'Reel o post · animación + texto + música licenciada',
                           tags: ['influencer','coach'] },
    'sesion-foto-full':  { label: 'Sesión fotográfica · medio día', base: 7999,  tier: 'medio',  tiempo: '1 día + edición', icon: 'camera',
                           subtitle: '4 horas · 50+ fotos editadas · catálogo o portfolio',
                           tags: ['arquitecto','restaurante'] },
    'video-corporativo': { label: 'Video corporativo 2-3 min',     base: 14999,  tier: 'medio',  tiempo: '2-3 sem',   icon: 'star',
                           subtitle: 'Guion + grabación + edición · para web, redes y ventas' },
    'blog-posts':        { label: '10 blog posts con SEO',         base: 4999,   tier: 'medio',  tiempo: '2 sem',     icon: 'edit',
                           subtitle: '10 artículos optimizados SEO · 800-1200 palabras · publicables' },

    // ── Marketing · Impresos ──────────────────────────────────────
    'tarjetas-500':      { label: '500 tarjetas de presentación',  base: 999,    tier: 'micro',  tiempo: '5-7 días',  icon: 'edit',
                           subtitle: 'Diseño + impresión en couché 350g · 2 caras a color' },
    'flyers-1000':       { label: '1,000 flyers a color',          base: 1499,   tier: 'micro',  tiempo: '5-7 días',  icon: 'edit',
                           subtitle: 'Tamaño media carta · couché 150g · 2 caras a color' },
    'brochure-tri':      { label: 'Brochure tríptico · 500 piezas', base: 2999,  tier: 'medio',  tiempo: '1-2 sem',   icon: 'edit',
                           subtitle: 'Diseño + 500 piezas impresas en couché 200g · doblado tríptico' },
    'papeleria-full':    { label: 'Papelería corporativa',         base: 7999,   tier: 'medio',  tiempo: '2-3 sem',   icon: 'partnership',
                           subtitle: 'Tarjetas + hojas membretadas + sobres + carpetas · diseño + 500 piezas c/u' },

    // ── Automatización ─────────────────────────────────────────────
    'bot-wa-basico':     { label: 'Bot WhatsApp básico',           base: 1999,   tier: 'micro',  tiempo: '48hrs',     icon: 'whatsapp',
                           subtitle: 'Bot con respuestas a preguntas frecuentes · menú interactivo' },
    'zapier-basico':     { label: 'Automatización Zapier/Make',    base: 1499,   tier: 'micro',  tiempo: '48hrs',     icon: 'serverapp',
                           subtitle: '3 flujos · ej: lead nuevo → CRM + email + Slack',
                           tags: ['b2b','coach'] },
    'chatbot-ia':        { label: 'Chatbot con IA',                base: 11500,  tier: 'medio',  tiempo: '1-2 sem',   icon: 'chatbot',
                           subtitle: 'Bot entrenado con info de tu negocio · responde 24/7', subflow: true },
    'crm-setup':         { label: 'CRM setup',                     base: 7999,   tier: 'medio',  tiempo: '1 sem',     icon: 'partnership',
                           subtitle: 'HubSpot/Pipedrive · flujos de seguimiento + reportes',
                           tags: ['b2b'] },
    'automatizacion-end-end': { label: 'Automatización end-to-end', base: 65000, tier: 'grande', tiempo: '6-10 sem',  icon: 'serverapp',
                           subtitle: 'ERP + CRM + Marketing automation integrados · workflows complejos' },

    // ── Capacitación ──────────────────────────────────────────────
    'asesoria-1h':       { label: 'Asesoría 1-a-1 · 1 hora',       base: 999,    tier: 'micro',  tiempo: 'agendable', icon: 'partnership',
                           subtitle: '1 hora con un experto · estrategia, tech, marketing o el tema que necesites' },
    'taller-grupal':     { label: 'Taller grupal · 4 horas',       base: 4999,   tier: 'medio',  tiempo: 'agendable', icon: 'partnership',
                           subtitle: '4 horas con tu equipo · capacitación práctica + material' },
    'capacitacion-equipo': { label: 'Capacitación equipo · 2 días', base: 19999, tier: 'medio',  tiempo: 'agendable', icon: 'partnership',
                           subtitle: '2 días de capacitación intensiva · hasta 12 personas · material + certificado' },
  },

  // ═══ SUB-FLOW · 2-4 preguntas por servicio (modal al agregar) ════════
  subflow: {
    'web-bio': [
      { id: 'enlaces', label: '¿Cuántos enlaces?', opciones: [
        { id: 'pocos', label: 'Solo mis redes · 3-5 enlaces', add: 0 },
        { id: 'medio', label: 'Redes + productos · 6-15',     add: 1500 },
        { id: 'todo',  label: 'Todo · catálogo + galería + contacto', add: 4500 },
      ]},
    ],

    'landing-simple': [
      { id: 'objetivo', label: '¿Qué objetivo principal?', opciones: [
        { id: 'captar',  label: 'Capturar correos / WhatsApps', add: 0 },
        { id: 'vender',  label: 'Vender un producto o curso',  add: 3500 },
        { id: 'evento',  label: 'Inscripciones a evento',       add: 2500 },
        { id: 'agendar', label: 'Agendar llamada / cita',       add: 2500 },
      ]},
    ],

    'landing-pro': [
      { id: 'paginas', label: '¿Cuántas secciones?', opciones: [
        { id: 'std',    label: 'Estándar · 6 secciones',   add: 0 },
        { id: 'plus',   label: 'Extendida · 10 secciones', add: 6500 },
      ]},
      { id: 'integraciones', label: '¿Integraciones?', multi: true, opciones: [
        { id: 'crm',       label: 'CRM (HubSpot, Pipedrive)',     add: 3500 },
        { id: 'mail',      label: 'Email marketing',              add: 2500 },
        { id: 'analytics', label: 'Analytics + Meta Pixel',       add: 2500 },
        { id: 'whatsapp',  label: 'WhatsApp Business',            add: 3500 },
      ]},
    ],

    'sitio-web': [
      { id: 'paginas', label: '¿Cuántas páginas?', opciones: [
        { id: '3-5',  label: 'Pocas · 3 a 5 páginas',       add: 0 },
        { id: '6-10', label: 'Medianas · 6 a 10 páginas',   add: 9500 },
        { id: '10+',  label: 'Muchas · más de 10 páginas',  add: 23500 },
      ]},
      { id: 'idiomas', label: '¿Cuántos idiomas?', opciones: [
        { id: 'uno',  label: 'Solo español',         add: 0 },
        { id: 'dos',  label: 'Español + inglés',     add: 11500 },
        { id: 'tres', label: 'Tres o más idiomas',   add: 23500 },
      ]},
      { id: 'modulos', label: '¿Qué módulos extra?', multi: true, opciones: [
        { id: 'cms',          label: 'Panel para editar contenido', add: 11500 },
        { id: 'blog',         label: 'Blog con SEO',                 add: 8000 },
        { id: 'agenda',       label: 'Sistema de citas / reservas',  add: 9500 },
        { id: 'chatbot',      label: 'Chatbot con IA',               add: 11500 },
        { id: 'galeria',      label: 'Galería de proyectos animada', add: 5500 },
        { id: 'membersarea',  label: 'Área de miembros con login',   add: 19500 },
        { id: 'newsletter',   label: 'Suscripción newsletter',       add: 4000 },
        { id: 'animaciones',  label: 'Animaciones premium scroll',   add: 9500, flag: 'animacion-pro' },
      ]},
    ],

    'ecommerce-1prod': [
      { id: 'pasarelas', label: '¿Cómo te van a pagar?', multi: true, opciones: [
        { id: 'mercadopago', label: 'Mercado Pago (tarjetas + SPEI + OXXO)', add: 0 },
        { id: 'stripe',      label: 'Stripe (tarjetas internacionales)',     add: 1500 },
        { id: 'paypal',      label: 'PayPal',                                 add: 1500 },
      ]},
      { id: 'envio', label: '¿Tipo de envío?', opciones: [
        { id: 'digital',    label: 'Es digital · no se envía',     add: 0 },
        { id: 'manual',     label: 'Gestiono envíos a mano',       add: 0 },
        { id: 'automatico', label: 'Cálculo + guías automáticas',  add: 4500 },
      ]},
    ],

    'ecommerce-shopify': [
      { id: 'catalogo', label: '¿Cuántos productos?', opciones: [
        { id: '<50',    label: 'Menos de 50',    add: 0 },
        { id: '50-500', label: '50 a 500',       add: 6500 },
        { id: '500+',   label: 'Más de 500',     add: 19500 },
      ]},
      { id: 'pasarelas', label: '¿Pasarelas?', multi: true, opciones: [
        { id: 'mercadopago', label: 'Mercado Pago',     add: 0 },
        { id: 'stripe',      label: 'Stripe',           add: 3500 },
        { id: 'paypal',      label: 'PayPal',           add: 2500 },
        { id: 'oxxo',        label: 'OXXO / SPEI',      add: 4500 },
      ]},
    ],

    'ecommerce-pro': [
      { id: 'catalogo', label: '¿Cuántos productos?', opciones: [
        { id: '<500',   label: 'Menos de 500',   add: 0 },
        { id: '500-5k', label: '500 a 5,000',    add: 15500 },
        { id: '5k+',    label: 'Más de 5,000',   add: 32500 },
      ]},
      { id: 'integraciones', label: '¿Integraciones?', multi: true, opciones: [
        { id: 'erp', label: 'ERP / sistema admin',    add: 19500 },
        { id: 'crm', label: 'CRM',                    add: 10500 },
        { id: '3pl', label: 'Servicio de envíos',     add: 13000 },
        { id: 'mkt', label: 'Email marketing',        add: 4000 },
      ]},
    ],

    'marketplace': [
      { id: 'modelo', label: '¿Modelo de cobro?', opciones: [
        { id: 'comision',    label: 'Solo comisión por venta',        add: 0 },
        { id: 'suscripcion', label: 'Suscripción de vendedores',      add: 19500 },
        { id: 'mixto',       label: 'Comisión + suscripción',          add: 32500 },
      ]},
    ],

    'app-nocode': [
      { id: 'plataforma', label: '¿Plataforma?', opciones: [
        { id: 'flutterflow', label: 'FlutterFlow · app real iOS+Android', add: 0 },
        { id: 'bubble',      label: 'Bubble · plataforma web',            add: 0 },
        { id: 'thunkable',   label: 'Thunkable · prototipo muy rápido',   add: 0 },
        { id: 'recomienda',  label: 'Que iBisne elija',                    add: 0 },
      ]},
      { id: 'funciones', label: '¿Funciones?', multi: true, opciones: [
        { id: 'push',     label: 'Notificaciones push',         add: 3500 },
        { id: 'login',    label: 'Cuentas de usuario',          add: 2500 },
        { id: 'pagos',    label: 'Cobrar dentro de la app',     add: 8000 },
        { id: 'geo',      label: 'Mapa y ubicación',            add: 5000 },
        { id: 'chat',     label: 'Chat entre usuarios',         add: 8000 },
      ]},
    ],

    'app-ios-android': [
      { id: 'tipo_app', label: '¿Qué hace tu app?', opciones: [
        { id: 'info',     label: 'Muestra información',           add: 0,     flag: 'app-info' },
        { id: 'login',    label: 'Con cuentas de usuario',        add: 13000, flag: 'auth-or-api' },
        { id: 'backend',  label: 'Marketplace / chat / tiempo real', add: 39000, flag: 'auth-or-api' },
        { id: 'fintech',  label: 'Maneja dinero · billetera',     add: 65000, flag: 'auth-or-api' },
      ]},
      { id: 'funciones', label: '¿Qué funciones?', multi: true, opciones: [
        { id: 'push',     label: 'Push notifications',                  add: 5000 },
        { id: 'chat',     label: 'Chat en vivo',                         add: 23500 },
        { id: 'geo',      label: 'Mapa y ubicación',                     add: 10500 },
        { id: 'camara',   label: 'Cámara / QR / OCR',                    add: 13000 },
        { id: 'pagos',    label: 'Pagos in-app',                         add: 15500 },
        { id: 'offline',  label: 'Funciona offline',                     add: 11500 },
        { id: 'biometria', label: 'Face ID / Huella',                    add: 6500 },
        { id: 'streaming', label: 'Streaming video/audio',               add: 23500 },
        { id: 'ia',       label: 'Inteligencia artificial',              add: 23500, flag: 'ia' },
      ]},
    ],

    'blockchain': [
      { id: 'tipo_proyecto', label: '¿Qué quieres construir?', opciones: [
        { id: 'nft',   label: 'Colección NFT',                  add: 0, flag: 'blockchain' },
        { id: 'token', label: 'Token / criptomoneda propia',    add: 26000, flag: 'blockchain' },
        { id: 'dapp',  label: 'App con contratos inteligentes', add: 65000, flag: 'blockchain' },
        { id: 'defi',  label: 'Finanzas descentralizadas',      add: 130000, flag: 'blockchain' },
      ]},
      { id: 'red', label: '¿En qué blockchain?', opciones: [
        { id: 'ethereum', label: 'Ethereum',                add: 0 },
        { id: 'polygon',  label: 'Polygon · barata y rápida', add: 0 },
        { id: 'solana',   label: 'Solana · ultra rápida',    add: 6500 },
        { id: 'no-se',    label: 'Que iBisne recomiende',    add: 0 },
      ]},
    ],

    'posts-10-redes': [
      { id: 'redes', label: '¿En qué redes?', multi: true, opciones: [
        { id: 'instagram', label: 'Instagram', add: 0 },
        { id: 'facebook',  label: 'Facebook',  add: 0 },
        { id: 'tiktok',    label: 'TikTok',    add: 199 },
        { id: 'linkedin',  label: 'LinkedIn',  add: 199 },
      ]},
      { id: 'urgencia', label: '¿Lo quieres hoy mismo?', opciones: [
        { id: 'normal',  label: 'Normal · 48-72 hrs',     add: 0 },
        { id: 'express', label: 'Express · 8 hrs hábiles', add: 299 },
      ]},
      { id: 'qr', label: '¿Con código QR personalizado?', opciones: [
        { id: 'no', label: 'No por ahora',              add: 0 },
        { id: 'si', label: 'Sí · agrega QR a 1 post',   add: 199 },
      ]},
    ],

    'posts-30-redes': [
      { id: 'redes', label: '¿En qué redes?', multi: true, opciones: [
        { id: 'instagram', label: 'Instagram', add: 0 },
        { id: 'facebook',  label: 'Facebook',  add: 0 },
        { id: 'tiktok',    label: 'TikTok',    add: 599 },
        { id: 'linkedin',  label: 'LinkedIn',  add: 599 },
      ]},
      { id: 'stories', label: '¿Incluir stories?', opciones: [
        { id: 'no',   label: 'No · solo posts en feed', add: 0 },
        { id: 'si',   label: 'Sí · agregar 30 stories', add: 999 },
      ]},
    ],

    'campania-ads': [
      { id: 'plataforma', label: '¿Qué plataforma?', multi: true, opciones: [
        { id: 'meta',    label: 'Meta (Facebook + Instagram)', add: 0 },
        { id: 'google',  label: 'Google Ads (búsqueda + display)', add: 3500 },
        { id: 'tiktok',  label: 'TikTok Ads',                   add: 3500 },
      ]},
      { id: 'objetivo', label: '¿Objetivo de la campaña?', opciones: [
        { id: 'leads',     label: 'Generar leads/contactos',      add: 0 },
        { id: 'ventas',    label: 'Generar ventas directas',      add: 2500 },
        { id: 'awareness', label: 'Awareness / posicionamiento',  add: 0 },
      ]},
    ],

    'social-mensual': [
      { id: 'redes', label: '¿Qué redes manejamos?', multi: true, opciones: [
        { id: 'instagram', label: 'Instagram', add: 0 },
        { id: 'facebook',  label: 'Facebook',  add: 0 },
        { id: 'tiktok',    label: 'TikTok',    add: 1999 },
        { id: 'linkedin',  label: 'LinkedIn',  add: 999 },
      ]},
      { id: 'ads', label: '¿Incluye pauta pagada?', opciones: [
        { id: 'no',  label: 'Solo orgánico',                add: 0 },
        { id: 'si',  label: 'Sí · $3,000 MXN de pauta',     add: 3000 },
      ]},
    ],

    'estrategia-90d': [
      { id: 'canales', label: '¿Qué canales priorizamos?', multi: true, opciones: [
        { id: 'ads',     label: 'Ads pagados (Meta/Google/TikTok)', add: 0 },
        { id: 'organico', label: 'Contenido orgánico',              add: 0 },
        { id: 'email',   label: 'Email marketing',                  add: 0 },
        { id: 'prensa',  label: 'Prensa / PR LATAM',                add: 19500 },
        { id: 'partnerships', label: 'Partnerships con marcas',     add: 9500 },
      ]},
    ],

    'chatbot-ia': [
      { id: 'canal', label: '¿Dónde vive el bot?', opciones: [
        { id: 'web',      label: 'En mi sitio web',                add: 0 },
        { id: 'whatsapp', label: 'En WhatsApp',                    add: 4500, flag: 'ia' },
        { id: 'app',      label: 'Dentro de una app',              add: 6500, flag: 'ia' },
        { id: 'multi',    label: 'Múltiples canales',              add: 9500, flag: 'ia' },
      ]},
      { id: 'fuente', label: '¿De dónde aprende?', opciones: [
        { id: 'web',    label: 'De mi sitio web',                  add: 0 },
        { id: 'docs',   label: 'PDFs y documentos',                add: 3500 },
        { id: 'sistema', label: 'Mi sistema interno (CRM, ERP)',   add: 9500 },
      ]},
    ],
  },

  // ═══ MODIFICADORES GLOBALES (toggles del carrito) ═════════════════════
  modificadores: {
    plazo: {
      urgente:  { mul: 1.5,  label: 'Express · entrega prioritaria', metaSuffix: '+50%' },
      normal:   { mul: 1.0,  label: 'Tiempo normal',                  metaSuffix: '' },
      flexible: { mul: 0.95, label: 'Flexible · sin prisa',           metaSuffix: '−5%' },
    },
    modo: {
      estandar: { mul: 1.0, label: 'Estándar',                        metaSuffix: '' },
      premium:  { mul: 1.4, label: 'Premium · equipo dedicado',       metaSuffix: '+40%' },
    },
  },

  // ═══ HELPERS ══════════════════════════════════════════════════════════
  getTier(total){
    if (total <= 0)        return { id: 'empty',      label: '—'         };
    if (total < 5000)      return { id: 'express',    label: 'EXPRESS'    };
    if (total < 25000)     return { id: 'starter',    label: 'STARTER'    };
    if (total < 80000)     return { id: 'standard',   label: 'STANDARD'   };
    if (total < 200000)    return { id: 'pro',        label: 'PRO'        };
    return                       { id: 'enterprise', label: 'ENTERPRISE' };
  },
  getTeam(total, flags){
    const team = ['KAM'];
    if (total >= 1500)                                                       team.push('Frontend');
    if (total >= 15000 || flags.has('auth-or-api') || flags.has('headless')) team.push('Backend');
    if (flags.has('animacion-pro'))                                          team.push('UX/UI');
    if (total >= 40000)                                                      team.push('PM');
    if (flags.has('ia') || flags.has('blockchain'))                          team.push('DevOps');
    if (total >= 80000)                                                      team.push('QA');
    return team;
  },
  getSpeed(total, flags, plazoMul, modoMul){
    let score = 50;
    if (total < 10000)        score = 25;
    else if (total < 50000)   score = 45;
    else if (total < 150000)  score = 65;
    else                       score = 85;
    if (flags && flags.has('animacion-pro')) score += 8;
    if (flags && (flags.has('ia') || flags.has('blockchain'))) score += 10;
    if (modoMul && modoMul === 1.4) score += 12;
    if (plazoMul === 1.5) score -= 6;
    else if (plazoMul === 0.95) score += 4;
    return Math.max(0, Math.min(100, score));
  },
  getSpeedText(speed){
    if (speed < 35) return 'Tu carrito apunta a entregables rápidos. Cero burocracia · iteramos en el camino.';
    if (speed < 70) return 'Tu carrito balancea alcance y pulido. Calidad de producción estándar.';
    return 'Tu carrito apunta a un producto premium · acabado de alta gama.';
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
      'web-bio':           ['HTML + CSS + JS vanilla',            'Hosting económico (Hostinger)'],
      'landing-simple':    ['Astro / HTML estático',              'Hosting económico (Hostinger)'],
      'landing-pro':       ['Astro + islands · TailwindCSS',      'Deploy en Hostinger'],
      'sitio-web':         ['Next.js 15 + React 19',              'Deploy en Vercel'],
      'ecommerce-1prod':   ['Astro + Stripe Checkout',            'Deploy en Hostinger'],
      'ecommerce-shopify': ['Shopify · Liquid + apps',            'Hosting Shopify nativo'],
      'ecommerce-pro':     ['Next.js + Shopify Storefront API',   'Deploy en Vercel + Railway'],
      'marketplace':       ['Next.js + Node/NestJS · PostgreSQL', 'Deploy en Vercel + Railway'],
      'app-nocode':        ['FlutterFlow / Bubble / Thunkable',   'Distribución según plataforma'],
      'app-ios-android':   ['React Native o Flutter · Firebase',  'App Store + Google Play'],
      'blockchain':        ['Smart contracts + Web3 frontend',    'Hosting híbrido (IPFS + cloud)'],
      'chatbot-ia':        ['LLM (OpenAI/Anthropic) + vector DB', 'Hosting según arquitectura'],
    };
    const unique = new Set();
    for (const s of servicios) {
      const tech = STACK_MAP[s.id];
      if (tech) tech.forEach(t => unique.add(t));
    }
    if (unique.size === 0) return ['Stack adecuado al alcance', 'Sin componente tecnológico complejo'];
    return Array.from(unique).slice(0, 4);
  },
  getTime(servicios){
    if (!Array.isArray(servicios) || servicios.length === 0) return '—';
    const TIME_ORDER = {
      'agendable': 0, '24-48hrs': 1, '24hrs': 2, '48hrs': 3, '8hrs': 4, '8hrs express': 5,
      '3 días': 6, '5-7 días': 7, '1 día': 8, '1 día + edición': 9,
      '1 sem': 10, '1-2 sem': 11, '2 sem': 12, '2-3 sem': 13,
      '1 mes': 14, '2-5 sem': 15, '4-8 sem': 16, '4-10 sem': 17,
      '6-10 sem': 18, '8-16 sem': 19, '10-20 sem': 20, '12-22 sem': 21,
      '12-24 sem': 22, '3 meses': 23, 'setup 48hrs': 1,
    };
    let longest = servicios[0].tiempo;
    let longestScore = TIME_ORDER[longest] || 99;
    for (const s of servicios) {
      const score = TIME_ORDER[s.tiempo] || 99;
      if (score > longestScore) { longest = s.tiempo; longestScore = score; }
    }
    return longest;
  },
};

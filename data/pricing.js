// data/pricing.js — Motor Rama B (Servicio · árbol jerárquico)
// Q1: Vertical macro (4 opciones)
// Q2: Sub-tipo (4 opciones según vertical)
// Q3: Alcance técnico (0-3 sub-preguntas según sub-tipo)
// Q4-Q8: Universales (diseño, identidad, idiomas, plazo, mantenimiento)
// Q9: Datos del cliente
//
// Cálculo: base + sum(adds) + identidad_add) × plazo_multiplicador

window.IBISNE_PRICING = {

  // ═══ Q1 — VERTICAL MACRO ════════════════════════════════════════════
  verticales: [
    {
      id: 'web', label: 'Sitio web', icon: 'sitio',
      category: 'Tu presencia online',
      subtitle: 'Una página personal o un sitio completo de tu marca',
      help: 'Tu lugar en internet · desde una página simple hasta un sitio multi-página de marca.',
    },
    {
      id: 'ecommerce', label: 'Tienda online', icon: 'ecommerce',
      category: 'Vender por internet',
      subtitle: 'De un solo producto a una plataforma con varios vendedores',
      help: 'Vende online · desde un solo producto hasta una plataforma con varios vendedores.',
    },
    {
      id: 'app', label: 'App de celular', icon: 'app',
      category: 'Producto para celular',
      subtitle: 'Para iPhone, Android o ambos',
      help: 'App para celular · para iPhone, Android, ambos, o una versión rápida sin código.',
    },
    {
      id: 'avanzado', label: 'Proyecto especializado', icon: 'saas',
      category: 'A la medida',
      subtitle: 'Inteligencia artificial, blockchain, plataforma de suscripción u otro',
      help: 'Proyectos hechos a la medida · cotización aproximada · la afinamos cuando hablemos contigo.',
    },
  ],

  // ═══ Q2 — SUB-TIPO (4 por vertical) ═════════════════════════════════
  subtipos: {

    web: [
      { id: 'biolink', label: 'Bio link · enlaces',  base: 6000,  icon: 'biolink', category: 'Página simple',
        subtitle: 'Una sola página con todos tus enlaces · redes, contacto, productos', branch: 'web-simple' },
      { id: 'landing', label: 'Landing de venta',    base: 23500, icon: 'landing', category: 'Captar interesados',
        subtitle: 'Una página enfocada en capturar correos o lanzar un producto', branch: 'web-standard' },
      { id: 'leads',   label: 'Página con encuesta', base: 36500, icon: 'leads',   category: 'Filtrar interesados',
        subtitle: 'Encuesta que filtra clientes antes de pasarlos a tu equipo de ventas', branch: 'web-standard' },
      { id: 'sitio',   label: 'Sitio completo',      base: 71500, icon: 'sitio',   category: 'Marca completa',
        subtitle: 'Sitio multi-página con secciones, blog, contacto · todo tu negocio online', branch: 'web-full' },
    ],

    ecommerce: [
      { id: 'single',      label: 'Un solo producto',         base: 28500, icon: 'biolink',     category: 'Venta enfocada',       branch: 'eco-simple',
        subtitle: 'Una página dedicada a vender UN producto · cero distracciones' },
      { id: 'shopify',     label: 'Tienda Shopify',           base: 97500, icon: 'ecommerce',   category: 'Catálogo gestionable',  branch: 'eco-shopify',
        subtitle: 'Tienda con varios productos · panel para que tú edites todo · sobre Shopify' },
      { id: 'headless',    label: 'Tienda online avanzada',   base: 234000, icon: 'saas',       category: 'Velocidad y SEO máximos',     branch: 'eco-headless',
        subtitle: 'Tienda construida desde cero · carga rapidísima · primera en Google · muchos productos' },
      { id: 'marketplace', label: 'Plataforma multi-vendor',  base: 416000, icon: 'marketplace', category: 'Tú cobras comisión', branch: 'eco-marketplace',
        subtitle: 'Plataforma donde varios vendedores publican y tú cobras comisión por cada venta' },
    ],

    app: [
      { id: 'ios',     label: 'App iPhone',           base: 234000, icon: 'ios',     category: 'Solo para iPhone',         branch: 'app-native',
        subtitle: 'Diseñada y construida exclusivamente para iPhone · máximo rendimiento' },
      { id: 'android', label: 'App Android',          base: 234000, icon: 'android', category: 'Solo para Android',        branch: 'app-native',
        subtitle: 'Diseñada y construida exclusivamente para Android · máximo rendimiento' },
      { id: 'hibrida', label: 'App iPhone + Android', base: 286000, icon: 'hybrid',  category: 'Una sola app para ambos',  branch: 'app-hybrid',
        subtitle: 'Una sola app que funciona en iPhone y Android · más eficiente que hacer dos por separado' },
      { id: 'nocode',  label: 'Prototipo rápido',     base: 45500,  icon: 'nocode',  category: 'Validar idea rápido',      branch: 'app-nocode',
        subtitle: 'App armada con herramientas visuales · lanzas en semanas para validar la idea con usuarios reales' },
    ],

    avanzado: [
      // v5.2.0 · Sin gate hunter · todos cotizan con base orientativa
      { id: 'ia',    label: 'Asistente con IA',     base: 104000, icon: 'chatbot', category: 'Bot inteligente',          branch: 'avanzado-ia',
        subtitle: 'Chat o asistente entrenado con info de tu negocio · responde clientes 24/7' },
      { id: 'web3',  label: 'App blockchain',       base: 234000, icon: 'saas',    category: 'Cripto · contratos · NFT', branch: 'avanzado-web3',
        subtitle: 'Aplicación con contratos en blockchain · cripto · NFTs · billeteras' },
      { id: 'saas',  label: 'Plataforma de suscripción', base: 260000, icon: 'saas', category: 'Cobro mensual recurrente', branch: 'avanzado-saas',
        subtitle: 'Producto digital con suscripción mensual o anual · cobros automáticos · cuentas y permisos' },
      { id: 'otro',  label: 'Otro proyecto',        base: 78000,  icon: 'otro',    category: 'Cuéntame qué imaginas',    branch: 'avanzado-custom',
        subtitle: 'Algo distinto · cuéntanos qué imaginas y te armamos cotización a la medida' },
    ],
  },

  // ═══ Q3 — ALCANCE TÉCNICO (sub-preguntas específicas) ═══════════════
  // Key formato: '{vertical}/{subtipo}' — vacío = sin sub-preguntas extras
  alcance: {

    // ── WEB · Bio-link (página simple) ──────────────────────────────
    'web-simple': [
      {
        id: 'enlaces', label: '¿Cuántos enlaces y secciones vas a poner?',
        help: 'Mientras más cosas tenga tu bio-link, más cuesta organizarlo bien.',
        opciones: [
          { id: 'basico',   label: 'Solo mis redes · 3-5 enlaces',          add: 0,    icon: 'biolink',
            subtitle: 'Instagram, TikTok, WhatsApp, etc. · sin secciones extras' },
          { id: 'medio',    label: 'Redes + productos o servicios · 6-15',  add: 2500, icon: 'landing',
            subtitle: 'Tus redes + sección de productos o servicios destacados' },
          { id: 'completo', label: 'Todo · catálogo · contacto · galería',   add: 6500, icon: 'sitio', intent: 'engagement',
            subtitle: 'Lista de productos, formulario contacto, galería de fotos · todo en una página' },
        ],
      },
    ],

    // ── WEB · Landing / Quiz (página de captación) ──────────────────
    'web-standard': [
      {
        id: 'objetivo', label: '¿Cuál es el objetivo principal?',
        help: 'La página se diseña distinto según el objetivo.',
        opciones: [
          { id: 'captar',    label: 'Capturar correos o WhatsApps',  add: 0,    icon: 'leads',
            subtitle: 'Formulario simple · llenas tu lista de contactos' },
          { id: 'vender',    label: 'Vender un producto o curso',    add: 6500, icon: 'fintech', intent: 'marketing',
            subtitle: 'Página de venta · con pago integrado' },
          { id: 'evento',    label: 'Inscripciones a evento / webinar', add: 4000, icon: 'star', intent: 'lanzamiento',
            subtitle: 'Página de invitación · captura asistentes con datos clave' },
          { id: 'agendar',   label: 'Que agenden llamada o cita',    add: 4500, icon: 'clock', intent: 'engagement',
            subtitle: 'Conectado a Calendly / Google Calendar · el cliente reserva su horario' },
        ],
      },
      {
        id: 'integraciones', label: '¿A qué herramientas se conectará?', multi: true,
        help: 'Marca las que ya usas · los datos llegan automáticamente ahí.',
        opciones: [
          // ── Email · marketing ───────────────────────────────────────
          { id: 'mailchimp', label: 'Email marketing (Mailchimp, Brevo)',    add: 3000, icon: 'leads',
            subtitle: 'Suscriptor → lista automática · campañas programables' },
          { id: 'crm',       label: 'CRM (HubSpot, Pipedrive, Salesforce)',  add: 5500, icon: 'partnership',
            subtitle: 'Lead → ficha de cliente en tu CRM · tu equipo da seguimiento' },
          { id: 'sheets',    label: 'Google Sheets · llenado automático',    add: 2000, icon: 'serverapp',
            subtitle: 'Cada lead se agrega como fila · sin tocar nada' },
          { id: 'airtable',  label: 'Airtable · base de datos visual',       add: 3500, icon: 'serverapp',
            subtitle: 'Mejor que Sheets para volumen alto · vistas Kanban/calendario' },
          { id: 'notion',    label: 'Notion · ficha de lead',                add: 3500, icon: 'edit',
            subtitle: 'Cada lead aparece como página de Notion para tu equipo' },

          // ── Mensajería ──────────────────────────────────────────────
          { id: 'whatsapp',  label: 'WhatsApp Business · auto-mensajes',     add: 4500, icon: 'whatsapp', intent: 'engagement',
            subtitle: 'Lead llega → mensaje WhatsApp automático con plantilla' },
          { id: 'slack',     label: 'Slack · notificación a tu equipo',      add: 2500, icon: 'partnership',
            subtitle: 'Lead nuevo → ping a canal de Slack en segundos' },
          { id: 'discord',   label: 'Discord · alerta de lead',              add: 2500, icon: 'partnership',
            subtitle: 'Lead nuevo → mensaje a tu servidor de Discord' },
          { id: 'telegram',  label: 'Telegram · bot que avisa',              add: 3000, icon: 'whatsapp',
            subtitle: 'Bot de Telegram te avisa cada vez que llega un lead' },

          // ── Tracking · ads ──────────────────────────────────────────
          { id: 'analytics', label: 'Google Analytics 4 + Meta Pixel',       add: 2500, icon: 'saas', intent: 'marketing',
            subtitle: 'Mide quién llega de dónde · base para optimizar' },
          { id: 'tiktok',    label: 'TikTok Pixel · conversiones',           add: 2500, icon: 'saas', intent: 'marketing',
            subtitle: 'Si haces ads en TikTok · trackea conversiones reales' },
          { id: 'gads-conv', label: 'Google Ads · seguimiento de conversiones', add: 3000, icon: 'saas', intent: 'marketing',
            subtitle: 'Que Google Ads aprenda qué keywords convierten · clave para escalar' },

          // ── Automatizaciones ────────────────────────────────────────
          { id: 'zapier',    label: 'Zapier / Make · conecta con lo que sea', add: 4500, icon: 'serverapp', intent: 'engagement',
            subtitle: 'Puente universal · conecta tu landing con 1000+ apps sin programar' },
          { id: 'calendly',  label: 'Calendly · auto-agendar llamada',       add: 2500, icon: 'clock', intent: 'engagement',
            subtitle: 'Lead califica → calendario embebido para que agende contigo' },
        ],
      },
    ],

    // ── WEB · Sitio completo (multi-página) ─────────────────────────
    'web-full': [
      {
        id: 'paginas', label: '¿Cuántas páginas tendrá tu sitio?',
        help: 'No cuentes header/footer · solo secciones principales (Home, Sobre, Servicios, etc.)',
        opciones: [
          { id: '3-5',   label: 'Pocas · 3 a 5 páginas',     add: 0,     icon: 'landing',
            subtitle: 'Home, Sobre, Servicios, Contacto · lo esencial' },
          { id: '6-10',  label: 'Medianas · 6 a 10 páginas', add: 9500,  icon: 'sitio', intent: 'engagement',
            subtitle: 'Más secciones · varios servicios o productos detallados' },
          { id: '10+',   label: 'Muchas · más de 10 páginas', add: 23500, icon: 'marketplace', intent: 'engagement',
            subtitle: 'Sitio robusto · catálogo, blog, casos de estudio, FAQ extenso' },
        ],
      },
      {
        id: 'blog', label: '¿Necesitas blog o sección de noticias?',
        opciones: [
          { id: 'no',     label: 'No por ahora',                         add: 0,    icon: 'biolink',
            subtitle: 'Sitio enfocado en productos/servicios · sin blog' },
          { id: 'simple', label: 'Sí · blog simple para publicar',       add: 8000, icon: 'leads', intent: 'engagement',
            subtitle: 'Panel para que tú publiques posts · categorías y autor' },
          { id: 'avanzado', label: 'Blog avanzado con SEO y comentarios', add: 19500, icon: 'saas', intent: 'marketing',
            subtitle: 'SEO optimizado · comentarios · suscriptores · estrategia de contenidos' },
        ],
      },
      {
        id: 'idiomas', label: '¿En cuántos idiomas?',
        help: 'Cada idioma extra requiere traducción y mantenimiento separado.',
        opciones: [
          { id: 'uno',      label: 'Solo en español',           add: 0,     icon: 'biolink' },
          { id: 'dos',      label: 'Español e inglés',          add: 11500, icon: 'partnership', intent: 'engagement' },
          { id: 'tres',     label: 'Tres o más idiomas',        add: 23500, icon: 'marketplace', intent: 'marketing' },
        ],
      },
      {
        id: 'extras', label: '¿Qué módulos necesita tu sitio?', multi: true,
        help: 'Funciones extra que activamos según necesidad · cada una se cotiza por separado.',
        opciones: [
          // ── Captación · contacto · leads ────────────────────────────
          { id: 'contacto',    label: 'Formulario de contacto con auto-respuesta', add: 3500, icon: 'leads',
            subtitle: 'Captura datos · responde automático al cliente' },
          { id: 'newsletter',  label: 'Suscripción a newsletter',                  add: 4000, icon: 'leads', intent: 'engagement',
            subtitle: 'Captura emails para campañas posteriores' },
          { id: 'popup',       label: 'Popup de captura · descuento o regalo',     add: 4500, icon: 'star', intent: 'marketing',
            subtitle: 'Aparece al primer scroll o salida · convierte visita en lead' },
          { id: 'whatsapp-btn', label: 'Botón flotante de WhatsApp',                add: 1500, icon: 'whatsapp', intent: 'engagement',
            subtitle: 'Botón verde fijo · abre WhatsApp con tu número pre-llenado' },

          // ── Citas · reservas · calendario ──────────────────────────
          { id: 'agenda',      label: 'Sistema de citas y reservas',               add: 9500, icon: 'clock', intent: 'engagement',
            subtitle: 'El cliente elige horario disponible · sincroniza con tu calendario (Google / Calendly)' },
          { id: 'reservas',    label: 'Calendario de reservas con confirmación',   add: 13000, icon: 'clock', intent: 'engagement',
            subtitle: 'Para restaurantes, hoteles, salones · email + recordatorios automáticos' },

          // ── Conversación · atención ─────────────────────────────────
          { id: 'chatbot',     label: 'Chatbot con IA · responde 24/7',            add: 11500, icon: 'chatbot', intent: 'engagement',
            subtitle: 'Bot inteligente entrenado con info de tu negocio · atiende sin tu intervención' },
          { id: 'chat-vivo',   label: 'Chat en vivo con tu equipo',                add: 6500, icon: 'chatbot', intent: 'engagement',
            subtitle: 'Tu equipo responde en tiempo real · Crisp / Intercom embebido' },

          // ── Contenido · administración ──────────────────────────────
          { id: 'cms',         label: 'Panel para editar contenido tú mismo',     add: 11500, icon: 'edit', intent: 'engagement',
            subtitle: 'Sin depender de nosotros · editas textos, imágenes, posts directo' },
          { id: 'galeria',     label: 'Galería de fotos / portafolio',            add: 5500, icon: 'sitio',
            subtitle: 'Cuadrícula o carrusel · filtros por categoría' },
          { id: 'video-bg',    label: 'Video destacado o video de fondo',         add: 4500, icon: 'star',
            subtitle: 'YouTube/Vimeo embed optimizado · hero impactante' },
          { id: 'testimonios', label: 'Carrusel de testimonios / casos',          add: 4000, icon: 'partnership',
            subtitle: 'Sección de pruebas sociales · rating + foto + comentario' },
          { id: 'faq',         label: 'FAQ interactiva (acordeón)',               add: 3000, icon: 'leads',
            subtitle: 'Preguntas frecuentes plegables · resuelve dudas antes de venta' },
          { id: 'timeline',    label: 'Línea de tiempo / proceso paso a paso',    add: 4500, icon: 'arrow',
            subtitle: 'Explica visualmente cómo trabajas · ideal para servicios' },
          { id: 'pricing-tbl', label: 'Tabla comparativa de planes / precios',    add: 5500, icon: 'fintech', intent: 'marketing',
            subtitle: 'Comparas hasta 4 planes con check/cross · CTA por columna' },

          // ── Marketing · tracking ────────────────────────────────────
          { id: 'analytics',   label: 'Analytics avanzado · Meta Pixel · TikTok', add: 2500, icon: 'saas',
            subtitle: 'GA4 + Meta Pixel + TikTok Pixel · tracking de conversiones' },
          { id: 'gads',        label: 'Tracking de Google Ads · conversiones',    add: 3500, icon: 'saas', intent: 'marketing',
            subtitle: 'Mide qué anuncio te trae cuántos clientes · optimiza presupuesto' },
          { id: 'seo-pro',     label: 'SEO técnico avanzado · schema · sitemap',  add: 7500, icon: 'saas', intent: 'marketing',
            subtitle: 'Datos estructurados, rich snippets, sitemap XML · primera fila Google' },
          { id: 'cookies',     label: 'Banner de cookies (GDPR)',                  add: 2500, icon: 'shield',
            subtitle: 'Cumplimiento legal · necesario si vendes en Europa o Eduardo lo pide' },

          // ── Funcional · usuarios ────────────────────────────────────
          { id: 'login',       label: 'Área de usuarios con login',                add: 19500, icon: 'login', intent: 'engagement',
            subtitle: 'Tus clientes crean cuenta · ven contenido privado · descargas exclusivas' },
          { id: 'miembros',    label: 'Área de miembros premium · contenido pago', add: 32500, icon: 'login', intent: 'marketing',
            subtitle: 'Suscripción mensual para acceso · ideal para cursos, comunidades' },
          { id: 'search',      label: 'Búsqueda interna del sitio',                add: 4500, icon: 'explore',
            subtitle: 'Barra de búsqueda con resultados instantáneos · útil con catálogos' },
          { id: 'mapa',        label: 'Mapa de ubicación interactivo',             add: 2000, icon: 'explore',
            subtitle: 'Google Maps embebido · con tus sucursales marcadas' },
          { id: 'multilang',   label: 'Selector de idioma adicional',              add: 9500, icon: 'partnership',
            subtitle: 'Si quieres otro idioma además de los que ya elegiste · agregable después' },

          // ── Performance · UX ────────────────────────────────────────
          { id: 'darkmode',    label: 'Modo oscuro / claro',                       add: 3000, icon: 'wrench',
            subtitle: 'Toggle entre tema oscuro y claro · respeta preferencia del sistema' },
          { id: 'pwa',         label: 'App instalable (PWA) · funciona offline',   add: 11500, icon: 'app', intent: 'engagement',
            subtitle: 'El sitio se instala como app en celular y desktop · funciona sin internet' },
          { id: 'animaciones', label: 'Animaciones avanzadas scroll-driven',       add: 9500, icon: 'star', intent: 'lanzamiento',
            subtitle: 'Efectos cinematográficos al hacer scroll · destacar marca premium' },
        ],
      },
    ],

    // ── ECOMMERCE · Single product (1 producto) ─────────────────────
    'eco-simple': [
      // v5.3.4 · Step 1 · Métodos de pago (qué acepta · sin costo)
      {
        id: 'metodos_pago', label: '¿Qué métodos de pago vas a aceptar?', multi: true,
        help: 'Primero elige QUÉ aceptas · en el siguiente paso te recomendamos las pasarelas óptimas.',
        opciones: [
          { id: 'tarjeta-nacional',      label: 'Tarjeta crédito / débito nacional',  add: 0, icon: 'fintech', subtitle: 'Visa, MasterCard, AmEx mexicanas' },
          { id: 'tarjeta-internacional', label: 'Tarjeta internacional',              add: 0, icon: 'fintech', subtitle: 'Clientes fuera de México' },
          { id: 'spei',                  label: 'SPEI / Transferencia bancaria',      add: 0, icon: 'wallet',  subtitle: 'Pago directo desde banco mexicano' },
          { id: 'oxxo',                  label: 'OXXO / Pago en efectivo',            add: 0, icon: 'cash',    subtitle: 'Cliente paga con código en tienda OXXO' },
          { id: 'paypal',                label: 'PayPal',                              add: 0, icon: 'wallet',  subtitle: 'Pagos internacionales · clientes con cuenta PayPal' },
          { id: 'apple-google',          label: 'Apple Pay · Google Pay',              add: 0, icon: 'phonepay', subtitle: 'Pago con un toque desde celular' },
          { id: 'cripto',                label: 'Criptomonedas',                       add: 0, icon: 'coin',    subtitle: 'USDC, Bitcoin · clientes web3' },
          { id: 'contra-entrega',        label: 'Pago contra entrega',                 add: 0, icon: 'ecommerce', subtitle: 'Cliente paga al recibir · típico LATAM' },
        ],
      },
      // v5.3.4 · Step 2 · Pasarelas (cómo integramos · con pre-fill auto)
      {
        id: 'pasarelas', label: '¿Con qué pasarelas las integramos?', multi: true,
        help: 'Te recomendamos estas para cubrir lo que elegiste · puedes ajustar lo que quieras.',
        opciones: [
          { id: 'mercadopago', label: 'Mercado Pago',          add: 6500, icon: 'wallet', intent: 'engagement',
            covers: ['tarjeta-nacional', 'spei', 'oxxo', 'apple-google'],
            subtitle: 'Cubre tarjetas + SPEI + OXXO + Apple/Google Pay en una integración' },
          { id: 'stripe',      label: 'Stripe',                add: 6500, icon: 'fintech', intent: 'marketing',
            covers: ['tarjeta-nacional', 'tarjeta-internacional', 'apple-google'],
            subtitle: 'Tarjetas nacionales + internacionales + Apple/Google Pay' },
          { id: 'paypal',      label: 'PayPal',                add: 5500, icon: 'wallet',
            covers: ['paypal'],
            subtitle: 'Solo PayPal a PayPal · clientes con cuenta' },
          { id: 'oxxo',        label: 'OXXO y transferencia',  add: 7500, icon: 'cash', intent: 'engagement',
            covers: ['oxxo', 'spei'],
            subtitle: 'Efectivo en tienda + transferencia bancaria · sin Mercado Pago' },
          { id: 'apple-google', label: 'Apple Pay · Google Pay separado', add: 6500, icon: 'phonepay',
            covers: ['apple-google'],
            subtitle: 'Si quieres Apple/Google Pay sin Mercado Pago ni Stripe' },
          { id: 'cripto',      label: 'Criptomonedas (Coinbase Commerce)', add: 13000, icon: 'coin', intent: 'lanzamiento',
            covers: ['cripto'],
            subtitle: 'USDC, Bitcoin · cobro on-chain' },
          { id: 'contra-entrega', label: 'Pago contra entrega', add: 6500, icon: 'ecommerce', intent: 'engagement',
            covers: ['contra-entrega'],
            subtitle: 'Cobro al momento de recibir · configuración manual' },
        ],
      },
      {
        id: 'envio', label: '¿Cómo vas a enviar el producto?',
        opciones: [
          { id: 'digital',   label: 'Es digital · no se envía',         add: 0,    icon: 'arrow',
            subtitle: 'Curso, ebook, software · entrega por correo automático' },
          { id: 'manual',    label: 'Yo gestiono los envíos a mano',     add: 0,    icon: 'biolink' },
          { id: 'automatico', label: 'Cálculo automático de envío',     add: 6500, icon: 'marketplace', intent: 'engagement',
            subtitle: 'Calcula costo de envío según CP · genera guías DHL/Estafeta' },
        ],
      },
    ],
    'eco-shopify': [
      {
        id: 'catalogo', label: '¿Cuántos productos manejas?',
        opciones: [
          { id: '<50',    label: 'Menos de 50',     add: 0,    icon: 'biolink' },
          { id: '50-500', label: 'Entre 50 y 500',  add: 6500, icon: 'ecommerce' },
          { id: '500+',   label: 'Más de 500',      add: 19500, icon: 'marketplace' },
        ],
      },
      // v5.3.4 · Step 1 · Métodos de pago (sin costo)
      {
        id: 'metodos_pago', label: '¿Qué métodos de pago vas a aceptar?', multi: true,
        help: 'Primero elige QUÉ aceptas · en el siguiente paso te recomendamos las pasarelas óptimas.',
        opciones: [
          { id: 'tarjeta-nacional',      label: 'Tarjeta crédito / débito nacional',  add: 0, icon: 'fintech', subtitle: 'Visa, MasterCard, AmEx mexicanas' },
          { id: 'tarjeta-internacional', label: 'Tarjeta internacional',              add: 0, icon: 'fintech', subtitle: 'Clientes fuera de México' },
          { id: 'spei',                  label: 'SPEI / Transferencia bancaria',      add: 0, icon: 'wallet',  subtitle: 'Pago directo desde banco mexicano' },
          { id: 'oxxo',                  label: 'OXXO / Pago en efectivo',            add: 0, icon: 'cash',    subtitle: 'Cliente paga con código en tienda OXXO' },
          { id: 'paypal',                label: 'PayPal',                              add: 0, icon: 'wallet',  subtitle: 'Pagos internacionales · clientes con cuenta PayPal' },
          { id: 'apple-google',          label: 'Apple Pay · Google Pay',              add: 0, icon: 'phonepay', subtitle: 'Pago con un toque desde celular' },
          { id: 'cripto',                label: 'Criptomonedas',                       add: 0, icon: 'coin',    subtitle: 'USDC, Bitcoin · clientes web3' },
          { id: 'contra-entrega',        label: 'Pago contra entrega',                 add: 0, icon: 'ecommerce', subtitle: 'Cliente paga al recibir · típico LATAM' },
          { id: 'pos-fisico',            label: 'Cobro en tienda física (POS)',        add: 0, icon: 'shield',  subtitle: 'Si tienes tienda física además de online' },
        ],
      },
      // v5.3.4 · Step 2 · Pasarelas con covers (pre-fill auto)
      {
        id: 'pasarelas', label: '¿Con qué pasarelas las integramos?', multi: true,
        help: 'Te recomendamos estas para cubrir lo que elegiste · puedes ajustar lo que quieras.',
        opciones: [
          { id: 'mercadopago',  label: 'Mercado Pago',           add: 8000, icon: 'wallet', intent: 'engagement',
            covers: ['tarjeta-nacional', 'spei', 'oxxo', 'apple-google'],
            subtitle: 'Cubre tarjetas + SPEI + OXXO + Apple/Google Pay en una sola integración' },
          { id: 'stripe',       label: 'Stripe',                 add: 8000, icon: 'fintech', intent: 'marketing',
            covers: ['tarjeta-nacional', 'tarjeta-internacional', 'apple-google'],
            subtitle: 'Tarjetas nacionales + internacionales + Apple/Google Pay' },
          { id: 'mercadolibre', label: 'Mercado Libre',          add: 11500, icon: 'marketplace', intent: 'marketing',
            covers: ['tarjeta-nacional'],
            subtitle: 'Sincronización con tu cuenta de Mercado Libre' },
          { id: 'oxxo-spei',    label: 'OXXO / SPEI',            add: 9000, icon: 'cash', intent: 'engagement',
            covers: ['oxxo', 'spei'],
            subtitle: 'Efectivo + transferencia bancaria · sin Mercado Pago' },
          { id: 'paypal',       label: 'PayPal',                 add: 6500, icon: 'wallet',
            covers: ['paypal'],
            subtitle: 'Solo PayPal a PayPal · clientes con cuenta' },
          { id: 'apple-google', label: 'Apple Pay · Google Pay separado', add: 8000, icon: 'phonepay',
            covers: ['apple-google'],
            subtitle: 'Si quieres Apple/Google Pay sin Mercado Pago ni Stripe' },
          { id: 'pos-retail',   label: 'POS retail físico',      add: 18000, icon: 'shield', intent: 'engagement',
            covers: ['pos-fisico'],
            subtitle: 'Shopify POS · cobro en tienda física · inventario sincronizado' },
          { id: 'cripto',       label: 'Criptomonedas (Coinbase Commerce)', add: 23500, icon: 'coin', intent: 'lanzamiento',
            covers: ['cripto'],
            subtitle: 'USDC, BTC · cobro on-chain' },
          { id: 'contra-entrega', label: 'Pago contra entrega',  add: 8500, icon: 'ecommerce', intent: 'engagement',
            covers: ['contra-entrega'],
            subtitle: 'Cobro al momento de recibir · configuración manual' },
        ],
      },
    ],
    'eco-headless': [
      {
        id: 'catalogo', label: '¿Cuántos productos manejas?',
        opciones: [
          { id: '<500',  label: 'Menos de 500',     add: 0,    icon: 'biolink' },
          { id: '500-5k',label: '500 a 5,000',      add: 15500, icon: 'ecommerce' },
          { id: '5k+',   label: 'Más de 5,000',     add: 32500, icon: 'marketplace' },
        ],
      },
      // v5.3.4 · Step 1 · Métodos de pago (sin costo)
      {
        id: 'metodos_pago', label: '¿Qué métodos de pago vas a aceptar?', multi: true,
        help: 'Primero elige QUÉ aceptas · en el siguiente paso te recomendamos las pasarelas óptimas.',
        opciones: [
          { id: 'tarjeta-nacional',      label: 'Tarjeta crédito / débito nacional',  add: 0, icon: 'fintech', subtitle: 'Visa, MasterCard, AmEx mexicanas' },
          { id: 'tarjeta-internacional', label: 'Tarjeta internacional',              add: 0, icon: 'fintech', subtitle: 'Clientes fuera de México' },
          { id: 'spei',                  label: 'SPEI / Transferencia bancaria',      add: 0, icon: 'wallet',  subtitle: 'Pago directo desde banco mexicano' },
          { id: 'oxxo',                  label: 'OXXO / Pago en efectivo',            add: 0, icon: 'cash',    subtitle: 'Cliente paga con código en tienda OXXO' },
          { id: 'paypal',                label: 'PayPal',                              add: 0, icon: 'wallet',  subtitle: 'Pagos internacionales · clientes con cuenta PayPal' },
          { id: 'apple-google',          label: 'Apple Pay · Google Pay',              add: 0, icon: 'phonepay', subtitle: 'Pago con un toque desde celular' },
          { id: 'cripto',                label: 'Criptomonedas',                       add: 0, icon: 'coin',    subtitle: 'USDC, Bitcoin · clientes web3' },
          { id: 'contra-entrega',        label: 'Pago contra entrega',                 add: 0, icon: 'ecommerce', subtitle: 'Cliente paga al recibir · típico LATAM' },
          { id: 'pos-fisico',            label: 'Cobro en tienda física (POS)',        add: 0, icon: 'shield',  subtitle: 'Si tienes tienda física además de online' },
        ],
      },
      // v5.3.4 · Step 2 · Pasarelas con covers (pre-fill auto)
      {
        id: 'pasarelas', label: '¿Con qué pasarelas las integramos?', multi: true,
        help: 'Te recomendamos estas para cubrir lo que elegiste · puedes ajustar lo que quieras.',
        opciones: [
          { id: 'mercadopago',  label: 'Mercado Pago',           add: 11500, icon: 'wallet', intent: 'engagement',
            covers: ['tarjeta-nacional', 'spei', 'oxxo', 'apple-google'],
            subtitle: 'Cubre tarjetas + SPEI + OXXO + Apple/Google Pay en una sola integración' },
          { id: 'stripe',       label: 'Stripe',                 add: 11500, icon: 'fintech', intent: 'marketing',
            covers: ['tarjeta-nacional', 'tarjeta-internacional', 'apple-google'],
            subtitle: 'Tarjetas nacionales + internacionales + Apple/Google Pay · referencia mundial' },
          { id: 'mercadolibre', label: 'Mercado Libre',          add: 18000, icon: 'marketplace', intent: 'marketing',
            covers: ['tarjeta-nacional'],
            subtitle: 'Tu tienda se sincroniza con tu cuenta de Mercado Libre' },
          { id: 'oxxo-spei',    label: 'OXXO y transferencia',   add: 11500, icon: 'cash', intent: 'engagement',
            covers: ['oxxo', 'spei'],
            subtitle: 'Efectivo en tienda + transferencia bancaria · sin Mercado Pago' },
          { id: 'paypal',       label: 'PayPal',                 add: 9000,  icon: 'wallet',
            covers: ['paypal'],
            subtitle: 'Solo PayPal a PayPal · clientes internacionales con cuenta' },
          { id: 'apple-google', label: 'Apple Pay · Google Pay separado', add: 11500, icon: 'phonepay',
            covers: ['apple-google'],
            subtitle: 'El cliente paga con un toque del celular · sin Mercado Pago ni Stripe' },
          { id: 'pos-retail',   label: 'Cobro en tienda física (POS)', add: 23500, icon: 'shield', intent: 'engagement',
            covers: ['pos-fisico'],
            subtitle: 'Punto de venta · conectado al inventario online' },
          { id: 'cripto',       label: 'Criptomonedas (Coinbase Commerce)', add: 28500, icon: 'coin', intent: 'lanzamiento',
            covers: ['cripto'],
            subtitle: 'USDC, Bitcoin · cobro directo en cripto' },
          { id: 'contra-entrega', label: 'Pago contra entrega',  add: 11500, icon: 'ecommerce', intent: 'engagement',
            covers: ['contra-entrega'],
            subtitle: 'El cliente paga al recibir el producto · configuración manual' },
        ],
      },
      {
        id: 'integraciones', label: '¿Con qué sistemas se conectará tu tienda?', multi: true,
        help: 'Marca los que ya usas o vas a usar · cada uno se cotiza como módulo de integración.',
        opciones: [
          // ── Sistemas administrativos ────────────────────────────────
          { id: 'erp',          label: 'Sistema administrativo / ERP',           add: 19500, icon: 'serverapp', intent: 'engagement',
            subtitle: 'SAP, Odoo, Contpaq · sincronía con tu contabilidad e inventario' },
          { id: 'crm',          label: 'Sistema de clientes / CRM',              add: 10500, icon: 'partnership',
            subtitle: 'HubSpot, Pipedrive · seguimiento de leads y ventas' },
          { id: 'pos',          label: 'Punto de venta físico (POS)',            add: 15500, icon: 'shield', intent: 'engagement',
            subtitle: 'Inventario sincronizado entre tienda física y online' },

          // ── Envíos · logística ──────────────────────────────────────
          { id: '3pl',          label: 'Servicio de envíos automáticos',         add: 13000, icon: 'marketplace',
            subtitle: 'Estafeta, DHL, FedEx, Mienvio · auto-genera guías' },
          { id: 'tracking',     label: 'Rastreo de pedidos en tiempo real',      add: 7500, icon: 'arrow', intent: 'engagement',
            subtitle: 'El cliente ve dónde va su pedido · reduce dudas y devoluciones' },

          // ── Marketing · retención ───────────────────────────────────
          { id: 'mkt',          label: 'Email marketing automático',             add: 4000,  icon: 'leads',
            subtitle: 'Mailchimp, Klaviyo · campañas, segmentos, A/B testing' },
          { id: 'abandoned',    label: 'Carrito abandonado · recordatorios',     add: 6500, icon: 'leads', intent: 'marketing',
            subtitle: 'Email automático a quien dejó el carrito a medias · recupera 15-25% de ventas' },
          { id: 'reviews',      label: 'Reseñas de productos · sociales',        add: 5500, icon: 'star', intent: 'engagement',
            subtitle: 'Cliente compra → email pide reseña · publica en producto + Google' },
          { id: 'afiliados',    label: 'Programa de afiliados / referidos',      add: 13000, icon: 'partnership', intent: 'marketing',
            subtitle: 'Influencers o clientes refieren · cobran comisión por venta' },
          { id: 'lealtad',      label: 'Programa de lealtad / puntos',           add: 11500, icon: 'star', intent: 'engagement',
            subtitle: 'Cliente acumula puntos · canjea descuentos · vuelve a comprar' },
          { id: 'cupones',      label: 'Cupones y descuentos automáticos',       add: 4500, icon: 'fintech', intent: 'marketing',
            subtitle: 'Códigos por % o monto · primera compra, cumpleaños, campañas' },

          // ── Atención al cliente ─────────────────────────────────────
          { id: 'chatbot-vta', label: 'Chatbot de ventas con IA',                add: 13000, icon: 'chatbot', intent: 'engagement',
            subtitle: 'Bot recomienda productos · resuelve dudas · agenda venta · 24/7' },
          { id: 'wa-pedidos',  label: 'Pedidos por WhatsApp',                    add: 8500, icon: 'whatsapp', intent: 'engagement',
            subtitle: 'Cliente toma fotos del catálogo y compra por WhatsApp · ideal LATAM' },

          // ── Tracking · analytics ────────────────────────────────────
          { id: 'analytics',   label: 'Google Analytics 4 + e-commerce events',  add: 3500, icon: 'saas', intent: 'marketing',
            subtitle: 'Mide cada paso del funnel · qué producto vende, dónde abandonan' },
          { id: 'meta-tiktok', label: 'Meta Pixel + TikTok Pixel + Google Ads',  add: 4500, icon: 'saas', intent: 'marketing',
            subtitle: 'Conversiones trackeadas en todas las plataformas de ads' },
        ],
      },
    ],
    'eco-marketplace': [
      {
        id: 'modelo', label: '¿Cómo vas a ganar dinero?',
        help: 'Cómo cobras a los vendedores que publican en tu plataforma.',
        opciones: [
          { id: 'comision',    label: 'Solo comisión por venta',          add: 0,     icon: 'fintech', subtitle: 'Te quedas con un % de cada venta · vendedor solo paga cuando vende' },
          { id: 'suscripcion', label: 'Suscripción de los vendedores',    add: 19500, icon: 'login', subtitle: 'Cada vendedor paga mensualidad fija para tener su tienda' },
          { id: 'mixto',       label: 'Comisión + suscripción',           add: 32500, icon: 'marketplace', subtitle: 'Combinas ambos · mejor margen pero más complejo' },
        ],
      },
    ],

    // App nativa / híbrida (mismo set de preguntas)
    'app-native': [
      {
        id: 'tipo_app', label: '¿Qué hace tu app?',
        opciones: [
          { id: 'info',    label: 'Muestra información',           icon: 'info_app', add: 0, intent: 'lanzamiento',
            description: 'Catálogo, contenido, info de tu negocio · sin necesidad de cuentas de usuario.' },
          { id: 'login',   label: 'Con cuentas de usuario',         icon: 'login', add: 13000, intent: 'engagement',
            description: 'Cada usuario crea su cuenta · guarda sus preferencias, historial, favoritos.' },
          { id: 'backend', label: 'Marketplace · chat · tiempo real', icon: 'serverapp', add: 39000, intent: 'engagement',
            description: 'Usuarios conectan entre sí · chat, social, marketplace · necesita servidor propio.' },
          { id: 'fintech', label: 'Maneja dinero · billetera',      icon: 'fintech', add: 65000, intent: 'marketing',
            description: 'Pagos, billetera digital, transferencias · más seguridad y trámites legales.' },
        ],
      },
      {
        id: 'funciones', label: '¿Qué funciones necesita?', multi: true,
        help: 'Marca todas las que apliquen · cada una se cotiza por separado.',
        opciones: [
          // ── Comunicación ────────────────────────────────────────────
          { id: 'push',       label: 'Avisos al celular (push)',                  add: 5000,  icon: 'info_app',  intent: 'engagement',
            description: 'Notificaciones que aparecen aunque la app esté cerrada · ideales para retomar al usuario.' },
          { id: 'chat',       label: 'Chat o mensajes en vivo',                   add: 23500, icon: 'chatbot', intent: 'engagement',
            description: 'Conversación entre usuarios o con tu equipo de soporte.' },
          { id: 'video-call', label: 'Videollamadas / audio en vivo',             add: 32500, icon: 'chatbot', intent: 'engagement',
            description: 'Tipo Zoom / FaceTime dentro de la app · WebRTC.' },
          { id: 'share',      label: 'Compartir en redes sociales',                add: 3000, icon: 'partnership',
            description: 'Botón nativo para compartir contenido a IG, WA, X, etc.' },

          // ── Ubicación · mapa ────────────────────────────────────────
          { id: 'geo',        label: 'Mapa y ubicación',                          add: 10500, icon: 'explore',   intent: 'engagement',
            description: 'Mapa, búsqueda por ubicación, seguimiento en tiempo real (Google Maps / Mapbox).' },
          { id: 'rutas',      label: 'Rutas y navegación turn-by-turn',           add: 13000, icon: 'explore', intent: 'engagement',
            description: 'Tipo Uber/Rappi · la app calcula y muestra ruta paso a paso.' },

          // ── Captura · escaneo ───────────────────────────────────────
          { id: 'camara',     label: 'Cámara · escanear QR o documentos',         add: 13000, icon: 'camera',
            description: 'Sacar foto, escanear código QR, leer documentos automáticamente (OCR).' },
          { id: 'biometria',  label: 'Face ID / Huella digital',                  add: 6500, icon: 'shield', intent: 'engagement',
            description: 'Login con cara o dedo · seguridad alta · UX premium.' },
          { id: 'ar',         label: 'Realidad aumentada (AR)',                   add: 39000, icon: 'star', intent: 'marketing',
            description: 'Filtros tipo Snap, probarse cosas virtual, ver muebles en tu casa. ARKit / ARCore.' },

          // ── Pagos · monetización ────────────────────────────────────
          { id: 'pagos-in',   label: 'Cobrar dentro de la app',                   add: 15500, icon: 'fintech', intent: 'marketing',
            description: 'Suscripciones App Store / Google Play o cobrar tarjeta directo (Stripe).' },
          { id: 'wallet',     label: 'Billetera digital · saldo interno',         add: 26000, icon: 'wallet', intent: 'marketing',
            description: 'Usuario carga saldo · paga con saldo · transfiere a otros usuarios.' },

          // ── Tiempo · agenda ─────────────────────────────────────────
          { id: 'agenda',     label: 'Calendario / agenda de citas',              add: 11500, icon: 'clock', intent: 'engagement',
            description: 'Citas, reservas, recordatorios · sincroniza con calendario del celular.' },
          { id: 'reminders',  label: 'Recordatorios programados',                  add: 4500, icon: 'clock',
            description: 'Alarmas, notificaciones a horarios específicos, recordatorios diarios.' },

          // ── Offline · sync ──────────────────────────────────────────
          { id: 'offline',    label: 'Funciona sin internet',                     add: 11500, icon: 'wrench',
            description: 'La app sigue funcionando offline · sincroniza cuando vuelve la conexión.' },

          // ── Login · cuentas ─────────────────────────────────────────
          { id: 'social',     label: 'Login con Google / Apple / Facebook',       add: 4500, icon: 'login', intent: 'engagement',
            description: 'Login con un toque · sin tener que llenar formularios.' },

          // ── Multimedia ──────────────────────────────────────────────
          { id: 'streaming',  label: 'Video / audio streaming · player nativo',   add: 23500, icon: 'star', intent: 'engagement',
            description: 'Reproductor optimizado para videos largos · controles, calidad, offline.' },
          { id: 'voice',      label: 'Comandos de voz / dictado',                 add: 13000, icon: 'chatbot',
            description: 'Usuario habla y la app entiende · ideal para accesibilidad o conducir.' },

          // ── Conectividad ────────────────────────────────────────────
          { id: 'bluetooth',  label: 'Bluetooth · conectar con dispositivos',     add: 19500, icon: 'wrench', intent: 'engagement',
            description: 'BLE · conectar con wearables, beacons, sensores, dispositivos IoT.' },
          { id: 'widgets',    label: 'Widgets para pantalla de inicio',            add: 9500, icon: 'sitio', intent: 'engagement',
            description: 'Mini app en la home del celular · acceso rápido sin abrir la app.' },

          // ── Inteligencia ────────────────────────────────────────────
          { id: 'ia',         label: 'Inteligencia artificial · recomendaciones', add: 23500, icon: 'chatbot',   flag: 'ia', intent: 'marketing',
            description: 'Sugerencias personalizadas según comportamiento del usuario.' },

          // ── Métricas internas ───────────────────────────────────────
          { id: 'analytics',  label: 'Panel admin · métricas para tu equipo',     add: 8000,  icon: 'saas',      intent: 'marketing',
            description: 'Dashboard donde tú ves cuántos usuarios, qué hacen, qué venden.' },
        ],
      },
      {
        id: 'backend', label: '¿Dónde se guarda la información de los usuarios?',
        help: 'El "cerebro" que guarda cuentas, mensajes, pedidos, etc.',
        opciones: [
          { id: 'firebase', label: 'Sistema rápido de Google (Firebase)', add: 13000, icon: 'shield',
            description: 'Servicio ya armado · gratis hasta cierto uso · ideal para arrancar rápido.' },
          { id: 'node',     label: 'Servidor propio de la marca',          add: 39000, icon: 'serverapp', intent: 'engagement',
            description: 'Servidor 100% tuyo · control total · necesario si manejas datos sensibles o escala grande.' },
          { id: 'existing', label: 'Ya tengo un sistema y lo conecto',     add: 6500,  icon: 'api',
            description: 'Tu negocio ya tiene un sistema (ERP, CRM, etc.) y la app solo lo consume.' },
        ],
      },
    ],
    'app-hybrid': [
      {
        id: 'tipo_app', label: '¿Qué hace tu app?',
        opciones: [
          { id: 'info',    label: 'Muestra información',           icon: 'info_app', add: 0, intent: 'lanzamiento',
            description: 'Catálogo, contenido, info de tu negocio · sin necesidad de cuentas de usuario.' },
          { id: 'login',   label: 'Con cuentas de usuario',         icon: 'login', add: 13000, intent: 'engagement',
            description: 'Cada usuario crea su cuenta · guarda sus preferencias, historial, favoritos.' },
          { id: 'backend', label: 'Marketplace · chat · tiempo real', icon: 'serverapp', add: 39000, intent: 'engagement',
            description: 'Usuarios conectan entre sí · chat, social, marketplace · necesita servidor propio.' },
          { id: 'fintech', label: 'Maneja dinero · billetera',      icon: 'fintech', add: 65000, intent: 'marketing',
            description: 'Pagos, billetera digital, transferencias · más seguridad y trámites legales.' },
        ],
      },
      {
        id: 'funciones', label: '¿Qué funciones necesita?', multi: true,
        help: 'Marca todas las que apliquen.',
        opciones: [
          // ── Comunicación ────────────────────────────────────────────
          { id: 'push',       label: 'Avisos al celular (push)',                  add: 5000,  icon: 'info_app',    intent: 'engagement' },
          { id: 'chat',       label: 'Chat o mensajes en vivo',                   add: 23500, icon: 'chatbot',  intent: 'engagement' },
          { id: 'video-call', label: 'Videollamadas / audio en vivo',             add: 32500, icon: 'chatbot', intent: 'engagement' },
          { id: 'share',      label: 'Compartir en redes sociales',                add: 3000, icon: 'partnership' },
          // ── Ubicación · mapa ────────────────────────────────────────
          { id: 'geo',        label: 'Mapa y ubicación',                          add: 10500, icon: 'explore',     intent: 'engagement' },
          { id: 'rutas',      label: 'Rutas y navegación turn-by-turn',           add: 13000, icon: 'explore', intent: 'engagement' },
          // ── Captura · escaneo ───────────────────────────────────────
          { id: 'camara',     label: 'Cámara · escanear QR o documentos',         add: 13000, icon: 'camera' },
          { id: 'biometria',  label: 'Face ID / Huella digital',                  add: 6500, icon: 'shield', intent: 'engagement' },
          { id: 'ar',         label: 'Realidad aumentada (AR)',                   add: 39000, icon: 'star', intent: 'marketing' },
          // ── Pagos · monetización ────────────────────────────────────
          { id: 'pagos-in',   label: 'Cobrar dentro de la app',                   add: 15500, icon: 'fintech', intent: 'marketing' },
          { id: 'wallet',     label: 'Billetera digital · saldo interno',         add: 26000, icon: 'wallet', intent: 'marketing' },
          // ── Tiempo · agenda ─────────────────────────────────────────
          { id: 'agenda',     label: 'Calendario / agenda de citas',              add: 11500, icon: 'clock', intent: 'engagement' },
          { id: 'reminders',  label: 'Recordatorios programados',                  add: 4500, icon: 'clock' },
          // ── Offline · sync ──────────────────────────────────────────
          { id: 'offline',    label: 'Funciona sin internet',                     add: 11500, icon: 'wrench' },
          // ── Login · cuentas ─────────────────────────────────────────
          { id: 'social',     label: 'Login con Google / Apple / Facebook',       add: 4500, icon: 'login', intent: 'engagement' },
          // ── Multimedia ──────────────────────────────────────────────
          { id: 'streaming',  label: 'Video / audio streaming · player nativo',   add: 23500, icon: 'star', intent: 'engagement' },
          { id: 'voice',      label: 'Comandos de voz / dictado',                 add: 13000, icon: 'chatbot' },
          // ── Conectividad ────────────────────────────────────────────
          { id: 'bluetooth',  label: 'Bluetooth · conectar con dispositivos',     add: 19500, icon: 'wrench', intent: 'engagement' },
          { id: 'widgets',    label: 'Widgets para pantalla de inicio',            add: 9500, icon: 'sitio', intent: 'engagement' },
          // ── Inteligencia ────────────────────────────────────────────
          { id: 'ia',         label: 'Inteligencia artificial · recomendaciones', add: 23500, icon: 'chatbot',    flag: 'ia', intent: 'marketing' },
          // ── Métricas internas ───────────────────────────────────────
          { id: 'analytics',  label: 'Panel admin · métricas para tu equipo',     add: 8000,  icon: 'saas',       intent: 'marketing' },
        ],
      },
      {
        id: 'backend', label: '¿Dónde se guarda la información de los usuarios?',
        opciones: [
          { id: 'firebase', label: 'Sistema rápido de Google (Firebase)', add: 13000, icon: 'shield',
            description: 'Servicio ya armado · ideal para arrancar rápido.' },
          { id: 'node',     label: 'Servidor propio de la marca',          add: 39000, icon: 'serverapp', intent: 'engagement',
            description: 'Servidor 100% tuyo · control total · escalable.' },
          { id: 'existing', label: 'Ya tengo un sistema y lo conecto',     add: 6500,  icon: 'api',
            description: 'Tu negocio ya tiene un sistema y la app solo lo consume.' },
        ],
      },
    ],
    // ── AVANZADO · Asistente con IA ─────────────────────────────────
    'avanzado-ia': [
      {
        id: 'uso_ia', label: '¿Para qué vas a usar la IA?',
        opciones: [
          { id: 'atencion', label: 'Atender clientes 24/7',                add: 0,     icon: 'chatbot',
            subtitle: 'Bot que responde preguntas frecuentes · libera a tu equipo' },
          { id: 'ventas',   label: 'Calificar leads y agendar ventas',     add: 13000, icon: 'leads', intent: 'marketing',
            subtitle: 'Bot que pregunta, filtra y agenda con tu equipo de ventas' },
          { id: 'interno',  label: 'Asistente interno para mi equipo',     add: 19500, icon: 'partnership', intent: 'engagement',
            subtitle: 'IA que conoce tus procesos · ayuda a tu equipo a trabajar más rápido' },
          { id: 'producto', label: 'Función dentro de mi producto',        add: 26000, icon: 'saas', intent: 'marketing',
            subtitle: 'La IA es parte de la experiencia que vendes a tus clientes' },
        ],
      },
      {
        id: 'fuente_info', label: '¿De dónde sacará la información?',
        help: 'La IA necesita "saber" sobre tu negocio para responder bien.',
        opciones: [
          { id: 'web',       label: 'De mi sitio web actual',           add: 6500,  icon: 'sitio' },
          { id: 'docs',      label: 'PDFs, manuales y documentos',      add: 11500, icon: 'edit' },
          { id: 'sistema',   label: 'Mi sistema interno (CRM, ERP)',    add: 19500, icon: 'serverapp', intent: 'engagement' },
          { id: 'todo',      label: 'Combinación de varios',            add: 26000, icon: 'marketplace', intent: 'marketing' },
        ],
      },
      {
        id: 'canal', label: '¿Dónde van a usar la IA tus clientes?',
        opciones: [
          { id: 'web',       label: 'En mi sitio web',                   add: 0,     icon: 'sitio' },
          { id: 'whatsapp',  label: 'Por WhatsApp',                      add: 9500,  icon: 'whatsapp', intent: 'engagement' },
          { id: 'app',       label: 'Dentro de una app de celular',      add: 13000, icon: 'app' },
          { id: 'multi',     label: 'Varios canales · web + WA + redes', add: 19500, icon: 'marketplace', intent: 'marketing' },
        ],
      },
    ],

    // ── AVANZADO · Web3 / Blockchain ────────────────────────────────
    'avanzado-web3': [
      {
        id: 'tipo_proyecto', label: '¿Qué quieres construir?',
        opciones: [
          { id: 'nft',       label: 'Colección NFT · arte digital',     add: 0,     icon: 'star' },
          { id: 'token',     label: 'Token propio · criptomoneda',      add: 26000, icon: 'coin', intent: 'engagement' },
          { id: 'dapp',      label: 'Aplicación con contratos inteligentes', add: 65000, icon: 'serverapp', intent: 'engagement',
            subtitle: 'Tu lógica vive en blockchain · usuarios interactúan con su billetera' },
          { id: 'defi',      label: 'Finanzas descentralizadas (DeFi)', add: 130000, icon: 'fintech', intent: 'marketing',
            subtitle: 'Préstamos, staking, intercambio · proyectos complejos' },
        ],
      },
      {
        id: 'red', label: '¿En qué blockchain?',
        opciones: [
          { id: 'ethereum',  label: 'Ethereum · la más establecida',   add: 0,     icon: 'shield' },
          { id: 'polygon',   label: 'Polygon · más barata y rápida',   add: 0,     icon: 'arrow' },
          { id: 'solana',    label: 'Solana · ultra rápida',           add: 6500,  icon: 'star' },
          { id: 'no-se',     label: 'No estoy seguro · que iBisne recomiende', add: 0, icon: 'partnership',
            subtitle: 'Te recomendamos según costos, audiencia y objetivos' },
        ],
      },
    ],

    // ── AVANZADO · Plataforma SaaS ──────────────────────────────────
    'avanzado-saas': [
      {
        id: 'modelo_cobro', label: '¿Cómo vas a cobrar a tus clientes?',
        opciones: [
          { id: 'mensual',   label: 'Suscripción mensual o anual',       add: 0,     icon: 'fintech' },
          { id: 'uso',       label: 'Por uso · cobras según consumo',    add: 13000, icon: 'serverapp', intent: 'engagement',
            subtitle: 'Tipo Stripe, Twilio, AWS · más complejo de calcular' },
          { id: 'tiers',     label: 'Por tiers · planes Free / Pro / Enterprise', add: 9500, icon: 'partnership', intent: 'marketing' },
        ],
      },
      {
        id: 'usuarios_proyectados', label: '¿Cuántos usuarios proyectas en año 1?',
        help: 'Define cuánto debe escalar el servidor desde el inicio.',
        opciones: [
          { id: '<100',      label: 'Menos de 100',         add: 0,     icon: 'biolink',
            subtitle: 'Validas la idea con primeros clientes · servidor económico' },
          { id: '100-1k',    label: 'Entre 100 y 1,000',    add: 13000, icon: 'partnership' },
          { id: '1k-10k',    label: 'Entre 1,000 y 10,000', add: 32500, icon: 'marketplace', intent: 'engagement' },
          { id: '10k+',      label: 'Más de 10,000',        add: 65000, icon: 'saas', intent: 'marketing',
            subtitle: 'Necesita arquitectura escalable · servidores distribuidos' },
        ],
      },
      {
        id: 'caracteristicas', label: '¿Qué necesita tu plataforma?', multi: true,
        opciones: [
          { id: 'equipos',     label: 'Cuentas con varios usuarios (equipos)', add: 11500, icon: 'partnership', intent: 'engagement' },
          { id: 'permisos',    label: 'Roles y permisos · admin/editor/lector', add: 9500, icon: 'shield' },
          { id: 'integraciones', label: 'Integraciones con otras herramientas', add: 13000, icon: 'serverapp' },
          { id: 'api',         label: 'API pública para que otros se conecten', add: 19500, icon: 'api', intent: 'engagement' },
          { id: 'admin',       label: 'Panel de admin (para mi equipo interno)', add: 11500, icon: 'edit' },
          { id: 'notifs',      label: 'Notificaciones por email automáticas',   add: 4000,  icon: 'leads' },
        ],
      },
    ],

    // ── AVANZADO · Otro (custom) ────────────────────────────────────
    'avanzado-custom': [
      {
        id: 'descripcion', label: '¿Qué es lo que necesitas?',
        help: 'Esto nos ayuda a darte una primera cotización · la afinamos en discovery.',
        opciones: [
          { id: 'simple',    label: 'Algo simple · sé que cuesta poco',       add: 0,     icon: 'biolink',
            subtitle: 'Proyecto pequeño · automatización, integración simple' },
          { id: 'medio',     label: 'Algo de complejidad media',              add: 26000, icon: 'sitio', intent: 'engagement',
            subtitle: 'Algo que ningún servicio existente cubre · requiere pensar la solución' },
          { id: 'grande',    label: 'Algo grande · plataforma o sistema',     add: 78000, icon: 'marketplace', intent: 'marketing',
            subtitle: 'Sistema robusto · varios módulos · escalable' },
          { id: 'no-se',     label: 'No tengo idea de tamaño · ayúdenme',     add: 0,     icon: 'partnership',
            subtitle: 'Lo platicamos en discovery · sin compromiso' },
        ],
      },
    ],

    'app-nocode': [
      {
        id: 'plataforma', label: '¿Con qué herramienta la construimos?',
        help: 'Diferentes plataformas según el caso · te recomendamos la mejor si no sabes.',
        opciones: [
          { id: 'flutterflow', label: 'Para app de celular con servidor',  add: 0, icon: 'hybrid',
            description: 'FlutterFlow · genera app real para iPhone y Android · ideal si necesita guardar info de usuarios.' },
          { id: 'bubble',      label: 'Para plataforma web compleja',      add: 0, icon: 'nocode',
            description: 'Bubble · ideal para marketplaces y plataformas de suscripción que viven en web.' },
          { id: 'thunkable',   label: 'Para app simple muy rápida',        add: 0, icon: 'android',
            description: 'Thunkable · armada con bloques visuales · perfecta para validar idea en pocas semanas.' },
          { id: 'recomienda',  label: 'No estoy seguro · que iBisne elija', add: 0, icon: 'star',
            description: 'Elegimos la mejor plataforma según lo que necesites y tu presupuesto.' },
        ],
      },
      {
        id: 'funciones', label: '¿Qué necesita hacer la app?', multi: true,
        help: 'Marca todas las que apliquen.',
        opciones: [
          { id: 'push',       label: 'Avisos al celular',                add: 3500, icon: 'info_app', intent: 'engagement' },
          { id: 'login',      label: 'Acceso rápido con Google / Apple', add: 2500, icon: 'login',    intent: 'engagement' },
          { id: 'pagos-in',   label: 'Cobrar dentro de la app',          add: 8000, icon: 'fintech',  intent: 'marketing' },
          { id: 'geo',        label: 'Mapa y ubicación',                 add: 5000, icon: 'explore',  intent: 'engagement' },
          { id: 'camara',     label: 'Cámara y escanear códigos QR',     add: 6500, icon: 'camera' },
        ],
      },
    ],
  },

  // ═══ Q4-Q8 — UNIVERSALES (aplican a todos los caminos) ══════════════
  universales: [
    {
      id: 'diseno', label: '¿Cómo quieres que se vea tu proyecto?',
      help: 'Mientras más a la medida lo quieras, más cuesta · pero también es más único.',
      opciones: [
        { id: 'template', label: 'Bonito y sencillo',                  add: 0,      icon: 'landing',
          subtitle: 'Partimos de una base ya diseñada · la ajustamos a tu marca · listo rápido' },
        { id: 'custom',   label: 'Diseño a la medida',                 add: 52000,  icon: 'sitio', intent: 'engagement',
          subtitle: 'Diseñado desde cero exclusivamente para ti · estándar profesional' },
        { id: 'premium',  label: 'Diseño premium con animaciones',     add: 104000, icon: 'partnership', flag: 'animacion-pro', intent: 'lanzamiento',
          subtitle: 'Diseño cinematográfico con animaciones · efecto wow · marcas que quieren destacar' },
      ],
    },
    {
      id: 'identidad', label: '¿Cómo está la identidad de tu marca?',
      help: 'Logo, colores, tipografías, manual de uso · lo que define cómo se ve tu marca.',
      opciones: [
        { id: 'tengo',       label: 'Ya tengo todo definido',       add: 0,     icon: 'partnership',
          subtitle: 'Tienes logo, colores, tipografías y manual · lo usamos tal cual' },
        { id: 'modernizar',  label: 'Tengo logo pero está viejo',   add: 23500, icon: 'sitio', intent: 'engagement',
          subtitle: 'Tu marca existe pero quieres actualizarla · le damos refresh visual' },
        { id: 'desde-cero',  label: 'No tengo nada · empezar desde 0', add: 78000, icon: 'dtc', intent: 'lanzamiento',
          subtitle: 'Construimos toda la identidad: logo, colores, tipografías, manual · todo nuevo' },
      ],
    },
    {
      id: 'lanzamiento', label: '¿Cómo quieres lanzar tu proyecto?',
      help: 'Esto va más allá de entregarte el producto · es cómo lo dejamos vivo y captando clientes.',
      opciones: [
        { id: 'solo-entrega', label: 'Solo entrega · yo me encargo del lanzamiento', add: 0, icon: 'arrow',
          subtitle: 'Te damos el producto listo · tú lo lanzas, promueves y haces marketing' },
        { id: 'basico',       label: 'Paquete básico de lanzamiento',                add: 19500, icon: 'star', intent: 'engagement',
          subtitle: 'Setup de tracking + 1 campaña de email anuncio + posts pre-armados para redes' },
        { id: 'completo',     label: 'Paquete completo · campaña de lanzamiento',   add: 52000, icon: 'partnership', intent: 'marketing',
          subtitle: 'Campaña pagada de 30 días (Meta/Google) · landing pre-venta · email marketing · prensa LATAM' },
        { id: 'pro',          label: 'Lanzamiento pro · estrategia full-funnel',    add: 130000, icon: 'marketplace', intent: 'lanzamiento',
          subtitle: 'Estrategia 90 días · ads multi-canal · contenidos · partnerships · prensa · medición' },
      ],
    },
    {
      id: 'soporte', label: '¿Qué soporte necesitas después de entregar?',
      help: 'Cuánto tiempo nos quedamos contigo después del go-live · cambios, ajustes, mantenimiento.',
      opciones: [
        { id: 'incluido',  label: 'El año de seguimiento que ya incluimos',       add: 0,     icon: 'clock',
          subtitle: 'Ajustes menores y consultas vía WhatsApp · sin costo extra el primer año' },
        { id: 'extendido', label: 'Extender soporte a 2 años',                     add: 23500, icon: 'shield', intent: 'engagement',
          subtitle: 'Año 2 incluido · ajustes menores, consultas, monitoreo activo' },
        { id: 'mtto',      label: 'Mantenimiento técnico · actualizaciones',       add: 39000, icon: 'wrench', intent: 'engagement',
          subtitle: 'Updates de seguridad, librerías, plugins · backups · uptime garantizado' },
        { id: 'partner',   label: 'Partner tecnológico · iBisne contigo siempre', add: 78000, icon: 'partnership', intent: 'marketing',
          subtitle: 'KAM dedicado · 10h/mes incluidas para nuevas features, ajustes, asesoría · escala con tu negocio' },
      ],
    },
    {
      id: 'plazo', label: '¿Para cuándo lo necesitas listo?',
      help: 'Si tienes prisa cobramos más · si nos das tiempo te damos descuento.',
      opciones: [
        { id: 'urgente',  label: 'Tengo prisa · lo necesito YA',    mul: 1.4,  metaSuffix: '+40%', icon: 'arrow', intent: 'marketing',
          subtitle: 'Lo subimos a la primera fila · recargo del 40% por priorización' },
        { id: 'estandar', label: 'Tiempo normal · cuando esté listo', mul: 1.0, icon: 'clock',
          subtitle: 'Ritmo normal de producción · ni rápido ni lento · sin recargo' },
        { id: 'flexible', label: 'Sin prisa · cuando puedan',       mul: 0.95, metaSuffix: '−5%', icon: 'star', intent: 'lanzamiento',
          subtitle: 'Optimizamos nuestra agenda · te damos 5% de descuento por la flexibilidad' },
      ],
    },
    // v5.3.0 · Soporte / KAM / Mesa de trabajo / 24/7 ahora viven como
    // opciones one-time dentro de "soporte" (no como suscripciones).
    // Mantenemos el modelo de cotizador puro · sin recurring revenue.
  ],

  // ═══ TIERS, EQUIPO, TIEMPO ══════════════════════════════════════════
  getTier(total){
    if (total <= 0)        return { id: 'empty',    label: '—'        };
    if (total < 15000)     return { id: 'starter',  label: 'STARTER'   };
    if (total < 60000)     return { id: 'standard', label: 'STANDARD'  };
    if (total < 150000)    return { id: 'pro',      label: 'PRO'       };
    return                       { id: 'enterprise',label: 'ENTERPRISE'};
  },

  getTeam(total, flags){
    const team = ['KAM', 'Frontend']; // KAM siempre activo (coordina entrega) + Frontend
    if (total > 20000 || flags.has('auth-or-api') || flags.has('headless'))  team.push('Backend');
    if (flags.has('animacion-pro'))                                          team.push('UX/UI');
    if (total > 40000)                                                       team.push('PM');
    if (flags.has('ia') || flags.has('blockchain') || flags.has('headless')) team.push('DevOps');
    if (total > 80000)                                                       team.push('QA');
    return team;
  },

  // Velocidad de salida del proyecto (0 = MVP rápido, 100 = premium acabado)
  getSpeed(total, subtipo, flags, plazoMul){
    let score = 50;
    if (total < 30000) score = 22;
    else if (total < 80000) score = 50;
    else score = 80;
    if (flags && flags.has('animacion-pro')) score += 10;
    if (flags && (flags.has('ia') || flags.has('blockchain') || flags.has('headless'))) score += 12;
    if (subtipo && subtipo.id === 'nocode') score = Math.min(score, 18);
    if (plazoMul === 1.4) score -= 5;       // urgente empuja a MVP
    else if (plazoMul === 0.95) score += 5; // flexible permite acabado
    return Math.max(0, Math.min(100, score));
  },

  getSpeedText(speed){
    if (speed < 35) return 'Tu selección apunta a un producto mínimo viable. Salimos a la calle y iteramos con datos reales.';
    if (speed < 70) return 'Tu selección apunta a un producto estándar. Balance entre alcance y pulido.';
    return 'Tu selección apunta a un producto premium, con acabado de alta gama.';
  },
  getSpeedZone(speed){
    if (speed < 35) return 'mvp';
    if (speed < 70) return 'estandar';
    return 'premium';
  },

  // Stack tecnológico + hosting sugerido por sub-tipo.
  // Regla: hosting económico (Hostinger) para sitios estáticos / livianos.
  // Vercel sólo cuando hay SSR/edge real (Next.js dinámico, headless, SaaS).
  // Shopify se hostea solo. Apps no se "deployan" en un host web.
  getStack(vertical, subtipo){
    const key = (vertical || '') + '/' + (subtipo || '');
    const map = {
      // ── Web ─────────────────────────────────────────────────────────
      'web/biolink': ['HTML + CSS + JS vanilla', 'Tipografías Google Fonts', 'Deploy en Hostinger'],
      'web/landing': ['Astro / HTML estático', 'Tailwind CSS + animaciones ligeras', 'Deploy en Hostinger'],
      'web/leads':   ['Astro + islands interactivas', 'Tailwind CSS · validación cliente', 'Deploy en Hostinger'],
      'web/sitio':   ['Next.js 15 + React 19', 'TypeScript + Framer Motion', 'Deploy en Vercel'],

      // ── Ecommerce ───────────────────────────────────────────────────
      'ecommerce/single':      ['Astro / HTML + Stripe Checkout', 'Tailwind CSS', 'Deploy en Hostinger'],
      'ecommerce/shopify':     ['Shopify · Liquid + theme custom', 'Apps Shopify (reviews, mkt, etc.)', 'Hosting nativo de Shopify'],
      'ecommerce/headless':    ['Next.js 15 + Shopify Storefront API', 'TypeScript + ISR', 'Deploy en Vercel'],
      'ecommerce/marketplace': ['Next.js 15 + Node / NestJS', 'PostgreSQL + Prisma · Stripe Connect', 'Deploy en Vercel + Railway'],

      // ── App móvil ───────────────────────────────────────────────────
      'app/ios':     ['Swift + SwiftUI', 'Firebase / Supabase', 'Distribución vía App Store'],
      'app/android': ['Kotlin + Jetpack Compose', 'Firebase / Supabase', 'Distribución vía Google Play'],
      'app/hibrida': ['React Native o Flutter', 'Firebase / Supabase', 'Distribución App Store + Google Play'],
      'app/nocode':  ['FlutterFlow / Bubble / Thunkable', 'Backend integrado de la plataforma', 'Distribución según plataforma'],

      // ── Avanzado ────────────────────────────────────────────────────
      'avanzado/ia':   ['Stack a definir en discovery', 'LLM + vector DB · OpenAI / Anthropic', 'Hosting según arquitectura'],
      'avanzado/web3': ['Stack a definir en discovery', 'Smart contracts + frontend Web3', 'Hosting híbrido (IPFS + cloud)'],
      'avanzado/saas': ['Next.js 15 + Node / NestJS', 'PostgreSQL · Stripe Billing', 'Deploy en Vercel + Railway'],
      'avanzado/otro': ['Stack a definir en discovery', 'Arquitectura custom', 'Hosting según necesidad'],
    };
    return map[key] || ['Stack a definir', 'Tecnología según alcance', 'Hosting según arquitectura'];
  },

  getTime(vertical, subtipo, total){
    const ranges = {
      'web/biolink':       [1, 2],
      'web/landing':       [1, 4],
      'web/leads':         [2, 6],
      'web/sitio':         [4, 12],
      'ecommerce/single':  [2, 5],
      'ecommerce/shopify': [4, 10],
      'ecommerce/headless':[8, 16],
      'ecommerce/marketplace':[12, 24],
      'app/ios':           [10, 20],
      'app/android':       [10, 20],
      'app/hibrida':       [12, 22],
      'app/nocode':        [4, 10],
    };
    const key = vertical + '/' + subtipo;
    const r = ranges[key] || [4, 8];
    if (total < 30000) return r[0] + ' semanas';
    if (total < 100000) return Math.round((r[0]+r[1])/2) + ' semanas';
    return r[1] + ' semanas';
  },
};

// data/pricing.js — v8.4.0 · Catálogo 4 megas · 19 servicios visibles
//
// Cambios respecto a v8.2.0:
//   · 4 mega-categorías (Web · Apps · Ecommerce · Automatizaciones)
//   · Nueva mega Ecommerce con 4 servicios: ec-mini, ec-shopify, ec-tienda, ec-app
//   · web-tienda MUDADO a ec-tienda (preserva su subflow con pequeños ajustes)
//   · Web queda con 4 servicios (biolink, landing, funnel, sitio)
//   · 19 servicios totales visibles
//
// Estructura: window.IBISNE_PRICING = { megaCategorias, servicios, subflow, modificadores, helpers }

window.IBISNE_PRICING = {

  // ═══ MEGA-CATEGORÍAS (4) · serviciosIds directo ══════════════════════
  megaCategorias: [
    {
      id: 'web', label: 'Desarrollo web', icon: 'sitio',
      summary: 'Tu presencia en internet',
      info: 'Desde una página de enlaces hasta un sitio completo con CMS y módulos. Si tus clientes lo abren en un navegador, va aquí.',
      serviciosIds: ['web-biolink', 'web-landing', 'web-funnel', 'web-sitio'],
    },
    {
      id: 'apps', label: 'Apps', icon: 'app',
      summary: 'Tu negocio en el bolsillo del cliente',
      info: 'Aplicaciones nativas o web (PWA). Elige plataforma; nosotros nos encargamos del resto.',
      serviciosIds: ['app-pwa', 'app-android', 'app-ios', 'app-ambas', 'app-desktop'],
    },
    {
      id: 'ecommerce', label: 'Ecommerce', icon: 'ecommerce',
      summary: 'Vende tus productos online',
      info: 'Desde una landing de 1 producto hasta una tienda multi-producto, en código propio, Shopify o app nativa.',
      serviciosIds: ['ec-mini', 'ec-shopify', 'ec-tienda', 'ec-app'],
    },
    {
      id: 'auto', label: 'Automatizaciones', icon: 'chatbot',
      summary: 'Que el trabajo repetitivo se haga solo',
      info: 'Chatbots, agendas, integraciones y procesos. Todo lo que podamos vivir-codear para tu operación.',
      serviciosIds: ['auto-chatbot', 'auto-agenda', 'auto-integraciones', 'auto-procesos', 'auto-asesoria'],
    },
  ],

  // ═══ SERVICIOS · 18 en total · indexados por id ══════════════════════
  servicios: {

    // ── Web (4) ──────────────────────────────────────────────────────
    'web-biolink': {
      label: 'Bio link / Página de enlaces', base: 6250, tier: 'micro',
      tiempo: '3-7 días', icon: 'sitio',
      subtitle: 'Tu IG en una sola liga · redes, productos, WhatsApp',
      subflow: true,
    },
    'web-landing': {
      label: 'Landing page', base: 20000, tier: 'medio',
      tiempo: '1-2 sem', icon: 'sitio',
      subtitle: 'Una página que convence y convierte',
      subflow: true,
    },
    'web-funnel': {
      label: 'Funnel de ventas', base: 37500, tier: 'medio',
      tiempo: '2-4 sem', icon: 'leads',
      subtitle: 'Secuencia paso a paso hasta la compra',
      subflow: true,
    },
    'web-sitio': {
      label: 'Sitio web completo', base: 62500, tier: 'grande',
      tiempo: '3-8 sem', icon: 'sitio',
      subtitle: 'Tu negocio entero online · varias secciones, CMS, módulos',
      subflow: true,
    },
    // ── Apps (5) ─────────────────────────────────────────────────────
    'app-pwa': {
      label: 'Web app (PWA)', base: 45000, tier: 'medio',
      tiempo: '3-8 sem', icon: 'app',
      subtitle: 'Se abre del navegador y se instala como app · sin tiendas',
      subflow: true,
    },
    'app-android': {
      label: 'App de Android', base: 87500, tier: 'grande',
      tiempo: '5-14 sem', icon: 'app',
      subtitle: 'App nativa publicada en Google Play',
      subflow: true,
    },
    'app-ios': {
      label: 'App de iPhone', base: 112500, tier: 'grande',
      tiempo: '5-14 sem', icon: 'app',
      subtitle: 'App nativa publicada en App Store',
      subflow: true,
    },
    'app-ambas': {
      label: 'iPhone + Android', base: 162500, tier: 'grande',
      tiempo: '6-16 sem', icon: 'app',
      subtitle: 'Una sola app para las dos tiendas · la más común',
      subflow: true,
    },
    'app-desktop': {
      label: 'App de escritorio', base: 125000, tier: 'grande',
      tiempo: '5-14 sem', icon: 'serverapp',
      subtitle: 'Para Windows / Mac · uso interno o profesional',
      subflow: true,
    },

    // ── Ecommerce (4) ────────────────────────────────────────────────
    'ec-mini': {
      label: 'Landing de 1 producto', base: 20000, tier: 'medio', tiempo: '1-2 sem', icon: 'ecommerce',
      subtitle: 'Una página enfocada en vender UN producto · ideal para validar',
      subflow: true,
    },
    'ec-shopify': {
      label: 'Tienda en Shopify', base: 30000, tier: 'medio', tiempo: '2-4 sem', icon: 'ecommerce',
      subtitle: 'Tienda en plataforma de terceros · rápido de salir · ~30% más barato',
      subflow: true,
    },
    'ec-tienda': {
      label: 'Tienda en código propio', base: 87500, tier: 'grande', tiempo: '3-12 sem', icon: 'ecommerce',
      subtitle: 'Tu tienda 100% a la medida · escalable a marketplace',
      subflow: true,
    },
    'ec-app': {
      label: 'Ecommerce app nativa', base: 137500, tier: 'grande', tiempo: '6-14 sem', icon: 'app',
      subtitle: 'Tu tienda como app en App Store y Google Play',
      subflow: true,
    },

    // ── Automatizaciones (5) ─────────────────────────────────────────
    'auto-chatbot': {
      label: 'Chatbot con IA', base: 20000, tier: 'medio',
      tiempo: '1-4 sem', icon: 'chatbot',
      subtitle: 'Atiende 24/7 en WhatsApp, web o redes',
      subflow: true,
    },
    'auto-agenda': {
      label: 'Agendamiento automático', base: 12500, tier: 'medio',
      tiempo: '1-2 sem', icon: 'edit',
      subtitle: 'Citas online · calendario sincronizado',
      subflow: true,
    },
    'auto-integraciones': {
      label: 'Integraciones entre sistemas', base: 17500, tier: 'medio',
      tiempo: '1-3 sem', icon: 'partnership',
      subtitle: 'Conecta tu CRM, pasarela, inventario · que hablen entre sí',
      subflow: true,
    },
    'auto-procesos': {
      label: 'Automatización de procesos', base: 30000, tier: 'medio',
      tiempo: '2-5 sem', icon: 'serverapp',
      subtitle: 'Reportes, formularios, flujos · que se haga solo',
      subflow: true,
    },
    'auto-asesoria': {
      label: 'Asesoría / Capacitación', base: 2497.5, tier: 'micro',
      tiempo: 'agendable', icon: 'partnership',
      subtitle: '1-a-1 o equipo · te enseñamos a usar todo esto',
      subflow: true,
    },
  },

  // ═══ SUB-FLOW · una pregunta a la vez · add (suma) | mul (factor) ════
  subflow: (function(){

    // ── Subflow compartido para los 5 servicios de Apps (5 preguntas) ──
    // Plataforma ya está definida en el servicio · no se repregunta aquí.
    const APP_SUBFLOW = [
      { id: 'tipo', label: '¿A la medida o no-code?',
        help: 'No-code es más rápido y económico para validar. A la medida da control total.',
        opciones: [
          { id: 'nocode', label: 'No-code',
            subtitle: 'Más rápido y económico · ideal para validar', mul: 0.55 },
          { id: 'medida', label: 'A la medida',
            subtitle: 'Control total · escalable a largo plazo', mul: 1.0 },
        ]},
      { id: 'proposito', label: '¿Para qué la usas?',
        opciones: [
          { id: 'catalogo',      label: 'Catálogo + info',            add: 0 },
          { id: 'contenido',     label: 'Contenido + comunidad',      add: 20000 },
          { id: 'transacciones', label: 'Transacciones / e-commerce', add: 45000 },
          { id: 'mvp',           label: 'MVP para validar',           add: 0 },
          { id: 'interno',       label: 'Interno / operación',        add: 25000 },
        ]},
      { id: 'diseno', label: '¿Diseño?',
        opciones: [
          { id: 'plantilla', label: 'Plantilla',                add: 0 },
          { id: 'medida',    label: 'Personalizado',            add: 45000 },
          { id: 'replica',   label: 'Réplica de marca',         add: 20000 },
        ]},
      { id: 'login', label: '¿Necesita login?',
        opciones: [
          { id: 'no',     label: 'No',                          add: 0 },
          { id: 'email',  label: 'Email + password',            add: 12500 },
          { id: 'redes',  label: 'Login con redes sociales',    add: 22500 },
          { id: 'perfiles', label: 'Login + perfiles',          add: 35000, flag: 'auth-or-api' },
        ]},
      { id: 'funciones', label: '¿Funciones especiales?', multi: true,
        help: 'Marca todas las que apliquen · puedes dejar vacío.',
        opciones: [
          { id: 'push',       label: 'Notificaciones push',     add: 12500 },
          { id: 'geo',        label: 'Geolocalización',         add: 22500 },
          { id: 'chat',       label: 'Chat in-app',             add: 40000 },
          { id: 'camara',     label: 'Cámara / escáner',        add: 25000 },
          { id: 'pagos',      label: 'Pagos in-app',            add: 30000 },
          { id: 'offline',    label: 'Offline',                 add: 25000 },
          { id: 'ia',         label: 'IA generativa',           add: 55000, flag: 'ia' },
          { id: 'streaming',  label: 'Streaming de video',      add: 50000 },
        ]},
    ];

    return {

      // ── Bio link (3 preguntas) ────────────────────────────────────
      'web-biolink': [
        { id: 'enlaces', label: '¿Cuántos enlaces?',
          opciones: [
            { id: 'pocos',    label: 'Pocos · 3 a 5',    add: 0 },
            { id: 'medianos', label: 'Medianos · 6 a 12', add: 3750 },
            { id: 'muchos',   label: 'Muchos · 13+',      add: 8750 },
          ]},
        { id: 'diseno', label: '¿Diseño?',
          opciones: [
            { id: 'plantilla', label: 'Plantilla',         add: 0 },
            { id: 'custom',    label: 'Personalizado',     add: 10000 },
            { id: 'replica',   label: 'Réplica de marca',  add: 6250 },
          ]},
        { id: 'extras', label: '¿Algo extra?', multi: true,
          help: 'Marca los que apliquen · puedes dejar vacío.',
          opciones: [
            { id: 'whatsapp',  label: 'WhatsApp directo',  add: 1250 },
            { id: 'analytics', label: 'Analytics',         add: 2000 },
            { id: 'pixel',     label: 'Pixel de ads',      add: 2500 },
            { id: 'form',      label: 'Form de captura',   add: 5000 },
          ]},
      ],

      // ── Landing page (4 preguntas) ────────────────────────────────
      'web-landing': [
        { id: 'objetivo', label: '¿Qué vas a promover?',
          opciones: [
            { id: 'producto',    label: 'Producto o servicio',   add: 0 },
            { id: 'evento',      label: 'Evento',                add: 2500 },
            { id: 'leadgen',     label: 'Captación de leads',    add: 5000 },
            { id: 'prelanzamiento', label: 'Pre-lanzamiento',    add: 3750 },
          ]},
        { id: 'secciones', label: '¿Qué tan larga?',
          opciones: [
            { id: 'corta',  label: 'Corta · 3 a 5 secciones',  add: 0 },
            { id: 'media',  label: 'Media · 6 a 10 secciones', add: 10000 },
            { id: 'larga',  label: 'Larga · 11 o más',         add: 22500 },
          ]},
        { id: 'diseno', label: '¿Diseño?',
          opciones: [
            { id: 'plantilla', label: 'Plantilla',         add: 0 },
            { id: 'custom',    label: 'Personalizado',     add: 15000 },
            { id: 'replica',   label: 'Réplica de marca',  add: 10000 },
          ]},
        { id: 'integraciones', label: '¿Conexiones?', multi: true,
          help: 'Marca las que apliquen · puedes dejar vacío.',
          opciones: [
            { id: 'analytics', label: 'Analytics',                  add: 3750 },
            { id: 'pixel',     label: 'Pixel de ads',               add: 5000 },
            { id: 'email',     label: 'Mailchimp / Email marketing', add: 6250 },
            { id: 'whatsapp',  label: 'WhatsApp',                   add: 3750 },
            { id: 'crm',       label: 'CRM',                        add: 10000 },
          ]},
      ],

      // ── Funnel de ventas (5 preguntas) ────────────────────────────
      'web-funnel': [
        { id: 'etapas', label: '¿Cuántos pasos?',
          opciones: [
            { id: 'corto',  label: '2 a 3 pasos', add: 0 },
            { id: 'medio',  label: '4 a 6 pasos', add: 15000 },
            { id: 'largo',  label: '7 o más',     add: 35000 },
          ]},
        { id: 'pago', label: '¿Vende directo?',
          opciones: [
            { id: 'no',          label: 'No · solo captura leads',            add: 0 },
            { id: 'una',         label: 'Sí · una pasarela',                  add: 10000 },
            { id: 'multiples',   label: 'Sí · varias pasarelas',              add: 22500 },
          ]},
        { id: 'automatizaciones', label: '¿Qué se dispara solo?', multi: true,
          help: 'Marca las que apliquen · puedes dejar vacío.',
          opciones: [
            { id: 'email',   label: 'Secuencia de email',         add: 10000 },
            { id: 'sms',     label: 'SMS / WhatsApp',             add: 8750 },
            { id: 'crm',     label: 'Etiquetado en CRM',          add: 7500 },
            { id: 'carrito', label: 'Abandono de carrito',        add: 12500 },
          ]},
        { id: 'diseno', label: '¿Diseño?',
          opciones: [
            { id: 'plantilla', label: 'Plantilla',         add: 0 },
            { id: 'custom',    label: 'Personalizado',     add: 20000 },
            { id: 'replica',   label: 'Réplica de marca',  add: 12500 },
          ]},
        { id: 'analitica', label: '¿Reportes?',
          opciones: [
            { id: 'basico',       label: 'Básico',                    add: 0 },
            { id: 'dashboard',    label: 'Dashboard',                 add: 10000 },
            { id: 'multitouch',   label: 'Atribución multi-touch',    add: 22500 },
          ]},
      ],

      // ── Sitio web completo (6 preguntas) ──────────────────────────
      'web-sitio': [
        { id: 'secciones', label: '¿Cuántas secciones?',
          opciones: [
            { id: 'pocas',    label: 'Pocas · 1 a 3',   add: 0 },
            { id: 'medianas', label: 'Medianas · 4 a 7', add: 30000 },
            { id: 'muchas',   label: 'Muchas · 8+',      add: 70000 },
          ]},
        { id: 'cms', label: '¿Quieres editarlo tú?',
          help: 'Un panel para cambiar textos e imágenes sin depender de nosotros.',
          opciones: [
            { id: 'si', label: 'Sí · con CMS', add: 35000 },
            { id: 'no', label: 'No',            add: 0 },
          ]},
        { id: 'diseno', label: '¿Diseño?',
          opciones: [
            { id: 'plantilla', label: 'Plantilla',         add: 0 },
            { id: 'custom',    label: 'Personalizado',     add: 45000 },
            { id: 'replica',   label: 'Réplica de marca',  add: 30000 },
          ]},
        { id: 'idiomas', label: '¿Idiomas?',
          opciones: [
            { id: 'uno',   label: 'Un solo idioma',   add: 0 },
            { id: 'dos',   label: 'Dos idiomas',      add: 27500 },
            { id: 'multi', label: 'Multilingüe (3+)', add: 60000 },
          ]},
        { id: 'modulos', label: '¿Módulos extra?', multi: true,
          help: 'Marca los que apliquen · puedes dejar vacío.',
          opciones: [
            { id: 'blog',       label: 'Blog',                        add: 15000 },
            { id: 'agenda',     label: 'Agenda',                      add: 22500 },
            { id: 'chatbot',    label: 'Chatbot con IA',              add: 30000, flag: 'ia' },
            { id: 'galeria',    label: 'Galería',                     add: 10000 },
            { id: 'miembros',   label: 'Área de miembros',            add: 45000, flag: 'auth-or-api' },
            { id: 'newsletter', label: 'Newsletter',                  add: 7500 },
            { id: 'forms',      label: 'Formularios avanzados',       add: 10000 },
          ]},
        { id: 'calidad', label: '¿Acabado?',
          opciones: [
            { id: 'funcional', label: 'Funcional · directo al grano',          mul: 0.85 },
            { id: 'balance',   label: 'Buena relación calidad/precio',         mul: 1.0 },
            { id: 'premium',   label: 'Premium · animaciones y pulido máximo', mul: 1.35, flag: 'animacion-pro' },
          ]},
      ],

      // ── Apps · subflow compartido ─────────────────────────────────
      'app-pwa':     APP_SUBFLOW,
      'app-android': APP_SUBFLOW,
      'app-ios':     APP_SUBFLOW,
      'app-ambas':   APP_SUBFLOW,
      'app-desktop': APP_SUBFLOW,

      // ── Ecommerce · subflows (4 servicios) ───────────────────────

      'ec-mini': [
        { id: 'producto', label: '¿Qué vendes?', multi: false, opciones: [
          { id: 'fisico',   label: 'Producto físico',  subtitle: 'Te lo enviamos al cliente',   add: 0 },
          { id: 'digital',  label: 'Producto digital', subtitle: 'Descarga, curso, ebook',       add: 3750 },
          { id: 'servicio', label: 'Servicio',         subtitle: 'Reserva, consulta, sesión',    add: 5000 },
        ]},
        { id: 'pagos', label: '¿Cómo cobras?', multi: true, opciones: [
          { id: 'tarjeta',   label: 'Tarjeta',      subtitle: 'Visa, Mastercard, AMEX',          add: 10000 },
          { id: 'spei-oxxo', label: 'SPEI / OXXO',  subtitle: 'Cliente mexicano sin tarjeta',    add: 8750 },
          { id: 'paypal',    label: 'PayPal',        subtitle: 'Cliente internacional',           add: 7500 },
        ]},
        { id: 'diseno', label: '¿Diseño?', multi: false, opciones: [
          { id: 'plantilla',    label: 'Plantilla',     subtitle: 'Salida rápida',    add: 0 },
          { id: 'personalizado', label: 'Personalizado', subtitle: 'Identidad propia', add: 12500 },
        ]},
        { id: 'extras', label: '¿Algo extra?', multi: true, opciones: [
          { id: 'analytics', label: 'Analytics',         subtitle: 'Saber quién entra',                  add: 3750 },
          { id: 'pixel',     label: 'Pixel ads',         subtitle: 'Para reanunciar',                     add: 5000 },
          { id: 'email',     label: 'Email automation',  subtitle: 'Carrito abandonado, seguimiento',     add: 10000 },
        ]},
      ],

      'ec-shopify': [
        { id: 'catalogo', label: '¿Cuántos productos?', multi: false, opciones: [
          { id: 'pocos',  label: '1-25 productos',  subtitle: 'Catálogo curado',  add: 0 },
          { id: 'medio',  label: '26-200 productos', subtitle: 'Catálogo mediano', add: 15000 },
          { id: 'muchos', label: '200+ productos',   subtitle: 'Catálogo grande',  add: 35000 },
        ]},
        { id: 'tema', label: '¿Tema/Diseño?', multi: false, opciones: [
          { id: 'gratuito', label: 'Tema gratuito personalizado', subtitle: 'Más económico',          add: 0 },
          { id: 'premium',  label: 'Tema premium',                subtitle: '$200-$500 USD incluido', add: 15000 },
          { id: 'custom',   label: 'Diseño 100% custom',          subtitle: 'Identidad única',        add: 37500 },
        ]},
        { id: 'apps', label: '¿Apps extra?', multi: true, opciones: [
          { id: 'reviews',      label: 'Reseñas',           subtitle: 'Loox o Judge.me',       add: 3750 },
          { id: 'email',        label: 'Email marketing',   subtitle: 'Klaviyo o Mailchimp',   add: 8750 },
          { id: 'lealtad',      label: 'Programa de lealtad', subtitle: 'Smile.io o Yotpo',   add: 11250 },
          { id: 'multi-idioma', label: 'Multi-idioma',      subtitle: 'Langify',               add: 7500 },
        ]},
        { id: 'migracion', label: '¿Migración?', multi: false, opciones: [
          { id: 'no',        label: 'No tengo tienda',    subtitle: 'Arrancamos desde cero',  add: 0 },
          { id: 'si-pocos',  label: 'Migración chica',    subtitle: 'Menos de 50 productos',  add: 10000 },
          { id: 'si-muchos', label: 'Migración grande',   subtitle: '50+ productos',           add: 25000 },
        ]},
      ],

      'ec-tienda': [
        { id: 'tamano', label: '¿Tamaño del catálogo?', multi: false, opciones: [
          { id: 'mini',    label: '1-10 productos',    subtitle: 'Boutique digital', add: 0 },
          { id: 'pequeno', label: '11-50 productos',   subtitle: 'Tienda pequeña',  add: 20000 },
          { id: 'mediano', label: '51-500 productos',  subtitle: 'Tienda mediana',  add: 70000 },
          { id: 'grande',  label: '500+ productos',    subtitle: 'Tienda grande',   add: 175000 },
        ]},
        { id: 'plataforma', label: '¿Stack tech?', multi: false, opciones: [
          { id: 'next',      label: 'Next.js + headless CMS', subtitle: 'Velocidad y SEO máximo', mul: 1.0 },
          { id: 'wordpress', label: 'WordPress + WooCommerce', subtitle: 'Más económico',          mul: 0.85 },
        ]},
        { id: 'pagos', label: '¿Pasarelas?', multi: true, opciones: [
          { id: 'tarjeta-nac', label: 'Tarjeta nacional',     subtitle: 'Stripe / Mercado Pago',    add: 12500 },
          { id: 'tarjeta-int', label: 'Tarjeta internacional', subtitle: 'Cliente fuera de MX',     add: 12500 },
          { id: 'spei-oxxo',   label: 'SPEI / OXXO',          subtitle: 'Cliente MX sin tarjeta',  add: 10000 },
          { id: 'paypal',      label: 'PayPal',                subtitle: 'Internacional',            add: 8750 },
          { id: 'mercadopago', label: 'Mercado Pago',          subtitle: 'LATAM',                   add: 11250 },
        ]},
        { id: 'envios', label: '¿Envíos?', multi: false, opciones: [
          { id: 'digital', label: 'Solo digital',            subtitle: 'Producto descargable',           add: 0 },
          { id: 'manual',  label: 'Calculo manual',          subtitle: 'Tabla fija o por ciudad',        add: 0 },
          { id: 'auto',    label: 'Cotización automática',   subtitle: 'API DHL/Estafeta/Fedex',         add: 20000 },
        ]},
        { id: 'modulos', label: '¿Módulos extra?', multi: true, opciones: [
          { id: 'cupones',      label: 'Cupones / descuentos',  subtitle: '',                         add: 8750 },
          { id: 'resenas',      label: 'Reseñas',               subtitle: '',                         add: 10000 },
          { id: 'wishlist',     label: 'Wishlist',              subtitle: '',                         add: 8750 },
          { id: 'suscripciones', label: 'Suscripciones',       subtitle: 'Pago recurrente',           add: 37500 },
          { id: 'multimoneda',  label: 'Multi-moneda',          subtitle: '',                         add: 15000 },
          { id: 'inventario',   label: 'Inventario avanzado',   subtitle: 'Multi-almacén',            add: 30000 },
          { id: 'lealtad',      label: 'Programa de lealtad',   subtitle: 'Puntos, niveles',          add: 25000 },
        ]},
        { id: 'calidad', label: '¿Acabado?', multi: false, opciones: [
          { id: 'funcional', label: 'Funcional', subtitle: 'Sale rápido · calidad básica',           mul: 0.85 },
          { id: 'balance',   label: 'Balanceado', subtitle: 'Recomendado',                           mul: 1.0 },
          { id: 'premium',   label: 'Premium',    subtitle: 'Animaciones, microinteracciones',       mul: 1.35 },
        ]},
      ],

      'ec-app': [
        { id: 'plataforma', label: '¿Para qué plataformas?', multi: false, opciones: [
          { id: 'ios',     label: 'Solo iPhone',       subtitle: 'App Store',                          add: 0 },
          { id: 'android', label: 'Solo Android',      subtitle: 'Google Play · más rápido',           mul: 0.85 },
          { id: 'ambas',   label: 'iPhone + Android',  subtitle: 'La más común',                       add: 45000 },
        ]},
        { id: 'tipo', label: '¿A la medida o no-code?', multi: false, opciones: [
          { id: 'nocode', label: 'No-code', subtitle: 'Más rápido y económico · ideal para validar', mul: 0.55 },
          { id: 'medida', label: 'A la medida', subtitle: 'Control total · escalable a largo plazo', mul: 1.0 },
        ]},
        { id: 'productos', label: '¿Cuántos productos?', multi: false, opciones: [
          { id: 'pocos',  label: 'Catálogo curado (<25)', subtitle: '', add: 0 },
          { id: 'medio',  label: 'Mediano (25-200)',       subtitle: '', add: 20000 },
          { id: 'muchos', label: 'Grande (200+)',          subtitle: '', add: 45000 },
        ]},
        { id: 'pagos', label: '¿Pagos in-app?', multi: false, opciones: [
          { id: 'apple-google', label: 'Apple Pay / Google Pay', subtitle: 'Comisión 30% de las tiendas', add: 15000 },
          { id: 'externa',      label: 'Pasarela externa',       subtitle: 'Stripe / Mercado Pago · evita 30%', add: 30000 },
        ]},
        { id: 'funciones', label: '¿Funciones especiales?', multi: true, opciones: [
          { id: 'push',     label: 'Notificaciones push', subtitle: 'Carrito abandonado, promos', add: 12500 },
          { id: 'login',    label: 'Login + perfiles',    subtitle: 'Historial, favoritos',       add: 22500, flag: 'auth-or-api' },
          { id: 'lealtad',  label: 'Programa de lealtad', subtitle: 'Puntos, niveles',            add: 25000 },
          { id: 'chat',     label: 'Chat de soporte',     subtitle: 'Atención in-app',            add: 30000 },
          { id: 'tracking', label: 'Tracking de pedidos', subtitle: 'Estado en tiempo real',      add: 20000 },
        ]},
      ],

      // ── Chatbot con IA (4 preguntas) ──────────────────────────────
      'auto-chatbot': [
        { id: 'objetivo', label: '¿Para qué?',
          opciones: [
            { id: 'faq',       label: 'Responder FAQ',                    add: 0 },
            { id: 'leads',     label: 'Capturar leads',                   add: 15000 },
            { id: 'procesos',  label: 'Atender procesos internos',        add: 30000 },
            { id: 'asistente', label: 'Asistente IA general',             add: 45000, flag: 'ia' },
          ]},
        { id: 'canales', label: '¿Dónde vive?', multi: true,
          opciones: [
            { id: 'whatsapp', label: 'WhatsApp',              add: 10000 },
            { id: 'web',      label: 'Web / sitio',           add: 0 },
            { id: 'redes',    label: 'Instagram / Messenger', add: 10000 },
            { id: 'app',      label: 'Dentro de tu app',      add: 15000 },
          ]},
        { id: 'motor', label: '¿Cómo responde?',
          help: 'IA conversa natural. Reglas es más simple y económico.',
          opciones: [
            { id: 'reglas', label: 'Por reglas / menús',           mul: 0.7 },
            { id: 'ia',     label: 'IA con tu información',        mul: 1.0, flag: 'ia' },
          ]},
        { id: 'integra', label: '¿Conectado a algo?', multi: true,
          help: 'Marca las que apliquen · puedes dejar vacío.',
          opciones: [
            { id: 'crm',       label: 'CRM / Sheets',          add: 10000 },
            { id: 'calendario', label: 'Calendario',           add: 10000 },
            { id: 'erp',       label: 'ERP / inventario',      add: 30000 },
            { id: 'api',       label: 'API propia',            add: 22500 },
          ]},
      ],

      // ── Agendamiento automático (3 preguntas) ─────────────────────
      'auto-agenda': [
        { id: 'volumen', label: '¿Cuántas citas por semana?',
          opciones: [
            { id: 'pocas',   label: 'Pocas · menos de 20', add: 0 },
            { id: 'medias',  label: 'Medias · 20 a 100',   add: 7500 },
            { id: 'muchas',  label: 'Muchas · 100+',        add: 20000 },
          ]},
        { id: 'flujo', label: '¿Qué necesita?', multi: true,
          help: 'Marca las que apliquen.',
          opciones: [
            { id: 'recordatorios', label: 'Recordatorios SMS / WhatsApp',  add: 6250 },
            { id: 'formulario',    label: 'Formulario de pre-cita',        add: 5000 },
            { id: 'pagos',         label: 'Pagos online',                  add: 10000 },
            { id: 'calendario',    label: 'Google / Outlook calendar',     add: 5000 },
          ]},
        { id: 'quien', label: '¿Quién lo usa?',
          opciones: [
            { id: 'uno',       label: '1 profesional',     add: 0 },
            { id: 'equipo-sm', label: 'Equipo · 2 a 10',   add: 10000 },
            { id: 'equipo-lg', label: 'Equipo · más de 10', add: 25000 },
          ]},
      ],

      // ── Integraciones entre sistemas (3 preguntas) ─────────────────
      'auto-integraciones': [
        { id: 'sistemas', label: '¿Qué conectas?', multi: true,
          opciones: [
            { id: 'crm',        label: 'CRM',                        add: 0 },
            { id: 'pasarela',   label: 'Pasarela de pago',           add: 7500 },
            { id: 'erp',        label: 'Inventario / ERP',           add: 15000 },
            { id: 'contabilidad', label: 'Contabilidad',             add: 10000 },
            { id: 'gsuite',     label: 'Google Workspace',           add: 5000 },
            { id: 'sheets',     label: 'Hoja de cálculo',            add: 3750 },
            { id: 'ecommerce',  label: 'E-commerce',                 add: 10000 },
          ]},
        { id: 'direccion', label: '¿Cómo fluye?',
          opciones: [
            { id: 'una',        label: 'Una dirección',              add: 0 },
            { id: 'bidireccional', label: 'Bidireccional',           add: 10000 },
            { id: 'tiempo-real', label: 'Sincronización tiempo real', add: 20000 },
          ]},
        { id: 'volumen', label: '¿Volumen de datos?',
          opciones: [
            { id: 'bajo',  label: 'Bajo · menos de 1k / mes',  add: 0 },
            { id: 'medio', label: 'Medio · 1k a 10k / mes',    add: 7500 },
            { id: 'alto',  label: 'Alto · más de 10k / mes',   add: 20000 },
          ]},
      ],

      // ── Automatización de procesos (4 preguntas) ─────────────────
      'auto-procesos': [
        { id: 'procesos', label: '¿Cuántos procesos?',
          opciones: [
            { id: 'uno',    label: 'Uno',      add: 0 },
            { id: 'varios', label: '2 a 3',    add: 15000 },
            { id: 'muchos', label: '4 o más',  add: 35000 },
          ]},
        { id: 'tipo', label: '¿Qué automatiza?', multi: true,
          opciones: [
            { id: 'reportes',    label: 'Reportes / dashboards',    add: 10000 },
            { id: 'formularios', label: 'Formularios',              add: 7500 },
            { id: 'aprobaciones', label: 'Aprobaciones / flujos',   add: 15000 },
            { id: 'notificaciones', label: 'Notificaciones',        add: 6250 },
            { id: 'extraccion',  label: 'Extracción de datos',      add: 12500 },
          ]},
        { id: 'usuarios', label: '¿Cuántos usuarios?',
          opciones: [
            { id: 'sm',  label: '1 a 5',    add: 0 },
            { id: 'md',  label: '6 a 25',   add: 8750 },
            { id: 'lg',  label: '26+',       add: 22500 },
          ]},
        { id: 'tech', label: '¿Plataforma?',
          opciones: [
            { id: 'nocode', label: 'No-code (Zapier / Make / n8n)',  mul: 0.7 },
            { id: 'medida', label: 'A la medida',                    mul: 1.0 },
          ]},
      ],

      // ── Asesoría / Capacitación (3 preguntas) ─────────────────────
      'auto-asesoria': [
        { id: 'modalidad', label: '¿Modalidad?',
          opciones: [
            { id: '1a1',    label: '1-a-1 · 1 hora',              add: 0 },
            { id: 'taller', label: 'Taller · 4 horas',             add: 10000 },
            { id: 'equipo', label: 'Consultoría a equipo · 2 días', add: 47500 },
          ]},
        { id: 'tema', label: '¿Tema?', multi: true,
          opciones: [
            { id: 'estrategia', label: 'Estrategia digital',       add: 0 },
            { id: 'ia',         label: 'IA y vibe coding',         add: 0 },
            { id: 'ecommerce',  label: 'E-commerce y ventas',      add: 0 },
            { id: 'notech',     label: 'Tech para no-técnicos',    add: 0 },
            { id: 'auto',       label: 'Automatización',           add: 0 },
          ]},
        { id: 'lugar', label: '¿Presencial o remoto?',
          opciones: [
            { id: 'remoto',  label: 'Remoto',            add: 0 },
            { id: 'gdl',     label: 'Presencial GDL',    add: 10000 },
            { id: 'cdmx',    label: 'Presencial CDMX',   add: 15000 },
          ]},
      ],

    };
  })(),

  // ═══ MODIFICADORES GLOBALES (toggles del carrito) ══════════════════════
  modificadores: {
    plazo: {
      urgente:  { mul: 1.5,  label: 'Express · entrega prioritaria' },
      normal:   { mul: 1.0,  label: 'Tiempo normal' },
      flexible: { mul: 0.95, label: 'Flexible · sin prisa' },
    },
    modo: {
      estandar: { mul: 1.0, label: 'Estándar' },
      premium:  { mul: 1.4, label: 'Premium · equipo dedicado' },
    },
  },

  // ═══ HELPERS ═══════════════════════════════════════════════════════════
  getTier(total){
    if (total <= 0)       return { id: 'empty',      label: '—'          };
    if (total < 5000)     return { id: 'express',    label: 'EXPRESS'     };
    if (total < 25000)    return { id: 'starter',    label: 'STARTER'     };
    if (total < 80000)    return { id: 'standard',   label: 'STANDARD'    };
    if (total < 200000)   return { id: 'pro',        label: 'PRO'         };
    return                      { id: 'enterprise', label: 'ENTERPRISE'  };
  },
  getTeam(total, flags){
    const team = ['KAM'];
    if (total >= 1500)                                    team.push('Frontend');
    if (total >= 15000 || flags.has('auth-or-api'))       team.push('Backend');
    if (flags.has('animacion-pro'))                       team.push('UX/UI');
    if (total >= 40000)                                   team.push('PM');
    if (flags.has('ia') || flags.has('blockchain'))       team.push('DevOps');
    if (total >= 80000)                                   team.push('QA');
    return team;
  },
  getSpeed(total, flags, plazoMul, modoMul){
    let score = 50;
    if (total < 10000)        score = 25;
    else if (total < 50000)   score = 45;
    else if (total < 150000)  score = 65;
    else                       score = 85;
    if (flags && flags.has('animacion-pro'))                     score += 8;
    if (flags && (flags.has('ia') || flags.has('blockchain')))   score += 10;
    if (modoMul && modoMul === 1.4)                              score += 12;
    if (plazoMul === 1.5)        score -= 6;
    else if (plazoMul === 0.95)  score += 4;
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
      'web-biolink':        ['HTML + CSS · ultra ligero', 'Deploy en Vercel'],
      'web-landing':        ['Astro / Next.js', 'TailwindCSS', 'Deploy en Vercel'],
      'web-funnel':         ['Next.js + integraciones', 'Email automation', 'Analytics avanzado'],
      'web-sitio':          ['Next.js / Astro', 'CMS (Sanity/Strapi)', 'Deploy en Vercel'],
      'app-pwa':            ['React/Next.js PWA', 'Service Worker + Manifest'],
      'app-android':        ['React Native / Flutter / Kotlin', 'Google Play Console'],
      'app-ios':            ['React Native / Flutter / Swift', 'App Store Connect'],
      'app-ambas':          ['React Native / Flutter', 'Google Play + App Store'],
      'app-desktop':        ['Electron / Tauri', 'Auto-update'],
      'ec-mini':            ['Next.js / Astro single-page', 'Stripe / Mercado Pago', 'Deploy en Vercel'],
      'ec-shopify':         ['Shopify + apps oficiales', 'Theme customization', 'Apps de terceros'],
      'ec-tienda':          ['Next.js + headless CMS', 'Pasarela integrada', 'Deploy en Vercel + Railway'],
      'ec-app':             ['React Native / Flutter', 'Firebase + pagos in-app', 'App Store + Google Play'],
      'auto-chatbot':       ['LLM (OpenAI/Anthropic) + n8n', 'WhatsApp Business API'],
      'auto-agenda':        ['Cal.com / Calendly API + custom', 'Google Calendar sync'],
      'auto-integraciones': ['Zapier / Make / n8n', 'APIs REST + webhooks'],
      'auto-procesos':      ['n8n / scripts custom', 'Dashboards en Metabase/Retool'],
      'auto-asesoria':      ['1-a-1 con Eduardo + equipo iBisne'],
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
    // El servicio más caro suele marcar el tiempo de entrega.
    let top = servicios[0];
    for (const s of servicios) {
      if ((s.calculatedPrice || s.base || 0) > (top.calculatedPrice || top.base || 0)) top = s;
    }
    return top.tiempo || '4-8 sem';
  },
};

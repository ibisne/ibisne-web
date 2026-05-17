// data/pricing.js — v7.0.0 · Catálogo consolidado + subflow profesional
//
// Cambio mayor (rework de contenido · plan v7.0.0):
//   · Pocas cards GENÉRICAS humanas (no 41 servicios técnicos).
//   · El subflow pregunta-a-pregunta precisa todo y arma el precio.
//   · Las opciones soportan `add` (suma fija) O `mul` (factor cascada).
//     calcSubflowPrice: total = base + Σ add, luego × cada mul en orden.
//   · "No sé / que iBisne recomiende" siempre disponible en singles.
//   · Estructura de Apps basada en la experiencia real de Eduardo
//     cotizando apps, expandida heurísticamente.
//
// megaCategorias → serviciosIds directo (SIN nivel subCategorias).

window.IBISNE_PRICING = {

  // ═══ SECTORES · contexto · no gate · sugiere ════════════════════════
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

  // ═══ "YA TENGO" · descarta opciones · ahorra preguntas ══════════════
  yaTengo: [
    { id: 'web',         label: 'Sitio web',                icon: 'sitio' },
    { id: 'identidad',   label: 'Identidad / logo',         icon: 'dtc' },
    { id: 'redes',       label: 'Redes sociales activas',   icon: 'leads' },
    { id: 'cms',         label: 'Sistema para administrar', icon: 'edit' },
    { id: 'pasarela',    label: 'Pasarela de pago',         icon: 'fintech' },
    { id: 'marketing',   label: 'Marketing andando',        icon: 'saas' },
  ],

  // ═══ MEGA-CATEGORÍAS (4) · serviciosIds directo · SIN subCategorias ══
  megaCategorias: [
    {
      id: 'web', label: 'Desarrollo web', icon: 'sitio',
      summary: 'Tu presencia en internet',
      info: 'Desde una página de enlaces hasta un sitio completo de marca o una tienda en línea. Si tus clientes lo abren en un navegador, va aquí.',
      serviciosIds: ['web-sitio', 'web-tienda'],
    },
    {
      id: 'apps', label: 'Apps', icon: 'app',
      summary: 'Tu negocio en el bolsillo del cliente',
      info: 'Aplicaciones para iPhone, Android, web (PWA) o escritorio. No-code para validar rápido o a la medida para máximo control.',
      serviciosIds: ['app'],
    },
    {
      id: 'marketing', label: 'Marketing', icon: 'leads',
      summary: 'Que te conozcan y te compren',
      info: 'Redes y campañas, identidad de marca, foto/video profesional y material impreso. Que tu marca aparezca donde está tu cliente.',
      serviciosIds: ['mkt-redes', 'mkt-branding', 'mkt-foto-video', 'mkt-impreso'],
    },
    {
      id: 'auto', label: 'Automatizaciones', icon: 'chatbot',
      summary: 'Que el trabajo repetitivo se haga solo',
      info: 'Bots y asistentes con IA que atienden 24/7, automatización de procesos, y asesoría/capacitación para tu equipo.',
      serviciosIds: ['auto-bot', 'auto-asesoria'],
    },
  ],

  // ═══ SERVICIOS · catálogo consolidado · indexado por id ═════════════
  servicios: {
    'web-sitio': {
      label: 'Sitio web', base: 6000, tier: 'medio', tiempo: '2-8 sem', icon: 'sitio',
      subtitle: 'Donde tus clientes te encuentran · de una página a un sitio completo',
      subflow: true, tags: ['arquitecto','dentista','restaurante','abogado','inmobiliaria','coach','b2b','sin-web'],
    },
    'web-tienda': {
      label: 'Tienda en línea', base: 24000, tier: 'grande', tiempo: '3-16 sem', icon: 'ecommerce',
      subtitle: 'Vende por internet · de un producto a un marketplace',
      subflow: true, tags: ['ecommerce','restaurante'],
    },
    'app': {
      label: 'App a la medida', base: 18000, tier: 'grande', tiempo: '4-22 sem', icon: 'app',
      subtitle: 'Para iPhone, Android, web o escritorio · no-code o a la medida',
      subflow: true, tags: ['b2b','educacion','coach','influencer'],
    },
    'mkt-redes': {
      label: 'Redes y campañas', base: 3500, tier: 'medio', tiempo: '48hrs-1 mes', icon: 'leads',
      subtitle: 'Aparece donde está tu cliente · contenido + pauta',
      subflow: true, tags: ['dentista','restaurante','influencer','coach','arquitecto','sin-marketing'],
    },
    'mkt-branding': {
      label: 'Branding e identidad', base: 999, tier: 'medio', tiempo: '48hrs-10 sem', icon: 'dtc',
      subtitle: 'Que te recuerden a la primera · logo, manual, rebrand',
      subflow: true, tags: ['sin-identidad','coach','b2b'],
    },
    'mkt-foto-video': {
      label: 'Foto y video', base: 1499, tier: 'medio', tiempo: '1 día-3 sem', icon: 'camera',
      subtitle: 'Una imagen vende más que mil palabras',
      subflow: true, tags: ['arquitecto','restaurante','influencer'],
    },
    'mkt-impreso': {
      label: 'Material impreso', base: 999, tier: 'micro', tiempo: '5-7 días', icon: 'edit',
      subtitle: 'Lo que tu cliente se lleva a casa',
      subflow: true, tags: [],
    },
    'auto-bot': {
      label: 'Automatización / Bot con IA', base: 1999, tier: 'medio', tiempo: '48hrs-6 sem', icon: 'chatbot',
      subtitle: 'Atiende 24/7 sin contratar a nadie',
      subflow: true, tags: ['b2b','dentista','ecommerce'],
    },
    'auto-asesoria': {
      label: 'Asesoría y capacitación', base: 999, tier: 'micro', tiempo: 'agendable', icon: 'partnership',
      subtitle: 'Aprende de quien ya lo hizo',
      subflow: true, tags: ['coach','b2b','educacion'],
    },
  },

  // ═══ SUB-FLOW · una pregunta a la vez · add (suma) | mul (factor) ════
  subflow: {

    // ── APP a la medida · estructura estrella (12 pasos) ──────────────
    'app': [
      { id: 'plataforma', label: '¿Dónde va a usarse tu app?',
        help: 'Define gran parte del costo · elige donde están tus usuarios.',
        opciones: [
          { id: 'pwa',     label: 'En el navegador (web app)',
            subtitle: 'Se abre y se instala desde el navegador · sin tiendas de apps',
            detalle: 'La opción más económica y rápida. Funciona en cualquier celular o computadora desde el navegador, y se puede "instalar" como app.',
            add: 12000 },
          { id: 'android', label: 'Solo Android',
            subtitle: 'App nativa publicada en Google Play', add: 28000 },
          { id: 'ios',     label: 'Solo iPhone',
            subtitle: 'App nativa publicada en la App Store', add: 32000 },
          { id: 'ambas',   label: 'iPhone y Android',
            subtitle: 'Una sola app para las dos tiendas · la más común',
            detalle: 'Cubres a todos tus usuarios. Construimos una base compartida que publica en App Store y Google Play.',
            add: 58000 },
          { id: 'windows', label: 'Computadora (escritorio)',
            subtitle: 'App para Windows · uso interno o profesional', add: 45000 },
      ]},
      { id: 'tipo', label: '¿Cómo la construimos?',
        help: 'No-code es más rápido y económico para validar. A la medida da máximo control y rendimiento.',
        opciones: [
          { id: 'nocode',  label: 'No-code · más rápida y económica', mul: 0.55 },
          { id: 'medida',  label: 'A la medida · código propio',      mul: 1.0 },
      ]},
      { id: 'calidad', label: '¿Qué nivel de acabado buscas?',
        help: 'Mismo alcance, distinto nivel de pulido y pruebas.',
        opciones: [
          { id: 'funcional', label: 'Funcional · que sirva, sin tanto pulido', mul: 0.8 },
          { id: 'balance',   label: 'Buena relación calidad/precio · recomendado', mul: 1.0 },
          { id: 'premium',   label: 'Calidad óptima · acabado premium', mul: 1.4 },
      ]},
      { id: 'diseno', label: '¿Cómo quieres el diseño?',
        opciones: [
          { id: 'medida',   label: 'Diseño a la medida · único para tu marca', add: 22000 },
          { id: 'plantilla', label: 'Diseño sencillo · plantilla adaptada',    add: 6000 },
          { id: 'replica',  label: 'Replicar el diseño de mi web/marca',       add: 9000 },
          { id: 'ninguno',  label: 'No necesito diseño · ya lo tengo',         add: 0 },
      ]},
      { id: 'modelo', label: '¿Cómo vas a ganar con tu app?',
        opciones: [
          { id: 'ads',      label: 'Gratuita con publicidad',          add: 4000 },
          { id: 'pago',     label: 'De pago · descarga única',         add: 3000 },
          { id: 'compras',  label: 'Compras dentro / suscripción',     add: 15000 },
          { id: 'interno',  label: 'Uso interno · no monetiza',        add: 0 },
      ]},
      { id: 'login', label: '¿Necesita que los usuarios inicien sesión?',
        opciones: [
          { id: 'redes',  label: 'Sí · con redes sociales + email', add: 9000 },
          { id: 'email',  label: 'Sí · solo email',                 add: 5000 },
          { id: 'no',     label: 'No',                              add: 0 },
      ]},
      { id: 'perfiles', label: '¿Los usuarios tendrán su propio perfil?',
        opciones: [
          { id: 'si',    label: 'Sí',         add: 11000 },
          { id: 'no',    label: 'No',         add: 0 },
      ]},
      { id: 'conexion', label: '¿Se conecta con algún sistema externo?', multi: true,
        help: 'Marca todas las que apliquen.',
        opciones: [
          { id: 'web',      label: 'Mi sitio web / tienda', add: 7000 },
          { id: 'crm',      label: 'Un CRM (HubSpot, etc.)', add: 9000 },
          { id: 'pasarela', label: 'Pasarela de pago',       add: 8000 },
          { id: 'api',      label: 'Una API externa',        add: 10000 },
      ]},
      { id: 'admin', label: '¿Necesitas un panel de administración?',
        help: 'Para gestionar usuarios, contenido y ver métricas.',
        opciones: [
          { id: 'si',    label: 'Sí',        add: 18000 },
          { id: 'no',    label: 'No',        add: 0 },
      ]},
      { id: 'funciones', label: '¿Qué funciones especiales necesita?', multi: true,
        help: 'Marca todas las que apliquen · puedes dejar vacío.',
        opciones: [
          { id: 'push',      label: 'Notificaciones push',     add: 5000 },
          { id: 'geo',       label: 'Mapa / geolocalización',  add: 10000 },
          { id: 'chat',      label: 'Chat / mensajería',       add: 18000 },
          { id: 'camara',    label: 'Cámara / escáner / QR',   add: 11000 },
          { id: 'pagos',     label: 'Pagos dentro de la app',  add: 14000 },
          { id: 'offline',   label: 'Funciona sin internet',   add: 11000 },
          { id: 'ia',        label: 'Inteligencia artificial', add: 22000, flag: 'ia' },
          { id: 'streaming', label: 'Streaming de video/audio', add: 22000 },
      ]},
      { id: 'idiomas', label: '¿En cuántos idiomas?',
        opciones: [
          { id: 'uno',   label: 'Un solo idioma',     add: 0 },
          { id: 'dos',   label: 'Dos idiomas',        add: 9000 },
          { id: 'multi', label: 'Multilingüe (3+)',   add: 20000 },
      ]},
      { id: 'etapa', label: '¿En qué etapa está tu proyecto?',
        help: 'Nos ayuda a entender desde dónde empezamos.',
        opciones: [
          { id: 'idea',     label: 'Es solo una idea',                       mul: 1.0,  signal: 'temprano' },
          { id: 'mvp',      label: 'Tengo un MVP / prototipo',               mul: 1.0,  signal: 'caliente' },
          { id: 'desarrollo', label: 'En desarrollo · necesito terminarla',  mul: 0.85, signal: 'caliente' },
          { id: 'updates',  label: 'Ya está · necesita actualizaciones',     mul: 0.6,  signal: 'tibio' },
          { id: 'rehacer',  label: 'Ya está pero quiero rehacerla desde cero', mul: 1.0, signal: 'caliente' },
      ]},
    ],

    // ── SITIO WEB (9 pasos) ───────────────────────────────────────────
    'web-sitio': [
      { id: 'tipo', label: '¿Qué quieres lograr con tu sitio?',
        help: 'Elige por tu objetivo · nosotros decidimos la tecnología.',
        opciones: [
          { id: 'biolink', label: 'Que me encuentren y contacten',
            subtitle: 'Tu info, enlaces y botón de contacto · presencia rápida y profesional',
            detalle: 'Ideal para empezar: redes, WhatsApp, ubicación y un par de secciones. Lista en días.',
            add: 0 },
          { id: 'landing', label: 'Conseguir clientes o ventas',
            subtitle: 'Página enfocada en convertir visitas en contactos o compras',
            detalle: 'Diseñada para vender: mensaje claro, prueba social y formulario/botón de compra. Ideal para campañas.',
            add: 9000 },
          { id: 'completo', label: 'Mostrar mi marca completa',
            subtitle: 'Sitio de varias secciones · servicios, portafolio, blog, contacto',
            detalle: 'Tu casa digital completa: varias páginas, identidad cuidada y todo lo que represente tu marca con autoridad.',
            add: 55000 },
      ]},
      { id: 'secciones', label: '¿Cuántas secciones o páginas?',
        opciones: [
          { id: 'pocas',   label: 'Pocas · 1 a 3',     add: 0 },
          { id: 'medianas', label: 'Medianas · 4 a 7', add: 12000 },
          { id: 'muchas',  label: 'Muchas · 8 o más',  add: 28000 },
      ]},
      { id: 'calidad', label: '¿Qué nivel de acabado buscas?',
        opciones: [
          { id: 'funcional', label: 'Funcional · directo al grano',       mul: 0.8 },
          { id: 'balance',   label: 'Buena relación calidad/precio',      mul: 1.0 },
          { id: 'premium',   label: 'Premium con animaciones · efecto wow', mul: 1.4, flag: 'animacion-pro' },
      ]},
      { id: 'diseno', label: '¿Cómo quieres el diseño?',
        opciones: [
          { id: 'medida',   label: 'A la medida · único para ti',  add: 28000 },
          { id: 'plantilla', label: 'Plantilla adaptada a tu marca', add: 6000 },
          { id: 'replica',  label: 'Replicar mi identidad existente', add: 9000 },
          { id: 'ninguno',  label: 'Ya tengo el diseño',            add: 0 },
      ]},
      { id: 'cms', label: '¿Quieres editar el contenido tú mismo?',
        help: 'Un panel para cambiar textos, imágenes y publicar sin depender de nosotros.',
        opciones: [
          { id: 'si', label: 'Sí · con panel para editar', add: 14000 },
          { id: 'no', label: 'No · ustedes lo administran', add: 0 },
      ]},
      { id: 'idiomas', label: '¿En cuántos idiomas?',
        opciones: [
          { id: 'uno',   label: 'Un solo idioma',   add: 0 },
          { id: 'dos',   label: 'Dos idiomas',      add: 11000 },
          { id: 'multi', label: 'Multilingüe (3+)', add: 24000 },
      ]},
      { id: 'modulos', label: '¿Qué módulos necesitas?', multi: true,
        help: 'Marca todos los que apliquen · puedes dejar vacío.',
        opciones: [
          { id: 'blog',       label: 'Blog / noticias',              add: 8000 },
          { id: 'agenda',     label: 'Agenda / sistema de citas',    add: 12000 },
          { id: 'chatbot',    label: 'Chatbot con IA',               add: 14000, flag: 'ia' },
          { id: 'galeria',    label: 'Galería / portafolio',         add: 6000 },
          { id: 'miembros',   label: 'Área de miembros con login',   add: 22000, flag: 'auth-or-api' },
          { id: 'newsletter', label: 'Suscripción a newsletter',     add: 4000 },
          { id: 'forms',      label: 'Formularios avanzados',        add: 5000 },
      ]},
      { id: 'conexion', label: '¿Conectar con alguna herramienta?', multi: true,
        opciones: [
          { id: 'analytics', label: 'Analytics + Meta Pixel',     add: 3000 },
          { id: 'crm',       label: 'Un CRM',                     add: 8000 },
          { id: 'mailing',   label: 'Email marketing',            add: 4000 },
          { id: 'whatsapp',  label: 'WhatsApp Business',          add: 5000 },
      ]},
      { id: 'etapa', label: '¿En qué etapa está tu proyecto?',
        opciones: [
          { id: 'idea',    label: 'Es una idea nueva',                  mul: 1.0,  signal: 'temprano' },
          { id: 'tengo',   label: 'Tengo algo · quiero mejorarlo',      mul: 0.9,  signal: 'caliente' },
          { id: 'rehacer', label: 'Tengo sitio pero quiero rehacerlo',  mul: 1.0,  signal: 'caliente' },
          { id: 'updates', label: 'Solo actualizar lo que ya tengo',    mul: 0.55, signal: 'tibio' },
      ]},
    ],

    // ── TIENDA EN LÍNEA (8 pasos) ─────────────────────────────────────
    'web-tienda': [
      { id: 'tamano', label: '¿Qué vas a vender?',
        help: 'El tamaño del catálogo define la plataforma y el costo.',
        opciones: [
          { id: 'single',  label: 'Un solo producto o servicio',
            subtitle: 'Una página enfocada en vender una cosa · cero distracción', add: 0 },
          { id: 'pequeno', label: 'Pocos productos (hasta 50)',
            subtitle: 'Catálogo manejable · ideal para arrancar a vender', add: 12000 },
          { id: 'mediano', label: 'Catálogo mediano (hasta 500)',
            subtitle: 'Varias categorías, filtros y buscador', add: 35000 },
          { id: 'grande',  label: 'Catálogo grande (500+)',
            subtitle: 'Tienda robusta · alto volumen y rendimiento',
            detalle: 'Arquitectura preparada para miles de productos, tráfico alto e integraciones con inventario.',
            add: 90000 },
          { id: 'market',  label: 'Varios vendedores (marketplace)',
            subtitle: 'Tipo Amazon/Mercado Libre · tú cobras comisión',
            detalle: 'Plataforma multi-vendedor: cada quien sube sus productos, tú administras y cobras comisión por venta.',
            add: 180000 },
      ]},
      { id: 'plataforma', label: '¿Sobre qué la construimos?',
        help: 'Shopify es más rápido de lanzar. A la medida da control total.',
        opciones: [
          { id: 'shopify', label: 'Shopify · rápido de lanzar', mul: 0.8 },
          { id: 'medida',  label: 'A la medida · control total', mul: 1.0 },
      ]},
      { id: 'pagos', label: '¿Cómo te van a pagar?', multi: true,
        help: 'Marca todas · te sugerimos el set mínimo que cubre todo.',
        opciones: [
          { id: 'tarjeta-nac', label: 'Tarjeta nacional',        add: 6000 },
          { id: 'tarjeta-int', label: 'Tarjeta internacional',   add: 6000 },
          { id: 'spei-oxxo',   label: 'SPEI / OXXO',             add: 5000 },
          { id: 'paypal',      label: 'PayPal',                  add: 4000 },
          { id: 'mercadopago', label: 'Mercado Pago',            add: 5000 },
          { id: 'cripto',      label: 'Criptomonedas',           add: 12000 },
      ]},
      { id: 'envios', label: '¿Cómo manejas los envíos?',
        opciones: [
          { id: 'digital',  label: 'Producto digital · no se envía',  add: 0 },
          { id: 'manual',   label: 'Yo gestiono los envíos',          add: 0 },
          { id: 'auto',     label: 'Cálculo automático + guías',      add: 9000 },
      ]},
      { id: 'calidad', label: '¿Qué nivel de acabado buscas?',
        opciones: [
          { id: 'funcional', label: 'Funcional · vender ya',         mul: 0.8 },
          { id: 'balance',   label: 'Buena relación calidad/precio', mul: 1.0 },
          { id: 'premium',   label: 'Premium · experiencia de marca', mul: 1.4 },
      ]},
      { id: 'diseno', label: '¿Cómo quieres el diseño?',
        opciones: [
          { id: 'medida',   label: 'A la medida',           add: 28000 },
          { id: 'plantilla', label: 'Plantilla adaptada',    add: 6000 },
          { id: 'ninguno',  label: 'Ya tengo el diseño',     add: 0 },
      ]},
      { id: 'modulos', label: '¿Qué módulos necesitas?', multi: true,
        opciones: [
          { id: 'cupones',   label: 'Cupones y descuentos',       add: 4000 },
          { id: 'resenas',   label: 'Reseñas de productos',       add: 5000 },
          { id: 'wishlist',  label: 'Lista de deseos',            add: 4000 },
          { id: 'suscrip',   label: 'Suscripciones recurrentes',  add: 18000 },
          { id: 'multimoneda', label: 'Multi-moneda',             add: 7000 },
          { id: 'inventario', label: 'Inventario / almacén',      add: 15000 },
          { id: 'lealtad',   label: 'Programa de lealtad',        add: 12000 },
      ]},
      { id: 'etapa', label: '¿En qué etapa está tu proyecto?',
        opciones: [
          { id: 'idea',    label: 'Es una idea nueva',                 mul: 1.0,  signal: 'temprano' },
          { id: 'tengo',   label: 'Ya vendo · quiero mejorar online',  mul: 0.95, signal: 'caliente' },
          { id: 'rehacer', label: 'Tengo tienda pero quiero rehacerla', mul: 1.0, signal: 'caliente' },
          { id: 'updates', label: 'Solo actualizar la que tengo',      mul: 0.55, signal: 'tibio' },
      ]},
    ],

    // ── MARKETING · Redes y campañas (6 pasos) ────────────────────────
    'mkt-redes': [
      { id: 'alcance', label: '¿Qué necesitas?',
        opciones: [
          { id: 'contenido', label: 'Solo contenido / posts',            add: 0 },
          { id: 'pauta',     label: 'Posts + pauta pagada (ads)',        add: 9000 },
          { id: 'fullfunnel', label: 'Estrategia full-funnel · 90 días', add: 45000 },
      ]},
      { id: 'redes', label: '¿En qué redes?', multi: true,
        opciones: [
          { id: 'ig',       label: 'Instagram',  add: 0 },
          { id: 'fb',       label: 'Facebook',   add: 1500 },
          { id: 'tiktok',   label: 'TikTok',     add: 3000 },
          { id: 'linkedin', label: 'LinkedIn',   add: 2000 },
          { id: 'x',        label: 'X (Twitter)', add: 1500 },
          { id: 'youtube',  label: 'YouTube',    add: 6000 },
      ]},
      { id: 'volumen', label: '¿Cuánto contenido al mes?',
        opciones: [
          { id: '10',  label: '10 piezas',     add: 0 },
          { id: '20',  label: '20 piezas',     add: 6000 },
          { id: '30',  label: '30 o más',      add: 14000 },
      ]},
      { id: 'diseno', label: '¿Incluye diseño gráfico?',
        opciones: [
          { id: 'texto',   label: 'Solo texto / copy',  add: 0 },
          { id: 'basico',  label: 'Diseño básico',      add: 4000 },
          { id: 'premium', label: 'Diseño premium',     add: 12000 },
      ]},
      { id: 'email', label: '¿Email marketing?',
        opciones: [
          { id: 'no',    label: 'No por ahora',                add: 0 },
          { id: 'setup', label: 'Setup inicial',               add: 5000 },
          { id: 'full',  label: 'Setup + campañas mensuales',  add: 14000 },
      ]},
      { id: 'reportes', label: '¿Reportes y analítica?',
        opciones: [
          { id: 'basico', label: 'Reporte básico',          add: 0 },
          { id: 'dash',   label: 'Dashboard mensual',       add: 6000 },
      ]},
    ],

    // ── MARKETING · Branding e identidad (4 pasos) ────────────────────
    'mkt-branding': [
      { id: 'alcance', label: '¿Qué alcance necesitas?',
        opciones: [
          { id: 'logo',     label: 'Solo logo express',                 add: 0 },
          { id: 'basica',   label: 'Identidad básica · colores+tipos',   add: 4000 },
          { id: 'pro',      label: 'Identidad pro + manual completo',    add: 19000 },
          { id: 'rebrand',  label: 'Rebrand completo · investigación',   add: 77000 },
      ]},
      { id: 'aplicaciones', label: '¿Qué aplicaciones de marca?', multi: true,
        opciones: [
          { id: 'papeleria', label: 'Papelería corporativa',     add: 5000 },
          { id: 'redes',     label: 'Templates para redes',       add: 6000 },
          { id: 'presenta',  label: 'Presentación corporativa',   add: 7000 },
          { id: 'empaque',   label: 'Empaque / etiqueta',         add: 12000 },
      ]},
      { id: 'naming', label: '¿Necesitas naming o copy de marca?',
        opciones: [
          { id: 'no', label: 'No · ya tengo el nombre', add: 0 },
          { id: 'si', label: 'Sí · ayúdenme con eso',   add: 9000 },
      ]},
      { id: 'calidad', label: '¿Qué nivel de acabado?',
        opciones: [
          { id: 'funcional', label: 'Funcional · directo',           mul: 0.85 },
          { id: 'balance',   label: 'Buena relación calidad/precio',  mul: 1.0 },
          { id: 'premium',   label: 'Premium · diferenciación total', mul: 1.35 },
      ]},
    ],

    // ── MARKETING · Foto y video (4 pasos) ────────────────────────────
    'mkt-foto-video': [
      { id: 'tipo', label: '¿Qué necesitas?',
        opciones: [
          { id: 'foto-1h',  label: 'Sesión de fotos · 1 hora',          add: 0 },
          { id: 'foto-med', label: 'Sesión de fotos · media jornada',   add: 6000 },
          { id: 'reel',     label: 'Video corto (reel)',                add: 1000 },
          { id: 'corp',     label: 'Video corporativo · 2-3 min',       add: 13000 },
      ]},
      { id: 'cantidad', label: '¿Cuántas piezas finales?',
        opciones: [
          { id: 'pocas',  label: 'Pocas · lo esencial',  add: 0 },
          { id: 'media',  label: 'Paquete medio',         add: 4000 },
          { id: 'amplio', label: 'Paquete amplio',        add: 10000 },
      ]},
      { id: 'locacion', label: '¿Dónde se graba?',
        opciones: [
          { id: 'estudio',  label: 'En estudio',           add: 0 },
          { id: 'tulugar',  label: 'En tu local / oficina', add: 4000 },
          { id: 'exterior', label: 'En exteriores',         add: 6000 },
      ]},
      { id: 'edicion', label: '¿Nivel de edición?',
        opciones: [
          { id: 'basica',  label: 'Edición básica',                add: 0 },
          { id: 'premium', label: 'Edición premium / motion graphics', add: 8000 },
      ]},
    ],

    // ── MARKETING · Material impreso (3 pasos) ────────────────────────
    'mkt-impreso': [
      { id: 'pieza', label: '¿Qué necesitas imprimir?', multi: true,
        opciones: [
          { id: 'tarjetas',  label: 'Tarjetas de presentación (500)', add: 0 },
          { id: 'flyers',    label: 'Flyers a color (1,000)',         add: 1500 },
          { id: 'brochure',  label: 'Brochure tríptico (500)',        add: 3000 },
          { id: 'papeleria', label: 'Papelería corporativa completa', add: 8000 },
      ]},
      { id: 'diseno', label: '¿Incluye diseño?',
        opciones: [
          { id: 'tengo', label: 'Ya tengo el diseño · solo impresión', add: 0 },
          { id: 'disenar', label: 'Necesito que lo diseñen',           add: 4000 },
      ]},
      { id: 'acabado', label: '¿Qué acabado?',
        opciones: [
          { id: 'estandar', label: 'Estándar',                  add: 0 },
          { id: 'premium',  label: 'Premium · barniz / texturas', add: 3500 },
      ]},
    ],

    // ── AUTOMATIZACIÓN · Bot con IA (5 pasos) ─────────────────────────
    'auto-bot': [
      { id: 'objetivo', label: '¿Qué quieres lograr?',
        opciones: [
          { id: 'faq',      label: 'Responder dudas frecuentes',          add: 0 },
          { id: 'leads',    label: 'Calificar y agendar leads',           add: 9000 },
          { id: 'procesos', label: 'Automatizar procesos internos',       add: 15000 },
          { id: 'asistente', label: 'Asistente IA entrenado con mi negocio', add: 18000, flag: 'ia' },
      ]},
      { id: 'canal', label: '¿En qué canal vive?', multi: true,
        opciones: [
          { id: 'whatsapp', label: 'WhatsApp',         add: 4000 },
          { id: 'web',      label: 'Mi sitio web',     add: 0 },
          { id: 'redes',    label: 'Instagram / FB',   add: 4000 },
          { id: 'app',      label: 'Dentro de una app', add: 6000 },
      ]},
      { id: 'ia', label: '¿Con inteligencia artificial generativa?',
        help: 'IA conversa natural. Reglas es más simple y económico.',
        opciones: [
          { id: 'reglas', label: 'No · por reglas (más simple)', mul: 0.7 },
          { id: 'ia',     label: 'Sí · con IA generativa',       mul: 1.0, flag: 'ia' },
      ]},
      { id: 'integra', label: '¿Con qué se integra?', multi: true,
        opciones: [
          { id: 'crm',   label: 'Un CRM',                add: 9000 },
          { id: 'sheets', label: 'Hoja de cálculo / Sheets', add: 3000 },
          { id: 'cal',   label: 'Calendario / agenda',   add: 4000 },
          { id: 'erp',   label: 'Un ERP',                add: 15000 },
          { id: 'api',   label: 'Una API custom',        add: 12000 },
      ]},
      { id: 'calidad', label: '¿Qué nivel de acabado?',
        opciones: [
          { id: 'funcional', label: 'Funcional · que responda',       mul: 0.85 },
          { id: 'balance',   label: 'Buena relación calidad/precio',  mul: 1.0 },
          { id: 'premium',   label: 'Premium · afinado y entrenado',  mul: 1.3 },
      ]},
    ],

    // ── AUTOMATIZACIÓN · Asesoría y capacitación (3 pasos) ────────────
    'auto-asesoria': [
      { id: 'modalidad', label: '¿Qué modalidad necesitas?',
        opciones: [
          { id: '1a1',    label: 'Asesoría 1-a-1 · 1 hora',         add: 0 },
          { id: 'taller', label: 'Taller grupal · 4 horas',         add: 4000 },
          { id: 'equipo', label: 'Capacitación a equipo · 2 días',  add: 19000 },
      ]},
      { id: 'tema', label: '¿Sobre qué tema?', multi: true,
        help: 'Define el enfoque · marca los que apliquen.',
        opciones: [
          { id: 'estrategia', label: 'Estrategia digital',   add: 0 },
          { id: 'marketing',  label: 'Marketing',            add: 0 },
          { id: 'tech',       label: 'Tech / No-code',       add: 0 },
          { id: 'ia',         label: 'Inteligencia artificial', add: 0 },
          { id: 'ventas',     label: 'Ventas',               add: 0 },
      ]},
      { id: 'lugar', label: '¿Remoto o presencial?',
        opciones: [
          { id: 'remoto',     label: 'Remoto',      add: 0 },
          { id: 'presencial', label: 'Presencial',  add: 6000 },
      ]},
    ],
  },

  // ═══ MODIFICADORES GLOBALES (toggles del carrito) ═══════════════════
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
    if (total >= 15000 || flags.has('auth-or-api'))                          team.push('Backend');
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
      'web-sitio':  ['Astro / Next.js según alcance', 'TailwindCSS', 'Deploy en Vercel / Hostinger'],
      'web-tienda': ['Shopify o Next.js + headless',  'Pasarela integrada', 'Deploy en Vercel + Railway'],
      'app':        ['React Native / Flutter o no-code', 'Firebase / Supabase', 'App Store + Google Play'],
      'mkt-redes':  ['Meta/Google Ads + Metricool',   'Suite de diseño'],
      'mkt-branding': ['Figma / Illustrator',         'Manual de marca'],
      'mkt-foto-video': ['Equipo profesional + edición', 'Adobe Premiere / After Effects'],
      'auto-bot':   ['LLM (OpenAI/Anthropic) + n8n',  'Hosting según arquitectura'],
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
    // Heurística: el servicio más caro suele marcar el tiempo de entrega.
    let top = servicios[0];
    for (const s of servicios) {
      if ((s.calculatedPrice || s.base || 0) > (top.calculatedPrice || top.base || 0)) top = s;
    }
    return top.tiempo || '4-8 sem';
  },
};

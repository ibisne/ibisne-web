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
      id: 'web', label: 'Web', icon: 'sitio',
      category: 'Sitio o landing',
      subtitle: 'Bio-link, landing, leads o sitio completo',
      help: 'Elige el tipo de presencia digital que necesitas.',
    },
    {
      id: 'ecommerce', label: 'Tienda en línea', icon: 'ecommerce',
      category: 'Venta directa',
      subtitle: 'De 1 producto a marketplace',
      help: 'Vende online · desde un single product hasta plataforma multi-vendor.',
    },
    {
      id: 'app', label: 'App móvil', icon: 'app',
      category: 'Producto móvil',
      subtitle: 'iOS, Android o no-code',
      help: 'App nativa, híbrida o MVP rápido con no-code.',
    },
    {
      id: 'avanzado', label: 'Tech especializado', icon: 'saas',
      category: 'Custom',
      subtitle: 'IA, Web3, SaaS o algo más',
      help: 'Proyectos que ameritan conversación directa con un hunter.',
    },
  ],

  // ═══ Q2 — SUB-TIPO (4 por vertical) ═════════════════════════════════
  subtipos: {

    web: [
      { id: 'biolink', label: 'Bio-link',        base: 4500,  icon: 'biolink', category: 'Presencia social',
        subtitle: 'Una página con todos tus enlaces', branch: 'web-simple' },
      { id: 'landing', label: 'Landing page',    base: 18000, icon: 'landing', category: 'Generación de leads',
        subtitle: 'Captura leads o lanza un producto', branch: 'web-standard' },
      { id: 'leads',   label: 'Quiz de leads',   base: 28000, icon: 'leads',   category: 'Calificación previa',
        subtitle: 'Quiz que califica antes de cerrar venta', branch: 'web-standard' },
      { id: 'sitio',   label: 'Sitio completo',  base: 55000, icon: 'sitio',   category: 'Construcción de marca',
        subtitle: 'Hub de marca multi-página', branch: 'web-full' },
    ],

    ecommerce: [
      { id: 'single',      label: '1 solo producto',     base: 22000, icon: 'biolink',     category: 'Venta enfocada',       branch: 'eco-simple',
        subtitle: 'Foco total en convertir visita en venta' },
      { id: 'shopify',     label: 'Catálogo Shopify',    base: 75000, icon: 'ecommerce',   category: 'Catálogo gestionado',  branch: 'eco-shopify',
        subtitle: 'Tema custom sobre Shopify' },
      { id: 'headless',    label: 'Tienda headless',     base: 180000, icon: 'saas',       category: 'Performance alto',     branch: 'eco-headless',
        subtitle: 'Frontend separado · velocidad y SEO máximos' },
      { id: 'marketplace', label: 'Marketplace',         base: 320000, icon: 'marketplace', category: 'Plataforma multi-vendor', branch: 'eco-marketplace',
        subtitle: 'Varios vendedores · tú cobras comisión' },
    ],

    app: [
      { id: 'ios',     label: 'App iOS',         base: 180000, icon: 'ios',     category: 'Nativa · solo iPhone',         branch: 'app-native',
        subtitle: 'Construida en Swift · máximo rendimiento' },
      { id: 'android', label: 'App Android',     base: 180000, icon: 'android', category: 'Nativa · solo Google Play',    branch: 'app-native',
        subtitle: 'Construida en Kotlin · máximo rendimiento' },
      { id: 'hibrida', label: 'App híbrida',     base: 220000, icon: 'hybrid',  category: 'iOS + Android con una base',   branch: 'app-hybrid',
        subtitle: 'React Native o Flutter · más eficiente' },
      { id: 'nocode',  label: 'App no-code',     base: 35000,  icon: 'nocode',  category: 'MVP rápido',                    branch: 'app-nocode',
        subtitle: 'Prototipo visual · lanzas rápido, escalas después' },
    ],

    avanzado: [
      { id: 'ia',    label: 'Asistente IA',      base: 0, icon: 'chatbot', category: 'Chatbot, copiloto o agente', contact: true,
        subtitle: 'Modelos LLM + lógica custom' },
      { id: 'web3',  label: 'Web3',              base: 0, icon: 'saas',    category: 'Blockchain · dApp · contracts', contact: true,
        subtitle: 'Smart contracts + frontend Web3' },
      { id: 'saas',  label: 'Plataforma SaaS',   base: 0, icon: 'saas',    category: 'Producto con suscripción mensual', contact: true,
        subtitle: 'Producto recurrente con backend custom' },
      { id: 'otro',  label: 'Algo más',          base: 0, icon: 'otro',    category: 'Custom',                        contact: true,
        subtitle: 'Cuéntanos qué tienes en mente' },
    ],
  },

  // ═══ Q3 — ALCANCE TÉCNICO (sub-preguntas específicas) ═══════════════
  // Key formato: '{vertical}/{subtipo}' — vacío = sin sub-preguntas extras
  alcance: {

    // Web — sin extras, va directo a universales
    'web-simple':   [],
    'web-standard': [],
    'web-full':     [],

    // Ecommerce
    'eco-simple':   [],
    'eco-shopify': [
      {
        id: 'catalogo', label: '¿Cuántos productos manejas?',
        opciones: [
          { id: '<50',    label: 'Menos de 50',     add: 0,    icon: 'biolink' },
          { id: '50-500', label: 'Entre 50 y 500',  add: 5000, icon: 'ecommerce' },
          { id: '500+',   label: 'Más de 500',      add: 15000, icon: 'marketplace' },
        ],
      },
      {
        id: 'pasarelas', label: '¿Cómo van a pagarte?', multi: true,
        help: 'Selecciona todas las que apliquen. Cada una se cobra como módulo de integración.',
        opciones: [
          { id: 'stripe',       label: 'Stripe',                add: 6000, icon: 'fintech', intent: 'marketing',
            subtitle: 'Tarjetas internacional' },
          { id: 'mercadopago',  label: 'Mercado Pago',           add: 6000, icon: 'wallet', intent: 'engagement',
            subtitle: 'La pasarela mexicana #1' },
          { id: 'mercadolibre', label: 'Mercado Libre',          add: 9000, icon: 'marketplace', intent: 'marketing',
            subtitle: 'Sincronización con tu cuenta ML' },
          { id: 'oxxo-spei',    label: 'OXXO / SPEI',            add: 7000, icon: 'cash', intent: 'engagement',
            subtitle: 'Efectivo + transferencia bancaria' },
          { id: 'paypal',       label: 'PayPal',                 add: 5000, icon: 'wallet',
            subtitle: 'Pagos internacionales' },
          { id: 'apple-google', label: 'Apple Pay · Google Pay', add: 6000, icon: 'phonepay',
            subtitle: 'Tap-to-pay desde teléfono' },
          { id: 'pos-retail',   label: 'POS retail físico',      add: 14000, icon: 'shield', intent: 'engagement',
            subtitle: 'Shopify POS · cobro en tienda física' },
          { id: 'cripto',       label: 'Criptomonedas',          add: 18000, icon: 'coin', intent: 'lanzamiento',
            subtitle: 'USDC, BTC · cobro on-chain' },
          { id: 'contra-entrega', label: 'Pago contra entrega',  add: 6500, icon: 'ecommerce', intent: 'engagement',
            subtitle: 'Cobro al momento de recibir' },
        ],
      },
    ],
    'eco-headless': [
      {
        id: 'catalogo', label: '¿Cuántos productos manejas?',
        opciones: [
          { id: '<500',  label: 'Menos de 500',     add: 0,    icon: 'biolink' },
          { id: '500-5k',label: '500 a 5,000',      add: 12000, icon: 'ecommerce' },
          { id: '5k+',   label: 'Más de 5,000',     add: 25000, icon: 'marketplace' },
        ],
      },
      {
        id: 'pasarelas', label: '¿Cómo van a pagarte?', multi: true,
        help: 'Selecciona todas las que apliquen.',
        opciones: [
          { id: 'stripe',       label: 'Stripe',                add: 9000,  icon: 'fintech', intent: 'marketing', subtitle: 'Integración custom con webhooks · headless' },
          { id: 'mercadopago',  label: 'Mercado Pago',           add: 9000,  icon: 'wallet', intent: 'engagement', subtitle: 'Pasarela mexicana #1' },
          { id: 'mercadolibre', label: 'Mercado Libre',          add: 14000, icon: 'marketplace', intent: 'marketing', subtitle: 'Sincronización + listings' },
          { id: 'oxxo-spei',    label: 'OXXO / SPEI',            add: 9000,  icon: 'cash', intent: 'engagement', subtitle: 'Efectivo + transferencia' },
          { id: 'paypal',       label: 'PayPal',                 add: 7000,  icon: 'wallet', subtitle: 'Pagos internacionales' },
          { id: 'apple-google', label: 'Apple Pay · Google Pay', add: 9000,  icon: 'phonepay', subtitle: 'Tap-to-pay desde teléfono' },
          { id: 'pos-retail',   label: 'POS retail físico',      add: 18000, icon: 'shield', intent: 'engagement', subtitle: 'Cobro en tienda · integrado al inventario' },
          { id: 'cripto',       label: 'Criptomonedas',          add: 22000, icon: 'coin', intent: 'lanzamiento', subtitle: 'USDC, BTC · cobro on-chain' },
          { id: 'contra-entrega', label: 'Pago contra entrega',  add: 9000,  icon: 'ecommerce', intent: 'engagement', subtitle: 'Cobro al recibir' },
        ],
      },
      {
        id: 'integraciones', label: '¿Con qué sistemas se va a conectar?', multi: true,
        opciones: [
          { id: 'erp',  label: 'ERP (SAP / Odoo)',     add: 15000, icon: 'serverapp' },
          { id: 'crm',  label: 'CRM (HubSpot)',        add: 8000,  icon: 'partnership' },
          { id: '3pl',  label: 'Fulfillment 3PL',      add: 10000, icon: 'marketplace' },
          { id: 'mkt',  label: 'Email mkt (Klaviyo)',  add: 3000,  icon: 'leads' },
        ],
      },
    ],
    'eco-marketplace': [
      {
        id: 'modelo', label: 'Modelo del marketplace',
        opciones: [
          { id: 'comision',    label: 'Comisión por venta',         add: 0,     icon: 'fintech' },
          { id: 'suscripcion', label: 'Suscripción de vendedores',  add: 15000, icon: 'login' },
          { id: 'mixto',       label: 'Mixto',                      add: 25000, icon: 'marketplace' },
        ],
      },
    ],

    // App nativa / híbrida (mismo set de preguntas)
    'app-native': [
      {
        id: 'tipo_app', label: '¿Qué hace tu app?',
        opciones: [
          { id: 'info',    label: 'Informativa / catálogo', icon: 'info_app', add: 0, intent: 'lanzamiento',
            description: 'App que muestra contenido, productos o información. Sin login.' },
          { id: 'login',   label: 'Con login y perfil de usuario', icon: 'login', add: 10000, intent: 'engagement',
            description: 'App con cuentas, perfiles, preferencias guardadas.' },
          { id: 'backend', label: 'Con backend custom (real-time, marketplace)', icon: 'serverapp', add: 30000, intent: 'engagement',
            description: 'App tipo marketplace, chat, social, real-time.' },
          { id: 'fintech', label: 'Fintech / wallet / pagos',     icon: 'fintech', add: 50000, intent: 'marketing',
            description: 'Maneja dinero, pagos, billetera. Más seguridad y compliance.' },
        ],
      },
      {
        id: 'funciones', label: '¿Qué necesita hacer?', multi: true,
        help: 'Selecciona todas las que apliquen. Cada una se cobra como módulo.',
        opciones: [
          { id: 'push',       label: 'Notificaciones push',           add: 4000,  icon: 'info_app',  intent: 'engagement',
            description: 'Avisos al usuario aunque la app esté cerrada.' },
          { id: 'chat',       label: 'Chat / mensajería en tiempo real', add: 18000, icon: 'chatbot', intent: 'engagement',
            description: 'Conversación entre usuarios o con soporte.' },
          { id: 'geo',        label: 'Geolocalización / mapas',       add: 8000,  icon: 'explore',   intent: 'engagement',
            description: 'Mapa, búsqueda por ubicación, tracking.' },
          { id: 'camara',     label: 'Cámara / escaneo / OCR',        add: 10000, icon: 'camera',
            description: 'Toma foto, escanea código QR, lee documentos.' },
          { id: 'pagos-in',   label: 'Pagos in-app (suscripciones / compras)', add: 12000, icon: 'fintech', intent: 'marketing',
            description: 'Suscripciones App Store / Google Play o checkout interno.' },
          { id: 'offline',    label: 'Modo offline / sincronización',  add: 9000,  icon: 'wrench',
            description: 'App funciona sin internet, sincroniza al reconectar.' },
          { id: 'social',     label: 'Login social (Google / Apple / Facebook)', add: 3500, icon: 'login', intent: 'engagement',
            description: 'Acceso rápido sin formulario.' },
          { id: 'analytics',  label: 'Analytics + dashboards admin',   add: 6000,  icon: 'saas',      intent: 'marketing',
            description: 'Panel para ver métricas de uso, ventas, retención.' },
          { id: 'ia',         label: 'IA / recomendaciones',           add: 18000, icon: 'chatbot',   flag: 'ia', intent: 'marketing',
            description: 'Sugerencias personalizadas, búsqueda semántica.' },
        ],
      },
      {
        id: 'backend', label: '¿Dónde vive la información?',
        opciones: [
          { id: 'firebase', label: 'Firebase / Supabase',          add: 10000, icon: 'shield',
            description: 'Backend como servicio: rápido de montar, plan free hasta cierto uso.' },
          { id: 'node',     label: 'Custom Node.js / NestJS',      add: 30000, icon: 'serverapp', intent: 'engagement',
            description: 'Servidor propio: más control, más mantenimiento, escalable.' },
          { id: 'existing', label: 'API existente del cliente',    add: 5000,  icon: 'api',
            description: 'Ya tienes el motor, nosotros sólo integramos al frontend.' },
        ],
      },
    ],
    'app-hybrid': [
      {
        id: 'tipo_app', label: '¿Qué hace tu app?',
        opciones: [
          { id: 'info',    label: 'Informativa / catálogo', icon: 'info_app', add: 0, intent: 'lanzamiento',
            description: 'App que muestra contenido, productos o información. Sin login.' },
          { id: 'login',   label: 'Con login y perfil de usuario', icon: 'login', add: 10000, intent: 'engagement',
            description: 'App con cuentas, perfiles, preferencias guardadas.' },
          { id: 'backend', label: 'Con backend custom (real-time, marketplace)', icon: 'serverapp', add: 30000, intent: 'engagement',
            description: 'App tipo marketplace, chat, social, real-time.' },
          { id: 'fintech', label: 'Fintech / wallet / pagos',     icon: 'fintech', add: 50000, intent: 'marketing',
            description: 'Maneja dinero, pagos, billetera. Más seguridad y compliance.' },
        ],
      },
      {
        id: 'funciones', label: '¿Qué necesita hacer?', multi: true,
        help: 'Selecciona todas las que apliquen.',
        opciones: [
          { id: 'push',       label: 'Notificaciones push',           add: 4000,  icon: 'info_app',    intent: 'engagement' },
          { id: 'chat',       label: 'Chat / mensajería en tiempo real', add: 18000, icon: 'chatbot',  intent: 'engagement' },
          { id: 'geo',        label: 'Geolocalización / mapas',       add: 8000,  icon: 'explore',     intent: 'engagement' },
          { id: 'camara',     label: 'Cámara / escaneo / OCR',        add: 10000, icon: 'camera' },
          { id: 'pagos-in',   label: 'Pagos in-app (suscripciones / compras)', add: 12000, icon: 'fintech', intent: 'marketing' },
          { id: 'offline',    label: 'Modo offline / sincronización',  add: 9000, icon: 'wrench' },
          { id: 'social',     label: 'Login social (Google / Apple / Facebook)', add: 3500, icon: 'login', intent: 'engagement' },
          { id: 'analytics',  label: 'Analytics + dashboards admin',   add: 6000,  icon: 'saas',       intent: 'marketing' },
          { id: 'ia',         label: 'IA / recomendaciones',           add: 18000, icon: 'chatbot',    flag: 'ia', intent: 'marketing' },
        ],
      },
      {
        id: 'backend', label: '¿Dónde vive la información?',
        opciones: [
          { id: 'firebase', label: 'Firebase / Supabase',          add: 10000, icon: 'shield',
            description: 'Backend como servicio: rápido de montar.' },
          { id: 'node',     label: 'Custom Node.js / NestJS',      add: 30000, icon: 'serverapp', intent: 'engagement',
            description: 'Servidor propio: más control, escalable.' },
          { id: 'existing', label: 'API existente del cliente',    add: 5000,  icon: 'api',
            description: 'Ya tienes el motor, sólo integramos.' },
        ],
      },
    ],
    'app-nocode': [
      {
        id: 'plataforma', label: '¿Con qué herramienta lo armamos?',
        opciones: [
          { id: 'flutterflow', label: 'FlutterFlow',  add: 0, icon: 'hybrid',
            description: 'Genera apps nativas con interface visual. Mejor para apps con backend.' },
          { id: 'bubble',      label: 'Bubble',       add: 0, icon: 'nocode',
            description: 'Web app sin código, fuerte para marketplaces y SaaS simples.' },
          { id: 'thunkable',   label: 'Thunkable',    add: 0, icon: 'android',
            description: 'Apps móviles drag-and-drop, ideal para MVPs rápidos.' },
          { id: 'recomienda',  label: 'Que iBisne recomiende según el caso', add: 0, icon: 'star',
            description: 'Elegimos la plataforma según funciones y presupuesto.' },
        ],
      },
      {
        id: 'funciones', label: '¿Qué necesita hacer?', multi: true,
        opciones: [
          { id: 'push',       label: 'Notificaciones push',           add: 2500, icon: 'info_app', intent: 'engagement' },
          { id: 'login',      label: 'Login social',                  add: 2000, icon: 'login',    intent: 'engagement' },
          { id: 'pagos-in',   label: 'Pagos in-app',                  add: 6000, icon: 'fintech',  intent: 'marketing' },
          { id: 'geo',        label: 'Geolocalización',               add: 4000, icon: 'explore',  intent: 'engagement' },
          { id: 'camara',     label: 'Cámara / QR',                   add: 5000, icon: 'camera' },
        ],
      },
    ],
  },

  // ═══ Q4-Q8 — UNIVERSALES (aplican a todos los caminos) ══════════════
  universales: [
    {
      id: 'diseno', label: '¿Cómo quieres que se vea?',
      opciones: [
        { id: 'template', label: 'Desde template',       add: 0,    icon: 'landing',
          subtitle: 'Partimos de una base y la ajustamos a tu marca' },
        { id: 'custom',   label: 'Personalizada',        add: 40000, icon: 'sitio', intent: 'engagement',
          subtitle: 'Diseñada desde cero · estándar' },
        { id: 'premium',  label: 'Personalizada premium', add: 80000, icon: 'partnership', flag: 'animacion-pro', intent: 'lanzamiento',
          subtitle: 'Con animaciones cinematográficas' },
      ],
    },
    {
      id: 'identidad', label: '¿Tienes identidad de marca?',
      opciones: [
        { id: 'tengo',       label: 'Identidad lista',     add: 0, icon: 'partnership',
          subtitle: 'Logo, paleta y manual definidos' },
        { id: 'modernizar',  label: 'Refresh visual',      add: 18000, icon: 'sitio', intent: 'engagement',
          subtitle: 'Tengo logo · quiero modernizarlo' },
        { id: 'desde-cero',  label: 'Desde cero',          add: 60000, icon: 'dtc', intent: 'lanzamiento',
          subtitle: 'Construimos toda la identidad' },
      ],
    },
    {
      id: 'plazo', label: '¿Qué prioridad tiene tu lanzamiento?',
      help: 'Cuanto antes lo necesites, más prioridad. Cuanto más tiempo nos des, mejor precio.',
      opciones: [
        { id: 'urgente',  label: 'Prioritario',  mul: 1.4,  metaSuffix: '+40%', icon: 'arrow', intent: 'marketing',
          subtitle: 'Cola fast-track · recargo por priorización' },
        { id: 'estandar', label: 'Cola normal',  mul: 1.0, icon: 'clock',
          subtitle: 'Ritmo habitual de producción' },
        { id: 'flexible', label: 'Flexible',     mul: 0.95, metaSuffix: '−5%', icon: 'star', intent: 'lanzamiento',
          subtitle: 'Optimizamos agenda · descuento' },
      ],
    },
    {
      id: 'soporte', label: '¿Quién lo cuida después de lanzar?',
      help: 'Cobertura post-lanzamiento. Define qué equipo de iBisne queda asignado a tu proyecto.',
      opciones: [
        { id: 'sin',  label: 'Sin soporte',
          schedule: 'Sin cobertura',
          add: 0, icon: 'otro',
          subtitle: 'Tú lo operas tras la entrega' },
        { id: 'kam',  label: 'Cuenta dedicada',
          schedule: 'Lun – Vie · Horario de oficina',
          add: 15000, icon: 'login', intent: 'engagement',
          subtitle: 'Un KAM responde dudas y coordina ajustes' },
        { id: 'mesa', label: 'Mesa de trabajo',
          schedule: 'Lun – Vie · Horario de oficina',
          add: 120000, icon: 'marketplace',
          subtitle: 'KAM + diseñador + dev asignados · agenda mensual' },
        { id: '24-7', label: 'Soporte 24/7',
          schedule: '24/7 · Siempre activo',
          add: 180000, icon: 'shield', intent: 'marketing',
          subtitle: 'Para proyectos críticos sin downtime' },
      ],
    },
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

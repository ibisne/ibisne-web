/* ===================================================================
   data/precios-v13.js · v14.0 · Catálogo SPA multi-categoría
   ===================================================================
   Modelo: cada plan = PRECIO ÚNICO que YA INCLUYE dominio + hosting +
   licencias de terceros + diseño + frontend + backend + automatizaciones.

   Modelo de pago (heredado de v13.2):
     - "Mes a mes" = precio anual ÷ 12 cuotas (Visa/Mastercard/Amex)
     - "Pago en exhibición" = anual completo con -20% de descuento

   Powerups (heredado v13.2): TODO o NADA. Activar habilita los 5
   superpoderes simultáneamente y suma +43% al precio base.

   Mantenimiento mensual opcional · NO suma al pago único · incluye
   marketing + soporte continuo (igual v13.2).

   NUEVO v14.0 · 7 categorías:
     IBISNE_PRECIOS_V13.categorias[id] = { label, sub, icon, planes[] }
   =================================================================== */

window.IBISNE_PRECIOS_V13 = {

  /* ── Pago en una sola exhibición · descuento global -20% ──────── */
  exhibicion: {
    multiplier: 0.80,
    label: 'Pago en exhibición',
    badge: 'Ahorra 20%',
    nota: 'Pago anual completo · una sola exhibición',
  },

  /* ── Pago a mensualidades ────────────────────────────────────── */
  mensualidad: {
    meses: 12,
    label: 'Pago mes a mes',
    nota: 'Precio anual dividido en 12 · Visa, Mastercard, Amex',
  },

  /* ── Powerups · TODO O NADA · +43% al precio base ──────────────
     Aplican a TODAS las categorías por igual. */
  powerups: [
    { id: 'animaciones', label: 'Animaciones premium', desc: 'Microinteracciones + scroll reveals', addPct: 0.10, icon: 'zap' },
    { id: 'darklight',   label: 'Dark / Light mode',    desc: 'Tema doble + auto-detección del SO',  addPct: 0.05, icon: 'palette' },
    { id: 'idiomas',     label: 'Multi-idioma',         desc: 'Traducción + UI en 2+ idiomas',       addPct: 0.15, icon: 'partnership' },
    { id: 'multimoneda', label: 'Multi-moneda',         desc: 'Precios en MXN/USD con conversión',   addPct: 0.08, icon: 'wallet' },
    { id: 'pwa',         label: 'PWA instalable',       desc: 'App-like en móvil sin tiendas',       addPct: 0.05, icon: 'app' },
  ],
  powerupsTotalPct: 0.43,

  /* ── Mantenimiento mensual opcional · incluye marketing ──────── */
  mantenimiento: [
    {
      id: 'basico', precio: 5000, label: 'Mantenimiento Básico',
      titulo: 'Tuyo que no muere',
      desc: 'Para mantener tu desarrollo vivo, actualizado y con presencia constante.',
      features: [
        'Modificaciones y cambios simples',
        '12 piezas gráficas mensuales (posts, banners)',
        '2 redes sociales gestionadas',
        '1 historia o reel mensual',
        'Renovación de licencias incluida',
        'Actualizaciones de seguridad',
        'Soporte WhatsApp + email · horario oficina (10am-5pm)',
      ],
    },
    {
      id: 'premium', precio: 10000, label: 'Mantenimiento Premium',
      titulo: 'Acompañamiento 360°',
      desc: 'Para crecer activamente con cambios urgentes y operación de marketing.',
      features: [
        'Todo lo del plan Básico',
        'Cambios urgentes priorizados (mismo día)',
        '20 piezas gráficas mensuales',
        '4 redes sociales gestionadas',
        '3 historias o reels mensuales',
        'Reportes mensuales de performance',
        '2 reuniones estratégicas al mes',
        'Soporte teléfono + Google Meet · 24/7',
      ],
    },
  ],

  /* ── 7 CATEGORÍAS ────────────────────────────────────────────── */
  categorias: {

    /* ── 1. WEBS · 3 planes ($1k - $10k) ─────────────────────── */
    webs: {
      label: 'Webs',
      sub: 'Bio, landings y sitios con CMS',
      icon: 'sitio',
      title: 'Desarrollo web sin sorpresas',
      tagline: 'Precio cerrado que ya incluye dominio, hosting y licencias.',
      planes: [
        {
          id: 'web-micro', label: 'Web Micro', sub: 'Bio · página de enlaces',
          base: 1000, recomendado: false, icon: 'biolink', tiempo: '3-5 días',
          features: [
            'Página de enlaces (bio link)',
            'Dominio + hosting · 1 año incluido',
            'Diseño responsive (móvil)',
            'Hasta 8 enlaces + redes',
            'Botón de WhatsApp directo',
            'Soporte por email · respuesta 48h',
          ],
          cta: 'Empezar',
        },
        {
          id: 'web-landing', label: 'Landing Page', sub: 'Una página que vende',
          base: 5000, recomendado: true, icon: 'landing', tiempo: '1-2 sem',
          features: [
            'Landing larga de alta conversión',
            'Dominio + hosting · 1 año incluido',
            'SEO base + Analytics (GA4)',
            'Formulario de captura de leads',
            'Diseño responsive premium',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir Landing',
        },
        {
          id: 'web-sitio', label: 'Sitio Web', sub: 'Completo · con CMS',
          base: 10000, recomendado: false, icon: 'sitio', tiempo: '2-4 sem',
          features: [
            'Hasta 8 páginas + blog',
            'CMS editable (tú actualizas)',
            'Dominio + hosting · 1 año incluido',
            'SEO + Analytics + formularios',
            'Diseño responsive premium',
            'Soporte WhatsApp + email · ampliable a 24/7 con mantenimiento',
          ],
          cta: 'Elegir Sitio',
        },
      ],
    },

    /* ── 2. APPS MÓVILES · 3 planes ($20k - $80k) ────────────── */
    apps: {
      label: 'Apps móviles',
      sub: 'iOS · Android · cross-platform',
      icon: 'app',
      title: 'Apps que tus usuarios sí instalan',
      tagline: 'Desde PWA instalable hasta nativa en App Store y Play Store.',
      planes: [
        {
          id: 'app-pwa', label: 'PWA', sub: 'App web instalable',
          base: 20000, recomendado: false, icon: 'app', tiempo: '3-4 sem',
          features: [
            'Instalable desde el navegador (sin tiendas)',
            'Funciona offline · push notifications',
            'iOS + Android desde una sola base',
            'Diseño responsive nativo',
            'Backend + base de datos incluido',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Empezar PWA',
        },
        {
          id: 'app-single', label: 'App Nativa', sub: 'iOS o Android',
          base: 45000, recomendado: true, icon: 'ios', tiempo: '6-8 sem',
          features: [
            'App nativa publicada en una tienda (App Store o Play Store)',
            'Performance nativa · UX platform-specific',
            'Login + push notifications + analytics',
            'Backend + API + base de datos',
            'Trámites de publicación incluidos',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir Nativa',
        },
        {
          id: 'app-cross', label: 'Cross-Platform', sub: 'iOS + Android',
          base: 80000, recomendado: false, icon: 'hybrid', tiempo: '8-12 sem',
          features: [
            'Una sola app que corre en iOS Y Android',
            'Publicada en ambas tiendas (App Store + Play)',
            'React Native o Flutter (decides tú)',
            'Backend escalable + analytics avanzado',
            'Integraciones con servicios externos',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir Cross-Platform',
        },
      ],
    },

    /* ── 3. ECOMMERCE · 3 planes ($15k - $90k) ───────────────── */
    ecommerce: {
      label: 'Ecommerce',
      sub: 'Shopify y tiendas custom',
      icon: 'ecommerce',
      title: 'Vende online sin pelearte con la plataforma',
      tagline: 'Desde Shopify llave-en-mano hasta tu propio carrito custom.',
      planes: [
        {
          id: 'ecom-starter', label: 'Shopify Starter', sub: 'Tu tienda en 2 semanas',
          base: 15000, recomendado: false, icon: 'ecommerce', tiempo: '2-3 sem',
          features: [
            'Tienda Shopify con tema personalizado',
            'Hasta 50 productos cargados',
            'Pasarela de pagos configurada',
            'Envíos + impuestos configurados',
            'Email transaccional + carrito abandonado',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Empezar Shopify',
        },
        {
          id: 'ecom-pro', label: 'Shopify Pro', sub: 'Tienda + apps + diseño custom',
          base: 35000, recomendado: true, icon: 'ecommerce', tiempo: '4-6 sem',
          features: [
            'Shopify con tema 100% custom',
            'Productos ilimitados + variantes',
            'Apps integradas (reviews, upsell, loyalty)',
            'Email marketing + automatizaciones',
            'Multi-idioma + multi-moneda',
            'SEO técnico + Analytics avanzado',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir Shopify Pro',
        },
        {
          id: 'ecom-custom', label: 'Ecommerce Custom', sub: 'Tienda full code',
          base: 90000, recomendado: false, icon: 'marketplace', tiempo: '8-12 sem',
          features: [
            'Tienda en código propio (no Shopify)',
            'Sin comisiones de plataforma',
            'Backoffice administrativo a la medida',
            'Inventario multi-bodega · logística',
            'Integraciones ERP/CRM/contabilidad',
            'Escalabilidad sin límites de planes',
            'Soporte WhatsApp + email · ampliable 24/7',
          ],
          cta: 'Elegir Custom',
        },
      ],
    },

    /* ── 4. CRM · 2 planes ($40k - $90k) ─────────────────────── */
    crm: {
      label: 'CRM',
      sub: 'Pipeline de ventas y atención',
      icon: 'partnership',
      title: 'CRM que tu equipo sí usa',
      tagline: 'Configurado para tu negocio · no un Salesforce vacío.',
      planes: [
        {
          id: 'crm-standard', label: 'CRM Standard', sub: 'Pipeline + atención',
          base: 40000, recomendado: false, icon: 'partnership', tiempo: '4-6 sem',
          features: [
            'Pipeline de oportunidades visual (kanban)',
            'Captura automática desde web/WhatsApp/email',
            'Hasta 10 usuarios + roles',
            'Tableros y reportes en tiempo real',
            'Recordatorios + tareas asignables',
            'Integración WhatsApp Business + email',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Empezar CRM',
        },
        {
          id: 'crm-enterprise', label: 'CRM Enterprise', sub: 'Custom + integraciones',
          base: 90000, recomendado: true, icon: 'partnership', tiempo: '8-12 sem',
          features: [
            'Todo lo de CRM Standard',
            'Usuarios ilimitados + jerarquías complejas',
            'Workflows custom (aprobaciones, scoring de leads)',
            'Integración con ERP/contabilidad/facturación',
            'API pública para conectar otros sistemas',
            'Tableros ejecutivos + forecasting',
            'Soporte teléfono + Meet · ampliable 24/7',
          ],
          cta: 'Elegir Enterprise',
        },
      ],
    },

    /* ── 5. ERP · 3 planes ($50k - $200k) ────────────────────── */
    erp: {
      label: 'ERP',
      sub: 'Operación end-to-end de tu negocio',
      icon: 'serverapp',
      title: 'Un solo sistema corre tu empresa',
      tagline: 'Inventario, contabilidad, RH, ventas, compras — todo conectado.',
      planes: [
        {
          id: 'erp-light', label: 'ERP Light', sub: 'Para empezar a ordenar',
          base: 50000, recomendado: false, icon: 'serverapp', tiempo: '6-8 sem',
          features: [
            'Inventario + ventas + compras (3 módulos)',
            'Hasta 5 usuarios + roles básicos',
            'Reportes operativos diarios',
            'Multi-sucursal (hasta 2)',
            'Importación de catálogo desde Excel',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Empezar ERP',
        },
        {
          id: 'erp-mid', label: 'ERP Mid', sub: 'Multi-módulo · multi-bodega',
          base: 100000, recomendado: true, icon: 'serverapp', tiempo: '10-14 sem',
          features: [
            'Todo lo de ERP Light',
            'Inventario + ventas + compras + contabilidad + RH (5 módulos)',
            'Hasta 25 usuarios + jerarquías',
            'Multi-bodega ilimitada + control de stock por lote',
            'Facturación electrónica CFDI integrada',
            'Reportes financieros + tableros directivos',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir ERP Mid',
        },
        {
          id: 'erp-full', label: 'ERP Full', sub: 'Empresa completa',
          base: 200000, recomendado: false, icon: 'serverapp', tiempo: '16-24 sem',
          features: [
            'Todo lo de ERP Mid',
            'Manufactura + producción + planeación',
            'Logística + rutas + flotilla',
            'Usuarios ilimitados + auditoría completa',
            'Integraciones con bancos + SAT + proveedores',
            'API pública + custom workflows',
            'Soporte teléfono + Meet · 24/7 incluido',
          ],
          cta: 'Elegir ERP Full',
        },
      ],
    },

    /* ── 6. SaaS · 4 planes ($45k - $280k) ───────────────────── */
    saas: {
      label: 'SaaS',
      sub: 'Productos suscripcionales escalables',
      icon: 'saas',
      title: 'De idea a SaaS facturando',
      tagline: 'Construimos tu producto y te acompañamos hasta el primer cliente pagador.',
      planes: [
        {
          id: 'saas-mvp', label: 'MVP', sub: 'Validación rápida',
          base: 45000, recomendado: false, icon: 'flask', tiempo: '4-6 sem',
          features: [
            'Producto mínimo viable funcional',
            '1-2 features core · sin scope creep',
            'Auth básica + base de datos',
            'Stripe/PayPal para suscripciones',
            'Landing de venta incluida',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Empezar MVP',
        },
        {
          id: 'saas-beta', label: 'Beta', sub: 'Producto funcional',
          base: 85000, recomendado: true, icon: 'flask', tiempo: '8-12 sem',
          features: [
            'Todo lo del MVP',
            '5-8 features core + onboarding completo',
            'Multi-tenant · gestión de organizaciones',
            'Dashboard de analytics + métricas SaaS',
            'Email transaccional + email marketing',
            'Documentación + ayuda contextual',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir Beta',
        },
        {
          id: 'saas-launch', label: 'Launch', sub: 'Listo para vender',
          base: 150000, recomendado: false, icon: 'saasbiz', tiempo: '12-16 sem',
          features: [
            'Todo lo de Beta',
            'Producto ready para 1000+ usuarios concurrentes',
            'Billing complejo (planes, addons, trials, descuentos)',
            'API pública + webhooks documentados',
            'Sistema de roles + permisos avanzado',
            'SOC2-ready: auditoría, logs, backups',
            'Soporte teléfono + Meet · horario extendido',
          ],
          cta: 'Elegir Launch',
        },
        {
          id: 'saas-scale', label: 'Scale', sub: 'SaaS Enterprise',
          base: 280000, recomendado: false, icon: 'saasbiz', tiempo: '20-30 sem',
          features: [
            'Todo lo de Launch',
            'Arquitectura cloud multi-región',
            'SSO + SAML para empresas grandes',
            'White-label / multi-marca',
            'Marketplace de integraciones',
            'Equipo dedicado de DevOps + SRE',
            'Soporte teléfono + Meet · 24/7 incluido',
          ],
          cta: 'Elegir Scale',
        },
      ],
    },

    /* ── 7. IA & AUTOMATIZACIÓN · 3 planes ($12k - $60k) ─────── */
    ia: {
      label: 'IA & Automatización',
      sub: 'Chatbots, integraciones, agentes',
      icon: 'star',
      title: 'IA que sí mueve el negocio',
      tagline: 'Desde un chatbot inteligente hasta un agente autónomo que opera tu pipeline.',
      planes: [
        {
          id: 'ia-chatbot', label: 'Chatbot IA', sub: 'Asistente WhatsApp · Web',
          base: 12000, recomendado: false, icon: 'chatbot', tiempo: '2-3 sem',
          features: [
            'Chatbot con GPT-4 o Claude integrado',
            'WhatsApp Business + widget web',
            'Entrenado con tu catálogo / FAQs',
            'Handoff a humano cuando aplica',
            'Reportes de conversaciones + insights',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Empezar Chatbot',
        },
        {
          id: 'ia-integraciones', label: 'Integraciones', sub: 'Conecta tus sistemas',
          base: 25000, recomendado: true, icon: 'api', tiempo: '3-5 sem',
          features: [
            'Conexión entre 2-5 sistemas (CRM, ERP, e-commerce, etc.)',
            'Sincronización en tiempo real o por lotes',
            'Transformación + limpieza de datos',
            'Workflows automáticos (Zapier-style pero a la medida)',
            'Monitoreo + alertas + logs',
            'Soporte WhatsApp + email · horario oficina',
          ],
          cta: 'Elegir Integraciones',
        },
        {
          id: 'ia-agente', label: 'Agente Autónomo', sub: 'Workflow IA completo',
          base: 60000, recomendado: false, icon: 'star', tiempo: '6-10 sem',
          features: [
            'Agente IA que ejecuta workflows complejos solo',
            'Acceso a múltiples herramientas (email, CRM, web, APIs)',
            'Memoria persistente + aprendizaje continuo',
            'Casos de uso: prospección, atención, análisis, reporting',
            'Supervisión humana opcional (human-in-the-loop)',
            'Dashboards de actividad + auditoría',
            'Soporte teléfono + Meet · ampliable 24/7',
          ],
          cta: 'Elegir Agente',
        },
      ],
    },

  },

};

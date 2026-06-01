/* ===================================================================
   data/precios-v13.js · v16.0 · Catálogo SPA con Powerups ×4 + features extensas
   ===================================================================
   Modelo v16.0 (Eduardo):
   - Precio único por plan (sin segmented mes/exhibición · eliminado).
   - Powerups TODO O NADA · activar multiplica el precio por 4 (+300%).
   - Cada powerup tiene un addPct interno · suma = 3.0.
   - Features extensas: cada concepto en línea separada.
   - Soporte movido a plan.checkout.soporte (no se muestra en home · se
     usa en checkout futuro).
   - Mantenimiento conservado en data (para checkout · no se renderiza
     en SPA tras v16.0).

   API:
     IBISNE_PRECIOS_V13.categorias[id] = { label, sub, icon, planes[] }
     plan.features[] = visibles en home
     plan.checkout.soporte = string · para checkout futuro
   =================================================================== */

window.IBISNE_PRECIOS_V13 = {

  /* ── Powerups · TODO O NADA · ×4 al precio base (+300%) ───────
     Eduardo v16.0: powerups deja de ser "5 features sumadas" y se vuelve
     "transformación premium del proyecto". Reparto interno: 75+30+90+60+45 = 300%.
     Cada plan multiplica su base por 4 cuando powerups está on. */
  powerups: [
    { id: 'animaciones', label: 'Animaciones premium',     desc: 'Microinteracciones + scroll reveals + transiciones cinemáticas', addPct: 0.75, icon: 'zap' },
    { id: 'darklight',   label: 'Dark / Light mode',        desc: 'Tema doble + auto-detección del SO + persistencia',              addPct: 0.30, icon: 'palette' },
    { id: 'idiomas',     label: 'Multi-idioma',             desc: 'Traducción profesional + UI completa en 2+ idiomas',             addPct: 0.90, icon: 'partnership' },
    { id: 'multimoneda', label: 'Multi-moneda',             desc: 'Precios en MXN/USD/EUR con conversión en tiempo real',           addPct: 0.60, icon: 'wallet' },
    { id: 'pwa',         label: 'PWA instalable',           desc: 'App-like en móvil sin tiendas · funciona offline · push',        addPct: 0.45, icon: 'app' },
  ],
  powerupsTotalPct: 3,   // ×4 al activar (+300% sobre base)

  /* ── Mantenimiento mensual (conservado en data para checkout futuro)
     v16.0 NO se renderiza en SPA · vive en api/checkout cuando se construya. */
  /* v19.7 · Modelo nuevo: BÁSICO INCLUIDO (precio 0) · PREMIUM upgrade +$5k/mes */
  mantenimiento: [
    {
      id: 'basico', precio: 0, label: 'Básico (incluido)',
      titulo: 'Mantenimiento incluido',
      desc: 'Mantenimiento básico incluido en todos los planes · sin costo extra.',
      features: [
        'Modificaciones y cambios simples',
        'Piezas gráficas mensuales para tus redes',
        'Soporte WhatsApp + email · horario oficina',
        'Actualizaciones de seguridad',
      ],
    },
    {
      id: 'premium', precio: 5000, label: 'Premium',
      titulo: 'Acompañamiento 360°',
      desc: 'Soporte 24/7 + reportes mensuales + reuniones estratégicas. Upgrade desde Básico.',
      features: [
        'Todo lo del plan Básico',
        'Cambios urgentes priorizados (mismo día)',
        'Reportes mensuales de performance',
        '2 reuniones estratégicas al mes',
        'Soporte teléfono + Google Meet · 24/7',
      ],
    },
  ],

  /* ── 7 CATEGORÍAS · 21 planes ─────────────────────────────── */
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
            'Dominio incluido (1 año)',
            'Hosting incluido (1 año)',
            'Diseño responsive optimizado para móvil',
            'Hasta 8 enlaces directos',
            'Botones a tus redes sociales',
            'Botón de WhatsApp directo',
          ],
          checkout: { soporte: 'Email · respuesta 48h' },
          cta: 'Seleccionar',
        },
        {
          id: 'web-landing', label: 'Landing Page', sub: 'Una página que vende',
          base: 5000, recomendado: true, icon: 'landing', tiempo: '1-2 sem',
          features: [
            'Landing larga de alta conversión',
            'Dominio incluido (1 año)',
            'Hosting incluido (1 año)',
            'SEO adaptado al objetivo',
            'Analytics (GA4) configurado',
            'Formulario de captura de leads',
            'Diseño responsive optimizado para móvil',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'web-sitio', label: 'Sitio Web', sub: 'Completo · con CMS',
          base: 10000, recomendado: false, icon: 'sitio', tiempo: '2-4 sem',
          features: [
            'Hasta 8 páginas internas',
            'Blog editable con CMS',
            'CMS para que tú actualices el contenido',
            'Dominio incluido (1 año)',
            'Hosting incluido (1 año)',
            'SEO adaptado al objetivo',
            'Analytics (GA4) configurado',
            'Formularios ilimitados',
            'Diseño responsive optimizado para móvil',
          ],
          checkout: { soporte: 'WhatsApp + email · ampliable a 24/7' },
          cta: 'Seleccionar',
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
            'Instalable desde el navegador',
            'Sin trámites en App Store ni Play Store',
            'Funciona offline',
            'Push notifications',
            'Una sola base que corre en iOS y Android',
            'Diseño nativo en cada plataforma',
            'Backend escalable incluido',
            'Base de datos configurada',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'app-single', label: 'App Nativa', sub: 'iOS o Android',
          base: 45000, recomendado: true, icon: 'ios', tiempo: '6-8 sem',
          features: [
            'App nativa en iOS o Android (tú eliges)',
            'Publicada en la tienda oficial correspondiente',
            'Performance nativa fluida',
            'UX adaptada a cada plataforma',
            'Login con email y redes sociales',
            'Push notifications configurables',
            'Analytics integrado',
            'Backend escalable incluido',
            'API documentada',
            'Base de datos configurada',
            'Trámites de publicación incluidos',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'app-cross', label: 'Cross-Platform', sub: 'iOS + Android',
          base: 80000, recomendado: false, icon: 'hybrid', tiempo: '8-12 sem',
          features: [
            'Una sola app que corre en iOS y Android',
            'Publicada en App Store',
            'Publicada en Play Store',
            'Stack moderno: React Native o Flutter (tú decides)',
            'Backend escalable incluido',
            'Analytics avanzado integrado',
            'Integraciones con servicios externos',
            'Trámites de publicación en ambas tiendas',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
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
            'Tienda Shopify lista para vender',
            'Tema personalizado a tu marca',
            'Hasta 50 productos cargados',
            'Pasarela de pagos configurada',
            'Cálculo de envíos automático',
            'Cálculo de impuestos automático',
            'Email transaccional configurado',
            'Recuperación de carrito abandonado',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'ecom-pro', label: 'Shopify Pro', sub: 'Tienda + apps + diseño custom',
          base: 35000, recomendado: true, icon: 'ecommerce', tiempo: '4-6 sem',
          features: [
            'Shopify con tema 100% custom',
            'Productos ilimitados',
            'Variantes por producto (color, talla, etc.)',
            'App de reviews integrada',
            'App de upsell integrada',
            'App de programa de loyalty',
            'Email marketing configurado',
            'Automatizaciones de marketing',
            'Multi-idioma incluido',
            'Multi-moneda con conversión',
            'SEO técnico optimizado',
            'Analytics avanzado integrado',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'ecom-custom', label: 'Ecommerce Custom', sub: 'Tienda full code',
          base: 90000, recomendado: false, icon: 'marketplace', tiempo: '8-12 sem',
          features: [
            'Tienda en código propio (no Shopify)',
            'Sin comisiones de plataforma',
            'Backoffice administrativo a la medida',
            'Inventario multi-bodega',
            'Gestión de logística integrada',
            'Integración con tu ERP',
            'Integración con tu CRM',
            'Integración con tu contabilidad',
            'Escalabilidad sin límites de planes',
          ],
          checkout: { soporte: 'WhatsApp + email · ampliable a 24/7' },
          cta: 'Seleccionar',
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
            'Pipeline visual de oportunidades (kanban)',
            'Captura automática desde tu sitio web',
            'Captura automática desde WhatsApp Business',
            'Captura automática desde email',
            'Hasta 10 usuarios incluidos',
            'Roles y permisos por equipo',
            'Tableros en tiempo real',
            'Reportes exportables',
            'Recordatorios automáticos',
            'Tareas asignables al equipo',
            'Integración WhatsApp Business',
            'Integración email transaccional',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'crm-enterprise', label: 'CRM Enterprise', sub: 'Custom + integraciones',
          base: 90000, recomendado: true, icon: 'partnership', tiempo: '8-12 sem',
          features: [
            'Todo lo de CRM Standard',
            'Usuarios ilimitados incluidos',
            'Jerarquías complejas multi-nivel',
            'Workflows de aprobación personalizados',
            'Sistema de scoring de leads',
            'Integración con tu ERP',
            'Integración con contabilidad',
            'Integración con facturación electrónica',
            'API pública documentada',
            'Tableros ejecutivos en tiempo real',
            'Forecasting con IA integrada',
          ],
          checkout: { soporte: 'Teléfono + Meet · ampliable a 24/7' },
          cta: 'Seleccionar',
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
            'Módulo de inventario completo',
            'Módulo de ventas con facturación',
            'Módulo de compras con proveedores',
            'Hasta 5 usuarios incluidos',
            'Roles básicos por equipo',
            'Reportes operativos diarios',
            'Multi-sucursal (hasta 2)',
            'Importación de catálogo desde Excel',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'erp-mid', label: 'ERP Mid', sub: 'Multi-módulo · multi-bodega',
          base: 100000, recomendado: true, icon: 'serverapp', tiempo: '10-14 sem',
          features: [
            'Todo lo de ERP Light',
            'Módulo de contabilidad integrado',
            'Módulo de Recursos Humanos',
            'Hasta 25 usuarios incluidos',
            'Jerarquías multi-nivel',
            'Multi-bodega ilimitada',
            'Control de stock por lote',
            'Facturación electrónica CFDI',
            'Reportes financieros completos',
            'Tableros directivos ejecutivos',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'erp-full', label: 'ERP Full', sub: 'Empresa completa',
          base: 200000, recomendado: false, icon: 'serverapp', tiempo: '16-24 sem',
          features: [
            'Todo lo de ERP Mid',
            'Módulo de manufactura',
            'Planeación de producción',
            'Control de calidad',
            'Módulo de logística',
            'Optimización de rutas',
            'Gestión de flotilla vehicular',
            'Usuarios ilimitados',
            'Auditoría completa de operaciones',
            'Integración bancaria automática',
            'Integración con SAT',
            'Portal de proveedores',
            'API pública documentada',
            'Workflows personalizados',
          ],
          checkout: { soporte: 'Teléfono + Meet · 24/7 incluido' },
          cta: 'Seleccionar',
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
            '1-2 features core (sin scope creep)',
            'Autenticación básica configurada',
            'Base de datos lista para escalar',
            'Stripe configurado para suscripciones',
            'PayPal como pasarela alternativa',
            'Landing de venta incluida',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'saas-beta', label: 'Beta', sub: 'Producto funcional',
          base: 85000, recomendado: true, icon: 'flask', tiempo: '8-12 sem',
          features: [
            'Todo lo del MVP',
            '5-8 features core implementados',
            'Onboarding completo del usuario',
            'Arquitectura multi-tenant',
            'Gestión de organizaciones',
            'Dashboard de analytics',
            'Métricas SaaS (MRR, churn, etc.)',
            'Email transaccional configurado',
            'Email marketing integrado',
            'Documentación pública del producto',
            'Ayuda contextual in-app',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'saas-launch', label: 'Launch', sub: 'Listo para vender',
          base: 150000, recomendado: false, icon: 'saasbiz', tiempo: '12-16 sem',
          features: [
            'Todo lo de Beta',
            'Arquitectura para 1000+ usuarios concurrentes',
            'Billing con múltiples planes',
            'Addons y módulos opcionales',
            'Trials configurables',
            'Sistema de descuentos y cupones',
            'API pública documentada',
            'Webhooks configurables',
            'Sistema de roles avanzado',
            'Permisos granulares por feature',
            'Auditoría completa de operaciones',
            'Logs centralizados',
            'Backups automáticos diarios',
          ],
          checkout: { soporte: 'Teléfono + Meet · horario extendido' },
          cta: 'Seleccionar',
        },
        {
          id: 'saas-scale', label: 'Scale', sub: 'SaaS Enterprise',
          base: 280000, recomendado: false, icon: 'saasbiz', tiempo: '20-30 sem',
          features: [
            'Todo lo de Launch',
            'Arquitectura cloud multi-región',
            'SSO (Single Sign-On)',
            'SAML para empresas enterprise',
            'White-label / multi-marca',
            'Marketplace de integraciones',
            'DevOps dedicado',
            'SRE (Site Reliability Engineering) incluido',
          ],
          checkout: { soporte: 'Teléfono + Meet · 24/7 incluido' },
          cta: 'Seleccionar',
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
            'Chatbot con GPT-4 o Claude (tú decides)',
            'Integrado con WhatsApp Business',
            'Widget en tu sitio web',
            'Entrenado con tu catálogo',
            'Entrenado con tus FAQs',
            'Handoff a humano cuando aplica',
            'Reportes de conversaciones',
            'Insights de intenciones de usuarios',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'ia-integraciones', label: 'Integraciones', sub: 'Conecta tus sistemas',
          base: 25000, recomendado: true, icon: 'api', tiempo: '3-5 sem',
          features: [
            'Conexión entre 2-5 sistemas tuyos',
            'Compatible con CRM, ERP, e-commerce y más',
            'Sincronización en tiempo real',
            'Sincronización por lotes (batches programados)',
            'Transformación de datos automática',
            'Limpieza de datos al pasar',
            'Workflows automáticos a la medida',
            'Disparadores configurables',
            'Monitoreo continuo',
            'Alertas por email y Slack',
            'Logs centralizados y exportables',
          ],
          checkout: { soporte: 'WhatsApp + email · horario oficina' },
          cta: 'Seleccionar',
        },
        {
          id: 'ia-agente', label: 'Agente Autónomo', sub: 'Workflow IA completo',
          base: 60000, recomendado: false, icon: 'star', tiempo: '6-10 sem',
          features: [
            'Agente IA que ejecuta workflows complejos solo',
            'Acceso a email transaccional',
            'Acceso a tu CRM',
            'Acceso a la web (navegación)',
            'Acceso a APIs externas',
            'Memoria persistente entre sesiones',
            'Aprendizaje continuo del contexto',
            'Caso de uso: prospección automática',
            'Caso de uso: atención al cliente',
            'Caso de uso: análisis de datos',
            'Caso de uso: reportes automáticos',
            'Supervisión humana (human-in-the-loop)',
            'Dashboard de actividad en vivo',
            'Auditoría completa de acciones',
          ],
          checkout: { soporte: 'Teléfono + Meet · ampliable a 24/7' },
          cta: 'Seleccionar',
        },
      ],
    },

  },

};

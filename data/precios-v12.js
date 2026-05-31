/* ===================================================================
   data/precios-v12.js · v12.0 · Lista de precios predeterminada
   ===================================================================
   Modelo nuevo (rework v12): listas de precios comparativas tipo Shopify.
   Cada plan = PRECIO ÚNICO que YA INCLUYE: dominio + hosting + licencias
   de terceros + diseño + frontend + backend + automatizaciones. El cliente
   paga en una sola exhibición (con -25% de descuento vs mes a mes) y puede
   agregar mantenimiento mensual opcional.

   Toggles por plan:
     - Pago: mes a mes (precio base) vs exhibición (-25%)
     - Powerups: extras que SUMAN % al precio del plan (animaciones, etc.)

   NOTA: este slice solo trae la categoría `webs`. apps/shopify/software
   se agregan con la misma estructura en fases posteriores. Las features
   son una primera propuesta · Eduardo las afina sobre la página renderizada.

   API esperada por pricing-table.js:
     IBISNE_PRECIOS_V12[categoria] = { label, planes[], featureRows[] }
   =================================================================== */

window.IBISNE_PRECIOS_V12 = {

  /* ── Pago en una sola exhibición · descuento global ──────────── */
  exhibicion: {
    multiplier: 0.75,           // -25%
    label: 'Pago en exhibición',
    badge: 'Ahorra 25%',
  },

  /* ── Powerups · togglean por plan · suman % al precio ────────── */
  powerups: [
    { id: 'animaciones', label: 'Animaciones premium', desc: 'Microinteracciones + scroll reveals', addPct: 0.10, icon: 'zap' },
    { id: 'darklight',   label: 'Dark / Light mode',    desc: 'Tema doble + auto-detección del SO',  addPct: 0.05, icon: 'palette' },
    { id: 'idiomas',     label: 'Multi-idioma',         desc: 'Traducción + UI en 2+ idiomas',       addPct: 0.15, icon: 'partnership' },
    { id: 'multimoneda', label: 'Multi-moneda',         desc: 'Precios en MXN/USD con conversión',    addPct: 0.08, icon: 'wallet' },
  ],

  /* ── Mantenimiento mensual opcional · NO suma al pago único ──── */
  mantenimiento: [
    {
      id: 'basico', precio: 5000, label: 'Mantenimiento Básico',
      desc: 'Para mantener tu desarrollo vivo y actualizado.',
      features: [
        'Modificaciones y cambios simples',
        'Soporte por WhatsApp en horario hábil',
        'Actualizaciones de seguridad',
        'Renovación de licencias incluida',
      ],
    },
    {
      id: 'premium', precio: 10000, label: 'Mantenimiento Premium',
      desc: 'Acompañamiento para cambios urgentes o críticos.',
      features: [
        'Todo lo del Básico',
        'Cambios urgentes priorizados',
        'Acompañamiento dedicado',
        'Soporte extendido',
      ],
    },
  ],

  /* ── CATEGORÍA: WEBS ──────────────────────────────────────────── */
  webs: {
    label: 'Desarrollo Web',
    eyebrow: '— PLANES WEB',
    title: 'Tu presencia en internet, sin sorpresas',
    sub: 'Precio cerrado que ya incluye dominio, hosting y todas las licencias. Tú solo eliges el plan.',

    planes: [
      {
        id: 'web-micro',
        label: 'Web Micro',
        sub: 'Bio · página de enlaces',
        base: 1000,
        recomendado: false,
        icon: 'biolink',
        tiempo: '3-5 días',
        // Features mostradas dentro de la card (las 5 más vendedoras)
        features: [
          'Página de enlaces (bio link)',
          'Dominio + hosting · 1 año incluido',
          'Diseño responsive (móvil)',
          'Hasta 8 enlaces + redes',
          'Botón de WhatsApp directo',
        ],
        cta: 'Empezar',
      },
      {
        id: 'web-landing',
        label: 'Landing Page',
        sub: 'Una página que vende',
        base: 5000,
        recomendado: true,
        icon: 'landing',
        tiempo: '1-2 sem',
        features: [
          'Landing larga de alta conversión',
          'Dominio + hosting · 1 año incluido',
          'SEO base + Analytics (GA4)',
          'Formulario de captura de leads',
          'Diseño responsive premium',
        ],
        cta: 'Elegir Landing',
      },
      {
        id: 'web-sitio',
        label: 'Sitio Web',
        sub: 'Completo · con CMS',
        base: 10000,
        recomendado: false,
        icon: 'sitio',
        tiempo: '2-4 sem',
        features: [
          'Hasta 8 páginas + blog',
          'CMS editable (tú actualizas)',
          'Dominio + hosting · 1 año incluido',
          'SEO + Analytics + formularios',
          'Diseño responsive premium',
        ],
        cta: 'Elegir Sitio',
      },
    ],

    /* Matriz comparativa · filas = features · valores por plan id.
       '✓' = incluido · '—' = no incluido · texto = especificación. */
    featureRows: [
      { label: 'Páginas incluidas',          values: { 'web-micro': '1',        'web-landing': '1 larga',  'web-sitio': 'Hasta 8' } },
      { label: 'Dominio + hosting (1 año)',  values: { 'web-micro': '✓',        'web-landing': '✓',        'web-sitio': '✓' } },
      { label: 'Licencias de terceros',      values: { 'web-micro': '✓',        'web-landing': '✓',        'web-sitio': '✓' } },
      { label: 'Diseño responsive',          values: { 'web-micro': '✓',        'web-landing': '✓',        'web-sitio': '✓' } },
      { label: 'SEO base',                   values: { 'web-micro': '—',        'web-landing': '✓',        'web-sitio': '✓' } },
      { label: 'Analytics (GA4)',            values: { 'web-micro': '—',        'web-landing': '✓',        'web-sitio': '✓' } },
      { label: 'Formularios de captura',     values: { 'web-micro': '1 simple', 'web-landing': '✓',        'web-sitio': 'Ilimitados' } },
      { label: 'CMS editable',               values: { 'web-micro': '—',        'web-landing': '—',        'web-sitio': '✓' } },
      { label: 'Blog',                       values: { 'web-micro': '—',        'web-landing': '—',        'web-sitio': '✓' } },
      { label: 'Rondas de revisión',         values: { 'web-micro': '2',        'web-landing': '3',        'web-sitio': '5' } },
      { label: 'Tiempo de entrega',          values: { 'web-micro': '3-5 días', 'web-landing': '1-2 sem',  'web-sitio': '2-4 sem' } },
    ],
  },

};

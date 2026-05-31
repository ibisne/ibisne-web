/* ===================================================================
   data/precios-v12.js · v13.2 · Lista de precios predeterminada
   ===================================================================
   Modelo: cada plan = PRECIO ÚNICO que YA INCLUYE dominio + hosting +
   licencias de terceros + diseño + frontend + backend + automatizaciones.

   Modelo de pago (v13.2):
     - "Mes a mes" = precio anual ÷ 12 cuotas mensuales (Visa/Mastercard/Amex)
     - "Pago en exhibición" = precio anual completo con -20% de descuento

   Powerups (v13.2): TODO o NADA. Activar habilita los 5 superpoderes
   simultáneamente al desarrollo y suma +43% al precio base (10+5+15+8+5).

   Mantenimiento mensual opcional · NO suma al pago único · cubre
   modificaciones + marketing + soporte continuo.

   API:
     IBISNE_PRECIOS_V12[categoria] = { label, planes[], featureRows[] }
   =================================================================== */

window.IBISNE_PRECIOS_V12 = {

  /* ── Pago en una sola exhibición · descuento global -20% ──────── */
  exhibicion: {
    multiplier: 0.80,           // -20% (era -25% en v13.1)
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

  /* ── Powerups · TODO O NADA · suman +43% al precio base ──────── */
  powerups: [
    { id: 'animaciones', label: 'Animaciones premium', desc: 'Microinteracciones + scroll reveals', addPct: 0.10, icon: 'zap' },
    { id: 'darklight',   label: 'Dark / Light mode',    desc: 'Tema doble + auto-detección del SO',  addPct: 0.05, icon: 'palette' },
    { id: 'idiomas',     label: 'Multi-idioma',         desc: 'Traducción + UI en 2+ idiomas',       addPct: 0.15, icon: 'partnership' },
    { id: 'multimoneda', label: 'Multi-moneda',         desc: 'Precios en MXN/USD con conversión',   addPct: 0.08, icon: 'wallet' },
    { id: 'pwa',         label: 'PWA instalable',       desc: 'App-like en móvil sin tiendas',       addPct: 0.05, icon: 'app' },
  ],
  powerupsTotalPct: 0.43,   // suma de todos los addPct · "todo-o-nada"

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

  /* ── CATEGORÍA: WEBS ──────────────────────────────────────────── */
  webs: {
    label: 'Desarrollo Web',
    eyebrow: 'Planes web',
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
          'Soporte WhatsApp + email · horario oficina',
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
          'Soporte WhatsApp + email · ampliable a 24/7 con mantenimiento',
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
      { label: 'Soporte técnico',            values: { 'web-micro': 'Email · 48h',           'web-landing': 'WhatsApp + email · oficina',  'web-sitio': 'WhatsApp + email · ampliable 24/7' } },
      { label: 'Tiempo de entrega',          values: { 'web-micro': '3-5 días', 'web-landing': '1-2 sem',  'web-sitio': '2-4 sem' } },
    ],
  },

};

// data/discovery.js — Etapa 2 · Discovery profundo
// Solo aparece después de Etapa 1 (descarga de PDF o click "precisar más").
// Profundiza alcance, identifica decisor, captura assets existentes.

window.IBISNE_DISCOVERY = {

  preguntas: [

    {
      id: 'objetivo', label: '¿Cuál es tu objetivo comercial principal?',
      opciones: [
        { id: 'vender',       label: 'Vender más en mi negocio actual' },
        { id: 'leads',        label: 'Capturar leads cualificados' },
        { id: 'posicionarme', label: 'Posicionar mi marca / autoridad' },
        { id: 'producto',     label: 'Lanzar un producto digital propio' },
      ],
    },

    {
      id: 'audiencia', label: '¿Quién es tu audiencia?',
      opciones: [
        { id: 'mexico',         label: 'México' },
        { id: 'latam',          label: 'LATAM' },
        { id: 'internacional',  label: 'Internacional' },
      ],
    },

    {
      id: 'facturacion', label: '¿Cuánto factura tu negocio al año?',
      opciones: [
        { id: '<2M',     label: 'Menos de $2M MXN' },
        { id: '2-10M',   label: '$2M – $10M MXN' },
        { id: '10-50M',  label: '$10M – $50M MXN' },
        { id: '50M+',    label: 'Más de $50M MXN' },
      ],
    },

    {
      id: 'tech_actual', label: '¿Cómo opera tu tech hoy?',
      opciones: [
        { id: 'nada',     label: 'Nada digital · empezando' },
        { id: 'shopify',  label: 'Shopify / WordPress estándar' },
        { id: 'agencia',  label: 'Externalizado con agencia' },
        { id: 'inhouse',  label: 'Custom in-house' },
      ],
    },

    {
      id: 'integraciones', label: '¿Qué necesitas integrar?', multi: true,
      help: 'Selecciona todas las que apliquen.',
      opciones: [
        { id: 'crm',       label: 'CRM (HubSpot, Salesforce)' },
        { id: 'erp',       label: 'ERP (SAP, Odoo, otro)' },
        { id: 'whatsapp',  label: 'WhatsApp Business API' },
        { id: 'email-mkt', label: 'Email marketing (Klaviyo, Mailchimp)' },
        { id: 'analytics', label: 'Analytics avanzado (GA4, Mixpanel)' },
        { id: 'pago',      label: 'Pasarelas de pago' },
        { id: 'ninguna',   label: 'Ninguna por ahora' },
      ],
    },

    {
      id: 'decisor', label: '¿Quién decide la contratación?',
      opciones: [
        { id: 'yo',          label: 'Yo decido' },
        { id: 'comite',      label: 'Comité interno' },
        { id: 'inversor',    label: 'Inversionista / consejo' },
      ],
    },

    {
      id: 'presupuesto', label: '¿Cuál es tu presupuesto para este proyecto?',
      help: 'Sé honesto · esto nos ayuda a ajustar el alcance.',
      opciones: [
        { id: '<30',   label: 'Menos de $30k MXN' },
        { id: '30-80', label: '$30k – $80k MXN' },
        { id: '80-200',label: '$80k – $200k MXN' },
        { id: '200+',  label: 'Más de $200k MXN' },
      ],
    },

    {
      id: 'assets', label: '¿Tienes algo armado?', multi: true,
      help: 'Lo que tengas suma. Lo que falte lo construimos.',
      opciones: [
        { id: 'logo',         label: 'Logo + manual de marca' },
        { id: 'wireframes',   label: 'Wireframes / mockups' },
        { id: 'contenido',    label: 'Contenido editorial' },
        { id: 'referencias',  label: 'Referencias visuales' },
        { id: 'nada',         label: 'Nada · partimos de cero' },
      ],
    },

    {
      id: 'notas', label: 'Cuéntame el contexto en 1-2 párrafos',
      help: 'Lo que tu proyecto necesita resolver, lo que ya intentaste, lo que más te importa.',
      form: true,
      campos: [
        { id: 'notas', label: 'Notas del proyecto', required: true, textarea: true },
      ],
    },
  ],

  // ═══ Lead scoring para Etapa 2 ══════════════════════════════════════
  // Priorización P0/P1/P2/P3 para Willy / hunter del equipo
  prioridad(answers, cotizacion){
    let score = 0;

    // Facturación
    const facturacion = { '<2M': 0, '2-10M': 10, '10-50M': 20, '50M+': 25 };
    score += facturacion[answers.facturacion?.id] || 0;

    // Presupuesto vs cotización indicativa
    const presupuestoMap = { '<30': 25000, '30-80': 55000, '80-200': 140000, '200+': 300000 };
    const presupuesto = presupuestoMap[answers.presupuesto?.id] || 0;
    if (cotizacion > 0 && presupuesto > 0) {
      const ratio = presupuesto / cotizacion;
      if (ratio >= 1.0)      score += 25;  // cabe en presupuesto
      else if (ratio >= 0.7) score += 10;  // ajustable
      else                   score -= 15;  // gap grande
    }

    // Decisor
    const decisor = { yo: 15, comite: 5, inversor: 8 };
    score += decisor[answers.decisor?.id] || 0;

    // Tech actual (agencia = más receptivo)
    const tech = { agencia: 15, nada: 10, shopify: 8, inhouse: -5 };
    score += tech[answers.tech_actual?.id] || 0;

    // Assets (más armado = más rápido)
    if (Array.isArray(answers.assets)) {
      score += answers.assets.length * 3;
    }

    // Normalizar 0-100
    const normalized = Math.max(0, Math.min(100, score));

    if (normalized >= 70) return { id: 'P0', label: 'PRIORITY · respuesta en <24h' };
    if (normalized >= 50) return { id: 'P1', label: 'HIGH · respuesta en <48h' };
    if (normalized >= 30) return { id: 'P2', label: 'MEDIUM · respuesta esta semana' };
    return                       { id: 'P3', label: 'LOW · seguimiento por email' };
  },
};

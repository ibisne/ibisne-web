// data/scoring.js — Motor Rama A (Socio · fit-score)
// Foco: marcas con producto físico que ya facturan, llevadas a ecommerce
// alto impacto a cambio de comisión sobre ventas digitales.
//
// 4 dimensiones: Tracción · Madurez · Upside · Economía del deal

window.IBISNE_SCORING = {

  // ─── Las 10 preguntas (lenguaje natural, foco ecommerce) ────────────
  preguntas: [
    {
      id: 'que_vendes', label: '¿Qué vendes?',
      opciones: [
        { id: 'dtc',         label: 'Productos físicos propios (mi marca)',
          description: 'Tú diseñas, fabricas o privatizas. Marca propia DTC.',
          pts: { traccion: 8, upside: 14 } },
        { id: 'reseller',    label: 'Productos físicos de terceros (reseller / distribuidora)',
          description: 'Compras a fabricantes y revendes. Distribución multi-marca.',
          pts: { traccion: 6, upside: 10 } },
        { id: 'servicio',    label: 'Servicios profesionales',
          description: 'Consultoría, salud, educación, agencia. No es producto físico.',
          pts: { traccion: 3, upside: 3 } },
        { id: 'saas',        label: 'Producto digital / SaaS',
          description: 'Software, suscripción digital, plataforma.',
          pts: { traccion: 5, upside: 4 } },
        { id: 'otro',        label: 'Otro / mixto',
          pts: { traccion: 2, upside: 2 } },
      ],
    },

    {
      id: 'tiempo', label: '¿Hace cuánto operas?',
      opciones: [
        { id: '<1',    label: 'Menos de 1 año',  pts: { madurez: 1 } },
        { id: '1-3',   label: '1 a 3 años',      pts: { madurez: 5 } },
        { id: '3-7',   label: '3 a 7 años',      pts: { madurez: 8 } },
        { id: '7+',    label: '7+ años',         pts: { madurez: 10 } },
      ],
    },

    {
      id: 'facturacion', label: '¿Cuánto facturas al año?',
      help: 'Cifra orientativa en pesos mexicanos. Define en qué tier de inversión iBisne entra.',
      opciones: [
        { id: '<2M',     label: 'Menos de $2M MXN',   pts: { traccion: -10, economia: -5 }, billing: 1000000 },
        { id: '2-10M',   label: '$2M a $10M MXN',     pts: { traccion: 8, economia: 5 },    billing: 6000000 },
        { id: '10-50M',  label: '$10M a $50M MXN',    pts: { traccion: 12, economia: 10 },  billing: 30000000 },
        { id: '50-200M', label: '$50M a $200M MXN',   pts: { traccion: 14, economia: 12 },  billing: 125000000 },
        { id: '200M+',   label: 'Más de $200M MXN',   pts: { traccion: 12, economia: 8 },   billing: 300000000 },
      ],
    },

    {
      id: 'donde_vendes', label: '¿Dónde vendes hoy?', multi: true,
      help: 'Selecciona todos los canales activos.',
      opciones: [
        { id: 'punto-fisico',  label: 'Punto de venta físico',
          description: 'Tienda, kiosko, distribuidor, retail.',
          pts: { traccion: 5, upside: 8 } },
        { id: 'marketplaces',  label: 'Marketplaces (Amazon, Mercado Libre)',
          description: 'Vendes ahí pero no en tu propio ecommerce.',
          pts: { traccion: 6, upside: 12 } },
        { id: 'redes',         label: 'Redes sociales (DMs, links de IG)',
          description: 'Vendes por Instagram, Facebook, WhatsApp.',
          pts: { traccion: 4, upside: 10 } },
        { id: 'ecommerce-propio', label: 'Mi propio ecommerce',
          pts: { traccion: 8, upside: 3 } },
        { id: 'no-digital',    label: 'Aún no vendo digital',
          pts: { upside: 15 } },
      ],
    },

    {
      id: 'tu_online', label: '¿Cómo manejas tu venta online?',
      help: 'Tu estado actual define qué tan grande es la oportunidad.',
      opciones: [
        { id: 'no-online',     label: 'No tengo venta online',
          description: 'Greenfield · empezamos desde cero.',
          pts: { upside: 18 } },
        { id: 'solo-marketplaces', label: 'Solo en marketplaces (Amazon, ML)',
          description: 'Sweet spot · te sacamos a tu propio ecommerce.',
          pts: { upside: 20, traccion: 3 } },
        { id: 'shopify-simple',label: 'Shopify / WordPress estándar',
          description: 'Tienes tienda pero no convierte como debería.',
          pts: { upside: 14, traccion: 5 } },
        { id: 'custom-inhouse',label: 'Tienda custom con equipo propio',
          description: 'Tienes equipo · no nos necesitas tanto.',
          pts: { madurez: 6, upside: -10, economia: -5 } },
      ],
    },

    {
      id: 'digital', label: '¿Qué % de tus ventas ya es digital?',
      opciones: [
        { id: '0-10',   label: '0% a 10% (casi todo offline)',
          pts: { upside: 14 } },
        { id: '10-30',  label: '10% a 30%',
          pts: { upside: 12, traccion: 5 } },
        { id: '30-60',  label: '30% a 60%',
          pts: { traccion: 8, upside: 5 } },
        { id: '60-100', label: 'Más del 60% (ya muy digital)',
          pts: { traccion: 6, upside: 1 } },
      ],
    },

    {
      id: 'equipo', label: '¿Quién maneja tu marca hoy?',
      opciones: [
        { id: 'fundador', label: 'Solo yo / fundador',
          description: 'Operas tú · necesitas brazo ejecutor.',
          pts: { madurez: 2, upside: 6 } },
        { id: 'no-tech',  label: 'Equipo pero no es técnico',
          description: 'Equipo de operación y ventas. Tech faltante.',
          pts: { madurez: 4, upside: 12 } },
        { id: 'tech',     label: 'Equipo técnico in-house',
          description: 'Ya tienes tech propio · no es match obvio.',
          pts: { madurez: 8, upside: -10, economia: -5 } },
        { id: 'mix',      label: 'Equipo mixto (operación + un poco de tech)',
          pts: { madurez: 6, upside: 6 } },
      ],
    },

    {
      id: 'comision', label: '¿Qué % de comisión sobre ventas digitales estás dispuesto a ofrecer?',
      help: 'iBisne opera por comisión sobre las ventas que generamos con la nueva tech.',
      opciones: [
        { id: '5',         label: '5%',                                   pts: { economia: 2 },  rate: 0.05 },
        { id: '10',        label: '10%',                                  pts: { economia: 8 },  rate: 0.10 },
        { id: '15',        label: '15%',                                  pts: { economia: 12 }, rate: 0.15 },
        { id: '20+',       label: '20% o más',                            pts: { economia: 15 }, rate: 0.20 },
        { id: 'negociable',label: 'Negociable según el aporte',           pts: { economia: 10 }, rate: 0.12 },
      ],
    },

    {
      id: 'reto', label: '¿Cuál es tu mayor problema para vender más?',
      opciones: [
        { id: 'sin-ecommerce',     label: 'No tengo ecommerce propio',
          description: 'iBisne lo construye y opera.',
          pts: { upside: 15 } },
        { id: 'salir-marketplaces',label: 'Quiero salir de marketplaces',
          description: 'Independizarte de Amazon / ML.',
          pts: { upside: 18 } },
        { id: 'no-convierte',      label: 'Mi ecommerce no convierte',
          description: 'Redesign + CRO + performance.',
          pts: { upside: 14 } },
        { id: 'no-perf-marketing', label: 'No tengo equipo de performance marketing',
          description: 'iBisne pone media buyers in-house.',
          pts: { upside: 14 } },
        { id: 'internacionalizar', label: 'Quiero internacionalizar mi marca',
          pts: { upside: 12 } },
        { id: 'otro',              label: 'Otro / mixto',
          pts: { upside: 5 } },
      ],
    },

    {
      id: 'datos', label: 'Datos de contacto', form: true,
      campos: [
        { id: 'nombre',   label: 'Nombre completo',  required: true },
        { id: 'empresa',  label: 'Marca / empresa',  required: true },
        { id: 'email',    label: 'Email',            required: true, type: 'email' },
        { id: 'whatsapp', label: 'WhatsApp',         required: true },
        { id: 'sitio',    label: 'Sitio o IG actual (opcional)', required: false },
      ],
    },
  ],

  // ─── Cálculo del fit-score ─────────────────────────────────────────
  calcular(answers, compromisoMxn){
    const dim = { traccion: 0, madurez: 0, upside: 0, economia: 0 };
    const facturacion = (answers.facturacion?.billing || 0);
    const rate        = (answers.comision?.rate || 0);

    // Sumar puntos por respuesta
    for (const k in answers) {
      const a = answers[k];
      if (Array.isArray(a)) {
        for (const item of a) {
          if (item?.pts) for (const d in item.pts) dim[d] = (dim[d] || 0) + item.pts[d];
        }
      } else if (a?.pts) {
        for (const d in a.pts) dim[d] = (dim[d] || 0) + a.pts[d];
      }
    }

    // Regla dura: economía del deal
    if (compromisoMxn > 0 && facturacion > 0 && rate > 0) {
      const ingreso24m = facturacion * rate * 2; // proyección 24 meses
      const ratio = ingreso24m / compromisoMxn;
      if (ratio < 1.0)       dim.economia -= 25;
      else if (ratio >= 1.5) dim.economia += 10;
    }

    // Normalizar
    const dims = ['traccion','madurez','upside','economia'];
    const norm = {};
    for (const d of dims) norm[d] = Math.max(0, Math.min(25, dim[d]));
    const score = Math.round((norm.traccion + norm.madurez + norm.upside + norm.economia));

    return {
      score: Math.max(0, Math.min(100, score)),
      dimensiones: norm,
      veredicto: this.getVeredicto(score),
    };
  },

  getVeredicto(score){
    if (score >= 81) return {
      id: 'optimo', label: 'MATCH ÓPTIMO',
      copy: 'Tu producto + nuestro motor de ecommerce = match perfecto. Operamos por comisión sobre ventas, sin contrato lock-in. Un hunter te responde personalmente en menos de 24 horas.',
      cta: 'Agendar discovery ahora',
      alert: true,
      message: 'Tu hunter ya está enterado.',
    };
    if (score >= 61) return {
      id: 'viable', label: 'PARTNER VIABLE',
      copy: 'Cumples los criterios para entrar al portafolio iBisne. Coordinemos un discovery de 30 minutos para definir alcance y términos de comisión.',
      cta: 'Agendar discovery',
      alert: false,
    };
    if (score >= 41) return {
      id: 'conversacion', label: 'CONVERSACIÓN NECESARIA',
      copy: 'Tu modelo no encaja 1:1 con nuestro motor de ecommerce alto impacto. Vale la pena explorar si hay otra forma de operar juntos.',
      cta: 'Dejar mis datos para que un hunter explore',
      alert: false,
    };
    return {
      id: 'no-momento', label: 'NO ES MOMENTO',
      copy: 'iBisne se asocia con marcas que ya facturan y tienen producto validado. Vuelve cuando tengas tracción comercial. Mientras, podemos ayudarte como cliente — cotizamos servicios puntuales sin comisión.',
      cta: 'Cotizar un servicio sin comisión',
      ctaUrl: 'quiz.html#/servicio',
      alert: false,
    };
  },
};

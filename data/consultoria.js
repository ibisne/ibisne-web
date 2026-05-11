// data/consultoria.js — Módulo CONSULTORÍA
// Empresas/equipos que quieren asesoría experta sin que iBisne construya.
// Genera PDF cotización con folio prefix CON-XXX.

window.IBISNE_CONSULTORIA = {

  // ─── Modalidades (Q1) — categoría y base ────────────────────────────
  modalidades: [
    {
      id: 'uno-a-uno', label: '1-a-1 ejecutivo',
      category: 'Sesión individual',
      description: 'Sesiones de 1.5 hrs con founder/CTO de iBisne. Decisiones estratégicas tech.',
      base: 8000, unit: 'sesión',
      icon: 'service',
    },
    {
      id: 'paquete-equipo', label: 'Paquete equipo',
      category: 'Grupal',
      description: '4 sesiones grupales para tu equipo (8-12 personas). Alineación interna acelerada.',
      base: 35000, unit: 'paquete',
      icon: 'marketplace',
    },
    {
      id: 'capacitacion', label: 'Capacitación mensual',
      category: 'Programa formativo',
      description: 'Programa de 4 semanas, 1 sesión por semana. Plan curricular adaptado.',
      base: 45000, unit: 'mes',
      icon: 'educacion',
    },
    {
      id: 'automatizacion', label: 'Automatización asistida',
      category: 'Implementación',
      description: 'iBisne va a tu negocio, mapea procesos, propone automatizaciones y acompaña implementación.',
      base: 80000, unit: 'proyecto',
      icon: 'saas',
    },
    {
      id: 'workshop', label: 'Workshop especializado',
      category: 'Día intensivo',
      description: 'Día completo (8 hrs) sobre un tema específico. Output: roadmap accionable.',
      base: 35000, unit: 'día',
      icon: 'partnership',
    },
  ],

  // ─── Preguntas universales tras modalidad ───────────────────────────
  preguntas: [

    {
      id: 'tamano', label: '¿Tamaño del equipo / asistentes?',
      opciones: [
        { id: '1-5',   label: '1 a 5 personas',   add: 0 },
        { id: '5-20',  label: '5 a 20 personas',  add: 5000 },
        { id: '20+',   label: '20+ personas',     add: 12000 },
      ],
    },

    {
      id: 'tema', label: '¿Tema principal?',
      opciones: [
        { id: 'producto',   label: 'Desarrollo de producto / tech stack' },
        { id: 'ia',         label: 'IA aplicada al negocio' },
        { id: 'ecommerce',  label: 'E-commerce / digital ventures' },
        { id: 'marketing',  label: 'Marketing performance / growth' },
        { id: 'data',       label: 'Data / analytics' },
        { id: 'blockchain', label: 'Blockchain / Web3' },
        { id: 'general',    label: 'General / multi-tema' },
      ],
    },

    {
      id: 'modalidad', label: '¿Modalidad de entrega?',
      help: 'Sesiones fuera de Jalisco suman viáticos para 3 personas del equipo iBisne.',
      opciones: [
        { id: 'virtual',          label: 'Virtual (Zoom / Meet)',           add: 0,     description: 'Cero viáticos, agendamiento flexible' },
        { id: 'presencial-gdl',   label: 'Presencial en Jalisco',           add: 0,     description: 'En oficinas iBisne o las tuyas, sin viáticos' },
        { id: 'presencial-fuera', label: 'Presencial fuera de Jalisco',     add: 15000, description: 'Suma viáticos: 3 personas iBisne · vuelos + hotel + comidas' },
        { id: 'hibrido',          label: 'Híbrido',                         add: 8000,  description: 'Combinación virtual + 1 presencial' },
      ],
    },

    {
      id: 'duracion', label: '¿Duración del programa?',
      opciones: [
        { id: '1ses',   label: '1 sesión',         mul: 1.0 },
        { id: '4sem',   label: '4 semanas (4 sesiones)',  mul: 3.6, metaSuffix: '×3.6 (−10%)' },
        { id: '3mes',   label: '3 meses (12 sesiones)',   mul: 9.0, metaSuffix: '×9.0 (−25%)' },
        { id: '6mas',   label: '6+ meses (acompañamiento)', mul: 16.0, metaSuffix: '×16 (custom)' },
      ],
    },

    {
      id: 'datos', label: '¿A nombre de quién va la cotización?',
      help: 'Tus datos llegan directo al equipo de iBisne. Te respondemos en menos de 24 horas.',
      form: true,
      campos: [
        { id: 'nombre',    label: 'Nombre completo', required: true },
        { id: 'empresa',   label: 'Empresa',         required: true },
        { id: 'email',     label: 'Email',           required: true, type: 'email' },
        { id: 'whatsapp',  label: 'WhatsApp',        required: true },
        { id: 'ubicacion', label: 'Ciudad / Estado', required: true },
      ],
    },
  ],

  // ─── Cálculo del total ──────────────────────────────────────────────
  calcular(answers){
    const mod = answers.modalidad_tipo; // modalidad elegida (Q1)
    if (!mod) return { total: 0, lineItems: [], subtotal: 0, mul: 1, base: 0 };

    let subtotal = mod.base || 0;
    const lineItems = [];

    // Tamaño del equipo (add)
    if (answers.tamano?.add) {
      subtotal += answers.tamano.add;
      lineItems.push({ label: 'Equipo ' + answers.tamano.label, add: answers.tamano.add });
    }

    // Modalidad (add por viáticos)
    if (answers.modalidad?.add) {
      subtotal += answers.modalidad.add;
      lineItems.push({ label: answers.modalidad.label, add: answers.modalidad.add });
    }

    // Multiplicador de duración
    let mul = 1.0;
    if (answers.duracion?.mul) {
      mul = answers.duracion.mul;
    }
    const totalAntesMul = subtotal;
    const total = subtotal * mul;

    if (mul !== 1.0 && answers.duracion) {
      const ajuste = total - totalAntesMul;
      lineItems.push({ label: answers.duracion.label + (answers.duracion.metaSuffix ? ' (' + answers.duracion.metaSuffix + ')' : ''), add: ajuste });
    }

    return {
      total: Math.round(total),
      subtotal: totalAntesMul,
      lineItems,
      mul,
      base: mod.base,
      modalidad: mod,
    };
  },
};

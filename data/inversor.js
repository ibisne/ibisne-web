// data/inversor.js — Módulo INVERSIONISTA · v4.0 marketplace
// Path 2 de las 3 puertas: persona que quiere PONER capital en proyectos
// de emprendedores LATAM curados por iBisne.
//
// Modelo: marketplace de leads + placement fee · iBisne NO administra capital.
// La transacción real (inversor → emprendedor) ocurre off-platform.
// iBisne cobra placement fee 15-25% del monto matched al cerrar el deal.

window.IBISNE_INVERSOR = {

  preguntas: [

    {
      id: 'intencion', label: '¿Qué tipo de oportunidades buscas?',
      help: 'Esto nos ayuda a filtrar los leads que te mostramos.',
      opciones: [
        { id: 'descubrir',   label: 'Descubrir proyectos LATAM nuevos',  description: 'Quiero ver oportunidades curadas mes a mes' },
        { id: 'cofinanciar', label: 'Co-financiar proyectos específicos', description: 'Quiero respaldar proyectos concretos de iBisne' },
        { id: 'sector',      label: 'Inversiones en un sector específico', description: 'Tengo tesis clara · solo me muestren ese sector' },
        { id: 'ambos',       label: 'Descubrir + co-financiar',            description: 'Abierto a explorar y respaldar' },
      ],
    },

    {
      id: 'tipo', label: '¿Qué tipo de inversor eres?',
      opciones: [
        { id: 'angel',       label: 'Persona física / ángel' },
        { id: 'family',      label: 'Family office' },
        { id: 'vc',          label: 'VC / fondo institucional' },
        { id: 'corporativo', label: 'Corporativo / venture corporativo' },
      ],
    },

    {
      id: 'ticket', label: '¿Cuál es tu ticket disponible?',
      help: 'Cifra orientativa. Define en qué tipo de oportunidades te conectamos.',
      opciones: [
        { id: '<1M',    label: '$250k – $1M MXN' },
        { id: '1-5M',   label: '$1M – $5M MXN' },
        { id: '5-20M',  label: '$5M – $20M MXN' },
        { id: '20M+',   label: '$20M MXN o más' },
      ],
    },

    {
      id: 'horizonte', label: '¿Cuál es tu horizonte de inversión?',
      opciones: [
        { id: '1-3',  label: '1 a 3 años', description: 'Corto plazo · liquidez antes' },
        { id: '3-7',  label: '3 a 7 años', description: 'Estándar venture · ideal para iBisne' },
        { id: '7+',   label: '7+ años',    description: 'Largo plazo paciente · holdings' },
      ],
    },

    {
      id: 'verticales', label: '¿Qué verticales te interesan?', multi: true,
      help: 'Selecciona todas las que apliquen.',
      opciones: [
        { id: 'commerce',    label: 'Commerce / DTC' },
        { id: 'saas',        label: 'SaaS B2B' },
        { id: 'marketplace', label: 'Marketplace / plataformas' },
        { id: 'ia',          label: 'IA / deep tech' },
        { id: 'cualquiera',  label: 'Abierto a cualquier vertical' },
      ],
    },

    {
      id: 'experiencia', label: '¿Has invertido en LATAM tech antes?',
      opciones: [
        { id: 'si-tech',   label: 'Sí, ya invertí en LATAM tech' },
        { id: 'si-otros',  label: 'Sí en LATAM, no en tech específico' },
        { id: 'primera',   label: 'Es mi primera vez en LATAM' },
      ],
    },

    {
      id: 'datos', label: '¿Cómo te contactamos?',
      help: 'Tus datos llegan directo al equipo de captación de iBisne.',
      form: true,
      campos: [
        { id: 'nombre',   label: 'Nombre completo',         required: true },
        { id: 'empresa',  label: 'Empresa / vehículo',      required: true },
        { id: 'email',    label: 'Email',                   required: true, type: 'email' },
        { id: 'whatsapp', label: 'WhatsApp',                required: true },
        { id: 'linkedin', label: 'LinkedIn (opcional)',     required: false },
      ],
    },
  ],

  // ─── Prioridad interna (no se muestra al inversor) ──────────────────
  prioridad(answers){
    let score = 0;
    const ticket = { '<1M': 5, '1-5M': 20, '5-20M': 30, '20M+': 25 };
    score += ticket[answers.ticket?.id] || 0;

    const tipo = { angel: 8, family: 18, vc: 25, corporativo: 22 };
    score += tipo[answers.tipo?.id] || 0;

    const exp = { 'si-tech': 15, 'si-otros': 8, 'primera': 3 };
    score += exp[answers.experiencia?.id] || 0;

    const horizonte = { '1-3': 5, '3-7': 15, '7+': 18 };
    score += horizonte[answers.horizonte?.id] || 0;

    const total = Math.min(100, score);
    if (total >= 70) return { id: 'P0', label: 'VIP · founder responde en <12h' };
    if (total >= 50) return { id: 'P1', label: 'HIGH · respuesta en <24h' };
    if (total >= 30) return { id: 'P2', label: 'MEDIUM · captación responde en <48h' };
    return                  { id: 'P3', label: 'LOW · seguimiento por email' };
  },
};

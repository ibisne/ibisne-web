// data/inference.js — Reglas de inferencia para Rama A (Socio)
// Foco: marcas con producto físico → ecommerce alto impacto + performance.

window.IBISNE_INFERENCE = {

  // ─── Reglas ordenadas por prioridad ────────────────────────────────
  rules: [
    // ─── BASE — siempre ecommerce alto impacto si vende producto físico
    {
      label: 'Ecommerce de alto impacto (Shopify Plus / Headless)',
      cost: 80000,
      when: a => ['dtc','reseller'].includes(a.que_vendes?.id) && a.tu_online?.id !== 'custom-inhouse',
    },

    // ─── Migración desde marketplaces (sweet spot iBisne)
    {
      label: 'Migración desde marketplaces a ecommerce propio',
      cost: 60000,
      when: a => a.tu_online?.id === 'solo-marketplaces' || a.reto?.id === 'salir-marketplaces',
    },

    // ─── Lanzamiento desde cero (greenfield)
    {
      label: 'Lanzamiento ecommerce desde cero · branding + setup',
      cost: 50000,
      when: a => a.tu_online?.id === 'no-online' || a.reto?.id === 'sin-ecommerce',
    },

    // ─── Performance marketing in-house (motor de ventas)
    {
      label: 'Performance marketing in-house (24 meses)',
      cost: 240000, // ~10k/mes × 24m
      when: a => {
        const facturas = ['10-50M','50-200M','200M+'].includes(a.facturacion?.id);
        const lo_pide  = a.reto?.id === 'no-perf-marketing';
        return facturas || lo_pide;
      },
    },

    // ─── Redesign + CRO si ecommerce existente no convierte
    {
      label: 'Redesign + CRO + optimización de conversión',
      cost: 70000,
      when: a => a.reto?.id === 'no-convierte' || a.tu_online?.id === 'shopify-simple',
    },

    // ─── App móvil para marcas grandes
    {
      label: 'App móvil DTC iOS / Android (fase 2)',
      cost: 120000,
      when: a => ['10-50M','50-200M','200M+'].includes(a.facturacion?.id) && ['dtc','reseller'].includes(a.que_vendes?.id),
    },

    // ─── CMS + dashboards para marcas grandes
    {
      label: 'CMS + dashboards de operación',
      cost: 80000,
      when: a => ['50-200M','200M+'].includes(a.facturacion?.id),
    },

    // ─── Internacionalización
    {
      label: 'Internacionalización multi-moneda + multi-idioma',
      cost: 60000,
      when: a => a.reto?.id === 'internacionalizar',
    },

    // ─── Headless commerce para alta escala
    {
      label: 'Migración a headless commerce (alta performance)',
      cost: 100000,
      when: a => ['50-200M','200M+'].includes(a.facturacion?.id) && a.tu_online?.id === 'shopify-simple',
    },

    // ─── Plataforma SaaS custom (caso no-target)
    {
      label: 'Plataforma SaaS / Marketplace custom',
      cost: 200000,
      when: a => a.que_vendes?.id === 'saas',
    },

    // ─── Servicios profesionales (caso no-target)
    {
      label: 'Plataforma de captación + agendamiento',
      cost: 45000,
      when: a => a.que_vendes?.id === 'servicio',
    },
  ],

  // ─── Calcular solución y compromiso ────────────────────────────────
  calcular(answers){
    const items = [];
    const seen  = new Set();
    let totalMxn = 0;

    for (const r of this.rules) {
      try {
        if (r.when(answers)) {
          if (seen.has(r.label)) continue;
          seen.add(r.label);
          items.push({ label: r.label, cost: r.cost });
          totalMxn += r.cost;
        }
      } catch (e) { /* respuesta incompleta, skip */ }
    }

    if (items.length === 0 && answers.que_vendes) {
      items.push({ label: 'Discovery + propuesta a medida', cost: 50000 });
      totalMxn = 50000;
    }

    return {
      items,
      totalMxn,
      tier: this.getTier(totalMxn),
    };
  },

  getTier(totalMxn){
    if (totalMxn <= 0)        return { id: 'empty', label: '—',          n: 0, of: 3 };
    if (totalMxn < 200000)    return { id: 'tier1', label: 'TIER 1 / 3',  n: 1, of: 3, copy: 'Setup tech puntual' };
    if (totalMxn < 500000)    return { id: 'tier2', label: 'TIER 2 / 3',  n: 2, of: 3, copy: 'Ecommerce + performance' };
    return                          { id: 'tier3', label: 'TIER 3 / 3',  n: 3, of: 3, copy: 'Ejecución integral · mesa anual' };
  },

  getTags(answers, score){
    const tags = [];
    if (answers.que_vendes)  tags.push(`vende-${answers.que_vendes.id}`);
    if (answers.facturacion) tags.push(`facturacion-${answers.facturacion.id}`);
    if (answers.tu_online)   tags.push(`tech-${answers.tu_online.id}`);
    if (answers.comision)    tags.push(`comision-${answers.comision.id}`);
    if (answers.reto)        tags.push(`reto-${answers.reto.id}`);
    if (score >= 81)         tags.push('p0-top');
    else if (score >= 61)    tags.push('p1-viable');
    else if (score >= 41)    tags.push('p2-conversacion');
    else                     tags.push('p3-no-momento');
    return tags;
  },
};

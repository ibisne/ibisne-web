/* ===================================================================
   assets/quiz/ui.js — iBisne v6.0.0 · Cotizador modular tipo carrito
   ===================================================================
   Modelo nuevo: el cliente arma su carrito sumando servicios del
   catálogo modular. Categorías intercambiables. Layout permanente
   (wizard izquierda · carrito sticky derecha · sin bottom-bar).

   Flow (v7.0.2 · sin step de contexto · arranca en catálogo):
     #/catalog    → catálogo de servicios (cliente elige)
     (subflow)    → preguntas del servicio, una por pantalla
     (confirm)    → "✓ configurado · ¿otro o cotización?"
     #/datos      → datos del cliente (gate de captura)
     #/loading    → overlay 900ms (handover suave)
     #/resultado  → cotización final (pago + FAQ + hunter)

   Preservado de versiones anteriores:
     · Heurísticas (v5.2.0) · clasifica al lead para CRM
     · Loading overlay (v5.3.0) · crossfade real al resultado
     · formatMxn defendido (v5.3.3) · nunca "$ 0" → em-dash
     · recommendGateways (v5.3.4) · usado en sub-flow de pasarelas
     · MXN forzado en LATAM (v5.3.1)
   =================================================================== */

(function(){
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // STATE · v9.0 · pricing-v9 adaptativo
  //   Cambios vs v6/v8:
  //   - STORAGE_KEY bumpeado a v7 (nueva shape del cart · no carga el viejo)
  //   - cart.modificadores ELIMINADO (plazo/modo viven como preguntas shared)
  //   - servicios[] agrega tipoId y addOnIds (capturan elección de tipo + extras)
  //   - subflow agrega tipoId, qFlow (cached array de preguntas adaptativas),
  //     addOnIds (multi-select de add-ons), step ('tipo' | 'q' | 'addons' | 'confirm')
  // ═══════════════════════════════════════════════════════════════════
  const STORAGE_KEY = 'ibisne.cart.v7';

  const State = {
    // Datos del cliente (step datos)
    cliente: { nombre: '', email: '', whatsapp: '', empresa: '' },

    // Carrito (acumulado del catálogo)
    cart: {
      servicios: [],              // [{ id, label, base, tipoId, addOnIds, config, calculatedPrice }]
      paymentPlan: 'contado',     // v10.1 · 'contado' | 'msi-3' | 'msi-6' | 'msi-9' | 'msi-12'
      discountCode: '',           // v10.1 · código de descuento ingresado (uppercase al validar)
    },

    // UI state · navegación jerárquica del catálogo
    catalogPath: { mega: null, sub: null, service: null },
    subflow: null,                // { servicioId, tipoId, qFlow, addOnIds, config, isEdit, qIndex, step }
    folio: null,

    // Heurísticas (v5.2.0)
    heuristics: {
      sessionStart: Date.now(),
      timings: [],
      navBacks: 0,
      editClicks: 0,
      currentStepShown: null,
      currentStepKey: null,
      currentStepChanges: 0,
    },
  };

  function persistCart(){
    try {
      const slim = {
        cliente: State.cliente,
        cart: State.cart,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch(_){}
  }
  function loadCart(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.cliente)  State.cliente = Object.assign(State.cliente, saved.cliente);
      if (saved.cart)     State.cart = Object.assign(State.cart, saved.cart);
    } catch(_){}
  }

  // v9 · helper centralizado para acceder al pricing (v8 fallback eliminado en Fase 4)
  function getPricing(){ return window.IBISNE_PRICING_V9; }

  // Helper: dado un service-id, encuentra el servicio en pricing.servicios
  function findServicio(servicioId){
    const PRICING = getPricing();
    if (!PRICING || !PRICING.servicios) return null;
    return PRICING.servicios[servicioId] || null;
  }
  function clearCart(){
    State.cart = { servicios: [], paymentPlan: 'contado', discountCode: '' };
    persistCart();
  }

  // v10.1 · Aplica descuento por código (demo IBISNE40) + plan de pago.
  // Cálculo:
  //   1. Descuento por código (-40% si código = IBISNE40)
  //   2. Plan: contado -20% adicional · MSI sin intereses (divide en N)
  // Eduardo: link real de pago a meses se manda por WhatsApp al hunter post-cotización.
  function applyPaymentPlan(totalConIva){
    const plan = (State.cart && State.cart.paymentPlan) || 'contado';
    const code = (State.cart && State.cart.discountCode || '').trim().toUpperCase();

    let afterCode = totalConIva;
    let codeApplied = false;
    if (code === 'IBISNE40') {
      afterCode = totalConIva * 0.60;
      codeApplied = true;
    }

    let finalTotal = afterCode;
    let monthsCount = 0;
    let planLabel = '';
    let planDiscount = 0;
    if (plan === 'contado') {
      finalTotal = afterCode * 0.80;
      planLabel = 'Una sola exhibición';
      planDiscount = 0.20;
    } else if (plan === 'msi-3')  { monthsCount = 3;  planLabel = '3 meses sin intereses'; }
    else if (plan === 'msi-6')  { monthsCount = 6;  planLabel = '6 meses sin intereses'; }
    else if (plan === 'msi-9')  { monthsCount = 9;  planLabel = '9 meses sin intereses'; }
    else if (plan === 'msi-12') { monthsCount = 12; planLabel = '12 meses sin intereses'; }

    const monthlyAmount = monthsCount > 0 ? finalTotal / monthsCount : 0;
    return { finalTotal, monthlyAmount, monthsCount, planLabel, planDiscount, codeApplied, plan, code };
  }

  // ═══════════════════════════════════════════════════════════════════
  // HEURÍSTICAS (preservado de v5.2.0)
  // ═══════════════════════════════════════════════════════════════════
  function trackStepShown(key){
    if (!State.heuristics) return;
    if (State.heuristics.currentStepShown && State.heuristics.currentStepKey) {
      flushCurrentStep('aborted');
    }
    State.heuristics.currentStepKey = key;
    State.heuristics.currentStepShown = Date.now();
    State.heuristics.currentStepChanges = 0;
  }
  function trackStepChange(){
    if (State.heuristics) State.heuristics.currentStepChanges++;
  }
  function flushCurrentStep(reason){
    if (!State.heuristics || !State.heuristics.currentStepShown) return;
    const h = State.heuristics;
    const now = Date.now();
    h.timings.push({
      stepKey: h.currentStepKey,
      shownAt: h.currentStepShown,
      answeredAt: now,
      dwellMs: now - h.currentStepShown,
      changes: h.currentStepChanges,
      reason: reason || 'answered',
    });
    h.currentStepShown = null;
    h.currentStepKey = null;
    h.currentStepChanges = 0;
  }
  function trackNavBack(){ if (State.heuristics) State.heuristics.navBacks++; }
  function trackEditClick(){ if (State.heuristics) State.heuristics.editClicks++; }

  function computeLeadScore(){
    const h = State.heuristics || {};
    const timings = h.timings || [];
    const totalMs = Date.now() - (h.sessionStart || Date.now());
    const avgDwellMs = timings.length ? timings.reduce((s, t) => s + t.dwellMs, 0) / timings.length : 0;
    const totalChanges = timings.reduce((s, t) => s + (t.changes || 0), 0);
    const fastSteps = timings.filter(t => t.dwellMs < 2000).length;
    const slowSteps = timings.filter(t => t.dwellMs > 30000).length;
    const decisive  = totalChanges <= timings.length * 0.3;
    const explorer  = totalChanges > timings.length * 0.8;
    const rushed    = avgDwellMs < 4000 && fastSteps > 2;
    const dudoso    = slowSteps >= 3 || h.navBacks >= 3;
    let archetype = 'normal';
    if (rushed && decisive)            archetype = 'simple-rapido';
    else if (explorer && slowSteps >= 2) archetype = 'detallista';
    else if (dudoso)                   archetype = 'dudoso';
    else if (decisive)                 archetype = 'decidido';
    return {
      sessionMs: totalMs,
      stepsCompleted: timings.length,
      avgDwellMs: Math.round(avgDwellMs),
      totalChanges,
      navBacks: h.navBacks || 0,
      editClicks: h.editClicks || 0,
      fastSteps, slowSteps, archetype, timings,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // DOM + UTILS
  // ═══════════════════════════════════════════════════════════════════
  const $  = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  function formatMxn(n){
    const num = Number(n);
    if (!num || num === 0 || isNaN(num)) return '—';
    if (window.IBISNE_PREFS) return window.IBISNE_PREFS.format(num);
    // v6.1.0 · SIEMPRE 2 decimales (.00) globalmente
    return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function L(esText){
    if (!esText) return esText;
    if (!window.IBISNE_PREFS || window.IBISNE_PREFS.lang() !== 'en') return esText;
    var dict = window.IBISNE_I18N_DATA || {};
    return dict[esText] || esText;
  }
  function iconHtml(id, variant){
    if (!window.IBISNE_ICONS || !id) return '';
    const v = variant || 'line';
    return window.IBISNE_ICONS.get(id, v) || '';
  }
  // ═══════════════════════════════════════════════════════════════════
  // FOLIO + LEAD (preservado)
  // ═══════════════════════════════════════════════════════════════════
  function nextFolio(){
    try {
      var k = 'ibisne.folio';
      var n = parseInt(localStorage.getItem(k) || '1000', 10) + 1;
      localStorage.setItem(k, String(n));
      return n;
    } catch(_) { return Math.floor(Date.now() / 1000); }
  }

  // Persiste un lead a localStorage (CRM/Slack lo levantan después · MVP)
  // v7.0.0 · Recolecta la señal comercial de la pregunta "etapa" de cada
  // servicio en el carrito (idea=temprano · mvp/desarrollo/rehacer=caliente
  // · updates=tibio). Alimenta el lead scoring para priorizar el inbox.
  function collectEtapaSignals(){
    const out = [];
    try {
      for (const s of (State.cart && State.cart.servicios) || []) {
        const cfg = s.config || {};
        const et = cfg.etapa;
        if (et && et.signal) out.push({ servicio: s.id, etapa: et.id, signal: et.signal });
      }
    } catch(_){}
    return out;
  }

  function persistLead(payload){
    try {
      payload = payload || {};
      payload.heuristics = computeLeadScore();
      payload.etapaSignals = collectEtapaSignals();
      payload.timestamp = new Date().toISOString();
      const arr = JSON.parse(localStorage.getItem('ibisne.leads') || '[]');
      arr.push(payload);
      localStorage.setItem('ibisne.leads', JSON.stringify(arr.slice(-50))); // últimos 50
      localStorage.setItem('ibisne.lead.last', JSON.stringify(payload));    // último siempre accesible
    } catch(_){}
  }

  // ═══════════════════════════════════════════════════════════════════
  // RECOMMEND GATEWAYS (v5.3.4 · usado en sub-flow de pasarelas)
  // ═══════════════════════════════════════════════════════════════════
  function recommendGateways(selectedMethodIds, gatewayOpciones){
    if (!selectedMethodIds || selectedMethodIds.length === 0) return [];
    if (!gatewayOpciones || gatewayOpciones.length === 0) return [];
    const uncovered = new Set(selectedMethodIds);
    const recommended = [];
    while (uncovered.size > 0) {
      let bestGateway = null;
      let bestCoverage = 0;
      for (const gw of gatewayOpciones) {
        if (recommended.indexOf(gw.id) >= 0) continue;
        const covers = (gw.covers || []).filter(m => uncovered.has(m)).length;
        if (covers > bestCoverage) { bestGateway = gw; bestCoverage = covers; }
      }
      if (!bestGateway || bestCoverage === 0) break;
      recommended.push(bestGateway.id);
      (bestGateway.covers || []).forEach(m => uncovered.delete(m));
    }
    return recommended;
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTE CART · v9.0
  //   Sin multiplicadores plazo/modo globales (esos ahora viven como
  //   preguntas shared dentro del subflow y ya están en `calculatedPrice`
  //   de cada servicio). Solo suma servicios → total → IVA.
  //   Retorna: { subtotal, total, totalConIva, lineItems[],
  //              flags, team, tier, speed, speedZone, speedText, stack, tiempo }
  //   lineItem ahora incluye:
  //     - tipoId · el tipo elegido del servicio (string)
  //     - tipoLabel · label legible del tipo
  //     - addOns · array [{id, label, price}] de extras elegidos
  // ═══════════════════════════════════════════════════════════════════
  function computeCart(){
    const PRICING = getPricing();
    const cart = State.cart;
    let subtotal = 0;
    const flags = new Set();
    const lineItems = [];

    // v11.2 · Si hay un servicio "en configuración" (State.subflow activo)
    // que NO esté siendo editado (porque al editar ya existe en cart.servicios),
    // se suma su precio actual al subtotal · cart total refleja la cifra real
    // desde el primer click en cualquier servicio.
    const buildingId = (State.subflow && State.subflow.step !== 'confirm' && !State.subflow.isEdit)
      ? State.subflow.servicioId
      : null;
    if (buildingId) {
      const bServDef = (PRICING.servicios && PRICING.servicios[buildingId]) || null;
      if (bServDef) {
        const bServ = Object.assign({ id: buildingId }, bServDef);
        const sf = State.subflow;
        const buildingPrice = calcSubflowPrice(bServ, sf.config || {}, sf.tipoId, sf.addOnIds);
        subtotal += buildingPrice;
        lineItems.push({
          servicioId: buildingId,
          label: bServ.label,
          price: buildingPrice,
          config: sf.config || {},
          icon: bServ.icon,
          tipoId: sf.tipoId || null,
          tipoLabel: '',
          addOns: [],
          isBuilding: true,
        });
      }
    }

    for (const s of cart.servicios) {
      const price = s.calculatedPrice || s.base || 0;
      subtotal += price;

      // Hidratar add-ons desde IDs persistidos
      const addOns = (s.addOnIds || []).map(id => {
        const ao = PRICING.findAddOn ? PRICING.findAddOn(id) : null;
        return ao ? { id: ao.id, label: ao.label, price: ao.price } : null;
      }).filter(Boolean);

      // Hidratar tipoLabel desde el catálogo
      const svcDef = PRICING.servicios[s.id];
      let tipoLabel = '';
      if (svcDef && Array.isArray(svcDef.tipos) && s.tipoId) {
        const t = svcDef.tipos.find(x => x.id === s.tipoId);
        if (t) tipoLabel = t.label;
      }

      lineItems.push({
        servicioId: s.id,
        label: s.label,
        price: price,
        config: s.config || {},
        icon: s.icon,
        tipoId: s.tipoId || null,
        tipoLabel: tipoLabel,
        addOns: addOns,
      });

      // Flags propagadas desde config (algunas opciones añaden flags)
      if (s.config) {
        for (const qid of Object.keys(s.config)) {
          const ans = s.config[qid];
          if (Array.isArray(ans)) {
            ans.forEach(o => { if (o.flag) flags.add(o.flag); });
          } else if (ans && ans.flag) {
            flags.add(ans.flag);
          }
        }
      }
    }

    // v9 · sin plazo/modo multiplicadores · total = subtotal directo
    const total = subtotal;
    const totalConIva = total * 1.16;

    // Tier / equipo / velocidad / stack / tiempo (helpers v9 · sin plazoMul/modoMul)
    const tier      = PRICING.getTier ? PRICING.getTier(total) : { id: 'standard', label: 'STANDARD' };
    const team      = PRICING.getTeam ? PRICING.getTeam(total, flags) : ['KAM'];
    const speed     = PRICING.getSpeed ? PRICING.getSpeed(total, flags) : 50;
    const speedZone = PRICING.getSpeedZone ? PRICING.getSpeedZone(speed) : 'estandar';
    const speedText = PRICING.getSpeedText ? PRICING.getSpeedText(speed) : '';
    const stack     = PRICING.getStack ? PRICING.getStack(cart.servicios) : [];
    const tiempo    = PRICING.getTime ? PRICING.getTime(cart.servicios) : '4-8 sem';

    return {
      subtotal, total, totalConIva,
      lineItems, flags, team, tier, speed, speedZone, speedText, stack, tiempo,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROUTER
  // ═══════════════════════════════════════════════════════════════════
  function parseHash(){
    let h = (location.hash || '#/').slice(2);
    const parts = h.split('/').filter(Boolean);
    return { step: parts[0] || 'catalog' }; // v7.0.2 · arranca en catálogo
  }
  function navigate(hash){ location.hash = hash; }
  window.addEventListener('hashchange', () => {
    render();
    setTimeout(() => { try { window.dispatchEvent(new Event('ibisne:rerender')); } catch(_) {} }, 0);
  });

  // Auto-avance con feedback (preservado del v5.x para transiciones suaves)
  let _advanceTimer = null;
  function scheduleAdvance(targetHash, delayMs){
    if (_advanceTimer) { clearTimeout(_advanceTimer); _advanceTimer = null; }
    flushCurrentStep('answered');
    const FEEDBACK = 200, EXIT = 180;
    _advanceTimer = setTimeout(() => {
      const main = $('#main');
      if (main) main.classList.add('is-leaving');
      setTimeout(() => {
        _advanceTimer = null;
        navigate(targetHash);
      }, EXIT);
    }, (delayMs != null ? delayMs : FEEDBACK));
  }
  function cancelAdvance(){ if (_advanceTimer) { clearTimeout(_advanceTimer); _advanceTimer = null; } }
  window.addEventListener('hashchange', cancelAdvance);

  function setProgress(percent){
    const fill = $('.progress-rail .fill');
    if (fill) fill.style.width = percent + '%';
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER · dispatcher
  // ═══════════════════════════════════════════════════════════════════
  function render(){
    const { step } = parseHash();

    // Quitar is-leaving después del paint del nuevo content (v5.0.2)
    const _main = $('#main');
    if (_main && _main.classList.contains('is-leaving')) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => _main.classList.remove('is-leaving'));
      });
    }

    // v7.0.2 · Eliminado el step de contexto (sector + ya tengo).
    // El quiz arranca directo en el catálogo. Rutas válidas únicamente ·
    // cualquier otra (incl. legacy #/context) → catálogo.
    if (step === 'catalog')    return renderCatalog();
    if (step === 'datos')      return renderDatos();
    if (step === 'loading')    return renderLoading();
    if (step === 'resultado')  return renderResultado();

    navigate('#/catalog');
  }


  // ═══════════════════════════════════════════════════════════════════
  // v8.4.0 · Breadcrumb unificado para todas las pantallas (catalog,
  // services, subflow, datos, resultado). Reemplaza eyebrows ad-hoc
  // y cat-breadcrumb HTML inline.
  // ═══════════════════════════════════════════════════════════════════
  function renderBreadcrumb(crumbs) {
    if (!crumbs || crumbs.length === 0) return '';
    const html = crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      const label = L(c.label);
      if (isLast || !c.href) return `<span>${label}</span>`;
      return `<a href="${c.href}" data-bc="${c.action || ''}">${label}</a>`;
    }).join(' <span class="screen-breadcrumb-sep">›</span> ');
    return `<div class="screen-breadcrumb">${html}</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 · renderCatalog (dispatcher · 3 niveles de navegación)
  // ═══════════════════════════════════════════════════════════════════
  //   Nivel 1: 4 mega-categorías        (catalogPath = {})
  //   Nivel 2: sub-categorías de mega   (catalogPath = {mega})
  //   Nivel 3: servicios de sub o mega  (catalogPath = {mega, sub})
  // ═══════════════════════════════════════════════════════════════════
  function renderCatalog(){
    setProgress(15); // v7.0.2 · catálogo es el inicio (sin step contexto)
    const PRICING = getPricing();
    const path = State.catalogPath || (State.catalogPath = { mega: null, sub: null, service: null });

    // Nivel 4 · sub-flow de un servicio (configuración · vista de cards)
    if (path.service && State.subflow) {
      return renderSubflowView();
    }

    trackStepShown('catalog');

    // v7.0.0 · Sin nivel subCategorias · mega → lista de servicios directo
    if (path.mega) {
      const mega = PRICING.megaCategorias.find(m => m.id === path.mega);
      if (!mega) { State.catalogPath = { mega: null, sub: null, service: null }; return renderCatalog(); }
      return renderServicesList(
        mega.label,
        mega.summary || mega.subtitle || '',   // v7 · fix "undefined"
        mega.icon,
        mega.serviciosIds || [],
        mega,
        null
      );
    }

    // Nivel 1 · grid de mega-categorías
    return renderMegaGrid();
  }

  // ── Nivel 1 · 4 mega-categorías ──────────────────────────────────────
  function renderMegaGrid(){
    const PRICING = getPricing();
    const serviciosInCart = new Set(State.cart.servicios.map(s => s.id));

    const cardsHtml = PRICING.megaCategorias.map(mega => {
      const allIds = collectMegaServiceIds(mega);
      const countInCart = allIds.filter(id => serviciosInCart.has(id)).length;
      const subN = (mega.serviciosIds || []).length;
      const countLabel = subN + ' servicios';
      // v8.3.1 · mega-card respeta lógica de service-card: precio "desde $X" + count.
      const bases = allIds.map(id => (PRICING.servicios[id] && PRICING.servicios[id].base) || 0).filter(b => b > 0);
      const minBase = bases.length ? Math.min(...bases) : 0;

      return `
        <button class="mega-card ${countInCart > 0 ? 'has-items' : ''}" data-mega-open="${mega.id}" type="button">
          <span class="mega-card-info" data-mega-info="${mega.id}" role="button" tabindex="0" aria-label="Más información sobre ${L(mega.label)}">i</span>
          <div class="mega-card-icon">${iconHtml(mega.icon, 'line')}</div>
          <div class="mega-card-body">
            <div class="mega-card-label">${L(mega.label)}</div>
            <div class="mega-card-summary">${L(mega.summary || '')}</div>
          </div>
          <div class="mega-card-foot">
            <div class="mega-card-meta">
              ${minBase > 0 ? `<span class="mega-card-price">${L('desde')} ${formatMxn(minBase)}</span>` : ''}
              <span class="mega-card-count">${countLabel}</span>
            </div>
            ${countInCart > 0 ? `<span class="mega-card-state is-added">${countInCart} ${L('en carrito')}</span>` : '<span class="mega-card-arrow">→</span>'}
          </div>
        </button>
      `;
    }).join('');

    // v6.2.0 · C · Contexto del carrito · si ya hay servicios, el catálogo
    // NUNCA suelta al usuario sin rumbo · banner claro arriba.
    const nCart = State.cart.servicios.length;
    const cartContext = nCart > 0 ? `
      <div class="cat-cart-context">
        <span>Ya llevas <strong>${nCart} servicio${nCart === 1 ? '' : 's'}</strong> en tu cotización.</span>
        <button class="cat-cart-context-cta" id="cat-ctx-quote" type="button">Ver mi cotización →</button>
      </div>` : '';

    $('#wizard').innerHTML = `
      <div class="screen cat-screen">
        <div class="screen-header">
          ${renderBreadcrumb([{ label: 'Inicio' }])}
          <h2 class="cat-title screen-title">${nCart > 0 ? '¿Agregar otro servicio?' : '¿Qué necesitas?'}</h2>
          <p class="cat-help screen-subtitle">
            ${nCart > 0 ? 'Suma otro servicio o ve directo a tu cotización.' : 'Elige por dónde empezar · armamos tu cotización.'}
          </p>
        </div>
        <div class="screen-body">
          ${cartContext}
          <div class="mega-grid">${cardsHtml}</div>
        </div>
        <div class="screen-actions">
          <a href="index.html" class="wizard-back">← Volver al inicio</a>
          <button class="btn btn-primary" id="cat-continue" type="button" ${nCart === 0 ? 'disabled' : ''}>
            ${nCart === 0 ? 'Elige un servicio' : 'Ver mi cotización →'}
          </button>
        </div>
      </div>
    `;

    // Abrir mega (click en card · pero NO si fue en la (i))
    $$('#wizard [data-mega-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('[data-mega-info]')) return; // la (i) maneja su click
        State.catalogPath = { mega: btn.dataset.megaOpen, sub: null };
        trackStepChange();
        renderCatalog();
      });
    });
    // Botón (i) · abre modal de info de la categoría
    $$('#wizard [data-mega-info]').forEach(el => {
      const open = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const mega = PRICING.megaCategorias.find(m => m.id === el.dataset.megaInfo);
        if (mega) openInfoModal(L(mega.label), L(mega.info || mega.summary || ''), mega);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e); });
    });
    // v7.0.2 · "Volver al inicio" es un <a href="index.html"> · sin listener
    const goQuote = () => {
      if (State.cart.servicios.length === 0) return;
      scheduleAdvance('#/datos', 80);
    };
    $('#cat-continue').addEventListener('click', goQuote);
    $('#cat-ctx-quote')?.addEventListener('click', goQuote);
    refreshCart();
  }

  // ── Modal de información (botón "i" de las cards) ─────────────────────
  function openInfoModal(title, body, mega){
    let modal = $('#info-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'info-modal';
    modal.className = 'info-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // Listar los servicios que incluye la categoría
    let subsHtml = '';
    if (mega && mega.serviciosIds) {
      const PRICING = getPricing();
      subsHtml = `
        <div class="info-modal-subs">
          <div class="info-modal-subs-label">Incluye:</div>
          <ul>${mega.serviciosIds.map(id => {
            const s = PRICING.servicios[id];
            return s ? `<li><strong>${L(s.label)}</strong> · desde ${formatMxn(s.base)}</li>` : '';
          }).join('')}</ul>
        </div>`;
    }

    modal.innerHTML = `
      <div class="info-modal-backdrop" data-info-close></div>
      <div class="info-modal-panel">
        <button class="info-modal-close" data-info-close type="button" aria-label="Cerrar">×</button>
        <div class="info-modal-eyebrow">— ${title}</div>
        <p class="info-modal-body">${body}</p>
        ${subsHtml}
        <button class="btn btn-primary info-modal-cta" data-info-close type="button">Entendido</button>
      </div>
    `;
    document.body.appendChild(modal);

    function esc(e){ if (e.key === 'Escape') closeInfo(); }
    function closeInfo(){
      document.removeEventListener('keydown', esc);
      modal.remove();
    }
    document.addEventListener('keydown', esc);
    modal.querySelectorAll('[data-info-close]').forEach(b => b.addEventListener('click', closeInfo));
  }

  function collectMegaServiceIds(mega){
    return mega.serviciosIds || [];
  }

  // ── Nivel 3 · lista de servicios (de una sub o de una mega sin subs) ─
  function renderServicesList(title, subtitle, icon, serviciosIds, mega, sub){
    const PRICING = getPricing();
    const serviciosInCart = new Set(State.cart.servicios.map(s => s.id));

    // Orden: tier, luego precio
    const TIER_ORDER = { micro: 1, medio: 2, grande: 3 };
    const servs = serviciosIds
      .map(id => Object.assign({ id }, PRICING.servicios[id]))
      .filter(s => s && s.label)
      .sort((a, b) => {
        const aT = TIER_ORDER[a.tier] || 99;
        const bT = TIER_ORDER[b.tier] || 99;
        if (aT !== bT) return aT - bT;
        return (a.base || 0) - (b.base || 0);
      });

    const servsHtml = servs.map(s => {
      const inCart = serviciosInCart.has(s.id);
      const tierLabel = s.tier === 'micro' ? L('rápido') : (s.tier === 'medio' ? L('medio') : L('completo'));
      return `
        <div class="service-card ${inCart ? 'is-incart' : ''}" data-service-id="${s.id}">
          <div class="service-card-top">
            <div class="service-card-icon">${iconHtml(s.icon, 'line')}</div>
            <span class="service-tier service-tier-${s.tier}">${tierLabel}</span>
          </div>
          <div class="service-card-label">${L(s.label)}</div>
          ${s.subtitle ? `<div class="service-card-subtitle">${L(s.subtitle)}</div>` : ''}
          <div class="service-card-foot">
            <div class="service-card-meta">
              <span class="service-price">${L('desde')} +${formatMxn(s.base)}</span>
              <span class="service-time">${L(s.tiempo)}</span>
            </div>
            <span class="service-card-state ${inCart ? 'is-added' : ''}">${inCart ? '✓ Agregado · editar' : 'Agregar →'}</span>
          </div>
        </div>
      `;
    }).join('');

    // Breadcrumb via helper (v8.4.0 · reemplaza cat-breadcrumb inline)
    const breadcrumb = sub
      ? renderBreadcrumb([
          { label: 'Inicio', href: '#/catalog' },
          { label: mega.label, href: '#/catalog' },
          { label: sub.label }
        ])
      : renderBreadcrumb([
          { label: 'Inicio', href: '#/catalog' },
          { label: mega.label }
        ]);

    const backLabel = sub ? L(mega.label) : 'categorías';
    $('#wizard').innerHTML = `
      <div class="screen cat-detail-screen">
        <div class="screen-header">
          ${breadcrumb}
          <h2 class="cat-detail-title screen-title">${L(title)}</h2>
          <p class="cat-detail-subtitle screen-subtitle">${L(subtitle)} · ${servs.length} servicios disponibles</p>
        </div>
        <div class="screen-body">
          <div class="service-grid">${servsHtml}</div>
        </div>
        <div class="screen-actions">
          <button class="wizard-back" id="cat-back" type="button">← Volver a ${backLabel}</button>
          <button class="btn btn-primary" id="cat-continue" type="button" ${State.cart.servicios.length === 0 ? 'disabled' : ''}>
            ${State.cart.servicios.length === 0 ? 'Elige un servicio' : 'Ver mi cotización →'}
          </button>
        </div>
      </div>
    `;

    const goUp = () => {
      // Si estamos en sub → vuelve a mega · si estamos en mega → vuelve a root
      if (sub) State.catalogPath = { mega: mega.id, sub: null };
      else      State.catalogPath = { mega: null, sub: null };
      trackStepChange();
      renderCatalog();
    };
    const goToRoot = (e) => {
      if (e) e.preventDefault();
      State.catalogPath = { mega: null, sub: null };
      trackStepChange();
      renderCatalog();
    };
    const goToMegaLevel = (e) => {
      if (e) e.preventDefault();
      State.catalogPath = { mega: mega.id, sub: null };
      trackStepChange();
      renderCatalog();
    };
    $('#cat-back').addEventListener('click', goUp);
    // bc-root / bc-mega removed (breadcrumb now uses renderBreadcrumb · no inline ids)
    // Bind breadcrumb links by position: first link = root, second link = mega level (sub only)
    const bcLinks = document.querySelectorAll('#wizard .screen-breadcrumb a');
    if (sub) {
      if (bcLinks[0]) bcLinks[0].addEventListener('click', goToRoot);
      if (bcLinks[1]) bcLinks[1].addEventListener('click', goToMegaLevel);
    } else {
      if (bcLinks[0]) bcLinks[0].addEventListener('click', goToRoot);
    }

    // v9 · La card entera es el área de click. TODOS los servicios v9
    // tienen subflow (tipos + preguntas adaptativas + add-ons), así que
    // siempre abrimos el subflow. Si ya está en carrito → editar con
    // estado existente (tipoId+addOnIds+config). Si no → abrir limpio.
    $$('#wizard .service-card').forEach(card => {
      card.addEventListener('click', () => {
        const sid = card.dataset.serviceId;
        const servicio = Object.assign({ id: sid }, findServicio(sid));
        if (!servicio.label) return;
        const inCart = State.cart.servicios.find(s => s.id === sid);
        if (inCart) {
          trackEditClick();
          openSubflowModal(servicio, {
            tipoId: inCart.tipoId || null,
            addOnIds: inCart.addOnIds || [],
            config: inCart.config || {},
          });
        } else {
          openSubflowModal(servicio, null);
        }
      });
    });

    $('#cat-continue').addEventListener('click', () => {
      if (State.cart.servicios.length === 0) return;
      scheduleAdvance('#/datos', 80);
    });
    refreshCart();
  }

  // (renderCategoryDetail eliminada en v6.0.2 · reemplazada por renderServicesList)

  // ═══════════════════════════════════════════════════════════════════
  // CART · agregar / editar / quitar
  // ═══════════════════════════════════════════════════════════════════
  // calcSubflowPrice · v9.0
  //   Nuevo esquema adaptativo:
  //     1. base del servicio
  //     2. preguntas byType[tipoId] (específicas del tipo elegido)
  //     3. preguntas shared (acabado/plazo/etc. comunes a todos los tipos)
  //     4. add-ons globales (precio fijo cada uno)
  //   Orden: total = (base + Σ add) × Π mul + Σ addOnsPrice
  //   Los add-ons se suman al final (no se multiplican por mul de acabado/plazo)
  //   porque son entregables independientes.
  // ═══════════════════════════════════════════════════════════════════
  function calcSubflowPrice(servicio, config, tipoId, addOnIds){
    const PRICING = getPricing();
    let total = servicio.base || 0;

    // 1+2. Preguntas del subflow (preShared + byType + shared) · v10
    const sf = PRICING.subflow ? PRICING.subflow[servicio.id] : null;
    const muls = [];
    if (sf) {
      const preQs = sf.preShared || [];
      const tipoQs = (sf.byType && tipoId) ? (sf.byType[tipoId] || []) : [];
      const sharedQs = sf.shared || [];
      const allQs = [...preQs, ...tipoQs, ...sharedQs];
      for (const q of allQs) {
        const ans = config[q.id];
        if (!ans) continue;
        const opts = Array.isArray(ans) ? ans : [ans];
        for (const o of opts) {
          if (typeof o.add === 'number')  total += o.add;
          if (typeof o.mul === 'number')  muls.push(o.mul);
        }
      }
      for (const m of muls) total *= m;
    }

    // 3. Add-ons (precio fijo · suma plana al final)
    if (Array.isArray(addOnIds) && addOnIds.length) {
      const addOnsList = PRICING.addOns || [];
      for (const aid of addOnIds) {
        const ao = addOnsList.find(a => a.id === aid);
        if (ao && typeof ao.price === 'number') total += ao.price;
      }
    }

    return Math.round(total);
  }

  function addToCart(servicio, config, tipoId, addOnIds, needsDiscovery){
    const price = calcSubflowPrice(servicio, config, tipoId, addOnIds);
    State.cart.servicios.push({
      id: servicio.id,
      label: servicio.label,
      base: servicio.base,
      tier: servicio.tier,
      tiempo: servicio.tiempo,
      icon: servicio.icon,
      subtitle: servicio.subtitle,
      tipoId: tipoId || null,
      addOnIds: Array.isArray(addOnIds) ? [...addOnIds] : [],
      needsDiscovery: !!needsDiscovery,    // v10 · marca que el lead pidió 'no estoy seguro'
      config: config,
      calculatedPrice: price,
    });
    persistCart();
  }
  function updateCart(servicioId, config, tipoId, addOnIds, needsDiscovery){
    const idx = State.cart.servicios.findIndex(s => s.id === servicioId);
    if (idx < 0) return;
    const servicio = findServicio(servicioId);
    if (!servicio) return;
    State.cart.servicios[idx].config = config;
    if (tipoId !== undefined) State.cart.servicios[idx].tipoId = tipoId;
    if (addOnIds !== undefined) State.cart.servicios[idx].addOnIds = Array.isArray(addOnIds) ? [...addOnIds] : [];
    if (needsDiscovery !== undefined) State.cart.servicios[idx].needsDiscovery = !!needsDiscovery;
    const final = State.cart.servicios[idx];
    State.cart.servicios[idx].calculatedPrice = calcSubflowPrice(servicio, config, final.tipoId, final.addOnIds);
    persistCart();
  }
  function removeFromCart(servicioId){
    State.cart.servicios = State.cart.servicios.filter(s => s.id !== servicioId);
    persistCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUB-FLOW · v9.0 · Flow adaptativo con steps
  //   step 'tipo'    → renderTypeChooser  (cards de tipos del servicio)
  //   step 'q'       → renderSubflowQ     (preguntas adaptativas del tipo + shared)
  //   step 'addons'  → renderAddOnsSection (multi-select de extras globales)
  //   step 'confirm' → renderServiceConfirm
  //
  //   sf.qFlow se cachea al elegir tipo: [...byType[tipoId], ...shared]
  // ═══════════════════════════════════════════════════════════════════
  function openSubflowModal(servicio, existingState){
    // existingState (edit): { tipoId, addOnIds, config }
    const ed = existingState || {};
    const hasExisting = !!(ed.tipoId || ed.config);
    State.subflow = {
      servicioId: servicio.id,
      tipoId: ed.tipoId || null,
      qFlow: null,                                                 // se calcula al elegir tipo
      addOnIds: Array.isArray(ed.addOnIds) ? [...ed.addOnIds] : [],
      config: ed.config ? JSON.parse(JSON.stringify(ed.config)) : {},
      isEdit: hasExisting,
      qIndex: 0,
      step: hasExisting ? 'q' : 'tipo',  // si edit, salta tipo
    };
    if (hasExisting && ed.tipoId) {
      State.subflow.qFlow = buildQFlow(servicio.id, ed.tipoId);
    }
    State.catalogPath = Object.assign({}, State.catalogPath, { service: servicio.id });
    renderCatalog();
  }

  // v10 · construye el array de preguntas adaptativas con preShared
  // Orden: [preShared] → [byType[tipoId]] → [shared]
  // preShared se introdujo en v10 Apps para hacer Q0 vibe universal antes del flow específico.
  function buildQFlow(servicioId, tipoId){
    const PRICING = getPricing();
    const sf = PRICING.subflow ? PRICING.subflow[servicioId] : null;
    if (!sf) return [];
    const preQs = sf.preShared || [];
    const tipoQs = (sf.byType && tipoId) ? (sf.byType[tipoId] || []) : [];
    const sharedQs = sf.shared || [];
    return [...preQs, ...tipoQs, ...sharedQs];
  }

  // v9 · dispatcher según sf.step
  function renderSubflowView(){
    const PRICING = getPricing();
    const sf = State.subflow;
    if (!sf) { State.catalogPath.service = null; return renderCatalog(); }
    const servicio = Object.assign({ id: sf.servicioId }, findServicio(sf.servicioId));

    if (sf.step === 'tipo')    return renderTypeChooser(servicio);
    if (sf.step === 'addons')  return renderAddOnsSection(servicio);
    if (sf.step === 'confirm') return renderServiceConfirm(servicio, sf.config);
    // default: 'q' (preguntas)
    return renderSubflowQ(servicio);
  }

  // v9 · render preguntas adaptativas · paralelo al renderSubflowView v8 pero usa qFlow
  function renderSubflowQ(servicio){
    const PRICING = getPricing();
    const sf = State.subflow;
    const questions = sf.qFlow || [];
    const config = sf.config;

    // Si no hay preguntas (servicio sin subflow), saltar a addons
    if (questions.length === 0) {
      sf.step = 'addons';
      return renderSubflowView();
    }
    // Si terminó las preguntas → siguiente step (addons)
    if (sf.qIndex >= questions.length) {
      sf.step = 'addons';
      sf.qIndex = 0;
      return renderSubflowView();
    }

    trackStepShown('subflow:' + sf.servicioId + ':q' + sf.qIndex);
    const q = questions[sf.qIndex];
    const isMulti = q.multi === true;
    const total = questions.length;
    const ans = config[q.id];
    const selIds = isMulti
      ? new Set((ans || []).map(s => s.id))
      : new Set(ans ? [ans.id] : []);

    // v5.3.4 · Pre-fill inteligente para pasarelas
    let recommendedIds = new Set();
    if (q.id === 'pasarelas' && isMulti && config.metodos_pago) {
      const methodIds = (config.metodos_pago || []).map(m => m.id);
      const recArr = recommendGateways(methodIds, q.opciones);
      recommendedIds = new Set(recArr);
      if (!ans || ans.length === 0) {
        config[q.id] = recArr.map(id => q.opciones.find(o => o.id === id)).filter(Boolean);
      }
    }

    // v10.3 · Precio por opción (delta) en TODAS las megas · feedback Eduardo
    // Apps · Web · Ecom · Plataformas ahora muestran delta en single (no total acumulado).
    const isDeltaMega = (() => {
      const P = getPricing();
      const m = P && P.megaCategorias
        ? P.megaCategorias.find(mc => (mc.serviciosIds || []).includes(servicio.id))
        : null;
      return !!(m && ['apps','web','ecommerce','plat'].includes(m.id));
    })();

    // v7.1.0 · Cada card: título + descripción + PRECIO a simple vista.
    // Multi → "+ $X" · Single (Apps/Web) → delta por opción · Single (otros) → total acumulado.
    // Si la opción tiene `detalle`, botón +/- para expandir.
    const opcionesHtml = q.opciones.map(o => {
      const isSel = selIds.has(o.id);
      const isRec = recommendedIds.has(o.id);
      let priceHtml;
      // v10.4 · Eduardo: 'no puedes dejar ningún servicio a costo incluido o $0.00 en ninguna parte'.
      // Cuando una opción no añade costo extra, mostramos el PRECIO TOTAL ACUMULADO
      // si eliges esa opción (base + lo que ya configuraste). Cero 'Incluido' / cero '$0'.
      const totalIfPicked = () => {
        const hypo = Object.assign({}, config, { [q.id]: o });
        return formatMxn(calcSubflowPrice(servicio, hypo, sf.tipoId, sf.addOnIds));
      };
      if (isMulti) {
        // Multi · "+ $X" cuando add>0, "×N" cuando mul, sino total acumulado
        if (typeof o.add === 'number' && o.add > 0) priceHtml = `+ ${formatMxn(o.add)}`;
        else if (typeof o.mul === 'number' && o.mul !== 1.0) priceHtml = '×' + o.mul;
        else priceHtml = totalIfPicked();
      } else if (isDeltaMega) {
        // Single (Apps/Web/Ecom/Plat) · delta cuando add>0 o mul!=1 · total acumulado en cero/neutro
        if (typeof o.add === 'number' && o.add > 0) priceHtml = `+ ${formatMxn(o.add)}`;
        else if (typeof o.mul === 'number' && o.mul !== 1.0) {
          const pct = Math.round((o.mul - 1) * 100);
          priceHtml = pct > 0 ? `+${pct}%` : `${pct}%`;
        } else priceHtml = totalIfPicked();
      } else {
        // Legacy (servicios sin mega delta) · siempre total acumulado
        priceHtml = totalIfPicked();
      }
      const detalleHtml = o.detalle
        ? `<button class="sf-card-more" data-more type="button" aria-label="Más información">${L('+ qué incluye')}</button>
           <div class="sf-card-detalle" hidden>${L(o.detalle)}</div>`
        : '';
      // v10 · sf-card · icono PRIORIZA el de la opción (más específico).
      // Si la opción no tiene icon, cae al del servicio padre.
      const stateHtml = isSel
        ? `<span class="sf-card-state is-added">${L('seleccionada')}</span>`
        : '<span class="sf-card-arrow">→</span>';
      const optIcon = o.icon || servicio.icon || 'arrow';
      return `
        <button class="sf-card ${isSel ? 'is-selected' : ''} ${isRec ? 'is-recommended' : ''}" data-opt="${o.id}" type="button">
          ${isRec ? '<span class="option-badge-recomendada">RECOMENDADA</span>' : ''}
          <div class="sf-card-top">
            <div class="sf-card-icon">${iconHtml(optIcon, 'line')}</div>
          </div>
          <div class="sf-card-label">${L(o.label)}</div>
          ${o.subtitle ? `<div class="sf-card-subtitle">${L(o.subtitle)}</div>` : ''}
          <div class="sf-card-foot">
            <div class="sf-card-meta">
              <span class="sf-card-price">${priceHtml}</span>
            </div>
            ${detalleHtml ? detalleHtml : stateHtml}
          </div>
        </button>
      `;
    }).join('');

    const pct = Math.round(((sf.qIndex) / total) * 100);
    const backLabel = sf.qIndex > 0 ? 'pregunta anterior' : L(servicio.label);

    // v8.4.0 · Lookup mega para el breadcrumb del subflow
    const PRICING_sf = getPricing();
    const megaSf = PRICING_sf && PRICING_sf.megaCategorias
      ? PRICING_sf.megaCategorias.find(m => (m.serviciosIds || []).includes(sf.servicioId))
      : null;

    $('#wizard').innerHTML = `
      <div class="screen sf-screen">
        <div class="screen-header">
          ${renderBreadcrumb([
            { label: 'Inicio', href: '#/catalog' },
            { label: megaSf ? megaSf.label : 'Servicios', href: '#/catalog' },
            { label: servicio.label }
          ])}
          <div class="sf-progress">
            <div class="sf-progress-rail"><div class="sf-progress-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="sf-q-head">
            ${q.icon ? `<div class="sf-q-icon">${iconHtml(q.icon, 'line')}</div>` : ''}
            <h2 class="sf-q-title screen-title">${L(q.label)}</h2>
            ${q.help ? `<p class="sf-q-help screen-subtitle">${L(q.help)}</p>` : ''}
            ${isMulti ? `<p class="sf-q-multi">${L('Marca todas las que apliquen.')}</p>` : ''}
          </div>
        </div>
        <div class="screen-body">
          <div class="sf-grid ${isMulti ? 'is-multi' : ''}">${opcionesHtml}</div>
        </div>
        <div class="screen-actions">
          <button class="wizard-back" id="sf-back" type="button">← ${backLabel}</button>
          ${isMulti
            ? `<button class="btn btn-primary" id="sf-next" type="button">Continuar →</button>`
            : `<span class="wizard-hint">${L('Elige una opción para continuar')}</span>`}
        </div>
      </div>
    `;

    // ← Volver: pregunta anterior, o al step 'tipo' si es la primera
    $('#sf-back').addEventListener('click', () => {
      trackNavBack();
      if (sf.qIndex > 0) { sf.qIndex--; renderSubflowView(); }
      else {
        // Volver al chooser de tipo (no salir del subflow)
        sf.step = 'tipo';
        renderSubflowView();
      }
    });

    // Avanzar: siguiente pregunta o pasar a addons
    const advance = () => {
      trackStepChange();
      if (sf.qIndex < total - 1) { sf.qIndex++; renderSubflowView(); }
      else { sf.step = 'addons'; sf.qIndex = 0; renderSubflowView(); }
    };

    // v7.1.0 · Botón "+ qué incluye" expande el detalle · no selecciona
    $$('#wizard .sf-card [data-more]').forEach(more => {
      more.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const det = more.parentElement.querySelector('.sf-card-detalle');
        if (!det) return;
        const open = det.hasAttribute('hidden');
        if (open) { det.removeAttribute('hidden'); more.textContent = L('− cerrar'); }
        else      { det.setAttribute('hidden', ''); more.textContent = L('+ qué incluye'); }
      });
    });

    $$('#wizard .sf-card').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        if (ev.target.closest('[data-more]') || ev.target.closest('.sf-card-detalle')) return;
        const oid = btn.dataset.opt;
        const o = q.opciones.find(x => x.id === oid);
        if (isMulti) {
          const list = config[q.id] || [];
          const exists = list.find(x => x.id === oid);
          config[q.id] = exists ? list.filter(x => x.id !== oid) : [...list, o];
          if (q.id === 'metodos_pago') config.pasarelas = null;
          btn.classList.toggle('is-selected');
          // v10 · si la opción tiene flag 'needs-discovery', marcamos el subflow.
          // Solo aplica al toggle ON (no al destoggle).
          if (o.flag === 'needs-discovery' && !exists) sf.needsDiscovery = true;
          refreshCart();
        } else {
          config[q.id] = o;
          // v10 · marca needsDiscovery si la opción lo pide.
          if (o.flag === 'needs-discovery') sf.needsDiscovery = true;
          // feedback visual breve → auto-avanza
          $$('#wizard .sf-card').forEach(c => c.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          refreshCart();
          setTimeout(advance, 180);
        }
      });
    });

    const nextBtn = $('#sf-next');
    if (nextBtn) nextBtn.addEventListener('click', advance);

    refreshCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // v9 · TYPE CHOOSER · primer step del subflow
  // El usuario elige el TIPO de servicio (linktree vs bento, lead-gen vs
  // producto, etc.). Al seleccionar, se cachea sf.qFlow con las preguntas
  // específicas del tipo + las shared, y avanza a step 'q'.
  // ═══════════════════════════════════════════════════════════════════
  // v11.5 · Calcula el precio MÍNIMO del servicio si se elige este tipo.
  // Toma base + primera opción (default) de cada pregunta byType[tipoId]
  // que NO sea multi (las multi default = ninguna seleccionada, no suma).
  // Aplica adds primero, luego muls. Se usa para mostrar "desde +$X" en
  // las type-cards del chooser de tipos del subflow.
  function calcTypeMinPrice(servicio, tipoId){
    const PRICING = getPricing();
    const sf = PRICING.subflow ? PRICING.subflow[servicio.id] : null;
    let total = servicio.base || 0;
    if (!sf) return total;
    const tipoQs = (sf.byType && tipoId) ? (sf.byType[tipoId] || []) : [];
    const muls = [];
    for (const q of tipoQs) {
      if (q.multi) continue;
      const opt = q.opciones && q.opciones[0];
      if (!opt) continue;
      if (typeof opt.add === 'number') total += opt.add;
      if (typeof opt.mul === 'number') muls.push(opt.mul);
    }
    for (const m of muls) total *= m;
    return Math.round(total);
  }

  function renderTypeChooser(servicio){
    const PRICING = getPricing();
    const sf = State.subflow;
    trackStepShown('tipo:' + servicio.id);

    const tipos = Array.isArray(servicio.tipos) ? servicio.tipos : [];

    // Si el servicio no tiene tipos definidos, saltar este step directo a 'q'
    if (tipos.length === 0) {
      sf.tipoId = null;
      sf.qFlow = buildQFlow(servicio.id, null);
      sf.step = 'q';
      return renderSubflowView();
    }

    const megaTC = PRICING.megaCategorias
      ? PRICING.megaCategorias.find(m => (m.serviciosIds || []).includes(servicio.id))
      : null;

    const cardsHtml = tipos.map(t => {
      const isSel = sf.tipoId === t.id;
      // v11.5 · precio mínimo del tipo · consistente con service-cards "desde +$X"
      const typeMinPrice = calcTypeMinPrice(servicio, t.id);
      return `
        <button class="type-card ${isSel ? 'is-selected' : ''}" data-tipo="${t.id}" type="button">
          <div class="type-card-top">
            <div class="type-card-icon">${iconHtml(servicio.icon || 'arrow', 'line')}</div>
          </div>
          <div class="type-card-label">${L(t.label)}</div>
          ${t.summary ? `<div class="type-card-summary">${L(t.summary)}</div>` : ''}
          <div class="type-card-foot">
            <span class="type-card-price">${L('desde')} +${formatMxn(typeMinPrice)}</span>
            ${isSel
              ? `<span class="sf-card-state is-added">${L('seleccionado')}</span>`
              : '<span class="sf-card-arrow">→</span>'}
          </div>
        </button>
      `;
    }).join('');

    $('#wizard').innerHTML = `
      <div class="screen sf-screen">
        <div class="screen-header">
          ${renderBreadcrumb([
            { label: 'Inicio', href: '#/catalog' },
            { label: megaTC ? megaTC.label : 'Servicios', href: '#/catalog' },
            { label: servicio.label }
          ])}
          <div class="sf-q-head">
            <h2 class="sf-q-title screen-title">${L('¿Qué tipo de')} ${L(servicio.label).toLowerCase()}?</h2>
            <p class="sf-q-help screen-subtitle">${L('Elige el que más se acerca · personalizamos las preguntas a tu caso.')}</p>
          </div>
        </div>
        <div class="screen-body">
          <div class="sf-grid type-grid">${cardsHtml}</div>
        </div>
        <div class="screen-actions">
          <button class="wizard-back" id="sf-tipo-back" type="button">← ${L(servicio.label)}</button>
          <span class="wizard-hint">${L('Elige un tipo para continuar')}</span>
        </div>
      </div>
    `;

    $('#sf-tipo-back').addEventListener('click', () => {
      trackNavBack();
      State.subflow = null;
      State.catalogPath = Object.assign({}, State.catalogPath, { service: null });
      renderCatalog();
    });

    $$('#wizard .type-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.dataset.tipo;
        sf.tipoId = tid;
        sf.qFlow = buildQFlow(servicio.id, tid);
        sf.qIndex = 0;
        sf.step = 'q';
        // Reset config si cambia el tipo (las preguntas son distintas)
        sf.config = {};
        $$('#wizard .type-card').forEach(c => c.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        setTimeout(() => renderSubflowView(), 180);
      });
    });

    refreshCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // v9 · ADD-ONS SECTION · paso después de las preguntas core
  // Multi-select de capacidades extra del catálogo global PRICING.addOns
  // filtrado por `aplica:[servicioId]`. Cada add-on tiene precio fijo
  // que se suma al servicio en curso.
  // ═══════════════════════════════════════════════════════════════════
  function renderAddOnsSection(servicio){
    const PRICING = getPricing();
    const sf = State.subflow;
    trackStepShown('addons:' + servicio.id);

    const addOnsList = PRICING.addOnsForService
      ? PRICING.addOnsForService(servicio.id)
      : (PRICING.addOns || []).filter(a => (a.aplica || []).includes(servicio.id));

    const selected = new Set(sf.addOnIds || []);

    const megaAO = PRICING.megaCategorias
      ? PRICING.megaCategorias.find(m => (m.serviciosIds || []).includes(servicio.id))
      : null;

    const itemsHtml = addOnsList.length === 0
      ? `<p class="wizard-hint">${L('Este servicio no tiene capacidades extra disponibles · continúa al resumen.')}</p>`
      : addOnsList.map(a => {
          const isSel = selected.has(a.id);
          return `
            <button class="addon-chip ${isSel ? 'is-selected' : ''}" data-addon="${a.id}" type="button">
              <div class="addon-chip-icon">${iconHtml(a.icon || 'arrow', 'line')}</div>
              <div class="addon-chip-info">
                <div class="addon-chip-label">${L(a.label)}</div>
                <div class="addon-chip-summary">${L(a.summary || '')}</div>
              </div>
              <div class="addon-chip-price">+ ${formatMxn(a.price)}</div>
              <div class="addon-chip-check">${isSel ? '✓' : ''}</div>
            </button>
          `;
        }).join('');

    // Total preview con add-ons elegidos
    const previewPrice = calcSubflowPrice(servicio, sf.config, sf.tipoId, sf.addOnIds);

    $('#wizard').innerHTML = `
      <div class="screen sf-screen sf-addons-screen">
        <div class="screen-header">
          ${renderBreadcrumb([
            { label: 'Inicio', href: '#/catalog' },
            { label: megaAO ? megaAO.label : 'Servicios', href: '#/catalog' },
            { label: servicio.label }
          ])}
          <div class="sf-q-head">
            <h2 class="sf-q-title screen-title">${L('Capacidades extra')}</h2>
            <p class="sf-q-help screen-subtitle">${L('Agrega lo que necesites · puedes saltarlo y solo dejar lo esencial.')}</p>
          </div>
        </div>
        <div class="screen-body">
          <div class="addon-list">${itemsHtml}</div>
          <div class="addon-preview-total">
            <span class="addon-preview-label">${L('Total del servicio con extras')}</span>
            <span class="addon-preview-amount">${formatMxn(previewPrice)}</span>
          </div>
        </div>
        <div class="screen-actions">
          <button class="wizard-back" id="addon-back" type="button">← ${L('pregunta anterior')}</button>
          <button class="btn btn-primary" id="addon-next" type="button">${L('Continuar')} →</button>
        </div>
      </div>
    `;

    $('#addon-back').addEventListener('click', () => {
      trackNavBack();
      // Volver a la última pregunta
      const qLen = (sf.qFlow || []).length;
      if (qLen > 0) {
        sf.step = 'q';
        sf.qIndex = qLen - 1;
        renderSubflowView();
      } else {
        sf.step = 'tipo';
        renderSubflowView();
      }
    });

    $('#addon-next').addEventListener('click', () => {
      trackStepChange();
      sf.step = 'confirm';
      renderSubflowView();
    });

    $$('#wizard .addon-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const aid = chip.dataset.addon;
        if (!sf.addOnIds) sf.addOnIds = [];
        const exists = sf.addOnIds.includes(aid);
        sf.addOnIds = exists
          ? sf.addOnIds.filter(x => x !== aid)
          : [...sf.addOnIds, aid];
        renderAddOnsSection(servicio); // re-render para recalcular total
      });
    });

    refreshCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // v9 · Pantalla de confirmación del servicio (post-addons).
  // El servicio se agrega/actualiza al carrito AQUÍ (único punto) con
  // tipoId + addOnIds capturados.
  // ═══════════════════════════════════════════════════════════════════
  function renderServiceConfirm(servicio, config){
    const sf = State.subflow;
    trackStepShown('confirm:' + servicio.id);

    // Un solo punto de verdad: agregar/actualizar el carrito aquí.
    // v10 · propagamos `needsDiscovery` capturado en el subflow al item del cart.
    const nd = !!sf.needsDiscovery;
    if (sf.isEdit) updateCart(servicio.id, config, sf.tipoId, sf.addOnIds, nd);
    else if (!State.cart.servicios.find(s => s.id === servicio.id)) addToCart(servicio, config, sf.tipoId, sf.addOnIds, nd);
    else updateCart(servicio.id, config, sf.tipoId, sf.addOnIds, nd);

    const price = calcSubflowPrice(servicio, config, sf.tipoId, sf.addOnIds);
    const cfg = renderConfigSummaryInline(config);
    const total = State.cart.servicios.length;

    // Lookup mega para el breadcrumb
    const PRICING_confirm = getPricing();
    const megaConfirm = PRICING_confirm && PRICING_confirm.megaCategorias
      ? PRICING_confirm.megaCategorias.find(m => (m.serviciosIds || []).includes(servicio.id))
      : null;

    // Resumen de tipo + addons
    const tipoDef = (servicio.tipos || []).find(t => t.id === sf.tipoId);
    const tipoLine = tipoDef ? `<p class="sf-confirm-tipo">${L('Tipo')}: <strong>${L(tipoDef.label)}</strong></p>` : '';

    const addOnsList = PRICING_confirm.addOnsForService
      ? PRICING_confirm.addOnsForService(servicio.id)
      : (PRICING_confirm.addOns || []).filter(a => (a.aplica || []).includes(servicio.id));
    const chosenAddOns = (sf.addOnIds || []).map(id => addOnsList.find(a => a.id === id)).filter(Boolean);
    const addOnsLine = chosenAddOns.length
      ? `<p class="sf-confirm-addons">${L('Extras')}: ${chosenAddOns.map(a => L(a.label)).join(' · ')}</p>`
      : '';

    $('#wizard').innerHTML = `
      <div class="screen sf-confirm-screen">
        <div class="screen-header">
          ${renderBreadcrumb([
            { label: 'Inicio', href: '#/catalog' },
            { label: megaConfirm ? megaConfirm.label : 'Servicios', href: '#/catalog' },
            { label: servicio.label }
          ])}
          <h2 class="screen-title">${L('Servicio configurado')}</h2>
          <p class="screen-subtitle">${L(servicio.label)} ya está en tu carrito. ¿Qué sigue?</p>
        </div>
        <div class="screen-body">
          <div class="sf-confirm-check">${iconHtml('shield','line') || '✓'}</div>
          ${tipoLine}
          ${cfg ? `<p class="sf-confirm-cfg">${cfg}</p>` : ''}
          ${addOnsLine}
          <div class="sf-confirm-price">
            <span class="sf-confirm-price-label">${L('Precio de este servicio')}</span>
            <span class="sf-confirm-price-amount">${formatMxn(price)}</span>
          </div>
        </div>
        <div class="screen-actions">
          <button class="wizard-back sf-confirm-edit" id="sf-edit" type="button">← ${L('Ajustar este servicio')}</button>
          <div class="sf-confirm-actions">
            <button class="btn-line btn" id="sf-add-more" type="button">+ ${L('Agregar otro servicio')}</button>
            <button class="btn btn-primary" id="sf-go-quote" type="button">${L('Ver mi cotización')} →</button>
          </div>
        </div>
      </div>
    `;

    flyToCart(servicio);

    $('#sf-add-more').addEventListener('click', () => {
      State.subflow = null;
      State.catalogPath = { mega: null, sub: null, service: null };
      renderCatalog();
    });
    $('#sf-go-quote').addEventListener('click', () => {
      State.subflow = null;
      State.catalogPath = Object.assign({}, State.catalogPath, { service: null });
      scheduleAdvance('#/datos', 80);
    });
    $('#sf-edit').addEventListener('click', () => {
      // Volver al step de addons (más util para ajustar) o a la última pregunta
      sf.isEdit = true;
      sf.step = 'addons';
      renderSubflowView();
    });

    refreshCart();
  }

  // v6.2.0 · D · Animación "vuela al carrito" · chip del servicio se
  // desplaza del centro hacia el #cart con scale+fade. Respeta
  // prefers-reduced-motion.
  function flyToCart(servicio){
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const cartEl = document.getElementById('cart');
      if (!cartEl) return;
      const cartRect = cartEl.getBoundingClientRect();
      const chip = document.createElement('div');
      chip.className = 'fly-to-cart';
      chip.innerHTML = '<span class="fly-icon">' + (iconHtml(servicio.icon, 'line') || '✓') + '</span><span class="fly-label">' + L(servicio.label) + '</span>';
      document.body.appendChild(chip);
      const startX = window.innerWidth * 0.40;
      const startY = window.innerHeight * 0.45;
      chip.style.left = startX + 'px';
      chip.style.top = startY + 'px';
      const dx = (cartRect.left + cartRect.width / 2) - startX;
      const dy = (cartRect.top + 60) - startY;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chip.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0.35)';
          chip.style.opacity = '0';
        });
      });
      cartEl.classList.add('cart-pulse');
      setTimeout(() => { try { chip.remove(); } catch(_){} }, 600);
      setTimeout(() => cartEl.classList.remove('cart-pulse'), 650);
    } catch(_){}
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3 · renderDatos
  // ═══════════════════════════════════════════════════════════════════
  function renderDatos(){
    setProgress(85);
    trackStepShown('datos');

    if (State.cart.servicios.length === 0) {
      // Empty cart guard
      navigate('#/catalog');
      return;
    }

    const d = State.cliente;
    $('#wizard').innerHTML = `
      <div class="screen datos-screen">
        <div class="screen-header">
          ${renderBreadcrumb([{ label: 'Tu cotización · paso final' }])}
          <h2 class="screen-title datos-title">Falta poco para ver tu cotización</h2>
          <p class="datos-help screen-subtitle">Te enviamos la propuesta firmable + folio. Te respondemos en menos de 24 horas. Cero spam · cero llamadas no solicitadas.</p>
        </div>
        <div class="screen-body">
          <div class="datos-fields">
            <div class="datos-field">
              <label>${iconHtml('login','line')} Nombre <span class="datos-req">*</span></label>
              <input type="text" name="nombre" required placeholder="Tu nombre" value="${(d.nombre||'').replace(/"/g,'&quot;')}" autocomplete="name">
            </div>
            <div class="datos-field">
              <label>${iconHtml('whatsapp','line')} WhatsApp <span class="datos-req">*</span></label>
              <input type="tel" name="whatsapp" required placeholder="+52 33 0000 0000" value="${(d.whatsapp||'').replace(/"/g,'&quot;')}" autocomplete="tel">
            </div>
            <div class="datos-field">
              <label>${iconHtml('arrow','line')} Email <span class="datos-req">*</span></label>
              <input type="email" name="email" required placeholder="hola@tudominio.com" value="${(d.email||'').replace(/"/g,'&quot;')}" autocomplete="email">
            </div>
            <div class="datos-field">
              <label>${iconHtml('service','line')} <span class="datos-empresa-label">Empresa <span class="datos-opt">(opcional)</span></span></label>
              <input type="text" name="empresa" placeholder="Nombre de tu negocio o proyecto" value="${(d.empresa||'').replace(/"/g,'&quot;')}" autocomplete="organization">
            </div>
          </div>
          <p class="datos-privacy">${L('Tus datos quedan privados · solo nosotros y tú · ver')} <a href="legal/privacidad.html" target="_blank">${L('aviso de privacidad')}</a></p>
        </div>
        <div class="screen-actions">
          <button class="btn-ghost btn" data-prev type="button">← Atrás</button>
          <button class="btn btn-primary" id="datos-continue" type="button" disabled>Ver mi cotización →</button>
        </div>
      </div>
    `;

    function checkValid(){
      const ok = ['nombre','email','whatsapp'].every(k => State.cliente[k] && State.cliente[k].trim());
      const btn = $('#datos-continue');
      if (btn) btn.disabled = !ok;
      // Sincronizar también el CTA del carrito
      const cartCta = $('#rk-cart-pay');
      if (cartCta) cartCta.disabled = !ok;
    }

    $$('#wizard input').forEach(input => input.addEventListener('input', e => {
      State.cliente[e.target.name] = e.target.value;
      trackStepChange();
      checkValid();
      persistCart();
    }));
    checkValid();

    $('#datos-continue').addEventListener('click', () => scheduleAdvance('#/loading', 80));
    $('[data-prev]').addEventListener('click', () => { trackNavBack(); navigate('#/catalog'); });

    refreshCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // LOADING (preservado del v5.3.0 · crossfade real)
  // ═══════════════════════════════════════════════════════════════════
  function renderLoading(){
    setProgress(100);
    const nombre = State.cliente.nombre ? State.cliente.nombre.split(' ')[0] : '';

    $('#wizard').innerHTML = `
      <div class="rk-loading-wrap">
        <div class="rk-loading">
          <div class="rk-loading-spinner" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="rk-loading-stage">Calculando tu cotización…</div>
          <p class="rk-loading-hint">${nombre ? nombre + ', preparamos ' : 'Preparamos '}tu propuesta · folio · stack · equipo · tiempos.</p>
          <ul class="rk-loading-steps">
            <li><span class="rk-load-tick">○</span> Generamos folio único</li>
            <li><span class="rk-load-tick">○</span> Asignamos equipo según alcance</li>
            <li><span class="rk-load-tick">○</span> Calculamos tiempos y stack</li>
            <li><span class="rk-load-tick">○</span> Listo · abriendo cotización</li>
          </ul>
        </div>
      </div>
    `;

    refreshCart();
    try { computeCart(); } catch(_){}

    const items = $$('#wizard .rk-loading-steps li');
    const total = 900;
    const stepMs = Math.floor(total / (items.length + 1));
    items.forEach((li, idx) => {
      setTimeout(() => {
        const tick = li.querySelector('.rk-load-tick');
        if (tick) tick.textContent = '✓';
        li.classList.add('is-done');
      }, stepMs * (idx + 1));
    });

    setTimeout(() => {
      const wizard = $('#wizard');
      const loaderEl = wizard && wizard.querySelector('.rk-loading-wrap');
      if (!loaderEl) { navigate('#/resultado'); return; }

      // Última fila como done
      const lastTick = wizard.querySelector('.rk-loading-steps li:last-child');
      if (lastTick) {
        lastTick.classList.add('is-done');
        const t = lastTick.querySelector('.rk-load-tick');
        if (t) t.textContent = '✓';
      }

      // v6.1.0 · Handover SIN salto · una sola animación en juego.
      // 1) Clonar el loader como overlay fixed (cubre la pantalla, opacity 1).
      const overlay = document.createElement('div');
      overlay.className = 'rk-loading-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = loaderEl.outerHTML;
      document.body.appendChild(overlay);

      // 2) is-handover desactiva el `animation: questionEnter` del
      //    .result-screen → el resultado pinta ESTABLE, sin su propio
      //    fade-in que competía con el overlay y causaba el salto.
      document.body.classList.add('is-handover');

      // 3) Pintar el resultado (queda tapado por el overlay opaco).
      navigate('#/resultado');

      // v7.1.0 · FALLBACK DEFENSIVO · garantiza que la cotización
      // SIEMPRE aparezca. Si tras el navigate el #wizard no tiene
      // .result-screen en 280ms (hashchange perdido, render abortado,
      // etc.), forzamos renderResultado() directo. Mata el bug "carga
      // pero no muestra cotización" sea cual sea la causa raíz.
      setTimeout(() => {
        const w = document.getElementById('wizard');
        if (w && !w.querySelector('.result-screen')) {
          try {
            if (location.hash !== '#/resultado') location.hash = '#/resultado';
            renderResultado();
          } catch(_){}
        }
      }, 280);

      // 4) Esperar paint REAL del resultado pesado (RAF×2 + 90ms) antes
      //    de iniciar el fade del overlay. Así el resultado ya está
      //    completamente reflowed/pintado y estable detrás.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            overlay.classList.add('is-out');     // único fade · 450ms
            setTimeout(() => {
              try { overlay.remove(); } catch(_){}
              document.body.classList.remove('is-handover');
            }, 500);
          }, 90);
        });
      });
    }, total + 200);
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP FINAL · renderResultado
  // ═══════════════════════════════════════════════════════════════════
  function renderResultado(){
    setProgress(100);
    trackStepShown('resultado');

    if (State.cart.servicios.length === 0) {
      navigate('#/catalog');
      return;
    }
    const ok = ['nombre','email','whatsapp'].every(k => State.cliente[k] && State.cliente[k].trim());
    if (!ok) { navigate('#/datos'); return; }

    if (!State.folio) {
      State.folio = nextFolio();
      persistLead({
        route: 'cotiza-v6', stage: 'final',
        cart: State.cart, cliente: State.cliente, folio: State.folio,
      });
    }

    const calc = computeCart();
    const folio = State.folio;
    const datosCliente = State.cliente;

    const lineItemsHtml = calc.lineItems.map(li => `
      <div class="rk-line-item">
        <div class="rk-line-icon">${iconHtml(li.icon, 'line')}</div>
        <div class="rk-line-info">
          <div class="rk-line-label">${L(li.label)}</div>
          ${renderConfigSummary(li.config)}
        </div>
        <div class="rk-line-price">${formatMxn(li.price)}</div>
      </div>
    `).join('');

    // WhatsApp message · v9
    // Incluye: tipo elegido + config detallada + add-ons + IVA + total.
    // Cero referencias a plazo/modo (esos ya están dentro de la config).
    function configToTextFull(cfg){
      if (!cfg) return '';
      const parts = [];
      for (const qid of Object.keys(cfg)) {
        const ans = cfg[qid];
        if (!ans) continue;
        if (Array.isArray(ans)) {
          if (ans.length) parts.push(ans.map(o => L(o.label)).join(', '));
        } else if (ans.label) {
          parts.push(L(ans.label));
        }
      }
      return parts.join(' · ');
    }
    const itemsText = calc.lineItems.map(li => {
      const tipoLine = li.tipoLabel ? `\n   ↳ ${L('Tipo')}: ${L(li.tipoLabel)}` : '';
      const cfgText = configToTextFull(li.config);
      const cfgLine = cfgText ? `\n   ↳ ${cfgText}` : '';
      const addOnsLine = (li.addOns && li.addOns.length)
        ? `\n   ↳ ${L('Extras')}: ${li.addOns.map(a => L(a.label) + ' (+' + formatMxn(a.price) + ')').join(', ')}`
        : '';
      return `• ${li.label} · ${formatMxn(li.price)}${tipoLine}${cfgLine}${addOnsLine}`;
    }).join('\n');
    // v10 · si algún servicio del cart tiene needsDiscovery, alertamos al hunter
    // para que sepa que el lead pidió ayuda en el discovery.
    const needsDiscoveryAny = State.cart.servicios.some(s => s.needsDiscovery);
    const ndPrefix = needsDiscoveryAny
      ? '⚠️ Este lead marcó "no estoy seguro" en alguna pregunta · agendar discovery antes de propuesta.\n\n'
      : '';
    const waMsg = `${ndPrefix}Hola, vengo del cotizador iBisne con folio #${folio}.\n\n${itemsText}\n\nSubtotal: ${formatMxn(calc.subtotal)}\nIVA 16%: ${formatMxn(calc.total * 0.16)}\nTotal con IVA: ${formatMxn(calc.totalConIva)}\n\nQuiero hablar para precisar el alcance.`;
    const waUrl = `https://wa.me/523329575274?text=${encodeURIComponent(waMsg)}`;

    $('#wizard').innerHTML = `
      <div class="screen result-screen result-checkout">
        <div class="screen-header">
          <div class="rk-head">
            ${renderBreadcrumb([{ label: 'Cotización · folio #' + folio }])}
            <h2 class="screen-title rk-title">${datosCliente.nombre ? `${datosCliente.nombre.split(' ')[0]}, t` : 'T'}u cotización está lista.</h2>
            <p class="screen-subtitle rk-sub">Revisa el desglose, confirma con un pago de anticipo y arrancamos. Cero compromisos hasta que tú decidas.</p>
          </div>
        </div>
        <div class="screen-body">

        <article class="rk-card rk-project">
          <div class="rk-card-eyebrow">${L('— TU PROYECTO')}</div>
          <div class="rk-project-head">
            <div class="rk-project-name">${calc.lineItems.length} servicio${calc.lineItems.length === 1 ? '' : 's'} configurado${calc.lineItems.length === 1 ? '' : 's'}</div>
            <div class="rk-project-vertical">Tier ${calc.tier.label}</div>
          </div>
          <div class="rk-project-meta">
            <div class="rk-meta-item">
              <span class="rk-meta-icon">${iconHtml('clock','line')}</span>
              <div>
                <div class="rk-meta-label">Tiempo de entrega</div>
                <div class="rk-meta-value">${L(calc.tiempo)}</div>
              </div>
            </div>
            <div class="rk-meta-item">
              <span class="rk-meta-icon">${iconHtml('partnership','line')}</span>
              <div>
                <div class="rk-meta-label">Equipo asignado</div>
                <div class="rk-meta-value">${calc.team.slice(0,4).join(' · ')}${calc.team.length > 4 ? ' +' + (calc.team.length-4) : ''}</div>
              </div>
            </div>
            <div class="rk-meta-item">
              <span class="rk-meta-icon">${iconHtml('star','line')}</span>
              <div>
                <div class="rk-meta-label">Acabado</div>
                <div class="rk-meta-value">${calc.speedZone === 'mvp' ? 'Rápido (MVP)' : (calc.speedZone === 'premium' ? 'Premium' : 'Equilibrado')}</div>
              </div>
            </div>
            <div class="rk-meta-item">
              <span class="rk-meta-icon">${iconHtml('serverapp','line')}</span>
              <div>
                <div class="rk-meta-label">Tecnología</div>
                <div class="rk-meta-value">${calc.stack[0] || 'Stack adecuado'}</div>
              </div>
            </div>
          </div>
        </article>

        <article class="rk-card rk-breakdown">
          <div class="rk-card-eyebrow">${L('— DESGLOSE')}</div>
          <div class="rk-lines">${lineItemsHtml}</div>
          <div class="rk-totals">
            <div class="rk-total-row"><span>Subtotal</span><span>${formatMxn(calc.subtotal)}</span></div>
            <div class="rk-total-row"><span>IVA 16%</span><span>${formatMxn(calc.total * 0.16)}</span></div>
            <div class="rk-total-row rk-total-final"><span>TOTAL MXN</span><span>${formatMxn(calc.totalConIva)}</span></div>
          </div>
        </article>

        <article class="rk-card rk-highlights">
          <div class="rk-card-eyebrow">${L('— LO QUE INCLUYE TRABAJAR CON iBISNE')}</div>
          <div class="bp-grid">
            <div class="bp-item">
              <span class="bp-icon">${iconHtml('partnership','line')}</span>
              <div><strong>Soporte dedicado</strong><p>Una persona asignada desde el día 1.</p></div>
            </div>
            <div class="bp-item">
              <span class="bp-icon">${iconHtml('shield','line')}</span>
              <div><strong>Acompañamiento 24/7</strong><p>Por WhatsApp directo con tu equipo.</p></div>
            </div>
            <div class="bp-item">
              <span class="bp-icon">${iconHtml('arrow','line')}</span>
              <div><strong>De 0 al lanzamiento</strong><p>Sin proveedores externos · lo hace iBisne.</p></div>
            </div>
            <div class="bp-item">
              <span class="bp-icon">${iconHtml('clock','line')}</span>
              <div><strong>Un año de seguimiento</strong><p>Ajustes incluidos · no desaparecemos.</p></div>
            </div>
          </div>
        </article>

        <article class="rk-card rk-faq">
          <div class="rk-card-eyebrow">${L('— PREGUNTAS COMUNES')}</div>
          <details class="rk-faq-item">
            <summary>¿Qué pasa después de pagar el anticipo?</summary>
            <div>Te asignamos KAM en menos de 24h. Agendamos discovery call para firmar el alcance exacto. Si en discovery decidimos que el proyecto no es viable, devolvemos el 100% del anticipo.</div>
          </details>
          <details class="rk-faq-item">
            <summary>¿Puedo modificar la cotización después?</summary>
            <div>Sí. Hasta firmar discovery, ajustamos cualquier servicio. Después de firmar, modificaciones grandes se cotizan aparte (siempre con tu aprobación).</div>
          </details>
          <details class="rk-faq-item">
            <summary>¿Cómo se entregan los servicios pequeños (10 posts, logo express)?</summary>
            <div>Servicios express se entregan vía WhatsApp/email en el tiempo prometido. Los proyectos medianos y grandes pasan por discovery + sprints semanales.</div>
          </details>
          <details class="rk-faq-item">
            <summary>¿Hay costos extras durante el proyecto?</summary>
            <div>No. El precio es cerrado: incluye discovery, ejecución, deploy y un año de seguimiento. Si algo cambia el alcance, lo cotizamos aparte con tu aprobación previa.</div>
          </details>
        </article>

        <article class="rk-card rk-aux">
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn-ghost btn rk-aux-wa">${iconHtml('whatsapp','line')} Hablar con un hunter sobre esta cotización</a>
        </article>

        </div>
      </div>
    `;

    refreshCart();
  }

  function renderConfigSummary(config){
    if (!config) return '';
    const parts = [];
    for (const qid of Object.keys(config)) {
      const ans = config[qid];
      if (!ans) continue;
      if (Array.isArray(ans)) {
        parts.push(ans.map(o => L(o.label)).join(' · '));
      } else if (ans.label) {
        parts.push(L(ans.label));
      }
    }
    if (parts.length === 0) return '';
    return `<div class="rk-line-config">${parts.join(' · ')}</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CARRITO STICKY (lado derecho permanente)
  // ═══════════════════════════════════════════════════════════════════
  // v11 · animateNumber · interpola valor con RAF + easeOutQuart
  // Usado por refreshCart para animar los totales del cart cuando cambian.
  function animateNumber(el, from, to, duration, formatter){
    if (!el) return;
    duration = duration || 350;
    formatter = formatter || formatMxn;
    if (from === to) { el.textContent = formatter(to); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatter(to);
      return;
    }
    const start = performance.now();
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    function step(now){
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const value = from + (to - from) * easeOutQuart(t);
      el.textContent = formatter(value);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // v11 · refreshCart con animación de cifras
  // Captura totales antes del re-render · después anima los nuevos elementos del valor anterior al nuevo.
  let _prevCartCalc = null;
  function refreshCart(){
    const cartEl = $('#cart');
    if (!cartEl) return;
    // Snapshot del cálculo antes de re-render
    const prev = _prevCartCalc || { subtotal: 0, total: 0, totalConIva: 0 };

    cartEl.innerHTML = renderCartContent();
    bindCart();

    // Calcular nuevo · animar diferencias
    const cur = computeCart();

    // v11.4 · Animar el TOTAL del header del cart bar (siempre visible,
    // incluso colapsado). Usuario ve subir/bajar la cifra sin tener que
    // abrir el cart.
    const headerAmount = cartEl.querySelector('.rk-cart-header-total-amount');
    if (headerAmount) {
      const startVal = prev.totalConIva;
      const endVal = cur.totalConIva;
      if (startVal !== endVal && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 4);
        function stepH(now){
          const t = Math.min(1, (now - start) / 380);
          const v = startVal + (endVal - startVal) * ease(t);
          headerAmount.innerHTML = formatMxn(v) + ' <small>MXN</small>';
          if (t < 1) requestAnimationFrame(stepH);
        }
        requestAnimationFrame(stepH);
      }
      // Flash visual (mismo patrón que rk-cart-total-final)
      headerAmount.classList.remove('flash-up', 'flash-down');
      void headerAmount.offsetWidth;
      if (cur.totalConIva > prev.totalConIva) headerAmount.classList.add('flash-up');
      else if (cur.totalConIva < prev.totalConIva) headerAmount.classList.add('flash-down');
    }

    const totals = cartEl.querySelectorAll('.rk-cart-total-line');
    if (totals.length >= 3) {
      // Subtotal · IVA · TOTAL (sin tocar building note si existe)
      const subtotalSpan = totals[0]?.querySelector('span:last-child');
      const ivaSpan      = totals[1]?.querySelector('span:last-child');
      const totalSpan    = totals[2]?.querySelector('span:last-child');
      if (subtotalSpan) animateNumber(subtotalSpan, prev.subtotal, cur.subtotal);
      if (ivaSpan)      animateNumber(ivaSpan, prev.total * 0.16, cur.total * 0.16);
      // El total trae "<span> $ X <small>MXN</small></span>" · animamos solo el número antes del small
      if (totalSpan) {
        const small = totalSpan.querySelector('small');
        animateNumber(totalSpan, prev.totalConIva, cur.totalConIva, 380, (v) => {
          return formatMxn(v) + (small ? ' <small>MXN</small>' : '');
        });
        // Reemplazo es innerHTML porque hay <small> dentro
        // Caso: si small existe, usamos innerHTML; sino textContent.
        // animateNumber escribe a textContent por default · sobrescribimos:
        if (small) {
          const startVal = prev.totalConIva, endVal = cur.totalConIva;
          if (startVal !== endVal && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const start = performance.now();
            const ease = (t) => 1 - Math.pow(1 - t, 4);
            function step(now){
              const t = Math.min(1, (now - start) / 380);
              const v = startVal + (endVal - startVal) * ease(t);
              totalSpan.innerHTML = formatMxn(v) + ' <small>MXN</small>';
              if (t < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          } else {
            totalSpan.innerHTML = formatMxn(endVal) + ' <small>MXN</small>';
          }
        }
        // Flash visual al subir/bajar el total final
        const totalLine = totals[2];
        if (totalLine) {
          totalLine.classList.remove('flash-up', 'flash-down');
          // force reflow para reiniciar la animación
          void totalLine.offsetWidth;
          if (cur.totalConIva > prev.totalConIva) totalLine.classList.add('flash-up');
          else if (cur.totalConIva < prev.totalConIva) totalLine.classList.add('flash-down');
        }
      }
    }
    _prevCartCalc = cur;
  }

  function renderCartContent(){
    const calc = computeCart();
    const PRICING = getPricing();
    const datosOk = ['nombre','email','whatsapp'].every(k => State.cliente[k] && State.cliente[k].trim());
    const isResultado = parseHash().step === 'resultado';

    // v9 · Servicio en construcción (carrito siempre vivo)
    // No construir "building" si ya estamos en confirm (sf.step === 'confirm')
    // porque el servicio ya está en cart.servicios y se mostraría duplicado.
    let building = null;
    if (State.subflow && State.subflow.step !== 'confirm') {
      const sfB = State.subflow;
      const bServ = Object.assign({ id: sfB.servicioId }, findServicio(sfB.servicioId));
      if (bServ.label) {
        building = {
          servicio: bServ,
          price: calcSubflowPrice(bServ, sfB.config, sfB.tipoId, sfB.addOnIds),
          cfg: renderConfigSummaryInline(sfB.config),
          isEdit: !!sfB.isEdit,
        };
      }
    }

    const empty = State.cart.servicios.length === 0 && !building;

    if (empty) {
      return `
        <div class="rk-cart">
          <div class="rk-cart-header">
            <div class="rk-cart-header-left">
              <span class="rk-cart-eyebrow">${L('— TU CARRITO')}</span>
              <span class="rk-cart-count">${L('0 servicios')}</span>
            </div>
            <div class="rk-cart-header-total rk-cart-header-empty" aria-label="Empieza tu cotización">
              <span class="rk-cart-header-empty-cta">${L('Configura tu cotización')} ↑</span>
            </div>
          </div>
          <div class="rk-cart-empty">
            <div class="rk-cart-empty-icon">${iconHtml('ecommerce','line')}</div>
            <p class="rk-cart-empty-title">${L('Tu carrito está vacío')}</p>
            <p class="rk-cart-empty-sub">${L('Empieza eligiendo qué necesitas en el catálogo →')}</p>
          </div>
        </div>
      `;
    }

    // v9 · helper · renderiza add-ons hidratados para un servicio del cart
    const renderItemAddOns = (s) => {
      if (!s.addOnIds || s.addOnIds.length === 0) return '';
      const addOns = s.addOnIds.map(id => {
        const ao = PRICING.findAddOn ? PRICING.findAddOn(id) : null;
        return ao ? `<li class="rk-cart-item-addon">${L(ao.label)} <small>+${formatMxn(ao.price)}</small></li>` : '';
      }).filter(Boolean);
      return addOns.length ? `<ul class="rk-cart-item-addons">${addOns.join('')}</ul>` : '';
    };

    // v9 · helper · renderiza el "tipo" del servicio si existe
    const renderItemTipo = (s) => {
      const svc = PRICING.servicios[s.id];
      if (!svc || !Array.isArray(svc.tipos) || !s.tipoId) return '';
      const t = svc.tipos.find(x => x.id === s.tipoId);
      return t ? `<div class="rk-cart-item-tipo">${L(t.label)}</div>` : '';
    };

    const itemsHtml = State.cart.servicios.map(s => {
      const cfg = renderConfigSummaryInline(s.config);
      // No mostrar como item normal el que está en edición ahora mismo
      if (building && building.isEdit && building.servicio.id === s.id) return '';
      return `
        <li class="rk-cart-item" data-service-id="${s.id}">
          <div class="rk-cart-item-icon">${iconHtml(s.icon, 'line')}</div>
          <div class="rk-cart-item-info">
            <div class="rk-cart-item-label">${L(s.label)}</div>
            ${renderItemTipo(s)}
            ${cfg ? `<div class="rk-cart-item-config">${cfg}</div>` : ''}
            ${renderItemAddOns(s)}
            <div class="rk-cart-item-price">${formatMxn(s.calculatedPrice || s.base)}</div>
          </div>
          <div class="rk-cart-item-actions">
            <button class="rk-cart-edit" data-service-id="${s.id}" type="button" aria-label="Editar">${iconHtml('edit','line') || '✎'}</button>
            <button class="rk-cart-remove" data-service-id="${s.id}" type="button" aria-label="Quitar">×</button>
          </div>
        </li>
      `;
    }).join('');

    // Item "en construcción" · se actualiza en vivo con cada selección
    const buildingHtml = building ? `
      <li class="rk-cart-item rk-cart-item-building" data-service-id="${building.servicio.id}">
        <div class="rk-cart-item-icon">${iconHtml(building.servicio.icon, 'line')}</div>
        <div class="rk-cart-item-info">
          <div class="rk-cart-item-label">${L(building.servicio.label)} <span class="rk-cart-building-tag">configurando…</span></div>
          ${building.cfg ? `<div class="rk-cart-item-config">${building.cfg}</div>` : ''}
          <div class="rk-cart-item-price">${formatMxn(building.price)}</div>
        </div>
      </li>
    ` : '';

    const itemCount = State.cart.servicios.length;
    const countLabel = building
      ? (itemCount > 0 ? `${itemCount} + 1 configurando` : '1 configurando')
      : `${itemCount} servicio${itemCount === 1 ? '' : 's'}`;

    // v10.1 · Payment plan + descuento (sólo cuando isResultado)
    // applyPaymentPlan calcula finalTotal según plan + código de descuento.
    const pay = isResultado ? applyPaymentPlan(calc.totalConIva) : null;
    const folio = State.folio || '';

    // CTA principal:
    //  · contado → PayPal con monto descontado
    //  · MSI-N → WhatsApp con plan pre-fillado al hunter
    let ctaLabel, ctaHref;
    const ctaDisabled = !isResultado && !datosOk;
    if (isResultado) {
      if (pay.plan === 'contado') {
        ctaLabel = `Pagar contado · ${formatMxn(pay.finalTotal)}`;
        ctaHref = `https://paypal.me/iBisne/${Math.round(pay.finalTotal)}MXN`;
      } else {
        ctaLabel = `Apartar 1ra mensualidad · ${formatMxn(pay.monthlyAmount)}/mes`;
        const waText = `Hola, quiero pagar mi cotización #${folio} a ${pay.monthsCount} meses sin intereses.\n` +
          `Mensualidad: ${formatMxn(pay.monthlyAmount)} MXN.\n` +
          `Total con plan: ${formatMxn(pay.finalTotal)} MXN.\n` +
          (pay.codeApplied ? `Código aplicado: ${pay.code} (-40%)\n` : '') +
          `¿Cómo procedemos?`;
        ctaHref = `https://wa.me/523329575274?text=${encodeURIComponent(waText)}`;
      }
    } else {
      ctaLabel = datosOk ? 'Ver mi cotización →' : 'Continúa para ver el total';
      ctaHref = '';
    }

    // Sección payment plan: 5 radio opciones
    const planRadios = [
      { id: 'contado', icon: 'zap',           title: 'Contado · -20% descuento', sub: `Pago en una exhibición · ahorra ${formatMxn(calc.totalConIva * 0.20)}`, amountLabel: pay ? formatMxn(pay.plan === 'contado' ? pay.finalTotal : calc.totalConIva * 0.80) : '' },
      { id: 'msi-3',   icon: 'wallet',        title: '3 meses sin intereses',   sub: `Pago mensual cómodo`, amountLabel: pay ? `${formatMxn((pay.codeApplied ? calc.totalConIva*0.60 : calc.totalConIva) / 3)}/mes` : '' },
      { id: 'msi-6',   icon: 'wallet',        title: '6 meses sin intereses',   sub: `Pago mensual cómodo`, amountLabel: pay ? `${formatMxn((pay.codeApplied ? calc.totalConIva*0.60 : calc.totalConIva) / 6)}/mes` : '' },
      { id: 'msi-9',   icon: 'wallet',        title: '9 meses sin intereses',   sub: `Pago mensual cómodo`, amountLabel: pay ? `${formatMxn((pay.codeApplied ? calc.totalConIva*0.60 : calc.totalConIva) / 9)}/mes` : '' },
      { id: 'msi-12',  icon: 'wallet',        title: '12 meses sin intereses',  sub: `Pago mensual cómodo`, amountLabel: pay ? `${formatMxn((pay.codeApplied ? calc.totalConIva*0.60 : calc.totalConIva) / 12)}/mes` : '' },
    ];
    const planHtml = isResultado ? `
      <div class="rk-cart-payment-plan">
        <div class="rk-cart-payment-label">— ¿Cómo quieres pagar?</div>
        <div class="rk-cart-payment-options">
          ${planRadios.map(r => `
            <label class="payment-opt ${pay.plan === r.id ? 'is-active' : ''}" data-plan="${r.id}">
              <input type="radio" name="payment-plan" value="${r.id}" ${pay.plan === r.id ? 'checked' : ''}>
              <span class="payment-opt-icon">${iconHtml(r.icon,'line')}</span>
              <span class="payment-opt-info">
                <span class="payment-opt-title">${L(r.title)}</span>
                <span class="payment-opt-sub">${L(r.sub)}</span>
              </span>
              <span class="payment-opt-amount">${r.amountLabel}</span>
            </label>
          `).join('')}
        </div>
        <div class="rk-cart-discount">
          <input type="text" class="rk-cart-discount-input" id="rk-cart-discount-input"
                 placeholder="¿Código de descuento?"
                 value="${(State.cart.discountCode || '').replace(/"/g,'')}">
          <button class="rk-cart-discount-apply" id="rk-cart-discount-apply" type="button">Aplicar</button>
        </div>
        ${pay.codeApplied ? `<div class="rk-cart-discount-success">✓ Código <strong>${pay.code}</strong> aplicado · -40%</div>` : ''}
      </div>
    ` : '';

    return `
      <div class="rk-cart">
        <div class="rk-cart-header">
          <div class="rk-cart-header-left">
            <span class="rk-cart-eyebrow">${L('— TU CARRITO')}</span>
            <span class="rk-cart-count">${countLabel}</span>
          </div>
          <div class="rk-cart-header-total" aria-label="Total estimado">
            <span class="rk-cart-header-total-label">TOTAL</span>
            <span class="rk-cart-header-total-amount">${formatMxn(calc.totalConIva)} <small>MXN</small></span>
          </div>
        </div>

        <ul class="rk-cart-items">${itemsHtml}${buildingHtml}</ul>

        <div class="rk-cart-totals">
          <div class="rk-cart-total-line"><span>Subtotal</span><span>${formatMxn(calc.subtotal)}</span></div>
          <div class="rk-cart-total-line"><span>IVA 16%</span><span>${formatMxn(calc.total * 0.16)}</span></div>
          <div class="rk-cart-total-line rk-cart-total-final"><span>TOTAL</span><span>${formatMxn(calc.totalConIva)} <small>MXN</small></span></div>
          ${building ? `<div class="rk-cart-total-line rk-cart-building-note"><span>+ configurando ahora</span><span>${formatMxn(building.price)}</span></div>` : ''}
        </div>

        ${planHtml}

        <div class="rk-cart-ctas">
          ${isResultado
            ? `<a href="${ctaHref}" target="_blank" rel="noopener" class="btn btn-primary rk-cart-pay">${ctaLabel} →</a>
               <div class="rk-cart-pay-note">${pay.plan === 'contado'
                 ? 'Pago en una sola exhibición · -20% descuento aplicado'
                 : 'Tu hunter te confirma el link de pago a meses por WhatsApp · cero compromiso hasta aprobar'}</div>`
            : `<button class="btn btn-primary rk-cart-pay" id="rk-cart-pay" type="button" ${ctaDisabled ? 'disabled' : ''}>${ctaLabel}</button>`
          }
          <button class="btn-ghost btn rk-cart-clear" id="rk-cart-clear" type="button">Vaciar carrito</button>
        </div>
      </div>
    `;
  }

  function renderConfigSummaryInline(config){
    if (!config) return '';
    const parts = [];
    for (const qid of Object.keys(config)) {
      const ans = config[qid];
      if (!ans) continue;
      if (Array.isArray(ans)) {
        parts.push(ans.map(o => L(o.label)).slice(0, 3).join(' · ') + (ans.length > 3 ? ' +' + (ans.length-3) : ''));
      } else if (ans.label) {
        parts.push(L(ans.label));
      }
    }
    return parts.slice(0, 3).join(' · ');
  }

  function bindCart(){
    // v10.1 · Payment plan radio · cambia plan + recalcula
    $$('#cart .payment-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        // Evitar doble-trigger del input radio interno
        if (e.target.tagName === 'INPUT') return;
        const plan = opt.dataset.plan;
        if (!plan || State.cart.paymentPlan === plan) return;
        State.cart.paymentPlan = plan;
        persistCart();
        refreshCart();
      });
    });

    // v10.1 · Aplicar código de descuento
    const discInput = $('#rk-cart-discount-input');
    const discApply = $('#rk-cart-discount-apply');
    const applyDiscount = () => {
      if (!discInput) return;
      const val = (discInput.value || '').trim();
      if (val === (State.cart.discountCode || '')) return;
      State.cart.discountCode = val;
      persistCart();
      refreshCart();
    };
    if (discApply) discApply.addEventListener('click', applyDiscount);
    if (discInput) discInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyDiscount(); }
    });

    // Edit items · v9 pasa tipo+addons al openSubflowModal para hidratar estado
    $$('.rk-cart-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.serviceId;
        const servicio = Object.assign({ id: sid }, findServicio(sid));
        if (!servicio.label) return;
        const existing = State.cart.servicios.find(s => s.id === sid);
        if (!existing) return;
        trackEditClick();
        openSubflowModal(servicio, {
          tipoId: existing.tipoId || null,
          addOnIds: existing.addOnIds || [],
          config: existing.config || {},
        });
      });
    });

    // Remove items
    $$('.rk-cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.serviceId;
        removeFromCart(sid);
        refreshCart();
        // Si estamos en catálogo, re-render para sync de "+/✓"
        if (parseHash().step === 'catalog') renderCatalog();
      });
    });

    // Clear cart
    const clearBtn = $('#rk-cart-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!confirm(L('¿Vaciar el carrito? Perderás los servicios agregados.'))) return;
      clearCart();
      State.folio = null;
      refreshCart();
      if (parseHash().step === 'catalog') renderCatalog();
    });

    // CTA principal del carrito (cuando no es resultado)
    const cta = $('#rk-cart-pay');
    if (cta) cta.addEventListener('click', () => {
      const datosOk = ['nombre','email','whatsapp'].every(k => State.cliente[k] && State.cliente[k].trim());
      if (!datosOk) {
        navigate('#/datos');
        return;
      }
      navigate('#/loading');
    });

    // v11 · Cart bottom-bar full-width en TODOS los viewports.
    // Header siempre clickable para expand/collapse.
    const header = document.querySelector('#cart .rk-cart-header');
    if (header) {
      header.addEventListener('click', () => {
        const cartEl = $('#cart');
        cartEl.classList.toggle('is-expanded');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  loadCart();
  // Asegurar que el DOM tenga los contenedores nuevos
  document.addEventListener('DOMContentLoaded', () => {
    // Si el quiz.html aún tiene #main pero no #wizard/#cart, inyectamos
    const main = document.getElementById('main');
    if (main && !document.getElementById('wizard')) {
      main.innerHTML = `
        <div class="rk-grid">
          <div class="rk-left" id="wizard"></div>
          <aside class="rk-right" id="cart"></aside>
        </div>
      `;
    }
    render();
  });
  // Si DOMContentLoaded ya pasó (script defer en footer)
  if (document.readyState !== 'loading') {
    const main = document.getElementById('main');
    if (main && !document.getElementById('wizard')) {
      main.innerHTML = `
        <div class="rk-grid">
          <div class="rk-left" id="wizard"></div>
          <aside class="rk-right" id="cart"></aside>
        </div>
      `;
    }
    render();
  }

  // Re-render cuando cambien preferencias (idioma, moneda, tema)
  window.addEventListener('ibisne:prefs', () => {
    const step = parseHash().step;
    if (step) render();
  });

})();

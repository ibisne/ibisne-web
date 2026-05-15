/* ===================================================================
   assets/quiz/ui.js — iBisne v6.0.0 · Cotizador modular tipo carrito
   ===================================================================
   Modelo nuevo: el cliente arma su carrito sumando servicios del
   catálogo modular. Categorías intercambiables. Layout permanente
   (wizard izquierda · carrito sticky derecha · sin bottom-bar).

   Flow:
     #/context    → sector + ya tengo (step rápido)
     #/catalog    → catálogo de servicios (cliente agrega)
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
  // STATE
  // ═══════════════════════════════════════════════════════════════════
  const STORAGE_KEY = 'ibisne.cart.v6';

  const State = {
    // Contexto del cliente (step 1)
    sector: null,                 // ej: 'arquitecto'
    yaTengo: [],                  // ['identidad', 'web']

    // Datos del cliente (step datos)
    cliente: { nombre: '', email: '', whatsapp: '', empresa: '' },

    // Carrito (acumulado del catálogo)
    cart: {
      servicios: [],              // [{ id, label, base, config, calculatedPrice }]
      modificadores: { plazo: 'normal', modo: 'estandar' },
    },

    // UI state · navegación jerárquica del catálogo (v6.0.2)
    catalogPath: { mega: null, sub: null }, // mega | sub | null = grid raíz
    activeModal: null,            // { servicioId, current: {qid: ans} }
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
        sector: State.sector,
        yaTengo: State.yaTengo,
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
      if (saved.sector)   State.sector = saved.sector;
      if (saved.yaTengo)  State.yaTengo = saved.yaTengo;
      if (saved.cliente)  State.cliente = Object.assign(State.cliente, saved.cliente);
      if (saved.cart)     State.cart = Object.assign(State.cart, saved.cart);
    } catch(_){}
  }

  // Helper: dado un service-id, encuentra el servicio en pricing.servicios
  // (estructura plana indexada por ID en v6.0.2)
  function findServicio(servicioId){
    const PRICING = window.IBISNE_PRICING;
    if (!PRICING || !PRICING.servicios) return null;
    return PRICING.servicios[servicioId] || null;
  }
  function clearCart(){
    State.cart = { servicios: [], modificadores: { plazo: 'normal', modo: 'estandar' } };
    persistCart();
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
    const isInt = num === Math.floor(num);
    if (window.IBISNE_PREFS) return window.IBISNE_PREFS.format(num);
    return '$ ' + num.toLocaleString('en-US', isInt
      ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  function iconCard(id){
    if (!window.IBISNE_ICONS || !id) return '';
    return window.IBISNE_ICONS.card(id) || '';
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
  function persistLead(payload){
    try {
      payload = payload || {};
      payload.heuristics = computeLeadScore();
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
  // COMPUTE CART
  // ═══════════════════════════════════════════════════════════════════
  // Suma el carrito aplicando modificadores globales.
  // Retorna: { subtotal, modPlazo, modPlazoLabel, modModo, modModoLabel,
  //            total, totalConIva, lineItems, flags, team, tiempo, stack,
  //            speed, speedZone, speedText, tier }
  function computeCart(){
    const PRICING = window.IBISNE_PRICING;
    const cart = State.cart;
    let subtotal = 0;
    const flags = new Set();
    const lineItems = [];

    for (const s of cart.servicios) {
      const price = s.calculatedPrice || s.base || 0;
      subtotal += price;
      lineItems.push({
        servicioId: s.id,
        label: s.label,
        price: price,
        config: s.config || {},
        icon: s.icon,
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

    // Modificadores globales
    const plazoCfg = PRICING.modificadores.plazo[cart.modificadores.plazo] || PRICING.modificadores.plazo.normal;
    const modoCfg  = PRICING.modificadores.modo[cart.modificadores.modo]   || PRICING.modificadores.modo.estandar;

    const totalConPlazo = subtotal * plazoCfg.mul;
    const total = totalConPlazo * modoCfg.mul;
    const totalConIva = total * 1.16;

    // Tier / equipo / velocidad / stack / tiempo
    const tier      = PRICING.getTier(total);
    const team      = PRICING.getTeam(total, flags);
    const speed     = PRICING.getSpeed(total, flags, plazoCfg.mul, modoCfg.mul);
    const speedZone = PRICING.getSpeedZone(speed);
    const speedText = PRICING.getSpeedText(speed);
    const stack     = PRICING.getStack(cart.servicios);
    const tiempo    = PRICING.getTime(cart.servicios);

    return {
      subtotal, total, totalConIva,
      modPlazo: cart.modificadores.plazo, modPlazoLabel: plazoCfg.label, modPlazoMul: plazoCfg.mul, modPlazoSuffix: plazoCfg.metaSuffix,
      modModo:  cart.modificadores.modo,  modModoLabel:  modoCfg.label,  modModoMul:  modoCfg.mul,  modModoSuffix:  modoCfg.metaSuffix,
      lineItems, flags, team, tier, speed, speedZone, speedText, stack, tiempo,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROUTER
  // ═══════════════════════════════════════════════════════════════════
  function parseHash(){
    let h = (location.hash || '#/').slice(2);
    const parts = h.split('/').filter(Boolean);
    return { step: parts[0] || 'context' };
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

    // Backward compat: rutas viejas redirigen al nuevo flow
    if (step === 'servicio' || step === 'classifier' || step === 'puertas' ||
        step === 'socio' || step === 'inversor' || step === 'discovery') {
      navigate('#/catalog');
      return;
    }

    if (step === 'context')    return renderContext();
    if (step === 'catalog')    return renderCatalog();
    if (step === 'datos')      return renderDatos();
    if (step === 'loading')    return renderLoading();
    if (step === 'resultado')  return renderResultado();

    navigate('#/context');
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1 · renderContext (sector + ya tengo)
  // ═══════════════════════════════════════════════════════════════════
  function renderContext(){
    setProgress(20);
    trackStepShown('context');
    const PRICING = window.IBISNE_PRICING;

    const sectoresHtml = PRICING.sectores.map(s => `
      <button class="sector-chip ${State.sector === s.id ? 'is-selected' : ''}" data-sector="${s.id}" type="button">
        <span class="sector-chip-icon">${iconHtml(s.icon, 'line')}</span>
        <span class="sector-chip-label">${L(s.label)}</span>
      </button>
    `).join('');

    const yaTengoHtml = PRICING.yaTengo.map(y => `
      <button class="yatengo-chip ${State.yaTengo.indexOf(y.id) >= 0 ? 'is-selected' : ''}" data-yatengo="${y.id}" type="button">
        <span class="yatengo-chip-icon">${iconHtml(y.icon, 'line')}</span>
        <span class="yatengo-chip-label">${L(y.label)}</span>
      </button>
    `).join('');

    $('#wizard').innerHTML = `
      <div class="ctx-screen">
        <div class="eyebrow">— PASO 1 DE 3 · CONTEXTO RÁPIDO</div>
        <h2 class="ctx-title">Cuéntame de tu negocio</h2>
        <p class="ctx-help">Para sugerirte mejor lo que necesitas. Toma 10 segundos.</p>

        <div class="ctx-section">
          <div class="ctx-question">¿A qué te dedicas?</div>
          <div class="sector-grid">${sectoresHtml}</div>
        </div>

        <div class="ctx-section">
          <div class="ctx-question">¿Qué ya tienes? <span class="ctx-optional">(opcional · marca lo que tengas)</span></div>
          <div class="yatengo-grid">${yaTengoHtml}</div>
        </div>

        <div class="ctx-actions">
          <a href="index.html" class="btn-ghost btn">← Volver al inicio</a>
          <button class="btn btn-primary" id="ctx-continue" type="button" ${State.sector ? '' : 'disabled'}>Continuar →</button>
        </div>
      </div>
    `;

    // Sector · single select
    $$('#wizard .sector-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        State.sector = btn.dataset.sector;
        trackStepChange();
        $$('#wizard .sector-chip').forEach(b => b.classList.toggle('is-selected', b.dataset.sector === State.sector));
        $('#ctx-continue').disabled = false;
        persistCart();
      });
    });

    // YaTengo · multi-select toggle
    $$('#wizard .yatengo-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.yatengo;
        const idx = State.yaTengo.indexOf(id);
        if (idx >= 0) State.yaTengo.splice(idx, 1);
        else          State.yaTengo.push(id);
        btn.classList.toggle('is-selected');
        trackStepChange();
        persistCart();
      });
    });

    $('#ctx-continue').addEventListener('click', () => {
      if (!State.sector) return;
      scheduleAdvance('#/catalog', 80);
    });

    refreshCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 · renderCatalog (dispatcher · 3 niveles de navegación)
  // ═══════════════════════════════════════════════════════════════════
  //   Nivel 1: 4 mega-categorías        (catalogPath = {})
  //   Nivel 2: sub-categorías de mega   (catalogPath = {mega})
  //   Nivel 3: servicios de sub o mega  (catalogPath = {mega, sub})
  // ═══════════════════════════════════════════════════════════════════
  function renderCatalog(){
    setProgress(50);
    trackStepShown('catalog');
    const PRICING = window.IBISNE_PRICING;
    const path = State.catalogPath || (State.catalogPath = { mega: null, sub: null });

    // Nivel 3 · servicios (de una sub o de una mega sin subs)
    if (path.mega) {
      const mega = PRICING.megaCategorias.find(m => m.id === path.mega);
      if (!mega) { State.catalogPath = { mega: null, sub: null }; return renderCatalog(); }

      // Si la mega tiene subs y NO hay sub elegida → mostrar grid de subs
      if (mega.subCategorias && !path.sub) {
        return renderSubGrid(mega);
      }

      // Si NO tiene subs (auto, training) o YA hay sub elegida → mostrar servicios
      let title, subtitle, serviciosIds, icon;
      if (mega.subCategorias && path.sub) {
        const sub = mega.subCategorias.find(s => s.id === path.sub);
        if (!sub) { path.sub = null; return renderCatalog(); }
        title    = sub.label;
        subtitle = sub.subtitle;
        icon     = sub.icon;
        serviciosIds = sub.serviciosIds || [];
      } else {
        title    = mega.label;
        subtitle = mega.subtitle;
        icon     = mega.icon;
        serviciosIds = mega.serviciosIds || [];
      }
      return renderServicesList(title, subtitle, icon, serviciosIds, mega, path.sub ? mega.subCategorias.find(s=>s.id===path.sub) : null);
    }

    // Nivel 1 · grid de 4 mega-categorías
    return renderMegaGrid();
  }

  // ── Nivel 1 · 4 mega-categorías ──────────────────────────────────────
  function renderMegaGrid(){
    const PRICING = window.IBISNE_PRICING;
    const sector = State.sector;
    const serviciosInCart = new Set(State.cart.servicios.map(s => s.id));

    // Re-orden por relevancia al sector
    const ordered = [...PRICING.megaCategorias].sort((a, b) => {
      const aRel = countRelevantInMega(a, sector);
      const bRel = countRelevantInMega(b, sector);
      return bRel - aRel;
    });

    const cardsHtml = ordered.map(mega => {
      const allIds = collectMegaServiceIds(mega);
      const countInCart = allIds.filter(id => serviciosInCart.has(id)).length;
      const relCount = sector ? allIds.filter(id => {
        const s = PRICING.servicios[id];
        return s && (s.tags || []).indexOf(sector) >= 0;
      }).length : 0;
      const isRel = relCount > 0;

      // Preview: 3 sub-categorías o servicios destacados
      let previewItems = [];
      if (mega.subCategorias) {
        previewItems = mega.subCategorias.map(s => ({ label: s.label, count: (s.serviciosIds || []).length })).slice(0, 4);
      } else {
        previewItems = (mega.serviciosIds || []).slice(0, 3).map(id => {
          const s = PRICING.servicios[id];
          return s ? { label: s.label, price: formatMxn(s.base) } : null;
        }).filter(Boolean);
      }
      const previewHtml = previewItems.map(p =>
        p.price
          ? `<li>${L(p.label)} <span class="cat-card-preview-price">${p.price}</span></li>`
          : `<li>${L(p.label)} <span class="cat-card-preview-count">${p.count}</span></li>`
      ).join('');

      return `
        <button class="mega-card ${isRel ? 'is-relevant' : ''} ${countInCart > 0 ? 'has-items' : ''}" data-mega-open="${mega.id}" type="button">
          <div class="mega-card-head">
            <div class="mega-card-icon">${iconHtml(mega.icon, 'line')}</div>
            ${countInCart > 0 ? `<span class="mega-card-count">${countInCart} en carrito</span>` : ''}
            ${isRel && countInCart === 0 ? '<span class="mega-card-relevant">para ti</span>' : ''}
          </div>
          <div class="mega-card-label">${L(mega.label)}</div>
          <div class="mega-card-summary">${L(mega.summary || mega.subtitle)}</div>
          <div class="mega-card-subtitle">${L(mega.subtitle)}</div>
          <ul class="mega-card-preview">${previewHtml}</ul>
          <div class="mega-card-foot">
            <span class="mega-card-cta">Explorar</span>
            <span class="mega-card-arrow">→</span>
          </div>
        </button>
      `;
    }).join('');

    $('#wizard').innerHTML = `
      <div class="cat-screen">
        <div class="eyebrow">— PASO 2 DE 3 · ARMA TU PROYECTO</div>
        <h2 class="cat-title">¿Qué necesitas armar?</h2>
        <p class="cat-help">
          Elige por dónde empezar. ${sector ? 'Te marcamos <span class="cat-help-tag">para ti</span> lo más relevante para ' + sectorLabel(sector) + '.' : 'Mezcla categorías sin problema.'}
        </p>
        <div class="mega-grid">${cardsHtml}</div>
        <div class="cat-actions">
          <button class="btn-ghost btn" data-prev type="button">← Atrás</button>
          <button class="btn btn-primary" id="cat-continue" type="button" ${State.cart.servicios.length === 0 ? 'disabled' : ''}>
            ${State.cart.servicios.length === 0 ? 'Agrega al menos un servicio' : 'Continuar a tus datos →'}
          </button>
        </div>
      </div>
    `;

    $$('#wizard [data-mega-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        State.catalogPath = { mega: btn.dataset.megaOpen, sub: null };
        trackStepChange();
        renderCatalog();
      });
    });
    $('[data-prev]')?.addEventListener('click', () => { trackNavBack(); navigate('#/context'); });
    $('#cat-continue').addEventListener('click', () => {
      if (State.cart.servicios.length === 0) return;
      scheduleAdvance('#/datos', 80);
    });
    refreshCart();
  }

  function countRelevantInMega(mega, sector){
    if (!sector) return 0;
    const PRICING = window.IBISNE_PRICING;
    const ids = collectMegaServiceIds(mega);
    return ids.filter(id => {
      const s = PRICING.servicios[id];
      return s && (s.tags || []).indexOf(sector) >= 0;
    }).length;
  }
  function collectMegaServiceIds(mega){
    if (mega.subCategorias) {
      return mega.subCategorias.flatMap(s => s.serviciosIds || []);
    }
    return mega.serviciosIds || [];
  }

  // ── Nivel 2 · sub-categorías de una mega ─────────────────────────────
  function renderSubGrid(mega){
    const PRICING = window.IBISNE_PRICING;
    const sector = State.sector;
    const serviciosInCart = new Set(State.cart.servicios.map(s => s.id));

    const cardsHtml = (mega.subCategorias || []).map(sub => {
      const ids = sub.serviciosIds || [];
      const countInCart = ids.filter(id => serviciosInCart.has(id)).length;
      const relCount = sector ? ids.filter(id => {
        const s = PRICING.servicios[id];
        return s && (s.tags || []).indexOf(sector) >= 0;
      }).length : 0;
      const isRel = relCount > 0;

      // Preview: 3 servicios con precio
      const preview = ids.slice(0, 3).map(id => PRICING.servicios[id]).filter(Boolean);
      const previewHtml = preview.map(s => `<li>${L(s.label)} <span class="cat-card-preview-price">${formatMxn(s.base)}</span></li>`).join('');

      return `
        <button class="sub-card ${isRel ? 'is-relevant' : ''} ${countInCart > 0 ? 'has-items' : ''}" data-sub-open="${sub.id}" type="button">
          <div class="sub-card-head">
            <div class="sub-card-icon">${iconHtml(sub.icon, 'line')}</div>
            ${countInCart > 0 ? `<span class="sub-card-count">${countInCart}</span>` : ''}
          </div>
          <div class="sub-card-label">${L(sub.label)}</div>
          <div class="sub-card-subtitle">${L(sub.subtitle)}</div>
          <ul class="sub-card-preview">${previewHtml}</ul>
          <div class="sub-card-foot">${ids.length} servicios <span>→</span></div>
        </button>
      `;
    }).join('');

    $('#wizard').innerHTML = `
      <div class="cat-detail-screen">
        <button class="cat-detail-back" id="cat-back-mega" type="button">
          <span class="cat-detail-back-arrow">←</span> Volver a categorías
        </button>
        <div class="cat-detail-head">
          <div class="cat-detail-icon">${iconHtml(mega.icon, 'line')}</div>
          <div>
            <h2 class="cat-detail-title">${L(mega.label)}</h2>
            <p class="cat-detail-subtitle">${L(mega.subtitle)} · elige un área</p>
          </div>
        </div>
        <div class="sub-grid">${cardsHtml}</div>
        <div class="cat-actions">
          <button class="btn-ghost btn" id="cat-back-mega-2" type="button">← Volver a categorías</button>
          <button class="btn btn-primary" id="cat-continue" type="button" ${State.cart.servicios.length === 0 ? 'disabled' : ''}>
            ${State.cart.servicios.length === 0 ? 'Agrega al menos un servicio' : 'Continuar a tus datos →'}
          </button>
        </div>
      </div>
    `;

    $$('#wizard [data-sub-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        State.catalogPath = { mega: mega.id, sub: btn.dataset.subOpen };
        trackStepChange();
        renderCatalog();
      });
    });
    const goBackToMega = () => {
      State.catalogPath = { mega: null, sub: null };
      trackStepChange();
      renderCatalog();
    };
    $('#cat-back-mega').addEventListener('click', goBackToMega);
    $('#cat-back-mega-2').addEventListener('click', goBackToMega);
    $('#cat-continue').addEventListener('click', () => {
      if (State.cart.servicios.length === 0) return;
      scheduleAdvance('#/datos', 80);
    });
    refreshCart();
  }

  // ── Nivel 3 · lista de servicios (de una sub o de una mega sin subs) ─
  function renderServicesList(title, subtitle, icon, serviciosIds, mega, sub){
    const PRICING = window.IBISNE_PRICING;
    const sector = State.sector;
    const serviciosInCart = new Set(State.cart.servicios.map(s => s.id));

    // Orden: relevantes primero, luego tier, luego precio
    const TIER_ORDER = { micro: 1, medio: 2, grande: 3 };
    const servs = serviciosIds
      .map(id => Object.assign({ id }, PRICING.servicios[id]))
      .filter(s => s && s.label)
      .sort((a, b) => {
        const aRel = sector && (a.tags || []).indexOf(sector) >= 0 ? 0 : 1;
        const bRel = sector && (b.tags || []).indexOf(sector) >= 0 ? 0 : 1;
        if (aRel !== bRel) return aRel - bRel;
        const aT = TIER_ORDER[a.tier] || 99;
        const bT = TIER_ORDER[b.tier] || 99;
        if (aT !== bT) return aT - bT;
        return (a.base || 0) - (b.base || 0);
      });

    const servsHtml = servs.map(s => {
      const inCart = serviciosInCart.has(s.id);
      const isRel = sector && (s.tags || []).indexOf(sector) >= 0;
      return `
        <div class="service-row ${inCart ? 'is-incart' : ''} ${isRel ? 'is-relevant' : ''}" data-service-id="${s.id}">
          <div class="service-icon">${iconHtml(s.icon, 'line')}</div>
          <div class="service-info">
            <div class="service-label">
              ${L(s.label)}
              ${isRel ? '<span class="service-relevant">para ti</span>' : ''}
              <span class="service-tier service-tier-${s.tier}">${s.tier === 'micro' ? 'rápido' : (s.tier === 'medio' ? 'medio' : 'completo')}</span>
            </div>
            ${s.subtitle ? `<div class="service-subtitle">${L(s.subtitle)}</div>` : ''}
            <div class="service-meta">
              <span class="service-price">desde ${formatMxn(s.base)}</span>
              <span class="service-time">· ${L(s.tiempo)}</span>
            </div>
          </div>
          <button class="service-add ${inCart ? 'is-added' : ''}" data-service-id="${s.id}" type="button" aria-label="${inCart ? 'Editar' : 'Agregar al carrito'}">
            ${inCart ? '✓' : '+'}
          </button>
        </div>
      `;
    }).join('');

    // Breadcrumb visible cuando estamos en sub
    const breadcrumb = sub
      ? `<div class="cat-breadcrumb"><a href="#" id="bc-root">Categorías</a> › <a href="#" id="bc-mega">${L(mega.label)}</a> › <span>${L(sub.label)}</span></div>`
      : `<div class="cat-breadcrumb"><a href="#" id="bc-root">Categorías</a> › <span>${L(mega.label)}</span></div>`;

    $('#wizard').innerHTML = `
      <div class="cat-detail-screen">
        <button class="cat-detail-back" id="cat-back" type="button">
          <span class="cat-detail-back-arrow">←</span> ${sub ? 'Volver a ' + L(mega.label) : 'Volver a categorías'}
        </button>
        ${breadcrumb}
        <div class="cat-detail-head">
          <div class="cat-detail-icon">${iconHtml(icon, 'line')}</div>
          <div>
            <h2 class="cat-detail-title">${L(title)}</h2>
            <p class="cat-detail-subtitle">${L(subtitle)} · ${servs.length} servicios disponibles</p>
          </div>
        </div>
        <div class="cat-detail-services">${servsHtml}</div>
        <div class="cat-actions">
          <button class="btn-ghost btn" id="cat-back-2" type="button">← ${sub ? 'Volver a ' + L(mega.label) : 'Volver a categorías'}</button>
          <button class="btn btn-primary" id="cat-continue" type="button" ${State.cart.servicios.length === 0 ? 'disabled' : ''}>
            ${State.cart.servicios.length === 0 ? 'Agrega al menos un servicio' : 'Continuar a tus datos →'}
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
    $('#cat-back-2').addEventListener('click', goUp);
    $('#bc-root')?.addEventListener('click', goToRoot);
    $('#bc-mega')?.addEventListener('click', goToMegaLevel);

    // Click "+/✓" agrega/edita
    $$('#wizard .service-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sid = btn.dataset.serviceId;
        const servicio = Object.assign({ id: sid }, findServicio(sid));
        if (!servicio.label) return;
        const inCart = State.cart.servicios.find(s => s.id === sid);
        if (inCart) {
          if (servicio.subflow) {
            trackEditClick();
            openSubflowModal(servicio, inCart.config);
          } else {
            removeFromCart(sid);
            renderCatalog();
          }
        } else {
          if (servicio.subflow) {
            openSubflowModal(servicio, null);
          } else {
            addToCart(servicio, {});
            renderCatalog();
          }
        }
      });
    });
    $$('#wizard .service-row').forEach(row => {
      row.addEventListener('click', () => {
        const btn = row.querySelector('.service-add');
        if (btn) btn.click();
      });
    });
    $('#cat-continue').addEventListener('click', () => {
      if (State.cart.servicios.length === 0) return;
      scheduleAdvance('#/datos', 80);
    });
    refreshCart();
  }

  // (renderCategoryDetail eliminada en v6.0.2 · reemplazada por renderServicesList)

  function sectorLabel(id){
    const PRICING = window.IBISNE_PRICING;
    const s = (PRICING.sectores || []).find(x => x.id === id);
    return s ? L(s.label).toLowerCase() : '';
  }

  // ═══════════════════════════════════════════════════════════════════
  // CART · agregar / editar / quitar
  // ═══════════════════════════════════════════════════════════════════
  function calcSubflowPrice(servicio, config){
    const PRICING = window.IBISNE_PRICING;
    const sub = PRICING.subflow[servicio.id] || [];
    let total = servicio.base || 0;
    for (const q of sub) {
      const ans = config[q.id];
      if (!ans) continue;
      if (Array.isArray(ans)) {
        ans.forEach(o => { total += o.add || 0; });
      } else if (typeof ans === 'object') {
        total += ans.add || 0;
      }
    }
    return total;
  }

  function addToCart(servicio, config){
    const price = calcSubflowPrice(servicio, config);
    State.cart.servicios.push({
      id: servicio.id,
      label: servicio.label,
      base: servicio.base,
      tier: servicio.tier,
      tiempo: servicio.tiempo,
      icon: servicio.icon,
      subtitle: servicio.subtitle,
      config: config,
      calculatedPrice: price,
    });
    persistCart();
  }
  function updateCart(servicioId, config){
    const idx = State.cart.servicios.findIndex(s => s.id === servicioId);
    if (idx < 0) return;
    const servicio = findServicio(servicioId);
    if (!servicio) return;
    State.cart.servicios[idx].config = config;
    State.cart.servicios[idx].calculatedPrice = calcSubflowPrice(servicio, config);
    persistCart();
  }
  function removeFromCart(servicioId){
    State.cart.servicios = State.cart.servicios.filter(s => s.id !== servicioId);
    persistCart();
  }

  // ═══════════════════════════════════════════════════════════════════
  // MODAL SUB-FLOW (preguntas de un servicio)
  // ═══════════════════════════════════════════════════════════════════
  function openSubflowModal(servicio, existingConfig){
    const PRICING = window.IBISNE_PRICING;
    const questions = PRICING.subflow[servicio.id] || [];
    if (questions.length === 0) {
      // No tiene sub-flow → agregar/actualizar directo
      if (existingConfig) updateCart(servicio.id, {});
      else                addToCart(servicio, {});
      renderCatalog();
      return;
    }

    State.activeModal = {
      servicioId: servicio.id,
      config: existingConfig ? JSON.parse(JSON.stringify(existingConfig)) : {},
      isEdit: !!existingConfig,
    };
    renderSubflowModal(servicio, questions);
  }

  function renderSubflowModal(servicio, questions){
    const config = State.activeModal.config;
    const isEdit = State.activeModal.isEdit;

    const questionsHtml = questions.map(q => {
      const isMulti = q.multi === true;
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

      const opcionesHtml = q.opciones.map(o => {
        let meta = null;
        if (o.add !== undefined && o.add !== 0) {
          meta = (o.add > 0 ? '+ ' : '') + formatMxn(o.add);
        } else {
          meta = 'Incluido';
        }
        const isSel = (isMulti && selIds.has(o.id)) || (!isMulti && selIds.has(o.id));
        const isRec = recommendedIds.has(o.id);
        return `
          <button class="sf-option ${isSel ? 'is-selected' : ''} ${isRec ? 'is-recommended' : ''}" data-q="${q.id}" data-opt="${o.id}" data-multi="${isMulti}" type="button">
            ${isRec ? '<span class="option-badge-recomendada">RECOMENDADA</span>' : ''}
            <span class="sf-option-label">${L(o.label)}</span>
            ${o.subtitle ? `<span class="sf-option-subtitle">${L(o.subtitle)}</span>` : ''}
            <span class="sf-option-meta">${meta}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="sf-question" data-q="${q.id}">
          <div class="sf-question-label">${L(q.label)}${q.help ? ` <span class="sf-question-help">· ${L(q.help)}</span>` : ''}</div>
          <div class="sf-options ${isMulti ? 'is-multi' : ''}">${opcionesHtml}</div>
        </div>
      `;
    }).join('');

    const liveTotal = calcSubflowPrice(servicio, config);

    // Si ya hay un modal abierto, reemplazar contenido. Si no, crear.
    let modal = $('#sf-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sf-modal';
      modal.className = 'sf-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="sf-backdrop" data-sf-close></div>
      <div class="sf-panel">
        <div class="sf-head">
          <div class="sf-eyebrow">— ${isEdit ? 'EDITAR' : 'CONFIGURAR'}</div>
          <div class="sf-title">${L(servicio.label)}</div>
          <div class="sf-subtitle">${L(servicio.subtitle || '')}</div>
          <button class="sf-close" data-sf-close type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="sf-body">
          ${questionsHtml}
        </div>
        <div class="sf-foot">
          <div class="sf-total">
            <span class="sf-total-label">Total del servicio</span>
            <span class="sf-total-amount" id="sf-total-amount">${formatMxn(liveTotal)}</span>
          </div>
          <div class="sf-foot-actions">
            <button class="btn-ghost btn" data-sf-close type="button">Cancelar</button>
            <button class="btn btn-primary" id="sf-confirm" type="button">
              ${isEdit ? 'Actualizar en carrito' : 'Agregar al carrito'} →
            </button>
          </div>
        </div>
      </div>
    `;

    // Esc cierra
    function escHandler(e){ if (e.key === 'Escape') closeSubflowModal(); }
    document.addEventListener('keydown', escHandler);
    modal._escHandler = escHandler;

    // Bind close
    modal.querySelectorAll('[data-sf-close]').forEach(b => b.addEventListener('click', closeSubflowModal));

    // Bind options
    modal.querySelectorAll('.sf-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.q;
        const oid = btn.dataset.opt;
        const isMulti = btn.dataset.multi === 'true';
        const q = questions.find(x => x.id === qid);
        const o = q.opciones.find(x => x.id === oid);

        if (isMulti) {
          const list = config[qid] || [];
          const exists = list.find(x => x.id === oid);
          config[qid] = exists ? list.filter(x => x.id !== oid) : [...list, o];
          // Si cambió metodos_pago, resetea pasarelas para que se recalcule
          if (qid === 'metodos_pago') config.pasarelas = null;
        } else {
          config[qid] = o;
        }
        renderSubflowModal(servicio, questions);
      });
    });

    // Confirm
    $('#sf-confirm').addEventListener('click', () => {
      // Validación: todas las preguntas con respuesta (multi acepta vacío opcional)
      for (const q of questions) {
        const ans = config[q.id];
        if (q.multi) continue; // multi siempre OK
        if (!ans) {
          alert('Falta responder: ' + L(q.label));
          return;
        }
      }
      if (isEdit) updateCart(servicio.id, config);
      else        addToCart(servicio, config);
      closeSubflowModal();
      renderCatalog();
    });

    // Focus el primer botón
    setTimeout(() => {
      const first = modal.querySelector('.sf-option');
      if (first) first.focus();
    }, 50);
  }

  function closeSubflowModal(){
    const modal = $('#sf-modal');
    if (modal) {
      if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler);
      modal.remove();
    }
    State.activeModal = null;
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
      <div class="datos-screen">
        <div class="eyebrow">— PASO 3 DE 3 · TUS DATOS</div>
        <h2 class="datos-title">Falta poco para ver tu cotización</h2>
        <p class="datos-help">Te enviamos la propuesta firmable + folio. Te respondemos en menos de 24 horas. Cero spam · cero llamadas no solicitadas.</p>
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
        <p class="datos-privacy">🔒 Tus datos quedan privados · solo nosotros y tú · ver <a href="legal/privacidad.html" target="_blank">aviso de privacidad</a></p>
        <div class="datos-actions">
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

      // Clonar como overlay fixed
      const overlay = document.createElement('div');
      overlay.className = 'rk-loading-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = loaderEl.outerHTML;
      document.body.appendChild(overlay);

      navigate('#/resultado');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('is-out'));
      });
      setTimeout(() => { try { overlay.remove(); } catch(_){} }, 700);
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
        sector: State.sector, yaTengo: State.yaTengo,
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

    // WhatsApp message
    const itemsText = calc.lineItems.map(li => `• ${li.label} · ${formatMxn(li.price)}`).join('\n');
    const waMsg = `Hola, vengo del cotizador iBisne con folio #${folio}.\n\n${itemsText}\n\nSubtotal: ${formatMxn(calc.subtotal)}\nTotal con IVA: ${formatMxn(calc.totalConIva)}\n\n${calc.modPlazoSuffix ? 'Plazo: ' + calc.modPlazoLabel + '\n' : ''}${calc.modModoSuffix ? 'Modo: ' + calc.modModoLabel + '\n' : ''}\nQuiero hablar para precisar el alcance.`;
    const waUrl = `https://wa.me/523329575274?text=${encodeURIComponent(waMsg)}`;

    $('#wizard').innerHTML = `
      <div class="result-screen result-checkout">
        <div class="rk-head">
          <div class="rk-folio">— FOLIO #${folio} · INDICATIVO · SUJETO A DISCOVERY</div>
          <h2 class="rk-title">${datosCliente.nombre ? `${datosCliente.nombre.split(' ')[0]}, t` : 'T'}u cotización está lista.</h2>
          <p class="rk-sub">Revisa el desglose, confirma con un pago de anticipo y arrancamos. Cero compromisos hasta que tú decidas.</p>
        </div>

        <article class="rk-card rk-project">
          <div class="rk-card-eyebrow">— TU PROYECTO</div>
          <div class="rk-project-head">
            <div class="rk-project-name">${calc.lineItems.length} servicio${calc.lineItems.length === 1 ? '' : 's'} configurado${calc.lineItems.length === 1 ? '' : 's'}</div>
            <div class="rk-project-vertical">${sectorLabel(State.sector) ? 'Para ' + sectorLabel(State.sector) + ' · ' : ''}Tier ${calc.tier.label}</div>
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
          <div class="rk-card-eyebrow">— DESGLOSE</div>
          <div class="rk-lines">${lineItemsHtml}</div>
          <div class="rk-totals">
            <div class="rk-total-row"><span>Subtotal</span><span>${formatMxn(calc.subtotal)}</span></div>
            ${calc.modPlazoSuffix ? `<div class="rk-total-row"><span>${L(calc.modPlazoLabel)}</span><span>${calc.modPlazoSuffix}</span></div>` : ''}
            ${calc.modModoSuffix ? `<div class="rk-total-row"><span>${L(calc.modModoLabel)}</span><span>${calc.modModoSuffix}</span></div>` : ''}
            <div class="rk-total-row"><span>IVA 16%</span><span>${formatMxn(calc.total * 0.16)}</span></div>
            <div class="rk-total-row rk-total-final"><span>TOTAL MXN</span><span>${formatMxn(calc.totalConIva)}</span></div>
          </div>
        </article>

        <article class="rk-card rk-highlights">
          <div class="rk-card-eyebrow">— LO QUE INCLUYE TRABAJAR CON iBISNE</div>
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
          <div class="rk-card-eyebrow">— PREGUNTAS COMUNES</div>
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
  function refreshCart(){
    const cartEl = $('#cart');
    if (!cartEl) return;
    cartEl.innerHTML = renderCartContent();
    bindCart();
  }

  function renderCartContent(){
    const calc = computeCart();
    const empty = State.cart.servicios.length === 0;
    const datosOk = ['nombre','email','whatsapp'].every(k => State.cliente[k] && State.cliente[k].trim());
    const isResultado = parseHash().step === 'resultado';

    if (empty) {
      return `
        <div class="rk-cart">
          <div class="rk-cart-header">
            <span class="rk-cart-eyebrow">— TU CARRITO</span>
          </div>
          <div class="rk-cart-empty">
            <div class="rk-cart-empty-icon">${iconHtml('ecommerce','line')}</div>
            <p class="rk-cart-empty-title">Tu carrito está vacío</p>
            <p class="rk-cart-empty-sub">Empieza eligiendo qué necesitas en el catálogo →</p>
          </div>
        </div>
      `;
    }

    const itemsHtml = State.cart.servicios.map(s => {
      const cfg = renderConfigSummaryInline(s.config);
      return `
        <li class="rk-cart-item" data-service-id="${s.id}">
          <div class="rk-cart-item-icon">${iconHtml(s.icon, 'line')}</div>
          <div class="rk-cart-item-info">
            <div class="rk-cart-item-label">${L(s.label)}</div>
            ${cfg ? `<div class="rk-cart-item-config">${cfg}</div>` : ''}
            <div class="rk-cart-item-price">${formatMxn(s.calculatedPrice || s.base)}</div>
          </div>
          <div class="rk-cart-item-actions">
            <button class="rk-cart-edit" data-service-id="${s.id}" type="button" aria-label="Editar">${iconHtml('edit','line') || '✎'}</button>
            <button class="rk-cart-remove" data-service-id="${s.id}" type="button" aria-label="Quitar">×</button>
          </div>
        </li>
      `;
    }).join('');

    const PRICING = window.IBISNE_PRICING;
    const plazoOpts = Object.keys(PRICING.modificadores.plazo).map(k => {
      const c = PRICING.modificadores.plazo[k];
      return `<option value="${k}" ${State.cart.modificadores.plazo === k ? 'selected' : ''}>${L(c.label)}${c.metaSuffix ? ' · ' + c.metaSuffix : ''}</option>`;
    }).join('');
    const modoOpts = Object.keys(PRICING.modificadores.modo).map(k => {
      const c = PRICING.modificadores.modo[k];
      return `<option value="${k}" ${State.cart.modificadores.modo === k ? 'selected' : ''}>${L(c.label)}${c.metaSuffix ? ' · ' + c.metaSuffix : ''}</option>`;
    }).join('');

    const ctaLabel = isResultado
      ? 'Pagar anticipo · ' + formatMxn(calc.totalConIva * 0.5)
      : (datosOk ? 'Ver mi cotización →' : 'Continúa para ver el total');
    const ctaHref = isResultado ? 'https://paypal.me/iBisne' : '';
    const ctaDisabled = !isResultado && !datosOk;

    return `
      <div class="rk-cart">
        <div class="rk-cart-header">
          <span class="rk-cart-eyebrow">— TU CARRITO</span>
          <span class="rk-cart-count">${State.cart.servicios.length} servicio${State.cart.servicios.length === 1 ? '' : 's'}</span>
        </div>

        <ul class="rk-cart-items">${itemsHtml}</ul>

        <div class="rk-cart-toggles">
          <div class="rk-cart-toggle-label">— Ajusta tu cotización</div>
          <div class="rk-cart-toggle">
            <label>Tiempo</label>
            <select id="rk-cart-plazo">${plazoOpts}</select>
          </div>
          <div class="rk-cart-toggle">
            <label>Modo</label>
            <select id="rk-cart-modo">${modoOpts}</select>
          </div>
        </div>

        <div class="rk-cart-totals">
          <div class="rk-cart-total-line"><span>Subtotal</span><span>${formatMxn(calc.subtotal)}</span></div>
          ${calc.modPlazoSuffix ? `<div class="rk-cart-total-line"><span>${L(calc.modPlazoLabel)}</span><span>${calc.modPlazoSuffix}</span></div>` : ''}
          ${calc.modModoSuffix ? `<div class="rk-cart-total-line"><span>${L(calc.modModoLabel)}</span><span>${calc.modModoSuffix}</span></div>` : ''}
          <div class="rk-cart-total-line"><span>IVA 16%</span><span>${formatMxn(calc.total * 0.16)}</span></div>
          <div class="rk-cart-total-line rk-cart-total-final"><span>TOTAL</span><span>${formatMxn(calc.totalConIva)} <small>MXN</small></span></div>
        </div>

        <div class="rk-cart-ctas">
          ${isResultado
            ? `<a href="${ctaHref}" target="_blank" rel="noopener" class="btn btn-primary rk-cart-pay">${ctaLabel} →</a>`
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
    // Toggle modificadores
    const plazo = $('#rk-cart-plazo');
    const modo = $('#rk-cart-modo');
    if (plazo) plazo.addEventListener('change', e => {
      State.cart.modificadores.plazo = e.target.value;
      persistCart();
      refreshCart();
    });
    if (modo) modo.addEventListener('change', e => {
      State.cart.modificadores.modo = e.target.value;
      persistCart();
      refreshCart();
    });

    // Edit items
    $$('.rk-cart-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.dataset.serviceId;
        const servicio = Object.assign({ id: sid }, findServicio(sid));
        if (!servicio.label) return;
        const existing = State.cart.servicios.find(s => s.id === sid);
        if (!existing) return;
        trackEditClick();
        openSubflowModal(servicio, existing.config || {});
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
      if (!confirm('¿Vaciar el carrito? Perderás los servicios agregados.')) return;
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

    // Mobile: toggle expand del carrito
    const header = document.querySelector('#cart .rk-cart-header');
    if (header && window.matchMedia('(max-width: 900px)').matches) {
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

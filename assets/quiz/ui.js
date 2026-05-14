/* ===================================================================
   assets/quiz/ui.js — iBisne v3 Quizz · state machine + render
   =================================================================== */

(function(){
  'use strict';

  // ─── STATE ───────────────────────────────────────────────────────────
  const State = {
    route: null,
    step: 0,
    branch: null,
    answers: {},
    flags: new Set(),
  };

  // ─── ICON MAPPINGS ───────────────────────────────────────────────────
  const ICON_CLASSIFIER = { socio: 'partnership', servicio: 'service', explorando: 'explore' };
  const ICON_TIPO_NEGOCIO = {
    dtc: 'dtc', reseller: 'ecommerce', servicio: 'servicio',
    saas: 'saasbiz', otro: 'otro',
  };
  const ICON_TIPO_PRODUCTO = {
    biolink: 'biolink', landing: 'landing', leads: 'leads',
    sitio: 'sitio', chatbot: 'chatbot', ecommerce: 'ecommerce',
    app: 'app', saas: 'saas', otro: 'otro',
  };

  // ─── DOM helpers ─────────────────────────────────────────────────────
  const $  = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  // ─── UTILS ───────────────────────────────────────────────────────────
  function formatMxn(n){
    const num = Number(n);
    const isInt = num === Math.floor(num);
    if (window.IBISNE_PREFS) return window.IBISNE_PREFS.format(num);
    return '$ ' + num.toLocaleString('en-US', isInt
      ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function t(key, fallback){
    if (window.IBISNE_PREFS) return window.IBISNE_PREFS.t(key, fallback);
    return fallback || key;
  }
  // Traducción de DATA · L(esText) busca por valor en IBISNE_I18N_DATA si lang === 'en'
  function L(esText){
    if (!esText) return esText;
    if (!window.IBISNE_PREFS || window.IBISNE_PREFS.lang() !== 'en') return esText;
    var dict = window.IBISNE_I18N_DATA || {};
    return dict[esText] || esText;
  }
  function ease(t){ return 1 - Math.pow(1 - t, 3); }
  function countUp(el, to, ms){
    ms = ms || 600;
    const from = parseFloat(el.dataset.value || '0');
    el.dataset.value = to;
    const start = performance.now();
    cancelAnimationFrame(el._raf || 0);
    function step(now){
      const t = Math.min(1, (now - start) / ms);
      const v = from + (to - from) * ease(t);
      el.textContent = el.dataset.format === 'mxn' ? formatMxn(v) : Math.round(v);
      if (t < 1) el._raf = requestAnimationFrame(step);
    }
    el._raf = requestAnimationFrame(step);
  }
  // Totales fijos por flow (evita que la barra retroceda cuando steps dinámicos cambian)
  const FLOW_TOTAL = {
    servicio:    8,    // 2 (vert+sub) + max 2 alcance + 4 universales (diseño · identidad · plazo · — soporte movido a membresía)
    socio:       10,
    inversor:    6,
    consultoria: 6,    // 1 modalidad + 5 preguntas
    discovery:   9,
  };

  function setProgress(p){
    // Si p es objeto {idx, flow}, calcular con total fijo
    let percent = p;
    if (typeof p === 'object' && p !== null) {
      const total = FLOW_TOTAL[p.flow] || 10;
      percent = Math.min(100, ((p.idx + 1) / total) * 100);
    }
    const fill = $('.progress-rail .fill');
    if (fill) fill.style.width = percent + '%';
  }
  function letter(i){ return String.fromCharCode(65 + i); }

  // ─── CARD RENDER ─────────────────────────────────────────────────────
  function renderCard(opts){
    // opts: { id, label, help?, description?, schedule?, meta?, marker?, icon?, category?, isSelected }
    // Orden DOM: icono → título → schedule → help → description → meta → categoría (eyebrow al fondo).
    // El CSS reordena visualmente vía flex/grid según contexto (hero vs lista horizontal).
    const ICONS = window.IBISNE_ICONS;
    let inner = '';
    if (opts.icon && ICONS) {
      inner += '<div class="icon">' + ICONS.card(opts.icon) + '</div>';
    }
    if (opts.marker) {
      inner += '<div class="option-marker">' + opts.marker + '</div>';
    }
    inner += '<div class="option-title">' + L(opts.label) + '</div>';
    if (opts.subtitle)    inner += '<div class="option-subtitle">' + L(opts.subtitle) + '</div>';
    if (opts.schedule)    inner += '<div class="option-schedule">' + L(opts.schedule) + '</div>';
    if (opts.help)        inner += '<div class="option-help">' + L(opts.help) + '</div>';
    if (opts.description) inner += '<div class="option-description">' + L(opts.description) + '</div>';
    if (opts.meta)        inner += '<div class="option-meta">' + opts.meta + '</div>';
    if (opts.category) {
      inner += '<span class="option-category">' + L(opts.category) + '</span>';
    }
    return '<button class="option ' + (opts.isSelected ? 'is-selected' : '') + '" data-id="' + opts.id + '" type="button">' + inner + '</button>';
  }

  // Helper: clase de grilla según cantidad de opciones (regla UX coherente)
  function gridClassByCount(n){
    if (n === 4) return 'cols-4';
    if (n === 2) return 'cols-2';
    return ''; // default 3-col
  }

  // Helper: auto-avance con timer cancelable + fade-out previo de #main
  // Flujo: usuario selecciona → ver feedback ~200ms → fade-out 180ms → navigate → fade-in nueva
  let _advanceTimer = null;
  function scheduleAdvance(targetHash, delayMs){
    if (_advanceTimer) { clearTimeout(_advanceTimer); _advanceTimer = null; }
    const FEEDBACK = 200;  // ver el check ✓ antes de empezar a salir
    const EXIT     = 180;  // duración del fade-out
    _advanceTimer = setTimeout(() => {
      const main = document.getElementById('main');
      if (main) main.classList.add('is-leaving');
      setTimeout(() => {
        _advanceTimer = null;
        navigate(targetHash);
      }, EXIT);
    }, (delayMs != null ? delayMs : FEEDBACK));
  }
  function cancelAdvance(){
    if (_advanceTimer) { clearTimeout(_advanceTimer); _advanceTimer = null; }
  }
  // Cancelar timer si cambia el hash externamente
  window.addEventListener('hashchange', cancelAdvance);

  function metaForOption(o){
    if (o.add !== undefined && o.add !== 0) return (o.add > 0 ? '+ ' : '') + formatMxn(o.add);
    if (o.base !== undefined && o.base > 0) return 'Base ' + formatMxn(o.base);
    if (o.id === 'otro' && o.base === 0) return 'Contactar';
    return null;
  }

  // ─── ROUTER ──────────────────────────────────────────────────────────
  function parseHash(){
    // Split off query string si existe · ej: '#/servicio/1?seek=1'
    let h = (location.hash || '#/').slice(2);
    let queryStr = '';
    const qIdx = h.indexOf('?');
    if (qIdx >= 0) {
      queryStr = h.slice(qIdx + 1);
      h = h.slice(0, qIdx);
    }
    const parts = h.split('/').filter(Boolean);
    // Parse query string · ej: 'seek=1' → { seek: '1' }
    const query = {};
    if (queryStr) {
      queryStr.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
      });
    }
    return { route: parts[0] || 'classifier', step: parts[1] || null, query };
  }
  function navigate(hash){ location.hash = hash; }

  window.addEventListener('hashchange', () => {
    render();
    // Re-traducir CTAs wa.me en el DOM nuevo según idioma activo
    setTimeout(() => { try { window.dispatchEvent(new Event('ibisne:rerender')); } catch(_) {} }, 0);
  });

  function render(){
    const { route, step } = parseHash();

    // v5.0.2 · Quitamos is-leaving DESPUÉS del paint del nuevo contenido
    // (no antes) · esto evita el flash que ocurría cuando main volvía a
    // opacity:1 mientras el hijo aún no había arrancado su fade-in.
    // El nuevo HTML se pinta mientras main aún tiene opacity:0 (la
    // animation forwards lo mantiene) · luego dos RAFs después, quitamos
    // la clase · el hijo (.result-screen / .question-card) hace su
    // propio fade-in 320ms sobre un padre ya visible.
    const _main = document.getElementById('main');
    if (_main && _main.classList.contains('is-leaving')) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => _main.classList.remove('is-leaving'));
      });
    }

    if (route === 'classifier' || !route || route === 'puertas') {
      // v5.0 · Cotizador puro · sin 3 puertas · entrada directa
      navigate('#/servicio/1');
      return;
    }
    if (route === 'socio') {
      State.route = 'socio';
      if (step === 'resultado') return renderSocioResultado();
      State.step = parseInt(step || '1', 10);
      renderSocioStep(); showAsideA(); return;
    }
    if (route === 'servicio') {
      State.route = 'servicio';
      if (step === 'loading')   return renderServicioLoading();
      if (step === 'resultado') return renderServicioResultado();
      State.step = parseInt(step || '1', 10);
      renderServicioStep(); showAsideB(); return;
    }
    if (route === 'discovery') {
      State.route = 'discovery';
      if (step === 'resultado') return renderDiscoveryResultado();
      State.step = parseInt(step || '1', 10);
      renderDiscoveryStep(); hideBottom(); return;
    }
    if (route === 'inversor') {
      State.route = 'inversor';
      if (step === 'resultado') return renderInversorResultado();
      State.step = parseInt(step || '1', 10);
      renderInversorStep(); hideBottom(); return;
    }
    if (route === 'consultoria') {
      State.route = 'consultoria';
      if (step === 'resultado') return renderConsultoriaResultado();
      State.step = parseInt(step || '1', 10);
      renderConsultoriaStep(); hideBottom(); return;
    }
    navigate('#/');
  }

  function hideBottom(){
    const b = $('#bottom-bar');
    if (b) { b.classList.add('hidden'); b.classList.remove('is-expanded'); }
    document.body.classList.remove('has-bottom-bar');
    document.body.classList.remove('has-bottom-bar-expanded');
  }
  function bindBottomToggle(){
    const bar  = $('#bottom-bar');
    const summary = $('#qb-summary-toggle');
    const btn = $('#qb-toggle-btn');
    if (!bar) return;
    const toggle = (e) => {
      if (e) e.stopPropagation();
      bar.classList.toggle('is-expanded');
      const expanded = bar.classList.contains('is-expanded');
      document.body.classList.toggle('has-bottom-bar-expanded', expanded);
      const tg = $('#qb-toggle-btn');
      if (tg) tg.setAttribute('aria-label', expanded ? 'Cerrar resumen' : 'Abrir resumen');
    };
    if (summary) summary.addEventListener('click', toggle);
    if (btn)     btn.addEventListener('click', toggle);

    // Navegación unificada — botones de Anterior/Continuar viven en el bottom bar
    const navPrev = $('#qb-nav-prev');
    const navNext = $('#qb-nav-next');
    if (navPrev) navPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.route !== 'servicio') return;
      // En resultado: regresar al último step del cuestionario (editar)
      if (State.step === 'resultado') {
        const steps = getServicioSteps();
        navigate('#/servicio/' + steps.length);
        return;
      }
      if (State.step <= 1) { window.location.href = 'index.html'; return; }
      navigate('#/servicio/' + (State.step - 1));
    });
    if (navNext) navNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (State.route !== 'servicio') return;
      // En resultado: ir directo a PayPal · CTA de pago
      if (State.step === 'resultado') {
        window.open('https://paypal.me/iBisne', '_blank', 'noopener');
        return;
      }
      const steps = getServicioSteps();
      const isLast = State.step >= steps.length;
      // En el último step: ir directo al resultado · CON fade-out
      if (isLast) {
        if (State.answers.subtipo) scheduleAdvance('#/servicio/resultado', 80);
        return;
      }
      // Pasos intermedios: proxy al inline [data-next] que respeta canAdvance
      const target = $('#main [data-next]');
      if (target && !target.disabled) { target.click(); return; }
      navigate('#/servicio/' + (State.step + 1));
    });
  }
  function showBottomA(){
    const b = $('#bottom-bar');
    if (!b) return;
    document.body.classList.add('has-bottom-bar');
    document.body.classList.remove('has-bottom-bar-expanded');
    b.classList.remove('hidden');
    b.classList.remove('is-expanded');
    b.innerHTML = renderBottomBarA();
    refreshBottomA();
    bindBottomToggle();
  }
  function showBottomB(){
    const b = $('#bottom-bar');
    if (!b) return;
    document.body.classList.add('has-bottom-bar');
    document.body.classList.remove('has-bottom-bar-expanded');
    b.classList.remove('hidden');
    b.classList.remove('is-expanded');
    b.innerHTML = renderBottomBarB();
    refreshBottomB();
    bindBottomToggle();
  }
  // legacy aliases (algunas llamadas internas)
  const hideAside = hideBottom;
  const showAsideA = showBottomA;
  const showAsideB = showBottomB;

  // ─── CLASSIFIER ──────────────────────────────────────────────────────
  function renderClassifier(){
    setProgress(5);
    const cards = [
      { id: 'socio',         icon: 'ecommerce',   label: 'Tengo producto, quiero más ventas', category: 'Comisión sobre ventas digitales', help: 'Llevamos tu producto a ecommerce de alto impacto. Tú pones producto, iBisne pone tech + performance marketing.' },
      { id: 'servicio',      icon: 'service',     label: 'Quiero contratar un servicio',category: 'Cotización + entrega',   help: 'Cotizas un proyecto puntual. Generamos cotización y arrancamos.' },
      { id: 'inversionista', icon: 'saas',        label: 'Quiero invertir capital',     category: 'Capital pasivo / venture',help: 'Aportas dinero · iBisne lo asigna en empresas del portfolio.' },
    ];
    $('#main').innerHTML = `
      <div class="question-card">
        <h2 class="question-title">¿Qué te trajo aquí?</h2>
        <p class="question-help">Tu respuesta define cómo iBisne te acompaña. Hay 3 caminos posibles — elige el más cercano a tu situación.</p>
        <div class="options ${gridClassByCount(cards.length)}">
          ${cards.map(c => renderCard(c)).join('')}
        </div>
        <div class="classifier-aux">
          <a href="https://wa.me/523329575274?text=Hola%2C%20quiero%20asesor%C3%ADa%201-a-1%20de%20iBisne" target="_blank" rel="noopener" class="aux-link">
            ¿Solo quieres asesoría 1-a-1? Habla directo con un hunter →
          </a>
        </div>
        <div class="actions">
          <a href="index.html" class="btn-ghost btn">← Volver al inicio</a>
        </div>
      </div>
    `;

    $$('#main .option').forEach(b => b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      b.classList.add('is-selected');
      if (id === 'socio')         scheduleAdvance('#/socio/1');
      if (id === 'servicio')      scheduleAdvance('#/servicio/1');
      if (id === 'inversionista') scheduleAdvance('#/inversor/1');
    }));
  }

  // ─── RAMA A — SOCIO ──────────────────────────────────────────────────
  function renderSocioStep(){
    if (State.route !== 'socio' || !State.answers._init) {
      State.answers = { _init: true };
      State.flags = new Set();
    }
    const preguntas = window.IBISNE_SCORING.preguntas;
    const idx = State.step - 1;
    if (idx < 0 || idx >= preguntas.length) { navigate('#/socio/1'); return; }

    const q = preguntas[idx];
    setProgress({ idx, flow: 'socio' });

    let body = `
      <div class="question-card">
        <div class="eyebrow">Socio tecnológico</div>
        <h2 class="question-title">${q.label}</h2>
    `;

    if (q.form) {
      body += '<div class="form-fields">';
      for (const f of q.campos) {
        const val = (State.answers[q.id]?.[f.id] || '').replace(/"/g, '&quot;');
        body += `
          <div class="form-field ${f.id === 'sitio' ? 'full' : ''}">
            <label>${f.label}${f.required ? ' *' : ''}</label>
            <input type="${f.type || 'text'}" name="${f.id}" ${f.required ? 'required' : ''} value="${val}">
          </div>
        `;
      }
      body += '</div>';
    } else {
      const isMulti = q.multi === true;
      const sel = State.answers[q.id];
      const selIds = isMulti ? new Set((sel || []).map(s => s.id)) : new Set(sel ? [sel.id] : []);
      const useIcons = (idx === 0); // solo tipo de negocio tiene iconos temáticos
      body += `<div class="options ${isMulti ? 'is-multi' : ''} ${q.opciones.length > 4 ? 'is-list' : ''}">`;
      q.opciones.forEach((o, i) => {
        body += renderCard({
          id: o.id,
          icon: useIcons ? ICON_TIPO_NEGOCIO[o.id] : null,
          label: o.label,
          isSelected: selIds.has(o.id),
        });
      });
      body += '</div>';
    }

    body += `
        <div class="actions">
          ${idx > 0 ? `<button class="btn-ghost btn" data-prev type="button">← Anterior</button>` : `<a href="#/" class="btn-ghost btn">← Clasificador</a>`}
          <button class="btn btn-primary" data-next type="button" ${canAdvanceA(q) ? '' : 'disabled'}>${idx === preguntas.length - 1 ? 'Ver mi resultado →' : 'Continuar →'}</button>
        </div>
      </div>
    `;

    $('#main').innerHTML = body;
    bindSocioStep(q);
    refreshPanelA();
  }

  function canAdvanceA(q){
    const a = State.answers[q.id];
    if (q.form) {
      const v = a || {};
      return q.campos.every(f => !f.required || (v[f.id] && v[f.id].trim().length > 0));
    }
    if (q.multi) return Array.isArray(a) && a.length > 0;
    return !!a;
  }

  function bindSocioStep(q){
    if (q.form) {
      $$('#main input').forEach(input => {
        input.addEventListener('input', e => {
          State.answers[q.id] = State.answers[q.id] || {};
          State.answers[q.id][e.target.name] = e.target.value;
          const next = $('[data-next]'); if (next) next.disabled = !canAdvanceA(q);
        });
      });
    } else {
      $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const o = q.opciones.find(x => x.id === id);
        if (q.multi) {
          const list = State.answers[q.id] || [];
          const exists = list.find(x => x.id === id);
          State.answers[q.id] = exists ? list.filter(x => x.id !== id) : [...list, o];
          e.currentTarget.classList.toggle('is-selected');
          refreshBottomA();
          const nxt = $('[data-next]'); if (nxt) nxt.disabled = !canAdvanceA(q);
        } else {
          State.answers[q.id] = o;
          $$('#main .option').forEach(b => b.classList.remove('is-selected'));
          e.currentTarget.classList.add('is-selected');
          refreshBottomA();
          const nxt = $('[data-next]'); if (nxt) nxt.disabled = false;
          const total = window.IBISNE_SCORING.preguntas.length;
          scheduleAdvance(State.step < total ? '#/socio/' + (State.step + 1) : '#/socio/resultado');
        }
      }));
    }

    $('[data-next]')?.addEventListener('click', () => {
      if (!canAdvanceA(q)) return;
      const total = window.IBISNE_SCORING.preguntas.length;
      if (State.step < total) navigate('#/socio/' + (State.step + 1));
      else navigate('#/socio/resultado');
    });
    $('[data-prev]')?.addEventListener('click', () => navigate('#/socio/' + (State.step - 1)));
  }

  function renderSocioResultado(){
    setProgress(100);
    const inferencia = window.IBISNE_INFERENCE.calcular(State.answers);
    const result     = window.IBISNE_SCORING.calcular(State.answers, inferencia.totalMxn);
    const tags       = window.IBISNE_INFERENCE.getTags(State.answers, result.score);
    const v = result.veredicto;

    persistLead({
      route: 'socio', score: result.score, tier: inferencia.tier.label,
      respuestas: State.answers,
      inferencia: { items: inferencia.items, totalMxn: inferencia.totalMxn, tier: inferencia.tier },
      tags, veredicto: v.id, contacto: State.answers.datos || {},
    });
    if (v.alert) triggerAlert(result.score, State.answers, inferencia, tags);

    const heads = {
      optimo:       'Eres el tipo de operador<br><span class="accent">que iBisne busca.</span>',
      viable:       'Tu negocio cumple<br><span class="accent">los criterios.</span>',
      conversacion: 'Hay potencial.<br><span class="accent">Conversemos.</span>',
      'no-momento': 'Aún no es momento.<br><span class="accent">Pero podemos ayudarte.</span>',
    };

    $('#main').innerHTML = `
      <div class="result-screen">
        <div class="result-veredicto ${v.id === 'no-momento' ? 'no-momento' : ''}">— ${v.label}</div>
        <h2 class="result-headline">${heads[v.id]}</h2>
        <p class="result-body">${v.copy}</p>
        ${v.alert ? `<div class="result-alert-message">— ${v.message}</div>` : ''}
        <div class="result-cta">
          ${v.ctaUrl
            ? `<a href="${v.ctaUrl}" class="btn btn-primary">${v.cta} →</a>
               <a href="mailto:proyectos@ibisne.com" class="btn btn-line">Suscribirme al newsletter</a>`
            : `<a href="https://wa.me/523329575274?text=Hola%2C%20vengo%20del%20quiz%20de%20iBisne%20%E2%80%94%20fit-score%20${result.score}" target="_blank" rel="noopener" class="btn btn-primary">${v.cta} →</a>
               <a href="index.html" class="btn btn-line">Volver al inicio</a>`}
        </div>
        <div class="result-summary">
          <div class="item">
            <div class="label">Fit score</div>
            <div class="value"><strong>${result.score}</strong> / 100</div>
          </div>
          <div class="item">
            <div class="label">Tier compromiso iBisne</div>
            <div class="value">${inferencia.tier.label}${inferencia.tier.copy ? ' · ' + inferencia.tier.copy : ''}</div>
          </div>
          <div class="item">
            <div class="label">Solución que ejecutaríamos</div>
            <div class="value">${inferencia.items.map(i => i.label).join(' · ') || '—'}</div>
          </div>
          <div class="item">
            <div class="label">Comisión ofrecida</div>
            <div class="value">${State.answers.comision?.label || '—'}</div>
          </div>
        </div>
      </div>
    `;
    showAsideA();
  }

  // ─── RAMA B — SERVICIO ───────────────────────────────────────────────
  // ─── HELPERS RAMA B (árbol dinámico) ─────────────────────────────────
  // getServicioSteps: secuencia dinámica de steps según vertical+subtipo
  function getServicioSteps(){
    const PRICING = window.IBISNE_PRICING;
    const steps = [
      { kind: 'vertical', id: 'vertical' },
      { kind: 'subtipo',  id: 'subtipo' },
    ];
    const sub = State.answers.subtipo;
    if (!sub) return steps;
    if (sub.contact) return steps; // avanzado → solo 2 steps + resultado contact
    const branch = sub.branch;
    const alcanceQs = (PRICING.alcance && PRICING.alcance[branch]) || [];
    alcanceQs.forEach(q => steps.push({ kind: 'alcance', id: q.id }));
    (PRICING.universales || []).forEach(q => steps.push({ kind: 'universal', id: q.id }));
    // v5.1.0 · Gate de datos · capturamos el lead ANTES de mostrar
    // el precio · convierte ~3x más vs anónimo · cero spam.
    steps.push({ kind: 'datos', id: 'datos' });
    return steps;
  }

  function getQuestionByStep(stepDef){
    const PRICING = window.IBISNE_PRICING;
    if (stepDef.kind === 'alcance') {
      const branch = State.answers.subtipo?.branch;
      return (PRICING.alcance[branch] || []).find(q => q.id === stepDef.id);
    }
    if (stepDef.kind === 'universal') {
      return (PRICING.universales || []).find(q => q.id === stepDef.id);
    }
    return null;
  }

  // ─── RENDER ROOT — dispatcher según step ─────────────────────────────
  function renderServicioStep(){
    if (State.route !== 'servicio' || !State.answers._init) {
      State.answers = { _init: true };
      State.flags = new Set();
      // Nueva sesión de cotización: limpia el folio cacheado para que el siguiente
      // resultado pida uno nuevo (en lugar de reusar el de la cotización anterior).
      State.servicioFolio = null;
    }
    const steps = getServicioSteps();
    const idx = State.step - 1;

    // Si el subtipo es contact (avanzado) y ya pasamos los 2 primeros steps → resultado directo
    if (State.answers.subtipo?.contact && idx >= 2) {
      navigate('#/servicio/resultado');
      return;
    }
    if (idx < 0) {
      navigate('#/servicio/1');
      return;
    }
    // Si el usuario terminó todas las preguntas → al resultado.
    if (idx >= steps.length) {
      if (State.answers.subtipo) {
        navigate('#/servicio/resultado');
      } else {
        navigate('#/servicio/1');
      }
      return;
    }

    const stepDef = steps[idx];
    setProgress({ idx, flow: 'servicio' });

    if (stepDef.kind === 'vertical') return renderVertical(idx, steps.length);
    if (stepDef.kind === 'subtipo')  return renderSubtipo(idx, steps.length);
    if (stepDef.kind === 'alcance')  return renderAlcance(stepDef, idx, steps.length);
    if (stepDef.kind === 'universal')return renderUniversal(stepDef, idx, steps.length);
    if (stepDef.kind === 'datos')    return renderServicioDatos(idx, steps.length);
  }

  // ─── Q1 — Vertical macro ─────────────────────────────────────────────
  function renderVertical(idx, total){
    const PRICING = window.IBISNE_PRICING;
    const sel = State.answers.vertical?.id;
    const cards = PRICING.verticales.map(v => renderCard({
      id: v.id,
      icon: v.icon,
      label: v.label,
      subtitle: v.subtitle,
      category: v.category,
      help: v.help,
      isSelected: sel === v.id,
    })).join('');

    $('#main').innerHTML = `
      <div class="question-card">
        <div class="eyebrow">${L("Servicio")}</div>
        <h2 class="question-title">¿Qué deseas construir?</h2>
        <p class="question-help">Elige por dónde empezamos. Cada camino abre sus propias opciones.</p>
        <div class="options is-hero ${gridClassByCount(PRICING.verticales.length)}">${cards}</div>
        <div class="actions">
          <a href="index.html" class="btn-ghost btn">← Volver al inicio</a>
          <button class="btn btn-primary" data-next type="button" ${State.answers.vertical ? '' : 'disabled'}>Continuar →</button>
        </div>
      </div>
    `;
    $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const v = PRICING.verticales.find(x => x.id === id);
      if (State.answers.vertical?.id !== id) {
        State.answers = { _init: true, vertical: v };
        State.flags = new Set();
      }
      $$('#main .option').forEach(b => b.classList.remove('is-selected'));
      e.currentTarget.classList.add('is-selected');
      refreshBottomB();
      const nxt = $('[data-next]'); if (nxt) nxt.disabled = false;
      scheduleAdvance('#/servicio/' + (State.step + 1));
    }));
    $('[data-next]')?.addEventListener('click', () => {
      if (!State.answers.vertical) return;
      navigate('#/servicio/' + (State.step + 1));
    });
    refreshBottomB();
  }

  // ─── Q2 — Sub-tipo ───────────────────────────────────────────────────
  function renderSubtipo(idx, total){
    const PRICING = window.IBISNE_PRICING;
    const vertical = State.answers.vertical;
    if (!vertical) { navigate('#/servicio/1'); return; }
    const subs = PRICING.subtipos[vertical.id] || [];
    const sel = State.answers.subtipo?.id;

    const cards = subs.map(s => renderCard({
      id: s.id,
      icon: s.icon,
      label: s.label,
      subtitle: s.subtitle,
      category: s.category,
      meta: s.contact ? L('Contactar') : (s.base > 0 ? formatMxn(s.base) : null),
      isSelected: sel === s.id,
    })).join('');

    $('#main').innerHTML = `
      <div class="question-card">
        <div class="eyebrow">${vertical.label}</div>
        <h2 class="question-title">¿Qué tipo de ${vertical.label.toLowerCase()}?</h2>
        <p class="question-help">Elige el que más se parezca a lo que tienes en mente.</p>
        <div class="options ${gridClassByCount(subs.length)}">${cards}</div>
        <div class="actions">
          <button class="btn-ghost btn" data-prev type="button">← Anterior</button>
          <button class="btn btn-primary" data-next type="button" ${State.answers.subtipo ? '' : 'disabled'}>Continuar →</button>
        </div>
      </div>
    `;
    $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const s = subs.find(x => x.id === id);
      const preserved = { _init: true, vertical: State.answers.vertical, subtipo: s };
      State.answers = preserved;
      State.flags = new Set();
      $$('#main .option').forEach(b => b.classList.remove('is-selected'));
      e.currentTarget.classList.add('is-selected');
      refreshBottomB();
      const nxt = $('[data-next]'); if (nxt) nxt.disabled = false;
      scheduleAdvance(s.contact ? '#/servicio/resultado' : ('#/servicio/' + (State.step + 1)));
    }));
    $('[data-next]')?.addEventListener('click', () => {
      if (!State.answers.subtipo) return;
      if (State.answers.subtipo.contact) {
        navigate('#/servicio/resultado');
        return;
      }
      navigate('#/servicio/' + (State.step + 1));
    });
    $('[data-prev]')?.addEventListener('click', () => navigate('#/servicio/' + (State.step - 1)));
    refreshBottomB();
  }

  // ─── Q3+ — Alcance técnico (sub-preguntas específicas) ───────────────
  function renderAlcance(stepDef, idx, total){
    const q = getQuestionByStep(stepDef);
    if (!q) { navigate('#/servicio/' + (State.step + 1)); return; }
    renderQuestionGeneric(q, idx, total, State.answers.subtipo?.label || '');
  }

  // ─── Q4+ — Universales (diseño, identidad, idiomas, plazo, mantto) ───
  function renderUniversal(stepDef, idx, total){
    const q = getQuestionByStep(stepDef);
    if (!q) { navigate('#/servicio/' + (State.step + 1)); return; }
    renderQuestionGeneric(q, idx, total, 'Preferencias del proyecto');
  }

  // ─── Render genérico para preguntas con opciones ─────────────────────
  function renderQuestionGeneric(q, idx, total, eyebrowLabel){
    const isMulti = q.multi === true;
    const sel = State.answers[q.id];
    const selIds = isMulti ? new Set((sel || []).map(s => s.id)) : new Set(sel ? [sel.id] : []);

    const cards = q.opciones.map(o => {
      let meta = null;
      if (o.add !== undefined && o.add !== 0) meta = (o.add > 0 ? '+ ' : '') + formatMxn(o.add);
      else if (o.mul !== undefined) meta = o.metaSuffix || formatMxn(0);
      else meta = formatMxn(0); // antes era '—' · ahora "$0.00" para mantener formato consistente
      return renderCard({
        id: o.id,
        icon: o.icon,
        label: o.label,
        subtitle: o.subtitle,
        schedule: o.schedule,
        description: o.description,
        meta,
        isSelected: selIds.has(o.id),
      });
    }).join('');

    const gridCls = gridClassByCount(q.opciones.length);
    $('#main').innerHTML = `
      <div class="question-card">
        <div class="eyebrow">${eyebrowLabel}</div>
        <h2 class="question-title">${q.label}</h2>
        <p class="question-help">${q.help || (isMulti ? 'Selecciona todas las que apliquen.' : 'Elige la opción que mejor refleje tu proyecto.')}</p>
        <div class="options ${isMulti ? 'is-multi' : ''} ${gridCls}">${cards}</div>
        <div class="actions">
          <button class="btn-ghost btn" data-prev type="button">← Anterior</button>
          <button class="btn btn-primary" data-next type="button" ${canAdvanceB(q) ? '' : 'disabled'}>Continuar →</button>
        </div>
      </div>
    `;
    $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const o = q.opciones.find(x => x.id === id);
      if (q.multi) {
        const list = State.answers[q.id] || [];
        const exists = list.find(x => x.id === id);
        State.answers[q.id] = exists ? list.filter(x => x.id !== id) : [...list, o];
        e.currentTarget.classList.toggle('is-selected');
        refreshBottomB();
        const nxt = $('[data-next]'); if (nxt) nxt.disabled = !canAdvanceB(q);
        // multi: NO auto-avanza (usuario decide cuándo termina)
      } else {
        State.answers[q.id] = o;
        $$('#main .option').forEach(b => b.classList.remove('is-selected'));
        e.currentTarget.classList.add('is-selected');
        refreshBottomB();
        const nxt = $('[data-next]'); if (nxt) nxt.disabled = !canAdvanceB(q);
        scheduleAdvance('#/servicio/' + (State.step + 1));
      }
    }));
    $('[data-next]')?.addEventListener('click', () => {
      if (!canAdvanceB(q)) return;
      navigate('#/servicio/' + (State.step + 1));
    });
    $('[data-prev]')?.addEventListener('click', () => navigate('#/servicio/' + (State.step - 1)));
    refreshBottomB();
  }

  function canAdvanceB(q){
    const a = State.answers[q.id];
    if (q.multi) return Array.isArray(a) && a.length > 0;
    return !!a;
  }

  // ─── Datos del cliente (último step de Etapa 1) ──────────────────────
  function renderServicioDatos(idx, total){
    const datos = State.answers.datos || {};
    const ICONS = window.IBISNE_ICONS;
    const ico = id => ICONS ? ICONS.get(id, 'line') : '';
    $('#main').innerHTML = `
      <div class="question-card">
        <div class="eyebrow">Último paso · Te quedan ~10 segundos</div>
        <h2 class="question-title">Falta poco para ver tu cotización.</h2>
        <p class="question-help">Queremos enviarte la propuesta firmable + folio. Te respondemos en menos de 24 horas. Cero spam · cero llamadas no solicitadas.</p>
        <div class="form-fields">
          <div class="form-field">
            <label>${ico('login')} Nombre <span style="color:var(--text-muted); font-weight:400;">*</span></label>
            <input type="text" name="nombre" required placeholder="Tu nombre" value="${(datos.nombre||'').replace(/"/g,'&quot;')}" autocomplete="name">
          </div>
          <div class="form-field">
            <label>${ico('whatsapp')} WhatsApp <span style="color:var(--text-muted); font-weight:400;">*</span></label>
            <input type="tel" name="whatsapp" required placeholder="+52 55 0000 0000" value="${(datos.whatsapp||'').replace(/"/g,'&quot;')}" autocomplete="tel">
          </div>
          <div class="form-field">
            <label>${ico('arrow')} Email <span style="color:var(--text-muted); font-weight:400;">*</span></label>
            <input type="email" name="email" required placeholder="hola@tudominio.com" value="${(datos.email||'').replace(/"/g,'&quot;')}" autocomplete="email">
          </div>
          <div class="form-field">
            <label>${ico('service')} <span style="color:var(--text-secondary);">Empresa <span style="color:var(--text-muted); font-weight:400;">(opcional)</span></span></label>
            <input type="text" name="empresa" placeholder="Nombre de tu negocio o proyecto" value="${(datos.empresa||'').replace(/"/g,'&quot;')}" autocomplete="organization">
          </div>
        </div>
        <p style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.06em; margin-top: 14px; text-align: center;">
          🔒 Tus datos quedan privados · solo nosotros y tú · ver <a href="legal/privacidad.html" target="_blank" style="color: var(--accent-mint);">aviso de privacidad</a>
        </p>
        <div class="actions">
          <button class="btn-ghost btn" data-prev type="button">← Atrás</button>
          <button class="btn btn-primary" data-next type="button" disabled>Ver mi cotización →</button>
        </div>
      </div>
    `;
    function checkValid(){
      const d = State.answers.datos || {};
      const ok = ['nombre','email','whatsapp'].every(k => d[k] && d[k].trim());
      const next = $('[data-next]'); if (next) next.disabled = !ok;
    }
    $$('#main input').forEach(input => input.addEventListener('input', e => {
      State.answers.datos = State.answers.datos || {};
      State.answers.datos[e.target.name] = e.target.value;
      checkValid();
    }));
    checkValid();
    // v5.1.1 · Step datos → loading screen → resultado
    // Pasa por /loading que da 900ms de buffer · evita que el paint
    // pesado del resultado se vea como "salto"
    $('[data-next]')?.addEventListener('click', () => scheduleAdvance('#/servicio/loading', 80));
    $('[data-prev]')?.addEventListener('click', () => navigate('#/servicio/' + (State.step - 1)));
    refreshBottomB();
  }

  // v5.1.1 · Loading screen intermedio entre captura de datos y resultado.
  // Buffer de 900ms · da tiempo al browser para hacer compute + paint
  // del resultado pesado (FAQ + sticky + métodos + trust signals) ANTES
  // de mostrarlo · al resultado le toca aparecer ya listo · cero salto.
  function renderServicioLoading(){
    setProgress(100);
    hideBottom();
    const datos = State.answers.datos || {};
    const nombre = datos.nombre ? datos.nombre.split(' ')[0] : '';

    $('#main').innerHTML = `
      <div class="result-screen rk-loading-wrap">
        <div class="rk-loading">
          <div class="rk-loading-spinner" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="rk-loading-stage" id="rk-load-stage">${L("Calculando tu cotización")}…</div>
          <p class="rk-loading-hint">${nombre ? nombre + ', preparamos ' : 'Preparamos '}tu propuesta · folio · stack · equipo · tiempos.</p>
          <ul class="rk-loading-steps">
            <li data-i="1"><span class="rk-load-tick">○</span> Generamos folio único</li>
            <li data-i="2"><span class="rk-load-tick">○</span> Asignamos equipo según alcance</li>
            <li data-i="3"><span class="rk-load-tick">○</span> Calculamos tiempos y stack</li>
            <li data-i="4"><span class="rk-load-tick">○</span> Listo · abriendo cotización</li>
          </ul>
        </div>
      </div>
    `;

    // Pre-compute · arranca el cálculo pesado en paralelo mientras el
    // usuario ve el loader · cuando navegue al resultado, todo ya está
    // en cache (computeB es puro y getter de pricing es sync).
    try { computeB(); } catch(_){}

    // Animación de "stages" · cada step se marca después de 200ms
    const items = $$('#main .rk-loading-steps li');
    const total = 900;
    const stepMs = Math.floor(total / (items.length + 1));
    items.forEach((li, idx) => {
      setTimeout(() => {
        const tick = li.querySelector('.rk-load-tick');
        if (tick) tick.textContent = '✓';
        li.classList.add('is-done');
      }, stepMs * (idx + 1));
    });

    // Cuando se acaba el loader, ir al resultado (con fade-out previo)
    setTimeout(() => {
      scheduleAdvance('#/servicio/resultado', 0);
    }, total + 100);
  }

  function renderServicioResultado(){
    setProgress(100);
    const calc = computeB();
    const subtipo = State.answers.subtipo;
    const vertical = State.answers.vertical;

    // v4.2 · Empty state · si el usuario llegó al resultado SIN completar
    // el quiz (acceso directo o sesión vacía), redirigir amablemente
    if (!subtipo || !vertical) {
      $('#main').innerHTML = `
        <div class="result-screen" style="text-align: center; padding: 60px 24px;">
          <div class="result-veredicto" style="margin-bottom: 14px;">— ${L("COTIZACIÓN INDICATIVA")}</div>
          <h2 class="result-headline" style="font-size: clamp(28px,4vw,42px);">${L("Falta completar tu proyecto")}<br><span class="accent">${L("para ver tu cotización")}</span></h2>
          <p class="result-body" style="max-width: 560px; margin: 18px auto 32px;">${L("Parece que llegaste aquí sin pasar por el quiz. Elige tu tipo de proyecto y en 3 minutos te damos precio aproximado, equipo asignado y opciones de pago.")}</p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
            <a href="#/servicio/1" class="btn btn-primary">${L("Empezar quiz")} →</a>
          </div>
        </div>
      `;
      showAsideB();
      return;
    }

    // v5.1.0 · Gate de datos · si no completaron nombre/whatsapp/email,
    // regresamos al step de datos antes de mostrar el precio
    const _datos = State.answers.datos || {};
    const _datosOk = ['nombre','whatsapp','email'].every(k => _datos[k] && String(_datos[k]).trim());
    if (!_datosOk) {
      const steps = getServicioSteps();
      const datosIdx = steps.findIndex(s => s.kind === 'datos');
      if (datosIdx >= 0) {
        State.step = datosIdx + 1;
        navigate('#/servicio/' + (datosIdx + 1));
        return;
      }
    }

    // v4.0 · Eliminamos el gate "isContact" · TODOS los proyectos cotizan
    // (los avanzados ahora tienen base price orientativo · el discovery
    // refina el alcance exacto si el cliente lo necesita).

    // ─── COTIZACIÓN (siempre se muestra · sin gates) ──────────────────
    // Folio se cachea en State para que las ediciones del modal no consuman folios extra.
    if (!State.servicioFolio) {
      State.servicioFolio = nextFolio();
      // Persistimos UNA sola vez por sesión de cotización (el re-render por edición no duplica).
      persistLead({
        route: 'servicio', stage: 1,
        vertical: vertical?.id, subtipo: subtipo?.id,
        total_mxn: calc.total, tier: calc.tier.label,
        respuestas: State.answers,
        equipo: calc.team, modulos: calc.modules,
        plazoMul: calc.plazoMul,
        contacto: State.answers.datos || {},
        pdf_folio: State.servicioFolio,
      });
    }
    const folio = State.servicioFolio;
    const isEnterprise = calc.tier.id === 'enterprise';

    // Build WhatsApp message with config summary
    const subtipoLabel = subtipo?.label || '';
    const verticalLabel = State.answers.vertical?.label || '';
    const lineItemsText = calc.lineItems.map(li => `• ${li.label}`).join('\n');

    // ─── AGRUPACIÓN DEL DESGLOSE POR CATEGORÍA ───────────────────
    // Cada line item lleva qid (id de la pregunta). Lo mapeamos a un grupo
    // semántico para que la cotización lea como un brief, no como un dump.
    const GROUP_MAP = {
      // Plataforma y alcance (subtipo + alcance específico)
      catalogo: 'plataforma', plataforma: 'plataforma', modelo: 'plataforma',
      // Funcionalidad técnica
      pasarelas: 'funcionalidad', integraciones: 'funcionalidad',
      funciones: 'funcionalidad', tipo_app: 'funcionalidad', backend: 'funcionalidad',
      // Diseño y marca
      diseno: 'diseno', identidad: 'diseno',
      // Tiempo de entrega
      plazo: 'tiempo',
    };
    const GROUP_META = {
      plataforma:    { label: 'Plataforma y alcance',  icon: 'sitio' },
      funcionalidad: { label: 'Funcionalidad técnica', icon: 'serverapp' },
      diseno:        { label: 'Diseño y marca',        icon: 'palette' },
      tiempo:        { label: 'Tiempo de entrega',     icon: 'clock' },
      otros:         { label: 'Otros',                 icon: 'star' },
    };
    function groupLineItems(items){
      const groups = {};
      const order = ['plataforma','funcionalidad','diseno','tiempo','otros'];
      for (const li of items) {
        const g = GROUP_MAP[li.qid] || 'otros';
        if (!groups[g]) groups[g] = [];
        groups[g].push(li);
      }
      return order.filter(g => groups[g]).map(g => ({
        key: g,
        meta: GROUP_META[g],
        items: groups[g],
        subtotal: groups[g].reduce((s, li) => s + (li.add || 0), 0),
      }));
    }
    const groups = groupLineItems(calc.lineItems);
    function iconHtml(id){
      return window.IBISNE_ICONS ? '<span class="li-icon">' + window.IBISNE_ICONS.get(id || 'otro','line') + '</span>' : '';
    }
    function renderGroup(g){
      return `
        <div class="qb-group">
          <div class="qb-group-head">
            ${iconHtml(g.meta.icon)}
            <span class="qb-group-name">${g.meta.label}</span>
            <span class="qb-group-sub">${formatMxn(g.subtotal)}</span>
          </div>
          <div class="qb-group-body">
            ${g.items.map(li => `
              <div class="item editable" data-q="${li.qid || ''}" data-opt="${li.id || ''}">
                ${iconHtml(li.icon)}
                <span class="label">${li.label}</span>
                <span class="amount">${li.add >= 0 ? '+ ' : ''}${formatMxn(li.add)}</span>
                <button class="edit-btn" data-q="${li.qid || ''}" type="button" aria-label="Editar ${li.label}">
                  ${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('edit', 'line') : '✎'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    const groupsHtml = groups.map(renderGroup).join('');

    // ─── DATOS FORMALES PARA EL PDF ──────────────────────────────
    const IBISNE_INFO = {
      razonSocial: 'iBisne S.A.S de C.V.',
      email: 'proyectos@ibisne.com',
      whatsapp: '+52 33 2957 5274',
      web: 'www.ibisne.com',
      direccion: 'Guadalajara, Jalisco · México',
    };
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    const fechaVigencia = (() => {
      const d = new Date(); d.setDate(d.getDate() + 30);
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    })();
    const stackItems = window.IBISNE_PRICING?.getStack
      ? window.IBISNE_PRICING.getStack(vertical?.id, subtipo?.id)
      : [];

    // v5.0 · Cotizador puro · sin membresías ni co-financiamiento
    const totalConIva = calc.total * 1.16;
    function membershipCardHtml(m, isRecommended){
      const priceIva = m.price * 1.16;
      return `
        <div class="mb-card${isRecommended ? ' is-recommended' : ''}" data-membership="${m.id}">
          ${isRecommended ? '<div class="mb-badge">RECOMENDADA</div>' : ''}
          <div class="mb-head">
            ${iconHtml(m.icon)}
            <div>
              <div class="mb-name">${m.label}</div>
              <div class="mb-tag">${m.tagline}</div>
            </div>
          </div>
          <div class="mb-price">
            <span class="mb-amount">${formatMxn(priceIva)}</span>
            <span class="mb-period">/año · IVA incluido</span>
          </div>
          <div class="mb-cover">Cubre proyectos hasta ${formatMxn(m.maxProject)}</div>
          <ul class="mb-includes">
            ${m.includes.map(it => '<li>' + it + '</li>').join('')}
          </ul>
          <button class="btn btn-primary mb-cta" type="button" data-pick-membership="${m.id}">Elegir ${m.label} →</button>
        </div>
      `;
    }
    const waMessage = `Hola, vengo del cotizador iBisne con folio #${folio}.

Subtotal: ${formatMxn(calc.total)} MXN
IVA 16%: ${formatMxn(calc.total * 0.16)} MXN
Total con IVA: ${formatMxn(calc.total * 1.16)} MXN

Configuración:
• ${verticalLabel} · ${subtipoLabel}
${lineItemsText}

Quiero hablar para precisar el alcance.`;
    const waUrl = `https://wa.me/523329575274?text=${encodeURIComponent(waMessage)}`;

    // v5.1.0 · Tiempo y stack para mostrar en la izquierda
    const tiempoEntrega = window.IBISNE_PRICING?.getTime
      ? window.IBISNE_PRICING.getTime(vertical?.id, subtipo?.id, calc.total)
      : '4-8 semanas';
    const stackList = stackItems.length ? stackItems : ['Stack moderno', 'Tecnología adecuada al alcance', 'Hosting confiable'];
    const datosCliente = State.answers.datos || {};

    $('#main').innerHTML = `
      <div class="result-screen result-checkout">

        <!-- v5.1.0 · Header compacto · folio + greeting personal -->
        <div class="rk-head">
          <div class="rk-folio">— FOLIO #${folio} · INDICATIVO · SUJETO A DISCOVERY</div>
          <h2 class="rk-title">${datosCliente.nombre ? `${datosCliente.nombre.split(' ')[0]}, t` : 'T'}u cotización está lista.</h2>
          <p class="rk-sub">Revisa el desglose, confirma con un pago de anticipo y arrancamos. Cero compromisos hasta que tú decidas.</p>
        </div>

        <!-- ═══ CHECKOUT SPLIT · 62% izq + 38% der sticky ════════════════════════ -->
        <div class="rk-grid">

          <!-- ────── IZQUIERDA · resumen del proyecto + desglose ────── -->
          <div class="rk-left">

            <!-- Tu proyecto · header card -->
            <article class="rk-card rk-project">
              <div class="rk-card-eyebrow">— TU PROYECTO</div>
              <div class="rk-project-head">
                <div class="rk-project-icon">${iconHtml(subtipo?.icon)}</div>
                <div>
                  <div class="rk-project-name">${subtipoLabel}</div>
                  <div class="rk-project-vertical">${verticalLabel} · ${calc.modules} ${calc.modules === 1 ? 'módulo configurado' : 'módulos configurados'}</div>
                </div>
              </div>

              <div class="rk-project-meta">
                <div class="rk-meta-item">
                  <span class="rk-meta-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('clock','line') : '🕐'}</span>
                  <div>
                    <div class="rk-meta-label">Tiempo de entrega</div>
                    <div class="rk-meta-value">${tiempoEntrega}</div>
                  </div>
                </div>
                <div class="rk-meta-item">
                  <span class="rk-meta-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('partnership','line') : '👥'}</span>
                  <div>
                    <div class="rk-meta-label">Equipo asignado</div>
                    <div class="rk-meta-value">${(calc.team || []).slice(0,4).join(' · ')}${calc.team.length > 4 ? ` +${calc.team.length-4}` : ''}</div>
                  </div>
                </div>
                <div class="rk-meta-item">
                  <span class="rk-meta-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('star','line') : '★'}</span>
                  <div>
                    <div class="rk-meta-label">Acabado</div>
                    <div class="rk-meta-value">${calc.speedZone === 'mvp' ? 'Rápido (MVP)' : (calc.speedZone === 'premium' ? 'Premium' : 'Equilibrado')}</div>
                  </div>
                </div>
                <div class="rk-meta-item">
                  <span class="rk-meta-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('serverapp','line') : '⚙'}</span>
                  <div>
                    <div class="rk-meta-label">Tecnología</div>
                    <div class="rk-meta-value">${stackList[0] || 'Stack adecuado'}</div>
                  </div>
                </div>
              </div>
            </article>

            <!-- Desglose detallado · editable -->
            <article class="rk-card rk-breakdown">
              <div class="rk-card-eyebrow">— DESGLOSE · CLICK PARA EDITAR</div>
              <div class="cotizacion-preview rk-breakdown-inner">
                <div class="item base">
                  ${iconHtml(subtipo?.icon)}
                  <span class="label">${subtipoLabel}</span>
                  <span class="amount">${formatMxn(subtipo?.base || 0)}</span>
                </div>
                ${groupsHtml}
                <div class="item subtotal"><span>${L("Subtotal")}</span><span class="amount">${formatMxn(calc.total)}</span></div>
                <div class="item iva"><span>${L("IVA · 16%")}</span><span class="amount">${formatMxn(calc.total * 0.16)}</span></div>
                <div class="item total"><span>${L("Total MXN")}</span><span class="amount">${formatMxn(totalConIva)}</span></div>
              </div>
            </article>

            <!-- Highlights · qué incluye iBisne (humanos) -->
            <article class="rk-card rk-highlights">
              <div class="rk-card-eyebrow">— LO QUE INCLUYE TU PROYECTO CON iBISNE</div>
              <div class="bp-grid">
                <div class="bp-item">
                  <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('partnership','line') : '✓'}</span>
                  <div>
                    <strong>Soporte dedicado</strong>
                    <p>Una persona asignada desde el día 1.</p>
                  </div>
                </div>
                <div class="bp-item">
                  <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('shield','line') : '✓'}</span>
                  <div>
                    <strong>Acompañamiento 24/7</strong>
                    <p>Por WhatsApp directo con tu equipo.</p>
                  </div>
                </div>
                <div class="bp-item">
                  <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('arrow','line') : '✓'}</span>
                  <div>
                    <strong>De 0 al lanzamiento</strong>
                    <p>Sin proveedores externos · lo hace iBisne.</p>
                  </div>
                </div>
                <div class="bp-item">
                  <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('clock','line') : '✓'}</span>
                  <div>
                    <strong>Un año de seguimiento</strong>
                    <p>Ajustes incluidos · no desaparecemos.</p>
                  </div>
                </div>
              </div>
            </article>

            <!-- Mini FAQ · objection handling -->
            <article class="rk-card rk-faq">
              <div class="rk-card-eyebrow">— PREGUNTAS COMUNES</div>
              <details class="rk-faq-item">
                <summary>¿Qué pasa después de pagar el anticipo?</summary>
                <div>Te asignamos KAM en menos de 24h. Agendamos discovery call para firmar el alcance exacto. Si en discovery decidimos que el proyecto no es viable, devolvemos el 100% del anticipo.</div>
              </details>
              <details class="rk-faq-item">
                <summary>¿Puedo modificar la cotización después?</summary>
                <div>Sí. Hasta firmar discovery, ajustamos cualquier opción. Después de firmar, modificaciones grandes se cotizan aparte (siempre con tu aprobación).</div>
              </details>
              <details class="rk-faq-item">
                <summary>¿En cuánto tiempo arrancamos?</summary>
                <div>Discovery en menos de 7 días desde el pago del anticipo. Producción arranca tras firmar discovery (usualmente la misma semana).</div>
              </details>
              <details class="rk-faq-item">
                <summary>¿Hay costos extras durante el proyecto?</summary>
                <div>No. El precio es cerrado: incluye discovery, diseño, desarrollo, deploy, hosting primer año y un año de seguimiento. Si algo cambia el alcance, lo cotizamos aparte con tu aprobación previa.</div>
              </details>
            </article>

          </div>

          <!-- ────── DERECHA · sticky checkout ────── -->
          <aside class="rk-right">
            <div class="rk-checkout">

              <div class="rk-total-label">— TOTAL CON IVA</div>
              <div class="rk-total-amount">${formatMxn(totalConIva)}<span class="rk-total-currency">MXN</span></div>
              <div class="rk-total-hint">Pago en 2 partes · 50% al firmar discovery · 50% al entregar</div>

              <a href="https://paypal.me/iBisne" target="_blank" rel="noopener" class="rk-cta-pay" data-cta="pay-now">
                <span class="rk-cta-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('wallet','line') : '$'}</span>
                <span class="rk-cta-text">
                  <strong>Pagar anticipo · ${formatMxn(totalConIva * 0.5)}</strong>
                  <span class="rk-cta-sub">PayPal · seguro y verificado</span>
                </span>
                <span class="rk-cta-arrow">→</span>
              </a>

              <div class="rk-methods">
                <div class="rk-methods-label">Otros métodos · próximamente</div>
                <div class="rk-methods-grid">
                  <button class="rk-method" type="button" disabled aria-label="Mercado Pago">
                    <span class="rk-method-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('wallet','line') : ''}</span>
                    <span class="rk-method-name">Mercado Pago</span>
                  </button>
                  <button class="rk-method" type="button" disabled aria-label="SPEI">
                    <span class="rk-method-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('cash','line') : ''}</span>
                    <span class="rk-method-name">SPEI · OXXO</span>
                  </button>
                  <button class="rk-method" type="button" disabled aria-label="Cripto">
                    <span class="rk-method-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('coin','line') : ''}</span>
                    <span class="rk-method-name">Cripto · USDC</span>
                  </button>
                </div>
              </div>

              <ul class="rk-trust">
                <li>
                  <span class="rk-trust-ic">✓</span>
                  <span><strong>50% al firmar discovery · 50% al entregar.</strong> Sin pagos sorpresa.</span>
                </li>
                <li>
                  <span class="rk-trust-ic">✓</span>
                  <span><strong>Garantía discovery firmable.</strong> Si no te firmamos discovery en 7 días, devolvemos el anticipo.</span>
                </li>
                <li>
                  <span class="rk-trust-ic">✓</span>
                  <span><strong>Folio reservado 30 días.</strong> Tu precio queda fijo hasta el ${fechaVigencia}.</span>
                </li>
                <li>
                  <span class="rk-trust-ic">✓</span>
                  <span><strong>Cero spam · cero llamadas no solicitadas.</strong> Te contacta solo tu KAM asignado.</span>
                </li>
              </ul>

              <div class="rk-actions">
                <button class="btn btn-line rk-btn-secondary" id="btn-print" type="button">${L("Descargar PDF")}</button>
                <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-line rk-btn-secondary">${L("Compartir por WhatsApp →")}</a>
              </div>

              <div class="rk-hunter">
                <a href="${waUrl}" target="_blank" rel="noopener">${L("¿Tienes preguntas? Habla con un hunter")} →</a>
              </div>

            </div>
          </aside>
        </div>

        <!-- Mobile sticky CTA · solo visible en pantallas chicas -->
        <a href="https://paypal.me/iBisne" target="_blank" rel="noopener" class="rk-mobile-cta" data-cta="pay-now-mobile">
          <span class="rk-mobile-cta-label">Pagar anticipo</span>
          <span class="rk-mobile-cta-amount">${formatMxn(totalConIva * 0.5)} →</span>
        </a>

        <!-- ─── COTIZACIÓN FORMAL · solo visible en print (PDF) ─────────────── -->
        <section class="print-cotizacion" aria-hidden="true">
          <header class="pc-header">
            <div class="pc-brand">
              <img src="brand/iBisne_blanco.png" alt="iBisne">
              <div class="pc-brand-tagline">Holding LATAM · Capital + ejecución</div>
            </div>
            <div class="pc-meta">
              <div class="pc-meta-row"><span class="pc-k">${L("Folio")}</span><span class="pc-v">#${folio}</span></div>
              <div class="pc-meta-row"><span class="pc-k">Fecha</span><span class="pc-v">${fechaHoy}</span></div>
              <div class="pc-meta-row"><span class="pc-k">Vigencia</span><span class="pc-v">${fechaVigencia}</span></div>
            </div>
          </header>

          <h1 class="pc-title">Cotización indicativa</h1>
          <p class="pc-subtitle">${verticalLabel} · ${subtipoLabel} · ${calc.modules} módulos configurados</p>

          <div class="pc-grid pc-grid-2">
            <section class="pc-block">
              <div class="pc-block-title">Atendido por</div>
              <div class="pc-info">
                <div class="pc-info-row"><strong>${IBISNE_INFO.razonSocial}</strong></div>
                <div class="pc-info-row">${IBISNE_INFO.email}</div>
                <div class="pc-info-row">WhatsApp: ${IBISNE_INFO.whatsapp}</div>
                <div class="pc-info-row">${IBISNE_INFO.web}</div>
                <div class="pc-info-row">${IBISNE_INFO.direccion}</div>
              </div>
            </section>
            <section class="pc-block">
              <div class="pc-block-title">Cliente</div>
              <div class="pc-info pc-info-blanks">
                <div class="pc-info-row"><span class="pc-blank-key">Nombre</span><span class="pc-blank">_______________________________</span></div>
                <div class="pc-info-row"><span class="pc-blank-key">Empresa</span><span class="pc-blank">_______________________________</span></div>
                <div class="pc-info-row"><span class="pc-blank-key">Email</span><span class="pc-blank">_______________________________</span></div>
                <div class="pc-info-row"><span class="pc-blank-key">WhatsApp</span><span class="pc-blank">_______________________________</span></div>
                <div class="pc-info-row"><span class="pc-blank-key">RFC</span><span class="pc-blank">_______________________________</span></div>
              </div>
            </section>
          </div>

          <section class="pc-block pc-breakdown">
            <div class="pc-block-title">Desglose del proyecto</div>
            <div class="pc-line pc-line-base">
              <span class="pc-line-name">${subtipoLabel}</span>
              <span class="pc-line-amount">${formatMxn(subtipo?.base || 0)}</span>
            </div>
            ${groups.map(g => `
              <div class="pc-group">
                <div class="pc-group-head">${g.meta.label}</div>
                ${g.items.map(li => `
                  <div class="pc-line">
                    <span class="pc-line-name">${li.label}</span>
                    <span class="pc-line-amount">${li.add >= 0 ? '+ ' : ''}${formatMxn(li.add)}</span>
                  </div>
                `).join('')}
                <div class="pc-group-sub">
                  <span>Subtotal ${g.meta.label.toLowerCase()}</span>
                  <span>${formatMxn(g.subtotal)}</span>
                </div>
              </div>
            `).join('')}
          </section>

          <section class="pc-totals">
            <div class="pc-total-row"><span>${L("Subtotal")}</span><span>${formatMxn(calc.total)}</span></div>
            <div class="pc-total-row"><span>${L("IVA · 16%")}</span><span>${formatMxn(calc.total * 0.16)}</span></div>
            <div class="pc-total-row pc-total-final"><span>TOTAL MXN</span><span>${formatMxn(calc.total * 1.16)}</span></div>
          </section>

          <div class="pc-grid pc-grid-2">
            <section class="pc-block">
              <div class="pc-block-title">${L("Equipo asignado")}</div>
              <div class="pc-chips">
                ${(calc.team || []).map(t => `<span class="pc-chip">${t}</span>`).join('')}
              </div>
            </section>
            <section class="pc-block">
              <div class="pc-block-title">Stack tecnológico</div>
              <ul class="pc-list">
                ${stackItems.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </section>
          </div>

          <section class="pc-block">
            <div class="pc-block-title">Tu proyecto iBisne incluye siempre</div>
            <ul class="pc-list pc-conditions">
              <li><strong>Equipo asignado</strong> · ${(calc.team || []).join(' · ')} dedicados.</li>
              <li><strong>Infraestructura</strong> · hosting + dominio + DB · primer año sin costo.</li>
              <li><strong>Discovery firmable</strong> antes de cobrar · alcance cerrado.</li>
              <li><strong>3 rondas de ajustes</strong> gratuitas durante el primer año.</li>
            </ul>
          </section>

          <section class="pc-block">
            <div class="pc-block-title">Condiciones comerciales</div>
            <ul class="pc-list pc-conditions">
              <li><strong>50% anticipo</strong> al firmar · 50% contra entrega.</li>
              <li>Cifra <strong>indicativa</strong> · sujeta a discovery firmable.</li>
              <li>Vigencia: 30 días desde emisión · precios MXN + IVA 16%.</li>
              <li>Pago: SPEI · Mercado Pago · PayPal · Cripto (USDC/BTC).</li>
              <li><strong>KAM, consultoría y soporte continuo</strong> son parte de la membresía iBisne (ver propuesta).</li>
            </ul>
          </section>

          <section class="pc-signatures">
            <div class="pc-sign-block">
              <div class="pc-sign-line">_____________________________</div>
              <div class="pc-sign-label">Cliente · Nombre y firma</div>
            </div>
            <div class="pc-sign-block">
              <div class="pc-sign-line">_____________________________</div>
              <div class="pc-sign-label">iBisne S.A.S de C.V. · Hunter asignado</div>
            </div>
          </section>

          <footer class="pc-footer">
            <span>${IBISNE_INFO.razonSocial}</span>
            <span>${IBISNE_INFO.email} · ${IBISNE_INFO.whatsapp}</span>
            <span>Folio #${folio} · ${fechaHoy}</span>
          </footer>
        </section>

        <div class="edit-modal" id="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title" hidden>
          <div class="edit-modal-backdrop" data-close></div>
          <div class="edit-modal-content" tabindex="-1">
            <div class="edit-modal-header">
              <h3 id="edit-modal-title">${L('Editar selección')}</h3>
              <button class="edit-modal-close" data-close type="button" aria-label="${L('Cerrar')}">×</button>
            </div>
            <div class="edit-modal-body" id="edit-modal-body"></div>
            <div class="edit-modal-actions">
              <button class="btn btn-ghost" data-close type="button">${L('Cancelar')}</button>
              <button class="btn btn-primary" id="edit-modal-apply" type="button">${L('Aplicar')}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $('#btn-print')?.addEventListener('click', () => window.print());
    bindEditModal();
    // Listener para selección de membresía · todos los botones data-pick-membership
    $$('[data-pick-membership]').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.pickMembership;
        const m = (window.IBISNE_PRICING?.memberships || []).find(x => x.id === id);
        if (!m) return;
        const priceIva = m.price * 1.16;
        const projectTotal = formatMxn(calc.total * 1.16);
        const savings = formatMxn(Math.max(0, calc.total * 1.16 - priceIva));
        const memberMsg = `Hola, vengo del cotizador iBisne con folio #${folio}.

Quiero contratar la MEMBRESÍA ${m.label.toUpperCase()}: ${formatMxn(priceIva)} MXN/año (IVA incluido).

Mi proyecto cotizado: ${projectTotal} MXN
Ahorro vs proyecto puntual: ${savings} el primer año.

Configuración del proyecto:
• ${verticalLabel} · ${subtipoLabel}
${lineItemsText}

Quiero arrancar la membresía y el discovery.`;
        const url = `https://wa.me/523329575274?text=${encodeURIComponent(memberMsg)}`;
        window.open(url, '_blank', 'noopener');
      });
    });

    // v5.0 · Cotizador puro · sin modales · pay-now usa href PayPal directo

    showAsideB();
  }

  // ─── Modal de edición de cotización ──────────────────────────────────
  function findQuestionById(qid){
    const PRICING = window.IBISNE_PRICING;
    const branch = State.answers.subtipo?.branch;
    const fromAlcance = (PRICING.alcance[branch] || []).find(q => q.id === qid);
    if (fromAlcance) return fromAlcance;
    return (PRICING.universales || []).find(q => q.id === qid);
  }

  function bindEditModal(){
    const modal = $('#edit-modal');
    if (!modal) return;
    let currentQid = null;
    let pendingSelection = null;
    let lastTrigger = null;  // a11y: retornar focus al cerrar

    function getFocusable(){
      return modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    }

    function openModal(qid, trigger){
      const q = findQuestionById(qid);
      if (!q) return;
      currentQid = qid;
      pendingSelection = State.answers[qid] || null;
      lastTrigger = trigger || document.activeElement;
      $('#edit-modal-title').textContent = q.label;
      const isMulti = q.multi === true;
      const selIds = isMulti
        ? new Set((State.answers[qid] || []).map(s => s.id))
        : new Set(State.answers[qid] ? [State.answers[qid].id] : []);
      const body = $('#edit-modal-body');
      body.innerHTML = q.opciones.map(o => {
        let meta = null;
        if (o.add !== undefined && o.add !== 0) meta = (o.add > 0 ? '+ ' : '') + formatMxn(o.add);
        else if (o.mul !== undefined) meta = o.metaSuffix || '';
        return renderCard({
          id: o.id, label: o.label, description: o.description, schedule: o.schedule,
          icon: o.icon, meta, isSelected: selIds.has(o.id),
        });
      }).join('');
      body.classList.toggle('is-multi', isMulti);

      $$('#edit-modal-body .option').forEach(btn => btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const o = q.opciones.find(x => x.id === id);
        if (isMulti) {
          const list = pendingSelection || [];
          const exists = list.find(x => x.id === id);
          pendingSelection = exists ? list.filter(x => x.id !== id) : [...list, o];
          e.currentTarget.classList.toggle('is-selected');
        } else {
          pendingSelection = o;
          $$('#edit-modal-body .option').forEach(b => b.classList.remove('is-selected'));
          e.currentTarget.classList.add('is-selected');
        }
      }));
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      // a11y: focus al primer botón accionable del modal
      setTimeout(() => {
        const focusable = getFocusable();
        const first = focusable[0];
        if (first) first.focus();
      }, 30);
    }

    function closeModal(){
      modal.hidden = true;
      document.body.style.overflow = '';
      currentQid = null;
      pendingSelection = null;
      // a11y: retornar focus al trigger original
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        try { lastTrigger.focus(); } catch(_) {}
      }
      lastTrigger = null;
    }

    // Bind edit buttons (delegation)
    $$('#main .edit-btn').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      const qid = e.currentTarget.dataset.q;
      if (qid) openModal(qid, e.currentTarget);
    }));

    // Close handlers
    modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

    // a11y: ESC cierra · Tab cycle dentro del modal
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Apply
    $('#edit-modal-apply')?.addEventListener('click', () => {
      if (currentQid && pendingSelection !== null) {
        State.answers[currentQid] = pendingSelection;
      }
      closeModal();
      renderServicioResultado();
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // ETAPA 2 — DISCOVERY PROFUNDO
  // ═══════════════════════════════════════════════════════════════════

  function renderDiscoveryStep(){
    const DISC = window.IBISNE_DISCOVERY;
    if (!DISC) { navigate('#/'); return; }
    const idx = State.step - 1;
    const total = DISC.preguntas.length;

    if (idx < 0 || idx >= total) {
      navigate('#/discovery/1');
      return;
    }
    setProgress({ idx, flow: 'discovery' });
    const q = DISC.preguntas[idx];

    // State para discovery vive separado en State.discovery
    State.discovery = State.discovery || {};

    let body = `
      <div class="question-card">
        <div class="eyebrow">${L("Discovery")}</div>
        <h2 class="question-title">${q.label}</h2>
        <p class="question-help">${q.help || 'Cuéntanos para precisar el alcance del proyecto.'}</p>
    `;

    if (q.form) {
      body += '<div class="form-fields">';
      for (const f of q.campos) {
        const val = (State.discovery[q.id]?.[f.id] || '').replace(/"/g,'&quot;');
        if (f.textarea) {
          body += `
            <div class="form-field full">
              <label>${f.label}${f.required ? ' *' : ''}</label>
              <textarea name="${f.id}" rows="4" ${f.required ? 'required' : ''} style="background:transparent;border:1px solid var(--bg-line);padding:14px;font-family:var(--font-display);font-size:16px;color:var(--text-primary);outline:none;resize:vertical;width:100%;">${val}</textarea>
            </div>
          `;
        } else {
          body += `
            <div class="form-field full">
              <label>${f.label}${f.required ? ' *' : ''}</label>
              <input type="text" name="${f.id}" ${f.required ? 'required' : ''} value="${val}">
            </div>
          `;
        }
      }
      body += '</div>';
    } else {
      const isMulti = q.multi === true;
      const sel = State.discovery[q.id];
      const selIds = isMulti ? new Set((sel || []).map(s => s.id)) : new Set(sel ? [sel.id] : []);
      const cards = q.opciones.map(o => renderCard({
        id: o.id,
        label: o.label,
        isSelected: selIds.has(o.id),
      })).join('');
      body += `<div class="options is-discovery ${isMulti ? 'is-multi' : ''} ${q.opciones.length > 4 ? 'is-list' : ''}">${cards}</div>`;
    }

    body += `
        <div class="actions">
          ${idx > 0 ? '<button class="btn-ghost btn" data-prev type="button">← Anterior</button>' : '<a href="#/servicio/resultado" class="btn-ghost btn">← Volver al resultado</a>'}
          <button class="btn btn-primary" data-next type="button" ${canAdvanceDiscovery(q) ? '' : 'disabled'}>${idx === total - 1 ? 'Enviar a un hunter →' : 'Continuar →'}</button>
        </div>
      </div>
    `;

    $('#main').innerHTML = body;

    if (q.form) {
      $$('#main input, #main textarea').forEach(input => input.addEventListener('input', e => {
        State.discovery[q.id] = State.discovery[q.id] || {};
        State.discovery[q.id][e.target.name] = e.target.value;
        const next = $('[data-next]'); if (next) next.disabled = !canAdvanceDiscovery(q);
      }));
    } else {
      $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const o = q.opciones.find(x => x.id === id);
        if (q.multi) {
          const list = State.discovery[q.id] || [];
          const exists = list.find(x => x.id === id);
          State.discovery[q.id] = exists ? list.filter(x => x.id !== id) : [...list, o];
          e.currentTarget.classList.toggle('is-selected');
          const nxt = $('[data-next]'); if (nxt) nxt.disabled = !canAdvanceDiscovery(q);
        } else {
          State.discovery[q.id] = o;
          $$('#main .option').forEach(b => b.classList.remove('is-selected'));
          e.currentTarget.classList.add('is-selected');
          const nxt = $('[data-next]'); if (nxt) nxt.disabled = false;
          scheduleAdvance(idx === total - 1 ? '#/discovery/resultado' : '#/discovery/' + (State.step + 1));
        }
      }));
    }
    $('[data-next]')?.addEventListener('click', () => {
      if (!canAdvanceDiscovery(q)) return;
      if (idx === total - 1) navigate('#/discovery/resultado');
      else navigate('#/discovery/' + (State.step + 1));
    });
    $('[data-prev]')?.addEventListener('click', () => navigate('#/discovery/' + (State.step - 1)));
    hideBottom();
  }

  function canAdvanceDiscovery(q){
    const a = State.discovery?.[q.id];
    if (q.form) {
      const v = a || {};
      return q.campos.every(f => !f.required || (v[f.id] && v[f.id].trim().length > 0));
    }
    if (q.multi) return Array.isArray(a) && a.length > 0;
    return !!a;
  }

  function renderDiscoveryResultado(){
    setProgress(100);
    const DISC = window.IBISNE_DISCOVERY;
    const cot = computeB();
    const priority = DISC.prioridad(State.discovery || {}, cot.total);
    const folio = getCurrentFolio();

    persistLead({
      route: 'discovery', stage: 2,
      pdf_folio: folio,
      respuestas_etapa1: State.answers,
      respuestas_etapa2: State.discovery,
      cotizacion_indicativa: cot.total,
      prioridad: priority.id,
    });

    $('#main').innerHTML = `
      <div class="result-screen">
        <div class="result-veredicto">— DISCOVERY COMPLETO · ${priority.label}</div>
        <h2 class="result-headline">Tu brief llegó.<br><span class="accent">Un hunter te contacta pronto.</span></h2>
        <p class="result-body">Hemos recibido tu información de Etapa 2. El equipo de iBisne revisa el brief y un hunter te responde con cotización firmable según prioridad asignada. Mientras, puedes adelantar una llamada directo por WhatsApp.</p>
        <div class="cotizacion-preview">
          <h3>— RESUMEN PARA TU HUNTER</h3>
          <div class="item"><span>Folio cotización</span><span class="amount">#${folio}</span></div>
          <div class="item"><span>Indicativa Etapa 1</span><span class="amount">${formatMxn(cot.total)}</span></div>
          <div class="item"><span>Objetivo</span><span class="amount">${State.discovery?.objetivo?.label || '—'}</span></div>
          <div class="item"><span>Audiencia</span><span class="amount">${State.discovery?.audiencia?.label || '—'}</span></div>
          <div class="item"><span>Facturación</span><span class="amount">${State.discovery?.facturacion?.label || '—'}</span></div>
          <div class="item"><span>Presupuesto</span><span class="amount">${State.discovery?.presupuesto?.label || '—'}</span></div>
          <div class="item"><span>Decisor</span><span class="amount">${State.discovery?.decisor?.label || '—'}</span></div>
          <div class="item total"><span>Prioridad asignada</span><span class="amount">${priority.id}</span></div>
        </div>
        <div class="result-cta">
          <a href="https://wa.me/523329575274?text=Hola%2C%20completé%20discovery%20etapa%202%20-%20folio%20%23${folio}" target="_blank" rel="noopener" class="btn btn-primary">Adelantar llamada por WhatsApp →</a>
          <a href="index.html" class="btn-ghost btn">← Volver al inicio</a>
        </div>
      </div>
    `;
    hideBottom();
  }

  // ─── BOTTOM BAR B (Servicio) ─────────────────────────────────────────
  function renderBottomBarB(){
    // Chevron apuntando hacia arriba (rotado vs el chevron default que apunta abajo).
    // Al expandirse el bar, CSS rota 180°, así que el chevron termina apuntando hacia abajo (cerrar).
    const chevronUp = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>';
    return `
      <div class="qb-summary" id="qb-summary-toggle">
        <div class="qb-tipo-block">
          <div class="qb-tipo is-empty" id="qb-tipo">${L("Aún sin definir")}</div>
          <div class="qb-config" id="qb-config-mini">${L("Selecciona tu producto para empezar")}</div>
        </div>
        <div class="qb-meta-block qb-intent-block">
          <div class="qb-meta-label">${L("Cómo va a quedar tu proyecto")}</div>
          <div class="qb-intent-line">
            <div class="qb-intent-dot" id="qb-intent-dot" style="left: 50%;"></div>
          </div>
          <div class="qb-intent-labels">
            <span>${L("Rápido")}</span><span>${L("Equilibrado")}</span><span>${L("Premium")}</span>
          </div>
        </div>
        <div class="qb-total-block">
          <div class="qb-total-label">${L("Precio aproximado")}</div>
          <div class="qb-total-number"><span data-countup data-format="mxn" id="qb-total">$ 0</span><span class="currency" id="qb-currency-code">MXN</span></div>
          <div class="qb-total-sub" style="font-family:var(--font-mono); font-size:10px; letter-spacing:0.14em; color:var(--text-muted); margin-top:2px;">${L("IVA incluido")}</div>
        </div>
        <div class="qb-nav-block">
          <button class="qb-nav-btn qb-nav-prev" id="qb-nav-prev" type="button" aria-label="Pregunta anterior">← Atrás</button>
          <button class="qb-nav-btn qb-nav-next" id="qb-nav-next" type="button" aria-label="Siguiente pregunta" disabled>${L("Siguiente")} →</button>
        </div>
      </div>
      <button class="qb-toggle" id="qb-toggle-btn" type="button" aria-label="Abrir resumen">${chevronUp}</button>
      <div class="qb-expanded-content">
        <div class="qb-block">
          <div class="qb-block-label">${L("— Lo que llevas elegido")}</div>
          <ul class="qb-config-list" id="qb-config-full"><li style="color:var(--text-muted);">${L("Aún sin selecciones")}</li></ul>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">${L("— Quiénes lo hacen")}</div>
          <div class="team-chips" id="qb-team">
            ${['KAM','Frontend','Backend','UX/UI','PM','DevOps','QA'].map(t => `<span class="team-chip" data-team="${t}">${t}</span>`).join('')}
          </div>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">${L("— Tecnología que usamos")}</div>
          <ul class="qb-config-list" id="qb-stack">
            <li style="color:var(--text-muted);">${L("Selecciona vertical y sub-tipo")}</li>
          </ul>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">${L("— Cómo va a quedar tu proyecto")}</div>
          <div class="qb-intent-text" id="qb-intent-text" style="font-family:var(--font-display); font-size:14px; line-height:1.5; color:var(--accent-mint);">${L("Elige opciones para ver el acabado")}</div>
          <ul class="qb-config-list" style="margin-top:10px;">
            <li>${L("50% anticipo · 50% entrega")}</li>
            <li>${L("3 ajustes gratuitos primer año")}</li>
            <li>${L("Indicativo · sujeto a discovery")}</li>
          </ul>
        </div>
      </div>
    `;
  }

  function computeB(){
    const PRICING = window.IBISNE_PRICING;
    const a = State.answers;
    const subtipo = a.subtipo;
    const vertical = a.vertical;
    const flags = new Set();
    const intentScore = { lanzamiento: 0, engagement: 0, marketing: 0 };
    function addIntent(opt){
      if (opt && opt.intent && intentScore[opt.intent] !== undefined) intentScore[opt.intent]++;
    }

    if (!subtipo || subtipo.contact) {
      return {
        total: 0, lineItems: [],
        tier: PRICING.getTier(0),
        team: ['Frontend'],
        time: '—',
        plazoMul: 1.0,
        isContact: !!subtipo?.contact,
        intentScore, intent: null, intentText: '',
      };
    }

    // Subtipo aporta intent
    addIntent(subtipo);

    let total = subtipo.base || 0;
    const lineItems = [];

    // 1. Sumar respuestas de alcance específico
    const branchQs = (PRICING.alcance[subtipo.branch] || []);
    for (const q of branchQs) {
      const ans = a[q.id];
      if (!ans) continue;
      if (Array.isArray(ans)) {
        for (const item of ans) {
          total += item.add || 0;
          if (item.flag) flags.add(item.flag);
          addIntent(item);
          if (item.add) lineItems.push({ qid: q.id, id: item.id, label: item.label, add: item.add, icon: item.icon });
        }
      } else {
        total += ans.add || 0;
        if (ans.flag) flags.add(ans.flag);
        addIntent(ans);
        if (ans.add) lineItems.push({ qid: q.id, id: ans.id, label: ans.label, add: ans.add, icon: ans.icon });
      }
    }

    // 2. Sumar universales (excepto plazo que es multiplicador)
    let plazoMul = 1.0;
    let plazoLabel = null;
    let plazoIcon = null;
    for (const q of (PRICING.universales || [])) {
      const ans = a[q.id];
      if (!ans) continue;
      if (q.id === 'plazo') {
        plazoMul = ans.mul || 1.0;
        plazoLabel = ans.label + (ans.metaSuffix ? ' (' + ans.metaSuffix + ')' : '');
        plazoIcon = ans.icon;
        addIntent(ans);
        continue;
      }
      if (Array.isArray(ans)) {
        for (const item of ans) {
          total += item.add || 0;
          if (item.flag) flags.add(item.flag);
          addIntent(item);
          if (item.add) lineItems.push({ qid: q.id, id: item.id, label: item.label, add: item.add, icon: item.icon });
        }
      } else {
        if (ans.add) {
          total += ans.add;
          lineItems.push({ qid: q.id, id: ans.id, label: ans.label, add: ans.add, icon: ans.icon });
        }
        if (ans.flag) flags.add(ans.flag);
        addIntent(ans);
      }
    }

    // 3. Aplicar multiplicador de plazo
    const subtotalAntesPlazo = total;
    total = total * plazoMul;
    if (plazoLabel && plazoMul !== 1.0) {
      const ajuste = total - subtotalAntesPlazo;
      lineItems.push({ qid: 'plazo', id: a.plazo.id, label: plazoLabel, add: ajuste, icon: plazoIcon });
    }

    // Acabado del proyecto (reemplaza el mapa de calor de intención)
    const totalRedondeado = Math.round(total);
    const speed = PRICING.getSpeed(totalRedondeado, subtipo, flags, plazoMul);
    const speedZone = PRICING.getSpeedZone(speed);
    const speedText = PRICING.getSpeedText(speed);

    // Módulos activos: cuántas piezas reales seleccionó el usuario
    // (cada lineItem es una decisión con costo o relevante para el alcance).
    // Filtramos el ajuste de plazo (no es un módulo, es un multiplicador).
    const modulesCount = lineItems.filter(li => li.qid !== 'plazo').length
      + (subtipo ? 1 : 0); // el sub-tipo en sí cuenta como módulo base

    return {
      total: totalRedondeado,
      subtotal: subtotalAntesPlazo,
      lineItems,
      tier: PRICING.getTier(total),
      team: PRICING.getTeam(total, flags),
      time: PRICING.getTime(vertical?.id, subtipo.id, total),
      modules: modulesCount,
      plazoMul,
      isContact: false,
      speed,
      speedZone,
      speedText,
      flags, // exponer flags para uso externo (modal de edición, etc.)
    };
  }

  function refreshBottomB(){
    if (State.route !== 'servicio') return;
    const calc = computeB();
    const vertical = State.answers.vertical;
    const subtipo = State.answers.subtipo;

    const elTipo = $('#qb-tipo');
    if (elTipo) {
      let label;
      if (subtipo) label = vertical?.label + ' · ' + subtipo.label;
      else if (vertical) label = vertical.label + ' · selecciona sub-tipo';
      else label = 'Aún sin definir';
      elTipo.textContent = label;
      elTipo.classList.toggle('is-empty', !subtipo);
    }
    const elConfigMini = $('#qb-config-mini');
    if (elConfigMini) {
      const cat = subtipo?.category || vertical?.category;
      if (calc.lineItems.length) {
        const labels = calc.lineItems.slice(0, 2).map(li => li.label).join(' · ');
        const extra  = calc.lineItems.length > 2 ? ' · +' + (calc.lineItems.length - 2) + ' más' : '';
        elConfigMini.textContent = (cat ? cat + ' · ' : '') + labels + extra;
      } else if (cat) {
        elConfigMini.textContent = cat;
      } else {
        elConfigMini.textContent = 'Selecciona vertical para empezar';
      }
    }
    const elConfigFull = $('#qb-config-full');
    if (elConfigFull) {
      elConfigFull.innerHTML = calc.lineItems.length
        ? calc.lineItems.map(li => `<li>${li.label}</li>`).join('')
        : `<li style="color:var(--text-muted);">${L("Aún sin selecciones")}</li>`;
    }
    $$('#qb-team .team-chip').forEach(c => c.classList.toggle('is-active', calc.team.includes(c.dataset.team)));

    // Stack dinámico según vertical/subtipo (Hostinger / Vercel / Shopify / etc.)
    const elStack = $('#qb-stack');
    if (elStack) {
      if (vertical && subtipo && window.IBISNE_PRICING.getStack) {
        const stack = window.IBISNE_PRICING.getStack(vertical.id, subtipo.id);
        elStack.innerHTML = stack.map(s => `<li>${s}</li>`).join('');
      } else {
        elStack.innerHTML = `<li style="color:var(--text-muted);">${L("Selecciona vertical y sub-tipo")}</li>`;
      }
    }
    // (badge "X módulos" inline retirado — se mantiene en panel expandido si aplica)

    // Sincronizar nav del bottom bar con los botones inline ocultos
    const navPrev = $('#qb-nav-prev');
    const navNext = $('#qb-nav-next');
    const isResult = State.step === 'resultado';
    if (navPrev) {
      // Contexto:
      // · resultado → "← Editar" (regresa al último step del quiz)
      // · step 1    → "← Inicio"
      // · otros     → "← Anterior"
      navPrev.textContent = isResult ? '← Editar' : (State.step <= 1 ? '← Inicio' : '← Anterior');
    }
    if (navNext) {
      if (isResult) {
        // En resultado: CTA de pago directo a PayPal
        navNext.textContent = 'Pagar ahora · PayPal →';
        navNext.disabled = false;
      } else {
        const inlineNext = $('#main [data-next]');
        if (inlineNext) {
          navNext.disabled = !!inlineNext.disabled;
        } else {
          navNext.disabled = !subtipo;
        }
        const steps = getServicioSteps();
        const isLast = State.step >= steps.length;
        navNext.textContent = isLast ? 'Ver cotización →' : 'Continuar →';
      }
    }
    const elTotal = $('#qb-total'); if (elTotal) countUp(elTotal, calc.total * 1.16); // ahora muestra el TOTAL con IVA
    const elCurr  = $('#qb-currency-code');
    if (elCurr && window.IBISNE_PREFS) elCurr.textContent = window.IBISNE_PREFS.currencyCode();

    // Línea de velocidad de salida
    const elDot = $('#qb-intent-dot');
    if (elDot) {
      elDot.style.left = (calc.speed != null ? calc.speed : 50) + '%';
      elDot.classList.remove('intent-mvp','intent-estandar','intent-premium');
      if (calc.speedZone) elDot.classList.add('intent-' + calc.speedZone);
    }
    const elIntentText = $('#qb-intent-text');
    if (elIntentText) {
      elIntentText.textContent = subtipo ? (calc.speedText || '') : 'Selecciona opciones para ver la velocidad de salida';
    }

    // refreshMobileMenu removido en v3.12 · el resumen ahora vive en el resultado final
  }
  // legacy alias
  const refreshPanelB = refreshBottomB;

  // ─── BOTTOM BAR A (Socio) ────────────────────────────────────────────
  function renderBottomBarA(){
    const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>';
    return `
      <div class="qb-summary" id="qb-summary-toggle">
        <div class="qb-tipo-block">
          <div class="qb-tipo is-empty" id="qb-negocio">${L("Aún sin definir")}</div>
          <div class="qb-config" id="qb-config-mini">Responde las preguntas para evaluar tu fit</div>
        </div>
        <div class="qb-meta-block">
          <div class="qb-meta-label">Tier compromiso iBisne</div>
          <div class="qb-meta-value"><span class="tier-badge" id="qb-compromiso">—</span></div>
        </div>
        <div class="qb-meta-block">
          <div class="qb-meta-label">Comisión ofrecida</div>
          <div class="qb-meta-value" id="qb-comision">—</div>
        </div>
        <div class="qb-total-block">
          <div class="qb-total-label">Fit score</div>
          <div class="qb-total-number"><span data-countup id="qb-score">0</span><span class="currency"> / 100</span></div>
        </div>
      </div>
      <button class="qb-toggle" id="qb-toggle-btn" type="button" aria-label="Abrir resumen">${chevron}</button>
      <div class="qb-expanded-content">
        <div class="qb-block">
          <div class="qb-block-label">— Canales activos</div>
          <div class="qb-channels" id="qb-channels"></div>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">— Solución que iBisne ejecutaría</div>
          <ul class="qb-config-list" id="qb-solucion"><li style="color:var(--text-muted);">${L("Aún sin selecciones")}</li></ul>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">— Veredicto preliminar</div>
          <div class="qb-meta-value" id="qb-veredicto" style="font-size:14px; color:var(--accent);">PENDIENTE</div>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">— Cómo opera iBisne</div>
          <ul class="qb-config-list">
            <li>Capital propio · 0% management fee</li>
            <li>Mesa de trabajo anual</li>
            <li>Comisión sobre ventas digitales</li>
          </ul>
        </div>
      </div>
    `;
  }

  function refreshBottomA(){
    if (State.route !== 'socio') return;
    const a = State.answers;
    const inferencia = window.IBISNE_INFERENCE.calcular(a);
    const result = window.IBISNE_SCORING.calcular(a, inferencia.totalMxn);

    const elNegocio = $('#qb-negocio');
    if (elNegocio) {
      const parts = [a.que_vendes?.label, a.tiempo?.label, a.facturacion?.label].filter(Boolean);
      if (parts.length) {
        elNegocio.textContent = parts.join(' · ');
        elNegocio.classList.remove('is-empty');
      } else {
        elNegocio.textContent = 'Aún sin definir';
        elNegocio.classList.add('is-empty');
      }
    }
    const elConfigMini = $('#qb-config-mini');
    if (elConfigMini) {
      if (inferencia.items.length) {
        const labels = inferencia.items.slice(0, 2).map(i => i.label).join(' · ');
        const extra = inferencia.items.length > 2 ? ' · +' + (inferencia.items.length - 2) : '';
        elConfigMini.textContent = labels + extra;
      } else {
        elConfigMini.textContent = 'Responde las preguntas para evaluar tu fit';
      }
    }
    const elChannels = $('#qb-channels');
    if (elChannels) {
      const all = [
        { id: 'punto-fisico',     label: 'Tienda física' },
        { id: 'marketplaces',     label: 'Marketplaces' },
        { id: 'redes',            label: 'Redes' },
        { id: 'ecommerce-propio', label: 'Ecommerce propio' },
        { id: 'no-digital',       label: 'Sin digital' },
      ];
      const sel = new Set((a.donde_vendes || []).map(c => c.id));
      elChannels.innerHTML = all.map(c => `<span class="panel-channel ${sel.has(c.id) ? 'is-active' : ''}">${c.label}</span>`).join('');
    }
    const elSolucion = $('#qb-solucion');
    if (elSolucion) {
      elSolucion.innerHTML = inferencia.items.length
        ? inferencia.items.map(i => `<li>${i.label}</li>`).join('')
        : `<li style="color:var(--text-muted);">${L("Aún sin selecciones")}</li>`;
    }
    const elCompromiso = $('#qb-compromiso'); if (elCompromiso) elCompromiso.textContent = inferencia.tier.label;
    const elComision = $('#qb-comision'); if (elComision) elComision.textContent = a.comision?.label || '—';

    const answered = ['que_vendes','tiempo','facturacion','donde_vendes','tu_online','digital','equipo','comision','reto']
      .filter(k => a[k] && (Array.isArray(a[k]) ? a[k].length : true)).length;

    const elScore = $('#qb-score'); if (elScore) countUp(elScore, answered === 0 ? 0 : result.score, 700);
    const elVer = $('#qb-veredicto');
    if (elVer) {
      if (answered < 3) {
        elVer.textContent = 'PENDIENTE';
        elVer.style.color = 'var(--text-muted)';
      } else {
        elVer.textContent = result.veredicto.label;
        elVer.style.color = result.veredicto.id === 'no-momento' ? 'var(--text-secondary)' : 'var(--accent)';
      }
    }
  }
  const refreshPanelA = refreshBottomA;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO INVERSIONISTA · brief sin cotización
  // ═══════════════════════════════════════════════════════════════════

  function renderInversorStep(){
    const M = window.IBISNE_INVERSOR;
    if (!M) { navigate('#/'); return; }
    const idx = State.step - 1;
    const total = M.preguntas.length;
    if (idx < 0 || idx >= total) { navigate('#/inversor/1'); return; }
    setProgress({ idx, flow: 'inversor' });

    State.inversor = State.inversor || {};
    const q = M.preguntas[idx];

    let body = `
      <div class="question-card">
        <div class="eyebrow">${L("Inversionista")}</div>
        <h2 class="question-title">${q.label}</h2>
        <p class="question-help">${q.help || 'Ayúdanos a entender tu perfil de inversión.'}</p>
    `;

    if (q.form) {
      body += '<div class="form-fields">';
      for (const f of q.campos) {
        const val = (State.inversor[q.id]?.[f.id] || '').replace(/"/g,'&quot;');
        body += `
          <div class="form-field ${f.id === 'linkedin' ? 'full' : ''}">
            <label>${f.label}${f.required ? ' *' : ''}</label>
            <input type="${f.type || 'text'}" name="${f.id}" ${f.required ? 'required' : ''} value="${val}">
          </div>
        `;
      }
      body += '</div>';
    } else {
      const isMulti = q.multi === true;
      const sel = State.inversor[q.id];
      const selIds = isMulti ? new Set((sel || []).map(s => s.id)) : new Set(sel ? [sel.id] : []);
      const cards = q.opciones.map(o => renderCard({
        id: o.id, label: o.label, description: o.description,
        isSelected: selIds.has(o.id),
      })).join('');
      body += `<div class="options ${isMulti ? 'is-multi' : ''} ${gridClassByCount(q.opciones.length)}">${cards}</div>`;
    }

    body += `
        <div class="actions">
          ${idx > 0 ? '<button class="btn-ghost btn" data-prev type="button">← Anterior</button>' : '<a href="#/" class="btn-ghost btn">← Clasificador</a>'}
          <button class="btn btn-primary" data-next type="button" ${canAdvanceInversor(q) ? '' : 'disabled'}>${idx === total - 1 ? 'Enviar a captación →' : 'Continuar →'}</button>
        </div>
      </div>
    `;

    $('#main').innerHTML = body;

    if (q.form) {
      $$('#main input').forEach(input => input.addEventListener('input', e => {
        State.inversor[q.id] = State.inversor[q.id] || {};
        State.inversor[q.id][e.target.name] = e.target.value;
        const next = $('[data-next]'); if (next) next.disabled = !canAdvanceInversor(q);
      }));
    } else {
      $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const o = q.opciones.find(x => x.id === id);
        if (q.multi) {
          const list = State.inversor[q.id] || [];
          const exists = list.find(x => x.id === id);
          State.inversor[q.id] = exists ? list.filter(x => x.id !== id) : [...list, o];
          e.currentTarget.classList.toggle('is-selected');
          const nxt = $('[data-next]'); if (nxt) nxt.disabled = !canAdvanceInversor(q);
        } else {
          State.inversor[q.id] = o;
          $$('#main .option').forEach(b => b.classList.remove('is-selected'));
          e.currentTarget.classList.add('is-selected');
          const nxt = $('[data-next]'); if (nxt) nxt.disabled = false;
          scheduleAdvance(idx === total - 1 ? '#/inversor/resultado' : '#/inversor/' + (State.step + 1));
        }
      }));
    }

    $('[data-next]')?.addEventListener('click', () => {
      if (!canAdvanceInversor(q)) return;
      if (idx === total - 1) navigate('#/inversor/resultado');
      else navigate('#/inversor/' + (State.step + 1));
    });
    $('[data-prev]')?.addEventListener('click', () => navigate('#/inversor/' + (State.step - 1)));
  }

  function canAdvanceInversor(q){
    const a = State.inversor?.[q.id];
    if (q.form) {
      const v = a || {};
      return q.campos.every(f => !f.required || (v[f.id] && v[f.id].trim().length > 0));
    }
    if (q.multi) return Array.isArray(a) && a.length > 0;
    return !!a;
  }

  function renderInversorResultado(){
    setProgress(100);
    const M = window.IBISNE_INVERSOR;
    const priority = M.prioridad(State.inversor || {});
    persistLead({
      route: 'inversor',
      respuestas: State.inversor,
      contacto: State.inversor?.datos || {},
      prioridad: priority.id,
    });

    $('#main').innerHTML = `
      <div class="result-screen">
        <div class="result-veredicto">— INVERSIONISTA · ${priority.label}</div>
        <h2 class="result-headline">Brief enviado.<br><span class="accent">Captación te contacta pronto.</span></h2>
        <p class="result-body">Recibimos tus datos. El equipo de captación de iBisne te contactará según prioridad asignada para conectarte con oportunidades del portfolio que coincidan con tu ticket, horizonte y verticales de interés.</p>
        <div class="cotizacion-preview">
          <h3>— RESUMEN ENVIADO A CAPTACIÓN</h3>
          <div class="item"><span>Tipo de inversor</span><span class="amount">${State.inversor?.tipo?.label || '—'}</span></div>
          <div class="item"><span>Ticket disponible</span><span class="amount">${State.inversor?.ticket?.label || '—'}</span></div>
          <div class="item"><span>Horizonte</span><span class="amount">${State.inversor?.horizonte?.label || '—'}</span></div>
          <div class="item"><span>Verticales de interés</span><span class="amount">${Array.isArray(State.inversor?.verticales) ? State.inversor.verticales.map(v => v.label).join(', ') : '—'}</span></div>
          <div class="item"><span>Experiencia LATAM</span><span class="amount">${State.inversor?.experiencia?.label || '—'}</span></div>
          <div class="item total"><span>Prioridad asignada</span><span class="amount">${priority.id}</span></div>
        </div>
        <div class="result-cta">
          <a href="https://wa.me/523329575274?text=Hola%2C%20soy%20inversionista%20interesado%20en%20iBisne" target="_blank" rel="noopener" class="btn btn-primary">Adelantar llamada por WhatsApp →</a>
          <a href="index.html" class="btn-ghost btn">← Volver al inicio</a>
        </div>
      </div>
    `;
    hideBottom();
  }

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO CONSULTORÍA · cotización con folio CON-XXX
  // ═══════════════════════════════════════════════════════════════════

  function renderConsultoriaStep(){
    const M = window.IBISNE_CONSULTORIA;
    if (!M) { navigate('#/'); return; }
    const idx = State.step - 1;
    // Step 1 = modalidad; steps 2+ = preguntas + datos
    const totalSteps = 1 + M.preguntas.length;
    if (idx < 0 || idx >= totalSteps) { navigate('#/consultoria/1'); return; }
    setProgress({ idx, flow: 'consultoria' });

    State.consultoria = State.consultoria || {};

    // STEP 1 — Modalidad
    if (idx === 0) {
      const sel = State.consultoria.modalidad_tipo?.id;
      const cards = M.modalidades.map(m => renderCard({
        id: m.id, icon: m.icon, label: m.label,
        category: m.category,
        description: m.description,
        meta: 'Base ' + formatMxn(m.base) + ' / ' + m.unit,
        isSelected: sel === m.id,
      })).join('');
      $('#main').innerHTML = `
        <div class="question-card">
          <div class="eyebrow">Consultoría</div>
          <h2 class="question-title">¿Qué tipo de consultoría?</h2>
          <p class="question-help">Cada modalidad tiene su propio formato y precio base. Multiplicamos por duración después.</p>
          <div class="options ${gridClassByCount(M.modalidades.length)}">${cards}</div>
          <div class="actions">
            <a href="#/" class="btn-ghost btn">← Clasificador</a>
            <button class="btn btn-primary" data-next type="button" ${State.consultoria.modalidad_tipo ? '' : 'disabled'}>Continuar →</button>
          </div>
        </div>
      `;
      $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        State.consultoria.modalidad_tipo = M.modalidades.find(x => x.id === id);
        $$('#main .option').forEach(b => b.classList.remove('is-selected'));
        e.currentTarget.classList.add('is-selected');
        const nxt = $('[data-next]'); if (nxt) nxt.disabled = false;
        scheduleAdvance('#/consultoria/2');
      }));
      $('[data-next]')?.addEventListener('click', () => {
        if (!State.consultoria.modalidad_tipo) return;
        navigate('#/consultoria/2');
      });
      return;
    }

    // STEPS 2+ — preguntas universales + datos
    const q = M.preguntas[idx - 1];
    let body = `
      <div class="question-card">
        <div class="eyebrow">Consultoría · ${State.consultoria.modalidad_tipo?.label || ''}</div>
        <h2 class="question-title">${q.label}</h2>
        <p class="question-help">${q.help || 'Definamos juntos cómo te acompañamos.'}</p>
    `;

    if (q.form) {
      body += '<div class="form-fields">';
      for (const f of q.campos) {
        const val = (State.consultoria[q.id]?.[f.id] || '').replace(/"/g,'&quot;');
        body += `
          <div class="form-field ${f.id === 'ubicacion' ? 'full' : ''}">
            <label>${f.label}${f.required ? ' *' : ''}</label>
            <input type="${f.type || 'text'}" name="${f.id}" ${f.required ? 'required' : ''} value="${val}">
          </div>
        `;
      }
      body += '</div>';
    } else {
      const sel = State.consultoria[q.id];
      const selIds = new Set(sel ? [sel.id] : []);
      const cards = q.opciones.map(o => {
        let meta = null;
        if (o.add !== undefined && o.add !== 0) meta = '+ ' + formatMxn(o.add);
        else if (o.mul !== undefined && o.mul !== 1.0) meta = o.metaSuffix || ('×' + o.mul);
        return renderCard({
          id: o.id, label: o.label, description: o.description,
          meta,
          isSelected: selIds.has(o.id),
        });
      }).join('');
      body += `<div class="options ${gridClassByCount(q.opciones.length)}">${cards}</div>`;
    }

    body += `
        <div class="actions">
          <button class="btn-ghost btn" data-prev type="button">← Anterior</button>
          <button class="btn btn-primary" data-next type="button" ${canAdvanceConsultoria(q) ? '' : 'disabled'}>${idx === totalSteps - 1 ? 'Generar cotización →' : 'Continuar →'}</button>
        </div>
      </div>
    `;

    $('#main').innerHTML = body;

    if (q.form) {
      $$('#main input').forEach(input => input.addEventListener('input', e => {
        State.consultoria[q.id] = State.consultoria[q.id] || {};
        State.consultoria[q.id][e.target.name] = e.target.value;
        const next = $('[data-next]'); if (next) next.disabled = !canAdvanceConsultoria(q);
      }));
    } else {
      $$('#main .option').forEach(btn => btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        State.consultoria[q.id] = q.opciones.find(x => x.id === id);
        $$('#main .option').forEach(b => b.classList.remove('is-selected'));
        e.currentTarget.classList.add('is-selected');
        const nxt = $('[data-next]'); if (nxt) nxt.disabled = !canAdvanceConsultoria(q);
        scheduleAdvance(idx === totalSteps - 1 ? '#/consultoria/resultado' : '#/consultoria/' + (State.step + 1));
      }));
    }

    $('[data-next]')?.addEventListener('click', () => {
      if (!canAdvanceConsultoria(q)) return;
      if (idx === totalSteps - 1) navigate('#/consultoria/resultado');
      else navigate('#/consultoria/' + (State.step + 1));
    });
    $('[data-prev]')?.addEventListener('click', () => navigate('#/consultoria/' + (State.step - 1)));
  }

  function canAdvanceConsultoria(q){
    const a = State.consultoria?.[q.id];
    if (q.form) {
      const v = a || {};
      return q.campos.every(f => !f.required || (v[f.id] && v[f.id].trim().length > 0));
    }
    return !!a;
  }

  function renderConsultoriaResultado(){
    setProgress(100);
    const M = window.IBISNE_CONSULTORIA;
    const calc = M.calcular(State.consultoria || {});
    const folio = 'CON-' + nextFolio();
    persistLead({
      route: 'consultoria',
      modalidad: State.consultoria?.modalidad_tipo?.id,
      total_mxn: calc.total,
      respuestas: State.consultoria,
      contacto: State.consultoria?.datos || {},
      pdf_folio: folio,
    });

    $('#main').innerHTML = `
      <div class="result-screen">
        <div class="result-veredicto">— CONSULTORÍA · COTIZACIÓN INDICATIVA</div>
        <h2 class="result-headline">Tu propuesta de consultoría está lista.<br><span class="accent">Folio ${folio}</span></h2>
        <p class="result-body">Cifra indicativa, sujeta a alcance final. Un consultor de iBisne te contacta para revisar agenda y temas específicos antes de cerrar.</p>

        <div class="cotizacion-preview">
          <h3>— DESGLOSE</h3>
          <div class="item base"><span>${State.consultoria?.modalidad_tipo?.label || ''}</span><span class="amount">${formatMxn(calc.base || 0)}</span></div>
          ${calc.lineItems.map(li => `<div class="item"><span>${li.label}</span><span class="amount">${li.add >= 0 ? '+ ' : ''}${formatMxn(li.add)}</span></div>`).join('')}
          <div class="item subtotal"><span>${L("Subtotal")}</span><span class="amount">${formatMxn(calc.total)}</span></div>
          <div class="item iva"><span>${L("IVA · 16%")}</span><span class="amount">${formatMxn(calc.total * 0.16)}</span></div>
          <div class="item total"><span>Total ${window.IBISNE_PREFS ? window.IBISNE_PREFS.currencyCode() : 'MXN'}</span><span class="amount">${formatMxn(calc.total * 1.16)}</span></div>
          <div class="stamp">INDICATIVO · sujeto a alcance · folio ${folio}</div>
        </div>

        <div class="result-summary">
          <div class="item">
            <div class="label">Modalidad</div>
            <div class="value">${State.consultoria?.modalidad_tipo?.label || '—'}</div>
          </div>
          <div class="item">
            <div class="label">Tema principal</div>
            <div class="value">${State.consultoria?.tema?.label || '—'}</div>
          </div>
          <div class="item">
            <div class="label">Duración</div>
            <div class="value">${State.consultoria?.duracion?.label || '—'}</div>
          </div>
          <div class="item">
            <div class="label">A nombre de</div>
            <div class="value">${State.consultoria?.datos?.empresa || '—'}</div>
          </div>
        </div>

        <div class="result-cta">
          <a href="https://wa.me/523329575274?text=Hola%2C%20vengo%20de%20la%20consultor%C3%ADa%20${folio}" target="_blank" rel="noopener" class="btn btn-primary">Agendar primera sesión →</a>
          <button class="btn btn-line" id="btn-print" type="button">${L("Descargar PDF")}</button>
          <a href="index.html" class="btn-ghost btn">← Volver al inicio</a>
        </div>
      </div>
    `;
    $('#btn-print')?.addEventListener('click', () => window.print());
    hideBottom();
  }

  // ─── PERSISTENCIA + ALERTAS ──────────────────────────────────────────
  // § PERSIST · v3.15 — escribe local + dispara webhook serverless (/api/lead)
  // Falla silenciosa: si la red falla, el lead queda en localStorage para reintentar.
  function persistLead(payload){
    try {
      const all = JSON.parse(localStorage.getItem('ibisne.leads') || '[]');
      payload.created_at = new Date().toISOString();
      payload.referrer = document.referrer;
      payload.ua = navigator.userAgent;
      payload.locale = (window.IBISNE_PREFS && window.IBISNE_PREFS.lang) ? window.IBISNE_PREFS.lang() : 'es';
      payload.currency = (window.IBISNE_PREFS && window.IBISNE_PREFS.currencyCode) ? window.IBISNE_PREFS.currencyCode() : 'MXN';
      all.push(payload);
      localStorage.setItem('ibisne.leads', JSON.stringify(all.slice(-200)));
    } catch(e){}

    // Dispara webhook serverless (Slack + Resend). Sin await — no bloquea UI.
    // Solo si tenemos al menos email o teléfono para que sea procesable en el back.
    try {
      const tieneContacto = payload.email || payload.telefono;
      if (!tieneContacto) return;
      const body = JSON.stringify(payload);
      // Usar sendBeacon si está disponible (más resiliente al unload)
      if (navigator.sendBeacon && body.length < 60000) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/lead', blob);
      } else {
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true
        }).catch(() => {});
      }
    } catch(e){}
  }
  function triggerAlert(score, answers, inferencia, tags){
    // Top-tier alert · marca el lead con prioridad alta para que Slack/email lo destaquen
    try {
      const payload = {
        alert: true,
        priority: 'high',
        score: score,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
        tier: (inferencia && inferencia.tier && inferencia.tier.label) || '',
        selecciones: JSON.stringify(answers || {})
      };
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/lead', blob);
      } else {
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      }
    } catch(e){}
  }
  function nextFolio(){
    let n = parseInt(localStorage.getItem('ibisne.folio') || '424', 10);
    n = n + 1;
    localStorage.setItem('ibisne.folio', String(n));
    return n;
  }
  function getCurrentFolio(){ return parseInt(localStorage.getItem('ibisne.folio') || '425', 10); }

  // ─── API PÚBLICA — re-render desde otros módulos (lang/currency toggle) ──
  window.IBISNE_QUIZ = {
    rerender: function(){
      try { render(); } catch(e){ if (window.console) console.warn('[iBisne] rerender fail', e); }
    },
  };
  // Suscripción a cambios de preferencias: re-pinta para reflejar idioma/moneda
  window.addEventListener('ibisne:prefs', () => {
    try {
      render();
      // Re-traducir CTAs wa.me en el DOM nuevo (hud.js escucha este evento)
      setTimeout(() => { window.dispatchEvent(new Event('ibisne:rerender')); }, 0);
    } catch(e){}
  });
  // ─── INIT ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // v5.0 · Cotizador puro · entrar directo al quiz (sin 3 puertas)
    if (!location.hash || location.hash === '#/' || location.hash === '#'
        || location.hash === '#/puertas') {
      location.hash = '#/servicio/1';
    }
    render();
  });
})();

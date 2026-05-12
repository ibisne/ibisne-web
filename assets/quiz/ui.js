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
    const h = (location.hash || '#/').slice(2);
    const parts = h.split('/').filter(Boolean);
    return { route: parts[0] || 'classifier', step: parts[1] || null };
  }
  function navigate(hash){ location.hash = hash; }

  window.addEventListener('hashchange', () => {
    render();
    // Re-traducir CTAs wa.me en el DOM nuevo según idioma activo
    setTimeout(() => { try { window.dispatchEvent(new Event('ibisne:rerender')); } catch(_) {} }, 0);
  });

  function render(){
    const { route, step } = parseHash();

    // Limpia el fade-out de salida antes de pintar la nueva pantalla
    const _main = document.getElementById('main');
    if (_main) _main.classList.remove('is-leaving');

    if (route === 'classifier' || !route) {
      // v4.0 · Pivot: el clasificador ahora es la pantalla de 3 puertas
      navigate('#/puertas');
      return;
    }
    if (route === 'puertas') {
      State.route = 'puertas';
      renderPuertas(); hideBottom(); return;
    }
    if (route === 'socio') {
      State.route = 'socio';
      if (step === 'resultado') return renderSocioResultado();
      State.step = parseInt(step || '1', 10);
      renderSocioStep(); showAsideA(); return;
    }
    if (route === 'servicio') {
      State.route = 'servicio';
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
      // En el último step: ir directo al resultado
      if (isLast) {
        if (State.answers.subtipo) navigate('#/servicio/resultado');
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
    // Nota: el step 'datos' se eliminó del flujo principal.
    // El usuario va directo de las universales al resultado (ver el precio primero).
    // La captura sucede de forma natural en los CTAs (WhatsApp ya pide su número,
    // PDF/Discovery abren un modal de captura de bajo compromiso).
    // Ruta directa /servicio/datos sigue accesible para hunters vía URL.
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
        <div class="eyebrow">Cierre · Servicio</div>
        <h2 class="question-title">¿A nombre de quién va la cotización?</h2>
        <p class="question-help">Estos datos llegan directo al equipo de iBisne. Te respondemos en menos de 24 horas.</p>
        <div class="form-fields">
          <div class="form-field">
            <label>${ico('login')} Nombre completo *</label>
            <input type="text" name="nombre" required placeholder="Tu nombre" value="${(datos.nombre||'').replace(/"/g,'&quot;')}">
          </div>
          <div class="form-field">
            <label>${ico('service')} Empresa / marca *</label>
            <input type="text" name="empresa" required placeholder="Nombre de tu negocio" value="${(datos.empresa||'').replace(/"/g,'&quot;')}">
          </div>
          <div class="form-field">
            <label>${ico('arrow')} Email *</label>
            <input type="email" name="email" required placeholder="hola@tudominio.com" value="${(datos.email||'').replace(/"/g,'&quot;')}">
          </div>
          <div class="form-field">
            <label>${ico('whatsapp')} WhatsApp *</label>
            <input type="text" name="whatsapp" required placeholder="+52 55 0000 0000" value="${(datos.whatsapp||'').replace(/"/g,'&quot;')}">
          </div>
        </div>
        <div class="actions">
          <button class="btn-ghost btn" data-prev type="button">← Anterior</button>
          <button class="btn btn-primary" data-next type="button" disabled>Generar mi cotización →</button>
        </div>
      </div>
    `;
    function checkValid(){
      const d = State.answers.datos || {};
      const ok = ['nombre','empresa','email','whatsapp'].every(k => d[k] && d[k].trim());
      const next = $('[data-next]'); if (next) next.disabled = !ok;
    }
    $$('#main input').forEach(input => input.addEventListener('input', e => {
      State.answers.datos = State.answers.datos || {};
      State.answers.datos[e.target.name] = e.target.value;
      checkValid();
    }));
    checkValid();
    $('[data-next]')?.addEventListener('click', () => navigate('#/servicio/resultado'));
    $('[data-prev]')?.addEventListener('click', () => navigate('#/servicio/' + (State.step - 1)));
    refreshBottomB();
  }

  function renderServicioResultado(){
    setProgress(100);
    const calc = computeB();
    const subtipo = State.answers.subtipo;
    const vertical = State.answers.vertical;

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

    // ─── MEMBRESÍA RECOMENDADA · cálculo y comparativa ───────────────
    const totalConIva = calc.total * 1.16;
    const memberships = window.IBISNE_PRICING?.memberships || [];
    const recommended = (window.IBISNE_PRICING?.getMembership)
      ? window.IBISNE_PRICING.getMembership(totalConIva)
      : null;
    const ahorroPrimerAno = recommended
      ? Math.max(0, totalConIva - (recommended.price * 1.16))
      : 0;

    // ─── v4.0 · Co-financiamiento · 4 opciones de duración ────────────
    // Sin compromiso (mes-a-mes) · 3m · 6m · 12m con descuentos crecientes
    const cofinTier = window.IBISNE_PRICING?.getCofinancingTier
      ? window.IBISNE_PRICING.getCofinancingTier(totalConIva)
      : null;
    const cofinOptions = window.IBISNE_PRICING?.getCofinancingOptions
      ? window.IBISNE_PRICING.getCofinancingOptions(totalConIva)
      : [];
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

    $('#main').innerHTML = `
      <div class="result-screen">
        <div class="result-veredicto">— ${L("COTIZACIÓN INDICATIVA")}</div>
        <h2 class="result-headline">${L("Tu cotización está lista.")}<br><span class="accent">${L("Folio")} #${folio}</span></h2>
        <p class="result-body">${L("Cifra indicativa. Si quieres precisarla, el discovery con un hunter es opcional · no bloquea el pago ni la membresía.")}</p>

        ${cofinTier ? `
        <!-- ─── v4.0 · CO-FINANCIAMIENTO · 4 opciones de duración ─────────── -->
        <section class="cofin-block">
          <div class="cofin-header">
            <span class="cofin-tier-badge">${cofinTier.label.toUpperCase()} · ${cofinTier.tagline}</span>
            <h3 class="cofin-headline">${cofinTier.copy}</h3>
            <p class="cofin-sub">Elige cuánto tiempo quieres comprometerte con iBisne. Más tiempo = iBisne pone más de tu proyecto.</p>
          </div>

          <div class="cofin-options">
            ${cofinOptions.map((opt, idx) => {
              const isAnnual = opt.months === 12;
              const isFree = opt.months === 1;
              const monthsLabel = isFree ? 'Pago directo' :
                opt.months === 3 ? '3 meses' :
                opt.months === 6 ? '6 meses' : '12 meses · anual';
              const subtitle = isFree
                ? 'Sin compromiso · paga el total ahora'
                : `iBisne co-financia ${opt.discount}% · tú pones ${100-opt.discount}%`;
              const priceLabel = isFree
                ? formatMxn(opt.finalPrice)
                : formatMxn(opt.monthlyPayment) + '<small>/mes</small>';
              return `
                <button class="cofin-card${isAnnual ? ' is-recommended' : ''}${isFree ? ' is-direct' : ''}" type="button" data-cofin-months="${opt.months}">
                  ${isAnnual ? '<div class="cofin-badge">MEJOR PRECIO</div>' : ''}
                  <div class="cofin-card-header">
                    <div class="cofin-card-label">${monthsLabel}</div>
                    ${opt.discount > 0 ? `<div class="cofin-card-discount">−${opt.discount}%</div>` : ''}
                  </div>
                  <div class="cofin-card-price">${priceLabel}</div>
                  <div class="cofin-card-total">${isFree ? 'Total único' : 'Total ' + formatMxn(opt.finalPrice) + ' · ' + opt.months + ' pagos'}</div>
                  <div class="cofin-card-sub">${subtitle}</div>
                  ${opt.saved > 0 ? `<div class="cofin-card-saved">Ahorras ${formatMxn(opt.saved)}</div>` : ''}
                </button>
              `;
            }).join('')}
          </div>
          ${cofinTier.coInvestment ? `
          <div class="cofin-coinv">
            <strong>★ Bonus Scale:</strong> tu proyecto +$100k entra al programa de co-inversión equity opcional · iBisne pone hasta 20% del cash a cambio de 5-10% equity. Validación de fit en discovery.
          </div>` : ''}
        </section>
        ` : ''}

        ${true ? `
        <!-- ─── 3º HIGHLIGHTS · qué incluye siempre iBisne ───────────────────── -->
        <section class="brand-promise">
          <div class="bp-eyebrow">— TU PROYECTO IBISNE INCLUYE SIEMPRE</div>
          <div class="bp-grid">
            <div class="bp-item">
              <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('partnership','line') : '✓'}</span>
              <div>
                <strong>Equipo asignado</strong>
                <p>${(calc.team || []).join(' · ')} dedicados a tu proyecto.</p>
              </div>
            </div>
            <div class="bp-item">
              <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('serverapp','line') : '✓'}</span>
              <div>
                <strong>Stack moderno</strong>
                <p>${(stackItems[0] || 'Stack adecuado al alcance')}. Sin dependencias frágiles.</p>
              </div>
            </div>
            <div class="bp-item">
              <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('shield','line') : '✓'}</span>
              <div>
                <strong>Infra incluida</strong>
                <p>Hosting + base de datos + dominio. Primer año sin costo.</p>
              </div>
            </div>
            <div class="bp-item">
              <span class="bp-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('edit','line') : '✓'}</span>
              <div>
                <strong>Discovery firmable</strong>
                <p>Antes de cobrar un peso: alcance definido y propuesta firmable.</p>
              </div>
            </div>
          </div>
        </section>
        ` : ''}

        <div class="result-grid">
          <div class="result-col-main">
            <div class="cotizacion-preview">
              <h3>— DESGLOSE · CLICK EDITAR PARA AJUSTAR</h3>
              <div class="item base">
                ${iconHtml(subtipo?.icon)}
                <span class="label">${subtipoLabel}</span>
                <span class="amount">${formatMxn(subtipo?.base || 0)}</span>
              </div>
              ${groupsHtml}
              <div class="item subtotal"><span>${L("Subtotal")}</span><span class="amount">${formatMxn(calc.total)}</span></div>
              <div class="item iva"><span>${L("IVA · 16%")}</span><span class="amount">${formatMxn(calc.total * 0.16)}</span></div>
              <div class="item total"><span>${L("Total MXN")}</span><span class="amount">${formatMxn(calc.total * 1.16)}</span></div>
              <div class="stamp">INDICATIVO · sujeto a discovery · folio #${folio}</div>

              <div class="payment-section">
                <div class="payment-section-label">— FORMA DE PAGO · PayPal disponible · otros próximamente</div>
                <div class="payment-grid">
                  <a href="https://paypal.me/iBisne" target="_blank" rel="noopener" class="payment-method is-active" aria-label="Pagar con PayPal">
                    <span class="pm-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('wallet','line') : ''}</span>
                    <span class="pm-name">PayPal</span>
                    <span class="pm-meta">Pagar ahora →</span>
                  </a>
                  <button class="payment-method" type="button" disabled aria-label="Mercado Pago">
                    <span class="pm-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('wallet','line') : ''}</span>
                    <span class="pm-name">Mercado Pago</span>
                    <span class="pm-meta">${L("Disponible pronto")}</span>
                  </button>
                  <button class="payment-method" type="button" disabled aria-label="SPEI / Transferencia">
                    <span class="pm-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('cash','line') : ''}</span>
                    <span class="pm-name">SPEI · Transferencia</span>
                    <span class="pm-meta">${L("Disponible pronto")}</span>
                  </button>
                  <button class="payment-method" type="button" disabled aria-label="Criptomonedas">
                    <span class="pm-icon">${window.IBISNE_ICONS ? window.IBISNE_ICONS.get('coin','line') : ''}</span>
                    <span class="pm-name">Cripto · USDC / BTC</span>
                    <span class="pm-meta">${L("Disponible pronto")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="result-col-side">
            <div class="result-summary">
              <div class="item">
                <div class="label">${L("Equipo asignado")}</div>
                <div class="value">${calc.team.join(' · ')}</div>
              </div>
              <div class="item">
                <div class="label">${L("Módulos activos")}</div>
                <div class="value">${calc.modules} ${calc.modules === 1 ? 'módulo' : 'módulos'} configurados</div>
              </div>
              <div class="item">
                <div class="label">${L("Acabado del proyecto")}</div>
                <div class="value">${calc.speedZone === 'mvp' ? 'MVP' : (calc.speedZone === 'premium' ? 'Premium' : 'Estándar')}</div>
              </div>
              <div class="item">
                <div class="label">${L("Folio")}</div>
                <div class="value">#${folio}</div>
              </div>
            </div>

            <!-- v4.0 · 3 CTAs equivalentes · ninguno obligatorio "hunter" -->
            <div class="result-cta result-cta-stack result-cta-v4">
              <a href="https://paypal.me/iBisne" target="_blank" rel="noopener" class="btn btn-primary btn-pay" data-cta="pay-now">${L("Pagar ahora")} · ${formatMxn(totalConIva)}</a>
              <button class="btn btn-line" type="button" data-cta="monthly-plan">${L("Plan mensual")} · co-financiamos</button>
              <button class="btn btn-line" type="button" data-cta="find-investor">${L("Buscar un inversionista")}</button>
              <button class="btn btn-line" id="btn-print" type="button">${L("Descargar PDF")}</button>
            </div>
            <!-- Hunter sutil al final · NO obligatorio -->
            <div class="result-hunter-aside">
              <a href="${waUrl}" target="_blank" rel="noopener" class="result-hunter-link">
                ${L("¿Tienes preguntas? Habla con un hunter")} →
              </a>
            </div>
          </div>
        </div>

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

    // ─── v4.0 · Wire de los 3 CTAs equivalentes ────────────────────────
    // CTA "Plan mensual" → modal con las 4 opciones de duración
    $$('[data-cta="monthly-plan"]').forEach(btn => {
      btn.addEventListener('click', () => openMonthlyPlanModal(calc, folio, vertical, subtipo, verticalLabel, subtipoLabel, lineItemsText));
    });
    // CTA "Buscar inversor" → modal con form rápido
    $$('[data-cta="find-investor"]').forEach(btn => {
      btn.addEventListener('click', () => openFindInvestorModal(calc, folio, vertical, subtipo, verticalLabel, subtipoLabel));
    });
    // CTA "Pagar ahora" ya funciona vía href PayPal · no necesita wire JS

    // Cards individuales del cofin-block · click directo en una opción
    $$('[data-cofin-months]').forEach(card => {
      card.addEventListener('click', () => {
        const months = parseInt(card.dataset.cofinMonths, 10);
        const totalConIvaLocal = calc.total * 1.16;
        if (months === 1) {
          // Pago directo · ir a PayPal
          window.open('https://paypal.me/iBisne', '_blank', 'noopener');
        } else {
          openMonthlyPlanModal(calc, folio, vertical, subtipo, verticalLabel, subtipoLabel, lineItemsText, months);
        }
      });
    });

    showAsideB();
  }

  // ─── v4.0 · Modal "Plan mensual" · 4 opciones de duración ──────────
  function openMonthlyPlanModal(calc, folio, vertical, subtipo, verticalLabel, subtipoLabel, lineItemsText, preselectMonths){
    const totalConIva = calc.total * 1.16;
    const options = window.IBISNE_PRICING?.getCofinancingOptions
      ? window.IBISNE_PRICING.getCofinancingOptions(totalConIva)
      : [];
    const tier = window.IBISNE_PRICING?.getCofinancingTier
      ? window.IBISNE_PRICING.getCofinancingTier(totalConIva)
      : null;
    const preselected = preselectMonths || 12;

    let modal = document.getElementById('v4-monthly-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'v4-monthly-modal';
    modal.className = 'v4-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="v4-modal" tabindex="-1">
        <div class="v4-modal-head">
          <div>
            <div class="v4-modal-eyebrow">§ PLAN MENSUAL · ${tier ? tier.label.toUpperCase() : ''}</div>
            <h3 class="v4-modal-title">Elige cuánto te comprometes</h3>
            <p class="v4-modal-sub">Cuanto más tiempo, más co-financia iBisne. Tú pagas en mensualidades iguales · sin intereses.</p>
          </div>
          <button class="v4-modal-close" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="v4-modal-body">
          <div class="v4-opts">
            ${options.map(opt => {
              const isPreselected = opt.months === preselected;
              const monthsLabel = opt.months === 1 ? 'Pago directo' :
                opt.months === 3 ? '3 meses' :
                opt.months === 6 ? '6 meses' : '12 meses · anual';
              const priceLabel = opt.months === 1
                ? formatMxn(opt.finalPrice)
                : formatMxn(opt.monthlyPayment) + '<small>/mes</small>';
              return `
                <button class="v4-opt${isPreselected ? ' is-selected' : ''}${opt.months === 12 ? ' is-best' : ''}" type="button" data-pick-months="${opt.months}">
                  ${opt.months === 12 ? '<span class="v4-opt-badge">MEJOR PRECIO</span>' : ''}
                  <div class="v4-opt-head">
                    <span class="v4-opt-months">${monthsLabel}</span>
                    ${opt.discount > 0 ? `<span class="v4-opt-disc">−${opt.discount}%</span>` : ''}
                  </div>
                  <div class="v4-opt-price">${priceLabel}</div>
                  <div class="v4-opt-total">${opt.months === 1 ? 'Total único' : 'Total ' + formatMxn(opt.finalPrice)}</div>
                  ${opt.saved > 0 ? `<div class="v4-opt-saved">Ahorras ${formatMxn(opt.saved)}</div>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="v4-modal-foot">
          <button class="btn btn-line" type="button" data-v4-close>Cancelar</button>
          <div class="v4-foot-spacer"></div>
          <button class="btn btn-primary" type="button" id="v4-confirm-plan">Activar este plan →</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    let selectedMonths = preselected;

    // Bind selección de opción
    modal.querySelectorAll('[data-pick-months]').forEach(b => {
      b.addEventListener('click', () => {
        modal.querySelectorAll('.v4-opt').forEach(o => o.classList.remove('is-selected'));
        b.classList.add('is-selected');
        selectedMonths = parseInt(b.dataset.pickMonths, 10);
      });
    });

    // Cierre
    function close(){
      modal.remove();
      document.body.style.overflow = '';
    }
    modal.querySelector('.v4-modal-close').addEventListener('click', close);
    modal.querySelectorAll('[data-v4-close]').forEach(b => b.addEventListener('click', close));
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // Confirmar plan · arma mensaje WhatsApp + abre
    $('#v4-confirm-plan').addEventListener('click', () => {
      const opt = options.find(o => o.months === selectedMonths);
      if (!opt) return;
      const planMsg = `Hola, quiero activar PLAN MENSUAL iBisne · folio #${folio}.

` + (opt.months === 1
        ? `Pago directo · ${formatMxn(opt.finalPrice)} MXN total`
        : `Compromiso: ${opt.months} meses
iBisne co-financia: ${opt.discount}%
Pago mensual: ${formatMxn(opt.monthlyPayment)} MXN
Total al cierre: ${formatMxn(opt.finalPrice)} MXN
Ahorro: ${formatMxn(opt.saved)} MXN`) + `

Proyecto: ${verticalLabel} · ${subtipoLabel}
${lineItemsText}

Quiero arrancar el plan.`;
      const url = `https://wa.me/523329575274?text=${encodeURIComponent(planMsg)}`;
      persistLead({
        route: 'monthly-plan-activated',
        folio, vertical: vertical?.id, subtipo: subtipo?.id,
        months: opt.months, discount: opt.discount, finalPrice: opt.finalPrice,
        monthlyPayment: opt.monthlyPayment, total_mxn: calc.total,
      });
      window.open(url, '_blank', 'noopener');
      close();
    });

    // Focus inicial
    setTimeout(() => modal.querySelector('.v4-modal').focus(), 50);
  }

  // ─── v4.0 · Modal "Buscar inversor" · publicar en marketplace ──────
  function openFindInvestorModal(calc, folio, vertical, subtipo, verticalLabel, subtipoLabel){
    const totalConIva = calc.total * 1.16;

    let modal = document.getElementById('v4-investor-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'v4-investor-modal';
    modal.className = 'v4-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="v4-modal" tabindex="-1">
        <div class="v4-modal-head">
          <div>
            <div class="v4-modal-eyebrow">§ MARKETPLACE · BUSCAR INVERSOR</div>
            <h3 class="v4-modal-title">Publica tu proyecto en el marketplace</h3>
            <p class="v4-modal-sub">Tu proyecto entra a curaduría por hunters · si pasa, lo mostramos a inversores LATAM acreditados. Sin costo para ti hasta que cerremos match.</p>
          </div>
          <button class="v4-modal-close" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="v4-modal-body">
          <div class="v4-fld">
            <label>Resumen del proyecto</label>
            <textarea id="v4-inv-summary" rows="4" placeholder="Describe en 3-5 líneas qué hace tu proyecto · por qué un inversor debería interesarse">${verticalLabel} · ${subtipoLabel}

Total cotizado: ${formatMxn(totalConIva)} MXN
Tracción / contexto: </textarea>
          </div>
          <div class="v4-fld-row">
            <div class="v4-fld">
              <label>Capital que buscas</label>
              <input id="v4-inv-capital" type="text" placeholder="Ej. $50,000 MXN" value="${formatMxn(totalConIva)}">
            </div>
            <div class="v4-fld">
              <label>Equity ofrecido (opcional)</label>
              <input id="v4-inv-equity" type="text" placeholder="Ej. 10% por 3 años">
            </div>
          </div>
          <div class="v4-fld">
            <label>Email de contacto</label>
            <input id="v4-inv-email" type="email" placeholder="tu@email.com" required>
          </div>
          <div class="v4-hint">
            <strong>iBisne curaduría:</strong> revisamos tu proyecto en 48h. Si pasa, lo publicamos al marketplace de inversores. Si encuentra match, iBisne cobra <strong>placement fee 15-25%</strong> al inversor (no a ti).
          </div>
        </div>
        <div class="v4-modal-foot">
          <button class="btn btn-line" type="button" data-v4-close>Cancelar</button>
          <div class="v4-foot-spacer"></div>
          <button class="btn btn-primary" type="button" id="v4-confirm-investor">Publicar para curaduría →</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    function close(){
      modal.remove();
      document.body.style.overflow = '';
    }
    modal.querySelector('.v4-modal-close').addEventListener('click', close);
    modal.querySelectorAll('[data-v4-close]').forEach(b => b.addEventListener('click', close));
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    $('#v4-confirm-investor').addEventListener('click', () => {
      const summary = $('#v4-inv-summary').value.trim();
      const capital = $('#v4-inv-capital').value.trim();
      const equity = $('#v4-inv-equity').value.trim();
      const email = $('#v4-inv-email').value.trim();
      if (!email || !email.includes('@')) {
        alert('Por favor agrega un email válido para que te avisemos cuando tu proyecto pase a curaduría.');
        return;
      }
      persistLead({
        route: 'marketplace-request',
        seekInvestor: true,
        folio, vertical: vertical?.id, subtipo: subtipo?.id,
        total_mxn: calc.total,
        summary, capital, equity, email,
      });
      // Reemplaza body con confirmación
      modal.querySelector('.v4-modal-body').innerHTML = `
        <div class="v4-confirm">
          <div class="v4-confirm-icon">✓</div>
          <h3>Tu proyecto entra a curaduría</h3>
          <p>Te avisamos en <strong>48h</strong> si pasa al marketplace de inversores. Revisa tu correo (incluyendo SPAM) · responde a las preguntas del hunter para acelerar.</p>
        </div>
      `;
      modal.querySelector('.v4-modal-foot').innerHTML = `
        <div class="v4-foot-spacer"></div>
        <button class="btn btn-primary" type="button" data-v4-close>Listo</button>
      `;
      modal.querySelector('[data-v4-close]').addEventListener('click', close);
    });

    setTimeout(() => modal.querySelector('#v4-inv-summary')?.focus(), 80);
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
          <div class="qb-meta-label">${L("Acabado del proyecto")}</div>
          <div class="qb-intent-line">
            <div class="qb-intent-dot" id="qb-intent-dot" style="left: 50%;"></div>
          </div>
          <div class="qb-intent-labels">
            <span>MVP</span><span>Estándar</span><span>Premium</span>
          </div>
        </div>
        <div class="qb-total-block">
          <div class="qb-total-label">${L("Inversión estimada")}</div>
          <div class="qb-total-number"><span data-countup data-format="mxn" id="qb-total">$ 0</span><span class="currency" id="qb-currency-code">MXN</span></div>
          <div class="qb-total-sub" style="font-family:var(--font-mono); font-size:10px; letter-spacing:0.14em; color:var(--text-muted); margin-top:2px;">${L("IVA incluido")}</div>
        </div>
        <div class="qb-nav-block">
          <button class="qb-nav-btn qb-nav-prev" id="qb-nav-prev" type="button" aria-label="Pregunta anterior">← Anterior</button>
          <button class="qb-nav-btn qb-nav-next" id="qb-nav-next" type="button" aria-label="Siguiente pregunta" disabled>Continuar →</button>
        </div>
      </div>
      <button class="qb-toggle" id="qb-toggle-btn" type="button" aria-label="Abrir resumen">${chevronUp}</button>
      <div class="qb-expanded-content">
        <div class="qb-block">
          <div class="qb-block-label">${L("— Configuración seleccionada")}</div>
          <ul class="qb-config-list" id="qb-config-full"><li style="color:var(--text-muted);">${L("Aún sin selecciones")}</li></ul>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">${L("— Equipo que ejecuta")}</div>
          <div class="team-chips" id="qb-team">
            ${['KAM','Frontend','Backend','UX/UI','PM','DevOps','QA'].map(t => `<span class="team-chip" data-team="${t}">${t}</span>`).join('')}
          </div>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">${L("— Stack propuesto")}</div>
          <ul class="qb-config-list" id="qb-stack">
            <li style="color:var(--text-muted);">${L("Selecciona vertical y sub-tipo")}</li>
          </ul>
        </div>
        <div class="qb-block">
          <div class="qb-block-label">${L("— Acabado del proyecto")}</div>
          <div class="qb-intent-text" id="qb-intent-text" style="font-family:var(--font-display); font-size:14px; line-height:1.5; color:var(--accent-mint);">Selecciona opciones para ver la velocidad de salida</div>
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

  // ═════════════════════════════════════════════════════════════════════
  // v4.0 · 3 PUERTAS · pantalla inicial de filtro por tipo de usuario
  // ═════════════════════════════════════════════════════════════════════
  function renderPuertas(){
    const main = $('#main');
    if (!main) return;
    const title    = L('¿Cómo te podemos ayudar?');
    const subtitle = L('Elige dónde encajas · adaptamos el resto.');

    main.innerHTML = `
      <section class="puertas-shell">
        <div class="puertas-hero">
          <div class="quiz-eyebrow">§ ${L('Servicio')}</div>
          <h1 class="puertas-title">${title}</h1>
          <p class="puertas-sub">${subtitle}</p>
        </div>

        <div class="puertas-grid">
          <a class="puertas-card" href="#/servicio/1" data-door="builder">
            <div class="puertas-card-icon" data-icon="sitio"></div>
            <div class="puertas-card-text">
              <div class="puertas-card-label">${L('Soy emprendedor')}</div>
              <div class="puertas-card-sub">${L('Necesito tecnología para mi proyecto')}</div>
            </div>
            <div class="puertas-card-arrow">→</div>
          </a>

          <a class="puertas-card" href="#/inversor/1" data-door="investor">
            <div class="puertas-card-icon" data-icon="partnership"></div>
            <div class="puertas-card-text">
              <div class="puertas-card-label">${L('Soy inversionista')}</div>
              <div class="puertas-card-sub">${L('Busco proyectos LATAM que apoyar')}</div>
            </div>
            <div class="puertas-card-arrow">→</div>
          </a>

          <a class="puertas-card" href="#/servicio/1?seek=1" data-door="seeker">
            <div class="puertas-card-icon" data-icon="leads"></div>
            <div class="puertas-card-text">
              <div class="puertas-card-label">${L('Busco un inversionista')}</div>
              <div class="puertas-card-sub">${L('Tengo idea y necesito quien la respalde')}</div>
            </div>
            <div class="puertas-card-arrow">→</div>
          </a>
        </div>

        <p class="puertas-foot">
          <span class="muted">${L('Tu información queda guardada · puedes cambiar de puerta cuando quieras.')}</span>
        </p>
      </section>
    `;

    // Hidratar iconos
    if (window.IBISNE_ICONS) {
      main.querySelectorAll('[data-icon]').forEach(el => {
        const id = el.dataset.icon;
        el.innerHTML = window.IBISNE_ICONS.get(id, 'fill');
      });
    }

    // Bind clicks · marca el path elegido para que el quiz se adapte
    main.querySelectorAll('.puertas-card').forEach(c => {
      c.addEventListener('click', (e) => {
        const door = c.dataset.door;
        State.userPath = door;
        // Si elige "seeker" (busca inversor), prende flag para publicar en marketplace
        if (door === 'seeker') {
          State.seekInvestor = true;
        }
        // navegación natural via href
      });
    });
  }

  // ─── INIT ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // v4.0 · Default: entrar a las 3 puertas (filtro por tipo de usuario)
    if (!location.hash || location.hash === '#/' || location.hash === '#') {
      location.hash = '#/puertas';
    }
    render();
  });
})();

/* ===================================================================
   assets/sitio/pricing-table.js · v15.0 · SPA quiz inline
   ===================================================================
   Render del Pricing Table de la landing SPA desde IBISNE_PRECIOS_V13.
   Auto-inicializa cualquier `<div data-pricing-spa="categoria-inicial">`.

   v15.0 (Eduardo · pulido UX):
   - Botón cada plan: 'Seleccionar' uniforme (en lugar de 'Empezar/Elegir XX').
   - Click 'Seleccionar' → highlight card + STEP-2 aparece debajo con
     3 cards de mantenimiento (Básico · Premium · Sin mantenimiento).
   - Click mantenimiento → STEP-3 con form de captura (nombre, email,
     empresa). Submit POST a /api/lead.js + abre WhatsApp con prefill
     completo (categoría, plan, mantenimiento, pago, powerups, datos).
   - switchCategoria limpia state.selectedPlanId + steps.
   - Smooth scroll a cada step nuevo.

   Hereda v14.0:
   - Multi-categoría con tabs (7 categorías).
   - Segmented mes/exhibición + master powerups todo-o-nada compacto.
   =================================================================== */
(function () {
  'use strict';

  var HUNTER_WA = '523329575274';

  function icon(id) {
    if (window.IBISNE_ICONS && id) return window.IBISNE_ICONS.get(id, 'line') || '';
    return '';
  }
  function fmt(n) {
    var v = Math.round(Number(n) || 0);
    return '$' + v.toLocaleString('en-US');
  }
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function animateNumber(el, from, to, dur) {
    if (!el) return;
    dur = dur || 320;
    if (from === to || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      el.textContent = fmt(to); return;
    }
    var start = performance.now();
    var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      el.textContent = fmt(from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function planPrice(plan, exhibicion, powerupsOn, totalPct, exhMultiplier) {
    var mult = 1 + (powerupsOn ? (totalPct || 0) : 0);
    var price = plan.base * mult;
    if (exhibicion) price *= (exhMultiplier || 0.80);
    return price;
  }

  function renderSPA(container, initialCategoria) {
    var DATA = window.IBISNE_PRECIOS_V13;
    if (!DATA || !DATA.categorias) {
      container.innerHTML = '<p class="t-muted">Sin datos de precios. Verifica que data/precios-v13.js esté cargado.</p>';
      return;
    }

    var powerupsDef = DATA.powerups || [];
    var powerupsTotalPct = DATA.powerupsTotalPct || 0;
    var exhMultiplier = (DATA.exhibicion && DATA.exhibicion.multiplier) || 0.80;
    var exhBadge = (DATA.exhibicion && DATA.exhibicion.badge) || 'Ahorra 20%';
    var exhLabel = (DATA.exhibicion && DATA.exhibicion.label) || 'Pago en exhibición';
    var discountPctLabel = Math.round((1 - exhMultiplier) * 100);
    var powerupsTotalPctLabel = Math.round(powerupsTotalPct * 100);
    var mantenimiento = DATA.mantenimiento || [];

    var state = {
      categoria: (initialCategoria && DATA.categorias[initialCategoria]) ? initialCategoria : 'webs',
      exhibicion: false,
      powerupsOn: false,
      selectedPlanId: null,           // v15.0
      selectedMantenimiento: null,    // v15.0 · 'basico' | 'premium' | 'sin'
      formData: { nombre: '', email: '', empresa: '' },  // v15.0
      submitting: false,              // v15.0 · evita doble-submit
    };

    // ── HTML del shell (tabs + controles + panel + quiz steps) ──
    function htmlShell() {
      var html = '';

      // Tabs de categorías
      html += '<div class="pt-cat-tabs" role="tablist" aria-label="Categorías de servicios">';
      Object.keys(DATA.categorias).forEach(function (catId) {
        var c = DATA.categorias[catId];
        var on = catId === state.categoria;
        html += '<button class="pt-cat-tab' + (on ? ' is-on' : '') + '" type="button" role="tab"' +
                ' aria-selected="' + (on ? 'true' : 'false') + '" data-cat="' + catId + '">' +
                '<span class="pt-cat-tab-ic">' + icon(c.icon) + '</span>' +
                '<span class="pt-cat-tab-label">' + escHtml(c.label) + '</span>' +
                '</button>';
      });
      html += '</div>';

      html += '<div class="pt-cat-head" data-cat-head></div>';

      // Controles globales (segmented pago + master powerups compacto)
      html += '<div class="pt-controls">';
      html += '  <div class="pt-seg" role="tablist" aria-label="Forma de pago">';
      html += '    <button class="pt-seg-opt is-on" data-pay="mes" type="button" role="tab" aria-selected="true">Pago mes a mes</button>';
      html += '    <button class="pt-seg-opt" data-pay="exhibicion" type="button" role="tab" aria-selected="false">' +
              escHtml(exhLabel) + ' <span class="pt-seg-badge">' + escHtml(exhBadge) + '</span></button>';
      html += '  </div>';

      if (powerupsDef.length) {
        html += '  <div class="pt-powerups" data-powerups-block>';
        html += '    <button class="pt-powerups-master-toggle" type="button" aria-pressed="false" data-powerups-toggle>';
        html += '      <span class="pt-pm-switch" aria-hidden="true"><span class="pt-pm-knob"></span></span>';
        html += '      <span class="pt-pm-label">Powerups <span class="pt-pm-pct">+' + powerupsTotalPctLabel + '%</span></span>';
        html += '    </button>';
        html += '  </div>';
      }
      html += '</div>';

      // Pills info-only
      if (powerupsDef.length) {
        html += '<div class="pt-powerups-pills" data-powerups-pills aria-label="Los 5 Powerups">';
        powerupsDef.forEach(function (pu) {
          html += '<span class="pt-pill" data-pill="' + pu.id + '">' +
                  '<span class="pt-pill-ic">' + icon(pu.icon) + '</span>' +
                  '<span class="pt-pill-name">' + escHtml(pu.label) + '</span>' +
                  '<span class="pt-pill-pct">+' + Math.round(pu.addPct * 100) + '%</span>' +
                  '</span>';
        });
        html += '</div>';
      }

      // Panel dinámico (cards de planes)
      html += '<div class="pt-panel" data-cat-panel></div>';

      // Quiz steps wrapper (v15.0)
      html += '<div class="pt-quiz-steps" data-quiz-steps></div>';

      return html;
    }

    // ── HTML del PANEL (cards + tabla comparativa) ──
    function htmlPanel(catId) {
      var cat = DATA.categorias[catId];
      if (!cat) return '<p class="t-muted">Categoría no encontrada.</p>';

      var html = '';
      var planCount = cat.planes.length;

      html += '<div class="pricing-grid" data-plans="' + planCount + '">';
      cat.planes.forEach(function (plan) {
        var isSel = state.selectedPlanId === plan.id;
        html += '<article class="pricing-card' +
                  (plan.recomendado ? ' is-recomendado' : '') +
                  (isSel ? ' is-selected' : '') +
                '" data-plan="' + plan.id + '">';
        if (plan.recomendado) html += '<span class="pricing-card-banner">Más popular</span>';

        html += '<div class="pricing-card-head">';
        html += '  <span class="pricing-card-icon">' + icon(plan.icon) + '</span>';
        html += '  <div><div class="pricing-card-name">' + escHtml(plan.label) + '</div>';
        html += '  <div class="pricing-card-sub">' + escHtml(plan.sub) + '</div></div>';
        html += '</div>';

        html += '<div class="pricing-card-price">';
        html += '  <span class="pricing-card-amount" data-amount>' + fmt(plan.base) + '</span>';
        html += '  <span class="pricing-card-period">MXN</span>';
        html += '</div>';
        html += '<div class="pricing-card-tiempo">Entrega ' + escHtml(plan.tiempo) + '</div>';

        // CTA v15.0 · botón "Seleccionar" uniforme
        html += '<div class="pricing-card-cta">';
        html += '  <button class="btn ' + (plan.recomendado ? 'btn-blue' : 'btn-dark') + ' pt-select-plan" type="button" data-select-plan="' + plan.id + '">' +
                (isSel ? '✓ Seleccionado' : 'Seleccionar') +
                '</button>';
        html += '</div>';

        html += '<div class="pricing-card-features">';
        (plan.features || []).forEach(function (f) {
          html += '<div class="pricing-card-feature"><span class="pricing-card-feature-check">' + icon('check') + '</span><span>' + escHtml(f) + '</span></div>';
        });
        html += '</div>';

        html += '</article>';
      });
      html += '</div>';

      // Tabla comparativa
      if (cat.featureRows && cat.featureRows.length) {
        html += '<div class="pt-compare">';
        html += '  <button class="pt-compare-toggle" type="button" aria-expanded="false">';
        html += '    <span>Comparar todos los planes</span><span class="pt-chevron">' + icon('chevron') + '</span>';
        html += '  </button>';
        html += '  <div class="pt-compare-table-wrap"><div class="pt-compare-table-inner">';
        html += '    <table class="cmp"><thead><tr><th class="cmp-feat">Característica</th>';
        cat.planes.forEach(function (p) {
          html += '<th class="' + (p.recomendado ? 'is-featured' : '') + '">' + escHtml(p.label) + '</th>';
        });
        html += '</tr></thead><tbody>';
        cat.featureRows.forEach(function (row) {
          html += '<tr><th class="cmp-feat">' + escHtml(row.label) + '</th>';
          cat.planes.forEach(function (p) {
            var val = row.values[p.id];
            var cell = val === '✓'
              ? '<span class="cmp-yes">' + icon('check') + '</span>'
              : (val === '—' ? '<span class="cmp-no">—</span>' : escHtml(val));
            html += '<td class="' + (p.recomendado ? 'is-featured' : '') + '">' + (cell || '<span class="cmp-no">—</span>') + '</td>';
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        html += '  </div></div>';
        html += '</div>';
      }

      return html;
    }

    function htmlHead(catId) {
      var cat = DATA.categorias[catId];
      if (!cat) return '';
      var title = cat.title || ('Planes de ' + cat.label);
      var tagline = cat.tagline || cat.sub || '';
      return '<h3 class="pt-cat-title">' + escHtml(title) + '</h3>' +
             (tagline ? '<p class="pt-cat-tagline">' + escHtml(tagline) + '</p>' : '');
    }

    // ── v15.0 · STEP-2 · cards de mantenimiento ──
    function htmlStep2() {
      var opts = [];
      mantenimiento.forEach(function (m) { opts.push(m); });
      opts.push({ id: 'sin', label: 'Sin mantenimiento', precio: 0, titulo: 'Por ahora no', desc: 'Tu desarrollo es 100% tuyo y sigue funcionando. Puedes contratar mantenimiento después si lo necesitas.', features: ['Sin compromiso mensual', 'Mantienes el control total', 'Puedes agregar Básico o Premium cuando quieras'] });

      var html = '';
      html += '<div class="pt-step pt-step-2" data-step="2">';
      html += '  <div class="pt-step-head">';
      html += '    <span class="pt-step-num">02</span>';
      html += '    <div><h4 class="pt-step-title">¿Quieres que lo mantengamos vivo?</h4>';
      html += '    <p class="pt-step-sub">Opcional. Marca lo que aplique para tu caso.</p></div>';
      html += '  </div>';
      html += '  <div class="pt-mant-grid">';
      opts.forEach(function (m) {
        var isSel = state.selectedMantenimiento === m.id;
        var isFree = m.id === 'sin';
        html += '<button type="button" class="pt-mant-card' + (isSel ? ' is-selected' : '') + (isFree ? ' is-free' : '') + '" data-select-mant="' + m.id + '">';
        html += '  <div class="pt-mant-head">';
        html += '    <span class="pt-mant-name">' + escHtml(m.label) + '</span>';
        html += '    <span class="pt-mant-price">' + (isFree ? '$0' : fmt(m.precio) + '<small>/mes</small>') + '</span>';
        html += '  </div>';
        if (m.titulo) html += '<div class="pt-mant-titulo">' + escHtml(m.titulo) + '</div>';
        if (m.desc)   html += '<p class="pt-mant-desc">' + escHtml(m.desc) + '</p>';
        if (m.features && m.features.length) {
          html += '<div class="pt-mant-features">';
          m.features.slice(0, 4).forEach(function (f) {
            html += '<div class="pt-mant-feature"><span>' + icon('check') + '</span><span>' + escHtml(f) + '</span></div>';
          });
          if (m.features.length > 4) html += '<div class="pt-mant-more">+ ' + (m.features.length - 4) + ' más</div>';
          html += '</div>';
        }
        html += '  <div class="pt-mant-cta">' + (isSel ? '✓ Seleccionado' : 'Elegir') + '</div>';
        html += '</button>';
      });
      html += '  </div>';
      html += '</div>';
      return html;
    }

    // ── v15.0 · STEP-3 · form de captura ──
    function htmlStep3() {
      var f = state.formData || {};
      var html = '';
      html += '<div class="pt-step pt-step-3" data-step="3">';
      html += '  <div class="pt-step-head">';
      html += '    <span class="pt-step-num">03</span>';
      html += '    <div><h4 class="pt-step-title">¿A dónde te enviamos la propuesta?</h4>';
      html += '    <p class="pt-step-sub">Datos para preparar tu cotización formal y reservar tiempo del equipo.</p></div>';
      html += '  </div>';
      html += '  <form class="pt-form" data-quiz-form novalidate>';
      html += '    <input type="text" name="website" tabindex="-1" autocomplete="off" class="pt-honeypot" aria-hidden="true">';
      html += '    <div class="pt-form-row">';
      html += '      <label class="pt-field">';
      html += '        <span class="pt-field-label">Nombre</span>';
      html += '        <input type="text" name="nombre" required minlength="2" maxlength="120" autocomplete="name" value="' + escHtml(f.nombre) + '" placeholder="Tu nombre">';
      html += '      </label>';
      html += '      <label class="pt-field">';
      html += '        <span class="pt-field-label">Email</span>';
      html += '        <input type="email" name="email" required maxlength="200" autocomplete="email" value="' + escHtml(f.email) + '" placeholder="tu@empresa.com">';
      html += '      </label>';
      html += '      <label class="pt-field">';
      html += '        <span class="pt-field-label">Empresa <span class="pt-field-opt">(opcional)</span></span>';
      html += '        <input type="text" name="empresa" maxlength="200" autocomplete="organization" value="' + escHtml(f.empresa) + '" placeholder="Tu negocio">';
      html += '      </label>';
      html += '    </div>';
      html += '    <div class="pt-form-actions">';
      html += '      <span class="pt-form-error" data-form-error hidden></span>';
      html += '      <button type="submit" class="btn-blue pt-form-submit"' + (state.submitting ? ' disabled' : '') + '>';
      html +=         state.submitting ? 'Enviando…' : 'Enviar y abrir WhatsApp →';
      html += '      </button>';
      html += '    </div>';
      html += '  </form>';
      html += '</div>';
      return html;
    }

    // ── Construye mensaje de WhatsApp + payload del webhook ──
    function buildSummary() {
      var cat = DATA.categorias[state.categoria];
      var plan = cat.planes.find(function (p) { return p.id === state.selectedPlanId; });
      if (!plan) return null;
      var precio = planPrice(plan, state.exhibicion, state.powerupsOn, powerupsTotalPct, exhMultiplier);
      var mantId = state.selectedMantenimiento;
      var mant = mantId === 'sin'
        ? { id: 'sin', label: 'Sin mantenimiento', precio: 0 }
        : mantenimiento.find(function (m) { return m.id === mantId; });
      var pago = state.exhibicion
        ? 'pago en exhibición · -' + discountPctLabel + '%'
        : 'pago mes a mes · 12 cuotas';
      var pwr = state.powerupsOn
        ? ' · con 5 Powerups +' + powerupsTotalPctLabel + '%'
        : '';
      var mantTxt = mant.precio > 0
        ? ' · mantenimiento ' + mant.label + ' (' + fmt(mant.precio) + '/mes)'
        : ' · sin mantenimiento';
      return {
        cat: cat, plan: plan, mant: mant,
        precio: precio,
        pago: pago, pwr: pwr, mantTxt: mantTxt,
      };
    }

    function buildWhatsAppMsg(s, formData) {
      var name = formData.nombre ? 'Soy ' + formData.nombre + (formData.empresa ? ' de ' + formData.empresa : '') + '.\n' : '';
      return name +
        'Me interesa el plan *' + s.plan.label + '* (' + s.cat.label + ').\n' +
        'Precio: ' + fmt(s.precio) + ' MXN · ' + s.pago + s.pwr + s.mantTxt + '.\n' +
        (formData.email ? 'Email: ' + formData.email + '\n' : '') +
        '¿Cómo procedemos?';
    }

    function buildLeadPayload(s, formData) {
      var seleccionesLines = [
        'Categoría: ' + s.cat.label,
        'Plan: ' + s.plan.label + ' (' + fmt(s.plan.base) + ' base)',
        'Pago: ' + s.pago,
        'Powerups: ' + (state.powerupsOn ? 'sí (+' + powerupsTotalPctLabel + '%)' : 'no'),
        'Mantenimiento: ' + s.mant.label + (s.mant.precio > 0 ? ' (' + fmt(s.mant.precio) + '/mes)' : ''),
        'Precio efectivo: ' + fmt(s.precio) + ' MXN',
      ].join('\n');
      return {
        nombre: formData.nombre,
        email: formData.email,
        empresa: formData.empresa,
        vertical: s.cat.label,
        subtipo: s.plan.label,
        total: fmt(s.precio),
        currency: 'MXN',
        selecciones: seleccionesLines,
        locale: 'es-MX',
        website: '',  // honeypot vacío en honest submissions
      };
    }

    // ── Acciones del quiz inline ──
    function selectPlan(planId) {
      if (state.selectedPlanId === planId) return;
      state.selectedPlanId = planId;
      state.selectedMantenimiento = null;   // reset mantenimiento al cambiar plan
      // Actualizar highlights de las cards
      container.querySelectorAll('.pricing-card').forEach(function (card) {
        var sel = card.getAttribute('data-plan') === planId;
        card.classList.toggle('is-selected', sel);
        var btn = card.querySelector('[data-select-plan]');
        if (btn) btn.textContent = sel ? '✓ Seleccionado' : 'Seleccionar';
      });
      // Render step-2 + scroll
      var stepsEl = container.querySelector('[data-quiz-steps]');
      stepsEl.innerHTML = htmlStep2();
      bindQuizSteps();
      smoothScrollTo(stepsEl.querySelector('.pt-step-2'));
    }

    function selectMantenimiento(mantId) {
      if (state.selectedMantenimiento === mantId) return;
      state.selectedMantenimiento = mantId;
      // Highlight cards
      container.querySelectorAll('[data-select-mant]').forEach(function (btn) {
        var sel = btn.getAttribute('data-select-mant') === mantId;
        btn.classList.toggle('is-selected', sel);
        var ctaEl = btn.querySelector('.pt-mant-cta');
        if (ctaEl) ctaEl.textContent = sel ? '✓ Seleccionado' : 'Elegir';
      });
      // Render step-3 (form) si no existe ya
      var stepsEl = container.querySelector('[data-quiz-steps]');
      var step2 = stepsEl.querySelector('.pt-step-2');
      var step3 = stepsEl.querySelector('.pt-step-3');
      if (!step3) {
        step2.insertAdjacentHTML('afterend', htmlStep3());
        bindQuizSteps();
      }
      smoothScrollTo(stepsEl.querySelector('.pt-step-3'));
    }

    function submitForm(formEl) {
      if (state.submitting) return;
      var data = new FormData(formEl);
      var formData = {
        nombre: (data.get('nombre') || '').toString().trim(),
        email: (data.get('email') || '').toString().trim(),
        empresa: (data.get('empresa') || '').toString().trim(),
        website: (data.get('website') || '').toString().trim(),
      };
      state.formData = formData;

      var errorEl = formEl.querySelector('[data-form-error]');
      function showErr(msg) {
        if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
      }
      // Validación básica
      if (formData.nombre.length < 2) return showErr('Tu nombre es obligatorio.');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!emailOk) return showErr('Email inválido.');

      var s = buildSummary();
      if (!s) return showErr('Selecciona un plan antes de continuar.');

      var payload = buildLeadPayload(s, formData);
      var msg = buildWhatsAppMsg(s, formData);
      var waUrl = 'https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(msg);

      // Abre WhatsApp INMEDIATAMENTE (popup blocker friendly: en gesto del usuario)
      window.open(waUrl, '_blank', 'noopener');

      // Y dispara el webhook async (no esperamos respuesta para no bloquear UX)
      state.submitting = true;
      var submitBtn = formEl.querySelector('.pt-form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

      fetch('/api/lead.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (r) {
        // Independientemente del result, mostramos confirmación al usuario
        return r.json().catch(function () { return {}; });
      }).catch(function () {
        // Network fail · seguimos OK porque WhatsApp ya abrió
      }).finally(function () {
        state.submitting = false;
        showConfirmation(formEl, s);
      });
    }

    function showConfirmation(formEl, s) {
      var stepsEl = container.querySelector('[data-quiz-steps]');
      var step3 = stepsEl.querySelector('.pt-step-3');
      if (step3) {
        step3.innerHTML =
          '<div class="pt-confirm">' +
          '  <span class="pt-confirm-ic">' + icon('check') + '</span>' +
          '  <h4 class="pt-confirm-title">¡Listo! Te abrimos WhatsApp</h4>' +
          '  <p class="pt-confirm-sub">' +
          '    Si no abrió, <a href="https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(buildWhatsAppMsg(s, state.formData)) + '" target="_blank" rel="noopener" class="pt-confirm-link">haz click aquí</a>.' +
          '    También te enviamos un correo de confirmación a ' + escHtml(state.formData.email) + '.' +
          '  </p>' +
          '</div>';
      }
    }

    function smoothScrollTo(el) {
      if (!el) return;
      setTimeout(function () {
        var rect = el.getBoundingClientRect();
        var top = rect.top + window.pageYOffset - 100;  // offset por sticky header
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 60);
    }

    // ── Recalcular precios ──
    function recalc(animate) {
      var cat = DATA.categorias[state.categoria];
      if (!cat) return;
      cat.planes.forEach(function (plan) {
        var card = container.querySelector('.pricing-card[data-plan="' + plan.id + '"]');
        if (!card) return;
        var amountEl = card.querySelector('[data-amount]');
        var prev = parseFloat((amountEl.textContent || '0').replace(/[^0-9.]/g, '')) || plan.base;
        var next = planPrice(plan, state.exhibicion, state.powerupsOn, powerupsTotalPct, exhMultiplier);
        if (animate) animateNumber(amountEl, prev, next);
        else amountEl.textContent = fmt(next);
      });
    }

    // ── Cambiar de categoría ──
    function switchCategoria(newCatId) {
      if (!DATA.categorias[newCatId] || newCatId === state.categoria) return;
      state.categoria = newCatId;
      // Reset de selecciones · cambiar categoría reinicia el quiz
      state.selectedPlanId = null;
      state.selectedMantenimiento = null;
      container.querySelectorAll('.pt-cat-tab').forEach(function (t) {
        var on = t.getAttribute('data-cat') === newCatId;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var headEl = container.querySelector('[data-cat-head]');
      var panelEl = container.querySelector('[data-cat-panel]');
      var stepsEl = container.querySelector('[data-quiz-steps]');
      if (headEl) headEl.innerHTML = htmlHead(newCatId);
      if (panelEl) panelEl.innerHTML = htmlPanel(newCatId);
      if (stepsEl) stepsEl.innerHTML = '';   // limpia steps del quiz
      bindPanel();
      recalc(false);
    }

    // ── Binds del panel (cards) ──
    function bindPanel() {
      var cmp = container.querySelector('.pt-compare');
      var cmpToggle = container.querySelector('.pt-compare-toggle');
      if (cmp && cmpToggle) {
        cmpToggle.addEventListener('click', function () {
          var open = cmp.classList.toggle('is-open');
          cmpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      // Botones "Seleccionar" de cada plan
      container.querySelectorAll('[data-select-plan]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectPlan(btn.getAttribute('data-select-plan'));
        });
      });
    }

    // ── Binds de los quiz steps (dynamic) ──
    function bindQuizSteps() {
      // Click en card de mantenimiento
      container.querySelectorAll('[data-select-mant]').forEach(function (btn) {
        if (btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', function () {
          selectMantenimiento(btn.getAttribute('data-select-mant'));
        });
      });
      // Submit del form
      var form = container.querySelector('[data-quiz-form]');
      if (form && form.dataset.bound !== '1') {
        form.dataset.bound = '1';
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          submitForm(form);
        });
      }
    }

    // ── Binds del shell (no se re-renderizan) ──
    function bindShell() {
      // Tabs de categoría
      container.querySelectorAll('.pt-cat-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          switchCategoria(tab.getAttribute('data-cat'));
        });
      });

      // Segmented control de pago
      container.querySelectorAll('.pt-seg-opt').forEach(function (opt) {
        opt.addEventListener('click', function () {
          var isExh = opt.getAttribute('data-pay') === 'exhibicion';
          if (state.exhibicion === isExh) return;
          state.exhibicion = isExh;
          container.querySelectorAll('.pt-seg-opt').forEach(function (o) {
            var on = (o.getAttribute('data-pay') === 'exhibicion') === isExh;
            o.classList.toggle('is-on', on);
            o.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          recalc(true);
        });
      });

      // Master toggle Powerups
      var puToggle = container.querySelector('[data-powerups-toggle]');
      var puPills  = container.querySelector('[data-powerups-pills]');
      if (puToggle) {
        puToggle.addEventListener('click', function () {
          state.powerupsOn = !state.powerupsOn;
          puToggle.classList.toggle('is-on', state.powerupsOn);
          puToggle.setAttribute('aria-pressed', state.powerupsOn ? 'true' : 'false');
          if (puPills) puPills.classList.toggle('is-on', state.powerupsOn);
          recalc(true);
        });
      }
    }

    // ── Mount ──
    container.innerHTML = htmlShell();
    var headEl = container.querySelector('[data-cat-head]');
    var panelEl = container.querySelector('[data-cat-panel]');
    if (headEl) headEl.innerHTML = htmlHead(state.categoria);
    if (panelEl) panelEl.innerHTML = htmlPanel(state.categoria);
    bindShell();
    bindPanel();
    recalc(false);
  }

  function boot() {
    document.querySelectorAll('[data-pricing-spa]').forEach(function (el) {
      var initial = el.getAttribute('data-pricing-spa') || 'webs';
      renderSPA(el, initial);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.IBISNE_PRICING_TABLE = { renderSPA: renderSPA };
})();

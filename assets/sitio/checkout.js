/* ===================================================================
   assets/sitio/checkout.js · v19.0 · Checkout extendido (toggles + MSI + pago)
   ===================================================================
   Cambios vs v17.0:
   - Toggles Powerups + Mantenimiento EDITABLES in-situ (no solo display)
   - Métodos de pago: SPEI · Mercado Pago · OXXO Spin · Criptomonedas (placeholders)
   - Meses sin intereses: 1 · 3 · 6 · 9 · 12 (segmented · cuota mensual inline)
   - Stepper 1→2→3 (paso 2 activo)
   - Summary lateral re-renderiza reactivo al cambiar config
   - Spinner inline en submit
   - Theme restore (inline en HTML para evitar FOUC)
   =================================================================== */
(function () {
  'use strict';

  var HUNTER_WA = '523329575274';

  // Métodos de pago disponibles (visual · placeholders sin integración real)
  var METODOS_PAGO = [
    { id: 'transferencia', label: 'Transferencia', desc: 'Asesor te confirma datos', badge: '', icon: 'partnership', activo: true },
    { id: 'spei',          label: 'SPEI',          desc: 'Pago bancario inmediato', badge: 'Próximamente', icon: 'serverapp', activo: false },
    { id: 'mercadopago',   label: 'Mercado Pago',  desc: 'Tarjeta · QR · saldo MP', badge: 'Próximamente', icon: 'ecommerce', activo: false },
    { id: 'oxxo',          label: 'OXXO Spin',     desc: 'Efectivo en tienda',       badge: 'Próximamente', icon: 'sitio',    activo: false },
    { id: 'cripto',        label: 'Criptomonedas', desc: 'USDT · USDC · BTC',        badge: 'Próximamente', icon: 'star',     activo: false },
  ];

  // Opciones MSI
  var MSI_OPTIONS = [
    { id: 1,  label: '1 pago' },
    { id: 3,  label: '3 MSI'  },
    { id: 6,  label: '6 MSI'  },
    { id: 9,  label: '9 MSI'  },
    { id: 12, label: '12 MSI' },
  ];

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
  function planPrice(plan, powerupsOn, totalPct) {
    var mult = 1 + (powerupsOn ? (totalPct || 0) : 0);
    return plan.base * mult;
  }
  function mantPrice(mantId, mantList) {
    if (!mantId || mantId === 'sin') return 0;
    var m = mantList.find(function (x) { return x.id === mantId; });
    return m ? m.precio : 0;
  }
  function mantLabel(mantId, mantList) {
    if (!mantId || mantId === 'sin') return 'Sin mantenimiento';
    var m = mantList.find(function (x) { return x.id === mantId; });
    return m ? m.label : 'Sin mantenimiento';
  }
  function metodoLabel(id) {
    var m = METODOS_PAGO.find(function (x) { return x.id === id; });
    return m ? m.label : 'Transferencia';
  }

  function init(container) {
    var DATA = window.IBISNE_PRECIOS_V13;
    if (!DATA || !DATA.categorias) {
      container.innerHTML = '<p style="padding:32px;color:#666">Sin datos · vuelve al cotizador.</p>';
      return;
    }

    // Lectura URL params
    var params = new URLSearchParams(window.location.search);
    var catId = params.get('cat') || 'webs';
    var planId = params.get('plan');
    var powerupsInit = params.get('pwr') === '1';
    var mantIdInit = params.get('mant') || 'sin';

    var cat = DATA.categorias[catId];
    if (!cat) { window.location.href = '/quiz.html'; return; }
    var plan = cat.planes.find(function (p) { return p.id === planId; });
    if (!plan) { window.location.href = '/quiz.html?cat=' + encodeURIComponent(catId); return; }

    var powerupsTotalPct = DATA.powerupsTotalPct || 0;
    var powerupsTotalPctLabel = Math.round(powerupsTotalPct * 100);
    var mantList = DATA.mantenimiento || [];

    // State editable (toggles re-renderizan summary)
    var state = {
      submitting: false,
      powerupsOn: powerupsInit,
      mantId: mantIdInit,
      metodoPago: 'transferencia',
      msi: 1,
      formData: { nombre: '', email: '', telefono: '', empresa: '', timeline: '', detalles: '' },
    };

    // ─────────────────────────────────────────────────────────
    // RENDERS
    // ─────────────────────────────────────────────────────────
    function htmlStepper() {
      return '<div class="qg-stepper" aria-label="Progreso de compra">' +
             '  <span class="qg-step is-done"><span class="qg-step-num">1</span><span class="qg-step-label">Cotizar</span></span>' +
             '  <span class="qg-step-line" aria-hidden="true"></span>' +
             '  <span class="qg-step is-active"><span class="qg-step-num">2</span><span class="qg-step-label">Checkout</span></span>' +
             '  <span class="qg-step-line" aria-hidden="true"></span>' +
             '  <span class="qg-step"><span class="qg-step-num">3</span><span class="qg-step-label">Confirmación</span></span>' +
             '</div>';
    }

    function htmlConfigSection() {
      var deltaPwr = Math.round(plan.base * powerupsTotalPct);
      var html = '';
      html += '<div class="co-form-group co-config-section">';
      html += '  <h2 class="co-form-title">Ajusta tu paquete</h2>';
      html += '  <p class="co-form-help">Activa o desactiva opciones · el resumen se actualiza al instante.</p>';

      // Modo Pro switch · v19.3 sin porcentajes
      html += '  <button type="button" class="co-toggle' + (state.powerupsOn ? ' is-on' : '') + '" data-toggle-pwr aria-pressed="' + (state.powerupsOn ? 'true' : 'false') + '">';
      html += '    <span class="co-toggle-switch" aria-hidden="true"><span class="co-toggle-knob"></span></span>';
      html += '    <span class="co-toggle-copy">';
      html += '      <span class="co-toggle-title">Activar Modo Pro</span>';
      html += '      <span class="co-toggle-sub">Tu proyecto destaca · animaciones · claro y oscuro · varios idiomas · varias monedas · app instalable</span>';
      html += '    </span>';
      html += '    <span class="co-toggle-delta" data-pwr-delta>+' + fmt(deltaPwr) + '</span>';
      html += '  </button>';

      // Mantenimiento segmented
      html += '  <div class="co-mant" role="group" aria-label="Mantenimiento mensual">';
      html += '    <span class="co-mant-label">Mantenimiento mensual</span>';
      html += '    <div class="co-mant-seg">';
      html += '      <button type="button" class="co-mant-opt' + (state.mantId === 'sin' ? ' is-on' : '') + '" data-mant="sin">Sin <span class="co-mant-pct">$0</span></button>';
      mantList.forEach(function (m) {
        var on = state.mantId === m.id;
        html += '      <button type="button" class="co-mant-opt' + (on ? ' is-on' : '') + '" data-mant="' + escHtml(m.id) + '">' + escHtml(m.label) + ' <span class="co-mant-pct">' + fmt(m.precio) + '/mes</span></button>';
      });
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
      return html;
    }

    function htmlPaySection() {
      var html = '';
      html += '<div class="co-form-group co-pay-section">';
      html += '  <h2 class="co-form-title">Forma de pago</h2>';
      html += '  <p class="co-form-help">El asesor confirma la disponibilidad de cada opción contigo.</p>';
      html += '  <div class="co-pay-grid">';
      METODOS_PAGO.forEach(function (m) {
        var on = state.metodoPago === m.id;
        html += '    <button type="button" class="co-pay-card' + (on ? ' is-on' : '') + (m.activo ? '' : ' is-soon') + '" data-pay="' + escHtml(m.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">';
        html += '      <span class="co-pay-ic">' + icon(m.icon) + '</span>';
        html += '      <span class="co-pay-info">';
        html += '        <span class="co-pay-label">' + escHtml(m.label) + '</span>';
        html += '        <span class="co-pay-desc">' + escHtml(m.desc) + '</span>';
        html += '      </span>';
        if (m.badge) html += '      <span class="co-pay-badge">' + escHtml(m.badge) + '</span>';
        html += '    </button>';
      });
      html += '  </div>';
      html += '</div>';
      return html;
    }

    function htmlMsiSection() {
      var totalInicial = planPrice(plan, state.powerupsOn, powerupsTotalPct);
      var html = '';
      html += '<div class="co-form-group co-msi-section">';
      html += '  <h2 class="co-form-title">Meses sin intereses</h2>';
      html += '  <p class="co-form-help">Confirmamos disponibilidad de MSI con el asesor según el método de pago elegido.</p>';
      html += '  <div class="co-msi-seg" role="group" aria-label="Plazo de pago">';
      MSI_OPTIONS.forEach(function (opt) {
        var on = state.msi === opt.id;
        html += '    <button type="button" class="co-msi-opt' + (on ? ' is-on' : '') + '" data-msi="' + opt.id + '">' + escHtml(opt.label) + '</button>';
      });
      html += '  </div>';
      var cuota = state.msi > 1 ? totalInicial / state.msi : 0;
      html += '  <p class="co-msi-quota" data-msi-quota>' +
              (state.msi > 1 ? fmt(cuota) + '/mes <small>× ' + state.msi + ' meses · total ' + fmt(totalInicial) + '</small>' : 'Pago único de ' + fmt(totalInicial)) +
              '</p>';
      html += '</div>';
      return html;
    }

    function htmlSummary() {
      var precioPlan = planPrice(plan, state.powerupsOn, powerupsTotalPct);
      var precioMant = mantPrice(state.mantId, mantList);
      var lbMant = mantLabel(state.mantId, mantList);
      var deltaPwr = Math.round(plan.base * powerupsTotalPct);

      var html = '';
      html += '<div class="co-summary-inner">';
      html += '  <span class="co-summary-eyebrow">Tu paquete</span>';
      html += '  <h3 class="co-summary-title">' + escHtml(plan.label) + '</h3>';
      html += '  <p class="co-summary-cat">' + escHtml(cat.label) + ' · entrega ' + escHtml(plan.tiempo) + '</p>';

      // Desglose
      html += '  <ul class="co-summary-list">';
      html += '    <li class="co-summary-item">';
      html += '      <span class="co-summary-item-name">Plan ' + escHtml(plan.label) + '</span>';
      html += '      <span class="co-summary-item-price">' + fmt(plan.base) + '</span>';
      html += '    </li>';
      if (state.powerupsOn) {
        html += '    <li class="co-summary-item is-powerup">';
        html += '      <span class="co-summary-item-name">Modo Pro <span class="co-summary-item-meta">5 capacidades · destaca tu proyecto</span></span>';
        html += '      <span class="co-summary-item-price">+' + fmt(deltaPwr) + '</span>';
        html += '    </li>';
      }
      if (precioMant > 0) {
        html += '    <li class="co-summary-item is-recur">';
        html += '      <span class="co-summary-item-name">' + escHtml(lbMant) + ' <span class="co-summary-item-meta">recurrente / mes</span></span>';
        html += '      <span class="co-summary-item-price">' + fmt(precioMant) + '<small>/mes</small></span>';
        html += '    </li>';
      }
      html += '  </ul>';

      // Totales
      html += '  <div class="co-summary-totals">';
      html += '    <div class="co-summary-total-row">';
      html += '      <span>Total inicial</span>';
      html += '      <span class="co-summary-total-amt">' + fmt(precioPlan) + '<small> MXN</small></span>';
      html += '    </div>';
      if (state.msi > 1) {
        html += '    <div class="co-summary-total-row is-sub">';
        html += '      <span>' + state.msi + ' MSI</span>';
        html += '      <span class="co-summary-total-recur">' + fmt(precioPlan / state.msi) + '<small>/mes</small></span>';
        html += '    </div>';
      }
      if (precioMant > 0) {
        html += '    <div class="co-summary-total-row is-sub">';
        html += '      <span>Recurrente</span>';
        html += '      <span class="co-summary-total-recur">' + fmt(precioMant) + '<small>/mes MXN</small></span>';
        html += '    </div>';
      }
      html += '  </div>';

      // Meta config
      html += '  <div class="co-summary-meta">';
      html += '    <span class="co-summary-meta-row"><span>Pago</span><span>' + escHtml(metodoLabel(state.metodoPago)) + '</span></span>';
      html += '    <span class="co-summary-meta-row"><span>Plazo</span><span>' + (state.msi > 1 ? state.msi + ' MSI' : '1 pago') + '</span></span>';
      html += '  </div>';

      html += '  <div class="co-summary-foot">';
      html += '    <p>Sin sorpresas en la factura. Te confirmamos al hablar.</p>';
      html += '  </div>';
      html += '</div>';
      return html;
    }

    function htmlShell() {
      var html = '';
      html += htmlStepper();

      // FORM SECTION (izq)
      html += '<section class="co-section co-form-section">';
      html += '  <h1 class="co-title">Confirma tu paquete</h1>';
      html += '  <p class="co-subtitle">Ajusta opciones · captúranos tus datos · te contactamos en horas.</p>';

      html += '  <form class="co-form" data-form novalidate>';
      html += '    <input type="text" name="website" tabindex="-1" autocomplete="off" class="co-honeypot" aria-hidden="true">';

      // Configuración (editable)
      html += htmlConfigSection();

      // Información de contacto
      html += '    <div class="co-form-group">';
      html += '      <h2 class="co-form-title">Información de contacto</h2>';
      html += '      <div class="co-form-row">';
      html += '        <label class="co-field">';
      html += '          <span class="co-field-label">Nombre completo</span>';
      html += '          <input type="text" name="nombre" required minlength="2" maxlength="120" autocomplete="name" placeholder="Tu nombre">';
      html += '        </label>';
      html += '        <label class="co-field">';
      html += '          <span class="co-field-label">Email</span>';
      html += '          <input type="email" name="email" required maxlength="200" autocomplete="email" placeholder="tu@empresa.com">';
      html += '        </label>';
      html += '      </div>';
      html += '      <div class="co-form-row">';
      html += '        <label class="co-field">';
      html += '          <span class="co-field-label">Teléfono <span class="co-field-opt">(WhatsApp)</span></span>';
      html += '          <input type="tel" name="telefono" maxlength="40" autocomplete="tel" placeholder="+52 33 1234 5678">';
      html += '        </label>';
      html += '        <label class="co-field">';
      html += '          <span class="co-field-label">Empresa <span class="co-field-opt">(opcional)</span></span>';
      html += '          <input type="text" name="empresa" maxlength="200" autocomplete="organization" placeholder="Tu negocio">';
      html += '        </label>';
      html += '      </div>';
      html += '    </div>';

      // Detalles del proyecto
      html += '    <div class="co-form-group">';
      html += '      <h2 class="co-form-title">Detalles del proyecto</h2>';
      html += '      <label class="co-field">';
      html += '        <span class="co-field-label">¿Cuándo te gustaría empezar?</span>';
      html += '        <select name="timeline">';
      html += '          <option value="">Selecciona…</option>';
      html += '          <option value="esta-semana">Esta semana</option>';
      html += '          <option value="2-4-semanas">En 2-4 semanas</option>';
      html += '          <option value="1-3-meses">En 1-3 meses</option>';
      html += '          <option value="explorando">Explorando opciones</option>';
      html += '        </select>';
      html += '      </label>';
      html += '      <label class="co-field">';
      html += '        <span class="co-field-label">Información adicional <span class="co-field-opt">(opcional)</span></span>';
      html += '        <textarea name="detalles" rows="4" maxlength="1500" placeholder="Cuéntanos del proyecto: objetivo, audiencia, referencias, restricciones técnicas, etc."></textarea>';
      html += '      </label>';
      html += '    </div>';

      // Método de pago
      html += htmlPaySection();

      // MSI
      html += htmlMsiSection();

      // Form actions
      html += '    <div class="co-form-actions">';
      html += '      <span class="co-form-error" data-form-error hidden></span>';
      html += '      <button type="submit" class="co-submit-btn" data-submit>';
      html += '        <span class="co-submit-spinner" aria-hidden="true" hidden></span>';
      html += '        <span class="co-submit-text">Enviar mi solicitud</span>';
      html += '        <span class="co-submit-arrow" aria-hidden="true">→</span>';
      html += '      </button>';
      html += '      <p class="co-form-foot">';
      html += '        Al enviar abrimos WhatsApp con tu información para acelerar el contacto.';
      html += '        <br>¿Prefieres llamar? <a href="https://wa.me/' + HUNTER_WA + '?text=Hola%2C%20necesito%20hablar%20con%20un%20asesor" target="_blank" rel="noopener" class="co-form-link">Habla con un asesor antes</a>.';
      html += '      </p>';
      html += '    </div>';

      html += '  </form>';
      html += '</section>';

      // SUMMARY (der · sticky desktop · data-summary para re-render reactivo)
      html += '<aside class="co-summary" aria-label="Resumen del paquete" data-summary>';
      html += htmlSummary();
      html += '</aside>';

      return html;
    }

    // ─────────────────────────────────────────────────────────
    // REACTIVITY
    // ─────────────────────────────────────────────────────────
    function updateSummary() {
      var summaryEl = container.querySelector('[data-summary]');
      if (summaryEl) summaryEl.innerHTML = htmlSummary();
    }

    function updateMsiQuota() {
      var quotaEl = container.querySelector('[data-msi-quota]');
      if (!quotaEl) return;
      var total = planPrice(plan, state.powerupsOn, powerupsTotalPct);
      if (state.msi > 1) {
        quotaEl.innerHTML = fmt(total / state.msi) + '/mes <small>× ' + state.msi + ' meses · total ' + fmt(total) + '</small>';
      } else {
        quotaEl.textContent = 'Pago único de ' + fmt(total);
      }
    }

    function updatePwrDelta() {
      var deltaEl = container.querySelector('[data-pwr-delta]');
      if (deltaEl) deltaEl.textContent = '+' + fmt(Math.round(plan.base * powerupsTotalPct));
    }

    // ─────────────────────────────────────────────────────────
    // SUBMIT (WhatsApp + lead webhook + confirmación)
    // ─────────────────────────────────────────────────────────
    function buildWhatsAppMsg(formData) {
      var precioPlan = planPrice(plan, state.powerupsOn, powerupsTotalPct);
      var precioMant = mantPrice(state.mantId, mantList);
      var lbMant = mantLabel(state.mantId, mantList);

      var name = formData.nombre ? 'Soy ' + formData.nombre + (formData.empresa ? ' de ' + formData.empresa : '') + '.\n' : '';
      var pwrTxt = state.powerupsOn ? ' + Modo Pro' : '';
      var mantTxt = precioMant > 0 ? ' + ' + lbMant + ' (' + fmt(precioMant) + '/mes)' : '';
      var msiTxt = state.msi > 1 ? '\nPlazo: ' + state.msi + ' MSI · cuota ' + fmt(precioPlan / state.msi) + '/mes' : '\nPlazo: pago único';
      var pagoTxt = '\nMétodo de pago: ' + metodoLabel(state.metodoPago);
      var timelineTxt = formData.timeline ? '\nTimeline: ' + formData.timeline : '';
      var detallesTxt = formData.detalles ? '\nDetalles: ' + formData.detalles : '';
      var contactTxt = (formData.email || formData.telefono)
        ? '\nContacto: ' + [formData.email, formData.telefono].filter(Boolean).join(' · ')
        : '';
      return name +
        'Confirmé mi paquete: *' + plan.label + '* (' + cat.label + ')' + pwrTxt + mantTxt + '.\n' +
        'Total inicial: ' + fmt(precioPlan) + ' MXN' +
        (precioMant > 0 ? ' · recurrente ' + fmt(precioMant) + '/mes' : '') + '.' +
        pagoTxt + msiTxt + timelineTxt + detallesTxt + contactTxt + '\n' +
        'Quiero hablar para arrancar.';
    }

    function buildLeadPayload(formData) {
      var precioPlan = planPrice(plan, state.powerupsOn, powerupsTotalPct);
      var precioMant = mantPrice(state.mantId, mantList);
      var lbMant = mantLabel(state.mantId, mantList);
      var seleccionesLines = [
        'Categoría: ' + cat.label,
        'Plan: ' + plan.label + ' (' + fmt(plan.base) + ' base)',
        'Modo Pro: ' + (state.powerupsOn ? 'sí · activado' : 'no'),
        'Mantenimiento: ' + lbMant + (precioMant > 0 ? ' · ' + fmt(precioMant) + '/mes' : ''),
        'Total inicial: ' + fmt(precioPlan) + ' MXN',
        'Método de pago: ' + metodoLabel(state.metodoPago),
        'Plazo: ' + (state.msi > 1 ? state.msi + ' MSI · cuota ' + fmt(precioPlan / state.msi) + '/mes' : 'pago único'),
        formData.timeline ? 'Timeline: ' + formData.timeline : '',
      ].filter(Boolean).join('\n');
      return {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        empresa: formData.empresa,
        vertical: cat.label,
        subtipo: plan.label,
        total: fmt(precioPlan),
        currency: 'MXN',
        selecciones: seleccionesLines,
        mensaje: formData.detalles,
        locale: 'es-MX',
        website: '',
        metodoPago: state.metodoPago,
        msi: state.msi,
        powerupsOn: state.powerupsOn,
        mantenimiento: state.mantId,
      };
    }

    function submitForm(formEl) {
      if (state.submitting) return;
      var data = new FormData(formEl);
      var formData = {
        nombre: (data.get('nombre') || '').toString().trim(),
        email: (data.get('email') || '').toString().trim(),
        telefono: (data.get('telefono') || '').toString().trim(),
        empresa: (data.get('empresa') || '').toString().trim(),
        timeline: (data.get('timeline') || '').toString().trim(),
        detalles: (data.get('detalles') || '').toString().trim(),
        website: (data.get('website') || '').toString().trim(),
      };
      state.formData = formData;

      var errorEl = formEl.querySelector('[data-form-error]');
      function showErr(msg) {
        if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
      }
      if (formData.nombre.length < 2) return showErr('Tu nombre completo es obligatorio.');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!emailOk) return showErr('Ingresa un email válido.');

      var payload = buildLeadPayload(formData);
      var msg = buildWhatsAppMsg(formData);
      var waUrl = 'https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(msg);

      // Abre WhatsApp (popup blocker friendly)
      window.open(waUrl, '_blank', 'noopener');

      state.submitting = true;
      var submitBtn = formEl.querySelector('[data-submit]');
      var spinnerEl = formEl.querySelector('.co-submit-spinner');
      var textEl = formEl.querySelector('.co-submit-text');
      var arrowEl = formEl.querySelector('.co-submit-arrow');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('is-loading'); }
      if (spinnerEl) spinnerEl.hidden = false;
      if (textEl) textEl.textContent = 'Enviando…';
      if (arrowEl) arrowEl.hidden = true;

      fetch('/api/lead.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (r) {
        return r.json().catch(function () { return {}; });
      }).catch(function () { /* OK · WhatsApp ya abrió */ })
        .finally(function () {
          state.submitting = false;
          showConfirmation(formData);
        });
    }

    function showConfirmation(formData) {
      container.innerHTML =
        // Stepper paso 3 done
        '<div class="qg-stepper" aria-label="Progreso de compra">' +
        '  <span class="qg-step is-done"><span class="qg-step-num">1</span><span class="qg-step-label">Cotizar</span></span>' +
        '  <span class="qg-step-line" aria-hidden="true"></span>' +
        '  <span class="qg-step is-done"><span class="qg-step-num">2</span><span class="qg-step-label">Checkout</span></span>' +
        '  <span class="qg-step-line" aria-hidden="true"></span>' +
        '  <span class="qg-step is-active"><span class="qg-step-num">3</span><span class="qg-step-label">Confirmación</span></span>' +
        '</div>' +
        '<div class="co-confirm">' +
        '  <span class="co-confirm-ic">' + icon('check') + '</span>' +
        '  <h2 class="co-confirm-title">¡Listo, ' + escHtml(formData.nombre.split(' ')[0]) + '!</h2>' +
        '  <p class="co-confirm-sub">Te abrimos WhatsApp con tu solicitud. Si no se abrió, <a href="https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(buildWhatsAppMsg(formData)) + '" target="_blank" rel="noopener">haz click aquí</a>.</p>' +
        '  <p class="co-confirm-sub">También enviamos confirmación a <strong>' + escHtml(formData.email) + '</strong>. Te respondemos en horas.</p>' +
        '  <div class="co-confirm-actions">' +
        '    <a href="/" class="co-confirm-btn">Volver a iBisne</a>' +
        '    <a href="/quiz.html" class="co-confirm-link">Cotizar otro plan</a>' +
        '  </div>' +
        '</div>';
    }

    // ─────────────────────────────────────────────────────────
    // BIND
    // ─────────────────────────────────────────────────────────
    function bindAll() {
      // Powerups toggle
      var pwrBtn = container.querySelector('[data-toggle-pwr]');
      if (pwrBtn) {
        pwrBtn.addEventListener('click', function () {
          state.powerupsOn = !state.powerupsOn;
          pwrBtn.classList.toggle('is-on', state.powerupsOn);
          pwrBtn.setAttribute('aria-pressed', state.powerupsOn ? 'true' : 'false');
          updateSummary();
          updateMsiQuota();
        });
      }

      // Mantenimiento segmented
      container.querySelectorAll('[data-mant]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-mant');
          if (state.mantId === v) return;
          state.mantId = v;
          container.querySelectorAll('[data-mant]').forEach(function (o) {
            o.classList.toggle('is-on', o.getAttribute('data-mant') === v);
          });
          updateSummary();
        });
      });

      // Método de pago
      container.querySelectorAll('[data-pay]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-pay');
          if (state.metodoPago === v) return;
          state.metodoPago = v;
          container.querySelectorAll('[data-pay]').forEach(function (o) {
            var on = o.getAttribute('data-pay') === v;
            o.classList.toggle('is-on', on);
            o.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          updateSummary();
        });
      });

      // MSI segmented
      container.querySelectorAll('[data-msi]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = parseInt(b.getAttribute('data-msi'), 10);
          if (state.msi === v) return;
          state.msi = v;
          container.querySelectorAll('[data-msi]').forEach(function (o) {
            o.classList.toggle('is-on', parseInt(o.getAttribute('data-msi'), 10) === v);
          });
          updateSummary();
          updateMsiQuota();
        });
      });

      // Form submit
      var formEl = container.querySelector('[data-form]');
      if (formEl) {
        formEl.addEventListener('submit', function (e) {
          e.preventDefault();
          submitForm(formEl);
        });
      }
    }

    // Mount
    container.innerHTML = htmlShell();

    // Hidratar iconos
    container.querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.querySelector('svg')) return;
      el.innerHTML = window.IBISNE_ICONS ? window.IBISNE_ICONS.get(el.getAttribute('data-icon'), 'line') || '' : '';
    });

    bindAll();
  }

  function boot() {
    var container = document.querySelector('[data-checkout]');
    if (!container) return;
    init(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.IBISNE_CHECKOUT = { init: init };
})();

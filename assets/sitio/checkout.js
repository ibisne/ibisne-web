/* ===================================================================
   assets/sitio/checkout.js · v17.0 · Checkout estilo Shopify adaptado
   ===================================================================
   Lee URL params del cotizador (?cat=...&plan=...&pwr=0/1&mant=sin/basico/premium)
   Renderiza: form de captura izq + resumen del paquete der (sticky desktop)
   Submit → POST /api/lead.js + abre WhatsApp con prefill + confirmación inline

   Sin pago real ahora · solo captura + asesor (v17.0 alcance).
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
  function planPrice(plan, powerupsOn, totalPct) {
    var mult = 1 + (powerupsOn ? (totalPct || 0) : 0);
    return plan.base * mult;
  }
  function mantenimientoPrice(mantId, mantList) {
    if (!mantId || mantId === 'sin') return 0;
    var m = mantList.find(function (x) { return x.id === mantId; });
    return m ? m.precio : 0;
  }
  function mantenimientoLabel(mantId, mantList) {
    if (!mantId || mantId === 'sin') return 'Sin mantenimiento';
    var m = mantList.find(function (x) { return x.id === mantId; });
    return m ? m.label : 'Sin mantenimiento';
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
    var powerupsOn = params.get('pwr') === '1';
    var mantId = params.get('mant') || 'sin';

    // Validación: si plan inválido → redirect al cotizador
    var cat = DATA.categorias[catId];
    if (!cat) {
      window.location.href = '/quiz.html';
      return;
    }
    var plan = cat.planes.find(function (p) { return p.id === planId; });
    if (!plan) {
      window.location.href = '/quiz.html?cat=' + encodeURIComponent(catId);
      return;
    }

    var powerupsTotalPct = DATA.powerupsTotalPct || 0;
    var powerupsTotalPctLabel = Math.round(powerupsTotalPct * 100);
    var mantList = DATA.mantenimiento || [];
    var precioPlan = planPrice(plan, powerupsOn, powerupsTotalPct);
    var precioMant = mantenimientoPrice(mantId, mantList);
    var mantLabel = mantenimientoLabel(mantId, mantList);

    var state = {
      submitting: false,
      formData: { nombre: '', email: '', telefono: '', empresa: '', timeline: '', detalles: '' },
    };

    function htmlShell() {
      var html = '';

      // FORM SECTION (izq)
      html += '<section class="co-section co-form-section">';
      html += '  <h1 class="co-title">Confirma tu paquete</h1>';
      html += '  <p class="co-subtitle">Te contactamos en horas para definir el alcance y empezar.</p>';

      html += '  <form class="co-form" data-form novalidate>';
      html += '    <input type="text" name="website" tabindex="-1" autocomplete="off" class="co-honeypot" aria-hidden="true">';

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

      // Form actions
      html += '    <div class="co-form-actions">';
      html += '      <span class="co-form-error" data-form-error hidden></span>';
      html += '      <button type="submit" class="co-submit-btn" data-submit>';
      html += '        Enviar mi solicitud <span aria-hidden="true">→</span>';
      html += '      </button>';
      html += '      <p class="co-form-foot">';
      html += '        Al enviar abrimos WhatsApp con tu información para acelerar el contacto.';
      html += '        <br>¿Prefieres llamar? <a href="https://wa.me/' + HUNTER_WA + '?text=Hola%2C%20necesito%20hablar%20con%20un%20asesor" target="_blank" rel="noopener" class="co-form-link">Habla con un asesor antes</a>.';
      html += '      </p>';
      html += '    </div>';

      html += '  </form>';
      html += '</section>';

      // SUMMARY (der · sticky desktop)
      html += '<aside class="co-summary" aria-label="Resumen del paquete">';
      html += '  <div class="co-summary-inner">';
      html += '    <span class="co-summary-eyebrow">Tu paquete</span>';
      html += '    <h3 class="co-summary-title">' + escHtml(plan.label) + '</h3>';
      html += '    <p class="co-summary-cat">' + escHtml(cat.label) + ' · entrega ' + escHtml(plan.tiempo) + '</p>';

      // Desglose
      html += '    <ul class="co-summary-list">';
      html += '      <li class="co-summary-item">';
      html += '        <span class="co-summary-item-name">Plan ' + escHtml(plan.label) + '</span>';
      html += '        <span class="co-summary-item-price">' + fmt(plan.base) + '</span>';
      html += '      </li>';
      if (powerupsOn) {
        html += '      <li class="co-summary-item is-powerup">';
        html += '        <span class="co-summary-item-name">Powerups (×4 precio) <span class="co-summary-item-meta">5 capacidades premium</span></span>';
        html += '        <span class="co-summary-item-price">+' + fmt(plan.base * powerupsTotalPct) + '</span>';
        html += '      </li>';
      }
      if (precioMant > 0) {
        html += '      <li class="co-summary-item is-recur">';
        html += '        <span class="co-summary-item-name">' + escHtml(mantLabel) + ' <span class="co-summary-item-meta">recurrente / mes</span></span>';
        html += '        <span class="co-summary-item-price">' + fmt(precioMant) + '<small>/mes</small></span>';
        html += '      </li>';
      }
      html += '    </ul>';

      // Totales
      html += '    <div class="co-summary-totals">';
      html += '      <div class="co-summary-total-row">';
      html += '        <span>Total inicial</span>';
      html += '        <span class="co-summary-total-amt">' + fmt(precioPlan) + '<small> MXN</small></span>';
      html += '      </div>';
      if (precioMant > 0) {
        html += '      <div class="co-summary-total-row is-sub">';
        html += '        <span>Recurrente</span>';
        html += '        <span class="co-summary-total-recur">' + fmt(precioMant) + '<small>/mes MXN</small></span>';
        html += '      </div>';
      }
      html += '    </div>';

      // Footer info
      html += '    <div class="co-summary-foot">';
      html += '      <p>Precio cerrado. Sin sorpresas. Te confirmamos al hablar.</p>';
      html += '    </div>';
      html += '  </div>';
      html += '</aside>';

      return html;
    }

    function buildWhatsAppMsg(formData) {
      var name = formData.nombre ? 'Soy ' + formData.nombre + (formData.empresa ? ' de ' + formData.empresa : '') + '.\n' : '';
      var pwrTxt = powerupsOn ? ' + Powerups (×4 = ' + powerupsTotalPctLabel + '%)' : '';
      var mantTxt = precioMant > 0 ? ' + ' + mantLabel + ' (' + fmt(precioMant) + '/mes)' : '';
      var timelineTxt = formData.timeline ? '\nTimeline: ' + formData.timeline : '';
      var detallesTxt = formData.detalles ? '\nDetalles: ' + formData.detalles : '';
      var contactTxt = (formData.email || formData.telefono)
        ? '\nContacto: ' + [formData.email, formData.telefono].filter(Boolean).join(' · ')
        : '';
      return name +
        'Confirmé mi paquete: *' + plan.label + '* (' + cat.label + ')' + pwrTxt + mantTxt + '.\n' +
        'Total inicial: ' + fmt(precioPlan) + ' MXN' +
        (precioMant > 0 ? ' · recurrente ' + fmt(precioMant) + '/mes' : '') + '.' +
        timelineTxt + detallesTxt + contactTxt + '\n' +
        'Quiero hablar para arrancar.';
    }

    function buildLeadPayload(formData) {
      var seleccionesLines = [
        'Categoría: ' + cat.label,
        'Plan: ' + plan.label + ' (' + fmt(plan.base) + ' base)',
        'Powerups: ' + (powerupsOn ? 'sí · ×4 (+' + powerupsTotalPctLabel + '%)' : 'no'),
        'Mantenimiento: ' + mantLabel + (precioMant > 0 ? ' · ' + fmt(precioMant) + '/mes' : ''),
        'Total inicial: ' + fmt(precioPlan) + ' MXN',
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
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

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

    // Mount
    container.innerHTML = htmlShell();

    // Hidratar iconos
    container.querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.querySelector('svg')) return;
      el.innerHTML = window.IBISNE_ICONS ? window.IBISNE_ICONS.get(el.getAttribute('data-icon'), 'line') || '' : '';
    });

    // Bind form
    var formEl = container.querySelector('[data-form]');
    if (formEl) {
      formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        submitForm(formEl);
      });
    }
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

/* ===================================================================
   assets/sitio/pricing-table.js · v12.0
   ===================================================================
   Render del componente Pricing Table desde IBISNE_PRECIOS_V12.
   Auto-inicializa cualquier <div data-pricing-categoria="webs">.
   Estado: pago en exhibición (global) + powerups activos por plan.
   Precio = base × (1 + Σ powerups activos) × (exhibición ? 0.75 : 1)
   CTA por plan → WhatsApp al hunter con plan + precio + extras.
   =================================================================== */
(function () {
  'use strict';

  var HUNTER_WA = '523329575274';

  function icon(id) {
    if (window.IBISNE_ICONS && id) return window.IBISNE_ICONS.get(id, 'line') || '';
    return '';
  }

  // Formato MXN · sin decimales para precios redondos de planes
  function fmt(n) {
    var v = Math.round(Number(n) || 0);
    return '$' + v.toLocaleString('en-US');
  }

  // Interpola un número con RAF · easeOutQuart · respeta reduced-motion
  function animateNumber(el, from, to, dur) {
    if (!el) return;
    dur = dur || 360;
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

  // Precio efectivo de un plan según estado
  function planPrice(plan, exhibicion, activePowerups, powerupsDef) {
    var mult = 1;
    activePowerups.forEach(function (pid) {
      var pu = powerupsDef.find(function (p) { return p.id === pid; });
      if (pu) mult += pu.addPct;
    });
    var price = plan.base * mult;
    if (exhibicion) price *= 0.75;
    return price;
  }

  function render(container, categoria) {
    var DATA = window.IBISNE_PRECIOS_V12;
    if (!DATA || !DATA[categoria]) {
      container.innerHTML = '<p class="t-muted">Sin datos de precios para "' + categoria + '".</p>';
      return;
    }
    var cat = DATA[categoria];
    var powerupsDef = DATA.powerups || [];

    // Estado local
    var state = {
      exhibicion: false,
      powerups: {},   // { planId: Set(powerupId) }
    };
    cat.planes.forEach(function (p) { state.powerups[p.id] = new Set(); });

    // ── Markup base ────────────────────────────────────────────
    var html = '';

    // Toggle de pago
    html += '<div class="pt-paytoggle">';
    html += '  <span class="pt-paytoggle-opt is-on" data-pay="mes">Pago mes a mes</span>';
    html += '  <label class="toggle-switch" aria-label="Cambiar a pago en exhibición">';
    html += '    <input type="checkbox" class="toggle-switch-input" id="pt-pay-' + categoria + '">';
    html += '    <span class="toggle-switch-track"></span>';
    html += '  </label>';
    html += '  <span class="pt-paytoggle-opt" data-pay="exhibicion">' + (DATA.exhibicion ? DATA.exhibicion.label : 'Pago en exhibición') +
            '<span class="pt-paytoggle-badge">' + (DATA.exhibicion ? DATA.exhibicion.badge : 'Ahorra 25%') + '</span></span>';
    html += '</div>';

    // Grid de cards
    html += '<div class="pricing-grid">';
    cat.planes.forEach(function (plan) {
      html += '<article class="pricing-card' + (plan.recomendado ? ' is-recomendado' : '') + '" data-plan="' + plan.id + '">';
      if (plan.recomendado) html += '<span class="pricing-card-banner">Más popular</span>';

      html += '<div class="pricing-card-head">';
      html += '  <span class="pricing-card-icon">' + icon(plan.icon) + '</span>';
      html += '  <div><div class="pricing-card-name">' + plan.label + '</div>';
      html += '  <div class="pricing-card-sub">' + plan.sub + '</div></div>';
      html += '</div>';

      html += '<div class="pricing-card-price">';
      html += '  <span class="pricing-card-amount" data-amount>' + fmt(plan.base) + '</span>';
      html += '  <span class="pricing-card-period">MXN</span>';
      html += '</div>';
      html += '<div class="pricing-card-tiempo">Entrega ' + plan.tiempo + '</div>';

      html += '<div class="pricing-card-cta">';
      html += '  <a class="btn ' + (plan.recomendado ? 'btn-accent' : 'btn-line') + '" data-cta href="#">' + (plan.cta || 'Empezar') + '</a>';
      html += '</div>';

      // Features
      html += '<div class="pricing-card-features">';
      (plan.features || []).forEach(function (f) {
        html += '<div class="pricing-card-feature"><span class="pricing-card-feature-check">' + icon('check') + '</span><span>' + f + '</span></div>';
      });
      html += '</div>';

      // Powerups
      if (powerupsDef.length) {
        html += '<div class="pricing-card-powerups">';
        html += '  <div class="pricing-card-powerups-label">— Powerups (suman al precio)</div>';
        powerupsDef.forEach(function (pu) {
          html += '<div class="pricing-powerup">';
          html += '  <span class="pricing-powerup-info">';
          html += '    <span class="pricing-powerup-icon">' + icon(pu.icon) + '</span>';
          html += '    <span class="pricing-powerup-text"><span class="pricing-powerup-name">' + pu.label + '</span> ';
          html += '    <span class="pricing-powerup-pct">+' + Math.round(pu.addPct * 100) + '%</span></span>';
          html += '  </span>';
          html += '  <label class="toggle-switch" aria-label="Activar ' + pu.label + '">';
          html += '    <input type="checkbox" class="toggle-switch-input" data-powerup="' + pu.id + '">';
          html += '    <span class="toggle-switch-track"></span>';
          html += '  </label>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</article>';
    });
    html += '</div>';

    // Tabla comparativa
    if (cat.featureRows && cat.featureRows.length) {
      html += '<div class="pt-compare">';
      html += '  <div class="pt-compare-title">— COMPARA TODOS LOS PLANES</div>';
      html += '  <button class="pt-compare-toggle" type="button">Lista completa <span class="pt-chevron">▾</span></button>';
      html += '  <div class="pt-compare-table-wrap"><div class="pt-compare-table-inner">';
      html += '    <table class="tier-table"><thead><tr><th>Característica</th>';
      cat.planes.forEach(function (p) {
        html += '<th class="' + (p.recomendado ? 'is-featured' : '') + '">' + p.label + '<span class="sub">' + p.sub + '</span></th>';
      });
      html += '</tr></thead><tbody>';
      cat.featureRows.forEach(function (row) {
        html += '<tr><th>' + row.label + '</th>';
        cat.planes.forEach(function (p) {
          var val = row.values[p.id];
          var cls = val === '✓' ? 'check' : (val === '—' ? 'dash' : '');
          html += '<td class="' + cls + (p.recomendado ? ' is-featured' : '') + '">' + (val || '—') + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '  </div></div>';
      html += '</div>';
    }

    container.innerHTML = html;

    // ── Recalcular precios de todas las cards ──────────────────
    function recalc(animate) {
      cat.planes.forEach(function (plan) {
        var card = container.querySelector('.pricing-card[data-plan="' + plan.id + '"]');
        if (!card) return;
        var amountEl = card.querySelector('[data-amount]');
        var prev = parseFloat((amountEl.textContent || '0').replace(/[^0-9.]/g, '')) || plan.base;
        var next = planPrice(plan, state.exhibicion, state.powerups[plan.id], powerupsDef);
        if (animate) animateNumber(amountEl, prev, next);
        else amountEl.textContent = fmt(next);
        // Actualizar el href del CTA con el precio actual
        var cta = card.querySelector('[data-cta]');
        if (cta) {
          var puNames = [];
          state.powerups[plan.id].forEach(function (pid) {
            var pu = powerupsDef.find(function (p) { return p.id === pid; });
            if (pu) puNames.push(pu.label);
          });
          var msg = 'Hola, me interesa el plan ' + plan.label + ' (' + cat.label + ').\n' +
            'Precio: ' + fmt(next) + ' MXN ' + (state.exhibicion ? '(pago en exhibición -25%)' : '(pago mes a mes)') + '.\n' +
            (puNames.length ? 'Powerups: ' + puNames.join(', ') + '.\n' : '') +
            '¿Cómo procedemos?';
          cta.href = 'https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(msg);
          cta.target = '_blank';
          cta.rel = 'noopener';
        }
      });
    }

    // ── Toggle de pago ─────────────────────────────────────────
    var payInput = container.querySelector('#pt-pay-' + categoria);
    if (payInput) {
      payInput.addEventListener('change', function () {
        state.exhibicion = payInput.checked;
        container.querySelectorAll('.pt-paytoggle-opt').forEach(function (o) {
          o.classList.toggle('is-on',
            (o.getAttribute('data-pay') === 'exhibicion') === state.exhibicion);
        });
        recalc(true);
      });
    }

    // ── Powerups ───────────────────────────────────────────────
    container.querySelectorAll('.pricing-card').forEach(function (card) {
      var planId = card.getAttribute('data-plan');
      card.querySelectorAll('[data-powerup]').forEach(function (input) {
        input.addEventListener('change', function () {
          var pid = input.getAttribute('data-powerup');
          if (input.checked) state.powerups[planId].add(pid);
          else state.powerups[planId].delete(pid);
          recalc(true);
        });
      });
    });

    // ── Acordeón tabla comparativa (mobile) ────────────────────
    var cmp = container.querySelector('.pt-compare');
    var cmpToggle = container.querySelector('.pt-compare-toggle');
    if (cmp && cmpToggle) {
      cmpToggle.addEventListener('click', function () {
        cmp.classList.toggle('is-open');
      });
    }

    // Init precios (sin animar)
    recalc(false);
  }

  // ── Auto-init ────────────────────────────────────────────────
  function boot() {
    document.querySelectorAll('[data-pricing-categoria]').forEach(function (el) {
      render(el, el.getAttribute('data-pricing-categoria'));
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.IBISNE_PRICING_TABLE = { render: render };
})();

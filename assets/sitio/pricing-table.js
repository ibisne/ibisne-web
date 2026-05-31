/* ===================================================================
   assets/sitio/pricing-table.js · v13.1
   ===================================================================
   Render del componente Pricing Table desde IBISNE_PRECIOS_V12.
   Auto-inicializa cualquier <div data-pricing-categoria="webs">.

   v13.1 (feedback Eduardo):
   - Power-ups son GLOBALES: barra de chips al lado del toggle de pago
     (ya no 4 toggles por card · eso alargaba las cards). Aplican a TODOS
     los planes. Al activar un chip se rellena en negro ("brutal") y todos
     los precios suben en vivo.
   - Tabla comparativa detrás de botón "Comparar todos los planes" ·
     specs técnicas · cerrada por default.
   - Cero verde · negro/blanco/azul. Precio = base × (1+Σpowerups) ×
     (exhibición ? 0.75 : 1).
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

  // Precio efectivo · powerups GLOBALES (mismos para todos los planes)
  function planPrice(plan, exhibicion, activeGlobal, powerupsDef) {
    var mult = 1;
    activeGlobal.forEach(function (pid) {
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

    // Estado · powerups GLOBALES (un solo Set para todos los planes)
    var state = { exhibicion: false, powerups: new Set() };

    var html = '';

    // ── CONTROLES: toggle de pago + powerups (banda compartida) ──
    html += '<div class="pt-controls">';

    // Segmented control de pago (no switch · pestaña tipo Shopify)
    html += '  <div class="pt-seg" role="tablist" aria-label="Forma de pago">';
    html += '    <button class="pt-seg-opt is-on" data-pay="mes" type="button" role="tab" aria-selected="true">Pago mes a mes</button>';
    html += '    <button class="pt-seg-opt" data-pay="exhibicion" type="button" role="tab" aria-selected="false">' +
            (DATA.exhibicion ? DATA.exhibicion.label : 'Pago en exhibición') +
            ' <span class="pt-seg-badge">' + (DATA.exhibicion ? DATA.exhibicion.badge : 'Ahorra 25%') + '</span></button>';
    html += '  </div>';

    // Powerups como chips (banda compartida · aplican a todos los planes)
    if (powerupsDef.length) {
      html += '  <div class="pt-powerups">';
      html += '    <span class="pt-powerups-label">Powerups</span>';
      html += '    <div class="pt-powerups-chips">';
      powerupsDef.forEach(function (pu) {
        html += '<button class="pt-chip" data-powerup="' + pu.id + '" type="button" aria-pressed="false">' +
                '<span class="pt-chip-ic">' + icon(pu.icon) + '</span>' +
                '<span class="pt-chip-name">' + pu.label + '</span>' +
                '<span class="pt-chip-pct">+' + Math.round(pu.addPct * 100) + '%</span>' +
                '</button>';
      });
      html += '    </div>';
      html += '  </div>';
    }
    html += '</div>';

    // ── Grid de cards (sin powerups dentro · más cortas) ──────────
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
      html += '  <a class="btn ' + (plan.recomendado ? 'btn-blue' : 'btn-dark') + '" data-cta href="#">' + (plan.cta || 'Empezar') + '</a>';
      html += '</div>';

      // Features (las de la card)
      html += '<div class="pricing-card-features">';
      (plan.features || []).forEach(function (f) {
        html += '<div class="pricing-card-feature"><span class="pricing-card-feature-check">' + icon('check') + '</span><span>' + f + '</span></div>';
      });
      html += '</div>';

      html += '</article>';
    });
    html += '</div>';

    // ── Tabla comparativa · detrás de botón "Comparar todos los planes" ──
    if (cat.featureRows && cat.featureRows.length) {
      html += '<div class="pt-compare">';
      html += '  <button class="pt-compare-toggle" type="button" aria-expanded="false">';
      html += '    <span>Comparar todos los planes</span><span class="pt-chevron">' + icon('chevron') + '</span>';
      html += '  </button>';
      html += '  <div class="pt-compare-table-wrap"><div class="pt-compare-table-inner">';
      html += '    <table class="cmp"><thead><tr><th class="cmp-feat">Característica</th>';
      cat.planes.forEach(function (p) {
        html += '<th class="' + (p.recomendado ? 'is-featured' : '') + '">' + p.label + '</th>';
      });
      html += '</tr></thead><tbody>';
      cat.featureRows.forEach(function (row) {
        html += '<tr><th class="cmp-feat">' + row.label + '</th>';
        cat.planes.forEach(function (p) {
          var val = row.values[p.id];
          var cell = val === '✓'
            ? '<span class="cmp-yes">' + icon('check') + '</span>'
            : (val === '—' ? '<span class="cmp-no">—</span>' : val);
          html += '<td class="' + (p.recomendado ? 'is-featured' : '') + '">' + (cell || '<span class="cmp-no">—</span>') + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '  </div></div>';
      html += '</div>';
    }

    container.innerHTML = html;

    // ── Recalcular precios ─────────────────────────────────────
    function recalc(animate) {
      cat.planes.forEach(function (plan) {
        var card = container.querySelector('.pricing-card[data-plan="' + plan.id + '"]');
        if (!card) return;
        var amountEl = card.querySelector('[data-amount]');
        var prev = parseFloat((amountEl.textContent || '0').replace(/[^0-9.]/g, '')) || plan.base;
        var next = planPrice(plan, state.exhibicion, state.powerups, powerupsDef);
        if (animate) animateNumber(amountEl, prev, next);
        else amountEl.textContent = fmt(next);

        var cta = card.querySelector('[data-cta]');
        if (cta) {
          var puNames = [];
          state.powerups.forEach(function (pid) {
            var pu = powerupsDef.find(function (p) { return p.id === pid; });
            if (pu) puNames.push(pu.label);
          });
          var msg = 'Hola, me interesa el plan ' + plan.label + ' (' + cat.label + ').\n' +
            'Precio: ' + fmt(next) + ' MXN ' + (state.exhibicion ? '(pago en exhibición -25%)' : '(pago mes a mes)') + '.\n' +
            (puNames.length ? 'Powerups: ' + puNames.join(', ') + '.\n' : '') +
            '¿Cómo procedemos?';
          cta.href = 'https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(msg);
          cta.target = '_blank'; cta.rel = 'noopener';
        }
      });
    }

    // ── Segmented control de pago ──────────────────────────────
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

    // ── Powerups globales (chips) ──────────────────────────────
    container.querySelectorAll('.pt-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var pid = chip.getAttribute('data-powerup');
        var on = !chip.classList.contains('is-on');
        chip.classList.toggle('is-on', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) state.powerups.add(pid); else state.powerups.delete(pid);
        recalc(true);
      });
    });

    // ── Botón "Comparar todos los planes" ──────────────────────
    var cmp = container.querySelector('.pt-compare');
    var cmpToggle = container.querySelector('.pt-compare-toggle');
    if (cmp && cmpToggle) {
      cmpToggle.addEventListener('click', function () {
        var open = cmp.classList.toggle('is-open');
        cmpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    recalc(false);
  }

  function boot() {
    document.querySelectorAll('[data-pricing-categoria]').forEach(function (el) {
      render(el, el.getAttribute('data-pricing-categoria'));
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.IBISNE_PRICING_TABLE = { render: render };
})();

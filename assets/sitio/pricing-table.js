/* ===================================================================
   assets/sitio/pricing-table.js · v14.0 · SPA multi-categoría
   ===================================================================
   Render del Pricing Table de la landing SPA desde IBISNE_PRECIOS_V13.
   Auto-inicializa cualquier `<div data-pricing-spa="categoria-inicial">`.

   v14.0 (pivot SPA · Eduardo):
   - Multi-categoría con TOGGLE de tabs arriba (7 categorías).
   - Renderiza UN bloque dinámico según categoría activa: cards de planes
     (2/3/4 según categoría) + segmented mes/exhibición + master powerups
     todo-o-nada + tabla comparativa (si la categoría la trae).
   - State: { categoria, exhibicion, powerupsOn }. Cambiar de categoría
     conserva los toggles de pago + powerups.
   - Mensaje WhatsApp incluye nombre del plan + categoría + powerups.
   - El switch entre categorías re-renderiza solo el panel interno,
     mantiene los tabs (no flicker visual).
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

    var state = {
      categoria: (initialCategoria && DATA.categorias[initialCategoria]) ? initialCategoria : 'webs',
      exhibicion: false,
      powerupsOn: false,
    };

    // ── HTML del shell (tabs + panel · el panel se re-renderiza) ──
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
                '<span class="pt-cat-tab-label">' + c.label + '</span>' +
                '</button>';
      });
      html += '</div>';

      // Cabecera dinámica de la categoría (title + tagline)
      html += '<div class="pt-cat-head" data-cat-head></div>';

      // Controles globales (segmented pago + master powerups)
      html += '<div class="pt-controls">';
      html += '  <div class="pt-seg" role="tablist" aria-label="Forma de pago">';
      html += '    <button class="pt-seg-opt is-on" data-pay="mes" type="button" role="tab" aria-selected="true">Pago mes a mes</button>';
      html += '    <button class="pt-seg-opt" data-pay="exhibicion" type="button" role="tab" aria-selected="false">' +
              exhLabel + ' <span class="pt-seg-badge">' + exhBadge + '</span></button>';
      html += '  </div>';

      if (powerupsDef.length) {
        html += '  <div class="pt-powerups" data-powerups-block>';
        html += '    <button class="pt-powerups-master-toggle" type="button" aria-pressed="false" data-powerups-toggle>';
        html += '      <span class="pt-pm-switch" aria-hidden="true"><span class="pt-pm-knob"></span></span>';
        html += '      <span class="pt-pm-copy">';
        html += '        <span class="pt-pm-title">Activar Powerups</span>';
        html += '        <span class="pt-pm-sub">5 superpoderes para tu desarrollo · todo o nada</span>';
        html += '      </span>';
        html += '      <span class="pt-pm-pct">+' + powerupsTotalPctLabel + '%</span>';
        html += '    </button>';
        html += '    <div class="pt-powerups-pills" aria-label="Powerups incluidos">';
        powerupsDef.forEach(function (pu) {
          html += '<span class="pt-pill" data-pill="' + pu.id + '">' +
                  '<span class="pt-pill-ic">' + icon(pu.icon) + '</span>' +
                  '<span class="pt-pill-name">' + pu.label + '</span>' +
                  '<span class="pt-pill-pct">+' + Math.round(pu.addPct * 100) + '%</span>' +
                  '</span>';
        });
        html += '    </div>';
        html += '  </div>';
      }
      html += '</div>';

      // Panel dinámico (cards de la categoría)
      html += '<div class="pt-panel" data-cat-panel></div>';

      return html;
    }

    // ── HTML del PANEL (cards + tabla comparativa) por categoría ──
    function htmlPanel(catId) {
      var cat = DATA.categorias[catId];
      if (!cat) return '<p class="t-muted">Categoría no encontrada.</p>';

      var html = '';
      var planCount = cat.planes.length;

      // Grid de cards
      html += '<div class="pricing-grid" data-plans="' + planCount + '">';
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

        html += '<div class="pricing-card-features">';
        (plan.features || []).forEach(function (f) {
          html += '<div class="pricing-card-feature"><span class="pricing-card-feature-check">' + icon('check') + '</span><span>' + f + '</span></div>';
        });
        html += '</div>';

        html += '</article>';
      });
      html += '</div>';

      // Tabla comparativa (si la categoría la trae)
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

      return html;
    }

    // ── HTML del HEAD (title + tagline) ──
    function htmlHead(catId) {
      var cat = DATA.categorias[catId];
      if (!cat) return '';
      var title = cat.title || ('Planes de ' + cat.label);
      var tagline = cat.tagline || cat.sub || '';
      return '<h3 class="pt-cat-title">' + title + '</h3>' +
             (tagline ? '<p class="pt-cat-tagline">' + tagline + '</p>' : '');
    }

    // ── Recalcular precios visibles en el panel actual ──
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

        var cta = card.querySelector('[data-cta]');
        if (cta) {
          var msg = 'Hola, me interesa el plan ' + plan.label + ' (' + cat.label + ').\n' +
            'Precio: ' + fmt(next) + ' MXN ' +
            (state.exhibicion ? '(pago en exhibición -' + discountPctLabel + '%)' : '(pago mes a mes · 12 cuotas)') + '.\n' +
            (state.powerupsOn ? 'Con los 5 Powerups activados (+' + powerupsTotalPctLabel + '%).\n' : '') +
            '¿Cómo procedemos?';
          cta.href = 'https://wa.me/' + HUNTER_WA + '?text=' + encodeURIComponent(msg);
          cta.target = '_blank'; cta.rel = 'noopener';
        }
      });
    }

    // ── Cambiar de categoría (re-renderiza panel + head, mantiene state) ──
    function switchCategoria(newCatId) {
      if (!DATA.categorias[newCatId] || newCatId === state.categoria) return;
      state.categoria = newCatId;
      // Actualizar tabs visualmente
      container.querySelectorAll('.pt-cat-tab').forEach(function (t) {
        var on = t.getAttribute('data-cat') === newCatId;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      // Re-renderizar head + panel
      var headEl = container.querySelector('[data-cat-head]');
      var panelEl = container.querySelector('[data-cat-panel]');
      if (headEl) headEl.innerHTML = htmlHead(newCatId);
      if (panelEl) panelEl.innerHTML = htmlPanel(newCatId);
      bindPanel();
      recalc(false);
    }

    // ── Binds que viven en el panel (cambian al re-renderizar) ──
    function bindPanel() {
      // Botón "Comparar todos los planes"
      var cmp = container.querySelector('.pt-compare');
      var cmpToggle = container.querySelector('.pt-compare-toggle');
      if (cmp && cmpToggle) {
        cmpToggle.addEventListener('click', function () {
          var open = cmp.classList.toggle('is-open');
          cmpToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
    }

    // ── Binds globales (viven en el shell, no se re-renderizan) ──
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
      var puBlock  = container.querySelector('[data-powerups-block]');
      if (puToggle) {
        puToggle.addEventListener('click', function () {
          state.powerupsOn = !state.powerupsOn;
          puToggle.classList.toggle('is-on', state.powerupsOn);
          puToggle.setAttribute('aria-pressed', state.powerupsOn ? 'true' : 'false');
          if (puBlock) puBlock.classList.toggle('is-on', state.powerupsOn);
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

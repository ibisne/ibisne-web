/* ===================================================================
   assets/sitio/quiz-guiado.js · v17.0 · Cotizador guiado 1-viewport
   ===================================================================
   Reemplaza el cotizador adaptativo v9 (ui.js 2003L + pricing-v9.js).
   Layout: sidebar izq (7 categorías) + main der (header + toggles + planes).

   Estado:
     { categoria, powerupsOn, mantenimiento: 'sin'|'basico'|'premium' }

   Flujo:
     1. Click categoría → cambia panel (mantiene toggles)
     2. Toggle Powerups → multiplica precio plan ×4
     3. Toggle Mantenimiento → suma precio mensual recurrente
     4. Click "Elegir plan" → navega a /checkout.html con URL params

   Reusa: data/precios-v13.js (21 planes en 7 categorías)
   =================================================================== */
(function () {
  'use strict';

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

  function planPrice(plan, powerupsOn, totalPct) {
    var mult = 1 + (powerupsOn ? (totalPct || 0) : 0);
    return plan.base * mult;
  }

  function mantPrice(mantId, mantList) {
    if (!mantId || mantId === 'sin') return 0;
    var m = mantList.find(function (x) { return x.id === mantId; });
    return m ? m.precio : 0;
  }

  function init(container) {
    var DATA = window.IBISNE_PRECIOS_V13;
    if (!DATA || !DATA.categorias) {
      container.innerHTML = '<p style="padding:32px;color:#666">Sin datos. Verifica precios-v13.js</p>';
      return;
    }

    var powerupsDef = DATA.powerups || [];
    var powerupsTotalPct = DATA.powerupsTotalPct || 0;
    var powerupsTotalPctLabel = Math.round(powerupsTotalPct * 100);
    var mantList = DATA.mantenimiento || [];

    // Lectura inicial de URL params (deep-link desde landing)
    var params = new URLSearchParams(window.location.search);
    var initialCat = params.get('cat');
    var validCat = initialCat && DATA.categorias[initialCat] ? initialCat : 'webs';

    var state = {
      categoria: validCat,
      powerupsOn: false,
      mantenimiento: 'basico',  // v19.7 · 'basico' (default · incluido) | 'premium' (+$5k/mes)
    };

    function htmlShell() {
      var html = '';
      // SIDEBAR · 7 categorías · v19.0 cards verticales grandes + iconos grandes
      html += '<aside class="qg-sidebar" aria-label="Categorías">';
      html += '  <span class="qg-sidebar-title">Cotiza tu proyecto</span>';
      html += '  <nav class="qg-cat-list" role="tablist">';
      Object.keys(DATA.categorias).forEach(function (catId) {
        var c = DATA.categorias[catId];
        var on = catId === state.categoria;
        html += '<button class="qg-cat-item' + (on ? ' is-on' : '') + '" type="button" role="tab"' +
                ' aria-selected="' + (on ? 'true' : 'false') + '" data-cat="' + catId + '">' +
                '<span class="qg-cat-row-top">' +
                '  <span class="qg-cat-ic">' + icon(c.icon) + '</span>' +
                '  <span class="qg-cat-arrow" aria-hidden="true">→</span>' +
                '</span>' +
                '<span class="qg-cat-label">' + escHtml(c.label) + '</span>' +
                '</button>';
      });
      html += '  </nav>';
      html += '  <div class="qg-sidebar-foot">';
      html += '    <a href="https://wa.me/523329575274?text=Hola%2C%20necesito%20asesor%C3%ADa" target="_blank" rel="noopener" class="qg-sidebar-asesor">';
      html += '      <span data-icon="whatsapp"></span><span>¿Dudas? Habla con un asesor</span>';
      html += '    </a>';
      html += '  </div>';
      html += '</aside>';

      // MAIN
      html += '<section class="qg-content">';
      // v19.6.1 · Stepper removido (pasos NO lineales · ocupaba espacio sin valor)
      // v19.5.3 · Top row: header de categoría + Modo Pro + Mantenimiento EN LA MISMA FILA
      html += '  <div class="qg-toprow">';
      html += '    <header class="qg-content-head" data-content-head></header>';
      // Modo Pro card (cyberpunk púrpura/azul + rayo)
      html += '    <button class="qg-pro-card" type="button" data-toggle="powerups" aria-pressed="false">';
      html += '      <span class="qg-pro-icon" aria-hidden="true">';
      html += '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L4 14 h7 L11 22 L20 10 h-7 z"/></svg>';
      html += '      </span>';
      html += '      <span class="qg-pro-text">';
      html += '        <span class="qg-pro-title">Modo Pro</span>';
      html += '        <span class="qg-pro-sub">Destaca de tu competencia</span>';
      html += '      </span>';
      html += '      <span class="qg-pro-switch" aria-hidden="true"><span class="qg-pro-knob"></span></span>';
      html += '    </button>';
      // v19.7 · Mantenimiento card · Básico INCLUIDO + toggle Premium ($5k/mes)
      html += '    <div class="qg-mant-card" role="group" aria-label="Mantenimiento">';
      html += '      <div class="qg-mant-head">';
      html += '        <span class="qg-mant-icon" aria-hidden="true">';
      html += '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3 a4 4 0 0 0 5 5 L17 14 L10 7 z"/><path d="M10 7 L3 14 l4 4 7-7"/></svg>';
      html += '        </span>';
      html += '        <span class="qg-mant-text">';
      html += '          <span class="qg-mant-title">Mantenimiento incluido</span>';
      html += '          <span class="qg-mant-sub">Upgrade a Premium +$5k/mes</span>';
      html += '        </span>';
      html += '      </div>';
      html += '      <button class="qg-mant-toggle" type="button" data-mant-toggle aria-pressed="false">';
      html += '        <span class="qg-mant-toggle-label">Upgrade a Premium</span>';
      html += '        <span class="qg-mant-toggle-switch" aria-hidden="true"><span class="qg-mant-toggle-knob"></span></span>';
      html += '      </button>';
      html += '    </div>';
      html += '  </div>';
      html += '  <div class="qg-panel" data-panel></div>';
      html += '</section>';

      return html;
    }

    function htmlHead(catId) {
      var cat = DATA.categorias[catId];
      if (!cat) return '';
      return '<h1 class="qg-cat-title">' + escHtml(cat.title || ('Planes de ' + cat.label)) + '</h1>' +
             '<p class="qg-cat-tagline">' + escHtml(cat.tagline || cat.sub || '') + '</p>';
    }

    function htmlPanel(catId) {
      var cat = DATA.categorias[catId];
      if (!cat) return '<p class="qg-empty">Categoría no encontrada.</p>';
      var html = '';
      var planCount = cat.planes.length;
      html += '<div class="qg-plans" data-plans="' + planCount + '">';
      cat.planes.forEach(function (plan) {
        html += '<article class="qg-plan' + (plan.recomendado ? ' is-recomendado' : '') + '" data-plan="' + plan.id + '">';
        if (plan.recomendado) html += '<span class="qg-plan-banner">Más popular</span>';

        // HEAD: icon + name + sub
        html += '<div class="qg-plan-head">';
        html += '  <span class="qg-plan-ic">' + icon(plan.icon) + '</span>';
        html += '  <div class="qg-plan-headtxt"><div class="qg-plan-name">' + escHtml(plan.label) + '</div>';
        html += '  <div class="qg-plan-sub">' + escHtml(plan.sub) + '</div></div>';
        html += '</div>';

        // PRICE block: one-time + recurrente
        html += '<div class="qg-plan-price">';
        html += '  <span class="qg-plan-amount" data-amount>' + fmt(plan.base) + '</span>';
        html += '  <span class="qg-plan-amt-meta">MXN · one-time</span>';
        html += '</div>';
        html += '<div class="qg-plan-recur" data-recur hidden>';
        html += '  <span class="qg-plan-plus">+</span>';
        html += '  <span class="qg-plan-recur-amt" data-recur-amt>$0</span>';
        html += '  <span class="qg-plan-recur-meta">/ mes</span>';
        html += '</div>';
        html += '<div class="qg-plan-tiempo">Entrega ' + escHtml(plan.tiempo) + '</div>';

        // CTA
        html += '<div class="qg-plan-cta">';
        html += '  <button class="qg-plan-btn' + (plan.recomendado ? ' is-primary' : '') + '" type="button" data-elegir="' + plan.id + '">';
        html += '    Elegir plan <span aria-hidden="true">→</span>';
        html += '  </button>';
        html += '</div>';

        // Features list · v19.4 expandida: base + Modo Pro + Mantenimiento (estados disabled/active vía clase en .qg-plan)
        html += '<div class="qg-plan-features">';
        // 1. Features BASE (siempre activas · todas las del plan, sin slice)
        (plan.features || []).forEach(function (f) {
          html += '<div class="qg-plan-feat"><span class="qg-plan-feat-check">' + icon('check') + '</span><span>' + escHtml(f) + '</span></div>';
        });

        // 2. Divider Modo Pro
        html += '<div class="qg-plan-feat-divider"><span>Con Modo Pro</span></div>';
        // 5 features Modo Pro (siempre presentes en DOM · CSS controla estado disabled/active)
        var pwrFeats = [
          'Animaciones premium',
          'Modo claro y oscuro',
          'Varios idiomas',
          'Varias monedas',
          'App instalable desde el navegador',
        ];
        pwrFeats.forEach(function (f) {
          html += '<div class="qg-plan-feat qg-plan-feat-pwr"><span class="qg-plan-feat-check">' + icon('check') + '</span><span>' + escHtml(f) + '</span></div>';
        });

        // 3. Divider Mantenimiento
        html += '<div class="qg-plan-feat-divider"><span>Con Mantenimiento</span></div>';
        // 4 features mantenimiento (highlights · siempre presentes · CSS controla estado)
        var mantFeats = [
          'Modificaciones y cambios al desarrollo',
          'Piezas gráficas para tus redes',
          'Soporte WhatsApp + email',
          'Actualizaciones de seguridad',
        ];
        mantFeats.forEach(function (f) {
          html += '<div class="qg-plan-feat qg-plan-feat-mant"><span class="qg-plan-feat-check">' + icon('check') + '</span><span>' + escHtml(f) + '</span></div>';
        });
        // Hint condicional para Premium · solo visible cuando .is-mant-premium
        html += '<div class="qg-plan-feat-mant-extra">+ Soporte 24/7 y reportes mensuales en Premium</div>';
        html += '</div>';

        html += '</article>';
      });
      html += '</div>';
      return html;
    }

    function recalc(animate) {
      var cat = DATA.categorias[state.categoria];
      if (!cat) return;
      var mantP = mantPrice(state.mantenimiento, mantList);
      cat.planes.forEach(function (plan) {
        var card = container.querySelector('.qg-plan[data-plan="' + plan.id + '"]');
        if (!card) return;
        var amountEl = card.querySelector('[data-amount]');
        var prev = parseFloat((amountEl.textContent || '0').replace(/[^0-9.]/g, '')) || plan.base;
        var next = planPrice(plan, state.powerupsOn, powerupsTotalPct);
        if (animate) animateNumber(amountEl, prev, next);
        else amountEl.textContent = fmt(next);

        var recurEl = card.querySelector('[data-recur]');
        var recurAmtEl = card.querySelector('[data-recur-amt]');
        if (mantP > 0) {
          recurEl.hidden = false;
          recurAmtEl.textContent = fmt(mantP);
        } else {
          recurEl.hidden = true;
        }

        // v19.4 · toggle clases para activar/desactivar features Modo Pro y Mantenimiento visualmente
        // v19.7 · Básico siempre activo (incluido) · Premium opcional
        card.classList.toggle('is-powerups-on', state.powerupsOn);
        card.classList.add('is-mant-basico');  // siempre · básico incluido
        card.classList.toggle('is-mant-premium', state.mantenimiento === 'premium');
      });
    }

    function switchCategoria(newCatId) {
      if (!DATA.categorias[newCatId] || newCatId === state.categoria) return;
      state.categoria = newCatId;
      // v19.0 · arrow siempre en DOM · CSS controla visibilidad via .is-on
      container.querySelectorAll('.qg-cat-item').forEach(function (b) {
        var on = b.getAttribute('data-cat') === newCatId;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var headEl = container.querySelector('[data-content-head]');
      var panelEl = container.querySelector('[data-panel]');
      if (headEl) headEl.innerHTML = htmlHead(newCatId);
      if (panelEl) panelEl.innerHTML = htmlPanel(newCatId);
      bindPanel();
      recalc(false);
    }

    function elegirPlan(planId) {
      var cat = DATA.categorias[state.categoria];
      var plan = cat.planes.find(function (p) { return p.id === planId; });
      if (!plan) return;
      // Navegar a checkout con todos los params del paquete
      var params = new URLSearchParams({
        cat: state.categoria,
        plan: planId,
        pwr: state.powerupsOn ? '1' : '0',
        mant: state.mantenimiento,
      });
      window.location.href = '/checkout.html?' + params.toString();
    }

    function bindPanel() {
      container.querySelectorAll('[data-elegir]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          elegirPlan(btn.getAttribute('data-elegir'));
        });
      });
    }

    function bindShell() {
      // Categorías
      container.querySelectorAll('.qg-cat-item').forEach(function (b) {
        b.addEventListener('click', function () {
          switchCategoria(b.getAttribute('data-cat'));
        });
      });
      // Powerups toggle
      var puToggle = container.querySelector('[data-toggle="powerups"]');
      if (puToggle) {
        puToggle.addEventListener('click', function () {
          state.powerupsOn = !state.powerupsOn;
          puToggle.classList.toggle('is-on', state.powerupsOn);
          puToggle.setAttribute('aria-pressed', state.powerupsOn ? 'true' : 'false');
          recalc(true);
        });
      }
      // v19.7 · Mantenimiento toggle (Básico incluido · upgrade a Premium on/off)
      var mantToggle = container.querySelector('[data-mant-toggle]');
      if (mantToggle) {
        mantToggle.addEventListener('click', function () {
          state.mantenimiento = state.mantenimiento === 'premium' ? 'basico' : 'premium';
          mantToggle.classList.toggle('is-on', state.mantenimiento === 'premium');
          mantToggle.setAttribute('aria-pressed', state.mantenimiento === 'premium' ? 'true' : 'false');
          recalc(true);
        });
      }
    }

    // Mount
    container.innerHTML = htmlShell();
    var headEl = container.querySelector('[data-content-head]');
    var panelEl = container.querySelector('[data-panel]');
    if (headEl) headEl.innerHTML = htmlHead(state.categoria);
    if (panelEl) panelEl.innerHTML = htmlPanel(state.categoria);

    // Hidratar iconos del DS dentro del cotizador
    container.querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.querySelector('svg')) return;
      el.innerHTML = window.IBISNE_ICONS ? window.IBISNE_ICONS.get(el.getAttribute('data-icon'), 'line') || '' : '';
    });

    bindShell();
    bindPanel();
    recalc(false);
  }

  function boot() {
    var container = document.querySelector('[data-cotizador]');
    if (!container) return;
    init(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.IBISNE_QUIZ_GUIADO = { init: init };
})();

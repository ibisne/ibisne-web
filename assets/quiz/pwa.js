/* § 00.PWA — iBisne
 * Registro de SW + detección de plataforma + API global de instalación.
 * window.IBISNE_PWA.canInstall() / promptInstall() / showModal() / isInstalled()
 */
(function () {
  'use strict';

  var state = {
    deferredPrompt: null,    // beforeinstallprompt (Android/Chrome/Edge)
    platform: 'desktop',     // 'ios' | 'android' | 'desktop'
    installed: false,
    swRegistered: false
  };

  // ── plataforma ───────────────────────────────────────────────
  var ua = (navigator.userAgent || '').toLowerCase();
  var isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /android/.test(ua);
  // macOS desktop (no iPad disfrazado) · útil para mostrar icono Apple en lugar de plus
  var isMacOS = !isIOS && (navigator.platform === 'MacIntel' || /mac os x|macintosh/.test(ua));
  var isWindows = /windows nt|win64|win32/.test(ua);
  if (isIOS) state.platform = 'ios';
  else if (isAndroid) state.platform = 'android';
  else if (isMacOS) state.platform = 'macos';
  else if (isWindows) state.platform = 'windows';
  else state.platform = 'desktop';

  // ── instalada? ───────────────────────────────────────────────
  function checkInstalled() {
    var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var iosStandalone = window.navigator.standalone === true;
    state.installed = !!(standalone || iosStandalone);
    return state.installed;
  }
  checkInstalled();

  window.addEventListener('appinstalled', function () {
    state.installed = true;
    state.deferredPrompt = null;
    hideModal();
  });

  // ── beforeinstallprompt (Android/Chrome) ─────────────────────
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    state.deferredPrompt = e;
  });

  // ── SW registration ──────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function () {
        state.swRegistered = true;
      }).catch(function () { /* noop */ });
    });
  }

  // ── modal: inject CSS + DOM ──────────────────────────────────
  function ensureStylesheet() {
    if (document.querySelector('link[data-pwa-modal]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/quiz/pwa-modal.css';
    link.setAttribute('data-pwa-modal', '');
    document.head.appendChild(link);
  }

  function buildModal() {
    if (document.getElementById('pwa-modal')) return document.getElementById('pwa-modal');
    var wrap = document.createElement('div');
    wrap.id = 'pwa-modal';
    wrap.className = 'pwa-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'pwa-modal-title');
    wrap.innerHTML = [
      '<div class="pwa-modal__sheet">',
      '  <button class="pwa-modal__close" type="button" aria-label="Cerrar" data-pwa-close>×</button>',
      '  <span class="pwa-modal__eyebrow">§ INSTALAR — iBisne</span>',
      '  <h2 class="pwa-modal__title" id="pwa-modal-title">Instalar iBisne</h2>',
      '  <ul class="pwa-modal__benefits" data-pwa-benefits>',
      '    <li><span class="b-icon" data-icon="bolt"></span><div><strong>Acceso 1-tap</strong> · ícono en tu home screen, sin abrir navegador</div></li>',
      '    <li><span class="b-icon" data-icon="check"></span><div><strong>Funciona offline</strong> · tu cotización persiste sin internet</div></li>',
      '    <li><span class="b-icon" data-icon="arrow-up-right"></span><div><strong>Más rápido</strong> · arranca instantáneo · sin barras del browser</div></li>',
      '  </ul>',
      '  <p class="pwa-modal__body" data-pwa-body></p>',
      '  <ol class="pwa-modal__steps" data-pwa-steps hidden></ol>',
      '  <div class="pwa-modal__actions" data-pwa-actions></div>',
      '</div>'
    ].join('');
    document.body.appendChild(wrap);

    // Hidratar iconos del set propio (bolt / check / arrow-up-right)
    if (window.IBISNE_ICONS) {
      var iconNodes = wrap.querySelectorAll('[data-icon]');
      for (var i = 0; i < iconNodes.length; i++) {
        var el = iconNodes[i];
        var id = el.getAttribute('data-icon');
        el.innerHTML = window.IBISNE_ICONS.get(id, 'line');
      }
    }

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) hideModal();
    });
    wrap.querySelector('[data-pwa-close]').addEventListener('click', hideModal);

    // A11y: cerrar con ESC + focus trap básico
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hideModal(); return; }
      if (e.key === 'Tab') {
        var focusable = wrap.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    return wrap;
  }

  function renderModalContent() {
    var modal = buildModal();
    var body = modal.querySelector('[data-pwa-body]');
    var steps = modal.querySelector('[data-pwa-steps]');
    var actions = modal.querySelector('[data-pwa-actions]');
    steps.innerHTML = '';
    actions.innerHTML = '';
    steps.hidden = true;

    if (state.platform === 'ios') {
      body.textContent = 'iOS Safari no soporta instalación con un toque. Agrégala manualmente:';
      steps.hidden = false;
      [
        'Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.',
        'Desplázate y selecciona <strong>Agregar a inicio</strong>.',
        'Confirma con <strong>Agregar</strong>. La app aparece en tu home screen.'
      ].forEach(function (txt, i) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="pwa-modal__step-num">' + String(i + 1).padStart(2, '0') + '</span><span>' + txt + '</span>';
        steps.appendChild(li);
      });

      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'pwa-modal__btn pwa-modal__btn--ghost';
      close.textContent = 'Entendido';
      close.addEventListener('click', hideModal);
      actions.appendChild(close);
      return;
    }

    if (state.platform === 'android' && state.deferredPrompt) {
      body.textContent = 'Instala iBisne en tu pantalla de inicio. Funciona offline, abre como app.';
      var install = document.createElement('button');
      install.type = 'button';
      install.className = 'pwa-modal__btn';
      install.textContent = 'Instalar ahora';
      install.addEventListener('click', function () {
        promptInstall().finally(hideModal);
      });
      actions.appendChild(install);

      var cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'pwa-modal__btn pwa-modal__btn--ghost';
      cancel.textContent = 'Más tarde';
      cancel.addEventListener('click', hideModal);
      actions.appendChild(cancel);
      return;
    }

    // Desktop o Android sin prompt aún
    body.textContent = 'Instala iBisne desde el menú del navegador (Instalar app / Agregar a la pantalla de inicio).';
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'pwa-modal__btn pwa-modal__btn--ghost';
    ok.textContent = 'Entendido';
    ok.addEventListener('click', hideModal);
    actions.appendChild(ok);
  }

  function showModal() {
    if (state.installed) return false;
    ensureStylesheet();
    renderModalContent();
    var m = document.getElementById('pwa-modal');
    // Guardar trigger para retornar focus al cerrar
    state.lastFocus = document.activeElement;
    m.setAttribute('data-open', 'true');
    // Focus el primer botón accionable (Instalar ahora / Entendido) o close
    setTimeout(function () {
      var firstBtn = m.querySelector('.pwa-modal__actions button') || m.querySelector('[data-pwa-close]');
      if (firstBtn) firstBtn.focus();
    }, 50);
    return true;
  }

  function hideModal() {
    var m = document.getElementById('pwa-modal');
    if (m) m.setAttribute('data-open', 'false');
    // Retornar focus al trigger original
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
      state.lastFocus.focus();
      state.lastFocus = null;
    }
  }

  // ── API ──────────────────────────────────────────────────────
  function canInstall() {
    if (checkInstalled()) {
      return { canInstall: false, platform: state.platform, reason: 'installed' };
    }
    if (state.platform === 'ios') {
      return { canInstall: true, platform: 'ios', instructions: 'ios' };
    }
    if (state.platform === 'android') {
      return { canInstall: !!state.deferredPrompt, platform: 'android', instructions: 'native' };
    }
    // macOS / Windows / desktop genérico · siempre mostrar como ofrecimiento;
    // si hay deferredPrompt usamos prompt nativo · si no, modal informativo
    return {
      canInstall: true,
      platform: state.platform,
      instructions: state.deferredPrompt ? 'native' : 'manual'
    };
  }

  function promptInstall() {
    if (!state.deferredPrompt) {
      // iOS o navegador que no expone API: abrimos modal informativo
      showModal();
      return Promise.resolve({ outcome: 'unsupported', platform: state.platform });
    }
    var p = state.deferredPrompt;
    state.deferredPrompt = null;
    p.prompt();
    return p.userChoice.then(function (choice) {
      if (choice && choice.outcome === 'accepted') state.installed = true;
      return choice;
    });
  }

  function isInstalled() { return checkInstalled(); }

  window.IBISNE_PWA = {
    canInstall: canInstall,
    promptInstall: promptInstall,
    showModal: showModal,
    hideModal: hideModal,
    isInstalled: isInstalled,
    platform: function () { return state.platform; }
  };
})();

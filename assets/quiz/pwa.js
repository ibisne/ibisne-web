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
  state.platform = isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop');

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
      '  <p class="pwa-modal__body" data-pwa-body></p>',
      '  <ol class="pwa-modal__steps" data-pwa-steps hidden></ol>',
      '  <div class="pwa-modal__actions" data-pwa-actions></div>',
      '</div>'
    ].join('');
    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) hideModal();
    });
    wrap.querySelector('[data-pwa-close]').addEventListener('click', hideModal);
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
    m.setAttribute('data-open', 'true');
    return true;
  }

  function hideModal() {
    var m = document.getElementById('pwa-modal');
    if (m) m.setAttribute('data-open', 'false');
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
    return { canInstall: !!state.deferredPrompt, platform: 'desktop', instructions: state.deferredPrompt ? 'native' : 'manual' };
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

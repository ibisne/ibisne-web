/* ===================================================================
   assets/quiz/hud.js — HUD interactivo: idioma, moneda, tema, música,
   hamburguesa, instalar PWA. Compartido entre index, no, quiz.
   Lee y escribe a window.IBISNE_PREFS (single source of truth).
   =================================================================== */

(function(){
  'use strict';

  function $(s, root){ return (root || document).querySelector(s); }
  function $$(s, root){ return Array.from((root || document).querySelectorAll(s)); }

  function injectIcons(){
    if (!window.IBISNE_ICONS) return;
    $$('[data-icon]').forEach(el => {
      const id = el.dataset.icon;
      const v  = el.dataset.iconVariant || 'line';
      el.innerHTML = window.IBISNE_ICONS.get(id, v);
    });
  }

  function bindMusic(){
    // Soporta tanto el del HUD desktop como el del menú mobile
    $$('#hud-music, #hud-music-m').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!window.IBISNE_AUDIO) return;
        const on = window.IBISNE_AUDIO.toggle();
        $$('#hud-music, #hud-music-m').forEach(b => {
          b.classList.toggle('is-active', on);
          b.dataset.icon = on ? 'pause' : 'play';
          b.innerHTML = window.IBISNE_ICONS.get(on ? 'pause' : 'play', 'line');
          b.setAttribute('aria-label', on ? 'Pausar música' : 'Reproducir música ambient');
        });
      });
    });
  }

  function bindThemeToggle(){
    const btn = $('#hud-theme');
    if (!btn || !window.IBISNE_PREFS) return;
    btn.addEventListener('click', () => {
      window.IBISNE_PREFS.toggleTheme();
    });
  }

  function bindLang(){
    const btn = $('#hud-lang');
    if (!btn || !window.IBISNE_PREFS) return;
    btn.addEventListener('click', () => {
      window.IBISNE_PREFS.toggleLang();
      // Si la página tiene render dinámico (quiz), pedirle que se re-renderee
      if (window.IBISNE_QUIZ && typeof window.IBISNE_QUIZ.rerender === 'function') {
        window.IBISNE_QUIZ.rerender();
      }
    });
  }

  function bindCurrency(){
    const btn = $('#hud-currency');
    if (!btn || !window.IBISNE_PREFS) return;
    btn.addEventListener('click', () => {
      window.IBISNE_PREFS.toggleCurrency();
      if (window.IBISNE_QUIZ && typeof window.IBISNE_QUIZ.rerender === 'function') {
        window.IBISNE_QUIZ.rerender();
      }
    });
  }

  function bindInstallPWA(){
    const btn = $('#hud-install');
    if (!btn || !window.IBISNE_PWA) return;

    function refreshVisibility(){
      const info = window.IBISNE_PWA.canInstall();
      if (info && info.canInstall) {
        btn.hidden = false;
        // Icono según plataforma: ios → apple, android → android, otro → plus
        const iconId = info.platform === 'ios' ? 'ios'
                     : info.platform === 'android' ? 'android'
                     : 'plus';
        btn.dataset.icon = iconId;
        btn.innerHTML = window.IBISNE_ICONS.get(iconId, 'line') || '+';
        btn.setAttribute('aria-label',
          info.platform === 'ios'    ? 'Instalar en iPhone' :
          info.platform === 'android'? 'Instalar en Android' :
                                       'Instalar app');
        btn.setAttribute('title', btn.getAttribute('aria-label'));
      } else {
        btn.hidden = true;
      }
    }
    refreshVisibility();
    // El SW + beforeinstallprompt llegan asincrónicamente — re-evaluar
    setTimeout(refreshVisibility, 600);
    setTimeout(refreshVisibility, 2000);

    btn.addEventListener('click', () => {
      window.IBISNE_PWA.promptInstall();
    });
  }

  function bindHamburger(){
    const btn = $('#hud-hamburger');
    const menu = $('#hud-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      btn.innerHTML = window.IBISNE_ICONS.get(open ? 'close' : 'grid', 'line');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  function init(){
    injectIcons();
    bindMusic();
    bindThemeToggle();
    bindLang();
    bindCurrency();
    bindInstallPWA();
    bindHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

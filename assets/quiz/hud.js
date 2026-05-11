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
    if (!window.IBISNE_PREFS) return;
    // Bindea desktop + mobile (ambos llaman al mismo toggle global)
    $$('#hud-theme, #hud-theme-m').forEach(btn => {
      btn.addEventListener('click', () => window.IBISNE_PREFS.toggleTheme());
    });
  }

  function bindLang(){
    if (!window.IBISNE_PREFS) return;
    $$('#hud-lang, #hud-lang-m').forEach(btn => {
      btn.addEventListener('click', () => {
        window.IBISNE_PREFS.toggleLang();
        if (window.IBISNE_QUIZ && typeof window.IBISNE_QUIZ.rerender === 'function') {
          window.IBISNE_QUIZ.rerender();
        }
      });
    });
  }

  function bindCurrency(){
    if (!window.IBISNE_PREFS) return;
    $$('#hud-currency, #hud-currency-m').forEach(btn => {
      btn.addEventListener('click', () => {
        window.IBISNE_PREFS.toggleCurrency();
        if (window.IBISNE_QUIZ && typeof window.IBISNE_QUIZ.rerender === 'function') {
          window.IBISNE_QUIZ.rerender();
        }
      });
    });
  }

  function bindInstallPWA(){
    // Retry hasta que IBISNE_PWA esté disponible (race condition con script defer)
    if (!window.IBISNE_PWA) {
      setTimeout(bindInstallPWA, 200);
      return;
    }
    const btns = $$('#hud-install, #hud-install-m');
    if (!btns.length) return;

    function refreshVisibility(){
      const info = window.IBISNE_PWA.canInstall();
      btns.forEach(btn => {
        if (info && info.canInstall) {
          btn.hidden = false;
          const iconId = info.platform === 'ios' ? 'ios'
                       : info.platform === 'android' ? 'android'
                       : 'plus';
          btn.dataset.icon = iconId;
          btn.innerHTML = window.IBISNE_ICONS.get(iconId, 'line') || '+';
          const label = info.platform === 'ios'    ? 'Instalar en iPhone' :
                        info.platform === 'android'? 'Instalar en Android' :
                                                     'Instalar app';
          btn.setAttribute('aria-label', label);
          btn.setAttribute('title', label);
        } else {
          btn.hidden = true;
        }
      });
    }

    // Evaluar inmediatamente · iOS muestra el botón desde el primer tick
    refreshVisibility();
    // Re-evaluar después del load completo (cuando el manifest puede haberse parseado)
    if (document.readyState === 'complete') {
      setTimeout(refreshVisibility, 100);
    } else {
      window.addEventListener('load', () => setTimeout(refreshVisibility, 100));
    }
    // Re-evaluar cuando Chrome decide que el sitio es installable mid-session
    window.addEventListener('beforeinstallprompt', refreshVisibility);
    // Re-evaluar cuando el usuario instala (oculta el botón)
    window.addEventListener('appinstalled', refreshVisibility);

    btns.forEach(btn => {
      btn.addEventListener('click', () => window.IBISNE_PWA.promptInstall());
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

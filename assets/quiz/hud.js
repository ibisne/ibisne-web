/* ===================================================================
   assets/quiz/hud.js — HUD interactivo: hamburguesa, audio, theme, idioma
   Compartido entre index, no, quiz
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
    const btn = $('#hud-music');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!window.IBISNE_AUDIO) return;
      const on = window.IBISNE_AUDIO.toggle();
      btn.classList.toggle('is-active', on);
      btn.dataset.icon = on ? 'pause' : 'play';
      btn.innerHTML = window.IBISNE_ICONS.get(on ? 'pause' : 'play', 'line');
      btn.setAttribute('aria-label', on ? 'Pausar música' : 'Reproducir música ambient');
    });
  }

  function bindThemeToggle(){
    const btn = $('#hud-theme');
    if (!btn) return;
    // Visualmente toggle, pero light no implementado todavía
    btn.addEventListener('click', () => {
      btn.classList.add('is-disabled');
      btn.setAttribute('title', 'Light mode próximamente · hoy solo dark');
      // Pequeño feedback visual
      btn.animate(
        [{ opacity: 0.4 }, { opacity: 1 }],
        { duration: 400, easing: 'ease-out' }
      );
    });
  }

  function bindLang(){
    const btn = $('#hud-lang');
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.setAttribute('title', 'EN coming soon · hoy solo ES');
      btn.animate(
        [{ opacity: 0.4 }, { opacity: 1 }],
        { duration: 400, easing: 'ease-out' }
      );
    });
  }

  function bindHamburger(){
    const btn = $('#hud-hamburger');
    const menu = $('#hud-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      btn.innerHTML = window.IBISNE_ICONS.get(open ? 'close' : 'menu', 'line');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  function init(){
    injectIcons();
    bindMusic();
    bindThemeToggle();
    bindLang();
    bindHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

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

    // Mapeo plataforma → ícono · label corto · label completo
    function platformMeta(p){
      if (p === 'ios')     return { icon: 'ios',     short: 'Apple',   full: 'Instalar en iPhone' };
      if (p === 'android') return { icon: 'android', short: 'Android', full: 'Instalar en Android' };
      if (p === 'macos')   return { icon: 'ios',     short: 'macOS',   full: 'Instalar en Mac' };
      if (p === 'windows') return { icon: 'plus',    short: 'Windows', full: 'Instalar en Windows' };
      return                     { icon: 'plus',    short: 'App',     full: 'Instalar app' };
    }

    function refreshVisibility(){
      const info = window.IBISNE_PWA.canInstall();
      btns.forEach(btn => {
        if (info && info.canInstall) {
          btn.hidden = false;
          const meta = platformMeta(info.platform);
          btn.dataset.icon = meta.icon;
          // El botón decide su contenido según data-style:
          //   "icon"  → solo ícono (HUD desktop compacto)
          //   "cta"   → icono + texto "Instalar app" (mobile menu CTA, desktop secondary)
          const style = btn.dataset.style || 'icon';
          const iconSvg = window.IBISNE_ICONS.get(meta.icon, 'line') || '+';
          if (style === 'cta') {
            btn.innerHTML = '<span class="install-icon">' + iconSvg + '</span><span class="install-label">' + meta.full + '</span>';
          } else {
            btn.innerHTML = iconSvg;
          }
          btn.setAttribute('aria-label', meta.full);
          btn.setAttribute('title', meta.full);
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

  // § WA — reescritura dinámica de los wa.me?text= según idioma activo
  // Recorre todos los <a href*="wa.me"> y reemplaza el text con la versión
  // traducida si lang === 'en'. Reentra al cambiar idioma.
  function rewriteWaLinks(){
    const isEN = window.IBISNE_PREFS && window.IBISNE_PREFS.lang && window.IBISNE_PREFS.lang() === 'en';
    if (!isEN) return; // En ES, los hrefs originales ya están en español
    // Map de patrones ES → key EN (busca el texto decoded en el href)
    const tEN = (window.IBISNE_I18N_EN && window.IBISNE_I18N_EN) || {};
    const dataEN = (window.IBISNE_I18N_DATA && window.IBISNE_I18N_DATA) || {};
    const patterns = [
      // [patrón ES decoded, traducción EN]
      ['quiero hablar con un hunter de iBisne', tEN['wa.msg.hunter'] || dataEN['wa.template.hunter'] || "Hi, I want to talk to an iBisne hunter."],
      ['vengo del quiz de iBisne', tEN['wa.msg.quiz'] || dataEN['wa.template.quiz'] || "Hi, I'm coming from the iBisne quiz."],
      ['quiero asesoría 1-a-1 de iBisne', "Hi, I'd like 1-on-1 advice from iBisne."],
      ['quiero discovery para un proyecto', "Hi, I want discovery for a"],
      ['soy inversionista interesado en iBisne', "Hi, I'm an investor interested in iBisne."],
      ['vengo de la consultoría', "Hi, I'm coming from the iBisne consulting"],
    ];
    $$('a[href*="wa.me"]').forEach(a => {
      const href = a.getAttribute('href');
      try {
        const u = new URL(href);
        const original = u.searchParams.get('text') || '';
        let translated = original;
        for (let i = 0; i < patterns.length; i++) {
          if (original.indexOf(patterns[i][0]) !== -1) {
            // Reemplaza la frase ES por la EN preservando el resto (folios, etc.)
            translated = original.replace(patterns[i][0], patterns[i][1]);
            // Adaptar prefijo "Hola, " → "Hi, "
            translated = translated.replace(/^Hola,?\s*/, '');
            if (!/^Hi[,!\s]/.test(translated)) translated = 'Hi, ' + translated;
            break;
          }
        }
        // Si arrancaba con "Hola, " y no encontró patrón, traducir al menos el saludo
        if (translated === original && /^Hola/i.test(original)) {
          translated = original.replace(/^Hola,?\s*/i, 'Hi, ');
        }
        if (translated !== original) {
          u.searchParams.set('text', translated);
          a.setAttribute('href', u.toString());
        }
      } catch (_) { /* href malformado, skip */ }
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
    // WhatsApp i18n: reescribe en init y en cada cambio de prefs
    rewriteWaLinks();
    window.addEventListener('ibisne:prefs', rewriteWaLinks);
    // Re-correr cuando el quiz re-renderiza el resultado (CTAs nuevos dinámicos)
    window.addEventListener('ibisne:rerender', rewriteWaLinks);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

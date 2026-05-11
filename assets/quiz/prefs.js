/* ===================================================================
   assets/quiz/prefs.js — Estado global de preferencias (single source).
   Idioma · Moneda · Tema. Persiste en localStorage. Emite evento global
   'ibisne:prefs' para que cualquier renderer se entere y re-render.
   =================================================================== */
(function(){
  'use strict';

  var STORAGE_KEY = 'ibisne.prefs';
  var DEFAULTS = { lang: 'es', currency: 'mxn', theme: 'dark' };

  function load(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var saved = raw ? JSON.parse(raw) : {};
      return Object.assign({}, DEFAULTS, saved);
    } catch(e){ return Object.assign({}, DEFAULTS); }
  }
  function save(prefs){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch(e){}
  }

  var state = load();

  // Aplica las preferencias al DOM (data-attrs en <html> + sincroniza toggles del HUD)
  function apply(){
    var root = document.documentElement;
    root.setAttribute('data-lang', state.lang);
    root.setAttribute('data-currency', state.currency);
    root.setAttribute('data-theme', state.theme);
    root.lang = state.lang === 'en' ? 'en' : 'es-MX';

    // Sincroniza visual de los toggles del HUD (todos los pages comparten misma estructura)
    syncToggle('#hud-lang', 'lang', state.lang);
    syncToggle('#hud-currency', 'currency', state.currency);
    syncTheme(state.theme);
    // Traducir todos los nodos marcados con data-i18n
    translateDom();
  }
  // Traducción de DOM: cualquier elemento con data-i18n="key.path" toma su
  // texto del diccionario IBISNE_I18N_EN si lang=en, o conserva su contenido original.
  // El texto en ES se cachea en data-i18n-es la primera vez.
  function translateDom(){
    var dict = (window.IBISNE_I18N_EN || {});
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      // Cachear el ES original al primer render
      if (!el.hasAttribute('data-i18n-es')) {
        el.setAttribute('data-i18n-es', el.textContent.trim());
      }
      var esText = el.getAttribute('data-i18n-es');
      el.textContent = (state.lang === 'en') ? (dict[key] || esText) : esText;
    });
    // También para atributos: data-i18n-attr="aria-label:hud.cta.hunter"
    document.querySelectorAll('[data-i18n-attr]').forEach(function(el){
      var spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(function(pair){
        var parts = pair.trim().split(':');
        var attr = parts[0]; var key = parts[1];
        if (!attr || !key) return;
        var cacheKey = 'data-i18n-' + attr + '-es';
        if (!el.hasAttribute(cacheKey)) el.setAttribute(cacheKey, el.getAttribute(attr) || '');
        var es = el.getAttribute(cacheKey);
        el.setAttribute(attr, (state.lang === 'en') ? (dict[key] || es) : es);
      });
    });
  }
  function syncToggle(selector, attr, value){
    document.querySelectorAll(selector + ' [data-' + attr + ']').forEach(function(span){
      span.classList.toggle('active', span.getAttribute('data-' + attr) === value);
    });
  }
  function syncTheme(theme){
    var btn = document.getElementById('hud-theme');
    if (!btn) return;
    btn.setAttribute('data-icon', theme === 'light' ? 'sun' : 'moon');
    btn.setAttribute('aria-label', theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
    // Si IBISNE_ICONS ya está cargado, re-inyectar icono
    if (window.IBISNE_ICONS && btn.firstChild) {
      btn.innerHTML = window.IBISNE_ICONS.get(theme === 'light' ? 'sun' : 'moon', 'line') || '';
    }
  }

  // Tipo de cambio fijo aproximado (puede actualizarse por API más adelante)
  var MXN_PER_USD = 17.0;

  // API pública
  window.IBISNE_PREFS = {
    get: function(){ return Object.assign({}, state); },
    lang:     function(){ return state.lang; },
    currency: function(){ return state.currency; },
    theme:    function(){ return state.theme; },

    setLang: function(v){
      if (v !== 'es' && v !== 'en') return;
      state.lang = v; save(state); apply(); emit();
    },
    setCurrency: function(v){
      if (v !== 'mxn' && v !== 'usd') return;
      state.currency = v; save(state); apply(); emit();
    },
    setTheme: function(v){
      if (v !== 'dark' && v !== 'light') return;
      state.theme = v; save(state); apply(); emit();
    },
    toggleLang:     function(){ this.setLang(state.lang === 'es' ? 'en' : 'es'); },
    toggleCurrency: function(){ this.setCurrency(state.currency === 'mxn' ? 'usd' : 'mxn'); },
    toggleTheme:    function(){ this.setTheme(state.theme === 'dark' ? 'light' : 'dark'); },

    // Conversión MXN ↔ USD (precios base se almacenan en MXN)
    convert: function(mxnAmount){
      if (state.currency === 'usd') return mxnAmount / MXN_PER_USD;
      return mxnAmount;
    },
    format: function(mxnAmount){
      var amount = this.convert(mxnAmount);
      if (state.currency === 'usd') {
        return '$ ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return '$ ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    currencyCode: function(){ return state.currency === 'usd' ? 'USD' : 'MXN'; },

    // Traducciones — diccionario plano por clave. Si no existe la key en EN,
    // cae al texto original (ES). Las claves siguen formato dot.notation.
    t: function(key, fallback){
      if (state.lang === 'es') return fallback || key;
      var dict = (window.IBISNE_I18N_EN || {});
      return dict[key] || fallback || key;
    },

    // Suscripción a cambios de prefs
    on: function(cb){
      window.addEventListener('ibisne:prefs', function(e){ cb(e.detail); });
    },
  };

  function emit(){
    window.dispatchEvent(new CustomEvent('ibisne:prefs', { detail: Object.assign({}, state) }));
  }

  // Aplica al cargar DOM (apply requiere body / html)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();

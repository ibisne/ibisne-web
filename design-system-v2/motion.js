/* ============================================================
   VAULT · motion.js
   Custom cursor (lerp · rAF), split-text reveals, scroll-stack
   sticky storytelling, marquee pause, faq, mega menu, nav mobile,
   horizontal verticales, bg fade, page-transitions SPA-lite,
   navbar scrolled state, grain shuffler.
   ============================================================ */

(function () {
  'use strict';

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* AbortControllers de listeners scope-bound (scroll-stack, horizontal).
     Se abortan antes de cada SPA replaceWith para evitar leak. */
  const spaControllers = [];
  function abortSpaControllers() {
    spaControllers.forEach((c) => { try { c.abort(); } catch (_) {} });
    spaControllers.length = 0;
  }

  /* ── 1. CUSTOM CURSOR ───────────────────────────────────── */
  function initReveals(scope) {
    if (reducedMotion) return;
    const root = scope || document;
    const els = root.querySelectorAll('[data-reveal]');
    els.forEach(splitText);

    const fadeEls = root.querySelectorAll('[data-fade]');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const stagger = parseInt(el.dataset.stagger || '25', 10);  // v13.2 atenuado 40→25
          const isChar = el.dataset.reveal === 'char';
          const items = el.querySelectorAll(isChar ? '.char' : '.word');
          items.forEach((item, i) => {
            item.style.transitionDelay = `${i * stagger}ms`;
          });
          el.classList.add('is-revealed');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    els.forEach((el) => io.observe(el));

    const ioFade = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          ioFade.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    fadeEls.forEach((el) => ioFade.observe(el));
  }

  /* ── 2.5 REVEAL STAGGER — cards en grid entran progresivas ─
     Hook: data-reveal-stagger="<ms>" en el contenedor (default 60ms).
     Cada hijo directo recibe transition-delay incremental. Trigger único
     vía IntersectionObserver con threshold 0.15. CSS (motion.css) controla
     el estado base / revelado y el guard de prefers-reduced-motion. */
  function initRevealStagger(scope) {
    if (reducedMotion) return;
    const root = scope || document;
    const grids = root.querySelectorAll('[data-reveal-stagger]');
    if (!grids.length) return;
    // Marca <html> para activar el opacity:0 inicial vía CSS (progressive
    // enhancement: sin esta clase las cards quedan visibles aunque JS falle).
    document.documentElement.setAttribute('data-stagger-ready', '');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const stagger = parseInt(el.dataset.revealStagger, 10) || 60;
        const children = el.children;
        for (let i = 0; i < children.length; i++) {
          children[i].style.transitionDelay = `${i * stagger}ms`;
        }
        el.classList.add('is-revealed');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    grids.forEach((g) => io.observe(g));
  }

  /* ── 3. SCROLL-STACK STORYTELLING ───────────────────────── */
  function initMarquee(scope) {
    const root = scope || document;
    const tracks = root.querySelectorAll('.marquee .marquee-track');
    tracks.forEach((track) => {
      if (track.dataset.duplicated === 'true') return;
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
      clone.dataset.duplicated = 'true';
      track.dataset.duplicated = 'true';
    });
  }

  /* ── 6. FAQ ACCORDION ───────────────────────────────────── */
  function initFAQ(scope) {
    const root = scope || document;
    const items = root.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger || trigger.dataset.bound === 'true') return;
      trigger.dataset.bound = 'true';
      trigger.addEventListener('click', () => {
        const expanded = item.getAttribute('aria-expanded') === 'true';
        item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  /* ── 7. NAVBAR scroll state ─────────────────────────────── */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    function update() {
      if (window.scrollY > 8) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── 8. PAGE TRANSITIONS — SPA-lite ─────────────────────── */
  function initPageTransitions() {
    if (reducedMotion) return;

    let overlay = document.querySelector('.page-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition';
      overlay.innerHTML = '<span class="pt-mark">cargando</span>';
      document.body.appendChild(overlay);
    }

    function isInternal(href) {
      if (!href) return false;
      if (href.startsWith('#')) return false;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      try {
        const url = new URL(href, window.location.href);
        return url.origin === window.location.origin;
      } catch { return false; }
    }

    async function navigate(href) {
      overlay.classList.remove('is-uncovering');
      overlay.classList.add('is-covering');
      const cover = new Promise((res) => setTimeout(res, 320));

      let html;
      try {
        const resp = await fetch(href, { credentials: 'same-origin' });
        html = await resp.text();
      } catch (e) {
        window.location.href = href;
        return;
      }

      await cover;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      const currentMain = document.querySelector('main');
      if (newMain && currentMain) {
        // Aborta listeners scope-bound del main anterior antes de reemplazar
        abortSpaControllers();
        currentMain.replaceWith(newMain);
        document.title = doc.title || document.title;
        window.history.pushState({}, '', href);
        window.scrollTo(0, 0);
        // Re-init de observers + reveals + scroll-stack en el nuevo main
        initReveals(newMain);
        initRevealStagger(newMain);
        initScrollStack(newMain);
        initHorizontal(newMain);
        initMarquee(newMain);
        initFAQ(newMain);
      } else {
        window.location.href = href;
        return;
      }

      requestAnimationFrame(() => {
        overlay.classList.remove('is-covering');
        overlay.classList.add('is-uncovering');
        setTimeout(() => overlay.classList.remove('is-uncovering'), 320);
      });
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = a.getAttribute('href');
      if (!isInternal(href)) return;
      e.preventDefault();
      navigate(href);
    });

    window.addEventListener('popstate', () => {
      window.location.reload();
    });
  }

  /* ── 9. HORIZONTAL VERTICALES — sticky + scroll lateral ─── */
  function initBgFade() {
    if (reducedMotion) return;
    const sections = document.querySelectorAll('.section[data-bg]');
    if (!sections.length) return;
    const map = { deep: 'var(--bg-deep)', paper: 'var(--bg-paper)', base: 'var(--bg)' };
    const io = new IntersectionObserver((entries) => {
      // El más cercano al centro del viewport gana
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const tone = visible[0].target.dataset.bg;
      const color = map[tone] || map.base;
      document.body.style.backgroundColor = color;
    }, { threshold: [0.2, 0.4, 0.6] });
    sections.forEach((s) => io.observe(s));
  }

  /* ── 12. MEGA MENU desktop ──────────────────────────────── */
  function closeAllMegas() {
    document.querySelectorAll('.nav-links li.has-mega[aria-expanded="true"]').forEach((li) => {
      li.setAttribute('aria-expanded', 'false');
      const trigger = li.querySelector('.nav-mega-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }
  function initMegaMenu(scope) {
    const root = scope || document;
    const items = root.querySelectorAll('.nav-links li.has-mega');
    items.forEach((item) => {
      const trigger = item.querySelector('.nav-mega-trigger');
      const panel = item.querySelector('.nav-mega');
      if (!trigger || !panel || trigger.dataset.bound === 'true') return;
      trigger.dataset.bound = 'true';
      let closeTimer;
      const open = () => {
        clearTimeout(closeTimer);
        item.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-expanded', 'true');
      };
      const close = () => {
        item.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-expanded', 'false');
      };
      const deferClose = () => { closeTimer = setTimeout(close, 120); };
      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', deferClose);
      panel.addEventListener('mouseenter', open);
      panel.addEventListener('mouseleave', deferClose);
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.getAttribute('aria-expanded') === 'true';
        isOpen ? close() : open();
      });
    });

    /* Document listeners — bind once, delegated. Antes se duplicaban por item-reinit. */
    if (initMegaMenu._docBound) return;
    initMegaMenu._docBound = true;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllMegas(); });
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-links li.has-mega[aria-expanded="true"]').forEach((li) => {
        if (!li.contains(e.target)) {
          li.setAttribute('aria-expanded', 'false');
          const trigger = li.querySelector('.nav-mega-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ── 13. NAV MOBILE — overlay toggle (hamburger ↔ ×) ───── */
  function initNavMobile() {
    const toggle = document.querySelector('.nav-toggle');
    const overlay = document.querySelector('.nav-overlay');
    if (!toggle || !overlay) return;

    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function getFocusables() {
      return Array.from(overlay.querySelectorAll(focusableSelector))
        .filter((el) => !el.hasAttribute('aria-disabled') || el.getAttribute('aria-disabled') === 'false');
    }
    function openMenu() {
      // Origen del clip-path circular: centro del botón ×
      const rect = toggle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      overlay.style.setProperty('--clip-x', x + 'px');
      overlay.style.setProperty('--clip-y', y + 'px');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      document.body.classList.add('menu-locked');
      const focusables = getFocusables();
      if (focusables.length) requestAnimationFrame(() => focusables[0].focus());
    }
    function closeMenu() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.classList.remove('menu-locked');
      requestAnimationFrame(() => toggle.focus());
    }
    function toggleMenu() {
      const isOpen = overlay.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    }

    toggle.addEventListener('click', toggleMenu);

    // Compatibilidad legacy: si existe un .menu-close interno, también cierra
    const legacyClose = overlay.querySelector('.menu-close');
    legacyClose && legacyClose.addEventListener('click', closeMenu);

    // cerrar al tap en cualquier <a> del overlay
    overlay.querySelectorAll('a[href]').forEach((a) => {
      a.addEventListener('click', () => setTimeout(closeMenu, 60));
    });
    // ESC cierra + Tab atrapado dentro del overlay
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {
        const focusables = getFocusables();
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // tap en backdrop (target === overlay) cierra
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMenu();
    });
  }

  /* ── MODAL DIALOG · v12 ────────────────────────────────────
   * Patrón: cualquier botón con data-modal-open="dialog-id" abre el
   * dialog `.modal-dialog#dialog-id`. Cierra con ESC, click backdrop,
   * o cualquier elemento con `.modal-dialog-close` o data-modal-close.
   * Focus trap mientras está abierto (reusa patrón nav-overlay).
   * Llamar a window.__VAULT__.openModal(id) para abrir programáticamente.
   * ──────────────────────────────────────────────────────── */
  function initModalDialogs() {
    let lastFocused = null;

    function openModal(id) {
      const dlg = document.getElementById(id);
      if (!dlg || !dlg.classList.contains('modal-dialog')) return;
      lastFocused = document.activeElement;
      dlg.classList.add('is-open');
      dlg.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // foco al primer focusable o al panel
      setTimeout(() => {
        const focusables = dlg.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (focusables[0] || dlg).focus();
      }, 40);
    }

    function closeModal(dlg) {
      if (!dlg) return;
      dlg.classList.remove('is-open');
      dlg.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
        lastFocused = null;
      }
    }

    // Triggers de apertura (delegated)
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-modal-open]');
      if (opener) {
        e.preventDefault();
        openModal(opener.getAttribute('data-modal-open'));
      }
      const closer = e.target.closest('[data-modal-close], .modal-dialog-close');
      if (closer) {
        const dlg = closer.closest('.modal-dialog');
        if (dlg) closeModal(dlg);
      }
    });

    // Click en backdrop cierra (target === el .modal-dialog mismo, no el panel)
    document.querySelectorAll('.modal-dialog').forEach(dlg => {
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg) closeModal(dlg);
      });
      // Focus trap + ESC
      dlg.addEventListener('keydown', (e) => {
        if (!dlg.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal(dlg);
          return;
        }
        if (e.key === 'Tab') {
          const focusables = dlg.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      });
    });

    // expose para llamadas programáticas
    window.__VAULT_MODAL__ = { open: openModal, close: closeModal };
  }

  /* ── TABS · v12 ────────────────────────────────────────────
   * Patrón: dentro de un .tabs, los .tab-trigger controlan sus
   * .tab-panel via aria-controls. Click en trigger swap is-active +
   * muestra panel correspondiente · oculta los otros.
   * ──────────────────────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabs => {
      const triggers = tabs.querySelectorAll('.tab-trigger');
      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const targetId = trigger.getAttribute('aria-controls');
          if (!targetId) return;
          // Deactivate all triggers + hide all panels
          triggers.forEach(t => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          tabs.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.remove('is-active');
            p.hidden = true;
          });
          // Activate this one
          trigger.classList.add('is-active');
          trigger.setAttribute('aria-selected', 'true');
          const panel = tabs.querySelector('#' + targetId);
          if (panel) {
            panel.classList.add('is-active');
            panel.hidden = false;
          }
        });
      });
    });
  }

  /* ── BOOT ───────────────────────────────────────────────────
     v13.2 · poda de "teatro": removidos initCursor, initGrain,
     initScrollStack, initHorizontal (~217 líneas). Solo quedan
     funciones que comunican estado/feedback/navegación. */
  function boot() {
    initReveals();
    initRevealStagger();
    initMarquee();
    initFAQ();
    initNavScroll();
    initMegaMenu();
    initNavMobile();
    initBgFade();
    initPageTransitions();
    initModalDialogs();    // v12
    initTabs();            // v12
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // expose para debugging
  window.__VAULT__ = { initReveals, initRevealStagger, initMarquee, initFAQ, initBgFade, initMegaMenu, initNavMobile, initPageTransitions, initModalDialogs, initTabs };
})();

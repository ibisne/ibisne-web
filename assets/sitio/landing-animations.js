/* ===================================================================
   assets/sitio/landing-animations.js · v18.0 · GSAP + ScrollTrigger
   ===================================================================
   Animaciones premium scroll-driven para la landing page.

   Requiere GSAP 3 + ScrollTrigger via CDN (jsdelivr).
   Defer · espera DOMContentLoaded · respeta prefers-reduced-motion.

   Cobertura:
   1. Hero entrance · timeline secuencial al cargar
   2. Section reveals · fade-up al entrar viewport
   3. Cards stagger · grid items entran progresivos
   4. Sticky CTA flotante · aparece tras scroll 100px + oculta cerca del footer
   5. Marquee parallax sutil
   6. Botón hover spring boost (auxiliar al CSS)
   =================================================================== */
(function () {
  'use strict';

  function init() {
    // Solo en index.html (landing) · evita ejecutar en quiz/checkout
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html' && !path.endsWith('/index.html')) {
      return;
    }

    // Guard: GSAP cargó?
    if (typeof window.gsap === 'undefined') {
      console.warn('[landing-animations] GSAP no cargó (CSP bloqueado o offline). Progressive enhancement: showAll.');
      document.documentElement.removeAttribute('data-gsap-ready');
      // El CSS guard hace que [data-anim] sean visibles sin GSAP
      return;
    }

    // Marca <html> con data-gsap-ready · activa el patrón "oculto por default" en CSS
    document.documentElement.setAttribute('data-gsap-ready', '');

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // matchMedia para reduced-motion
    var mm = gsap.matchMedia();

    mm.add({
      isMotion: '(prefers-reduced-motion: no-preference)',
      isReduced: '(prefers-reduced-motion: reduce)',
      isDesktop: '(min-width: 900px)',
    }, function (context) {
      var conditions = context.conditions;
      var isMotion = conditions.isMotion;
      var isDesktop = conditions.isDesktop;

      if (!isMotion) {
        // Reduced motion: solo restaurar visibilidad sin animar
        document.querySelectorAll('[data-anim], [data-anim-stagger] > *').forEach(function (el) {
          gsap.set(el, { opacity: 1, y: 0, clearProps: 'all' });
        });
        // Sticky CTA aparece directo sin animación
        setupStickyCTAStatic();
        return;
      }

      // ─────────────────────────────────────────────────────────
      // 1. HERO ENTRANCE · timeline al cargar
      // ─────────────────────────────────────────────────────────
      var heroEyebrow = document.querySelector('[data-anim="hero-eyebrow"]');
      var heroH1 = document.querySelector('[data-anim="hero-h1"]');
      var heroLead = document.querySelector('[data-anim="hero-lead"]');
      var heroActions = document.querySelector('[data-anim="hero-actions"]');

      // Split text del h1 por palabras · DOM-safe (iterando childNodes)
      // v18.0.1 hotfix: la versión anterior usaba regex sobre innerHTML que
      // matcheaba fragmentos de tags HTML (<span class="hl">) como palabras
      // y rompía el rendering. Ahora iteramos childNodes y respetamos elementos.
      var heroWords = [];
      if (heroH1) {
        heroWords = splitWordsDomSafe(heroH1);
        gsap.set(heroWords, { opacity: 0, y: 40, rotateX: -30 });
        gsap.set(heroH1, { opacity: 1 });  // unhide container · words son los que aparecen
      }

      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroEyebrow) {
        tl.fromTo(heroEyebrow,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.2);
      }

      if (heroWords.length) {
        tl.to(heroWords, {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
        }, '-=0.3');
      }

      if (heroLead) {
        tl.fromTo(heroLead,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4');
      }

      if (heroActions) {
        tl.fromTo(heroActions,
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
          '-=0.2');
      }

      // ─────────────────────────────────────────────────────────
      // 2. SECTION REVEALS al hacer scroll
      // ─────────────────────────────────────────────────────────
      if (ScrollTrigger) {
        // Elementos genéricos con [data-anim] (excepto hero · ya animados)
        document.querySelectorAll('[data-anim]').forEach(function (el) {
          if (el.closest('.hero-spa')) return; // skip hero (ya en timeline)
          gsap.fromTo(el,
            { opacity: 0, y: 32 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
                once: true,
              },
            });
        });

        // 3. CARDS STAGGER (grids con [data-anim-stagger])
        document.querySelectorAll('[data-anim-stagger]').forEach(function (container) {
          var children = container.children;
          if (!children.length) return;
          var staggerMs = parseInt(container.dataset.animStagger || container.dataset.revealStagger || '60', 10);
          gsap.fromTo(children,
            { opacity: 0, y: 32 },
            {
              opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
              stagger: staggerMs / 1000,
              scrollTrigger: {
                trigger: container,
                start: 'top 78%',
                toggleActions: 'play none none none',
                once: true,
              },
            });
        });

        // Compatibilidad con data-reveal-stagger antiguo (v15+)
        document.querySelectorAll('[data-reveal-stagger]:not([data-anim-stagger])').forEach(function (container) {
          var children = container.children;
          if (!children.length) return;
          var staggerMs = parseInt(container.dataset.revealStagger || '40', 10);
          gsap.fromTo(children,
            { opacity: 0, y: 32 },
            {
              opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
              stagger: staggerMs / 1000,
              scrollTrigger: {
                trigger: container,
                start: 'top 78%',
                toggleActions: 'play none none none',
                once: true,
              },
            });
        });

        // 4. MARQUEE PARALLAX sutil (social proof)
        var marquee = document.querySelector('.marquee-spa-track');
        if (marquee && isDesktop) {
          gsap.to(marquee, {
            xPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: '.social-proof',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        }
      }
    });

    // ─────────────────────────────────────────────────────────
    // 5. STICKY CTA FLOTANTE · show/hide
    // ─────────────────────────────────────────────────────────
    setupStickyCTA();

    // ─────────────────────────────────────────────────────────
    // 6. BOTONES · hover spring boost adicional al CSS
    //    (CSS ya da el lift básico · GSAP suma micro-rotate al icono)
    // ─────────────────────────────────────────────────────────
    setupButtonHovers();
  }

  /**
   * Split text en palabras animables sin romper HTML interno.
   * Itera childNodes del elemento, separando text nodes en palabras
   * y preservando element nodes (ej. <span class="hl">) wrappeando
   * cada palabra dentro del element con el mismo class para mantener
   * el styling (gradient, color, etc.).
   *
   * @param {HTMLElement} el · contenedor a partir
   * @returns {HTMLElement[]} · array de wrappers .hero-word creados
   */
  function splitWordsDomSafe(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var fragment = document.createDocumentFragment();
    var wrappers = [];

    function makeWrapper(textContent, preserveClassName) {
      var wrapper = document.createElement('span');
      wrapper.className = 'hero-word';
      wrapper.style.display = 'inline-block';
      wrapper.style.willChange = 'transform, opacity';

      if (preserveClassName) {
        // Conservar el styling del element padre (ej. .hl gradient)
        var inner = document.createElement('span');
        inner.className = preserveClassName;
        inner.textContent = textContent;
        wrapper.appendChild(inner);
      } else {
        wrapper.textContent = textContent;
      }
      return wrapper;
    }

    function appendSpace() {
      // Espacio normal (no nbsp · permite wrap natural en mobile)
      fragment.appendChild(document.createTextNode(' '));
    }

    nodes.forEach(function (node, idx) {
      if (node.nodeType === 3) {
        // Text node · split por whitespace
        var words = node.textContent.split(/\s+/).filter(Boolean);
        words.forEach(function (word, i) {
          var w = makeWrapper(word, null);
          fragment.appendChild(w);
          wrappers.push(w);
          if (i < words.length - 1) appendSpace();
        });
        // Si el text node termina con space y hay más nodes, agregar uno
        if (idx < nodes.length - 1 && /\s$/.test(node.textContent)) appendSpace();
      } else if (node.nodeType === 1) {
        // Element node · preservar className y wrappear cada palabra interna
        var elClass = node.className;
        var elWords = node.textContent.split(/\s+/).filter(Boolean);
        elWords.forEach(function (word, i) {
          var w = makeWrapper(word, elClass);
          fragment.appendChild(w);
          wrappers.push(w);
          if (i < elWords.length - 1) appendSpace();
        });
        // Si el element terminaba con space adyacente al siguiente, agregar
        if (idx < nodes.length - 1) appendSpace();
      }
    });

    // Replace contenido original con el nuevo fragment
    el.innerHTML = '';
    el.appendChild(fragment);
    return wrappers;
  }

  function setupStickyCTAStatic() {
    var cta = document.getElementById('cta-floating');
    if (!cta) return;
    // En reduced-motion: aparece directo tras scroll 100px sin transición exagerada
    function onScroll() {
      var nearFooter = isNearFooter();
      var farFromHero = window.scrollY > 100;
      cta.classList.toggle('is-visible', farFromHero && !nearFooter);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupStickyCTA() {
    var cta = document.getElementById('cta-floating');
    if (!cta) return;

    var lastVisible = false;
    function update() {
      var nearFooter = isNearFooter();
      var farFromHero = window.scrollY > 100;
      var shouldShow = farFromHero && !nearFooter;
      if (shouldShow !== lastVisible) {
        cta.classList.toggle('is-visible', shouldShow);
        lastVisible = shouldShow;
      }
    }
    // Throttle con requestAnimationFrame
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () { update(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function isNearFooter() {
    var footer = document.querySelector('.site-footer');
    if (!footer) return false;
    var rect = footer.getBoundingClientRect();
    // Si el footer está visible (top entra al viewport), oculta CTA
    return rect.top < window.innerHeight - 50;
  }

  function setupButtonHovers() {
    if (typeof window.gsap === 'undefined') return;
    var gsap = window.gsap;

    // Botones primarios · micro-tilt en hover
    document.querySelectorAll('.btn-blue, .btn-ghost-light, .cta-floating').forEach(function (btn) {
      var arrow = btn.querySelector('.cf-arrow') || null;
      btn.addEventListener('mouseenter', function () {
        if (arrow) gsap.to(arrow, { x: 4, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        if (arrow) gsap.to(arrow, { x: 0, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // GSAP carga con defer · DOMContentLoaded ya pasó, init directo
    // pero esperar un tick para que defer scripts terminen
    setTimeout(init, 0);
  }
})();

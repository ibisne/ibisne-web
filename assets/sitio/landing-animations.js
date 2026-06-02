/* ===================================================================
   assets/sitio/landing-animations.js · v20.0 · GSAP + ScrollTrigger
   ===================================================================
   Animaciones premium scroll-driven para la landing page.

   Requiere GSAP 3 + ScrollTrigger via CDN (jsdelivr).
   Defer · espera DOMContentLoaded · respeta prefers-reduced-motion.

   Cobertura v20.0:
   1. Hero entrance · timeline secuencial (eyebrow + words + lead + actions + trust)
   2. Section reveals · fade-up al entrar viewport
   3. Cards stagger · grid items entran progresivos
   4. Sticky CTA flotante · aparece tras scroll 100px + oculta cerca del footer
   5. Marquee parallax sutil
   6. Botón hover spring boost (auxiliar al CSS)
   ─── NUEVAS v20.0 ───
   7. Counter animation · [data-counter-to] interpolación 0→valor
   8. Section eyebrow typewriter · [data-anim-eyebrow] letter-by-letter
   9. Scroll-stack pinning · .como-trabajamos-stack 400vh pinned
  10. Magnetic cursor en CTAs hero · max ±6px
  11. Decorative stroke-dashoffset draw · [data-anim-draw] SVG paths
  12. Card lift+tilt sutil · .servicio-card max 1deg + 4px lift
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
      // Force-show hero trust strip too (fallback)
      var ts = document.querySelector('.hero-trust-strip');
      if (ts) ts.style.opacity = '1';
      return;
    }

    document.documentElement.setAttribute('data-gsap-ready', '');

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    var mm = gsap.matchMedia();

    mm.add({
      isMotion: '(prefers-reduced-motion: no-preference)',
      isReduced: '(prefers-reduced-motion: reduce)',
      isDesktop: '(min-width: 900px)',
      isFinePointer: '(pointer: fine)',
    }, function (context) {
      var conditions = context.conditions;
      var isMotion = conditions.isMotion;
      var isDesktop = conditions.isDesktop;
      var isFinePointer = conditions.isFinePointer;

      if (!isMotion) {
        // Reduced motion: restaurar visibilidad sin animar
        document.querySelectorAll('[data-anim], [data-anim-stagger] > *').forEach(function (el) {
          gsap.set(el, { opacity: 1, y: 0, clearProps: 'all' });
        });
        var trustStrip = document.querySelector('.hero-trust-strip');
        if (trustStrip) gsap.set(trustStrip, { opacity: 1 });

        // Counters: setear directo al valor final
        document.querySelectorAll('[data-counter-to]').forEach(function (el) {
          var target = parseFloat(el.dataset.counterTo);
          var decimals = parseInt(el.dataset.counterDecimals || '0', 10);
          el.textContent = decimals > 0 ? target.toFixed(decimals) : Math.round(target);
        });

        // Eyebrows: dejar texto completo
        document.querySelectorAll('[data-anim-eyebrow]').forEach(function (el) {
          // Nothing to do · text is intact
        });

        // SVG draws: revelados full
        document.querySelectorAll('[data-anim-draw] path, [data-anim-draw] line').forEach(function (p) {
          gsap.set(p, { strokeDasharray: 'none', strokeDashoffset: 0 });
        });

        // Scroll-stack: mostrar todos los layers
        document.querySelectorAll('.como-trabajamos-stack .ct-layer').forEach(function (l) {
          gsap.set(l, { opacity: 1, y: 0, scale: 1 });
        });

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
      var heroTrust = document.querySelector('[data-anim="hero-trust"]');

      var heroWords = [];
      if (heroH1) {
        heroWords = splitWordsDomSafe(heroH1);
        gsap.set(heroWords, { opacity: 0, y: 40, rotateX: -30 });
        gsap.set(heroH1, { opacity: 1 });
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

      if (heroTrust) {
        tl.fromTo(heroTrust,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.15');
      }

      // ─────────────────────────────────────────────────────────
      // 2. SECTION REVEALS al hacer scroll
      // ─────────────────────────────────────────────────────────
      if (ScrollTrigger) {
        document.querySelectorAll('[data-anim]').forEach(function (el) {
          if (el.closest('.hero-spa')) return;
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
          var children = Array.prototype.slice.call(container.children).filter(function (c) {
            return c.textContent.trim() !== '' || c.children.length > 0;
          });
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

        // Compat data-reveal-stagger antiguo
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

        // 4. MARQUEE PARALLAX sutil
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

        // ───────────────────────────────────────────────────────
        // 7. v20.0 · COUNTER ANIMATION (KPI strip)
        // ───────────────────────────────────────────────────────
        document.querySelectorAll('[data-counter-to]').forEach(function (el) {
          var target = parseFloat(el.dataset.counterTo);
          var prefix = el.dataset.counterPrefix || '';
          var suffix = el.dataset.counterSuffix || '';
          var decimals = parseInt(el.dataset.counterDecimals || '0', 10);
          var obj = { v: 0 };
          el.textContent = prefix + '0' + suffix;
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            onUpdate: function () {
              var n = decimals > 0 ? obj.v.toFixed(decimals) : Math.round(obj.v);
              el.textContent = prefix + n + suffix;
            },
          });
        });

        // ───────────────────────────────────────────────────────
        // 8. v20.0 · SECTION EYEBROW TYPEWRITER
        // ───────────────────────────────────────────────────────
        document.querySelectorAll('[data-anim-eyebrow]').forEach(function (el) {
          var fullText = el.textContent;
          if (!fullText) return;
          el.textContent = '';
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: function () {
              el.classList.add('is-typing');
              var i = 0;
              var msPerChar = 60;
              var iv = setInterval(function () {
                i += 1;
                el.textContent = fullText.slice(0, i);
                if (i >= fullText.length) {
                  clearInterval(iv);
                  setTimeout(function () { el.classList.remove('is-typing'); }, 500);
                }
              }, msPerChar);
            },
          });
        });

        // ───────────────────────────────────────────────────────
        // 11. v20.0 · DECORATIVE STROKE-DASHOFFSET DRAW
        // ───────────────────────────────────────────────────────
        document.querySelectorAll('[data-anim-draw]').forEach(function (container) {
          var paths = container.querySelectorAll('path, line, polyline');
          paths.forEach(function (path) {
            try {
              var length = (path.getTotalLength && path.getTotalLength()) || 100;
              gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
              gsap.to(path, {
                strokeDashoffset: 0,
                duration: 1.4,
                ease: 'power2.out',
                scrollTrigger: { trigger: container, start: 'top 80%', once: true },
              });
            } catch (e) { /* fallback: no animation */ }
          });
        });

        // ───────────────────────────────────────────────────────
        // 9. v20.0 · SCROLL-STACK PIN · Cómo trabajamos
        // ───────────────────────────────────────────────────────
        var stackSection = document.querySelector('.como-trabajamos-stack');
        if (stackSection && isDesktop) {
          var layers = stackSection.querySelectorAll('.ct-layer');
          var labels = stackSection.querySelectorAll('[data-ct-label]');
          var currentNum = stackSection.querySelector('[data-ct-current]');
          var progressFill = stackSection.querySelector('[data-ct-progress]');
          var total = layers.length;

          ScrollTrigger.create({
            trigger: stackSection,
            start: 'top top',
            // 120vh total (~30vh por step) · snappy, ya no se siente "stuck"
            end: '+=' + (total * 30) + '%',
            pin: '.ct-viewport',
            pinSpacing: true,
            scrub: 0.6,
            onUpdate: function (self) {
              var idx = Math.min(total - 1, Math.floor(self.progress * total));
              layers.forEach(function (l, i) { l.classList.toggle('is-active', i === idx); });
              labels.forEach(function (lb, i) { lb.classList.toggle('is-active', i === idx); });
              if (currentNum) currentNum.textContent = String(idx + 1).padStart(2, '0');
              if (progressFill) progressFill.style.width = ((idx + 1) / total * 100) + '%';
            },
          });
        }

        // ───────────────────────────────────────────────────────
        // 12. v20.0 · CARD LIFT+TILT sutil (solo desktop + fine pointer)
        // ───────────────────────────────────────────────────────
        if (isDesktop && isFinePointer) {
          document.querySelectorAll('.servicio-card').forEach(function (card) {
            var rect;
            var quickRotX = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power2.out' });
            var quickRotY = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power2.out' });
            var quickY = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'power2.out' });
            card.style.transformPerspective = '800px';
            card.style.transformStyle = 'preserve-3d';

            card.addEventListener('mouseenter', function () {
              rect = card.getBoundingClientRect();
              quickY(-4);
            });
            card.addEventListener('mousemove', function (e) {
              if (!rect) return;
              var dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
              var dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
              quickRotX(-dy * 1.2);
              quickRotY(dx * 1.2);
            });
            card.addEventListener('mouseleave', function () {
              quickRotX(0); quickRotY(0); quickY(0);
            });
          });
        }
      }

      // ─────────────────────────────────────────────────────────
      // 10. v20.0 · MAGNETIC CURSOR en CTAs hero
      // ─────────────────────────────────────────────────────────
      if (isDesktop && isFinePointer) {
        var ctas = document.querySelectorAll('.hero-actions .btn-blue, .hero-actions .btn-ghost-light');
        ctas.forEach(function (btn) {
          var rect;
          var quickX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
          var quickY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
          btn.addEventListener('mouseenter', function () { rect = btn.getBoundingClientRect(); });
          btn.addEventListener('mousemove', function (e) {
            if (!rect) return;
            var dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
            var dy = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
            var max = 6;
            quickX(Math.max(-max, Math.min(max, dx)));
            quickY(Math.max(-max, Math.min(max, dy)));
          });
          btn.addEventListener('mouseleave', function () {
            quickX(0); quickY(0);
          });
        });
      }
    });

    // ─────────────────────────────────────────────────────────
    // 5. STICKY CTA FLOTANTE · show/hide
    // ─────────────────────────────────────────────────────────
    setupStickyCTA();

    // ─────────────────────────────────────────────────────────
    // 6. BOTONES · hover spring boost adicional al CSS
    // ─────────────────────────────────────────────────────────
    setupButtonHovers();
  }

  /**
   * Split text en palabras animables sin romper HTML interno.
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
      fragment.appendChild(document.createTextNode(' '));
    }

    nodes.forEach(function (node, idx) {
      if (node.nodeType === 3) {
        var words = node.textContent.split(/\s+/).filter(Boolean);
        words.forEach(function (word, i) {
          var w = makeWrapper(word, null);
          fragment.appendChild(w);
          wrappers.push(w);
          if (i < words.length - 1) appendSpace();
        });
        if (idx < nodes.length - 1 && /\s$/.test(node.textContent)) appendSpace();
      } else if (node.nodeType === 1) {
        var elClass = node.className;
        var elWords = node.textContent.split(/\s+/).filter(Boolean);
        elWords.forEach(function (word, i) {
          var w = makeWrapper(word, elClass);
          fragment.appendChild(w);
          wrappers.push(w);
          if (i < elWords.length - 1) appendSpace();
        });
        if (idx < nodes.length - 1) appendSpace();
      }
    });

    el.innerHTML = '';
    el.appendChild(fragment);
    return wrappers;
  }

  function setupStickyCTAStatic() {
    var cta = document.getElementById('cta-floating');
    if (!cta) return;
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
    return rect.top < window.innerHeight - 50;
  }

  function setupButtonHovers() {
    if (typeof window.gsap === 'undefined') return;
    var gsap = window.gsap;

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
})();

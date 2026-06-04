/* ===================================================================
   assets/sitio/slider.js · v21.0 · Hero-slider scroll-driven pin
   ===================================================================
   - Pinea .slider-viewport durante 4 slides (400vh de scroll virtual)
   - Cross-fade entre slides según progress (0-0.25 · 0.25-0.5 · 0.5-0.75 · 0.75-1)
   - Snap a cada slide al soltar el scroll
   - Click en dots = ScrollTo a esa slide
   - Per-slide entrance: h1 word reveal · sub fade · CTA scale
   - Mobile / reduced-motion: drop pin · stack vertical normal
   - Defer · espera DOMContentLoaded · respeta prefers-reduced-motion
   =================================================================== */
(function () {
  'use strict';

  function init() {
    // Solo en index.html (home)
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html' && !path.endsWith('/index.html')) {
      return;
    }

    if (typeof window.gsap === 'undefined') {
      console.warn('[slider] GSAP no cargó · slider sin animaciones (las slides quedan visibles via CSS fallback).');
      // Hacer todas las slides visibles como fallback
      document.querySelectorAll('.slide').forEach(function (s) { s.classList.add('is-active'); });
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!ScrollTrigger) {
      console.warn('[slider] ScrollTrigger no cargó · usando fallback estático');
      document.querySelectorAll('.slide').forEach(function (s) { s.classList.add('is-active'); });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var slider = document.querySelector('.hero-slider');
    var viewport = document.querySelector('.slider-viewport');
    var slides = document.querySelectorAll('.slide');
    var dots = document.querySelectorAll('.slider-dot');
    var counterEl = document.querySelector('.slider-counter strong');

    if (!slider || !viewport || slides.length !== 4) {
      console.warn('[slider] estructura DOM incompleta · abort');
      return;
    }

    var mm = gsap.matchMedia();

    mm.add({
      isMotion: '(prefers-reduced-motion: no-preference)',
      isDesktop: '(min-width: 600px)',
    }, function (ctx) {
      var c = ctx.conditions;
      if (!c.isMotion || !c.isDesktop) {
        // Mobile o reduced-motion: hacer todas las slides visibles, sin pin
        slides.forEach(function (s) { s.classList.add('is-active'); });
        return;
      }

      var currentSlide = 0;
      slides[0].classList.add('is-active');
      if (dots[0]) dots[0].classList.add('is-active');

      // ───── Pin del viewport durante 4 slides ─────
      ScrollTrigger.create({
        trigger: slider,
        pin: viewport,
        start: 'top top',
        end: '+=300vh',                        // 3 transiciones × 100vh = pin 4 slides
        scrub: 0.6,
        snap: {
          snapTo: [0, 0.333, 0.666, 1],
          duration: { min: 0.2, max: 0.5 },
          ease: 'power2.inOut',
          delay: 0.08,
        },
        anticipatePin: 1,
        onUpdate: function (self) {
          // Determinar slide activa por progress
          var p = self.progress;
          var newSlide;
          if (p < 0.25) newSlide = 0;
          else if (p < 0.50) newSlide = 1;
          else if (p < 0.75) newSlide = 2;
          else newSlide = 3;

          if (newSlide !== currentSlide) {
            // Cambiar slide
            slides[currentSlide].classList.remove('is-active');
            slides[newSlide].classList.add('is-active');

            if (dots[currentSlide]) dots[currentSlide].classList.remove('is-active');
            if (dots[newSlide]) dots[newSlide].classList.add('is-active');

            // Animar entrada del glass panel + texto de la nueva slide
            animateSlideEntrance(slides[newSlide]);

            // Counter flip
            if (counterEl) {
              counterEl.classList.add('is-flipping');
              setTimeout(function () {
                counterEl.textContent = '0' + (newSlide + 1);
                counterEl.classList.remove('is-flipping');
              }, 180);
            }

            currentSlide = newSlide;
          }
        },
      });

      // Animar la slide 1 en el load inicial
      animateSlideEntrance(slides[0]);

      // ───── Dots click · ScrollTo a la slide ─────
      dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function () {
          var slidePositions = [0, 0.333, 0.666, 1];
          var st = ScrollTrigger.getById(slider.id || '') || ScrollTrigger.getAll().find(function (t) {
            return t.trigger === slider;
          });
          if (!st) return;
          var scrollTo = st.start + (st.end - st.start) * slidePositions[idx];
          window.scrollTo({ top: scrollTo + 1, behavior: 'smooth' });
        });
      });

      // ───── Video lifecycle · pause cuando slide 1 no está activa ─────
      var slide1Video = slides[0].querySelector('video');
      if (slide1Video) {
        var observer = setInterval(function () {
          if (currentSlide === 0) {
            if (slide1Video.paused) slide1Video.play().catch(function () { /* autoplay block */ });
          } else {
            if (!slide1Video.paused) slide1Video.pause();
          }
        }, 500);
        // Cleanup
        ctx.add(function () { return function () { clearInterval(observer); }; });
      }
    });

    // ───── Animar entrada de glass panel + h1 + sub + CTAs ─────
    function animateSlideEntrance(slide) {
      if (!slide) return;
      var panel = slide.querySelector('.slide-glass-panel');
      var h1 = slide.querySelector('.slide-h1');
      var sub = slide.querySelector('.slide-sub');
      var actions = slide.querySelector('.slide-actions');
      var eyebrow = slide.querySelector('.slide-eyebrow');

      if (!panel) return;

      // Reset
      gsap.set(panel, { y: 40, opacity: 0 });
      if (h1) gsap.set(h1, { opacity: 0, y: 20 });
      if (sub) gsap.set(sub, { opacity: 0, y: 16 });
      if (actions) gsap.set(actions, { opacity: 0, scale: 0.92 });
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, x: -8 });

      var tl = gsap.timeline();
      tl.to(panel, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'expo.out',
      }, 0);
      tl.to(eyebrow, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, 0.15);
      tl.to(h1, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out',
      }, 0.25);
      tl.to(sub, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, 0.45);
      tl.to(actions, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.6)',
      }, 0.6);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

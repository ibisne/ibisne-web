/* ============================================================
   iBisne — Motion behaviors
   ============================================================ */

(function () {
  'use strict';

  // ---------- Particles ----------
  function spawnParticles(container, count = 40) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle' + (Math.random() > 0.7 ? ' v-violet' : '');
      p.style.left = (Math.random() * 100) + '%';
      const dur = 10 + Math.random() * 16;
      p.style.animationDuration = dur + 's';
      p.style.animationDelay = (-Math.random() * dur) + 's';
      p.style.opacity = (0.2 + Math.random() * 0.7).toFixed(2);
      p.style.transform = 'scale(' + (0.5 + Math.random() * 1.2).toFixed(2) + ')';
      frag.appendChild(p);
    }
    container.appendChild(frag);
  }

  // ---------- Scramble decode ----------
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#01';
  function scramble(el, finalText, duration = 1200) {
    const chars = finalText.split('');
    const startTime = performance.now();
    const revealAt = chars.map((_, i) =>
      Math.random() * (duration * 0.6) + (i / chars.length) * (duration * 0.4)
    );

    function frame(now) {
      const elapsed = now - startTime;
      let out = '';
      let done = 0;
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === ' ') { out += ' '; done++; continue; }
        if (elapsed > revealAt[i]) { out += chars[i]; done++; }
        else { out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]; }
      }
      el.textContent = out;
      if (done < chars.length) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  function initScramble() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      const text = el.textContent;
      el.dataset.finalText = text;
      el.textContent = '';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.scrambled) {
          e.target.dataset.scrambled = '1';
          scramble(e.target, e.target.dataset.finalText, 900);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-scramble]').forEach(el => io.observe(el));
  }

  // ---------- Typewriter ----------
  function initTypewriter() {
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      const lines = (el.dataset.typewriter || el.textContent).split('|');
      el.textContent = '';
      const speed = parseInt(el.dataset.speed || 50, 10);
      let line = 0, char = 0;
      function type() {
        if (line >= lines.length) return;
        if (char <= lines[line].length) {
          el.textContent = lines.slice(0, line).join('\n') +
            (line > 0 ? '\n' : '') + lines[line].slice(0, char);
          char++;
          setTimeout(type, speed);
        } else {
          line++;
          char = 0;
          setTimeout(type, 400);
        }
      }
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { type(); obs.disconnect(); }
        });
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

  // ---------- Glitch on interval ----------
  function initGlitch() {
    document.querySelectorAll('.glitch').forEach(el => {
      function tick() {
        const delay = 3000 + Math.random() * 6000;
        setTimeout(() => {
          el.classList.add('is-glitching');
          setTimeout(() => el.classList.remove('is-glitching'), 200 + Math.random() * 200);
          tick();
        }, delay);
      }
      tick();
    });
  }

  // ---------- Reveal on scroll ----------
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // ---------- Modal ----------
  function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const target = document.querySelector(trigger.dataset.modalOpen);
        if (target) target.classList.add('open');
      });
    });
    document.querySelectorAll('.modal-scrim').forEach(scrim => {
      scrim.addEventListener('click', (e) => {
        if (e.target === scrim || e.target.matches('[data-modal-close]')) {
          scrim.classList.remove('open');
        }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-scrim.open').forEach(m => m.classList.remove('open'));
      }
    });
  }

  // ---------- Custom cursor ----------
  function initCursor() {
    if (matchMedia('(hover: none)').matches) return;
    const dot = document.createElement('div');
    dot.className = 'cursor';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span class="ch-v1"></span><span class="ch-v2"></span>';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;
    window.addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
    function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    const interactive = 'a, button, input, select, textarea, label, .chip, [data-modal-open]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactive)) ring.classList.add('is-interactive');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactive)) ring.classList.remove('is-interactive');
    });
    window.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
    window.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
  }

  // ---------- Bootstrap ----------
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    const pc = document.querySelector('.particles');
    if (pc) spawnParticles(pc, 50);
    initScramble();
    initTypewriter();
    initGlitch();
    initReveal();
    initModals();
    initCursor();
  });

  window.iBisne = { scramble, spawnParticles };
})();

/**
 * Inicio · luz y parallax.
 *
 * - El foco de la ciudad encendida (--mx / --my, en px dentro del escenario) sigue al
 *   cursor con suavizado (lerp en rAF). Sin cursor fino o sin actividad, recorre la
 *   ciudad solo, despacio.
 * - Parallax: cada [data-depth] se desplaza en sentido opuesto al cursor (px maximos
 *   = valor de data-depth). Solo con puntero fino; apagado con movimiento reducido.
 * - Solo escribe custom properties y `transform` (nada que provoque layout).
 */

const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Segundos de inactividad del cursor antes de que el foco retome su recorrido */
const IDLE_MS = 8000;
/** Velocidades de suavizado (1/s): mas alto = mas pegado al cursor */
const RATE_POINTER = 8;
const RATE_TOUR = 2.4;
const RATE_PARALLAX = 3.2;

let teardown: (() => void) | null = null;

function mount(): void {
  teardown?.();
  teardown = null;

  const found = document.querySelector<HTMLElement>('[data-home-stage]');
  if (!found) return;
  const stage: HTMLElement = found;

  const layers = Array.from(stage.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
    el,
    depth: Number(el.dataset.depth) || 0,
  }));

  const ac = new AbortController();
  const { signal } = ac;

  let w = stage.clientWidth;
  let h = stage.clientHeight;

  // Posicion del foco: actual (c) y objetivo (t), en px del escenario
  const tourAt = (ms: number) => ({
    x: w * (0.5 + 0.36 * Math.sin(ms / 6500 + 0.66)),
    y: h * (0.6 + 0.16 * Math.sin(ms / 9500)),
  });
  let tourMs = 0;
  let cx = w * 0.72;
  let cy = h * 0.6;
  let tx = cx;
  let ty = cy;

  // Parallax: posicion normalizada del cursor (-1..1), actual y objetivo
  let pcx = 0;
  let pcy = 0;
  let ptx = 0;
  let pty = 0;

  let pointerActive = false;
  let lastMove = -Infinity;
  let visible = !document.hidden;
  let raf = 0;
  let last = 0;
  let sinceWrite = 0;
  let wmx = Infinity; // ultimo valor escrito (Infinity fuerza la primera escritura)
  let wmy = Infinity;
  let placed = w > 0; // el foco ya arranco sobre la torre derecha

  const ro = new ResizeObserver(() => {
    w = stage.clientWidth;
    h = stage.clientHeight;
    if (!placed && w > 0) {
      placed = true;
      cx = tx = w * 0.72;
      cy = ty = h * 0.6;
    }
    wake();
  });
  ro.observe(stage);

  const io = new IntersectionObserver(
    (entries) => {
      visible = !document.hidden && entries.some((e) => e.isIntersecting);
      if (visible) wake();
    },
    { threshold: 0 },
  );
  io.observe(stage);

  document.addEventListener(
    'visibilitychange',
    () => {
      visible = !document.hidden;
      if (visible) wake();
    },
    { signal },
  );

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch' || !mqFine.matches) return;
      const r = stage.getBoundingClientRect();
      tx = Math.min(Math.max(e.clientX - r.left, 0), w);
      ty = Math.min(Math.max(e.clientY - r.top, 0), h);
      ptx = (e.clientX / window.innerWidth) * 2 - 1;
      pty = (e.clientY / window.innerHeight) * 2 - 1;
      pointerActive = true;
      lastMove = performance.now();
      wake();
    },
    { passive: true, signal },
  );
  const onLeave = () => {
    // El cursor salio de la ventana: el parallax vuelve al centro y el foco retoma su camino pronto
    ptx = 0;
    pty = 0;
    lastMove = performance.now() - IDLE_MS + 1200;
    wake();
  };
  document.documentElement.addEventListener('pointerleave', onLeave, { signal });
  window.addEventListener('blur', onLeave, { signal });

  function frame(now: number): void {
    raf = 0;
    if (!visible) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.1);
    last = now;

    const reduced = mqReduce.matches;
    const fine = mqFine.matches;
    pointerActive = pointerActive && now - lastMove < IDLE_MS;

    // 1. Objetivo del foco
    let rate = RATE_POINTER;
    if (!pointerActive && !reduced) {
      tourMs += dt * 1000;
      const p = tourAt(tourMs);
      tx = p.x;
      ty = p.y;
      rate = RATE_TOUR;
    }
    if (reduced) rate = 1000; // sin inercia: sigue al cursor tal cual

    const k = 1 - Math.exp(-dt * rate);
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;

    // En tactil el recorrido escribe a ~30 fps: se ve igual de suave y cuesta la mitad
    sinceWrite += dt;
    const minStep = fine ? 0 : 1 / 30;
    if (sinceWrite >= minStep) {
      sinceWrite = 0;
      if (Math.abs(cx - wmx) > 0.05 || Math.abs(cy - wmy) > 0.05) {
        wmx = cx;
        wmy = cy;
        stage.style.setProperty('--mx', `${cx.toFixed(1)}px`);
        stage.style.setProperty('--my', `${cy.toFixed(1)}px`);
      }
    }

    // 2. Parallax (solo puntero fino y sin movimiento reducido)
    let parallaxMoving = false;
    if (fine && !reduced) {
      const kp = 1 - Math.exp(-dt * RATE_PARALLAX);
      pcx += (ptx - pcx) * kp;
      pcy += (pty - pcy) * kp;
      parallaxMoving = Math.abs(ptx - pcx) > 0.001 || Math.abs(pty - pcy) > 0.001;
      for (const l of layers) {
        l.el.style.transform = `translate3d(${(-pcx * l.depth).toFixed(2)}px,${(-pcy * l.depth).toFixed(2)}px,0)`;
      }
    } else if (pcx !== 0 || pcy !== 0) {
      pcx = pcy = ptx = pty = 0;
      for (const l of layers) l.el.style.transform = '';
    }

    // 3. Seguir o parar: con movimiento reducido solo hay cuadros mientras algo se mueve
    const settled = Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05 && !parallaxMoving;
    if (!reduced || !settled) raf = requestAnimationFrame(frame);
    else last = 0;
  }

  function wake(): void {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  stage.style.setProperty('--mx', `${cx.toFixed(1)}px`);
  stage.style.setProperty('--my', `${cy.toFixed(1)}px`);
  wake();

  // Si cambia la preferencia de movimiento en vivo, se reevalua
  mqReduce.addEventListener('change', wake, { signal });

  teardown = () => {
    ac.abort();
    ro.disconnect();
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    for (const l of layers) l.el.style.transform = '';
  };
}

document.addEventListener('astro:page-load', mount);
document.addEventListener('astro:before-swap', () => {
  teardown?.();
  teardown = null;
});

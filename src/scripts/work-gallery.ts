/**
 * Trabajo · filtros por nicho/tipo (con estado en la URL) e inclinacion 3D del mockup en la ficha.
 * La salida/entrada de la UI en el viaje la hace travel.ts con las marcas [data-travel-ui].
 *
 * La activacion de las tarjetas (elevacion, borde de luz, botones) es CSS puro:
 * ver work-styles.css. Aqui no hay panel, volteo ni modal.
 * Solo Web Animations API, sin librerias. Nada de innerHTML (compatible con Trusted Types).
 */
const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedMq.matches;

/* ------------------------------------------------------------------ */
/* Filtros                                                             */
/* ------------------------------------------------------------------ */
interface Meta {
  el: HTMLElement;
  nicho: string;
  tipos: string[];
}

interface State {
  nicho: string;
  tipo: string;
}

const FLIP_MS = 320;
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** initWork() devuelve la funcion que deshace todo (listeners y animaciones). */
export function initWork(): () => void {
  const grid = document.querySelector<HTMLElement>('.work-grid');
  if (!grid) return () => {};

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.work-card'));
  const pills = Array.from(document.querySelectorAll<HTMLButtonElement>('.work-pill'));
  const status = document.getElementById('work-status');
  const meta: Meta[] = cards.map((el) => ({
    el,
    nicho: el.dataset.nicho ?? '',
    tipos: (el.dataset.tipos ?? '').split('|'),
  }));

  const cleanups: Array<() => void> = [];
  const on = <T extends EventTarget>(target: T, type: string, fn: (ev: any) => void) => {
    target.addEventListener(type, fn);
    cleanups.push(() => target.removeEventListener(type, fn));
  };

  const state: State = { nicho: '', tipo: '' };

  const matches = (m: Meta, s: State) =>
    (!s.nicho || m.nicho === s.nicho) && (!s.tipo || m.tipos.includes(s.tipo));

  function updatePills() {
    for (const pill of pills) {
      const group = pill.dataset.group as keyof State;
      const value = pill.dataset.value ?? '';
      pill.setAttribute('aria-pressed', String(state[group] === value));
      // Una pill queda deshabilitada si, combinada con el otro filtro, no daria ninguna marca.
      const hypothetical: State = { ...state, [group]: value };
      const hasResults = value === '' || meta.some((m) => matches(m, hypothetical));
      if (hasResults) pill.removeAttribute('aria-disabled');
      else pill.setAttribute('aria-disabled', 'true');
    }
    // Movil: el boton de cada filtro muestra la opcion elegida
    for (const v of document.querySelectorAll<HTMLElement>('[data-trigger-value]')) {
      const g = v.dataset.triggerValue as keyof State;
      v.textContent = state[g] || 'Todos';
      v.closest('.work-trigger')?.toggleAttribute('data-active', Boolean(state[g]));
    }
  }

  // Hojas de filtros en movil: <dialog> modal con cierre al tocar fuera (closedby="any")
  const sheets = Array.from(document.querySelectorAll<HTMLDialogElement>('[data-filter-sheet]'));
  const noClosedBy = !('closedBy' in HTMLDialogElement.prototype);
  for (const sheet of sheets) {
    if (noClosedBy) {
      // Respaldo (Safari): un toque en el backdrop llega con target = el propio dialog
      on(sheet, 'click', (ev: MouseEvent) => {
        if (ev.target !== sheet) return;
        const r = sheet.getBoundingClientRect();
        const inside = r.top <= ev.clientY && ev.clientY <= r.bottom && r.left <= ev.clientX && ev.clientX <= r.right;
        if (!inside) sheet.close();
      });
    }
    for (const btn of sheet.querySelectorAll<HTMLButtonElement>('[data-close-sheet]')) on(btn, 'click', () => sheet.close());
  }
  for (const trigger of document.querySelectorAll<HTMLButtonElement>('[data-open-filter]')) {
    on(trigger, 'click', () => {
      const sheet = sheets.find((s) => s.dataset.filterSheet === trigger.dataset.openFilter);
      if (sheet && !sheet.open) sheet.showModal();
    });
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.nicho) p.set('nicho', slug(state.nicho));
    if (state.tipo) p.set('tipo', slug(state.tipo));
    const qs = p.toString();
    try {
      // history.state se conserva: ClientRouter guarda ahi su indice y scroll.
      history.replaceState(history.state, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
    } catch {
      /* entorno sin History API escribible */
    }
  }

  function announce() {
    if (!status) return;
    const n = cards.filter((c) => !c.hidden).length;
    status.textContent = n === 1 ? 'Mostrando 1 marca' : `Mostrando ${n} marcas`;
  }

  let gen = 0;
  async function apply(animate: boolean) {
    const my = ++gen;
    for (const c of cards) c.getAnimations().forEach((a) => a.cancel());

    const nextVisible = new Set(meta.filter((m) => matches(m, state)).map((m) => m.el));
    const before = cards.filter((c) => !c.hidden);

    if (!animate || reduced() || before.length === 0) {
      for (const c of cards) c.hidden = !nextVisible.has(c);
      announce();
      return;
    }

    const first = new Map(before.map((c) => [c, c.getBoundingClientRect()]));
    const gone = before.filter((c) => !nextVisible.has(c));

    if (gone.length) {
      await Promise.all(
        gone.map((c) =>
          c
            .animate(
              [
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.94)' },
              ],
              { duration: 160, easing: 'ease-in', fill: 'forwards' },
            )
            .finished.catch(() => undefined),
        ),
      );
      if (my !== gen) return; // otro filtro tomo el relevo
    }

    for (const c of cards) {
      const show = nextVisible.has(c);
      c.hidden = !show;
      if (!show) c.getAnimations().forEach((a) => a.cancel());
    }
    announce();

    // FLIP: las que se quedan se deslizan a su nueva celda; las nuevas entran con fundido.
    for (const c of cards) {
      if (c.hidden) continue;
      const last = c.getBoundingClientRect();
      const f = first.get(c);
      if (f) {
        const dx = f.left - last.left;
        const dy = f.top - last.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
        c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
          duration: FLIP_MS,
          easing: FLIP_EASE,
        });
      } else {
        c.animate(
          [
            { opacity: 0, transform: 'scale(0.94)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: 260, delay: 60, easing: FLIP_EASE, fill: 'backwards' },
        );
      }
    }
  }

  for (const pill of pills) {
    on(pill, 'click', () => {
      if (pill.getAttribute('aria-disabled') === 'true') return;
      const group = pill.dataset.group as keyof State;
      const value = pill.dataset.value ?? '';
      if (state[group] === value) return;
      state[group] = value;
      updatePills();
      writeUrl();
      const sheet = pill.closest<HTMLDialogElement>('dialog');
      if (sheet?.open) sheet.close();
      void apply(true);
    });
  }

  // Estado inicial desde la URL
  {
    const params = new URLSearchParams(location.search);
    const wantN = params.get('nicho');
    const wantT = params.get('tipo');
    const nichoPill = pills.find((p) => p.dataset.group === 'nicho' && p.dataset.value && slug(p.dataset.value) === wantN);
    const tipoPill = pills.find((p) => p.dataset.group === 'tipo' && p.dataset.value && slug(p.dataset.value) === wantT);
    if (nichoPill) state.nicho = nichoPill.dataset.value ?? '';
    if (tipoPill) state.tipo = tipoPill.dataset.value ?? '';
    if (!meta.some((m) => matches(m, state))) {
      state.nicho = '';
      state.tipo = '';
    }
    updatePills();
    for (const m of meta) m.el.hidden = !matches(m, state);
    announce();
    if (wantN || wantT) writeUrl();
  }

  return () => {
    for (const c of cards) c.getAnimations().forEach((a) => a.cancel());
    for (const s of sheets) if (s.open) s.close();
    for (const fn of cleanups) fn();
  };
}

/* ------------------------------------------------------------------ */
/* Ficha · inclinacion 3D del mockup que sigue al mouse                */
/* ------------------------------------------------------------------ */
const MAX_RX = 5; // grados
const MAX_RY = 7;

/** Solo puntero fino y sin reducir movimiento. Devuelve la funcion que lo deshace. */
export function initTilt(): () => void {
  const el = document.querySelector<HTMLElement>('[data-tilt]');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!el || !fine.matches || reduced()) return () => {};

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;

  const tick = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    el.style.setProperty('--rx', `${cy.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${cx.toFixed(2)}deg`);
    raf = Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02 ? requestAnimationFrame(tick) : 0;
  };
  const move = (ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    // -1..1 respecto del centro del mockup, acotado para que lejos no gire de mas
    const nx = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
    const ny = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    tx = nx * MAX_RY;
    ty = -ny * MAX_RX;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const leave = () => {
    tx = 0;
    ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  document.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  return () => {
    document.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', leave);
    cancelAnimationFrame(raf);
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
  };
}

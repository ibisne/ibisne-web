/**
 * Trabajo · filtros, panel 3x3 con volteo y modal de resumen tecnico.
 * Solo Web Animations API, sin librerias. Todo el DOM dinamico se arma con
 * createElement/textContent (nada de innerHTML: compatible con Trusted Types).
 *
 * initWork() devuelve la funcion que deshace todo (listeners, timers, rAF).
 */

interface BrandData {
  slug: string;
  name: string;
  nicho: string;
  tipos: string[];
  url: string | null;
  year: number | null;
  stack: string[] | null;
  resumen: string | null;
  logo: { src: string; w: number; h: number } | null;
  mockup: { src: string; w: number; h: number } | null;
}

interface Meta {
  el: HTMLButtonElement;
  nicho: string;
  tipos: string[];
}

interface State {
  nicho: string;
  tipo: string;
}

interface OpenPanel {
  card: HTMLButtonElement;
  panel: HTMLElement;
  anims: Animation[];
  closing: boolean;
  pinned: boolean;
}

const SPAN = 3; // el panel ocupa 3 x 3 celdas
const PANEL_MS = 450;
const PANEL_EASE = 'cubic-bezier(0.45, 0.05, 0.2, 1)';
const FLIP_MS = 320;
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const HOVER_INTENT_MS = 70;
const LEAVE_GRACE_MS = 140;

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Record<string, string>,
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

function placeholder(name: string): HTMLElement {
  const ph = h('span', 'work-ph');
  ph.append(h('span', 'work-ph__name', {}, name), h('span', 'work-ph__tag', {}, 'Logo pendiente'));
  return ph;
}

export function initWork(): () => void {
  const grid = document.querySelector<HTMLElement>('.work-grid');
  const dataEl = document.getElementById('work-data');
  const dlgEl = document.getElementById('work-modal') as HTMLDialogElement | null;
  if (!grid || !dataEl || !dlgEl) return () => {};
  const dlg: HTMLDialogElement = dlgEl;

  const brands: BrandData[] = JSON.parse(dataEl.textContent || '[]');
  const bySlug = new Map(brands.map((b) => [b.slug, b]));
  const cards = Array.from(grid.querySelectorAll<HTMLButtonElement>('.work-card'));
  const pills = Array.from(document.querySelectorAll<HTMLButtonElement>('.work-pill'));
  const status = document.getElementById('work-status');
  const meta: Meta[] = cards.map((el) => ({
    el,
    nicho: el.dataset.nicho ?? '',
    tipos: (el.dataset.tipos ?? '').split('|'),
  }));

  const panelMq = window.matchMedia('(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine)');
  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panelMode = () => panelMq.matches;
  const reduced = () => reducedMq.matches;

  const cleanups: Array<() => void> = [];
  const on = <T extends EventTarget>(
    target: T,
    type: string,
    fn: (ev: any) => void,
    opts?: AddEventListenerOptions | boolean,
  ) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  /* ------------------------------------------------------------------ */
  /* Filtros                                                             */
  /* ------------------------------------------------------------------ */
  const state: State = { nicho: '', tipo: '' };

  const matches = (m: Meta, s: State) =>
    (!s.nicho || m.nicho === s.nicho) && (!s.tipo || m.tipos.includes(s.tipo));

  function updatePills() {
    for (const pill of pills) {
      const group = pill.dataset.group as keyof State;
      const value = pill.dataset.value ?? '';
      const pressed = state[group] === value;
      pill.setAttribute('aria-pressed', String(pressed));
      // Una pill queda deshabilitada si, combinada con el otro filtro, no daria ninguna marca.
      const hypothetical: State = { ...state, [group]: value };
      const hasResults = value === '' || meta.some((m) => matches(m, hypothetical));
      if (hasResults) pill.removeAttribute('aria-disabled');
      else pill.setAttribute('aria-disabled', 'true');
    }
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
    closePanel(true);
    for (const c of cards) c.getAnimations().forEach((a) => a.cancel());

    const nextVisible = new Set(meta.filter((m) => matches(m, state)).map((m) => m.el));
    const before = cards.filter((c) => !c.hidden);

    if (!animate || reduced() || before.length === 0) {
      for (const c of cards) c.hidden = !nextVisible.has(c);
      announce();
      return;
    }

    const first = new Map(before.map((c) => [c, c.getBoundingClientRect()]));
    const leaving = before.filter((c) => !nextVisible.has(c));

    if (leaving.length) {
      await Promise.all(
        leaving.map((c) =>
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

  /* ------------------------------------------------------------------ */
  /* Panel 3x3                                                           */
  /* ------------------------------------------------------------------ */
  let current: OpenPanel | null = null;
  const hovering = new Set<Element>();
  let focusInside = false;
  let suppressFocusOpen = false;
  let leaveTimer = 0;
  let intentTimer = 0;

  const prefetched = new Set<string>();
  function prefetch(b: BrandData) {
    if (!b.mockup || prefetched.has(b.mockup.src)) return;
    prefetched.add(b.mockup.src);
    const img = new Image();
    img.decoding = 'async';
    img.src = b.mockup.src;
  }

  function panelRect(card: HTMLElement) {
    const cs = getComputedStyle(grid!);
    const cols = Math.max(1, cs.gridTemplateColumns.split(' ').length);
    const rows = Math.max(1, cs.gridTemplateRows.split(' ').length);
    const gx = parseFloat(cs.columnGap) || 8;
    const gy = parseFloat(cs.rowGap) || gx;
    const cw = (grid!.clientWidth - gx * (cols - 1)) / cols;
    const rh = (grid!.clientHeight - gy * (rows - 1)) / rows;
    const idx = cards.filter((c) => !c.hidden).indexOf(card as HTMLButtonElement);
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const spanC = Math.min(SPAN, cols);
    const spanR = Math.min(SPAN, rows);
    // Columna: la tarjeta queda al centro del panel salvo en los bordes.
    // Fila: el panel arranca en la fila de la tarjeta (Figma 26:114) y sube si no cabe.
    const c0 = clamp(col - 1, 0, cols - spanC);
    const r0 = clamp(row, 0, rows - spanR);
    return {
      left: c0 * (cw + gx),
      top: r0 * (rh + gy),
      width: spanC * cw + (spanC - 1) * gx,
      height: spanR * rh + (spanR - 1) * gy,
    };
  }

  function buildPanel(card: HTMLButtonElement, b: BrandData): HTMLElement {
    const panel = h('div', 'work-panel', { role: 'group', 'aria-label': `${b.name}: ver proyecto o resumen técnico` });

    // Frente: el mismo logo de la tarjeta, a su tamano en pixeles (no crece con el panel).
    const front = h('div', 'work-face work-face--front', { 'aria-hidden': 'true' });
    const srcLogo = card.querySelector<HTMLElement>('.work-card__logo, .work-ph');
    if (srcLogo) {
      const clone = srcLogo.cloneNode(true) as HTMLElement;
      if (srcLogo.classList.contains('work-card__logo')) {
        clone.style.position = 'static';
        clone.style.width = `${srcLogo.offsetWidth}px`;
        clone.style.height = `${srcLogo.offsetHeight}px`;
      }
      front.append(clone);
    }

    // Reverso: mockup bajo capa oscura (o fondo oscuro con logo atenuado) + botones.
    const back = h('div', 'work-face work-face--back');
    if (b.mockup) {
      back.append(
        h('img', 'work-face__shot', {
          src: b.mockup.src,
          width: String(b.mockup.w),
          height: String(b.mockup.h),
          alt: '',
          decoding: 'async',
        }),
      );
    } else {
      const fb = h('div', 'work-face__fallback');
      if (b.logo) {
        fb.append(h('img', '', { src: b.logo.src, width: String(b.logo.w), height: String(b.logo.h), alt: '' }));
      } else {
        fb.append(placeholder(b.name));
      }
      back.append(fb);
    }
    back.append(h('div', 'work-face__scrim'));

    const actions = h('div', 'work-face__actions');
    if (b.url) {
      actions.append(
        h('a', 'work-btn work-btn--solid', { href: b.url, target: '_blank', rel: 'noopener' }, 'Ver proyecto'),
      );
    }
    const more = h('button', 'work-btn work-btn--outline', { type: 'button' }, 'Ver resumen técnico');
    on(more, 'click', () => {
      closePanel(true);
      openModal(b, { touch: false, returnTo: card });
    });
    actions.append(more);
    back.append(actions);

    panel.append(front, back);
    return panel;
  }

  function openFor(card: HTMLButtonElement, pinned = false) {
    if (!panelMode() || dlg.open) return;
    if (current && current.card === card) {
      if (current.closing) reopen();
      if (pinned) current.pinned = true;
      return;
    }
    if (current) destroy();
    const b = bySlug.get(card.dataset.slug ?? '');
    if (!b) return;
    prefetch(b);

    const panel = buildPanel(card, b);
    card.after(panel); // justo despues de la tarjeta: Tab entra a sus botones

    const from = { left: card.offsetLeft, top: card.offsetTop, width: card.offsetWidth, height: card.offsetHeight };
    const to = panelRect(card);
    const px = (r: typeof from) => ({
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    // Posicion final como estilo base; las animaciones parten de la tarjeta (FLIP).
    Object.assign(panel.style, px(to));
    const dur = reduced() ? 1 : PANEL_MS;
    const anims = [
      panel.animate([px(from), px(to)], { duration: dur, easing: PANEL_EASE, fill: 'both' }),
      // A mitad de camino el panel ya esta de canto: se ve el reverso.
      panel.animate(
        [{ transform: 'perspective(1200px) rotateY(0deg)' }, { transform: 'perspective(1200px) rotateY(180deg)' }],
        { duration: dur, easing: PANEL_EASE, fill: 'both' },
      ),
    ];
    const entry: OpenPanel = { card, panel, anims, closing: false, pinned };
    current = entry;
    anims[0].onfinish = () => {
      if (current === entry && entry.closing) destroy();
    };

    on(panel, 'pointerenter', onPanelEnter);
    on(panel, 'pointerleave', onPanelLeave);
    card.classList.add('is-active');
    grid!.classList.add('has-open');
  }

  function reopen() {
    if (!current || !current.closing) return;
    current.closing = false;
    current.anims.forEach((a) => a.reverse());
    current.card.classList.add('is-active');
    grid!.classList.add('has-open');
  }

  function destroy() {
    if (!current) return;
    const { panel, card, anims } = current;
    anims.forEach((a) => {
      a.onfinish = null;
      a.cancel();
    });
    panel.remove();
    hovering.delete(panel);
    focusInside = false;
    card.classList.remove('is-active');
    grid!.classList.remove('has-open');
    current = null;
  }

  function closePanel(instant = false) {
    window.clearTimeout(intentTimer);
    window.clearTimeout(leaveTimer);
    if (!current) return;
    if (instant || reduced()) {
      destroy();
      return;
    }
    if (current.closing) return;
    current.closing = true;
    current.pinned = false;
    current.card.classList.remove('is-active');
    grid!.classList.remove('has-open');
    current.anims.forEach((a) => a.reverse());
  }

  function stayOpen(): boolean {
    return hovering.size > 0 || focusInside || !!current?.pinned;
  }
  function scheduleLeaveCheck() {
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => {
      if (current && !stayOpen()) closePanel();
    }, LEAVE_GRACE_MS);
  }

  function onPanelEnter(ev: PointerEvent) {
    if (ev.pointerType === 'touch') return;
    window.clearTimeout(leaveTimer);
    hovering.add(ev.currentTarget as Element);
    if (current?.closing) reopen();
  }
  function onPanelLeave(ev: PointerEvent) {
    hovering.delete(ev.currentTarget as Element);
    scheduleLeaveCheck();
  }

  for (const card of cards) {
    on(card, 'pointerenter', (ev: PointerEvent) => {
      if (ev.pointerType === 'touch' || !panelMode()) return;
      window.clearTimeout(leaveTimer);
      hovering.add(card);
      if (current?.card === card) {
        if (current.closing) reopen();
        return;
      }
      const b = bySlug.get(card.dataset.slug ?? '');
      if (b) prefetch(b);
      window.clearTimeout(intentTimer);
      intentTimer = window.setTimeout(() => {
        if (hovering.has(card)) openFor(card);
      }, HOVER_INTENT_MS);
    });
    on(card, 'pointerleave', () => {
      hovering.delete(card);
      window.clearTimeout(intentTimer);
      scheduleLeaveCheck();
    });
    on(card, 'click', (ev: MouseEvent) => {
      const b = bySlug.get(card.dataset.slug ?? '');
      if (!b) return;
      if (!panelMode()) {
        openModal(b, { touch: true, returnTo: card });
        return;
      }
      const pointerType = (ev as PointerEvent).pointerType;
      // Pantalla tactil en un equipo con puntero fino: el toque abre y fija el panel.
      if (!current || current.card !== card) openFor(card, pointerType === 'touch' || pointerType === 'pen');
      else if (current.closing) reopen();
      // Enter / espacio: lleva el foco a los botones del panel.
      if (ev.detail === 0 && current?.card === card) {
        current.panel.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
      }
    });
  }

  on(grid, 'focusin', (ev: FocusEvent) => {
    const t = ev.target as HTMLElement;
    const inPanel = !!current && current.panel.contains(t);
    if (t.classList.contains('work-card')) {
      focusInside = true;
      if (!suppressFocusOpen && t.matches(':focus-visible')) openFor(t as HTMLButtonElement);
    } else if (inPanel) {
      focusInside = true;
      if (current?.closing) reopen();
    }
  });
  on(grid, 'focusout', (ev: FocusEvent) => {
    const to = ev.relatedTarget as Node | null;
    const keep = !!to && (!!current && (current.card === to || current.panel.contains(to)));
    if (keep) return;
    focusInside = false;
    scheduleLeaveCheck();
  });

  on(document, 'keydown', (ev: KeyboardEvent) => {
    if (ev.key !== 'Escape' || dlg.open || !current) return;
    const card = current.card;
    const hadFocus = current.panel.contains(document.activeElement);
    hovering.clear();
    focusInside = false;
    closePanel();
    if (hadFocus) {
      suppressFocusOpen = true;
      card.focus({ preventScroll: true });
      window.setTimeout(() => (suppressFocusOpen = false));
    }
  });
  // Un panel fijado con toque se cierra al tocar fuera
  on(document, 'pointerdown', (ev: PointerEvent) => {
    if (!current?.pinned) return;
    const t = ev.target as Node;
    if (current.panel.contains(t) || current.card.contains(t)) return;
    closePanel();
  });
  on(panelMq, 'change', () => {
    if (!panelMq.matches) closePanel(true);
    setupParallax();
  });

  /* ------------------------------------------------------------------ */
  /* Modal de resumen tecnico                                            */
  /* ------------------------------------------------------------------ */
  const f = (name: string) => dlg.querySelector<HTMLElement>(`[data-f="${name}"]`)!;
  let returnTo: HTMLElement | null = null;

  function openModal(b: BrandData, opts: { touch: boolean; returnTo: HTMLElement }) {
    returnTo = opts.returnTo;

    // Mockup arriba solo en tactil
    const shot = f('shot');
    const shotImg = f('shot-img') as HTMLImageElement;
    if (opts.touch && b.mockup) {
      shotImg.src = b.mockup.src;
      shotImg.width = b.mockup.w;
      shotImg.height = b.mockup.h;
      shotImg.alt = `Captura de ${b.name}`;
      shot.hidden = false;
    } else {
      shotImg.removeAttribute('src');
      shotImg.alt = '';
      shot.hidden = true;
    }

    const logo = f('logo');
    const logoImg = f('logo-img') as HTMLImageElement;
    if (b.logo) {
      logoImg.src = b.logo.src;
      logoImg.width = b.logo.w;
      logoImg.height = b.logo.h;
      logo.hidden = false;
    } else {
      logoImg.removeAttribute('src');
      logo.hidden = true;
    }

    f('name').textContent = b.name;
    f('meta').textContent = `${b.nicho} · ${b.tipos.join(', ')}`;

    const text = f('text');
    const hasStack = !!b.stack && b.stack.length > 0;
    if (b.resumen) {
      text.textContent = b.resumen;
      text.classList.remove('is-empty');
    } else if (!hasStack) {
      text.textContent = 'Resumen técnico en preparación.';
      text.classList.add('is-empty');
    } else {
      text.textContent = '';
      text.classList.remove('is-empty');
    }
    text.hidden = !text.textContent;

    const stackWrap = f('stack-wrap');
    const stack = f('stack');
    stack.replaceChildren();
    if (hasStack) {
      for (const s of b.stack!) stack.append(h('li', '', {}, s));
    }
    stackWrap.hidden = !hasStack;

    f('year').textContent = b.year ? String(b.year) : '';
    f('year-wrap').hidden = !b.year;
    const url = f('url') as HTMLAnchorElement;
    if (b.url) {
      url.href = b.url;
      url.textContent = b.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    } else {
      url.removeAttribute('href');
      url.textContent = '';
    }
    f('url-wrap').hidden = !b.url;
    f('facts').hidden = !b.year && !b.url;

    // Botones: en tactil el modal es el unico lugar con "Ver proyecto"
    const actions = f('actions');
    const visit = f('visit') as HTMLAnchorElement;
    if (opts.touch && b.url) {
      visit.href = b.url;
      actions.hidden = false;
    } else {
      visit.removeAttribute('href');
      actions.hidden = true;
    }

    dlg.scrollTop = 0;
    dlg.showModal();
  }

  function onModalClosed() {
    const target = returnTo;
    returnTo = null;
    if (target && target.isConnected) {
      suppressFocusOpen = true;
      target.focus({ preventScroll: true });
      window.setTimeout(() => (suppressFocusOpen = false));
    }
  }
  on(dlg, 'close', onModalClosed);
  on(dlg, 'click', (ev: MouseEvent) => {
    // Clic en el telon (fuera de la caja): el target es el propio <dialog>
    if (ev.target === dlg) dlg.close();
  });
  on(dlg.querySelector('[data-work-close]')!, 'click', () => dlg.close());

  /* ------------------------------------------------------------------ */
  /* Parallax muy leve del fondo (solo puntero fino, sin reducir movimiento) */
  /* ------------------------------------------------------------------ */
  const bg = document.querySelector<HTMLElement>('[data-work-bg]');
  let raf = 0;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let parallaxOff: (() => void) | null = null;

  function setupParallax() {
    parallaxOff?.();
    parallaxOff = null;
    if (!bg || !panelMode() || reduced()) {
      if (bg) bg.style.transform = '';
      return;
    }
    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      bg.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerType === 'touch') return;
      tx = -(ev.clientX / window.innerWidth - 0.5) * 2 * 10;
      ty = -(ev.clientY / window.innerHeight - 0.5) * 2 * 6;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('pointermove', move, { passive: true });
    parallaxOff = () => {
      document.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      raf = 0;
    };
  }
  setupParallax();
  on(reducedMq, 'change', setupParallax);

  return () => {
    window.clearTimeout(leaveTimer);
    window.clearTimeout(intentTimer);
    parallaxOff?.();
    if (dlg.open) dlg.close();
    destroy();
    for (const fn of cleanups) fn();
  };
}

/**
 * Entrada inmersiva (componente src/components/Entry.astro).
 *
 *   primera visita  pregunta en un <dialog> modal: "Entrar con experiencia" (musica + efectos) o
 *                   "Entrar sin sonido". Escape = sin sonido. La eleccion queda en
 *                   localStorage.ib_entry ('immersive' | 'quiet').
 *   loader          la MISMA B del mundo (world/bmatrix.ts): arranca dispersa por toda la pantalla
 *                   (particulas y glifos, escena velada, glitch de rebanadas y RGB) mientras se
 *                   pregunta, y se ordena de afuera hacia adentro hasta su lugar. El avance real de
 *                   la precarga decide cuanto se arma, con tope: ~2.6 s tras la eleccion, ~1.5 s en
 *                   recargas. Al terminar el velo se abre: en Inicio la B queda en su sitio; en otra
 *                   pagina se disuelve hacia la escena como en los viajes.
 *                   Sin WebGL o con reduced motion: fundido simple (< 600 ms).
 *   precarga        preload.ts (mundo, fuentes, paginas e imagenes; musica solo con experiencia).
 *   musica          ambient.ts. El AudioContext nace en el clic de "Entrar con experiencia". En
 *                   recargas con 'immersive' arranca con el primer gesto del usuario en la pagina
 *                   (politica de autoplay: nunca sin gesto).
 *   control         [data-sound-toggle] (SoundToggle.astro): enciende/apaga y guarda la eleccion.
 *
 * Corre una vez por documento (modulo); la cubierta persiste oculta entre navegaciones SPA.
 */
import { introBegin, introEnd, introProgress, introVisible } from './world';
import { fadeInAmbient, isAmbientOn, onAmbientChange, startAmbient, stopAmbient } from './ambient';
import { preloadSite } from './preload';
import { holdEntry, releaseEntry } from './entry-gate';

type Choice = 'immersive' | 'quiet';
const KEY = 'ib_entry';
/** Armado: nunca mas rapido que min (aunque todo este cargado) ni mas lento que max (tope), en s */
const FIRST = { min: 1.9, max: 2.1 };
const AGAIN = { min: 0.75, max: 0.95 };
/** Al llegar a este armado se abre el velo y la B termina de armarse a la vez (~0.6 s) */
const OPEN_AT = 0.82;
const REDUCED_HOLD_MS = 220;
const REDUCED_FADE_MS = 300;
/** Si el JS llego tarde (el seguro CSS de 4 s ya retiro la cubierta), no se vuelve a tapar */
const LATE_MS = 3600;

const read = (): Choice | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'immersive' || v === 'quiet' ? v : null;
  } catch {
    return null;
  }
};
const save = (v: Choice): void => {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* sin almacenamiento: se volvera a preguntar */
  }
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cover = document.querySelector<HTMLElement>('[data-entry]');

/* ---------- control de sonido ---------- */

function syncToggles(): void {
  const on = isAmbientOn();
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]')) {
    b.hidden = false;
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Apagar música ambiental' : 'Encender música ambiental');
    b.title = on ? 'Apagar música' : 'Encender música';
  }
}

let togglesBound = false;
function bindToggles(): void {
  if (togglesBound) return;
  togglesBound = true;
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest?.('[data-sound-toggle]');
    if (!btn) return;
    disarm();
    if (isAmbientOn()) {
      stopAmbient();
      save('quiet');
    } else {
      startAmbient(); // dentro del clic: gesto valido para el AudioContext
      save('immersive');
    }
  });
  onAmbientChange(syncToggles);
  document.addEventListener('astro:page-load', () => {
    if (cover?.dataset.state === 'done') syncToggles();
  });
}

/* ---------- recargas con 'immersive': la musica espera el primer gesto ---------- */

const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;
let armed = false;
function onGesture(e: Event): void {
  if (e.type === 'pointerdown' && (e as PointerEvent).pointerType !== 'mouse') return; // tactil: touchend
  if (e.type === 'keydown' && (e as KeyboardEvent).key === 'Escape') return;
  if ((e.target as Element | null)?.closest?.('[data-sound-toggle]')) return; // el control decide solo
  disarm();
  if (read() === 'immersive' && !isAmbientOn()) startAmbient();
}
function arm(): void {
  if (armed) return;
  armed = true;
  for (const t of GESTURES) window.addEventListener(t, onGesture, { capture: true, passive: true });
}
function disarm(): void {
  if (!armed) return;
  armed = false;
  for (const t of GESTURES) window.removeEventListener(t, onGesture, { capture: true });
}

/* ---------- flujo ---------- */

async function main(el: HTMLElement): Promise<void> {
  el.dataset.state = 'boot';
  const saved = read();
  bindToggles();

  if (saved && performance.now() > LATE_MS) {
    finish(el);
    if (saved === 'immersive') arm();
    return;
  }
  // la UI de la pagina espera oculta; entra en cascada cuando se abre el velo
  holdEntry();
  // recarga con 'immersive': cualquier gesto (incluso durante el loader) enciende la musica
  if (saved === 'immersive') arm();

  // La B del mundo arranca dispersa; la cubierta se aparta en cuanto se ve
  const webgl = !reduced && introBegin();
  if (webgl) {
    void introVisible().then((ok) => {
      if (ok) el.dataset.veil = 'open';
    });
  }

  let choice: Choice;
  let first = false;
  if (saved) {
    choice = saved;
  } else {
    first = true;
    choice = await ask(el);
  }

  // precarga: nunca se espera mas que el tope del armado
  const load = el.querySelector<HTMLElement>('[data-entry-load]');
  const bar = el.querySelector<HTMLElement>('[data-entry-bar]');
  const fill = el.querySelector<HTMLElement>('[data-entry-fill]');
  const pct = el.querySelector<HTMLElement>('[data-entry-pct]');
  if (load && first) load.hidden = false;
  el.dataset.state = 'loading';
  let progress = 0;
  void preloadSite({
    audio: choice === 'immersive',
    onProgress: (p) => {
      progress = p;
      const n = Math.round(p * 100);
      fill?.style.setProperty('--p', p.toFixed(3));
      bar?.setAttribute('aria-valuenow', String(n));
      if (pct) pct.textContent = `${n}%`;
    },
  });

  const music = () => {
    if (choice === 'immersive' && isAmbientOn()) fadeInAmbient();
  };

  if (!webgl) {
    await wait(REDUCED_HOLD_MS);
    music();
    releaseEntry();
    await fade(el, REDUCED_FADE_MS);
  } else {
    const T = first ? FIRST : AGAIN;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      let done = false;
      const end = () => {
        if (done) return;
        done = true;
        resolve();
      };
      const step = () => {
        if (done) return;
        const t = (performance.now() - t0) / 1000;
        // la precarga manda, con un ritmo minimo (min) y un tope (max)
        const a = Math.max(Math.min(progress, t / T.min), t / T.max);
        introProgress(a);
        if (a >= OPEN_AT) return end();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // si la pestana esta oculta no hay cuadros: el tope se cumple igual
      window.setTimeout(end, T.max * OPEN_AT * 1000 + 200);
    });
    if (load) load.hidden = true;
    el.dataset.veil = 'open';
    music();
    releaseEntry();
    await introEnd();
  }
  finish(el);
  if (choice === 'immersive' && !isAmbientOn()) arm();
}

function ask(el: HTMLElement): Promise<Choice> {
  const dlg = el.querySelector<HTMLDialogElement>('[data-entry-dialog]');
  if (!dlg || typeof dlg.showModal !== 'function') return Promise.resolve('quiet');
  el.dataset.state = 'ask';
  document.documentElement.setAttribute('data-entry-open', '');
  return new Promise((resolve) => {
    const done = (c: Choice) => {
      save(c);
      document.documentElement.removeAttribute('data-entry-open');
      dlg.removeEventListener('click', onClick);
      dlg.removeEventListener('cancel', onCancel);
      if (dlg.open) dlg.close();
      resolve(c);
    };
    const onClick = (e: Event) => {
      const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-entry-choice]');
      if (!btn) return;
      if (btn.dataset.entryChoice === 'immersive') {
        // EL gesto: el AudioContext nace aqui, en silencio; sube al revelar la escena
        startAmbient({ silent: true });
        done('immersive');
      } else {
        done('quiet');
      }
    };
    // Escape (y el gesto de volver en movil) = entrar sin sonido
    const onCancel = (e: Event) => {
      e.preventDefault();
      done('quiet');
    };
    dlg.addEventListener('click', onClick);
    dlg.addEventListener('cancel', onCancel);
    dlg.showModal();
  });
}

function fade(el: HTMLElement, ms: number): Promise<void> {
  const a = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
  return a.finished.then(
    () => undefined,
    () => undefined,
  );
}

function finish(el: HTMLElement): void {
  releaseEntry();
  el.dataset.state = 'done';
  el.hidden = true;
  el.getAnimations().forEach((a) => a.cancel());
  document.documentElement.removeAttribute('data-entry-open');
  syncToggles();
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

if (cover && cover.dataset.state !== 'done') {
  void main(cover).catch((err) => {
    console.error('[entry]', err);
    void introEnd();
    finish(cover);
  });
} else {
  bindToggles();
  syncToggles();
}

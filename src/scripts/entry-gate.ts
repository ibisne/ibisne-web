/**
 * Puerta entre la entrada (entry.ts) y la entrada en cascada de la UI (travel.ts, carga directa).
 * Mientras la entrada corre (pregunta + B que se arma), la UI de la pagina espera oculta
 * (html[data-entry-hold], estilos en Entry.astro) y travel.ts no lanza su cascada de arranque;
 * al abrirse el velo, entry.ts suelta la puerta y la UI entra a la vez que aparece la escena.
 */
let open: () => void = () => {};
const gate = new Promise<void>((r) => (open = r));
let held = false;

export function holdEntry(): void {
  held = true;
  document.documentElement.setAttribute('data-entry-hold', '');
}

const CHROME = '.hdr, .tabbar, #consent';

export function releaseEntry(): void {
  const root = document.documentElement;
  if (root.hasAttribute('data-entry-hold')) {
    root.removeAttribute('data-entry-hold');
    // header, barra y banner se encienden con un fundido (sin tocar sus propias transiciones)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const el of document.querySelectorAll<HTMLElement>(CHROME)) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      }
    }
  }
  open();
}

/** Corre fn ahora, o cuando la entrada suelte la UI */
export function afterEntry(fn: () => void): void {
  if (held) void gate.then(fn);
  else fn();
}

/**
 * Entrada de Contacto. Reusa la animacion de serie del motor para el fondo
 * (scale + blur desde el punto focal, y el evento b:assemble) y reemplaza solo
 * la de la interfaz: primero las 8 opciones en cascada y, con un leve retraso,
 * la columna izquierda. Con movimiento reducido, el motor hace un fundido.
 */
import type { TravelCtx } from './travel';

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const OPT_STAGGER_MS = 50;
const LEFT_STAGGER_MS = 45;
const LEFT_EXTRA_DELAY_MS = 120;
const UI_IN_MS = 520;

export function contactEnter(ctx: TravelCtx): Animation[] {
  // Fondo (y fundido reducido) de serie, sin la interfaz: esa la animamos aqui.
  const ui = ctx.ui;
  ctx.ui = [];
  let base: Animation[];
  try {
    base = ctx.defaults.enter();
  } finally {
    ctx.ui = ui;
  }
  if (ctx.reduced) return base;

  const start = ctx.direction === 'boot' ? 180 : 315; // mismo arranque que el motor: fondo ya a ~45 %
  const out = [...base];
  let optIndex = 0;
  let leftIndex = 0;

  for (const el of ui) {
    const isOpt = el.hasAttribute('data-opt');
    const delay = isOpt
      ? start + optIndex++ * OPT_STAGGER_MS
      : start + LEFT_EXTRA_DELAY_MS + leftIndex++ * LEFT_STAGGER_MS;
    const from = isOpt
      ? { opacity: 0, transform: 'translateY(14px) scale(0.98)' }
      : { opacity: 0, transform: 'translateY(12px)' };
    const to = { opacity: 1, transform: 'translateY(0) scale(1)' };
    out.push(el.animate([from, to], { duration: UI_IN_MS, delay, easing: EASE_OUT, fill: 'both' }));
  }
  return out;
}

/**
 * Musica ambiental del sitio.
 *
 * Si existe public/audio/ambient.mp3 (y opcional .ogg), se usa ese archivo en loop: Entry.astro lo
 * detecta AL COMPILAR y deja la ruta en [data-entry] (data-ambient-mp3 / data-ambient-ogg), asi que
 * nunca se pide un archivo que no existe. Solo se descarga con "Entrar con experiencia".
 * Si no hay archivo, respaldo generativo con Web Audio:
 *
 *   pads     3 voces x 2 osciladores desafinados -> paso bajo lento con LFO
 *   bajo     seno profundo con la fundamental del acorde, respira con el pulso
 *   pulso    ~80 BPM: latido grave y suave
 *   percusion tambor de barro (seno con caida de tono + golpe de ruido) y sonaja (ruido agudo
 *            con envolvente corta), lejanos: van casi enteros a la reverb
 *   glitch   rafagas cortas de ruido filtrado con bit-crush leve; se disparan con las rafagas
 *            del glitch visual del mundo (onGlitchFrame) o, sin mundo, cada 7-16 s
 *   acordes  progresion menor lenta (i - VI - iv - v, 4 compases cada uno)
 *   master   bus -> compresor -> volumen (MASTER_VOL) -> salida
 *
 * Politica de autoplay: el AudioContext SOLO se crea dentro de un gesto del usuario (start()
 * se llama desde el clic). Fundido de entrada de 2 s; fundido de salida al apagar o al ocultar
 * la pestana (y el contexto se suspende: costo cero).
 *
 * Archivo y generador comparten el master (compresor + volumen) y los fundidos.
 */
import { onGlitchFrame } from './world';

/** Ruta del archivo de musica que dejo el build, o null (generativo). MP3 primero (universal); el
 *  .ogg (Opus) solo si no hay MP3 y el navegador lo toca. */
export function ambientFile(): string | null {
  const d = document.querySelector<HTMLElement>('[data-entry]')?.dataset;
  if (!d) return null;
  const probe = document.createElement('audio');
  if (d.ambientMp3 && probe.canPlayType('audio/mpeg')) return d.ambientMp3;
  if (d.ambientOgg && probe.canPlayType('audio/ogg; codecs="opus"')) return d.ambientOgg;
  return null;
}

/** <audio> ya precargado por prepareAmbient (el motor con archivo lo reutiliza: una sola descarga) */
let fileEl: HTMLAudioElement | null = null;
function audioEl(src: string): HTMLAudioElement {
  if (!fileEl) {
    fileEl = new Audio();
    fileEl.preload = 'auto';
    fileEl.loop = true;
    fileEl.src = src;
  }
  return fileEl;
}

const MASTER_VOL = 0.3;
const FADE_IN_S = 2;
const FADE_OUT_S = 0.7;
const BPM = 80;
const BEAT = 60 / BPM;
const BARS_PER_CHORD = 4;
const LOOKAHEAD_S = 0.35;
const TICK_MS = 120;
const GLITCH_MIN_GAP_S = 1.4;

/** Acordes en MIDI (voz grave, media, alta) + raiz del bajo. La menor: Am - F - Dm - Em, voces comunes para que no salten */
const CHORDS: { pad: [number, number, number]; root: number }[] = [
  { pad: [57, 60, 64], root: 33 }, // Am  (A3 C4 E4) bajo A1
  { pad: [57, 60, 65], root: 29 }, // F   (A3 C4 F4) bajo F1
  { pad: [57, 62, 65], root: 38 }, // Dm  (A3 D4 F4) bajo D2
  { pad: [55, 59, 64], root: 40 }, // Em  (G3 B3 E4) bajo E2
];
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type State = 'off' | 'starting' | 'on' | 'paused';

/** Lo que la capa de control necesita de un motor (archivo o generativo) */
interface Engine {
  /** rampa lineal del volumen maestro hasta v en s segundos */
  fadeTo(v: number, s: number): void;
  level(): number;
  /** reanuda contexto y/o elemento (dentro de un gesto la primera vez) */
  resume(): void;
  /** pausa todo: costo cero */
  suspend(): void;
  ctxState(): string;
  time(): number;
  stop(): void;
  /** tick del secuenciador (solo generativo) */
  tick?(): void;
  glitch?(amp: number): void;
  el?: HTMLAudioElement;
}

let eng: Engine | null = null;
let state: State = 'off';
let timer = 0;
let wantOn = false;
let offFeed: (() => void) | null = null;
const listeners = new Set<(on: boolean) => void>();

/** Hay musica sonando (o arrancando) */
export function isAmbientOn(): boolean {
  return wantOn;
}

export function onAmbientChange(cb: (on: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit(): void {
  for (const cb of listeners) cb(wantOn);
}

/** Estado para diagnostico (pruebas) */
export function ambientStats(): { state: string; ctx: string; gain: number; time: number; file: boolean } {
  return {
    state,
    ctx: eng?.ctxState() ?? 'none',
    gain: eng?.level() ?? 0,
    time: eng?.time() ?? 0,
    file: !!eng?.el,
  };
}

/**
 * Prepara lo que no necesita gesto (para la barra de progreso de la entrada). Generativo: nada
 * que descargar. Con archivo: precarga hasta poder reproducir de corrido.
 */
export function prepareAmbient(): Promise<void> {
  const src = ambientFile();
  if (!src) return Promise.resolve();
  const a = audioEl(src);
  if (a.readyState >= 4) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    a.addEventListener('canplaythrough', done, { once: true });
    a.addEventListener('error', done, { once: true });
    window.setTimeout(done, 8000);
  });
}

/**
 * Enciende la musica. LLAMAR SOLO DESDE UN GESTO DEL USUARIO (clic, tecla): crea o reanuda el
 * audio. `silent` = arranca en volumen 0 y espera a fadeInAmbient() (la entrada lo llama al
 * revelar la escena).
 */
export function startAmbient(opts: { silent?: boolean } = {}): void {
  wantOn = true;
  emit();
  try {
    if (!eng) {
      const src = ambientFile();
      eng = src ? buildFile(src) : buildGenerative();
    }
  } catch (err) {
    console.warn('[ambient] audio no disponible', err);
    wantOn = false;
    emit();
    return;
  }
  bindLifecycle();
  state = 'starting';
  eng.resume();
  runScheduler();
  if (!opts.silent) fadeInAmbient();
}

export function fadeInAmbient(): void {
  if (!eng || !wantOn || document.hidden) return;
  eng.resume();
  eng.fadeTo(MASTER_VOL, FADE_IN_S);
  state = 'on';
  runScheduler();
}

/** Apaga con fundido y pausa (la preferencia la guarda quien llama). */
export function stopAmbient(): void {
  wantOn = false;
  emit();
  fadeOutAndSuspend();
}

function fadeOutAndSuspend(): void {
  if (!eng) return;
  const e = eng;
  e.fadeTo(0, FADE_OUT_S);
  state = 'paused';
  window.setTimeout(
    () => {
      if (wantOn && !document.hidden) return; // se volvio a encender durante el fundido
      window.clearInterval(timer);
      timer = 0;
      e.suspend();
    },
    FADE_OUT_S * 1000 + 80,
  );
}

let lifecycleBound = false;
function bindLifecycle(): void {
  if (lifecycleBound) return;
  lifecycleBound = true;
  document.addEventListener('visibilitychange', () => {
    if (!eng || !wantOn) return;
    if (document.hidden) fadeOutAndSuspend();
    else fadeInAmbient();
  });
  // rafagas del glitch visual -> textura glitch sincronizada (solo generativo)
  let prev = 0;
  offFeed = onGlitchFrame((f) => {
    if (!eng?.glitch) return;
    const g = f.travel > 0.2 ? 0 : f.global;
    if (g > 0.22 && prev <= 0.22) eng.glitch(g);
    prev = g;
  });
}

function runScheduler(): void {
  if (timer || !eng?.tick) return;
  eng.tick();
  timer = window.setInterval(() => eng?.tick?.(), TICK_MS);
}

/* ======================= motor con archivo ======================= */

function newContext(): AudioContext {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) throw new Error('sin AudioContext');
  return new AC({ latencyHint: 'playback' });
}

function masterChain(ctx: AudioContext, reverb: boolean): { master: GainNode; bus: GainNode; verb: GainNode } {
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 18;
  comp.ratio.value = 3;
  comp.attack.value = 0.02;
  comp.release.value = 0.4;
  const bus = ctx.createGain();
  bus.connect(comp);
  comp.connect(master);
  master.connect(ctx.destination);
  const verb = ctx.createGain();
  verb.gain.value = 0.9;
  if (!reverb) return { master, bus, verb };
  // reverb: respuesta al impulso generada (ruido estereo con caida exponencial, 2.6 s)
  const conv = ctx.createConvolver();
  conv.buffer = impulse(ctx, 2.6);
  const verbLp = ctx.createBiquadFilter();
  verbLp.type = 'lowpass';
  verbLp.frequency.value = 3200;
  verb.connect(conv);
  conv.connect(verbLp);
  verbLp.connect(bus);
  return { master, bus, verb };
}

/** Rampas sobre el GainNode maestro (Web Audio) */
function gainEngine(ctx: AudioContext, master: GainNode) {
  return {
    fadeTo(v: number, s: number) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(v, t + s);
    },
    level: () => master.gain.value,
    ctxState: () => ctx.state,
    time: () => ctx.currentTime,
  };
}

/**
 * Archivo en loop. Donde el volumen del <audio> se puede mover (escritorio, Android) se usa el
 * elemento solo: sin Web Audio no hay grafo que mantener (cero costo en el hilo principal y en
 * el de audio). En iOS el volumen es de solo lectura: ahi pasa por un GainNode para los fundidos.
 */
function buildFile(src: string): Engine {
  const el = audioEl(src);
  el.volume = 0.5;
  const volumeWorks = Math.abs(el.volume - 0.5) < 0.01;
  el.volume = 0;
  if (volumeWorks) {
    let raf = 0;
    let from = 0;
    let to = 0;
    let t0 = 0;
    let dur = 0;
    const step = () => {
      const k = dur > 0 ? Math.min(1, (performance.now() - t0) / (dur * 1000)) : 1;
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      raf = k < 1 ? window.setTimeout(step, 50) : 0;
    };
    return {
      el,
      fadeTo(v, s) {
        window.clearTimeout(raf);
        from = el.volume;
        to = v;
        t0 = performance.now();
        dur = s;
        step();
      },
      level: () => el.volume,
      resume() {
        if (el.paused) void el.play().catch(() => {});
      },
      suspend() {
        el.pause();
      },
      ctxState: () => (el.paused ? 'suspended' : 'running'),
      time: () => el.currentTime,
      stop() {
        el.pause();
      },
    };
  }
  el.volume = 1;
  const ctx = newContext();
  const { master, bus } = masterChain(ctx, false);
  ctx.createMediaElementSource(el).connect(bus);
  return {
    ...gainEngine(ctx, master),
    el,
    resume() {
      void ctx.resume();
      if (el.paused) void el.play().catch(() => {});
    },
    suspend() {
      el.pause();
      void ctx.suspend();
    },
    stop() {
      el.pause();
      void ctx.close();
    },
  };
}

/* ======================= motor generativo ======================= */

/** Ruido estereo con caida exponencial a -60 dB (barato: se genera dentro del clic) */
function impulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  const k = Math.pow(0.001, 1 / len);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let e = 1;
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * e;
      e *= k;
    }
  }
  return buf;
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Curva escalonada: cuantiza la amplitud (bit-crush leve) */
function crushCurve(steps: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const c = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.round(x * steps) / steps;
  }
  return c;
}

function buildGenerative(): Engine {
  const ctx = newContext();
  const { master, bus, verb } = masterChain(ctx, true);
  const noise = noiseBuffer(ctx, 2);
  const crush = crushCurve(6);
  const live: AudioScheduledSourceNode[] = [];

  /* ---- pads: 3 voces x 2 osciladores, paso bajo con LFO lento ---- */
  const padLp = ctx.createBiquadFilter();
  padLp.type = 'lowpass';
  padLp.frequency.value = 900;
  padLp.Q.value = 0.7;
  const padGain = ctx.createGain();
  padGain.gain.value = 0.16;
  padLp.connect(padGain);
  padGain.connect(bus);
  const padSend = ctx.createGain();
  padSend.gain.value = 0.55;
  padGain.connect(padSend);
  padSend.connect(verb);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoAmt = ctx.createGain();
  lfoAmt.gain.value = 480;
  lfo.connect(lfoAmt);
  lfoAmt.connect(padLp.frequency);
  lfo.start();
  live.push(lfo);

  const voices: OscillatorNode[][] = [];
  for (let v = 0; v < 3; v++) {
    const pan = ctx.createStereoPanner();
    pan.pan.value = (v - 1) * 0.45;
    pan.connect(padLp);
    const pair: OscillatorNode[] = [];
    for (let k = 0; k < 2; k++) {
      const o = ctx.createOscillator();
      o.type = k === 0 ? 'sawtooth' : 'triangle';
      o.detune.value = k === 0 ? -7 - v * 2 : 6 + v * 2;
      o.frequency.value = hz(CHORDS[0].pad[v]);
      const g = ctx.createGain();
      g.gain.value = k === 0 ? 0.32 : 0.5;
      o.connect(g);
      g.connect(pan);
      o.start();
      live.push(o);
      pair.push(o);
    }
    voices.push(pair);
  }

  /* ---- bajo profundo ---- */
  const bass = ctx.createOscillator();
  bass.type = 'sine';
  bass.frequency.value = hz(CHORDS[0].root);
  const bassGain = ctx.createGain();
  bassGain.gain.value = 0.0;
  bass.connect(bassGain);
  bassGain.connect(bus);
  bass.start();
  live.push(bass);

  /* ---- percusion lejana: filtro que la aleja + envio grande a la reverb ---- */
  const far = ctx.createBiquadFilter();
  far.type = 'lowpass';
  far.frequency.value = 2400;
  const farGain = ctx.createGain();
  farGain.gain.value = 0.35;
  far.connect(farGain);
  farGain.connect(bus);
  const farSend = ctx.createGain();
  farSend.gain.value = 0.9;
  far.connect(farSend);
  farSend.connect(verb);

  const noiseHit = (t: number, dur: number, type: BiquadFilterType, f: number, q: number, peak: number, dest: AudioNode, pan = 0): void => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const flt = ctx.createBiquadFilter();
    flt.type = type;
    flt.frequency.value = f;
    flt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(flt);
    flt.connect(g);
    g.connect(p);
    p.connect(dest);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.02);
  };

  /** latido grave del pulso */
  const pulse = (t: number, accent: boolean): void => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(78, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(accent ? 0.34 : 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + 0.45);
  };

  /** tambor de barro: cuerpo con caida de tono + golpe de ruido */
  const clay = (t: number, vel: number): void => {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    const f0 = 170 + Math.random() * 40;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.62, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5 * vel, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    const p = ctx.createStereoPanner();
    p.pan.value = -0.35 + Math.random() * 0.2;
    o.connect(g);
    g.connect(p);
    p.connect(far);
    o.start(t);
    o.stop(t + 0.3);
    noiseHit(t, 0.05, 'bandpass', 900, 1.2, 0.25 * vel, far, p.pan.value);
  };

  /** sonaja: ruido agudo con envolvente corta */
  const shaker = (t: number, vel: number): void => {
    noiseHit(t, 0.06 + Math.random() * 0.04, 'highpass', 6500, 0.8, 0.1 * vel, far, 0.4);
  };

  /** textura glitch: 2-4 ráfagas de ruido cuantizado y filtrado, 35-70 ms */
  const crusher = ctx.createWaveShaper();
  crusher.curve = crush;
  const glitchBp = ctx.createBiquadFilter();
  glitchBp.type = 'bandpass';
  glitchBp.Q.value = 6;
  const glitchGain = ctx.createGain();
  glitchGain.gain.value = 0.5;
  crusher.connect(glitchBp);
  glitchBp.connect(glitchGain);
  glitchGain.connect(bus);
  const glitchSend = ctx.createGain();
  glitchSend.gain.value = 0.35;
  glitchGain.connect(glitchSend);
  glitchSend.connect(verb);
  let lastGlitch = -Infinity;
  const glitch = (amp: number): void => {
    const now = ctx.currentTime;
    if (ctx.state !== 'running' || now - lastGlitch < GLITCH_MIN_GAP_S) return;
    lastGlitch = now;
    const n = 2 + Math.floor(Math.random() * 3);
    let t = now + 0.01;
    for (let i = 0; i < n; i++) {
      const dur = 0.035 + Math.random() * 0.035;
      glitchBp.frequency.setValueAtTime(1200 + Math.random() * 3200, t);
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const g = ctx.createGain();
      const peak = (0.05 + 0.07 * Math.min(1, amp)) * (Math.random() < 0.3 ? 0.3 : 1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.003);
      g.gain.setValueAtTime(peak, t + dur - 0.008);
      g.gain.linearRampToValueAtTime(0, t + dur);
      src.connect(g);
      g.connect(crusher);
      src.start(t, Math.random() * 1.8);
      src.stop(t + dur + 0.01);
      t += dur + Math.random() * 0.03;
    }
  };

  /* ---- secuenciador con anticipacion (lookahead) ---- */
  const t0 = ctx.currentTime + 0.1;
  let nextStep = 0; // semicorcheas desde t0
  const STEP = BEAT / 4;
  let chordIdx = -1;
  let autoGlitchAt = t0 + 7 + Math.random() * 9;

  const setChord = (i: number, t: number): void => {
    const c = CHORDS[i % CHORDS.length];
    voices.forEach((pair, v) => pair.forEach((o) => o.frequency.setTargetAtTime(hz(c.pad[v]), t, 0.6)));
    bass.frequency.setTargetAtTime(hz(c.root), t, 0.15);
  };

  const tick = (): void => {
    const horizon = ctx.currentTime + LOOKAHEAD_S;
    // si el contexto estuvo suspendido, no se recupera el tiempo perdido en rafaga
    const minStep = Math.ceil((ctx.currentTime - t0) / STEP);
    if (nextStep < minStep) nextStep = minStep;
    while (t0 + nextStep * STEP < horizon) {
      const t = t0 + nextStep * STEP;
      const s16 = nextStep % 16; // semicorchea dentro del compas
      const bar = Math.floor(nextStep / 16);
      const ci = Math.floor(bar / BARS_PER_CHORD);
      if (ci !== chordIdx && s16 === 0) {
        chordIdx = ci;
        setChord(ci, t);
      }
      // pulso: negras; acento en 1 y 3; el bajo respira con el
      if (s16 % 4 === 0) {
        pulse(t, s16 === 0 || s16 === 8);
        bassGain.gain.cancelScheduledValues(t);
        bassGain.gain.setTargetAtTime(s16 === 0 ? 0.3 : 0.24, t, 0.03);
        bassGain.gain.setTargetAtTime(0.12, t + 0.18, 0.35);
      }
      // tambor de barro lejano: patron ralo que cambia cada compas
      if ((s16 === 6 || s16 === 14) && Math.random() < 0.55) clay(t, 0.6 + Math.random() * 0.4);
      if (s16 === 10 && bar % 2 === 1 && Math.random() < 0.6) clay(t, 0.5);
      // sonaja: corcheas suaves, a veces semicorcheas
      if (s16 % 2 === 0 && Math.random() < 0.75) shaker(t, s16 % 4 === 2 ? 1 : 0.55);
      else if (Math.random() < 0.12) shaker(t, 0.35);
      nextStep++;
    }
    // sin mundo WebGL (estatico) la textura glitch llega sola de vez en cuando
    if (ctx.currentTime > autoGlitchAt) {
      autoGlitchAt = ctx.currentTime + 7 + Math.random() * 9;
      glitch(0.4);
    }
  };

  return {
    ...gainEngine(ctx, master),
    tick,
    glitch(amp: number) {
      glitch(amp);
      autoGlitchAt = ctx.currentTime + 7 + Math.random() * 9;
    },
    resume() {
      void ctx.resume();
    },
    suspend() {
      void ctx.suspend();
    },
    stop() {
      for (const n of live) n.stop();
      void ctx.close();
    },
  };
}

/** Solo pruebas: libera todo */
export function disposeAmbient(): void {
  window.clearInterval(timer);
  timer = 0;
  offFeed?.();
  offFeed = null;
  eng?.stop();
  eng = null;
  state = 'off';
  wantOn = false;
  lifecycleBound = false;
}

/* ===================================================================
   assets/quiz/ambient.js — Drone ambient generado en Web Audio API
   Sin archivos externos · Default OFF · Toggle via window.IBISNE_AUDIO
   =================================================================== */

window.IBISNE_AUDIO = (function(){
  let ctx, master, started = false, oscs = [];

  function init(){
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Low-pass filter sutil para textura
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    filter.Q.value = 0.6;
    master.disconnect();
    master.connect(filter);
    filter.connect(ctx.destination);

    // 3 osciladores en intervalo (acorde abierto sutil)
    const freqs = [110, 165, 220]; // A2, E3, A3 — drone abierto
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sawtooth' : 'sine';
      o.frequency.value = f;

      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.12 : 0.07;

      // LFO sutil para textura viva
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.04;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = i === 0 ? 0.4 : 0.25;
      lfo.connect(lfoGain).connect(g.gain);

      o.connect(g).connect(master);
      o.start();
      lfo.start();
      oscs.push({ o, g, lfo });
    });
  }

  function fadeTo(target, ms){
    if (!ctx) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + ms / 1000);
  }

  return {
    isOn(){ return started; },
    on(){
      init();
      if (!ctx) return false;
      if (ctx.state === 'suspended') ctx.resume();
      fadeTo(0.18, 1800);
      started = true;
      return true;
    },
    off(){
      if (!ctx) { started = false; return; }
      fadeTo(0, 600);
      started = false;
    },
    toggle(){ return this.isOn() ? (this.off(), false) : this.on(); },
  };
})();

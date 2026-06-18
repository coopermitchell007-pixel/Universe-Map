// ============================================================
// Ambient soundscape — generated live with WebAudio, one mood
// per scale level. No audio files; just oscillators and
// filtered noise. Off by default, toggled by the 🔊 button.
// ============================================================

const LEVEL_SOUND = [
  { freqs: [110, 164.8], noise: 0.05, bright: 900, shimmer: 0 },    // Earth — warm hum
  { freqs: [82.4, 123.5], noise: 0.04, bright: 700, shimmer: 0 },   // Solar — low drone
  { freqs: [55, 82.4], noise: 0.05, bright: 600, shimmer: 1318 },   // Galaxy — deep + shimmer
  { freqs: [41.2, 61.7], noise: 0.06, bright: 480, shimmer: 988 },  // Local Group
  { freqs: [32.7, 49], noise: 0.07, bright: 380, shimmer: 0 },      // Universe — abyssal
];

export function initSound(btn) {
  let ctx = null, master = null, voices = [], noiseGain = null, shimmerOsc = null, shimmerGain = null;
  let on = false, level = 0;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // two slow-detuning oscillators
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.22;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.05;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 1.2;
      lfo.connect(lfoG).connect(osc.detune);
      osc.connect(g).connect(master);
      osc.start(); lfo.start();
      voices.push({ osc, g });
    }

    // filtered noise bed (cosmic wind)
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(lp).connect(noiseGain).connect(master);
    noise.start();

    // faint high shimmer for the deep-space levels
    shimmerOsc = ctx.createOscillator();
    shimmerOsc.type = 'sine';
    shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0;
    const trem = ctx.createOscillator();
    trem.frequency.value = 0.21;
    const tremG = ctx.createGain();
    tremG.gain.value = 0.006;
    trem.connect(tremG).connect(shimmerGain.gain);
    shimmerOsc.connect(shimmerGain).connect(master);
    shimmerOsc.start(); trem.start();

    applyLevel(true);
  }

  function applyLevel(now = false) {
    if (!ctx) return;
    const cfg = LEVEL_SOUND[level] || LEVEL_SOUND[0];
    const t = ctx.currentTime, ramp = now ? 0.05 : 2.5;
    voices.forEach((v, i) => {
      v.osc.frequency.cancelScheduledValues(t);
      v.osc.frequency.setTargetAtTime(cfg.freqs[i], t, ramp);
    });
    noiseGain.gain.setTargetAtTime(cfg.noise, t, ramp);
    shimmerOsc.frequency.setTargetAtTime(cfg.shimmer || 1000, t, ramp);
    shimmerGain.gain.setTargetAtTime(cfg.shimmer ? 0.012 : 0, t, ramp);
  }

  btn.addEventListener('click', () => {
    on = !on;
    if (on && !ctx) build();
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.setTargetAtTime(on ? 0.11 : 0, ctx.currentTime, 0.8);
    }
    btn.textContent = on ? '🔊' : '🔇';
    btn.title = on ? 'Ambient sound on' : 'Ambient sound off';
  });

  return {
    setLevel(i) { level = i; if (on) applyLevel(); },
  };
}

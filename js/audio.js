// Electric-guitar sound: Karplus-Strong string + pickup comb filter + tube-style amp (drive) + speaker cabinet.
// No audio files needed. The AudioContext is created on the first click (browser rule).
// Same public API as before: Sound.note(midi, delay, velocity) and Sound.strum(midis, gap).
//
// Overdrive is switched live with Sound.setDrive(amount): 0 = clean, ~0.75 = rock overdrive.

const Sound = (() => {
  let ctx, bus, cleanG, driveG;
  let drive = 0;                                   // current overdrive amount (0 = clean)
  const cache = {};

  function peq(freq, q, gain) {
    const f = ctx.createBiquadFilter();
    f.type = 'peaking'; f.frequency.value = freq; f.Q.value = q; f.gain.value = gain;
    return f;
  }

  // Blend between the clean path and the distorted path (the WaveShaper curve itself is set once).
  function applyDrive() {
    if (!ctx) return;
    const t = ctx.currentTime;
    cleanG.gain.setTargetAtTime(1 - drive, t, 0.02);
    driveG.gain.setTargetAtTime(drive * 0.55, t, 0.02);
  }

  function setDrive(v) {
    drive = Math.max(0, Math.min(1, v));
    applyDrive();
  }

  function init() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      bus = ctx.createGain();
      bus.gain.value = 1;

      const hp = ctx.createBiquadFilter();            // tighten the low end before the "amp"
      hp.type = 'highpass'; hp.frequency.value = 85;

      // --- Amp: clean path + distorted path (gain -> soft-clipping tube-like waveshaper), blended by setDrive ---
      const pre = ctx.createGain();
      pre.gain.value = 6;
      const shaper = ctx.createWaveShaper();
      const k = 9, curve = new Float32Array(2048);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = Math.tanh(k * x + 0.15 * k * x * x) / Math.tanh(k) * 0.9;  // slight asymmetry = even harmonics
      }
      shaper.curve = curve;
      shaper.oversample = '4x';
      cleanG = ctx.createGain();
      driveG = ctx.createGain();
      cleanG.gain.value = 1 - drive;                   // start at the right blend (no click)
      driveG.gain.value = drive * 0.55;
      const post = ctx.createGain();
      post.gain.value = 0.85;
      applyDrive();

      // --- Speaker cabinet: no deep bass, mid push, rolled-off top ---
      const cabHp = ctx.createBiquadFilter();
      cabHp.type = 'highpass'; cabHp.frequency.value = 90;
      const lowMid = peq(220, 1.0, 2);
      const mid = peq(900, 0.9, 3);
      const bite = peq(2600, 1.1, 3);
      const notch = peq(5200, 2.0, -4);                // tames fizz
      const cabLp = ctx.createBiquadFilter();
      cabLp.type = 'lowpass'; cabLp.frequency.value = 5200; cabLp.Q.value = 0.7;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;

      const out = ctx.createGain();
      out.gain.value = 0.9;

      bus.connect(hp); hp.connect(cleanG); cleanG.connect(post);
      hp.connect(pre); pre.connect(shaper); shaper.connect(driveG); driveG.connect(post);
      post.connect(cabHp); cabHp.connect(lowMid); lowMid.connect(mid); mid.connect(bite);
      bite.connect(notch); notch.connect(cabLp); cabLp.connect(comp); comp.connect(out);
      out.connect(ctx.destination);

      // Short plate/spring-ish reverb (synthetic impulse response).
      const irLen = Math.floor(ctx.sampleRate * 1.1);
      const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        let s = 0;
        for (let i = 0; i < irLen; i++) {
          s += 0.5 * ((Math.random() * 2 - 1) - s);
          d[i] = s * Math.exp(-(i / ctx.sampleRate) * 5);
        }
      }
      const verb = ctx.createConvolver();
      verb.buffer = ir;
      const wet = ctx.createGain();
      wet.gain.value = 0.14;
      cabLp.connect(verb); verb.connect(wet); wet.connect(out);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // Build (and cache) one plucked-string sample for a MIDI note.
  function buffer(midi) {
    if (cache[midi]) return cache[midi];
    const sr = ctx.sampleRate;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    // Electric strings sustain longer than acoustic ones (and the amp keeps them singing).
    const t60 = Math.max(2.5, Math.min(6, 6 - (midi - 40) * 0.05));
    const len = Math.floor(sr * (t60 + 0.3));
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);

    const rho = 0.5;
    const target = sr / freq - (1 - rho);
    const N = Math.floor(target);
    const F = target - N;
    const a = (1 - F) / (1 + F);                       // all-pass = accurate tuning
    const g = Math.pow(10, -3 / (t60 * freq));

    // Pick attack: brighter than acoustic, picked close to the bridge (~11%) for a twangy attack.
    const raw = new Float32Array(N);
    for (let i = 0; i < N; i++) raw[i] = Math.random() * 2 - 1;
    const sm = new Float32Array(N);
    let s = 0;
    for (let i = 0; i < N; i++) { s += 0.8 * (raw[i] - s); sm[i] = s; }
    const kp = Math.max(1, Math.round(N * 0.11));
    const ex = new Float32Array(N);
    let mean = 0, peak = 0;
    for (let i = 0; i < N; i++) { ex[i] = sm[i] - sm[(i - kp + N) % N]; mean += ex[i]; }
    mean /= N;
    for (let i = 0; i < N; i++) { ex[i] -= mean; peak = Math.max(peak, Math.abs(ex[i])); }
    for (let i = 0; i <= N; i++) d[i] = ex[i % N] / (peak || 1);

    let apx = 0, apy = 0;
    for (let i = N + 1; i < len; i++) {
      const avg = g * (rho * d[i - N] + (1 - rho) * d[i - N - 1]);
      const o = a * avg + apx - a * apy;
      apx = avg; apy = o;
      d[i] = o;
    }

    // Pickup position: a magnetic pickup "hears" the string at one spot, which carves comb-filter
    // notches in the harmonics. ~22% of the string length = neck/middle pickup, round but defined.
    const kk = Math.max(1, Math.round((sr / freq) * 0.22));
    for (let i = len - 1; i >= kk; i--) d[i] = d[i] - 0.85 * d[i - kk];

    // Pick "tick" at the start.
    const clickLen = Math.floor(sr * 0.006);
    let prev = 0;
    for (let i = 0; i < clickLen; i++) {
      const n = Math.random() * 2 - 1;
      d[i] += (n - prev) * 0.1 * (1 - i / clickLen); prev = n;
    }

    // Normalize, then fade the tail.
    let pk = 0;
    for (let i = 0; i < len; i++) pk = Math.max(pk, Math.abs(d[i]));
    const norm = 0.9 / (pk || 1);
    for (let i = 0; i < len; i++) d[i] *= norm;
    const fade = Math.floor(sr * 0.3);
    for (let j = 0; j < fade; j++) d[len - 1 - j] *= j / fade;

    return (cache[midi] = buf);
  }

  function note(midi, delay = 0, velocity = 1, pan = 0) {
    init();
    noteAt(midi, ctx.currentTime + delay, velocity, pan);
  }

  // Same as note(), but at an exact AudioContext time. Used by the progression player's scheduler.
  function noteAt(midi, time, velocity = 1, pan = 0) {
    init();
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer(midi);
    g.gain.value = 0.5 * velocity;
    src.connect(g);
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p); p.connect(bus);
    } else {
      g.connect(bus);
    }
    src.start(time);
  }

  // Play several MIDI notes low to high. gap = seconds between notes (0.045 strum, 0.28 arpeggio).
  function strum(midis, gap) {
    init();
    const isStrum = gap < 0.12;
    const n = midis.length;
    midis.forEach((m, i) => {
      const jitter = (Math.random() - 0.5) * (isStrum ? 0.006 : 0.012);
      const vel = isStrum
        ? (1.0 - 0.15 * (i / Math.max(1, n - 1))) * (0.9 + Math.random() * 0.2)
        : 0.88 + Math.random() * 0.18;
      const pan = n > 1 ? (i / (n - 1) - 0.5) * 0.3 : 0;
      note(m, Math.max(0, i * gap + jitter), vel, pan);
    });
  }

  function now() { init(); return ctx.currentTime; }

  // A strum starting at an exact time, with the same small timing and volume variation as strum().
  function strumAt(midis, time, gap = 0.03, vel = 1) {
    const n = midis.length;
    midis.forEach((m, i) => noteAt(
      m,
      time + i * gap + (Math.random() - 0.5) * 0.006,
      vel * (1.0 - 0.15 * (i / Math.max(1, n - 1))) * (0.9 + Math.random() * 0.2),
      n > 1 ? (i / (n - 1) - 0.5) * 0.3 : 0));
  }

  // Metronome click at an exact time (accent = higher pitch). It skips the amp so overdrive never distorts it.
  function tick(time, accent) {
    init();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = accent ? 1600 : 1100;
    g.gain.setValueAtTime(accent ? 0.22 : 0.13, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    o.connect(g); g.connect(ctx.destination);
    o.start(time); o.stop(time + 0.06);
  }

  return { note, strum, setDrive, now, noteAt, strumAt, tick };
})();
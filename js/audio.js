// Plucked-string sound using the Karplus-Strong algorithm and the Web Audio API.
// No audio files needed. The AudioContext is created on the first click (browser rule).
const Sound = (() => {
  let ctx, master;
  const cache = {};

  function init() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.5;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 4500;
      master.connect(lp);
      lp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // Build (and cache) one second-and-a-half-ish plucked-string sample for a MIDI note.
  function buffer(midi) {
    if (cache[midi]) return cache[midi];
    const sr = ctx.sampleRate;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const n = Math.round(sr / freq);          // delay-line length sets the pitch
    const len = Math.floor(sr * 2.5);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;   // noise burst = the pluck
    for (let i = n; i < len; i++) d[i] = 0.5 * (d[i - n] + (d[i - n - 1] || 0)) * 0.997; // averaging = string decay
    const fade = Math.floor(sr * 0.4);        // avoid a click at the end
    for (let k = 0; k < fade; k++) d[len - 1 - k] *= k / fade;
    return (cache[midi] = buf);
  }

  function note(midi, delay = 0, velocity = 1) {
    init();
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer(midi);
    g.gain.value = 0.6 * velocity;
    src.connect(g);
    g.connect(master);
    src.start(ctx.currentTime + delay);
  }

  // Play several MIDI notes low to high. gap = seconds between notes (0.045 strum, 0.28 arpeggio).
  function strum(midis, gap) {
    init();
    midis.forEach((m, i) => note(m, i * gap, 0.8 + 0.2 * i / midis.length));
  }

  return { note, strum };
})();

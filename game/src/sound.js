// Suara sintetis WebAudio: denting, bunyi salah, dan musik latar lembut.
// Tanpa file suara apa pun; semua nada dibuat dari osilator.

let ctx = null;
let master = null;
let musicTimer = null;
let muted = false;
let chordStep = 0;

// Akor latar yang lembut (Am – F – C – G), sebagai frekuensi nada.
const CHORDS = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 261.63, 329.63],
  [196.0, 246.94, 293.66],
];

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
  return true;
}

/** Membangunkan konteks audio yang tertunda; kegagalan diabaikan. */
function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function note(freq, at, dur, type, vol, slideTo = null) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** Denting singkat saat perbedaan ditemukan: dua nada naik. */
export function chime() {
  if (!ensure()) return;
  resumeAudio();
  const t = ctx.currentTime;
  note(1318.5, t, 0.35, 'sine', 0.35);
  note(1760.0, t + 0.09, 0.45, 'sine', 0.3);
}

/** Bunyi rendah saat klik salah. */
export function buzz() {
  if (!ensure()) return;
  resumeAudio();
  const t = ctx.currentTime;
  note(140, t, 0.22, 'sawtooth', 0.16, 90);
}

/** Klik tombol biasa. */
export function blip() {
  if (!ensure()) return;
  resumeAudio();
  note(660, ctx.currentTime, 0.08, 'triangle', 0.18);
}

/** Arpeggio kecil saat babak selesai. */
export function fanfare() {
  if (!ensure()) return;
  resumeAudio();
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, t + i * 0.11, 0.4, 'triangle', 0.25));
}

function playChord() {
  if (!ctx || muted) return;
  const chord = CHORDS[chordStep % CHORDS.length];
  chordStep += 1;
  const t = ctx.currentTime;
  for (const f of chord) note(f, t, 7.5, 'sine', 0.05);
  // Petik pentatonik sesekali di atas akor.
  if (chordStep % 2 === 0) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0];
    const pick = scale[Math.floor(Math.random() * scale.length)];
    note(pick, t + 1.2, 1.4, 'triangle', 0.05);
  }
}

/** Memulai musik latar; aman dipanggil berulang. */
export function startMusic() {
  if (!ensure()) return;
  resumeAudio();
  if (musicTimer) return;
  playChord();
  musicTimer = window.setInterval(playChord, 4000);
}

/** Menghentikan musik latar. */
export function stopMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

/** Mengatur bisu; mengembalikan keadaan bisu yang baru. */
export function setMuted(value) {
  muted = value;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export function isMuted() {
  return muted;
}

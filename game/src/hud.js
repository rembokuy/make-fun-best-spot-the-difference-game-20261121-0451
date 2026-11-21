// Tampilan penghitung, waktu, dan skor (HUD) di atas area permainan.
// Semua angka ditulis ke elemen DOM; tidak ada yang digambar di kanvas.

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/**
 * Menyegarkan seluruh HUD dari keadaan permainan.
 * `state` berisi: level, levelName, score, best, found, total, hintsLeft,
 * timeLeft, muted, message.
 */
export function renderHud(state) {
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set('hud-level', state.levelName);
  set('hud-time', fmtTime(state.timeLeft));
  set('hud-score', String(state.score));
  set('hud-best', String(state.best));
  set('hud-remaining', `${state.remaining ?? state.total - state.found} tersisa`);
  set('hud-hints', `Petunjuk: ${state.hintsLeft}`);
  set('hud-message', state.message || '');
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = state.message || '';
  const timeEl = document.getElementById('hud-time');
  if (timeEl) timeEl.classList.toggle('urgent', state.timeLeft <= 30 && state.timeLeft > 0);
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) muteBtn.textContent = state.muted ? 'Suara: Mati (M)' : 'Suara: Hidup (M)';
}

/** Menggoyang area permainan sebentar saat klik salah. */
export function shakePanels() {
  const el = document.getElementById('panels');
  if (!el) return;
  el.classList.remove('shake');
  // Memaksa reflow agar animasi bisa diulang.
  void el.offsetWidth;
  el.classList.add('shake');
}

/** Menampilkan dan menyembunyikan layar-layar (judul, antar babak, akhir). */
export function showScreen(name) {
  for (const id of ['screen-title', 'screen-between', 'screen-end']) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== name);
  }
  const play = document.getElementById('play-area');
  if (play) play.classList.toggle('dimmed', name !== null);
}

export function hideScreens() {
  showScreen(null);
}

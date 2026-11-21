// Input mouse dan keyboard.
// Klik di kanvas diubah ke koordinat panel, lalu diserahkan ke game;
// tombol keyboard: H petunjuk, R ulang babak, 1/2/3 pindah babak, M bisu.

import { PANEL_W, PANEL_H } from './differences.js';

/** Koordinat panel (560x460) dari sebuah klik di kanvas, dijepit ke dalam panel. */
export function panelPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
  return {
    x: Math.max(0, Math.min(PANEL_W, x)),
    y: Math.max(0, Math.min(PANEL_H, y)),
  };
}

/**
 * Mengikat semua input ke `game`:
 * - klik di kedua kanvas panel → game.clickPanel(side, x, y)
 * - tombol → game.useHint(), game.restartLevel(), game.goLevel(n), game.toggleMute()
 * - layar judul / antar babak / akhir → game.start(), game.nextLevel(), game.backToTitle()
 */
export function bindInput(game) {
  const left = document.getElementById('panel-left');
  const right = document.getElementById('panel-right');
  if (left) {
    left.addEventListener('click', (event) => {
      const p = panelPoint(left, event);
      game.clickPanel('left', p.x, p.y);
    });
  }
  if (right) {
    right.addEventListener('click', (event) => {
      const p = panelPoint(right, event);
      game.clickPanel('right', p.x, p.y);
    });
  }

  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };
  on('btn-hint', () => game.useHint());
  on('btn-restart', () => game.restartLevel());
  on('btn-mute', () => game.toggleMute());
  on('btn-start', () => game.start());
  on('btn-next', () => game.nextLevel());
  on('btn-again', () => game.restartAll());
  on('btn-title', () => game.backToTitle());
  for (let i = 0; i < 3; i += 1) {
    on(`btn-level-${i + 1}`, () => game.goLevel(i));
  }

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') game.useHint();
    else if (key === 'r') game.restartLevel();
    else if (key === 'm') game.toggleMute();
    else if (key === '1' || key === '2' || key === '3') game.goLevel(Number(key) - 1);
    else if (key === 'enter' && game.screen === 'title') game.start();
  });
}

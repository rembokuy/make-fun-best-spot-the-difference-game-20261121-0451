// Boot dan loop utama Lantern Harbor.
// Memegang keadaan permainan (layar, babak, skor, waktu, temuan), menggambar
// kedua panel tiap frame, dan mengekspos pementasan lewat alamat:
//   ?level=0&found=lampion-hilang,jendela-gelap&still=1&hint=tali-putus
// `level` memilih babak awal, `found` menandai perbedaan yang sudah ditemukan,
// `still=1` membekukan waktu, `hint` menyorot satu perbedaan yang belum ketemu.

import { LEVELS, drawScene } from './levels.js';
import { PANEL_W, PANEL_H, diffsOf, diffAt, diffById, countRemaining } from './differences.js';
import { renderHud, shakePanels, showScreen, hideScreens } from './hud.js';
import { bindInput } from './input.js';
import { chime, buzz, blip, fanfare, startMusic, stopMusic, setMuted, isMuted } from './sound.js';

const BEST_KEY = 'lantern-harbor-best';
const HINTS_PER_LEVEL = 3;
const FOUND_POINTS = 100;
const WRONG_PENALTY = 25;

const game = {
  screen: 'title', // title | play | between | end
  level: 0,
  score: 0,
  best: 0,
  found: new Set(),
  hintsLeft: HINTS_PER_LEVEL,
  timeLeft: LEVELS[0].time,
  message: '',
  hinted: null,
  hintUntil: 0,
  still: false,
  lastTick: 0,
  levelScore: 0,
};

let leftCtx = null;
let rightCtx = null;

function loadBest() {
  try {
    game.best = Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    game.best = 0;
  }
}

function saveBest() {
  if (game.score <= game.best) return;
  game.best = game.score;
  try {
    window.localStorage.setItem(BEST_KEY, String(game.best));
  } catch {
    // Penyimpanan boleh gagal; skor terbaik cukup tampil di sesi ini.
  }
}

function modsFor(side) {
  // Panel kiri selalu gambar asli; panel kanan menerapkan semua perbedaan.
  return side === 'left' ? new Set() : new Set(diffsOf(game.level).map((d) => d.id));
}

function ringAt(ctx, d, side, now) {
  const x = side === 'right' && d.x2 !== undefined ? d.x2 : d.x;
  const y = side === 'right' && d.y2 !== undefined ? d.y2 : d.y;
  ctx.save();
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, d.r + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,217,74,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, d.r + 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPanels(now) {
  if (!leftCtx || !rightCtx) return;
  drawScene(leftCtx, game.level, modsFor('left'));
  drawScene(rightCtx, game.level, modsFor('right'));
  for (const id of game.found) {
    const d = diffById(game.level, id);
    if (!d) continue;
    ringAt(leftCtx, d, 'left', now);
    ringAt(rightCtx, d, 'right', now);
  }
  if (game.hinted && now < game.hintUntil) {
    const d = diffById(game.level, game.hinted);
    if (d) {
      const pulse = 1 + 0.12 * Math.sin(now / 160);
      for (const ctx of [leftCtx, rightCtx]) {
        const x = ctx === rightCtx && d.x2 !== undefined ? d.x2 : d.x;
        const y = ctx === rightCtx && d.y2 !== undefined ? d.y2 : d.y;
        ctx.save();
        ctx.strokeStyle = '#7ae0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, (d.r + 8) * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function hudState() {
  return {
    levelName: LEVELS[game.level].name,
    score: game.score,
    best: game.best,
    found: game.found.size,
    total: diffsOf(game.level).length,
    remaining: countRemaining(game.level, game.found),
    hintsLeft: game.hintsLeft,
    timeLeft: game.timeLeft,
    muted: isMuted(),
    message: game.message,
  };
}

function refresh() {
  renderHud(hudState());
}

function levelComplete() {
  const bonus = Math.round(game.timeLeft) * 2;
  game.score += bonus;
  game.levelScore = bonus;
  saveBest();
  fanfare();
  game.message = `Babak selesai! Bonus waktu +${bonus}.`;
  if (game.level >= LEVELS.length - 1) {
    game.screen = 'end';
    document.getElementById('end-title').textContent = 'Semua babak selesai!';
    document.getElementById('end-detail').textContent =
      `Skor akhir ${game.score} — terbaik ${game.best}. Waktu tersisa babak terakhir ${Math.round(game.timeLeft)} detik.`;
    showScreen('screen-end');
    stopMusic();
  } else {
    game.screen = 'between';
    document.getElementById('between-title').textContent = `${LEVELS[game.level].name} selesai!`;
    document.getElementById('between-detail').textContent =
      `Kamu menemukan ${diffsOf(game.level).length} perbedaan. Bonus waktu +${bonus}. Skor ${game.score}.`;
    showScreen('screen-between');
  }
  refresh();
}

function timeUp() {
  saveBest();
  game.screen = 'end';
  document.getElementById('end-title').textContent = 'Waktu habis!';
  document.getElementById('end-detail').textContent =
    `Di ${LEVELS[game.level].name} kamu menemukan ${game.found.size} dari ${diffsOf(game.level).length} perbedaan. Skor ${game.score} — terbaik ${game.best}.`;
  showScreen('screen-end');
  stopMusic();
  refresh();
}

function setupLevel(level, keepScore) {
  game.level = level;
  game.found = new Set();
  game.hintsLeft = HINTS_PER_LEVEL;
  game.timeLeft = LEVELS[level].time;
  game.hinted = null;
  game.message = LEVELS[level].mood;
  if (!keepScore) game.score = 0;
  game.screen = 'play';
  hideScreens();
  refresh();
}

game.start = () => {
  blip();
  startMusic();
  setupLevel(0, false);
};

game.nextLevel = () => {
  blip();
  setupLevel(game.level + 1, true);
};

game.restartAll = () => {
  blip();
  startMusic();
  setupLevel(0, false);
};

game.backToTitle = () => {
  blip();
  game.screen = 'title';
  showScreen('screen-title');
  refresh();
};

game.restartLevel = () => {
  if (game.screen !== 'play' && game.screen !== 'between' && game.screen !== 'end') return;
  blip();
  const keep = game.score;
  setupLevel(game.level, true);
  game.score = keep;
  refresh();
};

game.goLevel = (level) => {
  if (level < 0 || level >= LEVELS.length) return;
  blip();
  if (game.screen === 'title') startMusic();
  setupLevel(level, true);
};

game.toggleMute = () => {
  setMuted(!isMuted());
  refresh();
};

game.useHint = () => {
  if (game.screen !== 'play') return;
  if (game.hintsLeft <= 0) {
    game.message = 'Petunjuk habis untuk babak ini.';
    refresh();
    return;
  }
  const remaining = diffsOf(game.level).filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return;
  game.hintsLeft -= 1;
  game.hinted = remaining[0].id;
  game.hintUntil = performance.now() + 4000;
  game.message = `Petunjuk: ${remaining[0].label}.`;
  blip();
  refresh();
};

game.clickPanel = (side, x, y) => {
  if (game.screen !== 'play') return;
  const d = diffAt(game.level, x, y, game.found);
  if (d) {
    game.found.add(d.id);
    game.score += FOUND_POINTS;
    game.message = `Ketemu: ${d.label}! +${FOUND_POINTS}`;
    chime();
    refresh();
    if (game.found.size === diffsOf(game.level).length) levelComplete();
    return;
  }
  game.score = Math.max(0, game.score - WRONG_PENALTY);
  game.message = `Bukan itu — ${WRONG_PENALTY} poin.`;
  buzz();
  shakePanels();
  refresh();
};

function tick(now) {
  if (game.lastTick === 0) game.lastTick = now;
  const dt = Math.min(0.1, (now - game.lastTick) / 1000);
  game.lastTick = now;
  if (game.screen === 'play' && !game.still) {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      refresh();
      timeUp();
    } else {
      refresh();
    }
  }
  drawPanels(now);
  window.requestAnimationFrame(tick);
}

function stageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  // Tanpa parameter pementasan, tampilkan layar judul seperti biasa.
  if (!params.has('level') && !params.has('found') && !params.has('still') && !params.has('hint')) return false;
  const level = Number(params.get('level') ?? 0);
  if (!Number.isInteger(level) || level < 0 || level >= LEVELS.length) return false;
  const found = (params.get('found') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((id) => diffById(level, id));
  const hint = params.get('hint');
  game.still = params.get('still') === '1';
  setupLevel(level, false);
  game.score = found.length * FOUND_POINTS;
  for (const id of found) game.found.add(id);
  if (hint && diffById(level, hint) && !game.found.has(hint)) {
    game.hinted = hint;
    game.hintUntil = performance.now() + 60000;
  }
  startMusic();
  refresh();
  return true;
}

function boot() {
  const left = document.getElementById('panel-left');
  const right = document.getElementById('panel-right');
  leftCtx = left.getContext('2d');
  rightCtx = right.getContext('2d');
  loadBest();
  bindInput(game);
  const staged = stageFromUrl();
  if (!staged) {
    showScreen('screen-title');
    refresh();
  }
  window.requestAnimationFrame(tick);
}

// Dipakai play-test otomatis: keadaan permainan yang bisa dibaca dari luar.
window.__game = game;
window.__gameApi = {
  diffsOf,
  diffAt,
  levels: LEVELS,
};

boot();

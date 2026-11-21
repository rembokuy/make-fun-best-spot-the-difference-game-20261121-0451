// Definisi babak dan gambar tiap suasana, digambar tangan lewat kanvas.
// Setiap babak digambar dua kali: sekali tanpa perubahan (panel kiri) dan
// sekali dengan `mods` — himpunan id perbedaan yang diterapkan (panel kanan).
// Semua bentuk adalah vektor kanvas; tidak ada gambar, font, atau request luar.

import { PANEL_W, PANEL_H } from './differences.js';

export const LEVELS = [
  { name: 'Babak 1 — Dermaga Senja', mood: 'Matahari turun, lampion mulai menyala di dermaga.', time: 150 },
  { name: 'Babak 2 — Pasar Lampion', mood: 'Los pasar ramai, lampion warna-warni di atas kepala.', time: 150 },
  { name: 'Babak 3 — Feri Tengah Malam', mood: 'Feri bersandar di bawah cahaya mercusuar.', time: 180 },
];

// ------------------------------------------------------------------ pembantu

function sky(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, 300);
}

function disc(ctx, x, y, r, color, glow = null) {
  if (glow) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 22 * s, y + 3 * s, 24 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 24 * s, y + 4 * s, 20 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function sea(ctx, y0, top, deep, sparkle) {
  const g = ctx.createLinearGradient(0, y0, 0, PANEL_H);
  g.addColorStop(0, top);
  g.addColorStop(1, deep);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, PANEL_W, PANEL_H - y0);
  ctx.strokeStyle = sparkle;
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    const y = y0 + 14 + i * 20;
    const len = 26 + ((i * 37) % 60);
    const x = 30 + ((i * 173) % 440);
    ctx.globalAlpha = 0.5 - i * 0.04;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 3 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 3 * s, y - 7 * s, x + 9 * s, y);
  ctx.stroke();
}

function lantern(ctx, x, y, r, color, lit) {
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r - 6);
  ctx.lineTo(x, y - r);
  ctx.stroke();
  if (lit) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.72, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.4, r * 0.92, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f7c948';
  ctx.fillRect(x - 3, y - r - 4, 6, 4);
  ctx.fillRect(x - 3, y + r, 6, 4);
}

function pier(ctx, y, color, postColor) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, PANEL_W, 16);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let x = 14; x < PANEL_W; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 16);
    ctx.stroke();
  }
  ctx.fillStyle = postColor;
  for (const x of [30, 170, 310, 450, 530]) {
    ctx.fillRect(x - 5, y - 26, 10, 42);
    ctx.beginPath();
    ctx.arc(x, y - 26, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function boat(ctx, x, y, s, hull, cabin, flagColor, withFlag) {
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 62 * s, y);
  ctx.lineTo(x + 62 * s, y);
  ctx.lineTo(x + 44 * s, y + 20 * s);
  ctx.lineTo(x - 44 * s, y + 20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = cabin;
  ctx.fillRect(x - 30 * s, y - 22 * s, 60 * s, 22 * s);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(x - 20 * s, y - 16 * s, 12 * s, 10 * s);
  ctx.fillRect(x + 2 * s, y - 16 * s, 12 * s, 10 * s);
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(x, y - 22 * s);
  ctx.lineTo(x, y - 76 * s);
  ctx.stroke();
  if (withFlag) {
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    ctx.moveTo(x, y - 76 * s);
    ctx.lineTo(x + 26 * s, y - 68 * s);
    ctx.lineTo(x, y - 60 * s);
    ctx.closePath();
    ctx.fill();
  }
}

function building(ctx, x, y, w, h, color, litWindows, darkWindows = []) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#2c2118';
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + w / 2, y - 18);
  ctx.lineTo(x + w + 4, y);
  ctx.closePath();
  ctx.fill();
  for (const [wx, wy] of litWindows) {
    const dark = darkWindows.some(([dx, dy]) => dx === wx && dy === wy);
    ctx.fillStyle = dark ? '#1c2430' : '#ffd97a';
    ctx.fillRect(x + wx, y + wy, 12, 14);
  }
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 2, y);
  ctx.lineTo(x + r * 2, y);
  ctx.moveTo(x, y - r * 2);
  ctx.lineTo(x, y + r * 2);
  ctx.stroke();
}

// ------------------------------------------------------- babak 1: dermaga senja

function drawLevel0(ctx, mods) {
  sky(ctx, [[0, '#ff9a5c'], [0.55, '#e86a7a'], [1, '#5b3a6e']]);
  disc(ctx, 92, 128, 34, '#ffd97a', '#ff9a5c');
  cloud(ctx, 300, 80, 1, 'rgba(255,220,200,0.55)');
  cloud(ctx, 460, 140, 0.7, 'rgba(255,200,180,0.45)');
  bird(ctx, 180, 70, 1, '#3a2430');
  bird(ctx, 250, 110, 0.8, '#3a2430');
  if (mods.has('burung-pindah')) bird(ctx, 470, 122, 1, '#3a2430');
  else bird(ctx, 420, 92, 1, '#3a2430');

  // Deretan bangunan di seberang.
  building(ctx, 40, 190, 130, 62, '#4a3350', [[18, 14], [52, 14], [86, 14], [52, 34]], [[98, 18]]);
  building(ctx, 190, 176, 110, 76, '#3d2c48', [[16, 16], [50, 16], [16, 38]]);
  building(ctx, 320, 196, 150, 56, '#4a3350', [[20, 14], [60, 14], [100, 14]]);
  if (mods.has('jendela-gelap')) {
    ctx.fillStyle = '#1c2430';
    ctx.fillRect(40 + 98, 190 + 18, 12, 14);
  }

  sea(ctx, 252, '#c65f6e', '#2e2a55', '#ffd9a0');

  // Perahu dengan bendera.
  boat(ctx, 300, 300, 1, '#7a3b2e', '#f2e3c6', '#e84a4a', !mods.has('bendera-hilang'));

  // Pelampung.
  const buoy = mods.has('pelampung-pindah') ? [502, 352] : [472, 332];
  ctx.save();
  ctx.translate(buoy[0], buoy[1]);
  ctx.fillStyle = '#e84a4a';
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-13, -4, 26, 8);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(-2, -20, 4, 8);
  ctx.restore();

  // Dermaga dan tali.
  pier(ctx, 386, '#6b4a2f', '#4a3220');
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (mods.has('tali-putus')) {
    ctx.moveTo(30, 372);
    ctx.quadraticCurveTo(140, 398, 250, 374);
    ctx.moveTo(310, 374);
    ctx.quadraticCurveTo(420, 398, 530, 372);
  } else {
    ctx.moveTo(30, 372);
    ctx.quadraticCurveTo(280, 402, 530, 372);
  }
  ctx.stroke();

  // Untaian lampion di atas dermaga.
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 52);
  ctx.quadraticCurveTo(280, 92, 520, 52);
  ctx.stroke();
  const lampColors = ['#e84a4a', '#f7a832', '#e84a4a', '#f7a832', '#e84a4a', '#f7a832'];
  const lampXs = [80, 160, 240, 320, 400, 480];
  lampXs.forEach((x, i) => {
    if (i === 3 && mods.has('lampion-hilang')) return;
    lantern(ctx, x, 78, 13, lampColors[i], true);
  });
}

// ------------------------------------------------------- babak 2: pasar lampion

function drawLevel1(ctx, mods) {
  sky(ctx, [[0, '#7a4a8a'], [0.55, '#c65f7e'], [1, '#e88a5c']]);
  disc(ctx, 90, 72, 26, '#f5e6c8', '#e88a5c');
  cloud(ctx, 240, 60, 0.9, 'rgba(255,210,190,0.5)');
  cloud(ctx, 420, 110, 0.7, 'rgba(255,200,180,0.4)');

  // Bangunan pasar di latar.
  building(ctx, 270, 160, 120, 80, '#54344e', [[16, 16], [56, 16], [16, 40]], mods.has('jendela-pasar') ? [[40, 32]] : []);
  building(ctx, 410, 170, 110, 70, '#4a2e46', [[18, 14], [58, 14]]);
  if (mods.has('jendela-pasar')) {
    ctx.fillStyle = '#1c2430';
    ctx.fillRect(270 + 40, 160 + 32, 12, 14);
  }

  // Layang-layang di langit.
  if (!mods.has('layang-hilang')) {
    ctx.save();
    ctx.translate(482, 72);
    ctx.rotate(0.5);
    ctx.fillStyle = '#35c4b5';
    ctx.fillRect(-11, -11, 22, 22);
    ctx.strokeStyle = '#35c4b5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.lineTo(-8, 34);
    ctx.lineTo(6, 46);
    ctx.stroke();
    ctx.restore();
  }

  // Los kiri dengan tenda garis.
  ctx.fillStyle = '#8a5a3a';
  ctx.fillRect(60, 300, 200, 12);
  ctx.fillStyle = '#6b4426';
  ctx.fillRect(66, 312, 8, 60);
  ctx.fillRect(246, 312, 8, 60);
  for (let i = 0; i < 8; i += 1) {
    if (i === 4 && mods.has('tenda-garis')) continue;
    ctx.fillStyle = i % 2 === 0 ? '#e84a4a' : '#f5e6c8';
    ctx.fillRect(60 + i * 25, 228, 25, 34);
  }
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(60, 258, 200, 6);

  // Ikan di meja los kiri.
  const fishCount = mods.has('ikan-kurang') ? 2 : 3;
  for (let i = 0; i < fishCount; i += 1) {
    const fx = 110 + i * 44;
    ctx.fillStyle = '#9fc4d8';
    ctx.beginPath();
    ctx.ellipse(fx, 332, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx + 14, 332);
    ctx.lineTo(fx + 24, 326);
    ctx.lineTo(fx + 24, 338);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1c2430';
    ctx.beginPath();
    ctx.arc(fx - 8, 330, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Los kanan dan peti dengan kucing.
  ctx.fillStyle = '#8a5a3a';
  ctx.fillRect(330, 300, 190, 12);
  ctx.fillStyle = '#6b4426';
  ctx.fillRect(336, 312, 8, 60);
  ctx.fillRect(506, 312, 8, 60);
  for (let i = 0; i < 7; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#f7a832' : '#e84a4a';
    ctx.fillRect(330 + i * 27, 232, 27, 32);
  }
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(400, 340, 64, 32);
  ctx.strokeStyle = '#6b4426';
  ctx.lineWidth = 2;
  ctx.strokeRect(400, 340, 64, 32);
  if (!mods.has('kucing-hilang')) {
    ctx.fillStyle = '#2e2a26';
    ctx.beginPath();
    ctx.ellipse(432, 338, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(446, 330, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(440, 324);
    ctx.lineTo(442, 316);
    ctx.lineTo(446, 323);
    ctx.moveTo(448, 323);
    ctx.lineTo(451, 315);
    ctx.lineTo(453, 324);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(416, 340);
    ctx.quadraticCurveTo(404, 332, 408, 322);
    ctx.stroke();
  }

  // Tong kayu.
  if (!mods.has('tong-hilang')) {
    ctx.fillStyle = '#a8763e';
    ctx.beginPath();
    ctx.ellipse(92, 372, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(92, 362, 18, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(92, 382, 18, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Papan tanda gantung dengan simbol.
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 118);
  ctx.lineTo(300, 128);
  ctx.stroke();
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(272, 128, 56, 44);
  ctx.strokeStyle = '#8a5a3a';
  ctx.strokeRect(272, 128, 56, 44);
  if (mods.has('tanda-simbol')) {
    ctx.fillStyle = '#e84a4a';
    ctx.beginPath();
    ctx.moveTo(300, 138);
    ctx.lineTo(312, 162);
    ctx.lineTo(288, 162);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#e84a4a';
    ctx.beginPath();
    ctx.arc(300, 150, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  // Untaian lampion di atas pasar.
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 58);
  ctx.quadraticCurveTo(280, 96, 530, 58);
  ctx.stroke();
  const lampXs = [80, 140, 200, 260, 320, 380, 440, 500];
  const lampColors = ['#e84a4a', '#f7a832', '#e84a4a', '#f7a832', '#e84a4a', '#f7a832', '#e84a4a', '#f7a832'];
  lampXs.forEach((x, i) => {
    const color = i === 2 && mods.has('lampion-warna') ? '#35c4b5' : lampColors[i];
    lantern(ctx, x, 82, 12, color, true);
  });

  // Lantai pasar.
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(0, 372, PANEL_W, PANEL_H - 372);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  for (let x = 20; x < PANEL_W; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 372);
    ctx.lineTo(x, PANEL_H);
    ctx.stroke();
  }
}

// ------------------------------------------------- babak 3: feri tengah malam

function drawLevel2(ctx, mods) {
  sky(ctx, [[0, '#0d1b3a'], [0.6, '#1c2f5e'], [1, '#3a4a7a']]);
  if (!mods.has('bintang-hilang')) star(ctx, 120, 60, 3, '#ffe9a8');
  star(ctx, 200, 44, 2, '#fff');
  star(ctx, 340, 56, 2.5, '#fff');
  star(ctx, 430, 100, 2, '#fff');
  star(ctx, 90, 130, 2, '#fff');
  disc(ctx, 480, 55, 24, '#f5e6c8', '#c8d4f0');
  ctx.fillStyle = '#d8cdb2';
  ctx.beginPath();
  ctx.arc(472, 48, 5, 0, Math.PI * 2);
  ctx.arc(488, 62, 4, 0, Math.PI * 2);
  ctx.fill();
  bird(ctx, 180, 150, 0.9, '#0a1226');
  if (mods.has('burung-malam')) bird(ctx, 430, 112, 0.9, '#0a1226');
  else bird(ctx, 470, 80, 0.9, '#0a1226');

  // Mercusuar di kiri.
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath();
  ctx.moveTo(48, 300);
  ctx.lineTo(58, 140);
  ctx.lineTo(82, 140);
  ctx.lineTo(92, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(52, 250, 36, 18);
  ctx.fillRect(55, 190, 30, 18);
  ctx.fillStyle = '#2c2118';
  ctx.fillRect(54, 124, 32, 18);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(60, 128, 20, 10);
  const beamUp = !mods.has('mercusuar');
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.moveTo(70, 133);
  ctx.lineTo(500, beamUp ? 120 : 200);
  ctx.lineTo(500, beamUp ? 160 : 240);
  ctx.lineTo(70, 141);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  sea(ctx, 300, '#1c2f5e', '#0d1b3a', '#8aa4d8');

  // Feri besar.
  ctx.fillStyle = '#2e3a55';
  ctx.fillRect(180, 220, 260, 66);
  ctx.fillStyle = '#3d4c70';
  ctx.fillRect(200, 190, 200, 34);
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(200, 182, 200, 8);
  // Cerobong dan asap.
  ctx.fillStyle = '#1c2430';
  ctx.fillRect(238, 120, 24, 64);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(238, 120, 24, 10);
  if (!mods.has('asap-hilang')) {
    ctx.fillStyle = 'rgba(220,220,220,0.55)';
    ctx.beginPath();
    ctx.arc(250, 104, 12, 0, Math.PI * 2);
    ctx.arc(238, 88, 9, 0, Math.PI * 2);
    ctx.arc(262, 82, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  // Jendela feri.
  for (let i = 0; i < 6; i += 1) {
    const wx = 210 + i * 36;
    const dark = i === 3 && mods.has('cahaya-feri');
    ctx.fillStyle = dark ? '#101826' : '#ffd97a';
    ctx.fillRect(wx, 236, 20, 16);
  }
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = '#ffd97a';
    ctx.fillRect(216 + i * 44, 198, 18, 12);
  }
  // Bendera feri.
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 190);
  ctx.lineTo(300, 118);
  ctx.stroke();
  ctx.fillStyle = mods.has('bendera-feri') ? '#f7a832' : '#e84a4a';
  ctx.beginPath();
  ctx.moveTo(300, 118);
  ctx.lineTo(326, 126);
  ctx.lineTo(300, 134);
  ctx.closePath();
  ctx.fill();
  // Jangkar di lambung feri.
  if (!mods.has('jangkar-hilang')) {
    ctx.strokeStyle = '#c8ccd8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(400, 300, 9, 0, Math.PI);
    ctx.moveTo(400, 291);
    ctx.lineTo(400, 312);
    ctx.moveTo(391, 296);
    ctx.lineTo(409, 296);
    ctx.stroke();
  }
  // Gelombang di haluan.
  ctx.strokeStyle = 'rgba(200,220,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(170, 292);
  ctx.quadraticCurveTo(150, 300, 168, 308);
  ctx.stroke();

  // Dermaga depan.
  pier(ctx, 386, '#4a3423', '#33241a');
  // Ban pelampung di tiang.
  if (!mods.has('ban-hilang')) {
    ctx.strokeStyle = '#e84a4a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(90, 380, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(90, 380, 14, -0.6, 0.6);
    ctx.arc(90, 380, 14, Math.PI - 0.6, Math.PI + 0.6);
    ctx.stroke();
  }
  // Gulungan tali.
  if (!mods.has('tali-gulung')) {
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 395, 12, 0, Math.PI * 2);
    ctx.arc(150, 395, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Lampion di tiang dermaga.
  if (!mods.has('lampion-dermaga')) lantern(ctx, 520, 200, 12, '#e84a4a', true);
  ctx.fillStyle = '#33241a';
  ctx.fillRect(516, 212, 8, 174);
}

/** Menggambar babak `level` ke `ctx` (ukuran panel), dengan `mods` diterapkan. */
export function drawScene(ctx, level, mods) {
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  if (level === 0) drawLevel0(ctx, mods);
  else if (level === 1) drawLevel1(ctx, mods);
  else drawLevel2(ctx, mods);
}

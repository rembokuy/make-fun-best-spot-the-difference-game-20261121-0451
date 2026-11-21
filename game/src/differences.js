// Data perbedaan tiap babak dan uji kliknya.
// Satu perbedaan punya satu titik di panel kiri (x, y). Bila bendanya berpindah
// tempat di panel kanan, titik keduanya ada di (x2, y2): klik di kedua titik itu
// sama-sama benar. Radius r adalah jarak toleransi klik dalam piksel panel.

export const PANEL_W = 560;
export const PANEL_H = 460;

// Babak 0: Dermaga Senja — 6 perbedaan.
const LEVEL_0 = [
  { id: 'lampion-hilang', x: 320, y: 78, r: 26, label: 'Lampion hilang' },
  { id: 'jendela-gelap', x: 138, y: 208, r: 20, label: 'Jendela jadi gelap' },
  { id: 'tali-putus', x: 280, y: 392, r: 26, label: 'Tali dermaga putus' },
  { id: 'burung-pindah', x: 420, y: 92, r: 22, x2: 470, y2: 122, label: 'Burung berpindah' },
  { id: 'bendera-hilang', x: 330, y: 152, r: 22, label: 'Bendera perahu hilang' },
  { id: 'pelampung-pindah', x: 472, y: 332, r: 22, x2: 502, y2: 352, label: 'Pelampung bergeser' },
];

// Babak 1: Pasar Lampion — 8 perbedaan.
const LEVEL_1 = [
  { id: 'lampion-warna', x: 200, y: 82, r: 24, label: 'Warna lampion berubah' },
  { id: 'tenda-garis', x: 180, y: 248, r: 24, label: 'Garis tenda hilang' },
  { id: 'kucing-hilang', x: 432, y: 362, r: 22, label: 'Kucing di peti hilang' },
  { id: 'ikan-kurang', x: 150, y: 332, r: 22, label: 'Ikan di meja berkurang' },
  { id: 'tanda-simbol', x: 300, y: 150, r: 22, label: 'Simbol papan berubah' },
  { id: 'tong-hilang', x: 92, y: 372, r: 22, label: 'Tong kayu hilang' },
  { id: 'layang-hilang', x: 482, y: 72, r: 22, label: 'Layang-layang hilang' },
  { id: 'jendela-pasar', x: 310, y: 192, r: 18, label: 'Jendela pasar gelap' },
];

// Babak 2: Feri Tengah Malam — 10 perbedaan.
const LEVEL_2 = [
  { id: 'asap-hilang', x: 250, y: 90, r: 26, label: 'Asap cerobong hilang' },
  { id: 'cahaya-feri', x: 330, y: 200, r: 20, label: 'Lampu feri padam' },
  { id: 'ban-hilang', x: 90, y: 380, r: 22, label: 'Ban pelampung hilang' },
  { id: 'jangkar-hilang', x: 400, y: 300, r: 22, label: 'Jangkar feri hilang' },
  { id: 'burung-malam', x: 470, y: 80, r: 20, x2: 430, y2: 112, label: 'Burung malam pindah' },
  { id: 'tali-gulung', x: 150, y: 395, r: 22, label: 'Gulungan tali hilang' },
  { id: 'bintang-hilang', x: 120, y: 60, r: 16, label: 'Bintang hilang' },
  { id: 'mercusuar', x: 500, y: 120, r: 26, x2: 500, y2: 200, label: 'Sorot mercusuar berubah' },
  { id: 'bendera-feri', x: 300, y: 120, r: 20, label: 'Warna bendera feri berubah' },
  { id: 'lampion-dermaga', x: 520, y: 200, r: 20, label: 'Lampion tiang hilang' },
];

export const DIFFS = [LEVEL_0, LEVEL_1, LEVEL_2];

/** Daftar perbedaan babak `level` (0, 1 atau 2). */
export function diffsOf(level) {
  return DIFFS[level] ?? [];
}

/** Perbedaan dengan id `id` di babak `level`, atau null. */
export function diffById(level, id) {
  return diffsOf(level).find((d) => d.id === id) ?? null;
}

/** Berapa perbedaan babak `level` yang belum ada di `found`. */
export function countRemaining(level, found) {
  return diffsOf(level).filter((d) => !found || !found.has(d.id)).length;
}

function within(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Perbedaan yang kena klik di titik panel (x, y) pada babak `level`.
 * Mengembalikan perbedaan itu, atau null bila tidak ada yang kena. Bila
 * `found` diberikan, perbedaan yang sudah ditemukan tidak ikut dihitung.
 */
export function diffAt(level, x, y, found = null) {
  for (const d of diffsOf(level)) {
    if (found && found.has(d.id)) continue;
    if (within(x, y, d.x, d.y, d.r)) return d;
    if (d.x2 !== undefined && within(x, y, d.x2, d.y2, d.r)) return d;
  }
  return null;
}

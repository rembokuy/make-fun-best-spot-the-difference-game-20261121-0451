// Menyerahkan entri Lantern Harbor: menyalin game/ dan screenshots/ dari
// sebelah file ini ke direktori output, lalu menulis dossier.json dengan
// pustaka make.fun yang sudah divendor. Node 22, stdlib saja, tanpa build.
// Di luar kontainer grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repo, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repo, 'screenshots'))) {
  cpSync(join(repo, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Batas dari gate bounty ini: teks dossier paling banyak 163840 byte,
// paling banyak 4 tangkapan layar @ 256 KiB, game/ paling banyak 993 entri
// dan 48 MiB, dan tiap path di bawah game/ paling panjang 1000 byte.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Lantern Harbor diserahkan ke ${outDir}`);

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'output');
const LIMIT = 5 * 1024 * 1024;

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('usage: node optimize.mjs <name>...   (e.g. lab_main_mobile tempo_society_pc)');
  process.exit(1);
}

const fmtMB = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';

for (const name of targets) {
  const src = path.join(OUT, `${name}.png`);
  if (!fs.existsSync(src)) { console.error(`skip: ${name}.png not found`); continue; }
  const before = fs.statSync(src).size;

  const tmp = path.join(OUT, `${name}.opt.png`);
  await sharp(src)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false, effort: 10 })
    .toFile(tmp);
  const after = fs.statSync(tmp).size;

  if (after < before) {
    fs.renameSync(tmp, src);
    const status = after <= LIMIT ? 'UNDER 5MB' : 'still over';
    console.log(`OK  ${name}  ${fmtMB(before)} -> ${fmtMB(after)}  [${status}]`);
  } else {
    fs.unlinkSync(tmp);
    console.log(`--  ${name}  ${fmtMB(before)} (no gain, kept original)`);
  }
}

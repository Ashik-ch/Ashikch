import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Keep the source PNGs for future edits; only WebP variants ship to visitors.
let before = 0;
let after = 0;
const imageNames = ['1', '2', '3', '4', '5', '6', '7', 'gtec-mahe', 'mythili-manthra', 'hg-legal-services'];
for (const name of imageNames) {
  const source = new URL(`../src/assets/${name}.png`, import.meta.url);
  const destination = new URL(`../src/assets/${name}.webp`, import.meta.url);
  await sharp(fileURLToPath(source))
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(fileURLToPath(destination));
  before += (await stat(source)).size;
  after += (await stat(destination)).size;
}
console.log(`Project images: ${before} → ${after} bytes (${(100 * (1 - after / before)).toFixed(1)}% smaller)`);

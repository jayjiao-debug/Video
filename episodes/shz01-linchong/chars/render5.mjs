// node render5.mjs <outdir>: storyboard frames (each 1080x1920 PNG at half size) + one contact sheet
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
import { FRAMES } from './scenes.mjs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const only = process.argv[3] ? process.argv[3].split(',') : null;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 540, height: 960 } });
for (const fr of FRAMES) {
  if (only && !only.includes(fr.id)) continue;
  const svg = fr.make().replace('<svg ', '<svg width="540" height="960" ');
  await p.setContent(`<html><head><meta charset="utf-8"><style>body{margin:0;background:#000}</style></head><body>${svg}</body></html>`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${out}/${fr.id}.png`, clip: { x: 0, y: 0, width: 540, height: 960 } });
}
await b.close();
console.log('ok');

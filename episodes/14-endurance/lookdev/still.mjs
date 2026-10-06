// usage: node still.mjs <page.html> <outDir> t1 t2 ...
import { chromium } from 'playwright-core';
import fs from 'fs';
import { serve } from './serve.mjs';
const [, , page, outDir, ...ts] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
p.on('pageerror', e => console.error('PAGEERR', e.message));
p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await p.goto(`http://127.0.0.1:${PORT}/${page}`);
await p.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
console.log('info', JSON.stringify(await p.evaluate(() => window.INFO || null)));
for (const t of ts.map(Number)) {
  await p.evaluate(t => window.renderAt(t), t);
  await p.screenshot({ path: `${outDir}/t${String(t).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 85 });
}
await b.close(); SRV.close();

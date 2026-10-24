import {chromium} from 'playwright-core';
import {serve} from './serve.mjs';
import fs from 'fs';
process.chdir('/home/claude/video/episodes/43-qingming/film');
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
p.on('pageerror', (e) => console.error('PAGEERR', e.message));
await p.addInitScript(() => { window.ONLY = ['peak']; });
await p.goto(`http://127.0.0.1:${PORT}/film.html`); await p.waitForFunction(() => window.READY === true, null, {timeout: 900000});
const out = {};
for (const t of [130.38, 130.39, 130.45, 130.5]) out[t] = await p.evaluate((x) => window.DBG29(x), t);
console.log(JSON.stringify(out));
for (const t of [130.38, 124.3, 129.3]) { await p.evaluate((x) => window.renderAt(x), t); await p.screenshot({path: `${process.argv[2]}/m${t}.jpg`, type: 'jpeg', quality: 90}); }
await b.close(); SRV.close();

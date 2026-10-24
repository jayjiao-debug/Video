// node tools/contact_check.mjs [from] [to] [fps]  — runs the film with NODRAW + CHECK, every frame in [from,to) at fps,
// and reports hand/foot contact failures (hands > 4 px from target, stance foot > 3 px off the ground, sinking feet,
// limb lengths off by > 3 % where legs show). Exit code 1 on any failure.
import {chromium} from 'playwright-core'; import {serve} from '../serve.mjs';
const [from = '0', to = '184.3', fps = '30'] = process.argv.slice(2);
const SRV = await serve(); const PORT = SRV.address().port;
const b = await chromium.launch({executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
p.on('pageerror', (e) => console.error('PAGEERR', e.message));
await p.addInitScript(() => { window.NODRAW = true; window.CHECK = true; });
await p.goto(`http://127.0.0.1:${PORT}/film.html`); await p.waitForFunction(() => window.READY === true, null, {timeout: 900000});
const n = Math.round((+to - +from) * +fps);
await p.evaluate(([f0, n, fps]) => { for (let i = 0; i < n; i++) { const t = f0 + i / fps; window.CHECKT?.(t); window.renderAt(t); } }, [+from, n, +fps]);
const fails = await p.evaluate(() => window.CONTACTS);
const worst = {}; for (const f of fails) { const k = `${f.who} · ${f.what}`; if (!worst[k] || f.err > worst[k].err) worst[k] = f; }
const keys = Object.keys(worst);
console.log(keys.length ? 'FAIL' : 'PASS', `${n} frames ${from}–${to}s`);
for (const k of keys) console.log(`  ${k}: worst ${worst[k].err} at t=${worst[k].t.toFixed(2)} (${fails.filter((f) => `${f.who} · ${f.what}` === k).length} frames)`);
await b.close(); SRV.close(); process.exit(keys.length ? 1 : 0);

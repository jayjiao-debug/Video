// ep45 proof renderer: page → window.renderAt(t, scene) → screenshot, in N parallel browsers. Writes f%05d.png (frame index =
// round(t * fps)) and meta.jsonl (camera + events per frame) into OUT (keep OUT on /dev/shm).
// usage: node render.mjs HTML SCENE T0 T1 OUT [workers=2] [--frames=a,b,c] [--type=png|jpeg]
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
const [, , html, scene, T0, T1, out, W = '2', ...rest] = process.argv;
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const FPS = 30; fs.mkdirSync(out, {recursive: true});
let frames = [];
if (opt.frames) frames = opt.frames.split(',').map(Number);
else for (let i = Math.round(+T0 * FPS); i < Math.round(+T1 * FPS); i++) frames.push(i);
const nw = Math.min(+W, frames.length), type = opt.type ?? 'png';
const metaAll = {};
const t0 = Date.now();
await Promise.all(Array.from({length: nw}, async (_, w) => {
	const b = await chromium.launch();
	const p = await b.newPage({viewport: {width: 1920, height: 1080}});
	p.on('pageerror', (e) => console.error('PAGEERR', e.message));
	p.on('console', (m) => { if (m.type() === 'error') console.log('LOG', m.text().slice(0, 300)); });
	await p.goto('file://' + html); await p.waitForFunction(() => window.READY === true);
	await p.evaluate(() => document.fonts.ready);
	const mine = frames.filter((_, k) => Math.floor(k * nw / frames.length) === w);
	for (const i of mine) {
		const meta = await p.evaluate(([t, s]) => window.renderAt(t, s), [i / FPS, scene]);
		await p.evaluate(() => document.fonts.ready);
		await p.screenshot({path: `${out}/f${String(i).padStart(5, '0')}.${type === 'png' ? 'png' : 'jpg'}`, type, ...(type === 'jpeg' ? {quality: 95} : {})});
		metaAll[i] = meta;
	}
	await b.close();
}));
fs.writeFileSync(`${out}/meta.json`, JSON.stringify(metaAll));
console.log(`${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s (${Math.round((Date.now() - t0) / frames.length)} ms/frame)`);

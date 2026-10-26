// Look demo (≈32 s, 1920×1080, 30 fps): mother's heartbeat → the first drum on the record → BPM speeds up.
// Every frame comes from demo_score.json (same clock as the audio). node demo.mjs <framesDir> [stillTimes...]
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import { W, H, INK, F, P, defs, finish, record, caption, chapter } from './lib.mjs';
const S = JSON.parse(fs.readFileSync(new URL('./demo_score.json', import.meta.url)));
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const fade = (t, a, d = .35) => ease((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const ph = (t) => { const i = clamp(Math.floor(t * 120), 0, S.ph.length - 2), [t0, p0, b0] = S.ph[i], [t1, p1, b1] = S.ph[i + 1], k = (t - t0) / (t1 - t0); return [lerp(p0, p1, k), lerp(b0, b1, k)]; };
const last = (inst, t, pred = () => true) => { let h = null; for (const x of S.hits) if (x.inst === inst && x.t <= t + 1e-6 && pred(x)) h = x; return h; };
const flash = (h, t, d = .32) => h ? clamp(1 - (t - h.t) / d) : 0;
const B = S.beats, TREC = B[S.REC], TX0 = TREC - 1.0;         // transition womb → record
const HC = [1200, 380];                                          // the heart point

function womb(t) {
	let s = `<rect width="${W}" height="${H}" fill="#1a0f22"/><circle cx="1150" cy="560" r="620" fill="#4a1238" opacity=".55" filter="url(#soft)"/>`;
	// a ripple leaves the heart on every beat and spreads out (they become the record's grooves)
	for (const h of S.hits) if (h.inst === 'heart' && h.t <= t && t - h.t < 4) { const a = (t - h.t) / 4, r = 40 + 900 * (1 - (1 - a) ** 2);
		s += `<circle cx="${HC[0]}" cy="${HC[1]}" r="${r}" fill="none" stroke="${INK.kick}" stroke-width="${7 * (1 - a) + 1}" opacity="${.6 * (1 - a)}"/>`; }
	const hb = last('heart', t), f1 = flash(hb, t, .25), f2 = hb ? clamp(1 - (t - hb.t - .27) / .25) * (t >= hb.t + .27) : 0, f = Math.max(f1, .6 * f2);
	s += `<path fill="#0d0814" d="M1262 1080 L1262 900 C1268 820 1286 760 1290 700 C1296 640 1290 590 1272 540 C1262 505 1262 470 1270 430 C1278 390 1282 350 1272 318 C1262 286 1246 270 1236 252
		C1258 248 1270 232 1274 210 C1280 176 1276 140 1252 118 C1226 94 1186 92 1160 110 C1136 126 1126 156 1130 180 C1118 192 1110 204 1114 210 C1120 214 1128 212 1132 214 C1130 226 1134 236 1132 244 C1140 250 1150 252 1162 252
		C1166 266 1168 280 1164 296 C1150 320 1136 344 1128 372 C1120 404 1116 432 1112 452 C1080 476 1050 516 1036 566 C1022 616 1028 668 1056 708 C1080 742 1118 760 1160 766 C1150 830 1140 920 1136 1080 Z"/>
		<circle cx="1262" cy="128" r="46" fill="#0d0814"/>
		<path fill="none" stroke="#0d0814" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" d="M1230 330 C1236 420 1226 520 1180 610 C1150 660 1110 690 1070 700"/>`;
	s += `<clipPath id="belly"><path d="M1112 452 C1080 476 1050 516 1036 566 C1022 616 1028 668 1056 708 C1080 742 1118 760 1160 766 L1250 760 L1268 470Z"/></clipPath>
		<g clip-path="url(#belly)"><circle cx="1130" cy="610" r="${150 + 14 * f}" fill="${INK.kick}" opacity="${.45 + .25 * f}" filter="url(#glow)"/>
		<path fill="#3a1030" opacity=".8" d="M1110 560 C1140 548 1176 566 1182 604 C1188 646 1160 680 1120 680 C1088 680 1068 656 1074 628 C1080 604 1100 600 1110 612 C1118 622 1112 636 1104 640"/>
		<circle cx="1112" cy="578" r="30" fill="#3a1030" opacity=".8"/></g>`;
	s += `<circle cx="${HC[0]}" cy="${HC[1]}" r="${30 + 26 * f}" fill="${INK.kick}" opacity="${.5 + .45 * f}" filter="url(#glow)"/><circle cx="${HC[0]}" cy="${HC[1]}" r="${11 + 5 * f}" fill="#fff"/>`;
	if (hb) { const a = clamp((t - hb.t) / .6); s += `<text x="1340" y="${350 - 20 * a}" ${F} font-size="54" font-weight="900" fill="${INK.kick}" opacity="${1 - a}" transform="rotate(8 1340 350)">咚</text>`;
		const b = clamp((t - hb.t - .27) / .6); if (t > hb.t + .27) s += `<text x="1410" y="${422 - 20 * b}" ${F} font-size="40" font-weight="900" fill="${INK.kick}" opacity="${.8 * (1 - b)}" transform="rotate(8 1410 422)">咚</text>`; }
	s += `<g opacity="${fade(t, .1)}"><text x="140" y="470" ${F} font-size="46" font-weight="700" fill="#fff" opacity=".75">你听过的第一首歌，</text></g>`;
	const k2 = fade(t, .9, .25); s += `<g opacity="${k2}" transform="translate(${140} 580) scale(${1 + .06 * (1 - k2)}) translate(-140 -580)"><text x="140" y="580" ${F} font-size="96" font-weight="900" fill="#fff">是<tspan fill="${INK.kick}">妈妈的心跳</tspan></text></g>`;
	s += `<text x="140" y="660" ${F} font-size="34" font-weight="500" fill="#fff" opacity="${.55 * fade(t, 1.8)}">只有一个鼓，一直在打</text>`;
	return s;
}

function lesson(t, bg = true) {
	const [p0, bpm] = ph(t), p = p0 - S.REC, rot = p * 90;                          // one turn = one bar (4 beats), clockwise
	let s = bg ? `<rect width="${W}" height="${H}" fill="${INK.ink}"/>` : '';
	s += `<g opacity="${fade(t, TREC + .2)}">${chapter('01', '速度')}</g>`;
	const ramp = t > S.T1 - .9;
	s += `<g opacity="${fade(t, TREC + .4) * (1 - fade(t, S.T1 - .9, .3))}">${caption(['一分钟打几下，就叫 ', { k: 'BPM' }])}</g>`;
	if (ramp) s += `<g opacity="${fade(t, S.T1 - .6)}">${caption(['转得越快，', { k: 'BPM' }, ' 越大'])}</g>`;
	// kick ring: beat k sits at position (4 - k) % 4; dots appear the first time they are hit, the shape draws itself
	const kpos = [0, 3, 2, 1], nk = S.hits.filter((h) => h.inst === 'kick' && h.t <= t + 1e-6).length;
	const fl = {}; for (let k = 0; k < 4; k++) fl[kpos[k]] = flash(last('kick', t, (h) => (h.k - S.REC) % 4 === k), t);
	const rings = [{ f: .82, n: 4, hits: kpos, vis: Math.min(4, nk), tail: true, col: INK.kick, shape: true, size: .06, flash: fl,
		lab: { 0: '1', 3: '2', 2: '3', 1: '4' }, name: nk ? '底鼓' : '', nameDy: -40 }];
	const hatOn = t > B[S.HAT] - .9;
	if (hatOn) { const hf = {}; for (let p8 = 0; p8 < 8; p8++) { const e = (8 - p8) % 8; hf[p8] = flash(last('hat', t, (h) => ((h.k - 2 * S.REC) % 8 + 8) % 8 === e), t, .2); }
		const cf = {}; for (const k of [1, 3]) cf[kpos[k]] = flash(last('clap', t, (h) => (h.k - S.REC) % 4 === k), t);
		rings.push({ f: .7, n: 4, hits: [3, 1], col: INK.snare, size: .05, flash: cf, name: '拍手', nameDy: 10, nameSize: 36 });
		rings.push({ f: .58, n: 8, hits: [...Array(8).keys()], col: INK.hat, size: .035, flash: hf, name: '镲', nameDy: 70, nameSize: 36 }); }
	const R = 330, cx = 760, cy = 560;
	s += `<g opacity="${hatOn ? 1 : 1}">${record({ cx, cy, R, rot, rings, label: { t: `${Math.round(bpm)}`, sub: 'BPM' } })}</g>`;
	if (hatOn) s += `<g opacity="${1 - fade(t, B[S.HAT] - .9, .5)}"><circle cx="${cx}" cy="${cy}" r="${R * .58}" fill="none" stroke="${INK.hat}" stroke-width="10" opacity=".5"/></g>`;
	// the same beats as a straight strip under the record (a second, linear reading)
	const sw = 120, gap = 16, sx0 = cx - (4 * sw + 3 * gap) / 2, sy = 960, kb = Math.floor(p + 1e-6) % 4;
	for (let k = 0; k < 4; k++) { const now = k === kb && t >= TREC, x = sx0 + k * (sw + gap), a = now ? fl[kpos[k]] : 0, seen = k < nk || nk >= 4;
		s += `<rect x="${x}" y="${sy}" width="${sw}" height="60" rx="12" fill="${seen ? INK.kick : INK.dim}" opacity="${seen ? .35 + .65 * (now ? 1 : 0) : 1}" ${now ? `stroke="#fff" stroke-width="${2 + 4 * a}"` : ''}/>
		<text x="${x + sw / 2}" y="${sy + 43}" text-anchor="middle" ${F} font-size="34" font-weight="900" fill="${now ? '#fff' : INK.ink}">${k + 1}</text>`;
		if (hatOn) for (const hh of [0, 1]) { const hk = last('hat', t, (h) => ((h.k - 2 * S.REC) % 8 + 8) % 8 === 2 * k + hh), ha = flash(hk, t, .2);
			s += `<rect x="${x + 22 + hh * 58}" y="${sy - 26}" width="18" height="14" rx="4" fill="${INK.hat}" opacity="${.35 + .65 * ha}"/>`; } }
	// right column: the tempo slider and the clap prompt
	const x0 = 1340, x1 = 1760, y = 470, lo = 50, span = 150, ks = fade(t, TREC + .6);
	s += `<g opacity="${ks}"><text x="${x0}" y="${y - 70}" ${F} font-size="30" font-weight="700" fill="#fff" opacity=".6">这张唱片现在的速度</text>
		<rect x="${x0}" y="${y - 6}" width="${x1 - x0}" height="12" rx="6" fill="${INK.dim}"/><rect x="${x0}" y="${y - 6}" width="${(bpm - lo) / span * (x1 - x0)}" height="12" rx="6" fill="${INK.kick}"/>
		<circle cx="${x0 + (bpm - lo) / span * (x1 - x0)}" cy="${y}" r="22" fill="#fff"/>`;
	[[72, '心跳'], [120, '快走'], [170, '跑步']].forEach(([b, n]) => { const x = x0 + (b - lo) / span * (x1 - x0), hit = Math.abs(bpm - b) < 2;
		s += `<line x1="${x}" y1="${y + 24}" x2="${x}" y2="${y + 44}" stroke="#fff" opacity=".4" stroke-width="3"/><text x="${x}" y="${y + 86}" text-anchor="middle" ${F} font-size="30" font-weight="900" fill="${hit ? INK.kick : '#fff'}" opacity="${hit ? 1 : .55}">${b}</text>
		<text x="${x}" y="${y + 124}" text-anchor="middle" ${F} font-size="26" fill="#fff" opacity="${hit ? .9 : .45}">${n}</text>`; });
	s += `</g>`;
	const kp = fade(t, B[S.REC + 4] - .3);
	s += `<g opacity="${kp}"><rect x="1340" y="720" width="420" height="96" rx="48" fill="none" stroke="${INK.kick}" stroke-width="4"/>
		<text x="1550" y="782" text-anchor="middle" ${F} font-size="42" font-weight="900" fill="#fff">跟着拍：${[0, 1, 2, 3].map((k) => `<tspan fill="${k === kb ? INK.kick : '#fff'}" opacity="${k === kb ? 1 : .5}">${k + 1}</tspan>`).join(' ')}</text></g>`;
	return s;
}

function frame(t) {
	let s = '';
	if (t < TREC) s += womb(t);
	if (t > TX0) {   // the heart point flies to 12 o'clock and the record opens around it
		const e = ease((t - TX0) / (TREC - TX0)), sc = lerp(.12, 1, e), cx = 760, cy = 560, R = 330;
		const tx = lerp(HC[0], cx, e), ty = lerp(HC[1] + R * .82 * sc, cy, e);   // keep the beat-1 dot near the heart while small
		s += `<rect width="${W}" height="${H}" fill="${INK.ink}" opacity="${e}"/>`;
		s += `<g opacity="${clamp(e * 1.6)}" transform="translate(${tx - cx * sc} ${ty - cy * sc}) scale(${sc})">${lesson(t, false)}</g>`;
	}
	s += `<rect width="${W}" height="${H}" fill="#000" opacity="${clamp((t - (S.END - .9)) / .9)}"/>`;
	return finish(s);
}

const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<html><body style="margin:0;background:#000"><svg id="v" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<g id="art"></g></svg></body></html>`);
const stills = process.argv.slice(3).map(Number), FPS = 30, N = Math.ceil(S.END * FPS);
const list = stills.length ? stills.map((t) => [t, `still_${t.toFixed(2)}.jpg`]) : [...Array(N).keys()].map((i) => [i / FPS, `f${String(i).padStart(5, '0')}.jpg`]);
for (const [t, name] of list) { await page.evaluate((x) => { document.getElementById('art').innerHTML = x; }, frame(t)); await page.screenshot({ path: `${OUT}/${name}`, type: 'jpeg', quality: 92 }); }
await browser.close(); console.log('frames', list.length);

// 喵喵乐队 30 s test: the heartbeat hook and the BPM cats, drawn from score.json (same numbers as the sound).
// node film.mjs <workdir>   (needs <workdir>/score.json from score.py) → <workdir>/frames/f0000.png …
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import { W, H, L, setLook, cat as flatCat, defs, background, T, subtitle, bpmBadge, ol } from '../look/parade.mjs';
import { handCat, handDefs, paper } from '../look/handcat.mjs';
// HAND=crayon|watercolor|marker draws the hand-drawn cats (lines boil 8 times a second); unset = the flat pastel cats
const HAND = process.env.HAND || null;
const HANDCAST = { yellow: { coat: 'ginger', mark: 'tabby', bow: '#E8746C' }, blue: { coat: 'grey', mark: 'patch', bow: '#7FA8E8' }, pink: { coat: 'cream', mark: 'none', bow: '#F49AB8' } };
let SEED = 0;
function cat(x, y, s, o) {
	if (!HAND) return flatCat(x, y, s, o);
	const k = HANDCAST[o.fur] || HANDCAST.yellow;
	return handCat(x, y, s * 0.92, { ...o, ...k, seed: SEED++ });
}

const WD = process.argv[2]; const SC = JSON.parse(fs.readFileSync(`${WD}/score.json`, 'utf8'));
const FR = `${WD}/frames${process.env.HAND ? '_' + process.env.HAND : ''}`; fs.mkdirSync(FR, { recursive: true });
setLook('A');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, d = 0.35) => clamp((t - a) / d);
const ease = (u) => u * u * (3 - 2 * u);
const fadeIO = (t, a, b, d = 0.25) => clamp(Math.min((t - a) / d, (b - t) / d));
const lastBefore = (arr, t) => { let r = -1e9; for (const x of arr) if (x <= t) r = x; return r; };
const G = (o, inner) => o <= 0.001 ? '' : `<g opacity="${o.toFixed(3)}">${inner}</g>`;

// ------------------------------------------------------------------ part 1: one cat, one heartbeat
const HB = 60 / 72, S0 = SC.steps[0], NST = SC.steps.length, X0 = 1960, STRIDE = 190, GY = 680, BIG = 1.9;
function hook(t) {
	let s = '';
	const out = 1 - ramp(t, SC.jump, 0.45);                  // everything but the cat leaves with the jump
	// heart, top right: pulses on lub (and a smaller dub)
	const lb = lastBefore(SC.heart, t), pulse = Math.exp(-(t - lb) * 9) + 0.5 * Math.exp(-Math.max(0, t - lb - 0.19) * 12) * (t - lb > 0.19 ? 1 : 0);
	const hs = 1 + 0.28 * pulse;
	s += G(ramp(t, 0.5, 0.5) * out, `<g transform="translate(1560 200) scale(${hs.toFixed(3)})"><path d="M-36 -10 C-36 -34 -4 -40 0 -16 C4 -40 36 -34 36 -10 C36 18 0 36 0 46 C0 36 -36 18 -36 -10Z" fill="${L.red}" ${ol(3.5)}/></g>`
		+ G(ramp(t, 3.4), T(1560, 330, 34, '♥ 约 72 BPM', { anchor: 'middle', fill: L.sub, w: 700 })));
	// title
	s += G(ramp(t, 4.2, 0.5) * out, T(80, 120, 60, '一只猫，一步，一拍', { w: 900 }));
	// footprints with their 咚, left where each step landed
	for (let j = 0; j < NST; j++) {
		const a = ramp(t, SC.steps[j], 0.12); if (a <= 0) continue;
		const x = X0 - STRIDE * j - 16, age = t - SC.steps[j], keep = 0.35 + 0.65 * Math.exp(-age * 0.9);
		const pop = 1 + 0.5 * Math.exp(-age * 10);
		s += G(a * keep * out, `<ellipse cx="${x}" cy="${GY + 30}" rx="20" ry="10" fill="${L.ink}" opacity=".25"/>`
			+ `<g transform="translate(${x} ${GY + 92}) scale(${pop.toFixed(3)})">` + T(0, 0, 38, '咚', { anchor: 'middle', fill: L.red, w: 900 }) + `</g>`);
	}
	// the cat: walks in on the heartbeat, stops, bounces on the beat, then jumps out of the top
	const ph = (t - S0) / HB, walkPh = Math.min(ph, NST - 1);
	let x = X0 - STRIDE * walkPh, y = GY, face = 'happy', o = {};
	const lastStep = lastBefore(SC.steps, t), sinceStep = t - lastStep;
	const lastBeat = lastBefore(SC.heart, t), sinceBeat = t - lastBeat;
	if (ph < NST - 1) o.ph = ph + 1000;
	else { o.ph = 1000 + (sinceBeat < 0.25 ? sinceBeat / 0.25 * 0.02 : 0); }
	const hitT = ph < NST - 1 + 0.01 ? sinceStep : sinceBeat;
	if (hitT >= 0 && hitT < 0.22 && t < SC.jump) { face = 'hit'; o.pop = clamp(1 - hitT / 0.3); o.word = '咚'; o.wordCol = L.red; }
	if (t >= SC.jump) {                                       // crouch, then fly up and away
		const u = t - SC.jump;
		if (u < 0.12) { o.ph = 1000.9; face = 'wow'; }
		else { const v = clamp((u - 0.12) / 0.33); y = GY - 1100 * v * v; face = 'wow'; }
	}
	if (x < 2150 && y > -200) s += cat(x, y, BIG, { fur: 'yellow', face, ...o });
	s += G(fadeIO(t, SC.subs[0].a, SC.subs[0].b), subtitle(SC.subs[0].text));
	return s;
}

// ------------------------------------------------------------------ part 2: BPM lanes, one play line
const PH = 760, V = 480, LX0 = 330;
const SCALE = { 60: 0.9, 120: 0.9, 180: 0.8 };
function bpm(tReal) {
	let s = '';
	const t = Math.min(tReal, SC.end);                         // the parade freezes on the last unison hit
	const a0 = ramp(t, 10.0, 0.4), end = 1 - ramp(tReal, 29.6, 0.4);
	// header + stopwatch
	s += G(a0, `<g transform="translate(0 ${(1 - ease(a0)) * -30})">` + T(80, 110, 60, 'BPM = 一分钟走几步', { w: 900 }) + T(80, 170, 32, '同一段路，节奏越快，猫越挤', { fill: L.sub, w: 600 }) + `</g>`);
	const tick = t >= 12 ? Math.floor(t - 12) : -1, sinceTick = t >= 12 ? t - 12 - tick : 9;
	const hand = (tick + Math.min(1, sinceTick / 0.08)) * 6;
	s += G(ramp(t, 10.3), `<g transform="translate(1760 120) scale(${(1 + 0.06 * Math.exp(-sinceTick * 12)).toFixed(3)})"><circle r="56" fill="#FFFDF8" ${ol(5)}/><rect x="-10" y="-74" width="20" height="14" rx="4" fill="${L.ink}"/>`
		+ Array.from({ length: 12 }, (_, i) => `<path d="M${Math.sin(i * Math.PI / 6) * 44} ${-Math.cos(i * Math.PI / 6) * 44} L${Math.sin(i * Math.PI / 6) * 50} ${-Math.cos(i * Math.PI / 6) * 50}" ${ol(3)}/>`).join('')
		+ `<g transform="rotate(${hand.toFixed(2)})"><path d="M0 8 L0 -40" stroke="${L.red}" stroke-width="5" stroke-linecap="round"/></g><circle r="6" fill="${L.ink}"/></g>`
		+ T(1760, 216, 24, '一秒 = 60 BPM 的一步', { anchor: 'middle', fill: L.sub, w: 600 }));
	// play line
	const pa = ramp(t, 10.3) * end;
	s += G(pa, `<rect x="${PH - 46}" y="300" width="92" height="700" rx="46" fill="${L.play}" opacity=".16"/><path d="M${PH} 300 L${PH} 1000" stroke="${L.play}" stroke-width="4" stroke-dasharray="3 10" stroke-linecap="round"/><path d="M${PH - 16} 292 L${PH + 16} 292 L${PH} 312 Z" fill="${L.play}"/>`);
	// lanes
	const hitsDrawn = [];
	for (const ln of SC.lanes) {
		const la = ramp(t, ln.appear, 0.4) * end; if (la <= 0) continue;
		const P = 60 / ln.bpm, y = ln.y, last = lastBefore(ln.hits, t), since = tReal - last;
		s += G(la, `<path d="M${LX0} ${y + 14} L1900 ${y + 14}" stroke="${L.ink}" stroke-opacity=".22" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`);
		const bs = 1 + 0.1 * Math.exp(-since * 10) * (since >= 0 && since < 1 ? 1 : 0);
		s += G(la * ramp(t, ln.appear, 0.25), `<g transform="translate(170 ${y - 50}) scale(${bs.toFixed(3)})">${bpmBadge(0, 0, ln.bpm)}</g>`);
		const P0 = 60 / ln.bpm, more = Array.from({ length: Math.ceil(3 / P0) }, (_, i) => +(SC.end + (i + 1) * P0).toFixed(4));
		for (const h of [...ln.hits, ...more]) {
			const x = PH + (h - t) * V; if (x < 250 || x > 2060) continue;
			const isEnd = Math.abs(h - SC.end) < 1e-3, d = (isEnd ? tReal : t) - h;
			const hit = d >= 0 && (d < Math.min(0.22, P * 0.7) || isEnd);
			let alpha = la * clamp((x - 250) / 120);
			if (d > 0 && !isEnd) alpha *= 1 - 0.5 * clamp(d / 0.3);
			const o = { fur: ln.fur, ph: d / P + 1000, face: hit ? 'hit' : ln.mood, alpha };
			if (hit) { o.pop = isEnd ? clamp(1 - d / 1.2, 0.6) : clamp(1 - d / 0.3); o.word = h >= SC.end - 1e-3 ? '咚!' : ln.word; o.wordCol = L.red; hitsDrawn.push([x, y, SCALE[ln.bpm], o]); }
			else s += cat(x, y, SCALE[ln.bpm], o);
		}
	}
	for (const [x, y, sc, o] of hitsDrawn) s += cat(x, y, sc, o);
	for (const sb of SC.subs.slice(1)) s += G(fadeIO(tReal, sb.a, sb.b), subtitle(sb.text));
	return s;
}

function frame(t) {
	SEED = 0;
	let s = defs() + (HAND ? handDefs(HAND, Math.floor(t * 8) * 7) + paper(W, H) : background());
	if (t < 10.4) s += hook(t);
	if (t >= 9.9) s += bpm(t);
	if (t > 29.6) s += `<rect width="${W}" height="${H}" fill="${L.bg}" opacity="${ramp(t, 29.6, 0.4).toFixed(3)}"/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

// ------------------------------------------------------------------ render: 4 workers, interleaved frames
const NF = Math.round(SC.dur * SC.fps), WORKERS = 4;
const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;   // optional: list of times in seconds (stills)
const browser = await chromium.launch();
async function work(k) {
	const page = await browser.newPage({ viewport: { width: W, height: H } });
	const list = only ? only.filter((_, i) => i % WORKERS === k).map(t => Math.round(t * SC.fps)) : Array.from({ length: NF }, (_, i) => i).filter(i => i % WORKERS === k);
	for (const i of list) {
		await page.setContent(`<html><body style="margin:0;background:${L.bg}">${frame(i / SC.fps)}</body></html>`);
		await page.screenshot({ path: `${FR}/f${String(i).padStart(4, '0')}.png` });
	}
}
const t0 = Date.now();
await Promise.all(Array.from({ length: WORKERS }, (_, k) => work(k)));
await browser.close();
console.log(`frames done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

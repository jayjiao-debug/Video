// Sticker cats (style 2 贴纸吉祥物, picked by Jay 2026-10-27): AI art cut out by catparade/stickers/cut_stickers.py,
// animated as whole stickers: hop + waddle on each step, squash and pop on each hit, zzz / sweat / note effects.
// stickerDefs() goes once into the page (the PNGs as <image> in <defs>); stickerCat() only draws <use> references.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { L, FONT } from './parade.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../catparade/stickers');
export const META = JSON.parse(fs.readFileSync(`${DIR}/stickers.json`, 'utf8'));
export const CAST = Object.keys(META);

export function stickerDefs() {
	let d = '<defs>';
	for (const n of CAST) {
		const b64 = fs.readFileSync(`${DIR}/${n}.png`).toString('base64');
		d += `<image id="st_${n}" width="${META[n].w}" height="${META[n].h}" href="data:image/png;base64,${b64}"/>`;
	}
	return d + '</defs>';
}

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const f2 = (v) => v.toFixed(2);

// origin = ground between the feet. s = size (1 → 200 px tall). o: { cast, ph (steps walked, footfalls on whole numbers),
// face: happy|hit|sleep|sweat|wow, pop 0–1 (fresh hit = 1), word, wordCol, alpha, lift (extra px up), stretch }
export function stickerCat(x, y, s, o = {}) {
	const n = o.cast || 'juzi', m = META[n], Hpx = 200 * s, k = Hpx / m.h;
	let hop = 0, rot = 0, sx = 1, sy = 1;
	if (o.ph !== undefined) {
		const st = Math.floor(o.ph), u = o.ph - st, lift = Math.sin(Math.PI * u);
		hop = 0.07 * Hpx * lift;
		rot = (st % 2 ? 1 : -1) * 5 * lift;
		const land = Math.max(0, 1 - u * 6);
		sx += 0.07 * land; sy -= 0.07 * land;
	}
	const hit = o.face === 'hit', p = o.pop ?? (hit ? 1 : 0);
	if (hit) { sx += 0.12 * p; sy -= 0.12 * p; rot *= 0.3; }
	if (o.stretch) { sx -= 0.18 * o.stretch; sy += 0.25 * o.stretch; }
	const up = hop + (o.lift || 0);
	const a = o.alpha ?? 1;
	let g = `<g opacity="${f2(a)}" transform="translate(${f2(x)} ${f2(y + 12 * s)})">`;
	// ground shadow stays on the ground and shrinks while the cat is up
	const sh = clamp(1 - up / (0.6 * Hpx), 0.25);
	g += `<ellipse cx="0" cy="0" rx="${f2(0.3 * m.w * k * sh)}" ry="${f2(0.045 * Hpx * sh)}" fill="${L.ink}" opacity="${f2(0.16 * sh)}"/>`;
	g += `<g transform="translate(0 ${f2(-up)}) rotate(${f2(rot)}) scale(${f2(sx * k)} ${f2(sy * k)}) translate(${f2(-m.footX)} ${-m.footY})"><use href="#st_${n}"/></g>`;
	// effects, in screen px around the head
	const top = -up - Hpx * sy;
	if (o.face === 'sleep' && !hit) {
		const c = '#8AA4D6';
		g += `<text x="${f2(0.28 * Hpx)}" y="${f2(top + 0.12 * Hpx)}" font-size="${f2(0.17 * Hpx)}" font-weight="900" fill="${c}" stroke="#FFFDF8" stroke-width="5" paint-order="stroke" ${FONT}>z</text>`
			+ `<text x="${f2(0.42 * Hpx)}" y="${f2(top - 0.02 * Hpx)}" font-size="${f2(0.12 * Hpx)}" font-weight="900" fill="${c}" stroke="#FFFDF8" stroke-width="4" paint-order="stroke" ${FONT}>z</text>`;
	}
	if (o.face === 'sweat' || (hit && o.mood === 'sweat')) {
		const d = (cx, cy, r) => `<path d="M${f2(cx)} ${f2(cy - 1.9 * r)} C${f2(cx - 0.8 * r)} ${f2(cy - 0.6 * r)} ${f2(cx - r)} ${f2(cy)} ${f2(cx - 0.6 * r)} ${f2(cy + 0.7 * r)} C${f2(cx - 0.2 * r)} ${f2(cy + 1.1 * r)} ${f2(cx + 0.6 * r)} ${f2(cy + 1 * r)} ${f2(cx + 0.9 * r)} ${f2(cy + 0.2 * r)} C${f2(cx + r)} ${f2(cy - 0.4 * r)} ${f2(cx + 0.5 * r)} ${f2(cy - 1.1 * r)} ${f2(cx)} ${f2(cy - 1.9 * r)}Z" fill="#9AD0F5" stroke="#5E8FB8" stroke-width="2.5"/>`;
		g += d(0.36 * Hpx, top + 0.22 * Hpx, 0.045 * Hpx) + d(0.45 * Hpx, top + 0.36 * Hpx, 0.032 * Hpx);
	}
	if (hit && p > 0.02) {
		const c = o.wordCol || L.red, cy = top + 0.45 * Hpx, r0 = 0.6 * Hpx, r1 = (0.6 + 0.14 * p) * Hpx;
		let b = '';
		for (let i = 0; i < 7; i++) {
			const an = -Math.PI / 2 + (i - 3) * 0.38;
			b += `<path d="M${f2(Math.cos(an) * r0)} ${f2(cy + Math.sin(an) * r0)} L${f2(Math.cos(an) * r1)} ${f2(cy + Math.sin(an) * r1)}" stroke="${c}" stroke-width="${f2(Math.max(4, 0.03 * Hpx))}" stroke-linecap="round"/>`;
		}
		g += `<g opacity="${f2(clamp(p * 1.6))}">${b}</g>`;
		if (o.word) {
			const ws = (0.22 + 0.08 * p) * Hpx;
			g += `<g opacity="${f2(clamp(p * 2))}"><text x="0" y="${f2(top - 0.2 * Hpx)}" text-anchor="middle" font-size="${f2(Math.max(34, ws))}" font-weight="900" fill="${c}" stroke="#FFFDF8" stroke-width="9" paint-order="stroke" ${FONT}>${o.word}</text></g>`;
		}
	}
	return g + '</g>';
}

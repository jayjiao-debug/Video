// SVG builders for ep43 sets: Chinese roofs and buildings, the 虹桥 woven arch, railings, lanterns, boats, willows,
// bank crowds, stupa, 紫禁城 角楼 / 午门. Everything returns SVG markup in frame/world px (y down). One-tone by default.
import {hash} from './core';

const f = (v: number) => v.toFixed(1);
export const SIL = '#15100C';
const rnd = (seed: number) => { let s = seed; return () => { s += 1; return hash(s * 1.731 + seed * 0.37); }; };

/** a hip roof with upturned eaves: ridge from x0..x1 at y, eaves span (x0-ov..x1+ov) at y+h */
export const roof = (cx: number, y: number, w: number, h: number, curl = 0.35, col = SIL, ridgeW = 0.55) => {
	const l = cx - w / 2, r = cx + w / 2, rl = cx - (w * ridgeW) / 2, rr = cx + (w * ridgeW) / 2, ey = y + h, tip = h * curl;
	return `<path fill="${col}" d="M${f(rl)},${f(y)} L${f(rr)},${f(y)} Q${f(rr + w * 0.12)},${f(y + h * 0.75)} ${f(r)},${f(ey - tip)} Q${f(r - w * 0.02)},${f(ey + h * 0.12)} ${f(r - w * 0.09)},${f(ey + h * 0.08)} L${f(l + w * 0.09)},${f(ey + h * 0.08)} Q${f(l + w * 0.02)},${f(ey + h * 0.12)} ${f(l)},${f(ey - tip)} Q${f(rl - w * 0.12)},${f(y + h * 0.75)} ${f(rl)},${f(y)} Z"/>` +
		`<rect fill="${col}" x="${f(rl - 4)}" y="${f(y - h * 0.12)}" width="${f(rr - rl + 8)}" height="${f(h * 0.14)}"/>` +
		`<path fill="${col}" d="M${f(rl - 6)},${f(y - h * 0.1)} q-4,-${f(h * 0.25)} 10,-${f(h * 0.22)} z M${f(rr + 6)},${f(y - h * 0.1)} q4,-${f(h * 0.25)} -10,-${f(h * 0.22)} z"/>`;
};
/** a hall: walls/columns under a roof; optional second storey */
export const hall = (cx: number, base: number, w: number, h: number, storeys = 1, col = SIL, windows?: string) => {
	let s = '', y = base;
	for (let k = 0; k < storeys; k++) {
		const ww = w * (1 - k * 0.18), bh = h * (k === 0 ? 0.55 : 0.4), rh = h * 0.32;
		s += `<rect fill="${col}" x="${f(cx - ww * 0.42)}" y="${f(y - bh)}" width="${f(ww * 0.84)}" height="${f(bh)}"/>`;
		if (windows) for (let i = 0; i < 5; i++) s += `<rect fill="${windows}" x="${f(cx - ww * 0.36 + i * ww * 0.15)}" y="${f(y - bh * 0.78)}" width="${f(ww * 0.09)}" height="${f(bh * 0.5)}"/>`;
		y -= bh; s += roof(cx, y - rh, ww * 1.15, rh, 0.4, col); y -= rh * 0.95;
	}
	return s;
};
/** city gate: a long wall with a gate opening and a two-storey tower */
export const cityGate = (cx: number, base: number, scale = 1, col = SIL, open = false, plaque = true) => {
	const W = 900 * scale, Hw = 170 * scale;
	let s = `<rect fill="${col}" x="${f(cx - W / 2)}" y="${f(base - Hw)}" width="${f(W)}" height="${f(Hw)}"/>`;
	for (let i = 0; i < 26; i++) s += `<rect fill="${col}" x="${f(cx - W / 2 + i * W / 26)}" y="${f(base - Hw - 14 * scale)}" width="${f(W / 26 * 0.55)}" height="${f(14 * scale)}"/>`;
	s += open ? `<path fill="#000" fill-opacity="0.0" d=""/>` : '';
	s += hall(cx, base - Hw, 360 * scale, 260 * scale, 2, col);
	if (plaque) s += `<rect fill="${col}" x="${f(cx - 26 * scale)}" y="${f(base - Hw - 150 * scale)}" width="${f(52 * scale)}" height="${f(30 * scale)}"/>`;
	return s;
};
/** gate opening (a door arch cut) drawn in a colour (for light behind, or sky) */
export const gateArch = (cx: number, base: number, w: number, h: number, col: string) => `<path fill="${col}" d="M${f(cx - w / 2)},${f(base)} L${f(cx - w / 2)},${f(base - h + w / 2)} A${f(w / 2)},${f(w / 2)} 0 0 1 ${f(cx + w / 2)},${f(base - h + w / 2)} L${f(cx + w / 2)},${f(base)} Z"/>`;
/** 元 White Dagoba (妙应寺白塔) silhouette */
export const dagoba = (cx: number, base: number, s = 1, col = SIL) => {
	const p = (x: number, y: number) => `${f(cx + x * s)},${f(base - y * s)}`;
	return `<path fill="${col}" d="M${p(-120, 0)} L${p(120, 0)} L${p(120, 26)} L${p(96, 26)} L${p(96, 50)} L${p(-96, 50)} L${p(-96, 26)} L${p(-120, 26)} Z
	M${p(-80, 50)} L${p(80, 50)} L${p(70, 72)} L${p(-70, 72)} Z
	M${p(-70, 72)} C${p(-96, 120)} ${p(-86, 170)} ${p(-40, 186)} L${p(40, 186)} C${p(86, 170)} ${p(96, 120)} ${p(70, 72)} Z
	M${p(-34, 186)} L${p(34, 186)} L${p(26, 204)} L${p(-26, 204)} Z
	M${p(-22, 204)} L${p(22, 204)} L${p(10, 330)} L${p(-10, 330)} Z
	M${p(-50, 324)} C${p(-44, 330)} ${p(-30, 352)} ${p(0, 356)} C${p(30, 352)} ${p(44, 330)} ${p(50, 324)} L${p(36, 326)} L${p(24, 322)} L${p(12, 326)} L${p(0, 322)} L${p(-12, 326)} L${p(-24, 322)} L${p(-36, 326)} Z M${p(-7, 354)} L${p(7, 354)} L${p(4, 384)} L${p(-4, 384)} Z"/><circle fill="${col}" cx="${f(cx)}" cy="${f(base - 390 * s)}" r="${f(7 * s)}"/>`   // 华盖: a domed canopy with a fringed hem + spire and pearl (no crossbar) +
		Array.from({length: 9}, (_, i) => `<rect fill="${col}" x="${f(cx - (20 - i * 1.4) * s)}" y="${f(base - (210 + i * 13) * s)}" width="${f((40 - i * 2.8) * s)}" height="${f(5 * s)}"/>`).join('');
};
/** 紫禁城 corner tower (角楼): stacked cross roofs */
export const jiaolou = (cx: number, base: number, s = 1, col = SIL) => {
	let o = `<rect fill="${col}" x="${f(cx - 150 * s)}" y="${f(base - 70 * s)}" width="${f(300 * s)}" height="${f(70 * s)}"/>`;
	o += roof(cx, base - 125 * s, 380 * s, 58 * s, 0.45, col); o += `<rect fill="${col}" x="${f(cx - 110 * s)}" y="${f(base - 150 * s)}" width="${f(220 * s)}" height="${f(30 * s)}"/>`;
	o += roof(cx, base - 200 * s, 300 * s, 55 * s, 0.45, col); o += roof(cx - 70 * s, base - 215 * s, 150 * s, 40 * s, 0.5, col); o += roof(cx + 70 * s, base - 215 * s, 150 * s, 40 * s, 0.5, col);
	o += roof(cx, base - 262 * s, 190 * s, 48 * s, 0.5, col); o += `<rect fill="${col}" x="${f(cx - 3 * s)}" y="${f(base - 300 * s)}" width="${f(6 * s)}" height="${f(40 * s)}"/><circle fill="${col}" cx="${f(cx)}" cy="${f(base - 300 * s)}" r="${f(9 * s)}"/>`;
	return o;
};
/** 午门: U-shaped base with the main hall and side pavilions */
export const wumen = (cx: number, base: number, s = 1, col = SIL, gateCol?: string) => {
	let o = `<rect fill="${col}" x="${f(cx - 520 * s)}" y="${f(base - 150 * s)}" width="${f(1040 * s)}" height="${f(150 * s)}"/>`;
	o += hall(cx, base - 150 * s, 420 * s, 230 * s, 2, col);
	for (const dx of [-430, 430]) { o += `<rect fill="${col}" x="${f(cx + (dx - 70) * s)}" y="${f(base - 170 * s)}" width="${f(140 * s)}" height="${f(20 * s)}"/>`; o += hall(cx + dx * s, base - 168 * s, 150 * s, 150 * s, 1, col); }
	for (const dx of [-250, 250]) o += hall(cx + dx * s, base - 150 * s, 120 * s, 120 * s, 1, col);
	if (gateCol) for (const dx of [-120, 0, 120]) o += gateArch(cx + dx * s, base, (dx ? 44 : 58) * s, (dx ? 80 : 104) * s, gateCol);
	return o;
};
/** a skyline of low roofs (far city) */
export const skyline = (x0: number, x1: number, base: number, hMin: number, hMax: number, seed = 1, col = SIL) => {
	const r = rnd(seed); let o = '', x = x0;
	while (x < x1) { const w = 60 + r() * 140, h = hMin + r() * (hMax - hMin); o += `<rect fill="${col}" x="${f(x)}" y="${f(base - h * 0.55)}" width="${f(w * 0.9)}" height="${f(h * 0.55 + 2)}"/>` + roof(x + w * 0.45, base - h, w * 1.05, h * 0.45, 0.35, col); x += w * (0.8 + r() * 0.5); }
	return o + `<rect fill="${col}" x="${f(x0)}" y="${f(base - 4)}" width="${f(x1 - x0)}" height="400"/>`;
};
/** willow tree silhouette */
export const willow = (x: number, base: number, h: number, seed = 1, col = SIL) => {
	// trunk forking into three limbs; each limb arches over and drops curtains of thin strands, longest at the outside,
	// so the crown is widest at the bottom with a ragged hem (reads as a willow at 480 px, not a disc on a pole)
	const r = rnd(seed), lean = (r() - 0.5) * 0.05 * h, fx = x + lean, fy = base - h * 0.4, tw = Math.max(1.5, h * 0.03);
	let o = `<path fill="${col}" d="M${f(x - tw)},${f(base)} Q${f(x - tw * 0.6)},${f(base - h * 0.22)} ${f(fx - tw * 0.55)},${f(fy)} L${f(fx + tw * 0.55)},${f(fy)} Q${f(x + tw * 0.6)},${f(base - h * 0.22)} ${f(x + tw)},${f(base)} Z"/>`;
	const limbs: [number, number][] = [[-0.2, 0.8], [0.02, 0.98], [0.23, 0.84]];
	let strands = '';
	for (const [dx, ty] of limbs) {
		const tx = fx + dx * h, tyy = base - ty * h, side = dx < -0.05 ? -1 : dx > 0.05 ? 1 : 0;
		const qx = fx + dx * h * 0.25, qy = fy - (ty - 0.4) * h * 0.75;
		o += `<path fill="none" stroke="${col}" stroke-width="${f(tw * 0.75)}" stroke-linecap="round" d="M${f(fx)},${f(fy)} Q${f(qx)},${f(qy)} ${f(tx)},${f(tyy)}"/>`;
		// a few leafy clumps along the arch (rounded crown, no flat top)
		for (let i = 0; i < 4; i++) { const s2 = 0.45 + i * 0.18, cx = fx + (tx - fx) * s2 + (r() - 0.5) * h * 0.05, cy = fy + (tyy - fy) * s2 - h * 0.02;
			o += `<ellipse fill="${col}" fill-opacity="0.55" cx="${f(cx)}" cy="${f(cy)}" rx="${f(h * (0.04 + r() * 0.03))}" ry="${f(h * (0.02 + r() * 0.014))}"/>`; }
		for (let i = 0; i < 18; i++) {
			const s2 = 0.35 + r() * 0.65, sx = fx + (tx - fx) * s2 + (r() - 0.5) * h * 0.08, sy = fy + (tyy - fy) * s2 - h * 0.02;
			const out = (side || (r() < 0.5 ? -1 : 1)) * h * (0.03 + r() * 0.09) * (0.5 + s2);
			const ey = base - h * (0.12 + r() * 0.34) + Math.abs(out) * 0.3, ex = sx + out * 1.5;
			strands += `<path fill="none" stroke="${col}" stroke-width="${f(Math.max(1, h * (0.006 + r() * 0.008)))}" stroke-linecap="round" d="M${f(sx)},${f(sy)} C${f(sx + out * 0.9)},${f(sy - h * 0.05)} ${f(ex)},${f(sy + h * 0.06)} ${f(ex + (r() - 0.5) * h * 0.02)},${f(ey)}"/>`;
		}
	}
	return o + strands;
};
/** a small bank figure (far crowd): head + body + hat variety */
export const tinyFig = (x: number, base: number, h: number, seed: number, col = SIL) => {
	const r = rnd(seed), lean = (r() - 0.5) * 0.15, hat = r();
	let o = `<path fill="${col}" d="M${f(x - h * 0.13)},${f(base)} L${f(x - h * 0.1 + lean * h)},${f(base - h * 0.72)} Q${f(x + lean * h)},${f(base - h * 0.8)} ${f(x + h * 0.1 + lean * h)},${f(base - h * 0.72)} L${f(x + h * 0.13)},${f(base)} Z"/>`;
	o += `<circle fill="${col}" cx="${f(x + lean * h)}" cy="${f(base - h * 0.85)}" r="${f(h * 0.1)}"/>`;
	if (hat > 0.6) o += `<ellipse fill="${col}" cx="${f(x + lean * h)}" cy="${f(base - h * 0.92)}" rx="${f(h * 0.18)}" ry="${f(h * 0.035)}"/>`;
	if (hat < 0.2) o += `<rect fill="${col}" x="${f(x + lean * h - h * 0.3)}" y="${f(base - h * 0.62)}" width="${f(h * 0.6)}" height="${f(h * 0.04)}"/>`;
	return o;
};
export const crowd = (x0: number, x1: number, base: number | ((x: number) => number), hMin: number, hMax: number, n: number, seed = 1, col = SIL) => {
	const r = rnd(seed); let o = '';
	for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), b = typeof base === 'number' ? base : base(x); o += tinyFig(x, b, hMin + r() * (hMax - hMin), seed * 100 + i, col); }
	return o;
};
/** a river boat (side view); mastAng in deg from vertical (0 up, 80 lowered); seed for cabin */
export const boat = (cx: number, wl: number, len: number, mastAng = 0, col = SIL, seed = 3) => {
	const r = rnd(seed), h = len * 0.12;
	let o = `<path fill="${col}" d="M${f(cx - len / 2)},${f(wl - h * 0.9)} Q${f(cx - len * 0.3)},${f(wl + h * 0.6)} ${f(cx)},${f(wl + h * 0.55)} Q${f(cx + len * 0.32)},${f(wl + h * 0.6)} ${f(cx + len / 2)},${f(wl - h * 1.1)} L${f(cx + len * 0.42)},${f(wl - h * 0.55)} L${f(cx - len * 0.42)},${f(wl - h * 0.45)} Z"/>`;
	const cw = len * (0.35 + r() * 0.15); o += `<path fill="${col}" d="M${f(cx - cw / 2)},${f(wl - h * 0.4)} L${f(cx - cw / 2)},${f(wl - h * 2.1)} Q${f(cx)},${f(wl - h * 2.6)} ${f(cx + cw / 2)},${f(wl - h * 2.1)} L${f(cx + cw / 2)},${f(wl - h * 0.4)} Z"/>`;
	const mx = cx + len * 0.18, my = wl - h * 2.2, ml = len * 0.75, a = (mastAng * Math.PI) / 180;
	o += `<line stroke="${col}" stroke-width="${f(len * 0.014)}" stroke-linecap="round" x1="${f(mx)}" y1="${f(my)}" x2="${f(mx - Math.sin(a) * ml)}" y2="${f(my - Math.cos(a) * ml)}"/>`;
	o += `<line stroke="${col}" stroke-width="${f(len * 0.004)}" x1="${f(mx - Math.sin(a) * ml)}" y1="${f(my - Math.cos(a) * ml)}" x2="${f(cx - len * 0.45)}" y2="${f(wl - h)}"/>`;
	o += `<line stroke="${col}" stroke-width="${f(len * 0.004)}" x1="${f(mx - Math.sin(a) * ml)}" y1="${f(my - Math.cos(a) * ml)}" x2="${f(cx + len * 0.48)}" y2="${f(wl - h * 1.05)}"/>`;
	return o;
};
/** the deck curve of the 虹桥 crest: y at x for a crest centred at cx, top yTop, half-span hs, ends at yEnd */
export const deckY = (x: number, cx: number, yTop: number, hs: number, yEnd: number) => { const u = (x - cx) / hs; return yTop + (yEnd - yTop) * Math.min(1.4, u * u); };
/** the woven timber arch (虹桥): deck band, arch beams (woven), railing posts + top rail; lantern posts list returned */
export const hongqiao = (cx: number, yTop: number, hs: number, yEnd: number, col = SIL, deckCol = '#1d1611') => {
	const dy = (x: number) => deckY(x, cx, yTop, hs, yEnd);
	const xs: number[] = []; for (let x = cx - hs * 1.15; x <= cx + hs * 1.15; x += hs / 40) xs.push(x);
	let o = '';
	// arch beams under the deck: 5 woven layers, each a polyline of straight segments (the woven system)
	for (let k = 0; k < 5; k++) {
		const off = 34 + k * 26, segs = 5 + (k % 2); let d = '';
		for (let i = 0; i <= segs; i++) { const x = cx - hs * 1.08 + (i * 2.16 * hs) / segs; const y = dy(x) + off + (Math.abs(x - cx) / hs) * 40; d += `${i ? 'L' : 'M'}${f(x)},${f(y)} `; }
		o += `<path fill="none" stroke="${col}" stroke-width="${f(14 - k)}" stroke-linejoin="round" d="${d}"/>`;
	}
	// cross ties
	for (let i = 0; i < 18; i++) { const x = cx - hs * 1.02 + (i * 2.04 * hs) / 17; o += `<line stroke="${col}" stroke-width="7" x1="${f(x)}" y1="${f(dy(x) + 20)}" x2="${f(x + 18)}" y2="${f(dy(x) + 150 + (Math.abs(x - cx) / hs) * 40)}"/>`; }
	// deck slab
	o += `<path fill="${deckCol}" d="M${xs.map((x) => `${f(x)},${f(dy(x))}`).join(' L')} L${xs.slice().reverse().map((x) => `${f(x)},${f(dy(x) + 34)}`).join(' L')} Z"/>`;
	o += `<path fill="none" stroke="${col}" stroke-width="10" d="M${xs.map((x) => `${f(x)},${f(dy(x) + 30)}`).join(' L')}"/>`;
	return o;
};
/** railing on the near side of the deck: posts every gap, top rail, returns lantern positions */
export const railing = (cx: number, yTop: number, hs: number, yEnd: number, postH = 120, gap = 116, col = SIL) => {
	const dy = (x: number) => deckY(x, cx, yTop, hs, yEnd); let o = ''; const posts: [number, number][] = [];
	for (let x = cx - hs * 1.12; x <= cx + hs * 1.12; x += gap) { const y = dy(x); o += `<rect fill="${col}" x="${f(x - 5)}" y="${f(y - postH)}" width="10" height="${f(postH + 30)}"/><circle fill="${col}" cx="${f(x)}" cy="${f(y - postH - 6)}" r="8"/>`; posts.push([x, y - postH]); }
	const xs: number[] = []; for (let x = cx - hs * 1.12; x <= cx + hs * 1.12; x += hs / 40) xs.push(x);
	o += `<path fill="none" stroke="${col}" stroke-width="9" d="M${xs.map((x) => `${f(x)},${f(dy(x) - postH)}`).join(' L')}"/>`;
	o += `<path fill="none" stroke="${col}" stroke-width="5" d="M${xs.map((x) => `${f(x)},${f(dy(x) - postH * 0.45)}`).join(' L')}"/>`;
	return {svg: o, posts};
};
/** hanging lantern at (x,y = hook point); lit draws the warm body, else dark */
export const lantern = (x: number, y: number, s = 1, lit = true, col = SIL) =>
	`<line stroke="${col}" stroke-width="${f(3 * s)}" x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y + 22 * s)}"/><rect fill="${col}" x="${f(x - 14 * s)}" y="${f(y + 20 * s)}" width="${f(28 * s)}" height="${f(6 * s)}"/>` +
	`<ellipse fill="${lit ? '#F2B866' : '#2a221b'}" cx="${f(x)}" cy="${f(y + 50 * s)}" rx="${f(20 * s)}" ry="${f(27 * s)}"/><rect fill="${col}" x="${f(x - 10 * s)}" y="${f(y + 75 * s)}" width="${f(20 * s)}" height="${f(5 * s)}"/>`;
/** lantern glow body only (emissive layer) */
export const lanternGlow = (x: number, y: number, s = 1, k = 1) => k <= 0 ? '' : `<ellipse fill="#FFB868" fill-opacity="${k.toFixed(2)}" cx="${f(x)}" cy="${f(y + 50 * s)}" rx="${f(18 * s)}" ry="${f(25 * s)}"/>`;
/** mountains / far hills band */
export const hills = (x0: number, x1: number, base: number, amp: number, seed = 2, col = SIL) => {
	const r = rnd(seed); let d = `M${f(x0)},${f(base + 400)} L${f(x0)},${f(base)}`; let x = x0;
	while (x < x1) { x += 80 + r() * 160; d += ` Q${f(x - 60)},${f(base - amp * (0.3 + r()))} ${f(x)},${f(base - amp * r() * 0.6)}`; }
	return `<path fill="${col}" d="${d} L${f(x1 + 200)},${f(base + 400)} Z"/>`;
};

// ep45 proof 1: the hook, 0 – 12.6 s (S01 RING + title + the rect-grow into N1's glass hall).
// Board: storyboard_v7.md S01 / OUT → S02 (mode 14 rect-grow). Lines: lines_v7s.json (H3 clears at 9.05 for the title; title
// holds 9.05 → 11.638; N1 types at 11.638). Art: K.ringNight / K.ringPos / K.ringSeat / K.vitrine / K.horseHead (hero3 r6 ear)
// and the title of v7_t_title.js, the glass hall of v7_n3_queue.js. All motion is a pure function of t.
(() => {
const P = window.P45, rnd = K.rnd;
const B = P.beat;
// ---- timing (film s)
const LIGHT = {牛: 3.997, 虎: B(5), 猴: B(5.5), 猪: B(6), 鼠: B(6.5), 兔: B(7)};   // one per half-beat from b4.5 (3.997)
const FLARE = B(7.5);                                                            // 5.695: the horse flares, the five go dashed
const DASH = ['龙', '蛇', '羊', '鸡', '狗'];
const LIFT = 5.978, RISE = 0.15;
const LAND = {牛: 6.55, 虎: 6.63, 猴: 6.71, 猪: 6.79, 鼠: 6.87, 兔: 6.95};
const CASE_OF = {牛: 0, 虎: 0, 猴: 0, 猪: 0, 鼠: 1, 兔: 1};
const CASES = [{x: 1340, y: 236, w: 460, h: 236, heads: ['牛', '虎', '猴', '猪'], label: '保利艺术博物馆 ×4', size: 96},
	{x: 1340, y: 600, w: 460, h: 200, heads: ['鼠', '兔'], label: '国家博物馆 ×2', size: 120}];
const TITLE = 9.05, RET = B(16.5), GROW0 = 11.10, GROW1 = 11.638, N1 = 11.638;
const ZOD = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// ---- camera: frame 0 already moving (ease-out), reframe wide for the cases, then the log-zoom push to the horse
const pos = K.ringPos(), hp = pos.find((p) => p.k === '马');
const heroSeat = K.ringSeat(hp, 'hero', {heroK: 1.15});
const hero0 = heroSeat.hero, TX = hero0.x - 0.28 * hero0.h, TY = hero0.y - 0.52 * hero0.h + 70 / 2.1;   // = v7_t_title framing
const camRing = P.cam([960, 540, 1.0], [
	{t0: 0, t1: 5.978, to: [1000, 560, 1.08], ease: 'out'},
	{t0: 5.978, t1: 7.10, to: [1180, 600, 0.86]},
	{t0: 7.10, t1: 9.60, to: [TX, TY, 2.10]},
	{t0: 9.60, t1: 11.64, to: [TX, TY, 2.12]},
]);
// N1 opens inside the glass hall (four cases framed where the four heads sat in the case), then the board's pull-back
const camHall = P.cam([870, 470, 2.0], [{t0: 11.65, t1: 15.0, to: [1500, 540, 1.0]}]);   // N1 now runs 11.638–15.035

// ---- the RING world (authored wide: the 1920 plate extended so zoom 0.86 and the reframe never show an edge)
let RW = null;
const ringBase = () => {
	if (RW) return RW;
	let s = K.ringNight({heroX: hp.x - 40, heroY: hp.y - 260});
	s = s.replace('<linearGradient id="r7sky" x1="0" x2="0" y1="0" y2="1">', '<linearGradient id="r7sky" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="1080">')
		.replace('<linearGradient id="r7terr" x1="0" x2="0" y1="0" y2="1">', '<linearGradient id="r7terr" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="548" y2="1080">');
	for (const g of ['r7sky', 'r7moon', 'r7cu']) s = s.replace(`<rect width="1920" height="1080" fill="url(#${g})"/>`, `<rect x="-900" y="-700" width="4000" height="2600" fill="url(#${g})"/>`);
	s = s.replace('<rect x="0" y="548" width="1920" height="532" fill="url(#r7terr)"/>', '<rect x="-900" y="548" width="4000" height="1300" fill="url(#r7terr)"/>')
		.replace('<path d="M0,548 L1920,548"', '<path d="M-900,548 L3100,548"');
	let trees = '';
	for (let i = -18; i < 64; i++) { if (i >= 0 && i < 40) continue; const x = -40 + i * 52 + rnd(Math.abs(i) + 200) * 30, r = 40 + rnd(Math.abs(i) + 203) * 46; trees += `<ellipse cx="${x}" cy="${560 - rnd(Math.abs(i) + 207) * 40}" rx="${r}" ry="${r * 0.8}"/>`; }
	s = s.replace('<g fill="#24302F" filter="url(#r7b3)">', `<g fill="#24302F" filter="url(#r7b3)">${trees}`);
	let stars = ''; for (let i = 0; i < 40; i++) { const x = i < 20 ? 1920 + rnd(i + 300) * 1180 : -900 + rnd(i + 300) * 900; stars += `<circle cx="${x}" cy="${-300 + rnd(i + 330) * 640}" r="${0.8 + rnd(i + 360) * 1.3}" fill="#E4EEE8" opacity="${0.25 + rnd(i + 390) * 0.45}"/>`; }
	for (let i = 0; i < 24; i++) stars += `<circle cx="${rnd(i + 420) * 1920}" cy="${-300 + rnd(i + 450) * 330}" r="${0.8 + rnd(i + 480) * 1.3}" fill="#E4EEE8" opacity="${0.25 + rnd(i + 510) * 0.45}"/>`;
	RW = s + stars; return RW;
};
/** moonlit shimmer on the pool + the moon's reflection (living motion, every frame) */
const shimmer = (t) => {
	let s = '';
	for (let i = 0; i < 9; i++) { const y = 655 + i * 13, w = 30 + 40 * rnd(i + 40), x = 540 + 26 * P.noise(t * 1.3 + i * 3.1, i) - w / 2, a = 0.10 + 0.16 * (0.5 + 0.5 * P.noise(t * 2.2 + i, i + 9));
		s += `<path d="M${x.toFixed(1)},${y} l${w.toFixed(1)},0" stroke="#E8F0EA" stroke-width="2" opacity="${a.toFixed(3)}" stroke-linecap="round"/>`; }
	for (let i = 0; i < 7; i++) { const y = 640 + i * 26, a = 0.035 * (0.5 + 0.5 * P.noise(t * 0.9 + i * 2.3, i + 30)); s += `<path d="M${280 + i * 40},${y} L${1640 - i * 40},${y}" stroke="#E6EEE6" stroke-width="1.6" opacity="${a.toFixed(3)}"/>`; }
	return s;
};
// ---- per-seat state
const DARK = '#231B16', IVORY = '#E9DCC4';
const headGeo = (p) => { const h = 160 * p.s, b = K.stoneBody(p.x, p.y, h, p.face, '#353530'), [tx, ty] = b.top; return {hx: tx + p.face * 4 * p.s, hy: ty + 22 * p.s, size: 175 * p.s, top: [tx, ty]}; };
const dashHead = (p, op) => { const g = K.ringSeat(p, 'dash'); return `<g opacity="${op}">${g.head}</g>`; };
const flyFrac = (k, t) => P.smooth(P.seg(t, LIFT + RISE, LAND[k]));
const seatSvg = (p, t) => {
	const k = p.k, stone = '#353530', h = 160 * p.s;
	if (k === '马') return {back: heroSeat.back, head: ''};
	if (LIGHT[k] !== undefined) {
		if (t >= LIFT) return {back: K.emptySeat(p.x, p.y, h, p.face, stone, '#E9DCC4'), head: ''};
		const g = headGeo(p), u = P.seg(t, LIGHT[k], LIGHT[k] + 0.12);
		return {back: K.stoneBody(p.x, p.y, h, p.face, stone).svg, head: K.bro(k, g.hx, g.hy - 4 * u, g.size, p.face, P.mixC(DARK, IVORY, u))};
	}
	if (DASH.includes(k)) {
		const u = P.seg(t, FLARE, FLARE + 0.15), g = headGeo(p);
		const dark = u < 1 ? `<g opacity="${(1 - u).toFixed(3)}">${K.bro(k, g.hx, g.hy, g.size, p.face, DARK)}</g>` : '';
		return {back: K.stoneBody(p.x, p.y, h, p.face, stone).svg, head: dark + (u > 0 ? dashHead(p, (0.95 * u).toFixed(3)) : '')};
	}
	const g = headGeo(p);
	return {back: K.stoneBody(p.x, p.y, h, p.face, stone).svg, head: K.bro(k, g.hx, g.hy, g.size, p.face, DARK)};
};
const heroAt = (t, extra = {}) => {
	const breathe = 1 + 0.03 * Math.sin(2 * Math.PI * (t - P.BAR0) / (4 * P.BEAT));
	const fl = t >= FLARE ? Math.exp(-(t - FLARE) / 0.35) : 0;
	return {...hero0, glow: 1.1 * breathe + 0.7 * fl, key: 1.7 + 0.35 * fl, ...extra};
};
/** bar 0 (1.45): a copper rim sweeps across the horse left → right (0.4 s): a hotter copy of the head under a moving band */
const rimSweep = (t) => {
	const u = P.seg(t, P.BAR0, P.BAR0 + 0.4); if (u <= 0 || u >= 1) return '';
	const x0 = hero0.x - 0.95 * hero0.h, x1 = hero0.x + 0.45 * hero0.h, bx = P.lerp(x0, x1, P.smooth(u)), w = 0.16 * hero0.h;
	const a = Math.sin(Math.PI * u);
	return `<defs><linearGradient id="swg" gradientUnits="userSpaceOnUse" x1="${bx - w}" x2="${bx + w}" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
	<mask id="swm" maskUnits="userSpaceOnUse" x="${hero0.x - 600}" y="${hero0.y - 600}" width="1200" height="800"><rect x="${hero0.x - 600}" y="${hero0.y - 600}" width="1200" height="800" fill="url(#swg)"/></mask></defs>
	<g mask="url(#swm)" opacity="${(0.9 * a).toFixed(3)}">${K.horseHead({...heroAt(t), glow: 0, key: 2.9, rimK: 1.5, rim: '#FFD9A6'})}</g>`;
};
const ringWorld = (t, o = {}) => {
	let far = '', near = '';
	for (const p of pos) {
		const s = seatSvg(p, t);
		const g = `<g filter="url(#${p.arc === 'far' ? 'r7rimF' : 'r7rimN'})">${s.back}${s.head}</g>`;
		const hs = p.k === '马' && !o.noHero ? K.horseHead(heroAt(t)) + rimSweep(t) : '';
		if (p.arc === 'far') far += g + hs; else near += g + hs;
	}
	const defs = `<defs>${K.rimFilter('r7rimF', 3, 3, '#B8CCC6', 0.75, 1.1)}${K.rimFilter('r7rimN', 4, 4, '#C9DAD4', 0.95, 1.3)}</defs>`;
	return P.wideFilters(ringBase() + shimmer(t) + defs + far + near);
};
// ---- cases (screen space; slide in from the right, then out; 保利 returns for the title)
const caseDx = (t) => {
	let dx = 0;
	if (t < 9) { const a = P.smooth(P.seg(t, LIFT, 6.50)), b = P.smooth(P.seg(t, 7.30, 8.00)); dx = 640 * (1 - a) + 640 * b; }
	else dx = 640 * (1 - P.smooth(P.seg(t, RET, 11.13)));
	return dx;
};
const caseVel = (t) => Math.abs(caseDx(t + 1 / 60) - caseDx(t - 1 / 60)) * 30;   // px/s
const vitrine = (c, dx, present, lab, op = 1) => {
	const x = c.x + dx, {y, w, h} = c, id = 'vt' + c.size;
	let in_ = '';
	c.heads.forEach((k, i) => { const n = c.heads.length, hx = x + 20 + (i + 0.5) * (w - 40) / n, hy = y + h - 34;
		in_ += `<rect x="${hx - c.size * 0.32}" y="${hy}" width="${c.size * 0.64}" height="34" fill="#C9B79A" opacity=".55"/>` + (present(k) ? K.bro(k, hx, hy, c.size, -1, '#E9DCC4') : ''); });
	return `<defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF4DE" stop-opacity=".38"/><stop offset="1" stop-color="#E8D2AA" stop-opacity=".12"/></linearGradient></defs>
	<g opacity="${op}">
	<rect x="${x - 10}" y="${y + h}" width="${w + 20}" height="92" fill="#2E2621"/><path d="M${x - 10},${y + h} L${x + w + 10},${y + h}" stroke="#E8C690" stroke-width="3" opacity=".7"/>
	<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>
	${in_}
	<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#F6EAD2" stroke-width="3" opacity=".75"/>
	<path d="M${x + 16},${y + 14} L${x + 60},${y + 14} M${x + 16},${y + 14} L${x + 16},${y + 80}" stroke="#FFFFFF" stroke-width="4" opacity=".55"/>
	${lab > 0 ? `<text x="${x + w / 2}" y="${y + h + 46 + 18}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="48" fill="#FFF1DC" opacity="${lab.toFixed(3)}">${c.label}</text>` : ''}
	</g>`;
};
const slot = (k, dx) => { const c = CASES[CASE_OF[k]], i = c.heads.indexOf(k), n = c.heads.length; return [c.x + dx + 20 + (i + 0.5) * (c.w - 40) / n, c.y + c.h - 34, c.size]; };
const bez = (a, b, c, d, u) => { const m = 1 - u; return [0, 1].map((j) => m * m * m * a[j] + 3 * m * m * u * b[j] + 3 * m * u * u * c[j] + u * u * u * d[j]); };
/** the six in flight (screen space) + their ivory trails */
const flights = (t, cam, dx) => {
	if (t < LIFT || t > 7.6) return '';
	let heads = '', trails = '';
	Object.keys(LAND).forEach((k, i) => {
		const p = pos.find((q) => q.k === k), g = headGeo(p), rise = 34 * P.easeOut(P.seg(t, LIFT, LIFT + RISE));
		const p0 = P.toScr(cam, [g.hx, g.hy - 4 - rise]), [sx, sy, ss] = slot(k, dx), p3 = [sx, sy];
		const c1 = [p0[0] + 170, p0[1] - 130 + i * 6], c2 = [p3[0] - 240, p3[1] - 50];
		const u = flyFrac(k, t), pt = bez(p0, c1, c2, p3, u);
		const top = P.toScr(cam, [g.top[0], g.top[1] - 10]);
		const fade = 1 - P.seg(t, LAND[k], 7.4);
		if (u > 0.01 && fade > 0) {
			let d = `M${top[0].toFixed(1)},${top[1].toFixed(1)}`; const tc1 = [top[0] + 170, top[1] - 130 + i * 6];
			for (let j = 1; j <= 16; j++) { const q = bez(top, tc1, c2, p3, u * j / 16); d += ` L${q[0].toFixed(1)},${(q[1] - 40 * (1 - u * j / 16) * 0).toFixed(1)}`; }
			trails += `<path d="${d}" stroke="url(#trail)" stroke-width="${(10 - i * 0.6).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${fade.toFixed(3)}" filter="url(#tb4)"/>`;
		}
		if (t < LAND[k]) { const size = P.lerp(g.size * cam.z, ss, u), face = P.lerp(p.face, -1, P.smooth(u));
			heads += K.bro(k, pt[0], pt[1], size, Math.abs(face) < 0.04 ? 0.04 * Math.sign(face || -1) : face, IVORY); }
	});
	return `<defs><linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#F3E6CF" stop-opacity="0"/><stop offset="1" stop-color="#F3E6CF" stop-opacity=".55"/></linearGradient>${K.blur('tb4', 4)}
	${K.rimFilter('flyRim', 4 * cam.z, 4 * cam.z, '#C9DAD4', 0.95, 1.3)}</defs>${trails}<g filter="url(#flyRim)">${heads}</g>`;
};
// ---- the Hangzhou glass hall (v7_n3_queue.js set, authored 3200 wide; screen-space vignette applied by the caller)
let HW = null;
const hallBase = () => {
	if (HW) return HW;
	const svg0 = `<defs>
	 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="1080"><stop offset="0" stop-color="#1C2A31"/><stop offset=".6" stop-color="#34474C"/><stop offset="1" stop-color="#4C5C5C"/></linearGradient>
	 <linearGradient id="mass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A3B38"/><stop offset="1" stop-color="#2A2B29"/></linearGradient>
	 <linearGradient id="hall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F3E3C2"/><stop offset=".55" stop-color="#E2C99C"/><stop offset="1" stop-color="#B89A70"/></linearGradient>
	 <linearGradient id="plaza" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#57564F"/><stop offset="1" stop-color="#2A2A27"/></linearGradient>
	 <radialGradient id="spill" cx="900" cy="640" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2B8" stop-opacity=".38"/><stop offset=".5" stop-color="#E8C890" stop-opacity=".12"/><stop offset="1" stop-color="#E8C890" stop-opacity="0"/></radialGradient>
	 <radialGradient id="door" cx="250" cy="560" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF0D0" stop-opacity=".7"/><stop offset="1" stop-color="#FFF0D0" stop-opacity="0"/></radialGradient>
	 ${K.rimFilter('rimQ', 5, 0, '#F6DDB0', 0.9, 1.4)}${K.rimFilter('rimQf', 4, 0, '#E8D2AA', 0.6, 1.2)}${K.blur('qb2', 1.6)}${K.blur('qb12', 12)}
	</defs>
	<rect x="-900" y="-600" width="4400" height="2200" fill="url(#sky)"/>
	${Array.from({length: 50}, (_, i) => `<circle cx="${-300 + rnd(i + 3) * 3600}" cy="${30 + rnd(i + 8) * 200}" r="${0.8 + rnd(i + 5)}" fill="#DDE6E2" opacity="${0.2 + rnd(i + 6) * 0.35}"/>`).join('')}
	<rect x="-900" y="236" width="4400" height="474" fill="url(#mass)"/>
	<rect x="-900" y="236" width="4400" height="34" fill="#4A4A45"/><path d="M-900,270 L3500,270" stroke="#6E6A60" stroke-width="2"/>
	${Array.from({length: 40}, (_, i) => `<rect x="${1290 + i * 48}" y="300" width="4" height="380" fill="#24251F" opacity=".7"/>`).join('')}
	<rect x="440" y="300" width="840" height="380" fill="url(#hall)"/>
	${Array.from({length: 7}, (_, i) => `<rect x="${440 + i * 140}" y="300" width="6" height="380" fill="#6E5E48" opacity=".75"/>`).join('')}
	<rect x="440" y="300" width="840" height="380" fill="none" stroke="#7A6A52" stroke-width="5"/>
	${['牛', '虎', '猴', '猪'].map((k, i) => { const x = 500 + i * 200; return `<ellipse cx="${x + 70}" cy="330" rx="90" ry="20" fill="#FFF6E2" opacity=".55" filter="url(#qb12)"/>
		<rect x="${x}" y="560" width="140" height="120" fill="#5E503E"/><path d="M${x},560 L${x + 140},560" stroke="#FFF1D6" stroke-width="3"/>
		<rect x="${x}" y="396" width="140" height="164" fill="#FFF8EA" opacity=".28" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="2.5"/>
		${K.bro(k, x + 70, 552, 112, -1, '#3A2A1E')}
		<path d="M${x + 10},404 L${x + 40},404 M${x + 10},404 L${x + 10},440" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>`; }).join('')}
	<rect x="150" y="380" width="200" height="300" fill="#FFF1D6"/><rect x="150" y="380" width="200" height="300" fill="none" stroke="#5A4E40" stroke-width="8"/>
	<rect x="-900" y="-600" width="4400" height="2200" fill="url(#door)"/>
	<rect x="-900" y="680" width="4400" height="900" fill="url(#plaza)"/>
	<path d="M-900,680 L3500,680" stroke="#8A8270" stroke-width="2" opacity=".6"/>
	<rect x="-900" y="-600" width="4400" height="2200" fill="url(#spill)"/>`;
	const tone = (k) => ['#1C1714', '#1F1916', '#18130F'][k % 3];
	let far = '', near = '';
	for (let i = 0; i < 30; i++) { const x = 240 + i * 100 + (rnd(i + 70) - 0.5) * 30, h = 236 + rnd(i + 71) * 34; far += K.visitor(x, 818, h, -1, '#262321'); }
	const pack = (x, g, h, col, kind) => { const u = h / 8, X = (d) => x - d * u, Y = (d) => g - d * u;
		return kind === 'bag' ? `<path d="M${X(-0.3)},${Y(6.3)} L${X(0.5)},${Y(4.2)}" stroke="${col}" stroke-width="${0.12 * u}"/><rect x="${X(0.75)}" y="${Y(4.5)}" width="${0.7 * u}" height="${0.75 * u}" rx="${0.12 * u}" fill="${col}"/>`
			: `<path d="M${X(-0.62)},${Y(6.25)} C${X(-1.25)},${Y(6.1)} ${X(-1.35)},${Y(5.0)} ${X(-1.2)},${Y(4.3)} L${X(-0.6)},${Y(4.35)} Z" fill="${col}"/>`; };
	for (let i = 0; i < 21; i++) { const x = 300 + i * 136 + (rnd(i + 80) - 0.5) * 34, kid = i === 4, h = kid ? 220 : 318 + rnd(i + 81) * 62;
		near += K.visitor(kid ? x + 30 : x, 968, h, -1, tone(i)) + (i % 3 === 1 ? pack(x, 968, h, tone(i), 'pack') : i % 4 === 2 ? pack(x, 968, h, tone(i), 'bag') : ''); }
	let posts = '', rope = 'M150,904';
	for (let i = 0; i <= 15; i++) { const x = 150 + i * 196; posts += `<rect x="${x - 7}" y="884" width="14" height="96" fill="#A88A5E"/><rect x="${x - 22}" y="976" width="44" height="10" rx="4" fill="#7A6444"/><circle cx="${x}" cy="882" r="10" fill="#E8C690"/>`;
		if (i) rope += ` Q${x - 98},${936} ${x},904`; }
	HW = {back: svg0 + `<g filter="url(#qb2)" opacity=".92"><g filter="url(#rimQf)">${far}</g></g><g filter="url(#rimQ)">${near}</g>`,
		front: `<path d="${rope}" stroke="#8A2E22" stroke-width="9" fill="none"/><path d="${rope}" stroke="#C8584A" stroke-width="3" fill="none" opacity=".6" transform="translate(0,-2)"/>${posts}`};
	return HW;
};
/** phone torches in the line (3–4 small points flickering at random 0.2–0.6 s) */
const torches = (t) => [[520, 760, 0], [905, 905, 1], [1380, 750, 2], [1690, 900, 3]].map(([x, y, i]) => {
	const per = 0.2 + 0.4 * rnd(i + 900), on = rnd(Math.floor(t / per) * 7.3 + i * 31) > 0.35 ? 1 : 0.25;
	return `<circle cx="${x}" cy="${y}" r="5" fill="#F4FAFF" opacity="${0.9 * on}"/><circle cx="${x}" cy="${y}" r="22" fill="#E6F0F6" opacity="${0.18 * on}" filter="url(#qb12)"/>`; }).join('');
const hallWorld = (t) => { const h = hallBase(); return P.wideFilters(P.scope(h.back + torches(t) + h.front, 'hz')); };
const hallVig = `<radialGradient id="hvig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0B0D0E" stop-opacity="0"/><stop offset="1" stop-color="#0B0D0E" stop-opacity=".6"/></radialGradient>`;

// ---- the title (v7_t_title.js) with the slam
const titleHtml = (t) => {
	if (t < TITLE || t >= 11.62) return '';
	const u = P.seg(t, TITLE, TITLE + 0.12), sc = 1.25 - 0.25 * P.easeOut(u), jy = P.jolt(t, TITLE + 0.12, 6, 0.36, 2);
	const op = 1 - P.smooth(P.seg(t, 11.36, 11.60));
	const su = P.seg(t, TITLE + 0.16, TITLE + 0.30), seal = su <= 0 ? 'opacity:0' : `opacity:${(0.95 * Math.min(1, su * 3)).toFixed(3)};transform:rotate(-6deg) scale(${(1.25 - 0.25 * P.easeOut(su)).toFixed(3)})`;
	return `<div id="title" style="position:absolute;left:0;right:0;top:806px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:128px;line-height:1;letter-spacing:.06em;white-space:nowrap;z-index:20;opacity:${op.toFixed(3)};transform:translateY(${jy.toFixed(2)}px) scale(${sc.toFixed(4)});transform-origin:50% 60%">
	 <div style="position:absolute;left:0;right:0;top:-40px;height:2px;background:linear-gradient(90deg,rgba(200,105,58,0) 22%,rgba(232,150,90,.85) 50%,rgba(200,105,58,0) 78%)"></div>
	 <span style="color:#FFF1DC;text-shadow:0 0 3px rgba(10,8,6,.9),0 4px 26px rgba(10,8,6,.85)">七个回国<span style="margin-right:-.5em">，</span></span><span style="color:#FFB070;background:linear-gradient(180deg,#FFD9A6 0%,#F09A5E 55%,#C8693A 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 18px rgba(255,140,70,.45)) drop-shadow(0 3px 6px rgba(10,8,6,.9))">一个回家</span><img src="${window.JSEAL}" style="width:92px;height:92px;transform:rotate(-6deg);vertical-align:top;margin-left:22px;margin-top:-30px;${seal}">
	</div>`;
};
// ---- HUD: subtitle, stamp, counter rows
const counter = (t) => {
	if (t >= TITLE + 0.15) return '';
	const op = 1 - P.seg(t, TITLE, TITLE + 0.15);
	let lab = '回来了', num = '?', dots = '';
	if (t < 3.997) { if (t >= P.BAR0 && t < 3.9) num = String(Math.floor(rnd(Math.floor(t * 15) + 11) * 13)); }
	else { lab = '回国'; num = String(Object.values(LIGHT).filter((x) => t >= x).length + (t >= FLARE ? 1 : 0)); }
	for (const z of ZOD) {
		if (z === '马') dots += t >= FLARE ? `<span class="o y" style="box-shadow:0 0 ${14 + 16 * Math.exp(-(t - FLARE) / 0.3)}px #FF9A5A"></span>` : P.dot('y');
		else if (LIGHT[z] !== undefined) dots += P.dot('r', P.seg(t, LIGHT[z], LIGHT[z] + 0.12));
		else dots += P.dot('d', P.seg(t, FLARE, FLARE + 0.15));
	}
	const rows = [{lab, num: num + '/12', dots}];
	if (t >= LIFT) { const u = P.seg(t, LIFT, LIFT + 0.2), s = 1.3 - 0.3 * P.easeOut(u);
		rows.push({lab: '回园', num: '1/12', dots: ZOD.map((z) => P.dot(z === '马' ? 'y' : 'e')).join(''), style: `transform:scale(${s.toFixed(3)});transform-origin:0 50%;opacity:${Math.min(1, u * 4).toFixed(3)}`}); }
	return P.blockHtml(rows, null, {op});
};
const LINES = window.LINES45;
const render = (t) => {
	const cam = camRing(t), dx = caseDx(t), meta = {cam, camId: 0, events: []};
	let svg = '', hudParts = [];
	const titleOn = t >= TITLE;
	if (t < N1) {
		// --- the ring
		const dof = P.smooth(P.seg(t, TITLE, TITLE + 0.35));
		const world = ringWorld(t, {noHero: titleOn});
		svg += `<g transform="${P.camT(cam)}">${dof > 0.01 ? `<defs>${K.blur('dof', (7 * dof).toFixed(2))}</defs><g filter="url(#dof)">${world}</g>` : world}</g>`;
		if (titleOn) svg += `<rect width="1920" height="1080" fill="#0E1416" opacity="${(0.28 * dof).toFixed(3)}"/>
			<g transform="${P.camT(cam)}"><g filter="url(#r7rimN)">${heroSeat.back}</g>${K.horseHead(heroAt(t))}</g>`;
		// screen-space: vignette (H1 → H3 → title)
		const vc = P.lerp(960, 900, P.smooth(P.seg(t, 5.98, 7.1)) * (1 - dof)), va = P.lerp(0.6, 0.55, P.smooth(P.seg(t, 5.98, 7.1)));
		svg += `<defs><radialGradient id="vig" cx="${vc}" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity="${va}"/></radialGradient>
			<radialGradient id="tvig" cx="960" cy="470" r="1100" gradientUnits="userSpaceOnUse"><stop offset=".35" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".7"/></radialGradient>
			<linearGradient id="tfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0E1112" stop-opacity="0"/><stop offset="1" stop-color="#0E1112" stop-opacity=".78"/></linearGradient>
			<radialGradient id="caseGlow" cx="${1580 + dx}" cy="520" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E6C6" stop-opacity=".22"/><stop offset="1" stop-color="#F6E6C6" stop-opacity="0"/></radialGradient></defs>`;
		const caseOn = dx < 640;
		if (caseOn && !titleOn) svg += `<rect width="1920" height="1080" fill="url(#caseGlow)" opacity="${(1 - dx / 640).toFixed(3)}"/>`;
		// the flights are drawn before the cases' frames only for the trails; heads on top (below)
		if (!titleOn && caseOn) {
			const blur = caseVel(t) / 30 / 3, lab = 1 - P.seg(t, 7.3, 7.6);
			const cs = CASES.map((c) => vitrine(c, dx, (k) => t >= LAND[k], lab)).join('');
			svg += blur > 0.6 ? `<defs><filter id="mb" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2400" height="1480"><feGaussianBlur stdDeviation="${blur.toFixed(2)} 0"/></filter></defs><g filter="url(#mb)">${cs}</g>` : cs;
		}
		if (!titleOn) svg += flights(t, cam, dx);
		svg += `<rect width="1920" height="1080" fill="url(#vig)" opacity="${(1 - dof).toFixed(3)}"/>`;
		if (titleOn) svg += `<rect y="640" width="1920" height="440" fill="url(#tfloor)" opacity="${dof.toFixed(3)}"/><rect width="1920" height="1080" fill="url(#tvig)" opacity="${dof.toFixed(3)}"/>`;
		// the 保利 case returns for the title (lit, four ivory heads, no label) and becomes the pane
		if (titleOn && caseOn) {
			const blur = caseVel(t) / 30 / 3, c = CASES[0];
			const cs = `<rect width="1920" height="1080" fill="url(#caseGlow)" opacity="${(1 - dx / 640).toFixed(3)}"/>` + vitrine(c, dx, () => true, 0);
			svg += blur > 0.6 ? `<defs><filter id="mb" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2400" height="1480"><feGaussianBlur stdDeviation="${blur.toFixed(2)} 0"/></filter></defs><g filter="url(#mb)">${cs}</g>` : cs;
		}
		// mode 14 rect-grow: the case's glass grows to full frame with the Hangzhou hall inside, framed so its four cases sit where the four heads sat
		if (t >= GROW0) {
			const u = P.smooth(P.seg(t, GROW0, GROW1)), c = CASES[0];
			const R = {x: P.lerp(c.x + dx, 0, u), y: P.lerp(c.y, 0, u), w: P.lerp(c.w, 1920, u), h: P.lerp(c.h, 1080, u)};
			const s = R.w / 1920, oy = R.y + R.h / 2 - 540 * s, hc = camHall(N1);
			const fin = P.seg(t, GROW0, GROW0 + 0.12);
			svg += `<defs><clipPath id="pane"><rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}"/></clipPath>${hallVig}</defs>
			<g clip-path="url(#pane)" opacity="${fin.toFixed(3)}"><g transform="translate(${R.x},${oy}) scale(${s})"><g transform="${P.camT(hc)}">${hallWorld(t)}</g><rect width="1920" height="1080" fill="url(#hvig)"/></g></g>
			<rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" fill="none" stroke="#F6EAD2" stroke-width="3" opacity="${(0.75 * (1 - u)).toFixed(3)}"/>
			<path d="M${R.x + 16 + R.w * 0.6 * u},${R.y + 14} l${44 + 300 * u},0" stroke="#FFFFFF" stroke-width="4" opacity="${(0.55 * (1 - u)).toFixed(3)}"/>`;
			meta.events.push({grow: u});
		}
	} else {
		const hc = camHall(t); meta.cam = hc; meta.camId = 1;
		svg += `<defs>${hallVig}</defs><g transform="${P.camT(hc)}">${hallWorld(t)}</g><rect width="1920" height="1080" fill="url(#hvig)"/>`;
	}
	// --- HUD
	const ln = P.lineAt(LINES, t, {'可住回圆明园的，[只有一个]。': TITLE});
	if (ln) hudParts.push(P.subHtml(ln[2], t, ln[0]));
	if (t < TITLE) hudParts.push(P.stampHtml('圆明园 · 十二兽首', '海晏堂 · 水力钟'));
	else if (t < TITLE + 0.15) hudParts.push(P.stampHtml('圆明园 · 十二兽首', '海晏堂 · 水力钟', {op: 1 - P.seg(t, TITLE, TITLE + 0.15)}));
	if (t >= N1) hudParts.push(P.stampHtml('2026 · 杭州', '浙江省博物馆 · 四兽首'));
	if (t < N1) hudParts.push(counter(t)); else hudParts.push(P.blockHtml([], '当代'));
	const sealOp = t < TITLE ? 1 : t < TITLE + 0.15 ? 1 - P.seg(t, TITLE, TITLE + 0.15) : t >= N1 ? 1 : 0;
	if (sealOp > 0) hudParts.push(P.sealHtml(sealOp));
	hudParts.push(titleHtml(t));
	return {svg, hud: P.hud(hudParts), meta};
};
P.SCENES.hook = {t0: 0, t1: 12.6, render, cam: (t) => (t < N1 ? camRing(t) : camHall(t))};
})();

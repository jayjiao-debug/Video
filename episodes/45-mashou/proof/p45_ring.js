// ep45 proofs: the RING (v8: zodiac clock, every head at one scale, the horse front-centre and the only lit head) as a re-timeable
// machine. P.makeRing(T) → functions of t for the world, the hero, the lights / dashes / lift-off / flights into the two cases,
// and the counter dots. T = {RIM, LIGHT:{k: t}, FLARE, LIFT, LAND:{k: t}, CASE_IN:[a,b], CASE_OUT:[a,b], LAB_OUT:[a,b], TRAIL_END}.
// The v8 hook uses it with no events (everyone stays on their seat); the payoff (C1/C2) uses the v7 hook animation re-based.
(() => {
const P = window.P45, rnd = K.rnd;
P.ZOD = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
P.makeRing = (T0 = {}) => {
	const T = {RIM: -1, LIGHT: {}, FLARE: Infinity, LIFT: Infinity, LAND: {}, CASE_IN: [Infinity, Infinity], CASE_OUT: [Infinity, Infinity], LAB_OUT: [Infinity, Infinity], TRAIL_END: Infinity, ...T0};
	const {LIGHT, FLARE, LIFT, LAND} = T, RISE = 0.15;
	const DASH = ['龙', '蛇', '羊', '鸡', '狗'];
	const CASE_OF = {牛: 0, 虎: 0, 猴: 0, 猪: 0, 鼠: 1, 兔: 1};
	const CASES = [{x: 1340, y: 236, w: 460, h: 236, heads: ['牛', '虎', '猴', '猪'], label: '保利艺术博物馆 ×4', size: 96},
		{x: 1340, y: 600, w: 460, h: 200, heads: ['鼠', '兔'], label: '国家博物馆 ×2', size: 120}];
	const pos = K.ringPos(), hp = pos.find((p) => p.k === '马'), HL = K.ringHeroLight(pos);
	const heroSeat = K.ringSeat(hp, 'hero'), hero0 = heroSeat.hero;
	const face = [hero0.x - 0.28 * hero0.h, hero0.y - 0.52 * hero0.h];   // the head's visual centre (title framing point)
	let RW = null; const ringBase = () => RW ?? (RW = K.ringNightWide({heroX: HL.x, heroY: HL.y}));
	/** moonlit shimmer on the pool, the moon's reflection, the copper glints under the horse (living motion) */
	const shimmer = (t) => {
		let s = '';
		for (let i = 0; i < 9; i++) { const y = 655 + i * 13, w = 30 + 40 * rnd(i + 40), x = 540 + 26 * P.noise(t * 1.3 + i * 3.1, i) - w / 2, a = 0.10 + 0.16 * (0.5 + 0.5 * P.noise(t * 2.2 + i, i + 9));
			s += `<path d="M${x.toFixed(1)},${y} l${w.toFixed(1)},0" stroke="#E8F0EA" stroke-width="2" opacity="${a.toFixed(3)}" stroke-linecap="round"/>`; }
		for (let i = 0; i < 7; i++) { const y = 640 + i * 26, a = 0.035 * (0.5 + 0.5 * P.noise(t * 0.9 + i * 2.3, i + 30)); s += `<path d="M${280 + i * 40},${y} L${1640 - i * 40},${y}" stroke="#E6EEE6" stroke-width="1.6" opacity="${a.toFixed(3)}"/>`; }
		for (let i = 0; i < 5; i++) { const y = 660 + i * 34, w = 22 + 20 * rnd(i + 80), x = HL.x + 16 * P.noise(t * 1.6 + i * 2.7, i + 50) - w / 2, a = 0.18 + 0.22 * (0.5 + 0.5 * P.noise(t * 2.4 + i, i + 60));
			s += `<path d="M${x.toFixed(1)},${y} l${w.toFixed(1)},0" stroke="#FFC890" stroke-width="2.2" opacity="${a.toFixed(3)}" stroke-linecap="round"/>`; }
		return s;
	};
	const DARK = '#2B2521', IVORY = '#E9DCC4', IVD = '#B4A48A';   // v2: the lit brothers in a dim warm ivory (the horse stays brightest)
	const cx0 = pos.reduce((a, p) => a + p.x, 0) / pos.length, cy0 = pos.reduce((a, p) => a + p.y, 0) / pos.length;
	const ang = (p) => Math.atan2((p.y - cy0) * 2.4, p.x - cx0), aH = ang(hp);
	const SWEEP_ORD = pos.filter((p) => p.k !== '马').map((p) => ({k: p.k, a: (((ang(p) - aH) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)})).sort((a, b) => a.a - b.a).map((q) => q.k);
	const sweepAt = (k) => { if (!T.SWEEP) return Infinity; const i = SWEEP_ORD.indexOf(k); return T.SWEEP[0] + (T.SWEEP[1] - T.SWEEP[0]) * (i + 1) / 12; };
	const sweepHead = (p, g, t) => { const ts = sweepAt(p.k); if (t < ts - 0.06 || t > ts + 0.9) return ''; const a = t < ts ? P.seg(t, ts - 0.06, ts) : Math.exp(-(t - ts) / 0.22);
		return `<g opacity="${(0.85 * a).toFixed(3)}">${K.bro(p.k, g.hx, g.hy, g.size, p.face, '#C8693A')}</g>`; };
	const headGeo = (p) => { const h = 160 * p.s, b = K.stoneBody(p.x, p.y, h, p.face, '#353530'), [tx, ty] = b.top; return {hx: tx + p.face * 4 * p.s, hy: ty + 22 * p.s, size: 175 * p.s, top: [tx, ty]}; };
	const dashHead = (p, op) => `<g opacity="${op}">${K.ringSeat(p, 'dash').head}</g>`;
	const seatSvg = (p, t) => {
		const k = p.k, stone = '#353530', h = 160 * p.s;
		if (k === '马') return {back: heroSeat.back, head: ''};
		if (LIGHT[k] !== undefined) {
			if (t >= LIFT) return {back: K.emptySeat(p.x, p.y, h, p.face, stone, '#E9DCC4'), head: ''};
			const g = headGeo(p), u = P.seg(t, LIGHT[k], LIGHT[k] + 0.12);
			return {back: K.stoneBody(p.x, p.y, h, p.face, stone).svg, head: K.bro(k, g.hx, g.hy - 4 * u, g.size, p.face, P.mixC(DARK, IVD, u))};
		}
		const g = headGeo(p);
		if (DASH.includes(k)) {
			const u = P.seg(t, FLARE, FLARE + 0.15);
			const dark = u < 1 ? `<g opacity="${(1 - u).toFixed(3)}">${K.bro(k, g.hx, g.hy, g.size, p.face, DARK)}</g>` : '';
			return {back: K.stoneBody(p.x, p.y, h, p.face, stone).svg, head: dark + (u > 0 ? dashHead(p, (0.95 * u).toFixed(3)) : '') + sweepHead(p, g, t)};
		}
		return {back: K.stoneBody(p.x, p.y, h, p.face, stone).svg, head: K.bro(k, g.hx, g.hy, g.size, p.face, DARK) + sweepHead(p, g, t)};
	};
	const heroAt = (t, extra = {}) => {
		const breathe = 1 + 0.03 * Math.sin(2 * Math.PI * (t - P.BAR0) / (4 * P.BEAT));
		const fl = t >= FLARE ? Math.exp(-(t - FLARE) / 0.35) : 0;
		return {...hero0, glow: 1.1 * breathe + 0.7 * fl, key: 1.7 + 0.35 * fl, ...extra};
	};
	/** a copper rim sweeps across the horse left → right (0.4 s from T.RIM): a hotter copy of the head under a moving band */
	const rimSweep = (t) => {
		const u = P.seg(t, T.RIM, T.RIM + 0.4); if (u <= 0 || u >= 1) return '';
		const x0 = hero0.x - 0.95 * hero0.h, x1 = hero0.x + 0.45 * hero0.h, bx = P.lerp(x0, x1, P.smooth(u)), w = 0.16 * hero0.h, a = Math.sin(Math.PI * u);
		return `<defs><linearGradient id="swg" gradientUnits="userSpaceOnUse" x1="${bx - w}" x2="${bx + w}" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
		<mask id="swm" maskUnits="userSpaceOnUse" x="${hero0.x - 600}" y="${hero0.y - 600}" width="1200" height="800"><rect x="${hero0.x - 600}" y="${hero0.y - 600}" width="1200" height="800" fill="url(#swg)"/></mask></defs>
		<g mask="url(#swm)" opacity="${(0.9 * a).toFixed(3)}">${K.horseHead({...heroAt(t), glow: 0, key: 2.9, rimK: 1.5, rim: '#FFD9A6'})}</g>`;
	};
	/** o: {noHero, heroExtra: svg drawn between the horse's seat and its head (e.g. the price tag)} */
	const ringWorld = (t, o = {}) => {
		let far = '', near = '';
		for (const p of pos) {
			const s = seatSvg(p, t), g = `<g filter="url(#${p.arc === 'far' ? 'r7rimF' : 'r7rimN'})">${s.back}${s.head}</g>`;
			const hs = p.k === '马' ? K.heroSeatLight(heroSeat.top, p.s) + (o.heroExtra ?? '') + (o.noHero ? '' : K.horseHead(heroAt(t)) + rimSweep(t)) : '';
			if (p.arc === 'far') far += g + hs; else near += g + hs;
		}
		return P.wideFilters(ringBase() + shimmer(t) + K.ringRims() + far + near);
	};
	// ---- the two glass cases (screen space; slide in from the right, then out)
	const caseDx = (t, i = 0) => 640 * (1 - P.smooth(P.seg(t, ...T.CASE_IN))) + 640 * P.smooth(P.seg(t, ...(i === 1 && T.CASE_OUT_B ? T.CASE_OUT_B : T.CASE_OUT)));
	const caseVel = (t, i = 0) => Math.abs(caseDx(t + 1 / 60, i) - caseDx(t - 1 / 60, i)) * 30;
	const vitrine = (c, dx, present, lab) => {
		const x = c.x + dx, {y, w, h} = c, id = 'vt' + c.size;
		let in_ = '';
		c.heads.forEach((k, i) => { const n = c.heads.length, hx = x + 20 + (i + 0.5) * (w - 40) / n, hy = y + h - 34;
			in_ += `<rect x="${hx - c.size * 0.32}" y="${hy}" width="${c.size * 0.64}" height="34" fill="#C9B79A" opacity=".55"/>` + (present(k) ? K.bro(k, hx, hy, c.size, -1, IVD) : ''); });
		return `<defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF4DE" stop-opacity=".38"/><stop offset="1" stop-color="#E8D2AA" stop-opacity=".12"/></linearGradient></defs>
		<rect x="${x - 10}" y="${y + h}" width="${w + 20}" height="92" fill="#2E2621"/><path d="M${x - 10},${y + h} L${x + w + 10},${y + h}" stroke="#E8C690" stroke-width="3" opacity=".7"/>
		<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>${in_}
		<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#F6EAD2" stroke-width="3" opacity=".75"/>
		<path d="M${x + 16},${y + 14} L${x + 60},${y + 14} M${x + 16},${y + 14} L${x + 16},${y + 80}" stroke="#FFFFFF" stroke-width="4" opacity=".55"/>
		${lab > 0 ? `<text x="${x + w / 2}" y="${y + h + 64}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="48" fill="#FFF1DC" opacity="${lab.toFixed(3)}">${c.label}</text>` : ''}`;
	};
	const casesSvg = (t) => {
		const dx0 = caseDx(t, 0), lab = 1 - P.seg(t, ...T.LAB_OUT); let out = '';
		if (dx0 < 640) out += `<defs><radialGradient id="caseGlow" cx="${1580 + dx0}" cy="520" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E6C6" stop-opacity=".22"/><stop offset="1" stop-color="#F6E6C6" stop-opacity="0"/></radialGradient></defs>
			<rect width="1920" height="1080" fill="url(#caseGlow)" opacity="${(1 - dx0 / 640).toFixed(3)}"/>`;
		CASES.forEach((c, i) => { const dx = caseDx(t, i); if (dx >= 640) return; const blur = caseVel(t, i) / 30 / 3, cs = vitrine(c, dx, (k) => t >= LAND[k], lab);
			out += cs; });   // v2: no motion blur on the cases
		return out;
	};
	const slot = (k, dx0) => { const c = CASES[CASE_OF[k]], i = c.heads.indexOf(k), n = c.heads.length, dx = caseDx(T.__t ?? 0, CASE_OF[k]); return [c.x + dx + 20 + (i + 0.5) * (c.w - 40) / n, c.y + c.h - 34, c.size]; };
	const bez = (a, b, c, d, u) => { const m = 1 - u; return [0, 1].map((j) => m * m * m * a[j] + 3 * m * m * u * b[j] + 3 * m * u * u * c[j] + u * u * u * d[j]); };
	/** the six in flight (screen space) + their ivory trails */
	const flights = (t, cam) => {
		if (t < LIFT || t > T.TRAIL_END) return '';
		T.__t = t; const dx = caseDx(t); let heads = '', trails = '';
		Object.keys(LAND).forEach((k, i) => {
			const p = pos.find((q) => q.k === k), g = headGeo(p), rise = 34 * P.easeOut(P.seg(t, LIFT, LIFT + RISE));
			const p0 = P.toScr(cam, [g.hx, g.hy - 4 - rise]), [sx, sy, ss] = slot(k, dx), p3 = [sx, sy];
			const c1 = [p0[0] + 170, p0[1] - 130 + i * 6], c2 = [p3[0] - 240, p3[1] - 50];
			const u = P.smooth(P.seg(t, LIFT + RISE, LAND[k])), pt = bez(p0, c1, c2, p3, u);
			const top = P.toScr(cam, [g.top[0], g.top[1] - 10]), fade = 1 - P.seg(t, LAND[k], T.TRAIL_END);
			if (u > 0.01 && fade > 0) {
				let d = `M${top[0].toFixed(1)},${top[1].toFixed(1)}`; const tc1 = [top[0] + 170, top[1] - 130 + i * 6];
				for (let j = 1; j <= 16; j++) { const q = bez(top, tc1, c2, p3, u * j / 16); d += ` L${q[0].toFixed(1)},${q[1].toFixed(1)}`; }
				trails += `<path d="${d}" stroke="url(#trail)" stroke-width="${(10 - i * 0.6).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${fade.toFixed(3)}" filter="url(#tb4)"/>`;
			}
			if (t < LAND[k]) { const size = P.lerp(g.size * cam.z, ss, u), f = P.lerp(p.face, -1, P.smooth(u));
				heads += K.bro(k, pt[0], pt[1], size, Math.abs(f) < 0.04 ? 0.04 * Math.sign(f || -1) : f, IVD); }
		});
		return `<defs><linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#F3E6CF" stop-opacity="0"/><stop offset="1" stop-color="#F3E6CF" stop-opacity=".55"/></linearGradient>${K.blur('tb4', 4)}
		${K.rimFilter('flyRim', 4 * cam.z, 4 * cam.z, '#C9DAD4', 0.68, 1.3)}</defs>${trails}<g filter="url(#flyRim)">${heads}</g>`;
	};
	/** counter row 1 dots: neutral until the lights; r on each light, d on the flare, the horse y on the flare */
	const dots = (t) => P.ZOD.map((z) => {
		if (z === '马') return t >= FLARE ? `<span class="o y" style="box-shadow:0 0 ${(14 + 16 * Math.exp(-(t - FLARE) / 0.3)).toFixed(1)}px #FF9A5A"></span>` : P.dot('y', 0);
		if (LIGHT[z] !== undefined) return P.dot('r', P.seg(t, LIGHT[z], LIGHT[z] + 0.12));
		return P.dot('d', P.seg(t, FLARE, FLARE + 0.15));
	}).join('');
	const lit = (t) => Object.values(LIGHT).filter((x) => t >= x).length + (t >= FLARE ? 1 : 0);
	return {T, pos, hp, HL, heroSeat, hero0, face, ringWorld, heroAt, casesSvg, flights, dots, lit, CASES};
};
/** the ring's screen vignette, centred on the horse */
P.ringVig = (cam, HL, op = 1) => { const s = P.toScr(cam, [HL.x, HL.y + 20]);
	return `<defs><radialGradient id="vig" cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".52"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#vig)" opacity="${op.toFixed(3)}"/>`; };
/** ease that is already moving at both ends (0.5 linear + 0.5 smoothstep: start/end speed 0.5×, peak 1.25× the mean) */
P.easeMix = (u) => { u = P.clamp(u); return 0.5 * u + 0.5 * u * u * (3 - 2 * u); };
})();

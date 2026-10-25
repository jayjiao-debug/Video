// ep45 FULL FILM (script v8.1, lines_v81s.json), part A: POOL 15.3 – 29.8 (A2 noon arcs, B1 soldier band → red dusk + the march,
// B2 the fire on bar 10 + the looter's lift + two carriers + smoke, RR the counter re-asks, tilt up into the smoke) and SALE
// 29.2 – 48.45 (ink-bleed to London 1989: D1–D3 as proof 2; the lamp swing to 2007: D4 push, D5 the breakdown, D6 「撤拍」 + the
// lamps out row by row + the spot narrowing). The sets are the approved v7 key-frame sets (v7_a2_noon, v7_b2_taken, K.saleLondon,
// v7_d5_2007) re-cut as functions of t; figures walk on the film rig (WALKER: mocap gait, planted feet) with the 1860 kepi.
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat;
const F = P.FILM = P.FILM ?? {};
// ------------------------------------------------------------------------------------------------ POOL
const N = P.NOON;   // the noon set from the hook (NOON_T world), its horse at brother scale
const STR = window.STAFF_STRIDE;
const horseSeat = N.items.find((q) => q.k === '马');
const HSEAT = N.NW([horseSeat.st.hero.x, horseSeat.st.hero.y]);              // the neck cut on the seat (world)
const BAND = [B(30), B(30) + 0.52], FIRE = B(40 / 4 * 4 / 4 * 0 + 40) * 0 + (P.BAR0 + 10 * 4 * P.BEAT);   // bar 10 = 24.09
const LIFT = FIRE, ALL12 = P.BAR0 + 7 * 4 * P.BEAT, FALL = B(30);
const SMOKE0 = 25.0, EMPTY = 26.0, RR = 26.356, TILT = [28.7, 29.5];
const AFACE = N.nFace;
const C_B2 = [AFACE[0] + 230, AFACE[1] + 150, 1.3];
const camPool = P.cam([960, 540, 1.0], [
	{t0: 15.3, t1: 18.4, to: [960, 560, 1.06]},
	{t0: 19.8, t1: 22.3, to: C_B2},
	{t0: 22.3, t1: 26.3, to: [C_B2[0] + 90, C_B2[1], C_B2[2] * 1.03]},
	{t0: TILT[0], t1: TILT[1], to: [C_B2[0] + 90, C_B2[1] - 300, C_B2[2] * 1.03]},
]);
F.camPool = camPool;
// the fire set: the b2 flames (built once), statues in 'fire' mode, the windows lit as the fire takes
let FB = null;
const fireBase = () => {
	if (FB) return FB;
	const env = (x) => Math.max(0, 0.55 + 0.45 * Math.sin(x / 210 + 0.6) * Math.cos(x / 97 + 1.3) + 0.25 * Math.sin(x / 41));
	const tongue = (x, base, h, w, lean, fork) => { const tip = [x + lean, base - h];
		let d = `M${x - w / 2},${base} C${x - w * 0.62},${base - h * 0.35} ${x + lean * 0.3 - w * 0.34},${base - h * 0.62} ${tip[0]},${tip[1]}`;
		d += fork ? ` C${x + lean * 0.6},${base - h * 0.72} ${x + lean * 0.5 + w * 0.1},${base - h * 0.62} ${x + lean * 0.7 + w * 0.32},${base - h * 0.8} C${x + w * 0.4},${base - h * 0.5} ${x + w * 0.66},${base - h * 0.3} ${x + w / 2},${base} Z`
			: ` C${x + lean * 0.4 + w * 0.32},${base - h * 0.6} ${x + w * 0.7},${base - h * 0.32} ${x + w / 2},${base} Z`; return d; };
	let fB = '', fF = '';
	for (let i = 0; i < 34; i++) { const x = 160 + rnd(i + 40) * 1600, e = env(x); if (e < 0.15) continue; fB += `<path d="${tongue(x, 420, 120 + e * 300 * (0.6 + 0.6 * rnd(i + 3)), 70 + rnd(i + 5) * 120, (rnd(i + 7) - 0.3) * 120, rnd(i + 9) > 0.6)}"/>`; }
	for (let i = 0; i < 46; i++) { const x = 180 + rnd(i + 140) * 1560, e = env(x + 40); if (e < 0.22) continue; fF += `<path d="${tongue(x, 410, 40 + e * 200 * (0.4 + 0.8 * Math.pow(rnd(i + 103), 1.5)), 30 + rnd(i + 105) * 70, (rnd(i + 107) - 0.3) * 80, rnd(i + 109) > 0.55)}"/>`; }
	const st = {}; for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) { const k = side < 0 ? K.ROW_L[i] : K.ROW_R[i]; st[k] = {full: K.statue(k, side, i, 'fire'), empty: K.statue(k === '马' ? '马' : k, side, i, 'fire', {empty: true}), side, i}; }
	FB = {fB, fF, st, facade: K.facade('fire'), stairs: K.stairs('fire'), pool: K.pool('fire')};
	return FB;
};
const fireDefs = (fl) => `<defs>
	 <linearGradient id="fsky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="640"><stop offset="0" stop-color="#2E1E22"/><stop offset=".38" stop-color="#6A2E24"/><stop offset=".72" stop-color="#BA562E"/><stop offset="1" stop-color="#E8924C"/></linearGradient>
	 <linearGradient id="flB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF9A48"/><stop offset=".5" stop-color="#D24A22" stop-opacity=".85"/><stop offset="1" stop-color="#8A2412" stop-opacity="0"/></linearGradient>
	 <linearGradient id="flF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE9B0"/><stop offset=".3" stop-color="#FFB04E"/><stop offset=".7" stop-color="#EA6028" stop-opacity=".8"/><stop offset="1" stop-color="#C0401E" stop-opacity="0"/></linearGradient>
	 <linearGradient id="winfire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${P.mixC('#3A2016', '#FFD27A', fl)}"/><stop offset="1" stop-color="${P.mixC('#2A1610', '#E86A2E', fl)}"/></linearGradient>
	 <linearGradient id="poolF" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="670" y2="930"><stop offset="0" stop-color="#6A2E1C"/><stop offset=".45" stop-color="#2E160F"/><stop offset="1" stop-color="#1A0D09"/></linearGradient>
	 <linearGradient id="ffg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A2A1E"/><stop offset="1" stop-color="#1E120D"/></linearGradient>
	 <radialGradient id="smk" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#7A3A26"/><stop offset=".55" stop-color="#3A2224"/><stop offset="1" stop-color="#2A1A1E" stop-opacity="0"/></radialGradient>
	 ${K.rimFilter('rimFire', -2, 5, '#FFA458', 0.95, 1.1)}${K.rimFilter('rimFig', -5, 3, '#FFB070', 0.95, 1.4)}${K.blur('fb3', 3)}${K.blur('fb7', 7)}${K.blur('fb40', 40)}${K.blur('fhz', 2.5)}</defs>`;
/** the 1860 soldier on the film rig + the kepi. o: {x, ground, h, face, u, stand, carry, reach, col} */
const soldier = (o) => { const w = window.WALKER({look: 'soldier', col: o.col ?? '#140C09', rim: '#FFB070', rimOp: 0.5, ...o});
	return {...w, svg: w.svg + K.kepi(w.head[0], w.head[1] - w.r * 0.05, w.r * 1.02, o.face, o.col ?? '#140C09')}; };
/** the six marchers of B1 (enter from the right, walking left, halt in a line), the looter (from the left, lifts the horse on bar
 *  10, carries it out right), two carriers behind him. All in world space on the front flagstones. */
const MARCH = Array.from({length: 6}, (_, i) => ({t0: 19.0 + 0.283 * i, x0: 2250, x1: 1150 + 140 * i, h: 430, g: 1062}));
const marchers = (t) => MARCH.map((m, i) => {
	if (t < m.t0) return '';
	const v = STR * m.h / 1.325, d = Math.min(m.x0 - m.x1, (t - m.t0) * v), arr = m.t0 + (m.x0 - m.x1) / v, x = m.x0 - d;
	return soldier({x, ground: m.g, h: m.h, face: -1, u: d / (STR * m.h) + 0.1 * i, stand: P.smooth(P.seg(t, arr, arr + 0.35))}).svg;
}).join('');
const LOOT = {h: 470, g: 1066, x0: -260, xs: HSEAT[0] - 150, rate: 1.4};
const looter = (t) => {
	const v = STR * LOOT.h / 1.325, tArr = 22.4 + (LOOT.xs - LOOT.x0) / v;
	let x, u, stand = 0, carry = 0, reachP = null, horse = null;
	if (t < 22.4) return {svg: '', horse: null};
	if (t < tArr) { x = LOOT.x0 + (t - 22.4) * v; u = (x - LOOT.x0) / (STR * LOOT.h); }
	else if (t < LIFT + 0.45) { x = LOOT.xs; u = (LOOT.xs - LOOT.x0) / (STR * LOOT.h); stand = P.smooth(P.seg(t, tArr, tArr + 0.3));
		const lift = P.smooth(P.seg(t, LIFT, LIFT + 0.28)), r0 = [HSEAT[0] - 8, HSEAT[1] - 6];
		if (t >= LIFT - 0.5) reachP = lift < 1 ? r0 : null;
		carry = lift; horse = {k: lift}; }
	else { const tw = t - (LIFT + 0.45); x = LOOT.xs + tw * v * LOOT.rate; u = (LOOT.xs - LOOT.x0) / (STR * LOOT.h) + (x - LOOT.xs) / (STR * LOOT.h); carry = 1; horse = {k: 1}; stand = 1 - P.smooth(P.seg(tw, 0, 0.3)); }
	const w = soldier({x, ground: LOOT.g, h: LOOT.h, face: 1, u, stand, carry, reach: reachP});
	if (horse) { const k = horse.k, seatHero = horseSeat.st.hero, at = [P.lerp(HSEAT[0], w.load[0] + 6, k), P.lerp(HSEAT[1], w.load[1] + w.loadR * 0.9, k)];
		const hh = P.lerp(seatHero.h * 1.22, LOOT.h / 4.0, k);
		horse.svg = K.horseHead({...seatHero, x: at[0], y: at[1] - 8 * Math.sin(Math.PI * k), h: hh, flip: true, glow: 1.3, mood: 'fire', rim: '#FFE0A0', base: 'cut', curl: 0}); }
	return {svg: w.svg, horse: horse?.svg ?? null, x};
};
const CARRIERS = [{t0: 24.55, k: '狗', h: 400, g: 1030, x0: -300}, {t0: 24.9, k: '猪', h: 390, g: 1020, x0: -320}];
const carriers = (t) => CARRIERS.map((c) => {
	if (t < c.t0) return ''; const v = STR * c.h / 1.325 * 1.25, x = c.x0 + (t - c.t0) * v;
	const w = soldier({x, ground: c.g, h: c.h, face: 1, u: (x - c.x0) / (STR * c.h), carry: 1, col: '#1A100C'});
	return w.svg + K.bro(c.k, w.load[0] + 4, w.load[1] + w.loadR, c.h * 0.22, 1, '#180E0A');
}).join('');
/** the pool world at t: noon (with the spouts and arcs) or dusk/fire; o.dusk forces the dusk set (for the band wipe) */
const noonWorld = (t) => {
	const b = N.noonBase();
	let arcs = '';
	N.items.forEach(({k, side, i, st}) => {
		const you = k === '马', on = you ? P.seg(t, 15.318, 15.318 + 0.2) : P.seg(t, ALL12, ALL12 + 0.18), off = 1 - P.seg(t, FALL, FALL + 0.25), a = Math.min(on, off);
		if (a <= 0) return; const land = [960 + (side < 0 ? -1 : 1) * (50 + 130 * (1 - i / 5)), 905 - 220 * (i / 5) - 4];
		arcs += `<g opacity="${a.toFixed(3)}">${K.arc(st.mouth, land, (150 * st.s + 40) * (0.3 + 0.7 * a), st.s * (you ? 1.15 : 1), you ? {core: '#FFE2B4', glow: '#FFB070', gA: 0.5} : {})}</g>`; });
	const motes = t > ALL12 && t < FALL + 0.3 ? Array.from({length: 40}, (_, i) => `<circle cx="${(560 + rnd(i) * 800).toFixed(1)}" cy="${(700 + rnd(i + 3) * 200 - ((t - ALL12) * 60 * rnd(i + 5)) % 120).toFixed(1)}" r="${(1 + rnd(i + 7) * 2).toFixed(1)}" fill="#F3F1E8" opacity="${(0.4 + 0.4 * rnd(i + 9)).toFixed(2)}"/>`).join('') : '';
	return b.defs + b.back + (t < ALL12 ? N.water(t) : '') + `<g transform="${N.NOON_T}">${arcs}${motes}</g>` + b.horse;
};
const duskWorld = (t, o = {}) => {
	const fb = fireBase(), fl = P.smooth(P.seg(t, FIRE, FIRE + 0.3)) * (1 + 0.06 * P.noise(t * 5, 3)), lifted = t >= LIFT + 0.1;
	const empties = new Set(); if (lifted) empties.add('马'); CARRIERS.forEach((c) => { if (t >= c.t0 - 0.2) empties.add(c.k); }); if (t >= EMPTY) Object.keys(fb.st).forEach((k) => empties.add(k));
	let statues = ''; Object.entries(fb.st).forEach(([k, s]) => { const st = empties.has(k) ? s.empty : s.full; statues += `<g filter="url(#rimFire)">${st.svg}</g>`; if (k === '马' && !lifted && st.hero) statues += K.horseHead({...st.hero, mood: 'fire', glow: 0.9 + 0.6 * fl}); });
	const fy = (i) => 1 + 0.07 * P.noise(t * 6 + i * 5.3, i);
	const flames = fl > 0.01 ? `<g transform="translate(0,420) scale(1,${(fl * fy(1)).toFixed(3)}) translate(0,-420)"><g fill="url(#flB)" filter="url(#fb7)" opacity=".9">${fb.fB}</g></g>
		<g transform="translate(0,410) scale(1,${(fl * fy(2)).toFixed(3)}) translate(0,-410)"><g fill="url(#flF)" filter="url(#fb3)">${fb.fF}</g></g>` : '';
	const emb = t > 20 ? Array.from({length: 40}, (_, i) => { const y = 300 + ((rnd(i + 60) * 500 - (t - 19) * (40 + 60 * rnd(i + 9))) % 520 + 520) % 520, x = 300 + rnd(i + 30) * 1300 + 14 * Math.sin(t * 2 + i);
		return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + rnd(i) * 1.6).toFixed(2)}" fill="#FFC070" opacity="${((0.35 + rnd(i + 2) * 0.5) * P.seg(t, 20, 21)).toFixed(2)}"/>`; }).join('') : '';
	return fireDefs(fl) + `<rect x="-600" y="-900" width="3120" height="2580" fill="url(#fsky)"/><g transform="${N.NOON_T}">
		<g filter="url(#fb40)">${[[420, 240, 300, 200], [760, 160, 260, 260], [1180, 140, 340, 240], [1540, 220, 260, 220], [960, 40, 900, 120]].map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#smk)" opacity="${(0.4 + 0.6 * fl).toFixed(2)}"/>`).join('')}</g>
		<ellipse cx="960" cy="400" rx="920" ry="150" fill="#FF8A3A" opacity="${(0.12 + 0.23 * fl).toFixed(3)}" filter="url(#fb40)"/>${flames}
		<g filter="url(#fhz)">${fb.facade}</g>${fb.stairs}${fb.pool}
		<rect x="-400" y="940" width="2720" height="400" fill="url(#ffg)"/>
		${statues}${emb}</g>`;
};
F.poolSmoke = (t) => {   // screen-space smoke rolling in from the right; densest round (864, 324) for the ink-bleed
	const a = P.smooth(P.seg(t, SMOKE0, 26.3));
	if (a <= 0) return '';
	return `<g opacity="${a.toFixed(3)}">${P.LONDON.smoke(t + 3.5)}</g>`;
};
const figuresLayer = (t) => {
	const l = looter(t);
	return `<g filter="url(#rimFig)">${t < 26.6 ? marchers(t) : ''}${carriers(t)}${l.svg}</g>${l.horse ?? ''}`;
};
F.poolWorld = (t) => {
	if (t < BAND[0]) return noonWorld(t);
	return duskWorld(t) + figuresLayer(t);
};
F.poolRender = (t) => {
	const cam = camPool(t), meta = {cam, camId: 10, events: []};
	let svg = '';
	if (t < BAND[0]) svg += `<g transform="${P.camT(cam)}">${noonWorld(t)}</g><defs>${N.noonVig}</defs><rect width="1920" height="1080" fill="url(#nvig)"/>`;
	else if (t < BAND[1]) {
		// mode 6 foreground band: the head of the marching column passes close to the lens right → left; behind it, noon → red dusk
		const u = P.seg(t, ...BAND), lead = P.lerp(2300, -1500, u), edge = lead + 520;
		svg += `<g transform="${P.camT(cam)}">${noonWorld(t)}</g><defs>${N.noonVig}<clipPath id="bandc"><rect x="${edge.toFixed(1)}" y="0" width="${(2400 - edge).toFixed(1)}" height="1080"/></clipPath></defs><rect width="1920" height="1080" fill="url(#nvig)"/>
			<g clip-path="url(#bandc)"><g transform="${P.camT(cam)}">${duskWorld(t)}</g></g>`;
		let band = ''; [0, 330, 690].forEach((o, i) => { const w = window.WALKER({look: 'soldier', x: lead + o, ground: 1640, h: 1500, face: -1, u: u * 1.2 + i * 0.3, col: '#0C0806', rimOp: 0});
			band += w.svg + K.kepi(w.head[0], w.head[1], w.r * 1.02, -1, '#0C0806'); });
		svg += `<defs><filter id="bandb" filterUnits="userSpaceOnUse" x="-2000" y="-400" width="6000" height="2400"><feGaussianBlur stdDeviation="22 4"/></filter></defs><g filter="url(#bandb)">${band}</g>`;
		meta.events.push({band: u});
	} else svg += `<g transform="${P.camT(cam)}">${F.poolWorld(t)}</g>`;
	if (t >= BAND[0]) {
		svg += F.poolSmoke(t);
		// RR: on 「先说马首」 a copper glint shows through the smoke where the horse was carried (frame right)
		const g = P.seg(t, 27.9, 28.2) * (1 - P.seg(t, 29.0, 29.4)) * (0.75 + 0.25 * Math.sin(t * 9));
		if (g > 0) svg += `<defs>${K.blur('glint', 26)}</defs><ellipse cx="1560" cy="${(700 - 300 * P.smooth(P.seg(t, ...TILT))).toFixed(1)}" rx="70" ry="44" fill="#FF9A5A" opacity="${(0.55 * g).toFixed(3)}" filter="url(#glint)"/>`;
		svg += `<defs><radialGradient id="bvig2" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#120A08" stop-opacity="0"/><stop offset="1" stop-color="#120A08" stop-opacity=".8"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#bvig2)"/>`;
	}
	if (t >= LIFT && t < LIFT + 1 / 30) meta.events.push({fire_lift: t});
	if (t >= ALL12 && t < ALL12 + 1 / 30) meta.events.push({arcs: t});
	return {svg, meta};
};
// counter in the pool: 在家 12/12 → 11 on the lift → 0 once the smoke covers the seats (never while heads are visible) → RR: label
// 回来了, 0 → a rolling 「?」; on 「先说马首」 the horse's dot pulses copper
F.poolCounter = (t) => {
	if (t < RR) {
		const n = t < LIFT + 0.28 ? 12 : t < EMPTY ? 11 - (t >= CARRIERS[0].t0 + 0.5 ? 1 : 0) - (t >= CARRIERS[1].t0 + 0.5 ? 1 : 0) : Math.max(0, 9 - Math.floor((t - EMPTY) * 30 / 2) * 2);
		const gone = new Set(); if (n < 12) gone.add('马'); if (n <= 10) gone.add('狗'); if (n <= 9) gone.add('猪');
		const dots = P.ZOD.map((z) => (t >= EMPTY && n === 0) || gone.has(z) ? P.dot('e') : P.dot('h')).join('');
		return {lab: '在家', num: `${n}/12`, dots};
	}
	const roll = t < 27.6 ? String(Math.floor(rnd(Math.floor(t * 15) + 7) * 13)) : '?', pulse = t >= 27.9 ? 0.5 + 0.5 * Math.sin((t - 27.9) * 8) : 0;
	return {lab: '回来了', num: `${roll}/12`, dots: P.ZOD.map((z) => z === '马' && t >= 27.9 ? `<span class="o y" style="box-shadow:0 0 ${(10 + 18 * pulse).toFixed(1)}px #FF9A5A;opacity:${(0.7 + 0.3 * pulse).toFixed(2)}"></span>` : P.dot('e')).join('')};
};
F.POOLT = {BAND, FIRE, LIFT, ALL12, FALL, EMPTY, RR, TILT, C_B2};
// ------------------------------------------------------------------------------------------------ SALE (London 1989 → 2007)
const L = P.LONDON;
const INK0 = 29.2, INK1 = 29.8, SW0 = 37.96, SW1 = 38.60;
const B78 = B(78), LAMPS_OUT = [B(79), B(80), B(81)], NARROW = B(81.5);
const camL = P.cam([960, 300, 1.0], [
	{t0: 29.8, t1: 31.4, to: [960, 540, 1.0]},
	{t0: 31.70, t1: 33.148, to: [960, 540, 1.03]},
	{t0: 33.148, t1: 35.412, to: [975, 500, 1.08]},
	{t0: 36.00, t1: 39.09, to: [975, 500, 1.13]},
	{t0: 39.09, t1: 45.0, to: [1300, 590, 1.35]},
	{t0: 45.30, t1: 47.30, to: [1150, 560, 1.15]},
	{t0: 47.30, t1: 48.6, to: [1140, 560, 1.17], ease: 'linear'},
]);
F.camL = camL;
// the 2007 room (v7_d5_2007.js set) with its lamps, the lot board flipping to 「撤拍」, the lamps out from the back, the spot narrowing
let Y7 = null;
const room2007 = (t) => {
	if (!Y7) {
		const S = '#18110D';
		const chair = (x, fy, k, cat) => { const u = 330 * k, X = (d) => x + d * u, Y = (d) => fy - d * u;
			return `<path d="M${X(-0.02)},${Y(0)} L${X(0.02)},${Y(0)} L${X(0.04)},${Y(1.0)} L${X(0.0)},${Y(1.0)} Z" fill="${S}"/>
			<path d="M${X(0.0)},${Y(0.98)} L${X(0.06)},${Y(1.0)} L${X(0.05)},${Y(0.52)} L${X(-0.01)},${Y(0.5)} Z" fill="${S}"/>
			<rect x="${X(-0.02)}" y="${Y(0.5)}" width="${0.42 * u}" height="${0.05 * u}" fill="${S}"/>
			<path d="M${X(0.36)},${Y(0.46)} L${X(0.39)},${Y(0.46)} L${X(0.4)},${Y(0)} L${X(0.36)},${Y(0)} Z" fill="${S}"/>
			${cat ? `<path d="M${X(0.1)},${Y(0.56)} L${X(0.33)},${Y(0.57)} L${X(0.33)},${Y(0.6)} L${X(0.1)},${Y(0.59)} Z" fill="#D9C9AA" opacity=".9"/><path d="M${X(0.1)},${Y(0.6)} L${X(0.33)},${Y(0.61)}" stroke="#F3E6CC" stroke-width="${2 * k}" opacity=".7"/>` : ''}`; };
		let rows = '';
		[[0.52, 770, 60, 9, '#2A201A'], [0.72, 845, 30, 7, '#1F1813'], [1.0, 965, -40, 5, S]].forEach(([k, fy, x0, n, col], r) => {
			for (let i = 0; i < n; i++) rows += chair(x0 + i * 175 * k + (r % 2) * 30, fy, k, rnd(i + r * 10) > 0.15).replaceAll(S, col); });
		Y7 = {rows};
	}
	const lampOn = (i) => 1 - P.seg(t, LAMPS_OUT[i], LAMPS_OUT[i] + 0.08);   // 0: x 300 (back), 1: 760, 2: 1240 + 1560
	const dark = (1 - lampOn(0)) * 0.16 + (1 - lampOn(1)) * 0.17 + (1 - lampOn(2)) * 0.2;
	const spotR = P.lerp(380, 170, P.smooth(P.seg(t, NARROW, NARROW + 0.35))), flick = 1 + 0.03 * P.noise(t * 3, 77);
	const hero = {x: 1030, y: 604, h: 162, curl: 1, glow: 0.8 * (1 + 0.04 * Math.sin(t * 2.4)), key: 1.6, mood: 'warm', refl: '#DCE4E0', base: 'block', block: {w: 900, h: 38 / (162 / 925)}};
	const fu = P.seg(t, B78, B78 + 0.2), sx = Math.cos(Math.PI * P.smooth(fu)), jy = P.jolt(t, B78 + 0.2, 4, 0.4, 2);
	const board = fu >= 0.5
		? `<rect x="960" y="250" width="260" height="190" fill="#A84A26" stroke="#C8693A" stroke-width="5"/><text x="1090" y="380" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="96" fill="#FFF1DC">撤拍</text>`
		: `<rect x="960" y="250" width="260" height="190" fill="#211914" stroke="#8A6E54" stroke-width="5"/>${[0, 1, 2].map((i) => `<rect x="990" y="${290 + i * 40}" width="${200 - i * 50}" height="8" fill="#5A4636" opacity=".6"/>`).join('')}`;
	const motes = Array.from({length: 22}, (_, i) => { const yy = 460 + ((rnd(i + 7) * 300 + (t - 38) * (6 + 8 * rnd(i))) % 300), w = (yy - 440) / 320, xx = 1060 - 90 * w + rnd(i + 3) * 200 * w + 6 * Math.sin(t * 0.8 + i);
		return `<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${(0.8 + rnd(i + 11) * 1.4).toFixed(2)}" fill="#EEF2EE" opacity="${(0.2 + 0.3 * rnd(i + 13)).toFixed(2)}"/>`; }).join('');
	return P.scope(`<defs>
	 <linearGradient id="wall" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="1080"><stop offset="0" stop-color="#352B25"/><stop offset=".55" stop-color="#56463A"/><stop offset="1" stop-color="#43362C"/></linearGradient>
	 <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3D2F25"/><stop offset="1" stop-color="#1E1712"/></linearGradient>
	 <radialGradient id="work" cx="1000" cy="580" r="${spotR.toFixed(1)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".42"/><stop offset=".5" stop-color="#C9D2CC" stop-opacity=".12"/><stop offset="1" stop-color="#C9D2CC" stop-opacity="0"/></radialGradient>
	 <radialGradient id="lect" cx="1500" cy="640" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3DDB4" stop-opacity="${(0.6 * flick * lampOn(2)).toFixed(3)}"/><stop offset=".5" stop-color="#E8C090" stop-opacity="${(0.16 * lampOn(2)).toFixed(3)}"/><stop offset="1" stop-color="#E8C090" stop-opacity="0"/></radialGradient>
	 <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".22"/><stop offset="1" stop-color="#E6ECE6" stop-opacity="0"/></linearGradient>
	 <radialGradient id="hole" cx="1000" cy="600" r="${(spotR * 0.95).toFixed(1)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0E0907" stop-opacity="0"/><stop offset=".6" stop-color="#0E0907" stop-opacity="${(dark * 0.4).toFixed(3)}"/><stop offset="1" stop-color="#0E0907" stop-opacity="${dark.toFixed(3)}"/></radialGradient>
	 ${K.blur('b12', 12)}${K.blur('b30', 30)}
	</defs>
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#wall)"/>
	${[80, 520, 1260, 1700].map((x) => `<rect x="${x}" y="230" width="360" height="520" rx="4" fill="#53433A" opacity=".35" stroke="#7A6250" stroke-width="2"/>`).join('')}
	<g transform="translate(0,${jy.toFixed(2)}) translate(1090,0) scale(${Math.max(0.01, Math.abs(sx)).toFixed(4)},1) translate(-1090,0)">${board}</g>
	${[[300, 0.3, 0], [760, 0.3, 1], [1560, 0.3, 2]].map(([x, k, i]) => `<path d="M${x},-500 L${x},${120 * k - 30}" stroke="#1A120D" stroke-width="3"/><path d="M${x - 40},${120 * k - 30} L${x + 40},${120 * k - 30} L${x + 26},${120 * k} L${x - 26},${120 * k} Z" fill="#1A120D"/><ellipse cx="${x}" cy="${120 * k + 2}" rx="22" ry="6" fill="#F0D6A8" opacity="${(0.55 * lampOn(i)).toFixed(3)}"/><ellipse cx="${x}" cy="${120 * k + 50}" rx="90" ry="60" fill="#F0D6A8" opacity="${(0.08 * lampOn(i)).toFixed(3)}" filter="url(#b30)"/>`).join('')}
	<rect x="-600" y="770" width="3200" height="310" fill="url(#floor)"/>
	<path d="M-600,770 L2600,770" stroke="#6A5240" stroke-width="2" opacity=".6"/>
	<path d="M1150,770 L1150,380 M1150,380 L1070,420" stroke="#15100C" stroke-width="8" fill="none"/>
	<path d="M1040,404 L1092,430 L1076,452 L1030,430 Z" fill="#15100C"/>
	<path d="M1036,440 L1078,452 L1180,770 L760,770 Z" fill="url(#beam)"/>
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#work)"/>
	<g>${Y7.rows}</g>
	<path d="M900,650 L1100,650 L1110,800 L890,800 Z" fill="#2A211B"/><rect x="884" y="642" width="232" height="14" fill="#3E3128"/>
	<path d="M884,642 L1116,642" stroke="#E6ECE6" stroke-width="2.5" opacity=".7"/>
	<ellipse cx="1000" cy="652" rx="100" ry="10" fill="#FF9A5A" opacity=".35" filter="url(#b12)"/>
	${K.horseHead(hero)}${motes}
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#lect)"/>
	<path d="M1330,1080 L1360,660 L1690,660 L1720,1080 Z" fill="#20160F"/>
	<path d="M1340,640 L1710,640 L1720,668 L1330,668 Z" fill="#3A281C"/><path d="M1340,640 L1710,640" stroke="#E9C690" stroke-width="3" opacity=".8"/>
	<path d="M1660,640 L1660,560 C1660,540 1640,530 1620,532" stroke="#1A120D" stroke-width="7" fill="none"/>
	<path d="M1580,520 L1640,520 L1628,546 L1592,546 Z" fill="#1A120D"/><ellipse cx="1610" cy="548" rx="18" ry="5" fill="#FFF0D0" opacity="${(0.9 * flick * lampOn(2)).toFixed(3)}"/>
	<ellipse cx="1470" cy="632" rx="58" ry="12" fill="#2A1A10"/><ellipse cx="1470" cy="628" rx="58" ry="12" fill="#6A4428"/><ellipse cx="1470" cy="626" rx="50" ry="8" fill="#8A5C36"/>
	<g transform="rotate(-6 1470 600)">
	 <rect x="1380" y="596" width="150" height="14" rx="7" fill="#5A3820"/><rect x="1380" y="596" width="150" height="5" rx="2.5" fill="#B88456" opacity=".8"/>
	 <rect x="1508" y="572" width="54" height="62" rx="10" fill="#6A4226"/><rect x="1508" y="572" width="54" height="16" rx="6" fill="#C8955E" opacity=".75"/>
	 <rect x="1518" y="572" width="6" height="62" fill="#3A2416" opacity=".7"/><rect x="1546" y="572" width="6" height="62" fill="#3A2416" opacity=".7"/>
	</g>
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#hole)"/>`, 'y7');
};
F.spot2007 = (t) => P.toScr(camL(t), [1000, 590]);
F.saleRender = (t) => {
	const cam = camL(t), meta = {cam, camId: 11, events: []};
	const th = L.lampAng(t, cam) * Math.PI / 180, out = P.seg(t, LAMPS_OUT[2], LAMPS_OUT[2] + 0.08);
	const swingLamp = `<g transform="${P.camT(cam)}">${L.lampSvg(1240, 1, L.lampAng(t, cam), 1 - out, '#F6DCAE', 160)}</g>`;
	let svg = `<defs>${L.vigL}${K.blur('lb30', 30)}</defs>`;
	const london = `<g transform="${P.camT(cam)}">${L.londonRoom(t, cam)}</g>${t < SW0 ? swingLamp : ''}<rect width="1920" height="1080" fill="url(#lvig)"/>`;
	if (t < INK1) {
		// INK-BLEED (mode 3) at the densest smoke: the London ceiling opens through it with a noise edge
		const pc = camPool(t), u = P.smooth(P.seg(t, INK0, INK1)), R = 30 + 1700 * u;
		svg += `<g transform="${P.camT(pc)}">${F.poolWorld(t)}</g>${F.poolSmoke(t)}`;
		svg += `<defs><filter id="inkN" filterUnits="userSpaceOnUse" x="-400" y="-400" width="2720" height="1880"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${(260 + 200 * u).toFixed(0)}" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="14"/></filter>
			<mask id="ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><g filter="url(#inkN)"><circle cx="864" cy="324" r="${R.toFixed(1)}" fill="#fff"/></g></mask></defs><g mask="url(#ink)">${london}</g>`;
		meta.events.push({ink: u}); meta.camPool = pc;
	} else if (t < SW0) svg += london;
	else {
		const e = L.swingEdge(t), y7 = `<g transform="${P.camT(cam)}">${room2007(t)}</g><rect width="1920" height="1080" fill="url(#yvig)"/>`;
		const lampScr = P.toScr(cam, [1240 - 280 * Math.sin(th), -160 + 280 * Math.cos(th)]);
		svg += t >= SW1 ? y7 : `${london}<defs><clipPath id="wl"><rect x="-10" y="0" width="${Math.max(0, e + 10).toFixed(1)}" height="1080"/></clipPath>
			<linearGradient id="edge" gradientUnits="userSpaceOnUse" x1="${e - 220}" x2="${e + 30}" y1="0" y2="0"><stop offset="0" stop-color="#F6DCAE" stop-opacity="0"/><stop offset=".85" stop-color="#FFE8C0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE8C0" stop-opacity="0"/></linearGradient>
			<linearGradient id="cone" gradientUnits="userSpaceOnUse" x1="0" y1="${lampScr[1]}" x2="0" y2="1080"><stop offset="0" stop-color="#FFE8C0" stop-opacity=".28"/><stop offset="1" stop-color="#FFE8C0" stop-opacity=".04"/></linearGradient></defs>
			<g clip-path="url(#wl)">${y7}</g><rect x="${e - 220}" y="0" width="250" height="1080" fill="url(#edge)"/>
			<path d="M${lampScr[0] - 14},${lampScr[1]} L${lampScr[0] + 14},${lampScr[1]} L${e + 30},1080 L${e - 160},1080 Z" fill="url(#cone)"/>`;
		svg += swingLamp;
	}
	if (t >= 35.412 - 0.5 / 30 && t < 35.412 + 0.5 / 30) meta.events.push({strike: t});
	if (t >= B78 && t < B78 + 1 / 30) meta.events.push({chepai: t});
	LAMPS_OUT.forEach((x, i) => { if (t >= x && t < x + 1 / 30) meta.events.push({['lamp' + i]: t}); });
	return {svg, meta};
};
F.SALET = {INK0, INK1, SW0, SW1, B78, LAMPS_OUT, NARROW};
})();

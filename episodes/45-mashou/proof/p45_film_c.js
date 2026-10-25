// ep45 FULL FILM, part C: CASE inside the 文殊亭 (the v7_q_end set): V1/V2 the 2023 reunion 97.676 – 104.469 (four glass cases
// glide in on bar 43, the day tag 1 → 12, out on bar 45) · R4 the push into the horse + one highlight on bar 46 · R5 the push onto
// the curled ear + a key band over the fold · R6 the light trembles on bar 49 · K1 the pull back: the noon fountain as a
// shadow-play on the lattice, the twelve shadow arcs fire on bar 50 · K3 the arcs go out, six tags, five dashed · K4 the dragon:
// a tiny shadow saleroom, its gavel on b213 · K5 half-drawn + 「?」 · Q bar 55: the seat shadows morph into the dial · END card.
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat, F = P.FILM;
const V1 = 97.676, V2 = 101.638, R4 = 104.469, R5 = 107.582, R6 = 110.412, K1 = 113.808, K3 = 117.488, K4 = 120.318, K5 = 123.714, Q = 125.978, END = 130.298, FILM_END = 134.798;
const IN0 = B(172), OUT0 = P.BAR0 + 45 * 4 * P.BEAT, HL = P.BAR0 + 46 * 4 * P.BEAT, BAND = R5 + 1.132, TREM = P.BAR0 + 49 * 4 * P.BEAT, ARCS = P.BAR0 + 50 * 4 * P.BEAT, GAV = B(213), TAGS = B(206.5), DASH0 = B(207.5);
// the CASE set (q_end v8 layout): the horse h 340 on its black block (plinth top 700), the paper lattice behind
const HS = 340 / 925, PL = {cx: 960, top: 700, base: 800, w: 260};
const heroC = {x: PL.cx - (922 - 836) * HS, y: PL.top, h: 340, curl: 1, glow: 0.9, key: 2.0, mood: 'warm', refl: '#C9C2B0', base: 'block', block: {w: PL.w / HS, h: (PL.base - PL.top) / HS}, earDetail: true};
const faceC = [heroC.x - 0.28 * heroC.h, heroC.y - 0.52 * heroC.h], EAR = [heroC.x + (712 - 836) * HS, heroC.y + (110 - 950) * HS];
let lat = ''; for (let i = -30; i < 80; i++) lat += `M${i * 46},140 l${430},740 M${i * 46},140 l${-430},740 `;
const caseBase = `<defs><linearGradient id="paper" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8A5A36"/><stop offset=".6" stop-color="#B07A4A"/><stop offset="1" stop-color="#7A4A2A"/></linearGradient>
	<clipPath id="latc"><rect x="150" y="140" width="1620" height="765"/></clipPath></defs>
	<rect x="-600" y="-600" width="3120" height="2280" fill="#2A170E"/><rect x="150" y="140" width="1620" height="765" fill="url(#paper)"/>
	<g clip-path="url(#latc)"><path d="${lat}" stroke="#4A2A18" stroke-width="7" opacity=".55"/></g>
	${[150, 690, 1230, 1770].map((x) => `<rect x="${x - 18}" y="120" width="36" height="805" fill="#3A2216"/>`).join('')}<rect x="130" y="120" width="1660" height="24" fill="#3A2216"/>`;
const floor = `<rect x="-600" y="905" width="3120" height="700" fill="#24150E"/><path d="M-600,905 L2520,905" stroke="#C8783E" stroke-width="3" opacity=".5"/>`;
// ---- the reunion: four glass cases (bronze silhouettes inside, the horse's copper caught in the glass)
const SLOTS = [{k: '牛', x: 300, from: -1, t: IN0}, {k: '虎', x: 1620, from: 1, t: IN0 + P.BEAT}, {k: '猴', x: 530, from: -1, t: IN0 + 2 * P.BEAT}, {k: '猪', x: 1390, from: 1, t: IN0 + 3 * P.BEAT}];
const caseGlass = (c, x, t) => {
	const w = 190, h = 220, y = 470, id = 'rg' + c.k.charCodeAt(0);
	const near = c.x < 960 ? 1 : 0;
	return `<defs><linearGradient id="${id}" x1="${near}" x2="${1 - near}" y1="0" y2="0"><stop offset="0" stop-color="#FFB070" stop-opacity=".30"/><stop offset=".5" stop-color="#FFF4DE" stop-opacity=".12"/><stop offset="1" stop-color="#E8D2AA" stop-opacity=".08"/></linearGradient></defs>
	<rect x="${x - w / 2 - 12}" y="${y + h}" width="${w + 24}" height="${905 - y - h}" fill="#2E2219"/><path d="M${x - w / 2 - 12},${y + h} L${x + w / 2 + 12},${y + h}" stroke="#E8C690" stroke-width="3" opacity=".7"/>
	<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="#3A2416" opacity=".35"/>
	<rect x="${x - 34}" y="${y + h - 30}" width="68" height="30" fill="#1A120C"/>${K.bro(c.k, x, y + h - 30, 130, c.x < 960 ? -1 : 1, '#2E1E14')}
	<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/><rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#F6EAD2" stroke-width="3" opacity=".7"/>
	<path d="M${x - w / 2 + 14},${y + 14} L${x - w / 2 + 50},${y + 14} M${x - w / 2 + 14},${y + 14} L${x - w / 2 + 14},${y + 70}" stroke="#FFE0B8" stroke-width="3.5" opacity=".6"/>
	<text x="${x}" y="${y + h + 66}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="42" fill="#FFF1DC">${c.k}首</text>`;
};
const reunion = (t) => SLOTS.map((c, i) => {
	const a = P.smooth(P.seg(t, c.t - 0.55, c.t + 0.35)), outT = OUT0 + i * P.BEAT / 2, b = P.smooth(P.seg(t, outT, outT + 0.6));
	if (a <= 0 || b >= 1) return '';
	const x = c.x + c.from * (1 - a) * 900 + 1500 * b * 1;   // in from its side, out to the right
	return caseGlass(c, x, t);
}).join('');
const dayTag = (t) => {
	if (t < V1 + 0.4 || t >= R4 + 0.3) return '';
	const n = t < V2 ? 1 : Math.min(12, 1 + Math.floor(P.seg(t, V2, V2 + 0.75) * 11.999)), big = P.smooth(P.seg(t, V2, V2 + 0.3)), op = Math.min(P.seg(t, V1 + 0.4, V1 + 0.7), 1 - P.seg(t, R4, R4 + 0.3));
	const fs = P.lerp(48, 104, big), col = n === 12 ? '#F09A5E' : '#FFF1DC';
	return `<div style="position:absolute;left:0;right:0;top:${(950 - fs).toFixed(0)}px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:${(fs * 0.55).toFixed(1)}px;color:#FFF1DC;opacity:${op.toFixed(3)};text-shadow:0 0 3px rgba(10,8,6,.9),0 3px 18px rgba(10,8,6,.8)">第 <span style="font-family:'Cormorant Garamond';font-weight:600;font-size:${fs.toFixed(1)}px;color:${col}">${n}</span><span style="color:${n === 12 ? '#F09A5E' : '#FFF1DC'}"> 天</span></div>`;
};
// ---- the noon shadow-play on the lattice (the POOL layout, small, flat shadow #24140C; the horse's arc warm)
// the two rows are spread outward (380 local units each side) so no shadow hides behind the horse at the centre
const SH_T = 'translate(960,560) scale(.62) translate(-960,-700)', SPREAD = 380;
const SHW = (p, side = 0) => [960 + (p[0] + side * SPREAD - 960) * 0.62, 560 + (p[1] - 700) * 0.62];
const SH = []; for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) { const k = side < 0 ? K.ROW_L[i] : K.ROW_R[i]; SH.push({k, side, i, st: K.statue(k, side, i, 'noon'), empty: K.statue(k, side, i, 'noon', {empty: true})}); }
const DASHED = ['龙', '蛇', '羊', '鸡', '狗'], TAGK = {牛: '保利', 虎: '保利', 猴: '保利', 猪: '保利', 鼠: '国博', 兔: '国博'};
const ZO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'], DC = {x: 960, y: 562, rx: 640, ry: 298};
const dialPt = (k) => { const i = ZO.indexOf(k), a = -Math.PI / 2 + i * Math.PI / 6; return [DC.x + Math.cos(a) * DC.rx, DC.y + Math.sin(a) * DC.ry]; };
const seatPt = (s) => SHW([s.st.top[0], s.st.top[1] + 40 * s.st.s], s.side);
const shadowPlay = (t) => {
	const a = P.smooth(P.seg(t, K1 + 0.5, K1 + 1.6)) * (1 - P.smooth(P.seg(t, Q, Q + 0.5)));
	if (a <= 0) return '';
	let seats = '', heads = '', arcs = '', dashes = '', tags = '';
	const arcOut = (n) => K3 + n * P.BEAT / 4;
	SH.forEach((s, n) => {
		const you = s.k === '马', ord = SH.filter((q) => q.k !== '马').indexOf(s);
		const sh = `transform="translate(${s.side * SPREAD},0)"`;
		seats += `<g ${sh}>${s.empty.svg}</g>`;
		const headGone = you ? 0 : P.seg(t, arcOut(ord) + 0.1, arcOut(ord) + 0.5);
		if (headGone < 1) heads += `<g ${sh} opacity="${(1 - headGone).toFixed(3)}">${s.st.svg.replace(s.empty.svg, '')}${you && s.st.hero ? K.horseHead({...s.st.hero, glow: 0}) : ''}${!you ? '' : ''}</g>`;
		const on = P.seg(t, ARCS, ARCS + 0.18), off = you ? 0 : P.seg(t, arcOut(ord), arcOut(ord) + 0.12), aa = on * (1 - off);
		if (aa > 0) { const land = [960 + (s.side < 0 ? -1 : 1) * (50 + 130 * (1 - s.i / 5)), 905 - 220 * (s.i / 5) - 4];
			arcs += `<g ${sh} opacity="${aa.toFixed(3)}">${K.arc(s.st.mouth, land, (150 * s.st.s + 40) * (0.3 + 0.7 * on), s.st.s, you ? {core: '#E8894B', glow: '#FFB070', gA: 0.5} : {core: '#24140C', glow: '#24140C', gA: 0.2})}</g>`; }
		if (DASHED.includes(s.k)) { const di = DASHED.indexOf(s.k), dt = DASH0 + di * P.BEAT / 2, d = P.seg(t, dt, dt + 0.2);
			if (d > 0) { const hx = s.st.top[0] + (s.side < 0 ? 1 : -1) * 4 * s.st.s, hy = s.st.top[1] + 22 * s.st.s, size = 175 * s.st.s, sw = 5 / (size / 100);
				const half = s.k === '龙' && t >= K5 ? `clip-path="url(#halfD)"` : '';
				const dash = `stroke-dasharray="${11 / (size / 100)} ${8 / (size / 100)}"`, g = K.bro(s.k, hx, hy, size, s.side < 0 ? 1 : -1, '#E9DCC4', `fill-opacity=".08" stroke="#F3E6CF" stroke-width="${sw}" ${dash} stroke-linejoin="round"`).replace(/stroke="currentColor" stroke-width="[\d.]+"/g, `stroke="#F3E6CF" stroke-width="${sw}" ${dash}`);
				dashes += `<g ${sh}><g ${half} opacity="${(0.95 * d).toFixed(3)}">${g}</g></g>`; } }
		if (TAGK[s.k] && t >= TAGS) { const [x, y] = s.st.top, op = P.seg(t, TAGS, TAGS + 0.2);
			const ty = y - 175 * s.st.s - 20 - (s.i % 2) * 34;   // ≈ 40 px on screen at K3's ×1.65; alternate heights so neighbours never touch
			tags += `<g ${sh} opacity="${op.toFixed(3)}"><rect x="${x - 44}" y="${ty - 40}" width="88" height="48" rx="7" fill="#FFF1DC" opacity=".9"/><text x="${x}" y="${ty - 4}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="39" fill="#5A2E16">${TAGK[s.k]}</text></g>`; }
	});
	const flat = `<filter id="flat" filterUnits="userSpaceOnUse" x="-600" y="-600" width="3200" height="2400"><feFlood flood-color="#24140C"/><feComposite in2="SourceAlpha" operator="in"/></filter>`;
	const dr = SH.find((q) => q.k === '龙').st.top;
	return `<defs>${flat}<clipPath id="halfD"><rect x="${dr[0] - SPREAD - 400}" y="-1000" width="400" height="3000"/></clipPath></defs><g opacity="${(0.85 * a).toFixed(3)}" transform="${SH_T}"><g filter="url(#flat)">${seats}${heads}</g>${arcs}${dashes}${tags}</g>`;
};
// ---- the dragon's shadow saleroom (K4): rostrum, auctioneer, two seated bidders, its gavel on b213
const saleroom = (t) => {
	const a = P.smooth(P.seg(t, K4 + 0.6, K4 + 1.2)) * (1 - P.smooth(P.seg(t, K5, K5 + 0.4)));
	if (a <= 0) return '';
	const d = SH.find((q) => q.k === '龙'), c = SHW([d.st.top[0] + 10, d.st.top[1] - 60], -1), u = 9;
	const hit = t >= GAV - 0.5 / 30, lift = hit ? Math.max(0, 1 - (t - GAV) * 8) * 0 : Math.sin(Math.PI * P.seg(t, GAV - 0.5, GAV - 0.5 / 30));
	const fig = K.figure({x: c[0] + 26, ground: c[1] + 30, h: 8 * u, face: -1, col: '#1A0E08', hat: 'hair', hands: [[c[0] + 10, c[1] - 14 - 18 * lift], [c[0] + 30, c[1] - 6]], elbow: [1, -1]});
	return `<g opacity="${a.toFixed(3)}"><rect x="${c[0] - 4}" y="${c[1] - 10}" width="30" height="40" fill="#1A0E08"/>${fig.svg}${fig.armBack}${fig.armFront}
		${K.seated(c[0] - 50, c[1] + 30, 64, 1, '#1A0E08')}${K.seated(c[0] - 80, c[1] + 30, 60, 1, '#1A0E08')}
		${hit && t < GAV + 0.07 ? `<path d="M${c[0] + 4},${c[1] - 18} l-6,-8 M${c[0] + 12},${c[1] - 20} l0,-9 M${c[0] + 20},${c[1] - 18} l6,-8" stroke="#FFE2B0" stroke-width="1.6"/>` : ''}</g>`;
};
// ---- the dial (Q): the seat shadows morph into twelve points on an ellipse; 7 solid (6 ivory + the horse copper), 5 dashed
const dial = (t) => {
	const m = P.smooth(P.seg(t, Q, Q + 0.6));
	if (m <= 0) return '';
	let s = `<ellipse cx="${DC.x}" cy="${DC.y}" rx="${DC.rx}" ry="${DC.ry}" fill="none" stroke="#F3E6CF" stroke-width="2" opacity="${(0.28 * m).toFixed(3)}"/>`;
	SH.forEach((q) => { const p0 = seatPt(q), p1 = dialPt(q.k), x = P.lerp(p0[0], p1[0], m), y = P.lerp(p0[1], p1[1], m), r = P.lerp(14, 30, m);
		s += q.k === '马' ? `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8894B" stroke="#FFD9A6" stroke-width="4" opacity="${m}"/><circle cx="${x}" cy="${y}" r="${r + 14}" fill="#FF9A5A" opacity="${(0.22 * m).toFixed(3)}"/>`
			: DASHED.includes(q.k) ? `<circle cx="${x}" cy="${y}" r="${r * 0.9}" fill="none" stroke="#F3E6CF" stroke-width="5" stroke-dasharray="11 8" opacity="${(0.9 * m).toFixed(3)}"/>`
			: `<circle cx="${x}" cy="${y}" r="${r}" fill="#F3E6CF" opacity="${(0.92 * m).toFixed(3)}"/>`; });
	const qm = dialPt('龙');   // the 「?」 stays in the dragon's place
	return s + `<text x="${qm[0]}" y="${qm[1] + 22}" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="64" fill="#FFF3D8" opacity="${(0.9 * m).toFixed(3)}">?</text>`;
};
// ---- the horse in CASE, with its light events
const caseHero = (t) => {
	const br = 1 + 0.04 * Math.sin(2 * Math.PI * (t - V1) / 2.26), trem = t >= TREM - 0.5 / 30 && t < TREM + 1.5 / 30 ? 0.75 : 1;
	const jx = t >= TREM + 1.5 / 30 && t < TREM + 3.5 / 30 ? 1 : 0;
	let s = `<g transform="translate(${jx},0)">${K.horseHead({...heroC, glow: 0.9 * br * trem, key: 2.0 * trem})}</g>`;
	// R4: one highlight runs over the whole surface (muzzle → brow → poll → crest → mane → neck cut), 1.6 s from bar 46
	const sweep = (t0, dur, x0, x1, y0, w, key, o = {}) => { const u = P.seg(t, t0, t0 + dur); if (u <= 0 || u >= 1) return '';
		const bx = P.lerp(x0, x1, P.smooth(u)), a = Math.sin(Math.PI * u), id = 'sw' + Math.round(t0 * 10);
		return `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${bx - w}" y1="${y0}" x2="${bx + w}" y2="${y0 + w * (o.tilt ?? 1)}"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
			<mask id="${id}m" maskUnits="userSpaceOnUse" x="${heroC.x - 900}" y="${heroC.y - 1000}" width="1800" height="1300"><rect x="${heroC.x - 900}" y="${heroC.y - 1000}" width="1800" height="1300" fill="url(#${id}g)"/></mask></defs>
			<g mask="url(#${id}m)" opacity="${(0.85 * a).toFixed(3)}">${K.horseHead({...heroC, glow: 0, key, rimK: 1.4, base: 'cut'})}</g>`; };
	s += sweep(HL, 1.6, heroC.x - 1.0 * heroC.h, heroC.x + 0.4 * heroC.h, heroC.y - heroC.h, 0.12 * heroC.h, 3.0);
	s += sweep(BAND, 0.5, EAR[0] - 60, EAR[0] + 50, EAR[1] - 60, 22, 3.2, {tilt: 0.2});   // R5: a narrow warm key band across the folded tip
	return s;
};
const camCase = (() => { const ringCam = P.SCENES.payoff ? null : null;
	return (start) => P.cam(start, [
		{t0: V1, t1: R4 - 0.3, to: [960, 520, 1.0], ease: 'mix'},
		{t0: R4, t1: 107.3, to: [P.lerp(faceC[0], EAR[0], 0.35), P.lerp(faceC[1], EAR[1], 0.35), 2.4]},
		{t0: 107.45, t1: 110.2, to: [EAR[0], EAR[1] + 18, 5.5]},
		{t0: 110.2, t1: 113.6, to: [EAR[0] + 4, EAR[1] + 20, 5.85], ease: 'linear'},
		{t0: 113.65, t1: 117.45, to: [960, 500, 1.65]},
		{t0: 117.45, t1: K4, to: [955, 500, 1.68], ease: 'linear'},
		{t0: K4, t1: K4 + 2.6, to: (() => { const d = SH.find((q) => q.k === '龙'), c = SHW([d.st.top[0], d.st.top[1] - 40], -1); return [c[0], c[1], 2.0]; })()},
		{t0: K4 + 2.6, t1: Q - 1.0, to: (() => { const d = SH.find((q) => q.k === '龙'), c = SHW([d.st.top[0], d.st.top[1] - 40], -1); return [c[0] + 4, c[1], 2.03]; })(), ease: 'linear'},
		{t0: Q - 1.0, t1: Q + 2.4, to: [960, 540, 1.0]},   // the pull back to the dial: 3.4 s keeps it ≤ 25 px/f
		{t0: Q + 2.4, t1: FILM_END, to: [960, 548, 1.03], ease: 'linear'},
	]); })();
let CAM = null;
F.caseRender = (t, ringStart) => {
	CAM = CAM ?? camCase(ringStart);
	const cam = CAM(t), meta = {cam, camId: 20, events: []};
	const world = caseBase + `<defs><radialGradient id="chalo" cx="960" cy="560" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity="${(0.42 * (1 + 0.04 * Math.sin(t * 2.8))).toFixed(3)}"/><stop offset=".6" stop-color="#C8682F" stop-opacity=".1"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient></defs>
		<rect x="-600" y="-600" width="3120" height="2280" fill="url(#chalo)"/>` + shadowPlay(t) + saleroom(t) + dial(t) + floor + reunion(t) + caseHero(t);
	let svg = `<defs><radialGradient id="cvig3" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0605" stop-opacity="0"/><stop offset="1" stop-color="#0A0605" stop-opacity=".72"/></radialGradient></defs>
		<g transform="${P.camT(cam)}">${world}</g><rect width="1920" height="1080" fill="url(#cvig3)"/>`;
	const dim = 0.7 * P.smooth(P.seg(t, END, END + 0.39));
	if (dim > 0) svg += `<rect width="1920" height="1080" fill="#0A0605" opacity="${dim.toFixed(3)}"/>`;
	[[IN0, 'cases_in'], [OUT0, 'cases_out'], [HL, 'highlight'], [TREM, 'tremble'], [ARCS, 'shadow_arcs'], [GAV, 'dragon_gavel'], [Q, 'dial']].forEach(([x, n]) => { if (t >= x && t < x + 1 / 30) meta.events.push({[n]: t}); });
	return {svg, meta};
};
F.dayTag = dayTag;
// ---- the end card (house card, v8.1 times): Q slides into its slot, the J seal on bar 57, the title, the pill, the sources
const SEAL = P.BAR0 + 57 * 4 * P.BEAT;
F.endCard = (t) => {
	if (t < END) return '';
	const q = P.smooth(P.seg(t, END, END + 0.35)), s = P.seg(t, SEAL, SEAL + 0.18), ti = P.seg(t, 130.59, 130.84), pi = P.seg(t, 130.89, 131.14), so = P.seg(t, 130.99, 131.24);
	const qTop = P.lerp(124, 350, q), qSize = P.lerp(64, 72, q), qLeft = P.lerp(150, 960, q);
	return `<div style="position:absolute;left:0;right:0;top:0;bottom:0;z-index:30">
	 <div style="position:absolute;top:${qTop}px;left:${qLeft}px;transform:translateX(${(-50 * q).toFixed(2)}%);font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:${qSize}px;line-height:1.3;color:#FFF3D8;white-space:nowrap;letter-spacing:.03em;text-shadow:0 0 2px rgba(12,8,5,.9),0 2px 6px rgba(12,8,5,.65)">五个要是上拍，该不该<span style="color:#FFF1DC;background:#A84A26;box-shadow:-.08em 0 0 #A84A26,.08em 0 0 #A84A26">花钱买回来</span><span style="margin-right:-.5em">？</span></div>
	 ${s > 0 ? `<img src="${window.JSEAL}" style="position:absolute;left:${960 - 55}px;top:96px;width:110px;height:110px;opacity:${Math.min(1, s * 3).toFixed(3)};transform:rotate(-6deg) scale(${(1.15 - 0.15 * P.easeOut(s) + P.jolt(t, SEAL + 0.18, 0.02, 0.25, 1)).toFixed(4)})">` : ''}
	 <div style="position:absolute;left:0;right:0;top:220px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:54px;line-height:62px;letter-spacing:.08em;color:#f6cf78;opacity:${ti.toFixed(3)};text-shadow:0 2px 10px rgba(10,6,4,.8)">七个回国<br>一个回家</div>
	 <div style="position:absolute;left:0;right:0;top:560px;text-align:center;opacity:${pi.toFixed(3)}"><span style="display:inline-block;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:36px;color:#FFF3D8;border:2px solid #f6cf78;border-radius:40px;padding:10px 34px">关注 Juno · 一起看懂世界</span></div>
	 <div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font-family:'Noto Sans CJK SC',sans-serif;font-size:21px;color:rgba(255,255,255,.55);opacity:${so.toFixed(3)}">资料：中新网 · 人民日报海外版 · 新京报 · 新华社 · 澎湃新闻 · 环球人物 · 中央社 · 都市快报 · China Daily · AP · NYRB · Sotheby's</div>
	</div>`;
};
F.CT = {V1, V2, R4, R5, R6, K1, K3, K4, K5, Q, END, FILM_END, IN0, OUT0, HL, TREM, ARCS, GAV, TAGS, DASH0, SEAL, BAND};
})();

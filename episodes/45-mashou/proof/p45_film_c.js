// ep45 FULL FILM, part C: CASE inside the 文殊亭 (the v7_q_end set): V1/V2 the 2023 reunion 97.676 – 104.469 (four glass cases
// glide in on bar 43, the day tag 1 → 12, out on bar 45) · R4 the push into the horse + one highlight on bar 46 · R5 the push onto
// the curled ear + a key band over the fold · R6 the light trembles on bar 49 · K1 the pull back: the noon fountain as a
// shadow-play on the lattice, the twelve shadow arcs fire on bar 50 · K3 the arcs go out, six tags, five dashed · K4 the dragon:
// (v2) one big dashed dragon outline at the horse's size, its gavel on b213 · K5 its far half fades, 「?」 stays · Q bar 55: the seat
// shadows morph into the dial · END card (title 132 px, the question under it).
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat, F = P.FILM;
const V1 = 97.676, V2 = 101.638, R4 = 104.469, R5 = 107.582, R6 = 110.412, K1 = 113.808, K3 = 117.488, K4 = 120.318, K5 = 123.714, Q = 125.978, END = 130.298, FILM_END = 134.798;
const IN0 = B(172), OUT0 = P.BAR0 + 45 * 4 * P.BEAT, HL = P.BAR0 + 46 * 4 * P.BEAT, BAND = R5 + 1.132, TREM = P.BAR0 + 49 * 4 * P.BEAT, ARCS = P.BAR0 + 50 * 4 * P.BEAT, GAV = B(213), TAGS = B(206.5), DASH0 = B(207.5);
// the CASE set (q_end v8 layout): the horse h 340 on its black block (plinth top 700), the paper lattice behind (v2: wider, so the
// reunion's wide shot never sees the set's edge)
const HS = 340 / 925, PL = {cx: 960, top: 700, base: 800, w: 260};
const heroC = {x: PL.cx - (922 - 836) * HS, y: PL.top, h: 340, curl: 1, glow: 0.9, key: 2.0, mood: 'warm', refl: '#C9C2B0', base: 'block', block: {w: PL.w / HS, h: (PL.base - PL.top) / HS}, earDetail: true};
const faceC = [heroC.x - 0.28 * heroC.h, heroC.y - 0.52 * heroC.h], EAR = [heroC.x + (712 - 836) * HS, heroC.y + (110 - 950) * HS];
const EARS = [heroC.x + (745 - 836) * HS, heroC.y + (100 - 950) * HS];   // between the rolled near ear and the straight far ear
let lat = ''; for (let i = -80; i < 120; i++) lat += `M${i * 46},140 l${430},740 M${i * 46},140 l${-430},740 `;
const caseBase = `<defs><linearGradient id="paper" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8A5A36"/><stop offset=".6" stop-color="#B07A4A"/><stop offset="1" stop-color="#7A4A2A"/></linearGradient>
	<clipPath id="latc"><rect x="-560" y="140" width="3040" height="765"/></clipPath></defs>
	<rect x="-900" y="-600" width="3720" height="2280" fill="#2A170E"/><rect x="-560" y="140" width="3040" height="765" fill="url(#paper)"/>
	<g clip-path="url(#latc)"><path d="${lat}" stroke="#4A2A18" stroke-width="7" opacity=".55"/></g>
	${[-390, 150, 690, 1230, 1770, 2310].map((x) => `<rect x="${x - 18}" y="120" width="36" height="805" fill="#3A2216"/>`).join('')}<rect x="-580" y="120" width="3080" height="24" fill="#3A2216"/>`;
const floor = `<rect x="-900" y="905" width="3720" height="700" fill="#24150E"/><path d="M-900,905 L2820,905" stroke="#C8783E" stroke-width="3" opacity=".5"/>`;
// ---- the reunion (v2, gate 4 note 2): four heads AT THE HORSE'S SIZE (ring ratio) in tall glass cases, two each side, all at the
// horse's depth; they stay dark bronze silhouettes and take only a faint copper rim + glass glint from the horse's light.
// In: inner pair first, then the outer pair (no case passes another). Out: the outer pair first, each to its own side.
const BS = 330, CW = 400, CH = 380;
const SLOTS = [{k: '猴', x: 395, from: -1, t: IN0, o: 2}, {k: '猪', x: 1265, from: 1, t: IN0 + P.BEAT, o: 3}, {k: '牛', x: -45, from: -1, t: IN0 + 2 * P.BEAT, o: 0}, {k: '虎', x: 1705, from: 1, t: IN0 + 3 * P.BEAT, o: 1}];
const caseGlass = (c, x) => {
	const y = PL.top - CH, id = 'rg' + c.k.charCodeAt(0), L = c.from < 0;   // a left case: the horse's light comes from its right
	return `<defs><linearGradient id="${id}" x1="${L ? 1 : 0}" x2="${L ? 0 : 1}" y1="0" y2="0"><stop offset="0" stop-color="#FFB070" stop-opacity=".34"/><stop offset=".45" stop-color="#FFF4DE" stop-opacity=".08"/><stop offset="1" stop-color="#E8D2AA" stop-opacity=".05"/></linearGradient>
		${K.rimFilter(id + 'r', L ? -5 : 5, -2, '#F7A868', 1, 1.8)}</defs>
	<rect x="${x - CW / 2 - 14}" y="${PL.top}" width="${CW + 28}" height="${905 - PL.top}" fill="#2E2219"/><path d="M${x - CW / 2 - 14},${PL.top} L${x + CW / 2 + 14},${PL.top}" stroke="#E8C690" stroke-width="3" opacity=".7"/>
	<rect x="${x - CW / 2}" y="${y}" width="${CW}" height="${CH}" fill="#3A2416" opacity=".3"/>
	<rect x="${x - 70}" y="${PL.top - 40}" width="140" height="40" fill="#1A120C"/>
	<g filter="url(#${id}r)">${K.bro(c.k, x, PL.top - 40, BS, L ? -1 : 1, '#4A3122')}</g>
	<rect x="${x - CW / 2}" y="${y}" width="${CW}" height="${CH}" fill="url(#${id})"/><rect x="${x - CW / 2}" y="${y}" width="${CW}" height="${CH}" fill="none" stroke="#F6EAD2" stroke-width="3.5" opacity=".7"/>
	<path d="M${L ? x + CW / 2 - 18 : x - CW / 2 + 18},${y + 18} L${L ? x + CW / 2 - 70 : x - CW / 2 + 70},${y + 18} M${L ? x + CW / 2 - 18 : x - CW / 2 + 18},${y + 18} L${L ? x + CW / 2 - 18 : x - CW / 2 + 18},${y + 110}" stroke="#FFD6A8" stroke-width="4" opacity=".65"/>
	<text x="${x}" y="${PL.top + 112}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="66" fill="#FFF1DC">${c.k}首</text>`;
};
const reunion = (t) => SLOTS.map((c) => {
	const a = P.smooth(P.seg(t, c.t - 0.55, c.t + 0.35)), outT = OUT0 + c.o * P.BEAT / 2, b = P.smooth(P.seg(t, outT, outT + 0.6));
	if (a <= 0 || b >= 1) return '';
	return caseGlass(c, c.x + c.from * (1 - a) * 900 + c.from * 1150 * b);   // in from its own side, out to its own side
}).join('');
const dayTag = (t) => {
	if (t < V1 + 0.4 || t >= R4 + 0.3) return '';
	const n = t < V2 ? 1 : Math.min(12, 1 + Math.floor(P.seg(t, V2, V2 + 0.75) * 11.999)), op = Math.min(P.seg(t, V1 + 0.4, V1 + 0.7), 1 - P.seg(t, R4, R4 + 0.3));
	const pop = 1 + 0.12 * Math.exp(-Math.max(0, t - (V2 + 0.75)) / 0.12) * (t >= V2 + 0.75 ? 1 : 0), fs = (n === 12 ? 132 : 120) * pop, col = n === 12 ? '#F09A5E' : '#FFF1DC';
	return `<div style="position:absolute;left:0;right:0;top:${(1012 - fs * 1.05).toFixed(0)}px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:64px;line-height:1;color:#FFF1DC;opacity:${op.toFixed(3)};text-shadow:0 0 3px rgba(10,8,6,.9),0 3px 18px rgba(10,8,6,.8)">第 <span style="font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:${fs.toFixed(1)}px;color:${col}">${n}</span> <span style="color:${col}">天</span></div>`;
};
// ---- the noon shadow-play on the lattice (the POOL layout, flat shadow #24140C; the horse's arc warm). v2: bigger (scale .75) and
// spread (420 local each side) so the twelve seats span the frame with the real horse small in the centre
const SC = 0.75, SPREAD = 420, SH_T = `translate(960,560) scale(${SC}) translate(-960,-700)`;
const SHW = (p, side = 0) => [960 + (p[0] + side * SPREAD - 960) * SC, 560 + (p[1] - 700) * SC];
const SH = []; for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) { const k = side < 0 ? K.ROW_L[i] : K.ROW_R[i]; SH.push({k, side, i, st: K.statue(k, side, i, 'noon'), empty: K.statue(k, side, i, 'noon', {empty: true})}); }
const DASHED = ['龙', '蛇', '羊', '鸡', '狗'], TAGK = {牛: '保利', 虎: '保利', 猴: '保利', 猪: '保利', 鼠: '国博', 兔: '国博'};
// the six tags (world space, ≥ 60 px at K3): staggered so neighbours never touch; a thin leader to each head
const TAGP = {猴: [296, 455], 虎: [440, 420], 鼠: [600, 330], 牛: [1330, 330], 兔: [1480, 420], 猪: [1690, 470]};
const ZO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'], DC = {x: 960, y: 560, rx: 640, ry: 240};   // v2: clear of the subtitle and the counter
const dialPt = (k) => { const i = ZO.indexOf(k), a = -Math.PI / 2 + i * Math.PI / 6; return [DC.x + Math.cos(a) * DC.rx, DC.y + Math.sin(a) * DC.ry]; };
const seatPt = (s) => SHW([s.st.top[0], s.st.top[1] + 40 * s.st.s], s.side);
const headTop = (s) => SHW([s.st.top[0], s.st.top[1] - 150 * s.st.s], s.side);
const shadowPlay = (t, clipY) => {
	const a = P.smooth(P.seg(t, K1 + 0.4, K1 + 1.3)) * (1 - P.smooth(P.seg(t, Q, Q + 0.5)));
	if (a <= 0) return '';
	const dim = 1 - 0.55 * P.smooth(P.seg(t, K4 + 0.2, K4 + 0.8));   // K4: the shadows step back for the dragon
	let seats = '', heads = '', arcs = '', dashes = '', tags = '';
	const arcOut = (n) => K3 + n * P.BEAT / 4;
	SH.forEach((s) => {
		const you = s.k === '马', ord = SH.filter((q) => q.k !== '马').indexOf(s);
		const sh = `transform="translate(${s.side * SPREAD},0)"`;
		seats += `<g ${sh}>${s.empty.svg}</g>`;
		const headGone = you ? 0 : P.seg(t, arcOut(ord) + 0.1, arcOut(ord) + 0.5);
		if (headGone < 1) heads += `<g ${sh} opacity="${(1 - headGone).toFixed(3)}">${s.st.svg.replace(s.empty.svg, '')}${you && s.st.hero ? K.horseHead({...s.st.hero, glow: 0}) : ''}</g>`;
		const on = P.seg(t, ARCS, ARCS + 0.18), off = you ? 0 : P.seg(t, arcOut(ord), arcOut(ord) + 0.12), aa = on * (1 - off);
		if (aa > 0) { const land = [960 + (s.side < 0 ? -1 : 1) * (50 + 130 * (1 - s.i / 5)), 905 - 220 * (s.i / 5) - 4];
			arcs += `<g ${sh} opacity="${aa.toFixed(3)}">${K.arc(s.st.mouth, land, (150 * s.st.s + 40) * (0.3 + 0.7 * on), s.st.s, you ? {core: '#E8894B', glow: '#FFB070', gA: 0.5} : {core: '#24140C', glow: '#24140C', gA: 0.2})}</g>`; }
		if (DASHED.includes(s.k)) { const di = DASHED.indexOf(s.k), dt = DASH0 + di * P.BEAT / 2, d = P.seg(t, dt, dt + 0.2);
			if (d > 0) { const hx = s.st.top[0] + (s.side < 0 ? 1 : -1) * 4 * s.st.s, hy = s.st.top[1] + 22 * s.st.s, size = 175 * s.st.s, sw = 7 / (size / 100);
				const dash = `stroke-dasharray="${13 / (size / 100)} ${9 / (size / 100)}"`, g = K.bro(s.k, hx, hy, size, s.side < 0 ? 1 : -1, '#F3E6CF', `fill-opacity=".14" stroke="#FFF1DC" stroke-width="${sw}" ${dash} stroke-linejoin="round"`).replace(/stroke="currentColor" stroke-width="[\d.]+"/g, `stroke="#FFF1DC" stroke-width="${sw}" ${dash}`);
				dashes += `<g ${sh}><g opacity="${d.toFixed(3)}">${g}</g></g>`; } }
		if (TAGK[s.k] && t >= TAGS) { const op = P.seg(t, TAGS, TAGS + 0.2) * (1 - P.seg(t, K4, K4 + 0.4)); if (op > 0) { const [x, y] = TAGP[s.k], ht = headTop(s);
			tags += `<g opacity="${op.toFixed(3)}"><path d="M${x},${y} L${ht[0].toFixed(1)},${(ht[1] - 4).toFixed(1)}" stroke="#FFF1DC" stroke-width="2.5" opacity=".75"/><rect x="${x - 70}" y="${y - 74}" width="140" height="76" rx="9" fill="#FFF1DC" opacity=".94"/><text x="${x}" y="${y - 15}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="60" fill="#5A2E16">${TAGK[s.k]}</text></g>`; } }
	});
	const flat = `<filter id="flat" filterUnits="userSpaceOnUse" x="-900" y="-600" width="3800" height="2400"><feFlood flood-color="#24140C"/><feComposite in2="SourceAlpha" operator="in"/></filter>`;
	return `<defs>${flat}<clipPath id="arcClip"><rect x="-900" y="-600" width="3800" height="${(clipY + 600).toFixed(1)}"/></clipPath></defs><g opacity="${(0.85 * a * dim).toFixed(3)}"><g transform="${SH_T}"><g filter="url(#flat)">${seats}${heads}</g></g>
		<g clip-path="url(#arcClip)"><g transform="${SH_T}">${arcs}</g></g><g transform="${SH_T}">${dashes}</g></g><g opacity="${a.toFixed(3)}">${tags}</g>`;
};
// ---- K4 (v2, gate 4 note 11): ONE big dashed dragon outline at the horse's size beside it, a big 「?」 inside, a gavel tap on b213;
// K5 「真假，说不清」: its far half fades; Q: it gives way to the dial (its 「?」 sits in the dragon's place on the dial)
const DRG = {x: 1390, y: 700};
const dragon = (t) => {
	const a = P.smooth(P.seg(t, K4 + 0.25, K4 + 0.85)) * (1 - P.smooth(P.seg(t, Q, Q + 0.45)));
	if (a <= 0) return '';
	const grow = 0.6 + 0.4 * P.easeOut3(P.seg(t, K4 + 0.25, K4 + 0.85)), size = BS * grow, sw = 8 / (size / 100), dash = `stroke-dasharray="${18 / (size / 100)} ${12 / (size / 100)}"`;
	const g = K.bro('龙', DRG.x, DRG.y, size, -1, '#F3E6CF', `fill-opacity=".1" stroke="#FFF1DC" stroke-width="${sw}" ${dash} stroke-linejoin="round"`).replace(/stroke="currentColor" stroke-width="[\d.]+"/g, `stroke="#FFF1DC" stroke-width="${sw}" ${dash}`);
	const half = P.smooth(P.seg(t, K5, K5 + 0.5)), cx = DRG.x - 10, cy = DRG.y - 0.48 * size;
	// the gavel on its block, right of the outline: lift, then the tap on b213 (impact lines 2 frames)
	const lift = t < GAV - 0.5 / 30 ? Math.sin(Math.PI * P.seg(t, GAV - 0.55, GAV - 0.5 / 30)) : 0, hit = t >= GAV - 0.5 / 30 && t < GAV + 2.5 / 30, gx = 1630, gy = 760;
	const gav = `<ellipse cx="${gx}" cy="${gy + 8}" rx="62" ry="13" fill="#1E120A"/><ellipse cx="${gx}" cy="${gy + 2}" rx="62" ry="13" fill="#6A4428"/><ellipse cx="${gx}" cy="${gy}" rx="52" ry="9" fill="#8A5C36"/>
		<g transform="rotate(${(-38 * lift).toFixed(2)} ${gx + 120} ${gy - 30})"><rect x="${gx - 10}" y="${gy - 40}" width="140" height="14" rx="7" fill="#5A3820"/><rect x="${gx - 44}" y="${gy - 66}" width="54" height="64" rx="10" fill="#6A4226"/><rect x="${gx - 44}" y="${gy - 66}" width="54" height="15" rx="6" fill="#C8955E" opacity=".75"/></g>
		${hit ? [-36, -16, 16, 36].map((q) => `<path d="M${gx - 17 + q},${gy - 74 - Math.abs(q) * 0.3} l${q * 0.6},${-22 + Math.abs(q) * 0.2}" stroke="#FFE2B0" stroke-width="4" stroke-linecap="round"/>`).join('') : ''}`;
	return `<defs><clipPath id="dL"><rect x="-900" y="-600" width="${(cx + 900).toFixed(1)}" height="2400"/></clipPath><clipPath id="dR"><rect x="${cx.toFixed(1)}" y="-600" width="2400" height="2400"/></clipPath>${K.blur('dgl', 10)}</defs>
	<g opacity="${a.toFixed(3)}"><g clip-path="url(#dL)" filter="url(#dgl)" opacity=".35">${g}</g><g clip-path="url(#dL)">${g}</g><g clip-path="url(#dR)" opacity="${(1 - 0.75 * half).toFixed(3)}">${g}</g>
	<text x="${cx}" y="${(cy + 70).toFixed(1)}" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="190" fill="#FFF1DC" opacity=".95">?</text>${gav}</g>`;
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
	s += sweep(BAND, 0.6, EAR[0] - 70, EAR[0] + 60, EAR[1] - 60, 24, 3.2, {tilt: 0.2});   // R5: a warm key band across the fold
	return s;
};
const camCase = (start) => P.cam(start, [
	{t0: V1, t1: 99.4, to: [830, 520, 0.82], ease: 'mix'},                 // the reunion's wide shot: five heads, one size
	{t0: 99.4, t1: R4 - 0.2, to: [846, 524, 0.85], ease: 'linear'},
	{t0: R4, t1: 107.3, to: [P.lerp(faceC[0], EAR[0], 0.35), P.lerp(faceC[1], EAR[1], 0.35), 2.4]},
	{t0: 107.45, t1: 110.2, to: [EARS[0], EARS[1] + 6, 5.2]},              // R5: both ears, the rolled one beside the straight one
	{t0: 110.2, t1: K1, to: [870, 455, 2.2]},                              // R6: easing back out over the head (the tremble on bar 49)
	{t0: K1, t1: 115.6, to: [960, 520, 1.0], ease: 'mix'},                 // K1: the pull back starts on the line; the arcs fire on bar 50
	{t0: 115.6, t1: K4, to: [955, 516, 1.03], ease: 'linear'},
	{t0: K4, t1: K4 + 2.4, to: [1150, 520, 1.15]},
	{t0: K4 + 2.4, t1: Q - 1.0, to: [1160, 518, 1.17], ease: 'linear'},
	{t0: Q - 1.0, t1: Q + 1.8, to: [960, 540, 1.0]},
	{t0: Q + 1.8, t1: FILM_END, to: [960, 548, 1.03], ease: 'linear'},
]);
let CAM = null;
F.caseRender = (t, ringStart) => {
	CAM = CAM ?? camCase(ringStart);
	const cam = CAM(t), meta = {cam, camId: 20, events: []};
	const clipY = cam.y + (828 - 540) / cam.z;   // the arcs never reach into the counter
	const world = caseBase + `<defs><radialGradient id="chalo" cx="960" cy="560" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity="${(0.42 * (1 + 0.04 * Math.sin(t * 2.8))).toFixed(3)}"/><stop offset=".6" stop-color="#C8682F" stop-opacity=".1"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient></defs>
		<rect x="-900" y="-600" width="3720" height="2280" fill="url(#chalo)"/>` + shadowPlay(t, clipY) + dial(t) + floor + reunion(t) + dragon(t) + caseHero(t);
	let svg = `<defs><radialGradient id="cvig3" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0605" stop-opacity="0"/><stop offset="1" stop-color="#0A0605" stop-opacity=".72"/></radialGradient></defs>
		<g transform="${P.camT(cam)}">${world}</g><rect width="1920" height="1080" fill="url(#cvig3)"/>`;
	const dim = 0.86 * P.smooth(P.seg(t, END, END + 0.39));   // v2: the card sits on ≤ 15 % of the picture
	if (dim > 0) svg += `<rect width="1920" height="1080" fill="#0A0605" opacity="${dim.toFixed(3)}"/>`;
	[[IN0, 'cases_in'], [OUT0, 'cases_out'], [HL, 'highlight'], [TREM, 'tremble'], [ARCS, 'shadow_arcs'], [GAV, 'dragon_gavel'], [Q, 'dial']].forEach(([x, n]) => { if (t >= x && t < x + 1 / 30) meta.events.push({[n]: t}); });
	return {svg, meta};
};
F.CASE = {heroC, faceC};
F.dayTag = dayTag;
// ---- the end card (house card, v8.1 times): Q slides into its slot, the J seal on bar 57, the title, the pill, the sources
const SEAL = P.BAR0 + 57 * 4 * P.BEAT;
F.endCard = (t) => {
	if (t < END) return '';
	const q = P.smooth(P.seg(t, END, END + 0.35)), s = P.seg(t, SEAL, SEAL + 0.18), ti = P.seg(t, 130.59, 130.84), pi = P.seg(t, 130.89, 131.14), so = P.seg(t, 130.99, 131.24);
	const tk = 1.12 - 0.12 * P.easeOut(P.seg(t, 130.59, 130.84));
	const qTop = P.lerp(124, 584, q), qSize = P.lerp(64, 58, q), qLeft = P.lerp(150, 960, q);
	return `<div style="position:absolute;left:0;right:0;top:0;bottom:0;z-index:30">
	 <div style="position:absolute;top:${qTop}px;left:${qLeft}px;transform:translateX(${(-50 * q).toFixed(2)}%);font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:${qSize}px;line-height:1.3;color:#FFF3D8;white-space:nowrap;letter-spacing:.03em;text-shadow:0 0 2px rgba(12,8,5,.9),0 2px 6px rgba(12,8,5,.65)">五个要是上拍，该不该<span style="color:#FFF1DC;background:#A84A26;box-shadow:-.08em 0 0 #A84A26,.08em 0 0 #A84A26">花钱买回来</span><span style="margin-right:-.5em">？</span></div>
	 ${s > 0 ? `<img src="${window.JSEAL}" style="position:absolute;left:${960 - 50}px;top:84px;width:100px;height:100px;opacity:${Math.min(1, s * 3).toFixed(3)};transform:rotate(-6deg) scale(${(1.15 - 0.15 * P.easeOut(s) + P.jolt(t, SEAL + 0.18, 0.02, 0.25, 1)).toFixed(4)})">` : ''}
	 <div style="position:absolute;left:0;right:0;top:206px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:132px;line-height:158px;letter-spacing:.1em;color:#f6cf78;opacity:${ti.toFixed(3)};transform:scale(${tk.toFixed(4)});transform-origin:50% 40%;text-shadow:0 3px 16px rgba(10,6,4,.85)"><span style="margin-right:-.1em">七个回国</span><br><span style="margin-right:-.1em">一个回家</span></div>
	 <div style="position:absolute;left:0;right:0;top:712px;text-align:center;opacity:${pi.toFixed(3)}"><span style="display:inline-block;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:38px;color:#FFF3D8;border:2px solid #f6cf78;border-radius:40px;padding:10px 36px">关注 Juno · 一起看懂世界</span></div>
	 <div style="position:absolute;left:0;right:0;bottom:60px;text-align:center;font-family:'Noto Sans CJK SC',sans-serif;font-size:22px;color:rgba(255,255,255,.6);opacity:${so.toFixed(3)}">资料：中新网 · 人民日报海外版 · 新京报 · 新华社 · 澎湃新闻 · 环球人物 · 中央社 · 都市快报 · China Daily · AP · NYRB · Sotheby's</div>
	</div>`;
};
F.CT = {V1, V2, R4, R5, R6, K1, K3, K4, K5, Q, END, FILM_END, IN0, OUT0, HL, TREM, ARCS, GAV, TAGS, DASH0, SEAL, BAND};
})();

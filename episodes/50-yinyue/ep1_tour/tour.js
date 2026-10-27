// 节奏环游世界 · 第1站 维也纳 (3/4). window.renderAt(t) draws one 1920x1080 frame from window.SCORE (score.json).
// Two worlds: the travel journal (lesson cards on paper) and the Vienna ballroom. The beat strip at the bottom shows every note you hear.
const SC = window.SCORE, SECS = SC.sections, W = 1920, H = 1080;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u;
const ease = (u) => 1 - Math.pow(1 - clamp(u), 3), easeIO = (u) => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const f1 = (x) => (Math.round(x * 10) / 10).toString();
const P = (pts) => pts.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const poly = (pts, fill, ex = '') => `<polygon points="${P(pts)}" fill="${fill}" ${ex}/>`;
const rect = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
const circ = (x, y, r, fill, ex = '') => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(Math.max(0, r))}" fill="${fill}" ${ex}/>`;
const ell = (x, y, rx, ry, fill, ex = '') => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(Math.max(0, rx))}" ry="${f1(Math.max(0, ry))}" fill="${fill}" ${ex}/>`;
const seg = (a, b, w, col, ex = '') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col}" stroke-width="${f1(w)}" stroke-linecap="round" ${ex}/>`;
const pth = (d, fill, ex = '') => `<path d="${d}" fill="${fill}" ${ex}/>`;
const grp = (tr, s, ex = '') => `<g transform="${tr}" ${ex}>${s}</g>`;
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const F = `font-family="Noto Sans CJK SC, sans-serif" font-weight="900"`, FS = `font-family="Noto Serif CJK SC, serif" font-weight="700"`;
const INK = '#2A2420', RED = '#D8433A', BLUE = '#2F5FA8', PAPER = '#EFE5CF', GOLD = '#F2C14E', CREAM = '#FFF6E6', SKIN = '#F1C9A5';
// ---------------------------------------------------------------- score lookups
const IDX = {};
for (const e of SC.ev) (IDX[e[2]] ||= []).push(e);
const lastIdx = (a, t) => { let lo = 0, hi = a.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (a[m][0] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; };
const SI = Object.fromEntries(SECS.map((s, i) => [s.name, i]));
const secIdx = (t) => { let i = 0; while (i + 1 < SECS.length && SECS[i + 1].t0 <= t) i++; return i; };
function beatOf(S, t) { const B = S.beats, n = B.length - 1; if (t <= B[0]) return (t - B[0]) / (B[1] - B[0]); if (t >= B[n]) return n + (t - B[n]) / (B[n] - B[n - 1]);
	let lo = 0, hi = n; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (B[m] <= t) lo = m; else hi = m; } return lo + (t - B[lo]) / (B[lo + 1] - B[lo]); }
const tOf = (name, b) => { const B = SECS[SI[name]].beats, i = Math.min(B.length - 2, Math.max(0, Math.floor(b))); return B[i] + (b - i) * (B[i + 1] - B[i]); };
const since = (row, t, part) => { const a = IDX[row] || []; for (let i = lastIdx(a, t); i >= 0 && i > lastIdx(a, t) - 12; i--) if (!part || a[i][3] === part) return t - a[i][0]; return 99; };
// ---------------------------------------------------------------- defs
const DEFS = `<defs>
<filter id="tshadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#1A0E08" flood-opacity=".6"/></filter>
<filter id="soft" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#3A2410" flood-opacity=".28"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="blur8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur20" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="24"/></filter>
<filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="9" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.6 0 0 0 2.15" result="mm"/>
<feComposite in="d" in2="mm" operator="in"/></filter>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E9CF"/><stop offset="1" stop-color="#E4CDA2"/></linearGradient>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D2A5C"/><stop offset="1" stop-color="#46609E"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A6136"/><stop offset=".45" stop-color="#C7894F"/><stop offset="1" stop-color="#A86A3A"/></linearGradient>
<linearGradient id="drape" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C1E33"/><stop offset=".5" stop-color="#B8384F"/><stop offset="1" stop-color="#7C1E33"/></linearGradient>
<linearGradient id="alcove" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E1528"/><stop offset="1" stop-color="#8E2A3E"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE3E2"/><stop offset="1" stop-color="#B7D3D6"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".46" r=".78"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#140A04" stop-opacity=".42"/></radialGradient>
<radialGradient id="pvig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#8A6A3A" stop-opacity="0"/><stop offset="1" stop-color="#8A6A3A" stop-opacity=".28"/></radialGradient>
<radialGradient id="warm"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".75"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient>
<pattern id="grain" width="256" height="256" patternUnits="userSpaceOnUse"><image href="${GRAIN}" width="256" height="256"/></pattern>
<clipPath id="card"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
</defs>`;
// ---------------------------------------------------------------- the ballroom
const GOWNS = [['#F28AA0', '#D9667F'], ['#7FD3BE', '#58B59F'], ['#F4D35E', '#DDB43A'], ['#B49CF0', '#9479DB'], ['#86BFF2', '#5F9FDB'], ['#F5A25D', '#DE8440'], ['#F6F1FA', '#D9CFE6']];
const HAIR = ['#3B2416', '#C8873A', '#1E1A1A', '#8A4B2A', '#E4C27A', '#2E1E14', '#5A3A22'];
function couple(theta, p, pulse, i) {   // local coords: feet at y=0, about 300 tall
	const c = Math.cos(theta), sx = (c >= 0 ? 1 : -1) * Math.max(.36, Math.abs(c)), front = Math.sin(theta) > 0;
	const [g1, g2] = GOWNS[i % GOWNS.length], flare = .16 + .32 * Math.abs(Math.sin(theta)) + .3 * pulse, wb = 150 * (1 + flare);
	const step = 8 + 22 * Math.exp(-p * 3);   // a big step on 1, small on 2 and 3
	const man = `${seg([-34, -2], [-34 - step * .6, -140], 15, '#15121C')}${seg([-34, -2], [-34 + step, -140], 15, '#15121C')}
		${poly([[-58, -142], [-14, -142], [-6, -240], [-62, -240]], '#1C1926')}${poly([[-58, -150], [-80, -96], [-66, -150]], '#1C1926')}
		${poly([[-44, -238], [-24, -238], [-34, -200]], '#FFFFFF')}${poly([[-40, -236], [-28, -236], [-34, -229]], '#15121C')}
		${rect(-46, -282, 26, 40, SKIN, 'rx="6"')}${pth('M-48,-276 Q-34,-300 -18,-278 L-18,-284 Q-34,-306 -50,-282 Z', HAIR[(i + 3) % 7])}${rect(-26, -268, 5, 2, INK)}
		${seg([-16, -228], [24, -214], 11, '#1C1926')}`;
	const skirt = `<path d="M${-22},-168 L22,-168 C${f1(36 + wb * .1)},-110 ${f1(wb * .52)},-40 ${f1(wb * .5)},-6 Q0,${f1(10 + 8 * pulse)} ${f1(-wb * .5)},-6 C${f1(-wb * .52)},-40 ${f1(-36 - wb * .1)},-110 -22,-168 Z" fill="${g1}"/>`
		+ [0, 1, 2, 3].map((k) => { const a = theta * 2 + k * 1.57, x = Math.sin(a) * wb * .42; return Math.cos(a) > 0 ? seg([x * .2, -160], [x, -10], 5, g2, 'opacity=".8"') : ''; }).join('')
		+ pth(`M${f1(-wb * .5)},-6 Q0,${f1(10 + 8 * pulse)} ${f1(wb * .5)},-6`, 'none', `stroke="${g2}" stroke-width="6"`);
	const lady = `<g transform="translate(30 0)">${skirt}${poly([[-20, -166], [20, -166], [16, -226], [-16, -226]], g1)}${poly([[-12, -226], [12, -226], [0, -212]], g2)}
		${rect(-12, -266, 24, 38, SKIN, 'rx="6"')}${circ(10, -268, 13, HAIR[i % 7])}${pth('M-14,-262 Q-2,-282 14,-262 L14,-270 Q0,-288 -16,-268 Z', HAIR[i % 7])}${rect(-9, -252, 5, 2, INK)}
		${seg([-14, -222], [-50, -238], 9, SKIN)}</g>`;
	return `<g transform="scale(${f1(sx)} 1)">${front ? lady + man : man + lady}</g>`;
}
function conductor(x, y, s, S, t) {   // the maestro, from the side, drawing the 3/4 pattern with his baton
	const b = beatOf(S, t), p = ((b % 3) + 3) % 3;
	const K = [[0, [0, 80]], [.32, [-18, 28]], [1, [104, 46]], [1.3, [110, 14]], [2, [56, -26]], [2.55, [8, -104]], [3, [0, 80]]];
	const at = (q) => { q = ((q % 3) + 3) % 3; let i = 0; while (i + 1 < K.length && K[i + 1][0] <= q) i++; const [a, pa] = K[i], [bb, pb] = K[Math.min(K.length - 1, i + 1)];
		let u = bb > a ? (q - a) / (bb - a) : 0; u = [0, 2, 4].includes(i) ? 1 - Math.pow(1 - u, 2) : u * u; return [lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u)]; };
	const C = [210, -330], tip = (q) => { const h = at(q); return [C[0] + h[0], C[1] + h[1]]; };
	let s2 = `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s)})">`;
	s2 += rect(-80, -40, 200, 40, '#5A2E1E') + rect(-90, -48, 220, 12, '#7A4430');
	s2 += seg([-12, -44], [-24, -190], 20, '#15121C') + seg([22, -44], [30, -190], 20, '#15121C');
	s2 += poly([[-46, -188], [52, -188], [44, -330], [-40, -330]], '#1C1926') + poly([[-46, -200], [-78, -120], [-56, -205]], '#1C1926');
	s2 += rect(-4, -390, 52, 62, SKIN, 'rx="10"') + pth('M-14,-372 Q-34,-430 6,-420 Q20,-456 46,-424 Q70,-430 60,-392 Q76,-370 56,-356 L46,-380 Q20,-404 -4,-380 Z', '#F4F1EA');
	s2 += rect(34, -366, 10, 3, INK) + pth('M30,-346 Q42,-338 52,-348', 'none', `stroke="${INK}" stroke-width="3"`);
	// left hand keeps time softly, right hand holds the baton
	const tp = tip(p), hand = [tp[0] - 70, tp[1] + 34];
	s2 += circ(C[0] + 40, C[1] - 6, 150, '#1D1A2E', 'opacity=".42" filter="url(#blur20)"');
	s2 += seg([30, -318], [lerp(30, hand[0], .5) + 10, lerp(-318, hand[1], .5) + 22], 16, '#1C1926') + seg([lerp(30, hand[0], .5) + 10, lerp(-318, hand[1], .5) + 22], hand, 14, '#1C1926');
	s2 += circ(hand[0], hand[1], 11, SKIN) + seg(hand, tp, 4, '#FFFFFF');
	// the trail, and the beat numbers at the three points
	for (let k = 0; k < 22; k++) { const q0 = p - 1.6 + k * 1.6 / 22, q1 = q0 + 1.6 / 22, a = tip(q0), c = tip(q1); s2 += seg(a, c, 7 * (k / 22), GOLD, `opacity="${f1(.15 + .75 * k / 22)}"`); }
	[[0, '1'], [2, '2'], [4, '3']].forEach(([ki, n], j) => { const pt = K[ki][1], on = Math.floor(p) === j, pop = on ? Math.exp(-(p - j) * 3) : 0;
		s2 += `<text x="${f1(C[0] + pt[0] * 1.3 + (j === 1 ? 26 : j === 2 ? 0 : -10))}" y="${f1(C[1] + pt[1] * 1.25 + (j === 0 ? 46 : j === 2 ? -10 : 10))}" text-anchor="middle" ${F} font-size="${f1(50 + 30 * pop)}" fill="${on ? GOLD : '#FFFFFF'}" opacity="${on ? 1 : .55}" filter="url(#tshadow)">${n}</text>`; });
	return s2 + '</g>';
}
function ballroom(t, S, camZ = 1.03, camX = 960, camY = 540) {
	const b = beatOf(S, t), barF = b / 3, p = ((b % 3) + 3) % 3, pulse = Math.exp(-p * 2.2), tg = t;
	let s = rect(0, 0, W, 600, 'url(#wall)') + rect(0, 0, W, 64, '#C9A04A') + rect(0, 64, W, 10, '#E8CF8E');
	for (let i = 0; i < 48; i++) s += rect(i * 40 + 8, 30, 22, 26, '#B68A36');
	// tall arched windows with snow, red drapes
	for (const wx of [190, 470, 1450, 1730]) {
		s += pth(`M${wx - 88},560 L${wx - 88},230 A88,88 0 0 1 ${wx + 88},230 L${wx + 88},560 Z`, '#C9A04A') + pth(`M${wx - 74},552 L${wx - 74},232 A74,74 0 0 1 ${wx + 74},232 L${wx + 74},552 Z`, 'url(#night)');
		for (let k = 0; k < 14; k++) { const sx = wx - 70 + hash(k + wx) * 140, sy = 160 + ((hash(k * 3 + wx) * 400 + tg * (24 + 18 * hash(k))) % 400); s += circ(sx + 6 * Math.sin(tg + k), sy, 2.4 + 2 * hash(k + 2), '#FFFFFF', 'opacity=".85"'); }
		s += seg([wx, 160], [wx, 552], 6, '#C9A04A') + seg([wx - 74, 380], [wx + 74, 380], 6, '#C9A04A');
		s += pth(`M${wx - 120},90 Q${wx - 96},330 ${wx - 104},590 L${wx - 70},590 Q${wx - 64},360 ${wx - 40},120 Z`, 'url(#drape)') + pth(`M${wx + 120},90 Q${wx + 96},330 ${wx + 104},590 L${wx + 70},590 Q${wx + 64},360 ${wx + 40},120 Z`, 'url(#drape)');
		s += pth(`M${wx - 130},84 Q${wx},150 ${wx + 130},84 L${wx + 130},110 Q${wx},176 ${wx - 130},110 Z`, '#9E2B3E');
	}
	for (const px of [40, 330, 610, 1310, 1590, 1880]) s += rect(px - 22, 74, 44, 490, '#F9EED8') + rect(px - 30, 74, 60, 26, '#D9B566') + rect(px - 28, 540, 56, 24, '#D9B566') + rect(px - 4, 100, 8, 440, '#EAD7AE');
	// the orchestra alcove: musicians bow on 恰, the bass plucks on 嘭
	s += pth('M690,560 L690,300 A270,190 0 0 1 1230,300 L1230,560 Z', '#C9A04A') + pth('M712,560 L712,304 A248,172 0 0 1 1208,304 L1208,560 Z', 'url(#alcove)');
	const bow = Math.exp(-since('pah', t) * 5), pl = Math.exp(-since('oom', t) * 6);
	for (let k = 0; k < 8; k++) { const mx = 770 + k * 54, my = 470 - (k % 2) * 16;
		s += rect(mx - 14, my - 10, 28, 58, '#1C1926') + circ(mx, my - 22, 12, SKIN) + pth(`M${mx - 12},${my - 26} Q${mx},${my - 42} ${mx + 12},${my - 26}`, HAIR[k % 7]);
		if (k === 7) s += ell(mx + 26, my + 10, 16, 40, '#8A4A24') + seg([mx + 26, my - 50], [mx + 26, my + 40], 3, '#3A2414') + seg([mx + 8, my + 8], [mx + 22, my + 4 + 8 * pl], 6, SKIN);
		else s += grp(`rotate(-28 ${mx + 10} ${my - 12})`, ell(mx + 14, my - 12, 13, 6, '#A0522D')) + seg([mx - 20 + 18 * bow, my - 30 + 8 * bow], [mx + 34 + 18 * bow, my + 4 + 8 * bow], 3, '#F4E7C8'); }
	s += rect(690, 512, 540, 16, '#E8CF8E') + rect(690, 528, 540, 34, '#C9A04A');
	for (let k = 0; k < 18; k++) s += rect(700 + k * 30, 530, 12, 30, '#B68A36');
	// the floor: polished parquet with warm reflections
	s += rect(0, 560, W, 520, 'url(#floor)') + rect(0, 556, W, 10, '#7A4A2A');
	for (let i = -16; i <= 16; i++) s += seg([960 + i * 70, 566], [960 + i * 330, 1080], 2, '#6E3E1E', 'opacity=".28"');
	for (let k = 0; k < 9; k++) { const y = 566 + Math.pow(k / 9, 1.7) * 514; s += seg([0, y], [W, y], 2, '#6E3E1E', 'opacity=".22"'); }
	for (const cx of [480, 960, 1440]) s += ell(cx, 700, 220, 60, 'url(#warm)', `opacity="${f1(.45 + .3 * pulse)}"`);
	// chandeliers sway with the bar and flare on 1
	let ch = '';
	for (const [k, cx] of [480, 960, 1440].entries()) {
		const a = 1.8 * Math.sin(Math.PI * barF + k), y0 = k === 1 ? 150 : 170;
		let c = seg([cx, -10], [cx, y0 - 50], 4, '#8A6A2A') + circ(cx, y0 - 10, 150, 'url(#warm)', `opacity="${f1(.55 + .4 * pulse)}"`);
		c += ell(cx, y0, 120, 22, 'none', `stroke="${GOLD}" stroke-width="7"`) + ell(cx, y0 - 40, 74, 14, 'none', `stroke="${GOLD}" stroke-width="6"`) + seg([cx, y0 - 60], [cx, y0 + 30], 8, GOLD);
		for (let j = 0; j < 12; j++) { const ang = j / 12 * Math.PI * 2, x = cx + 120 * Math.cos(ang), y = y0 + 22 * Math.sin(ang); c += seg([x, y], [x, y + 26], 2, '#FFFFFF', 'opacity=".7"') + circ(x, y + 30, 4.5, '#FFFFFF', 'opacity=".9"');
			if (j % 2 === 0) c += rect(x - 4, y - 26, 8, 22, '#FFF6E6') + circ(x, y - 32, 6 + 2 * pulse, '#FFD27A', 'filter="url(#glow)"'); }
		ch += grp(`rotate(${f1(a)} ${cx} 0)`, c);
	}
	// dancers: seven couples travel round the floor, each turning half a circle a bar, down on 1 and up on 2, 3
	const cs = [];
	for (let i = 0; i < 9; i++) { const ph = i / 9 * Math.PI * 2 + barF * .11, x = 1040 + 700 * Math.cos(ph), y = 755 + 110 * Math.sin(ph);
		const sc = lerp(.8, 1.36, (y - 645) / 220), rise = Math.pow(Math.sin(Math.PI * clamp(p / 2.75)), .8);
		cs.push({ y, s: `${ell(x, y + 2, 120 * sc, 18 * sc, '#3A1E0E', 'opacity=".28"')}<g transform="translate(${f1(x)} ${f1(y - 16 * rise * sc)}) scale(${f1(sc)})">${couple(Math.PI * barF + i * 1.1, p, pulse, i)}</g>`
			+ `<g transform="translate(${f1(x)} ${f1(y + 10)}) scale(${f1(sc)} ${f1(-sc * .42)})" opacity=".1">${couple(Math.PI * barF + i * 1.1, p, pulse, i)}</g>` }); }
	cs.sort((a, b2) => a.y - b2.y);
	s += ch + cs.map((c) => c.s).join('');
	return `<g transform="translate(960 540) scale(${f1(camZ)}) translate(${f1(-camX)} ${f1(-camY)})">${s}</g>`;
}
// ---------------------------------------------------------------- the travel journal
function airmail() {
	let s = '';
	for (let i = -1; i < 34; i++) { const x = i * 60; const c = i % 2 ? RED : BLUE;
		s += poly([[x, 0], [x + 30, 0], [x + 52, 26], [x + 22, 26]], c) + poly([[x, H - 26], [x + 30, H - 26], [x + 52, H], [x + 22, H]], c); }
	for (let j = -1; j < 20; j++) { const y = j * 60; const c = j % 2 ? BLUE : RED;
		s += poly([[0, y], [26, y + 22], [26, y + 52], [0, y + 30]], c) + poly([[W - 26, y], [W, y + 22], [W, y + 52], [W - 26, y + 30]], c); }
	return s;
}
const PC = { x: 1290, y: 92, s: 540 / W, rot: 4 };   // where the postcard sits on the page
function postcard(t, S, u, rot) {   // the ballroom as a postcard; u = 1 on the page, 0 = full screen
	const sc = Math.exp(lerp(0, Math.log(PC.s), u)), x = lerp(0, PC.x, u), y = lerp(0, PC.y, u), w = W * sc, h = H * sc, pad = 16 * u;
	const BS = SECS[SI.ball].t0 <= t ? S : SECS[SI.cold];
	return `<g transform="rotate(${f1(rot)} ${f1(x + w / 2)} ${f1(y + h / 2)})">${rect(x - pad, y - pad, w + 2 * pad, h + 2 * pad + 46 * u, '#FFFDF7', 'filter="url(#soft)"')}
		<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(sc)})"><g clip-path="url(#card)">${ballroom(t, BS)}</g></g>
		${u > .5 ? `<text x="${f1(x + 10)}" y="${f1(y + h + 36)}" ${FS} font-size="26" fill="${INK}" opacity="${f1((u - .5) * 2 * .8)}">Grüße aus ${t >= tOf('fly', 3) ? 'Wien · 维也纳' : '? ? ?'}</text>` : ''}
		${rect(x + w * .42, y - 26 * u, 90 * u, 34 * u, '#E9D9A8', 'opacity=".85"')}</g>`;
}
function stamp(text, x, y, size, rot, col, k, sub = '') {   // a rubber stamp landing: k goes 0..1 as it hits
	const sc = 1 + .6 * (1 - ease(k * 1.6)), op = clamp(k * 3);
	return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(sc)})" opacity="${f1(op)}"><g filter="url(#ink)">
		<text x="0" y="0" text-anchor="middle" ${F} font-size="${size}" fill="${col}">${text}</text>${sub}</g></g>`;
}
function beatDots(S, t, x0, y, n, strong) {
	const b = beatOf(S, t), cur = Math.floor(((b % n) + n) % n), fr = b - Math.floor(b);
	let s = '';
	for (let k = 0; k < n; k++) { const r = strong ? [64, 34, 34, 34][k] : 46, x = x0 + k * 170, on = k === cur && b >= 0;
		s += circ(x, y, r + (on ? 10 * Math.exp(-fr * 4) : 0), on ? RED : 'none', `stroke="${INK}" stroke-width="6" opacity="${on ? 1 : .55}"`);
		s += `<text x="${x}" y="${y + r + 58}" text-anchor="middle" ${F} font-size="44" fill="${INK}" opacity=".75">${k + 1}</text>`; }
	return s;
}
function icon(kind, x, y, s, col) {
	if (kind === 'bass') return grp(`translate(${x} ${y}) scale(${s})`, ell(0, 20, 34, 46, col) + ell(0, -30, 26, 32, col) + rect(-4, -120, 8, 120, INK) + rect(-10, -128, 20, 14, INK));
	return grp(`translate(${x} ${y}) scale(${s}) rotate(-20)`, ell(0, 10, 20, 26, col) + ell(0, -22, 15, 18, col) + rect(-3, -84, 6, 76, INK) + seg([-40, -40], [44, 30], 4, '#8A6A3A'));
}
function mapPanel(t, S) {   // a folded map slides in; a paper plane flies from 出发 to 维也纳
	const b = beatOf(S, t), u = ease(b / 1.2);
	let s = `<g transform="translate(${f1(lerp(-1200, 0, u))} 0) rotate(-2 640 560)">` + rect(110, 250, 1080, 600, 'url(#sea)', 'filter="url(#soft)"');
	const land = [[[120, 380], [300, 300], [520, 330], [640, 270], [820, 300], [980, 260], [1180, 300], [1180, 640], [1040, 700], [900, 650], [760, 720], [600, 690], [460, 760], [300, 740], [120, 800]],
		[[160, 830], [380, 790], [560, 840]]];
	s += poly(land[0], '#EADBB0') + poly(land[1], '#EADBB0');
	for (let i = 0; i < 9; i++) s += seg([110 + i * 120, 250], [110 + i * 120, 850], 1.5, '#8AA7A8', 'opacity=".5"');
	for (let j = 0; j < 5; j++) s += seg([110, 250 + j * 120], [1190, 250 + j * 120], 1.5, '#8AA7A8', 'opacity=".5"');
	for (let k = 0; k < 4; k++) s += seg([190, 760], [190 + 50 * Math.cos(k * Math.PI / 2), 760 + 50 * Math.sin(k * Math.PI / 2)], 5, INK, 'opacity=".5"');
	s += `<text x="190" y="712" text-anchor="middle" ${F} font-size="26" fill="${INK}" opacity=".6">N</text>`;
	const A = [300, 690], B = [950, 430], Cc = [520, 300], q = (v) => [(1 - v) * (1 - v) * A[0] + 2 * (1 - v) * v * Cc[0] + v * v * B[0], (1 - v) * (1 - v) * A[1] + 2 * (1 - v) * v * Cc[1] + v * v * B[1]];
	const fly = easeIO((b - .8) / 5.2);
	for (let k = 0; k < 40; k++) { const v0 = k / 40, v1 = v0 + .012; if (v0 > fly) break; s += seg(q(v0), q(v1), 5, RED); }
	s += circ(A[0], A[1], 14, RED) + `<text x="${A[0]}" y="${A[1] + 56}" text-anchor="middle" ${F} font-size="34" fill="${INK}">出发</text>`;
	// the Riesenrad (Vienna's giant wheel) turns slowly at the destination
	const wr = Math.PI * b / 12; let wh = circ(0, 0, 58, 'none', `stroke="${INK}" stroke-width="5"`);
	for (let k = 0; k < 10; k++) { const a = wr + k * Math.PI / 5; wh += seg([0, 0], [58 * Math.cos(a), 58 * Math.sin(a)], 2.5, INK) + rect(58 * Math.cos(a) - 7, 58 * Math.sin(a) - 2, 14, 12, RED); }
	s += grp(`translate(${B[0] + 110} ${B[1] - 30})`, wh + seg([0, 0], [-40, 84], 5, INK) + seg([0, 0], [40, 84], 5, INK));
	s += circ(B[0], B[1], 14, BLUE) + `<text x="${B[0] - 10}" y="${B[1] + 60}" text-anchor="middle" ${F} font-size="38" fill="${INK}" opacity="${f1(clamp((b - 5.5) * 2))}">维也纳</text>`;
	const pp = q(Math.min(1, fly)), pn = q(Math.min(1, fly + .02)), ang = Math.atan2(pn[1] - pp[1], pn[0] - pp[0]) * 180 / Math.PI;
	s += grp(`translate(${f1(pp[0])} ${f1(pp[1])}) rotate(${f1(ang)})`, poly([[40, 0], [-30, -24], [-14, 0]], '#FFFFFF', `stroke="${INK}" stroke-width="3"`) + poly([[40, 0], [-30, 22], [-14, 0]], '#E4E0D6', `stroke="${INK}" stroke-width="3"`));
	return s + '</g>';
}
function page(t, S) {
	const b = beatOf(S, t);
	let s = rect(0, 0, W, H, PAPER) + rect(0, 0, W, H, 'url(#pvig)');
	for (let k = 0; k < 7; k++) s += seg([60, 260 + k * 74], [1120, 260 + k * 74], 2, '#B9A98A', 'opacity=".35"');
	// the boarding pass
	const dest = t >= tOf('fly', 6) ? '维也纳 WIEN' : '? ? ?';
	s += grp('rotate(-3 1560 610)', rect(1330, 520, 480, 190, '#FFFDF7', 'filter="url(#soft)" rx="10"') + rect(1330, 520, 480, 44, BLUE, 'rx="10"') + rect(1330, 548, 480, 16, BLUE)
		+ `<text x="1352" y="552" ${F} font-size="26" fill="#FFFFFF">登机牌 · BOARDING PASS</text><text x="1352" y="610" ${F} font-size="24" fill="${INK}" opacity=".6">航班</text><text x="1352" y="660" ${F} font-size="52" fill="${INK}">3/4</text>`
		+ `<text x="1500" y="610" ${F} font-size="24" fill="${INK}" opacity=".6">目的地</text><text x="1500" y="660" ${F} font-size="44" fill="${RED}">${dest}</text>` + seg([1740, 530], [1740, 700], 3, INK, 'stroke-dasharray="6 8" opacity=".4"'));
	// the lesson stamps
	const nm = S.name, k = clamp(beatOf(S, t) / .6);
	if (nm === 'four') s += stamp('4/4', 560, 560, 300, -5, BLUE, k) + beatDots(S, t, 300, 740, 4, false);
	if (nm === 'three') s += stamp('3/4', 560, 560, 300, -5, RED, k) + beatDots(S, t, 360, 740, 3, false);
	if (nm === 'strong') s += stamp('强<tspan font-size="150" dx="30">弱</tspan><tspan font-size="150" dx="20">弱</tspan>', 520, 560, 270, -4, RED, k) + beatDots(S, t, 360, 740, 3, true);
	if (nm === 'oompah') { s += stamp('嘭<tspan font-size="150" dx="30" fill="#C98A12">恰</tspan><tspan font-size="150" dx="20" fill="#C98A12">恰</tspan>', 520, 520, 260, -4, RED, k);
		const p = ((b % 3) + 3) % 3, fr = p - Math.floor(p), on = Math.floor(p);
		s += icon('bass', 300, 800, 1 + (on === 0 ? .14 * Math.exp(-fr * 4) : 0), '#C0392B') + icon('vln', 540, 790, 1 + (on === 1 ? .2 * Math.exp(-fr * 4) : 0), '#E0A526') + icon('vln', 720, 790, 1 + (on === 2 ? .2 * Math.exp(-fr * 4) : 0), '#E0A526'); }
	if (nm === 'fly') { s += mapPanel(t, S);
		const ks = clamp((b - 6) / .6); if (b >= 6) s += stamp('WIEN', 1000, 590, 92, 9, BLUE, ks, `<circle cx="0" cy="-30" r="118" fill="none" stroke="${BLUE}" stroke-width="10"/><circle cx="0" cy="-30" r="96" fill="none" stroke="${BLUE}" stroke-width="4"/><text x="0" y="46" text-anchor="middle" ${F} font-size="36" fill="${BLUE}">维也纳 · 3/4</text>`); }
	return s + airmail();
}
// ---------------------------------------------------------------- the beat strip: every note you hear, scrolling past a fixed line
const ROWDEF = { beat: ['拍子', INK], oom: ['低音 · 嘭', '#C0392B'], pah: ['弦乐 · 恰', '#E0A526'], mel: ['旋律', '#2F7FBF'], step: ['舞步', '#8E5BC7'] };
const ROWS = { cold: ['oom', 'pah', 'mel', 'step'], pull: ['oom', 'pah', 'step'], four: ['beat'], three: ['beat'], strong: ['beat'], oompah: ['oom', 'pah'], fly: ['oom', 'pah'], ball: ['oom', 'pah', 'mel', 'step'], end: ['oom', 'pah', 'mel', 'step'] };
function strip(t, S, dark) {
	const rows = ROWS[S.name], n = rows.length, rh = n <= 2 ? 50 : 36, top = 34, h = n * rh + top + 14, y1 = 1046, y0 = y1 - h, xa = 250, xb = 1880, px = 560, pps = 300;
	let s = dark ? rect(30, y0, 1860, h, '#1D1A2E', 'opacity=".86" rx="14"') + rect(30, y0, 1860, h, 'none', `stroke="${GOLD}" stroke-width="2" rx="14" opacity=".6"`)
		: rect(30, y0, 1860, h, '#FBF7EE', `stroke="${INK}" stroke-width="3" rx="10" filter="url(#soft)"`);
	if (!dark) for (let i = 0; i < 62; i++) s += circ(46 + i * 30, y0, 6, PAPER);
	const fg = dark ? '#FFFFFF' : INK, X = (tt) => px + (tt - t) * pps;
	// bar lines, beat ticks and counts, across neighbouring sections
	for (let si = Math.max(0, SI[S.name] - 1); si <= Math.min(SECS.length - 1, SI[S.name] + 1); si++) { const Q = SECS[si];
		for (let k = 0; k < Q.bars * Q.meter; k++) { const x = X(Q.beats[k]); if (x < xa - 10 || x > xb + 10) continue; const bar = k % Q.meter === 0;
			s += seg([x, y0 + top - 6], [x, y1 - 10], bar ? 3 : 1.5, fg, `opacity="${bar ? .45 : .18}"`);
			s += `<text x="${f1(x + 6)}" y="${f1(y0 + 26)}" ${F} font-size="20" fill="${fg}" opacity="${bar ? .9 : .5}">${k % Q.meter + 1}</text>`;
			if (k === 0) s += rect(x - 2, y0 + 4, 54, 26, Q.meter === 3 ? RED : BLUE, 'rx="6"') + `<text x="${f1(x + 25)}" y="${f1(y0 + 25)}" text-anchor="middle" ${F} font-size="20" fill="#FFFFFF">${Q.meter}/4</text>`; } }
	rows.forEach((r, j) => { const [lab, col] = ROWDEF[r], y = y0 + top + j * rh, cy = y + rh / 2;
		s += circ(64, cy, rh * .26, col) + `<text x="${f1(88)}" y="${f1(cy + rh * .2)}" ${F} font-size="${f1(Math.min(30, rh * .56))}" fill="${dark && r === 'beat' ? '#FFFFFF' : col}">${lab}</text>`;
		const a = IDX[r] || [], seen = {};
		for (let i = Math.max(0, lastIdx(a, t - (px - xa) / pps - 2)); i < a.length && a[i][0] < t + (xb - px) / pps; i++) {
			const e = a[i], x = X(e[0]); if (x < xa || x > xb) continue; const key = Math.round(e[0] * 40); if (seen[key]) continue; seen[key] = 1;
			const live = t >= e[0] && t < e[0] + .18, past = t > e[0] + .18, op = past ? .42 : 1, gl = live ? Math.exp(-(t - e[0]) / .09) : 0;
			let m;
			if (r === 'beat') { const rr = (6 + 14 * Math.pow(e[5] / 127, 1.6)) * (1 + .4 * gl); m = circ(x, cy, rr, e[4] === 36 ? RED : (dark ? '#FFFFFF' : INK)); }
			else if (r === 'oom') m = rect(x - 2, cy - rh * .3, 34 * (1 + .2 * gl), rh * .6, col, 'rx="8"');
			else if (r === 'pah') m = circ(x + 8, cy, rh * .2 * (1 + .45 * gl), col);
			else if (r === 'mel') m = rect(x, cy - 7 + (74 - e[4]) * 1.3, Math.max(4, Math.min(xb - x, Math.max(14, e[1] * pps - 6))), 14, col, 'rx="7"');
			else m = ell(x + 10, cy, (e[3] === 'big' ? 16 : 9) * (1 + .3 * gl), (e[3] === 'big' ? 10 : 6) * (1 + .3 * gl), col);
			if (gl > .05) s += circ(x + 10, cy, 26, col, `opacity="${f1(.6 * gl)}" filter="url(#blur8)"`);
			s += `<g opacity="${f1(op)}">${m}</g>`;
		} });
	s += seg([px, y0 + 6], [px, y1 - 4], 5, RED) + poly([[px - 12, y0 - 4], [px + 12, y0 - 4], [px, y0 + 12]], RED);
	return s;
}
// ---------------------------------------------------------------- subtitles and titles
function headline(t, dark) {
	const sub = SC.subs.find((x) => t >= x[0] && t < x[1]); if (!sub) return '';
	const [t0, t1, txt] = sub; if (txt.startsWith('维也纳 · 华尔兹')) return bigTitle(t, t0, t1);
	const u = ease((t - t0) / .25), out = clamp((t1 - t) / .18), i = txt.indexOf('：'), a = i >= 0 ? txt.slice(0, i + 1) : '', bp = i >= 0 ? txt.slice(i + 1) : txt;
	const acc = dark ? GOLD : RED, len = [...txt].length, fs = len > 15 ? 80 : len > 11 ? 92 : 104;
	const esc = (x) => x.replace(/(\d+\/\d+|\d+)/g, '\u0001$1\u0002').replace(/「(.+?)」/g, '「\u0001$1\u0002」').replace(/\u0001/g, `<tspan fill="${acc}">`).replace(/\u0002/g, '</tspan>');
	const plaque = dark ? rect(52, 166 - fs - 4, fs * len * .97 + 70, fs + 44, '#241018', 'opacity=".66" rx="20"') : '';
	return `<g opacity="${f1(u * out)}" transform="translate(0 ${f1((1 - u) * 24)})">${plaque}<text x="84" y="166" ${dark ? 'filter="url(#tshadow)"' : ''} ${F} font-size="${fs}" fill="${dark ? CREAM : INK}">${a ? `<tspan fill="${acc}">${a}</tspan>` : ''}${esc(bp)}</text></g>`;
}
function bigTitle(t, t0, t1) {
	const u = (t - t0) / .3, out = clamp((t1 - t) / .3), sc = 1 + .3 * Math.exp(-clamp(u, 0, 9) * 3);
	return `<g opacity="${f1(clamp(u) * out)}" transform="translate(960 300) scale(${f1(sc)})" filter="url(#tshadow)">${rect(-560, -170, 1120, 250, '#2A0E18', 'opacity=".55" rx="24"')}
		<text x="0" y="-20" text-anchor="middle" ${FS} font-size="170" fill="${GOLD}">维也纳</text>
		<text x="0" y="52" text-anchor="middle" ${F} font-size="50" fill="${CREAM}" letter-spacing="6">WIEN · 华尔兹 · 3/4</text></g>`;
}
function endStamp(t, S) {
	const tb = tOf('end', 9); if (t < tb) return '';
	const k = clamp((t - tb) / .35), fly = clamp((t - tOf('end', 11)) / 2.2);
	let s = stamp('第1站', 1470, 400, 64, -10, RED, k, `<circle cx="0" cy="-22" r="150" fill="none" stroke="${RED}" stroke-width="12"/><circle cx="0" cy="-22" r="128" fill="none" stroke="${RED}" stroke-width="4"/><text x="0" y="56" text-anchor="middle" ${F} font-size="54" fill="${RED}">维也纳 ✓</text><text x="0" y="-92" text-anchor="middle" ${F} font-size="34" fill="${RED}">3/4 · 华尔兹</text>`);
	if (fly > 0) { const x = lerp(1600, 2100, easeIO(fly)), y = lerp(380, 120, easeIO(fly));
		s += pth(`M1600,380 Q1800,${f1(380 - 200 * fly)} ${f1(x)},${f1(y)}`, 'none', `stroke="${CREAM}" stroke-width="5" stroke-dasharray="14 12" opacity=".9"`)
			+ grp(`translate(${f1(x)} ${f1(y)}) rotate(-28)`, poly([[40, 0], [-30, -24], [-14, 0]], '#FFFFFF') + poly([[40, 0], [-30, 22], [-14, 0]], '#E4E0D6')); }
	return s;
}
// ---------------------------------------------------------------- the frame
const CAM = { cold: [[0, 960, 540, 1.14], [1, 960, 540, 1.05]], ball: [[0, 960, 540, 1.03], [.5, 900, 560, 1.1], [1, 1000, 540, 1.06]], end: [[0, 960, 540, 1.06], [1, 960, 540, 1.03]] };
function camAt(name, u) { const K = CAM[name] || [[0, 960, 540, 1.03]]; let i = 0; while (i + 1 < K.length && K[i + 1][0] <= u) i++; const a = K[i], b = K[Math.min(K.length - 1, i + 1)], v = b[0] > a[0] ? easeIO((u - a[0]) / (b[0] - a[0])) : 0;
	const z = Math.max(1.03, lerp(a[3], b[3], v)), mx = 960 / z, my = 540 / z; return [clamp(lerp(a[1], b[1], v), mx, W - mx), clamp(lerp(a[2], b[2], v), my, H - my), z]; }
window.renderAt = (t) => {
	const S = SECS[secIdx(t)], b = beatOf(S, t), u = clamp((t - S.t0) / (S.t1 - S.t0));
	let out = DEFS, dark = S.world === 'ball';
	if (S.name === 'pull') { const v = easeIO((b - .5) / 4.5); out += page(t, S) + postcard(t, S, v, 4 * v); dark = v < .5; }
	else if (S.world === 'paper') {
		const zb = S.name === 'fly' ? clamp((b - 9) / 3) : 0;
		if (zb > 0) { const v = easeIO(zb), k = Math.exp(lerp(0, -Math.log(PC.s), v)), lin = (k - 1) / (1 / PC.s - 1);
			out += `<g transform="translate(${f1(PC.x * (1 - lin))} ${f1(PC.y * (1 - lin))}) scale(${f1(k)}) translate(${-PC.x} ${-PC.y})">${page(t, S)}${postcard(t, S, 1, 4 * (1 - v))}</g>`; }
		else out += page(t, S) + postcard(t, S, 1, 4);
	} else { const [cx, cy, z] = camAt(S.name, u); out += ballroom(t, S, z, cx, cy);
		if (S.name !== 'cold') out += conductor(44, 880, 1.3, S, t); }
	out += strip(t, S, dark) + headline(t, dark);
	if (S.name === 'end') out += endStamp(t, S);
	out += rect(0, 0, W, H, 'url(#vig)') + `<rect width="${W + 256}" height="${H + 256}" fill="url(#grain)" opacity="${dark ? .06 : .1}" transform="translate(${f1(-hash(Math.floor(t * 30)) * 255)} ${f1(-hash(Math.floor(t * 30) + 7) * 255)})"/>`;
	if (t > SC.end - 1.2) out += rect(0, 0, W, H, '#000', `opacity="${f1(clamp((t - (SC.end - 1.2)) / 1.2))}"`);
	document.getElementById('art').innerHTML = out;
};
window.READY = true;

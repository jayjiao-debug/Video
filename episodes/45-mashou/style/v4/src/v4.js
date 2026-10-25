// ep45 v4 (storyboard gate 2b, Look 1 铜灯影 only): shared helpers for the six key frames.
// Caption layer = ep43 v6 (capC lay2 bl1 ad + seal C1), copied in kit.js; this adds the story counter (12 dots with states).
(() => {
/** the story counter: label + 12 dots. states string, one char per dot in zodiac order 鼠牛虎兔龙蛇马羊猴鸡狗猪:
 *  h = at home (stone ivory) · y = you (copper) · r = back in China (red) · e = gone (hollow) · d = not back (dashed) */
K.dots = (states) => [...states].map((c) => `<span class="o ${c}"></span>`).join('');
K.CSS4 = `
.tally .o{width:50px;height:50px;border-radius:25px;border-width:4px;margin:0 5px -8px}
.tally{font-size:50px}.tally .lab{font-family:'Noto Serif CJK SC',serif;font-weight:900;margin-right:10px}
.tally .num{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:64px;margin-right:16px}
.tally .o.h{background:#E9DCC4;border-color:#E9DCC4}
.tally .o.y{background:#E8894B;border-color:#FFD9A6;box-shadow:0 0 14px #FF9A5A}
.tally .o.r{background:#EE4B3B;border-color:#EE4B3B}
.tally .o.e{background:none;border-color:rgba(255,243,216,.75)}
.tally .o.d{background:none;border:4px dashed rgba(255,243,216,.8)}
.tally .row2{margin-top:6px}
`;
/** caption layer for v4 frames: {sub, stamp, era, rows: [[label, num, states]], bk} */
K.hud4 = (c) => {
	const sub = c.sub ? c.sub.replace(/\[([^\]]+)\]/g, '<span class="k">$1</span>') : '';
	const bk = c.bk ?? {};
	const rows = (c.rows ?? []).map(([lab, num, st], i) => `<div class="${i ? 'row2' : ''}"><span class="lab">${lab}</span><span class="num">${num}</span>${K.dots(st)}</div>`).join('');
	return `<div id="hud">
	${sub ? `<div class="sub sh" style="--bk:${bk.sub ?? 0}">${sub}</div>` : ''}
	${c.stamp ? `<div class="stamp sh" style="--bk:${bk.stamp ?? 0}"><div class="s1">${c.stamp}</div></div>` : ''}
	<div class="blk" style="--bk:${bk.blk ?? 0}">
		<div class="age sh">${c.era ? `<div class="era">${c.era}</div>` : ''}</div>
		${rows ? `<div class="tally sh">${rows}</div>` : ''}
	</div>
	<div class="seal">${K.seal()}</div></div>`;
};
K.blur = (id, r) => `<filter id="${id}" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2320" height="1480"><feGaussianBlur stdDeviation="${r}"/></filter>`;
K.rnd = (i) => { const x = Math.sin(i * 127.1 + 7.7) * 43758.5453; return x - Math.floor(x); };

/** a water arc from the mouth p0 to the pool point p1 with apex lift h, scale s. Returns svg (glow + core + droplets + splash). */
K.arc = (p0, p1, h, s, o = {}) => {
	const [x0, y0] = p0, [x1, y1] = p1, cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - h;
	const d = `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;
	const core = o.core ?? '#F3F1E8', glow = o.glow ?? '#FFFFFF', id = K.uid('ar');
	let drops = '';
	for (let i = 0; i < 9; i++) { const t = 0.35 + 0.65 * K.rnd(i + x0), m = 1 - t;
		const px = m * m * x0 + 2 * m * t * cx + t * t * x1, py = m * m * y0 + 2 * m * t * cy + t * t * y1;
		drops += `<circle cx="${px + (K.rnd(i * 3 + y0) - 0.5) * 22 * s}" cy="${py + K.rnd(i * 5 + x1) * 26 * s}" r="${(1 + K.rnd(i + 9) * 2) * s}" fill="${core}" opacity="${0.5 + 0.4 * K.rnd(i)}"/>`; }
	return `<defs>${K.blur(id, 5 * s)}</defs>
	<path d="${d}" stroke="${glow}" stroke-width="${16 * s}" fill="none" opacity="${o.gA ?? 0.32}" filter="url(#${id})" stroke-linecap="round"/>
	<path d="${d}" stroke="${core}" stroke-width="${7 * s}" fill="none" opacity=".95" stroke-linecap="round"/>
	<path d="${d}" stroke="#FFFFFF" stroke-width="${2.2 * s}" fill="none" opacity=".9" stroke-linecap="round"/>
	${drops}
	<ellipse cx="${x1}" cy="${y1 + 3 * s}" rx="${34 * s}" ry="${7 * s}" fill="none" stroke="${core}" stroke-width="${2.5 * s}" opacity=".7"/>
	<ellipse cx="${x1}" cy="${y1 + 3 * s}" rx="${58 * s}" ry="${12 * s}" fill="none" stroke="${core}" stroke-width="${1.6 * s}" opacity=".4"/>
	<path d="M${x1 - 14 * s},${y1} Q${x1 - 20 * s},${y1 - 26 * s} ${x1 - 26 * s},${y1 - 6 * s} M${x1 + 12 * s},${y1} Q${x1 + 20 * s},${y1 - 30 * s} ${x1 + 28 * s},${y1 - 4 * s}" stroke="${core}" stroke-width="${2.4 * s}" fill="none" opacity=".75"/>`;
};

/** 海晏堂 west façade (frontal), its double stair, the fan pool and the two terraces. mode 'noon' | 'fire'. */
K.ROW_L = ['狗', '猴', '马', '龙', '虎', '鼠'];   // front → back, left bank, facing right (you third from the front)
K.ROW_R = ['猪', '鸡', '羊', '蛇', '兔', '牛'];   // front → back, across the pool, facing left (the snake across from you)
K.seatAt = (side, i) => { const t = i / 5, s = 1 - 0.55 * t; const x = 360 + 430 * t, y = 930 - 280 * t; return {x: side < 0 ? x : 1920 - x, y, s, t}; };
K.facade = (mode) => {
	const fire = mode === 'fire';
	const lit = fire ? '#2A1712' : '#8C8371', sh = fire ? '#1E100C' : '#5C554A', win = fire ? 'url(#winfire)' : '#3A342E', trim = fire ? '#3A2018' : '#C4BAA2';
	let w = '';
	for (let i = 0; i < 16; i++) { const x = 330 + i * 80; if (x > 800 && x < 1080) continue; const on = !fire || K.rnd(i + 300) > 0.3;
		w += `<path d="M${x},612 L${x},560 A20,20 0 0 1 ${x + 40},560 L${x + 40},612 Z" fill="${on ? win : '#2a1610'}"/>
		<path d="M${x},500 L${x},462 A20,20 0 0 1 ${x + 40},462 L${x + 40},500 Z" fill="${on ? win : '#2a1610'}"/>`; }
	for (let i = 0; i < 3; i++) { const x = 880 + i * 60; w += `<path d="M${x},${512} L${x},468 A20,20 0 0 1 ${x + 40},468 L${x + 40},512 Z" fill="${win}"/>`; }
	return `<path d="M300,640 L300,420 L292,420 L292,404 L1628,404 L1628,420 L1620,420 L1620,640 Z" fill="${lit}"/>
	<rect x="292" y="520" width="1336" height="12" fill="${trim}"/><rect x="300" y="620" width="1320" height="20" fill="${sh}"/>
	${Array.from({length: 38}, (_, i) => `<rect x="${300 + i * 35}" y="392" width="9" height="12" fill="${lit}"/>`).join('')}<rect x="292" y="386" width="1336" height="7" fill="${lit}"/>
	<path d="M830,640 L830,370 L820,370 L820,356 L960,300 L1100,356 L1090,370 L1090,640 Z" fill="${lit}"/>
	<path d="M842,360 L960,314 L1078,360 Z" fill="${sh}" opacity=".7"/><circle cx="960" cy="340" r="13" fill="${trim}"/>
	${Array.from({length: 7}, (_, i) => `<rect x="${300 + i * 220}" y="420" width="14" height="200" fill="${sh}" opacity=".5"/>`).join('')}
	${w}
	<path d="M912,640 L912,578 A48,48 0 0 1 1008,578 L1008,640 Z" fill="${fire ? 'url(#winfire)' : '#2E2924'}"/>`;
};
K.stairs = (mode) => {
	const fire = mode === 'fire', st = fire ? '#24130E' : '#958B76', edge = fire ? '#F0904A' : '#D9CFB6', bal = fire ? '#1A0E0A' : '#7F7664';
	const side = (f) => { const X = (x) => (f < 0 ? x : 1920 - x);
		return `<path d="M${X(912)},640 C${X(820)},652 ${X(720)},664 ${X(640)},700 L${X(600)},720 L${X(560)},720 L${X(600)},690 C${X(690)},646 ${X(800)},628 ${X(912)},622 Z" fill="${st}"/>
		<path d="M${X(912)},604 C${X(800)},610 ${X(690)},628 ${X(600)},672 L${X(586)},684" stroke="${bal}" stroke-width="16" fill="none"/>
		<path d="M${X(912)},596 C${X(800)},602 ${X(690)},620 ${X(600)},664" stroke="${edge}" stroke-width="2.5" fill="none" opacity=".6"/>`; };
	return side(-1) + side(1);
};
/** the pool: fan basin between the terraces (back edge narrow by the stair foot, front edge wide) */
K.pool = (mode) => {
	const fire = mode === 'fire';
	const water = fire ? 'url(#poolF)' : 'url(#poolN)', rim = fire ? '#1C100B' : '#A49A84', rimLit = fire ? '#F0904A' : '#E2D8BE', terr = fire ? '#25150F' : '#8C8371', terrS = fire ? '#160C08' : '#6A6254';
	return `<path d="M250,1080 L250,930 L760,650 L1160,650 L1670,930 L1670,1080 Z" fill="${terrS}"/>
	<path d="M120,940 L700,640 L760,650 L250,930 Z" fill="${terr}"/><path d="M1800,940 L1220,640 L1160,650 L1670,930 Z" fill="${terr}"/>
	<path d="M330,920 L780,664 L1140,664 L1590,920 C1300,950 620,950 330,920 Z" fill="${rim}"/>
	<path d="M360,912 L790,672 L1130,672 L1560,912 C1290,938 630,938 360,912 Z" fill="${water}"/>
	<path d="M330,920 C620,950 1300,950 1590,920" stroke="${rimLit}" stroke-width="3" fill="none" opacity=".7"/>
	${Array.from({length: 9}, (_, i) => `<path d="M${560 + i * 20},${740 + i * 18} L${1360 - i * 20},${740 + i * 18}" stroke="${fire ? '#F0904A' : '#E6EEE6'}" stroke-width="1.5" opacity="${0.18 - i * 0.012}"/>`).join('')}
	${fire ? Array.from({length: 26}, (_, i) => { const y = 690 + K.rnd(i + 70) * 220, w = 30 + K.rnd(i + 71) * 120, x = 560 + K.rnd(i + 72) * 800; return `<rect x="${x}" y="${y}" width="${w}" height="3" fill="#FFB060" opacity="${0.25 + 0.4 * K.rnd(i + 73)}"/>`; }).join('') : ''}`;
};
/** one seated statue: stone body + brother head (or you, or an empty seat). Returns {svg, mouth, top}. */
K.statue = (kind, side, i, mode, o = {}) => {
	const {x, y, s} = K.seatAt(side, i), face = side < 0 ? 1 : -1, h = 160 * s;
	const fire = mode === 'fire';
	const stone = fire ? '#1E120D' : (o.stone ?? '#6E6758'), bronze = fire ? '#180E0A' : '#251C16';
	const b = K.stoneBody(x, y, h, face, stone); const [tx, ty] = b.top;
	if (kind === '马') {
		if (o.empty) return {svg: K.emptySeat(x, y, h, face, stone, fire ? '#FFB070' : '#E8D9B8') + `<ellipse cx="${tx}" cy="${ty}" rx="${30 * s}" ry="${7 * s}" fill="none" stroke="#FFC888" stroke-width="${4 * s}" opacity=".9"/><ellipse cx="${tx}" cy="${ty - 4 * s}" rx="${46 * s}" ry="${18 * s}" fill="#FF9A50" opacity=".22"/>`, top: [tx, ty], s};
		const hero = {x: tx + face * 4 * s, y: ty + 22 * s, h: 200 * s, flip: face > 0, curl: 0, glow: o.glow ?? 0.9, mood: o.mood ?? 'warm', rim: o.rim ?? '#FFE6C0'};
		const m = K.headPt(hero, 'mouth');
		return {svg: b.svg, hero, mouth: m, top: [tx, ty], s};
	}
	const size = 175 * s, hx = tx + face * 4 * s, hy = ty + 22 * s;
	return {svg: b.svg + K.bro(kind, hx, hy, size, face, bronze), mouth: K.broPt(kind, hx, hy, size, face, 'mouth'), top: [tx, ty], s};
};
})();

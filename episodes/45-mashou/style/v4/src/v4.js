// ep45 v4 (storyboard gate 2b, Look 1 铜灯影 only): shared helpers for the six key frames.
// Caption layer = ep43 v6 (capC lay2 bl1 ad + seal C1), copied in kit.js; this adds the story counter (12 dots with states).
(() => {
/** the story counter: label + 12 dots. states string, one char per dot in zodiac order 鼠牛虎兔龙蛇马羊猴鸡狗猪:
 *  h = at home (stone ivory) · y = you (copper) · r = back in China (solid ivory #FFF1DC, r3 note 7: no second saturated accent) · e = gone (hollow) · d = not back (dashed) */
K.dots = (states) => [...states].map((c) => `<span class="o ${c}"></span>`).join('');
K.CSS4 = `
.tally .o{width:50px;height:50px;border-radius:25px;border-width:4px;margin:0 5px -8px}
.tally{font-size:50px}.tally .lab{font-family:'Noto Serif CJK SC',serif;font-weight:900;margin-right:10px}
.tally .num{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:64px;margin-right:16px}
.tally .o.h{background:#E9DCC4;border-color:#E9DCC4}
.tally .o.y{background:#E8894B;border-color:#FFD9A6;box-shadow:0 0 14px #FF9A5A}
.tally .o.r{background:#FFF1DC;border-color:#FFF1DC}
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
// r3 (note 3b): seats spaced on t = (i/5)^0.72, wider gaps at the front, so 狗's muzzle clears 猴
K.seatAt = (side, i) => { const t = Math.pow(i / 5, 0.72), s = 1 - 0.55 * t; const x = 360 + 430 * t, y = 930 - 280 * t; return {x: side < 0 ? x : 1920 - x, y, s, t}; };
// r4 (gate 2b r3 n7): redrawn from the 海晏堂 model (haiyantang_model_bjnews.jpg; reference only, not traced). NO clock pediment:
// two storeys of tall rectangular lattice windows under small cornice caps; a raised centre of two tower bays with scrolled caps and
// urn finials; between them a baroque scroll gable crowned by a shell; under the gable the great shell relief wall that backs the
// water clock, with the shell-and-vase fountain at its foot; balustraded parapet with urns. The double curved stair is K.stairs.
K.facade = (mode) => {
	const fire = mode === 'fire';
	const lit = fire ? '#2A1712' : '#8C8371', sh = fire ? '#1E100C' : '#5C554A', win = fire ? 'url(#winfire)' : '#3A342E', trim = fire ? '#3A2018' : '#C4BAA2', hi = fire ? '#5A2A1A' : '#D8CFB8';
	const winR = (x, y, w, h, k) => { const on = !fire || K.rnd(k + 300) > 0.3, f = on ? win : '#2a1610';
		let g = ''; for (let j = 1; j < 3; j++) g += `M${x + w * j / 3},${y} L${x + w * j / 3},${y + h} `; for (let j = 1; j < 5; j++) g += `M${x},${y + h * j / 5} L${x + w},${y + h * j / 5} `;
		return `<rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 8}" fill="${trim}" opacity=".55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>
			<path d="${g}" stroke="${sh}" stroke-width="2" opacity="${fire ? 0.8 : 0.6}"/><path d="M${x - 9},${y - 9} L${x + w / 2},${y - 20} L${x + w + 9},${y - 9} Z" fill="${trim}" opacity=".8"/>`; };
	const urn = (x, y, k = 1) => `<path d="M${x - 7 * k},${y} L${x + 7 * k},${y} L${x + 5 * k},${y - 6 * k} C${x + 10 * k},${y - 10 * k} ${x + 9 * k},${y - 19 * k} ${x + 3 * k},${y - 22 * k} L${x + 2 * k},${y - 28 * k} C${x + 2 * k},${y - 31 * k} ${x - 2 * k},${y - 31 * k} ${x - 2 * k},${y - 28 * k} L${x - 3 * k},${y - 22 * k} C${x - 9 * k},${y - 19 * k} ${x - 10 * k},${y - 10 * k} ${x - 5 * k},${y - 6 * k} Z" fill="${lit}"/>`;
	let w = '', par = '';
	// side wings: two storeys of rectangular windows, pilasters between bays
	for (let i = 0; i < 16; i++) { const x = 326 + i * 80; if (x > 720 && x < 1180) continue;
		w += winR(x + 6, 556, 30, 58, i) + winR(x + 6, 448, 30, 50, i + 40) + `<rect x="${x - 14}" y="420" width="8" height="200" fill="${sh}" opacity=".45"/>`; }
	// parapet: balusters + urns on the piers
	for (let i = 0; i < 38; i++) { const x = 300 + i * 35; if (x > 750 && x < 1170) continue; par += `<rect x="${x + 13}" y="392" width="9" height="12" fill="${lit}"/>`; }
	for (let i = 0; i < 8; i++) { const x = 300 + i * 64; par += urn(x + 14, 386) + urn(1620 - (x + 14 - 300), 386); }
	// the raised centre: two tower bays with scrolled caps and urns, the scroll gable between them crowned by a shell
	const tower = (x) => `<rect x="${x}" y="330" width="100" height="310" fill="${lit}"/>
		<rect x="${x}" y="330" width="10" height="310" fill="${hi}" opacity=".5"/><rect x="${x + 90}" y="330" width="10" height="310" fill="${sh}" opacity=".5"/>
		<rect x="${x - 8}" y="322" width="116" height="10" fill="${trim}"/>
		<path d="M${x + 4},322 C${x + 4},300 ${x + 30},292 ${x + 50},296 C${x + 70},292 ${x + 96},300 ${x + 96},322 Z" fill="${lit}"/>
		<path d="M${x + 14},320 C${x + 16},306 ${x + 34},300 ${x + 50},304 C${x + 66},300 ${x + 84},306 ${x + 86},320" stroke="${trim}" stroke-width="3" fill="none"/>
		${urn(x + 50, 296, 1.25)}${winR(x + 30, 430, 40, 150, x)}${winR(x + 34, 348, 32, 44, x + 1)}`;
	// the scroll gable: concave–convex S sides ending in volutes, a short level cornice, the shell on top (not a dome, not a pediment)
	const gable = `<path d="M860,640 L860,380 C878,380 886,368 884,356 C882,344 870,340 870,330 C876,322 892,326 900,336 C912,328 916,318 920,312 L1000,312 C1004,318 1008,328 1020,336 C1028,326 1044,322 1050,330 C1050,340 1038,344 1036,356 C1034,368 1042,380 1060,380 L1060,640 Z" fill="${lit}"/>
		<circle cx="880" cy="350" r="7" fill="none" stroke="${trim}" stroke-width="3"/><circle cx="1040" cy="350" r="7" fill="none" stroke="${trim}" stroke-width="3"/>
		<rect x="914" y="306" width="92" height="8" fill="${trim}"/>
		<!-- the crowning shell -->
		<path d="M960,270 C940,270 928,284 930,306 L990,306 C992,284 980,270 960,270 Z" fill="${hi}" opacity=".85"/>
		${[-24, -12, 0, 12, 24].map((d) => `<path d="M960,306 L${960 + d * 1.1},${274 + Math.abs(d) * 0.35}" stroke="${sh}" stroke-width="1.6" opacity=".7"/>`).join('')}
		${winR(930, 392, 60, 104, 7)}`;
	// the great shell relief wall over the water clock (fan ribs), and the shell-and-vase fountain at its foot
	const ribs = Array.from({length: 13}, (_, k) => { const a = Math.PI * (1 + k / 12); return `M960,600 L${960 + Math.cos(a) * 92},${600 + Math.sin(a) * 62}`; }).join(' ');
	const shell = `<path d="M842,640 L842,600 C842,540 900,510 960,510 C1020,510 1078,540 1078,600 L1078,640 Z" fill="${trim}" opacity="${fire ? 1 : 0.9}"/>
		<path d="M868,600 C868,560 912,538 960,538 C1008,538 1052,560 1052,600 Z" fill="${hi}" opacity=".55"/><path d="${ribs}" stroke="${sh}" stroke-width="2.4" opacity=".55"/>
		<path d="M930,640 C930,624 940,614 948,612 C944,604 946,596 960,594 C974,596 976,604 972,612 C980,614 990,624 990,640 Z" fill="${hi}"/>
		<ellipse cx="960" cy="612" rx="34" ry="7" fill="${lit}"/>`;
	return `<path d="M300,640 L300,420 L292,420 L292,404 L1628,404 L1628,420 L1620,420 L1620,640 Z" fill="${lit}"/>
	<rect x="292" y="520" width="1336" height="12" fill="${trim}"/><rect x="300" y="620" width="1320" height="20" fill="${sh}"/>
	${par}<rect x="292" y="386" width="1336" height="7" fill="${lit}"/>
	${w}${tower(760)}${tower(1060)}${gable}${shell}`;
};
/** r4 (n7): the DOUBLE CURVED STAIR of the model — a balcony landing across the centre at the upper door, and two flights that
 * curve outward and down around the shell wall to the terraces, each with a balustrade (rail + balusters + end piers with urns). */
K.stairs = (mode) => {
	const fire = mode === 'fire', st = fire ? '#24130E' : '#A39883', tread = fire ? '#160C08' : '#7A7262', edge = fire ? '#F0904A' : '#E2D8BE', bal = fire ? '#1A0E0A' : '#8C8371';
	const bz = (a, b, c, d, t) => [0, 1].map((j) => (1 - t) ** 3 * a[j] + 3 * (1 - t) ** 2 * t * b[j] + 3 * (1 - t) * t * t * c[j] + t ** 3 * d[j]);
	const side = (f) => { const X = (x) => (f < 0 ? x : 1920 - x);
		const O = [[X(862), 500], [X(800), 506], [X(724), 566], [X(668), 650]], I = [[X(862), 524], [X(812), 530], [X(752), 578], [X(706), 650]];
		let steps = '', balus = '';
		for (let k = 1; k < 16; k++) { const t = k / 16, o = bz(...O, t), i = bz(...I, t); steps += `M${o[0].toFixed(1)},${o[1].toFixed(1)} L${i[0].toFixed(1)},${i[1].toFixed(1)} `; }
		for (let k = 0; k <= 14; k++) { const o = bz(...O, k / 14); balus += `M${o[0].toFixed(1)},${o[1].toFixed(1)} l0,-14 `; }
		const rail = 'M' + Array.from({length: 21}, (_, k) => bz(...O, k / 20)).map((q) => `${q[0].toFixed(1)},${(q[1] - 15).toFixed(1)}`).join(' L');
		const end = bz(...O, 1);
		return `<path d="M${O[0]} C${O[1]} ${O[2]} ${O[3]} L${I[3]} C${I[2]} ${I[1]} ${I[0]} Z" fill="${st}"/>
			<path d="${steps}" stroke="${tread}" stroke-width="2.2" opacity=".8"/>
			<path d="${balus}" stroke="${bal}" stroke-width="3.2"/><path d="${rail}" stroke="${bal}" stroke-width="5" fill="none" stroke-linecap="round"/>
			<path d="${rail}" stroke="${edge}" stroke-width="1.8" fill="none" opacity=".55" transform="translate(0,-2)"/>
			<rect x="${end[0] - 7}" y="${end[1] - 26}" width="14" height="26" fill="${bal}"/>`; };
	// the balcony landing across the centre, under the upper door
	let lb = ''; for (let x = 870; x <= 1050; x += 12) lb += `M${x},500 l0,-14 `;
	return side(-1) + side(1) + `<rect x="856" y="498" width="208" height="14" fill="${st}"/><path d="${lb}" stroke="${bal}" stroke-width="3.2"/>
		<path d="M856,485 L1064,485" stroke="${bal}" stroke-width="5"/><path d="M856,483 L1064,483" stroke="${edge}" stroke-width="1.8" opacity=".55"/>`;
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
	${fire ? '' : Array.from({length: 9}, (_, i) => `<path d="M${560 + i * 20},${740 + i * 18} L${1360 - i * 20},${740 + i * 18}" stroke="#E6EEE6" stroke-width="1.5" opacity="${0.18 - i * 0.012}"/>`).join('')}
	${fire ? '<g filter="url(#b3)">' + Array.from({length: 9}, (_, i) => { const x = 640 + i * 80; return Array.from({length: 8}, (_, k) => `<rect x="${x + 6 * Math.sin(k * 1.7 + i)}" y="${686 + k * 26}" width="${(18 - k * 1.5) * (0.6 + 0.8 * K.rnd(i * 9 + k))}" height="${12 + 10 * K.rnd(i + k)}" rx="4" fill="#FFB060" opacity="${0.5 - k * 0.05}"/>`).join(''); }).join('') + '</g>' + `<path d="M330,920 L780,664 L1140,664 L1590,920" stroke="#E8C49A" stroke-width="4" fill="none" opacity=".75"/>` : ''}`;
};
/** one seated statue: stone body + brother head (or you, or an empty seat). Returns {svg, mouth, top}. */
K.statue = (kind, side, i, mode, o = {}) => {
	const {x, y, s} = K.seatAt(side, i), face = side < 0 ? 1 : -1, h = 160 * s;
	const fire = mode === 'fire';
	const stone = fire ? '#1E120D' : (o.stone ?? '#6E6758'), bronze = fire ? '#180E0A' : '#251C16';
	const b = K.stoneBody(x, y, h, face, stone); const [tx, ty] = b.top;
	if (kind === '马') {
		if (o.empty) return {svg: K.emptySeat(x, y, h, face, stone, fire ? '#FFB070' : '#E8D9B8') + `<ellipse cx="${tx}" cy="${ty}" rx="${30 * s}" ry="${7 * s}" fill="none" stroke="#FFC888" stroke-width="${4 * s}" opacity=".9"/><ellipse cx="${tx}" cy="${ty - 4 * s}" rx="${46 * s}" ry="${18 * s}" fill="#FF9A50" opacity=".22"/>`, top: [tx, ty], s};
		const hero = {x: tx + face * 4 * s, y: ty + 22 * s, h: 200 * s, flip: face > 0, curl: 0, glow: o.glow ?? 0.9, key: o.key ?? 1.5, mood: o.mood ?? 'warm', rim: o.rim ?? '#FFE6C0', base: 'seat'};
		const m = K.headPt(hero, 'mouth');
		return {svg: b.svg, hero, mouth: m, top: [tx, ty], s};
	}
	const size = 175 * s, hx = tx + face * 4 * s, hy = ty + 22 * s;
	return {svg: b.svg + K.bro(kind, hx, hy, size, face, bronze), mouth: K.broPt(kind, hx, hy, size, face, 'mouth'), top: [tx, ty], s};
};
})();

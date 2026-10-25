// ep45 v3 · L1 铜灯影 · the 1860 stage (B3): 海晏堂 burning behind its balustrade, the south-bank seats
// 鼠 虎 龙 [马, empty] 猴 狗 (F4b), a looter in a kepi walking right (出) with you held against his chest in both hands.
// K.sc1860({lx, mode}) → svg. mode 'full' | 'relief' (height map of the same stage, no looter/hero: for the L3 hand-over)
(() => {
const rnd = (i) => { const x = Math.sin(i * 127.1 + 7.7) * 43758.5453; return x - Math.floor(x); };
K.sc1860 = (o = {}) => {
	const S = '#170E0A', gy = 1012, lx = o.lx ?? 1440, relief = o.mode === 'relief';
	const G = (v) => { const c = Math.round(v * 255).toString(16).padStart(2, '0'); return `#${c}${c}${c}`; };
	// ---- flames: two depth layers, noise-driven heights (an envelope × per-tongue jitter), forked tips, gaps
	const env = (x) => Math.max(0, 0.55 + 0.45 * Math.sin(x / 210 + 0.6) * Math.cos(x / 97 + 1.3) + 0.25 * Math.sin(x / 41));
	const tongue = (x, base, h, w, lean, fork) => {
		const tip = [x + lean, base - h];
		let d = `M${x - w / 2},${base} C${x - w * 0.62},${base - h * 0.35} ${x + lean * 0.3 - w * 0.34},${base - h * 0.62} ${tip[0]},${tip[1]}`;
		if (fork) d += ` C${x + lean * 0.6},${base - h * 0.72} ${x + lean * 0.5 + w * 0.1},${base - h * 0.62} ${x + lean * 0.7 + w * 0.32},${base - h * 0.8} C${x + w * 0.4},${base - h * 0.5} ${x + w * 0.66},${base - h * 0.3} ${x + w / 2},${base} Z`;
		else d += ` C${x + lean * 0.4 + w * 0.32},${base - h * 0.6} ${x + w * 0.7},${base - h * 0.32} ${x + w / 2},${base} Z`;
		return d; };
	let fBack = '', fFront = '';
	for (let i = 0; i < 30; i++) { const x = 180 + rnd(i + 40) * 1560, e = env(x); if (e < 0.18) continue;
		fBack += `<path d="${tongue(x, 520, (140 + e * 300 * (0.6 + 0.6 * rnd(i + 3))) * (relief ? 0.62 : 1), 70 + rnd(i + 5) * 120, (rnd(i + 7) - 0.3) * 120, rnd(i + 9) > 0.6)}"/>`; }
	for (let i = 0; i < 44; i++) { const x = 200 + rnd(i + 140) * 1520, e = env(x + 40); if (e < 0.25) continue;
		fFront += `<path d="${tongue(x, 510, (50 + e * 220 * (0.4 + 0.8 * Math.pow(rnd(i + 103), 1.5))) * (relief ? 0.7 : 1), 30 + rnd(i + 105) * 70, (rnd(i + 107) - 0.3) * 80, rnd(i + 109) > 0.55)}"/>`; }
	// ---- 海晏堂 façade (two storeys, balustrade, raised centre with pediment), windows lit from inside
	let win = '';
	for (let i = 0; i < 18; i++) { const x = 290 + i * 76; if (x > 860 && x < 1080) continue; const lit = rnd(i + 300) > 0.25;
		win += `<path d="M${x},700 L${x},640 A18,18 0 0 1 ${x + 36},640 L${x + 36},700 Z" fill="${relief ? G(0.12) : lit ? 'url(#winfire)' : '#3a1c12'}"/><path d="M${x},590 L${x},556 A18,18 0 0 1 ${x + 36},556 L${x + 36},590 Z" fill="${relief ? G(0.12) : lit ? 'url(#winfire)' : '#3a1c12'}" opacity="${relief ? 1 : 0.85}"/>`; }
	const facCol = relief ? G(0.42) : '#2B1813';
	const fac = `<path d="M250,720 L250,520 L240,520 L240,500 L870,500 L870,440 L860,440 L960,370 L1060,440 L1050,440 L1050,500 L1680,500 L1680,520 L1670,520 L1670,720 Z" fill="${facCol}"/>
	 ${Array.from({length: 40}, (_, i) => `<rect x="${246 + i * 36}" y="${i > 17 && i < 23 ? 426 : 486}" width="10" height="14" fill="${facCol}"/>`).join('')}
	 <path d="M900,720 L900,600 A60,60 0 0 1 1020,600 L1020,720 Z" fill="${relief ? G(0.12) : 'url(#winfire)'}"/>
	 ${relief ? Array.from({length: 9}, (_, i) => `<rect x="${262 + i * 160}" y="520" width="14" height="200" fill="${G(0.5)}"/>`).join('') : ''}`;
	// ---- the south bank: 鼠 虎 龙 [马] 猴 狗; you sat between 龙 and 猴
	const row = [['鼠', 220], ['虎', 420], ['龙', 620], [null, 820], ['猴', 1020], ['狗', 1220]];
	const stone = relief ? G(0.62) : '#1d120d', headF = relief ? G(0.75) : '#1d120d';
	let seats = '';
	row.forEach(([k, x]) => { if (!k) { seats += K.emptySeat(x, 842, 220, -1, stone, relief ? G(0.62) : '#FFB070'); return; }
		const b = K.stoneBody(x, 842, 220, -1, stone); seats += b.svg + K.zhead(k, b.top[0] - 2, b.top[1] + 34, 175, -1, headF); });
	// ---- the looter
	const sol = K.soldierCarry(lx, gy, 720, S, {beltCol: '#3a2418'});
	const hero = {...sol.hero, curl: 0, glow: 1.4, mood: 'fire', rim: '#FFE0A0'};
	if (relief) {   // height map: background low, façade/seats raised, flames as low ridges, ground lines incised
		return `<rect width="1920" height="1080" fill="${G(0.2)}"/>
		<g fill="${G(0.3)}">${fBack}</g><g fill="${G(0.36)}">${fFront}</g>
		${fac}${win}
		<rect x="0" y="720" width="1920" height="40" fill="${G(0.46)}"/><rect x="0" y="760" width="1920" height="82" fill="${G(0.38)}"/>
		${seats}
		<rect x="0" y="842" width="1920" height="18" fill="${G(0.5)}"/><rect x="0" y="860" width="1920" height="220" fill="${G(0.26)}"/>
		${Array.from({length: 7}, (_, i) => `<path d="M0,${880 + i * i * 4} L1920,${880 + i * i * 4}" stroke="${G(0.18)}" stroke-width="4"/>`).join('')}`;
	}
	const rimDefs = `${K.rimFilter('rimFire', 0, 5, '#FF9A50', 0.8, 1.2)}${K.rimFilter('rimFig', -5, 3, '#FFB070', 0.95, 1.4)}${K.rimFilter('rimArm', 0, 4, '#FFC080', 0.95, 1.2)}`;
	return `<defs>
	 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="760"><stop offset="0" stop-color="#2E1E22"/><stop offset=".36" stop-color="#6A2E24"/><stop offset=".7" stop-color="#C0582F"/><stop offset="1" stop-color="#F09A50"/></linearGradient>
	 <linearGradient id="flB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF9A48"/><stop offset=".5" stop-color="#D24A22" stop-opacity=".85"/><stop offset="1" stop-color="#8A2412" stop-opacity="0"/></linearGradient>
	 <linearGradient id="flF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF0B8"/><stop offset=".3" stop-color="#FFB04E"/><stop offset=".7" stop-color="#EA6028" stop-opacity=".8"/><stop offset="1" stop-color="#C0401E" stop-opacity="0"/></linearGradient>
	 <linearGradient id="winfire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#E86A2E"/></linearGradient>
	 <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A2A1E"/><stop offset="1" stop-color="#22140E"/></linearGradient>
	 <radialGradient id="smk" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#7A3A26"/><stop offset=".55" stop-color="#3A2224"/><stop offset="1" stop-color="#2A1A1E" stop-opacity="0"/></radialGradient>
	 ${rimDefs}
	 <filter id="b3" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="3"/></filter>
	 <filter id="b7" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="7"/></filter>
	 <filter id="b40" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="40"/></filter>
	</defs>
	<rect width="1920" height="1080" fill="url(#sky)"/>
	<!-- smoke columns rising from the fire, lit from below -->
	<g filter="url(#b40)">
	 ${[[420, 300, 300, 200], [760, 220, 260, 260], [1180, 180, 340, 260], [1540, 260, 260, 220], [960, 60, 900, 120]].map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#smk)"/>`).join('')}
	</g>
	<ellipse cx="960" cy="480" rx="920" ry="160" fill="#FF8A3A" opacity=".35" filter="url(#b40)"/>
	<g fill="url(#flB)" filter="url(#b7)" opacity=".9">${fBack}</g>
	<g fill="url(#flF)" filter="url(#b3)">${fFront}</g>
	${fac}${win}
	<rect x="0" y="720" width="1920" height="40" fill="#2E1913"/>
	<path d="M0,760 L1920,760 L1920,842 L0,842 Z" fill="#40231A"/>
	<path d="M0,770 L1920,770" stroke="#F0904A" stroke-opacity=".4" stroke-width="3"/>
	<g filter="url(#rimFire)">${seats}</g>
	<path d="M0,842 L1920,842 L1920,860 L0,860 Z" fill="#1d120d"/>
	<rect x="0" y="860" width="1920" height="220" fill="url(#ground)"/>
	${Array.from({length: 9}, (_, i) => `<path d="M0,${880 + i * i * 3.2} L1920,${880 + i * i * 3.2}" stroke="#F0904A" stroke-opacity="${0.14 - i * 0.012}" stroke-width="2"/>`).join('')}
	<ellipse cx="${lx + 15}" cy="${gy + 6}" rx="150" ry="12" fill="#0d0705" opacity=".7"/>
	<g filter="url(#rimFig)">${sol.back}${sol.body}</g>
	${K.horseHead(hero)}
	<g filter="url(#rimArm)">${sol.front}</g>
	${Array.from({length: 60}, (_, i) => `<circle cx="${rnd(i + 30) * 1920}" cy="${200 + rnd(i + 60) * 620}" r="${1 + rnd(i) * 2.5}" fill="#FFC070" opacity="${0.35 + rnd(i + 2) * 0.5}"/>`).join('')}`;
};
})();

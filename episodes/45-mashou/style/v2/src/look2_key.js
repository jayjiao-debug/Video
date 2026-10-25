// Look 2 · 正午倒影 — key A7: noon at 海晏堂; twelve arcs meet; the pool mirrors the palace. You are the hour (午).
const L = (a, b, t) => a + (b - a) * t;
const WL = 600;   // waterline (far edge of the pool)
const facade = () => {
	let w = '';
	for (let i = 0; i < 14; i++) { const x = 420 + i * 78; if (x > 860 && x < 1040) continue;
		w += `<path d="M${x},${WL - 18} L${x},${WL - 70} A16,16 0 0 1 ${x + 32},${WL - 70} L${x + 32},${WL - 18} Z" fill="#7E8C88"/><path d="M${x},${WL - 120} L${x},${WL - 160} A16,16 0 0 1 ${x + 32},${WL - 160} L${x + 32},${WL - 120} Z" fill="#8A9692"/>`; }
	return `<path d="M380,${WL} L380,${WL - 200} L1540,${WL - 200} L1540,${WL} Z" fill="#EEE7D6"/>
	<path d="M380,${WL - 100} L1540,${WL - 100}" stroke="#CFC5AF" stroke-width="6"/>
	<path d="M370,${WL - 200} L1550,${WL - 200} L1550,${WL - 222} L370,${WL - 222} Z" fill="#D8CFBB"/>
	${Array.from({length: 40}, (_, i) => `<rect x="${380 + i * 29.5}" y="${WL - 244}" width="9" height="22" fill="#E2DACA"/>`).join('')}
	<path d="M840,${WL} L840,${WL - 290} L1080,${WL - 290} L1080,${WL} Z" fill="#F3EDDF"/>
	<path d="M820,${WL - 290} L960,${WL - 350} L1100,${WL - 290} Z" fill="#E4DCC9"/><path d="M846,${WL - 296} L960,${WL - 340} L1074,${WL - 296} Z" fill="none" stroke="#C9BEA6" stroke-width="4"/>
	<path d="M900,${WL - 10} L900,${WL - 150} A60,60 0 0 1 1020,${WL - 150} L1020,${WL - 10} Z" fill="#6E7C78"/>
	${w}
	<path d="M380,${WL} L1540,${WL} L1540,${WL - 26} L380,${WL - 26} Z" fill="#D9D0BC"/>`;
};
const sky = `<linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="${WL}"><stop offset="0" stop-color="#8FC0D0"/><stop offset=".7" stop-color="#CFE3E2"/><stop offset="1" stop-color="#F1EEDF"/></linearGradient>`;
// seats along the 八: t=0 back (small, near the centre) → t=1 front (large, at the side)
const LEFT = ['牛', '兔', '蛇', '羊', '鸡', '猪'], RIGHT = ['鼠', '虎', '龙', '马', '猴', '狗'];
const seats = [];
[LEFT, RIGHT].forEach((row, side) => row.forEach((k, i) => { const t = i / 5, sc = L(0.36, 0.86, t);
	const xl = L(800, 250, t), x = side ? 1920 - xl : xl, y = L(610, 905, t);
	seats.push({k, x, y, sc, face: side ? -1 : 1, t}); }));
seats.sort((a, b) => a.y - b.y);
const C = [960, 735];   // where the arcs meet
let arcs = '', statues = '', heroSvg = '', heroArc = '';
seats.forEach((s) => {
	const bodyH = 250 * s.sc, b = K.stoneBody(s.x, s.y, bodyH, s.face, 'url(#marble)'), hs = 215 * s.sc;
	const top = [b.top[0], b.top[1] + hs * 0.16];
	// the platform under each seat
	statues += `<path d="M${s.x - 120 * s.sc},${s.y} L${s.x + 120 * s.sc},${s.y} L${s.x + 120 * s.sc},${s.y + 26 * s.sc} L${s.x - 120 * s.sc},${s.y + 26 * s.sc} Z" fill="#CFC6B2"/><path d="M${s.x - 120 * s.sc},${s.y} L${s.x + 120 * s.sc},${s.y}" stroke="#F4EFE2" stroke-width="${3 * s.sc + 1}"/>`;
	statues += b.svg + `<g filter="url(#shadeL)">${b.svg}</g>`;
	let mouth;
	if (s.k === '马') {
		const o = {x: top[0] + 4 * s.sc, y: top[1] + 6 * s.sc, h: hs * 0.98, curl: 0, glow: 1.2, mood: 'warm', rim: '#FFF0D0', rimAmt: .7};
		heroSvg = K.horseHead(o); mouth = K.headPt(o, 'mouth');
		statues += '%HERO%';
	} else {
		statues += `<g filter="url(#sun)">${K.zhead(s.k, top[0], top[1], hs, s.face, 'url(#bronze)', '', '#6A4E36')}</g>`;
		mouth = [top[0] + s.face * (50 * hs / 100), top[1] - 36 * hs / 100];
	}
	const ctrl = [(mouth[0] + C[0]) / 2, Math.min(mouth[1], C[1]) - 120 - 140 * s.sc];
	const d = `M${mouth[0]},${mouth[1]} Q${ctrl[0]},${ctrl[1]} ${C[0] + (s.face > 0 ? -6 : 6)},${C[1]}`;
	const a = `<path d="${d}" stroke="#FFFFFF" stroke-width="${2 + 6 * s.sc}" fill="none" stroke-linecap="round" opacity=".9"/><path d="${d}" stroke="#BFEAE2" stroke-width="${1 + 2 * s.sc}" fill="none" stroke-linecap="round" transform="translate(0,${3 * s.sc})" opacity=".8"/>`;
	if (s.k === '马') heroArc = `<path d="${d}" stroke="#FFD9A0" stroke-width="${12 * s.sc}" fill="none" stroke-linecap="round" opacity=".55" filter="url(#b6)"/>` + a; else arcs += a;
});
statues = statues.replace('%HERO%', heroSvg);
let svg = `
<defs>${sky}
 <linearGradient id="water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5FA79A"/><stop offset=".4" stop-color="#2F7E74"/><stop offset="1" stop-color="#174C47"/></linearGradient>
 <linearGradient id="marble" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#E9E3D4"/><stop offset=".6" stop-color="#C3BAA6"/><stop offset="1" stop-color="#8F8776"/></linearGradient>
 <linearGradient id="bronze" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8A6A4E"/><stop offset=".55" stop-color="#5A4230"/><stop offset="1" stop-color="#33251B"/></linearGradient>
 ${K.rimFilter('sun', 0, 5, '#F6DDB0', 0.9, 1.5)}
 <filter id="b6" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="6"/></filter>
 <filter id="b30" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="30"/></filter>
 <filter id="shadeL" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feFlood flood-color="#5d5546" flood-opacity=".0"/></filter>
 <filter id="ripple" filterUnits="userSpaceOnUse" x="0" y="${WL}" width="1920" height="${1080 - WL}"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="22" xChannelSelector="R" yChannelSelector="G"/></filter>
 <linearGradient id="refFade" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="${WL}" y2="1080"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
 <mask id="refMask"><rect x="0" y="${WL}" width="1920" height="${1080 - WL}" fill="url(#refFade)"/></mask>
</defs>
<rect width="1920" height="${WL}" fill="url(#sky)"/>
<!-- far trees and the garden behind -->
<path d="M0,${WL - 120} C120,${WL - 200} 220,${WL - 170} 300,${WL - 220} C360,${WL - 180} 380,${WL - 140} 400,${WL - 120} L400,${WL} L0,${WL} Z M1520,${WL - 140} C1600,${WL - 230} 1700,${WL - 190} 1780,${WL - 240} C1850,${WL - 200} 1900,${WL - 180} 1920,${WL - 150} L1920,${WL} L1520,${WL} Z" fill="#7FA08C" opacity=".8"/>
${facade()}
<!-- the pool -->
<rect x="0" y="${WL}" width="1920" height="${1080 - WL}" fill="url(#water)"/>
<!-- the mirror: palace + sky reflected, rippled -->
<g mask="url(#refMask)"><g filter="url(#ripple)"><g transform="translate(0,${2 * WL}) scale(1,-1)"><rect width="1920" height="${WL}" fill="url(#sky)" opacity=".6"/>${facade()}<g opacity=".8">${arcs}${heroArc}</g></g></g></g>
<!-- sun glints -->
${Array.from({length: 40}, (_, i) => { const x = (i * 211) % 1920, y = WL + 20 + ((i * 97) % 440); return `<path d="M${x},${y} l${20 + (i % 5) * 8},0" stroke="#F4FFF8" stroke-width="2" opacity="${0.25 + (i % 3) * 0.15}"/>`; }).join('')}
<!-- splash where the arcs meet -->
<ellipse cx="${C[0]}" cy="${C[1] + 6}" rx="70" ry="14" fill="#F4FFFA" opacity=".8" filter="url(#b6)"/>
${Array.from({length: 14}, (_, i) => { const a = Math.PI * (0.1 + 0.8 * i / 13); return `<path d="M${C[0]},${C[1]} q${Math.cos(a) * -30},-30 ${Math.cos(a) * -60},-${10 + (i % 4) * 8}" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".7"/>`; }).join('')}
${statues}
${arcs}${heroArc}
<!-- your hour: a warm light on your seat -->
`;
K.page(svg, K.hud({sub: '正午十二点，十二个[一起喷水]。', stamp: {s1: '乾隆年间 · 海晏堂', s2: '12:00 · 正午（水力钟）'}, era: '清', age: {a: '在家', n: 12, post: '/12'},
	bk: {sub: .8, stamp: .8, blk: .8}}));

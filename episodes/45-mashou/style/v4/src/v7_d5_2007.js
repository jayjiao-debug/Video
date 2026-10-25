// v7 D5 「这一次，锤子[没有落下]。」 42.21 s, on the breakdown. Reuses d6a_2007 (v4); v7 hides the counter from 30 to 87 s.
// D6a 「这一次，锤子【没有落下】。」 (71.64 s, the breakdown 73.90 follows): the 2007 Hong Kong saleroom BEFORE the sale.
// Side-on: rows of empty chairs (catalogues on the seats) facing the rostrum; you on the podium under a cool work light;
// the gavel lying still on its block in the lectern lamp's pool (the slow push ends here). No people, no paddles, no LOT number.
const rnd = K.rnd, S = '#18110D';
const chair = (x, fy, k, cat) => { const u = 330 * k, X = (d) => x + d * u, Y = (d) => fy - d * u;
	return `<path d="M${X(-0.02)},${Y(0)} L${X(0.02)},${Y(0)} L${X(0.04)},${Y(1.0)} L${X(0.0)},${Y(1.0)} Z" fill="${S}"/>
	<path d="M${X(0.0)},${Y(0.98)} L${X(0.06)},${Y(1.0)} L${X(0.05)},${Y(0.52)} L${X(-0.01)},${Y(0.5)} Z" fill="${S}"/>
	<rect x="${X(-0.02)}" y="${Y(0.5)}" width="${0.42 * u}" height="${0.05 * u}" fill="${S}"/>
	<path d="M${X(0.36)},${Y(0.46)} L${X(0.39)},${Y(0.46)} L${X(0.4)},${Y(0)} L${X(0.36)},${Y(0)} Z" fill="${S}"/>
	${cat ? `<path d="M${X(0.1)},${Y(0.56)} L${X(0.33)},${Y(0.57)} L${X(0.33)},${Y(0.6)} L${X(0.1)},${Y(0.59)} Z" fill="#D9C9AA" opacity=".9"/><path d="M${X(0.1)},${Y(0.6)} L${X(0.33)},${Y(0.61)}" stroke="#F3E6CC" stroke-width="${2 * k}" opacity=".7"/>` : ''}`; };
let rows = '';
[[0.52, 770, 60, 9, '#2A201A'], [0.72, 845, 30, 7, '#1F1813'], [1.0, 965, -40, 5, S]].forEach(([k, fy, x0, n, col], r) => {
	for (let i = 0; i < n; i++) rows += chair(x0 + i * 175 * k + (r % 2) * 30, fy, k, rnd(i + r * 10) > 0.15).replaceAll(S, col); });
const hero = {x: 1030, y: 604, h: 162, curl: 1, glow: 0.8, key: 1.6, mood: 'warm', refl: '#DCE4E0', base: 'block', block: {w: 900, h: 38 / (162 / 925)}};   // r3: on a low black marble display block
const svg = `<defs>
 <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#352B25"/><stop offset=".55" stop-color="#56463A"/><stop offset="1" stop-color="#43362C"/></linearGradient>
 <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3D2F25"/><stop offset="1" stop-color="#1E1712"/></linearGradient>
 <radialGradient id="work" cx="1000" cy="560" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".42"/><stop offset=".5" stop-color="#C9D2CC" stop-opacity=".12"/><stop offset="1" stop-color="#C9D2CC" stop-opacity="0"/></radialGradient>
 <radialGradient id="lect" cx="1500" cy="640" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3DDB4" stop-opacity=".6"/><stop offset=".5" stop-color="#E8C090" stop-opacity=".16"/><stop offset="1" stop-color="#E8C090" stop-opacity="0"/></radialGradient>
 <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".22"/><stop offset="1" stop-color="#E6ECE6" stop-opacity="0"/></linearGradient>
 <radialGradient id="vig" cx="1100" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0E0907" stop-opacity="0"/><stop offset="1" stop-color="#0E0907" stop-opacity=".7"/></radialGradient>
 ${K.blur('b4', 4)}${K.blur('b12', 12)}${K.blur('b30', 30)}
</defs>
<rect width="1920" height="1080" fill="url(#wall)"/>
<!-- wall: tall panels, a dark blank lot board, hanging lamps (dimmed, small) -->
${[80, 520, 1260, 1700].map((x) => `<rect x="${x}" y="230" width="360" height="520" rx="4" fill="#53433A" opacity=".35" stroke="#7A6250" stroke-width="2"/>`).join('')}
<rect x="960" y="250" width="260" height="190" fill="#211914" stroke="#8A6E54" stroke-width="5"/>
${[0, 1, 2].map((i) => `<rect x="990" y="${290 + i * 40}" width="${200 - i * 50}" height="8" fill="#5A4636" opacity=".6"/>`).join('')}
${[[300, 0.3], [760, 0.3], [1240, 1], [1560, 0.3]].map(([x, k]) => `<path d="M${x},0 L${x},${120 * k - 30}" stroke="#1A120D" stroke-width="3"/><path d="M${x - 40},${120 * k - 30} L${x + 40},${120 * k - 30} L${x + 26},${120 * k} L${x - 26},${120 * k} Z" fill="#1A120D"/><ellipse cx="${x}" cy="${120 * k + 2}" rx="22" ry="6" fill="#F0D6A8" opacity=".55"/><ellipse cx="${x}" cy="${120 * k + 50}" rx="90" ry="60" fill="#F0D6A8" opacity=".08" filter="url(#b30)"/>`).join('')}
<rect x="0" y="770" width="1920" height="310" fill="url(#floor)"/>
<path d="M0,770 L1920,770" stroke="#6A5240" stroke-width="2" opacity=".6"/>
<!-- the work light: a clamp lamp on a stand, cool, pointed down at you -->
<path d="M1150,770 L1150,380 M1150,380 L1070,420" stroke="#15100C" stroke-width="8" fill="none"/>
<path d="M1040,404 L1092,430 L1076,452 L1030,430 Z" fill="#15100C"/>
<path d="M1036,440 L1078,452 L1180,770 L760,770 Z" fill="url(#beam)"/>
<rect width="1920" height="1080" fill="url(#work)"/>
<!-- far + mid chair rows -->
${rows.split('</path>').length ? '' : ''}
<g>${rows}</g>
<!-- the podium (a draped turntable) and you -->
<path d="M900,650 L1100,650 L1110,800 L890,800 Z" fill="#2A211B"/><rect x="884" y="642" width="232" height="14" fill="#3E3128"/>
<path d="M884,642 L1116,642" stroke="#E6ECE6" stroke-width="2.5" opacity=".7"/>
<ellipse cx="1000" cy="652" rx="100" ry="10" fill="#FF9A5A" opacity=".35" filter="url(#b12)"/>
${window.NOHERO ? "" : K.horseHead(hero)}
<!-- the rostrum, near right: lectern with its own small lamp; the gavel lying on the sound block -->
<rect width="1920" height="1080" fill="url(#lect)"/>
<path d="M1330,1080 L1360,660 L1690,660 L1720,1080 Z" fill="#20160F"/>
<path d="M1340,640 L1710,640 L1720,668 L1330,668 Z" fill="#3A281C"/><path d="M1340,640 L1710,640" stroke="#E9C690" stroke-width="3" opacity=".8"/>
<path d="M1660,640 L1660,560 C1660,540 1640,530 1620,532" stroke="#1A120D" stroke-width="7" fill="none"/>
<path d="M1580,520 L1640,520 L1628,546 L1592,546 Z" fill="#1A120D"/><ellipse cx="1610" cy="548" rx="18" ry="5" fill="#FFF0D0" opacity=".9"/>
<ellipse cx="1470" cy="632" rx="58" ry="12" fill="#2A1A10"/><ellipse cx="1470" cy="628" rx="58" ry="12" fill="#6A4428"/><ellipse cx="1470" cy="626" rx="50" ry="8" fill="#8A5C36"/>
<g transform="rotate(-6 1470 600)">
 <rect x="1380" y="596" width="150" height="14" rx="7" fill="#5A3820"/><rect x="1380" y="596" width="150" height="5" rx="2.5" fill="#B88456" opacity=".8"/>
 <rect x="1508" y="572" width="54" height="62" rx="10" fill="#6A4226"/><rect x="1508" y="572" width="54" height="16" rx="6" fill="#C8955E" opacity=".75"/>
 <rect x="1518" y="572" width="6" height="62" fill="#3A2416" opacity=".7"/><rect x="1546" y="572" width="6" height="62" fill="#3A2416" opacity=".7"/>
</g>
<!-- near row of chairs (foreground) -->
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '这一次，锤子[没有落下]。', stamp: {s1: '2007 · 香港苏富比', s2: '拍卖前 · 撤拍'}, era: '当代'}), K.CSS4);

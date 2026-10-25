// v7 N3 「人们排了[几个小时]去看。」 frame ≈15.6 s (the track left along the line, mid-move): MUSEUM-杭州 at night.
// The museum's long stone mass with its glass hall lit warm ivory: inside, four cases with the four heads (牛 虎 猴 猪) under
// museum light. In front, ONE straight queue side-on, in two depth rows (far row smaller and hazier), every visitor a one-tone
// profile facing left toward the door (far left, lit), rope stanchions along the near row. No faces, no number on screen.
const rnd = K.rnd;
const svg0 = `<defs>
 <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1C2A31"/><stop offset=".6" stop-color="#34474C"/><stop offset="1" stop-color="#4C5C5C"/></linearGradient>
 <linearGradient id="mass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A3B38"/><stop offset="1" stop-color="#2A2B29"/></linearGradient>
 <linearGradient id="hall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F3E3C2"/><stop offset=".55" stop-color="#E2C99C"/><stop offset="1" stop-color="#B89A70"/></linearGradient>
 <linearGradient id="plaza" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#57564F"/><stop offset="1" stop-color="#2A2A27"/></linearGradient>
 <radialGradient id="spill" cx="900" cy="640" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2B8" stop-opacity=".38"/><stop offset=".5" stop-color="#E8C890" stop-opacity=".12"/><stop offset="1" stop-color="#E8C890" stop-opacity="0"/></radialGradient>
 <radialGradient id="door" cx="250" cy="560" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF0D0" stop-opacity=".7"/><stop offset="1" stop-color="#FFF0D0" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0B0D0E" stop-opacity="0"/><stop offset="1" stop-color="#0B0D0E" stop-opacity=".6"/></radialGradient>
 ${K.rimFilter('rimQ', 5, 0, '#F6DDB0', 0.9, 1.4)}${K.rimFilter('rimQf', 4, 0, '#E8D2AA', 0.6, 1.2)}${K.blur('qb2', 1.6)}${K.blur('qb12', 12)}
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
${Array.from({length: 30}, (_, i) => `<circle cx="${rnd(i + 3) * 1920}" cy="${30 + rnd(i + 8) * 200}" r="${0.8 + rnd(i + 5)}" fill="#DDE6E2" opacity="${0.2 + rnd(i + 6) * 0.35}"/>`).join('')}
<!-- the museum: a long low stone mass, a deep cornice, the glass hall (centre-left) and the entrance (far left) -->
<rect x="0" y="236" width="1920" height="474" fill="url(#mass)"/>
<rect x="0" y="236" width="1920" height="34" fill="#4A4A45"/><path d="M0,270 L1920,270" stroke="#6E6A60" stroke-width="2"/>
${Array.from({length: 14}, (_, i) => `<rect x="${1290 + i * 48}" y="300" width="4" height="380" fill="#24251F" opacity=".7"/>`).join('')}
<rect x="440" y="300" width="840" height="380" fill="url(#hall)"/>
${Array.from({length: 7}, (_, i) => `<rect x="${440 + i * 140}" y="300" width="6" height="380" fill="#6E5E48" opacity=".75"/>`).join('')}
<rect x="440" y="300" width="840" height="380" fill="none" stroke="#7A6A52" stroke-width="5"/>
<!-- inside: the four cases, museum light from above -->
${['牛', '虎', '猴', '猪'].map((k, i) => { const x = 500 + i * 200; return `<ellipse cx="${x + 70}" cy="330" rx="90" ry="20" fill="#FFF6E2" opacity=".55" filter="url(#qb12)"/>
	<rect x="${x}" y="560" width="140" height="120" fill="#5E503E"/><path d="M${x},560 L${x + 140},560" stroke="#FFF1D6" stroke-width="3"/>
	<rect x="${x}" y="396" width="140" height="164" fill="#FFF8EA" opacity=".28" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="2.5"/>
	${K.bro(k, x + 70, 552, 112, -1, '#3A2A1E')}
	<path d="M${x + 10},404 L${x + 40},404 M${x + 10},404 L${x + 10},440" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>`; }).join('')}
<!-- the entrance (far left): a lit doorway the line is walking toward -->
<rect x="150" y="380" width="200" height="300" fill="#FFF1D6"/><rect x="150" y="380" width="200" height="300" fill="none" stroke="#5A4E40" stroke-width="8"/>
<rect width="1920" height="1080" fill="url(#door)"/>
<rect x="0" y="680" width="1920" height="400" fill="url(#plaza)"/>
<path d="M0,680 L1920,680" stroke="#8A8270" stroke-width="2" opacity=".6"/>
<rect width="1920" height="1080" fill="url(#spill)"/>`;
// the queue: far row (ground 818, smaller, hazier) then near row (ground 968); everyone faces LEFT (toward the door)
const tone = (k) => ['#1C1714', '#1F1916', '#18130F'][k % 3];
let far = '', near = '';
for (let i = 0; i < 17; i++) { const x = 240 + i * 100 + (rnd(i + 70) - 0.5) * 30, h = 236 + rnd(i + 71) * 34; far += K.visitor(x, 818, h, -1, '#262321'); }
// variety (no clone line): a child beside a parent, backpacks and shoulder bags on some, heights 300–380
const pack = (x, g, h, col, kind) => { const u = h / 8, X = (d) => x - d * u, Y = (d) => g - d * u;
	return kind === 'bag' ? `<path d="M${X(-0.3)},${Y(6.3)} L${X(0.5)},${Y(4.2)}" stroke="${col}" stroke-width="${0.12 * u}"/><rect x="${X(0.75)}" y="${Y(4.5)}" width="${0.7 * u}" height="${0.75 * u}" rx="${0.12 * u}" fill="${col}"/>`
		: `<path d="M${X(-0.62)},${Y(6.25)} C${X(-1.25)},${Y(6.1)} ${X(-1.35)},${Y(5.0)} ${X(-1.2)},${Y(4.3)} L${X(-0.6)},${Y(4.35)} Z" fill="${col}"/>`; };
for (let i = 0; i < 12; i++) { const x = 300 + i * 136 + (rnd(i + 80) - 0.5) * 34, kid = i === 4, h = kid ? 220 : 318 + rnd(i + 81) * 62;
	near += K.visitor(kid ? x + 30 : x, 968, h, -1, tone(i)) + (i % 3 === 1 ? pack(x, 968, h, tone(i), 'pack') : i % 4 === 2 ? pack(x, 968, h, tone(i), 'bag') : ''); }
// rope stanchions in front of the near row: posts + sagging rope
let posts = '', rope = 'M150,904';
for (let i = 0; i <= 9; i++) { const x = 150 + i * 196; posts += `<rect x="${x - 7}" y="884" width="14" height="96" fill="#A88A5E"/><rect x="${x - 22}" y="976" width="44" height="10" rx="4" fill="#7A6444"/><circle cx="${x}" cy="882" r="10" fill="#E8C690"/>`;
	if (i) rope += ` Q${x - 98},${936} ${x},904`; }
const svg = `${svg0}
<g filter="url(#qb2)" opacity=".92"><g filter="url(#rimQf)">${far}</g></g>
<g filter="url(#rimQ)">${near}</g>
<path d="${rope}" stroke="#8A2E22" stroke-width="9" fill="none"/><path d="${rope}" stroke="#C8584A" stroke-width="3" fill="none" opacity=".6" transform="translate(0,-2)"/>
${posts}
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '人们排了[几个小时]去看。', stamp: {s1: '2026 · 杭州', s2: '浙江省博物馆 · 四个兽首原件'}, era: '当代'}), K.CSS4);

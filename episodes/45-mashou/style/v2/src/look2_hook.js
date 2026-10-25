// Look 2 · 正午倒影 — hook C1: you in the case at 正觉寺 today; the polished floor does not reflect the hall:
// it shows where you belong — your stone seat at 海晏堂, noon, your arc of water.
const FL = 640;   // floor line (the mirror seam)
const hero = {x: 1190, y: 566, h: 310, curl: 1, glow: 0.9, rim: '#FFE6C4', rimAmt: .45};
// ---------- the past, drawn upright above FL, then mirrored below it
const past = () => {
	const seat = K.stoneBody(1215, FL - 6, 172, -1, 'url(#marbleD)');
	const ph = {x: seat.top[0] + 6, y: seat.top[1] + 26, h: 236, curl: 0, glow: 0.7, rim: '#FFF0D0', rimAmt: .6};
	const m = K.headPt(ph, 'mouth');
	const arc = (x0, y0, x1, y1, lift, w) => `<path d="M${x0},${y0} Q${(x0 + x1) / 2},${Math.min(y0, y1) - lift} ${x1},${y1}" stroke="#FFFFFF" stroke-width="${w}" fill="none" stroke-linecap="round" opacity=".9"/>`;
	let win = '';
	for (let i = 0; i < 16; i++) { const x = 160 + i * 104; if (x > 820 && x < 1060) continue; win += `<path d="M${x},${FL - 30} L${x},${FL - 90} A20,20 0 0 1 ${x + 40},${FL - 90} L${x + 40},${FL - 30} Z" fill="#7E8C88"/>`; }
	return `<rect x="0" y="200" width="1920" height="${FL - 200}" fill="url(#noonSky)"/>
	<path d="M100,${FL} L100,${FL - 190} L1820,${FL - 190} L1820,${FL} Z" fill="#EEE7D6"/>
	<path d="M780,${FL} L780,${FL - 280} L1140,${FL - 280} L1140,${FL} Z" fill="#F3EDDF"/><path d="M760,${FL - 280} L960,${FL - 340} L1160,${FL - 280} Z" fill="#E4DCC9"/>
	<path d="M890,${FL} L890,${FL - 150} A70,70 0 0 1 1030,${FL - 150} L1030,${FL} Z" fill="#6E7C78"/>${win}
	<rect x="0" y="${FL - 34}" width="1920" height="34" fill="#4F9A8E"/>
	${arc(m[0], m[1], 760, FL - 20, 150, 7)}
	<path d="M1110,${FL} L1110,${FL - 200} A105,105 0 0 1 1320,${FL - 200} L1320,${FL} Z" fill="#5E6C68"/><g filter="url(#sun)">${seat.svg}</g><rect x="1110" y="${FL - 8}" width="200" height="14" fill="#CFC6B2"/>${K.horseHead(ph)}
	`;
};
let svg = `
<defs>
 <linearGradient id="noonSky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="200" y2="${FL}"><stop offset="0" stop-color="#8FC0D0"/><stop offset="1" stop-color="#F1EEDF"/></linearGradient>
 <linearGradient id="marble" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#E9E3D4"/><stop offset=".6" stop-color="#C3BAA6"/><stop offset="1" stop-color="#8F8776"/></linearGradient>
 <linearGradient id="marbleD" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#D6CDB8"/><stop offset=".55" stop-color="#A39985"/><stop offset="1" stop-color="#6F6858"/></linearGradient>
 <linearGradient id="bronze" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8A6A4E"/><stop offset=".55" stop-color="#5A4230"/><stop offset="1" stop-color="#33251B"/></linearGradient>
 <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6B5E50"/><stop offset="1" stop-color="#8E8170"/></linearGradient>
 <linearGradient id="floorG" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="${FL}" y2="1080"><stop offset="0" stop-color="#1E2B2A"/><stop offset="1" stop-color="#253533"/></linearGradient>
 <linearGradient id="refFade" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="${FL}" y2="1080"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
 <mask id="refMask"><rect x="0" y="${FL}" width="1920" height="${1080 - FL}" fill="url(#refFade)"/></mask>
 <filter id="ripple" filterUnits="userSpaceOnUse" x="0" y="${FL}" width="1920" height="${1080 - FL}"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.06" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
 <radialGradient id="caseLight" cx="1110" cy="420" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD8AA" stop-opacity=".35"/><stop offset="1" stop-color="#FFD8AA" stop-opacity="0"/></radialGradient>
 <filter id="b12" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="12"/></filter>
 ${K.rimFilter('sun', 0, 4, '#F6DDB0', 0.9, 1.4)}
</defs>
<!-- today: the hall of 文殊亭 in soft daylight -->
<rect width="1920" height="${FL}" fill="url(#wall)"/>
<rect x="0" y="0" width="1920" height="96" fill="#3E3029"/>
<rect x="0" y="96" width="1920" height="26" fill="#3F6F6A"/><rect x="0" y="122" width="1920" height="10" fill="#C9A45C"/><rect x="0" y="132" width="1920" height="18" fill="#2F5560"/>
${[0, 1, 2, 3].map((i) => `<rect x="${60 + i * 120}" y="210" width="96" height="330" fill="#E9E1CF"/>`).join('')}
${[0, 1, 2, 3].map((i) => { let d = ''; const x = 60 + i * 120; for (let k = 0; k < 9; k++) d += `M${x},${222 + k * 36} L${x + 96},${222 + k * 36} `; for (let k = 1; k < 4; k++) d += `M${x + k * 24},210 L${x + k * 24},540 `; return `<path d="${d}" stroke="#7a6a58" stroke-width="5"/><rect x="${x}" y="210" width="96" height="330" fill="none" stroke="#5a4a3c" stroke-width="10"/>`; }).join('')}
${[0, 1, 2].map((i) => `<rect x="${1560 + i * 120}" y="210" width="96" height="330" fill="#E9E1CF"/>`).join('')}
${[0, 1, 2].map((i) => { let d = ''; const x = 1560 + i * 120; for (let k = 0; k < 9; k++) d += `M${x},${222 + k * 36} L${x + 96},${222 + k * 36} `; for (let k = 1; k < 4; k++) d += `M${x + k * 24},210 L${x + k * 24},540 `; return `<path d="${d}" stroke="#7a6a58" stroke-width="5"/><rect x="${x}" y="210" width="96" height="330" fill="none" stroke="#5a4a3c" stroke-width="10"/>`; }).join('')}
<rect x="520" y="150" width="58" height="${FL - 150}" fill="#8E3B2C"/><rect x="520" y="150" width="14" height="${FL - 150}" fill="#A9503C"/>
<rect x="1460" y="150" width="58" height="${FL - 150}" fill="#8E3B2C"/><rect x="1460" y="150" width="14" height="${FL - 150}" fill="#A9503C"/>
<path d="M60,210 L540,210 L980,${FL} L380,${FL} Z M1560,210 L1900,210 L1700,${FL} L1300,${FL} Z" fill="#FFF3DC" opacity=".08"/>
<rect width="1920" height="${FL}" fill="url(#caseLight)"/>
<!-- the case on a low plinth -->
<path d="M880,${FL} L880,580 L1360,580 L1360,${FL} Z" fill="#3A302A"/><path d="M866,586 L1374,586 L1374,566 L866,566 Z" fill="#544538"/>
${K.horseHead(hero)}
<rect x="880" y="236" width="480" height="330" fill="#E8F4F2" fill-opacity=".06" stroke="#F6EEE0" stroke-opacity=".75" stroke-width="2.5"/>
<path d="M925,250 L970,250 L905,560 L880,560 Z" fill="#FFFFFF" opacity=".08"/>
<!-- the floor: a dark polished stone that remembers -->
<rect x="0" y="${FL}" width="1920" height="${1080 - FL}" fill="url(#floorG)"/>
<g mask="url(#refMask)"><g filter="url(#ripple)"><g transform="translate(0,${2 * FL}) scale(1,-1)">${past()}</g></g></g>
<path d="M0,${FL} L1920,${FL}" stroke="#F4EBD8" stroke-width="2" opacity=".55"/>
<rect x="0" y="${FL}" width="1920" height="40" fill="#1E2B2A" opacity=".35"/>
`;
K.page(svg, K.hud({sub: '假如说，你是圆明园的[马首]。', stamp: {s1: '2026 · 圆明园', s2: '正觉寺 · 文殊亭'}, era: '今', age: {a: '你 约', n: 267, post: '岁'}, bk: {sub: .6, stamp: .6, blk: .4}}));

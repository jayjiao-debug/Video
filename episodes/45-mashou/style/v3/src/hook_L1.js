// L1 铜灯影 · hook C1 「假如说，你是圆明园的马首。」 — 正觉寺·文殊亭 at dusk. You in the glass case (nose inside the glass),
// the dusk courtyard through the open bay and the lattice doors; a visitor at the case's depth (true scale: her head ≈ ½ of you).
const S = '#120B08';
const hero = {x: 1310, y: 742, h: 310, curl: 1, glow: 1.25, rim: '#FFD2A0'};
const caseL = 1030, caseR = 1500, caseT = 360, caseB = 742;
const hx = 1250, hy = 590;
const rnd = (i) => { const x = Math.sin(i * 77.7 + 3.1) * 43758.5453; return x - Math.floor(x); };
// lattice (隔扇): diamond grid with depth (dark face + a lit bevel facing the hero)
const lattice = (x, y, w, h, id) => { let d = '';
	for (let i = -h; i < w + h; i += 34) d += `M${x + i},${y} L${x + i + h * 0.58},${y + h} M${x + i},${y} L${x + i - h * 0.58},${y + h} `;
	return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
	<g clip-path="url(#${id})"><path d="${d}" stroke="#2a1a12" stroke-width="9"/><path d="${d}" stroke="#7a4a2e" stroke-width="2" transform="translate(2,0)" opacity=".7"/></g>
	<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#24160f" stroke-width="16"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="none" stroke="#6a4028" stroke-width="2" opacity=".6"/>`; };
const roof = (x, y, w, h, col) => `<path d="M${x - 40},${y - 18} C${x + w * 0.08},${y + 2} ${x + w * 0.2},${y - h * 0.3} ${x + w * 0.26},${y - h} L${x + w * 0.74},${y - h} C${x + w * 0.8},${y - h * 0.3} ${x + w * 0.92},${y + 2} ${x + w + 40},${y - 18} L${x + w - 10},${y + 8} L${x + w - 10},${y + 140} L${x + 10},${y + 140} L${x + 10},${y + 8} Z" fill="${col}"/>
 <path d="M${x + w * 0.24},${y - h - 14} l14,0 l4,14 l-22,0 Z M${x + w * 0.76 - 14},${y - h - 14} l14,0 l4,14 l-22,0 Z" fill="${col}"/><rect x="${x + w * 0.25}" y="${y - h - 6}" width="${w * 0.5}" height="10" fill="${col}"/>`;
let svg = `
<defs>
 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="200" y2="780"><stop offset="0" stop-color="#3C5966"/><stop offset=".38" stop-color="#7F948E"/><stop offset=".72" stop-color="#DCA36C"/><stop offset="1" stop-color="#F3BE84"/></linearGradient>
 <linearGradient id="skyL" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="250" y2="740"><stop offset="0" stop-color="#5E7A80"/><stop offset=".55" stop-color="#A9A58E"/><stop offset="1" stop-color="#E8B07A"/></linearGradient>
 <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A4030"/><stop offset=".5" stop-color="#3E2C21"/><stop offset="1" stop-color="#2A1D16"/></linearGradient>
 <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E140E"/><stop offset=".8" stop-color="#34241A"/><stop offset="1" stop-color="#4A3020"/></linearGradient>
 <linearGradient id="col" x1="0" x2="1"><stop offset="0" stop-color="#2A140E"/><stop offset=".7" stop-color="#4A2216"/><stop offset="1" stop-color="#8A4A2C"/></linearGradient>
 <linearGradient id="plinth" x1="0" x2="1"><stop offset="0" stop-color="#2A1C14"/><stop offset=".5" stop-color="#3E2A1E"/><stop offset="1" stop-color="#22160F"/></linearGradient>
 <radialGradient id="spill" cx="${hx}" cy="${hy}" r="700" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".45"/><stop offset=".4" stop-color="#E0743C" stop-opacity=".16"/><stop offset="1" stop-color="#E0743C" stop-opacity="0"/></radialGradient>
 <filter id="bl20" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="20"/></filter>
 <filter id="bl8" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="8"/></filter>
 <filter id="haze" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="2"/></filter>
 ${K.rimFilter('rimV', -6, 0, '#FFB678', 1, 1.6)}
</defs>
<!-- the open bay: the 正觉寺 courtyard at dusk (roofs, a pine, the far wall) -->
<rect width="1920" height="1080" fill="url(#sky)"/>
<g filter="url(#haze)">
 ${roof(560, 640, 420, 74, '#56625F')}${roof(1180, 628, 460, 86, '#4E5A58')}
 <path d="M905,720 C900,660 880,620 896,560 C906,520 890,490 900,450" stroke="#3B4442" stroke-width="13" fill="none"/>
 <path d="M896,600 C930,590 960,580 990,560 M900,520 C870,510 840,500 812,486" stroke="#3B4442" stroke-width="7" fill="none"/>
 ${[[900, 444, 70, 22], [960, 470, 66, 20], [840, 484, 74, 22], [1000, 552, 80, 24], [800, 520, 60, 18], [920, 510, 60, 18]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#3F4A48"/><ellipse cx="${x}" cy="${y - 6}" rx="${rx * 0.8}" ry="${ry * 0.5}" fill="#4C5755"/>`).join('')}
 <rect x="500" y="716" width="1000" height="64" fill="#4A4C48"/>
 <rect x="500" y="700" width="1000" height="18" fill="#6A6A60"/>
</g>
<rect x="500" y="660" width="1000" height="120" fill="#F0A868" opacity=".14"/>
<!-- the hall: beam with muted 彩画 lit from below, brackets, side bays with lattice doors glowing with dusk -->
<rect x="0" y="0" width="1920" height="222" fill="url(#beam)"/>
<path d="M0,196 L1920,196" stroke="#5A3A26" stroke-width="3"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${130 + i * 330},214 l90,0 l0,-26 l-90,0 Z" fill="#2E4A4A" opacity=".55"/><path d="M${150 + i * 330},208 c14,-12 36,-12 50,0" stroke="#B08A50" stroke-width="3" fill="none" opacity=".55"/>`).join('')}
<rect x="0" y="222" width="500" height="560" fill="#2A1C14"/><rect x="1500" y="222" width="420" height="560" fill="#2A1C14"/>
<rect x="44" y="262" width="400" height="420" fill="url(#skyL)"/>${lattice(44, 262, 196, 420, 'lc1')}${lattice(248, 262, 196, 420, 'lc2')}
<rect x="1560" y="262" width="320" height="420" fill="url(#skyL)"/>${lattice(1560, 262, 156, 420, 'lc3')}${lattice(1722, 262, 156, 420, 'lc4')}
<rect x="0" y="682" width="500" height="100" fill="#23170F"/><rect x="1500" y="682" width="420" height="100" fill="#23170F"/>
<rect x="470" y="200" width="56" height="600" fill="url(#col)"/><rect x="1484" y="200" width="56" height="600" fill="url(#col)" transform="scale(-1,1) translate(-3024,0)"/>
<path d="M0,778 L1920,778 L1920,792 L0,792 Z" fill="#20140E"/>
<!-- polished floor: reflections of the bay and the doors, lattice light patches, the copper pool under the case -->
<rect x="0" y="792" width="1920" height="288" fill="url(#floor)"/>
<g filter="url(#bl20)" opacity=".5"><rect x="540" y="800" width="920" height="120" fill="#C08A5C"/><rect x="60" y="800" width="380" height="80" fill="#9A8A70"/><rect x="1570" y="800" width="300" height="80" fill="#9A8A70"/></g>
${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${70 + i * 56},${860 + (i % 2) * 6} l40,0 l70,90 l-40,0 Z" fill="#E8B07A" opacity=".12" filter="url(#bl8)"/>`).join('')}
${[0, 1, 2, 3, 4].map((i) => `<path d="M${1590 + i * 56},${860 + (i % 2) * 6} l40,0 l-30,90 l-40,0 Z" fill="#E8B07A" opacity=".1" filter="url(#bl8)"/>`).join('')}
<!-- plinth + case -->
<path d="M${caseL + 18},1080 L${caseL + 18},${caseB + 22} L${caseR - 18},${caseB + 22} L${caseR - 18},1080 Z" fill="url(#plinth)"/>
<path d="M${caseL - 6},${caseB + 24} L${caseR + 6},${caseB + 24} L${caseR + 6},${caseB} L${caseL - 6},${caseB} Z" fill="#3A2618"/>
<rect width="1920" height="1080" fill="url(#spill)" style="mix-blend-mode:screen"/>
<path d="M${caseL - 6},${caseB} L${caseR + 6},${caseB}" stroke="#FFB070" stroke-width="3" opacity=".8"/>
<path d="M${caseL + 18},${caseB + 24} L${caseL + 18},1080" stroke="#FFB070" stroke-width="2" opacity=".35"/>
<path d="M526,230 L526,790" stroke="#FFB070" stroke-width="3" opacity=".35"/><path d="M1484,230 L1484,790" stroke="#FFB070" stroke-width="3" opacity=".5"/>
${K.horseHead(hero)}
<!-- the glass: you are fully inside it (nose ≥ 40 px from the left pane) -->
<rect x="${caseL}" y="${caseT}" width="${caseR - caseL}" height="${caseB - caseT}" fill="#FFC48A" fill-opacity=".05" stroke="#FFD2A0" stroke-opacity=".7" stroke-width="2.5"/>
<path d="M${caseL},${caseT} L${caseR},${caseT}" stroke="#FFE0B8" stroke-opacity=".85" stroke-width="3"/>
<path d="M${caseL + 30},${caseT + 16} L${caseL + 78},${caseT + 16} L${caseL + 16},${caseB - 6} L${caseL},${caseB - 6} Z" fill="#FFE8CC" opacity=".08"/>
<path d="M${caseR - 60},${caseT + 26} L${caseR - 36},${caseT + 26} L${caseR - 86},${caseB - 6} L${caseR - 110},${caseB - 6} Z" fill="#FFE8CC" opacity=".07"/>
<ellipse cx="${hx}" cy="${caseB + 120}" rx="420" ry="44" fill="#FF9A5A" opacity=".22" filter="url(#bl20)"/>
${Array.from({length: 24}, (_, i) => { const a = i * 2.39, r = 120 + (i * 37) % 300; return `<circle cx="${hx + Math.cos(a) * r}" cy="${hy - 60 + Math.sin(a) * r * 0.6}" r="${1.3 + (i % 3)}" fill="#FFD2A0" opacity="${0.22 + (i % 4) * 0.1}"/>`; }).join('')}
<!-- the visitor, at the case's depth: feet below frame on the same floor as the plinth; hands behind her back -->
<g filter="url(#rimV)">${K.visitor(690, 1540, 1180, 1, S)}</g>
`;
K.page(svg, K.hud({sub: '假如说，你是圆明园的马首。', stamp: {s1: '2026 · 圆明园'}, era: '今'}));

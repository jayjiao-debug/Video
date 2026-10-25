// Look 1 · 铜灯影 — hook C1: you in the case at 正觉寺·文殊亭 at dusk; you are the only light.
const S = '#140D0A';
const hero = {x: 1262, y: 752, h: 372, curl: 1, glow: 1.3, rim: '#FFD2A0'};
const hx = 1180, hy = 560;
const lattice = (x, y, w, h, op = 1) => { let d = '';
	for (let i = -h; i < w + h; i += 36) d += `M${x + i},${y} L${x + i + h * 0.58},${y + h} M${x + i},${y} L${x + i - h * 0.58},${y + h} `;
	return `<clipPath id="lc${x}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g opacity="${op}"><path d="${d}" stroke="${S}" stroke-width="7" clip-path="url(#lc${x})"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${S}" stroke-width="14"/></g>`; };
const roof = (x, y, w, h, col) => `<path d="M${x - 40},${y - 18} C${x + w * 0.08},${y + 2} ${x + w * 0.2},${y - h * 0.3} ${x + w * 0.26},${y - h} L${x + w * 0.74},${y - h} C${x + w * 0.8},${y - h * 0.3} ${x + w * 0.92},${y + 2} ${x + w + 40},${y - 18} L${x + w - 10},${y + 8} L${x + w - 10},${y + 140} L${x + 10},${y + 140} L${x + 10},${y + 8} Z" fill="${col}"/>
 <path d="M${x + w * 0.24},${y - h - 14} l14,0 l4,14 l-22,0 Z M${x + w * 0.76 - 14},${y - h - 14} l14,0 l4,14 l-22,0 Z" fill="${col}"/><rect x="${x + w * 0.25}" y="${y - h - 6}" width="${w * 0.5}" height="10" fill="${col}"/>`;
let svg = `
<defs>
 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="240" y2="760"><stop offset="0" stop-color="#2B4552"/><stop offset=".42" stop-color="#6E827E"/><stop offset=".8" stop-color="#D79A62"/><stop offset="1" stop-color="#EDB277"/></linearGradient>
 <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2019"/><stop offset="1" stop-color="#140D09"/></linearGradient>
 <radialGradient id="spill" cx="${hx}" cy="${hy}" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".42"/><stop offset=".4" stop-color="#E0743C" stop-opacity=".14"/><stop offset="1" stop-color="#E0743C" stop-opacity="0"/></radialGradient>
 <radialGradient id="rimFall" cx="${hx}" cy="${hy}" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#888"/><stop offset="1" stop-color="#000"/></radialGradient>
 <mask id="rimMask"><rect width="1920" height="1080" fill="url(#rimFall)"/></mask>
 <filter id="bl20" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="20"/></filter>
 <filter id="haze" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="2"/></filter>
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
<!-- far: the 正觉寺 courtyard at dusk — layered roofs, a pine, hazed toward the sky -->
<g filter="url(#haze)">
 ${roof(600, 612, 380, 70, '#55615F')}${roof(1150, 600, 460, 84, '#4C5856')}
 <path d="M860,700 L860,470" stroke="#3F4A48" stroke-width="12"/>
 <path d="M860,480 C810,470 775,490 750,505 C790,508 830,500 860,492 C900,484 940,496 970,510 C930,474 890,470 860,480 Z M860,540 C800,530 760,552 735,566 C785,566 825,558 860,550 C905,542 950,556 985,568 C940,536 895,532 860,540 Z M860,600 C810,594 770,610 748,622 C790,622 830,616 860,610 C900,604 940,614 970,626 Z" fill="#3F4A48"/>
 <rect x="540" y="690" width="980" height="70" fill="#3A4040"/>
</g>
<rect x="540" y="640" width="980" height="120" fill="#E9A465" opacity=".12"/>
<!-- the hall: beam, brackets, columns, lattice side doors -->
<rect x="0" y="0" width="1920" height="240" fill="${S}"/>
<path d="M0,240 L1920,240 L1920,214 L0,214 Z" fill="#1f150f"/>
${[300, 640, 980, 1320, 1660].map((x) => `<path d="M${x},214 l-46,0 l0,-30 l30,0 l0,-24 l32,0 l0,24 l30,0 l0,30 Z" fill="#0d0907"/>`).join('')}
<rect x="0" y="240" width="540" height="520" fill="#1a120d"/><rect x="40" y="270" width="470" height="330" fill="#5f7270"/>${lattice(40, 270, 220, 330, 1)}${lattice(290, 270, 220, 330, 1)}
<rect x="1520" y="240" width="400" height="520" fill="#1a120d"/><rect x="1560" y="270" width="340" height="330" fill="#5f7270"/>${lattice(1560, 270, 160, 330, 1)}${lattice(1740, 270, 160, 330, 1)}

<rect x="500" y="200" width="62" height="700" fill="${S}"/><rect x="1500" y="200" width="62" height="700" fill="${S}"/>
<rect x="0" y="600" width="540" height="300" fill="#1a120d"/><rect x="1520" y="600" width="400" height="300" fill="#1a120d"/>
<path d="M0,756 L1920,756 L1920,772 L0,772 Z" fill="#120c09"/>
<!-- floor -->
<rect x="0" y="772" width="1920" height="308" fill="url(#floor)"/>
<!-- plinth + case -->
<path d="M1000,900 L1000,770 L1500,770 L1500,900 Z" fill="#1d130d"/>
<path d="M985,778 L1515,778 L1515,752 L985,752 Z" fill="#2a1a10"/>
<rect width="1920" height="1080" fill="url(#spill)" style="mix-blend-mode:screen"/>
<g mask="url(#rimMask)" fill="none" stroke="#FFB070" stroke-width="3">
 <path d="M562,240 L562,900"/><path d="M1500,240 L1500,900"/><path d="M985,752 L1515,752"/><path d="M1000,778 L1000,900"/><path d="M0,240 L1920,240"/>
</g>
${K.horseHead(hero)}
<rect x="1000" y="330" width="500" height="422" fill="#FFC48A" fill-opacity=".05" stroke="#FFC48A" stroke-opacity=".6" stroke-width="2.5"/>
<path d="M1000,330 L1500,330" stroke="#FFD6A8" stroke-opacity=".75" stroke-width="3"/>
<path d="M1040,350 L1090,350 L1020,740 L1000,740 Z" fill="#FFE8CC" opacity=".07"/>
<path d="M1450,360 L1474,360 L1424,742 L1400,742 Z" fill="#FFE8CC" opacity=".06"/>
<ellipse cx="1250" cy="930" rx="420" ry="40" fill="#FF9A5A" opacity=".2" filter="url(#bl20)"/>
<path d="M1150,905 L1340,905 L1310,1070 L1180,1070 Z" fill="#E07A45" opacity=".12" filter="url(#bl20)"/>
${Array.from({length: 26}, (_, i) => { const a = i * 2.39, r = 120 + (i * 37) % 330; return `<circle cx="${hx + Math.cos(a) * r}" cy="${hy - 60 + Math.sin(a) * r * 0.6}" r="${1.4 + (i % 3)}" fill="#FFD2A0" opacity="${0.25 + (i % 4) * 0.1}"/>`; }).join('')}
<!-- foreground viewer at true scale: head ≈ half the bronze's height (the bronze ≈ ¼ of a person) -->
${K.bust(700, 610, 186, 1, '#110b08', '#FFB678', 0.95)}
`;
K.page(svg, K.hud({sub: '假如说，你是圆明园的[马首]。', stamp: {s1: '2026 · 圆明园', s2: '正觉寺 · 文殊亭'}, era: '今', age: {a: '你 约', n: 267, post: '岁'}}));

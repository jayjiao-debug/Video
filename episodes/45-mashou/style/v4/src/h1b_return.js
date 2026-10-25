// H1b 「你回到了圆明园。」 (the hardest drop, 118.87 s, +0.3 s): the 正觉寺 courtyard at night (pays off T4). The 文殊亭's
// centre doors have just swung open inward; two staff inside, in profile, backlit by you, each walking a leaf back with both
// hands on its edge; you on the plinth between them; copper light spills down the steps and across the flagstones; the pines and
// the eaves take your rim. Sky kept darker than you (no white flash).
const rnd = K.rnd, S = '#110B08';
const hero = {x: 960, y: 520, h: 64, curl: 1, glow: 1.8, mood: 'warm', rim: '#FFE6C0'};
const staff = (x, f, hand) => { const fg = K.figure({x, ground: 640, h: 200, face: f, col: S, hat: 'hair', stride: [0.3, -0.35], hands: hand, elbow: [1, 1], lean: 0.1}); return fg.armBack + fg.svg + fg.armFront + `<path d="M${x - f * 30},${640 - 200 * 0.97} L${x - f * 30},${640}" stroke="none"/>`; };
const pine = (x, y, sc, flip) => { let s = `<path d="M${x},${y} C${x + 6 * sc},${y - 120 * sc} ${x - 10 * sc},${y - 220 * sc} ${x + 14 * sc},${y - 330 * sc}" stroke="${S}" stroke-width="${16 * sc}" fill="none"/>`;
	[[-100, -300, 120, 30], [60, -250, 110, 26], [-60, -200, 130, 32], [80, -150, 100, 26], [-30, -360, 90, 24]].forEach(([dx, dy, rx, ry], i) => { s += `<ellipse cx="${x + flip * dx * sc}" cy="${y + dy * sc}" rx="${rx * sc}" ry="${ry * sc}" fill="${S}"/><path d="M${x + flip * dx * sc - rx * sc * 0.8},${y + dy * sc - ry * sc * 0.4} Q${x + flip * dx * sc},${y + dy * sc - ry * sc * 1.1} ${x + flip * dx * sc + rx * sc * 0.8},${y + dy * sc - ry * sc * 0.4}" stroke="${flip > 0 ? '#C87A44' : '#C87A44'}" stroke-width="2.5" fill="none" opacity="${0.35 + 0.2 * (i % 2)}"/>`; });
	return s; };
const svg = `<defs>
 <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1E2C33"/><stop offset=".55" stop-color="#2F4246"/><stop offset="1" stop-color="#4A5752"/></linearGradient>
 <linearGradient id="flag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4C443D"/><stop offset="1" stop-color="#2A2420"/></linearGradient>
 <radialGradient id="inner" cx="960" cy="520" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFC890"/><stop offset=".35" stop-color="#E0874A"/><stop offset="1" stop-color="#6A2E16"/></radialGradient>
 <linearGradient id="spill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFB070" stop-opacity=".7"/><stop offset=".6" stop-color="#E0874A" stop-opacity=".3"/><stop offset="1" stop-color="#E0874A" stop-opacity=".08"/></linearGradient>
 <radialGradient id="halo" cx="960" cy="560" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".35"/><stop offset=".5" stop-color="#C8682F" stop-opacity=".1"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="960" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#070605" stop-opacity="0"/><stop offset="1" stop-color="#070605" stop-opacity=".7"/></radialGradient>
 ${K.rimFilter('rimIn', 0, -4, '#FFC890', 1, 1.4)}${K.blur('b6', 6)}${K.blur('b20', 20)}
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
${Array.from({length: 40}, (_, i) => `<circle cx="${rnd(i) * 1920}" cy="${rnd(i + 5) * 300}" r="${0.8 + rnd(i + 2) * 1.2}" fill="#DDE6E2" opacity="${0.2 + rnd(i + 3) * 0.4}"/>`).join('')}
<!-- far wall of the 正觉寺 court, low, with a moon-gate silhouette -->
<rect x="0" y="560" width="1920" height="140" fill="#26302F"/><path d="M0,556 L1920,556" stroke="#3E4A48" stroke-width="10"/>
<g transform="translate(960,712) scale(1.38) translate(-960,-712)">
<!-- the 文殊亭: two eaves, 5 bays, centre doors open -->
<path d="M400,300 L1520,300 L1640,360 L1560,372 L360,372 L280,360 Z" fill="${S}"/>
<path d="M560,220 L1360,220 L1440,268 L1380,276 L540,276 L480,268 Z" fill="${S}"/><rect x="600" y="276" width="720" height="26" fill="#1A120E"/>
<path d="M600,206 L1320,206" stroke="${S}" stroke-width="16"/>
<path d="M360,372 L1560,372" stroke="#C87A44" stroke-width="3" opacity=".55"/><path d="M540,276 L1380,276" stroke="#C87A44" stroke-width="2" opacity=".4"/>
<rect x="440" y="372" width="1040" height="268" fill="#2A1C14"/>
${[440, 640, 840, 1080, 1280, 1460].map((x) => `<rect x="${x}" y="372" width="20" height="268" fill="${S}"/>`).join('')}
${[460, 660, 1100, 1300].map((x) => `<rect x="${x + 14}" y="392" width="152" height="236" fill="none" stroke="#5A3A26" stroke-width="3"/>${Array.from({length: 7}, (_, k) => `<path d="M${x + 14},${410 + k * 30} L${x + 166},${410 + k * 30}" stroke="#4A2E1E" stroke-width="2"/>`).join('')}`).join('')}
<!-- the open centre bay: your light inside -->
<rect x="860" y="372" width="200" height="268" fill="url(#inner)"/>
<path d="M860,372 L838,382 L838,640 L860,640 Z" fill="#5A3A26"/><path d="M1060,372 L1082,382 L1082,640 L1060,640 Z" fill="#5A3A26"/>

<path d="M860,380 L884,404 L884,622 L860,640 Z" fill="#3A2216"/><path d="M1060,380 L1036,404 L1036,622 L1060,640 Z" fill="#3A2216"/><path d="M884,404 L884,622 M1036,404 L1036,622" stroke="#FFC890" stroke-width="2" opacity=".8"/><rect x="934" y="520" width="52" height="120" fill="#4A2A18"/><rect x="928" y="514" width="64" height="10" fill="#5A341E"/><path d="M928,514 L992,514" stroke="#FFD9A6" stroke-width="2"/>
${K.horseHead(hero)}
<g>${staff(898, -1, [[868, 520], [870, 548]])}${staff(1022, 1, [[1052, 520], [1050, 548]])}</g>
<!-- steps + terrace + flagstones; the spill -->
<rect x="400" y="640" width="1120" height="26" fill="#2E2620"/><rect x="380" y="666" width="1160" height="22" fill="#262019"/><rect x="360" y="688" width="1200" height="20" fill="#201A15"/></g>
<path d="M0,715 L1920,715 L1920,1080 L0,1080 Z" fill="url(#flag)"/>
${Array.from({length: 8}, (_, i) => `<path d="M0,${728 + i * i * 6} L1920,${728 + i * i * 6}" stroke="#151210" stroke-width="2"/>`).join('')}
${Array.from({length: 13}, (_, i) => `<path d="M${960 + (i - 6) * 120},715 L${960 + (i - 6) * 420},1080" stroke="#151210" stroke-width="2"/>`).join('')}
<path d="M785,715 L1135,715 L1500,1080 L420,1080 Z" fill="url(#spill)"/><rect width="1920" height="1080" fill="url(#halo)"/>
${pine(110, 820, 1.3, 1)}${pine(1830, 840, 1.2, -1)}
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '你回到了圆明园。', stamp: '2020.12.1 · 圆明园', era: '今', rows: [['回国', '7/12', 'rrrreeyereer'.split('').map((c, i) => [0, 1, 2, 3, 8, 11].includes(i) ? 'r' : i === 6 ? 'y' : 'e').join('')]]}), K.CSS4);

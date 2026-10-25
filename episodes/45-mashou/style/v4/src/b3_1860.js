// B3 「你被带走了。」 (52.39 s): the same water-clock stage, 1860.10.18, the façade burning; the camera has pushed in through
// the embers to your seat (empty: the collar ring rim-lit), and the looter in a kepi walks right (出) on the front flagstones,
// you held against his chest in both hands. Counter 在家 11/12 (the eleven still on their seats).
const rnd = K.rnd;
const env = (x) => Math.max(0, 0.55 + 0.45 * Math.sin(x / 210 + 0.6) * Math.cos(x / 97 + 1.3) + 0.25 * Math.sin(x / 41));
const tongue = (x, base, h, w, lean, fork) => { const tip = [x + lean, base - h];
	let d = `M${x - w / 2},${base} C${x - w * 0.62},${base - h * 0.35} ${x + lean * 0.3 - w * 0.34},${base - h * 0.62} ${tip[0]},${tip[1]}`;
	d += fork ? ` C${x + lean * 0.6},${base - h * 0.72} ${x + lean * 0.5 + w * 0.1},${base - h * 0.62} ${x + lean * 0.7 + w * 0.32},${base - h * 0.8} C${x + w * 0.4},${base - h * 0.5} ${x + w * 0.66},${base - h * 0.3} ${x + w / 2},${base} Z`
		: ` C${x + lean * 0.4 + w * 0.32},${base - h * 0.6} ${x + w * 0.7},${base - h * 0.32} ${x + w / 2},${base} Z`; return d; };
let fB = '', fF = '';
for (let i = 0; i < 34; i++) { const x = 160 + rnd(i + 40) * 1600, e = env(x); if (e < 0.15) continue; fB += `<path d="${tongue(x, 420, 120 + e * 300 * (0.6 + 0.6 * rnd(i + 3)), 70 + rnd(i + 5) * 120, (rnd(i + 7) - 0.3) * 120, rnd(i + 9) > 0.6)}"/>`; }
for (let i = 0; i < 46; i++) { const x = 180 + rnd(i + 140) * 1560, e = env(x + 40); if (e < 0.22) continue; fF += `<path d="${tongue(x, 410, 40 + e * 200 * (0.4 + 0.8 * Math.pow(rnd(i + 103), 1.5)), 30 + rnd(i + 105) * 70, (rnd(i + 107) - 0.3) * 80, rnd(i + 109) > 0.55)}"/>`; }
const items = []; let you = null;
for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) { const k = side < 0 ? K.ROW_L[i] : K.ROW_R[i]; items.push(K.statue(k, side, i, 'fire', {empty: true})); }
const sol = K.soldierCarry(1330, 1056, 660, '#140C09', {beltCol: '#3a2418'});
const hero = {...sol.hero, curl: 0, glow: 1.5, mood: 'fire', rim: '#FFE0A0'};
const svg = `<defs>
 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="640"><stop offset="0" stop-color="#2E1E22"/><stop offset=".38" stop-color="#6A2E24"/><stop offset=".72" stop-color="#BA562E"/><stop offset="1" stop-color="#E8924C"/></linearGradient>
 <linearGradient id="flB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF9A48"/><stop offset=".5" stop-color="#D24A22" stop-opacity=".85"/><stop offset="1" stop-color="#8A2412" stop-opacity="0"/></linearGradient>
 <linearGradient id="flF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE9B0"/><stop offset=".3" stop-color="#FFB04E"/><stop offset=".7" stop-color="#EA6028" stop-opacity=".8"/><stop offset="1" stop-color="#C0401E" stop-opacity="0"/></linearGradient>
 <linearGradient id="winfire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#E86A2E"/></linearGradient>
 <linearGradient id="poolF" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="670" y2="930"><stop offset="0" stop-color="#6A2E1C"/><stop offset=".45" stop-color="#2E160F"/><stop offset="1" stop-color="#1A0D09"/></linearGradient>
 <linearGradient id="fg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A2A1E"/><stop offset="1" stop-color="#1E120D"/></linearGradient>
 <radialGradient id="smk" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#7A3A26"/><stop offset=".55" stop-color="#3A2224"/><stop offset="1" stop-color="#2A1A1E" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#120A08" stop-opacity="0"/><stop offset="1" stop-color="#120A08" stop-opacity=".8"/></radialGradient>
 ${K.rimFilter('rimFire', -2, 5, '#FFA458', 0.95, 1.1)}${K.rimFilter('rimFig', -5, 3, '#FFB070', 0.95, 1.4)}${K.rimFilter('rimArm', 0, 4, '#FFC080', 0.95, 1.2)}
 ${K.blur('b3', 3)}${K.blur('b7', 7)}${K.blur('b40', 40)}${K.blur('hz', 2.5)}
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
<g transform="translate(620,700) scale(1.22) translate(-620,-700)">
 <g filter="url(#b40)">${[[420, 240, 300, 200], [760, 160, 260, 260], [1180, 140, 340, 240], [1540, 220, 260, 220], [960, 40, 900, 120]].map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#smk)"/>`).join('')}</g>
 <ellipse cx="960" cy="400" rx="920" ry="150" fill="#FF8A3A" opacity=".35" filter="url(#b40)"/>
 <g fill="url(#flB)" filter="url(#b7)" opacity=".9">${fB}</g><g fill="url(#flF)" filter="url(#b3)">${fF}</g>
 <g filter="url(#hz)">${K.facade('fire')}</g>
 ${K.stairs('fire')}${K.pool('fire')}
 <g filter="url(#rimFire)">${items.map((st) => st.svg).join('')}</g>
 ${Array.from({length: 30}, (_, i) => `<circle cx="${300 + rnd(i + 30) * 1300}" cy="${300 + rnd(i + 60) * 500}" r="${0.8 + rnd(i) * 1.6}" fill="#FFC070" opacity="${0.35 + rnd(i + 2) * 0.5}"/>`).join('')}
</g>
<rect x="0" y="1000" width="1920" height="80" fill="url(#fg)"/>
<path d="M0,1000 L1920,1000" stroke="#F0904A" stroke-opacity=".35" stroke-width="3"/>
<ellipse cx="1345" cy="1058" rx="150" ry="12" fill="#0d0705" opacity=".7"/>
<g filter="url(#rimFig)">${sol.back}${sol.body}</g>
${K.horseHead(hero)}
<g filter="url(#rimArm)">${sol.front}</g>
${Array.from({length: 50}, (_, i) => `<circle cx="${rnd(i + 31) * 1920}" cy="${180 + rnd(i + 61) * 700}" r="${1 + rnd(i) * 2.5}" fill="#FFC070" opacity="${0.35 + rnd(i + 2) * 0.5}"/>`).join('')}
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '你被带走了。', stamp: {s1: '1860.10.18 · 圆明园', s2: '英法联军焚园'}, era: '清', rows: [['在家', '11/12', 'hhhhhhehhhhh']]}), K.CSS4);

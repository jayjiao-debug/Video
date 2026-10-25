// Look 1 · 铜灯影 — key B4: 1860, 海晏堂 burning; a looter carries you off to the right (出 = into the dark); your seat is empty.
const S = '#170E0A', gy = 1012;
const rnd = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
// flames behind the façade
let flames = '';
for (let i = 0; i < 34; i++) { const x = 230 + rnd(i + 40) * 1460, base = 500, h = 70 + Math.pow(rnd(i + 3), 1.6) * 300, w = 50 + rnd(i + 5) * 90, lean = (rnd(i + 7) - 0.4) * 70;
	flames += `<path d="M${x - w / 2},${base} C${x - w * 0.6},${base - h * 0.4} ${x + lean - w * 0.2},${base - h * 0.7} ${x + lean},${base - h} C${x + lean * 0.4 + w * 0.3},${base - h * 0.6} ${x + w * 0.7},${base - h * 0.35} ${x + w / 2},${base} Z" fill="url(#fl)"/>`; }
// the façade of 海晏堂 (Western-style, two storeys, balustrade, raised centre with pediment), windows lit by the fire inside
let win = '';
for (let i = 0; i < 18; i++) { const x = 290 + i * 76; if (x > 860 && x < 1080) continue; win += `<path d="M${x},700 L${x},640 A18,18 0 0 1 ${x + 36},640 L${x + 36},700 Z" fill="url(#winfire)"/><path d="M${x},590 L${x},556 A18,18 0 0 1 ${x + 36},556 L${x + 36},590 Z" fill="url(#winfire)" opacity=".8"/>`; }
const fac = `<path d="M250,720 L250,520 L240,520 L240,500 L870,500 L870,440 L860,440 L960,370 L1060,440 L1050,440 L1050,500 L1680,500 L1680,520 L1670,520 L1670,720 Z" fill="#2B1813"/>
 ${Array.from({length: 40}, (_, i) => `<rect x="${246 + i * 36}" y="${i > 17 && i < 23 ? 426 : 486}" width="10" height="14" fill="#2B1813"/>`).join('')}
 <path d="M900,720 L900,600 A60,60 0 0 1 1020,600 L1020,720 Z" fill="url(#winfire)"/>`;
// the pool rim and the seated brothers (one row, side-on), your seat empty
const row = [['鼠', 330], ['虎', 520], ['龙', 1330], ['猴', 1500], ['狗', 1670]];
let seats = '';
row.forEach(([k, x], i) => { const h = 210; const b = K.stoneBody(x, 842, h, -1, '#1d120d'); seats += b.svg + K.zhead(k, b.top[0] - 4, b.top[1] + 40, 190, -1, '#1d120d'); });
const empty = K.stoneBody(770, 842, 210, -1, '#1d120d');
seats += empty.svg + `<path d="M${empty.top[0] - 28},${empty.top[1] + 2} C${empty.top[0] - 24},${empty.top[1] - 22} ${empty.top[0] + 20},${empty.top[1] - 26} ${empty.top[0] + 30},${empty.top[1] + 2} Z" fill="#1d120d"/>`;
// the looter carrying you
const u = 90, X = (dx) => 1010 + dx * u;
const hero = {x: X(1.02), y: 598, h: 180, curl: 0, flip: true, glow: 1.4, mood: 'fire', rim: '#FFE0A0'};
const fig = K.figure({x: 1010, ground: gy, h: 720, face: 1, hat: 'kepi', stride: [1.0, -0.75], coat: 0.7, belts: true, lean: 0.12,
	hands: [[X(1.36), 606], [X(1.22), 560]], elbow: [1, 1], col: S});
const rimCopy = (svg, col, w) => svg.replaceAll(`fill="${S}"`, `fill="none" stroke="${col}" stroke-width="${w}"`);
let svg = `
<defs>
 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="760"><stop offset="0" stop-color="#2A1D1F"/><stop offset=".38" stop-color="#5E2A22"/><stop offset=".72" stop-color="#B5502D"/><stop offset="1" stop-color="#E88A45"/></linearGradient>
 <linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE7A8"/><stop offset=".35" stop-color="#FFA24A"/><stop offset=".75" stop-color="#E0562A" stop-opacity=".7"/><stop offset="1" stop-color="#C0401E" stop-opacity="0"/></linearGradient>
 <linearGradient id="winfire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#E86A2E"/></linearGradient>
 <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A2018"/><stop offset="1" stop-color="#1A0F0B"/></linearGradient>
 <radialGradient id="cu" cx="${X(1.6)}" cy="520" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
 <mask id="cuMask"><rect width="1920" height="1080" fill="url(#cu)"/></mask>
 ${K.rimFilter('rimFire', 0, 4, '#FF9A50', 0.75, 1)}${K.rimFilter('rimFig', -5, 3, '#FFB070', 0.95, 1.4)}${K.rimFilter('rimArm', 0, 4, '#FFB070', 0.9, 1.2)}
 <filter id="b3" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="3"/></filter>
 <filter id="b10" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="10"/></filter>
 <filter id="b40" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="40"/></filter>
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
<!-- smoke columns -->
<g filter="url(#b40)" fill="#24161A" opacity=".85">
 <ellipse cx="560" cy="200" rx="360" ry="120"/><ellipse cx="1300" cy="160" rx="420" ry="110"/><ellipse cx="960" cy="60" rx="700" ry="110"/>
 <ellipse cx="420" cy="330" rx="200" ry="90"/><ellipse cx="1500" cy="320" rx="240" ry="90"/>
</g>
<ellipse cx="960" cy="470" rx="900" ry="170" fill="#FF8A3A" opacity=".35" filter="url(#b40)"/>
<g filter="url(#b3)">${flames}</g>
${fac}${win}
<!-- trees each side (silhouette) -->
<g filter="url(#b40)" fill="#2a1a1c" opacity=".9"><ellipse cx="120" cy="560" rx="220" ry="200"/><ellipse cx="1820" cy="540" rx="220" ry="220"/></g>
<!-- the pool rim -->
<rect x="0" y="720" width="1920" height="40" fill="#2A1712"/>
<path d="M0,760 L1920,760 L1920,842 L0,842 Z" fill="#3B2019"/>
<path d="M0,770 L1920,770" stroke="#E88A45" stroke-opacity=".35" stroke-width="3"/>
<g filter="url(#rimFire)">${seats}</g>
<path d="M0,842 L1920,842 L1920,860 L0,860 Z" fill="#1d120d"/>
<!-- rim light from the fire on the statues' tops -->

<!-- flagstones -->
<rect x="0" y="860" width="1920" height="220" fill="url(#ground)"/>
${Array.from({length: 9}, (_, i) => `<path d="M0,${880 + i * i * 3.2} L1920,${880 + i * i * 3.2}" stroke="#E88A45" stroke-opacity="${0.12 - i * 0.01}" stroke-width="2"/>`).join('')}
<ellipse cx="${X(0)}" cy="${gy + 4}" rx="140" ry="12" fill="#0d0705" opacity=".7"/>
<!-- the looter: far arm, body, you, near arm -->
<g filter="url(#rimFig)">${fig.armBack}${fig.svg}</g>
${K.horseHead(hero)}
<g filter="url(#rimArm)">${fig.armFront}</g>
<!-- embers -->
${Array.from({length: 60}, (_, i) => `<circle cx="${rnd(i + 30) * 1920}" cy="${200 + rnd(i + 60) * 620}" r="${1 + rnd(i) * 2.5}" fill="#FFC070" opacity="${0.35 + rnd(i + 2) * 0.5}"/>`).join('')}
`;
K.page(svg, K.hud({sub: '你被带走了，[不知去了哪]。', stamp: {s1: '1860.10 · 圆明园', s2: '英法联军劫掠、焚毁'}, era: '清', age: {a: '你 约', n: 101, post: '岁'},
	tally: {label: '在家', n: 11, tot: 12, note: '十二兽首 · 还剩 11 个'}}));

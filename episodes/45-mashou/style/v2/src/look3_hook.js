// Look 3 · 铜壁 (bold) — hook C1: you in the case at 正觉寺; behind you the hall's wall is a cast-bronze relief of your
// own story — 文殊亭 today on the left, and already, past the moulding, noon at 海晏堂. The camera will travel along it.
const H = (v) => { const c = Math.round(v * 255).toString(16).padStart(2, '0'); return `#${c}${c}${c}`; };
const BG = H(0.16), MID = H(0.45), HI = H(0.78), TOP = H(0.95);
let hm = `<rect width="1920" height="1080" fill="${BG}"/>`;
// two panels split by a moulding at x 1330
hm += `<rect x="40" y="40" width="1840" height="1000" fill="none" stroke="${HI}" stroke-width="20"/><rect x="1316" y="40" width="28" height="1000" fill="${HI}"/>`;
// left panel: 文殊亭 (Chinese hip roof, columns, steps), a visitor in profile looking toward the centre
hm += `<path d="M220,420 C330,400 420,330 470,250 L1010,250 C1060,330 1150,400 1260,420 L1236,436 L244,436 Z" fill="${H(0.62)}"/>
<path d="M470,250 L1010,250 L1000,232 L480,232 Z" fill="${HI}"/><path d="M462,232 l20,-26 l14,26 Z M1018,232 l-20,-26 l-14,26 Z" fill="${HI}"/>
${[330, 520, 710, 900, 1090].map((x) => `<rect x="${x}" y="436" width="34" height="400" fill="${H(0.52)}"/>`).join('')}
${[0, 1, 2].map((i) => `<rect x="${260 - i * 30}" y="${836 + i * 22}" width="${960 + i * 60}" height="22" fill="${H(0.4 + i * 0.08)}"/>`).join('')}
<path d="M246,436 L1236,436 L1236,470 L246,470 Z" fill="${H(0.36)}"/>`;
for (let i = 0; i < 30; i++) hm += `<path d="M${250 + i * 33},${420 - Math.sin(i / 29 * Math.PI) * 0}" stroke="${H(0.7)}"/>`;
const vis = K.figure({x: 420, ground: 880, h: 330, face: 1, hat: 'hair', stride: [0.2, -0.15], coat: 1.2, col: HI, hands: [[440, 735], [404, 738]]});
hm += vis.armBack + vis.svg + vis.armFront;
// right panel: noon at 海晏堂 — an arch, two seated brothers, arcs of water
hm += `<path d="M1420,840 L1420,420 A120,120 0 0 1 1660,420 L1660,840 Z" fill="${H(0.3)}"/><path d="M1400,840 L1400,400 A140,140 0 0 1 1680,400 L1680,840" fill="none" stroke="${H(0.6)}" stroke-width="22"/>
<rect x="1360" y="840" width="490" height="24" fill="${H(0.5)}"/><rect x="1360" y="880" width="490" height="120" fill="${H(0.36)}"/>`;
const b1 = K.stoneBody(1780, 840, 230, -1, H(0.72)); hm += b1.svg + K.zhead('兔', b1.top[0] - 4, b1.top[1] + 34, 196, -1, H(0.86));
for (let k = 0; k < 4; k++) hm += `<path d="M${1700 - k * 6},${b1.top[1] - 4 + k * 26} Q${1560 - k * 30},${400 + k * 60} ${1400 + k * 20},${880}" stroke="${H(0.9)}" stroke-width="${10 - k * 2}" fill="none" stroke-linecap="round"/>`;
hm += `<text x="1600" y="236" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="52" fill="${HI}" letter-spacing="10">乾隆年间</text>`;
const hero = {x: 1036, y: 860, h: 400, curl: 1, glow: 1.15, rim: '#FFE2B8'};
let svg = `<defs>${K.reliefFilter('rel', {az: 210, el: 30, sc: 12, base: '#86603A'})}
 <radialGradient id="lamp" cx="700" cy="250" r="1500" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0c0704" stop-opacity=".45"/></radialGradient>
 <radialGradient id="cu" cx="930" cy="680" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".42"/><stop offset="1" stop-color="#FF9A5A" stop-opacity="0"/></radialGradient>
 <linearGradient id="plinth" x1="0" x2="1"><stop offset="0" stop-color="#2a1d14"/><stop offset=".5" stop-color="#3b2a1d"/><stop offset="1" stop-color="#1c130c"/></linearGradient>
 <filter id="sh" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<g filter="url(#rel)">${hm}</g>
<rect width="1920" height="1080" fill="url(#lamp)"/>
<rect width="1920" height="1080" fill="url(#cu)" style="mix-blend-mode:screen"/>
<!-- in the round: plinth, case, you — casting a real shadow on the wall -->
<path d="M1060,470 C1240,520 1280,700 1250,860 L1150,860 C1190,720 1150,560 1060,470 Z" fill="#0d0704" opacity=".45" filter="url(#sh)"/>
<path d="M690,1080 L700,880 L1250,880 L1260,1080 Z" fill="url(#plinth)"/><path d="M676,884 L1274,884 L1274,860 L676,860 Z" fill="#4a3424"/>
${K.horseHead(hero)}
<rect x="700" y="420" width="540" height="440" fill="#FFE8CC" fill-opacity=".04" stroke="#FFD2A0" stroke-opacity=".55" stroke-width="2.5"/>
<path d="M740,440 L790,440 L720,850 L700,850 Z" fill="#FFF3E0" opacity=".08"/>
`;
K.page(svg, K.hud({sub: '假如说，你是圆明园的[马首]。', stamp: {s1: '2026 · 圆明园', s2: '正觉寺 · 文殊亭'}, era: '今', age: {a: '你 约', n: 267, post: '岁'}, bk: {sub: .5, stamp: .5, blk: .6}}));

// Look 3 · 铜壁 (bold) — key D7: 2007, the auction where the gavel does not fall. The room is a cast-bronze relief on the
// wall of time; you alone are in the round — polished red copper, the only light that is not the raking lamp.
const H = (v) => { const c = Math.round(v * 255).toString(16).padStart(2, '0'); return `#${c}${c}${c}`; };
const BG = H(0.18), MID = H(0.45), HI = H(0.8), TOP = H(0.95);
// --- height map
let hm = `<rect width="1920" height="1080" fill="${BG}"/>`;
// panel frame + moulding
hm += `<rect x="30" y="30" width="1860" height="1020" fill="none" stroke="${HI}" stroke-width="22"/><rect x="62" y="62" width="1796" height="956" fill="none" stroke="${MID}" stroke-width="8"/>`;
// back wall: pilasters and a coffered band
for (let i = 0; i < 9; i++) hm += `<rect x="${120 + i * 210}" y="250" width="36" height="560" fill="${H(0.3)}"/>`;
hm += `<rect x="62" y="236" width="1796" height="18" fill="${H(0.34)}"/>`;
// floor line
hm += `<rect x="62" y="900" width="1796" height="12" fill="${H(0.4)}"/>`;
// the rostrum + auctioneer (gavel raised and held: it does not fall)
hm += `<path d="M1380,900 L1400,640 L1640,640 L1660,900 Z" fill="${H(0.6)}"/><rect x="1370" y="626" width="300" height="22" fill="${HI}"/>`;
const auc = K.figure({x: 1560, ground: 900, h: 560, face: -1, hat: 'hair', stride: [0.15, -0.15], coat: 1.2, col: HI, hands: [[1430, 620], [1372, 330]], elbow: [-1, 1]});
hm += auc.armBack + auc.svg + auc.armFront;
hm += `<path d="M1366,334 L1378,332 L1372,274 L1360,276 Z" fill="${TOP}"/><rect x="1334" y="250" width="64" height="30" rx="8" fill="${TOP}" transform="rotate(-8 1366 265)"/>`;
// the LOT board: cast letters 撤拍
hm += `<rect x="1660" y="300" width="170" height="220" fill="${H(0.55)}"/><rect x="1676" y="316" width="138" height="188" fill="${H(0.3)}"/>
<text x="1745" y="398" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="70" fill="${TOP}">撤</text><text x="1745" y="482" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="70" fill="${TOP}">拍</text>`;
// seated bidders, paddles resting on their laps (no bidding)
[[300, 520], [520, 520], [740, 520]].forEach(([x], i) => { const u = 520 / 8, seatY = 900 - 2.3 * u; hm += K.seated(x, 900, 520, 1, i === 1 ? HI : H(0.7), [[x + 1.05 * u, seatY - 0.5 * u]]);
	hm += `<rect x="${x + 0.9 * u}" y="${seatY - 0.75 * u}" width="${0.2 * u}" height="${0.9 * u}" fill="${TOP}" transform="rotate(70 ${x + u} ${seatY - 0.4 * u})"/><ellipse cx="${x + 1.5 * u}" cy="${seatY - 0.36 * u}" rx="${0.36 * u}" ry="${0.16 * u}" fill="${TOP}"/>`; });
// the stand you sit on (relief) — you are drawn in the round on top of it
hm += `<path d="M960,900 L975,680 L1205,680 L1220,900 Z" fill="${H(0.62)}"/><rect x="950" y="668" width="280" height="20" fill="${HI}"/>`;
const hero = {x: 1096, y: 670, h: 300, curl: 1, glow: 1.1, rim: '#FFE2B8', mood: 'warm'};
let svg = `<defs>${K.reliefFilter('rel', {az: 215, el: 32, sc: 11, base: '#86603A'})}
 <radialGradient id="lamp" cx="560" cy="200" r="1500" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0c0704" stop-opacity=".45"/></radialGradient>
 <radialGradient id="cu" cx="1080" cy="560" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".38"/><stop offset="1" stop-color="#FF9A5A" stop-opacity="0"/></radialGradient>
 <filter id="sh" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<g filter="url(#rel)">${hm}</g>
<rect width="1920" height="1080" fill="url(#lamp)"/>
<rect width="1920" height="1080" fill="url(#cu)" style="mix-blend-mode:screen"/>
<!-- you: in the round, standing proud of the wall (a soft contact shadow on the relief) -->
<ellipse cx="1140" cy="660" rx="150" ry="20" fill="#120a05" opacity=".55" filter="url(#sh)"/>
<path d="M1150,380 C1260,420 1300,560 1280,660 L1220,660 C1240,560 1210,450 1150,380 Z" fill="#120a05" opacity=".35" filter="url(#sh)"/>
${K.horseHead(hero)}
`;
K.page(svg, K.hud({sub: '这一次，锤子[没有落下]。', stamp: {s1: '2007 · 香港', s2: '国家文物局反对 · 公开拍卖终止'}, era: '今', age: {a: '回国', n: 4, post: '/12'}, bk: {sub: .5, stamp: .5, blk: .5}}));

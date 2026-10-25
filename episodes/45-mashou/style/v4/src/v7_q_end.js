// v7 Q 「五个要是上拍，该不该[花钱买回来]？」 119.19–123.51 s (the end card forms around it at 123.71): back to the horse
// alone on its plinth (r2: the glass box was cut; it fought the dial) in the 文殊亭; the paper lattice behind is empty of the noon shadow-play. On the lattice, the
// twelve as a clock-dial ring of dots (午 = the horse at six o'clock, under it): 7 solid (6 ivory + the horse in copper),
// 5 dashed (龙 蛇 羊 鸡 狗, still abroad). Counter: 回国 7/12 (+ 回园 1/12).
const rnd = K.rnd;
// v8 (owner note, the ring at one scale): the dial is the ring; every place on it — the horse's too — is the same dot. The horse's
// place at six o'clock is a copper dot like the others; the real horse is the hub inside the dial, with air all round (no dot or
// line touches it), and the dial stays clear of the subtitle.
const HS = 340 / 925, PL = {cx: 960, top: 700, base: 800, w: 260}, DC = {x: 960, y: 562, rx: 640, ry: 298};
const hero = {x: PL.cx - (922 - 836) * HS, y: PL.top, h: 340, curl: 1, glow: 0.9, key: 2.0, mood: 'warm', refl: '#C9C2B0', base: 'block', block: {w: PL.w / HS, h: (PL.base - PL.top) / HS}};
const ZO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const back = new Set(['鼠', '牛', '虎', '兔', '猴', '猪']);
let dial = '';
ZO.forEach((k, i) => { const a = -Math.PI / 2 + i * Math.PI / 6, x = DC.x + Math.cos(a) * DC.rx, y = DC.y + Math.sin(a) * DC.ry;
	if (k === '马') { dial += `<circle cx="${x}" cy="${y}" r="30" fill="#E8894B" stroke="#FFD9A6" stroke-width="4"/><circle cx="${x}" cy="${y}" r="44" fill="#FF9A5A" opacity=".22"/>`; return; }
	dial += back.has(k) ? `<circle cx="${x}" cy="${y}" r="30" fill="#F3E6CF" opacity=".92"/>`
		: `<circle cx="${x}" cy="${y}" r="27" fill="none" stroke="#F3E6CF" stroke-width="5" stroke-dasharray="11 8" opacity=".9"/>`; });
let lat = ''; for (let i = -30; i < 80; i++) lat += `M${i * 46},140 l${430},740 M${i * 46},140 l${-430},740 `;
const svg = `<defs>
 <linearGradient id="paper" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8A5A36"/><stop offset=".6" stop-color="#B07A4A"/><stop offset="1" stop-color="#7A4A2A"/></linearGradient>
 <radialGradient id="halo" cx="960" cy="560" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity=".42"/><stop offset=".6" stop-color="#C8682F" stop-opacity=".1"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient>
 <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FFF4DE" stop-opacity=".16"/><stop offset=".5" stop-color="#FFF4DE" stop-opacity=".04"/><stop offset="1" stop-color="#FFF4DE" stop-opacity=".12"/></linearGradient>
 <radialGradient id="vig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0605" stop-opacity="0"/><stop offset="1" stop-color="#0A0605" stop-opacity=".72"/></radialGradient>
 <clipPath id="latc"><rect x="150" y="140" width="1620" height="765"/></clipPath>
</defs>
<rect width="1920" height="1080" fill="#2A170E"/>
<rect x="150" y="140" width="1620" height="765" fill="url(#paper)"/>
<g clip-path="url(#latc)"><path d="${lat}" stroke="#4A2A18" stroke-width="7" opacity=".55"/></g>
${[150, 690, 1230, 1770].map((x) => `<rect x="${x - 18}" y="120" width="36" height="805" fill="#3A2216"/>`).join('')}
<rect x="130" y="120" width="1660" height="24" fill="#3A2216"/>
<rect width="1920" height="1080" fill="url(#halo)"/>
<ellipse cx="${DC.x}" cy="${DC.y}" rx="${DC.rx}" ry="${DC.ry}" fill="none" stroke="#F3E6CF" stroke-width="2" opacity=".28"/>
${dial}
<rect x="0" y="905" width="1920" height="175" fill="#24150E"/><path d="M0,905 L1920,905" stroke="#C8783E" stroke-width="3" opacity=".5"/>
${window.NOHERO ? '' : K.horseHead(hero)}
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '五个要是上拍，该不该[花钱买回来]？', stamp: {s1: '圆明园 · 正觉寺', s2: '还差五个没回中国'}, era: '当代', rows: [['回国', '7/12', 'rrrrddydrddr'], ['回园', '1/12', 'eeeeeeyeeeee']]}), K.CSS4);

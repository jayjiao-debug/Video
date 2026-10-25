// v7 H3 「可住回圆明园的，[只有一个]。」 frame ≈7.4 s (bar 2 = 5.98 s, the six have just landed): the RING from the hook,
// pushed a little left. The six that came back (牛 虎 猴 猪 鼠 兔) have slid off RIGHT into two glass cases at the frame edge
// (保利艺术博物馆 ×4, 国家博物馆 ×2); their seats are empty collars with ivory trails still fading toward the cases. The five
// still abroad (龙 蛇 羊 鸡 狗) are dashed outlines. The copper horse is the only head left on a seat. Counter: 回国 7/12, 回园 1/12.
const pos = K.ringPos({cx: 700, far: {dx: 186, y: 576}, near: {dx: 212, y: 900}});
const hp = pos.find((p) => p.k === '马');
const st = {马: 'hero'};
['牛', '虎', '猴', '猪', '鼠', '兔'].forEach((k) => st[k] = 'empty');
['龙', '蛇', '羊', '鸡', '狗'].forEach((k) => st[k] = 'dash');
const r = K.ring(pos, st, {heroK: 1.15, rimEmpty: '#E9DCC4'});
// the trails: from each empty collar toward its case (soft ivory streaks, fading at the seat end)
const CASE1 = {x: 1340, y: 236, w: 460, h: 236}, CASE2 = {x: 1340, y: 600, w: 460, h: 200};
let trails = '';
[['牛', CASE1, 0.25], ['虎', CASE1, 0.75], ['猴', CASE1, 0.35], ['猪', CASE1, 0.55], ['鼠', CASE2, 0.3], ['兔', CASE2, 0.7]].forEach(([k, c, f], i) => {
	const [tx, ty] = r.seats[k].top, ex = c.x - 6, ey = c.y + c.h * f;
	trails += `<path d="M${tx},${ty - 40} C${tx + 160},${ty - 120 + i * 6} ${ex - 220},${ey - 40} ${ex},${ey}" stroke="url(#trail)" stroke-width="${10 - i * 0.6}" fill="none" stroke-linecap="round" filter="url(#tb4)"/>`; });
const svg = `${K.ringNight({cx: 700, heroX: hp.x - 40, heroY: hp.y - 260, poolRx: 780})}
<defs><linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#F3E6CF" stop-opacity="0"/><stop offset="1" stop-color="#F3E6CF" stop-opacity=".55"/></linearGradient>${K.blur('tb4', 4)}
<radialGradient id="caseGlow" cx="1580" cy="520" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E6C6" stop-opacity=".22"/><stop offset="1" stop-color="#F6E6C6" stop-opacity="0"/></radialGradient></defs>
<rect width="1920" height="1080" fill="url(#caseGlow)"/>
${r.svg}
${trails}
${K.vitrine(CASE1.x, CASE1.y, CASE1.w, CASE1.h, ['牛', '虎', '猴', '猪'], '保利艺术博物馆 ×4', {size: 96, plinth: 92, fs: 48, face: -1})}
${K.vitrine(CASE2.x, CASE2.y, CASE2.w, CASE2.h, ['鼠', '兔'], '国家博物馆 ×2', {size: 120, plinth: 92, fs: 48, face: -1})}
<radialGradient id="vig" cx="900" cy="600" r="1200" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".55"/></radialGradient>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '可住回圆明园的，[只有一个]。', stamp: {s1: '圆明园 · 十二兽首', s2: '海晏堂 · 水力钟'}, rows: [['回国', '7/12', 'rrrrddydrddr'], ['回园', '1/12', 'eeeeeeyeeeee']]}), K.CSS4 + '.era{display:none}');

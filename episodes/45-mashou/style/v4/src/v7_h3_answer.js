// v7 H3 「可住回圆明园的，[只有一个]。」 frame ≈7.0 s (bar 2 = 5.98 s, the six have just landed): the RING from the hook (v8: the
// same zodiac clock, every head at one scale, the horse front-centre), seen through the hook's reframe camera (1180, 600, ×0.86)
// so the two glass cases at the frame's right have room. The six that came back (牛 虎 猴 猪 鼠 兔) have flown into the cases
// (保利艺术博物馆 ×4, 国家博物馆 ×2); their seats are empty collars with ivory trails still fading toward the cases. The five still
// abroad (龙 蛇 羊 鸡 狗) are dashed outlines. The copper horse is the only head left on a seat. Counter: 回国 7/12, 回园 1/12.
const pos = K.ringPos(), L = K.ringHeroLight(pos);
const CAM = {x: 1180, y: 600, z: 0.86}, T = `translate(960,540) scale(${CAM.z}) translate(${-CAM.x},${-CAM.y})`, scr = ([x, y]) => [960 + (x - CAM.x) * CAM.z, 540 + (y - CAM.y) * CAM.z];
const st = {马: 'hero'};
['牛', '虎', '猴', '猪', '鼠', '兔'].forEach((k) => st[k] = 'empty');
['龙', '蛇', '羊', '鸡', '狗'].forEach((k) => st[k] = 'dash');
const r = K.ring(pos, st, {rimEmpty: '#E9DCC4'});
// the trails: from each empty collar toward its case (soft ivory streaks, fading at the seat end)
const CASE1 = {x: 1340, y: 236, w: 460, h: 236}, CASE2 = {x: 1340, y: 600, w: 460, h: 200};
let trails = '';
[['牛', CASE1, 0.25], ['虎', CASE1, 0.75], ['猴', CASE1, 0.35], ['猪', CASE1, 0.55], ['鼠', CASE2, 0.3], ['兔', CASE2, 0.7]].forEach(([k, c, f], i) => {
	const [tx, ty] = scr([r.seats[k].top[0], r.seats[k].top[1] - 10]), ex = c.x - 6, ey = c.y + c.h * f;
	trails += `<path d="M${tx},${ty - 30} C${tx + 160},${ty - 120 + i * 6} ${ex - 220},${ey - 40} ${ex},${ey}" stroke="url(#trail)" stroke-width="${10 - i * 0.6}" fill="none" stroke-linecap="round" filter="url(#tb4)"/>`; });
const hs = scr([L.x, L.y]);
const svg = `<g transform="${T}">${K.ringNightWide({heroX: L.x, heroY: L.y})}${P45W(r.svg)}</g>
<defs><linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#F3E6CF" stop-opacity="0"/><stop offset="1" stop-color="#F3E6CF" stop-opacity=".55"/></linearGradient>${K.blur('tb4', 4)}
<radialGradient id="caseGlow" cx="1580" cy="520" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E6C6" stop-opacity=".22"/><stop offset="1" stop-color="#F6E6C6" stop-opacity="0"/></radialGradient></defs>
<rect width="1920" height="1080" fill="url(#caseGlow)"/>
${trails}
${K.vitrine(CASE1.x, CASE1.y, CASE1.w, CASE1.h, ['牛', '虎', '猴', '猪'], '保利艺术博物馆 ×4', {size: 96, plinth: 92, fs: 48, face: -1})}
${K.vitrine(CASE2.x, CASE2.y, CASE2.w, CASE2.h, ['鼠', '兔'], '国家博物馆 ×2', {size: 120, plinth: 92, fs: 48, face: -1})}
<radialGradient id="vig" cx="${hs[0]}" cy="${hs[1] + 20}" r="1200" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".52"/></radialGradient>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
function P45W(s) { return s.replaceAll('x="-100" y="-100" width="2120" height="1280"', 'x="-1200" y="-1200" width="4400" height="3600"'); }   // rim filters sized for the wide set
K.page(svg, K.hud4({sub: '可住回圆明园的，[只有一个]。', stamp: {s1: '圆明园 · 十二兽首', s2: '海晏堂 · 水力钟'}, rows: [['回国', '7/12', 'rrrrddydrddr'], ['回园', '1/12', 'eeeeeeyeeeee']]}), K.CSS4 + '.era{display:none}');

// L3 铜壁 · key D6a 「这一次，锤子[没有落下]。」 — 2007 Hong Kong, the room BEFORE the sale, cast in the wall: empty chairs with
// catalogues, the gavel lying still on its block, the lot board 撤拍, a porter in white gloves. You alone are in the round,
// on your pedestal under the raking lamp, at true scale (≈ ¼ of the porter's height).
const pTop = 990 - 760 / 1.75 * 1.0;
const hero = {x: 1000, y: pTop + 2, h: 190, curl: 1, glow: 0.9, rim: '#FFE2B8', mood: 'warm'};
const svg = `<defs>
 <filter id="shK" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feColorMatrix type="matrix" values="0 0 0 0 0.03  0 0 0 0 0.02  0 0 0 0 0.01  0 0 0 0.7 0"/><feGaussianBlur stdDeviation="8"/></filter>
 <radialGradient id="cu" cx="990" cy="470" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".22"/><stop offset="1" stop-color="#FF9A5A" stop-opacity="0"/></radialGradient>
</defs>
<image href="__IMG:rel_2007.png__" x="0" y="0" width="1920" height="1080"/>
<rect width="1920" height="1080" fill="url(#cu)" style="mix-blend-mode:screen"/>
<!-- your cast shadow on the wall: the lamp is upper-left, so it falls down-right onto the relief -->
<g transform="translate(40,22)" filter="url(#shK)">${K.horseHead({...hero, glow: 0})}</g>
${K.horseHead(hero)}
`;
K.page(svg, K.hud({sub: '这一次，锤子[没有落下]。', stamp: {s1: '2007 · 香港'}, era: '今', age: {a: '回国', n: 4, post: '/12'}}));

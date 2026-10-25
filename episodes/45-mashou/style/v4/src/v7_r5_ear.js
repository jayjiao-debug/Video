// v7 R5 「只有一只耳朵，是卷的。」 99.09–101.92 s: CASE at 正觉寺, the push has arrived on the ears. Macro on the hero (r5
// casting, hero3.js): the near ear's top third rolled forward over itself, the straight far ear beside it in the same frame,
// raking copper light from the upper left across the poll; the 菱花 lattice of the 文殊亭 soft behind. Counter 回园 1/12.
const s = 1.3, EX = 1010, EY = 330;   // r2: 2.6× macro broke the flat-vector ear (read as a bird); 1.3× keeps the eye + both ears   // ear tip (local 712, 40) lands at (EX, EY)
const hero = {x: EX + (836 - 712) * s, y: EY + (950 - 40) * s, h: 925 * s, curl: 1, glow: 0.7, key: 1.9, mood: 'warm', refl: '#C9C2B0', base: 'cut'};
let lat = ''; for (let i = -40; i < 80; i++) lat += `M${i * 40},0 l${620},1080 M${i * 40},0 l${-620},1080 `;
const svg = `<defs>
 <radialGradient id="bg" cx="760" cy="300" r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7A4A2C"/><stop offset=".45" stop-color="#4A2A18"/><stop offset="1" stop-color="#1E120C"/></radialGradient>
 <radialGradient id="rake" cx="520" cy="120" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFC890" stop-opacity=".35"/><stop offset="1" stop-color="#FFC890" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="1000" cy="520" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0605" stop-opacity="0"/><stop offset="1" stop-color="#0A0605" stop-opacity=".7"/></radialGradient>
 ${K.blur('lb', 9)}
</defs>
<rect width="1920" height="1080" fill="url(#bg)"/>
<g filter="url(#lb)" opacity=".35"><path d="${lat}" stroke="#24140C" stroke-width="10"/></g>
<rect width="1920" height="1080" fill="url(#rake)"/>
${window.NOHERO ? '' : K.horseHead(hero)}
<!-- r2: the scroll end of the rolled tip (a spiral where the ear's top folds forward and under), so the roll reads at this size -->
<path d="${(() => { const c = [948, 318]; let d = ''; for (let k = 0; k <= 40; k++) { const t = k / 40, a = Math.PI * 0.9 + t * Math.PI * 3.2, r = 30 * (1 - 0.82 * t); d += (k ? ' L' : 'M') + (c[0] + Math.cos(a) * r).toFixed(1) + ',' + (c[1] + Math.sin(a) * r * 0.9).toFixed(1); } return d; })()}" stroke="#E8945A" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".95"/>
<!-- indicate: a thin copper ring drawn round the rolled ear (Indicate beat), the far ear left plain for comparison -->
<ellipse cx="1012" cy="322" rx="15" ry="8" fill="#603B24"/><!-- r2: the curl's point specular reads as an eye at this size; toned down for this shot only -->
<ellipse cx="${EX - 18}" cy="${EY + 72}" rx="92" ry="138" fill="none" stroke="#FFB070" stroke-width="5" stroke-dasharray="18 12" opacity=".9"/>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '只有一只耳朵，是卷的。', stamp: {s1: '圆明园 · 正觉寺', s2: '马首 · 近处这只耳朵'}, era: '当代', rows: [['回园', '1/12', 'eeeeeeyeeeee']]}), K.CSS4);

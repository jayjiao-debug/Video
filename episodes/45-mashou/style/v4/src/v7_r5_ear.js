// v7 R5 「只有一只耳朵，是卷的。」 98.99–101.81 s (lines_v7s): CASE at 正觉寺, the push has arrived on the ears. Macro on the hero
// (hero3.js r6 ear, o.earDetail): the near ear is a thick leaf whose top third is folded forward and down over its own cup (a
// dog-ear), the fold's bend a lit band, two shallow flats on the flap; the straight far ear beside it in the same frame. Raking
// copper key from the upper left; the 菱花 lattice of the 文殊亭 soft behind. No ring, no spiral, no dot: the light does the
// pointing (a slow key sweep across the flap in motion). The counter steps out for the macro (R4–R6; it would sit on the eye)
// and returns on K2.
const s = 2.6, EX = 1130, EY = 176;   // ear tip (local 712, 40) lands at (EX, EY): both ears fill the upper right; the eye sits low-left
const hero = {x: EX + (836 - 712) * s, y: EY + (950 - 40) * s, h: 925 * s, curl: 1, glow: 0.7, key: 1.9, mood: 'warm', refl: '#C9C2B0', base: 'cut', earDetail: true, rimK: 0.45};
let lat = ''; for (let i = -40; i < 80; i++) lat += `M${i * 40},0 l${620},1080 M${i * 40},0 l${-620},1080 `;
const svg = `<defs>
 <radialGradient id="bg" cx="900" cy="260" r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7A4A2C"/><stop offset=".45" stop-color="#4A2A18"/><stop offset="1" stop-color="#1E120C"/></radialGradient>
 <radialGradient id="rake" cx="760" cy="80" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFC890" stop-opacity=".38"/><stop offset="1" stop-color="#FFC890" stop-opacity="0"/></radialGradient>
 <radialGradient id="earKey" cx="${EX - 20}" cy="${EY + 120}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD6A0" stop-opacity=".22"/><stop offset="1" stop-color="#FFD6A0" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="1060" cy="460" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0605" stop-opacity="0"/><stop offset="1" stop-color="#0A0605" stop-opacity=".72"/></radialGradient>
 ${K.blur('lb', 9)}
</defs>
<rect width="1920" height="1080" fill="url(#bg)"/>
<g filter="url(#lb)" opacity=".35"><path d="${lat}" stroke="#24140C" stroke-width="10"/></g>
<rect width="1920" height="1080" fill="url(#rake)"/>
<rect width="1920" height="1080" fill="url(#earKey)"/>
${window.NOHERO ? '' : K.horseHead(hero)}
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '只有一只耳朵，是卷的。', stamp: {s1: '圆明园 · 正觉寺', s2: '马首 · 近处这只耳朵'}, era: '当代'}), K.CSS4);

// v7 H1 「圆明园十二兽首，你猜回来了几个？」 frame 0 (0.00 s, the push-in already moving): RING at night.
// v8 (owner note): the twelve as a zodiac clock around the moonlit pool, all at one scale, each on its own seat with air
// around it; the copper horse at six o'clock, front-centre, the only lit head (rim, its glow, a pool of light on its seat, a
// copper streak in the water); the eleven dark with a cool moon rim. A vignette centred on the horse pulls the eye to it.
// Counter 「回来了 ?/12」 (digit rolling), stamp 「圆明园 · 十二兽首」.
const pos = K.ringPos(), L = K.ringHeroLight(pos);
const r = K.ring(pos, {马: 'hero'});
const svg = `${K.ringNight({heroX: L.x, heroY: L.y})}
${r.svg}
<radialGradient id="vig" cx="${L.x}" cy="${L.y + 20}" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".52"/></radialGradient>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '圆明园十二兽首，你猜回来了几个？', stamp: {s1: '圆明园 · 十二兽首', s2: '海晏堂 · 水力钟'}, rows: [['回来了', '?/12', 'eeeeeeyeeeee']]}), K.CSS4 + '.era{display:none}');

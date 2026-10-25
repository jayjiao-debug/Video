// v7 H1 「圆明园十二兽首，你猜回来了几个？」 frame 0 (0.00 s, the push-in already moving): RING at night.
// Twelve heads on two arcs of robed stone seats around the moonlit pool; eleven dark patina with a cool moon rim; the copper
// horse (near arc, centre-right) lit and glowing. Counter 「回来了 ?/12」 (digit rolling), stamp 「圆明园 · 十二兽首」.
const pos = K.ringPos();
const hp = pos.find((p) => p.k === '马');
const r = K.ring(pos, {马: 'hero'}, {heroK: 1.15});
const svg = `${K.ringNight({heroX: hp.x - 40, heroY: hp.y - 260})}
${r.svg}
<radialGradient id="vig" cx="960" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".6"/></radialGradient>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '圆明园十二兽首，你猜回来了几个？', stamp: {s1: '圆明园 · 十二兽首', s2: '海晏堂 · 水力钟'}, rows: [['回来了', '?/12', 'eeeeeeyeeeee']]}), K.CSS4 + '.era{display:none}');

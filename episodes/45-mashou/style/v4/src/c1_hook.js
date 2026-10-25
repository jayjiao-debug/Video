// C1 「假如说，你是圆明园的马首。」 frame ≈1.6 s (just after the desk lamp clicks on at b0 = 1.45): you fill the frame in Ho's
// room at night, 2007, on the exhibit's black marble block (r3: the block replaces the collar ring; the desk shows in the b1 pull-back).
// Layers: night window with harbour lights (far left) · panelled wall + the lamp's warm-ivory pool (mid) · you (r3 hero, dark patina,
// copper rim, near ear rolled) facing the window · the marble block running out of frame (near). Ho's chair edge soft at far right.
const rnd = K.rnd;
const hero = {x: 1270, y: 925, h: 770, curl: 1, glow: 0.95, key: 1.2, mood: 'warm', refl: '#B9CBC8', base: 'block', block: {w: 560, h: 420}};
const svg = `<defs>
 <linearGradient id="wall" x1="0" x2="1"><stop offset="0" stop-color="#48382D"/><stop offset=".5" stop-color="#6A5240"/><stop offset="1" stop-color="#7E6249"/></linearGradient>
 <linearGradient id="night" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22343A"/><stop offset=".6" stop-color="#34494C"/><stop offset="1" stop-color="#4C5A55"/></linearGradient>
 <radialGradient id="pool" cx="1560" cy="280" r="980" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6DDB0" stop-opacity=".7"/><stop offset=".45" stop-color="#E8B884" stop-opacity=".22"/><stop offset="1" stop-color="#E8B884" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="1100" cy="560" r="1250" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#120B08" stop-opacity="0"/><stop offset="1" stop-color="#120B08" stop-opacity=".7"/></radialGradient>
 <linearGradient id="floorfall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1A120D" stop-opacity="0"/><stop offset="1" stop-color="#1A120D" stop-opacity=".55"/></linearGradient>
 ${K.blur('b6', 6)}${K.blur('b14', 14)}${K.blur('b30', 30)}
</defs>
<rect width="1920" height="1080" fill="url(#wall)"/>
<!-- the window (left): night harbour, far lights soft (defocused), mullions -->
<rect x="0" y="120" width="560" height="890" fill="url(#night)"/>
<g filter="url(#b6)">${Array.from({length: 70}, (_, i) => `<circle cx="${rnd(i) * 560}" cy="${560 + rnd(i + 9) * 240}" r="${3 + rnd(i + 3) * 7}" fill="${rnd(i + 5) > 0.7 ? '#E9C994' : '#9FB4B0'}" opacity="${0.35 + rnd(i + 7) * 0.45}"/>`).join('')}
 <rect x="0" y="700" width="560" height="180" fill="#2A3436" opacity=".6"/></g>
<rect x="268" y="120" width="22" height="760" fill="#2A1E17"/><rect x="0" y="480" width="560" height="18" fill="#2A1E17"/>
<rect x="540" y="100" width="40" height="980" fill="#2A1E17"/><rect x="0" y="100" width="580" height="24" fill="#2A1E17"/>
<rect x="0" y="1006" width="560" height="74" fill="#2A1E17"/>
<!-- wall panels -->
${[700, 1180, 1660].map((x) => `<rect x="${x}" y="150" width="400" height="560" rx="6" fill="none" stroke="#7A5C44" stroke-width="3" opacity=".45"/>`).join('')}
<rect width="1920" height="1080" fill="url(#pool)"/>
<rect y="760" width="1920" height="320" fill="url(#floorfall)"/>
<!-- the desk lamp at far right: brass stem + shade edge, its pool -->
<path d="M1700,0 L1920,0 L1920,250 C1860,236 1760,236 1700,250 Z" fill="#3A2A1E"/>
<path d="M1700,250 C1760,236 1860,236 1920,250" stroke="#FFF0D0" stroke-width="5" opacity=".85"/>
<ellipse cx="1810" cy="262" rx="120" ry="22" fill="#FFF3DA" opacity=".55" filter="url(#b14)"/>
<!-- Ho's chair back, soft (far right, defocused) -->
<path d="M1660,420 C1670,360 1780,350 1820,380 L1850,1080 L1670,1080 Z" fill="#1F1611" opacity=".85" filter="url(#b14)"/>
${window.NOHERO ? "" : K.horseHead(hero)}
<!-- the lamp's light on the block's top edge -->
<rect width="1920" height="1080" fill="url(#vig)"/>
${Array.from({length: 22}, (_, i) => `<circle cx="${700 + rnd(i + 40) * 900}" cy="${200 + rnd(i + 41) * 600}" r="${1 + rnd(i + 42) * 2}" fill="#FFE0B0" opacity="${0.2 + rnd(i + 43) * 0.35}"/>`).join('')}`;
K.page(svg, K.hud4({sub: '假如说，你是圆明园的马首。', stamp: {s1: '2007 · 香港', s2: '圆明园流失文物'}}), K.CSS4 + '.blk{display:none}');

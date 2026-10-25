// C1 「假如说，你是圆明园的马首。」 frame ≈1.6 s (just after the desk lamp clicks on at b0 = 1.45): you fill the frame on Ho's
// desk at night, 2007. Layers: night window with harbour lights (far) · panelled wall + the lamp's warm-ivory pool (mid) ·
// you (hero, copper, near ear folded) · polished desk top with your reflection (near). Ho's chair edge soft at far right.
const rnd = K.rnd;
const hero = {x: 1190, y: 1150, h: 940, curl: 1, glow: 1.1, mood: 'warm', rim: '#FFE2B8', rimAmt: 0.6};
const svg = `<defs>
 <linearGradient id="wall" x1="0" x2="1"><stop offset="0" stop-color="#3B2E26"/><stop offset=".55" stop-color="#5A4536"/><stop offset="1" stop-color="#6E5440"/></linearGradient>
 <linearGradient id="night" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22343A"/><stop offset=".6" stop-color="#34494C"/><stop offset="1" stop-color="#4C5A55"/></linearGradient>
 <linearGradient id="desk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A3020"/><stop offset="1" stop-color="#1E140E"/></linearGradient>
 <radialGradient id="pool" cx="1560" cy="300" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6DDB0" stop-opacity=".55"/><stop offset=".45" stop-color="#E8B884" stop-opacity=".18"/><stop offset="1" stop-color="#E8B884" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="1100" cy="560" r="1200" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#120B08" stop-opacity="0"/><stop offset="1" stop-color="#120B08" stop-opacity=".75"/></radialGradient>
 ${K.blur('b6', 6)}${K.blur('b14', 14)}${K.blur('b30', 30)}
</defs>
<rect width="1920" height="1080" fill="url(#wall)"/>
<!-- the window (left): night harbour, far lights soft (defocused), mullions -->
<rect x="0" y="120" width="560" height="760" fill="url(#night)"/>
<g filter="url(#b6)">${Array.from({length: 70}, (_, i) => `<circle cx="${rnd(i) * 560}" cy="${560 + rnd(i + 9) * 240}" r="${3 + rnd(i + 3) * 7}" fill="${rnd(i + 5) > 0.7 ? '#E9C994' : '#9FB4B0'}" opacity="${0.35 + rnd(i + 7) * 0.45}"/>`).join('')}
 <rect x="0" y="700" width="560" height="180" fill="#2A3436" opacity=".6"/></g>
<rect x="268" y="120" width="22" height="760" fill="#2A1E17"/><rect x="0" y="480" width="560" height="18" fill="#2A1E17"/>
<rect x="540" y="100" width="40" height="800" fill="#2A1E17"/><rect x="0" y="100" width="580" height="24" fill="#2A1E17"/>
<!-- wall panels -->
${[700, 1180, 1660].map((x) => `<rect x="${x}" y="150" width="400" height="560" rx="6" fill="none" stroke="#7A5C44" stroke-width="3" opacity=".45"/>`).join('')}
<rect width="1920" height="1080" fill="url(#pool)"/>
<!-- the desk lamp at far right: brass stem + shade edge, its pool -->
<path d="M1700,0 L1920,0 L1920,250 C1860,236 1760,236 1700,250 Z" fill="#3A2A1E"/>
<path d="M1700,250 C1760,236 1860,236 1920,250" stroke="#FFF0D0" stroke-width="5" opacity=".85"/>
<ellipse cx="1810" cy="262" rx="120" ry="22" fill="#FFF3DA" opacity=".55" filter="url(#b14)"/>
<!-- Ho's chair back, soft (far right, defocused) -->
<path d="M1640,420 C1650,360 1760,350 1800,380 L1830,900 L1650,900 Z" fill="#1F1611" opacity=".85" filter="url(#b14)"/>
<!-- desk top -->
<rect x="0" y="880" width="1920" height="200" fill="url(#desk)"/>
<path d="M0,880 L1920,880" stroke="#C88A5A" stroke-width="2" opacity=".5"/>
<!-- your reflection in the lacquer -->
<g opacity=".28" filter="url(#b14)" transform="translate(0,1760) scale(1,-1)"><ellipse cx="900" cy="880" rx="420" ry="80" fill="#E8874A"/></g>
<ellipse cx="1050" cy="905" rx="520" ry="40" fill="#FF9A5A" opacity=".25" filter="url(#b30)"/>
${K.horseHead(hero)}
<rect width="1920" height="1080" fill="url(#vig)"/>
${Array.from({length: 22}, (_, i) => `<circle cx="${700 + rnd(i + 40) * 900}" cy="${200 + rnd(i + 41) * 600}" r="${1 + rnd(i + 42) * 2}" fill="#FFE0B0" opacity="${0.2 + rnd(i + 43) * 0.35}"/>`).join('')}`;
K.page(svg, K.hud4({sub: '假如说，你是圆明园的马首。', stamp: '2007 · 香港'}), K.CSS4 + '.blk{display:none}');

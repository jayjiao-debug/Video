// E2a 「2020年5月，何鸿燊去世，98岁。」 frame at the stop (107.87 s + 3 frames): Ho's room from D7a, empty. The brass desk
// lamp has just gone out (its filament still a dull ember); the room holds in cool moonlight (mean ≥ 40); his chair empty,
// pushed back from the desk; the star in the window and the curtain are the living motion that carries E2b.
const rnd = K.rnd, S = '#120D0B';
const svg = `<defs>
 <linearGradient id="wall" x1="0" x2="1"><stop offset="0" stop-color="#2E3A3C"/><stop offset=".5" stop-color="#2A3133"/><stop offset="1" stop-color="#1E2224"/></linearGradient>
 <linearGradient id="night" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2C4248"/><stop offset=".7" stop-color="#47605F"/><stop offset="1" stop-color="#5F716A"/></linearGradient>
 <linearGradient id="moon" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#9FB8B6" stop-opacity=".34"/><stop offset="1" stop-color="#9FB8B6" stop-opacity="0"/></linearGradient>
 <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2E3434"/><stop offset="1" stop-color="#161A1B"/></linearGradient>
 <radialGradient id="ember" cx="1236" cy="398" r="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A50" stop-opacity=".9"/><stop offset=".3" stop-color="#C8582A" stop-opacity=".35"/><stop offset="1" stop-color="#C8582A" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#080A0B" stop-opacity="0"/><stop offset="1" stop-color="#080A0B" stop-opacity=".7"/></radialGradient>
 ${K.blur('b3', 3)}${K.blur('b10', 10)}${K.blur('b24', 24)}
</defs>
<rect width="1920" height="1080" fill="url(#wall)"/>
<!-- the window (left of centre): night sky, far city haze, one star; the curtain at its right edge -->
<rect x="420" y="170" width="480" height="560" fill="url(#night)"/>
<g filter="url(#b10)">${Array.from({length: 40}, (_, i) => `<circle cx="${420 + rnd(i) * 480}" cy="${600 + rnd(i + 9) * 120}" r="${3 + rnd(i + 3) * 6}" fill="#B9C7C2" opacity="${0.2 + rnd(i + 7) * 0.3}"/>`).join('')}</g>
<circle cx="560" cy="300" r="4" fill="#F4F6EE"/><circle cx="560" cy="300" r="16" fill="#E8F0EA" opacity=".25" filter="url(#b3)"/>
<path d="M556,300 L564,300 M560,286 L560,314" stroke="#F4F6EE" stroke-width="1.5" opacity=".7"/>
<rect x="652" y="170" width="16" height="560" fill="#1E2526"/><rect x="420" y="430" width="480" height="14" fill="#1E2526"/>
<rect x="400" y="150" width="520" height="22" fill="#1A2021"/><rect x="400" y="728" width="520" height="26" fill="#2A3233"/>
<path d="M880,150 C900,300 860,480 910,760 L1000,760 C960,520 990,320 960,150 Z" fill="#3A4446"/><path d="M890,160 C906,300 872,480 918,750" stroke="#6E8280" stroke-width="3" fill="none" opacity=".5"/>
<!-- moonlight falling across the room -->
<path d="M420,170 L900,170 L1500,1080 L700,1080 Z" fill="url(#moon)"/>
<rect x="0" y="830" width="1920" height="250" fill="url(#floor)"/>
<path d="M700,1080 L760,830 L1160,830 L1500,1080 Z" fill="#9FB8B6" opacity=".1"/>
<!-- the desk (side-on), the brass lamp just out, papers; the empty chair pushed back -->
<path d="M1020,600 L1640,600 L1640,620 L1020,620 Z" fill="#2A2420"/><path d="M1020,600 L1640,600" stroke="#8FA6A2" stroke-width="2" opacity=".6"/>
<rect x="1040" y="620" width="30" height="210" fill="${S}"/><rect x="1580" y="620" width="30" height="210" fill="${S}"/><rect x="1380" y="620" width="230" height="160" fill="#18120F"/>
<path d="M1100,594 L1230,590 L1236,598 L1104,600 Z" fill="#AFC2BE" opacity=".55"/>
<ellipse cx="1256" cy="596" rx="46" ry="9" fill="#6E5432"/><ellipse cx="1256" cy="592" rx="46" ry="9" fill="#9A7A4A"/><path d="M1212,592 C1230,586 1280,586 1300,592" stroke="#D7C08C" stroke-width="2" opacity=".55"/>
<path d="M1256,590 L1256,470 C1256,440 1250,420 1240,404" stroke="#9A7A4A" stroke-width="9" fill="none"/><path d="M1252,590 L1252,470" stroke="#D7C08C" stroke-width="2" opacity=".5"/>
<path d="M1180,352 L1292,352 L1312,404 L1160,404 Z" fill="#4A4232"/><path d="M1180,352 L1292,352 L1312,404 L1160,404 Z" fill="none" stroke="#B89A62" stroke-width="3" opacity=".8"/><path d="M1184,356 L1206,356 L1188,400 L1166,400 Z" fill="#8FA6A2" opacity=".25"/><ellipse cx="1236" cy="404" rx="76" ry="7" fill="#2A2018"/>
<rect width="1920" height="1080" fill="url(#ember)"/><ellipse cx="1236" cy="402" rx="12" ry="4" fill="#E07A3A"/>
<g fill="${S}" transform="translate(-10,80)"><path d="M1720,380 C1712,350 1760,340 1790,356 L1800,640 L1780,640 L1772,420 Z"/><rect x="1660" y="628" width="190" height="22"/><rect x="1670" y="650" width="16" height="100"/><rect x="1824" y="650" width="16" height="100"/></g>
<path transform="translate(-10,80)" d="M1722,384 C1716,356 1758,346 1786,360" stroke="#7E9692" stroke-width="2.5" fill="none" opacity=".6"/>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '2020年5月，何鸿燊去世，98岁。', stamp: '2020.5.26 · 香港', era: '当代', rows: [['回国', '7/12', 'rrreeeyereer'.split('').map((c, i) => [0, 1, 2, 3, 8, 11].includes(i) ? 'r' : i === 6 ? 'y' : 'e').join('')]]}), K.CSS4);

// H1b 「你回到了圆明园。」 at the end of the drop's push (118.87 → ≈119.4, 1.00 → 1.12): low and close on the 文殊亭's centre bay.
// The 隔扇 doors (菱花 lattice) have swung inward; two staff inside, each in profile pushing his leaf home (r3, note 2a: built on the
// film rig — staff45.ts, checked by staff_check.mjs — near arm from the shoulder to the leaf's free edge, far arm lower and mostly
// hidden, front knee bent, rear leg back, both soles on the floor). You stand on the exhibit's black marble block at the threshold;
// r3 (note 2b): the hall's back wall falls off to ≤ 110 around you and your lit face is the brightest thing there; your copper
// spill runs down the steps to the lens, lights the eave's underside (rafters, 翼角) and the pines' needle edges.
const rnd = K.rnd, S = '#140D0A';
// r4 (gate 2b r3 n4, staging): the plinth stands INSIDE the hall, on its floor (base y 860, behind the staff's floor line 872),
// 180 px wide and centred on the doorway (x 975); the staff flank it at their leaves and the doors open onto you.
const HS = 176 / 925, PLINTH = {cx: 975, base: 860, top: 505, w: 180};
const hero = {x: PLINTH.cx - (922 - 836) * HS, y: PLINTH.top, h: 176, curl: 1, glow: 0.25, key: 2.7, mood: 'warm', refl: '#C9C2B0', base: 'block', block: {w: PLINTH.w / HS, h: (PLINTH.base - PLINTH.top) / HS}};
// a profile figure walking a door leaf back: faces f, both hands on the leaf edge at (ex, ey..ey+dy)
const staff = (o) => window.STAFF45({...o, col: S, rim: '#FFB070'}).svg;
const lingHua = (x, y, w, hh, col, id) => { let d = ''; for (let i = -hh; i < w + hh; i += 26) d += `M${x + i},${y} l${hh * 0.58},${hh} M${x + i},${y} l${-hh * 0.58},${hh} `;
	return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${hh}"/></clipPath><g clip-path="url(#${id})"><path d="${d}" stroke="${col}" stroke-width="5"/></g>`; };
// a 隔扇 leaf seen frontal (side bays) : frame, 菱花 lattice top, 裙板 bottom
const geshan = (x, y, w, hh, k, lit) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#3E281A"/>
	<rect x="${x + 10}" y="${y + 12}" width="${w - 20}" height="${hh * 0.58}" fill="${lit ? '#94592F' : '#3A2418'}"/>${lingHua(x + 10, y + 12, w - 20, hh * 0.58, '#24150E', 'lh' + k)}
	<rect x="${x + 10}" y="${y + hh * 0.66}" width="${w - 20}" height="${hh * 0.12}" fill="#24150E" stroke="#5A3A26" stroke-width="2"/>
	<rect x="${x + 10}" y="${y + hh * 0.8}" width="${w - 20}" height="${hh * 0.16}" fill="#24150E" stroke="#5A3A26" stroke-width="2"/>
	<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="none" stroke="#C8783E" stroke-width="2" opacity="${lit ? 0.6 : 0.25}"/>`;
const pad = (cx, cy, rx, ry, i) => { let d = `M${cx - rx},${cy}`; const n = 14;
	for (let k = 0; k <= n; k++) { const a = Math.PI + Math.PI * k / n, r = 1 + 0.12 * Math.sin(k * 2.7 + i); d += ` L${cx + Math.cos(a) * rx * r},${cy + Math.sin(a) * ry * r * 1.25}`; }
	d += ` C${cx + rx * 0.6},${cy + ry * 0.5} ${cx - rx * 0.6},${cy + ry * 0.5} ${cx - rx},${cy} Z`;
	let tufts = ''; for (let k = 0; k < 9; k++) { const a = Math.PI * (1.08 + 0.84 * k / 8), px = cx + Math.cos(a) * rx * 0.95, py = cy + Math.sin(a) * ry * 1.15; tufts += `M${px},${py} l${-6 + 12 * rnd(k + i)},${-10 - 8 * rnd(k + i + 3)} `; }
	return {d, tufts}; };
const pine = (x, y, sc, f, i0) => { let s = `<path d="M${x},${y} C${x + f * 30 * sc},${y - 140 * sc} ${x - f * 40 * sc},${y - 260 * sc} ${x + f * 20 * sc},${y - 420 * sc} M${x + f * 4 * sc},${y - 220 * sc} C${x + f * 80 * sc},${y - 250 * sc} ${x + f * 150 * sc},${y - 260 * sc} ${x + f * 220 * sc},${y - 300 * sc}" stroke="${S}" stroke-width="${18 * sc}" fill="none" stroke-linecap="round"/>`;
	[[0, -420, 150, 46], [f * 210, -300, 140, 40], [f * -70, -320, 120, 36], [f * 90, -190, 130, 38], [f * -40, -500, 100, 30]].forEach(([dx, dy, rx, ry], k) => { const p = pad(x + dx * sc, y + dy * sc, rx * sc, ry * sc, k + i0);
		s += `<path d="${p.d}" fill="${S}"/><path d="${p.tufts}" stroke="${S}" stroke-width="${4 * sc}"/><path d="${p.d.split(' C')[0]}" fill="none" stroke="#E8945A" stroke-width="${3 * sc}" opacity=".7"/>`; });
	return s; };
const svg = `<defs>
 <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2E4046"/><stop offset="1" stop-color="#5A6866"/></linearGradient>
 <radialGradient id="inner" cx="975" cy="1010" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F4A864"/><stop offset=".28" stop-color="#B05A2C"/><stop offset=".58" stop-color="#4E2412"/><stop offset="1" stop-color="#2A1209"/></radialGradient>
 <radialGradient id="youLight" cx="900" cy="560" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity=".16"/><stop offset="1" stop-color="#FFB070" stop-opacity="0"/></radialGradient>
 <linearGradient id="spill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFB070" stop-opacity=".9"/><stop offset=".5" stop-color="#E8874A" stop-opacity=".72"/><stop offset="1" stop-color="#E8874A" stop-opacity=".55"/></linearGradient>
 <linearGradient id="flag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6E6050"/><stop offset="1" stop-color="#40362E"/></linearGradient>
 <linearGradient id="eave" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#26180F"/><stop offset="1" stop-color="#6A3E22"/></linearGradient>
 <radialGradient id="halo" cx="975" cy="560" r="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".6"/><stop offset=".55" stop-color="#C8682F" stop-opacity=".14"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="975" cy="600" r="1200" gradientUnits="userSpaceOnUse"><stop offset=".6" stop-color="#070605" stop-opacity="0"/><stop offset="1" stop-color="#070605" stop-opacity=".42"/></radialGradient>
 ${K.rimFilter('rimS', 5, 0, '#FFB070', 1, 1.4)}${K.rimFilter('rimS2', -5, 0, '#FFB070', 1, 1.4)}
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
${Array.from({length: 30}, (_, i) => `<circle cx="${rnd(i) * 1920}" cy="${150 + rnd(i + 5) * 200}" r="${0.8 + rnd(i + 2) * 1.2}" fill="#DDE6E2" opacity="${0.2 + rnd(i + 3) * 0.4}"/>`).join('')}
<!-- the hall front: columns, side-bay 隔扇 doors, the open centre bay -->
<rect x="250" y="150" width="1450" height="790" fill="#6E4830"/><rect width="1920" height="1080" fill="url(#halo)"/>
${[[310, 0], [480, 1], [1460, 2], [1620, 3]].map(([x, k]) => geshan(x - 10, 190, 150, 730, k, true)).join('')}
<rect x="640" y="150" width="34" height="790" fill="#3A2216"/><rect x="1276" y="150" width="34" height="790" fill="#3A2216"/>
<path d="M674,150 L674,940 M1276,150 L1276,940" stroke="#FFB070" stroke-width="3" opacity=".8"/>
<!-- inside the open bay: your light; the leaves swung inward (foreshortened), the staff walking them back -->
<rect x="674" y="190" width="602" height="750" fill="url(#inner)"/>
<path d="M674,190 L740,226 L740,888 L674,940 Z" fill="#3A2216"/>${lingHua(682, 244, 50, 330, '#24150E', 'lhL')}<path d="M740,226 L740,888" stroke="#FFC890" stroke-width="3"/>
<path d="M1276,190 L1210,226 L1210,888 L1276,940 Z" fill="#3A2216"/>${lingHua(1218, 244, 50, 330, '#24150E', 'lhR')}<path d="M1210,226 L1210,888" stroke="#FFC890" stroke-width="3"/>
<rect x="674" y="880" width="602" height="60" fill="#6A3A20" opacity=".6"/>
<rect x="674" y="190" width="602" height="750" fill="url(#youLight)"/>
<!-- you on the exhibit plinth inside the hall (behind the staff's floor line), then the staff in front of it -->
${window.NOHERO ? '' : K.horseHead(hero)}
${staff(window.H1B_STAFF.left)}${staff(window.H1B_STAFF.right)}
<!-- the eave: the lower eave's underside across the top, lit rafters, an upturned 翼角 at each end -->
<path d="M0,0 L1920,0 L1920,96 C1700,118 1400,134 975,138 C550,134 250,118 0,96 Z" fill="url(#eave)"/>
${Array.from({length: 34}, (_, i) => { const x = 40 + i * 56, y = 98 + 38 * Math.sin(Math.PI * (x / 1950)); return `<rect x="${x}" y="${y - 30}" width="20" height="30" fill="#3A2216"/><rect x="${x}" y="${y - 6}" width="20" height="6" fill="#E8945A" opacity="${0.35 + 0.45 * Math.exp(-Math.pow((x - 975) / 520, 2))}"/>`; }).join('')}
<path d="M0,96 C250,118 550,134 975,138 C1400,134 1700,118 1920,96" stroke="#E8945A" stroke-width="3" opacity=".6"/>
<path d="M0,40 C40,70 70,90 60,40 L90,0 L0,0 Z" fill="#120B08"/><path d="M1920,40 C1880,70 1850,90 1860,40 L1830,0 L1920,0 Z" fill="#120B08"/>
<!-- steps, terrace, flagstones; the spill running to the lens -->
<rect x="200" y="940" width="1520" height="30" fill="#5A4636"/><rect x="150" y="970" width="1620" height="30" fill="#4A3A2E"/>
<path d="M0,1000 L1920,1000 L1920,1080 L0,1080 Z" fill="url(#flag)"/>
<path d="M674,940 L1276,940 L1700,1080 L250,1080 Z" fill="url(#spill)"/>
<path d="M674,940 L1276,940 L1290,970 L660,970 Z" fill="#FFB070" opacity=".4"/>
${pine(40, 1080, 1.15, 1, 0)}${pine(1890, 1080, 1.1, -1, 7)}
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '你回到了圆明园。', stamp: {s1: '2020.12.1 · 圆明园', s2: '正觉寺 · 文殊亭'}, era: '当代', rows: [['回国', '7/12', 'rrrreeyereer'.split('').map((c, i) => [0, 1, 2, 3, 8, 11].includes(i) ? 'r' : i === 6 ? 'y' : 'e').join('')]]}), K.CSS4);

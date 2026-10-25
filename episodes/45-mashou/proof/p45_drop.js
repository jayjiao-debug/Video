// ep45 proof 3: the drop, 85.2 – 92.0 s. E4's last two seconds on the ROAD (the van drives LEFT, night → blue hour, copper
// leaking from its slats; pickup b148: headlights flare + the 圆明园 gate enters left; b151: the van stops, its rear doors crack a
// vertical copper slit; push 1.00 → 1.12 so the slit sits on x 975) → HARD CUT on 87.17 (mode 1, light-matched: the slit and
// the 正觉寺 doorway on one vertical) → COURT R1–R2 (v7_r1_drop.js): the 隔扇 leaves swing in as hinged 3D planes (0.7 s,
// easeOut), the two staff on the film rig take the leaves home, then step aside (walk) out of the light; 「回园 1/12」 punches in
// centred and settles to the corner; the stamp odometer 1860 → 2020 on b156; the push to the threshold.
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat;
const CUT = 87.17, PICK = B(148), STOP = B(151), ODO = B(156);
// ------------------------------------------------ ROAD
const V0 = 540;   // van speed in the road plane, px/s (18 px/f); the camera locks on the van, the planes scroll right
const DEC0 = 85.90;
const vel = (t) => (t < DEC0 ? V0 : t < STOP ? V0 * (1 - P.smooth((t - DEC0) / (STOP - DEC0))) : 0);
const dist = (t) => { let d = 0; const a = 82.9, n = Math.max(1, Math.ceil((t - a) * 240)), h = (t - a) / n; for (let i = 0; i < n; i++) d += vel(a + (i + 0.5) * h) * h; return d; };
const D_PICK = dist(PICK), D_STOP = dist(STOP);
const camRoad = P.cam([960, 540, 1.0], [{t0: 86.60, t1: CUT, to: [988, 600, 1.12]}]);
const VAN = {front: 420, rear: 1000, ground: 880};
const SLIT_X = VAN.rear;
const sky = (k) => [P.mixC('#1F3036', '#2A4660', k), P.mixC('#3C5357', '#557790', k), P.mixC('#6F8481', '#93AEBA', k)];
/** the 圆明园 gate (east gate): a gatehouse with a hip-and-gable roof, upturned eaves, a dark central opening, low side walls */
const gate = (cx, g, lit) => {
	const S = '#16120F';
	return `<g>
	<rect x="${cx - 560}" y="${g - 150}" width="1120" height="150" fill="${S}"/><path d="M${cx - 560},${g - 150} L${cx + 560},${g - 150}" stroke="#2A2420" stroke-width="10"/>
	<rect x="${cx - 250}" y="${g - 300}" width="500" height="300" fill="${S}"/>
	<path d="M${cx - 330},${g - 296} C${cx - 290},${g - 312} ${cx - 250},${g - 330} ${cx - 210},${g - 380} L${cx + 210},${g - 380} C${cx + 250},${g - 330} ${cx + 290},${g - 312} ${cx + 330},${g - 296} L${cx + 300},${g - 300} L${cx - 300},${g - 300} Z" fill="${S}"/>
	<path d="M${cx - 230},${g - 380} L${cx - 150},${g - 440} L${cx + 150},${g - 440} L${cx + 230},${g - 380} Z" fill="${S}"/>
	<path d="M${cx - 170},${g - 440} L${cx + 170},${g - 440}" stroke="${S}" stroke-width="14"/><path d="M${cx - 176},${g - 448} l-14,-26 l26,10 Z M${cx + 176},${g - 448} l14,-26 l-26,10 Z" fill="${S}"/>
	<path d="M${cx - 110},${g} L${cx - 110},${g - 150} C${cx - 110},${g - 215} ${cx + 110},${g - 215} ${cx + 110},${g - 150} L${cx + 110},${g} Z" fill="#0A0807"/>
	${[-200, -150, 150, 200].map((d) => `<rect x="${cx + d - 9}" y="${g - 300}" width="18" height="300" fill="#221B16"/>`).join('')}
	<path d="M${cx + 330},${g - 296} C${cx + 290},${g - 312} ${cx + 250},${g - 330} ${cx + 210},${g - 380} L${cx + 150},${g - 440}" stroke="#F3DDB4" stroke-width="3" fill="none" opacity="${(0.55 * lit).toFixed(3)}"/>
	<path d="M${cx + 250},${g - 296} L${cx + 250},${g}" stroke="#F3DDB4" stroke-width="3" opacity="${(0.45 * lit).toFixed(3)}"/></g>`;
};
const tile = (x, o, W) => ((x + o) % W + W) % W - 300;
const roadWorld = (t) => {
	const d = dist(Math.min(t, CUT)), k = P.seg(t, 82.96, 86.96), [c0, c1, c2] = sky(k);
	const moving = vel(t) / V0, bounce = moving * 1.6 * P.noise(t * 7, 3) + P.jolt(t, STOP, 3, 0.5, 1.5);
	const flare = P.seg(t, PICK, PICK + 0.12) * (1 - 0.35 * P.smooth(P.seg(t, PICK + 0.12, PICK + 0.6)));
	const beam = 0.26 + 0.34 * flare;
	// far tree line (−6, 0.2×), near trees (−2, 0.75×), gate (−1, 0.8×), road dashes (0, 1×), verge (+1, 1.33×)
	let farT = '', nearT = '', dashes = '', verge = '';
	for (let i = 0; i < 46; i++) { const x = tile(i * 60, 0.2 * d, 2760), r = 40 + rnd(i + 3) * 40; farT += `<ellipse cx="${x.toFixed(1)}" cy="${(706 - rnd(i + 7) * 30).toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.7).toFixed(1)}"/>`; }
	for (let i = 0; i < 9; i++) { const x = tile(i * 330 + rnd(i + 20) * 120, 0.75 * d, 2970), h = 260 + rnd(i + 21) * 140, w = 55 + rnd(i + 22) * 40;
		nearT += `<path d="M${(x - 6).toFixed(1)},790 L${(x - 6).toFixed(1)},${790 - h * 0.35} L${(x + 6).toFixed(1)},${790 - h * 0.35} L${(x + 6).toFixed(1)},790 Z"/><ellipse cx="${x.toFixed(1)}" cy="${(790 - h * 0.62).toFixed(1)}" rx="${w.toFixed(1)}" ry="${(h * 0.42).toFixed(1)}"/><ellipse cx="${(x + w * 0.4).toFixed(1)}" cy="${(790 - h * 0.48).toFixed(1)}" rx="${(w * 0.7).toFixed(1)}" ry="${(h * 0.3).toFixed(1)}"/>`; }
	for (let i = 0; i < 14; i++) { const x = tile(i * 200, d, 2800); dashes += `<rect x="${x.toFixed(1)}" y="852" width="90" height="5" fill="#C8C2B0" opacity=".35"/>`; }
	for (let i = 0; i < 18; i++) { const x = tile(i * 170 + rnd(i + 40) * 60, 1.333 * d, 3060), h = 4 + rnd(i + 41) * 22;
		verge += `<path d="M${(x - 80).toFixed(1)},1090 C${(x - 60).toFixed(1)},${(1010 - h * 0.4).toFixed(1)} ${(x - 20).toFixed(1)},${(1000 - h).toFixed(1)} ${x.toFixed(1)},${(1004 - h).toFixed(1)} C${(x + 30).toFixed(1)},${(1000 - h).toFixed(1)} ${(x + 70).toFixed(1)},${(1010 - h * 0.4).toFixed(1)} ${(x + 90).toFixed(1)},1090 Z"/>`
			+ Array.from({length: 4}, (_, j) => `<path d="M${(x - 50 + j * 30).toFixed(1)},${(1006 - h * 0.7).toFixed(1)} l${(-6 + 12 * rnd(i * 4 + j)).toFixed(1)},-18" stroke="#0E0B0A" stroke-width="3"/>`).join(''); }
	const gx = -250 + 0.8 * (d - D_PICK);   // the gatehouse's right eave enters at frame left on the pickup (centre gx − 80)
	const gateSvg = gx > -900 ? gate(gx - 80, 790, flare > 0 ? 0.6 + 0.4 * flare : 0) : '';
	const wheelA = (d / 48) * 180 / Math.PI;
	const wheel = (cx) => `<g transform="translate(${cx},${VAN.ground - 48})"><circle r="48" fill="#0B0807"/><circle r="22" fill="#2A2420"/><g transform="rotate(${(-wheelA).toFixed(1)})">${[0, 72, 144, 216, 288].map((a) => `<rect x="-3" y="-20" width="6" height="16" fill="#4A403A" transform="rotate(${a})"/>`).join('')}</g><circle r="6" fill="#6A5E56"/></g>`;
	// the doors at the rear: from b151 a vertical copper slit opens at the rear edge (the door swings out to the right)
	const op = P.easeOut(P.seg(t, STOP + 0.05, CUT)), slitW = 2 + 14 * op;
	const glow = 0.85 + 0.15 * Math.sin(t * 5.1);
	const by = -bounce;
	const van = `<g transform="translate(0,${by.toFixed(2)})">
		<path d="M${VAN.front},842 L${VAN.front},760 C${VAN.front},740 ${VAN.front + 8},728 ${VAN.front + 22},724 L${VAN.front + 70},650 C${VAN.front + 80},640 ${VAN.front + 90},636 ${VAN.front + 110},636 L600,636 L600,850 L${VAN.front},850 Z" fill="#120D0B"/>
		<path d="M${VAN.front + 78},654 L${VAN.front + 112},652 L${VAN.front + 112},714 L${VAN.front + 40},716 Z" fill="#3A4A52" opacity=".8"/><path d="M${VAN.front + 124},652 L590,652 L590,716 L${VAN.front + 124},716 Z" fill="#33424A" opacity=".75"/>
		<path d="M${VAN.front + 124},652 L590,652" stroke="#9FB8B6" stroke-width="2" opacity=".5"/>
		<rect x="598" y="560" width="${VAN.rear - 598}" height="290" rx="6" fill="#140E0B"/>
		<path d="M600,562 L${VAN.rear - 4},562" stroke="#9FB8B6" stroke-width="3" opacity=".55"/>
		${Array.from({length: 7}, (_, i) => `<rect x="${(700 + 30 * rnd(i + 50)).toFixed(1)}" y="${600 + i * 26}" width="${(190 + 50 * rnd(i + 60)).toFixed(1)}" height="4" rx="2" fill="#FF9A5A" opacity="${(0.8 * glow * (0.6 + 0.4 * rnd(i + 5))).toFixed(3)}"/>`).join('')}
		<path d="M640,566 L640,846 M${VAN.rear - 40},566 L${VAN.rear - 40},846" stroke="#2A1E18" stroke-width="4"/>
		<rect x="690" y="596" width="250" height="186" fill="#FF9A5A" opacity=".10" filter="url(#rb20)"/>
		<path d="M600,850 L${VAN.rear},850 L${VAN.rear},866 L${VAN.front},866 L${VAN.front},850 Z" fill="#0E0A08"/>
		<rect x="${VAN.front - 6}" y="822" width="40" height="22" rx="4" fill="#1A1412"/>
		<ellipse cx="${VAN.front + 4}" cy="782" rx="7" ry="11" fill="#FFF4DC" opacity="${(0.8 + 0.2 * flare).toFixed(3)}"/>
		${op > 0 ? `<rect x="${(SLIT_X - slitW / 2).toFixed(1)}" y="568" width="${slitW.toFixed(2)}" height="278" fill="#FFB070"/><rect x="${(SLIT_X - 1).toFixed(1)}" y="568" width="2" height="278" fill="#FFE6C6" opacity=".9"/>
			<rect x="${(SLIT_X - 40).toFixed(1)}" y="560" width="80" height="300" fill="#FF9A5A" opacity="${(0.35 * op).toFixed(3)}" filter="url(#rb20)"/>
			<path d="M${SLIT_X + slitW / 2},566 L${(SLIT_X + slitW / 2 + 26 * op).toFixed(1)},572 L${(SLIT_X + slitW / 2 + 26 * op).toFixed(1)},842 L${SLIT_X + slitW / 2},848 Z" fill="#1A120E"/>` : ''}
		${wheel(510)}${wheel(890)}</g>`;
	return `<defs>
	 <linearGradient id="rsky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="-200" y2="760"><stop offset="0" stop-color="${c0}"/><stop offset=".6" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
	 <radialGradient id="rcity" cx="1500" cy="740" r="700" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#C8A27A" stop-opacity="${(0.22 - 0.08 * k).toFixed(3)}"/><stop offset="1" stop-color="#C8A27A" stop-opacity="0"/></radialGradient>
	 <linearGradient id="rroad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2E3536"/><stop offset="1" stop-color="#1A1E1F"/></linearGradient>
	 <linearGradient id="rbeam" gradientUnits="userSpaceOnUse" x1="${VAN.front}" x2="-300" y1="0" y2="0"><stop offset="0" stop-color="#F3DDB4" stop-opacity="${beam.toFixed(3)}"/><stop offset="1" stop-color="#F3DDB4" stop-opacity="0"/></linearGradient>
	 <radialGradient id="rspill" cx="${SLIT_X + 60}" cy="880" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity="${(0.45 * op).toFixed(3)}"/><stop offset="1" stop-color="#FF9A5A" stop-opacity="0"/></radialGradient>
	 ${K.blur('rb3', 3)}${K.blur('rb8', 8)}${K.blur('rb20', 20)}${K.rimFilter('rrim', -3, -3, '#B8CCC6', 0.7, 1.2)}
	</defs>
	<rect x="-400" y="-400" width="2720" height="1900" fill="url(#rsky)"/>
	${Array.from({length: 40}, (_, i) => `<circle cx="${(-300 + rnd(i + 3) * 2520 + 0.03 * d).toFixed(1)}" cy="${(-180 + rnd(i + 8) * 560).toFixed(1)}" r="${(0.8 + rnd(i + 5)).toFixed(2)}" fill="#E4EEE8" opacity="${((0.2 + rnd(i + 6) * 0.35) * (1 - 0.6 * k) * (0.8 + 0.2 * Math.sin(t * 3 + i))).toFixed(3)}"/>`).join('')}
	<rect x="-400" y="-400" width="2720" height="1900" fill="url(#rcity)"/>
	<g fill="#22302F" filter="url(#rb3)">${farT}</g><rect x="-400" y="700" width="2720" height="120" fill="#1E2828"/>
	<g fill="#141A1C">${nearT}</g>
	${gateSvg}
	<rect x="-400" y="790" width="2720" height="310" fill="url(#rroad)"/><path d="M-400,790 L2320,790" stroke="#5A6A6A" stroke-width="2" opacity=".5"/>
	${dashes}
	<path d="M${VAN.front},776 L-300,640 L-300,960 L${VAN.front},800 Z" fill="url(#rbeam)" filter="url(#rb8)"/>
	<ellipse cx="${VAN.front - 260}" cy="880" rx="300" ry="26" fill="#F3DDB4" opacity="${(0.12 + 0.12 * flare).toFixed(3)}" filter="url(#rb20)"/>
	<rect x="-400" y="700" width="2720" height="500" fill="url(#rspill)"/>
	<ellipse cx="${(VAN.front + VAN.rear) / 2}" cy="884" rx="320" ry="12" fill="#0A0807" opacity=".75"/>
	<g filter="url(#rrim)">${van}</g>
	<rect x="-400" y="1004" width="2720" height="200" fill="#0E0B0A"/><g fill="#0E0B0A">${verge}</g>`;
};
// ------------------------------------------------ COURT (v7_r1_drop.js set, doors as hinged planes, staff on the film rig)
const S = '#140D0A';
const HS = 176 / 925, PLINTH = {cx: 975, base: 860, top: 505, w: 180};
const lingHua = (x, y, w, hh, col, id) => { let d = ''; for (let i = -hh; i < w + hh; i += 26) d += `M${x + i},${y} l${hh * 0.58},${hh} M${x + i},${y} l${-hh * 0.58},${hh} `;
	return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${hh}"/></clipPath><g clip-path="url(#${id})"><path d="${d}" stroke="${col}" stroke-width="5"/></g>`; };
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
let CB = null;
const courtBase = () => {
	if (CB) return CB;
	CB = {pineL: pine(40, 1080, 1.15, 1, 0), pineR: pine(1890, 1080, 1.1, -1, 7),
		front: `${[[310, 0], [480, 1], [1460, 2], [1620, 3]].map(([x, k]) => geshan(x - 10, 190, 150, 730, k, true)).join('')}`,
		eave: `<path d="M-200,-300 L2120,-300 L2120,96 L1920,96 C1700,118 1400,134 975,138 C550,134 250,118 0,96 L-200,96 Z" fill="url(#eave)"/>
		${Array.from({length: 34}, (_, i) => { const x = 40 + i * 56, y = 98 + 38 * Math.sin(Math.PI * (x / 1950)); return `<rect x="${x}" y="${y - 30}" width="20" height="30" fill="#3A2216"/><rect x="${x}" y="${y - 6}" width="20" height="6" fill="#E8945A" opacity="${0.35 + 0.45 * Math.exp(-Math.pow((x - 975) / 520, 2))}"/>`; }).join('')}
		<path d="M0,96 C250,118 550,134 975,138 C1400,134 1700,118 1920,96" stroke="#E8945A" stroke-width="3" opacity=".6"/>
		<path d="M0,40 C40,70 70,90 60,40 L90,0 L0,0 Z" fill="#120B08"/><path d="M1920,40 C1880,70 1850,90 1860,40 L1830,0 L1920,0 Z" fill="#120B08"/>`};
	return CB;
};
// a leaf: content in leaf-local units (u 0..301 from the hinge, v 0..750 down), mapped by vertical strips (piecewise-affine
// perspective). Calibrated so θ = 90° reproduces the approved still's open quad (674,190)-(740,226)-(740,888)-(674,940).
const LW = 301, LH = 750, FOC = 1072, VYT = 354.4, VYB = 702.7;
const leafPt = (side, th, u) => { const hinge = side < 0 ? 674 : 1276, Xw = hinge - side * u * Math.cos(th), Z = u * Math.sin(th), p = FOC / (FOC + Z);
	return {x: 975 + (Xw - 975) * p, yt: VYT + (190 - VYT) * p, yb: VYB + (940 - VYB) * p}; };
const leafContent = (id, lit) => `<g id="${id}"><rect x="0" y="0" width="${LW}" height="${LH}" fill="#3A2216"/>
	<rect x="12" y="54" width="${LW - 24}" height="330" fill="${P.mixC('#3A2216', '#94592F', lit)}"/>${lingHua(12, 54, LW - 24, 330, '#24150E', id + 'c')}
	<rect x="12" y="${LH * 0.62}" width="${LW - 24}" height="${LH * 0.14}" fill="#24150E" stroke="#5A3A26" stroke-width="2"/>
	<rect x="12" y="${LH * 0.8}" width="${LW - 24}" height="${LH * 0.15}" fill="#24150E" stroke="#5A3A26" stroke-width="2"/>
	<rect x="0" y="0" width="${LW}" height="${LH}" fill="none" stroke="#C8783E" stroke-width="3" opacity=".5"/></g>`;
const leaf = (side, th, lit, id) => {
	const N = 40; let s = `<defs>${leafContent(id, lit)}</defs>`;
	for (let i = 0; i < N; i++) {
		const ua = LW * i / N, ub = LW * (i + 1) / N, A = leafPt(side, th, ua), Bp = leafPt(side, th, ub);
		const a = (Bp.x - A.x) / (ub - ua), b = (Bp.yt - A.yt) / (ub - ua), dd = ((A.yb - A.yt) + (Bp.yb - Bp.yt)) / 2 / LH, e = A.x - a * ua, f = A.yt - b * ua;
		s += `<clipPath id="${id}s${i}"><rect x="${ua - 0.6}" y="-2" width="${ub - ua + 1.2}" height="${LH + 4}"/></clipPath><use href="#${id}" clip-path="url(#${id}s${i})" transform="matrix(${a.toFixed(5)},${b.toFixed(5)},0,${dd.toFixed(5)},${e.toFixed(3)},${f.toFixed(3)})"/>`;
	}
	const fe = leafPt(side, th, LW);
	return {svg: s + `<path d="M${fe.x.toFixed(2)},${fe.yt.toFixed(2)} L${fe.x.toFixed(2)},${fe.yb.toFixed(2)}" stroke="#FFC890" stroke-width="3"/>`, edge: fe.x};
};
const DEG = Math.PI / 180;
const doorTh = (t) => (14 + 76 * P.easeOut3(P.seg(t, CUT, CUT + 0.7)) + 2 * P.smooth(P.seg(t, CUT + 0.72, CUT + 1.1))) * DEG;
const camCourt = P.cam([960, 540, 1.0], [{t0: CUT, t1: 89.40, to: [975, 580, 1.12]}, {t0: 89.40, t1: 91.80, to: [975, 600, 1.45]}, {t0: 91.80, t1: 93.60, to: [960, 380, 1.0]}]);
const STAFFC = window.H1B_STAFF, STR = window.STAFF_STRIDE;
const WALK0 = 89.62, WK = 0.32;
const staffAt = (who, t, edgeX) => {
	const o = STAFFC[who], f = o.face, w = P.smooth(P.seg(t, WALK0, WALK0 + WK));
	// cycles walked: the stride ramps in with the blend so the planted foot does not skate
	const cyc = (() => { if (t <= WALK0) return 0; const a = Math.min(t, WALK0 + WK) - WALK0, ramp = a * a / (2 * WK), full = Math.max(0, t - WALK0 - WK); return (ramp + full) / 1.325; })();
	const xx = o.x + (f > 0 ? 1 : -1) * cyc * STR * o.h;
	const edge = f < 0 ? Math.min(o.edgeX, edgeX) : Math.max(o.edgeX, edgeX);   // hands wait on the leaf line; the leaf arrives and they take it home
	return window.STAFFW({...o, x: xx, edgeX: w > 0 ? o.edgeX + (xx - o.x) : edge, col: S, rim: '#FFB070', walk: w, u: 0.15 + cyc});
};
const courtWorld = (t) => {
	const c = courtBase(), th = doorTh(t);
	const breathe = 1 + 0.04 * Math.sin(2 * Math.PI * (t - CUT) / 2.26);
	const keyUp = P.smooth(P.seg(t, 89.7, 90.9));
	const hero = {x: PLINTH.cx - (922 - 836) * HS, y: PLINTH.top, h: 176, curl: 1, glow: 0.25 * breathe + 0.15 * keyUp, key: 2.7 + 0.4 * keyUp, mood: 'warm', refl: '#C9C2B0', base: 'block', block: {w: PLINTH.w / HS, h: (PLINTH.base - PLINTH.top) / HS}};
	const L = leaf(-1, th, 1 - P.seg(th / DEG, 14, 90), 'lfL'), R = leaf(1, th, 1 - P.seg(th / DEG, 14, 90), 'lfR');
	const sL = staffAt('left', t, L.edge), sR = staffAt('right', t, R.edge);
	const sway = (i) => (0.5 * Math.sin(2 * Math.PI * (t / 3.4) + i)).toFixed(3);
	const spill = 0.9 + 0.06 * Math.sin(t * 2.2) + 0.1 * keyUp;
	return `<defs>
	 <linearGradient id="csky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="1080"><stop offset="0" stop-color="#2E4046"/><stop offset="1" stop-color="#5A6866"/></linearGradient>
	 <radialGradient id="inner" cx="975" cy="1010" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F4A864"/><stop offset=".28" stop-color="#B05A2C"/><stop offset=".58" stop-color="#4E2412"/><stop offset="1" stop-color="#2A1209"/></radialGradient>
	 <radialGradient id="youLight" cx="900" cy="560" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity="${(0.16 + 0.12 * keyUp).toFixed(3)}"/><stop offset="1" stop-color="#FFB070" stop-opacity="0"/></radialGradient>
	 <linearGradient id="spill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFB070" stop-opacity=".9"/><stop offset=".5" stop-color="#E8874A" stop-opacity=".72"/><stop offset="1" stop-color="#E8874A" stop-opacity=".55"/></linearGradient>
	 <linearGradient id="flag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6E6050"/><stop offset="1" stop-color="#40362E"/></linearGradient>
	 <linearGradient id="eave" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="138"><stop offset="0" stop-color="#26180F"/><stop offset="1" stop-color="#6A3E22"/></linearGradient>
	 <radialGradient id="halo" cx="975" cy="560" r="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity="${(0.6 * breathe).toFixed(3)}"/><stop offset=".55" stop-color="#C8682F" stop-opacity=".14"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient>
	 <clipPath id="bay"><rect x="674" y="150" width="602" height="790"/></clipPath>
	</defs>
	<rect x="-400" y="-400" width="2720" height="1900" fill="url(#csky)"/>
	${Array.from({length: 30}, (_, i) => `<circle cx="${rnd(i) * 1920}" cy="${150 + rnd(i + 5) * 200}" r="${0.8 + rnd(i + 2) * 1.2}" fill="#DDE6E2" opacity="${((0.2 + rnd(i + 3) * 0.4) * (0.75 + 0.25 * Math.sin(t * (2 + rnd(i + 9) * 3) + i))).toFixed(3)}"/>`).join('')}
	<rect x="250" y="150" width="1450" height="790" fill="#6E4830"/><rect x="-400" y="-400" width="2720" height="1900" fill="url(#halo)"/>
	${c.front}
	<rect x="640" y="150" width="34" height="790" fill="#3A2216"/><rect x="1276" y="150" width="34" height="790" fill="#3A2216"/>
	<path d="M674,150 L674,940 M1276,150 L1276,940" stroke="#FFB070" stroke-width="3" opacity=".8"/>
	<rect x="674" y="190" width="602" height="750" fill="url(#inner)"/>
	<rect x="674" y="880" width="602" height="60" fill="#6A3A20" opacity=".6"/>
	<rect x="674" y="190" width="602" height="750" fill="url(#youLight)"/>
	${K.horseHead(hero)}
	<g clip-path="url(#bay)">${sL.svg}${sR.svg}</g>
	${L.svg}${R.svg}
	${c.eave}
	<rect x="200" y="940" width="1520" height="30" fill="#5A4636"/><rect x="150" y="970" width="1620" height="30" fill="#4A3A2E"/>
	<path d="M-400,1000 L2320,1000 L2320,1400 L-400,1400 Z" fill="url(#flag)"/>
	<path d="M674,940 L1276,940 L1700,1080 L250,1080 Z" fill="url(#spill)" opacity="${P.clamp(spill).toFixed(3)}"/>
	<path d="M674,940 L1276,940 L1290,970 L660,970 Z" fill="#FFB070" opacity=".4"/>
	<g transform="rotate(${sway(0)} 40 1080)">${c.pineL}</g><g transform="rotate(${sway(2)} 1890 1080)">${c.pineR}</g>`;
};
const courtVig = `<radialGradient id="cvig" cx="975" cy="600" r="1200" gradientUnits="userSpaceOnUse"><stop offset=".6" stop-color="#070605" stop-opacity="0"/><stop offset="1" stop-color="#070605" stop-opacity=".42"/></radialGradient>
	<radialGradient id="rvig" cx="960" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".55"/></radialGradient>`;
const LINES = window.LINES45;
let CORNER = null;
const render = (t) => {
	const cutF = t >= CUT - 0.5 / 30;   // the cut lands on the frame nearest 87.17 (f2615 = 87.167)
	const meta = {events: []};
	let svg = `<defs>${courtVig}</defs>`;
	if (!cutF) { const c = camRoad(t); meta.cam = c; meta.camId = 0; svg += `<g transform="${P.camT(c)}">${roadWorld(t)}</g><rect width="1920" height="1080" fill="url(#rvig)"/>`;
		meta.slitScreenX = P.toScr(c, [SLIT_X, 700])[0]; if (t >= STOP - 0.5 / 30 && t < STOP + 0.5 / 30) meta.events.push({stop: t}); }
	else { const c = camCourt(t); meta.cam = c; meta.camId = 1; svg += `<g transform="${P.camT(c)}">${courtWorld(t)}</g><rect width="1920" height="1080" fill="url(#cvig)"/>`;
		meta.doorDeg = doorTh(t) / DEG; meta.punchK = CORNER ? Math.min(3.23, 1640 / CORNER.w) : null; if (t < CUT + 0.5 / 30) meta.events.push({cut: t}); }
	// ---- HUD
	const hud = [];
	const tl = cutF ? Math.max(t, CUT) : t, ln = P.lineAt(LINES, tl); if (ln) hud.push(P.subHtml(ln[2], tl, ln[0]));   // R1's line is on the cut frame
	if (!cutF) hud.push(P.stampHtml('2020.12.1 · 北京', '运回圆明园'));
	else if (t < ODO) hud.push(P.stampHtml('2020.12.1 · 圆明园', '正觉寺 · 文殊亭'));
	else { const v = 1860 + 160 * P.smooth(P.seg(t, ODO, ODO + 0.4)); hud.push(P.stampHtml(`1860 → ${P.odo(v)}`, '正觉寺 · 文殊亭')); }
	if (cutF) {
		const row = [{lab: '回园', num: '1/12', dots: '鼠牛虎兔龙蛇马羊猴鸡狗猪'.split('').map((z) => P.dot(z === '马' ? 'y' : 'e')).join('')}];
		if (!CORNER) CORNER = P.measure(P.hud([P.blockHtml(row, '当代')]), '.tally');
		const cx = CORNER.x + CORNER.w / 2, cy = CORNER.y + CORNER.h / 2, KC = Math.min(3.23, 1640 / CORNER.w);   // ≥120 px numerals would push the 12 dots off frame: fit the row to 1640 px
		const pu = P.seg(t, CUT, CUT + 0.2), settle = P.smooth(P.seg(t, 87.6, 88.3));
		const k = P.lerp(KC * (1.1 - 0.1 * P.easeOut(pu)), 1, settle), dx = (960 - cx) * (1 - settle), dy = (600 - cy) * (1 - settle);
		const style = `transform:translate(${(dx / 0.58).toFixed(2)}px,${(dy / 0.58).toFixed(2)}px) scale(${k.toFixed(4)});transform-origin:50% 50%`;
		hud.push(P.blockHtml(row, '当代').replace('<div class="tally sh" style="opacity:1">', `<div class="tally sh" style="${style}">`));
	} else hud.push(P.blockHtml([], '当代'));
	hud.push(P.sealHtml());
	return {svg, hud: P.hud(hud), meta};
};
P.SCENES.drop = {t0: 85.2, t1: 92.0, render};
})();

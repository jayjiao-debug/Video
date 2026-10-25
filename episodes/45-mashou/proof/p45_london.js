// ep45 proof 2: the London guess and hammer, 29.9 – 38.9 s. B2's smoke → INK-BLEED (mode 3, pt = the densest smoke) → SALE
// London 1989 (D1–D3: the work light clicks on b53, paddles one per beat b56–b58, gavel lift b59, the strike on bar 15 = 35.412,
// the board flip 35.45–35.65) → LAMP SWING (mode 12: the hanging lamp's pool edge is the wipe) → the 2007 room (D4).
// Art: K.saleLondon (v7.js) and the 2007 set of v7_d5_2007.js, re-cut as functions of t; the 1860 fire set of v7_b2_taken.js.
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat;
const T_ON = B(53), PAD = [B(56), B(57), B(58)], LIFT = B(59), STRIKE = 35.412, FLIP0 = 35.45, FLIP1 = 35.65;
const SW0 = 37.96, SW1 = 38.60, INK0 = 29.90, INK1 = 30.50;
const camB2 = P.cam([760, 680, 1.3], [{t0: 29.40, t1: 30.20, to: [760, 420, 1.3]}]);
const camL = P.cam([960, 300, 1.0], [
	{t0: 30.30, t1: 31.70, to: [960, 540, 1.0]},
	{t0: 31.70, t1: 33.148, to: [960, 540, 1.03]},
	{t0: 33.148, t1: STRIKE, to: [975, 500, 1.08]},
	{t0: 36.00, t1: 39.09, to: [975, 500, 1.13]},
]);
// ------------------------------------------------ B2: the 1860 fire, tilted up into the smoke (v7_b2_taken.js set; looter gone)
let B2 = null;
const b2Base = () => {
	if (B2) return B2;
	const env = (x) => Math.max(0, 0.55 + 0.45 * Math.sin(x / 210 + 0.6) * Math.cos(x / 97 + 1.3) + 0.25 * Math.sin(x / 41));
	const tongue = (x, base, h, w, lean, fork) => { const tip = [x + lean, base - h];
		let d = `M${x - w / 2},${base} C${x - w * 0.62},${base - h * 0.35} ${x + lean * 0.3 - w * 0.34},${base - h * 0.62} ${tip[0]},${tip[1]}`;
		d += fork ? ` C${x + lean * 0.6},${base - h * 0.72} ${x + lean * 0.5 + w * 0.1},${base - h * 0.62} ${x + lean * 0.7 + w * 0.32},${base - h * 0.8} C${x + w * 0.4},${base - h * 0.5} ${x + w * 0.66},${base - h * 0.3} ${x + w / 2},${base} Z`
			: ` C${x + lean * 0.4 + w * 0.32},${base - h * 0.6} ${x + w * 0.7},${base - h * 0.32} ${x + w / 2},${base} Z`; return d; };
	let fB = '', fF = '';
	for (let i = 0; i < 34; i++) { const x = 160 + rnd(i + 40) * 1600, e = env(x); if (e < 0.15) continue; fB += `<path d="${tongue(x, 420, 120 + e * 300 * (0.6 + 0.6 * rnd(i + 3)), 70 + rnd(i + 5) * 120, (rnd(i + 7) - 0.3) * 120, rnd(i + 9) > 0.6)}"/>`; }
	for (let i = 0; i < 46; i++) { const x = 180 + rnd(i + 140) * 1560, e = env(x + 40); if (e < 0.22) continue; fF += `<path d="${tongue(x, 410, 40 + e * 200 * (0.4 + 0.8 * Math.pow(rnd(i + 103), 1.5)), 30 + rnd(i + 105) * 70, (rnd(i + 107) - 0.3) * 80, rnd(i + 109) > 0.55)}"/>`; }
	const items = []; for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) items.push(K.statue(side < 0 ? K.ROW_L[i] : K.ROW_R[i], side, i, 'fire', {empty: true}));
	B2 = {defs: `<defs>
	 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="640"><stop offset="0" stop-color="#2E1E22"/><stop offset=".38" stop-color="#6A2E24"/><stop offset=".72" stop-color="#BA562E"/><stop offset="1" stop-color="#E8924C"/></linearGradient>
	 <linearGradient id="flB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF9A48"/><stop offset=".5" stop-color="#D24A22" stop-opacity=".85"/><stop offset="1" stop-color="#8A2412" stop-opacity="0"/></linearGradient>
	 <linearGradient id="flF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE9B0"/><stop offset=".3" stop-color="#FFB04E"/><stop offset=".7" stop-color="#EA6028" stop-opacity=".8"/><stop offset="1" stop-color="#C0401E" stop-opacity="0"/></linearGradient>
	 <linearGradient id="winfire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#E86A2E"/></linearGradient>
	 <linearGradient id="poolF" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="670" y2="930"><stop offset="0" stop-color="#6A2E1C"/><stop offset=".45" stop-color="#2E160F"/><stop offset="1" stop-color="#1A0D09"/></linearGradient>
	 <radialGradient id="smk" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#7A3A26"/><stop offset=".55" stop-color="#3A2224"/><stop offset="1" stop-color="#2A1A1E" stop-opacity="0"/></radialGradient>
	 ${K.rimFilter('rimFire', -2, 5, '#FFA458', 0.95, 1.1)}${K.blur('b3', 3)}${K.blur('b7', 7)}${K.blur('b40', 40)}${K.blur('hz', 2.5)}</defs>`,
		sky: `<rect x="-600" y="-600" width="3200" height="2400" fill="url(#sky)"/>`,
		smoke: `<g filter="url(#b40)">${[[420, 240, 300, 200], [760, 160, 260, 260], [1180, 140, 340, 240], [1540, 220, 260, 220], [960, 40, 900, 120]].map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#smk)"/>`).join('')}</g>
		 <ellipse cx="960" cy="400" rx="920" ry="150" fill="#FF8A3A" opacity=".35" filter="url(#b40)"/>`,
		fB, fF, rest: `<g filter="url(#hz)">${K.facade('fire')}</g>${K.stairs('fire')}${K.pool('fire')}<g filter="url(#rimFire)">${items.map((st) => st.svg).join('')}</g>`};
	return B2;
};
const b2World = (t) => {
	const b = b2Base(), fl = (i) => 1 + 0.07 * P.noise(t * 6 + i * 5.3, i);
	const emb = Array.from({length: 40}, (_, i) => { const y = 300 + ((rnd(i + 60) * 500 - (t - 29) * (40 + 60 * rnd(i + 9))) % 520 + 520) % 520, x = 300 + rnd(i + 30) * 1300 + 14 * Math.sin(t * 2 + i);
		return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + rnd(i) * 1.6).toFixed(2)}" fill="#FFC070" opacity="${(0.35 + rnd(i + 2) * 0.5).toFixed(2)}"/>`; }).join('');
	return b.defs + b.sky + `<g transform="translate(620,700) scale(1.22) translate(-620,-700)">${b.smoke}
		<g transform="translate(0,420) scale(1,${fl(1).toFixed(3)}) translate(0,-420)"><g fill="url(#flB)" filter="url(#b7)" opacity=".9">${b.fB}</g></g>
		<g transform="translate(0,410) scale(1,${fl(2).toFixed(3)}) translate(0,-410)"><g fill="url(#flF)" filter="url(#b3)">${b.fF}</g></g>${b.rest}${emb}</g>`;
};
/** the smoke that rolled in from the right (screen space, drifting left) — densest around (864, 324), the ink-bleed point */
const smoke = (t) => {
	const blobs = [[864, 330, 520, 300, '#2E1C1E', 0.95], [1300, 240, 520, 320, '#3A2224', 0.9], [420, 300, 460, 300, '#3A2224', 0.85], [980, 640, 700, 260, '#4A2A24', 0.8],
		[1650, 560, 420, 300, '#3A2224', 0.85], [260, 700, 420, 240, '#5A3028', 0.7], [1500, 900, 600, 220, '#5A3028', 0.6], [700, 60, 700, 200, '#2A1A1E', 0.9], [1600, 60, 500, 200, '#2A1A1E', 0.9], [560, 480, 520, 260, '#34201F', 0.9], [1180, 420, 560, 280, '#2E1C1E', 0.9], [120, 120, 400, 260, '#2A1A1E', 0.9]];
	return `<defs>${K.blur('smb', 46)}</defs><g filter="url(#smb)">${blobs.map(([x, y, rx, ry, c, a], i) => { const dx = -(t - 29.2) * (34 + 18 * rnd(i + 5)) + 20 * P.noise(t * 0.7 + i, i), dy = 10 * P.noise(t * 0.5 + i * 2, i + 4);
		return `<ellipse cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${a}"/>`; }).join('')}</g>`;
};
// ------------------------------------------------ the London room, 1989 (K.saleLondon, animated)
const U = 42, G0 = 792, AX = 1590, hHi = [1530, 498], hLo = [1488, 596], hRest = [1628, 600];
const RAISE = [[0, 3], [1, 5], [2, 2]], PADN = [12, 47, 88];
const ROWS = [[0.5, 772, 70, 8, '#2E241D'], [0.7, 852, 20, 7, '#251D17'], [0.95, 1000, -60, 5, '#18120E']];
const lampSvg = (x, k, ang = 0, gl = 1, col = '#F6DCAE', up = 0) => `<g transform="rotate(${ang.toFixed(2)} ${x} ${-up})"><path d="M${x},${-up} L${x},${120 * k - 30}" stroke="#1A120D" stroke-width="3"/><path d="M${x - 40},${120 * k - 30} L${x + 40},${120 * k - 30} L${x + 26},${120 * k} L${x - 26},${120 * k} Z" fill="#1A120D"/><ellipse cx="${x}" cy="${120 * k + 2}" rx="22" ry="6" fill="${col}" opacity="${0.7 * gl}"/><ellipse cx="${x}" cy="${120 * k + 60}" rx="110" ry="70" fill="#F0D6A8" opacity="${0.12 * gl}" filter="url(#lb30)"/></g>`;
/** pendulum angle of the swing lamp (x 1240): a gentle hang sway, then the swing left → right that drives the wipe */
const swingEdge = (t) => P.lerp(-160, 2080, P.smooth(P.seg(t, SW0, SW1)));
const lampAng = (t, cam) => {
	const sway = 0.8 * Math.sin(2 * Math.PI * (t - 30) / 3.1);
	if (t < SW0 - 0.25 || t > SW1 + 0.6) return sway;
	const u = P.seg(t, SW0, SW1);
	if (t < SW0) return sway + P.lerp(0, 38, P.smooth(P.seg(t, SW0 - 0.25, SW0)));   // drawn back to the left before the swing
	if (t > SW1) return -38 * Math.exp(-(t - SW1) / 0.25) * Math.cos((t - SW1) * 9) + sway * (1 - Math.exp(-(t - SW1) / 0.25));
	return 38 - 76 * P.smooth(u);   // SVG rotate: + swings the shade left, so 38 → −38 is left → right
};
const londonRoom = (t, cam) => {
	const L = t < T_ON ? 0 : t < T_ON + 1 / 30 ? 1 : t < T_ON + 2 / 30 ? 0.25 : 1;   // click on, one flicker
	const struck = t >= STRIKE - 0.5 / 30;
	let rows = '';
	ROWS.forEach(([k, fy, x0, n, col], r) => {
		for (let i = 0; i < n; i++) { const x = x0 + i * 230 * k + (r % 2) * 40, h = 330 * k * (0.94 + 0.12 * rnd(i + r * 9)), u = h / 8, seatY = fy - 2.3 * u;
			const breathe = 0.7 * k * Math.sin(2 * Math.PI * (t * (0.22 + 0.08 * rnd(i + r * 7)) + rnd(i + r * 3)));
			let s = K.seated(x, fy, h, 1, col);
			const pi = RAISE.findIndex(([rr, ii]) => rr === r && ii === i);
			if (pi >= 0) {
				const up = P.easeOut3(P.seg(t, PAD[pi], PAD[pi] + 0.2)) * (1 - P.smooth(P.seg(t, 35.6, 36.0))), over = P.jolt(t, PAD[pi] + 0.2, 0.25 * u, 0.3, 1);
				const sh = [x - 0.15 * u, seatY - 2.6 * u], elS = [x + 0.9 * u, seatY - 3.0 * u], hUp = [x + 0.95 * u, seatY - 4.4 * u - over], hLap = [x + 0.95 * u, seatY - 0.55 * u];
				const L1 = Math.hypot(elS[0] - sh[0], elS[1] - sh[1]), L2 = Math.hypot(hUp[0] - elS[0], hUp[1] - elS[1]);
				// the hand travels an arc from the lap, in front of the body, to above the shoulder
				const a0 = Math.atan2(hLap[1] - sh[1], hLap[0] - sh[0]), a1 = Math.atan2(hUp[1] - sh[1], hUp[0] - sh[0]), r0 = Math.hypot(hLap[0] - sh[0], hLap[1] - sh[1]), r1 = Math.hypot(hUp[0] - sh[0], hUp[1] - sh[1]);
				const a = P.lerp(a0, a1, up), rr2 = P.lerp(r0, r1, up) + Math.sin(Math.PI * up) * 0.25 * u, hand = up >= 1 ? hUp : [sh[0] + Math.cos(a) * rr2, sh[1] + Math.sin(a) * rr2];
				const el = up >= 1 ? elS : K.two(sh, hand, L1, L2, -1);
				if (up > 0.001) {
					s += K.limb([sh, el, hand], 0.3 * u, 0.22 * u, col) + `<circle cx="${hand[0]}" cy="${hand[1]}" r="${0.22 * u}" fill="${col}"/>`;
					const tilt = (1 - up) * 70;
					s += `<g transform="rotate(${tilt.toFixed(1)} ${hand[0]} ${hand[1]})"><rect x="${hand[0] - 0.06 * u}" y="${hand[1] - 1.1 * u}" width="${0.12 * u}" height="${1.1 * u}" fill="${col}"/>
						<rect x="${hand[0] - 0.55 * u}" y="${hand[1] - 2.0 * u}" width="${1.1 * u}" height="${0.95 * u}" rx="${0.1 * u}" fill="#F3E6CC"/>
						<text x="${hand[0]}" y="${hand[1] - 1.3 * u}" text-anchor="middle" font-family="DejaVu Sans Mono" font-weight="700" font-size="${0.62 * u}" fill="#2A1E16">${PADN[pi]}</text></g>`;
				}
			}
			rows += `<g transform="translate(0,${breathe.toFixed(2)})">${s}</g>`;
		}
	});
	const hero = {x: 1030, y: 604, h: 162, curl: 1, glow: 0.8 * L * (1 + 0.04 * Math.sin(t * 2.4)), key: 1.6, mood: 'warm', refl: '#DCE4E0', base: 'block', block: {w: 900, h: 38 / (162 / 925)}};
	// the auctioneer's gavel hand: resting on the block → lift on b59 → a small rise of anticipation → the strike lands on 35.412
	let gh = hLo, ang = 0;
	if (t >= LIFT && t < STRIKE - 0.5 / 30) {
		const u1 = P.smooth(P.seg(t, LIFT, LIFT + 0.34)), u2 = P.smooth(P.seg(t, LIFT + 0.34, 35.30)), u3 = P.easeIn(P.seg(t, 35.30, STRIKE - 0.5 / 30));
		const pk = [hHi[0] + 6, hHi[1] - 10];
		let hp = [P.lerp(hLo[0], hHi[0], u1), P.lerp(hLo[1], hHi[1], u1) - 18 * Math.sin(Math.PI * u1)]; ang = 62 * u1;
		hp = [P.lerp(hp[0], pk[0], u2), P.lerp(hp[1], pk[1], u2)]; ang += 6 * u2;
		gh = [P.lerp(hp[0], hLo[0], u3), P.lerp(hp[1], hLo[1], u3)]; ang = ang * (1 - u3);
	}
	const fig = K.figure({x: AX, ground: G0, h: 8 * U, face: -1, col: '#120C09', hat: 'hair', coat: 0.4, hands: [gh, hRest], elbow: [1, -1]});
	const impact = struck && t < STRIKE + 1.5 / 30;
	const gav = ang < 0.5
		? `<rect x="${gh[0] - 44}" y="${gh[1] - 5}" width="50" height="7" rx="3.5" fill="#5A3820"/><rect x="${gh[0] - 62}" y="${gh[1] - 17}" width="22" height="26" rx="5" fill="#6A4226"/><rect x="${gh[0] - 62}" y="${gh[1] - 17}" width="22" height="7" rx="3" fill="#C8955E" opacity=".8"/>
		   ${impact ? [-30, -14, 14, 30].map((a) => `<path d="M${gh[0] - 51 + a * 0.9},${gh[1] - 22 - Math.abs(a) * 0.2} l${a * 0.5},${-16 + Math.abs(a) * 0.15}" stroke="#FFE2B0" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`).join('') : ''}`
		: `<g transform="rotate(${ang.toFixed(2)} ${gh[0]} ${gh[1]})"><rect x="${gh[0] - 46}" y="${gh[1] - 3.5}" width="52" height="7" rx="3.5" fill="#5A3820"/><rect x="${gh[0] - 64}" y="${gh[1] - 13}" width="22" height="26" rx="5" fill="#6A4226"/><rect x="${gh[0] - 64}" y="${gh[1] - 13}" width="7" height="26" rx="3" fill="#C8955E" opacity=".8"/></g>`;
	// the result board: face-down 「?」, sways 2° on each paddle; flips about Y (35.45–35.65) to 「三四十万美元」, then a 4 px damped jolt
	const fu = P.seg(t, FLIP0, FLIP1), sx = Math.cos(Math.PI * P.smooth(fu)), front = fu >= 0.5;
	const sway = PAD.reduce((a, p) => a + P.jolt(t, p, 2, 0.9, 2), 0), jy = P.jolt(t, FLIP1, 4, 0.4, 2);
	const face = front
		? `<rect x="640" y="236" width="700" height="190" fill="#2A1E16" stroke="#C8955E" stroke-width="5"/><rect x="652" y="248" width="676" height="166" fill="#F3E6CC"/>
		   <text x="990" y="370" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="104" fill="#2A1E16">三四十万美元</text>`
		: `<rect x="640" y="236" width="700" height="190" fill="#2A1E16" stroke="#C8955E" stroke-width="5"/>
		   <g transform="translate(990,331) scale(.12,1)"><rect x="-338" y="-83" width="676" height="166" fill="#B8A486"/></g>
		   <rect x="652" y="248" width="676" height="166" fill="#3A2C22"/><path d="M652,248 L1328,414 M1328,248 L652,414" stroke="#4E3C2E" stroke-width="3"/>
		   <circle cx="990" cy="331" r="66" fill="#F3E6CC"/><text x="990" y="365" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="100" fill="#2A1E16">?</text>`;
	const board = `<g transform="translate(0,${jy.toFixed(2)}) rotate(${sway.toFixed(3)} 990 236) translate(990,0) scale(${Math.max(0.004, Math.abs(sx)).toFixed(4)},1) translate(-990,0)">${face}</g>`;
	const motes = L > 0.5 ? Array.from({length: 26}, (_, i) => { const yy = 470 + ((rnd(i + 7) * 300 + (t - T_ON) * (6 + 8 * rnd(i))) % 300), w = (yy - 450) / 320, xx = 1060 - 90 * w + rnd(i + 3) * 200 * w + 6 * Math.sin(t * 0.8 + i);
		return `<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${(0.8 + rnd(i + 11) * 1.4).toFixed(2)}" fill="#FFF0D0" opacity="${(0.25 + 0.35 * rnd(i + 13)).toFixed(2)}"/>`; }).join('') : '';
	const lectA = struck ? 0.55 + 0.2 * P.easeOut(P.seg(t, STRIKE, STRIKE + 0.15)) : 0.55;
	const haze = Array.from({length: 6}, (_, i) => `<ellipse cx="${(200 + i * 320 + 30 * P.noise(t * 0.4 + i, i)).toFixed(1)}" cy="${(-60 + 50 * rnd(i + 20)).toFixed(1)}" rx="260" ry="90" fill="#8A7060" opacity="${(0.10 + 0.05 * P.noise(t * 0.6 + i * 3, i + 2)).toFixed(3)}" filter="url(#lb30)"/>`).join('');
	return `<defs>
	 <linearGradient id="lwall" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="1080"><stop offset="0" stop-color="#3E2E26"/><stop offset=".55" stop-color="#5E4838"/><stop offset="1" stop-color="#4A382C"/></linearGradient>
	 <linearGradient id="lceil" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="-500" y2="0"><stop offset="0" stop-color="#1A120E"/><stop offset="1" stop-color="#36281F"/></linearGradient>
	 <linearGradient id="lfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#46342A"/><stop offset="1" stop-color="#211812"/></linearGradient>
	 <radialGradient id="lwork" cx="1000" cy="560" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2BC" stop-opacity="${0.5 * L}"/><stop offset=".5" stop-color="#E8C890" stop-opacity="${0.14 * L}"/><stop offset="1" stop-color="#E8C890" stop-opacity="0"/></radialGradient>
	 <radialGradient id="llect" cx="1500" cy="560" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3DDB4" stop-opacity="${lectA}"/><stop offset=".5" stop-color="#E8C090" stop-opacity=".16"/><stop offset="1" stop-color="#E8C090" stop-opacity="0"/></radialGradient>
	 <linearGradient id="lbeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F6E2BC" stop-opacity="${0.24 * L}"/><stop offset="1" stop-color="#F6E2BC" stop-opacity="0"/></linearGradient>
	 <filter id="ldark" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2400" height="1500"><feComponentTransfer><feFuncR type="linear" slope="${0.12 + 0.88 * L}"/><feFuncG type="linear" slope="${0.12 + 0.88 * L}"/><feFuncB type="linear" slope="${0.12 + 0.88 * L}"/></feComponentTransfer></filter>
	 ${K.rimFilter('lrim', -4, 0, '#F0C890', 0.85, 1.3)}${K.rimFilter('lrimA', 4, 0, '#F6D8A8', 0.95, 1.3)}${K.blur('lb30', 30)}
	</defs>
	<rect x="-600" y="0" width="3200" height="1080" fill="url(#lwall)"/>
	<rect x="-600" y="-500" width="3200" height="500" fill="url(#lceil)"/><rect x="-600" y="-14" width="3200" height="14" fill="#4A382C"/><path d="M-600,0 L2600,0" stroke="#7A5E48" stroke-width="2" opacity=".5"/>
	${[-260, 340, 940, 1540, 2140].map((x) => `<path d="M${x},-500 L${x + 120},-14" stroke="#2A1E18" stroke-width="10" opacity=".6"/>`).join('')}
	${haze}
	${[80, 1400, 1700].map((x) => `<rect x="${x}" y="230" width="${x === 80 ? 480 : 260}" height="520" rx="4" fill="#5E4A3C" opacity=".35" stroke="#8A6E54" stroke-width="2"/>`).join('')}
	${[[300, 0.4], [760, 0.4], [1640, 0.4]].map(([x, k], i) => lampSvg(x, k, 0.6 * Math.sin(2 * Math.PI * (t - 30) / (2.7 + i * 0.4) + i), 1, '#F6DCAE', 160)).join('')}
	${board}
	<rect x="-600" y="770" width="3200" height="310" fill="url(#lfloor)"/><path d="M-600,770 L2600,770" stroke="#7A5E48" stroke-width="2" opacity=".6"/>
	<path d="M1150,770 L1150,460 M1150,460 L1070,478" stroke="#15100C" stroke-width="8" fill="none"/>
	<path d="M1040,462 L1092,488 L1076,510 L1030,488 Z" fill="#15100C"/><path d="M1036,498 L1078,510 L1180,770 L760,770 Z" fill="url(#lbeam)"/>
	${L > 0 ? `<ellipse cx="1060" cy="496" rx="14" ry="5" fill="#FFF4DC" opacity="${0.9 * L}"/>` : ''}
	<rect x="-600" y="-500" width="3200" height="1600" fill="url(#lwork)"/>
	<path d="M900,650 L1100,650 L1110,800 L890,800 Z" fill="#2A211B"/><rect x="884" y="642" width="232" height="14" fill="#3E3128"/>
	<path d="M884,642 L1116,642" stroke="#F6E2BC" stroke-width="2.5" opacity="${0.15 + 0.55 * L}"/>
	${L < 1 ? `<g filter="url(#ldark)">${K.horseHead(hero)}</g>` : K.horseHead(hero)}
	${motes}
	<g filter="url(#lrim)">${rows}</g>
	<rect x="-600" y="-500" width="3200" height="1600" fill="url(#llect)"/>
	<g filter="url(#lrimA)">${fig.svg}${fig.armBack}</g>
	<path d="M1446,800 L1462,606 L1700,606 L1716,800 Z" fill="#24190F"/>
	<path d="M1452,594 L1708,594 L1714,612 L1446,612 Z" fill="#3A281C"/><path d="M1452,594 L1708,594" stroke="#E9C690" stroke-width="2.5" opacity=".85"/>
	<path d="M1470,640 L1690,640 M1470,770 L1690,770" stroke="#3A2A1E" stroke-width="3"/>
	<ellipse cx="1452" cy="600" rx="30" ry="6" fill="#2A1A10"/><ellipse cx="1452" cy="596" rx="30" ry="6" fill="#6A4428"/><ellipse cx="1452" cy="595" rx="25" ry="4" fill="#8A5C36"/>
	<g filter="url(#lrimA)">${fig.armFront}${gav}</g>`;
};
// ------------------------------------------------ the 2007 room (v7_d5_2007.js set): empty chairs with catalogues, gavel at rest
let Y7 = null;
const room2007 = (t) => {
	if (!Y7) {
		const S = '#18110D';
		const chair = (x, fy, k, cat) => { const u = 330 * k, X = (d) => x + d * u, Y = (d) => fy - d * u;
			return `<path d="M${X(-0.02)},${Y(0)} L${X(0.02)},${Y(0)} L${X(0.04)},${Y(1.0)} L${X(0.0)},${Y(1.0)} Z" fill="${S}"/>
			<path d="M${X(0.0)},${Y(0.98)} L${X(0.06)},${Y(1.0)} L${X(0.05)},${Y(0.52)} L${X(-0.01)},${Y(0.5)} Z" fill="${S}"/>
			<rect x="${X(-0.02)}" y="${Y(0.5)}" width="${0.42 * u}" height="${0.05 * u}" fill="${S}"/>
			<path d="M${X(0.36)},${Y(0.46)} L${X(0.39)},${Y(0.46)} L${X(0.4)},${Y(0)} L${X(0.36)},${Y(0)} Z" fill="${S}"/>
			${cat ? `<path d="M${X(0.1)},${Y(0.56)} L${X(0.33)},${Y(0.57)} L${X(0.33)},${Y(0.6)} L${X(0.1)},${Y(0.59)} Z" fill="#D9C9AA" opacity=".9"/><path d="M${X(0.1)},${Y(0.6)} L${X(0.33)},${Y(0.61)}" stroke="#F3E6CC" stroke-width="${2 * k}" opacity=".7"/>` : ''}`; };
		let rows = '';
		[[0.52, 770, 60, 9, '#2A201A'], [0.72, 845, 30, 7, '#1F1813'], [1.0, 965, -40, 5, S]].forEach(([k, fy, x0, n, col], r) => {
			for (let i = 0; i < n; i++) rows += chair(x0 + i * 175 * k + (r % 2) * 30, fy, k, rnd(i + r * 10) > 0.15).replaceAll(S, col); });
		Y7 = {rows};
	}
	const hero = {x: 1030, y: 604, h: 162, curl: 1, glow: 0.8 * (1 + 0.04 * Math.sin(t * 2.4)), key: 1.6, mood: 'warm', refl: '#DCE4E0', base: 'block', block: {w: 900, h: 38 / (162 / 925)}};
	const flick = 1 + 0.03 * P.noise(t * 3, 77);
	return P.scope(`<defs>
	 <linearGradient id="wall" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="1080"><stop offset="0" stop-color="#352B25"/><stop offset=".55" stop-color="#56463A"/><stop offset="1" stop-color="#43362C"/></linearGradient>
	 <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3D2F25"/><stop offset="1" stop-color="#1E1712"/></linearGradient>
	 <radialGradient id="work" cx="1000" cy="560" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".42"/><stop offset=".5" stop-color="#C9D2CC" stop-opacity=".12"/><stop offset="1" stop-color="#C9D2CC" stop-opacity="0"/></radialGradient>
	 <radialGradient id="lect" cx="1500" cy="640" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3DDB4" stop-opacity="${(0.6 * flick).toFixed(3)}"/><stop offset=".5" stop-color="#E8C090" stop-opacity=".16"/><stop offset="1" stop-color="#E8C090" stop-opacity="0"/></radialGradient>
	 <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".22"/><stop offset="1" stop-color="#E6ECE6" stop-opacity="0"/></linearGradient>
	 ${K.blur('b12', 12)}${K.blur('b30', 30)}
	</defs>
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#wall)"/>
	${[80, 520, 1260, 1700].map((x) => `<rect x="${x}" y="230" width="360" height="520" rx="4" fill="#53433A" opacity=".35" stroke="#7A6250" stroke-width="2"/>`).join('')}
	<rect x="960" y="250" width="260" height="190" fill="#211914" stroke="#8A6E54" stroke-width="5"/>
	${[0, 1, 2].map((i) => `<rect x="990" y="${290 + i * 40}" width="${200 - i * 50}" height="8" fill="#5A4636" opacity=".6"/>`).join('')}
	${[[300, 0.3], [760, 0.3], [1560, 0.3]].map(([x, k]) => `<path d="M${x},-160 L${x},${120 * k - 30}" stroke="#1A120D" stroke-width="3"/><path d="M${x - 40},${120 * k - 30} L${x + 40},${120 * k - 30} L${x + 26},${120 * k} L${x - 26},${120 * k} Z" fill="#1A120D"/><ellipse cx="${x}" cy="${120 * k + 2}" rx="22" ry="6" fill="#F0D6A8" opacity=".55"/><ellipse cx="${x}" cy="${120 * k + 50}" rx="90" ry="60" fill="#F0D6A8" opacity=".08" filter="url(#b30)"/>`).join('')}
	<rect x="-600" y="770" width="3200" height="310" fill="url(#floor)"/>
	<path d="M-600,770 L2600,770" stroke="#6A5240" stroke-width="2" opacity=".6"/>
	<path d="M1150,770 L1150,380 M1150,380 L1070,420" stroke="#15100C" stroke-width="8" fill="none"/>
	<path d="M1040,404 L1092,430 L1076,452 L1030,430 Z" fill="#15100C"/>
	<path d="M1036,440 L1078,452 L1180,770 L760,770 Z" fill="url(#beam)"/>
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#work)"/>
	<g>${Y7.rows}</g>
	<path d="M900,650 L1100,650 L1110,800 L890,800 Z" fill="#2A211B"/><rect x="884" y="642" width="232" height="14" fill="#3E3128"/>
	<path d="M884,642 L1116,642" stroke="#E6ECE6" stroke-width="2.5" opacity=".7"/>
	<ellipse cx="1000" cy="652" rx="100" ry="10" fill="#FF9A5A" opacity=".35" filter="url(#b12)"/>
	${K.horseHead(hero)}
	<rect x="-600" y="-500" width="3200" height="1580" fill="url(#lect)"/>
	<path d="M1330,1080 L1360,660 L1690,660 L1720,1080 Z" fill="#20160F"/>
	<path d="M1340,640 L1710,640 L1720,668 L1330,668 Z" fill="#3A281C"/><path d="M1340,640 L1710,640" stroke="#E9C690" stroke-width="3" opacity=".8"/>
	<path d="M1660,640 L1660,560 C1660,540 1640,530 1620,532" stroke="#1A120D" stroke-width="7" fill="none"/>
	<path d="M1580,520 L1640,520 L1628,546 L1592,546 Z" fill="#1A120D"/><ellipse cx="1610" cy="548" rx="18" ry="5" fill="#FFF0D0" opacity="${(0.9 * flick).toFixed(3)}"/>
	<ellipse cx="1470" cy="632" rx="58" ry="12" fill="#2A1A10"/><ellipse cx="1470" cy="628" rx="58" ry="12" fill="#6A4428"/><ellipse cx="1470" cy="626" rx="50" ry="8" fill="#8A5C36"/>
	<g transform="rotate(-6 1470 600)">
	 <rect x="1380" y="596" width="150" height="14" rx="7" fill="#5A3820"/><rect x="1380" y="596" width="150" height="5" rx="2.5" fill="#B88456" opacity=".8"/>
	 <rect x="1508" y="572" width="54" height="62" rx="10" fill="#6A4226"/><rect x="1508" y="572" width="54" height="16" rx="6" fill="#C8955E" opacity=".75"/>
	 <rect x="1518" y="572" width="6" height="62" fill="#3A2416" opacity=".7"/><rect x="1546" y="572" width="6" height="62" fill="#3A2416" opacity=".7"/>
	</g>`, 'y7');
};
const vigL = `<radialGradient id="lvig" cx="1100" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0E0907" stop-opacity="0"/><stop offset="1" stop-color="#0E0907" stop-opacity=".66"/></radialGradient>
	<radialGradient id="yvig" cx="1100" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0E0907" stop-opacity="0"/><stop offset="1" stop-color="#0E0907" stop-opacity=".7"/></radialGradient>
	<radialGradient id="bvig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#120A08" stop-opacity="0"/><stop offset="1" stop-color="#120A08" stop-opacity=".8"/></radialGradient>`;
const LINES = window.LINES45;
const render = (t) => {
	const cam = camL(t), meta = {cam, events: []};
	const swingLamp = `<g transform="${P.camT(cam)}">${lampSvg(1240, 1, lampAng(t, cam), 1, '#F6DCAE', 160)}</g>`;
	let svg = `<defs>${vigL}${K.blur('lb30', 30)}</defs>`;
	if (t < INK1) {
		svg += `<g transform="${P.camT(camB2(t))}">${b2World(t)}</g>${smoke(t)}<rect width="1920" height="1080" fill="url(#bvig)"/>`;
		meta.camB2 = camB2(t);
	}
	const london = `<g transform="${P.camT(cam)}">${londonRoom(t, cam)}</g>${t < SW0 ? swingLamp : ''}<rect width="1920" height="1080" fill="url(#lvig)"/>`;
	if (t < INK0) { /* smoke only */ }
	else if (t < INK1) {
		const u = P.smooth(P.seg(t, INK0, INK1)), R = 30 + 1700 * u;
		svg += `<defs><filter id="inkN" filterUnits="userSpaceOnUse" x="-400" y="-400" width="2720" height="1880"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${(260 + 200 * u).toFixed(0)}" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="14"/></filter>
			<mask id="ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><g filter="url(#inkN)"><circle cx="864" cy="324" r="${R.toFixed(1)}" fill="#fff"/></g></mask></defs>
			<g mask="url(#ink)">${london}</g>`;
		meta.events.push({ink: u});
	} else if (t < SW0) svg += london;
	else {
		// mode 12 light-edged wipe: the swing lamp's pool edge sweeps left → right; behind it (left) the 2007 room
		const e = swingEdge(t), y7 = `<g transform="${P.camT(cam)}">${room2007(t)}</g><rect width="1920" height="1080" fill="url(#yvig)"/>`;
		const th = lampAng(t, cam) * Math.PI / 180, lampScr = P.toScr(cam, [1240 - 280 * Math.sin(th), -160 + 280 * Math.cos(th)]);
		svg += t >= SW1 ? y7 : `${london}<defs><clipPath id="wl"><rect x="-10" y="0" width="${Math.max(0, e + 10).toFixed(1)}" height="1080"/></clipPath>
			<linearGradient id="edge" gradientUnits="userSpaceOnUse" x1="${e - 220}" x2="${e + 30}" y1="0" y2="0"><stop offset="0" stop-color="#F6DCAE" stop-opacity="0"/><stop offset=".85" stop-color="#FFE8C0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE8C0" stop-opacity="0"/></linearGradient>
			<linearGradient id="cone" gradientUnits="userSpaceOnUse" x1="0" y1="${lampScr[1]}" x2="0" y2="1080"><stop offset="0" stop-color="#FFE8C0" stop-opacity=".28"/><stop offset="1" stop-color="#FFE8C0" stop-opacity=".04"/></linearGradient></defs>
			<g clip-path="url(#wl)">${y7}</g>
			<rect x="${e - 220}" y="0" width="250" height="1080" fill="url(#edge)"/>
			<path d="M${lampScr[0] - 14},${lampScr[1]} L${lampScr[0] + 14},${lampScr[1]} L${e + 30},1080 L${e - 160},1080 Z" fill="url(#cone)"/>`;
		svg += swingLamp;
		meta.events.push({wipe: e});
	}
	if (t >= SW1) svg += '';
	if (t >= STRIKE - 0.5 / 30 && t < STRIKE + 0.5 / 30) meta.events.push({strike: t});
	if (t >= FLIP0 && t <= FLIP1 + 1 / 30) meta.events.push({flip: P.seg(t, FLIP0, FLIP1)});
	// ---- HUD
	const hud = [];
	const ln = P.lineAt(LINES, t); if (ln) hud.push(P.subHtml(ln[2], t, ln[0]));
	if (t < 30.318) hud.push(P.stampHtml('1860.10.18 · 圆明园', '英法联军火烧圆明园'));
	else if (t < 38.525) hud.push(P.stampHtml('1989 · 伦敦', '苏富比拍卖'));
	else hud.push(P.stampHtml('2007 · 香港', '苏富比 · 拍卖前'));
	const cOp = 1 - P.seg(t, 30.0, 30.1);
	hud.push(P.blockHtml(cOp > 0 ? [{lab: '在家', num: '0/12', dots: 'eeeeeeeeeeee'.split('').map((s) => P.dot(s)).join('')}] : [], t < 30.318 ? '清' : '当代', {op: cOp}));
	hud.push(P.sealHtml());
	return {svg, hud: P.hud(hud), meta};
};
P.SCENES.london = {t0: 29.9, t1: 38.9, render, cam: camL};
})();

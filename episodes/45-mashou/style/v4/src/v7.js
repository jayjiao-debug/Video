// ep45 v7 key frames (script v7, subtitles only, 你 = the viewer, 它 = the horse). Shared helpers for the new v7 frames.
// RING (v7 hook set): the twelve on two shallow arcs of robed stone seats around the night pool, seen frontally from a
// little above. Far arc 6 (small), near arc 6 (big), staggered so no head hides another. Every head is a profile turned
// toward the centre line; the horse is 4th from the left on the near arc (centre-right), facing left, copper-lit.
(() => {
// zodiac clock order, far arc left → right then near arc right → left (so the near arc reads 鸡 猴 羊 马 蛇 龙 left → right)
K.RING_FAR = ['狗', '猪', '鼠', '牛', '虎', '兔'];
K.RING_NEAR = ['鸡', '猴', '羊', '马', '蛇', '龙'];
/** seat positions. o: {cx, far: {y, s, dx, sag}, near: {y, s, dx, lift}} → [{k, x, y, s, face, arc}] */
K.ringPos = (o = {}) => {
	const cx = o.cx ?? 960, F = {y: 572, s: 0.8, dx: 232, sag: 28, ...(o.far ?? {})}, N = {y: 896, s: 1.25, dx: 268, lift: 56, ...(o.near ?? {})};
	const out = [];
	K.RING_FAR.forEach((k, i) => { const u = (i - 2.5), x = cx + u * F.dx, t = Math.abs(u) / 2.5; out.push({k, x, y: F.y + F.sag * t * t, s: F.s * (1 + 0.06 * t), face: x < cx ? 1 : -1, arc: 'far'}); });
	K.RING_NEAR.forEach((k, i) => { const u = (i - 2.5), x = cx + u * N.dx, t = Math.abs(u) / 2.5; out.push({k, x, y: N.y - N.lift * t * t, s: N.s * (1 - 0.1 * t), face: x < cx ? 1 : -1, arc: 'near'}); });
	return out;
};
/** one ring seat with its head. st: 'dark' | 'lit' (ivory, back in China) | 'dash' (not back) | 'empty' (head gone) | 'hero'.
 *  Returns {back, head, hero, top} — back = the stone seat, head = the brother (or '' for the hero / empty). */
K.ringSeat = (p, st, o = {}) => {
	const {x, y, s, face} = p, h = 160 * s, stone = o.stone ?? '#353530';
	const b = K.stoneBody(x, y, h, face, stone); const [tx, ty] = b.top;
	if (st === 'empty') return {back: K.emptySeat(x, y, h, face, stone, o.rimEmpty ?? '#BFD0CC'), head: '', top: [tx, ty]};
	if (st === 'hero') return {back: b.svg, head: '', hero: {x: tx + face * 4 * s, y: ty + 22 * s, h: 200 * s * (o.heroK ?? 1.1), flip: face > 0, curl: o.curl ?? 1, glow: o.glow ?? 1.1, key: o.key ?? 1.7, mood: 'warm', rim: '#FFE6C0', base: 'seat'}, top: [tx, ty]};
	const size = 175 * s, hx = tx + face * 4 * s, hy = ty + 22 * s;
	if (st === 'dash') { const sw = 4.2 / (size / 100);
		const dash = `stroke-dasharray="${11 / (size / 100)} ${8 / (size / 100)}"`;
		// the line-drawn parts (antlers, horns, whiskers) become thin dashed centre lines too, never solid ivory
		const g = K.bro(p.k, hx, hy, size, face, '#E9DCC4', `fill-opacity=".10" stroke="#F3E6CF" stroke-width="${sw}" ${dash} stroke-linejoin="round"`)
			.replace(/stroke="currentColor" stroke-width="[\d.]+"/g, `stroke="#F3E6CF" stroke-width="${sw}" ${dash}`);
		return {back: b.svg, head: `<g opacity=".95">${g}</g>`, top: [tx, ty]}; }
	const fill = st === 'lit' ? (o.litFill ?? '#E9DCC4') : (o.darkFill ?? '#231B16');
	return {back: b.svg, head: K.bro(p.k, hx, hy, size, face, fill), top: [tx, ty], mouth: K.broPt(p.k, hx, hy, size, face, 'mouth')};
};
/** the night garden behind the ring: sky with moon haze, far roofs + trees, the pool inside the ring. o: {cx, haze} */
K.ringNight = (o = {}) => {
	const cx = o.cx ?? 960, rnd = K.rnd;
	let trees = '';
	for (let i = 0; i < 40; i++) { const x = -40 + i * 52 + rnd(i) * 30, r = 40 + rnd(i + 3) * 46; trees += `<ellipse cx="${x}" cy="${560 - rnd(i + 7) * 40}" rx="${r}" ry="${r * 0.8}"/>`; }
	return `<defs>
	 <linearGradient id="r7sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1F3036"/><stop offset=".45" stop-color="#3C5357"/><stop offset=".62" stop-color="#6F8481"/><stop offset=".7" stop-color="#7E8F89"/></linearGradient>
	 <radialGradient id="r7moon" cx="${cx - 420}" cy="250" r="700" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E4EEE8" stop-opacity=".42"/><stop offset=".4" stop-color="#C8D6D0" stop-opacity=".14"/><stop offset="1" stop-color="#C8D6D0" stop-opacity="0"/></radialGradient>
	 <linearGradient id="r7pool" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8FA7A2"/><stop offset=".55" stop-color="#5E7A76"/><stop offset="1" stop-color="#3C5452"/></linearGradient>
	 <linearGradient id="r7terr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3E4644"/><stop offset="1" stop-color="#1C2122"/></linearGradient>
	 <radialGradient id="r7cu" cx="${o.heroX ?? cx}" cy="${o.heroY ?? 640}" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A5A" stop-opacity=".42"/><stop offset=".5" stop-color="#E07A3E" stop-opacity=".12"/><stop offset="1" stop-color="#E07A3E" stop-opacity="0"/></radialGradient>
	 ${K.blur('r7b10', 10)}${K.blur('r7b3', 3)}
	</defs>
	<rect width="1920" height="1080" fill="url(#r7sky)"/><rect width="1920" height="1080" fill="url(#r7moon)"/>
	<circle cx="${cx - 420}" cy="250" r="60" fill="#DCE6E0" opacity=".16" filter="url(#r7b10)"/><circle cx="${cx - 420}" cy="250" r="20" fill="#E8EEE6" opacity=".55" filter="url(#r7b3)"/>
	${Array.from({length: 40}, (_, i) => `<circle cx="${rnd(i + 90) * 1920}" cy="${40 + rnd(i + 95) * 300}" r="${0.8 + rnd(i + 92) * 1.3}" fill="#E4EEE8" opacity="${0.25 + rnd(i + 93) * 0.45}"/>`).join('')}
	<g fill="#24302F" filter="url(#r7b3)">${trees}</g>
	<path d="M${cx - 520},520 L${cx - 470},486 L${cx - 330},486 L${cx - 280},520 Z M${cx + 300},528 L${cx + 340},500 L${cx + 470},500 L${cx + 510},528 Z" fill="#1E2928"/>
	<rect x="0" y="548" width="1920" height="532" fill="url(#r7terr)"/>
	<path d="M0,548 L1920,548" stroke="#9FB2AE" stroke-width="2" opacity=".35"/>
	<!-- the pool inside the ring: a wide oval, moonlit, a long reflection of the moon -->
	<ellipse cx="${cx}" cy="742" rx="${o.poolRx ?? 900}" ry="150" fill="#2A3231"/>
	<ellipse cx="${cx}" cy="738" rx="${(o.poolRx ?? 900) - 24}" ry="138" fill="url(#r7pool)"/>
	${Array.from({length: 7}, (_, i) => `<path d="M${cx - 640 + i * 40},${640 + i * 26} L${cx + 640 - i * 40},${640 + i * 26}" stroke="#E6EEE6" stroke-width="1.6" opacity="${0.22 - i * 0.025}"/>`).join('')}
	<ellipse cx="${cx - 420}" cy="700" rx="40" ry="90" fill="#E8F0EA" opacity=".18" filter="url(#r7b10)"/>
	<path d="M${cx - (o.poolRx ?? 900) + 24},738 A${(o.poolRx ?? 900) - 24},138 0 0 0 ${cx + (o.poolRx ?? 900) - 24},738" stroke="#C8D6D0" stroke-width="3" fill="none" opacity=".35"/>
	<rect width="1920" height="1080" fill="url(#r7cu)"/>`;
};
/** draw a whole ring: states = {kind: st}; returns {svg, heroes:[hero], seats:{k: seat}} (far arc first, then near) */
K.ring = (pos, states, o = {}) => {
	let far = '', near = '', heroSvg = ''; const seats = {};
	pos.forEach((p) => { const st = states[p.k] ?? 'dark', r = K.ringSeat(p, st, o); seats[p.k] = {...r, p};
		const g = `<g filter="url(#${p.arc === 'far' ? 'r7rimF' : 'r7rimN'})">${r.back}${r.head}</g>`;
		const hs = r.hero && !window.NOHERO ? K.horseHead(r.hero) : '';
		if (p.arc === 'far') far += g + hs; else near += g + hs; });
	const defs = `<defs>${K.rimFilter('r7rimF', 3, 3, o.rim ?? '#B8CCC6', 0.75, 1.1)}${K.rimFilter('r7rimN', 4, 4, o.rim ?? '#C9DAD4', 0.95, 1.3)}</defs>`;
	return {svg: defs + far + near, seats};
};
/** a museum glass case (vitrine) with heads inside, frontal. (x, y) = top-left of the glass, w × h; label under it. */
K.vitrine = (x, y, w, h, heads, label, o = {}) => {
	const id = K.uid('vt');
	let in_ = ''; heads.forEach((k, i) => { const n = heads.length, size = o.size ?? Math.min(150, (w - 40) / n * 1.15), hx = x + 20 + (i + 0.5) * (w - 40) / n, hy = y + h - 34;
		in_ += `<rect x="${hx - size * 0.32}" y="${hy}" width="${size * 0.64}" height="34" fill="#C9B79A" opacity=".55"/>` + K.bro(k, hx, hy, size, o.face ?? (i < n / 2 ? 1 : -1), o.fill ?? '#E9DCC4'); });
	return `<defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFF4DE" stop-opacity=".38"/><stop offset="1" stop-color="#E8D2AA" stop-opacity=".12"/></linearGradient></defs>
	<g opacity="${o.op ?? 1}">
	<rect x="${x - 10}" y="${y + h}" width="${w + 20}" height="${o.plinth ?? 120}" fill="#2E2621"/><path d="M${x - 10},${y + h} L${x + w + 10},${y + h}" stroke="#E8C690" stroke-width="3" opacity=".7"/>
	<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>
	${in_}
	<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#F6EAD2" stroke-width="3" opacity=".75"/>
	<path d="M${x + 16},${y + 14} L${x + 60},${y + 14} M${x + 16},${y + 14} L${x + 16},${y + 80}" stroke="#FFFFFF" stroke-width="4" opacity=".55"/>
	${label ? `<text x="${x + w / 2}" y="${y + h + (o.plinth ?? 120) / 2 + 18}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="${o.fs ?? 48}" fill="#FFF1DC">${label}</text>` : ''}
	</g>`;
};
})();
// ------------------------------------------------------------------ SALE, LONDON 1989 (the d6a room, the sale in progress)
// o: {phase: 'guess' | 'strike'}. Side-on: three rows of seated bidders (one-tone profiles facing right) toward the rostrum;
// the horse on the podium under the work light; the result board on the wall (face-down 「?」 → 「三四十万美元」);
// the auctioneer behind the lectern (near right), facing the room, the gavel raised (guess) or down on the block (strike).
(() => {
K.saleLondon = (o = {}) => {
	const rnd = K.rnd, strike = o.phase === 'strike';
	const raise = strike ? [] : [[0, 3], [1, 5], [2, 2]];        // [row, seat] of the raised paddles in the guess
	let rows = '';
	[[0.5, 772, 70, 8, '#2E241D'], [0.7, 852, 20, 7, '#251D17'], [0.95, 1000, -60, 5, '#18120E']].forEach(([k, fy, x0, n, col], r) => {
		for (let i = 0; i < n; i++) { const x = x0 + i * 230 * k + (r % 2) * 40, h = 330 * k * (0.94 + 0.12 * rnd(i + r * 9)), u = h / 8, seatY = fy - 2.3 * u;
			const up = raise.some(([rr, ii]) => rr === r && ii === i);
			const hand = up ? [x + 0.95 * u, seatY - 4.4 * u] : null;
			rows += K.seated(x, fy, h, 1, col);
			if (up) { const sh = [x - 0.15 * u, seatY - 2.6 * u], el = [x + 0.9 * u, seatY - 3.0 * u]; rows += K.limb([sh, el, hand], 0.3 * u, 0.22 * u, col) + `<circle cx="${hand[0]}" cy="${hand[1]}" r="${0.22 * u}" fill="${col}"/>`; }
			if (up) rows += `<rect x="${hand[0] - 0.06 * u}" y="${hand[1] - 1.1 * u}" width="${0.12 * u}" height="${1.1 * u}" fill="${col}"/>
				<rect x="${hand[0] - 0.55 * u}" y="${hand[1] - 2.0 * u}" width="${1.1 * u}" height="${0.95 * u}" rx="${0.1 * u}" fill="#F3E6CC"/>
				<text x="${hand[0]}" y="${hand[1] - 1.3 * u}" text-anchor="middle" font-family="DejaVu Sans Mono" font-weight="700" font-size="${0.62 * u}" fill="#2A1E16">${[12, 47, 88][raise.findIndex(([rr, ii]) => rr === r && ii === i)]}</text>`; } });
	const hero = {x: 1030, y: 604, h: 162, curl: 1, glow: 0.8, key: 1.6, mood: 'warm', refl: '#DCE4E0', base: 'block', block: {w: 900, h: 38 / (162 / 925)}};
	// the auctioneer (r2: mid-ground, true scale against his lectern): standing behind it, facing left (the room); u = 42 px,
	// lectern top ≈ hip height. Guess: near hand raised in front of the face, gavel head up. Strike: the gavel on the sound block.
	const U = 42, G0 = 792, AX = 1590;
	const hHi = [1530, 498], hLo = [1488, 596], hRest = [1628, 600];
	const fig = K.figure({x: AX, ground: G0, h: 8 * U, face: -1, col: '#120C09', hat: 'hair', coat: 0.4, hands: strike ? [hLo, hRest] : [hHi, hRest], elbow: strike ? [1, -1] : [1, -1]});
	const gh = strike ? hLo : hHi;
	const gav = strike ? `<rect x="${gh[0] - 44}" y="${gh[1] - 5}" width="50" height="7" rx="3.5" fill="#5A3820"/><rect x="${gh[0] - 62}" y="${gh[1] - 17}" width="22" height="26" rx="5" fill="#6A4226"/><rect x="${gh[0] - 62}" y="${gh[1] - 17}" width="22" height="7" rx="3" fill="#C8955E" opacity=".8"/>
		${[-30, -14, 14, 30].map((a) => `<path d="M${gh[0] - 51 + a * 0.9},${gh[1] - 22 - Math.abs(a) * 0.2} l${a * 0.5},${-16 + Math.abs(a) * 0.15}" stroke="#FFE2B0" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`).join('')}`
		: `<g transform="rotate(62 ${gh[0]} ${gh[1]})"><rect x="${gh[0] - 46}" y="${gh[1] - 3.5}" width="52" height="7" rx="3.5" fill="#5A3820"/><rect x="${gh[0] - 64}" y="${gh[1] - 13}" width="22" height="26" rx="5" fill="#6A4226"/><rect x="${gh[0] - 64}" y="${gh[1] - 13}" width="7" height="26" rx="3" fill="#C8955E" opacity=".8"/></g>`;
	const board = strike
		? `<rect x="640" y="236" width="700" height="190" fill="#2A1E16" stroke="#C8955E" stroke-width="5"/><rect x="652" y="248" width="676" height="166" fill="#F3E6CC"/>
		   <text x="990" y="370" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="104" fill="#2A1E16">三四十万美元</text>`
		: `<rect x="640" y="236" width="700" height="190" fill="#2A1E16" stroke="#C8955E" stroke-width="5"/>
		   <g transform="translate(990,331) scale(.12,1)"><rect x="-338" y="-83" width="676" height="166" fill="#B8A486"/></g>
		   <rect x="652" y="248" width="676" height="166" fill="#3A2C22"/><path d="M652,248 L1328,414 M1328,248 L652,414" stroke="#4E3C2E" stroke-width="3"/>
		   <circle cx="990" cy="331" r="66" fill="#F3E6CC"/><text x="990" y="365" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="100" fill="#2A1E16">?</text>`;
	return `<defs>
	 <linearGradient id="lwall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3E2E26"/><stop offset=".55" stop-color="#5E4838"/><stop offset="1" stop-color="#4A382C"/></linearGradient>
	 <linearGradient id="lfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#46342A"/><stop offset="1" stop-color="#211812"/></linearGradient>
	 <radialGradient id="lwork" cx="1000" cy="560" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2BC" stop-opacity=".5"/><stop offset=".5" stop-color="#E8C890" stop-opacity=".14"/><stop offset="1" stop-color="#E8C890" stop-opacity="0"/></radialGradient>
	 <radialGradient id="llect" cx="1500" cy="560" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3DDB4" stop-opacity="${strike ? 0.75 : 0.55}"/><stop offset=".5" stop-color="#E8C090" stop-opacity=".16"/><stop offset="1" stop-color="#E8C090" stop-opacity="0"/></radialGradient>
	 <linearGradient id="lbeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F6E2BC" stop-opacity=".24"/><stop offset="1" stop-color="#F6E2BC" stop-opacity="0"/></linearGradient>
	 <radialGradient id="lvig" cx="1100" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0E0907" stop-opacity="0"/><stop offset="1" stop-color="#0E0907" stop-opacity=".66"/></radialGradient>
	 ${K.rimFilter('lrim', -4, 0, '#F0C890', 0.85, 1.3)}${K.rimFilter('lrimA', 4, 0, '#F6D8A8', 0.95, 1.3)}${K.blur('lb30', 30)}
	</defs>
	<rect width="1920" height="1080" fill="url(#lwall)"/>
	${[80, 1400, 1700].map((x) => `<rect x="${x}" y="230" width="${x === 80 ? 480 : 260}" height="520" rx="4" fill="#5E4A3C" opacity=".35" stroke="#8A6E54" stroke-width="2"/>`).join('')}
	${[[300, 0.4], [760, 0.4], [1240, 1], [1640, 0.4]].map(([x, k]) => `<path d="M${x},0 L${x},${120 * k - 30}" stroke="#1A120D" stroke-width="3"/><path d="M${x - 40},${120 * k - 30} L${x + 40},${120 * k - 30} L${x + 26},${120 * k} L${x - 26},${120 * k} Z" fill="#1A120D"/><ellipse cx="${x}" cy="${120 * k + 2}" rx="22" ry="6" fill="#F6DCAE" opacity=".7"/><ellipse cx="${x}" cy="${120 * k + 60}" rx="110" ry="70" fill="#F0D6A8" opacity=".12" filter="url(#lb30)"/>`).join('')}
	${board}
	<rect x="0" y="770" width="1920" height="310" fill="url(#lfloor)"/><path d="M0,770 L1920,770" stroke="#7A5E48" stroke-width="2" opacity=".6"/>
	<path d="M1150,770 L1150,460 M1150,460 L1070,478" stroke="#15100C" stroke-width="8" fill="none"/>
	<path d="M1040,462 L1092,488 L1076,510 L1030,488 Z" fill="#15100C"/><path d="M1036,498 L1078,510 L1180,770 L760,770 Z" fill="url(#lbeam)"/>
	<rect width="1920" height="1080" fill="url(#lwork)"/>
	<path d="M900,650 L1100,650 L1110,800 L890,800 Z" fill="#2A211B"/><rect x="884" y="642" width="232" height="14" fill="#3E3128"/>
	<path d="M884,642 L1116,642" stroke="#F6E2BC" stroke-width="2.5" opacity=".7"/>
	${window.NOHERO ? '' : K.horseHead(hero)}
	<g filter="url(#lrim)">${rows}</g>
	<rect width="1920" height="1080" fill="url(#llect)"/>
	<g filter="url(#lrimA)">${fig.svg}${fig.armBack}</g>
	<!-- the lectern (mid-ground, right): front panel to the floor, top at the auctioneer's hip; the sound block on its top-left -->
	<path d="M1446,800 L1462,606 L1700,606 L1716,800 Z" fill="#24190F"/>
	<path d="M1452,594 L1708,594 L1714,612 L1446,612 Z" fill="#3A281C"/><path d="M1452,594 L1708,594" stroke="#E9C690" stroke-width="2.5" opacity=".85"/>
	<path d="M1470,640 L1690,640 M1470,770 L1690,770" stroke="#3A2A1E" stroke-width="3"/>
	<ellipse cx="1452" cy="600" rx="30" ry="6" fill="#2A1A10"/><ellipse cx="1452" cy="596" rx="30" ry="6" fill="#6A4428"/><ellipse cx="1452" cy="595" rx="25" ry="4" fill="#8A5C36"/>
	<g filter="url(#lrimA)">${fig.armFront}${gav}</g>
	<rect width="1920" height="1080" fill="url(#lvig)"/>`;
};
})();
// ------------------------------------------------------------------ SALE, PARIS 2009 + the Beijing press room
(() => {
/** the Paris hall: tall arched windows at night, the rat and rabbit on the podium under the lamp, the result board on its
 *  easel (centre), the phone bank (right): three clerks seated in profile facing the room, handsets at their ears. */
K.saleParis = (o = {}) => {
	const rnd = K.rnd, S = '#140E0B';
	const win = (x) => `<path d="M${x},700 L${x},300 C${x},230 ${x + 160},230 ${x + 160},300 L${x + 160},700 Z" fill="url(#pwin)"/>
		<path d="M${x + 80},250 L${x + 80},700 M${x},420 L${x + 160},420 M${x},560 L${x + 160},560" stroke="#2A2420" stroke-width="7"/>
		<path d="M${x},700 L${x},300 C${x},230 ${x + 160},230 ${x + 160},300 L${x + 160},700" stroke="#8A7458" stroke-width="5" fill="none"/>`;
	// clerks (r2): STANDING behind the phone table (its top at their hip), facing the room (left); the near hand holds the
	// handset at the ear (elbow down and forward), the far hand rests on the table. Handset = a dark bar from ear to mouth.
	let clerks = '';
	[[1420, 0.96], [1590, 1.0], [1760, 0.97]].forEach(([x, k], i) => { const u = 44 * k, g = 900, X = (d) => x - d * u, Y = (d) => g - d * u;
		const head = [X(0.25), Y(7.25)], hand = [X(0.62), Y(6.95)];
		const f = K.figure({x, ground: g, h: 8 * u, face: -1, col: S, hat: i === 1 ? 'hair' : undefined, coat: 0.4, hands: [hand, [X(0.9), 744]], elbow: [1, 1]});
		clerks += f.svg + f.armBack + f.armFront;
		clerks += `<path d="M${X(0.3)},${Y(7.42)} L${X(0.8)},${Y(6.9)}" stroke="#4A3A30" stroke-width="${0.15 * u}" stroke-linecap="round"/>`; });
	const bro = (k, x, y, size) => K.bro(k, x, y, size, -1, '#2A1A12');
	return `<defs>
	 <linearGradient id="pwall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A3230"/><stop offset=".6" stop-color="#5A4A40"/><stop offset="1" stop-color="#46382E"/></linearGradient>
	 <linearGradient id="pwin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2A3E4A"/><stop offset="1" stop-color="#4A5E66"/></linearGradient>
	 <linearGradient id="pfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A3A30"/><stop offset="1" stop-color="#211814"/></linearGradient>
	 <radialGradient id="plamp" cx="470" cy="560" r="360" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2BC" stop-opacity=".55"/><stop offset=".5" stop-color="#E8C890" stop-opacity=".14"/><stop offset="1" stop-color="#E8C890" stop-opacity="0"/></radialGradient>
	 <radialGradient id="pboard" cx="1000" cy="460" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2BC" stop-opacity=".32"/><stop offset="1" stop-color="#F6E2BC" stop-opacity="0"/></radialGradient>
	 <radialGradient id="pvig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0E0907" stop-opacity="0"/><stop offset="1" stop-color="#0E0907" stop-opacity=".66"/></radialGradient>
	 ${K.rimFilter('prim', -4, 0, '#F0C890', 0.85, 1.3)}${K.rimFilter('primB', 3, -2, '#FFB070', 1, 1.2)}${K.blur('pb30', 30)}
	</defs>
	<rect width="1920" height="1080" fill="url(#pwall)"/>
	${[60, 330, 1330, 1600].map(win).join('')}
	${Array.from({length: 24}, (_, i) => `<circle cx="${[60, 330, 1330, 1600][i % 4] + 20 + rnd(i) * 120}" cy="${300 + rnd(i + 3) * 380}" r="${1 + rnd(i + 5) * 2}" fill="#DCE6E2" opacity="${0.15 + rnd(i + 7) * 0.3}"/>`).join('')}
	<rect x="0" y="770" width="1920" height="310" fill="url(#pfloor)"/><path d="M0,770 L1920,770" stroke="#7A5E48" stroke-width="2" opacity=".6"/>
	<!-- the podium with the rat and rabbit, under its lamp -->
	<rect width="1920" height="1080" fill="url(#plamp)"/>
	<path d="M300,640 L640,640 L650,820 L290,820 Z" fill="#2A211B"/><rect x="284" y="630" width="372" height="14" fill="#3E3128"/><path d="M284,630 L656,630" stroke="#F6E2BC" stroke-width="2.5" opacity=".7"/>
	${[[390, '鼠'], [550, '兔']].map(([x, k]) => `<rect x="${x - 34}" y="600" width="68" height="30" fill="#141010"/><path d="M${x - 34},600 L${x + 34},600" stroke="#C9B79A" stroke-width="2" opacity=".6"/>`).join('')}
	<g filter="url(#primB)">${bro('鼠', 390, 602, 150)}${bro('兔', 550, 602, 150)}</g>
	<!-- the result board on its easel -->
	<rect width="1920" height="1080" fill="url(#pboard)"/>
	<path d="M880,860 L950,300 M1120,860 L1050,300 M1000,640 L1000,880" stroke="#2A1C14" stroke-width="12" stroke-linecap="round"/>
	<rect x="${o.bx ?? 760}" y="300" width="480" height="300" fill="#2A1E16" stroke="#C8955E" stroke-width="5"/><rect x="${(o.bx ?? 760) + 12}" y="312" width="456" height="276" fill="#F3E6CC"/>
	<text x="${(o.bx ?? 760) + 240}" y="390" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="56" fill="#5A4636">两件合计</text>
	<text x="${(o.bx ?? 760) + 240}" y="520" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="100" fill="#2A1E16">3149<tspan font-size="64">万欧元</tspan></text>
	${o.stamp ? `<g transform="rotate(-12 ${(o.bx ?? 760) + 250} 470)"><rect x="${(o.bx ?? 760) + 52}" y="400" width="400" height="140" rx="10" fill="#F3E6CC" fill-opacity=".82" stroke="#C0302A" stroke-width="12"/><text x="${(o.bx ?? 760) + 252}" y="508" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="98" fill="#C0302A" letter-spacing="8">未付款</text></g>` : ''}
	<!-- the phone bank: table + three clerks facing the room -->
	<g filter="url(#prim)">${clerks}</g>
	<rect x="1310" y="742" width="560" height="22" fill="#3A281C"/><path d="M1310,742 L1870,742" stroke="#E9C690" stroke-width="2.5" opacity=".8"/>
	<path d="M1320,764 L1860,764 L1850,900 L1330,900 Z" fill="#24190F"/>
	${[1400, 1570, 1740].map((x) => `<rect x="${x - 26}" y="728" width="52" height="16" rx="4" fill="#1A1210"/><rect x="${x - 20}" y="724" width="40" height="6" rx="3" fill="#E9C690" opacity=".4"/>`).join('')}
	<rect width="1920" height="1080" fill="url(#pvig)"/>`;
};
/** Beijing, 2009.3.2: the buyer's press conference. A long table under a cool flat light, a row of microphones, one seated
 *  silhouette (no face) speaking; the Paris result board stands at right with the 「未付款」 stamp landing on it. */
K.pressRoom = () => {
	const S = '#120D0B';
	const mics = Array.from({length: 9}, (_, i) => { const x = 700 + i * 52 + (i % 2) * 6, h = 70 + (i % 3) * 14;
		return `<path d="M${x},700 L${x + (i - 4) * 4},${700 - h}" stroke="#1A1412" stroke-width="5"/><rect x="${x + (i - 4) * 4 - 9}" y="${700 - h - 22}" width="18" height="26" rx="8" fill="#1A1412"/>
		<rect x="${x + (i - 4) * 4 - 13}" y="${700 - h + 6}" width="26" height="22" fill="${['#8A3A2E', '#2E4A6A', '#C8A060', '#3A3A3A'][i % 4]}"/>`; }).join('');
	const u = 520 / 8, x = 960, fl = 872, seatY = fl - 2.3 * u;
	return `<defs>
	 <linearGradient id="bwall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A4446"/><stop offset="1" stop-color="#2A3032"/></linearGradient>
	 <radialGradient id="bkey" cx="900" cy="520" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".38"/><stop offset="1" stop-color="#E6ECE6" stop-opacity="0"/></radialGradient>
	 <radialGradient id="bvig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#08090A" stop-opacity="0"/><stop offset="1" stop-color="#08090A" stop-opacity=".6"/></radialGradient>
	 ${K.rimFilter('brim', -4, -2, '#E6ECE6', 0.8, 1.3)}
	</defs>
	<rect width="1920" height="1080" fill="url(#bwall)"/>
	<rect x="420" y="250" width="1000" height="420" fill="#4A5658" opacity=".55"/><rect x="420" y="250" width="1000" height="420" fill="none" stroke="#7E9692" stroke-width="3" opacity=".5"/>
	${[0, 1, 2].map((i) => `<rect x="${520 + i * 300}" y="300" width="200" height="16" fill="#8FA6A2" opacity=".25"/>`).join('')}
	<rect width="1920" height="1080" fill="url(#bkey)"/>
	<rect x="0" y="820" width="1920" height="260" fill="#1E2224"/>
	<g filter="url(#brim)">${K.seated(x, fl, 520, -1, S, [[x - 1.6 * u, 704]])}</g>
	<rect x="560" y="700" width="760" height="20" fill="#E6E2D8"/><path d="M560,720 L1320,720 L1300,880 L580,880 Z" fill="#C9C4B8"/><path d="M560,720 L1320,720" stroke="#8A8478" stroke-width="3"/>
	${mics}
	<rect width="1920" height="1080" fill="url(#bvig)"/>`;
};
})();

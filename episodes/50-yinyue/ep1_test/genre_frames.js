// Layout A (a slanted panel per player, that player's 16 cells underneath) in three genres.
// One continuous stage runs behind all the panels, so a genre change swaps the stage, the outfits and the instruments together.
const GNOW = 4;
const R4 = (a) => [...a, ...a, ...a, ...a];
// ---------------------------------------------------------------- stages (drawn 1920 wide, panels cut them up)
const STAGE = {
	classical: () => {   // concert hall: wood panelling, gold trim, red curtain, chandelier
		let s = `<rect width="1920" height="720" fill="#7A4A2A"/>`;
		for (let i = 0; i < 24; i++) s += `<rect x="${i * 80}" y="0" width="70" height="720" fill="${i % 2 ? '#86542F' : '#6E4224'}"/>`;
		s += `<rect y="120" width="1920" height="10" fill="#D9A84A"/><rect y="560" width="1920" height="10" fill="#D9A84A"/>`;
		s += poly([[700, 130], [1220, 130], [1180, 560], [740, 560]], '#8E2430') + poly([[960, 130], [1220, 130], [1180, 560], [960, 560]], '#701A24');
		s += poly([[880, 0], [1040, 0], [1000, 60], [920, 60]], '#D9A84A') + poly([[840, 60], [1080, 60], [1020, 100], [900, 100]], '#F2D27A');
		s += `<rect y="560" width="1920" height="160" fill="#A8703E"/>` + [...Array(10).keys()].map((i) => `<rect x="0" y="${570 + i * 15}" width="1920" height="2" fill="#7A4A2A" opacity=".5"/>`).join('');
		return s;
	},
	jazz: () => {   // smoky club: brick, side curtains, warm lamp pools, little tables up front
		let s = `<rect width="1920" height="720" fill="#1E3442"/>`;
		for (let r = 0; r < 18; r++) for (let c = 0; c < 26; c++) s += `<rect x="${c * 80 - (r % 2) * 40}" y="${r * 34}" width="74" height="28" fill="#27404E"/>`;
		for (const x of [300, 960, 1620]) s += `<ellipse cx="${x}" cy="560" rx="300" ry="420" fill="#F2B860" opacity=".16"/>`;
		s += poly([[0, 0], [160, 0], [120, 720], [0, 720]], '#6A1E26') + poly([[1760, 0], [1920, 0], [1920, 720], [1800, 720]], '#6A1E26');
		s += `<rect y="580" width="1920" height="140" fill="#3A2A22"/>`;
		for (const x of [200, 700, 1250, 1700]) s += `<ellipse cx="${x}" cy="690" rx="90" ry="16" fill="#120E10"/><rect x="${x - 8}" y="690" width="16" height="40" fill="#120E10"/><circle cx="${x + 30}" cy="676" r="10" fill="#F2B860"/>`;
		return s + `<rect width="1920" height="720" fill="#C8D8E0" opacity=".05"/>`;
	},
	rock: () => {   // arena: lighting truss, coloured beams, crowd hands
		let s = `<rect width="1920" height="720" fill="#120F1C"/>`;
		for (const [x, col] of [[200, '#E0418A'], [640, '#3FD0E0'], [1100, '#E0418A'], [1560, '#F2B632'], [1880, '#3FD0E0']]) s += poly([[x - 20, 60], [x + 20, 60], [x + 260, 720], [x - 260, 720]], col, 'opacity=".16"');
		s += `<rect y="40" width="1920" height="22" fill="#2A2834"/>`;
		for (let i = 0; i < 48; i++) s += seg([i * 40, 40], [i * 40 + 20, 62], 3, '#4A4858') + seg([i * 40 + 20, 62], [i * 40 + 40, 40], 3, '#4A4858');
		for (let i = 0; i < 16; i++) s += `<rect x="${i * 124 + 40}" y="62" width="24" height="18" fill="#F4EEDF"/>`;
		s += `<rect y="600" width="1920" height="120" fill="#1C1828"/>`;
		for (let i = 0; i < 60; i++) { const x = i * 33 + (i % 3) * 7, h = 20 + ((i * 37) % 30); s += `<circle cx="${x}" cy="${700 - h * .3}" r="16" fill="#08070C"/>`; if (i % 4 === 0) s += seg([x + 6, 690], [x + 18, 640 - h], 9, '#08070C', 'round'); }
		return s;
	},
};
// ---------------------------------------------------------------- the band per genre: [player drawing, colour, name, parts]
// parts: [pattern, note length in steps, mark: 'dot' circle | 'sq' square | 'tick' small corner dot | 'bar' held note]
const LINEUP = {
	classical: {
		head: '古典：同一个 16 格，换一身衣服', players: [
			{ draw: (x, y, s, h) => gDrums(x + 10, y, s * .74, 'classical', { hit: h }), c: BAND.drums, name: '定音鼓 · 大熊', parts: [[[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], 1, 'dot']] },
			{ draw: (x, y, s, h) => gBass(x + 50, y, s * .78, 'classical', { pluck: h }), c: BAND.bass, name: '低音提琴 · 长脚', parts: [[[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], 8, 'bar']] },
			{ draw: (x, y, s, h) => gGuitar(x, y, s * .9, 'classical', { strum: h }), c: BAND.guitar, name: '小提琴 · 炸毛', parts: [[[1,0,1,0, 1,0,0,0, 1,0,1,0, 1,1,0,0], 2, 'bar']] },
			{ draw: (x, y, s, h) => gKeys(x + 20, y, s * .72, 'classical', { press: h }), c: BAND.keys, name: '钢琴 · 小圆', parts: [[R4([1,0,1,0]), 1, 'bar']] },
			{ draw: (x, y, s, h) => gVox(x, y, s * .82, 'classical', { sing: h }), c: BAND.vox, name: '女高音 · 大嗓门', parts: [[[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], 8, 'bar']] },
		] },
	jazz: {
		head: '爵士：多了一组铜管', players: [
			{ draw: (x, y, s, h) => gDrums(x + 30, y, s * .66, 'jazz', { hit: h }), c: BAND.drums, name: '鼓 · 大熊', parts: [[[1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,0,1], 1, 'tick'], [[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1, 'sq']] },
			{ draw: (x, y, s, h) => gBass(x + 60, y, s * .7, 'jazz', { pluck: h }), c: BAND.bass, name: '低音提琴 · 长脚', parts: [[R4([1,0,0,0]), 1, 'bar']] },
			{ draw: (x, y, s, h) => gGuitar(x, y, s * .78, 'jazz', { strum: h }), c: BAND.guitar, name: '空心吉他 · 炸毛', parts: [[[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1, 'bar']] },
			{ draw: (x, y, s, h) => gKeys(x + 20, y, s * .62, 'jazz', { press: h }), c: BAND.keys, name: '钢琴 · 小圆', parts: [[[0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,0,0], 2, 'bar']] },
			{ draw: (x, y, s, h) => gTbn(x + 20, y, s * .62, { slide: h }) + gSax(x - 80, y, s * .62, { blow: h }) + gTpt(x + 90, y, s * .62, { blow: h }), c: HORNS.sax, band: [HORNS.sax, HORNS.tpt, HORNS.tbn], name: '铜管 · 客串三人', parts: [[[0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0], 2, 'bar']] },
			{ draw: (x, y, s, h) => gVox(x, y, s * .72, 'jazz', { sing: h }), c: BAND.vox, name: '主唱 · 大嗓门', parts: [[[0,0,0,0, 0,0,1,0, 1,0,1,1, 0,0,0,0], 2, 'bar']] },
		] },
	rock: {
		head: '摇滚：同一个 16 格，音量拉满', players: [
			{ draw: (x, y, s, h) => gDrums(x + 40, y, s * .6, 'rock', { hit: h }), c: BAND.drums, name: '鼓 · 大熊', parts: [[[1,0,0,0, 0,0,0,1, 1,0,1,0, 0,0,0,0], 1, 'dot'], [[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1, 'sq'], [R4([1,0,1,0]), 1, 'tick']] },
			{ draw: (x, y, s, h) => gBass(x, y, s * .8, 'rock', { pluck: h }), c: BAND.bass, name: '贝斯 · 长脚', parts: [[R4([1,0,1,0]), 1, 'bar']] },
			{ draw: (x, y, s, h) => gGuitar(x, y, s * .86, 'rock', { strum: h }), c: BAND.guitar, name: '电吉他 · 炸毛', parts: [[R4([1,0,1,0]), 2, 'bar']] },
			{ draw: (x, y, s, h) => gKeys(x, y, s * .82, 'rock', { press: h }), c: BAND.keys, name: '键盘 · 小圆', parts: [[[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], 8, 'bar']] },
			{ draw: (x, y, s, h) => gVox(x + 40, y, s * .82, 'rock', { sing: h }), c: BAND.vox, name: '主唱 · 大嗓门', parts: [[[1,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0], 2, 'bar']] },
		] },
};
function genreFrame(genre, st = {}) {
	const NOWS = st.now ?? GNOW;
	const L = LINEUP[genre], n = L.players.length, W = 1920 / n, top = 150, bot = 720, sl = 34;
	let s = `<rect width="1920" height="1080" fill="#1E2230"/><g transform="translate(0 ${top})"><clipPath id="stageclip${genre}"><rect width="1920" height="${bot - top}"/></clipPath><g clip-path="url(#stageclip${genre})" transform="scale(1 ${(bot - top) / 720})">${STAGE[genre]()}</g></g>`;
	L.players.forEach((p, i) => {
		const x0 = i * W, cx = x0 + W / 2;
		const on = p.parts.some(([pat, len]) => [...Array(len).keys()].some((d) => pat[NOWS - d]));
		s += `<clipPath id="pc${genre}${i}"><polygon points="${[[x0 + sl, top], [x0 + W + sl, top], [x0 + W - sl, bot], [x0 - sl, bot]].map((q) => q.join(',')).join(' ')}"/></clipPath>`;
		s += `<g clip-path="url(#pc${genre}${i})"><g opacity="${on ? 1 : .8}">${p.draw(cx, bot - 24 + (st.bobs ? st.bobs[i] : 0), n > 5 ? .62 : .7, st.act ? st.act[i] : (on ? 1 : 0))}</g>
			<rect x="${x0 - 40}" y="${bot - 16}" width="${W + 80}" height="16" fill="${p.c.col}"/>${on ? '' : `<rect x="${x0 - 40}" y="${top}" width="${W + 80}" height="${bot - top}" fill="#000" opacity=".22"/>`}</g>`;
		if (i > 0) s += poly([[x0 + sl - 6, top], [x0 + sl + 6, top], [x0 - sl + 6, bot], [x0 - sl - 6, bot]], '#1E2230');
		const tag = p.band ? p.band.map((h) => `<tspan fill="${h.col}">■</tspan>`).join('') + ' ' : '';
		s += `<text x="${cx}" y="${bot + 50}" text-anchor="middle" ${F} font-size="${n > 5 ? 26 : 30}" font-weight="900" fill="${p.c.col}">${tag}${p.name}</text>`;
		const cw = n > 5 ? 50 : 56, gap = 7, gx = cx - (4 * cw + 3 * gap) / 2, gy = bot + 74;
		for (let k = 0; k < 16; k++) {
			const x = gx + (k % 4) * (cw + gap), y = gy + Math.floor(k / 4) * (cw + gap), cur = k === NOWS;
			s += `<rect x="${x}" y="${y}" width="${cw}" height="${cw}" rx="4" fill="${cur ? '#3A4058' : '#2A3042'}" stroke="${cur ? '#F4EEDF' : 'none'}" stroke-width="4"/>`;
			for (const [pat, len, mark] of p.parts) {
				const hit = pat[k], held = !hit && [...Array(len).keys()].slice(1).some((d) => pat[k - d]);
				if (mark === 'dot' && hit) s += `<circle cx="${x + cw / 2}" cy="${y + cw / 2}" r="${cw * .34}" fill="${p.c.col}"/>`;
				else if (mark === 'sq' && hit) s += `<rect x="${x + cw * .2}" y="${y + cw * .2}" width="${cw * .6}" height="${cw * .6}" fill="#F4EEDF"/>`;
				else if (mark === 'tick' && hit) s += `<circle cx="${x + cw - 11}" cy="${y + 11}" r="7" fill="#E3B23C"/>`;
				else if (mark === 'bar' && (hit || held)) s += `<rect x="${x + (hit ? 7 : 0)}" y="${y + cw * .26}" width="${cw - (hit ? 7 : 0)}" height="${cw * .48}" fill="${p.c.col}" opacity="${hit ? 1 : .6}"/>`;
			}
		}
	});
	s += `<text x="80" y="104" ${F} font-size="76" font-weight="900" fill="#F4EEDF">${L.head.split('：')[0]}<tspan fill="#F2B632">：</tspan><tspan font-size="52" fill="#F4EEDF" opacity=".85">${L.head.split('：')[1]}</tspan></text>`;
	return s;
}
window.OPTIONS = { G1_classical: () => genreFrame('classical'), G2_jazz: () => genreFrame('jazz'), G3_rock: () => genreFrame('rock') };

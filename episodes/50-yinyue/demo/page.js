// ep50 demo (从零做一首歌), vertical 1080×1920. window.renderAt(t) draws the frame for time t from window.SCORE (score.json).
// Layout A: header (lesson, headline, BPM) · two pads + hat strip · clap prompt · 16-step grid (y 1080–1290) · notation (y 1400–1500).
// Douyin covers y > 1560 and the right column x > 930 (y 900–1560): nothing important there.
(() => {
const W = 1080, H = 1920, C = {k: '#FF8A3D', s: '#3DD6FF', h: '#E8E8F0', b: '#B07CFF', bg: '#0E1016', dim: '#1d212b', mute: '#6b7385', txt: '#9aa3b5'};
const S = window.SCORE, STEP = S.step, BAR = S.bar;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const barAt = (t) => { let i = 0; for (let k = 0; k < S.bars.length; k++) if (S.bars[k].t <= t + 1e-6) i = k; return i; };
// time since the last hit of an instrument (∞ if none)
const since = (inst, t) => { let best = 1e9; for (const h of S.hits) if (h.inst === inst && h.t <= t + 1e-6) best = Math.min(best, t - h.t); return best; };
const flash = (inst, t, dur = 0.28) => { const d = since(inst, t); return d < dur ? 1 - d / dur : 0; };
const on = (b, inst) => b[inst].some((x) => x);
const pad = (cx, cy, r, col, f, active, label) => {
	const g = active ? 1 : .18, sc = 1 + .16 * f;
	return `<g opacity="${g}" transform="translate(${cx} ${cy}) scale(${sc})">
	<circle r="${r * 2}" fill="url(#gl_${label[0]})" opacity="${.25 + .6 * f}"/>
	<circle r="${r}" fill="none" stroke="${col}" stroke-width="10"/><circle r="${r * .62}" fill="${col}" opacity="${.55 + .45 * f}"/></g>
	<text x="${cx}" y="${cy + r + 72}" text-anchor="middle" font-size="36" font-weight="700" fill="#fff" opacity="${active ? 1 : .3}">${label}</text>`;
};
window.renderAt = (t) => {
	const bi = barAt(t), b = S.bars[bi], tb = t - b.t, step = Math.floor(tb / STEP + 1e-6) % 16, beat = Math.floor(step / 4);
	const sec0 = S.bars.findIndex((x) => x.key === b.key), tsec = t - S.bars[sec0].t;
	const intro = ease(tsec / 0.35);    // headline slides in at each new section
	let s = `<defs>${['k', 's', 'h', 'b'].map((k) => `<radialGradient id="gl_${{k: '底', s: '军', h: '镲', b: '贝'}[k]}"><stop offset="0" stop-color="${C[k]}" stop-opacity=".9"/><stop offset="1" stop-color="${C[k]}" stop-opacity="0"/></radialGradient>`).join('')}
	<radialGradient id="vig" cx=".5" cy=".38" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient></defs>
	<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
	// background pulse on the kick
	s += `<rect width="${W}" height="${H}" fill="${C.k}" opacity="${.07 * flash('k', t, .35)}"/>`;
	// header
	s += `<text x="80" y="230" font-size="30" fill="${C.txt}" letter-spacing="6">从零做一首歌 · 第1课</text>
	<text x="1000" y="230" text-anchor="end" font-size="34" fill="${C.k}" font-weight="700">♩ = ${S.bpm} BPM</text>
	<g opacity="${intro}" transform="translate(${(1 - intro) * -40} 0)"><text x="80" y="330" font-size="76" font-weight="900" fill="#fff">${b.head}</text>
	<text x="80" y="400" font-size="40" fill="${C.txt}">${b.sub}</text></g>`;
	// pads: kick + snare big, hats + bass small
	const A = {k: on(b, 'k'), s: on(b, 's'), h: on(b, 'h'), b: on(b, 'b')};
	s += pad(330, 650, 118, C.k, flash('k', t), A.k, '底鼓 · 咚') + pad(750, 650, 118, C.s, flash('s', t), A.s, '军鼓 · 哒');
	s += pad(330, 900, 42, C.h, flash('h', t, .14), A.h, '镲 · 次') + pad(750, 900, 42, C.b, flash('b', t, .3), A.b, '贝斯');
	// big count on the pulse / strong-weak sections
	const strong = beat === 0 || beat === 2;
	if (b.key !== 'hook') s += `<text x="540" y="690" text-anchor="middle" font-size="120" font-weight="900" fill="#fff" opacity="${.18 + .5 * Math.max(0, 1 - (tb % (BAR / 4)) / (BAR / 4))}">${beat + 1}</text>`;
	// clap prompt
	const prompt = b.key === 'pulse' ? '👏 跟着每一拍拍手' : b.key === 'strong' ? (strong ? '👏 拍！' : '　') : b.key === 'back' ? (beat % 2 ? '👏 哒！' : '　') : b.key === 'hook' ? '' : '🙂 跟着点头';
	s += `<text x="540" y="1068" text-anchor="middle" font-size="44" font-weight="700" fill="#fff">${prompt}</text>`;
	// grid
	const x0 = 150, w = 44, g = 5, gy = 1200, rows = [['h', '镲'], ['s', '军鼓'], ['k', '底鼓']];
	const sx = (i) => x0 + i * (w + g) + Math.floor(i / 4) * 10;
	for (let i = 0; i < 4; i++) { const xx = sx(i * 4) + w / 2, st = i === 0 || i === 2, now = i === beat;
		s += `<text x="${xx}" y="${gy - 22}" text-anchor="middle" font-size="${now ? 46 : 34}" font-weight="900" fill="${now ? '#fff' : C.mute}">${i + 1}</text>`;
		if (b.sw) s += `<text x="${xx}" y="${gy - 74}" text-anchor="middle" font-size="26" font-weight="700" fill="${st ? C.k : C.mute}">${i === 0 ? '强' : i === 2 ? '次强' : '弱'}</text>`; }
	rows.forEach(([k, n], r) => { const yy = gy + r * 62;
		s += `<text x="${x0 - 16}" y="${yy + 37}" text-anchor="end" font-size="26" fill="${A[k] ? C.txt : C.mute}">${n}</text>`;
		b[k].forEach((v, i) => { const now = i === step, hit = v && now;
			s += `<rect x="${sx(i)}" y="${yy}" width="${w}" height="52" rx="8" fill="${v ? C[k] : C.dim}" opacity="${v ? (hit ? 1 : .72) : 1}" ${now ? 'stroke="#fff" stroke-width="4"' : ''}/>`; }); });
	const px = sx(0) + (tb / BAR) * (sx(15) + w + 30 - sx(0));
	s += `<line x1="${px}" y1="${gy - 6}" x2="${px}" y2="${gy + 3 * 62}" stroke="#fff" stroke-width="3" opacity=".8"/>`;
	// notation: one-line drum staff, one bar, kick below / snare on / hat above (x heads)
	const ny = 1478, nx0 = 150, nw = 760;
	s += `<text x="${nx0 + nw + 24}" y="${ny + 8}" font-size="24" fill="${C.txt}">乐谱</text><line x1="${nx0}" y1="${ny}" x2="${nx0 + nw}" y2="${ny}" stroke="#4b5263" stroke-width="2"/>`;
	for (let i = 0; i <= 4; i++) { const xx = nx0 + i * nw / 4; s += `<line x1="${xx}" y1="${ny - 50}" x2="${xx}" y2="${ny + 50}" stroke="#4b5263" stroke-width="${i % 4 ? 2 : 4}"/>`; }
	const nxs = (i) => nx0 + 24 + i * (nw - 48) / 16;
	[['k', 26, 'o'], ['s', 0, 'o'], ['h', -30, 'x']].forEach(([k, dy, hd]) => b[k].forEach((v, i) => { if (!v) return; const xx = nxs(i), yy = ny + dy, lit = i === step;
		s += hd === 'x' ? `<path d="M${xx - 10} ${yy - 10}L${xx + 10} ${yy + 10}M${xx + 10} ${yy - 10}L${xx - 10} ${yy + 10}" stroke="${C[k]}" stroke-width="5" opacity="${lit ? 1 : .75}"/>` :
			`<ellipse cx="${xx}" cy="${yy}" rx="15" ry="11" fill="${C[k]}" opacity="${lit ? 1 : .75}"/>`;
		s += `<line x1="${xx + 13}" y1="${yy - 4}" x2="${xx + 13}" y2="${ny - 78}" stroke="${C[k]}" stroke-width="3" opacity=".6"/>`; }));
	s += `<line x1="${nxs(0) + (tb / BAR) * (nxs(15) + 24 - nxs(0))}" y1="${ny - 60}" x2="${nxs(0) + (tb / BAR) * (nxs(15) + 24 - nxs(0))}" y2="${ny + 54}" stroke="#fff" stroke-width="2" opacity=".5"/>`;
	s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
	// end fade
	s += `<rect width="${W}" height="${H}" fill="#000" opacity="${clamp((t - (S.end - 0.8)) / 0.8)}"/>`;
	document.getElementById('art').innerHTML = s;
	return {bar: bi, step};
};
window.READY = true;
})();

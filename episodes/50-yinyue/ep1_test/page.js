// ep1 opening test, night-stage look. window.renderAt(t) draws one frame from window.SCORE into #art (1920x1080).
const W = 1920, H = 1080, S = window.SCORE, art = document.getElementById('art');
const F = `font-family="Noto Sans CJK SC, sans-serif"`;
const C = { bg0: '#0B1230', bg1: '#18204A', ink: '#F4EEE2', dim: '#4B5486', amber: '#FFC25C',
	k: '#FF8A3D', s: '#FF5D8F', h: '#45D6E8', b: '#9D7BFF', heart: '#FF5D6C' };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
const ease = (u) => 1 - Math.pow(1 - clamp(u), 3);
const barAt = (t) => { let i = 0; while (i + 1 < S.bars.length && S.bars[i + 1].t <= t) i++; return i; };
// how hard instrument `inst` is hitting right now (1 on the hit, decays)
function pulse(t, inst, tau = .12) { let v = 0; for (const h of S.hits) { if (h.inst !== inst) continue; const d = t - h.t; if (d >= 0 && d < 1) v = Math.max(v, Math.exp(-d / tau)); } return v; }
function lastHit(t, inst) { let L = null; for (const h of S.hits) if (h.inst === inst && h.t <= t) L = h; return L; }

// ---------------- a cat (front view). hit 0..1 brings the paws down; tool = 'sticks' | 'none'
function cat({ x, y, s = 1, fur, belly, ear, hit = 0, tool = 'sticks', glow = 0 }) {
	const eye = '#22183A', o = '#1A1433';
	const st = `stroke="${o}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
	const sq = 1 - .05 * hit, bob = 10 * hit;
	const hand = (sx) => [sx * lerp(190, 150, hit), lerp(-140, 70, hit)];
	const arm = (sx) => { const [hx, hy] = hand(sx); return `<path d="M${sx * 120} 20 Q${sx * 200} ${lerp(-30, 60, hit)} ${hx} ${hy}" fill="none" stroke="${o}" stroke-width="52" stroke-linecap="round"/><path d="M${sx * 120} 20 Q${sx * 200} ${lerp(-30, 60, hit)} ${hx} ${hy}" fill="none" stroke="${fur}" stroke-width="40" stroke-linecap="round"/>`; };
	const stick = (sx) => { const [hx, hy] = hand(sx), a = sx * lerp(-24, -70, hit);
		return `<g transform="translate(${hx} ${hy}) rotate(${a})"><rect x="-10" y="-200" width="20" height="200" rx="10" fill="#E9C38F" stroke="${o}" stroke-width="5"/><circle cx="0" cy="-200" r="15" fill="#FFE1B5"/></g>`; };
	const paw = (sx) => { const [hx, hy] = hand(sx); return `<circle cx="${hx}" cy="${hy}" r="28" fill="${fur}" ${st}/>`; };
	return `<g transform="translate(${x} ${y + bob}) scale(${s} ${s * sq})">
	${glow ? `<ellipse cx="0" cy="40" rx="330" ry="330" fill="${C.amber}" opacity="${.08 * glow}"/>` : ''}
	<path d="M-150 120 C-170 40 -120 -40 0 -40 C120 -40 170 40 150 120 C150 200 90 240 0 240 C-90 240 -150 200 -150 120Z" fill="${fur}" ${st}/>
	<ellipse cx="0" cy="150" rx="80" ry="70" fill="${belly}"/>
	<path d="M150 170 C240 170 260 70 215 35" fill="none" stroke="${o}" stroke-width="40" stroke-linecap="round"/><path d="M150 170 C240 170 260 70 215 35" fill="none" stroke="${fur}" stroke-width="28" stroke-linecap="round"/>
	<g transform="translate(0 ${-170 - 6 * hit})">
		<path d="M-150 -40 L-170 -190 L-60 -120Z" fill="${fur}" ${st}/><path d="M150 -40 L170 -190 L60 -120Z" fill="${fur}" ${st}/>
		<path d="M-140 -70 L-152 -160 L-90 -118Z" fill="${ear}"/><path d="M140 -70 L152 -160 L90 -118Z" fill="${ear}"/>
		<ellipse cx="0" cy="0" rx="190" ry="160" fill="${fur}" ${st}/>
		${hit > .5 ? `<path d="M-100 -12 L-50 -12 M50 -12 L100 -12" stroke="${eye}" stroke-width="14" stroke-linecap="round"/>`
		: `<path d="M-95 -10 Q-70 -40 -45 -10" fill="none" stroke="${eye}" stroke-width="14" stroke-linecap="round"/><path d="M45 -10 Q70 -40 95 -10" fill="none" stroke="${eye}" stroke-width="14" stroke-linecap="round"/>`}
		<ellipse cx="-110" cy="40" rx="34" ry="20" fill="#FF8FA3" opacity=".55"/><ellipse cx="110" cy="40" rx="34" ry="20" fill="#FF8FA3" opacity=".55"/>
		<path d="M-10 22 L10 22 L0 34Z" fill="${eye}"/><path d="M-30 46 Q-15 64 0 46 Q15 64 30 46" fill="none" stroke="${eye}" stroke-width="8" stroke-linecap="round"/>
	</g>
	${arm(-1)}${arm(1)}${tool === 'sticks' ? stick(-1) + stick(1) : ''}${paw(-1)}${paw(1)}
	</g>`;
}
// instruments, drawn in front of a cat at (x, y) with scale s
function kickDrum(x, y, s, hit, label = true) {
	const r = 200 * s * (1 + .03 * hit);
	return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="${r * .98}" rx="${r * 1.1}" ry="${r * .14}" fill="#000" opacity=".35"/>
	<circle r="${r}" fill="${C.k}" stroke="#1A1433" stroke-width="${8 * s}"/><circle r="${r * .76}" fill="#FFF4E4" stroke="#1A1433" stroke-width="${6 * s}"/>
	<circle r="${r * .76}" fill="${C.k}" opacity="${.35 * hit}"/>
	${label ? `<text y="${r * .2}" text-anchor="middle" ${F} font-size="${110 * s}" font-weight="900" fill="${C.k}" opacity="${.35 + .65 * hit}">咚</text>` : ''}</g>`;
}
function snareDrum(x, y, s, hit) {
	return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-150" y="-40" width="300" height="120" rx="16" fill="${C.s}" stroke="#1A1433" stroke-width="8"/>
	<ellipse cx="0" cy="-40" rx="150" ry="40" fill="#FFF4E4" stroke="#1A1433" stroke-width="7"/><ellipse cx="0" cy="-40" rx="150" ry="40" fill="${C.s}" opacity="${.4 * hit}"/>
	<path d="M-60 80 L-90 200 M60 80 L90 200" stroke="#1A1433" stroke-width="10"/></g>`;
}
function hatStand(x, y, s, hit) {
	const tilt = -6 + 8 * hit;
	return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -40 L0 220 M-60 220 L0 160 L60 220" stroke="#1A1433" stroke-width="10" fill="none"/>
	<g transform="rotate(${tilt})"><ellipse cx="0" cy="-60" rx="170" ry="26" fill="${C.h}" stroke="#1A1433" stroke-width="7"/><ellipse cx="0" cy="-40" rx="170" ry="26" fill="#2A9FB0" stroke="#1A1433" stroke-width="7"/></g>
	<ellipse cx="0" cy="-50" rx="${200 + 60 * hit}" ry="${40 + 10 * hit}" fill="none" stroke="${C.h}" stroke-width="4" opacity="${.7 * hit}"/></g>`;
}
function bassGtr(x, y, s, hit) {
	return `<g transform="translate(${x} ${y}) scale(${s}) rotate(-28)"><rect x="-22" y="-330" width="44" height="300" rx="10" fill="#5B3A8C" stroke="#1A1433" stroke-width="7"/>
	<path d="M-120 0 C-150 -80 -60 -90 -40 -40 C-20 -70 20 -70 40 -40 C60 -90 150 -80 120 0 C160 90 60 160 0 150 C-60 160 -160 90 -120 0Z" fill="${C.b}" stroke="#1A1433" stroke-width="8"/>
	${[-12, -4, 4, 12].map((d) => `<line x1="${d}" y1="-330" x2="${d}" y2="110" stroke="#F4EEE2" stroke-width="${2 + 2 * hit}" opacity=".8"/>`).join('')}</g>`;
}

// ---------------- the 16 cells (one bar), right side of the frame
function cells(t, bi) {
	const B = S.bars[bi], step = clamp(Math.floor((t - B.t) / B.step), 0, 15);
	const x0 = 1150, y0 = 300, cw = 150, gap = 18, rows = B.rows || {};
	let s = '';
	for (let r = 0; r < 4; r++) {
		s += `<text x="${x0 - 40}" y="${y0 + r * (cw + gap) + cw / 2 + 16}" text-anchor="middle" ${F} font-size="44" font-weight="900" fill="${C.dim}">${r + 1}</text>`;
		for (let c = 0; c < 4; c++) {
			const i = r * 4 + c, x = x0 + c * (cw + gap), y = y0 + r * (cw + gap), on = i === step && t < B.t + B.steps * B.step;
			const insts = Object.entries(rows).filter(([, p]) => p[i]).map(([k]) => k);
			const age = (t - (B.t + i * B.step)); const flash = on ? Math.exp(-age / .15) : 0;
			s += `<rect x="${x}" y="${y}" width="${cw}" height="${cw}" rx="26" fill="${on ? '#2B3570' : '#141B42'}" stroke="${on ? C.amber : '#2A3266'}" stroke-width="${on ? 6 : 3}"/>`;
			insts.forEach((k, j) => {
				const big = insts.length === 1, rad = big ? 40 : 22, cx = big ? x + cw / 2 : x + 40 + (j % 2) * 70, cy = big ? y + cw / 2 : y + 40 + Math.floor(j / 2) * 70;
				const col = k === 'heart' ? C.heart : C[k];
				s += `<circle cx="${cx}" cy="${cy}" r="${rad * (1 + .35 * flash)}" fill="${col}" opacity="${on ? 1 : .8}"/>`;
				if (on && flash > .02) s += `<circle cx="${cx}" cy="${cy}" r="${rad + 40 * (1 - flash)}" fill="none" stroke="${col}" stroke-width="4" opacity="${flash}"/>`;
			});
		}
	}
	return s;
}

// ---------------- frame
window.renderAt = (t) => {
	const bi = barAt(t), B = S.bars[bi], mode = B.mode;
	const tCut = S.bars.find((b) => b.mode === 'cut').t, tSolo = S.bars.find((b) => b.mode === 'solo').t;
	const lights = t < tCut ? 1 : t < tSolo ? clamp(1 - (t - tCut) / .12) : 0;   // full stage lights only in the cold open
	const spot = t < tSolo ? 0 : ease((t - tSolo) / .5);
	const pk = pulse(t, 'k'), ps = pulse(t, 's'), ph = pulse(t, 'h', .08), pb = pulse(t, 'b', .15), pH = pulse(t, 'heart', .15);
	let s = `<defs><radialGradient id="bgG" cx=".5" cy=".35" r=".9"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/></radialGradient>
	<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7B8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE7B8" stop-opacity=".04"/></linearGradient>
	<radialGradient id="floorG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7B8" stop-opacity=".45"/><stop offset="1" stop-color="#FFE7B8" stop-opacity="0"/></radialGradient></defs>
	<rect width="${W}" height="${H}" fill="url(#bgG)"/>`;
	// stars / dust
	for (let i = 0; i < 60; i++) { const x = (i * 337) % W, y = (i * 191) % 640, a = .15 + .25 * Math.sin(t * 1.3 + i); s += `<circle cx="${x}" cy="${y}" r="${1 + (i % 3)}" fill="${C.ink}" opacity="${a * (.4 + .6 * lights) }"/>`; }
	// stage floor
	s += `<path d="M0 860 Q960 790 1920 860 L1920 1080 L0 1080Z" fill="#0A0F28"/><path d="M0 860 Q960 790 1920 860" fill="none" stroke="#2A3266" stroke-width="4"/>`;
	// full stage wash (cold open): coloured lights pulsing with the kick
	if (lights > 0) s += `<rect width="${W}" height="${H}" fill="${C.b}" opacity="${(.06 + .08 * pk) * lights}"/>`
		+ [C.k, C.s, C.h, C.b].map((c, i) => `<path d="M${200 + i * 260} 0 L${60 + i * 260} 900 L${360 + i * 260} 900Z" fill="${c}" opacity="${(.07 + .1 * [pk, ps, ph, pb][i]) * lights}"/>`).join('');
	if (t >= tSolo) s += `<rect width="${W}" height="${H}" fill="#03050F" opacity=".55"/>`;
	// spotlight on the drummer
	if (spot > 0) s += `<path d="M560 -20 L680 -20 L900 900 L340 900Z" fill="url(#cone)" opacity="${spot * (.7 + .3 * Math.max(pk, pH))}"/><ellipse cx="620" cy="900" rx="${320}" ry="60" fill="url(#floorG)" opacity="${spot}"/>`;

	// cats
	if (t < tSolo) {
		const band = [
			{ x: 160, fur: '#F2A65A', belly: '#FFE6C8', ear: '#F7B7A6', p: pk, inst: (h) => kickDrum(160, 790, .5, h, false), tool: 'sticks' },
			{ x: 410, fur: '#F4F0EA', belly: '#FFFFFF', ear: '#F3A39A', p: ps, inst: (h) => snareDrum(410, 760, .56, h), tool: 'sticks' },
			{ x: 660, fur: '#3A3550', belly: '#6B6488', ear: '#C98BA0', p: ph, inst: (h) => hatStand(660, 720, .54, h), tool: 'sticks' },
			{ x: 900, fur: '#C7C2D6', belly: '#EEEAF6', ear: '#E9A5B5', p: pb, inst: (h) => bassGtr(900, 760, .54, h), tool: 'none' },
		];
		for (const c of band) s += cat({ x: c.x, y: 540, s: .5, fur: c.fur, belly: c.belly, ear: c.ear, hit: c.p, tool: c.tool }) + c.inst(c.p);
	} else {
		const solo = mode !== 'heart' ? pk : pH;
		s += cat({ x: 620, y: 560, s: .8, fur: '#F2A65A', belly: '#FFE6C8', ear: '#F7B7A6', hit: solo, glow: spot }) + kickDrum(620, 800, .85, solo);
	}
	// darkness after the cut, opened by the spotlight
	if (t >= tCut && t < tSolo + .5) s += `<rect width="${W}" height="${H}" fill="#03050F" opacity="${(1 - lights) * (1 - spot)}"/>`;
	if (t >= tSolo) s += `<path d="M560 -20 L680 -20 L900 900 L340 900Z" fill="#FFE7B8" opacity="${.05 * spot}"/>`;

	// heartbeat line along the floor
	if (mode === 'heart') {
		const B0 = S.bars.find((b) => b.mode === 'heart'), u = ease((t - B0.t) / .6);
		let d = 'M100 1025';
		for (let x = 100; x <= 1040; x += 6) {
			const tx = t - (1040 - x) / 600; let yv = 0;
			for (const h of S.hits) if (h.inst === 'heart') { const a = tx - h.t, b = tx - h.t - .17; if (a > 0 && a < .12) yv -= 90 * Math.sin(a / .12 * Math.PI); if (b > 0 && b < .1) yv -= 50 * Math.sin(b / .1 * Math.PI); }
			d += ` L${x} ${1025 + yv * .7}`;
		}
		s += `<path d="${d}" fill="none" stroke="${C.heart}" stroke-width="6" stroke-linejoin="round" opacity="${u}"/><circle cx="1040" cy="1025" r="${10 + 8 * pH}" fill="${C.heart}" opacity="${u}"/>`;
	}

	// 16 cells: visible in the cold open (all rows) and from the first solo hit on
	const cellsOn = t < tCut ? 1 : t < tSolo ? lights : ease((t - tSolo) / .4);
	if (cellsOn > 0) s += `<g opacity="${cellsOn}">${cells(t, bi)}</g>`;
	if (cellsOn > 0 && t < tCut) s += `<g ${F} font-size="30" font-weight="700">${[['k', '底鼓'], ['s', '军鼓'], ['h', '镲'], ['b', '贝斯']].map(([k, n], i) => `<circle cx="${1170 + i * 170}" cy="${990}" r="14" fill="${C[k]}"/><text x="${1195 + i * 170}" y="${1001}" fill="${C.ink}">${n}</text>`).join('')}</g>`;

	// BPM counter (top right) from the bpm section on
	const firstBpm = S.bars.find((b) => b.mode === 'bpm');
	if (t >= firstBpm.t - .3 && mode !== 'heart') {
		const prev = S.bars[Math.max(0, bi - 1)], u = ease((t - B.t) / .35), val = Math.round(lerp(B.first ? prev.bpm : B.bpm, B.bpm, B.first ? u : 1));
		const a = ease((t - firstBpm.t + .3) / .4);
		s += `<g opacity="${a}" transform="translate(1780 200)"><text text-anchor="end" ${F} font-size="150" font-weight="900" fill="${C.ink}">${val}</text>
		<rect x="-170" y="24" width="170" height="60" rx="30" fill="${C.amber}"/><text x="-85" y="67" text-anchor="middle" ${F} font-size="36" font-weight="900" fill="${C.bg0}">BPM</text></g>`;
	}
	if (mode === 'heart') {
		const B0 = S.bars.find((b) => b.mode === 'heart'), a = ease((t - B0.t) / .4);
		s += `<g opacity="${a}" transform="translate(1780 200)"><text text-anchor="end" ${F} font-size="150" font-weight="900" fill="${C.heart}">72</text>
		<text x="0" y="70" text-anchor="end" ${F} font-size="36" font-weight="700" fill="${C.ink}" opacity=".8">次 / 分钟 · 心跳</text></g>`;
	}

	// subtitle (top left): one line per section, keyword in amber, types on at the section start
	let k0 = bi; while (k0 > 0 && S.bars[k0 - 1].line === B.line) k0--;
	const L = B.line, kw = B.kw, tl = t - S.bars[k0].t;
	if (L) {
		const n = Math.ceil(clamp(tl / .5) * L.length), shown = L.slice(0, n), a = clamp(tl / .15);
		const parts = kw && shown.includes(kw) ? shown.split(kw) : [shown];
		const tsp = parts.length > 1 ? `${parts[0]}<tspan fill="${C.amber}">${kw}</tspan>${parts.slice(1).join(kw)}` : shown;
		s += `<text x="140" y="190" ${F} font-size="64" font-weight="900" fill="${C.ink}" opacity="${a}">${tsp}</text>
		<rect x="140" y="222" width="${80 * a}" height="8" rx="4" fill="${C.amber}" opacity="${a}"/>`;
	}
	// series tag + handle
	s += `<text x="140" y="96" ${F} font-size="28" font-weight="700" fill="${C.ink}" opacity=".55" letter-spacing="4">从零做一首歌 · 第 1 课</text>
	<text x="1780" y="1040" text-anchor="end" ${F} font-size="24" font-weight="700" fill="${C.ink}" opacity=".35">喵喵乐队</text>`;
	// end: lights fade out after the last hit
	const tEnd = S.bars[S.bars.length - 1].t;
	if (t > tEnd + .9) s += `<rect width="${W}" height="${H}" fill="#03050F" opacity="${ease((t - tEnd - .9) / .7)}"/>`;
	art.innerHTML = s;
};
window.READY = true;

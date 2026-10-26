// 「小猫乐队」 key frames: four identical cats, one per instrument (Incredibox idea), above a GarageBand-style step grid
// whose rows match their colours (Chrome Music Lab idea: the playhead crosses a lit cell → that cat plays). Style A: flat + warm outline.
// node band.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, F = `font-family="Noto Sans CJK SC, sans-serif"`;
const O = '#4a3428', FUR = '#F6A35B', BELLY = '#FFE3C2', EAR = '#F7C1B0', BLUSH = '#F28C8C';
const C = { kick: '#E25B5B', snare: '#F2B33D', hat: '#2FB59A', bass: '#5B8DEF' };
const st = (w = 6) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// one cat, front view, origin at the seat. pose: hit | up | idle | sleep. inst decides the prop in its paws.
function cat(x, y, s, col, pose) {
	const sq = pose === 'hit' ? .93 : 1, lift = pose === 'hit' ? 10 : 0;
	let g = `<g transform="translate(${x} ${y}) scale(${s} ${s * sq})">`;
	g += `<path d="M-120 60 C-140 -10 -100 -80 0 -80 C100 -80 140 -10 120 60 C120 130 70 160 0 160 C-70 160 -120 130 -120 60Z" fill="${FUR}" ${st()}/>
		<ellipse cx="0" cy="80" rx="62" ry="56" fill="${BELLY}"/>`;
	g += `<path d="M110 120 C190 120 210 40 175 10" fill="none" stroke="${O}" stroke-width="34" stroke-linecap="round"/><path d="M110 120 C190 120 210 40 175 10" fill="none" stroke="${FUR}" stroke-width="22" stroke-linecap="round"/>`;
	// head
	const hy = -190 + lift;
	g += `<g transform="translate(0 ${hy})">
		<path d="M-120 -30 L-136 -150 L-48 -96Z" fill="${FUR}" ${st()}/><path d="M120 -30 L136 -150 L48 -96Z" fill="${FUR}" ${st()}/>
		<path d="M-112 -56 L-120 -124 L-74 -94Z" fill="${EAR}"/><path d="M112 -56 L120 -124 L74 -94Z" fill="${EAR}"/>
		<ellipse cx="0" cy="0" rx="152" ry="128" fill="${FUR}" ${st()}/>`;
	if (pose === 'hit') g += `<path d="M-84 -18 L-56 -4 L-84 10 M84 -18 L56 -4 L84 10" fill="none" ${st(10)}/>`;            // > <  squeezed eyes
	else if (pose === 'sleep') g += `<path d="M-84 -2 Q-66 8 -48 -2 M48 -2 Q66 8 84 -2" fill="none" ${st(9)}/>`;
	else g += `<ellipse cx="-62" cy="-6" rx="13" ry="17" fill="${O}"/><ellipse cx="62" cy="-6" rx="13" ry="17" fill="${O}"/><circle cx="-58" cy="-12" r="4" fill="#fff"/><circle cx="66" cy="-12" r="4" fill="#fff"/>`;
	g += `<ellipse cx="-92" cy="36" rx="26" ry="15" fill="${BLUSH}" opacity=".7"/><ellipse cx="92" cy="36" rx="26" ry="15" fill="${BLUSH}" opacity=".7"/>
		<path d="M-8 20 L8 20 L0 30Z" fill="${O}"/>${pose === 'hit' ? `<ellipse cx="0" cy="50" rx="16" ry="14" fill="#8a3a3a" ${st(5)}/>` : `<path d="M-24 40 Q-12 54 0 40 Q12 54 24 40" fill="none" ${st(6)}/>`}
		<path d="M-136 16 L-190 8 M-136 32 L-186 40 M136 16 L190 8 M136 32 L186 40" ${st(4)} opacity=".6"/></g>`;
	// bandana in the instrument colour (who plays what)
	g += `<path d="M-84 -78 Q0 -40 84 -78 L70 -50 Q0 -18 -70 -50Z" fill="${col}" ${st(5)}/><path d="M-10 -40 L10 -40 L0 -6Z" fill="${col}" ${st(5)}/>`;
	return g + `</g>`;
}
// arms + sticks drawn in scene coords so they meet the instrument; pose up/hit
function sticks(x, y, s, pose, tx, ty, spread = 120) {
	let g = '';
	for (const d of [-1, 1]) {
		const sx = x + d * 95 * s, sy = y - 40 * s;
		const hx = pose === 'hit' ? tx + d * spread * .5 : x + d * 170 * s, hy = pose === 'hit' ? ty - 60 * s : y - 200 * s;
		g += `<path d="M${sx} ${sy} Q${sx + d * 60 * s} ${(sy + hy) / 2} ${hx} ${hy}" fill="none" stroke="${O}" stroke-width="${46 * s}" stroke-linecap="round"/><path d="M${sx} ${sy} Q${sx + d * 60 * s} ${(sy + hy) / 2} ${hx} ${hy}" fill="none" stroke="${FUR}" stroke-width="${32 * s}" stroke-linecap="round"/>`;
		const [ex, ey] = pose === 'hit' ? [hx + d * 10 * s, ty - 4 * s] : [hx + d * 70 * s, hy - 150 * s];
		g += `<line x1="${hx}" y1="${hy}" x2="${ex}" y2="${ey}" stroke="${O}" stroke-width="${22 * s}" stroke-linecap="round"/><line x1="${hx}" y1="${hy}" x2="${ex}" y2="${ey}" stroke="#d9a066" stroke-width="${12 * s}" stroke-linecap="round"/>
		<circle cx="${hx}" cy="${hy}" r="${24 * s}" fill="${FUR}" ${st(5)}/>`;
	}
	return g;
}
const burst = (x, y, col, txt, sz = 1) => { let g = '';
	for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180; g += `<line x1="${x + Math.cos(a) * 70 * sz}" y1="${y + Math.sin(a) * 70 * sz}" x2="${x + Math.cos(a) * 110 * sz}" y2="${y + Math.sin(a) * 110 * sz}" stroke="${col}" stroke-width="${9 * sz}" stroke-linecap="round"/>`; }
	return g + `<text x="${x}" y="${y + 26 * sz}" text-anchor="middle" ${F} font-size="${80 * sz}" font-weight="900" fill="${col}" stroke="${O}" stroke-width="${5 * sz}" paint-order="stroke">${txt}</text>`; };

// patterns (16 steps): a basic rock beat
const PAT = { hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], bass: Array(16).fill(0) };

function frame(step, caption) {
	const hits = { kick: PAT.kick[step], snare: PAT.snare[step], hat: PAT.hat[step] };
	let s = `<rect width="${W}" height="${H}" fill="#FFF3DC"/>`;
	// backdrop: warm wall, bunting lights, wooden stage
	s += `<rect x="0" y="0" width="${W}" height="700" fill="#FBE3C4"/>`;
	s += `<path d="M0 26 Q240 56 480 26 Q720 56 960 26 Q1200 56 1440 26 Q1680 56 1920 26" fill="none" stroke="${O}" stroke-width="4"/>`;
	for (let i = 0; i < 24; i++) { const t = (i + .5) / 24, x = t * W, yy = 26 + 30 * Math.sin((t * 4 % 1) * Math.PI) - 18, c = [C.kick, C.snare, C.hat, C.bass][i % 4], lit = hits[['kick', 'snare', 'hat', 'bass'][i % 4]];
		s += `<circle cx="${x}" cy="${yy + 18}" r="${lit ? 15 : 11}" fill="${c}" opacity="${lit ? 1 : .45}" ${st(3)}/>${lit ? `<circle cx="${x}" cy="${yy + 18}" r="28" fill="${c}" opacity=".25"/>` : ''}`; }
	s += `<path d="M0 640 L1920 640 L1920 720 L0 720Z" fill="#D99A5F" ${st(5)}/>`;
	for (let x = 60; x < W; x += 160) s += `<line x1="${x}" y1="644" x2="${x - 20}" y2="716" stroke="${O}" stroke-width="3" opacity=".35"/>`;
	// the four cats (identical), each with its instrument
	const xs = { kick: 470, snare: 830, hat: 1190, bass: 1550 }, cy = 520, sc = .62;
	// kick cat: big bass drum in front
	{ const x = xs.kick, p = hits.kick ? 'hit' : 'up';
		s += cat(x, cy, sc, C.kick, p);
		s += `<g transform="translate(${x} ${cy + 70}) scale(${hits.kick ? 1.05 : 1})"><circle r="112" fill="${C.kick}" ${st(7)}/><circle r="82" fill="#FFF6E8" ${st(5)}/><text y="26" text-anchor="middle" ${F} font-size="64" font-weight="900" fill="${C.kick}">咚</text></g>`;
		s += `<path d="M${x - 20} ${cy - 30} L${x + 20} ${cy - 30}" stroke="none"/>`;
		// a foot pedal beater instead of sticks: paws on knees, bounce
		s += sticks(x, cy, sc, 'hit', x, cy - 30, 200).replace(/<line [^>]*\/>/g, '');
		if (hits.kick) s += burst(x, cy - 290, C.kick, '咚', .7); }
	// snare cat: snare drum on a stand
	{ const x = xs.snare, p = hits.snare ? 'hit' : 'up';
		s += cat(x, cy, sc, C.snare, p);
		s += `<line x1="${x}" y1="${cy + 30}" x2="${x}" y2="${cy + 120}" ${st(8)}/><path d="M${x - 50} ${cy + 120} L${x} ${cy + 80} L${x + 50} ${cy + 120}" fill="none" ${st(6)}/>
			<g transform="translate(${x} ${cy + 20})"><rect x="-90" y="-10" width="180" height="56" rx="10" fill="${C.snare}" ${st(6)}/><ellipse cx="0" cy="-10" rx="90" ry="22" fill="#FFF6E8" ${st(6)}/></g>`;
		s += sticks(x, cy, sc, p, x, cy + 4, 110);
		if (hits.snare) s += burst(x, cy - 290, C.snare, '啪', .7); }
	// hat cat: hi-hat (two cymbals on a stand)
	{ const x = xs.hat, p = hits.hat ? 'hit' : 'up';
		s += cat(x, cy, sc, C.hat, p);
		s += `<line x1="${x}" y1="${cy + 10}" x2="${x}" y2="${cy + 130}" ${st(8)}/><path d="M${x - 50} ${cy + 130} L${x} ${cy + 95} L${x + 50} ${cy + 130}" fill="none" ${st(6)}/>
			<g transform="translate(${x} ${cy + 10})"><path d="M-100 0 Q0 -30 100 0 Q0 10 -100 0Z" fill="${C.hat}" ${st(6)}/><path d="M-100 14 Q0 -14 100 14 Q0 24 -100 14Z" fill="${C.hat}" ${st(6)}/><circle cx="0" cy="-12" r="8" fill="${O}"/></g>`;
		s += sticks(x, cy, sc, p, x, cy - 6, 100);
		if (hits.hat) s += burst(x, cy - 290, C.hat, '次', .6); }
	// bass cat: not in the band yet (asleep, greyed) — joins in a later episode
	{ const x = xs.bass;
		s += `<g opacity=".45">${cat(x, cy, sc, C.bass, 'sleep')}<g transform="translate(${x + 30} ${cy + 60}) rotate(-30)"><rect x="-26" y="-210" width="18" height="230" fill="#8a5a3a" ${st(5)}/><path d="M-70 20 C-80 -40 20 -60 30 0 C50 40 10 90 -30 80 C-70 70 -60 40 -70 20Z" fill="${C.bass}" ${st(6)}/></g></g>
			<text x="${x + 110}" y="${cy - 230}" ${F} font-size="54" font-weight="900" fill="${C.bass}" opacity=".8">z<tspan font-size="40">z</tspan></text>
			<rect x="${x - 120}" y="${cy + 150}" width="240" height="56" rx="28" fill="#fff" ${st(4)}/><text x="${x}" y="${cy + 189}" text-anchor="middle" ${F} font-size="30" font-weight="700" fill="${O}">下一集加入</text>`; }
	// step grid (GarageBand-style), rows match the cats' colours
	const rows = [['hat', '镲'], ['snare', '军鼓'], ['kick', '底鼓'], ['bass', '贝斯']], gx = 380, cw = 72, gap = 8, rh = 56, gy = 756;
	const cx = (i) => gx + i * (cw + gap) + Math.floor(i / 4) * 16;
	s += `<rect x="${gx - 250}" y="${gy - 24}" width="${cx(15) + cw + 24 - gx + 250}" height="${4 * (rh + 10) + 34}" rx="26" fill="#fff" ${st(5)}/>`;
	rows.forEach(([k, n], r) => { const yy = gy + r * (rh + 10), on = k !== 'bass';
		s += `<circle cx="${gx - 200}" cy="${yy + rh / 2}" r="22" fill="${C[k]}" opacity="${on ? 1 : .35}" ${st(4)}/><text x="${gx - 166}" y="${yy + rh / 2 + 13}" ${F} font-size="36" font-weight="900" fill="${O}" opacity="${on ? 1 : .35}">${n}</text>`;
		PAT[k].forEach((v, i) => { const now = i === step, hit = v && now;
			s += `<rect x="${cx(i)}" y="${yy}" width="${cw}" height="${rh}" rx="12" fill="${v ? C[k] : (Math.floor(i / 4) % 2 ? '#F7EBDD' : '#FBF4EC')}" ${v ? st(4) : `stroke="#e6d6c4" stroke-width="3"`} ${hit ? `transform="translate(${cx(i) + cw / 2} ${yy + rh / 2}) scale(1.12) translate(${-cx(i) - cw / 2} ${-yy - rh / 2})"` : ''}/>`;
			if (hit) s += `<rect x="${cx(i) - 6}" y="${yy - 6}" width="${cw + 12}" height="${rh + 12}" rx="16" fill="none" stroke="${O}" stroke-width="6"/>`; }); });
	// playhead + beat numbers
	const px = cx(step) + cw / 2;
	s += `<rect x="${px - 5}" y="${gy - 34}" width="10" height="${4 * (rh + 10) + 20}" rx="5" fill="${O}" opacity=".85"/><path d="M${px - 18} ${gy - 46} L${px + 18} ${gy - 46} L${px} ${gy - 24}Z" fill="${O}"/>`;
	for (let b = 0; b < 4; b++) s += `<text x="${cx(b * 4) + cw / 2}" y="${gy + 4 * (rh + 10) + 46}" text-anchor="middle" ${F} font-size="34" font-weight="900" fill="${Math.floor(step / 4) === b ? C.kick : '#b9a08a'}">${b + 1}</text>`;
	// caption
	s += `<g transform="rotate(-1.5 960 120)"><rect x="${960 - caption[2] / 2}" y="52" width="${caption[2]}" height="100" rx="20" fill="#fff" ${st(6)}/>
		<text x="960" y="124" text-anchor="middle" ${F} font-size="56" font-weight="900" fill="${O}">${caption[0]}<tspan fill="${C.kick}">${caption[1]}</tspan></text></g>`;
	s += `<g transform="translate(1700 150) rotate(5)"><circle r="78" fill="#fff" ${st(5)}/><text y="12" text-anchor="middle" ${F} font-size="56" font-weight="900" fill="${C.kick}">120</text><text y="48" text-anchor="middle" ${F} font-size="22" font-weight="700" fill="${O}">BPM</text></g>`;
	return s;
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [name, step, cap] of [['band_step1', 0, ['格子亮了，', '那只猫就敲', 640]], ['band_step5', 4, ['第 2 拍，轮到', '军鼓猫', 640]]]) {
	await page.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${frame(step, cap)}</svg></body></html>`);
	await page.waitForTimeout(120); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log(name);
}
await browser.close();

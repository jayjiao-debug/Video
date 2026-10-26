// Key frames in the reference's feel (owner 2026-10-26 「视觉疲劳了，模仿之前那个感觉」): an editorial page —
// warm grey paper, hairlines and corner registration marks, a small chapter number, a small caption with a red dash and a red
// keyword, one huge number, and thin lanes at the bottom with a fixed red playhead (past = grey, now = red, next = black).
// Plus one full-bleed genre scene with the same lanes on a dark strip. Our own content and drawings. node editorial.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, F = `font-family="Noto Sans CJK SC, sans-serif"`;
const PAPER = '#E4DFD7', INK = '#151515', RED = '#E5432F', GREY = '#9a958e', HAIR = '#b9b3aa';
const L = 90, R = W - 90, T = 52, B = H - 52;          // the page frame

const cross = (x, y, c = INK) => `<path d="M${x - 12} ${y}H${x + 12}M${x} ${y - 12}V${y + 12}" stroke="${c}" stroke-width="2"/>`;
function page(ch, cap, key) {
	let s = `<rect width="${W}" height="${H}" fill="${PAPER}"/>`;
	s += cross(L, T) + cross(R, T) + cross(L, B) + cross(R, B);
	s += `<text x="${L + 30}" y="${T + 42}" ${F} font-size="30" font-weight="900" fill="${INK}">${ch}</text><line x1="${L + 30}" y1="${T + 62}" x2="${R - 30}" y2="${T + 62}" stroke="${INK}" stroke-width="2"/>`;
	s += `<rect x="${L + 70}" y="232" width="34" height="5" fill="${RED}"/>`;
	s += `<text x="${L + 70}" y="300" ${F} font-size="50" font-weight="700" fill="${INK}">${cap}<tspan fill="${RED}">${key}</tspan>。</text>`;
	return s;
}
// lanes: rows [{icon, kind:'dot'|'tick'|'dash', hits:[beat positions], big:[...] }], t in beats (playhead position), spacing px/beat
function lanes({ y0 = 690, rows, t, px = 150, head = 560, nums = true, bars = 4, dark = false, cols = {} }) {
	const fg = dark ? '#f3ece2' : INK, past = dark ? '#6d6478' : GREY, hair = dark ? '#5a5068' : HAIR;
	let s = `<line x1="${L + 60}" y1="${y0 - 50}" x2="${R}" y2="${y0 - 50}" stroke="${hair}" stroke-width="2"/>`;
	const X = (b) => head + (b - t) * px;
	// bar lines
	for (let b = Math.ceil(t - 4); b < t + 12; b++) if (b % bars === 0 && X(b) > L + 120 && X(b) < R) s += `<line x1="${X(b) - 18}" y1="${y0 - 34}" x2="${X(b) - 18}" y2="${y0 + rows.length * 76}" stroke="${hair}" stroke-width="2"/>`;
	rows.forEach((r, i) => { const y = y0 + i * 76, col = cols[i] || fg;
		s += `<g transform="translate(${L + 70} ${y})">${r.icon}</g>`;
		s += `<line x1="${L + 140}" y1="${y}" x2="${R}" y2="${y}" stroke="${hair}" stroke-width="1.5"/>`;
		for (const b of r.hits) { const x = X(b); if (x < L + 150 || x > R - 10) continue;
			const isNow = Math.abs(b - t) < .02, isPast = b < t - .02, c = isNow ? RED : isPast ? past : col, big = (r.big || []).includes(((b % bars) + bars) % bars);
			if (r.kind === 'dot') s += `<circle cx="${x}" cy="${y}" r="${(big ? 15 : 10) * (isNow ? 1.35 : 1)}" fill="${c}"/>`;
			else if (r.kind === 'tick') s += `<line x1="${x}" y1="${y - (isNow ? 16 : 11)}" x2="${x}" y2="${y + (isNow ? 16 : 11)}" stroke="${c}" stroke-width="${isNow ? 5 : 3.5}"/>`;
			else s += `<rect x="${x - 4}" y="${y - 7}" width="${px * (r.len || .9)}" height="14" rx="7" fill="${c}"/>`;
			if (nums && r.num) s += `<text x="${x}" y="${y + 48}" text-anchor="middle" ${F} font-size="24" font-weight="700" fill="${isPast ? past : isNow ? RED : fg}">${((b % bars) + bars) % bars + 1}</text>`; }
	});
	s += `<line x1="${head}" y1="${y0 - 70}" x2="${head}" y2="${y0 + rows.length * 76 + 10}" stroke="${RED}" stroke-width="3"/><path d="M${head - 10} ${y0 - 78}H${head + 10}L${head} ${y0 - 62}Z" fill="${RED}"/>`;
	if (!dark) s += `<line x1="${L + 60}" y1="${B - 26}" x2="${R}" y2="${B - 26}" stroke="${HAIR}" stroke-width="2"/>`;
	return s;
}
// small line icons for the lanes
const ICON = {
	heart: (c = INK) => `<path d="M0 10 C-22 -6 -14 -22 0 -12 C14 -22 22 -6 0 10Z" fill="none" stroke="${c}" stroke-width="3"/>`,
	kick: (c = INK) => `<circle r="14" fill="none" stroke="${c}" stroke-width="3"/><circle r="5" fill="${c}"/>`,
	snare: (c = INK) => `<rect x="-16" y="-8" width="32" height="16" rx="4" fill="none" stroke="${c}" stroke-width="3"/><path d="M-16 -8 Q0 -16 16 -8" fill="none" stroke="${c}" stroke-width="3"/>`,
	hat: (c = INK) => `<path d="M-18 -4 Q0 -14 18 -4Z M-18 4 Q0 -6 18 4Z" fill="none" stroke="${c}" stroke-width="3"/><line x1="0" y1="4" x2="0" y2="18" stroke="${c}" stroke-width="3"/>`,
};
const range = (a, b, st = 1) => { const r = []; for (let x = a; x < b; x += st) r.push(+x.toFixed(3)); return r; };

const frames = {
	// 00 · the first rhythm: mother's heartbeat
	E1: () => { let s = page('00', '你听过的第一首歌，是', '妈妈的心跳');
		s += `<text x="${R - 120}" y="430" text-anchor="end" ${F} font-size="260" font-weight="900" fill="${INK}" letter-spacing="-8">72</text>
			<text x="${R - 110}" y="300" ${F} font-size="40" font-weight="900" fill="${RED}">次</text><text x="${R - 110}" y="352" ${F} font-size="40" font-weight="900" fill="${RED}">/分</text>
			<line x1="${R - 110}" y1="372" x2="${R - 40}" y2="372" stroke="${RED}" stroke-width="5"/>`;
		// a thin heartbeat trace, left of the number
		s += `<path d="M${L + 70} 470 H930 l20 -50 l24 110 l22 -90 l14 30 H1100" fill="none" stroke="${INK}" stroke-width="3"/>`;
		s += lanes({ y0: 830, rows: [{ icon: ICON.heart(), kind: 'dot', hits: range(-8, 20), num: true }], t: 2, px: 190 });
		return s; },
	// 01 · BPM
	E2: () => { let s = page('01', '每分钟敲几下，就叫 ', 'BPM');
		s += `<g transform="translate(${R - 800} 300)">${[0, 1, 2, 3].map((i) => `<line x1="0" y1="${i * 18}" x2="${120 - i * 0}" y2="${i * 18}" stroke="${i < 3 ? RED : GREY}" stroke-width="7"/>`).join('')}</g>`;
		s += `<text x="${R - 150}" y="420" text-anchor="end" ${F} font-size="260" font-weight="900" fill="${INK}" letter-spacing="-8">120</text>
			<text x="${R - 140}" y="404" ${F} font-size="46" font-weight="900" fill="${RED}">BPM</text><line x1="${R - 140}" y1="424" x2="${R - 40}" y2="424" stroke="${RED}" stroke-width="5"/>`;
		s += lanes({ y0: 780, rows: [{ icon: ICON.hat(), kind: 'tick', hits: range(-8, 20, .5) }, { icon: ICON.kick(), kind: 'dot', hits: range(-8, 20), num: true }], t: 5, px: 150 });
		return s; },
	// 02 · strong and weak (板眼)
	E3: () => { let s = page('02', '京剧里，强拍叫“板”，弱拍叫“', '眼”');
		s += `<text x="${R - 60}" y="430" text-anchor="end" ${F} font-size="200" font-weight="900" fill="${INK}" letter-spacing="-4">板<tspan fill="${GREY}" font-size="120"> 眼眼眼</tspan></text>`;
		s += `<text x="${R - 60}" y="500" text-anchor="end" ${F} font-size="40" font-weight="900" fill="${RED}">一板三眼 = 4/4</text>`;
		s += lanes({ y0: 830, rows: [{ icon: ICON.snare(), kind: 'dot', hits: range(-8, 20), big: [0], num: true }], t: 4, px: 170 });
		return s; },
};
// a genre scene: 3/4 waltz at dusk on a frozen lake; dark lane strip at the bottom
frames.E4 = () => {
	let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2A5C"/><stop offset=".55" stop-color="#B05A7A"/><stop offset="1" stop-color="#F2A66B"/></linearGradient>
		<linearGradient id="ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9B79A"/><stop offset="1" stop-color="#6E6390"/></linearGradient></defs>
	<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
	let k = 3; const rn = () => (k = (k * 9301 + 49297) % 233280) / 233280;
	for (let i = 0; i < 70; i++) s += `<circle cx="${rn() * W}" cy="${rn() * 300}" r="${1 + rn() * 1.8}" fill="#fff" opacity="${.3 + rn() * .6}"/>`;
	s += `<circle cx="1260" cy="520" r="120" fill="#FFE2B0"/><circle cx="1260" cy="520" r="200" fill="#FFE2B0" opacity=".18"/>`;
	s += `<path d="M0 560 C260 500 520 540 820 520 C1100 500 1400 560 1920 520 L1920 640 L0 640Z" fill="#5B3F6E"/>`;
	for (let i = 0; i < 48; i++) { const x = i * 42 + rn() * 24, h = 60 + rn() * 110, y = 628; s += `<path d="M${x} ${y - h} L${x + h * .2} ${y} L${x - h * .2} ${y}Z" fill="#2E2140"/>`; }
	s += `<rect x="0" y="626" width="${W}" height="220" fill="url(#ice)"/>`;
	for (let i = 0; i < 8; i++) s += `<rect x="${1180 + rn() * 160}" y="${650 + i * 22}" width="${40 + rn() * 80}" height="5" rx="2" fill="#FFE2B0" opacity="${.5 - i * .05}"/>`;
	// skate trail: three loops, one big two small
	s += `<path d="M380 800 C330 720 520 700 560 770 C590 820 520 840 500 800 M560 770 C600 720 720 730 700 790 C690 820 650 815 655 790 M700 790 C740 735 850 745 835 800 C825 830 790 825 795 800" fill="none" stroke="#fff" stroke-width="4" opacity=".55"/>`;
	// the couple waltzing (silhouettes)
	const sil = '#1E1530';
	s += `<g transform="translate(960 812)" fill="${sil}">
		<ellipse cx="0" cy="6" rx="120" ry="10" fill="#000" opacity=".18"/>
		<path d="M-62 0 L-54 -150 L-28 -150 L-36 0Z M-22 0 L-26 -150 L-4 -150 L-6 0Z"/>
		<path d="M-70 -150 L-2 -150 L4 -260 C2 -290 -70 -292 -76 -260Z"/>
		<circle cx="-36" cy="-300" r="26"/>
		<path d="M-4 -250 C30 -270 60 -270 80 -262" fill="none" stroke="${sil}" stroke-width="16" stroke-linecap="round"/>
		<path d="M24 0 C40 -40 30 -90 50 -140 L120 -140 C150 -90 150 -40 170 0Z"/>
		<path d="M54 -140 L58 -240 C60 -268 112 -268 116 -240 L118 -140Z"/>
		<circle cx="88" cy="-286" r="24"/><circle cx="102" cy="-306" r="12"/>
		<path d="M58 -236 C20 -246 -10 -240 -40 -228" fill="none" stroke="${sil}" stroke-width="13" stroke-linecap="round"/>
		<path d="M116 -236 C150 -260 170 -290 176 -320" fill="none" stroke="${sil}" stroke-width="13" stroke-linecap="round"/></g>`;
	s += `<path d="M820 560 C860 500 1100 500 1140 560" fill="none" stroke="#fff" stroke-width="3" opacity=".45" stroke-dasharray="2 12" stroke-linecap="round"/>`;
	// caption label (top-left)
	s += `<rect x="${L}" y="${T + 40}" width="660" height="92" fill="#1E1530" opacity=".85"/><rect x="${L + 660}" y="${T + 40}" width="6" height="92" fill="#F2C14E"/>
		<text x="${L + 34}" y="${T + 101}" ${F} font-size="46" font-weight="700" fill="#F7E7C6">强、弱、弱——像在冰上转圈。</text>`;
	// dark lane strip
	s += `<rect x="0" y="866" width="${W}" height="${H - 866}" fill="#1E1530"/><rect x="0" y="866" width="${W}" height="4" fill="#F2C14E" opacity=".7"/>`;
	s += `<text x="${L + 40}" y="905" ${F} font-size="22" font-weight="900" fill="#F2C14E">3/4</text>`;
	const t = 3, px = 120, head = 560, X = (b) => head + (b - t) * px;
	[[930, 'kick', range(-6, 16, 3), '#F2C14E', 14], [990, 'snare', range(-6, 16).filter((b) => ((b % 3) + 3) % 3), '#F07FA0', 9]].forEach(([y, ic, hits, c, r]) => {
		s += `<g transform="translate(${L + 70} ${y})">${ICON[ic]('#f3ece2')}</g><line x1="${L + 140}" y1="${y}" x2="${R}" y2="${y}" stroke="#4a3f5a" stroke-width="1.5"/>`;
		for (const b of hits) { const x = X(b); if (x < L + 150 || x > R) continue; const now = Math.abs(b - t) < .02, past = b < t - .02;
			s += `<circle cx="${x}" cy="${y}" r="${r * (now ? 1.4 : 1)}" fill="${now ? '#fff' : past ? '#6d6478' : c}"/>`; } });
	s += `<line x1="${head}" y1="880" x2="${head}" y2="1030" stroke="#F2C14E" stroke-width="3"/>`;
	return s;
};
const browser = await chromium.launch(); const page_ = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries(frames)) {
	await page_.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg></body></html>`);
	await page_.waitForTimeout(100); await page_.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

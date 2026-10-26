// Three different LAYOUTS + styles for the same moment (120 BPM, beat 1), none using the reference's skeleton
// (caption top-left, big number top-right, lanes at the bottom). node layouts.mjs <outdir>
//  L1 落墨  — ink drops fall down a centre column into a pond; vertical text on both sides (symmetric, vertical reading)
//  L2 剪纸  — a papercut scene; the beats ARE the lanterns on a string that light up one by one (no UI at all)
//  L3 四格  — a comic strip: one bar = four panels, the panel on the beat is in colour and pops
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, SERIF = `font-family="Noto Serif CJK SC, serif"`, SANS = `font-family="Noto Sans CJK SC, sans-serif"`;
const vt = (txt, x, y, size, col, w = 900, gap = 1.1, f = SERIF) => [...txt].map((c, i) => `<text x="${x}" y="${y + i * size * gap}" text-anchor="middle" ${f} font-size="${size}" font-weight="${w}" fill="${col}">${c}</text>`).join('');

function L1() {   // 落墨
	const PAPER = '#F2ECDF', INK = '#1F2733', ZHU = '#C23B2E';
	let s = `<defs><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".012 .9" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .09 0"/></filter>
		<filter id="br" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter>
		<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
		<linearGradient id="pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CED3"/><stop offset="1" stop-color="${PAPER}"/></linearGradient></defs>
		<rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" filter="url(#pp)"/>`;
	const cx = 960, surf = 800, px = 150, t = 0;
	// pond
	s += `<ellipse cx="${cx}" cy="${surf + 90}" rx="520" ry="110" fill="url(#pond)" opacity=".8" filter="url(#bl)"/>`;
	s += `<path d="M${cx - 420} ${surf} C${cx - 200} ${surf - 4} ${cx + 200} ${surf + 4} ${cx + 420} ${surf}" fill="none" stroke="${INK}" stroke-width="4" opacity=".6" filter="url(#br)"/>`;
	// threads the drops fall along: 鼓 (centre) and 镲 (thin, right)
	s += `<line x1="${cx}" y1="60" x2="${cx}" y2="${surf}" stroke="${INK}" stroke-width="1.5" opacity=".18"/><line x1="${cx + 140}" y1="60" x2="${cx + 140}" y2="${surf}" stroke="${INK}" stroke-width="1" opacity=".14"/>`;
	for (let b = 1; b < 6; b++) { const y = surf - (b - t) * px; if (y < 70) continue; const strong = b % 4 === 0;
		s += `<path d="M${cx} ${y - 34 * (strong ? 1.3 : 1)} C${cx + 18} ${y - 6} ${cx + 18} ${y + 14} ${cx} ${y + 16} C${cx - 18} ${y + 14} ${cx - 18} ${y - 6} ${cx} ${y - 34 * (strong ? 1.3 : 1)}Z" fill="${INK}" transform="translate(${cx} ${y}) scale(${strong ? 1.35 : 1}) translate(${-cx} ${-y})" filter="url(#br)"/>`; }
	for (let h = 1; h < 11; h++) { const y = surf - (h / 2 - t) * px; if (y < 70) continue; s += `<circle cx="${cx + 140}" cy="${y}" r="7" fill="${INK}" opacity=".75" filter="url(#br)"/>`; }
	// the drop landing now: cinnabar splash + ripples
	for (let i = 1; i <= 4; i++) s += `<ellipse cx="${cx}" cy="${surf}" rx="${40 * i}" ry="${10 * i}" fill="none" stroke="${i === 1 ? ZHU : INK}" stroke-width="${5 - i}" opacity="${1 - i * .2}" filter="url(#br)"/>`;
	s += `<path d="M${cx - 30} ${surf - 4} L${cx - 46} ${surf - 50} M${cx} ${surf - 6} L${cx} ${surf - 64} M${cx + 30} ${surf - 4} L${cx + 46} ${surf - 50}" stroke="${ZHU}" stroke-width="7" stroke-linecap="round" filter="url(#br)"/>`;
	s += `<circle cx="${cx + 140}" cy="${surf}" r="10" fill="${ZHU}"/>${[1, 2].map((i) => `<ellipse cx="${cx + 140}" cy="${surf}" rx="${18 * i}" ry="${5 * i}" fill="none" stroke="${INK}" stroke-width="2" opacity=".4"/>`).join('')}`;
	// past drops: rings widening below the surface (reflections)
	s += `<ellipse cx="${cx}" cy="${surf + 60}" rx="230" ry="26" fill="none" stroke="${INK}" stroke-width="2" opacity=".18"/><ellipse cx="${cx}" cy="${surf + 110}" rx="330" ry="36" fill="none" stroke="${INK}" stroke-width="2" opacity=".1"/>`;
	s += `<text x="${cx}" y="${surf + 170}" text-anchor="middle" ${SERIF} font-size="44" font-weight="900" fill="${ZHU}">一</text>`;
	// left: the big vertical title + seal; right: vertical caption columns + the number
	s += vt('速度', 330, 330, 190, INK, 900, 1.05);
	s += `<g transform="translate(286 110) rotate(-3)" filter="url(#br)"><rect width="88" height="88" rx="6" fill="${ZHU}"/><text x="44" y="64" text-anchor="middle" ${SERIF} font-size="52" font-weight="900" fill="${PAPER}">壹</text></g>`;
	s += vt('一分钟落下几滴', 1640, 190, 52, INK, 700) + vt('就叫', 1550, 190, 52, INK, 700);
	s += `<text x="1550" y="370" text-anchor="middle" ${SERIF} font-size="44" font-weight="900" fill="${ZHU}" transform="rotate(90 1550 370)">BPM</text>`;
	s += `<text x="1600" y="840" text-anchor="middle" ${SERIF} font-size="150" font-weight="900" fill="${INK}">120</text>`;
	return s;
}

function L2() {   // 剪纸
	const R1 = '#6E1410', R2 = '#9C2018', R3 = '#C8352A', GOLD = '#F4BE4F', CREAM = '#FBE7C8';
	let s = `<defs><filter id="ds" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#2a0505" flood-opacity=".55"/></filter>
		<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="22"/></filter>
		<pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="4" fill="${R1}"/></pattern></defs>
		<rect width="${W}" height="${H}" fill="${R1}"/>`;
	// back layer: cut clouds
	const cloud = (x, y, sc, c) => `<g transform="translate(${x} ${y}) scale(${sc})" filter="url(#ds)"><path d="M0 0 C0 -60 70 -60 76 -12 C86 -80 180 -80 184 -10 C200 -52 270 -40 262 10 L0 10Z" fill="${c}"/><path d="M40 -6 C40 -30 70 -30 70 -8 M120 -8 C120 -46 160 -46 160 -10" fill="none" stroke="${R1}" stroke-width="10" stroke-linecap="round"/></g>`;
	s += `<path d="M0 420 C300 340 600 380 960 340 C1320 300 1620 380 1920 330 L1920 1080 L0 1080Z" fill="${R2}" filter="url(#ds)"/>`;
	s += cloud(120, 520, 1.2, R3) + cloud(1500, 480, 1.1, R3) + cloud(900, 600, .8, R2);
	// lantern string: 8 lanterns = two bars; the beat on the playhead lights up (beat 1 of bar 2), strong beats are bigger
	const pts = [...Array(8).keys()].map((i) => { const x = 220 + i * 210; return [x, 150 + 60 * Math.sin((i / 7) * Math.PI)]; });
	s += `<path d="M120 120 ${pts.map(([x, y]) => `L${x} ${y}`).join(' ')} L1800 120" fill="none" stroke="${GOLD}" stroke-width="4" opacity=".7"/>`;
	pts.forEach(([x, y], i) => { const strong = i % 4 === 0, now = i === 4, past = i < 4, r = strong ? 62 : 46;
		if (now) s += `<circle cx="${x}" cy="${y + r + 40}" r="${r * 2.6}" fill="${GOLD}" opacity=".45" filter="url(#glow)"/>`;
		s += `<g transform="rotate(${now ? 8 : 0} ${x} ${y})" filter="url(#ds)"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 30}" stroke="${GOLD}" stroke-width="4"/>
			<rect x="${x - r * .45}" y="${y + 24}" width="${r * .9}" height="14" rx="4" fill="${GOLD}"/>
			<ellipse cx="${x}" cy="${y + 40 + r}" rx="${r}" ry="${r * 1.05}" fill="${now ? GOLD : past ? '#E0663C' : R3}"/>
			<path d="M${x - r * .5} ${y + 44} Q${x - r * .8} ${y + 40 + r} ${x - r * .5} ${y + 36 + 2 * r} M${x + r * .5} ${y + 44} Q${x + r * .8} ${y + 40 + r} ${x + r * .5} ${y + 36 + 2 * r}" fill="none" stroke="${now ? '#c98a1a' : R2}" stroke-width="4"/>
			<text x="${x}" y="${y + 40 + r + r * .3}" text-anchor="middle" ${SERIF} font-size="${r * .8}" font-weight="900" fill="${now ? R2 : CREAM}">${'一二三四'[i % 4]}</text>
			<rect x="${x - r * .45}" y="${y + 32 + 2 * r}" width="${r * .9}" height="14" rx="4" fill="${GOLD}"/><path d="M${x} ${y + 46 + 2 * r} L${x} ${y + 100 + 2 * r}" stroke="${GOLD}" stroke-width="5"/></g>`; });
	// the papercut drummer at a big drum (front layer), mallet coming down
	s += `<g filter="url(#ds)"><path d="M0 860 C400 800 700 830 960 800 C1240 770 1560 830 1920 800 L1920 1080 L0 1080Z" fill="${R3}"/></g>`;
	s += `<g transform="translate(960 760)" filter="url(#ds)">
		<rect x="-200" y="-40" width="400" height="200" rx="30" fill="${R2}"/><ellipse cx="0" cy="-40" rx="200" ry="54" fill="${CREAM}"/><ellipse cx="0" cy="-40" rx="200" ry="54" fill="none" stroke="${GOLD}" stroke-width="8"/>
		${[...Array(10).keys()].map((i) => `<circle cx="${-180 + i * 40}" cy="${-6 + Math.sin(i / 9 * Math.PI) * 30}" r="7" fill="${GOLD}"/>`).join('')}
		<rect x="-200" y="20" width="400" height="140" fill="url(#dots)" opacity=".5"/>
		<path d="M-150 160 L-180 300 M150 160 L180 300" stroke="${R1}" stroke-width="16"/></g>`;
	s += `<g transform="translate(1250 560)" filter="url(#ds)" fill="${R1}">
		<path d="M-40 230 L-60 70 C-60 20 60 20 60 70 L40 230Z"/><circle cx="0" cy="-10" r="44"/><path d="M-50 -30 C-30 -80 30 -80 50 -30Z"/>
		<path d="M-40 60 C-120 40 -170 20 -220 40" fill="none" stroke="${R1}" stroke-width="26" stroke-linecap="round"/>
		<path d="M-210 30 L-300 150" stroke="#E9C18B" stroke-width="14" stroke-linecap="round"/><circle cx="-300" cy="150" r="22" fill="${CREAM}"/>
		<circle cx="-14" cy="-14" r="6" fill="${R3}"/><path d="M-30 110 h60 M-26 140 h52" stroke="${R3}" stroke-width="6"/></g>`;
	// the hit: gold burst on the drum skin
	for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; s += `<line x1="${660 + Math.cos(a) * 60}" y1="${700 + Math.sin(a) * 26}" x2="${660 + Math.cos(a) * 120}" y2="${700 + Math.sin(a) * 52}" stroke="${GOLD}" stroke-width="7" stroke-linecap="round" transform="translate(300 0)"/>`; }
	// caption on a paper banner at the bottom + number medallion
	s += `<g filter="url(#ds)"><path d="M520 950 L1400 950 L1440 985 L1400 1020 L520 1020 L480 985Z" fill="${CREAM}"/></g>
		<text x="960" y="1000" text-anchor="middle" ${SERIF} font-size="44" font-weight="900" fill="${R2}">一分钟亮几盏，就是多少 <tspan fill="${R1}">BPM</tspan></text>`;
	s += `<g transform="translate(1660 640)" filter="url(#ds)"><circle r="110" fill="${GOLD}"/><circle r="92" fill="none" stroke="${R2}" stroke-width="4" stroke-dasharray="6 8"/>
		<text y="18" text-anchor="middle" ${SERIF} font-size="76" font-weight="900" fill="${R2}">120</text><text y="60" text-anchor="middle" ${SANS} font-size="24" font-weight="900" fill="${R2}">BPM</text></g>`;
	return s;
}

function L3() {   // 四格
	const BG = '#FAF7F0', K = '#111', Y = '#FFD23F';
	let s = `<defs><pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5" cy="5" r="2.2" fill="${K}" opacity=".35"/></pattern></defs>
		<rect width="${W}" height="${H}" fill="${BG}"/>`;
	// narration box
	s += `<rect x="120" y="70" width="560" height="96" fill="${K}"/><text x="150" y="134" ${SANS} font-size="46" font-weight="900" fill="#fff">一小节 = 四格</text>`;
	s += `<text x="1800" y="134" text-anchor="end" ${SANS} font-size="54" font-weight="900" fill="${K}">♩ = 120</text>`;
	// four panels: the first (strong beat) wider; the current one in colour with speed lines
	const xs = [[120, 520], [660, 380], [1060, 380], [1460, 340]], y0 = 220, ph = 600;
	xs.forEach(([x, w], i) => { const now = i === 0, strong = i === 0;
		s += `<rect x="${x}" y="${y0}" width="${w}" height="${ph}" fill="${now ? Y : '#fff'}" stroke="${K}" stroke-width="${now ? 12 : 7}"/>`;
		if (!now) s += `<rect x="${x}" y="${y0}" width="${w}" height="${ph}" fill="url(#ht)" opacity=".5"/>`;
		const cx = x + w / 2, gy = y0 + ph - 120;
		// ground + a sneaker coming down (stomp on the strong beat, tap on the weak ones)
		s += `<line x1="${x + 30}" y1="${gy + 40}" x2="${x + w - 30}" y2="${gy + 40}" stroke="${K}" stroke-width="6"/>`;
		const fy = now ? gy - 20 : gy - 110 - i * 10, sc = strong ? 1.25 : .9;
		s += `<g transform="translate(${cx} ${fy}) scale(${sc})"><path d="M-20 -230 L30 -230 L36 -40 L-24 -40Z" fill="#fff" stroke="${K}" stroke-width="8"/>
			<path d="M-34 -40 C-34 -70 40 -70 60 -46 C110 -30 140 -10 140 20 L140 40 L-40 40 Z" fill="${now ? '#E8473B' : '#fff'}" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
			<path d="M-40 40 L140 40" stroke="${K}" stroke-width="16"/><path d="M10 -46 L30 -20 M30 -50 L50 -24" stroke="${K}" stroke-width="5"/></g>`;
		if (now) { for (let j = 0; j < 9; j++) { const a = Math.PI + (j / 8) * Math.PI; s += `<line x1="${cx + 40 + Math.cos(a) * 190}" y1="${gy + 40 + Math.sin(a) * 120}" x2="${cx + 40 + Math.cos(a) * 270}" y2="${gy + 40 + Math.sin(a) * 170}" stroke="${K}" stroke-width="8" stroke-linecap="round"/>`; }
			s += `<text x="${x + 40}" y="${y0 + 170}" ${SANS} font-size="150" font-weight="900" fill="#E8473B" stroke="${K}" stroke-width="10" paint-order="stroke" transform="rotate(-8 ${x + 40} ${y0 + 170})">咚！</text>`; }
		else s += `<text x="${x + 30}" y="${y0 + 100}" ${SANS} font-size="70" font-weight="900" fill="#fff" stroke="${K}" stroke-width="7" paint-order="stroke" opacity=".85">哒</text>`;
		s += `<text x="${cx}" y="${y0 + ph + 110}" text-anchor="middle" ${SANS} font-size="${now ? 110 : 80}" font-weight="900" fill="${now ? '#E8473B' : '#bbb'}">${i + 1}</text>`;
		if (strong) s += `<text x="${cx}" y="${y0 + ph + 170}" text-anchor="middle" ${SANS} font-size="34" font-weight="900" fill="${K}">强</text>`; else s += `<text x="${cx}" y="${y0 + ph + 170}" text-anchor="middle" ${SANS} font-size="30" font-weight="700" fill="#999">弱</text>`;
	});
	return s;
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries({ L1_落墨: L1, L2_剪纸: L2, L3_四格: L3 })) {
	await page.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg></body></html>`);
	await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

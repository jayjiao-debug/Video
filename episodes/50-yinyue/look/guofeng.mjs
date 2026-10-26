// 国风水墨 key frames (owner 2026-10-26: keep the calm, airy feel of the reference, but our own signature):
// rice paper, indigo-black ink with brush edges, a cinnabar seal for the chapter and for "now", serif captions,
// beats as ink dots that bleed into wash once played (板 = solid blot, 眼 = hollow ink ring), ink-wash scenes. node guofeng.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, SERIF = `font-family="Noto Serif CJK SC, serif"`;
const PAPER = '#F2ECDF', INK = '#1F2733', WASH = '#9AA3AE', ZHU = '#C23B2E';
const defs = `<defs>
 <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .9" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .09 0"/></filter>
 <filter id="brush" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter>
 <filter id="dry" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.2 .08" numOctaves="1" seed="8" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.9 1.25" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
 <filter id="bleed" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
 <filter id="mist" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
</defs>`;
const paper = () => `<rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" filter="url(#paper)"/>
	<rect width="${W}" height="${H}" fill="none" stroke="#d9cfbd" stroke-width="40" opacity=".5" filter="url(#mist)"/>`;
// cinnabar seal with the chapter (top-left)
const seal = (txt, x = 120, y = 70, s = 96) => `<g transform="translate(${x} ${y}) rotate(-2)" filter="url(#brush)"><rect width="${s}" height="${s}" rx="8" fill="${ZHU}"/>
	<rect x="7" y="7" width="${s - 14}" height="${s - 14}" rx="4" fill="none" stroke="${PAPER}" stroke-width="3" opacity=".8"/>
	<text x="${s / 2}" y="${s * .7}" text-anchor="middle" ${SERIF} font-size="${s * .58}" font-weight="900" fill="${PAPER}">${txt}</text></g>`;
const cap = (parts, x = 140, y = 300, size = 54) => `<text x="${x}" y="${y}" ${SERIF} font-size="${size}" font-weight="700" fill="${INK}">${parts.map((p) => typeof p === 'string' ? p : `<tspan fill="${ZHU}">${p.k}</tspan>`).join('')}</text>`;
// a brushed beat line: dots move left→right toward a cinnabar brush stroke (the playhead). kinds: blot | ring | tick
function beatLine({ y = 860, rows, t, px = 170, head = 600, nums = true, bars = 4 }) {
	let s = `<path d="M150 ${y - 70} C700 ${y - 74} 1300 ${y - 66} 1790 ${y - 70}" fill="none" stroke="${INK}" stroke-width="3" opacity=".35" filter="url(#brush)"/>`;
	const X = (b) => head + (b - t) * px;
	rows.forEach((r, i) => { const yy = y + i * 90;
		s += `<text x="150" y="${yy + 14}" ${SERIF} font-size="34" font-weight="700" fill="${INK}" opacity=".75">${r.name}</text>`;
		s += `<path d="M240 ${yy} C800 ${yy + 3} 1300 ${yy - 3} 1790 ${yy}" fill="none" stroke="${INK}" stroke-width="2" opacity=".25"/>`;
		for (const b of r.hits) { const x = X(b); if (x < 260 || x > 1780) continue;
			const now = Math.abs(b - t) < .02, past = b < t - .02, pos = ((b % bars) + bars) % bars, kind = r.kind(pos), age = t - b;
			const c = now ? ZHU : INK, op = past ? Math.max(.12, .5 - age * .1) : 1;
			if (past) s += `<circle cx="${x}" cy="${yy}" r="${kind === 'blot' ? 26 : 18}" fill="${INK}" opacity="${op * .45}" filter="url(#bleed)"/>`;
			if (kind === 'blot') s += `<circle cx="${x}" cy="${yy}" r="${now ? 24 : 17}" fill="${c}" opacity="${past ? op : 1}" filter="url(#brush)"/>`;
			else if (kind === 'ring') s += `<circle cx="${x}" cy="${yy}" r="${now ? 18 : 13}" fill="none" stroke="${c}" stroke-width="${now ? 6 : 4.5}" opacity="${past ? op : 1}" filter="url(#brush)"/>`;
			else s += `<path d="M${x - 3} ${yy - 14} Q${x + 2} ${yy} ${x - 1} ${yy + 14}" fill="none" stroke="${c}" stroke-width="${now ? 7 : 5}" stroke-linecap="round" opacity="${past ? op : 1}" filter="url(#brush)"/>`;
			if (nums && r.num) s += `<text x="${x}" y="${yy + 56}" text-anchor="middle" ${SERIF} font-size="26" font-weight="700" fill="${now ? ZHU : INK}" opacity="${past ? .3 : .7}">${'一二三四五六七八'[pos]}</text>`; }
	});
	// the playhead: a vertical cinnabar brush stroke
	s += `<path d="M${head - 2} ${y - 96} C${head + 3} ${y - 20} ${head - 3} ${y + rows.length * 90 - 40} ${head + 1} ${y + rows.length * 90 - 6}" fill="none" stroke="${ZHU}" stroke-width="7" stroke-linecap="round" filter="url(#brush)"/>`;
	return s;
};
const range = (a, b, st = 1) => { const r = []; for (let x = a; x < b; x += st) r.push(+x.toFixed(3)); return r; };
const vtext = (txt, x, y, size, col = INK, w = 900, gap = 1.12) => [...txt].map((c, i) => `<text x="${x}" y="${y + i * size * gap}" text-anchor="middle" ${SERIF} font-size="${size}" font-weight="${w}" fill="${col}">${c}</text>`).join('');

const frames = {
	G1: () => { let s = paper() + seal('序');
		s += cap(['你听过的第一首歌，'], 140, 330, 50) + cap(['是', { k: '妈妈的心跳' }, '。'], 140, 420, 84);
		// an ink enso (circle) that breathes with the heart; wash ripples
		const cx = 1340, cy = 400;
		for (let i = 3; i >= 1; i--) s += `<circle cx="${cx}" cy="${cy}" r="${150 + i * 70}" fill="none" stroke="${INK}" stroke-width="${10 - i * 2}" opacity="${.12 - i * .02}" filter="url(#bleed)"/>`;
		s += `<path d="M${cx + 120} ${cy - 150} C${cx - 60} ${cy - 250} ${cx - 230} ${cy - 60} ${cx - 160} ${cy + 100} C${cx - 90} ${cy + 230} ${cx + 140} ${cy + 220} ${cx + 190} ${cy + 40} C${cx + 215} ${cy - 50} ${cx + 180} ${cy - 110} ${cx + 140} ${cy - 135}"
			fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round" filter="url(#dry)"/>`;
		s += `<circle cx="${cx}" cy="${cy}" r="40" fill="${ZHU}" filter="url(#brush)"/><circle cx="${cx}" cy="${cy}" r="70" fill="${ZHU}" opacity=".18" filter="url(#bleed)"/>`;
		s += vtext('每分钟七十二下', 1690, 240, 40, INK, 700);
		s += beatLine({ rows: [{ name: '心跳', kind: () => 'blot', hits: range(-8, 20), num: true }], t: 2, px: 200 });
		return s; },
	G2: () => { let s = paper() + seal('壹');
		s += cap(['每分钟敲几下，就叫 ', { k: 'BPM' }, '。'], 140, 330, 54);
		s += `<g filter="url(#dry)"><text x="1600" y="560" text-anchor="end" ${SERIF} font-size="330" font-weight="900" fill="${INK}" letter-spacing="-10">120</text></g>`;
		s += vtext('每分钟一百二十拍', 1790, 230, 34, INK, 700);
		s += `<g transform="translate(1530 590) rotate(-4)" filter="url(#brush)"><rect width="74" height="40" rx="5" fill="${ZHU}"/><text x="37" y="30" text-anchor="middle" ${SERIF} font-size="26" font-weight="900" fill="${PAPER}">BPM</text></g>`;
		s += beatLine({ y: 820, rows: [{ name: '镲', kind: () => 'tick', hits: range(-8, 20, .5) }, { name: '鼓', kind: () => 'blot', hits: range(-8, 20), num: true }], t: 5, px: 160 });
		return s; },
	G3: () => { let s = paper() + seal('贰');
		s += cap(['京剧里，强拍叫“', { k: '板' }, '”，弱拍叫“眼”。'], 140, 330, 54);
		// 板 as a blot with the character in a seal, 眼 as three hollow ink rings
		const y = 520;
		s += `<g transform="translate(1030 ${y})"><circle r="92" fill="${INK}" filter="url(#dry)"/><text y="34" text-anchor="middle" ${SERIF} font-size="96" font-weight="900" fill="${PAPER}">板</text></g>`;
		[1260, 1460, 1660].forEach((x) => s += `<g transform="translate(${x} ${y})"><circle r="62" fill="none" stroke="${INK}" stroke-width="12" filter="url(#dry)"/><text y="22" text-anchor="middle" ${SERIF} font-size="58" font-weight="700" fill="${INK}" opacity=".8">眼</text></g>`);
		s += `<text x="1030" y="${y + 170}" text-anchor="middle" ${SERIF} font-size="40" font-weight="700" fill="${ZHU}">一板三眼</text><text x="1460" y="${y + 170}" text-anchor="middle" ${SERIF} font-size="36" font-weight="700" fill="${INK}" opacity=".6">强　弱　弱　弱</text>`;
		s += beatLine({ rows: [{ name: '板眼', kind: (p) => p === 0 ? 'blot' : 'ring', hits: range(-8, 20), num: true }], t: 4, px: 190 });
		return s; },
	// scene: ink-wash river, two boatmen rowing — every stroke is the strong beat (一板一眼)
	G4: () => { let s = paper();
		const mtn = (d, c, o, f = 'mist') => `<path d="${d}" fill="${c}" opacity="${o}" filter="url(#${f})"/>`;
		s += mtn('M0 520 C180 300 300 260 420 380 C520 240 640 160 760 330 C860 420 980 420 1080 520 L1080 640 L0 640Z', '#8b95a3', .55);
		s += mtn('M900 560 C1050 300 1200 200 1340 360 C1440 260 1560 220 1700 380 C1800 450 1880 470 1920 500 L1920 660 L900 660Z', '#6d7887', .6);
		s += mtn('M0 640 C200 520 380 540 520 600 C700 520 860 560 1000 620 L1000 700 L0 700Z', '#3d4756', .7, 'bleed');
		s += mtn('M1200 650 C1400 560 1600 580 1920 600 L1920 700 L1200 700Z', '#3d4756', .65, 'bleed');
		// sun in cinnabar
		s += `<circle cx="1480" cy="250" r="64" fill="${ZHU}" opacity=".85" filter="url(#brush)"/>`;
		// river (paper) with a few dry-brush current lines
		for (let i = 0; i < 9; i++) s += `<path d="M${120 + i * 190} ${760 + (i % 3) * 30} q60 -6 120 0" fill="none" stroke="${INK}" stroke-width="3" opacity=".25" filter="url(#brush)"/>`;
		// the boat and two rowers
		s += `<g transform="translate(900 770)" filter="url(#brush)">
			<path d="M-260 0 C-140 40 140 40 280 -6 C200 30 -150 34 -260 0Z" fill="${INK}"/>
			<path d="M-240 2 C-120 24 120 24 262 -4" fill="none" stroke="${INK}" stroke-width="10"/>
			<g fill="${INK}"><path d="M-110 -6 L-96 -110 L-60 -110 L-56 -6Z"/><circle cx="-80" cy="-140" r="24"/><path d="M-118 -150 L-42 -150 L-80 -176Z"/>
			<path d="M70 -6 L84 -110 L120 -110 L124 -6Z"/><circle cx="100" cy="-140" r="24"/><path d="M62 -150 L138 -150 L100 -176Z"/></g>
			<path d="M-70 -90 L-170 60" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M110 -90 L10 60" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></g>`;
		// oar splash = the strong beat: cinnabar ripples
		for (const [x, y] of [[730, 834], [910, 834]]) for (let i = 1; i <= 3; i++) s += `<ellipse cx="${x}" cy="${y}" rx="${26 * i}" ry="${7 * i}" fill="none" stroke="${i === 1 ? ZHU : INK}" stroke-width="${4 - i * .8}" opacity="${.9 - i * .22}" filter="url(#brush)"/>`;
		s += seal('板', 1720, 70, 80);
		s += cap(['划一下，收一下——', { k: '一板一眼' }, '。'], 140, 200, 54);
		// beat strip as a band of pale wash
		s += `<rect x="0" y="905" width="${W}" height="175" fill="${PAPER}" opacity=".85"/>`;
		s += beatLine({ y: 990, rows: [{ name: '桨', kind: (p) => p === 0 ? 'blot' : 'ring', hits: range(-8, 20), num: true }], t: 2, px: 200, bars: 2 });
		return s; },
};
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries(frames)) {
	await page.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${fn()}</svg></body></html>`);
	await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

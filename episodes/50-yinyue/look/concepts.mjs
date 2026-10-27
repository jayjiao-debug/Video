// Four different cat shapes for 喵喵乐队, all in the hand-drawn pencil finish, so the owner can point at a direction.
// A 豆豆眼团子 (dot-eye mochi, closest to the reference) · B 大头小猫 (big-head chibi, stands and holds things)
// C 猫猫头 (a head on two feet) · D 长条猫 (long cat: a held note is a stretched cat). node concepts.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import { handDefs, paper, handLine, shapes, ell, face, bow, handBurst, COATS } from './handcat.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, F = 'font-family="Noto Sans CJK SC, sans-serif"';
const PINK = '#F4A3A8';
let INK;
const strokeLine = (d, w = 4.2, col) => `<path d="${d}" fill="none" stroke="${col || INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const tailPath = (d, fur, w = 16) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 8.4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${fur}" stroke-width="${w}" stroke-linecap="round"/>`;
const ears = (lx, rx, y, fur, size = 1) => shapes([
	{ d: `M${lx - 10 * size} ${y + 18 * size} C${lx - 14 * size} ${y - 8 * size} ${lx - 8 * size} ${y - 24 * size} ${lx} ${y - 26 * size} C${lx + 10 * size} ${y - 22 * size} ${lx + 20 * size} ${y - 8 * size} ${lx + 26 * size} ${y + 4 * size} Z`, fill: fur },
	{ d: `M${rx + 10 * size} ${y + 18 * size} C${rx + 14 * size} ${y - 8 * size} ${rx + 8 * size} ${y - 24 * size} ${rx} ${y - 26 * size} C${rx - 10 * size} ${y - 22 * size} ${rx - 20 * size} ${y - 8 * size} ${rx - 26 * size} ${y + 4 * size} Z`, fill: fur }])
	+ `<path d="M${lx - 4 * size} ${y + 8 * size} C${lx - 4 * size} ${y - 6 * size} ${lx} ${y - 14 * size} ${lx + 4 * size} ${y - 15 * size} C${lx + 10 * size} ${y - 10 * size} ${lx + 14 * size} ${y - 4 * size} ${lx + 16 * size} ${y + 2 * size}Z" fill="${PINK}" opacity=".7"/>`
	+ `<path d="M${rx + 4 * size} ${y + 8 * size} C${rx + 4 * size} ${y - 6 * size} ${rx} ${y - 14 * size} ${rx - 4 * size} ${y - 15 * size} C${rx - 10 * size} ${y - 10 * size} ${rx - 14 * size} ${y - 4 * size} ${rx - 16 * size} ${y + 2 * size}Z" fill="${PINK}" opacity=".7"/>`;
const wrap = (x, y, s, seed, inner) => `<g transform="translate(${x} ${y}) scale(${s})"><g filter="url(#hd${seed % 3})">${inner}</g></g>`;

// ---- A: dot-eye mochi, pastel like the reference
function mochi(x, y, s, o = {}) {
	const fur = o.fur || '#F8C8D2', bob = o.step ? -6 : 0;
	let g = shapes([{ d: ell(-18 - (o.step ? 4 : 0), 8 - (o.step ? 8 : 0), 12, 8), fill: fur }, { d: ell(16, 8, 12, 8), fill: fur }]);
	g += `<g transform="translate(0 ${bob})">`;
	g += tailPath('M40 -16 C64 -14 70 -36 60 -50', fur, 14);
	g += ears(-30, 28, -78, fur, 0.9);
	g += shapes([{ d: 'M-48 -6 C-54 -60 -36 -96 0 -96 C36 -96 54 -60 48 -6 C46 8 28 12 0 12 C-28 12 -46 8 -48 -6Z', fill: fur }]);
	const hit = o.face === 'hit';
	g += hit ? strokeLine('M-24 -50 Q-18 -56 -12 -50', 3.4) + strokeLine('M4 -50 Q10 -56 16 -50', 3.4) : `<circle cx="-18" cy="-50" r="4.6" fill="${INK}"/><circle cx="10" cy="-50" r="4.6" fill="${INK}"/>`;
	g += strokeLine('M-10 -41 Q-7 -36 -4 -41 Q-1 -36 2 -41', 2.6);
	g += `<ellipse cx="-30" cy="-40" rx="8" ry="4.5" fill="${PINK}" opacity=".65"/><ellipse cx="22" cy="-40" rx="8" ry="4.5" fill="${PINK}" opacity=".65"/>`;
	if (o.inst === 'flag') g += strokeLine('M-40 -10 L-40 -140', 4.5) + shapes([{ d: 'M-40 -140 L-88 -124 L-40 -108 Z', fill: '#E8746C' }]) + shapes([{ d: ell(-40, -30, 9, 8.5), fill: fur }]);
	if (o.inst === 'drum') g += shapes([{ d: 'M-30 -4 L-30 14 C-30 20 22 20 22 14 L22 -4 Z', fill: '#7FA8E8' }, { d: ell(-4, -4, 26, 7), fill: '#FFFDF5' }]) + shapes([{ d: ell(-26, -14, 8, 7.5), fill: fur }, { d: ell(18, -14, 8, 7.5), fill: fur }]);
	g += `</g>`;
	return wrap(x, y, s, o.seed || 0, g) + (hit ? `<g transform="translate(${x} ${y}) scale(${s})">${handBurst(o.word)}</g>` : '');
}
// ---- B: big-head chibi kitten, stands, has arms
function chibi(x, y, s, o = {}) {
	const c = COATS[o.coat || 'ginger'];
	let g = '';
	g += tailPath('M18 -20 C50 -20 62 -48 50 -70 C46 -78 38 -74 42 -66', c.fur, 13);
	g += shapes([{ d: ell(-14, 6, 13, 9), fill: c.fur }, { d: ell(16, 6, 13, 9), fill: c.fur }]);
	g += shapes([{ d: 'M-30 -60 C-38 -34 -36 -4 -18 4 L18 4 C36 -4 38 -34 30 -60 Z', fill: c.fur }]);
	g += `<ellipse cx="0" cy="-22" rx="16" ry="18" fill="${c.light}" opacity=".85"/>`;
	g += bow(o.bow ? o.bow : null).replace(/translate\(([-\d.]+) ([-\d.]+)\)/, (m, a, b) => `translate(${+a} ${+b - 46})`);
	// arms raised with drumsticks
	g += strokeLine('M-24 -50 L-52 -84', 5) + strokeLine('M24 -50 L54 -88', 5);
	g += tailPath('M-24 -48 L-40 -66', c.fur, 12) + tailPath('M24 -48 L40 -68', c.fur, 12);
	g += strokeLine('M-44 -72 L-70 -104', 5) + strokeLine('M44 -74 L72 -106', 5);
	// head
	g += ears(-36, 34, -144, c.fur, 1.05);
	g += shapes([{ d: 'M-58 -98 C-62 -136 -30 -152 0 -152 C30 -152 62 -136 58 -98 C56 -66 30 -56 0 -56 C-30 -56 -56 -66 -58 -98Z', fill: c.fur }]);
	if (o.mark === 'tabby') g += `<path d="M-14 -148 L-12 -134 M0 -150 L0 -135 M14 -148 L12 -134" stroke="${c.dark}" stroke-width="5.5" stroke-linecap="round"/>`;
	g += `<g transform="translate(9 -56)">${face(o.face || 'happy', c, false)}</g>`;
	// a little snare on a strap
	g += shapes([{ d: 'M-26 -26 L-26 -8 C-26 -2 26 -2 26 -8 L26 -26 Z', fill: '#E8746C' }, { d: ell(0, -26, 26, 7), fill: '#FFFDF5' }]);
	return wrap(x, y, s, o.seed || 0, g) + (o.face === 'hit' ? `<g transform="translate(${x} ${y - 100 * s + 40}) scale(1.35)">${handBurst(o.word)}</g>` : '');
}
// ---- C: a cat head on two feet
function head(x, y, s, o = {}) {
	const c = COATS[o.coat || 'grey'];
	let g = tailPath('M46 -22 C70 -22 76 -44 66 -58', c.fur, 12);
	g += shapes([{ d: ell(-16, 6, 11, 8), fill: c.fur }, { d: ell(16, 6, 11, 8), fill: c.fur }]);
	g += ears(-40, 38, -100, c.fur, 1);
	g += shapes([{ d: 'M-62 -50 C-64 -92 -34 -110 0 -110 C34 -110 64 -92 62 -50 C60 -10 34 4 0 4 C-34 4 -60 -10 -62 -50Z', fill: c.fur }]);
	if (o.mark === 'patch') g += `<path d="M6 -110 C34 -110 60 -92 62 -66 C44 -62 26 -72 18 -84 C12 -94 8 -102 6 -110Z" fill="${c.dark}" opacity=".9"/>`;
	g += `<g transform="translate(9 -12) scale(1.1)">${face(o.face || 'happy', c, false)}</g>`;
	g += bow(o.bow).replace(/translate\(([-\d.]+) ([-\d.]+)\)/, (m, a, b) => `translate(${+a} ${+b + 12})`);
	return wrap(x, y, s, o.seed || 0, g) + (o.face === 'hit' ? `<g transform="translate(${x} ${y}) scale(${s})">${handBurst(o.word)}</g>` : '');
}
// ---- D: long cat, the body stretches with the note length
function long(x, y, s, len, o = {}) {
	const c = COATS[o.coat || 'calico'];
	let g = tailPath(`M${len + 20} -40 C${len + 50} -40 ${len + 60} -66 ${len + 48} -84`, c.fur, 13);
	g += shapes([{ d: ell(-30, 6, 12, 8), fill: c.fur }, { d: ell(-6, 6, 12, 8), fill: c.fur }, { d: ell(len - 6, 6, 12, 8), fill: c.fur }, { d: ell(len + 16, 6, 12, 8), fill: c.fur }]);
	g += shapes([{ d: `M-40 -64 C-40 -76 -30 -78 -20 -78 L${len + 10} -78 C${len + 34} -78 ${len + 38} -60 ${len + 36} -30 C${len + 34} -2 ${len + 20} 4 ${len} 4 L-20 4 C-36 4 -40 -10 -40 -30 Z`, fill: c.fur }]);
	if (o.mark === 'calico') g += `<path d="M${len * .3} -78 C${len * .3 + 40} -82 ${len * .5} -60 ${len * .45} -40 C${len * .35} -40 ${len * .28} -60 ${len * .3} -78Z" fill="${c.dark}"/><path d="M${len * .7} -78 C${len * .75} -60 ${len * .9} -56 ${len + 20} -64 L${len + 10} -78Z" fill="${c.patch2}"/>`;
	g += ears(-60, 4, -116, c.fur, 0.9);
	g += shapes([{ d: 'M-78 -66 C-80 -100 -56 -116 -28 -116 C0 -116 22 -100 20 -66 C18 -38 0 -26 -28 -26 C-56 -26 -76 -38 -78 -66Z', fill: c.fur }]);
	g += `<g transform="translate(-20 -28) scale(.95)">${face(o.face || 'happy', c, false)}</g>`;
	return wrap(x, y, s, o.seed || 0, g) + (o.face === 'hit' ? `<g transform="translate(${x - 28 * s} ${y - 14 * s}) scale(${s})">${handBurst(o.word)}</g>` : '');
}

function sheet() {
	let s = handDefs('crayon', 0) + paper(W, H);
	INK = handLine();
	s += `<text x="70" y="96" font-size="54" font-weight="900" fill="${INK}" ${F}>四种猫的样子</text><text x="440" y="96" font-size="30" font-weight="600" fill="${INK}" opacity=".6" ${F}>都是彩铅手绘，只换身体和脸</text>`;
	const cols = [240, 720, 1200, 1680];
	for (let i = 1; i < 4; i++) s += `<path d="M${i * 480} 150 L${i * 480} 1040" stroke="${INK}" stroke-opacity=".12" stroke-width="3" stroke-dasharray="4 14" stroke-linecap="round"/>`;
	const label = (x, a, b, c) => `<text x="${x}" y="730" text-anchor="middle" font-size="38" font-weight="900" fill="${INK}" ${F}>${a}</text><text x="${x}" y="778" text-anchor="middle" font-size="25" font-weight="600" fill="${INK}" opacity=".65" ${F}>${b}</text><text x="${x}" y="814" text-anchor="middle" font-size="25" font-weight="600" fill="${INK}" opacity=".65" ${F}>${c}</text>`;
	// A
	s += mochi(240, 600, 2.3, { fur: '#F8C8D2', inst: 'drum', face: 'hit', word: '咚', seed: 0 });
	s += label(240, 'A · 豆豆眼团子', '最像参考片：一团软糖', '小黑豆眼，没有胡子');
	['#C9E8B0', '#FBE29A', '#D9C6F2'].forEach((f, k) => { s += mochi(120 + k * 120, 990, 0.95, { fur: f, step: k % 2, seed: k + 1, inst: k === 0 ? 'flag' : null }); });
	// B
	s += chibi(720, 610, 2.05, { coat: 'ginger', mark: 'tabby', bow: '#F2C14E', face: 'hit', word: '啪', seed: 1 });
	s += label(720, 'B · 大头小猫', '站着的小奶猫，头大身小', '有手，能抱乐器、挥鼓棒');
	[['calico', 'calico'], ['grey', 'patch'], ['cream', 'none']].forEach(([coat, mark], k) => { s += chibi(600 + k * 120, 1000, 0.82, { coat, mark, seed: k }); });
	// C
	s += head(1200, 600, 2.3, { coat: 'grey', mark: 'patch', bow: '#7FA8E8', face: 'happy', seed: 2 });
	s += label(1200, 'C · 猫猫头', '只有一颗头加两只脚', '最简单，弹跳最可爱');
	[['ginger', 'tabby'], ['tux', 'none'], ['calico', 'calico']].forEach(([coat, mark], k) => { s += head(1080 + k * 120, 992, 0.85, { coat, mark, seed: k, face: k === 1 ? 'sleep' : 'happy' }); });
	// D
	s += long(1580, 560, 1.15, 170, { coat: 'calico', mark: 'calico', face: 'hit', word: '嗡——', seed: 0 });
	s += `<text x="1680" y="640" text-anchor="middle" font-size="26" font-weight="700" fill="#E8746C" ${F}>长音 = 长猫</text>`;
	s += label(1680, 'D · 长条猫', '音拉多长，猫就有多长', '一眼看懂音符的时值');
	s += long(1530, 990, 0.62, 30, { coat: 'ginger', seed: 1 }) + long(1680, 990, 0.62, 90, { coat: 'grey', seed: 2 }) + long(1830, 990, 0.62, 10, { coat: 'tux', seed: 0 });
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`;
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<html><body style="margin:0">${sheet()}</body></html>`);
await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/cat_shapes_ABCD.png` });
await browser.close(); console.log('ok');

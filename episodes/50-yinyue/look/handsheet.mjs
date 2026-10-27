// Character sheets for the hand-drawn cats, one per finish. node handsheet.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import { handCat, handDefs, paper, HSTYLES, handLine } from './handcat.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, F = 'font-family="Noto Sans CJK SC, sans-serif"';
const BOW = { red: '#E8746C', yellow: '#F2C14E', blue: '#7FA8E8', pink: '#F49AB8', green: '#7CC58E' };
const CAST = [
	{ name: '鼓手 · 橘子', coat: 'ginger', mark: 'tabby', bow: BOW.red, inst: 'snare', hat: 'shako', face: 'hit', word: '啪' },
	{ name: '小号 · 三花', coat: 'calico', mark: 'calico', bow: BOW.yellow, inst: 'trumpet', face: 'happy' },
	{ name: '低音 · 灰灰', coat: 'grey', mark: 'patch', bow: BOW.blue, inst: 'tuba', face: 'sleep' },
	{ name: '镲 · 奶糖', coat: 'cream', mark: 'none', bow: BOW.pink, inst: 'cymbal', face: 'sweat' },
	{ name: '大鼓 · 燕尾服', coat: 'tux', mark: 'none', bow: BOW.green, inst: 'kick', face: 'wow' },
];
function sheet(style, i) {
	let s = handDefs(style, 0) + paper(W, H);
	const ink = handLine();
	s += `<text x="80" y="118" font-size="62" font-weight="900" fill="${ink}" ${F}>手绘猫 ${'ABC'[i]} · ${HSTYLES[style].name}</text>`;
	s += `<text x="80" y="176" font-size="30" font-weight="600" fill="${ink}" opacity=".6" ${F}>真猫的花色 · 大眼睛 · 腮红 · 手抖的线条 · 乐队靠领结颜色区分</text>`;
	CAST.forEach((c, k) => {
		const x = 230 + k * 365, y = 600;
		s += handCat(x, y, 2.0, { ...c, seed: k, wordCol: '#E8746C' });
		s += `<text x="${x}" y="${y + 92}" text-anchor="middle" font-size="32" font-weight="800" fill="${ink}" ${F}>${c.name}</text>`;
	});
	// a little parade lane to see them small
	s += `<path d="M120 1000 L1880 1000" stroke="${ink}" stroke-opacity=".25" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`;
	for (let k = 0; k < 11; k++) {
		const c = CAST[k % 5];
		s += handCat(220 + k * 156, 986, 0.85, { coat: c.coat, mark: c.mark, bow: c.bow, ph: 1000 + k * 0.5, face: k === 3 ? 'hit' : 'happy', seed: k, alpha: 1 });
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`;
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
const styles = Object.keys(HSTYLES);
for (let i = 0; i < styles.length; i++) {
	await page.setContent(`<html><body style="margin:0">${sheet(styles[i], i)}</body></html>`);
	await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/hand_${'ABC'[i]}_${styles[i]}.png` }); console.log(styles[i]);
}
await browser.close();

// 「高级感」 pass on the 落墨 layout (owner 2026-10-26): restraint, thin type, big negative space, one metal/ink accent,
// light that feels physical (specular drops, fading ripples, reflection), film grain. Two moods, same layout:
//  P1 白瓷 — warm porcelain white, ink-black drops, a hair of gold;  P2 黑金 — black lacquer, liquid-gold drops into black water.
// node premium.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080;
const FD = new URL('../../37-qiqing/remotion/public/fonts/', import.meta.url);
const ff = (name, file, style = 'normal', weight = 500) => `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${fs.readFileSync(new URL(file, FD)).toString('base64')}) format('woff2');font-style:${style};font-weight:${weight}}`;
const CSS = ff('Corm', 'cormorant-garamond-latin-500-italic.woff2', 'italic', 500) + ff('Corm', 'cormorant-garamond-latin-500-normal.woff2', 'normal', 500) + ff('Inter', 'inter-latin-300-normal.woff2', 'normal', 300) + ff('Inter', 'inter-latin-500-normal.woff2', 'normal', 500);
const SERIF = `font-family="Noto Serif CJK SC, serif"`, CORM = `font-family="Corm"`, INTER = `font-family="Inter"`;

function scene(m) {   // m: palette for the mood
	const cx = 960, surf = 760, px = 150;
	let s = `<defs>
		<radialGradient id="bg" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="${m.bg0}"/><stop offset="1" stop-color="${m.bg1}"/></radialGradient>
		<linearGradient id="drop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.d0}"/><stop offset=".55" stop-color="${m.d1}"/><stop offset="1" stop-color="${m.d2}"/></linearGradient>
		<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B8893E"/><stop offset=".5" stop-color="#F1D9A0"/><stop offset="1" stop-color="#B8893E"/></linearGradient>
		<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.w0}" stop-opacity=".9"/><stop offset="1" stop-color="${m.w0}" stop-opacity="0"/></linearGradient>
		<radialGradient id="ripple" cx=".5" cy=".5" r=".5"><stop offset=".86" stop-color="${m.rip}" stop-opacity="0"/><stop offset=".95" stop-color="${m.rip}" stop-opacity=".9"/><stop offset="1" stop-color="${m.rip}" stop-opacity="0"/></radialGradient>
		<linearGradient id="hf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="hm"><rect x="${cx - 700}" y="${surf}" width="1400" height="320" fill="url(#hf)"/></mask>
		<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
		<filter id="dof" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
		<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 ${m.grain}"/></feComponentTransfer></filter>
		<linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${m.line}" stop-opacity="0"/><stop offset=".5" stop-color="${m.line}" stop-opacity="1"/><stop offset="1" stop-color="${m.line}" stop-opacity="0"/></linearGradient>
	</defs><rect width="${W}" height="${H}" fill="url(#bg)"/>`;
	// a single soft light from above on the column
	s += `<ellipse cx="${cx}" cy="${surf - 260}" rx="260" ry="520" fill="${m.light}" opacity="${m.lightA}" filter="url(#soft)"/>`;
	// water: a faint plane fading into the page, with the reflection of the falling drops
	s += `<rect x="${cx - 700}" y="${surf}" width="1400" height="320" fill="url(#water)" opacity="${m.waterA}" mask="url(#hm)"/>`;
	s += `<rect x="${cx - 640}" y="${surf - .75}" width="1280" height="1.5" fill="url(#fadeL)" opacity=".7"/>`;
	// thread
	s += `<rect x="${cx - .5}" y="80" width="1" height="${surf - 80}" fill="url(#fadeL)" opacity=".18" transform="rotate(90 ${cx} ${(80 + surf) / 2})" style="display:none"/>`;
	s += `<line x1="${cx}" y1="90" x2="${cx}" y2="${surf}" stroke="${m.line}" stroke-width="1" opacity=".16"/>`;
	// falling drops (the next beats): teardrops with a specular highlight; farther ones softer (depth)
	const drop = (y, sc, blur) => `<g transform="translate(${cx} ${y}) scale(${sc})" ${blur ? 'filter="url(#dof)"' : ''}>
		<path d="M0 -40 C10 -22 22 -4 22 10 C22 24 12 32 0 32 C-12 32 -22 24 -22 10 C-22 -4 -10 -22 0 -40Z" fill="url(#drop)"/>
		<ellipse cx="-8" cy="8" rx="5" ry="9" fill="#fff" opacity="${m.spec}"/></g>`;
	for (let b = 1; b <= 4; b++) { const y = surf - b * px - 20; s += drop(y, b === 4 ? 1.25 : 1, b >= 3); }
	// reflections of the drops under the surface
	for (let b = 1; b <= 2; b++) s += `<g opacity="${.18 / b}" transform="translate(0 ${2 * surf}) scale(1 -1)">${drop(surf - b * px - 20, 1, true)}</g>`;
	// the landing drop: crown splash + concentric ripples (radial-gradient rings, fading)
	s += `<g transform="translate(${cx} ${surf})">${[1, 2, 3, 4, 5].map((i) => `<ellipse rx="${46 * i}" ry="${9 * i}" fill="url(#ripple)" opacity="${1.05 - i * .19}"/>`).join('')}
		${[-3, -2, -1, 0, 1, 2, 3].map((k) => `<path d="M${k * 9} -2 Q${k * 16} -${28 + (3 - Math.abs(k)) * 9} ${k * 22} -${18 + (3 - Math.abs(k)) * 6}" fill="none" stroke="${m.splash}" stroke-width="3.5" stroke-linecap="round"/>`).join('')}
		<circle cx="0" cy="-64" r="6" fill="${m.splash}"/><circle cx="-26" cy="-50" r="3.5" fill="${m.splash}"/><circle cx="24" cy="-54" r="4" fill="${m.splash}"/></g>`;
	// left: chapter mark + the number in thin italic serif
	s += `<text x="300" y="210" ${INTER} font-size="20" font-weight="500" letter-spacing="9" fill="${m.sub}">CHAPTER 01 · TEMPO</text>`;
	s += `<rect x="300" y="236" width="56" height="1.5" fill="${m.accent}"/>`;
	s += `<text x="292" y="560" ${CORM} font-style="italic" font-size="300" font-weight="500" fill="${m.num}" letter-spacing="-6">120</text>`;
	s += `<text x="302" y="626" ${INTER} font-size="22" font-weight="500" letter-spacing="12" fill="${m.accent}">BEATS PER MINUTE</text>`;
	// right: the title in vertical light serif with wide spacing
	s += [...'速度'].map((c, i) => `<text x="1600" y="${330 + i * 150}" text-anchor="middle" ${SERIF} font-size="112" font-weight="300" fill="${m.title}">${c}</text>`).join('');
	s += `<line x1="1680" y1="250" x2="1680" y2="620" stroke="${m.accent}" stroke-width="1.2" opacity=".8"/>`;
	s += `<text x="1720" y="270" ${SERIF} font-size="24" font-weight="400" fill="${m.sub}" writing-mode="tb" letter-spacing="10">一分钟落下几滴</text>`;
	// subtitle: small, centred, cinema style
	s += `<text x="${cx}" y="960" text-anchor="middle" ${SERIF} font-size="40" font-weight="400" letter-spacing="6" fill="${m.cap}">一分钟落下几滴，就叫 <tspan fill="${m.accentText}" font-weight="600">BPM</tspan></text>`;
	// count: the current beat
	s += `<text x="${cx}" y="${surf + 92}" text-anchor="middle" ${CORM} font-size="40" fill="${m.accent}" letter-spacing="30">1 · 2 · 3 · 4</text>`;
	s += `<rect x="${cx - 273}" y="${surf + 102}" width="26" height="1.5" fill="${m.accent}"/>`;
	s += `<rect width="${W}" height="${H}" filter="url(#grain)"/>`;
	return s;
}
const MOODS = {
	P1_白瓷: { bg0: '#F7F4EE', bg1: '#E6E0D5', d0: '#4a5160', d1: '#1b1f27', d2: '#07090c', w0: '#cfd3d6', waterA: .55, rip: '#2a2f38', splash: '#1b1f27', spec: .55,
		light: '#ffffff', lightA: .55, line: '#1b1f27', num: '#1b1f27', title: '#1b1f27', sub: '#8a8378', accent: '#B08A4A', accentText: '#9a7432', cap: '#2a2a2a', grain: .07 },
	P2_黑金: { bg0: '#1a1714', bg1: '#060505', d0: '#FFF1C9', d1: '#E2B866', d2: '#8a5d22', w0: '#2a241c', waterA: .9, rip: '#E2B866', splash: '#F1D9A0', spec: .8,
		light: '#E2B866', lightA: .08, line: '#E2B866', num: '#F3E6CC', title: '#F3E6CC', sub: '#8d8270', accent: '#D4AE63', accentText: '#E9C77E', cap: '#E9E1D2', grain: .12 },
};
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, m] of Object.entries(MOODS)) {
	await page.setContent(`<html><head><style>${CSS}</style></head><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${scene(m)}</svg></body></html>`);
	await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

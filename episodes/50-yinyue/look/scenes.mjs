// Episode 1 draft scenes in the premium 落墨 look (白瓷 mood). One still per scene. node scenes.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080;
const FD = new URL('../../37-qiqing/remotion/public/fonts/', import.meta.url);
const ff = (name, file, style = 'normal', weight = 500) => `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${fs.readFileSync(new URL(file, FD)).toString('base64')}) format('woff2');font-style:${style};font-weight:${weight}}`;
const CSS = ff('Corm', 'cormorant-garamond-latin-500-italic.woff2', 'italic', 500) + ff('Corm', 'cormorant-garamond-latin-500-normal.woff2', 'normal', 500) + ff('Inter', 'inter-latin-300-normal.woff2', 'normal', 300) + ff('Inter', 'inter-latin-500-normal.woff2', 'normal', 500);
const SERIF = `font-family="Noto Serif CJK SC, serif"`, CORM = `font-family="Corm"`, INTER = `font-family="Inter"`;
const M = { bg0: '#F7F4EE', bg1: '#E4DED2', ink: '#1b1f27', sub: '#8a8378', gold: '#B08A4A', goldT: '#9a7432', zhu: '#B8402F', cap: '#2a2a2a' };

const DEFS = `<defs>
	<radialGradient id="bg" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="${M.bg0}"/><stop offset="1" stop-color="${M.bg1}"/></radialGradient>
	<linearGradient id="dInk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a5160"/><stop offset=".55" stop-color="#1b1f27"/><stop offset="1" stop-color="#07090c"/></linearGradient>
	<linearGradient id="dZhu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E07A63"/><stop offset=".55" stop-color="#B8402F"/><stop offset="1" stop-color="#6e1d14"/></linearGradient>
	<radialGradient id="dGold" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFF4D6"/><stop offset=".45" stop-color="#E2BC72"/><stop offset="1" stop-color="#8a6326"/></radialGradient>
	<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd3d6" stop-opacity=".9"/><stop offset="1" stop-color="#cfd3d6" stop-opacity="0"/></linearGradient>
	<linearGradient id="hf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
	<linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${M.ink}" stop-opacity="0"/><stop offset=".5" stop-color="${M.ink}"/><stop offset="1" stop-color="${M.ink}" stop-opacity="0"/></linearGradient>
	<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
	<filter id="dof" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
	<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .07"/></feComponentTransfer></filter>
</defs>`;
const base = () => `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
const grain = () => `<rect width="${W}" height="${H}" filter="url(#grain)"/>`;
const light = (cx, y, rx = 260, ry = 520, o = .55) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${o}" filter="url(#soft)"/>`;
function water(x0, x1, y) { const id = `m${x0}${y}`;
	return `<mask id="${id}"><rect x="${x0}" y="${y}" width="${x1 - x0}" height="320" fill="url(#hf)"/></mask><rect x="${x0}" y="${y}" width="${x1 - x0}" height="320" fill="url(#water)" opacity=".55" mask="url(#${id})"/>
	<rect x="${x0 + 60}" y="${y - .75}" width="${x1 - x0 - 120}" height="1.5" fill="url(#fadeL)" opacity=".7"/>`; }
// one drop. kind: ink | zhu | gold (round bead) | mist (tiny)
function drop(x, y, kind = 'ink', sc = 1, blur = false) {
	if (kind === 'mist') return `<circle cx="${x}" cy="${y}" r="${5 * sc}" fill="${M.ink}" opacity=".7" ${blur ? 'filter="url(#dof)"' : ''}/>`;
	if (kind === 'gold') return `<g transform="translate(${x} ${y}) scale(${sc})" ${blur ? 'filter="url(#dof)"' : ''}><circle r="17" fill="url(#dGold)"/><ellipse cx="-5" cy="-6" rx="4" ry="6" fill="#fff" opacity=".8"/></g>`;
	return `<g transform="translate(${x} ${y}) scale(${sc})" ${blur ? 'filter="url(#dof)"' : ''}><path d="M0 -40 C10 -22 22 -4 22 10 C22 24 12 32 0 32 C-12 32 -22 24 -22 10 C-22 -4 -10 -22 0 -40Z" fill="url(#${kind === 'zhu' ? 'dZhu' : 'dInk'})"/><ellipse cx="-8" cy="8" rx="5" ry="9" fill="#fff" opacity=".55"/></g>`;
}
function splash(x, y, col = M.ink, sc = 1, rings = 5) {
	let s = `<g transform="translate(${x} ${y}) scale(${sc})">`;
	for (let i = 1; i <= rings; i++) s += `<ellipse rx="${46 * i}" ry="${9 * i}" fill="none" stroke="${col}" stroke-width="${2.4 - i * .3}" opacity="${1 - i * .18}"/>`;
	for (const k of [-3, -2, -1, 0, 1, 2, 3]) s += `<path d="M${k * 9} -2 Q${k * 16} -${28 + (3 - Math.abs(k)) * 9} ${k * 22} -${18 + (3 - Math.abs(k)) * 6}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round"/>`;
	return s + `<circle cx="0" cy="-64" r="6" fill="${col}"/><circle cx="-26" cy="-50" r="3.5" fill="${col}"/><circle cx="24" cy="-54" r="4" fill="${col}"/></g>`;
}
const thread = (x, y0, y1) => `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${M.ink}" stroke-width="1" opacity=".16"/>`;
const label = (txt, x, y, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" ${INTER} font-size="20" font-weight="500" letter-spacing="9" fill="${M.sub}">${txt}</text>`;
const rule = (x, y, w = 56) => `<rect x="${x}" y="${y}" width="${w}" height="1.5" fill="${M.gold}"/>`;
const sub = (txt, y = 975) => `<text x="${W / 2}" y="${y}" text-anchor="middle" ${SERIF} font-size="52" font-weight="400" letter-spacing="5" fill="${M.cap}">${txt}</text>`;
const key = (t) => `<tspan fill="${M.goldT}" font-weight="600">${t}</tspan>`;
const vtitle = (txt, x, y, size = 112) => [...txt].map((c, i) => `<text x="${x}" y="${y + i * size * 1.33}" text-anchor="middle" ${SERIF} font-size="${size}" font-weight="300" fill="${M.ink}">${c}</text>`).join('');
const count = (x, y, now, n = 4) => [...Array(n).keys()].map((i) => `<text x="${x + (i - (n - 1) / 2) * 80}" y="${y}" text-anchor="middle" ${CORM} font-size="${i === now ? 46 : 38}" fill="${i === now ? M.ink : M.gold}">${i + 1}</text>${i === now ? `<rect x="${x + (i - (n - 1) / 2) * 80 - 13}" y="${y + 12}" width="26" height="1.5" fill="${M.ink}"/>` : ''}`).join('');

const S = {};
// 1 · 0:00–0:10 hook: one red drop, wide silence
S.S1 = () => { const cx = 960, sf = 700; let s = base() + light(cx, 380, 300, 560, .6) + water(260, 1660, sf) + thread(cx, 80, sf);
	s += drop(cx, 360, 'zhu', 1.15, true) + splash(cx, sf, M.zhu, 1.25, 6);
	s += label('PRELUDE · 序', W / 2, 150, 'middle') + rule(W / 2 - 28, 172);
	s += `<text x="${W / 2}" y="880" text-anchor="middle" ${SERIF} font-size="44" font-weight="300" letter-spacing="6" fill="${M.sub}">你听过的第一首歌，</text>`;
	s += `<text x="${W / 2}" y="975" text-anchor="middle" ${SERIF} font-size="64" font-weight="400" letter-spacing="8" fill="${M.ink}">是${key('妈妈的心跳')}。</text>`;
	s += `<text x="1700" y="300" ${SERIF} font-size="24" font-weight="400" fill="${M.sub}" writing-mode="tb" letter-spacing="10">每分钟约七十二下</text>`;
	return s + grain(); };
// 2 · 0:10–0:35 the beat: steady drops, count 1–4, nod along
S.S2 = () => { const cx = 960, sf = 720; let s = base() + light(cx, 360) + water(260, 1660, sf) + thread(cx, 80, sf);
	for (let b = 1; b <= 4; b++) s += drop(cx, sf - b * 160 - 20, 'ink', 1, b >= 3);
	s += splash(cx, sf) + count(cx, sf + 92, 1);
	s += label('CHAPTER 01 · BEAT', 300, 210) + rule(300, 236) + vtitle('拍', 420, 470, 220);
	s += `<text x="1560" y="470" ${SERIF} font-size="34" font-weight="300" fill="${M.sub}" letter-spacing="4">跟着它点头</text><path d="M1560 500 h170" stroke="${M.gold}" stroke-width="1.2"/>`;
	s += sub(`每一滴，就是一${key('拍')}`);
	return s + grain(); };
// 3 · 0:35–1:00 BPM: the number + a tempo scale with everyday anchors; drops closer together as it speeds up
S.S3 = () => { const cx = 960, sf = 720; let s = base() + light(cx, 360) + water(260, 1660, sf) + thread(cx, 80, sf);
	for (let b = 1; b <= 6; b++) s += drop(cx, sf - b * 110 - 20, 'ink', b === 4 ? 1.2 : 1, b >= 4);
	s += splash(cx, sf);
	s += label('CHAPTER 01 · TEMPO', 300, 210) + rule(300, 236);
	s += `<text x="292" y="520" ${CORM} font-style="italic" font-size="280" font-weight="500" fill="${M.ink}" letter-spacing="-6">120</text><text x="302" y="584" ${INTER} font-size="22" font-weight="500" letter-spacing="12" fill="${M.gold}">BEATS PER MINUTE</text>`;
	// tempo scale (right): a thin vertical ruler
	const x = 1560, y0 = 230, y1 = 640, v = (b) => y1 - (b - 40) / 160 * (y1 - y0);
	s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${M.ink}" stroke-width="1" opacity=".4"/>`;
	for (let b = 40; b <= 200; b += 10) s += `<line x1="${x}" y1="${v(b)}" x2="${x + (b % 50 ? 10 : 20)}" y2="${v(b)}" stroke="${M.ink}" stroke-width="1" opacity=".4"/>`;
	[[60, '秒针'], [72, '心跳'], [120, '快走'], [170, '跑步']].forEach(([b, n]) => { const on = b === 120;
		s += `<text x="${x + 36}" y="${v(b) + 9}" ${CORM} font-size="30" fill="${on ? M.ink : M.sub}">${b}</text><text x="${x + 92}" y="${v(b) + 9}" ${SERIF} font-size="24" font-weight="${on ? 600 : 300}" fill="${on ? M.goldT : M.sub}">${n}</text>`; });
	s += `<path d="M${x - 16} ${v(120)} l-14 -8 v16Z" fill="${M.gold}"/>`;
	s += sub(`一分钟落下几滴，就叫 ${key('BPM')}`);
	return s + grain(); };
// 4 · 1:00–1:25 strong & weak: three columns, 2/4 · 3/4 · 4/4; the first drop of each group is bigger and gold-rimmed
S.S4 = () => { const sf = 700; let s = base() + water(160, 1760, sf);
	[[560, 2, '进行曲', '强 弱'], [960, 3, '华尔兹', '强 弱 弱'], [1360, 4, '流行', '强 弱 弱 弱']].forEach(([cx, n, name, pat]) => {
		s += light(cx, 360, 150, 420, .5) + thread(cx, 120, sf);
		for (let b = 1; b <= n; b++) s += drop(cx, sf - b * (430 / n) - 20, b === n ? 'zhu' : 'ink', b === n ? 1.3 : .9, false);
		s += splash(cx, sf, M.zhu, .8, 4);
		s += `<text x="${cx}" y="${sf + 90}" text-anchor="middle" ${CORM} font-size="56" fill="${M.ink}">${n}/4</text><text x="${cx}" y="${sf + 140}" text-anchor="middle" ${SERIF} font-size="30" font-weight="400" fill="${M.sub}" letter-spacing="6">${name} · ${pat}</text>`; });
	s += label('CHAPTER 02 · ACCENT', 160, 120) + rule(160, 146);
	s += sub(`几拍一组，${key('第一拍最重')}——京剧叫它「板」`, 990);
	return s + grain(); };
// 5 · 1:25–2:05 three sounds: kick = ink drops, snare = gold beads, hi-hat = fine mist
S.S5 = () => { const sf = 700; let s = base() + water(260, 1660, sf);
	const cols = [[680, '底鼓', 'KICK', 'ink', [0, 2]], [960, '军鼓', 'SNARE', 'gold', [1, 3]], [1240, '镲', 'HI-HAT', 'mist', [0, .5, 1, 1.5, 2, 2.5, 3, 3.5]]];
	for (const [cx, zh, en, kind, hits] of cols) { s += light(cx, 380, 120, 420, .45) + thread(cx, 100, sf);
		for (const h of hits) { if (h === 0) continue; const y = sf - h * 150 - 20; s += drop(cx, y, kind, kind === 'mist' ? 1.2 : 1, h > 2); }
		s += `<text x="${cx}" y="${sf + 84}" text-anchor="middle" ${SERIF} font-size="36" font-weight="400" fill="${M.ink}">${zh}</text><text x="${cx}" y="${sf + 120}" text-anchor="middle" ${INTER} font-size="16" font-weight="500" letter-spacing="7" fill="${M.sub}">${en}</text>`; }
	s += splash(680, sf, M.ink, .9) + `<g>${[1, 2, 3].map((i) => `<ellipse cx="1240" cy="${sf}" rx="${16 * i}" ry="${4 * i}" fill="none" stroke="${M.ink}" stroke-width="1.5" opacity="${.7 - i * .2}"/>`).join('')}</g>`;
	s += label('CHAPTER 03 · LAYERS', 300, 160) + rule(300, 186);
	s += `<text x="300" y="${sf + 200}" ${CORM} font-style="italic" font-size="44" fill="${M.gold}" letter-spacing="10">动 · 次 · 打 · 次</text>`;
	s += sub(`三种声音，${key('叠')}在一起`);
	return s + grain(); };
// 6 · 2:05–2:40 payoff: the camera tilts to look straight down — the three sources' ripples interfere into a pattern
S.S6 = () => { let s = base() + `<rect width="${W}" height="${H}" fill="#EDE8DF"/>`;
	const src = [[820, 520, M.ink, 9], [1100, 520, M.goldT, 8], [960, 640, M.ink, 12]];
	for (const [x, y, c, n] of src) for (let i = 1; i <= n; i++) s += `<circle cx="${x}" cy="${y}" r="${i * 34}" fill="none" stroke="${c}" stroke-width="${1.6 - i * .08}" opacity="${.75 - i * .05}"/>`;
	for (const [x, y, c] of src) s += `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/>`;
	s += `<text x="${W / 2}" y="170" text-anchor="middle" ${CORM} font-style="italic" font-size="72" fill="${M.ink}" letter-spacing="14"></text><text x="${W / 2}" y="180" text-anchor="middle" ${SERIF} font-size="76" font-weight="300" fill="${M.ink}" letter-spacing="40">动 次 打 次</text>`;
	s += sub(`这就是你听过${key('一万遍')}的节奏`);
	return s + grain(); };
// 7 · 2:40–3:00 next time + question; an empty fourth column waits
S.S7 = () => { const sf = 700; let s = base() + water(260, 1660, sf);
	[[600, 'ink'], [800, 'gold'], [1000, 'mist']].forEach(([cx, k]) => { s += thread(cx, 140, sf) + drop(cx, sf - 260, k, k === 'mist' ? 1.2 : 1, true); });
	s += light(1260, 380, 140, 420, .6) + `<line x1="1260" y1="140" x2="1260" y2="${sf}" stroke="${M.gold}" stroke-width="1.2" stroke-dasharray="3 10"/>`;
	s += `<text x="1260" y="${sf - 240}" text-anchor="middle" ${CORM} font-style="italic" font-size="120" fill="${M.gold}">?</text><text x="1260" y="${sf + 84}" text-anchor="middle" ${SERIF} font-size="36" font-weight="400" fill="${M.goldT}">贝斯</text>`;
	s += label('NEXT · 下一期', 300, 160) + rule(300, 186);
	s += `<text x="${W / 2}" y="900" text-anchor="middle" ${SERIF} font-size="40" font-weight="300" letter-spacing="5" fill="${M.sub}">下一期，第四种声音加入。</text>`;
	s += sub(`你最常听的那首歌，大概${key('多少 BPM')}？`, 985);
	return s + grain(); };

const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries(S)) {
	await page.setContent(`<html><head><style>${CSS}</style></head><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}${fn()}</svg></body></html>`);
	await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

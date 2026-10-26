// Three mass-appeal style options for the same moment (72 BPM, beat 1, 跟着拍), each led by a mascot: a cat drummer.
// A 绘本暖色 (picture book) · B 国潮 (festive Chinese flat) · C 软萌3D (clay toy). node styles.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, F = `font-family="Noto Sans CJK SC, sans-serif"`;

// the cat drummer, sitting behind a drum, both sticks up (about to hit beat 1). o = outline colour or null; g(id) = gradient fill for 3D
function cat({ x, y, s = 1, fur, belly, ear, eye = '#2b2020', blush, o, sw = 7, g = null, hat = '' }) {
	const st = o ? `stroke="${o}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"` : '';
	const fill = (c, id) => g && id ? `url(#${id})` : c;
	return `<g transform="translate(${x} ${y}) scale(${s})">
	<ellipse cx="0" cy="250" rx="230" ry="26" fill="#000" opacity=".12"/>
	<path d="M-150 120 C-170 40 -120 -40 0 -40 C120 -40 170 40 150 120 C150 200 90 240 0 240 C-90 240 -150 200 -150 120Z" fill="${fill(fur, 'gFur')}" ${st}/>
	<ellipse cx="0" cy="150" rx="80" ry="70" fill="${fill(belly, 'gBelly')}" ${o ? '' : 'opacity=".95"'}/>
	<path d="M150 150 C230 150 250 60 210 30" fill="none" stroke="${fur}" stroke-width="30" stroke-linecap="round"/>${o ? `<path d="M150 150 C230 150 250 60 210 30" fill="none" stroke="${o}" stroke-width="${sw}" stroke-linecap="round" opacity="0"/>` : ''}
	<g transform="translate(0 -170)">
		<path d="M-150 -40 L-170 -190 L-60 -120Z" fill="${fill(fur, 'gFur')}" ${st}/><path d="M150 -40 L170 -190 L60 -120Z" fill="${fill(fur, 'gFur')}" ${st}/>
		<path d="M-140 -70 L-152 -160 L-90 -118Z" fill="${ear}"/><path d="M140 -70 L152 -160 L90 -118Z" fill="${ear}"/>
		<ellipse cx="0" cy="0" rx="190" ry="160" fill="${fill(fur, 'gFur')}" ${st}/>
		${hat}
		<path d="M-95 -10 Q-70 -40 -45 -10" fill="none" stroke="${eye}" stroke-width="14" stroke-linecap="round"/><path d="M45 -10 Q70 -40 95 -10" fill="none" stroke="${eye}" stroke-width="14" stroke-linecap="round"/>
		<ellipse cx="-110" cy="40" rx="34" ry="20" fill="${blush}" opacity=".7"/><ellipse cx="110" cy="40" rx="34" ry="20" fill="${blush}" opacity=".7"/>
		<path d="M-10 22 L10 22 L0 34Z" fill="${eye}"/><path d="M-30 46 Q-15 64 0 46 Q15 64 30 46" fill="none" stroke="${eye}" stroke-width="8" stroke-linecap="round"/>
		<path d="M-170 20 L-240 10 M-170 40 L-236 50 M170 20 L240 10 M170 40 L236 50" stroke="${eye}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
	</g>
	<path d="M-120 20 C-180 -20 -200 -90 -190 -130" fill="none" stroke="${o || fur}" stroke-width="${o ? 52 : 44}" stroke-linecap="round"/><path d="M-120 20 C-180 -20 -200 -90 -190 -130" fill="none" stroke="${fur}" stroke-width="40" stroke-linecap="round"/>
	<path d="M120 20 C180 -20 200 -90 190 -130" fill="none" stroke="${o || fur}" stroke-width="${o ? 52 : 44}" stroke-linecap="round"/><path d="M120 20 C180 -20 200 -90 190 -130" fill="none" stroke="${fur}" stroke-width="40" stroke-linecap="round"/>
	<circle cx="-190" cy="-140" r="28" fill="${fill(fur, 'gFur')}" ${st}/><circle cx="190" cy="-140" r="28" fill="${fill(fur, 'gFur')}" ${st}/>
	<rect x="-200" y="-330" width="20" height="200" rx="10" fill="#c98a4b" transform="rotate(-24 -190 -140)" ${o ? `stroke="${o}" stroke-width="5"` : ''}/><circle cx="-190" cy="-330" r="16" fill="#e8b27a" transform="rotate(-24 -190 -140)"/>
	<rect x="180" y="-330" width="20" height="200" rx="10" fill="#c98a4b" transform="rotate(24 190 -140)" ${o ? `stroke="${o}" stroke-width="5"` : ''}/><circle cx="190" cy="-330" r="16" fill="#e8b27a" transform="rotate(24 190 -140)"/>
	</g>`;
}
// motion marks above the sticks (anticipation)
const marks = (x, y, c) => [[-260, -330], [260, -330]].map(([dx, dy]) => `<path d="M${x + dx * .9} ${y + dy * .9 - 40} q${dx > 0 ? 30 : -30} -20 ${dx > 0 ? 60 : -60} 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`).join('');

function styleA() {   // 绘本暖色: cream paper, soft pastel hills, warm brown outlines, hand-made feel
	const o = '#4a3428';
	let s = `<rect width="${W}" height="${H}" fill="#FFF3DC"/>
	<circle cx="1640" cy="190" r="110" fill="#FFD36B"/><circle cx="1640" cy="190" r="150" fill="#FFD36B" opacity=".25"/>
	<path d="M0 760 C300 660 600 700 900 740 C1200 780 1500 680 1920 720 L1920 1080 L0 1080Z" fill="#BFE3B4"/>
	<path d="M0 860 C400 800 800 840 1200 860 C1500 875 1700 830 1920 850 L1920 1080 L0 1080Z" fill="#9ED193"/>
	<g fill="#fff" opacity=".9"><ellipse cx="380" cy="230" rx="110" ry="40"/><ellipse cx="450" cy="205" rx="70" ry="45"/><ellipse cx="1180" cy="150" rx="90" ry="32"/><ellipse cx="1235" cy="130" rx="55" ry="36"/></g>`;
	// drum (kick, front view) in front of the cat
	s += cat({ x: 980, y: 560, s: .85, fur: '#F6A35B', belly: '#FFE3C2', ear: '#F7C1B0', eye: o, blush: '#F28C8C', o });
	s += `<g transform="translate(980 770)"><ellipse cx="0" cy="0" rx="200" ry="200" fill="#E25B5B" stroke="${o}" stroke-width="8"/><ellipse cx="0" cy="0" rx="150" ry="150" fill="#FFF6E8" stroke="${o}" stroke-width="6"/>
		<text x="0" y="40" text-anchor="middle" ${F} font-size="110" font-weight="900" fill="#E25B5B">咚</text></g>` + marks(980, 560, o);
	// beat stones
	[0, 1, 2, 3].forEach((k) => { const x = 330 + k * 130, on = k === 0;
		s += `<circle cx="${x}" cy="960" r="${on ? 52 : 42}" fill="${on ? '#E25B5B' : '#fff'}" stroke="${o}" stroke-width="6"/><text x="${x}" y="${975}" text-anchor="middle" ${F} font-size="${on ? 46 : 38}" font-weight="900" fill="${on ? '#fff' : o}">${k + 1}</text>`; });
	s += `<g transform="rotate(-2 520 170)"><rect x="140" y="100" width="760" height="130" rx="20" fill="#fff" stroke="${o}" stroke-width="6"/>
		<text x="180" y="190" ${F} font-size="60" font-weight="900" fill="${o}">一分钟敲几下，就叫 <tspan fill="#E25B5B">BPM</tspan></text></g>`;
	s += `<g transform="translate(1560 560) rotate(6)"><circle r="130" fill="#fff" stroke="${o}" stroke-width="6"/><text y="20" text-anchor="middle" ${F} font-size="96" font-weight="900" fill="#E25B5B">72</text><text y="74" text-anchor="middle" ${F} font-size="32" font-weight="700" fill="${o}">BPM · 心跳</text></g>`;
	return s;
}
function styleB() {   // 国潮: vermilion, gold, teal; auspicious clouds, a festival drum with gold studs; flat, no outlines
	const red = '#C8302A', gold = '#F2C14E', teal = '#1F6F6B', ink = '#2a1612';
	let s = `<rect width="${W}" height="${H}" fill="#F4E4C9"/><rect width="${W}" height="${H}" fill="${red}" opacity=".0"/>
	<circle cx="1000" cy="520" r="400" fill="${red}"/><circle cx="1000" cy="520" r="370" fill="none" stroke="${gold}" stroke-width="6" stroke-dasharray="2 18" stroke-linecap="round"/>`;
	const cloud = (x, y, sc, c) => `<g transform="translate(${x} ${y}) scale(${sc})" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"><path d="M0 0 C0 -40 50 -40 50 0 C50 -60 120 -60 120 0 C120 -40 170 -40 170 0 Z" fill="${c}" opacity=".18"/><path d="M0 0 C0 -40 50 -40 50 0 C50 -60 120 -60 120 0 C120 -40 170 -40 170 0"/><path d="M30 0 C30 -20 50 -20 50 -5"/></g>`;
	s += cloud(160, 640, 1.3, teal) + cloud(1560, 420, 1.0, teal) + cloud(1450, 860, 1.4, red) + cloud(120, 900, 1, gold);
	// lanterns
	for (const [x, y] of [[1500, 0], [1780, -40]]) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 120}" stroke="${ink}" stroke-width="4"/><ellipse cx="${x}" cy="${y + 190}" rx="70" ry="80" fill="${red}"/><rect x="${x - 40}" y="${y + 105}" width="80" height="18" rx="6" fill="${gold}"/><rect x="${x - 40}" y="${y + 258}" width="80" height="18" rx="6" fill="${gold}"/><path d="M${x} ${y + 276} L${x} ${y + 340}" stroke="${gold}" stroke-width="6"/>`;
	s += cat({ x: 1000, y: 540, s: .8, fur: '#FFF7EA', belly: '#FFE6C8', ear: '#F3A39A', eye: ink, blush: '#F27C6E', o: null,
		hat: `<path d="M-120 -120 C-60 -175 60 -175 120 -120 L100 -95 C40 -130 -40 -130 -100 -95Z" fill="${red}"/><circle cx="0" cy="-160" r="18" fill="${gold}"/>` });
	// 中国大鼓 seen from the front-top
	s += `<g transform="translate(1000 790)"><rect x="-210" y="-30" width="420" height="190" rx="30" fill="${red}"/><ellipse cx="0" cy="-30" rx="210" ry="60" fill="#F3D9A8"/><ellipse cx="0" cy="-30" rx="210" ry="60" fill="none" stroke="${gold}" stroke-width="8"/>
		${[...Array(9).keys()].map((i) => `<circle cx="${-180 + i * 45}" cy="${-4 + Math.sin(i / 8 * Math.PI) * 30}" r="8" fill="${gold}"/>`).join('')}
		<text x="0" y="110" text-anchor="middle" ${F} font-size="90" font-weight="900" fill="${gold}">咚</text></g>` + marks(1000, 540, gold);
	[0, 1, 2, 3].forEach((k) => { const x = 1420 + k * 110, on = k === 0;
		s += `<rect x="${x - 44}" y="660" width="88" height="88" rx="16" fill="${on ? red : '#fff'}" stroke="${on ? gold : teal}" stroke-width="5"/><text x="${x}" y="722" text-anchor="middle" ${F} font-size="46" font-weight="900" fill="${on ? gold : teal}">${k + 1}</text>`; });
	s += `<text x="1420" y="620" ${F} font-size="34" font-weight="700" fill="${teal}" text-anchor="start" dx="-44">跟着敲</text>`;
	s += `<g transform="translate(140 110)"><rect x="0" y="0" width="140" height="140" fill="${red}"/><text x="70" y="104" text-anchor="middle" ${F} font-size="96" font-weight="900" fill="${gold}">拍</text></g>
		<text x="140" y="340" ${F} font-size="62" font-weight="900" fill="${ink}">一分钟敲几下，</text><text x="140" y="420" ${F} font-size="62" font-weight="900" fill="${ink}">就叫 <tspan fill="${red}">BPM</tspan></text>
		<text x="140" y="490" ${F} font-size="34" font-weight="700" fill="${teal}">心跳 · 一分钟七十二下</text>`;
	return s;
}
function styleC() {   // 软萌3D (clay toy): pastel gradient room, everything rounded with soft shading and shadows
	let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7DCFF"/><stop offset="1" stop-color="#FFE3D3"/></linearGradient>
		<radialGradient id="gFur" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFE0A8"/><stop offset=".55" stop-color="#F9B95C"/><stop offset="1" stop-color="#D98A2E"/></radialGradient>
		<radialGradient id="gBelly" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FBE3CB"/></radialGradient>
		<radialGradient id="gDrum" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#9FD3FF"/><stop offset=".6" stop-color="#5BA8F0"/><stop offset="1" stop-color="#2F6FC0"/></radialGradient>
		<radialGradient id="gHead" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6EEF8"/></radialGradient>
		<radialGradient id="gBall" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFB3CF"/><stop offset="1" stop-color="#E8588F"/></radialGradient>
		<radialGradient id="gBallOff" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D9D2EE"/></radialGradient>
		<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter></defs>
	<rect width="${W}" height="${H}" fill="url(#bg)"/>
	<ellipse cx="960" cy="1060" rx="1300" ry="260" fill="#FFF" opacity=".55"/>`;
	s += `<ellipse cx="980" cy="985" rx="300" ry="40" fill="#7a5aa8" opacity=".25" filter="url(#sh)"/>`;
	s += cat({ x: 980, y: 560, s: .85, fur: '#F9B95C', belly: '#FFF', ear: '#FFB7A8', eye: '#3a2a3a', blush: '#FF8FA3', o: null, g: true });
	s += `<g transform="translate(980 770)"><ellipse cx="0" cy="0" rx="205" ry="205" fill="url(#gDrum)"/><ellipse cx="0" cy="0" rx="155" ry="155" fill="url(#gHead)"/>
		<ellipse cx="-50" cy="-60" rx="60" ry="30" fill="#fff" opacity=".7" transform="rotate(-30 -50 -60)"/><text x="0" y="38" text-anchor="middle" ${F} font-size="110" font-weight="900" fill="#5BA8F0">咚</text></g>` + marks(980, 560, '#8a6bd1');
	[0, 1, 2, 3].forEach((k) => { const x = 330 + k * 130, on = k === 0, r = on ? 54 : 44;
		s += `<ellipse cx="${x}" cy="${1000}" rx="${r}" ry="12" fill="#7a5aa8" opacity=".25" filter="url(#sh)"/><circle cx="${x}" cy="${950}" r="${r}" fill="url(#${on ? 'gBall' : 'gBallOff'})"/>
		<ellipse cx="${x - r * .3}" cy="${950 - r * .4}" rx="${r * .3}" ry="${r * .16}" fill="#fff" opacity=".8"/><text x="${x}" y="${966}" text-anchor="middle" ${F} font-size="${on ? 46 : 38}" font-weight="900" fill="${on ? '#fff' : '#7a5aa8'}">${k + 1}</text>`; });
	s += `<rect x="140" y="96" width="790" height="130" rx="65" fill="#fff" opacity=".85"/><text x="190" y="182" ${F} font-size="60" font-weight="900" fill="#4a3a6a">一分钟敲几下，就叫 <tspan fill="#E8588F">BPM</tspan></text>`;
	s += `<g transform="translate(1560 560)"><ellipse cx="0" cy="150" rx="120" ry="20" fill="#7a5aa8" opacity=".25" filter="url(#sh)"/><circle r="130" fill="url(#gBall)"/><ellipse cx="-40" cy="-60" rx="50" ry="24" fill="#fff" opacity=".7"/>
		<text y="22" text-anchor="middle" ${F} font-size="96" font-weight="900" fill="#fff">72</text><text y="72" text-anchor="middle" ${F} font-size="30" font-weight="700" fill="#fff">BPM · 心跳</text></g>`;
	return s;
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries({ A_绘本暖色: styleA, B_国潮: styleB, C_软萌3D: styleC })) {
	await page.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg></body></html>`);
	await page.waitForTimeout(120); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

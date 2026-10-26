// The cat band (rock outfits) drawn in four different art styles, same composition, so only the style changes.
// 1 扁平描边 flat+outline · 2 软萌3D clay · 3 极简线描 monoline · 4 Riso 印刷 (risograph, 3 inks, misregistration, halftone)
// node catstyles.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, SANS = `font-family="Noto Sans CJK SC, sans-serif"`;

// ---- styles: role → paint; outline settings; background ----
const ST = {
	flat: { name: '扁平描边', bg: '#FFF3DC', floor: '#D99A5F', wall: '#FBE3C4', ol: '#4a3428', sw: 6,
		c: { fur: '#F6A35B', belly: '#FFE3C2', earIn: '#F7C1B0', blush: '#F28C8C', dark: '#3a2a22', a1: '#E25B5B', a2: '#5B8DEF', a3: '#F2B33D', wood: '#C98A4B', metal: '#C9CED6', white: '#FFFFFF', leather: '#2f2a33' } },
	clay: { name: '软萌3D', clay: true, ol: null, sw: 0,
		c: { fur: ['#FFE0A8', '#F9B95C', '#D98A2E'], belly: ['#FFFFFF', '#FBE3CB'], earIn: '#FFB7A8', blush: '#FF8FA3', dark: ['#5a5470', '#2a2638'], a1: ['#FFB3B3', '#E8585E', '#A9303A'], a2: ['#BFD8FF', '#5B8DEF', '#2F5FB8'], a3: ['#FFE9A8', '#F2B33D', '#B97C10'],
			wood: ['#F0C48E', '#C98A4B'], metal: ['#FFFFFF', '#C9CED6', '#8E95A3'], white: ['#FFFFFF', '#E6EEF8'], leather: ['#6a6175', '#2f2a33'] } },
	line: { name: '极简线描', line: true, bg: '#F6F2EA', ol: '#222222', sw: 4,
		c: { fur: '#FBF8F2', belly: '#FBF8F2', earIn: '#FBF8F2', blush: '#F0B9A8', dark: '#222222', a1: '#E8553B', a2: '#FBF8F2', a3: '#E8553B', wood: '#FBF8F2', metal: '#FBF8F2', white: '#FBF8F2', leather: '#222222' } },
	riso: { name: 'Riso 印刷', riso: true, bg: '#F4EFE4', ol: '#0078BF', sw: 5,
		c: { fur: '#FFD400', belly: '#F4EFE4', earIn: '#FF48B0', blush: '#FF48B0', dark: '#0078BF', a1: '#FF48B0', a2: '#0078BF', a3: '#FF48B0', wood: '#FFD400', metal: '#F4EFE4', white: '#F4EFE4', leather: '#0078BF' } },
};
let S;  // current style
const fill = (role) => { const v = S.c[role]; if (S.clay && Array.isArray(v)) return `url(#g_${role})`; return Array.isArray(v) ? v[1] : v; };
const solid = (role) => { const v = S.c[role]; return Array.isArray(v) ? v[v.length > 2 ? 1 : 1] : v; };
const olA = (w = S.sw) => S.ol && w ? `stroke="${S.ol}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"` : '';
const P = (d, role, extra = '') => `<path d="${d}" fill="${fill(role)}" ${olA()} ${extra}/>`;
const E = (cx, cy, rx, ry, role, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill(role)}" ${olA()} ${extra}/>`;
// a limb or strap drawn as a stroke with an outline
const LIMB = (d, role, w) => (S.ol ? `<path d="${d}" fill="none" stroke="${S.ol}" stroke-width="${w + 2 * S.sw}" stroke-linecap="round" stroke-linejoin="round"/>` : '') + `<path d="${d}" fill="none" stroke="${solid(role) === 'none' ? S.bg : solid(role)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const LINE = (d, w = 6, col) => `<path d="${d}" fill="none" stroke="${col || (S.ol || solid('dark'))}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---- the cat (front view, origin = seat), with an outfit ----
function cat({ x, y, s = .62, eyes = 'open', hat = '', glasses = '', collar = '', front = '', arms = '' }) {
	let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
	g += `<ellipse cx="0" cy="168" rx="170" ry="20" fill="#000" opacity="${S.clay ? .18 : .1}" ${S.clay ? 'filter="url(#blur)"' : ''}/>`;
	g += LIMB('M110 120 C190 120 210 40 175 10', 'fur', 24);
	g += P('M-120 60 C-140 -10 -100 -80 0 -80 C100 -80 140 -10 120 60 C120 130 70 160 0 160 C-70 160 -120 130 -120 60Z', 'fur');
	g += `<ellipse cx="0" cy="80" rx="62" ry="56" fill="${fill('belly')}"/>`;
	g += collar;
	g += `<g transform="translate(0 -190)">`;
	g += P('M-120 -30 L-136 -150 L-48 -96Z', 'fur') + P('M120 -30 L136 -150 L48 -96Z', 'fur');
	g += `<path d="M-112 -56 L-120 -124 L-74 -94Z" fill="${fill('earIn')}"/><path d="M112 -56 L120 -124 L74 -94Z" fill="${fill('earIn')}"/>`;
	g += E(0, 0, 152, 128, 'fur');
	if (eyes === 'open') g += `<ellipse cx="-62" cy="-6" rx="13" ry="17" fill="${solid('dark')}"/><ellipse cx="62" cy="-6" rx="13" ry="17" fill="${solid('dark')}"/><circle cx="-58" cy="-12" r="4" fill="#fff"/><circle cx="66" cy="-12" r="4" fill="#fff"/>`;
	else g += LINE('M-84 -18 L-56 -4 L-84 10 M84 -18 L56 -4 L84 10', 9);
	g += `<ellipse cx="-92" cy="36" rx="26" ry="15" fill="${fill('blush')}" opacity="${S.line ? 1 : .75}"/><ellipse cx="92" cy="36" rx="26" ry="15" fill="${fill('blush')}" opacity="${S.line ? 1 : .75}"/>`;
	g += `<path d="M-8 20 L8 20 L0 30Z" fill="${solid('dark')}"/>` + LINE('M-24 40 Q-12 54 0 40 Q12 54 24 40', 6, solid('dark'));
	g += LINE('M-136 16 L-190 8 M-136 32 L-186 40 M136 16 L190 8 M136 32 L186 40', 3.5, solid('dark'));
	g += glasses + hat + `</g>`;
	g += front + arms;
	return g + `</g>`;
}
// outfits & props (cat-local coords)
const SHADES = () => P('M-112 -30 h88 a10 10 0 0 1 10 10 v16 a26 26 0 0 1 -26 26 h-46 a26 26 0 0 1 -26 -26 v-16 a10 10 0 0 1 10 -10Z', 'dark') + P('M24 -30 h88 a10 10 0 0 1 10 10 v16 a26 26 0 0 1 -26 26 h-46 a26 26 0 0 1 -26 -26 v-16 a10 10 0 0 1 10 -10Z', 'dark') + LINE('M-14 -22 L14 -22', 7, solid('dark')) + `<path d="M-96 -22 l20 0" stroke="#fff" stroke-width="5" opacity=".6"/><path d="M40 -22 l20 0" stroke="#fff" stroke-width="5" opacity=".6"/>`;
const STARS = () => { const st = (cx) => `M${cx} -46 L${cx + 12} -16 L${cx + 44} -16 L${cx + 18} 4 L${cx + 28} 34 L${cx} 16 L${cx - 28} 34 L${cx - 18} 4 L${cx - 44} -16 L${cx - 12} -16Z`; return P(st(-62), 'a3') + P(st(62), 'a3') + LINE('M-20 -10 L20 -10', 6, solid('dark')); };
const HEADBAND = () => P('M-146 -60 Q0 -96 146 -60 L150 -36 Q0 -72 -150 -36Z', 'a1') + P('M136 -50 L186 -70 L176 -30Z', 'a1');
const BEANIE = () => P('M-150 -40 C-150 -170 150 -170 150 -40Z', 'a2') + P('M-158 -54 L158 -54 L158 -20 L-158 -20Z', 'a2') + E(0, -160, 26, 24, 'a2');
const JACKET = () => P('M-120 60 C-140 -10 -100 -80 -30 -80 L0 40 L30 -80 C100 -80 140 -10 120 60 C120 120 90 150 60 156 L-60 156 C-90 150 -120 120 -120 60Z', 'leather') + P('M-30 -80 L-6 -20 L-60 -40Z', 'leather') + P('M30 -80 L6 -20 L60 -40Z', 'leather') + `<circle cx="-70" cy="40" r="6" fill="${solid('metal')}"/><circle cx="-70" cy="80" r="6" fill="${solid('metal')}"/>`;
const SCARF = () => P('M-90 -78 Q0 -36 90 -78 L80 -46 Q0 -10 -80 -46Z', 'a1') + P('M40 -50 L70 40 L30 36 L18 -44Z', 'a1');
const EGUITAR = (c = 'a1') => `<g transform="translate(-10 70) rotate(-28)">` + P('M-120 -10 C-160 -60 -80 -96 -40 -60 C-10 -90 50 -70 40 -30 C80 -10 70 60 20 60 C-20 90 -110 70 -120 -10Z', c) + `<rect x="-10" y="-10" width="250" height="26" fill="${fill('wood')}" ${olA()}/>` + P('M236 -24 L300 -30 L300 30 L236 22Z', 'dark') + LINE('M-60 -2 L230 -2 M-60 6 L230 6', 2, solid('metal')) + `<rect x="-70" y="-14" width="14" height="34" fill="${solid('dark')}"/></g>`;
const BASS = () => `<g transform="translate(-10 80) rotate(-36)">` + P('M-130 -10 C-170 -70 -80 -100 -40 -60 C-10 -86 40 -70 34 -30 C74 -10 64 66 14 66 C-26 96 -120 74 -130 -10Z', 'a2') + `<rect x="-10" y="-9" width="330" height="22" fill="${fill('wood')}" ${olA()}/>` + P('M316 -20 L370 -26 L370 26 L316 18Z', 'dark') + `</g>`;
const DRUM = () => `<g transform="translate(0 70)">` + E(0, 0, 112, 112, 'a1') + E(0, 0, 82, 82, 'white') + `<text y="22" text-anchor="middle" ${SANS} font-size="56" font-weight="900" fill="${solid('a1')}">咚</text></g>` + `<g transform="translate(150 -40)">` + LINE('M0 0 L0 180', 6) + E(0, 0, 80, 14, 'a3') + `</g>`;
const MIC = () => LINE('M70 -40 L70 170', 8) + LINE('M40 170 L100 170', 8) + `<g transform="translate(70 -70)">` + E(0, 0, 22, 30, 'dark') + `</g>`;
// arm poses: two strokes from the shoulders to the hands (with paws)
const ARMS = (lx, ly, rx, ry, stick = false) => { let g = '';
	for (const [sx, hx, hy] of [[-95, lx, ly], [95, rx, ry]]) { g += LIMB(`M${sx} -40 Q${sx + Math.sign(sx) * 50} ${(hy - 40) / 2} ${hx} ${hy}`, 'fur', 34);
		if (stick) g += `<path d="M${hx} ${hy} L${hx + Math.sign(sx) * 50} ${hy - 150}" stroke="${S.ol || solid('dark')}" stroke-width="${S.ol ? 18 : 14}" stroke-linecap="round"/><path d="M${hx} ${hy} L${hx + Math.sign(sx) * 50} ${hy - 150}" stroke="${solid('wood')}" stroke-width="9" stroke-linecap="round"/>`;
		g += E(hx, hy, 26, 24, 'fur'); }
	return g; };

function stage() {
	let s = '';
	if (S.clay) s += `<rect width="${W}" height="${H}" fill="url(#g_bg)"/><ellipse cx="960" cy="1060" rx="1300" ry="300" fill="#fff" opacity=".5"/>`;
	else s += `<rect width="${W}" height="${H}" fill="${S.bg}"/>`;
	if (S.c && !S.clay && !S.line && !S.riso) s += `<rect width="${W}" height="850" fill="${S.wall}"/><rect y="850" width="${W}" height="60" fill="${S.floor}" ${olA(5)}/>`;
	if (S.line) s += LINE(`M120 880 L1800 880`, 3);
	if (S.riso) s += `<rect y="870" width="${W}" height="210" fill="url(#ht_pink)" opacity=".55"/>`;
	// a spotlight per cat
	for (const x of [330, 750, 1170, 1590]) s += S.line ? '' : `<ellipse cx="${x}" cy="860" rx="210" ry="34" fill="${S.riso ? '#0078BF' : '#fff'}" opacity="${S.riso ? .15 : .35}"/>`;
	return s;
}
function band() {
	let s = '';
	s += cat({ x: 330, y: 700, s: .86, hat: HEADBAND(), glasses: SHADES(), front: DRUM(), arms: ARMS(-150, -70, 150, -70, true), eyes: 'squeeze' });
	s += cat({ x: 750, y: 700, s: .86, collar: JACKET(), glasses: SHADES(), front: EGUITAR('a1'), arms: ARMS(-130, 20, 90, 70) });
	s += cat({ x: 1170, y: 700, s: .86, hat: BEANIE(), front: BASS(), arms: ARMS(-140, 40, 100, 80) });
	s += cat({ x: 1590, y: 700, s: .86, collar: SCARF(), glasses: STARS(), front: MIC(), arms: ARMS(-110, 60, 60, -60), eyes: 'squeeze' });
	return s;
}
function title() {
	const col = S.riso ? '#FF48B0' : S.line ? '#222' : S.clay ? '#4a3a6a' : '#4a3428';
	return `<text x="120" y="140" ${SANS} font-size="64" font-weight="900" fill="${col}">摇滚 <tspan font-size="40" font-weight="700" opacity=".6">ROCK</tspan></text>
		<text x="1800" y="140" text-anchor="end" ${SANS} font-size="30" font-weight="700" fill="${col}" opacity=".6">${S.name}</text>`;
}
function defs() {
	let d = `<defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
		<pattern id="ht_pink" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="2.6" fill="#FF48B0"/></pattern>
		<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter>
		<linearGradient id="g_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7DCFF"/><stop offset="1" stop-color="#FFE3D3"/></linearGradient>`;
	if (S.clay) for (const [k, v] of Object.entries(S.c)) if (Array.isArray(v)) d += `<radialGradient id="g_${k}" cx=".38" cy=".3" r=".85">${v.map((c, i) => `<stop offset="${i / (v.length - 1)}" stop-color="${c}"/>`).join('')}</radialGradient>`;
	return d + `</defs>`;
}
function frame(key) {
	S = ST[key];
	if (S.riso) {   // two passes: inks (fills) multiplied, then the blue key line offset a little (misregistration)
		const fills = (() => { const o = S.ol; S.ol = null; const r = stage() + band(); S.ol = o; return r; })();
		const keyline = (() => { const c = S.c; S.c = Object.fromEntries(Object.keys(c).map((k) => [k, 'none'])); S.c.dark = '#0078BF'; const r = band(); S.c = c; return r; })();
		return defs() + `<g style="mix-blend-mode:multiply">${fills}</g><g transform="translate(5 -3)" style="mix-blend-mode:multiply" opacity=".9">${keyline}</g>` + title() + `<rect width="${W}" height="${H}" filter="url(#grain)"/>`;
	}
	return defs() + stage() + band() + title() + (S.clay ? '' : `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${S.line ? .4 : .5}"/>`);
}
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [i, k] of ['flat', 'clay', 'line', 'riso'].entries()) {
	await page.setContent(`<html><body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${frame(k)}</svg></body></html>`);
	await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/C${i + 1}_${ST[k].name.replace(/\s/g, '')}.png` }); console.log(k);
}
await browser.close();

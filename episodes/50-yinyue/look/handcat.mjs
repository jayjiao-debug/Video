// Hand-drawn cute cats for 喵喵乐队: real cat coats (ginger, tabby, calico, tuxedo…), big glossy eyes, blush hatching,
// wobbly lines, colour that sits slightly off the line, paper grain. Lane colour lives in the bow tie, not the fur.
// Three finishes: crayon (彩铅蜡笔), watercolor (水彩), marker (马克笔, thick-line sticker cute).
// import { handCat, handDefs, paper, HSTYLES } from './handcat.mjs'
export const HSTYLES = {
	crayon: { name: '彩铅蜡笔', line: '#5A4036', lw: 4.2, wob: 4.2, wf: 0.032, mis: [2.5, 1.5], grain: true, sketch: true, paper: '#FBF3E3' },
	watercolor: { name: '水彩', line: '#6B5246', lw: 2.6, wob: 2.6, wf: 0.04, mis: [4, 3], wash: true, paper: '#FDFAF4' },
	marker: { name: '马克笔', line: '#3B2C28', lw: 6.5, wob: 1.4, wf: 0.02, mis: [0, 0], gloss: true, paper: '#FFF6EA' },
};
export const COATS = {
	ginger: { fur: '#F7B56E', dark: '#E28A44', light: '#FFE6C7' },
	cream: { fur: '#FFEBCB', dark: '#F0C88F', light: '#FFF8EC' },
	grey: { fur: '#C8CCD8', dark: '#9EA4B8', light: '#EEF0F5' },
	tux: { fur: '#5D5663', dark: '#45404B', light: '#FFFDF8' },
	calico: { fur: '#FFF8EE', dark: '#F2A35E', light: '#FFFDF8', patch2: '#5D5663' },
	white: { fur: '#FFFDF8', dark: '#E9DFD2', light: '#FFFFFF' },
	pinkish: { fur: '#F9CFCB', dark: '#EFA9A4', light: '#FFF0EE' },
};
const PINK = '#F4A3A8', NOSE = '#EE8E95';
let ST = HSTYLES.crayon;

// ---- primitives: every shape is drawn twice, a colour layer (nudged off the line) and a line layer
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
function shapes(list) {
	const [mx, my] = ST.mis;
	let fill = `<g transform="translate(${mx} ${my})">`, line = '';
	for (const s of list) {
		if (s.fill && s.fill !== 'none') fill += `<path d="${s.d}" fill="${s.fill}" ${s.op ? `opacity="${s.op}"` : ''}/>`;
		if (s.line !== false) {
			const w = (s.lw ?? 1) * ST.lw;
			line += `<path d="${s.d}" fill="none" stroke="${s.col || ST.line}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
			if (ST.sketch && w > 2) line += `<path d="${s.d}" fill="none" stroke="${s.col || ST.line}" stroke-width="${w * .45}" stroke-linecap="round" opacity=".35" transform="translate(1.6 -1.2) rotate(.6)"/>`;
		}
	}
	return fill + '</g>' + line;
}
// shapes that must be drawn in one go (fill then its own line) so later shapes can cover them
const one = (s) => shapes([s]);

// ---- the cat. origin = ground between the feet; it walks to the left.
// o: { coat, mark: tabby|patch|calico|none, bow: colour, inst, hat, face: happy|hit|sleep|sweat|wow, ph (walk phase), alpha, seed, pop, word, wordCol }
export function handCat(x, y, s, o = {}) {
	const c = COATS[o.coat || 'ginger'];
	let bob = 0, sq = 1, lift = [0, 0];
	if (o.ph !== undefined) {
		const k = Math.floor(o.ph), u = o.ph - k, l = Math.sin(Math.PI * u);
		bob = -8 * l; sq = 1 - 0.08 * Math.max(0, 1 - u * 6) - (o.face === 'hit' ? 0.03 : 0);
		lift = k % 2 ? [l, 0] : [0, l];
	} else if (o.face === 'hit') sq = 0.93;
	const seed = o.seed ?? 1;
	let g = `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o.alpha ?? 1}">`;
	g += `<g filter="url(#hd${seed % 3})">`;
	// tail (behind)
	const tail = 'M44 -16 C76 -12 88 -40 74 -58 C68 -66 58 -62 62 -54';
	g += `<path d="${tail}" fill="none" stroke="${ST.line}" stroke-width="${18 + 2 * ST.lw}" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="${c.fur}" stroke-width="18" stroke-linecap="round"/>`;
	if (o.mark === 'tabby' || o.mark === 'calico') g += `<path d="M66 -22 L76 -26 M74 -38 L84 -38" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`;
	if (o.coat === 'tux' || o.mark === 'tiptail') g += `<path d="M66 -60 C62 -64 58 -60 62 -54" fill="none" stroke="${c.light}" stroke-width="14" stroke-linecap="round"/>`;
	// feet (two round paws, the lifting one rises)
	const foot = (fx, l) => ({ d: ell(fx - 4 * l, 8 - 10 * l, 13, 9), fill: o.coat === 'tux' ? c.light : c.fur });
	g += shapes([foot(-20, lift[0]), foot(18, lift[1])]);
	// body group squashes on landing
	g += `<g transform="translate(0 ${bob.toFixed(2)}) scale(${(2 - sq).toFixed(3)} ${sq.toFixed(3)})">`;
	// ears
	const earL = 'M-48 -50 C-54 -78 -50 -98 -40 -100 C-30 -98 -20 -86 -12 -78', earR = 'M14 -78 C22 -88 34 -98 42 -98 C52 -96 54 -76 48 -50';
	g += shapes([{ d: earL + ' L-20 -50 Z', fill: c.fur }, { d: earR + ' L20 -50 Z', fill: o.mark === 'patch' || o.mark === 'calico' ? (o.mark === 'calico' ? c.patch2 : c.dark) : c.fur }]);
	g += `<path d="M-40 -66 C-42 -80 -40 -90 -36 -91 C-30 -88 -26 -82 -22 -76 Z" fill="${PINK}" opacity=".7"/><path d="M22 -76 C28 -84 34 -89 39 -89 C44 -86 44 -76 42 -66 Z" fill="${PINK}" opacity=".7"/>`;
	// body: a soft dumpling
	const body = 'M-56 -8 C-62 -50 -40 -86 0 -86 C40 -86 62 -50 56 -8 C54 8 32 13 0 13 C-32 13 -54 8 -56 -8 Z';
	g += `<g transform="translate(${ST.mis[0]} ${ST.mis[1]})"><path d="${body}" fill="${c.fur}"/>`;
	// coat markings, clipped to the body
	g += `<g clip-path="url(#hbody)">`;
	if (o.mark === 'tabby') g += `<path d="M-14 -84 L-12 -70 M0 -86 L0 -71 M14 -84 L12 -70" stroke="${c.dark}" stroke-width="5.5" stroke-linecap="round"/><path d="M-58 -30 L-46 -28 M-58 -18 L-47 -18 M58 -30 L46 -28 M58 -18 L47 -18" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`;
	if (o.mark === 'patch') g += `<path d="M2 -90 C30 -92 56 -70 58 -44 C40 -40 22 -50 14 -62 C8 -70 2 -80 2 -90Z" fill="${c.dark}"/>`;
	if (o.mark === 'calico') g += `<path d="M-60 -60 C-50 -92 -18 -96 -10 -80 C-16 -66 -36 -56 -60 -50Z" fill="${c.dark}"/><path d="M20 -92 C46 -90 62 -70 60 -52 C46 -54 30 -64 22 -76Z" fill="${c.patch2}"/><path d="M30 -6 C40 -18 60 -16 62 0 L40 20Z" fill="${c.dark}"/>`;
	if (o.coat === 'tux') g += `<path d="M-30 -28 C-30 -50 10 -50 10 -28 C24 -22 30 -6 22 14 L-34 14 C-42 -6 -40 -22 -30 -28Z" fill="${c.light}"/>`;
	else g += `<ellipse cx="-6" cy="-6" rx="28" ry="20" fill="${c.light}" opacity=".75"/>`;
	if (ST.wash) g += `<path d="${body}" fill="none" stroke="${c.dark}" stroke-width="10" opacity=".35" filter="url(#hblur)"/>`;
	if (ST.gloss) g += `<path d="M-40 -60 C-36 -74 -24 -80 -12 -80" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;
	g += `</g></g>`;
	g += `<path d="${body}" fill="none" stroke="${ST.line}" stroke-width="${ST.lw}" stroke-linejoin="round"/>`;
	if (ST.sketch) g += `<path d="${body}" fill="none" stroke="${ST.line}" stroke-width="${ST.lw * .45}" opacity=".35" transform="translate(1.6 -1.2) rotate(.6)"/>`;
	g += hat(o.hat, c);
	g += face(o.face || 'happy', c, o.coat === 'tux');
	g += bow(o.bow);
	g += inst(o.inst, c);
	g += `</g></g>`;
	// effects (not wobbled, so they stay crisp)
	if (o.face === 'hit') { const p = o.pop ?? 1; g += `<g opacity="${Math.min(1, p * 1.5).toFixed(3)}" transform="scale(${(0.75 + 0.25 * p).toFixed(3)})">${burst(o.word, o.wordCol)}</g>`; }
	if (o.face === 'sweat') g += `<path d="M50 -92 C46 -84 44 -78 50 -74 C56 -78 54 -84 50 -92Z" fill="#A8D4F2" stroke="${ST.line}" stroke-width="2"/><path d="M62 -76 C59 -70 58 -66 62 -63 C66 -66 65 -70 62 -76Z" fill="#A8D4F2" stroke="${ST.line}" stroke-width="2"/>`;
	if (o.face === 'sleep') g += `<text x="40" y="-102" font-size="30" font-weight="900" fill="#8AA4D6" font-family="Noto Sans CJK SC, sans-serif">z</text><text x="60" y="-122" font-size="22" font-weight="900" fill="#8AA4D6" font-family="Noto Sans CJK SC, sans-serif">z</text>`;
	return g + `</g>`;
}
function face(k, c, dark) {
	const L = ST.line, ink = dark ? '#2A2329' : L;
	let g = '';
	// blush with three little hatch lines
	g += `<ellipse cx="-40" cy="-30" rx="11" ry="6.5" fill="${PINK}" opacity=".6"/><ellipse cx="24" cy="-30" rx="11" ry="6.5" fill="${PINK}" opacity=".6"/>`;
	g += `<path d="M-46 -27 L-43 -33 M-41 -27 L-38 -33 M-36 -27 L-33 -33 M18 -27 L21 -33 M23 -27 L26 -33 M28 -27 L31 -33" stroke="${dark ? '#FFFDF8' : L}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
	// eyes
	const eye = (ex) => `<ellipse cx="${ex}" cy="-42" rx="7" ry="8.5" fill="${dark ? '#FFF2C2' : ink}"/>` + (dark ? `<ellipse cx="${ex}" cy="-41" rx="4.5" ry="7" fill="#2A2329"/>` : '') + `<circle cx="${ex + 2.4}" cy="-45.5" r="2.8" fill="#fff"/><circle cx="${ex - 2.4}" cy="-38.5" r="1.3" fill="#fff"/>`;
	const shut = (ex, up) => `<path d="M${ex - 7} -42 Q${ex} ${up ? -50 : -35} ${ex + 7} -42" fill="none" stroke="${dark ? '#FFFDF8' : L}" stroke-width="3.4" stroke-linecap="round"/>`;
	const squint = (ex, dir) => `<path d="M${ex - 6 * dir} -48 L${ex + 5 * dir} -42 L${ex - 6 * dir} -36" fill="none" stroke="${dark ? '#FFFDF8' : L}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;
	if (k === 'hit') g += shut(-26, true) + shut(8, true);
	else if (k === 'sleep') g += shut(-26, false) + shut(8, false);
	else if (k === 'sweat') g += squint(-26, -1) + squint(8, 1);
	else if (k === 'wow') g += `<circle cx="-26" cy="-42" r="9" fill="${dark ? '#FFF2C2' : ink}"/><circle cx="8" cy="-42" r="9" fill="${dark ? '#FFF2C2' : ink}"/><circle cx="-23" cy="-45" r="3.4" fill="#fff"/><circle cx="11" cy="-45" r="3.4" fill="#fff"/>`;
	else g += eye(-26) + eye(8);
	// nose + mouth
	const ml = dark ? '#FFFDF8' : L;
	g += `<path d="M-12 -33 L-6 -33 L-9 -29.5 Z" fill="${NOSE}" stroke="${ml}" stroke-width="1.4" stroke-linejoin="round"/>`;
	if (k === 'hit' || k === 'wow') g += `<path d="M-15 -27 Q-9 -20 -3 -27 Q-9 -14 -15 -27Z" fill="#D9636D" stroke="${ml}" stroke-width="2.2" stroke-linejoin="round"/>`;
	else if (k === 'sweat') g += `<path d="M-16 -24 Q-12.5 -28 -9 -24 Q-5.5 -20 -2 -24" fill="none" stroke="${ml}" stroke-width="2.4" stroke-linecap="round"/>`;
	else g += `<path d="M-16 -27 Q-12.5 -22 -9 -27 Q-5.5 -22 -2 -27" fill="none" stroke="${ml}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
	// whiskers
	g += `<path d="M-56 -36 L-70 -39 M-56 -29 L-70 -27 M40 -36 L54 -39 M40 -29 L54 -27" stroke="${L}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
	return g;
}
function bow(col) {
	if (!col) return '';
	return one({ d: 'M-9 -14 L-26 -22 L-26 -4 Z', fill: col, lw: .7 }) + one({ d: 'M-9 -14 L8 -22 L8 -4 Z', fill: col, lw: .7 }) + one({ d: ell(-9, -14, 5, 5), fill: col, lw: .7 });
}
function hat(k, c) {
	switch (k) {
		case 'shako': return shapes([{ d: 'M-30 -82 L-26 -116 L18 -116 L22 -82 Z', fill: '#E8746C' }, { d: 'M-30 -90 L22 -90 L22 -82 L-30 -82 Z', fill: '#F2C14E', lw: .6 }, { d: 'M-4 -116 C-10 -132 -2 -144 6 -140 C4 -132 4 -124 -4 -116Z', fill: '#FFFDF8', lw: .6 }]);
		case 'fez': return shapes([{ d: 'M-26 -82 L-20 -112 L14 -112 L20 -82 Z', fill: '#D9473F' }]) + `<path d="M-3 -112 C-6 -102 -14 -96 -18 -86" fill="none" stroke="${ST.line}" stroke-width="3"/><circle cx="-18" cy="-84" r="5" fill="${ST.line}"/>`;
		case 'phones': return `<path d="M-52 -50 C-56 -116 52 -116 48 -50" fill="none" stroke="${ST.line}" stroke-width="${8 + 2 * ST.lw}"/><path d="M-52 -50 C-56 -116 52 -116 48 -50" fill="none" stroke="#7A7F9A" stroke-width="8"/>` + shapes([{ d: 'M-64 -64 L-46 -64 L-46 -36 L-64 -36 Z', fill: '#FF8FB1' }, { d: 'M42 -64 L60 -64 L60 -36 L42 -36 Z', fill: '#79C7F2' }]);
		case 'beret': return shapes([{ d: 'M-40 -80 C-44 -104 30 -112 40 -86 C20 -78 -20 -76 -40 -80Z', fill: '#E8746C' }]) + `<path d="M0 -104 L4 -114" stroke="${ST.line}" stroke-width="4" stroke-linecap="round"/>`;
		default: return '';
	}
}
const paw = (x, y, c) => one({ d: ell(x, y, 9, 8.5), fill: c.fur === '#5D5663' ? c.light : c.fur });
function inst(k, c) {
	switch (k) {
		case 'snare': return shapes([{ d: 'M-38 0 L-38 18 C-38 24 18 24 18 18 L18 0 Z', fill: '#E8746C' }, { d: ell(-10, 0, 28, 8), fill: '#FFFDF5' }])
			+ `<path d="M-34 -8 L-56 -34 M12 -8 L32 -36" stroke="${ST.line}" stroke-width="4.5" stroke-linecap="round"/>` + paw(-34, -8, c) + paw(12, -8, c);
		case 'kick': return shapes([{ d: ell(-20, 2, 23, 23), fill: '#E8746C' }, { d: ell(-20, 2, 17, 17), fill: '#FFFDF5', lw: .6 }])
			+ `<path d="M30 -12 L52 -50" stroke="${ST.line}" stroke-width="5" stroke-linecap="round"/>` + one({ d: ell(54, -54, 9, 9), fill: '#FFFDF5' }) + paw(30, -10, c);
		case 'trumpet': return shapes([{ d: 'M-16 -26 L-60 -30 L-60 -24 L-16 -20 Z', fill: '#F2C14E', lw: .6 }, { d: 'M-58 -34 L-84 -46 L-84 -10 L-58 -20 Z', fill: '#F2C14E' }]) + paw(-30, -22, c) + paw(-46, -24, c);
		case 'cymbal': return shapes([{ d: ell(-56, -34, 9, 24), fill: '#F2C14E' }, { d: ell(48, -34, 9, 24), fill: '#F2C14E' }]) + paw(-48, -34, c) + paw(40, -34, c);
		case 'tuba': return `<circle cx="-16" cy="2" r="15" fill="none" stroke="${ST.line}" stroke-width="${10 + 2 * ST.lw}"/><circle cx="-16" cy="2" r="15" fill="none" stroke="#F2C14E" stroke-width="10"/>` + shapes([{ d: 'M18 -6 L50 -76 L78 -62 L32 0 Z', fill: '#F2C14E' }]) + paw(-32, -2, c) + paw(16, -4, c);
		case 'guitar': return `<path d="M-14 -16 L-76 -56" stroke="${ST.line}" stroke-width="9" stroke-linecap="round"/><path d="M-14 -16 L-76 -56" stroke="#A0704A" stroke-width="5" stroke-linecap="round"/>` + one({ d: ell(-8, -10, 24, 18), fill: '#E8746C' }) + `<circle cx="-10" cy="-12" r="5" fill="${ST.line}"/>` + paw(-54, -42, c) + paw(8, -14, c);
		default: return '';
	}
}
function burst(word, col) {
	const cc = col || '#E8746C';
	let g = '';
	for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.36, r0 = 106, r1 = 128; g += `<path d="M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0 - 30).toFixed(1)} L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1 - 30).toFixed(1)}" stroke="${cc}" stroke-width="6" stroke-linecap="round"/>`; }
	if (word) g += `<text x="0" y="-146" text-anchor="middle" font-size="46" font-weight="900" fill="${cc}" stroke="#FFFDF8" stroke-width="8" paint-order="stroke" font-family="Noto Sans CJK SC, sans-serif">${word}</text>`;
	return g;
}
// filters: three wobble seeds (so cats next to each other don't wobble the same way), paper grain, blur for washes
export function handDefs(style, frameSeed = 0) {
	ST = HSTYLES[style];
	let d = '<defs>';
	for (let i = 0; i < 3; i++) {
		d += `<filter id="hd${i}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="${ST.wf}" numOctaves="2" seed="${i * 17 + frameSeed}" result="n"/>`
			+ `<feDisplacementMap in="SourceGraphic" in2="n" scale="${ST.wob}" xChannelSelector="R" yChannelSelector="G" result="w"/>`;
		if (ST.grain) d += `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="${i + 3}" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.1 1.05" result="ga"/>`
			+ `<feComposite in="ga" in2="w" operator="in" result="gm"/><feBlend in="w" in2="gm" mode="multiply" result="wg"/><feComposite in="wg" in2="w" operator="in"/>`;
		if (ST.wash) d += `<feGaussianBlur in="w" stdDeviation=".6"/>`;
		d += `</filter>`;
	}
	d += `<filter id="hblur"><feGaussianBlur stdDeviation="6"/></filter>`;
	d += `<clipPath id="hbody" clipPathUnits="userSpaceOnUse"><path d="M-56 -8 C-62 -50 -40 -86 0 -86 C40 -86 62 -50 56 -8 C54 8 32 13 0 13 C-32 13 -54 8 -56 -8 Z"/></clipPath>`;
	d += `<clipPath id="hhead" clipPathUnits="userSpaceOnUse"><path d="M-58 -98 C-62 -136 -30 -152 0 -152 C30 -152 62 -136 58 -98 C56 -66 30 -56 0 -56 C-30 -56 -56 -66 -58 -98Z"/></clipPath>`;
	d += `<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="5" result="p"/><feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0.09 0"/></filter>`;
	return d + '</defs>';
}
export function paper(W, H) {
	return `<rect width="${W}" height="${H}" fill="${ST.paper}"/><rect width="${W}" height="${H}" filter="url(#paper)"/>`;
}
export const setHandStyle = (k) => { ST = HSTYLES[k]; };
export const handLine = () => ST.line;
export { shapes, ell, face, bow, burst as handBurst };

// ---- B · 大头小猫: the big-head standing kitten the owner picked (2026-10-27). origin = ground between the feet.
// o: { coat, mark, bow, face, ph (walk phase, footfall on whole numbers), arms: swing|up|hold, alpha, seed, pop, word, wordCol, wag (0..1) }
const earsAt = (lx, rx, y, fur, k = 1) => shapes([
	{ d: `M${lx - 10 * k} ${y + 18 * k} C${lx - 14 * k} ${y - 8 * k} ${lx - 8 * k} ${y - 24 * k} ${lx} ${y - 26 * k} C${lx + 10 * k} ${y - 22 * k} ${lx + 20 * k} ${y - 8 * k} ${lx + 26 * k} ${y + 4 * k} Z`, fill: fur.l },
	{ d: `M${rx + 10 * k} ${y + 18 * k} C${rx + 14 * k} ${y - 8 * k} ${rx + 8 * k} ${y - 24 * k} ${rx} ${y - 26 * k} C${rx - 10 * k} ${y - 22 * k} ${rx - 20 * k} ${y - 8 * k} ${rx - 26 * k} ${y + 4 * k} Z`, fill: fur.r }])
	+ `<path d="M${lx - 4 * k} ${y + 8 * k} C${lx - 4 * k} ${y - 6 * k} ${lx} ${y - 14 * k} ${lx + 4 * k} ${y - 15 * k} C${lx + 10 * k} ${y - 10 * k} ${lx + 14 * k} ${y - 4 * k} ${lx + 16 * k} ${y + 2 * k}Z" fill="${PINK}" opacity=".7"/>`
	+ `<path d="M${rx + 4 * k} ${y + 8 * k} C${rx + 4 * k} ${y - 6 * k} ${rx} ${y - 14 * k} ${rx - 4 * k} ${y - 15 * k} C${rx - 10 * k} ${y - 10 * k} ${rx - 14 * k} ${y - 4 * k} ${rx - 16 * k} ${y + 2 * k}Z" fill="${PINK}" opacity=".7"/>`;
const limb = (d, fur, w) => `<path d="${d}" fill="none" stroke="${ST.line}" stroke-width="${w + 2 * ST.lw}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fur}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const HEAD = 'M-58 -98 C-62 -136 -30 -152 0 -152 C30 -152 62 -136 58 -98 C56 -66 30 -56 0 -56 C-30 -56 -56 -66 -58 -98Z';
const TORSO = 'M-30 -62 C-38 -34 -36 -4 -18 4 L18 4 C36 -4 38 -34 30 -62 Z';
export function handChibi(x, y, s, o = {}) {
	const c = COATS[o.coat || 'ginger'], dark = o.coat === 'tux';
	const paw = dark ? c.light : c.fur;
	let bob = 0, sq = 1, lift = [0, 0], swing = 0, tilt = 0;
	if (o.ph !== undefined) {
		const k = Math.floor(o.ph), u = o.ph - k, l = Math.sin(Math.PI * u);
		bob = -9 * l; sq = 1 - 0.07 * Math.max(0, 1 - u * 6);
		lift = k % 2 ? [l, 0] : [0, l];
		swing = (k % 2 ? 1 : -1) * Math.sin(Math.PI * u);   // arms swing against the legs
		tilt = (k % 2 ? 1 : -1) * 3 * l;
	}
	const hit = o.face === 'hit';
	if (hit) sq -= 0.04;
	const wag = Math.sin((o.wag ?? 0) * Math.PI * 2) * 8;
	let g = `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o.alpha ?? 1}"><g filter="url(#hd${(o.seed ?? 0) % 3})">`;
	// tail
	g += limb(`M18 -22 C50 -22 ${62 + wag} -50 ${50 + wag} -72 C${46 + wag} -80 ${38 + wag} -76 ${42 + wag} -68`, c.fur, 13);
	if (o.mark === 'tabby' || o.mark === 'calico') g += `<path d="M44 -34 L54 -38 M${54 + wag * .6} -52 L${64 + wag * .6} -52" stroke="${c.dark}" stroke-width="4.5" stroke-linecap="round"/>`;
	// feet
	g += shapes([{ d: ell(-15 - 4 * lift[0], 6 - 12 * lift[0], 13, 9), fill: paw }, { d: ell(15 - 4 * lift[1], 6 - 12 * lift[1], 13, 9), fill: paw }]);
	g += `<g transform="translate(0 ${bob.toFixed(2)}) scale(${(2 - sq).toFixed(3)} ${sq.toFixed(3)}) rotate(${tilt.toFixed(2)} 0 -60)">`;
	// torso + belly
	g += shapes([{ d: TORSO, fill: c.fur }]);
	g += `<g transform="translate(${ST.mis[0]} ${ST.mis[1]})"><ellipse cx="0" cy="-24" rx="16" ry="19" fill="${c.light}" opacity="${dark ? 1 : .85}"/></g>`;
	// arms
	const arms = hit || o.arms === 'up' ? [[-46, -92], [46, -94]] : [[-38 + 10 * swing, -24 - 4 * Math.abs(swing)], [38 + 10 * swing, -24 - 4 * Math.abs(swing)]];
	g += limb(`M-22 -52 Q${(arms[0][0] - 22) / 2 - 6} ${(arms[0][1] - 52) / 2} ${arms[0][0]} ${arms[0][1]}`, c.fur, 13) + limb(`M22 -52 Q${(arms[1][0] + 22) / 2 + 6} ${(arms[1][1] - 52) / 2} ${arms[1][0]} ${arms[1][1]}`, c.fur, 13);
	g += shapes([{ d: ell(arms[0][0], arms[0][1], 8.5, 8), fill: paw, lw: .8 }, { d: ell(arms[1][0], arms[1][1], 8.5, 8), fill: paw, lw: .8 }]);
	// bow tie at the neck
	if (o.bow) g += `<g transform="translate(9 -46)">${bow(o.bow)}</g>`;
	// head (with its own small lag on the bob) + ears
	g += `<g transform="translate(0 ${(-bob * 0.25).toFixed(2)})">`;
	const earR = o.mark === 'patch' ? c.dark : o.mark === 'calico' ? c.patch2 : c.fur;
	g += earsAt(-36, 34, -144, { l: c.fur, r: earR }, 1.05);
	g += `<g transform="translate(${ST.mis[0]} ${ST.mis[1]})"><path d="${HEAD}" fill="${c.fur}"/><g clip-path="url(#hhead)">`;
	if (o.mark === 'tabby') g += `<path d="M-14 -150 L-12 -134 M0 -152 L0 -135 M14 -150 L12 -134" stroke="${c.dark}" stroke-width="5.5" stroke-linecap="round"/><path d="M-60 -104 L-48 -102 M-60 -92 L-49 -92 M60 -104 L48 -102 M60 -92 L49 -92" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`;
	if (o.mark === 'patch') g += `<path d="M4 -156 C34 -156 62 -136 62 -108 C44 -104 26 -114 18 -126 C12 -136 6 -146 4 -156Z" fill="${c.dark}"/>`;
	if (o.mark === 'calico') g += `<path d="M-62 -116 C-52 -150 -22 -158 -12 -142 C-18 -128 -38 -118 -62 -110Z" fill="${c.dark}"/><path d="M14 -156 C42 -154 62 -134 62 -114 C46 -116 30 -126 20 -140Z" fill="${c.patch2}"/>`;
	if (dark) g += `<path d="M-30 -60 C-40 -76 -30 -96 -10 -94 C10 -96 22 -80 12 -60 Z" fill="${c.light}"/>`;
	if (ST.gloss) g += `<path d="M-42 -120 C-38 -134 -26 -140 -14 -141" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;
	g += `</g></g><path d="${HEAD}" fill="none" stroke="${ST.line}" stroke-width="${ST.lw}" stroke-linejoin="round"/>`;
	if (ST.sketch) g += `<path d="${HEAD}" fill="none" stroke="${ST.line}" stroke-width="${ST.lw * .45}" opacity=".35" transform="translate(1.6 -1.2) rotate(.6)"/>`;
	g += `<g transform="translate(9 -60)">${face(o.face || 'happy', c, dark)}</g>`;
	g += `</g></g></g>`;
	// effects
	if (hit) { const p = o.pop ?? 1; g += `<g opacity="${Math.min(1, p * 1.5).toFixed(3)}" transform="translate(0 -84) scale(${((0.75 + 0.25 * p) * 0.8).toFixed(3)})">${burst(o.word, o.wordCol)}</g>`; }
	if (o.face === 'sweat') g += `<path d="M56 -150 C52 -142 50 -136 56 -132 C62 -136 60 -142 56 -150Z" fill="#A8D4F2" stroke="${ST.line}" stroke-width="2"/><path d="M68 -134 C65 -128 64 -124 68 -121 C72 -124 71 -128 68 -134Z" fill="#A8D4F2" stroke="${ST.line}" stroke-width="2"/>`;
	if (o.face === 'sleep') g += `<text x="44" y="-160" font-size="30" font-weight="900" fill="#8AA4D6" font-family="Noto Sans CJK SC, sans-serif">z</text><text x="64" y="-180" font-size="22" font-weight="900" fill="#8AA4D6" font-family="Noto Sans CJK SC, sans-serif">z</text>`;
	return g + `</g>`;
}

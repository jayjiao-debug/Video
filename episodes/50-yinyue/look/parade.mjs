// 「喵喵乐队 · 每只猫都是一个音符」 design ideas: a MitchiriNeko-style parade where lanes = instruments, cats = notes,
// spacing = rhythm, and a fixed play line in the middle = "now".
// Three looks of the same build-up frame (A mochi pastel, B sticker on grid paper, C neon stage) + key frames in look A.
// node parade.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs'; import { pathToFileURL } from 'url';
export const W = 1920, H = 1080, FONT = `font-family="Noto Sans CJK SC, sans-serif"`;

// ------------------------------------------------------------------ looks
const LOOKS = {
	A: { name: '棉花糖 · 粉彩', bg: '#FBF4E2', ink: '#6B4F3F', sw: 3.5, text: '#6B4F3F', sub: '#B39C86',
		fur: { pink: '#F8C3CF', yellow: '#FBE29A', green: '#C9E8B0', blue: '#B9CDF5', lilac: '#D9C6F2', orange: '#F9CF9C', white: '#FFFDF8' },
		blush: '#F29BA8', gold: '#F2C14E', red: '#E87A7A', play: '#F59E6B' },
	B: { name: '贴纸 · 方格本', bg: '#F2F5F7', ink: '#33302E', sw: 4.5, text: '#33302E', sub: '#7C8A94', sticker: true,
		fur: { pink: '#FF9DB4', yellow: '#FFD24D', green: '#8EDB8A', blue: '#7FB2FF', lilac: '#B99BFF', orange: '#FFAE5C', white: '#FFFFFF' },
		blush: '#FF6F8E', gold: '#FFC23A', red: '#F25555', play: '#F25555' },
	C: { name: '夜光舞台 · 霓虹', bg: '#17152E', ink: '#2A2550', sw: 3, text: '#FFFFFF', sub: '#8E88C7', neon: true,
		fur: { pink: '#FF8FB8', yellow: '#FFE066', green: '#7CF2B0', blue: '#79C3FF', lilac: '#C9A2FF', orange: '#FFB36B', white: '#F4F1FF' },
		blush: '#FF5C9A', gold: '#FFD34D', red: '#FF5C7A', play: '#4DF3FF' },
};
export let L = LOOKS.A;
export const setLook = (k) => { L = LOOKS[k]; };

export const ol = (w = L.sw) => `stroke="${L.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// ------------------------------------------------------------------ one cat
// origin = ground between the feet; the cat faces slightly left (the way the parade walks).
// o: { fur, inst, hat, step 0|1, face: happy|hit|sweat|sleep|wow|ouch, alpha, glow, flip }
export function cat(x, y, s, o = {}) {
	const f = L.fur[o.fur || 'yellow'], step = o.step || 0, hit = o.face === 'hit';
	let bob = step ? -5 : 0, sq = hit ? 0.94 : 1;
	let fl = step ? [-24, 0] : [-20, 8], fr = step ? [16, 8] : [20, 2];
	// animated walk: o.ph = steps walked so far (one footfall per beat, landing on whole numbers)
	if (o.ph !== undefined) {
		const k = Math.floor(o.ph), u = o.ph - k, lift = Math.sin(Math.PI * u);
		bob = -8 * lift; sq = 1 - 0.08 * Math.max(0, 1 - u * 6) - (hit ? 0.03 : 0);
		const up = [-6 * lift, -11 * lift];
		fl = k % 2 ? [-20 + up[0], 8 + up[1]] : [-20, 8]; fr = k % 2 ? [20, 8] : [20 + up[0], 8 + up[1]];
	}
	let g = `<g transform="translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})" opacity="${o.alpha ?? 1}" ${o.filter ? `filter="url(#${o.filter})"` : ''}>`;
	// feet (behind the body: only the bottoms show)
	g += `<ellipse cx="${fl[0]}" cy="${fl[1] + 4}" rx="13" ry="8" fill="${f}" ${ol()}/><ellipse cx="${fr[0]}" cy="${fr[1] + 4}" rx="13" ry="8" fill="${f}" ${ol()}/>`;
	g += `<g transform="translate(0 ${bob}) scale(${2 - sq} ${sq})">`;
	// tail
	g += `<path d="M42 -18 C70 -16 80 -40 70 -60" fill="none" stroke="${L.ink}" stroke-width="${16 + 2 * L.sw}" stroke-linecap="round"/><path d="M42 -18 C70 -16 80 -40 70 -60" fill="none" stroke="${f}" stroke-width="16" stroke-linecap="round"/>`;
	// ears
	g += `<path d="M-44 -62 L-38 -106 L-8 -84 Z" fill="${f}" ${ol()}/><path d="M10 -86 L36 -106 L44 -62 Z" fill="${f}" ${ol()}/>`;
	g += `<path d="M-36 -70 L-34 -94 L-18 -82 Z" fill="${L.blush}" opacity=".45"/><path d="M18 -82 L32 -94 L36 -70 Z" fill="${L.blush}" opacity=".45"/>`;
	// bean body (head and body are one blob, MitchiriNeko-style)
	g += `<path d="M-50 -12 C-56 -54 -42 -92 0 -93 C42 -92 56 -54 50 -12 C48 4 30 10 0 10 C-30 10 -48 4 -50 -12 Z" fill="${f}" ${ol()}/>`;
	if (L.neon) g += `<path d="M-38 -60 C-34 -80 -18 -86 -4 -86" fill="none" stroke="#fff" stroke-width="5" opacity=".55" stroke-linecap="round"/>`;
	// hat goes under the face items but over the body
	g += hat(o.hat, f);
	g += face(o.face || 'happy');
	g += inst(o.inst, f);
	g += `</g>`;
	// effects
	if (hit) { const p = o.pop ?? 1; g += `<g opacity="${Math.min(1, p * 1.5).toFixed(3)}" transform="scale(${(0.75 + 0.25 * p).toFixed(3)})">` + burst(o.word, o.wordCol, o.wordSide) + `</g>`; }
	if (o.face === 'sweat') g += `<path d="M44 -96 C40 -88 38 -82 44 -78 C50 -82 48 -88 44 -96Z" fill="#9AD0F5" ${ol(2)}/><path d="M56 -78 C53 -72 52 -68 56 -65 C60 -68 59 -72 56 -78Z" fill="#9AD0F5" ${ol(2)}/>`;
	if (o.face === 'sleep') g += `<text x="34" y="-104" font-size="30" font-weight="900" fill="${L.neon ? '#9DB8FF' : '#8AA4D6'}" ${FONT}>z</text><text x="54" y="-124" font-size="22" font-weight="900" fill="${L.neon ? '#9DB8FF' : '#8AA4D6'}" ${FONT}>z</text>`;
	return g + `</g>`;
}
function face(k) {
	const d = L.neon ? '#2A2550' : L.ink;
	let g = '';
	if (k === 'hit' || k === 'happy2') g += `<path d="M-32 -56 Q-26 -62 -20 -56" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/><path d="M0 -56 Q6 -62 12 -56" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`;
	else if (k === 'sleep') g += `<path d="M-32 -55 Q-26 -50 -20 -55" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/><path d="M0 -55 Q6 -50 12 -55" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`;
	else if (k === 'ouch' || k === 'sweat') g += `<path d="M-32 -60 L-21 -55 L-32 -50" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 -60 L1 -55 L12 -50" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
	else if (k === 'wow') g += `<circle cx="-26" cy="-56" r="6.5" fill="${d}"/><circle cx="6" cy="-56" r="6.5" fill="${d}"/><circle cx="-24" cy="-58" r="2.2" fill="#fff"/><circle cx="8" cy="-58" r="2.2" fill="#fff"/>`;
	else g += `<ellipse cx="-26" cy="-56" rx="4.5" ry="5.5" fill="${d}"/><ellipse cx="6" cy="-56" rx="4.5" ry="5.5" fill="${d}"/>`;
	// mouth
	if (k === 'hit' || k === 'wow') g += `<ellipse cx="-10" cy="-40" rx="6" ry="7" fill="${L.neon ? '#2A2550' : '#8A4B4B'}"/>`;
	else if (k === 'sweat' || k === 'ouch') g += `<path d="M-18 -40 Q-14 -44 -10 -40 Q-6 -36 -2 -40" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round"/>`;
	else g += `<path d="M-17 -45 Q-13.5 -39 -10 -44 Q-6.5 -39 -3 -45" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
	g += `<ellipse cx="-38" cy="-44" rx="8" ry="4.5" fill="${L.blush}" opacity=".6"/><ellipse cx="18" cy="-44" rx="8" ry="4.5" fill="${L.blush}" opacity=".6"/>`;
	return g;
}
const paw = (x, y, f) => `<circle cx="${x}" cy="${y}" r="9" fill="${f}" ${ol()}/>`;
function inst(k, f) {
	const G = L.gold, R = L.red;
	switch (k) {
		case 'snare': return `<rect x="-36" y="-30" width="54" height="24" rx="4" fill="${R}" ${ol()}/><ellipse cx="-9" cy="-30" rx="27" ry="8" fill="#FFFDF5" ${ol()}/>`
			+ `<path d="M-36 -18 L18 -18" stroke="#fff" stroke-width="3" opacity=".7"/>` + `<path d="M-30 -40 L-46 -70" ${ol(4)}/><path d="M12 -40 L26 -72" ${ol(4)}/>` + paw(-30, -40, f) + paw(12, -40, f);
		case 'kick': return `<circle cx="-14" cy="-10" r="26" fill="#FFFDF5" stroke="${R}" stroke-width="8"/><circle cx="-14" cy="-10" r="30" fill="none" ${ol()}/><circle cx="-14" cy="-10" r="22" fill="none" ${ol(2)}/>`
			+ `<path d="M28 -34 L50 -74" ${ol(5)}/><circle cx="52" cy="-78" r="9" fill="#FFFDF5" ${ol()}/>` + paw(28, -32, f);
		case 'trumpet': return `<path d="M-14 -40 L-62 -46" stroke="${G}" stroke-width="7" stroke-linecap="round"/><path d="M-14 -40 L-62 -46" fill="none" stroke="${L.ink}" stroke-width="1.5" opacity=".5"/>`
			+ `<path d="M-60 -50 L-86 -62 L-86 -30 L-60 -42 Z" fill="${G}" ${ol()}/>` + paw(-34, -36, f) + paw(-50, -40, f);
		case 'tuba': return `<circle cx="-10" cy="-14" r="18" fill="none" stroke="${L.ink}" stroke-width="${11 + 2 * L.sw}"/><circle cx="-10" cy="-14" r="18" fill="none" stroke="${G}" stroke-width="11"/>`
			+ `<path d="M8 -26 L36 -96 L66 -84 L24 -20 Z" fill="${G}" ${ol()}/><ellipse cx="51" cy="-90" rx="16" ry="6" fill="#B98A1E" ${ol(2.5)} transform="rotate(22 51 -90)"/>` + paw(-30, -18, f) + paw(14, -20, f);
		case 'cymbal': return `<ellipse cx="-52" cy="-44" rx="9" ry="24" fill="${G}" ${ol()}/><ellipse cx="44" cy="-44" rx="9" ry="24" fill="${G}" ${ol()}/>` + paw(-44, -44, f) + paw(36, -44, f);
		case 'shaker': return `<ellipse cx="-44" cy="-56" rx="10" ry="14" fill="${R}" ${ol()} transform="rotate(-20 -44 -56)"/>` + paw(-38, -44, f);
		case 'flag': return `<path d="M-40 -6 L-40 -150" ${ol(5)}/><path d="M-40 -150 L-92 -132 L-40 -114 Z" fill="${R}" ${ol()}/>` + paw(-40, -40, f);
		case 'guitar': return `<path d="M-12 -30 L-74 -70" ${ol(9)}/><path d="M-12 -30 L-74 -70" stroke="#8A5A3A" stroke-width="5" stroke-linecap="round"/><ellipse cx="-6" cy="-24" rx="24" ry="18" fill="${R}" ${ol()} transform="rotate(-30 -6 -24)"/><circle cx="-8" cy="-26" r="5" fill="${L.ink}"/>` + paw(-52, -56, f) + paw(10, -28, f);
		case 'sax': return `<path d="M-12 -40 L-28 -30 C-30 -10 -28 6 -10 6 C6 6 8 -6 12 -14" fill="none" stroke="${L.ink}" stroke-width="${11 + 2 * L.sw}" stroke-linecap="round" stroke-linejoin="round"/><path d="M-12 -40 L-28 -30 C-30 -10 -28 6 -10 6 C6 6 8 -6 12 -14" fill="none" stroke="${G}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="13" cy="-18" rx="10" ry="5" fill="#B98A1E" ${ol(2.5)}/>` + paw(-32, -16, f) + paw(-6, -2, f);
		case 'keys': return `<rect x="-58" y="-34" width="96" height="22" rx="4" fill="#FFFDF5" ${ol()}/>` + [0, 1, 2, 3, 4, 5].map(i => `<rect x="${-50 + i * 14}" y="-34" width="7" height="12" fill="${L.ink}"/>`).join('') + paw(-30, -36, f) + paw(14, -36, f);
		case 'clap': return paw(-20, -46, f) + paw(-4, -50, f);
		default: return '';
	}
}
function hat(k, f) {
	switch (k) {
		case 'shako': return `<path d="M-30 -86 L-26 -122 L18 -122 L22 -86 Z" fill="${L.red}" ${ol()}/><rect x="-30" y="-94" width="52" height="8" fill="${L.gold}" ${ol(2)}/><path d="M-4 -122 C-10 -138 -2 -150 6 -146 C4 -138 4 -130 -4 -122Z" fill="#FFFDF5" ${ol(2.5)}/>`;
		case 'fez': return `<path d="M-26 -86 L-20 -120 L14 -120 L20 -86 Z" fill="#D9473F" ${ol()}/><path d="M-3 -120 C-6 -110 -14 -104 -18 -92" fill="none" stroke="${L.ink}" stroke-width="3"/><circle cx="-18" cy="-90" r="5" fill="${L.ink}"/>`;
		case 'rasta': return `<path d="M-40 -80 C-40 -124 36 -124 36 -80 Z" fill="#E5534B" ${ol()}/><path d="M-36 -96 C-20 -102 16 -102 32 -96" fill="none" stroke="#F7C948" stroke-width="7"/><path d="M-30 -108 C-12 -114 8 -114 26 -108" fill="none" stroke="#4CAF6A" stroke-width="7"/><path d="M-40 -80 C-40 -124 36 -124 36 -80 Z" fill="none" ${ol()}/>`;
		case 'fedora': return `<ellipse cx="-4" cy="-88" rx="44" ry="9" fill="#3D3550" ${ol()}/><path d="M-26 -90 C-26 -122 18 -122 18 -90 Z" fill="#3D3550" ${ol()}/><rect x="-26" y="-98" width="44" height="7" fill="${L.gold}"/>`;
		case 'mohawk': return `<path d="M-22 -90 L-26 -122 L-12 -104 L-8 -134 L2 -104 L10 -128 L14 -92" fill="#E5534B" ${ol()}/><rect x="-38" y="-64" width="24" height="13" rx="4" fill="${L.ink}"/><rect x="-6" y="-64" width="24" height="13" rx="4" fill="${L.ink}"/><path d="M-14 -58 L-6 -58" ${ol(3)}/>`;
		case 'phones': return `<path d="M-50 -56 C-54 -120 50 -120 46 -56" fill="none" stroke="${L.ink}" stroke-width="${8 + 2 * L.sw}"/><path d="M-50 -56 C-54 -120 50 -120 46 -56" fill="none" stroke="#5A5F7A" stroke-width="8"/><rect x="-60" y="-70" width="18" height="28" rx="8" fill="#FF5C9A" ${ol()}/><rect x="40" y="-70" width="18" height="28" rx="8" fill="#4DD8FF" ${ol()}/>`;
		case 'kufi': return `<path d="M-32 -84 C-32 -116 26 -116 26 -84 Z" fill="#F2A33A" ${ol()}/><path d="M-26 -94 L-14 -104 L-2 -94 L10 -104 L20 -94" fill="none" stroke="#2F7A4F" stroke-width="4"/>`;
		case 'party': return `<path d="M-18 -88 L-4 -136 L10 -88 Z" fill="#B99BFF" ${ol()}/><circle cx="-4" cy="-138" r="6" fill="${L.gold}" ${ol(2)}/>`;
		default: return '';
	}
}
export function burst(word, col, side) {
	let g = '';
	const c = col || L.play;
	for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.36, r0 = 112, r1 = 136; g += `<path d="M${Math.cos(a) * r0} ${Math.sin(a) * r0 - 30} L${Math.cos(a) * r1} ${Math.sin(a) * r1 - 30}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`; }
	if (word) g += `<text x="${side ? 58 : 0}" y="${side ? -112 : -150}" text-anchor="${side ? 'start' : 'middle'}" font-size="${side ? 42 : 46}" font-weight="900" fill="${c}" stroke="${L.neon ? '#17152E' : '#FFFDF8'}" stroke-width="8" paint-order="stroke" ${FONT}>${word}</text>`;
	return g;
}

// ------------------------------------------------------------------ shared defs (filters) and helpers
export function defs() {
	return `<defs>
	<filter id="sticker" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/>
		<feGaussianBlur in="d" stdDeviation="5" result="b"/><feOffset in="b" dx="4" dy="7" result="o"/><feFlood flood-color="#2a3640" flood-opacity=".22"/><feComposite in2="o" operator="in" result="sh"/>
		<feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
	<filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
	<filter id="softglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b"/><feFlood flood-color="#8F7BFF" flood-opacity=".55"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
	<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#C9D8E4" stroke-width="1.5"/></pattern>
	<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#221D44"/><stop offset="1" stop-color="#110F22"/></linearGradient>
	</defs>`;
}
const catFilter = (hit) => L.sticker ? 'sticker' : L.neon ? (hit ? 'glow' : 'softglow') : null;
export function background() {
	if (L.sticker) return `<rect width="${W}" height="${H}" fill="${L.bg}"/><rect width="${W}" height="${H}" fill="url(#grid)"/>`;
	if (L.neon) { let s = `<rect width="${W}" height="${H}" fill="url(#night)"/>`; for (let i = 0; i < 60; i++) { const x = (i * 337) % W, y = (i * 191) % 260; s += `<circle cx="${x}" cy="${y}" r="${1 + (i % 3)}" fill="#fff" opacity="${.15 + (i % 4) * .1}"/>`; } return s; }
	return `<rect width="${W}" height="${H}" fill="${L.bg}"/>`;
}
export const T = (x, y, size, txt, o = {}) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${o.w || 800}" fill="${o.fill || L.text}" text-anchor="${o.anchor || 'start'}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 8}" paint-order="stroke"` : ''} ${FONT}>${txt}</text>`;
export function bpmBadge(x, y, bpm) {
	const fill = L.neon ? '#221D44' : '#FFFDF8';
	return `<g transform="translate(${x} ${y})"><circle r="74" fill="${fill}" stroke="${L.neon ? L.play : L.ink}" stroke-width="5" ${L.neon ? 'filter="url(#glow)"' : ''}/>` + T(0, 14, 50, bpm, { anchor: 'middle', fill: L.neon ? '#fff' : L.red, w: 900 }) + T(0, 46, 22, 'BPM', { anchor: 'middle', fill: L.sub }) + `</g>`;
}
export function subtitle(txt, y = 1036) {
	return T(W / 2, y, 50, txt, { anchor: 'middle', fill: L.neon ? '#fff' : L.ink, stroke: L.neon ? '#17152E' : L.bg, sw: 12, w: 800 });
}
export function laneChip(x, y, col, name) {
	const fill = L.neon ? '#221D44' : '#FFFDF8';
	return `<g transform="translate(${x} ${y})"><rect x="0" y="-30" width="150" height="60" rx="30" fill="${fill}" stroke="${L.neon ? col : L.ink}" stroke-width="3.5"/><circle cx="30" cy="0" r="16" fill="${col}" ${L.neon ? '' : ol(3)}/>` + T(58, 12, 30, name, { fill: L.neon ? '#fff' : L.ink }) + `</g>`;
}

// ------------------------------------------------------------------ the build-up frame (used for the three looks)
// 16 steps per bar. PH = play line x; SP = px per 16th. The step under the play line is step 4 (beat 2).
const PH = 720, SP = 80, NOW = 4;
const LANES = [
	{ key: 'mel', name: '旋律', fur: 'lilac', inst: 'trumpet', steps: [0, 3, 4, 6, 10, 12, 14], word: '叭', s: 0.92 },
	{ key: 'hat', name: '镲', fur: 'green', inst: 'cymbal', steps: [0, 2, 4, 6, 8, 10, 12, 14], word: '次', s: 0.62 },
	{ key: 'snare', name: '军鼓', fur: 'yellow', inst: 'snare', hat: 'shako', steps: [4, 12], word: '啪', s: 0.92 },
	{ key: 'bass', name: '贝斯', fur: 'blue', inst: 'tuba', steps: [0, 3, 6, 8, 11, 14], word: '嘟', s: 0.92 },
	{ key: 'kick', name: '底鼓', fur: 'pink', inst: 'kick', hat: 'shako', steps: [0, 8, 11], word: '咚', s: 0.92 },
];
const LANE_Y = [318, 474, 630, 786, 942];
function buildFrame(lookKey, opts = {}) {
	L = LOOKS[lookKey];
	let s = defs() + background();
	// header
	s += T(64, 92, 56, '第 2 拍', { w: 900 }) + T(270, 92, 40, '五只乐队猫，一条“现在”线', { fill: L.sub, w: 700 });
	s += T(64, 140, 28, `设计 ${lookKey} · ${L.name}`, { fill: L.sub, w: 600 });
	s += bpmBadge(1800, 110, 100);
	// beat numbers above the lanes
	for (let b = -1; b < 5; b++) {
		const n = b * 4, x = PH + (n - NOW) * SP; if (x < 250 || x > 1880) continue;
		const cur = n === NOW; const lbl = ((b % 4) + 4) % 4 + 1; if (cur) continue;
		s += T(x, 200, cur ? 48 : 34, lbl, { anchor: 'middle', fill: cur ? L.play : L.sub, w: 900 });
	}
	// lanes
	LANES.forEach((ln, i) => {
		const y = LANE_Y[i], col = L.fur[ln.fur];
		if (L.sticker) s += `<rect x="236" y="${y - 22}" width="1660" height="34" fill="${col}" opacity=".45" transform="rotate(${(i % 2 ? .25 : -.2)} 1060 ${y})"/>`;
		else if (L.neon) s += `<rect x="236" y="${y - 136}" width="1664" height="150" rx="22" fill="#1E1A3D" stroke="${col}" stroke-opacity=".35" stroke-width="2"/>`;
		else s += `<path d="M240 ${y + 14} L1890 ${y + 14}" stroke="${L.ink}" stroke-opacity=".22" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`;
		// faint step ticks on the beat
		for (let n = -6; n < 16; n++) { const x = PH + n * SP; if (x < 250 || x > 1890) continue; if ((n + NOW) % 4 === 0) s += `<circle cx="${x}" cy="${y + 14}" r="${L.neon ? 4 : 5}" fill="${L.neon ? col : L.ink}" opacity="${L.neon ? .6 : .25}"/>`; }
	});
	// play line
	if (L.neon) s += `<rect x="${PH - 3}" y="236" width="6" height="740" fill="${L.play}" filter="url(#glow)"/>`;
	else if (L.sticker) s += `<path d="M${PH} 236 C${PH + 4} 500 ${PH - 4} 700 ${PH + 2} 976" stroke="${L.play}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>`;
	else s += `<rect x="${PH - 46}" y="236" width="92" height="740" rx="46" fill="${L.play}" opacity=".16"/><path d="M${PH} 236 L${PH} 976" stroke="${L.play}" stroke-width="4" stroke-dasharray="3 10" stroke-linecap="round"/>`;
	s += `<path d="M${PH - 16} 228 L${PH + 16} 228 L${PH} 248 Z" fill="${L.play}"/>`;
	// cats, back lane first so bursts sit on top of the lane above
	const hits = [];
	LANES.forEach((ln, i) => {
		const y = LANE_Y[i];
		for (let k = -1; k <= 1; k++) for (const st of ln.steps) {
			const n = st + 16 * k, rel = n - NOW, x = PH + rel * SP;
			if (x < 280 || x > 1880) continue;
			const hit = rel === 0, past = rel < 0;
			const o = { fur: ln.fur, inst: ln.inst, hat: ln.hat, step: (n & 2) ? 1 : 0, face: hit ? 'hit' : 'happy', alpha: past ? (L.neon ? .45 : .5) : 1, filter: catFilter(hit), word: ln.word, wordSide: true, wordCol: L.neon ? L.fur[ln.fur] : null };
			if (hit) hits.push([x, y, ln.s, o]); else s += cat(x, y, ln.s, o);
		}
	});
	for (const [x, y, sc, o] of hits) s += cat(x, y, sc, o);
	// lane chips last so they sit over the cats leaving the screen
	LANES.forEach((ln, i) => { s += laneChip(40, LANE_Y[i] - 40, L.fur[ln.fur], ln.name); });
	s += subtitle('过了线的猫，就是刚刚响过的音', 1046);
	return s;
}

// ------------------------------------------------------------------ key frames (look A)
function kfHook() {
	L = LOOKS.A;
	let s = defs() + background();
	// footprints = beats already played, each with its 咚
	const y = 640;
	s += `<path d="M900 ${y + 26} L1800 ${y + 26}" stroke="${L.ink}" stroke-opacity=".18" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`;
	for (let i = 1; i <= 5; i++) {
		const x = 760 + i * 190;
		s += `<g opacity="${1 - (i - 1) * .18}"><ellipse cx="${x}" cy="${y + 26}" rx="18" ry="10" fill="${L.ink}" opacity=".25"/>` + T(x, y + 84, 36, '咚', { anchor: 'middle', fill: L.red, w: 900 }) + `</g>`;
	}
	s += cat(760, y + 20, 1.9, { fur: 'yellow', step: 1, face: 'hit', word: '咚', wordCol: L.red });
	// heartbeat line top right
	let p = 'M1180 250'; const pts = [[1300, 250], [1325, 200], [1350, 300], [1372, 230], [1392, 250], [1560, 250], [1585, 200], [1610, 300], [1632, 230], [1652, 250], [1780, 250]];
	for (const [a, b] of pts) p += ` L${a} ${b}`;
	s += `<path d="${p}" fill="none" stroke="${L.red}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
	s += `<path d="M1460 160 C1460 140 1490 136 1496 156 C1502 136 1532 140 1532 160 C1532 184 1496 200 1496 210 C1496 200 1460 184 1460 160Z" fill="${L.red}" ${ol(3)}/>`;
	s += T(1520, 360, 34, '♥ 约 72 BPM', { anchor: 'middle', fill: L.sub, w: 700 });
	s += T(80, 120, 60, '一只猫，一步，一拍', { w: 900 });
	s += T(80, 182, 32, '0:00 开场 · 空白的画面里只有心跳和脚步', { fill: L.sub, w: 600 });
	s += subtitle('你身体里，本来就有一个节拍器');
	return s;
}
function kfBPM() {
	L = LOOKS.A;
	let s = defs() + background();
	s += T(80, 110, 60, 'BPM = 一分钟走几步', { w: 900 });
	s += T(80, 170, 32, '同一段路，节奏越快，猫越挤', { fill: L.sub, w: 600 });
	const rows = [{ bpm: 60, n: 4, fur: 'blue', face: 'sleep', y: 420 }, { bpm: 120, n: 8, fur: 'yellow', face: 'happy', y: 670 }, { bpm: 180, n: 12, fur: 'pink', face: 'sweat', y: 920 }];
	for (const r of rows) {
		s += `<path d="M330 ${r.y + 14} L1860 ${r.y + 14}" stroke="${L.ink}" stroke-opacity=".22" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`;
		s += bpmBadge(170, r.y - 50, r.bpm);
		const gap = 1440 / r.n;
		for (let i = 0; i < r.n; i++) { const x = 420 + i * gap; s += cat(x, r.y, r.n > 8 ? .78 : .9, { fur: r.fur, step: i % 2, face: i === 0 ? 'hit' : r.face, word: i === 0 ? '咚' : null, wordCol: L.red }); }
	}
	// a clock: one tick = one second
	s += `<g transform="translate(1760 120)"><circle r="56" fill="#FFFDF8" ${ol(5)}/><path d="M0 0 L0 -38" ${ol(6)}/><path d="M0 0 L26 10" ${ol(6)}/>` + T(0, 96, 24, '1 秒 = 60 BPM 的一步', { anchor: 'middle', fill: L.sub, w: 600 }) + `</g>`;
	s += subtitle('60 是散步，120 是进行曲，180 已经在逃命了');
	return s;
}
function kf223() {
	L = LOOKS.A;
	let s = defs() + background();
	s += T(80, 110, 60, '巴尔干 · 7/8 拍', { w: 900 }) + T(560, 110, 40, '七只猫，分成 2 + 2 + 3', { fill: L.sub, w: 700 });
	// seven cats on an even pulse; only the grouping (the accent on each group's first cat) changes
	const y = 600, step = 214, xs = [0, 1, 2, 3, 4, 5, 6].map(i => 318 + i * step);
	const grp = [[0, 1, '2', 'pink'], [2, 3, '2', 'yellow'], [4, 6, '3', 'green']];
	for (const [a, b, n, fur] of grp) {
		const x0 = xs[a] - 96, x1 = xs[b] + 96, col = L.fur[fur];
		s += `<rect x="${x0 + 4}" y="${y - 250}" width="${x1 - x0 - 8}" height="290" rx="40" fill="${col}" opacity=".3"/>`;
		s += `<path d="M${x0 + 14} ${y + 116} L${x0 + 14} ${y + 138} L${x1 - 14} ${y + 138} L${x1 - 14} ${y + 116}" fill="none" ${ol(5)}/>`;
		s += T((x0 + x1) / 2, y + 236, 100, n, { anchor: 'middle', fill: L.red, w: 900 });
	}
	s += T((xs[1] + xs[2]) / 2, y + 226, 70, '+', { anchor: 'middle', fill: L.sub, w: 900 }) + T((xs[3] + xs[4]) / 2, y + 226, 70, '+', { anchor: 'middle', fill: L.sub, w: 900 });
	// counts under each cat: 1 2 | 1 2 | 1 2 3, the group's first beat is the strong one
	const cnt = ['1', '2', '1', '2', '1', '2', '3'];
	xs.forEach((x, i) => {
		const first = i === 0 || i === 2 || i === 4;
		const fur = i < 2 ? 'pink' : i < 4 ? 'yellow' : 'green';
		const inst = ['kick', 'trumpet', 'kick', 'trumpet', 'kick', 'trumpet', 'trumpet'][i];
		const face = i === 0 ? 'hit' : i === 6 ? 'sweat' : 'happy';
		s += cat(x, y, first ? 1.22 : 1.05, { fur, inst, hat: 'fez', step: i % 2, face, word: i === 0 ? '嘭' : null, wordCol: L.red });
		s += T(x, y + 92, first ? 56 : 42, cnt[i], { anchor: 'middle', fill: first ? L.red : L.sub, w: 900 });
	});
	s += T(xs[6] + 60, y - 150, 30, '呼…', { fill: L.sub, w: 700 });
	s += subtitle('嘭恰 · 嘭恰 · 嘭恰恰：一样的步子，只是最后一组多一步');
	return s;
}
function kfDrop() {
	L = LOOKS.A;
	let s = defs() + background();
	// MitchiriNeko crowd: packed rows, bigger at the front
	const furs = ['pink', 'yellow', 'green', 'blue', 'lilac', 'orange'];
	const insts = ['kick', 'snare', 'trumpet', 'tuba', 'cymbal', 'guitar', 'sax', 'keys', null];
	const hats = ['phones', 'phones', 'party', null, 'mohawk', 'fedora', 'rasta', 'fez', 'kufi', 'shako'];
	let k = 0;
	const rows = [[300, .62, 112], [430, .72, 126], [580, .84, 142], [750, .98, 160], [940, 1.15, 186], [1140, 1.35, 216]];
	rows.forEach(([y, sc, gap], r) => {
		for (let x = (r % 2) * gap / 2 - 30; x < W + 60; x += gap) {
			k++;
			const face = ['hit', 'happy', 'wow', 'happy2', 'hit', 'happy'][(k * 7) % 6];
			s += cat(x + ((k * 37) % 23) - 11, y + ((k * 13) % 17) - 8, sc, { fur: furs[(k * 5) % 6], inst: insts[(k * 3) % insts.length], hat: hats[(k * 7) % hats.length], step: k % 2, face });
		}
	});
	// cats flying out of the pile
	s += cat(300, 230, .9, { fur: 'orange', hat: 'phones', face: 'wow', step: 1 }) + cat(1640, 200, .85, { fur: 'lilac', hat: 'party', face: 'hit', step: 0 }) + cat(1080, 150, .7, { fur: 'green', face: 'wow', step: 1 });
	s += `<g transform="rotate(-6 960 170)">` + T(960, 200, 170, 'DROP!', { anchor: 'middle', fill: L.red, stroke: '#FFFDF8', sw: 22, w: 900 }) + `</g>`;
	s += `<rect x="440" y="972" width="1040" height="88" rx="44" fill="#FFFDF8" ${ol(4)}/>`;
	s += subtitle('电子 · 128 BPM：鼓越叠越密，屏幕挤爆', 1034);
	return s;
}
function kfSwing() {
	L = LOOKS.A;
	let s = defs() + background();
	s += T(80, 110, 60, '爵士 · 摇摆', { w: 900 }) + T(440, 110, 40, '不是一样长，而是 长—短', { fill: L.sub, w: 700 });
	s += bpmBadge(1800, 110, 150);
	// straight row vs swing row
	const yA = 440, yB = 820;
	s += T(80, yA - 170, 34, '平的（直八分）', { fill: L.sub, w: 700 }) + T(80, yB - 170, 34, '摇摆（长短长短）', { fill: L.sub, w: 700 });
	for (let i = 0; i < 8; i++) {
		const xa = 260 + i * 200; s += cat(xa, yA, .9, { fur: 'blue', step: i % 2, face: 'happy', hat: 'fedora' });
		const xb = 260 + Math.floor(i / 2) * 400 + (i % 2 ? 267 : 0); s += cat(xb, yB, .9, { fur: 'orange', inst: i % 2 ? null : 'sax', step: i % 2, face: i % 2 ? 'happy2' : 'happy', hat: 'fedora' });
		if (i % 2 === 0) s += `<path d="M${xb} ${yB + 40} L${xb + 267} ${yB + 40}" ${ol(5)} stroke-dasharray="1 0"/><path d="M${xb + 267} ${yB + 40} L${xb + 400} ${yB + 40}" stroke="${L.red}" stroke-width="5" stroke-linecap="round"/>`
			+ T(xb + 133, yB + 86, 34, '长', { anchor: 'middle', fill: L.ink, w: 900 }) + T(xb + 333, yB + 86, 34, '短', { anchor: 'middle', fill: L.red, w: 900 });
	}
	s += subtitle('一拍分三份，猫只踩第 1 和第 3 份');
	return s;
}

// ------------------------------------------------------------------ render
const FRAMES = {
	look_A_mochi: () => buildFrame('A'), look_B_sticker: () => buildFrame('B'), look_C_neon: () => buildFrame('C'),
	kf1_hook: kfHook, kf2_bpm: kfBPM, kf3_swing: kfSwing, kf4_223: kf223, kf5_drop: kfDrop,
};
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[3] ? process.argv[3].split(',') : Object.keys(FRAMES);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const name of only) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${FRAMES[name]()}</svg>`;
	await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
	await page.waitForTimeout(100); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log(name);
}
await browser.close();
}

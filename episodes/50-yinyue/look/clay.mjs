// 软萌3D cat band (owner picked the clay look 2026-10-26). Cats with real variety (breeds, coats, ears, eyes, body shapes),
// and a different SET per genre. node clay.mjs <outdir>  → K0 character sheet, K1 rock, K2 jazz, K3 hip-hop
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const W = 1920, H = 1080, SANS = `font-family="Noto Sans CJK SC, sans-serif"`;

// ---------- gradients registry (clay shading) ----------
let G = {};
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (c) => Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k))));
	return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map((v) => v.toString(16).padStart(2, '0')).join(''); };
const g = (hex, kind = 'r') => { const id = `g${kind}${hex.slice(1)}`; if (!G[id]) G[id] = kind === 'r'
	? `<radialGradient id="${id}" cx=".36" cy=".28" r=".9"><stop offset="0" stop-color="${shade(hex, .45)}"/><stop offset=".5" stop-color="${hex}"/><stop offset="1" stop-color="${shade(hex, -.32)}"/></radialGradient>`
	: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(hex, .3)}"/><stop offset="1" stop-color="${shade(hex, -.25)}"/></linearGradient>`; return `url(#${id})`; };
let CID = 0;

// ---------- the cat ----------
// b: { fur, belly, pat: none|stripes|patches|points|tux, patCol, ears: up|fold|big, iris, w, h, fluff, muzzle }
function cat(b, { x, y, s = .8, eyes = 'open', hat = '', glasses = '', collar = '', front = '', arms = '', back = '' }) {
	const id = `c${CID++}`, bw = b.w || 1, bh = b.h || 1, pc = b.patCol || '#3a3440';
	let o = `<g transform="translate(${x} ${y}) scale(${s})">`;
	o += `<ellipse cx="0" cy="166" rx="${175 * bw}" ry="22" fill="#5a3f70" opacity=".2" filter="url(#blur)"/>` + back;
	// tail
	const tc = b.pat === 'points' ? pc : b.pat === 'tux' ? b.fur : b.fur;
	o += `<path d="M${110 * bw} 120 C${200 * bw} 120 ${215 * bw} 40 ${178 * bw} 6" fill="none" stroke="${shade(tc, -.12)}" stroke-width="${b.fluff ? 40 : 26}" stroke-linecap="round"/><path d="M${112 * bw} 112 C${190 * bw} 110 ${205 * bw} 46 ${174 * bw} 14" fill="none" stroke="${shade(tc, .25)}" stroke-width="8" stroke-linecap="round" opacity=".6"/>`;
	if (b.pat === 'stripes') o += `<path d="M${168 * bw} 50 l26 -6 M${190 * bw} 90 l24 6" stroke="${pc}" stroke-width="10" stroke-linecap="round"/>`;
	// body
	const body = `M${-120 * bw} 60 C${-140 * bw} ${-10 * bh} ${-100 * bw} ${-80 * bh} 0 ${-80 * bh} C${100 * bw} ${-80 * bh} ${140 * bw} ${-10 * bh} ${120 * bw} 60 C${120 * bw} 130 ${70 * bw} 160 0 160 C${-70 * bw} 160 ${-120 * bw} 130 ${-120 * bw} 60Z`;
	o += `<clipPath id="${id}b"><path d="${body}"/></clipPath><path d="${body}" fill="${g(b.fur)}"/>`;
	o += `<g clip-path="url(#${id}b)">`;
	if (b.pat === 'stripes') for (const yy of [-30, 20, 70]) o += `<path d="M${-130 * bw} ${yy} Q${-80 * bw} ${yy - 22} ${-40 * bw} ${yy + 4} M${130 * bw} ${yy} Q${80 * bw} ${yy - 22} ${40 * bw} ${yy + 4}" fill="none" stroke="${pc}" stroke-width="16" stroke-linecap="round" opacity=".85"/>`;
	if (b.pat === 'patches') o += `<ellipse cx="${-80 * bw}" cy="20" rx="70" ry="60" fill="${g(pc)}"/><ellipse cx="${90 * bw}" cy="110" rx="60" ry="50" fill="${g(b.patCol2 || '#2f2a33')}"/>`;
	if (b.pat === 'points') o += `<rect x="-200" y="100" width="400" height="80" fill="${g(pc)}" opacity=".7"/>`;
	o += `</g>`;
	o += `<ellipse cx="0" cy="${80}" rx="${(b.pat === 'tux' ? 76 : 62) * bw}" ry="${b.pat === 'tux' ? 74 : 56}" fill="${g(b.belly || '#FFF6EA')}"/>`;
	o += collar;
	// head
	o += `<g transform="translate(0 -190)">`;
	const ear = (sx) => b.ears === 'fold' ? `<path d="M${sx * 70} -112 C${sx * 96} -150 ${sx * 140} -140 ${sx * 132} -96 C${sx * 120} -80 ${sx * 96} -86 ${sx * 70} -112Z" fill="${g(b.pat === 'points' ? pc : b.fur)}"/>`
		: (() => { const big = b.ears === 'big' ? 1.25 : 1; return `<path d="M${sx * 120} -30 L${sx * 138 * big} ${-150 * big} L${sx * 48} -96Z" fill="${g(b.pat === 'points' ? pc : b.earCol || b.fur)}"/><path d="M${sx * 112} -56 L${sx * 122 * big} ${-124 * big} L${sx * 74} -94Z" fill="${g('#FFB7A8')}"/>`; })();
	o += ear(-1) + ear(1);
	const hw = 152 * (b.headW || 1), hh = 128 * (b.headH || 1);
	o += `<clipPath id="${id}h"><ellipse rx="${hw}" ry="${hh}"/></clipPath><ellipse rx="${hw}" ry="${hh}" fill="${g(b.fur)}"/><g clip-path="url(#${id}h)">`;
	if (b.pat === 'stripes') o += `<path d="M-30 -126 L-22 -80 M0 -130 L0 -76 M30 -126 L22 -80" stroke="${pc}" stroke-width="13" stroke-linecap="round"/><path d="M-152 -10 l40 6 M-152 24 l36 0 M152 -10 l-40 6 M152 24 l-36 0" stroke="${pc}" stroke-width="10" stroke-linecap="round"/>`;
	if (b.pat === 'patches') o += `<ellipse cx="-90" cy="-60" rx="90" ry="80" fill="${g(pc)}"/><ellipse cx="100" cy="-90" rx="70" ry="60" fill="${g(b.patCol2 || '#2f2a33')}"/>`;
	if (b.pat === 'points') o += `<ellipse cx="0" cy="34" rx="78" ry="64" fill="${g(pc)}" opacity=".85"/>`;
	if (b.pat === 'tux') o += `<path d="M0 -60 L-60 20 C-80 80 80 80 60 20Z" fill="${g('#FFF6EA')}"/>`;
	o += `</g>`;
	if (b.fluff) for (const sx of [-1, 1]) o += `<path d="M${sx * 138} 10 l${sx * 34} 8 l${-sx * 20} 12 l${sx * 30} 14 l${-sx * 30} 8 l${sx * 16} 18 l${-sx * 40} -20Z" fill="${g(b.fur)}"/>`;
	if (b.muzzle) o += `<ellipse cx="-22" cy="40" rx="30" ry="22" fill="${g('#FFF6EA')}"/><ellipse cx="22" cy="40" rx="30" ry="22" fill="${g('#FFF6EA')}"/>`;
	const ir = b.iris || '#3a2a3a', ey = -6, ex = 62 * (b.eyeSpread || 1), er = b.eyeR || 18;
	if (eyes === 'open') for (const sx of [-1, 1]) o += `<circle cx="${sx * ex}" cy="${ey}" r="${er}" fill="#2a2433"/>${b.iris ? `<circle cx="${sx * ex}" cy="${ey}" r="${er * .82}" fill="${ir}"/><ellipse cx="${sx * ex}" cy="${ey}" rx="${er * .28}" ry="${er * .7}" fill="#1e1a24"/>` : ''}<circle cx="${sx * ex - er * .3}" cy="${ey - er * .35}" r="${er * .32}" fill="#fff"/><circle cx="${sx * ex + er * .35}" cy="${ey + er * .3}" r="${er * .14}" fill="#fff" opacity=".8"/>`;
	else o += `<path d="M-84 -18 L-56 -4 L-84 10 M84 -18 L56 -4 L84 10" fill="none" stroke="#2a2433" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
	o += `<ellipse cx="-92" cy="36" rx="26" ry="15" fill="#FF8FA3" opacity=".55"/><ellipse cx="92" cy="36" rx="26" ry="15" fill="#FF8FA3" opacity=".55"/>`;
	o += `<path d="M-9 22 L9 22 L0 32Z" fill="${b.nose || '#E77F92'}"/><path d="M-24 42 Q-12 56 0 42 Q12 56 24 42" fill="none" stroke="#2a2433" stroke-width="5" stroke-linecap="round"/>`;
	o += `<path d="M-136 16 L-188 8 M-136 32 L-184 40 M136 16 L188 8 M136 32 L184 40" stroke="${b.whisk || '#ffffff'}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
	o += glasses + hat + `</g>`;
	o += front + (typeof arms === 'function' ? arms(b) : arms);
	return o + `</g>`;
}
// arms + paws (paws white for tux / points dark)
const ARMS = (pose, extra = '') => (b) => { let o = ''; const fc = b.pat === 'points' ? b.patCol : b.fur, pc = b.pat === 'tux' ? '#FFF6EA' : fc;
	for (const [sx, hx, hy] of pose) { o += `<path d="M${sx} -40 Q${sx + Math.sign(sx) * 50} ${(hy - 40) / 2} ${hx} ${hy}" fill="none" stroke="${shade(fc, -.08)}" stroke-width="34" stroke-linecap="round"/><path d="M${sx - Math.sign(sx) * 6} -46 Q${sx + Math.sign(sx) * 40} ${(hy - 50) / 2} ${hx - 6} ${hy - 8}" fill="none" stroke="${shade(fc, .3)}" stroke-width="8" stroke-linecap="round" opacity=".5"/>
		<ellipse cx="${hx}" cy="${hy}" rx="26" ry="24" fill="${g(pc)}"/>`; }
	return o + extra; };
const STICKS = (lx, ly, rx, ry) => [[lx, ly, -1], [rx, ry, 1]].map(([x, y, d]) => `<path d="M${x} ${y} L${x + d * 50} ${y - 150}" stroke="${shade('#C98A4B', -.2)}" stroke-width="12" stroke-linecap="round"/><path d="M${x - 2} ${y - 4} L${x + d * 50 - 2} ${y - 150}" stroke="#F0C48E" stroke-width="4" stroke-linecap="round"/>`).join('');

// ---------- breeds ----------
const BREEDS = {
	tabby: { name: '橘猫', fur: '#F6A345', pat: 'stripes', patCol: '#D9782A', iris: '#7BB662', w: 1.08, headW: 1.04 },
	black: { name: '黑猫', fur: '#3a3545', belly: '#4a4458', iris: '#F2C14E', eyeR: 21, nose: '#8a6f86', whisk: '#d8d3e0', w: .92, headH: 1.02, ears: 'big' },
	white: { name: '白长毛', fur: '#FFF8F2', belly: '#FFFFFF', iris: '#6EA8F0', fluff: true, w: 1.12, h: 1.04, eyeR: 19, whisk: '#d9cfc6' },
	calico: { name: '三花', fur: '#FFF6EA', pat: 'patches', patCol: '#F2A04B', patCol2: '#3a3440', iris: '#9BC46A', whisk: '#c9bdb0' },
	siamese: { name: '暹罗', fur: '#F6E7D2', pat: 'points', patCol: '#6b4f43', iris: '#4FA3E8', w: .9, headW: .96, eyeSpread: 1.05, whisk: '#fff' },
	grey: { name: '英短蓝猫', fur: '#9AA5B8', belly: '#B8C1D0', iris: '#E8A640', w: 1.2, h: 1.06, headW: 1.12, headH: 1.06, ears: 'fold', muzzle: false, eyeR: 22 },
	tux: { name: '奶牛', fur: '#2f2c38', pat: 'tux', iris: '#9BC46A', whisk: '#e5e0ea', ears: 'up' },
	fold: { name: '折耳', fur: '#E9C9A0', pat: 'stripes', patCol: '#C99A6A', ears: 'fold', iris: '#C9853A', headW: 1.08, w: 1.05, eyeR: 21 },
};

// ---------- outfits & props (clay) ----------
const SHADES = (c = '#2a2433') => `<path d="M-112 -30 h88 a10 10 0 0 1 10 10 v16 a26 26 0 0 1 -26 26 h-46 a26 26 0 0 1 -26 -26 v-16 a10 10 0 0 1 10 -10Z M24 -30 h88 a10 10 0 0 1 10 10 v16 a26 26 0 0 1 -26 26 h-46 a26 26 0 0 1 -26 -26 v-16 a10 10 0 0 1 10 -10Z" fill="${g(c)}"/><path d="M-14 -22 L14 -22" stroke="${c}" stroke-width="7"/><path d="M-96 -20 l22 0 M40 -20 l22 0" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
const ROUNDG = () => `<circle cx="-62" cy="-6" r="36" fill="#fff" opacity=".18" stroke="#3a2a22" stroke-width="7"/><circle cx="62" cy="-6" r="36" fill="#fff" opacity=".18" stroke="#3a2a22" stroke-width="7"/><path d="M-26 -8 Q0 -20 26 -8" fill="none" stroke="#3a2a22" stroke-width="6"/>`;
const STARG = () => { const st = (cx) => `M${cx} -46 L${cx + 12} -16 L${cx + 44} -16 L${cx + 18} 4 L${cx + 28} 34 L${cx} 16 L${cx - 28} 34 L${cx - 18} 4 L${cx - 44} -16 L${cx - 12} -16Z`; return `<path d="${st(-62)} ${st(62)}" fill="${g('#FF6FA8')}"/>`; };
const HEADBAND = (c = '#E8585E') => `<path d="M-148 -62 Q0 -98 148 -62 L152 -36 Q0 -72 -152 -36Z" fill="${g(c)}"/><path d="M138 -52 L190 -72 L180 -30Z" fill="${g(c)}"/>`;
const BEANIE = (c = '#5B8DEF') => `<path d="M-150 -40 C-150 -175 150 -175 150 -40Z" fill="${g(c)}"/><rect x="-158" y="-58" width="316" height="40" rx="18" fill="${g(shade(c, -.1))}"/><circle cx="0" cy="-166" r="26" fill="${g(shade(c, .2))}"/>`;
const BERET = (c = '#C8433A') => `<ellipse cx="-10" cy="-108" rx="150" ry="42" fill="${g(c)}" transform="rotate(-10 -10 -108)"/><circle cx="-10" cy="-150" r="10" fill="${g(c)}"/>`;
const FEDORA = (c = '#3a3545') => `<ellipse cx="0" cy="-92" rx="190" ry="34" fill="${g(c)}"/><path d="M-110 -96 C-110 -190 110 -190 110 -96Z" fill="${g(c)}"/><rect x="-110" y="-118" width="220" height="22" fill="${g('#C8433A')}"/>`;
const CAPBACK = (c = '#F2B33D') => `<path d="M-140 -60 C-140 -170 140 -170 140 -60Z" fill="${g(c)}"/><path d="M60 -150 C120 -190 200 -170 210 -140 C170 -150 120 -140 90 -120Z" fill="${g(shade(c, -.15))}"/><circle cx="0" cy="-158" r="10" fill="${g(shade(c, -.2))}"/>`;
const BUCKET = (c = '#8BD3C7') => `<path d="M-120 -70 C-120 -170 120 -170 120 -70Z" fill="${g(c)}"/><ellipse cx="0" cy="-66" rx="176" ry="34" fill="${g(shade(c, -.08))}"/>`;
const HEADPHONES = (c = '#E8585E') => `<path d="M-150 -20 C-150 -190 150 -190 150 -20" fill="none" stroke="${shade(c, -.2)}" stroke-width="18"/><ellipse cx="-150" cy="0" rx="34" ry="46" fill="${g(c)}"/><ellipse cx="150" cy="0" rx="34" ry="46" fill="${g(c)}"/>`;
const JACKET = () => `<path d="M-120 60 C-140 -10 -100 -80 -30 -80 L0 40 L30 -80 C100 -80 140 -10 120 60 C120 120 90 150 60 156 L-60 156 C-90 150 -120 120 -120 60Z" fill="${g('#3d3747')}"/><path d="M-30 -80 L-6 -20 L-60 -40Z M30 -80 L6 -20 L60 -40Z" fill="${g('#4d4758')}"/><circle cx="-70" cy="40" r="6" fill="#d8dde6"/><circle cx="-70" cy="80" r="6" fill="#d8dde6"/>`;
const BOWTIE = (c = '#C8433A') => `<path d="M-48 -82 L-6 -66 L-48 -50Z M48 -82 L6 -66 L48 -50Z" fill="${g(c)}"/><circle cx="0" cy="-66" r="10" fill="${g(shade(c, -.1))}"/>`;
const SCARF = (c = '#FF6FA8') => `<path d="M-90 -78 Q0 -36 90 -78 L80 -46 Q0 -10 -80 -46Z M40 -50 L70 40 L30 36 L18 -44Z" fill="${g(c)}"/>`;
const CHAIN = () => `<path d="M-70 -70 Q0 20 70 -70" fill="none" stroke="#E2B43C" stroke-width="12" stroke-dasharray="14 6" stroke-linecap="round"/><circle cx="0" cy="-12" r="22" fill="${g('#F2C14E')}"/><text y="-4" text-anchor="middle" ${SANS} font-size="24" font-weight="900" fill="#8a6316">$</text>`;
const HOODIE = (c = '#B79CF0') => `<path d="M-124 60 C-144 -14 -104 -84 0 -84 C104 -84 144 -14 124 60 C124 130 74 160 0 160 C-74 160 -124 130 -124 60Z" fill="${g(c)}"/><path d="M-60 -84 Q0 -40 60 -84" fill="none" stroke="${shade(c, -.25)}" stroke-width="10"/><path d="M-20 -50 L-24 10 M20 -50 L24 10" stroke="#fff" stroke-width="5"/><rect x="-60" y="80" width="120" height="50" rx="20" fill="${g(shade(c, -.08))}"/>`;
const EGUITAR = (c = '#E8585E') => `<g transform="translate(-10 70) rotate(-28)"><path d="M-120 -10 C-160 -60 -80 -96 -40 -60 C-10 -90 50 -70 40 -30 C80 -10 70 60 20 60 C-20 90 -110 70 -120 -10Z" fill="${g(c)}"/><rect x="-10" y="-10" width="250" height="24" rx="6" fill="${g('#C98A4B', 'l')}"/><path d="M236 -24 L300 -30 L300 30 L236 22Z" fill="${g('#3a3545')}"/><rect x="-70" y="-14" width="16" height="34" rx="4" fill="#3a3545"/></g>`;
const BASSG = (c = '#5B8DEF') => `<g transform="translate(-10 80) rotate(-36)"><path d="M-130 -10 C-170 -70 -80 -100 -40 -60 C-10 -86 40 -70 34 -30 C74 -10 64 66 14 66 C-26 96 -120 74 -130 -10Z" fill="${g(c)}"/><rect x="-10" y="-9" width="330" height="20" rx="6" fill="${g('#C98A4B', 'l')}"/><path d="M316 -20 L370 -26 L370 26 L316 18Z" fill="${g('#3a3545')}"/></g>`;
const KIT = (c = '#E8585E') => `<g transform="translate(0 70)"><circle r="112" fill="${g(c)}"/><circle r="84" fill="${g('#FFFFFF')}"/><text y="22" text-anchor="middle" ${SANS} font-size="56" font-weight="900" fill="${c}">咚</text></g><g transform="translate(160 -30)"><rect x="-4" y="0" width="8" height="190" fill="${g('#C9CED6', 'l')}"/><ellipse cx="0" cy="0" rx="84" ry="14" fill="${g('#F2C14E')}"/></g>`;
const MIC = () => `<rect x="66" y="-40" width="8" height="210" fill="${g('#C9CED6', 'l')}"/><ellipse cx="70" cy="172" rx="40" ry="10" fill="${g('#3a3545')}"/><ellipse cx="70" cy="-66" rx="22" ry="30" fill="${g('#3a3545')}"/>`;
const SAX = () => `<g transform="translate(10 40) rotate(12)"><path d="M-10 -150 L10 -150 L20 60 C24 110 80 120 92 70 L84 40 L120 40 L118 80 C110 170 -10 170 -14 70Z" fill="${g('#E9B949')}"/>${[0, 1, 2, 3].map((i) => `<circle cx="10" cy="${-90 + i * 36}" r="9" fill="${g('#FFF2C8')}"/>`).join('')}<ellipse cx="102" cy="40" rx="22" ry="10" fill="#7a5410"/></g>`;
const UPRIGHT = () => `<g transform="translate(-150 50) rotate(-12)"><path d="M-70 -90 C-110 -60 -100 0 -70 20 C-120 60 -100 160 0 170 C100 160 120 60 70 20 C100 0 110 -60 70 -90 C40 -110 -40 -110 -70 -90Z" fill="${g('#B5652B')}"/><rect x="-10" y="-360" width="20" height="280" rx="8" fill="${g('#3a3545', 'l')}"/><path d="M-26 20 h52 M-26 40 h52" stroke="#3a2416" stroke-width="5"/><path d="M-30 -10 Q-40 0 -30 10 M30 -10 Q40 0 30 10" stroke="#3a2416" stroke-width="5" fill="none"/></g>`;
const PIANO = () => `<g transform="translate(0 40)"><rect x="-190" y="-120" width="380" height="250" rx="26" fill="${g('#3a3545')}"/><rect x="-170" y="-10" width="340" height="44" rx="8" fill="${g('#FFFFFF')}"/>${[...Array(9).keys()].map((i) => `<rect x="${-150 + i * 36}" y="-10" width="16" height="26" rx="3" fill="#2a2433"/>`).join('')}<rect x="-120" y="-160" width="80" height="50" rx="6" fill="${g('#FFF6EA')}"/></g>`;
const JAZZKIT = () => `<g transform="translate(0 80)"><ellipse rx="100" ry="96" fill="${g('#2F6F8F')}"/><ellipse rx="74" ry="72" fill="${g('#FFF6EA')}"/></g><g transform="translate(-150 -20)"><rect x="-4" y="0" width="8" height="190" fill="${g('#C9CED6', 'l')}"/><ellipse rx="80" ry="12" fill="${g('#E9B949')}"/></g>`;
const DECKS = () => `<g transform="translate(0 70)"><rect x="-230" y="-40" width="460" height="130" rx="30" fill="${g('#3a3545')}"/><ellipse cx="-110" cy="-34" rx="90" ry="26" fill="${g('#1e1a24')}"/><ellipse cx="-110" cy="-34" rx="30" ry="9" fill="${g('#E8585E')}"/><ellipse cx="110" cy="-34" rx="90" ry="26" fill="${g('#1e1a24')}"/><ellipse cx="110" cy="-34" rx="30" ry="9" fill="${g('#8BD3C7')}"/></g>`;
const PADS = () => `<g transform="translate(0 70)"><rect x="-150" y="-60" width="300" height="150" rx="26" fill="${g('#E9E2F5')}"/>${[0, 1, 2, 3].flatMap((c) => [0, 1].map((r) => `<rect x="${-126 + c * 64}" y="${-40 + r * 62}" width="52" height="50" rx="12" fill="${g(['#FF8FA3', '#8BD3C7', '#F2C14E', '#B79CF0'][c])}"/>`)).join('')}</g>`;
const MIC_HAND = () => `<g transform="translate(-118 -30) rotate(-20)"><ellipse cx="0" cy="-40" rx="22" ry="28" fill="${g('#3a3545')}"/><rect x="-9" y="-16" width="18" height="70" rx="8" fill="${g('#C9CED6', 'l')}"/></g>`;

// ---------- sets ----------
const SET = {
	rock: () => { let s = `<rect width="${W}" height="${H}" fill="${g('#3B2466', 'l')}"/>`;
		for (const [x, c] of [[300, '#FF6FA8'], [760, '#8BD3C7'], [1160, '#F2C14E'], [1620, '#B79CF0']]) s += `<path d="M${x - 40} -20 L${x + 40} -20 L${x + 230} 860 L${x - 230} 860Z" fill="${c}" opacity=".16" filter="url(#blur)"/>`;
		for (const x of [90, 1690]) s += `<rect x="${x}" y="380" width="140" height="460" rx="22" fill="${g('#2a2433')}"/>${[0, 1, 2].map((i) => `<circle cx="${x + 70}" cy="${470 + i * 140}" r="52" fill="${g('#46405a')}"/><circle cx="${x + 70}" cy="${470 + i * 140}" r="16" fill="${g('#2a2433')}"/>`).join('')}`;
		s += `<rect y="840" width="${W}" height="240" fill="${g('#2a1d48', 'l')}"/><ellipse cx="960" cy="842" rx="1000" ry="20" fill="#B79CF0" opacity=".35"/>`;
		for (let i = 0; i < 18; i++) s += `<circle cx="${60 + i * 110}" cy="${1040 + (i % 2) * 18}" r="58" fill="#1e1530"/>`;
		return s; },
	jazz: () => { let s = `<rect width="${W}" height="${H}" fill="${g('#2E4A5A', 'l')}"/>`;
		for (let r = 0; r < 9; r++) for (let c = 0; c < 14; c++) s += `<rect x="${c * 150 - (r % 2) * 75}" y="${r * 72 + 10}" width="138" height="60" rx="14" fill="${g(r % 3 ? '#3C5D6E' : '#40636F')}" opacity=".55"/>`;
		for (const x of [380, 960, 1540]) s += `<line x1="${x}" y1="0" x2="${x}" y2="170" stroke="#1d2f38" stroke-width="3"/><circle cx="${x}" cy="196" r="30" fill="${g('#FFD98A')}"/><circle cx="${x}" cy="196" r="140" fill="#FFD98A" opacity=".18" filter="url(#blur)"/>`;
		s += `<rect x="1770" y="320" width="18" height="520" fill="${g('#2a2433', 'l')}"/><path d="M1700 330 L1860 330 L1820 240 L1740 240Z" fill="${g('#F2C14E')}"/>`;
		s += `<rect y="840" width="${W}" height="240" fill="${g('#7A4A2A', 'l')}"/>`;
		for (let i = 0; i < 12; i++) s += `<line x1="${i * 170}" y1="840" x2="${i * 170 - 60}" y2="1080" stroke="#5e3820" stroke-width="4"/>`;
		s += `<ellipse cx="960" cy="845" rx="1000" ry="16" fill="#FFD98A" opacity=".25"/>`;
		return s; },
	hiphop: () => { let s = `<rect width="${W}" height="${H}" fill="${g('#FFB38A', 'l')}"/><circle cx="1500" cy="260" r="120" fill="${g('#FFE38A')}"/>`;
		s += `<rect x="0" y="300" width="${W}" height="560" fill="${g('#9C8FC7', 'l')}"/>`;
		for (let r = 0; r < 7; r++) for (let c = 0; c < 13; c++) s += `<rect x="${c * 152 - (r % 2) * 76}" y="${306 + r * 80}" width="144" height="72" rx="10" fill="#8A7DB8" opacity=".5"/>`;
		// graffiti: soft blobby letters
		s += `<g transform="translate(250 420) rotate(-6)"><text ${SANS} font-size="230" font-weight="900" fill="${g('#FF6FA8')}" stroke="#fff" stroke-width="10" paint-order="stroke">YO!</text></g>`;
		s += `<g transform="translate(1180 470) rotate(5)"><text ${SANS} font-size="150" font-weight="900" fill="${g('#8BD3C7')}" stroke="#fff" stroke-width="8" paint-order="stroke">嘻哈</text></g>`;
		s += `<rect y="840" width="${W}" height="240" fill="${g('#6E6A80', 'l')}"/><rect y="840" width="${W}" height="14" fill="#a9a5bd"/>`;
		s += `<g transform="translate(1760 790)"><path d="M-40 60 L0 -70 L40 60Z" fill="${g('#FF8A3D')}"/><rect x="-26" y="-10" width="52" height="16" fill="#fff"/><rect x="-56" y="56" width="112" height="16" rx="6" fill="${g('#E06A20')}"/></g>`;
		s += `<g transform="translate(110 760)"><rect x="-70" y="0" width="190" height="96" rx="20" fill="${g('#3a3545')}"/><circle cx="-14" cy="48" r="30" fill="${g('#8BD3C7')}"/><circle cx="66" cy="48" r="30" fill="${g('#8BD3C7')}"/><path d="M-50 0 Q25 -50 100 0" fill="none" stroke="#3a3545" stroke-width="10"/></g>`;
		return s; },
};
const TITLE = (zh, en, col = '#fff') => `<text x="120" y="140" ${SANS} font-size="68" font-weight="900" fill="${col}">${zh} <tspan font-size="40" font-weight="700" opacity=".7">${en}</tspan></text>`;
const XS = [330, 750, 1170, 1590], Y = 700;

const FR = {
	K0: () => { let s = `<rect width="${W}" height="${H}" fill="${g('#EFE6FF', 'l')}"/>`;
		Object.values(BREEDS).forEach((b, i) => { const x = 240 + (i % 4) * 480, y = 400 + Math.floor(i / 4) * 470;
			s += cat(b, { x, y, s: .66, arms: ARMS([[-95, -110, 60], [95, 110, 60]]) });
			s += `<text x="${x}" y="${y + 160}" text-anchor="middle" ${SANS} font-size="36" font-weight="900" fill="#4a3a6a">${b.name}</text>`; });
		s += `<text x="120" y="90" ${SANS} font-size="44" font-weight="900" fill="#4a3a6a">小猫乐队 · 角色表</text>`;
		return s; },
	K1: () => SET.rock() + cat(BREEDS.tabby, { x: XS[0], y: Y, eyes: 'squeeze', hat: HEADBAND(), glasses: SHADES(), front: KIT(), arms: ARMS([[-95, -150, -70], [95, 150, -70]], STICKS(-150, -70, 150, -70)) })
		+ cat(BREEDS.black, { x: XS[1], y: Y, collar: JACKET(), glasses: SHADES('#1e1a24'), front: EGUITAR(), arms: ARMS([[-95, -130, 20], [95, 90, 70]]) })
		+ cat(BREEDS.grey, { x: XS[2], y: Y, hat: BEANIE(), front: BASSG(), arms: ARMS([[-95, -140, 40], [95, 100, 80]]) })
		+ cat(BREEDS.calico, { x: XS[3], y: Y, eyes: 'squeeze', collar: SCARF(), glasses: STARG(), front: MIC(), arms: ARMS([[-95, -110, 60], [95, 60, -60]]) })
		+ TITLE('摇滚', 'ROCK'),
	K2: () => SET.jazz() + cat(BREEDS.siamese, { x: XS[0], y: Y, hat: BERET(), front: JAZZKIT(), arms: ARMS([[-95, -150, -10], [95, 120, 40]], STICKS(-150, -10, 120, 40)) })
		+ cat(BREEDS.tux, { x: XS[1], y: Y, eyes: 'squeeze', collar: BOWTIE(), front: SAX(), arms: ARMS([[-95, -10, -40], [95, 40, 60]]) })
		+ cat(BREEDS.white, { x: XS[2], y: Y, glasses: ROUNDG(), front: UPRIGHT(), arms: ARMS([[-95, -170, -110], [95, -120, 70]]) })
		+ cat(BREEDS.fold, { x: XS[3], y: Y, hat: FEDORA(), front: PIANO(), arms: ARMS([[-95, -80, 50], [95, 80, 50]]) })
		+ TITLE('爵士', 'JAZZ', '#FFE9B8'),
	K3: () => SET.hiphop() + cat(BREEDS.black, { x: XS[0], y: Y, hat: CAPBACK(), glasses: HEADPHONES(), front: DECKS(), arms: ARMS([[-95, -120, 80], [95, 120, 70]]) })
		+ cat(BREEDS.tabby, { x: XS[1], y: Y, eyes: 'squeeze', hat: BUCKET(), collar: CHAIN(), front: '', arms: ARMS([[-95, -118, -30], [95, 140, 40]], MIC_HAND()) })
		+ cat(BREEDS.siamese, { x: XS[2], y: Y, collar: HOODIE(), glasses: SHADES(), front: PADS(), arms: ARMS([[-95, -60, 80], [95, 70, 80]]) })
		+ cat(BREEDS.calico, { x: XS[3], y: Y, hat: CAPBACK('#8BD3C7'), glasses: STARG(), collar: CHAIN(), arms: ARMS([[-95, -170, -120], [95, 170, -120]]) })
		+ TITLE('嘻哈', 'HIP-HOP', '#3a3545'),
};
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries(FR)) {
	G = {}; CID = 0; const body = fn();
	await page.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>${Object.values(G).join('')}</defs>${body}</svg></body></html>`);
	await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();

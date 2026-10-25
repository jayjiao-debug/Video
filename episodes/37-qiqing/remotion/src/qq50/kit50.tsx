import React from 'react';
import {Img} from 'remotion';
import {useStampFonts, KAI, YEAR, SAFE_X, SAFE_Y, SEAL_SRC} from '../qq44/skin44';
import {Figure4, Pose, Look4} from '../qq44/figure44';
import {grounded, walkPose, jointAt} from '../qq47/pose47';
/* ep50 style round: the shared engine layer for the three looks (拓 / 漆 / 铸).
   Shared: layout-D subtitles (top-left, 65 px 黑体 900, rows stack), the two-line stamp (top-right), the era+year counter
   (bottom-left), the red J seal (bottom-right), the prop geometry and the walker rig. Each look only re-skins these. */
export {KAI, YEAR, SAFE_X, SAFE_Y};
export const W = 1920, H = 1080, FPS = 30;
export const SANS = "'Noto Sans CJK SC',sans-serif", SERIF = "'Noto Serif CJK SC',serif";
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const ease = (u: number) => u * u * (3 - 2 * u);
export const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const eout = (u: number) => 1 - Math.pow(1 - u, 3);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** damped overshoot 0→1 (a stamp landing) */
export const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));

/* ---------- theme for the furniture ---------- */
export type Theme = {ink: string; key: string; halo: string; pool?: string; poolA?: number; rule: string; dim: number};

/* ---------- subtitles, layout D ---------- */
export type Row = {s: string; n?: number};
const Marked: React.FC<{s: string; n: number; th: Theme}> = ({s, n, th}) => {
	let left = n; const parts = s.split(/(\[[^\]]+\])/).filter(Boolean);
	return <>{parts.map((p, i) => { const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		if (!key) return <span key={i}>{vis}<span style={{opacity: 0}}>{hid}</span></span>;
		return <span key={i} style={{position: 'relative', display: 'inline-block'}}>
			{vis && <span style={{position: 'absolute', left: '0.05em', width: `calc(${(100 * vis.length) / txt.length}% - 0.1em)`, bottom: '0.1em', height: '0.13em', borderRadius: '0.06em', background: th.key}} />}
			<span style={{position: 'relative'}}>{vis}</span><span style={{opacity: 0}}>{hid}</span></span>; })}</>;
};
export const Subs: React.FC<{rows: Row[]; th: Theme}> = ({rows, th}) => {
	const len = Math.max(...rows.map((r) => r.s.replace(/[[\]]/g, '').length)), tw = 65 * len * 1.03, th2 = 97 * rows.length;
	const rx = tw / 2 + 300, ry = th2 / 2 + 190, cx = 150 + tw / 2, cy = 132 + th2 / 2, a = th.poolA ?? 0.34;
	const c = (k: number) => th.pool ? th.pool.replace('A', (a * k).toFixed(3)) : 'transparent';
	return <>
		{th.pool && <div style={{position: 'absolute', left: cx - rx, top: cy - ry, width: 2 * rx, height: 2 * ry, background: `radial-gradient(closest-side, ${c(1)} 0%, ${c(0.93)} 40%, ${c(0.6)} 64%, ${c(0.25)} 84%, ${c(0)} 100%)`}} />}
		<div style={{position: 'absolute', left: 150, top: 132, fontFamily: SANS, fontWeight: 900, fontSize: 65, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap', color: th.ink, textShadow: th.halo}}>
			{rows.map((r, i) => <div key={i}><Marked s={r.s} n={r.n ?? 1e9} th={th} /></div>)}</div>
	</>;
};
/** typed reveal: n characters of s visible at time t, typing from a to a + dur */
export const typed = (s: string, t: number, a: number, dur = 0.45) => Math.ceil(s.replace(/[[\]]/g, '').length * seg(t, a, a + dur));

/* ---------- stamp (top-right, two lines) and counter (bottom-left) ---------- */
export const Stamp: React.FC<{y: string; place: string; note: string; th: Theme; o?: number}> = ({y, place, note, th, o = 1}) => {
	useStampFonts(`${y}${place}${note}·—`);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${th.rule}`, opacity: o, color: th.ink, textShadow: th.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 48}}>{y}</span>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: th.rule}}>·</span>
			<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 27, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.06em', opacity: th.dim}}>{note}</div>
	</div>;
};
/** era name in the 文楷 face, year in Cormorant figures, so an era-only counter never looks like a missing number */
export const Counter: React.FC<{era?: string; year?: string; th: Theme}> = ({era, year, th}) => {
	useStampFonts(`${era ?? ''}${year ?? ''}约前`);
	return <div style={{position: 'absolute', left: SAFE_X + 30, bottom: SAFE_Y + 4, display: 'flex', alignItems: 'baseline', gap: 14, color: th.ink, textShadow: th.halo, whiteSpace: 'nowrap'}}>
		{era && <span style={{fontFamily: KAI, fontWeight: 700, fontSize: 34, letterSpacing: '0.12em', opacity: 0.9}}>{era}</span>}
		{year && <span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 54, lineHeight: 1}}>{year}</span>}
	</div>;
};
export const Seal: React.FC<{o?: number}> = ({o = 0.92}) => <Img src={SEAL_SRC} style={{position: 'absolute', right: SAFE_X, bottom: SAFE_Y - 6, width: 74, height: 74, opacity: o, transform: 'rotate(-6deg)'}} />;

/* ---------- the four characters: browser text, split into components by clip polygons (em units, measured on
   Noto Serif CJK SC Black: em box top = baseline − 0.88 em) ---------- */
export const GLYPH_FONT = SERIF;
type Poly = [number, number][];
export const COMP: Record<string, Poly> = {
	财: [[-0.1, -0.1], [0.486, -0.1], [0.486, 1.1], [-0.1, 1.1]],
	货: [[-0.1, 0.428], [1.1, 0.428], [1.1, 1.1], [-0.1, 1.1]],
	贵: [[-0.1, 0.44], [1.1, 0.44], [1.1, 1.1], [-0.1, 1.1]],
	钱: [[-0.1, -0.1], [0.41, -0.1], [0.41, 0.52], [0.485, 0.52], [0.485, 0.69], [0.22, 0.975], [-0.1, 0.975]],
};
/** the component's centre (em) — where a lifted 贝 / the 钅 sits */
export const COMP_C: Record<string, [number, number]> = {财: [0.25, 0.5], 货: [0.5, 0.72], 贵: [0.5, 0.74], 钱: [0.22, 0.5]};
const polyD = (p: Poly, s: number) => 'M' + p.map(([x, y]) => `${(x * s).toFixed(1)},${(y * s).toFixed(1)}`).join('L') + 'Z';
const OUTER = (s: number) => `M${-0.2 * s},${-0.2 * s}H${1.3 * s}V${1.3 * s}H${-0.2 * s}Z`;
/** one character; part = 'all' | 'comp' (the 贝 or 钅) | 'rest'. (x, y) = top-left of the em box. */
export const Glyph: React.FC<{ch: string; x: number; y: number; s: number; part?: 'all' | 'comp' | 'rest'; id: string; fill?: string; stroke?: string; sw?: number; filter?: string; font?: string; weight?: number; style?: React.CSSProperties}> =
	({ch, x, y, s, part = 'all', id, fill = '#000', stroke, sw = 0, filter, font = GLYPH_FONT, weight = 900, style}) => {
		const cid = `gc-${id}-${part}`;
		return <g transform={`translate(${x},${y})`} filter={filter}>
			{part !== 'all' && <defs><clipPath id={cid}><path d={part === 'comp' ? polyD(COMP[ch], s) : OUTER(s) + polyD(COMP[ch], s)} clipRule="evenodd" /></clipPath></defs>}
			<g clipPath={part !== 'all' ? `url(#${cid})` : undefined}>
				<text x={0} y={0.88 * s} fontFamily={font} fontWeight={weight} fontSize={s} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" style={style}>{ch}</text></g>
		</g>;
	};

/* ---------- prop geometry (style-free; every look fills/lines it its own way) ---------- */
/** cowrie seen from the aperture side, centred, length L, pointing along +x */
export const cowrie = (L: number) => { const a = L / 2, b = L * 0.34;
	const body = `M${-a},0 C${-a},${-b * 1.05} ${a * 0.2},${-b * 1.12} ${a},${-b * 0.12} Q${a * 1.04},0 ${a},${b * 0.12} C${a * 0.2},${b * 1.12} ${-a},${b * 1.05} ${-a},0 Z`;
	const slit = `M${-a * 0.82},${b * 0.06} C${-a * 0.3},${-b * 0.14} ${a * 0.3},${-b * 0.14} ${a * 0.86},${b * 0.02} C${a * 0.3},${b * 0.02} ${-a * 0.3},${b * 0.1} ${-a * 0.82},${b * 0.06} Z`;
	const teeth: string[] = []; for (let i = 0; i < 11; i++) { const u = -0.7 + 1.45 * i / 10, x = u * a, y0 = -b * 0.1 * (1 - u * u * 0.6); teeth.push(`M${x.toFixed(1)},${(y0 - b * 0.2).toFixed(1)} L${x.toFixed(1)},${(y0 - b * 0.02).toFixed(1)}`, `M${(x + a * 0.06).toFixed(1)},${(y0 + b * 0.16).toFixed(1)} L${(x + a * 0.06).toFixed(1)},${(y0 + b * 0.32).toFixed(1)}`); }
	return {body, slit, teeth: teeth.join(' ')};
};
/** hollow-handle spade coin (空首布), height Hh, centred; socket on top keeps the handle hole */
export const bubi = (Hh: number) => { const k = Hh / 2;
	const P = (x: number, y: number) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`;
	const body = `M${P(-0.11, -1)} L${P(0.11, -1)} L${P(0.13, -0.5)} Q${P(0.2, -0.44)} ${P(0.36, -0.42)} L${P(0.44, 0.62)} L${P(0.52, 0.98)} L${P(0.2, 0.98)} Q${P(0.06, 0.72)} ${P(0, 0.7)} Q${P(-0.06, 0.72)} ${P(-0.2, 0.98)} L${P(-0.52, 0.98)} L${P(-0.44, 0.62)} L${P(-0.36, -0.42)} Q${P(-0.2, -0.44)} ${P(-0.13, -0.5)} Z`;
	const hole = `M${P(-0.085, -0.985)} L${P(0.085, -0.985)} L${P(0.09, -0.9)} L${P(-0.09, -0.9)} Z`;
	const nail = `M${P(0, -0.8)} L${P(0.05, -0.68)} L${P(-0.05, -0.68)} Z`;
	const ribs = `M${P(0, -0.5)} L${P(0, 0.62)} M${P(-0.2, -0.36)} L${P(-0.3, 0.6)} M${P(0.2, -0.36)} L${P(0.3, 0.6)}`;
	return {body, hole, nail, ribs};
};
/** farm spade (铫/钱): a blade of the same family as the coin + a long wooden handle; blade height Hb, handle length Lh */
export const spade = (Hb: number, Lh: number) => { const k = Hb / 2, P = (x: number, y: number) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`;
	const blade = `M${P(-0.16, -1)} L${P(0.16, -1)} L${P(0.18, -0.55)} Q${P(0.3, -0.48)} ${P(0.5, -0.46)} L${P(0.56, 0.7)} Q${P(0.3, 1.02)} ${P(0, 1.02)} Q${P(-0.3, 1.02)} ${P(-0.56, 0.7)} L${P(-0.5, -0.46)} Q${P(-0.3, -0.48)} ${P(-0.18, -0.55)} Z`;
	const handle = `M${P(-0.075, -0.9)} L${(-0.075 * k + 0.06 * k).toFixed(1)},${(-k - Lh).toFixed(1)} L${(0.075 * k + 0.06 * k).toFixed(1)},${(-k - Lh).toFixed(1)} L${P(0.075, -0.9)} Z`;
	return {blade, handle};
};
/** a generic code (NOT a real QR payload): seeded modules + the three finder squares */
export const qrCells = (n: number, seed: number) => { const cells: [number, number][] = [];
	const finder = (i: number, j: number) => (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8);
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!finder(i, j) && rnd(i * 31 + j, seed) > 0.52) cells.push([j, i]);
	return cells; };
export const QR: React.FC<{x: number; y: number; s: number; n?: number; seed?: number; fg: string; bg?: string}> = ({x, y, s, n = 25, seed = 7, fg, bg}) => { const c = s / n;
	const F = (i: number, j: number) => <g key={`${i}-${j}`}><rect x={j * c} y={i * c} width={7 * c} height={7 * c} fill={fg} /><rect x={(j + 1) * c} y={(i + 1) * c} width={5 * c} height={5 * c} fill={bg ?? '#fff'} /><rect x={(j + 2) * c} y={(i + 2) * c} width={3 * c} height={3 * c} fill={fg} /></g>;
	return <g transform={`translate(${x},${y})`}>{bg && <rect x={-c} y={-c} width={s + 2 * c} height={s + 2 * c} fill={bg} />}
		<path d={qrCells(n, seed).map(([j, i]) => `M${(j * c).toFixed(1)},${(i * c).toFixed(1)}h${(c + 0.4).toFixed(1)}v${(c + 0.4).toFixed(1)}h${-(c + 0.4).toFixed(1)}z`).join('')} fill={fg} />
		{F(0, 0)}{F(0, n - 7)}{F(n - 7, 0)}</g>; };
/** the 交子 slip: our own generic design (red frame, black block print, a seal); w × h, top-left at 0,0 */
export const Jiaozi: React.FC<{w: number; h: number; red: string; ink: string; paper: string; id: string}> = ({w, h, red, ink, paper, id}) => {
	const rows = 6, cols = 3;
	return <g>
		<rect width={w} height={h} fill={paper} />
		<rect x={w * 0.06} y={h * 0.05} width={w * 0.88} height={h * 0.9} fill="none" stroke={red} strokeWidth={Math.max(2, w * 0.035)} />
		<rect x={w * 0.1} y={h * 0.08} width={w * 0.8} height={h * 0.84} fill="none" stroke={red} strokeWidth={Math.max(1, w * 0.012)} strokeDasharray={`${w * 0.03} ${w * 0.02}`} />
		<rect x={w * 0.16} y={h * 0.12} width={w * 0.68} height={h * 0.16} fill={ink} />
		{Array.from({length: rows * cols}, (_, i) => { const r = Math.floor(i / cols), c = i % cols; return <rect key={i} x={w * (0.2 + c * 0.22)} y={h * (0.34 + r * 0.07)} width={w * 0.14} height={h * 0.035} fill={ink} opacity={0.85} />; })}
		<rect x={w * 0.52} y={h * 0.7} width={w * 0.28} height={w * 0.28} fill={red} opacity={0.9} />
		<path d={`M${w * 0.56},${h * 0.7 + w * 0.06}h${w * 0.2}M${w * 0.56},${h * 0.7 + w * 0.14}h${w * 0.2}M${w * 0.66},${h * 0.7 + w * 0.04}v${w * 0.2}`} stroke={paper} strokeWidth={Math.max(1, w * 0.02)} />
		<title>{id}</title>
	</g>;
};

/* ---------- the walker (figure44 rig, Song dress) ---------- */
export const SONG: Look4 = {dress: 'robe', head: 'futou', legs: 'trousers'};
/** mid-stride, bent by a heavy string in the near (L) hand, the far (R) hand raised holding the slip */
export const bentWalk = (phase: number, bend: number): Pose => { const w = walkPose(phase), b = grounded({lean: 4 + 12 * bend, neck: 10 * bend, lt: 16, lk: 10 + 14 * bend, rt: -14, rk: 16 + 8 * bend, la: 4, le: 2, ra: 58, re: 52});
	const o: Pose = {}; for (const k of Object.keys(w)) o[k] = [lerp(w[k][0], b[k][0], 0.72), lerp(w[k][1], b[k][1], 0.72)]; return o; };
export {jointAt, walkPose, grounded};
export const Walker: React.FC<{x: number; ground: number; h: number; pose: Pose; col: string; look?: Look4}> = ({x, ground, h, pose, col, look = SONG}) =>
	<Figure4 x={x} ground={ground} h={h} pose={pose} look={look} col={col} />;

/* ---------- Song street geometry: one shopfront (posts, beam, tiled roof with lifted eaves, a blank signboard) ---------- */
export const shop = (x: number, g: number, w: number, h: number) => { const eave = h * 0.16, roofT = g - h - eave * 1.4;
	const roof = `M${x - w * 0.08},${g - h} Q${x + w * 0.1},${g - h - eave * 0.4} ${x + w * 0.22},${roofT} L${x + w * 0.78},${roofT} Q${x + w * 0.9},${g - h - eave * 0.4} ${x + w * 1.08},${g - h - eave * 0.35} Q${x + w * 1.1},${g - h + eave * 0.1} ${x + w * 1.04},${g - h + eave * 0.12} L${x - w * 0.04},${g - h + eave * 0.12} Q${x - w * 0.1},${g - h + eave * 0.1} ${x - w * 0.08},${g - h} Z`;
	const tiles = Array.from({length: 14}, (_, i) => { const xx = x + w * (0.02 + 0.96 * i / 13); return `M${xx},${g - h + eave * 0.05} L${lerp(xx, x + w / 2, 0.22)},${roofT + 4}`; }).join(' ');
	const posts = [0.02, 0.5, 0.98].map((u) => `M${x + w * u - w * 0.025},${g} h${w * 0.05} V${g - h + eave * 0.1} h${-w * 0.05} Z`).join(' ');
	const beam = `M${x - w * 0.02},${g - h * 0.86} h${w * 1.04} v${h * 0.07} h${-w * 1.04} Z`;
	const sign = `M${x + w * 0.3},${g - h * 0.98} h${w * 0.4} v${h * 0.11} h${-w * 0.4} Z`;
	const counter = `M${x + w * 0.04},${g} V${g - h * 0.3} h${w * 0.42} V${g} Z`;
	const shutter = Array.from({length: 6}, (_, i) => `M${x + w * (0.56 + i * 0.065)},${g - h * 0.78} V${g}`).join(' ');
	return {roof, tiles, posts, beam, sign, counter, shutter, roofT};
};

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
/** the red J seal; on dark looks it sits on a small paper disc (disc = the look's light tone) so it keeps its contrast */
export const Seal: React.FC<{o?: number; disc?: string}> = ({o = 0.92, disc}) => <>
	{disc && <div style={{position: 'absolute', right: SAFE_X - 4, bottom: SAFE_Y - 10, width: 82, height: 82, borderRadius: '50%', background: disc, opacity: 0.92, boxShadow: '0 2px 8px rgba(0,0,0,0.45)'}} />}
	<Img src={SEAL_SRC} style={{position: 'absolute', right: SAFE_X, bottom: SAFE_Y - 6, width: 74, height: 74, opacity: o, transform: 'rotate(-6deg)'}} /></>;
/** the iron 贯 under load: from the hand it falls to the street and drags behind him (the weight is on the ground) */
export const stringPath = (hx: number, hy: number, g: number, sway = 0) => { const pts: [number, number][] = [];
	const P0: [number, number] = [hx, hy + 6], P1: [number, number] = [hx - 30 + sway * 8, g - 6], P2: [number, number] = [hx - 230, g - 8];
	for (let i = 0; i <= 30; i++) { const u = i / 30, a = (1 - u) * (1 - u), b2 = 2 * u * (1 - u), c = u * u; pts.push([a * P0[0] + b2 * P1[0] + c * P2[0], a * P0[1] + b2 * P1[1] + c * P2[1]]); }
	return pts; };

/* ---------- the four characters: browser text, split into components by clip polygons (em units, measured on
   Noto Serif CJK SC Black: em box top = baseline − 0.88 em) ---------- */
export const GLYPH_FONT = SERIF;
type Poly = [number, number][];
export const COMP: Record<string, Poly> = {
	财: [[-0.1, -0.1], [0.486, -0.1], [0.486, 1.1], [-0.1, 1.1]],
	货: [[-0.1, 0.428], [1.1, 0.428], [1.1, 1.1], [-0.1, 1.1]],
	贵: [[-0.1, 0.44], [1.1, 0.44], [1.1, 1.1], [-0.1, 1.1]],
	钱: [[-0.1, -0.1], [0.41, -0.1], [0.41, 0.6], [0.49, 0.6], [0.49, 0.69], [0.22, 0.975], [-0.1, 0.975]],   // step at 0.6 (not 0.52): the old box caught the left end of 戋's lower bar
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
export const cowrie = (L: number) => { const a = L / 2, b = L * 0.4;
	const body = `M${-a},${b * 0.05} C${-a},${-b * 1.0} ${a * 0.35},${-b * 1.12} ${a * 0.96},${-b * 0.2} Q${a * 1.04},0 ${a * 0.96},${b * 0.2} C${a * 0.35},${b * 1.0} ${-a},${b * 0.95} ${-a},${b * 0.05} Z`;
	const slit = `M${-a * 0.78},${b * 0.1} C${-a * 0.3},${-b * 0.02} ${a * 0.3},${-b * 0.04} ${a * 0.86},${b * 0.02} C${a * 0.3},${b * 0.1} ${-a * 0.3},${b * 0.16} ${-a * 0.78},${b * 0.1} Z`;
	const teeth: string[] = []; for (let i = 0; i < 9; i++) { const u = -0.6 + 1.3 * i / 8, x = u * a, y0 = b * 0.06 - u * b * 0.04; teeth.push(`M${x.toFixed(1)},${(y0 - b * 0.13).toFixed(1)} L${x.toFixed(1)},${(y0 - b * 0.06).toFixed(1)}`, `M${(x + a * 0.07).toFixed(1)},${(y0 + b * 0.07).toFixed(1)} L${(x + a * 0.07).toFixed(1)},${(y0 + b * 0.14).toFixed(1)}`); }
	return {body, slit, teeth: teeth.join(' ')};
};
/** hollow-handle spade coin (空首布), height Hh, centred; socket on top keeps the handle hole */
export const bubi = (Hh: number) => { const k = Hh / 2;
	const P = (x: number, y: number) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`;
	const body = `M${P(-0.12, -1)} L${P(0.12, -1)} L${P(0.15, -0.46)} Q${P(0.24, -0.4)} ${P(0.42, -0.38)} L${P(0.52, 0.64)} L${P(0.6, 0.98)} L${P(0.24, 0.98)} Q${P(0.08, 0.8)} ${P(0, 0.78)} Q${P(-0.08, 0.8)} ${P(-0.24, 0.98)} L${P(-0.6, 0.98)} L${P(-0.52, 0.64)} L${P(-0.42, -0.38)} Q${P(-0.24, -0.4)} ${P(-0.15, -0.46)} Z`;
	const hole = `M${P(-0.085, -0.985)} L${P(0.085, -0.985)} L${P(0.09, -0.9)} L${P(-0.09, -0.9)} Z`;
	const nail = `M${P(0, -0.8)} L${P(0.05, -0.68)} L${P(-0.05, -0.68)} Z`;
	const ribs = `M${P(0, -0.42)} L${P(0, 0.66)} M${P(-0.22, -0.32)} L${P(-0.34, 0.62)} M${P(0.22, -0.32)} L${P(0.34, 0.62)}`;
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
/** the 交子 note: our own generic design — a tall printed note: red overprint border, a black frame, a small woodblock
    picture (houses, a tree, a figure), vertical text columns, red seals over the black. w × h, top-left at 0,0 */
export const Jiaozi: React.FC<{w: number; h: number; red: string; ink: string; paper: string; id: string}> = ({w, h, red, ink, paper, id}) => {
	const X = (u: number) => u * w, Y = (v: number) => v * h;
	const cols = 5, colBlocks: React.ReactNode[] = [];
	for (let c = 0; c < cols; c++) { let v = 0.43; let i = 0; const x = X(0.2 + c * 0.13);
		while (v < 0.88 - 0.02) { const hh = 0.028 + 0.022 * rnd(c * 17 + i, 5); if (v + hh > 0.88) break;
			colBlocks.push(<rect key={`${c}-${i}`} x={x} y={Y(v)} width={X(0.075)} height={Y(hh)} fill={ink} opacity={0.88} />); v += hh + 0.011; i++; } }
	return <g>
		<rect width={w} height={h} fill={paper} />
		{/* red layer (printed first): border band with a lozenge chain, a faint wave field behind the text */}
		<rect x={X(0.03)} y={Y(0.02)} width={X(0.94)} height={Y(0.96)} fill="none" stroke={red} strokeWidth={X(0.05)} />
		<path d={Array.from({length: 9}, (_, i) => `M${X(0.03)},${Y(0.08 + i * 0.105)} l${X(0.025)},${Y(0.02)} l${-X(0.025)},${Y(0.02)} M${X(0.97)},${Y(0.08 + i * 0.105)} l${-X(0.025)},${Y(0.02)} l${X(0.025)},${Y(0.02)}`).join(' ')} stroke={paper} strokeWidth={Math.max(1, X(0.012))} fill="none" />
		<path d={Array.from({length: 7}, (_, i) => `M${X(0.14)},${Y(0.44 + i * 0.065)} q${X(0.09)},${-Y(0.02)} ${X(0.18)},0 t${X(0.18)},0 t${X(0.18)},0 t${X(0.18)},0`).join(' ')} stroke={red} strokeWidth={Math.max(1, X(0.012))} fill="none" opacity={0.45} />
		{/* black layer: frame, picture panel, text columns */}
		<rect x={X(0.1)} y={Y(0.06)} width={X(0.8)} height={Y(0.88)} fill="none" stroke={ink} strokeWidth={Math.max(1.2, X(0.018))} />
		<rect x={X(0.15)} y={Y(0.1)} width={X(0.7)} height={Y(0.26)} fill="none" stroke={ink} strokeWidth={Math.max(1, X(0.014))} />
		<g fill={ink}>
			<path d={`M${X(0.19)},${Y(0.3)} L${X(0.19)},${Y(0.235)} L${X(0.16)},${Y(0.235)} L${X(0.27)},${Y(0.17)} L${X(0.38)},${Y(0.235)} L${X(0.35)},${Y(0.235)} L${X(0.35)},${Y(0.3)} Z`} />
			<rect x={X(0.24)} y={Y(0.255)} width={X(0.06)} height={Y(0.045)} fill={paper} />
			<path d={`M${X(0.42)},${Y(0.3)} L${X(0.42)},${Y(0.25)} L${X(0.4)},${Y(0.25)} L${X(0.49)},${Y(0.2)} L${X(0.58)},${Y(0.25)} L${X(0.56)},${Y(0.25)} L${X(0.56)},${Y(0.3)} Z`} />
			<circle cx={X(0.7)} cy={Y(0.19)} r={X(0.075)} /><rect x={X(0.69)} y={Y(0.2)} width={X(0.025)} height={Y(0.1)} />
			<circle cx={X(0.79)} cy={Y(0.235)} r={X(0.022)} /><path d={`M${X(0.76)},${Y(0.3)} L${X(0.775)},${Y(0.255)} L${X(0.805)},${Y(0.255)} L${X(0.82)},${Y(0.3)} Z`} />
			<rect x={X(0.15)} y={Y(0.3)} width={X(0.7)} height={Y(0.012)} />
		</g>
		{colBlocks}
		{/* red seals pressed over the black (the 朱墨 overprint) */}
		<g opacity={0.9}><rect x={X(0.5)} y={Y(0.7)} width={X(0.34)} height={X(0.34)} fill={red} />
			<path d={`M${X(0.55)},${Y(0.7) + X(0.08)}h${X(0.24)}M${X(0.55)},${Y(0.7) + X(0.17)}h${X(0.24)}M${X(0.55)},${Y(0.7) + X(0.26)}h${X(0.24)}M${X(0.67)},${Y(0.7) + X(0.05)}v${X(0.24)}`} stroke={paper} strokeWidth={Math.max(1, X(0.022))} />
			<rect x={X(0.18)} y={Y(0.385)} width={X(0.18)} height={X(0.18)} fill={red} />
		</g>
		<title>{id}</title>
	</g>;
};

/* ---------- the walker (figure44 rig, Song dress) ---------- */
export const SONG: Look4 = {dress: 'robe', head: 'futou', legs: 'trousers'};
/** mid-stride, bent by a heavy string in the near (L) hand, the far (R) hand raised holding the slip */
export const bentWalk = (phase: number, bend: number): Pose => { const w = walkPose(phase), b = grounded({lean: 20 * bend, neck: -14, lt: 20, lk: 34 * bend, rt: -12, rk: 36 * bend, la: -30, le: 0, ra: 50, re: 60});
	const o: Pose = {}; for (const k of Object.keys(w)) o[k] = [lerp(w[k][0], b[k][0], 0.88), lerp(w[k][1], b[k][1], 0.88)];
	/* the loaded shoulder drops; the arm hangs straight, angled back toward the load he drags */
	const sh = o.LSh, s2: [number, number] = [sh[0] - 0.01, sh[1] - 0.03 * bend], a = -32 * Math.PI / 180;
	o.LSh = s2; o.LElb = [s2[0] + Math.sin(a) * 0.194, s2[1] - Math.cos(a) * 0.194]; o.LHand = [s2[0] + Math.sin(a) * 0.329, s2[1] - Math.cos(a) * 0.329];
	return o; };
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
/** a strand offset sideways from a polyline, and cross ticks (coin edges) along it */
export const strandD = (pts: [number, number][], off: number) => 'M' + pts.map(([x, y], i) => { const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
	return `${(x - dy / L * off).toFixed(1)},${(y + dx / L * off).toFixed(1)}`; }).join('L');
export const ticksD = (pts: [number, number][], half: number) => pts.slice(1, -1).map(([x, y], i) => { const [ax, ay] = pts[i], [bx, by] = pts[i + 2], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L * half, ny = dx / L * half;
	return `M${(x - nx).toFixed(1)},${(y - ny).toFixed(1)}L${(x + nx).toFixed(1)},${(y + ny).toFixed(1)}`; }).join(' ');
/** small field scene for the motion tests: a ground band with furrows and one tree (style supplies the colours) */
export const furrows = (g: number, n = 12) => Array.from({length: n}, (_, i) => `M${-100 + i * 180},${g + 14} Q${-40 + i * 180},${g + 40} ${-120 + i * 180},${g + 150}`).join(' ');
export const treeD = (x: number, g: number, s: number) => `M${x - 6 * s},${g} L${x - 4 * s},${g - 90 * s} Q${x - 30 * s},${g - 100 * s} ${x - 50 * s},${g - 130 * s} Q${x - 70 * s},${g - 175 * s} ${x - 30 * s},${g - 190 * s} Q${x - 10 * s},${g - 240 * s} ${x + 30 * s},${g - 215 * s} Q${x + 75 * s},${g - 205 * s} ${x + 62 * s},${g - 160 * s} Q${x + 80 * s},${g - 120 * s} ${x + 40 * s},${g - 105 * s} Q${x + 15 * s},${g - 95 * s} ${x + 4 * s},${g - 90 * s} L${x + 6 * s},${g} Z`;

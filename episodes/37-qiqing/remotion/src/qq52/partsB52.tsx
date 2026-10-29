import React from 'react';
import {W, H, SANS, KAI, SAFE_X, SAFE_Y, lerp, rnd, Subs} from '../qq50/kit50';
import {B, thB, Vignette} from '../qq50/styleB';
import {Pose, Look4} from '../qq44/figure44';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {Defs51, Walker51} from '../qq51/props51';
import {cq} from '../qq51/master51';
import {PAL52, EraId52, FLAME, METAL} from './palette52';
import {Defs52} from './props52';
/* ep52 Builder B shared parts (KF08–KF14): the ep51 furniture (layout-D subtitle, two-line stamp, labels, feathered scrim),
   the era frame (時代色 sky + vignette), the walker with the era rim, and B's own props: the T-7M-like sounding rocket, its
   lattice rail, the bicycle pump, the sandbag wall, the faceted ball satellite, the return capsule, floodlight towers.
   The 火箭云 plume, the medium rocket with boosters and the big flame are Builder A's (props52). */
export type P2 = [number, number];
export const mixC = (a: string, b: string, k: number) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); return '#' + [16, 8, 0].map((s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, Math.max(0, Math.min(1, k)))).toString(16).padStart(2, '0')).join(''); };

/* ---------- furniture ---------- */
const rowsOf = (s: string) => cq(s).split('\n').map((r) => ({s: r}));
/** layout-D subtitle, fully typed (key frames show the line after it has typed) */
export const SubB: React.FC<{s: string}> = ({s}) => <Subs rows={rowsOf(s)} th={thB} />;
/** the two-line stamp (master51's StampBox, static) */
export const StampB: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·−>`);
	const num = /^[0-9.]+$/.test(y);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 28, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note}</div>
	</div>; };
export const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; font?: string; w?: number}> = ({x, y, s, fs = 44, col = B.cream, anchor = 'start', o = 1, font = KAI, w = 700}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={w} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={Math.max(5, fs * 0.13)} strokeOpacity={0.85} style={{paintOrder: 'stroke'}}>{s}</text>;
/** a feathered dark scrim (for big numbers and labels on a busy field) */
export const Scrim: React.FC<{id: string; x: number; y: number; rx: number; ry: number; a?: number}> = ({id, x, y, rx, ry, a = 0.6}) => <g>
	<defs><radialGradient id={`scr${id}`}><stop offset="0" stopColor="#0A0604" stopOpacity={a} /><stop offset="0.55" stopColor="#0A0604" stopOpacity={a * 0.8} /><stop offset="0.82" stopColor="#0A0604" stopOpacity={a * 0.3} /><stop offset="1" stopColor="#0A0604" stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#scr${id})`} /></g>;
/** the shared defs: glows and the launch-light gradients */
export const DefsB: React.FC = () => <defs>
	<filter id="b52s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
	<filter id="b52m" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
	<filter id="b52l" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="34" /></filter>
	<radialGradient id="b52glow"><stop offset="0" stopColor={FLAME.hot} stopOpacity="0.9" /><stop offset="0.35" stopColor={FLAME.gold} stopOpacity="0.45" /><stop offset="0.7" stopColor={FLAME.amber} stopOpacity="0.14" /><stop offset="1" stopColor={FLAME.amber} stopOpacity="0" /></radialGradient>
	<linearGradient id="b52flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={FLAME.core} /><stop offset="0.25" stopColor={FLAME.white} /><stop offset="0.55" stopColor={FLAME.gold} /><stop offset="0.85" stopColor={FLAME.amber} stopOpacity="0.6" /><stop offset="1" stopColor={FLAME.orange} stopOpacity="0" /></linearGradient>
</defs>;
/** the era frame: the era's sky field (top → horizon), the picture, the soft vignette */
export const Frame52: React.FC<{id: string; era: EraId52; hz?: number; children: React.ReactNode; over?: React.ReactNode; vig?: number; sky?: string[]}> = ({id, era, hz = 700, children, over, vig = 0.45, sky}) => {
	const s = sky ?? PAL52[era].sky;
	return <><svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Defs51 /><Defs52 /><DefsB />
		<defs><linearGradient id={`sk${id}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={hz}>{s.map((c, i) => <stop key={i} offset={i / (s.length - 1)} stopColor={c} />)}</linearGradient></defs>
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill={`url(#sk${id})`} />
		{children}<Vignette id={id} a={vig} /></svg>{over}</>; };

/* ---------- the walker and cast (ep51 rig, era rim) ---------- */
export const LOOK52: Record<string, Look4> = {
	w1960: {dress: 'jacket', legs: 'trousers', head: 'cap'},     // the walker, 1950s work jacket + cap
	wang: {dress: 'jacket', legs: 'trousers', head: 'short'},    // 王希季: a small generic silhouette, no likeness
	today: {dress: 'jacket', legs: 'trousers', head: 'short'},   // the walker, modern jacket (= ep51 today)
};
/** a figure in the era's one tone with the era's warm rim; lx = which side the light comes from (1 right, -1 left) */
export const Fig: React.FC<{era: EraId52; x: number; g: number; h: number; pose: Pose; look: Look4; flip?: boolean; lx?: number; col?: string; rimO?: number; rim?: string}> = ({era, x, g, h, pose, look, flip, lx = 1, col = B.lac, rimO, rim}) => {
	const P = PAL52[era], d = P.rimD * Math.max(1, h / 600);
	return <Walker51 x={x} g={g} h={h} pose={pose} look={look} flip={flip} col={col} rim={rim ?? P.rim} rimO={rimO ?? P.rimO} dx={lx * d} dy={-d * 0.85} />; };

/* ---------- the T-7M-like sounding rocket (generic): a finned booster below, a slim liquid upper stage, an ogive nose ----------
   (x, base) = the centre of its bottom; h = overall height; lit = which side the light comes from (1 right, -1 left) */
export const Sounding: React.FC<{x: number; base: number; h: number; id: string; lit?: number; warm?: string}> = ({x, base, h, id, lit = 1, warm = '#FFE4B0'}) => {
	const wb = h * 0.068, wu = h * 0.044, hb = h * 0.3, hi = h * 0.05, hu = h * 0.5, hn = h * 0.15;
	const yb = base - hb, yi = yb - hi, yu = yi - hu, tip = yu - hn;
	const g0 = lit > 0 ? METAL.shade : warm, g1 = lit > 0 ? warm : METAL.shade;
	const fin = (s: number, y0: number, w: number, L: number, sw: number) => `M${x + s * w / 2},${y0 - L} L${x + s * (w / 2 + sw)},${y0 + L * 0.05} L${x + s * (w / 2 + sw)},${y0 + L * 0.22} L${x + s * w / 2},${y0 + L * 0.1} Z`;
	return <g>
		<defs><linearGradient id={`cyl${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={g0} /><stop offset="0.3" stopColor={METAL.mid} /><stop offset="0.62" stopColor={METAL.body} /><stop offset="0.86" stopColor={METAL.hi} /><stop offset="1" stopColor={g1} /></linearGradient></defs>
		{/* booster fins (behind), the booster, its nozzle skirt */}
		<path d={fin(-1, base, wb, hb * 0.42, wb * 0.95)} fill={METAL.mid} stroke={METAL.dark} strokeWidth={1.2} />
		<path d={fin(1, base, wb, hb * 0.42, wb * 0.95)} fill={METAL.body} stroke={METAL.dark} strokeWidth={1.2} />
		<rect x={x - wb / 2} y={yb} width={wb} height={hb} fill={`url(#cyl${id})`} stroke={METAL.dark} strokeWidth={1.2} />
		<path d={`M${x - wb * 0.42},${base} L${x - wb * 0.5},${base + h * 0.02} H${x + wb * 0.5} L${x + wb * 0.42},${base} Z`} fill={METAL.nozzle} />
		<rect x={x - wb * 0.13} y={yb} width={wb * 0.26} height={hb * 0.95} fill={METAL.mid} opacity={0.6} />
		<path d={`M${x - wb * 0.13},${base} V${base - hb * 0.55}`} stroke={METAL.dark} strokeWidth={1.6} />
		{/* interstage taper */}
		<path d={`M${x - wb / 2},${yb} L${x - wu / 2},${yi} H${x + wu / 2} L${x + wb / 2},${yb} Z`} fill={`url(#cyl${id})`} stroke={METAL.dark} strokeWidth={1.2} />
		{/* upper stage: small fins, the body, two generic dark bands, the nose */}
		<path d={fin(-1, yi, wu, hu * 0.12, wu * 0.7)} fill={METAL.mid} stroke={METAL.dark} strokeWidth={1} />
		<path d={fin(1, yi, wu, hu * 0.12, wu * 0.7)} fill={METAL.body} stroke={METAL.dark} strokeWidth={1} />
		<rect x={x - wu / 2} y={yu} width={wu} height={hu} fill={`url(#cyl${id})`} stroke={METAL.dark} strokeWidth={1.2} />
		{[0.18, 0.72].map((u, i) => <rect key={i} x={x - wu / 2} y={yu + hu * u} width={wu} height={h * 0.012} fill={METAL.band} opacity={0.8} />)}
		<path d={`M${x - wu / 2},${yu} Q${x - wu / 2},${yu - hn * 0.62} ${x},${tip} Q${x + wu / 2},${yu - hn * 0.62} ${x + wu / 2},${yu} Z`} fill={`url(#cyl${id})`} stroke={METAL.dark} strokeWidth={1.2} />
		{/* the lit edge: the first warm light runs down the side facing it */}
		<path d={`M${x + lit * wu / 2 - lit * 1.5},${yu - hn * 0.3} V${yi} L${x + lit * wb / 2 - lit * 1.5},${yb} V${base}`} fill="none" stroke={warm} strokeWidth={2.4} opacity={0.9} />
	</g>; };
/** the geometry of Sounding (where the tank valve and the flame are) */
export const soundingGeom = (x: number, base: number, h: number) => ({tank: [x + h * 0.022, base - h * 0.42] as P2, wb: h * 0.068, nozzle: [x, base + h * 0.02] as P2});
/** a thin lattice launch rail (two rails + zigzag bracing + a footing), the rocket rides on its left face */
export const Rail: React.FC<{x: number; base: number; h: number; w?: number; col?: string; hi?: string}> = ({x, base, h, w = 34, col = '#2A2620', hi = '#C8B890'}) => {
	const n = Math.round(h / (w * 1.3)), st = h / n;
	return <g>
		<path d={`M${x - w * 1.4},${base} L${x - w * 0.2},${base - h * 0.16} M${x + w * 2.4},${base} L${x + w * 1.2},${base - h * 0.16}`} stroke={col} strokeWidth={5} />
		<path d={`M${x},${base} V${base - h} M${x + w},${base} V${base - h}`} stroke={col} strokeWidth={5} />
		<path d={Array.from({length: n}, (_, i) => `M${x},${base - i * st} L${x + w},${base - (i + 0.5) * st} L${x},${base - (i + 1) * st}`).join(' ')} fill="none" stroke={col} strokeWidth={2.6} />
		<path d={`M${x + w},${base} V${base - h}`} stroke={hi} strokeWidth={1.4} opacity={0.5} />
		<rect x={x - w * 0.6} y={base - 6} width={w * 2.2} height={10} fill={col} />
	</g>; };
/** a floor bicycle pump: footplate, barrel, plunger rod, T-handle (seen side-on), a small gauge; returns the handle point */
export const pumpGeom = (x: number, g: number, s: number, up = 1) => ({handle: [x, g - s * (1.0 + 0.28 * up)] as P2, hoseOut: [x + s * 0.12, g - s * 0.06] as P2});
export const Pump: React.FC<{x: number; g: number; s: number; up?: number}> = ({x, g, s, up = 1}) => {
	const bw = s * 0.12, top = g - s * 0.9, hy = pumpGeom(x, g, s, up).handle[1];
	return <g>
		<rect x={x - s * 0.26} y={g - s * 0.035} width={s * 0.52} height={s * 0.035} rx={3} fill="#2A2724" />
		<rect x={x - bw / 2} y={top} width={bw} height={g - top - s * 0.03} rx={bw * 0.2} fill="#3A3E44" stroke="#14161A" strokeWidth={1.4} />
		<rect x={x - bw / 2 + bw * 0.62} y={top + 4} width={bw * 0.18} height={g - top - s * 0.07} fill="#B8BCC2" opacity={0.55} />
		<rect x={x - bw * 0.62} y={top - s * 0.03} width={bw * 1.24} height={s * 0.04} rx={2} fill="#22252A" />
		<rect x={x - s * 0.012} y={hy} width={s * 0.024} height={top - hy} fill="#C8CCD0" />
		<rect x={x - s * 0.13} y={hy - s * 0.035} width={s * 0.26} height={s * 0.05} rx={s * 0.025} fill="#1E1A16" />
		<circle cx={x + bw * 0.05} cy={g - s * 0.32} r={s * 0.055} fill="#E8E4D8" stroke="#22252A" strokeWidth={2} />
		<path d={`M${x + bw * 0.05},${g - s * 0.32} l${s * 0.03},${-s * 0.03}`} stroke="#B8432A" strokeWidth={2} strokeLinecap="round" />
	</g>; };
/** a low wall of stacked sacks (麻袋): rows of soft pillows, offset like brickwork, front face only */
export const Sandbags: React.FC<{x0: number; x1: number; base: number; rows: number; bh: number; col?: string; hi?: string; lx?: number}> = ({x0, x1, base, rows, bh, col = '#8A7650', hi = '#E8D4A0', lx = 1}) => {
	const bw = bh * 2.3, out: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++) { const y = base - (r + 1) * bh * 0.86, off = r % 2 ? bw / 2 : 0, inset = r * bh * 0.25;
		for (let k = -1; x0 + inset + off + k * bw < x1 - inset; k++) {
			const a = Math.max(x0 + inset, x0 + inset + off + k * bw), b = Math.min(x1 - inset, x0 + inset + off + (k + 1) * bw); if (b - a < bh * 0.5) continue;
			const j = rnd(r * 31 + k, 7) * 4, sh = mixC(col, '#2A2218', 0.18 * rnd(r * 17 + k, 3));
			out.push(<g key={`${r}-${k}`}>
				<path d={`M${a + 4},${y + bh * 0.5} Q${a},${y + 2 + j} ${a + bh * 0.4},${y + 1} Q${(a + b) / 2},${y - 5 + j} ${b - bh * 0.4},${y + 1} Q${b},${y + 2} ${b - 3},${y + bh * 0.5} Q${b + 1},${y + bh - 2} ${b - bh * 0.4},${y + bh} Q${(a + b) / 2},${y + bh + 4} ${a + bh * 0.4},${y + bh} Q${a - 1},${y + bh - 2} ${a + 4},${y + bh * 0.5} Z`}
					fill={sh} stroke="#2A2218" strokeWidth={1.6} />
				<path d={lx > 0 ? `M${(a + b) / 2},${y - 2 + j} Q${b - bh * 0.3},${y + 1} ${b - 4},${y + bh * 0.42}` : `M${(a + b) / 2},${y - 2 + j} Q${a + bh * 0.3},${y + 1} ${a + 4},${y + bh * 0.42}`} fill="none" stroke={hi} strokeWidth={2.2} opacity={0.65} strokeLinecap="round" />
				<path d={`M${(a + b) / 2 - bh * 0.3},${y + bh * 0.35} q${bh * 0.3},${bh * 0.12} ${bh * 0.6},0`} fill="none" stroke="#2A2218" strokeWidth={1.2} opacity={0.5} />
			</g>); } }
	return <g><path d={`M${x0 + 6},${base} L${x0 + rows * bh * 0.25 + 4},${base - rows * bh * 0.86} H${x1 - rows * bh * 0.25 - 4} L${x1 - 6},${base} Z`} fill="#3A3020" />{out}</g>; };
/** an A-frame reed hut (芦苇窝棚): bundled reeds, a dark doorway */
export const ReedHut: React.FC<{x: number; g: number; w: number; h: number; reed: string; reedD: string; door?: string}> = ({x, g, w, h, reed, reedD, door = '#2A2216'}) => <g>
	<path d={`M${x - w / 2},${g} L${x - w * 0.06},${g - h} L${x + w * 0.06},${g - h} L${x + w / 2},${g} Z`} fill={reed} />
	<path d={Array.from({length: 13}, (_, i) => { const u = (i + 0.5) / 13, bx = lerp(x - w / 2, x + w / 2, u), tx = lerp(x - w * 0.06, x + w * 0.06, u); return `M${bx},${g} L${tx},${g - h}`; }).join(' ')} stroke={reedD} strokeWidth={1.4} opacity={0.6} />
	<path d={`M${x - w * 0.38},${g - h * 0.24} H${x + w * 0.38} M${x - w * 0.25},${g - h * 0.52} H${x + w * 0.25}`} stroke={reedD} strokeWidth={3} opacity={0.7} />
	<path d={`M${x - w * 0.12},${g} L${x},${g - h * 0.5} L${x + w * 0.12},${g} Z`} fill={door} />
	<path d={`M${x - w * 0.1},${g - h} L${x - w * 0.16},${g - h - h * 0.12} M${x + w * 0.1},${g - h} L${x + w * 0.17},${g - h - h * 0.1}`} stroke={reedD} strokeWidth={3} />
</g>;

/* ---------- 东方红一号 (generic): a faceted ball, four whip antennas; lit from (lx, ly) ---------- */
export const BallSat: React.FC<{x: number; y: number; r: number; lx?: number; ly?: number}> = ({x, y, r, lx = -0.7, ly = 0.5}) => {
	const L = Math.hypot(lx, ly, 0.45), Lx = lx / L, Ly = ly / L, Lz = 0.45 / L;
	const facets: React.ReactNode[] = [], rings = 0, seg = 0;
	// a sphere of quads (front hemisphere, orthographic), latitude bands split in longitude, offset band to band
	const lats = [-90, -64, -38, -13, 13, 38, 64, 90];
	for (let a = 0; a < lats.length - 1; a++) { const n = [5, 8, 10, 11, 10, 8, 5][a], la0 = lats[a] * Math.PI / 180, la1 = lats[a + 1] * Math.PI / 180, off = (a % 2) * 0.5;
		for (let k = -1; k < n; k++) { const lo0 = Math.max(-Math.PI / 2, -Math.PI / 2 + Math.PI * (k + off) / n), lo1 = Math.min(Math.PI / 2, -Math.PI / 2 + Math.PI * (k + 1 + off) / n); if (lo1 <= lo0 + 1e-3) continue;
			const P = (la: number, lo: number): P2 => [x + r * Math.cos(la) * Math.sin(lo), y - r * Math.sin(la)];
			const pts = [P(la0, lo0), P(la0, lo1), P(la1, lo1), P(la1, lo0)], lm = (la0 + la1) / 2, om = (lo0 + lo1) / 2;
			const nx = Math.cos(lm) * Math.sin(om), ny = -Math.sin(lm), nz = Math.cos(lm) * Math.cos(om), dif = Math.max(0, nx * Lx + ny * Ly + nz * Lz), k2 = Math.min(1, 0.08 + 1.05 * dif ** 1.4) * (0.92 + 0.08 * rnd(a * 13 + k, 5));
			const c = k2 > 0.5 ? mixC('#B89868', '#FFF0C8', (k2 - 0.5) / 0.5) : mixC('#22262F', '#B89868', k2 / 0.5);
			facets.push(<path key={`${a}-${k}`} d={`M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L')} Z`} fill={c} stroke="#14161E" strokeWidth={1.4} strokeLinejoin="round" />); } }
	void rings; void seg;
	/* four whip antennas from the lower hemisphere, sweeping out and down (two in front, two behind) */
	const ant: [P2, P2, boolean][] = [[[x - r * 0.8, y + r * 0.5], [x - r * 3.0, y + r * 2.3], true], [[x + r * 0.8, y + r * 0.5], [x + r * 3.0, y + r * 2.1], true],
		[[x - r * 0.3, y + r * 0.8], [x - r * 1.0, y + r * 3.1], false], [[x + r * 0.35, y + r * 0.8], [x + r * 1.2, y + r * 3.0], false]];
	return <g>
		{ant.filter((a) => !a[2]).map(([s, e], i) => <path key={i} d={`M${s[0]},${s[1]} L${e[0]},${e[1]}`} stroke="#7A7E86" strokeWidth={2.2} strokeLinecap="round" />)}
		{facets}
		<path d={`M${x + r * Math.cos(Math.atan2(ly, lx) - 0.9)},${y + r * Math.sin(Math.atan2(ly, lx) - 0.9)} A${r},${r} 0 0,1 ${x + r * Math.cos(Math.atan2(ly, lx) + 0.9)},${y + r * Math.sin(Math.atan2(ly, lx) + 0.9)}`} fill="none" stroke="#FFE8B8" strokeWidth={3.5} opacity={0.9} />
		{ant.filter((a) => a[2]).map(([s, e], i) => <g key={i}><path d={`M${s[0]},${s[1]} L${e[0]},${e[1]}`} stroke="#D8D2C4" strokeWidth={3} strokeLinecap="round" /><path d={`M${s[0]},${s[1]} L${lerp(s[0], e[0], 0.5)},${lerp(s[1], e[1], 0.5)}`} stroke="#FFE8B8" strokeWidth={1.4} opacity={0.75} /><circle cx={s[0]} cy={s[1]} r={4} fill="#2A2E36" /></g>)}
	</g>; };

/* ---------- floodlight tower: a mast with a lamp bank and a soft beam toward (tx, ty) ---------- */
export const Flood: React.FC<{x: number; g: number; h: number; tx: number; ty: number; id: string; col?: string; beam?: string; a?: number}> = ({x, g, h, tx, ty, id, col = '#1E2436', beam = '#DDE4F4', a = 0.16}) => {
	const lx = x, ly = g - h, ang = Math.atan2(ty - ly, tx - lx), L = Math.hypot(tx - lx, ty - ly) * 1.15, sp = 0.16;
	const p1: P2 = [lx + Math.cos(ang - sp) * L, ly + Math.sin(ang - sp) * L], p2: P2 = [lx + Math.cos(ang + sp) * L, ly + Math.sin(ang + sp) * L];
	return <g>
		<defs><linearGradient id={`fb${id}`} gradientUnits="userSpaceOnUse" x1={lx} y1={ly} x2={tx} y2={ty}><stop offset="0" stopColor={beam} stopOpacity={a * 1.6} /><stop offset="0.6" stopColor={beam} stopOpacity={a * 0.6} /><stop offset="1" stopColor={beam} stopOpacity="0" /></linearGradient></defs>
		<path d={`M${lx},${ly} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Z`} fill={`url(#fb${id})`} />
		<path d={`M${x - 10},${g} L${x - 3},${ly} M${x + 10},${g} L${x + 3},${ly}`} stroke={col} strokeWidth={4} />
		<path d={Array.from({length: Math.floor(h / 40)}, (_, i) => `M${x - 9 + i * 0.0},${g - i * 40} L${x + 8},${g - i * 40 - 20} L${x - 7},${g - i * 40 - 40}`).join(' ')} fill="none" stroke={col} strokeWidth={2} />
		<rect x={x - 26} y={ly - 22} width={52} height={30} rx={3} fill={col} />
		{[0, 1, 2].map((k) => [0, 1].map((r) => <circle key={`${k}${r}`} cx={x - 16 + k * 16} cy={ly - 14 + r * 14} r={5.5} fill="#FFF8E4" />))}
		<ellipse cx={x} cy={ly - 7} rx={46} ry={30} fill="#FFF4D8" opacity={0.25} filter="url(#b52m)" />
	</g>; };

void H;

import React from 'react';
import {W, H, lerp, rnd, cl} from '../qq50/kit50';
import {B, BG, RimFig} from '../qq50/styleB';
import {Pose, Look4} from '../qq44/figure44';
/* ep51 「古代没有冰箱，夏天怎么吃冰？」 shared props (Builder A owns this file; Builder B may import, never edit).
   The look is ep50's B v3 (漆 · night). The ONE new accent is ice: cool blue-white (core #EAF6FF, body #BFE3F2, shade #6FA9C4).
   Every ice drawing has translucent facets, a bright top edge, an inner highlight and crisp chisel marks.
   Put <Defs51 /> once inside each <svg> that draws ice or bronze. Signatures here are stable: add, don't change. */
type P2 = [number, number];
export type {P2};

/* ---------- palette ---------- */
export const ICE = {core: '#EAF6FF', body: '#BFE3F2', mid: '#97C8DE', shade: '#6FA9C4', deep: '#3F7590', line: '#F6FCFF', mark: '#2F6A88'};
export const BRZ = {hi: '#FFE2A6', lit: '#E7B271', body: '#B07A3E', dark: '#6E4520', deep: '#3A2210', line: '#5A3A18'};
export const SNOW = '#F3EEE6';   // snow stays warm-white so ice keeps the only cool accent

export const Defs51: React.FC = () => <defs>
	<linearGradient id="ice51F" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={ICE.core} /><stop offset="0.32" stopColor={ICE.body} /><stop offset="0.7" stopColor={ICE.mid} /><stop offset="1" stopColor={ICE.shade} /></linearGradient>
	<linearGradient id="ice51T" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.5" stopColor={ICE.core} /><stop offset="1" stopColor={ICE.body} /></linearGradient>
	<linearGradient id="ice51S" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={ICE.mid} /><stop offset="0.6" stopColor={ICE.shade} /><stop offset="1" stopColor={ICE.deep} /></linearGradient>
	<radialGradient id="ice51Pool"><stop offset="0" stopColor="#BFE3F2" stopOpacity="0.32" /><stop offset="0.5" stopColor="#8EC3DA" stopOpacity="0.12" /><stop offset="1" stopColor="#6FA9C4" stopOpacity="0" /></radialGradient>
	<linearGradient id="brz51" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={BRZ.dark} /><stop offset="0.12" stopColor={BRZ.body} /><stop offset="0.3" stopColor={BRZ.hi} /><stop offset="0.42" stopColor={BRZ.lit} /><stop offset="0.75" stopColor={BRZ.body} /><stop offset="1" stopColor={BRZ.dark} /></linearGradient>
	<linearGradient id="brz51v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={BRZ.hi} /><stop offset="0.5" stopColor={BRZ.lit} /><stop offset="1" stopColor={BRZ.body} /></linearGradient>
	<linearGradient id="brz51d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={BRZ.deep} /><stop offset="0.5" stopColor="#4E3018" /><stop offset="1" stopColor={BRZ.deep} /></linearGradient>
	<linearGradient id="slv51" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F8FA" /><stop offset="0.35" stopColor="#C4CDD3" /><stop offset="0.55" stopColor="#FFFFFF" /><stop offset="0.75" stopColor="#B0BAC1" /><stop offset="1" stopColor="#8D979E" /></linearGradient>
	<filter id="soft51" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
	<filter id="sh51" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0A0402" floodOpacity="0.55" /></filter>
</defs>;

/* ---------- ice ---------- */
/** a cold pool of light on the surface under ice (stays on the ground, never a halo round the block) */
export const IcePool: React.FC<{x: number; y: number; rx: number; ry?: number; o?: number}> = ({x, y, rx, ry = rx * 0.16, o = 1}) =>
	<ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#ice51Pool)" opacity={o} />;

/** a hand-cut ice block, seen from slightly above-right. (x, y) = centre of the front bottom edge (where it sits); w × h front
    face, d depth; side = which side face shows (1 right, -1 left). marks: chisel marks on the front face. melt 0..1 rounds and
    shrinks it (for the vault). seed varies the cut. */
export const IceBlock: React.FC<{x: number; y: number; w: number; h: number; d?: number; side?: 1 | -1; marks?: boolean; seed?: number; o?: number; melt?: number; rot?: number}> =
	({x, y, w, h, d = w * 0.42, side = 1, marks = true, seed = 1, o = 1, melt = 0, rot = 0}) => {
		const j = (k: number, a: number) => (rnd(seed * 13 + k, 3) - 0.5) * a;   // small irregular cut
		const k = 1 - 0.35 * melt, ww = w * k, hh = h * k, dd = d * k;
		const ox = side * dd * 0.55, oy = -dd * 0.48;
		const fl: P2 = [-ww / 2 + j(1, ww * 0.04), 0], fr: P2 = [ww / 2 + j(2, ww * 0.04), 0], tr: P2 = [ww / 2 + j(3, ww * 0.05), -hh + j(4, hh * 0.06)], tl: P2 = [-ww / 2 + j(5, ww * 0.05), -hh + j(6, hh * 0.06)];
		const b = (p: P2): P2 => [p[0] + ox, p[1] + oy];
		const P = (p: P2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
		const r = melt * Math.min(ww, hh) * 0.25;
		const front = r > 0 ? `M${P([fl[0] + r, 0])} L${P([fr[0] - r, 0])} Q${P(fr)} ${P([fr[0], -r])} L${P([tr[0], tr[1] + r])} Q${P(tr)} ${P([tr[0] - r, tr[1]])} L${P([tl[0] + r, tl[1]])} Q${P(tl)} ${P([tl[0], tl[1] + r])} L${P([fl[0], -r])} Q${P(fl)} ${P([fl[0] + r, 0])} Z`
			: `M${P(fl)} L${P(fr)} L${P(tr)} L${P(tl)} Z`;
		const top = `M${P(tl)} L${P(tr)} L${P(b(tr))} L${P(b(tl))} Z`;
		const sideD = side === 1 ? `M${P(fr)} L${P(b(fr))} L${P(b(tr))} L${P(tr)} Z` : `M${P(fl)} L${P(b(fl))} L${P(b(tl))} L${P(tl)} Z`;
		const cid = `icf${seed}_${Math.round(x)}_${Math.round(y)}`;
		const sw = Math.max(1.2, w / 90);
		/* chisel marks: short bevelled cuts, each a dark groove with a bright lip beside it */
		/* a row of parallel strokes down from the top edge (where the block was cut from the sheet) + a short row up the left edge */
		const cuts = marks ? [...Array.from({length: 6}, (_, i) => { const u = 0.1 + 0.8 * (i + 0.3 * rnd(i, seed)) / 6, L = hh * (0.16 + 0.12 * rnd(i, seed + 2)), a = 72 + 8 * rnd(i, seed + 3);
			const cx = lerp(tl[0], tr[0], u), cy = lerp(tl[1], tr[1], u) + hh * 0.04, ca = Math.cos(a * Math.PI / 180) * L, sa = Math.sin(a * Math.PI / 180) * L;
			return {d: `M${cx.toFixed(1)},${cy.toFixed(1)} l${(-ca).toFixed(1)},${sa.toFixed(1)}`, lip: `M${(cx + sw * 1.6).toFixed(1)},${cy.toFixed(1)} l${(-ca).toFixed(1)},${sa.toFixed(1)}`}; }),
			...Array.from({length: 3}, (_, i) => { const v = 0.4 + 0.18 * i, L = ww * (0.1 + 0.05 * rnd(i, seed + 5)), cx = lerp(tl[0], fl[0], v) + ww * 0.03, cy = lerp(tl[1], 0, v);
				return {d: `M${cx.toFixed(1)},${cy.toFixed(1)} l${L.toFixed(1)},${(L * 0.3).toFixed(1)}`, lip: `M${cx.toFixed(1)},${(cy + sw * 1.6).toFixed(1)} l${L.toFixed(1)},${(L * 0.3).toFixed(1)}`}; })] : [];
		return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
			<defs><clipPath id={cid}><path d={front} /></clipPath></defs>
			<path d={sideD} fill="url(#ice51S)" opacity={0.95} />
			<path d={top} fill="url(#ice51T)" />
			<path d={front} fill="url(#ice51F)" opacity={0.93} />
			<g clipPath={`url(#${cid})`}>
				{/* inner body: a deeper core and the diagonal highlight streak */}
				<ellipse cx={lerp(tl[0], tr[0], 0.62)} cy={-hh * 0.42} rx={ww * 0.34} ry={hh * 0.3} fill={ICE.shade} opacity={0.22} />
				<path d={`M${-ww * 0.42},${-hh * 0.15} L${-ww * 0.12},${-hh * 0.95} L${ww * 0.0},${-hh * 0.95} L${-ww * 0.3},${-hh * 0.15} Z`} fill="#FFFFFF" opacity={0.42} />
				<path d={`M${-ww * 0.22},${-hh * 0.12} L${ww * 0.04},${-hh * 0.8} L${ww * 0.09},${-hh * 0.8} L${-ww * 0.16},${-hh * 0.12} Z`} fill="#FFFFFF" opacity={0.28} />
				{/* fine internal cracks and a few bubbles */}
				{[0, 1, 2].map((i) => <circle key={i} cx={lerp(tl[0], tr[0], 0.25 + 0.6 * rnd(i, seed + 4))} cy={-hh * (0.2 + 0.6 * rnd(i, seed + 6))} r={Math.max(1.2, ww * 0.012)} fill="none" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1} />)}
				{cuts.map((c, i) => <g key={i}><path d={c.lip} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={sw * 1.1} strokeLinecap="round" /><path d={c.d} stroke={ICE.mark} strokeOpacity={0.8} strokeWidth={sw * 1.3} strokeLinecap="round" /></g>)}
			</g>
			{/* edges: bright on the top and the lit corner, dim at the base */}
			<path d={`M${P(tl)} L${P(tr)} L${P(b(tr))} L${P(b(tl))} Z`} fill="none" stroke={ICE.line} strokeWidth={sw * 1.6} strokeLinejoin="round" />
			<path d={side === 1 ? `M${P(tr)} L${P(fr)}` : `M${P(tl)} L${P(fl)}`} stroke={ICE.line} strokeWidth={sw * 1.4} strokeOpacity={0.9} />
			<path d={front} fill="none" stroke={ICE.shade} strokeWidth={sw} strokeOpacity={0.7} />
		</g>; };

/** small ice cubes (for a glass, a bowl, a box): n cubes in a loose heap around (x, y), size s */
export const IceCubes: React.FC<{x: number; y: number; s: number; n?: number; seed?: number}> = ({x, y, s, n = 3, seed = 2}) => <g>
	{Array.from({length: n}, (_, i) => { const cx = x + (i - (n - 1) / 2) * s * 0.8 + (rnd(i, seed) - 0.5) * s * 0.3, cy = y - (i % 2) * s * 0.45, r = (rnd(i, seed + 1) - 0.5) * 40;
		return <g key={i} transform={`translate(${cx},${cy}) rotate(${r})`}>
			<rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.16} fill="url(#ice51F)" stroke={ICE.line} strokeWidth={Math.max(1, s / 22)} />
			<path d={`M${-s * 0.3},${s * 0.15} L${-s * 0.05},${-s * 0.32}`} stroke="#FFFFFF" strokeWidth={Math.max(1.2, s / 10)} strokeLinecap="round" opacity={0.8} />
		</g>; })}
</g>;

/** an ice slab lying on the ground seen low (a long irregular block, used on the river) */
export const iceRing = IceBlock;

/* ---------- tools ---------- */
/** the chisel (凿): wooden handle + iron shank with a bevelled edge. (x, y) = the butt end; points along rot (deg, 0 = +x) */
export const Chisel: React.FC<{x: number; y: number; L: number; rot?: number; o?: number}> = ({x, y, L, rot = 0, o = 1}) => { const t = L * 0.075;
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
		<path d={`M0,${-t * 0.9} Q${-t * 0.5},0 0,${t * 0.9} L${L * 0.48},${t * 0.75} L${L * 0.48},${-t * 0.75} Z`} fill="#7A5230" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
		<path d={`M${L * 0.06},${-t * 0.4} L${L * 0.44},${-t * 0.32}`} stroke="#B98A55" strokeWidth={1.5} opacity={0.7} />
		<rect x={L * 0.46} y={-t * 0.85} width={L * 0.05} height={t * 1.7} fill="#5E6266" />
		<path d={`M${L * 0.51},${-t * 0.42} L${L * 0.9},${-t * 0.36} L${L},${t * 0.05} L${L * 0.9},${t * 0.36} L${L * 0.51},${t * 0.42} Z`} fill="#8E959B" stroke="#2A2C2F" strokeWidth={1.2} />
		<path d={`M${L * 0.53},${-t * 0.2} L${L * 0.92},${-t * 0.16}`} stroke="#D7DDE1" strokeWidth={1.4} opacity={0.8} />
	</g>; };
/** the tip of a Chisel drawn with the same (x, y, L, rot) */
export const chiselTip = (x: number, y: number, L: number, rot = 0): P2 => [x + L * Math.cos(rot * Math.PI / 180), y + L * Math.sin(rot * Math.PI / 180)];

/** a modern glass tumbler of iced drink: (x, y) = base centre, w = rim width. The ice cubes carry the cool accent. */
export const Cup: React.FC<{x: number; y: number; w: number; frost?: number; fill?: number; ice?: boolean}> = ({x, y, w, frost = 0.4, fill = 0.7, ice = true}) => { const h = w * 1.35, wb = w * 0.82;
	const body = `M${x - w / 2},${y - h} L${x + w / 2},${y - h} L${x + wb / 2},${y} L${x - wb / 2},${y} Z`;
	const ly = y - h * fill, lw = lerp(wb, w, fill);
	const cid = `cup${Math.round(x)}${Math.round(y)}`;
	return <g>
		<defs><clipPath id={cid}><path d={body} /></clipPath></defs>
		<path d={body} fill="#2A3238" opacity={0.55} />
		<g clipPath={`url(#${cid})`}>
			<path d={`M${x - lw / 2},${ly} L${x + lw / 2},${ly} L${x + wb / 2},${y} L${x - wb / 2},${y} Z`} fill="#C88A3E" opacity={0.55} />
			{ice && <IceCubes x={x} y={ly + w * 0.12} s={w * 0.36} n={3} seed={5} />}
			{ice && <IceCubes x={x + w * 0.05} y={ly + w * 0.48} s={w * 0.3} n={2} seed={9} />}
			<rect x={x - w / 2} y={y - h} width={w} height={h} fill="#EAF6FF" opacity={0.18 * frost} />
			{Array.from({length: 18}, (_, i) => <circle key={i} cx={x - w * 0.45 + w * 0.9 * rnd(i, 3)} cy={y - h * 0.9 * rnd(i, 7)} r={1.2 + 1.6 * rnd(i, 1)} fill="#FFFFFF" opacity={0.55 * frost} />)}
		</g>
		<path d={body} fill="none" stroke="#DDEFF8" strokeOpacity={0.75} strokeWidth={2} />
		<path d={`M${x - w * 0.36},${y - h * 0.9} L${x - wb * 0.3},${y - h * 0.08}`} stroke="#FFFFFF" strokeWidth={w * 0.05} strokeLinecap="round" opacity={0.5} />
		<ellipse cx={x} cy={y - h} rx={w / 2} ry={w * 0.07} fill="none" stroke="#F6FCFF" strokeWidth={2} strokeOpacity={0.85} />
	</g>; };

/* ---------- snow ---------- */
/** drifting snow in a box (x0..x1, y0..y1), time t in s; seeded so it is stable frame to frame */
export const Snow: React.FC<{x0?: number; y0?: number; x1?: number; y1?: number; n?: number; t?: number; seed?: number; size?: number; o?: number}> = ({x0 = 0, y0 = 0, x1 = W, y1 = H, n = 120, t = 0, seed = 1, size = 1, o = 0.85}) => {
	const hh = y1 - y0, ww = x1 - x0;
	return <g fill={SNOW}>{Array.from({length: n}, (_, i) => { const z = 0.35 + 0.65 * rnd(i, seed + 2), sp = 40 + 70 * z, y = y0 + ((rnd(i, seed) * hh + sp * t) % hh), x = x0 + ((rnd(i, seed + 1) * ww + 18 * Math.sin(t * 0.9 + i) * z) % ww + ww) % ww;
		return <circle key={i} cx={x} cy={y} r={(1.3 + 3.2 * z) * size} opacity={o * (0.35 + 0.65 * z)} />; })}</g>; };

/* ---------- sets ---------- */
/** the frozen river at night: far bank with bare trees and snow, the ice sheet with cracks and a faint cold sheen. g = the
    near edge line where people stand (the ice), horizon ≈ g - 230 */
export const FrozenRiver: React.FC<{g: number; t?: number; id?: string}> = ({g, t = 0, id = 'fr'}) => { const hz = g - 250;
	return <g>
		<defs><linearGradient id={`frI${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E1614" /><stop offset="0.5" stopColor="#1A1210" /><stop offset="1" stopColor="#120B09" /></linearGradient></defs>
		{/* far bank: low hills, bare trees, a snow line */}
		<path d={`M-40,${hz} Q260,${hz - 70} 520,${hz - 30} Q860,${hz - 95} 1180,${hz - 40} Q1520,${hz - 80} 1960,${hz - 20} V${hz + 20} H-40 Z`} fill={B.far} />
		<path d={`M-40,${hz} Q260,${hz - 70} 520,${hz - 30} Q860,${hz - 95} 1180,${hz - 40} Q1520,${hz - 80} 1960,${hz - 20}`} fill="none" stroke={SNOW} strokeOpacity={0.16} strokeWidth={3} />
		{[[180, 1.0], [430, 0.7], [1330, 0.85], [1640, 1.1], [1820, 0.6]].map(([x, s], i) => <g key={i} stroke={BG.line} strokeWidth={2.2 * s} fill="none" strokeLinecap="round">
			<path d={`M${x},${hz - 20} L${x + 4},${hz - 20 - 150 * s} M${x + 2},${hz - 20 - 70 * s} L${x - 40 * s},${hz - 20 - 130 * s} M${x + 3},${hz - 20 - 100 * s} L${x + 46 * s},${hz - 20 - 160 * s} M${x - 18 * s},${hz - 20 - 105 * s} L${x - 30 * s},${hz - 20 - 150 * s}`} /></g>)}
		<rect x={-40} y={hz} width={W + 80} height={H - hz + 40} fill={`url(#frI${id})`} />
		<path d={`M-40,${hz + 3} H${W + 40}`} stroke={SNOW} strokeOpacity={0.22} strokeWidth={4} />
		{/* the ice sheet: faint long sheen streaks and cracks (receding) */}
		{Array.from({length: 7}, (_, i) => { const y = hz + 18 + i * i * 6 + i * 14, x = -100 + ((i * 397 + t * 6) % 1600); return <path key={i} d={`M${x},${y} h${260 + i * 60}`} stroke="#C9DCE4" strokeOpacity={0.05 + 0.012 * i} strokeWidth={2 + i * 0.6} strokeLinecap="round" />; })}
		<g fill="none" stroke="#D5E4EA" strokeOpacity={0.11} strokeWidth={1.6}>
			<path d={`M120,${g + 70} L340,${g + 10} L410,${g - 60} L620,${hz + 60} M340,${g + 10} L520,${g + 40} L760,${g + 20}`} />
			<path d={`M1180,${g + 120} L1300,${g + 30} L1520,${g - 10} L1700,${hz + 90} M1300,${g + 30} L1250,${g - 50}`} />
			<path d={`M860,${hz + 40} L960,${hz + 80} L1120,${hz + 70}`} />
		</g>
		{/* snow drifts at the near edge */}
		<path d={`M-40,${H + 10} V${g + 90} Q160,${g + 60} 330,${g + 96} Q520,${g + 120} 700,${g + 140} V${H + 10} Z`} fill="#2A201C" />
		<path d={`M-40,${g + 90} Q160,${g + 60} 330,${g + 96} Q520,${g + 120} 700,${g + 140}`} fill="none" stroke={SNOW} strokeOpacity={0.28} strokeWidth={3} />
		<path d={`M1300,${H + 10} Q1500,${g + 110} 1960,${g + 70} V${H + 10} Z`} fill="#2A201C" />
		<path d={`M1300,${H + 10} Q1500,${g + 110} 1960,${g + 70}`} fill="none" stroke={SNOW} strokeOpacity={0.24} strokeWidth={3} />
	</g>; };

/* ---------- the 鉴缶 (generic drawing, plain decoration; not a copy of the museum piece) ----------
   A square bronze basin (鉴) on four short feet with a lid; through the lid's square opening rises the neck of a square jar
   (缶) with its own small lid. Frontal view from a little above. (x, y) = centre of the base line, w = basin width at the rim.
   mode 'whole' | 'section' (front half cut away: the jar inside, ice in the gap). ice 0..1 = how full the gap is.
   frost 0..1 = rime on the bronze. glow 0..1 = the warm rim light (keep it on: the vessel is always lit). */
export const jfGeom = (x: number, y: number, w: number) => { const f = w * 0.06, hb = w * 0.74, wb = w * 0.9, dy = w * 0.09, lid = w * 0.05, jw = w * 0.6, nw = w * 0.36, nh = w * 0.13, t = w * 0.035;
	const yb = y - f, yt = yb - hb, yl = yt - lid, gw = w / 2 - t - jw / 2;
	return {f, hb, wb, dy, lid, jw, nw, nh, t, yb, yt, yl, x, w, neckTop: yl - nh, gapW: gw, gapL: x - jw / 2 - gw / 2, gapR: x + jw / 2 + gw / 2}; };
const band = (x0: number, x1: number, y: number, h: number) => { const n = Math.max(4, Math.round((x1 - x0) / (h * 1.6))), step = (x1 - x0) / n, d: string[] = [];
	for (let i = 0; i < n; i++) { const cx = x0 + step * (i + 0.5); d.push(`M${(cx - step * 0.3).toFixed(1)},${(y + h * 0.7).toFixed(1)} L${(cx - step * 0.3).toFixed(1)},${(y + h * 0.3).toFixed(1)} L${(cx + step * 0.15).toFixed(1)},${(y + h * 0.3).toFixed(1)} L${(cx + step * 0.15).toFixed(1)},${(y + h * 0.55).toFixed(1)} L${(cx - step * 0.08).toFixed(1)},${(y + h * 0.55).toFixed(1)}`); }
	return d.join(' '); };
/** lid = the basin's lid on (whole: always); slot = drawn inside the gap layer (e.g. a block being packed) */
export const Jianfou: React.FC<{x: number; y: number; w: number; mode?: 'whole' | 'section'; ice?: number; frost?: number; glow?: number; wine?: boolean; lid?: boolean; slot?: React.ReactNode; id?: string}> = ({x, y, w, mode = 'whole', ice = 1, frost = 0, glow = 1, wine = true, lid: lidOn = true, slot, id = 'jf'}) => {
	const G = jfGeom(x, y, w), {wb, dy, jw, nw, nh, t, yb, yt, yl} = G, sw = Math.max(1.5, w / 200);
	const L = x - w / 2, R = x + w / 2, Lb = x - wb / 2, Rb = x + wb / 2, nT = yl - nh;
	const body = `M${L},${yt} L${R},${yt} L${Rb},${yb} L${Lb},${yb} Z`;
	const feet = [Lb + w * 0.07, Rb - w * 0.07].map((fx) => `M${fx - w * 0.065},${yb} L${fx + w * 0.065},${yb} Q${fx + w * 0.05},${y - w * 0.02} ${fx + w * 0.04},${y} L${fx - w * 0.04},${y} Q${fx - w * 0.05},${y - w * 0.02} ${fx - w * 0.065},${yb} Z`).join(' ');
	const ears = [-1, 1].map((s) => { const ex = s === -1 ? L - w * 0.005 : R + w * 0.005, ey = yt + w * 0.16; return {ear: `M${ex},${ey - w * 0.06} q${s * w * 0.08},${w * 0.0} ${s * w * 0.07},${w * 0.08} q${-s * w * 0.03},${w * 0.03} ${-s * w * 0.07},${w * 0.01} Z`, ring: [ex + s * w * 0.05, ey + w * 0.085] as P2}; });
	const rim = `M${L - w * 0.015},${yt - w * 0.004} L${R + w * 0.015},${yt - w * 0.004} L${R + w * 0.008},${yt + w * 0.05} L${L - w * 0.008},${yt + w * 0.05} Z`;
	const topF = (yy: number, ww: number, d: number) => `M${x - ww / 2},${yy} L${x + ww / 2},${yy} L${x + ww / 2},${yy - d} L${x - ww / 2},${yy - d} Z`;
	const jarLid = `M${x - nw / 2 - w * 0.025},${nT} L${x + nw / 2 + w * 0.025},${nT} Q${x + nw / 2},${nT - w * 0.05} ${x},${nT - w * 0.055} Q${x - nw / 2},${nT - w * 0.05} ${x - nw / 2 - w * 0.025},${nT} Z`;
	const knob = <circle cx={x} cy={nT - w * 0.085} r={w * 0.028} fill="none" stroke={BRZ.lit} strokeWidth={w * 0.012} />;
	const rimLight = (d: string, k = 1) => <path d={d} fill="none" stroke={BRZ.hi} strokeOpacity={0.85 * glow * k} strokeWidth={sw * 2} strokeLinejoin="round" strokeLinecap="round" />;
	const frostDots = (x0: number, x1: number, y0: number, y1: number, n: number, s: number) => frost > 0 ? Array.from({length: n}, (_, i) => <circle key={i} cx={lerp(x0, x1, rnd(i, s))} cy={lerp(y0, y1, Math.pow(rnd(i, s + 1), 0.7))} r={1 + 2.2 * rnd(i, s + 2)} fill="#F2FAFF" opacity={frost * (0.4 + 0.5 * rnd(i, s + 3))} />) : null;
	const earsN = ears.map((e, i) => <g key={i}><path d={e.ear} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={sw} /><circle cx={e.ring[0]} cy={e.ring[1]} r={w * 0.036} fill="none" stroke={BRZ.lit} strokeWidth={w * 0.013} /></g>);
	if (mode === 'whole') return <g>
		<path d={feet} fill="url(#brz51d)" stroke={BRZ.line} strokeWidth={sw} />
		<path d={body} fill="url(#brz51)" stroke={BRZ.line} strokeWidth={sw} />
		{/* plain decoration: hairline-framed meander bands, corner flanges */}
		<g stroke={BRZ.dark} strokeWidth={sw} fill="none" opacity={0.75}>
			<path d={`M${L + w * 0.03},${yt + w * 0.09} H${R - w * 0.03} M${L + w * 0.035},${yt + w * 0.16} H${R - w * 0.035}`} />
			<path d={band(L + w * 0.05, R - w * 0.05, yt + w * 0.09, w * 0.07)} />
			<path d={`M${Lb + w * 0.025},${yb - w * 0.1} H${Rb - w * 0.025} M${Lb + w * 0.02},${yb - w * 0.05} H${Rb - w * 0.02}`} />
			<path d={band(Lb + w * 0.04, Rb - w * 0.04, yb - w * 0.1, w * 0.05)} />
		</g>
		{[[L + w * 0.012, Lb + w * 0.012], [R - w * 0.012, Rb - w * 0.012]].map(([a, b], i) => <path key={i} d={`M${a},${yt + w * 0.06} L${b},${yb - w * 0.02}`} stroke={BRZ.dark} strokeWidth={w * 0.018} strokeDasharray={`${w * 0.05} ${w * 0.025}`} opacity={0.7} />)}
		{earsN}
		<path d={rim} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={sw} />
		{/* the lid with its square opening; the jar neck rises through it */}
		<path d={`M${L - w * 0.01},${yt} L${R + w * 0.01},${yt} L${R + w * 0.01},${yl} L${L - w * 0.01},${yl} Z`} fill="url(#brz51)" stroke={BRZ.line} strokeWidth={sw} />
		<path d={topF(yl, w * 1.02, dy)} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={sw} />
		<path d={topF(yl - dy * 0.15, nw * 1.2, dy * 0.7)} fill={BRZ.deep} />
		<path d={`M${x - nw / 2},${yl - dy * 0.3} L${x + nw / 2},${yl - dy * 0.3} L${x + nw / 2},${nT} L${x - nw / 2},${nT} Z`} fill="url(#brz51)" stroke={BRZ.line} strokeWidth={sw} />
		<path d={`M${x - nw / 2},${nT + nh * 0.35} H${x + nw / 2}`} stroke={BRZ.dark} strokeWidth={sw} opacity={0.6} />
		<path d={jarLid} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={sw} />{knob}
		{/* the warm rim light: top edges and the lit left corner */}
		{rimLight(`M${x - w * 0.51},${yl - dy} L${x + w * 0.51},${yl - dy}`)}
		{rimLight(`M${x - nw / 2 - w * 0.02},${nT - w * 0.01} Q${x - nw / 2},${nT - w * 0.05} ${x},${nT - w * 0.055}`)}
		{rimLight(`M${L},${yt + w * 0.05} L${Lb},${yb}`, 0.7)}
		<path d={`M${L + w * 0.13},${yt + w * 0.22} L${L + w * 0.19},${yb - w * 0.14}`} stroke="#FFF2D2" strokeOpacity={0.35 * glow} strokeWidth={w * 0.03} strokeLinecap="round" />
		{frostDots(L, R, yt, yb, 70, 3)}
		{frost > 0 && <path d={body} fill="#EAF6FF" opacity={0.12 * frost} />}
	</g>;
	/* ---- section: the front half removed. Walls drawn as cut faces (hatched bronze), the jar cut too, ice in the gap ---- */
	const jx0 = x - jw / 2, jx1 = x + jw / 2, jb = yb - t - w * 0.015, ys = yt + w * 0.18, yn = yt + w * 0.03;
	const iceTop = lerp(jb, yt + w * 0.06, ice);
	const hatch = (x0: number, y0: number, x1: number, y1: number) => { const n = Math.ceil((x1 - x0 + y1 - y0) / 9), d: string[] = []; for (let i = 0; i < n; i++) d.push(`M${x0 + i * 9},${y0} l${-(y1 - y0)},${y1 - y0}`); return d.join(''); };
	const cutP = (d: string, k: string, bx: [number, number, number, number]) => <g key={k}><defs><clipPath id={`${id}${k}`}><path d={d} /></clipPath></defs>
		<path d={d} fill={BRZ.body} /><path d={hatch(bx[0], bx[1], bx[2] + (bx[3] - bx[1]), bx[3])} clipPath={`url(#${id}${k})`} stroke={BRZ.dark} strokeWidth={1.4} opacity={0.6} />
		<path d={d} fill="none" stroke={BRZ.hi} strokeOpacity={0.75 * glow} strokeWidth={sw} /></g>;
	const rectD = (x0: number, y0: number, x1: number, y1: number) => `M${x0},${y0} L${x1},${y0} L${x1},${y1} L${x0},${y1} Z`;
	const shoulderOut = `M${jx0},${jb} L${jx0},${ys} Q${jx0},${yn} ${x - nw / 2},${yn} L${x - nw / 2},${nT} L${x + nw / 2},${nT} L${x + nw / 2},${yn} Q${jx1},${yn} ${jx1},${ys} L${jx1},${jb} Z`;
	const shoulderCut = (s: 1 | -1) => { const xo = s === -1 ? jx0 : jx1, xn = s === -1 ? x - nw / 2 : x + nw / 2, i = -s * t;
		return `M${xo},${ys} Q${xo},${yn} ${xn},${yn} L${xn},${nT} L${xn + i},${nT} L${xn + i},${yn + t} Q${xo + i},${yn + t} ${xo + i},${ys} Z`; };
	const chunks = (cx: number, cw: number, seed: number) => { const out: React.ReactNode[] = []; let yy = yb - t - 1, i = 0;
		while (yy > iceTop + 6 && i < 20) { const hh = Math.min(cw * (0.7 + 0.4 * rnd(i, seed)), yy - iceTop); out.push(<IceBlock key={i} x={cx + (rnd(i, seed + 1) - 0.5) * cw * 0.06} y={yy} w={cw * 0.9} h={hh} d={cw * 0.22} seed={seed * 5 + i} marks={i % 2 === 0} side={seed % 2 ? 1 : -1} />); yy -= hh + 2; i++; }
		return out; };
	return <g>
		<path d={feet} fill="url(#brz51d)" stroke={BRZ.line} strokeWidth={sw} />
		{/* the inside of the basin's back wall (dark bronze) */}
		<path d={`M${L + t},${yt + w * 0.05} L${R - t},${yt + w * 0.05} L${Rb - t},${yb - t} L${Lb + t},${yb - t} Z`} fill="url(#brz51d)" />
		{/* the jar: its back, the wine, its cut walls and shoulders */}
		<path d={shoulderOut} fill="#24130A" />
		{wine && <><path d={`M${jx0 + t},${jb - t} L${jx0 + t},${ys + w * 0.02} L${jx1 - t},${ys + w * 0.02} L${jx1 - t},${jb - t} Z`} fill="#5A1E14" />
			<path d={`M${jx0 + t},${ys + w * 0.02} L${jx1 - t},${ys + w * 0.02}`} stroke="#B0503A" strokeWidth={sw * 1.6} opacity={0.85} /></>}
		{cutP(rectD(jx0, ys, jx0 + t, jb), 'jl', [jx0, ys, jx0 + t, jb])}{cutP(rectD(jx1 - t, ys, jx1, jb), 'jr', [jx1 - t, ys, jx1, jb])}{cutP(rectD(jx0, jb - t, jx1, jb), 'jf', [jx0, jb - t, jx1, jb])}
		{cutP(shoulderCut(-1), 'sl', [jx0, nT, x, ys])}{cutP(shoulderCut(1), 'sr', [x, nT, jx1, ys])}
		<path d={jarLid} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={sw} />{knob}
		{rimLight(`M${x - nw / 2 - w * 0.02},${nT - w * 0.01} Q${x - nw / 2},${nT - w * 0.05} ${x},${nT - w * 0.055}`)}
		{/* ice in the gap, left and right of the jar */}
		{ice > 0 && <>{chunks(G.gapL, G.gapW, 3)}{chunks(G.gapR, G.gapW, 4)}</>}
		{slot}
		{/* the basin's cut walls and floor, the lip */}
		{cutP(`M${L},${yt + w * 0.05} L${L + t},${yt + w * 0.05} L${Lb + t},${yb} L${Lb},${yb} Z`, 'bl', [Lb, yt, L + t, yb])}
		{cutP(`M${R - t},${yt + w * 0.05} L${R},${yt + w * 0.05} L${Rb},${yb} L${Rb - t},${yb} Z`, 'br', [R - t, yt, Rb, yb])}
		{cutP(rectD(Lb, yb - t, Rb, yb), 'bf', [Lb, yb - t, Rb, yb])}
		{cutP(rectD(L - w * 0.015, yt - w * 0.004, L + t + w * 0.01, yt + w * 0.05), 'll', [L - w * 0.015, yt, L + t + w * 0.01, yt + w * 0.05])}
		{cutP(rectD(R - t - w * 0.01, yt - w * 0.004, R + w * 0.015, yt + w * 0.05), 'lr', [R - t - w * 0.01, yt, R + w * 0.015, yt + w * 0.05])}
		{lidOn && <path d={`M${L - w * 0.01},${yt} L${x - nw / 2 - w * 0.015},${yt} L${x - nw / 2 - w * 0.015},${yl} L${L - w * 0.01},${yl} Z M${x + nw / 2 + w * 0.015},${yt} L${R + w * 0.01},${yt} L${R + w * 0.01},${yl} L${x + nw / 2 + w * 0.015},${yl} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={sw} />}
		{lidOn && rimLight(`M${L - w * 0.01},${yl} L${x - nw / 2 - w * 0.015},${yl} M${x + nw / 2 + w * 0.015},${yl} L${R + w * 0.01},${yl}`)}
		{earsN}
		{frostDots(L - w * 0.02, L + t * 2, yt, yb, 26, 7)}{frostDots(R - t * 2, R + w * 0.02, yt, yb, 26, 8)}
		{frostDots(L - w * 0.01, jx0 - t, yt - w * 0.02, yt + w * 0.03, 16, 10)}{frostDots(jx1 + t, R + w * 0.01, yt - w * 0.02, yt + w * 0.03, 16, 11)}
	</g>;
};
/* ---------- the fridge (generic, no brand): front view, the main door opening toward the viewer on the left ----------
   (x0, y0) top-left of the cabinet, w × h. open 0..1 (door swing), light 0..1 (its cold interior light), frost 0..1 (rime on
   the back wall, P2). children = what stands inside (drawn after the back wall, before the door). Freezer door on top, closed. */
export const fridgeGeom = (x0: number, y0: number, w: number, h: number) => { const fz = h * 0.3, m = w * 0.05, ix0 = x0 + m, ix1 = x0 + w - m, iy0 = y0 + fz + m * 0.6, iy1 = y0 + h - m * 0.8, inset = w * 0.12;
	return {fz, m, ix0, ix1, iy0, iy1, bx0: ix0 + inset, bx1: ix1 - inset, by0: iy0 + inset * 0.6, by1: iy1 - inset * 0.5, floorY: iy1 - inset * 0.25}; };
export const Fridge: React.FC<{x0: number; y0: number; w: number; h: number; open?: number; light?: number; frost?: number; children?: React.ReactNode; id?: string; t?: number}> = ({x0, y0, w, h, open = 1, light = 1, frost = 0, children, id = 'fg', t = 0}) => {
	const G = fridgeGeom(x0, y0, w, h), {fz, ix0, ix1, iy0, iy1, bx0, bx1, by0, by1} = G, r = w * 0.04;
	const L = (a: string, b: string, k: number) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, k))); return `rgb(${c.join(',')})`; };
	const back = L('#1A1513', '#A6C1CE', light), backD = L('#120E0D', '#6E8C9C', light), sideC = L('#16110F', '#86A3B2', light), floorC = L('#1C1715', '#C3D8E2', light);
	/* door: hinged on the cabinet's left edge, swung toward us: a trapezoid whose free edge is nearer (taller) */
	const sw2 = w * 0.42 * open, dyx = h * 0.04 * open, dx0 = x0, dTop = y0 + fz, dBot = y0 + h;
	const door = `M${dx0},${dTop} L${dx0 - sw2},${dTop - dyx * 1.4} L${dx0 - sw2},${dBot + dyx * 1.4} L${dx0},${dBot} Z`;
	return <g>
		<defs>
			<linearGradient id={`${id}cab`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8E8A84" /><stop offset="0.5" stopColor="#7A7671" /><stop offset="1" stopColor="#4E4B47" /></linearGradient>
			<linearGradient id={`${id}bk`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={back} /><stop offset="1" stopColor={backD} /></linearGradient>
			<radialGradient id={`${id}spill`}><stop offset="0" stopColor="#CFE6F1" stopOpacity={0.22 * light} /><stop offset="1" stopColor="#CFE6F1" stopOpacity="0" /></radialGradient>
		</defs>
		{/* the light spilling out onto the floor and the room */}
		{light > 0 && <ellipse cx={x0 + w * 0.45} cy={y0 + h + 10} rx={w * 1.1} ry={h * 0.22} fill={`url(#${id}spill)`} />}
		{/* the cabinet */}
		<rect x={x0} y={y0} width={w} height={h} rx={r} fill={`url(#${id}cab)`} />
		<rect x={x0} y={y0} width={w} height={h} rx={r} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
		{/* freezer door (closed) with its handle and the seam */}
		<rect x={x0 + 4} y={y0 + 4} width={w - 8} height={fz - 8} rx={r * 0.8} fill="#8A8681" />
		<rect x={x0 + 4} y={y0 + 4} width={w - 8} height={fz - 8} rx={r * 0.8} fill="none" stroke="#B8B3AC" strokeOpacity={0.35} strokeWidth={2} />
		<rect x={x0 + w * 0.08} y={y0 + fz - w * 0.2} width={w * 0.03} height={w * 0.16} rx={w * 0.015} fill="#5C5955" />
		{light < 1 && <rect x={x0} y={y0} width={w} height={h} rx={r} fill="#0A0605" opacity={0.45 * (1 - light)} />}
		{/* the open compartment: back wall, side walls, ceiling, floor (one-point perspective) */}
		<path d={`M${ix0},${iy0} L${ix1},${iy0} L${bx1},${by0} L${bx0},${by0} Z`} fill={sideC} />
		<path d={`M${ix0},${iy0} L${bx0},${by0} L${bx0},${by1} L${ix0},${iy1} Z`} fill={sideC} />
		<path d={`M${ix1},${iy0} L${bx1},${by0} L${bx1},${by1} L${ix1},${iy1} Z`} fill={L('#120E0D', '#7593A3', light)} />
		<rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} fill={`url(#${id}bk)`} />
		<path d={`M${ix0},${iy1} L${bx0},${by1} L${bx1},${by1} L${ix1},${iy1} Z`} fill={floorC} />
		{/* the lamp: a small strip in the ceiling */}
		<rect x={lerp(bx0, bx1, 0.3)} y={lerp(iy0, by0, 0.45)} width={(bx1 - bx0) * 0.4} height={w * 0.018} rx={w * 0.009} fill={light > 0.5 ? '#F4FBFF' : '#2A2522'} />
		{/* frost blooming on the back wall (P2) */}
		{frost > 0 && <g opacity={frost}>{Array.from({length: 14}, (_, i) => { const cx = lerp(bx0 + 20, bx1 - 20, rnd(i, 21)), cy = lerp(by0 + 20, by1 - 30, rnd(i, 22)), s = 18 + 26 * rnd(i, 23);
			return <g key={i} stroke="#F2FAFF" strokeWidth={2} strokeLinecap="round" opacity={0.55 + 0.4 * rnd(i, 24)} transform={`translate(${cx},${cy}) rotate(${30 * rnd(i, 25) + t * 4})`}>{[0, 60, 120].map((a) => <path key={a} d={`M${-s / 2},0 L${s / 2},0 M${s * 0.25},0 l${s * 0.1},${-s * 0.1} M${s * 0.25},0 l${s * 0.1},${s * 0.1} M${-s * 0.25},0 l${-s * 0.1},${-s * 0.1} M${-s * 0.25},0 l${-s * 0.1},${s * 0.1}`} transform={`rotate(${a})`} />)}</g>; })}
			<rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} fill="#EAF6FF" opacity={0.18} /></g>}
		{children}
		{/* the door seal edge and the open door (its inside lit a little by the compartment) */}
		<rect x={ix0 - 4} y={iy0 - 4} width={ix1 - ix0 + 8} height={iy1 - iy0 + 8} rx={6} fill="none" stroke="#3E3B38" strokeWidth={6} />
		{open > 0 && <g>
			<path d={door} fill={L('#4A4642', '#B9C6CC', 0.6 * light + 0.15)} stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
			<path d={`M${dx0 - sw2 * 0.12},${dTop + h * 0.08} L${dx0 - sw2 * 0.86},${dTop + h * 0.06 - dyx} L${dx0 - sw2 * 0.86},${dBot - h * 0.06 + dyx} L${dx0 - sw2 * 0.12},${dBot - h * 0.08} Z`} fill={L('#3A3633', '#9EB0B9', 0.6 * light + 0.1)} />
			{[0.32, 0.55, 0.78].map((u, i) => <path key={i} d={`M${dx0 - sw2 * 0.12},${lerp(dTop, dBot, u)} L${dx0 - sw2 * 0.86},${lerp(dTop - dyx, dBot + dyx, u) + 6}`} stroke={L('#5A5652', '#D9E6EC', 0.5 * light + 0.15)} strokeWidth={8} strokeLinecap="round" />)}
			<path d={`M${dx0 - sw2},${dTop - dyx * 1.4} L${dx0 - sw2},${dBot + dyx * 1.4}`} stroke="#C9C4BD" strokeOpacity={0.6} strokeWidth={4} />
			{light < 1 && <path d={door} fill="#0A0605" opacity={0.45 * (1 - light)} />}
		</g>}
	</g>; };

/* ---------- the walker and cast (ep50 rig; ep51 costumes) ---------- */
export const LOOKS51: Record<string, {look: Look4; label: string; note: string; qing?: boolean}> = {
	zhou: {look: {dress: 'robe', head: 'bun', build: 1.13}, label: '周', note: '絮袍 · 发髻'},
	zhanguo: {look: {dress: 'robe', head: 'bun'}, label: '战国', note: '深衣 · 发髻'},
	tang: {look: {dress: 'robe', head: 'futou'}, label: '唐', note: '圆领袍 · 幞头'},
	song: {look: {dress: 'tunic', legs: 'trousers', head: 'futou'}, label: '北宋', note: '短褐 · 软脚幞头'},
	qing: {look: {dress: 'robe', head: 'bald'}, label: '清', note: '长袍 · 瓜皮帽 · 辫', qing: true},
	today: {look: {dress: 'jacket', legs: 'trousers', head: 'short'}, label: '今天', note: '夹克 · 短发'},
};
/** the head frame of Figure4 (same maths), so extra headwear lands exactly on the skull: returns R(px, py) in screen space */
export const headFrame = (pose: Pose, x: number, g: number, h: number) => { const S = (n: string): P2 => [x + pose[n][0] * h, g - pose[n][1] * h];
	const n1 = S('Neck1'), hd = S('Head'), top = S('Top'), ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P2 = [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)], s = h * 0.93;
	return (px: number, py: number): P2 => { const c = Math.cos(ang), sn = Math.sin(ang); return [hc[0] + px * s * c - py * s * sn, hc[1] + px * s * sn + py * s * c]; }; };
/** Qing headwear: a plain round skullcap with a small knot, and the queue hanging down the back (one tone, respectful) */
export const qingParts = (pose: Pose, x: number, g: number, h: number, sway = 0): string[] => { const R = headFrame(pose, x, g, h), Q = (a: number, b: number) => { const p = R(a, b); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; };
	const cap = `M${Q(-0.069, -0.006)} Q${Q(-0.074, -0.084)} ${Q(-0.004, -0.086)} Q${Q(0.058, -0.082)} ${Q(0.062, -0.028)} L${Q(0.058, -0.018)} Q${Q(0.0, -0.032)} ${Q(-0.064, 0.004)} Z`;
	const k = R(-0.004, -0.098), kr = 0.013 * h * 0.93;
	const knot = `M${(k[0] - kr).toFixed(1)},${k[1].toFixed(1)} a${kr},${kr} 0 1,0 ${2 * kr},0 a${kr},${kr} 0 1,0 ${-2 * kr},0 Z`;
	const a = R(-0.06, 0.03), bw = 0.011 * h, len = 0.3 * h, ex = a[0] - 0.03 * h + sway * 0.02 * h, ey = a[1] + len;
	const queue = `M${(a[0] - bw).toFixed(1)},${a[1].toFixed(1)} Q${(a[0] - 0.035 * h).toFixed(1)},${(a[1] + len * 0.5).toFixed(1)} ${(ex - bw * 0.4).toFixed(1)},${ey.toFixed(1)} L${(ex + bw * 0.4).toFixed(1)},${(ey + 0.02 * h).toFixed(1)} Q${(a[0] - 0.012 * h).toFixed(1)},${(a[1] + len * 0.5).toFixed(1)} ${(a[0] + bw).toFixed(1)},${a[1].toFixed(1)} Z`;
	return [cap, knot, queue]; };
/** the walker / a cast member: ep50 RimFig plus the ep51 extras (Qing cap + queue) */
export const Walker51: React.FC<{x: number; g: number; h: number; pose: Pose; look: Look4; qing?: boolean; col?: string; flip?: boolean; rimO?: number; dx?: number; dy?: number; T?: number}> = ({x, g, h, pose, look, qing, col = B.lac, flip, rimO = 0.9, dx, dy, T = 0}) => {
	const ddx = dx ?? (flip ? -2.5 : 3), ddy = dy ?? -2.5;
	const extra = qing ? qingParts(pose, x, g, h, Math.sin(T * 2)) : [];
	const tf = flip ? `translate(${2 * x},0) scale(-1,1)` : undefined;
	return <g>
		{extra.length > 0 && <g transform={tf}><g transform={`translate(${flip ? -ddx : ddx},${ddy})`} opacity={rimO}>{extra.map((d, i) => <path key={i} d={d} fill={BG.rim} />)}</g></g>}
		<RimFig x={x} ground={g} h={h} pose={pose} look={look} col={col} flip={flip} dx={ddx} dy={ddy} rimO={rimO} T={T} />
		{extra.length > 0 && <g transform={tf}>{extra.map((d, i) => <path key={i} d={d} fill={col} />)}</g>}
	</g>; };

/* ---------- first-person forearm (ep50 hook arm): sleeve, one-tone forearm, a mitten hand closed on what it holds ----------
   el = where the forearm enters from the frame edge, wr = the wrist; the mitten extends past the wrist along the arm. size =
   forearm half-width at the wrist (~34 at full size). sleeve: the cuff colour band. thumb: 1 = thumb on the near side. */
export const Forearm: React.FC<{el: P2; wr: P2; size?: number; thumb?: 1 | -1; sleeve?: boolean; open?: boolean}> = ({el, wr, size = 34, thumb = 1, sleeve = true, open = false}) => {
	const d = Math.hypot(wr[0] - el[0], wr[1] - el[1]) || 1, ux = (wr[0] - el[0]) / d, uy = (wr[1] - el[1]) / d, nx = -uy, ny = ux, k = size / 34;
	const P = (a: number, b: number): string => `${(wr[0] + ux * a * k + nx * b * k * thumb).toFixed(1)},${(wr[1] + uy * a * k + ny * b * k * thumb).toFixed(1)}`;
	const Ld = d / k;
	const arm = (c: string, o?: boolean) => <g fill={c} transform={o ? 'translate(3,-2.5)' : undefined}>
		{sleeve && <path d={`M${P(-Ld - 40, 78)} Q${P(-Ld * 0.6, 82)} ${P(-120, 62)} L${P(-120, -62)} Q${P(-Ld * 0.6, -84)} ${P(-Ld - 40, -80)} Z`} />}
		<path d={`M${P(-130, 50)} Q${P(-60, 44)} ${P(0, 34)} L${P(0, -34)} Q${P(-60, -46)} ${P(-130, -52)} Z`} />
		{/* one closed mitten: the thumb is a soft bump on the near contour, never a separate lobe */}
		{open ? <path d={`M${P(-6, 36)} Q${P(30, 50)} ${P(56, 44)} Q${P(70, 40)} ${P(80, 28)} Q${P(96, 0)} ${P(84, -24)} Q${P(50, -44)} ${P(-6, -36)} Z`} />
			: <path d={`M${P(-6, 36)} Q${P(22, 48)} ${P(44, 46)} Q${P(58, 44)} ${P(62, 34)} Q${P(80, 30)} ${P(84, 6)} Q${P(86, -24)} ${P(64, -36)} Q${P(36, -46)} ${P(-6, -36)} Z`} />}
	</g>;
	return <g><g opacity={0.9}>{arm(BG.rim, true)}</g>{arm(B.lac)}{sleeve && <path d={`M${P(-120, 62)} L${P(-120, -62)}`} stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />}</g>; };

void H; void cl;

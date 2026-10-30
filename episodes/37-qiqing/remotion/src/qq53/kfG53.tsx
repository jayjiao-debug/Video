import React from 'react';
import {W, H, lerp, cl, rnd} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette, Pool} from '../qq50/styleB';
import {lookAt, proj, Cam} from './parts53';
import {Sword, SW, LB, bladeHW, LAT, PALE} from './props53';
import {birdGlyph} from './kfE53';
/* ep53 v3 key frames, part G — the NEW 勾践 thread (49.5–82.75 s, lines G1–G8), one continuous glide.
   After 「鸠浅，就是勾践」 the camera stays low over the polished front face and keeps gliding guard → tip (right → left on
   screen, ~1 cm/s). The polished bronze is a mirror: the story plays in it as a shadow play (皮影 read in our flat style:
   one-tone near-black silhouettes, a warm firelight glow behind them, a thin warm rim on the lit side, a few cut-out slits),
   one vignette per line, each sitting on the blade 4.2 cm further toward the tip than the last, so it slides into view as the
   camera arrives. The diamond lattice stays over the reflection (it is IN the metal): it is the scale cue, and it keeps the
   reflection reading as a reflection. The polished edge strips stay bright gold.
   How it is drawn: the blade face is a flat panel (cm × K px), mapped onto the screen by the homography of a real look-at
   camera (parts53 lookAt/proj) — so the lattice, the edge strips and the shadow play share one perspective, like the film's
   world geometry. The KF exports here are pictures only; KF53V3 lays the v3 subtitle, stamp and seal on top. */

export const K = 160;                       // panel px per cm
const PH = 6.4 * K;                         // panel height: the blade (≤ 4.8 cm) plus margins
const AYP = PH / 2;                         // the axis in the panel
const PXR = 60 * K;                         // panel x of the pommel end; a (cm from the pommel end) → x = PXR − a·K
export const ax = (a: number) => PXR - a * K;
export const wy = (w: number) => AYP - w * K;   // w cm across (w < 0 = the lower row, 越王鸠浅)

/* ---------- homography (as master53's title-on-glass) ---------- */
export const homogC = (q: [number, number][], w: number, h: number) => {
	const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
	const den = dx1 * dy2 - dy1 * dx2, g = (dx3 * dy2 - dy3 * dx2) / den, hh = (dx1 * dy3 - dy1 * dx3) / den;
	const a = (x1 - x0 + g * x1) / w, b = (x3 - x0 + hh * x3) / h, d = (y1 - y0 + g * y1) / w, e = (y3 - y0 + hh * y3) / h;
	return (u: number, v: number): [number, number] => { const z = g / w * u + hh / h * v + 1; return [(a * u + b * v + x0) / z, (d * u + e * v + y0) / z]; }; };
export const homog = (q: [number, number][], w: number, h: number) => {
	const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
	const den = dx1 * dy2 - dy1 * dx2, g = (dx3 * dy2 - dy3 * dx2) / den, hh = (dx1 * dy3 - dy1 * dx3) / den;
	const a = (x1 - x0 + g * x1) / w, b = (x3 - x0 + hh * x3) / h, c = x0, d = (y1 - y0 + g * y1) / w, e = (y3 - y0 + hh * y3) / h, f = y0;
	return `matrix3d(${a},${d},0,${g / w},${b},${e},0,${hh / h},0,0,1,0,${c},${f},0,1)`; };

/** the glide camera over the blade: centred on a (cm from the pommel end), height h cm, back d cm toward the viewer, side
    offset sx cm toward the guard (gives the recession toward the tip), lens f. Returns the screen quad of the panel window. */
export type Glide = {a: number; h: number; d: number; sx: number; f: number; half?: number; cy?: number; roll?: number; zoom?: number; dy?: number};
/** the hand-set glide quad for a ±10 cm window: blade level, gentle recession toward the tip (left), zoom about the frame centre */
const QUAD0: [number, number][] = [[-410, 340], [2330, 210], [2330, 1210], [-410, 1090]];
export const glideQuad = (g: Glide) => { const half = g.half ?? 10, X = (a: number) => ax(a) / K, Y = (w: number) => wy(w) / K;
	const x0 = ax(g.a + half), x1 = ax(g.a - half);
	if (g.zoom !== undefined) { const z = g.zoom, dy = g.dy ?? 0, q0 = QUAD0.map(([x, y]) => [960 + (x - 960) * z, 720 + dy + (y - 720) * z] as [number, number]);
		const c0 = homogC(q0, x1 - x0, PH)((x1 - x0) / 2, AYP), sh = 960 - c0[0];   // keep the camera's centre a at the frame's centre
		return {x0, ww: x1 - x0, q: q0.map(([x, y]) => [x + sh, y] as [number, number])}; }
	const tgt: [number, number, number] = [X(g.a), Y(0), 0], c: Cam = lookAt([tgt[0] + g.sx, tgt[1] + g.d, g.h], tgt, g.f, 960, g.cy ?? 600, g.roll ?? 0);
	const P = (x: number, y: number) => { const p = proj(c, [x / K, y / K, 0]); return [p[0], p[1]] as [number, number]; };
	return {x0, ww: x1 - x0, q: [P(x0, 0), P(x1, 0), P(x1, PH), P(x0, PH)]}; };

/** the panel window [x0, x0 + ww] mapped onto the screen quad */
export const Persp: React.FC<{g: Glide; children: React.ReactNode; defs?: React.ReactNode}> = ({g, children, defs}) => { const {x0, ww, q} = glideQuad(g);
	return <div style={{position: 'absolute', left: 0, top: 0, width: ww, height: PH, transformOrigin: '0 0', transform: homog(q, ww, PH)}}>
		<svg width={ww} height={PH} viewBox={`${x0} 0 ${ww} ${PH}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><defs>{defs}</defs>{children}</svg></div>; };

/* ---------- the blade in panel space ---------- */
const edgeW = (s: number) => 0.34 * cl(bladeHW(s) / 1.4, 0.25, 1);
const bladePath = (inset: boolean) => { const n = 120, pts = Array.from({length: n + 1}, (_, i) => { const s = LB * i / n, hw = inset ? Math.max(0, bladeHW(s) - edgeW(s)) : bladeHW(s); return [ax(SW.bladeA + s), wy(hw)]; });
	const back = [...pts].reverse().map(([x, y]) => [x, 2 * AYP - y]); return 'M' + [...pts, ...back].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z'; };
export const BLADE_OUT = bladePath(false), BLADE_IN = bladePath(true);
/** lattice lines only (drawn again over the reflection so it reads as IN the metal) */
export const LatticeOver: React.FC<{o?: number; a0?: number; a1?: number; pale?: number}> = ({o = 0.5, a0 = SW.bladeA, a1 = SW.L, pale = 0.16}) => { const La = 2.05, Lw = 1.18, out: React.ReactNode[] = [];
	const D = (i: number, j: number, sc: number) => { const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw, P = (a: number, w: number) => `${ax(a).toFixed(1)},${wy(w).toFixed(1)}`;
		return `M${P(ca - La / 2 * sc, cw)}L${P(ca, cw + Lw / 2 * sc)}L${P(ca + La / 2 * sc, cw)}L${P(ca, cw - Lw / 2 * sc)}Z`; };
	for (let i = -6; i <= 40; i++) for (let j = -6; j <= 40; j++) { const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw;
		if (ca < a0 - La || ca > a1 + La || Math.abs(cw) > 3.2) continue; const p = (i + j) % 2 === 0;
		out.push(<g key={`${i}_${j}`}>{p && <path d={D(i, j, 0.86)} fill={PALE} opacity={pale} />}<path d={D(i, j, 1)} fill="none" stroke={LAT} strokeWidth={0.12 * K} strokeOpacity={o} />{!p && <path d={D(i, j, 0.4)} fill={LAT} opacity={o * 0.7} />}</g>); }
	return <>{out}</>; };

/** an inscription mark (abstract bird-script ornament, as KF08), head toward the guard */
export const Mark: React.FC<{side: number; n: number; lit?: boolean}> = ({side, n, lit}) => { const x = ax(SW.bladeA + 2.2 + n * 1.5), y = wy(side * 0.92), s = 1.42 * K, gl = birdGlyph(s, n + (side < 0 ? 4 : 0) + 3), col = lit ? '#FFF2C8' : '#2A160A';
	return <g transform={`translate(${x},${y}) rotate(90)`} opacity={lit ? 1 : 0.85}>{gl.d.map((p, i) => <path key={i} d={p} fill="none" stroke={col} strokeWidth={0.085 * K} strokeLinecap="round" strokeLinejoin="round" />)}
		<circle cx={gl.head[0]} cy={gl.head[1]} r={gl.r} fill="none" stroke={col} strokeWidth={0.068 * K} /></g>; };

/* ---------- the shadow-play kit (local units: cm on the blade; x → the guard, y ↓ toward the near edge) ---------- */
const INK = '#160904', RIM = '#FFC26A', SLIT = '#FFB04C';
/** a silhouette: drawn once in the warm rim colour nudged toward the light (upper left), then in ink on top */
export const Sil: React.FC<{children: React.ReactNode; o?: number; rim?: number}> = ({children, o = 1, rim = 0.022}) => <g opacity={o}>
	<g fill={RIM} stroke={RIM} strokeWidth={0.004} strokeLinejoin="round" transform={`translate(${-rim},${-rim * 0.7})`} opacity={0.85}>{children}</g>
	<g fill={INK} stroke={INK} strokeWidth={0.004} strokeLinejoin="round">{children}</g></g>;
const T = (x: number, y: number, s: number, flip = false, rot = 0) => `translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`;
/** standing robed figure (深衣, topknot cap), feet at (0,0), height 1, facing +x; bow = forward lean of the upper body (deg) */
export const Stand: React.FC<{bow?: number; tall?: boolean; walk?: number}> = ({bow = 0, walk = 0}) => <g strokeWidth={0}>
	<path d={`M-0.22,0 L0.21,0 C${0.17 + walk * 0.05},-0.12 0.15,-0.26 0.14,-0.36 L-0.15,-0.40 C-0.16,-0.26 -0.18,-0.12 -0.22,0 Z`} />
	<g transform={`rotate(${bow} 0 -0.4)`}>
		<path d="M-0.15,-0.38 C-0.15,-0.56 -0.12,-0.70 -0.05,-0.79 L0.05,-0.79 C0.10,-0.72 0.14,-0.66 0.17,-0.60 C0.24,-0.56 0.27,-0.49 0.25,-0.42 C0.22,-0.38 0.17,-0.37 0.14,-0.38 Z" />
		<ellipse cx={0.01} cy={-0.865} rx={0.066} ry={0.078} />
		<path d="M-0.055,-0.925 C-0.04,-0.985 0.03,-0.995 0.05,-0.95 L0.045,-0.925 Z" /><path d="M-0.08,-0.955 L0.08,-0.965" strokeWidth={0.012} />
	</g></g>;
/** soldier: short robe, legs, a 戈 (dagger-axe) held upright, a shield */
export const Soldier: React.FC<{step?: number}> = ({step = 0}) => <g>
	<path d={`M-0.06,-0.32 L${-0.1 - step * 0.06},0 M0.04,-0.32 L${0.08 + step * 0.06},0`} fill="none" strokeWidth={0.06} strokeLinecap="round" />
	<path d="M-0.16,-0.30 L0.15,-0.30 C0.14,-0.5 0.13,-0.66 0.06,-0.78 L-0.06,-0.78 C-0.12,-0.68 -0.15,-0.5 -0.16,-0.30 Z" />
	<ellipse cx={0.01} cy={-0.86} rx={0.064} ry={0.075} /><path d="M-0.07,-0.9 C-0.05,-0.97 0.06,-0.98 0.08,-0.9 Z" />
	<path d="M0.17,-0.15 L0.20,-1.32" fill="none" strokeWidth={0.026} /><path d="M0.20,-1.25 L0.40,-1.21 L0.41,-1.18 L0.20,-1.19 Z" /><path d="M0.20,-1.32 L0.19,-1.40" fill="none" strokeWidth={0.02} />
	<rect x={0.06} y={-0.72} width={0.16} height={0.4} rx={0.05} /></g>;
/** kneeling envoy in 顿首, hands to the ground, facing +x */
export const Kneel: React.FC = () => <g>
	<path d="M-0.36,0 L0.08,0 C0.08,-0.08 0.04,-0.15 -0.04,-0.18 L-0.20,-0.30 C-0.29,-0.32 -0.36,-0.25 -0.37,-0.14 Z" />
	<path d="M-0.26,-0.26 C-0.20,-0.44 -0.02,-0.50 0.16,-0.43 L0.24,-0.34 C0.30,-0.22 0.36,-0.10 0.42,-0.01 L0.42,0 L0.12,0 C0.10,-0.1 0.04,-0.16 -0.06,-0.18 Z" />
	<ellipse cx={0.28} cy={-0.40} rx={0.068} ry={0.075} transform="rotate(30 0.28 -0.40)" /><path d="M0.30,-0.475 L0.37,-0.50 L0.375,-0.46 Z" /></g>;
/** the seated king (跽坐 on a dais, 冕-like board cap), facing +x */
export const KingSeat: React.FC = () => <g>
	<path d="M-0.27,0 L0.20,0 C0.22,-0.07 0.19,-0.16 0.11,-0.2 C0.13,-0.30 0.12,-0.42 0.08,-0.50 C0.05,-0.56 0.01,-0.6 -0.04,-0.62 L-0.11,-0.60 C-0.17,-0.50 -0.19,-0.36 -0.21,-0.24 C-0.27,-0.2 -0.29,-0.1 -0.27,0 Z" />
	<path d="M0.02,-0.50 C0.10,-0.42 0.18,-0.32 0.24,-0.22 L0.14,-0.19 C0.10,-0.28 0.05,-0.36 -0.01,-0.42 Z" />
	<ellipse cx={-0.02} cy={-0.70} rx={0.068} ry={0.078} />
	<path d="M-0.14,-0.80 L0.12,-0.81 L0.12,-0.785 L-0.14,-0.775 Z" /><path d="M-0.05,-0.80 L-0.05,-0.76 L0.03,-0.76 L0.03,-0.80 Z" />
	<path d="M0.115,-0.79 L0.115,-0.71 M-0.135,-0.78 L-0.135,-0.70" fill="none" strokeWidth={0.012} /></g>;
/** horse (profile, walking), hooves at y = 0, length ~1.1, withers ~0.62, facing +x */
export const Horse: React.FC = () => <g>
	<path d="M0.24,-0.56 C0.30,-0.66 0.36,-0.78 0.44,-0.86 C0.48,-0.90 0.53,-0.90 0.57,-0.86 C0.62,-0.80 0.68,-0.74 0.72,-0.68 C0.74,-0.64 0.72,-0.61 0.68,-0.62 L0.58,-0.66 C0.55,-0.62 0.50,-0.54 0.45,-0.45 C0.41,-0.38 0.34,-0.34 0.26,-0.33 L-0.26,-0.34 C-0.34,-0.34 -0.40,-0.40 -0.42,-0.48 C-0.43,-0.56 -0.38,-0.62 -0.28,-0.63 C-0.08,-0.66 0.10,-0.64 0.24,-0.56 Z" />
	<path d="M0.47,-0.88 L0.48,-0.95 L0.52,-0.89 Z" /><path d="M0.27,-0.62 C0.32,-0.72 0.38,-0.82 0.46,-0.88 L0.42,-0.82 C0.37,-0.76 0.33,-0.68 0.30,-0.60 Z" />
	<path d="M-0.40,-0.56 C-0.52,-0.52 -0.56,-0.36 -0.52,-0.20 C-0.49,-0.30 -0.46,-0.44 -0.39,-0.50 Z" />
	<path d="M0.31,-0.38 L0.38,-0.18 L0.37,0 M0.22,-0.38 L0.20,-0.18 L0.12,-0.01 M-0.26,-0.40 L-0.20,-0.2 L-0.22,0 M-0.34,-0.42 L-0.38,-0.2 L-0.46,-0.01" fill="none" strokeWidth={0.055} strokeLinecap="round" strokeLinejoin="round" />
	<path d="M0.58,-0.72 L0.36,-0.56 L0.12,-0.52" fill="none" strokeWidth={0.012} /></g>;
/** two-wheeled chariot with a canopy, the king standing in its box; pole forward to x ≈ 0.9 (the yoke) */
export const Chariot: React.FC = () => <g>
	<circle cx={-0.2} cy={-0.36} r={0.34} fill="none" strokeWidth={0.05} />
	{Array.from({length: 9}, (_, i) => { const a = i * Math.PI / 9; return <path key={i} d={`M${-0.2 + 0.33 * Math.cos(a)},${-0.36 + 0.33 * Math.sin(a)} L${-0.2 - 0.33 * Math.cos(a)},${-0.36 - 0.33 * Math.sin(a)}`} fill="none" strokeWidth={0.016} />; })}
	<circle cx={-0.2} cy={-0.36} r={0.05} />
	<path d="M-0.48,-0.70 L0.10,-0.70 L0.12,-0.46 L-0.48,-0.46 Z" />
	<path d="M0.10,-0.50 C0.40,-0.52 0.70,-0.62 0.92,-0.70" fill="none" strokeWidth={0.04} />
	<path d="M-0.30,-0.70 L-0.28,-1.08 C-0.26,-1.16 -0.14,-1.18 -0.10,-1.10 L-0.06,-0.70 Z" /><ellipse cx={-0.19} cy={-1.24} rx={0.062} ry={0.072} />
	<path d="M-0.30,-1.31 L-0.07,-1.32 L-0.07,-1.295 L-0.30,-1.285 Z" />
	<path d="M-0.36,-0.70 L-0.36,-1.52" fill="none" strokeWidth={0.024} /><path d="M-0.72,-1.40 Q-0.36,-1.62 0.0,-1.40 Q-0.36,-1.50 -0.72,-1.40 Z" /></g>;
/** the gall on its stand by the seat */
export const Gall: React.FC = () => <g><path d="M0,0 L0,-1.05 L0.2,-1.05" fill="none" strokeWidth={0.03} /><path d="M0.18,-1.05 L0.18,-0.86" fill="none" strokeWidth={0.008} />
	<path d="M0.18,-0.86 C0.24,-0.84 0.26,-0.74 0.22,-0.68 C0.20,-0.66 0.16,-0.66 0.14,-0.68 C0.10,-0.74 0.12,-0.84 0.18,-0.86 Z" /><path d="M-0.08,0 L0.08,0 L0.05,-0.04 L-0.05,-0.04 Z" /></g>;
/** a palace hall on its rammed-earth platform (straight hip roof: no upturned eaves, Spring and Autumn) — width 2, roof top at y −1.25 */
export const Palace: React.FC = () => <g>
	<path d="M-1.0,0 L1.0,0 L0.92,-0.22 L-0.92,-0.22 Z" /><path d="M-0.30,-0.22 L-0.22,-0.02 M0.30,-0.22 L0.22,-0.02" fill="none" strokeWidth={0.02} />
	{[-0.66, -0.33, 0, 0.33, 0.66].map((x) => <rect key={x} x={x - 0.035} y={-0.66} width={0.07} height={0.44} />)}
	<path d="M-0.82,-0.66 L0.82,-0.66 L0.86,-0.72 L0.56,-1.12 L-0.56,-1.12 L-0.86,-0.72 Z" /><path d="M-0.62,-1.12 L0.62,-1.12 L0.60,-1.20 L-0.60,-1.20 Z" /></g>;
/** 会稽山: layered peaks, base at y = 0, width 2.6 */
export const Mountain: React.FC = () => <g>
	<path d="M-1.4,0 C-1.1,-0.3 -0.85,-0.55 -0.6,-0.9 C-0.5,-1.02 -0.42,-0.98 -0.34,-0.9 C-0.24,-1.12 -0.1,-1.36 0.02,-1.42 C0.12,-1.36 0.28,-1.12 0.4,-0.98 C0.48,-1.04 0.56,-1.0 0.64,-0.9 C0.86,-0.6 1.1,-0.3 1.4,0 Z" /></g>;
/** a ring of 戈 tips (a besieging line), along an arc at the mountain's foot */
export const SpearRing: React.FC<{x0: number; x1: number; y: number; n: number; seed: number; lean?: number}> = ({x0, x1, y, n, seed, lean = 0}) => <g>
	{Array.from({length: n}, (_, i) => { const x = lerp(x0, x1, i / (n - 1)), h = 0.5 + 0.12 * rnd(i, seed), yy = y + 0.04 * Math.sin(i * 1.7);
		return <g key={i}><path d={`M${x},${yy} L${x + lean},${yy - h}`} fill="none" strokeWidth={0.02} /><path d={`M${x + lean},${yy - h} L${x + lean + 0.13},${yy - h + 0.03} L${x + lean + 0.13},${yy - h + 0.06} L${x + lean},${yy - h + 0.06} Z`} /></g>; })}
	<path d={`M${x0 - 0.1},${y + 0.02} Q${(x0 + x1) / 2},${y - 0.1} ${x1 + 0.1},${y + 0.02} L${x1 + 0.1},${y + 0.2} L${x0 - 0.1},${y + 0.2} Z`} /></g>;
/** water ripples band: level y, from x0 to x1 */
export const Water: React.FC<{x0: number; x1: number; y: number; depth?: number}> = ({x0, x1, y, depth = 0.8}) => { const n = 14, wv = Array.from({length: n + 1}, (_, i) => `${lerp(x0, x1, i / n).toFixed(3)},${(y + 0.025 * Math.sin(i * 1.9)).toFixed(3)}`);
	const id = `wm${Math.round(x0 * 100)}${Math.round(y * 100)}`;
	return <g><defs><linearGradient id={`${id}h`} gradientUnits="userSpaceOnUse" x1={x0} y1={0} x2={x1} y2={0}><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.12" stopColor="#fff" stopOpacity="1" /><stop offset="0.88" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
		<linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8763A" stopOpacity="0.9" /><stop offset="0.25" stopColor="#6A3416" stopOpacity="0.92" /><stop offset="1" stopColor="#2A1408" stopOpacity="0.95" /></linearGradient>
		<mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x0} y={y - 0.2} width={x1 - x0} height={depth + 0.4}><rect x={x0} y={y - 0.2} width={x1 - x0} height={depth + 0.4} fill={`url(#${id}h)`} /></mask></defs>
		<g mask={`url(#${id}m)`}><path d={`M${wv.join('L')} L${x1},${y + depth} L${x0},${y + depth} Z`} fill={`url(#${id}v)`} stroke="none" />
		<path d={`M${wv.join('L')}`} fill="none" stroke="#FFD08A" strokeOpacity={0.8} strokeWidth={0.02} /></g>
		{[0.07, 0.17, 0.3, 0.46].map((d, k) => <path key={k} d={`M${x0 + 0.1 + k * 0.08},${y + d} ${Array.from({length: 9}, (_, i) => `Q${lerp(x0, x1, (i + 0.25) / 9)},${y + d - 0.03} ${lerp(x0, x1, (i + 0.5) / 9)},${y + d}`).join(' ')}`} fill="none" stroke={SLIT} strokeOpacity={0.55 - k * 0.1} strokeWidth={0.018} />)}</g>; };
const Ground: React.FC<{x0: number; x1: number; y: number}> = ({x0, x1, y}) => <path d={`M${x0},${y} L${x1},${y} L${x1},${y + 0.6} L${x0},${y + 0.6} Z`} />;

/* ---------- the vignettes (one per line) ---------- */
export const VA = [12.4, 16.6, 20.8, 25.0, 29.2, 33.4, 37.6, 41.8].map((s) => SW.bladeA + s);   // centre of vignette i, cm from the pommel end
const GY = 1.2, VS = 1.5;   // the ground line (cm toward the near edge); the figures' scale about it
export type VigOpt = {k: number; dim?: number; lift?: number; step?: number};
const VIG: React.FC<{i: number; o: VigOpt}>[] = [
	/* G1 前494 the defeat: a broken army climbs 会稽山; the besiegers' 戈 close round its foot from both sides */
	({o}) => <g>
		<Sil><g transform={T(0.05, GY, 0.95)}><Mountain /></g></Sil>
		<Sil>{[[-0.34, 0.0], [-0.1, -0.24], [0.13, -0.48], [0.34, -0.72]].map(([x, y], i) => <g key={i} transform={T(x, GY + y - 0.02, 0.5, true, -6)}><Stand bow={16} walk={1} /></g>)}</Sil>
		<Sil><SpearRing x0={-1.75} x1={-0.95} y={GY + 0.02} n={7} seed={3} lean={0.04} /><SpearRing x0={1.0} x1={1.8} y={GY + 0.02} n={7} seed={5} lean={-0.04} /></Sil>
		<Sil>{[-1.7, -1.42].map((x, i) => <g key={i} transform={T(x, GY + 0.03, 0.55)}><Soldier step={i % 2} /></g>)}{[1.45, 1.73].map((x, i) => <g key={i} transform={T(x, GY + 0.03, 0.55, true)}><Soldier step={i % 2} /></g>)}</Sil>
		<Sil><Ground x0={-2.4} x1={2.4} y={GY} /></Sil>
	</g>,
	/* G2 the envoy on his knees before 夫差 (on a dais, a screen behind); behind the envoy, 勾践 and his wife, heads bowed */
	({o}) => <g>
		<Sil><path d={`M0.55,${GY} L1.6,${GY} L1.6,${GY - 0.14} L0.55,${GY - 0.14} Z`} />
			<path d={`M0.95,${GY - 0.14} L1.78,${GY - 0.14} L1.78,${GY - 1.32} L0.95,${GY - 1.32} Z`} fill="none" strokeWidth={0.04} /><path d={`M1.23,${GY - 0.14} L1.23,${GY - 1.32} M1.51,${GY - 0.14} L1.51,${GY - 1.32}`} fill="none" strokeWidth={0.025} />
			<g transform={T(1.12, GY - 0.14, 1.1, true)}><KingSeat /></g></Sil>
		<Sil><g transform={T(-0.05, GY, 0.95)}><Kneel /></g></Sil>
		<Sil><g transform={T(-0.85, GY, 0.98)}><Stand bow={22} /></g><g transform={T(-1.38, GY, 0.9)}><Stand bow={26} /></g>
			<path d={`M-1.62,${GY} C-1.6,${GY - 0.18} -1.56,${GY - 0.3} -1.5,${GY - 0.37} L-1.26,${GY - 0.37} C-1.22,${GY - 0.28} -1.18,${GY - 0.15} -1.14,${GY} Z`} /></Sil>
		<Sil><Ground x0={-2.4} x1={2.4} y={GY} /></Sil>
	</g>,
	/* G3 伍子胥 walks away from the throne; behind him 吴's palace sinks into rippling water (吴其为沼) */
	({o}) => { const lift = o.lift ?? 0.55; return <g>
		<defs><clipPath id="g3w"><rect x={-3} y={-3} width={6} height={3 + GY - lift} /></clipPath></defs>
		<g clipPath="url(#g3w)"><Sil><g transform={T(0.6, GY, 0.98)}><Palace /></g></Sil></g>
		<Water x0={-0.55} x1={1.8} y={GY - lift} depth={lift + 0.02} />
		<Sil><g transform={T(-1.15, GY, 1.2, true)}><Stand bow={4} walk={1} /></g></Sil>
		<Sil><Ground x0={-2.4} x1={-0.55} y={GY} /><Ground x0={1.8} x1={2.4} y={GY} /></Sil>
	</g>; },
	/* G4 three years in 吴: 勾践 on foot leads the horse of 夫差's chariot (no riding: chariots, as in the period) */
	({o}) => <g>
		<Sil><g transform={T(-0.85, GY, 0.95)}><Chariot /></g><g transform={T(0.38, GY, 1.0)}><Horse /></g></Sil>
		<Sil><g transform={T(1.3, GY, 0.85)}><Stand bow={18} walk={1} /></g><path d={`M1.39,${GY - 0.5} Q1.2,${GY - 0.6} 1.05,${GY - 0.72}`} fill="none" strokeWidth={0.015} /></Sil>
		<Sil><Ground x0={-2.4} x1={2.4} y={GY} /></Sil>
	</g>,
	/* G5 back home: alone on his mat, he leans to the gall hung by his seat and tastes it; a low table with a 豆 behind him */
	({o}) => <g>
		<Sil><path d={`M-0.5,${GY} L1.0,${GY} L1.0,${GY - 0.05} L-0.5,${GY - 0.05} Z`} />
			<g transform={T(0.3, GY - 0.05, 1.18, true)}><KingSeat /></g>
			<path d={`M0.24,${GY - 0.6} Q0.12,${GY - 0.72} 0.02,${GY - 0.84}`} fill="none" strokeWidth={0.06} strokeLinecap="round" />
			<g transform={T(-0.32, GY, 1.0)}><Gall /></g>
			<path d={`M1.1,${GY} L1.12,${GY - 0.3} M1.72,${GY} L1.7,${GY - 0.3}`} fill="none" strokeWidth={0.05} /><path d={`M1.02,${GY - 0.3} L1.8,${GY - 0.3} L1.8,${GY - 0.37} L1.02,${GY - 0.37} Z`} />
			<path d={`M1.33,${GY - 0.37} L1.35,${GY - 0.48} L1.25,${GY - 0.56} L1.53,${GY - 0.56} L1.43,${GY - 0.48} L1.45,${GY - 0.37} Z`} /></Sil>
		<Sil><Ground x0={-2.4} x1={2.4} y={GY} /></Sil>
	</g>,
	/* G6 「你忘了会稽之耻吗？」: closer on the same seat; 会稽山 and the ring of 戈 rise behind him, faint, like memory */
	({o}) => <g>
		<g opacity={0.3}><Sil rim={0.01}><g transform={T(0.1, GY - 0.08, 1.15)}><Mountain /></g><SpearRing x0={-1.6} x1={1.8} y={GY - 0.06} n={15} seed={9} /></Sil></g>
		<Sil><path d={`M-0.5,${GY} L1.0,${GY} L1.0,${GY - 0.05} L-0.5,${GY - 0.05} Z`} /><g transform={T(0.3, GY - 0.05, 1.18, true)}><KingSeat /></g><g transform={T(-0.32, GY, 1.0)}><Gall /></g></Sil>
		<Sil><Ground x0={-2.4} x1={2.4} y={GY} /></Sil>
	</g>,
	/* G7 前473: 越's ranks surge on; the palace goes under for good; 夫差 shown only as a fallen cap and a dropped sword */
	({o}) => <g>
		<defs><clipPath id="g7w"><rect x={-3} y={-3} width={6} height={3 + GY - 0.92} /></clipPath></defs>
		<g clipPath="url(#g7w)"><Sil><g transform={T(1.0, GY, 0.85)}><Palace /></g></Sil></g>
		<Water x0={0.12} x1={1.95} y={GY - 0.92} depth={0.94} />
		<Sil>{[-1.8, -1.48, -1.16, -0.84].map((x, i) => <g key={i} transform={T(x, GY + 0.02, 0.88)}><Soldier step={(i + 1) % 2} /></g>)}
			{[-1.64, -1.32, -1.0].map((x, i) => <g key={`b${i}`} opacity={0.6} transform={T(x, GY - 0.1, 0.72)}><Soldier step={i % 2} /></g>)}</Sil>
		<Sil><g transform={`translate(-0.3,${GY}) scale(1.5) translate(0.3,${-GY})`}><path d={`M-0.62,${GY - 0.02} L-0.08,${GY - 0.05} L-0.07,${GY - 0.02} L-0.61,${GY + 0.01} Z`} /><path d={`M-0.08,${GY - 0.07} L-0.02,${GY - 0.08} L-0.02,${GY} L-0.08,${GY + 0.01} Z`} />
			<g transform={`translate(-0.3,${GY - 0.04}) rotate(-24)`}><path d="M-0.07,0 L0.09,0 L0.09,-0.06 C0.05,-0.1 -0.04,-0.1 -0.07,-0.06 Z" /><path d="M-0.12,-0.095 L0.13,-0.105 L0.13,-0.083 L-0.12,-0.073 Z" /></g></g></Sil>
		<Sil><Ground x0={-2.4} x1={0.12} y={GY} /></Sil>
	</g>,
	/* G8 the story is over: the reflection clears; only an ember of the last scene, then plain bright bronze */
	({o}) => <g opacity={0.22}><Sil><g transform={T(0.0, GY, 0.9, true)}><Stand bow={10} walk={1} /></g></Sil></g>,
];

/** one vignette on the blade: firelight glow behind, silhouettes, a soft fade at its ends; k = how lit (0 plain bronze → 1) */
export const Vignette53: React.FC<{i: number; o: VigOpt}> = ({i, o}) => { const C = VIG[i], x = ax(VA[i]), id = `vg${i}`, dim = o.dim ?? 1;
	return <g opacity={o.k}>
		<defs>
			<radialGradient id={`${id}fire`} cx="0.5" cy="0.62" r="0.62"><stop offset="0" stopColor="#FFC56A" stopOpacity={0.95 * dim} /><stop offset="0.45" stopColor="#E08A38" stopOpacity={0.85 * dim} /><stop offset="0.8" stopColor="#7A3A14" stopOpacity={0.75} /><stop offset="1" stopColor="#2A1408" stopOpacity="0" /></radialGradient>
			<linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.16" stopColor="#fff" stopOpacity="1" /><stop offset="0.84" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
			<mask id={`${id}mk`} maskUnits="userSpaceOnUse" x={x - 2.9 * K} y={0} width={5.8 * K} height={PH}><rect x={x - 2.9 * K} y={0} width={5.8 * K} height={PH} fill={`url(#${id}m)`} /></mask>
		</defs>
		<g mask={`url(#${id}mk)`}>
			<rect x={x - 2.9 * K} y={wy(2.4)} width={5.8 * K} height={4.8 * K} fill="#1E0F07" opacity={0.78} />
			<ellipse cx={x} cy={wy(-0.1)} rx={2.7 * K} ry={2.1 * K} fill={`url(#${id}fire)`} />
			<g transform={`translate(${x},${AYP}) scale(${K}) translate(0,${GY}) scale(${VS}) translate(0,${-GY})`}><C i={i} o={o} /></g>
		</g></g>; };

/* ---------- a G key frame: the panel through the glide camera ---------- */
export const BladeGlide: React.FC<{g: Glide; vig: (i: number) => VigOpt | null; marks?: boolean; litMarks?: boolean; spec?: number; latO?: number; children?: React.ReactNode; under?: React.ReactNode}> = ({g, vig, marks = false, litMarks = false, spec = 0.25, latO = 0.2, children, under}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Lacquer sheen={0.18} id="gG" /><Pool id="gGp" x={980} y={640} rx={1100} ry={420} a={0.26} col="#FFB868" /></svg>
	<Persp g={g} defs={<><clipPath id="gIn"><path d={BLADE_IN} /></clipPath>
		<linearGradient id="gSpec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6DC" stopOpacity="0" /><stop offset="0.42" stopColor="#FFF6DC" stopOpacity={spec} /><stop offset="0.5" stopColor="#FFF6DC" stopOpacity={spec * 0.5} /><stop offset="0.62" stopColor="#FFF6DC" stopOpacity="0" /></linearGradient></>}>
		<path d={BLADE_OUT} transform={`translate(${0.25 * K},${0.35 * K})`} fill="#000" opacity={0.45} />
		<Sword x={PXR} y={AYP} k={K} rot={-90} id="gS" spec={0.15} marks={false} lw={0.55} />
		<g clipPath="url(#gIn)">
			{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const o = vig(i); return o && o.k > 0.01 ? <Vignette53 key={i} i={i} o={o} /> : null; })}
			{under}
			<LatticeOver o={latO} pale={0.05} />
			<rect x={ax(SW.L)} y={wy(2.4)} width={(SW.L - SW.bladeA) * K} height={4.8 * K} fill="url(#gSpec)" />
		</g>
		{marks && [1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => <Mark key={`${side}${n}`} side={side} n={n} lit={litMarks && side === -1 && n >= 2} />))}
		<path d={`M${ax(SW.bladeA + 0.2)},${wy(0.0)} L${ax(SW.L - 1.2)},${wy(0.0)}`} stroke="#B8843E" strokeWidth={0.1 * K} strokeOpacity={0.35} /><path d={`M${ax(SW.bladeA + 0.2)},${wy(0.04)} L${ax(SW.L - 1.2)},${wy(0.03)}`} stroke="#F4D088" strokeWidth={0.02 * K} strokeOpacity={0.45} />
		{children}
	</Persp>
	<svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none'}}><LacDefs /><Vignette id="gGv" a={0.5} /></svg>
</>;

/* the eight G key frames: the camera centre a, the vignettes' state. Glide: low (h 9 cm) and 12 cm back, offset toward the
   guard so the blade recedes toward the tip, where the next vignette is coming from. */
const GL = (a: number, extra: Partial<Glide> = {}): Glide => ({a, h: 14, d: 6.2, sx: 2.6, f: 2250, zoom: 1.16, dy: -30, ...extra});
const lit = (cur: number, prevK = 0.22, extra: Partial<VigOpt> = {}) => (i: number): VigOpt | null => i === cur ? {k: 1, ...extra} : i === cur - 1 ? {k: prevK} : null;
export const KFG1: React.FC = () => <BladeGlide g={GL(VA[0] - 2.1)} vig={(i) => (i === 0 ? {k: 0.92} : null)} marks litMarks />;
export const KFG2: React.FC = () => <BladeGlide g={GL(VA[1] - 0.4)} vig={lit(1)} />;
export const KFG3: React.FC = () => <BladeGlide g={GL(VA[2] - 0.4)} vig={lit(2, 0.22, {lift: 0.55})} />;
export const KFG4: React.FC = () => <BladeGlide g={GL(VA[3] - 0.4)} vig={lit(3)} />;
export const KFG5: React.FC = () => <BladeGlide g={GL(VA[4] - 0.3)} vig={lit(4, 0.22, {dim: 0.8})} />;
export const KFG6: React.FC = () => <BladeGlide g={GL(VA[5] - 0.2, {zoom: 1.45, dy: -10})} vig={lit(5, 0.1)} />;
export const KFG7: React.FC = () => <BladeGlide g={GL(VA[6] - 0.4)} vig={lit(6)} />;
export const KFG8: React.FC = () => <BladeGlide g={GL(VA[7] - 0.6)} vig={lit(7, 0.12)} spec={0.55} latO={0.3} />;
void H;

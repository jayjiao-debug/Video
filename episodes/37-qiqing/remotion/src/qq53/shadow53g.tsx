import React from 'react';
import {lerp, cl, seg} from '../qq50/kit50';
import {sstep, sstep5} from './cam53';
import {Sil, Stand, Soldier, KingSeat, Palace, Mountain, SpearRing} from './kfG53';
import {A, LBLADE, hwS, edgeS, LAT, latCells, cellQuad, METAL} from './swordspec53s';
import {GS, GA, vigK} from './cam53g';
import {KingDraw53g5} from './king53g5';
/* ep53 v3 · TakeG: the 勾践 story as a shadow play in the polished face (皮影 read in our flat style: one-tone near-black
   silhouettes, a thin warm firelight rim, a firelight glow behind). Starts from kfG53's kit (Sil, Stand, Soldier, KingSeat,
   Palace, Mountain, SpearRing), with the fact-check fixes: G2 the envoy kneels ALONE before 夫差; G4 勾践 walks AHEAD of the
   chariot horses (前马), hands free, facing the road; G5 the gall is PLACED on a small stemmed stand beside his mat, a little above
   his eye line (置胆於坐); G7 夫差's end only as a fallen cap and a dropped sword (no rope, no blade at a throat).
   Panel space (the reflection is drawn on a flat panel laid on the blade face and mapped to the screen by the camera's homography):
   x = (PA − a)·PK (toward the guard = screen right), y = (PW − w)·PK (screen down). Scene-local units: cm, x → the guard,
   y ↓ toward the lower edge, the ground line at GY (cm below the axis). */
export const PK = 160, PA = 60, PW = 3;
export const px = (a: number) => (PA - a) * PK, py = (w: number) => (PW - w) * PK;
const GY = 1.2;
/* fix4 (review #6): each scene stands on the blade's lower inner edge (its ground WG cm below the axis) and is scaled so the
   tallest HEAD (scene units above the ground: HEAD) stays below the ridge with a margin, capped by the scene's width (SCX);
   FX = the scene's horizontal shift (scene units) to centre it in its window */
const HEAD = [1.06, 1.04, 0.97, 1.06, 1.0, 1, 0.86], SCX = [1.34, 1.6, 1.62, 1.55, 1.6, 1.6, 1.42], FX = [0, -0.3, -0.25, -0.12, -0.62, 0, 0.12];
const innerW = (a: number) => Math.max(0, hwS(cl(a * 10 - A.blade0, 0, LBLADE)) - edgeS(cl(a * 10 - A.blade0, 0, LBLADE))) / 10;
/** scene i's ground (cm below the axis) and its scale (cm per scene unit) */
export const fitG = (i: number) => { const wg = innerW(GA[i] + 1.6) - 0.1; return {wg, sc: Math.min(SCX[i], (wg - 0.17) / HEAD[i])}; };
const INK = '#160904', RIM = '#FFC26A', SLIT = '#FFB04C';
const T = (x: number, y: number, s: number, flip = false, rot = 0) => `translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`;
const Ground: React.FC<{x0: number; x1: number; y?: number}> = ({x0, x1, y = GY}) => <path d={`M${x0},${y} L${x1},${y} L${x1},${y + 0.6} L${x0},${y + 0.6} Z`} />;
const f3 = (v: number) => v.toFixed(3);

/* ---------- moving pieces (new in G) ---------- */
/** a kneeling envoy, facing +x: the legs stay; the upper body bows about the hip (bow 0 = upright, 1 = 顿首, head to the ground) */
const KneelG: React.FC<{bow: number}> = ({bow}) => <g>
	<path d="M-0.40,0 L0.06,0 C0.07,-0.06 0.03,-0.12 -0.05,-0.15 L-0.24,-0.27 C-0.33,-0.29 -0.40,-0.22 -0.41,-0.11 Z" />
	<g transform={`rotate(${lerp(8, 74, bow)} -0.26 -0.22)`}>
		<path d="M-0.36,-0.20 C-0.37,-0.38 -0.33,-0.55 -0.23,-0.64 L-0.12,-0.645 C-0.06,-0.58 -0.03,-0.50 -0.02,-0.43 L0.07,-0.33 C0.10,-0.29 0.07,-0.25 0.01,-0.25 L-0.12,-0.25 C-0.16,-0.21 -0.24,-0.19 -0.36,-0.20 Z" />
		<ellipse cx={-0.165} cy={-0.725} rx={0.066} ry={0.076} /><path d="M-0.215,-0.785 C-0.20,-0.845 -0.13,-0.85 -0.11,-0.80 L-0.115,-0.78 Z" /></g></g>;
/** horse in profile, walking (gait phase ph, radians), hooves on y = 0, facing +x (kfG53 Horse with moving legs) */
const HorseG: React.FC<{ph: number}> = ({ph}) => { const leg = (x0: number, y0: number, xm: number, xf: number, p: number) => { const s = Math.sin(ph + p), lift = Math.max(0, Math.cos(ph + p)) * 0.05;
	return `M${f3(x0)},${y0} L${f3(xm + 0.05 * s)},${f3(-0.18 - lift * 0.4)} L${f3(xf + 0.09 * s)},${f3(-lift)}`; };
	return <g>
		<path d="M0.24,-0.56 C0.30,-0.66 0.36,-0.78 0.44,-0.86 C0.48,-0.90 0.53,-0.90 0.57,-0.86 C0.62,-0.80 0.68,-0.74 0.72,-0.68 C0.74,-0.64 0.72,-0.61 0.68,-0.62 L0.58,-0.66 C0.55,-0.62 0.50,-0.54 0.45,-0.45 C0.41,-0.38 0.34,-0.34 0.26,-0.33 L-0.26,-0.34 C-0.34,-0.34 -0.40,-0.40 -0.42,-0.48 C-0.43,-0.56 -0.38,-0.62 -0.28,-0.63 C-0.08,-0.66 0.10,-0.64 0.24,-0.56 Z" />
		<path d="M0.47,-0.88 L0.48,-0.95 L0.52,-0.89 Z" /><path d="M0.27,-0.62 C0.32,-0.72 0.38,-0.82 0.46,-0.88 L0.42,-0.82 C0.37,-0.76 0.33,-0.68 0.30,-0.60 Z" />
		<path d={`M-0.40,-0.56 C-0.52,-0.52 ${f3(-0.56 + 0.02 * Math.sin(ph * 0.5))},-0.36 -0.52,-0.20 C-0.49,-0.30 -0.46,-0.44 -0.39,-0.50 Z`} />
		<path d={[leg(0.31, -0.38, 0.38, 0.37, 0), leg(0.22, -0.38, 0.20, 0.14, Math.PI), leg(-0.26, -0.40, -0.20, -0.22, Math.PI * 0.5), leg(-0.34, -0.42, -0.38, -0.44, Math.PI * 1.5)].join(' ')} fill="none" strokeWidth={0.055} strokeLinecap="round" strokeLinejoin="round" />
		<path d="M0.58,-0.72 L0.36,-0.56 L0.12,-0.52" fill="none" strokeWidth={0.012} /></g>; };
/** two-wheeled chariot with a canopy, 夫差 standing in its box; pole forward to the yoke at x ≈ 0.92; wheel turned by rot (deg) */
const ChariotG: React.FC<{rot: number}> = ({rot}) => <g>
	<g transform={`rotate(${rot} -0.2 -0.36)`}><circle cx={-0.2} cy={-0.36} r={0.34} fill="none" strokeWidth={0.05} />
		{Array.from({length: 9}, (_, i) => { const a = i * Math.PI / 9; return <path key={i} d={`M${f3(-0.2 + 0.33 * Math.cos(a))},${f3(-0.36 + 0.33 * Math.sin(a))} L${f3(-0.2 - 0.33 * Math.cos(a))},${f3(-0.36 - 0.33 * Math.sin(a))}`} fill="none" strokeWidth={0.016} />; })}</g>
	<circle cx={-0.2} cy={-0.36} r={0.05} />
	<path d="M-0.48,-0.70 L0.10,-0.70 L0.12,-0.46 L-0.48,-0.46 Z" />
	<path d="M0.10,-0.50 C0.40,-0.52 0.70,-0.62 0.92,-0.70" fill="none" strokeWidth={0.04} />
	<path d="M-0.30,-0.70 L-0.28,-1.08 C-0.26,-1.16 -0.14,-1.18 -0.10,-1.10 L-0.06,-0.70 Z" /><ellipse cx={-0.19} cy={-1.24} rx={0.062} ry={0.072} />
	<path d="M-0.30,-1.31 L-0.07,-1.32 L-0.07,-1.295 L-0.30,-1.285 Z" />
	<path d="M-0.36,-0.70 L-0.36,-1.52" fill="none" strokeWidth={0.024} /><path d="M-0.72,-1.40 Q-0.36,-1.62 0.0,-1.40 Q-0.36,-1.50 -0.72,-1.40 Z" /></g>;
/** the gall PLACED on a small stemmed stand (a 豆-like pedestal), its top a little above a seated man's eye line; feet at (0,0) */
const GallStand: React.FC = () => <g>
	<path d="M-0.13,0 L0.13,0 L0.08,-0.05 L0.025,-0.07 L0.022,-0.80 L0.10,-0.83 L0.12,-0.88 L-0.12,-0.88 L-0.10,-0.83 L-0.022,-0.80 L-0.025,-0.07 L-0.08,-0.05 Z" />
	<path d="M0,-0.875 C0.07,-0.88 0.10,-0.95 0.08,-1.01 C0.06,-1.06 0.02,-1.08 -0.005,-1.10 C-0.03,-1.07 -0.07,-1.03 -0.075,-0.97 C-0.08,-0.92 -0.05,-0.88 0,-0.875 Z" />
	<path d="M-0.005,-1.10 C0.0,-1.13 0.02,-1.15 0.04,-1.155" fill="none" strokeWidth={0.014} /></g>;
/** rippling water from x0 to x1, level y (scene units); ph = the ripple phase (its own clock) */
const WaterG: React.FC<{id: string; x0: number; x1: number; y: number; depth: number; ph: number}> = ({id, x0, x1, y, depth, ph}) => { const n = 16;
	const wv = Array.from({length: n + 1}, (_, i) => `${f3(lerp(x0, x1, i / n))},${f3(y + 0.022 * Math.sin(i * 1.9 + ph))}`);
	return <g><defs><linearGradient id={`${id}h`} gradientUnits="userSpaceOnUse" x1={x0} y1={0} x2={x1} y2={0}><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.12" stopColor="#fff" stopOpacity="1" /><stop offset="0.88" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
		<linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8763A" stopOpacity="0.9" /><stop offset="0.25" stopColor="#6A3416" stopOpacity="0.94" /><stop offset="1" stopColor="#2A1408" stopOpacity="0.97" /></linearGradient>
		<mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x0} y={y - 0.2} width={x1 - x0} height={depth + 0.4}><rect x={x0} y={y - 0.2} width={x1 - x0} height={depth + 0.4} fill={`url(#${id}h)`} /></mask></defs>
		<g mask={`url(#${id}m)`}><path d={`M${wv.join('L')} L${x1},${y + depth} L${x0},${y + depth} Z`} fill={`url(#${id}v)`} stroke="none" />
			<path d={`M${wv.join('L')}`} fill="none" stroke="#FFD08A" strokeOpacity={0.8} strokeWidth={0.02} />
			{[0.08, 0.18, 0.31, 0.46].filter((d) => d < depth).map((d, k) => <path key={k} d={`M${f3(x0 + 0.1 + k * 0.08 + 0.05 * Math.sin(ph * 0.7 + k))},${f3(y + d)} ${Array.from({length: 9}, (_, i) => `Q${f3(lerp(x0, x1, (i + 0.25) / 9))},${f3(y + d - 0.03)} ${f3(lerp(x0, x1, (i + 0.5) / 9))},${f3(y + d)}`).join(' ')}`} fill="none" stroke={SLIT} strokeOpacity={0.55 - k * 0.1} strokeWidth={0.018} />)}</g></g>; };
const sinkClip = (id: string, y: number) => <defs><clipPath id={id}><rect x={-3} y={-3} width={6} height={3 + y} /></clipPath></defs>;

/* ---------- the scenes (i = line − 1; t = film seconds) ---------- */
const G1: React.FC<{t: number}> = ({t}) => { const close = sstep(seg(t, 53.3, 55.6)), climb = sstep(seg(t, 52.4, 56.4));
	return <g>
		<g opacity={0.5}><Sil rim={0.012}><g transform={T(0, GY, 1.0)}><Mountain /></g></Sil></g>
		<Sil>{[[-0.5, 0.0], [-0.24, -0.12], [0.02, -0.24], [0.28, -0.34]].map(([x, y], i) => <g key={i} transform={T(x + 0.06 * climb, GY + y - 0.02 - 0.04 * climb, 0.68, true, -5)}><Stand bow={14} walk={Math.sin(t * 4 + i)} /></g>)}</Sil>
		<Sil><SpearRing x0={lerp(-1.95, -1.6, close)} x1={lerp(-1.4, -1.05, close)} y={GY + 0.02} n={5} seed={3} lean={0.04} /><SpearRing x0={lerp(1.05, 0.7, close)} x1={lerp(1.6, 1.25, close)} y={GY + 0.02} n={5} seed={5} lean={-0.04} /></Sil>
		<Sil>{[-1.78].map((x, i) => <g key={i} transform={T(x - 0.3 * (1 - close), GY + 0.03, 0.66)}><Soldier step={Math.sin(t * 5 + i * 2) * (1 - close * 0.8)} /></g>)}{[1.78].map((x, i) => <g key={i} transform={T(x + 0.3 * (1 - close), GY + 0.03, 0.66, true)}><Soldier step={Math.sin(t * 5 + i * 2 + 1) * (1 - close * 0.8)} /></g>)}</Sil>
		<Sil><Ground x0={-2.6} x1={2.6} /></Sil></g>; };
/** G2: the envoy alone on his knees before 夫差 (on a dais, a screen behind him); the bow lands on DA(26) 59.312 */
const G2: React.FC<{t: number}> = ({t}) => { const bow = Math.round(t * 30) >= Math.round(59.312 * 30) ? 1 - 0.08 * sstep(seg(t, 60.3, 61.4)) : 0.16 * sstep(seg(t, 57.2, 58.4)) + 0.84 * sstep5(seg(t, 59.312 - 0.3, 59.312));
	return <g>
		<Sil><path d={`M0.55,${GY} L1.6,${GY} L1.6,${GY - 0.14} L0.55,${GY - 0.14} Z`} />
			<path d={`M0.95,${GY - 0.14} L1.78,${GY - 0.14} L1.78,${GY - 1.16} L0.95,${GY - 1.16} Z`} fill="none" strokeWidth={0.04} /><path d={`M1.23,${GY - 0.14} L1.23,${GY - 1.16} M1.51,${GY - 0.14} L1.51,${GY - 1.16}`} fill="none" strokeWidth={0.025} />
			<g transform={T(1.12, GY - 0.14, 1.1, true)}><KingSeat /></g></Sil>
		<Sil><g transform={T(-0.22 + 0.04 * sstep(seg(t, 57.0, 59.3)), GY, 1.0)}><KneelG bow={bow} /></g></Sil>
		<Sil><Ground x0={-2.6} x1={2.6} /></Sil></g>; };
/** G3: 伍子胥 walks away to the left; behind him 吴's palace sinks into rippling water (吴其为沼, a metaphor) */
const G3: React.FC<{t: number}> = ({t}) => { const lift = 0.06 + 0.5 * sstep(seg(t, 63.2, 66.3)), wx = -0.75 - 0.5 * seg(t, 61.8, 67.4);
	return <g>{sinkClip('g53g3w', GY - lift)}
		<g clipPath="url(#g53g3w)"><Sil><g transform={T(0.7, GY + 0.04 * sstep(seg(t, 63.2, 66.3)), 0.98)}><Palace /></g></Sil></g>
		<WaterG id="g53g3" x0={-0.45} x1={1.9} y={GY - lift} depth={lift + 0.02} ph={t * 1.3} />
		<Sil><g transform={T(wx, GY, 1.0, true)}><Stand bow={4} walk={Math.sin(t * 3.4)} /></g></Sil>
		<Sil><Ground x0={-2.6} x1={-0.45} /><Ground x0={1.9} x1={2.6} /></Sil></g>; };
/** G4: in 吴, 夫差 rides his chariot; 勾践 walks a pace AHEAD of the horses (前马), hands free, facing the road */
const G4: React.FC<{t: number}> = ({t}) => { const dx = 0.25 * seg(t, 66.6, 72.4), ph = t * 6.2;
	return <g transform={`translate(${f3(dx)},0)`}>
		<Sil><g transform={T(-0.92, GY, 0.8)}><ChariotG rot={t * 70} /></g>
			<g transform={T(0.04, GY, 0.9)}><HorseG ph={ph} /></g></Sil>
		<Sil><g transform={T(1.0, GY, 1.0)}><Stand bow={10} walk={Math.sin(ph * 0.5)} /></g></Sil>
		<Sil><Ground x0={-2.9} x1={2.4} /></Sil></g>; };
/** G5 + G6 (the same seat): 勾践 alone on his mat, the gall on its stand beside him; on [尝] (DA(33) 75.159) he leans up to it;
    in G6 (the push-in) 会稽山 and the ring of 戈 rise faint behind him, like a memory */
const TASTE = 75.159;
const G5: React.FC<{t: number}> = ({t}) => { const reach = Math.round(t * 30) >= Math.round(TASTE * 30) ? 1 - sstep(seg(t, TASTE + 1.3, TASTE + 2.4)) : sstep5(seg(t, TASTE - 0.55, TASTE)), mem = vigK(5, t);
	const lean = -9 * reach - 2 * sstep(seg(t, 72.0, 74.0));
	return <g>
		{mem > 0.01 && <g opacity={0.5 * mem}><Sil rim={0.014}><g transform={T(0.15, GY - 0.08 - 0.06 * mem, 1.15)}><Mountain /></g><SpearRing x0={-1.7} x1={1.9} y={GY - 0.06} n={15} seed={9} /></Sil></g>}
		<Sil><path d={`M-0.45,${GY} L1.0,${GY} L1.0,${GY - 0.05} L-0.45,${GY - 0.05} Z`} />
			<g transform={`rotate(${f3(lean)} 0.3 ${GY - 0.05})`}><g transform={T(0.3, GY - 0.05, 1.18, true)}><KingSeat /></g>
				<path d={`M0.24,${GY - 0.62} Q${f3(lerp(0.18, 0.08, reach))},${f3(GY - lerp(0.5, 0.86, reach))} ${f3(lerp(0.12, -0.12, reach))},${f3(GY - lerp(0.44, 1.02, reach))}`} fill="none" strokeWidth={0.06} strokeLinecap="round" /></g>
			<g transform={T(-0.3, GY, 1.0)}><GallStand /></g>
			<path d={`M1.1,${GY} L1.12,${GY - 0.3} M1.72,${GY} L1.7,${GY - 0.3}`} fill="none" strokeWidth={0.05} /><path d={`M1.02,${GY - 0.3} L1.8,${GY - 0.3} L1.8,${GY - 0.37} L1.02,${GY - 0.37} Z`} />
			<path d={`M1.33,${GY - 0.37} L1.35,${GY - 0.48} L1.25,${GY - 0.56} L1.53,${GY - 0.56} L1.43,${GY - 0.48} L1.45,${GY - 0.37} Z`} /></Sil>
		<Sil><Ground x0={-2.6} x1={2.6} /></Sil></g>; };
/** G7: 前473, 越's ranks surge on; the palace goes under for good, the roof on DA(38) 86.484; 夫差: a fallen cap and a dropped sword.
    fix4: ONE solid rank (no half-opacity rank behind it), advancing a pace on each beat (P3 grid, the pace lands ON the beat
    frame, held in between, legs alternating per pace); the cap is a clear 冕 (a flat board with bead strings, tipped over) with
    the sword lying beside it on a lit patch */
const UNDER = 86.484, BEAT0 = 0.4432, P3 = 0.56605;
const PACE0 = Math.ceil((81.7 - BEAT0) / P3), PACE1 = Math.floor((86.3 - BEAT0) / P3);
/** paces taken by t (continuous only over the 3 frames before each beat frame) */
const pacesAt = (t: number) => { let n = 0; for (let k = PACE0; k <= PACE1; k++) n += sstep(cl((t * 30 - (Math.round((BEAT0 + P3 * k) * 30) - 3)) / 3, 0, 1)); return n; };
/** a 冕 tipped onto its side: the crown (a short cylinder) with the flat board (綖) across its top, bead strings (旒) hanging
    from the board's front and back ends; origin = where the crown touches the ground; ~0.5 long */
const MianG: React.FC = () => <g transform="rotate(-16)">
	<path d="M-0.10,0 L0.10,0 L0.10,-0.15 C0.06,-0.19 -0.06,-0.19 -0.10,-0.15 Z" />
	<path d="M-0.27,-0.205 L0.27,-0.225 L0.27,-0.18 L-0.27,-0.16 Z" />
	{[-0.25, -0.215, -0.18, 0.18, 0.215, 0.25].map((x, i) => <g key={i}><path d={`M${x},${-0.17 - 0.03 * (x > 0 ? 1 : 0)} L${x},${-0.05 - 0.03 * (x > 0 ? 1 : 0)}`} fill="none" strokeWidth={0.012} />
		{[0, 1, 2].map((k) => <circle key={k} cx={x} cy={-0.135 + k * 0.038 - 0.03 * (x > 0 ? 1 : 0)} r={0.016} />)}</g>)}</g>;
/** a sword lying flat, pointing −x: blade to a point, a guard bar, grip, round pommel; ~0.9 long, hilt at the origin */
const SwordDown: React.FC = () => <g>
	<path d="M-0.10,-0.05 L-0.76,-0.04 L-0.86,-0.018 L-0.76,0.004 L-0.10,0.014 Z" />
	<path d="M-0.11,-0.10 L-0.06,-0.10 L-0.06,0.06 L-0.11,0.06 Z" /><path d="M-0.06,-0.032 L0.10,-0.030 L0.10,-0.006 L-0.06,-0.004 Z" />
	<circle cx={0.125} cy={-0.018} r={0.034} /></g>;
/** v3.1 (owner note 1:22): 勾践 leads, LEFT of his ranks, 1.2 × a front-rank soldier, drawing the sword (king53g5) */
const KX = -2.3;
const G7: React.FC<{t: number}> = ({t}) => { const under = Math.round(t * 30) >= Math.round(UNDER * 30), lift = under ? 1.36 : lerp(0.25, 1.36, sstep(seg(t, 82.6, UNDER)));
	const np = pacesAt(t), adv = 0.05 * np, step = Math.cos(Math.PI * np) * (1 - 0.6 * sstep(cl(np - (PACE1 - PACE0), 0, 1)));
	return <g>{sinkClip('g53g7w', GY - lift)}
		<g clipPath="url(#g53g7w)"><Sil><g transform={T(1.22, GY, 0.64)}><Palace /></g></Sil></g>
		<WaterG id="g53g7" x0={0.6} x1={1.9} y={GY - lift} depth={lift + 0.02} ph={t * 1.3} />
		<ellipse cx={0.1} cy={GY - 0.16} rx={0.72} ry={0.42} fill="url(#g53gPatch)" />
		<Sil><g transform={`translate(${f3(adv)},0)`}>{[-1.69, -1.41, -1.13].map((x, i) => <g key={`b${i}`} transform={T(x + 0.14, GY - 0.05, 0.8)}><Soldier step={-step} /></g>)}
			{[-1.62, -1.34, -1.06].map((x, i) => <g key={i} transform={T(x, GY + 0.02, 0.9)}><Soldier step={step} /></g>)}</g></Sil>
		<g transform={T(KX, GY + 0.03, 1.07)}><KingDraw53g5 t={t} /></g>
		<Sil><g transform={`translate(0.4,${GY}) scale(1.05)`}><MianG /></g><g transform={`translate(-0.3,${GY - 0.07}) rotate(8) scale(-0.78,0.85)`}><SwordDown /></g></Sil>
		<Sil><Ground x0={-2.6} x1={0.6} /><Ground x0={1.9} x1={2.6} /></Sil></g>; };
const SCENES: (React.FC<{t: number}> | null)[] = [G1, G2, G3, G4, G5, null, G7];

/* ---------- the reflection on the blade (panel space) ---------- */
const HALF = 2.9;   // a scene's half-length along the blade, cm
/** v3.1: how far scene i's window and glow reach further toward the tip (screen left), cm; G7 makes room for 勾践 left of the
    ranks (the guard-side edge stays where it was) */
const EXT = [0, 0, 0, 0, 0, 0, 2.0];
const END_F = 0.17 * 2 * HALF;   // the window's soft ends, cm (as in v3)
/** the blade face inside its polished edge strips, as a panel path, for a in [a0, a1] */
const innerPath = (a0: number, a1: number) => { const n = 60, s0 = cl(a0 * 10 - A.blade0, 0, LBLADE), s1 = cl(a1 * 10 - A.blade0, 0, LBLADE);
	const pts = Array.from({length: n + 1}, (_, i) => { const s = lerp(s0, s1, i / n); return [(A.blade0 + s) / 10, Math.max(0, hwS(s) - edgeS(s)) / 10]; });
	return 'M' + [...pts.map(([a, w]) => `${px(a).toFixed(1)},${py(w).toFixed(1)}`), ...[...pts].reverse().map(([a, w]) => `${px(a).toFixed(1)},${py(-w).toFixed(1)}`)].join('L') + 'Z'; };
/** the spec lattice (latCells/cellQuad, LAT colours and line) over one scene, so the reflection reads as IN the metal */
const LatticeOverG: React.FC<{a0: number; a1: number; o: number}> = ({a0, a1, o}) => { const P = (s: number, w: number) => `${px((A.blade0 + s) / 10).toFixed(1)},${py(w / 10).toFixed(1)}`;
	const q = (pts: [number, number][]) => 'M' + pts.map(([s, w]) => P(s, w)).join('L') + 'Z', lw = LAT.line * PK / 10;
	return <g>{latCells(a0 * 10 - A.blade0, a1 * 10 - A.blade0).map((c) => <g key={`${c.p}_${c.q}`}>
		{c.pale && <path d={q(cellQuad(c, 0.9))} fill={LAT.paleHi} opacity={LAT.paleOp * 0.55 * o} />}
		<path d={q(cellQuad(c))} fill="none" stroke={LAT.ink} strokeWidth={lw} strokeOpacity={0.85 * o} strokeLinejoin="round" />
		{!c.pale && <path d={q(cellQuad(c, LAT.coreSc))} fill={LAT.ink} opacity={0.7 * o} />}</g>)}</g>; };
/** fix4 (review #10): the soft specular lobe of 「还亮着」 (the museum spot, as in KFK_H1): a broad screen-blended lobe that rides
    with the camera, living on the pale (tin) diamonds and broken by the dark lattice; k = its strength */
export const LOBE_T = 89.8;
export const lobeK = (t: number) => sstep(seg(t, LOBE_T - 0.7, LOBE_T)) * (1 - sstep(seg(t, 91.5, 92.55)));
const LobeG: React.FC<{a: number; w: number; ra: number; rw: number; k: number}> = ({a, w, ra, rw, k}) => {
	const P = (s: number, ww: number) => `${px((A.blade0 + s) / 10).toFixed(1)},${py(ww / 10).toFixed(1)}`;
	const cells = latCells((a - ra) * 10 - A.blade0, (a + ra) * 10 - A.blade0).filter((c) => c.pale).map((c) => ({c, d: Math.hypot(((A.blade0 + c.s) / 10 - a) / ra, (c.w / 10 - w) / rw)})).filter((x) => x.d < 1);
	return <g>
		<defs><radialGradient id="g53gLobe"><stop offset="0" stopColor="#FFF8E6" stopOpacity={0.9 * k} /><stop offset="0.3" stopColor="#FFE8B8" stopOpacity={0.7 * k} /><stop offset="0.65" stopColor="#E8B868" stopOpacity={0.3 * k} /><stop offset="1" stopColor="#E8B868" stopOpacity="0" /></radialGradient></defs>
		<g style={{mixBlendMode: 'screen'}}><ellipse cx={px(a)} cy={py(w)} rx={ra * PK} ry={rw * PK} fill="url(#g53gLobe)" /></g>
		{cells.map(({c, d}) => <path key={`${c.p}_${c.q}`} d={'M' + cellQuad(c, 0.78).map(([ss, ww]) => P(ss, ww)).join('L') + 'Z'} fill="#FFF6DE" opacity={0.7 * k * (1 - d)} />)}</g>; };
/** everything mirrored in the blade at t, in panel space: one masked group per lit scene. fix4 (review #6): the vignette's glow
    is an ellipse over the lower half (ground → just above the ridge); inside it the bronze is backed off and the spec lattice is
    redrawn at ~22 % (masked by the same glow), outside it the blade's own lattice stays at full strength */
export const Reflection53g: React.FC<{t: number; a0: number; a1: number}> = ({t, a0, a1}) => {
	const inner = innerPath(a0 - 1, a1 + 1), flick = 0.94 + 0.04 * Math.sin(t * 2.3) + 0.02 * Math.sin(t * 5.7 + 1);
	const dimTaste = 1 - 0.18 * sstep(seg(t, TASTE, TASTE + 0.5)) * (1 - sstep(seg(t, GS[5] + 0.5, GS[5] + 2.0)));
	const lk = lobeK(t);
	return <g>
		<defs><clipPath id="g53gIn"><path d={inner} /></clipPath>
			<radialGradient id="g53gFire" cx="0.5" cy="0.62" r="0.62"><stop offset="0" stopColor="#FFC56A" stopOpacity={0.95} /><stop offset="0.45" stopColor="#E08A38" stopOpacity={0.8} /><stop offset="0.75" stopColor="#8A4418" stopOpacity={0.42} /><stop offset="1" stopColor="#2A1408" stopOpacity="0" /></radialGradient>
			<radialGradient id="g53gBack"><stop offset="0" stopColor="#2A160A" stopOpacity={0.97} /><stop offset="0.6" stopColor="#2A160A" stopOpacity={0.93} /><stop offset="0.85" stopColor="#2A160A" stopOpacity={0.5} /><stop offset="1" stopColor="#2A160A" stopOpacity="0" /></radialGradient>
			<radialGradient id="g53gMk"><stop offset="0" stopColor="#fff" /><stop offset="0.6" stopColor="#fff" /><stop offset="0.85" stopColor="#808080" /><stop offset="1" stopColor="#000" /></radialGradient>
			<radialGradient id="g53gPatch"><stop offset="0" stopColor="#FFE2A6" stopOpacity={0.95} /><stop offset="0.5" stopColor="#FFC870" stopOpacity={0.7} /><stop offset="1" stopColor="#FFB04C" stopOpacity="0" /></radialGradient>
			<linearGradient id="g53gEnd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.17" stopColor="#fff" stopOpacity="1" /><stop offset="0.83" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
		<g clipPath="url(#g53gIn)">
			{SCENES.map((C, i) => { if (!C) return null; const k = vigK(i, t); if (k < 0.004) return null; const ac = GA[i], ex = EXT[i], x0 = px(ac + HALF + ex), x1 = px(ac - HALF), dim = i === 4 ? dimTaste : 1, ef = END_F / (2 * HALF + ex);
				const {wg, sc} = fitG(i), gw = (-wg + 0.32) / 2, grx = 3.0 + ex / 2, gry = (wg + 0.32) / 2 + 0.3;
				const glow = (fill: string) => <ellipse cx={px(ac + ex / 2)} cy={py(gw)} rx={grx * PK} ry={gry * PK} fill={fill} />;
				return <g key={i} opacity={k}>
					<defs><mask id={`g53gM${i}`} maskUnits="userSpaceOnUse" x={x0} y={0} width={x1 - x0} height={py(-PW)}><rect x={x0} y={0} width={x1 - x0} height={py(-PW)} fill={`url(#g53gEnd${i})`} /></mask>
						<linearGradient id={`g53gEnd${i}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset={f3(ef)} stopColor="#fff" stopOpacity="1" /><stop offset={f3(1 - ef)} stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
						<mask id={`g53gL${i}`} maskUnits="userSpaceOnUse" x={x0} y={0} width={x1 - x0} height={py(-PW)}>{glow('url(#g53gMk)')}</mask></defs>
					<g mask={`url(#g53gM${i})`}>
						{glow('url(#g53gBack)')}
						<ellipse cx={px(ac + ex / 2)} cy={py(gw - 0.1)} rx={(2.6 + ex / 2) * PK} ry={(gry + 0.1) * PK} fill="url(#g53gFire)" opacity={flick * dim} />
						<g transform={`translate(${px(ac)},${py(0)}) scale(${PK}) translate(0,${f3(wg)}) scale(${f3(sc)}) translate(${FX[i]},${-GY})`} fill={INK}><C t={t} /></g>
						<g mask={`url(#g53gL${i})`}><LatticeOverG a0={ac - HALF} a1={ac + HALF + ex} o={0.24} /></g>
						<path d={`M${px(ac + HALF + ex)},${py(0)} L${px(ac - HALF)},${py(0)}`} stroke={METAL.lit} strokeWidth={0.045 * PK} strokeOpacity={0.32} />
					</g></g>; })}
			{lk > 0.004 && <LobeG a={a0 + 9 - 0.8} w={0.25} ra={4.2} rw={1.7} k={lk} />}
		</g></g>; };
void RIM;

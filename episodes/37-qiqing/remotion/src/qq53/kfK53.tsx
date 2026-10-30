import React from 'react';
import {W, H, rnd} from '../qq50/kit50';
import {B} from '../qq50/styleB';
import {SW} from './props53';
import {BladeGlide, ax, wy, K, BLADE_IN} from './kfG53';
import {blob} from './props53';
/* ep53 v3 key frames, part K — the blade surface up close (same panel + homography as the G frames, so everything drawn on
   the face is IN its perspective):
   - KFK_H1: leg 2, the skim down the blade toward the guard; [亮] is a REAL specular highlight (owner note 0:03): a broad
     soft lobe where the museum spot reflects, broken by the dark lattice (it lives on the pale diamonds), the polished edge
     strips carrying a thin bright line — no white stripe;
   - KFK_T1 / KFK_T2: the rust blooms sit ON the surface (owner note 1:15): olive blots drawn in the face's own coordinates,
     foreshortened with it, each with a thin cream find-ring; T2 shrinks them to specks beside a 1 mm scale bar;
   - Spot: the macro's focal point (owner note 1:07): one lit pale diamond, the rest falling off into the lacquer dark. */

/** the raised ridge as a crease, not a stripe: body-tone band over the props53 ridge line, a thin lit edge, a thin shadow edge */
export const Ridge: React.FC = () => <g><path d={`M${ax(SW.bladeA + 0.2)},${wy(0)} L${ax(SW.L - 1.2)},${wy(0)}`} stroke="#C8944C" strokeWidth={0.13 * K} strokeOpacity={0.9} />
	<path d={`M${ax(SW.bladeA + 0.2)},${wy(0.04)} L${ax(SW.L - 1.2)},${wy(0.03)}`} stroke="#F4D088" strokeWidth={0.025 * K} strokeOpacity={0.7} />
	<path d={`M${ax(SW.bladeA + 0.2)},${wy(-0.04)} L${ax(SW.L - 1.2)},${wy(-0.03)}`} stroke="#4A2E14" strokeWidth={0.02 * K} strokeOpacity={0.6} /></g>;
/** a soft specular lobe on the face at (a cm from the pommel, w cm across), radii in cm */
const Lobe: React.FC<{a: number; w: number; ra: number; rw: number; o?: number; id: string}> = ({a, w, ra, rw, o = 1, id}) => <g style={{mixBlendMode: 'screen'}}>
	<defs><radialGradient id={id}><stop offset="0" stopColor="#FFF8E6" stopOpacity={0.95 * o} /><stop offset="0.25" stopColor="#FFE8B8" stopOpacity={0.7 * o} /><stop offset="0.6" stopColor="#E8B868" stopOpacity={0.25 * o} /><stop offset="1" stopColor="#E8B868" stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={ax(a)} cy={wy(w)} rx={ra * K} ry={rw * K} fill={`url(#${id})`} /></g>;
/** the lit pale diamonds inside the lobe: the tin-rich cells take the highlight, the dark lattice breaks it */
const PaleLit: React.FC<{a: number; w: number; ra: number; rw: number}> = ({a, w, ra, rw}) => { const La = 2.05, Lw = 1.18, out: React.ReactNode[] = [];
	for (let i = -6; i <= 40; i++) for (let j = -6; j <= 40; j++) { if ((i + j) % 2 !== 0) continue; const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw, d = Math.hypot((ca - a) / ra, (cw - w) / rw);
		if (d > 1.1 || ca < SW.bladeA || Math.abs(cw) > 2.2) continue; const sc = 0.78, P = (aa: number, ww: number) => `${ax(aa).toFixed(1)},${wy(ww).toFixed(1)}`;
		out.push(<path key={`${i}_${j}`} d={`M${P(ca - La / 2 * sc, cw)}L${P(ca, cw + Lw / 2 * sc)}L${P(ca + La / 2 * sc, cw)}L${P(ca, cw - Lw / 2 * sc)}Z`} fill="#FFF6DE" opacity={0.75 * Math.max(0, 1 - d)} />); }
	return <>{out}</>; };
export const KFK_H1: React.FC = () => <BladeGlide g={{a: 22, h: 1.5, d: 0.4, sx: -13, f: 1350, cy: 560, half: 11, roll: 0}} vig={() => null} latO={0.55} spec={0}
	under={<><Lobe a={25.8} w={-0.5} ra={4.6} rw={1.7} id="kkL1" /><Lobe a={25.8} w={-0.5} ra={2.2} rw={0.9} id="kkL1b" /><PaleLit a={25.8} w={-0.5} ra={4.6} rw={1.7} /></>}>
	<g clipPath="url(#gIn)"><Ridge /></g>
</BladeGlide>;

/* ---------- the blooms (T1, T2) ---------- */
const BL: [number, number, number][] = [[24.3, 0.55, 0.24], [25.6, -0.75, 0.17], [23.4, -1.1, 0.14]];   // a, w, radius (cm)
const Bloom: React.FC<{a: number; w: number; r: number; seed: number; ring?: number}> = ({a, w, r, seed, ring = 1}) => { const x = ax(a), y = wy(w), R = r * K;
	return <g>
		<circle cx={x} cy={y} r={R * 2.6} fill="#8A8A70" opacity={0.16} />
		<path d={blob(x, y, R * 1.25, seed, 10, 0.5)} fill="#7A5434" opacity={0.55} />
		<path d={blob(x, y, R, seed + 7, 10, 0.55)} fill="#6E7E46" />
		<path d={blob(x + R * 0.15, y - R * 0.1, R * 0.55, seed + 13, 8, 0.6)} fill="#4E5E38" />
		{Array.from({length: 6}, (_, i) => <circle key={i} cx={x + (rnd(seed * 9 + i, 2) - 0.5) * R * 4} cy={y + (rnd(seed * 9 + i, 3) - 0.5) * R * 3} r={R * 0.12} fill="#5E6A40" opacity={0.7} />)}
		{ring > 0 && <circle cx={x} cy={y} r={R * 2.6} fill="none" stroke="#F2E6CC" strokeOpacity={0.85 * ring} strokeWidth={0.02 * K} />}
	</g>; };
const MAC = {a: 24.4, h: 2.6, d: 2.0, sx: -3.0, f: 1500, cy: 900, half: 6};
export const KFK_T1: React.FC = () => <BladeGlide g={MAC} vig={() => null} latO={0.55} spec={0.15} under={<Lobe a={24.6} w={0.2} ra={3.2} rw={1.6} o={0.5} id="kkL2" />}>
	<g clipPath="url(#gIn)"><Ridge />{BL.map(([a, w, r], i) => <Bloom key={i} a={a} w={w} r={r} seed={i + 3} ring={0.8} />)}</g></BladeGlide>;
export const KFK_T2: React.FC = () => <><KFK_T2p /><svg width={W} height={H} style={{position: 'absolute'}}><text x={1110} y={1000} fontFamily="'Noto Sans CJK SC',sans-serif" fontWeight={900} fontSize={40} fill="#FFF6E6" stroke="#120906" strokeWidth={7} style={{paintOrder: 'stroke'}}>← 1毫米</text></svg></>;
const KFK_T2p: React.FC = () => <BladeGlide g={{...MAC, h: 3.4, d: 2.6, f: 1250}} vig={() => null} latO={0.55} spec={0.15} under={<Lobe a={24.6} w={0.2} ra={3.2} rw={1.6} o={0.5} id="kkL3" />}>
	<g clipPath="url(#gIn)"><Ridge />{BL.map(([a, w, r], i) => <Bloom key={i} a={a} w={w} r={r * 0.45} seed={i + 3} ring={0} />)}</g>
	<g><path d={`M${ax(24.35)},${wy(-0.25)} H${ax(24.25)} M${ax(24.35)},${wy(-0.2)} V${wy(-0.3)} M${ax(24.25)},${wy(-0.2)} V${wy(-0.3)}`} stroke="#FFF6E6" strokeWidth={0.012 * K} />
</g>
</BladeGlide>;

/** a spotlight overlay: one pale diamond (at screen x, y, its half-size rx, ry) lit, the rest falling off */
export const Spot: React.FC<{x: number; y: number; rx: number; ry: number; o?: number}> = ({x, y, rx, ry, o = 0.78}) => <svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none'}}>
	<defs><radialGradient id={`spt${x}`} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={1100}>
		<stop offset="0" stopColor="#0C0604" stopOpacity="0" /><stop offset="0.1" stopColor="#0C0604" stopOpacity={0.1 * o} /><stop offset="0.3" stopColor="#0C0604" stopOpacity={0.7 * o} /><stop offset="0.6" stopColor="#0C0604" stopOpacity={o} /></radialGradient>
		<radialGradient id={`spg${x}`}><stop offset="0" stopColor="#FFF0CC" stopOpacity="0.6" /><stop offset="1" stopColor="#FFF0CC" stopOpacity="0" /></radialGradient></defs>
	<rect width={W} height={H} fill={`url(#spt${x})`} />
	<ellipse cx={x} cy={y} rx={rx * 1.5} ry={ry * 1.5} fill={`url(#spg${x})`} style={{mixBlendMode: 'screen'}} />
</svg>;
void BLADE_IN;

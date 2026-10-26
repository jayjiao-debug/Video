import React from 'react';
import {W, H, SANS, KAI, SAFE_X, SAFE_Y, lerp, rnd, cl} from '../qq50/kit50';
import {B, BG, thB, LacDefs, Lacquer, Vignette, RimFig} from '../qq50/styleB';
import {Figure4, Pose, Look4} from '../qq44/figure44';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {Defs51, IceBlock as IceBlockA, LOOKS51 as L51A, Walker51} from './props51';
/* ep51 Builder B shared parts: the ep50 look-B furniture copied (KF50.tsx registers its own root, so it cannot be imported),
   the ice accent (cool blue-white: core #EAF6FF, body #BFE3F2, shade #6FA9C4), the Qing head (cap + queue overlay),
   and the props of KF09–KF14 (ice mountain, silver bowl, cloisonné ice chest, village houses). */
export type P2 = [number, number];

/* ---------- the walker's costumes for B's eras (same build/gait as ep50) ---------- */
export const LOOKS51: Record<string, Look4> = {tang: L51A.tang.look, song: L51A.song.look, qing: L51A.qing.look, today: L51A.today.look};   // Builder A's costumes (props51)

/* ---------- arm IK (copied from KF50: the wrist sits a little short of the grip, the mitten closes on it) ---------- */
const UP = 0.194, FO = 0.135;
export const ikArm = (p: Pose, s: 'L' | 'R', grip: P2, elbowDown = true): Pose => {
	const sh = p[`${s}Sh`], dx0 = grip[0] - sh[0], dy0 = grip[1] - sh[1], d0 = Math.hypot(dx0, dy0) || 1;
	const tx = grip[0] - dx0 / d0 * 0.03, ty = grip[1] - dy0 / d0 * 0.03;
	const dx = tx - sh[0], dy = ty - sh[1], L = Math.min(Math.hypot(dx, dy), UP + FO - 1e-3), ph = Math.atan2(dy, dx);
	const al = Math.acos(cl((UP * UP + L * L - FO * FO) / (2 * UP * L), -1, 1));
	const e1: P2 = [sh[0] + UP * Math.cos(ph + al), sh[1] + UP * Math.sin(ph + al)], e2: P2 = [sh[0] + UP * Math.cos(ph - al), sh[1] + UP * Math.sin(ph - al)];
	const el = elbowDown ? (e1[1] < e2[1] ? e1 : e2) : (e1[1] < e2[1] ? e2 : e1);
	return {...p, [`${s}Elb`]: el, [`${s}Hand`]: [sh[0] + L * Math.cos(ph), sh[1] + L * Math.sin(ph)]};
};
export const toBody = (X: number, Y: number, x: number, g: number, h: number, flip = false): P2 => [(flip ? -1 : 1) * (X - x) / h, (g - Y) / h];
export const J = (p: Pose, n: string, x: number, g: number, h: number, flip = false): P2 => [x + (flip ? -1 : 1) * p[n][0] * h, g - p[n][1] * h];

/* ---------- furniture ---------- */
export const StampK: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·—〃−`);
	const num = /^[0-9.]+$/.test(y);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note}</div>
	</div>; };
const Mk: React.FC<{s: string}> = ({s}) => <>{s.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) => p.startsWith('[')
	? <span key={i} style={{position: 'relative', display: 'inline-block'}}><span style={{position: 'absolute', left: '0.05em', right: '0.05em', bottom: '0.1em', height: '0.13em', borderRadius: '0.06em', background: thB.key}} /><span style={{position: 'relative'}}>{p.slice(1, -1)}</span></span>
	: <span key={i}>{p}</span>)}</>;
/** a Q line, centred (as master50's SubsCentre): row 1 in the period face (KAI 68), the gloss row with it (42 px cream) */
export const SubsQ: React.FC<{row: string; gloss: string}> = ({row, gloss}) => {
	const len = Math.max(row.length, gloss.length * 0.65), tw = 65 * len * 1.05, hh = 97 + 70, ls = 0.08, pull = (/[。？！，、：；]$/.test(row) ? (0.5 + ls) / 2 : ls / 2) + 0.06;
	return <>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 280, top: 132 + hh / 2 - (hh / 2 + 190), width: tw + 560, height: hh + 380, background: 'radial-gradient(closest-side, rgba(16,7,4,0.46), rgba(16,7,4,0.4) 45%, rgba(16,7,4,0.16) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 132, textAlign: 'center', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 68, lineHeight: 1.5, letterSpacing: `${ls}em`}}><span style={{position: 'relative', left: `${pull}em`}}><Mk s={row} /></span></div>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.6, letterSpacing: '0.06em', color: B.cream, opacity: 0.9}}><span style={{position: 'relative', left: '0.03em'}}>{gloss}</span></div>
		</div></>; };
export const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; font?: string; w?: number}> = ({x, y, s, fs = 40, col = B.cream, anchor = 'start', o = 1, font = KAI, w = 700}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={w} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={6} style={{paintOrder: 'stroke'}}>{s}</text>;
export const Ground: React.FC<{g: number; lattice?: boolean; fill?: string}> = ({g, lattice = true, fill = BG.ground}) => <g>
	<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill={fill} /><rect x={-40} y={g} width={W + 80} height={3} fill={B.gold} opacity={0.28} />
	{lattice && <path d={Array.from({length: 24}, (_, i) => `M${-60 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
</g>;
export const Frame: React.FC<{id: string; children: React.ReactNode; over?: React.ReactNode; sheen?: number; vig?: number}> = ({id, children, over, sheen = 0.3, vig}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Defs51 /><IceDefs /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} a={vig} /></svg>{over}</>;

/* ---------- the ice accent ---------- */
export const ICE = {core: '#EAF6FF', body: '#BFE3F2', shade: '#6FA9C4', deep: '#3E7590', edge: '#FFFFFF'};
export const IceDefs: React.FC = () => <defs>
	<linearGradient id="iceFr" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor="#E2F3FC" /><stop offset="0.5" stopColor={ICE.body} /><stop offset="1" stopColor="#82B7CF" /></linearGradient>
	<linearGradient id="iceTp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FAFDFF" /><stop offset="1" stopColor="#D2EAF6" /></linearGradient>
	<linearGradient id="iceSd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FC2D9" /><stop offset="1" stopColor="#5A93AE" /></linearGradient>
	<linearGradient id="iceLit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4FBFF" /><stop offset="0.6" stopColor="#CDE8F5" /><stop offset="1" stopColor="#A4D1E5" /></linearGradient>
	<linearGradient id="iceShd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9CCBE0" /><stop offset="0.6" stopColor={ICE.shade} /><stop offset="1" stopColor="#4F87A2" /></linearGradient>
	<radialGradient id="iceGlow"><stop offset="0" stopColor="#CFEBFA" stopOpacity="0.5" /><stop offset="1" stopColor="#CFEBFA" stopOpacity="0" /></radialGradient>
	<filter id="mist" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
	<filter id="mistS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
</defs>;
/** Builder A's ice block (props51), called with the bottom-left front corner as (x, y) */
export const IceBlock: React.FC<{x: number; y: number; w: number; h: number; d?: number; o?: number; seed?: number; marks?: boolean; melt?: number}> = ({x, y, w, h, d, o = 1, seed = 1, marks = true, melt = 0}) =>
	<IceBlockA x={x + w / 2} y={y} w={w} h={h} d={d} o={o} seed={seed} marks={marks} melt={melt} />;
/** a ghost block melting away: the dashed outline of the whole block, a rounded remnant k (0..1 left), drips and a puddle */
export const MeltBlock: React.FC<{x: number; y: number; w: number; h: number; k: number; o?: number; seed?: number}> = ({x, y, w, h, k, o = 0.8, seed = 3}) => {
	const d = w * 0.42, ox = d * 0.55, oy = -d * 0.48, t = y - h;
	return <g opacity={o}>
		{/* the ghost of the whole block: a soft ~40 % fill under a dashed outline */}
		<path d={`M${x + w},${y} V${t} L${x + w + ox},${t + oy} V${y + oy} Z`} fill={ICE.shade} opacity={0.32} />
		<path d={`M${x},${t} H${x + w} L${x + w + ox},${t + oy} H${x + ox} Z`} fill={ICE.core} opacity={0.4} />
		<rect x={x} y={t} width={w} height={h} fill={ICE.body} opacity={0.38} />
		<ellipse cx={x + w / 2 + 6} cy={y - 3} rx={w * 0.52} ry={7} fill={ICE.shade} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.7} />
		<path d={`M${x},${y} V${t} H${x + w} V${y} Z M${x},${t} L${x + ox},${t + oy} H${x + w + ox} L${x + w},${t} M${x + w + ox},${t + oy} V${y + oy} L${x + w},${y}`} fill="none" stroke={ICE.core} strokeWidth={2.5} strokeDasharray="9 8" opacity={0.75} />
		<IceBlockA x={x + w / 2} y={y} w={w * (0.6 + 0.35 * k)} h={h * k} d={d * (0.6 + 0.4 * k)} melt={0.5} marks={false} seed={seed} o={0.85} />
		{[0.2, 0.5, 0.8].map((u, i) => <path key={i} d={`M${x + w * u},${y + 6 + 6 * i} q-5,11 0,17 q5,-6 0,-17 Z`} fill={ICE.shade} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.95} />)}
	</g>; };
/** shaved ice (冰雪) heaped above a rim from x0 to x1 at y, height hh */
export const IceHeap: React.FC<{x0: number; x1: number; y: number; hh: number; seed?: number}> = ({x0, x1, y, hh, seed = 2}) => { const w = x1 - x0, n = 7;
	const top = Array.from({length: n + 1}, (_, i) => { const u = i / n, bump = Math.sin(Math.PI * u) * hh * (0.85 + 0.25 * rnd(i, seed)); return [x0 + w * u, y - bump] as P2; });
	const d = `M${x0},${y} ` + top.map(([px, py], i) => i === 0 ? '' : `Q${(top[i - 1][0] + px) / 2},${Math.min(top[i - 1][1], py) - hh * 0.12} ${px},${py}`).join(' ') + ' Z';
	return <g>
		<path d={d} fill="url(#iceLit)" />
		<clipPath id={`hp${Math.round(x0)}_${Math.round(y)}`}><path d={d} /></clipPath>
		<g clipPath={`url(#hp${Math.round(x0)}_${Math.round(y)})`}><path d={d} fill="url(#iceShd)" opacity={0.45} transform={`translate(${w * 0.22},${hh * 0.12})`} /></g>
		<path d={`M${x0 + w * 0.12},${y - hh * 0.35} Q${x0 + w * 0.32},${y - hh * 1.0} ${x0 + w * 0.52},${y - hh * 0.98}`} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.025)} strokeLinecap="round" opacity={0.95} />
		{Array.from({length: 9}, (_, i) => <circle key={i} cx={x0 + w * (0.12 + 0.76 * rnd(i, seed + 5))} cy={y - hh * (0.15 + 0.6 * rnd(i, seed + 9)) * Math.sin(Math.PI * (0.12 + 0.76 * rnd(i, seed + 5)))} r={Math.max(1.2, w * 0.012)} fill="#FFFFFF" />)}
	</g>; };
/** four-point specular glint (a highlight ON the metal, short rays) */
export const Glint: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => <g transform={`translate(${x},${y})`} opacity={o}>
	<circle r={r * 0.32} fill="#FFFFFF" opacity={0.55} />
	<path d={`M0,${-r} L${r * 0.09},${-r * 0.09} L${r},0 L${r * 0.09},${r * 0.09} L0,${r} L${-r * 0.09},${r * 0.09} L${-r},0 L${-r * 0.09},${-r * 0.09} Z`} fill="#FFFFFF" />
	<path d={`M0,${-r * 0.5} L${r * 0.05},${-r * 0.05} L${r * 0.5},0 L${r * 0.05},${r * 0.05} L0,${r * 0.5} L${-r * 0.05},${r * 0.05} L${-r * 0.5},0 L${-r * 0.05},${-r * 0.05} Z`} fill="#FFFFFF" transform="rotate(45)" opacity={0.8} />
</g>;
/** ice chips flying from a strike point (dir = the side they fly to: +1 right, −1 left) */
export const Chips: React.FC<{x: number; y: number; s: number; seed?: number; dir?: number; n?: number}> = ({x, y, s, seed = 1, dir = 1, n = 9}) => <g>
	{Array.from({length: n}, (_, i) => { const a = (-160 + 140 * rnd(i, seed)) * Math.PI / 180, d = s * (0.4 + 0.8 * rnd(i, seed + 2)), px = x + dir * Math.cos(a) * d * -1, py = y + Math.sin(a) * d, z = s * (0.06 + 0.07 * rnd(i, seed + 4));
		return <path key={i} d={`M${px},${py - z} L${px + z * 0.8},${py} L${px},${py + z * 0.7} L${px - z * 0.7},${py} Z`} fill={i % 3 ? ICE.core : '#FFFFFF'} opacity={0.95} />; })}
	{Array.from({length: 5}, (_, i) => { const a = (-150 + 120 * rnd(i, seed + 7)) * Math.PI / 180, d0 = s * 0.12, d1 = s * (0.35 + 0.3 * rnd(i, seed + 8));
		return <path key={`r${i}`} d={`M${x - dir * Math.cos(a) * d0},${y + Math.sin(a) * d0} L${x - dir * Math.cos(a) * d1},${y + Math.sin(a) * d1}`} stroke="#F4FBFF" strokeWidth={Math.max(1.5, s * 0.025)} strokeLinecap="round" opacity={0.85} />; })}
</g>;

/** the Qing walker: Builder A's Walker51 with the cap + queue */
export const QingFig: React.FC<{x: number; ground: number; h: number; pose: Pose; col?: string; flip?: boolean; rimO?: number; look?: Look4}> = ({x, ground, h, pose, col = B.lac, flip, rimO = 0.9, look = L51A.qing.look}) =>
	<Walker51 x={x} g={ground} h={h} pose={pose} look={look} qing col={col} flip={flip} rimO={rimO} />;
export {Figure4};

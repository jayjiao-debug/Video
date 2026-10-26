import React from 'react';
import {W, H, SANS, KAI, SAFE_X, SAFE_Y, lerp, rnd, cl, grounded} from '../qq50/kit50';
import {B, BG, thB, LacDefs, Lacquer, Vignette, RimFig, SilverGrad, curl} from '../qq50/styleB';
import {Figure4, Pose, Look4} from '../qq44/figure44';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {Defs51, IceBlock as IceBlockA, LOOKS51 as L51A, Walker51, ICE as ICEA, BRZ, Jianfou, Fridge, Snow} from './props51';
import {Pool} from '../qq50/styleB';
import {LookId, palOf} from './palette51';
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
export const NEUT = '#120A07';   // other people: one tone, a touch darker than the walker
/* ---------- props moved here from KF51B so the film can use them ---------- */
export const Umbrella: React.FC<{x: number; y: number; r: number; g: number; o?: number; col?: string}> = ({x, y, r, g, o = 1, col = '#2A3A4E'}) => <g opacity={o}>
	<rect x={x - 3} y={y} width={6} height={g - y} fill="#3A2416" />
	<path d={`M${x - r},${y + r * 0.22} Q${x - r * 0.75},${y - r * 0.3} ${x},${y - r * 0.38} Q${x + r * 0.75},${y - r * 0.3} ${x + r},${y + r * 0.22} Q${x + r * 0.5},${y + r * 0.08} ${x},${y + r * 0.1} Q${x - r * 0.5},${y + r * 0.08} ${x - r},${y + r * 0.22} Z`} fill={col} stroke={B.gold} strokeOpacity={0.45} strokeWidth={1.6} />
	<path d={[-0.66, -0.33, 0, 0.33, 0.66].map((u) => `M${x},${y - r * 0.38} Q${x + u * r * 0.7},${y - r * 0.28} ${x + u * r * 1.0},${y + r * 0.12 + Math.abs(u) * r * 0.06}`).join(' ')} fill="none" stroke="#11171F" strokeWidth={2} opacity={0.6} />
	<path d={`M${x - r * 0.75},${y - r * 0.22} Q${x - r * 0.3},${y - r * 0.4} ${x + r * 0.2},${y - r * 0.36}`} fill="none" stroke="#7B8EA3" strokeWidth={3} opacity={0.35} strokeLinecap="round" />
</g>;
export const SilverBowl: React.FC<{x: number; y: number; w: number; id: string; heap?: number; k?: number}> = ({x, y, w, id, heap = 0, k = 0.62}) => <g>
	<defs><SilverGrad id={id} x0={x - w / 2} x1={x + w / 2} k={k} /></defs>
	{heap > 0 && <IceHeap x0={x - w * 0.44} x1={x + w * 0.44} y={y + 2} hh={heap} />}
	<path d={`M${x - w / 2},${y} Q${x - w * 0.46},${y + w * 0.3} ${x - w * 0.16},${y + w * 0.36} L${x - w * 0.15},${y + w * 0.43} H${x + w * 0.15} L${x + w * 0.16},${y + w * 0.36} Q${x + w * 0.46},${y + w * 0.3} ${x + w / 2},${y} Z`} fill={`url(#${id})`} stroke="#6D7880" strokeWidth={1.5} />
	<ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.06} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
	<path d={`M${x - w * 0.3},${y + w * 0.08} Q${x - w * 0.28},${y + w * 0.24} ${x - w * 0.12},${y + w * 0.29}`} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(2, w * 0.03)} opacity={0.8} strokeLinecap="round" />
</g>;
export const SilverBasin: React.FC<{x: number; y: number; w: number; id: string}> = ({x, y, w, id}) => <g>
	<defs><SilverGrad id={id} x0={x - w / 2} x1={x + w / 2} k={0.45} /></defs>
	<IceHeap x0={x - w * 0.46} x1={x + w * 0.46} y={y + 2} hh={w * 0.26} seed={6} />
	<path d={`M${x - w / 2},${y} L${x - w * 0.42},${y + w * 0.3} H${x + w * 0.42} L${x + w / 2},${y} Z`} fill={`url(#${id})`} stroke="#6D7880" strokeWidth={1.5} />
	<rect x={x - w * 0.52} y={y - 5} width={w * 1.04} height={10} rx={5} fill={`url(#${id})`} stroke="#FFFFFF" strokeWidth={1.5} />
	<path d={`M${x - w * 0.35},${y + w * 0.2} H${x + w * 0.35}`} stroke="#8D979E" strokeWidth={2} opacity={0.6} />
</g>;

/** a worker with the long ice pick (冰镩); up = raised (mid-swing) or striking (tip on the ice) */
export const Picker: React.FC<{x: number; g: number; h: number; up: boolean; flip?: boolean; col?: string; rimO?: number; walker?: boolean; seed?: number}> = ({x, g, h, up, flip, col = NEUT, rimO = 0.55, walker, seed = 1}) => {
	const sgn = flip ? -1 : 1;
	const tip: P2 = up ? [x + sgn * 0.4 * h, g - 0.14 * h] : [x + sgn * 0.42 * h, g + 4];
	const hi: P2 = up ? [x + sgn * 0.24 * h, g - 1.06 * h] : [x + sgn * 0.08 * h, g - 0.78 * h];
	const dx = tip[0] - hi[0], dy = tip[1] - hi[1];
	const at = (u: number): P2 => [hi[0] + dx * u, hi[1] + dy * u];
	const top = at(up ? -0.02 : -0.08), gU = at(up ? 0.22 : 0.18), gL = at(up ? 0.44 : 0.4);
	let p = grounded(up ? {lean: -4, neck: 2, lt: 12, lk: 10, rt: -14, rk: 10, la: 60, le: 40, ra: 70, re: 40} : {lean: 22, neck: 8, lt: 16, lk: 24, rt: -10, rk: 14, la: 40, le: 10, ra: 30, re: 10});
	p = ikArm(p, 'R', toBody(gU[0], gU[1], x, g, h, flip), !up);
	p = ikArm(p, 'L', toBody(gL[0], gL[1], x, g, h, flip));
	const fig = walker ? <QingFig x={x} ground={g} h={h} pose={p} col={col} flip={flip} /> : <QingFig x={x} ground={g} h={h} pose={p} look={{dress: 'tunic', legs: 'trousers', head: 'bald'}} col={col} flip={flip} rimO={rimO} />;
	const iron = at(0.86);
	return <g>
		<path d={`M${top[0]},${top[1]} L${iron[0]},${iron[1]}`} stroke="#8A6232" strokeWidth={Math.max(4, h * 0.016)} strokeLinecap="round" />
		<path d={`M${iron[0]},${iron[1]} L${tip[0]},${tip[1]}`} stroke="#AEB8BF" strokeWidth={Math.max(4, h * 0.02)} strokeLinecap="round" />
		{fig}
		{!up && <Chips x={tip[0]} y={tip[1] - 4} s={h * 0.3} seed={seed} dir={sgn} n={10} />}
	</g>; };

export const IceChest: React.FC<{x: number; top: number; w: number; h: number; cut?: number; breath?: number[]; T?: number}> = ({x, top, w, h, cut = 1, breath = [1, 1, 1, 1], T = 0}) => {
	const bot = top + h, dx = 74, dy = -44, x0 = x - w / 2, x1 = x + w / 2, b0 = x0 + w * 0.06, b1 = x1 - w * 0.06;
	/* lid coordinates: u across (0..w), v back (0..1) */
	const L = (u: number, v: number): P2 => [x0 + u + dx * v, top + dy * v];
	const holes: P2[] = [[0.2, 0.5], [0.4, 0.5], [0.62, 0.5], [0.82, 0.5]].map(([u, v]) => L(u * w, v));
	const front = `M${x0},${top} H${x1} L${b1},${bot} H${b0} Z`;
	const side = `M${x1},${top} L${x1 + dx},${top + dy} L${b1 + dx},${bot + dy} L${b1},${bot} Z`;
	const cutD = `M${x + 10},${top + 26} H${x1 - 22} L${b1 - 12},${bot - 24} H${x + 10} Z`;
	const wire = Array.from({length: 5}, (_, i) => curl(x0 + 40 + i * (w - 80) / 4 + (i % 2) * 6, top + h * (0.42 + 0.1 * (i % 2)), 16, i % 2 ? -1 : 1, 1.4, 0.4)).join(' ');
	return <g>
		<defs><linearGradient id="enam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2F67A8" /><stop offset="0.55" stopColor="#1F4A85" /><stop offset="1" stopColor="#163562" /></linearGradient>
			<clipPath id="chF"><path d={front} /></clipPath></defs>
		<path d={side} fill="#163562" stroke="url(#brz51)" strokeWidth={4} />
		<path d={front} fill="url(#enam)" />
		<g clipPath="url(#chF)">
			<path d={wire} fill="none" stroke="#E8BC66" strokeWidth={2.2} opacity={0.9} />
			<path d={Array.from({length: 7}, (_, i) => `M${x0 + 20 + i * (w - 40) / 6},${top + 14} l12,12 l-12,12 l-12,-12 Z`).join(' ')} fill="none" stroke="#E8BC66" strokeWidth={1.8} opacity={0.85} />
			<path d={Array.from({length: 7}, (_, i) => `M${x0 + 26 + i * (w - 52) / 6},${bot - 36} l12,12 l-12,12 l-12,-12 Z`).join(' ')} fill="none" stroke="#E8BC66" strokeWidth={1.8} opacity={0.85} />
			<path d={`M${x0},${top + 46} H${x1} M${x0},${bot - 46} H${x1}`} stroke="#E8BC66" strokeWidth={2} opacity={0.8} />
			{/* section hint: the front cut open — the tin lining, ice packed inside */}
			<g opacity={cut}><path d={cutD} fill="#22272C" />
			<path d={`M${x + 10},${top + 26} H${x1 - 22} L${x1 - 30},${top + 40} H${x + 20} Z`} fill="#4A535A" />
			<IceBlock x={x + 26} y={bot - 30} w={74} h={58} d={16} seed={21} />
			<IceBlock x={x + 102} y={bot - 30} w={68} h={60} d={16} seed={22} />
			<IceBlock x={x + 40} y={bot - 90} w={70} h={34} d={14} seed={23} marks={false} />
			<path d={cutD} fill="none" stroke={B.cream} strokeWidth={2.5} strokeDasharray="9 7" /></g>
		</g>
		{/* gilt corner bands, foot, ring handle */}
		<path d={`M${x0},${top} L${b0},${bot} M${x1},${top} L${b1},${bot}`} stroke="url(#brz51)" strokeWidth={7} />
		<rect x={b0 - 6} y={bot - 8} width={b1 - b0 + 12} height={12} fill="url(#brz51)" />
		<circle cx={x1 + dx * 0.5} cy={top + h * 0.38 + dy * 0.5} r={16} fill="none" stroke="url(#brz51)" strokeWidth={5} />
		{/* the lid: two gilt-framed enamel panels, four coin-shaped holes */}
		<path d={`M${x0},${top} H${x1} L${x1 + dx},${top + dy} H${x0 + dx} Z`} fill="#24548F" stroke="url(#brz51)" strokeWidth={5} />
		<path d={`M${L(w / 2, 0)[0]},${top} L${L(w / 2, 1)[0]},${top + dy}`} stroke="url(#brz51)" strokeWidth={5} />
		{holes.map(([hx, hy], i) => <g key={i} transform={`translate(${hx},${hy}) matrix(1,0,${dx / 44 * 0.3},0.55,0,0)`}>
			<circle r={22} fill="url(#brz51)" /><circle r={17} fill="#0A0A0E" />
			<rect x={-7} y={-7} width={14} height={14} fill="url(#brz51)" />
			<path d="M0,-17 V-7 M0,7 V17 M-17,0 H-7 M7,0 H17" stroke="url(#brz51)" strokeWidth={3} />
		</g>)}
		{/* cold air: a small curl out of each coin hole, then heavy and falling: it rolls over the lid's edge and pours down the
		    front of the box (never rising like steam) */}
		{holes.map(([hx, hy], i) => { const b = breath[i] ?? 1; if (b <= 0.01) return null; const d = i < 2 ? -1 : 1, fx = hx - dx * 0.5, fall = 60 + (bot - top + 40) * b;
			const flow = `M${hx},${hy - 6} Q${hx - 6},${hy + 6} ${fx},${top + 2} Q${fx - 6 + d * 4},${top + fall * 0.45} ${fx + d * 10},${top + fall}`;
			return <g key={`b${i}`} opacity={b}>
				<path d={curl(hx + d * 3, hy - 14, 8, d, 1.2, 0.3)} fill="none" stroke="#F4FBFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
				<path d={flow} fill="none" stroke="#DCEFF9" strokeWidth={22} strokeLinecap="round" opacity={0.28} filter="url(#mistS)" />
				<path d={flow} fill="none" stroke="#F4FBFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.75} strokeDasharray="18 14" strokeDashoffset={-T * 60 - i * 9} />
			</g>; })}
	</g>; };

export const FridgeIcon: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => { const w = h * 0.52;
	return <g><rect x={x} y={y} width={w} height={h} rx={w * 0.12} fill="#EEF4F6" stroke="#9FB4BE" strokeWidth={2} />
		<path d={`M${x},${y + h * 0.36} H${x + w}`} stroke="#9FB4BE" strokeWidth={2} />
		<rect x={x + w * 0.76} y={y + h * 0.1} width={w * 0.08} height={h * 0.18} rx={2} fill="#9FB4BE" /><rect x={x + w * 0.76} y={y + h * 0.44} width={w * 0.08} height={h * 0.24} rx={2} fill="#9FB4BE" /></g>; };


/* ---------- copied from KF51A (Builder A's KF15/KF16 look; KF51A registers its own root) ---------- */
const stand = (k: Partial<{lean: number; neck: number; la: number; le: number; ra: number; re: number}> = {}) => grounded({lean: 3, neck: 4, lt: 3, lk: 3, rt: -4, rk: 4, la: -3, le: 10, ra: 4, re: 14, ...k});
/* ---------- small cold-thing icons (KF15) ---------- */
export const IceMountainI: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	const d = `M${-60 * k},0 L${-42 * k},${-46 * k} L${-30 * k},${-38 * k} L${-12 * k},${-96 * k} L${4 * k},${-64 * k} L${18 * k},${-82 * k} L${40 * k},${-30 * k} L${60 * k},0 Z`;
	return <g transform={`translate(${x},${y})`}>
		<path d={d} fill="url(#ice51F)" opacity={0.92} stroke={ICEA.line} strokeWidth={2} strokeLinejoin="round" />
		<path d={`M${-12 * k},${-96 * k} L${-6 * k},${-20 * k} L${4 * k},${-64 * k} M${18 * k},${-82 * k} L${14 * k},${-18 * k} M${-42 * k},${-46 * k} L${-34 * k},${-8 * k}`} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={2} fill="none" />
		<path d={`M${-12 * k},${-96 * k} L${-22 * k},${-40 * k} L${-16 * k},${-40 * k} Z`} fill="#FFFFFF" opacity={0.6} />
		<ellipse cx={0} cy={2} rx={70 * k} ry={8 * k} fill="none" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} /></g>; };
export const SuShan: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	/* a small dish with three piped/drizzled cream peaks: spiral bands across each cone, tips tinted red / green */
	const peak = (cx: number, base: number, ht: number, wd: number, tint: string, i: number) => { const top = base - ht;
		const body = `M${cx - wd / 2},${base} Q${cx - wd * 0.46},${base - ht * 0.45} ${cx - wd * 0.14},${top + ht * 0.2} Q${cx - wd * 0.02},${top - ht * 0.04} ${cx + wd * 0.12},${top + ht * 0.05} Q${cx + wd * 0.1},${top + ht * 0.16} ${cx + wd * 0.16},${top + ht * 0.24} Q${cx + wd * 0.46},${base - ht * 0.45} ${cx + wd / 2},${base} Z`;
		const bands = [0.22, 0.45, 0.68].map((u) => { const yy = top + ht * (0.18 + u * 0.8), hw = wd * (0.12 + 0.4 * u); return `M${cx - hw},${yy} Q${cx},${yy + ht * 0.12} ${cx + hw},${yy - ht * 0.04}`; }).join(' ');
		return <g key={i}><path d={body} fill={B.cream} stroke="#BFA77C" strokeWidth={1.5} />
			<path d={bands} stroke="#C9B08A" strokeWidth={2.4 * k} fill="none" strokeLinecap="round" />
			<path d={`M${cx - wd * 0.14},${top + ht * 0.2} Q${cx - wd * 0.02},${top - ht * 0.04} ${cx + wd * 0.12},${top + ht * 0.05} Q${cx + wd * 0.1},${top + ht * 0.16} ${cx + wd * 0.16},${top + ht * 0.24}`} fill="none" stroke={tint} strokeWidth={5 * k} strokeLinecap="round" opacity={0.75} />
			<path d={`M${cx + wd * 0.18},${top + ht * 0.4} q${3 * k},${8 * k} 0,${14 * k}`} stroke="#E8DCC0" strokeWidth={2.5 * k} fill="none" strokeLinecap="round" /></g>; };
	return <g transform={`translate(${x},${y})`}>
		<ellipse cx={0} cy={-6 * k} rx={64 * k} ry={13 * k} fill="#2A1710" stroke={B.gold} strokeOpacity={0.7} strokeWidth={2} />
		<ellipse cx={0} cy={-9 * k} rx={54 * k} ry={9 * k} fill="#3A2116" />
		{peak(-30 * k, -8 * k, 52 * k, 40 * k, '#C8503A', 0)}{peak(28 * k, -8 * k, 48 * k, 38 * k, '#5E9A6A', 1)}{peak(0, -4 * k, 76 * k, 48 * k, '#C8503A', 2)}
	</g>; };
export const SilverBowlI: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	/* a wide, shallow silver bowl on a low foot ring, a heaped mound of shaved ice above the rim, a bright glint */
	const rimY = -30 * k, rw = 66 * k;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-18 * k},0 L${-14 * k},${-8 * k} L${14 * k},${-8 * k} L${18 * k},0 Z`} fill="url(#slv51)" stroke="#59636A" strokeWidth={1.2} />
		<path d={`M${-rw},${rimY} Q${-rw * 0.9},${-8 * k} ${-14 * k},${-8 * k} L${14 * k},${-8 * k} Q${rw * 0.9},${-8 * k} ${rw},${rimY} Z`} fill="url(#slv51)" stroke="#59636A" strokeWidth={1.5} />
		<path d={`M${-rw},${rimY} Q${-30 * k},${-82 * k} ${-4 * k},${-80 * k} Q${10 * k},${-90 * k} ${24 * k},${-74 * k} Q${52 * k},${-62 * k} ${rw},${rimY} Z`} fill="url(#ice51T)" stroke={ICEA.line} strokeWidth={1.8} />
		{Array.from({length: 22}, (_, i) => <circle key={i} cx={(-50 + 100 * rnd(i, 3)) * k} cy={(-36 - 34 * rnd(i, 4) * (1 - Math.abs(rnd(i, 3) - 0.5))) * k} r={1.8 * k} fill={i % 3 ? ICEA.shade : '#FFFFFF'} opacity={0.7} />)}
		<ellipse cx={0} cy={rimY} rx={rw} ry={6 * k} fill="none" stroke="#F4F8FA" strokeWidth={2.5} />
		<path d={`M${-rw * 0.62},${rimY + 8 * k} Q${-rw * 0.5},${rimY + 17 * k} ${-rw * 0.24},${rimY + 20 * k}`} stroke="#FFFFFF" strokeWidth={5 * k} fill="none" strokeLinecap="round" />
		<g transform={`translate(${rw * 0.44},${rimY + 10 * k})`} fill="#FFFFFF"><path d={`M0,${-14 * k} L${2.2 * k},${-2.2 * k} L${14 * k},0 L${2.2 * k},${2.2 * k} L0,${14 * k} L${-2.2 * k},${2.2 * k} L${-14 * k},0 L${-2.2 * k},${-2.2 * k} Z`} /></g>
	</g>; };
export const IceTicket: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	return <g transform={`translate(${x},${y}) rotate(-4)`}>
		<rect x={-30 * k} y={-110 * k} width={60 * k} height={110 * k} fill="#EFE2C4" stroke="#8A6A3A" strokeWidth={1.5} />
		<rect x={-24 * k} y={-104 * k} width={48 * k} height={98 * k} fill="none" stroke="#22150F" strokeWidth={1.4} />
		{[-12, 0, 12].map((dx, i) => <path key={i} d={`M${dx * k},${-94 * k} v${14 * k} m0,${6 * k} v${10 * k} m0,${6 * k} v${16 * k}`} stroke="#22150F" strokeWidth={3 * k} strokeLinecap="round" />)}
		<rect x={-14 * k} y={-38 * k} width={28 * k} height={28 * k} fill="#BF3420" opacity={0.9} /></g>; };
export const PlumBowl: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-46 * k},${-40 * k} Q${-40 * k},${-8 * k} ${-16 * k},${-4 * k} L${-14 * k},0 L${14 * k},0 L${16 * k},${-4 * k} Q${40 * k},${-8 * k} ${46 * k},${-40 * k} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.5} />
		<ellipse cx={0} cy={-40 * k} rx={46 * k} ry={10 * k} fill="#3A120C" stroke={BRZ.hi} strokeWidth={2} />
		<ellipse cx={-6 * k} cy={-42 * k} rx={30 * k} ry={5 * k} fill="#6A2418" opacity={0.8} />
		<g transform={`translate(${12 * k},${-46 * k}) rotate(12)`}><rect x={-9 * k} y={-9 * k} width={18 * k} height={18 * k} rx={3} fill="url(#ice51F)" stroke={ICEA.line} strokeWidth={1.2} /></g></g>; };
export const EnamelBox: React.FC<{x: number; y: number; s: number; breath?: number}> = ({x, y, s, breath = 1}) => { const k = s / 100;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-50 * k},0 L${-44 * k},${-18 * k} L${44 * k},${-18 * k} L${50 * k},0 Z`} fill="#2A1710" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
		<rect x={-46 * k} y={-84 * k} width={92 * k} height={66 * k} fill="#1F4E7A" stroke="#E8BC66" strokeWidth={2} />
		<path d={`M${-40 * k},${-76 * k} h${80 * k} v${50 * k} h${-80 * k} Z M${-20 * k},${-52 * k} q${20 * k},${-20 * k} ${40 * k},0 q${-20 * k},${20 * k} ${-40 * k},0`} fill="none" stroke="#E8BC66" strokeWidth={1.5} opacity={0.9} />
		<path d={`M${-52 * k},${-84 * k} L${52 * k},${-84 * k} L${46 * k},${-96 * k} L${-46 * k},${-96 * k} Z`} fill="#2C6494" stroke="#E8BC66" strokeWidth={2} />
		{[-26, 0, 26].map((dx, i) => <g key={i}><circle cx={dx * k} cy={-90 * k} r={5 * k} fill="#0E0705" stroke="#E8BC66" strokeWidth={1.2} /><rect x={dx * k - 2 * k} y={-92 * k} width={4 * k} height={4 * k} fill="#E8BC66" /></g>)}
		{breath > 0 && [-26, 0, 26].map((dx, i) => <path key={i} d={curl(dx * k + 4, -110 * k, 9 * k, i % 2 ? -1 : 1, 1.6, 0.4)} fill="none" stroke="#DCEFF8" strokeOpacity={0.6 * breath} strokeWidth={2.5} strokeLinecap="round" />)}</g>; };


/** the walk as one line. Film use: pscale[i] (each prop's scale about its base), psnow[i] (snow inside it), lab (labels), lineO
    (the gold line), ffrost (today's fridge's own frost) */
export const P1Line: React.FC<{t: number; dim?: boolean; snow?: number; wx?: number; wpose?: Pose; wflip?: boolean; pscale?: number[]; psnow?: number[]; lab?: number; lineO?: number; ffrost?: number; ground?: string}> = ({t, dim, snow = 1, wx: wxIn, wpose, wflip = true, pscale, psnow, lab = 1, lineO = 1, ffrost = 0.6, ground}) => { const g = 800;
	const xs = [190, 355, 525, 690, 850, 1005, 1160, 1320, 1500];
	const eras = ['周', '战国', '唐', '唐', '北宋', '清', '清', '乾隆', '今天'];
	const props: React.ReactNode[] = [
		<IceBlockA key={0} x={xs[0]} y={g} w={120} h={90} d={50} seed={3} />,
		<Jianfou key={1} x={xs[1]} y={g} w={140} id="p1j" />,
		<IceMountainI key={2} x={xs[2]} y={g} s={140} />,
		<SuShan key={3} x={xs[3]} y={g} s={130} />,
		<SilverBowlI key={4} x={xs[4]} y={g} s={130} />,
		<IceTicket key={5} x={xs[5]} y={g} s={120} />,
		<PlumBowl key={6} x={xs[6]} y={g} s={136} />,
		<EnamelBox key={7} x={xs[7]} y={g} s={130} />,
		<Fridge key={8} x0={xs[8] - 75} y0={g - 290} w={150} h={290} open={0.8} light={1} frost={ffrost} id="p1f" t={t} />,
	];
	const tops = [110, 150, 150, 120, 120, 130, 100, 140, 300];
	const wp = wpose ?? stand({lean: 2, neck: 6, la: 4, le: 18}), wx = wxIn ?? 1640, wh = 330;
	return <g>
		<Ground g={g} lattice={false} fill={ground} />
		<path d={`M120,${g + 2} H1580`} stroke={B.goldL} strokeOpacity={0.55 * lineO} strokeWidth={2.5} />
		{xs.map((x, i) => { const sc = pscale ? pscale[i] : 1; if (sc <= 0.005) return null; return <g key={i} transform={`translate(${x},${g}) scale(${sc}) translate(${-x},${-g})`}>
			<Pool id={`p1${i}${dim ? 'd' : ''}`} x={x} y={g - 60} rx={110} ry={150} a={0.16} />
			<circle cx={x} cy={g + 2} r={5} fill={B.goldL} opacity={lineO} />
			{props[i]}
			{/* winter inside each: snow falling within the thing's own space */}
			<defs><clipPath id={`sn${i}${dim ? 'd' : ''}`}><ellipse cx={x} cy={g - tops[i] / 2 - 10} rx={i === 8 ? 72 : 78} ry={tops[i] / 2 + 34} /></clipPath></defs>
			<g clipPath={`url(#sn${i}${dim ? 'd' : ''})`} opacity={psnow ? psnow[i] : snow}><Snow x0={x - 80} x1={x + 80} y0={g - tops[i] - 50} y1={g} n={26} t={t} seed={i + 1} size={1.05} o={1} /></g>
			{lab > 0 && <Label x={x} y={g + 70} s={eras[i]} fs={52} anchor="middle" o={0.9 * lab} />}
		</g>; })}
		<Pool id={`p1w${dim ? 'd' : ''}`} x={wx} y={g + 2} rx={140} ry={26} a={0.3} />
		<Walker51 x={wx} g={g} h={wh} pose={wp} look={L51A.today.look} flip={wflip} T={t} />
	</g>; };

export const P2Shot: React.FC<{frost?: number; t?: number}> = ({frost = 1, t = 0}) => { const x0 = 700, y0 = 160, fw = 520, fh = 860;
	return <g>
		<rect x={-40} y={700} width={W + 80} height={400} fill="#1E100B" />
		<Ground g={1020} lattice={false} />
		<Fridge x0={x0} y0={y0} w={fw} h={fh} open={0.9} light={1} frost={frost} id="p2f" t={t} />
		<g opacity={0.5}><P1Mini /></g>
	</g>; };
export const P1Mini: React.FC = () => <g>{[220, 380, 1460, 1620].map((x, i) => <circle key={i} cx={x} cy={1000} r={5} fill={B.goldL} />)}<path d="M100,1002 H700 M1220,1002 H1820" stroke={B.goldL} strokeOpacity={0.5} strokeWidth={2} /></g>;
export const SOURCES51 = ['资料：《诗经》《周礼》（南京博物院《十三经》本）《太平御览》《东京梦华录》 · 《开元天宝遗事》《燕京岁时记》《清稗类钞》',
	'（据解放日报2025、中新网2022、新京报2026、《人民周刊》2019引） · 中国国家博物馆 · 湖北省博物馆（中新社2025） · 新华社（2025） · 宝鸡市文物局',
	'故宫博物院周乾 · 北京大学李零（澎湃2017） · 上海社科院程鹏（中新网2022） · 国家统计局'];

/** a paper lantern (oval, warm, small top and bottom caps, a short cord above, a tassel below); (x, y) = its centre */
export const Lantern51: React.FC<{x: number; y: number; s?: number; lit?: number}> = ({x, y, s = 1, lit = 1}) => { const rx = 30 * s, ry = 42 * s;
	const c = (a: string, b: string) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); return `rgb(${[16, 8, 0].map((k) => Math.round(lerp((pa >> k) & 255, (pb >> k) & 255, lit))).join(',')})`; };
	return <g>
		<path d={`M${x},${y - ry - 40 * s} V${y - ry - 10 * s}`} stroke="#3A2416" strokeWidth={3 * s} />
		{lit > 0.05 && <ellipse cx={x} cy={y} rx={rx * 1.5} ry={ry * 1.35} fill="#FFB060" opacity={0.2 * lit} filter="url(#mistS)" />}
		<rect x={x - 14 * s} y={y - ry - 10 * s} width={28 * s} height={10 * s} rx={2} fill="#2A1710" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.2} />
		<ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c('#4A1C12', '#F2A55A')} />
		{lit > 0.05 && <ellipse cx={x - rx * 0.15} cy={y - ry * 0.1} rx={rx * 0.6} ry={ry * 0.62} fill="#FFE6B0" opacity={0.75 * lit} />}
		<path d={[-0.66, -0.22, 0.22, 0.66].map((u) => { const yy = y + u * ry, hw = rx * Math.sqrt(1 - u * u); return `M${x - hw},${yy} Q${x},${yy - 4 * s} ${x + hw},${yy}`; }).join(' ')} fill="none" stroke="#9A4A22" strokeWidth={1.5} opacity={0.55} />
		<rect x={x - 12 * s} y={y + ry} width={24 * s} height={9 * s} rx={2} fill="#2A1710" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.2} />
		<path d={`M${x},${y + ry + 9 * s} V${y + ry + 26 * s}`} stroke="#B8432A" strokeWidth={3 * s} strokeLinecap="round" />
	</g>; };

export {Figure4};

/* ---------- §2 colour looks for B's scenes (round 3), from Builder A's palette51 tokens (PAL[look][era]); 'cur' keeps the approved
   values. Local tokens (not in palette51): umbrella cloth, wood, doors, door leaves, tubs, the extras' tone. ---------- */
const mixC = (a: string, b: string, k: number) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); return '#' + [16, 8, 0].map((s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, k)).toString(16).padStart(2, '0')).join(''); };
type SongPal = {sky: string[]; skyO: number; sunA: number; sunCol: string; far: string; farO: number; midRoof: string; midPost: string; midBeam: string; midLine: string; street: string; ground: string; umb: string; neut: string; back: string; backA: number; wood: string};
export const songPal = (look: LookId): SongPal => { if (look === 'cur') return {sky: ['#24120B', '#5A2F1A', '#6E3D20', '#2A150D'], skyO: 0.75, sunA: 0.42, sunCol: '#FFC070', far: '#2C170F', farO: 1, midRoof: '#140A07', midPost: '#26120D', midBeam: '#2E1610', midLine: 'rgba(232,188,102,0.26)', street: '#241209', ground: '#150B08', umb: '#2A3A4E', neut: '#120A07', back: '#FFD9A0', backA: 0, wood: '#2E1610'};
	const P = palOf(look, 'song'), era = look === 'era';
	return {sky: [P.sky[0], P.sky[1], P.sky[2], P.field[0]], skyO: P.skyA, sunA: era ? 0.2 : 0.46, sunCol: era ? '#FFE8B8' : '#FFD08A', far: P.far, farO: 0.85, midRoof: mixC(P.mid, '#000000', era ? 0.55 : 0.45),
		midPost: P.mid, midBeam: P.panel, midLine: P.line, street: mixC(P.mid, P.field[0], 0.5), ground: P.field[1], umb: era ? '#2E5E82' : '#3A6288', neut: era ? '#1A100C' : '#0E0604', back: P.backdrop, backA: P.backdropA, wood: era ? '#7A4E2A' : '#6A3E22'}; };
type HutPal = {sky: string[] | null; wall: string; wallLine: string; wallLineO: number; coping: string; sunA: number; sunCol: string; door: string; leaf: string; ground: string; tub: string; back: string; backA: number};
export const hutPal = (look: LookId): HutPal => { if (look === 'cur') return {sky: null, wall: '#221816', wallLine: '#C9B9A6', wallLineO: 0.06, coping: '#141010', sunA: 0.26, sunCol: '#FFC070', door: '#140C0A', leaf: '#2A1712', ground: '#150B08', tub: '#3A2416', back: '#FFD9A0', backA: 0};
	const P = palOf(look, 'qingSummer'), era = look === 'era';
	return {sky: [P.sky[0], P.sky[2]], wall: P.mid, wallLine: era ? '#2E2824' : '#E8D2B0', wallLineO: era ? 0.18 : 0.12, coping: mixC(P.mid, '#000000', 0.5), sunA: era ? 0.2 : 0.4, sunCol: era ? '#FFE8C0' : '#FFD08A',
		door: era ? '#7A2C1E' : '#5A2416', leaf: era ? '#5E2216' : '#6E2E1A', ground: P.field[1], tub: '#6A4426', back: P.backdrop, backA: P.backdropA}; };

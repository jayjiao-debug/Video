import React from 'react';
import {W, H, SERIF, rnd, cl, sm, lerp} from './v3base';
import {seg, ease, Flash} from './fx';
/* Title 11.564–18.965: on black a glowing crack (卜兆) splits across the frame and the title burns in along it;
   embers rise; at the end the crack cools and the camera finds it again on a real shell (the Shang scene picks it up). */
export const GOLD3 = '#f2cf7a';
/** a seeded crack: a jagged main line with side branches; returns path strings and their lengths (approx) */
export const crackPaths = (x0: number, y0: number, x1: number, y1: number, seed: number, n = 22, amp = 18) => {
	const pts: [number, number][] = [];
	for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (i && i < n ? (rnd(i, seed) - 0.5) * amp * 0.6 : 0), lerp(y0, y1, u) + (i && i < n ? (rnd(i, seed + 1) - 0.5) * amp * 2 : 0)]); }
	const main = 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L');
	const branches = pts.filter((_, i) => i > 1 && i < n - 1 && rnd(i, seed + 2) > 0.62).map((p, k) => { const a = (rnd(k, seed + 3) - 0.5) * 2.2 + (rnd(k, seed + 4) > 0.5 ? Math.PI / 2 : -Math.PI / 2), L = 30 + 80 * rnd(k, seed + 5);
		const m: [number, number] = [p[0] + Math.cos(a) * L * 0.5 + (rnd(k, seed + 6) - 0.5) * 12, p[1] + Math.sin(a) * L * 0.5];
		return `M${p[0].toFixed(1)},${p[1].toFixed(1)} L${m[0].toFixed(1)},${m[1].toFixed(1)} L${(p[0] + Math.cos(a) * L).toFixed(1)},${(p[1] + Math.sin(a) * L).toFixed(1)}`; });
	return {main, branches, len: Math.hypot(x1 - x0, y1 - y0) * 1.15};
};
const Embers: React.FC<{t: number; k: number}> = ({t, k}) => <g opacity={k}>{Array.from({length: 60}, (_, i) => { const life = 3 + 3 * rnd(i, 1), u = ((t + rnd(i, 2) * life) % life) / life;
	const x = 200 + rnd(i, 3) * 1520 + Math.sin(t * (0.5 + rnd(i, 4)) + i) * 30, y = 760 - u * 620;
	return <circle key={i} cx={x} cy={y} r={1 + 2.4 * rnd(i, 5)} fill={rnd(i, 6) > 0.5 ? '#ffb45a' : '#ffd88a'} opacity={(1 - u) * (0.3 + 0.6 * rnd(i, 7)) * Math.min(1, u * 6)} />; })}</g>;

export const TITLE3: React.FC<{tau: number; t: number; dur: number}> = ({tau, t, dur}) => {
	const c = crackPaths(-40, 548, W + 40, 528, 7, 30, 22), draw = ease(seg(tau, 0, 0.55)), heat = 1 - 0.75 * sm(seg(tau, 1.2, dur - 0.3));
	const l1 = sm(seg(tau, 0.45, 1.5)), l2 = sm(seg(tau, 1.35, 2.4)), out = seg(tau, dur - 0.7, dur);
	const glow = (k: number) => `drop-shadow(0 0 ${4 + 18 * k}px rgba(255,150,60,${0.4 + 0.5 * k}))`;
	const push = lerp(1, 1.06, seg(tau, 0, dur));
	return <g>
		<rect width={W} height={H} fill="#030203" />
		<radialGradient id="t3warm" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#3a1a08" stopOpacity={0.6 * heat} /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
		<rect width={W} height={H} fill="url(#t3warm)" />
		<g transform={`translate(${W / 2},${H / 2}) scale(${push}) translate(${-W / 2},${-H / 2})`}>
			<g style={{filter: glow(heat)}}>
				<path d={c.main} stroke={heat > 0.6 ? '#ffd9a0' : '#e8dcc6'} strokeWidth={3.2} fill="none" strokeDasharray={c.len} strokeDashoffset={c.len * (1 - draw)} strokeLinejoin="bevel" />
				{c.branches.map((b, i) => <path key={i} d={b} stroke="#ffc27a" strokeWidth={1.8} fill="none" strokeDasharray={200} strokeDashoffset={200 * (1 - sm(seg(tau, 0.3 + i * 0.04, 0.9 + i * 0.04)))} opacity={0.85} />)}
			</g>
			<text x={W / 2} y={470} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 96, letterSpacing: '0.08em', filter: glow(heat * l1 * (1 - l1 * 0.5))}} fill={l1 < 1 ? '#ffe2b8' : '#ffffff'} opacity={l1 * (1 - out)}>为了跟你说一句话</text>
			<text x={W / 2} y={650} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 96, letterSpacing: '0.08em', filter: glow(heat * l2 * 0.6)}} fill={GOLD3} opacity={l2 * (1 - out)}>人类努力了三千年</text>
		</g>
		<Embers t={t} k={cl(tau / 0.6) * (1 - out * 0.5)} />
		<Flash k={(1 - seg(tau, 0, 0.18)) * 0.3} col="#ffe2b8" />
	</g>;
};

import React from 'react';
import {SERIF} from '../qq50/kit50';
import {f1} from './cao54b';
import {NpcWalk, npcHipX} from './rig54b';
/* ep54 · owner notes on card 3 (the 洛阳 gate wide, film 8.62–12.61): 「这里可以有守卫，向左走。城门上可以有城池名字。」
   GatePlaque: a dark wooden 匾 on the wall above the central passage with 洛阳 in carved gilt characters (sheet coordinates,
   the GateWall of demo54m: central passage x 560, its lintel frame top y 360, the 门楼 platform bottom y 300).
   GateGuards: three 戟 guards walking LEFT across the lit road in front of the gate (planted-foot walk, adult proportions),
   with soft shadows thrown toward the camera by the passage light behind them. */
const SIL = '#140D0A';

/** the plaque, centred on x = cx, from y = top to y = top + h (sheet units); fl = the gate's light breathing */
export const GatePlaque: React.FC<{cx: number; top: number; w: number; h: number; fl: number; p: string}> = ({cx, top, w, h, fl, p}) => {
	const x0 = cx - w / 2, fr = 5, fs = h - 2 * fr - 4, gy = top + h / 2 + fs * 0.38, tx = cx + fs * 0.06;
	return <g>
		<defs>
			<linearGradient id={`${p}pqw`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E130C" /><stop offset="0.55" stopColor="#2C1C12" /><stop offset="1" stopColor="#3E2818" /></linearGradient>
			<linearGradient id={`${p}pqg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B7863A" /><stop offset="0.45" stopColor="#E2B866" /><stop offset="1" stopColor="#FBE3A6" /></linearGradient>
			<filter id={`${p}pqs`} x="-10%" y="-20%" width="120%" height="150%"><feGaussianBlur stdDeviation="1.6" /></filter>
		</defs>
		{/* its shadow on the wall (the light is low, in front: the shadow falls up and back a little) */}
		<rect x={x0 + 2} y={top - 3} width={w} height={h + 2} fill="#000" opacity={0.42} filter={`url(#${p}pqs)`} />
		{/* two iron hangers into the 平座 beam */}
		{[x0 + w * 0.22, x0 + w * 0.78].map((x) => <rect key={x} x={x - 1.6} y={top - 4} width={3.2} height={7} fill="#0E0A08" />)}
		{/* the frame (dark lacquered wood) and its lit lower edge */}
		<rect x={x0} y={top} width={w} height={h} rx={1.2} fill="#140C08" />
		<rect x={x0} y={top + h - 1.6} width={w} height={1.6} fill="#D9A26A" opacity={0.45 * fl} />
		<rect x={x0 + 1.2} y={top + 1.2} width={w - 2.4} height={h - 2.4} fill="none" stroke="#5A3C22" strokeWidth={0.7} opacity={0.8} />
		{/* the recessed field */}
		<rect x={x0 + fr} y={top + fr} width={w - 2 * fr} height={h - 2 * fr} fill={`url(#${p}pqw)`} />
		<rect x={x0 + fr} y={top + fr} width={w - 2 * fr} height={1.3} fill="#E6B378" opacity={0.32 * fl} />
		<rect x={x0 + fr} y={top + h - fr - 1} width={w - 2 * fr} height={1} fill="#000" opacity={0.5} />
		{Array.from({length: 7}, (_, i) => <path key={i} d={`M${f1(x0 + fr + 2)},${f1(top + fr + 4 + i * (h - 2 * fr - 8) / 6)} C${f1(x0 + w * 0.4)},${f1(top + fr + 3 + i * (h - 2 * fr - 8) / 6 + (i % 2 ? 1.2 : -1.2))} ${f1(x0 + w * 0.7)},${f1(top + fr + 5 + i * (h - 2 * fr - 8) / 6)} ${f1(x0 + w - fr - 2)},${f1(top + fr + 4 + i * (h - 2 * fr - 8) / 6)}`} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={0.5} />)}
		{/* corner studs */}
		{[[x0 + 2.6, top + 2.6], [x0 + w - 2.6, top + 2.6], [x0 + 2.6, top + h - 2.6], [x0 + w - 2.6, top + h - 2.6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.3} fill="#9C7A48" opacity={0.85} />)}
		{/* 洛阳: raised gilt characters; the carving's shadow above (the light is below), a dark rim, the gilt with its lit lower half */}
		<text x={tx} y={gy - 1.1} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={fs} letterSpacing={fs * 0.12} fill="#000" opacity={0.65}>洛阳</text>
		<text x={tx} y={gy} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={fs} letterSpacing={fs * 0.12} fill={`url(#${p}pqg)`} stroke="#3A230F" strokeWidth={0.7} style={{paintOrder: 'stroke'}}>洛阳</text>
	</g>; };

/** three 戟 guards walking left (−x) on the road, feet on y = gy; m = the shot clock (s) */
export type Guard = {x0: number; t0: number; L: number; f: number; sw: number; ln: number};
export const GUARDS: Guard[] = [{x0: 768, t0: 0.15, L: 62, f: 1.7, sw: 0.9, ln: 3.5}, {x0: 842, t0: 0.62, L: 63, f: 1.68, sw: 1.05, ln: 3}, {x0: 918, t0: 0.38, L: 61, f: 1.73, sw: 0.8, ln: 4}];
export const GateGuards: React.FC<{m: number; gy: number; k: number; lightX: number; rim: string; blur: string}> = ({m, gy, k, lightX, rim, blur}) => <g>
	{/* shadows toward the camera, leaning away from the passage light */}
	<g fill="#000" opacity={0.34} filter={`url(#${blur})`}>
		{GUARDS.map((g, i) => { const gx = g.x0 - npcHipX(m, g.L, g.f, g.t0) * k, sk = Math.max(-55, Math.min(55, (gx - lightX) * 0.32));
			return <g key={i} transform={`translate(${f1(g.x0)},${f1(gy + 0.6)}) translate(${f1(gx - g.x0)},0) skewX(${f1(sk)}) translate(${f1(g.x0 - gx)},0) scale(${-k},${(-k * 0.34).toFixed(4)})`}>
				<NpcWalk t={m} kind="ji" t0={g.t0} L={g.L} f={g.f} swing={g.sw} lean={g.ln} /></g>; })}
	</g>
	<g fill={SIL} filter={`url(#${rim})`}>
		{GUARDS.map((g, i) => <g key={i} transform={`translate(${g.x0},${gy}) scale(${-k},${k})`}><NpcWalk t={m} kind="ji" t0={g.t0} L={g.L} f={g.f} swing={g.sw} lean={g.ln} /></g>)}
	</g>
</g>;

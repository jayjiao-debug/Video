import React from 'react';
import {GOLD, CYAN, rnd, circ, G, Solid, SANDC, Rosette} from './circle40parts';
export const GR = 880;                                  // the walking line, shared by every scene
const D2R = Math.PI / 180;
type V = [number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const dir = (deg: number, l: number): V => [Math.sin(deg * D2R) * l, Math.cos(deg * D2R) * l];   // 0° = straight down, + = forward

export type Look = {
	robe?: 'long' | 'knee' | 'jacket' | 'none'; head?: 'douli' | 'greek' | 'songcap' | 'turban' | 'beret' | 'kepler' | 'monk' | 'suit' | 'tophat' | 'bun' | 'futou' | 'longhair' | 'short' | 'cap';
	beard?: 'short' | 'long' | 'point'; cape?: boolean; ruff?: boolean; carry?: 'spade' | 'staff' | 'tile' | 'book' | 'model' | 'vase' | 'paper' | 'letter' | 'tape' | 'bone' | 'disk' | 'none';
};

/** a side-view walking silhouette, facing right. `p` = walk-cycle phase 0..1, `h` = full height in px */
export const Walker: React.FC<{x: number; h: number; p: number; look: Look; col?: string; far?: string; T?: number}> = ({x, h, p, look, col = '#0b0a12', far = '#1d1a28', T = 0}) => {
	const w = 2 * Math.PI * p, Lt = 0.245 * h, Ls = 0.245 * h, Lf = 0.13 * h, Lto = 0.3 * h, Lu = 0.18 * h, Lfa = 0.17 * h;
	const leg = (s: number) => { const th = 24 * Math.sin(w + s), kn = 6 + 42 * Math.max(0, Math.cos(w + s)), ph = th - kn; return {th, ph}; };
	const A = leg(0), B = leg(Math.PI);
	const lowest = Math.max(...[A, B].map(({th, ph}) => Math.cos(th * D2R) * Lt + Math.cos(ph * D2R) * Ls));
	const hip: V = [x, GR - lowest - 0.035 * h];
	const limbs = ({th, ph}: {th: number; ph: number}) => { const k = add(hip, dir(th, Lt)), a = add(k, dir(ph, Ls)), pitch = Math.max(0, -ph) * 0.8, toe = add(a, [Math.cos(pitch * D2R) * Lf, Math.sin(pitch * D2R) * Lf + 0.03 * h]); return {k, a, toe, heel: add(a, [-0.03 * h, 0.03 * h])}; };
	const LA = limbs(A), LB = limbs(B);
	const lean = 5, sh = add(hip, [Math.sin(lean * D2R) * Lto, -Math.cos(lean * D2R) * Lto]);
	const hc = add(sh, [0.025 * h, -0.105 * h]), hr = 0.062 * h;
	const carryFwd = look.carry === 'tile' || look.carry === 'model' || look.carry === 'vase';
	const arm = (s: number, near: boolean) => {
		let al = -20 * Math.sin(w + s), el = 18 + 12 * Math.max(0, Math.sin(w + s));
		if (near && carryFwd) { al = look.carry === 'model' ? 55 : 40; el = look.carry === 'model' ? 70 : 50; }
		if (near && look.carry === 'spade') { al = 30; el = 139; }
		if (!near && look.carry === 'vase') { al = 46; el = 44; }
		const e = add(sh, dir(al, Lu)), hd = add(e, dir(al + el, Lfa)); return {e, hd};
	};
	const AN = arm(Math.PI, true), AF = arm(0, false);
	const stroke = (pts: V[], wd: number, c: string) => <path d={'M' + pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' L')} stroke={c} strokeWidth={wd} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
	const legDraw = (L: typeof LA, c: string) => <g>{stroke([hip, L.k], 0.075 * h, c)}{stroke([L.k, L.a], 0.055 * h, c)}{stroke([L.heel, L.toe], 0.04 * h, c)}</g>;
	const armDraw = (Ar: typeof AN, c: string) => <g>{stroke([sh, Ar.e], 0.045 * h, c)}{stroke([Ar.e, Ar.hd], 0.038 * h, c)}<circle cx={Ar.hd[0]} cy={Ar.hd[1]} r={0.025 * h} fill={c} /></g>;
	// clothing
	const kx = [LA.k[0], LB.k[0]], ax = [LA.a[0], LB.a[0]];
	let robe: string | null = null;
	if (look.robe === 'long' || look.robe === 'knee') {
		const long = look.robe === 'long', hem = long ? GR - 0.12 * h : Math.max(LA.k[1], LB.k[1]) + 0.04 * h;
		// the hem follows the stride: front edge rides the forward leg, back edge the trailing leg
		const at = (L: typeof LA) => { const u = Math.min(1, Math.max(0, (hem - L.k[1]) / Math.max(1, L.a[1] - L.k[1]))); return long ? L.k[0] + (L.a[0] - L.k[0]) * u : L.k[0]; };
		const xa = at(LA), xb = at(LB), fx = Math.max(xa, xb) + 0.06 * h, bx = Math.min(xa, xb) - 0.05 * h;
		robe = `M${sh[0] - 0.075 * h},${sh[1] + 0.015 * h} Q${sh[0]},${sh[1] - 0.012 * h} ${sh[0] + 0.065 * h},${sh[1] + 0.008 * h} L${hip[0] + 0.07 * h},${hip[1] - 0.07 * h} Q${hip[0] + 0.08 * h},${hip[1] + 0.02 * h} ${fx},${hem} Q${(fx + bx) / 2},${hem + 0.025 * h} ${bx},${hem + 0.01 * h} Q${hip[0] - 0.1 * h},${hip[1] + 0.02 * h} ${hip[0] - 0.075 * h},${hip[1] - 0.06 * h} Z`;
	}
	if (look.robe === 'jacket') robe = `M${sh[0] - 0.08 * h},${sh[1] + 0.015 * h} Q${sh[0]},${sh[1] - 0.012 * h} ${sh[0] + 0.07 * h},${sh[1] + 0.008 * h} L${hip[0] + 0.075 * h},${hip[1] + 0.08 * h} L${hip[0] - 0.08 * h},${hip[1] + 0.08 * h} Z`;
	const torso = `M${hip[0] - 0.07 * h},${hip[1]} L${hip[0] + 0.065 * h},${hip[1]} L${sh[0] + 0.065 * h},${sh[1] + 0.01 * h} L${sh[0] - 0.07 * h},${sh[1] + 0.02 * h} Z`;
	const [cx, cy] = hc;
	const headwear = () => { switch (look.head) {
		case 'douli': return <path d={`M${cx - 0.17 * h},${cy - 0.02 * h} L${cx + 0.005 * h},${cy - 0.13 * h} L${cx + 0.18 * h},${cy - 0.02 * h} Q${cx},${cy - 0.05 * h} ${cx - 0.17 * h},${cy - 0.02 * h} Z`} fill={col} />;
		case 'greek': return <g>{[-0.05, -0.02, 0.01, 0.035].map((d, i) => <circle key={i} cx={cx + d * h} cy={cy - 0.05 * h + Math.abs(d) * 0.3 * h} r={0.028 * h} fill={col} />)}</g>;
		case 'songcap': return <path d={`M${cx - 0.055 * h},${cy - 0.03 * h} L${cx - 0.05 * h},${cy - 0.15 * h} L${cx + 0.04 * h},${cy - 0.15 * h} L${cx + 0.05 * h},${cy - 0.04 * h} Z M${cx - 0.05 * h},${cy - 0.06 * h} L${cx - 0.13 * h},${cy + 0.04 * h} L${cx - 0.11 * h},${cy + 0.05 * h} L${cx - 0.04 * h},${cy - 0.03 * h} Z`} fill={col} />;
		case 'turban': return <ellipse cx={cx - 0.005 * h} cy={cy - 0.05 * h} rx={0.08 * h} ry={0.058 * h} fill={col} />;
		case 'beret': return <g><ellipse cx={cx - 0.01 * h} cy={cy - 0.058 * h} rx={0.09 * h} ry={0.032 * h} fill={col} transform={`rotate(-8 ${cx} ${cy})`} /><path d={`M${cx - 0.06 * h},${cy - 0.02 * h} Q${cx - 0.1 * h},${cy + 0.06 * h} ${cx - 0.06 * h},${cy + 0.1 * h} L${cx - 0.01 * h},${cy + 0.03 * h} Z`} fill={col} /></g>;
		case 'kepler': return <path d={`M${cx - 0.06 * h},${cy - 0.01 * h} Q${cx - 0.055 * h},${cy - 0.08 * h} ${cx + 0.01 * h},${cy - 0.072 * h} Q${cx + 0.05 * h},${cy - 0.07 * h} ${cx + 0.055 * h},${cy - 0.04 * h} Z`} fill={col} />;
		case 'suit': return <g><path d={`M${cx - 0.065 * h},${cy} Q${cx - 0.06 * h},${cy - 0.075 * h} ${cx + 0.02 * h},${cy - 0.07 * h} Q${cx + 0.06 * h},${cy - 0.06 * h} ${cx + 0.058 * h},${cy - 0.035 * h} Z`} fill={col} /><line x1={cx + 0.02 * h} y1={cy - 0.012 * h} x2={cx + 0.072 * h} y2={cy - 0.012 * h} stroke="#9fb4c8" strokeWidth={0.006 * h} opacity={0.7} /></g>;
		case 'tophat': return <path d={`M${cx - 0.085 * h},${cy - 0.05 * h} L${cx + 0.08 * h},${cy - 0.05 * h} L${cx + 0.07 * h},${cy - 0.065 * h} L${cx + 0.05 * h},${cy - 0.065 * h} L${cx + 0.055 * h},${cy - 0.2 * h} L${cx - 0.05 * h},${cy - 0.2 * h} L${cx - 0.045 * h},${cy - 0.065 * h} L${cx - 0.07 * h},${cy - 0.065 * h} Z`} fill={col} />;
		case 'bun': return <g><circle cx={cx - 0.02 * h} cy={cy - 0.075 * h} r={0.03 * h} fill={col} /><path d={`M${cx - 0.03 * h},${cy - 0.1 * h} L${cx + 0.05 * h},${cy - 0.125 * h}`} stroke={col} strokeWidth={0.008 * h} /></g>;
		case 'futou': return <g><path d={`M${cx - 0.06 * h},${cy - 0.02 * h} Q${cx - 0.06 * h},${cy - 0.1 * h} ${cx},${cy - 0.1 * h} Q${cx + 0.055 * h},${cy - 0.095 * h} ${cx + 0.055 * h},${cy - 0.035 * h} Z`} fill={col} /><circle cx={cx - 0.01 * h} cy={cy - 0.11 * h} r={0.032 * h} fill={col} />
			<path d={`M${cx - 0.05 * h},${cy - 0.05 * h} Q${cx - 0.11 * h},${cy + 0.02 * h} ${cx - 0.1 * h},${cy + 0.1 * h}`} stroke={col} strokeWidth={0.014 * h} fill="none" strokeLinecap="round" /></g>;
		case 'longhair': return <path d={`M${cx - 0.065 * h},${cy + 0.12 * h} Q${cx - 0.09 * h},${cy - 0.02 * h} ${cx - 0.05 * h},${cy - 0.06 * h} Q${cx},${cy - 0.085 * h} ${cx + 0.05 * h},${cy - 0.045 * h} Q${cx + 0.01 * h},${cy - 0.04 * h} ${cx - 0.01 * h},${cy + 0.02 * h} Q${cx - 0.02 * h},${cy + 0.1 * h} ${cx - 0.065 * h},${cy + 0.12 * h} Z`} fill={col} />;
		case 'short': return <path d={`M${cx - 0.064 * h},${cy + 0.005 * h} Q${cx - 0.06 * h},${cy - 0.074 * h} ${cx + 0.015 * h},${cy - 0.07 * h} Q${cx + 0.058 * h},${cy - 0.065 * h} ${cx + 0.06 * h},${cy - 0.03 * h} Z`} fill={col} />;
		case 'cap': return <g><path d={`M${cx - 0.065 * h},${cy - 0.03 * h} Q${cx - 0.05 * h},${cy - 0.085 * h} ${cx + 0.02 * h},${cy - 0.08 * h} Q${cx + 0.06 * h},${cy - 0.07 * h} ${cx + 0.06 * h},${cy - 0.045 * h} L${cx + 0.11 * h},${cy - 0.04 * h} L${cx + 0.06 * h},${cy - 0.03 * h} Z`} fill={col} /></g>;
		default: return null;
	} };
	const beard = look.beard && <path d={look.beard === 'long' ? `M${cx + 0.035 * h},${cy + 0.03 * h} Q${cx + 0.06 * h},${cy + 0.1 * h} ${cx + 0.01 * h},${cy + 0.16 * h} Q${cx - 0.02 * h},${cy + 0.08 * h} ${cx - 0.02 * h},${cy + 0.04 * h} Z` : look.beard === 'point' ? `M${cx + 0.035 * h},${cy + 0.03 * h} L${cx + 0.055 * h},${cy + 0.11 * h} L${cx - 0.01 * h},${cy + 0.05 * h} Z` : `M${cx + 0.04 * h},${cy + 0.025 * h} Q${cx + 0.05 * h},${cy + 0.08 * h} ${cx},${cy + 0.075 * h} L${cx - 0.02 * h},${cy + 0.04 * h} Z`} fill={col} />;
	const nh = AN.hd;
	const carry = () => { switch (look.carry) {
		case 'spade': { const back = add(nh, [-0.5 * h, -0.34 * h]); return <g><line x1={nh[0] + 0.07 * h} y1={nh[1] + 0.047 * h} x2={back[0]} y2={back[1]} stroke={col} strokeWidth={0.02 * h} strokeLinecap="round" />
			<path d={`M${back[0]},${back[1]} l${-0.05 * h},${-0.02 * h} l${-0.03 * h},${0.07 * h} l${0.06 * h},${0.03 * h} Z`} fill={col} /></g>; }
		case 'staff': return <line x1={AN.hd[0] - 0.01 * h} y1={AN.hd[1] - 0.14 * h} x2={AN.hd[0] + 0.07 * h} y2={GR} stroke={col} strokeWidth={0.018 * h} strokeLinecap="round" />;
		case 'tile': return <g transform={`translate(${nh[0] + 0.07 * h},${nh[1] - 0.04 * h}) rotate(-6)`}><rect x={-0.075 * h} y={-0.075 * h} width={0.15 * h} height={0.15 * h} fill="#0c2f4c" stroke={GOLD} strokeWidth={2} /><g transform={`scale(${0.0007 * h})`}><Rosette r={90} strap={0.8} /></g>
			<rect x={-0.075 * h} y={-0.075 * h} width={0.15 * h} height={0.15 * h} fill={GOLD} opacity={0.12} filter="url(#gM)" /></g>;
		case 'book': return <rect x={AN.hd[0] - 0.05 * h} y={AN.hd[1] - 0.02 * h} width={0.1 * h} height={0.075 * h} rx={3} fill={col} transform={`rotate(-12 ${AN.hd[0]} ${AN.hd[1]})`} />;
		case 'model': return <g transform={`translate(${nh[0] + 0.02 * h},${nh[1] - 0.13 * h})`}><circle r={0.15 * h} fill={GOLD} opacity={0.25} filter="url(#gL)" />
			<G d={circ(0.11 * h)} w={1.6} col="#cfd8ff" glow={0.6} /><Solid k="cube" r={0.11 * h} ax={0.5 + T * 0.4} ay={0.8 + T * 0.6} col={GOLD} w={2.2} /><G d={circ(0.064 * h)} w={1.2} col="#cfd8ff" glow={0.5} /><Solid k="tet" r={0.064 * h} ax={0.9 + T * 0.4} ay={0.2 + T * 0.6} col={CYAN} w={2} /><circle r={0.01 * h} fill="#fff" /></g>;
		case 'vase': return <g transform={`translate(${nh[0] + 0.03 * h},${nh[1] - 0.03 * h})`}><path d={`M${-0.03 * h},${-0.09 * h} L${0.03 * h},${-0.09 * h} L${0.02 * h},${-0.06 * h} Q${0.07 * h},${-0.03 * h} ${0.05 * h},${0.04 * h} L${-0.05 * h},${0.04 * h} Q${-0.07 * h},${-0.03 * h} ${-0.02 * h},${-0.06 * h} Z`} fill={col} />
			{Array.from({length: 18}, (_, i) => <circle key={i} cx={(rnd(i, 40) - 0.5) * 0.04 * h} cy={-0.1 * h - rnd(i, 41) * 0.05 * h} r={1.6} fill={SANDC[i % 5]} opacity={0.9} />)}</g>;
		case 'letter': return <g transform={`translate(${nh[0] + 0.02 * h},${nh[1] - 0.02 * h}) rotate(-14)`}><rect x={-0.045 * h} y={-0.03 * h} width={0.09 * h} height={0.06 * h} fill="#efe3c6" /><path d={`M${-0.045 * h},${-0.03 * h} L0,${0.005 * h} L${0.045 * h},${-0.03 * h}`} stroke="#9a8460" strokeWidth={1.5} fill="none" /><rect x={-0.06 * h} y={-0.05 * h} width={0.12 * h} height={0.1 * h} fill={GOLD} opacity={0.18} filter="url(#gM)" /></g>;
		case 'tape': return <g>{Array.from({length: 7}, (_, i) => { const x0 = nh[0] - i * 0.04 * h, y0 = nh[1] + i * 0.012 * h + Math.sin(i + T * 3) * 0.008 * h; return <g key={i}><rect x={x0 - 0.04 * h} y={y0 - 0.008 * h} width={0.042 * h} height={0.016 * h} fill="#efe3c6" />{[0, 1].map((k2) => <rect key={k2} x={x0 - 0.035 * h + k2 * 0.018 * h} y={y0 - 0.003 * h} width={k2 === i % 2 ? 0.012 * h : 0.004 * h} height={0.006 * h} fill="#2a2018" />)}</g>; })}</g>;
		case 'bone': return <g transform={`translate(${nh[0] + 0.03 * h},${nh[1] - 0.02 * h}) rotate(-20)`}><path d={`M${-0.06 * h},0 Q${-0.05 * h},${-0.05 * h} 0,${-0.055 * h} Q${0.06 * h},${-0.05 * h} ${0.065 * h},0 Q${0.04 * h},${0.045 * h} 0,${0.05 * h} Q${-0.05 * h},${0.045 * h} ${-0.06 * h},0 Z`} fill="#d9c79f" />
			<path d={`M${-0.02 * h},${-0.03 * h} l${0.01 * h},${0.025 * h} l${0.015 * h},${0.005 * h} M${0.02 * h},${-0.02 * h} l0,${0.03 * h} l${0.012 * h},${0.008 * h}`} stroke="#5a3a20" strokeWidth={2} fill="none" /><circle r={0.09 * h} fill={GOLD} opacity={0.18} filter="url(#gM)" /></g>;
		case 'disk': return <g transform={`translate(${nh[0] + 0.02 * h},${nh[1] - 0.02 * h})`}><rect x={-0.035 * h} y={-0.035 * h} width={0.07 * h} height={0.07 * h} fill="#2b2f3a" /><rect x={-0.02 * h} y={-0.035 * h} width={0.04 * h} height={0.022 * h} fill="#aab4c4" /><rect x={-0.025 * h} y={0.002 * h} width={0.05 * h} height={0.03 * h} fill="#e8e4d4" /></g>;
		case 'paper': { const top = add(nh, [0.01 * h, -0.01 * h]); return <g>{Array.from({length: 6}, (_, i) => { const y0 = top[1] + i * 0.05 * h; return <g key={i}><rect x={top[0] - 0.04 * h + (i % 2) * 0.012 * h} y={y0} width={0.09 * h} height={0.05 * h} fill="#e8e4d4" stroke="#8a8676" strokeWidth={1} />
			{i % 2 === 0 && <rect x={top[0] - 0.03 * h} y={y0 + 0.012 * h} width={0.06 * h} height={0.024 * h} fill="#30406a" opacity={0.6} />}</g>; })}</g>; }
		default: return null;
	} };
	return <g>
		{look.cape && <path d={`M${sh[0] - 0.06 * h},${sh[1]} Q${sh[0] - 0.2 * h},${hip[1] - 0.05 * h} ${hip[0] - 0.17 * h},${hip[1] + 0.06 * h} L${hip[0] - 0.02 * h},${hip[1] + 0.03 * h} Z`} fill={far} />}
		{armDraw(AF, far)}
		{legDraw(LB, far)}
		{legDraw(LA, col)}
		<path d={torso} fill={col} stroke={col} strokeWidth={0.02 * h} strokeLinejoin="round" />
		{robe && <path d={robe} fill={col} />}
		{look.ruff && <ellipse cx={sh[0] + 0.01 * h} cy={sh[1] - 0.02 * h} rx={0.075 * h} ry={0.024 * h} fill={col} />}
		<path d={`M${sh[0] - 0.012 * h},${sh[1]} L${cx - 0.02 * h},${cy + 0.04 * h} L${cx + 0.03 * h},${cy + 0.04 * h} L${sh[0] + 0.03 * h},${sh[1]} Z`} fill={col} />
		<circle cx={cx} cy={cy} r={hr} fill={col} />
		<path d={`M${cx + 0.055 * h},${cy - 0.012 * h} L${cx + 0.082 * h},${cy + 0.014 * h} L${cx + 0.055 * h},${cy + 0.022 * h} Z`} fill={col} />
		{headwear()}{beard}
		{look.carry === 'spade' || look.carry === 'staff' ? carry() : null}
		{armDraw(AN, col)}
		{look.carry !== 'spade' && look.carry !== 'staff' ? carry() : null}
	</g>;
};


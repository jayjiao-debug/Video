import React from 'react';
import {W, H, rnd, seg, lerp, sm, eo, ei, f1} from './bg59';
/* ep59 transitions (owner 19:04: "real transitions between scenes … match cuts on stride/shape/light, the ice crack wipe, calendar pages
   flying into the lens, fog pushing through, whip-free pushes"). Each takes film time t and the moment it is centred on (or its window),
   draws only while it is active, and never flashes for more than two frames. */

/** the ice-crack wipe: a jagged crack runs across the frame (left → right), then the two halves of the old shot split apart, revealing the
    new one underneath. `Old` is drawn twice (clipped above / below the crack). Window: t0 (crack starts) → t0 + 0.42. */
export const CrackWipe: React.FC<{t: number; t0: number; id: string; children: React.ReactNode}> = ({t, t0, id, children}) => {
	const run = seg(t, t0, t0 + 0.16), open = eo(seg(t, t0 + 0.12, t0 + 0.42));
	if (t < t0 - 0.01) return <>{children}</>;
	if (open >= 1) return null;
	/* the crack: a zig-zag from (−40, 560) to (1960, 500) with fine teeth */
	const pts: [number, number][] = Array.from({length: 23}, (_, i) => { const u = i / 22; return [lerp(-40, 1960, u), lerp(800, 700, u) + (i % 2 ? 1 : -1) * (20 + 34 * rnd(i, 7)) + 40 * Math.sin(u * 5.3)]; });
	const n = Math.max(1, Math.ceil(run * (pts.length - 1)));
	const line = pts.slice(0, n + 1).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');
	const top = `M-60,-60 L${W + 60},-60 L${W + 60},${f1(pts[pts.length - 1][1])} L${pts.slice().reverse().map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} Z`;
	const bot = `M-60,${H + 60} L${W + 60},${H + 60} L${W + 60},${f1(pts[pts.length - 1][1])} L${pts.slice().reverse().map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} Z`;
	const dy = 760 * open, dx = 70 * open, rot = 4 * open;
	return <g>
		<defs><clipPath id={`${id}t`}><path d={top} /></clipPath><clipPath id={`${id}b`}><path d={bot} /></clipPath></defs>
		<g transform={`translate(${f1(-dx)},${f1(-dy)}) rotate(${f1(-rot)} 960 520)`}><g clipPath={`url(#${id}t)`}>{children}</g>
			{open > 0 && <path d={`M${line}`} stroke="#eaf6ff" strokeWidth={6} fill="none" opacity={0.9} />}</g>
		<g transform={`translate(${f1(dx)},${f1(dy)}) rotate(${f1(rot)} 960 520)`}><g clipPath={`url(#${id}b)`}>{children}</g>
			{open > 0 && <path d={`M${line}`} stroke="#eaf6ff" strokeWidth={6} fill="none" opacity={0.9} />}</g>
		{open === 0 && <g><path d={`M${line}`} stroke="#0c1622" strokeWidth={9} fill="none" strokeLinejoin="round" /><path d={`M${line}`} stroke="#f2fbff" strokeWidth={3.5} fill="none" strokeLinejoin="round" /></g>}
	</g>;
};

/** leaves rushing at the lens (the dive into the canopy, and the jungle's exit): dark fronds grow from the edges, cover the frame at
    t0 + dur/2, and carry on outward. dir: 1 = they burst outward from the centre, -1 = they sweep across right → left */
export const LeafBurst: React.FC<{t: number; t0: number; dur: number; dir?: 1 | -1; col?: string}> = ({t, t0, dur, dir = 1, col = '#0b140e'}) => {
	const u = seg(t, t0, t0 + dur); if (u <= 0 || u >= 1) return null;
	const leaf = 'M0,0 Q120,-70 300,-20 Q420,10 520,0 Q420,-4 300,26 Q120,70 0,0 Z';
	if (dir === -1) {   // a few huge leaves sweep across the frame from the right
		return <g>{Array.from({length: 5}, (_, i) => { const x = lerp(2600 + i * 120, -1400 - i * 160, ei(u) * 0.55 + u * 0.45), y = 120 + i * 210 + 40 * Math.sin(i * 2.1), s = 3.2 + 0.6 * rnd(i, 3), a = -160 + 30 * rnd(i, 4);
			return <path key={i} d={leaf} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(a)}) scale(${f1(s)})`} fill={i % 2 ? col : '#0f1c14'} />; })}
			<rect x={0} y={0} width={W} height={H} fill={col} opacity={Math.sin(Math.PI * u) ** 3 * 0.9} /></g>;
	}
	const cover = Math.sin(Math.PI * u);
	return <g>{Array.from({length: 26}, (_, i) => { const a = (i / 26) * 360 + 40 * rnd(i, 1), r = lerp(1300, 40, Math.min(1, u * 1.6)) * (0.6 + 0.6 * rnd(i, 2)) + 900 * ei(seg(u, 0.55, 1));
		const x = 960 + Math.cos(a * Math.PI / 180) * r, y = 540 + Math.sin(a * Math.PI / 180) * r, s = (0.6 + 2.4 * eo(u)) * (0.8 + 0.5 * rnd(i, 3));
		return <path key={i} d={leaf} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(a + 160 + 30 * rnd(i, 5))}) scale(${f1(s)})`} fill={i % 3 ? col : '#132418'} opacity={Math.min(1, u * 4)} />; })}
		<rect x={0} y={0} width={W} height={H} fill={col} opacity={cover ** 4 * 0.95} /></g>;
};

/** calendar pages flying into the lens: tear-off pages burst from a point, grow, tumble past the camera, covering the frame at the middle */
export const PagesWipe: React.FC<{t: number; t0: number; dur: number; from?: [number, number]; seed?: number}> = ({t, t0, dur, from = [960, 520], seed = 0}) => {
	const u = seg(t, t0, t0 + dur); if (u <= 0 || u >= 1) return null;
	return <g>{Array.from({length: 22}, (_, i) => { const st = 0.35 * rnd(i, seed + 1), k = seg(u, st, st + 0.6); if (k <= 0 || k >= 1) return null;
		const a = rnd(i, seed + 2) * Math.PI * 2, r = 1300 * ei(k), x = from[0] + Math.cos(a) * r, y = from[1] + Math.sin(a) * r * 0.7, s = 0.25 + 4.2 * ei(k), rot = (rnd(i, seed + 3) - 0.5) * 220 * k;
		return <g key={i} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${f1(s)})`}>
			<rect x={-90} y={-70} width={180} height={140} rx={6} fill="#efe4cc" /><rect x={-90} y={-70} width={180} height={20} fill="#c8902e" />
			<text x={0} y={34} textAnchor="middle" style={{fontFamily: "'Cormorant59','DejaVu Serif',serif", fontWeight: 700, fontSize: 64}} fill="#2a2018">{1 + Math.floor(rnd(i, seed + 4) * 31)}</text>
			<rect x={-90} y={-70} width={180} height={140} rx={6} fill="#000" opacity={0.12 * k} /></g>; })}
		<rect x={0} y={0} width={W} height={H} fill="#efe4cc" opacity={Math.sin(Math.PI * seg(u, 0.25, 0.75)) ** 6 * 0.95} /></g>;
};

/** fog / blown dust pushing across the frame (left → right): soft bands, densest at the middle of the window */
export const FogWipe: React.FC<{t: number; t0: number; dur: number; col?: string; id: string}> = ({t, t0, dur, col = '#b8b4ac', id}) => {
	const u = seg(t, t0, t0 + dur); if (u <= 0 || u >= 1) return null;
	const x = lerp(-2600, 2600, u);
	return <g>
		<defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={col} stopOpacity="0" /><stop offset="0.35" stopColor={col} stopOpacity="1" /><stop offset="0.65" stopColor={col} stopOpacity="1" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
		<rect x={x - 400} y={-60} width={2400} height={H + 120} fill={`url(#${id})`} />
		{Array.from({length: 14}, (_, i) => <ellipse key={i} cx={x + 400 + (rnd(i, 1) - 0.5) * 2600} cy={rnd(i, 2) * H} rx={300 + 300 * rnd(i, 3)} ry={90 + 90 * rnd(i, 4)} fill={col} opacity={0.5} />)}
	</g>;
};

/** a flat colour that comes up and goes (for light floods, the white of the snow, the black of a closing passport) */
export const Flood: React.FC<{t: number; a: number; peak: number; b: number; col: string; max?: number}> = ({t, a, peak, b, col, max = 1}) => {
	const o = t < peak ? sm(seg(t, a, peak)) : 1 - sm(seg(t, peak, b)); if (o <= 0.001) return null;
	return <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={col} opacity={o * max} />;
};

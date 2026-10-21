import React, {useMemo} from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {useFonts} from '../looks26/b/kit';

/* ep35 body look "点阵星图" (owner's reference: 《虚无主义？然后呢》): pure black, everything drawn in white stippled
   lines like constellations, things draw on / morph / dissolve into dust; monochrome until the climax (one warm gold).
   Top-left topic tag, top-right italic source, small serif subtitles with a bold keyword, ghost big words.
   This file: the dot engine + a 12.5 s sample of the myth (push → summit → the rock rolls back). */
const W = 1920, H = 1080, FPS = 30;
const SERIF = '"Noto Serif CJK SC", serif', ITAL = '"Cormorant", serif';
type Pt = [number, number];
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (u: number) => { const x = cl(u); return x * x * (3 - 2 * x); };
const io = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const rad = (d: number) => (d * Math.PI) / 180;
const rot = (p: Pt, d: number, c: Pt = [0, 0]): Pt => { const a = rad(d), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; };
const hash = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ dots
/** sample a polyline every `sp` px */
export const lineDots = (pts: Pt[], sp = 7): Pt[] => {
	const out: Pt[] = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const [a, b] = [pts[i], pts[i + 1]]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(1, Math.round(L / sp));
		for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * (k / n), a[1] + (b[1] - a[1]) * (k / n)]);
	}
	out.push(pts[pts.length - 1]);
	return out;
};
export const circleDots = (c: Pt, r: number, sp = 7, a0 = -90, ry = r): Pt[] => {
	const n = Math.max(8, Math.round((2 * Math.PI * r) / sp));
	return Array.from({length: n}, (_, i) => { const a = rad(a0) + (i / n) * Math.PI * 2; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * ry] as Pt; });
};
/** draw dots: reveal = fraction drawn (in order), fade, dissolve = drift into dust */
export const Dots: React.FC<{pts: Pt[]; reveal?: number; o?: number; r?: number; col?: string; seed?: number; dissolve?: number; t?: number; glow?: number}> = ({pts, reveal = 1, o = 1, r = 1.7, col = '#efebe3', seed = 1, dissolve = 0, t = 0, glow = 0.55}) => {
	const n = Math.floor(pts.length * cl(reveal));
	if (n <= 0 || o <= 0.001) return null;
	const shown = pts.slice(0, n).map((p, i) => {
		const j = hash(i, seed);
		let x = p[0] + (j - 0.5) * 1.4, y = p[1] + (hash(i, seed + 3) - 0.5) * 1.4;
		if (dissolve > 0) { const d = dissolve * dissolve; x += (hash(i, seed + 7) - 0.4) * 260 * d; y -= (40 + hash(i, seed + 9) * 220) * d; }
		const tw = 0.75 + 0.25 * Math.sin(t * (1.5 + j * 3) + i);
		return [x, y, tw * (1 - dissolve * (0.3 + 0.7 * j))] as const;
	});
	return (
		<g opacity={o}>
			{glow > 0 && <g filter="url(#dglow)" opacity={glow}>{shown.map(([x, y, a], i) => <circle key={i} cx={x} cy={y} r={r * 1.6} fill={col} opacity={a} />)}</g>}
			{shown.map(([x, y, a], i) => <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={a} />)}
		</g>
	);
};

// ------------------------------------------------------------------ the dotted figure (same skeleton as the wooden puppet: ball joints show as rings)
export type DPose = {lean?: number; head?: number; armN?: [number, number]; armF?: [number, number]; legN?: [number, number]; legF?: [number, number]};
export const figure = (pose: DPose, at: Pt, s = 1, flip = false) => {
	const {lean = 0, head = 0, armN = [-4, 6], armF = [4, 8], legN = [3, 0], legF = [-3, 0]} = pose;
	const f = flip ? -1 : 1;
	const P = (p: Pt): Pt => [at[0] + f * p[0] * s, at[1] + p[1] * s];
	const limb = (o: Pt, a: number, l: number): Pt => [o[0] + Math.sin(rad(a)) * l, o[1] + Math.cos(rad(a)) * l];
	const hip: Pt = [0, -132];
	const sh = rot([0, -232], lean, hip);
	const leg = ([th, k]: [number, number], dx: number) => { const h: Pt = [hip[0] + dx, hip[1]]; const kn = limb(h, th, 66); const an = limb(kn, th + k, 64); const toe: Pt = [an[0] + 20, an[1] + 2]; return [h, kn, an, toe] as Pt[]; };
	const arm = ([u, e]: [number, number], dx: number) => { const s0: Pt = [sh[0] + dx, sh[1]]; const el = limb(s0, u + lean, 52); const wr = limb(el, u + e + lean, 48); return [s0, el, wr] as Pt[]; };
	const torso = [[-17, -232], [17, -232], [13, -150], [-13, -150], [-17, -232]].map((p) => rot(p as Pt, lean, hip));
	const hc = rot(rot([0, -276], head, [0, -244]), lean, hip);
	const lN = leg(legN, 6), lF = leg(legF, -6), aN = arm(armN, 4), aF = arm(armF, -4);
	return {
		dots: [
			...circleDots(P(hc), 22 * s, 6.5),
			...lineDots(torso.map(P), 6),
			...lineDots([rot([0, -244], lean, hip), rot([0, -258], lean, hip)].map(P), 5),
			...lineDots(lF.map(P), 6), ...lineDots(lN.map(P), 6),
			...lineDots(aF.map(P), 6), ...lineDots(aN.map(P), 6),
		],
		joints: [lN[1], lF[1], aN[1], aF[1], lN[0], aN[0]].map(P),
		anchors: {head: P([hc[0], hc[1] - 22]), wrN: P(aN[2]), wrF: P(aF[2]), knN: P(lN[1]), knF: P(lF[1]), sh: P(sh)},
		hand: P(aN[2]),
	};
};

// ------------------------------------------------------------------ chrome
const Tag: React.FC<{left: string; right?: string}> = ({left, right}) => (
	<>
		<div style={{position: 'absolute', left: 56, top: 40, padding: '5px 12px', border: '1px solid rgba(236,232,224,0.55)', fontFamily: SERIF, fontWeight: 600, fontSize: 22, color: 'rgba(236,232,224,0.85)', letterSpacing: '0.12em'}}>{left}</div>
		<div style={{position: 'absolute', right: 56, top: 42, padding: '4px 10px', border: '1px solid rgba(236,232,224,0.22)', fontFamily: SERIF, fontSize: 16, color: 'rgba(236,232,224,0.4)', letterSpacing: '0.2em'}}>Juno · VIBE知识大赏</div>
		{right && <div style={{position: 'absolute', right: 58, top: 86, fontFamily: ITAL, fontStyle: 'italic', fontSize: 22, color: 'rgba(236,232,224,0.42)', letterSpacing: '0.04em'}}>{right}</div>}
	</>
);
/** small serif subtitle; [x] = bold white keyword */
const Sub: React.FC<{t: string; o: number}> = ({t, o}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 952, textAlign: 'center', opacity: o, fontFamily: SERIF, fontWeight: 500, fontSize: 38, color: 'rgba(236,232,224,0.86)', letterSpacing: '0.1em'}}>
		{t.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) => (p[0] === '[' ? <b key={i} style={{fontWeight: 900, color: '#fff'}}>{p.slice(1, -1)}</b> : <span key={i}>{p}</span>))}
	</div>
);
const Ghost: React.FC<{t: string; o: number; x: number; y: number; size?: number}> = ({t, o, x, y, size = 150}) => (
	<div style={{position: 'absolute', left: x, top: y, opacity: o, fontFamily: SERIF, fontWeight: 900, fontSize: size, color: 'rgba(236,232,224,0.09)', letterSpacing: '0.05em'}}>{t}</div>
);
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#050506'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, #121216 0%, #070708 55%, #030304 100%)'}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<filter id="dglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" /></filter>
					<filter id="dgrain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 9} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
				</defs>
				{children}
				<rect width={W} height={H} filter="url(#dgrain)" />
			</svg>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ sample: the myth
const LINES: [number, number, string][] = [
	[0.6, 3.4, '希腊神话里，西西弗斯得罪了[众神]'], [3.6, 6.9, '惩罚是：把一块巨石，推上山顶'], [8.0, 10.3, '石头一到山顶，就[滚下来]'], [10.5, 12.4, '他只能走下山，重新再推。永远'],
];
const hillY = (x: number) => { const u = cl((x - 80) / 1400); return 880 - 470 * (u < 0.85 ? u / 0.85 * 0.96 : 0.96 + 0.04 * Math.sin((u - 0.85) / 0.15 * Math.PI / 2)) + (x > 1480 ? 0.0009 * (x - 1480) ** 2 : 0); };
const Myth: React.FC = () => {
	useFonts();
	const t = useCurrentFrame() / FPS;
	// the ground: a dotted hill line drawing on, desert ripple lines below
	const hill = useMemo(() => lineDots(Array.from({length: 60}, (_, i) => { const x = -20 + i * 34; return [x, hillY(x)] as Pt; }), 8), []);
	const ripples = useMemo(() => [0, 1, 2, 3].map((k) => lineDots(Array.from({length: 60}, (_, i) => { const x = -20 + i * 34; return [x, hillY(x) + 40 + k * 46 + 8 * Math.sin(x / 140 + k * 1.7)] as Pt; }), 11)), []);
	// motion: push up (2.4 → 8.0), the rock gets away at the top and rolls back (8.2 → 10.0)
	const up = io((t - 2.4) / 5.6);
	const heave = Math.max(0, Math.sin((t - 2.4) * 2.3)) ** 2 * (t > 2.4 && t < 8 ? 1 : 0);
	const r = 92;
	const pushX = 360 + 1000 * up;
	const standing = t > 8.4;
	const poseP: DPose = {lean: 34 + 4 * heave, head: 8, armN: [62, 8], armF: [56, 12], legN: [26 + 6 * heave, -28], legF: [-30 - 6 * heave, 6]};
	const poseS: DPose = {lean: 4, head: 26, armN: [-4, 6], armF: [4, 8], legN: [3, 0], legF: [-3, 0]};
	const pose = standing ? poseS : poseP;
	const fx = pushX - 150, fy = hillY(pushX - 150) + 2;
	const fig = figure(pose, [fx, fy], 1.25, false);
	const handX = figure(poseP, [fx, fy], 1.25, false).hand[0];
	const back = sm((t - 8.3) / 1.7);
	const topX = handX + r * 0.95;
	const rockX = t < 8.3 ? topX : topX - (topX + 260) * back * back;
	const rc: Pt = [rockX, hillY(rockX) - r - 2];
	const roll = (rockX - 430) / r * 57.3;                                      // rolling angle (deg)
	const figReveal = sm((t - 1.0) / 1.4);
	// the rock: dotted rim, a few constellation specks and cracks that turn with the roll
	const rock = [...circleDots(rc, r, 7, roll), ...circleDots(rc, r * 0.62, 13, roll * 1.0 + 30).filter((_, i) => i % 3 === 0)];
	const cracks = [[[-0.5, -0.2], [-0.15, 0.05], [0.1, -0.1]], [[0.2, 0.35], [0.38, 0.12], [0.55, 0.2]], [[-0.3, 0.45], [-0.05, 0.6]]].map((cr) => lineDots(cr.map((p) => rot([rc[0] + p[0] * r, rc[1] + p[1] * r], roll, rc)), 6));
	// the control bar high above, nobody holding it; strings drop to the joints
	const barY = fig.anchors.head[1] - 190 + 6 * Math.sin(t * 1.4), barX = fx + 40 + 8 * Math.sin(t * 1.1);
	const barO = sm((t - 3.0) / 0.8);
	const bar = [...lineDots([[barX - 120, barY], [barX + 120, barY]], 6), ...lineDots([[barX, barY - 60], [barX, barY + 90]], 6)];
	const an = fig.anchors;
	const strings = [[an.head, [barX, barY + 90]], [an.wrN, [barX + 120, barY]], [an.wrF, [barX - 120, barY]], [an.knN, [barX + 60, barY]], [an.knF, [barX - 60, barY]]] as [Pt, Pt][];
	const subL = LINES.find(([a, b]) => t >= a && t < b);
	const subO = subL ? cl((t - subL[0]) / 0.25) * cl((subL[1] - t) / 0.25) : 0;
	// dust kicked up near his feet while pushing, and specks everywhere
	const dust = Array.from({length: 40}, (_, i) => { const a = hash(i, 4), b = hash(i, 5); const age = ((t * 0.6 + a) % 1); return [fx - 40 + a * 120 - age * 60, fy - 6 - age * 70 * b, (1 - age) * heave] as const; });
	return (
		<Stage>
			<Dots pts={hill} reveal={sm(t / 1.6)} t={t} seed={2} />
			{ripples.map((p, k) => <Dots key={k} pts={p} reveal={sm((t - 0.3 - k * 0.15) / 1.6)} o={0.32 - k * 0.06} r={1.3} glow={0} t={t} seed={10 + k} />)}
			{/* faint stars */}
			<Dots pts={Array.from({length: 70}, (_, i) => [hash(i, 21) * W, hash(i, 22) * 520] as Pt)} o={0.35 * sm(t / 2)} r={1.1} glow={0.3} t={t} seed={30} />
			<Dots pts={rock} reveal={sm((t - 1.0) / 1.2)} t={t} seed={3} />
			{cracks.map((c, i) => <Dots key={i} pts={c} reveal={sm((t - 1.8) / 0.6)} r={1.4} o={0.8} glow={0.3} t={t} seed={40 + i} />)}
			<Dots pts={fig.dots} reveal={figReveal} t={t} seed={5} />
			{fig.joints.map((j, i) => <circle key={i} cx={j[0]} cy={j[1]} r={4.2} fill="none" stroke="#efebe3" strokeWidth={1.2} opacity={0.7 * figReveal} />)}
			{barO > 0 && strings.map(([a, b], i) => <Dots key={i} pts={lineDots([b, a], 10)} reveal={sm((t - 3.0 - i * 0.08) / 0.9)} o={0.42} r={1.1} glow={0.25} t={t} seed={60 + i} />)}
			<Dots pts={bar} reveal={barO} t={t} seed={70} />
			{dust.map(([x, y, a], i) => <circle key={i} cx={x} cy={y} r={1.2} fill="#efebe3" opacity={a * 0.6} />)}
			<foreignObject x={0} y={0} width={W} height={H}>
				<div style={{width: W, height: H, position: 'relative'}}>
					<Ghost t="永远" o={sm((t - 9.6) / 0.8)} x={1180} y={520} />
					<Tag left="西西弗斯" right="Homer · Odyssey, XI" />
					<Sub t={subL ? subL[2] : ''} o={subO} />
				</div>
			</foreignObject>
		</Stage>
	);
};
registerRoot(() => <Composition id="DOTMYTH" component={Myth} durationInFrames={Math.round(12.6 * FPS)} fps={FPS} width={W} height={H} />);

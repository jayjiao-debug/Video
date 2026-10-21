import React from 'react';
import {AbsoluteFill, Composition, registerRoot, spring, useCurrentFrame} from 'remotion';
import {useFonts} from '../looks26/b/kit';

/* ep35 《推石头的人，是幸福的》 — look "忧郁人偶": a hand-made marionette (wooden head and hands, felt coat, glass-bead eyes
   under heavy lids) in a miniature diorama; cold blue-grey light, one warm practical per shot; strings from above.
   Style frames: 0 = the commuter turntable (scene 1), 1 = the walk down the hill, strings falling (scene 6). */
const W = 1920, H = 1080, FPS = 30, SEG = 3;
const SERIF = '"Noto Serif CJK SC", serif';
const INK = '#ece6da';
const rad = (d: number) => (d * Math.PI) / 180;
const dirv = (a: number, l: number): [number, number] => [Math.sin(rad(a)) * l, Math.cos(rad(a)) * l]; // 0° = straight down, + = toward +x

// ------------------------------------------------------------------ materials
const Defs: React.FC = () => (
	<defs>
		<filter id="felt" x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="4" result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 0.3" result="sp" />
			<feComposite in="sp" in2="d" operator="in" result="spc" />
			<feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="9" result="n2" />
			<feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 0.95" result="hl" />
			<feComposite in="hl" in2="d" operator="in" result="hlc" />
			<feMerge><feMergeNode in="d" /><feMergeNode in="spc" /></feMerge>
		</filter>
		<filter id="wood" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.01 0.22" numOctaves="3" seed="2" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0 0.06  0 0 0 -1.6 1.0" result="g" />
			<feComposite in="g" in2="SourceGraphic" operator="in" result="gc" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="gc" /></feMerge>
		</filter>
		<filter id="woodfine" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.04 0.5" numOctaves="2" seed="7" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 -1.2 0.62" result="g" />
			<feComposite in="g" in2="SourceGraphic" operator="in" result="gc" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="gc" /></feMerge>
		</filter>
		<filter id="clay" x="-5%" y="-5%" width="110%" height="110%">
			<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="11" result="n" />
			<feDiffuseLighting in="n" surfaceScale="5" diffuseConstant="1.05" lightingColor="#fff" result="l">
				<feDistantLight azimuth="20" elevation="38" />
			</feDiffuseLighting>
			<feBlend in="SourceGraphic" in2="l" mode="multiply" result="m" />
			<feComposite in="m" in2="SourceAlpha" operator="in" />
		</filter>
		<filter id="paper" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="5" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.5 0.3" result="sp" />
			<feComposite in="sp" in2="SourceGraphic" operator="in" result="spc" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="spc" /></feMerge>
		</filter>
		{/* warm rim on the right-hand edges (sun / lamp on the right) */}
		<filter id="rimR" x="-10%" y="-10%" width="120%" height="120%">
			<feMorphology in="SourceAlpha" operator="erode" radius="1" result="e" />
			<feOffset in="e" dx="-2.4" dy="1" result="o" />
			<feComposite in="SourceAlpha" in2="o" operator="out" result="edge" />
			<feFlood floodColor="#ffc58a" floodOpacity="0.75" />
			<feComposite in2="edge" operator="in" result="rim" />
			<feGaussianBlur in="rim" stdDeviation="1" result="rb" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="rb" /></feMerge>
		</filter>
		<filter id="rimC" x="-10%" y="-10%" width="120%" height="120%">
			<feMorphology in="SourceAlpha" operator="erode" radius="0.8" result="e" />
			<feOffset in="e" dx="1.6" dy="1.6" result="o" />
			<feComposite in="SourceAlpha" in2="o" operator="out" result="edge" />
			<feFlood floodColor="#bcd0ec" floodOpacity="0.26" />
			<feComposite in2="edge" operator="in" result="rim" />
			<feGaussianBlur in="rim" stdDeviation="0.8" result="rb" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="rb" /></feMerge>
		</filter>
		{[1.5, 3, 6, 12].map((s) => (
			<filter key={s} id={`b${s}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={s} /></filter>
		))}
		<radialGradient id="headG" cx="0.38" cy="0.32" r="0.75">
			<stop offset="0" stopColor="#ead9c0" />
			<stop offset="0.6" stopColor="#cdb393" />
			<stop offset="1" stopColor="#9c8167" />
		</radialGradient>
		<linearGradient id="woodHand" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#dcc6a6" />
			<stop offset="1" stopColor="#a5876a" />
		</linearGradient>
		<linearGradient id="beech" x1="0" y1="0" x2="1" y2="0.3">
			<stop offset="0" stopColor="#ecd3ab" /><stop offset="0.55" stopColor="#d2ad80" /><stop offset="1" stopColor="#a47d55" />
		</linearGradient>
		<radialGradient id="ballG" cx="0.35" cy="0.3" r="0.8">
			<stop offset="0" stopColor="#f2dcb6" /><stop offset="0.6" stopColor="#c99f70" /><stop offset="1" stopColor="#8e6a46" />
		</radialGradient>
		<radialGradient id="ballG2" cx="0.36" cy="0.3" r="0.85">
			<stop offset="0" stopColor="#f0d9b2" /><stop offset="0.55" stopColor="#d1ab7d" /><stop offset="1" stopColor="#94704b" />
		</radialGradient>
		{([['m-walnut', '#7d563a', '#4a301f', '#22150c'], ['m-char', '#3c3a37', '#1d1c1a', '#0a0a0a'], ['m-ink', '#454a55', '#16181c', '#040506'], ['m-stone', '#a8a39a', '#78736b', '#46423e'], ['m-ebony', '#3d2d23', '#1a120d', '#060403']] as const).map(([id, a, b, c]) => (
			<linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor={a} /><stop offset="0.5" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient>
		))}
		{([['mb-walnut', '#94694a', '#4a301f', '#1a110a'], ['mb-char', '#56534f', '#1c1b1a', '#060606'], ['mb-ink', '#7b8394', '#1b1e24', '#030304'], ['mb-stone', '#bdb7ad', '#7b766f', '#46423e'], ['mb-ebony', '#4e3a2d', '#1a120d', '#050302'], ['mb-brass', '#f6d58c', '#c8913a', '#5e3f16']] as const).map(([id, a, b, c]) => (
			<radialGradient key={id} id={id} cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor={a} /><stop offset="0.55" stopColor={b} /><stop offset="1" stopColor={c} /></radialGradient>
		))}
		<filter id="grainL" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.04 0.5" numOctaves="2" seed="7" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 -2.2 1.02" result="g" />
			<feComposite in="g" in2="SourceGraphic" operator="in" result="gc" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="gc" /></feMerge>
		</filter>
		<filter id="charG" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="turbulence" baseFrequency="0.09 0.05" numOctaves="2" seed="13" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.26  0 0 0 0 0.25  0 0 0 0 0.23  0 0 0 2.0 -1.3" result="g" />
			<feComposite in="g" in2="SourceGraphic" operator="in" result="gc" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="gc" /></feMerge>
		</filter>
		<radialGradient id="warmGlow">
			<stop offset="0" stopColor="#ffd9a0" stopOpacity="0.9" />
			<stop offset="0.3" stopColor="#ffb45e" stopOpacity="0.35" />
			<stop offset="1" stopColor="#ffb45e" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="coldGlow">
			<stop offset="0" stopColor="#d7e4f7" stopOpacity="0.7" />
			<stop offset="0.4" stopColor="#9fb6d8" stopOpacity="0.2" />
			<stop offset="1" stopColor="#9fb6d8" stopOpacity="0" />
		</radialGradient>
	</defs>
);

// ------------------------------------------------------------------ the wooden drawing mannequin (no face; feet at y=0, ~515 tall; faces +x)
type Pose = {lean?: number; head?: number; armN?: [number, number]; armF?: [number, number]; legN?: [number, number]; legF?: [number, number]; case?: boolean; ground?: boolean};
/** keep the lower foot on the floor (walking/running): the hip drops when the legs spread — the natural bob */
const groundShift = (pose: Pose) => {
	if (!pose.ground) return 0;
	const ank = ([th, sh]: [number, number]) => -232 + Math.cos(rad(th)) * 106 + Math.cos(rad(th + sh)) * 98;
	return -28 - Math.max(ank(pose.legN ?? [3, 0]), ank(pose.legF ?? [-3, 0]));
};
const limb = (x: number, y: number, a: number, l: number): [number, number] => { const d = dirv(a, l); return [x + d[0], y + d[1]]; };
type Pt = [number, number];
type Mat = {name: string; note: string; limb: string; ball: string; head: string; grain?: string; hi: string; hiO: number; lo: string; edge: string; extra?: 'kintsugi' | 'cracks'};
const MATS: Record<string, Mat> = {
	beech: {name: '原木', note: '', limb: 'beech', ball: 'ballG', head: 'ballG2', grain: 'woodfine', hi: '#f6e4c4', hiO: 0.55, lo: '#7a5a3c', edge: '#6e4f34'},
	walnut: {name: 'A · 黑胡桃木', note: '温暖、沉、像旧家具', limb: 'm-walnut', ball: 'mb-walnut', head: 'mb-walnut', grain: 'grainL', hi: '#c99a6a', hiO: 0.4, lo: '#0d0805', edge: '#0d0805'},
	char: {name: 'B · 炭烧木', note: '烧过的木头，疲惫、粗粝', limb: 'm-char', ball: 'mb-char', head: 'mb-char', grain: 'charG', hi: '#9c978f', hiO: 0.3, lo: '#000', edge: '#000'},
	kintsugi: {name: 'C · 黑瓷 · 金缮', note: '碎过，又用金粘好', limb: 'm-ink', ball: 'mb-ink', head: 'mb-ink', hi: '#d2dae8', hiO: 0.6, lo: '#000', edge: '#000', extra: 'kintsugi'},
	plaster: {name: 'D · 风化石膏', note: '和那块石头同一种材料', limb: 'm-stone', ball: 'mb-stone', head: 'mb-stone', grain: 'clay', hi: '#e2dcd2', hiO: 0.3, lo: '#2a2725', edge: '#2a2725', extra: 'cracks'},
	ebony: {name: 'E · 乌木 · 黄铜关节', note: '最暗，关节一点金', limb: 'm-ebony', ball: 'mb-brass', head: 'mb-ebony', grain: 'grainL', hi: '#a88462', hiO: 0.28, lo: '#000', edge: '#3a2810'},
};
const MatCtx = React.createContext<Mat>(MATS.char);
const useMat = () => React.useContext(MatCtx);
const Cap: React.FC<{p: Pt; q: Pt; w1: number; w2: number}> = ({p, q, w1, w2}) => {
	const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	const pts = [[p[0] + nx * w1 / 2, p[1] + ny * w1 / 2], [q[0] + nx * w2 / 2, q[1] + ny * w2 / 2], [q[0] - nx * w2 / 2, q[1] - ny * w2 / 2], [p[0] - nx * w1 / 2, p[1] - ny * w1 / 2]];
	const s = nx < 0 ? 1 : -1;                                                            // highlight on the left (key light side)
	const m = useMat(), F = `url(#${m.limb})`;
	return (
		<g filter={m.grain ? `url(#${m.grain})` : undefined}>
			<polygon points={pts.map((v) => v.join(',')).join(' ')} fill={F} />
			<circle cx={p[0]} cy={p[1]} r={w1 / 2} fill={F} /><circle cx={q[0]} cy={q[1]} r={w2 / 2} fill={F} />
			<line x1={p[0] + s * nx * w1 * 0.22} y1={p[1] + s * ny * w1 * 0.22} x2={q[0] + s * nx * w2 * 0.22} y2={q[1] + s * ny * w2 * 0.22} stroke={m.hi} strokeWidth={Math.min(w1, w2) * 0.16} strokeLinecap="round" opacity={m.hiO} />
			<line x1={p[0] - s * nx * w1 * 0.38} y1={p[1] - s * ny * w1 * 0.38} x2={q[0] - s * nx * w2 * 0.38} y2={q[1] - s * ny * w2 * 0.38} stroke={m.lo} strokeWidth={Math.min(w1, w2) * 0.12} strokeLinecap="round" opacity={0.35} />
		</g>
	);
};
const Ball: React.FC<{p: Pt; r: number}> = ({p, r}) => {
	const m = useMat();
	return <g><circle cx={p[0]} cy={p[1]} r={r} fill={`url(#${m.ball})`} /><circle cx={p[0]} cy={p[1]} r={r} fill="none" stroke={m.edge} strokeWidth={1} opacity={0.5} /></g>;
};
/** gold seams (kintsugi) or dry cracks (plaster), drawn on top of a part */
const Seams: React.FC<{d: string[]}> = ({d}) => {
	const m = useMat();
	if (!m.extra) return null;
	const gold = m.extra === 'kintsugi';
	return (
		<g>
			{gold && d.map((x, i) => <path key={'g' + i} d={x} stroke="#ffcf73" strokeWidth={6} fill="none" opacity={0.35} filter="url(#b3)" />)}
			{d.map((x, i) => <path key={i} d={x} stroke={gold ? '#e8bb5e' : '#2e2a27'} strokeWidth={gold ? 2.4 : 1.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />)}
		</g>
	);
};
const Mannequin: React.FC<{pose: Pose}> = ({pose}) => {
	const m = useMat(), LF = `url(#${m.limb})`, GF = m.grain ? `url(#${m.grain})` : undefined;
	const {lean = 0, head = 0, armN = [-4, 4], armF = [4, 6], legN = [3, 0], legF = [-3, 0]} = pose;
	const leg = (hx: number, [th, sh]: [number, number]) => {
		const hip: Pt = [hx, -232], knee = limb(hip[0], hip[1], th, 106), ank = limb(knee[0], knee[1], th + sh, 98);
		return {hip, knee, ank};
	};
	const arm = (sx: number, [ua, fa]: [number, number]) => {
		const s: Pt = [sx, -394], el = limb(s[0], s[1], ua, 84), wr = limb(el[0], el[1], ua + fa, 76), tip = limb(wr[0], wr[1], ua + fa + 4, 34), th = limb(wr[0], wr[1], ua + fa - 26, 18);
		return {s, el, wr, tip, th};
	};
	const Leg: React.FC<{l: ReturnType<typeof leg>}> = ({l}) => (
		<g>
			<Cap p={l.hip} q={l.knee} w1={30} w2={22} /><Cap p={l.knee} q={l.ank} w1={22} w2={15} />
			<Ball p={l.knee} r={12} />
			<path d={`M${l.ank[0] - 12},${l.ank[1] - 2} L${l.ank[0] + 10},${l.ank[1] - 4} L${l.ank[0] + 42},${l.ank[1] + 15} L${l.ank[0] + 42},${l.ank[1] + 22} L${l.ank[0] - 14},${l.ank[1] + 22} Z`} fill={LF} filter={GF} />
			<Ball p={l.ank} r={8} />
		</g>
	);
	const Arm: React.FC<{a: ReturnType<typeof arm>; holds?: boolean}> = ({a, holds}) => (
		<g>
			<Cap p={a.s} q={a.el} w1={21} w2={16} /><Cap p={a.el} q={a.wr} w1={16} w2={12} />
			<Ball p={a.el} r={10} />
			{holds && <g transform={`translate(${a.tip[0]},${a.tip[1] + 6})`}><rect x={-36} y={-4} width={72} height={52} rx={6} fill="#5a3e2a" filter="url(#felt)" /><rect x={-11} y={-14} width={22} height={12} rx={5} fill="none" stroke="#3a281c" strokeWidth={4} /></g>}
			<Cap p={a.wr} q={a.tip} w1={17} w2={13} /><Cap p={a.wr} q={a.th} w1={8} w2={7} />
			<Ball p={a.wr} r={7} />
		</g>
	);
	const lF = leg(-14, legF), lN = leg(18, legN), aF = arm(-44, armF), aN = arm(46, armN);
	return (
		<g transform={`translate(0,${groundShift(pose)})`}>
			<g style={{filter: 'brightness(0.72)'}}><Leg l={lF} /></g>
			<g transform={`rotate(${lean}, 0, -232)`}>
				<g style={{filter: 'brightness(0.72)'}}><Arm a={aF} /></g>
				{/* pelvis, waist ball, ribcage */}
				<path d="M-40,-282 Q0,-292 40,-282 C44,-258 36,-234 22,-220 L0,-212 L-22,-220 C-36,-234 -44,-258 -40,-282 Z" fill={LF} filter={GF} />
				<Ball p={[-20, -232]} r={13} /><Ball p={[18, -232]} r={13} />
				<ellipse cx={0} cy={-292} rx={25} ry={16} fill={`url(#${m.ball})`} />
				<path d="M-46,-400 C-54,-368 -44,-322 -30,-306 Q0,-296 30,-306 C44,-322 54,-368 46,-400 Q0,-414 -46,-400 Z" fill={LF} filter={GF} />
				<Seams d={['M-26,-398 L-16,-378 L-22,-360 L-6,-340 L-12,-322 L-4,-306', 'M-16,-378 L4,-372 L12,-356', 'M30,-300 L22,-276 L28,-258']} />
				<path d="M-30,-306 Q0,-296 30,-306" stroke="#7a5a3c" strokeWidth={1.5} fill="none" opacity={0.5} />
				<Ball p={[-44, -394]} r={14} />
				<g transform={`rotate(${head}, 0, -406)`}>
					<Cap p={[0, -404]} q={[0, -436]} w1={16} w2={14} />
					<ellipse cx={4} cy={-474} rx={31} ry={41} fill={`url(#${m.head})`} transform="rotate(10, 4, -474)" filter={GF} />
					<ellipse cx={4} cy={-474} rx={31} ry={41} fill="none" stroke={m.edge} strokeWidth={1} opacity={0.45} transform="rotate(10, 4, -474)" />
					<ellipse cx={-6} cy={-494} rx={9} ry={14} fill="#fff" opacity={m.extra === 'kintsugi' ? 0.16 : 0} transform="rotate(10, 4, -474)" />
					<Seams d={['M-10,-512 L-2,-494 L-12,-478 L4,-462 L-2,-446', 'M-2,-494 L18,-488']} />
				</g>
				<Arm a={aN} holds={pose.case} />
				<Ball p={[46, -394]} r={14} />
			</g>
			<Leg l={lN} />
		</g>
	);
};
/** string anchors: head top and both wrists (puppet space; ignores the head tilt) */
const strAnchors = (pose: Pose): Pt[] => {
	const {armN = [-4, 4], armF = [4, 6]} = pose;
	const w = (sx: number, [ua, fa]: [number, number]) => { const e = limb(sx, -394, ua, 84); return limb(e[0], e[1], ua + fa, 76); };
	return [[0, -514], w(46, armN), w(-44, armF)];
};

// ------------------------------------------------------------------ chrome
const Header: React.FC<{t: string}> = ({t}) => (
	<div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26,
		color: 'rgba(236,230,218,0.82)', fontFamily: SERIF, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em'}}>
		<span style={{width: 84, height: 1, background: 'rgba(236,230,218,0.45)'}} /><span>{t}</span><span style={{width: 84, height: 1, background: 'rgba(236,230,218,0.45)', marginLeft: -12}} />
	</div>
);
const Mark: React.FC = () => (
	<div style={{position: 'absolute', top: 50, right: 64, fontFamily: SERIF, fontSize: 21, letterSpacing: '0.3em', color: 'rgba(236,230,218,0.4)'}}>◆ Juno · VIBE知识大赏</div>
);
const Sub: React.FC<{t: string}> = ({t}) => (
	<>
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45) 90%, rgba(0,0,0,0.6) 100%)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 52, color: INK, letterSpacing: '0.08em', textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>
			{t.split(/(\[[^\]]+\])/).filter(Boolean).map((x, i) => (x[0] === '[' ? <span key={i} style={{color: '#f1c56d', textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 14px rgba(0,0,0,0.9)'}}>{x.slice(1, -1)}</span> : <span key={i}>{x}</span>))}
		</div>
	</>
);
const Grade: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 48%, rgba(5,7,12,0.78) 100%)'}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.45}}>
				<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 2) % 8} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" /></filter>
				<rect width={W} height={H} filter="url(#gr)" />
			</svg>
		</>
	);
};

// ------------------------------------------------------------------ scene 1 · the commuter turntable
const CX = 960, CY = 600, RX = 780, RY = 200;
const onTable = (deg: number, r = 0.6): [number, number, number] => {
	const a = rad(deg);
	return [CX + RX * r * Math.cos(a), CY + RY * r * Math.sin(a), 0.62 + 0.38 * (Math.sin(a) + 1) / 2];
};
const Train: React.FC = () => (
	<g>
		<rect x={-200} y={-200} width={400} height={180} rx={34} fill="#5d6b78" filter="url(#paper)" />
		<rect x={-200} y={-200} width={400} height={30} rx={14} fill="#4b5763" />
		{[-150, -60, 30, 120].map((x) => <rect key={x} x={x} y={-160} width={64} height={70} rx={8} fill="#a8bed6" opacity={0.85} />)}
		{[-150, -60, 30, 120].map((x) => <rect key={x + 'g'} x={x} y={-160} width={64} height={70} rx={8} fill="url(#coldGlow)" />)}
		<rect x={-200} y={-72} width={400} height={10} fill="#c1a24e" opacity={0.8} />
		{[-130, 130].map((x) => <circle key={x} cx={x} cy={-14} r={18} fill="#22252b" />)}
		<rect x={-240} y={-6} width={480} height={14} fill="#3b3f46" />
		<rect x={-240} y={-6} width={480} height={4} fill="#d6b54a" opacity={0.7} />
	</g>
);
const Office: React.FC = () => (
	<g>
		<ellipse cx={30} cy={-150} rx={260} ry={200} fill="url(#warmGlow)" />
		<rect x={-150} y={-120} width={300} height={16} fill="#7a5a3e" filter="url(#wood)" />
		{[-136, 126].map((x) => <rect key={x} x={x} y={-104} width={12} height={104} fill="#5a4230" />)}
		<rect x={-80} y={-210} width={110} height={78} rx={6} fill="#2c3036" /><rect x={-72} y={-202} width={94} height={62} fill="#7f97b4" opacity={0.7} />
		<rect x={-32} y={-132} width={14} height={12} fill="#2c3036" />
		<g transform="translate(90,-120)"><line x1={0} y1={0} x2={-14} y2={-70} stroke="#3b3a36" strokeWidth={5} /><path d="M-40,-66 Q-14,-96 14,-70 Z" fill="#2e4a3c" /><ellipse cx={-12} cy={-68} rx={20} ry={5} fill="#ffd590" /></g>
		{[0, 1, 2].map((k) => <rect key={k} x={-140} y={-132 - k * 7} width={50} height={6} fill={k % 2 ? '#e6dccb' : '#cfc3ae'} />)}
	</g>
);
const Street: React.FC = () => (
	<g>
		<rect x={-6} y={-330} width={12} height={330} fill="#2a2d33" />
		<path d="M-36,-330 L36,-330 L26,-352 L-26,-352 Z" fill="#2a2d33" />
		<ellipse cx={0} cy={-326} rx={30} ry={6} fill="#dfe8f5" />
		<polygon points="-30,-326 30,-326 120,0 -120,0" fill="#cfdcf0" opacity={0.08} />
		<ellipse cx={0} cy={-6} rx={130} ry={22} fill="#cfdcf0" opacity={0.12} />
		<g transform="translate(80,0)"><rect x={0} y={-50} width={120} height={10} fill="#5a4636" filter="url(#wood)" /><rect x={0} y={-80} width={120} height={8} fill="#5a4636" />{[6, 108].map((x) => <rect key={x} x={x} y={-40} width={6} height={40} fill="#2a2d33" />)}</g>
	</g>
);
const Bed: React.FC = () => (
	<g>
		<rect x={-170} y={-70} width={340} height={50} rx={8} fill="#6a5040" filter="url(#wood)" />
		<rect x={-170} y={-150} width={22} height={150} rx={6} fill="#5a4232" />
		<rect x={-150} y={-112} width={300} height={50} rx={18} fill="#566070" filter="url(#felt)" />
		<rect x={-148} y={-112} width={80} height={40} rx={14} fill="#c9c2b4" filter="url(#felt)" />
		<g transform="translate(200,-40)"><rect x={-22} y={-40} width={44} height={40} fill="#4a3a2e" /><circle cx={0} cy={-62} r={20} fill="#d8cfbd" /><line x1={0} y1={-62} x2={0} y2={-76} stroke="#2a2420" strokeWidth={2.5} /><line x1={0} y1={-62} x2={9} y2={-58} stroke="#2a2420" strokeWidth={2.5} /></g>
	</g>
);
const Turntable: React.FC<{t: number}> = ({t}) => {
	const spin = t * 6;
	const sp: {deg: number; el: React.ReactNode; blur?: number; time: string}[] = [
		{deg: 90 + spin, el: null, time: '07:30'},
		{deg: 0 + spin, el: <Street />, time: '21:40'},
		{deg: -90 + spin, el: <Office />, blur: 2.2, time: '09:00'},
		{deg: 180 + spin, el: <Bed />, time: '23:50'},
	];
	const pose: Pose = {lean: 5, head: 20, armN: [-3, 4], armF: [5, 8], legN: [2, 0], legF: [-3, 0], case: true};
	const [px, py, ps] = onTable(90 + spin, 0.6);
	const k = ps * 0.8;
	return (
		<g>
			{/* table side band and top */}
			<path d={`M${CX - RX},${CY} A${RX},${RY} 0 0 0 ${CX + RX},${CY} L${CX + RX},${CY + 54} A${RX},${RY} 0 0 1 ${CX - RX},${CY + 54} Z`} fill="#3a2a1e" filter="url(#wood)" />
			<ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="#3e2c1f" filter="url(#wood)" />
			<ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#2a1e15" strokeWidth={3} opacity={0.6} />
			<ellipse cx={CX} cy={CY} rx={RX * 0.94} ry={RY * 0.94} fill="none" stroke="#c9a77e" strokeWidth={1.5} opacity={0.25} />
			{/* clock ticks on the front rim */}
			{Array.from({length: 48}, (_, i) => {
				const a = rad(i * 7.5 + spin);
				if (Math.sin(a) < -0.05) return null;
				const r1 = 0.965, r2 = i % 4 === 0 ? 0.92 : 0.945;
				return <line key={i} x1={CX + RX * r1 * Math.cos(a)} y1={CY + RY * r1 * Math.sin(a)} x2={CX + RX * r2 * Math.cos(a)} y2={CY + RY * r2 * Math.sin(a)} stroke="#e6d3b0" strokeWidth={i % 4 === 0 ? 2.4 : 1.2} opacity={0.55} />;
			})}
			<ellipse cx={CX} cy={CY} rx={RX * 0.6 + 260} ry={RY * 0.6 + 70} fill="url(#coldGlow)" opacity={0.25} />
			{/* stations, back to front */}
			{[...sp].sort((a, b) => Math.sin(rad(a.deg)) - Math.sin(rad(a.deg)) + (Math.sin(rad(a.deg)) - Math.sin(rad(b.deg)))).map((s) => {
				const [x, y, sc] = onTable(s.deg, 0.6);
				const [tx, ty] = onTable(s.deg, 0.88);
				return (
					<g key={s.time}>
						<g transform={`translate(${x},${y}) scale(${sc * 0.82})`} filter={s.blur ? `url(#b${s.blur > 2 ? 3 : 1.5})` : undefined}>
							<ellipse cx={0} cy={4} rx={230} ry={30} fill="#000" opacity={0.35} filter="url(#b6)" />
							{s.el ?? <g transform="translate(0,-40)"><Train /></g>}
						</g>
						<text x={tx} y={ty + 8} textAnchor="middle" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 30 * sc, letterSpacing: '0.08em'}} fill="#f0e2c4" opacity={0.5 + 0.4 * sc}>{s.time}</text>
					</g>
				);
			})}
			{/* the puppet on the platform, in front of the train */}
			<ellipse cx={px - 120} cy={py + 6} rx={90} ry={14} fill="#000" opacity={0.45} filter="url(#b3)" />
			<g transform={`translate(${px - 120},${py}) scale(${k})`} filter="url(#rimC)" opacity={0.98}>
				<Mannequin pose={pose} />
			</g>
			{strAnchors(pose).map(([ax, ay], i) => (
				<line key={i} x1={px - 120 + ax * k} y1={py + ay * k} x2={px - 120 + ax * k + (i - 1) * 6} y2={-20} stroke="#e8e2d6" strokeWidth={1.3} opacity={0.5} />
			))}
		</g>
	);
};
const S1: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{background: '#101318'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<Defs />
			<rect width={W} height={H} fill="#13161c" />
			{/* cold light shaft from a high window, dust in it */}
			<polygon points="180,-40 520,-40 1300,1080 640,1080" fill="#b8c9e2" opacity={0.07} filter="url(#b12)" />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 197) % 900 + 320 + (i % 5) * 40} cy={(i * 131) % 900 + 40} r={1 + (i % 3) * 0.6} fill="#dfe8f5" opacity={0.25} />)}
			{/* the hand-made backdrop: a painted paper skyline, out of focus */}
			<g filter="url(#b3)" opacity={0.6}>
				{[[120, 200, 160], [300, 140, 230], [470, 260, 130], [1330, 180, 200], [1520, 120, 260], [1720, 220, 150]].map(([x, h, w], i) => (
					<g key={i}><rect x={x} y={430 - h} width={w} height={h + 40} fill="#1f242d" filter="url(#paper)" />
						{Array.from({length: 8}, (_, k) => (k * 5 + i) % 3 === 0 ? <rect key={k} x={x + 18 + (k % 4) * (w / 4.4)} y={450 - h + 20 + Math.floor(k / 4) * 46} width={12} height={18} fill="#e9d2a0" opacity={0.35} /> : null)}
					</g>
				))}
			</g>
			<Turntable t={t} />
		</svg>
		<Grade />
		<Mark />
		<Sub t="早上挤地铁，上班，加班，回家" />
	</AbsoluteFill>
);

// ------------------------------------------------------------------ scene 6 · the walk down; the strings let go
const slopeY = (x: number) => 360 + 0.3 * x;
const S6: React.FC<{t: number; mat: Mat}> = ({t, mat}) => {
	const pose: Pose = {lean: -3, head: -18, armN: [-16, 8], armF: [12, 6], legN: [24, -4], legF: [-18, -14]};
	const px = 1000, k = 0.98, py = slopeY(px) + 14;
	const an = strAnchors(pose).map(([x, y]) => [px + x * k, py + y * k] as [number, number]);
	return (
		<AbsoluteFill style={{background: '#1b2029'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#07090e" /><stop offset="0.5" stopColor="#1a1f2a" /><stop offset="0.78" stopColor="#4a3f42" /><stop offset="1" stopColor="#8a5f42" />
				</linearGradient>
				<rect width={W} height={H} fill="url(#dusk)" filter="url(#paper)" />
				<circle cx={1560} cy={640} r={460} fill="url(#warmGlow)" opacity={0.6} />
				<circle cx={1560} cy={652} r={34} fill="#ffd49a" opacity={0.75} filter="url(#b3)" />
				{/* felt clouds */}
				<g filter="url(#b3)">
					{[[300, 180, 1], [700, 120, 0.8], [1250, 220, 1.1], [1640, 150, 0.9]].map(([x, y, s], i) => (
						<g key={i} transform={`translate(${x + t * 6},${y}) scale(${s})`} opacity={0.75}>
							{[[-80, 0, 70], [-10, -24, 86], [70, -4, 64], [0, 16, 90]].map(([dx, dy, r], j) => <ellipse key={j} cx={dx} cy={dy} rx={r} ry={r * 0.55} fill={i % 2 ? '#2a2f3a' : '#323844'} filter="url(#felt)" />)}
							<ellipse cx={30} cy={34} rx={140} ry={16} fill="#d6a983" opacity={0.35} />
						</g>
					))}
				</g>
				{/* cardboard ranges */}
				<path d="M0,640 L140,560 L260,600 L420,520 L560,590 L760,540 L900,610 L1100,560 L1300,620 L1480,580 L1700,640 L1920,600 L1920,1080 L0,1080 Z" fill="#1d212a" filter="url(#b1.5)" />
				<path d="M0,700 L200,650 L380,690 L600,640 L820,700 L1040,660 L1280,710 L1520,680 L1760,720 L1920,700 L1920,1080 L0,1080 Z" fill="#15181f" filter="url(#paper)" />
				{/* the clay hill, lit from the low sun on the right */}
				<path d={`M-40,${slopeY(-40)} ${Array.from({length: 23}, (_, i) => { const x = -40 + i * 92; return `L${x},${slopeY(x) - 8 * Math.sin(i * 1.7) - 6}`; }).join(' ')} L1980,1080 L-40,1080 Z`} fill="#3e3731" filter="url(#clay)" />
				<path d={`M-40,${slopeY(-40)} ${Array.from({length: 23}, (_, i) => { const x = -40 + i * 92; return `L${x},${slopeY(x) - 8 * Math.sin(i * 1.7) - 6}`; }).join(' ')}`} stroke="#e7a874" strokeWidth={2.5} fill="none" opacity={0.5} />
				{/* felt tufts */}
				{Array.from({length: 16}, (_, i) => { const x = 40 + i * 120 + (i % 3) * 20; const y = slopeY(x) + 30 + (i % 4) * 26; return <path key={i} d={`M${x},${y} l-8,-24 l8,10 l4,-28 l5,26 l8,-18 l-2,34 Z`} fill={i % 2 ? '#56604a' : '#4a5340'} filter="url(#felt)" />; })}
				{/* footprints going down */}
				{[500, 610, 720].map((x, i) => <ellipse key={x} cx={x} cy={slopeY(x) + 22 + (i % 2) * 8} rx={14} ry={5} fill="#4e443a" opacity={0.5} />)}
				{/* the puppet */}
				<ellipse cx={px + 10} cy={py + 6} rx={80} ry={12} fill="#2a221c" opacity={0.5} filter="url(#b3)" />
				<g filter="url(#rimC)"><g transform={`translate(${px},${py}) scale(${k})`} filter="url(#rimR)">
					<MatCtx.Provider value={mat}><Mannequin pose={pose} /></MatCtx.Provider>
				</g>
				</g>
				{/* the control bar has slipped from the gods' hands: it tumbles away, the hand strings dangle free; only a slack head string remains */}
				<MatCtx.Provider value={MATS.beech}><g transform="translate(560,150) rotate(34)">
					{[[0, -150], [-118, 0], [118, 0], [0, 150]].map(([x, y], i) => (
						<path key={i} d={`M${x},${y} c${10 + i * 6},70 ${-30 - i * 4},120 ${4 + i * 3},${190 + i * 25} s${-20 + i * 8},60 ${6 - i * 4},${80 + i * 12}`} stroke="#efe8da" strokeWidth={1.3} fill="none" opacity={0.5} transform={`rotate(-34, ${x}, ${y})`} />
					))}
					<Cap p={[-124, 0]} q={[124, 0]} w1={16} w2={16} />
					<Cap p={[0, -156]} q={[0, 156]} w1={16} w2={16} />
					<Ball p={[0, 0]} r={11} />
				</g></MatCtx.Provider>
				<path d={`M${an[0][0]},${an[0][1]} C${an[0][0] - 30},${an[0][1] + 120} ${700},${300} ${560 + 150 * Math.sin(rad(34))},${150 - 150 * Math.cos(rad(34))}`} stroke="#efe8da" strokeWidth={1.4} fill="none" opacity={0.55} />
				{/* the rock waits at the foot of the hill (foreground, out of focus) */}
				<g filter="url(#b3)">
					<ellipse cx={1760} cy={1010} rx={300} ry={260} fill="#34302c" filter="url(#clay)" />
				</g>
				<ellipse cx={1760} cy={1010} rx={300} ry={260} fill="none" stroke="#e7b98a" strokeWidth={4} opacity={0.18} filter="url(#b6)" />
			</svg>
			<Grade />
			<Header t="1942 · 加缪 ·《西西弗斯神话》" />
			<Mark />
			<Sub t="但他最在意的，是西西弗斯下山的那段路" />
		</AbsoluteFill>
	);
};


// ------------------------------------------------------------------ design sheet: five dark materials under five spotlights
const LINE: [string, Pose][] = [
	['walnut', {head: 24, lean: 4, armN: [-2, 4], armF: [4, 6]}],
	['char', {head: 14, lean: 2, armN: [16, 118], armF: [2, 8]}],
	['kintsugi', {head: -22, lean: -3, armN: [-8, 6], armF: [6, 4]}],
	['plaster', {head: 32, lean: 12, armN: [16, 6], armF: [18, 8], legN: [6, 4], legF: [-2, 6]}],
	['ebony', {head: 8, lean: 0, armN: [-10, -8], armF: [-6, -6]}],
];
const Sheet: React.FC = () => (
	<AbsoluteFill style={{background: '#08090c'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<Defs />
			<rect width={W} height={H} fill="#0a0b0f" filter="url(#paper)" />
			<rect y={790} width={W} height={290} fill="#111216" />
			{LINE.map(([id, pose], i) => {
				const x = 230 + i * 365;
				return (
					<g key={id}>
						<polygon points={`${x - 40},0 ${x + 40},0 ${x + 190},800 ${x - 190},800`} fill="#e9dcc4" opacity={0.06} filter="url(#b6)" />
						<ellipse cx={x} cy={800} rx={190} ry={34} fill="#e9dcc4" opacity={0.08} />
						<ellipse cx={x + 6} cy={802} rx={70} ry={11} fill="#000" opacity={0.7} filter="url(#b3)" />
						<g filter="url(#rimC)"><g transform={`translate(${x},${796}) scale(1.12)`} filter="url(#rimR)">
							<MatCtx.Provider value={MATS[id]}><Mannequin pose={pose} /></MatCtx.Provider>
						</g></g>
					</g>
				);
			})}
		</svg>
		{LINE.map(([id], i) => (
			<div key={id} style={{position: 'absolute', left: 230 + i * 365 - 170, width: 340, top: 860, textAlign: 'center', fontFamily: SERIF}}>
				<div style={{fontSize: 34, fontWeight: 700, color: INK, letterSpacing: '0.06em'}}>{MATS[id].name}</div>
				<div style={{fontSize: 22, color: 'rgba(236,230,218,0.55)', marginTop: 10, letterSpacing: '0.06em'}}>{MATS[id].note}</div>
			</div>
		))}
		<Grade />
		<Header t="人偶 · 五种深色材质" />
	</AbsoluteFill>
);

// ================================================================== key scenes 2–9 (material B · 炭烧木)
const rotP = (p: Pt, deg: number, c: Pt): Pt => { const a = rad(deg), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
/** a hand tip (or the head top) in puppet space, after the torso lean */
const tipOf = (pose: Pose, near = true): Pt => {
	const {lean = 0, armN = [-4, 4], armF = [4, 6]} = pose;
	const [ua, fa] = near ? armN : armF, sx = near ? 46 : -44;
	const el = limb(sx, -394, ua, 84), wr = limb(el[0], el[1], ua + fa, 76), tip = limb(wr[0], wr[1], ua + fa + 4, 30);
	return rotP(tip, lean, [0, -232]);
};
const headTop = (pose: Pose): Pt => rotP(rotP([4, -515], pose.head ?? 0, [0, -406]), pose.lean ?? 0, [0, -232]);
const W2 = (x: number, y: number, k: number, p: Pt): Pt => [x + p[0] * k, y + p[1] * k];
/** the puppet with both rims, at (x, y) feet, scale k */
const Man: React.FC<{x: number; y: number; k: number; pose: Pose; warm?: boolean; flip?: boolean}> = ({x, y, k, pose, warm = true, flip}) => (
	<g>
		<ellipse cx={x + 8} cy={y + 4} rx={85 * k} ry={12 * k} fill="#000" opacity={0.55} filter="url(#b3)" />
		<g filter="url(#rimC)"><g transform={`translate(${x},${y}) scale(${flip ? -k : k},${k})`} filter={warm ? 'url(#rimR)' : undefined}><Mannequin pose={pose} /></g></g>
	</g>
);
const Str: React.FC<{a: Pt; b: Pt; sag?: number; o?: number}> = ({a, b, sag = 0, o = 0.5}) => (
	<path d={`M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2 + sag},${(a[1] + b[1]) / 2} ${b[0]},${b[1]}`} stroke="#e8e2d6" strokeWidth={1.3} fill="none" opacity={o} />
);
const Rock: React.FC<{c: Pt; r: number; rim?: string; blur?: boolean; rot?: number}> = ({c, r, rim = '#e0a874', blur, rot = 0}) => (
	<g filter={blur ? 'url(#b3)' : undefined} transform={`rotate(${rot}, ${c[0]}, ${c[1]})`}>
		<ellipse cx={c[0]} cy={c[1] + r * 0.95} rx={r * 1.05} ry={r * 0.16} fill="#000" opacity={0.55} filter="url(#b6)" />
		<path d={`M${c[0] - r},${c[1] + r * 0.1} C${c[0] - r * 1.02},${c[1] - r * 0.7} ${c[0] - r * 0.4},${c[1] - r * 1.02} ${c[0] + r * 0.15},${c[1] - r * 0.98} C${c[0] + r * 0.8},${c[1] - r * 0.92} ${c[0] + r * 1.05},${c[1] - r * 0.3} ${c[0] + r * 0.98},${c[1] + r * 0.25} C${c[0] + r * 0.9},${c[1] + r * 0.8} ${c[0] + r * 0.3},${c[1] + r * 1.0} ${c[0] - r * 0.3},${c[1] + r * 0.96} C${c[0] - r * 0.8},${c[1] + r * 0.9} ${c[0] - r * 0.98},${c[1] + r * 0.55} ${c[0] - r},${c[1] + r * 0.1} Z`} fill="#45403b" filter="url(#clay)" />
		<path d={`M${c[0] + r * 0.15},${c[1] - r * 0.98} C${c[0] + r * 0.8},${c[1] - r * 0.92} ${c[0] + r * 1.05},${c[1] - r * 0.3} ${c[0] + r * 0.98},${c[1] + r * 0.25}`} stroke={rim} strokeWidth={3} fill="none" opacity={0.45} />
	</g>
);
/** night ground: sky, felt clouds, two cardboard ranges, a clay slope y = a + b·x, tufts */
const Land: React.FC<{sky: string[]; sun?: [number, number, number]; a: number; b: number; clay?: string; t?: number}> = ({sky, sun, a, b, clay = '#2f2a26', t = 0}) => {
	const ys = (x: number) => a + b * x;
	const edge = Array.from({length: 23}, (_, i) => { const x = -40 + i * 92; return `L${x},${ys(x) - 7 * Math.sin(i * 1.7) - 5}`; }).join(' ');
	return (
		<g>
			<linearGradient id="skyL" x1="0" y1="0" x2="0" y2="1">{sky.map((c, i) => <stop key={i} offset={i / (sky.length - 1)} stopColor={c} />)}</linearGradient>
			<rect width={W} height={H} fill="url(#skyL)" filter="url(#paper)" />
			{sun && <><circle cx={sun[0]} cy={sun[1]} r={460} fill="url(#warmGlow)" opacity={sun[2]} /><circle cx={sun[0]} cy={sun[1]} r={34} fill="#ffd49a" opacity={sun[2]} filter="url(#b3)" /></>}
			<g filter="url(#b3)">
				{[[300, 170, 1], [760, 110, 0.8], [1250, 200, 1.1], [1660, 140, 0.9]].map(([x, y, s], i) => (
					<g key={i} transform={`translate(${x + t * 6},${y}) scale(${s})`} opacity={0.8}>
						{[[-80, 0, 70], [-10, -24, 86], [70, -4, 64], [0, 16, 90]].map(([dx, dy, r], j) => <ellipse key={j} cx={dx} cy={dy} rx={r} ry={r * 0.55} fill={i % 2 ? '#22262f' : '#2a2f39'} filter="url(#felt)" />)}
					</g>
				))}
			</g>
			<path d="M0,640 L140,560 L260,600 L420,520 L560,590 L760,540 L900,610 L1100,560 L1300,620 L1480,580 L1700,640 L1920,600 L1920,1080 L0,1080 Z" fill="#1a1d25" filter="url(#b1.5)" />
			<path d="M0,700 L200,650 L380,690 L600,640 L820,700 L1040,660 L1280,710 L1520,680 L1760,720 L1920,700 L1920,1080 L0,1080 Z" fill="#13161c" filter="url(#paper)" />
			<path d={`M-40,${ys(-40)} ${edge} L1980,1080 L-40,1080 Z`} fill={clay} filter="url(#clay)" />
			<path d={`M-40,${ys(-40)} ${edge}`} stroke="#c99a74" strokeWidth={2} fill="none" opacity={0.35} />
			{Array.from({length: 14}, (_, i) => { const x = 60 + i * 140 + (i % 3) * 20; const y = ys(x) + 40 + (i % 4) * 30; return <path key={i} d={`M${x},${y} l-8,-22 l8,9 l4,-26 l5,24 l8,-16 l-2,31 Z`} fill="#2e3529" filter="url(#felt)" />; })}
		</g>
	);
};
const NIGHT = ['#06080c', '#121620', '#262533', '#3e3236'];
/** a giant dark hand reaching down from the dark, fingers curled over a bar at y≈100 (local) */
const GodHand: React.FC<{x: number; y: number; s?: number; flip?: boolean; rot?: number}> = ({x, y, s = 1, flip, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`} filter="url(#rimC)">
		<path d="M-58,-560 C-62,-300 -66,-160 -60,-70 L58,-70 C62,-160 60,-300 54,-560 Z" fill="#0c0b0a" />
		<path d="M-60,-80 C-72,-40 -70,10 -56,40 C-30,62 30,64 56,44 C70,14 70,-40 58,-80 Z" fill="#151311" />
		{[[-40, 112, 17], [-14, 124, 18], [12, 120, 17], [36, 104, 15]].map(([fx, len, w], i) => (
			<path key={i} d={`M${fx - w / 2},40 C${fx - w / 2 - 2},${len * 0.6} ${fx - w / 2 + 1},${len - 10} ${fx},${len} C${fx + w / 2 - 1},${len - 10} ${fx + w / 2 + 2},${len * 0.6} ${fx + w / 2},40 Z`} fill={i % 2 ? '#141210' : '#171513'} />
		))}
		{[[-40, 70], [-14, 76], [12, 74], [36, 66]].map(([fx, ky], i) => <path key={i} d={`M${fx - 7},${ky} q7,-4 14,0`} stroke="#2a2622" strokeWidth={1.5} fill="none" opacity={0.6} />)}
		<path d="M-58,-20 C-80,10 -76,60 -56,92 C-48,100 -40,96 -42,84 C-50,56 -48,24 -40,0 Z" fill="#131110" />
	</g>
);
const CrossBar: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
	<MatCtx.Provider value={MATS.beech}>
		<g transform={`translate(${x},${y}) rotate(${rot})`}>
			<Cap p={[-124, 0]} q={[124, 0]} w1={16} w2={16} />
			<Cap p={[0, -60]} q={[0, 150]} w1={16} w2={16} />
			<Ball p={[0, 0]} r={11} />
		</g>
	</MatCtx.Provider>
);
const barPt = (x: number, y: number, rot: number, p: Pt): Pt => { const r = rotP(p, rot, [0, 0]); return [x + r[0], y + r[1]]; };
const PUSH: Pose = {lean: 30, head: 12, armN: [56, 8], armF: [50, 14], legN: [22, -30], legF: [-30, 4]};

const Frame: React.FC<{header?: string; sub?: string; subO?: number; children: React.ReactNode; bg?: string}> = ({header, sub, subO = 1, children, bg = '#07080b'}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Defs />{children}</svg>
		<Grade />
		{header && <Header t={header} />}
		<Mark />
		{sub && <div style={{opacity: subO}}><Sub t={sub} /></div>}
	</AbsoluteFill>
);

// ---- 2 · title: the road has become a hill; the title hangs on strings like a stage sign
const S2: React.FC<{plankY?: number; lookUp?: number; sub?: string; subO?: number; t?: number}> = ({plankY = 300, lookUp = 0, sub, subO = 1, t = 0}) => {
	const ys = (x: number) => 900 - 0.34 * x;
	const pose: Pose = {head: 4 - 22 * lookUp, lean: -2 + 1.2 * Math.sin(t * 2), armN: [-6, 6], armF: [6, 6]};
	const mx = 540, my = ys(mx) + 10, k = 0.78;
	return (
		<Frame sub={sub} subO={subO}>
			<Land sky={NIGHT} a={900} b={-0.34} sun={[1700, 560, 0.35]} t={t} />
			<Rock c={[760, ys(760) - 128]} r={135} />
			<Man x={mx} y={my} k={k} pose={pose} />
			{attachPts(pose).map(({p, to}, i) => { const a = W2(mx, my, k, p); return <g key={i}><RealString a={a} b={[mx + 20 + to * 50, -300 + Math.abs(to) * 8]} id={`s2s${i}`} w={i === 4 || i === 6 ? 1.05 : 0.85} /><Eyelet p={a} k={k * 0.9} /></g>; })}
			<g transform={`translate(1340,${plankY}) rotate(-2) scale(0.9)`}>
				<RealString a={[-380, -60]} b={[-350, -1500]} id="pl1" band={[0.05, 0.25]} w={1.3} />
				<RealString a={[380, -60]} b={[350, -1500]} id="pl2" band={[0.05, 0.25]} w={1.3} />
				<rect x={-430} y={-70} width={860} height={150} rx={10} fill="#000" opacity={0.5} filter="url(#b6)" transform="translate(10,16)" />
				<rect x={-430} y={-70} width={860} height={150} rx={10} fill="url(#m-walnut)" filter="url(#grainL)" />
				<rect x={-414} y={-56} width={828} height={122} rx={6} fill="none" stroke="#1a110a" strokeWidth={3} opacity={0.7} />
				{[[-404, -46], [404, -46], [-404, 56], [404, 56]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill="url(#mb-brass)" />)}
				<text y={36} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84, letterSpacing: '0.08em'}} fill="#120b06" opacity={0.8} transform="translate(0,2)">推石头的人，是幸福的</text>
				<text y={36} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84, letterSpacing: '0.08em'}} fill="#e9d9bd">推石头的人，是幸福的</text>
			</g>
		</Frame>
	);
};

// ---- 3 · the myth: the gods' hands work the bar; he pushes uphill
const S3: React.FC = () => {
	const ys = (x: number) => 880 - 0.32 * x;
	const k = 0.82, r = 150, cx = 1080;
	const cy = ys(cx) - r * 0.92;
	const tip = tipOf(PUSH, true);
	const mx = cx - r * 0.98 - tip[0] * k, my = ys(mx) + 12;
	const bx = 560, by = 250, rot = 8;
	return (
		<Frame header="古希腊 · 神话" sub="惩罚是：把一块巨石，推上山顶">
			<Land sky={NIGHT} a={880} b={-0.32} sun={[300, 600, 0.22]} />
			<Rock c={[cx, cy]} r={r} />
			<Man x={mx} y={my} k={k} pose={PUSH} warm={false} />
			{attachPts(PUSH).map(({p, to}, i) => { const a = W2(mx, my, k, p); const slot: Pt = [[-1, -2, -4, -3].includes(to) ? -124 + 40 * (Math.abs(to) - 1) : 124 - 40 * (Math.abs(to) - 1), [1, -1].includes(to) ? 150 : 0]; return <g key={i}><RealString a={a} b={barPt(bx, by, rot, slot)} id={`s3s${i}`} band={[0.3, 0.75]} w={i === 4 || i === 6 ? 1.05 : 0.85} /><Eyelet p={a} k={k * 0.9} /></g>; })}
			<CrossBar x={bx} y={by} rot={rot} />
			<GodHand x={bx - 26} y={by - 84} s={0.75} rot={6} />
			<GodHand x={bx + 84} y={by - 76} s={0.66} rot={-10} flip />
		</Frame>
	);
};

// ---- 4 · 2008: the Sisyphus condition — built figures kept vs taken apart
const Bot: React.FC<{x: number; y: number; c: string; s?: number}> = ({x, y, c, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-14} y={-26} width={10} height={26} fill={c} /><rect x={4} y={-26} width={10} height={26} fill={c} />
		<rect x={-20} y={-70} width={40} height={46} rx={3} fill={c} /><rect x={-28} y={-66} width={8} height={30} fill={c} /><rect x={20} y={-66} width={8} height={30} fill={c} />
		<rect x={-12} y={-94} width={24} height={22} rx={3} fill={c} /><rect x={-6} y={-86} width={12} height={4} fill="#000" opacity={0.4} />
		<rect x={-20} y={-70} width={40} height={6} fill="#fff" opacity={0.12} />
	</g>
);
const BOTC = ['#7a3b2a', '#8a6a2a', '#3d4a5a', '#4a5a3a', '#6a3a4a'];
const S4: React.FC = () => {
	const pose: Pose = {head: 22, lean: 12, armN: [40, 40], armF: [36, 44]};
	return (
		<Frame header="2008 · 美国" sub="被拆的那组，平均少拼了三个多：10.6个，对7.2个" bg="#0b0b0d">
			<rect width={W} height={H} fill="#121316" filter="url(#paper)" />
			{Array.from({length: 13}, (_, i) => <rect key={i} x={i * 150} y={0} width={4} height={700} fill="#0c0d0f" />)}
			{/* chalkboard */}
			<g transform="translate(1340,170) scale(0.86)">
				<rect x={-14} y={-14} width={588} height={348} fill="#2a1d14" filter="url(#wood)" />
				<rect width={560} height={320} fill="#1b211e" filter="url(#paper)" />
				{[['摆着', 10.6, 60], ['被拆', 7.2, 200]].map(([lab, v, y]) => (
					<g key={lab as string} transform={`translate(40,${y})`}>
						<text x={0} y={40} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40}} fill="#e8e4da" opacity={0.85}>{lab}</text>
						{Array.from({length: Math.floor(v as number)}, (_, i) => (i % 5 === 4
							? <line key={i} x1={110 + Math.floor(i / 5) * 90 - 8} y1={30} x2={110 + Math.floor(i / 5) * 90 + 64} y2={4} stroke="#e8e4da" strokeWidth={4} opacity={0.8} strokeLinecap="round" />
							: <line key={i} x1={110 + Math.floor(i / 5) * 90 + (i % 5) * 14} y1={-2} x2={110 + Math.floor(i / 5) * 90 + (i % 5) * 14 + 3} y2={44} stroke="#e8e4da" strokeWidth={4} opacity={0.8} strokeLinecap="round" />))}
						<text x={500} y={42} textAnchor="end" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 60}} fill={lab === '被拆' ? '#ff8a70' : '#f1d7a0'}>{(v as number).toFixed(1)}</text>
					</g>
				))}
			</g>
			{/* lamp */}
			<g transform="translate(300,690)">
				<ellipse cx={120} cy={-60} rx={520} ry={330} fill="url(#warmGlow)" opacity={0.55} />
				<line x1={0} y1={0} x2={30} y2={-200} stroke="#2a2724" strokeWidth={8} /><line x1={30} y1={-200} x2={130} y2={-230} stroke="#2a2724" strokeWidth={8} />
				<path d="M100,-250 L190,-200 L150,-170 L80,-220 Z" fill="#1d1b19" /><ellipse cx={150} cy={-188} rx={28} ry={8} fill="#ffd590" transform="rotate(30,150,-188)" />
			</g>
			<Man x={700} y={860} k={0.95} pose={pose} />
			{strAnchors(pose).map((p, i) => { const w = W2(700, 860, 0.95, rotP(p, i ? pose.lean ?? 0 : 0, [0, -232])); return <Str key={i} a={w} b={[w[0], -10]} o={0.4} />; })}
			{/* workbench */}
			<rect y={690} width={W} height={34} fill="url(#m-walnut)" filter="url(#grainL)" />
			<rect y={724} width={W} height={360} fill="#0c0a09" />
			{/* kept: a row of finished figures (left) */}
			{[0, 1, 2, 3, 4].map((i) => <Bot key={i} x={120 + i * 64} y={690} c={BOTC[i]} s={0.9} />)}
			{/* in progress, at his hands */}
			<Bot x={880} y={690} c={BOTC[2]} s={0.9} />
			{/* taken apart: a dark hand from the right lifts a figure away; its pieces fall */}
			<GodHand x={1150} y={440} s={0.62} rot={-14} />
			<g transform="translate(1140,568) rotate(-10)"><Bot x={0} y={0} c={BOTC[0]} s={0.9} /></g>
			{[[1080, 640, 10, '#7a3b2a'], [1115, 668, -20, '#7a3b2a'], [1190, 676, 35, '#7a3b2a'], [1220, 650, -8, '#7a3b2a']].map(([x, y, r, c], i) => (
				<rect key={i} x={x as number} y={y as number} width={12} height={22} fill={c as string} transform={`rotate(${r}, ${x}, ${y})`} />
			))}
		</Frame>
	);
};

// ---- 5 · 1942: an attic in France, rain and searchlights; the manuscript; a small charred figure and a pebble on the desk
const S5: React.FC = () => (
	<Frame header="1942 · 法国" bg="#08090b">
		<rect width={W} height={H} fill="#141210" filter="url(#paper)" />
		{Array.from({length: 16}, (_, i) => <rect key={i} x={i * 124} y={0} width={120} height={760} fill={i % 2 ? '#17140f' : '#1b1712'} filter="url(#paper)" />)}
		<path d="M0,0 L1920,0 L1920,90 L0,190 Z" fill="#0b0a08" />
		{/* window: rain and two searchlights */}
		<g transform="translate(1290,170)">
			<rect width={430} height={420} fill="#0d1320" />
			{[0, 1].map((i) => <polygon key={i} points={`${120 + i * 200},420 ${140 + i * 200},420 ${60 + i * 330},-10 ${10 + i * 330},-10`} fill="#cfdcf0" opacity={0.12} />)}
			{Array.from({length: 46}, (_, i) => <line key={i} x1={(i * 53) % 430} y1={(i * 97) % 380} x2={(i * 53) % 430 - 4} y2={(i * 97) % 380 + 26} stroke="#9fb6d8" strokeWidth={1.2} opacity={0.35} />)}
			<path d="M0,330 L60,300 L120,320 L180,280 L260,310 L330,270 L430,300 L430,420 L0,420 Z" fill="#06080d" />
			<rect x={207} width={16} height={420} fill="#1b1712" /><rect y={202} width={430} height={16} fill="#1b1712" />
			<rect x={-18} y={-18} width={466} height={456} fill="none" stroke="#221c15" strokeWidth={20} />
		</g>
		{/* desk */}
		<rect y={760} width={W} height={40} fill="url(#m-walnut)" filter="url(#grainL)" />
		<rect y={800} width={W} height={300} fill="#0a0806" />
		<g transform="translate(560,760)">
			<ellipse cx={0} cy={-120} rx={520} ry={360} fill="url(#warmGlow)" opacity={0.75} />
			<ellipse cx={0} cy={-4} rx={60} ry={12} fill="url(#mb-brass)" />
			<path d="M-34,-10 C-46,-60 -30,-100 0,-104 C30,-100 46,-60 34,-10 Z" fill="#d9c9a8" opacity={0.35} />
			<path d="M-6,-50 C-12,-70 -2,-86 0,-96 C4,-84 12,-70 6,-50 Z" fill="#ffd27a" />
			<rect x={-24} y={-118} width={48} height={14} rx={4} fill="url(#mb-brass)" />
		</g>
		{/* typewriter with the page */}
		<g transform="translate(960,760)">
			<rect x={-200} y={-120} width={400} height={120} rx={20} fill="#151515" />
			<rect x={-220} y={-150} width={440} height={36} rx={16} fill="#1f1f1f" />
			{Array.from({length: 20}, (_, i) => <circle key={i} cx={-160 + (i % 10) * 36} cy={-70 + Math.floor(i / 10) * 30} r={10} fill="#2c2c2c" />)}
			<g transform="rotate(-2)">
				<rect x={-130} y={-420} width={260} height={290} fill="#e9e0cc" filter="url(#paper)" />
				<text x={0} y={-370} textAnchor="middle" style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 17, letterSpacing: '0.08em'}} fill="#2a2420">LE MYTHE DE SISYPHE</text>
				{Array.from({length: 8}, (_, i) => <rect key={i} x={-100} y={-330 + i * 22} width={150 + ((i * 37) % 50)} height={4} fill="#2a2420" opacity={0.45} />)}
				<text x={0} y={-150} textAnchor="middle" style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 14}} fill="#2a2420" opacity={0.6}>— 1942 —</text>
			</g>
		</g>
		{/* the small charred figure and a pebble */}
		<g transform="translate(1340,760) scale(0.3)"><g filter="url(#rimR)"><Mannequin pose={{head: 18, lean: 6, armN: [-2, 4], armF: [4, 6]}} /></g></g>
		<ellipse cx={1420} cy={748} rx={24} ry={14} fill="#4a4540" filter="url(#clay)" />
	</Frame>
);

// ---- 7 · 2010: a phone buzzes; half the time the mind drifts away
const S7: React.FC = () => {
	const pose: Pose = {head: 6, lean: 4, armN: [62, 38], armF: [58, 40], legN: [86, -86], legF: [82, -82]};
	const fx = 620, floor = 900, k = 0.95, fy = floor + 103 * k;
	const ht = W2(fx, fy, k, headTop(pose));
	const pie = 0.469;
	const pa = 2 * Math.PI * pie;
	return (
		<Frame header="2010 · 哈佛" sub="人们有46.9%的时间，心不在焉" bg="#0a0b0e">
			<rect width={W} height={H} fill="#111317" filter="url(#paper)" />
			<rect y={floor} width={W} height={180} fill="#0b0b0c" />
			{/* wall clock: 46.9 % of the face shaded */}
			<g transform="translate(1440,300)">
				<circle r={150} fill="#d9d1c0" opacity={0.9} filter="url(#paper)" />
				<path d={`M0,0 L0,-150 A150,150 0 0 1 ${150 * Math.sin(pa)},${-150 * Math.cos(pa)} Z`} fill="#8a3a2e" opacity={0.75} />
				<circle r={150} fill="none" stroke="#2a2420" strokeWidth={10} />
				{Array.from({length: 12}, (_, i) => { const a = (i / 12) * 2 * Math.PI; return <line key={i} x1={130 * Math.sin(a)} y1={-130 * Math.cos(a)} x2={142 * Math.sin(a)} y2={-142 * Math.cos(a)} stroke="#2a2420" strokeWidth={4} />; })}
				<text x={0} y={230} textAnchor="middle" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 64}} fill="#ff8a70">46.9%</text>
			</g>
			{/* desk with a buzzing phone, chair */}
			<rect x={760} y={700} width={560} height={22} fill="url(#m-walnut)" filter="url(#grainL)" />
			{[780, 1290].map((x) => <rect key={x} x={x} y={722} width={14} height={178} fill="#1a120c" />)}
			<g transform="translate(1000,690)">
				<rect x={-34} y={-12} width={68} height={12} rx={4} fill="#0e0f12" />
				<rect x={-30} y={-11} width={60} height={9} rx={3} fill="#9fb6d8" opacity={0.7} />
				<ellipse cx={0} cy={-6} rx={140} ry={70} fill="url(#coldGlow)" opacity={0.7} />
				{[0, 1, 2].map((i) => <path key={i} d={`M${-50 - i * 16},${-20 - i * 10} q-8,10 0,20`} stroke="#cfdcf0" strokeWidth={2} fill="none" opacity={0.6} transform={`scale(1,1)`} />)}
				{[0, 1, 2].map((i) => <path key={'r' + i} d={`M${50 + i * 16},${-20 - i * 10} q8,10 0,20`} stroke="#cfdcf0" strokeWidth={2} fill="none" opacity={0.6} />)}
			</g>
			<rect x={fx - 70} y={floor - 130 - 10} width={150} height={16} fill="#1c140e" />
			<rect x={fx - 70} y={floor - 330} width={16} height={330} fill="#1c140e" />
			<rect x={fx + 64} y={floor - 124} width={12} height={124} fill="#1c140e" />
			<Man x={fx} y={fy} k={k} pose={pose} />
			{/* thoughts drift away: felt clouds trailing from the head */}
			{[[ht[0] - 60, ht[1] - 40, 16], [ht[0] - 130, ht[1] - 110, 26], [ht[0] - 250, ht[1] - 200, 70]].map(([x, y, r], i) => (
				<g key={i} opacity={0.9}>
					{i < 2 ? <circle cx={x} cy={y} r={r} fill="#3a3f4a" filter="url(#felt)" /> : (
						<g>{[[-60, 0, 60], [0, -26, 74], [60, -2, 56], [0, 18, 80]].map(([dx, dy, rr], j) => <ellipse key={j} cx={x + dx} cy={y + dy} rx={rr} ry={rr * 0.6} fill="#3a3f4a" filter="url(#felt)" />)}
							{/* inside the thought: somewhere else */}
							<path d={`M${x - 70},${y + 20} L${x - 30},${y - 20} L${x + 5},${y + 8} L${x + 40},${y - 30} L${x + 80},${y + 20} Z`} fill="#565d6b" opacity={0.8} />
							<circle cx={x + 50} cy={y - 40} r={10} fill="#d9c9a8" opacity={0.6} />
						</g>
					)}
				</g>
			))}
		</Frame>
	);
};

// ---- 8 · same rock, three stories: 工作 · 事业 · 使命 (only the third is lit)
const S8: React.FC = () => {
	const ys = (x: number) => 900 - 0.12 * x;
	const k = 0.56, r = 96;
	const lanes = [[260, '只是份工作'], [860, '是我的事业'], [1460, '是我的使命']] as const;
	return (
		<Frame header="1997 · 美国" sub="同一块石头，不同的人，推出了不同的人生">
			<Land sky={NIGHT} a={900} b={-0.12} sun={[1700, 640, 0.25]} />
			{lanes.map(([x0, tag], i) => {
				const cx = x0 + 150, cy = ys(cx) - r * 0.92;
				const tip = tipOf(PUSH, true);
				const mx = cx - r * 0.98 - tip[0] * k, my = ys(mx) + 8;
				const lit = i === 2;
				return (
					<g key={tag}>
						{lit && <ellipse cx={cx} cy={cy - 60} rx={340} ry={260} fill="url(#warmGlow)" opacity={0.75} />}
						<Rock c={[cx, cy]} r={r} rim={lit ? '#ffc58a' : '#7f8aa0'} />
						<Man x={mx} y={my} k={k} pose={PUSH} warm={lit} />
						{/* a paper tag tied to the rock */}
						<g transform={`translate(${cx + 30},${cy - r - 4}) rotate(${-6 + i * 5})`}>
							<line x1={0} y1={0} x2={10} y2={40} stroke="#d9cfb8" strokeWidth={1.5} opacity={0.7} />
							<rect x={-6} y={40} width={150} height={52} rx={4} fill="#d9cfb8" filter="url(#paper)" opacity={lit ? 1 : 0.7} />
							<text x={69} y={76} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 26}} fill="#2a2420">{tag}</text>
						</g>
						{lit && (
							<g transform={`translate(${cx - 30},${cy - r + 6})`}>
								<rect x={-8} y={-30} width={16} height={30} fill="#e9dfc8" />
								<path d="M0,-58 C-8,-44 -6,-36 0,-32 C6,-36 8,-44 0,-58 Z" fill="#ffd27a" />
								<circle cx={0} cy={-44} r={22} fill="url(#warmGlow)" />
							</g>
						)}
					</g>
				);
			})}
		</Frame>
	);
};

// ---- 9 · dawn at the foot of the hill: no strings; a hand on the rock
const S9: React.FC = () => {
	const ground = 860, k = 0.95;
	const pose: Pose = {head: -10, lean: 0, armN: [52, 6], armF: [4, 8], legN: [6, 0], legF: [-6, 0]};
	const mx = 760, my = ground;
	const tip = W2(mx, my, k, tipOf(pose, true));
	const r = (ground - tip[1]) / 1.62, c: Pt = [tip[0] + r * 0.62, tip[1] + r * 0.62];
	return (
		<Frame sub="所以，我们必须想象：西西弗斯是幸福的">
			<Land sky={['#0b0e15', '#25263a', '#6a4a4a', '#c88a5a']} a={ground + 10} b={0} sun={[1380, 650, 1]} clay="#3a322b" />
			<path d="M0,620 L300,520 L520,560 L700,470 L900,600 L1200,660 L1920,640 L1920,1080 L0,1080 Z" fill="#1d1a1c" opacity={0.6} filter="url(#paper)" />
			<Rock c={c} r={r} rim="#ffc58a" />
			<Man x={mx} y={my} k={k} pose={pose} />
		</Frame>
	);
};

// ================================================================== scene 1 v2 · the platform at 07:30 (cinematic close shot, real strings)
const VP: Pt = [1260, 520];
const towards = (p: Pt, d: number): Pt => [p[0] + (VP[0] - p[0]) * d, p[1] + (VP[1] - p[1]) * d];
const quad = (a: Pt, b: Pt, c: Pt, e: Pt) => `M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]} L${e[0]},${e[1]} Z`;
/** depth parameter for an even world spacing: k-th unit of n along a receding plane */
const dz = (u: number) => 1 - 1 / (1 + u * 0.55);
/** all string attachment points of a marionette, in puppet space (after head tilt and lean) */
const attachPts = (pose: Pose): {p: Pt; to: number}[] => {
	const {lean = 0, head = 0, armN = [-4, 4], armF = [4, 6], legN = [3, 0], legF = [-3, 0]} = pose;
	const L = (p: Pt) => rotP(p, lean, [0, -232]);
	const H = (p: Pt) => L(rotP(p, head, [0, -406]));
	const wrist = (sx: number, [ua, fa]: [number, number]) => { const e = limb(sx, -394, ua, 84); return L(limb(e[0], e[1], ua + fa, 76)); };
	const knee = (hx: number, [th]: [number, number]) => limb(hx, -232, th, 106);
	const gy = groundShift(pose);
	return ([
		{p: H([-24, -500]), to: -1}, {p: H([32, -496]), to: 1},          // head (two, at the temples)
		{p: L([-44, -404]), to: -2}, {p: L([46, -404]), to: 2},           // shoulders
		{p: wrist(46, armN), to: 4}, {p: wrist(-44, armF), to: -4},        // hands
		{p: knee(18, legN), to: 3}, {p: knee(-14, legF), to: -3},         // knees
	] as {p: Pt; to: number}[]).map(({p, to}) => ({p: [p[0], p[1] + gy] as Pt, to}));
};
/** a nylon marionette string: near-invisible in shadow, catching the top light in a band, glints, fading into the dark above */
const RealString: React.FC<{a: Pt; b: Pt; id: string; band?: [number, number]; w?: number}> = ({a, b, id, band = [0.2, 0.55], w = 1.25}) => {
	const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
	const glints = [0.12, 0.31, 0.47].map((u, i) => u + ((id.charCodeAt(id.length - 1) * (i + 3)) % 7) * 0.012);
	const at = (u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
	return (
		<g>
			<linearGradient id={id} gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
				<stop offset="0" stopColor="#dfe7f0" stopOpacity="0.28" />
				<stop offset={band[0]} stopColor="#eef4fb" stopOpacity="0.85" />
				<stop offset={band[1]} stopColor="#dfe7f0" stopOpacity="0.5" />
				<stop offset="0.82" stopColor="#c9d4e2" stopOpacity="0.12" />
				<stop offset="1" stopColor="#c9d4e2" stopOpacity="0" />
			</linearGradient>
			<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={`url(#${id})`} strokeWidth={w * 3.2} opacity={0.18} filter="url(#b1.5)" />
			<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={`url(#${id})`} strokeWidth={w} />
			{glints.map((u, i) => { const p = at(u), q = at(u + 14 / L); return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#ffffff" strokeWidth={w * 1.5} opacity={0.75 - i * 0.18} strokeLinecap="round" />; })}
		</g>
	);
};
/** a small brass screw-eye at the attachment, with the knot */
const Eyelet: React.FC<{p: Pt; k: number}> = ({p, k}) => (
	<g><circle cx={p[0]} cy={p[1] - 1.6 * k} r={2.3 * k} fill="none" stroke="#6e5c40" strokeWidth={1.1 * k} /><path d={`M${p[0] - 1.6 * k},${p[1] - 2.6 * k} a${2.3 * k},${2.3 * k} 0 0 1 ${2.6 * k},${-1.2 * k}`} stroke="#d9c79c" strokeWidth={0.8 * k} fill="none" opacity={0.8} /><circle cx={p[0]} cy={p[1] - 3.9 * k} r={0.9 * k} fill="#e8e2d6" opacity={0.7} /></g>
);
const S1b: React.FC<{t: number; spin?: number; flick?: number; trainShift?: number; headLift?: number; sub?: string; subO?: number; crowd?: boolean; bare?: boolean}> = ({t, spin = 0, flick = 1, trainShift = 0, headLift = 0, sub = '早上挤地铁，上班，加班，回家', subO = 1, crowd, bare}) => {
	// a long breath out at ~2.2 s: the shoulders rise, then the whole body sinks a little lower than before
	const sighU = cl01((t - 2.0) / 1.6), sigh = sighU <= 0 ? 0 : Math.sin(Math.PI * Math.min(1, sighU * 1.25)) * (sighU < 0.4 ? -0.6 : 1) + 0.6 * sighU;
	const swing = 1.6 * Math.sin(t * 0.9) + 0.7 * Math.sin(t * 2.3 + 1);    // hanging from strings: never quite still
	const pose: Pose = withBreath({lean: 5 + 3 * sigh + 0.4 * swing, head: 20 - headLift + 6 * sigh, armN: [-3 + 1.5 * Math.sin(t * 0.9 + 0.8), 4 + 3 * sigh], armF: [5 + 1.2 * Math.sin(t * 0.9 + 1.3), 8], legN: [2, 0], legF: [-3, 0], case: true}, t);
	const mx = 700 + 3 * swing, my = 930 - 1.6 * Math.sin(t * 1.7) + 3 * sigh, k = 1.22;
	const sway = swing * 0.6;
	// the control bar hangs out of frame above: string ends spread along it (with a little perspective)
	const barC: Pt = [mx + 30 + sway * 4, -320];
	const barEnd = (slot: number): Pt => [barC[0] + slot * 62, barC[1] + Math.abs(slot) * 10];
	const trainX = 1640;
	const tb: Pt = [trainX, 1010], tt: Pt = [trainX, 230];
	return (
		<AbsoluteFill style={{background: '#050607'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<radialGradient id="tile" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#3a4048" /><stop offset="1" stopColor="#1d2126" /></radialGradient>
				<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#15181c" /><stop offset="1" stopColor="#24282d" /></linearGradient>
				<linearGradient id="winG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#dfe9f5" stopOpacity="0.95" /><stop offset="1" stopColor="#9fb6d0" stopOpacity="0.75" /></linearGradient>
				{/* tunnel at the vanishing point */}
				<rect width={W} height={H} fill="#06070a" />
				<ellipse cx={VP[0]} cy={VP[1] - 10} rx={120} ry={140} fill="#0c0f14" />
				{[[VP[0] - 30, VP[1] - 40, '#ffb45e'], [VP[0] + 20, VP[1] - 60, '#9fb6d8'], [VP[0] + 4, VP[1] + 10, '#ff6a50']].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={6} fill={c as string} filter="url(#b3)" opacity={0.8} />)}
				{/* left wall: dim subway tiles receding */}
				<path d={quad([-10, -60], towards([-10, -60], 0.9), towards([-10, 820], 0.9), [-10, 820])} fill="url(#tile)" />
				{Array.from({length: 24}, (_, i) => { const y = -60 + i * 38; const e = towards([-10, y], 0.9); return <line key={'h' + i} x1={-10} y1={y} x2={e[0]} y2={e[1]} stroke="#0e1013" strokeWidth={2} opacity={0.8} />; })}
				{Array.from({length: 40}, (_, j) => { const d = dz(j * 0.6); if (d > 0.9) return null; const a = towards([-10, -60], d), b = towards([-10, 820], d); return <line key={'v' + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0e1013" strokeWidth={2.5 * (1 - d)} opacity={0.8} />; })}
				<path d={quad([-10, 560], towards([-10, 560], 0.9), towards([-10, 610], 0.9), [-10, 610])} fill="#2c4a6a" opacity={0.55} />
				{/* station clock (the one warm light): 07:30 */}
				{(() => { const c = towards([-10, 240], 0.28); return (
					<g transform={`translate(${c[0] + 40},${c[1]})`}>
						<line x1={0} y1={-140} x2={0} y2={-74} stroke="#1b1d20" strokeWidth={8} />
						<circle r={110} fill="url(#warmGlow)" opacity={0.6} />
						<circle r={74} fill="#191a1c" /><circle r={64} fill="#efe2c4" />
						<circle r={64} fill="url(#warmGlow)" opacity={0.5} />
						{Array.from({length: 12}, (_, i) => { const a = (i / 12) * 2 * Math.PI; return <line key={i} x1={54 * Math.sin(a)} y1={-54 * Math.cos(a)} x2={60 * Math.sin(a)} y2={-60 * Math.cos(a)} stroke="#2a2420" strokeWidth={3} />; })}
						<g transform={`rotate(${spin * 360})`}><line x1={0} y1={0} x2={0} y2={46} stroke="#1b1a18" strokeWidth={5} strokeLinecap="round" /></g>
						<g transform={`rotate(${spin * 30})`}><line x1={0} y1={0} x2={-24} y2={24} stroke="#1b1a18" strokeWidth={6} strokeLinecap="round" /></g>
						<circle r={4} fill="#a8322b" />
					</g>
				); })()}
				{/* station name sign: 每一天 */}
				{(() => { const a = towards([-10, 440], 0.12), b = towards([-10, 440], 0.34), c = towards([-10, 520], 0.34), e = towards([-10, 520], 0.12); return (
					<g><path d={quad(a, b, c, e)} fill="#203a58" /><path d={quad(a, b, c, e)} fill="none" stroke="#c9d4e2" strokeWidth={2} opacity={0.4} />
						<text x={(a[0] + b[0]) / 2} y={(a[1] + c[1]) / 2 + 14} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: '0.3em'}} fill="#e8eef6" opacity={0.9} transform={`skewY(${Math.atan2(b[1] - a[1], b[0] - a[0]) * 57.3})`} transform-origin={`${(a[0] + b[0]) / 2} ${(a[1] + c[1]) / 2}`}>每一天</text></g>
				); })()}
				{/* ceiling: fluorescent tubes receding, with bloom */}
				{[0.2, 0.42, 0.58, 0.7, 0.78].map((d, i) => { const a = towards([560, -20], d), b = towards([980, -20], d), w = 26 * (1 - d); return (
					<g key={i} opacity={i % 2 ? flick : 1}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#eef5ff" strokeWidth={Math.max(2, w * 0.5)} opacity={0.95} />
						<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#cfe0f5" strokeWidth={w * 3} opacity={0.35} filter="url(#b12)" />
						<ellipse cx={(a[0] + b[0]) / 2} cy={a[1]} rx={(b[0] - a[0]) * 1.4} ry={6 * (1 - d) + 2} fill="#cfe0f5" opacity={0.25} filter="url(#b6)" /></g>
				); })}
				{/* platform floor */}
				<path d={`M-10,820 L${VP[0]},${VP[1]} L${tb[0]},${tb[1]} L${tb[0]},1090 L-10,1090 Z`} fill="url(#floorG)" />
				{Array.from({length: 18}, (_, j) => { const d = dz(j * 0.5); if (d > 0.88) return null; const a = towards([-10, 820], d), b = towards(tb, d); return <line key={'f' + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0d0f12" strokeWidth={2 * (1 - d) + 0.5} opacity={0.7} />; })}
				{Array.from({length: 12}, (_, i) => { const x = -10 + (tb[0] + 10) * (i / 11); const y = 820 + (1010 - 820) * (i / 11); const p: Pt = [x, Math.max(y, 820) + (1090 - Math.max(y, 820)) * 0.0]; const e = towards(p, 0.88); return <line key={'r' + i} x1={x} y1={1090} x2={e[0]} y2={e[1]} stroke="#0d0f12" strokeWidth={1.5} opacity={0.35} />; })}
				{/* wet-floor reflections of the tubes */}
				{[0.3, 0.5, 0.64].map((d, i) => { const a = towards([770, 1000], d); return <ellipse key={i} cx={a[0]} cy={a[1]} rx={40 * (1 - d) + 10} ry={120 * (1 - d) + 20} fill="#cfe0f5" opacity={0.12} filter="url(#b12)" />; })}
				{/* platform edge: tactile strip + yellow line */}
				<path d={quad(towards(tb, 0), towards(tb, 0.88), towards([tb[0] - 120, tb[1] + 6], 0.88), [tb[0] - 120, tb[1] + 6])} fill="#3a3527" opacity={0.9} />
				<path d={quad(towards([tb[0] - 150, tb[1] + 8], 0), towards([tb[0] - 150, tb[1] + 8], 0.88), towards([tb[0] - 128, tb[1] + 7], 0.88), [tb[0] - 128, tb[1] + 7])} fill="#c8a640" opacity={0.85} />
				{/* the train beside the platform: lit windows, a little motion blur */}
				<g filter="url(#b1.5)">
					<path d={quad(tt, towards(tt, 0.86), towards(tb, 0.86), tb)} fill="#2a3138" />
					<path d={quad(tt, towards(tt, 0.86), towards([tt[0], tt[1] + 60], 0.86), [tt[0], tt[1] + 60])} fill="#1d2228" />
					{[[0.02, 0.1], [0.14, 0.22], [0.28, 0.34], [0.39, 0.44], [0.48, 0.52], [0.56, 0.59], [0.62, 0.65]].map(([e0, e1], i) => {
						const d0 = (e0 + trainShift) % 0.7, d1 = d0 + (e1 - e0) * (1 - d0 * 0.6); if (d1 > 0.86) return null;
						const top = (d: number) => towards([tt[0], tt[1] + 170], d), bot = (d: number) => towards([tt[0], tt[1] + 470], d);
						return <path key={i} d={quad(top(d0), top(d1), bot(d1), bot(d0))} fill="url(#winG)" />;
					})}
					<path d={quad(towards([tt[0], 740], 0), towards([tt[0], 740], 0.86), towards([tt[0], 756], 0.86), [tt[0], 756])} fill="#b8963f" opacity={0.8} />
				</g>
				<path d={quad(tt, towards(tt, 0.86), towards(tb, 0.86), tb)} fill="#9fb6d8" opacity={0.06} filter="url(#b12)" />
				{/* the nearest carriage, running past the frame edge: big, soft, its windows spilling cold light */}
				<g filter="url(#b3)">
					<path d={quad(towards(tt, -0.95), tt, tb, towards(tb, -0.95))} fill="#262d34" />
					<path d={quad(towards(tt, -0.95), tt, towards([tt[0], tt[1] + 60], 0), towards([tt[0], tt[1] + 60], -0.95))} fill="#1a1f25" />
					{[[-0.9, -0.66], [-0.52, -0.33], [-0.22, -0.07]].map(([e0, e1], i) => {
						const sh = (trainShift * 1.6) % 0.4; const d0 = e0 + sh, d1 = e1 + sh; if (d0 > 0) return null;
						const top = (d: number) => towards([tt[0], tt[1] + 170], Math.min(0, d)), bot = (d: number) => towards([tt[0], tt[1] + 470], Math.min(0, d));
						return <g key={i}><path d={quad(top(d0), top(d1), bot(d1), bot(d0))} fill="url(#winG)" opacity={0.92} />
							<path d={quad(top(d0 + (d1 - d0) * 0.48), top(d0 + (d1 - d0) * 0.52), bot(d0 + (d1 - d0) * 0.52), bot(d0 + (d1 - d0) * 0.48))} fill="#2a3138" /></g>;
					})}
					<path d={quad(towards([tt[0], 740], -0.95), towards([tt[0], 740], 0), towards([tt[0], 760], 0), towards([tt[0], 760], -0.95))} fill="#b8963f" opacity={0.8} />
					<path d={quad(towards([tt[0], 760], -0.95), towards([tt[0], 760], 0), tb, towards(tb, -0.95))} fill="#1d2329" />
				</g>
				<path d={quad(towards(tt, -0.95), tt, tb, towards(tb, -0.95))} fill="#cfe0f5" opacity={0.08} filter="url(#b12)" />
				<ellipse cx={1560} cy={900} rx={260} ry={420} fill="#cfe0f5" opacity={0.06} filter="url(#b12)" />
				{/* top light on the puppet */}
				<polygon points={`${mx - 70},-20 ${mx + 130},-20 ${mx + 330},${my + 10} ${mx - 300},${my + 10}`} fill="#dfe8f5" opacity={0.07} filter="url(#b12)" />
				<ellipse cx={mx + 20} cy={my + 8} rx={300} ry={46} fill="#dfe8f5" opacity={0.1} filter="url(#b6)" />
				{crowd && [[300, 0.5], [520, 0.62], [180, 0.7], [420, 0.76], [620, 0.8]].map(([x0, d], i) => {
					const p = towards([x0, 930], d), kk = 1.22 * (1 - d) * 1.05;
					const cp: Pose = withBreath({lean: 6 + 1.2 * Math.sin(t * (0.7 + i * 0.13) + i), head: 22 + 5 * Math.sin(t * (0.45 + i * 0.1) + i * 2), armN: [-3 + 2 * Math.sin(t * 0.8 + i), 4], armF: [5, 8], legN: [2, 0], legF: [-3, 0], case: i % 2 === 0}, t, i * 1.7);
					return <g key={i} opacity={1 - d * 0.5} filter={d > 0.7 ? 'url(#b1.5)' : undefined}>
						<g filter="url(#rimC)"><g transform={`translate(${p[0]},${p[1]}) scale(${kk})`}><Mannequin pose={cp} /></g></g>
						{attachPts(cp).map(({p: q, to}, si) => { const a = W2(p[0], p[1], kk, q); return <line key={si} x1={a[0]} y1={a[1]} x2={p[0] + to * 40 * kk} y2={-10} stroke="#e8e8ee" strokeWidth={0.8} opacity={0.35} />; })}
					</g>;
				})}
				{/* reflection of the puppet in the wet floor */}
				<g opacity={0.12} filter="url(#b3)"><g transform={`translate(${mx},${my + 4}) scale(${k},${-k * 0.9})`}><Mannequin pose={pose} /></g></g>
				<ellipse cx={mx + 10} cy={my + 4} rx={92} ry={13} fill="#000" opacity={0.75} filter="url(#b3)" />
				<g filter="url(#rimC)"><g transform={`translate(${mx},${my}) scale(${k})`}><Mannequin pose={pose} /></g></g>
				{/* the strings: eight lines converging up to a control bar out of frame */}
				{attachPts(pose).map(({p, to}, i) => {
					const a = W2(mx, my, k, p);
					return <g key={i}><RealString a={a} b={barEnd(to)} id={`st${i}`} band={[0.25 + (i % 3) * 0.05, 0.55]} w={i === 4 || i === 6 ? 1.15 : 0.9} /><Eyelet p={a} k={k * 0.9} /></g>;
				})}
				{/* dust in the light */}
				{Array.from({length: 36}, (_, i) => <circle key={i} cx={mx - 200 + ((i * 137) % 460)} cy={60 + ((i * 211) % 780)} r={0.8 + (i % 3) * 0.6} fill="#eef4fb" opacity={0.18 + (i % 4) * 0.06} />)}
				{/* foreground: the platform edge, out of focus */}
				<path d="M-20,1040 L1960,1000 L1960,1100 L-20,1100 Z" fill="#0b0c0e" filter="url(#b6)" opacity={0.9} />
			</svg>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,40,60,0.18), rgba(0,0,0,0) 40%, rgba(10,20,30,0.2))', mixBlendMode: 'multiply'}} />
			{!bare && <><Grade /><Mark /></>}
			{sub && <div style={{opacity: subO}}><Sub t={sub} /></div>}
		</AbsoluteFill>
	);
};
/** close-up crop of the strings for review */

const DROP = 12.978;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const fadeIO = (t: number, a: number, b: number, d = 0.25) => cl01((t - a) / d) * cl01((b - t) / d);
const Sample35: React.FC = () => {
	useFonts();
	const tc = useCurrentFrame() / FPS;
	const t = Math.floor(tc * 12) / 12;                                         // stop-motion: everything steps at 12 fps
	const spinU = ease(cl01((t - 3.9) / 1.7));
	const flick = t > 3.9 && t < 5.7 ? 0.45 + 0.55 * ((Math.floor(t * 12) * 7919) % 5 > 1 ? 1 : 0) : 1;
	const s1 = (
		<S1b t={t} spin={6 * spinU} flick={flick} trainShift={0.42 * spinU} headLift={20 * Math.sin(Math.PI * cl01((t - 3.9) / 2.0))}
			sub={t < 3.6 ? '早上挤地铁，上班，加班，回家' : '第二天，再来一遍'} subO={t < 3.6 ? fadeIO(tc, 0.5, 3.55) : fadeIO(tc, 3.7, 6.3)} />
	);
	// the plank: held above frame, released in the music's silence, lands on the drop, settles with a damped bounce
	const fall = cl01((t - (DROP - 0.6)) / 0.6);
	const u = t - DROP;
	const plankY = t < DROP - 0.6 ? -320 : t < DROP ? -320 + 620 * fall * fall : 300 - 28 * Math.exp(-5 * u) * Math.cos(16 * u);
	const s2 = (
		<S2 t={t} plankY={plankY} lookUp={cl01((t - (DROP + 0.25)) / 0.8)}
			sub={t < 9.7 ? '有个人，这样过了永远' : t < 12.3 ? '可有位哲学家说：他是幸福的' : undefined}
			subO={t < 9.7 ? fadeIO(tc, 7.0, 9.65) : fadeIO(tc, 9.8, 12.25)} />
	);
	const x = cl01((tc - 6.4) / 0.6);
	const end = cl01((16.5 - tc) / 0.6);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{opacity: (1 - x) * end}}>{s1}</AbsoluteFill>
			{x > 0 && <AbsoluteFill style={{opacity: x * end}}>{s2}</AbsoluteFill>}
		</AbsoluteFill>
	);
};

// ================================================================== the film (script v1) · music: placeholder track from 29.5 s, its drop (42.478 s) = the title
const F_DROP = 12.978;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const walkPose = (ph: number, head = 0, lean = 2): Pose => ({
	lean: lean + 1.6 * Math.sin(2 * ph + 0.6), head: head - 2.2 * Math.sin(2 * ph + 0.3), ground: true,
	legN: [24 * Math.sin(ph), -4 - 34 * Math.pow(Math.max(0, Math.cos(ph)), 1.6)], legF: [-24 * Math.sin(ph), -4 - 34 * Math.pow(Math.max(0, -Math.cos(ph)), 1.6)],
	armN: [-17 * Math.sin(ph - 0.35), 8 + 14 * Math.max(0, -Math.sin(ph - 0.6))], armF: [17 * Math.sin(ph - 0.35), 8 + 14 * Math.max(0, Math.sin(ph - 0.6))],
});
/** a hanging puppet never stands quite still: breath, and a slow pendulum swing on its strings */
const breathe = (t: number, seed = 0): Partial<Pose> => ({lean: 1.4 * Math.sin(t * 1.7 + seed) + 1.0 * Math.sin(t * 0.55 + seed * 2), head: 1.8 * Math.sin(t * 1.7 + seed - 0.7)});
const withBreath = (p: Pose, t: number, seed = 0): Pose => { const b = breathe(t, seed); return {...p, lean: (p.lean ?? 0) + (b.lean ?? 0), head: (p.head ?? 0) + (b.head ?? 0)}; };
const STAND: Pose = {lean: 2, head: 8, armN: [-3, 5], armF: [4, 6], legN: [3, 0], legF: [-3, 0]};

// ---- subtitle lines: [text, scene-section]; times are laid out below on the reading budget
type Sec = 'plat' | 'hill' | 'myth' | 'roll' | 'down' | 'gods' | 'lab' | 'dusk' | 'attic' | 'walk' | 'phone' | 'rocks' | 'plat2' | 'dawn';
const SCRIPT: [string, Sec][] = [
	['早上挤地铁，上班，加班，回家', 'plat'], ['第二天，再来一遍', 'plat'],
	['有个人，这样过了永远', 'hill'], ['可有位哲学家说：他是幸福的', 'hill'],
	['希腊神话里，西西弗斯得罪了众神', 'myth'], ['惩罚是：把一块巨石，推上山顶', 'myth'],
	['石头一到山顶，就滚下来', 'roll'], ['他只能走下山，重新再推。永远', 'down'],
	['众神觉得：没有比[“无用又无望的劳动”]更可怕的惩罚', 'gods'],
	['他们说对了吗？2008年，有人在实验室里，造了一个西西弗斯', 'lab'], ['让人拼积木小人：第一个给2美元，之后每个少一点', 'lab'],
	['一组，拼好的就摆在桌上', 'lab'], ['另一组，刚拼好，就当着你的面拆掉', 'lab'], ['同样的活，同样的钱', 'lab'],
	['被拆的那组，平均少拼了三个多：10.6个，对7.2个', 'lab'], ['让人放弃的，不是累，是[“没意义”]', 'lab'],
	['那西西弗斯，凭什么幸福？', 'dusk'],
	['1942年，二战正酣，28岁的加缪写下了《西西弗斯神话》', 'attic'], ['他承认：世界不会给我们一个现成的意义', 'attic'],
	['但他最在意的，是西西弗斯下山的那段路', 'walk'], ['那一刻他清醒地知道：石头还会滚下来', 'walk'],
	['他不再等山顶，山顶也就惩罚不了他', 'walk'], ['[“登上山顶的奋斗本身，就足以充实一颗人心”]', 'walk'],
	['后来，心理学给了相似的答案', 'phone'], ['2010年，哈佛的研究者用手机，随机打断2250个人', 'phone'],
	['问：你在做什么？心在这件事上吗？开心吗？', 'phone'], ['人们有46.9%的时间，心不在焉', 'phone'],
	['而心不在焉的时候，明显更不开心', 'phone'], ['影响快乐的，常常不是你在做什么，而是心在不在这儿', 'phone'],
	['1997年，研究者问了一群上班族：你怎么看自己的工作？', 'rocks'],
	['有人说：只是份工作；有人说：是我的事业；有人说：是我的使命', 'rocks'],
	['差不多各占三分之一——就连做同一份工作的人里，也一样', 'rocks'], ['觉得是使命的人，对工作、对生活都更满意', 'rocks'],
	['同一块石头，不同的人，推出了不同的人生', 'rocks'],
	['我们每个人，都在推自己的石头', 'plat2'], ['石头不会消失，山顶也许永远到不了', 'dawn'],
	['但怎么推、为什么推，是你自己的', 'dawn'], ['所以，我们必须想象：西西弗斯是[幸福的]', 'dawn'],
];
const readDur = (s: string) => Math.max(2.0, s.replace(/[\[\]“”，：；。？——、《》]/g, '').length / 5.6 + 0.3);
type Line = {a: number; b: number; text: string; sec: Sec};
const LINES: Line[] = (() => {
	const fixed: Record<number, number> = {0: 0.5, 1: 3.7, 2: 7.0, 3: 9.8, 4: F_DROP + 5.2};
	const out: Line[] = [];
	let t = 0;
	SCRIPT.forEach(([text, sec], i) => {
		const prev = out[i - 1];
		let a = fixed[i] ?? t;
		if (!(i in fixed) && prev && prev.sec !== sec) a += 0.35;               // breathe at a section change
		const b = i === 0 ? 3.55 : i === 1 ? 6.3 : i === 2 ? 9.65 : i === 3 ? 12.25 : a + readDur(text);
		out.push({a, b, text, sec});
		t = b + 0.15;
	});
	return out;
})();
const secSpan = (sec: Sec): [number, number] => {
	const ls = LINES.filter((l) => l.sec === sec);
	return [ls[0].a, ls[ls.length - 1].b];
};
const CARD = LINES[LINES.length - 1].b + 0.6;
const FILM_END = CARD + 2.6;
/** section windows for the picture: each runs from its first line (minus a lead) to the next section's start */
const SECS: {sec: Sec; a: number; b: number}[] = (() => {
	const order: Sec[] = [];
	LINES.forEach((l) => { if (!order.includes(l.sec)) order.push(l.sec); });
	return order.map((sec, i) => {
		const [a] = secSpan(sec);
		const next = order[i + 1] ? secSpan(order[i + 1])[0] - 0.35 : CARD;
		return {sec, a: sec === 'plat' ? 0 : sec === 'hill' ? 6.4 : a - 0.35, b: sec === 'hill' ? F_DROP + 5.0 : next};
	});
})();

// ---- shared bits
const Title: React.FC<{plankY: number; t: number}> = ({plankY, t}) => <S2 t={t} plankY={plankY} lookUp={cl01((t - (F_DROP + 0.25)) / 0.8)} />;

// myth: he pushes the rock uphill under the gods' bar (pushes come in heaves)
const MythPush: React.FC<{u: number; T: number}> = ({u, T}) => {
	const ys = (x: number) => 880 - 0.32 * x;
	const k = 0.82, r = 150;
	const heave = Math.max(0, Math.sin(u * 2.1)) ** 2;
	const cx = 980 + 9 * u + 6 * heave;
	const cy = ys(cx) - r * 0.92;
	const pose: Pose = {...PUSH, lean: 30 + 4 * heave, legN: [22 + 6 * heave, -30], legF: [-30 - 4 * heave, 4]};
	const tip = tipOf(pose, true);
	const mx = cx - r * 0.98 - tip[0] * k, my = ys(mx) + 12;
	const bx = 520 + 9 * u, by = 250 + 6 * Math.sin(u * 2.1), rot = 8 + 3 * Math.sin(u * 2.1 + 1);
	return (
		<Frame header="古希腊 · 神话">
			<Land sky={NIGHT} a={880} b={-0.32} sun={[300, 600, 0.22]} t={T} />
			<Rock c={[cx, cy]} r={r} rot={u * 9} />
			<Man x={mx} y={my} k={k} pose={pose} warm={false} />
			{attachPts(pose).map(({p, to}, i) => { const a = W2(mx, my, k, p); const slot: Pt = [[-1, -2, -4, -3].includes(to) ? -124 + 40 * (Math.abs(to) - 1) : 124 - 40 * (Math.abs(to) - 1), [1, -1].includes(to) ? 150 : 0]; return <g key={i}><RealString a={a} b={barPt(bx, by, rot, slot)} id={`m${i}`} band={[0.3, 0.75]} w={i === 4 || i === 6 ? 1.05 : 0.85} /><Eyelet p={a} k={k * 0.9} /></g>; })}
			<CrossBar x={bx} y={by} rot={rot} />
			<GodHand x={bx - 26} y={by - 84} s={0.75} rot={6} />
			<GodHand x={bx + 84} y={by - 76} s={0.66} rot={-10} flip />
		</Frame>
	);
};
// near the top the rock gets away from him and rolls back down past him
const Roll: React.FC<{u: number; T: number; dur: number}> = ({u, T, dur}) => {
	const ys = (x: number) => 980 - 0.42 * x;
	const r = 120, k = 0.72;
	const q = cl01(u / dur);
	const roll = q < 0.25 ? 0 : ((q - 0.25) / 0.75) ** 2;
	const cx = lerp(1460, -260, roll), cy = ys(cx) - r * 0.92;
	const push: Pose = {...PUSH, lean: 26};
	const mx = 1460 - r * 0.98 - tipOf(push, true)[0] * k, my = ys(mx) + 10;
	const pose: Pose = q < 0.25 ? push : {lean: 4, head: 34, armN: [-2, 10], armF: [6, 10], legN: [6, 0], legF: [-6, 0]};
	return (
		<Frame header="古希腊 · 神话">
			<Land sky={NIGHT} a={980} b={-0.42} sun={[300, 640, 0.18]} t={T} />
			<Rock c={[cx, cy]} r={r} rot={-roll * 900} />
			<Man x={mx} y={my} k={k} pose={pose} warm={false} flip={q >= 0.25} />
			{attachPts(pose).map(({p}, i) => { const a = W2(mx, my, k, [q >= 0.25 ? -p[0] : p[0], p[1]]); return <g key={i}><RealString a={a} b={[mx + (i - 3.5) * 40, -300]} id={`r${i}`} w={0.85} /><Eyelet p={a} k={k * 0.9} /></g>; })}
		</Frame>
	);
};
// he walks back down after it
const Down: React.FC<{u: number; T: number}> = ({u, T}) => {
	const ys = (x: number) => 980 - 0.42 * x;
	const k = 0.72, mx = 1250 - 70 * u, my = ys(mx) + 10;
	const pose = walkPose(u * 6.5, 20, 6);
	return (
		<Frame header="古希腊 · 神话">
			<Land sky={NIGHT} a={980} b={-0.42} sun={[300, 640, 0.18]} t={T} />
			<Rock c={[180, ys(180) - 110]} r={120} blur />
			<Man x={mx} y={my} k={k} pose={pose} warm={false} flip />
			{attachPts(pose).map(({p}, i) => { const a = W2(mx, my, k, [-p[0], p[1]]); return <g key={i}><RealString a={a} b={[mx + (i - 3.5) * 40, -300]} id={`d${i}`} w={0.85} /><Eyelet p={a} k={k * 0.9} /></g>; })}
		</Frame>
	);
};
// the gods' hands, close: the bar, strings running down into the dark
const Gods: React.FC<{u: number}> = ({u}) => {
	const bx = 960, by = 330 + 8 * Math.sin(u * 1.6), rot = 4 * Math.sin(u * 1.2);
	return (
		<Frame bg="#030304">
			<rect width={W} height={H} fill="#050506" />
			<ellipse cx={960} cy={360} rx={760} ry={420} fill="url(#warmGlow)" opacity={0.12} />
			{[-124, -84, -44, 44, 84, 124].map((sx, i) => { const a = barPt(bx, by, rot, [sx, i % 2 ? 0 : 0]); return <RealString key={i} a={[a[0] + (i - 2.5) * 70, 1100]} b={a} id={`g${i}`} band={[0.55, 0.9]} w={1.1} />; })}
			<g transform={`translate(${bx},${by}) scale(1.8) translate(${-bx},${-by})`}>
				<CrossBar x={bx} y={by} rot={rot} />
				<GodHand x={bx - 26} y={by - 84} s={0.75} rot={6} />
				<GodHand x={bx + 84} y={by - 76} s={0.66} rot={-10} flip />
			</g>
		</Frame>
	);
};
// the lab: kept vs taken apart; price tags; the tallies count up
const Lab: React.FC<{T: number}> = ({T}) => {
	const [a0] = secSpan('lab');
	const L = (i: number) => LINES.filter((l) => l.sec === 'lab')[i];
	const pose: Pose = {head: 22, lean: 12 + 3 * Math.sin(T * 3), armN: [40 + 6 * Math.sin(T * 6), 40], armF: [36 + 6 * Math.sin(T * 6 + 1), 44]};
	const kept = Math.min(6, 1 + Math.floor(Math.max(0, T - L(2).a) / 1.2));
	const tall = cl01((T - L(5).a) / 2.6);
	const cyc = Math.max(0, T - L(3).a) % 2.4, grab = T > L(3).a ? cl01(cyc / 0.8) : 0;
	const price = Math.max(0, Math.floor((T - L(1).a - 1.0) / 0.8) + 1);
	return (
		<Frame header="2008 · 美国" bg="#0b0b0d">
			<rect width={W} height={H} fill="#121316" filter="url(#paper)" />
			{Array.from({length: 13}, (_, i) => <rect key={i} x={i * 150} y={0} width={4} height={700} fill="#0c0d0f" />)}
			<g transform="translate(1340,170) scale(0.86)" opacity={cl01((T - L(4).a) / 0.4) * 0.92 + 0.08}>
				<rect x={-14} y={-14} width={588} height={348} fill="#2a1d14" filter="url(#wood)" />
				<rect width={560} height={320} fill="#1b211e" filter="url(#paper)" />
				{([['摆着', 10.6, 60], ['被拆', 7.2, 200]] as const).map(([lab, v, y]) => {
					const shown = Math.floor(v * tall);
					return (
						<g key={lab} transform={`translate(40,${y})`}>
							<text x={0} y={40} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40}} fill="#e8e4da" opacity={0.85}>{lab}</text>
							{Array.from({length: shown}, (_, i) => (i % 5 === 4
								? <line key={i} x1={110 + Math.floor(i / 5) * 90 - 8} y1={30} x2={110 + Math.floor(i / 5) * 90 + 64} y2={4} stroke="#e8e4da" strokeWidth={4} opacity={0.8} strokeLinecap="round" />
								: <line key={i} x1={110 + Math.floor(i / 5) * 90 + (i % 5) * 14} y1={-2} x2={110 + Math.floor(i / 5) * 90 + (i % 5) * 14 + 3} y2={44} stroke="#e8e4da" strokeWidth={4} opacity={0.8} strokeLinecap="round" />))}
							{tall >= 1 && <text x={500} y={42} textAnchor="end" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 60}} fill={lab === '被拆' ? '#ff8a70' : '#f1d7a0'}>{v.toFixed(1)}</text>}
						</g>
					);
				})}
			</g>
			<g transform="translate(300,690)">
				<ellipse cx={120} cy={-60} rx={520} ry={330} fill="url(#warmGlow)" opacity={0.55} />
				<line x1={0} y1={0} x2={30} y2={-200} stroke="#2a2724" strokeWidth={8} /><line x1={30} y1={-200} x2={130} y2={-230} stroke="#2a2724" strokeWidth={8} />
				<path d="M100,-250 L190,-200 L150,-170 L80,-220 Z" fill="#1d1b19" /><ellipse cx={150} cy={-188} rx={28} ry={8} fill="#ffd590" transform="rotate(30,150,-188)" />
			</g>
			<Man x={700} y={860} k={0.95} pose={pose} />
			{attachPts(pose).map(({p, to}, i) => { const a = W2(700, 860, 0.95, p); return <g key={i}><RealString a={a} b={[720 + to * 46, -300]} id={`l${i}`} w={0.85} /><Eyelet p={a} k={0.85} /></g>; })}
			<rect y={690} width={W} height={34} fill="url(#m-walnut)" filter="url(#grainL)" />
			<rect y={724} width={W} height={360} fill="#0c0a09" />
			{Array.from({length: kept}, (_, i) => <Bot key={i} x={110 + i * 62} y={690} c={BOTC[i % 5]} s={0.9} />)}
			<Bot x={880} y={690} c={BOTC[2]} s={0.9} />
			{/* price tag: $2.00, $1.89, … */}
			{T > L(1).a && T < L(2).b && (
				<g transform="translate(960,560) rotate(-4)" opacity={cl01((T - L(1).a) / 0.3)}>
					<rect x={-70} y={-34} width={140} height={60} rx={6} fill="#e9dfc8" filter="url(#paper)" />
					<circle cx={-52} cy={-4} r={6} fill="#0b0b0d" />
					<text x={10} y={10} textAnchor="middle" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 40}} fill="#2a2420">${Math.max(0.02, 2 - 0.11 * Math.min(price, 18)).toFixed(2)}</text>
				</g>
			)}
			{T > L(3).a && (
				<g>
					<GodHand x={1150 - 20 * (1 - grab)} y={440 - 160 * (1 - grab)} s={0.62} rot={-14} />
					<g transform={`translate(${lerp(890, 1140, grab)},${lerp(690, 568, grab)}) rotate(${-10 * grab})`}><Bot x={0} y={0} c={BOTC[0]} s={0.9} /></g>
					{grab >= 1 && [[1080, 640, 10], [1115, 668, -20], [1190, 676, 35], [1220, 650, -8]].map(([x, y, r], i) => (
						<rect key={i} x={x} y={y + Math.min(40, (cyc - 0.8) * 120)} width={12} height={22} fill="#7a3b2a" transform={`rotate(${r}, ${x}, ${y})`} />
					))}
				</g>
			)}
		</Frame>
	);
};
// dusk at the foot: he stands by the rock
const Dusk: React.FC<{T: number}> = ({T}) => {
	const ground = 860, k = 0.95, mx = 760;
	const pose: Pose = {head: 14, lean: 2, armN: [52, 6], armF: [4, 8], legN: [6, 0], legF: [-6, 0]};
	const tip = W2(mx, ground, k, tipOf(pose, true));
	const r = (ground - tip[1]) / 1.62, c: Pt = [tip[0] + r * 0.62, tip[1] + r * 0.62];
	return (
		<Frame>
			<Land sky={NIGHT} a={ground + 10} b={0} sun={[1380, 650, 0.3]} clay="#2f2a26" t={T} />
			<Rock c={c} r={r} />
			<Man x={mx} y={ground} k={k} pose={pose} />
			{attachPts(pose).map(({p, to}, i) => { const a = W2(mx, ground, k, p); return <g key={i}><RealString a={a} b={[mx + 20 + to * 50, -300]} id={`k${i}`} w={0.85} /><Eyelet p={a} k={0.85} /></g>; })}
		</Frame>
	);
};
// the attic in 1942: rain falls, the flame breathes, the searchlights sweep
const Attic: React.FC<{T: number}> = ({T}) => (
	<g>
		<S5 />
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<g transform="translate(1290,170)">
				{Array.from({length: 30}, (_, i) => { const y = ((i * 97 + T * 600) % 420); return <line key={i} x1={(i * 53) % 430} y1={y} x2={(i * 53) % 430 - 5} y2={y + 30} stroke="#cfdcf0" strokeWidth={1.2} opacity={0.35} />; })}
			</g>
			<ellipse cx={560} cy={700} rx={60 + 6 * Math.sin(T * 9)} ry={46} fill="#ffd27a" opacity={0.08 + 0.04 * Math.sin(T * 13)} filter="url(#b12)" />
		</svg>
	</g>
);
// the walk down: strings held → the bar slips and tumbles away (release r: 0 → 1)
const Walk: React.FC<{T: number; r: number}> = ({T, r}) => {
	const slopeY2 = (x: number) => 360 + 0.3 * x;
	const k = 0.98, px = 820 + 14 * (T - secSpan('walk')[0]), py = slopeY2(px) + 14;
	const pose = walkPose(T * 5.2, -18 + 6 * Math.sin(T * 0.7), -3);
	const an = attachPts(pose).map(({p}) => W2(px, py, k, p));
	const bar: Pt = [lerp(px + 30, px - 520, r), lerp(60, 1300, r * r)], brot = 360 * r * 1.3;
	const held = r < 0.06;
	return (
		<AbsoluteFill style={{background: '#1b2029'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<Land sky={['#07090e', '#1a1f2a', '#4a3f42', '#8a5f42']} a={360} b={0.3} sun={[1560, 652, 0.6 + 0.3 * r]} clay="#3e3731" t={T} />
				<Man x={px} y={py} k={k} pose={pose} />
				{held
					? attachPts(pose).map(({to}, i) => <g key={i}><RealString a={an[i]} b={[bar[0] + to * 46, bar[1] - 60]} id={`w${i}`} w={0.85} /><Eyelet p={an[i]} k={k * 0.9} /></g>)
					: an.map((a, i) => <g key={i}><Eyelet p={a} k={k * 0.9} /><path d={`M${a[0]},${a[1]} c${(i % 2 ? 6 : -6)},-${30 + i * 6} ${(i % 3) * 5 - 5},-${50 + i * 5} ${(i % 2 ? 2 : -3)},-${70 + i * 9}`} stroke="#e8e2d6" strokeWidth={1} fill="none" opacity={0.45 * (1 - cl01((r - 0.2) / 0.6))} /></g>)}
				{r > 0.03 && r < 1 && (
					<MatCtx.Provider value={MATS.beech}><g transform={`translate(${bar[0]},${bar[1]}) rotate(${brot})`}>
						{[[0, -150], [-118, 0], [118, 0], [0, 150]].map(([x, y], i) => (
							<path key={i} d={`M${x},${y} c${10 + i * 6},70 ${-30 - i * 4},120 ${4 + i * 3},${190 + i * 25}`} stroke="#efe8da" strokeWidth={1.2} fill="none" opacity={0.5} transform={`rotate(${-brot}, ${x}, ${y})`} />
						))}
						<Cap p={[-124, 0]} q={[124, 0]} w1={16} w2={16} /><Cap p={[0, -156]} q={[0, 156]} w1={16} w2={16} /><Ball p={[0, 0]} r={11} />
					</g></MatCtx.Provider>
				)}
				<g filter="url(#b3)"><ellipse cx={1760} cy={1010} rx={300} ry={260} fill="#34302c" filter="url(#clay)" /></g>
			</svg>
			<Grade />
			<Header t="1942 · 加缪 ·《西西弗斯神话》" />
			<Mark />
		</AbsoluteFill>
	);
};
// the phone: the clock fills to 46.9 %; thoughts drift off, then come back with a small warm light
const Phone: React.FC<{T: number}> = ({T}) => {
	const L = (i: number) => LINES.filter((l) => l.sec === 'phone')[i];
	const pose: Pose = {head: 6, lean: 4, armN: [62, 38], armF: [58, 40], legN: [86, -86], legF: [82, -82]};
	const fx = 620, floor = 900, k = 0.95, fy = floor + 103 * k;
	const ht = W2(fx, fy, k, headTop(pose));
	const pie = 0.469 * cl01((T - L(3).a) / 1.8);
	const pa = 2 * Math.PI * pie;
	const away = cl01((T - L(3).a) / 3) * (1 - cl01((T - L(5).a) / 2));
	const buzz = T > L(1).a && T < L(2).b && Math.floor(T * 6) % 3 !== 0;
	const glow = cl01((T - L(5).a - 1.5) / 1);
	return (
		<Frame header="2010 · 哈佛" bg="#0a0b0e">
			<rect width={W} height={H} fill="#111317" filter="url(#paper)" />
			<rect y={floor} width={W} height={180} fill="#0b0b0c" />
			<g transform="translate(1440,300)" opacity={0.45 + 0.55 * cl01((T - L(3).a + 0.3) / 0.4)}>
				<circle r={150} fill="#d9d1c0" opacity={0.9} filter="url(#paper)" />
				{pie > 0.001 && <path d={`M0,0 L0,-150 A150,150 0 ${pie > 0.5 ? 1 : 0} 1 ${150 * Math.sin(pa)},${-150 * Math.cos(pa)} Z`} fill="#8a3a2e" opacity={0.75} />}
				<circle r={150} fill="none" stroke="#2a2420" strokeWidth={10} />
				{Array.from({length: 12}, (_, i) => { const a = (i / 12) * 2 * Math.PI; return <line key={i} x1={130 * Math.sin(a)} y1={-130 * Math.cos(a)} x2={142 * Math.sin(a)} y2={-142 * Math.cos(a)} stroke="#2a2420" strokeWidth={4} />; })}
				{pie > 0.001 && <text x={0} y={230} textAnchor="middle" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 64}} fill="#ff8a70">{(pie * 100).toFixed(1)}%</text>}
			</g>
			<rect x={760} y={700} width={560} height={22} fill="url(#m-walnut)" filter="url(#grainL)" />
			{[780, 1290].map((x) => <rect key={x} x={x} y={722} width={14} height={178} fill="#1a120c" />)}
			<g transform={`translate(${1000 + (buzz ? 3 : 0)},690)`}>
				<rect x={-34} y={-12} width={68} height={12} rx={4} fill="#0e0f12" />
				<rect x={-30} y={-11} width={60} height={9} rx={3} fill="#9fb6d8" opacity={buzz ? 0.9 : 0.35} />
				<ellipse cx={0} cy={-6} rx={140} ry={70} fill="url(#coldGlow)" opacity={buzz ? 0.8 : 0.25} />
				{buzz && [0, 1, 2].map((i) => <g key={i}><path d={`M${-50 - i * 16},${-20 - i * 10} q-8,10 0,20`} stroke="#cfdcf0" strokeWidth={2} fill="none" opacity={0.6} /><path d={`M${50 + i * 16},${-20 - i * 10} q8,10 0,20`} stroke="#cfdcf0" strokeWidth={2} fill="none" opacity={0.6} /></g>)}
			</g>
			<rect x={fx - 70} y={floor - 140} width={150} height={16} fill="#1c140e" />
			<rect x={fx - 70} y={floor - 330} width={16} height={330} fill="#1c140e" />
			<rect x={fx + 64} y={floor - 124} width={12} height={124} fill="#1c140e" />
			<Man x={fx} y={fy} k={k} pose={pose} />
			{glow > 0 && <circle cx={fx + 4} cy={fy - 360 * k} r={60} fill="url(#warmGlow)" opacity={glow} />}
			{away > 0.02 && [[60, 40, 16], [130, 110, 26], [250, 200, 70]].map(([dx, dy, r], i) => {
				const x = ht[0] - dx * (0.4 + away), y = ht[1] - dy * (0.4 + away);
				return (
					<g key={i} opacity={Math.min(1, away * 1.5) * 0.9}>
						{i < 2 ? <circle cx={x} cy={y} r={r} fill="#3a3f4a" filter="url(#felt)" /> : (
							<g>{[[-60, 0, 60], [0, -26, 74], [60, -2, 56], [0, 18, 80]].map(([ex, ey, rr], j) => <ellipse key={j} cx={x + ex} cy={y + ey} rx={rr} ry={rr * 0.6} fill="#3a3f4a" filter="url(#felt)" />)}
								<path d={`M${x - 70},${y + 20} L${x - 30},${y - 20} L${x + 5},${y + 8} L${x + 40},${y - 30} L${x + 80},${y + 20} Z`} fill="#565d6b" opacity={0.8} />
								<circle cx={x + 50} cy={y - 40} r={10} fill="#d9c9a8" opacity={0.6} /></g>
						)}
					</g>
				);
			})}
		</Frame>
	);
};
// three rocks: the tags arrive one by one; the third candle lights
const Rocks: React.FC<{T: number}> = ({T}) => {
	const L = (i: number) => LINES.filter((l) => l.sec === 'rocks')[i];
	const ys = (x: number) => 900 - 0.12 * x;
	const k = 0.56, r = 96;
	const lanes = [[260, '只是份工作'], [860, '是我的事业'], [1460, '是我的使命']] as const;
	const tagAt = (i: number) => L(1).a + i * ((L(1).b - L(1).a) / 3);
	const lit = cl01((T - L(3).a) / 0.8);
	return (
		<Frame header="1997 · 美国">
			<Land sky={NIGHT} a={900} b={-0.12} sun={[1700, 640, 0.25]} t={T} />
			{lanes.map(([x0, tag], i) => {
				const heave = Math.max(0, Math.sin(T * 2.1 + i * 1.3)) ** 2;
				const cx = x0 + 150 + 4 * (T - L(0).a) + 4 * heave, cy = ys(cx) - r * 0.92;
				const pose: Pose = {...PUSH, lean: 30 + 4 * heave};
				const tip = tipOf(pose, true);
				const mx = cx - r * 0.98 - tip[0] * k, my = ys(mx) + 8;
				const warm = i === 2 ? lit : 0;
				const to = cl01((T - tagAt(i)) / 0.4);
				return (
					<g key={tag}>
						{warm > 0 && <ellipse cx={cx} cy={cy - 60} rx={340} ry={260} fill="url(#warmGlow)" opacity={0.75 * warm} />}
						<Rock c={[cx, cy]} r={r} rim={i === 2 && warm > 0.5 ? '#ffc58a' : '#7f8aa0'} rot={(T - L(0).a) * 3} />
						<Man x={mx} y={my} k={k} pose={pose} warm={i === 2 && warm > 0.5} />
						{to > 0 && (
							<g transform={`translate(${cx + 30},${cy - r - 4 - 30 * (1 - to)}) rotate(${-6 + i * 5})`} opacity={to}>
								<line x1={0} y1={0} x2={10} y2={40} stroke="#d9cfb8" strokeWidth={1.5} opacity={0.7} />
								<rect x={-6} y={40} width={150} height={52} rx={4} fill="#d9cfb8" filter="url(#paper)" opacity={i === 2 && warm > 0.5 ? 1 : 0.75} />
								<text x={69} y={76} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 26}} fill="#2a2420">{tag}</text>
							</g>
						)}
						{i === 2 && warm > 0 && (
							<g transform={`translate(${cx - 30},${cy - r + 6})`}>
								<rect x={-8} y={-30} width={16} height={30} fill="#e9dfc8" />
								<path d={`M0,${-58 - 3 * Math.sin(T * 11)} C-8,-44 -6,-36 0,-32 C6,-36 8,-44 0,${-58 - 3 * Math.sin(T * 11)} Z`} fill="#ffd27a" opacity={warm} />
								<circle cx={0} cy={-44} r={22} fill="url(#warmGlow)" opacity={warm} />
							</g>
						)}
					</g>
				);
			})}
		</Frame>
	);
};
// dawn: the sun comes up; a hand on the rock; no strings
const Dawn: React.FC<{T: number}> = ({T}) => {
	const [a, b] = secSpan('dawn');
	const q = cl01((T - a) / (b - a + 2));
	const ground = 860, k = 0.95, mx = 760;
	const pose: Pose = {head: -10 - 4 * q, lean: 0, armN: [52, 6], armF: [4, 8], legN: [6, 0], legF: [-6, 0]};
	const tip = W2(mx, ground, k, tipOf(pose, true));
	const r = (ground - tip[1]) / 1.62, c: Pt = [tip[0] + r * 0.62, tip[1] + r * 0.62];
	const sky = [lerp(0x0b, 0x14, q), lerp(0x0e, 0x1e, q), lerp(0x15, 0x30, q)].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
	return (
		<Frame>
			<Land sky={[`#${sky}`, '#25263a', '#6a4a4a', q > 0.5 ? '#d89a62' : '#c88a5a']} a={ground + 10} b={0} sun={[1380, 700 - 90 * q, 0.6 + 0.4 * q]} clay="#3a322b" t={T} />
			<path d="M0,620 L300,520 L520,560 L700,470 L900,600 L1200,660 L1920,640 L1920,1080 L0,1080 Z" fill="#1d1a1c" opacity={0.6} filter="url(#paper)" />
			<Rock c={c} r={r} rim="#ffc58a" />
			<Man x={mx} y={ground} k={k} pose={pose} />
		</Frame>
	);
};
const EndCard: React.FC<{u: number}> = ({u}) => (
	<AbsoluteFill style={{background: '#050506', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
		<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: INK, letterSpacing: '0.1em', opacity: cl01(u / 0.4)}}>你现在推的石头是什么？</div>
		<div style={{fontFamily: SERIF, fontSize: 36, color: 'rgba(236,230,218,0.6)', letterSpacing: '0.3em', marginTop: 34, opacity: cl01((u - 0.3) / 0.4)}}>评论区说说</div>
		<div style={{position: 'absolute', bottom: 70, fontFamily: SERIF, fontSize: 26, color: 'rgba(236,230,218,0.4)', letterSpacing: '0.3em'}}>《推石头的人，是幸福的》 · ◆ Juno · VIBE知识大赏</div>
	</AbsoluteFill>
);

const Section: React.FC<{sec: Sec; T: number; t: number}> = ({sec, T, t}) => {
	const [a0] = secSpan(sec);
	const u = t - a0;
	switch (sec) {
		case 'plat': {
			const spinU = ease(cl01((t - 3.9) / 1.7));
			const flick = t > 3.9 && t < 5.7 ? 0.45 + 0.55 * ((Math.floor(t * 12) * 7919) % 5 > 1 ? 1 : 0) : 1;
			return <S1b t={t} spin={6 * spinU} flick={flick} trainShift={0.42 * spinU} headLift={20 * Math.sin(Math.PI * cl01((t - 3.9) / 2.0))} sub="" />;
		}
		case 'hill': {
			const fall = cl01((t - (F_DROP - 0.6)) / 0.6), v = t - F_DROP;
			const plankY = t < F_DROP - 0.6 ? -320 : t < F_DROP ? -320 + 620 * fall * fall : 300 - 28 * Math.exp(-5 * v) * Math.cos(16 * v);
			return <Title t={t} plankY={plankY} />;
		}
		case 'myth': return <MythPush u={u} T={t} />;
		case 'roll': return <Roll u={u} T={t} dur={secSpan('roll')[1] - a0} />;
		case 'down': return <Down u={u} T={t} />;
		case 'gods': return <Gods u={u} />;
		case 'lab': return <Lab T={t} />;
		case 'dusk': return <Dusk T={t} />;
		case 'attic': return <Attic T={t} />;
		case 'walk': {
			const rl = LINES.filter((l) => l.sec === 'walk')[2];
			return <Walk T={t} r={cl01((t - rl.a - 0.4) / 2.2)} />;
		}
		case 'phone': return <Phone T={t} />;
		case 'rocks': return <Rocks T={t} />;
		case 'plat2': return <S1b t={t} spin={0} headLift={16} sub="" />;
		case 'dawn': return <Dawn T={t} />;
	}
	return null;
};
const Film35: React.FC = () => {
	useFonts();
	const T = useCurrentFrame() / FPS;
	const t = Math.floor(T * 12) / 12;                                          // stop motion: the picture steps at 12 fps
	const XF = 0.5;
	const active = SECS.filter((s) => T >= s.a - XF && T < s.b + XF);
	const line = LINES.find((l) => T >= l.a && T < l.b);
	const subO = line ? cl01((T - line.a) / 0.2) * cl01((line.b - T) / 0.2) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{T < CARD + 0.4 && active.map((s) => {
				const o = cl01((T - (s.a - XF)) / XF) * (s.b + XF - T < XF ? cl01((s.b + XF - T) / XF) : 1);
				const first = s.sec === 'plat';
				return <AbsoluteFill key={s.sec} style={{opacity: first ? (s.b + XF - T < XF ? cl01((s.b + XF - T) / XF) : 1) : o}}><Section sec={s.sec} T={T} t={t} /></AbsoluteFill>;
			})}
			{line && <AbsoluteFill style={{opacity: subO}}><Sub t={line.text} /></AbsoluteFill>}
			{T >= CARD && <AbsoluteFill style={{opacity: cl01((T - CARD) / 0.4)}}><EndCard u={T - CARD} /></AbsoluteFill>}
		</AbsoluteFill>
	);
};
export const FILM35_FRAMES = Math.round(FILM_END * FPS);
export const FILM35_INFO = {LINES, SECS, CARD, FILM_END};

// ---- cover scene (no text; titles are set in PIL): he pushes uphill under the gods' bar, framed centre so both crops keep him
const CoverScene: React.FC = () => {
	const ys = (x: number) => 900 - 0.3 * x;
	const k = 0.95, r = 165, cx = 1110;
	const cy = ys(cx) - r * 0.92;
	const pose: Pose = {...PUSH, lean: 32};
	const tip = tipOf(pose, true);
	const mx = cx - r * 0.98 - tip[0] * k, my = ys(mx) + 12;
	const bx = 600, by = 170, rot = 12;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<Land sky={NIGHT} a={900} b={-0.3} sun={[1500, 560, 0.55]} />
				<Rock c={[cx, cy]} r={r} rim="#ffc58a" />
				<Man x={mx} y={my} k={k} pose={pose} />
				{attachPts(pose).map(({p, to}, i) => { const a = W2(mx, my, k, p); const slot: Pt = [[-1, -2, -4, -3].includes(to) ? -124 + 40 * (Math.abs(to) - 1) : 124 - 40 * (Math.abs(to) - 1), [1, -1].includes(to) ? 150 : 0]; return <g key={i}><RealString a={a} b={barPt(bx, by, rot, slot)} id={`c${i}`} band={[0.3, 0.75]} w={i === 4 || i === 6 ? 1.15 : 0.95} /><Eyelet p={a} k={k * 0.9} /></g>; })}
				<CrossBar x={bx} y={by} rot={rot} />
				<GodHand x={bx - 26} y={by - 84} s={0.75} rot={6} />
				<GodHand x={bx + 84} y={by - 76} s={0.66} rot={-10} flip />
			</svg>
			<Grade />
		</AbsoluteFill>
	);
};

// ================================================================== v2 · cinematic 2D (the opening platform is the bar): depth layers, big figure, one key light, no hands
const rnd2 = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
/** an irregular boulder outline around c with radius r */
const rockPath = (c: Pt, r: number, seed = 3) => {
	const R = rnd2(seed); const n = 22; const pts: Pt[] = [];
	for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + 0.05 * Math.sin(a * 3 + seed) + 0.035 * Math.sin(a * 5 + seed * 2) + 0.03 * (R() - 0.5) - (Math.sin(a) > 0.75 ? 0.05 : 0); pts.push([c[0] + Math.cos(a) * r * k * 1.03, c[1] + Math.sin(a) * r * k * 0.95]); }
	const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	const m0 = mid(pts[n - 1], pts[0]);
	return `M${m0[0]},${m0[1]} ` + pts.map((p, i) => { const m = mid(p, pts[(i + 1) % n]); return `Q${p[0]},${p[1]} ${m[0]},${m[1]}`; }).join(' ') + ' Z';
};
const BigRock: React.FC<{c: Pt; r: number; sun: Pt; seed?: number; rimCol?: string; ground?: number}> = ({c, r, sun, seed = 3, rimCol = '#ffbf86', ground}) => {
	const d = rockPath(c, r, seed);
	const ang = Math.atan2(sun[1] - c[1], sun[0] - c[0]);
	const ux = Math.cos(ang), uy = Math.sin(ang);
	const R = rnd2(seed + 9);
	const id = `rk${seed}`;
	return (
		<g>
			<ellipse cx={c[0] - ux * r * 0.35} cy={(ground ?? c[1] + r * 0.9) + 6} rx={r * 1.3} ry={r * 0.13} fill="#000" opacity={0.75} filter="url(#b6)" />
			<radialGradient id={`${id}g`} cx={0.5 + 0.32 * ux} cy={0.5 + 0.32 * uy - 0.12} r="0.78">
				<stop offset="0" stopColor="#7a6a5c" /><stop offset="0.35" stopColor="#4c4239" /><stop offset="0.75" stopColor="#25201c" /><stop offset="1" stopColor="#100e0c" />
			</radialGradient>
			<clipPath id={`${id}c`}><path d={d} /></clipPath>
			<path d={d} fill={`url(#${id}g)`} />
			<g clipPath={`url(#${id}c)`}>
				<rect x={c[0] - r * 1.2} y={c[1] - r * 1.2} width={r * 2.4} height={r * 2.4} fill="#6a5a4c" filter="url(#clay)" opacity={0.5} style={{mixBlendMode: 'overlay'}} />
				{/* pits and chips, each with a lit lower lip */}
				{Array.from({length: 26}, (_, i) => { const a = R() * Math.PI * 2, q = Math.sqrt(R()) * 0.85; const x = c[0] + Math.cos(a) * r * q, y = c[1] + Math.sin(a) * r * q; const s2 = 2 + R() * r * 0.035;
					return <g key={i}><ellipse cx={x} cy={y} rx={s2 * 1.4} ry={s2} fill="#0f0d0b" opacity={0.55} /><ellipse cx={x + ux * s2 * 0.5} cy={y + s2 * 0.6} rx={s2 * 1.1} ry={s2 * 0.4} fill="#a58a70" opacity={0.25} /></g>; })}
				{/* cracks */}
				{Array.from({length: 5}, (_, i) => { const a = R() * Math.PI * 2, l = r * (0.3 + R() * 0.35); const x = c[0] + Math.cos(a) * r * 0.5 * R(), y = c[1] + Math.sin(a) * r * 0.5 * R();
					const p2: Pt = [x + Math.cos(a + 0.5) * l * 0.5, y + Math.sin(a + 0.5) * l * 0.5], p3: Pt = [p2[0] + Math.cos(a - 0.4) * l * 0.5, p2[1] + Math.sin(a - 0.4) * l * 0.5];
					return <g key={i}><path d={`M${x},${y} L${p2[0]},${p2[1]} L${p3[0]},${p3[1]}`} stroke="#0c0a09" strokeWidth={2.6} fill="none" opacity={0.8} /><path d={`M${x + 1.5},${y + 2} L${p2[0] + 1.5},${p2[1] + 2} L${p3[0] + 1.5},${p3[1] + 2}`} stroke="#9a8068" strokeWidth={1} fill="none" opacity={0.35} /></g>; })}
				{/* rim light only on the edge that faces the light */}
				<path d={d} fill="none" stroke={rimCol} strokeWidth={r * 0.09} opacity={0.85} filter="url(#b3)" transform={`translate(${-ux * r * 0.07},${-uy * r * 0.07})`} mask={`url(#${id}m)`} />
				<mask id={`${id}m`}><rect x={c[0] - r * 2} y={c[1] - r * 2} width={r * 4} height={r * 4} fill="black" /><circle cx={c[0] + ux * r * 0.9} cy={c[1] + uy * r * 0.9} r={r * 1.05} fill="white" filter="url(#b12)" /></mask>
				{/* ambient occlusion at the base */}
				<ellipse cx={c[0]} cy={c[1] + r * 0.95} rx={r * 1.1} ry={r * 0.35} fill="#000" opacity={0.55} filter="url(#b12)" />
			</g>
		</g>
	);
};
const Pebbles: React.FC<{seed: number; n: number; x0: number; x1: number; yAt: (x: number) => number; depth: [number, number]; light?: string}> = ({seed, n, x0, x1, yAt, depth, light = '#c99a74'}) => {
	const R = rnd2(seed);
	return (
		<g>
			{Array.from({length: n}, (_, i) => { const x = x0 + R() * (x1 - x0); const d = depth[0] + R() * (depth[1] - depth[0]); const y = yAt(x) + d; const s = 1.5 + R() * 5 * (d / depth[1] + 0.3);
				return <g key={i}><ellipse cx={x} cy={y} rx={s * 1.3} ry={s * 0.8} fill="#1d1916" /><ellipse cx={x - s * 0.3} cy={y - s * 0.3} rx={s * 0.6} ry={s * 0.35} fill={light} opacity={0.35} /></g>; })}
		</g>
	);
};
const Stars: React.FC<{n: number; seed?: number; maxY?: number; t?: number}> = ({n, seed = 4, maxY = 420, t = 0}) => {
	const R = rnd2(seed);
	return <g>{Array.from({length: n}, (_, i) => { const x = R() * 1920, y = R() * maxY, s = 0.6 + R() * 1.4, tw = 0.5 + 0.5 * Math.sin(t * (1 + R() * 2) + i); return <circle key={i} cx={x} cy={y} r={s} fill="#e8eef8" opacity={(0.25 + 0.5 * R()) * (0.6 + 0.4 * tw) * (1 - y / maxY * 0.6)} />; })}</g>;
};
const Ridge: React.FC<{y: number; amp: number; seed: number; fill: string; blur?: string; op?: number}> = ({y, amp, seed, fill, blur, op = 1}) => {
	const R = rnd2(seed); let d = `M-20,${y}`; let yy = y;
	for (let x = -20; x <= 1960; x += 60) { yy = y - amp * (0.4 + 0.6 * Math.abs(Math.sin(x / 260 + seed))) - R() * amp * 0.25; d += ` L${x},${yy}`; }
	return <path d={d + ' L1960,1100 L-20,1100 Z'} fill={fill} filter={blur} opacity={op} />;
};
/** a cross bar alone in the dark (nobody holding it): strings to the puppet, lit warm on one edge */
const LoneBar: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g>
		<circle cx={x} cy={y} r={160} fill="url(#warmGlow)" opacity={0.08} />
		<CrossBar x={x} y={y} rot={rot} />
		<line x1={x} y1={y - 60} x2={x + 6} y2={-40} stroke="#d8d2c4" strokeWidth={1.1} opacity={0.35} />
	</g>
);
const flipPts = (pose: Pose, flip: boolean) => attachPts(pose).map(({p, to}) => ({p: (flip ? [-p[0], p[1]] : p) as Pt, to: flip ? -to : to}));

// ---- V2 · the hill at dusk: he pushes the boulder up to the left; the bar hangs in the dark above, nobody holding it
const V2Hill: React.FC<{t: number; header?: string; plankY?: number; beam?: number}> = ({t, header = '古希腊 · 神话', plankY, beam = 0}) => {
	const pan = -18 * t;                                                         // slow truck right → parallax
	const ys = (x: number) => 420 + 0.34 * x + 0.00011 * (x - 900) * (x - 900);
	const heave = Math.max(0, Math.sin(t * 2.0)) ** 2;
	const rx = 690 + 4 * heave, r = 200;
	const rc: Pt = [rx, ys(rx) - r * 0.9];
	const pose: Pose = {...PUSH, lean: 32 + 3 * heave, head: 14, legN: [24 + 5 * heave, -30], legF: [-32 - 4 * heave, 4]};
	const k = 1.12;
	const tip = tipOf(pose, true);
	const mx = rc[0] + r * 0.98 + tip[0] * k, my = ys(mx) + 10;
	const bar: Pt = [mx + 130 + 6 * Math.sin(t * 2.0), 220 + 4 * Math.sin(t * 2.0 + 0.6)], brot = -10 + 3 * Math.sin(t * 2.0 + 1);
	const sun: Pt = [1250, 690];
	return (
		<Frame header={header || undefined}>
			<linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1024" /><stop offset="0.38" stopColor="#1c2244" /><stop offset="0.6" stopColor="#4a3a58" /><stop offset="0.72" stopColor="#a35e4c" /><stop offset="0.8" stopColor="#e2945e" /></linearGradient>
			<rect width={W} height={H} fill="url(#hsky)" />
			<Stars n={90} t={t} maxY={380} />
			<circle cx={sun[0]} cy={sun[1]} r={520} fill="url(#warmGlow)" opacity={0.7} />
			<g transform={`translate(${pan * 0.15},0)`}>
				{[[420, 230, 1.1, 0], [1500, 190, 0.9, 1], [980, 300, 0.8, 0]].map(([x, y, s, dk], i) => (
					<g key={i} transform={`translate(${x + t * 4},${y}) scale(${s})`} filter="url(#b3)">
						{[[-110, 0, 90], [-20, -30, 110], [90, -6, 84], [10, 22, 120]].map(([dx, dy, rr], j) => <ellipse key={j} cx={dx} cy={dy} rx={rr} ry={rr * 0.5} fill={dk ? '#1d2038' : '#242844'} filter="url(#felt)" />)}
						<ellipse cx={20} cy={46} rx={200} ry={16} fill="#e2945e" opacity={0.28} />
					</g>
				))}
			</g>
			<g transform={`translate(${pan * 0.25},0)`}><Ridge y={760} amp={150} seed={2} fill="#3a2f45" blur="url(#b3)" op={0.85} /></g>
			<g transform={`translate(${pan * 0.4},0)`}><Ridge y={800} amp={110} seed={5} fill="#2a2333" blur="url(#b1.5)" /></g>
			<rect y={700} width={W} height={160} fill="#e2945e" opacity={0.12} filter="url(#b12)" />
			{/* god rays from the low sun */}
			{[-0.5, -0.2, 0.15, 0.45].map((a, i) => <polygon key={i} points={`${sun[0]},${sun[1]} ${sun[0] - 1400 * Math.cos(a + 0.05)},${sun[1] - 900 * Math.sin(Math.abs(a) + 0.3)} ${sun[0] - 1400 * Math.cos(a - 0.05)},${sun[1] - 900 * Math.sin(Math.abs(a) + 0.25)}`} fill="#ffd2a0" opacity={0.035} filter="url(#b12)" />)}
			<g transform={`translate(${pan * 0.7},0)`}>
				{/* the hill: clay, its crest lit by the sun behind */}
				<path d={`M-80,${ys(-80)} ${Array.from({length: 26}, (_, i) => { const x = -80 + i * 90; return `L${x},${ys(x) - 6 * Math.sin(i * 1.9)}`; }).join(' ')} L2200,1100 L-80,1100 Z`} fill="#2e2722" />
				<path d={`M-80,${ys(-80)} ${Array.from({length: 26}, (_, i) => { const x = -80 + i * 90; return `L${x},${ys(x) - 6 * Math.sin(i * 1.9)}`; }).join(' ')} L2200,1100 L-80,1100 Z`} fill="#4a3d33" filter="url(#clay)" opacity={0.6} />
				<path d={`M-80,${ys(-80)} ${Array.from({length: 26}, (_, i) => { const x = -80 + i * 90; return `L${x},${ys(x) - 6 * Math.sin(i * 1.9)}`; }).join(' ')}`} stroke="#ffb27a" strokeWidth={4} fill="none" opacity={0.6} filter="url(#b1.5)" />
				<Pebbles seed={8} n={140} x0={-80} x1={2100} yAt={ys} depth={[14, 260]} />
				{Array.from({length: 18}, (_, i) => { const x = 40 + i * 118 + (i % 3) * 30, y = ys(x) - 4; return <path key={i} d={`M${x},${y} l-6,-26 l7,10 l3,-30 l5,27 l8,-20 l-3,39 Z`} fill="#2d3424" opacity={0.9} />; })}
				<BigRock c={rc} r={r} sun={sun} ground={ys(rc[0])} />
				{beam > 0 && <g>
					{/* a shaft of light from above: everything else sinks back, the puppet stands in it */}
					<rect x={-400} y={-200} width={W + 800} height={H + 400} fill="#05060c" opacity={0.5 * beam} />
					<linearGradient id="beamG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6dc" stopOpacity="0" /><stop offset="0.35" stopColor="#fff2d0" stopOpacity="0.35" /><stop offset="1" stopColor="#ffe9bf" stopOpacity="0.7" /></linearGradient>
					<polygon points={`${mx - 300},-120 ${mx - 160},-120 ${mx + 190},${my + 30} ${mx - 170},${my + 30}`} fill="url(#beamG)" opacity={beam} filter="url(#b12)" />
					<polygon points={`${mx - 255},-120 ${mx - 205},-120 ${mx + 70},${my + 20} ${mx - 60},${my + 20}`} fill="url(#beamG)" opacity={0.8 * beam} filter="url(#b6)" />
					<ellipse cx={mx + 10} cy={my + 8} rx={230} ry={36} fill="#fff1cc" opacity={0.55 * beam} filter="url(#b6)" />
					<ellipse cx={mx} cy={my - 250} rx={170} ry={300} fill="url(#warmGlow)" opacity={0.75 * beam} />
					{Array.from({length: 46}, (_, q) => { const R = rnd2(q + 77); const v = R(); const y = -100 + ((R() * (my + 100) + t * 18 * (0.3 + R())) % (my + 100)); const x = mx - 255 + (y + 120) / (my + 140) * 120 + (R() - 0.5) * (60 + 260 * (y + 120) / (my + 140)); return <circle key={q} cx={x} cy={y} r={0.8 + v * 1.8} fill="#fff6e0" opacity={(0.25 + 0.5 * R()) * beam} />; })}
				</g>}
				<Man x={mx} y={my} k={k} pose={pose} flip />
				{beam > 0 && <g style={{mixBlendMode: 'screen', filter: 'brightness(2.4)'}} opacity={0.5 * beam}><g transform={`translate(${mx},${my}) scale(${-k},${k})`} filter="url(#b1.5)"><Mannequin pose={pose} /></g></g>}
				{flipPts(pose, true).map(({p, to}, i) => { const a = W2(mx, my, k, p); const slot: Pt = [to < 0 ? -124 + 40 * (Math.abs(to) - 1) : 124 - 40 * (Math.abs(to) - 1), Math.abs(to) === 1 ? 150 : 0]; return <g key={i}><RealString a={a} b={barPt(bar[0], bar[1], brot, slot)} id={`vh${i}`} band={[0.15, 0.6]} w={i === 4 || i === 6 ? 1.15 : 0.9} /><Eyelet p={a} k={k * 0.9} /></g>; })}
				<LoneBar x={bar[0]} y={bar[1]} rot={brot} />
				{/* dust kicked up and floating in the backlight */}
				{Array.from({length: 40}, (_, i) => { const R = rnd2(i + 3); const x = mx - 300 + R() * 600 + 10 * Math.sin(t + i), y = my - 40 - R() * 300 - (t * 6 * R()) % 60; return <circle key={i} cx={x} cy={y} r={0.8 + R() * 1.6} fill="#ffd9b0" opacity={0.25 + 0.3 * R()} />; })}
			</g>
			{plankY !== undefined && plankY > -300 && <Plank x={560} y={plankY - 90} />}
			{/* out-of-focus foreground: a dirt bank bottom-left, a stone bottom-right */}
			<g transform={`translate(${pan * 1.25},0)`} filter="url(#b12)">
				<path d="M-60,1100 L-60,880 C120,840 300,900 420,1100 Z" fill="#1a1512" />
				<ellipse cx={1720} cy={1080} rx={210} ry={90} fill="#161210" />
			</g>
		</Frame>
	);
};

// ---- V2 · the lab: a workbench in perspective; kept figures line up; the new one is lifted away by strings and falls apart in the air
const V2Lab: React.FC<{t: number}> = ({t}) => {
	const VPx = 1180, VPy = 470;
	const along = (p: Pt, d: number): Pt => [p[0] + (VPx - p[0]) * d, p[1] + (VPy - p[1]) * d];
	const lift = (t % 3.2) / 3.2;
	const pose: Pose = {head: 30 - 18 * Math.min(1, lift * 2), lean: 10, armN: [8, 10], armF: [4, 12]};
	const mx = 500, my = 1030, k = 1.25;
	return (
		<Frame header="2008 · 美国" bg="#0a0a0c">
			<rect width={W} height={H} fill="#121215" />
			{/* back wall: shelves of boxes and jars, out of focus */}
			<g filter="url(#b6)" opacity={0.85}>
				{[300, 470].map((y) => <rect key={y} x={700} y={y} width={1300} height={10} fill="#2a2018" />)}
				{Array.from({length: 18}, (_, i) => { const R = rnd2(i + 20); const x = 720 + i * 70, y = i % 2 ? 470 : 300, h = 40 + R() * 70; return <rect key={i} x={x} y={y - h} width={30 + R() * 30} height={h} rx={4} fill={['#2e3a44', '#3a2c22', '#2c3328', '#44332a'][i % 4]} />; })}
				{Array.from({length: 7}, (_, i) => <circle key={i} cx={760 + i * 180} cy={280} r={6} fill="#ffcf8a" opacity={0.35} />)}
			</g>
			{/* chalkboard on the wall, right */}
			<g transform="translate(1440,120) skewY(-3)" filter="url(#b1.5)">
				<rect x={-12} y={-12} width={434} height={254} fill="#2a1d14" />
				<rect width={410} height={230} fill="#1b211e" filter="url(#paper)" />
				<text x={30} y={80} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 36}} fill="#e8e4da" opacity={0.8}>摆着</text>
				<text x={30} y={170} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 36}} fill="#e8e4da" opacity={0.8}>被拆</text>
				<text x={380} y={82} textAnchor="end" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 52}} fill="#f1d7a0">10.6</text>
				<text x={380} y={172} textAnchor="end" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 52}} fill="#ff8a70">7.2</text>
			</g>
			{/* the bench: top surface receding to the vanishing point */}
			<path d={`M-40,760 L${VPx},${VPy + 120} L${VPx + 120},${VPy + 124} L1960,820 L1960,1100 L-40,1100 Z`} fill="#20160f" />
			<path d={`M-40,760 L${VPx},${VPy + 120} L${VPx + 120},${VPy + 124} L1960,820 L1960,880 L-40,820 Z`} fill="url(#m-walnut)" filter="url(#wood)" />
			<path d="M-40,820 L1960,880 L1960,1100 L-40,1100 Z" fill="#0d0907" />
			{/* lamp pool */}
			<g transform="translate(980,180)">
				<path d="M-70,0 L70,0 L40,-40 L-40,-40 Z" fill="#1c1a18" /><line x1={0} y1={-40} x2={0} y2={-300} stroke="#1c1a18" strokeWidth={6} />
				<ellipse cx={0} cy={2} rx={66} ry={8} fill="#ffd590" />
				<polygon points="-66,2 66,2 420,640 -420,640" fill="#ffd9a0" opacity={0.07} filter="url(#b12)" />
				<ellipse cx={0} cy={600} rx={560} ry={130} fill="url(#warmGlow)" opacity={0.55} />
			</g>
			{/* kept figures lined up along the bench, smaller with distance */}
			{Array.from({length: 7}, (_, i) => { const p = along([880, 800], 0.08 + i * 0.1); const s = 1.3 * (1 - (0.08 + i * 0.1) * 0.75); return <g key={i} opacity={1 - i * 0.06}><Bot x={p[0]} y={p[1]} c={BOTC[i % 5]} s={s} /></g>; })}
			{/* the one just finished: strings come down, lift it, it comes apart in the air */}
			{(() => {
				const bx = 1240, by0 = 860, up = Math.min(1, lift * 1.6), apart = Math.max(0, lift * 1.6 - 0.55) / 0.45;
				const by = by0 - 380 * up * up;
				const parts: [number, number, number, number, number][] = [[-14, -26, 10, 26, -30], [4, -26, 10, 26, 25], [-20, -70, 40, 46, -8], [-28, -66, 8, 30, -60], [20, -66, 8, 30, 55], [-12, -94, 24, 22, 12]];
				return (
					<g>
						{[-30, 30].map((dx) => <line key={dx} x1={bx + dx * 0.6} y1={by - 100} x2={bx + dx * 0.6 + 8} y2={-20} stroke="#e8e2d6" strokeWidth={1.1} opacity={0.55} />)}
						{parts.map(([x, y, w, h, dir], i) => (
							<rect key={i} x={bx + x * 1.3 + dir * 1.6 * apart} y={by + y * 1.3 - 30 * apart * (i % 3) + 140 * apart * apart} width={w * 1.3} height={h * 1.3} rx={3} fill={BOTC[0]} transform={`rotate(${dir * apart}, ${bx + x * 1.3}, ${by + y * 1.3})`} opacity={1 - Math.max(0, apart - 0.8) * 5} />
						))}
					</g>
				);
			})()}
			{/* him, close, at the left edge of the bench, looking at the empty spot */}
			<Man x={mx} y={my} k={k} pose={pose} flip />
			{flipPts(pose, true).map(({p, to}, i) => { const a = W2(mx, my, k, p); return <g key={i}><RealString a={a} b={[mx - 20 + to * 50, -320]} id={`vl${i}`} w={0.9} /><Eyelet p={a} k={k * 0.9} /></g>; })}
			{Array.from({length: 30}, (_, i) => { const R = rnd2(i + 50); return <circle key={i} cx={760 + R() * 480} cy={240 + R() * 520 - (t * 8 * R()) % 50} r={0.8 + R() * 1.5} fill="#ffe3b8" opacity={0.2 + 0.3 * R()} />; })}
			<path d="M-40,1100 L-40,940 L380,1100 Z" fill="#070605" filter="url(#b12)" />
		</Frame>
	);
};

// ---- V2 · 2010: a room at night; he sits in profile, the phone lights him cold; thoughts drift off toward the window
const V2Phone: React.FC<{t: number}> = ({t}) => {
	const pose: Pose = {head: 18, lean: 8, armN: [70, 30], armF: [64, 34], legN: [86, -86], legF: [82, -82]};
	const k = 1.3, fx = 760, floorY = 1080, fy = floorY + 103 * k - 40;
	const ht = W2(fx, fy, k, headTop(pose));
	const drift = (t % 6) / 6;
	return (
		<Frame header="2010 · 哈佛" bg="#07090c">
			<rect width={W} height={H} fill="#0e1116" />
			{/* window: the city out of focus */}
			<g transform="translate(1180,90)">
				<rect width={620} height={560} fill="#0a1120" />
				<g filter="url(#b6)">
					{Array.from({length: 60}, (_, i) => { const R = rnd2(i + 70); return <circle key={i} cx={R() * 620} cy={240 + R() * 320} r={4 + R() * 14} fill={R() > 0.7 ? '#ffcf8a' : '#8fb2e6'} opacity={0.25 + R() * 0.4} />; })}
					<path d="M0,420 L80,380 L150,400 L230,330 L330,370 L420,320 L520,360 L620,340 L620,560 L0,560 Z" fill="#05070c" />
				</g>
				<rect x={302} width={16} height={560} fill="#151a22" /><rect y={272} width={620} height={16} fill="#151a22" />
				<rect x={-20} y={-20} width={660} height={600} fill="none" stroke="#1a1f27" strokeWidth={24} />
			</g>
			{/* wall clock (the 46.9 % will fill here) */}
			<g transform="translate(470,250)" filter="url(#b1.5)" opacity={0.7}>
				<circle r={110} fill="#d9d1c0" opacity={0.85} filter="url(#paper)" /><circle r={110} fill="none" stroke="#2a2420" strokeWidth={8} />
				<path d={`M0,0 L0,-110 A110,110 0 0 1 ${110 * Math.sin(2 * Math.PI * 0.469)},${-110 * Math.cos(2 * Math.PI * 0.469)} Z`} fill="#8a3a2e" opacity={0.7} />
			</g>
			{/* desk in perspective */}
			<path d="M520,700 L1920,640 L1920,700 L560,760 Z" fill="url(#m-walnut)" filter="url(#wood)" />
			<path d="M560,760 L1920,700 L1920,1100 L560,1100 Z" fill="#0b0806" />
			{/* the phone: cold light on him and the desk */}
			<g transform="translate(1060,708) rotate(-3)">
				<ellipse cx={-120} cy={-120} rx={420} ry={300} fill="url(#coldGlow)" opacity={0.85} />
				<rect x={-46} y={-8} width={92} height={14} rx={5} fill="#0c0d10" /><rect x={-42} y={-7} width={84} height={10} rx={3} fill="#bcd2f0" />
				{Math.floor(t * 6) % 3 !== 0 && [0, 1, 2].map((i) => <g key={i} opacity={0.6}><path d={`M${-62 - i * 16},${-16 - i * 9} q-8,10 0,20`} stroke="#cfdcf0" strokeWidth={2} fill="none" /><path d={`M${62 + i * 16},${-16 - i * 9} q8,10 0,20`} stroke="#cfdcf0" strokeWidth={2} fill="none" /></g>)}
			</g>
			{/* chair */}
			<rect x={fx - 110} y={floorY - 250 - 6} width={210} height={22} fill="#120c08" />
			<rect x={fx - 110} y={floorY - 600} width={22} height={600} fill="#120c08" />
			<Man x={fx} y={fy} k={k} pose={pose} warm={false} />
			{flipPts(pose, false).map(({p, to}, i) => { const a = W2(fx, fy, k, p); return <g key={i}><RealString a={a} b={[fx + 30 + to * 50, -320]} id={`vp${i}`} w={0.9} /><Eyelet p={a} k={k * 0.9} /></g>; })}
			{/* thoughts leaving: felt clouds drifting up toward the window */}
			{[0, 1, 2].map((i) => {
				const u = (drift + i / 3) % 1;
				const x = ht[0] + 60 + u * 520, y = ht[1] - 40 - u * 260, s = 0.3 + u * 0.9;
				return (
					<g key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={Math.sin(Math.PI * u) * 0.9}>
						{[[-60, 0, 60], [0, -26, 74], [60, -2, 56], [0, 18, 80]].map(([dx, dy, rr], j) => <ellipse key={j} cx={dx} cy={dy} rx={rr} ry={rr * 0.6} fill="#323846" filter="url(#felt)" />)}
						<path d="M-60,16 L-24,-18 L6,8 L38,-26 L72,16 Z" fill="#59606f" opacity={0.85} />
					</g>
				);
			})}
			<rect width={W} height={H} fill="#000" opacity={0.0} />
		</Frame>
	);
};

// ---- V2 · dawn: the foot of the hill, mist in the valleys, long shadows toward us, no strings
const V2Dawn: React.FC<{t: number}> = ({t}) => {
	const pan = -12 * t;
	const ground = 830;
	const r = 230, c: Pt = [640, ground - r * 0.86];
	const k = 1.3;
	const pose: Pose = {head: -20 + 2 * Math.sin(t * 0.8), lean: -22, armN: [18, 6], armF: [14, 8], legN: [86, 4], legF: [80, 10]};
	const mx = c[0] + r * 0.98 + 40, my = ground + 228 * k - 6;
	const sun: Pt = [1260, 520];
	return (
		<Frame>
			<linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4a66" /><stop offset="0.35" stopColor="#8a8a96" /><stop offset="0.55" stopColor="#e8c08a" /><stop offset="0.7" stopColor="#f4d6a2" /></linearGradient>
			<rect width={W} height={H} fill="url(#dsky)" />
			<circle cx={sun[0]} cy={sun[1]} r={620} fill="url(#warmGlow)" opacity={0.95} />
			<circle cx={sun[0]} cy={sun[1] + 40 - 30 * Math.min(1, t / 6)} r={150} fill="#fff4d8" opacity={0.95} filter="url(#b6)" />
			<g transform={`translate(${pan * 0.2},0)`}><Ridge y={640} amp={260} seed={7} fill="#8f7f78" blur="url(#b3)" op={0.7} /></g>
			<rect y={540} width={W} height={160} fill="#f2e6d2" opacity={0.45} filter="url(#b12)" />
			<g transform={`translate(${pan * 0.35},0)`}><Ridge y={700} amp={140} seed={9} fill="#6a5a55" blur="url(#b1.5)" op={0.85} /></g>
			<rect y={640} width={W} height={140} fill="#f2e6d2" opacity={0.5} filter="url(#b12)" />
			<g transform={`translate(${pan * 0.7},0)`}>
				<path d={`M-80,${ground - 30} C400,${ground - 50} 1200,${ground - 40} 2100,${ground - 20} L2100,1100 L-80,1100 Z`} fill="#4b3a2c" />
				<path d={`M-80,${ground - 30} C400,${ground - 50} 1200,${ground - 40} 2100,${ground - 20} L2100,1100 L-80,1100 Z`} fill="#7a5e44" filter="url(#clay)" opacity={0.55} />
				<Pebbles seed={13} n={160} x0={-80} x1={2100} yAt={() => ground - 30} depth={[10, 260]} light="#ffe2b0" />
				<path d={`M${c[0] - r * 0.8},${ground} L${c[0] - r * 1.6},1100 L${c[0] + r * 0.9},1100 L${c[0] + r * 0.7},${ground} Z`} fill="#1a120c" opacity={0.5} filter="url(#b3)" />
				<path d={`M${mx - 60},${ground} L${mx - 200},1100 L${mx + 60},1100 L${mx + 70},${ground} Z`} fill="#1a120c" opacity={0.45} filter="url(#b3)" />
				<BigRock c={c} r={r} sun={sun} seed={5} rimCol="#ffe0a8" ground={ground} />
				<Man x={mx} y={my} k={k} pose={pose} />
				{Array.from({length: 36}, (_, i) => { const R = rnd2(i + 90); const x = R() * 1920, y = ground + 20 + R() * 240; return <circle key={i} cx={x} cy={y} r={1 + R() * 1.6} fill="#fff6e0" opacity={(0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))) * R()} />; })}
			</g>
			<g transform={`translate(${pan * 1.25},0)`} filter="url(#b12)"><path d="M1500,1100 C1600,980 1800,960 1980,1000 L1980,1100 Z" fill="#2a1d14" /></g>
		</Frame>
	);
};
const Style2: React.FC = () => {
	useFonts();
	const t = useCurrentFrame() / FPS;
	const i = Math.min(3, Math.floor(t / 3)), u = t - i * 3;
	return [<V2Hill t={u} />, <V2Lab t={u} />, <V2Phone t={u} />, <V2Dawn t={u} />][i];
};

// ================================================================== cold open v3 (owner's reference: the rapid question montage on a puppet stage)
/** the title sign hanging on two strings (shared by the hill shots) */
const Plank: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y}) rotate(-2) scale(0.9)`}>
		<RealString a={[-380, -60]} b={[-350, -1500]} id="pk1" band={[0.05, 0.25]} w={1.3} />
		<RealString a={[380, -60]} b={[350, -1500]} id="pk2" band={[0.05, 0.25]} w={1.3} />
		<rect x={-430} y={-70} width={860} height={150} rx={10} fill="#000" opacity={0.5} filter="url(#b6)" transform="translate(10,16)" />
		<rect x={-430} y={-70} width={860} height={150} rx={10} fill="url(#m-walnut)" filter="url(#wood)" />
		<rect x={-414} y={-56} width={828} height={122} rx={6} fill="none" stroke="#1a110a" strokeWidth={3} opacity={0.7} />
		{[[-404, -46], [404, -46], [-404, 56], [404, 56]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={6} fill="url(#mb-brass)" />)}
		<text y={38} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84, letterSpacing: '0.08em'}} fill="#120b06" opacity={0.8}>推石头的人，是幸福的</text>
		<text y={36} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84, letterSpacing: '0.08em'}} fill="#e9d9bd">推石头的人，是幸福的</text>
	</g>
);
type Act = 'walk' | 'hunch' | 'house' | 'run' | 'freeze';
const actPose = (act: Act, t: number, i: number): Pose => {
	const ph = t * (act === 'run' ? 11 : 6.5) + i * 1.7;
	switch (act) {
		case 'walk': return {...walkPose(ph, 14, 4), case: true};
		case 'run': { const p = walkPose(ph, 4, 16); return {...p, legN: [p.legN![0] * 1.6, p.legN![1] * 1.8], legF: [p.legF![0] * 1.6, p.legF![1] * 1.8], armN: [p.armN![0] * 2.4, 70], armF: [p.armF![0] * 2.4, 70]}; }
		case 'hunch': return {lean: 34 + 2 * Math.sin(t * 3 + i), head: 40, armN: [26, 24], armF: [22, 28], legN: [6, 0], legF: [-4, 0]};
		case 'house': { const p = walkPose(ph * 0.6, 24, 30); return {...p, armN: [20, 30], armF: [16, 34]}; }
		case 'freeze': return {lean: 2, head: 20 - 34 * sm(t / 0.9), armN: [-3, 5], armF: [4, 6], legN: [3, 0], legF: [-3, 0]};
	}
};
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
/** the house a puppet carries on its back (房贷) */
const HouseOn: React.FC<{x: number; y: number; k: number; lean: number}> = ({x, y, k, lean}) => {
	const back = W2(x, y, k, rotP([-26, -300], lean, [0, -232]));
	return (
		<g transform={`translate(${back[0]},${back[1]}) rotate(${lean * 0.35}) scale(${k * 1.25})`}>
			<path d="M-80,40 L-80,-90 L0,-165 L80,-90 L80,40 Z" fill="#4a4844" stroke="#e6e2da" strokeWidth={3.5} strokeLinejoin="round" />
			<rect x={-20} y={-20} width={40} height={60} fill="#1b1a19" />
			<rect x={-62} y={-70} width={30} height={26} fill="#f0e8d6" opacity={0.6} /><rect x={32} y={-70} width={30} height={26} fill="#f0e8d6" opacity={0.6} />
			<rect x={40} y={-150} width={16} height={40} fill="#4a4844" stroke="#e6e2da" strokeWidth={2.5} />
		</g>
	);
};
/** a grey theatre: curtains, a forest of hanging strings, a pool of light; rows of puppets doing the same thing */
const Theatre: React.FC<{act: Act; t: number}> = ({act, t}) => {
	const rows: {y: number; k: number; xs: number[]; blur?: string; o: number}[] = [
		{y: 640, k: 0.3, xs: [180, 380, 580, 780, 980, 1180, 1380, 1580, 1780], blur: 'url(#b1.5)', o: 0.55},
		{y: 760, k: 0.52, xs: [300, 640, 980, 1320, 1660], o: 0.85},
		{y: 1060, k: 0.98, xs: [-40, 560, 1340, 1960], blur: undefined, o: 1},
	];
	const drift = act === 'run' ? t * 60 : act === 'walk' || act === 'house' ? t * 26 : 0;
	return (
		<AbsoluteFill style={{background: '#0d0d0f'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<linearGradient id="curt" x1="0" y1="0" x2="1" y2="0" spreadMethod="repeat" gradientTransform="scale(0.035,1)">
					<stop offset="0" stopColor="#34343a" /><stop offset="0.5" stopColor="#56565e" /><stop offset="1" stopColor="#34343a" />
				</linearGradient>
				<rect width={W} height={700} fill="url(#curt)" />
				<rect width={W} height={700} fill="#000" opacity={0.2} />
				{/* the forest of strings */}
				{Array.from({length: 120}, (_, i) => { const x = hashN(i) * W, sw = 6 * Math.sin(t * 1.3 + i); return <line key={i} x1={x} y1={0} x2={x + sw} y2={600 + hashN(i + 50) * 200} stroke="#d8d8dc" strokeWidth={0.6 + hashN(i + 9) * 0.8} opacity={0.08 + hashN(i + 3) * 0.12} />; })}
				{/* floor and the light pool */}
				<rect y={620} width={W} height={460} fill="#141416" />
				<ellipse cx={960} cy={880} rx={1000} ry={270} fill="#6a6a72" opacity={0.85} filter="url(#b12)" />
				<polygon points="760,-20 1160,-20 1500,900 420,900" fill="#e8e8ee" opacity={0.1} filter="url(#b12)" />
				{rows.map((r, ri) => (
					<g key={ri} filter={r.blur} opacity={r.o}>
						{r.xs.map((x0, i) => {
							const x = ((x0 + drift * r.k * 1.5 + 2200) % 2200) - 140;
							const pose = actPose(act, t, i + ri * 3);
							const lean = pose.lean ?? 0;
							return (
								<g key={i}>
									<ellipse cx={x + 6} cy={r.y + 4} rx={90 * r.k} ry={12 * r.k} fill="#000" opacity={0.5} filter="url(#b3)" />
									<g filter="url(#rimC)"><g transform={`translate(${x},${r.y}) scale(${r.k})`}><Mannequin pose={pose} /></g></g>
									{act === 'house' && <HouseOn x={x} y={r.y} k={r.k} lean={lean} />}
									{act === 'hunch' && <g><polygon points={`${x + 40 * r.k},${r.y - 600 * r.k} ${x + 60 * r.k},${r.y - 600 * r.k} ${x + 220 * r.k},${r.y} ${x - 120 * r.k},${r.y}`} fill="#f2ead8" opacity={0.07} /><ellipse cx={x + 50 * r.k} cy={r.y - 600 * r.k} rx={30 * r.k} ry={8 * r.k} fill="#f2ead8" opacity={0.7} /></g>}
									{attachPts(pose).map(({p, to}, si) => { const a = W2(x, r.y, r.k, p); return <line key={si} x1={a[0]} y1={a[1]} x2={x + to * 30 * r.k} y2={-10} stroke="#e8e8ee" strokeWidth={ri === 2 ? 1.1 : 0.7} opacity={ri === 2 ? 0.5 : 0.35} />; })}
								</g>
							);
						})}
					</g>
				))}
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)'}} />
		</AbsoluteFill>
	);
};
const hashN = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BigQ: React.FC<{t: string; o?: number; size?: number}> = ({t, o = 1, size = 66}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: o, fontFamily: SERIF, fontWeight: 900, fontSize: size, color: '#f4f1ea', letterSpacing: '0.08em', textShadow: '0 4px 24px rgba(0,0,0,0.85)'}}>{t}</div>
);
// the cold open timeline (film seconds; beats every 0.65 s, downbeats 0 / 2.6 / 5.2 / 7.8 / 10.4 / 12.98)
const CUTS: {a: number; b: number; q: string; act: Act | 'plat'}[] = [
	{a: 0, b: 1.3, q: '为什么挤地铁？', act: 'plat'},
	{a: 1.3, b: 1.95, q: '为什么上班？', act: 'walk'},
	{a: 1.95, b: 2.6, q: '为什么加班？', act: 'hunch'},
	{a: 2.6, b: 3.25, q: '为什么还房贷？', act: 'house'},
	{a: 3.25, b: 3.9, q: '为什么拼命？', act: 'run'},
	{a: 3.9, b: 4.55, q: '拼命之后呢？', act: 'walk'},
	{a: 4.55, b: 5.18, q: '再之后呢？', act: 'run'},
	{a: 5.18, b: 6.5, q: '然后呢？', act: 'freeze'},
];
const ColdOpen: React.FC<{T: number}> = ({T}) => {
	const t = Math.floor(T * 12) / 12;
	// 6.5 → 7.78: rewind — the cuts flash back in reverse, ending on the platform at 07:30
	if (T >= 6.5 && T < 7.78) {
		const u = (T - 6.5) / 1.28;
		const seq = [...CUTS.slice(0, 7)].reverse();
		const k = Math.min(seq.length - 1, Math.floor(u * seq.length));
		const c = seq[k];
		const back = 3 - u * 3;
		return (
			<AbsoluteFill style={{filter: 'grayscale(0.9) contrast(1.1)'}}>
				{c.act === 'plat' ? <S1b t={back} spin={-6 * u} sub="" /> : <Theatre act={c.act as Act} t={back} />}
				<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px)', mixBlendMode: 'screen'}} />
				<div style={{position: 'absolute', left: 64, top: 64, fontFamily: '"Cormorant", serif', fontSize: 44, color: '#f4f1ea', opacity: Math.floor(T * 4) % 2 ? 0.9 : 0.4}}>◀◀</div>
				<BigQ t="第二天，再来一遍" />
			</AbsoluteFill>
		);
	}
	const c = CUTS.find((x) => T >= x.a && T < x.b) ?? CUTS[CUTS.length - 1];
	const local = t - c.a;
	return (
		<AbsoluteFill style={{filter: 'grayscale(0.9) contrast(1.08)'}}>
			{c.act === 'plat' ? <S1b t={t} crowd sub="" /> : <Theatre act={c.act} t={local} />}
			<BigQ t={c.q} size={c.q === '然后呢？' ? 92 : 66} o={Math.min(1, (T - c.a) / 0.08)} />
		</AbsoluteFill>
	);
};
/** 7.78 → end: one of them, alone on the hill, pushing; the title sign drops on the downbeat at 12.978 */
const OPEN_DROP = 12.978;
const Open35: React.FC = () => {
	useFonts();
	const T = useCurrentFrame() / FPS;
	const t = Math.floor(T * 12) / 12;
	const hillIn = Math.max(0, Math.min(1, (T - 7.78) / 0.5));
	const fall = Math.max(0, Math.min(1, (t - (OPEN_DROP - 0.6)) / 0.6)), v = t - OPEN_DROP;
	const plankY = t < OPEN_DROP - 0.6 ? -320 : t < OPEN_DROP ? -320 + 600 * fall * fall : 280 - 26 * Math.exp(-5 * v) * Math.cos(16 * v);
	const line = T >= 8.0 && T < 10.3 ? '有个人，这样过了永远' : T >= 10.45 && T < 12.5 ? '可有位哲学家说：他是幸福的' : '';
	const lo = line ? Math.min(1, Math.min(T - (T < 10.3 ? 8.0 : 10.45), (T < 10.3 ? 10.3 : 12.5) - T) / 0.2) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{T < 8.3 && <AbsoluteFill style={{opacity: 1 - hillIn}}><ColdOpen T={T} /></AbsoluteFill>}
			{T >= 7.78 && (
				<AbsoluteFill style={{opacity: hillIn}}>
					<V2Hill t={t - 7.78} header="" plankY={plankY} />
				</AbsoluteFill>
			)}
			{line && <AbsoluteFill style={{opacity: lo}}><Sub t={line} /></AbsoluteFill>}
		</AbsoluteFill>
	);
};

// ================================================================== cold open v4 · "the commuter turntable" (our own idea, dark but in colour)
// BGM: the slowed classic (ep31/32). Beats: b(k) = 0.416 + 0.50625·k; the drum enters at 16.616 (= b(32)) → the title.
const bt = (k: number) => 0.416 + 0.50625 * k;
const T_DRUM = 16.616;
type StationId = 'metro' | 'cross' | 'desk' | 'home' | 'run' | 'night';
const STATIONS: {id: StationId; q: string}[] = [
	{id: 'metro', q: '为什么挤地铁？'}, {id: 'cross', q: '为什么上班？'}, {id: 'desk', q: '为什么加班？'},
	{id: 'home', q: '为什么还房贷？'}, {id: 'run', q: '为什么拼命？'}, {id: 'night', q: '为什么熬夜？'},
];
/** a small lit sign on a post */
const Sign: React.FC<{x: number; y: number; q: string; k: number; lit: number}> = ({x, y, q, k, lit}) => (
	<g transform={`translate(${x},${y}) scale(${k})`}>
		<rect x={-4} y={0} width={8} height={170} fill="#1a120c" />
		<rect x={-178} y={-78} width={356} height={82} rx={8} fill="#000" opacity={0.5} filter="url(#b6)" transform="translate(6,10)" />
		<rect x={-178} y={-78} width={356} height={82} rx={8} fill="url(#m-walnut)" />
		<rect x={-170} y={-70} width={340} height={66} rx={5} fill="none" stroke="#120a05" strokeWidth={2} opacity={0.7} />
		<ellipse cx={0} cy={-38} rx={220} ry={70} fill="url(#warmGlow)" opacity={0.35 * lit} />
		<text y={-22} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 44, letterSpacing: '0.06em'}} fill="#f3e6c8" opacity={0.55 + 0.45 * lit}>{q}</text>
	</g>
);
/** one station vignette (local: base at y=0, x centred), with its own practical light */
const Station: React.FC<{id: StationId; t: number; lit: number; i: number; swing?: number; stop?: number}> = ({id, t, lit, i, swing = 0, stop = -1}) => {
	const P = (pose0: Pose, x = 0, k = 0.78, flip = false, pose = {...pose0, lean: (pose0.lean ?? 0) + swing}) => (
		<g>
			<ellipse cx={x + 6} cy={4} rx={80 * k} ry={10 * k} fill="#000" opacity={0.55} filter="url(#b3)" />
			<g filter="url(#rimC)"><g transform={`translate(${x},0) scale(${flip ? -k : k},${k})`} filter="url(#rimR)"><Mannequin pose={pose} /></g></g>
			{attachPts(pose).map(({p, to}, si) => { const a = W2(x, 0, k, [flip ? -p[0] : p[0], p[1]]); return <line key={si} x1={a[0]} y1={a[1]} x2={x + to * 26} y2={-1400} stroke="#e8e2d6" strokeWidth={0.9} opacity={0.4} />; })}
		</g>
	);
	switch (id) {
		case 'metro': return (
			<g>
				<ellipse cx={0} cy={-6} rx={300} ry={60} fill="url(#coldGlow)" opacity={0.6 * lit} />
				<g transform="translate(70,-10) scale(0.7)"><Train /></g>
				{P(withBreath({lean: 6, head: 22, armN: [-3, 4], armF: [5, 8], legN: [2, 0], legF: [-3, 0], case: true}, t, i), -70)}
			</g>
		);
		case 'cross': {
			const ph = t * 6.5 + i;
			return (
				<g>
					{Array.from({length: 6}, (_, k) => <rect key={k} x={-250 + k * 84} y={-14} width={50} height={14} fill="#d8d2c4" opacity={0.55} transform="skewX(-30)" />)}
					<g transform="translate(190,0)">
						<rect x={-5} y={-300} width={10} height={300} fill="#22252b" />
						<rect x={-26} y={-330} width={52} height={70} rx={6} fill="#14161a" />
						<circle cx={0} cy={-308} r={14} fill="#ff4a3d" opacity={0.95 * lit} /><circle cx={0} cy={-308} r={60} fill="#ff4a3d" opacity={0.18 * lit} filter="url(#b6)" />
					</g>
					<ellipse cx={60} cy={-6} rx={260} ry={50} fill="#ff4a3d" opacity={0.12 * lit} filter="url(#b6)" />
					{P({...walkPose(ph, 16, 6), case: true}, -40)}
				</g>
			);
		}
		case 'desk': return (
			<g>
				<ellipse cx={20} cy={-180} rx={260} ry={200} fill="url(#warmGlow)" opacity={0.6 * lit} />
				<rect x={-60} y={-150} width={300} height={14} fill="#5a3e2a" filter="url(#wood)" />
				{[-50, 226].map((x) => <rect key={x} x={x} y={-136} width={10} height={136} fill="#2a1d14" />)}
				<rect x={30} y={-250} width={130} height={86} rx={6} fill="#1a1d22" /><rect x={38} y={-242} width={114} height={70} fill="#7fa2d6" opacity={0.85 * lit} />
				<ellipse cx={95} cy={-210} rx={150} ry={90} fill="url(#coldGlow)" opacity={0.5 * lit} />
				<g transform="translate(200,-150)"><line x1={0} y1={0} x2={-16} y2={-80} stroke="#3b3a36" strokeWidth={5} /><path d="M-44,-76 Q-16,-108 14,-80 Z" fill="#2e4a3c" /><ellipse cx={-14} cy={-78} rx={22} ry={5} fill="#ffd590" opacity={lit} /></g>
				<rect x={-150} y={-108} width={90} height={12} fill="#2a1d14" /><rect x={-150} y={-260} width={12} height={260} fill="#2a1d14" />
				{P(withBreath({lean: 30 + 1.5 * Math.sin(t * 1.1), head: 30 + 4 * Math.sin(t * 0.6), armN: [62 + 3 * Math.sin(t * 9), 30 + 4 * Math.abs(Math.sin(t * 7))], armF: [58 + 3 * Math.sin(t * 9 + 2), 34 + 4 * Math.abs(Math.sin(t * 7 + 1))], legN: [86, -86], legF: [82, -82]}, t, i), -100, 0.78)}
			</g>
		);
		case 'home': {
			const ph = t * 4 + i;
			const pose: Pose = {...walkPose(ph, 26, 30), armN: [20, 30], armF: [16, 34]};
			return (
				<g>
					<g transform="translate(120,0)">
						<rect x={-120} y={-420} width={240} height={420} fill="#15171d" />
						{Array.from({length: 24}, (_, k) => <rect key={k} x={-100 + (k % 4) * 52} y={-400 + Math.floor(k / 4) * 64} width={30} height={36} fill={k === 9 ? '#ffcf8a' : '#232733'} opacity={k === 9 ? lit : 1} />)}
						<ellipse cx={-48} cy={-224} rx={70} ry={50} fill="url(#warmGlow)" opacity={0.5 * lit} />
					</g>
					{P(pose, -120)}
					<HouseOn x={-120} y={0} k={0.78} lean={pose.lean ?? 0} />
				</g>
			);
		}
		case 'run': {
			// stop ≥ 0: seconds since the music asked 然后呢 — the runner winds down, stands, and slowly looks up at its strings
			const rt = stop < 0 ? t : t - stop + 0.32 * (1 - Math.exp(-stop / 0.32));
			const amp = stop < 0 ? 1 : Math.exp(-stop / 0.45);
			const look = stop < 0 ? 0 : spring({frame: Math.max(0, stop - 0.9) * FPS, fps: FPS, config: {damping: 14, stiffness: 40, mass: 1.4}});
			const p = walkPose(rt * 11 + i, 4, 16);
			const pose: Pose = withBreath({...p, ground: amp > 0.05, lean: (p.lean ?? 0) * amp + 4 * (1 - amp) - 6 * look, head: (p.head ?? 0) * amp + 18 * (1 - amp) * (1 - look) - 32 * look,
				legN: [p.legN![0] * 1.6 * amp + 2 * (1 - amp), p.legN![1] * 1.8 * amp], legF: [p.legF![0] * 1.6 * amp - 3 * (1 - amp), p.legF![1] * 1.8 * amp],
				armN: [p.armN![0] * 2.4 * amp - 3 * (1 - amp), 70 * amp + 6 * (1 - amp)], armF: [p.armF![0] * 2.4 * amp + 5 * (1 - amp), 70 * amp + 8 * (1 - amp)]}, t, i);
			return (
				<g>
					<path d="M-200,-10 L200,-30 L210,0 L-190,20 Z" fill="#1d1f24" />
					{Array.from({length: 9}, (_, k) => <rect key={k} x={-190 + ((k * 46 + rt * 300) % 400)} y={-14 - k * 2} width={6} height={20} fill="#2c2f36" />)}
					<line x1={170} y1={-28} x2={150} y2={-260} stroke="#2a2d33" strokeWidth={10} /><rect x={110} y={-292} width={86} height={44} rx={6} fill="#14161a" />
					<text x={153} y={-262} textAnchor="middle" style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 24}} fill="#ff6a50" opacity={lit}>{(12 + (t * 0.3) % 2).toFixed(1)}</text>
					<ellipse cx={0} cy={-20} rx={260} ry={60} fill="#ff6a50" opacity={0.1 * lit} filter="url(#b6)" />
					{P(pose, -20, 0.78)}
				</g>
			);
		}
		case 'night': return (
			<g>
				<rect x={-200} y={-70} width={400} height={50} rx={8} fill="#3a2c22" />
				<rect x={-200} y={-150} width={22} height={150} rx={6} fill="#2a1f18" />
				<rect x={-180} y={-112} width={360} height={46} rx={16} fill="#3b4558" filter="url(#felt)" />
				<g transform="translate(110,-112)"><rect x={-26} y={-6} width={52} height={10} rx={4} fill="#0c0d10" /><rect x={-23} y={-5} width={46} height={7} rx={3} fill="#bcd2f0" opacity={lit} /></g>
				<ellipse cx={110} cy={-150} rx={200} ry={110} fill="url(#coldGlow)" opacity={0.8 * lit} />
				{(() => { const c = (t + i) % 3.4, nod = c < 2.6 ? Math.pow(c / 2.6, 2.2) : Math.exp(-(c - 2.6) * 9) * Math.cos((c - 2.6) * 20); // drifting off… and jerking awake
					return P(withBreath({lean: 28 + 8 * nod, head: 34 + 26 * nod, armN: [30, 40 - 8 * nod], armF: [26, 44 - 8 * nod], legN: [86, -86], legF: [82, -82]}, t, i), 30, 0.78); })()}
			</g>
		);
	}
};
/** the turntable seen low and close: stations ride the front arc; the disc clicks round one stop per beat */
const Carousel: React.FC<{theta: number; t: number; dark?: number; spot?: number; swing?: number; stop?: number}> = ({theta, t, dark = 0, spot = 0, swing = 0, stop = -1}) => {
	const CX = 960, CY = 870, RX = 1150, RY = 150;
	const items = STATIONS.map((s, i) => {
		const phi = ((i * 60 - theta) % 360 + 540) % 360 - 180;            // −180..180, 0 = front centre
		const a = rad(phi);
		return {s, i, phi, x: CX + RX * Math.sin(a), y: CY + RY * Math.cos(a), k: 0.5 + 0.5 * Math.cos(a), front: Math.cos(a)};
	}).sort((p, q) => p.front - q.front);
	return (
		<AbsoluteFill style={{background: '#06080c'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				{/* the room: a tall window with cold night light, a warm bulb above the disc */}
				<rect width={W} height={H} fill="#0a0e15" />
				<g transform="translate(1340,60)" opacity={0.7}>
					<rect width={420} height={520} fill="#121a2a" />
					{Array.from({length: 12}, (_, k) => <rect key={k} y={k * 44} width={420} height={18} fill="#1c2840" />)}
					<polygon points="0,520 420,520 260,1080 -420,1080" fill="#9fb6d8" opacity={0.05} filter="url(#b12)" />
				</g>
				<g transform="translate(960,0)">
					<line x1={0} y1={0} x2={0} y2={150} stroke="#1a1a1c" strokeWidth={3} />
					<circle cx={0} cy={168} r={20} fill="#ffd69a" opacity={1 - dark * 0.9} />
					<circle cx={0} cy={168} r={520} fill="url(#warmGlow)" opacity={0.45 * (1 - dark)} />
				</g>
				{/* the disc */}
				<radialGradient id="discG" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#5a4030" /><stop offset="0.6" stopColor="#2e2118" /><stop offset="1" stopColor="#140e0a" /></radialGradient>
				<ellipse cx={CX} cy={CY + 26} rx={RX + 160} ry={RY + 60} fill="#120c08" />
				<ellipse cx={CX} cy={CY} rx={RX + 160} ry={RY + 60} fill="url(#discG)" />
				{[0.35, 0.55, 0.75, 0.92].map((q) => <ellipse key={q} cx={CX} cy={CY} rx={(RX + 160) * q} ry={(RY + 60) * q} fill="none" stroke="#000" strokeWidth={1.5} opacity={0.25} />)}
				<ellipse cx={CX} cy={CY - 20} rx={700} ry={130} fill="url(#warmGlow)" opacity={0.35 * (1 - dark)} />
				{Array.from({length: 72}, (_, k) => { const a = rad(k * 5 - theta); if (Math.cos(a) < 0.1) return null; const r1 = 1.0, r2 = k % 6 === 0 ? 0.955 : 0.975; return <line key={k} x1={CX + (RX + 150) * r1 * Math.sin(a)} y1={CY + (RY + 55) * r1 * Math.cos(a)} x2={CX + (RX + 150) * r2 * Math.sin(a)} y2={CY + (RY + 55) * r2 * Math.cos(a)} stroke="#e8d2a8" strokeWidth={k % 6 === 0 ? 3 : 1.5} opacity={0.5} />; })}
				{items.map(({s, i, x, y, k, front}) => {
					if (front < -0.2) return null;
					const lit = (spot > 0 ? (Math.abs(x - CX) < 60 ? 1 : 1 - spot) : 1) * (1 - dark * (Math.abs(x - CX) < 60 ? 0.2 : 0.95));
					return (
						<g key={s.id} opacity={Math.min(1, (front + 0.2) * 2)} filter={front < 0.75 ? 'url(#b3)' : undefined}>
							<g transform={`translate(${x},${y}) scale(${k})`}><Station id={s.id} t={t} lit={lit} i={i} swing={swing * (0.8 + 0.4 * ((i * 37) % 5) / 4)} stop={stop} /></g>
							<Sign x={x - 240 * k} y={y - 330 * k} q={s.q} k={k * 0.9} lit={lit} />
						</g>
					);
				})}
				{/* motion blur streaks while the disc whips round */}
			</svg>
			{dark > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse 380px 520px at 50% 62%, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.85 * dark}) 70%)`}} />}
			<Grade />
			<Mark />
		</AbsoluteFill>
	);
};
/** disc angle: glides one stop (60°) per move, the moves crowding closer (accelerating); then a whip that settles with a soft overshoot */
const carouselTheta = (T: number) => {
	const ticks = [5, 7, 9, 11, 13, 14, 15, 16, 17, 18, 19].map(bt);
	const sstep = (u: number) => { const v = cl01(u); return v * v * v * (v * (6 * v - 15) + 10); };
	let th = -60;
	ticks.forEach((tk, n) => { const d = (n + 1 < ticks.length ? ticks[n + 1] : bt(20)) - tk; th += 60 * sstep((T - tk + 0.12) / (d * 0.92)); });
	const w0 = bt(20) - 0.05, w1 = bt(22) - 0.1;
	if (T >= w0) {
		const u = (T - w0) / (w1 - w0);
		const settle = u < 1 ? 0.5 - 0.5 * Math.cos(Math.PI * Math.pow(u, 1.35)) : 1 + 0.035 * Math.exp(-(T - w1) * 3.2) * Math.sin((T - w1) * 9);
		th += 360 * settle;
	}
	return th;
};
/** a string-hung figure on a turning disc lags and swings: a damped pendulum driven by the disc's angular acceleration */
const discSwing = (T: number) => {
	const dt = 1 / 60, w = 2 * Math.PI * 0.9, z = 0.22;
	let x = 0, v = 0;
	const om = (s: number) => (carouselTheta(s + dt) - carouselTheta(s - dt)) / (2 * dt);
	for (let s = Math.max(bt(4.5), T - 3); s < T; s += dt) {
		const acc = (om(s + dt) - om(s - dt)) / (2 * dt);
		const a = -0.0045 * acc - 2 * z * w * v - w * w * x; v += a * dt; x += v * dt;
	}
	return Math.max(-14, Math.min(14, x));
};
const Open4: React.FC = () => {
	useFonts();
	const T = useCurrentFrame() / FPS;
	const t = T;                                                                // continuous: 30 fps animation, no stepping
	const sub = (a: number, b: number, s: string) => (T >= a && T < b ? <AbsoluteFill style={{opacity: Math.min(1, (T - a) / 0.2, (b - T) / 0.2)}}><Sub t={s} /></AbsoluteFill> : null);
	const STOP = bt(22) - 0.1;
	let pic: React.ReactNode, cam = {s: 1, x: 0, y: 0};
	const drift = (k: number) => ({x: k * (5 * Math.sin(T * 0.37) + 3 * Math.sin(T * 0.83 + 1)), y: k * (4 * Math.sin(T * 0.29 + 2) + 2 * Math.sin(T * 0.71))});   // a hand-held breath
	if (T < bt(5)) { const u = T / bt(5); pic = <S1b t={t} crowd sub="" headLift={6 * ease(cl01((T - 0.3) / 1.4))} />; cam = {s: 1.0 + 0.035 * ease(u), ...drift(1)}; }
	else if (T < STOP) { pic = <Carousel theta={carouselTheta(T)} t={t} swing={discSwing(T)} />; cam = {s: 1.02, ...drift(0.8)}; }
	else if (T < bt(26)) {                                                      // 然后呢？ — lights fall away; the runner stops and looks up
		const s = T - STOP;
		pic = <Carousel theta={carouselTheta(T)} t={t} swing={discSwing(T)} dark={ease(cl01(s / 0.8))} spot={1} stop={s} />;
		cam = {s: 1.02 + 0.4 * ease(cl01(s / (bt(26) - STOP))), x: 0, y: 60 * ease(cl01(s / (bt(26) - STOP)))};
	}
	else if (T < bt(29)) { const u = (T - bt(26)) / (bt(29) - bt(26)); pic = <S1b t={t} spin={6 * ease(u)} headLift={10 - 18 * ease(cl01(u * 1.2))} flick={1} sub="" />; cam = {s: 1.08 - 0.04 * u, ...drift(1)}; }
	else pic = <V2Hill t={t - bt(29)} header="" plankY={t < T_DRUM - 0.5 ? -320 : t < T_DRUM ? -320 + 620 * Math.pow((t - (T_DRUM - 0.5)) / 0.5, 2) : 300 - 26 * Math.exp(-5 * (t - T_DRUM)) * Math.cos(16 * (t - T_DRUM))} />;
	if (T >= bt(29)) cam = {s: 1.04 - 0.03 * cl01((T - bt(29)) / 6), ...drift(0.6)};
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.s})`, transformOrigin: '50% 62%'}}>{pic}</AbsoluteFill>
			{sub(0.5, bt(5) - 0.05, '为什么挤地铁？')}
			{sub(bt(22) + 0.4, bt(26) - 0.05, '然后呢？')}
			{sub(bt(26) + 0.1, bt(29) - 0.05, '第二天，再来一遍')}
			{sub(bt(29) + 0.15, T_DRUM - 0.1, '有个人，这样过了永远')}
			{sub(T_DRUM + 0.9, T_DRUM + 3.6, '可有位哲学家说：他是幸福的')}
		</AbsoluteFill>
	);
};

// ================================================================== CONCEPTS for the middle "why?" run: A music box · B loop line · C clock face
/** a marionette with its strings rising out of frame */
const Hung: React.FC<{x: number; y: number; k: number; pose: Pose; flip?: boolean; id: string; top?: number; spread?: number; warm?: boolean}> = ({x, y, k, pose, flip, id, top = -200, spread = 34, warm = true}) => (
	<g>
		<Man x={x} y={y} k={k} pose={pose} flip={flip} warm={warm} />
		{attachPts(pose).map(({p, to}, i) => { const a = W2(x, y, k, [flip ? -p[0] : p[0], p[1]]); return <g key={i}><RealString a={a} b={[x + (flip ? -to : to) * spread * k, top]} id={`${id}${i}`} band={[0.1, 0.5]} w={i === 4 || i === 6 ? 1.1 : 0.85} /><Eyelet p={a} k={k * 0.9} /></g>; })}
	</g>
);

// ---- A · inside a wound-up music box: a brass plate turning, the days as miniatures on it
const MusicBox: React.FC<{theta: number; t: number; dark?: number; stop?: number; keyA?: number}> = ({theta, t, dark = 0, stop = -1, keyA = 0}) => {
	const MX = 900, MY = 700, MRX = 560, MRY = 150;
	const items = STATIONS.map((s, i) => {
		const a = rad(((i * 60 - theta) % 360 + 540) % 360 - 180);
		return {s, i, x: MX + MRX * 0.8 * Math.sin(a), y: MY + MRY * 0.8 * Math.cos(a), k: 0.42 + 0.5 * (0.5 + 0.5 * Math.cos(a)), front: Math.cos(a)};
	}).sort((p, q) => p.front - q.front);
	const L = 1 - dark * 0.92;
	const lidO: Pt[] = [[300, 440], [1620, 440], [1560, -70], [360, -70]];
	const mir: Pt[] = [[470, 380], [1450, 380], [1420, 30], [500, 30]];
	const poly = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ');
	const frontSt = items[items.length - 1];
	return (
		<AbsoluteFill style={{background: '#0a0706'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<radialGradient id="brassG" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#f0d58e" /><stop offset="0.45" stopColor="#b48d45" /><stop offset="1" stopColor="#5b4420" /></radialGradient>
				<linearGradient id="cylG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b5226" /><stop offset="0.35" stopColor="#f2d999" /><stop offset="0.6" stopColor="#a8823d" /><stop offset="1" stopColor="#3e2d14" /></linearGradient>
				<linearGradient id="mirG" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#3a3833" /><stop offset="0.5" stopColor="#24221f" /><stop offset="1" stopColor="#151413" /></linearGradient>
				<radialGradient id="velG" cx="0.45" cy="0.8" r="0.8"><stop offset="0" stopColor="#7a1a22" /><stop offset="0.6" stopColor="#4a0d14" /><stop offset="1" stopColor="#22050a" /></radialGradient>
				<clipPath id="mirClip"><polygon points={poly(mir)} /></clipPath>
				<g transform="translate(900,600) scale(1.3) translate(-900,-600)">
				{/* the room behind, far out of focus: a lamp and a window */}
				<g filter="url(#b12)" opacity={L}>
					<circle cx={180} cy={150} r={260} fill="url(#warmGlow)" opacity={0.7} />
					<rect x={1660} y={40} width={240} height={360} fill="#1b2638" />
					{[[90, 380, 30], [1760, 520, 18], [1840, 300, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#ffcf8a" opacity={0.25} />)}
				</g>
				{/* the lid, standing open: walnut frame, velvet, an old mirror */}
				<polygon points={poly(lidO)} fill="url(#m-walnut)" filter="url(#wood)" opacity={0.95} />
				<polygon points={poly([[350, 420], [1570, 420], [1515, -40], [405, -40]])} fill="#3c0a10" filter="url(#felt)" />
				<polygon points={poly(mir)} fill="url(#mirG)" />
				<g clipPath="url(#mirClip)" opacity={0.55 * L} filter="url(#b3)">
					{/* the mirror catches the lamp and the turning figures, dim and soft */}
					<ellipse cx={700} cy={120} rx={260} ry={120} fill="url(#warmGlow)" />
					<g transform={`translate(${frontSt.x - 40},${360}) scale(${frontSt.k * 0.8})`}><Station id={frontSt.s.id} t={t} lit={L} i={frontSt.i} stop={stop} /></g>
				</g>
				<polygon points={poly(mir)} fill="none" stroke="#c9a65e" strokeWidth={5} opacity={0.6} />
				<path d="M560,60 L760,360 M640,60 L800,300" stroke="#fff" strokeWidth={14} opacity={0.035} />
				{/* the box: rim, velvet well */}
				<polygon points="300,440 1620,440 1840,945 80,945" fill="#2a1a10" />
				<polygon points="330,452 1590,452 1800,930 120,930" fill="url(#m-walnut)" filter="url(#wood)" />
				<polygon points="368,470 1552,470 1752,912 168,912" fill="url(#velG)" />
				<polygon points="368,470 1552,470 1752,912 168,912" fill="#5a0f17" filter="url(#felt)" opacity={0.55} />
				<polygon points="368,470 1552,470 1532,520 388,520" fill="#000" opacity={0.35} />
				{/* the mechanism at the back: pinned cylinder and steel comb */}
				<g opacity={0.35 + 0.65 * L}>
					<rect x={1180} y={478} width={330} height={66} rx={30} fill="url(#cylG)" />
					{Array.from({length: 60}, (_, j) => { const col = j % 15, row = Math.floor(j / 15); const ph = ((row * 0.27 + col * 0.13 + theta / 90) % 1); const y = 482 + ph * 58; return <circle key={j} cx={1200 + col * 21} cy={y} r={2.2} fill="#fff4cf" opacity={Math.sin(ph * Math.PI) * 0.9} />; })}
					<rect x={1166} y={490} width={18} height={42} rx={4} fill="#4a3618" /><rect x={1506} y={490} width={18} height={42} rx={4} fill="#4a3618" />
					<rect x={1190} y={548} width={310} height={14} fill="#8a8f96" />
					{Array.from({length: 24}, (_, j) => <rect key={j} x={1194 + j * 12.6} y={530} width={7} height={22 - (j % 6)} fill="#b9c0c8" />)}
				</g>
				{/* the brass plate */}
				<ellipse cx={MX} cy={MY + 22} rx={MRX + 10} ry={MRY + 12} fill="#3b2a12" />
				<ellipse cx={MX} cy={MY} rx={MRX} ry={MRY} fill="url(#brassG)" />
				{[0.25, 0.45, 0.65, 0.85, 0.97].map((q) => <ellipse key={q} cx={MX} cy={MY} rx={MRX * q} ry={MRY * q} fill="none" stroke="#3b2a12" strokeWidth={1.2} opacity={0.35} />)}
				{Array.from({length: 48}, (_, j) => { const a = rad(j * 7.5 - theta); if (Math.cos(a) < 0) return null; return <line key={j} x1={MX + MRX * 0.98 * Math.sin(a)} y1={MY + MRY * 0.98 * Math.cos(a)} x2={MX + MRX * 0.93 * Math.sin(a)} y2={MY + MRY * 0.93 * Math.cos(a)} stroke="#3b2a12" strokeWidth={2} opacity={0.4} />; })}
				<ellipse cx={MX - 140} cy={MY - 40} rx={260} ry={46} fill="#fff1c8" opacity={0.25 * L} filter="url(#b6)" />
				{/* figures on the plate */}
				{items.map(({s, i, x, y, k, front}) => {
					if (front < -0.25) return null;
					const lit = (dark > 0 ? (front > 0.97 ? 1 : 1 - dark) : 1);
					return (
						<g key={s.id} opacity={Math.min(1, (front + 0.25) * 2.2)} filter={front < 0.6 ? 'url(#b1.5)' : undefined}>
							<g transform={`translate(${x},${y}) scale(${k})`}><Station id={s.id} t={t} lit={lit} i={i} stop={stop} /></g>
							<Sign x={x - 230 * k} y={y - 330 * k} q={s.q} k={k * 0.62} lit={lit} />
						</g>
					);
				})}
				<g transform={`translate(${MX},${MY})`}><ellipse cx={0} cy={4} rx={26} ry={9} fill="#2a1d0c" /><rect x={-9} y={-30} width={18} height={34} fill="url(#cylG)" /><ellipse cx={0} cy={-30} rx={9} ry={3.5} fill="#f2d999" /></g>
				{/* front face of the box, keyhole and the wind-up key */}
				<polygon points="80,945 1840,945 1840,1100 80,1100" fill="url(#m-walnut)" filter="url(#wood)" />
				<rect x={80} y={945} width={1760} height={8} fill="#c9a65e" opacity={0.45} />
				<g transform="translate(960,1015)"><ellipse rx={30} ry={38} fill="#b48d45" /><path d="M0,-14 a8,8 0 1 1 0.1,0 L6,16 L-6,16 Z" fill="#1a0f06" /></g>
				<g transform={`translate(1700,1010) rotate(${keyA})`}>
					<rect x={-8} y={-8} width={16} height={16} fill="#5b4420" />
					<path d="M0,0 C-30,-60 -70,-70 -78,-30 C-82,0 -40,10 0,0 C40,-10 82,0 78,30 C70,70 30,60 0,0 Z" fill="url(#brassG)" stroke="#3b2a12" strokeWidth={3} />
				</g>
				{/* the lamp's light falling across, dimmed when the spring runs down */}
				<polygon points="0,0 700,0 1500,1080 0,1080" fill="#ffd9a0" opacity={0.05 * L} filter="url(#b12)" />
				</g>
			</svg>
			{dark > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse 360px 480px at 47% 58%, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.8 * dark}) 75%)`}} />}
			<Grade />
			<Mark />
		</AbsoluteFill>
	);
};

// ---- B · a loop-line carriage: every stop is a "why", there is no terminus
const LOOP = ['挤地铁', '上班', '加班', '还房贷', '拼命', '熬夜'];
const LoopTrain: React.FC<{t: number; at?: number; dark?: number; chase?: number}> = ({t, at = 2, dark = 0, chase = -1}) => {
	const L = 1 - dark * 0.85;
	const mx = 1180, seatY = 800, k = 1.05;
	const pose: Pose = withBreath(dark > 0 ? {lean: -4, head: -30, armN: [34, 50], armF: [30, 54], legN: [86, -86], legF: [82, -82], case: true} : {lean: 10, head: 26, armN: [34, 50], armF: [30, 54], legN: [86, -86], legF: [82, -82], case: true}, t);
	return (
		<AbsoluteFill style={{background: '#05070a'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<linearGradient id="carW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa8a4" /><stop offset="1" stopColor="#5b6764" /></linearGradient>
				<clipPath id="winClip"><rect x={330} y={250} width={1060} height={400} rx={60} /></clipPath>
				{/* carriage wall */}
				<rect width={W} height={H} fill="url(#carW)" opacity={L} />
				<rect width={W} height={H} fill="#000" opacity={1 - L} />
				<rect y={0} width={W} height={30} fill="#f4fbff" opacity={0.9 * L} /><rect y={0} width={W} height={140} fill="#e9f3f8" opacity={0.2 * L} filter="url(#b12)" />
				{[[60, 230], [1500, 230]].map(([x], i) => <rect key={i} x={x} y={250} width={260} height={400} rx={30} fill="#7d8a87" opacity={0.6 * L} />)}
				{/* the window: the platform of this stop — or the tunnel */}
				<g clipPath="url(#winClip)">
					<rect x={330} y={250} width={1060} height={400} fill="#0b0e12" />
					{chase < 0 ? (
						<g>
							<rect x={330} y={250} width={1060} height={400} fill="#1d2228" />
							{Array.from({length: 14}, (_, i) => <line key={i} x1={330 + i * 80} y1={250} x2={330 + i * 80} y2={650} stroke="#13171b" strokeWidth={3} />)}
							<rect x={330} y={420} width={1060} height={30} fill="#2c4a6a" opacity={0.6} />
							<g transform="translate(560,330)"><rect x={-130} y={-40} width={260} height={80} fill="#203a58" /><text y={18} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 52, letterSpacing: '0.2em'}} fill="#e8eef6">{LOOP[at]}站</text></g>
							<g transform="translate(760,640) scale(0.62)"><Station id={STATIONS[at].id} t={t} lit={1} i={at} /></g>
							<rect x={330} y={250} width={1060} height={400} fill="#9fb6d8" opacity={0.08} />
						</g>
					) : (
						<g>
							{Array.from({length: 7}, (_, i) => { const x = 330 + ((i * 170 - t * 2400) % 1200 + 1200) % 1200; return <rect key={i} x={x} y={300 + (i % 3) * 90} width={260} height={4} fill="#ffcf8a" opacity={0.5} filter="url(#b3)" />; })}
						</g>
					)}
					{/* faint reflection of the carriage and the puppet in the glass */}
					<g opacity={0.12}><Man x={mx - 40} y={seatY + 232 * k - 60} k={k * 0.95} pose={pose} warm={false} /></g>
				</g>
				<rect x={330} y={250} width={1060} height={400} rx={60} fill="none" stroke="#c9d2cf" strokeWidth={18} opacity={0.85 * L + 0.1} />
				{/* the line map above the window: a closed loop */}
				<g transform="translate(860,140)" opacity={0.3 + 0.7 * L}>
					<rect x={-420} y={-90} width={840} height={180} rx={28} fill="#e8ece8" />
					<text x={-390} y={-50} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 26}} fill="#24303a">环线 · 每一天</text>
					<ellipse cx={30} cy={14} rx={300} ry={44} fill="none" stroke="#2f7fc0" strokeWidth={9} />
					{LOOP.map((n, i) => {
						const a = rad(-90 + i * 60 + 30), x = 30 + 300 * Math.cos(a), y = 14 + 44 * Math.sin(a);
						const on = chase >= 0 ? Math.max(0, 1 - Math.abs(((chase * 6 - i) % 6 + 6) % 6 - 0) ) : i === at ? 1 : 0;
						return <g key={n}>
							<circle cx={x} cy={y} r={12} fill={on > 0.05 ? '#ff4a3d' : '#fff'} stroke="#2f7fc0" strokeWidth={4} />
							{on > 0.05 && <circle cx={x} cy={y} r={30} fill="#ff4a3d" opacity={0.35 * on} filter="url(#b6)" />}
							<text x={x} y={y + (Math.sin(a) > 0 ? 44 : -22)} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 22}} fill="#24303a">{n}</text>
						</g>;
					})}
				</g>
				{/* bench and floor */}
				<rect x={120} y={seatY - 10} width={1700} height={70} rx={20} fill="#3d5a63" opacity={0.4 + 0.6 * L} />
				<rect x={120} y={seatY + 50} width={1700} height={240} fill="#2a3337" opacity={0.4 + 0.6 * L} />
				<rect x={0} y={seatY + 60} width={W} height={20} fill="#000" opacity={0.3} />
				{[90, 1850].map((x) => <rect key={x} x={x - 14} y={0} width={28} height={H} fill="#cfd8d6" opacity={0.6 * L + 0.15} />)}
				<Hung x={mx} y={seatY + 232 * k - 6} k={k} pose={pose} id="lt" top={-60} />
				{dark > 0 && <ellipse cx={860} cy={150} rx={520} ry={160} fill="#ff4a3d" opacity={0.06 * dark} filter="url(#b12)" />}
			</svg>
			<Grade />
			<Mark />
		</AbsoluteFill>
	);
};

// ---- C · walking on the face of a great clock; the hour hand at his back
const ClockFace: React.FC<{t: number; turned?: boolean}> = ({t, turned}) => {
	const c: Pt = [960, 440], R = 430;
	const hourA = turned ? 214 : 221;                                             // degrees clockwise from 12
	const hand = (a: number, len: number, w: number) => { const v = rad(a); const tip: Pt = [c[0] + len * Math.sin(v), c[1] - len * Math.cos(v)]; const n: Pt = [Math.cos(v) * w, Math.sin(v) * w]; return `M${c[0] - n[0]},${c[1] - n[1]} L${tip[0]},${tip[1]} L${c[0] + n[0]},${c[1] + n[1]} Z`; };
	const romans = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
	const tags: Record<number, string> = {7: '挤地铁', 9: '上班', 1: '加班', 3: '还房贷', 5: '熬夜'};
	const pose: Pose = turned ? withBreath({lean: -6, head: -34, armN: [-6, 6], armF: [4, 8], legN: [3, 0], legF: [-3, 0], case: true}, t) : {...walkPose(t * 5, 18, 14), case: true};
	return (
		<AbsoluteFill style={{background: '#0c0806'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<radialGradient id="brassG" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#f0d58e" /><stop offset="0.45" stopColor="#b48d45" /><stop offset="1" stopColor="#5b4420" /></radialGradient>
				<radialGradient id="dialG" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor="#efe3c6" /><stop offset="0.7" stopColor="#d6c39b" /><stop offset="1" stopColor="#8e7652" /></radialGradient>
				<rect width={W} height={H} fill="url(#m-walnut)" filter="url(#wood)" opacity={0.5} />
				<circle cx={c[0]} cy={c[1]} r={R + 60} fill="#2a1a10" />
				<circle cx={c[0]} cy={c[1]} r={R + 40} fill="url(#brassG)" />
				<circle cx={c[0]} cy={c[1]} r={R} fill="url(#dialG)" filter="url(#paper)" />
				{/* the open centre: gears turning in the dark */}
				<circle cx={c[0]} cy={c[1]} r={180} fill="#140d07" />
				{[[-60, -30, 115, 24, 1], [90, 50, 85, 18, -1.4], [30, -110, 55, 12, 2.2]].map(([dx, dy, r, n, sp], i) => (
					<g key={i} transform={`translate(${c[0] + dx},${c[1] + dy}) rotate(${t * 12 * sp})`} opacity={0.9}>
						<circle r={r} fill="none" stroke="#9c7a3a" strokeWidth={r * 0.18} />
						{Array.from({length: n}, (_, j) => <rect key={j} x={-7} y={-r - 16} width={14} height={20} fill="#9c7a3a" transform={`rotate(${(j * 360) / n})`} />)}
						{[0, 1, 2, 3].map((j) => <rect key={j} x={-5} y={-r} width={10} height={r} fill="#7a5c28" transform={`rotate(${j * 90})`} />)}
					</g>
				))}
				<circle cx={c[0]} cy={c[1]} r={180} fill="none" stroke="#3a2a18" strokeWidth={10} />
				<circle cx={c[0] - 60} cy={c[1] - 80} r={300} fill="url(#warmGlow)" opacity={0.25} />
				{romans.map((r, i) => { const a = rad(i * 30); return <text key={r} x={c[0] + 350 * Math.sin(a)} y={c[1] - 350 * Math.cos(a) + 24} textAnchor="middle" style={{fontFamily: '"Cormorant", serif', fontWeight: 700, fontSize: 62}} fill="#2a2018" opacity={0.85}>{r}</text>; })}
				{Array.from({length: 60}, (_, i) => { const a = rad(i * 6); return <line key={i} x1={c[0] + 415 * Math.sin(a)} y1={c[1] - 415 * Math.cos(a)} x2={c[0] + (i % 5 ? 402 : 390) * Math.sin(a)} y2={c[1] - (i % 5 ? 402 : 390) * Math.cos(a)} stroke="#2a2018" strokeWidth={i % 5 ? 2 : 5} />; })}
				{Object.entries(tags).map(([h, s]) => { const a = rad(Number(h) * 30); return <text key={h} x={c[0] + 268 * Math.sin(a)} y={c[1] - 268 * Math.cos(a) + 10} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 30}} fill="#7a1e1a" opacity={0.75}>{s}</text>; })}
				{/* hands */}
				<path d={hand(hourA + 150, 380, 10)} fill="#1a120c" opacity={0.85} />
				<path d={hand(hourA, 300, 22)} fill="url(#brassG)" stroke="#3b2a12" strokeWidth={3} />
				<circle cx={c[0]} cy={c[1]} r={26} fill="url(#brassG)" />
				{/* a ledge in front of the dial: he walks along it */}
				<rect x={0} y={940} width={W} height={140} fill="url(#m-walnut)" filter="url(#wood)" />
				<rect x={0} y={936} width={W} height={10} fill="#c9a65e" opacity={0.35} />
				<ellipse cx={640} cy={300} rx={500} ry={300} fill="#ffd9a0" opacity={0.06} filter="url(#b12)" />
				<Hung x={turned ? 790 : 800} y={944} k={1.0} pose={pose} flip={turned} id="cf" top={-60} />
				{Array.from({length: 30}, (_, i) => { const R2 = rnd2(i + 9); return <circle key={i} cx={300 + R2() * 1300} cy={100 + R2() * 800} r={0.8 + R2() * 1.6} fill="#ffd9b0" opacity={0.2 + 0.3 * R2()} />; })}
			</svg>
			<Grade />
			<Mark />
		</AbsoluteFill>
	);
};
const Concepts: React.FC = () => {
	useFonts();
	const f = useCurrentFrame();
	const t = 1.3;
	const list = [
		<MusicBox theta={-14} t={t} keyA={30} />,
		<MusicBox theta={240} t={t} dark={1} stop={2.4} keyA={0} />,
		<LoopTrain t={t} at={2} />,
		<LoopTrain t={t} dark={1} chase={t * 3.3} />,
		<ClockFace t={t} />,
		<ClockFace t={t} turned />,
	];
	const subs = ['为什么加班？', '然后呢？', '为什么加班？', '然后呢？', '为什么上班？', '然后呢？'];
	return <AbsoluteFill>{list[f % 6]}<Sub t={subs[f % 6]} /></AbsoluteFill>;
};

// ================================================================== v6 · the music box: every day is a little lit display box on a turning brass plate
const MBP = {cx: 700, cy: 650, rx: 330, ry: 90, r: 0.74};
const DW = 300, DH = 169, DB = 34;                                           // display-box opening (16:9) and its base molding, at k = 1
const MB_TICKS = [7, 9, 11, 13, 14, 15, 16, 17, 18, 19].map(bt);
const MB_W0 = bt(20) - 0.05, MB_W1 = bt(22) - 0.1;
/** plate angle: one display box (60°) per move — the moves crowd together; then a whip that runs the spring down onto the platform box */
const mbTheta = (T: number) => {
	const sstep = (u: number) => { const v = cl01(u); return v * v * v * (v * (6 * v - 15) + 10); };
	let th = 0;
	MB_TICKS.forEach((tk, n) => { const d = (n + 1 < MB_TICKS.length ? MB_TICKS[n + 1] : bt(20)) - tk; th += 60 * sstep((T - tk + 0.08) / (Math.min(d, 1.0) * 0.82)); });
	if (T >= MB_W0) {
		const u = (T - MB_W0) / (MB_W1 - MB_W0);
		// spins up hard, then the spring gives out: a long slowing, the last teeth catching one by one
		const e = u < 1 ? (u < 0.35 ? 0.5 * Math.pow(u / 0.35, 2) * 0.62 : 0.31 + 0.69 * (1 - Math.pow(1 - (u - 0.35) / 0.65, 2.6))) : 1;
		const hitch = u > 0.7 && u < 1 ? -0.006 * Math.abs(Math.sin((u - 0.7) * 40)) : 0;
		th += 480 * (e + hitch) + (u >= 1 ? 3 * Math.exp(-(T - MB_W1) * 4) * Math.sin((T - MB_W1) * 15) : 0);
	}
	return th;
};
const mbSwing = (T: number) => {
	const dt = 1 / 60, w = 2 * Math.PI * 0.9, z = 0.22;
	let x = 0, v = 0;
	const om = (s: number) => (mbTheta(s + dt) - mbTheta(s - dt)) / (2 * dt);
	for (let s = Math.max(bt(6.5), T - 3); s < T; s += dt) { const acc = (om(s + dt) - om(s - dt)) / (2 * dt); const a = -0.004 * acc - 2 * z * w * v - w * w * x; v += a * dt; x += v * dt; }
	return Math.max(-12, Math.min(12, x));
};
const boxAt = (i: number, theta: number) => {
	const a = rad(((i * 60 - theta) % 360 + 540) % 360 - 180);
	const x = MBP.cx + MBP.rx * MBP.r * Math.sin(a), y = MBP.cy + MBP.ry * MBP.r * Math.cos(a);
	return {x, y, k: 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(a)), front: Math.cos(a)};
};
/** world point at the centre of a box's opening */
const openingC = (b: {x: number; y: number; k: number}): Pt => [b.x, b.y - (DB + DH / 2) * b.k];

/** the little world inside each display box (drawn full size, shown scaled down) */
const DioScene: React.FC<{id: StationId; t: number; i: number; swing?: number; stop?: number}> = ({id, t, i, swing = 0, stop = -1}) => {
	const R = rnd2(i * 7 + 3);
	const win = (x0: number, y0: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number, lit = 0.25, warm = '#ffcf8a') =>
		Array.from({length: cols * rows}, (_, k) => { const on = R() < lit; return <rect key={k} x={x0 + (k % cols) * gx} y={y0 + Math.floor(k / cols) * gy} width={w} height={h} fill={on ? warm : '#1a1f2a'} opacity={on ? 0.85 : 1} />; });
	let back: React.ReactNode = null;
	switch (id) {
		case 'cross': back = (<g>
			<linearGradient id="dsk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1020" /><stop offset="1" stopColor="#24304a" /></linearGradient>
			<rect width={W} height={H} fill="url(#dsk1)" />
			{[[80, 380, 300], [420, 260, 240], [700, 420, 280], [1240, 300, 260], [1540, 200, 330]].map(([x, y, w], k) => <g key={k}><rect x={x} y={y} width={w} height={1000 - y} fill={k % 2 ? '#141a26' : '#10151f'} />{win(x + 24, y + 30, Math.floor((w - 30) / 46), Math.floor((900 - y) / 60), 22, 30, 46, 60, 0.3)}</g>)}
			<rect y={960} width={W} height={120} fill="#15171c" />
			{Array.from({length: 8}, (_, k) => <rect key={k} x={260 + k * 180} y={1000} width={110} height={60} fill="#d8d2c4" opacity={0.5} transform="skewX(-30)" />)}
			<ellipse cx={1340} cy={1010} rx={400} ry={40} fill="#ff4a3d" opacity={0.15} filter="url(#b12)" />
		</g>); break;
		case 'desk': back = (<g>
			<rect width={W} height={H} fill="#1b1f25" />
			<rect x={980} y={120} width={820} height={520} fill="#0c1424" />
			{win(1000, 150, 9, 6, 60, 50, 88, 78, 0.18, '#ffd59a')}
			{Array.from({length: 22}, (_, k) => <rect key={k} x={980} y={120 + k * 24} width={820} height={9} fill="#3a4250" opacity={0.75} />)}
			<rect x={300} y={40} width={700} height={22} fill="#eef5ff" opacity={0.85} /><ellipse cx={650} cy={60} rx={600} ry={140} fill="#cfe0f5" opacity={0.12} filter="url(#b12)" />
			<rect x={60} y={560} width={260} height={440} fill="#262b33" /><rect x={1600} y={600} width={300} height={400} fill="#262b33" />
			<rect y={1000} width={W} height={80} fill="#121418" />
		</g>); break;
		case 'home': back = (<g>
			<linearGradient id="dsk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b16" /><stop offset="1" stopColor="#1d2238" /></linearGradient>
			<rect width={W} height={H} fill="url(#dsk3)" />
			<circle cx={1580} cy={190} r={60} fill="#f1e6c8" /><circle cx={1580} cy={190} r={200} fill="url(#warmGlow)" opacity={0.35} />
			{[[60, 520, 260], [1400, 460, 300]].map(([x, y, w], k) => <g key={k}><rect x={x} y={y} width={w} height={1000 - y} fill="#11151f" />{win(x + 20, y + 26, Math.floor((w - 20) / 44), Math.floor((960 - y) / 56), 22, 28, 44, 56, 0.2)}</g>)}
			<rect y={1000} width={W} height={80} fill="#121418" />
		</g>); break;
		case 'run': back = (<g>
			<linearGradient id="dsk4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1322" /><stop offset="0.7" stopColor="#3a2c3a" /><stop offset="1" stopColor="#7a4a3c" /></linearGradient>
			<rect width={W} height={H} fill="url(#dsk4)" />
			{[260, 900, 1540].map((x, k) => <g key={k}><rect x={x} y={420} width={12} height={580} fill="#22252b" /><rect x={x - 50} y={410} width={70} height={14} fill="#22252b" /><circle cx={x - 40} cy={430} r={14} fill="#ffcf8a" /><circle cx={x - 40} cy={480} r={160} fill="url(#warmGlow)" opacity={0.45} /></g>)}
			<rect y={980} width={W} height={100} fill="#1a1c21" />
		</g>); break;
		case 'night': back = (<g>
			<rect width={W} height={H} fill="#151a24" />
			<rect x={1180} y={140} width={460} height={520} fill="#0a1222" /><rect x={1180} y={140} width={460} height={520} fill="none" stroke="#2b3240" strokeWidth={18} />
			<line x1={1410} y1={140} x2={1410} y2={660} stroke="#2b3240" strokeWidth={12} /><circle cx={1520} cy={260} r={40} fill="#e9e3d0" opacity={0.9} />
			<polygon points="1180,660 1640,660 1300,1000 600,1000" fill="#9fb6d8" opacity={0.06} />
			<path d="M1120,120 Q1160,420 1130,700 L1180,700 L1180,120 Z M1700,120 Q1660,420 1690,700 L1640,700 L1640,120 Z" fill="#3a2a3a" />
			<rect x={240} y={260} width={200} height={260} fill="#2a2f3a" /><rect x={256} y={276} width={168} height={228} fill="#4a3a30" opacity={0.6} />
			<rect y={1000} width={W} height={80} fill="#121418" />
		</g>); break;
	}
	return (
		<AbsoluteFill style={{background: '#090b10'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				{back}
				<g transform="translate(960,1000) scale(2.0)"><Station id={id} t={t} lit={1} i={i} swing={swing} stop={stop} /></g>
			</svg>
		</AbsoluteFill>
	);
};

/** one display box on the plate: walnut case, brass plaque, a lit room inside */
const DisplayBox: React.FC<{b: {x: number; y: number; k: number; front: number}; id: StationId; q: string; i: number; t: number; lit: number; blur: number; swing: number; stop: number; headLift: number}> = ({b, id, q, i, t, lit, blur, swing, stop, headLift}) => {
	const {x, y, k} = b;
	const L = x - (DW / 2) * k, Tp = y - (DB + DH) * k;
	const fw = 13, dx = 16, dy = 20;                                          // frame width, top/side depth
	const ow = DW + 2 * fw, oh = DH + fw + DB;
	return (
		<>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<g transform={`translate(${x},${y}) scale(${k})`}>
					<ellipse cx={8} cy={2} rx={ow * 0.56} ry={16} fill="#000" opacity={0.55} filter="url(#b6)" />
					{/* top and right side of the case */}
					<polygon points={`${-ow / 2},${-oh} ${ow / 2},${-oh} ${ow / 2 + dx},${-oh - dy} ${-ow / 2 + dx},${-oh - dy}`} fill="#6b4a30" />
					<polygon points={`${-ow / 2},${-oh} ${ow / 2},${-oh} ${ow / 2 + dx},${-oh - dy} ${-ow / 2 + dx},${-oh - dy}`} fill="url(#m-walnut)" filter="url(#wood)" opacity={0.6} />
					<line x1={-ow / 2} y1={-oh} x2={ow / 2} y2={-oh} stroke="#e4c27e" strokeWidth={1.4} opacity={0.6} />
					<polygon points={`${ow / 2},${-oh} ${ow / 2 + dx},${-oh - dy} ${ow / 2 + dx},${-dy} ${ow / 2},0`} fill="#24160d" />
				</g>
			</svg>
			{/* the room inside */}
			<div style={{position: 'absolute', left: L, top: Tp, width: DW * k, height: DH * k, overflow: 'hidden', background: '#000', filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${(DW * k) / W})`, transformOrigin: '0 0'}}>
					{id === 'metro' ? <S1b t={t} crowd sub="" headLift={headLift} bare /> : <DioScene id={id} t={t} i={i} swing={swing} stop={stop} />}
				</div>
				<div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${18 * k}px ${6 * k}px rgba(0,0,0,0.85)`, background: `rgba(4,3,2,${(1 - lit) * 0.92})`}} />
			</div>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<g transform={`translate(${x},${y}) scale(${k})`}>
					{/* frame with a hole, moulding lines, glass sheen, plaque */}
					<path fillRule="evenodd" d={`M${-ow / 2},${-oh} H${ow / 2} V0 H${-ow / 2} Z M${-DW / 2},${-DB - DH} V${-DB} H${DW / 2} V${-DB - DH} Z`} fill="#4a301f" />
					<path fillRule="evenodd" d={`M${-ow / 2},${-oh} H${ow / 2} V0 H${-ow / 2} Z M${-DW / 2},${-DB - DH} V${-DB} H${DW / 2} V${-DB - DH} Z`} fill="url(#m-walnut)" filter="url(#wood)" opacity={0.75} />
					<rect x={-DW / 2 - 4} y={-DB - DH - 4} width={DW + 8} height={DH + 8} fill="none" stroke="#d7b46a" strokeWidth={2} opacity={0.7} />
					<rect x={-ow / 2 + 3} y={-oh + 3} width={ow - 6} height={oh - 6} fill="none" stroke="#000" strokeWidth={2} opacity={0.35} />
					<line x1={-ow / 2} y1={-DB + 6} x2={ow / 2} y2={-DB + 6} stroke="#000" strokeWidth={1.5} opacity={0.4} />
					<polygon points={`${-DW / 2},${-DB - DH} ${-DW / 2 + 70},${-DB - DH} ${-DW / 2 + 10},${-DB} ${-DW / 2},${-DB}`} fill="#fff" opacity={0.05} />
					<polygon points={`${-DW / 2 + 110},${-DB - DH} ${-DW / 2 + 130},${-DB - DH} ${-DW / 2 + 60},${-DB} ${-DW / 2 + 40},${-DB}`} fill="#fff" opacity={0.04} />
					<g transform={`translate(0,${-DB / 2 + 2})`}>
						<rect x={-82} y={-12} width={164} height={24} rx={3} fill="#a8823d" />
						<rect x={-82} y={-12} width={164} height={24} rx={3} fill="url(#brassP)" />
						<rect x={-79} y={-9} width={158} height={18} rx={2} fill="none" stroke="#5b4420" strokeWidth={1} opacity={0.7} />
						{[-74, 74].map((sx) => <circle key={sx} cx={sx} cy={0} r={2.2} fill="#5b4420" />)}
						<text y={6.5} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 17, letterSpacing: '0.08em'}} fill="#2a1a08">{q}</text>
					</g>
				</g>
			</svg>
		</>
	);
};

/** the music box itself, in world coordinates; the display boxes ride its plate */
const MusicBox6: React.FC<{T: number; theta: number; dark: number; spot: number; headLift: number; stop: number; blur: number; swing: number}> = ({T, theta, dark, spot, headLift, stop, blur, swing}) => {
	const L = 1 - 0.9 * dark;
	const boxes = STATIONS.map((s, i) => ({s, i, b: boxAt(i, theta)})).sort((p, q) => p.b.front - q.b.front);
	const keyA = -theta * 0.9;
	const lid = {bl: [430, 470] as Pt, br: [1370, 470] as Pt, tl: [462, -70] as Pt, tr: [1338, -70] as Pt};
	const arch = (x0: number, x1: number, yb: number, yt: number) => `M${x0},${yb} L${x0},${yt + (x1 - x0) * 0.32} Q${x0},${yt} ${(x0 + x1) / 2},${yt} Q${x1},${yt} ${x1},${yt + (x1 - x0) * 0.32} L${x1},${yb} Z`;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<Defs />
				<linearGradient id="brassP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e2a6" /><stop offset="0.45" stopColor="#c9a052" /><stop offset="1" stopColor="#6e5226" /></linearGradient>
				<radialGradient id="brassD" cx="0.38" cy="0.3" r="0.8"><stop offset="0" stopColor="#fbe8b0" /><stop offset="0.35" stopColor="#d2ab5c" /><stop offset="0.75" stopColor="#8a6a30" /><stop offset="1" stopColor="#4a3618" /></radialGradient>
				<linearGradient id="cylP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b4420" /><stop offset="0.3" stopColor="#f6e2a6" /><stop offset="0.55" stopColor="#b48d45" /><stop offset="1" stopColor="#3a2a12" /></linearGradient>
				<linearGradient id="steelP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef1f4" /><stop offset="1" stopColor="#6c737c" /></linearGradient>
				<linearGradient id="velW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0609" /><stop offset="1" stopColor="#5e1119" /></linearGradient>
				<radialGradient id="velD" cx="0.4" cy="0.7" r="0.8"><stop offset="0" stopColor="#8a1e28" /><stop offset="0.55" stopColor="#5a0f18" /><stop offset="1" stopColor="#26050a" /></radialGradient>
				<linearGradient id="mirP" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#4a4740" /><stop offset="0.45" stopColor="#25231f" /><stop offset="1" stopColor="#141310" /></linearGradient>
				<linearGradient id="tableP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e140d" /><stop offset="1" stopColor="#0b0705" /></linearGradient>
				{/* the room: dark, a lamp far left, a cold window far right */}
				<rect x={-1400} y={-900} width={4700} height={2900} fill="#0b0807" />
				<g filter="url(#b12)" opacity={L}>
					<circle cx={-120} cy={60} r={520} fill="url(#warmGlow)" opacity={0.8} />
					<rect x={1700} y={-200} width={420} height={640} fill="#18233a" />
					{[[-60, 420, 34], [1880, 520, 22], [2000, 260, 30], [120, 700, 18]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#ffcf8a" opacity={0.22} />)}
				</g>
				{/* the table */}
				<polygon points="-1400,930 3300,930 3300,2000 -1400,2000" fill="url(#tableP)" />
				<polygon points="-1400,930 3300,930 3300,2000 -1400,2000" fill="url(#m-walnut)" filter="url(#wood)" opacity={0.25} />
				<ellipse cx={300} cy={1000} rx={700} ry={60} fill="#ffd9a0" opacity={0.08 * L} filter="url(#b12)" />
				{/* the lid, standing open behind */}
				<polygon points={`${lid.bl.join(',')} ${lid.br.join(',')} ${lid.tr.join(',')} ${lid.tl.join(',')}`} fill="#3d2616" />
				<polygon points={`${lid.bl.join(',')} ${lid.br.join(',')} ${lid.tr.join(',')} ${lid.tl.join(',')}`} fill="url(#m-walnut)" filter="url(#wood)" opacity={0.8} />
				<polygon points={`${lid.tl[0]},${lid.tl[1]} ${lid.tr[0]},${lid.tr[1]} ${lid.tr[0] + 14},${lid.tr[1] - 22} ${lid.tl[0] + 14},${lid.tl[1] - 22}`} fill="#5a3a22" />
				<polygon points="470,455 1330,455 1302,-36 498,-36" fill="url(#velW)" />
				<polygon points="470,455 1330,455 1302,-36 498,-36" fill="#5a0f18" filter="url(#felt)" opacity={0.5} />
				<polygon points="470,455 1330,455 1302,-36 498,-36" fill="none" stroke="#d7b46a" strokeWidth={3} opacity={0.55} />
				<polygon points="486,442 1314,442 1288,-22 512,-22" fill="none" stroke="#d7b46a" strokeWidth={1.2} opacity={0.4} />
				{[[498, -36], [1302, -36], [470, 455], [1330, 455]].map(([cx, cy], i) => <path key={i} d={`M${cx - 14},${cy} Q${cx},${cy - 14} ${cx + 14},${cy} Q${cx},${cy + 14} ${cx - 14},${cy} Z`} fill="#d7b46a" opacity={0.55} />)}
				{/* arched mirror in a gilt frame */}
				<path d={arch(600, 1200, 420, 30)} fill="#6e5226" />
				<path d={arch(612, 1188, 410, 42)} fill="url(#brassP)" />
				<path d={arch(626, 1174, 398, 56)} fill="url(#mirP)" />
				<g opacity={0.5 * L}><ellipse cx={760} cy={170} rx={180} ry={90} fill="url(#warmGlow)" filter="url(#b6)" />
					{[0, 1, 2].map((j) => <rect key={j} x={680 + j * 170} y={260} width={120} height={80} rx={6} fill="#ffcf8a" opacity={0.12} filter="url(#b6)" />)}</g>
				<path d="M700,70 L880,398 M780,62 L930,330" stroke="#fff" strokeWidth={16} opacity={0.04} />
				<path d={arch(626, 1174, 398, 56)} fill="none" stroke="#2a1d0c" strokeWidth={2} />
				{/* hinges */}
				{[560, 1240].map((hx) => <g key={hx}><rect x={hx - 30} y={456} width={60} height={20} rx={4} fill="url(#brassP)" /><line x1={hx - 30} y1={466} x2={hx + 30} y2={466} stroke="#5b4420" strokeWidth={2} /></g>)}
				{/* the box: rim, inner velvet walls, deck */}
				<polygon points="430,470 1370,470 1530,800 270,800" fill="#2e1d11" />
				<polygon points="430,470 1370,470 1530,800 270,800" fill="url(#m-walnut)" filter="url(#wood)" />
				<polygon points="452,482 1348,482 1500,786 300,786" fill="url(#velW)" />
				<polygon points="470,520 1330,520 1470,770 330,770" fill="url(#velD)" />
				<polygon points="470,520 1330,520 1470,770 330,770" fill="#6a1420" filter="url(#felt)" opacity={0.45} />
				{/* velvet pleats on the inner walls */}
				{Array.from({length: 20}, (_, j) => { const u = j / 19; const x0 = 452 + (1348 - 452) * u, x1 = 470 + (1330 - 470) * u; return <line key={j} x1={x0} y1={484} x2={x1} y2={520} stroke="#000" strokeWidth={6} opacity={0.18} />; })}
				<line x1={430} y1={470} x2={1370} y2={470} stroke="#e4c27e" strokeWidth={2.5} opacity={0.5} />
				<line x1={270} y1={800} x2={1530} y2={800} stroke="#e4c27e" strokeWidth={3} opacity={0.6} />
				{/* the movement, under glass on the right: spring barrel, pinned cylinder, steel comb, the little fly-fan */}
				<polygon points="1050,540 1316,540 1420,756 1080,756" fill="#120a06" />
				<polygon points="1050,540 1316,540 1420,756 1080,756" fill="none" stroke="#d7b46a" strokeWidth={3} opacity={0.6} />
				<g opacity={0.35 + 0.65 * L}>
					<ellipse cx={1130} cy={600} rx={56} ry={30} fill="#3a2a12" /><ellipse cx={1130} cy={594} rx={56} ry={30} fill="url(#brassD)" />
					<path d={Array.from({length: 40}, (_, j) => { const a = j * 0.45 + keyA * 0.02, r = 6 + j * 1.1; return `${j ? 'L' : 'M'}${1130 + r * Math.cos(a)},${594 + r * 0.53 * Math.sin(a)}`; }).join(' ')} fill="none" stroke="#4a3618" strokeWidth={1.4} opacity={0.7} />
					<rect x={1100} y={650} width={290} height={54} rx={26} fill="url(#cylP)" />
					{Array.from({length: 84}, (_, j) => { const col = j % 21, row = Math.floor(j / 21); const ph = (row * 0.27 + col * 0.137 + theta / 70) % 1; return <circle key={j} cx={1114 + col * 13.2} cy={652 + ph * 50} r={1.8} fill="#fff6d8" opacity={Math.sin(ph * Math.PI) * 0.95} />; })}
					<rect x={1086} y={656} width={16} height={40} rx={3} fill="#4a3618" /><rect x={1388} y={656} width={16} height={40} rx={3} fill="#4a3618" />
					<rect x={1098} y={716} width={300} height={20} fill="url(#steelP)" />
					{Array.from({length: 30}, (_, j) => <rect key={j} x={1102 + j * 9.8} y={700 - (j % 7) * 0.8} width={6} height={20 + (j % 7) * 0.8} fill="url(#steelP)" />)}
					{[1140, 1260, 1370].map((sx) => <circle key={sx} cx={sx} cy={726} r={3.4} fill="#4a4f56" />)}
					<g transform={`translate(1290,598)`}>
						<rect x={-2} y={-24} width={4} height={30} fill="#8a8f96" />
						<ellipse cx={0} cy={-22} rx={30 * Math.abs(Math.cos(rad(theta * 9)))} ry={12} fill="#c9ced4" opacity={0.85} />
						<ellipse cx={0} cy={-22} rx={30} ry={12} fill="#c9ced4" opacity={0.12} />
					</g>
				</g>
				<polygon points="1050,540 1316,540 1420,756 1080,756" fill="#cfe0f5" opacity={0.05} />
				<polygon points="1090,540 1150,540 1220,756 1160,756" fill="#fff" opacity={0.06} />
				{/* the brass plate */}
				<ellipse cx={MBP.cx + 4} cy={MBP.cy + 30} rx={MBP.rx + 14} ry={MBP.ry + 18} fill="#000" opacity={0.6} filter="url(#b6)" />
				<ellipse cx={MBP.cx} cy={MBP.cy + 16} rx={MBP.rx} ry={MBP.ry} fill="#4a3618" />
				<ellipse cx={MBP.cx} cy={MBP.cy} rx={MBP.rx} ry={MBP.ry} fill="url(#brassD)" />
				{[0.2, 0.36, 0.52, 0.68, 0.84].map((q) => <ellipse key={q} cx={MBP.cx} cy={MBP.cy} rx={MBP.rx * q} ry={MBP.ry * q} fill="none" stroke="#5b4420" strokeWidth={1} opacity={0.35} />)}
				<ellipse cx={MBP.cx} cy={MBP.cy} rx={MBP.rx * 0.94} ry={MBP.ry * 0.94} fill="none" stroke="#f6e2a6" strokeWidth={1.5} opacity={0.5} />
				{Array.from({length: 72}, (_, j) => { const a = rad(j * 5 - theta); if (Math.cos(a) < -0.2) return null; return <line key={j} x1={MBP.cx + MBP.rx * 0.985 * Math.sin(a)} y1={MBP.cy + MBP.ry * 0.985 * Math.cos(a)} x2={MBP.cx + MBP.rx * (j % 6 ? 0.955 : 0.93) * Math.sin(a)} y2={MBP.cy + MBP.ry * (j % 6 ? 0.955 : 0.93) * Math.cos(a)} stroke="#4a3618" strokeWidth={j % 6 ? 1.2 : 2.4} opacity={0.6} />; })}
				<ellipse cx={MBP.cx - 90} cy={MBP.cy - 30} rx={170} ry={26} fill="#fff4d0" opacity={0.3 * L} filter="url(#b6)" />
				<g transform={`translate(${MBP.cx},${MBP.cy})`}><ellipse cx={0} cy={4} rx={24} ry={8} fill="#3a2a12" /><rect x={-7} y={-40} width={14} height={44} fill="url(#cylP)" /><circle cx={0} cy={-46} r={10} fill="url(#brassD)" /></g>
			</svg>
			{/* the display boxes, back to front */}
			{boxes.map(({s, i, b}) => {
				if (b.front < -0.35) return null;
				const isFront = b.front > 0.97;
				const lit = (spot > 0 && !isFront ? 1 - spot * 0.85 : 1) * (isFront ? 1 : L);
				return <div key={s.id} style={{position: 'absolute', inset: 0, opacity: cl01((b.front + 0.35) * 2.5)}}>
					<DisplayBox b={b} id={s.id} q={s.q} i={i} t={T} lit={lit} blur={blur * (0.6 + 0.4 * b.front)} swing={swing} stop={s.id === 'run' ? -1 : stop} headLift={headLift} />
				</div>;
			})}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				{/* front face: inlay, brass corners, escutcheon, the wind-up key */}
				<polygon points="270,800 1530,800 1530,1010 270,1010" fill="#2e1d11" />
				<polygon points="270,800 1530,800 1530,1010 270,1010" fill="url(#m-walnut)" filter="url(#wood)" />
				<rect x={300} y={826} width={1200} height={158} fill="none" stroke="#d7b46a" strokeWidth={2} opacity={0.5} />
				<rect x={312} y={838} width={1176} height={134} fill="none" stroke="#d7b46a" strokeWidth={1} opacity={0.3} />
				{[[270, 800, 1], [1530, 800, -1], [270, 1010, 1], [1530, 1010, -1]].map(([cx, cy, sx], i) => <path key={i} d={`M${cx},${cy} l${sx * 46},0 l${-sx * 46},${cy > 900 ? -46 : 46} Z`} fill="url(#brassP)" opacity={0.95} />)}
				<g transform="translate(900,905)">
					<path d="M0,-50 C34,-50 40,-20 30,0 C40,20 34,50 0,50 C-34,50 -40,20 -30,0 C-40,-20 -34,-50 0,-50 Z" fill="url(#brassP)" stroke="#5b4420" strokeWidth={2} />
					<circle cx={0} cy={-10} r={9} fill="#120a04" /><path d="M-5,-4 L5,-4 L8,22 L-8,22 Z" fill="#120a04" />
				</g>
				{[[320, 1012], [1480, 1012]].map(([fx, fy], i) => <ellipse key={i} cx={fx} cy={fy + 6} rx={36} ry={10} fill="url(#brassP)" />)}
				<g opacity={0.12}><polygon points="270,1016 1530,1016 1530,1110 270,1110" fill="url(#m-walnut)" filter="url(#b6)" /></g>
				<g transform="translate(1440,905)">
					<circle r={22} fill="#3a2a12" /><circle r={16} fill="url(#brassD)" />
					<g transform={`rotate(${keyA})`}>
						<rect x={-6} y={-26} width={12} height={26} fill="url(#cylP)" />
						<path d="M0,-24 C-36,-40 -78,-72 -74,-108 C-70,-132 -30,-128 -8,-96 C-2,-86 0,-60 0,-24 C0,-60 2,-86 8,-96 C30,-128 70,-132 74,-108 C78,-72 36,-40 0,-24 Z" fill="url(#brassP)" stroke="#5b4420" strokeWidth={2.5} />
						<path d="M-40,-96 C-36,-110 -22,-112 -16,-100 M40,-96 C36,-110 22,-112 16,-100" stroke="#fff4d0" strokeWidth={3} fill="none" opacity={0.5} />
					</g>
				</g>
				{/* lamp light raking across from the left */}
				<polygon points="-600,-400 500,-400 1700,1100 -600,1100" fill="#ffd9a0" opacity={0.04 * L} filter="url(#b12)" />
			</svg>
		</div>
	);
};

/** camera over the music-box world */
type Cam = {s: number; c: Pt; shake?: number};
const S_IN = W / DW;                                                          // a display box's opening filling the screen
const camLerp = (a: Cam, b: Cam, e: number): Cam => ({s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e), c: [a.c[0] + (b.c[0] - a.c[0]) * e, a.c[1] + (b.c[1] - a.c[1]) * e]});
/** a zoom through scale keeps the target fixed in screen space at high scale: blend centres by how far in we are */
const camZoom = (from: Cam, to: Cam, e: number): Cam => {
	const s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e);
	const w = (1 / s - 1 / from.s) / (1 / to.s - 1 / from.s || 1);
	return {s, c: [from.c[0] + (to.c[0] - from.c[0]) * w, from.c[1] + (to.c[1] - from.c[1]) * w]};
};
const easeIO5 = (u: number) => { const v = cl01(u); return v < 0.5 ? 16 * v ** 5 : 1 - Math.pow(-2 * v + 2, 5) / 2; };

const Open6: React.FC = () => {
	useFonts();
	const T = useCurrentFrame() / FPS;
	const sub = (a: number, b: number, s: string) => (T >= a && T < b ? <AbsoluteFill style={{opacity: Math.min(1, (T - a) / 0.2, (b - T) / 0.2)}}><Sub t={s} /></AbsoluteFill> : null);
	const front0 = openingC(boxAt(0, 0));
	const MID: Cam = {s: 2.15, c: [700, 596]};
	const WIDE: Cam = {s: 1.0, c: [900, 520]};
	const IN: Cam = {s: S_IN, c: front0};
	const PULL0 = bt(5), PULL1 = bt(7) - 0.05, DIVE0 = bt(25) + 0.1, DIVE1 = bt(26);
	const theta = mbTheta(T);
	const om = Math.abs(mbTheta(T + 1 / 60) - mbTheta(T - 1 / 60)) * 30;      // deg/s
	let pic: React.ReactNode = null, cam: Cam = WIDE, worldBlur = 0;
	const lift = T < bt(22) ? 6 : 6 + 30 * easeIO5((T - bt(22.6)) / 1.6);       // 然后呢: the little commuter slowly looks up
	if (T < PULL0) pic = <S1b t={T} crowd sub="" headLift={6 * ease(cl01((T - 0.3) / 1.4))} />;
	else if (T < DIVE1) {
		if (T < PULL1) { const e = easeIO5((T - PULL0) / (PULL1 - PULL0)); cam = camZoom(IN, MID, e); worldBlur = 3 * Math.sin(Math.PI * e); }
		else if (T < bt(19)) { const u = (T - PULL1) / (bt(19) - PULL1); const beat = MB_TICKS.reduce((m, tk) => (T >= tk ? T - tk : m), 9); const push = 0.06 * Math.exp(-beat * 3) * (1 - Math.exp(-beat * 30)); cam = {s: MID.s * (1 - 0.28 * ease(u)) * (1 + push), c: [MID.c[0] + 60 * ease(u), MID.c[1] - 20 * ease(u)]}; }
		else if (T < bt(22)) { const u = (T - bt(19)) / (bt(22) - bt(19)); const a: Cam = {s: MID.s * 0.72, c: [760, 576]}; cam = camLerp(a, WIDE, easeIO5(u * 1.1)); cam.shake = Math.min(1, om / 500) * 6; }
		else if (T < DIVE0) { const u = (T - bt(22)) / (DIVE0 - bt(22)); cam = camLerp(WIDE, {s: 2.6, c: front0}, easeIO5(u)); }
		else { const e = Math.pow(cl01((T - DIVE0) / (DIVE1 - DIVE0)), 2.4); cam = camZoom({s: 2.6, c: front0}, IN, e); worldBlur = 4 * e * (1 - e) * 4; }
		const dark = T < bt(22) ? 0 : easeIO5((T - bt(22)) / 0.9);
		const blur = Math.min(5, om / 140);
		const sh = cam.shake ?? 0;
		const tx = W / 2 - cam.s * cam.c[0] + sh * Math.sin(T * 47), ty = H / 2 - cam.s * cam.c[1] + sh * Math.cos(T * 39);
		pic = (
			<AbsoluteFill style={{background: '#0b0807', overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${tx}px,${ty}px) scale(${cam.s})`, transformOrigin: '0 0', filter: worldBlur > 0.3 ? `blur(${worldBlur}px)` : undefined}}>
					<MusicBox6 T={T} theta={theta} dark={dark} spot={dark} headLift={lift} stop={-1} blur={blur} swing={mbSwing(T)} />
				</div>
				{dark > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse 34% 42% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.7 * dark}) 100%)`}} />}
				<Grade />
				<Mark />
			</AbsoluteFill>
		);
	}
	else if (T < bt(29)) { const u = (T - bt(26)) / (bt(29) - bt(26)); pic = <S1b t={T} crowd spin={6 * ease(u)} headLift={36 - 46 * easeIO5(cl01((u - 0.1) * 1.6))} sub="" />; }
	else pic = <V2Hill t={T - bt(29)} header="" plankY={T < T_DRUM - 0.5 ? -320 : T < T_DRUM ? -320 + 620 * Math.pow((T - (T_DRUM - 0.5)) / 0.5, 2) : 300 - 26 * Math.exp(-5 * (T - T_DRUM)) * Math.cos(16 * (T - T_DRUM))} />;
	// a jolt on the strings just before the cut to the hill
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{pic}
			{T >= bt(29) - 0.12 && T < bt(29) + 0.05 && <AbsoluteFill style={{background: '#000'}} />}
			{sub(0.5, bt(5) - 0.05, '为什么挤地铁？')}
			{sub(bt(22) + 0.6, bt(25) + 0.05, '然后呢？')}
			{sub(bt(26) + 0.15, bt(29) - 0.15, '第二天，再来一遍')}
			{sub(bt(29) + 0.15, T_DRUM - 0.1, '有个人，这样过了永远')}
			{sub(T_DRUM + 0.9, T_DRUM + 3.6, '可有位哲学家说：他是幸福的')}
		</AbsoluteFill>
	);
};

// ================================================================== v7 · an old CRT television: every "why" is a channel; flipping faster and faster
const TVS = {x: 640, y: 300, w: 540, h: 405};                               // the screen (4:3), world coordinates
const TV_C: Pt = [TVS.x + TVS.w / 2, TVS.y + TVS.h / 2];
const CH_ORDER = [1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 0];       // index into STATIONS
const TV_FLIPS = [7, 9, 11, 13, 14, 15, 16, 17, 18, 19, 19.5, 20, 20.5, 21, 21.25, 21.5, 21.75].map(bt);
const TV_OFF = bt(22);
/** which channel is on and how long since the last flip */
const tvChannel = (T: number) => { let n = 0, since = 99; TV_FLIPS.forEach((tf, k) => { if (T >= tf) { n = k + 1; since = T - tf; } }); return {ch: n === 0 ? 0 : CH_ORDER[n - 1], n, since}; };
const CH_GLOW: Record<StationId, string> = {metro: '#9fc0e8', cross: '#d0605a', desk: '#c9d8ee', home: '#e8b878', run: '#e89a6a', night: '#8fa8d8'};

/** analogue snow: per-frame noise */
const Snow: React.FC<{w: number; h: number; seed: number; o?: number; id: string}> = ({w, h, seed, o = 1, id}) => (
	<svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: o}}>
		<filter id={id} x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9 0.55" numOctaves={1} seed={seed} result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.8 1.8 1.8 0 -2.1" result="a" />
			<feFlood floodColor="#e6ecf2" /><feComposite in2="a" operator="in" />
		</filter>
		<rect width={w} height={h} fill="#0b0d10" />
		<rect width={w} height={h} filter={`url(#${id})`} />
		{Array.from({length: 5}, (_, k) => { const R = rnd2(seed * 13 + k); return <rect key={k} y={R() * h} width={w} height={2 + R() * h * 0.04} fill="#fff" opacity={0.08 + 0.12 * R()} />; })}
	</svg>
);

/** what's on the screen: a channel's picture (full 1920×1080 scene, fitted), rolling/tearing after a flip */
const ScreenContent: React.FC<{T: number; ch: number; fit: number; headLift: number}> = ({T, ch, fit, headLift}) => {
	const id = STATIONS[ch].id;
	const scW = TVS.w / W, scH = TVS.h / H, sc = scW + (scH - scW) * fit;
	const ox = (TVS.w - W * sc) / 2, oy = (TVS.h - H * sc) / 2;
	return (
		<div style={{position: 'absolute', left: ox, top: oy, width: W, height: H, transform: `scale(${sc})`, transformOrigin: '0 0'}}>
			{id === 'metro' ? <S1b t={T} crowd sub="" headLift={headLift} bare /> : <DioScene id={id} t={T} i={ch} />}
		</div>
	);
};

/** the set, the stand and the room — in world coordinates */
const TVRoom: React.FC<{T: number; ch: number; since: number; nFlip: number; fit: number; headLift: number; power: number; staticAll: number; glowO: number; scanO: number}> = ({T, ch, since, nFlip, fit, headLift, power, staticAll, glowO, scanO}) => {
	const f = useCurrentFrame();
	const glow = staticAll > 0.5 ? '#c8d2dc' : CH_GLOW[STATIONS[ch].id];
	const flick = 0.85 + 0.15 * Math.sin(T * 37) * Math.sin(T * 23);
	// flip transient: snow, a roll, tear bands, a flash
	const fs = since < 0.12 ? 1 : since < 0.34 ? 1 - (since - 0.12) / 0.22 : 0;
	const roll = since < 0.38 ? (1 - easeIO5(since / 0.38)) * TVS.h * 0.55 : 0;
	const tear = since < 0.3 ? (1 - since / 0.3) : 0;
	// power-off collapse: picture squeezes to a bright line, then to a dot, then the dot fades
	const offU = power < 1 ? 1 - power : 0;
	const sy = offU <= 0 ? 1 : Math.max(0.006, 1 - offU / 0.25), sx = offU <= 0.25 ? 1 : Math.max(0.012, 1 - (offU - 0.25) / 0.15);
	const dotO = offU < 0.4 ? 1 : Math.max(0, 1 - (offU - 0.4) / 0.6);
	const lightO = (power >= 1 ? 1 : offU < 0.25 ? 1 : Math.max(0, dotO * 0.35)) * glowO;
	const dialA = nFlip * 30 + (since < 0.18 ? -8 * (1 - since / 0.18) : 0);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<Defs />
				<linearGradient id="tvChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f4f6" /><stop offset="0.5" stopColor="#8d949c" /><stop offset="1" stopColor="#3c4148" /></linearGradient>
				<radialGradient id="tvKnob" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#5a5a58" /><stop offset="0.6" stopColor="#262624" /><stop offset="1" stopColor="#0c0c0b" /></radialGradient>
				<radialGradient id="tvGlowR" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={glow} stopOpacity="0.55" /><stop offset="0.5" stopColor={glow} stopOpacity="0.14" /><stop offset="1" stopColor={glow} stopOpacity="0" /></radialGradient>
				<pattern id="damask" width="90" height="120" patternUnits="userSpaceOnUse"><rect width="90" height="120" fill="#141a1a" /><path d="M45,10 C60,30 60,50 45,60 C30,50 30,30 45,10 Z M45,70 C55,85 55,100 45,110 C35,100 35,85 45,70 Z M0,60 C10,70 10,80 0,90 M90,60 C80,70 80,80 90,90" fill="#1b2322" /></pattern>
				{/* the room: patterned wallpaper, a skirting board, a wooden floor; a curtained window at left */}
				<rect x={-1400} y={-900} width={4700} height={1880} fill="url(#damask)" />
				<rect x={-1400} y={-900} width={4700} height={1880} fill="#000" opacity={0.55} />
				<g transform="translate(-60,-120)">
					<rect x={0} y={0} width={360} height={560} fill="#0d1526" /><rect x={0} y={0} width={360} height={560} fill="none" stroke="#2a221c" strokeWidth={22} />
					<line x1={180} y1={0} x2={180} y2={560} stroke="#2a221c" strokeWidth={14} /><line x1={0} y1={280} x2={360} y2={280} stroke="#2a221c" strokeWidth={14} />
					<circle cx={280} cy={110} r={26} fill="#dfe6f0" opacity={0.6} filter="url(#b3)" />
					<path d="M-40,-30 Q10,260 -20,600 L70,600 Q40,260 90,-30 Z M300,-30 Q350,260 320,600 L410,600 Q380,260 430,-30 Z" fill="#3a1e22" />
					<polygon points="0,560 360,560 700,1000 120,1000" fill="#9fb6d8" opacity={0.05} filter="url(#b12)" />
				</g>
				<rect x={-1400} y={960} width={4700} height={22} fill="#20160f" />
				<polygon points="-1400,982 3300,982 3300,2000 -1400,2000" fill="#1a110b" />
				<polygon points="-1400,982 3300,982 3300,2000 -1400,2000" fill="url(#m-walnut)" filter="url(#wood)" opacity={0.35} />
				{/* TV light on the wall and floor */}
				<ellipse cx={TV_C[0]} cy={TV_C[1] - 40} rx={900} ry={620} fill="url(#tvGlowR)" opacity={0.9 * lightO * flick} />
				<ellipse cx={TV_C[0] - 40} cy={1060} rx={700} ry={120} fill={glow} opacity={0.12 * lightO * flick} filter="url(#b12)" />
				{/* the stand */}
				<rect x={520} y={812} width={940} height={40} rx={6} fill="url(#m-walnut)" filter="url(#wood)" />
				<rect x={520} y={812} width={940} height={6} fill="#c9a067" opacity={0.4} />
				{[[560, 1], [1420, -1]].map(([lx, d], i) => <polygon key={i} points={`${lx - 14},852 ${lx + 14},852 ${lx + 8 + d * 18},988 ${lx - 4 + d * 18},988`} fill="#2a1a10" />)}
				<rect x={540} y={852} width={900} height={12} fill="#000" opacity={0.4} />
				{/* the cabinet: walnut veneer, a rounded box with a visible right side */}
				<polygon points="1440,236 1478,212 1478,796 1440,812" fill="#24160d" />
				<polygon points="562,236 1440,236 1478,212 600,212" fill="#6b4a30" />
				<polygon points="562,236 1440,236 1478,212 600,212" fill="url(#m-walnut)" filter="url(#wood)" opacity={0.6} />
				<rect x={548} y={230} width={900} height={584} rx={30} fill="#3d2616" />
				<rect x={548} y={230} width={900} height={584} rx={30} fill="url(#m-walnut)" filter="url(#wood)" opacity={0.85} />
				<rect x={556} y={238} width={884} height={568} rx={26} fill="none" stroke="#c9a067" strokeWidth={1.5} opacity={0.35} />
				{/* screen bezel: dark plastic with a chrome ring */}
				<rect x={600} y={262} width={620} height={482} rx={40} fill="#17181a" />
				<rect x={TVS.x - 16} y={TVS.y - 16} width={TVS.w + 32} height={TVS.h + 32} rx={44} fill="url(#tvChrome)" opacity={0.9} />
				<rect x={TVS.x - 8} y={TVS.y - 8} width={TVS.w + 16} height={TVS.h + 16} rx={38} fill="#060708" />
				{/* control panel: channel dial, volume, power, speaker */}
				<rect x={1246} y={262} width={170} height={482} rx={14} fill="#1f1d1a" />
				<g transform="translate(1331,350)">
					<circle r={58} fill="#0d0d0c" />
					{Array.from({length: 12}, (_, k) => { const a = rad(k * 30); return <text key={k} x={48 * Math.sin(a)} y={-48 * Math.cos(a) + 5} textAnchor="middle" style={{fontFamily: '"DejaVu Sans", sans-serif', fontSize: 12, fontWeight: 700}} fill="#cfc6b4" opacity={0.8}>{k + 1}</text>; })}
					<g transform={`rotate(${dialA})`}>
						<circle r={36} fill="url(#tvKnob)" /><rect x={-7} y={-36} width={14} height={72} rx={5} fill="#3a3a38" /><rect x={-2} y={-34} width={4} height={12} fill="#e8e0cc" />
					</g>
				</g>
				<g transform="translate(1331,470)"><circle r={26} fill="url(#tvKnob)" /><rect x={-1.5} y={-24} width={3} height={10} fill="#e8e0cc" transform="rotate(-40)" /></g>
				<g transform="translate(1290,530)"><rect x={-12} y={-8} width={24} height={16} rx={3} fill="#b9b2a2" /><circle cx={40} cy={0} r={5} fill={power >= 1 ? '#ff4a3d' : '#3a1210'} /></g>
				{Array.from({length: 11}, (_, k) => <rect key={k} x={1262} y={566 + k * 15} width={138} height={7} rx={3} fill="#0c0b0a" />)}
				<rect x={1282} y={752} width={100} height={22} rx={3} fill="url(#brassP)" opacity={0.85} />
				<text x={1332} y={768} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 15, letterSpacing: '0.3em'}} fill="#3a2a10">JUNO</text>
				{/* rabbit-ear antenna */}
				<g transform="translate(1000,214)">
					<ellipse cx={0} cy={0} rx={70} ry={16} fill="#1a1a1a" /><ellipse cx={0} cy={-6} rx={56} ry={12} fill="url(#tvChrome)" opacity={0.6} />
					<line x1={-10} y1={-8} x2={-260} y2={-430} stroke="url(#tvChrome)" strokeWidth={5} /><circle cx={-260} cy={-430} r={6} fill="#c9ced4" />
					<line x1={10} y1={-8} x2={190} y2={-460} stroke="url(#tvChrome)" strokeWidth={5} /><circle cx={190} cy={-460} r={6} fill="#c9ced4" />
				</g>
			</svg>
			{/* the picture tube */}
			<div style={{position: 'absolute', left: TVS.x, top: TVS.y, width: TVS.w, height: TVS.h, borderRadius: '34px / 40px', overflow: 'hidden', background: '#050607'}}>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${sx},${sy})`, filter: offU > 0 ? `brightness(${1 + 3 * Math.min(1, offU * 4)})` : since < 0.25 ? `brightness(${1 + 0.6 * (1 - since / 0.25)})` : undefined}}>
					{staticAll < 1 && offU < 0.42 && <div style={{position: 'absolute', inset: 0, transform: `translateY(${roll}px)`}}>
						<ScreenContent T={T} ch={ch} fit={fit} headLift={headLift} />
						{roll > 1 && <div style={{position: 'absolute', left: 0, right: 0, top: -TVS.h * 0.08, height: TVS.h * 0.08, background: '#000'}} />}
					</div>}
					{tear > 0 && [0.22, 0.51, 0.77].map((y, k) => <div key={k} style={{position: 'absolute', left: 0, right: 0, top: `${y * 100}%`, height: 10 + k * 6, backdropFilter: `blur(${2 * tear}px)`, transform: `translateX(${(k % 2 ? -1 : 1) * 40 * tear}px)`, background: `rgba(255,255,255,${0.12 * tear})`}} />)}
					{(fs > 0 || staticAll > 0) && <Snow w={TVS.w} h={TVS.h} seed={f % 97} o={Math.max(fs, staticAll)} id="snowTV" />}
				</div>
				{offU > 0.25 && <div style={{position: 'absolute', left: '50%', top: '50%', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, background: '#f2f6ff', boxShadow: '0 0 24px 10px rgba(220,235,255,0.7)', opacity: dotO}} />}
				{/* scanlines, curvature shading, glass glare */}
				<div style={{position: 'absolute', inset: 0, opacity: scanO, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)'}} />
				<div style={{position: 'absolute', inset: 0, opacity: 0.4 + 0.6 * scanO, background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)'}} />
				<div style={{position: 'absolute', inset: 0, opacity: 0.3 + 0.7 * scanO, background: 'radial-gradient(ellipse 40% 26% at 30% 18%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%)'}} />
				{since < 1.1 && nFlip > 0 && power >= 1 && staticAll < 0.5 && <div style={{position: 'absolute', right: 30, top: 22, fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 30, color: '#7dff8a', textShadow: '0 0 8px rgba(125,255,138,0.8)', opacity: Math.min(1, (1.1 - since) / 0.3)}}>CH {String(ch + 1).padStart(2, '0')}</div>}
			</div>
			{/* foreground: the dark back of an empty armchair, out of focus */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<g filter="url(#b12)"><path d="M-200,1200 L-200,860 Q-180,760 -40,760 L220,760 Q330,770 340,880 L360,1200 Z" fill="#0c0807" /><path d="M-40,760 Q100,720 220,760" stroke={glow} strokeWidth={6} opacity={0.18 * lightO} fill="none" /></g>
			</svg>
		</div>
	);
};

const Open7: React.FC = () => {
	useFonts();
	const T = useCurrentFrame() / FPS;
	const f = useCurrentFrame();
	const sub = (a: number, b: number, s: string) => (T >= a && T < b ? <AbsoluteFill style={{opacity: Math.min(1, (T - a) / 0.15, (b - T) / 0.15)}}><Sub t={s} /></AbsoluteFill> : null);
	const S_TV = W / TVS.w;                                                     // screen width fills the frame
	const IN: Cam = {s: S_TV, c: TV_C};
	const MID: Cam = {s: 1.75, c: [TV_C[0] + 60, TV_C[1] + 10]};
	const WIDE: Cam = {s: 1.12, c: [960, 560]};
	const PULL0 = bt(5), PULL1 = bt(7) - 0.04, DIVE0 = bt(24.5), DIVE1 = bt(25);
	const ST0 = bt(28.5), ST1 = bt(29.6);                                         // signal lost: static, then the hill comes through it
	const {ch, n, since} = tvChannel(T);
	let pic: React.ReactNode = null;
	const room = (cam: Cam, props: Partial<React.ComponentProps<typeof TVRoom>>, blurW = 0) => {
		const sh = cam.shake ?? 0;
		const tx = W / 2 - cam.s * cam.c[0] + sh * Math.sin(T * 53), ty = H / 2 - cam.s * cam.c[1] + sh * Math.cos(T * 41);
		return (
			<AbsoluteFill style={{background: '#070606', overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${tx}px,${ty}px) scale(${cam.s})`, transformOrigin: '0 0', filter: blurW > 0.3 ? `blur(${blurW}px)` : undefined}}>
					<TVRoom T={T} ch={ch} since={since} nFlip={n} fit={1} headLift={6} power={1} staticAll={0} glowO={1} scanO={1} {...props} />
				</div>
				<Grade />
				<Mark />
			</AbsoluteFill>
		);
	};
	if (T < PULL0) pic = <S1b t={T} crowd sub="" headLift={6 * ease(cl01((T - 0.3) / 1.4))} />;
	else if (T < PULL1) {                                                       // pull back: the platform is a picture on an old set
		const e = easeIO5((T - PULL0) / (PULL1 - PULL0));
		pic = room(camZoom(IN, MID, e), {fit: e, scanO: e, glowO: e}, 2.5 * Math.sin(Math.PI * e));
	}
	else if (T < TV_OFF) {                                                      // flipping: closer and shakier as it speeds up
		const u = cl01((T - bt(7)) / (TV_OFF - bt(7)));
		const kick = since < 0.25 ? 0.035 * (1 - since / 0.25) : 0;
		const fast = T > bt(19) ? cl01((T - bt(19)) / (TV_OFF - bt(19))) : 0;
		pic = room({s: MID.s * (1 + 0.32 * Math.pow(u, 2)) * (1 + kick), c: [MID.c[0] - 50 * u, MID.c[1]], shake: 5 * fast}, {});
	}
	else if (T < DIVE0) {                                                       // 然后呢？ — the set switches off; the room goes dark; the dot lingers
		const offU = cl01((T - TV_OFF) / 1.6);
		const u = easeIO5((T - TV_OFF) / (DIVE0 - TV_OFF));
		pic = room(camLerp(MID, WIDE, u), {power: 1 - offU});
	}
	else if (T < DIVE1) {                                                       // back in, through the dark glass
		const e = Math.pow(cl01((T - DIVE0) / (DIVE1 - DIVE0)), 2.2);
		pic = room(camZoom(WIDE, IN, e), {power: 0, ch: 0}, 3 * e * (1 - e) * 4);
	}
	else if (T < ST0) {                                                         // power on: 第二天，再来一遍
		const u = (T - DIVE1) / (ST0 - DIVE1), on = cl01((T - DIVE1) / 0.28);
		const sy = on < 0.5 ? 0.006 : 0.006 + (1 - 0.006) * easeIO5((on - 0.5) / 0.5), sx = on < 0.5 ? 0.02 + 0.98 * (on / 0.5) : 1;
		pic = <AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `scale(${sx},${sy})`, filter: on < 1 ? `brightness(${1 + 3 * (1 - on)})` : undefined}}><S1b t={T} crowd spin={6 * ease(u)} headLift={34 - 44 * easeIO5(cl01((u - 0.05) * 1.7))} sub="" /></AbsoluteFill>
		</AbsoluteFill>;
		if (T > ST0 - 0.16) pic = <AbsoluteFill style={{transform: `translateY(${(T - (ST0 - 0.16)) * 3000}px)`, filter: 'contrast(1.6)'}}>{pic}</AbsoluteFill>;   // the picture slips…
	}
	else if (T < ST1) {                                                         // …signal lost: the old set full of snow, the camera pushed into it
		const u = (T - ST0) / (ST1 - ST0);
		if (u < 0.55) pic = room(camZoom({s: 1.5, c: TV_C}, IN, easeIO5(u / 0.55)), {staticAll: 1, glowO: 1});
		else pic = <AbsoluteFill style={{background: '#0b0d10'}}><Snow w={W} h={H} seed={f % 97} id="snowF" /><Grade /></AbsoluteFill>;
		if (u > 0.7) {                                                          // the hill comes through the snow, in bands
			const v = (u - 0.7) / 0.3;
			pic = <AbsoluteFill>
				<V2Hill t={T - ST0} header="" plankY={-400} />
				<AbsoluteFill style={{opacity: 1 - easeIO5(v), WebkitMaskImage: `repeating-linear-gradient(0deg, #000 0px, #000 ${6 + 40 * (1 - v)}px, transparent ${6 + 40 * (1 - v)}px, transparent ${8 + 60 * v}px)`}}><Snow w={W} h={H} seed={f % 97} id="snowF2" /></AbsoluteFill>
			</AbsoluteFill>;
		}
	}
	else {                                                                     // the hill; on the drum a shaft of light finds him
		const tb = T - T_DRUM;
		const beam = tb < 0 ? 0 : Math.min(1, tb / 0.06) * (0.92 + 0.08 * Math.exp(-tb * 3) * Math.cos(tb * 40));
		const PL = bt(34);
		pic = <V2Hill t={T - ST0} header="" beam={beam} plankY={T < PL - 0.5 ? -400 : T < PL ? -400 + 700 * Math.pow((T - (PL - 0.5)) / 0.5, 2) : 300 - 26 * Math.exp(-5 * (T - PL)) * Math.cos(16 * (T - PL))} />;
		if (tb >= 0 && tb < 0.12) pic = <AbsoluteFill>{pic}<AbsoluteFill style={{background: '#fff6e0', opacity: 0.35 * (1 - tb / 0.12)}} /></AbsoluteFill>;
	}
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{pic}
			{sub(0.5, bt(5) - 0.05, '为什么挤地铁？')}
			{sub(bt(7) + 0.05, bt(9) - 0.08, '为什么上班？')}
			{sub(bt(9) + 0.05, bt(11) - 0.08, '为什么加班？')}
			{sub(bt(11) + 0.05, bt(13) - 0.08, '为什么还房贷？')}
			{sub(bt(13) + 0.05, bt(14) - 0.05, '为什么拼命？')}
			{sub(bt(14) + 0.05, bt(15) - 0.05, '为什么熬夜？')}
			{sub(TV_OFF + 0.25, DIVE0, '然后呢？')}
			{sub(DIVE1 + 0.3, ST0 - 0.12, '第二天，再来一遍')}
			{sub(ST1 - 0.05, T_DRUM - 0.08, '有个人，这样过了永远')}
			{sub(T_DRUM + 0.9, T_DRUM + 3.6, '可有位哲学家说：他是幸福的')}
		</AbsoluteFill>
	);
};

// ================================================================== v8 · channel flips → 然后呢 → 第二天 → the clock face becomes the rock → a shaft of light → the title in the sky
const CLOCK_C: Pt = [385.6, 318.4];                                          // the platform clock, screen coordinates in S1b
const ROCK_C: Pt = [690, 480];                                               // the boulder's centre in V2Hill at the start
/** the title, set in the night sky, each character surfacing out of soft focus as the light finds it */
const SkyTitle: React.FC<{T: number; t0: number}> = ({T, t0}) => {
	const lines = [{s: '推石头的人，', c: '#efe4cc', y: 108, size: 78}, {s: '是幸福的', c: '#f4cd7e', y: 200, size: 96}];
	let n = 0;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: 146, top: 62, fontFamily: SERIF, fontSize: 22, letterSpacing: '0.4em', color: 'rgba(239,228,204,0.7)', opacity: cl01((T - t0 - 0.9) / 0.6)}}>加缪《西西弗神话》</div>
			{lines.map((ln, li) => (
				<div key={li} style={{position: 'absolute', left: 140, top: ln.y, fontFamily: SERIF, fontWeight: 900, fontSize: ln.size, letterSpacing: '0.12em', whiteSpace: 'nowrap'}}>
					{[...ln.s].map((ch, k) => {
						const u = cl01((T - t0 - (n++) * 0.07) / 0.55), e = 1 - Math.pow(1 - u, 3);
						return <span key={k} style={{display: 'inline-block', color: ln.c, opacity: e, filter: `blur(${(1 - e) * 10}px)`, transform: `translateY(${(1 - e) * 18}px)`, textShadow: li ? '0 0 28px rgba(244,205,126,0.55), 0 4px 18px rgba(0,0,0,0.8)' : '0 4px 18px rgba(0,0,0,0.8)'}}>{ch}</span>;
					})}
				</div>
			))}
			<div style={{position: 'absolute', left: 146, top: 322, height: 2, width: 420 * (1 - Math.pow(1 - cl01((T - t0 - 0.7) / 0.8), 3)), background: 'linear-gradient(90deg, rgba(244,205,126,0.8), rgba(244,205,126,0))'}} />
		</AbsoluteFill>
	);
};

const Open8: React.FC = () => {
	useFonts();
	const T = useCurrentFrame() / FPS;
	const sub = (a: number, b: number, s: string) => (T >= a && T < b ? <AbsoluteFill style={{opacity: Math.min(1, (T - a) / 0.15, (b - T) / 0.15)}}><Sub t={s} /></AbsoluteFill> : null);
	const S_TV = W / TVS.w;
	const IN: Cam = {s: S_TV, c: TV_C};
	const MID: Cam = {s: 1.75, c: [TV_C[0] + 60, TV_C[1] + 10]};
	const WIDE: Cam = {s: 1.12, c: [960, 560]};
	const PULL0 = bt(5), PULL1 = bt(7) - 0.04, DIVE0 = bt(24.5), DIVE1 = bt(25);
	const MC0 = bt(28), MC1 = bt(29.5), MC2 = bt(31.2);                         // push into the clock … swap … pull out from the rock
	const TITLE = bt(36);
	const {ch, n, since} = tvChannel(T);
	let pic: React.ReactNode = null;
	const room = (cam: Cam, props: Partial<React.ComponentProps<typeof TVRoom>>, blurW = 0) => {
		const sh = cam.shake ?? 0;
		const tx = W / 2 - cam.s * cam.c[0] + sh * Math.sin(T * 53), ty = H / 2 - cam.s * cam.c[1] + sh * Math.cos(T * 41);
		return (
			<AbsoluteFill style={{background: '#070606', overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${tx}px,${ty}px) scale(${cam.s})`, transformOrigin: '0 0', filter: blurW > 0.3 ? `blur(${blurW}px)` : undefined}}>
					<TVRoom T={T} ch={ch} since={since} nFlip={n} fit={1} headLift={6} power={1} staticAll={0} glowO={1} scanO={1} {...props} />
				</div>
				<Grade />
				<Mark />
			</AbsoluteFill>
		);
	};
	/** zoom a full-frame scene about a point, bringing that point to the centre */
	const zoomAt = (node: React.ReactNode, p: Pt, z: number, k: number, blurPx = 0) => (
		<AbsoluteFill style={{transform: `translate(${(W / 2 - p[0]) * k}px,${(H / 2 - p[1]) * k}px) scale(${z})`, transformOrigin: `${p[0]}px ${p[1]}px`, filter: blurPx > 0.3 ? `blur(${blurPx}px)` : undefined}}>{node}</AbsoluteFill>
	);
	const hillPlank = undefined;
	const hill = (beam = 0) => <V2Hill t={T - MC1 + 0.4} header="" beam={beam} plankY={hillPlank} />;
	if (T < PULL0) pic = <S1b t={T} crowd sub="" headLift={6 * ease(cl01((T - 0.3) / 1.4))} />;
	else if (T < PULL1) { const e = easeIO5((T - PULL0) / (PULL1 - PULL0)); pic = room(camZoom(IN, MID, e), {fit: e, scanO: e, glowO: e}, 2.5 * Math.sin(Math.PI * e)); }
	else if (T < TV_OFF) {
		const u = cl01((T - bt(7)) / (TV_OFF - bt(7)));
		const kick = since < 0.25 ? 0.035 * (1 - since / 0.25) : 0;
		const fast = T > bt(19) ? cl01((T - bt(19)) / (TV_OFF - bt(19))) : 0;
		pic = room({s: MID.s * (1 + 0.32 * Math.pow(u, 2)) * (1 + kick), c: [MID.c[0] - 50 * u, MID.c[1]], shake: 5 * fast}, {});
	}
	else if (T < DIVE0) { const offU = cl01((T - TV_OFF) / 1.6); const u = easeIO5((T - TV_OFF) / (DIVE0 - TV_OFF)); pic = room(camLerp(MID, WIDE, u), {power: 1 - offU}); }
	else if (T < DIVE1) { const e = Math.pow(cl01((T - DIVE0) / (DIVE1 - DIVE0)), 2.2); pic = room(camZoom(WIDE, IN, e), {power: 0, ch: 0}, 3 * e * (1 - e) * 4); }
	else if (T < MC1 + 0.14) {
		// 第二天: the set comes back on, the clock starts to spin; then the camera is drawn into the clock face as the hands race
		const u = (T - DIVE1) / (MC0 - DIVE1), on = cl01((T - DIVE1) / 0.28);
		const m = cl01((T - MC0) / (MC1 - MC0)), me = Math.pow(m, 2.6);
		const spin = 3 * ease(cl01(u)) + 14 * Math.pow(m, 2.2);
		const sy = on < 0.5 ? 0.006 : 0.006 + (1 - 0.006) * easeIO5((on - 0.5) / 0.5), sx = on < 0.5 ? 0.02 + 0.98 * (on / 0.5) : 1;
		const plat = <AbsoluteFill style={{background: '#000'}}><AbsoluteFill style={{transform: `scale(${sx},${sy})`, filter: on < 1 ? `brightness(${1 + 3 * (1 - on)})` : undefined}}><S1b t={T} crowd spin={spin} flick={m > 0.3 ? 0.4 + 0.6 * ((Math.floor(T * 30) * 7919) % 3 > 0 ? 1 : 0) : 1} headLift={34 - 44 * easeIO5(cl01((u - 0.05) * 1.7))} sub="" /></AbsoluteFill></AbsoluteFill>;
		pic = m > 0 ? zoomAt(plat, CLOCK_C, 1 + 8.5 * me, me, 6 * me * (1 - me) * 3) : plat;
		if (T > MC1 - 0.14) {                                                  // the clock face and the boulder, one round shape dissolving into the other
			const x = cl01((T - (MC1 - 0.14)) / 0.28);
			pic = <AbsoluteFill>{pic}<AbsoluteFill style={{opacity: x}}>{zoomAt(hill(), ROCK_C, 3.0, 1, 4 * (1 - x))}</AbsoluteFill></AbsoluteFill>;
		}
	}
	else {
		const tb = T - T_DRUM;
		const beam = tb < 0 ? 0 : Math.min(1, tb / 0.06) * (0.92 + 0.08 * Math.exp(-tb * 3) * Math.cos(tb * 40));
		const o = cl01((T - (MC1 + 0.14)) / (MC2 - MC1 - 0.14)), oe = 1 - Math.pow(1 - o, 3);
		pic = o < 1 ? zoomAt(hill(beam), ROCK_C, 3.0 - 2.0 * oe, 1 - oe) : hill(beam);
		if (tb >= 0 && tb < 0.12) pic = <AbsoluteFill>{pic}<AbsoluteFill style={{background: '#fff6e0', opacity: 0.35 * (1 - tb / 0.12)}} /></AbsoluteFill>;
	}
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{pic}
			{T >= TITLE && <SkyTitle T={T} t0={TITLE} />}
			{sub(0.5, bt(5) - 0.05, '为什么挤地铁？')}
			{sub(bt(7) + 0.05, bt(9) - 0.08, '为什么上班？')}
			{sub(bt(9) + 0.05, bt(11) - 0.08, '为什么加班？')}
			{sub(bt(11) + 0.05, bt(13) - 0.08, '为什么还房贷？')}
			{sub(bt(13) + 0.05, bt(14) - 0.05, '为什么拼命？')}
			{sub(bt(14) + 0.05, bt(15) - 0.05, '为什么熬夜？')}
			{sub(TV_OFF + 0.25, DIVE0, '然后呢？')}
			{sub(DIVE1 + 0.3, MC0 + 0.25, '第二天，再来一遍')}
			{sub(MC0 + 0.35, T_DRUM - 0.08, '有个人，这样过了永远')}
			{sub(T_DRUM + 0.45, TITLE - 0.1, '可有位哲学家说：他是幸福的')}
		</AbsoluteFill>
	);
};

const Puppet35: React.FC = () => {
	useFonts();
	const t = useCurrentFrame() / FPS;
	const i = Math.min(9, Math.floor(t / SEG)), u = t - i * SEG;
	const list = [<S1b t={u} />, <S2 />, <S3 />, <S4 />, <S5 />, <S6 t={u} mat={MATS.char} />, <S7 />, <S8 />, <S9 />, <Sheet />];
	return list[i];
};
registerRoot(() => (
	<>
		<Composition id="PUP35" component={Puppet35} durationInFrames={SEG * 10 * FPS} fps={FPS} width={W} height={H} />
		<Composition id="SAMPLE35" component={Sample35} durationInFrames={Math.round(16.5 * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="COVER35" component={() => { useFonts(); return <CoverScene />; }} durationInFrames={1} fps={FPS} width={W} height={H} />
		<Composition id="STY35" component={Style2} durationInFrames={12 * FPS} fps={FPS} width={W} height={H} />
		<Composition id="OPEN35" component={Open35} durationInFrames={Math.round(16.5 * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="CONCEPTS" component={Concepts} durationInFrames={6} fps={FPS} width={W} height={H} />
		<Composition id="OPEN6" component={Open6} durationInFrames={Math.round(20.5 * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="OPEN7" component={Open7} durationInFrames={Math.round(20.5 * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="OPEN8" component={Open8} durationInFrames={Math.round(20.5 * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="OPEN4" component={Open4} durationInFrames={Math.round(20.5 * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="FILM35" component={Film35} durationInFrames={FILM35_FRAMES} fps={FPS} width={W} height={H} />
	</>
));

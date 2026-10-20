import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
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
			<feMorphology in="SourceAlpha" operator="erode" radius="2" result="e" />
			<feOffset in="e" dx="-5" dy="2" result="o" />
			<feComposite in="SourceAlpha" in2="o" operator="out" result="edge" />
			<feFlood floodColor="#ffc58a" floodOpacity="0.9" />
			<feComposite in2="edge" operator="in" result="rim" />
			<feGaussianBlur in="rim" stdDeviation="1" result="rb" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="rb" /></feMerge>
		</filter>
		<filter id="rimC" x="-10%" y="-10%" width="120%" height="120%">
			<feMorphology in="SourceAlpha" operator="erode" radius="1.5" result="e" />
			<feOffset in="e" dx="4" dy="3" result="o" />
			<feComposite in="SourceAlpha" in2="o" operator="out" result="edge" />
			<feFlood floodColor="#bcd0ec" floodOpacity="0.7" />
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
type Pose = {lean?: number; head?: number; armN?: [number, number]; armF?: [number, number]; legN?: [number, number]; legF?: [number, number]; case?: boolean};
const limb = (x: number, y: number, a: number, l: number): [number, number] => { const d = dirv(a, l); return [x + d[0], y + d[1]]; };
type Pt = [number, number];
const Cap: React.FC<{p: Pt; q: Pt; w1: number; w2: number}> = ({p, q, w1, w2}) => {
	const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	const pts = [[p[0] + nx * w1 / 2, p[1] + ny * w1 / 2], [q[0] + nx * w2 / 2, q[1] + ny * w2 / 2], [q[0] - nx * w2 / 2, q[1] - ny * w2 / 2], [p[0] - nx * w1 / 2, p[1] - ny * w1 / 2]];
	const s = nx < 0 ? 1 : -1;                                                            // highlight on the left (key light side)
	return (
		<g filter="url(#woodfine)">
			<polygon points={pts.map((v) => v.join(',')).join(' ')} fill="url(#beech)" />
			<circle cx={p[0]} cy={p[1]} r={w1 / 2} fill="url(#beech)" /><circle cx={q[0]} cy={q[1]} r={w2 / 2} fill="url(#beech)" />
			<line x1={p[0] + s * nx * w1 * 0.22} y1={p[1] + s * ny * w1 * 0.22} x2={q[0] + s * nx * w2 * 0.22} y2={q[1] + s * ny * w2 * 0.22} stroke="#f6e4c4" strokeWidth={Math.min(w1, w2) * 0.16} strokeLinecap="round" opacity={0.55} />
			<line x1={p[0] - s * nx * w1 * 0.38} y1={p[1] - s * ny * w1 * 0.38} x2={q[0] - s * nx * w2 * 0.38} y2={q[1] - s * ny * w2 * 0.38} stroke="#7a5a3c" strokeWidth={Math.min(w1, w2) * 0.12} strokeLinecap="round" opacity={0.35} />
		</g>
	);
};
const Ball: React.FC<{p: Pt; r: number}> = ({p, r}) => (
	<g><circle cx={p[0]} cy={p[1]} r={r} fill="url(#ballG)" /><circle cx={p[0]} cy={p[1]} r={r} fill="none" stroke="#6e4f34" strokeWidth={1} opacity={0.5} /></g>
);
const Mannequin: React.FC<{pose: Pose}> = ({pose}) => {
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
			<path d={`M${l.ank[0] - 12},${l.ank[1] - 2} L${l.ank[0] + 10},${l.ank[1] - 4} L${l.ank[0] + 42},${l.ank[1] + 15} L${l.ank[0] + 42},${l.ank[1] + 22} L${l.ank[0] - 14},${l.ank[1] + 22} Z`} fill="url(#beech)" filter="url(#woodfine)" />
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
		<g>
			<g style={{filter: 'brightness(0.72)'}}><Leg l={lF} /></g>
			<g transform={`rotate(${lean}, 0, -232)`}>
				<g style={{filter: 'brightness(0.72)'}}><Arm a={aF} /></g>
				{/* pelvis, waist ball, ribcage */}
				<path d="M-40,-282 Q0,-292 40,-282 C44,-258 36,-234 22,-220 L0,-212 L-22,-220 C-36,-234 -44,-258 -40,-282 Z" fill="url(#beech)" filter="url(#woodfine)" />
				<Ball p={[-20, -232]} r={13} /><Ball p={[18, -232]} r={13} />
				<ellipse cx={0} cy={-292} rx={25} ry={16} fill="url(#ballG)" />
				<path d="M-46,-400 C-54,-368 -44,-322 -30,-306 Q0,-296 30,-306 C44,-322 54,-368 46,-400 Q0,-414 -46,-400 Z" fill="url(#beech)" filter="url(#woodfine)" />
				<path d="M-30,-306 Q0,-296 30,-306" stroke="#7a5a3c" strokeWidth={1.5} fill="none" opacity={0.5} />
				<Ball p={[-44, -394]} r={14} />
				<g transform={`rotate(${head}, 0, -406)`}>
					<Cap p={[0, -404]} q={[0, -436]} w1={16} w2={14} />
					<ellipse cx={4} cy={-474} rx={31} ry={41} fill="url(#ballG2)" transform="rotate(10, 4, -474)" filter="url(#woodfine)" />
					<ellipse cx={4} cy={-474} rx={31} ry={41} fill="none" stroke="#6e4f34" strokeWidth={1} opacity={0.45} transform="rotate(10, 4, -474)" />
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
		<div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 52, color: INK, letterSpacing: '0.08em', textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>{t}</div>
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
			<ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="#6b4e36" filter="url(#wood)" />
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
const S6: React.FC<{t: number}> = ({t}) => {
	const pose: Pose = {lean: -3, head: -18, armN: [-16, 8], armF: [12, 6], legN: [24, -4], legF: [-18, -14]};
	const px = 880, k = 0.95, py = slopeY(px) + 14;
	const an = strAnchors(pose).map(([x, y]) => [px + x * k, py + y * k] as [number, number]);
	return (
		<AbsoluteFill style={{background: '#1b2029'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1f2633" /><stop offset="0.55" stopColor="#4b5262" /><stop offset="0.8" stopColor="#9a8577" /><stop offset="1" stopColor="#c99a72" />
				</linearGradient>
				<rect width={W} height={H} fill="url(#dusk)" filter="url(#paper)" />
				<circle cx={1560} cy={640} r={520} fill="url(#warmGlow)" opacity={0.85} />
				<circle cx={1560} cy={650} r={46} fill="#ffe2b0" opacity={0.85} filter="url(#b3)" />
				{/* felt clouds */}
				<g filter="url(#b3)">
					{[[300, 180, 1], [700, 120, 0.8], [1250, 220, 1.1], [1640, 150, 0.9]].map(([x, y, s], i) => (
						<g key={i} transform={`translate(${x + t * 6},${y}) scale(${s})`} opacity={0.75}>
							{[[-80, 0, 70], [-10, -24, 86], [70, -4, 64], [0, 16, 90]].map(([dx, dy, r], j) => <ellipse key={j} cx={dx} cy={dy} rx={r} ry={r * 0.55} fill={i % 2 ? '#6c7384' : '#7c8394'} filter="url(#felt)" />)}
							<ellipse cx={30} cy={34} rx={140} ry={16} fill="#d6a983" opacity={0.35} />
						</g>
					))}
				</g>
				{/* cardboard ranges */}
				<path d="M0,640 L140,560 L260,600 L420,520 L560,590 L760,540 L900,610 L1100,560 L1300,620 L1480,580 L1700,640 L1920,600 L1920,1080 L0,1080 Z" fill="#454b59" filter="url(#b1.5)" />
				<path d="M0,700 L200,650 L380,690 L600,640 L820,700 L1040,660 L1280,710 L1520,680 L1760,720 L1920,700 L1920,1080 L0,1080 Z" fill="#363a45" filter="url(#paper)" />
				{/* the clay hill, lit from the low sun on the right */}
				<path d={`M-40,${slopeY(-40)} ${Array.from({length: 23}, (_, i) => { const x = -40 + i * 92; return `L${x},${slopeY(x) - 8 * Math.sin(i * 1.7) - 6}`; }).join(' ')} L1980,1080 L-40,1080 Z`} fill="#7d6e60" filter="url(#clay)" />
				<path d={`M-40,${slopeY(-40)} ${Array.from({length: 23}, (_, i) => { const x = -40 + i * 92; return `L${x},${slopeY(x) - 8 * Math.sin(i * 1.7) - 6}`; }).join(' ')}`} stroke="#e7b98a" strokeWidth={3} fill="none" opacity={0.55} />
				{/* felt tufts */}
				{Array.from({length: 16}, (_, i) => { const x = 40 + i * 120 + (i % 3) * 20; const y = slopeY(x) + 30 + (i % 4) * 26; return <path key={i} d={`M${x},${y} l-8,-24 l8,10 l4,-28 l5,26 l8,-18 l-2,34 Z`} fill={i % 2 ? '#56604a' : '#4a5340'} filter="url(#felt)" />; })}
				{/* footprints going down */}
				{[500, 610, 720].map((x, i) => <ellipse key={x} cx={x} cy={slopeY(x) + 22 + (i % 2) * 8} rx={14} ry={5} fill="#4e443a" opacity={0.5} />)}
				{/* the puppet */}
				<ellipse cx={px + 10} cy={py + 6} rx={80} ry={12} fill="#2a221c" opacity={0.5} filter="url(#b3)" />
				<g transform={`translate(${px},${py}) scale(${k})`} filter="url(#rimR)">
					<Mannequin pose={pose} />
				</g>
				{/* the control bar has slipped from the gods' hands: it tumbles away, the hand strings dangle free; only a slack head string remains */}
				<g transform="translate(560,150) rotate(34)">
					{[[0, -150], [-118, 0], [118, 0], [0, 150]].map(([x, y], i) => (
						<path key={i} d={`M${x},${y} c${10 + i * 6},70 ${-30 - i * 4},120 ${4 + i * 3},${190 + i * 25} s${-20 + i * 8},60 ${6 - i * 4},${80 + i * 12}`} stroke="#efe8da" strokeWidth={1.3} fill="none" opacity={0.5} transform={`rotate(-34, ${x}, ${y})`} />
					))}
					<Cap p={[-124, 0]} q={[124, 0]} w1={16} w2={16} />
					<Cap p={[0, -156]} q={[0, 156]} w1={16} w2={16} />
					<Ball p={[0, 0]} r={11} />
				</g>
				<path d={`M${an[0][0]},${an[0][1]} C${an[0][0] - 30},${an[0][1] + 120} ${700},${300} ${560 + 150 * Math.sin(rad(34))},${150 - 150 * Math.cos(rad(34))}`} stroke="#efe8da" strokeWidth={1.4} fill="none" opacity={0.55} />
				{/* the rock waits at the foot of the hill (foreground, out of focus) */}
				<g filter="url(#b3)">
					<ellipse cx={1760} cy={1010} rx={300} ry={260} fill="#6a6058" filter="url(#clay)" />
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

const Puppet35: React.FC = () => {
	useFonts();
	const t = useCurrentFrame() / FPS;
	const i = Math.min(1, Math.floor(t / SEG)), u = t - i * SEG;
	return i === 0 ? <S1 t={u} /> : <S6 t={u} />;
};
registerRoot(() => <Composition id="PUP35" component={Puppet35} durationInFrames={SEG * 2 * FPS} fps={FPS} width={W} height={H} />);

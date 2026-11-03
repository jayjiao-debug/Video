import React from 'react';
import {W, H, P, BEAT, STRIDE, rnd, seg, sm, eio, eout, lerp, Glow, Sky, Blur, Cam, Par, ridgeD, pineD, Specks, Glints, Trav, LK, POSE, walkAt, hand, fkPose, spline, poly, Label, GOLD, GOLD_HI, CREAM, FIG, RIM, YEAR, KAI, vestD} from './kit59';
import {useStampFonts} from '../qq44/skin44';
/* ep59 storyboard · scenes C: Mongolia, China, the closed gate, the stall, and the sea (bars 53–67). */
export type SP = {u: number; d: number};
const f1 = (v: number) => v.toFixed(1);

/* ---------- a Bactrian camel (two humps), facing right, loaded; local units ≈ cm, ground at 0; ph = gait phase ---------- */
const camelD = (ph: number): string[] => {
	const leg = (hx: number, hy: number, a: number, bend: number): string => { const r = a * Math.PI / 180, kx = hx + Math.sin(r) * 62, ky = hy + Math.cos(r) * 62, r2 = (a - bend) * Math.PI / 180, fx = kx + Math.sin(r2) * 64, fy = Math.min(0, ky + Math.cos(r2) * 64);
		return spline([[hx - 9, hy], [kx - 6, ky], [fx - 6, fy - 4], [fx + 9, fy], [fx + 8, fy - 6], [kx + 6, ky], [hx + 10, hy]]); };
	const s1 = Math.sin(ph * Math.PI * 2), s2 = Math.sin(ph * Math.PI * 2 + Math.PI);
	const body = spline([[-82, -150], [-70, -178], [-52, -214], [-34, -222], [-18, -196], [-2, -192], [16, -222], [34, -226], [52, -196], [76, -176], [96, -160], [120, -170], [140, -206], [150, -222], [170, -224], [186, -214], [190, -204], [176, -200], [160, -196], [150, -170], [130, -132], [100, -122], [70, -116], [20, -112], [-40, -116], [-74, -126]]);
	const tail = spline([[-80, -160], [-96, -136], [-92, -116], [-84, -134]]);
	const bags = spline([[-30, -206], [-42, -168], [-36, -140], [-10, -136], [-4, -168], [8, -168], [14, -136], [40, -140], [44, -168], [30, -206]]);
	return [body, tail, bags, leg(-56, -130, 18 * s1, -14), leg(-44, -128, 18 * s2, -14), leg(64, -128, 16 * s2, 12), leg(78, -128, 16 * s1, 12)];
};
const Camel: React.FC<{x: number; g: number; s: number; ph: number; rim?: string}> = ({x, g, s, ph, rim = RIM}) => { const ds = camelD(ph);
	return <g transform={`translate(${x},${g}) scale(${s})`}><g transform={`translate(${2.4 / s},${-1.8 / s})`} opacity={0.6}>{ds.map((d, i) => <path key={i} d={d} fill={rim} />)}</g>{ds.map((d, i) => <path key={i} d={d} fill={FIG} />)}</g>; };
/* ---------- a ger: felt wall, conical roof, door, crown smoke ---------- */
const Ger: React.FC<{x: number; g: number; s: number; id: string}> = ({x, g, s, id}) => <g transform={`translate(${x},${g}) scale(${s})`}>
	<path d="M-100,0 L-100,-70 Q0,-80 100,-70 L100,0 Z" fill="#e2d8c4" /><path d="M-112,-66 Q0,-150 112,-66 Q0,-84 -112,-66 Z" fill="#cfc4ae" />
	<rect x={-100} y={-40} width={200} height={6} fill="#8a6a4a" opacity={0.6} /><rect x={-20} y={-56} width={40} height={56} fill="#7a3a2a" /><rect x={-14} y={-50} width={28} height={50} fill="#9a5a3a" />
	<rect x={-8} y={-126} width={16} height={14} fill="#5a4a3a" />
	<Blur id={id} s={6}><g opacity={0.35}>{[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={6 + i * 14} cy={-140 - i * 30} rx={10 + i * 5} ry={9 + i * 3} fill="#e8e0d4" />)}</g></Blur></g>;

/** bar 53 · Mongolia: the camel caravan across the steppe, gers in the distance */
export const Steppe: React.FC<SP> = ({u, d}) => {
	const g = 820, h = 300, cs = h / 180, v = 46, uk = 0.7 * d, x0 = 1290 + v * (u - uk), ph = (v * (u - uk)) / (STRIDE * h);
	return <g><Cam z={1.02} px={-16 * u}>
		<Sky id="st_s" stops={[[0, '#56677a'], [0.45, '#b49e7e'], [0.6, '#e2c49a'], [1, '#e2c49a']]} />
		<Glow x={1540} y={560} r={600} c="#ffe0b0" o={0.4} id="st_g" />
		<path d={ridgeD(560, 40, 2.4, {f: 0.9, sharp: 0.4})} fill="#7a8494" opacity={0.85} />
		<path d={ridgeD(620, 26, 5.1, {f: 0.7})} fill="#9a8a62" />
		<path d={ridgeD(680, 22, 1.2, {f: 0.6})} fill="#7e6c46" />
		<Ger x={300} g={690} s={0.8} id="st_g1" /><Ger x={500} g={700} s={0.66} id="st_g2" />
		<rect x={-400} y={720} width={W + 800} height={H} fill="#5e4e32" />
		{Array.from({length: 60}, (_, i) => <path key={i} d={`M${rnd(i, 1) * 2400 - 200},${740 + 300 * Math.pow(rnd(i, 2), 1.4)} l${6},${-14 - 10 * rnd(i, 3)} l${6},${14}`} fill="#3e3420" opacity={0.7} />)}
		<path d={`M-400,${g + 8} Q${W / 2},${g - 6} ${W + 400},${g + 10}`} stroke="#c8a878" strokeWidth={3} opacity={0.4} fill="none" />
		{/* the caravan: three loaded camels on one lead rope, Karl leading */}
		{[0, 1, 2].map((i) => <Camel key={i} x={x0 - 230 - i * 300} g={g + 4} s={cs * 0.95} ph={ph + i * 0.33} rim="#ffe0b0" />)}
		<path d={`M${x0 - 230 + 186 * cs * 0.95},${g - 204 * cs * 0.95} Q${x0 - 60},${g - 150} ${hand(walkAt(v * (u - uk), h), 'RHand', x0, g, h)[0]},${hand(walkAt(v * (u - uk), h), 'RHand', x0, g, h)[1]}`} stroke={FIG} strokeWidth={3} fill="none" />
		<Trav x={x0} g={g} h={h} pose={walkAt(v * (u - uk), h)} look={LK.mid} side={1} rimOp={0.75} rim="#ffe0b0" />
	</Cam></g>;
};

/** bar 54 · China, 2018: a mountain road, a small figure (no place detail on screen) */
export const Mountains: React.FC<SP> = ({u, d}) => {
	const p = u / d, h = 140, uk = 0.7 * d;
	const road: P[] = [[1500, 1120], [1180, 930], [1450, 840], [980, 760], [1180, 690], [760, 620], [900, 580]];
	const pathD = spline(road, false), x = 1180 + 60 * (u - uk), gy = lerp(930, 870, (x - 1180) / 270);
	return <g><Cam z={lerp(1.0, 1.06, eio(p))} py={lerp(20, -10, eio(p))}>
		<Sky id="mt_s" stops={[[0, '#2e3a50'], [0.5, '#7a8aa0'], [1, '#9aa4b0']]} />
		{/* far peaks with snow caps; the last light on their tops */}
		<path d={ridgeD(400, 170, 3.3, {f: 1.1, sharp: 0.85, step: 10})} fill="#9aa6b8" />
		<g opacity={0.95}><defs><clipPath id="mt_c"><path d={ridgeD(400, 170, 3.3, {f: 1.1, sharp: 0.85, step: 10})} /></clipPath></defs>
			<path d={`M-400,150 L${W + 400},150 ` + Array.from({length: 60}, (_, i) => { const xx = W + 400 - i * 46; return `L${xx},${300 + 40 * Math.sin(i * 1.7) + 30 * rnd(i, 4)}`; }).join(' ') + ' Z'} fill="#eef0f4" clipPath="url(#mt_c)" />
			<rect x={-400} y={150} width={W + 800} height={100} fill="#ffe2b8" opacity={0.45} clipPath="url(#mt_c)" /></g>
		<path d={ridgeD(520, 130, 6.2, {f: 1.4, sharp: 0.7, step: 10})} fill="#5c687a" />
		<path d={ridgeD(640, 110, 1.9, {f: 1.2, sharp: 0.5})} fill="#3e4858" />
		<path d={`M-300,${H + 60} L-300,820 Q400,760 900,800 Q1400,840 2300,720 L2300,${H + 60} Z`} fill="#2a3240" />
		{/* the switchback road and its poles */}
		<path d={pathD} stroke="#8e9096" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		<path d={pathD} stroke="#c8c8c4" strokeWidth={2} strokeDasharray="14 18" fill="none" opacity={0.6} />
		{Array.from({length: 7}, (_, i) => { const px = 1560 - i * 120, py = 1020 - i * 60, s = 1 - i * 0.1; return <g key={i} fill="#14181e"><rect x={px} y={py - 120 * s} width={5 * s} height={120 * s} /><rect x={px - 16 * s} y={py - 114 * s} width={36 * s} height={4 * s} /></g>; })}
		<Trav x={x} g={gy} h={h} pose={walkAt(50 * (u - uk), h, 8)} look={LK.mid} side={-1} rimOp={0.8} rim="#ffe8c8" />
		<Specks t={u} n={30} seed={8} col="#ffffff" o={0.4} vx={-120} vy={40} r={1.8} />
	</Cam></g>;
};

/** bar 55 · the closed gate in the desert (Iran's visa never came); no flags, no text */
export const Gate: React.FC<SP> = ({u, d}) => {
	const p = u / d, g = 860, h = 300, x = 640, xk = seg(u, BEAT * 3, BEAT * 3 + 0.2);
	return <g><Cam z={lerp(1, 1.05, eio(p))}>
		<Sky id="gt_s" stops={[[0, '#6a6a70'], [0.55, '#c0ae92'], [0.62, '#d4c0a0'], [1, '#d4c0a0']]} />
		<Glow x={1300} y={420} r={500} c="#fff0d0" o={0.35} id="gt_g" />
		<path d={ridgeD(640, 24, 4.2, {f: 1.3, sharp: 0.3})} fill="#9a8a72" />
		<rect x={-400} y={650} width={W + 800} height={H} fill="#b09a78" />
		{Array.from({length: 40}, (_, i) => <ellipse key={i} cx={rnd(i, 1) * 2200 - 100} cy={700 + 380 * Math.pow(rnd(i, 2), 1.5)} rx={20 + 40 * rnd(i, 3)} ry={3 + 4 * rnd(i, 4)} fill="#8a7658" opacity={0.5} />)}
		{/* the road to the gate */}
		<path d={`M300,${H} L1080,660 L1240,660 L1900,${H} Z`} fill="#8a7a64" />
		{/* fence running off both sides, the booth, the gate (closed) */}
		<g stroke="#2a2420" strokeWidth={3}>{Array.from({length: 22}, (_, i) => { const xx = i < 11 ? 1060 - i * 100 : 1260 + (i - 11) * 90; return <line key={i} x1={xx} y1={680} x2={xx} y2={600} />; })}<line x1={-200} y1={610} x2={1060} y2={610} /><line x1={-200} y1={640} x2={1060} y2={640} /><line x1={1260} y1={610} x2={2200} y2={610} /><line x1={1260} y1={640} x2={2200} y2={640} /></g>
		<rect x={1330} y={500} width={150} height={180} fill="#2a2420" /><rect x={1310} y={488} width={190} height={20} fill="#1a1614" /><rect x={1360} y={540} width={90} height={60} fill="#e8c890" opacity={0.6} />
		<rect x={1040} y={470} width={40} height={210} fill="#1e1a18" /><rect x={1240} y={470} width={40} height={210} fill="#1e1a18" />
		<g fill="#2a2420">{Array.from({length: 9}, (_, i) => <rect key={i} x={1086 + i * 17} y={520} width={7} height={160} />)}<rect x={1080} y={514} width={160} height={10} /><rect x={1080} y={600} width={160} height={8} /></g>
		{/* the ✕ plate lands on the beat */}
		<g transform={`translate(1160,470) scale(${0.6 + 0.4 * eout(xk)})`} opacity={xk > 0 ? 1 : 0}><circle r={44} fill="#e8e0d0" /><circle r={44} fill="none" stroke="#8e2a24" strokeWidth={8} /><path d="M-22,-22 L22,22 M22,-22 L-22,22" stroke="#8e2a24" strokeWidth={10} strokeLinecap="round" /></g>
		<Trav x={x} g={g} h={h} pose={POSE.standPack} look={LK.mid} side={1} rimOp={0.6} rim="#fff0d0" />
		<path d={`M${x - 60},${g + 4} L${x - 300},${g + 40} L${x - 240},${g + 46} L${x + 30},${g + 6} Z`} fill="#000" opacity={0.25} />
	</Cam></g>;
};

/** bar 57 · 2020: the road just stops; everything grey and still */
export const Stall: React.FC<SP> = ({u}) => {
	const g = 840, h = 300, x = 860;
	return <g><Cam z={1.0}>
		<Sky id="sl_s" stops={[[0, '#5a5e64'], [0.55, '#8c9096'], [1, '#8c9096']]} />
		<path d={ridgeD(590, 16, 2.2, {f: 1.5})} fill="#70747a" />
		<rect x={-400} y={600} width={W + 800} height={H} fill="#7a7a78" />
		{Array.from({length: 30}, (_, i) => <ellipse key={i} cx={rnd(i, 1) * 2200 - 100} cy={640 + 420 * Math.pow(rnd(i, 2), 1.6)} rx={30 + 50 * rnd(i, 3)} ry={3 + 3 * rnd(i, 4)} fill="#64646a" opacity={0.5} />)}
		{/* the asphalt ends in a broken edge just ahead of him; beyond it only dust */}
		<path d={`M-200,${H + 40} L${x - 80},${g + 10} ${Array.from({length: 9}, (_, i) => `L${x - 60 + i * 40},${g + 8 + (i % 2 ? 14 : -4) + 6 * rnd(i, 5)}`).join(' ')} L${x + 330},${g + 30} L${1500},${H + 40} Z`} fill="#3a3a3c" />
		<path d={`M${x + 60},${g + 40} L${x + 300},${H + 40}`} stroke="#c8c8c0" strokeWidth={6} strokeDasharray="50 50" opacity={0.5} />
		{[0, 1, 2, 3].map((i) => <rect key={i} x={x + 160 + i * 34 + 20 * rnd(i, 6)} y={g + 26 + 14 * rnd(i, 7)} width={26} height={12} fill="#3a3a3c" transform={`rotate(${30 * rnd(i, 8)} ${x + 170 + i * 34} ${g + 30})`} />)}
		<Trav x={x} g={g} h={h} pose={POSE.stand} look={LK.mid} side={-1} rimOp={0.3} rim="#e8e8e8" />
		<Specks t={u} n={30} seed={11} col="#d8d8d4" o={0.25} vx={-80} vy={6} r={2} box={[0, 500, W, 500]} />
	</Cam></g>;
};

/* ============ the sea ============ */
const SeaBand: React.FC<{hz: number; t: number; c0: string; c1: string; id: string; glint?: string}> = ({hz, t, c0, c1, id, glint = '#e8eef2'}) => <g>
	<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c0} /><stop offset="1" stopColor={c1} /></linearGradient></defs>
	<rect x={-400} y={hz} width={W + 800} height={H + 200} fill={`url(#${id})`} />
	<Glints t={t} y0={hz + 4} y1={H + 40} n={140} col={glint} o={0.28} seed={id.length} speed={14} />
</g>;
/** bar 58 · the Caspian shore: the sea fills the frame */
export const Shore: React.FC<SP> = ({u, d}) => {
	const p = u / d, hz = 430, g = 900, h = 330, x = 420;
	return <g><Cam z={lerp(1.0, 1.06, eio(p))} py={lerp(0, 20, eio(p))}>
		<Sky id="sr_s" stops={[[0, '#4a5462'], [0.7, '#a8b0b6'], [1, '#c8ccd0']]} />
		<Glow x={1300} y={300} r={600} c="#fff6e8" o={0.35} id="sr_g" />
		<SeaBand hz={hz} t={u} c0="#7a8a94" c1="#3a4a56" id="sr_sea" />
		{/* waves breaking in rows toward the beach */}
		{[0, 1, 2].map((i) => { const k = ((u * 0.3 + i / 3) % 1), y = lerp(620, 860, k); return <path key={i} d={`M${600 + 200 * k},${y} Q${1100},${y - 10} ${2300},${y - 40 + 30 * k}`} stroke="#eef2f4" strokeWidth={3 + 4 * k} fill="none" opacity={0.6 * Math.sin(k * Math.PI)} />; })}
		{/* the chalky plateau edge (left) and the pebble beach */}
		<path d={`M-300,${hz + 2} L-40,${hz - 30} L120,${hz - 26} L210,${hz + 4} L250,${hz + 60} L-300,${hz + 90} Z`} fill="#a89e88" /><path d={`M120,${hz - 26} L210,${hz + 4} L250,${hz + 60} L200,${hz + 60} Z`} fill="#8a8270" />
		<path d={`M-300,${H + 60} L-300,800 Q400,860 900,940 Q1100,980 1300,${H + 60} Z`} fill="#6a6258" />
		<path d={`M-300,800 Q400,860 900,940 Q1100,980 1300,${H + 60}`} stroke="#e8e4dc" strokeWidth={5} fill="none" opacity={0.7} />
		{Array.from({length: 50}, (_, i) => <ellipse key={i} cx={-200 + rnd(i, 1) * 1300} cy={870 + rnd(i, 2) * 200} rx={6 + 10 * rnd(i, 3)} ry={4 + 5 * rnd(i, 4)} fill="#4e4840" />)}
		<Trav x={x} g={g} h={h} pose={POSE.lookOut} look={LK.old} side={1} rimOp={0.6} rim="#fff6e8" />
	</Cam></g>;
};
/** bars 59–60 · the pack down on the pebbles; he walks into the water (wetsuit + life vest), the support boat waiting */
export const StepIn: React.FC<SP> = ({u, d}) => {
	const p = u / d, hz = 470, h = 380, uk = 0.72 * d, x = 940 + 70 * (u - uk), wl = 800, depth = seg(x, 760, 1300), g = wl + lerp(0.1, 0.42, depth) * h;
	const pose = walkAt(60 * (u - uk), h, 4);
	return <g><Cam z={1.02} px={-30 * p}>
		<Sky id="si_s" stops={[[0, '#5a6a7c'], [0.6, '#c4c8c8'], [1, '#d8d8d4']]} />
		<Glow x={1450} y={360} r={500} c="#fff4dc" o={0.45} id="si_g" />
		<SeaBand hz={hz} t={u} c0="#8a9aa4" c1="#46566a" id="si_sea" />
		{/* the support boat, waiting offshore */}
		<g transform="translate(1520,560)"><path d="M-120,0 L120,0 L96,26 L-104,26 Z" fill="#e2e2dc" /><rect x={-60} y={-46} width={90} height={46} fill="#cfd0cc" /><rect x={-50} y={-36} width={30} height={16} fill="#3a4450" /><rect x={-10} y={-36} width={30} height={16} fill="#3a4450" /><rect x={-4} y={-96} width={4} height={50} fill="#3a3a3a" /></g>
		<rect x={1380} y={588} width={280} height={4} fill="#ffffff" opacity={0.3} />
		{/* the beach (left) and the pack lying on it */}
		<path d={`M-300,${H + 60} L-300,760 Q300,790 700,${wl + 30} Q760,${wl + 120} 640,${H + 60} Z`} fill="#6a6258" />
		<path d={`M-300,760 Q300,790 700,${wl + 30}`} stroke="#e8e4dc" strokeWidth={5} fill="none" opacity={0.7} />
		{Array.from({length: 30}, (_, i) => <ellipse key={i} cx={-200 + rnd(i, 1) * 820} cy={820 + rnd(i, 2) * 230} rx={6 + 10 * rnd(i, 3)} ry={4 + 5 * rnd(i, 4)} fill="#4e4840" />)}
		<g transform="translate(330,872) rotate(-78)"><path d={spline([[-20, 0], [-24, -150], [10, -190], [90, -186], [110, -130], [104, 0]])} fill={FIG} /><ellipse cx={46} cy={-200} rx={40} ry={24} fill={FIG} /></g>
		<Trav x={x} g={g} h={h} pose={pose} look={LK.swim} pack={0} side={1} rimOp={0.6} rim="#fff6e8" extra={[vestD(pose, x, g, h)]} />
		<rect x={-400} y={wl} width={W + 800} height={H} fill="#46566a" opacity={0.92} />
		<path d={`M-300,${H + 60} L-300,760 Q300,790 700,${wl + 30} Q760,${wl + 120} 640,${H + 60} Z`} fill="#6a6258" />
		{Array.from({length: 30}, (_, i) => <ellipse key={`p${i}`} cx={-200 + rnd(i, 1) * 820} cy={820 + rnd(i, 2) * 230} rx={6 + 10 * rnd(i, 3)} ry={4 + 5 * rnd(i, 4)} fill="#4e4840" />)}
		<g transform="translate(330,872) rotate(-78)"><path d={spline([[-20, 0], [-24, -150], [10, -190], [90, -186], [110, -130], [104, 0]])} fill={FIG} /><ellipse cx={46} cy={-200} rx={40} ry={24} fill={FIG} /></g>
		{[0, 1].map((i) => { const k = ((u * 0.8 + i / 2) % 1); return <ellipse key={i} cx={x} cy={wl + 3} rx={60 + 120 * k} ry={8 + 10 * k} fill="none" stroke="#eef2f4" strokeWidth={2.5} opacity={0.55 * (1 - k)} />; })}
		<Glints t={u + 2} y0={wl + 6} y1={H} n={40} col="#e8eef2" o={0.25} seed={5} speed={14} />
	</Cam></g>;
};

/* ---------- swimmers and the boat seen from above ---------- */
const BoatTop: React.FC<{x: number; y: number; a: number; s: number; lit?: boolean}> = ({x, y, a, s, lit}) => <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
	<path d="M-140,-40 L120,-40 Q190,-36 220,0 Q190,36 120,40 L-140,40 Q-150,0 -140,-40 Z" fill="#dcdcd4" /><rect x={-80} y={-28} width={120} height={56} rx={6} fill="#b8bab6" /><rect x={-70} y={-20} width={40} height={40} fill="#3a4450" opacity={0.8} />
	{lit && <Glow x={-50} y={0} r={60} c={GOLD} o={0.7} id="bt_l" />}
	<path d="M-140,-40 L120,-40 Q190,-36 220,0" stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.6} /></g>;
const SwimTop: React.FC<{x: number; y: number; t: number; i: number}> = ({x, y, t, i}) => { const ph = t * 1.4 + i;
	return <g transform={`translate(${x},${y})`}><path d={`M-90,-20 Q-40,0 -90,20`} stroke="#e8eef2" strokeWidth={3} fill="none" opacity={0.5} /><path d={`M-150,-34 Q-60,0 -150,34`} stroke="#e8eef2" strokeWidth={2} fill="none" opacity={0.3} />
		<ellipse cx={0} cy={0} rx={16} ry={13} fill="#14181c" /><ellipse cx={-30} cy={0} rx={30} ry={11} fill="#14181c" opacity={0.75} />
		<path d={`M-10,${-8} Q${10 + 18 * Math.sin(ph)},${-36} ${30 + 20 * Math.cos(ph)},${-24}`} stroke="#14181c" strokeWidth={9} fill="none" strokeLinecap="round" />
		<path d={`M-10,${8} Q${10 - 18 * Math.sin(ph)},${36} ${30 - 20 * Math.cos(ph)},${24}`} stroke="#14181c" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} /></g>; };
/** bar 61 · the Caspian from above: the boat and two swimmers, slow turn */
export const Caspian: React.FC<SP> = ({u, d}) => {
	const p = u / d;
	return <g><Cam z={1.1} rot={lerp(-2, 2, p)}>
		<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#2c4a58" />
		{Array.from({length: 70}, (_, i) => { const y = -200 + i * 22, x0 = (((rnd(i, 1) * 2600 + u * 30) % 2600) - 400); return <path key={i} d={`M${x0},${y} q${60},${-10} ${120},0 t${120},0`} stroke="#5a7a88" strokeWidth={3} fill="none" opacity={0.5} />; })}
		{Array.from({length: 40}, (_, i) => <path key={`g${i}`} d={`M${rnd(i, 4) * W},${rnd(i, 5) * H} l${40 + 40 * rnd(i, 6)},${-6}`} stroke="#c8dde4" strokeWidth={3} opacity={0.35 * Math.abs(Math.sin(u * 2 + i))} />)}
		<path d={`M760,560 L360,500 M760,600 L360,690`} stroke="#d8e8ec" strokeWidth={6} opacity={0.35} />
		<BoatTop x={980} y={580} a={-4} s={1.3} />
		<SwimTop x={1320} y={500} t={u} i={0} /><SwimTop x={1300} y={680} t={u} i={1.7} />
		<Label x={1320} y={440} s="他" size={30} />
	</Cam></g>;
};
/** bars 62–63 · nights at sea: moonlight, the boat's cabin light; km widget rolling to 「近300」 */
const SeaKm: React.FC<{km: number}> = ({km}) => { const v = Math.round(km), txt = v >= 288 ? '近300' : `${v}`, k = Math.min(1, km / 288);
	useStampFonts(`${txt}公里哈萨克斯坦阿塞拜疆近`);
	return <g transform="translate(1760,250)">
		<text x={0} y={0} textAnchor="end" style={{fontFamily: YEAR, fontWeight: 600, fontSize: 62, fontVariantNumeric: 'lining-nums tabular-nums'}} fill={CREAM} stroke="rgba(8,8,10,0.7)" strokeWidth={6} paintOrder="stroke">{txt}<tspan style={{fontFamily: KAI, fontSize: 32}}> 公里</tspan></text>
		<Label x={-430} y={58} s="哈萨克斯坦" size={26} anchor="start" /><Label x={0} y={58} s="阿塞拜疆" size={26} anchor="end" />
		<rect x={-430} y={72} width={430} height={4} fill="#dfe6ec" opacity={0.4} /><rect x={-430} y={72} width={430 * k} height={4} fill={GOLD} /><circle cx={-430 + 430 * k} cy={74} r={8} fill={GOLD_HI} />
	</g>; };
export const Nights: React.FC<SP> = ({u, d}) => {
	const hz = 560, km = 288 * eio(seg(u, 0.1, d * 0.95)), bob = 4 * Math.sin(u * 2.2);
	return <g><Cam z={1.02} px={-10 * u}>
		<Sky id="ni_s" stops={[[0, '#060a14'], [0.6, '#16203a'], [1, '#1e2a40']]} />
		{Array.from({length: 120}, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={rnd(i, 2) * 520} r={0.6 + 1.4 * rnd(i, 3)} fill="#e8eef8" opacity={0.3 + 0.5 * rnd(i, 4)} />)}
		<Glow x={720} y={420} r={240} c="#e8eef8" o={0.35} id="ni_m" /><circle cx={720} cy={420} r={36} fill="#f2f4f0" />
		<SeaBand hz={hz} t={u} c0="#1a2438" c1="#0a0e18" id="ni_sea" glint="#c8d4e8" />
		{Array.from({length: 26}, (_, i) => <rect key={i} x={720 - (20 + i * 6) + 30 * Math.sin(u * 2 + i)} y={hz + 6 + i * 18} width={(40 + i * 12) * (0.5 + 0.5 * rnd(i, 7))} height={3 + i * 0.3} fill="#e8eef8" opacity={0.5 - i * 0.015} />)}
		{/* the support boat at anchor: cabin lit, someone on deck */}
		<g transform={`translate(1180,${640 + bob})`}>
			<path d="M-260,0 L260,0 Q240,40 200,56 L-220,56 Q-250,30 -260,0 Z" fill="#0a0c12" /><rect x={-140} y={-80} width={220} height={80} fill="#0e1018" /><rect x={-120} y={-64} width={60} height={34} fill={GOLD} opacity={0.85} /><rect x={-40} y={-64} width={60} height={34} fill={GOLD} opacity={0.6} />
			<rect x={100} y={-220} width={6} height={220} fill="#0a0c12" /><circle cx={103} cy={-224} r={5} fill="#fff4e0" />
			<Glow x={-60} y={-46} r={160} c={GOLD} o={0.4} id="ni_cab" />
			<Trav x={170} g={0} h={150} pose={fkPose({hip: 0.37, lean: 10, neck: 10, lt: 88, lk: 92, rt: 84, rk: 86, la: 30, le: 60, ra: 26, re: 70})} look={LK.swim} pack={0} flip side={-1} rimOp={0.6} rim={GOLD} />
		</g>
		<path d={`M920,${700 + bob} L1440,${700 + bob}`} stroke={GOLD} strokeWidth={3} opacity={0.25} />
	</Cam><SeaKm km={km} /></g>;
};

/** bar 64 · the tunnel mouth with a ✕: not allowed to walk through */
export const Tunnel: React.FC<SP> = ({u, d}) => {
	const p = u / d, g = 880, h = 300, x = 560, vp: P = [1060, 560], xk = seg(u, BEAT * 2, BEAT * 2 + 0.2);
	return <g><Cam z={lerp(1.0, 1.08, eio(p))} px={lerp(0, 20, eio(p))}>
		<Sky id="tn_s" stops={[[0, '#4a5462'], [0.6, '#98a0a8'], [1, '#98a0a8']]} />
		{/* the embankment and the concrete portal */}
		<path d={`M-300,620 Q500,560 1060,330 Q1600,560 2300,600 L2300,${H} L-300,${H} Z`} fill="#4a5a44" />
		<path d={`M-300,620 Q500,560 1060,330 Q1600,560 2300,600`} stroke="#8a9a7a" strokeWidth={4} fill="none" opacity={0.5} />
		<path d="M720,700 L720,420 Q1060,300 1400,420 L1400,700 Z" fill="#8a8c88" />
		<path d="M800,700 L800,470 Q1060,380 1320,470 L1320,700 Z" fill="#0a0b0c" />
		{Array.from({length: 7}, (_, i) => { const q = Math.pow(0.72, i); return <circle key={i} cx={lerp(vp[0], 1300, q * 0.7)} cy={lerp(vp[1], 470, q * 0.6)} r={3 + 6 * q} fill={GOLD_HI} opacity={0.9} />; })}
		{/* the tracks and the catenary */}
		<rect x={-400} y={700} width={W + 800} height={H} fill="#3a3c3a" />
		{[[-200, 860], [880, 1000], [1240, 1120], [2300, 1260]].map(([bx, tx], i) => <path key={i} d={`M${bx},${H + 40} L${tx},700`} stroke="#9a9c98" strokeWidth={6} />)}
		{Array.from({length: 12}, (_, i) => { const y = 700 + Math.pow(i / 11, 1.8) * 420; return <rect key={i} x={lerp(860, -200, (y - 700) / 420) - 20} y={y} width={lerp(400, 2600, (y - 700) / 420)} height={lerp(3, 14, (y - 700) / 420)} fill="#2a2c2a" />; })}
		{[600, 1520].map((px, i) => <g key={i} fill="#1a1c1c"><rect x={px} y={300} width={14} height={420} /><rect x={px - (i ? 220 : -14)} y={316} width={220} height={8} /></g>)}
		<path d="M614,340 Q1060,380 1520,340" stroke="#1a1c1c" strokeWidth={3} fill="none" />
		{/* the fence across the tracks and the ✕ */}
		<g stroke="#1e2022" strokeWidth={4}>{Array.from({length: 20}, (_, i) => <line key={i} x1={700 + i * 38} y1={720} x2={700 + i * 38} y2={600} />)}<line x1={690} y1={604} x2={1440} y2={604} /><line x1={690} y1={660} x2={1440} y2={660} /></g>
		<g transform={`translate(1060,560) scale(${0.6 + 0.4 * eout(xk)})`} opacity={xk > 0 ? 1 : 0}><rect x={-70} y={-70} width={140} height={140} rx={10} fill="#e8e0d0" /><path d="M-40,-40 L40,40 M40,-40 L-40,40" stroke="#8e2a24" strokeWidth={18} strokeLinecap="round" /></g>
		<Trav x={x} g={g} h={h} pose={POSE.standPack} look={LK.old} side={1} rimOp={0.5} rim="#f4f0e8" />
	</Cam></g>;
};

/** bars 66–67 · swimming the Channel toward the white cliffs at dawn */
export const Channel: React.FC<SP> = ({u, d}) => {
	const p = u / d, hz = 600, ph = u * 2.6, sw = Math.sin(ph), cx = 760, cy = 820 + 8 * Math.sin(u * 1.7);
	return <g><Cam z={lerp(1.0, 1.05, eio(p))} py={8 * Math.sin(u * 1.3)}>
		<Sky id="ch_s" stops={[[0, '#3e4a64'], [0.45, '#a8a0a0'], [0.56, '#f0d4aa'], [0.6, '#f4e0c0'], [1, '#f4e0c0']]} />
		<Glow x={1500} y={560} r={520} c="#ffe0b0" o={0.55} id="ch_g" />
		{/* the white cliffs: chalk face catching the dawn, green cap */}
		<path d={`M820,${hz} L860,520 L1000,490 L1200,470 L1420,476 L1640,500 L1900,520 L2300,540 L2300,${hz} Z`} fill="#e8e2d6" />
		{Array.from({length: 26}, (_, i) => <rect key={i} x={860 + i * 50 + rnd(i, 2) * 20} y={490 + 20 * rnd(i, 3)} width={4} height={hz - 500} fill="#c8bca8" opacity={0.5} />)}
		<path d={`M840,530 L860,516 L1000,486 L1200,466 L1420,472 L1640,496 L1900,516 L2300,536 L2300,528 L1900,506 L1640,486 L1420,460 L1200,456 L1000,476 L860,506 Z`} fill="#6a7a5a" />
		<SeaBand hz={hz} t={u} c0="#8a8a8c" c1="#2e3a46" id="ch_sea" glint="#fff0d8" />
		{/* the support boat */}
		<g transform="translate(420,640)"><path d="M-90,0 L90,0 L72,20 L-78,20 Z" fill="#2a3038" /><rect x={-40} y={-34} width={64} height={34} fill="#323a42" /><rect x={-2} y={-74} width={4} height={40} fill="#2a3038" /></g>
		{/* the swell in front, the swimmer mid-stroke (cap, wetsuit, arm over) */}
		<path d={`M-300,${cy + 10} Q${cx - 300},${cy - 30 + 10 * sw} ${cx},${cy + 6} Q${cx + 400},${cy + 40} 2300,${cy - 10} L2300,${H + 60} L-300,${H + 60} Z`} fill="#26323e" />
		<ellipse cx={cx} cy={cy - 6} rx={34} ry={28} fill={FIG} /><ellipse cx={cx - 46} cy={cy + 6} rx={60} ry={20} fill={FIG} />
		<path d={`M${cx - 30},${cy} Q${cx + 20},${cy - 110 - 30 * sw} ${cx + 120 + 30 * Math.cos(ph)},${cy - 40 + 30 * sw}`} stroke={FIG} strokeWidth={22} fill="none" strokeLinecap="round" />
		<path d={`M${cx + 22},${cy - 30} Q${cx},${cy - 40} ${cx - 30},${cy - 26}`} stroke="#ffe0b8" strokeWidth={3} fill="none" opacity={0.7} />
		{Array.from({length: 8}, (_, i) => <circle key={i} cx={cx + 110 + 20 * rnd(i, 3) + 30 * Math.cos(ph)} cy={cy - 30 + 30 * rnd(i, 4)} r={2 + 3 * rnd(i, 5)} fill="#ffffff" opacity={0.6} />)}
		<path d={`M-300,${cy + 60} Q${cx},${cy + 30} 2300,${cy + 80} L2300,${H + 60} L-300,${H + 60} Z`} fill="#1c2630" />
		<Glints t={u} y0={cy + 40} y1={H} n={30} col="#fff0d8" o={0.25} seed={7} speed={10} />
	</Cam></g>;
};
void Par; void pineD; void hand; void spline; void poly; void sm; void GOLD; void RIM;

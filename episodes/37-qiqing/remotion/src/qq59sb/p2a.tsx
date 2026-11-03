import React from 'react';
import {W, H, D, BEAT, rnd, seg, sm, eio, eout, lerp, Glow, Sky, Blur, Cam, ridgeD, pineD, Birch, Specks, Glints, spline, poly, Label, GOLD, GOLD_HI, CREAM} from './kit59';
import {Karl, Rim2, walkD, walkB, strapD, leanP, FIGC, vNat, vBrisk} from './stage59';
import {grounded, withArms, mixPose, nod, Pose, PackProp, jointAt} from '../qq59/figure59';
import {routeAt, LL, Earth, satPt, chaseSat, mixSat, Space, SatView, CaspianSea, legHeading} from './chase59';
const ROLL_A = legHeading(0.634, 0.6706), ROLL_C = legHeading(0.8626, 0.9879);
import {useStampFonts} from '../qq44/skin44';
/* ep59 part 2 · bars 50–67 (the drive): the protest, Russia's decade, the globe across Asia, the gate and the stall, the Caspian,
   the globe across Europe, the tunnel, the Channel. Every scene takes film time T (s) and runs its own camera and acting.
   Cuts land on downbeats; hits (flashes, the ✕s, the pack, the season wipes) land on beats; walking/swimming/snow run on their own clocks. */
export const BT = (n: number, b = 0) => D(n) + b * BEAT;
export type SC = React.FC<{T: number}>;
const f1 = (v: number) => v.toFixed(1);
/** a decaying punch after t0 (0 before) */
/** constant speed with soft ends (position 0 → 1; a = the fraction spent accelerating and again decelerating) */
export const trap = (u: number, a: number) => { const v = 1 / (1 - a); return u <= 0 ? 0 : u >= 1 ? 1 : u < a ? v * u * u / (2 * a) : u > 1 - a ? 1 - v * (1 - u) * (1 - u) / (2 * a) : v * (u - a / 2); };
export const hit = (T: number, t0: number, k = 9) => (T >= t0 ? Math.exp(-(T - t0) * k) : 0);
const RIM_W: Rim2[] = [{c: '#f2f0e8', o: 0.55, dx: -2.4, dy: -1.6}];
const STAND: Pose = grounded({lean: 4, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14});
const STAND_PACK: Pose = grounded({lean: 8, neck: -4, lt: 3, lk: 4, rt: -4, rk: 4, la: 12, le: 128, ra: 8, re: 132});

/* ====================== bar 50 · DROP: the sign goes up on the downbeat; four flashes on the four beats ====================== */
const Portico: React.FC<{y0: number}> = ({y0}) => <g>
	<Sky id="pc_s" stops={[[0, '#2a303c'], [0.6, '#565e6c'], [1, '#3a4048']]} />
	{[[110, 1], [1810, -1]].map(([tx, sg], i) => <g key={i} stroke="#151820" fill="none" strokeLinecap="round">
		<path d={`M${tx},${y0 + 200} L${tx + sg * 10},${y0 - 260}`} strokeWidth={26} />
		{[0, 1, 2, 3, 4, 5].map((j) => { const by = y0 - 120 - j * 60, ex = tx + sg * (60 + 50 * rnd(j, i)) * (j % 2 ? -1 : 1), ey = by - 120 - 60 * rnd(j, i + 3);
			return <path key={j} d={`M${tx + sg * 6},${by} Q${(tx + ex) / 2},${by - 30} ${ex},${ey}`} strokeWidth={10 - j} />; })}</g>)}
	<rect x={330} y={-60} width={1260} height={170} fill="#848a94" /><rect x={300} y={110} width={1320} height={30} fill="#6c727c" />
	<rect x={360} y={140} width={1200} height={y0 - 140} fill="#1e2228" />
	{Array.from({length: 6}, (_, i) => { const cx = 420 + i * 216; return <g key={i}><rect x={cx - 46} y={140} width={92} height={y0 - 140} fill="#a0a6ae" /><rect x={cx - 46} y={140} width={30} height={y0 - 140} fill="#767c86" />
		<rect x={cx - 58} y={140} width={116} height={24} fill="#8a9098" /><rect x={cx - 58} y={y0 - 24} width={116} height={24} fill="#8a9098" /></g>; })}
	<rect x={860} y={300} width={200} height={y0 - 300} fill="#101216" />
	{Array.from({length: 10}, (_, i) => <g key={i}><rect x={260 - i * 40} y={y0 + i * 46} width={1400 + i * 80} height={46} fill={i % 2 ? '#8c929a' : '#848a92'} /><rect x={260 - i * 40} y={y0 + i * 46} width={1400 + i * 80} height={4} fill="#c8ccd2" opacity={0.5} /></g>)}
</g>;
/* a press photographer in the foreground (the rig, big and cut off by the frame), camera up to the eye, a flash gun on top */
const SNAP = grounded({lean: 6, neck: 4, lt: 3, lk: 4, rt: -5, rk: 5, la: 72, le: 96, ra: 64, re: 104});
const Press: React.FC<{px: number; h: number; i: number; f: number; flip?: boolean}> = ({px, h, i, f, flip}) => {
	const g = 1080 + 0.42 * h, hl = jointAt(SNAP, 'LHand', px, g, h, flip), hr = jointAt(SNAP, 'RHand', px, g, h, flip), cx = (hl[0] + hr[0]) / 2 + (flip ? -1 : 1) * 0.04 * h, cy = (hl[1] + hr[1]) / 2 - 0.02 * h;
	const cw = 0.11 * h, ch = 0.075 * h;
	return <g>
		<Karl stage="home" look={{head: i % 2 ? 'cap' : 'short', beard: undefined, paint: {}}} id={`pr${i}`} x={px} g={g} h={h} pose={SNAP} flip={flip} col="#07080b" rims={[{c: '#8a94a4', o: 0.35, dx: flip ? -2 : 2, dy: -1.4}]} />
		<rect x={f1(cx - cw / 2)} y={f1(cy - ch / 2)} width={f1(cw)} height={f1(ch)} rx={f1(0.012 * h)} fill="#07080b" />
		<rect x={f1(cx + (flip ? -1 : 1) * cw * 0.3 - 0.025 * h)} y={f1(cy - ch * 0.15)} width={f1(0.05 * h)} height={f1(0.05 * h)} rx={f1(0.02 * h)} fill="#07080b" transform={`translate(${f1((flip ? -1 : 1) * 0.04 * h)},0)`} />
		<rect x={f1(cx - 0.02 * h)} y={f1(cy - ch / 2 - 0.05 * h)} width={f1(0.04 * h)} height={f1(0.05 * h)} fill="#07080b" />
		{f > 0.02 && <><Glow x={cx} y={cy - ch / 2 - 0.035 * h} r={0.5 * h} c="#ffffff" o={0.95 * f} id={`sg_f${i}`} /><rect x={f1(cx - 0.018 * h)} y={f1(cy - ch / 2 - 0.045 * h)} width={f1(0.036 * h)} height={f1(0.02 * h)} fill="#ffffff" opacity={f} /></>}
	</g>; };
export const SignScene: SC = ({T}) => {
	const u = T - D(50), y0 = 560, g = 880, h = 420, x = 1090, up = eout(seg(u, 0, 0.14));
	const pose = grounded({lean: -2, neck: -4, lt: 4, lk: 4, rt: -6, rk: 5, la: lerp(30, 158, up), le: lerp(60, 14, up), ra: lerp(26, 150, up), re: lerp(60, 22, up)});
	const hl = jointAt(pose, 'LHand', x, g, h), hr = jointAt(pose, 'RHand', x, g, h), top = jointAt(pose, 'Top', x, g, h), cx = (hl[0] + hr[0]) / 2 + 10, cy = Math.min((hl[1] + hr[1]) / 2, top[1] - 40);
	const fl = [0, 1, 2, 3].map((k) => hit(T, BT(50, k) + 0.02, 14));
	const z = 1.06 + 0.035 * fl.reduce((a, b) => a + b, 0) + 0.02 * u, bloom = sm(seg(T, BT(50, 3.55), D(51)));
	return <g><Cam z={z} rot={-2.5 + 0.8 * u} py={-10}>
		<g transform="translate(-200,-40) scale(1.2)"><Portico y0={y0} /></g>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#14171c" opacity={0.3} />
		<Karl stage="protest" id="sg_k" x={x} g={g} h={h} pose={pose} rims={RIM_W} />
		{/* the handwritten cardboard sign (marker scrawl, deliberately unreadable) */}
		<g transform={`translate(${f1(cx)},${f1(cy - 60 + 30 * (1 - up))}) rotate(${f1(-3 + 4 * (1 - up))})`}>
			<rect x={-150} y={-90} width={300} height={170} fill="#b49a72" /><rect x={-150} y={-90} width={300} height={170} fill="none" stroke="#7a6446" strokeWidth={3} />
			{[0, 1, 2].map((j) => <path key={j} d={`M${-120},${-50 + j * 46} ` + Array.from({length: 9}, (_, k) => `q${10},${f1(-18 + 30 * rnd(j * 9 + k, 3))} ${f1(24 + 6 * rnd(k, j))},${f1(-4 + 8 * rnd(j * 9 + k, 4))}`).join(' ')} stroke="#2a2220" strokeWidth={7} fill="none" strokeLinecap="round" />)}
		</g>
		<Press px={700} h={760} i={2} f={fl[2]} /><Press px={1500} h={780} i={3} f={fl[3]} flip /><Press px={250} h={1000} i={0} f={fl[0]} /><Press px={1750} h={1040} i={1} f={fl[1]} flip />
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#ffffff" opacity={0.1 * Math.max(...fl)} />
	</Cam>
		{/* the last flash blooms into the snow of the next shot */}
		{bloom > 0 && <rect width={W} height={H} fill="#f4f6f8" opacity={0.85 * bloom} />}
	</g>;
};

/* ====================== bars 51–52 · Russia, ten years: one tracking shot, a new season wipes in on every beat of bar 51 ====================== */
type Season = {sky: [string, string, string]; ground: string; road: string; far: string; mid: string; trunk: string; crown?: string; snow: number; night?: boolean; sun?: [string, number]; frost: number; leaves?: boolean};
const SEAS: Season[] = [
	{sky: ['#4a5466', '#9aa2b0', '#d8b8a8'], ground: '#cfd6dc', road: '#8a929a', far: '#3a4250', mid: '#5a6270', trunk: '#c8ccd0', snow: 0.6, sun: ['#ffd0b0', 0.6], frost: 0.8},
	{sky: ['#3a6a86', '#8ab4c8', '#c8dcd8'], ground: '#4e6a40', road: '#6a6656', far: '#2c4a34', mid: '#3e5a38', trunk: '#d8d8d0', crown: '#3a5a32', snow: 0, sun: ['#fff4d0', 0.5], frost: 0},
	{sky: ['#5a4a42', '#b08a64', '#e0c08a'], ground: '#6a5232', road: '#5a4c3c', far: '#3e3226', mid: '#5a4630', trunk: '#d0c8b8', crown: '#b08036', snow: 0, sun: ['#ffd890', 0.55], frost: 0, leaves: true},
	{sky: ['#060a14', '#1a2234', '#2e3a4e'], ground: '#5a6676', road: '#3e4652', far: '#121a26', mid: '#1e2836', trunk: '#7a8290', snow: 1, night: true, frost: 1},
];
const RX = 800, RG = 870, RH = 380;
const RussiaWorld: React.FC<{s: Season; i: number; d: number; T: number; bump: number}> = ({s, i, d, T, bump}) => {
	const id = `rw${i}`, pose = walkB(d, RH, 8), wind = s.snow > 0 ? 1 : 0;
	return <g>
		<Sky id={`${id}s`} stops={[[0, s.sky[0]], [0.55, s.sky[1]], [0.7, s.sky[2]], [1, s.sky[2]]]} />
		{s.sun && <Glow x={1500} y={560} r={520} c={s.sun[0]} o={s.sun[1]} id={`${id}sun`} />}
		{s.night && Array.from({length: 40}, (_, k) => <circle key={k} cx={f1(rnd(k, 3) * W)} cy={f1(rnd(k, 4) * 420)} r={1.4} fill="#e8eef8" opacity={0.5} />)}
		{/* far ridge of taiga (parallax 0.15) */}
		<g transform={`translate(${f1(-(d * 0.15) % 600)},0)`}>
			<path d={ridgeD(600, 30, 1.7 + i, {f: 1.4, x0: -400, x1: W + 1000})} fill={s.far} />
			{Array.from({length: 40}, (_, k) => <path key={k} d={pineD(-300 + k * 64 + rnd(k, 7) * 30, 650, 90 + 60 * rnd(k, 8), 30, k)} fill={s.far} />)}
		</g>
		{/* birch wood (0.45) */}
		<g transform={`translate(${f1(-((d * 0.45) % 1040))},0)`}>
			<rect x={-400} y={640} width={W + 2000} height={300} fill={s.mid} opacity={0.6} />
			{Array.from({length: 22}, (_, k) => { const bx = -200 + k * 104 + rnd(k % 10, i + 5) * 40, bh = 330 + 140 * rnd(k % 10, 6);
				return <g key={k}>{s.crown && <ellipse cx={bx} cy={760 - bh + 50} rx={64} ry={100} fill={s.crown} opacity={0.95} />}<Birch x={bx} g={790 + 20 * rnd(k % 10, 7)} h={bh} w={13} bark={s.trunk} seed={k % 10} /></g>; })}
		</g>
		{/* the road: verge, ruts, snow banks (moves with him: 1.0) */}
		<rect x={-200} y={780} width={W + 400} height={400} fill={s.ground} />
		<rect x={-200} y={820} width={W + 400} height={120} fill={s.road} />
		<g transform={`translate(${f1(-(d % 260))},0)`}>{Array.from({length: 12}, (_, k) => <rect key={k} x={-260 + k * 260} y={850 + (k % 2) * 34} width={150} height={5} fill="#000" opacity={0.18} />)}
			{s.snow > 0 && Array.from({length: 12}, (_, k) => <ellipse key={`b${k}`} cx={-200 + k * 260 + 60 * rnd(k, 9)} cy={950} rx={110} ry={18} fill="#e4eaee" opacity={0.7} />)}</g>
		<Karl stage={s.frost > 0 ? 'russiaHood' : 'russia'} id={`${id}k`} x={RX} g={RG} h={RH} pose={pose} rims={[{c: s.night ? '#b8c8e0' : '#ffe2c4', o: 0.6, dx: 2.4, dy: -1.6}]} cart={{dist: d / RH}} />
		{/* weather */}
		{s.snow > 0 && <g>{Array.from({length: Math.round(90 * s.snow)}, (_, k) => { const sp = 0.6 + 0.8 * rnd(k, i + 11), x = ((rnd(k, i + 12) * 2200 - T * (420 + 260 * wind) * sp - d * 0.8) % 2200 + 2200) % 2200 - 140, y = ((rnd(k, i + 13) * 1180 + T * 260 * sp) % 1180) - 50, L = 10 + 16 * sp;
			return <line key={k} x1={f1(x)} y1={f1(y)} x2={f1(x + L)} y2={f1(y - L * 0.5)} stroke="#f2f6f8" strokeWidth={f1(1.6 + 1.6 * rnd(k, 14))} strokeLinecap="round" opacity={0.75 * (0.5 + 0.5 * rnd(k, 15))} />; })}</g>}
		{s.leaves && Array.from({length: 26}, (_, k) => { const q = ((T * 0.5 + rnd(k, 9)) % 1); return <ellipse key={k} cx={f1(((rnd(k, 8) * 2200 - 600 * q - d * 0.6) % 2200 + 2200) % 2200 - 140)} cy={f1(120 + 860 * q)} rx={7} ry={4} fill="#c89a48" opacity={0.9} transform={`rotate(${f1(q * 540)} ${f1(((rnd(k, 8) * 2200 - 600 * q - d * 0.6) % 2200 + 2200) % 2200 - 140)} ${f1(120 + 860 * q)})`} />; })}
		{bump > 0.01 && <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#ffffff" opacity={0.12 * bump} />}
	</g>;
};
export const RussiaScene: SC = ({T}) => {
	const u = T - D(51), d = vBrisk(RH) * (u + 4), k = Math.max(0, Math.min(3, Math.floor(u / BEAT + 1e-6)));
	const edge = (j: number) => lerp(-420, 2400, eout(seg(T, BT(51, j), BT(51, j) + 0.22)));
	const bump = hit(T, BT(51, k), 10), snowIn = 1 - sm(seg(u, 0, 0.18));
	const cam = {z: 1.04 + 0.03 * bump + 0.015 * u, rot: -1.5, py: 6 * Math.sin(u * 5.2) * 0.5};
	const layer = (j: number) => <RussiaWorld s={SEAS[j]} i={j} d={d} T={T} bump={j === k ? bump : 0} />;
	const e = edge(k), wiping = k > 0 && e < 2390;
	return <g><Cam {...cam}>
		{wiping ? layer(k - 1) : layer(k)}
		{wiping && <g><defs><clipPath id="rw_clip"><path d={poly([[-400, -300], [e + 220, -300], [e - 220, H + 300], [-400, H + 300]])} /></clipPath></defs>
			<g clipPath="url(#rw_clip)">{layer(k)}</g>
			<path d={`M${f1(e + 220)},-300 L${f1(e - 220)},${H + 300}`} stroke="#fff6e6" strokeWidth={10} opacity={0.75} />
			<path d={`M${f1(e + 220)},-300 L${f1(e - 220)},${H + 300}`} stroke="#fff6e6" strokeWidth={46} opacity={0.18} /></g>}
	</Cam>
		{snowIn > 0 && <rect width={W} height={H} fill="#f4f6f8" opacity={0.85 * snowIn} />}
	</g>;
};

/* ====================== bar 53 · the globe: the gold head runs out of Siberia into Mongolia, then dives into the steppe ====================== */
const UB: LL = [106.9, 47.9];
const pA = (T: number) => lerp(0.634, 0.6706, trap(seg(T, D(53) - 0.05, BT(53, 1.6)), 0.25)) + 0.004 * seg(T, BT(53, 1.6), BT(53, 2.9));
/** the chase out of Siberia into Mongolia, then the camera drops toward the head (the haze takes over; the steppe's sun is the head) */
export const globeAView = (T: number) => {
	const p = pA(T), dv = sm(seg(T, BT(53, 1.4), BT(53, 2.8))), base = chaseSat(p, 1.05, 26, 960, 640, 0, undefined, ROLL_A);
	return {p, dv, v: mixSat(base, {...base, alt: 0.62}, dv)};
};
export const GlobeAScene: SC = ({T}) => {
	const {p, v, dv} = globeAView(T), pop = (t0: number) => eout(seg(T, t0, t0 + 0.2));
	const haze = sm(seg(dv, 0.5, 0.92));
	return <g>
		<Space id="gAs" drift={(T - D(53)) * 20} />
		<Earth id="gA" v={v} route={{p0: 0, p1: p, head: p, headO: 1 + 0.4 * hit(T, BT(53, 1.6), 6)}}
			pins={[{ll: [96, 61], label: '俄罗斯', o: (1 - pop(BT(53, 1.2))) * (1 - haze)}, {ll: UB, label: '蒙古', kind: 'start', o: pop(BT(53, 1.45)) * (1 - haze), dy: -30}]} />
		{haze > 0 && <rect width={W} height={H} fill="#e8c898" opacity={0.92 * haze} />}
	</g>;
};

/* ---------- a Bactrian camel, facing right, loaded; local units ≈ cm, ground at 0; ph = gait phase ---------- */
const camelD = (ph: number): string[] => {
	const leg = (hx: number, hy: number, a: number, bend: number): string => { const r = a * Math.PI / 180, kx = hx + Math.sin(r) * 62, ky = hy + Math.cos(r) * 62, r2 = (a - bend) * Math.PI / 180, fx = kx + Math.sin(r2) * 64, fy = Math.min(0, ky + Math.cos(r2) * 64);
		return spline([[hx - 9, hy], [kx - 6, ky], [fx - 6, fy - 4], [fx + 9, fy], [fx + 8, fy - 6], [kx + 6, ky], [hx + 10, hy]]); };
	const s1 = Math.sin(ph * Math.PI * 2), s2 = Math.sin(ph * Math.PI * 2 + Math.PI);
	const body = spline([[-82, -150], [-70, -178], [-52, -214], [-34, -222], [-18, -196], [-2, -192], [16, -222], [34, -226], [52, -196], [76, -176], [96, -160], [120, -170], [140, -206], [150, -222], [170, -224], [186, -214], [190, -204], [176, -200], [160, -196], [150, -170], [130, -132], [100, -122], [70, -116], [20, -112], [-40, -116], [-74, -126]]);
	const bags = spline([[-30, -206], [-42, -168], [-36, -140], [-10, -136], [-4, -168], [8, -168], [14, -136], [40, -140], [44, -168], [30, -206]]);
	return [body, bags, leg(-56, -130, 18 * s1, -14), leg(-44, -128, 18 * s2, -14), leg(64, -128, 16 * s2, 12), leg(78, -128, 16 * s1, 12)];
};
const Camel: React.FC<{x: number; g: number; s: number; ph: number; rim?: string}> = ({x, g, s, ph, rim = '#ffe0b0'}) => { const ds = camelD(ph);
	return <g transform={`translate(${f1(x)},${f1(g)}) scale(${s.toFixed(3)})`}><g transform={`translate(${f1(-2.4 / s)},${f1(-1.8 / s)})`} opacity={0.6}>{ds.map((d, i) => <path key={i} d={d} fill={rim} />)}</g>{ds.map((d, i) => <path key={i} d={d} fill={FIGC} />)}</g>; };
const Ger: React.FC<{x: number; g: number; s: number}> = ({x, g, s}) => <g transform={`translate(${x},${g}) scale(${s})`}>
	<path d="M-100,0 L-100,-70 Q0,-80 100,-70 L100,0 Z" fill="#d8ccb4" /><path d="M-112,-66 Q0,-150 112,-66 Q0,-84 -112,-66 Z" fill="#c4b89e" />
	<rect x={-20} y={-56} width={40} height={56} fill="#7a3a2a" /><rect x={-8} y={-126} width={16} height={14} fill="#5a4a3a" /></g>;
/** bar 53 (2nd half) · Mongolia, 2017: he leads the camel caravan across the steppe toward the low sun (the globe's head becomes the sun) */
const SH = 330, SG = 860;
export const SteppeScene: SC = ({T}) => {
	const u = T - BT(53, 2.4), vv = vNat(SH), dd = vv * (u + 3), xg = 860 + vv * u, camPx = -vv * u * 0.8, cs = SH / 180 * 0.95;
	const pose = withArms(walkD(dd, SH, 4), null, [40, 10]), lead = jointAt(pose, 'RHand', xg, SG, SH);
	return <g>
		<Sky id="st_s" stops={[[0, '#3e4a5e'], [0.42, '#a88a6c'], [0.56, '#f0c890'], [1, '#f0c890']]} />
		<Glow x={960} y={640} r={620} c="#ffd8a0" o={0.65} id="st_g" /><Glow x={960} y={640} r={140} c="#fff4dc" o={0.9} id="st_g2" /><circle cx={960} cy={640} r={30} fill="#fffaf0" />
		<g transform={`translate(${f1(camPx * 0.15)},0)`}><path d={ridgeD(640, 30, 2.4, {f: 0.9, sharp: 0.4})} fill="#8a7c6c" opacity={0.85} /><path d={ridgeD(680, 20, 5.1, {f: 0.7})} fill="#9a8458" />
			<Ger x={260} g={690} s={0.7} /><Ger x={420} g={698} s={0.56} /></g>
		<g transform={`translate(${f1(camPx)},0)`}>
			<rect x={-400} y={700} width={W + 1600} height={H} fill="#6a5434" />
			{Array.from({length: 80}, (_, i) => <path key={i} d={`M${f1(rnd(i, 1) * 3200 - 300)},${f1(720 + 360 * Math.pow(rnd(i, 2), 1.4))} l6,${f1(-14 - 10 * rnd(i, 3))} l6,14`} fill="#3e3220" opacity={0.7} />)}
			<path d={`M-400,${SG + 8} Q${W / 2},${SG - 6} ${W + 1200},${SG + 10}`} stroke="#e8c088" strokeWidth={3} opacity={0.4} fill="none" />
			{[0, 1, 2].map((i) => <Camel key={i} x={xg - 260 - i * 330} g={SG + 4} s={cs} ph={(dd - i * 90) / (0.7 * SH)} />)}
			<path d={`M${f1(xg - 260 + 186 * cs)},${f1(SG - 204 * cs)} Q${f1(xg - 70)},${f1(SG - 150)} ${f1(lead[0])},${f1(lead[1])}`} stroke={FIGC} strokeWidth={3} fill="none" />
			<Karl stage="steppe" id="st_k" x={xg} g={SG} h={SH} pose={pose} rims={[{c: '#ffe0b0', o: 0.7, dx: 2.4, dy: -1.6}]} />
		</g>
		{/* the haze of the dive clears off the steppe */}
		<rect width={W} height={H} fill="#e8c898" opacity={0.92 * (1 - sm(seg(T, BT(53, 2.55), BT(53, 3.3))))} />
	</g>;
};
/** the wipe into China: a camel's flank passes right across the lens */
export const CamelWipe: SC = ({T}) => {
	const k = seg(T, BT(54, 2) - 0.24, BT(54, 2) + 0.2); if (k <= 0 || k >= 1) return null;
	const x = lerp(-2600, 2700, k);
	return <g transform={`translate(${f1(x)},0)`}><Blur id="cw_b" s={10}>
		<path d={`M-1300,1300 L-1300,250 Q-1100,40 -760,90 Q-560,-120 -320,60 Q-120,-150 120,40 Q420,-20 700,180 Q980,260 1100,700 L1150,1300 Z`} fill="#0a0806" /></Blur></g>;
};

/* ====================== bar 54 · China, 2018: alone with his pack on a mountain road (tracking); stride-match into the gate ====================== */
const CX = 760, CG = 860, CH = 340;
const dWalk = (T: number) => vBrisk(CH) * (T - D(54) + 2);
export const ChinaScene: SC = ({T}) => {
	const u = T - D(54), dd = dWalk(T), pose = strapD(dd, CH, 7);
	return <g><Cam z={1.03 + 0.01 * u} py={4}>
		<Sky id="cn_s" stops={[[0, '#26324a'], [0.5, '#6a7c98'], [0.7, '#c8b8a8'], [1, '#c8b8a8']]} />
		<Glow x={1400} y={520} r={600} c="#ffe0b8" o={0.35} id="cn_g" />
		<g transform={`translate(${f1(-dd * 0.06)},0)`}>
			<path d={ridgeD(470, 210, 3.3, {f: 1.0, sharp: 0.85, step: 10, x0: -400, x1: W + 600})} fill="#8e9ab0" />
			<g opacity={0.95}><defs><clipPath id="cn_c"><path d={ridgeD(470, 210, 3.3, {f: 1.0, sharp: 0.85, step: 10, x0: -400, x1: W + 600})} /></clipPath></defs>
				<rect x={-400} y={150} width={W + 1000} height={250} fill="#eef0f4" clipPath="url(#cn_c)" /><rect x={-400} y={150} width={W + 1000} height={120} fill="#ffe2b8" opacity={0.45} clipPath="url(#cn_c)" /></g>
		</g>
		<g transform={`translate(${f1(-dd * 0.2)},0)`}><path d={ridgeD(600, 150, 6.2, {f: 1.4, sharp: 0.7, step: 10, x0: -400, x1: W + 900})} fill="#4e5a6c" /></g>
		<g transform={`translate(${f1(-dd * 0.5)},0)`}><path d={ridgeD(720, 90, 1.9, {f: 1.2, sharp: 0.5, x0: -400, x1: W + 1600})} fill="#343e4c" /></g>
		{/* the road ledge: asphalt, a guard rail with posts, the drop below (moves with him) */}
		<rect x={-200} y={CG - 6} width={W + 400} height={60} fill="#3a3c40" /><rect x={-200} y={CG + 54} width={W + 400} height={H} fill="#22262e" />
		<g transform={`translate(${f1(-(dd % 220))},0)`}>
			<rect x={-300} y={CG + 18} width={W + 800} height={4} fill="#c8c8c0" opacity={0.35} />
			{Array.from({length: 12}, (_, k) => <rect key={k} x={-220 + k * 220} y={CG - 52} width={10} height={58} fill="#16181c" />)}
			<rect x={-300} y={CG - 56} width={W + 800} height={14} fill="#5a5e64" /><rect x={-300} y={CG - 56} width={W + 800} height={3} fill="#d8dce0" opacity={0.5} />
		</g>
		<Karl stage="china" id="cn_k" x={CX} g={CG} h={CH} pose={pose} rims={[{c: '#ffe8c8', o: 0.6, dx: 2.4, dy: -1.6}]} />
		<Specks t={T} n={24} seed={8} col="#ffffff" o={0.35} vx={-160} vy={30} r={1.8} />
	</Cam></g>;
};

/* ====================== bars 55–57 · the closed gate (Iran's visa never came), the pandemic drains the colour, the road ends ====================== */
const satF = (id: string, s: number) => <filter id={id} x="-100" y="-100" width="2120" height="1280" filterUnits="userSpaceOnUse"><feColorMatrix type="saturate" values={s.toFixed(3)} /></filter>;
export const GateScene: SC = ({T}) => {
	const u = T - D(55), stopT = BT(55, 1.6), v = vBrisk(CH);
	// he walks on (same stride as the China shot), the camera holds, he eases to a stop before the gate
	const tt = Math.min(T, stopT) - D(55), ease = T < stopT - 0.35 ? tt : (stopT - 0.35 - D(55)) + 0.35 * (1 - Math.pow(1 - Math.min(1, (T - (stopT - 0.35)) / 0.35), 2)) / 2;
	const x = CX + v * ease, dd = dWalk(D(55)) + v * ease;
	let pose = T < stopT ? strapD(dd, CH, 7) : STAND_PACK;
	if (T >= stopT - 0.3 && T < stopT) pose = mixPose(strapD(dd, CH, 7), STAND_PACK, sm(seg(T, stopT - 0.3, stopT)));
	const xk = seg(T, BT(55, 2), BT(55, 2) + 0.18), xb = hit(T, BT(55, 2), 9);
	const drain = sm(seg(T, D(56), D(56) + 0.3)), db = hit(T, D(56), 8);
	const bow = sm(seg(T, D(56) + 0.1, D(56) + 0.8)) * (1 - sm(seg(T, BT(57, 2.4), BT(57, 3.2))));
	pose = nod(pose, 18 * bow - 8 * sm(seg(T, BT(57, 2.4), BT(57, 3.2))));
	const gone = sm(seg(T, D(57), D(57) + 1.1));        // the gate, fence and booth dissolve: only the road that ends is left
	const pull = eio(seg(T, D(57), D(58) + 0.2));
	const cam = {z: lerp(1.04 + 0.04 * xb + 0.03 * db + 0.02 * seg(u, 0, 3.4), 0.92, pull), px: lerp(0, -40, pull), py: lerp(0, 30, pull)};
	return <g>
		<defs>{satF('gt_sat', 1 - 0.92 * drain)}</defs>
		<g filter={drain > 0.001 ? 'url(#gt_sat)' : undefined}><Cam {...cam}>
			<Sky id="gt_s" stops={[[0, '#5a5c66'], [0.55, '#c0ac90'], [0.64, '#d6c2a0'], [1, '#d6c2a0']]} />
			<Glow x={1450} y={480} r={520} c="#fff0d0" o={0.4 * (1 - drain)} id="gt_g" />
			<path d={ridgeD(660, 22, 4.2, {f: 1.3, sharp: 0.3})} fill="#9a8a72" />
			<rect x={-400} y={668} width={W + 800} height={H} fill="#ae9a7a" />
			{Array.from({length: 40}, (_, i) => <ellipse key={i} cx={rnd(i, 1) * 2200 - 100} cy={720 + 360 * Math.pow(rnd(i, 2), 1.5)} rx={20 + 40 * rnd(i, 3)} ry={3 + 4 * rnd(i, 4)} fill="#8a7658" opacity={0.5} />)}
			{/* the road: it ends in a broken edge a little past the gate */}
			<path d={`M-300,${CG + 70} L-300,${CG - 10} L1260,${CG - 10} ${Array.from({length: 7}, (_, i) => `L${1270 + i * 26},${CG - 6 + (i % 2 ? 14 : -2)}`).join(' ')} L1460,${CG + 70} Z`} fill="#56504a" />
			<path d={`M-300,${CG + 30} H1240`} stroke="#d8d0b8" strokeWidth={5} strokeDasharray="60 60" opacity={0.45} />
			<g opacity={1 - gone}>
				<g stroke="#2a2420" strokeWidth={4}>{Array.from({length: 16}, (_, i) => { const xx = 1530 + i * 90; return <line key={i} x1={xx} y1={CG - 4} x2={xx} y2={CG - 150} />; })}<line x1={1530} y1={CG - 140} x2={3000} y2={CG - 140} /><line x1={1530} y1={CG - 90} x2={3000} y2={CG - 90} /></g>
				<rect x={1560} y={CG - 300} width={190} height={296} fill="#2a2420" /><rect x={1540} y={CG - 318} width={230} height={22} fill="#1a1614" /><rect x={1600} y={CG - 250} width={110} height={70} fill="#e8c890" opacity={0.55 * (1 - drain)} />
				<rect x={1240} y={CG - 380} width={36} height={376} fill="#1e1a18" /><rect x={1486} y={CG - 380} width={36} height={376} fill="#1e1a18" />
				<g fill="#2a2420">{Array.from({length: 11}, (_, i) => <rect key={i} x={1282 + i * 18.5} y={CG - 300} width={7} height={296} />)}<rect x={1276} y={CG - 306} width={210} height={12} fill="#2a2420" /><rect x={1276} y={CG - 160} width={210} height={10} /></g>
				{/* the ✕ plate lands on beat 3 */}
				{xk > 0 && <g transform={`translate(1382,${CG - 420}) scale(${(0.5 + 0.5 * eout(xk) + 0.15 * xb).toFixed(3)})`}><circle r={56} fill="#e8e0d0" /><circle r={56} fill="none" stroke="#a02a22" strokeWidth={10} /><path d="M-28,-28 L28,28 M28,-28 L-28,28" stroke="#a02a22" strokeWidth={13} strokeLinecap="round" /></g>}
			</g>
			<Karl stage="china" id="gt_k" x={x} g={CG} h={CH} pose={pose} rims={[{c: '#fff0d0', o: 0.6 * (1 - drain) + 0.25, dx: 2.4, dy: -1.6}]} />
			<path d={`M${f1(x - 60)},${CG + 4} L${f1(x - 320)},${CG + 40} L${f1(x - 250)},${CG + 46} L${f1(x + 30)},${CG + 6} Z`} fill="#000" opacity={0.2 * (1 - drain)} />
			{/* the dust that blows in with the pandemic */}
			{drain > 0 && <Specks t={T} n={60} seed={11} col="#e0dcd4" o={0.35 * drain} vx={-260} vy={14} r={2.4} box={[-200, 420, W + 400, 640]} />}
		</Cam></g>
		{db > 0.01 && <rect width={W} height={H} fill="#000" opacity={0.25 * db} />}
	</g>;
};

/* ====================== bar 58 · 2024, the Caspian shore: a match dissolve from the dead road (same place on screen, the sea fills the horizon) ====================== */
const SHX = 1000, SHG = CG, SHH = CH;
export const ShoreScene: SC = ({T}) => {
	const u = T - D(58), hz = 560, rise = eio(seg(u, 0, 1.9));
	return <g><Cam z={lerp(0.98, 1.06, rise)} py={lerp(10, -30, rise)}>
		<Sky id="sh_s" stops={[[0, '#3a4656'], [0.55, '#9aa6b0'], [0.62, '#d4cec2'], [1, '#d4cec2']]} />
		<Glow x={1500} y={480} r={600} c="#fff4e0" o={0.5} id="sh_g" />
		<rect x={-400} y={hz} width={W + 800} height={H} fill="#5c6c78" />
		<Glints t={T} y0={hz + 4} y1={SHG + 40} n={120} col="#eef2f4" o={0.32} seed={4} speed={16} />
		{/* the support boat waiting offshore */}
		<g transform="translate(1560,600)"><path d="M-90,0 L90,0 L72,20 L-78,20 Z" fill="#dcdcd6" /><rect x={-44} y={-34} width={66} height={34} fill="#c8c8c4" /><rect x={-36} y={-26} width={20} height={12} fill="#3a4450" /><rect x={-2} y={-74} width={3} height={40} fill="#3a3a3a" /></g>
		{[0, 1, 2].map((i) => { const k = ((T * 0.35 + i / 3) % 1), y = lerp(640, SHG + 10, k); return <path key={i} d={`M${f1(1100 - 300 * k)},${f1(y)} Q1500,${f1(y - 8)} 2300,${f1(y - 30 + 20 * k)}`} stroke="#eef2f4" strokeWidth={f1(2 + 4 * k)} fill="none" opacity={0.55 * Math.sin(k * Math.PI)} />; })}
		{/* the pebble beach he stands on */}
		<path d={`M-400,${H + 60} L-400,${SHG - 20} Q600,${SHG - 30} 1300,${SHG + 10} Q1500,${SHG + 40} 1700,${H + 60} Z`} fill="#5e5850" />
		<path d={`M-400,${SHG - 20} Q600,${SHG - 30} 1300,${SHG + 10} Q1500,${SHG + 40} 1700,${H + 60}`} stroke="#e8e4dc" strokeWidth={4} fill="none" opacity={0.6} />
		{Array.from({length: 60}, (_, i) => <ellipse key={i} cx={-300 + rnd(i, 1) * 1800} cy={SHG + 20 + rnd(i, 2) * 200} rx={6 + 10 * rnd(i, 3)} ry={4 + 5 * rnd(i, 4)} fill="#46403a" />)}
		<Karl stage="swim" look={{pack: 'big'}} id="sh_k" x={SHX} g={SHG} h={SHH} pose={STAND_PACK} rims={[{c: '#fff6e8', o: 0.6, dx: 2.4, dy: -1.6}]} />
		<PackProp x={-999} y={-999} h={1} />
	</Cam></g>;
};

/* ====================== bars 59–60 · the pack thumps onto the pebbles (beat 2); then he wades in, wetsuit on, and dives (bar 60 beat 4) ====================== */
export const PackDropScene: SC = ({T}) => {
	const u = T - D(59), land = BT(59, 1), fall = seg(T, D(59) + 0.05, land), y = T < land ? lerp(-260, 820, fall * fall) : 820 - 40 * Math.abs(Math.sin((T - land) * 9)) * Math.exp(-(T - land) * 7);
	const a = T < land ? lerp(-30, 72, fall) : 78 - 6 * Math.exp(-(T - land) * 6), hb = hit(T, land, 10);
	// his legs walk past toward the water (in front of the pack), the steps on beats 3 and 4
	const LH = 1250, lg = 1010, lx = lerp(500, 2300, seg(T, BT(59, 1.4), D(60) + 0.15)), lp = walkD(lx + 200, LH, 2);
	return <g><Cam z={1.02 + 0.04 * hb} rot={2} py={-10 * hb}>
		<Sky id="pd_s" stops={[[0, '#7a8692'], [0.6, '#c8ccd0'], [1, '#c8ccd0']]} />
		<rect x={-400} y={430} width={W + 800} height={300} fill="#5c6c78" /><Glints t={T} y0={434} y1={700} n={60} col="#eef2f4" o={0.3} seed={6} speed={14} />
		<path d={`M-400,${H + 60} L-400,690 Q900,660 2400,700 L2400,${H + 60} Z`} fill="#5a544c" />
		{Array.from({length: 70}, (_, i) => { const px = -300 + rnd(i, 1) * 2500, py = 720 + rnd(i, 2) * 380, jump = hit(T, land, 8) * 30 * rnd(i, 5) * Math.max(0, 1 - Math.abs(px - 900) / 500);
			return <ellipse key={i} cx={f1(px)} cy={f1(py - jump)} rx={f1((10 + 18 * rnd(i, 3)) * (0.6 + (py - 700) / 500))} ry={f1((7 + 10 * rnd(i, 4)) * (0.6 + (py - 700) / 500))} fill={i % 3 ? '#3e3a34' : '#6e685e'} />; })}
		<PackProp x={900} y={y} h={1050} a={a} col="#23251c" rims={[{c: '#fff6e8', o: 0.6, dx: -2.4, dy: -1.6}]} />
		{hb > 0.05 && Array.from({length: 10}, (_, i) => { const q = 1 - hb; return <circle key={i} cx={f1(900 + (rnd(i, 7) - 0.5) * 500 * q)} cy={f1(980 - 120 * Math.sin(q * Math.PI) * rnd(i, 8))} r={f1(5 + 6 * rnd(i, 9))} fill="#4a453e" />; })}
		{lx > -150 && lx < 2250 && <Karl stage="swim" id="pd_k" x={lx} g={lg} h={LH} pose={lp} rims={[{c: '#fff6e8', o: 0.5, dx: -2.4, dy: -1.6}]} />}
	</Cam></g>;
};
export const WadeScene: SC = ({T}) => {
	const u = T - D(60), hz = 470, h = 380, wl = 800, x = lerp(700, 1080, seg(u, 0, 1.25)), dd = (x - 700), depth = seg(x, 760, 1080), dive = sm(seg(T, BT(60, 2.85), BT(60, 3.5)));
	let pose = walkD(dd, h, 4 + 30 * dive);
	if (dive > 0) pose = mixPose(pose, grounded({lean: 70, neck: -30, lt: 30, lk: 10, rt: -40, rk: 10, la: 170, le: 0, ra: 165, re: 5}), dive);
	const g = wl + lerp(0.08, 0.4, depth) * h + dive * 120, splash = hit(T, BT(60, 3.25), 4);
	return <g><Cam z={1.03 + 0.03 * hit(T, BT(60, 3.25), 7)} px={-20 * u}>
		<Sky id="wd_s" stops={[[0, '#4a5a6c'], [0.6, '#bcc2c4'], [1, '#d8d6d0']]} />
		<Glow x={1450} y={360} r={520} c="#fff4dc" o={0.45} id="wd_g" />
		<rect x={-400} y={hz} width={W + 800} height={H} fill="#5a6a76" /><Glints t={T} y0={hz + 4} y1={H} n={120} col="#e8eef2" o={0.28} seed={9} speed={14} />
		<g transform="translate(1540,560)"><path d="M-120,0 L120,0 L96,26 L-104,26 Z" fill="#e2e2dc" /><rect x={-60} y={-46} width={90} height={46} fill="#cfd0cc" /><rect x={-50} y={-36} width={30} height={16} fill="#3a4450" /><rect x={-10} y={-36} width={30} height={16} fill="#3a4450" /><rect x={-4} y={-96} width={4} height={50} fill="#3a3a3a" /></g>
		<path d={`M-400,${H + 60} L-400,760 Q300,790 700,${wl + 30} Q760,${wl + 120} 640,${H + 60} Z`} fill="#5e5850" />
		<Karl stage="swim" id="wd_k" x={x} g={g} h={h} pose={pose} rims={[{c: '#fff6e8', o: 0.6, dx: 2.4, dy: -1.6}]} />
		<rect x={-400} y={wl} width={W + 800} height={H} fill="#46566a" opacity={0.93} />
		<path d={`M-400,${H + 60} L-400,760 Q300,790 700,${wl + 30} Q760,${wl + 120} 640,${H + 60} Z`} fill="#5e5850" />
		{Array.from({length: 30}, (_, i) => <ellipse key={i} cx={-300 + rnd(i, 1) * 900} cy={820 + rnd(i, 2) * 230} rx={6 + 10 * rnd(i, 3)} ry={4 + 5 * rnd(i, 4)} fill="#46403a" />)}
		{[0, 1].map((i) => { const k = ((T * 0.9 + i / 2) % 1); return <ellipse key={i} cx={f1(x)} cy={wl + 3} rx={f1(50 + 120 * k)} ry={f1(7 + 10 * k)} fill="none" stroke="#eef2f4" strokeWidth={2.5} opacity={0.5 * (1 - k)} />; })}
		{splash > 0.02 && Array.from({length: 26}, (_, i) => { const q = 1 - splash, a = -Math.PI * (0.1 + 0.8 * rnd(i, 3)); return <circle key={i} cx={f1(x + 120 + Math.cos(a) * 260 * q * rnd(i, 4))} cy={f1(wl - 10 + Math.sin(a) * 300 * q * rnd(i, 5) + 400 * q * q)} r={f1(4 + 8 * rnd(i, 6))} fill="#f4f8fa" opacity={0.85 * splash} />; })}
		<Glints t={T + 2} y0={wl + 6} y1={H} n={40} col="#e8eef2" o={0.25} seed={5} speed={14} />
	</Cam>
		{/* the white water of the dive fills the lens (into the top-down sea) */}
		<rect width={W} height={H} fill="#eef4f6" opacity={0.9 * sm(seg(T, BT(60, 3.45), D(61)))} />
	</g>;
};

/* ====================== bar 61 · up out of the water to the globe: the gold line crosses the Caspian ====================== */
const CASPIAN_C: LL = [50.6, 42.2];
export const pB = (T: number) => lerp(0.8517, 0.8575, sm(seg(T, D(61), D(62) + 1.2)));
/** up out of the water: from just above the sea (the Caspian fills the frame) to the whole region, the line crossing the water */
export const globeBView = (T: number): {p: number; v: SatView} => {
	const k = seg(T, D(61) + 0.1, D(62) + 0.15), p = pB(T), head = routeAt(p), cl0 = head[0] + ((((CASPIAN_C[0] - head[0]) % 360) + 540) % 360 - 180), c: LL = [lerp(head[0], cl0, 0.6), lerp(head[1], CASPIAN_C[1], 0.6)];
	return {p, v: {lon: c[0], lat: c[1], alt: Math.exp(lerp(Math.log(0.11), Math.log(0.62), k)), tilt: lerp(0, 22, sm(k)), roll: lerp(-8, 4, k), cx: 960, cy: lerp(560, 640, k)}};
};
const SwimTop: React.FC<{x: number; y: number; t: number; i: number; s?: number}> = ({x, y, t, i, s = 1}) => { const ph = t * 1.4 + i;
	return <g transform={`translate(${x},${y}) scale(${s})`}><path d="M-90,-20 Q-40,0 -90,20" stroke="#e8eef2" strokeWidth={3} fill="none" opacity={0.5} />
		<ellipse cx={0} cy={0} rx={16} ry={13} fill="#14181c" /><ellipse cx={-30} cy={0} rx={30} ry={11} fill="#14181c" opacity={0.8} />
		<path d={`M-10,-8 Q${f1(10 + 18 * Math.sin(ph))},-36 ${f1(30 + 20 * Math.cos(ph))},-24`} stroke="#14181c" strokeWidth={9} fill="none" strokeLinecap="round" />
		<path d={`M-10,8 Q${f1(10 - 18 * Math.sin(ph))},36 ${f1(30 - 20 * Math.cos(ph))},24`} stroke="#14181c" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} /></g>; };
export const GlobeBScene: SC = ({T}) => {
	const {p, v} = globeBView(T), top = 1 - sm(seg(T, D(61) + 0.05, D(61) + 0.4)), white = 1 - sm(seg(T, D(61), D(61) + 0.18));
	const lab = eout(seg(T, BT(61, 1), BT(61, 1) + 0.2)), sea = satPt(v, CASPIAN_C);
	return <g>
		<Space id="gBs" drift={(T - D(61)) * 16} />
		<Earth id="gB" v={v} route={{p0: 0, p1: p, head: p}} />
		<CaspianSea v={v} route={{p0: 0.8517, p1: p}} />
		{(() => { const hp = satPt(v, routeAt(p)), bk = satPt(v, [49.87, 40.41]); return <>
			{hp && <><Glow x={hp[0]} y={hp[1]} r={46} c="#FFA62E" o={0.8} id="gB_h" /><circle cx={hp[0]} cy={hp[1]} r={5.5} fill="#fffaf0" /></>}
			{bk && <g opacity={lab * 0.9}><circle cx={bk[0]} cy={bk[1]} r={7} fill="#F4EAD8" stroke="#0a0d14" strokeWidth={3} /><Label x={bk[0]} y={bk[1] + 44} s="巴库" size={30} /></g>}</>; })()}
		{sea && <Label x={sea[0] + 40} y={sea[1] - 10} s="里海" size={44} o={lab} />}
		{/* the top-down sea right after the dive: the swimmer, the boat */}
		{top > 0.01 && <g opacity={top}><rect width={W} height={H} fill="#2c4a58" />
			{Array.from({length: 50}, (_, i) => { const y = -40 + i * 24, x0 = (((rnd(i, 1) * 2600 + T * 30) % 2600) - 400); return <path key={i} d={`M${f1(x0)},${y} q60,-10 120,0 t120,0`} stroke="#5a7a88" strokeWidth={3} fill="none" opacity={0.5} />; })}
			<SwimTop x={960} y={560} t={T} i={0} s={1.4} /></g>}
		{white > 0 && <rect width={W} height={H} fill="#eef4f6" opacity={0.9 * white} />}
	</g>;
};

/* ====================== bars 62–63 · a month at sea, as a time-lapse: day and night flip on the beats; km to 近300 ====================== */
type Light = {sky: [string, string, string]; sea: [string, string]; sun?: [number, number, string]; moon?: [number, number]; glint: string; stars: number; rim: string};
const LIGHTS: Light[] = [
	{sky: ['#3a6080', '#8ab0c8', '#d0dce0'], sea: ['#4a6a7c', '#1e3444'], sun: [1500, 300, '#fff6e0'], glint: '#ffffff', stars: 0, rim: '#fff4e0'},
	{sky: ['#2a2a48', '#a85a5a', '#f0a868'], sea: ['#5a4a58', '#1e2030'], sun: [1700, 560, '#ffc070'], glint: '#ffd0a0', stars: 0.2, rim: '#ffc890'},
	{sky: ['#04070e', '#0e1626', '#1a2436'], sea: ['#141c2c', '#06090e'], moon: [600, 260], glint: '#c8d4e8', stars: 1, rim: '#b8c8e0'},
	{sky: ['#1e2a48', '#6a6a8a', '#e8b8a0'], sea: ['#3a4660', '#141c28'], sun: [300, 560, '#ffd8b0'], glint: '#ffe0c8', stars: 0.3, rim: '#ffd8c0'},
];
const SEQ = [0, 1, 2, 3, 0, 1, 2, 2];
const mixC = (a: string, b: string, k: number) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join(''); };
const SeaKm: React.FC<{km: number}> = ({km}) => { const v = Math.round(km), txt = v >= 286 ? '近300' : `${v}`, k = Math.min(1, km / 288);
	useStampFonts(`${txt}公里哈萨克斯坦阿塞拜疆近0123456789`);
	return <g transform="translate(1770,330)">
		<text x={0} y={0} textAnchor="end" style={{fontFamily: "'Cormorant59','LXGW WenKai',serif", fontWeight: 600, fontSize: 78, fontVariantNumeric: 'lining-nums tabular-nums'}} fill={CREAM} stroke="rgba(8,8,10,0.7)" strokeWidth={6} paintOrder="stroke">{txt}<tspan style={{fontFamily: "'LXGW WenKai',serif", fontSize: 36}}> 公里</tspan></text>
		<Label x={-440} y={62} s="哈萨克斯坦" size={28} anchor="start" /><Label x={0} y={62} s="阿塞拜疆" size={28} anchor="end" />
		<rect x={-440} y={78} width={440} height={5} fill="#dfe6ec" opacity={0.4} /><rect x={-440} y={78} width={f1(440 * k)} height={5} fill={GOLD} /><circle cx={f1(-440 + 440 * k)} cy={80} r={9} fill={GOLD_HI} />
	</g>; };
export const SeaLapseScene: SC = ({T}) => {
	const u = T - D(62), bi = Math.max(0, Math.min(7, Math.floor(u / BEAT + 1e-6))), tr = sm(seg(u - bi * BEAT, 0, 0.14));
	const A = LIGHTS[SEQ[Math.max(0, bi - 1)]], B = LIGHTS[SEQ[bi]], m = (a: string, b: string) => mixC(a, b, bi === 0 ? 1 : tr);
	const sky = [0, 1, 2].map((i) => m(A.sky[i], B.sky[i])), sea = [0, 1].map((i) => m(A.sea[i], B.sea[i])), glint = m(A.glint, B.glint), rim = m(A.rim, B.rim), stars = lerp(A.stars, B.stars, bi === 0 ? 1 : tr);
	const hz = 560, km = 288 * eio(seg(u, 0.05, 1.70444 + 2 * BEAT));
	const push = eio(seg(T, BT(63, 1.6), BT(63, 3.05))), cabin: [number, number] = [1150 - 64, 600 - 46];
	const zc = Math.exp(lerp(0, Math.log(2.0), push)), bob = 5 * Math.sin(T * 2.3);
	const ph = T * 3.2, sw = Math.sin(ph), sx = 720, sy = 700 + 6 * Math.sin(T * 1.7);
	return <g><g><g transform={`translate(${f1(cabin[0])},${f1(cabin[1] + bob)}) scale(${zc.toFixed(4)}) translate(${f1(-cabin[0])},${f1(-cabin[1] - bob)})`}>
		<defs><linearGradient id="sl_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.7" stopColor={sky[1]} /><stop offset="1" stopColor={sky[2]} /></linearGradient>
			<linearGradient id="sl_sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sea[0]} /><stop offset="1" stopColor={sea[1]} /></linearGradient></defs>
		<rect x={-400} y={-300} width={W + 800} height={hz + 300} fill="url(#sl_sky)" />
		{stars > 0.02 && Array.from({length: 90}, (_, i) => <circle key={i} cx={f1(rnd(i, 1) * W)} cy={f1(rnd(i, 2) * 500)} r={f1(0.6 + 1.3 * rnd(i, 3))} fill="#e8eef8" opacity={stars * (0.3 + 0.5 * rnd(i, 4))} />)}
		{B.sun && <g opacity={bi === 0 ? 1 : tr}><Glow x={B.sun[0]} y={B.sun[1]} r={420} c={B.sun[2]} o={0.5} id={`sl_sun${bi}`} /><circle cx={B.sun[0]} cy={B.sun[1]} r={34} fill={B.sun[2]} /></g>}
		{B.moon && <g opacity={bi === 0 ? 1 : tr}><Glow x={B.moon[0]} y={B.moon[1]} r={200} c="#e8eef8" o={0.35} id={`sl_moon${bi}`} /><circle cx={B.moon[0]} cy={B.moon[1]} r={30} fill="#f2f4f0" /></g>}
		<rect x={-400} y={hz} width={W + 800} height={H} fill="url(#sl_sea)" />
		<Glints t={T} y0={hz + 4} y1={H + 40} n={140} col={glint} o={0.3} seed={3} speed={18} />
		{/* the support boat: cabin lit at night */}
		<g transform={`translate(1150,${f1(600 + bob)})`}>
			<path d="M-230,0 L230,0 Q212,36 176,50 L-196,50 Q-222,26 -230,0 Z" fill="#0c0e14" /><rect x={-130} y={-74} width={200} height={74} fill="#10121a" />
			<rect x={-112} y={-60} width={56} height={30} fill={GOLD} opacity={0.25 + 0.65 * stars} /><rect x={-38} y={-60} width={56} height={30} fill={GOLD} opacity={0.2 + 0.4 * stars} />
			<rect x={92} y={-200} width={6} height={200} fill="#0c0e14" /><circle cx={95} cy={-204} r={5} fill="#fff4e0" opacity={0.5 + 0.5 * stars} />
			<Glow x={-84} y={-45} r={150} c={GOLD} o={0.45 * stars} id="sl_cab" /></g>
		<path d={`M880,${f1(658 + bob)} L1400,${f1(658 + bob)}`} stroke={GOLD} strokeWidth={3} opacity={0.25 * stars} />
		{/* him, swimming toward the right: head, shoulder, the arm coming over */}
		<path d={`M-300,${f1(sy + 10)} Q${sx - 300},${f1(sy - 26 + 10 * sw)} ${sx},${f1(sy + 6)} Q${sx + 400},${f1(sy + 34)} 2300,${f1(sy - 8)} L2300,${H + 60} L-300,${H + 60} Z`} fill={sea[1]} opacity={0.85} />
		<ellipse cx={sx} cy={sy - 6} rx={30} ry={25} fill={FIGC} /><path d={`M${sx - 26},${sy - 18} Q${sx + 4},${sy - 34} ${sx + 26},${sy - 14}`} stroke={rim} strokeWidth={3} fill="none" opacity={0.7} />
		<ellipse cx={sx - 46} cy={sy + 6} rx={56} ry={18} fill={FIGC} />
		<path d={`M${sx - 30},${sy} Q${f1(sx + 20)},${f1(sy - 100 - 30 * sw)} ${f1(sx + 110 + 30 * Math.cos(ph))},${f1(sy - 36 + 30 * sw)}`} stroke={FIGC} strokeWidth={20} fill="none" strokeLinecap="round" />
		{Array.from({length: 8}, (_, i) => <circle key={i} cx={f1(sx + 100 + 20 * rnd(i, 3) + 30 * Math.cos(ph))} cy={f1(sy - 26 + 26 * rnd(i, 4))} r={f1(2 + 3 * rnd(i, 5))} fill="#ffffff" opacity={0.6} />)}
		<Glints t={T} y0={sy + 40} y1={H} n={30} col={glint} o={0.25} seed={7} speed={10} />
	</g></g>
		{push > 0 && <Glow x={cabin[0]} y={cabin[1]} r={300 + 900 * push} c={GOLD_HI} o={0.9 * push} id="sl_bloom" />}
		<g opacity={1 - sm(seg(T, BT(63, 2.0), BT(63, 2.8)))}><SeaKm km={km} /></g>
	</g>;
};

/* ====================== bar 64 · the globe across Europe: Baku → Istanbul → Calais (2024 → 2026), then the dive to the tunnel ====================== */
const pC = (T: number) => lerp(0.8626, 0.9879, trap(seg(T, BT(63, 3.1), BT(64, 1.85)), 0.22));
/** the chase across Europe (a higher camera: the head covers ~2,000 km in under a second), then a drop toward Calais into the haze */
export const globeCView = (T: number) => {
	const p = pC(T), dv = sm(seg(T, BT(64, 1.7), BT(64, 2.85))), base = chaseSat(p, 1.7, 26, lerp(1086, 960, sm(seg(T, BT(63, 3), BT(64, 1.8)))), lerp(554, 660, sm(seg(T, BT(63, 3), BT(64, 1.8)))), 0, undefined, ROLL_C);
	return {p, dv, v: mixSat(base, {...base, alt: 1.05}, dv)};
};
export const GlobeCScene: SC = ({T}) => {
	const {p, v, dv} = globeCView(T), pop = (t0: number) => eout(seg(T, t0, t0 + 0.2)), haze = sm(seg(dv, 0.55, 0.95)), bloom = 1 - sm(seg(T, BT(63, 3), BT(63, 3) + 0.3));
	const tIst = BT(64, 0.55);
	return <g>
		<Space id="gCs" drift={(T - BT(63, 3)) * 14} />
		<Earth id="gC" v={v} route={{p0: 0, p1: p, head: p}} home={1}
			pins={[{ll: [29.0, 41.0], label: '伊斯坦布尔', o: pop(tIst) * (1 - pop(BT(64, 1.9))) * (1 - haze), dy: 44}, {ll: [1.86, 50.95], label: '法国', kind: 'start', o: pop(BT(64, 1.7)) * (1 - haze), dy: 44},
				{ll: [-1.5, 53.0], label: '英国', o: pop(BT(64, 1.7)) * (1 - haze), dy: -30}]} />
		<CaspianSea v={v} route={{p0: 0.8517, p1: Math.min(p, 0.8626)}} />
		{haze > 0 && <rect width={W} height={H} fill="#c8ced4" opacity={0.92 * haze} />}
		{bloom > 0 && <Glow x={1086} y={554} r={300 + 600 * bloom} c={GOLD_HI} o={0.9 * bloom} id="gC_bl" />}
	</g>;
};

/* ====================== bars 64–65 · the tunnel mouth (Calais): he and his cart at the fence; the ✕ slams on the bar-65 downbeat ====================== */
export const TunnelScene: SC = ({T}) => {
	const u = T - BT(64, 2.7), vp: [number, number] = [1060, 560], xk = seg(T, D(65), D(65) + 0.16), xb = hit(T, D(65), 8);
	const x = 640, g = 900, h = 330, haze = 1 - sm(seg(T, BT(64, 2.75), BT(64, 3.5)));
	return <g><Cam z={1.0 + 0.05 * eio(seg(u, 0, 2.6)) + 0.04 * xb} px={lerp(0, 24, seg(u, 0, 2.6))} rot={-1 * xb}>
		<Sky id="tn_s" stops={[[0, '#3e4856'], [0.6, '#8e98a2'], [1, '#8e98a2']]} />
		<path d="M-300,620 Q500,560 1060,330 Q1600,560 2300,600 L2300,1080 L-300,1080 Z" fill="#46563f" />
		<path d="M720,700 L720,420 Q1060,300 1400,420 L1400,700 Z" fill="#84868a" />
		<path d="M800,700 L800,470 Q1060,380 1320,470 L1320,700 Z" fill="#08090a" />
		{Array.from({length: 7}, (_, i) => { const q = Math.pow(0.72, i); return <circle key={i} cx={f1(lerp(vp[0], 1300, q * 0.7))} cy={f1(lerp(vp[1], 470, q * 0.6))} r={f1(3 + 6 * q)} fill={GOLD_HI} opacity={0.9} />; })}
		<rect x={-400} y={700} width={W + 800} height={H} fill="#38393a" />
		{[[-200, 860], [880, 1000], [1240, 1120], [2300, 1260]].map(([bx, tx], i) => <path key={i} d={`M${bx},${H + 40} L${tx},700`} stroke="#94968f" strokeWidth={6} />)}
		{Array.from({length: 12}, (_, i) => { const y = 700 + Math.pow(i / 11, 1.8) * 420; return <rect key={i} x={f1(lerp(860, -200, (y - 700) / 420) - 20)} y={f1(y)} width={f1(lerp(400, 2600, (y - 700) / 420))} height={f1(lerp(3, 14, (y - 700) / 420))} fill="#262826" />; })}
		{[600, 1520].map((px, i) => <g key={i} fill="#181a1a"><rect x={px} y={300} width={14} height={420} /><rect x={px - (i ? 220 : -14)} y={316} width={220} height={8} /></g>)}
		<path d="M614,340 Q1060,380 1520,340" stroke="#181a1a" strokeWidth={3} fill="none" />
		<g stroke="#1c1e20" strokeWidth={4}>{Array.from({length: 22}, (_, i) => <line key={i} x1={660 + i * 38} y1={720} x2={660 + i * 38} y2={590} />)}<line x1={650} y1={594} x2={1480} y2={594} /><line x1={650} y1={656} x2={1480} y2={656} /></g>
		{xk > 0 && <g transform={`translate(1060,520) scale(${(0.5 + 0.5 * eout(xk) + 0.12 * xb).toFixed(3)})`}><rect x={-80} y={-80} width={160} height={160} rx={12} fill="#e8e0d0" /><path d="M-46,-46 L46,46 M46,-46 L-46,46" stroke="#a02a22" strokeWidth={20} strokeLinecap="round" /></g>}
		<Karl stage="europe" id="tn_k" x={x} g={g} h={h} pose={nod(STAND, -6 * sm(seg(T, D(65), D(65) + 0.3)))} rims={[{c: '#f4f0e8', o: 0.55, dx: 2.4, dy: -1.6}]} cart={{dist: 0}} />
	</Cam>
		{haze > 0 && <rect width={W} height={H} fill="#c8ced4" opacity={0.92 * haze} />}
	</g>;
};

/* ====================== bars 66–67 · October 2026: swimming the Channel toward the white cliffs at dawn (a wave wipes in) ====================== */
export const ChannelScene: SC = ({T}) => {
	const u = T - D(66), hz = 600, ph = T * 2.8, sw = Math.sin(ph), cx = 760, cy = 820 + 8 * Math.sin(T * 1.7), near = eio(seg(u, 0, 3.4));
	const fog = sm(seg(T, BT(67, 2.6), D(68) + 0.05));
	return <g><Cam z={lerp(1.0, 1.08, near)} py={8 * Math.sin(T * 1.3)}>
		<Sky id="ch_s" stops={[[0, '#3a4660'], [0.45, '#a8a0a0'], [0.56, '#f0d4aa'], [0.6, '#f4e0c0'], [1, '#f4e0c0']]} />
		<Glow x={1500} y={560} r={520} c="#ffe0b0" o={0.55} id="ch_g" />
		<g transform={`translate(${f1(-40 * near)},${f1(-20 * near)}) scale(${(1 + 0.12 * near).toFixed(3)})`} style={{transformOrigin: '1400px 560px'}}>
			<path d={`M820,${hz} L860,520 L1000,490 L1200,470 L1420,476 L1640,500 L1900,520 L2300,540 L2300,${hz} Z`} fill="#ebe5da" />
			{Array.from({length: 26}, (_, i) => <rect key={i} x={860 + i * 50 + rnd(i, 2) * 20} y={490 + 20 * rnd(i, 3)} width={4} height={hz - 500} fill="#c8bca8" opacity={0.5} />)}
			<path d="M840,530 L860,516 L1000,486 L1200,466 L1420,472 L1640,496 L1900,516 L2300,536 L2300,528 L1900,506 L1640,486 L1420,460 L1200,456 L1000,476 L860,506 Z" fill="#6a7a5a" /></g>
		<rect x={-400} y={hz} width={W + 800} height={H} fill="#5a6470" /><Glints t={T} y0={hz + 4} y1={H + 40} n={140} col="#fff0d8" o={0.3} seed={12} speed={16} />
		<g transform="translate(400,646)"><path d="M-90,0 L90,0 L72,20 L-78,20 Z" fill="#262c34" /><rect x={-40} y={-34} width={64} height={34} fill="#2e363e" /><rect x={-2} y={-74} width={4} height={40} fill="#262c34" /></g>
		<path d={`M-300,${f1(cy + 10)} Q${cx - 300},${f1(cy - 30 + 10 * sw)} ${cx},${f1(cy + 6)} Q${cx + 400},${f1(cy + 40)} 2300,${f1(cy - 10)} L2300,${H + 60} L-300,${H + 60} Z`} fill="#26323e" />
		<ellipse cx={cx} cy={f1(cy - 6)} rx={34} ry={28} fill={FIGC} /><path d={`M${cx - 28},${f1(cy - 20)} Q${cx + 4},${f1(cy - 38)} ${cx + 30},${f1(cy - 16)}`} stroke="#ffe0b8" strokeWidth={3} fill="none" opacity={0.75} />
		<ellipse cx={cx - 46} cy={f1(cy + 6)} rx={60} ry={20} fill={FIGC} />
		<path d={`M${cx - 30},${f1(cy)} Q${cx + 20},${f1(cy - 110 - 30 * sw)} ${f1(cx + 120 + 30 * Math.cos(ph))},${f1(cy - 40 + 30 * sw)}`} stroke={FIGC} strokeWidth={22} fill="none" strokeLinecap="round" />
		<path d={`M${cx - 30},${f1(cy)} Q${cx + 20},${f1(cy - 110 - 30 * sw)} ${f1(cx + 120 + 30 * Math.cos(ph))},${f1(cy - 40 + 30 * sw)}`} stroke="#9cc0dc" strokeWidth={2} fill="none" opacity={0.6} transform="translate(0,-9)" />
		{Array.from({length: 8}, (_, i) => <circle key={i} cx={f1(cx + 110 + 20 * rnd(i, 3) + 30 * Math.cos(ph))} cy={f1(cy - 30 + 30 * rnd(i, 4))} r={f1(2 + 3 * rnd(i, 5))} fill="#ffffff" opacity={0.6} />)}
		<path d={`M-300,${f1(cy + 60)} Q${cx},${f1(cy + 30)} 2300,${f1(cy + 80)} L2300,${H + 60} L-300,${H + 60} Z`} fill="#1c2630" />
		<Glints t={T} y0={cy + 40} y1={H} n={30} col="#fff0d8" o={0.25} seed={7} speed={10} />
	</Cam>
		{/* the white of the cliffs grows into the fog of the Humber */}
		{fog > 0 && <rect width={W} height={H} fill="#dfe2e2" opacity={0.95 * fog} />}
	</g>;
};
/** the wave that wipes the tunnel away: a wall of water rises past the lens */
export const WaveWipe: SC = ({T}) => {
	const k = seg(T, D(66) - 0.2, D(66) + 0.24); if (k <= 0 || k >= 1) return null;
	const crest = lerp(H + 120, -700, k), back = crest + 1100, sw = (x: number) => 40 * Math.sin(x * 0.006 + T * 3);
	const d = `M-100,${f1(crest + sw(0))} ` + Array.from({length: 22}, (_, i) => { const x = i * 100; return `L${x},${f1(crest + sw(x) + 30 * Math.sin(i * 1.7))}`; }).join(' ') + ` L2100,${f1(back)} L-100,${f1(back)} Z`;
	return <g><path d={d} fill="#1a2a36" /><path d={`M-100,${f1(crest + sw(0))} ` + Array.from({length: 22}, (_, i) => { const x = i * 100; return `L${x},${f1(crest + sw(x) + 30 * Math.sin(i * 1.7))}`; }).join(' ')} stroke="#eef4f6" strokeWidth={14} fill="none" opacity={0.85} strokeLinejoin="round" />
		{Array.from({length: 30}, (_, i) => <circle key={i} cx={f1(rnd(i, 1) * W)} cy={f1(crest - 20 - 80 * rnd(i, 2))} r={f1(4 + 8 * rnd(i, 3))} fill="#f4f8fa" opacity={0.8} />)}</g>;
};
void Blur; void pineD; void leanP; void STAND; void CREAM;

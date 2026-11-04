import React from 'react';
import {God, Pose, POSES, reach, wristTo, holdAt, lerpPose, solve, SHAPES} from './rig60';
import {Stage60, Glow, Dust, Embers, Stars, Shaft, camPath, flick, rng, FW, PIC_CY, Cam} from './frame60';
import {Column, FeatherCornice} from './props60b';
import {GlyphColumns, WingedSun} from './props60';
import {ANI, walkPose, STRIDE, adoreArms} from './cast60';
import {Ceiling} from './sets60';
import type {ShotProps} from './EP60';
import {up, hit, keys, bell, wearFor, figXY, InBone, placeBy, gripOf, JUDGE, jPose, Judge, BigKnife, Horns, BrowRaise, Squint, JackalTongue, IbisGape,
	GlyphStack, Check, Sweat, Baby, Balance2, HallWall, MiniJudge} from './act60b_kit';
import {V, PAL, poly, sp, lerp, cl, sm, seg, ap, mx, chain, T, R} from './geo60';

/* act60b · the Hall of Two Truths (shots 18–26): the reveal, the 42 judges, three scary names, the oath (one tick per declaration),
   「我没有……话太多」 and the horned judge's stare. Sound-event times: episodes/60-xinzang/sync60_b.md. */
const GY = 852;
const c_ = (s: number) => ({OW: 2.7 / s, LW: 1.5 / s});

/* ================= 18 · 49.8–52.7 · BIG REVEAL: the doors boom open on you, tiny at the threshold; crane up and back over the hall ================= */
export const S18 = {boom: 0.2, walk0: 0.95, om: 5.0};
export const Shot18: React.FC<ShotProps> = ({t}) => {
	const open = keys(t, [[0.14, 0], [0.36, 1]]), boom = hit(t, S18.boom, 0.45), th = open * 78 * Math.PI / 180;
	const cam = camPath(t, [[0.4, 150, 694, 2.0], [2.95, 720, 470, 0.92]]);
	const as = 7, wu = Math.max(0, t - S18.walk0), ax = 150 + STRIDE * as * S18.om * wu * 0.9, ani: Pose = wu > 0 ? walkPose(S18.om * wu, {lean: 3, stride: 0.9}) : {...POSES.rest, rt: -4, at: 6, lean: 1, head: -3};
	const shake = 4 * boom * Math.sin(t * 70);
	const leaf = (hx: number, dir: 1 | -1, k: string) => { const w = 80 * Math.cos(th), d = 16 * Math.sin(th);
		return <g key={k}><path d={poly([[hx, 568], [hx + dir * w, 568 + d * 0.2], [hx + dir * w, GY - d * 0.2], [hx, GY]])} fill="#6A3A1E" stroke={PAL.ink} strokeWidth={2.4} />
			{[0.18, 0.5, 0.82].map((u) => <path key={u} d={`M${hx + dir * 4} ${lerp(568, GY, u)}L${hx + dir * (w - 4)} ${lerp(568, GY, u)}`} stroke={PAL.gold} strokeWidth={5} />)}
			{[0.3, 0.7].map((u) => <circle key={u} cx={hx + dir * w * 0.5} cy={lerp(568, GY, u)} r={4} fill={PAL.gold} />)}
			<path d={poly([[hx + dir * w, 568], [hx + dir * (w + d), 572], [hx + dir * (w + d), GY - 4], [hx + dir * w, GY]])} fill="#3A1E0E" /></g>; };
	return <Stage60 t={t} cam={{...cam, y: cam.y + shake / cam.z}} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.32)} stain={0.25}
		light={<>
			<Glow x={760} y={430} r={560} ry={420} c="gold" o={0.42 + 0.06 * Math.sin(t * 1.3)} />
			<Glow x={760} y={330} r={240} c="white" o={0.22} />
			<Shaft pts={[[620, 120], [900, 120], [1060, GY], [460, GY]]} o={0.35} />
			<Glow x={150} y={720} r={170} c="gold" o={0.8 * open + 0.4 * boom} />
			<Glow x={ax + 10} y={GY - 70} r={60} c="white" o={0.22 * open} />
			<Dust t={t} box={[300, 140, 1240, 840]} n={60} seed={181} c="#FFE7A8" o={0.7} vx={-4} vy={-5} />
			<Embers t={t} x={760} y={GY - 40} n={16} seed={182} h={500} spread={520} />
		</>}>
		<HallWall x0={-300} x1={1800} t={t} ceil={112} glyphY={300} />
		{/* the winged sun over the balance, the colonnade */}
		<WingedSun x={760} y={186} s={17} span={14} t={t} />
		{[[-40, 64], [330, 64], [1190, 64], [1560, 64]].map(([x, w]) => <Column key={x} x={x} gy={GY} top={150} w={w} />)}
		{[470, 1050].map((x) => <g key={x} opacity={0.75}><Column x={x} gy={GY} top={230} w={40} /></g>)}
		{/* far registers of tiny judges on the side walls (the 42 wait in shot 19) */}
		{[[-60, 300], [1230, 1510]].map(([a, b], i) => <g key={i} opacity={0.9}>{Array.from({length: Math.floor((b - a) / 46)}, (_, k) => <g key={k} transform={`translate(${a + 20 + k * 46},${430})`}>
			<g transform={`scale(${i ? -1 : 1},1)`}><MiniJudge cast={[JUDGE.jackal, JUDGE.red, JUDGE.ibis, JUDGE.falcon, JUDGE.green][k % 5]} s={5.6} hold={k % 2 ? 'feather' : 'knife'} seat={[PAL.blue, PAL.red, PAL.green][k % 3]} /></g></g>)}
			<rect x={a - 10} y={430} width={b - a + 20} height={8} fill={PAL.linen} stroke={PAL.ink} strokeWidth={1.4} /></g>)}
		{/* the giant balance at the centre */}
		<Balance2 p={{tilt: 1.2 * Math.sin(t * 0.9), swingL: 0.8 * Math.sin(t * 1.3), swingR: -0.6 * Math.sin(t * 1.3), plumb: 1.5 * Math.sin(t * 1.6)}} x={760} y={GY} s={28} t={t} />
		{/* the door: outside is the night of the Duat; the leaves swing open on the boom */}
		<rect x={70} y={568} width={160} height={GY - 568} fill="#080C26" />
		<g opacity={open}><Stars t={t} box={[74, 572, 226, 760]} n={14} seed={183} /></g>
		<God id="b18ani" cast={ANI} pose={ani} x={ax} y={GY} s={as} sec={{t}} />
		{leaf(70, 1, 'l')}{leaf(230, -1, 'r')}
		<path d={poly([[40, GY], [70, GY], [70, 568], [40, 568]])} fill="#E9D3A0" stroke={PAL.ink} strokeWidth={2.4} /><path d={poly([[230, GY], [260, GY], [260, 568], [230, 568]])} fill="#E9D3A0" stroke={PAL.ink} strokeWidth={2.4} />
		{[46, 236].map((x) => <rect key={x} x={x} y={580} width={18} height={GY - 592} fill="none" stroke={PAL.red} strokeWidth={2} />)}
		<path d={poly([[26, 568], [274, 568], [274, 540], [26, 540]])} fill="#E9D3A0" stroke={PAL.ink} strokeWidth={2.4} />
		<path d={poly([[26, 540], [274, 540], [290, 512], [10, 512]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 12}, (_, i) => <path key={i} d={`M${30 + i * 21} 538L${18 + i * 23.4} 514`} stroke={[PAL.blue, PAL.red, PAL.green][i % 3]} strokeWidth={6} />)}
		<WingedSun x={150} y={554} s={6} span={15} t={t} />
	</Stage60>;
};

/* ================= 19 · 52.7–55.4 · three registers of the 42 judges, receding into the dark; truck along the rows ================= */
const ROW_CASTS = [JUDGE.jackal, JUDGE.red, JUDGE.ibis, JUDGE.gold, JUDGE.falcon, JUDGE.green];
const JudgeDefs19: React.FC<{s: number; t: number; pre: string; mini?: boolean}> = ({s, t, pre, mini}) => <defs>{ROW_CASTS.map((cst, k) =>
	<g key={k} id={`${pre}${k}`}>{mini ? <g transform="scale(-1,1)"><MiniJudge cast={cst} s={s} hold={k % 2 ? 'feather' : 'knife'} seat={[PAL.blue, PAL.red, PAL.green][k % 3]} /></g>
		: <Judge id={`${pre}g${k}`} cast={cst} pose={jPose(t, k)} x={0} y={0} s={s} face={-1} t={t + k} hold={k % 2 ? 'feather' : 'knife'} seat={[PAL.blue, PAL.red, PAL.green][k % 3]} />}</g>)}</defs>;
const Row19: React.FC<{pre: string; x0: number; gy: number; n: number; dx: number; s: number; t: number; seed: number}> = ({pre, x0, gy, n, dx, s, t, seed}) => <g>
	<rect x={x0 - dx} y={gy} width={dx * (n + 1)} height={12} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
	{Array.from({length: n}, (_, i) => { const k = (i * 5 + seed) % ROW_CASTS.length, x = x0 + i * dx, nod = 2.2 * Math.sin(t * 1.4 + i * 1.9) + 4 * bell(t, 0.6 + ((i * 0.37 + seed) % 1.6), 1.2 + ((i * 0.37 + seed) % 1.6));
		return <use key={i} href={`#${pre}${k}`} transform={`translate(${x},${gy}) rotate(${-nod} 0 ${-13 * s})`} />; })}
</g>;
export const Shot19: React.FC<ShotProps> = ({t}) => {
	const cam = camPath(t, [[-0.2, 560, 480, 1.0], [3.0, 880, 474, 1.03]]);
	const tagX = cam.x + (110 - FW / 2) / cam.z, tagY = cam.y + (150 - PIC_CY) / cam.z;
	const whisper = up(t, 0.3, 2.2);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#141E4A" wear={0.3} stain={0.25} tags={[{x: tagX, y: tagY, text: '四十二判官', size: 40}]}
		light={<>
			<Glow x={cam.x} y={700} r={820} ry={260} c="gold" o={0.32} />
			<Dust t={t} box={[cam.x - 760, 100, cam.x + 760, 860]} n={50} seed={191} c="#FFE2A0" o={0.55} />
			{/* the whispers rising along the rows: little gold wisps between heads */}
			{Array.from({length: 16}, (_, i) => { const x = 40 + i * 118 + 59, y = 520 - 13.5 * 18.5, o = whisper * bell(((t * 0.9 + i * 0.29) % 1.2), 0, 1.2);
				return <g key={i} opacity={0.8 * o}><path d={`M${x - 14} ${y}q8 -10 16 0t16 0`} fill="none" stroke="#FFE2A0" strokeWidth={3} /><path d={`M${x - 8} ${y - 14}q6 -8 12 0t12 0`} fill="none" stroke="#FFE2A0" strokeWidth={2.4} /></g>; })}
		</>}>
		<rect x={-300} y={-600} width={2400} height={1600} fill="#141E4A" />
		<Ceiling x0={-300} x1={2100} y0={-600} y1={66} bg="#101842" />
		<FeatherCornice x0={-300} x1={2100} y={80} s={0.9} t={t} />
		<JudgeDefs19 s={8.2} t={t} pre="b19a" mini /><JudgeDefs19 s={12.5} t={t} pre="b19b" mini /><JudgeDefs19 s={18.5} t={t} pre="b19c" />
		<g opacity={0.62}><Row19 pre="b19a" x0={-130} gy={276} n={28} dx={64} s={8.2} t={t} seed={2} /></g>
		<rect x={-300} y={130} width={2400} height={160} fill="#0A0F2E" opacity={0.35} />
		<g opacity={0.85}><Row19 pre="b19b" x0={-80} gy={530} n={19} dx={92} s={12.5} t={t + 2} seed={4} /></g>
		<rect x={-300} y={300} width={2400} height={240} fill="#0A0F2E" opacity={0.15} />
		<Row19 pre="b19c" x0={40} gy={846} n={14} dx={118} s={18.5} t={t + 4} seed={1} />
		<rect x={-300} y={858} width={2400} height={200} fill="#0E1538" />
	</Stage60>;
};

/* ================= 20 · 55.4–58.4 · three punch-ins: 碎骨者 snaps a bone, 吞影者 gulps a shadow, 食血者 licks a red drop ================= */
export const S20 = {cuts: [0, 0.9, 1.8], crack: 0.4, gulp: 1.3, drip: 2.2};
const Bone: React.FC<{a: V; b: V; c: {OW: number; LW: number}; brk: number; t: number}> = ({a, b, c, brk}) => {
	const m: V = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], half = (p: V, q: V, rot: number, piv: V, k: string) => {
		const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
		return <g key={k} transform={`rotate(${rot} ${piv[0]} ${piv[1]}) translate(${p[0]},${p[1]}) rotate(${ang})`}>
			<path d={`M0 -0.26L${L} -0.26L${L - 0.12} -0.05L${L + 0.06} 0.08L${L - 0.08} 0.26L0 0.26Z`} fill="#F3EBD6" stroke={PAL.ink} strokeWidth={c.OW * 1.6} strokeLinejoin="round" />
			<circle cx={-0.18} cy={-0.32} r={0.34} fill="#F3EBD6" stroke={PAL.ink} strokeWidth={c.OW * 1.6} /><circle cx={-0.18} cy={0.32} r={0.34} fill="#F3EBD6" stroke={PAL.ink} strokeWidth={c.OW * 1.6} />
			<path d={`M0.15 -0.12L${L * 0.7} -0.12`} stroke="#FFFFFF" strokeWidth={c.LW * 2} opacity={0.8} />
		</g>; };
	const ext = (p: V, q: V, k: number): V => [p[0] + (p[0] - q[0]) * k, p[1] + (p[1] - q[1]) * k];
	const A = ext(a, b, 0.35), B_ = ext(b, a, 0.35);
	return <g>{half(A, m, -24 * brk, a, 'l')}{half(B_, m, 24 * brk, b, 'r')}</g>;
};
const Wisp: React.FC<{x: number; y: number; k: number; o: number; t: number; stretch?: number}> = ({x, y, k, o, t, stretch = 0}) => <g transform={`translate(${x},${y}) scale(${k * (1 + stretch)},${k * (1 - 0.4 * stretch)})`} opacity={o}>
	<path d={sp([[0, -40], [12, -34], [14, -20], [8, -14], [20, -4], [22, 18], [14, 36 + 6 * Math.sin(t * 9)], [4, 52], [-8, 44 + 6 * Math.sin(t * 7)], [-18, 30], [-22, 6], [-12, -10], [-14, -24], [-10, -36]], true, 0.2)} fill="#2A1846" stroke="#B7A6FF" strokeWidth={3} opacity={0.95} />
	<ellipse cx={6} cy={-28} rx={3} ry={2} fill="#B7A6FF" /><ellipse cx={-4} cy={-28} rx={3} ry={2} fill="#B7A6FF" />
</g>;
export const Shot20: React.FC<ShotProps> = ({t}) => {
	const i = t < S20.cuts[1] ? 0 : t < S20.cuts[2] ? 1 : 2, u = t - S20.cuts[i], s = 80;
	const face: V = [760, 350];
	const flash = cl(1 - u / 0.07) * (i > 0 || t >= 0 ? 0.3 : 0);
	const zoom = 1.0 + 0.09 * sm(u / 0.22) + 0.04 * u;
	const cam: Cam = {x: face[0] + 40, y: face[1] + 130, z: zoom};
	const bg = ['#16214F', '#0F2A3E', '#2A1030'][i], rim = ['gold', 'blue', 'red'][i];
	let fig: [number, number] = [0, 0];
	let pose: Pose, cast = JUDGE.red, name = '碎骨者', extra: React.ReactNode = null, light: React.ReactNode = null, front: React.ReactNode = null;
	if (i === 0) { // 碎骨者: snaps a bone between his fists
		const brk = up(t, S20.crack, 0.09), shake = hit(t, S20.crack, 0.12) * Math.sin(t * 120) * 0.6;
		pose = jPose(t, 0, {lean: 1, head: 3 - 4 * hit(t, S20.crack, 0.3)});
		pose = wristTo(holdAt(pose, 'f', [2.9 + 0.25 * brk, -4.9 - 0.25 * brk]), 'f', 92 + 20 * brk); pose = wristTo(holdAt(pose, 'b', [0.7 - 0.15 * brk, -4.9 - 0.2 * brk]), 'b', 92 - 20 * brk);
		const [fx, fy] = placeBy(pose, s, -1, 'head', [0.6, -1.2], face), gb = gripOf(pose, 'b'), gf = gripOf(pose, 'f');
		const R_ = rng(201);
		extra = <g transform={`translate(${fx + shake},${fy}) scale(${-s},${s})`}><Bone a={gb} b={gf} c={c_(s)} brk={brk} t={t} />
			{brk > 0 && Array.from({length: 8}, (_, k) => { const v = (t - S20.crack), vx = (R_() - 0.5) * 9, vy = -3 - R_() * 5, px = (gb[0] + gf[0]) / 2 + vx * v, py = (gb[1] + gf[1]) / 2 + vy * v + 14 * v * v;
				return v < 0.6 ? <path key={k} d={`M${px} ${py}l0.2 0.1l-0.1 0.22z`} fill="#F3EBD6" stroke={PAL.ink} strokeWidth={0.03} opacity={1 - v / 0.6} /> : null; })}</g>;
		light = <>{(() => { const g = hit(t, S20.crack, 0.2); const p = figXY(pose, fx, fy, s, -1, 'torso', [1.8, -4.9]); return g > 0.02 ? <><Glow x={p[0]} y={p[1]} r={260} c="white" o={0.8 * g} />
			<path d={`M${p[0]} ${p[1] - 140 * g}L${p[0] + 12} ${p[1] - 12}L${p[0] + 140 * g} ${p[1]}L${p[0] + 12} ${p[1] + 12}L${p[0]} ${p[1] + 140 * g}L${p[0] - 12} ${p[1] + 12}L${p[0] - 140 * g} ${p[1]}L${p[0] - 12} ${p[1] - 12}Z`} fill="#FFFBEA" opacity={g} style={{mixBlendMode: 'screen'}} /></> : null; })()}</>;
		fig = [fx + shake, fy];
	} else if (i === 1) { // 吞影者: the ibis opens his beak and gulps a little shadow of a person
		cast = JUDGE.ibis; name = '吞影者';
		const gape = keys(t, [[1.0, 0], [1.15, 1], [1.22, 1], [1.26, 0]]), gulp = hit(t, S20.gulp, 0.25);
		pose = jPose(t, 1, {lean: 2, head: 2 - 8 * gape + 6 * gulp, neck: -4 * gape + 3 * gulp});
		const [fx, fy] = placeBy(pose, s, -1, 'head', [0.6, -1.2], face);
		const beakTip = figXY(pose, fx, fy, s, -1, 'head', [3.2, 0.0]), beakBase = figXY(pose, fx, fy, s, -1, 'head', [1.2, -0.75]);
		const suck = up(t, 1.05, 0.2), wx = lerp(beakTip[0] - 110, beakBase[0], suck), wy = lerp(beakTip[1] + 20, beakBase[1], suck) + 10 * Math.sin(t * 5) * (1 - suck);
		front = <g>{t < 1.26 && <Wisp x={wx} y={wy} k={lerp(2.3, 0.3, suck)} o={1 - 0.6 * suck} t={t} stretch={0.6 * bell(t, 1.05, 1.26)} />}</g>;
		extra = <InBone pose={pose} x={fx} y={fy} s={s} face={-1} bone="head"><IbisGape c={c_(s * 1.13)} open={gape} /></InBone>;
		const lump = up(t, S20.gulp - 0.05, 0.35), lp = figXY(pose, fx, fy, s, -1, 'neck', [0.05, lerp(-1.1, 0.4, lump)]);
		light = <>{lump > 0 && lump < 1 && <ellipse cx={lp[0]} cy={lp[1]} rx={22} ry={16} fill="#3C3F47" stroke={PAL.ink} strokeWidth={2} />}
			<Glow x={wx} y={wy} r={170} c="blue" o={0.6 * (1 - suck)} /></>;
		fig = [fx, fy];
	} else { // 食血者: a red drop on his knife tip; the jackal's tongue flicks and licks it off
		cast = JUDGE.jackal; name = '食血者';
		const lick = bell(t, S20.drip - 0.05, S20.drip + 0.3);
		pose = jPose(t, 2, {lean: 3, head: -3 - 3 * lick});
		pose = wristTo(holdAt(pose, 'f', [3.75, -5.5]), 'f', 92);
		const [fx, fy] = placeBy(pose, s, -1, 'head', [0.6, -1.2], face), G = gripOf(pose, 'f');
		const tip: V = [fx - (G[0] + 0.12) * s, fy + (G[1] - 3.0) * s];
		const drop = t < S20.drip ? 1 : 0, fall = cl((t - S20.drip) / 0.12);
		extra = <g><g transform={`translate(${fx},${fy}) scale(${-s},${s})`}><BigKnife at={G} c={c_(s)} L={3.0} glint={0.4 * bell(t, 1.85, 2.2)} /></g>
			<InBone pose={pose} x={fx} y={fy} s={s} face={-1} bone="head"><JackalTongue c={c_(s * 1.13)} out={lick} /></InBone></g>;
		front = <g>{drop ? <path d={`M${tip[0]} ${tip[1] - 4}C${tip[0] + 9} ${tip[1] + 10} ${tip[0] + 10} ${tip[1] + 18} ${tip[0]} ${tip[1] + 22 + 6 * up(t, 1.9, 0.3)}C${tip[0] - 10} ${tip[1] + 18} ${tip[0] - 9} ${tip[1] + 10} ${tip[0]} ${tip[1] - 4}Z`} fill="#D0221A" stroke={PAL.ink} strokeWidth={2} />
			: fall < 1 ? <circle cx={tip[0] + 6} cy={tip[1] + 20 + 40 * fall} r={8 * (1 - fall)} fill="#D0221A" /> : null}</g>;
		light = <Glow x={tip[0]} y={tip[1] + 10} r={90} c="red" o={0.5 * (1 - fall)} />;
		fig = [fx, fy];
	}
	const tagP = figXY(pose, fig[0], fig[1], s, -1, 'head', [-1.9, -2.6]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg={bg} wear={wearFor(cam.z, 0.2)} stain={0.18} tags={[{x: tagP[0] + 30, y: tagP[1], text: name, size: 44}]}
		light={<>
			<Glow x={face[0] + 120} y={face[1] - 30} r={460} c={rim} o={i === 1 ? 0.75 : 0.5} />
			{i === 1 && <Glow x={face[0] - 60} y={face[1]} r={300} c="white" o={0.3} />}
			<Glow x={face[0] - 160} y={face[1] + 60} r={300} c="warm" o={0.3 + 0.06 * flick(t, 9)} />
			{light}
			<Dust t={t} box={[face[0] - 700, face[1] - 400, face[0] + 600, face[1] + 500]} n={30} seed={205 + i} c="#FFE2A0" o={0.5} vx={-10} vy={-6} />
		</>}
		screen={<rect width={1440} height={1080} fill="#FFFFFF" opacity={flash} />}>
		<rect x={-200} y={-400} width={2000} height={1700} fill={bg} />
		{[-260, 1040].map((x, k) => <g key={k}><GlyphStack x={x + 300} y={-120} cell={84} n={9} seed={210 + i * 3 + k} color="#C9A23E" glow={0} o={0.55} /></g>)}
		<rect x={-200} y={-400} width={2000} height={60} fill={PAL.gold} opacity={0.0} />
		<Judge id={`b20j${i}`} cast={cast} pose={pose} x={fig[0]} y={fig[1]} s={s} face={-1} t={t} hold={i === 0 ? 'none' : i === 1 ? 'feather' : 'none'} seat={[PAL.red, PAL.green, PAL.blue][i]} />
		{extra}{front}
	</Stage60>;
};

/* ================= 21 · 58.4–61.6 · you step up to the first judge and bow; your oath rises as gold glyph columns; he leans in ================= */
export const S21 = {cols: [0.6, 1.2, 1.8, 2.4], lean: [1.2, 1.8]};
const bowPose = (t: number, k: number): Pose => { const p: Pose = {...POSES.adore, lean: lerp(4, 17, k) + 0.6 * Math.sin(t * 1.4), neck: lerp(0, 5, k), head: lerp(0, 6, k), rt: -7, at: 10, rk: 4, ak: 2};
	return adoreArms(p, false, 1); };
export const Shot21: React.FC<ShotProps> = ({t}) => {
	const s = 29, om = 5.0, walkEnd = 0.45, wt = Math.min(t, walkEnd), ax = 196 + STRIDE * s * om * Math.max(-0.3, wt), bow = up(t, 0.38, 0.4);
	const ani = bow > 0 ? lerpPose(walkPose(om * walkEnd + 0.3, {lean: 3}), bowPose(t, 1), bow) : walkPose(om * wt + 0.3, {lean: 3});
	const jx = 960, jgy = GY - 34, lean = up(t, S21.lean[0], 0.6);
	const jp = jPose(t, 3, {lean: -2 + 17 * lean, neck: 9 * lean, head: 6 * lean});
	const mouth = figXY(ani, ax, GY, s, 1, 'head', [1.3, -0.5]);
	const cam = camPath(t, [[0, 600, 500, 1.06], [3.3, 650, 480, 1.13]]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.3)} stain={0.25}
		light={<>
			<Glow x={jx - 40} y={jgy - 300} r={380} c="gold" o={0.38} />
			<Glow x={ax + 40} y={GY - 300} r={300} c="warm" o={0.25} />
			<Dust t={t} box={[100, 120, 1300, 850]} n={46} seed={211} c="#FFE2A0" o={0.55} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} />
		<rect x={jx - 230} y={jgy} width={460} height={34} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={jx - 220 + k * 76} y={jgy + 8} width={60} height={18} fill={[PAL.blue, PAL.red, PAL.green][k % 3]} />)}
		<Judge id="b21j" cast={JUDGE.falcon} pose={jp} x={jx} y={jgy} s={s + 2} face={-1} t={t} hold="feather" seat={PAL.red} />
		<God id="b21ani" cast={ANI} pose={ani} x={ax} y={GY} s={s} sec={{t}} />
		{S21.cols.map((t0, k) => { const u = up(t, t0 - 0.05, 0.35), slot: V = [mouth[0] + 120 + k * 100, 200 + (k % 2) * 34];
			if (t < t0 - 0.05) return null;
			const x = lerp(mouth[0] + 30, slot[0], u) + 6 * (t - t0), y = lerp(mouth[1] - 30, slot[1], u) - 10 * Math.max(0, t - t0) + 4 * Math.sin(t * 2 + k);
			return <g key={k} transform={`translate(${x},${y}) scale(${lerp(0.3, 1, u)}) translate(${-x},${-y})`}><GlyphStack x={x} y={y} cell={56} n={4} seed={220 + k} glow={0.7 * (0.6 + 0.4 * hit(t, t0, 0.3))} /></g>; })}
	</Stage60>;
};

/* ================= 22 · 61.6–64.2 · three judges nod in turn; a gold tick pops above each, one per beat ================= */
export const S22 = {nods: [0.4, 1.0, 1.6]};
export const Shot22: React.FC<ShotProps> = ({t}) => {
	const s = 27, jgy = GY - 24, J3 = [{x: 330, cast: JUDGE.ibis, hold: 'feather' as const}, {x: 690, cast: JUDGE.gold, hold: 'knife' as const}, {x: 1050, cast: JUDGE.jackal, hold: 'feather' as const}];
	const cam = camPath(t, [[0, 640, 452, 1.02], [2.9, 740, 446, 1.06]]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={0.3} stain={0.25}
		light={<>
			{J3.map((J_, k) => <Glow key={k} x={J_.x} y={jgy - 330} r={200 + 80 * hit(t, S22.nods[k], 0.4)} c="gold" o={0.3 + 0.5 * hit(t, S22.nods[k], 0.4)} />)}
			<Dust t={t} box={[0, 120, 1400, 850]} n={40} seed={221} c="#FFE2A0" o={0.5} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} />
		<rect x={140} y={jgy} width={1150} height={24} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{J3.map((J_, k) => { const n = bell(t, S22.nods[k] - 0.08, S22.nods[k] + 0.3), p = jPose(t, k, {head: 16 * n, neck: 6 * n, lean: -2 + 2 * n});
			const top = figXY(p, J_.x, jgy, s, -1, 'head', [0.1, -3.4]);
			// the oath arriving: a few gold signs fly in from the left to his ear just before the nod
			const fu = cl((t - S22.nods[k] + 0.42) / 0.36), ear = figXY(p, J_.x, jgy, s, -1, 'head', [0.0, -1.2]);
			return <g key={k}>
				<Judge id={`b22j${k}`} cast={J_.cast} pose={p} x={J_.x} y={jgy} s={s} face={-1} t={t} hold={J_.hold} seat={[PAL.blue, PAL.red, PAL.green][k]} />
				{fu > 0 && fu < 1 && <g opacity={bell(fu, 0, 1) * 1.2}><GlyphStack x={lerp(J_.x - 330, ear[0] - 40, sm(fu))} y={ear[1] - 60 - 40 * Math.sin(Math.PI * fu)} cell={34} n={2} seed={230 + k} glow={0.6} /></g>}
				<Check x={top[0] + 10} y={top[1] - 92} t={t} t0={S22.nods[k]} s={1.3} />
			</g>; })}
	</Stage60>;
};

/* ================= 23 · 64.2–66.9 · a vignette: a baby with a milk cup, your hand pointedly not reaching for it; the judge squints, then nods ================= */
export const S23 = {gurgle: 0.3, squint: [0.85, 1.25], nod: 1.45};
export const Shot23: React.FC<ShotProps> = ({t}) => {
	const s = 46, pop = up(t, -0.05, 0.22), sq = keys(t, [[S23.squint[0], 0], [S23.squint[0] + 0.18, 1], [S23.squint[1], 1], [S23.nod - 0.05, 0]]);
	const nod = bell(t, S23.nod - 0.06, S23.nod + 0.32);
	const jp = jPose(t, 5, {head: 14 * nod - 3 * sq, neck: 5 * nod, lean: 2 + 3 * sq});
	const [jx, jy] = placeBy(jp, s, -1, 'head', [0.6, -1.2], [1040, 330]);
	const top = figXY(jp, jx, jy, s, -1, 'head', [0.1, -3.4]);
	const cam = camPath(t, [[0, 700, 480, 1.0], [2.9, 730, 470, 1.05]]);
	// the hand: reaches toward the cup, stops short, pulls back and shows the palm ("not me")
	const reachK = keys(t, [[0.28, 0], [0.55, 1], [0.66, 1], [0.92, 0]]), back = up(t, 0.66, 0.26);
	const hand: V = [lerp(lerp(150, 372, reachK), 196, back * (1 - reachK)), lerp(lerp(470, 548, reachK), 440, back * (1 - reachK))];
	const hA = lerp(-80 + 10 * reachK, 175, back), sh: V = [60, 520];
	const panelK = lerp(0.9, 1, pop);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={0.25} stain={0.22}
		light={<>
			<Glow x={top[0]} y={top[1] + 100} r={360} c="gold" o={0.35 + 0.4 * hit(t, S23.nod, 0.4)} />
			<Glow x={360} y={460} r={360} c="warm" o={0.35 * pop} />
			{bell(t, S23.gurgle - 0.05, S23.gurgle + 0.5) > 0 && [0, 1, 2].map((k) => { const u = cl((t - S23.gurgle - k * 0.08) / 0.5); return <path key={k} d={`M${430 + k * 26 + 30 * u} ${470 - 50 * u}l6 -10l6 10l-6 10z`} fill="#FFF2B0" opacity={1 - u} />; })}
			<Dust t={t} box={[0, 120, 1400, 850]} n={36} seed={231} c="#FFE2A0" o={0.5} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} dado={false} />
		<Judge id="b23j" cast={JUDGE.green} pose={jp} x={jx} y={jy} s={s} face={-1} t={t} hold="feather" seat={PAL.blue}>
		</Judge>
		<InBone pose={jp} x={jx} y={jy} s={s} face={-1} bone="head"><Squint c={c_(s * 1.13)} k={sq} skin={PAL.skinO} /></InBone>
		<Check x={top[0] - 10} y={top[1] - 60} t={t} t0={S23.nod} s={1.3} />
		{/* the vignette, like a painted panel of the papyrus */}
		<g opacity={pop} transform={`translate(360,460) scale(${panelK}) rotate(${-2 + 2 * pop}) translate(-360,-460)`}>
			<rect x={70} y={170} width={590} height={590} fill="#EBD7A4" stroke={PAL.ink} strokeWidth={4} />
			<rect x={82} y={182} width={566} height={566} fill="none" stroke={PAL.red} strokeWidth={4} /><rect x={92} y={192} width={546} height={546} fill="none" stroke={PAL.blue} strokeWidth={3} />
			<GlyphColumns x={110} y={210} cols={8} rows={2} cell={34} seed={233} />
			<rect x={92} y={652} width={546} height={10} fill={PAL.ink} />
			<path d={sp([[300, 652, 1], [560, 652, 1], [540, 618], [320, 618]], true, 0.2)} fill={PAL.red} stroke={PAL.ink} strokeWidth={2.4} />
			<Baby x={420} y={622} s={34} t={t} bounce={bell(t, S23.gurgle - 0.05, S23.gurgle + 0.45)} giggle={bell(t, S23.gurgle - 0.05, S23.gurgle + 0.6)} />
			{/* your arm, coming in from the panel's edge */}
			<path d={`M${sh[0]} ${sh[1]}Q${(sh[0] + hand[0]) / 2} ${(sh[1] + hand[1]) / 2 + 20} ${hand[0]} ${hand[1]}`} fill="none" stroke={PAL.ink} strokeWidth={50} strokeLinecap="round" />
			<path d={`M${sh[0]} ${sh[1]}Q${(sh[0] + hand[0]) / 2} ${(sh[1] + hand[1]) / 2 + 20} ${hand[0]} ${hand[1]}`} fill="none" stroke={PAL.skinM} strokeWidth={44} strokeLinecap="round" />
			<rect x={hand[0] - 26} y={hand[1] - 9} width={18} height={18} fill={PAL.gold} transform={`rotate(${hA + 90} ${hand[0]} ${hand[1]})`} />
			<g transform={`translate(${hand[0]},${hand[1]}) rotate(${hA}) scale(66)`}><path d={SHAPES.palm} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={0.06} /><path d="M0.36 0.62Q0.36 0.36 0.3 0.2" fill="none" stroke={PAL.line} strokeWidth={0.04} /></g>
			<rect x={70} y={170} width={30} height={590} fill="#EBD7A4" /><rect x={70} y={170} width={30} height={590} fill="none" stroke={PAL.ink} strokeWidth={4} />
		</g>
	</Stage60>;
};

/* ================= 24 · 66.9–69.5 · your hand flat on your chest; behind you the giant balance catches a glint (the camera glances at it and back) ================= */
export const S24 = {glint: 0.4, tick: 2.0};
export const Shot24: React.FC<ShotProps> = ({t}) => {
	const s = 34, ax = 470, sx = 1000, sgy = 760;
	let ani: Pose = {...POSES.rest, lean: 1 + 0.4 * Math.sin(t * 1.3), neck: -1, head: -2 + 0.6 * Math.sin(t * 1.1), rt: -5, at: 8, rk: 2, ak: 1};
	ani = wristTo(holdAt(ani, 'f', [2.25, -3.3 + 0.05 * Math.sin(t * 1.3)]), 'f', 168);
	ani = wristTo(holdAt(ani, 'b', [-1.1, -0.2]), 'b', 4);
	const gl = hit(t, S24.glint, 0.35), gl2 = 0.6 * hit(t, 1.15, 0.3);
	const cam = {x: keys(t, [[0.42, 560], [1.07, 790], [1.27, 790], [1.92, 560]]), y: keys(t, [[0.42, 500], [1.07, 470], [1.27, 470], [1.92, 500]]), z: keys(t, [[0.42, 1.12], [1.07, 1.18], [1.27, 1.18], [1.92, 1.14], [2.6, 1.16]])};
	const top = figXY(ani, ax, GY, s, 1, 'head', [0.2, -3.0]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.3)} stain={0.24}
		light={<>
			<Glow x={sx} y={sgy - 480} r={420} c="gold" o={0.3 + 0.3 * gl} />
			<Glow x={ax + 40} y={GY - 330} r={260} c="warm" o={0.3} />
			<Glow x={ax + 30} y={GY - 300} r={100} c="white" o={0.12 + 0.25 * hit(t, S24.tick, 0.4)} />
			<Dust t={t} box={[0, 100, 1400, 850]} n={44} seed={241} c="#FFE2A0" o={0.55} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} />
		{[220, 1420].map((x) => <g key={x} opacity={0.8}><Column x={x} gy={sgy} top={110} w={46} /></g>)}
		<rect x={sx - 330} y={sgy} width={660} height={22} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
		<g opacity={0.92}><Balance2 p={{tilt: 0.8 * Math.sin(t * 0.9), swingL: 0.6 * Math.sin(t * 1.2), swingR: -0.5 * Math.sin(t * 1.2), plumb: Math.sin(t * 1.5), glint: Math.max(gl, gl2)}} x={sx} y={sgy} s={24} t={t} /></g>
		<rect x={-300} y={sgy + 22} width={2400} height={GY - sgy - 22} fill="#121A42" />
		<God id="b24ani" cast={{...ANI, fHand: 'palm'}} pose={ani} x={ax} y={GY} s={s} sec={{t}} />
		<Check x={top[0]} y={top[1] - 60} t={t} t0={S24.tick} s={1.3} />
	</Stage60>;
};

/* ================= 25 · 69.5–72.1 · 「“我没有……话太多。”」: you freeze mid-sentence, the horned judge raises one brow; a sweat drop ================= */
export const S25 = {freeze: 0.9, squeak: 1.0, sweat: 1.5, cricket: 1.8};
export const hornedPose = (t: number, o: {head?: number; lean?: number} = {}): Pose => jPose(t, 7, {head: o.head ?? 0, lean: o.lean ?? -1});
export const Shot25: React.FC<ShotProps> = ({t}) => {
	const s = 30, ax = 300, tf = Math.min(t, S25.freeze), frozen = t >= S25.freeze;
	let ani: Pose = {...POSES.rest, lean: 3 + 1.2 * Math.sin(tf * 7), neck: 0, head: 2 * Math.sin(tf * 9), rt: -6, at: 9, rk: 2, ak: 1};
	const gest = 0.5 + 0.5 * Math.sin(tf * 6);
	ani = wristTo(reach(ani, 'f', [5.2 + 0.4 * gest, -12.3 - 0.8 * gest]), 'f', 130 + 20 * gest);
	ani = wristTo(holdAt(ani, 'b', [-1.0, -0.3]), 'b', 4);
	const js = 40, jx = 1010, jgy = GY + 40, raise = up(t, S25.freeze + 0.05, 0.5);
	const jp = hornedPose(t, {head: -2 * raise});
	const mouth = figXY(ani, ax, GY, s, 1, 'head', [1.35, -0.5]), brow = figXY(ani, ax, GY, s, 1, 'head', [0.9, -1.75]);
	const sweat = up(t, S25.sweat, 0.12), slide = 40 * up(t, S25.sweat + 0.1, 0.6);
	const cam = camPath(t, [[0, 650, 480, 1.04], [S25.freeze, 660, 478, 1.05], [2.5, 760, 420, 1.24]]);
	const tag = figXY(jp, jx, jgy, js, -1, 'head', [-2.4, -3.0]);
	// the stream of words: a sign leaves the mouth every 0.12 s while you speak; at the freeze they stop dead, then sink and fade
	const words: React.ReactNode[] = [];
	for (let k = 0; k < 9; k++) { const t0 = k * 0.12 - 0.2; if (t0 > S25.freeze) break; const ta = Math.min(t, S25.freeze), d = Math.max(0, ta - t0);
		if (t < t0 || d > 1.4) continue;
		const x = mouth[0] + 30 + 330 * d, y = mouth[1] - 10 - 50 * Math.sin(d * 2.5) + 6 * Math.sin(k), drop = frozen ? 120 * Math.pow(Math.max(0, t - S25.freeze - 0.25), 2) : 0;
		words.push(<g key={k} opacity={frozen ? cl(1 - (t - S25.freeze - 0.3) / 0.9) : cl(d * 5)}><GlyphStack x={x} y={y + drop - 20} cell={38} n={1} seed={250 + k} glow={0.5} /></g>); }
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.3)} stain={0.24} tags={[{x: tag[0] + 20, y: tag[1], text: '长角者', size: 42}]}
		light={<>
			<Glow x={jx - 30} y={jgy - 380} r={380} c="gold" o={0.36} />
			<Glow x={ax + 40} y={GY - 330} r={280} c="warm" o={0.3} />
			<Dust t={t} box={[0, 100, 1400, 850]} n={38} seed={251} c="#FFE2A0" o={frozen ? 0.3 : 0.55} vx={frozen ? 1 : 6} vy={frozen ? -1 : -4} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} />
		<Judge id="b25j" cast={JUDGE.horned} pose={jp} x={jx} y={jgy} s={js} face={-1} t={t} hold="knife" seat={PAL.green} />
		<InBone pose={jp} x={jx} y={jgy} s={js} face={-1} bone="head"><Horns c={c_(js * 1.13)} t={t} /><BrowRaise c={c_(js * 1.13)} raise={raise} skin={PAL.skinM2} /></InBone>
		<God id="b25ani" cast={{...ANI, fHand: 'open'}} pose={ani} x={ax} y={GY} s={s} sec={{t: tf}} />
		{words}
		<Sweat x={brow[0] - 6} y={brow[1] - 8} k={sweat} slide={slide} s={1.2} />
	</Stage60>;
};

/* ================= 26 · 72.1–74.5 · 「这条，你能过吗？」: the horned judge turns and stares straight at you; slow push on his eyes ================= */
export const S26 = {turn: [0.16, 0.46], lock: 0.76};
const FrontBust: React.FC<{k: number; t: number; look: number; blink: number}> = ({k, t, look, blink}) => {
	const c = {OW: 2.7 / k, LW: 1.5 / k}, br = 0.04 * Math.sin(t * 1.6);
	const eye = (sg: number) => { const ex = sg * 0.66, ey = -0.72, L = 0.92, h = 0.26 * (1 - 0.85 * blink), rb = sg > 0 ? 1 : 0;
		const al = sp([[ex - sg * L * 0.55, ey + 0.02, 1], [ex - sg * L * 0.2, ey - h], [ex + sg * L * 0.25, ey - h * 0.95], [ex + sg * L * 0.5, ey, 1], [ex + sg * L * 0.15, ey + h * 0.75], [ex - sg * L * 0.25, ey + h * 0.65]], true, 0.2);
		const lid = sp([[ex - sg * L * 0.58, ey + 0.03], [ex - sg * L * 0.2, ey - h - 0.03], [ex + sg * L * 0.25, ey - h * 0.95 - 0.03], [ex + sg * L * 0.55, ey - 0.01]], false, 0.2);
		const by = ey - 0.5 - 0.2 * rb, arch = 0.12 * rb;
		return <g key={sg}>
			<path d={al} fill={PAL.eye} stroke={PAL.black} strokeWidth={c.LW * 2.2} strokeLinejoin="round" />
			<clipPath id={`b26eye${sg}`}><path d={al} /></clipPath>
			<g clipPath={`url(#b26eye${sg})`}><circle cx={ex + look * 0.16} cy={ey + 0.01} r={0.235} fill="#4A2A12" /><circle cx={ex + look * 0.16} cy={ey + 0.01} r={0.14} fill={PAL.black} />
				<circle cx={ex + look * 0.16 + 0.07} cy={ey - 0.07} r={0.055} fill="#FFFFFF" /></g>
			<path d={lid} fill="none" stroke={PAL.black} strokeWidth={c.LW * 5.5} strokeLinecap="round" />
			<path d={sp([[ex + sg * L * 0.5, ey - 0.02], [ex + sg * (L * 0.5 + 0.42), ey + 0.06], [ex + sg * (L * 0.5 + 0.62), ey + 0.22, 1], [ex + sg * (L * 0.5 + 0.3), ey + 0.14], [ex + sg * L * 0.45, ey + 0.08]], true, 0.15)} fill={PAL.black} />
			<path d={sp([[ex - sg * 0.52, by + 0.1 - 0.08 * (1 - rb)], [ex, by - 0.06 - arch], [ex + sg * 0.6, by + 0.02], [ex + sg * 0.8, by + 0.14, 1], [ex + sg * 0.55, by + 0.1], [ex, by + 0.06 - arch], [ex - sg * 0.5, by + 0.22 - 0.08 * (1 - rb), 1]], true, 0.15)} fill={PAL.black} />
		</g>; };
	const horn = (sg: number) => { const d = sp([[sg * 1.0, -2.55, 1], [sg * 1.9, -3.0], [sg * 3.0, -3.8], [sg * 3.75, -5.2], [sg * 3.6, -6.8], [sg * 2.95, -8.0], [sg * 2.55, -8.25, 1], [sg * 3.0, -7.0], [sg * 3.05, -5.6], [sg * 2.5, -4.4], [sg * 1.6, -3.45], [sg * 0.75, -3.1, 1]], true, 0.18);
		return <g key={'h' + sg}><path d={d} fill="#EFE4C4" stroke={PAL.ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
			{[0.2, 0.35, 0.5, 0.65].map((u, i) => { const y = lerp(-3.4, -7.0, u), x0 = sg * lerp(1.4, 2.8, u), x1 = sg * lerp(2.3, 3.6, Math.min(1, u * 1.1)); return <path key={i} d={`M${x0} ${y + 0.1}L${x1} ${y - 0.15}`} stroke={PAL.ink} strokeWidth={c.LW * 1.4} />; })}
			<circle cx={sg * 2.62} cy={-8.15} r={0.17} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} /></g>; };
	const collarRows: [number, number, string][] = [[2.0, 2.45, PAL.gold], [2.45, 3.1, PAL.blue], [3.1, 3.35, PAL.gold], [3.35, 3.95, PAL.red], [3.95, 4.2, PAL.gold], [4.2, 4.8, PAL.turq], [4.8, 5.0, PAL.gold]];
	const ring = (r0: number, r1: number) => `M${-r1} 1.1A${r1} ${r1 * 0.8} 0 0 0 ${r1} 1.1L${r0} 1.1A${r0} ${r0 * 0.8} 0 0 1 ${-r0} 1.1Z`;
	return <g transform={`scale(${k})`}>
		{horn(-1)}{horn(1)}
		<path d={sp([[-6.4, 7.0, 1], [-6.0, 3.9], [-4.0, 2.4], [-1.2, 1.7], [1.2, 1.7], [4.0, 2.4], [6.0, 3.9], [6.4, 7.0, 1]], true, 0.2)} fill={PAL.skinM2} stroke={PAL.ink} strokeWidth={c.OW * 2} />
		<path d={poly([[-0.95, -0.3], [0.95, -0.3], [1.0, 1.9], [-1.0, 1.9]])} fill={PAL.skinM2} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />
		<path d={ring(2.0, 5.15)} fill={PAL.ink} />
		{collarRows.map(([a, b, cc], i) => <path key={i} d={ring(a, b)} fill={cc} stroke={PAL.ink} strokeWidth={c.LW} />)}
		{/* tripartite wig framing the face, lappets on the chest */}
		<path d={sp([[-2.35, 3.4, 1], [-2.5, 0.8], [-2.45, -1.7], [-1.9, -2.75], [0, -3.2], [1.9, -2.75], [2.45, -1.7], [2.5, 0.8], [2.35, 3.4, 1], [1.4, 3.4, 1], [1.3, 0.6], [1.28, -1.6], [0, -2.1], [-1.28, -1.6], [-1.3, 0.6], [-1.4, 3.4, 1]], true, 0.16)} fill="#232A40" stroke={PAL.ink} strokeWidth={c.OW * 2} />
		{[-2.05, -1.7, 1.7, 2.05].map((x) => <path key={x} d={`M${x} ${-1.6}L${x * 1.02} 3.2`} stroke="#3A4466" strokeWidth={c.LW * 1.5} />)}
		{[-1, 1].map((sg) => [2.6, 2.95].map((y) => <rect key={`${sg}${y}`} x={sg > 0 ? 1.4 : -2.35} y={y} width={0.95} height={0.18} fill={PAL.gold} />))}
		<path d="M-2.1 -2.2Q0 -3.05 2.1 -2.2" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 4} />
		{/* the face */}
		<path d={sp([[-1.3, -1.55], [-1.32, -0.4], [-1.05, 0.6], [-0.55, 1.15], [0, 1.28], [0.55, 1.15], [1.05, 0.6], [1.32, -0.4], [1.3, -1.55], [0.7, -2.05], [0, -2.15], [-0.7, -2.05]], true, 0.18)} fill={PAL.skinM2} stroke={PAL.ink} strokeWidth={c.OW * 1.8} />
		{eye(-1)}{eye(1)}
		<path d={`M-0.08 -0.75L-0.16 ${0.12 + br}Q0 0.22 0.16 ${0.12 + br}L0.08 -0.75`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.4} strokeLinejoin="round" />
		<path d="M-0.3 0.12Q-0.22 0.22 -0.12 0.16M0.3 0.12Q0.22 0.22 0.12 0.16" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<path d="M-0.42 0.58Q0 0.48 0.42 0.58Q0 0.66 -0.42 0.58Z" fill="#7A2A1A" stroke={PAL.ink} strokeWidth={c.LW} />
		<path d="M-0.34 0.64Q0 0.82 0.34 0.64" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
	</g>;
};
export const Shot26: React.FC<ShotProps> = ({t}) => {
	const k = 92, bx = 640, by = 560, eyes: V = [bx, by - 0.72 * k];
	const turnA = cl((t - S26.turn[0]) / 0.14), turnB = cl((t - S26.turn[0] - 0.14) / (S26.turn[1] - S26.turn[0] - 0.14));
	const prof = t < S26.turn[0] + 0.14, sx = prof ? lerp(1, 0.1, sm(turnA)) : lerp(0.1, 1, sm(turnB));
	const lock = up(t, S26.lock - 0.1, 0.12), look = lerp(-1.1, 0, lock), blink = bell(t, 1.9, 2.05);
	const z = keys(t, [[S26.turn[1], 1.0], [2.6, 1.42]]);
	const cam: Cam = {x: eyes[0] + 87 / z, y: lerp(by - 40, eyes[1], up(t, 0.3, 2.0)), z};
	const js = 60, jp = hornedPose(t, {head: -2});
	const [fx, fy] = placeBy(jp, js, -1, 'head', [0.6, -1.2], [bx + 30, by - 70]);
	const tink = hit(t, S26.lock, 0.3);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#121B46" wear={wearFor(z, 0.18)} stain={0.15} tags={[{x: bx - 4.0 * k, y: by - 3.0 * k, text: '长角者', size: 44}]}
		light={<>
			<Glow x={bx} y={by - 200} r={620} c="gold" o={0.28} />
			<Glow x={bx} y={by + 300} r={500} c="red" o={0.22} />
			{tink > 0.02 && [-1, 1].map((sg) => <g key={sg}><Glow x={eyes[0] + sg * 0.66 * k + 0.06 * k} y={eyes[1] - 0.06 * k} r={60} c="white" o={0.9 * tink} /></g>)}
			<Dust t={t} box={[bx - 700, by - 600, bx + 700, by + 400]} n={34} seed={261} c="#FFE2A0" o={0.45} vx={-3} vy={-3} />
		</>}>
		<rect x={-400} y={-600} width={2400} height={2000} fill="#121B46" />
		{[-1, 1].map((sg) => <g key={sg}>{[0, 1, 2].map((j) => <GlyphStack key={j} x={bx + sg * (520 + j * 120)} y={-180 + j * 40} cell={70} n={10} seed={262 + j + (sg > 0 ? 5 : 0)} color="#B8923A" glow={0} o={0.45 - j * 0.1} />)}</g>)}
		{prof ? <g transform={`translate(${bx},0) scale(${sx},1) translate(${-bx},0)`}>
			<Judge id="b26p" cast={JUDGE.horned} pose={jp} x={fx} y={fy} s={js} face={-1} t={t} hold="none" seat={PAL.green} />
			<InBone pose={jp} x={fx} y={fy} s={js} face={-1} bone="head"><Horns c={c_(js * 1.13)} t={t} /><BrowRaise c={c_(js * 1.13)} raise={1} skin={PAL.skinM2} /></InBone>
		</g> : <g transform={`translate(${bx},${by}) scale(${sx},1)`}><FrontBust k={k} t={t} look={look} blink={blink} /></g>}
	</Stage60>;
};
export const _keep = {Embers, Stars, Shaft, ap, mx, chain, T, R, rng, Ceiling, solve, BigKnife, hit, seg, sm, GlyphColumns, PIC_CY};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {God, Pose, POSES, wristTo, holdAt, reach, lerpPose} from './rig60';
import {Stage60, Glow, Dust, Embers, camPath, flick, Cam} from './frame60';
import {Column} from './props60b';
import {GlyphColumns, Mat, BAL} from './props60';
import {ANI, walkPose, STRIDE, adoreArms} from './cast60';
import type {ShotProps} from './EP60';
import {up, hit, keys, bell, wearFor, figXY, InBone, placeBy, JUDGE, jPose, Judge, Horns, BrowRaise, Squint, GlyphStack, Check, Sweat, Baby, Balance2, HallWall, Ammit2, ammit2Solve, panAt} from './act60b_kit';
import {Shot15, Shot16, Shot17} from './act60b_duat';
import {Shot18, Shot19, Shot20, S21, bowPose, hornedPose, FrontBust} from './act60b_hall';
import {Shot29, Shot32, Shot33, Room, kneelAt, leadWalk, plumb27, ammitP, ANUBIS, MAAT, S27} from './act60b_weigh';
import {V, PAL, sp, lerp, cl, sm, ap} from './geo60';

/* act60b · v6 (owner 21:54, "按上面重排时间、合并镜头"): the lines are timed for reading, so every shot is longer, and six pairs are
   MERGED into one continuous picture across two lines (18+19, 21+22, 23+24, 25+26, 27+28, 30+31). Times below are shot-relative;
   L2 = when the second line starts (story60 lines[1].t0 − a). Film times of every event: episodes/60-xinzang/sync60_b.md. */
const GY = 852, BX = 760, BS = 32;
const c_ = (s: number) => ({OW: 2.7 / s, LW: 1.5 / s});

/* ---------- the single-line shots: the v5 picture spread over the new length (time-stretched, so nothing freezes) ---------- */
const stretch = (C: React.FC<ShotProps>, oldDur: number): React.FC<ShotProps> => ({t, dur, n}) => <C t={t * (oldDur / dur)} dur={oldDur} n={n} />;
export const Shot15v6 = stretch(Shot15, 2.7);
export const Shot16v6 = stretch(Shot16, 3.0);
export const Shot17v6 = stretch(Shot17, 3.3);
export const Shot20v6 = stretch(Shot20, 3.0);
export const Shot29v6 = stretch(Shot29, 2.4);
export const Shot32v6 = stretch(Shot32, 3.0);
export const Shot33v6 = stretch(Shot33, 3.0);

/* ================= 18 + 19 (5.15 s, L2 2.34): the doors open, the crane rises over the hall, then pushes on through into the rows of
   the 42 judges (one push, no cut: the hall pushes in toward the judges' gallery while the rows push out of it) ================= */
export const M18 = {L2: 2.34, x0: 2.1, x1: 2.62};
export const Shot18v6: React.FC<ShotProps> = ({t}) => {
	const {L2, x0, x1} = M18, tA = t * (2.9 / 2.6), tB = (t - L2) * (2.7 / 2.81), f = sm((t - x0) / (x1 - x0));
	const kA = 1 + 0.32 * sm((t - 1.85) / (x1 - 1.85)), kB = 1 + 0.22 * (1 - sm((t - x0) / 1.1));
	return <AbsoluteFill>
		{f < 1 && <AbsoluteFill style={{transform: `scale(${kA})`, transformOrigin: '1160px 440px'}}><Shot18 t={tA} dur={2.9} n={18} /></AbsoluteFill>}
		{f > 0 && <AbsoluteFill style={{opacity: f, transform: `scale(${kB})`, transformOrigin: '560px 470px'}}><Shot19 t={tB} dur={2.7} n={19} /></AbsoluteFill>}
	</AbsoluteFill>;
};

/* ================= 21 + 22 (6.22 s, L2 3.41): you bow to the first judge and the oath rises (four columns); the camera trucks right along
   the same row to three more judges, who nod in turn, a gold tick over each ================= */
export const M21 = {L2: 3.41, nods: [4.05, 4.65, 5.25]};
export const Shot21v6: React.FC<ShotProps> = ({t}) => {
	const s = 29, om = 5.0, walkEnd = 0.45, wt = Math.min(t, walkEnd), ax = 196 + STRIDE * s * om * Math.max(-0.3, wt), bow = up(t, 0.38, 0.4);
	const ani = bow > 0 ? lerpPose(walkPose(om * walkEnd + 0.3, {lean: 3}), bowPose(t, 1), bow) : walkPose(om * wt + 0.3, {lean: 3});
	const jx = 960, jgy = GY - 34, lean = up(t, S21.lean[0], 0.6) * (1 - 0.6 * up(t, 3.2, 0.8));
	const jp = jPose(t, 3, {lean: -2 + 17 * lean, neck: 9 * lean, head: 6 * lean});
	const mouth = figXY(ani, ax, GY, s, 1, 'head', [1.3, -0.5]);
	const s3 = 27, jgy3 = GY - 24, J3 = [{x: 1400, cast: JUDGE.ibis, hold: 'feather' as const}, {x: 1720, cast: JUDGE.gold, hold: 'knife' as const}, {x: 2040, cast: JUDGE.jackal, hold: 'feather' as const}];
	const cam = camPath(t, [[0, 600, 500, 1.06], [2.4, 650, 486, 1.09], [4.7, 1720, 452, 1.06], [6.4, 1780, 446, 1.07]]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.3)} stain={0.25}
		light={<>
			<Glow x={jx - 40} y={jgy - 300} r={380} c="gold" o={0.38} />
			<Glow x={ax + 40} y={GY - 300} r={300} c="warm" o={0.25} />
			{J3.map((J_, k) => <Glow key={k} x={J_.x} y={jgy3 - 330} r={200 + 80 * hit(t, M21.nods[k], 0.4)} c="gold" o={0.25 + 0.5 * hit(t, M21.nods[k], 0.4)} />)}
			<Dust t={t} box={[cam.x - 760, 120, cam.x + 760, 850]} n={46} seed={211} c="#FFE2A0" o={0.55} />
		</>}>
		<HallWall x0={-300} x1={2800} t={t} ceil={70} glyphY={150} />
		<rect x={jx - 230} y={jgy} width={460} height={34} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={jx - 220 + k * 76} y={jgy + 8} width={60} height={18} fill={[PAL.blue, PAL.red, PAL.green][k % 3]} />)}
		<Judge id="b21j" cast={JUDGE.falcon} pose={jp} x={jx} y={jgy} s={s + 2} face={-1} t={t} hold="feather" seat={PAL.red} />
		<rect x={1240} y={jgy3} width={1000} height={24} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{J3.map((J_, k) => { const t0 = M21.nods[k], n = bell(t, t0 - 0.08, t0 + 0.3), p = jPose(t, k, {head: 16 * n, neck: 6 * n, lean: -2 + 2 * n});
			const top = figXY(p, J_.x, jgy3, s3, -1, 'head', [0.1, -3.4]), fu = cl((t - t0 + 0.42) / 0.36), ear = figXY(p, J_.x, jgy3, s3, -1, 'head', [0.0, -1.2]);
			return <g key={k}>
				<Judge id={`b21k${k}`} cast={J_.cast} pose={p} x={J_.x} y={jgy3} s={s3} face={-1} t={t} hold={J_.hold} seat={[PAL.blue, PAL.red, PAL.green][k]} />
				{fu > 0 && fu < 1 && <g opacity={bell(fu, 0, 1) * 1.2}><GlyphStack x={lerp(J_.x - 300, ear[0] - 40, sm(fu))} y={ear[1] - 60 - 40 * Math.sin(Math.PI * fu)} cell={34} n={2} seed={230 + k} glow={0.6} /></g>}
				<Check x={top[0] + 10} y={top[1] - 92} t={t} t0={t0} s={1.3} />
			</g>; })}
		<God id="b21ani" cast={ANI} pose={ani} x={ax} y={GY} s={s} sec={{t}} />
		{S21.cols.map((t0, k) => { const u = up(t, t0 - 0.05, 0.35), slot: V = [mouth[0] + 175 + k * 100, 200 + (k % 2) * 34];
			if (t < t0 - 0.05) return null;
			const x = lerp(mouth[0] + 160, slot[0], u) + 6 * (t - t0), y = lerp(mouth[1] - 30, slot[1], u) - 10 * Math.max(0, t - t0) + 4 * Math.sin(t * 2 + k);
			return <g key={k} opacity={1 - up(t, 3.4, 0.8)} transform={`translate(${x},${y}) scale(${lerp(0.3, 1, u)}) translate(${-x},${-y})`}><GlyphStack x={x} y={y} cell={56} n={4} seed={220 + k} glow={0.7 * (0.6 + 0.4 * hit(t, t0, 0.3))} /></g>; })}
	</Stage60>;
};

/* ================= 23 + 24 (5.86 s, L2 3.05): you stand before the green judge, the giant balance behind; a painted vignette of the baby
   with the milk cup floats between you (your hand pulls back), the judge squints and nods; the vignette folds away, you lay your hand on
   your chest, the balance glints (the camera glances at it and back), a tick over you ================= */
export const M23 = {gurgle: 0.35, squint: [1.25, 1.7], nod: 1.95, fold: [2.75, 3.05], hand: [3.05, 3.4], glint: 3.6, glint2: 4.3, tick: 5.25};
export const Shot23v6: React.FC<ShotProps> = ({t}) => {
	const T = M23, as = 30, ax = 330, js = 31, jx = 1150, jgy = GY - 28, sx = 760, sgy = 712;
	const pop = up(t, -0.05, 0.22) * (1 - up(t, T.fold[0], T.fold[1] - T.fold[0])), sq = keys(t, [[T.squint[0], 0], [T.squint[0] + 0.18, 1], [T.squint[1], 1], [T.nod - 0.05, 0]]);
	const nod = bell(t, T.nod - 0.06, T.nod + 0.32);
	const jp = jPose(t, 5, {head: 14 * nod - 3 * sq, neck: 5 * nod, lean: 2 + 3 * sq});
	const jtop = figXY(jp, jx, jgy, js, -1, 'head', [0.1, -3.4]);
	// you: watching (hands at rest), then the front hand flat on your chest
	const hk = up(t, T.hand[0], T.hand[1] - T.hand[0]);
	const rest: Pose = {...POSES.rest, lean: 1 + 0.4 * Math.sin(t * 1.3), neck: -1, head: -2 + 0.6 * Math.sin(t * 1.1), rt: -5, at: 8, rk: 2, ak: 1, fs: 8, fe: 14, fw: -4, bs: -4, be: 8, bw: 0};
	let chest: Pose = wristTo(holdAt(rest, 'f', [2.25, -3.3 + 0.05 * Math.sin(t * 1.3)]), 'f', 168);
	chest = wristTo(holdAt(chest, 'b', [-1.1, -0.2]), 'b', 4);
	const ani = lerpPose(rest, chest, hk);
	const atop = figXY(ani, ax, GY, as, 1, 'head', [0.2, -3.0]);
	const gl = hit(t, T.glint, 0.35), gl2 = 0.6 * hit(t, T.glint2, 0.3);
	const cam = {x: keys(t, [[0, 720], [3.0, 740], [T.glint + 0.02, 740], [T.glint + 0.6, 840], [T.glint2 + 0.1, 840], [T.glint2 + 0.75, 700], [5.9, 690]]),
		y: keys(t, [[0, 486], [3.0, 480], [T.glint + 0.02, 480], [T.glint + 0.6, 430], [T.glint2 + 0.1, 430], [T.glint2 + 0.75, 486]]),
		z: keys(t, [[0, 1.0], [3.0, 1.03], [T.glint + 0.02, 1.03], [T.glint + 0.6, 1.13], [T.glint2 + 0.1, 1.13], [T.glint2 + 0.75, 1.04], [5.9, 1.06]])};
	// the vignette's hand: reaches toward the cup, stops short, pulls back and shows the palm
	const reachK = keys(t, [[0.33, 0], [0.6, 1], [0.72, 1], [1.0, 0]]), back = up(t, 0.72, 0.26);
	const PX = 730, PY = 320, pk = 0.62 * lerp(0.9, 1, up(t, -0.05, 0.22)) * lerp(1, 0.6, up(t, T.fold[0], T.fold[1] - T.fold[0]));
	const hand: V = [lerp(lerp(150, 372, reachK), 196, back * (1 - reachK)), lerp(lerp(470, 548, reachK), 440, back * (1 - reachK))], hA = lerp(-80 + 10 * reachK, 175, back), sh: V = [60, 520];
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.25)} stain={0.22}
		light={<>
			<Glow x={jtop[0]} y={jtop[1] + 100} r={300} c="gold" o={0.3 + 0.4 * hit(t, T.nod, 0.4)} />
			<Glow x={sx} y={sgy - 420} r={380} c="gold" o={0.25 + 0.3 * gl} />
			<Glow x={ax + 40} y={GY - 300} r={260} c="warm" o={0.28} />
			<Glow x={PX} y={PY} r={330} c="warm" o={0.3 * pop} />
			<Glow x={ax + 30} y={GY - 280} r={100} c="white" o={0.25 * hit(t, T.tick, 0.4)} />
			<Dust t={t} box={[0, 100, 1400, 850]} n={40} seed={231} c="#FFE2A0" o={0.5} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} />
		{[90, 1420].map((x) => <g key={x} opacity={0.8}><Column x={x} gy={sgy} top={110} w={46} /></g>)}
		<rect x={sx - 300} y={sgy} width={600} height={20} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
		<g opacity={0.9}><Balance2 p={{tilt: 0.8 * Math.sin(t * 0.9), swingL: 0.6 * Math.sin(t * 1.2), swingR: -0.5 * Math.sin(t * 1.2), plumb: Math.sin(t * 1.5), glint: Math.max(gl, gl2)}} x={sx} y={sgy} s={22} t={t} /></g>
		<rect x={-300} y={sgy + 20} width={2400} height={GY - sgy - 20} fill="#121A42" />
		<rect x={jx - 200} y={jgy} width={400} height={28} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		<Judge id="b23j" cast={JUDGE.green} pose={jp} x={jx} y={jgy} s={js} face={-1} t={t} hold="feather" seat={PAL.blue} />
		<InBone pose={jp} x={jx} y={jgy} s={js} face={-1} bone="head"><Squint c={c_(js * 1.13)} k={sq} skin={PAL.skinO} /></InBone>
		<Check x={jtop[0] - 10} y={jtop[1] - 60} t={t} t0={T.nod} s={1.2} />
		<God id="b23ani" cast={{...ANI, fHand: 'palm'}} pose={ani} x={ax} y={GY} s={as} sec={{t}} />
		<Check x={atop[0] + 110} y={atop[1] + 30} t={t} t0={T.tick} s={1.2} />
		{/* the vignette, a painted panel floating between you and the judge */}
		{pop > 0.01 && <g opacity={pop} transform={`translate(${PX},${PY}) scale(${pk}) rotate(${-2 + 2 * pop}) translate(-365,-465)`}>
			<rect x={70} y={170} width={590} height={590} fill="#EBD7A4" stroke={PAL.ink} strokeWidth={4} />
			<rect x={82} y={182} width={566} height={566} fill="none" stroke={PAL.red} strokeWidth={4} /><rect x={92} y={192} width={546} height={546} fill="none" stroke={PAL.blue} strokeWidth={3} />
			<GlyphColumns x={110} y={210} cols={8} rows={2} cell={34} seed={233} />
			<rect x={92} y={652} width={546} height={10} fill={PAL.ink} />
			<path d={sp([[300, 652, 1], [560, 652, 1], [540, 618], [320, 618]], true, 0.2)} fill={PAL.red} stroke={PAL.ink} strokeWidth={2.4} />
			<Baby x={420} y={622} s={34} t={t} bounce={bell(t, T.gurgle - 0.05, T.gurgle + 0.45)} giggle={bell(t, T.gurgle - 0.05, T.gurgle + 0.6)} />
			{bell(t, T.gurgle - 0.05, T.gurgle + 0.5) > 0 && [0, 1, 2].map((k) => { const u = cl((t - T.gurgle - k * 0.08) / 0.5); return <path key={k} d={`M${470 + k * 26 + 30 * u} ${470 - 50 * u}l6 -10l6 10l-6 10z`} fill="#FFF2B0" opacity={1 - u} />; })}
			<path d={`M${sh[0]} ${sh[1]}Q${(sh[0] + hand[0]) / 2} ${(sh[1] + hand[1]) / 2 + 20} ${hand[0]} ${hand[1]}`} fill="none" stroke={PAL.ink} strokeWidth={50} strokeLinecap="round" />
			<path d={`M${sh[0]} ${sh[1]}Q${(sh[0] + hand[0]) / 2} ${(sh[1] + hand[1]) / 2 + 20} ${hand[0]} ${hand[1]}`} fill="none" stroke={PAL.skinM} strokeWidth={44} strokeLinecap="round" />
			<rect x={hand[0] - 26} y={hand[1] - 9} width={18} height={18} fill={PAL.gold} transform={`rotate(${hA + 90} ${hand[0]} ${hand[1]})`} />
			<g transform={`translate(${hand[0]},${hand[1]}) rotate(${hA}) scale(66)`}><path d={'M-0.34 -0.12L0.32 -0.12L0.42 0.16L0.64 0.38L0.73 0.64L0.66 0.79L0.52 0.78L0.43 0.62L0.42 1.06L0.39 1.48L0.3 1.63L0.04 1.69L-0.22 1.62L-0.37 1.26L-0.42 0.6Z'} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={0.06} strokeLinejoin="round" /></g>
			<rect x={70} y={170} width={30} height={590} fill="#EBD7A4" /><rect x={70} y={170} width={30} height={590} fill="none" stroke={PAL.ink} strokeWidth={4} />
		</g>}
	</Stage60>;
};

/* ================= 25 + 26 (4.40 s, L2 2.20): you talk, freeze on 「话太多」, the horned judge raises a brow, a sweat drop; the camera pushes
   onto his face, he turns to the viewer (cross-fade to the frontal face), his eyes lock on you, one brow up ================= */
export const M25 = {freeze: 0.9, squeak: 1.0, sweat: 1.5, cricket: 1.8, turn: [2.36, 2.66], lock: 2.96, brow: 3.25, blink: 4.1};
export const Shot25v6: React.FC<ShotProps> = ({t}) => {
	const T = M25, s = 30, ax = 300, tf = Math.min(t, T.freeze), frozen = t >= T.freeze;
	let ani: Pose = {...POSES.rest, lean: 3 + 1.2 * Math.sin(tf * 7), neck: 0, head: 2 * Math.sin(tf * 9), rt: -6, at: 9, rk: 2, ak: 1};
	const gest = 0.5 + 0.5 * Math.sin(tf * 6);
	ani = wristTo(reach(ani, 'f', [5.2 + 0.4 * gest, -12.3 - 0.8 * gest]), 'f', 130 + 20 * gest);
	ani = wristTo(holdAt(ani, 'b', [-1.0, -0.3]), 'b', 4);
	const js = 40, jx = 1010, jgy = GY + 40, raise = up(t, T.freeze + 0.05, 0.5);
	const jp = hornedPose(t, {head: -2 * raise});
	const mouth = figXY(ani, ax, GY, s, 1, 'head', [1.35, -0.5]), brow = figXY(ani, ax, GY, s, 1, 'head', [0.9, -1.75]);
	const sweat = up(t, T.sweat, 0.12), slide = 40 * up(t, T.sweat + 0.1, 0.6);
	// the frontal face sits where the profile head is (k = 1.53 × js, as in v5's shot 26)
	const k = 1.53 * js, face = figXY(jp, jx, jgy, js, -1, 'head', [0.55, -1.15]), eyes: V = [face[0], face[1]], bust: V = [eyes[0], eyes[1] + 0.72 * k];
	const xf = sm(cl((t - T.turn[0]) / (T.turn[1] - T.turn[0])));
	const z1 = 92 / k, zEnd = z1 * 1.42;
	const cam = camPath(t, [[0, 650, 480, 1.04], [T.freeze, 660, 478, 1.05], [1.95, 740, 432, 1.18], [2.62, eyes[0] + 87 / z1, eyes[1] - 30, z1], [4.5, eyes[0] + 87 / zEnd, eyes[1], zEnd]]);
	const tag = figXY(jp, jx, jgy, js, -1, 'head', [-2.4, -3.0]);
	const words: React.ReactNode[] = [];
	for (let w = 0; w < 9; w++) { const t0 = w * 0.12 - 0.2; if (t0 > T.freeze) break; const ta = Math.min(t, T.freeze), d = Math.max(0, ta - t0);
		if (t < t0 || d > 1.4) continue;
		const x = mouth[0] + 30 + 330 * d, y = mouth[1] - 10 - 50 * Math.sin(d * 2.5) + 6 * Math.sin(w), drop = frozen ? 120 * Math.pow(Math.max(0, t - T.freeze - 0.25), 2) : 0;
		words.push(<g key={w} opacity={frozen ? cl(1 - (t - T.freeze - 0.3) / 0.9) : cl(d * 5)}><GlyphStack x={x} y={y + drop - 20} cell={38} n={1} seed={250 + w} glow={0.5} /></g>); }
	const lock = up(t, T.lock - 0.1, 0.12), look = lerp(-1.1, 0, lock), blink = bell(t, T.blink, T.blink + 0.15), tink = hit(t, T.lock, 0.3);
	const tagX = t < T.turn[0] ? tag[0] + 20 : bust[0] - 4.0 * k, tagY = t < T.turn[0] ? tag[1] : bust[1] - 3.0 * k;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={wearFor(cam.z, 0.3)} stain={0.24} tags={[{x: tagX, y: tagY, text: '长角者', size: 42, o: t < T.turn[0] ? 1 : up(t, T.turn[1], 0.25)}]}
		light={<>
			<Glow x={jx - 30} y={jgy - 380} r={380} c="gold" o={0.36} />
			<Glow x={ax + 40} y={GY - 330} r={280} c="warm" o={0.3} />
			<Glow x={bust[0]} y={bust[1] + 200} r={330} c="red" o={0.2 * xf} />
			{tink > 0.02 && [-1, 1].map((sg) => <Glow key={sg} x={eyes[0] + sg * 0.66 * k + 0.06 * k} y={eyes[1] - 0.06 * k} r={40} c="white" o={0.9 * tink} />)}
			<Dust t={t} box={[0, 100, 1400, 850]} n={38} seed={251} c="#FFE2A0" o={frozen ? 0.3 : 0.55} vx={frozen ? 1 : 6} vy={frozen ? -1 : -4} />
		</>}>
		<HallWall x0={-300} x1={1900} t={t} ceil={70} glyphY={150} />
		{xf < 1 && <g opacity={1 - xf}>
			<Judge id="b25j" cast={JUDGE.horned} pose={jp} x={jx} y={jgy} s={js} face={-1} t={t} hold="knife" seat={PAL.green} />
			<InBone pose={jp} x={jx} y={jgy} s={js} face={-1} bone="head"><Horns c={c_(js * 1.13)} t={t} /><BrowRaise c={c_(js * 1.13)} raise={raise} skin={PAL.skinM2} /></InBone>
		</g>}
		{xf > 0 && <g opacity={xf} transform={`translate(${bust[0]},${bust[1]})`}><FrontBust k={k} t={t} look={look} blink={blink} raise={up(t, T.brow, 0.22)} /></g>}
		<God id="b25ani" cast={{...ANI, fHand: 'open'}} pose={ani} x={ax} y={GY} s={s} sec={{t: tf}} />
		{words}
		<Sweat x={brow[0] - 6} y={brow[1] - 8} k={sweat} slide={slide} s={1.2} />
	</Stage60>;
};

/* ================= 27 + 28 (6.81 s, L2 3.52): Anubis leads you in by the hand and steadies the plumb (the v5 action, spread over the
   first line); the camera rises to the beam: your heart drops onto the left pan, Ma'at's feather onto the right, Ma'at fades in ================= */
export const M27 = {k1: 3.0 / 3.52, L2: 3.52, heart: [3.52, 3.92], feather: [3.87, 4.52], maat: [4.72, 5.62]};
export const Shot27v6: React.FC<ShotProps> = ({t}) => {
	const T = M27, t1 = t < T.L2 ? t * T.k1 : 3.0 + (t - T.L2);
	const as = 26, D = 12.3 * as, om = S27.om, tw = Math.min(t1, S27.stop);
	const xL0 = BX - 160 - STRIDE * as * om * S27.stop, xL = xL0 + STRIDE * as * om * tw, xF = xL - D;
	const phL = om * tw + S27.ph0, phF = phL + Math.PI / 2;
	const hU = cl((t - T.heart[0]) / (T.heart[1] - T.heart[0])), fU = cl((t - T.feather[0]) / (T.feather[1] - T.feather[0]));
	const kL = hit(t, T.heart[1], 0.35), kR = hit(t, T.feather[1], 0.35);
	const tilt27 = 0.8 * Math.sin(t1 * 2.1) * (1 - up(t1, S27.touch, 0.5));
	const bal = {tilt: tilt27 + 1.6 * kL * Math.sin((t - T.heart[1]) * 14) - 1.0 * kR * Math.sin((t - T.feather[1]) * 14) + 0.3 * Math.sin(t * 1.3) * up(t, T.L2, 0.5),
		swingL: 1.2 * Math.sin(t1 * 2.6) * (1 - up(t, 3.0, 0.6)) + 2 * kL * Math.sin((t - T.heart[1]) * 11), swingR: -Math.sin(t1 * 2.6) * (1 - up(t, 3.0, 0.6)) - 1.6 * kR * Math.sin((t - T.feather[1]) * 11),
		plumb: plumb27(t1) + 0.6 * Math.sin(t * 1.7) * up(t, T.L2, 0.5),
		heartO: t >= T.heart[0] ? 1 : 0, featherO: t >= T.feather[0] ? 1 : 0,
		heartDy: -7 * (1 - hU * hU), featherDy: -7.5 * (1 - fU), featherRot: 24 * (1 - fU) * Math.sin(fU * 9), featherDx: 1.2 * (1 - fU) * Math.sin(fU * 7)};
	const P = panAt(bal, BX, GY, BS);
	const {lead, fol} = leadWalk(phL, phF, as, xL, xF);
	const kk = up(t1, S27.kneel[0], S27.kneel[1] - S27.kneel[0]), fin = up(t1, S27.touch - 0.3, 0.3);
	const kn = kneelAt(fin > 0 ? P.bob : [P.bob[0] - 40, P.bob[1] + 60], xL, as, 5 + 1.5 * Math.sin(t * 1.5), -6 + 3 * fin);
	const anubis = kk > 0 ? lerpPose(lead, kn, kk) : lead;
	const adore = up(t1, S27.stop, 0.4), aniStand = adoreArms({...POSES.adore, lean: 7 + 0.6 * Math.sin(t * 1.4), head: 3}, false, 1);
	const ani = adore > 0 ? lerpPose(fol, aniStand, adore) : fol;
	const tick = Math.max(...S27.ticks.map((x) => hit(t1, x, 0.12, 0.03)));
	const z2 = keys(t, [[4.0, 1.4], [6.9, 1.5]]);
	const cam = camPath(t, [[-0.4, BX - 300, 476, 1.0], [3.15, BX - 175, 454, 1.07], [4.0, BX + (720 - 633) / 1.4, 336, 1.4], [6.9, BX + (720 - 633) / 1.5, 336, 1.5]]);
	const maat = up(t, T.maat[0], T.maat[1] - T.maat[0]), mx_ = BX + BAL.half * BS + 50, ms = 30;
	let mp: Pose = {...POSES.rest, lean: 1, head: -1 + 0.5 * Math.sin(t), rt: -4, at: 6, rk: 1, ak: 1};
	mp = wristTo(holdAt(mp, 'f', [3.0, -5.6], true), 'f', 150); mp = wristTo(holdAt(mp, 'b', [2.2, -5.0], true), 'b', 140);
	const mtag = figXY(mp, mx_, GY, ms, -1, 'head', [-2.2, -3.6], true);
	const tags = [{x: xL - 2.3 * as, y: GY - 23.5 * as, text: '阿努比斯', size: 38, o: 1 - up(t, 3.1, 0.3)}];
	if (maat > 0.3) tags.push({x: Math.min(mtag[0] + 30, cam.x + (1210 - 720) / cam.z), y: mtag[1], text: '玛阿特', size: 40, o: up(maat, 0.3, 0.4)});
	void z2;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#17224F" wear={wearFor(cam.z, 0.3)} stain={0.22} tags={tags}
		light={<>
			<Glow x={BX} y={300} r={520} c="gold" o={0.32} />
			<Glow x={BX + 300} y={GY - 60} r={360} c="red" o={0.26} />
			<Glow x={P.bob[0]} y={P.bob[1]} r={90} c="white" o={0.5 * tick} />
			{t > T.heart[0] && <Glow x={BX - BAL.half * BS} y={400} r={130 + 40 * kL} c="red" o={0.55 + 0.3 * kL} />}
			<Glow x={mx_} y={320} r={300} c="white" o={0.32 * maat} />
			<Dust t={t} box={[BX - 900, 0, BX + 700, 860]} n={44} seed={271} c="#FFE2A0" o={0.55} />
		</>}>
		<Room t={t} />
		<g opacity={0.9 * maat}><God id="b27maat" cast={MAAT} pose={mp} x={mx_} y={GY} s={ms} face={-1} sec={{t}} /></g>
		<Balance2 p={{...bal, tick}} x={BX} y={GY} s={BS} t={t} />
		<God id="b27ani" cast={ANI} pose={ani} x={xF} y={GY} s={as} sec={{t}} />
		<God id="b27an" cast={ANUBIS} pose={anubis} x={xL} y={GY} s={as} sec={{t}} />
	</Stage60>;
};

/* ================= 30 + 31 (6.34 s, L2 3.05): Ammit crouched under the scale, growl, claws scrape (line 1); the camera pushes onto her
   and tilts down her body in three beats: crocodile head (jaws clack), lion forepart (she rears back and ROARS, mane bristling), hippo
   rump (it wiggles) ================= */
export const M30 = {growl: 0.5, scrape: 1.75, push: [2.75, 3.35], clack: 3.55, tilt1: [3.75, 4.3], roar: 4.5, tilt2: [4.95, 5.65], plop: 5.8};
export const Shot30v6: React.FC<ShotProps> = ({t}) => {
	const T = M30, s = 42, ax = BX + 330, BS2 = 36, ay = GY - 0.5 * BS2;
	const g = hit(t, T.growl, 0.5, 0.1), scr = keys(t, [[T.scrape - 0.12, 0], [T.scrape + 0.12, -0.7], [2.5, -0.7], [2.8, 0]]), tremble = g * Math.sin(t * 60) * 0.8;
	const clack = keys(t, [[T.clack - 0.28, 0], [T.clack - 0.1, 1], [T.clack, 0]]);
	const wind = keys(t, [[T.roar - 0.42, 0], [T.roar - 0.1, 1], [T.roar - 0.02, 0]]), roar = keys(t, [[T.roar - 0.07, 0], [T.roar, 1], [T.roar + 0.42, 1], [T.roar + 0.68, 0]]);
	const wig = 11 * Math.sin((t - T.plop) * 26) * Math.exp(-Math.max(0, t - T.plop) / 0.25) * (t > T.plop - 0.02 ? 1 : 0);
	const neck0 = lerp(15, 6, up(t, 3.0, 0.4));
	const pose = ammitP(t, {jaw: 4 + 16 * g + 30 * clack + 56 * roar, lean: 1 + 2.5 * g + tremble - 6 * wind, neck: neck0 + 3 * g + tremble + 10 * wind + 3 * roar, paw: scr,
		tail: 18 * Math.sin(t * 3) + 30 * bell(t, T.plop, T.plop + 0.5) + 30 * roar});
	const bal = {tilt: 0.5 * Math.sin(t * 1.1), swingL: 0.6 * Math.sin(t * 1.4), swingR: -0.5 * Math.sin(t * 1.4), plumb: 0.6 * Math.sin(t * 1.7)};
	const P = panAt(bal, BX, GY, BS2);
	const W = (u: number, v: number): V => [ax - u * s, ay + v * s];
	const head = W(4.8, -7.4), fore = W(2.6, -5.1), rump = W(-1.7, -2.9), Z = 1.86;
	const wide = camPath(t, [[0, BX + 20, 540, 1.04], [T.push[0], BX + 50, 548, 1.12]]);
	const tx = keys(t, [[T.tilt1[0], head[0] - 28], [T.tilt1[1], fore[0] - 28], [T.tilt2[0], fore[0] - 28], [T.tilt2[1], rump[0] - 28]]);
	const ty = keys(t, [[T.tilt1[0], head[1] + 8], [T.tilt1[1], fore[1] + 8], [T.tilt2[0], fore[1] + 8], [T.tilt2[1], rump[1] + 8]]) - 20 * roar;
	const pu = sm((t - T.push[0]) / (T.push[1] - T.push[0]));
	const zr = 0.09 * keys(t, [[T.roar - 0.05, 0], [T.roar + 0.2, 1], [T.roar + 0.5, 1], [T.roar + 0.8, 0]]);
	const cam: Cam = {x: lerp(wide.x, tx, pu), y: lerp(wide.y, ty, pu), z: lerp(wide.z, Z, pu) + zr + 0.03 * Math.sin(t * 1.3) * pu};
	const scrapeK = up(t, T.scrape, 0.2), pawX = ax - (3.35 + 1.0) * s, pop = hit(t, T.plop, 0.3);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#120C2E" wear={wearFor(cam.z, 0.3)} stain={0.22} dark={0.18} darkC="#100410"
		tags={[{x: ax + 4.4 * s, y: GY - 8.6 * s, text: '阿米特', size: 42, o: 1 - up(t, 2.6, 0.3)}]}
		light={<>
			<Glow x={ax + 60} y={GY - 260} r={560} ry={360} c="red" o={0.55 + 0.25 * g + 0.2 * roar + 0.06 * flick(t, 3)} />
			<Glow x={P.L[0]} y={P.L[1] - 30} r={140} c="red" o={0.6} />
			<Glow x={P.L[0]} y={P.L[1] - 30} r={60} c="warm" o={0.5} />
			<Glow x={head[0] - 90} y={head[1] + 20} r={120} c="white" o={0.4 * hit(t, T.clack, 0.2)} />
			<Glow x={rump[0] + 30} y={rump[1] - 30} r={160} c="warm" o={0.5 * pop} />
			{scrapeK > 0 && scrapeK < 1 && <Glow x={pawX} y={GY} r={120} ry={30} c="smoke" o={0.6 * (1 - scrapeK)} blend="normal" />}
			<Embers t={t} x={ax} y={GY - 20} n={12} seed={301} h={420} spread={500} />
			<Dust t={t} box={[ax - 800, 200, ax + 500, 880]} n={28} seed={311} c="#FFC0A0" o={0.4} />
		</>}>
		<Room t={t} />
		<rect x={-500} y={-600} width={2600} height={1500} fill="#2A0610" opacity={0.35} />
		<Balance2 p={bal} x={BX} y={GY} s={BS2} t={t} />
		<Glow x={ax} y={GY - 200} r={420} ry={300} c="red" o={0.6} />
		<Mat x0={ax - 360} x1={ax + 260} y={GY} s={BS2} />
		<Ammit2 pose={pose} x={ax} y={ay} s={s} face={-1} t={t} rim={0.8} look={2.2} mr={Math.max(0.4 * g, roar)} wig={wig} roar={roar} id="b30am" />
		{scrapeK > 0 && [0, 1, 2].map((i) => <path key={i} d={`M${pawX - 30 + i * 18} ${GY - 4}l${-60 * scrapeK} ${2}`} stroke="#F3E3C0" strokeWidth={3} opacity={0.8 * (1 - up(t, 2.6, 0.3))} />)}
		{roar > 0.05 && (() => { const gg = ammit2Solve(pose, roar), mm = ap(gg.N, [7.6, 0.6]), mw: V = [ax - mm[0] * s, ay + mm[1] * s], u = cl((t - T.roar) / 0.6);
			return <g opacity={roar * (1 - 0.5 * u)}>{[0, 1, 2].map((i) => { const r = 28 + i * 32 + 84 * u; return <path key={i} d={`M${mw[0] - r * 0.55} ${mw[1] - r * 0.85}A${r} ${r} 0 0 0 ${mw[0] - r * 0.55} ${mw[1] + r * 0.85}`} fill="none" stroke="#FFE7C0" strokeWidth={4.4 - i} strokeLinecap="round" opacity={0.9 - i * 0.22} />; })}</g>; })()}
		{pop > 0.05 && <g opacity={pop}>{[0, 1, 2].map((i) => <path key={i} d={`M${rump[0] + 105 + i * 10} ${rump[1] - 42 + i * 21}q${14 + 21 * (1 - pop)} 0 ${21 + 28 * (1 - pop)} ${-7}`} fill="none" stroke="#FFE7C0" strokeWidth={3} strokeLinecap="round" />)}</g>}
	</Stage60>;
};
export const _keep = {placeBy, Embers};

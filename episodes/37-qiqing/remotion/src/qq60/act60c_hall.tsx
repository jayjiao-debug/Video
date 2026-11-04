/* ep60 act C · the two endings at the scale and the close (shots 41–44, 54, 55): the pan crashes, Ammit springs and bites (cut on
   contact), the second death (the silhouette blows away as sand), the rewind into the gold-lit hall, the beam settling level, the
   end-card background. */
import React from 'react';
import {God, CAST, Ammit, AmmitPose, Pose} from './rig60';
import {Heart, Feather} from './props60';
import {Stage60, Glow, Dust, Embers, Stars, Shaft, rng, flick, FW, FH, PIC_T} from './frame60';
import {ANI, ANI_POSES} from './cast60';
import {wobIn, camE, eOut, eIn, bump, BalanceC, balW, HallBg, ctxC, Sparkle} from './act60c_common';
import {PAL, lerp, sm, cl, seg, V, sp} from './geo60';
import type {ShotProps} from './EP60';
import {Ammit2} from './act60b_kit'; // ep60 v2: the shared Ammit (builder B owns her design)

const GY = 852;
const silM = (r: number, g: number, b: number) => `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 1 0`;

/* ======================= 41 · 「可如果，秤[歪]了——」 the heart's pan crashes down, the feather flips off, Ammit springs ======================= */
export const T41 = {bang: 0.32, spring: 0.8, roar: 0.98};
const S41: React.FC<ShotProps> = ({t}) => {
	const BX = 560, s = 32, b = T41.bang, tb = t - b;
	const tilt = t < b ? lerp(1.5, 22.5, eIn(cl((t + 0.15) / (b + 0.15)))) : 20 + 2.5 * Math.exp(-tb / 0.2) * Math.cos(tb * 24);
	const swing = t < b ? 0.8 * Math.sin(t * 6) : 9 * Math.exp(-tb / 0.5) * Math.sin(tb * 8.5);
	const p = {tilt, swingL: -swing, swingR: swing * 1.3, plumb: -0.3 * tilt + (t > b ? 12 * Math.exp(-tb / 0.6) * Math.sin(tb * 7) : 0)};
	const w0 = balW({tilt: 22.5, swingL: 0, swingR: 0}, BX, GY, s);
	const fu = Math.max(0, tb), fx = w0.panR[0] + 150 * fu, fy = w0.panR[1] - 560 * fu + 330 * fu * fu, fr = 620 * fu;
	// Ammit: crouched growl, then the spring (jaws wide) toward the fallen heart
	const sp_ = seg(t, T41.spring, 2.25), lift = eOut(sp_);
	const ap_: AmmitPose = {lean: lerp(-2, 13, sm(seg(t, T41.spring - 0.1, T41.spring + 0.3))), neck: lerp(2, 16, sm(seg(t, T41.spring, T41.spring + 0.35))), jaw: lerp(7 + 3 * Math.max(0, Math.sin(t * 9)), 40, sm(seg(t, T41.spring + 0.05, T41.roar))), tail: 18 * Math.sin(t * 5), breathe: 0.5 + 0.5 * Math.sin(t * 6)};
	const AX = 1022, dx = -300 * lift, dy = -95 * Math.sin(Math.PI * 0.62 * lift) - 20 * lift, rot = -10 * sm(seg(t, T41.spring, T41.spring + 0.4)) + 6 * sm(seg(t, 1.5, 2.2));
	const shake = 0 * (t > b ? 7 * Math.exp(-tb / 0.13) * Math.sin(tb * 70) : 0); // owner 15:10: no screen shake
	const cam = camE(t, 0, 2.3, [700, 486, 1.0], [650, 480, 1.07]);
	return <Stage60 t={t} cam={{...cam, x: cam.x + shake, y: cam.y + shake * 0.6}} grade="blood" bg="#3A0E0A" wear={0.45} stain={0.4} flickSeed={41}
		tags={[{x: 1150, y: 340, text: '阿米特', o: sm((t - 0.3) / 0.3)}]}
		light={<>
			<Glow x={AX - 100 + dx} y={700 + dy} r={420} c="red" o={0.55 + 0.1 * flick(t, 4)} />
			<Glow x={w0.panL[0]} y={w0.panL[1] - 40} r={240} c="red" o={0.5 + 0.4 * Math.exp(-Math.max(0, tb) / 0.3)} />
			{t > b && <Glow x={w0.panL[0]} y={w0.panL[1] + 10} r={300} c="white" o={0.7 * Math.exp(-tb / 0.12)} />}
			<Embers t={t} x={AX - 150} y={GY - 30} n={18} seed={41} h={420} spread={360} />
			<Dust t={t} box={[0, 60, 1300, 900]} n={30} seed={41} c="#FFB080" o={0.5} vx={-4} vy={-6} />
		</>}
		screen={t > b ? <rect width={FW} height={FH} fill="#FF3A1E" opacity={0.25 * Math.exp(-tb / 0.18)} style={{mixBlendMode: 'screen'}} /> : null}>
		<HallBg t={t} x0={-300} x1={1700} red cols={[40, 1250]} />
		<BalanceC p={p} x={BX} y={GY} s={s} t={t} feather={t < b} />
		{t > b && fy < 1100 && <g transform={`translate(${fx},${fy}) rotate(${fr}) scale(${s})`}><Feather c={ctxC(s)} h={3.0} /></g>}
		<g transform={`translate(${dx},${dy}) rotate(${rot} ${AX - 150} ${GY - 120})`}><Ammit2 pose={ap_} x={AX} y={GY} s={44} face={-1} t={t} rim={0.7} id="c41am" roar={sm(seg(t, T41.spring + 0.02, T41.roar)) * (1 - sm(seg(t, 1.75, 2.15)))} /></g>
	</Stage60>;
};

/* ======================= 42 · 「阿米特一口，[吞]掉你的心。」 the jaws close on the heart in silhouette; cut on contact to red, then black ======================= */
export const T42 = {bite: 1.22};
const S42: React.FC<ShotProps> = ({t}) => {
	const bt = T42.bite, after = t >= bt;
	const HX = 470, HY = 612, hs = 80, beat = 1 + 0.05 * Math.max(0, Math.sin(t * 9));
	const a1 = eOut(seg(t, -0.3, 0.85)), a2 = eIn(seg(t, 0.85, bt));
	const ax = lerp(lerp(1430, 1020, a1), 772, a2), ay = 905 - 30 * Math.sin(Math.PI * a2);
	const jaw = t < bt - 0.1 ? lerp(10, 34, sm(seg(t, 0, 0.8))) : lerp(34, 0, cl((t - (bt - 0.1)) / 0.1));
	const ap_: AmmitPose = {lean: lerp(-1, 3, a2), neck: lerp(3, -3, a2), jaw, tail: 16 * Math.sin(t * 6), breathe: 0.5 + 0.5 * Math.sin(t * 7)};
	const fl = after ? Math.exp(-(t - bt) / 0.28) : 0, black = sm(seg(t, bt + 0.05, bt + 0.55));
	const pan = 46;
	return <Stage60 t={t} cam={camE(t, -0.3, bt, [720, 486, 1.0], [690, 496, 1.07])} grade="blood" bg="#2A0806" wear={0.35} stain={0.35} flickSeed={42}
		tags={!after ? [{x: 1150, y: 260, text: '阿米特'}] : []}
		light={!after ? <Dust t={t} box={[0, 60, 1300, 900]} n={30} seed={42} c="#FFB080" o={0.5} vx={-30} vy={-10} /> : <Embers t={t} x={HX + 120} y={HY} n={8} seed={42} h={300} spread={300} />}
		screen={after ? <>
			<rect width={FW} height={FH} fill="#FF2A10" opacity={0.95 * fl} />
			<circle cx={HX + 60} cy={HY - 60} r={620} fill="url(#g60-white)" opacity={0.9 * fl} style={{mixBlendMode: 'screen'}} />
			<rect width={FW} height={FH} fill="#000" opacity={black * 0.97} />
		</> : null}>
		<defs>
			<filter id="c42rim" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius={4} /><feColorMatrix type="matrix" values={silM(1, 0.6, 0.2)} /><feGaussianBlur stdDeviation={2.5} /></filter>
		</defs>
		<rect x={-300} y={-100} width={2100} height={1300} fill="#2A0806" />
		{!after && <>
			<circle cx={HX + 120} cy={HY - 90} r={760} fill="url(#g60-ember)" opacity={0.75 + 0.08 * flick(t, 3)} />
			<circle cx={HX} cy={HY - 70} r={330} fill="url(#g60-warm)" opacity={0.85} />
			<rect x={-300} y={905} width={2100} height={300} fill="#120302" />
			{/* the pan, fallen low, its cords up to the beam out of frame */}
			{[-1.85, -0.6, 0.6, 1.85].map((u) => <line key={u} x1={HX + u * pan} y1={HY} x2={HX + 260} y2={-60} stroke={PAL.ink} strokeWidth={2.4} />)}
			<g transform={`translate(${HX},${HY}) scale(${hs * beat})`}><Heart c={ctxC(hs)} /></g>
			<g transform={`translate(${HX},${HY}) scale(${pan})`}><path d={sp([[-2.05, 0, 1], [2.05, 0, 1], [1.6, 0.5], [0.7, 0.74], [-0.7, 0.74], [-1.6, 0.5]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2.4 / pan} /></g>
			<Ammit2 pose={ap_} x={ax} y={ay} s={58} face={-1} t={t} rim={0.9} id="c42am" />
		</>}
	</Stage60>;
};

/* ======================= 43 · 「这叫“[第二次死亡]”：彻底消失。」 your silhouette crumbles to sand and blows away ======================= */
export const T43 = {c0: 0.45, c1: 2.6};
const ASH = (() => { const R = rng(43), out: {x: number; y: number; born: number; k: number; hot: boolean; r: number; vx: number; vy: number}[] = [];
	for (let i = 0; i < 300; i++) { const y = R(), x = R(); out.push({x, y, born: y, k: R(), hot: R() < 0.2, r: 2 + R() * 5, vx: 220 + R() * 420, vy: 80 + R() * 260}); }
	return out; })();
/** the sand of a figure (aniX, top..gy): progress 0..1 down the body; reverse = reassembling (44) */
const Sand: React.FC<{pr: number; x0: number; x1: number; top: number; gy: number; reverse?: boolean; hotC?: string; coldC?: string}> = ({pr, x0, x1, top, gy, hotC = '#FF9A40', coldC = '#8A3420'}) => <g>
	{ASH.map((a, i) => { const u = cl((pr - a.born * 0.9) * 2.0 - a.k * 0.15); if (u <= 0 || u >= 1) return null;
		const uu = u, x = lerp(x0, x1, a.x) + uu * a.vx, y = lerp(top, gy, a.y) - uu * a.vy + 40 * uu * uu;
		return <circle key={i} cx={x} cy={y} r={a.r * (1 - 0.5 * uu)} fill={a.hot ? hotC : coldC} opacity={(1 - uu) * (a.hot ? 1 : 0.85)} />; })}
</g>;
const S43: React.FC<ShotProps> = ({t}) => {
	const aniX = 560, s = 24, top = GY - 19.6 * s, cr = sm(seg(t, T43.c0, T43.c1)), cutY = lerp(top - 30, GY + 12, cr);
	const pose = ANI_POSES.judged(t);
	return <Stage60 t={t} cam={camE(t, 0, 3.4, [700, 500, 1.0], [680, 510, 1.06])} grade="blood" bg="#140404" wear={0.3} stain={0.3}
		light={<>
			<Sand pr={cr} x0={aniX - 60} x1={aniX + 120} top={top} gy={GY} />
			<Dust t={t} box={[200, 100, 1300, 900]} n={30} seed={43} c="#FF9A60" o={0.35} vx={40} vy={-8} />
		</>}>
		<defs>
			<filter id="c43sil" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values={silM(0.05, 0.012, 0.01)} /></filter>
			<filter id="c43hot" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values={silM(1, 0.55, 0.18)} /></filter>
			<clipPath id="c43c"><rect x={-200} y={cutY} width={1800} height={900} /></clipPath>
			<clipPath id="c43e"><rect x={-200} y={cutY} width={1800} height={10} /></clipPath>
		</defs>
		<rect x={-300} y={-100} width={2100} height={1300} fill="#140404" />
		<rect x={-300} y={GY} width={2100} height={300} fill="#0A0202" />
		<rect x={-300} y={GY} width={2100} height={3} fill="#5A1A10" />
		<circle cx={aniX - 30} cy={540} r={560} fill="url(#g60-red)" opacity={0.75 - 0.4 * cr} />
		<circle cx={aniX - 30} cy={540} r={300} fill="#6A180E" opacity={0.55 - 0.3 * cr} />
		{cr < 1 && <><g clipPath="url(#c43c)" filter="url(#c43sil)"><God id="c43ani" cast={ANI} pose={pose} x={aniX} y={GY} s={s} sec={{t}} /></g>
			{cr > 0 && <g clipPath="url(#c43e)" filter="url(#c43hot)"><God id="c43anih" cast={ANI} pose={pose} x={aniX} y={GY} s={s} sec={{t}} /></g>}</>}
	</Stage60>;
};

/* ======================= 44 · 「如果秤[平]了——」 the sand rewinds into you; the beam levels; gold floods the hall ======================= */
export const T44 = {level: 1.2};
const S44: React.FC<ShotProps> = ({t}) => {
	const aniX = 300, s = 22, top = GY - 19.6 * s, re = 1 - sm(seg(t, -0.05, 0.85)), cutY = lerp(top - 30, GY + 12, re);
	const L = T44.level, tilt = 7 * (1 - sm(seg(t, 0, L))) * Math.cos(t * 7.5), flood = sm(seg(t, L, L + 0.7));
	const p = {tilt, swingL: 1.5 * (1 - sm(seg(t, 0, L + 0.3))) * Math.sin(t * 6), swingR: -1.5 * (1 - sm(seg(t, 0, L + 0.3))) * Math.sin(t * 6), plumb: -0.3 * tilt};
	const BX = 870, bs = 30, w = balW({tilt: 0}, BX, GY, bs);
	return <Stage60 t={t} cam={camE(t, 0, 2.4, [720, 486, 1.0], [740, 470, 1.06])} grade="lapis" bg="#18245A" wear={0.45} stain={0.32}
		light={<>
			<Glow x={w.pivot[0]} y={w.pivot[1] + 120} r={520 + 300 * flood} c="gold" o={0.25 + 0.55 * flood} />
			<Glow x={aniX + 20} y={600} r={260} c="gold" o={0.3 + 0.3 * flood} />
			<Shaft pts={[[620, PIC_T - 40], [1120, PIC_T - 40], [1260, GY], [480, GY]]} o={0.55 * flood} />
			<Sand pr={re} x0={aniX - 60} x1={aniX + 100} top={top} gy={GY} reverse hotC="#FFD27A" coldC="#C9A24A" />
			{t > L - 0.05 && <Sparkle x={w.pivot[0]} y={w.pivot[1]} r={90 * bump(t, L - 0.05, L + 0.6)} rot={20} />}
			<Dust t={t} box={[0, 60, 1300, 900]} n={50} seed={44} c="#FFE7A0" o={0.4 + 0.4 * flood} vx={3} vy={-8} />
		</>}
		screen={<rect width={FW} height={FH} fill="#FFD98A" opacity={0.22 * flood} style={{mixBlendMode: 'screen'}} />}>
		<defs><clipPath id="c44c"><rect x={-200} y={cutY} width={1800} height={900} /></clipPath></defs>
		<HallBg t={t} x0={-300} x1={1700} cols={[60, 1290]} />
		<BalanceC p={p} x={BX} y={GY} s={bs} t={t} />
		<g clipPath="url(#c44c)"><God id="c44ani" cast={ANI} pose={ANI_POSES.judged(t)} x={aniX} y={GY} s={s} sec={{t}} /></g>
	</Stage60>;
};

/* ======================= 54 · 「画成“通过”，就[一定通过]。」 the starry hall: the beam settles exactly level; the dim begins ======================= */
export const T54 = {level: 1.2, beat: 1.3};
const S54: React.FC<ShotProps> = ({t, dur}) => {
	const BX = 720, s = 34, L = T54.level, tilt = 1.6 * (1 - sm(seg(t, -0.2, L))) * Math.cos(t * 5.5);
	const p = {tilt, swingL: 0.8 * (1 - sm(seg(t, 0, L))) * Math.sin(t * 4), swingR: -0.8 * (1 - sm(seg(t, 0, L))) * Math.sin(t * 4), plumb: -0.3 * tilt};
	const w = balW({tilt: 0}, BX, GY, s), beat = t > T54.beat ? Math.exp(-(t - T54.beat) / 0.25) * sm(seg(t, T54.beat, T54.beat + 0.06)) : 0;
	const dim = sm(seg(t, 1.6, dur + 0.1));
	return <Stage60 t={t} cam={camE(t, -0.4, dur, [720, 340, 1.14], [720, 330, 1.24])} grade="lapis" bg="#141F52" wear={0.4} stain={0.3} wobble={wobIn(t)}
		light={<>
			<Glow x={BX} y={360} r={620} c="gold" o={0.35} />
			<Glow x={w.panL[0]} y={w.panL[1] - 40} r={170 + 90 * beat} c="red" o={0.45 + 0.5 * beat} />
			<Glow x={w.panR[0]} y={w.panR[1] - 60} r={170} c="white" o={0.3} />
			{t > L - 0.05 && <Sparkle x={w.pivot[0]} y={w.pivot[1]} r={70 * bump(t, L - 0.05, L + 0.55)} rot={10} />}
			<Dust t={t} box={[150, 0, 1300, 800]} n={44} seed={54} c="#FFE7A0" o={0.6} vx={2} vy={-5} />
		</>}
		screen={<rect width={FW} height={FH} fill="#05081A" opacity={0.28 * dim} />}>
		<HallBg t={t} x0={-300} x1={1700} cols={[110, 1330]} glyphs={false} />
		<BalanceC p={p} x={BX} y={GY} s={s} t={t} />
	</Stage60>;
};

/* ======================= 55 · end-card background: the balanced scale framing the card, a very slow push, calm ======================= */
const S55: React.FC<ShotProps> = ({t}) => {
	const BX = 720, s = 38, by = 100 + 19 * s;
	return <Stage60 t={t} cam={camE(t, 0, 6.0, [720, 486, 1.0], [720, 480, 1.035], (u) => u)} grade="lapis" bg="#121B4A" wear={0.35} stain={0.28}
		light={<>
			<Glow x={BX} y={300} r={760} ry={460} c="gold" o={0.22} />
			<Glow x={BX - 8.6 * s} y={260} r={150} c="red" o={0.3} />
			<Glow x={BX + 8.6 * s} y={240} r={150} c="white" o={0.25} />
			<Dust t={t} box={[0, 60, 1300, 900]} n={36} seed={55} c="#FFE7A0" o={0.45} vx={1.5} vy={-3} r={2} />
		</>}>
		<rect x={-300} y={-100} width={2100} height={1300} fill="#121B4A" />
		<Stars t={t * 0.6} box={[-60, 40, 1500, 760]} n={130} seed={55} o={0.85} />
		<g opacity={0.45}>{[-10, 1450].map((cx) => <g key={cx}><rect x={cx - 46} y={40} width={92} height={by - 40} fill="#1E2C6A" /><rect x={cx - 46} y={150} width={92} height={10} fill={PAL.gold} /><rect x={cx - 46} y={by - 120} width={92} height={10} fill={PAL.gold} /></g>)}</g>
		<rect x={-300} y={by} width={2100} height={400} fill="#0C1336" />
		<rect x={-300} y={by} width={2100} height={5} fill={PAL.gold} opacity={0.6} />
		<BalanceC p={{tilt: 0, swingL: 0.25 * Math.sin(t * 0.9), swingR: -0.25 * Math.sin(t * 0.9)}} x={BX} y={by} s={s} t={t} baboon={false} />
	</Stage60>;
};

export const HALL: Record<number, React.FC<ShotProps>> = {41: S41, 42: S42, 43: S43, 44: S44, 54: S54, 55: S55};
export const _keepH = {CAST, Stars, sp, PIC_T} as Record<string, unknown>;
export type _P = Pose | V;

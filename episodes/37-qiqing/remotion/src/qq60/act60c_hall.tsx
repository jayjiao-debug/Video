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
export const T41 = {bang: 0.32, rear: [0.45, 1.05], roar: 1.12, roarEnd: 1.62, spring: 1.62};
const S41: React.FC<ShotProps> = ({t}) => {
	const BX = 560, s = 32, b = T41.bang, tb = t - b;
	const tilt = t < b ? lerp(1.5, 22.5, eIn(cl((t + 0.15) / (b + 0.15)))) : 20 + 2.5 * Math.exp(-tb / 0.2) * Math.cos(tb * 24);
	const swing = t < b ? 0.8 * Math.sin(t * 6) : 9 * Math.exp(-tb / 0.5) * Math.sin(tb * 8.5);
	const p = {tilt, swingL: -swing, swingR: swing * 1.3, plumb: -0.3 * tilt + (t > b ? 12 * Math.exp(-tb / 0.6) * Math.sin(tb * 7) : 0)};
	const w0 = balW({tilt: 22.5, swingL: 0, swingR: 0}, BX, GY, s);
	const fu = Math.max(0, tb), fx = w0.panR[0] + 150 * fu, fy = w0.panR[1] - 560 * fu + 330 * fu * fu, fr = 620 * fu;
	// Ammit: growls, rears up, ROARS (held, jaws wide, head up), then springs at the fallen heart
	const rear = sm(seg(t, T41.rear[0], T41.rear[1])), roar = sm(seg(t, T41.roar - 0.12, T41.roar + 0.06)) * (1 - sm(seg(t, T41.roarEnd - 0.06, T41.roarEnd + 0.14)));
	const sp_ = seg(t, T41.spring, 2.3), lift = eOut(sp_);
	const ap_: AmmitPose = {lean: lerp(-2, 9, rear) + 4 * lift, neck: lerp(2, 12, rear) + 6 * roar - 4 * lift, jaw: lerp(6 + 3 * Math.max(0, Math.sin(t * 9)), 16, rear) + 18 * lift, tail: 18 * Math.sin(t * 5), breathe: 0.5 + 0.5 * Math.sin(t * (roar > 0.5 ? 14 : 6))};
	const AX = 1022, dx = -300 * lift, dy = -95 * Math.sin(Math.PI * 0.62 * lift) - 20 * lift, rot = -9 * rear + 4 * roar + 5 * lift;
	const shake = 0 * (t > b ? 7 * Math.exp(-tb / 0.13) * Math.sin(tb * 70) : 0); // owner 15:10: no screen shake
	const cam = camE(t, 0, 2.3, [700, 486, 1.0], [650, 480, 1.07]);
	return <Stage60 t={t} cam={{...cam, x: cam.x + shake, y: cam.y + shake * 0.6}} grade="blood" bg="#3A0E0A" wear={0.45} stain={0.4} flickSeed={41}
		tags={[{x: 1150, y: 340, text: '阿米特', o: sm((t - 0.3) / 0.3)}]}
		light={<>
			<Glow x={AX - 100 + dx} y={700 + dy} r={420} c="red" o={0.55 + 0.1 * flick(t, 4)} />
			<Glow x={w0.panL[0]} y={w0.panL[1] - 40} r={240} c="red" o={0.5 + 0.4 * Math.exp(-Math.max(0, tb) / 0.3)} />
			{t > b && <Glow x={w0.panL[0]} y={w0.panL[1] + 10} r={300} c="white" o={0.7 * Math.exp(-tb / 0.12)} />}
			<Embers t={t} x={AX - 150} y={GY - 30} n={18} seed={41} h={420} spread={360} />
			{/* the roar: sound rings out of the open jaws (no screen shake) */}
			{roar > 0.05 && [0, 1, 2].map((i) => { const u = ((t - T41.roar + 0.1 + i * 0.16) % 0.48) / 0.48, mx = 500 + dx, my = 330 + dy;
				return u > 0 && <path key={i} d={`M${mx - 30 - 220 * u} ${my - 40 - 170 * u}Q${mx - 90 - 300 * u} ${my} ${mx - 30 - 220 * u} ${my + 40 + 170 * u}`} fill="none" stroke="#FFD27A" strokeWidth={7 - 4 * u} strokeLinecap="round" opacity={roar * (1 - u)} style={{mixBlendMode: 'screen'}} />; })}
			<Dust t={t} box={[0, 60, 1300, 900]} n={30} seed={41} c="#FFB080" o={0.5} vx={-4} vy={-6} />
		</>}
		screen={t > b ? <rect width={FW} height={FH} fill="#FF3A1E" opacity={0.25 * Math.exp(-tb / 0.18)} style={{mixBlendMode: 'screen'}} /> : null}>
		<HallBg t={t} x0={-300} x1={1700} red cols={[40, 1250]} />
		<BalanceC p={p} x={BX} y={GY} s={s} t={t} feather={t < b} />
		{t > b && fy < 1100 && <g transform={`translate(${fx},${fy}) rotate(${fr}) scale(${s})`}><Feather c={ctxC(s)} h={3.0} /></g>}
		<g transform={`translate(${dx},${dy}) rotate(${rot} ${AX - 150} ${GY - 120})`}><Ammit2 pose={ap_} x={AX} y={GY} s={44} face={-1} t={t} rim={0.7} id="c41am" roar={roar} /></g>
	</Stage60>;
};

/* ======================= 42 · 「阿米特一口，[吞]掉你的心。」 the jaws close on the heart in silhouette; cut on contact to red, then black ======================= */
export const T42 = {bite: 1.22, flash: 1.32};
const S42: React.FC<ShotProps> = ({t}) => {
	const bt = T42.bite, after = t >= T42.flash, shut = t >= bt; // the jaws shut on the heart (a visible bite frame), THEN the red flash
	const HX = 470, HY = 612, hs = 80, beat = 1 + 0.05 * Math.max(0, Math.sin(t * 9));
	const a1 = eOut(seg(t, -0.3, 0.85)), a2 = eIn(seg(t, 0.85, bt));
	const ax = lerp(lerp(1430, 1020, a1), 772, a2), ay = 905 - 30 * Math.sin(Math.PI * a2);
	const jaw = t < bt - 0.1 ? lerp(10, 34, sm(seg(t, 0, 0.8))) : lerp(34, 0, cl((t - (bt - 0.1)) / 0.1));
	const ap_: AmmitPose = {lean: lerp(-1, 3, a2), neck: lerp(3, -3, a2), jaw, tail: 16 * Math.sin(t * 6), breathe: 0.5 + 0.5 * Math.sin(t * 7)};
	const fl = after ? Math.exp(-(t - T42.flash) / 0.28) : 0, black = sm(seg(t, T42.flash + 0.05, T42.flash + 0.55));
	const pan = 46;
	return <Stage60 t={t} cam={camE(t, -0.3, T42.flash, [720, 486, 1.0], [690, 496, 1.07])} grade="blood" bg="#2A0806" wear={0.35} stain={0.35} flickSeed={42}
		tags={!after ? [{x: 1150, y: 260, text: '阿米特'}] : []}
		light={!after ? <><Dust t={t} box={[0, 60, 1300, 900]} n={30} seed={42} c="#FFB080" o={0.5} vx={-30} vy={-10} />
			{shut && <g stroke="#FFF1C8" strokeWidth={6} strokeLinecap="round" style={{mixBlendMode: 'screen'}}>{[0, 1, 2, 3, 4].map((i) => { const a = (-150 + i * 48) * Math.PI / 180, r0 = 120, r1 = 190; return <line key={i} x1={HX + Math.cos(a) * r0} y1={HY - 70 + Math.sin(a) * r0} x2={HX + Math.cos(a) * r1} y2={HY - 70 + Math.sin(a) * r1} />; })}</g>}</>
			: <Embers t={t} x={HX + 120} y={HY} n={8} seed={42} h={300} spread={300} />}
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
			<g transform={`translate(${HX},${HY}) scale(${pan})`}><path d={sp([[-2.05, 0, 1], [2.05, 0, 1], [1.6, 0.5], [0.7, 0.74], [-0.7, 0.74], [-1.6, 0.5]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2.4 / pan} /></g>
			{/* the heart goes between the inside of the mouth and the jaws (Ammit2 inMouth) */}
			<Ammit2 pose={ap_} x={ax} y={ay} s={58} face={-1} t={t} rim={0.9} id="c42am" inMouth={<g transform={`translate(${HX},${HY}) scale(${hs * beat})`}><Heart c={ctxC(hs)} /></g>} />
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
/* v5 (owner 20:27 "not very smooth"): every grain flies home on an eased, curving path (deterministic, a function of t only, with a
   short motion streak); a soft sand fill rises feet → head inside the true silhouette as the grains land, and the drawn figure
   resolves out of the sand a beat behind it under a soft glow, all settled before the chime (level 1.20 = 121.30). */
export const T44 = {level: 1.2, fill: [0.1, 1.0] as V, form: [0.3, 1.1] as V};
const ANI44 = {x: 300, s: 22};
const smr = (u: number) => { const x = cl(u); return x * x * x * (x * (x * 6 - 15) + 10); };
const smrInv = (v: number) => { let a = 0, b = 1; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (smr(m) < v) a = m; else b = m; } return (a + b) / 2; };
const TOP44 = GY - 19.6 * ANI44.s, F0 = GY + 8, F1 = TOP44 - 34;
/** a rough body of Ani in the judged pose (world units) for the grains' landing spots; the true outline comes from the figure itself */
const inBody44 = (x: number, y: number) => {
	const cap = (ax: number, ay: number, bx: number, by: number, r: number) => { const dx = bx - ax, dy = by - ay, u = cl(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)); return Math.hypot(x - ax - u * dx, y - ay - u * dy) < r; };
	return ((x - 302) ** 2) / 36 ** 2 + ((y - 458) ** 2) / 40 ** 2 < 1 || ((x - 302) ** 2) / 82 ** 2 + ((y - 512) ** 2) / 22 ** 2 < 1
		|| (x > 258 && x < 344 && y > 500 && y < 612) || (x > 262 && x < 336 && y > 600 && y < 800) || (x > 272 && x < 330 && y > 798 && y < 850)
		|| cap(226, 516, 220, 680, 13) || cap(378, 516, 386, 680, 13);
};
const GRAINS44 = (() => { const R = rng(4404), out: {p0: V; p1: V; p2: V; p3: V; t0: number; ta: number; r: number; hot: boolean; ph: number}[] = [];
	const [f0, f1] = T44.fill;
	while (out.length < 340) {
		const tx = 205 + R() * 200, ty = TOP44 - 6 + R() * (GY - TOP44 + 4);
		if (!inBody44(tx, ty)) continue;
		/* it lands just before the rising fill front passes its height */
		const ta = f0 + (f1 - f0) * smrInv(cl((F0 - ty) / (F0 - F1))) - 0.05, D = 0.9 + R() * 0.35, t0 = ta - D;
		/* it starts where 43 blew it: off to the right and up */
		const sx = tx + 140 + R() * 400, sy = ty - 40 - R() * 280 + 60 * (R() - 0.5);
		const dx = tx - sx, dy = ty - sy, c = 0.18 + R() * 0.24;
		const px = -dy * c, py = dx * c; /* one turning sense for all: the sand swirls in, curving under */
		out.push({p0: [sx, sy], p1: [sx + dx * 0.3 + px, sy + dy * 0.3 + py], p2: [sx + dx * 0.78 + px * 0.55, sy + dy * 0.78 + py * 0.55], p3: [tx, ty],
			t0, ta, r: 1.5 + R() * 2.3, hot: R() < 0.3, ph: R() * 6.28});
	}
	return out; })();
const bez = (g: typeof GRAINS44[number], u: number): V => { const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
	return [a * g.p0[0] + b * g.p1[0] + c * g.p2[0] + d * g.p3[0], a * g.p0[1] + b * g.p1[1] + c * g.p2[1] + d * g.p3[1]]; };
const grainAt = (g: typeof GRAINS44[number], t: number): V => { const u = smr((t - g.t0) / (g.ta - g.t0)), q = bez(g, u), fl = 1 - u;
	return [q[0] + fl * 7 * Math.sin(1.3 * t + g.ph), q[1] + fl * 5 * Math.cos(1.1 * t + g.ph)]; };
const Grains44: React.FC<{t: number}> = ({t}) => <g>
	{GRAINS44.map((g, i) => { const u = cl((t - g.t0) / (g.ta - g.t0)); if (u >= 1) return null;
		const a = grainAt(g, t), b0 = grainAt(g, t - 0.022), sl = Math.hypot(b0[0] - a[0], b0[1] - a[1]), k = sl > 0 ? Math.min(1, (5 * g.r) / sl) : 0, b: V = [a[0] + (b0[0] - a[0]) * k, a[1] + (b0[1] - a[1]) * k], o = 1 - smr((u - 0.8) / 0.2), r = g.r * (1 - 0.35 * smr(u));
		return <line key={i} x1={b[0]} y1={b[1]} x2={a[0]} y2={a[1]} stroke={g.hot ? '#FFE08A' : '#D7AE55'} strokeWidth={2 * r} strokeLinecap="round" opacity={o * (g.hot ? 1 : 0.85)} />; })}
</g>;
const S44: React.FC<ShotProps> = ({t}) => {
	const aniX = ANI44.x, s = ANI44.s, pose = ANI_POSES.judged(t);
	const f = smr(seg(t, T44.fill[0], T44.fill[1])), fy = lerp(F0, F1, f), f2 = smr(seg(t, T44.form[0], T44.form[1])), fy2 = lerp(F0, F1, f2);
	const band = Math.sin(Math.PI * f) * 0.85, halo = bump(t, 0.35, 1.7), sandO = 1 - smr(seg(t, T44.form[1] - 0.3, T44.form[1] + 0.05)); /* the sand under the sheer linen fades as the figure completes */
	const L = T44.level, tilt = 7 * (1 - sm(seg(t, 0, L))) * Math.cos(t * 7.5), flood = sm(seg(t, L, L + 0.7));
	const p = {tilt, swingL: 1.5 * (1 - sm(seg(t, 0, L + 0.3))) * Math.sin(t * 6), swingR: -1.5 * (1 - sm(seg(t, 0, L + 0.3))) * Math.sin(t * 6), plumb: -0.3 * tilt};
	const BX = 870, bs = 30, w = balW({tilt: 0}, BX, GY, bs);
	const fig = (id: string) => <God id={id} cast={ANI} pose={pose} x={aniX} y={GY} s={s} sec={{t}} />;
	const U = {maskUnits: 'userSpaceOnUse' as const, x: -300, y: -100, width: 2100, height: 1300};
	return <Stage60 t={t} cam={camE(t, 0, 2.4, [720, 486, 1.0], [740, 470, 1.06])} grade="lapis" bg="#18245A" wear={0.45} stain={0.32}
		light={<>
			<Glow x={w.pivot[0]} y={w.pivot[1] + 120} r={520 + 300 * flood} c="gold" o={0.25 + 0.55 * flood} />
			<Shaft pts={[[620, PIC_T - 40], [1120, PIC_T - 40], [1260, GY], [480, GY]]} o={0.55 * flood} />
			<Grains44 t={t} />
			{t > L - 0.05 && <Sparkle x={w.pivot[0]} y={w.pivot[1]} r={90 * bump(t, L - 0.05, L + 0.6)} rot={20} />}
			<Dust t={t} box={[0, 60, 1300, 900]} n={50} seed={44} c="#FFE7A0" o={0.4 + 0.4 * flood} vx={3} vy={-8} />
		</>}
		screen={<rect width={FW} height={FH} fill="#FFD98A" opacity={0.22 * flood} style={{mixBlendMode: 'screen'}} />}>
		<defs>
			<filter id="c44w" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" /></filter>
			<filter id="c44soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={14} /></filter>
			<mask id="c44sil" {...U}><g filter="url(#c44w)">{fig('c44m')}</g></mask>
			<linearGradient id="c44fg" gradientUnits="userSpaceOnUse" x1={0} y1={fy - 80} x2={0} y2={fy}><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#fff" /></linearGradient>
			<linearGradient id="c44dg" gradientUnits="userSpaceOnUse" x1={0} y1={fy2 - 120} x2={0} y2={fy2}><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#fff" /></linearGradient>
			<linearGradient id="c44bg" gradientUnits="userSpaceOnUse" x1={0} y1={fy - 70} x2={0} y2={fy + 30}><stop offset="0" stopColor="#000" /><stop offset="0.6" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
			<mask id="c44fill" {...U}><rect x={-300} y={-100} width={2100} height={1300} fill="url(#c44fg)" /></mask>
			<mask id="c44form" {...U}><rect x={-300} y={-100} width={2100} height={1300} fill="url(#c44dg)" /></mask>
			<mask id="c44band" {...U}><rect x={-300} y={-100} width={2100} height={1300} fill="url(#c44bg)" /></mask>
		</defs>
		<HallBg t={t} x0={-300} x1={1700} cols={[60, 1290]} />
		<BalanceC p={p} x={BX} y={GY} s={bs} t={t} />
		{/* a soft gold glow follows the fill up the body, then holds round the whole figure and eases off */}
		<Glow x={aniX + 10} y={lerp(GY - 40, TOP44 + 140, f)} r={230} c="gold" o={0.5 * Math.sin(Math.PI * f) + 0.35 * halo + 0.3 * flood} />
		{/* the sand fill: the true silhouette, filled from the feet up, speckled with the grains that have landed */}
		{f > 0 && sandO > 0 && <g mask="url(#c44fill)" opacity={sandO}><g mask="url(#c44sil)">
			<rect x={aniX - 140} y={TOP44 - 60} width={280} height={GY - TOP44 + 80} fill="#C99A45" />
			{GRAINS44.map((g, i) => <circle key={i} cx={g.p3[0]} cy={g.p3[1]} r={g.r} fill={g.hot ? '#F4D07E' : '#9C7232'} opacity={0.75} />)}
		</g></g>}
		{/* the drawn figure resolves out of the sand a beat behind the fill */}
		{f2 > 0 && <g mask="url(#c44form)">{fig('c44ani')}</g>}
		{/* the bright rim of the rising fill */}
		{band > 0.01 && <g mask="url(#c44band)" opacity={band}><g mask="url(#c44sil)">
			<rect x={aniX - 140} y={TOP44 - 60} width={280} height={GY - TOP44 + 80} fill="#FFF0C0" />
		</g></g>}
		{band > 0.01 && <g mask="url(#c44band)" opacity={band * 0.6} filter="url(#c44soft)" style={{mixBlendMode: 'screen'}}><g mask="url(#c44sil)">
			<rect x={aniX - 140} y={TOP44 - 60} width={280} height={GY - TOP44 + 80} fill="#FFD27A" />
		</g></g>}
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

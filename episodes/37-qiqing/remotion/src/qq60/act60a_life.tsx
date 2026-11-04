import React from 'react';
import {Stage60, Glow, Dust, Embers, Smoke, Shaft, Stars, Flame, flick, rng, PIC_T, FW, F_SERIF, toScreen} from './frame60';
import {GlyphColumns, Balance} from './props60';
import {Mummy, LionBier, BIER_H, CanopicJar, Lamp, HeartScarab, Basket, River, Palm, STONE, JarHead} from './props60b';
import {God, CAST, POSES, Pose, solve, reach, wristTo, holdAt} from './rig60';
import {CAST2, ANI, tendPose, scribePose} from './cast60';
import {PAL, sp, poly, lerp, cl, sm, V, ap, mx} from './geo60';
import type {ShotProps} from './EP60';
import {pulse, seg, aimPath, GoldDefs, Puff, HEART_D, Sparkle, DustBurst, wearAt, GlyphRun} from './act60a_kit';

/* ep60 act A · life and death (shots 5–9, 10.9–26.5 s): Thebes at sunset; the 70-day embalming (time-lapse); the hook twirl;
   the heart that remembers everything; the heart scarab laid on the chest. Times: shot seconds (t), film seconds in [brackets]. */
const GY = 852;
const figT = (x: number, y: number, s: number, face: 1 | -1 = 1) => `translate(${x},${y}) scale(${s * face},${s})`;
const toW = (x: number, y: number, s: number, face: 1 | -1, p: V): V => [x + face * s * p[0], y + s * p[1]];
const keyV = (t: number, keys: [number, number, number][], ease = sm): V => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = ease((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
	const k = keys[keys.length - 1]; return [k[1], k[2]]; };
const key1 = (t: number, keys: [number, number][], ease = sm): number => { if (t <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return lerp(a[1], b[1], ease((t - a[0]) / (b[0] - a[0]))); }
	return keys[keys.length - 1][1]; };

/* ---------------- small props ---------------- */
const ScribePalette: React.FC<{x: number; y: number; a?: number; w?: number}> = ({x, y, a = 0, w = 150}) => <g transform={`translate(${x},${y}) rotate(${a})`}>
	<rect x={-w / 2} y={-11} width={w} height={22} rx={3} fill="#D9A85A" stroke={PAL.ink} strokeWidth={2.4} />
	<rect x={-w / 2 + 44} y={-3} width={w - 54} height={6} rx={3} fill="#A8743A" stroke={PAL.ink} strokeWidth={1.2} />
	<circle cx={-w / 2 + 14} cy={-1} r={6} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.4} /><circle cx={-w / 2 + 30} cy={-1} r={6} fill={PAL.black} stroke={PAL.ink} strokeWidth={1.4} />
	<path d={`M${-w / 2 + 50} -1L${w / 2 - 16} -1`} stroke="#C9A060" strokeWidth={3} />
</g>;
const Lotus: React.FC<{x: number; y: number; a?: number; len?: number}> = ({x, y, a = 0, len = 90}) => <g transform={`translate(${x},${y}) rotate(${a})`}>
	<path d={`M0 8Q6 ${-len * 0.5} 2 ${-len}`} fill="none" stroke="#3A8A4A" strokeWidth={4} strokeLinecap="round" />
	<g transform={`translate(2,${-len})`}>
		<path d={poly([[-22, -26], [-11, 2], [11, 2], [22, -26], [9, -14], [0, -36], [-9, -14]])} fill="#3F6FD0" stroke={PAL.ink} strokeWidth={2} strokeLinejoin="round" />
		<path d={poly([[-8, -12], [0, -30], [8, -12], [0, 0]])} fill="#7FA6F0" opacity={0.8} />
		<path d="M-12 2Q0 10 12 2" fill="#3A8A4A" stroke={PAL.ink} strokeWidth={1.6} />
	</g>
</g>;
const SailBoat: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => { const rk = 1.5 * Math.sin(t * 1.3), bl = 6 * Math.sin(t * 0.9);
	return <g transform={`translate(${x},${y + 2 * Math.sin(t * 1.7)}) rotate(${rk}) scale(${s})`}>
		<path d={`M-80 -46L-80 -54M-52 -30L68 -30`} stroke={PAL.ink} strokeWidth={3} />
		<path d={sp([[-40, -200, 1], [52, -204, 1], [56 + bl, -110], [54, -36, 1], [-44, -34, 1], [-36 + bl * 0.6, -120]], true, 0.18)} fill="#F4E9CF" stroke={PAL.ink} strokeWidth={2.6} />
		{[-170, -140, -110, -80, -55].map((yy) => <path key={yy} d={`M${-40} ${yy}Q${8 + bl} ${yy + 4} ${54} ${yy}`} fill="none" stroke="#C9B58A" strokeWidth={1.6} />)}
		<path d="M6 -214L8 -18" stroke="#6A4626" strokeWidth={5} />
		<path d={sp([[-110, -40], [-80, -14], [0, -6], [80, -14], [118, -46], [124, -52, 1], [96, -10], [40, 6], [-40, 6], [-96, -8], [-118, -36, 1]], true, 0.18)} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2.6} />
		<path d="M-90 -14Q0 2 92 -16" fill="none" stroke={PAL.gold} strokeWidth={3} />
		<path d="M-96 -30L-120 10" stroke={PAL.ink} strokeWidth={4} />
	</g>; };
const House: React.FC<{x: number; y: number; w: number; h: number; c?: string; seed: number}> = ({x, y, w, h, c = '#C98A52', seed}) => { const R = rng(seed);
	return <g>
		<rect x={x} y={y - h} width={w} height={h} fill={c} stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={x - 4} y={y - h - 8} width={w + 8} height={10} fill="#B07644" stroke={PAL.ink} strokeWidth={2} />
		{Array.from({length: Math.max(1, Math.floor(w / 46))}, (_, i) => <rect key={i} x={x + 14 + i * 46} y={y - h + 22 + R() * 10} width={14} height={10} fill="#3A2214" />)}
		{R() > 0.4 && <rect x={x + w * 0.55} y={y - 46} width={22} height={46} fill="#4A2A16" />}
		{R() > 0.5 && <g><path d={poly([[x + 6, y - h - 8], [x + 6, y - h - 44], [x + w * 0.45, y - h - 44], [x + w * 0.45, y - h - 8]])} fill="none" stroke="#6A4626" strokeWidth={3} /><path d={poly([[x, y - h - 44], [x + w * 0.5, y - h - 44], [x + w * 0.48, y - h - 54], [x + 2, y - h - 54]])} fill="#E6D6A8" stroke={PAL.ink} strokeWidth={1.8} /></g>}
		<path d={`M${x} ${y - h * 0.4}L${x + w} ${y - h * 0.4}`} stroke="#A86E3A" strokeWidth={1.4} opacity={0.5} />
	</g>; };

/* ================= 5 · 10.9–14.3 · Thebes at sunset; you, a young scribe, set down your palette; a blue lotus slips =================
   dissolve in (0.5). Palette tap 1.35 [12.25] · lotus slips 1.75 [12.65] · lotus lands 2.3 [13.20] · Nile lapping throughout.
   crane down from the sunset sky to you; the top-right corner stays sky (the master's stamp from 0.5). */
export const Shot5: React.FC<ShotProps> = ({t}) => {
	const S = 25, fx = 400, tableX = 600, tableY = 628;
	const cam = aimPath(t, [[-0.5, 690, 300, 720, 486, 1.07], [3.6, 640, 590, 700, 486, 1.0]], (u) => sm(u));
	const tTap = 1.35, tSlip = 1.75, tLand = 2.3;
	// front hand carries the palette from the chest down onto the table, then leaves it; back hand holds the lotus low at the side
	const hTarget = keyV(t, [[0, 3.5, -12.6], [tTap, (tableX - 30 - fx) / S, (tableY - 14 - GY) / S], [tTap + 0.25, (tableX - 30 - fx) / S, (tableY - 14 - GY) / S], [tTap + 0.9, 3.0, -9.0]]);
	let pose: Pose = {...POSES.rest, lean: lerp(1, 7, sm(seg(t, 0.2, tTap))) - 3 * sm(seg(t, tTap + 0.3, tTap + 1.0)), neck: 4, head: lerp(2, 10, sm(seg(t, 0, tTap))) - 6 * sm(seg(t, 1.9, 2.5)), rt: -8, at: 11, rk: 3, ak: 2};
	pose = wristTo(reach(pose, 'f', hTarget), 'f', t < tTap + 0.3 ? 82 : 40);
	const slip = seg(t, tSlip - 0.15, tSlip);
	pose = wristTo(reach(pose, 'b', [0.6 - 0.2 * slip, -8.3]), 'b', 20 + 30 * slip);
	const g = solve(pose), fGrip = toW(fx, GY, S, 1, ap(g.fH, [0.02, 0.6])), bGrip = toW(fx, GY, S, 1, ap(g.bH, [0.02, 0.6]));
	const palOn = t >= tTap, palP: V = palOn ? [tableX + 22, tableY - 11] : [fGrip[0] + 52, fGrip[1] - 2];
	// lotus: held, slips, falls turning, lands softly on the terrace
	let lotus: V = [bGrip[0] + 4, bGrip[1] + 6], la = 18;
	if (t > tSlip) { const u = cl((t - tSlip) / (tLand - tSlip)); lotus = [lerp(bGrip[0] + 4, bGrip[0] + 70, u), lerp(bGrip[1] + 6, GY - 6, u * u)]; la = lerp(18, 96, sm(u)); }
	if (t > tLand) { const v = t - tLand; lotus = [bGrip[0] + 70, GY - 6 - 5 * Math.exp(-v / 0.1) * Math.abs(Math.sin(v * 22))]; la = 96; }
	const H = g.head, penA = ap(H, [-0.7, -1.95]), penB = ap(H, [0.3, -0.88]);
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="papyrus" wear={0.16} stain={0.12} tags={[{x: fx - 130, y: 430, text: '你'}]}
		light={<>
			<Glow x={200} y={370} r={620} c="warm" o={0.85} />
			<Glow x={200} y={370} r={180} c="white" o={0.7} />
			<Glow x={200} y={500} r={260} ry={60} c="warm" o={0.7} />
			<Glow x={fx - 60} y={560} r={260} c="warm" o={0.35} />
			<Dust t={t} box={[0, 300, 1300, 860]} n={50} seed={5} c="#FFE0A0" o={0.6} vx={6} vy={-3} />
			{t > tLand - 0.02 && <DustBurst t={t} t0={tLand} x={lotus[0] + 20} y={GY - 4} rx={30} ry={6} n={14} seed={2} c="#FFF0C0" life={0.6} />}
		</>}>
		<defs><linearGradient id="a5-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E2470" /><stop offset="0.3" stopColor="#B23A56" /><stop offset="0.62" stopColor="#F2743A" /><stop offset="1" stopColor="#FFC456" /></linearGradient>
			<linearGradient id="a5-nile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E89A5A" /><stop offset="0.25" stopColor="#4E6FB0" /><stop offset="1" stopColor="#2E4F94" /></linearGradient></defs>
		<rect x={-400} y={-500} width={2300} height={930} fill="url(#a5-sky)" />
		{/* the sun setting behind the west-bank hills (the peak of el-Qurn) */}
		<circle cx={200} cy={376} r={74} fill="#FFD27A" stroke="#E8642A" strokeWidth={4} />
		<path d={`M-400 430L-200 406L20 400L120 392L200 400L300 380L400 322L460 302L530 330L660 392L860 404L1100 410L1300 400L1900 414L1900 430Z`} fill="#7E3E50" stroke={PAL.ink} strokeWidth={2.4} />
		<path d={`M340 362L400 322L460 302L480 312`} fill="none" stroke="#F6B26A" strokeWidth={3} opacity={0.8} />
		{[60, 150, 560, 680].map((x, i) => <Palm key={x} x={x} y={430} h={70 + (i % 2) * 18} t={t} seed={i + 4} />)}
		{/* the Nile with the sunset in it, a sail going by */}
		<rect x={-400} y={430} width={2300} height={120} fill="url(#a5-nile)" />
		<River x0={-400} x1={1900} y={440} h={110} t={t} speed={10} />
		<rect x={140} y={444} width={120} height={100} fill="#FFC870" opacity={0.45} />
		{[0, 1, 2, 3].map((k) => <rect key={k} x={156 + 8 * Math.sin(t * 2 + k)} y={452 + k * 22} width={88 - k * 10} height={5} fill="#FFE6A0" opacity={0.85} />)}
		<SailBoat x={620 + 16 * t} y={512} s={0.82} t={t} />
		{/* east bank: palms, mud-brick houses */}
		<rect x={-400} y={548} width={2300} height={120} fill="#C9935A" />
		{[[740, 140, 640], [890, 180, 660], [1080, 120, 650], [1210, 200, 664]].map(([x, h, y], i) => <House key={x} x={x} y={y} w={i % 2 ? 150 : 120} h={h} seed={i + 3} c={['#C98A52', '#D49A60', '#BE7E48', '#CF955C'][i]} />)}
		{[700, 1040, 1340].map((x, i) => <Palm key={x} x={x} y={650} h={190 + 30 * (i % 2)} t={t} seed={i} />)}
		{/* the terrace: parapet, floor, the little table */}
		<rect x={-400} y={668} width={2300} height={40} fill="#B98252" stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={-400} y={708} width={2300} height={500} fill="#D9AE74" />
		<path d={`M-400 ${GY}L1900 ${GY}`} stroke="#A87A48" strokeWidth={3} />
		{[0, 1, 2, 3, 4, 5, 6].map((k) => <path key={k} d={`M${-100 + k * 230} ${GY + 6}L${-160 + k * 230} 1100`} stroke="#BC8E58" strokeWidth={2} />)}
		<path d={poly([[tableX - 70, tableY], [tableX + 110, tableY], [tableX + 104, tableY + 12], [tableX - 64, tableY + 12]])} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2.4} />
		{[tableX - 54, tableX + 94].map((lx) => <path key={lx} d={poly([[lx - 5, tableY + 12], [lx + 5, tableY + 12], [lx + 7, GY], [lx - 7, GY]])} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={2} />)}
		<path d={poly([[tableX + 40, tableY], [tableX + 70, tableY], [tableX + 66, tableY - 34], [tableX + 44, tableY - 34]])} fill="#C9874A" stroke={PAL.ink} strokeWidth={2} />
		{/* you */}
		<God id="a5-you" cast={{...CAST2.scribe, bHand: 'fist', fHand: 'fist'}} pose={pose} x={fx} y={GY} s={S} sec={{t}} bProp="none" fProp="none" />
		<line x1={fx + penA[0] * S} y1={GY + penA[1] * S} x2={fx + penB[0] * S} y2={GY + penB[1] * S} stroke={PAL.ink} strokeWidth={6} strokeLinecap="round" />
		<line x1={fx + penA[0] * S} y1={GY + penA[1] * S} x2={fx + penB[0] * S} y2={GY + penB[1] * S} stroke="#C9A060" strokeWidth={3} strokeLinecap="round" />
		<ScribePalette x={palP[0]} y={palP[1]} a={palOn ? 0 : -8} w={140} />
		<Lotus x={lotus[0]} y={lotus[1]} a={la} len={84} />
	</Stage60>;
};

/* ================= 6 · 14.3–17.5 · the embalming tent, time-lapse: day 1 → day 70, four jars land on the beat =================
   dissolve in (0.4). Jars land 0.58, 1.15, 1.73, 2.31 [14.88, 15.45, 16.03, 16.61] (groove beats at 104 bpm from 14.30);
   linen swish once per wrap, half a beat later: [15.17, 15.74, 16.32, 16.90] + [14.59]; counter ticks 0.15–2.9 [14.45–17.2]. */
const JARS: JarHead[] = ['human', 'baboon', 'jackal', 'falcon'];
const JAR_T = [0.58, 1.15, 1.73, 2.31];
const BEAT6 = 60 / 104;
export const Shot6: React.FC<ShotProps> = ({t}) => {
	const s = 36, bx = 70, bedTop = GY - BIER_H * s, ex = bx + 12.6 * s, chest: V = [bx + (0.3 + 12.4) * s, bedTop - 2.0 * s];
	const cam = aimPath(t, [[-0.4, 640, 500, 700, 486, 1.0], [3.4, 720, 540, 700, 486, 1.07]]);
	// wrapping: one turn per beat, the hands circle the chest
	const ph = 2 * Math.PI * (t / BEAT6), toF = (p: V): V => [(p[0] - ex) / s, (p[1] - GY) / s];
	const bH: V = [chest[0] - 30 + 40 * Math.cos(ph), chest[1] - 40 + 26 * Math.sin(ph)], fH: V = [chest[0] + 70 + 30 * Math.cos(ph + 1), chest[1] - 70 + 30 * Math.sin(ph + 1)];
	const pose = {...tendPose(toF(bH), toF(fH), t, 16), neck: 2, head: 10 + 3 * Math.sin(ph)};
	const day = Math.min(70, 1 + Math.floor(69 * sm(seg(t, 0.15, 2.9))));
	// the sun arcs over the tent opening again and again (time-lapse); light breathes day/night
	const sunPh = (t * 2.3) % 1, sunX = lerp(1010, 1250, sunPh), sunY = 300 - 150 * Math.sin(Math.PI * sunPh), dayL = Math.sin(Math.PI * sunPh);
	const masked = day >= 66;
	const linen = (() => { const g = solve(pose), hp = toW(ex, GY, s, 1, ap(g.bH, [0.02, 0.6]));
		return `M${hp[0]} ${hp[1]}Q${chest[0] - 10} ${chest[1] - 60 + 30 * Math.sin(ph)} ${chest[0] - 60 + 80 * Math.cos(ph)} ${chest[1] + 10}`; })();
	return <Stage60 t={t} cam={cam} grade="papyrus" dark={0.32 - 0.14 * dayL} darkC="#1A1030" tags={[{x: ex - 170, y: 150, text: '防腐祭司'}]}
		light={<>
			<Shaft pts={[[sunX - 60, 140], [sunX + 40, 140], [lerp(760, 300, sunPh) + 160, GY], [lerp(760, 300, sunPh) - 120, GY]]} o={0.55 * dayL} />
			<Glow x={sunX} y={sunY} r={200} c="warm" o={0.9 * dayL} />
			<Glow x={chest[0]} y={chest[1]} r={140} c="red" o={0.35} />
			<Glow x={1236} y={GY - 300} r={300} c="warm" o={(0.4 + 0.35 * (1 - dayL)) + 0.1 * flick(t, 5)} />
			<Smoke t={t * 3} x={1236} y={GY - 300} n={9} seed={9} h={380} o={0.3} />
			<Dust t={t * 2} box={[100, 120, 1200, 840]} n={50} seed={5} o={0.6} vx={8} vy={6} />
			{JAR_T.map((jt, i) => t > jt - 0.02 && t < jt + 0.5 ? <DustBurst key={i} t={t} t0={jt} x={880 + i * 74} y={GY - 4} rx={34} ry={6} n={12} seed={i + 5} c="#F0DEB0" life={0.45} /> : null)}
		</>}>
		<rect x={-200} y={PIC_T - 100} width={1900} height={GY + 200} fill="#D8BE8C" />
		{/* the tent opening: sky racing through days and nights */}
		<rect x={980} y={120} width={300} height={GY - 120} fill={dayL > 0.15 ? '#F2C878' : '#1E2A5E'} />
		<rect x={980} y={120} width={300} height={GY - 120} fill="#1E2A5E" opacity={cl(1 - dayL * 1.6)} />
		{dayL < 0.3 && <Stars t={t} box={[990, 130, 1270, 500]} n={20} seed={8} o={1 - dayL / 0.3} />}
		<circle cx={sunX} cy={sunY} r={34} fill="#FFD27A" stroke="#E8642A" strokeWidth={3} opacity={cl(dayL * 3)} />
		<rect x={980} y={560} width={300} height={GY - 560} fill="#B88A52" />
		{[980, 1280].map((px) => <rect key={px} x={px - 12} y={110} width={24} height={GY - 110} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2} />)}
		<GlyphColumns x={340} y={200} cols={4} rows={5} cell={30} seed={31} />
		<path d={`M-200 ${PIC_T - 100}L1700 ${PIC_T - 100}L1700 116Q1240 ${150 + 6 * Math.sin(t * 2)} 860 120Q480 ${158 + 6 * Math.sin(t * 2.4 + 1)} 120 118Q0 130 -200 124Z`} fill="#F1E3C2" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 16}, (_, i) => <path key={i} d={`M${-160 + i * 120} ${PIC_T - 100}L${-150 + i * 120} ${126 + 18 * Math.sin(i * 1.3)}`} stroke={i % 2 ? PAL.red : PAL.blue} strokeWidth={10} opacity={0.6} />)}
		{/* the day counter, painted on a board hanging from the tent pole */}
		<line x1={150} y1={126} x2={150} y2={176} stroke={PAL.ink} strokeWidth={3} />
		<g transform={`rotate(${2 * Math.sin(t * 3)} 150 176)`}>
			<rect x={44} y={176} width={212} height={92} rx={8} fill="#F4E4BC" stroke={PAL.ink} strokeWidth={3} />
			<rect x={52} y={184} width={196} height={76} rx={5} fill="none" stroke={PAL.red} strokeWidth={2.4} />
			<text x={150} y={240} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={48} fill={PAL.ink}>第<tspan fill={PAL.red}>{day}</tspan>天</text>
		</g>
		<God id="a6-pr" cast={CAST2.embalmer} pose={pose} x={ex} y={GY} s={s} sec={{t}} />
		<LionBier x={bx} y={GY} s={s} />
		<Mummy x={bx + 0.3 * s} y={bedTop} s={s} heart={0.5} t={t} masked={masked} />
		<path d={linen} fill="none" stroke={PAL.ink} strokeWidth={13} strokeLinecap="round" /><path d={linen} fill="none" stroke="#F7F0DE" strokeWidth={9} strokeLinecap="round" />
		{/* the four jars slide in from the right and land in a row, one per beat */}
		{JARS.map((h, i) => { const jt = JAR_T[i], u = seg(t, jt - 0.3, jt); if (u <= 0) return null; const x = lerp(880 + i * 74 + 520, 880 + i * 74, 1 - Math.pow(1 - u, 3));
			const bump = 1 - 0.08 * pulse(t, jt, 0.02, 0.1);
			return <g key={h} transform={`translate(${x},${GY}) scale(${2 - bump},${bump}) translate(${-x},${-GY})`}><CanopicJar x={x} y={GY} s={19} head={h} t={t} glow={0.4} /></g>; })}
		<Lamp x={1150} y={GY} s={1.1} t={t} seed={5} />
		<rect x={-200} y={GY} width={1900} height={120} fill="#7A5230" />
		<rect x={-200} y={GY} width={1900} height={5} fill={PAL.ink} />
	</Stage60>;
};

/* ---------------- the priest's mask, gilded (overlay on the rig's jackal head) ---------------- */
const MaskShine: React.FC<{pose: Pose; x: number; y: number; s: number; face: 1 | -1; t: number}> = ({pose, x, y, s, face, t}) => {
	const H = solve(pose).head, lw = 1.6 / s;
	return <g transform={figT(x, y, s, face)}><g transform={mx(H)}>
		<path d={sp([[1.0, -1.86], [1.5, -1.3], [2.1, -1.08], [2.7, -0.92]], false)} fill="none" stroke={PAL.gold} strokeWidth={lw * 3.2} strokeLinecap="round" />
		<path d={sp([[0.95, -0.2], [1.6, -0.36], [2.3, -0.52], [2.82, -0.66]], false)} fill="none" stroke={PAL.gold} strokeWidth={lw * 2.4} strokeLinecap="round" />
		<path d="M-0.52 0.1Q0.0 0.35 0.5 0.12" fill="none" stroke={PAL.gold} strokeWidth={lw * 4} strokeLinecap="round" />
		<ellipse cx={0.2 + 0.08 * Math.sin(t * 2)} cy={-1.5} rx={0.45} ry={0.2} fill="#9FB0E0" opacity={0.35} transform="rotate(-30 0.2 -1.5)" />
		<circle cx={1.42} cy={-1.38} r={0.32} fill="url(#g60-gold)" opacity={0.7 + 0.2 * flick(t, 3)} style={{mixBlendMode: 'screen'}} />
	</g></g>;
};

/* ================= 7 · 17.5–20.4 · the hook twirl, the puff hooked out and tossed back into a basket (callback) =================
   cut in. Twirl 0.2–0.85, stops with a wobble at 0.85 [18.35] (comic boing) · the puff pops up on the hook at frame left 1.42 [18.92] (pop)
   · flick back over the shoulder 1.92 [19.42] (whoosh) · into the basket 2.57 [20.07] (thup). He never looks. */
export const Shot7: React.FC<ShotProps> = ({t}) => {
	const s = 56, px = 1010, G7 = 1330, face = -1 as const;
	const cam = aimPath(t, [[0, 800, 520, 720, 486, 1.1], [2.9, 800, 530, 720, 486, 1.16]], (u) => u);
	const tPop = 1.42, tRel = 1.92, tLand = 2.57;
	// front hand (toward the left): baton at the chest, lowers the hook out of frame, lifts it with the puff, swings it back over the shoulder
	const hand = keyV(t, [[0, 4.6, -13.2], [0.9, 4.6, -13.2], [1.32, 7.0, -10.2], [tPop, 6.6, -11.4], [tRel, 3.6, -14.6], [2.5, 3.8, -13.0]]);
	let pose: Pose = {...POSES.rest, lean: 4 - 5 * sm(seg(t, tPop, tRel)), neck: -2, head: -6 + 2 * Math.sin(t * 1.5), rt: -6, at: 9, rk: 2, ak: 1};
	pose = reach(pose, 'f', hand);
	pose = wristTo(pose, 'f', key1(t, [[0, 120], [1.0, 120], [1.32, 60], [tPop, 70], [tRel, 150], [2.5, 120]]));
	pose = wristTo(holdAt(pose, 'b', [1.3, -1.6]), 'b', 60);
	const g = solve(pose), grip = toW(px, G7, s, face, ap(g.fH, [0.02, 0.6]));
	// the rod angle on screen (0 = tip up, + clockwise); a twirl of two turns, then a springy stop
	const tw = sm(seg(t, 0.2, 0.85)), wob = t > 0.85 ? 14 * Math.exp(-(t - 0.85) / 0.18) * Math.sin((t - 0.85) * 34) : 0;
	const th = key1(t, [[0, -18], [0.2, -18], [0.85, -18], [1.0, -18], [1.32, -150], [tPop, -140], [tRel, -12], [2.5, 6]]) - 720 * tw + wob;
	const dir: V = [Math.sin(th * Math.PI / 180), -Math.cos(th * Math.PI / 180)], tip: V = [grip[0] + dir[0] * 230, grip[1] + dir[1] * 230], butt: V = [grip[0] - dir[0] * 70, grip[1] - dir[1] * 70];
	// the puff: rides the hook tip from the pop, flies from the release into the basket
	const B: V = [1120, 870];
	let puff: V | null = null, pa = 0, sq = 0;
	if (t >= tPop && t < tRel) { puff = [tip[0] + 20, tip[1] - 30]; pa = th * 0.3; sq = 0.25 * Math.exp(-(t - tPop) / 0.1) * Math.cos((t - tPop) * 40); }
	else if (t >= tRel) { const u = cl((t - tRel) / (tLand - tRel)), P0: V = [tip[0] + 20, tip[1] - 30];
		puff = [lerp(P0[0], B[0], u), lerp(P0[1], B[1], u) - 300 * 4 * u * (1 - u)]; pa = 500 * u; if (t > tLand) { puff = [B[0], B[1] + 14 * sm((t - tLand) / 0.15)]; sq = 0.2 * Math.exp(-(t - tLand) / 0.12) * Math.cos((t - tLand) * 40); } }
	const popRing = pulse(t, tPop, 0.02, 0.2);
	return <Stage60 t={t} cam={cam} grade="tomb" bg="#C9A472" dark={0.42} darkC="#1C0C04" wear={0.45} stain={0.3}
		light={<>
			<Glow x={260} y={300} r={520} c="warm" o={0.75 + 0.1 * flick(t, 1)} />
			<Glow x={grip[0]} y={grip[1]} r={160} c="gold" o={0.25} />
			<Embers t={t} x={200} y={500} n={10} seed={3} h={360} spread={20} />
			<Dust t={t} box={[0, 100, 1300, 900]} n={50} seed={17} o={0.55} />
			{popRing > 0.02 && puff && <g><Sparkle x={puff[0] - 50} y={puff[1] - 30} r={40 * popRing} o={popRing} /><Sparkle x={puff[0] + 46} y={puff[1] - 40} r={30 * popRing} o={popRing} a={30} /></g>}
			{t > tLand - 0.02 && <DustBurst t={t} t0={tLand} x={B[0]} y={B[1] - 30} rx={60} ry={12} n={20} seed={6} c="#E8E2D2" life={0.6} />}
		</>}>
		<rect x={-300} y={-200} width={2100} height={1500} fill="#C9A472" />
		<GlyphColumns x={60} y={140} cols={5} rows={6} cell={36} seed={33} />
		<path d={`M-300 -200L1800 -200L1800 90Q1200 ${130 + 6 * Math.sin(t * 1.3)} 700 96Q300 ${134 + 6 * Math.sin(t * 1.5)} -300 100Z`} fill="#F1E3C2" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-200 + i * 140} -200L${-190 + i * 140} ${104 + 16 * Math.sin(i * 1.3)}`} stroke={i % 2 ? PAL.red : PAL.blue} strokeWidth={12} opacity={0.6} />)}
		<Flame x={170} y={560} s={1.4} t={t} seed={2} /><path d={poly([[150, 560], [190, 560], [182, 900], [158, 900]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
		{/* the hook (bronze): drawn behind the hand */}
		<path d={`M${butt[0]} ${butt[1]}L${tip[0]} ${tip[1]}`} stroke={PAL.ink} strokeWidth={13} strokeLinecap="round" />
		<path d={`M${butt[0]} ${butt[1]}L${tip[0]} ${tip[1]}`} stroke="#C8863A" strokeWidth={8} strokeLinecap="round" />
		<path d={`M${butt[0]} ${butt[1]}L${tip[0]} ${tip[1]}`} stroke="#F2C27A" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
		<g transform={`translate(${tip[0]},${tip[1]}) rotate(${th})`}><path d="M0 0Q-2 -22 14 -26Q26 -26 26 -12" fill="none" stroke={PAL.ink} strokeWidth={11} strokeLinecap="round" /><path d="M0 0Q-2 -22 14 -26Q26 -26 26 -12" fill="none" stroke="#C8863A" strokeWidth={6} strokeLinecap="round" /></g>
		<God id="a7-pr" cast={{...CAST2.embalmer, fHand: 'fist', bHand: 'open'}} pose={pose} x={px} y={G7} s={s} face={face} sec={{t}} />
		<MaskShine pose={pose} x={px} y={G7} s={s} face={face} t={t} />
		{puff && <Puff x={puff[0]} y={puff[1]} r={50} a={pa} sq={sq} />}
		<Basket x={B[0]} y={B[1] + 96} w={190} h={124} />
	</Stage60>;
};

/* ================= 8 · 20.4–23.6 · inside the mummy: only the heart is lit; it opens like a lantern; your life flickers inside =================
   dissolve in (0.4). Doors open 0.35–0.75 [20.75–21.15]; vignettes flip in (paper flutter) at 0.75, 1.3, 1.85, 2.4 [21.15, 21.70, 22.25, 22.80];
   the scale-nudging one flashes red 2.62–2.69 [23.02] (ting); heartbeats under at 0.25, 1.1, 1.95, 2.8 [20.65, 21.50, 22.35, 23.20]. */
const HB8 = [0.25, 1.1, 1.95, 2.8], VT = [0.75, 1.3, 1.85, 2.4], RED8 = 2.62;
const Vignette: React.FC<{k: number; t: number; red: number}> = ({k, t, red}) => {
	const gy = 96, ink = red > 0 ? '#B01810' : PAL.ink;
	const ground = <><rect x={-150} y={gy} width={300} height={8} fill={PAL.red} /><rect x={-150} y={gy + 8} width={300} height={4} fill={PAL.blue} /></>;
	if (k === 0) return <g>{ground}
		<God id="a8-v0a" cast={{...CAST.ani, wig: 'duplex'}} pose={wristTo(reach({...POSES.rest, lean: 6, head: 8}, 'f', [6.0, -9.8]), 'f', 60)} x={-70} y={gy} s={8.6} sec={{t}} />
		<God id="a8-v0b" cast={{...CAST2.scribe}} pose={scribePose(t * 4, 2)} x={30} y={gy} s={7.6} sec={{t}} fProp="pen" />
		<rect x={58} y={gy - 30} width={44} height={30} fill="#F2E4BE" stroke={ink} strokeWidth={2} /><path d="M64 70L96 70M64 78L90 78" stroke={ink} strokeWidth={2} />
	</g>;
	if (k === 1) return <g>{ground}
		<path d={sp([[-20, gy, 1], [120, gy, 1], [90, gy - 50], [50, gy - 72], [10, gy - 50]], true, 0.2)} fill={PAL.gold} stroke={ink} strokeWidth={2.4} />
		{[0, 1, 2, 3].map((i) => <circle key={i} cx={20 + i * 22} cy={gy - 20 - (i % 2) * 18} r={3} fill="#B07816" />)}
		<God id="a8-v1" cast={{...CAST2.priest}} pose={wristTo(reach({...POSES.rest, lean: 3, head: 6}, 'f', [5.8, -14.6 + 0.6 * Math.sin(t * 9)]), 'f', 170)} x={-80} y={gy} s={8.6} sec={{t}} />
		{[0, 1, 2, 3].map((i) => <rect key={i} x={-10 + i * 14} y={-100} width={6} height={36} fill={PAL.red} opacity={cl((t - 1.3) * 6 - i)} />)}
		<path d="M-14 -82L44 -82" stroke={PAL.red} strokeWidth={4} opacity={cl((t - 1.3) * 6 - 4)} />
	</g>;
	if (k === 2) { const sh = 4 * Math.sin(t * 30);
		return <g>{ground}
			<God id="a8-v2a" cast={{...CAST.ani}} pose={wristTo(reach({...POSES.rest, lean: 8, head: -2}, 'f', [6.0, -15.0 + 0.4 * Math.sin(t * 20)]), 'f', 150)} x={-95 + sh * 0.3} y={gy} s={8.0} sec={{t}} />
			<God id="a8-v2b" cast={{...CAST2.priest}} pose={wristTo(reach({...POSES.rest, lean: 8, head: -2}, 'f', [6.0, -14.2 + 0.4 * Math.sin(t * 23)]), 'f', 140)} x={95 - sh * 0.3} y={gy} s={8.0} face={-1} sec={{t}} />
			{[0, 1, 2].map((i) => <path key={i} d={`M${-12 + i * 10} ${-60 - i * 12}l8 -10l-6 -4l10 -12`} fill="none" stroke={PAL.red} strokeWidth={3.5} strokeLinejoin="round" />)}
		</g>; }
	// k === 3: you, nudging the weight on a market scale with one finger
	return <g>{ground}
		<g transform={`translate(10,${gy})`}><Balance p={{tilt: -6 - 3 * sm(seg(t, 2.45, 2.62)), plumb: 2}} x={0} y={0} s={5.6} /></g>
		<God id="a8-v3" cast={{...CAST.ani}} pose={wristTo(reach({...POSES.rest, lean: 10, head: 10}, 'f', [6.5 + 0.4 * sm(seg(t, 2.45, 2.62)), -8.8]), 'f', 100)} x={-118} y={gy} s={7.6} sec={{t}} />
	</g>;
};
export const Shot8: React.FC<ShotProps> = ({t}) => {
	const HS = 315, HX = 680, HYb = 812;
	const cam = aimPath(t, [[-0.4, HX, 520, 700, 486, 1.0], [3.4, HX, 500, 700, 486, 1.12]], (u) => u);
	const beat = HB8.reduce((a, b) => a + pulse(t, b, 0.04, 0.16) + 0.5 * pulse(t, b + 0.17, 0.04, 0.2), 0);
	const open = sm(seg(t, 0.35, 0.75)), vi = VT.reduce((a, v, i) => (t >= v ? i : a), -1), vu = vi >= 0 ? seg(t, VT[vi], VT[vi] + 0.14) : 0;
	const red = t >= RED8 && t < RED8 + 0.07 ? 1 : 0;
	const door = (k: number) => { const sx = 1 - 0.9 * open, hx = k * 0.78;
		return <g transform={`translate(${hx},0) scale(${sx},1) translate(${-hx},0)`}>
			<g clipPath="url(#a8-half)" transform={k > 0 ? 'scale(-1,1)' : undefined}>
				<path d={HEART_D} fill={PAL.red} /><path d="M-0.55 -1.15Q-0.62 -0.7 -0.42 -0.32" fill="none" stroke="#E0705A" strokeWidth={0.04} />
				<path d="M-0.7 -0.9L0 -0.9M-0.66 -0.5L0 -0.5" stroke={PAL.gold} strokeWidth={0.035} />
				{[-0.5, -0.25].map((x) => <circle key={x} cx={x} cy={-0.7} r={0.05} fill={PAL.gold} />)}
			</g>
			<path d={`M0 -1.6L0 0`} stroke={PAL.gold2} strokeWidth={0.04} />
		</g>; };
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0A1030" wear={0.15} stain={0.15}
		light={<>
			<Glow x={HX} y={HYb - 0.9 * HS} r={720 * (0.9 + 0.12 * beat)} c="red" o={0.55 + 0.25 * beat} />
			<Glow x={HX} y={HYb - 0.85 * HS} r={260} c="gold" o={0.35 + 0.45 * open} />
			{open > 0 && <path d={`M${HX - 120} ${HYb - 0.85 * HS}L${HX - 640} ${PIC_T - 60}L${HX + 640} ${PIC_T - 60}L${HX + 120} ${HYb - 0.85 * HS}Z`} fill="url(#g60-shaft)" opacity={0.18 * open} style={{mixBlendMode: 'screen'}} />}
			<Embers t={t} x={HX} y={HYb - 0.4 * HS} n={18} seed={8} h={520} spread={300} />
			<Dust t={t} box={[100, 60, 1300, 900]} n={60} seed={18} c="#FFC890" o={0.55} vx={2} vy={-6} />
			{red > 0 && <circle cx={HX} cy={HYb - 0.85 * HS} r={260} fill="#FF2010" opacity={0.55} style={{mixBlendMode: 'screen'}} />}
		</>}>
		<defs><clipPath id="a8-half"><rect x={-1} y={-2} width={1} height={2.2} /></clipPath><clipPath id="a8-win"><path d={HEART_D} transform="translate(0,-0.12) scale(0.86)" /></clipPath>
			<radialGradient id="a8-in" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stopColor="#FFF2CE" /><stop offset="0.7" stopColor="#F2D38E" /><stop offset="1" stopColor="#D99A4A" /></radialGradient></defs>
		<rect x={-400} y={-300} width={2300} height={1700} fill="#0A1030" />
		{/* x-ray: the linen wraps of the body around the heart, faint blue lines */}
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${-300 + i * 70} -100L${300 + i * 70} 1100`} stroke="#3A5AB0" strokeWidth={3} opacity={0.22} />)}
		{Array.from({length: 30}, (_, i) => <path key={'b' + i} d={`M${300 + i * 70 - 600} 1100L${i * 70 + 300} -100`} stroke="#3A5AB0" strokeWidth={2} opacity={0.14} />)}
		<path d={sp([[-300, 1000], [-300, 140], [300, 70], [1000, 60], [1700, 110], [1700, 1000]], true, 0.2)} fill="none" stroke="#6F8CE0" strokeWidth={5} opacity={0.35} />
		<g transform={`translate(${HX},${HYb}) scale(${HS * (1 + 0.025 * beat)})`}>
			<path d={HEART_D} fill="#5A0C08" stroke={PAL.ink} strokeWidth={0.05} />
			<g clipPath="url(#a8-win)">
				<path d={HEART_D} fill="url(#a8-in)" />
				{vi >= 0 && <g transform={`translate(0,-0.84) scale(${(1 / HS) * Math.max(0.05, vu)},${1 / HS})`}><Vignette k={vi} t={t} red={red} /></g>}
				{red > 0 && <path d={HEART_D} fill="#FF2A10" opacity={0.55} />}
			</g>
			{door(-1)}{door(1)}
			<path d={HEART_D} fill="none" stroke={PAL.gold} strokeWidth={0.045} />
			<path d="M-0.38 -1.42Q0 -1.32 0.38 -1.42" fill="none" stroke={PAL.gold} strokeWidth={0.06} />
		</g>
	</Stage60>;
};

/* ================= 9 · 23.6–26.5 · top-down: a hand lays the green heart scarab on the chest; a gold ring circles it (freeze highlight) =================
   dissolve in (0.3). The scarab turns over in the fingers (the inscribed base shows) 0.05–0.7 · stone tap 0.85 [24.45] ·
   ring + freeze 1.1–1.9, chime 1.15 [24.75] · label 心脏圣甲虫 from 1.2. */
export const Shot9: React.FC<ShotProps> = ({t}) => {
	const SX = 640, SY = 560, tTap = 0.85, tR = 1.1, tF1 = 1.9;
	const frz = t > tR && t < tF1 ? 1 : 0, tt = t < tR ? t : t < tF1 ? tR : t - (tF1 - tR);
	const cam = aimPath(t, [[-0.3, SX, SY, 680, 470, 1.0], [2.9, SX, SY, 680, 470, 1.1]], (u) => u);
	const desc = sm(seg(t, -0.3, tTap)), flip = 1 - sm(seg(t, 0.05, 0.7)), lift = t < tTap ? 1 - desc : 0;
	const sc = 1 + 0.22 * lift, sy = SY - 90 * lift;
	const handOut = sm(seg(t, tTap + 0.1, tTap + 0.6)), handY = sy - 120 - 760 * handOut, handX = SX + 40 + 120 * handOut;
	const ring = seg(t, tR, tR + 0.55), ringO = (t > tR ? 1 : 0) * (1 - sm(seg(t, tF1 + 0.1, tF1 + 0.6)));
	const tap = pulse(t, tTap, 0.02, 0.18);
	const wraps: React.ReactNode[] = [];
	for (let i = -14; i < 40; i++) { const x0 = -400 + i * 56; wraps.push(<path key={'a' + i} d={`M${x0} -100L${x0 + 620} 1150`} stroke="#C9B88E" strokeWidth={18} opacity={0.55} />, <path key={'b' + i} d={`M${x0 + 620} -100L${x0} 1150`} stroke="#F2E9D2" strokeWidth={11} opacity={0.55} />); }
	const net: React.ReactNode[] = [];
	for (let i = 0; i < 20; i++) for (let j = 0; j < 10; j++) { const bx = -200 + i * 96 + (j % 2) * 48, by = 300 + j * 70;
		if (Math.hypot(bx - SX, (by - SY) * 0.8) < 230) continue;
		net.push(<g key={`${i}.${j}`}><path d={poly([[bx, by - 32], [bx + 44, by], [bx, by + 32], [bx - 44, by]])} fill="none" stroke={STONE.faience} strokeWidth={6} opacity={0.55} /><circle cx={bx} cy={by - 32} r={6} fill={j % 2 ? PAL.gold : PAL.red} stroke={PAL.ink} strokeWidth={1.4} /></g>); }
	return <Stage60 t={t} cam={cam} grade="tomb" bg="#E6D7B2" dark={0.22} darkC="#2A1206" wear={wearAt(cam.z, 0.5)} stain={0.25}
		screen={(() => { const sp_ = toScreen(cam, SX, SY), fo = sm(seg(t, tR - 0.05, tR + 0.15)) * (1 - sm(seg(t, tF1, tF1 + 0.4)));
			return fo > 0 ? <g><defs><radialGradient id="a9-spot" gradientUnits="userSpaceOnUse" cx={sp_[0]} cy={sp_[1]} r={560}><stop offset="0.42" stopColor="#120600" stopOpacity={0} /><stop offset="1" stopColor="#120600" stopOpacity={0.6} /></radialGradient></defs>
				<rect width={FW} height={1080} fill="url(#a9-spot)" opacity={fo} /></g> : null; })()}
		tags={t > 1.2 ? [{x: SX + 250, y: SY - 230, text: '心脏圣甲虫', o: sm(seg(t, 1.2, 1.5))}] : []}
		light={<>
			<Glow x={SX} y={SY + 40} r={520} c="red" o={0.45} />
			<Glow x={260} y={200} r={700} c="warm" o={0.6 + 0.1 * flick(tt, 2)} />
			<Glow x={SX} y={sy} r={300 * sc} c="green" o={0.4 + 0.3 * (1 - lift) + 0.4 * tap + 0.35 * frz} />
			<Glow x={SX} y={sy} r={150 * sc} c="gold" o={0.2 + 0.4 * frz} />
			{ringO > 0 && <g style={{mixBlendMode: 'screen'}} opacity={ringO}>
				<ellipse cx={SX} cy={SY} rx={226} ry={268} fill="none" stroke="#FFE7A0" strokeWidth={7} strokeDasharray={`${1550 * ring} 2000`} transform={`rotate(-90 ${SX} ${SY})`} />
				<ellipse cx={SX} cy={SY} rx={226} ry={268} fill="none" stroke="#FFD060" strokeWidth={26} opacity={0.3} strokeDasharray={`${1550 * ring} 2000`} transform={`rotate(-90 ${SX} ${SY})`} />
				{(() => { const a = -Math.PI / 2 + 2 * Math.PI * ring; return <Sparkle x={SX + 226 * Math.cos(a)} y={SY + 268 * Math.sin(a)} r={46} a={t * 90} />; })()}
				{ring >= 1 && [0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3 + 0.4; return <Sparkle key={i} x={SX + 250 * Math.cos(a)} y={SY + 292 * Math.sin(a)} r={16 + 8 * Math.sin(t * 8 + i)} />; })}
			</g>}
			<Dust t={tt} box={[0, 100, 1300, 900]} n={50} seed={19} o={0.55} />
		</>}>
		<rect x={-400} y={-200} width={2300} height={1500} fill="#E6D7B2" />
		{wraps}
		{[[PAL.gold, 0], [PAL.blue, 26], [PAL.red, 54], [PAL.green, 80], [PAL.gold, 108]].map(([c, o], i) => <path key={i} d={`M-400 ${40 + (o as number)}Q720 ${250 + (o as number)} 1900 ${40 + (o as number)}L1900 ${68 + (o as number)}Q720 ${278 + (o as number)} -400 ${68 + (o as number)}Z`} fill={c as string} stroke={PAL.ink} strokeWidth={2} opacity={0.92} />)}
		{net}
		{/* the scarab, its shadow, the hand that lays it */}
		<ellipse cx={SX + 30 + 40 * lift} cy={SY + 40 + 60 * lift} rx={170 * sc} ry={200 * sc} fill="#2A1206" opacity={0.25 * (1 - 0.5 * lift)} />
		<g transform={`translate(${SX},${sy}) scale(${sc}) translate(${-SX},${-sy})`}><HeartScarab id="a9-hs" x={SX} y={sy} s={44} flip={flip} t={t} lines={1} glint={0.8} /></g>
		{handOut < 1 && <g transform={`translate(${handX - 40},${handY - 140}) scale(${sc})`}>
			<path d={sp([[-58, -900, 1], [58, -900, 1], [52, -120], [60, -40], [46, 6], [-46, 6], [-62, -40], [-52, -120]], true, 0.18)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={4} />
			<path d="M20 -880Q30 -400 26 -120" fill="none" stroke={PAL.skinM2} strokeWidth={14} opacity={0.5} strokeLinecap="round" />
			<rect x={-62} y={-190} width={124} height={40} rx={8} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3} /><rect x={-62} y={-176} width={124} height={11} fill={PAL.blue} />
			{/* palm over the scarab's top rim, four fingers curled down onto it, the thumb at its side */}
			<path d={sp([[-66, -40], [66, -40], [74, 30], [60, 80], [-60, 80], [-74, 30]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={4} />
			{[-45, -15, 15, 45].map((xx, i) => <g key={xx}><path d={sp([[xx - 15, 60], [xx + 15, 60], [xx + 14, 110 + (i % 3 ? 8 : 0)], [xx, 122 + (i % 3 ? 8 : 0)], [xx - 14, 110 + (i % 3 ? 8 : 0)]], true, 0.22)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.4} />
				<path d={`M${xx - 9} ${92 + (i % 3 ? 4 : 0)}Q${xx} ${98 + (i % 3 ? 4 : 0)} ${xx + 9} ${92 + (i % 3 ? 4 : 0)}`} fill="none" stroke={PAL.skinM2} strokeWidth={2.4} /></g>)}
			<path d={sp([[-70, 10], [-112, 60], [-124, 120], [-104, 132], [-84, 92], [-56, 50]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.4} />
		</g>}
		{tap > 0.02 && <DustBurst t={t} t0={tTap} x={SX} y={SY} rx={170} ry={210} n={30} seed={9} c="#FFF2C8" life={0.5} />}
	</Stage60>;
};
export const _l = {Embers, Stars, FW, GlyphRun, GoldDefs, Torch: Lamp, ANI, River, holdAt};

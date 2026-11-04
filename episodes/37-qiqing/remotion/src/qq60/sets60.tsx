import React from 'react';
import {God, CAST, Ammit, ammitSolve, Cast, Pose, POSES, wristTo, holdAt, reach} from './rig60';
import {GlyphColumns, WingedSun, Heart, ShrineBack, ShrineFront, Throne, SHRINE, Balance} from './props60';
import {Stage60, KhekherFrieze, RegisterLine, Dado, Glow, Dust, Embers, Smoke, Shaft, Stars, Flame, camPath, rng, flick, Sub, Stamp, FW, PIC_T, PIC_CY} from './frame60';
import {Mummy, LionBier, BIER_H, CanopicJar, OfferingTable, Torch, Lamp, HeartScarab, Barque, Serpent, DuatGate, River, Wheat, Palm, PapyrusClump,
	Column, FeatherCornice, JudgeDefs, JudgeRow, ScrollShelf, ScrollRoll, OpenScroll, Awning, Basket, STONE, Ox, Plough, Skiff} from './props60b';
import {CAST2, ANI, ANI_POSES, tutuPose, tendPose, scribePose, walkPose, Shabti, leadPair, ploughPose, reclinePose} from './cast60';
import {mummyHands as mummyHandsPose} from './scene60';
import {PAL, sp, poly, lerp, sm, cl, seg, V, mx, chain, T as Tm} from './geo60';

/* ep60 · 4:3 sets, aligned with episodes/60-xinzang/script.md (shot numbers in brackets).
   Each set is a component of time `t` (s) with its own camera path and life (flicker, dust, glows, particles); `sub` / `stamp`
   override the samples. World px == frame px at the default camera; the ground line sits at GY = 852. */
const GY = 852;
type SetP = {t: number; sub?: Sub; stamp?: Stamp};
/** painted stars on a ceiling band (static) */
export const Ceiling: React.FC<{x0: number; x1: number; y0: number; y1: number; bg?: string}> = ({x0, x1, y0, y1, bg = '#1B2A63'}) => { const out: React.ReactNode[] = [], st = 56;
	for (let i = 0, x = x0 + 20; x < x1; i++, x += st) for (let j = 0, y = y0 + 22; y < y1 - 10; j++, y += 44) { const xx = x + (j % 2) * st / 2, r = 11;
		out.push(<path key={`${i}.${j}`} d={Array.from({length: 10}, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.38 : r; return `${k ? 'L' : 'M'}${(xx + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`; }).join('') + 'Z'} fill="#E8B83E" />); }
	return <g><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={bg} />{out}<rect x={x0} y={y1 - 6} width={x1 - x0} height={6} fill={PAL.ink} /></g>; };

/* ================= (a) the burial chamber [10, general tomb] ================= */
export const TombSet: React.FC<SetP> = ({t, sub = {text: '人死了，旅程[才刚开始]。'}, stamp}) => {
	const s = 33, bx = 270, ISIS: Cast = {...CAST.isis};
	const isisPose: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 2, head: 2, bs: 72 + 3 * Math.sin(t * 0.8), be: 8, bw: -16, fs: 100 + 3 * Math.sin(t * 0.8 + 0.4), fe: 6, fw: -18};
	const cam = camPath(t, [[0, 720, 486, 1], [8, 780, 540, 1.12]]), mask: V = [bx + (0.3 + 17.2) * s, GY - BIER_H * s - 3.6 * s];
	return <Stage60 t={t} cam={cam} grade="tomb" dark={0.5} darkC="#1C0C04" sub={sub} stamp={stamp} tags={[{x: 300, y: 446, text: '木乃伊'}]}
		light={<>
			<Glow x={150} y={GY - 280} r={520} c="warm" o={0.8 + 0.1 * flick(t, 1)} />
			<Glow x={1250} y={GY - 280} r={440} c="warm" o={0.66 + 0.1 * flick(t, 2)} />
			<Glow x={mask[0]} y={mask[1]} r={150} c="gold" o={0.55 + 0.12 * flick(t, 3)} />
			<Glow x={650} y={360} r={380} c="warm" o={0.22} />
			<Dust t={t} box={[60, 160, 1320, 840]} n={70} seed={11} o={0.6} vx={4} vy={-3} />
			<Smoke t={t} x={1100} y={GY - 230} n={9} seed={4} h={340} o={0.3} />
			<Embers t={t} x={150} y={GY - 270} n={12} seed={2} h={260} spread={14} />
			<Embers t={t} x={1250} y={GY - 270} n={10} seed={5} h={260} spread={14} />
		</>}>
		<Ceiling x0={-80} x1={1600} y0={PIC_T} y1={150} />
		<KhekherFrieze x0={-80} x1={1600} y={150} h={44} />
		{/* back wall: winged Isis spreading her wings over the bier under a winged sun, spell columns either side */}
		<g opacity={0.9}>
			<WingedSun x={650} y={236} s={14} span={12} t={t} />
			<God id="tb-isis" cast={ISIS} pose={isisPose} x={600} y={505} s={14.5} sec={{t}} />
			<GlyphColumns x={60} y={250} cols={7} rows={6} cell={30} seed={21} />
			<GlyphColumns x={960} y={250} cols={7} rows={6} cell={30} seed={22} />
		</g>
		<RegisterLine x0={-80} x1={1600} y={505} h={14} />
		{/* the bier, the mummy, the canopic jars and the rolled Book of the Dead beneath */}
		<LionBier x={bx} y={GY} s={s} />
		{(['human', 'baboon', 'jackal', 'falcon'] as const).map((h, i) => <CanopicJar key={h} x={bx + 4.4 * s + i * 2.8 * s} y={GY} s={19} head={h} t={t} />)}
		<ScrollRoll x={bx + 16.4 * s} y={GY - 13} len={118} r={12} tie={PAL.red} />
		<Mummy x={bx + 0.3 * s} y={GY - BIER_H * s} s={s} t={t} />
		<OfferingTable x={1100} y={GY} s={17} t={t} />
		<Torch x={150} y={GY} s={1.0} t={t} seed={1} h={240} />
		<Torch x={1250} y={GY} s={0.95} t={t} seed={2} h={240} />
		<Dado x0={-80} x1={1600} y={GY} h={80} />
	</Stage60>;
};

/* ================= (b) the embalming tent [1, 2, 6, 7, 8]: the priest in the Anubis mask, the jars, the heart left in the body ================= */
export const EmbalmSet: React.FC<SetP & {close?: number}> = ({t, sub = {text: '内脏装进罐子，[心脏]留在身体里。'}, stamp, close = 0}) => {
	const s = 30, bx = 190, bedTop = GY - BIER_H * s, ex = bx + 10.4 * s;
	const chest: V = [bx + (0.3 + 12.6) * s, bedTop - 2.0 * s];
	const toF = (p: V): V => [(p[0] - ex) / s, (p[1] - GY) / s];
	const breathe = Math.sin(t * 1.3);
	// one hand lays linen over the chest, the other is raised in blessing over the heart
	const bHand: V = [chest[0] - 40, chest[1] - 26 - 5 * breathe], fHand: V = [chest[0] + 64, chest[1] - 96 + 8 * Math.sin(t * 0.9)];
		const pose = {...tendPose(toF(bHand), toF(fHand), t, 13), neck: 3, head: 9 + 2 * Math.sin(t * 0.8)};
	const heart = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2.6));
	const cam = close > 0 ? camPath(t, [[0, ex + 60, 360, 2.0], [3, ex + 70, 380, 2.2]]) : camPath(t, [[0, 700, 486, 1], [8, 760, 540, 1.12]]);
	return <Stage60 t={t} cam={cam} grade="papyrus" dark={0.3} darkC="#2A1408" sub={sub} stamp={stamp} tags={[{x: ex - 236, y: 230, text: '防腐祭司'}, {x: 1040, y: 520, text: '卡诺匹斯罐'}]}
		light={<>
			<Shaft pts={[[40, PIC_T], [320, PIC_T], [800, GY], [380, GY]]} o={0.55} />
			<Dust t={t} box={[100, 120, 800, 840]} n={60} seed={5} o={0.75} vx={5} vy={6} />
			<Glow x={chest[0]} y={chest[1] + 30} r={150 * heart} c="red" o={0.75 * heart} />
			<Glow x={1236} y={GY - 300} r={300} c="warm" o={0.65 + 0.1 * flick(t, 5)} />
			<Smoke t={t} x={1236} y={GY - 300} n={9} seed={9} h={380} o={0.34} />
			<Embers t={t} x={1236} y={GY - 300} n={6} seed={9} h={160} spread={10} />
		</>}>
		{/* the tent of purification: linen roof on poles over the workshop */}
		<rect x={-80} y={PIC_T} width={1680} height={GY - PIC_T} fill="#D8BE8C" opacity={0.35} />
		<GlyphColumns x={60} y={210} cols={3} rows={6} cell={30} seed={31} />
		{[40, 1320].map((px) => <path key={px} d={poly([[px - 9, GY], [px + 9, GY], [px + 7, 130], [px - 7, 130]])} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2} />)}
		<path d={`M-80 ${PIC_T}L1600 ${PIC_T}L1600 120Q1240 ${164 + 6 * Math.sin(t * 1.2)} 860 128Q480 ${168 + 6 * Math.sin(t * 1.4 + 1)} 120 126Q0 140 -80 132Z`} fill="#F1E3C2" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-40 + i * 120} ${PIC_T}L${-30 + i * 120} ${134 + 18 * Math.sin(i * 1.3)}`} stroke={i % 2 ? PAL.red : PAL.blue} strokeWidth={10} opacity={0.6} />)}
		{/* shelf: natron, linen rolls, oil */}
		<rect x={790} y={330} width={330} height={14} fill="#A86E3A" stroke={PAL.ink} strokeWidth={2} />
		{[0, 1, 2, 3].map((i) => <g key={i}><rect x={810 + i * 74} y={286} width={56} height={44} rx={8} fill={['#F3ECDC', '#E9DDBF', '#C9874A', '#F3ECDC'][i]} stroke={PAL.ink} strokeWidth={2} />
			{i !== 2 && [0, 1, 2].map((k) => <line key={k} x1={814 + i * 74} x2={862 + i * 74} y1={296 + k * 11} y2={296 + k * 11} stroke="#BFB08C" strokeWidth={2} />)}</g>)}
		<God id="em-pr" cast={CAST2.embalmer} pose={pose} x={ex} y={GY} s={s} sec={{t}} />
		<LionBier x={bx} y={GY} s={s} />
		<Mummy x={bx + 0.3 * s} y={bedTop} s={s} heart={heart} t={t} masked={false} />
		{/* the linen strip from his hand down onto the chest */}
		<Basket x={880} y={GY} w={104} h={66} fill="#F5F0E4" />
		{(['human', 'baboon', 'jackal', 'falcon'] as const).map((h, i) => <CanopicJar key={h} x={980 + i * 62} y={GY} s={16.5} head={h} t={t} glow={0.5} />)}
		<path d={poly([[1220, GY], [1252, GY], [1246, GY - 262], [1226, GY - 262]])} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2} />
		<Lamp x={1236} y={GY - 258} s={1.2} t={t} seed={5} />
		<Dado x0={-80} x1={1600} y={GY} h={80} />
	</Stage60>;
};

/* ================= (c) the Duat [15–17]: a dark river, gates with serpents and knife-holders, the solar barque ================= */
const GUARD: Cast[] = [{...CAST.anubis, crown: 'none', bHand: 'fist', fHand: 'fist'}, {...CAST.horus, crown: 'none', bHand: 'fist', fHand: 'fist'}];
export const DuatSet: React.FC<SetP & {mood?: 'night' | 'blood'}> = ({t, sub = {text: '一道道门，守门的手里拿着[刀]。'}, stamp, mood = 'night'}) => {
	const wl = 812, s = 16, bxW = 300 + 64 * t;
	const gates = [760, 1700, 2640, 3580];
	const ra: Pose = (() => { let p: Pose = {...POSES.throne, y: 5.95, head: 0.6 * Math.sin(t)}; p = wristTo(holdAt(p, 'f', [2.75, -3.1]), 'f', 92); return wristTo(holdAt(p, 'b', [3.0, -0.2]), 'b', 4); })();
	const guardPose = (k: number): Pose => { let p: Pose = {...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 6, head: 2 + 2 * Math.sin(t * 1.5 + k), neck: 2};
		p = wristTo(holdAt(p, 'f', [3.2, -5.6 + 0.2 * Math.sin(t * 2 + k)]), 'f', 96); return wristTo(holdAt(p, 'b', [2.4, -0.4]), 'b', 20); };
	const cam = {x: bxW + 300, y: PIC_CY, z: 1};
	const blood = mood === 'blood';
	return <Stage60 t={t} cam={cam} grade={blood ? 'blood' : 'lapis'} bg={blood ? '#3A0E0A' : '#0E1638'} wear={0.3} stain={0.3} dark={blood ? 0 : 0.25} darkC="#05081A" sub={sub} stamp={stamp}
		tags={[{x: bxW - 290, y: 470, text: '太阳船'}]}
		light={<>
			{gates.map((g, i) => <g key={g}><Glow x={g} y={wl - 160} r={300} c="warm" o={0.45 + 0.1 * flick(t, i)} /><Embers t={t} x={g} y={wl - 40} n={10} seed={i + 3} h={320} spread={120} /></g>)}
			<Glow x={bxW} y={wl - 200} r={360} c="gold" o={0.6} />
			<Dust t={t} box={[bxW - 700, 100, bxW + 1300, 780]} n={50} seed={6} c="#FFE2A0" o={0.5} vx={-10} vy={-2} />
		</>}>
		<rect x={-400} y={PIC_T} width={5000} height={wl - PIC_T} fill={blood ? '#4A120C' : '#101A42'} />
		<rect x={-400} y={PIC_T} width={5000} height={240} fill={blood ? '#200604' : '#070C26'} opacity={0.6} />
		{!blood && <Stars t={t} box={[-400, PIC_T, 4600, 330]} n={300} seed={7} />}
		{/* the far register: the goddesses of the hours with stars over their heads */}
		<g opacity={0.45}>{Array.from({length: 30}, (_, i) => <g key={i}><God id={`dh${i}`} cast={{...CAST.isis, wings: false, crown: 'none', dress: 'sheath'}} pose={{...POSES.rest, bs: 10, fs: 40, fe: 30}} x={-300 + i * 170} y={360} s={6} sec={{t: t + i}} />
			<path d={`M${-300 + i * 170 + 4} 220l3 8 8 0-6 5 2 8-7-5-7 5 2-8-6-5 8 0z`} fill="#E8B83E" /></g>)}</g>
		<RegisterLine x0={-400} x1={4600} y={362} h={10} />
		{gates.map((g, i) => <g key={g}>
			<DuatGate x={g} gy={wl + 4} h={360} w={170} t={t} seed={i} />
						<God id={`gd${i}a`} cast={GUARD[i % 2]} pose={guardPose(i)} x={g - 250} y={wl + 2} s={12.5} face={-1} sec={{t: t + i}} bProp="none" fProp="knife" />
			<God id={`gd${i}b`} cast={GUARD[(i + 1) % 2]} pose={guardPose(i + 2)} x={g + 300} y={wl + 2} s={12.5} face={-1} sec={{t: t + i + 1}} bProp="none" fProp="knife" />
			<Serpent x={g - 30} y={wl + 2} s={20} t={t + i * 0.7} flip={-1} fire={0.6 + 0.4 * Math.max(0, Math.sin(t * 1.3 + i))} />
			<Flame x={g - 128} y={wl - 2} s={0.9} t={t} seed={i * 2} /><Flame x={g + 128} y={wl - 2} s={0.9} t={t} seed={i * 2 + 1} />
		</g>)}
		<River x0={-400} x1={4600} y={wl} h={130} t={t} dark />
		<Barque x={bxW} y={wl + 20} s={s} t={t}>
			<g transform={`scale(${1 / s})`}>
				<path d={poly([[-34, -4], [26, -4], [26, -58], [-34, -58]])} fill={PAL.blue} stroke={PAL.ink} strokeWidth={2} />
				<God id="dt-ra" cast={CAST2.ra} pose={ra} x={-6} y={-4} s={s * 0.62} sec={{t}} bProp="ankh" fProp="was" propTop={-14.5} />
			</g>
		</Barque>
		<g transform={`translate(${bxW},${wl + 20 + 0.25 * s * Math.sin(t * 1.6)}) rotate(${1.2 * Math.sin(t * 1.1)})`}>
			<God id="dt-ani" cast={ANI} pose={ANI_POSES.kneel(t)} x={8.4 * s} y={-0.3 * s} s={s * 0.7} sec={{t}} />
		</g>
	</Stage60>;
};

/* ================= (d) the Hall of Two Truths [18–26]: lapis and gold, two rows of the 42 judges (one figure repeated) ================= */
export const HallSet: React.FC<SetP & {raise?: number}> = ({t, sub = {text: '[42]位神排排坐，等着你。'}, stamp}) => {
	const js = 10, dx = 84, rowA = 356, rowB = 612, n = 21, x0 = 110;
	const aniX = 250 + 36 * Math.max(0, t - 6), cam = camPath(t, [[0, 720, 486, 1], [12, 1500, 486, 1]]);
	const ani = ANI_POSES.kneel(t);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={0.4} stain={0.3} sub={sub} stamp={stamp} tags={[{x: 54, y: 170, text: '四十二判官'}, {x: aniX - 100, y: 650, text: '阿尼'}]}
		light={<>
			<Glow x={cam.x - 60} y={420} r={760} ry={420} c="gold" o={0.3} />
			<Glow x={aniX + 180} y={760} r={260} c="gold" o={0.45} />
			<Dust t={t} box={[cam.x - 760, 120, cam.x + 760, 840]} n={60} seed={12} c="#FFE2A0" o={0.55} />
		</>}>
		<Ceiling x0={-300} x1={2400} y0={PIC_T} y1={112} bg="#16214F" />
		<FeatherCornice x0={-300} x1={2400} y={126} s={0.95} t={t} />
		<JudgeDefs s={js} t={t} prefix="hj" />
		<JudgeRow x0={x0} gy={rowA} n={n} dx={dx} t={t} prefix="hj" s={js} seed={1} />
		<RegisterLine x0={-300} x1={2400} y={rowA + 14} h={12} />
		<JudgeRow x0={x0 + dx / 2} gy={rowB} n={n} dx={dx} t={t + 3} prefix="hj" s={js} seed={4} />
		<RegisterLine x0={-300} x1={2400} y={rowB + 14} h={12} />
		{/* the floor register: you kneel before the first judges, your oath rising as gold glyph columns */}
		{[-120, 2200].map((c) => <Column key={c} x={c} gy={GY} top={640} w={40} />)}
				<Balance p={{tilt: 1.5 * Math.sin(t * 0.8), plumb: 2 * Math.sin(t * 1.1)}} x={1060} y={GY} s={8.6} t={t} />
		<God id="hl-ani" cast={ANI} pose={ani} x={aniX} y={GY} s={12.5} sec={{t}} />
		<g opacity={cl(t / 1.5)}><GlyphColumns x={aniX + 120} y={656} cols={9} rows={4} cell={36} seed={41} mono="#E8B83E" /></g>
		<Dado x0={-300} x1={2400} y={GY} h={80} />
	</Stage60>;
};

/* ================= (e) the Field of Reeds [47–52]: canals, the harvest, the plough and oxen, the shabtis working, you resting ================= */
const FieldRows: React.FC<{x0: number; x1: number; y0: number; y1: number; t: number; seed?: number}> = ({x0, x1, y0, y1, t, seed = 1}) => {
	const R = rng(seed), out: React.ReactNode[] = [], rowH = 30;
	for (let j = 0, y = y0 + rowH; y <= y1; j++, y += rowH) for (let x = x0 + (j % 2) * 18; x < x1; x += 36) { const sw = 3 * Math.sin(t * 1.3 + x * 0.02 + j), k = R();
		out.push(<g key={`${j}.${x}`} transform={`translate(${x},${y})`}>
			<path d={`M0 0L${-13 + sw} -24L${-5 + sw} -27L0 -6L${5 + sw} -27L${13 + sw} -24Z`} fill={k < 0.5 ? '#3E8A4E' : '#5DA04E'} stroke={PAL.ink} strokeWidth={1.3} strokeLinejoin="round" />
			<path d={`M0 -2L${sw * 0.8} -30`} stroke="#2E6A3A" strokeWidth={1.6} />
			{k > 0.8 && <circle cx={sw * 0.8} cy={-31} r={3.2} fill="#7FA6E0" stroke={PAL.ink} strokeWidth={1} />}</g>); }
	return <g>{out}</g>;
};
export const ReedsSet: React.FC<SetP> = ({t, sub = {text: '你进入[芦苇之野]：完美版的埃及。'}, stamp}) => {
		const ph = t * 2.2, cut = cl(0.08 + t * 0.02, 0, 0.4), G1 = 552, ox = 640 + 14 * t, ophase = t * 3.4, OS = 17;
	const cam = camPath(t, [[0, 700, 486, 1], [8, 780, 486, 1.03]]);
		const yoke: V = [ox + 3.2 * OS, GY - 7.4 * OS], share: V = [ox - 9.5 * OS - 40, GY - 2], grip: V = [ox - 9.5 * OS - 130, GY - 122];
	const ploughX = ox - 9.5 * OS - 205;
	return <Stage60 t={t} cam={cam} grade="reeds" sub={sub} stamp={stamp} tags={[{x: 120, y: 262, text: '阿尼'}, {x: 1080, y: 560, text: '沙布提'}]}
		light={<>
			<Glow x={200} y={140} r={460} c="gold" o={0.7} />
			<Dust t={t} box={[0, 120, 1300, 840]} n={60} seed={14} c="#FFF0B0" o={0.6} vx={10} vy={-3} />
		</>}>
		{/* sky, sun, far bank with palms; the canal with you resting in a skiff */}
		<rect x={-100} y={PIC_T} width={1700} height={210} fill="#F4D98E" /><rect x={-100} y={PIC_T} width={1700} height={90} fill="#F0C870" opacity={0.6} />
				<circle cx={200} cy={140} r={92} fill="#FFE7A0" opacity={0.5} /><circle cx={200} cy={140} r={74} fill="#FFD27A" opacity={0.55} />
		<circle cx={200} cy={140} r={58} fill="#E8642A" stroke={PAL.ink} strokeWidth={3} /><circle cx={200} cy={140} r={44} fill="none" stroke={PAL.gold} strokeWidth={4} />
		{[340, 470, 640, 1120, 1260].map((x, i) => <Palm key={x} x={x} y={238} h={130 + (i % 2) * 34} t={t} seed={i} />)}
		<River x0={-100} x1={1700} y={236} h={52} t={t} />
						<g transform={`translate(${880 + 6 * t},${268 + 1.4 * Math.sin(t * 1.7)}) rotate(${1.5 * Math.sin(t * 1.2)})`}><God id="rd-rest" cast={ANI} pose={reclinePose(t)} x={-22} y={-2} s={5.4} sec={{t}} /></g>
		<Skiff x={880 + 6 * t} y={268} s={8} t={t} len={22} />
		{/* upper field: wheat being reaped */}
		<rect x={-100} y={288} width={1700} height={G1 - 288} fill="#4E8E48" />
		<FieldRows x0={-80} x1={1600} y0={288} y1={G1 - 6} t={t} seed={3} />
		<rect x={240} y={G1 - 210} width={720} height={210} fill="#D9A84A" opacity={0.0} />
		<Wheat x0={250} x1={960} y={G1} h={200} t={t} seed={3} cut={cut} dense={1.6} />
		{[0, 1].map((k) => <g key={k} transform={`translate(${60 + k * 60},${G1})`}><path d={sp([[-18, 0, 1], [18, 0, 1], [10, -50], [26, -110], [0, -96], [-26, -110], [-10, -50]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} /><rect x={-14} y={-56} width={28} height={8} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.4} /></g>)}
		<God id="rd-ani" cast={ANI} pose={ANI_POSES.harvest(ph)} x={214} y={G1} s={16} sec={{t}} bProp="none" fProp="sickle" />
		<Shabti x={1040} y={G1} s={11} t={t} p={{alive: 1, act: 'carry', ph: t * 4}} />
		<Shabti x={1140} y={G1} s={11} t={t} p={{alive: 1, act: 'carry', ph: t * 4 + 2}} />
		<River x0={-100} x1={1700} y={G1} h={44} t={t} speed={-12} />
		{/* lower field: you behind the plough and two oxen; the shabtis hoe, the overseer points */}
		<rect x={-100} y={G1 + 44} width={1700} height={GY - G1 - 44} fill="#7A9A44" />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-60 + i * 180} ${GY - 8}Q${30 + i * 180} ${GY - 26} ${120 + i * 180} ${GY - 8}`} fill="none" stroke="#4A3418" strokeWidth={4} opacity={0.55} />)}
		<PapyrusClump x={40} y={GY} h={150} t={t} n={8} />
				<Ox x={ox - 50} y={GY - 4} s={OS} ph={ophase + 1.4} t={t} hide="red" />
		<Plough yoke={yoke} share={share} grip={grip} />
		<Ox x={ox} y={GY} s={OS} ph={ophase} t={t} />
		<God id="rd-plough" cast={ANI} pose={ploughPose(ophase, [(grip[0] - ploughX) / 15, (grip[1] - GY) / 15])} x={ploughX} y={GY} s={15} sec={{t}} />
				{[880, 970, 1060].map((x, i) => <Shabti key={x} x={x} y={GY - 4} s={10.5} t={t} p={{alive: 1, act: 'hoe', ph: t * 3.2 + i * 1.3}} />)}
		<Shabti x={1170} y={GY - 4} s={12.5} t={t} p={{alive: 1, act: 'idle', ph: t * 3, overseer: true}} />
		<Dado x0={-100} x1={1700} y={GY} h={80} />
	</Stage60>;
};

/* ================= (f) insert [9, 34, 35]: the heart scarab on the mummy's chest, then its inscribed base ================= */
export const ScarabSet: React.FC<SetP> = ({t, sub = {text: '背面的咒语，专防心[告密]：'}, stamp}) => {
	const lift = sm(seg(t, 2.2, 3.4)), flip = sm(seg(t, 2.6, 3.6)), lines = seg(t, 3.6, 5.2), ring = sm(seg(t, 0.4, 1.4)) * (1 - sm(seg(t, 2.0, 2.6)));
	const cam = camPath(t, [[0, 720, 486, 1], [6, 760, 486, 1.06]]);
	const wraps: React.ReactNode[] = [];
	for (let i = -12; i < 40; i++) { const x0 = -200 + i * 52; wraps.push(<path key={'a' + i} d={`M${x0} ${PIC_T}L${x0 + 520} 1000`} stroke="#C9B88E" strokeWidth={16} opacity={0.6} />, <path key={'b' + i} d={`M${x0 + 520} ${PIC_T}L${x0} 1000`} stroke="#F2E9D2" strokeWidth={10} opacity={0.55} />); }
	const net: React.ReactNode[] = [];
	for (let i = 0; i < 18; i++) for (let j = 0; j < 9; j++) { const bx = -40 + i * 90 + (j % 2) * 45, by = 330 + j * 64;
				net.push(<g key={`${i}.${j}`}><path d={poly([[bx, by - 30], [bx + 42, by], [bx, by + 30], [bx - 42, by]])} fill="none" stroke={STONE.faience} strokeWidth={6} opacity={0.5} />
			<circle cx={bx} cy={by - 30} r={6} fill={j % 2 ? PAL.gold : PAL.red} stroke={PAL.ink} strokeWidth={1.4} /></g>); }
		return <Stage60 t={t} cam={cam} grade="tomb" bg="#E6D7B2" dark={0.3} darkC="#2A1206" sub={sub} stamp={stamp} tags={[{x: 300, y: 380, text: '心脏圣甲虫'}]}
		light={<>
			<Glow x={260} y={260} r={760} c="warm" o={0.75 + 0.1 * flick(t, 2)} />
			<Glow x={560} y={590} r={300} c="green" o={0.25 + 0.15 * lift} />
			{lines > 0 && <Glow x={1010} y={520} r={260} c="gold" o={0.4 * lines} />}
			{ring > 0 && <g style={{mixBlendMode: 'screen'}}><ellipse cx={560} cy={590} rx={210 + 30 * ring} ry={250 + 30 * ring} fill="none" stroke="#FFE7A0" strokeWidth={8} opacity={ring * 0.9} /><ellipse cx={560} cy={590} rx={210 + 30 * ring} ry={250 + 30 * ring} fill="none" stroke="#FFD060" strokeWidth={26} opacity={ring * 0.3} /></g>}
			<Dust t={t} box={[0, 100, 1300, 900]} n={50} seed={19} o={0.55} />
		</>}>
		<rect x={-200} y={PIC_T} width={1900} height={1000} fill="#E6D7B2" />
		{wraps}
		{[[PAL.gold, 0], [PAL.blue, 26], [PAL.red, 54], [PAL.green, 80], [PAL.gold, 108]].map(([c, o], i) => <path key={i} d={`M-200 ${70 + (o as number)}Q720 ${300 + (o as number)} 1700 ${70 + (o as number)}L1700 ${98 + (o as number)}Q720 ${328 + (o as number)} -200 ${98 + (o as number)}Z`} fill={c as string} stroke={PAL.ink} strokeWidth={2} opacity={0.92} />)}
		{net}
		<HeartScarab id="hs1" x={560} y={590} s={44} t={t} glint={0.9} />
		{lift > 0 && <g opacity={lift}>
			<path d={`M760 560Q860 ${520 - 60 * lift} 880 520`} fill="none" stroke={PAL.gold} strokeWidth={3} strokeDasharray="8 6" />
			<HeartScarab id="hs2" x={lerp(560, 1010, lift)} y={lerp(590, 520, lift)} s={44 * lerp(1, 1.06, lift)} flip={flip} t={t} lines={lines} glint={0.6} />
		</g>}
	</Stage60>;
};

/* ================= (g) Ammit devours [41–43]: a shadow play on the wall, the red flash, the second death ================= */
export const AmmitSet: React.FC<SetP> = ({t, sub = {text: '阿米特一口，[吞]掉你的心。'}, stamp}) => {
	const lunge = sm(seg(t, 0.2, 1.45)), snap = sm(seg(t, 1.42, 1.56)), flash = t < 1.52 ? 0 : Math.exp(-(t - 1.52) / 0.45) * sm(seg(t, 1.5, 1.6));
	const crumble = sm(seg(t, 1.7, 3.8));
	const pose = {lean: lerp(-2, 15, lunge) - 4 * snap, neck: lerp(0, 20, lunge) - 8 * snap, jaw: lerp(8, 40, lunge) * (1 - snap) + 1, tail: 14 * Math.sin(t * 2), breathe: 0.5 + 0.5 * Math.sin(t * 3)};
	const as = lerp(40, 50, lunge), ax = lerp(1150, 1110, lunge), ay = GY + 10;
	// the spiky mane outline in Ammit's neck frame (shadow only)
	const N = ammitSolve(pose).N, spikes = Array.from({length: 13}, (_, i) => { const a = (-150 + i * 22) * Math.PI / 180, r0 = 1.55, r1 = 2.55 + (i % 2) * 0.35, cxm = -0.55, cym = 0.15;
		return [[cxm + Math.cos(a - 0.12) * r0, cym + Math.sin(a - 0.12) * r0], [cxm + Math.cos(a) * r1, cym + Math.sin(a) * r1], [cxm + Math.cos(a + 0.12) * r0, cym + Math.sin(a + 0.12) * r0]] as V[]; });
	const jawTip: V = [ax - (lerp(5.2, 6.0, lunge)) * as * 1.0, ay - lerp(6.4, 7.6, lunge) * as];
		const heartP: V = [lerp(640, 790, lunge), lerp(430, 470, lunge) + 8 * Math.sin(t * 2.2)];
	const ani = ANI_POSES.judged(t), aniX = 120, aniTop = GY - 19.5 * 17, cutY = lerp(aniTop - 40, GY + 10, crumble);
	const R = rng(9);
	const ash = crumble > 0 && Array.from({length: 220}, (_, i) => { const y0 = lerp(aniTop, GY, R()), x0 = aniX - 40 + R() * 120, born = (y0 - aniTop) / (GY - aniTop), u = cl((crumble - born * 0.9) * 2.0 - R() * 0.15), hot = R() < 0.18, rr = 2 + R() * 5;
		return u > 0 && u < 1 ? <circle key={i} cx={x0 + u * (180 + R() * 320)} cy={y0 - u * (100 + R() * 220) + 30 * u * u} r={rr * (1 - 0.5 * u)} fill={hot ? '#FF9A40' : '#1A0606'} opacity={(1 - u) * (hot ? 1 : 0.85)} /> : null; });
	const cam = camPath(t, [[0, 720, 486, 1], [1.5, 700, 470, 1.06], [4, 690, 470, 1.08]]);
	return <Stage60 t={t} cam={cam} grade="blood" bg="#C9A27A" stain={0.5} sub={sub} stamp={stamp} tags={[{x: 1080, y: 120, text: '阿米特'}]}
		light={<>
			{/* the shadows cast on the wall (multiplied into the plaster) */}
			<g style={{mixBlendMode: 'multiply'}} opacity={0.94} filter="url(#sil60)">
				<g transform={`translate(${ax},${ay}) scale(${-as},${as})`}><g transform={mx(N)}>{spikes.map((p, i) => <path key={i} d={poly(p)} fill="#000" />)}</g></g>
				<Ammit pose={pose} x={ax} y={ay} s={as} face={-1} t={t} />
				<g clipPath="url(#aniCrumble)"><God id="am-ani" cast={ANI} pose={ani} x={aniX} y={GY} s={17} sec={{t}} /></g>
			</g>
			{ash}
			{/* the heart, lit, before the jaws */}
			{snap < 0.98 && <g opacity={1 - snap}><Glow x={heartP[0]} y={heartP[1] - 20} r={130} c="red" o={0.8} />
				<g transform={`translate(${heartP[0]},${heartP[1]}) scale(${34 * (1 - snap * 0.4)})`}><Heart c={{OW: 2.7 / 34, LW: 1.5 / 34}} /></g></g>}
			{/* the brazier that throws the shadows, in the foreground */}
			<Glow x={330} y={GY - 120} r={560} c="red" o={0.6 + 0.12 * flick(t, 4)} />
			<Glow x={330} y={GY - 140} r={220} c="warm" o={0.8 + 0.1 * flick(t, 6)} />
			<path d={poly([[270, GY + 80], [290, GY - 70], [370, GY - 70], [390, GY + 80], [372, GY + 80], [350, GY - 40], [310, GY - 40], [288, GY + 80]])} fill="#140404" />
			<path d={sp([[250, GY - 112, 1], [410, GY - 112, 1], [380, GY - 68], [280, GY - 68]], true, 0.2)} fill="#140404" />
						{[[282, 0.9], [306, 1.25], [332, 1.55], [356, 1.3], [380, 1.05], [400, 0.8]].map(([fx, fs], i) => <Flame key={i} x={fx} y={GY - 110} s={fs * (1 + 0.15 * Math.sin(t * 7 + i))} t={t} seed={i + 1} glow={0} />)}
			<Embers t={t} x={330} y={GY - 160} n={22} seed={21} h={440} spread={120} />
		</>}
		screen={<>
			<rect width={FW} height={1080} fill="#FF2A10" opacity={0.6 * flash} style={{mixBlendMode: 'screen'}} />
			<circle cx={jawTip[0] - 40} cy={jawTip[1] + 40} r={540} fill="url(#g60-white)" opacity={0.75 * flash} style={{mixBlendMode: 'screen'}} />
			{t > 2.0 && <rect width={FW} height={1080} fill="#000" opacity={0.25 * sm(seg(t, 2.0, 3.0))} />}
		</>}>
		<defs>
			<filter id="sil60" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.01  0 0 0 0 0.01  0 0 0 1 0" /><feGaussianBlur stdDeviation={2.5} /></filter>
			<clipPath id="aniCrumble"><rect x={-100} y={cutY} width={600} height={800} /></clipPath>
		</defs>
		<rect x={-200} y={PIC_T} width={1900} height={1000} fill="#B8664A" opacity={0.25} />
		<GlyphColumns x={60} y={100} cols={10} rows={4} cell={34} seed={51} />
		<Dado x0={-200} x1={1700} y={GY} h={80} />
	</Stage60>;
};

/* ================= (h) the scribe's stall [12–13]: ready-made Books of the Dead, the name left blank ================= */
export const MarketSet: React.FC<SetP> = ({t, sub = {text: '而且是[现货]：名字那里空着。'}, stamp}) => {
	const sx = 452, ph = t * 3;
	const cam = camPath(t, [[0, 720, 486, 1], [6, 760, 520, 1.08]]);
	let ani: Pose = {...POSES.rest, lean: 4, head: -2, rt: -6, at: 9, rk: 2, ak: 1};
	ani = wristTo(reach(ani, 'f', [6.0, -12.6 + 0.2 * Math.sin(t * 2)]), 'f', 100);
	ani = wristTo(holdAt(ani, 'b', [0.4, -1.0]), 'b', 10);
	return <Stage60 t={t} cam={cam} grade="papyrus" dark={0.12} sub={sub} stamp={stamp} tags={[{x: sx - 128, y: 470, text: '书吏'}, {x: 56, y: 380, text: '图图'}]}
		light={<>
			<Shaft pts={[[620, PIC_T], [960, PIC_T], [1000, GY], [560, GY]]} o={0.5} />
			<Dust t={t} box={[560, 120, 1020, 840]} n={50} seed={23} o={0.75} vx={-4} vy={5} />
			<Glow x={800} y={700} r={280} c="gold" o={0.35} />
		</>}>
		<rect x={-100} y={PIC_T} width={1700} height={GY - PIC_T} fill="#D9C08C" opacity={0.3} />
		<GlyphColumns x={60} y={240} cols={3} rows={3} cell={28} seed={61} />
		<rect x={1060} y={250} width={130} height={GY - 250} fill="#3A2416" opacity={0.85} />
		<path d={poly([[1050, 250], [1200, 250], [1200, 232], [1050, 232]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
		<Awning x0={150} x1={1010} y={200} gy={GY} t={t} />
		{/* sample sheets pinned under the awning */}
		{[260, 360, 460].map((x, i) => <g key={x} transform={`rotate(${2 * Math.sin(t * 1.3 + i)} ${x} 222)`}><line x1={x} x2={x} y1={210} y2={232} stroke={PAL.ink} strokeWidth={1.5} />
			<rect x={x - 34} y={232} width={68} height={92} fill="#EBD7A4" stroke={PAL.ink} strokeWidth={1.8} /><GlyphColumns x={x - 26} y={246} cols={3} rows={3} cell={18} seed={70 + i} /></g>)}
		<ScrollShelf x={770} y={260} w={240} h={290} rows={4} cols={3} />
		<path d={poly([[300, GY], [700, GY], [690, GY - 12], [310, GY - 12]])} fill={PAL.mat} stroke={PAL.ink} strokeWidth={2} />
		<God id="mk-scribe" cast={CAST2.scribe} pose={scribePose(ph, 2 * Math.sin(t * 0.5))} x={sx} y={GY - 10} s={18} sec={{t}} fProp="pen" />
		<ScrollRoll x={sx + 4.6 * 18} y={GY - 10 - 1.95 * 18} len={110} r={9} a={-6} />
		<OpenScroll x={600} y={586} w={400} h={232} t={t} blank={1} />
		<path d={poly([[640, GY], [660, GY], [660, 822], [640, 822]])} fill="#8A5A2E" /><path d={poly([[940, GY], [960, GY], [960, 822], [940, 822]])} fill="#8A5A2E" />
		<Basket x={318} y={GY} w={84} h={58} />
		{[0, 1, 2].map((k) => <ScrollRoll key={k} x={318 + (k - 1) * 16} y={GY - 64 - k * 6} len={66} r={8} a={-70 + k * 20} />)}
		<God id="mk-tutu" cast={CAST2.tutu} pose={tutuPose(t)} x={66} y={GY} s={16.5} sec={{t}} />
		<God id="mk-ani" cast={{...ANI, fHand: 'open'}} pose={ani} x={176} y={GY} s={16.5} sec={{t}} />
		<Lamp x={1124} y={GY} s={1.0} t={t} seed={8} />
		<Dado x0={-100} x1={1700} y={GY} h={80} />
	</Stage60>;
};

/* ================= Horus presents you to Osiris [45–46]: the shrine, Isis and Nephthys behind the throne ================= */
export const OsirisSet: React.FC<SetP> = ({t, sub = {text: '荷鲁斯牵你，去见[奥西里斯]。'}, stamp}) => {
		const S = 21, K = S / 25, X = (x: number) => 920 + (x - 1302) * K;
		const {lead, fol} = leadPair(0.5 + 0.5 * Math.sin(t * 2.2), S, 470, 220, GY);
	const os = mummyHandsPose({...POSES.throne, y: 5.95, head: 0.4 * Math.sin(t * 0.9)});
	const sis = (k: number): Pose => { let p: Pose = {...POSES.rest, lean: 1, rt: -4, at: 6, rk: 1, ak: 1, head: 0.5 * Math.sin(t + k)};
		p = wristTo(holdAt(p, 'f', [3.1, -5.2 + 0.1 * Math.sin(t * 1.3 + k)], true), 'f', 150, ); return wristTo(holdAt(p, 'b', [2.4, -4.6], true), 'b', 140); };
	const cam = camPath(t, [[0, 700, 486, 1], [6, 760, 486, 1.05]]);
	return <Stage60 t={t} cam={cam} grade="papyrus" sub={sub} stamp={stamp} tags={[{x: 600, y: 360, text: '荷鲁斯'}, {x: 860, y: 300, text: '奥西里斯'}, {x: 1226, y: 250, text: '伊西斯'}]}
		light={<>
			<Glow x={1090} y={560} r={420} c="gold" o={0.5} />
			<Shaft pts={[[960, PIC_T], [1200, PIC_T], [1240, GY], [880, GY]]} o={0.35} />
			<Dust t={t} box={[600, 160, 1260, 840]} n={50} seed={31} c="#FFE7A8" o={0.7} vx={-3} vy={-4} />
		</>}>
		<KhekherFrieze x0={-60} x1={1560} y={40} h={48} />
		<GlyphColumns x={60} y={106} cols={20} rows={3} cell={30} seed={45} />
		<RegisterLine x0={-60} x1={1560} y={232} h={14} />
		<GlyphColumns x={70} y={290} cols={4} rows={4} cell={30} seed={46} />
		<g transform={`translate(${X(1302)},${GY}) scale(${K}) translate(${-1302},${-GY})`}>
			<ShrineBack x={1302} y={GY} s={25} />
						<God id="os-neph" cast={{...CAST.isis, wings: false, crown: 'moon', skin: 'skinF'}} pose={sis(1)} x={1640} y={GY - SHRINE.plinth * 25} s={21} face={-1} sec={{t: t + 1}} />
			<God id="os-isis" cast={{...CAST.isis, wings: false}} pose={sis(0)} x={1580} y={GY - SHRINE.plinth * 25} s={21} face={-1} sec={{t}} />
			<Throne x={1412} y={GY - SHRINE.plinth * 25} s={25} />
			<God id="os-os" cast={CAST.osiris} pose={os} x={1497} y={GY - SHRINE.plinth * 25} s={25} face={-1} sec={{t}} />
			<ShrineFront x={1302} y={GY} s={25} t={t} />
		</g>
				<OfferingTable x={770} y={GY} s={15} t={t} />
		<God id="os-ani" cast={ANI} pose={fol} x={220} y={GY} s={S} sec={{t}} />
		<God id="os-horus" cast={{...CAST.horus, bHand: 'fist', fHand: 'fist'}} pose={lead} x={470} y={GY} s={S} sec={{t}} bProp="none" fProp="ankh" />
		<Dado x0={-60} x1={1560} y={GY} h={80} />
	</Stage60>;
};

/* ================= the 4:3 cast sheet (review) ================= */
export const CastSheet: React.FC<{t: number}> = ({t}) => {
	const s = 14.5, g1 = 470, g2 = 852;
	const {lead, fol} = leadPair(0.5 + 0.5 * Math.sin(t * 2.2), s, 1210, 1000, g1);
	return <Stage60 t={t} grade="plaster" sub={{text: '同一骨架：[亡者、妻子、祭司、书吏、沙布提]'}} stamp={{era: 'ep60 角色表', place: '4:3', src: '同一骨架 · 新姿态'}}
		tags={[{x: 40, y: 150, text: '行走'}, {x: 205, y: 240, text: '跪拜'}, {x: 372, y: 110, text: '举手'}, {x: 535, y: 150, text: '受审'}, {x: 690, y: 200, text: '收割'}, {x: 930, y: 110, text: '荷鲁斯引路'},
			{x: 40, y: 530, text: '图图'}, {x: 250, y: 540, text: '防腐祭司'}, {x: 520, y: 600, text: '书吏'}, {x: 1010, y: 560, text: '沙布提'}]}>
		<RegisterLine x0={-50} x1={1500} y={g1} h={12} />
		<God id="cs-walk" cast={ANI} pose={walkPose(t * 4)} x={110} y={g1} s={s} sec={{t}} />
		<God id="cs-kneel" cast={ANI} pose={ANI_POSES.kneel(t)} x={270} y={g1} s={s} sec={{t}} />
		<God id="cs-raise" cast={ANI} pose={ANI_POSES.raise(t, 1)} x={440} y={g1} s={s} sec={{t}} />
		<God id="cs-judged" cast={ANI} pose={ANI_POSES.judged(t)} x={600} y={g1} s={s} sec={{t}} />
		<God id="cs-harv" cast={ANI} pose={ANI_POSES.harvest(t * 2)} x={745} y={g1} s={s} sec={{t}} fProp="sickle" />
		<God id="cs-fol" cast={ANI} pose={fol} x={1000} y={g1} s={s} sec={{t}} />
		<God id="cs-lead" cast={{...CAST.horus, bHand: 'fist'}} pose={lead} x={1210} y={g1} s={s} sec={{t}} bProp="none" fProp="ankh" />
		<RegisterLine x0={-50} x1={1500} y={g2} h={12} />
		<God id="cs-tutu" cast={CAST2.tutu} pose={tutuPose(t)} x={130} y={g2} s={s * 1.15} sec={{t}} />
		<God id="cs-emb" cast={CAST2.embalmer} pose={tendPose([6, -9], [7.5, -11], t, 18)} x={330} y={g2} s={s * 1.15} sec={{t}} />
		<God id="cs-scribe" cast={CAST2.scribe} pose={scribePose(t * 3, 0)} x={600} y={g2} s={s * 1.15} sec={{t}} fProp="pen" />
		<ScrollRoll x={600 + 4.6 * s * 1.15} y={g2 - 1.95 * s * 1.15} len={90} r={8} a={-6} />
		<God id="cs-plough" cast={ANI} pose={ploughPose(t * 3, [5.2, -7.6])} x={770} y={g2} s={s} sec={{t}} />
		{[0, 1, 2, 3, 4].map((k) => <Shabti key={k} x={1000 + k * 64} y={g2} s={10} t={t} p={k === 0 ? {alive: 0} : k === 1 ? {alive: 0.55} : k === 2 ? {alive: 1, act: 'hoe', ph: t * 3} : k === 3 ? {alive: 1, act: 'march', ph: t * 4} : {alive: 1, act: 'idle', overseer: true, ph: t * 3}} />)}
	</Stage60>;
};
export const _keep = {Flame, Shaft, chain, Tm};

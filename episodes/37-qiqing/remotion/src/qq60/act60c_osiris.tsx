/* ep60 act C · the pass ending before the throne (shots 45–46): Horus walks you by the hand to Osiris enthroned (Isis and Nephthys
   behind), Thoth writes 「言语真实」 and Osiris lowers his crook in assent. Gold on lapis. */
import React from 'react';
import {God, CAST, Cast, Pose, POSES, solve, wristTo, holdAt, reach} from './rig60';
import {ShrineBack, ShrineFront, Throne, SHRINE, GlyphColumns, GLYPH_D} from './props60';
import {Stage60, KhekherFrieze, RegisterLine, Dado, Glow, Dust, Shaft, F_SERIF} from './frame60';
import {Ceiling} from './sets60';
import {ANI, walkPose, STRIDE} from './cast60';
import {thothPose, STILL} from './scene60';
import {wobIn, camE, bump, Sparkle, OsirisProps, ArmOver} from './act60c_common';
import {PAL, sp, poly, lerp, sm, cl, seg, ap, V} from './geo60';
import type {ShotProps} from './EP60';

const GY = 852;
/** the lapis wall of the hall: gold-star ceiling, khekher frieze, gold glyph columns, a register line */
const LapisWall: React.FC<{x0: number; x1: number}> = ({x0, x1}) => <g>
	<rect x={x0} y={-100} width={x1 - x0} height={GY + 100} fill="#16214F" />
	<Ceiling x0={x0} x1={x1} y0={-100} y1={92} bg="#141F52" />
	<KhekherFrieze x0={x0} x1={x1} y={92} h={44} />
	<g opacity={0.8}><GlyphColumns x={x0 + 120} y={156} cols={Math.floor((x1 - x0 - 200) / 37.5)} rows={2} cell={30} seed={45} mono="#E8B83E" /></g>
	<RegisterLine x0={x0} x1={x1} y={232} h={14} />
</g>;
/** Isis / Nephthys behind the throne: both hands raised to Osiris (one holds a sistrum) */
const sis = (t: number, k: number): Pose => { let p: Pose = {...POSES.rest, lean: 1, rt: -4, at: 6, rk: 1, ak: 1, head: 0.5 * Math.sin(t + k)};
	p = wristTo(holdAt(p, 'f', [3.1, -5.2 + 0.12 * Math.sin(t * 5 + k)], true), 'f', 150); return wristTo(holdAt(p, 'b', [2.4, -4.6], true), 'b', 140); };
/** Osiris on the throne, mummiform; nod 0..1 brings the crook hand forward and down, the head bows */
const osirisNod = (t: number, nod: number): Pose => {
	const p: Pose = {...POSES.throne, y: 5.95, head: 0.4 * Math.sin(t * 0.9) + 7 * nod, neck: 2 * nod};
	return wristTo(wristTo(holdAt(holdAt(p, 'f', [lerp(1.6, 2.8, nod), lerp(-5.35, -4.2, nod)]), 'b', [1.25, -4.55]), 'f', lerp(92, 64, nod)), 'b', 98);
};
const ISIS: Cast = {...CAST.isis, wings: false};
const NEPH: Cast = {...CAST.isis, wings: false, crown: 'moon'};
/** the shrine with Osiris, Isis and Nephthys at scale k (25 = the kit's size) with its front column at fx */
const Shrine: React.FC<{fx: number; S: number; t: number; nod?: number; sisters?: boolean}> = ({fx, S, t, nod = 0, sisters = true}) => {
	const X = (u: number) => fx + u * S, top = GY - SHRINE.plinth * S;
	return <g>
		<ShrineBack x={fx} y={GY} s={S} />
		{sisters && <><God id="c45neph" cast={NEPH} pose={sis(t, 1)} x={X(13.5)} y={top} s={S * 0.84} face={-1} sec={{t: t + 1}} />
			<God id="c45isis" cast={ISIS} pose={sis(t, 0)} x={X(11.1)} y={top} s={S * 0.84} face={-1} sec={{t}} fProp="sistrum" />
			<ArmOver cast={{...ISIS, fHand: 'fist'}} pose={sis(t, 0)} x={X(11.1)} y={top} s={S * 0.84} face={-1} side="f" only="hand" id="c45ih" /></>}
		<Throne x={X(4.4)} y={top} s={S} />
		<God id="c45os" cast={CAST.osiris} pose={osirisNod(t, nod)} x={X(7.8)} y={top} s={S} face={-1} sec={{t}} hide={{props: true}} />
		<OsirisProps id="c45op" pose={osirisNod(t, nod)} x={X(7.8)} y={top} s={S} face={-1} t={t} />
		<ShrineFront x={fx} y={GY} s={S} t={t} />
	</g>;
};

/* ======================= 45 · 「荷鲁斯牵你，去见[奥西里斯]。」 ======================= */
export const W45 = {om: Math.PI / 0.75, x0: 250, gap: 250, stride: 0.9};
/** Horus walks and leads you by the hand (both on a real walk cycle, the hands joined by IK); ph = walk phase */
const leadWalk = (ph: number, s: number, xL: number, xF: number): {lead: Pose; fol: Pose} => {
	let lead: Pose = {...walkPose(ph, {lean: 2, stride: W45.stride}), head: -2};
	let fol: Pose = walkPose(ph + Math.PI, {lean: 4, stride: W45.stride, head: 2});
	const ash = ap(solve(lead).bU, [0, 0]), ra = -34 * Math.PI / 180, handL: V = [ash[0] + Math.sin(ra) * 6.75, ash[1] + Math.cos(ra) * 6.75];
	const handW: V = [xL + handL[0] * s, GY + handL[1] * s];
	lead = wristTo(reach(lead, 'b', handL), 'b', -40);
	lead = wristTo(holdAt(lead, 'f', [5.2, -2.0]), 'f', 62);
	fol = wristTo(reach(fol, 'f', [(handW[0] - 0.55 * s - xF) / s, (handW[1] + 0.2 * s - GY) / s]), 'f', 82);
	return {lead, fol}; // the follower's free arm keeps its walk swing (raised, it came out of his wig)
};
const S45: React.FC<ShotProps> = ({t}) => {
	const S = 21, ph = W45.om * t, xL = W45.x0 + STRIDE * W45.stride * ph * S, xF = xL - W45.gap;
	const {lead, fol} = leadWalk(ph, S, xL, xF);
	const cam = camE(t, -0.4, 3.3, [640, 486, 1.0], [720, 470, 1.05]);
	const shim = bump(t, 0.1, 0.9);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={0.4} stain={0.3} wobble={wobIn(t)}
		tags={[{x: xL + 130, y: 330, text: '荷鲁斯'}, {x: 862, y: 290, text: '奥西里斯'}, {x: 1180, y: 160, text: '伊西斯'}]}
		light={<>
			<Glow x={1060} y={560} r={480} c="gold" o={0.6} />
			<Shaft pts={[[930, 40], [1200, 40], [1260, GY], [860, GY]]} o={0.4} />
			<Glow x={xL + 60} y={560} r={260} c="gold" o={0.3} />
			<Sparkle x={1088} y={520} r={44 * shim} rot={30 * t} />
			<Dust t={t} box={[300, 120, 1260, 840]} n={56} seed={45} c="#FFE7A8" o={0.75} vx={-3} vy={-5} />
		</>}>
		<LapisWall x0={-200} x1={1700} />
		<GlyphColumns x={60} y={290} cols={4} rows={4} cell={30} seed={46} mono="#E8B83E" />
		<Shrine fx={920} S={21} t={t} />
		<God id="c45ani" cast={ANI} pose={fol} x={xF} y={GY} s={S} sec={{t}} />
		<God id="c45hor" cast={{...CAST.horus, bHand: 'fist', fHand: 'fist'}} pose={lead} x={xL} y={GY} s={S} sec={{t}} bProp="none" fProp="ankh" />
		<Dado x0={-200} x1={1700} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 46 · 「托特记下：你“[言语真实]”。」 Thoth writes; the verdict glows gold; Osiris nods ======================= */
export const T46 = {write: [0.1, 0.95], glow: 1.05, nod: [1.25, 1.85]};
/** mꜣꜥ-ḫrw, "true of voice": the Ma'at feather, the oar, the man with his hand to his mouth (1 × 1 cells) */
const MAAKHERU = [
	GLYPH_D.feather.d,
	sp([[0.47, 0.06, 1], [0.55, 0.06, 1], [0.55, 0.62], [0.66, 0.74], [0.6, 0.96, 1], [0.42, 0.96, 1], [0.38, 0.74], [0.47, 0.62]], true, 0.16),
	sp([[0.24, 0.96, 1], [0.3, 0.66], [0.42, 0.52], [0.46, 0.34], [0.4, 0.2], [0.5, 0.08], [0.64, 0.14], [0.66, 0.28], [0.74, 0.3], [0.74, 0.38], [0.6, 0.42], [0.56, 0.56], [0.74, 0.7], [0.78, 0.96, 1]], true, 0.16),
];
const S46: React.FC<ShotProps> = ({t}) => {
	const wt = seg(t, T46.write[0], T46.write[1]), stroke = wt * 3, k = Math.floor(Math.min(2.999, stroke)), f = stroke - k;
	const penU = 0.35 + 0.42 * (k + sm(f)), lift = 0.07 * (1 - Math.cos(2 * Math.PI * stroke)) * (wt > 0 && wt < 1 ? 1 : 0) + 0.5 * sm(seg(t, T46.write[1], T46.write[1] + 0.25));
	const up = sm(seg(t, 1.2, 1.6));
	const th = thothPose({...STILL, thoth: {neck: lerp(4, -2, up), head: lerp(7, -6, up), penU, lift, lean: 3 + 0.5 * Math.sin(t * 1.3)}});
	const TX = 300, TS = 30, nod = sm(seg(t, T46.nod[0], T46.nod[1])) * (1 - 0.4 * sm(seg(t, 2.2, 2.6)));
	// the palette in the world (Thoth faces +1): grip of the back hand + the palette frame
	const g = solve(th.p), grip = ap(g.bH, [0.02, 0.6]), pc: V = [TX + (grip[0] + 1.45 * Math.cos(th.paletteA * Math.PI / 180)) * TS, GY + (grip[1] + 1.45 * Math.sin(th.paletteA * Math.PI / 180)) * TS];
	const gl = sm(seg(t, T46.glow - 0.1, T46.glow + 0.25)), rise = sm(seg(t, T46.glow, T46.glow + 0.6));
	// the verdict leaves the palette sideways first (away from his beak), then rises: it never crosses Thoth's head
	const vx = lerp(pc[0] + 40, 612, sm(Math.min(1, rise * 1.7))), vy = lerp(pc[1] - 30, 238, rise * rise);
	const cam = camE(t, 0, 2.7, [700, 486, 1.0], [660, 476, 1.06]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={0.4} stain={0.3}
		tags={[{x: 132, y: 300, text: '托特'}]}
		light={<>
			<Glow x={1010} y={560} r={420} c="gold" o={0.55 + 0.2 * nod} />
			<Glow x={vx} y={vy} r={160 + 200 * gl} c="gold" o={0.2 + 0.7 * gl} />
			{gl > 0 && <Sparkle x={vx + 130} y={vy - 70} r={70 * bump(t, T46.glow - 0.05, T46.glow + 0.7)} rot={25} />}
			<Dust t={t} box={[100, 120, 1260, 840]} n={50} seed={46} c="#FFE7A8" o={0.7} vx={-2} vy={-5} />
		</>}>
		<LapisWall x0={-200} x1={1700} />
		<Shrine fx={790} S={25} t={t} nod={nod} sisters={false} />
		<God id="c46th" cast={CAST.thoth} pose={th.p} x={TX} y={GY} s={TS} sec={{t}} bProp="palette" fProp="pen" paletteA={th.paletteA} />
		<ArmOver cast={CAST.thoth} pose={th.p} x={TX} y={GY} s={TS} side="f" only="hand" id="c46h" />
		{/* the verdict: three gold signs lifting off the palette */}
		{gl > 0 && <g transform={`translate(${vx},${vy}) scale(${lerp(0.35, 1, rise)})`} opacity={gl}>
			<rect x={-150} y={-80} width={300} height={160} rx={22} fill="#121A44" stroke="#F3C64E" strokeWidth={5} opacity={0.9} />
			<rect x={-138} y={-68} width={276} height={136} rx={14} fill="none" stroke="#F3C64E" strokeWidth={2} opacity={0.7} />
			{MAAKHERU.map((d, i) => <g key={i} transform={`translate(${-120 + i * 82},-66) scale(76)`}><path d={d} fill="#FFD86A" stroke={PAL.ink} strokeWidth={0.03} /></g>)}
			<text x={0} y={52} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={40} fill="#FFE7A0" letterSpacing="0.12em">言语真实</text>
		</g>}
		<Dado x0={-200} x1={1700} y={GY} h={80} />
	</Stage60>;
};

export const OSIRIS: Record<number, React.FC<ShotProps>> = {45: S45, 46: S46};
export const _keepO = {poly, cl, Shaft};

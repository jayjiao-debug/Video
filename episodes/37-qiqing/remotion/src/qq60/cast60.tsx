import React from 'react';
import {God, CAST, POSES, Cast, Pose, solve, reach, wristTo, holdAt, lerpPose, Sec, PropKind} from './rig60';
import {V, ap, sp, poly, PAL, lerp, sm, cl} from './geo60';

/* ep60 · 4:3 cast on the one god rig: the deceased Ani in new poses (walk cycle, kneel, raise arms, being judged, harvesting),
   his wife Tutu (sheer gown, perfume cone, sistrum + menat), the embalmer priest in an Anubis mask (human body, long kilt),
   Horus leading by the hand, a scribe seated cross-legged, the 42 judges, and the shabti figurines (own small rig) that come alive.
   Every pose is a function of time so weight shift, breathing and follow-through come for free (the rig's `sec.vel`). */

export const CAST2: Record<'tutu' | 'embalmer' | 'scribe' | 'ra' | 'judge' | 'priest', Cast> = {
	tutu: {name: 'Tutu', skin: 'skinF', skin2: 'gold2', head: 'human', wig: 'tri', wigColor: 'wigH', crown: 'cone', dress: 'gown', female: true, collar: 'plain', bHand: 'fist', fHand: 'fist', bProp: 'menat', fProp: 'sistrum'},
	embalmer: {name: 'Embalmer', skin: 'skinM', skin2: 'skinM2', head: 'jackal', headFill: 'jackal', headFill2: 'jackal2', wig: 'tri', wigColor: 'jackal', mask: true, crown: 'none', dress: 'longkilt', apron: false, collar: 'plain', bHand: 'open', fHand: 'open'},
	scribe: {name: 'Scribe', skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'none', crown: 'none', dress: 'kilt', apron: false, collar: 'plain', bHand: 'fist', fHand: 'fist', bProp: 'none', fProp: 'pen'},
	ra: {name: 'Ra', skin: 'skinM', skin2: 'skinM2', head: 'falcon', headFill: 'falcon', headFill2: 'falcon2', wig: 'tri', crown: 'sun', dress: 'kilt', tail: true, collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'ankh', fProp: 'was'},
	judge: {name: 'Judge', skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'none', fProp: 'knife'},
	priest: {name: 'Priest', skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'none', crown: 'none', dress: 'longkilt', apron: false, collar: 'plain', bHand: 'open', fHand: 'open'},
};
export const ANI: Cast = {...CAST.ani};

/* ---------------- poses (figure units: soles y = 0, faces +x) ---------------- */
/** a walk cycle: ph in radians (2π = two steps). Thighs swing, the swinging knee folds, arms counter-swing, the hips bob
    through the grounding solver; returns the pose and the distance (units) walked per radian. */
export const STRIDE = 9.6 / (2 * Math.PI);
export const walkPose = (ph: number, o: {lean?: number; stride?: number; arm?: number; head?: number} = {}): Pose => {
	const A = 17 * (o.stride ?? 1), s = Math.sin(ph), c = Math.cos(ph), arm = o.arm ?? 1;
	return {lean: (o.lean ?? 2.5) + 1.2 * Math.cos(2 * ph), neck: 0, head: (o.head ?? 0) - 1.0 * Math.cos(2 * ph),
		rt: -A * s, rk: 3 + 30 * Math.max(0, -c) ** 2, at: A * s, ak: 3 + 30 * Math.max(0, c) ** 2,
		bs: -4 + 15 * s * arm, be: 10 + 8 * Math.max(0, s) * arm, bw: 0, fs: 6 - 15 * s * arm, fe: 14 + 10 * Math.max(0, -s) * arm, fw: -6};
};
/** shoulder position helper (figure units) */
const shoulder = (p: Pose, side: 'b' | 'f', female = false): V => { const g = solve(p, female); return ap(side === 'b' ? g.bU : g.fU, [0, 0]); };
/** both hands raised before the face (adoration), any legs */
export const adoreArms = (p: Pose, female = false, k = 1): Pose => {
	const sh = shoulder(p, 'f', female);
	p = wristTo(reach(p, 'f', [sh[0] + 3.3 * k, sh[1] - 1.3 * k], female), 'f', 168);
	return wristTo(reach(p, 'b', [sh[0] + 2.4 * k, sh[1] - 0.5 * k], female), 'b', 160);
};
export const ANI_POSES = {
	/** kneeling on both knees, hands raised in adoration */
	kneel: (t = 0): Pose => adoreArms({...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 4 + 0.6 * Math.sin(t * 1.3), neck: 2, head: 1 + 0.8 * Math.sin(t * 1.1)}),
	/** standing, both arms raised high (praise / pleading) */
	raise: (t = 0, u = 1): Pose => { let p: Pose = {...POSES.rest, lean: -2 * u + 0.5 * Math.sin(t * 1.4), neck: -3 * u, head: -4 * u, rt: -6, at: 9, rk: 2, ak: 1};
		const sh = shoulder(p, 'f');
				p = wristTo(reach(p, 'f', [sh[0] + lerp(1.0, 3.3, u), sh[1] + lerp(6.5, -4.6, u)]), 'f', lerp(10, 158, u));
		return wristTo(reach(p, 'b', [sh[0] + lerp(-0.4, 2.4, u), sh[1] + lerp(6.5, -5.2, u)]), 'b', lerp(0, 160, u)); },
	/** being judged: upright, head bowed, hands folded before the belly, a slow anxious breath */
		judged: (t = 0): Pose => ({...POSES.rest, lean: 2 + 0.5 * Math.sin(t * 1.2), neck: 4, head: 8 + 1.2 * Math.sin(t * 0.9), rt: -4, at: 6, rk: 2, ak: 1,
		bs: -3, be: 8, bw: -4, fs: 5 + 0.8 * Math.sin(t * 1.2), fe: 12, fw: -6}),
	/** harvesting: bent at the hip, back hand gathers the stalks, the sickle sweeps (ph = cut cycle in radians) */
	harvest: (ph = 0): Pose => { const u = 0.5 - 0.5 * Math.cos(ph), cut = sm(cl(u * 1.4));
				let p: Pose = {lean: 30 + 3 * u, neck: 2, head: 6 + 2 * u, bs: 0, be: 0, bw: 0, fs: 0, fe: 0, fw: 0, rt: -16, rk: 20, at: 24, ak: 22};
		p = wristTo(reach(p, 'b', [7.3, -9.0 + 0.3 * u]), 'b', 95);
		return wristTo(reach(p, 'f', [lerp(8.2, 6.6, cut), lerp(-11.6, -8.6, cut)]), 'f', lerp(75, 25, cut)); },
	/** walking (being led): front hand reaching forward to the leader */
	walk: (ph = 0): Pose => walkPose(ph, {lean: 4, stride: 0.9}),
};
/** ploughing: walking behind the ard, both fists on the handles (grip in figure units) */
export const ploughPose = (ph: number, grip: V): Pose => {
	let p: Pose = {...walkPose(ph, {lean: 18, stride: 0.75, arm: 0}), neck: -2, head: 4};
	p = wristTo(reach(p, 'f', [grip[0] + 0.35, grip[1] - 0.2]), 'f', 100);
	return wristTo(reach(p, 'b', grip), 'b', 100); };
/** reclining in a boat, hands behind the head (pelvis at y units above the deck) */
export const reclinePose = (t = 0): Pose => {
	let p: Pose = {lean: -66 + 1.5 * Math.sin(t * 0.8), neck: 14, head: 10, bs: 0, be: 0, bw: 0, fs: 0, fe: 0, fw: 0, rt: 74, rk: 18, at: 82, ak: 30 + 4 * Math.sin(t * 0.6), y: 1.1};
	p = wristTo(holdAt(p, 'f', [-0.9, -7.9]), 'f', -160);
	return wristTo(holdAt(p, 'b', [-1.1, -7.6]), 'b', -150); };
/** Tutu: standing behind her husband, sistrum raised in the front hand, menat hanging from the back hand */
export const tutuPose = (t = 0): Pose => { let p: Pose = {...POSES.rest, lean: 3 + 0.4 * Math.sin(t * 1.2), neck: 1, head: 2, rt: -5, at: 7, rk: 2, ak: 1};
	const sh = shoulder(p, 'f', true);
	p = wristTo(reach(p, 'f', [sh[0] + 2.7, sh[1] + 0.2 + 0.25 * Math.sin(t * 4.5)], true), 'f', 4);
	return wristTo(reach(p, 'b', [sh[0] - 0.9, sh[1] + 6.6], true), 'b', 6); };
/** the embalmer bending over the bier, both hands reaching to points on the body (world → figure units handled by the caller) */
export const tendPose = (bTarget: V, fTarget: V, t = 0, lean = 22): Pose => {
	let p: Pose = {lean: lean + 1.5 * Math.sin(t * 1.1), neck: 6, head: 14 + 2 * Math.sin(t * 0.8), bs: 0, be: 0, bw: 0, fs: 0, fe: 0, fw: 0, rt: -12, rk: 8, at: 14, ak: 10};
	p = wristTo(reach(p, 'b', bTarget), 'b', 120);
	return wristTo(reach(p, 'f', fTarget), 'f', 112); };
/** a scribe seated cross-legged on the ground, papyrus on the lap, pen in the front hand (writing cycle ph) */
export const scribePose = (ph = 0, look = 0): Pose => {
	let p: Pose = {lean: -4 + 1.0 * Math.sin(ph * 0.25), neck: 8 + look, head: 14 + look * 0.5, bs: 0, be: 0, bw: 0, fs: 0, fe: 0, fw: 0, rt: 82, rk: 166, at: 76, ak: 160, rf: 92, af: 96, y: 1.5};
	p = wristTo(holdAt(p, 'b', [3.6, -0.6]), 'b', 92);
	const w = Math.sin(ph) * 0.35, lift = Math.max(0, Math.sin(ph * 3)) * 0.12;
	return wristTo(holdAt(p, 'f', [4.4 + w, -1.35 - lift]), 'f', 70); };
/** a leader striding with the back arm reaching back to hold a follower's hand (Anubis / Horus lead the deceased) */
export const leadPair = (step: number, sLead: number, xLead: number, xFol: number, gy: number): {lead: Pose; fol: Pose} => {
	let lead: Pose = {...POSES.walk, rt: -15 - 3 * step, at: 17 + 3 * step, head: -2, lean: 2};
	let fol: Pose = {...POSES.walk, rt: -14 + 2 * step, at: 15 - 2 * step, lean: 4, head: 2};
	const ash = ap(solve(lead).bU, [0, 0]), reachL = 6.75, ra = -34 * Math.PI / 180;
	const handL: V = [ash[0] + Math.sin(ra) * reachL, ash[1] + Math.cos(ra) * reachL], handW: V = [xLead + handL[0] * sLead, gy + handL[1] * sLead];
	lead = wristTo(reach(lead, 'b', handL), 'b', -40);
	lead = wristTo(holdAt(lead, 'f', [5.2, -2.0]), 'f', 62);
	fol = wristTo(reach(fol, 'f', [(handW[0] - 0.55 * sLead - xFol) / sLead, (handW[1] + 0.2 * sLead - gy) / sLead]), 'f', 82);
	const sh = ap(solve(fol).fU, [0, 0]);
	fol = wristTo(reach(fol, 'b', [sh[0] + 2.6, sh[1] - 1.0]), 'b', 166);
	return {lead, fol};
};
/** the judges' seated pose (mummiform, hands at the chest) */
export const judgePose = (p: Pose = {...POSES.throne, y: 5.95}): Pose => wristTo(wristTo(holdAt(holdAt(p, 'f', [1.6, -5.35]), 'b', [1.25, -4.55]), 'f', 92), 'b', 98);
export {lerpPose};

/** convenience: a cast member with a name, a pose and secondary motion */
export const Fig: React.FC<{id: string; cast: Cast; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; t?: number; vel?: Sec['vel']; bProp?: PropKind; fProp?: PropKind; paletteA?: number}> = ({id, cast, pose, x, y, s, face = 1, t = 0, vel, bProp, fProp, paletteA}) =>
	<God id={id} cast={cast} pose={pose} x={x} y={y} s={s} face={face} sec={{t, vel}} bProp={bProp} fProp={fProp} paletteA={paletteA} />;

/* =================== shabti: a small mummiform worker (faience), frontal, that comes alive ===================
   origin = centre of the base, units; ~9 tall. alive 0..1 (eyes open, arms free, feet out); act: hoe | carry | idle; ph = work cycle. */
export type ShabtiPose = {alive: number; act?: 'hoe' | 'carry' | 'idle' | 'march'; ph?: number; look?: number; overseer?: boolean};
const FA = {body: '#3FA6A0', body2: '#2D7F7A', hi: '#8FD6C6', ink: '#1C2326', wig: '#22303A'};
export const Shabti: React.FC<{x: number; y: number; s: number; p: ShabtiPose; t?: number; face?: 1 | -1}> = ({x, y, s, p, t = 0, face = 1}) => {
	const a = p.alive, ph = p.ph ?? 0, act = p.act ?? 'idle', lw = 1.6 / s;
	const hop = a * Math.max(0, Math.sin(ph)) * (act === 'carry' ? 0.45 : 0.25), squash = 1 - a * 0.06 * Math.cos(ph * 2), rock = a * (act === 'hoe' ? -6 * Math.sin(ph) : 3 * Math.sin(ph));
	const body = sp([[-1.05, 0, 1], [1.05, 0, 1], [1.15, -0.5], [1.0, -1.6], [1.12, -2.9], [1.3, -4.4], [1.75, -5.7], [1.8, -6.3], [0, -6.6], [-1.8, -6.3], [-1.75, -5.7], [-1.3, -4.4], [-1.12, -2.9], [-1.0, -1.6], [-1.15, -0.5]], true, 0.16);
	const wig = sp([[0, -9.3], [1.25, -9.0], [1.7, -8.1], [1.75, -6.9], [1.85, -5.7, 1], [1.05, -5.6, 1], [0.95, -6.6], [0, -6.9], [-0.95, -6.6], [-1.05, -5.6, 1], [-1.85, -5.7, 1], [-1.75, -6.9], [-1.7, -8.1], [-1.25, -9.0]], true, 0.16);
	const faceD = sp([[0, -8.75], [0.78, -8.35], [0.85, -7.5], [0.55, -6.85], [0, -6.65], [-0.55, -6.85], [-0.85, -7.5], [-0.78, -8.35]], true, 0.2);
	const eye = (ex: number) => <g><path d={`M${ex - 0.26} -7.85Q${ex} ${-8.05 - 0.1 * a} ${ex + 0.26} -7.85Q${ex} ${-7.7 + 0.05 * a} ${ex - 0.26} -7.85Z`} fill={a > 0.3 ? '#F8F3E7' : FA.ink} stroke={FA.ink} strokeWidth={lw} />
		{a > 0.3 && <circle cx={ex + 0.04 * (p.look ?? 0)} cy={-7.86} r={0.1} fill={FA.ink} />}<path d={`M${ex - 0.3} -8.18Q${ex} -8.32 ${ex + 0.3} -8.18`} fill="none" stroke={FA.ink} strokeWidth={lw * 1.3} /></g>;
	const glyphRows = [-1.2, -1.85, -2.5, -3.15, -3.8].map((yy, i) => <g key={yy}><line x1={-1.02} x2={1.02} y1={yy} y2={yy} stroke={FA.ink} strokeWidth={lw * 0.9} opacity={0.7} />
		{Array.from({length: 5}, (_, j) => <rect key={j} x={-0.85 + j * 0.36 + (i % 2) * 0.1} y={yy + 0.16} width={0.18 + ((i + j) % 3) * 0.05} height={0.3} rx={0.05} fill={FA.ink} opacity={0.55} />)}</g>);
	// arms: crossed at the chest when still; when alive the front arm swings a hoe or both hold a basket on the head
	const hoeA = act === 'hoe' ? lerp(-40, 70, 0.5 - 0.5 * Math.cos(ph)) : act === 'march' ? 150 + 4 * Math.sin(ph) : -20;
	const crossed = <g opacity={1 - a}>
		<path d={sp([[-1.5, -5.6], [0.6, -4.9], [0.9, -5.3], [-1.2, -6.05]])} fill={FA.body2} stroke={FA.ink} strokeWidth={lw} />
		<path d={sp([[1.5, -5.6], [-0.6, -4.9], [-0.9, -5.3], [1.2, -6.05]])} fill={FA.body} stroke={FA.ink} strokeWidth={lw} />
		{[-1, 1].map((sg) => <g key={sg}><circle cx={sg * 0.7} cy={-5.2} r={0.32} fill={FA.body} stroke={FA.ink} strokeWidth={lw} /><path d={`M${sg * 0.7} -5.2L${sg * 1.3} -7.0`} stroke={FA.ink} strokeWidth={lw * 2.4} /><path d={`M${sg * 1.3} -7.0L${sg * 1.85} -6.3`} stroke={FA.ink} strokeWidth={lw * 2.4} /></g>)}
	</g>;
	const armFree = a > 0 && <g opacity={a}>
		{act === 'carry' ? <>
			{[-1, 1].map((sg) => <path key={sg} d={sp([[sg * 1.55, -6.0], [sg * 2.2, -7.6], [sg * 1.6, -9.6], [sg * 1.25, -9.5], [sg * 1.7, -7.7], [sg * 1.2, -6.2]])} fill={FA.body} stroke={FA.ink} strokeWidth={lw} />)}
			<path d={sp([[-2.1, -9.4, 1], [2.1, -9.4, 1], [1.8, -10.8], [0, -11.2], [-1.8, -10.8]])} fill="#C08A3E" stroke={FA.ink} strokeWidth={lw} />
			{[-1.2, -0.4, 0.4, 1.2].map((xx) => <line key={xx} x1={xx} x2={xx * 0.9} y1={-9.45} y2={-10.9} stroke={FA.ink} strokeWidth={lw * 0.8} opacity={0.6} />)}
			<path d="M-1.5 -10.9Q0 -11.9 1.5 -10.9" fill="#E0C27A" stroke={FA.ink} strokeWidth={lw} />
		</> : p.overseer ? <>
			<path d={sp([[-1.55, -6.0], [-2.0, -4.6], [-1.6, -3.6], [-1.3, -3.7], [-1.6, -4.7], [-1.25, -5.8]])} fill={FA.body2} stroke={FA.ink} strokeWidth={lw} />
			<g transform={`translate(1.5,-5.9) rotate(${-110 - 25 * Math.max(0, Math.sin(ph))})`}>
				<path d={sp([[-0.3, 0], [0.3, 0], [0.32, 2.3], [-0.28, 2.3]])} fill={FA.body} stroke={FA.ink} strokeWidth={lw} />
				<circle cx={0} cy={2.45} r={0.36} fill={FA.body} stroke={FA.ink} strokeWidth={lw} />
				<path d={`M0 2.45L0.2 4.6`} stroke={FA.ink} strokeWidth={lw * 2.4} />
				<path d={`M0.2 4.6Q${1.2 + 0.6 * Math.sin(ph * 2)} 5.6 ${0.4 + Math.sin(ph * 2)} 6.6`} fill="none" stroke={FA.ink} strokeWidth={lw * 1.4} />
			</g>
		</> : <>
			<path d={sp([[-1.55, -6.0], [-2.0, -4.6], [-1.6, -3.6], [-1.3, -3.7], [-1.6, -4.7], [-1.25, -5.8]])} fill={FA.body2} stroke={FA.ink} strokeWidth={lw} />
			<g transform={`translate(1.5,-5.9) rotate(${-hoeA})`}>
				<path d={sp([[-0.3, 0], [0.3, 0], [0.32, 2.3], [-0.28, 2.3]])} fill={FA.body} stroke={FA.ink} strokeWidth={lw} />
				<circle cx={0} cy={2.45} r={0.36} fill={FA.body} stroke={FA.ink} strokeWidth={lw} />
				<g transform="translate(0,2.45) rotate(90)"><path d={poly([[-0.1, -0.12], [3.4, -0.12], [3.4, 0.12], [-0.1, 0.12]])} fill="#C08A3E" stroke={FA.ink} strokeWidth={lw} />
					<path d={sp([[3.2, -0.05, 1], [3.45, 0.1], [2.6, 1.8], [2.3, 2.15, 1], [2.25, 1.9], [2.95, 0.2]])} fill="#C08A3E" stroke={FA.ink} strokeWidth={lw} /></g>
			</g>
		</>}
	</g>;
	const feet = a > 0 && <g opacity={a}>{[-1, 1].map((sg) => { const st = act === 'idle' ? 0 : Math.sin(ph + (sg > 0 ? 0 : Math.PI)) * 0.35;
		return <ellipse key={sg} cx={sg * 0.55 + st * 0.3} cy={0.12 - Math.max(0, st) * 0.4} rx={0.55} ry={0.22} fill={FA.body2} stroke={FA.ink} strokeWidth={lw} />; })}</g>;
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<ellipse cx={0} cy={0.15} rx={1.4} ry={0.22} fill="#000" opacity={0.18 * (1 - hop)} />
		<g transform={`translate(0,${-hop}) rotate(${rock} 0 0) scale(1,${squash})`}>
			{feet}
			{act === 'carry' && a > 0 && null}
			<path d={body} fill={FA.body} stroke={FA.ink} strokeWidth={lw * 1.6} strokeLinejoin="round" />
			<path d={sp([[0.55, -0.3], [0.85, -1.6], [0.95, -2.9], [1.1, -4.3], [0.6, -4.3], [0.4, -2.9], [0.35, -1.6], [0.2, -0.3]])} fill={FA.hi} opacity={0.45} />
			{p.overseer ? <g><path d={poly([[-1.2, -4.3], [1.2, -4.3], [1.55, -1.6], [-1.55, -1.6]])} fill="#F3ECDC" stroke={FA.ink} strokeWidth={lw * 1.3} />
				<path d={poly([[-0.4, -4.3], [0.4, -4.3], [0.55, -1.7], [-0.55, -1.7]])} fill={FA.body2} stroke={FA.ink} strokeWidth={lw} /><rect x={-1.2} y={-4.55} width={2.4} height={0.35} fill="#C08A3E" stroke={FA.ink} strokeWidth={lw} /></g> : glyphRows}
			<path d={wig} fill={FA.wig} stroke={FA.ink} strokeWidth={lw * 1.6} strokeLinejoin="round" />
			{[-1.4, -1.1, 1.1, 1.4].map((xx) => <line key={xx} x1={xx} x2={xx * 1.05} y1={-8.0} y2={-5.9} stroke="#4A6070" strokeWidth={lw} />)}
			<path d={faceD} fill={FA.body} stroke={FA.ink} strokeWidth={lw * 1.3} />
			{eye(-0.38)}{eye(0.38)}
			<path d="M-0.06 -7.7L-0.12 -7.25L0.08 -7.22" fill="none" stroke={FA.ink} strokeWidth={lw * 0.9} />
			<path d={`M-0.22 -7.0Q0 ${-6.92 + 0.08 * a} 0.22 -7.0`} fill="none" stroke={FA.ink} strokeWidth={lw} />
			<path d="M-1.0 -5.85Q0 -5.2 1.0 -5.85" fill="none" stroke={FA.ink} strokeWidth={lw} />
			{crossed}{armFree}
		</g>
		{a > 0.05 && a < 0.95 && <circle cx={0} cy={-5} r={6 * (1 - a) + 2} fill="none" stroke="#BFF2E2" strokeWidth={lw * 3} opacity={Math.sin(a * Math.PI) * 0.8} />}
	</g>;
};

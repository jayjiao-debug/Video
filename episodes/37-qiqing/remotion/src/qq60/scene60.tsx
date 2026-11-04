import React from 'react';
import {AbsoluteFill} from 'remotion';
import {God, CAST, POSES, Ammit, AmmitPose, holdAt, wristTo, reach, penReach, Pose, solve, Cast} from './rig60';
import {Balance, balanceGeo, Mat, ShrineBack, ShrineFront, Throne, GlyphColumns, SHRINE, Gateway} from './props60';
import {TombWall, WallGrain, CartoucheSub, Stamp60, Seal60, GY, W, H} from './wall60';
import {V, ap, sm, seg, lerp, R as Rot, PAL} from './geo60';

/* ep60 look A key frames.
   Weighing: the deceased (Ani, white linen) watches; Anubis kneels at the balance steadying the plumb; Ammit sits on her mat under the
   feather pan; ibis-headed Thoth records with reed pen and palette; Osiris judges from his shrine. Everything is posed by joint angles
   + IK from one time-driven state, so the still (LOOKA) and the motion test (MOTIONA) are the same code. */
export const S = 25;
export const LAY = {ani: 250, post: 712, anubis: 566, ammit: 985, mat: [772, 1102] as V, thoth: 1218, shrine: 1302, throne: 1412, osiris: 1497};
const loc = (X: number, Y: number, ox: number, face: 1 | -1, oy = GY): V => [(X - ox) / (S * face), (Y - oy) / S];
const rotV = (deg: number, v: V): V => { const a = (deg * Math.PI) / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };

export type WState = {tilt: number; swingL: number; swingR: number; plumb: number; look: number;
	anubis: {lean: number; head: number}; thoth: {neck: number; head: number; penU: number; lift: number; lean: number};
	ammit: AmmitPose; ani: {lean: number; head: number}; osiris: {head: number}; cam: number};

/** the settled still: heart a touch heavier while the verdict is written */
export const STILL: WState = {tilt: 2.2, swingL: 0.4, swingR: -0.3, plumb: -0.6, look: -3,
	anubis: {lean: 5, head: -3}, thoth: {neck: 4, head: 5, penU: 0.9, lift: 0.0, lean: 3}, ammit: {lean: 2, neck: 2, jaw: 10, tail: 0, breathe: 0.4},
	ani: {lean: 7, head: 3}, osiris: {head: 0}, cam: 0};

/** 5 s motion test: the heart pan dips and settles level against the feather; Anubis steadies the plumb; Thoth looks up at the
    beam, turns down to his palette and writes; Ammit shifts her weight toward the heart and opens her jaws. */
export const stateAt = (t: number): WState => {
	const u = Math.max(0, t - 0.35), tilt = t < 0.35 ? 0 : 5.6 * Math.exp(-u / 1.2) * Math.sin((2 * Math.PI * u) / 2.4) + 0.0;
	const swing = t < 0.35 ? 0 : 1.6 * Math.exp(-u / 1.3) * Math.sin((2 * Math.PI * u) / 1.35) * sm(u / 0.25);
	const plumb = t < 0.35 ? 0 : -0.3 * tilt + 2.2 * Math.exp(-u / 0.8) * Math.sin((2 * Math.PI * u) / 1.05);
	// Thoth: looks up at the beam, then turns down to the palette (neck leads, head follows), writes three strokes, lifts the pen
	const down = sm(seg(t, 1.45, 2.25)), downH = sm(seg(t, 1.6, 2.45)), back = sm(seg(t, 4.35, 4.95));
	const neck = lerp(lerp(-2, 4, down), 1, back), head = lerp(lerp(-10, 6, downH), -2, back);
	const wt = seg(t, 2.45, 4.3), stroke = wt * 3, k = Math.floor(Math.min(2.999, stroke)), f = stroke - k;
	// pen: three strokes along the palette, continuous in position; it lifts a little between strokes and clear before/after
	const penU = 0.35 + 0.42 * (k + sm(f)), lift = 0.07 * (1 - Math.cos(2 * Math.PI * stroke)) * (wt > 0 && wt < 1 ? 1 : 0) + 0.55 * (1 - sm(seg(t, 2.25, 2.5))) + 0.55 * sm(seg(t, 4.3, 4.6));
	const heavy = Math.max(0, tilt) / 5.6;
	return {tilt, swingL: swing, swingR: -swing * 0.8, plumb, look: -3 - tilt * 1.2,
		anubis: {lean: 4.5 + 0.8 * Math.sin(t * 1.5) + heavy * 1.2, head: -4 - tilt * 0.7},
		thoth: {neck, head, penU, lift, lean: 3 + 0.5 * Math.sin(t * 1.3)},
		ammit: {lean: 0.8 + 3.2 * heavy + 0.9 * Math.sin((2 * Math.PI * t) / 2.8), neck: 1 + 4 * heavy + 1.2 * Math.sin(t * 1.9), jaw: 5 + 13 * Math.pow(heavy, 0.8) + 2 * Math.max(0, Math.sin(t * 2.6)), tail: 10 * Math.sin((2 * Math.PI * t) / 2.3), breathe: 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 1.9)},
		ani: {lean: 7 + 0.6 * Math.sin(t * 1.4), head: 3 + 0.8 * Math.sin(t * 1.1)}, osiris: {head: 0.4 * Math.sin(t * 0.9)}, cam: sm(t / 5)};
};

/* ---- poses from the state ---- */
const ANUBIS: Cast = {...CAST.anubis, bHand: 'open', fHand: 'open', bProp: 'none', fProp: 'none'};
const ANI: Cast = {...CAST.ani};
export const anubisPose = (st: WState): Pose => {
	const g = balanceGeo({tilt: st.tilt, plumb: st.plumb}), bob = g.bob, bobW: V = [LAY.post + bob[0] * S, GY + bob[1] * S];
	let p: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: st.anubis.lean, head: st.anubis.head, neck: 3};
	const b = loc(bobW[0], bobW[1], LAY.anubis, 1);
	p = wristTo(reach(p, 'f', [b[0] - 1.05, b[1] + 0.75]), 'f', 128);
	const knee = ap(solve(p).aS, [0, 0]);
	p = wristTo(reach(p, 'b', [knee[0] - 0.7, knee[1] - 0.95]), 'b', 96);
	return p;
};
export const thothPose = (st: WState): {p: Pose; paletteA: number} => {
	let p: Pose = {...POSES.write, lean: st.thoth.lean, neck: st.thoth.neck, head: st.thoth.head};
	p = wristTo(holdAt(p, 'b', [4.3, -5.0]), 'b', 100);
	const paletteA = -8, grip = ap(solve(p).bH, [0.02, 0.6]);
	const tip0 = rotV(paletteA, [1.45 + st.thoth.penU, -0.36 - st.thoth.lift]), tip: V = [grip[0] + tip0[0], grip[1] + tip0[1]];
	p = penReach(p, tip, 104);
	return {p, paletteA};
};
/** mummiform hands at the chest (crook and flail), for any base pose: seated or standing */
export const mummyHands = (p: Pose): Pose => wristTo(wristTo(holdAt(holdAt(p, 'f', [1.6, -5.35]), 'b', [1.25, -4.55]), 'f', 92), 'b', 98);
export const osirisPose = (st: WState): Pose => mummyHands({...POSES.throne, y: 5.95, head: st.osiris.head});
export const aniPose = (st: WState): Pose => {
	let p: Pose = {...POSES.adore, lean: st.ani.lean, head: st.ani.head};
	const g = solve(p), sh = ap(g.fU, [0, 0]);
	p = wristTo(reach(p, 'f', [sh[0] + 3.3, sh[1] - 1.3]), 'f', 168);
	p = wristTo(reach(p, 'b', [sh[0] + 2.3, sh[1] - 0.55]), 'b', 162);
	return p;
};

/* ---- the weighing scene ---- */
export const Weighing: React.FC<{st: WState; t: number; prev?: WState; sub?: string; furniture?: boolean}> = ({st, t, prev, sub = '你死后，[心脏]要放上天平。', furniture = true}) => {
	const vel = (a: number, b: number | undefined) => (b === undefined ? 0 : (a - b) * 30);
	const th = thothPose(st), ammitY = GY - 0.55 * S;
	const z = 1 + 0.035 * st.cam, cx = 900, cy = 640;
	return <AbsoluteFill style={{background: PAL.plaster}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
			<g transform={`translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})`}>
				<TombWall>
					<GlyphColumns x={142} y={270} cols={6} rows={4} cell={35} seed={3} />
					<GlyphColumns x={962} y={262} cols={4} rows={5} cell={33} seed={11} />
				</TombWall>
				<ShrineBack x={LAY.shrine} y={GY} s={S} />
				<Throne x={LAY.throne} y={GY - SHRINE.plinth * S} s={S} />
				<God id="osiris" cast={CAST.osiris} pose={osirisPose(st)} x={LAY.osiris} y={GY - SHRINE.plinth * S} s={S} face={-1} sec={{t}} />
				<ShrineFront x={LAY.shrine} y={GY} s={S} />
				<God id="ani" cast={ANI} pose={aniPose(st)} x={LAY.ani} y={GY} s={S} sec={{t, vel: {head: vel(st.ani.head, prev?.ani.head)}}} />
				<Balance p={{tilt: st.tilt, swingL: st.swingL, swingR: st.swingR, plumb: st.plumb, look: st.look}} x={LAY.post} y={GY} s={S} t={t} />
				<God id="anubis" cast={ANUBIS} pose={anubisPose(st)} x={LAY.anubis} y={GY} s={S} sec={{t, vel: {head: vel(st.anubis.head, prev?.anubis.head)}}} />
				<Mat x0={LAY.mat[0]} x1={LAY.mat[1]} y={GY} s={S} />
				<Ammit pose={st.ammit} x={LAY.ammit} y={ammitY} s={S} face={-1} t={t} />
				<God id="thoth" cast={CAST.thoth} pose={th.p} x={LAY.thoth} y={GY} s={S} face={-1} sec={{t, vel: {head: vel(st.thoth.head + st.thoth.neck, prev ? prev.thoth.head + prev.thoth.neck : undefined)}}} bProp="palette" fProp="pen" paletteA={th.paletteA} />
				<WallGrain />
			</g>
		</svg>
		{furniture && <><CartoucheSub text={sub} />
			<Stamp60 pre="约公元前" year="1250" post="年" place="古埃及 底比斯" note="亡灵书 · 阿尼纸草" />
			<Seal60 /></>}
	</AbsoluteFill>;
};

/* ---- A2: Anubis leads the deceased by the hand (Papyrus of Hunefer, EA 9901) toward the gate of the hall, where winged Ma'at
        kneels under a winged sun; the judges sit in the upper register ---- */
const MAAT: Cast = {...CAST.isis, name: 'Maat', crown: 'maat'};
const JUDGES: Cast[] = [
	{...CAST.ani, name: 'j1', wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', skin: 'skinM'},
	{...CAST.horus, crown: 'none', dress: 'mummy'}, {...CAST.ani, wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', skin: 'skinO', skin2: 'skinO2'},
	{...CAST.anubis, dress: 'mummy'}, {...CAST.ani, wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', skin: 'skinF', skin2: 'gold2'},
	{...CAST.thoth, crown: 'none', dress: 'mummy'}, {...CAST.ani, wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god'}];
export const ledState = (t: number) => ({t, step: 0.5 + 0.5 * Math.sin(t * 2.2)});
export const LedIn: React.FC<{t: number; sub?: string}> = ({t, sub = '阿努比斯牵着你，走进[审判厅]。'}) => {
	const RY = 392, S2 = 25, ax = 830, nx = 512, mx0 = 1325;
	const step = 0.5 + 0.5 * Math.sin(t * 2.2);
	// Anubis strides forward, his back arm reaching back almost straight to hold Ani's hand; ankh in his front hand
	let an: Pose = {...POSES.walk, rt: -15 - 3 * step, at: 17 + 3 * step, head: -2, lean: 2};
	let ani: Pose = {...POSES.walk, rt: -14, at: 15, lean: 4, head: 2};
	const ash = ap(solve(an).bU, [0, 0]), reachL = 6.75, ra = -34 * Math.PI / 180;
	const handL: V = [ash[0] + Math.sin(ra) * reachL, ash[1] + Math.cos(ra) * reachL], handW: V = [ax + handL[0] * S2, GY + handL[1] * S2];
	an = wristTo(reach(an, 'b', handL), 'b', -40);
	an = wristTo(holdAt(an, 'f', [5.2, -2.0]), 'f', 62);
	ani = wristTo(reach(ani, 'f', loc(handW[0] - 0.55 * S2, handW[1] + 0.2 * S2, nx, 1)), 'f', 82);
	const aniSh = ap(solve(ani).fU, [0, 0]);
	ani = wristTo(reach(ani, 'b', [aniSh[0] + 2.6, aniSh[1] - 1.0]), 'b', 166);
	// winged Ma'at kneeling at the gate, facing the procession, wings spread toward them
	let ma: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 3, head: 0, bs: 78, be: 6, bw: -14, fs: 104, fe: 4, fw: -18};
	const judges = JUDGES.slice(0, 6).map((cst, i) => ({cst, x: 1236 + i * 70}));
	return <AbsoluteFill style={{background: PAL.plaster}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
			<defs><linearGradient id="doorShade" x1="0" x2="1"><stop offset="0" stopColor="#7a5230" stopOpacity="0.28" /><stop offset="0.5" stopColor="#7a5230" stopOpacity="0.08" /><stop offset="1" stopColor="#7a5230" stopOpacity="0.28" /></linearGradient></defs>
			<TombWall>
				<GlyphColumns x={142} y={256} cols={20} rows={3} cell={34} seed={5} />
				<GlyphColumns x={150} y={452} cols={5} rows={8} cell={38} seed={17} />
			</TombWall>
			{/* upper register: the judges seated on a dais, each with the feather of Ma'at or an animal head */}
			<rect x={1196} y={RY - 18} width={470} height={18} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
			{judges.map(({cst, x}, i) => <g key={i}>
				<rect x={x - 12} y={RY - 18 - 40} width={46} height={40} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={2} />
				<God id={`j${i}`} cast={{...cst, bHand: 'fist', fHand: 'fist'}} pose={mummyHands({...POSES.throne, y: 5.95})} x={x} y={RY - 18} s={8.2} face={-1} sec={{t: t + i}} bProp="none" fProp="none" />
			</g>)}
			<rect x={25} y={RY} width={W - 50} height={12} fill={PAL.ink} /><rect x={25} y={RY + 3} width={W - 50} height={6} fill={PAL.blue} />
			<Gateway x0={1290} x1={1630} top={RY + 40} gy={GY} s={S2} t={t} />
			<God id="maat" cast={MAAT} pose={ma} x={mx0 + 90} y={GY} s={S2} face={-1} sec={{t}} />
			<God id="ani2" cast={ANI} pose={ani} x={nx} y={GY} s={S2} sec={{t}} />
			<God id="anubis2" cast={{...CAST.anubis, bHand: 'fist', fHand: 'fist'}} pose={an} x={ax} y={GY} s={S2} sec={{t}} bProp="none" fProp="ankh" />
			<WallGrain />
		</svg>
		<CartoucheSub text={sub} />
		<Stamp60 pre="约公元前" year="1275" post="年" place="古埃及 底比斯" note="亡灵书 · 胡内弗纸草" />
		<Seal60 />
	</AbsoluteFill>;
};

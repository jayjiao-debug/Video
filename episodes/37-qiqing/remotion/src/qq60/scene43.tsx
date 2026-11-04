import React from 'react';
import {God, CAST, POSES, Ammit, Cast, Pose, wristTo, holdAt} from './rig60';
import {Balance, Mat, ShrineBack, ShrineFront, Throne, GlyphColumns, SHRINE, Gateway} from './props60';
import {WState, STILL, stateAt, LAY, S as S1920, anubisPose, thothPose, osirisPose, aniPose} from './scene60';
import {Stage60, KhekherFrieze, RegisterLine, Dado, Glow, Dust, Embers, camPath, Sub, Stamp, Tag} from './frame60';
import {Torch, OfferingTable, JudgeDefs, JudgeRow} from './props60b';
import {leadPair, judgePose} from './cast60';
import {PAL} from './geo60';

/* ep60 · the two approved key scenes re-laid out for 4:3 (1440 × 1080).
   Weighing43: upper register = the great gods seated as judges (Papyrus of Ani), lower register = Ani · Anubis at the balance ·
   Ammit · Thoth · Osiris in his shrine, all inside the safe width (x < 1266). The lower register is the 1920 layout's own pose
   code drawn through one transform (k = 0.84 about the balance post), so LOOKA / MOTIONA stay the single source of motion.
   LedIn43: Anubis leads Ani by the hand toward the hall's gate where winged Ma'at kneels; the judges wait in the upper register. */
export const GY43 = 852;
const K = 0.84, POST43 = 520;
export const W43 = {k: K, post: POST43, x: (x: number) => POST43 + (x - LAY.post) * K, y: (y: number) => GY43 + (y - 932) * K, s: S1920 * K};
/* the great gods of the Papyrus of Ani's upper register: seated on block thrones, was-sceptre in the front hand, ankh on the knee */
const godM = (o: Partial<Cast>): Cast => ({...CAST.ani, wig: 'tri', collar: 'god', dress: 'kilt', apron: true, tail: false, bHand: 'fist', fHand: 'fist', ...o});
const godF = (o: Partial<Cast>): Cast => ({...CAST.isis, wings: false, bHand: 'fist', fHand: 'fist', ...o});
const ENNEAD: Cast[] = [
	{...CAST.horus, crown: 'sun', tail: false}, godM({name: 'atum', crown: 'pschent'}), godM({name: 'shu', crown: 'maat'}), godF({name: 'tefnut', crown: 'sun'}),
	godM({name: 'geb', crown: 'none', skin: 'skinO', skin2: 'skinO2'}), godF({name: 'nut', crown: 'none', dress: 'sheath'}), godF({name: 'isis', crown: 'isis'}),
	godF({name: 'nephthys', crown: 'moon'}), {...CAST.horus, tail: false}, godF({name: 'hathor', crown: 'isis', skin: 'skinM', skin2: 'skinM2'})];
const seatedGod = (t: number, i: number): Pose => { let p: Pose = {...POSES.throne, lean: -1, y: 5.95, head: 0.8 * Math.sin(t * 0.7 + i)};
	p = wristTo(holdAt(p, 'f', [2.75, -3.1]), 'f', 92);
	return wristTo(holdAt(p, 'b', [3.0, -0.2]), 'b', 4); };
/** the upper register: gods on thrones in a row facing the judge (right) */
export const Ennead: React.FC<{x0: number; gy: number; dx: number; s: number; t: number; n?: number}> = ({x0, gy, dx, s, t, n = ENNEAD.length}) => <g>
	<rect x={x0 - dx * 0.65} y={gy - 12} width={dx * (n + 0.2)} height={12} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
	{ENNEAD.slice(0, n).map((cst, i) => { const x = x0 + i * dx;
		return <g key={i}>
			<path d={`M${x - 1.6 * s - 4} ${gy - 12}L${x - 1.6 * s - 4} ${gy - 12 - 5.9 * s}L${x + 1.6 * s} ${gy - 12 - 5.9 * s}L${x + 1.6 * s} ${gy - 12}Z`} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={2} />
			<God id={`en${i}`} cast={cst} pose={seatedGod(t, i)} x={x} y={gy - 12} s={s} sec={{t: t + i}} bProp="ankh" fProp="was" propTop={-14.5} />
		</g>; })}
</g>;

export const Weighing43: React.FC<{st?: WState; t: number; prev?: WState; sub?: Sub; stamp?: Stamp; tags?: Tag[]; cam?: {x: number; y: number; z: number}}> = ({st = STILL, t, prev, sub = {text: '把你的[心]，和一根羽毛放上天平。'}, stamp = {era: '约公元前1250年', place: '底比斯', src: '《亡灵书》 阿尼纸草'}, tags, cam}) => {
	const vel = (a: number, b: number | undefined) => (b === undefined ? 0 : (a - b) * 30);
	const th = thothPose(st), GY = 932, S = S1920;
	const ANUBIS: Cast = {...CAST.anubis, bHand: 'open', fHand: 'open', bProp: 'none', fProp: 'none'};
	const camera = cam ?? camPath(t, [[0, 720, 486, 1], [5, 700, 500, 1.05]]);
	return <Stage60 t={t} cam={camera} grade="papyrus" sub={sub} stamp={stamp} tags={tags ?? [{x: 64, y: 470, text: '阿尼'}, {x: 592, y: 694, text: '阿米特'}]}
		light={<>
			<Glow x={40} y={612} r={260} c="warm" o={0.42} />
			<Glow x={W43.x(LAY.ammit)} y={760} r={190} c="red" o={0.12 + 0.18 * Math.max(0, st.ammit.jaw - 6) / 14} />
			<Dust t={t} box={[0, 300, 1300, 850]} n={46} seed={3} o={0.5} />
			<Embers t={t} x={40} y={600} n={9} seed={6} h={220} spread={16} />
		</>}>
		<KhekherFrieze x0={-60} x1={1560} y={40} h={48} />
		{/* upper register: the gods as judges, an offering table under the stamp */}
		<Ennead x0={76} gy={286} dx={84} s={8.2} t={t} />
		<OfferingTable x={1010} y={274} s={9} t={t} />
		<RegisterLine x0={-60} x1={1560} y={286} h={16} />
		<GlyphColumns x={56} y={322} cols={5} rows={3} cell={30} seed={3} />
		<GlyphColumns x={724} y={316} cols={3} rows={4} cell={29} seed={11} />
		{/* lower register: the 1920 layout's pose code through one transform */}
		<g transform={`translate(${POST43},${GY43}) scale(${K}) translate(${-LAY.post},${-GY})`}>
			<ShrineBack x={LAY.shrine} y={GY} s={S} />
			<Throne x={LAY.throne} y={GY - SHRINE.plinth * S} s={S} />
			<God id="w43os" cast={CAST.osiris} pose={osirisPose(st)} x={LAY.osiris} y={GY - SHRINE.plinth * S} s={S} face={-1} sec={{t}} />
			<ShrineFront x={LAY.shrine} y={GY} s={S} />
			<God id="w43ani" cast={CAST.ani} pose={aniPose(st)} x={LAY.ani} y={GY} s={S} sec={{t, vel: {head: vel(st.ani.head, prev?.ani.head)}}} />
			<Balance p={{tilt: st.tilt, swingL: st.swingL, swingR: st.swingR, plumb: st.plumb, look: st.look}} x={LAY.post} y={GY} s={S} t={t} />
			<God id="w43an" cast={ANUBIS} pose={anubisPose(st)} x={LAY.anubis} y={GY} s={S} sec={{t, vel: {head: vel(st.anubis.head, prev?.anubis.head)}}} />
			<Mat x0={LAY.mat[0]} x1={LAY.mat[1]} y={GY} s={S} />
			<Ammit pose={st.ammit} x={LAY.ammit} y={GY - 0.55 * S} s={S} face={-1} t={t} />
			<God id="w43th" cast={CAST.thoth} pose={th.p} x={LAY.thoth} y={GY} s={S} face={-1} sec={{t, vel: {head: vel(st.thoth.head + st.thoth.neck, prev ? prev.thoth.head + prev.thoth.neck : undefined)}}} bProp="palette" fProp="pen" paletteA={th.paletteA} />
		</g>
		<Torch x={34} y={GY43} s={0.9} t={t} seed={1} h={250} />
		<Dado x0={-60} x1={1560} y={GY43} h={80} />
	</Stage60>;
};
/** the 5 s motion of the approved test, in 4:3 */
export const Weighing43Motion: React.FC<{t: number}> = ({t}) => <Weighing43 st={stateAt(t)} prev={stateAt(t - 1 / 30)} t={t} />;

/* ---------------- led in ---------------- */
const MAAT: Cast = {...CAST.isis, name: 'Maat', crown: 'maat'};
export const LedIn43: React.FC<{t: number; sub?: Sub; stamp?: Stamp}> = ({t, sub = {text: '阿努比斯牵着你，走进[审判厅]。'}, stamp = {era: '约公元前1275年', place: '底比斯', src: '《亡灵书》 胡内弗纸草'}}) => {
	const S2 = 22, step = 0.5 + 0.5 * Math.sin(t * 2.2), ax = 492, nx = 222;
	const {lead, fol} = leadPair(step, S2, ax, nx, GY43);
	const ma: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 3, head: 0, bs: 78 + 4 * Math.sin(t * 1.4), be: 6, bw: -14, fs: 104 + 4 * Math.sin(t * 1.4 + 0.5), fe: 4, fw: -18};
	return <Stage60 t={t} cam={camPath(t, [[0, 700, 486, 1], [6, 760, 486, 1.04]])} grade="papyrus" sub={sub} stamp={stamp} tags={[{x: 128, y: 470, text: '胡内弗'}, {x: 690, y: 430, text: '阿努比斯'}]}
		light={<>
			<Glow x={1010} y={640} r={300} c="gold" o={0.38} />
			<Dust t={t} box={[820, 360, 1200, 850]} n={36} seed={8} o={0.65} vx={-8} vy={-6} />
			<Glow x={1222} y={600} r={220} c="warm" o={0.4} />
		</>}>
		<defs><linearGradient id="doorShade" x1="0" x2="1"><stop offset="0" stopColor="#7a5230" stopOpacity="0.28" /><stop offset="0.5" stopColor="#7a5230" stopOpacity="0.08" /><stop offset="1" stopColor="#7a5230" stopOpacity="0.28" /></linearGradient></defs>
		<KhekherFrieze x0={-60} x1={1560} y={40} h={48} />
		<JudgeDefs s={7.4} t={t} prefix="lj" />
		<JudgeRow x0={92} gy={284} n={15} dx={62} t={t} prefix="lj" s={7.4} />
		<RegisterLine x0={-60} x1={1560} y={298} h={16} />
		<GlyphColumns x={52} y={336} cols={4} rows={3} cell={32} seed={17} />
		<GlyphColumns x={300} y={336} cols={9} rows={1} cell={30} seed={5} />
		<Gateway x0={858} x1={1176} top={360} gy={GY43} s={S2} t={t} />
		<God id="li-maat" cast={MAAT} pose={ma} x={1078} y={GY43} s={S2} face={-1} sec={{t}} />
		<God id="li-ani" cast={CAST.ani} pose={fol} x={nx} y={GY43} s={S2} sec={{t}} />
		<God id="li-anubis" cast={{...CAST.anubis, bHand: 'fist', fHand: 'fist'}} pose={lead} x={ax} y={GY43} s={S2} sec={{t}} bProp="none" fProp="ankh" />
		<Torch x={1222} y={GY43} s={0.85} t={t} seed={4} h={260} />
		<Dado x0={-60} x1={1560} y={GY43} h={80} />
	</Stage60>;
};
export const _keep = {wristTo, holdAt};

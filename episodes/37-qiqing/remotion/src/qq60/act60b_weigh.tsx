import React from 'react';
import {God, CAST, Cast, Pose, POSES, reach, wristTo, holdAt, lerpPose, solve, AmmitPose} from './rig60';
import {Stage60, Glow, Dust, Embers, Stars, camPath, flick, rng, Cam} from './frame60';
import {Mat, GlyphColumns, BAL, balanceGeo} from './props60';
import {ANI, walkPose, STRIDE, adoreArms} from './cast60';
import {thothPose, STILL, WState} from './scene60';
import type {ShotProps} from './EP60';
import {up, hit, keys, bell, wearFor, figXY, InBone, placeBy, gripOf, GlyphStack, Ammit2, Balance2, panAt, HallWall, BaBird, Naos} from './act60b_kit';
import {V, PAL, poly, sp, lerp, cl, sm, seg, ap} from './geo60';

/* act60b · the weighing (shots 27–33): Anubis leads you in and steadies the plumb, heart and feather, Ma'at, Thoth and his baboon,
   Ammit (croc head, lion mane, hippo rump), Shai your Fate watching, the pans start to wobble. Lapis with a red rim.
   One world for all seven shots: the balance stands at BX on the floor GY. Sound-event times: episodes/60-xinzang/sync60_b.md. */
const GY = 852, BX = 760, BS = 32;
const c_ = (s: number) => ({OW: 2.7 / s, LW: 1.5 / s});
const ANUBIS: Cast = {...CAST.anubis, bHand: 'open', fHand: 'open', bProp: 'none', fProp: 'none'};
const MAAT: Cast = {...CAST.isis, name: 'Maat', crown: 'maat', wings: false};
const THOTH: Cast = {...CAST.thoth};
const Room: React.FC<{t: number; red?: number}> = ({t}) => <g>
	<HallWall x0={-500} x1={2100} t={t} ceil={-60} glyphY={140} />
	{[[60, 300], [1300, 300]].map(([x, y], i) => <g key={i} opacity={0.75}><GlyphColumns x={x} y={y} cols={4} rows={4} cell={34} seed={270 + i} mono="#C9A23E" /></g>)}
</g>;
/** Anubis kneeling at the post, front hand to the plumb-bob (the kit's anubisPose for any balance placement); bob in world px */
const kneelAt = (bob: V, ax: number, as: number, lean = 5, head = -4): Pose => {
	let p: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean, head, neck: 3};
	const b: V = [(bob[0] - ax) / as, (bob[1] - GY) / as];
	p = wristTo(reach(p, 'f', [b[0] - 1.05, b[1] + 0.75]), 'f', 128);
	const knee = ap(solve(p).aS, [0, 0]);
	return wristTo(reach(p, 'b', [knee[0] - 0.7, knee[1] - 0.95]), 'b', 96);
};
/** a leader walking with his back hand reaching back; the follower's front hand holds it (both walk cycles) */
const leadWalk = (phL: number, phF: number, s: number, xL: number, xF: number): {lead: Pose; fol: Pose} => {
	let lead = walkPose(phL, {lean: 2, arm: 0.6});
	const sh = ap(solve(lead).bU, [0, 0]), ra = -34 * Math.PI / 180, hand: V = [sh[0] + Math.sin(ra) * 6.75, sh[1] + Math.cos(ra) * 6.75];
	lead = wristTo(reach(lead, 'b', hand), 'b', -40);
	lead = wristTo(holdAt(lead, 'f', [3.0, -0.2 + 0.2 * Math.sin(phL)]), 'f', 14);
	const hw: V = [xL + hand[0] * s, GY + hand[1] * s];
	let fol = walkPose(phF, {lean: 4, arm: 0.5});
	fol = wristTo(reach(fol, 'f', [(hw[0] - 0.55 * s - xF) / s, (hw[1] + 0.2 * s - GY) / s]), 'f', 82);
	return {lead, fol};
};

/* ================= 27 · 74.5–77.5 · low angle: Anubis leads you in by the hand, kneels, steadies the plumb-bob with one finger ================= */
export const S27 = {om: 7.1, ph0: 0.4, stop: 1.1, kneel: [1.1, 1.55], ticks: [1.0, 1.5, 1.95], touch: 2.15};
const plumb27 = (t: number) => { // bounces off the post at each tick (−4.7°), damped by the finger after `touch`
	const T_ = S27.ticks, out = [-1.2, 7.5, 5.8, 3.6];
	if (t < T_[0]) { const u = cl((t + 0.6) / (T_[0] + 0.6)); return lerp(out[0], -4.7, u) + 8 * Math.sin(Math.PI * u) * 0.9; }
	for (let i = 0; i < T_.length; i++) { const a = T_[i], b = T_[i + 1] ?? S27.touch + 0.15; if (t < b) { const u = (t - a) / (b - a); return -4.7 + (out[i + 1] + 4.7) * Math.sin(Math.PI * u) * (i === T_.length - 1 ? Math.exp(-u * 1.5) : 1); } }
	return -4.7 * Math.exp(-(t - S27.touch - 0.15) / 0.18);
};
export const Shot27: React.FC<ShotProps> = ({t}) => {
	const as = 26, D = 12.3 * as, om = S27.om, tw = Math.min(t, S27.stop);
	const xL0 = BX - 160 - STRIDE * as * om * S27.stop, xL = xL0 + STRIDE * as * om * tw, xF = xL - D;
	const phL = om * tw + S27.ph0, phF = phL + Math.PI / 2;
	const pl = plumb27(t), tilt = 0.8 * Math.sin(t * 2.1) * (1 - up(t, S27.touch, 0.5)), bal = {tilt, swingL: 1.2 * Math.sin(t * 2.6), swingR: -Math.sin(t * 2.6), plumb: pl};
	const P = panAt(bal, BX, GY, BS);
	const {lead, fol} = leadWalk(phL, phF, as, xL, xF);
	const k = up(t, S27.kneel[0], S27.kneel[1] - S27.kneel[0]), fin = up(t, S27.touch - 0.3, 0.3);
	const bobReach: V = fin > 0 ? P.bob : [lerp(P.bob[0] - 40, P.bob[0], 0), P.bob[1] + 60];
	const kn = kneelAt(bobReach, xL, as, 5 + 1.5 * Math.sin(t * 1.5), -6 + 3 * fin);
	const anubis = k > 0 ? lerpPose(lead, kn, k) : lead;
	const adore = up(t, S27.stop, 0.4), aniStand = adoreArms({...POSES.adore, lean: 7 + 0.6 * Math.sin(t * 1.4), head: 3}, false, 1);
	const ani = adore > 0 ? lerpPose(fol, aniStand, adore) : fol;
	const tick = Math.max(...S27.ticks.map((x) => hit(t, x, 0.12, 0.03)));
	const cam = camPath(t, [[-0.4, BX - 300, 476, 1.0], [3.3, BX - 170, 452, 1.08]]);
	const head = figXY(anubis, xL, GY, as, 1, 'head', [0.3, -3.2]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#17224F" wear={wearFor(cam.z, 0.3)} stain={0.24} tags={[{x: xL - 2.3 * as, y: GY - 23.5 * as, text: '阿努比斯', size: 38}]}
		light={<>
			<Glow x={BX} y={300} r={520} c="gold" o={0.34} />
			<Glow x={BX + 300} y={GY - 60} r={360} c="red" o={0.28} />
			<Glow x={P.bob[0]} y={P.bob[1]} r={90} c="white" o={0.5 * tick} />
			<Dust t={t} box={[BX - 900, 60, BX + 700, 860]} n={44} seed={271} c="#FFE2A0" o={0.55} />
		</>}>
		<Room t={t} />
		<Balance2 p={{...bal, tick, heartO: 0, featherO: 0}} x={BX} y={GY} s={BS} t={t} />
		<God id="b27ani" cast={ANI} pose={ani} x={xF} y={GY} s={as} sec={{t}} />
		<God id="b27an" cast={ANUBIS} pose={anubis} x={xL} y={GY} s={as} sec={{t}} />
	</Stage60>;
};

/* ================= 28 · 77.5–80.4 · symmetric: the heart settles on the left pan, the feather on the right; Ma'at fades in behind the feather ================= */
export const S28 = {heart: [0.0, 0.4], feather: [0.35, 1.0], maat: [1.2, 2.1]};
export const Shot28: React.FC<ShotProps> = ({t}) => {
	const hU = cl((t - S28.heart[0]) / (S28.heart[1] - S28.heart[0])), fU = cl((t - S28.feather[0]) / (S28.feather[1] - S28.feather[0]));
	const kL = hit(t, S28.heart[1], 0.35), kR = hit(t, S28.feather[1], 0.35);
	const bal = {tilt: 1.6 * kL * Math.sin((t - S28.heart[1]) * 14) - 1.0 * kR * Math.sin((t - S28.feather[1]) * 14) + 0.3 * Math.sin(t * 1.3),
		swingL: 2 * kL * Math.sin((t - S28.heart[1]) * 11), swingR: -1.6 * kR * Math.sin((t - S28.feather[1]) * 11),
		heartDy: -7 * (1 - hU * hU), featherDy: -7.5 * (1 - fU), featherRot: 24 * (1 - fU) * Math.sin(fU * 9), featherDx: 1.2 * (1 - fU) * Math.sin(fU * 7), plumb: 0.6 * Math.sin(t * 1.7)};
	const z = keys(t, [[0, 1.4], [2.9, 1.5]]), cam: Cam = {x: BX + (720 - 633) / z, y: 336, z};
	const maat = up(t, S28.maat[0], S28.maat[1] - S28.maat[0]), mx_ = BX + BAL.half * BS + 50, ms = 30;
	let mp: Pose = {...POSES.rest, lean: 1, head: -1 + 0.5 * Math.sin(t), rt: -4, at: 6, rk: 1, ak: 1};
	mp = wristTo(holdAt(mp, 'f', [3.0, -5.6], true), 'f', 150); mp = wristTo(holdAt(mp, 'b', [2.2, -5.0], true), 'b', 140);
	const tag = figXY(mp, mx_, GY, ms, -1, 'head', [-2.2, -3.6], true);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#17224F" wear={wearFor(z, 0.3)} stain={0.2} tags={maat > 0.3 ? [{x: Math.min(tag[0] + 30, cam.x + (1210 - 720) / z), y: tag[1], text: '玛阿特', size: 40, o: up(maat, 0.3, 0.4)}] : []}
		light={<>
			<Glow x={BX} y={250} r={500} c="gold" o={0.3} />
			<Glow x={BX - BAL.half * BS} y={400} r={130 + 40 * kL} c="red" o={0.55 + 0.3 * kL} />
			<Glow x={mx_} y={320} r={300} c="white" o={0.32 * maat} />
			<Glow x={BX} y={GY} r={600} c="red" o={0.2} />
			<Dust t={t} box={[BX - 500, 0, BX + 520, 700]} n={40} seed={281} c="#FFE2A0" o={0.55} vx={-3} vy={-4} />
		</>}>
		<Room t={t} />
		<g opacity={0.9 * maat}><God id="b28maat" cast={MAAT} pose={mp} x={mx_} y={GY} s={ms} face={-1} sec={{t}} /></g>
		<Balance2 p={bal} x={BX} y={GY} s={BS} t={t} />
	</Stage60>;
};

/* ================= 29 · 80.4–82.8 · Thoth wets his reed pen and makes the first stroke; the baboon on the post watches ================= */
export const S29 = {dip: 0.5, scratch: 1.35};
export const Shot29: React.FC<ShotProps> = ({t}) => {
	const ts = 34, tx = BX + 620;
	const dipU = keys(t, [[0.1, 0.5], [0.42, -0.05], [S29.dip, -0.18], [0.75, 0.55], [1.25, 0.35], [S29.scratch, 0.0], [1.7, 0.0], [1.95, 0.45]]);
	const penU = keys(t, [[0.15, -0.2], [0.42, -1.25], [0.75, -1.25], [1.25, 0.25], [S29.scratch, 0.3], [1.7, 0.85], [2.0, 0.9]]);
	const look = up(t, 1.9, 0.4);
	const st: WState = {...STILL, thoth: {neck: lerp(5, -2, look), head: lerp(9, -8, look), penU, lift: dipU, lean: 3 + 0.4 * Math.sin(t * 1.3)}};
	const th = thothPose(st);
	const cam = camPath(t, [[0, BX + 430, 330, 1.12], [2.8, BX + 455, 320, 1.17]]);
	const grip = gripOf(th.p, 'b'), wellW: V = [tx - grip[0] * ts, GY + grip[1] * ts];
	const ripple = hit(t, S29.dip, 0.4), scr = cl((t - S29.scratch) / 0.35);
	const pa = th.paletteA * Math.PI / 180, pal = (u: number, v: number): V => { const x = grip[0] + Math.cos(pa) * (1.45 + u) - Math.sin(pa) * v, y = grip[1] + Math.sin(pa) * (1.45 + u) + Math.cos(pa) * v; return [tx - x * ts, GY + y * ts]; };
	const s0 = pal(0.3, -0.36), s1 = pal(lerp(0.3, 0.85, scr), -0.36);
	const tag = figXY(th.p, tx, GY, ts, -1, 'head', [-1.8, -3.6]);
	const bal = {tilt: 0.4 * Math.sin(t * 1.2), swingL: 0.5 * Math.sin(t * 1.5), swingR: -0.4 * Math.sin(t * 1.5), plumb: 0.5 * Math.sin(t * 1.8), baboonFace: 1 as const, look: lerp(-4, 14, up(t, 0.3, 0.5)) - 8 * look};
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#17224F" wear={wearFor(cam.z, 0.3)} stain={0.22} tags={[{x: tag[0] + 30, y: tag[1], text: '托特', size: 42}]}
		light={<>
			<Glow x={tx - 60} y={300} r={420} c="gold" o={0.32} />
			<Glow x={wellW[0]} y={wellW[1] - 20} r={70} c="white" o={0.6 * ripple} />
			<Glow x={s1[0]} y={s1[1]} r={60} c="gold" o={0.7 * bell(t, S29.scratch - 0.05, S29.scratch + 0.5)} />
			<Glow x={BX} y={120} r={200} c="gold" o={0.3} />
			<Dust t={t} box={[BX - 300, 0, BX + 900, 860]} n={40} seed={291} c="#FFE2A0" o={0.55} />
		</>}>
		<Room t={t} />
		<Balance2 p={bal} x={BX} y={GY} s={BS} t={t} />
		<God id="b29th" cast={THOTH} pose={th.p} x={tx} y={GY} s={ts} face={-1} sec={{t}} bProp="palette" fProp="pen" paletteA={th.paletteA} />
		{scr > 0 && <path d={`M${s0[0]} ${s0[1]}L${s1[0]} ${s1[1] + 2 * Math.sin(scr * 12)}`} stroke="#1A1410" strokeWidth={4} strokeLinecap="round" />}
		{ripple > 0.02 && <ellipse cx={wellW[0]} cy={wellW[1] - 6} rx={14 + 26 * (1 - ripple)} ry={5 + 8 * (1 - ripple)} fill="none" stroke="#DDEBFF" strokeWidth={3} opacity={ripple} />}
	</Stage60>;
};

/* ================= 30 · 82.8–85.5 · BLOOD-RED rim light: Ammit crouches under the balance, tail swishing, eyes on your heart ================= */
export const S30 = {growl: 0.45, scrape: 1.55};
const ammitP = (t: number, o: Partial<AmmitPose> = {}): AmmitPose => ({lean: 1 + 0.6 * Math.sin(t * 2.1), neck: 9 + 1.2 * Math.sin(t * 1.7), jaw: 4 + 2 * Math.max(0, Math.sin(t * 2.6)), tail: 18 * Math.sin(t * 3.0), breathe: 0.5 + 0.5 * Math.sin(t * 3.2), ...o});
export const Shot30: React.FC<ShotProps> = ({t}) => {
	const s = 42, ax = BX + 330, BS = 36, g = hit(t, S30.growl, 0.5, 0.1), scr = keys(t, [[S30.scrape - 0.12, 0], [S30.scrape + 0.12, -0.7], [2.3, -0.7], [2.6, 0]]);
	const tremble = g * Math.sin(t * 60) * 0.8;
	const pose = ammitP(t, {jaw: 4 + 16 * g, lean: 1 + 2.5 * g + tremble, neck: 15 + 3 * g + tremble, paw: scr});
	const bal = {tilt: 0.5 * Math.sin(t * 1.1), swingL: 0.6 * Math.sin(t * 1.4), swingR: -0.5 * Math.sin(t * 1.4), plumb: 0.6 * Math.sin(t * 1.7)};
	const P = panAt(bal, BX, GY, BS);
	const cam = camPath(t, [[0, BX + 20, 540, 1.04], [2.9, BX + 50, 548, 1.12]]);
	const scrapeK = up(t, S30.scrape, 0.2), pawX = ax - (3.35 + 1.0) * s;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#120C2E" wear={wearFor(cam.z, 0.3)} stain={0.24} dark={0.2} darkC="#100410" tags={[{x: ax + 4.4 * s, y: GY - 8.6 * s, text: '阿米特', size: 42}]}
		light={<>
			<Glow x={ax + 60} y={GY - 260} r={560} ry={360} c="red" o={0.55 + 0.25 * g + 0.06 * flick(t, 3)} />
			<Glow x={P.L[0]} y={P.L[1] - 30} r={140} c="red" o={0.6} />
			<Glow x={P.L[0]} y={P.L[1] - 30} r={60} c="warm" o={0.5} />
			{scrapeK > 0 && scrapeK < 1 && <Glow x={pawX} y={GY} r={120} ry={30} c="smoke" o={0.6 * (1 - scrapeK)} blend="normal" />}
			<Embers t={t} x={ax} y={GY - 20} n={12} seed={301} h={420} spread={500} />
		</>}>
		<Room t={t} />
		<rect x={-500} y={-600} width={2600} height={1500} fill="#2A0610" opacity={0.35} />
		<Balance2 p={bal} x={BX} y={GY} s={BS} t={t} />
		<Glow x={ax} y={GY - 200} r={420} ry={300} c="red" o={0.6} />
		<Mat x0={ax - 360} x1={ax + 260} y={GY} s={BS} />
		<Ammit2 pose={pose} x={ax} y={GY - 0.5 * BS} s={s} face={-1} t={t} rim={0.85} look={2.2} mr={0.4 * g} id="b30am" />
		{scrapeK > 0 && [0, 1, 2].map((i) => <path key={i} d={`M${pawX - 30 + i * 18} ${GY - 4}l${-60 * scrapeK} ${2}`} stroke="#F3E3C0" strokeWidth={3} opacity={0.8} />)}
	</Stage60>;
};

/* ================= 31 · 85.5–88.4 · tilt down Ammit in three beats: crocodile head (jaws clack), lion forepart (mane ripples, small roar), hippo rump (it wiggles) ================= */
export const S31 = {clack: 0.4, roar: 1.35, plop: 2.25, moves: [[0.6, 1.2], [1.55, 2.1]]};
export const Shot31: React.FC<ShotProps> = ({t}) => {
	const s = 60, ax = 1000, ay = GY;
	const clack = keys(t, [[0.12, 0], [0.3, 1], [S31.clack, 0]]), wind = bell(t, S31.roar - 0.4, S31.roar - 0.02), roar = keys(t, [[S31.roar - 0.1, 0], [S31.roar, 1], [S31.roar + 0.35, 1], [S31.roar + 0.65, 0]]);
	const wig = 11 * Math.sin((t - S31.plop) * 26) * Math.exp(-Math.max(0, t - S31.plop) / 0.25) * (t > S31.plop - 0.02 ? 1 : 0);
	const pose = ammitP(t, {jaw: 4 + 30 * clack, neck: 6 + 5 * wind, lean: 1 - 3 * wind, tail: 18 * Math.sin(t * 3) + 30 * bell(t, S31.plop, S31.plop + 0.5) + 25 * roar});
	const W = (u: number, v: number): V => [ax - u * s, ay + v * s];
	const head = W(4.8, -7.4), fore = W(2.6, -5.1), rump = W(-1.7, -2.9);
	const m = S31.moves, cx_ = keys(t, [[m[0][0], head[0]], [m[0][1], fore[0]], [m[1][0], fore[0]], [m[1][1], rump[0]]]), cy_ = keys(t, [[m[0][0], head[1]], [m[0][1], fore[1]], [m[1][0], fore[1]], [m[1][1], rump[1]]]);
	const z = 1.3 + 0.03 * Math.sin(t * 1.3), cam: Cam = {x: cx_ - 40, y: cy_ + 10, z};
	const pop = hit(t, S31.plop, 0.3);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#120C2E" wear={wearFor(z, 0.3)} stain={0.2} dark={0.15} darkC="#100410"
		light={<>
			<Glow x={ax + 80} y={GY - 300} r={600} ry={380} c="red" o={0.5 + 0.2 * roar} />
			<Glow x={head[0] - 120} y={head[1] + 20} r={160} c="white" o={0.4 * hit(t, S31.clack, 0.2)} />
			<Glow x={rump[0] + 40} y={rump[1] - 40} r={220} c="warm" o={0.5 * pop} />
			<Dust t={t} box={[ax - 800, 200, ax + 500, 880]} n={30} seed={311} c="#FFC0A0" o={0.45} />
		</>}>
		<Room t={t} />
		<rect x={-500} y={-600} width={2600} height={1500} fill="#2A0610" opacity={0.35} />
		<Glow x={ax} y={GY - 220} r={520} ry={330} c="red" o={0.55} />
		<Mat x0={ax - 420} x1={ax + 320} y={GY} s={BS} />
		<Ammit2 pose={pose} x={ax} y={GY - 0.5 * BS} s={s} face={-1} t={t} rim={0.75} mr={roar} wig={wig} look={2.2} roar={roar} id="b31am" />
		{pop > 0.05 && <g opacity={pop}>{[0, 1, 2].map((i) => <path key={i} d={`M${rump[0] + 150 + i * 14} ${rump[1] - 60 + i * 30}q${20 + 30 * (1 - pop)} 0 ${30 + 40 * (1 - pop)} ${-10}`} fill="none" stroke="#FFE7C0" strokeWidth={4} strokeLinecap="round" />)}</g>}
	</Stage60>;
};

/* ================= 32 · 88.4–91.4 · beside the balance: Shai (your Fate) and two birth goddesses, arms folded like spectators; your ba bird peeks from a shrine ================= */
export const S32 = {nod: 0.7, peek: [1.45, 1.75], chirp: 1.85};
const folded = (p: Pose, female = false): Pose => { p = wristTo(holdAt(p, 'f', [2.0, -4.5], female), 'f', 92); return wristTo(holdAt(p, 'b', [1.75, -4.05], female), 'b', 88); };
const SHAI: Cast = {...CAST.ani, name: 'Shai', wig: 'tri', wigColor: 'wig', crown: 'none', dress: 'kilt', collar: 'god', apron: true, bHand: 'fist', fHand: 'fist'};
const GOD_F = (o: Partial<Cast>): Cast => ({...CAST.isis, wings: false, crown: 'none', bHand: 'fist', fHand: 'fist', ...o});
const MESKH = GOD_F({name: 'Meskhenet', skin: 'skinF'}), RENEN = GOD_F({name: 'Renenutet', skin: 'skinF', dress: 'gown'});
/** Meskhenet's emblem (a stem with two outward curls) and Renenutet's cobra, in the head frame */
const Emblem: React.FC<{c: {OW: number; LW: number}; kind: 'meskh' | 'cobra'; t: number}> = ({c, kind, t}) => kind === 'meskh' ? <g>
	<path d="M0.05 -2.5L0.05 -3.6" stroke={PAL.ink} strokeWidth={c.OW * 3.4} /><path d="M0.05 -2.5L0.05 -3.6" stroke={PAL.green} strokeWidth={c.OW * 1.8} />
	{[-1, 1].map((sg) => <path key={sg} d={`M0.05 -3.55C${0.05 + sg * 0.2} -4.2 ${0.05 + sg * 1.0} -4.3 ${0.05 + sg * 0.95} -3.75C${0.05 + sg * 0.9} -3.45 ${0.05 + sg * 0.55} -3.5 ${0.05 + sg * 0.6} -3.75`} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 3.2} strokeLinecap="round" />)}
	{[-1, 1].map((sg) => <path key={'g' + sg} d={`M0.05 -3.55C${0.05 + sg * 0.2} -4.2 ${0.05 + sg * 1.0} -4.3 ${0.05 + sg * 0.95} -3.75C${0.05 + sg * 0.9} -3.45 ${0.05 + sg * 0.55} -3.5 ${0.05 + sg * 0.6} -3.75`} fill="none" stroke={PAL.gold} strokeWidth={c.OW * 1.6} strokeLinecap="round" />)}
</g> : <g>
	<path d={sp([[-0.6, -2.45, 1], [0.7, -2.45, 1], [0.6, -2.8], [0.2, -3.0], [0.35, -3.6], [0.75, -4.0 + 0.04 * Math.sin(t * 2)], [0.3, -4.35], [-0.15, -4.0], [-0.1, -3.2], [-0.5, -2.8]], true, 0.18)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.OW * 2} />
	<path d="M0.55 -4.05L0.95 -3.95" stroke={PAL.red} strokeWidth={c.LW * 2.4} /><circle cx={0.42} cy={-4.12} r={0.06} fill={PAL.ink} />
	<path d={sp([[0.2, -3.1], [0.45, -3.3], [0.55, -3.8], [0.3, -3.95], [0.05, -3.5]], true, 0.2)} fill={PAL.green} stroke={PAL.ink} strokeWidth={c.LW} />
</g>;
export const Shot32: React.FC<ShotProps> = ({t}) => {
	const s = 24, xs = BX - 470, xm = BX - 640, xr = BX - 810, xn = BX - 1000;
	const nod = bell(t, S32.nod - 0.1, S32.nod + 0.25) + 0.7 * bell(t, S32.nod + 0.22, S32.nod + 0.5), lean = bell(t, 1.0, 1.9);
	const shai = folded({...POSES.rest, lean: 1 + 0.4 * Math.sin(t * 1.2), neck: 4 * nod, head: -2 + 14 * nod, rt: -6, at: 9, rk: 2, ak: 1});
	const mes = folded({...POSES.rest, lean: 1 - 3 * lean, head: -3 - 4 * lean + 0.5 * Math.sin(t * 1.4), rt: -5, at: 7, rk: 1, ak: 1}, true);
	const ren = folded({...POSES.rest, lean: 2 + 4 * lean, head: 2 + 3 * lean + 0.5 * Math.sin(t * 1.1 + 1), rt: -5, at: 7, rk: 1, ak: 1}, true);
	const peek = up(t, S32.peek[0], S32.peek[1] - S32.peek[0]), chirp = bell(t, S32.chirp - 0.05, S32.chirp + 0.25);
	const bal = {tilt: 0.5 * Math.sin(t * 1.1), swingL: 0.5 * Math.sin(t * 1.4), swingR: -0.4 * Math.sin(t * 1.4), plumb: 0.5 * Math.sin(t * 1.7)};
	const cam = camPath(t, [[0, BX - 520, 540, 1.16], [3.1, BX - 550, 546, 1.21]]);
	const tag: V = [BX - 380, 470];
	const nh = 300, nw = 200, baY = GY - nh * 0.18 - 6 + lerp(96, -4, peek);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#17224F" wear={wearFor(cam.z, 0.3)} stain={0.22} tags={[{x: tag[0], y: tag[1], text: '命运之神 沙伊', size: 34}]}
		light={<>
			<Glow x={BX - 300} y={300} r={500} c="gold" o={0.3} />
			<Glow x={xn} y={GY - 200} r={200} c="gold" o={0.3 + 0.35 * peek} />
			<Glow x={xs + 40} y={GY - 360} r={160} c="warm" o={0.25 + 0.25 * nod} />
			{chirp > 0.05 && [0, 1].map((i) => <path key={i} d={`M${xn + 80 + i * 18} ${baY - 70 - i * 16 - 20 * chirp}q10 -12 20 0`} fill="none" stroke="#FFF2B0" strokeWidth={4} opacity={chirp} />)}
			<Dust t={t} box={[BX - 1000, 0, BX + 300, 860]} n={44} seed={321} c="#FFE2A0" o={0.55} />
		</>}>
		<Room t={t} />
		<Balance2 p={bal} x={BX} y={GY} s={BS} t={t} />
		<Naos x={xn} y={GY} w={nw} h={nh}>
			<g clipPath="url(#b32door)"><BaBird x={xn + 8} y={baY} s={36} t={t} face={1} tilt={-6 + 10 * chirp} beak={chirp} /></g>
		</Naos>
		<defs><clipPath id="b32door"><rect x={xn - nw * 0.25} y={GY - nh * 0.18 - nh * 0.55 - 120} width={nw * 0.5 + 200} height={nh * 0.55 + 120} /></clipPath></defs>
		<God id="b32ren" cast={RENEN} pose={ren} x={xr} y={GY} s={s} sec={{t}} />
		<InBone pose={ren} x={xr} y={GY} s={s} bone="head" female><Emblem c={c_(s * 1.13)} kind="cobra" t={t} /></InBone>
		<God id="b32mes" cast={MESKH} pose={mes} x={xm} y={GY} s={s} sec={{t}} />
		<InBone pose={mes} x={xm} y={GY} s={s} bone="head" female><Emblem c={c_(s * 1.13)} kind="meskh" t={t} /></InBone>
		<God id="b32shai" cast={SHAI} pose={shai} x={xs} y={GY} s={s} sec={{t}} />
	</Stage60>;
};

/* ================= 33 · 91.4–94.4 · extreme close-up: the pans wobble, the heart's pan dips a hair, the feather trembles; Anubis, Thoth and Ammit lean in ================= */
export const S33 = {beats: [0.3, 0.95, 1.5, 1.95, 2.3, 2.58, 2.8], creak: 1.3};
export const Shot33: React.FC<ShotProps> = ({t}) => {
	const dip = up(t, 1.1, 0.7), beat = Math.max(...S33.beats.map((b) => hit(t, b, 0.16, 0.04))), lean = up(t, 0.2, 2.6);
	const tremble = (1.5 + 2.5 * up(t, 0.8, 1.5)) * Math.sin(t * 31) * (0.6 + 0.4 * Math.sin(t * 7));
	const bal = {tilt: 0.35 * Math.sin(t * 3.9) * (0.4 + 0.6 * up(t, 0.2, 1)) + 1.1 * dip, swingL: 0.8 * Math.sin(t * 3.1), swingR: -0.9 * Math.sin(t * 3.4), plumb: 0.6 * Math.sin(t * 2.3) - 1.0 * dip,
		heartK: 1 + 0.09 * beat, featherRot: tremble, look: -6 - 4 * lean};
	const P = panAt(bal, BX, GY, BS);
	const z = keys(t, [[0, 1.38], [3.0, 1.5]]), cam: Cam = {x: BX + (720 - 633) / z, y: lerp(356, 372, up(t, 0.4, 2.4)), z};
	// the three lean in from below, looking up at the pans
	const anX = BX - 200 + 26 * lean, an = kneelAt([P.bob[0] - 120, P.bob[1] + 200], anX, 34, 8 + 8 * lean, -16 - 6 * lean);
	const st: WState = {...STILL, thoth: {neck: -6 + 4 * lean, head: -14 + 6 * lean, penU: 0.6, lift: 0.5, lean: 2 + 8 * lean}};
	const th = thothPose(st), thX = BX + 485 - 28 * lean;
	let th33: Pose = {...POSES.rest, lean: 4 + 9 * lean, neck: -6 + 4 * lean, head: -14 + 6 * lean, rt: -6, at: 9, rk: 2, ak: 1};
	th33 = wristTo(holdAt(th33, 'b', [-0.9, -0.3]), 'b', 4); th33 = wristTo(holdAt(th33, 'f', [1.5, -0.6]), 'f', 12);
	const am = ammitP(t, {neck: 20 + 6 * lean, lean: 3 + 4 * lean, jaw: 3 + 5 * beat});
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#141B44" wear={wearFor(z, 0.2)} stain={0.16} dark={0.12} darkC="#0A0420"
		light={<>
			<Glow x={P.L[0]} y={P.L[1] - 26} r={120 + 70 * beat} c="red" o={0.5 + 0.45 * beat} />
			<Glow x={P.R[0]} y={P.R[1] - 50} r={110} c="white" o={0.3} />
			<Glow x={BX} y={GY - 120} r={520} c="red" o={0.35} />
			<Glow x={BX} y={250} r={300} c="gold" o={0.22} />
			<Dust t={t} box={[BX - 600, 0, BX + 600, 760]} n={30} seed={331} c="#FFE2A0" o={0.45} vx={-1} vy={-2} />
		</>}>
		<Room t={t} />
		<Balance2 p={bal} x={BX} y={GY} s={BS} t={t} />
		<Ammit2 pose={am} x={BX + 262 - 20 * lean} y={GY - 40} s={34} face={-1} t={t} rim={0.8} look={2.4} id="b33am" />
		<God id="b33an" cast={ANUBIS} pose={an} x={anX} y={GY + 40} s={34} sec={{t}} />
		{/* Thoth leans in to look (palette and pen lowered out of the way, so nothing crosses Ammit's mane) */}
		<God id="b33th" cast={THOTH} pose={th33} x={thX} y={GY + 210} s={33} face={-1} sec={{t}} bProp="none" fProp="none" />

	</Stage60>;
};
export const _keep = {Embers, Stars, rng, poly, sm, seg, GlyphStack, balanceGeo, placeBy};

import React from 'react';
import {Img} from 'remotion';
import {W, H, grounded, walkPose, lerp, cl, rnd, seg, ease, eio, eout, land, KAI, SANS, SERIF, SAFE_X, cowrie, spade, QR} from './kit50';
import {B, BG, thB, curl, LacDefs, Lacquer, Vignette, Pool, RimFig, NearArm, heavyPose, JiaoziB, Cowrie} from './styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {Pose} from '../qq44/figure44';
import {P2, STRIDE, vNat, LOOKS, CLERK, OFFICIAL, NOODLE, SILVERSMITH, ikArm, toBody, J, mix, rel, STAND, carrierPose, carryWalk, IronLoopB, CarrierFig,
	BronzeDefs, RoundCoin, BuCoin, Ingot, PhoneP, Bal, panAt, Weight, Label, Tag, GroundW, ShopRow, FarRoofsW, Pillar, Lantern, JiaoziPass, Baochao, PlainNote} from './partB_parts';
/* ep50 PartB: film t 54.75–127.0 (北宋 iron coins → 交子 → print shop → 宝钞 collapse → silver → 1948 → today's stall → the walk
   as one line → the trust web → the end card). Picture only: the master (EP50) draws the subtitles, stamp, counter and the J seal
   on top; from CARD_T = 120.5 the master hides all of them, and PartB draws the whole end card (its question included).
   Timing is locked to lines_read.json and the music map (downbeats 0.1932 + 2.2642k before the hush, 98.4432 + 2.2642k after).
   Rules kept: camera ≤ ~25 px/frame, dissolves only where the walker is in the same place (or not in one of the two shots),
   one copy of every prop, money brightest in frame, nothing important in the right column or the corners. */

/* ---------- small tools ---------- */
const fade = (t: number, a: number, d: number) => ease(seg(t, a, a + d));
const bump = (t: number, a: number, d: number) => { const u = seg(t, a, a + d); return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
/** a decaying vertical jolt after a thud at t0 */
const jolt = (t: number, t0: number, amp = 5) => t < t0 ? 0 : amp * Math.exp(-10 * (t - t0)) * Math.sin(55 * (t - t0));
/** distance along a trapezoid velocity profile: accelerate over ra, cruise at v, brake over de, stop at t1 */
const trap = (t: number, t0: number, t1: number, v: number, ra: number, de: number) => {
	if (t <= t0) return 0; const T = Math.min(t, t1) - t0, Tt = t1 - t0; let d = 0;
	const a1 = Math.min(T, ra); d += v * a1 * a1 / (2 * ra);
	if (T > ra) { const c = Math.min(T, Tt - de) - ra; if (c > 0) d += v * c; }
	if (T > Tt - de) { const u = T - (Tt - de); d += v * (u - u * u / (2 * de)); }
	return d; };
const phaseOf = (d: number, h: number) => d / (STRIDE * h);
const Scene: React.FC<{id: string; sheen?: number; children: React.ReactNode}> = ({id, sheen = 0.3, children}) =>
	<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><LacDefs /><BronzeDefs /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} /></svg>;
const Fig: React.FC<{x: number; g: number; h: number; pose: Pose; look: typeof LOOKS.song; T?: number; rimO?: number}> = ({x, g, h, pose, look, T = 0, rimO = 0.9}) =>
	<RimFig x={x} ground={g} h={h} pose={pose} look={look} col={B.lac} T={T} dx={3} dy={-2.5} rimO={rimO} />;
const Extra: React.FC<{x: number; g: number; h: number; pose: Pose; look: typeof LOOKS.song; flip?: boolean; rimO?: number; T?: number}> = ({x, g, h, pose, look, flip = true, rimO = 0.4, T = 0}) =>
	<RimFig x={x} ground={g} h={h} pose={pose} look={look} col="#0F0806" flip={flip} T={T} dx={flip ? -2.5 : 2.5} dy={-2} rimO={rimO} />;
/** a puff of street dust (expanding, fading) */
const Dust: React.FC<{x: number; y: number; t: number; t0: number; s?: number}> = ({x, y, t, t0, s = 1}) => { const u = seg(t, t0, t0 + 0.9); if (u <= 0 || u >= 1) return null;
	return <g opacity={0.4 * (1 - u)}>{[-1, -0.4, 0.3, 1].map((k, i) => <ellipse key={i} cx={x + k * 50 * s * (0.4 + u)} cy={y - 8 * s - 18 * s * u * (1 - Math.abs(k) * 0.4)} rx={(16 + 30 * u) * s} ry={(6 + 10 * u) * s} fill="#9C7A54" />)}</g>; };
/** a light paper slip held upright from its lower edge by a fist; grip = the fist, dir = the forearm direction */
const gripOf = (hand: P2, elb: P2, h: number): P2 => { const dx = hand[0] - elb[0], dy = hand[1] - elb[1], l = Math.hypot(dx, dy) || 1; return [hand[0] + dx / l * 0.03 * h, hand[1] + dy / l * 0.03 * h]; };
/** a lying string of cash (a flat coil of coins on a counter or a pan); copper or iron */
const Coil: React.FC<{x: number; y: number; rx: number; ry: number; iron?: boolean; sc?: number}> = ({x, y, rx, ry, iron = true, sc = 1}) => { const n = Math.round(2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) / (4.4 * sc));
	return <g>
		<ellipse cx={x} cy={y + ry + 6 * sc} rx={rx * 1.05} ry={ry * 0.5 + 4} fill="#000" opacity={0.25} />
		{Array.from({length: n}, (_, i) => { const a = i / n * 2 * Math.PI, cx = x + rx * Math.cos(a), cy = y + ry * Math.sin(a), ang = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180 / Math.PI;
			return <ellipse key={i} cx={cx} cy={cy} rx={3.4 * sc} ry={11 * sc} transform={`rotate(${ang.toFixed(1)},${cx.toFixed(1)},${cy.toFixed(1)})`} fill={iron ? (i % 2 ? '#545B61' : '#737C83') : (i % 2 ? '#B57A3C' : '#D9A060')} stroke={iron ? '#1E2023' : '#5A3A18'} strokeWidth={1} />; })}
		{[[-0.55, 0.6], [0.1, 0.9], [0.6, 0.5]].map(([u, v], i) => <g key={i}><circle cx={x + u * rx} cy={y + v * ry} r={12 * sc} fill={iron ? '#636A70' : '#C98E4A'} stroke={iron ? '#A9B1B7' : '#F2C98A'} strokeWidth={2} /><rect x={x + u * rx - 4 * sc} y={y + v * ry - 4 * sc} width={8 * sc} height={8 * sc} fill={B.lac} /></g>)}
	</g>; };

/* ======================================================================================================================
   S1–S3 · 54.75–65.25 · the Song street (KF07 at 58.8). He walks in under the iron string from behind a passing pillar (the
   hand-off wipe), stops on the downbeat 57.36 with a thud, leans back against the load (KF07), then shuffles it to the cloth
   stall: the keeper peers over his counter at the heap, recoils and waves it off. Haulers and a coin cart pass behind.
   ==================================================================================================================== */
const G1 = 905, H1 = 640, S1a = 54.75, S1s = 57.36, S1v = 330;
const d1 = (t: number) => trap(t, S1a - 2, S1s, S1v, 0.01, 0.5) - trap(S1a, S1a - 2, S1s, S1v, 0.01, 0.5);
const D1 = d1(S1s);
const d2 = (t: number) => 270 * ease(seg(t, 60.45, 62.25));
/* the hand-off: the master's pillar wipe (master50 WipeSplit, centre on x = 860 at 54.75) reveals PartB from ~53.6 on the
   right. He enters at A's size and place (x 860, h 560) and the camera eases in to KF07's framing (x 900, h 640) by the stop. */
const keeperPose = (t: number): Pose => { const look = fade(t, 62.55, 0.45) * (1 - fade(t, 63.15, 0.3)), back = fade(t, 63.15, 0.3), palm = fade(t, 63.35, 0.35), wave = t > 63.75 ? 14 * Math.sin((t - 63.75) * 2 * Math.PI * 2.4) * (1 - seg(t, 63.75, 65)) : 0;
	return grounded({lean: 4 + 18 * look - 10 * back, neck: 6 + 26 * look - 14 * back, lt: 2, lk: 2, rt: -3, rk: 3, la: lerp(36, 100, palm), le: lerp(50, 14, palm) + wave, ra: 8, re: 20}); };
const SongIron: React.FC<{t: number}> = ({t}) => {
	const dist = d1(t) + d2(t), wX = 900 - D1 + dist, kIn = ease(seg(t, S1a, S1s)), sx = lerp(860, 900, kIn), zz = lerp(560 / 640, 1, kIn);
	const cam = t < S1s ? wX - sx : 230 * ease(seg(t, 60.4, 62.65));
	const phase = phaseOf(d1(t), H1) + phaseOf(d2(t), H1 * 0.62);
	const walkK = t < S1s ? 1 - ease(seg(t, S1s - 0.4, S1s)) : ease(seg(t, 60.45, 60.75)) * (1 - ease(seg(t, 61.95, 62.25)));
	const tsLast = t > 62.25 ? 62.25 : S1s;
	const swayStop = 6 + 8 * Math.exp(-2.2 * Math.max(0, t - tsLast)) * Math.sin(2 * Math.PI * Math.max(0, t - tsLast) / 1.1);
	const sway = lerp(swayStop, 10 + 4 * Math.sin(2 * Math.PI * phase), walkK);
	const pose = mix(carrierPose(sway), carryWalk(phase, sway), walkK);
	const z = (1 + 0.025 * ease(seg(t, S1s, 60.0)) - 0.11 * ease(seg(t, 59.9, 61.2))) * (1 + 0.3 * ease(seg(t, 64.2, 65.0))), shake = jolt(t, S1s, 6) + jolt(t, 62.25, 4);
	const lh = J(pose, 'LHand', wX, G1, H1);
	/* haulers and the coin cart: the street is full of people carrying strings */
	const haul = [[-900, 120, 0.5], [-1500, 105, 0.46]].map(([x0, v, s]) => ({x: x0 + v * (t - S1a), s, ph: v * (t - S1a) / (STRIDE * H1 * s)}));
	const cartX = 2350 - 150 * (t - 59.2), cartOn = t > 59.2;
	const kx = 1456;
	return <Scene id="b1" sheen={0.25 + 0.01 * (t - 54)}>
		<g transform={t < S1s ? `translate(${sx},${G1 + shake}) scale(${zz}) translate(${-sx},${-G1})` : `translate(${900},${880 + shake}) scale(${z}) translate(${-900},${-880})`}>
			<g transform={`translate(${-cam * 0.3},0)`}><FarRoofsW x0={-700} n={11} /></g>
			<g transform={`translate(${-cam},0)`}>
				<ShopRow g={G1} shops={[[-1750, 520, 360], [-980, 560, 390], [-200, 560, 390], [1300, 520, 360]]} wall={[-2100, 2600]} noCounter={[3]} />
				{/* the cloth stall: bolts on the counter, a cloth hanging; the keeper behind his counter */}
				<path d="M1360,520 h70 v170 l-35,-16 l-35,16 Z" fill="#2A1A20" stroke={BG.line} strokeWidth={1.5} />
				<Extra x={kx} g={G1 - 4} h={470} pose={keeperPose(t)} look={{dress: 'robe', head: 'futou', beard: 'short', build: 1.05}} rimO={0.45} />
				<path d={`M${1300 + 520 * 0.04},${G1 - 4} V${G1 - 4 - 360 * 0.3} h${520 * 0.42} V${G1 - 4} Z`} fill={BG.beam} stroke={BG.lineS} strokeWidth={1.5} />
				{[0, 1, 2].map((i) => <rect key={i} x={1336 + i * 64} y={G1 - 4 - 108 - 30} width={56} height={30} rx={13} fill={['#2C2340', '#3A2416', '#2A3326'][i]} stroke={BG.lineS} strokeWidth={1.2} />)}
				{/* mid-street: two haulers bent under strings, a cart of coin strings pushed the other way */}
				{haul.map((o, i) => <g key={i} opacity={0.55} transform={`translate(${o.x},${G1 - 20}) scale(${o.s}) translate(${-o.x},${-(G1 - 20)})`}>
					<CarrierFig x={o.x} g={G1 - 20} h={H1} pose={carryWalk(o.ph, 10)} look={i ? {dress: 'robe', head: 'futou'} : LOOKS.song} sway={10 + 3 * Math.sin(o.ph * 6.28)} /></g>)}
				{cartOn && <g opacity={0.6}>{(() => { const s = 0.62, cg = G1 - 16, wr = 36, ang = (2350 - cartX) / wr * 180 / Math.PI, pu = cartX + 210, pp = phaseOf(2350 - cartX, 300);
					const pusher = ikArm(ikArm(walkPose(pp), 'L', toBody(cartX + 130, cg - 90, pu, cg, 300, true)), 'R', toBody(cartX + 128, cg - 84, pu, cg, 300, true));
					return <g>
						<Extra x={pu} g={cg} h={300} pose={pusher} look={{dress: 'tunic', legs: 'trousers', head: 'futou'}} rimO={0.35} />
						<path d={`M${cartX + 130},${cg - 88} L${cartX + 60},${cg - 70}`} stroke="#3A2116" strokeWidth={6} />
						<rect x={cartX - 120} y={cg - 74} width={190} height={14} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.2} />
						{[0, 1, 2].map((k) => <g key={k} transform={`translate(${cartX - 80 + k * 52},${cg - 86}) scale(${s})`}><Coil x={0} y={-k * 4} rx={46} ry={12} /></g>)}
						<g transform={`rotate(${-ang},${cartX - 30},${cg - wr})`}><circle cx={cartX - 30} cy={cg - wr} r={wr} fill="none" stroke="#3A2116" strokeWidth={6} />
							{[0, 60, 120].map((a) => <path key={a} d={`M${cartX - 30 - wr * Math.cos(a * Math.PI / 180)},${cg - wr - wr * Math.sin(a * Math.PI / 180)} L${cartX - 30 + wr * Math.cos(a * Math.PI / 180)},${cg - wr + wr * Math.sin(a * Math.PI / 180)}`} stroke="#3A2116" strokeWidth={3} />)}</g>
					</g>; })()}</g>}
				<GroundW g={G1} x0={-2200} x1={2800} />
				<Pool id="b1a" x={wX + 10} y={600} rx={460} ry={430} a={0.32} /><Pool id="b1b" x={wX} y={G1 + 2} rx={320} ry={42} a={0.32} />
				{/* the paving cracks under the drop (57.36) */}
				{t > S1s && <path d={`M${lh[0]},${G1 + 4} l-38,22 l-20,30 M${lh[0] + 6},${G1 + 6} l30,18 l34,8 M${lh[0] - 4},${G1 + 8} l6,34`} stroke={B.gold} strokeOpacity={0.35 * fade(t, S1s, 0.15) * (1 - fade(t, 60.6, 0.6))} strokeWidth={2} fill="none" />}
				<CarrierFig x={wX} g={G1} h={H1} pose={pose} look={LOOKS.song} sway={sway} T={t} drag={walkK} />
				<Dust x={lh[0]} y={G1} t={t} t0={S1s} s={1.2} /><Dust x={lh[0]} y={G1} t={t} t0={62.25} />
			</g>
		</g>
	</Scene>; };

/* ======================================================================================================================
   S3b · 64.6–67.75 · the counter trade (a new frame, away from the string; no weighing): his hand drops iron coins onto the
   stall counter one by one (the tag counts 1 → 10); on 「才抵」 (66.43) the keeper slides back ONE copper coin;
   「铁钱 10枚 ⇄ 铜钱 1枚」; the keeper shrugs. Two big cropped figures across the counter, hands from their own arms.
   ==================================================================================================================== */
const TR = {top: 760, sx: 600, t0: 64.95, dt: 0.16, slide: 66.43, c0: 1470, c1: 1250};
const IronTrade: React.FC<{t: number}> = ({t}) => {
	const n = cl(Math.floor((t - TR.t0) / TR.dt) + 1, 0, 10);
	const z = lerp(0.9, 1, eout(seg(t, 64.6, 65.3))) + 0.03 * ease(seg(t, 65.3, 67.75));
	const since = n > 0 && n < 10 ? (t - TR.t0) - (n - 1) * TR.dt : 1, flick = since < 0.09 ? Math.sin(Math.PI * since / 0.09) : 0;
	const hand: P2 = [TR.sx - 4, TR.top - 160 - 12 * flick + (n >= 10 ? 30 * ease(seg(t, 66.45, 66.9)) : 0)];
	const wx = 280, wg = 1560, wh = 1100;
	const wp = ikArm(grounded({lean: 12, neck: 24, lt: 3, lk: 3, rt: -4, rk: 4, la: 30, le: 40, ra: 4, re: 14}), 'L', toBody(hand[0], hand[1], wx, wg, wh));
	const slideK = ease(seg(t, TR.slide, TR.slide + 0.45)), cx = lerp(TR.c0, TR.c1, slideK);
	const reachK = ease(seg(t, TR.slide - 0.35, TR.slide)) * (1 - ease(seg(t, TR.slide + 0.55, TR.slide + 0.95)));
	const kx = 1720, kg = 1560, kh = 1100, shrug = bump(t, 66.95, 0.8);
	let kp = grounded({lean: 10 - 6 * shrug, neck: 18 + 8 * shrug, lt: 2, lk: 2, rt: -3, rk: 3, la: lerp(20, 46, shrug), le: lerp(50, 100, shrug), ra: 6, re: 20});
	if (reachK > 0) kp = ikArm(kp, 'L', toBody(lerp(kx - 230, cx + 38, reachK), lerp(TR.top - 60, TR.top - 22, reachK), kx, kg, kh, true));
	const coinY = (k: number) => TR.top - 4 - k * 9;
	const fallK = n < 10 && t > TR.t0 - 0.12 ? seg(t, TR.t0 + n * TR.dt - 0.12, TR.t0 + n * TR.dt) : -1;
	const ironCoin = (x: number, y: number, k: string) => <g key={k} transform={`translate(${x},${y})`}><ellipse rx={40} ry={11} fill="url(#ironF)" stroke="#23262A" strokeWidth={1.5} /><ellipse cy={-2} rx={34} ry={8} fill="#7A838A" opacity={0.7} /><path d="M-6,-5 L6,-5 L8,0 L-8,0 Z" fill={B.lac} /></g>;
	const final = fade(t, 66.6, 0.25);
	return <Scene id="b2" sheen={0.35}>
		<g transform={`translate(900,760) scale(${z}) translate(-900,-760)`}>
			<rect x={-40} y={300} width={W + 80} height={480} fill={BG.wall} />
			{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-20 + i * 330} y={330} width={70} height={430} rx={6} fill={['#24182C', '#2E1A10', '#1F2618'][i % 3]} stroke={BG.line} strokeWidth={1.2} />)}
			<Pool id="b2" x={900} y={680} rx={760} ry={340} a={0.3} />
			<RimFig x={wx} ground={wg} h={wh} pose={wp} look={LOOKS.song} col={B.lac} T={t} dx={3} dy={-2.5} />
			<Extra x={kx} g={kg} h={kh} pose={kp} look={{dress: 'robe', head: 'futou', beard: 'short', build: 1.05}} rimO={0.45} />
			{/* the counter */}
			<rect x={-40} y={TR.top} width={W + 80} height={H - TR.top + 40} fill="#1E0F0B" /><rect x={-40} y={TR.top} width={W + 80} height={4} fill={B.gold} opacity={0.42} />
			<path d={Array.from({length: 12}, (_, i) => `M${-40 + i * 180},${TR.top + 40} h120`).join(' ')} stroke={B.gold} strokeOpacity={0.1} strokeWidth={2} />
			{Array.from({length: n}, (_, k) => ironCoin(TR.sx, coinY(k), `s${k}`))}
			{fallK >= 0 && ironCoin(TR.sx, lerp(hand[1] + 30, coinY(n), fallK * fallK), 'f')}
			{/* the copper coin, slid back across the counter by the keeper */}
			<g transform={`translate(${cx},${TR.top - 6})`} filter="url(#glS)"><ellipse rx={46} ry={13} fill="url(#brz)" stroke="#5A3A18" strokeWidth={1.5} /><ellipse cy={-2} rx={40} ry={9} fill="#F2C98A" opacity={0.45} /><path d="M-7,-6 L7,-6 L9,0 L-9,0 Z" fill={B.lac} /></g>
			{final < 1 && <g opacity={(1 - final) * fade(t, 64.9, 0.2)}><Tag x={TR.sx} y={TR.top + 100} s={`铁钱 ×${n}`} fs={44} w={200} /></g>}
			{final > 0 && <g opacity={final}><Tag x={(TR.sx + TR.c1) / 2} y={TR.top + 100} s="铁钱 10枚 ⇄ 铜钱 1枚" fs={44} w={500} /></g>}
		</g>
	</Scene>; };

/* ======================================================================================================================
   S4a–S4b · 67.35–72.1 · the 交子铺 (the approved B2 still in motion): the string drags him down while a slip floats down like a
   feather into his raised hand (69.25); 「一张」 vs 「一千文」; on 70.38 he heaves the string onto the clerk's counter, straightens,
   and a ⇄ thread now ties his slip to the coins. He walks off light (71.2).
   ==================================================================================================================== */
const GJ = 905, HJ = 565, WJ = 860, vJ = vNat(HJ) * 1.15, tJ0 = 71.2, tJ1 = 74.6;
const dJ = (t: number) => trap(t, tJ0, tJ1, vJ, 0.3, 0.45);
const CJ: P2 = [1180, 768];   // where the string comes to rest on the counter (world)
const JNW = 128, JNH = 224;
/** his pose and the slip's grip in the 交子 scenes (world x = WJ + dJ) */
const jzPose = (t: number) => {
	const ph = phaseOf(dJ(t), HJ), sway = 7 * Math.exp(-0.28 * Math.max(0, t - 67.35)) * Math.sin(2 * Math.PI * t / 1.3 + 0.7) + 2;
	let hp = heavyPose(sway, 0.6 * Math.sin(t * 2.1));
	const catchK = ease(seg(t, 68.45, 69.25)), Gt: P2 = [0.3, 0.98], R0: P2 = [0.1, 0.38];
	hp = ikArm(hp, 'R', [lerp(R0[0], Gt[0], catchK), lerp(R0[1], Gt[1], catchK)]);
	const heave = bump(t, 70.15, 0.6);
	if (heave > 0) hp = ikArm(hp, 'L', [lerp(hp.LHand[0], 0.36, heave), lerp(hp.LHand[1], 0.58, heave)]);
	const stand = ikArm(STAND, 'R', Gt), k = ease(seg(t, 70.6, 71.1));
	let p = mix(hp, stand, k);
	const wk = ease(seg(t, tJ0, tJ0 + 0.35)), stopK = ease(seg(t, tJ1 - 0.3, tJ1 + 0.1));
	if (wk > 0) { let w = walkPose(ph); const bounce = 0.012 * Math.abs(Math.sin(2 * Math.PI * ph));
		for (const n of Object.keys(w)) if (n !== 'LToe' && n !== 'RToe' && n !== 'LAnk' && n !== 'RAnk') w[n] = [w[n][0], w[n][1] + bounce];
		w = ikArm(w, 'R', rel(w, 0.25, 0.14));
		const held = ikArm(STAND, 'R', rel(STAND, 0.25, 0.14));
		p = mix(mix(p, w, wk), held, stopK); }
	/* the thread snaps (74.91): a flinch, then he looks down at the slip */
	const fl = bump(t, 74.91, 0.4), look = fade(t, 75.25, 0.5);
	if (fl > 0 || look > 0) { const q = grounded({lean: 3 - 7 * fl, neck: 4 - 10 * fl + 22 * look, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 12, ra: 4, re: 14}); p = mix(p, ikArm(q, 'R', rel(q, 0.25, 0.14 - 0.04 * look)), stopK); }
	return {p, sway, heave};
};
const JzStreet: React.FC<{t: number}> = ({t}) => {
	const cam = dJ(t), wx = WJ + cam, {p: pose, sway} = jzPose(t);
	const Jw = (n: string) => J(pose, n, wx, GJ, HJ);
	const lh = Jw('LHand'), grip = gripOf(Jw('RHand'), Jw('RElb'), HJ);
	/* the slip: a feather falling (67.5–69.25), then in his fist */
	const u = seg(t, 67.5, 69.25), fx = grip[0] + 95 * Math.sin(2 * Math.PI * 0.8 * (t - 67.5)) * (1 - u), fy = lerp(-280, grip[1], 1 - (1 - u) * (1 - u)), frot = 30 * Math.cos(2 * Math.PI * 0.8 * (t - 67.5)) * (1 - u) - 5 * u;
	const held = t >= 69.25;
	const slip: P2 = held ? grip : [fx, fy], srot = held ? -5 + 1.5 * Math.sin(t * 1.7) : frot;
	/* the string: in his near fist, heaved through the air (70.55–70.85), then a coil on the counter */
	const rel0 = 70.55, land1 = 70.85, fly = seg(t, rel0, land1);
	const L0 = GJ - lh[1] - 0.04 * HJ - 52;
	const relPt: P2 = [WJ + 0.36 * HJ + 20, GJ - 0.58 * HJ + 10];
	const flyPt: P2 = [lerp(relPt[0], CJ[0] - 40, fly), lerp(relPt[1], CJ[1] - 150, fly) - Math.sin(Math.PI * fly) * 70];
	const kp = grounded({lean: 6 + 10 * bump(t, 70.85, 0.8), neck: 6 + 12 * bump(t, 71.0, 0.9), lt: 2, lk: 2, rt: -3, rk: 3, la: 62 + 4 * Math.sin(t * 1.6) - 20 * fade(t, 70.85, 0.3), le: 28, ra: 2, re: 8});
	const labO = fade(t, 69.55, 0.3) * (1 - fade(t, 70.3, 0.25));
	const thread = fade(t, 70.95, 0.35);
	const shops = [[-170, 560, 390], [440, 520, 360], [1060, 600, 410], [1720, 520, 380], [2300, 560, 390]] as [number, number, number][];
	return <Scene id="b3" sheen={0.3 + 0.05 * (t - 67)}>
		<defs><linearGradient id="skyB3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E0705" /><stop offset="0.45" stopColor="#1A0D09" /><stop offset="0.6" stopColor="#2C160F" /><stop offset="0.85" stopColor="#24120C" /></linearGradient></defs>
		<rect width={W} height={600} fill="url(#skyB3)" opacity={0.6} />
		<g fill="none" stroke={B.gold} strokeWidth={2.2} strokeLinecap="round" opacity={0.16}>{[[1180, 300, 44, 1], [1560, 370, 30, -1], [1840, 250, 34, -1]].map(([x, y, r, d], i) => <path key={i} d={curl(x - cam * 0.15 + 8 * t, y, r, d, 3.2)} />)}</g>
		<g transform={`translate(${-cam * 0.3},0)`}><FarRoofsW x0={-400} n={12} /></g>
		<g transform={`translate(${-cam},0)`}>
			<ShopRow g={GJ} shops={shops} wall={[-400, 3000]} noCounter={[2]} />
			{[[255, 560], [1360, 545], [2010, 552]].map(([x, y], i) => <g key={i}><rect x={x - 1.5} y={y - 44} width={3} height={20} fill={BG.post} /><ellipse cx={x} cy={y} rx={20} ry={25} fill={BG.red} /><ellipse cx={x - 4} cy={y - 4} rx={9} ry={13} fill="#8A4A28" opacity={0.45} /></g>)}
			<rect x={1586} y={430} width={6} height={475} fill={BG.post} /><path d="M1592,446 H1666 V650 L1629,628 L1592,650 Z" fill={BG.red} stroke={BG.line} strokeWidth={1.5} />
			<RimFig x={1250} ground={GJ - 4} h={420} pose={kp} look={CLERK} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.35} />
			<path d={`M${1060 + 600 * 0.04},${GJ - 4} V${GJ - 4 - 410 * 0.3} h${600 * 0.42} V${GJ - 4} Z`} fill={BG.beam} stroke={BG.lineS} strokeWidth={1.5} />
			{t >= land1 && <g transform={`translate(0,${jolt(t, land1, 3)})`}><Coil x={CJ[0]} y={CJ[1] - 10} rx={92} ry={13} /></g>}
			<Dust x={CJ[0]} y={CJ[1] + 6} t={t} t0={land1} s={0.8} />
			<GroundW g={GJ} x0={-400} x1={3200} />
			<Pool id="b3a" x={wx - 40} y={grip[1] + 40} rx={560} ry={460} a={0.34} /><Pool id="b3b" x={wx + 20} y={GJ + 6} rx={300} ry={46} a={0.28} />
			{/* the ⇄ thread: the slip can be swapped back for the coins on the counter */}
			{thread > 0 && <ThreadSwap a={[grip[0], grip[1] - JNH * 0.35]} b={[CJ[0] - 20, CJ[1] - 18]} o={thread} t={t} />}
			<g transform={`translate(${slip[0]},${slip[1]}) rotate(${srot}) translate(${-JNW / 2},${-JNH + 34})`} filter="url(#glS)"><JiaoziB w={JNW} h={JNH} id="jzb" /></g>
			<RimFig x={wx} ground={GJ} h={HJ} pose={pose} look={LOOKS.song} col={B.lac} T={t} dx={3} dy={-2.5} />
			{t < rel0 && <IronLoopB x={lh[0]} y={lh[1] + 0.04 * HJ} L={L0} th={sway} />}
			{t >= rel0 && t < land1 && <IronLoopB x={flyPt[0]} y={flyPt[1]} L={140} th={lerp(sway, -70, fly)} shadow={false} />}
			<NearArm sh={Jw('LSh')} hand={lh} h={HJ} />
			{labO > 0 && <g fontFamily={KAI} fontWeight={700} fontSize={46} opacity={labO}>
				<text x={grip[0] + JNW / 2 + 22} y={grip[1] - JNH + 70} fill={B.goldL} style={{paintOrder: 'stroke'}} stroke={B.lac} strokeWidth={7}>一张</text>
				<path d={`M${lh[0] - 40},${GJ - 70} L${lh[0] - 120},${GJ - 128}`} stroke={B.cream} strokeWidth={2} opacity={0.55} />
				<text x={lh[0] - 270} y={GJ - 138} fill={B.cream} fillOpacity={0.85} stroke={B.lac} strokeWidth={7} style={{paintOrder: 'stroke'}}>一千文</text></g>}
		</g>
	</Scene>; };
/** the ⇄ thread from the slip to its coins, with the tag 「⇄ 1000文」 near the slip; snap = 0..1 after it breaks */
const ThreadSwap: React.FC<{a: P2; b: P2; o: number; t: number; snap?: number; tagU?: number}> = ({a, b, o, t, snap = 0, tagU = 0.32}) => {
	const mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + 60;
	const tagAt: P2 = [lerp(a[0], mx, tagU) - 10, lerp(a[1], my, tagU) + 22];
	if (snap <= 0) return <g opacity={o}>
		<path d={`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`} fill="none" stroke={B.goldL} strokeWidth={2.4} strokeDasharray="10 7" strokeDashoffset={-t * 30} />
		<Tag x={tagAt[0]} y={tagAt[1]} s="⇄ 1000文" fs={28} w={150} /></g>;
	/* broken: the two halves recoil and drop, reddening; the tag falls */
	const k = eout(snap), brk: P2 = [lerp(a[0], mx, 0.45), lerp(a[1], my, 0.45)];
	const e1: P2 = [lerp(brk[0], a[0], 0.6 * k), lerp(brk[1], a[1], 0.6 * k) + 90 * k * k], e2: P2 = [lerp(brk[0], b[0], 0.5 * k), brk[1] + 140 * k * k];
	const col = `rgb(${Math.round(lerp(255, 200, k))},${Math.round(lerp(230, 80, k))},${Math.round(lerp(168, 58, k))})`;
	return <g opacity={o * (1 - seg(snap, 0.6, 1))}>
		<path d={`M${a[0]},${a[1]} Q${lerp(a[0], e1[0], 0.5)},${e1[1] - 10} ${e1[0]},${e1[1]}`} fill="none" stroke={col} strokeWidth={2.4} strokeDasharray="10 7" />
		<path d={`M${e2[0]},${e2[1]} Q${lerp(e2[0], b[0], 0.5)},${my + 40 * k} ${b[0]},${b[1]}`} fill="none" stroke={col} strokeWidth={2.4} strokeDasharray="10 7" />
		{snap < 0.35 && <g stroke="#FFD08A" strokeWidth={2.5} strokeLinecap="round" opacity={1 - snap / 0.35}>{[0, 60, 120, 180, 240, 300].map((d) => { const r0 = 8 + 50 * snap, r1 = r0 + 16; return <path key={d} d={`M${brk[0] + r0 * Math.cos(d * Math.PI / 180)},${brk[1] + r0 * Math.sin(d * Math.PI / 180)} L${brk[0] + r1 * Math.cos(d * Math.PI / 180)},${brk[1] + r1 * Math.sin(d * Math.PI / 180)}`} />; })}</g>}
		<Tag x={tagAt[0] - 10 * k} y={tagAt[1] + 120 * k * k} s="⇄ 1000文" fs={28} w={150} rot={-22 * k} o={1 - k} />
	</g>; };

/* ======================================================================================================================
   S5a–S5b · 71.7–76.9 · the canal: the same walk continues (same body, same step) past a canal; across the water sixteen
   houses light their lanterns one by one (countable: 1…16) and hand out slips. Then the lanterns die right to left, shutters
   drop, people bunch at the doors with slips held up, and his ⇄ thread snaps on the downbeat 74.91.
   ==================================================================================================================== */
const FX0 = 380, FDX = 100, FP = 0.25, FG = 690;
const litAt = (i: number) => 72.0 + i * 0.115;
const outAt = (i: number) => (i >= 8 ? 75.48 : 76.04) + 0.012 * (i % 8);   // the shutters drop on two beats
const Canal16: React.FC<{t: number}> = ({t}) => {
	const cam = dJ(t), wx = WJ + cam, {p: pose} = jzPose(t);
	const Jw = (n: string) => J(pose, n, WJ, GJ, HJ), grip = gripOf(Jw('RHand'), Jw('RElb'), HJ);
	const off = cam * FP; void wx;
	const lit = (i: number) => fade(t, litAt(i), 0.12) * (1 - fade(t, outAt(i), 0.1));
	const shut = (i: number) => fade(t, outAt(i), 0.18);
	const snap = t > 74.91 ? seg(t, 74.91, 75.75) : 0;
	const crowd = [3.15, 5.85, 9.15, 12.85].map((u, k) => ({x: FX0 + u * FDX + 45 - off, fl: k % 2 === 0, k}));
	const crowdO = fade(t, 74.3, 0.35);
	return <Scene id="b4" sheen={0.35 + 0.04 * (t - 71)}>
		<g fill="none" stroke={B.gold} strokeWidth={2} strokeLinecap="round" opacity={0.14}>{[[300, 330, 36, 1], [1250, 280, 44, -1], [1650, 360, 30, 1]].map(([x, y, r, d], i) => <path key={i} d={curl(x - cam * 0.08 + 6 * t, y, r, d, 3.2)} />)}</g>
		<path d={`M-40,${FG - 40} Q400,${FG - 120} 900,${FG - 70} Q1400,${FG - 140} 1960,${FG - 60} V${FG} H-40 Z`} fill={B.far} transform={`translate(${-cam * 0.1},0)`} />
		{/* the far bank: sixteen houses */}
		<g>
			{Array.from({length: 16}, (_, i) => { const x = FX0 + i * FDX - off, L = lit(i), sh = shut(i), pop = seg(t, litAt(i) + 0.05, litAt(i) + 0.8);
				return <g key={i}>
					<path d={`M${x - 8},${FG - 90} L${x + 12},${FG - 116} L${x + 78},${FG - 116} L${x + 98},${FG - 90} Z`} fill={BG.roof} stroke={BG.lineS} strokeWidth={1.4} />
					<rect x={x} y={FG - 90} width={90} height={90} fill="#1E0F0B" stroke={BG.line} strokeWidth={1.2} />
					<rect x={x + 30} y={FG - 62} width={30} height={62} fill={L > 0 ? `rgba(255,170,90,${0.12 + 0.3 * L})` : '#0E0705'} />
					<rect x={x + 30} y={FG - 62} width={30} height={62 * sh} fill="#120806" stroke={BG.line} strokeWidth={1} />
					<Lantern x={x + 45} y={FG - 72} r={9} lit={L} />
					{L > 0.05 && <text x={x + 45} y={FG - 128} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={22} fill={B.goldL} opacity={L * (1 - fade(t, 74.3, 0.3))}>{i + 1}</text>}
					{pop > 0 && pop < 1 && t < 74.4 && <rect x={x + 40 + 14 * pop} y={FG - 40 - 50 * pop} width={10} height={16} fill={B.cream} opacity={Math.sin(Math.PI * pop)} transform={`rotate(${30 * pop},${x + 45},${FG - 40})`} />}
				</g>; })}
			{crowd.map((c) => { const raise = 0.5 + 0.5 * Math.sin((t - 74.3) * 6 + c.k * 1.7), q = ikArm(grounded({lean: 4 + 4 * raise, neck: -8, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 12, ra: 4, re: 12}), 'L', [0.2, lerp(0.98, 1.14, raise)]), hh = 108;
				const hd = J(q, 'LHand', c.x, FG, hh, c.fl);
				return <g key={c.k} opacity={crowdO}><RimFig x={c.x} ground={FG} h={hh} pose={q} look={[LOOKS.song, {dress: 'robe', head: 'futou'} as typeof LOOKS.song, {dress: 'dress', head: 'bun'} as typeof LOOKS.song][c.k % 3]} col="#140B08" flip={c.fl} dx={c.fl ? -2 : 2} dy={-1.6} rimO={0.85} />
					<rect x={hd[0] - 6} y={hd[1] - 19} width={12} height={18} fill={B.cream} stroke="#BF3420" strokeWidth={1.5} /></g>; })}
		</g>
		{/* the canal, with the lanterns' reflections */}
		<rect x={-40} y={FG} width={W + 80} height={GJ - FG} fill="#0F0705" />
		<rect x={-40} y={FG} width={W + 80} height={2} fill={B.gold} opacity={0.2} />
		{Array.from({length: 14}, (_, i) => { const y = FG + 20 + i * 14, x0 = ((i * 173 + t * (20 + i * 3)) % 2200) - 200; return <path key={i} d={`M${x0},${y} h${60 + 40 * rnd(i, 5)} M${x0 + 700},${y + 4} h${50} M${x0 + 1300},${y - 3} h${70}`} stroke={B.gold} strokeOpacity={0.08} strokeWidth={1.5} />; })}
		{Array.from({length: 16}, (_, i) => { const L = lit(i); if (L <= 0.02) return null; const x = FX0 + i * FDX - off + 45 + 3 * Math.sin(t * 4 + i);
			return <g key={i} stroke="#FFC070" strokeLinecap="round" opacity={0.55 * L}>{[0, 1, 2, 3].map((k) => <path key={k} d={`M${x - (9 - 2 * k) + 3 * Math.sin(t * 5 + k + i)},${FG + 30 + k * 16} h${2 * (9 - 2 * k)}`} strokeWidth={3 - 0.5 * k} />)}</g>; })}
		<g transform={`translate(${-cam},0)`}>
			{/* the railing on the near bank */}
			<rect x={-200} y={GJ - 74} width={4400} height={8} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.2} />
			<rect x={-200} y={GJ - 24} width={4400} height={6} fill="#2A1710" />
			{Array.from({length: 34}, (_, i) => <rect key={i} x={-160 + i * 140} y={GJ - 80} width={12} height={80} fill={BG.post} stroke={BG.line} strokeWidth={1} />)}
			<GroundW g={GJ} x0={-200} x1={4400} />
			<Pool id="b4a" x={wx - 30} y={grip[1] + 60} rx={520} ry={440} a={0.3} /><Pool id="b4b" x={wx + 20} y={GJ + 6} rx={300} ry={46} a={0.28} />
		</g>
		<ThreadSwap a={[grip[0], grip[1] - JNH * 0.35]} b={[-160, 780]} o={1} t={t} snap={snap} tagU={0.62} />
		<g transform={`translate(${grip[0]},${grip[1]}) rotate(${-5 + 1.5 * Math.sin(t * 1.7)}) translate(${-JNW / 2},${-JNH + 34})`} filter="url(#glS)"><JiaoziB w={JNW} h={JNH} id="jzc" /></g>
		<RimFig x={WJ} ground={GJ} h={HJ} pose={pose} look={LOOKS.song} col={B.lac} T={t} dx={3} dy={-2.5} />
	</Scene>; };

/* ======================================================================================================================
   S6–S7 · 76.5–81.9 · the government gate: an official presses the seal onto his slip on the downbeat 77.18; the phone from
   frame 0 ghosts over it for one beat; he lifts the slip into a shaft of light on the crash 79.44 and walks on, slip held high.
   ==================================================================================================================== */
const GG = 905, HG = 565, OX = 1265, OG = 885, OH = 520, SNW = JNW, SNH = JNH, MATCH_H = 600, MATCH_Y = 612;   // the match-cut slip: 600 px tall, top ≥ y 312 (clear of the subtitle rows)
const Gate: React.FC<{t: number}> = ({t}) => {
	const wx = WJ, up = ease(seg(t, 78.85, 79.4)), push = ease(seg(t, 80.55, 81.45));
	const pres = ease(seg(t, 76.8, 77.05)), r0 = rel(STAND, 0.25, 0.1);
	/* the slip stays ≥ 40 px under the subtitle band (its top ≥ y 270): presented at chest height, raised to the shoulder */
	const p = mix(ikArm(STAND, 'R', [lerp(r0[0], 0.31, pres), lerp(r0[1], 0.72, pres)]), ikArm(grounded({lean: 0, neck: -16, lt: 3, lk: 3, rt: -5, rk: 4, la: 4, le: 14, ra: 4, re: 14}), 'R', [0.33, 0.78]), up);
	const Jw = (n: string) => J(p, n, wx, GG, HG), grip = gripOf(Jw('RHand'), Jw('RElb'), HG);
	const rot = lerp(-4 + 1.2 * Math.sin(t * 1.5), 1.5, push), cx = grip[0], cy = grip[1] - SNH / 2 + 34;   // the slip's centre
	/* the official: seal from his side to the slip's face, pressed on 77.18, lifted at 77.45 */
	const reach = ease(seg(t, 76.75, 77.12)) * (1 - ease(seg(t, 77.45, 77.85))), press = t > 77.12 && t < 77.45 ? 1 : 0;
	const sealTo: P2 = [cx + 6, cy + 10 - 30 * (1 - press) * reach], rest: P2 = [OX - 70, OG - 0.42 * OH];
	const sealPt: P2 = [lerp(rest[0], sealTo[0], reach), lerp(rest[1], sealTo[1], reach)];
	const bow = bump(t, 79.6, 1.1);
	let op = grounded({lean: 6 + 14 * reach + 26 * bow, neck: 6 + 10 * bow, lt: 2, lk: 2, rt: -3, rk: 3, la: 10, le: 20, ra: 4, re: 14});
	op = ikArm(op, 'L', toBody(sealPt[0], sealPt[1] + 26, OX, OG, OH, true));
	const imp = t > 77.18 ? land(seg(t, 77.18, 77.45)) : 0;
	const shaft = fade(t, 79.35, 0.15) * (1 - 0.5 * fade(t, 80.0, 1.2)), flash = t > 79.44 ? Math.exp(-3 * (t - 79.44)) : 0;
	const z = 1 + 0.05 * ease(seg(t, 76.5, 79.4));
	/* push in on the slip until it fills ~65 % of the frame height, centred: the match cut to the print shop's drying line */
	const sc: P2 = [980 + z * (cx - 980), 560 + z * (cy - 560)], S = lerp(1, MATCH_H / SNH / z, push), pc: P2 = [lerp(sc[0], 960, push), lerp(sc[1], MATCH_Y, push)];
	const offO = 1 - fade(t, 80.2, 0.7);
	return <Scene id="b5" sheen={0.4}>
		<g transform={`translate(${pc[0]},${pc[1]}) scale(${S}) translate(${-sc[0]},${-sc[1]})`}>
		<g transform={`translate(980,560) scale(${z}) translate(-980,-560)`}>
			{/* the gate: a long rammed wall, a gate tower, studded doors, two lanterns, a blank plaque */}
			<rect x={-200} y={560} width={2600} height={GG - 560} fill={BG.wall} />
			<path d="M640,430 Q760,410 820,350 L1720,350 Q1780,410 1900,430 Q1906,446 1880,448 L660,448 Q634,446 640,430 Z" fill={BG.roof} stroke={BG.lineS} strokeWidth={2} />
			<path d={Array.from({length: 22}, (_, i) => `M${700 + i * 56},${440} L${lerp(700 + i * 56, 1270, 0.2)},${356}`).join(' ')} stroke={BG.line} strokeWidth={1.3} opacity={0.6} />
			<rect x={700} y={448} width={1140} height={36} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
			<rect x={1170} y={392} width={200} height={44} fill={BG.roof} stroke={BG.lineS} strokeWidth={1.5} />
			{[760, 1780].map((x) => <rect key={x} x={x} y={484} width={34} height={GG - 484} fill={BG.post} stroke={BG.line} strokeWidth={1} />)}
			<rect x={1030} y={500} width={480} height={GG - 500} fill="#170B08" stroke={BG.lineS} strokeWidth={1.5} />
			<rect x={1268} y={500} width={4} height={GG - 500} fill={BG.line} />
			{Array.from({length: 5}, (_, r) => Array.from({length: 4}, (_, c) => [1068 + c * 52, 1308 + c * 52].map((x, k) => <circle key={`${r}${c}${k}`} cx={x} cy={560 + r * 66} r={6} fill={B.gold} opacity={0.18} />)))}
			{[940, 1600].map((x, i) => <Lantern key={x} x={x} y={560} r={22} lit={0.55 + 0.1 * Math.sin(t * 3 + i)} />)}
			<GroundW g={GG} x0={-200} x1={2600} />
			<Pool id="b5a" x={cx} y={cy + 80} rx={560} ry={440} a={0.3 + 0.1 * shaft} /><Pool id="b5b" x={wx + 20} y={GG + 6} rx={300} ry={46} a={0.28} />
			{shaft > 0 && <g opacity={shaft}><defs><linearGradient id="shB5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2B0" stopOpacity="0" /><stop offset="0.5" stopColor="#FFE2B0" stopOpacity="0.16" /><stop offset="1" stopColor="#FFE2B0" stopOpacity="0.05" /></linearGradient></defs>
				<path d={`M${cx - 60},-40 L${cx + 90},-40 L${cx + 160},${GG} L${cx - 170},${GG} Z`} fill="url(#shB5)" /></g>}
			<g opacity={offO} transform={`translate(${40 * (1 - offO)},0)`}><Extra x={OX} g={OG} h={OH} pose={op} look={OFFICIAL} rimO={0.5} /></g>
			{/* the slip and the imprint */}
			<g transform={`translate(${grip[0]},${grip[1]}) rotate(${rot}) translate(${-SNW / 2},${-SNH + 34})`} filter="url(#glS)">
				<JiaoziB w={SNW} h={SNH} id="jzg" />
				{imp > 0 && <g transform={`translate(${SNW / 2},${SNH * 0.52}) scale(${lerp(1.3, 1, imp)})`} opacity={cl(imp * 2)}><rect x={-26} y={-26} width={52} height={52} fill="#C0301C" opacity={0.92} /><path d="M-18,-12 h36 M-18,0 h36 M-18,12 h36 M0,-20 v40" stroke="#F5E9CB" strokeWidth={3.5} /></g>}
				{(flash > 0 || up > 0.9) && <rect width={SNW} height={SNH} fill="#FFF6DC" opacity={0.55 * flash} />}
				{up > 0.9 && <rect width={SNW} height={SNH} fill="none" stroke={B.goldL} strokeWidth={3} opacity={(0.6 + 0.3 * flash) * (1 - push)} />}
			</g>
			<Fig x={wx} g={GG} h={HG} pose={p} look={LOOKS.song} T={t} />
			{reach > 0.02 && <g transform={`translate(${sealPt[0]},${sealPt[1]})`}><rect x={-24} y={-22} width={48} height={42} rx={3} fill="#7A2A1A" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} /><path d="M-10,-22 q10,-30 20,0 Z" fill="#5A2014" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.2} /><rect x={-24} y={14} width={48} height={8} fill="#C0301C" /></g>}
		</g></g>
	</Scene>; };

/* ======================================================================================================================
   S8 · 81.45–84.45 · the print shop (KF08 at 83.2): he walks in from the left; the clerk's block slams on the beats (81.70,
   82.27, 82.84, 83.40); the drying sheet takes the red pass, then the black; a callout finds the hidden number; on 83.97 the big
   red seal lands.
   ==================================================================================================================== */
const PRESS = [81.70, 82.27, 82.84, 83.40, 83.97];
const Print: React.FC<{t: number}> = ({t}) => {
	const g = 905, h = 520, NW = 200, NH = 350;
	const wd = trap(t, 81.9, 82.95, 487, 0.12, 0.35), wx = -60 + wd, walking = t < 82.95;
	const wp0 = grounded({lean: 4, neck: 4 - 10 * fade(t, 83.0, 0.4), lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 20, ra: 4, re: 14});
	const wp = walking ? mix(walkPose(phaseOf(wd, h)), wp0, ease(seg(t, 82.75, 82.98))) : wp0;
	const env = Math.max(...PRESS.map((b) => { const u = t - b; return u < -0.14 || u > 0.2 ? 0 : u < 0 ? 1 + u / 0.14 : 1 - u / 0.2; }));
	const by = 682 - 30 * (1 - env), KX = 1420;
	/* the printer bends over the press; both hands stay on the block, so they ride it down onto the paper and up again */
	const kp = ikArm(ikArm(grounded({lean: 38 + 4 * env, neck: 14, lt: 8, lk: 14, rt: -8, rk: 12, la: 60, le: 30, ra: 50, re: 40}), 'L', toBody(1300, by + 6, KX, g, h, true)), 'R', toBody(1236, by + 8, KX, g, h, true));
	/* the drying line: the finished slip (the match cut lands on it) and the next sheet taking its passes */
	const red = fade(t, 82.27, 0.08), blk = fade(t, 83.40, 0.08), seal = t > 83.97 ? land(seg(t, 83.97, 84.3)) : 0;
	const ring = seg(t, 82.95, 83.12), line = seg(t, 83.0, 83.14), bub = t > 83.0 ? land(seg(t, 83.0, 83.3)) : 0;
	const z = 1 + 0.035 * ease(seg(t, 81.45, 84.45)), sw = (k: number) => 1.5 * Math.sin(t * 1.3 + k);
	const pk = ease(seg(t, 81.45, 82.45)), PS = lerp(MATCH_H / NH, 1, pk), pc: P2 = [lerp(960, 1080, pk), lerp(MATCH_Y, 517, pk)];
	const pass = (k: number, ps: 'red' | 'black' | 'seal', sc = 1.04) => k > 0 && <g opacity={cl(k * 2)} transform={`translate(${NW / 2},${NH / 2}) scale(${lerp(sc, 1, k)}) translate(${-NW / 2},${-NH / 2})`}><JiaoziPass w={NW} h={NH} pass={ps} /></g>;
	return <Scene id="b6" sheen={0.45}>
		<g transform={`translate(${pc[0]},${pc[1]}) scale(${PS}) translate(-1080,-517)`}>
		<g transform={`translate(900,520) scale(${z}) translate(-900,-520)`}>
			<rect x={-40} y={540} width={W + 80} height={365} fill={BG.wall} />
			{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={120 + i * 360} y={540} width={10} height={365} fill={BG.post} />)}
			<path d="M520,330 Q960,350 1500,330" fill="none" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
			<Pool id="b6" x={960} y={500} rx={640} ry={420} a={0.3} />
			<g transform={`translate(640,342) rotate(${-2 + sw(0)},${NW / 2},0)`} opacity={lerp(0.62, 0.88, red)}><JiaoziPass w={NW} h={NH} pass="paper" /><rect width={NW} height={NH} fill="#6B4A2A" opacity={0.3 * (1 - red)} />{pass(red, 'red')}{pass(blk, 'black')}{pass(seal, 'seal', 1.5)}</g>
			<rect x={712} y={330} width={14} height={26} fill="#8A6232" />
			<g transform={`translate(980,342) rotate(${1.5 + sw(1)},${NW / 2},0)`} filter="url(#glS)">
				<JiaoziPass w={NW} h={NH} pass="paper" /><JiaoziPass w={NW} h={NH} pass="red" /><JiaoziPass w={NW} h={NH} pass="black" /><JiaoziPass w={NW} h={NH} pass="seal" />
				{/* the official's seal from the gate (the match cut lands on the same slip) */}
				<g transform={`translate(${NW / 2},${NH * 0.52}) scale(${NW / SNW})`}><rect x={-26} y={-26} width={52} height={52} fill="#C0301C" opacity={0.92} /><path d="M-18,-12 h36 M-18,0 h36 M-18,12 h36 M0,-20 v40" stroke="#F5E9CB" strokeWidth={3.5} /></g>
			</g>
			<rect x={1068} y={330} width={14} height={26} fill="#8A6232" />
			{ring > 0 && <circle cx={1028} cy={512} r={22} fill="none" stroke={B.goldL} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} />}
			{line > 0 && <path d={`M1046,496 L${lerp(1046, 1250, line)},${lerp(496, 300, line)}`} stroke={B.goldL} strokeWidth={2} strokeOpacity={0.8} />}
			{bub > 0 && <g transform={`translate(1310,250) scale(${bub})`}><circle r={86} fill="#F2E6CC" stroke={B.goldL} strokeWidth={4} />
				<rect x={-50} y={-30} width={100} height={60} fill="none" stroke="#22150F" strokeWidth={3} />
				<path d="M-36,-14 l14,6 M-30,8 l18,-4 M-6,-16 l4,22 M8,-12 l14,10 M10,12 l20,-6 M30,-16 l-6,24" stroke="#22150F" strokeWidth={4} strokeLinecap="round" />
				<rect x={22} y={34} width={30} height={30} fill="#BF3420" opacity={0.85} /></g>}
			<rect x={1080} y={720} width={420} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><rect x={1110} y={742} width={14} height={163} fill={BG.post} /><rect x={1460} y={742} width={14} height={163} fill={BG.post} />
			<rect x={1150} y={708} width={150} height={12} fill="#EFE2C4" />
			{env > 0.9 && <rect x={1150} y={704} width={150} height={4} fill="#BF3420" opacity={0.6} />}
			<rect x={1196} y={by} width={130} height={30} rx={3} fill="#3A2116" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
			<RimFig x={KX} ground={g} h={h} pose={kp} look={CLERK} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.5} />
			<GroundW g={g} />
			<Fig x={wx} g={g} h={h} pose={wp} look={LOOKS.song} T={t} rimO={0.6} />
		</g></g>
	</Scene>; };

/* ======================================================================================================================
   M1a–M2 + the hush · 84.15–98.7 · the Ming hall. A vermilion pillar passes the camera (the era wipe); behind it he has become
   a Ming man and his slip grows into a 宝钞 (85.0). M1b: he sets the note on the balance's empty pan and the beam levels
   against a string of a thousand coins, which equals the silver on its stand (tags on the words). M2: on 93.03 the note's pan
   shoots up; the value tag spins and lands 「不到1文」; the note yellows and frays; he takes it back (95.6). The hush (96.45):
   it crumbles in his hand and blows away (KF09 at 97.5). The camera drifts so he stands alone; the light leaves the balance.
   ==================================================================================================================== */
const GM = 905, HM = 560, MBX = 1040, MBG = 770, MBP = 400, MBA = 250, MWX = 600;
const mCam = (t: number) => -300 * (1 - eout(seg(t, 84.15, 85.9))) - 160 * ease(seg(t, 95.7, 96.8));
const mWalkerWorld = (t: number) => 30 + (MWX - 30) * ease(seg(t, 84.15, 86.0));
const mTilt = (t: number) => { const a = -8 + 8 * land(seg(t, 86.8, 87.5)); const up = -15 * land(seg(t, 93.03, 93.8)) + 1 * ease(seg(t, 95.8, 96.8)); return a + up; };
const hushHand: P2 = [0.25, 0.47];
const hushPoseBase = grounded({lean: 0, neck: 10, lt: 3, lk: 3, rt: -5, rk: 4, la: 30, le: 40, ra: 4, re: 10});
export const hushPose = (breath = 0): Pose => { const q = grounded({lean: 3 + breath, neck: 10, lt: 3, lk: 3, rt: -5, rk: 4, la: 30, le: 40, ra: 4, re: 10}); return ikArm(q, 'L', hushHand); };
void hushPoseBase;
const mPose = (t: number, tiltNow: number, wxS: number) => {
	const wd = mWalkerWorld(t) - 30, walking = t < 86.0;
	const holdR: P2 = [0.27, 0.62];
	let p: Pose;
	if (walking) { const w = walkPose(phaseOf(wd, HM)); p = mix(ikArm(w, 'R', rel(w, 0.26, -0.03)), ikArm(STAND, 'R', holdR), ease(seg(t, 85.75, 86.05))); }
	else p = ikArm(STAND, 'R', holdR);
	/* place the note on the left pan (86.3–86.8), the arm returns (86.8–87.2) */
	const L = panAt(MBX + (wxS - MWX), MBG, MBP, MBA, tiltNow, 'L');
	const reachK = ease(seg(t, 86.25, 86.75)) * (1 - ease(seg(t, 86.85, 87.25)));
	if (reachK > 0) { const tb = toBody(L[0] - 6, L[1] - 30, wxS, GM, HM); p = ikArm(grounded({lean: 3 + 10 * reachK, neck: 4 + 10 * reachK, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 12, ra: 4, re: 14}), 'R', [lerp(holdR[0], tb[0], reachK), lerp(holdR[1], tb[1], reachK)]); }
	else if (t >= 86.8) p = ikArm(grounded({lean: 3 - 6 * bump(t, 93.03, 0.4), neck: 4 - 8 * bump(t, 93.03, 0.5), lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 12, ra: 4, re: 14 + 2 * Math.sin(t * 1.4)}), 'R', [0.08, 0.36]);
	/* take the note back (95.3–95.6) and hold it (95.6–96.0) */
	const tk = ease(seg(t, 95.2, 95.55)), hold = ease(seg(t, 95.6, 96.05));
	if (t > 95.2) { const tb = toBody(L[0] - 4, L[1] - 40, wxS, GM, HM), q = grounded({lean: 3 + 12 * tk * (1 - hold), neck: 4 + 10 * tk * (1 - hold) + 6 * hold, lt: 3, lk: 3, rt: -4, rk: 4, la: lerp(4, 30, hold), le: lerp(12, 40, hold), ra: 4, re: 10});
		const target: P2 = t < 95.6 ? [lerp(0.1, tb[0], tk), lerp(0.4, tb[1], tk)] : [lerp(tb[0], hushHand[0], hold), lerp(tb[1], hushHand[1], hold)];
		p = ikArm(q, 'L', target); }
	return p; };
const Ming: React.FC<{t: number}> = ({t}) => {
	const cam = mCam(t), wxS = mWalkerWorld(t) - cam, tilt = mTilt(t), bx = MBX - cam - (-0);
	const p = mPose(t, tilt, wxS + 0) as Pose;
	const Jw = (n: string) => J(p, n, wxS, GM, HM);
	const L = panAt(bx, MBG, MBP, MBA, tilt, 'L'), R = panAt(bx, MBG, MBP, MBA, tilt, 'R');
	const onPan = t >= 86.75 && t < 95.58, inR = t < 86.75, inL = t >= 95.58;
	const age = 0.12 * ease(seg(t, 93.3, 94.5)) + 0.16 * [95.29, 95.57, 95.86, 96.14, 96.42].reduce((n, h) => n + fade(t, h, 0.08), 0);
	const morph = ease(seg(t, 84.95, 85.3));
	const balO = 1 - fade(t, 96.45, 0.45), pool = ease(seg(t, 95.7, 96.8));
	const pil = 150 - 700 * (t - 84.3);
	const tagI = fade(t, 86.85, 0.2), tagC = fade(t, 87.36, 0.2), tagS = fade(t, 87.93, 0.2), eqO = (k: number) => fade(t, k, 0.2);
	const glowS = 0.5 + 0.5 * fade(t, 87.93, 0.3), glowC = 0.5 + 0.5 * fade(t, 87.36, 0.3);
	const BW = 100, BH = 166;
	const note = (x: number, y: number, rot: number, s = 1) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s}) translate(${-BW / 2},${-BH})`} filter="url(#glS)"><Baochao w={BW} h={BH} age={age} id="bm" /></g>;
	const crumble = seg(t, 96.45, 97.35);
	const hand = Jw('LHand');
	const ringX = bx + 460 - (MBX - bx) * 0;
	return <Scene id="b7" sheen={0.2 + 0.03 * (t - 84)}>
		<g transform={`translate(${-cam},0)`}>
			<rect x={-600} y={540} width={3200} height={GM - 540} fill={BG.wall} />
			{[-260, 200, 1240, 1900].map((x) => <g key={x}><rect x={x} y={300} width={300} height={220} fill="#170B08" stroke={BG.line} strokeWidth={1.2} />
				<path d={Array.from({length: 7}, (_, i) => `M${x + 20 + i * 43},300 v220`).join(' ') + Array.from({length: 5}, (_, i) => `M${x},${320 + i * 44} h300`).join(' ')} stroke={BG.line} strokeWidth={1} /></g>)}
			{[-60, 560, 1640, 2240].map((x) => <rect key={x} x={x} y={260} width={26} height={GM - 260} fill="#2A0F0A" stroke={BG.line} strokeWidth={1} />)}
			<rect x={-600} y={248} width={3200} height={18} fill={BG.beam} stroke={BG.line} strokeWidth={1.2} />
			<rect x={760} y={MBG} width={960} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><path d={`M780,${MBG + 22} H1700 V${GM} H780 Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		</g>
		<GroundW g={GM} />
		<Pool id="b7a" x={lerp(bx + 120, wxS + 160, pool)} y={560} rx={lerp(620, 440, pool)} ry={380} a={lerp(0.3, 0.22, pool)} col={pool > 0.5 ? '#FFC890' : '#FFB060'} />
		<Pool id="b7b" x={wxS} y={GM + 4} rx={260} ry={38} a={0.25} />
		{/* the silver on its stand, the balance */}
		<g opacity={balO}>
			<rect x={ringX - 60} y={560} width={120} height={MBG - 560} fill="#2A1710" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} />
			<g filter="url(#glS)" opacity={glowS}><Ingot x={ringX} y={548} w={110} /></g>
			<Bal x={bx} g={MBG} post={MBP} arm={MBA} tilt={tilt}
				left={onPan ? note(0, -6, 6, 0.8) : null}
				right={<g opacity={glowC}><Coil x={0} y={-22} rx={58} ry={14} iron={false} sc={0.9} /></g>} />
			<g><Tag x={L[0]} y={L[1] + 95} s="一贯" fs={40} o={tagI} />
			{t > 92.2 && <Reel x={L[0]} y={L[1] + 182} t={t} />}
			<Tag x={R[0]} y={R[1] + 95} s="一千文" fs={40} o={tagC} />
			<Tag x={ringX} y={MBG - 70} s="一两银" fs={40} o={tagS} />
			{[[ (L[0] + R[0]) / 2, (L[1] + R[1]) / 2 + 95, 87.36], [(R[0] + ringX) / 2 + 8, MBG - 70, 87.93]].map(([x, y, k], i) => <text key={i} x={x} y={y + 14} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={56} fill={B.goldL} opacity={eqO(k) * (t > 93.03 ? 1 - fade(t, 93.03, 0.3) : 1)}>=</text>)}
			{t > 93.03 && <text x={(L[0] + R[0]) / 2} y={(L[1] + R[1]) / 2 + 109} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={56} fill="#E0705A" opacity={fade(t, 93.1, 0.3)}>≠</text>}</g>
		</g>
		<Fig x={wxS} g={GM} h={HM} pose={p} look={LOOKS.ming} T={t} rimO={lerp(0.9, 0.75, pool)} />
		{/* the money in his hand: the 交子 grows into the 宝钞 (85.0), later the note comes back and crumbles */}
		{inR && (() => { const g2 = gripOf(Jw('RHand'), Jw('RElb'), HM); return <g>
			{morph < 1 && <g opacity={1 - morph} transform={`translate(${g2[0]},${g2[1]}) rotate(-5) translate(${-45},${-158 + 30})`}><JiaoziB w={90} h={158} id="jzm" /></g>}
			{morph > 0 && <g opacity={morph}>{note(g2[0], g2[1] + 30, -5, lerp(0.8, 1, morph))}</g>}</g>; })()}
		{inL && crumble < 1 && <g opacity={1 - crumble * 0.6}>{note(hand[0] + 4, hand[1] + 30, -8, 1 - 0.75 * crumble)}</g>}
		{inL && crumble > 0.6 && <path d={`M${hand[0] + 6},${hand[1] - 24} l34,-6 l-6,26 l-22,8 Z`} fill="#CDBE96" opacity={fade(t, 96.9, 0.2)} />}
		{crumble > 0 && <Flakes hand={hand} t={t} />}
		{pil > -400 && <Pillar x={pil} w={360} red />}
	</Scene>; };
/** the value tag under the note's pan: 1000文 → (a blur, no stops) → 不到1文 */
const Reel: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => { const o = fade(t, 92.3, 0.25), spin = seg(t, 93.4, 93.95), done = t >= 93.95, lk = done ? land(seg(t, 93.95, 94.3)) : 0;
	const w = 280, hh = 84;
	return <g transform={`translate(${x},${y}) scale(${done ? lerp(1.15, 1, lk) : 1})`} opacity={o}>
		<defs><clipPath id="reelB"><rect x={-w / 2} y={-hh * 0.7} width={w} height={hh} rx={8} /></clipPath></defs>
		<rect x={-w / 2} y={-hh * 0.7} width={w} height={hh} rx={8} fill={B.cream} opacity={0.96} />
		<g clipPath="url(#reelB)">
			{spin <= 0 && <text x={0} y={hh * 0.14} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={48} fill={B.lac}>1000文</text>}
			{spin > 0 && !done && Array.from({length: 7}, (_, k) => { const yy = ((k * 30 + spin * 1300) % 210) - 105; return <rect key={k} x={-w / 2 + 30} y={yy} width={w - 60} height={12} rx={6} fill={B.lac} opacity={0.3} />; })}
			{done && <text x={0} y={hh * 0.17 + (1 - lk) * -40} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={60} fill="#B02A16">不到1文</text>}
		</g>
	</g>; };
/** the note's flakes blowing off to the right (KF09's spread at 97.5) */
const Flakes: React.FC<{hand: P2; t: number}> = ({hand, t}) => <g>{Array.from({length: 22}, (_, i) => { const u = i / 21, ti = 96.5 + 0.75 * u;
	if (t < ti) return null;
	const fx = hand[0] + 60 + u * 760 + 40 * Math.sin(i * 2.1), fy = hand[1] - 40 - u * 260 + 50 * Math.sin(i * 1.3), s = lerp(34, 10, u) * (0.7 + 0.5 * rnd(i, 2));
	const k = (t - ti) / (97.5 - ti + 0.001), x = lerp(hand[0] + 10, fx, k) + 12 * Math.sin(t * 2 + i), y = lerp(hand[1] - 10, fy, k) + 8 * Math.sin(t * 3 + i * 0.7);
	const o = lerp(0.9, 0.15, u) * (1 - seg(t, 97.9 + u * 0.4, 98.6));
	return <g key={i} transform={`translate(${x},${y}) rotate(${rnd(i, 4) * 360 + (t - ti) * 120})`} opacity={o}>
		<path d={`M${-s / 2},${-s / 2.6} L${s / 2},${-s / 2.2} L${s / 2.4},${s / 2.5} L${-s / 2.2},${s / 2.1} Z`} fill="#CDBE96" />
		{i % 3 === 0 && <path d={`M${-s / 2},${-s / 2.6} L${s / 2},${-s / 2.2}`} stroke="#22150F" strokeWidth={Math.max(1, s * 0.12)} />}
		{i % 5 === 1 && <rect x={-s * 0.2} y={-s * 0.2} width={s * 0.4} height={s * 0.4} fill="#9A3A24" opacity={0.7} />}</g>; })}</g>;

/* ======================================================================================================================
   M1c · 89.0–92.25 · the printing room: the press goes faster and faster, sheets fly to three stacks that shoot up; the tall
   one topples on 91.33 and spills across the floor; the 收回 basket by the door holds one note.
   ==================================================================================================================== */
const presses = (() => { const out: number[] = []; let tt = 89.35, d = 0.42; while (tt < 91.9) { out.push(tt); tt += d; d = Math.max(0.11, d * 0.8); } return out; })();
const Tower: React.FC<{t: number}> = ({t}) => {
	const g = 905, TX = [470, 660, 850], TW = 160;
	const n = (k: number) => Math.min(80, 5 * (Math.exp(1.25 * Math.max(0, t - 89.1)) - 1) * [0.8, 1.25, 0.95][k]);
	const env = Math.max(0, ...presses.map((b) => { const u = t - b; return u < -0.08 || u > 0.12 ? 0 : u < 0 ? 1 + u / 0.08 : 1 - u / 0.12; }));
	const fall = seg(t, 91.33, 91.78), ang = -88 * fall * fall, spilled = t >= 91.78;
	const hgt = (k: number) => n(k) * 6.5;
	const stack = (k: number) => { const hh = hgt(k), x = TX[k] - TW / 2;
		return <g><rect x={x} y={g - hh} width={TW} height={hh} fill="#DCCFB2" stroke="#6B5A40" strokeWidth={1.5} />
			<path d={Array.from({length: Math.floor(hh / 6.5)}, (_, i) => `M${x},${g - i * 6.5} h${TW}`).join(' ')} stroke="#8A7A5C" strokeWidth={0.8} opacity={0.6} />
			<path d={Array.from({length: Math.floor(hh / 52)}, (_, i) => `M${x},${g - 26 - i * 52} h${TW}`).join(' ')} stroke="#B23A22" strokeWidth={4} opacity={0.7} /></g>; };
	const kp = grounded({lean: 20 + 10 * env, neck: 18, lt: 6, lk: 10, rt: -8, rk: 10, la: 70 - 10 * env, le: 30, ra: 60 - 10 * env, re: 40});
	const ws = grounded({lean: 2 - 9 * fade(t, 91.35, 0.3), neck: -16 - 10 * fade(t, 90.6, 0.6) + 20 * fade(t, 91.6, 0.4), lt: 3, lk: 3, rt: -5, rk: 4, la: 6 + 30 * fade(t, 91.35, 0.3), le: 20 + 50 * fade(t, 91.35, 0.3), ra: 4, re: 14});
	const z = 1 + 0.03 * ease(seg(t, 89.0, 92.2));
	return <Scene id="b8" sheen={0.5}>
		<g transform={`translate(900,600) scale(${z}) translate(-900,-600)`}>
			<rect x={-40} y={420} width={W + 80} height={485} fill={BG.wall} />
			{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={60 + i * 420} y={420} width={12} height={485} fill={BG.post} />)}
			<path d="M-40,420 H1960" stroke={B.gold} strokeOpacity={0.25} strokeWidth={2} />
			<Pool id="b8" x={800} y={560} rx={760} ry={460} a={0.3} />
			{/* the press table and the printer */}
			<rect x={1220} y={720} width={420} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><rect x={1250} y={742} width={14} height={163} fill={BG.post} /><rect x={1600} y={742} width={14} height={163} fill={BG.post} />
			<rect x={1300} y={708} width={160} height={12} fill="#EFE2C4" />
			<rect x={1330} y={682 - 30 * (1 - env)} width={130} height={30} rx={3} fill="#3A2116" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
			<RimFig x={1600} ground={g} h={500} pose={kp} look={{dress: 'robe', head: 'cylcap', build: 1.05}} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.45} />
			{/* sheets flying from the press to the stacks */}
			{presses.map((b, i) => { const u = seg(t, b + 0.02, b + 0.36); if (u <= 0 || u >= 1) return null; const k = i % 3, tx = TX[k], ty = g - hgt(k) - 6;
				return <rect key={i} x={lerp(1380, tx, u) - 40} y={lerp(700, ty, u) - Math.sin(Math.PI * u) * 120} width={80} height={10} fill="#E8DCC0" stroke="#6B5A40" strokeWidth={1} transform={`rotate(${-20 * Math.sin(Math.PI * u)},${lerp(1380, tx, u)},${lerp(700, ty, u)})`} />; })}
			{stack(0)}{stack(2)}
			{!spilled && <g transform={`rotate(${ang},${TX[1] - TW / 2},${g})`}>{stack(1)}</g>}
			<GroundW g={g} />
			{/* the stack lands lying along the floor; it breaks up into sheets that slide and scatter and stay */}
			{spilled && t < 91.95 && <g opacity={1 - seg(t, 91.78, 91.95)} transform={`rotate(-88,${TX[1] - TW / 2},${g})`}>{stack(1)}</g>}
			{spilled && Array.from({length: 72}, (_, i) => { const bx = TX[1] - TW / 2, along = rnd(i, 7) * hgt(1), across = rnd(i, 9) * TW;
				const sx = bx + 0.035 * across - 0.999 * along, sy = g - 0.999 * across - 0.035 * along + 8;
				const ex = sx + (rnd(i, 5) - 0.45) * 220 - 60 * rnd(i, 7), ey = g + 6 + 70 * rnd(i, 11);
				const u = eout(seg(t, 91.78 + 0.08 * rnd(i, 3), 92.3 + 0.15 * rnd(i, 3))), x = lerp(sx, ex, u), y = lerp(sy, ey, u) - Math.sin(Math.PI * u) * 26 * rnd(i, 13);
				const rot = lerp(-88 + 90, (rnd(i, 17) - 0.5) * 50, u);
				return <rect key={i} x={x - 39} y={y - 8} width={78} height={16} fill="#E3D8BE" stroke="#6B5A40" strokeWidth={1} transform={`rotate(${rot},${x},${y})`} />; })}
			{/* the 收回 basket: one note in it */}
			<path d="M1700,905 L1680,800 L1830,800 L1810,905 Z" fill="#3A2412" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
			<path d="M1688,830 H1824 M1694,860 H1818 M1700,885 H1810" stroke={B.gold} strokeOpacity={0.25} strokeWidth={1.5} />
			<rect x={1735} y={782} width={46} height={26} fill="#E3D8BE" stroke="#6B5A40" strokeWidth={1} transform="rotate(-12,1758,795)" opacity={fade(t, 90.2, 0.2)} />
			<Tag x={1756} y={770} s="收回" fs={30} />
			<RimFig x={230} ground={g} h={430} pose={ws} look={LOOKS.ming} col={B.lac} dx={3} dy={-2.5} rimO={0.7} />
		</g>
	</Scene>; };

/* ======================================================================================================================
   M3–M4b · 98.3–105.55 · the silver shop: out of the silence (98.44) an ingot on the table catches the light; he picks it up and
   walks; the camera passes him to the balance (KF10 at 102.2); he tosses the ingot onto the pan (lands 101.84), the shopkeeper
   adds weights and the beam levels on 102.97. M4b: the 半兩 coin's ghost flickers on the same pan: back to weight.
   ==================================================================================================================== */
const SC = 700;
const Silver: React.FC<{t: number}> = ({t}) => {
	const g = 905, cam = SC * ease(seg(t, 99.6, 101.5)), wxW = 760 + 360 * ease(seg(t, 99.6, 101.5)), wx = wxW - cam, h = lerp(560, 540, ease(seg(t, 99.6, 101.5)));
	const bx = 1060 + SC - cam, kx = 1500 + SC - cam;
	const tilt = -6 + 15 * land(seg(t, 101.84, 102.4)) - 5 * land(seg(t, 102.06, 102.5)) - 2.5 * land(seg(t, 102.42, 102.9)) - 1.5 * land(seg(t, 102.97, 103.5));
	const L = panAt(bx, 770, 400, 250, tilt, 'L'), R = panAt(bx, 770, 400, 250, tilt, 'R');
	const ingotOn: P2 = [1000 - cam, 628];
	const reach = ease(seg(t, 98.65, 99.15)) * (1 - ease(seg(t, 99.2, 99.6))), grabbed = t >= 99.15;
	let p: Pose = hushPose(0.4 * Math.sin(t * 1.6) * seg(t, 98.7, 99.2));
	if (t > 98.6) { const q = grounded({lean: 28 * reach, neck: 10 + 18 * reach, lt: 3 + 10 * reach, lk: 3 + 18 * reach, rt: -5, rk: 4 + 12 * reach, la: 30, le: 40, ra: 4, re: 10});
		const tgt = toBody(ingotOn[0] - 6, ingotOn[1] - 6, wx, g, h);
		p = ikArm(q, 'L', t < 99.2 ? [lerp(hushHand[0], tgt[0], reach), lerp(hushHand[1], tgt[1], reach)] : [lerp(0.27, tgt[0], reach), lerp(0.62, tgt[1], reach)]); }
	const wk = ease(seg(t, 99.6, 99.9)) * (1 - ease(seg(t, 101.3, 101.5)));
	if (wk > 0) { const w = walkPose(phaseOf(wxW - 760, h)); p = mix(p, ikArm(w, 'L', rel(w, 0.25, -0.03)), wk); }
	const kf10 = grounded({lean: 6, neck: 12 + 8 * bump(t, 104.0, 0.7), lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 24, ra: 4, re: 12});
	const toss = seg(t, 101.45, 101.62), after = ease(seg(t, 101.55, 102.0));
	if (t > 101.3) { const sw = ikArm(grounded({lean: 4, neck: 2, lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 24, ra: 4, re: 12}), 'L', [lerp(0.2, 0.36, toss), lerp(0.62, 0.95, toss)]); p = mix(mix(p, sw, ease(seg(t, 101.3, 101.45))), kf10, after); }
	const hand = J(p, 'LHand', wx, g, h);
	/* the ingot: on the table → in his hand → through the air → on the pan */
	const fly = seg(t, 101.6, 101.84);
	const rel0: P2 = [wx + 0.36 * h + 6, g - 0.95 * h];
	let ing: P2, iw = 92;
	if (!grabbed) ing = ingotOn;
	else if (t < 101.6) ing = [hand[0] + 8, hand[1] - 6];
	else if (t < 101.84) ing = [lerp(rel0[0], L[0], fly), lerp(rel0[1], L[1] - 24, fly) - Math.sin(Math.PI * fly) * 110];
	else { ing = [L[0], L[1] - 24]; iw = 150; }
	if (t > 101.6 && t < 101.84) iw = lerp(92, 150, fly);
	/* the shopkeeper sets weights (approach, place, retreat) */
	const placeT = [102.06, 102.42, 102.97];
	const kpBase = grounded({lean: 12, neck: 14, lt: 3, lk: 4, rt: -4, rk: 4, la: 50, le: 30, ra: 6, re: 20}), restB: P2 = toBody(kx - 120, 700, kx, g, 500, true);
	let reachW = 0, cur = -1;
	placeT.forEach((tp, i) => { const k = ease(seg(t, tp - 0.28, tp)) * (1 - ease(seg(t, tp + 0.02, tp + 0.25))); if (k > reachW) { reachW = k; cur = i; } });
	const wpos = (i: number): P2 => [R[0] - 40 + i * 40, R[1] - 6];
	const kpTarget: P2 = cur >= 0 ? (() => { const wp2 = wpos(cur), tb = toBody(wp2[0], wp2[1] - 30, kx, g, 500, true); return [lerp(restB[0], tb[0], reachW), lerp(restB[1], tb[1], reachW)] as P2; })() : restB;
	const kp = ikArm(kpBase, 'L', kpTarget), kh = J(kp, 'LHand', kx, g, 500, true);
	const ghost = fade(t, 103.5, 0.3) * (1 - fade(t, 104.9, 0.5)), flick = 0.7 + 0.3 * Math.sin(t * 38);
	const glint = bump(t, 98.35, 0.7);
	const z = 1 + 0.04 * ease(seg(t, 103.0, 105.5));
	const sw = (i: number) => <g transform="translate(0,-4)"><path d="M-13,0 l3,-24 h20 l3,24 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={1.5} /></g>;
	return <Scene id="b9" sheen={0.28 + 0.03 * (t - 98)}>
		<g transform={`translate(1060,560) scale(${z}) translate(-1060,-560)`}>
			<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
			<g transform={`translate(${-cam * 0.4},0)`}>{[-200, 500, 1200, 1900].map((x) => <rect key={x} x={x} y={330} width={260} height={200} fill="#170B08" stroke={BG.line} strokeWidth={1.2} />)}</g>
			<rect x={1380 + SC - cam} y={640} width={360} height={60} fill={BG.roof} stroke={BG.line} strokeWidth={1.5} />
			<Extra x={kx} g={g} h={500} pose={kp} look={SILVERSMITH} rimO={0.45} />
			<rect x={540 + SC - cam} y={770} width={1100} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><path d={`M${560 + SC - cam},792 H${1620 + SC - cam} V905 H${560 + SC - cam} Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
			{/* the ingot table */}
			<rect x={900 - cam} y={640} width={260} height={16} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.2} /><rect x={915 - cam} y={656} width={12} height={249} fill={BG.post} /><rect x={1133 - cam} y={656} width={12} height={249} fill={BG.post} />
			<Ingot x={1070 - cam} y={630} w={80} /><Ingot x={1120 - cam} y={632} w={62} />
			<GroundW g={g} />
			<Pool id="b9a" x={lerp(940, 1060, ease(seg(t, 99.6, 101.5)))} y={560} rx={560} ry={380} a={0.3} /><Pool id="b9b" x={wx} y={g + 4} rx={260} ry={38} a={0.25} />
			<Bal x={bx} g={770} post={400} arm={250} tilt={tilt}
				left={t >= 101.84 ? <g>{ghost > 0 && <g opacity={ghost * flick * 0.6}><RoundCoin x={0} y={-60} r={58} legend={['', '', '半', '兩']} fill="none" ink={B.goldL} /><circle cx={0} cy={-60} r={58} fill="none" stroke={B.goldL} strokeWidth={2.5} /></g>}</g> : null}
				right={<g><Weight />{[0, 1, 2].map((i) => t >= placeT[i] && <g key={i} transform={`translate(${-40 + i * 40},${-2})`}>{sw(i)}</g>)}</g>} />
			{/* the weight in the shopkeeper's fingers */}
			{cur >= 0 && reachW > 0.05 && t < placeT[cur] && <g transform={`translate(${kh[0] - 6},${kh[1] + 16})`}>{sw(cur)}</g>}
			<g filter="url(#glS)"><Ingot x={ing[0]} y={ing[1]} w={iw} rot={t > 101.6 && t < 101.84 ? -30 * Math.sin(Math.PI * fly) : 0} /></g>
			{glint > 0 && <g transform={`translate(${ingotOn[0] + 14},${ingotOn[1] - 14}) scale(${glint})`}><path d="M0,-26 L5,-5 L26,0 L5,5 L0,26 L-5,5 L-26,0 L-5,-5 Z" fill="#FFFFFF" opacity={0.9} /></g>}
			<Fig x={wx} g={g} h={h} pose={p} look={LOOKS.ming} T={t} />
		</g>
	</Scene>; };

/* ======================================================================================================================
   R1 · 105.2–107.45 · 1948: a pillar passes the camera and he walks out from behind it in a 1948 jacket, a plain modern note
   in his hand; brick fronts slide by. Then (107.0–107.4) the same walk dissolves into today's stall (his clothes turn modern on
   the same step: no second copy of him).
   ==================================================================================================================== */
const GR = 905, HR = 560, WR = 660, vR = vNat(HR), tR0 = 105.2, tR1 = 107.45;
const DR = trap(tR1, tR0 - 5, tR1, vR, 0.01, 0.45) - trap(tR0, tR0 - 5, tR1, vR, 0.01, 0.45);
const dRw = (t: number) => trap(t, tR0 - 5, tR1, vR, 0.01, 0.45) - trap(tR0, tR0 - 5, tR1, vR, 0.01, 0.45);
const rPose = (t: number) => { const w = walkPose(phaseOf(dRw(t), HR)); return ikArm(w, 'L', rel(w, 0.24, 0.12)); };
const Modern: React.FC<{t: number}> = ({t}) => {
	const cam = dRw(t), p = stallPose(t), wxM = rX(t), hand = J(p, 'LHand', wxM, GR, HR);
	const pil = 380 - 660 * (t - tR0);
	const fronts = Array.from({length: 9}, (_, i) => ({x: -300 + i * 330, w: 300, h: 380 + 60 * rnd(i, 4)}));
	return <Scene id="b10" sheen={0.3}>
		<g transform={`translate(${-cam * 0.3},0)`}>{Array.from({length: 10}, (_, i) => <rect key={i} x={-200 + i * 260} y={380 - 80 * rnd(i, 6)} width={220} height={300} fill={B.far} stroke={B.ochre} strokeOpacity={0.12} strokeWidth={1.2} />)}</g>
		<g transform={`translate(${-cam},0)`}>
			<rect x={-400} y={560} width={3600} height={GR - 560} fill={BG.wall} />
			{fronts.map((f, i) => <g key={i}><rect x={f.x} y={GR - f.h} width={f.w} height={f.h} fill="#1E0F0B" stroke={BG.lineS} strokeWidth={1.4} />
				<path d={Array.from({length: Math.floor(f.h / 30)}, (_, k) => `M${f.x},${GR - k * 30} h${f.w}`).join(' ')} stroke={BG.line} strokeWidth={0.8} opacity={0.4} />
				{[0, 1, 2].map((c) => [0, 1].map((r) => <rect key={`${c}${r}`} x={f.x + 30 + c * 90} y={GR - f.h + 40 + r * 110} width={56} height={70} fill={rnd(i * 6 + c * 2 + r, 8) > 0.55 ? 'rgba(255,190,110,0.22)' : '#120806'} stroke={BG.line} strokeWidth={1} />))}
				<rect x={f.x + 60} y={GR - 150} width={f.w - 120} height={150} fill="#120806" stroke={BG.line} strokeWidth={1} />
				<rect x={f.x + 40} y={GR - 190} width={f.w - 80} height={30} fill={BG.roof} stroke={BG.line} strokeWidth={1} /></g>)}
			{[400, 1400, 2400].map((x) => <g key={x}><rect x={x} y={420} width={8} height={GR - 420} fill={BG.post} /><path d={`M${x + 4},424 q30,-10 50,8`} stroke={BG.post} strokeWidth={6} fill="none" /><ellipse cx={x + 54} cy={438} rx={10} ry={6} fill="#FFC890" opacity={0.6} /></g>)}
			<GroundW g={GR} x0={-400} x1={3600} />
		</g>
		<Pool id="b10a" x={WR + 40} y={560} rx={420} ry={380} a={0.28} /><Pool id="b10b" x={WR} y={GR + 4} rx={260} ry={38} a={0.25} />
		<Fig x={wxM} g={GR} h={HR} pose={p} look={LOOKS.y1948} T={t} />
		<g transform={`translate(${hand[0] - 4},${hand[1] - 34}) rotate(-6)`} filter="url(#glS)"><PlainNote w={120} h={58} /></g>
		{pil > -500 && <Pillar x={pil} w={440} />}
	</Scene>; };

/* ======================================================================================================================
   T1 · 107.0–110.35 · today's stall (KF11): the walk arrives at the hook's noodle stall (the set stops at 107.45, he walks on
   to the counter). On the drop 107.50 the note peels off and the phone is in his hand; the QR plaque fades in only now; he
   holds the phone out over the code at arm's length; ✓ on 108.07 and 10.17亿 lands like a stamp on a feathered scrim (no box).
   Windows light up across the night city, steam rises, the camera lifts a little. The number leaves before the pull-back.
   ==================================================================================================================== */
const CT = 700, QRC: P2 = [1102, CT - 64];
const dWalk = (t: number) => trap(t, tR0 - 5, 108.05, vR, 0.01, 0.6) - trap(tR0, tR0 - 5, 108.05, vR, 0.01, 0.6);
/** his screen x in the 1948 walk and at the stall: the set stops at 107.45, he keeps walking to the counter */
const rX = (t: number) => WR + (dWalk(t) - dRw(t));
const stallPose = (t: number): Pose => { const x = rX(t);
	const w = walkPose(phaseOf(dWalk(t), HR)), carry = ikArm(w, 'L', rel(w, 0.24, 0.12));
	if (t < 107.75) return carry;
	const reach = ease(seg(t, 107.75, 108.02)), phoneAt: P2 = [QRC[0] - 50, QRC[1] - 6], handAt: P2 = [phoneAt[0] - 14, phoneAt[1] + 44];
	const q = grounded({lean: 4 + 14 * reach, neck: 10 + 14 * reach, lt: 4, lk: 4, rt: -6, rk: 5, la: 50, le: 30, ra: 4, re: 12});
	const tb = toBody(handAt[0], handAt[1], x, GR, HR), stand = ikArm(STAND, 'L', rel(STAND, 0.24, 0.12));
	return mix(mix(carry, stand, ease(seg(t, 107.75, 107.95))), ikArm(q, 'L', [lerp(stand.LHand[0], tb[0], reach), lerp(stand.LHand[1], tb[1], reach)]), reach); };
const Stall: React.FC<{t: number}> = ({t}) => {
	const shift = DR - dRw(t), x = rX(t), p = stallPose(t);
	const hand = J(p, 'LHand', x, GR, HR);
	const phonePt: P2 = [hand[0] + 14, hand[1] - 44];
	const check = t > 108.07 ? land(seg(t, 108.07, 108.4)) : 0;
	const stamp = t > 108.07 ? land(seg(t, 108.07, 108.45)) : 0, numO = cl(stamp * 3) * (1 - fade(t, 109.45, 0.3));
	const np = ikArm(grounded({lean: 4 + 3 * Math.sin(t * 2.2), neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 30, le: 60, ra: 20, re: 70}), 'L', toBody(1360 + 14 * Math.sin(t * 3), CT - 6, 1470, GR, 520, true));
	const rise = 18 * ease(seg(t, 108.3, 110.3));
	const peel = seg(t, 107.5, 107.95), qr = fade(t, 107.5, 0.3);
	return <Scene id="b11" sheen={0.3}>
		<g transform={`translate(${shift},${rise})`}>
			{/* the night city behind: windows light up as the number lands */}
			<g transform={`translate(${-shift * 0.7},0)`}>{Array.from({length: 9}, (_, i) => { const xx = -100 + i * 240, top = 340 + 70 * rnd(i, 12), w = 200;
				return <g key={i}><rect x={xx} y={top} width={w} height={560 - top + 10} fill="#1A0D09" stroke={B.ochre} strokeOpacity={0.12} strokeWidth={1.2} />
					{Array.from({length: 12}, (_, k) => { const c = k % 4, r = Math.floor(k / 4), on = fade(t, 108.25 + 1.6 * rnd(i * 12 + k, 14), 0.15); return <rect key={k} x={xx + 18 + c * 46} y={top + 20 + r * 44} width={26} height={22} fill={on > 0 ? `rgba(255,214,150,${0.08 + 0.42 * on})` : '#120806'} />; })}</g>; })}</g>
			<rect x={-40 - shift} y={560} width={W + 400} height={GR - 560} fill={BG.wall} />
			<path d="M940,420 H1820 L1780,480 H980 Z" fill={BG.red} stroke={BG.line} strokeWidth={1.5} />
			<rect x={980} y={480} width={8} height={CT - 480} fill={BG.post} /><rect x={1772} y={480} width={8} height={CT - 480} fill={BG.post} />
			<RimFig x={1470} ground={GR} h={520} pose={np} look={NOODLE} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.4} />
			<rect x={1540} y={CT - 70} width={130} height={70} rx={10} fill="#2A2420" stroke={BG.line} strokeWidth={1.5} />
			{[0, 1, 2].map((i) => { const u = ((t * 0.45 + i / 3) % 1); return <path key={i} d={curl(1600 + 10 * i - 10, CT - 90 - 120 * u, 14 + 8 * u, i % 2 ? -1 : 1, 1.6, 0.4)} fill="none" stroke={B.cream} strokeWidth={2} opacity={0.22 * Math.sin(Math.PI * u)} />; })}
			<rect x={960} y={CT} width={860} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><path d={`M980,${CT + 22} H1800 V905 H980 Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
			<g opacity={qr}><rect x={1046} y={CT - 120} width={112} height={112} rx={6} fill="#A39880" stroke={BG.lineS} strokeWidth={2} />
				<QR x={1058} y={CT - 108} s={88} fg={B.lac} />
				<rect x={1090} y={CT - 8} width={24} height={8} fill={BG.post} /></g>
			<GroundW g={GR} x0={-200} x1={2400} />
		</g>
		<g transform={`translate(0,${rise})`}>
			<Pool id="b11a" x={lerp(920, 1000, ease(seg(t, 107.3, 108.0)))} y={540} rx={440} ry={360} a={0.3} /><Pool id="b11b" x={x} y={GR + 4} rx={260} ry={38} a={0.25} />
			<Fig x={x} g={GR} h={HR} pose={p} look={LOOKS.today} T={t} />
			{t < 107.5 && <g transform={`translate(${hand[0] - 4},${hand[1] - 34}) rotate(-6)`} filter="url(#glS)"><PlainNote w={120} h={58} /></g>}
			{t >= 107.5 && peel < 1 && <g transform={`translate(${hand[0] - 4 - 70 * peel},${hand[1] - 34 - 70 * peel}) rotate(${-6 - 20 * peel})`} opacity={0.8 * (1 - peel)}><PlainNote w={120} h={58} /></g>}
			{t >= 107.5 && <g transform={`translate(${phonePt[0]},${phonePt[1]}) scale(${lerp(0.7, 1, ease(seg(t, 107.5, 107.7)))}) translate(${-phonePt[0]},${-phonePt[1]})`}><PhoneP x={phonePt[0]} y={phonePt[1]} w={64} rot={6} check={check} glow={0.6 + 0.4 * check} /></g>}
			{numO > 0 && <g transform={`translate(1430,325) scale(${lerp(1.35, 1, stamp)})`} opacity={numO}>
				<defs><radialGradient id="scr11"><stop offset="0" stopColor="#100704" stopOpacity="0.7" /><stop offset="0.6" stopColor="#100704" stopOpacity="0.45" /><stop offset="1" stopColor="#100704" stopOpacity="0" /></radialGradient></defs>
				<ellipse cx={0} cy={0} rx={330} ry={120} fill="url(#scr11)" />
				<text x={0} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={100} fill={B.goldL} style={{paintOrder: 'stroke'}} stroke="#100704" strokeWidth={8}>10.17亿</text>
				<text x={0} y={66} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={30} fill={B.cream} style={{paintOrder: 'stroke'}} stroke="#100704" strokeWidth={5}>网络支付用户</text></g>}
		</g>
	</Scene>; };

/* ======================================================================================================================
   P1–P2a · 109.95–116.8 · the walk as one row: everything he carried lies along the road behind him (props ≈ 120 px). The
   shot opens on the cowrie and tracks right as 贝壳 / 铜 / 纸 / 数字 come: each group lights on its word (111.85, 112.35,
   112.85, 113.55), ending on his phone showing only a balance. Then it pulls back (纸和数字本身不值钱): the rest fades, the paper
   turns plain and flies into his phone, and the camera moves in on him for the trust web.
   ==================================================================================================================== */
const LG = 760, LH = 300, LWX = 2020;
const webPose0 = ikArm(grounded({lean: 4, neck: 18, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 70, ra: 4, re: 12}), 'L', [0.2, 0.62]);
const PX = (i: number) => 160 + i * 150;
/** world point A shown at screen point B with scale s */
const lineCam = (t: number): {A: P2; B: P2; s: number} => {
	const xL = -40 + 40 * ease(seg(t, 109.95, 112.0)) + 520 * ease(seg(t, 112.0, 113.75));
	if (t < 114.3) return {A: [xL + 960, LG], B: [960, LG], s: 1};
	const wB: P2 = [LWX - 520, LG], k2 = ease(seg(t, 114.3, 115.2)), k3 = ease(seg(t, 115.6, 116.5));
	return {A: [LWX, LG], B: [lerp(lerp(wB[0], 1380, k2), 960, k3), lerp(LG, 960, k3)], s: lerp(0.72, 1, 1 - k2) * Math.pow(560 / LH / 0.72, k3) * (k3 > 0 ? 1 : 1)};
};
const GROUPS = [{t: 111.85, ids: [0]}, {t: 112.35, ids: [1, 2, 3, 4, 5, 6]}, {t: 112.85, ids: [8, 9, 11]}, {t: 113.55, ids: [12]}];
const LineWalk: React.FC<{t: number}> = ({t}) => {
	const {A, B: Bp, s} = lineCam(t), tr = `translate(${Bp[0] - s * A[0]},${Bp[1] - s * A[1]}) scale(${s})`;
	const hand = J(webPose0, 'LHand', LWX, LG, LH), phone: P2 = [hand[0] + 0.02 * LH, hand[1] - 0.05 * LH];
	const gi = GROUPS.reduce((acc, g, i) => (t >= g.t ? i : acc), -1);
	const lit = (i: number) => GROUPS.some((g, k) => k <= gi && g.ids.includes(i)) ? 1 : 0;
	const cur = (i: number) => gi >= 0 && GROUPS[gi].ids.includes(i) ? fade(t, GROUPS[gi].t, 0.18) : 0;
	const pop = (i: number) => eout(seg(t, 110.1 + i * 0.1, 110.45 + i * 0.1));
	const fadeOut = fade(t, 114.6, 0.6), paperK = fade(t, 114.9, 0.5), flyK = ease(seg(t, 115.2, 116.0));
	const isPaper = (i: number) => [8, 9, 11].includes(i);
	const op = (i: number) => { let o = (gi < 0 ? 0.85 : lit(i) ? 1 : 0.42) * pop(i); if (!isPaper(i)) o *= 1 - 0.9 * fadeOut; else o *= 1 - fade(t, 116.0, 0.25); return o; };
	const numO = fade(t, 113.55, 0.2) * (1 - fade(t, 115.9, 0.3));
	const prop = (i: number): React.ReactNode => { switch (i) {
		case 0: return <Cowrie x={0} y={-30} L={86} rot={-8} />;
		case 1: { const c = cowrie(80); return <g transform="translate(0,-30) rotate(6)"><path d={c.body} fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><path d={c.slit} fill={B.lac} /></g>; }
		case 2: { const sp = spade(70, 50); return <g transform="translate(0,-36)"><path d={sp.handle} fill={B.ochre} /><path d={sp.blade} fill="url(#brz)" stroke="#5A3A18" strokeWidth={1.5} /></g>; }
		case 3: return <BuCoin x={0} y={-56} Hh={110} />;
		case 4: return <RoundCoin x={0} y={-52} r={50} legend={['', '', '半', '兩']} />;
		case 5: return <RoundCoin x={0} y={-52} r={50} legend={['', '', '五', '銖']} />;
		case 6: return <RoundCoin x={0} y={-52} r={50} legend={['開', '元', '通', '寶']} />;
		case 7: return <Coil x={0} y={-18} rx={58} ry={12} sc={0.85} />;
		case 8: return <g transform="translate(-34,-120)"><JiaoziB w={68} h={118} id="jzl" /></g>;
		case 9: return <g transform="translate(-38,-126)"><Baochao w={76} h={124} id="bcl" /></g>;
		case 10: return <Ingot x={0} y={-26} w={104} />;
		case 11: return <g transform="translate(-60,-62)"><PlainNote w={120} h={60} /></g>;
		default: return null; } };
	return <Scene id="b12" sheen={0.25}>
		<g transform={tr}>
			<rect x={-3000} y={LG} width={8000} height={3000} fill={BG.ground} />
			<path d={`M-200,${LG} H${LWX + 400}`} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2.5} />
			{Array.from({length: 12}, (_, i) => <path key={i} d={`M${PX(i)},${LG + 4} v12`} stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.5} />)}
			<Pool id="b12a" x={1000} y={LG - 60} rx={1300} ry={260} a={0.16} /><Pool id="b12b" x={LWX} y={LG - 120} rx={300} ry={260} a={0.24} />
			{Array.from({length: 12}, (_, i) => { let x = PX(i), y = LG - 8 * cur(i), sc = 1 + 0.08 * cur(i);
				if (isPaper(i) && flyK > 0) { x = lerp(PX(i), phone[0], flyK); y = lerp(LG, phone[1] + 20, flyK) - Math.sin(Math.PI * flyK) * 90; sc = lerp(1, 0.15, flyK); }
				return <g key={i} transform={`translate(${x},${y}) scale(${sc * 1.25})`} opacity={op(i)}>{cur(i) > 0 && <Pool id={`b12g${i}`} x={0} y={-50} rx={90} ry={80} a={0.25 * cur(i)} />}{prop(i)}
					{isPaper(i) && paperK > 0 && <rect x={-62} y={-130} width={124} height={134} fill="#3A2A20" opacity={0.4 * paperK} />}</g>; })}
			<RimFig x={LWX} ground={LG} h={LH} pose={webPose0} look={LOOKS.today} col={B.lac} T={t} dx={2.5} dy={-2} />
			<rect x={phone[0] - 10} y={phone[1] - 17} width={20} height={34} rx={4} fill="#FFE9B8" stroke={B.lac} strokeWidth={1.5} />
			{numO > 0 && <g transform={`translate(${phone[0] + 6},${phone[1] - 92})`} opacity={numO}>
				<defs><radialGradient id="numScr"><stop offset="0" stopColor="#100704" stopOpacity="0.75" /><stop offset="0.7" stopColor="#100704" stopOpacity="0.45" /><stop offset="1" stopColor="#100704" stopOpacity="0" /></radialGradient></defs>
				<ellipse cx={0} cy={-14} rx={150} ry={62} fill="url(#numScr)" />
				<text x={0} y={2} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={46} fill={B.goldL} style={{paintOrder: 'stroke'}} stroke="#100704" strokeWidth={6}>¥16.80</text>
				<path d="M0,26 L0,58" stroke={B.goldL} strokeOpacity={0.6} strokeWidth={2} /></g>}
		</g>
	</Scene>; };

/* ======================================================================================================================
   P2b + air + end card · 116.4–127 · the trust web (KF12): on the arrival chord 116.56 the others gather, each with a phone;
   light lines join them; a paper slip glows in the middle for a beat, then the phone; on 118.82 the web glows (信) and holds
   through the air. End card (KF13): the web dims, the J stamp presses in on 121.085, the title and the question, the sources,
   the pill on 124.97; fade to black 126.5–127.0.
   ==================================================================================================================== */
const PEOPLE: [number, number, number, number][] = [[960, 960, 560, 0], [440, 930, 420, 0.3], [1480, 940, 430, 0.6], [200, 760, 230, 0.1], [1740, 770, 240, 0.8], [700, 700, 180, 0.5], [1250, 690, 170, 0.2], [1900, 680, 150, 0.4], [40, 690, 160, 0.7], [980, 640, 130, 0.5]];
const EDGES: [number, number][] = [[0, 1], [0, 2], [0, 5], [0, 6], [0, 9], [1, 3], [1, 5], [2, 4], [2, 6], [3, 8], [4, 7], [5, 9], [6, 9], [1, 6], [2, 5], [3, 5], [4, 6]];
const OTHER_LOOKS = [{dress: 'jacket', legs: 'trousers', head: 'bob'}, {dress: 'coat', head: 'short'}, {dress: 'dress', head: 'long'}, {dress: 'jacket', legs: 'trousers', head: 'cap'}] as (typeof LOOKS.song)[];
const Web: React.FC<{t: number}> = ({t}) => {
	const z = 1 - 0.03 * ease(seg(t, 117.0, 121.0));
	const ord = [0, 1, 2, 5, 6, 3, 4, 9, 8, 7];
	const app = (i: number) => i === 0 ? 1 : fade(t, 116.6 + ord.indexOf(i) * 0.1, 0.5);
	const ph = PEOPLE.map(([x, gg, h], i) => { const fl = i % 2 === 1, up = i % 3 === 1, sway = 0.01 * Math.sin(t * 1.3 + i);
		return {x, gg, h, fl, i, pose: i === 0 ? webPose0 : ikArm(grounded({lean: 4, neck: up ? 0 : 18, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 70, ra: 4, re: 12}), 'L', up ? [0.22, 0.86 + sway] : [0.2, 0.62 + sway])}; });
	const P = ph.map((o): P2 => { const hnd = J(o.pose, 'LHand', o.x, o.gg, o.h, o.fl); return [hnd[0] + (o.fl ? -1 : 1) * 0.02 * o.h, hnd[1] - 0.05 * o.h]; });
	const glow = fade(t, 118.6, 0.22), breathe = 0.92 + 0.08 * Math.sin((t - 118.82) * 3);
	const slip = bump(t, 117.85, 0.75);
	return <Scene id="b13" sheen={0.2}>
		<g transform={`translate(960,700) scale(${z}) translate(-960,-700)`}>
			<GroundW g={905} lattice={false} />
			<Pool id="b13" x={960} y={620} rx={900} ry={420} a={0.16 + 0.1 * glow} />
			{[...ph].sort((a, b) => a.h - b.h).map((o) => { const a = app(o.i); if (a <= 0) return null;
				return <g key={o.i} opacity={a} transform={`translate(0,${(1 - a) * 24})`}><RimFig x={o.x} ground={o.gg} h={o.h} pose={o.pose} look={o.i === 0 ? LOOKS.today : OTHER_LOOKS[o.i % 4]} col={o.i === 0 ? B.lac : '#120A07'} flip={o.fl} dx={o.fl ? -2.5 : 2.5} dy={-2} rimO={o.i === 0 ? 0.9 : 0.5} T={t} /></g>; })}
			<g stroke={B.goldL} strokeLinecap="round">{EDGES.map(([a, b], k) => { const d = Math.min(app(a), app(b)) > 0.3 ? fade(t, 117.05 + k * 0.055, 0.45) : 0; if (d <= 0) return null;
				return <path key={k} d={`M${P[a][0]},${P[a][1]} Q${(P[a][0] + P[b][0]) / 2},${Math.min(P[a][1], P[b][1]) - 40} ${P[b][0]},${P[b][1]}`} fill="none" strokeWidth={(k < 5 ? 3 : 1.8) * (1 + 0.35 * glow)} strokeOpacity={(k < 5 ? 0.6 : 0.32) + (k < 5 ? 0.35 : 0.3) * glow * breathe} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} />; })}</g>
			{P.map(([px, py], i) => { const a = app(i); if (a <= 0) return null; const big = i === 0;
				return <g key={i} opacity={a}><circle cx={px} cy={py} r={(big ? 26 : 16) * (1 + 0.4 * glow)} fill={B.goldL} opacity={0.14 + 0.3 * glow * breathe} /><rect x={px - (big ? 14 : 9)} y={py - (big ? 24 : 15)} width={big ? 28 : 18} height={big ? 48 : 30} rx={4} fill="#FFE9B8" stroke={B.lac} strokeWidth={1.5} /></g>; })}
			{slip > 0 && <g opacity={slip * 0.9} transform={`translate(${P[0][0]},${P[0][1] - 70}) scale(${0.9 + 0.1 * slip})`}><g transform="translate(-24,-42)"><JiaoziB w={48} h={84} id="jzw" /></g></g>}
		</g>
	</Scene>; };
const SOURCES = ['资料：《说文解字》（据《太平御览》）《史记》《汉书》《旧唐书》《宋史》《明史》 · 中国国家博物馆 · 光明日报 2024 · 《人民周刊》2024',
	'《人民论坛》2022 · 中新网 2021/2024 · 中新社 2019（1948） · CNNIC 第57次中国互联网络发展状况统计报告'];
export const END_Q = '你上一次用[纸币]，是什么时候？';
/** the centred-line rule: pull a trailing full-width 。？ back by half an em plus the letter-spacing (ink centre 960 ± 2) */
const PULL = 0.55;
const EndCard: React.FC<{t: number}> = ({t}) => {
	const dim = fade(t, 120.5, 0.5), seal = t > 121.085 ? land(seg(t, 121.085, 121.5)) : 0, title = fade(t, 121.3, 0.4), q = fade(t, 121.55, 0.4), src = fade(t, 122.0, 0.4), pill = t > 123.0 ? land(seg(t, 123.0, 123.4)) : 0;
	const parts = END_Q.split(/(\[[^\]]+\])/).filter(Boolean), fs = 76, tw = fs * 14 * 1.03;
	return <>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${0.72 * dim})`}} />
		{seal > 0 && <Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, opacity: cl(seal * 3), transform: `rotate(-6deg) scale(${lerp(1.7, 1, seal)})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, opacity: title}}>钱是怎么从贝<span style={{marginRight: '-0.05em'}}>壳</span><br />变成二维码的<span style={{marginRight: `${-PULL}em`}}>？</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: q, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 + 10 * (1 - q), opacity: q, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			{parts.map((p, i) => p.startsWith('[') ? <span key={i} style={{position: 'relative', display: 'inline-block'}}><span style={{position: 'absolute', left: '0.05em', right: '0.05em', bottom: '0.1em', height: '0.13em', borderRadius: '0.06em', background: thB.key}} /><span style={{position: 'relative'}}>{p.slice(1, -1)}</span></span>
				: /[。？！]$/.test(p) ? <span key={i}>{p.slice(0, -1)}<span style={{marginRight: `${-(PULL - 0.02)}em`}}>{p.slice(-1)}</span></span> : <span key={i}>{p}</span>)}</div>
		{pill > 0 && <div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold, opacity: cl(pill * 2), transform: `scale(${lerp(0.9, 1, pill)})`}}>关注 Juno · 一起看懂世界</div>}
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 930, textAlign: 'center', fontFamily: SANS, fontSize: 21, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.72 * src}}>{SOURCES.map((s, i) => <div key={i}>{s}</div>)}</div>
		<div style={{position: 'absolute', inset: 0, background: '#000', opacity: seg(t, 126.5, 127.0)}} />
	</>; };

/* ======================================================================================================================
   the layer list: [start, end, fade-in, fade-out at end, component]; later layers draw on top. A layer that dissolves into the
   next stays until the next is opaque.
   ==================================================================================================================== */
type Layer = {a: number; b: number; fi: number; fo?: number; skip?: [number, number]; C: React.FC<{t: number}>};
const LAYERS: Layer[] = [
	{a: 53.5, b: 65.0, fi: 0, C: SongIron},
	{a: 64.6, b: 67.75, fi: 0.4, C: IronTrade},
	{a: 67.35, b: 72.1, fi: 0.4, C: JzStreet},
	{a: 71.7, b: 76.9, fi: 0.4, C: Canal16},
	{a: 76.5, b: 81.45, fi: 0.4, C: Gate},
	{a: 81.45, b: 84.45, fi: 0, C: Print},
	{a: 84.15, b: 98.7, fi: 0.3, skip: [89.36, 91.89], C: Ming},
	{a: 89.0, b: 92.4, fi: 0.35, fo: 0.5, C: Tower},
	{a: 98.3, b: 105.55, fi: 0.4, C: Silver},
	{a: 105.2, b: 107.4, fi: 0.3, C: Modern},
	{a: 107.0, b: 110.35, fi: 0.4, C: Stall},
	{a: 109.95, b: 116.8, fi: 0.4, C: LineWalk},
	{a: 116.5, b: 127.01, fi: 0.3, C: Web},
	{a: 120.5, b: 127.01, fi: 0, C: EndCard},
];
export const PART_B_START = 54.75;
export const PartB: React.FC<{t: number}> = ({t}) => <div style={{position: 'absolute', inset: 0, background: '#0A0503', overflow: 'hidden'}}>
	{LAYERS.map((L, i) => { if (t < L.a || t >= L.b) return null; if (L.skip && t > L.skip[0] && t < L.skip[1]) return null;
		const o = (L.fi > 0 ? fade(t, L.a, L.fi) : 1) * (L.fo ? 1 - fade(t, L.b - L.fo, L.fo) : 1);
		return <div key={i} style={{position: 'absolute', inset: 0, opacity: o}}><L.C t={t} /></div>; })}
</div>;
void eio; void Label; void CarrierFig;

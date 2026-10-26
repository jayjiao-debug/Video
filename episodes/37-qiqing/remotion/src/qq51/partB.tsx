import React from 'react';
import {Img} from 'remotion';
import {W, H, grounded, walkPose, shop, lerp, cl, rnd, seg, ease, eout, land, KAI, SANS, SERIF, SAFE_X} from '../qq50/kit50';
import {B, BG, thB, curl, LacDefs, Lacquer, Vignette, Pool, RimFig, SilverGrad} from '../qq50/styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {Pose, mixPose} from '../qq44/figure44';
import {STRIDE, vNat, STAND} from '../qq50/partB_parts';
import {Defs51, LOOKS51 as LA, Walker51, Fridge, Cup, IceCubes, Snow, BRZ} from './props51';
import {WipeSplit, BA, BB, PillarKind} from './master51';
import {P2, ikArm, toBody, J, Label, IceDefs, ICE, IceBlock, MeltBlock, IceHeap, Glint, Chips, NEUT, Umbrella, SilverBowl, SilverBasin, IceChest, FridgeIcon,
	P1Line, P2Shot, Lantern51, SOURCES51} from './partsB51';
/* ep51 PartB (Builder B): film t 55.75–119.25. 北宋 street (ice across a counter → the silver stall) → day→night lantern bridge →
   清 night moat → the half-underground vault (两米 · the ~2/3 melt in the hush · three ghost blocks, 「？」 pops on the music's return)
   → 冰票 → the queue by grade → the hutong (锵锵 · the shiver) → 乾隆's cloisonné box → the 19th-century machine → the 1990 grid
   (1.22) → 2024 (104.8, spilling) → your kitchen (the ice clink) → P1 the walk line → P2 the fridge frosting by itself → the
   end card. Picture only: the master draws subtitles / stamp / counter / seal on top until CARD_T; the end card is drawn here.
   Beat grid from master51 (BA = grid A beats, BB = grid B beats); sound cues land on the same frames. */

/* ---------- small tools ---------- */
const fade = (t: number, a: number, d: number) => ease(seg(t, a, a + d));
const bump = (t: number, a: number, d: number) => { const u = seg(t, a, a + d); return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
/** distance along a trapezoid velocity profile (accelerate over ra, cruise at v, brake over de, stop at t1) */
const trap = (t: number, t0: number, t1: number, v: number, ra: number, de: number) => {
	if (t <= t0) return 0; const T = Math.min(t, t1) - t0, Tt = t1 - t0; let d = 0;
	const a1 = Math.min(T, ra); d += v * a1 * a1 / (2 * ra);
	if (T > ra) { const c = Math.min(T, Tt - de) - ra; if (c > 0) d += v * c; }
	if (T > Tt - de) { const u = T - (Tt - de); d += v * (u - u * u / (2 * de)); }
	return d; };
/** a walker driven by a position function: pose mixes from stand to the walk cycle by speed */
const gait = (xf: (t: number) => number, t: number, h: number, vref: number, still: Pose = STAND): {x: number; pose: Pose; k: number} => {
	const x = xf(t), sp = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04, k = cl(sp / vref), ph = x / (STRIDE * h);
	return {x, pose: k > 0.01 ? mixPose(still, walkPose(ph), ease(k)) : still, k}; };
const Scene: React.FC<{id: string; sheen?: number; children: React.ReactNode; vig?: number}> = ({id, sheen = 0.3, children, vig}) =>
	<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><LacDefs /><Defs51 /><IceDefs /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} a={vig} /></svg>;
type Era = 'song' | 'qing' | 'today';
const Wk: React.FC<{x: number; g: number; h: number; pose: Pose; era: Era; flip?: boolean; T?: number; rimO?: number}> = ({x, g, h, pose, era, flip, T = 0, rimO = 0.9}) =>
	<Walker51 x={x} g={g} h={h} pose={pose} look={LA[era].look} qing={era === 'qing'} flip={flip} T={T} rimO={rimO} />;
const Extra: React.FC<{x: number; g: number; h: number; pose: Pose; era: Era; flip?: boolean; rimO?: number; look?: Parameters<typeof Walker51>[0]['look']}> = ({x, g, h, pose, era, flip, rimO = 0.5, look}) =>
	<Walker51 x={x} g={g} h={h} pose={pose} look={look ?? LA[era].look} qing={era === 'qing'} flip={flip} col={NEUT} rimO={rimO} />;
const Floor: React.FC<{g: number; x0?: number; x1?: number; lattice?: boolean; fill?: string}> = ({g, x0 = -40, x1 = W + 40, lattice = true, fill = BG.ground}) => <g>
	<rect x={x0} y={g} width={x1 - x0} height={H - g + 40} fill={fill} /><rect x={x0} y={g} width={x1 - x0} height={3} fill={B.gold} opacity={0.28} />
	{lattice && <path d={Array.from({length: Math.ceil((x1 - x0) / 90) + 2}, (_, i) => `M${Math.floor(x0 / 90) * 90 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
</g>;
const Coin: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <g><circle cx={x} cy={y} r={r} fill="url(#brz51)" stroke={BRZ.line} strokeWidth={1.2} /><rect x={x - r * 0.3} y={y - r * 0.3} width={r * 0.6} height={r * 0.6} fill={B.lac} /></g>;
const night = (col: string, o: number) => <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={col} opacity={o} />;

/* ===================================================================================================================
   S · 北宋 street, 55.0–63.6: the walker carries a block in, sets it across a counter for an ordinary buyer (a coin comes
   back on beat 100), walks the June street of blue umbrellas, stops at the best stall (KF10, 60.0) and is handed a silver
   bowl (glint on 61.011), walks on as the day turns to night (lanterns light one per beat) past the 冰雪冷元子 stall.
   World x = screen x + camX; at 60.0 camX = 0 (the KF10 composition).
   =================================================================================================================== */
export const HX_B = 640;   // the walker's screen x at the hand-off (must match PartA's HANDOFF.x)
const SG = 905, SH = 560, SV = vNat(SH), SVB = 520;
const sA1 = 56.4, sB0 = 57.4, sB1 = 59.95, sC0 = 61.9;
const S_E = 880 - trap(sB1, sB0, sB1, SVB, 0.35, 0.35);   // where he stops at the exchange counter
const sWx = (t: number) => t < sA1 ? S_E - (trap(sA1, 50, sA1, SV, 0.01, 0.35) - trap(t, 50, sA1, SV, 0.01, 0.35))
	: t < sB0 ? S_E : t < sB1 ? S_E + trap(t, sB0, sB1, SVB, 0.35, 0.35) : t < sC0 ? 880 : 880 + trap(t, sC0, sC0 + 6, SV, 0.35, 0.01);
const sCamX = (t: number) => t <= sC0 ? sWx(t) - (t < sB0 ? HX_B : lerp(HX_B, 880, ease(seg(t, sB0, sB1)))) : trap(t, sC0, sC0 + 6, 700, 0.45, 0.01);
export const sWalkerScreen = (t: number) => sWx(t) - sCamX(t);
const BOWL: P2 = [1050, 560];
const SongStreet: React.FC<{t: number}> = ({t}) => {
	const cam = sCamX(t), nt = fade(t, 61.55, 1.1);
	const {x: wx, pose: wp0} = gait(sWx, t, SH, SV * 0.8);
	/* the block he carries in (world), then on the counter, then the buyer's */
	const E = S_E, ctr = {x0: E + 80, x1: E + 300, top: 640};
	const carry: P2 = [wx + 0.23 * SH, SG - 0.47 * SH];
	const onCtr: P2 = [E + 150, ctr.top], toBuyer: P2 = [E + 250, ctr.top];
	const put = ease(seg(t, sA1 - 0.05, 56.8)), slide = ease(seg(t, 56.85, 57.15));
	const blk: P2 = t < 56.85 ? [lerp(carry[0], onCtr[0], put), lerp(carry[1] + 35, onCtr[1], put)] : [lerp(onCtr[0], toBuyer[0], slide), onCtr[1]];
	const buyerLeave = t > 57.7 ? (t - 57.7) * 330 : 0, bx = E + 360 - buyerLeave, bLift = ease(seg(t, 57.3, 57.6));
	const blkB: P2 = t >= 57.3 ? [lerp(toBuyer[0], bx - 0.25 * 480, bLift), lerp(toBuyer[1], SG - 0.47 * 480 + 30, bLift)] : blk;
	/* the coin: buyer's hand → over the counter → his open hand on beat 100 */
	const cu = seg(t, 56.75, BA(100)), coinP: P2 = [lerp(E + 300, E + 128, cu), lerp(560, 604, cu) - Math.sin(Math.PI * cu) * 50];
	let wp = wp0;
	if (t < 56.82) { const bw = 96; wp = ikArm(ikArm(wp, 'L', toBody(blk[0] - bw / 2 + 4, blk[1] - 20, wx, SG, SH)), 'R', toBody(blk[0] + bw / 2 - 10, blk[1] - 30, wx, SG, SH)); }
	else if (t < 57.5) { const k = bump(t, 56.82, 0.68); wp = ikArm(wp, 'L', toBody(lerp(wx + 0.2 * SH, E + 118, Math.min(1, k * 1.4)), lerp(SG - 0.42 * SH, 618, Math.min(1, k * 1.4)), wx, SG, SH)); }
	/* the bowl at the silver stall: scooped at the basin, handed across, then carried */
	const bowlUp = ease(seg(t, 59.7, 60.5)), take = t >= 61.55;
	let bowl: P2 = [lerp(1420, BOWL[0], bowlUp), lerp(CT0 - 40, BOWL[1], bowlUp) - Math.sin(Math.PI * bowlUp) * 30];
	if (take) bowl = [wx + 0.3 * SH, SG - 0.62 * SH];
	if (t >= sB1 - 0.2 && t < 61.55) wp = ikArm(wp, 'L', toBody(Math.min(bowl[0] - 64, wx + 0.29 * SH), bowl[1] + 30, wx, SG, SH));
	if (take) wp = ikArm(ikArm(wp, 'L', toBody(bowl[0] - 66, bowl[1] + 28, wx, SG, SH)), 'R', toBody(bowl[0] + 40, bowl[1] + 40, wx, SG, SH));
	const vx = 1210, vh = 520;
	let vp = grounded({lean: 10, neck: 8, lt: 3, lk: 4, rt: -4, rk: 4, la: 50, le: 30, ra: -8, re: 6});
	vp = ikArm(vp, 'L', toBody(take ? 1110 : bowl[0] + 92, take ? 640 : bowl[1] + 12, vx, SG, vh, true));
	const glintK = t < 61.011 ? 0.35 * fade(t, 60.5, 0.4) : Math.max(0.5, 1.6 * Math.exp(-(t - 61.011) * 3));
	const far = Array.from({length: 14}, (_, i) => shop(-1800 + i * 330, 600, 300, 110 + 50 * rnd(i, 3)));
	const mids = [-1740, -1200, -660, -120, 420, 1640, 2180, 2720].map((x0) => shop(x0, 790, 450 - (Math.abs(x0) % 3) * 10, 290));
	const lanterns: [number, number][] = [[700, BA(108)], [1080, BA(109)], [1500, BA(110)], [1900, BA(111)], [2300, BA(112)]];
	const scoop = (x: number, i: number) => { const ph = t * 2.6 + i * 1.7, hy = 772 - 22 * Math.abs(Math.sin(ph));
		return <g key={x}>
			<Umbrella x={x} y={560 + (i % 2) * 15} r={115} g={800} o={0.9} />
			<Extra x={x + 30} g={800} h={230} pose={ikArm(grounded({lean: 14, neck: 10, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 30, ra: 6, re: 20}), 'L', toBody(x - 10, hy, x + 30, 800, 230, true))} era="song" flip rimO={0.4} />
			<path d={`M${x - 40},800 L${x - 34},758 H${x + 4} L${x + 10},800 Z`} fill="#3A2416" stroke={BG.lineS} strokeWidth={1.2} />
			<ellipse cx={x - 15} cy={757} rx={22} ry={5} fill={ICE.body} opacity={0.8} />
			<Extra x={x - 95} g={800} h={220} pose={ikArm(grounded({lean: 4, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 50, ra: 4, re: 12}), 'L', [0.2, 0.55])} era="song" look={{dress: 'robe', head: i % 2 ? 'bun' : 'futou'}} rimO={0.4} />
			<path d={`M${x - 95 + 0.2 * 220 - 14},${800 - 0.55 * 220 - 8} q14,12 28,0 Z`} fill="#3A2416" /><ellipse cx={x - 95 + 0.2 * 220} cy={800 - 0.55 * 220 - 9} rx={12} ry={4} fill={ICE.core} />
		</g>; };
	return <Scene id="sS" sheen={0.45} vig={0.6}>
		<defs><linearGradient id="dayS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24120B" /><stop offset="0.5" stopColor="#5A2F1A" /><stop offset="0.72" stopColor="#6E3D20" /><stop offset="1" stopColor="#2A150D" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#dayS)" opacity={0.75 * (1 - 0.8 * nt)} />
		<Pool id="sSun" x={1000} y={330} rx={1200} ry={560} a={0.42 * (1 - nt)} col="#FFC070" />
		<g transform={`translate(${-cam * 0.5},0)`}><g fill="#2C170F">{far.map((s, i) => <path key={i} d={s.roof} />)}</g><rect x={-1900} y={600} width={6000} height={300} fill="#2C170F" /></g>
		<g transform={`translate(${-cam},0)`}>
			{mids.map((s, i) => <g key={i}><path d={s.roof} fill={BG.roof} stroke={BG.lineS} strokeWidth={2} /><path d={s.tiles} stroke={BG.line} strokeWidth={1.4} opacity={0.6} />
				<path d={s.posts} fill={BG.post} stroke={BG.line} strokeWidth={1} /><path d={s.beam} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} /><path d={s.shutter} stroke="#170B08" strokeWidth={6} /></g>)}
			<rect x={-2000} y={790} width={6000} height={115} fill="#241209" />
			{[-1450, -980, -520, 150, 560, 1640, 2150].map((x, i) => scoop(x, i))}
			{/* the other of the two best stalls (back left): silver too */}
			<rect x={250} y={735} width={230} height={65} fill={BG.beam} stroke={BG.lineS} strokeWidth={1.2} />
			<SilverBasin x={310} y={732} w={70} id="sbA" /><SilverBowl x={400} y={724} w={46} id="sbB" heap={10} /><SilverBowl x={448} y={727} w={40} id="sbC" />
			<Glint x={333} y={727} r={14} o={0.5 + 0.4 * bump(t, 60.9, 0.5)} />
			{/* lanterns under the eaves, lit one per beat as the day goes */}
			{lanterns.map(([x, tl], i) => <Lantern51 key={i} x={x} y={470 + (i % 2) * 18} s={0.7} lit={nt * fade(t, tl - 0.08, 0.16)} />)}
		</g>
		{night('#05060C', 0.5 * nt)}
		{/* the night-market stall (back left, under the eave): the 冰雪冷元子 board and plum-red boxes, lit as the day goes */}
		<g transform={`translate(${-cam},0)`} opacity={nt}>
			<rect x={560} y={548} width={290} height={62} rx={4} fill="#1A0E09" stroke={B.goldL} strokeOpacity={0.35 + 0.4 * nt} strokeWidth={2} />
			<text x={705} y={594} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={42} fill={B.cream} opacity={0.55 + 0.45 * nt}>冰雪冷元子</text>
			<rect x={590} y={738} width={230} height={14} fill="#3A2116" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.2} />
			{[[600, 0], [662, 0], [630, -26], [744, 0]].map(([x, dy], i) => <rect key={i} x={x} y={712 + dy} width={56} height={26} rx={3} fill="#A8323A" opacity={0.6 + 0.4 * nt} stroke="#E8BC66" strokeOpacity={0.5} strokeWidth={1.2} />)}
			<Lantern51 x={866} y={600} s={0.6} lit={fade(t, BA(108) - 0.08, 0.16) * nt} />
		</g>
		<g transform={`translate(${-cam},0)`}>
			<Floor g={SG} x0={-2000} x1={4000} />
			<Pool id="sF" x={wx + 60} y={SG + 4} rx={360} ry={44} a={0.3} />
			{/* the ordinary stall where he hands the block across */}
			<rect x={ctr.x0} y={ctr.top} width={ctr.x1 - ctr.x0} height={18} fill="#3A2116" stroke={B.gold} strokeOpacity={0.45} strokeWidth={1.5} />
			<path d={`M${ctr.x0 + 10},${ctr.top + 18} H${ctr.x1 - 10} V${SG} H${ctr.x0 + 10} Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
			<Extra x={bx} g={SG} h={480} pose={t >= 57.7 ? ikArm(walkPose(buyerLeave / (STRIDE * 480)), 'L', toBody(blkB[0] + 40, blkB[1] - 10, bx, SG, 480, true)) : ikArm(grounded({lean: 8, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 30, ra: 4, re: 12}), 'L', t < 56.95 ? toBody(E + 300, 572, bx, SG, 480, true) : toBody(blkB[0] + 40, blkB[1] - 10, bx, SG, 480, true))} era="song" flip look={{dress: 'tunic', legs: 'trousers', head: 'bun'}} rimO={0.55} />
			{t < 57.1 + 0.6 && t > 56.7 && cu < 1 && <Coin x={coinP[0]} y={coinP[1]} r={12} />}
			{(t < 58.6) && <IceBlock x={(t >= 57.3 ? blkB : blk)[0] - 48} y={(t >= 57.3 ? blkB : blk)[1]} w={96} h={66} d={36} seed={8} />}
			{/* the best stall: big umbrella, the keeper, every vessel silver (KF10) */}
			<Umbrella x={1440} y={430} r={340} g={CT0} />
			<Extra x={vx} g={SG} h={vh} pose={vp} era="song" flip look={{dress: 'robe', head: 'futou', build: 1.04}} rimO={0.55} />
			<rect x={1110} y={CT0} width={560} height={22} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} /><path d={`M1125,${CT0 + 22} H1655 V${SG} H1125 Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
			<path d={Array.from({length: 6}, (_, i) => `M${1160 + i * 90},${CT0 + 50} h50 v130 h-50 Z`).join(' ')} fill="none" stroke={BG.line} strokeWidth={1.2} />
			<SilverBasin x={1480} y={CT0 - 50} w={190} id="sbD" />
			{[0, 1, 2].map((i) => <SilverBowl key={i} x={1300} y={CT0 - 22 - i * 14} w={86 - i * 2} id={`sbS${i}`} k={0.5 + 0.05 * i} />)}
			<defs><SilverGrad id="sbE" x0={1600} x1={1660} k={0.5} /></defs>
			<path d={`M1610,${CT0} Q1586,${CT0 - 40} 1604,${CT0 - 70} L1600,${CT0 - 96} H1630 L1626,${CT0 - 70} Q1646,${CT0 - 40} 1622,${CT0} Z`} fill="url(#sbE)" stroke="#6D7880" strokeWidth={1.5} />
			<Glint x={1555} y={CT0 - 56} r={16} o={0.7} />
			{t > 59.6 && <SilverBowl x={bowl[0]} y={bowl[1]} w={164} id="sbH" heap={50} k={0.55 + 0.15 * seg(t, 60.4, 61.4)} />}
			<Wk x={wx} g={SG} h={SH} pose={wp} era="song" T={t} />
			{t > 59.6 && <Glint x={bowl[0] + 30} y={bowl[1] + 7} r={66 * glintK} o={cl(glintK * 2)} />}
		</g>
	</Scene>; };
const CT0 = 712;

/* ===================================================================================================================
   Q · the 清 night moat, 62.0–67.5 (KF11 at 65.0): he walks in with the long pick, the workers strike on 63.841 / 64.407
   (and every two beats after), he lifts for one swing (raised at 65.0) and strikes on beat 115 (65.539), leaves the pick
   standing in the ice and walks on toward the vault.
   =================================================================================================================== */
const QG = 950, QH = 560, qX0 = 62.708, qX1 = 63.95;
let Q_HX = 760;   // set in PartB from the Song walker's screen x at the wipe
const qWx = (t: number) => t < qX1 ? 760 - (trap(qX1, 55, qX1, vNat(QH), 0.01, 0.45) - trap(t, 55, qX1, vNat(QH), 0.01, 0.45)) : t < 66.15 ? 760 : 760 + trap(t, 66.15, 70, vNat(QH), 0.4, 0.01);
const qCam = (t: number) => t < qX1 ? qWx(t) - lerp(Q_HX, 760, ease(seg(t, qX0, qX1))) : t < 66.15 ? 0 : trap(t, 66.3, 70, 300, 0.5, 0.01);
/** the long ice pick (冰镩) in two hands: s = 0 raised (mid-swing), 1 = struck (tip on the ice) */
const pickGeom = (x: number, g: number, h: number, s: number, sgn: number) => {
	const tip: P2 = [x + sgn * lerp(0.4, 0.42, s) * h, lerp(g - 0.14 * h, g + 4, s)], hi: P2 = [x + sgn * lerp(0.24, 0.08, s) * h, g - lerp(1.06, 0.78, s) * h];
	const at = (u: number): P2 => [hi[0] + (tip[0] - hi[0]) * u, hi[1] + (tip[1] - hi[1]) * u];
	return {tip, hi, at, top: at(lerp(-0.02, -0.08, s)), gU: at(lerp(0.22, 0.18, s)), gL: at(lerp(0.44, 0.4, s))}; };
const pickPose = (s: number) => mixPose(grounded({lean: -4, neck: 2, lt: 12, lk: 10, rt: -14, rk: 10, la: 60, le: 40, ra: 70, re: 40}), grounded({lean: 22, neck: 8, lt: 16, lk: 24, rt: -10, rk: 14, la: 40, le: 10, ra: 30, re: 10}), s);
const Pick: React.FC<{x: number; g: number; h: number; s: number; flip?: boolean; who: 'walker' | 'worker'; T?: number}> = ({x, g, h, s, flip, who, T = 0}) => {
	const sgn = flip ? -1 : 1, G = pickGeom(x, g, h, s, sgn);
	let p = pickPose(s); p = ikArm(p, 'R', toBody(G.gU[0], G.gU[1], x, g, h, flip), s > 0.5); p = ikArm(p, 'L', toBody(G.gL[0], G.gL[1], x, g, h, flip));
	const iron = G.at(0.86);
	return <g>
		<path d={`M${G.top[0]},${G.top[1]} L${iron[0]},${iron[1]}`} stroke="#8A6232" strokeWidth={Math.max(4, h * 0.016)} strokeLinecap="round" />
		<path d={`M${iron[0]},${iron[1]} L${G.tip[0]},${G.tip[1]}`} stroke="#AEB8BF" strokeWidth={Math.max(4, h * 0.02)} strokeLinecap="round" />
		{who === 'walker' ? <Wk x={x} g={g} h={h} pose={p} era="qing" T={T} /> : <Extra x={x} g={g} h={h} pose={p} era="qing" flip={flip} look={{dress: 'tunic', legs: 'trousers', head: 'bald'}} rimO={0.55} />}
	</g>; };
/** a worker's swing: struck at each strike time, lifted in 0.5 s, held, brought down in the last 0.16 s */
const swingS = (t: number, first: number, period: number) => { if (t < first - 0.16) { const k = (first - t) / period; return k < 0.6 ? 0 : 0.6; }
	const n = Math.floor((t - first + 0.16) / period), ts = first + n * period, d = t - ts;
	if (d < 0) return 1 - (-d) / 0.16; if (d < 0.12) return 1; return Math.max(0, 1 - (d - 0.12) / 0.45); };
const QStrikes = (first: number, period: number, t: number) => { const n = Math.floor((t - first) / period); return n >= 0 ? first + n * period : -9; };
const Moat: React.FC<{t: number}> = ({t}) => {
	const cam = qCam(t), {x: wx, pose: wpWalk} = gait(qWx, t, QH, vNat(QH) * 0.8);
	const flakes = Array.from({length: 46}, (_, i) => { const y = (300 + rnd(i, 22) * 700 + t * (30 + 40 * rnd(i, 24))) % 760 + 300, x = ((rnd(i, 21) * (W + 400) - cam * 0.3 + 20 * Math.sin(t + i)) % (W + 400) + W + 400) % (W + 400) - 200; return [x, y, 2 + 3 * rnd(i, 23)]; });
	/* his swing: lift 64.15–64.75, hold, strike on beat 115, recover, let go */
	const W115 = BA(115), sw = t < 64.15 ? 1 : t < 64.75 ? 1 - ease(seg(t, 64.15, 64.75)) : t < W115 - 0.16 ? 0 : t < W115 ? (t - (W115 - 0.16)) / 0.16 : 1;
	const holding = t >= 63.9 && t < 66.15;
	const workers: [number, number, number, boolean][] = [[230, 300, 63.841, false], [440, 290, 64.407, false], [1150, 300, 63.841, true], [1335, 290, 64.407, true]];
	const leftPick = pickGeom(760, QG, QH, 1, 1);   // where his pick stays standing after he lets go
	return <Scene id="qM" sheen={0.2}>
		<defs><linearGradient id="verm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E2618" /><stop offset="1" stopColor="#3E140C" /></linearGradient>
			<linearGradient id="moat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#17151A" /><stop offset="1" stopColor="#0E0B0C" /></linearGradient></defs>
		<g transform={`translate(${-cam * 0.85},0)`}>
			<rect x={-1400} y={380} width={4800} height={250} fill="url(#verm)" />
			<path d="M-1400,380 H3400" stroke={B.gold} strokeOpacity={0.4} strokeWidth={2} />
			<path d="M-1400,350 L-1380,330 H3380 L3400,350 V384 H-1400 Z" fill="#1E120A" stroke={B.gold} strokeOpacity={0.45} strokeWidth={2} />
			<path d={Array.from({length: 160}, (_, i) => `M${-1380 + i * 30},334 V380`).join(' ')} stroke={B.gold} strokeOpacity={0.14} strokeWidth={2} />
			{[-600, 360, 1620, 2600].map((lx, i) => <Lantern51 key={i} x={lx} y={490} lit={1} />)}
		</g>
		<g transform={`translate(${-cam},0)`}>
			<rect x={-1400} y={630} width={4800} height={26} fill="#22150F" stroke={BG.lineS} strokeWidth={1.5} />
			<rect x={-1400} y={656} width={4800} height={H - 616} fill="url(#moat)" />
			<path d={Array.from({length: 22}, (_, i) => `M${rnd(i, 31) * 3400 - 1300},${680 + (i % 14) * 26 + 8 * rnd(i, 32)} h${120 + 240 * rnd(i, 33)}`).join(' ')} stroke={ICE.shade} strokeOpacity={0.14} strokeWidth={2} strokeLinecap="round" />
			<path d="M560,700 L2460,700 L2490,742 L540,742 Z" fill="#050405" />
			<path d="M560,700 L2460,700" stroke={ICE.core} strokeWidth={3} opacity={0.85} /><path d="M540,742 L2490,742" stroke={ICE.body} strokeWidth={2} opacity={0.5} />
			<Pool id="qa" x={380} y={700} rx={420} ry={160} a={0.3} /><Pool id="qb" x={1640} y={700} rx={420} ry={160} a={0.3} /><Pool id="qc" x={860} y={820} rx={560} ry={260} a={0.24} />
			<IceBlock x={1440} y={790} w={110} h={70} d={40} seed={3} /><IceBlock x={1560} y={790} w={100} h={66} d={40} seed={4} /><IceBlock x={1490} y={722} w={104} h={64} d={36} seed={6} />
			{workers.map(([x, h, first, fl], i) => { const s = swingS(t, first, 1.1321), ts = QStrikes(first, 1.1321, t), G = pickGeom(x, 790, h, 1, fl ? -1 : 1);
				return <g key={i}><Pick x={x} g={790} h={h} s={s} flip={fl} who="worker" />{t - ts < 0.3 && t >= ts && <g opacity={1 - (t - ts) / 0.3}><Chips x={G.tip[0]} y={G.tip[1] - 4} s={h * 0.32 * (0.7 + (t - ts))} seed={i + Math.floor(ts)} dir={fl ? -1 : 1} n={10} /></g>}</g>; })}
			<Pool id="qw" x={wx + 70} y={QG + 4} rx={320} ry={44} a={0.3} />
			{holding ? <Pick x={760} g={QG} h={QH} s={sw} who="walker" T={t} /> : <>
				{t >= 66.15 && <g><path d={`M${leftPick.top[0]},${leftPick.top[1]} L${leftPick.tip[0]},${leftPick.tip[1]}`} stroke="#8A6232" strokeWidth={9} strokeLinecap="round" /><path d={`M${leftPick.at(0.86)[0]},${leftPick.at(0.86)[1]} L${leftPick.tip[0]},${leftPick.tip[1]}`} stroke="#AEB8BF" strokeWidth={11} strokeLinecap="round" /></g>}
				{t < 63.9 && (() => { const p = ikArm(wpWalk, 'R', toBody(wx + 0.12 * QH, QG - 0.46 * QH, wx, QG, QH)), rh = J(p, 'RHand', wx, QG, QH);
					return <g><path d={`M${rh[0] + 8},${rh[1] - 0.62 * QH} L${rh[0] + 8},${rh[1] + 0.3 * QH}`} stroke="#8A6232" strokeWidth={9} strokeLinecap="round" /><path d={`M${rh[0] + 8},${rh[1] + 0.22 * QH} L${rh[0] + 8},${rh[1] + 0.36 * QH}`} stroke="#AEB8BF" strokeWidth={11} strokeLinecap="round" /><Wk x={wx} g={QG} h={QH} pose={p} era="qing" T={t} /></g>; })()}
				{t >= 66.15 && <Wk x={wx} g={QG} h={QH} pose={wpWalk} era="qing" T={t} />}
			</>}
			{t >= W115 && t < W115 + 0.35 && <g opacity={1 - (t - W115) / 0.35}><Chips x={pickGeom(760, QG, QH, 1, 1).tip[0]} y={QG - 6} s={130 * (0.8 + t - W115)} seed={9} dir={1} n={10} /></g>}
		</g>
		<g fill="#F2F6F8" opacity={0.55}>{flakes.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
	</Scene>; };

/* ===================================================================================================================
   V · the half-underground vault (section), 67.0–76.4 (KF12 at 75.0). C1: he comes in at street level through the door in
   the left wall and down the steps; 「两米」 draws on beat 120. C2 (the hush): the stack melts from six rows to two, the gauge
   drops to a third, drips hit the puddle on 70.63 / 71.762 / 72.894, 「约2/3 化掉」 at 73.0. C3: the three Zhou blocks ghost in on
   the stack; two melt, and on 74.26 (the music's return) the 「？」 pops and the third lands solid.
   =================================================================================================================== */
const VS = 760, VF = 860, VT = 460, VTH = 133, VL0 = 360, VL1 = VL0 + VTH, VR0 = 1427, VR1 = VR0 + VTH, VAX = (VL1 + VR0) / 2;
const STX = 640, BW = 92, RH = 50, GT = 520, GB = VF - 10, GX = 1350;
const DRIPS = [71.43, 72.0, 72.56, 73.13, 73.69];
const TWO_M = 69.5;   // the music's chord hit: the 两米 line lands
const vWx = (t: number) => { const v = vNat(128) * 1.15; return lerp(150, 575, seg(t, 67.45, 67.45 + 425 / v)); };
const vWy = (x: number) => x < VL1 ? VS : x < 560 ? lerp(VS, VF, (x - VL1) / (560 - VL1)) : VF;
const Vault: React.FC<{t: number}> = ({t}) => {
	const z = 1 + 0.035 * seg(t, 67.0, 76.4);
	const melt = seg(t, 70.4, 73.75) * 0.15 + 0.85 * ease(seg(t, 70.4, 73.75)), rows = lerp(6, 2, melt), fill = lerp(GT, GB - (GB - GT) / 3, melt);
	const hatch = (x0: number, x1: number, y0: number, y1: number, id: string) => <g>
		<clipPath id={id}><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} /></clipPath>
		<g clipPath={`url(#${id})`} stroke={B.gold} strokeOpacity={0.16} strokeWidth={1.5}>{Array.from({length: 40}, (_, i) => <path key={i} d={`M${x0 - 400 + i * 26},${y1} l400,-400`} />)}</g></g>;
	const dim = fade(t, TWO_M - 0.1, 0.35);
	const wx = vWx(t), wy = vWy(wx), wk = gait(vWx, t, 128, vNat(128));
	const blocks: React.ReactNode[] = [];
	for (let r = 0; r < 6; r++) { const left = rows - r; if (left <= 0) continue; const hk = Math.min(1, left);
		for (let c = 0; c < 4; c++) blocks.push(<IceBlock key={`${r}${c}`} x={STX + c * BW} y={VF - r * RH} w={BW - 4} h={(RH - 4) * hk} d={18} seed={r * 4 + c} marks={r === 1 || hk < 1} melt={hk < 1 ? 0.5 * (1 - hk) : 0} />); }
	const topY = VF - rows * RH;
	const gIn = fade(t, 73.5, 0.35), m1 = lerp(1, 0.5, ease(seg(t, 73.75, 74.26))), m2 = lerp(1, 0.26, ease(seg(t, 73.75, 74.26)));
	const pop = seg(t, 74.26, 74.7), solid = t >= 74.26, landY = solid ? -10 * Math.exp(-(t - 74.26) * 9) * Math.cos((t - 74.26) * 30) : 0;
	return <Scene id="vV" sheen={0.2}>
		<g transform={`translate(960,600) scale(${z}) translate(-960,-600)`}>
			<rect x={-40} y={VS} width={VL0 + 40} height={H - VS + 40} fill="#1C100B" /><rect x={VR1} y={VS} width={W - VR1 + 40} height={H - VS + 40} fill="#1C100B" />
			<rect x={VL0} y={VF} width={VR1 - VL0} height={H - VF + 40} fill="#1C100B" />
			<g fill={B.ochre} opacity={0.22}>{Array.from({length: 70}, (_, i) => { const side = i % 3, x = side === 0 ? rnd(i, 41) * (VL0 - 20) : side === 1 ? VR1 + 20 + rnd(i, 41) * (W - VR1 - 20) : VL0 + rnd(i, 41) * (VR1 - VL0), y = (side === 2 ? VF + 46 : VS + 16) + rnd(i, 42) * 200; return <circle key={i} cx={x} cy={y} r={2.2} />; })}</g>
			<path d={`M-40,${VS} H${VL0} M${VR1},${VS} H${W + 40}`} stroke={B.goldL} strokeWidth={3} opacity={0.75} />
			<g opacity={fade(t, 67.4, 0.4)}><Label x={150} y={VS - 16} s="地面" fs={40} col={B.goldL} /><Label x={VR1 + 30} y={VS - 16} s="地面" fs={40} col={B.goldL} /></g>
			<path d={`M${VL0},${VT} Q${VAX},${VT - 270} ${VR1},${VT} Z`} fill="#2A1712" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			<path d={`M${VL0 - 50},${VT + 6} L${VAX},${VT - 210} L${VR1 + 50},${VT + 6} L${VR1 + 40},${VT + 14} L${VAX},${VT - 196} L${VL0 - 40},${VT + 14} Z`} fill="#140A07" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			<path d={`M${VL1},${VF} V${VT} Q${VAX},${VT - 190} ${VR0},${VT} V${VF} Z`} fill="#160E0D" />
			<Pool id="vC" x={VAX} y={VF - 120} rx={520} ry={260} a={0.2} col="#9FD2EA" />
			{[[VL0, VL1], [VR0, VR1]].map(([a, b], i) => <g key={i}><rect x={a} y={VT} width={b - a} height={VF - VT + 30} fill="#3A2318" stroke={B.goldL} strokeOpacity={0.7} strokeWidth={2.5} />
				{hatch(a, b, VT, VF + 30, `vh${i}`)}
				{Array.from({length: 8}, (_, k) => <path key={k} d={`M${a},${VT + 50 * (k + 1)} H${b}`} stroke={B.gold} strokeOpacity={0.18} strokeWidth={1.2} />)}</g>)}
			{/* the door through the left wall at street level, and the steps down to the floor */}
			<rect x={VL0 - 2} y={VS - 128} width={VTH + 4} height={128} fill="#160E0D" stroke={B.goldL} strokeOpacity={0.6} strokeWidth={2} />
			<path d={Array.from({length: 5}, (_, i) => `M${VL1 + i * 13.4},${VS + i * 20} h13.4 v20`).join(' ') + ` L${VL1},${VF} Z`} fill="#2A1712" stroke={B.gold} strokeOpacity={0.45} strokeWidth={1.5} />
			<path d={`M${VL1},${VF} H${VR0}`} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			{/* 两米 */}
			<g opacity={dim}>
				<path d={`M${VL0},${VT - 6} V${VT - 70} M${VL1},${VT - 6} V${VT - 70}`} stroke={B.cream} strokeWidth={2} opacity={0.8} />
				<path d={`M${VL0 + 2},${VT - 50} H${lerp(VL0 + 2, VL1 - 2, ease(seg(t, TWO_M - 0.1, TWO_M + 0.25)))}`} stroke={B.cream} strokeWidth={3} />
				<path d={`M${VL0 + 2},${VT - 50} l16,-9 v18 Z M${VL1 - 2},${VT - 50} l-16,-9 v18 Z`} fill={B.cream} />
			</g>
			{t > TWO_M && <g transform={`translate(${(VL0 + VL1) / 2 - 40},${VT - 105}) scale(${lerp(1.3, 1, land(seg(t, TWO_M, TWO_M + 0.4)))})`}><Label x={0} y={15} s="两米" fs={52} col={B.cream} anchor="middle" /></g>}
			{/* the stack, melting; drips from its edge into the puddle */}
			<ellipse cx={STX + 4 * BW + 40} cy={VF + 2} rx={40 + 30 * melt} ry={7} fill={ICE.body} opacity={0.35 * melt + 0.1} />
			{blocks}
			{DRIPS.map((td, i) => { const u = seg(t, td - 0.38, td); if (t < td - 0.38 || t > td + 0.35) return null; const x0 = STX + 4 * BW + 6, y0 = topY + 10;
				return <g key={i}>{u < 1 && <path d={`M${x0 + 34 * u},${lerp(y0, VF - 2, u * u)} q-5,10 0,15 q5,-5 0,-15 Z`} fill={ICE.core} />}
					{t >= td && <ellipse cx={x0 + 34} cy={VF + 2} rx={10 + 60 * (t - td)} ry={3 + 10 * (t - td)} fill="none" stroke={ICE.core} strokeWidth={2} opacity={1 - (t - td) / 0.35} />}</g>; })}
			{/* the gauge */}
			<rect x={GX} y={GT} width={34} height={GB - GT} rx={17} fill="#0D0909" stroke={B.cream} strokeWidth={2.5} />
			<rect x={GX + 6} y={fill} width={22} height={GB - fill - 6} rx={11} fill={ICE.body} />
			{[0, 1, 2, 3].map((k) => <path key={k} d={`M${GX + 34},${GT + (GB - GT) * k / 3} h14`} stroke={B.cream} strokeWidth={2} />)}
			<g opacity={fade(t, 72.0, 0.3)}>
				<path d={`M${GX - 14},${GT + 4} h-12 V${fill - 4} h12`} fill="none" stroke={B.goldL} strokeWidth={3} />
				<g transform={`translate(${GX - 40},${(GT + fill) / 2})`}><rect x={-268} y={-40} width={256} height={62} rx={8} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2} />
					<text x={-140} y={6} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={44} fill={B.cream}>约2/3 化掉</text></g></g>
			{/* C3: the ghost blocks on the stack, the 「？」 above */}
			{gIn > 0 && <g opacity={gIn}>
				<MeltBlock x={STX + 6} y={topY - 4} w={108} h={88} k={m1} o={0.95} seed={4} />
				<MeltBlock x={STX + 126} y={topY - 4} w={108} h={88} k={m2} o={0.9} seed={5} />
				{solid ? <g transform={`translate(0,${landY})`}><IceBlock x={STX + 246} y={topY - 4} w={108} h={88} d={44} seed={11} /></g> : <MeltBlock x={STX + 246} y={topY - 4} w={108} h={88} k={1} o={0.9} seed={6} />}
				<g transform={`translate(${STX + 180},${topY - 190}) scale(${1 + 0.5 * pop})`} opacity={1 - pop}>
					{pop > 0 && Array.from({length: 10}, (_, i) => { const a = i * Math.PI / 5; return <path key={i} d={`M${Math.cos(a) * 52},${Math.sin(a) * 52} L${Math.cos(a) * 84},${Math.sin(a) * 84}`} stroke={B.goldL} strokeWidth={4} strokeLinecap="round" />; })}
					<text x={0} y={30} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={88} fill={B.goldL} opacity={0.9}>？</text></g>
			</g>}
			{t > 67.3 && <Wk x={wx} g={wy} h={128} pose={wk.pose} era="qing" T={t} />}
		</g>
	</Scene>; };

/* ===================================================================================================================
   C4 · the cellar window in the summer sun, 76.0–78.95: the clerk's seal lands on the slip on 76.523, the slip goes into his
   hand, he walks to the cellar mouth and a block comes out to him for it.
   C5 · the queue by grade, 78.5–81.2: three officials with slips; big, medium, small blocks land in their hands on beats.
   =================================================================================================================== */
const WG = 905, WH = 560;
const wWx = (t: number) => t < 77.55 ? 790 : 790 + trap(t, 77.55, 80, vNat(WH), 0.35, 0.01);
const CellarWall: React.FC<{cam: number; summer?: number}> = ({cam, summer = 1}) => <g transform={`translate(${-cam},0)`}>
	<rect x={-400} y={330} width={3000} height={WG - 330} fill="#2A1712" />
	<path d={Array.from({length: 12}, (_, i) => `M-400,${360 + i * 46} H2600`).join(' ')} stroke={B.gold} strokeOpacity={0.08} strokeWidth={1.5} />
	<path d="M-420,330 L-400,300 H2600 L2620,330 Z" fill="#1A0E09" stroke={B.gold} strokeOpacity={0.4} strokeWidth={2} />
	<Pool id="cwS" x={900} y={500} rx={1100} ry={420} a={0.32 * summer} col="#FFC070" />
	{/* the cellar mouth: a dark arch with the cold glow of ice inside */}
	<path d={`M1450,${WG} V600 Q1580,500 1710,600 V${WG} Z`} fill="#0C0A0C" stroke={B.goldL} strokeOpacity={0.5} strokeWidth={2.5} />
	<ellipse cx={1580} cy={WG - 40} rx={110} ry={60} fill="url(#iceGlow)" />
	<IceBlock x={1500} y={WG - 6} w={70} h={48} d={22} seed={31} marks={false} /><IceBlock x={1580} y={WG - 6} w={64} h={44} d={22} seed={32} marks={false} /><IceBlock x={1530} y={WG - 54} w={66} h={40} d={20} seed={33} marks={false} />
</g>;
const Window: React.FC<{t: number}> = ({t}) => {
	const cam = trap(t, 77.6, 80, 260, 0.6, 0.01), {x: wx, pose: wp0} = gait(wWx, t, WH, vNat(WH) * 0.8);
	const kx = 1150, kh = 520, sill = 720, seal = 76.523;
	const press = t < seal ? ease(seg(t, seal - 0.35, seal)) : 1 - ease(seg(t, seal + 0.08, seal + 0.4));
	const slipOn = t < 76.95, give = ease(seg(t, 76.95, 77.35));
	const slipPos: P2 = slipOn ? [1010, sill - 4] : [lerp(1010, wx + 0.3 * WH, give), lerp(sill - 4, WG - 0.55 * WH, give)];
	let kp = grounded({lean: 18, neck: 14, lt: 3, lk: 4, rt: -4, rk: 4, la: 50, le: 30, ra: 40, re: 30});
	kp = ikArm(kp, 'L', toBody(1030, lerp(sill - 70, sill - 18, press), kx, WG, kh, true));
	if (!slipOn && give < 1) kp = ikArm(kp, 'R', toBody(slipPos[0] + 30, slipPos[1] + 10, kx, WG, kh, true));
	let wp = wp0;
	if (t >= 76.95) wp = ikArm(wp, 'L', toBody(slipPos[0] - 6, slipPos[1] + 26, wx, WG, WH));
	const blockOut = ease(seg(t, BB(7) - 0.3, BB(7))), handed = t > BB(7);
	return <Scene id="cW" sheen={0.4}>
		<CellarWall cam={cam} />
		<g transform={`translate(${-cam},0)`}>
			{/* the cellar office window: the clerk inside, his seal coming down on the slip */}
			<rect x={930} y={430} width={420} height={sill - 430} fill="#120A08" stroke={B.goldL} strokeOpacity={0.55} strokeWidth={3} />
			<Extra x={kx} g={WG} h={kh} pose={kp} era="qing" flip look={{dress: 'robe', head: 'bald', beard: 'short', build: 1.06}} rimO={0.5} />
			<rect x={910} y={sill} width={460} height={22} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
			<rect x={930} y={sill + 22} width={420} height={WG - sill - 22} fill="#2A1712" />
			{(() => { const hd = J(kp, 'LHand', kx, WG, kh, true); return <g><rect x={hd[0] - 30} y={hd[1] + 2} width={26} height={22} rx={3} fill="#5A3A20" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.2} /><rect x={hd[0] - 28} y={hd[1] + 22} width={22} height={6} fill="#BF3420" /></g>; })()}
			<g transform={`translate(${slipPos[0]},${slipPos[1]}) rotate(${slipOn ? 0 : -8})`}>
				{slipOn ? <><path d="M-46,0 L46,0 L52,-12 L-40,-12 Z" fill="#EFE2C4" stroke="#8A6A3A" strokeWidth={1.2} />{t >= seal && <rect x={4} y={-11} width={22} height={9} fill="#BF3420" />}</>
					: <><rect x={-24} y={-96} width={48} height={96} fill="#EFE2C4" stroke="#8A6A3A" strokeWidth={1.5} />{[-10, 0, 10].map((dx, i) => <path key={i} d={`M${dx},-84 v14 m0,6 v10 m0,6 v14`} stroke="#22150F" strokeWidth={3} strokeLinecap="round" />)}<rect x={-12} y={-34} width={24} height={24} fill="#BF3420" /></>}
			</g>
			{t >= seal && t < seal + 0.3 && <g opacity={1 - (t - seal) / 0.3}>{Array.from({length: 6}, (_, i) => { const a = Math.PI * (1.1 + i * 0.16); return <path key={i} d={`M${1025 + Math.cos(a) * 30},${sill - 8 + Math.sin(a) * 30} l${Math.cos(a) * 22},${Math.sin(a) * 22}`} stroke={B.goldL} strokeWidth={3} strokeLinecap="round" />; })}</g>}
			<Floor g={WG} x0={-400} x1={2600} />
			<Pool id="cwF" x={wx + 60} y={WG + 4} rx={320} ry={42} a={0.3} />
			{blockOut > 0 && <IceBlock x={lerp(1520, wx + 0.28 * WH - 40, blockOut)} y={lerp(WG - 6, WG - 0.4 * WH, blockOut)} w={80} h={56} d={30} seed={34} />}
			<Wk x={wx} g={WG} h={WH} pose={handed ? ikArm(ikArm(wp, 'L', toBody(wx + 0.28 * WH - 36, WG - 0.4 * WH - 20, wx, WG, WH)), 'R', toBody(wx + 0.28 * WH + 36, WG - 0.4 * WH - 30, wx, WG, WH)) : wp} era="qing" T={t} />
		</g>
	</Scene>; };
const qX = (t: number) => -250 + trap(t, 78.45, 82, 470, 0.01, 0.01);
const Queue: React.FC<{t: number}> = ({t}) => {
	const {x: wx, pose: wp0} = gait(qX, t, WH, 470 * 0.8);
	const hands: [number, number, number, number][] = [[1260, 0.98, BB(9), 96], [1060, 1.0, BB(10), 74], [860, 0.97, BB(11), 54]];   // x, build, beat, block size
	return <Scene id="cQ" sheen={0.4}>
		<CellarWall cam={0} />
		<Floor g={WG} />
		{hands.map(([x, b, tb, s], i) => { const h = 430, has = t >= tb, k = has ? land(seg(t, tb, tb + 0.35)) : 0, bx = x + 0.3 * h, by = WG - 0.42 * h;
			let p = grounded({lean: 4, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 40, ra: 30, re: 50});
			p = ikArm(ikArm(p, 'L', toBody(bx - s / 2 + 4, by - s * 0.3, x, WG, h)), 'R', toBody(bx + s / 2 - 6, by - s * 0.4, x, WG, h));
			return <g key={i}>
				<Extra x={x} g={WG} h={h} pose={p} era="qing" look={{dress: 'robe', head: 'bald', build: b}} rimO={0.5} />
				{!has && <rect x={bx - 12} y={by - 60} width={24} height={50} fill="#EFE2C4" stroke="#8A6A3A" strokeWidth={1.2} />}
				{has && <g transform={`translate(${bx},${by}) scale(${0.6 + 0.4 * k}) translate(${-bx},${-by})`}><IceBlock x={bx - s / 2} y={by} w={s} h={s * 0.7} d={s * 0.35} seed={40 + i} /></g>}
			</g>; })}
		<Pool id="cqF" x={wx + 60} y={WG + 4} rx={300} ry={40} a={0.28} />
		<Wk x={wx} g={WG} h={WH} pose={wp0} era="qing" T={t} />
	</Scene>; };

/* ===================================================================================================================
   C6/C7 · the hutong, 80.8–86.95: the 酸梅汤 seller walks beside him, two brass bowls clanging in one hand on 81.617 and
   82.749; a head turns, a door opens. They stop; he takes a bowl of dark iced 酸梅汤 (84.1) and shivers on beat 20 (85.58).
   =================================================================================================================== */
const HG = 905, HH = 560;
const hWx = (t: number) => 900 + trap(t, 79, 83.75, 470, 0.01, 0.5) - trap(80.9, 79, 83.75, 470, 0.01, 0.5) + trap(t, 86.0, 90, vNat(HH), 0.4, 0.01);
const hCam = (t: number) => hWx(t) - lerp(900, 640, ease(seg(t, 80.9, 82.4)));
const Bowl2: React.FC<{x: number; y: number; open: number}> = ({x, y, open}) => <g>
	<path d={`M${x - 26},${y - 10 - open} Q${x - 22},${y + 8 - open} ${x},${y + 10 - open} Q${x + 22},${y + 8 - open} ${x + 26},${y - 10 - open} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.2} />
	<path d={`M${x - 26},${y + 10 + open} Q${x - 22},${y - 8 + open} ${x},${y - 10 + open} Q${x + 22},${y - 8 + open} ${x + 26},${y + 10 + open} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.2} />
</g>;
const Hutong: React.FC<{t: number}> = ({t}) => {
	const cam = hCam(t), {x: wx, pose: wp0} = gait(hWx, t, HH, 470 * 0.8);
	const sx = wx + 300, sp = gait(hWx, t, 520, 470 * 0.8).pose;
	const clangs = [BA(0) * 0 + 81.617, 82.749], open = (() => { let o = 18; for (const c of clangs) { if (t >= c - 0.14 && t < c) o = 18 * (c - t) / 0.14; else if (t >= c && t < c + 0.25) o = 18 * (t - c) / 0.25; } return o; })();
	let sPose = ikArm(sp, 'L', toBody(sx + 0.24 * 520, HG - 0.62 * 520, sx, HG, 520, true));
	sPose = ikArm(sPose, 'R', toBody(sx - 0.05 * 520, HG - 0.84 * 520, sx, HG, 520, true));
	const bh = J(sPose, 'LHand', sx, HG, 520, true);
	/* the bowl of 酸梅汤 handed over at 84.1, raised; the shiver on beat 20 */
	const giveK = ease(seg(t, 83.85, 84.25)), has = t >= 84.25, cupP: P2 = has ? [wx + 0.27 * HH, HG - lerp(0.6, 0.72, ease(seg(t, 84.6, 85.1))) * HH] : [lerp(bh[0] - 10, wx + 0.27 * HH, giveK), lerp(bh[1] + 30, HG - 0.6 * HH, giveK)];
	const shiv = t >= 85.58 && t < 86.0 ? Math.sin((t - 85.58) * 95) * 6 * (1 - (t - 85.58) / 0.42) : 0;
	let wp = wp0; if (t > 83.9) wp = ikArm(ikArm(wp, 'L', toBody(cupP[0] - 22 - shiv, cupP[1] + 14, wx, HG, HH)), 'R', toBody(cupP[0] + 22 - shiv, cupP[1] + 10, wx, HG, HH));
	const doorO = ease(seg(t, 82.749, 83.2)), headTurn = t > 81.7;
	const doors = [2300, 3100, 3900, 4700];
	return <Scene id="hH" sheen={0.25}>
		<g transform={`translate(${-cam},0)`}>
			<rect x={0} y={420} width={5200} height={HG - 420} fill="#221816" />
			<path d={Array.from({length: 10}, (_, i) => `M0,${450 + i * 46} H5200`).join(' ')} stroke="#C9B9A6" strokeOpacity={0.06} strokeWidth={2} />
			<path d="M-20,420 L0,392 H5200 L5220,420 Z" fill="#141010" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
			<Pool id="hS" x={cam + 900} y={520} rx={1100} ry={420} a={0.26} col="#FFC070" />
			{doors.map((x, i) => { const isO = i === 0, o = isO ? doorO : 0; return <g key={i}>
				<rect x={x - 10} y={540} width={200} height={HG - 540} fill={isO && o > 0 ? '#3A2416' : '#140C0A'} stroke={B.gold} strokeOpacity={0.4} strokeWidth={2} />
				{isO && o > 0 && <Pool id="hD" x={x + 90} y={HG - 120} rx={120} ry={180} a={0.4 * o} />}
				<path d={`M${x - 30},540 H${x + 210} L${x + 200},516 H${x - 20} Z`} fill="#1A1210" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.5} />
				<rect x={x} y={548} width={90 * (1 - 0.7 * o)} height={HG - 548} fill="#2A1712" stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.2} />
				<rect x={x + 90 + 90 * 0.7 * o} y={548} width={90 * (1 - 0.7 * o)} height={HG - 548} fill="#2A1712" stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.2} />
				{isO && o > 0.3 && <Extra x={x + 90} g={HG} h={430} pose={grounded({lean: 10, neck: 10, lt: 3, lk: 3, rt: -4, rk: 4, la: 10, le: 20, ra: 4, re: 12})} era="qing" flip look={{dress: 'robe', head: 'bun'}} rimO={0.5 * o} />}
			</g>; })}
			{/* a neighbour at the corner turns at the first clang */}
			<Extra x={1700} g={HG} h={440} pose={grounded({lean: 2, neck: headTurn ? 18 : 2, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 12, ra: 4, re: 12})} era="qing" flip={headTurn} look={{dress: 'tunic', legs: 'trousers', head: 'bald'}} rimO={0.45} />
			<Floor g={HG} x0={0} x1={5200} />
			<Pool id="hF" x={wx + 120} y={HG + 4} rx={420} ry={44} a={0.3} />
			{/* the seller: shoulder pole with two tubs, two brass bowls in his left hand */}
			{(() => { const sh = J(sPose, 'RHand', sx, HG, 520, true); return <g>
				<path d={`M${sh[0] - 170},${sh[1] + 6} L${sh[0] + 150},${sh[1] - 4}`} stroke="#8A6232" strokeWidth={8} strokeLinecap="round" />
				{[-160, 140].map((dx, i) => <g key={i}><path d={`M${sh[0] + dx},${sh[1]} L${sh[0] + dx - 20},${HG - 130} M${sh[0] + dx},${sh[1]} L${sh[0] + dx + 20},${HG - 130}`} stroke="#B08850" strokeWidth={2} />
					<path d={`M${sh[0] + dx - 40},${HG - 130} H${sh[0] + dx + 40} L${sh[0] + dx + 32},${HG - 40} H${sh[0] + dx - 32} Z`} fill="#3A2416" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} /></g>)}
			</g>; })()}
			<Extra x={sx} g={HG} h={520} pose={sPose} era="qing" flip look={{dress: 'tunic', legs: 'trousers', head: 'bald'}} rimO={0.6} />
			<Bowl2 x={bh[0] - 6} y={bh[1] - 20} open={open} />
			{clangs.map((c, i) => t >= c && t < c + 0.3 && <g key={i} opacity={1 - (t - c) / 0.3}>{Array.from({length: 7}, (_, k) => { const a = -Math.PI / 2 + (k - 3) * 0.4, r0 = 34 + 50 * (t - c), r1 = r0 + 20; return <path key={k} d={`M${bh[0] - 6 + Math.cos(a) * r0},${bh[1] - 20 + Math.sin(a) * r0} L${bh[0] - 6 + Math.cos(a) * r1},${bh[1] - 20 + Math.sin(a) * r1}`} stroke={BRZ.hi} strokeWidth={3.5} strokeLinecap="round" />; })}</g>)}
			{t > 83.85 && <g transform={`translate(${-shiv},0)`}><path d={`M${cupP[0] - 30},${cupP[1] - 18} Q${cupP[0] - 26},${cupP[1] + 8} ${cupP[0]},${cupP[1] + 10} Q${cupP[0] + 26},${cupP[1] + 8} ${cupP[0] + 30},${cupP[1] - 18} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.2} />
				<ellipse cx={cupP[0]} cy={cupP[1] - 18} rx={30} ry={7} fill="#4A140C" stroke={BRZ.hi} strokeWidth={1.5} />
				<IceCubes x={cupP[0] + 6} y={cupP[1] - 20} s={13} n={2} seed={3} /></g>}
			<g transform={`translate(${-shiv},0)`}><Wk x={wx} g={HG} h={HH} pose={wp} era="qing" T={t} /></g>
			{shiv !== 0 && <g stroke={B.cream} strokeWidth={3} strokeLinecap="round" opacity={0.7}><path d={`M${wx - 70},${HG - 0.8 * HH} l-16,-6 M${wx - 74},${HG - 0.7 * HH} l-18,0 M${wx + 90},${HG - 0.86 * HH} l14,-8`} /></g>}
		</g>
	</Scene>; };

/* ===================================================================================================================
   K · 乾隆's cloisonné box, 86.0–95.4 (KF13 at 92.0): he walks into the hot hall; 「“冰箱”」 floats over the box (K1); the front
   opens in section and cold breath curls out of each coin hole on the beats (K2); the cold spreads across the floor and the
   hall turns cool as he walks through it (K3).
   =================================================================================================================== */
const KG = 905, KHt = 640, KCX = 1040, KTOP = 548, KCH = 180, KCW = 324;
const kWx = (t: number) => t < 92.9 ? 680 - (trap(88.2, 80, 88.2, vNat(KHt), 0.01, 0.45) - trap(t, 80, 88.2, vNat(KHt), 0.01, 0.45)) : 680 + trap(t, 92.9, 99, vNat(KHt), 0.45, 0.01);
const Palace: React.FC<{t: number}> = ({t}) => {
	const {x: wx, pose: wp0} = gait(kWx, t, KHt, vNat(KHt) * 0.8);
	const reach = fade(t, 88.4, 0.5) * (1 - fade(t, 92.6, 0.35));
	let wp = wp0; if (reach > 0) { const p2 = ikArm(grounded({lean: 6, neck: 14, lt: 4, lk: 4, rt: -6, rk: 5, la: 60, le: 30, ra: 4, re: 12}), 'L', toBody(KCX - 150, KTOP - 50, wx, KG, KHt)); wp = mixPose(wp0, p2, reach); }
	const cool = fade(t, 92.6, 1.4), label = fade(t, 87.9, 0.3) * (1 - fade(t, 89.6, 0.4)), cut = fade(t, 89.6, 0.5);
	const breath = (i: number) => fade(t, BB(29) + i * 0.09, 0.4);
	return <Scene id="kP" sheen={0.3}>
		<rect x={-40} y={300} width={W + 80} height={KG - 300} fill={BG.wall} />
		{[[210, 380], [1330, 380]].map(([x0, w], i) => <g key={i}>
			<rect x={x0} y={340} width={w} height={360} fill="#C9782E" opacity={0.42 * (1 - 0.55 * cool)} />
			<path d={[...Array.from({length: 9}, (_, k) => `M${x0 + (k + 1) * w / 10},340 V700`), ...Array.from({length: 8}, (_, k) => `M${x0},${340 + (k + 1) * 40} H${x0 + w}`)].join(' ')} stroke="#2A140C" strokeWidth={6} />
			<rect x={x0} y={340} width={w} height={360} fill="none" stroke={B.gold} strokeOpacity={0.4} strokeWidth={3} />
			<path d={`M${x0 + 20},700 L${x0 + w - 20},700 L${x0 + w + 180},${KG} L${x0 + 140},${KG} Z`} fill="#FFB060" opacity={0.07 * (1 - cool)} /></g>)}
		{[120, 780, 1220, 1820].map((x0, i) => <rect key={i} x={x0} y={260} width={50} height={KG - 260} fill="#3A140E" stroke={BG.line} strokeWidth={1.2} />)}
		<rect x={-40} y={262} width={W + 80} height={40} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<Pool id="kW" x={KCX - 60} y={600} rx={640} ry={420} a={0.34 * (1 - 0.6 * cool)} />
		<Pool id="kC" x={KCX - 60} y={760} rx={1100 * (0.3 + 0.7 * cool)} ry={460} a={0.24 * cool} col="#9FD2EA" />
		<Floor g={KG} lattice={false} />
		<path d={Array.from({length: 5}, (_, i) => `M-40,${KG + 20 + i * 36} H${W + 40}`).join(' ') + ' ' + Array.from({length: 22}, (_, i) => `M${-40 + i * 96},${KG} l${(i - 11) * 12},180`).join(' ')} stroke={B.gold} strokeOpacity={0.1} strokeWidth={1.5} />
		{(() => { const st = KTOP + KCH, cx = KCX, cw = KCW; return <g>
			<rect x={cx - cw / 2 - 20} y={st} width={cw + 100} height={20} fill="#2E1610" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
			<path d={`M${cx - cw / 2 - 6},${st + 20} Q${cx - cw / 2 - 20},${st + 110} ${cx - cw / 2 + 4},${KG} H${cx - cw / 2 + 20} Q${cx - cw / 2 + 6},${st + 100} ${cx - cw / 2 + 18},${st + 20} Z M${cx + cw / 2 + 44},${st + 20} Q${cx + cw / 2 + 58},${st + 110} ${cx + cw / 2 + 34},${KG} H${cx + cw / 2 + 18} Q${cx + cw / 2 + 32},${st + 100} ${cx + cw / 2 + 20},${st + 20} Z`} fill="#2E1610" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.2} /></g>; })()}
		<IceChest x={KCX} top={KTOP} w={KCW} h={KCH} cut={cut} breath={[0, 1, 2, 3].map(breath)} T={t} />
		{/* the cold sinking off the stand and spreading over the floor (K3) */}
		<g filter="url(#mist)" opacity={0.14 + 0.12 * fade(t, 90.7, 1)}>{[[-1, 0], [1, 0]].map(([d], i) => <ellipse key={i} cx={KCX + d * (150 + 500 * cool)} cy={KG - 8} rx={150 + 500 * cool} ry={14 + 6 * cool} fill="#DCEFF9" />)}</g>
		<Pool id="kF" x={wx + 40} y={KG + 4} rx={280} ry={40} a={0.26} />
		<Walker51 x={wx} g={KG} h={KHt} pose={wp} look={LA.qing.look} qing T={t} />
		{label > 0 && <g opacity={label} transform={`translate(${KCX + 40},${KTOP - 120 - 20 * label})`}><Label x={0} y={0} s="“冰箱”" fs={56} col={B.cream} anchor="middle" /></g>}
	</Scene>; };

/* ===================================================================================================================
   M1 · the 19th-century machine, 94.0–98.2: a steam-era compressor (flywheel, piston, pipes) frosts over and makes a block of
   ice by itself in its tank; he walks in in the modern jacket, watches, walks on.
   =================================================================================================================== */
const MG = 905, MH = 560;
const mWx = (t: number) => t < 96.9 ? 1000 - (trap(95.7, 90, 95.7, vNat(MH), 0.01, 0.45) - trap(t, 90, 95.7, vNat(MH), 0.01, 0.45)) : 1000 + trap(t, 96.9, 101, vNat(MH), 0.4, 0.01);
const Machine: React.FC<{t: number}> = ({t}) => {
	const {x: wx, pose: wp} = gait(mWx, t, MH, vNat(MH) * 0.8), rot = t * 160, frost = fade(t, 94.9, 2.0), blk = ease(seg(t, 95.3, 96.9)), DROP = 96.9;
	const fw: P2 = [520, 620], R = 190, crank: P2 = [fw[0] + 60 * Math.cos(rot * Math.PI / 180), fw[1] + 60 * Math.sin(rot * Math.PI / 180)];
	const tank = {x: 1180, y: 600, w: 380, h: 300};
	return <Scene id="mM" sheen={0.2}>
		<rect x={-40} y={240} width={W + 80} height={MG - 240} fill="#1E1210" />
		<path d={Array.from({length: 14}, (_, i) => `M-40,${270 + i * 46} H${W + 40}`).join(' ') + ' ' + Array.from({length: 60}, (_, i) => `M${(i % 2) * 45 + (i >> 1) * 90 - 40},${270 + (i % 14) * 46} v46`).join(' ')} stroke={B.gold} strokeOpacity={0.05} strokeWidth={1.5} />
		<Pool id="mP" x={900} y={600} rx={800} ry={420} a={0.28} />
		{/* pipes overhead, frosting */}
		<path d={`M380,360 H1500 V${tank.y} M700,360 V520 M1500,360 H1620 V${tank.y + 40}`} fill="none" stroke="#3A3E42" strokeWidth={26} strokeLinejoin="round" />
		<path d={`M380,360 H1500 V${tank.y} M700,360 V520 M1500,360 H1620 V${tank.y + 40}`} fill="none" stroke="#EAF6FF" strokeWidth={26} strokeLinejoin="round" opacity={0.55 * frost} strokeDasharray="14 10" />
		{[600, 900, 1200].map((x, i) => <rect key={i} x={x - 18} y={344} width={36} height={32} fill="#2A2D31" stroke="#8E959B" strokeOpacity={0.4} />)}
		{/* the flywheel and the piston (steam-era compressor; generic) */}
		<circle cx={fw[0]} cy={fw[1]} r={R} fill="none" stroke="#4A4E52" strokeWidth={22} />
		<circle cx={fw[0]} cy={fw[1]} r={R} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
		{Array.from({length: 6}, (_, i) => { const a = (rot + i * 60) * Math.PI / 180; return <path key={i} d={`M${fw[0]},${fw[1]} L${fw[0] + R * Math.cos(a)},${fw[1] + R * Math.sin(a)}`} stroke="#4A4E52" strokeWidth={10} />; })}
		<circle cx={fw[0]} cy={fw[1]} r={26} fill="#5A5E62" stroke={B.gold} strokeOpacity={0.4} />
		<rect x={760} y={560} width={260} height={110} rx={10} fill="#33373B" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
		<path d={`M${crank[0]},${crank[1]} L${780 + 40 * Math.cos(rot * Math.PI / 180)},${615}`} stroke="#8E959B" strokeWidth={10} strokeLinecap="round" />
		<path d={`M1020,615 H${tank.x}`} stroke="#3A3E42" strokeWidth={22} /><path d={`M1020,615 H${tank.x}`} stroke="#EAF6FF" strokeWidth={22} opacity={0.5 * frost} strokeDasharray="12 9" />
		<rect x={440} y={810} width={820} height={95} fill="#2A2D31" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
		{/* the freezing tank: a cut-away window; inside, a block grows out of the cold (nothing is put in) */}
		<rect x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={8} fill="#2A2D31" stroke={B.gold} strokeOpacity={0.4} strokeWidth={2.5} />
		<rect x={tank.x + 40} y={tank.y + 40} width={tank.w - 80} height={tank.h - 70} fill="#101418" stroke={B.cream} strokeWidth={2} strokeDasharray="9 7" />
		<rect x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={8} fill="#EAF6FF" opacity={0.12 * frost} />
		<g opacity={t >= DROP ? 1 : 0.35 + 0.45 * blk}><clipPath id="mclip"><rect x={tank.x + 40} y={tank.y + tank.h - 30 - 190 * blk} width={tank.w - 80} height={200} /></clipPath>
			<g clipPath="url(#mclip)"><IceBlock x={tank.x + 90} y={tank.y + tank.h - 36} w={200} h={180} d={0.1} seed={51} /></g></g>
		{t >= DROP && t < DROP + 0.45 && <g opacity={1 - (t - DROP) / 0.45}><rect x={tank.x + 90} y={tank.y + tank.h - 216} width={200 + 30 * (t - DROP)} height={180} fill="none" stroke="#FFFFFF" strokeWidth={5} />{Array.from({length: 8}, (_, k) => { const a = k * Math.PI / 4, r0 = 120 + 160 * (t - DROP); return <path key={k} d={`M${tank.x + 190 + Math.cos(a) * r0},${tank.y + tank.h - 126 + Math.sin(a) * r0} l${Math.cos(a) * 24},${Math.sin(a) * 24}`} stroke="#F4FBFF" strokeWidth={4} strokeLinecap="round" />; })}</g>}
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M${tank.x + 6 + rnd(i, 61) * (tank.w - 12)},${tank.y + 4} l${-4 + 8 * rnd(i, 62)},${10 + 20 * rnd(i, 63) * frost}`} stroke="#F4FBFF" strokeWidth={3} strokeLinecap="round" opacity={frost} />)}
		<Floor g={MG} />
		<Pool id="mF" x={wx + 60} y={MG + 4} rx={300} ry={42} a={0.3} />
		<Walker51 x={wx} g={MG} h={MH} pose={wp} look={LA.today.look} T={t} />
	</Scene>; };

/* ===================================================================================================================
   M2/M3 · the village grid, 97.75–103.4 (KF14 at 100.0): one window lights on beat 43 (98.599), the sliver on 99.165, the
   panel's 1.22 lands; 2024: the rows light, fridge icons spill past the edge (101.995 / 102.561), the 全国 panel lands with the
   农村 one kept beside it.
   =================================================================================================================== */
const GX0 = 150, GY0 = 288, GCW = 96, GCH = 60;
const gWx = (t: number) => t < 100.3 ? 1400 + (trap(100.0, 98.1, 100.0, 353, 0.01, 0.4) - trap(t, 98.1, 100.0, 353, 0.01, 0.4)) : 1400 + trap(t, 100.6, 104, 330, 0.4, 0.01);
const Grid: React.FC<{t: number}> = ({t}) => {
	const stars = Array.from({length: 40}, (_, i) => [rnd(i, 51) * W, 250 + rnd(i, 52) * 120, 1 + 1.5 * rnd(i, 53)]);
	const in1 = (r: number) => fade(t, 97.5 + r * 0.02, 0.2), lit1 = t >= BB(43), sl = t >= BB(44) ? 0.22 : 0;
	const rowLit = (r: number) => fade(t, 101.0 + (9 - r) * 0.1, 0.12);   // 2024: rows light from the bottom up
	const spill = [BB(49), BB(49) + 0.09, BB(49) + 0.18, BB(50), BB(50) + 0.09];
	const walkingIn = t < 100.3, gw = gait(gWx, t, 355, 300 * 0.8);
	const houses: React.ReactNode[] = [];
	for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
		const x = GX0 + c * GCW, y = GY0 + r * GCH, wall = y + GCH * 0.42, ww = GCW * 0.78, wx0 = x + (GCW - ww) / 2, win = {x: x + GCW / 2 - 17, y: wall + 6, w: 34, h: 20};
		const isLit = r === 5 && c === 3, isSl = r === 5 && c === 4, L = Math.max(rowLit(r), isLit && lit1 ? 1 : 0);
		houses.push(<g key={`${r}-${c}`} opacity={in1(r)}>
			<rect x={wx0} y={wall} width={ww} height={GCH - (wall - y) - 4} fill="#33201A" stroke={B.gold} strokeOpacity={0.18} strokeWidth={1} />
			<path d={rnd(r * 10 + c, 61) > 0.5 ? `M${wx0 - 6},${wall + 2} L${x + GCW / 2},${y + 4} L${wx0 + ww + 6},${wall + 2} Z` : `M${wx0 - 8},${wall + 2} Q${x + GCW / 2},${y + 2} ${wx0 + ww + 8},${wall + 2} Z`} fill="#1E100B" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.4} />
			<rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#140A07" stroke="#C9A060" strokeOpacity={0.75} strokeWidth={1.6} />
			{L > 0 && <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#EAF6FF" opacity={L} />}
			{isSl && sl > 0 && L < 1 && <rect x={win.x} y={win.y} width={win.w * sl} height={win.h} fill="#EAF6FF" />}
		</g>); }
	const p1 = ease(seg(t, 101.0, 101.4)), p2 = land(seg(t, BB(48), BB(48) + 0.4)), num1 = land(seg(t, BB(44), BB(44) + 0.4)), pan1 = fade(t, 98.3, 0.35);
	const P1x = lerp(1210, 1290, p1), P1y = lerp(300, 268, p1), P1s = lerp(1, 0.75, p1);
	return <Scene id="gG" sheen={0.15}>
		<g fill="#E8E0D0" opacity={0.35}>{stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
		<path d={`M-40,${GY0 + 30} Q400,${GY0 - 40} 900,${GY0 + 10} Q1400,${GY0 + 50} 1960,${GY0 - 10} V${H} H-40 Z`} fill="#1A0E0A" />
		{houses}
		{lit1 && rowLit(5) < 1 && (() => { const x = GX0 + 3 * GCW, wy = GY0 + 5 * GCH + GCH * 0.42 + 6; return <g opacity={fade(t, BB(43), 0.12)}>
			<ellipse cx={x + GCW / 2} cy={wy + 10} rx={GCW * 0.9} ry={GCH * 0.75} fill="url(#iceGlow)" />
			<rect x={x + GCW / 2 - 17} y={wy} width={34} height={20} fill="#EAF6FF" stroke="#FFFFFF" strokeWidth={1.5} /><rect x={x + GCW / 2 - 6} y={wy + 3} width={11} height={17} fill="#BFD6E0" /></g>; })()}
		{spill.map((ts, i) => { const k = land(seg(t, ts, ts + 0.3)); if (k <= 0) return null; const fx = GX0 + 10 * GCW + 14, fy = GY0 + 60 + i * 62;
			return <g key={i} transform={`translate(${fx + 20},${fy + 25}) scale(${k}) translate(${-fx - 20},${-fy - 25})`}>
				<clipPath id={`sp${i}`}><rect x={fx - 2} y={fy - 2} width={i === 4 ? 0.8 * 30 : 40} height={60} /></clipPath>
				<g clipPath={`url(#sp${i})`}><FridgeIcon x={fx} y={fy} h={52} /></g></g>; })}
		<Floor g={935} />
		<Pool id="gW" x={gw.x} y={939} rx={240} ry={34} a={0.26} />
		<RimFig x={gw.x} ground={935} h={355} pose={walkingIn || gw.k > 0.05 ? gw.pose : grounded({lean: 0, neck: -18, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 14, ra: 4, re: 12})} look={LA.today.look} col={B.lac} flip={walkingIn} dx={walkingIn ? -3 : 3} dy={-2.5} />
		{pan1 > 0 && <g opacity={pan1} transform={`translate(${P1x},${P1y}) scale(${P1s})`}><rect x={0} y={0} width={500} height={250} rx={12} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2.5} />
			<text x={250} y={70} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={56} fill={B.cream}>农村 · 每百户</text>
			<FridgeIcon x={44} y={110} h={110} />
			{num1 > 0 && <g transform={`translate(290,170) scale(${lerp(1.3, 1, num1)}) translate(-290,-170)`} opacity={cl(num1 * 3)}><text x={290} y={204} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={132} fill={B.goldL}>1.22<tspan fontSize={64} dx={10}>台</tspan></text></g>}</g>}
		{p2 > 0 && <g opacity={cl(p2 * 3)} transform={`translate(1210,${480 + 20 * (1 - p2)})`}><rect x={0} y={0} width={500} height={250} rx={12} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2.5} />
			<text x={250} y={70} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={56} fill={B.cream}>全国 · 每百户</text>
			<text x={250} y={204} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={128} fill={B.goldL}>104.8<tspan fontSize={60} dx={8}>台</tspan></text></g>}
	</Scene>; };

/* ===================================================================================================================
   M3→M4 · your kitchen, 103.0–106.2: he opens the same fridge (its light comes on) and drops ice cubes into the frame-0 cup;
   they land on 104.259 (the clink).
   =================================================================================================================== */
const KX = 800, KH2 = 600, KTOPC = 590, CUPX = 930, CLINK = 104.259;
const Kitchen: React.FC<{t: number}> = ({t}) => {
	const open = 0.9 * ease(seg(t, 103.05, 103.5)), drop = seg(t, CLINK - 0.21, CLINK), inCup = t >= CLINK;
	const handTo = ease(seg(t, 103.3, 103.65)) * (1 - ease(seg(t, 103.7, 104.0)));
	const rh: P2 = [lerp(CUPX + 4, 1060, handTo), lerp(KTOPC - 150, 500, handTo)];
	let p = grounded({lean: 10, neck: 14, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 40, ra: 50, re: 50});
	p = ikArm(ikArm(p, 'L', toBody(CUPX - 46, KTOPC - 60, KX, 905, KH2)), 'R', toBody(rh[0] - 6, rh[1] + 22, KX, 905, KH2));
	const cubeY = lerp(rh[1] - 10, KTOPC - 70, drop * drop), push = 1 + 0.01 * seg(t, 103.0, 106.2);
	return <Scene id="kK" sheen={0.15}>
		<g transform={`translate(960,560) scale(${push}) translate(-960,-560)`}>
			<rect x={-40} y={0} width={W + 80} height={H} fill="#140A07" opacity={0.5} />
			<path d={Array.from({length: 12}, (_, i) => `M${-40 + i * 90},330 V${KTOPC}`).join(' ') + ` M-40,420 H1100 M-40,510 H1100`} stroke={B.gold} strokeOpacity={0.06} strokeWidth={1.5} />
			<Fridge x0={1270} y0={145} w={420} h={760} open={open} light={open / 0.9} id="kfr" />
			<rect x={-40} y={KTOPC} width={1160} height={905 - KTOPC} fill="#1E100B" /><rect x={-40} y={KTOPC} width={1160} height={4} fill={B.gold} opacity={0.32} />
			<path d={Array.from({length: 5}, (_, i) => `M${40 + i * 220},${KTOPC + 30} h180 v${905 - KTOPC - 60} h-180 Z`).join(' ')} fill="none" stroke={B.gold} strokeOpacity={0.12} strokeWidth={1.5} />
			<Floor g={905} lattice={false} />
			<Cup x={CUPX} y={KTOPC} w={92} frost={0.4 + 0.4 * seg(t, CLINK, CLINK + 1)} ice={inCup} />
			{!inCup && <g transform={`translate(0,${cubeY - (rh[1] - 10)})`}><IceCubes x={t < CLINK - 0.21 ? rh[0] + 4 : CUPX} y={rh[1] - 10} s={28} n={2} seed={7} /></g>}
			{inCup && t < CLINK + 0.35 && <g opacity={1 - (t - CLINK) / 0.35}>{Array.from({length: 8}, (_, k) => { const a = -Math.PI * (0.15 + 0.7 * k / 7), r0 = 50 + 60 * (t - CLINK), r1 = r0 + 18; return <path key={k} d={`M${CUPX + Math.cos(a) * r0},${KTOPC - 124 + Math.sin(a) * r0 * 0.6} L${CUPX + Math.cos(a) * r1},${KTOPC - 124 + Math.sin(a) * r1 * 0.6}`} stroke="#F4FBFF" strokeWidth={3} strokeLinecap="round" />; })}</g>}
			<Pool id="kkF" x={KX + 40} y={909} rx={280} ry={40} a={0.24} />
			<Walker51 x={KX} g={905} h={KH2} pose={p} look={LA.today.look} T={t} />
		</g>
	</Scene>; };

/* ===================================================================================================================
   P1 · the walk as one line, 105.8–109.0 (KF15 at 107.5): pulls back from today's fridge (the kitchen) to the whole line;
   snow starts inside every cold thing on 冬天 (beat 57, 106.524); he walks in from the right to the end of the line.
   P2 · 108.0–: the camera pushes into today's fridge, which frosts by itself (no ice put in); the air holds; end card.
   =================================================================================================================== */
const P1F: P2 = [1500, 655];
const p1Wx = (t: number) => 1640 + (trap(107.4, 105.9, 107.4, 230, 0.01, 0.4) - trap(t, 105.9, 107.4, 230, 0.01, 0.4));
const P1: React.FC<{t: number}> = ({t}) => {
	const out = eout(seg(t, 105.85, 107.4)), inn = ease(seg(t, 107.95, 108.95));
	/* starts matched to the kitchen fridge (x0 1270, w 420: centre 1480, 525), so the dissolve shows one fridge */
	const z = lerp(lerp(2.8, 1, out), 3.47, inn), fx = lerp(lerp(P1F[0], 960, out), P1F[0], inn), fy = lerp(lerp(P1F[1], 540, out), P1F[1], inn);
	const sx = lerp(lerp(1480, 960, out), 960, inn), ty = lerp(lerp(525, 540, out), 590, inn);
	const g = gait(p1Wx, t, 330, 230 * 0.8);
	return <Scene id="p1" sheen={0.2}>
		<g transform={`translate(${sx},${ty}) scale(${z}) translate(${-fx},${-fy})`}>
			<P1Line t={t} snow={fade(t, BB(57) - 0.05, 0.3)} wx={g.x} wpose={g.pose} />
		</g>
	</Scene>; };
const P2: React.FC<{t: number}> = ({t}) => {
	const frost = ease(seg(t, 109.2, 111.6)), push = 1 + 0.03 * seg(t, 108.8, 112.75);
	return <Scene id="p2" sheen={0.2}>
		<g transform={`translate(960,590) scale(${push}) translate(-960,-590)`}><P2Shot frost={frost} t={t} /></g>
		<rect x={700} y={160} width={520} height={860} fill="#EAF6FF" opacity={0.05 * bump(t, 111.6, 1.2)} />
	</Scene>; };

/* ===================================================================================================================
   END · the Juno end card, 112.75–119.25 (KF16): the P2 shot dims; the J seal presses on 112.75; title; the question (centred,
   76 px, trailing ？ pulled ½ em); the follow pill by 114.6; sources; fade to black 118.75–119.25.
   =================================================================================================================== */
const END_Q = '你家冰箱里，现在冻着什么？';
const EndCard: React.FC<{t: number}> = ({t}) => {
	const T0 = 112.75, dim = fade(t, T0 - 0.1, 0.45), seal = land(seg(t, T0, T0 + 0.4)), title = fade(t, T0 + 0.35, 0.4), q = fade(t, T0 + 0.7, 0.4), src = fade(t, T0 + 1.3, 0.4), pill = t > 114.6 ? land(seg(t, 114.6, 115.0)) : 0;
	const fs = 76, tw = fs * 13 * 1.03;
	return <>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${0.72 * dim})`}} />
		{t >= T0 && <Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, opacity: cl(seal * 3), transform: `rotate(-6deg) scale(${lerp(1.7, 1, seal)})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, opacity: title}}>古代没有冰<span style={{marginRight: '-0.05em'}}>箱</span><br />夏天怎么吃冰<span style={{marginRight: '-0.55em'}}>？</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: q, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 + 10 * (1 - q), opacity: q, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{END_Q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>？</span></div>
		{pill > 0 && <div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold, opacity: cl(pill * 2), transform: `scale(${lerp(0.9, 1, pill)})`}}>关注 Juno · 一起看懂世界</div>}
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 905, textAlign: 'center', fontFamily: SANS, fontSize: 21, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.72 * src}}>{SOURCES51.map((s, i) => <div key={i}>{s}</div>)}</div>
		<div style={{position: 'absolute', inset: 0, background: '#000', opacity: seg(t, 118.75, 119.25)}} />
	</>; };

/* ===================================================================================================================
   assembly: wipes (a foreground object passes; its centre crosses the walker on a beat), dissolves where the walker is in
   one shot only (or in the same place), and dips through dark where he would otherwise be doubled.
   =================================================================================================================== */
type SC = React.FC<{t: number}>;
const Lay: React.FC<{C: SC; t: number; o?: number}> = ({C, t, o = 1}) => o <= 0 ? null : <div style={{position: 'absolute', inset: 0, opacity: o}}><C t={t} /></div>;
const diss = (t: number, A: SC, Bc: SC, a: number, b: number) => <><Lay C={A} t={t} o={t < b ? 1 : 0} /><Lay C={Bc} t={t} o={fade(t, a, b - a)} /></>;
const dip = (t: number, A: SC, Bc: SC, a: number, b: number, m: number) => t < m ? <Lay C={A} t={t} o={1 - 0.85 * fade(t, a, m - a)} /> : <Lay C={Bc} t={t} o={0.15 + 0.85 * fade(t, m, b - m)} />;
const wipe = (t: number, A: SC, Bc: SC, cross: number, kind: PillarKind, x0: number, id: string) => <WipeSplit t={t} cross={cross} kind={kind} id={id} x0={x0} oldP={<A t={t} />} newP={<Bc t={t} />} />;
const SongMoat: SC = ({t}) => { const x0 = sWalkerScreen(BA(110)); Q_HX = x0; return wipe(t, SongStreet, Moat, BA(110), 'vermilion', x0, 'b1'); };
const HutPal: SC = ({t}) => wipe(t, Hutong, Palace, BB(22), 'door', hWx(BB(22)) - hCam(BB(22)), 'b2');
const PalMac: SC = ({t}) => wipe(t, Palace, Machine, BB(36), 'pipe', kWx(BB(36)), 'b3');
const P1P2: SC = ({t}) => <><Lay C={P1} t={t} o={t < 108.95 ? 1 : 0} /><Lay C={P2} t={t} o={fade(t, 108.65, 0.3)} /></>;
export const PartB: React.FC<{t: number}> = ({t}) => <div style={{position: 'absolute', inset: 0, background: '#0A0503', overflow: 'hidden'}}>
	{t < 66.95 ? <SongMoat t={t} />
		: t < 67.35 ? diss(t, Moat, Vault, 66.95, 67.35)
		: t < 76.1 ? <Vault t={t} />
		: t < 76.45 ? dip(t, Vault, Window, 76.1, 76.45, 76.25)
		: t < 78.5 ? <Window t={t} />
		: t < 78.8 ? diss(t, Window, Queue, 78.5, 78.8)
		: t < 80.8 ? <Queue t={t} />
		: t < 81.05 ? diss(t, Queue, Hutong, 80.8, 81.05)
		: t < 90.5 ? <HutPal t={t} />
		: t < 97.75 ? <PalMac t={t} />
		: t < 98.1 ? diss(t, Machine, Grid, 97.75, 98.1)
		: t < 103.0 ? <Grid t={t} />
		: t < 103.35 ? diss(t, Grid, Kitchen, 103.0, 103.35)
		: t < 105.8 ? <Kitchen t={t} />
		: t < 106.1 ? diss(t, Kitchen, P1, 105.8, 106.1)
		: <P1P2 t={t} />}
	{t >= 112.6 && <EndCard t={t} />}
</div>;
void rnd; void curl; void Label; void IceHeap; void ICE; void MeltBlock; void J; void Glint;

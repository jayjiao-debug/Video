import React from 'react';
import {W, H, rnd, lerp, PP, AU, Sheet, Band, Bg, Cloud, Xiangyun, Moon, Mirror, Hairpin, Ring, Bangle, Pearl, Quince, JadeBi, Phone, AvatarArt, Pager, RedPacket, Bike, Watch, Sewing, Radio, Hall, Lantern, Fence, Tree, Scroll, TokGlow} from './kit47';
import {Rimmed, Look4} from '../qq44/kit44';
import {Pose} from '../qq44/figure44';
import {jointAt, reg, PZ, walkNat, STRIDE, GAIT_S} from './pose47';
import {mixPose} from '../qq44/figure44';
/* ep47 scenes. Each scene takes u = seconds since the scene started (and d = its length).
   People are cut-paper figures (ink with a paper-white edge), placed from their bodies and registered for check47. */
const cl = (v: number) => Math.max(0, Math.min(1, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const ease = (v: number) => { const x = cl(v); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (v: number) => 1 - Math.pow(1 - cl(v), 3);
export const BEAT = 0.56605;
export const Cam: React.FC<{x?: number; y?: number; z?: number; children: React.ReactNode}> = ({x = 960, y = 540, z = 1, children}) =>
	<g transform={`translate(960,540) scale(${z}) translate(${-x},${-y})`}>{children}</g>;
export type SceneP = {u: number; d: number; tag?: string};

/* ---------- people ---------- */
export const LK: Record<string, Look4> = {
	zhouGirl: {dress: 'dress', head: 'bun'}, zhouBoy: {dress: 'tunic', head: 'guan', legs: 'trousers'},
	xu: {dress: 'robe', head: 'guan', sleeves: 'wide'}, princess: {dress: 'robe', head: 'bun', sleeves: 'wide'}, servant: {dress: 'tunic', head: 'bald', legs: 'trousers', beard: 'short'},
	yang: {dress: 'robe', head: 'bun', sleeves: 'wide'}, fangshi: {dress: 'robe', head: 'guan', beard: 'long', sleeves: 'wide'}, emperor: {dress: 'robe', head: 'futou', beard: 'full', sleeves: 'wide'},
	groom70: {dress: 'jacket', head: 'short', legs: 'trousers'}, bride70: {dress: 'jacket', head: 'bob', legs: 'trousers'},
	man: {dress: 'shirt', head: 'young', legs: 'trousers'}, woman: {dress: 'dress', head: 'long'},
	guard: {dress: 'tunic', head: 'bowl', legs: 'trousers'}, yangsu: {dress: 'robe', head: 'guan', beard: 'full', sleeves: 'wide'},
};
type FigP = {frame: string; who: string; x: number; g: number; h: number; pose: Pose; look: Look4; flip?: boolean; o?: number; col?: string};
/** a cut-paper person; registered for the body-logic check */
export const Fig: React.FC<FigP> = ({frame, who, x, g, h, pose, look, flip, o = 1, col = PP.ink}) => {
	reg({frame, who, x, ground: g, h, pose, flip, intent: 'stand'});
	return <g opacity={o} filter="url(#pdS)"><Rimmed x={x} ground={g} h={h} pose={pose} look={look} col={col} flip={flip} rim={PP.edge} rimOp={0.85} rimDx={-2.6} rimDy={-1.8} /></g>;
};
const hand = (p: Pose, n: 'LHand' | 'RHand', x: number, g: number, h: number, flip = false) => jointAt(p, n, x, g, h, flip);

/* =====================================================================================
   OPEN · two phones on a table, one couple avatar split across them; a mirror half slides into the gap
   ===================================================================================== */
export const Open: React.FC<SceneP> = ({u}) => {
	const apart = ease(seg(u, 0.555, 1.9)), mirrorIn = ease(seg(u, 5.66, 6.9)), z = 1 + 0.04 * seg(u, 0, 9);
	const gap = 640 * apart;
	return <g>
		<Bg c={PP.ochreL} c2={PP.ochre} id="opbg" />
		<Sheet c="#B9864A" d={Band(760, 14, 3)} />
		{Array.from({length: 6}, (_, i) => <path key={i} d={`M0,${800 + i * 50} Q960,${790 + i * 52} 1920,${806 + i * 50}`} stroke="#8F6334" strokeWidth={3} fill="none" opacity={0.35} />)}
		<Cam z={z} y={560}>
			<Phone x={960 - 162 - gap / 2} y={560} s={0.95} side="L" id="opL" glow={0.5 + 0.3 * apart} />
			<Phone x={960 + 162 + gap / 2} y={560} s={0.95} side="R" id="opR" glow={0.5 + 0.3 * apart} />
			{mirrorIn > 0 && <g opacity={mirrorIn} transform={`translate(0,${(1 - mirrorIn) * 420})`}><Mirror x={960} y={474} r={150} id="opm" half="L" gap={0} /></g>}
		</Cam>
	</g>;
};
export const TitleScene: React.FC<SceneP> = ({u}) => {
	const close = ease(seg(u, 0, 0.5)), z = 1.0 + 0.03 * seg(u, 0, 2.8);
	return <g>
		<Bg c={PP.night} c2={PP.indigo2} id="tbg" />
		{Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={rnd(i, 2) * 600} r={1.5 + rnd(i, 3) * 2.5} fill={PP.cream} opacity={0.4 + 0.4 * rnd(i, 4)} />)}
		<Xiangyun x={300} y={860} s={1.6} c={PP.indigo2} /><Xiangyun x={1640} y={900} s={1.8} c={PP.indigo2} />
		<Cam z={z}><Mirror x={960} y={380} r={240} id="tm" half="both" gap={(1 - close) * 260} glow={1.2} /></Cam>
	</g>;
};

/* =====================================================================================
   诗经 · spring, a fence; she tosses a quince over it, he catches it; he gives back a jade pendant
   ===================================================================================== */
export const Shijing: React.FC<SceneP> = ({u}) => {
	const g = 900, h = 560, FX = 980;
	/* where they stop at the fence so that his right hand (offerR) meets her left hand (offer) over the top rail */
	const gStop = FX - PZ.offer.LHand[0] * h - 6, bStop = FX + PZ.offerR.RHand[0] * h + 6;
	const gw = walkNat(u, 3.0, 3.0 + (gStop - 640) / (STRIDE * h / GAIT_S), 640, 1, h, PZ.stand);
	const bw = walkNat(u, 3.0, 3.0 + (1300 - bStop) / (STRIDE * h / GAIT_S), 1300, -1, h, PZ.stand);
	const giveK = ease(seg(u, 4.7, 5.7)), take = ease(seg(u, 5.9, 6.8)), close = ease(seg(u, 9.2, 12.4));
	/* her: toss (0–0.9), relax, walk, offer to receive, then hold the pendant at her chest */
	const girlPose = u < 0.9 ? PZ.toss : u < 1.5 ? mixPose(PZ.toss, PZ.offer, ease(seg(u, 0.9, 1.5))) : u < 3.0 ? mixPose(PZ.offer, PZ.stand, ease(seg(u, 1.5, 2.4))) : gw.moving ? gw.pose : u < 5.9 ? mixPose(PZ.stand, PZ.offer, giveK) : mixPose(PZ.offer, PZ.holdChest, take);
	const gx = u < 3.0 ? 640 : gw.x;
	/* him: watches, catches with both hands (catch_), walks to the fence, offers the jade over it with the right hand */
	const boyPose = u < 2.2 ? mixPose(PZ.stand, PZ.catch_, ease(seg(u, 1.0, 2.0))) : u < 3.0 ? mixPose(PZ.catch_, PZ.stand, ease(seg(u, 2.4, 3.0))) : bw.moving ? bw.pose : u < 5.9 ? mixPose(PZ.stand, PZ.offerR, giveK) : mixPose(PZ.offerR, PZ.stand, take);
	const bx = u < 3.0 ? 1300 : bw.x;
	const [tx, ty] = hand(PZ.toss, 'LHand', 640, g, h);
	const cL = hand(PZ.catch_, 'LHand', 1300, g, h, true), cR = hand(PZ.catch_, 'RHand', 1300, g, h, true), [cx, cy] = [(cL[0] + cR[0]) / 2, (cL[1] + cR[1]) / 2];
	const fly = seg(u, 0.9, 2.1);
	/* the quince: in her hand → arc → his hands → his left hand (at his side, also while walking) */
	const qL = hand(boyPose, 'LHand', bx, g, h, true);
	const [qx, qy] = u < 0.9 ? [tx, ty] : u < 2.1 ? [lerp(tx, cx, fly), lerp(ty, cy, fly) - 300 * Math.sin(fly * Math.PI)] : u < 2.4 ? [cx, cy] : qL;
	/* the jade: in his right hand from 3.0 (taken from his belt as he turns), handed over the rail, then in her left hand */
	const jB = hand(boyPose, 'RHand', bx, g, h, true), jG = hand(girlPose, 'LHand', gx, g, h);
	const [jx, jy] = u < 5.9 ? jB : jG;
	const people = 1 - close;
	return <g>
		<Bg c={PP.skyL} c2="#F6E7C8" id="sjbg" />
		<Moon x={1580} y={200} r={70} c="#FFF2CF" />
		<Cloud x={1250} y={170} s={0.9} c={PP.cream} />
		<Sheet c={PP.sage} d={Band(640, 40, 11)} /><Sheet c={PP.leaf} d={Band(760, 30, 12)} />
		<Tree x={200} g={820} s={1.2} blossom /><Tree x={1740} g={830} s={1.05} c={PP.sage} c2={PP.leaf} blossom />
		<Sheet c="#A9C48C" d={Band(g - 10, 8, 13)} />
		<g opacity={people}>
			<Fig frame="Shijing" who="girl" x={gx} g={g} h={h} pose={girlPose} look={LK.zhouGirl} />
			<Fig frame="Shijing" who="boy" x={bx} g={g} h={h} pose={boyPose} look={LK.zhouBoy} flip />
			<Fence x0={FX - 70} x1={FX + 70} y={g + 6} h={250} />
			<Quince x={qx} y={qy + (u < 2.1 ? 0 : 26)} s={0.42} rot={u < 2.1 ? fly * 300 : 0} />
			{u >= 3.0 && <JadeBi x={jx} y={jy + 46} s={0.36} glow={0.8} />}
		</g>
		{close > 0 && <g opacity={close}><Quince x={lerp(700, 820, close)} y={540} s={1.25} rot={-8} /><JadeBi x={lerp(1220, 1100, close)} y={520} s={1.25} glow={1} /></g>}
	</g>;
};
/* =====================================================================================
   东汉 · a lamp-lit study: the poem on a scroll; its gifts land on a lacquer tray; the pairs light up
   ===================================================================================== */
const DH_COLS = [{t: '何以致拳拳'}, {t: '綰臂雙金環', k: 1}, {t: '何以致慇勤'}, {t: '約指一雙銀', k: 2}, {t: '何以致區區'}, {t: '耳中雙明珠', k: 1}, {t: '何以結中心'}, {t: '素縷連雙針', k: 3}];
export const Donghan: React.FC<SceneP> = ({u}) => {
	const land = (a: number) => easeOut(seg(u, a, a + 0.5)), lit = seg(u, 10.2, 10.8);
	const drop = (a: number, y: number) => lerp(y - 300, y, land(a));
	return <g>
		<Bg c="#7A4A2E" c2="#4E2E22" id="dhbg" />
		<circle cx={1500} cy={260} r={420} fill={AU.hi} opacity={0.12} />
		{/* oil lamp on a stand */}
		<g filter="url(#pd)"><rect x={1590} y={420} width={20} height={420} fill={PP.ink} /><ellipse cx={1600} cy={420} rx={60} ry={16} fill={PP.ochre} /><path d="M1600,404 C1584,380 1592,350 1600,330 C1608,350 1616,380 1600,404 Z" fill={AU.hi} /><ellipse cx={1600} cy={842} rx={80} ry={18} fill={PP.ink} /></g>
		<TokGlow x={1600} y={370} r={160} o={0.8} />
		<Sheet c="#2E1E18" d={Band(860, 6, 21)} />
		<Scroll x={240} y={440} w={720} h={440} cols={DH_COLS.map((c) => ({t: c.t, lit: !!c.k && lit > 0.5}))} />
		{/* lacquer tray */}
		<Sheet c={PP.lacquer} sh="pdL" d="M1010,760 L1530,760 L1490,830 L1050,830 Z" /><Sheet c="#2A1210" d="M1050,830 L1490,830 L1490,846 L1050,846 Z" sh="none" />
		{u > 2.8 && <Bangle x={1110} y={drop(2.8, 730)} r={66} />}
		{u > 4.0 && <><Pearl x={1240} y={drop(4.0, 720)} /><Pearl x={1286} y={drop(4.0, 726)} /></>}
		{u > 5.1 && <><Ring x={1380 - 120 * ease(seg(u, 12.0, 13.4))} y={drop(5.1, 742)} r={38} /><Ring x={1448 + 120 * ease(seg(u, 12.0, 13.4))} y={drop(5.15, 746)} r={38} /></>}
		{u > 5.1 && <TokGlow x={1414} y={742} r={130} o={land(5.1)} />}
		{lit > 0 && DH_COLS.map((c, i) => c.k ? <circle key={i} cx={240 + 720 - 60 - i * 80 + 22} cy={440 + 70 + (c.k === 2 ? 4 : c.k === 3 ? 3 : 2) * 48 - 20} r={34} fill={AU.hi} opacity={0.35 * lit} /> : null)}
	</g>;
};

/* =====================================================================================
   破镜 · palace at night; he breaks a bronze mirror and gives her one half
   ===================================================================================== */
const XU_X = 760, PR_X = 1180, PG = 940, PH = 600;
export const Pojing1: React.FC<SceneP> = ({u}) => {
	/* he holds the mirror by the rim with both hands (catch_); it cracks (2.6); his right hand offers the right half to her,
	   his left hand keeps the left half at his side; she takes it with her left hand; then both raise their halves to the moon */
	const crack = seg(u, 2.4, 2.9), give = ease(seg(u, 3.4, 4.6)), raise = ease(seg(u, 5.2, 6.6)), fire = 0.6 + 0.4 * Math.sin(u * 3.1);
	const XX = 700, R = 64;
	const prX = XX + PZ.offerR.RHand[0] * PH + PZ.offer.LHand[0] * PH + 10;
	const xuPose = u < 3.4 ? PZ.catch_ : u < 5.2 ? mixPose(PZ.catch_, PZ.offerR, give) : mixPose(PZ.offerR, PZ.holdUp, raise);
	const prPose = u < 3.4 ? PZ.stand : u < 5.2 ? mixPose(PZ.stand, PZ.offer, give) : mixPose(PZ.offer, PZ.holdUp, raise);
	const xL = hand(xuPose, 'LHand', XX, PG, PH), xR = hand(xuPose, 'RHand', XX, PG, PH), pL = hand(prPose, 'LHand', prX, PG, PH, true);
	const mid: [number, number] = [(xL[0] + xR[0]) / 2 + 30, (xL[1] + xR[1]) / 2 - 20];
	/* who holds which half: before 3.4 both halves sit together in his hands; from 3.4 the right half rides his right hand
	   until 4.6, then her left hand; the left half rides his left hand */
	const rightAt: [number, number] = u < 3.4 ? mid : u < 4.6 ? [xR[0] + R * 0.5, xR[1] - 30] : [pL[0] + R * 0.5, pL[1] - 30];
	const leftAt: [number, number] = u < 3.4 ? mid : [xL[0] - R * 0.3, xL[1] - 30];
	return <g>
		<Bg c={PP.night} c2={PP.indigo} id="pj1" />
		<Moon x={1460} y={170} r={64} />
		<g opacity={fire}><Sheet c="#C8664A" d={Band(560, 40, 31)} o={0.55} /></g>
		<Sheet c={PP.indigo2} d={Band(600, 26, 32)} />
		<Hall cx={960} g={700} k={0.85} lit />
		<Sheet c="#3A4778" d={Band(PG - 4, 4, 33)} />
		<Fig frame="Pojing1" who="xu" x={XX} g={PG} h={PH} pose={xuPose} look={LK.xu} />
		<Fig frame="Pojing1" who="princess" x={prX} g={PG} h={PH} pose={prPose} look={LK.princess} flip />
		{u < 2.6 ? <Mirror x={mid[0]} y={mid[1]} r={R} id="pj1w" half="both" gap={0} />
			: <><Mirror x={leftAt[0]} y={leftAt[1]} r={R} id="pj1l" half="L" gap={u < 3.4 ? 8 * crack : 0} tilt={-4} />
				<Mirror x={rightAt[0]} y={rightAt[1]} r={R} id="pj1r" half="R" gap={u < 3.4 ? 8 * crack : 0} tilt={4} /></>}
		{crack > 0 && crack < 1 && <circle cx={mid[0]} cy={mid[1]} r={110 * crack} fill={AU.core} opacity={0.6 * (1 - crack)} />}
	</g>;
};
/** the market on the fifteenth: lanterns; two halves lie apart (the promise) */
export const Market: React.FC<SceneP> = ({u}) => {
	const sway = (i: number) => Math.sin(u * 1.6 + i) * 4;
	return <g>
		<Bg c={PP.night} c2="#4A3A6A" id="mk" />
		<Moon x={300} y={170} r={80} c="#FFF0C8" />
		<path d="M1120,70 Q1520,170 1940,80" stroke={PP.ink} strokeWidth={4} fill="none" />
		{Array.from({length: 4}, (_, i) => { const x = 1220 + i * 200; return <Lantern key={i} x={x + sway(i)} y={250 + Math.sin(i * 1.3) * 20} s={0.8} c={i % 3 === 1 ? PP.apricot : '#D8473A'} />; })}
		{[180, 520].map((x, i) => <Lantern key={`l${i}`} x={x + sway(i + 5)} y={560} s={0.6} c={i ? PP.apricot : '#D8473A'} />)}
		<Sheet c="#5B4A80" d={Band(640, 20, 41)} />
		{[[200, 520], [700, 560], [1240, 540], [1700, 520]].map(([x, w], i) => <g key={i}><Sheet c={i % 2 ? PP.brick : PP.teal} d={`M${x - w / 4},700 L${x - w / 4 - 30},640 L${x + w / 4 + 30},640 L${x + w / 4},700 Z`} /><Sheet c={PP.ochre} d={`M${x - w / 4},700 L${x + w / 4},700 L${x + w / 4},800 L${x - w / 4},800 Z`} /></g>)}
		<Sheet c="#3C3060" d={Band(820, 6, 42)} />
		<Mirror x={760} y={560} r={110} id="mkL" half="L" gap={0} glow={0.9} tilt={-8} /><Mirror x={1160} y={560} r={110} id="mkR" half="R" gap={0} glow={0.9} tilt={8} />
	</g>;
};
/** the city falls; she is led in through the gate of 杨素's house */
export const Gate: React.FC<SceneP> = ({u}) => {
	/* she is led in: two guards walk ahead of her toward the gate (all at walking speed, feet on the ground) */
	const g = 930, h = 450, w = walkNat(u, 0.1, 2.6, 1860, -1, h, PZ.stand), a = walkNat(u, 0.1, 2.6, 1600, -1, h, PZ.stand), b = walkNat(u, 0.1, 2.6, 1420, -1, h, PZ.stand);
	const [mx, my] = hand(w.pose, 'RHand', w.x, g, h, true);
	return <g>
		<Bg c="#6D5A7A" c2="#B88E86" id="gt" />
		<Sheet c="#8C6E86" d={Band(560, 30, 51)} />
		<Sheet c={PP.brick} d="M360,930 L360,380 L1560,380 L1560,930 Z" />
		<Sheet c={PP.indigo} sh="pdL" d="M300,390 L420,290 L1500,290 L1620,390 Z" />
		<Sheet c={PP.lacquer} d="M700,930 L700,420 L1220,420 L1220,930 Z" />
		<Sheet c="#2A1210" d={`M${960 - 120 * seg(u, 0, 0.6)},930 L${960 - 120 * seg(u, 0, 0.6)},430 L${960 + 120 * seg(u, 0, 0.6)},430 L${960 + 120 * seg(u, 0, 0.6)},930 Z`} sh="none" />
		{Array.from({length: 5}, (_, r) => Array.from({length: 6}, (_, c) => <circle key={`${r}${c}`} cx={740 + c * 88} cy={470 + r * 88} r={9} fill={AU.mid} />))}
		<Sheet c="#7E6A6E" d={Band(g - 4, 4, 52)} />
		<Fig frame="Gate" who="guard1" x={b.x} g={g} h={h * 1.04} pose={b.pose} look={LK.guard} flip />
		<Fig frame="Gate" who="guard2" x={a.x} g={g} h={h * 1.04} pose={a.pose} look={LK.guard} flip />
		<Fig frame="Gate" who="princess" x={w.x} g={g} h={h} pose={w.pose} look={LK.princess} flip />
		<Mirror x={mx} y={my + 8} r={22} id="gtm" half="R" gap={0} glow={0.6} />
	</g>;
};
/** he walks the long road to the capital; seasons pass */
export const Road: React.FC<SceneP> = ({u, d}) => {
	const k = seg(u, 0, d), g = 900, h = 420, w = walkNat(u, 0, d + 1, 560, 1, h, PZ.stand);
	const [mx, my] = hand(w.pose, 'RHand', w.x, g, h);
	return <g>
		<Bg c={k > 0.5 ? '#E9D8B4' : PP.skyL} c2="#F3E3C4" id="rd" />
		<Sheet c={PP.tealL} d={Band(520, 60, 61)} /><Sheet c={PP.teal} d={Band(640, 50, 62)} />
		<Sheet c={k > 0.5 ? PP.ochreL : PP.sage} d={Band(760, 30, 63)} />
		<Sheet c={PP.ivory2} d={Band(g - 30, 6, 64)} />
		{[260, 1640].map((x, i) => <Tree key={i} x={x} g={g - 40} s={0.8} c={k > 0.5 ? PP.ochre : PP.leaf} c2={k > 0.5 ? PP.brick : PP.leafD} />)}
		<Fig frame="Road" who="xu" x={w.x} g={g} h={h} pose={w.pose} look={LK.xu} />
		<Mirror x={mx + 4} y={my + 8} r={22} id="rdm" half="L" gap={0} glow={0.5} />
	</g>;
};
/** a servant at a stall holds up a half mirror; he arrives with the other half */
export const Stall: React.FC<SceneP> = ({u}) => {
	/* the servant holds the right half out over his counter; he walks in, stops, raises his left half with his right
	   hand, and the two men bring the halves together between them */
	const g = 930, h = 520, sx = 1300, R = 60;
	const sH = hand(PZ.offer, 'LHand', sx, g, h, true), J: [number, number] = [sH[0] - 6, sH[1] - 34];
	const xStop = J[0] - PZ.offerR.RHand[0] * h - 6, v = STRIDE * h / GAIT_S, wk = walkNat(u, 0, (xStop - 300) / v, 300, 1, h, PZ.stand);
	const tEnd = (xStop - 300) / v, raise = ease(seg(u, tEnd + 0.15, tEnd + 0.75));
	const xuPose = wk.moving ? wk.pose : mixPose(PZ.stand, PZ.offerR, raise);
	const xR = hand(xuPose, 'RHand', wk.x, g, h);
	return <g>
		<Bg c={PP.night} c2="#4A3A6A" id="st" />
		{Array.from({length: 4}, (_, i) => <Lantern key={i} x={1220 + i * 210} y={210 + (i % 2) * 40} s={0.7} c={i % 3 === 1 ? PP.apricot : '#D8473A'} />)}
		<Sheet c="#5B4A80" d={Band(620, 20, 71)} />
		<Sheet c={PP.brick} d="M1050,600 L1074,600 L1074,770 L1050,770 Z" /><Sheet c={PP.brick} d="M1586,600 L1610,600 L1610,770 L1586,770 Z" />
		<Sheet c={PP.teal} d="M1040,600 L1000,540 L1660,540 L1620,600 Z" />
		<Fig frame="Stall" who="servant" x={sx} g={g} h={h} pose={PZ.offer} look={LK.servant} flip />
		<Sheet c={PP.ochre} d="M1060,770 L1620,770 L1620,940 L1060,940 Z" />
		<Sheet c="#3C3060" d={Band(g - 4, 4, 72)} />
		<Mirror x={J[0]} y={J[1]} r={R} id="stR" half="R" gap={0} glow={1} />
		<Fig frame="Stall" who="xu" x={wk.x} g={g} h={h} pose={xuPose} look={LK.xu} />
		<Mirror x={raise > 0 ? lerp(xR[0], J[0], raise) : xR[0] + 4} y={raise > 0 ? lerp(xR[1] - 10, J[1], raise) : xR[1] + 8} r={raise > 0 ? lerp(22, R, raise) : 22} id="stL" half="L" gap={0} glow={0.6 + 0.4 * raise} />
	</g>;
};
/** close-up: the two halves meet and the crack lines up */
export const Meet: React.FC<SceneP> = ({u}) => {
	const k = ease(seg(u, 0.2, 1.6)), flash = seg(u, 1.6, 2.3);
	return <g>
		<Bg c={PP.indigo} c2={PP.night} id="mt" />
		<Mirror x={960} y={540} r={300} id="mtm" half="both" gap={(1 - k) * 700} glow={1 + flash * 0.6} />
		{flash > 0 && flash < 1 && <circle cx={960} cy={540} r={300 + 400 * flash} fill="none" stroke={AU.core} strokeWidth={10} opacity={1 - flash} />}
	</g>;
};
/** the gate opens; she walks out to him */
export const Return: React.FC<SceneP> = ({u}) => {
	/* 杨素 (in the gateway, facing out) lets her go; she walks out to her husband, who waits facing her */
	const g = 930, h = 450, open = ease(seg(u, 0, 0.8)), wk = walkNat(u, 0.5, 1.9, 1000, 1, h, PZ.stand);
	return <g>
		<Bg c="#F0C99A" c2="#F6E3C2" id="rt" />
		<Sheet c="#D9A27E" d={Band(560, 30, 81)} />
		<Sheet c={PP.brick} d="M360,930 L360,380 L1560,380 L1560,930 Z" />
		<Sheet c={PP.indigo} sh="pdL" d="M300,390 L420,290 L1500,290 L1620,390 Z" />
		<Sheet c="#FFE9C0" d="M700,930 L700,420 L1220,420 L1220,930 Z" sh="none" />
		<Sheet c={PP.lacquer} d={`M700,930 L700,420 L${960 - 250 * open},420 L${960 - 250 * open},930 Z`} /><Sheet c={PP.lacquer} d={`M${960 + 250 * open},930 L${960 + 250 * open},420 L1220,420 L1220,930 Z`} />
		<Sheet c="#BE8F78" d={Band(g - 4, 4, 82)} />
		<Fig frame="Return" who="yangsu" x={830} g={g} h={h * 1.06} pose={PZ.stand} look={LK.yangsu} />
		<Fig frame="Return" who="princess" x={wk.x} g={g} h={h} pose={wk.pose} look={LK.princess} />
		<Fig frame="Return" who="xu" x={1560} g={g} h={h} pose={PZ.stand} look={LK.xu} flip />
	</g>;
};
/* =====================================================================================
   唐 · cloud palace: she gives one prong to the messenger; below, the emperor holds it; above, she keeps the other
   ===================================================================================== */
export const Tang: React.FC<SceneP> = ({u}) => {
	/* Two storeys: the cloud palace (ground 560) above, the emperor's palace (ground 1640) below.
	   She holds the hairpin in both hands, pulls it into two prongs (3.4), hands the right one to the messenger (方士),
	   keeps the left. He walks off right; the camera goes down; he walks in from the right and hands it to 玄宗; then the
	   camera pulls back to show both: she looks down holding hers, he looks up holding his. */
	const g = 560, h = 380, yx = 760, eg = 1640, eh = 420, ex = 980;
	const fx = yx + PZ.offerR.RHand[0] * h + PZ.offer.LHand[0] * h + 8;
	const give = ease(seg(u, 5.7, 6.6)), split = seg(u, 3.3, 3.8);
	const yPose = u < 5.7 ? PZ.catch_ : u < 7.0 ? mixPose(PZ.catch_, PZ.offerR, give) : mixPose(PZ.offerR, PZ.holdChest, ease(seg(u, 7.0, 7.8)));
	const fOut = walkNat(u, 7.0, 8.4, fx, 1, h, PZ.offer);
	const fPose = u < 5.7 ? PZ.stand : u < 7.0 ? mixPose(PZ.stand, PZ.offer, give) : fOut.pose;
	const meet = ex + PZ.offer.LHand[0] * eh + PZ.offerR.RHand[0] * eh + 8, vIn = STRIDE * eh / GAIT_S, tIn0 = 8.4, tIn1 = tIn0 + (1640 - meet) / vIn;
	const fIn = walkNat(u, tIn0, tIn1, 1640, -1, eh, PZ.stand), hand2 = ease(seg(u, tIn1 + 0.1, tIn1 + 0.8));
	const f2Pose = fIn.moving ? fIn.pose : mixPose(PZ.stand, PZ.offerR, hand2);
	const ePose = u < tIn1 + 0.1 ? PZ.stand : u < tIn1 + 1.2 ? mixPose(PZ.stand, PZ.offer, hand2) : mixPose(PZ.offer, PZ.lookUpHold, ease(seg(u, tIn1 + 1.2, tIn1 + 2.0)));
	const down = ease(seg(u, 7.6, 8.5)), back = ease(seg(u, tIn1 + 1.0, tIn1 + 1.8));
	const camY = lerp(400, 1480, down), z = lerp(1.3, 0.5, back), cy = lerp(camY, 1100, back);
	const yL = hand(yPose, 'LHand', yx, g, h), yR = hand(yPose, 'RHand', yx, g, h), fL = hand(fPose, 'LHand', fOut.x, g, h, u < 7.0);
	const f2R = hand(f2Pose, 'RHand', fIn.x, eg, eh, true), eL = hand(ePose, 'LHand', ex, eg, eh);
	const pinMid: [number, number] = [(yL[0] + yR[0]) / 2 + 20, (yL[1] + yR[1]) / 2 - 40];
	const keptAt: [number, number] = u < 3.3 ? pinMid : [yL[0], yL[1] - 50];
	const sentAt: [number, number] = u < 3.3 ? pinMid : u < 6.6 ? [yR[0] + 6, yR[1] - 50] : u < 8.4 ? [fL[0], fL[1] - 50] : u < tIn1 + 0.8 ? [f2R[0], f2R[1] - 54] : [eL[0], eL[1] - 54];
	return <g>
		<Bg c={PP.lav} c2={PP.indigo2} id="tg" />
		<g transform={`translate(960,540) scale(${z}) translate(${-960},${-cy})`}>
			<rect x={-2000} y={-1200} width={6000} height={2380} fill={PP.lavL} />
			<Cloud x={420} y={200} s={1.6} c="#F2ECF8" /><Cloud x={1560} y={250} s={1.3} c="#F2ECF8" />
			<Sheet c="#E9E1F3" d="M200,600 C160,540 300,500 400,520 C460,470 640,470 700,510 C800,470 1100,470 1160,512 C1260,480 1500,490 1560,540 C1700,530 1820,580 1760,610 Z" />
			<Hall cx={1060} g={g - 30} k={0.55} wall={PP.rose} roof={PP.plum} />
			<Fig frame="Tang" who="yang" x={yx} g={g} h={h} pose={yPose} look={LK.yang} />
			{u < 8.4 && <Fig frame="Tang" who="fangshi" x={fOut.x} g={g} h={h} pose={fPose} look={LK.fangshi} flip={u < 7.0} />}
			<Hairpin x={keptAt[0]} y={keptAt[1]} s={0.5} prong={u < 3.3 ? 'both' : 'L'} glow={0.8} />
			{u >= 3.3 && u < 8.4 && <Hairpin x={sentAt[0]} y={sentAt[1]} s={0.5} prong="R" glow={0.8} />}
			{split > 0 && split < 1 && <circle cx={pinMid[0]} cy={pinMid[1]} r={80 * split} fill={AU.core} opacity={0.6 * (1 - split)} />}
			<path d="M1700,610 C1850,800 1700,1000 1900,1200" stroke="#F2ECF8" strokeWidth={60} fill="none" opacity={0.7} />
			<rect x={-2000} y={1180} width={6000} height={1400} fill={PP.indigo2} />
			<Sheet c={PP.indigo} d="M-2000,1400 L-2000,1260 C0,1230 1000,1300 3900,1250 L3900,1400 Z" />
			<Hall cx={560} g={eg} k={0.7} wall={PP.brick} roof={PP.indigo} />
			<rect x={-2000} y={eg - 4} width={6000} height={1400} fill="#5A6798" />
			<Fig frame="Tang" who="emperor" x={ex} g={eg} h={eh} pose={ePose} look={LK.emperor} />
			{u >= tIn0 && <Fig frame="Tang" who="fangshi2" x={fIn.x} g={eg} h={eh} pose={f2Pose} look={LK.fangshi} flip />}
			{u >= tIn0 && <Hairpin x={sentAt[0]} y={sentAt[1]} s={0.55} prong="R" glow={0.9} />}
		</g>
	</g>;
};
/* =====================================================================================
   1970s · courtyard wedding: 囍 on the door; the four things stamp in; then the price of a bicycle
   ===================================================================================== */
export const Seventies: React.FC<SceneP> = ({u}) => {
	/* true scale: the bike's wheel reaches about the groom's knee-to-hip; the sewing machine on its own table, the radio on a
	   side table; the watch is ON the groom's wrist, shown by a ring callout. Each thing drops onto its surface on a beat. */
	const g = 930, h = 520, gx = 860, bx = 1060, land = (a: number) => easeOut(seg(u, a, a + 0.22)), price = seg(u, 5.66, 6.2);
	const wr = hand(PZ.stand, 'LHand', gx, g, h);
	const wheel = 0.21 * h, bs = wheel / 120;
	return <g>
		<Bg c="#CFE3E4" c2="#F3EBDD" id="s7" />
		<Sheet c="#C9B9A2" d="M0,700 L0,300 L1920,300 L1920,700 Z" />
		{Array.from({length: 10}, (_, r) => Array.from({length: 24}, (_, c) => <rect key={`${r}${c}`} x={(c + (r % 2) * 0.5) * 82 - 40} y={300 + r * 40} width={78} height={36} fill="#BCA98E" opacity={0.5} />))}
		<Sheet c={PP.lacquer} d="M820,700 L820,360 L1100,360 L1100,700 Z" />
		<text x={960} y={560} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={900} fontSize={190} fill="#E9473A" filter="url(#pdS)">囍</text>
		<Sheet c="#D9CBB2" d={Band(700, 4, 101)} />
		<Sheet c={PP.brick} d="M1200,760 L1420,760 L1420,780 L1200,780 Z" /><Sheet c={PP.brick} d="M1218,780 L1232,780 L1232,930 L1218,930 Z" /><Sheet c={PP.brick} d="M1388,780 L1402,780 L1402,930 L1388,930 Z" />
		<Sheet c={PP.ochre} d="M1500,800 L1800,800 L1800,820 L1500,820 Z" /><Sheet c={PP.ink} d="M1520,820 L1536,820 L1536,930 L1520,930 Z" /><Sheet c={PP.ink} d="M1764,820 L1780,820 L1780,930 L1764,930 Z" />
		<Fig frame="Seventies" who="groom" x={gx} g={g} h={h} pose={PZ.stand} look={LK.groom70} />
		<Fig frame="Seventies" who="bride" x={bx} g={g} h={h} pose={PZ.stand} look={LK.bride70} flip />
		{u > 2.83 && <g transform={`translate(0,${-(1 - land(2.83)) * 260})`} opacity={land(2.83)}><Bike x={450} y={g - wheel} s={bs} /></g>}
		{u > 3.4 && <g opacity={land(3.4)}><circle cx={wr[0]} cy={wr[1] - 6} r={26} fill="none" stroke={AU.hi} strokeWidth={5} /><line x1={wr[0] - 18} y1={wr[1] - 24} x2={wr[0] - 110} y2={wr[1] - 140} stroke={AU.hi} strokeWidth={4} /><Watch x={wr[0] - 160} y={wr[1] - 210} s={0.45} /></g>}
		{u > 3.96 && <g transform={`translate(0,${-(1 - land(3.96)) * 240})`} opacity={land(3.96)}><Sewing x={1650} y={757} s={0.62} /></g>}
		{u > 4.53 && <g transform={`translate(0,${-(1 - land(4.53)) * 240})`} opacity={land(4.53)}><Radio x={1310} y={700} s={0.5} /></g>}
		{price > 0 && <g opacity={price} transform={`translate(450,${640 - 20 * price})`} filter="url(#pd)">
			<rect x={-150} y={-60} width={300} height={110} rx={12} fill={PP.cream} /><text x={0} y={12} textAnchor="middle" fontFamily="'Noto Sans CJK SC',sans-serif" fontWeight={900} fontSize={54} fill={PP.ink}>百余元</text></g>}
		{price > 0 && [0, 1, 2].map((i) => <g key={i} opacity={easeOut(seg(u, 5.9 + i * 0.28, 6.2 + i * 0.28))} transform={`translate(${1530 + i * 60},${400 + i * 26}) rotate(${-6 + i * 5})`} filter="url(#pd)">
			<rect x={-140} y={-70} width={280} height={140} rx={10} fill="#F8F1E4" /><text x={0} y={-12} textAnchor="middle" fontFamily="'Noto Sans CJK SC',sans-serif" fontWeight={700} fontSize={32} fill={PP.ink}>工资条</text>
			<text x={0} y={42} textAnchor="middle" fontFamily="'Noto Sans CJK SC',sans-serif" fontWeight={900} fontSize={38} fill={PP.brick}>月薪 三四十元</text></g>)}
	</g>;
};
/** 1998: a pager on a desk blinks 520 */
export const Nineties: React.FC<SceneP> = ({u}) => {
	const on = Math.floor(u / 0.28) % 2 === 0 || u > 1.2;
	return <g>
		<Bg c="#5C4E92" c2="#8E6FB2" id="s9" />
		{Array.from({length: 7}, (_, i) => <circle key={i} cx={200 + i * 260} cy={200 + (i % 2) * 120} r={60 + (i % 3) * 30} fill={i % 2 ? PP.roseL : PP.tealL} opacity={0.35} />)}
		<Sheet c="#3F356E" d={Band(760, 6, 111)} />
		<Pager x={980} y={560} s={1.2} text={on ? '520' : ''} rot={-4} />
	</g>;
};
/** 2016-05-20: the red packet's limit flips 200 → 520 */
export const Packet: React.FC<SceneP> = ({u}) => {
	const flip = seg(u, 2.45, 2.95), amt = flip < 0.5 ? '200.00' : '520.00';
	return <g>
		<Bg c="#F4C7B8" c2="#F8E3D2" id="rp" />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M${rnd(i, 3) * W},${rnd(i, 4) * H} l14,-24 l14,24 z`} fill={i % 2 ? '#D8473A' : AU.mid} opacity={0.4} />)}
		<g transform={`translate(960,560) scale(${1 - Math.sin(flip * Math.PI) * 0.12},1) translate(-960,-560)`}><RedPacket x={960} y={560} s={1.25} amount={amt} /></g>
	</g>;
};

/* =====================================================================================
   LOOK BACK · empty paper stage; the mirror halves and the hairpin prongs come back
   ===================================================================================== */
export const LookBack: React.FC<SceneP> = ({u}) => {
	const m = ease(seg(u, 2.27, 3.3)), p = ease(seg(u, 4.54, 5.6)), others = seg(u, 6.8, 8.5);
	return <g>
		<Bg c={PP.ivory} c2={PP.ivory2} id="lb" />
		{m > 0 && <g opacity={m}><Mirror x={760} y={560 + (1 - m) * 200} r={150} id="lbL" half="L" gap={0} tilt={-10} /><Mirror x={1160} y={560 + (1 - m) * 200} r={150} id="lbR" half="R" gap={0} tilt={10} /></g>}
		{p > 0 && <g opacity={p}><Hairpin x={420} y={420 - (1 - p) * 120} s={0.7} prong="L" rot={-14} /><Hairpin x={1500} y={420 - (1 - p) * 120} s={0.7} prong="R" rot={14} /></g>}
		{others > 0 && <g opacity={0.55 * others}><Quince x={lerp(-100, 2020, others)} y={880} s={0.4} rot={others * 300} /><Ring x={lerp(2020, -100, others)} y={180} r={34} /><Ring x={lerp(2080, -40, others)} y={190} r={34} /></g>}
	</g>;
};
/** DROP: night city, two lit windows; in each a person with a phone; the halves fly in and become the avatar halves */
export const Drop: React.FC<SceneP> = ({u}) => {
	const fly = ease(seg(u, 0, 0.7)), z = 1.08 - 0.08 * ease(seg(u, 0, 1.2)), g = 820, h = 330;
	const L = {x: 520, w: 520}, R = {x: 1400, w: 520};
	const fig = (cx: number, flip: boolean, who: string) => { const x = cx + (flip ? 70 : -70);
		const [phx, phy] = hand(PZ.phone, 'LHand', x, g, h, flip);
		return <g><Fig frame="Drop" who={who} x={x} g={g} h={h} pose={PZ.phone} look={flip ? LK.woman : LK.man} flip={flip} />
			<Phone x={phx + (flip ? -10 : 10)} y={phy - 30} s={0.22} rot={flip ? 8 : -8} side={flip ? 'R' : 'L'} id={`dp${who}`} glow={1.4} /></g>; };
	return <g>
		<Bg c={PP.night} c2={PP.indigo} id="dr" />
		{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 5) * W} cy={rnd(i, 6) * 400} r={1.5 + rnd(i, 7) * 2} fill={PP.cream} opacity={0.5} />)}
		<Moon x={960} y={180} r={70} />
		<Cam z={z}>
			{[[0, 300], [1100, 260], [1700, 380]].map(([x, w], i) => <Sheet key={i} c={i === 1 ? '#3A4678' : '#323E6E'} d={`M${x},1080 L${x},${420 + i * 40} L${x + w},${420 + i * 40} L${x + w},1080 Z`} />)}
			{[L, R].map((b, i) => <g key={i}>
				<Sheet c={i ? '#46548A' : '#3E4C82'} d={`M${b.x - b.w / 2 - 60},1080 L${b.x - b.w / 2 - 60},380 L${b.x + b.w / 2 + 60},380 L${b.x + b.w / 2 + 60},1080 Z`} />
				<rect x={b.x - b.w / 2} y={420} width={b.w} height={g - 420} fill={AU.hi} opacity={0.88} />
				<rect x={b.x - b.w / 2} y={g} width={b.w} height={26} fill={PP.ivory2} />
				{fig(b.x, i === 1, i ? 'her' : 'him')}
			</g>)}
		</Cam>
		{fly < 1 && <g opacity={1 - fly}><Mirror x={lerp(760, 520, fly)} y={lerp(560, 600, fly)} r={150 * (1 - fly * 0.8)} id="drL" half="L" gap={0} /><Mirror x={lerp(1160, 1400, fly)} y={lerp(560, 600, fly)} r={150 * (1 - fly * 0.8)} id="drR" half="R" gap={0} /></g>}
	</g>;
};
/** the two avatar halves, close: one picture across two phones */
export const DropClose: React.FC<SceneP> = ({u}) => {
	const pull = ease(seg(u, 0.2, 1.4));
	return <g>
		<Bg c={PP.indigo} c2={PP.night} id="dc" />
		<Phone x={960 - 162 - 120 * (1 - pull)} y={560} s={0.95} side="L" id="dcL" glow={1} />
		<Phone x={960 + 162 + 120 * (1 - pull)} y={560} s={0.95} side="R" id="dcR" glow={1} />
	</g>;
};
/* =====================================================================================
   CODA · the whole mirror; the hairpin in heaven and on earth; one phone with half, the other side empty
   ===================================================================================== */
export const CodaMirror: React.FC<SceneP> = ({u}) => <g><Bg c={PP.indigo} c2={PP.night} id="cm" /><Cam z={1 + 0.03 * seg(u, 0, 3)}><Mirror x={960} y={540} r={260} id="cmm" half="both" gap={0} glow={1} /></Cam></g>;
export const CodaPin: React.FC<SceneP> = () => <g>
	<Bg c={PP.lav} c2={PP.indigo2} id="cp" />
	<Cloud x={500} y={300} s={1.4} c="#F2ECF8" /><Cloud x={1500} y={260} s={1.2} c="#F2ECF8" />
	<Hairpin x={1360} y={190} s={0.55} prong="L" rot={10} />
	<Sheet c={PP.indigo} d={Band(760, 20, 121)} />
	<Hairpin x={560} y={620} s={0.55} prong="R" rot={-10} />
</g>;
export const CodaPhone: React.FC<SceneP> = ({u}) => <g>
	<Bg c={PP.ochreL} c2={PP.ochre} id="cph" />
	<Sheet c="#B9864A" d={Band(760, 14, 3)} />
	<Phone x={760} y={560} s={0.95} side="L" id="cphL" />
	<g opacity={0.7}><Phone x={1160} y={560} s={0.95} side="R" ghost id="cphR" glow={0} /></g>
	{void u}
</g>;
/** END: the empty half fills; the avatar changes through several pairs */
const PAIRS: [string, string][] = [[PP.indigo2, PP.rose], ['#3F7F7A', '#E9A070'], ['#6A4A7E', '#EDB3B4'], ['#2F3A6B', '#78ADA3']];
export const EndScene: React.FC<SceneP> = ({u}) => {
	const fill = ease(seg(u, 0.55, 1.4)), cyc = Math.floor(Math.max(0, u - 3.0) / 0.55);
	return <g>
		<Bg c={PP.ochreL} c2={PP.ochre} id="en" />
		<Sheet c="#B9864A" d={Band(760, 14, 3)} />
		<g filter={cyc > 0 ? `hue-rotate(${cyc * 70}deg)` : undefined} style={{filter: cyc > 0 ? `hue-rotate(${(cyc % 5) * 70}deg)` : undefined}}>
			<Phone x={760} y={560} s={0.95} side="L" id="enL" />
			<g opacity={fill}><Phone x={1160} y={560} s={0.95} side="R" id="enR" /></g>
		</g>
		<g opacity={1 - fill}><Phone x={1160} y={560} s={0.95} side="R" ghost id="enG" glow={0} /></g>
		{void PAIRS}
	</g>;
};
/** his poem, on paper beside his half mirror: 镜与人俱去，镜归人不归 */
export const Poem: React.FC<SceneP> = ({u}) => {
	const cols = ['鏡與人俱去', '鏡歸人不歸', '無復嫦娥影', '空留明月輝'], n = Math.floor(seg(u, 0.1, 1.6) * 20);
	let left = n;
	return <g>
		<Bg c="#5B4A80" c2={PP.night} id="pm" />
		<Sheet c={PP.cream} sh="pdL" d="M1000,250 L1720,232 L1740,990 L1020,1006 Z" />
		{cols.map((c, i) => { const k = Math.max(0, Math.min(5, left)); left -= 5; return <text key={i} x={1600 - i * 150} y={340} style={{writingMode: 'vertical-rl', fontFamily: "'Noto Serif CJK SC',serif", fontWeight: 900, fontSize: 92, letterSpacing: 18} as React.CSSProperties} fill={i === 1 ? AU.deep : PP.ink}>{c.slice(0, k)}</text>; })}
		<Mirror x={560} y={760} r={150} id="pmm" half="L" gap={0} glow={0.8} tilt={-10} />
	</g>;
};
export {AvatarArt};

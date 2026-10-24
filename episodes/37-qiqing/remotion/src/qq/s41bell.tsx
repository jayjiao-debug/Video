import React from 'react';
import {staticFile} from 'remotion';
import {W, H, cl, sm, lerp, fkPose, POSES, mixPose, Rimmed, jointAt, gaitPose, CYCLE, LOOK4, Pose} from './v3base';
import {gaitStride} from './figure4';
import {WireTunnel, Iris, Whip, Flash, easeIn, ease, seg, drift} from './fx';
import {LiquidTransmitter, ReedReceiver, Wire, ltGeom, ltAxis} from './props41';
import {Moon} from './sky41';
void H;
/* 贝尔 1876 (owner note 6): one man in one room; push in as he speaks; travel inside the wire into the other room,
   where Watson hears; Watson runs back and appears at Bell's door — 「我想见你」 answered on screen.
   r3 notes: he speaks INTO the mouthpiece (mouth at the opening, the rings go from his lips into the horn); the acid cup
   is a small part of the machine; the wire is one unbroken run from the binding post to the knob by the door; during the
   moon dissolve (tau 0–1) he is bent low over the cup, clear of the window; Watson's room has no door — he runs off left. */
export const BELL_T = {lean: 0.5, pushA: 1.4, pushB: 4.6, say: 4.75, sayEnd: 8.3, dive: 8.15, tunnel: 8.85, roomB: 10.3, jolt: 10.65, lower: 11.4, run: 12.0, whip: 12.85, roomA2: 13.2, lamp: 18.35, end: 19.54};
const PLATE_S = 1920 / 2048;
type P2 = [number, number];
// Bell's room (plate bellA): the transmitter on the table between the jars and the lamp; the line runs up to a knob on
// the wall and along to the knob by the door frame, where it goes through the wall to Watson's room
const TX = {x: 800, y: 657, s: 0.9}, GEO = ltGeom(TX.x, TX.y, TX.s);
const KNOB: P2 = [1192, 330], KNOB_W: P2 = [GEO.wire[2][0], 342];
export const FUNNEL: P2 = GEO.mouth;      // the mouthpiece opening
const FLOOR_A = 1052, BELL_H = 790;

/* ---- Bell's rig: planted feet (leg IK), hands on targets (arm IK), the mouth placed on the mouthpiece axis ---- */
type Key = {x: number; hip: number; lean: number; neck: number; la: number; le: number; ra: number; re: number};
const D2R = Math.PI / 180, L1 = 0.264, L2 = 0.269, A1 = 0.194, A2 = 0.135 + 0.034;
const toBody = (s: P2, x: number): P2 => [(s[0] - x) / BELL_H, (FLOOR_A - s[1]) / BELL_H];
/** two-bone IK → absolute angles of both bones (from straight down, + forward); bend +1 puts the middle joint forward (knee), −1 back (elbow) */
const ik2 = (root: P2, tgt: P2, a: number, b: number, bend: number): [number, number] => {
	const dx = tgt[0] - root[0], dy = tgt[1] - root[1], d = cl(Math.hypot(dx, dy), Math.abs(a - b) + 1e-3, (a + b) * 0.999), phi = Math.atan2(dx, -dy) / D2R;
	const al = Math.acos(cl((a * a + d * d - b * b) / (2 * a * d), -1, 1)) / D2R, t1 = phi + bend * al;
	const mid: P2 = [root[0] + Math.sin(t1 * D2R) * a, root[1] - Math.cos(t1 * D2R) * a], t2 = Math.atan2(tgt[0] - mid[0], -(tgt[1] - mid[1])) / D2R;
	return [t1, t2];
};
/** the head frame exactly as figure4 draws it: the point between the lips, and the face direction */
const mouthOf = (p: Pose, x: number): P2 => { const S = (n: string): P2 => [x + p[n][0] * BELL_H, FLOOR_A - p[n][1] * BELL_H], n1 = S('Neck1'), hd = S('Head'), tp = S('Top');
	const ang = Math.atan2(tp[1] - n1[1], tp[0] - n1[0]) + Math.PI / 2, hc: P2 = [lerp(hd[0], tp[0], 0.45), lerp(hd[1], tp[1], 0.45)], s = 0.93 * BELL_H, c = Math.cos(ang), sn = Math.sin(ang);
	return [hc[0] + 0.062 * s * c - 0.04 * s * sn, hc[1] + 0.062 * s * sn + 0.04 * s * c]; };
const FEET = {l: [632, FLOOR_A - 0.05 * BELL_H] as P2, r: [548, FLOOR_A - 0.05 * BELL_H] as P2};
/** a full pose from a key: legs solved to the planted feet */
const build = (k: Key): Pose => { const leg = (side: number, ank: P2) => { const [a, b] = ik2([0.028 * side * 0.3, k.hip - 0.066], toBody(ank, k.x), L1, L2, 1); return [a, a - b]; };
	const [lt, lk] = leg(1, FEET.l), [rt, rk] = leg(-1, FEET.r);
	return fkPose({hip: k.hip, lean: k.lean, neck: k.neck, lt, lk, rt, rk, la: k.la, le: k.le, ra: k.ra, re: k.re}); };
/** a key whose mouth lands on `mouth` (screen), with the hands reaching `hl` (near) and `hr` (far) */
const keyAt = (lean: number, neck: number, mouth: P2, hl: P2, hr: P2): Key => {
	let k: Key = {x: 0, hip: 0.6, lean, neck, la: 30, le: 30, ra: 30, re: 30};
	const m0 = mouthOf(fkPose({hip: k.hip, lean, neck, lt: 0, lk: 0, rt: 0, rk: 0, la: 0, le: 0, ra: 0, re: 0}), 0);
	k = {...k, x: mouth[0] - m0[0], hip: k.hip + (m0[1] - mouth[1]) / BELL_H};
	const P = fkPose({hip: k.hip, lean, neck, lt: 0, lk: 0, rt: 0, rk: 0, la: 0, le: 0, ra: 0, re: 0});
	const arm = (sh: P2, h: P2) => { const [a, b] = ik2(sh, toBody(h, k.x), A1, A2, -1); return [a, b - a]; };
	const [la, le] = arm(P.LSh, hl), [ra, re] = arm(P.RSh, hr);
	return {...k, la, le, ra, re};
};
const U = GEO.axis, LIPS: P2 = [FUNNEL[0] + U[0] * 13, FUNNEL[1] + U[1] * 13];   // just outside the opening, on its axis
const BASE_L: P2 = [TX.x - 70 * TX.s, TX.y - 12 * TX.s], TABLE_R: P2 = [TX.x - 112, TX.y + 6];
/** bent low over the apparatus, steadying the cup (tau 0–1: below the window line, far from the moon) */
const PREP = keyAt(64, -14, [706, 580], [GEO.cup[0] - 24, GEO.cup[1] + 6], TABLE_R);
/** at the mouthpiece: head over it, face down the axis into the opening (lean + neck = 90° − tilt) */
const SPEAK = keyAt(20, 35, LIPS, BASE_L, TABLE_R);
/** straightened, turned to the door (the reunion) */
const TURN: Key = {x: SPEAK.x - 6, hip: 0.645, lean: 4, neck: -4, la: 10, le: 30, ra: 2, re: 12};
const mixKey = (a: Key, b: Key, u: number): Key => Object.fromEntries(Object.keys(a).map((n) => [n, lerp(a[n as keyof Key], b[n as keyof Key], u)])) as Key;
/** Bell at a moment: rise 0 → 1 (cup → mouthpiece), turn 0 → 1 (→ the door); speak adds the voice in the head; breathing always */
export const bellRig = (rise: number, t: number, speak = 0, turn = 0): {pose: Pose; x: number; mouth: P2} => {
	const r = sm(rise);
	let k = mixKey(PREP, SPEAK, r);
	if (turn > 0) k = mixKey(k, TURN, sm(turn));
	const br = Math.sin(t * 2.1), syl = speak * (0.5 + 0.5 * Math.sin(t * 9.3)) * (0.6 + 0.4 * Math.sin(t * 3.1 + 1));
	const fid = (1 - r) * (Math.sin(t * 4.3) * 0.6 + Math.sin(t * 7.9) * 0.4);   // fingers at the cup, setting it straight
	k = {...k, lean: k.lean + br * 0.9 + syl * 2.2, neck: k.neck - syl * 1.6 + fid * 1.5, hip: k.hip + br * 0.002 - Math.sin(Math.PI * r) * 0.012, la: k.la + Math.sin(Math.PI * r) * 14 + fid * 3, le: k.le - Math.sin(Math.PI * r) * 20 - fid * 5};
	const pose = build(k);
	return {pose, x: k.x, mouth: mouthOf(pose, k.x)};
};
// Watson's room (plate bellB, the door painted out: a picture hangs there now)
const RX: P2 = [236, 676], FLOOR_B = 1012, WAT_H = 760, KNOB_B: P2 = [352, 262];
const HOLD_FK = {hip: 0.655, lean: 8, neck: 6, lt: 4, lk: 4, rt: -5, rk: 5, la: 22, le: 134, ra: 4, re: 14};
/** Watson's ear in body units (figure4's head frame: just behind the head centre) and the receiver held there by IK */
const earB = (p: Pose): P2 => { const hc: P2 = [lerp(p.Head[0], p.Top[0], 0.45), lerp(p.Head[1], p.Top[1], 0.45)]; return [hc[0] - 0.014, hc[1] - 0.006]; };
const HOLD = (() => { const P = fkPose(HOLD_FK), e = earB(P), [a, b] = ik2(P.LSh, [e[0] + 0.012, e[1] - 0.026], A1, A2, -1); return fkPose({...HOLD_FK, la: a, le: b - a}); })();
const flipPt = (b: P2, x: number, ground: number): P2 => [x - b[0] * WAT_H, ground - b[1] * WAT_H];

// the window: narrower than r3 and set so the moon (510, 300) sits clear in the right pane, away from the mullion
export const BWIN = {x: 360, y: 168, w: 210, h: 316, moon: [510, 300] as P2, r: 34};
const BellWindow: React.FC = () => { const {x, y, w, h} = BWIN; return <g>
	<defs><linearGradient id="bwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1230" /><stop offset="1" stopColor="#2a3566" /></linearGradient></defs>
	<rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill="#4a3424" />
	<rect x={x} y={y} width={w} height={h} fill="url(#bwSky)" />
	<Moon x={BWIN.moon[0]} y={BWIN.moon[1]} r={BWIN.r} id="bellMoon" halo={0.14} />
	<path d={`M${x},${y + h * 0.72} h34 v-20 h12 v20 h40 v-38 h46 v26 h10 v-12 h12 v12 h26 v-24 h${w - 180} V${y + h} H${x} Z`} fill="#0a0e20" />
	{[[x + 58, y + h * 0.8], [x + 128, y + h * 0.76], [x + 182, y + h * 0.82]].map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={7} height={9} fill="#ffcf86" opacity={0.7} />)}
	<path d={`M${x + w / 2},${y} v${h} M${x},${y + h / 2} h${w}`} stroke="#4a3424" strokeWidth={9} />
	<rect x={x - 26} y={y + h + 10} width={w + 52} height={14} fill="#3e2b1d" />
	<rect x={x - 30} y={y + h + 30} width={w + 60} height={120} fill="#9fb4ff" opacity={0.05} />
</g>; };
/** a white porcelain wiring knob */
const Knob: React.FC<{p: P2; r?: number; c?: string; e?: string}> = ({p, r = 7, c = '#ece4d2', e = '#8a7a62'}) => <g><circle cx={p[0]} cy={p[1]} r={r} fill={c} stroke={e} strokeWidth={1.5} /><circle cx={p[0] + r * 0.2} cy={p[1] - r * 0.2} r={r * 0.3} fill="#fff" opacity={0.45} /></g>;
/** the voice: arcs leave the lips and travel down the mouthpiece axis, narrowing with the horn, into the throat */
const VoiceRings: React.FC<{lips: P2; t: number; k: number}> = ({lips, t, k}) => { if (k <= 0) return null;
	const ax = (d: number, w: number) => ltAxis(TX.x, TX.y, TX.s, d, w), mo = ax(1, 0), u = GEO.axis;
	return <g>{Array.from({length: 5}, (_, i) => { const q = ((t * 1.7 + i / 5) % 1), d = 1.18 - q * 1.02;   // 1.18 = at the lips, 0.16 = the throat
		const out = d > 1, base: P2 = out ? [lerp(mo[0], lips[0], (d - 1) / 0.18), lerp(mo[1], lips[1], (d - 1) / 0.18)] : ax(d, 0);
		const half = out ? lerp(GEO.rMouth * 0.75, 7, (d - 1) / 0.18) : Math.max(4, Math.hypot(ax(d, 0.8)[0] - base[0], ax(d, 0.8)[1] - base[1]));
		const pp: P2 = [-u[1], u[0]], a: P2 = [base[0] - pp[0] * half, base[1] - pp[1] * half], b: P2 = [base[0] + pp[0] * half, base[1] + pp[1] * half], bulge = half * 0.45;
		const c: P2 = [base[0] - u[0] * bulge * 2, base[1] - u[1] * bulge * 2];
		const op = k * cl(q / 0.12) * cl((1 - q) / 0.3) * 0.9;
		return <path key={i} d={`M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`} fill="none" stroke="#ffe8b8" strokeWidth={lerp(1.2, 2.6, cl(q * 2))} strokeLinecap="round" opacity={op} />; })}</g>; };
/** the line: binding post → along the base → up the post → up to the wall knob → along the wall to the knob by the door */
const LINE = `M${GEO.wire.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L')} L${KNOB_W[0]},${KNOB_W[1] + 7} M${KNOB_W[0] + 6},${KNOB_W[1]} Q${(KNOB_W[0] + KNOB[0]) / 2},${KNOB[1] + 26} ${KNOB[0] - 7},${KNOB[1]}`;
/** Bell's room; `bell` and `watson` let the same room serve the opening and the reunion */
export const RoomA: React.FC<{t: number; tau: number; bell: {pose: Pose; x: number; mouth: P2}; vib: number; rings: number; door: number; watson?: number}> = ({t, tau, bell, vib, rings, door, watson = 0}) => {
	const flick = 0.94 + 0.06 * Math.sin(t * 13) * Math.sin(t * 7.3);
	return <g>
		<image href={staticFile('ep41/bellA.webp')} x={0} y={0} width={2048 * PLATE_S} height={1152 * PLATE_S} />
		<rect width={W} height={H} fill="#ffcf7a" opacity={0.05 * (flick - 0.94) * 10} />
		<BellWindow />
		{/* the open door: warm light from the hall, then Watson standing in it */}
		{door > 0 && <g>
			<rect x={1255} y={208} width={300} height={665} fill="#ffdca0" opacity={0.9 * door} />
			<path d={`M1255,208 L${1255 + 300 * (1 - door * 0.85)},${208 + 40 * door} L${1255 + 300 * (1 - door * 0.85)},${873 - 30 * door} L1255,873 Z`} fill="#5e3f26" stroke="#3a2614" strokeWidth={4} />
			{watson > 0 && <Rimmed x={1400} ground={872} h={560} pose={mixPose(gaitPose('08_01', tau / CYCLE), POSES.stand, sm(watson))} look={LOOK4.watson} flip col="#1a120c" rim="#fff1cf" rimOp={0} rimDx={0} rimDy={-2} />}
		</g>}
		<LiquidTransmitter x={TX.x} y={TX.y} s={TX.s} col="#2a1c12" hi="#e6f2ff" t={t} vib={vib} />
		<path d={LINE} stroke="#2a1a10" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
		<Knob p={KNOB_W} /><Knob p={KNOB} />
		<Rimmed x={bell.x} ground={FLOOR_A} h={BELL_H} pose={bell.pose} look={LOOK4.bell} col="#1a120c" rim="#ffd796" rimOp={0} rimDx={3} rimDy={-1.5} T={tau} />
		<VoiceRings lips={bell.mouth} t={t} k={rings} />
	</g>;
};
const RoomB: React.FC<{t: number; tau: number; lower: number; jolt: number; run: number; glow: number}> = ({t, tau, lower, jolt, run, glow}) => {
	// Watson stands by the side table, the receiver at his ear; he jolts, sets it down, and runs off to the left (toward Bell's room)
	const RATE = 1.7, sp = gaitStride('08_01') * WAT_H / CYCLE * RATE, wx = 470 - (run > 0 ? Math.max(0, tau) * sp : 0);
	const pose = run > 0 ? gaitPose('08_01', tau * RATE / CYCLE) : mixPose(HOLD, POSES.stand, sm(lower));
	const hop = Math.sin(Math.PI * cl(jolt)) * 26, g = FLOOR_B - hop, ear = flipPt(earB(HOLD), wx, g), elb = jointAt(HOLD, 'LElb', wx, g, WAT_H, true);
	const heldRot = Math.atan2(elb[1] - ear[1], elb[0] - ear[0]) * 180 / Math.PI, L = sm(lower);   // the handle runs down along his forearm
	const rxPos: P2 = run > 0 ? RX : [lerp(ear[0], RX[0], L), lerp(ear[1], RX[1], L)], rot = run > 0 ? 0 : lerp(heldRot, 0, L);
	return <g>
		<image href={staticFile('ep41/bellB.webp')} x={0} y={0} width={2048 * PLATE_S} height={1152 * PLATE_S} />
		<Wire a={[KNOB_B[0] - 2, KNOB_B[1] + 4]} b={rxPos} sag={60} col="#1a1a22" w={2.5} />
		<Knob p={KNOB_B} r={6} c="#8e939c" e="#3e4350" />
		<Rimmed x={wx} ground={g} h={WAT_H} pose={pose} look={LOOK4.watson} flip col="#10121a" rim="#b8c8ff" rimOp={0.22} rimDx={2.5} rimDy={-1.5} T={tau} />
		{/* the receiver on his near ear (in front of the head), then set down on the table */}
		<ReedReceiver x={rxPos[0]} y={rxPos[1]} s={0.55} rot={rot} col="#1c1c24" hi="#d6a85a" glow={glow} />
		<Rings x={rxPos[0] + 4} y={rxPos[1]} t={t} k={glow * 0.8} dir={1} col="#fff0c8" />
	</g>;
};
/** sound rings at the receiver (Watson's ear) */
const Rings: React.FC<{x: number; y: number; t: number; k: number; dir?: number; col?: string}> = ({x, y, t, k, dir = 1, col = '#ffe8b8'}) => k <= 0 ? null : <g>
	{Array.from({length: 4}, (_, i) => { const u = ((t * 1.6 + i / 4) % 1), r = 14 + u * 70; return <path key={i} d={`M${x + dir * r * 0.2},${y - r} A${r},${r} 0 0,${dir > 0 ? 1 : 0} ${x + dir * r * 0.2},${y + r}`} fill="none" stroke={col} strokeWidth={3 - 2 * u} opacity={k * (1 - u) * 0.85} transform={`rotate(${dir > 0 ? 35 : -35} ${x} ${y})`} />; })}
</g>;
/** where the receiver is at Watson's ear (screen), for the iris */
const EAR = flipPt(earB(HOLD), 470, FLOOR_B);
const LAMP: P2 = [979, 520];
/** camera that puts world point L at screen point S, zoom z (no drift at z = 1, L = S: identity) */
export const LookCam: React.FC<{z: number; L: P2; S: P2; px?: number; py?: number; roll?: number; children: React.ReactNode}> = ({z, L, S, px = 0, py = 0, roll = 0, children}) =>
	<g transform={`translate(${S[0] + px},${S[1] + py}) rotate(${roll}) scale(${z}) translate(${-L[0]},${-L[1]})`}>{children}</g>;
/** the push-in on Bell at the mouthpiece: world point between his lips and the opening, framed above the subtitles */
export const FACE: P2 = [lerp(LIPS[0], FUNNEL[0], 0.5) - 10, lerp(LIPS[1], FUNNEL[1], 0.5) - 18];
const DIVE: P2 = ltAxis(TX.x, TX.y, TX.s, 0.45, 0);   // inside the horn: the camera dives in along the voice
/** WireTunnel's copper rings advance 22 spacings per unit u: over the 1.45 s tunnel u 0→1 is ~0.5 spacing a frame, which
    strobes at 15 Hz; 0.3 keeps them at ~0.15 a frame (smooth), and room B's underlay continues at the same rate */
const TUN_U = 0.3;
/** the whip pan runs along one wall: Bell's room sits left of Watson's, so the pan (W px in all) never shows past a plate.
    Room B travels WHIP_B in its 0.35 s, room A the rest in its 0.3 s: the same speed on both sides of the cut */
const WHIP_B = Math.round(W * 0.35 / 0.65);

export const BELL3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = BELL_T;
	if (tau < T.tunnel) {   // room A: bent over the cup → up to the mouthpiece; push in; speak; dive into the horn after the voice
		const speaking = seg(tau, T.say, T.say + 0.2) * (1 - seg(tau, T.sayEnd - 0.2, T.sayEnd));
		const bell = bellRig(seg(tau, 1.0, 2.9), t, speaking);
		const push = ease(seg(tau, T.pushA, T.pushB)), creep = seg(tau, T.pushB, T.dive), dv = easeIn(seg(tau, T.dive, T.tunnel)), dvL = ease(seg(tau, T.dive - 0.25, T.tunnel));
		const z = lerp(1, 2.45, push) * lerp(1, 1.18, creep) * lerp(1, 40, dv);
		const Lp: P2 = [lerp(960, FACE[0], push), lerp(540, FACE[1], push)], Sp: P2 = [lerp(960, 1060, push), lerp(540, 450, push)];
		const L: P2 = [lerp(Lp[0], DIVE[0], dvL), lerp(Lp[1], DIVE[1], dvL)], S: P2 = [lerp(Sp[0], 960, dvL), lerp(Sp[1], 540, dvL)];
		const d = drift(t, seg(tau, 0.0, 1.2) * (1 - push * 0.6) * (1 - dv));   // no drift while the moon is being matched
		return <g><LookCam z={z} L={L} S={S} px={d.px} py={d.py} roll={d.roll}>
			<RoomA t={t} tau={tau} bell={bell} vib={speaking} rings={speaking} door={0} />
		</LookCam></g>;
	}
	if (tau < T.roomB) { const u = TUN_U * seg(tau, T.tunnel, T.roomB), op = ease(seg(tau, T.tunnel, T.tunnel + 0.45));
		return <g><rect width={W} height={H} fill="#140904" /><Iris id="bTunIn" x={W / 2} y={H / 2} r={40 + op * 1200}><WireTunnel u={u} t={t} /></Iris></g>; }
	if (tau < T.roomA2) {   // room B: iris out of the receiver at Watson's ear; he jolts, sets it down, runs off left
		const iris = ease(seg(tau, T.roomB, T.roomB + 0.7)), whip = seg(tau, T.whip - 0.15, T.roomA2);
		const zoom = lerp(2.6, 1.12, ease(seg(tau, T.roomB, T.roomB + 1.6)));
		return <g>{iris < 1 && <WireTunnel u={TUN_U + (tau - T.roomB) * TUN_U / (T.roomB - T.tunnel)} t={t} />}<Whip id="bwhip" amt={whip * 90}><Iris id="bIris" x={EAR[0]} y={EAR[1]} r={30 + iris * 2400}>
			<LookCam z={zoom} L={EAR} S={EAR} px={whip * WHIP_B}>
				{whip > 0 && <image href={staticFile('ep41/bellA.webp')} x={-2048 * PLATE_S} y={0} width={2048 * PLATE_S} height={1152 * PLATE_S} />}
				<RoomB t={t} tau={tau - T.run} jolt={seg(tau, T.jolt, T.jolt + 0.35)} lower={seg(tau, T.lower, T.lower + 0.5)} run={seg(tau, T.run, T.whip)} glow={(1 - seg(tau, T.lower - 0.2, T.lower)) * (0.6 + 0.4 * Math.sin(t * 20))} />
			</LookCam></Iris></Whip></g>;
	}
	// room A again: the door opens, Watson in the doorway; Bell straightens and turns to him; then into the lamp flame
	const k = seg(tau, T.roomA2, T.roomA2 + 1.4), whipIn = 1 - seg(tau, T.roomA2, T.roomA2 + 0.3);
	const bell = bellRig(1, t, 0, seg(tau, T.roomA2 + 0.5, T.roomA2 + 1.8));
	const d = drift(t, 1), lp = easeIn(seg(tau, T.lamp, T.end)), fxy = ease(seg(tau, T.lamp - 0.6, T.lamp + 0.4)), z = lerp(1.25, 1.1, ease(seg(tau, T.roomA2, T.lamp))) * lerp(1, 9, lp);
	const F: P2 = [lerp(1000, LAMP[0], fxy), lerp(560, LAMP[1], fxy)];
	return <g><Whip id="bwhip2" amt={whipIn * 90}><LookCam z={z} L={F} S={F} px={d.px * (1 - lp) - whipIn * (W - WHIP_B)} py={d.py * (1 - lp)}>
		{whipIn > 0 && <image href={staticFile('ep41/bellB.webp')} x={2048 * PLATE_S} y={0} width={2048 * PLATE_S} height={1152 * PLATE_S} />}
		<RoomA t={t} tau={tau} bell={bell} vib={0} rings={0} door={sm(k)} watson={seg(tau, T.roomA2 + 0.6, T.roomA2 + 1.6)} />
	</LookCam></Whip><Flash k={seg(tau, T.end - 0.5, T.end) * 0.35} col="#fff6e6" /></g>;
};

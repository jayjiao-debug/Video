import React from 'react';
import {staticFile} from 'remotion';
import {W, H, cl, sm, lerp, fkPose, POSES, mixPose, Rimmed, jointAt, gaitPose, CYCLE, LOOK4, Pose} from './v3base';
import {gaitStride} from './figure4';
import {Cam, WireTunnel, Iris, Whip, Flash, easeIn, ease, seg, drift} from './fx';
import {LiquidTransmitter, ReedReceiver, Wire} from './props41';
import {Moon} from './sky41';
void H;
/* 贝尔 1876 (owner note 6): one man in one room; push in as he speaks; travel inside the wire into the other room,
   where Watson hears; Watson runs back and appears at Bell's door — 「我想见你」 answered on screen. */
export const BELL_T = {lean: 0.5, pushA: 1.4, pushB: 4.6, say: 4.75, sayEnd: 8.3, dive: 8.15, tunnel: 8.85, roomB: 10.3, jolt: 10.65, lower: 11.4, run: 12.0, whip: 12.85, roomA2: 13.2, lamp: 18.35, end: 19.54};
const PLATE_S = 1920 / 2048;
// Bell's room (plate bellA): transmitter on the table, wire to the hole by the door
const TX = {x: 742, y: 657, s: 0.9}, HOLE: [number, number] = [1165, 457], KNOB: [number, number] = [1192, 330];   // porcelain knob by the door frame where the wire goes through the wall
export const FUNNEL: [number, number] = [TX.x - 5 * TX.s, TX.y - 250 * TX.s];      // funnel mouth
const FLOOR_A = 1052, BELL_H = 790;
export const LEAN = fkPose({hip: 0.62, lean: 50, neck: 26, lt: 10, lk: 14, rt: -4, rk: 8, la: 46, le: 16, ra: 38, re: 24});
const BX = FUNNEL[0] - 78 - jointAt(LEAN, 'Head', 0, 0, 1)[0] * BELL_H;
export const STAND = fkPose({hip: 0.655, lean: 6, neck: 0, lt: 3, lk: 3, rt: -3, rk: 3, la: 8, le: 16, ra: -2, re: 10});
const TURN = fkPose({hip: 0.655, lean: 4, neck: -4, lt: 4, lk: 4, rt: -5, rk: 5, la: 10, le: 30, ra: 2, re: 12});
// Watson's room (plate bellB)
const RX: [number, number] = [236, 676], FLOOR_B = 1012, WAT_H = 760;
const HOLD = fkPose({hip: 0.655, lean: 10, neck: 10, lt: 4, lk: 4, rt: -5, rk: 5, la: 22, le: 134, ra: 4, re: 14});

export const BWIN = {x: 400, y: 168, w: 240, h: 316, moon: [510, 300] as [number, number], r: 34};
const BellWindow: React.FC = () => { const {x, y, w, h} = BWIN; return <g>
	<defs><linearGradient id="bwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1230" /><stop offset="1" stopColor="#2a3566" /></linearGradient></defs>
	<rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill="#4a3424" />
	<rect x={x} y={y} width={w} height={h} fill="url(#bwSky)" />
	<Moon x={BWIN.moon[0]} y={BWIN.moon[1]} r={BWIN.r} id="bellMoon" halo={0.14} />
<path d={`M${x},${y + h * 0.7} h40 v-22 h12 v22 h46 v-40 h50 v28 h10 v-14 h12 v14 h38 v-30 h${w - 208} V${y + h} H${x} Z`} fill="#0a0e20" />
	{[[x + 70, y + h * 0.78], [x + 150, y + h * 0.74], [x + 205, y + h * 0.8]].map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={7} height={9} fill="#ffcf86" opacity={0.7} />)}
	<path d={`M${x + w / 2},${y} v${h} M${x},${y + h / 2} h${w}`} stroke="#4a3424" strokeWidth={9} />
	<rect x={x - 26} y={y + h + 10} width={w + 52} height={14} fill="#3e2b1d" />
	<rect x={x - 30} y={y + h + 30} width={w + 60} height={120} fill="#9fb4ff" opacity={0.05} />
</g>; };
const Rings: React.FC<{x: number; y: number; t: number; k: number; dir?: number; col?: string}> = ({x, y, t, k, dir = 1, col = '#ffe8b8'}) => k <= 0 ? null : <g>
	{Array.from({length: 4}, (_, i) => { const u = ((t * 1.6 + i / 4) % 1), r = 14 + u * 70; return <path key={i} d={`M${x + dir * r * 0.2},${y - r} A${r},${r} 0 0,${dir > 0 ? 1 : 0} ${x + dir * r * 0.2},${y + r}`} fill="none" stroke={col} strokeWidth={3 - 2 * u} opacity={k * (1 - u) * 0.85} transform={`rotate(${dir > 0 ? 35 : -35} ${x} ${y})`} />; })}
</g>;

/** Bell's room; `bellPose` and `watson` let the same room serve the opening and the reunion */
export const RoomA: React.FC<{t: number; tau: number; pose: Pose; vib: number; rings: number; door: number; watson?: number}> = ({t, tau, pose, vib, rings, door, watson = 0}) => {
	const bx = BX, flick = 0.94 + 0.06 * Math.sin(t * 13) * Math.sin(t * 7.3);
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
<path d={`M${TX.x + 46},${TX.y - 176} L${TX.x + 46},${KNOB[1] + 6} Q${TX.x + 46},${KNOB[1]} ${TX.x + 56},${KNOB[1]} Q${(TX.x + KNOB[0]) / 2},${KNOB[1] + 14} ${KNOB[0] - 8},${KNOB[1]}`} stroke="#2a1a10" strokeWidth={2.5} fill="none" />
		<circle cx={KNOB[0]} cy={KNOB[1]} r={7} fill="#ece4d2" stroke="#8a7a62" strokeWidth={1.5} /><circle cx={KNOB[0] + 1.5} cy={KNOB[1] - 1.5} r={2.2} fill="#fff" opacity={0.7} />
		<LiquidTransmitter x={TX.x} y={TX.y} s={TX.s} col="#2a1c12" hi="#e6f2ff" t={t} vib={vib} />
		<Rings x={FUNNEL[0] - 6} y={FUNNEL[1] - 26} t={t} k={rings} />
		<Rimmed x={bx} ground={FLOOR_A} h={BELL_H} pose={pose} look={LOOK4.bell} col="#1a120c" rim="#ffd796" rimOp={0} rimDx={3} rimDy={-1.5} T={tau} />
	</g>;
};
const RoomB: React.FC<{t: number; tau: number; lower: number; jolt: number; run: number; glow: number}> = ({t, tau, lower, jolt, run, glow}) => {
	// Watson stands by the side table, the receiver at his ear; he jolts, sets it down, and runs out to the left
	const RATE = 1.7, sp = gaitStride('08_01') * WAT_H / CYCLE * RATE, wx = 470 - (run > 0 ? Math.max(0, tau) * sp : 0);
	const pose = run > 0 ? gaitPose('08_01', tau * RATE / CYCLE) : mixPose(HOLD, POSES.stand, sm(lower));
	const hop = Math.sin(Math.PI * cl(jolt)) * 26, hand = jointAt(pose, 'LHand', wx, FLOOR_B - hop, WAT_H, true);
	const rxPos: [number, number] = run > 0 ? RX : [lerp(hand[0] - 6, RX[0], sm(lower)), lerp(hand[1] - 10, RX[1], sm(lower))];
	return <g>
		<image href={staticFile('ep41/bellB.webp')} x={0} y={0} width={2048 * PLATE_S} height={1152 * PLATE_S} />
		<Wire a={[352, 262]} b={rxPos} sag={60} col="#1a1a22" w={2.5} />
		<ReedReceiver x={rxPos[0]} y={rxPos[1]} s={0.55} rot={-70 * (1 - sm(lower))} col="#16161c" hi="#d6a85a" glow={glow} />
		<Rings x={rxPos[0] + 4} y={rxPos[1]} t={t} k={glow * 0.8} dir={1} col="#fff0c8" />
		<Rimmed x={wx} ground={FLOOR_B - hop} h={WAT_H} pose={pose} look={LOOK4.watson} flip col="#10121a" rim="#b8c8ff" rimOp={0.22} rimDx={2.5} rimDy={-1.5} T={tau} />
	</g>;
};
/** where the receiver is at Watson's ear (screen), for the iris */
const EAR = jointAt(HOLD, 'LHand', 470, FLOOR_B, WAT_H, true);
const LAMP: [number, number] = [979, 520];

export const BELL3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = BELL_T;
	if (tau < T.tunnel) {   // room A: lean in, push in, speak, dive into the funnel
		const pose = mixPose(STAND, LEAN, sm(seg(tau, T.lean, T.lean + 2.2)));
		const zoom = lerp(1, 2.5, ease(seg(tau, T.pushA, T.pushB))) * lerp(1, 1.35, seg(tau, T.pushB, T.dive)) * lerp(1, 40, easeIn(seg(tau, T.dive, T.tunnel)));
		const speaking = seg(tau, T.say, T.say + 0.2) * (1 - seg(tau, T.sayEnd - 0.2, T.sayEnd));
		const d = drift(t, 1 - seg(tau, T.pushA, T.pushB));
		return <g><Cam zoom={zoom} fx={lerp(FUNNEL[0] - 60, FUNNEL[0], ease(seg(tau, T.pushB, T.dive)))} fy={lerp(540, FUNNEL[1] + 10, ease(seg(tau, T.pushA, T.dive)))} px={d.px} py={d.py} roll={d.roll}>
			<RoomA t={t} tau={tau} pose={pose} vib={speaking} rings={speaking} door={0} />
		</Cam></g>;
	}
	if (tau < T.roomB) { const u = seg(tau, T.tunnel, T.roomB), op = ease(seg(tau, T.tunnel, T.tunnel + 0.45));
		return <g><rect width={W} height={H} fill="#140904" /><Iris id="bTunIn" x={W / 2} y={H / 2} r={40 + op * 1200}><WireTunnel u={u} t={t} /></Iris></g>; }
	if (tau < T.roomA2) {   // room B: iris out of the receiver at Watson's ear; he jolts, sets it down, runs
		const iris = ease(seg(tau, T.roomB, T.roomB + 0.7)), whip = seg(tau, T.whip - 0.15, T.roomA2);
		const zoom = lerp(2.6, 1.12, ease(seg(tau, T.roomB, T.roomB + 1.6)));
		return <g>{iris < 1 && <WireTunnel u={1 + (tau - T.roomB) * 0.4} t={t} />}<Whip id="bwhip" amt={whip * 90}><Iris id="bIris" x={EAR[0]} y={EAR[1]} r={30 + iris * 2400}>
			<Cam zoom={zoom} fx={EAR[0]} fy={EAR[1]} px={whip * 1400}>
				<RoomB t={t} tau={tau - T.run} jolt={seg(tau, T.jolt, T.jolt + 0.35)} lower={seg(tau, T.lower, T.lower + 0.5)} run={seg(tau, T.run, T.whip)} glow={(1 - seg(tau, T.lower - 0.2, T.lower)) * (0.6 + 0.4 * Math.sin(t * 20))} />
			</Cam></Iris></Whip></g>;
	}
	// room A again: the door opens, Watson in the doorway; Bell straightens to face him; then into the lamp flame
	const k = seg(tau, T.roomA2, T.roomA2 + 1.4), whipIn = 1 - seg(tau, T.roomA2, T.roomA2 + 0.3);
	const pose = mixPose(LEAN, TURN, sm(seg(tau, T.roomA2 + 0.5, T.roomA2 + 1.8)));
	const d = drift(t, 1), lp = easeIn(seg(tau, T.lamp, T.end));
	return <g><Whip id="bwhip2" amt={whipIn * 90}><Cam zoom={lerp(1.25, 1.1, ease(seg(tau, T.roomA2, T.lamp))) * lerp(1, 9, lp)} fx={lerp(1000, LAMP[0], ease(seg(tau, T.lamp - 0.6, T.lamp + 0.4)))} fy={lerp(560, LAMP[1], ease(seg(tau, T.lamp - 0.6, T.lamp + 0.4)))} px={d.px * (1 - lp) - whipIn * 1400} py={d.py * (1 - lp)}>
		<RoomA t={t} tau={tau} pose={pose} vib={0} rings={0} door={sm(k)} watson={seg(tau, T.roomA2 + 0.6, T.roomA2 + 1.6)} />
	</Cam></Whip><Flash k={seg(tau, T.end - 0.5, T.end) * 0.35} col="#fff6e6" /></g>;
};

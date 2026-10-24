import React from 'react';
import {staticFile} from 'remotion';
import {W, H, cl, sm, lerp, rnd, fkPose, mixPose, Rimmed, jointAt, Glow, Sprite, LATS} from './v3base';
import type {Look4, Pose} from './v3base';
import {Cam, Whip, Flash, ease, easeIn, easeOut, seg, drift} from './fx';
import {HexKite, Wire} from './props41';
void H;
/* 马可尼 1901 (owner note 8: the story must be logical).
   Poldhu, Cornwall sends one letter, S = · · ·, again and again → the rings cross the Atlantic → Signal Hill in a gale: a big
   linen kite lifts the aerial wire, which runs down into the old hospital → Marconi hands the earpiece to Kemp → three
   gold sparks run down the wire into the earpiece: tick · tick · tick → push into the three dots, which become panel lamps.
   Entrance: Bell's lamp flame ends in a warm white; it collapses into the blue-white spark of the Poldhu transmitter. */
export const MARCONI_T = {
	k1: 0.365, s1: 0.0, s2: 1.45, s3: 2.9, s4: 4.15, sGap: 0.17,          // the S, sent again and again (key + spark)
	pullA: 1.25, pullB: 3.05, tag: 2.75,                                      // out through the hut window; S = · · · tag
	whip: 4.85, sea: 5.1, k2: 5.615, hill: 6.0, ringsIn: 6.2, glint: 6.95,    // whip west over the Atlantic → Signal Hill
	tiltA: 6.9, tiltB: 8.75, room: 9.45,                                      // tilt down the wire, through the window
	q: 9.715, give: 9.75, take: 10.35, bend: 10.4,                            // "Can you hear anything, Mr Kemp?"
	tick1: 12.115, tick2: 12.415, tick3: 12.715, travel: 0.42, lift: 12.95, k3: 13.015,
	dots: 14.7, dotsB: 17.1, end: 18.112,
};
/** the last frame: three gold dots on black; the third sits at screen centre. s41arpa opens on three panel lamps here. */
export const MATCH = {x: 960, y: 540, d: 110, r: 23, row: 1, col: 5, rows: 4, cols: 8};

const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, k: number) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], cl(k))).toString(16).padStart(2, '0')).join(''); };
const GOLD = '#F2CF7A', RING = '#9FE8FF', FIG = '#0E1216';
/** key/spark activity: p = how hard the key is down now; fire = spark brightness; ring emission times */
const S_LIST = (T: typeof MARCONI_T) => [T.s1, T.s2, T.s3, T.s4];
const dotTimes = (T: typeof MARCONI_T) => S_LIST(T).flatMap((s) => [0, 1, 2].map((i) => s + i * T.sGap));
const keyState = (tau: number, T: typeof MARCONI_T) => { let press = 0, fire = 0, dot = -1;
	S_LIST(T).forEach((s) => [0, 1, 2].forEach((i) => { const a = s + i * T.sGap; press = Math.max(press, seg(tau, a - 0.04, a) * (1 - seg(tau, a + 0.08, a + 0.12)));
		if (tau >= a && tau < a + 0.1) { fire = 1 - (tau - a) / 0.14; dot = i; } }));
	return {press, fire, dot}; };

/* ---------- Poldhu: inside the hut (close-up) ---------- */
const KEYP = fkPose({hip: 0.37, lean: 22, neck: 14, lt: 88, lk: 92, rt: 84, rk: 86, la: 44, le: 56, ra: 74, re: 22});
const KEY0: [number, number] = [430 + 230 - 6, 668 - 26 - 12];
const OPER: Look4 = {dress: 'coat', head: 'short', beard: 'moustache'};
const Arc: React.FC<{x1: number; x2: number; y: number; k: number; f: number}> = ({x1, x2, y, k, f}) => { if (k <= 0) return null;
	const n = 9, d = Array.from({length: n + 1}, (_, i) => `${i ? 'L' : 'M'}${lerp(x1, x2, i / n).toFixed(1)},${(y + (i && i < n ? (rnd(i, f) - 0.5) * 26 : 0)).toFixed(1)}`).join(' ');
	return <g opacity={k}><Glow x={(x1 + x2) / 2} y={y} r={260} c="#bfe8ff" o={0.55} id="mcArcG" /><path d={d} stroke="#9fd8ff" strokeWidth={14} fill="none" opacity={0.45} strokeLinejoin="round" /><path d={d} stroke="#f4fbff" strokeWidth={4} fill="none" strokeLinejoin="round" /></g>; };
const PoldhuIn: React.FC<{t: number; tau: number}> = ({t, tau}) => {
	const T = MARCONI_T, {press, fire} = keyState(tau, T), f = Math.floor(t * 30), lamp = 0.9 + 0.1 * Math.sin(t * 11) * Math.sin(t * 5.3);
	const kx = 430, ky = 668, ang = press * 3.2;
	const knob = [kx + 230 * Math.cos(ang * Math.PI / 180), ky - 26 + 230 * Math.sin(ang * Math.PI / 180)];
	return <g>
		<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#16131a" />
		{Array.from({length: 22}, (_, i) => <rect key={i} x={i * 90} y={0} width={2} height={700} fill="#0e0c12" />)}
		{/* warm sunset light through the (unseen) window behind us, and the oil lamp on the shelf */}
		<rect x={0} y={0} width={W} height={700} fill="#ff9a5a" opacity={0.06} />
		<Glow x={1640} y={300} r={420} c="#ffb45a" o={0.4 * lamp} id="mcLampG" />
		<rect x={1600} y={330} width={90} height={12} fill="#0c0a0e" /><path d={`M1628,330 L1634,300 L1656,300 L1662,330 Z`} fill="#2a2a30" /><ellipse cx={1645} cy={292} rx={7} ry={13 * lamp} fill="#ffd27a" />
		{/* induction coil and wiring */}
		<rect x={1190} y={520} width={380} height={176} rx={18} fill="#0d0c10" />
		{Array.from({length: 18}, (_, i) => <rect key={i} x={1214 + i * 19} y={530} width={6} height={156} fill="#7a4a22" opacity={0.45} />)}
		<path d="M1190,560 C1120,560 1100,500 1048,470 M1190,650 C1100,660 960,640 900,560" stroke="#0a090c" strokeWidth={9} fill="none" />
		<path d="M640,690 C800,720 1000,720 1200,680" stroke="#0a090c" strokeWidth={7} fill="none" />
		{/* the spark gap: two brass spheres on ebonite posts */}
		<rect x={830} y={660} width={270} height={40} fill="#2a2018" />
		<rect x={874} y={470} width={18} height={192} fill="#0a090c" /><rect x={1028} y={470} width={18} height={192} fill="#0a090c" />
		{[[905, 452], [1015, 452]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={46} fill="#8a6a2e" /><circle cx={x - 14} cy={y - 16} r={16} fill="#f0d090" opacity={0.35 + 0.6 * fire} /></g>)}
		<Arc x1={951} x2={969} y={452} k={fire} f={f} />
		{/* bench */}
		<rect x={-300} y={700} width={W + 600} height={30} fill="#2a2018" /><rect x={-300} y={730} width={W + 600} height={650} fill="#100d0c" />
		{/* the heavy key: lever on a pivot, brass contacts */}
		<rect x={360} y={676} width={360} height={24} fill="#1f1812" />
		<rect x={620} y={664} width={30} height={14} fill="#c8a050" opacity={0.85} />
		<g transform={`rotate(${ang} ${kx} ${ky})`}><rect x={kx - 30} y={ky - 34} width={270} height={18} rx={6} fill="#0c0b0e" /><rect x={kx - 30} y={ky - 34} width={270} height={4} fill="#c8a050" opacity={0.5} /></g>
		<rect x={kx - 14} y={ky - 20} width={28} height={30} fill="#0c0b0e" />
		{/* the operator, seated at the bench, his right hand on the knob (one tone) */}
		{(() => { const P = fkPose({hip: 0.37, lean: 22, neck: 14, lt: 88, lk: 92, rt: 84, rk: 86, la: 44, le: 56, ra: 74 - press * 3, re: 22 + press * 5}), h = 1250, k0 = KEY0;
			return <Rimmed x={k0[0] - KEYP.RHand[0] * h} ground={k0[1] + KEYP.RHand[1] * h} h={h} pose={P} look={OPER} col={FIG} rim="#ffb46a" rimOp={0.18} rimDx={2} rimDy={-1} T={t} />; })()}
		<ellipse cx={knob[0]} cy={knob[1] - 6} rx={34} ry={14} fill="#060709" />
		<rect width={W} height={H} fill="#cfefff" opacity={0.1 * fire} />
	</g>;
};

/* ---------- Poldhu: the cliff-top station at sunset ---------- */
const cliffY = (x: number) => 792 + 10 * Math.sin(x * 0.004 + 1) + 6 * Math.sin(x * 0.013);
const ML = 560, MR = 1225, MTOP = [96, 112], LI: [number, number] = [910, 606];
export const HUTWIN = {x: 806, y: 704, w: 96, h: 54};
const PoldhuOut: React.FC<{t: number; tau: number; inside?: React.ReactNode; winK?: number}> = ({t, tau, inside, winK = 1}) => {
	const T = MARCONI_T, {fire, dot} = keyState(tau, T);
	let cliff = `M-300,1400 L-300,${cliffY(-300).toFixed(1)}`; for (let x = -280; x <= 1300; x += 20) cliff += ` L${x},${cliffY(x).toFixed(1)}`; cliff += ' L1330,830 L1352,900 L1340,1400 Z';
	const span = (u: number): [number, number] => [lerp(ML, MR, u), lerp(MTOP[0], MTOP[1], u) + 34 * Math.sin(Math.PI * u)];
	const mast = (x: number, top: number) => { const g = cliffY(x); return <g><path d={`M${x - 6},${g} L${x - 2},${top} L${x + 2},${top} L${x + 6},${g} Z`} fill="#0b0e16" />
		{[-1, 1].map((s) => [0.0, 0.45].map((h, j) => <line key={`${s}${j}`} x1={x} y1={lerp(top, g, h)} x2={x + s * (200 - j * 70)} y2={cliffY(x + s * (200 - j * 70)) + 2} stroke="#0b0e16" strokeWidth={1.2} opacity={0.7} />))}</g>; };
	const tagK = sm(seg(tau, T.tag, T.tag + 0.5));
	const rings = dotTimes(T).map((a, i) => { const age = tau - a; if (age < 0 || age > 1.6) return null; const r = 40 + age * 820, op = (1 - age / 1.6);
		return <path key={i} d={`M${890 + r * Math.cos(-0.9)},${330 + r * Math.sin(-0.9)} A${r},${r} 0 0,1 ${890 + r * Math.cos(0.9)},${330 + r * Math.sin(0.9)}`} stroke={RING} strokeWidth={4 - 2.5 * age / 1.6} fill="none" opacity={0.8 * op} />; });
	return <g>
		<defs><linearGradient id="mcExt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9e8cb5" /><stop offset="0.3" stopColor="#a07d9a" /><stop offset="0.48" stopColor="#d88a6a" /><stop offset="0.505" stopColor="#5a4a66" /><stop offset="1" stopColor="#2f2f40" /></linearGradient></defs>
		<rect x={W - 4} y={-300} width={2600} height={1680} fill="url(#mcExt)" />
		<image href={staticFile('ep41/marconi_poldhu.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" transform="scale(-1,1)" />
		<rect x={-W} y={1078} width={2 * W + 2600} height={400} fill="#2f2f40" /><rect x={-W} y={-300} width={3 * W + 2600} height={302} fill="#9e8cb5" />
		<image href={staticFile('ep41/marconi_poldhu.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" />
		<Glow x={1210} y={528} r={300} c="#ffc27a" o={0.25 + 0.03 * Math.sin(t * 2)} id="mcSunG" />
		{/* sea glitter shimmer over the plate */}
		{Array.from({length: 26}, (_, i) => { const y = 600 + rnd(i, 3) * 340, w = 20 + rnd(i, 4) * 60, x = 1210 + (rnd(i, 5) - 0.5) * (80 + (y - 560) * 0.9);
			return <rect key={i} x={x + 14 * Math.sin(t * 1.3 + i)} y={y} width={w} height={2.5} fill="#ffc890" opacity={0.25 * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7))} />; })}
		{/* masts, guys, the fan of wires converging on the hut */}
		{mast(ML, MTOP[0])}{mast(MR, MTOP[1])}
		<path d={`M${ML},${MTOP[0]} Q${(ML + MR) / 2},${(MTOP[0] + MTOP[1]) / 2 + 68} ${MR},${MTOP[1]}`} stroke="#0b0e16" strokeWidth={2} fill="none" />
		{Array.from({length: 30}, (_, i) => { const p = span(0.08 + 0.84 * i / 29); return <line key={i} x1={p[0]} y1={p[1]} x2={LI[0] + (i - 15) * 0.6} y2={LI[1]} stroke="#0b0e16" strokeWidth={1} opacity={0.75} />; })}
		{/* the hut */}
		<path d={`M748,690 L910,598 L1072,690 Z`} fill="#0f111a" />
		<rect x={762} y={684} width={296} height={cliffY(910) - 684 + 8} fill="#181a26" />
		<rect x={990} y={722} width={42} height={cliffY(1010) - 722 + 8} fill="#0c0d14" />
		<rect x={HUTWIN.x - 6} y={HUTWIN.y - 6} width={HUTWIN.w + 12} height={HUTWIN.h + 12} fill="#0c0d14" />
		{inside ? <g><defs><clipPath id="mcWin"><rect x={HUTWIN.x} y={HUTWIN.y} width={HUTWIN.w} height={HUTWIN.h} /></clipPath></defs>
			<g clipPath="url(#mcWin)"><g transform={`translate(${HUTWIN.x},${HUTWIN.y}) scale(${HUTWIN.w / W})`}>{inside}</g>
				{/* seen through glass from outside, the room grows a little dimmer and warmer as we pull away — gradually, never a flat fill */}
				<rect x={HUTWIN.x} y={HUTWIN.y} width={HUTWIN.w} height={HUTWIN.h} fill="#2a180c" opacity={0.22 * winK} />
				<rect x={HUTWIN.x} y={HUTWIN.y} width={HUTWIN.w} height={HUTWIN.h} fill="#ffb86a" opacity={0.16 * winK} />
				<rect x={HUTWIN.x} y={HUTWIN.y} width={HUTWIN.w} height={HUTWIN.h} fill="#dff4ff" opacity={0.35 * fire * winK} /></g>
				<Glow x={HUTWIN.x + HUTWIN.w / 2} y={HUTWIN.y + HUTWIN.h / 2} r={70} c="#ffb86a" o={0.22 * winK} id="mcWinGlow" /></g>
			: <g><rect x={HUTWIN.x} y={HUTWIN.y} width={HUTWIN.w} height={HUTWIN.h} fill="#ffb86a" opacity={0.75} /><rect x={HUTWIN.x} y={HUTWIN.y} width={HUTWIN.w} height={HUTWIN.h} fill="#dff4ff" opacity={0.8 * fire} /></g>}
		<Glow x={LI[0]} y={LI[1]} r={60} c="#cfefff" o={0.8 * fire} id="mcLiG" />
		<path d={cliff} fill="#141826" />
		<path d={cliff.replace(/ L1330,830.*$/, '')} stroke="#2e3040" strokeWidth={3} fill="none" />
		{Array.from({length: 40}, (_, i) => { const x = 20 + i * 32 + rnd(i, 7) * 12, y = cliffY(x), sw = 5 * Math.sin(t * 2.2 + i * 0.7);
			return <path key={i} d={`M${x},${y + 2} Q${x + 2 + sw * 0.5},${y - 8} ${x + 4 + sw},${y - 14 - rnd(i, 8) * 6}`} stroke="#141826" strokeWidth={3} fill="none" />; })}
		{rings}
		{/* the in-world tag: S = · · · ; each dot lights as its spark fires */}
		{tagK > 0 && <g opacity={tagK} transform={`translate(${1395 + 20 * (1 - tagK)},300)`}>
			<Glow x={170} y={-30} r={260} c="#000" o={0.25} id="mcTagShade" />
			<text x={0} y={0} style={{fontFamily: LATS, fontStyle: 'italic', fontSize: 104}} fill={GOLD}>S =</text>
			{[0, 1, 2].map((i) => { const on = dot === i ? 1 : 0; return <g key={i}><circle cx={240 + i * 66} cy={-34} r={13 + 5 * on} fill={GOLD} />{on > 0 && <Glow x={240 + i * 66} y={-34} r={46} c={GOLD} o={0.7} id={`mcTd${i}`} />}</g>; })}
		</g>}
	</g>;
};

/* ---------- the Atlantic (whip west, sunset → grey gale) ---------- */
const Steamer: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d="M-170,0 L170,0 L150,24 L-150,24 Z" fill="#0e1018" /><rect x={-110} y={-22} width={200} height={22} fill="#0e1018" />
	<rect x={-50} y={-70} width={22} height={50} fill="#0e1018" /><rect x={20} y={-70} width={22} height={50} fill="#0e1018" />
	<line x1={-140} y1={0} x2={-140} y2={-96} stroke="#0e1018" strokeWidth={4} /><line x1={130} y1={0} x2={130} y2={-90} stroke="#0e1018" strokeWidth={4} />
	{[-39, 31].map((fx, i) => <path key={i} d={`M${fx},-72 Q${fx + 60},-110 ${fx + 160 + 20 * Math.sin(t * 2 + i)},-104`} stroke="#3a3c48" strokeWidth={16} fill="none" opacity={0.5} strokeLinecap="round" />)}
</g>;
const SeaRun: React.FC<{t: number; tau: number}> = ({t, tau}) => {
	const T = MARCONI_T, k = seg(tau, T.sea - 0.2, T.hill), hz = 520;
	const sky: [string, string, string] = [mixC('#1E2340', '#2A323F', k), mixC('#6A4A6E', '#4A5868', k), mixC('#FFC27A', '#7D8B96', k)];
	const run = tau * 2600;
	return <g>
		<defs><linearGradient id="mcRunSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.6" stopColor={sky[1]} /><stop offset="1" stopColor={sky[2]} /></linearGradient></defs>
		<rect x={-1400} y={-300} width={W + 2800} height={hz + 300} fill="url(#mcRunSky)" />
		{k < 0.9 && <Glow x={1500} y={hz} r={260} c="#ffc27a" o={0.6 * (1 - k)} id="mcRunSun" />}
		<defs><filter id="mcSoft2" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="12" /></filter></defs>
		<g filter="url(#mcSoft2)">{Array.from({length: 6}, (_, i) => { const x = ((1900 - (run * 0.25 + i * 420)) % 2400 + 2400) % 2400 - 240; return <ellipse key={i} cx={x} cy={120 + i * 52} rx={300} ry={18} fill={mixC('#3a2e4a', '#2c333e', k)} opacity={0.55} />; })}</g>
		<rect x={-1400} y={hz} width={W + 2800} height={H - hz + 300} fill={mixC('#2A2F4A', '#3A4058', k)} />
		{Array.from({length: 70}, (_, i) => { const row = i % 10, y = hz + 8 + row * row * 6.2, sp = 0.15 + row * row * 0.06, x = ((rnd(i, 2) * 4200 - run * sp) % 4200 + 4200) % 4200 - 1140, w = 30 + row * 14;
			return <path key={i} d={`M${x},${y} q${w / 2},${-4 - row * 0.6} ${w},0`} stroke={mixC('#ffb070', '#9FB4C4', k)} strokeWidth={1 + row * 0.35} fill="none" opacity={0.25 + 0.04 * row} />; })}
		<Steamer x={lerp(1700, 300, seg(tau, T.sea, T.hill))} y={hz + 46} s={0.7} t={t} />
		{/* the S keeps going: rings racing ahead, west */}
		{Array.from({length: 3}, (_, i) => { const r = 120 + ((tau * 3 + i / 3) % 1) * 900; return <path key={i} d={`M${600 + r * Math.cos(-0.7)},${330 + r * Math.sin(-0.7)} A${r},${r} 0 0,1 ${600 + r * Math.cos(0.7)},${330 + r * Math.sin(0.7)}`} stroke={RING} strokeWidth={3} fill="none" opacity={0.7 * (1 - ((tau * 3 + i / 3) % 1))} />; })}
	</g>;
};

/* ---------- Signal Hill, Newfoundland: gale, grey, no moon ---------- */
const fgY = (x: number) => 884 + 16 * Math.sin(x * 0.0035 + 0.6) + 5 * Math.sin(x * 0.017);
const bgY = (x: number) => 806 + 24 * Math.sin(x * 0.0028 + 1.4);
const HOSP = {x0: 520, x1: 1040};
const hospBase = Math.max(...Array.from({length: 27}, (_, i) => fgY(lerp(HOSP.x0, HOSP.x1, i / 26)))) + 6;
export const RXWIN = {x: 948, y: hospBase - 150, w: 62, h: 84};
const BRACE = fkPose({hip: 0.6, lean: -16, neck: -24, lt: 30, lk: 34, rt: -24, rk: 6, la: 150, le: 8, ra: 138, re: 18});
const KITE_LOOK: Look4 = {dress: 'coat', head: 'cap', beard: 'moustache'};
const kiteAt = (t: number): [number, number, number] => [1470 + 34 * Math.sin(t * 1.3) + 12 * Math.sin(t * 3.1), -400 + 26 * Math.sin(t * 1.7) + 8 * Math.sin(t * 4.3), 12 * Math.sin(t * 1.1) + 5 * Math.sin(t * 2.9)];
/** a point a fraction u along the aerial: kite bridle → the assistant's hands → the receiving window */
const wirePts = (t: number) => { const [kx, ky] = kiteAt(t), ax = 1290, ag = fgY(ax), hands = jointAt(BRACE, 'RHand', ax, ag, 250);
	return {bridle: [kx - 20, ky + 190] as [number, number], hands, win: [RXWIN.x + RXWIN.w - 6, RXWIN.y + 10] as [number, number], ax, ag}; };
const alongWire = (t: number, u: number): [number, number] => { const {bridle, hands, win} = wirePts(t);
	if (u < 0.82) { const v = u / 0.82; return [lerp(bridle[0], hands[0], v), lerp(bridle[1], hands[1], v) + 30 * Math.sin(Math.PI * v)]; }
	const v = (u - 0.82) / 0.18; return [lerp(hands[0], win[0], v), lerp(hands[1], win[1], v) + 26 * Math.sin(Math.PI * v)]; };
const SignalHill: React.FC<{t: number; tau: number; py: number}> = ({t, tau, py}) => {
	const T = MARCONI_T, [kx, ky, kr] = kiteAt(t), {bridle, hands, win, ax, ag} = wirePts(t);
	let fg = `M-1300,1500 L-1300,${fgY(-1300).toFixed(1)}`; for (let x = -1276; x <= W + 1300; x += 24) fg += ` L${x},${fgY(x).toFixed(1)}`; fg += ` L${W + 1300},1500 Z`;
	let bg = `M-1300,1500 L-1300,${bgY(-1300).toFixed(1)}`; for (let x = -1276; x <= W + 1300; x += 24) bg += ` L${x},${bgY(x).toFixed(1)}`; bg += ` L${W + 1300},1500 Z`;
	const glintU = seg(tau, T.glint, T.glint + 1.55), wind = t * 900;
	const hb = hospBase, hx0 = HOSP.x0, hx1 = HOSP.x1, top = hb - 290, peak = hb - 400;
	return <g>
		<g transform={`translate(0,${py * 0.25})`}>
			<defs><linearGradient id="mcHillSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#262d39" /><stop offset="0.55" stopColor="#4A5868" /><stop offset="1" stopColor="#899197" /></linearGradient></defs>
			<rect x={-1300} y={-1400} width={W + 2600} height={2900} fill="url(#mcHillSky)" />
		</g>
		<g transform={`translate(0,${py * 0.45})`}>
			<defs><linearGradient id="mcSkyTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a313d" /><stop offset="1" stopColor="#899197" /></linearGradient>
				<linearGradient id="mcFeather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#899197" stopOpacity="1" /><stop offset="1" stopColor="#899197" stopOpacity="0" /></linearGradient></defs>
			<rect x={-1300} y={-1700} width={W + 2600} height={1702} fill="url(#mcSkyTop)" />
			<image href={staticFile('ep41/marconi_sea.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" />
			<image href={staticFile('ep41/marconi_sea.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" transform="scale(-1,1)" />
			<image href={staticFile('ep41/marconi_sea.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" transform={`translate(${2 * W},0) scale(-1,1)`} />
			<rect x={-1300} y={1076} width={W + 2600} height={500} fill="#43494f" />
			<rect x={-1300} y={0} width={W + 2600} height={220} fill="url(#mcFeather)" /></g>
		{/* racing low cloud */}
		<defs><filter id="mcSoft" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="14" /></filter></defs>
		<g transform={`translate(0,${py * 0.3})`} filter="url(#mcSoft)">{Array.from({length: 7}, (_, i) => { const x = ((rnd(i, 11) * 2600 + t * (260 + 60 * i)) % 2600) - 340; return <ellipse key={i} cx={x} cy={-560 + i * 110} rx={340 + 120 * rnd(i, 12)} ry={22 + 14 * rnd(i, 13)} fill="#3a4350" opacity={0.55} />; })}</g>
		{/* the far crest with Cabot Tower */}
		<g transform={`translate(0,${py * 0.8})`}>
			<Sprite k="cabot" x={300} y={bgY(300) + 4} h={420} c="#262d37" />
			<path d={bg} fill="#1b212a" />
		</g>
		<g transform={`translate(0,${py})`}>
			{/* the old hospital: two storeys of clapboard, the receiving room lit by a candle */}
			<path d={`M${hx0 - 14},${top} L${(hx0 + hx1) / 2},${peak} L${hx1 + 14},${top} Z`} fill="#141920" />
			<rect x={hx0 + 70} y={peak + 30} width={26} height={70} fill="#141920" />
			<rect x={hx0} y={top} width={hx1 - hx0} height={hb - top} fill="#1c222b" />
			{Array.from({length: 14}, (_, i) => <line key={i} x1={hx0} x2={hx1} y1={top + 14 + i * 20} y2={top + 14 + i * 20} stroke="#161b23" strokeWidth={2} />)}
			{[0, 1, 2, 3].map((i) => <rect key={i} x={hx0 + 40 + i * 120} y={top + 26} width={56} height={78} fill="#0f1318" />)}
			{[0, 1, 2].map((i) => <rect key={i} x={hx0 + 70 + i * 120} y={RXWIN.y} width={RXWIN.w} height={RXWIN.h} fill="#0f1318" />)}
			<rect x={hx0 + 420} y={hb - 120} width={0} height={0} />
			<rect x={RXWIN.x} y={RXWIN.y} width={RXWIN.w} height={RXWIN.h} fill="#ffcf8a" opacity={0.55 + 0.08 * Math.sin(t * 9) * Math.sin(t * 5)} />
			<path d={`M${RXWIN.x + RXWIN.w / 2},${RXWIN.y} L${RXWIN.x + RXWIN.w / 2},${RXWIN.y + RXWIN.h} M${RXWIN.x},${RXWIN.y + RXWIN.h / 2} L${RXWIN.x + RXWIN.w},${RXWIN.y + RXWIN.h / 2}`} stroke="#0f1318" strokeWidth={4} />
			<Glow x={RXWIN.x + RXWIN.w / 2} y={RXWIN.y + RXWIN.h / 2} r={90} c="#ffcf8a" o={0.35} id="mcRxG" />
			{/* the aerial: kite bridle → the assistant's hands → into the window */}
			<path d={`M${bridle[0]},${bridle[1]} Q${(bridle[0] + hands[0]) / 2},${(bridle[1] + hands[1]) / 2 + 30} ${hands[0]},${hands[1]} Q${(hands[0] + win[0]) / 2},${(hands[1] + win[1]) / 2 + 26} ${win[0]},${win[1]}`} stroke="#0c1014" strokeWidth={3} fill="none" />
			{/* the kite: big linen hexagon on bamboo spars, yawing in the gale */}
			{[-60, 60].map((dx, i) => <line key={i} x1={kx + dx} y1={ky + 40} x2={bridle[0]} y2={bridle[1]} stroke="#1a1e24" strokeWidth={1.5} transform={`rotate(${kr} ${kx} ${ky})`} />)}
			<g transform={`rotate(${kr} ${kx} ${ky})`}>
				<HexKite x={kx} y={ky} s={2.5} col="#cfc6ae" />
				<path d={`M${kx},${ky - 150} L${kx},${ky + 150} M${kx - 110},${ky - 75} L${kx + 110},${ky + 75} M${kx + 110},${ky - 75} L${kx - 110},${ky + 75}`} stroke="#5a4a32" strokeWidth={5} />
				<path d={`M${kx},${ky - 150} L${kx + 110},${ky - 75} L${kx + 110},${ky + 75} L${kx},${ky + 150} L${kx - 110},${ky + 75} L${kx - 110},${ky - 75} Z`} stroke="#8c8270" strokeWidth={3} fill="none" />
				<path d={`M${kx},${ky - 150} L${kx + 110},${ky - 75} L${kx + 110},${ky + 75} L${kx},${ky + 150} Z`} fill="#ffffff" opacity={0.06 + 0.05 * Math.sin(t * 7)} />
			</g>
			{/* the assistant braces at the line */}
			<Rimmed x={ax} ground={ag + 2} h={250} pose={mixPose(BRACE, fkPose({hip: 0.6, lean: -12, neck: -28, lt: 26, lk: 30, rt: -20, rk: 8, la: 146, le: 10, ra: 134, re: 20}), 0.5 + 0.5 * Math.sin(t * 2.3))} look={KITE_LOOK} col={FIG} rimOp={0} T={t} />
			<path d={fg} fill="#141A22" />
			{Array.from({length: 6}, (_, i) => { const x = 60 + i * 330 + rnd(i, 21) * 120, y = fgY(x) + 26 + rnd(i, 22) * 90, w = 40 + rnd(i, 23) * 90;
			return <path key={i} d={`M${x - w},${y} Q${x - w * 0.4},${y - 9} ${x},${y - 5} Q${x + w * 0.5},${y - 11} ${x + w},${y + 1} Q${x + w * 0.2},${y + 7} ${x - w * 0.3},${y + 5} Z`} fill="#C9D2DA" opacity={0.22} />; })}
			{Array.from({length: 48}, (_, i) => { const x = 10 + i * 40 + rnd(i, 24) * 14, y = fgY(x), sw = 7 + 4 * Math.sin(t * 6 + i);
				return <path key={i} d={`M${x},${y + 3} Q${x + sw * 0.5},${y - 8} ${x + sw * 1.4},${y - 12}`} stroke="#141A22" strokeWidth={3} fill="none" />; })}
			{/* the signal arrives: gold glint down the wire */}
			{glintU > 0 && glintU < 1 && (() => { const p = alongWire(t, glintU), q = alongWire(t, Math.max(0, glintU - 0.06)); return <g><line x1={q[0]} y1={q[1]} x2={p[0]} y2={p[1]} stroke={GOLD} strokeWidth={5} strokeLinecap="round" /><Glow x={p[0]} y={p[1]} r={60} c={GOLD} o={0.9} id="mcGlint" /></g>; })()}
		</g>
		{/* rings arriving from the east (screen left), as sent from Poldhu */}
		<g transform={`translate(0,${py * 0.6})`}>{Array.from({length: 3}, (_, i) => { const a = T.ringsIn + i * 0.17, age = tau - a; if (age < 0 || age > 1.2) return null; const r = 300 + age * 1400, cx = -900, cy = -260;
			return <path key={i} d={`M${cx + r * Math.cos(-0.35)},${cy + r * Math.sin(-0.35)} A${r},${r} 0 0,1 ${cx + r * Math.cos(0.35)},${cy + r * Math.sin(0.35)}`} stroke={RING} strokeWidth={4} fill="none" opacity={0.8 * (1 - age / 1.2)} />; })}</g>
		{/* the gale: snow flurries */}
		{Array.from({length: 60}, (_, i) => { const x = ((rnd(i, 31) * 2200 + wind * (0.7 + rnd(i, 32))) % 2200) - 140, y = rnd(i, 33) * 1080 + py * 0.7 * rnd(i, 34) - 300 * rnd(i, 35); return <line key={i} x1={x} y1={y} x2={x + 38} y2={y + 6} stroke="#dde5ec" strokeWidth={1.6} opacity={0.3} />; })}
	</g>;
};

/* ---------- inside the hospital room: Marconi hands Kemp the earpiece ---------- */
const FLOOR = 880, MX = 470, MH = 600, KX = 900, KH = 610;
const MARCONI_LOOK: Look4 = {dress: 'coat', head: 'short', beard: 'moustache'};
const KEMP_LOOK: Look4 = {dress: 'coat', head: 'bowler', beard: 'full'};
const M_LISTEN = fkPose({hip: 0.37, lean: 4, neck: 10, lt: 86, lk: 90, rt: 92, rk: 96, la: 24, le: 138, ra: 34, re: 56});
const M_GIVE = fkPose({hip: 0.37, lean: 12, neck: 2, lt: 86, lk: 90, rt: 92, rk: 96, la: 84, le: 8, ra: 36, re: 56});
const M_WAIT = fkPose({hip: 0.37, lean: 16, neck: -10, lt: 86, lk: 90, rt: 92, rk: 96, la: 54, le: 36, ra: 46, re: 44});
const M_UP = fkPose({hip: 0.37, lean: 22, neck: -18, lt: 86, lk: 90, rt: 92, rk: 96, la: 62, le: 30, ra: 52, re: 40});
const K_STAND = fkPose({hip: 0.655, lean: 6, neck: 6, lt: 3, lk: 3, rt: -3, rk: 3, la: 8, le: 16, ra: 4, re: 12});
const K_REACH = fkPose({hip: 0.655, lean: 16, neck: 8, lt: 4, lk: 6, rt: -6, rk: 6, la: 72, le: 16, ra: 6, re: 14});
const K_LISTEN = fkPose({hip: 0.64, lean: 26, neck: 12, lt: 8, lk: 14, rt: -4, rk: 8, la: 44, le: 122, ra: 34, re: 44});
const K_LIFT = fkPose({hip: 0.65, lean: 12, neck: -14, lt: 6, lk: 8, rt: -4, rk: 6, la: 34, le: 124, ra: 26, re: 34});
const BOX = {x: 880, y: 546, w: 170, h: 64}, TERM_IN: [number, number] = [1030, 548], TERM_EAR: [number, number] = [900, 548], WIN_IN: [number, number] = [1058, 186];
const roomPoses = (tau: number) => { const T = MARCONI_T;
	const m = tau < T.take ? mixPose(M_LISTEN, M_GIVE, sm(seg(tau, T.give, T.take))) : tau < T.lift ? mixPose(M_GIVE, M_WAIT, sm(seg(tau, T.take + 0.1, T.take + 0.8))) : mixPose(M_WAIT, M_UP, sm(seg(tau, T.lift, T.lift + 0.5)));
	const k = tau < T.take ? mixPose(K_STAND, K_REACH, sm(seg(tau, T.give + 0.1, T.take))) : tau < T.lift ? mixPose(K_REACH, K_LISTEN, sm(seg(tau, T.bend, T.bend + 0.75))) : mixPose(K_LISTEN, K_LIFT, sm(seg(tau, T.lift, T.lift + 0.35)));
	const mHand = jointAt(m, 'LHand', MX, FLOOR, MH), kHand = jointAt(k, 'LHand', KX, FLOOR, KH, true);
	const ear: [number, number] = tau < T.take ? mHand : kHand;
	return {m, k, ear}; };
/** where a spark is at time tau (null when none): window → receiver → up the cord → earpiece */
const sparkAt = (tau: number, tick: number, travel: number, ear: [number, number]): [number, number] | null => { const u = seg(tau, tick - travel, tick); if (tau < tick - travel || tau > tick + 0.02) return null;
	if (u < 0.5) { const v = u / 0.5; return [lerp(WIN_IN[0], TERM_IN[0], v), lerp(WIN_IN[1], TERM_IN[1], v) + 70 * Math.sin(Math.PI * v)]; }
	const v = (u - 0.5) / 0.5; return [lerp(TERM_EAR[0], ear[0], v), lerp(TERM_EAR[1], ear[1], v) + 60 * Math.sin(Math.PI * v)]; };
export const DOTS_W: [number, number][] = [[1130, 282], [1210, 282], [1290, 282]];
const Room: React.FC<{t: number; tau: number}> = ({t, tau}) => {
	const T = MARCONI_T, {m, k, ear} = roomPoses(tau), fl = 0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 7.1), wind = t * 700;
	const ticks = [T.tick1, T.tick2, T.tick3];
	return <g>
		<rect x={-300} y={-300} width={W + 600} height={FLOOR + 300} fill="#333944" />
		{Array.from({length: 22}, (_, i) => <rect key={i} x={i * 88 + 20} y={0} width={3} height={FLOOR} fill="#2b3039" />)}
		<rect x={0} y={560} width={W} height={6} fill="#2a2f38" />
		{/* the window: grey gale outside, the aerial coming in at the top */}
		<defs><linearGradient id="mcWinSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d8b96" /><stop offset="1" stopColor="#a8b4be" /></linearGradient>
			<clipPath id="mcWinClip"><rect x={770} y={180} width={280} height={330} /></clipPath></defs>
		<rect x={756} y={166} width={308} height={358} fill="#1b1f26" />
		<g clipPath="url(#mcWinClip)"><rect x={770} y={180} width={280} height={330} fill="url(#mcWinSky)" />
			{Array.from({length: 4}, (_, i) => <ellipse key={i} cx={((i * 260 + t * 160) % 700) + 600} cy={220 + i * 50} rx={160} ry={18} fill="#6c7884" opacity={0.6} />)}
			<path d={`M770,${470 + 6 * Math.sin(t)} Q900,${452} 1050,${466}`} stroke="#4a545e" strokeWidth={40} fill="none" />
			<line x1={1200} y1={-200} x2={WIN_IN[0]} y2={WIN_IN[1]} stroke="#11151a" strokeWidth={2.5} />
			{Array.from({length: 18}, (_, i) => { const x = ((rnd(i, 41) * 600 + wind * (0.8 + rnd(i, 42))) % 600) + 700, y = 180 + rnd(i, 43) * 330; return <line key={i} x1={x} y1={y} x2={x + 26} y2={y + 4} stroke="#eef2f5" strokeWidth={1.4} opacity={0.5} />; })}
		</g>
		<path d="M910,180 L910,510 M770,345 L1050,345" stroke="#1b1f26" strokeWidth={10} />
		<rect x={740} y={510} width={340} height={16} fill="#1b1f26" />
		<rect x={0} y={0} width={W} height={FLOOR} fill="#9AA8B4" opacity={0.04} />
		<rect x={-300} y={FLOOR} width={W + 600} height={H - FLOOR + 300} fill="#1a1e25" />
		{Array.from({length: 9}, (_, i) => <line key={i} x1={0} x2={W} y1={FLOOR + 10 + i * i * 3.2} y2={FLOOR + 10 + i * i * 3.2} stroke="#15181e" strokeWidth={2} />)}
		{/* Kemp stands behind the table, against the window */}
		<Rimmed x={KX} ground={FLOOR} h={KH} pose={k} look={KEMP_LOOK} flip col={FIG} rimOp={0} T={t} />
		{/* the lead-in from the window down to the receiver */}
		<Wire a={WIN_IN} b={TERM_IN} sag={70} col="#0f1216" w={2.5} />
		{/* table, receiver box (detector), batteries, candle */}
		<rect x={600} y={610} width={680} height={22} fill="#2a2520" />
		<rect x={622} y={632} width={20} height={FLOOR - 632} fill="#1f1b17" /><rect x={1240} y={632} width={20} height={FLOOR - 632} fill="#1f1b17" />
		<rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill="#2c2620" stroke="#1a1612" strokeWidth={3} />
		<rect x={BOX.x + 30} y={BOX.y - 16} width={100} height={12} rx={6} fill="#9fb0b8" opacity={0.5} /><rect x={BOX.x + 26} y={BOX.y - 18} width={10} height={16} fill="#c8a050" /><rect x={BOX.x + 124} y={BOX.y - 18} width={10} height={16} fill="#c8a050" />
		{[TERM_IN, TERM_EAR].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={6} fill="#c8a050" />)}
		{[1080, 1124].map((x, i) => <g key={i}><rect x={x} y={556} width={34} height={54} rx={4} fill="#17171c" /><rect x={x + 12} y={548} width={10} height={9} fill="#c8a050" /></g>)}
		<Glow x={1212} y={552} r={320} c="#FFCF8A" o={0.32 * fl} id="mcCandleG" />
		<ellipse cx={1212} cy={608} rx={30} ry={6} fill="#4a3e30" /><rect x={1205} y={566} width={14} height={42} fill="#e8e0cc" />
		<path d={`M1212,${566 - 26 * fl} Q1219,555 1212,566 Q1205,555 1212,${566 - 26 * fl} Z`} fill="#ffd27a" />
		{/* the earpiece on its cord */}
		<path d={`M${TERM_EAR[0]},${TERM_EAR[1]} Q${(TERM_EAR[0] + ear[0]) / 2 - 30},${Math.max(TERM_EAR[1], ear[1]) + 80} ${ear[0]},${ear[1] + 10}`} stroke="#0c0e12" strokeWidth={3} fill="none" />
		<rect x={ear[0] - 9} y={ear[1] - 16} width={18} height={30} rx={6} fill="#08090c" />
		{/* Marconi on his chair */}
		<path d={`M${MX - 90},${FLOOR} L${MX - 84},${FLOOR - 230} L${MX - 70},${FLOOR - 230} L${MX - 66},${FLOOR - MH * 0.36}`} stroke="#1c2028" strokeWidth={12} fill="none" />
		<rect x={MX - 92} y={FLOOR - MH * 0.37 + 8} width={150} height={14} fill="#1c2028" /><rect x={MX + 40} y={FLOOR - MH * 0.37 + 18} width={10} height={MH * 0.37 - 18} fill="#1c2028" />
		<Rimmed x={MX} ground={FLOOR} h={MH} pose={m} look={MARCONI_LOOK} col={FIG} rim="#ffcf8a" rimOp={0.18} rimDx={2} rimDy={-1.2} T={t} />
		{/* the three sparks: down the wire, through the receiver, up the cord into the earpiece */}
		{ticks.map((tk, i) => { const p = sparkAt(tau, tk, T.travel, ear); return p ? <g key={i}><Glow x={p[0]} y={p[1]} r={40} c={GOLD} o={0.95} id={`mcSp${i}`} /><circle cx={p[0]} cy={p[1]} r={6} fill="#fff6d8" /></g> : null; })}
		{ticks.map((tk, i) => { const k2 = 1 - seg(tau, tk, tk + 0.25); return tau >= tk && k2 > 0 ? <circle key={i} cx={ear[0]} cy={ear[1]} r={20 + 40 * (1 - k2)} stroke={GOLD} strokeWidth={3} fill="none" opacity={k2} /> : null; })}
	</g>;
};

export const MARCONI3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = MARCONI_T;
	// 1. Poldhu: from the white of Bell's lamp into the spark; pull back out through the hut window to the station
	if (tau < T.whip + 0.25) {
		const whipK = seg(tau, T.whip, T.whip + 0.25), d = drift(t, 1);
		if (tau < T.pullA) {
			// frame 0 continues Bell's push into the flame: we are inside the light of the arc, and pull back from it
			const z0 = lerp(3.2, 1.0, easeOut(seg(tau, 0, T.pullA)));
			return <g><Cam zoom={z0} fx={960} fy={452} px={d.px * 0.6} py={d.py * 0.6}><PoldhuIn t={t} tau={tau} /></Cam>
				<Flash k={0.35 * (1 - easeOut(seg(tau, 0, 0.45)))} col="#fff6e6" /></g>;
		}
		const u = ease(seg(tau, T.pullA, T.pullB)), Z0 = W / HUTWIN.w, z = Math.pow(Z0, 1 - u) * lerp(1, 1.04, seg(tau, T.pullB, T.whip));
		const cx = HUTWIN.x + HUTWIN.w / 2, cy = HUTWIN.y + HUTWIN.h / 2, k = (z - 1) / (Z0 - 1);
		const inside = <PoldhuIn t={t} tau={tau} />;   // the interior stays in the window all the way out
		return <Whip id="mcWhip1" amt={whipK * 90}><Cam zoom={z} fx={cx} fy={cy} px={(960 - cx) * k + d.px * (1 - k) - easeIn(whipK) * 1500} py={(540 - cy) * k + d.py * (1 - k)} roll={d.roll * (1 - k)}>
			<PoldhuOut t={t} tau={tau} inside={inside} winK={sm(1 - k)} /></Cam></Whip>;
	}
	// 2. the Atlantic, westward
	if (tau < T.hill) { const k = 1 - seg(tau, T.whip + 0.25, T.whip + 0.5);
		return <Whip id="mcWhip2" amt={k * 80 + seg(tau, T.hill - 0.2, T.hill) * 70}><Cam zoom={1.05} roll={-1 + 2 * seg(tau, T.sea, T.hill)} px={k * 900 - seg(tau, T.hill - 0.2, T.hill) * 800}><SeaRun t={t} tau={tau} /></Cam></Whip>; }
	// 3. Signal Hill: the kite, then tilt down along the wire into the lit window
	if (tau < T.room) {
		const inK = 1 - seg(tau, T.hill, T.hill + 0.25), py = lerp(720, 0, ease(seg(tau, T.tiltA, T.tiltB))), push = easeIn(seg(tau, T.tiltB - 0.1, T.room));
		const d = drift(t, 1.4), wx = RXWIN.x + RXWIN.w / 2, wy = RXWIN.y + RXWIN.h / 2;
		return <g><Whip id="mcWhip3" amt={inK * 70}><Cam zoom={lerp(1, 16, push)} fx={lerp(960, wx, sm(push * 3))} fy={lerp(540, wy, sm(push * 3))} px={d.px * (1 - push) + inK * 700} py={d.py * (1 - push)} roll={d.roll}>
			<SignalHill t={t} tau={tau} py={py} /></Cam></Whip>
			<Flash k={seg(tau, T.room - 0.18, T.room) * 0.3} col="#ffdca0" /></g>;
	}
	// 4. the receiving room: hand-off, three ticks, push into the three dots
	const z1 = lerp(1.0, 1.7, ease(seg(tau, T.room, T.tick1 - 0.3))), dk = ease(seg(tau, T.dots, T.dotsB));
	const d = drift(t, 1 - dk), fx = 900, fy = 420;
	const toScreen = (p: [number, number]): [number, number] => [960 + (p[0] - fx) * z1 * lerp(1, 1.5, dk) + d.px, 540 + (p[1] - fy) * z1 * lerp(1, 1.5, dk) + d.py];
	const ticks = [T.tick1, T.tick2, T.tick3], tail = seg(tau, T.dotsB, T.end);
	const finalD = lerp(100, MATCH.d, ease(tail));
	return <g>
		<Cam zoom={z1 * lerp(1, 1.5, dk)} fx={fx} fy={fy} px={d.px} py={d.py} roll={d.roll}><Room t={t} tau={tau} /></Cam>
		<Flash k={(1 - seg(tau, T.room, T.room + 0.3)) * 0.3} col="#ffdca0" />
		<rect width={W} height={H} fill="#07080b" opacity={0.95 * ease(seg(tau, T.dots + 0.3, T.dotsB))} />
		{/* the unlit lamp grid of the 1969 panel fades in around the dots (the match cut) */}
		{tail > 0 && Array.from({length: MATCH.rows * MATCH.cols}, (_, i) => { const r = Math.floor(i / MATCH.cols), c = i % MATCH.cols; if (r === MATCH.row && c >= MATCH.col - 2 && c <= MATCH.col) return null;
			return <circle key={i} cx={MATCH.x + (c - MATCH.col) * finalD} cy={MATCH.y + (r - MATCH.row) * finalD} r={MATCH.r * finalD / MATCH.d} fill="#3a2f1a" opacity={0.6 * ease(seg(tail, 0.2, 1))} />; })}
		{ticks.map((tk, i) => { if (tau < tk) return null; const born = sm(seg(tau, tk, tk + 0.15)), a = toScreen(DOTS_W[i]), b: [number, number] = [MATCH.x + (i - 2) * finalD, MATCH.y];
			const p: [number, number] = [lerp(a[0], b[0], dk), lerp(a[1], b[1], dk)], r = lerp(9 * z1, MATCH.r * finalD / MATCH.d, dk) * born;
			return <g key={i}><Glow x={p[0]} y={p[1]} r={r * 3.2} c={GOLD} o={0.65} id={`mcDot${i}`} /><circle cx={p[0]} cy={p[1]} r={r} fill={mixC(GOLD, '#FFCF6A', dk)} /></g>; })}
	</g>;
};

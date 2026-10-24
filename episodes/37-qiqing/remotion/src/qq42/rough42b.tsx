import React from 'react';
import {W, H, SERIF, SANS, GOLD, rnd, lerp, Glow, Plate, Sky, Blur, Rimmed, fkPose, gaitPose, jointAt, Pose, Look4} from './kit42';
import {mixPose} from './figure42';
import {Room, Tablet} from './frames42';
import {LookCam, PHX, PHY, HandBack, Thumb, Viewer} from './demo42';
import {Harvard, T as DT2} from './demo42b';
/* ep42 rough cut, second half (Builder B): film 79.815–145.124.
   Vienna stairwell → dawn march + her face → stop HIT, Frankl at the window (silence, lead-in, breath) → DROP blaze → flashbulb → Harvard
   → board → bench → coda tablet (sand blows off) → tavern → child's hand → side-hug → dead stop on the hands → match cut to the 3 a.m. phone
   → 什么 → 谁, chat, face-down, FINAL HIT voice note, dawn → through the window → end title → black. t is absolute film seconds. */
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const easeIn = (u: number) => Math.pow(cl(u), 3);
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const easeOutBack = (u: number) => { const x = cl(u), c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerpP = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
type P2 = [number, number];

/* the woman's profile (from frames42 KF08), faces left; local units, about 330 tall */
const FACE_D = 'M0,-150 Q-14,-110 -18,-80 Q-22,-64 -21,-56 Q-30,-40 -44,-22 Q-40,-14 -25,-12 Q-30,-4 -28,2 Q-24,8 -22,9 Q-28,14 -25,20 Q-24,34 -18,42 Q-6,56 10,56 Q14,80 18,150 L118,150 Q104,96 104,60 Q124,-20 112,-80 Q92,-150 40,-162 Q14,-164 0,-150 Z';
const HAIR_D = 'M-8,-146 Q30,-206 110,-160 Q160,-110 138,-20 Q130,40 112,80 Q96,60 92,30 Q100,-40 84,-90 Q50,-140 -8,-120 Z';
const FaceLight: React.FC<{id: string; x: number; y: number; s: number; blur: number; col?: string}> = ({id, x, y, s, blur, col = '#fff6e6'}) => <g>
	<defs><linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity="1" /><stop offset="0.7" stopColor={col} stopOpacity="0.9" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
	<Blur id={`${id}b`} s={blur}><g transform={`translate(${x},${y}) scale(${s})`}><path d={FACE_D} fill={`url(#${id}f)`} /><path d={HAIR_D} fill={`url(#${id}f)`} /><circle cx={124} cy={-128} r={40} fill={col} /></g></Blur>
</g>;

/* ======================= 79.815–84.91 Vienna: the door slams, the family goes down the stairwell ======================= */
const ST = {x0: 1480, y0: 600, n: 15, dx: 78.7, dy: 25};
const ST_X1 = ST.x0 - ST.n * ST.dx, ST_Y1 = ST.y0 + ST.n * ST.dy;
const stairG = (x: number) => (x >= ST.x0 ? ST.y0 : x <= ST_X1 ? ST_Y1 : ST.y0 + ST.dy * ((ST.x0 - x) / ST.dx) + ST.dy * 0.5 * Math.min(1, (ST.x0 - x) / ST.dx));
const STAIR_D = (() => { let d = `M${ST.x0},${ST.y0}`; for (let i = 0; i < ST.n; i++) { const x = ST.x0 - i * ST.dx, y = ST.y0 + (i + 1) * ST.dy; d += ` L${x},${y} L${x - ST.dx},${y}`; } return d + ` L${ST_X1 - 900},${ST_Y1} L${ST_X1 - 900},1500 L${ST.x0 + 900},1500 L${ST.x0 + 900},${ST.y0 + 30} L${ST.x0},${ST.y0 + 30} Z`; })();
type Walker = {look: Look4; h: number; x0: number; ph: number; col: string; old?: boolean};
const WALKERS: Walker[] = [
	{look: {dress: 'coat', head: 'hat'}, h: 290, x0: 1130, ph: 0.1, col: '#0b0c12'},
	{look: {dress: 'dress', head: 'bun'}, h: 272, x0: 1290, ph: 0.55, col: '#0d0e14'},
	{look: {dress: 'coat', head: 'bowler', beard: 'moustache', build: 1.05}, h: 278, x0: 1450, ph: 0.3, col: '#0c0d13', old: true},
	{look: {dress: 'dress', head: 'bob'}, h: 262, x0: 1590, ph: 0.8, col: '#0e0f15', old: true},
];
const bowedP = (u: number): Pose => { const p = gaitPose('08_04', u), nk = p.Neck1, d = (n: string, dx: number, dy: number): [number, number] => [nk[0] + (p[n][0] - nk[0]) * 0.96 + dx, nk[1] + (p[n][1] - nk[1]) * 0.96 + dy];
	return {...p, Head: d('Head', 0.02, -0.006), Top: d('Top', 0.045, -0.012)}; };
const liftedP = (u: number): Pose => { const p = gaitPose('08_04', u), nk = p.Neck1; return {...p, Head: [nk[0] - 0.004, nk[1] + 0.06], Top: [nk[0] - 0.032, nk[1] + 0.124]}; };
const Stair: React.FC<{t: number}> = ({t}) => {
	const tau = t - 79.815, v = 150;
	const dc = Math.min(1, lerp(0.5, 1, easeIn(seg(t, 79.815, 79.97)))), bang = t > 79.97 ? Math.exp(-(t - 79.97) / 0.12) : 0;
	const cam = ease(seg(t, 79.815, 84.91)), z = 1.12 - 0.04 * cam, L: P2 = [lerp(1240, 640, cam), lerp(560, 760, cam)];
	const S: P2 = [960 + 9 * bang * Math.sin((t - 79.97) * 70), 540 + 6 * bang * Math.cos((t - 79.97) * 55)];
	const out = sm(seg(t, 84.3, 84.91));
	return <g>
		<LookCam z={z} L={L} S={S}>
			<Sky id="rbStW" x={-700} y={-300} w={3400} h={1900} stops={[[0, '#262a38'], [0.6, '#181a24'], [1, '#0e0f15']]} />
			{/* the stairwell window, cold street light */}
			<Sky id="rbStWin" x={760} y={210} w={150} h={260} stops={[[0, '#6a7ea6'], [1, '#9fb2d0']]} />
			<path d="M835,210 V470 M760,340 H910" stroke="#0a0b10" strokeWidth={8} /><rect x={760} y={210} width={150} height={260} fill="none" stroke="#0a0b10" strokeWidth={12} />
			<path d="M760,470 L910,470 L760,900 L520,900 Z" fill="#b8c8e4" opacity={0.07} />
			{/* the dado band along the flight */}
			<path d={`M${ST.x0 + 900},${ST.y0 - 120} L${ST.x0},${ST.y0 - 120} L${ST_X1},${ST_Y1 - 120} L${ST_X1 - 900},${ST_Y1 - 120}`} stroke="#1d2030" strokeWidth={46} fill="none" opacity={0.8} />
			{/* the landing door: warm flat light is shut off */}
			<rect x={1640} y={320} width={170} height={290} fill="#0a0a0e" />
			<rect x={1660} y={335} width={140} height={265} fill="#ffbf78" />
			<Glow x={1665 + 140 * (1 - dc) / 2} y={470} r={260} c="#ffb862" o={0.7 * (1 - dc) + 0.15 * bang} id="rbStDoorG" />
			<rect x={1800 - 140 * dc} y={335} width={140 * dc} height={265} fill="#2a1e1c" />
			<rect x={1800 - 140 * dc + 10} y={360} width={Math.max(0, 140 * dc - 20)} height={90} fill="none" stroke="#3a2a26" strokeWidth={3} />
			<rect x={1800 - 140 * dc + 10} y={470} width={Math.max(0, 140 * dc - 20)} height={110} fill="none" stroke="#3a2a26" strokeWidth={3} />
			<circle cx={1800 - 140 * dc + 18} cy={475} r={5} fill="#8a7a60" />
			{t > 79.97 && Array.from({length: 14}, (_, i) => { const d = t - 79.97 - 0.02 * i, x = 1650 + rnd(i, 11) * 170, y = 322 + 240 * d * d + 30 * d * rnd(i, 12);
				return d > 0 && d < 1.4 && <circle key={i} cx={x + 20 * d * (rnd(i, 13) - 0.5)} cy={y} r={1.5 + 2 * rnd(i, 14)} fill="#c8bca8" opacity={0.6 * (1 - d / 1.4)} />; })}
			{/* a weak bulb over the landing */}
			<Glow x={1540} y={250} r={240} c="#ffd9a0" o={0.3} id="rbStBulb" /><circle cx={1540} cy={250} r={8} fill="#ffe8c0" />
			{/* the flight */}
			<path d={STAIR_D} fill="#121319" />
			{Array.from({length: ST.n}, (_, i) => { const x = ST.x0 - i * ST.dx, y = ST.y0 + (i + 1) * ST.dy; return <path key={i} d={`M${x - ST.dx},${y} L${x},${y}`} stroke="#343848" strokeWidth={3} />; })}
			<path d={`M${ST.x0},${ST.y0} L${ST.x0 + 900},${ST.y0}`} stroke="#343848" strokeWidth={3} />
			{/* the street door at the foot: cold dawn light, a lamp post */}
			<rect x={110} y={690} width={200} height={290} fill="#0a0b10" />
			<Sky id="rbStStreet" x={130} y={705} w={160} h={270} stops={[[0, '#7f94bc'], [1, '#c6d2e6']]} />
			<path d="M250,975 L250,780 Q250,760 270,760 L290,760" stroke="#2a3040" strokeWidth={6} fill="none" />
			<Glow x={210} y={840} r={300 + 500 * out} c="#c8d6ee" o={0.45 + 0.5 * out} id="rbStStrG" />
			{/* railing behind the walkers */}
			<path d={`M${ST.x0 + 60},${ST.y0 - 140} L${ST.x0},${ST.y0 - 140} L${ST_X1},${ST_Y1 - 140}`} stroke="#07080c" strokeWidth={10} fill="none" />
			{Array.from({length: ST.n + 1}, (_, i) => { const x = ST.x0 - (i + 0.5) * ST.dx, y = ST.y0 + (i + 1) * ST.dy; return i < ST.n && <path key={i} d={`M${x},${y} L${x},${y - 140}`} stroke="#07080c" strokeWidth={4} />; })}
			{/* the family: a man, his wife, his parents, each with a suitcase */}
			{WALKERS.map((w, i) => { const x = w.x0 - v * tau, g = stairG(x), u = w.ph + tau * v / (0.9759 * w.h) * 0.85, pose = w.old ? bowedP(u) : gaitPose('08_04', u), hand = jointAt(pose, 'RHand', x, g, w.h, true);
				return <g key={i}>
					<Rimmed x={x} ground={g} h={w.h} pose={pose} look={w.look} flip col={w.col} rim="#a8bcdc" rimOp={0.42} />
					<g transform={`translate(${hand[0]},${hand[1]}) rotate(${4 * Math.sin(u * Math.PI * 2)})`}><path d={`M-8,0 Q-8,-10 0,-10 Q8,-10 8,0`} stroke={w.col} strokeWidth={4} fill="none" /><rect x={-0.1 * w.h} y={0} width={0.2 * w.h} height={0.13 * w.h} rx={4} fill={w.col} /><rect x={-0.1 * w.h} y={0} width={0.2 * w.h} height={0.13 * w.h} rx={4} fill="none" stroke="#a8bcdc" strokeOpacity={0.35} strokeWidth={1.5} /></g>
				</g>; })}
		</LookCam>
		<rect width={W} height={H} fill="#d8e2f0" opacity={out} />
	</g>;
};

/* ======================= 84.91–96.231 the dawn march; the stars fade; her face forms in the cloud bank ======================= */
const MCOLS = Array.from({length: 11}, (_, i) => ({x: 1020 - i * 92 - (i ? 50 : 0) - 26 * rnd(i, 4), g: 912 - i * 13 + 8 * rnd(i, 5), h: 470 * (1 - i * 0.055) * (0.94 + 0.08 * rnd(i, 6))}));
const March: React.FC<{t: number}> = ({t}) => {
	const tau = t - 84.91, s = t - 95.664, T0 = 0.567, sc = Math.min(Math.max(s, 0), T0);
	const pt = s < 0 ? t : 95.664 + sc * (1 - 0.85 * sc / (2 * T0)) + Math.max(0, s - T0) * 0.15;   // the walk slows on the stop bar
	const walk = (pt - 84.91) / 1.325, lift = sm(seg(t, 86.2, 87.2));
	const bright = sm(seg(t, 89.6, 93.4)) * (1 - 0.35 * seg(t, 95.664, 96.231));
	const face = 0.8 * sm(seg(t, 90.3, 93.2)) * (1 - 0.35 * seg(t, 95.664, 96.231)), stars = 1 - sm(seg(t, 85.6, 91.8));
	const cam = ease(seg(t, 84.91, 96.231)), z = lerp(1.04, 1.13, cam), L: P2 = [lerp(940, 1000, cam), lerp(540, 505, cam)];
	const scroll = (pt - 84.91) * 300;
	return <g>
		<LookCam z={z} L={L} S={[960, 540]}>
			<Plate k="field" />
			{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 21) * 1920} cy={20 + rnd(i, 22) * 400} r={1 + 1.8 * rnd(i, 23)} fill="#f4f6ff" opacity={stars * (0.4 + 0.5 * rnd(i, 24)) * (0.7 + 0.3 * Math.sin(t * (2 + 3 * rnd(i, 25)) + i))} />)}
			<defs><linearGradient id="rbFrWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6c8" stopOpacity="0.0" /><stop offset="0.55" stopColor="#ffe0c0" stopOpacity="0.9" /><stop offset="0.7" stopColor="#ffd0a0" stopOpacity="0" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#rbFrWarm)" opacity={0.35 * bright} />
			<Glow x={1380} y={600} r={560} c="#ffc89a" o={0.4 + 0.35 * bright} id="rbFrSun" />
			{face > 0 && <g opacity={face} transform={`translate(1400,360) scale(${lerp(0.95, 1.03, seg(t, 90.3, 96.2))}) translate(-1400,-360)`}>
				<Glow x={1380} y={330} r={380} c="#fff0d0" o={0.45} id="rbFrFaceG" />
				<FaceLight id="rbFrFace" x={1400} y={380} s={1.55} blur={8} />
			</g>}
			{/* footprints and tufts slide by: the column is walking */}
			{Array.from({length: 46}, (_, i) => { const y = 790 + rnd(i, 31) * 270, k = 0.55 + 0.45 * (y - 790) / 270, x = (((rnd(i, 32) * 2400 - scroll * k) % 2400) + 2400) % 2400 - 240;
				return rnd(i, 33) < 0.6 ? <ellipse key={i} cx={x} cy={y} rx={12 * k} ry={4 * k} fill="#5a6278" opacity={0.35} /> : <path key={i} d={`M${x - 6},${y} l-4,-14 M${x},${y} l1,-18 M${x + 6},${y} l5,-12`} stroke="#3a4054" strokeWidth={2} opacity={0.5} />; })}
			{MCOLS.slice().reverse().map((c, k) => { const i = MCOLS.length - 1 - k, u = walk + i * 0.31 + 0.5 * rnd(i, 9), pose = i === 0 ? mixPose(bowedP(u), liftedP(u), lift) : bowedP(u);
				return <Rimmed key={i} x={c.x + 30 * tau / 11} ground={c.g} h={c.h} pose={pose} look={{dress: 'coat', head: 'cap'}} col={i === 0 ? '#0c0c14' : '#141620'} rim="#ffd0b0" rimOp={i === 0 ? 0.3 + 0.4 * lift : 0.25} rimDx={2.2} rimDy={-1.8} />; })}
		</LookCam>
		<rect width={W} height={H} fill="#d8e2f0" opacity={1 - sm(seg(t, 84.91, 85.45))} />
	</g>;
};

/* ======================= 96.231–107.3 spring 1945: Frankl at the window (silence, lead-in, breath, DROP blaze) ======================= */
const WIN = {x: 520, y: 130, w: 340, h: 600};
const WindowShot: React.FC<{t: number}> = ({t}) => {
	const grow = sm(seg(t, 97.93, 105.6)), br = Math.sin(Math.PI * seg(t, 105.855, 106.987)), blaze = easeIn(seg(t, 106.987, 107.3));
	const Lt = (0.4 + 0.5 * grow) * (1 - 0.35 * br) + 1.6 * blaze;
	const lift = sm(seg(t, 98.1, 100.8)), breathe = Math.sin((t - 96.231) * 2 * Math.PI / 3.4);
	const pose = fkPose({hip: 0.655, lean: lerp(7, -1, lift) + 1.0 * breathe - 2.5 * br, neck: lerp(28, -12, lift) - 3 * br, lt: 2, lk: 2, rt: -3, rk: 3, la: lerp(-2, 3, lift), le: 12, ra: 4, re: 14});
	const cam0 = seg(t, 96.231, 106.987), push = easeIn(seg(t, 106.987, 107.3));
	const z = lerp(1.02, 1.1, cam0) * lerp(1, 1.7, push), L: P2 = [lerp(lerp(960, 900, cam0), WIN.x + WIN.w / 2, push), lerp(540, WIN.y + WIN.h / 2, push)];
	const shrink = 1 - 0.14 * br, cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2;
	const shaftL = (y: number) => lerp(WIN.x + 20, 820, (y - WIN.y) / (1080 - WIN.y)), shaftR = (y: number) => lerp(WIN.x + WIN.w, 1780, (y - WIN.y) / (1080 - WIN.y));
	const tag = cl(Math.min((t - 101.891) / 0.4, (105.491 - t) / 0.4));
	return <g>
		<LookCam z={z} L={L} S={[960, 540]}>
			<Sky id="rbWnWall" x={-200} y={-200} w={2400} h={1500} stops={[[0, '#1c1f27'], [1, '#0f1015']]} />
			<defs><clipPath id="rbWnC"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} /></clipPath>
				<linearGradient id="rbWnShaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6e2" stopOpacity="0.55" /><stop offset="1" stopColor="#fff6e2" stopOpacity="0" /></linearGradient></defs>
			{/* outside: a pale spring morning, a blossoming branch */}
			<g clipPath="url(#rbWnC)">
				<Sky id="rbWnSky" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} stops={[[0, '#a8bad0'], [0.6, '#dde2e8'], [1, '#f4e4c6']]} />
				<g transform={`rotate(${1.5 * Math.sin(t * 0.8)} ${WIN.x + WIN.w + 20} ${WIN.y + 90})`}>
					<path d={`M${WIN.x + WIN.w + 30},${WIN.y + 90} Q${WIN.x + 200},${WIN.y + 120} ${WIN.x + 40},${WIN.y + 230} M${WIN.x + 210},${WIN.y + 118} Q${WIN.x + 160},${WIN.y + 60} ${WIN.x + 120},${WIN.y + 40}`} stroke="#3a3038" strokeWidth={6} fill="none" />
					{Array.from({length: 26}, (_, i) => <circle key={i} cx={WIN.x + 40 + rnd(i, 51) * 300} cy={WIN.y + 40 + rnd(i, 52) * 190} r={4 + 5 * rnd(i, 53)} fill="#f0d0d6" opacity={0.85} />)}
				</g>
				<rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#fffaf0" opacity={cl(0.1 + 0.35 * Lt)} />
			</g>
			<path d={`M${cx},${WIN.y} V${WIN.y + WIN.h} M${WIN.x},${WIN.y + 260} H${WIN.x + WIN.w}`} stroke="#0d0e12" strokeWidth={14} />
			<rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="none" stroke="#0d0e12" strokeWidth={22} />
			<rect x={WIN.x - 30} y={WIN.y + WIN.h + 8} width={WIN.w + 60} height={18} fill="#24252e" />
			<Glow x={cx} y={cy} r={(420 + 200 * Math.min(1, Lt)) * shrink} c="#fff0d6" o={0.25 * Math.min(1.6, Lt)} id="rbWnG" />
			{/* the light falling across the room; it draws in on the breath */}
			<g transform={`translate(${cx},${WIN.y}) scale(${shrink},1) translate(${-cx},${-WIN.y})`} opacity={Math.min(1, 0.35 + 0.6 * Lt)}>
				<path d={`M${WIN.x + 20},${WIN.y} L${WIN.x + WIN.w},${WIN.y} L1780,1080 L820,1080 Z`} fill="url(#rbWnShaft)" />
			</g>
			<rect x={-200} y={950} width={2400} height={300} fill="#0d0d12" />
			<ellipse cx={1300} cy={1000} rx={480 * shrink} ry={60} fill="#fff0d6" opacity={0.12 * Math.min(1.5, Lt)} />
			{/* dust in the light */}
			{Array.from({length: 48}, (_, i) => { const y = WIN.y + 40 + ((rnd(i, 61) * 860 + (t - 96) * (6 + 10 * rnd(i, 62))) % 860), x = lerp(shaftL(y), shaftR(y), 0.1 + 0.8 * rnd(i, 63)) + 14 * Math.sin(t * 0.4 + i);
				return <circle key={i} cx={x} cy={y} r={1.2 + 2 * rnd(i, 64)} fill="#fff4dc" opacity={Math.min(1, Lt) * (0.25 + 0.45 * rnd(i, 65)) * (0.6 + 0.4 * Math.sin(t * (1 + rnd(i, 66) * 2) + i))} />; })}
			{/* Frankl, alone, facing the window */}
			<Rimmed x={1160} ground={958} h={640} pose={pose} look={{dress: 'jacket', head: 'short', build: 0.92}} flip col="#0c0c11" rim="#fff2dc" rimOp={0.25 + 0.35 * Math.min(1, Lt)} />
		</LookCam>
		{tag > 0 && <text x={W - 120} y={900} textAnchor="end" style={{fontFamily: SERIF, fontSize: 44, fontWeight: 700, letterSpacing: '0.06em'}} fill="#f4ead2" opacity={0.9 * tag} stroke="rgba(0,0,0,0.5)" strokeWidth={4} paintOrder="stroke">——弗兰克尔</text>}
		<Glow x={960} y={540} r={1100} c="#fff6e6" o={0.9 * blaze} id="rbWnBlz" />
		<rect width={W} height={H} fill="#fffaf2" opacity={blaze} />
	</g>;
};
/* 107.3–107.8 her face fills the sky, brighter than the sunrise below it */
const FaceSky: React.FC<{t: number}> = ({t}) => {
	const z = lerp(1.0, 1.06, seg(t, 107.2, 107.85));
	return <g transform={`translate(960,540) scale(${z}) translate(-960,-540)`}>
		<Sky id="rbFsSky" stops={[[0, '#30406e'], [0.5, '#8a8fb8'], [0.82, '#f2c6a0'], [1, '#f8d8b0']]} />
		<Glow x={960} y={1010} r={760} c="#ffb070" o={0.55} id="rbFsSun" />
		<path d="M0,950 Q480,930 960,945 Q1440,960 1920,940 L1920,1080 L0,1080 Z" fill="#3a3a52" />
		<Glow x={980} y={470} r={780} c="#fff4e0" o={0.85} id="rbFsFaceG" />
		<FaceLight id="rbFsFace" x={900} y={560} s={2.7} blur={10} col="#fffbf2" />
	</g>;
};

/* ======================= 112.4–115.05 the board: everything dims except 人际关系 → 快乐 · 健康 ======================= */
const CARDS: [string, number, number, number][] = [['胆固醇', 520, 330, -3], ['收入', 800, 300, 2], ['名气', 1080, 335, -2], ['学历', 540, 570, 2], ['人际关系', 820, 590, -1.5], ['运动', 1090, 565, 3]];
const Board: React.FC<{t: number}> = ({t}) => {
	const dim = sm(seg(t, 113.0, 113.6)), lit = sm(seg(t, 113.1, 113.6)), line = ease(seg(t, 113.6, 114.25)), goal = sm(seg(t, 114.15, 114.5));
	const u = seg(t, 112.4, 115.2), z = lerp(1.0, 1.08, u), L: P2 = [lerp(930, 1010, u), lerp(520, 500, u)];
	return <LookCam z={z} L={L} S={[960, 540]}>
		<Sky id="rbBdWall" x={-200} y={-200} w={2400} h={1500} stops={[[0, '#2e2016'], [1, '#110b07']]} />
		<Glow x={900} y={160} r={900} c="#ffcf8a" o={0.25} id="rbBdLamp" />
		<rect x={340} y={170} width={1340} height={680} fill="#6a4a30" stroke="#24160c" strokeWidth={20} />
		{Array.from({length: 60}, (_, i) => <circle key={i} cx={360 + rnd(i, 71) * 1300} cy={190 + rnd(i, 72) * 640} r={2 + 3 * rnd(i, 73)} fill="#4a3220" opacity={0.5} />)}
		{CARDS.map(([s, x, y, r], i) => { const key = s === '人际关系', w = key ? 270 : 230, op = key ? 1 : 1 - 0.7 * dim;
			return <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${key ? 1 + 0.06 * lit : 1})`} opacity={op}>
				{key && <Glow x={0} y={0} r={300} c="#ffcf6a" o={0.6 * lit} id="rbBdKeyG" />}
				<rect x={-w / 2 + 6} y={-52} width={w} height={112} fill="#000" opacity={0.3} />
				<rect x={-w / 2} y={-58} width={w} height={112} fill={key ? lerp(0, 1, lit) > 0.5 ? '#fff4d6' : '#efe6d0' : '#e6dcc4'} stroke={key ? GOLD : 'none'} strokeWidth={5 * lit} />
				<circle cx={0} cy={-44} r={8} fill="#c0392b" />
				<text x={0} y={16} textAnchor="middle" style={{fontFamily: SANS, fontSize: key ? 44 : 40, fontWeight: 700}} fill={key ? '#5a3406' : '#3a3024'}>{s}</text>
			</g>; })}
		<path d="M955,600 Q1180,700 1300,470" stroke={GOLD} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} opacity={line > 0 ? 1 : 0} />
		<g transform={`translate(1430,440) rotate(2) scale(${1 + 0.08 * Math.sin(Math.PI * goal)})`} opacity={0.45 + 0.55 * goal}>
			<Glow x={0} y={0} r={320} c="#ffd27a" o={0.6 * goal} id="rbBdGoalG" />
			<rect x={-150} y={-62} width={300} height={124} fill={goal > 0.5 ? '#fff4d6' : '#d8ceb6'} stroke={GOLD} strokeWidth={5 * goal} />
			<circle cx={0} cy={-48} r={8} fill="#c0392b" />
			<text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 44, fontWeight: 900}} fill="#5a3406">快乐 · 健康</text>
		</g>
	</LookCam>;
};

/* ======================= 114.75–116.35 two old friends laughing on a bench; an old couple holding hands ======================= */
const Bench: React.FC<{t: number}> = ({t}) => {
	const u = ease(seg(t, 114.7, 116.35)), z = lerp(1.04, 1.18, u), L: P2 = [lerp(820, 1180, u), lerp(560, 640, u)];
	const g = 990, hS = 430, lA = Math.abs(Math.sin((t - 114.7) * 7.5)), lB = Math.abs(Math.sin((t - 114.7) * 7.5 + 1.2));
	const sitA = fkPose({hip: 0.37, lean: -4 - 7 * lA, neck: -10 - 12 * lA, lt: 84, lk: 88, rt: 80, rk: 84, la: 34, le: 56, ra: 30, re: 60});
	const sitB = fkPose({hip: 0.37, lean: 4 - 6 * lB, neck: -4 - 12 * lB, lt: 84, lk: 88, rt: 80, rk: 84, la: 30, le: 60, ra: 36, re: 56});
	const sway = Math.sin(t * 1.3), mx = 1330, mh = 520, wh = 490;
	const manP = fkPose({hip: 0.655, lean: 3 + 0.6 * sway, neck: 4, lt: 2, lk: 2, rt: -3, rk: 3, la: 6, le: 10, ra: -22, re: 6});
	const wifeP = fkPose({hip: 0.655, lean: 2 - 0.6 * sway, neck: -2, lt: 2, lk: 2, rt: -3, rk: 3, la: 26, le: 6, ra: -4, re: 10});
	const mHand = jointAt(manP, 'RHand', mx, g, mh, true), wRel = jointAt(wifeP, 'LHand', 0, g, wh, true), wx = mHand[0] - wRel[0] + 4, wHand = jointAt(wifeP, 'LHand', wx, g, wh, true);
	const seat = g - 0.37 * hS + 6;
	return <LookCam z={z} L={L} S={[960, 540]}>
		<Sky id="rbBnSky" x={-200} y={-200} w={2400} h={1500} stops={[[0, '#5a4a6a'], [0.45, '#d08a6a'], [0.62, '#f2b880'], [0.75, '#6a4a48'], [1, '#2a1e1c']]} />
		<Glow x={1500} y={640} r={600} c="#ffd08a" o={0.5} id="rbBnSun" />
		{Array.from({length: 14}, (_, i) => <ellipse key={i} cx={-100 + i * 170 + 40 * rnd(i, 81)} cy={720 + 30 * rnd(i, 82)} rx={110 + 60 * rnd(i, 83)} ry={70 + 30 * rnd(i, 84)} fill="#3a2830" opacity={0.9} />)}
		<rect x={-200} y={760} width={2400} height={600} fill="#3a2a26" />
		<path d="M-200,880 Q900,860 2200,900" stroke="#5a4236" strokeWidth={50} fill="none" opacity={0.6} />
		{/* the bench */}
		<rect x={400} y={seat} width={540} height={18} rx={4} fill="#1a1210" /><rect x={410} y={seat - 120} width={520} height={14} fill="#1a1210" /><rect x={410} y={seat - 80} width={520} height={14} fill="#1a1210" />
		{[430, 900].map((x) => <rect key={x} x={x} y={seat - 130} width={14} height={g - seat + 130} fill="#1a1210" />)}
		<Rimmed x={520} ground={g} h={hS} pose={sitA} look={{dress: 'jacket', head: 'baldf'}} col="#120c0c" rim="#ffd8a8" rimOp={0.5} />
		<Rimmed x={840} ground={g} h={hS} pose={sitB} look={{dress: 'coat', head: 'cap', beard: 'full'}} flip col="#140e0e" rim="#ffd8a8" rimOp={0.5} />
		{/* the old couple, hand in hand */}
		<Rimmed x={wx} ground={g} h={wh} pose={wifeP} look={{dress: 'dress', head: 'bun'}} flip col="#160f0f" rim="#ffd2a0" rimOp={0.5} rimDx={2.2} />
		<Rimmed x={mx} ground={g} h={mh} pose={manP} look={{dress: 'jacket', head: 'baldf'}} flip col="#110c0c" rim="#ffd8a8" rimOp={0.55} rimDx={2.2} />
		<circle cx={(mHand[0] + wHand[0]) / 2} cy={(mHand[1] + wHand[1]) / 2 + 6} r={14} fill="#130d0d" />
	</LookCam>;
};

/* ======================= 116.043–118.8 the coda: wind lifts the sand off the tablet ======================= */
const CodaTablet: React.FC<{t: number}> = ({t}) => {
	const u = seg(t, 116.043, 118.8), z = lerp(1.0, 1.1, ease(u)), L: P2 = [lerp(960, 940, u), lerp(530, 560, u)];
	const film = 0.6 * (1 - sm(seg(t, 117.3, 118.2))), sweep = seg(t, 117.9, 118.7);
	const gust = (i: number, s: number) => Math.max(0, t - (117.16 + 0.75 * rnd(i, s)));
	return <g>
		<rect width={W} height={H} fill="#070403" />
		<LookCam z={z} L={L} S={[960, 540]}>
			<Glow x={960} y={520} r={820} c="#ff9e4a" o={0.32} id="rbCtW" />
			<Tablet x={560} y={150} w={800} h={760} seed={5} rows={14} glowRow={7} />
			<rect x={540} y={130} width={840} height={800} fill="#9c7a48" opacity={film} clipPath="url(#tb5c)" />
			<Blur id="rbCtSandB" s={6}>{Array.from({length: 22}, (_, i) => { const d = gust(i, 41), x = 600 + rnd(i, 42) * 700 + 900 * d * d * (0.6 + rnd(i, 43)) + 60 * d, y = 190 + rnd(i, 44) * 680 - 50 * d, o = 0.75 * (1 - cl(d / 1.1));
				return o > 0 && <ellipse key={i} cx={x} cy={y} rx={70 + 60 * rnd(i, 45)} ry={26 + 22 * rnd(i, 46)} fill="#a9844f" opacity={o} />; })}</Blur>
			{Array.from({length: 240}, (_, i) => { const d = gust(i, 47), x = 580 + rnd(i, 48) * 760 + 1400 * d * d * (0.5 + rnd(i, 49)) + 120 * d + (d === 0 ? 1.5 * Math.sin(t * 9 + i) : 0), y = 170 + rnd(i, 50) * 720 - 80 * d * rnd(i, 51), o = 0.85 * (1 - cl(d / 1.6));
				return o > 0 && <circle key={i} cx={x} cy={y} r={1.2 + 2 * rnd(i, 52)} fill={rnd(i, 53) > 0.5 ? '#d2b07a' : '#a8844e'} opacity={o} />; })}
			<Glow x={lerp(610, 940, sweep)} y={150 + 36 + 7 * (700 / 14)} r={100} c="#ffe2a0" o={sweep > 0 && sweep < 1 ? 0.6 : 0} id="rbCtSw" />
		</LookCam>
		<rect width={W} height={H} fill="#000" opacity={1 - sm(seg(t, 116.043, 116.4))} />
	</g>;
};

/* ======================= 118.25–120.45 the ale-wife at her lit door, Gilgamesh again ======================= */
const Tavern: React.FC<{t: number}> = ({t}) => {
	const u = seg(t, 118.2, 120.5), z = lerp(1.03, 1.1, ease(u)), L: P2 = [lerp(1000, 1080, u), lerp(560, 600, u)];
	const g = 912, gh = 600, ax = 1420, ah = 540, gx = 700 + 40 * u, gest = 0.5 - 0.5 * Math.cos((t - 118.2) * 2.6), fl = 0.06 * Math.sin(t * 13) + 0.04 * Math.sin(t * 7.3);
	const listen = fkPose({hip: 0.65, lean: 6 + 1.2 * Math.sin(t * 1.5), neck: 6, lt: 14, lk: 10, rt: -14, rk: 12, la: 18, le: 40, ra: -8, re: 20});
	const speak = fkPose({hip: 0.65, lean: 4, neck: 2 - 4 * gest, lt: 3, lk: 4, rt: -4, rk: 4, la: 34, le: 70, ra: lerp(55, 85, gest), re: lerp(20, 0, gest)});
	const jug = jointAt(speak, 'LHand', ax, g, ah, true);
	return <LookCam z={z} L={L} S={[960, 540]}>
		<Plate k="sea" />
		<path d="M0,830 Q700,812 1920,840 L1920,1080 L0,1080 Z" fill="#3a2a30" opacity={0.6} />
		<Glow x={1440} y={760} r={420} c="#ffae5a" o={0.4 + fl} id="rbTvG" />
		<path d="M1180,912 L1180,470 L1230,470 L1230,452 L1300,452 L1300,470 L1560,470 L1560,452 L1630,452 L1630,470 L1720,470 L1720,912 Z" fill="#2a1d1c" />
		{[1210, 1265, 1600, 1660].map((xx) => <rect key={xx} x={xx} y={500} width={14} height={412} fill="#1f1514" />)}
		{Array.from({length: 14}, (_, i) => <rect key={i} x={1180} y={490 + i * 30} width={540} height={2} fill="#3a2a26" opacity={0.6} />)}
		<rect x={1180} y={462} width={540} height={10} fill="#3a2826" />
		<rect x={1350} y={672} width={140} height={240} fill="#ffb862" /><rect x={1340} y={662} width={160} height={14} fill="#1a1110" />
		<Glow x={1420} y={760} r={150} c="#fff0c8" o={0.6 + fl} id="rbTvD" />
		<rect x={1620} y={560} width={40} height={30} fill="#ffb862" opacity={0.85} />
		<g transform="translate(1540,912)"><path d="M-26,0 Q-40,-50 -18,-84 L18,-84 Q40,-50 26,0 Z" fill="#1d1414" /><rect x={-14} y={-96} width={28} height={14} fill="#1d1414" /></g>
		<Rimmed x={ax} ground={g} h={ah} pose={speak} look={{dress: 'dress', head: 'bun'}} flip col="#100b0e" rim="#ffc27a" rimOp={0.6} rimDx={2.2} />
		<g transform={`translate(${jug[0] - 6},${jug[1] + 10})`}><path d="M-20,0 Q-28,40 -14,64 L14,64 Q28,40 20,0 Z" fill="#100b0e" /><path d="M18,10 Q36,18 22,40" stroke="#100b0e" strokeWidth={6} fill="none" /></g>
		<Rimmed x={gx} ground={g} h={gh} pose={listen} look={{dress: 'pelt', head: 'meso', beard: 'square', build: 1.08}} col="#0c090e" rim="#ffb27a" rimOp={0.5} rimDx={2.2} />
	</LookCam>;
};

/* ======================= 120.15–123.8 and 127.031–129.26 the child's hand slips into the big hand ======================= */
const AdultArm: React.FC<{c: string; close: number}> = ({c, close}) => <g strokeLinecap="round"><path d="M2010,380 L1530,590" stroke={c} strokeWidth={118} fill="none" /><path d="M1590,560 L1540,584" stroke={c} strokeWidth={136} />
	<ellipse cx={1440} cy={652} rx={104} ry={58} fill={c} transform="rotate(32 1440 652)" /><path d="M1492,606 L1420,592" stroke={c} strokeWidth={30} fill="none" transform={`rotate(${-30 * close} 1492 606)`} /></g>;
const ChildArm: React.FC<{c: string}> = ({c}) => <g strokeLinecap="round"><path d="M1040,1140 L1296,738" stroke={c} strokeWidth={62} fill="none" /><path d="M1268,780 L1290,746" stroke={c} strokeWidth={74} />
	<ellipse cx={1336} cy={690} rx={52} ry={33} fill={c} transform="rotate(-48 1336 690)" /><path d="M1352,652 Q1392,622 1416,652" stroke={c} strokeWidth={20} fill="none" /><path d="M1370,672 Q1404,652 1424,680" stroke={c} strokeWidth={18} fill="none" /></g>;
const Hands: React.FC<{t: number; hold?: boolean}> = ({t, hold}) => {
	const off = hold ? 0 : 1 - easeOut(seg(t, 120.45, 121.9)), close = hold ? 1 : sm(seg(t, 121.7, 122.4)), touch = hold ? 1 : sm(seg(t, 121.8, 122.3));
	const u = hold ? seg(t, 127.031, 129.3) : seg(t, 120.2, 123.8), z = hold ? lerp(1.22, 1.3, u) : lerp(1.0, 1.12, ease(u)), L: P2 = hold ? [lerp(1330, 1360, u), lerp(660, 670, u)] : [lerp(960, 1120, ease(u)), lerp(540, 600, ease(u))];
	const bob = 3 * Math.sin(t * 1.7);
	return <g>
		<Sky id="rbHdBg" stops={[[0, '#120a06'], [1, '#2a160a']]} />
		<LookCam z={z} L={L} S={[960, 540]}>
			<Glow x={640} y={480} r={760} c="#ff9e4a" o={0.32} id="rbHdWarm" />
			<g transform="rotate(-4 620 480)" opacity={0.85}><Tablet x={240} y={110} w={760} h={720} seed={5} rows={14} glowRow={7} /></g>
			<Glow x={1400} y={660} r={420} c="#ffc87a" o={0.22 + 0.18 * touch * (0.85 + 0.15 * Math.sin(t * 2.2))} id="rbHdHandG" />
			<g transform={`translate(0,${bob})`}><g opacity={0.65} transform="translate(-5,-3)"><AdultArm c="#ffcf8a" close={close} /></g><AdultArm c="#0c0806" close={close} /></g>
			<g transform={`translate(${-150 * off},${240 * off - bob * 0.6})`}><g opacity={0.8} transform="translate(-4,-3)"><ChildArm c="#ffd8a0" /></g><ChildArm c="#1a100b" /></g>
			{Array.from({length: 20}, (_, i) => <circle key={i} cx={900 + rnd(i, 91) * 900 + 20 * Math.sin(t * 0.5 + i)} cy={300 + ((rnd(i, 92) * 600 - t * 10 * (0.5 + rnd(i, 93))) % 600 + 600) % 600} r={1.5 + 2 * rnd(i, 94)} fill="#ffe2b0" opacity={0.3 + 0.3 * Math.sin(t * 2 + i)} />)}
		</LookCam>
	</g>;
};

/* ======================= 123.5–127.031 a couple's side-hug in the lamplight ======================= */
const Hug: React.FC<{t: number}> = ({t}) => {
	const u = seg(t, 123.5, 127.1), z = lerp(1.05, 1.14, ease(u)), L: P2 = [lerp(960, 920, u), lerp(560, 530, u)];
	const k = sm(seg(t, 123.85, 124.8)), lean = sm(seg(t, 124.4, 125.4)), sway = Math.sin(t * 1.1), fl = 0.05 * Math.sin(t * 11) + 0.04 * Math.sin(t * 6.7);
	const g = 960, mx = 800, mh = 640, wx = 925, wh = 590;
	const manP = fkPose({hip: 0.655, lean: 2 + 0.6 * sway, neck: lerp(2, 10, lean), lt: 2, lk: 2, rt: -3, rk: 3, la: -6, le: 8, ra: -4, re: 10});
	const wifeP = fkPose({hip: 0.655, lean: lerp(2, -7, lean) + 0.5 * sway, neck: lerp(2, -14, lean), lt: 2, lk: 2, rt: -3, rk: 3, la: 10, le: 40, ra: 6, re: 50});
	const sh = jointAt(manP, 'LSh', mx, g, mh), tgt = jointAt(wifeP, 'LSh', wx, g, wh);
	const rest: P2 = [sh[0] + 6, sh[1] + 0.3 * mh], hand: P2 = lerpP(rest, [tgt[0] + 24, tgt[1] + 6], k);
	const elbow: P2 = lerpP([sh[0] + 4, sh[1] + 0.17 * mh], [(sh[0] + hand[0]) / 2 - 6, Math.max(sh[1], hand[1]) + 0.08 * mh], k);
	const arm = `M${sh[0]},${sh[1] + 6} L${elbow[0]},${elbow[1]} L${hand[0]},${hand[1]}`;
	return <LookCam z={z} L={L} S={[960, 540]}>
		<Sky id="rbHgWall" x={-200} y={-200} w={2400} h={1500} stops={[[0, '#2c1a10'], [1, '#120a06']]} />
		{Array.from({length: 24}, (_, r) => <rect key={r} x={-200} y={-100 + r * 46} width={2400} height={2} fill="#3a2414" opacity={0.5} />)}
		<path d="M1300,700 L1300,470 Q1300,400 1380,400 Q1460,400 1460,470 L1460,700 Z" fill="#1a0e08" />
		<Glow x={1300} y={560} r={900} c="#ffb862" o={0.6 + fl} id="rbHgLamp" />
		<g transform="translate(1380,640)"><ellipse cx={0} cy={0} rx={44} ry={16} fill="#5a3a24" /><path d="M30,-4 L60,-12 L56,0 Z" fill="#5a3a24" />
			<g transform={`translate(58,-14) scale(${1 + 2 * fl},${1 + 3 * fl})`}><path d="M0,0 Q-9,-12 0,-34 Q9,-12 0,0 Z" fill="#ffe0a0" /></g><Glow x={58} y={-28} r={60} c="#fff0c8" o={0.9} id="rbHgFl" /></g>
		<rect x={-200} y={g} width={2400} height={400} fill="#1a100a" />
		<Rimmed x={mx} ground={g} h={mh} pose={manP} look={{dress: 'tunic', head: 'short', beard: 'full'}} col="#100a08" rim="#ffc890" rimOp={0.75} rimDx={2.6} />
		<Rimmed x={wx} ground={g} h={wh} pose={wifeP} look={{dress: 'dress', head: 'bun'}} col="#1a110c" rim="#ffd8a8" rimOp={0.8} rimDx={2.6} />
		<path d={arm} stroke="#ffc890" strokeWidth={0.05 * mh} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} transform="translate(3,-2)" />
		<path d={arm} stroke="#100a08" strokeWidth={0.05 * mh} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</LookCam>;
};

/* ======================= 128.706–141.8 today: the 3 a.m. phone; 什么 → 谁; the chat; face-down; the voice note; dawn ======================= */
const PW = 380, PH = 780, PROT = -4, SX = PHX - PW / 2 + 14, SY = PHY - PH / 2 + 14, SW = PW - 28, SHH = PH - 28, KW = (SW - 20) / 10;
const keyPos = (r: number, k: number, n: number): P2 => [SX + 10 + (10 - n) * KW / 2 + k * KW + KW / 2, SY + SHH - 312 + r * 66 + 27];
const BKSP: P2 = [SX + SW - 32, SY + SHH - 312 + 2 * 66 + 27], SEARCHK: P2 = [SX + SW - 62, SY + SHH - 87], CAND: P2 = [SX + 44, SY + SHH - 352];
const THUMB_K: [number, P2][] = [[128.7, [SX + SW - 90, SY + SHH - 150]], [131.7, [SX + SW - 120, SY + 200]], [132.12, [SX + 70 + 10 * 22, SY + 112]],
	[132.45, BKSP], [132.62, BKSP], [132.88, BKSP], [133.05, keyPos(1, 1, 9)], [133.13, keyPos(1, 5, 9)], [133.21, keyPos(0, 6, 10)], [133.29, keyPos(0, 7, 10)], [133.52, CAND],
	[134.15, [SEARCHK[0], SEARCHK[1] - 50]], [134.6, [SEARCHK[0] - 8, SEARCHK[1] - 56]], [134.85, [SX + SW - 110, SY + SHH - 230]], [135.12, [PHX, SY + SHH - 20]],
	[135.62, [SX + 150, SY + 196]], [135.98, [SX + 150, SY + SHH - 60]], [136.55, [SX + SW - 46, SY + SHH - 60]], [137.0, [SX + SW - 90, SY + SHH - 150]]];
const TAPS = [132.12, 132.62, 132.88, 133.05, 133.13, 133.21, 133.29, 133.52, 135.12, 135.62, 135.98, 136.55];
const thumbB = (t: number): {p: P2; press: number} => {
	let i = 0; while (i < THUMB_K.length - 1 && t >= THUMB_K[i + 1][0]) i++;
	const [t0, p0] = THUMB_K[i], [t1, p1] = THUMB_K[Math.min(THUMB_K.length - 1, i + 1)], m = Math.min(Math.max(0.01, t1 - t0), 0.3), u = i === THUMB_K.length - 1 ? 1 : ease(cl((t - (t1 - m)) / m));   // arrive on the tap
	const press = Math.max(0, ...TAPS.map((tp) => 1 - Math.abs(t - tp) / 0.07)), p = lerpP(p0, p1, u);
	return {p: [p[0], p[1] - (1 - press) * 10], press};
};
const BASE_Q = '人活着，到底为了';
const SearchScreen: React.FC<{t: number; th: {p: P2; press: number}}> = ({t, th}) => {
	const mid = t < 132.62 ? '什么' : t < 132.88 ? '什' : t < 133.05 ? '' : t < 133.13 ? 's' : t < 133.21 ? 'sh' : t < 133.29 ? 'shu' : t < 133.52 ? 'shui' : '谁';
	const latin = /^[a-z]+$/.test(mid), mw = latin ? mid.length * 12 : mid.length * 22, active = t > 132.1;
	const kb = sm(seg(t, 132.18, 132.4)) * (1 - sm(seg(t, 134.85, 135.1))), blink = Math.floor(t * 2.2) % 2 === 0 || (t > 132.1 && t < 133.8);
	return <g>
		{[0, 1, 2, 3, 4].map((i) => <g key={i}><circle cx={SX + 46} cy={SY + 186 + i * 52} r={7} fill="none" stroke="#5a6a80" strokeWidth={2.5} /><rect x={SX + 70} y={SY + 180 + i * 52} width={[190, 230, 150, 210, 170][i]} height={12} rx={6} fill="#3a4658" /></g>)}
		{kb > 0 && <g transform={`translate(0,${(1 - kb) * 380})`}>
			{latin && <g><rect x={SX} y={SY + SHH - 376} width={SW} height={46} fill="#222a36" />{['谁', '水', '睡', '说', '岁'].map((c, i) => <text key={i} x={SX + 44 + i * 64} y={SY + SHH - 344} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22, fontWeight: i ? 400 : 700}} fill={i ? '#c8d2e0' : GOLD}>{c}</text>)}</g>}
			<rect x={SX} y={SY + SHH - 330} width={SW} height={330} fill="#1a212c" />
			{[10, 9, 7].map((n, r) => Array.from({length: n}, (_, k) => { const [x, y] = keyPos(r, k, n), lit = th.press > 0.3 && Math.abs(th.p[0] - x) < KW / 2 && Math.abs(th.p[1] + 10 - y) < 36;
				return <rect key={`${r}_${k}`} x={x - KW / 2 + 3} y={y - 27} width={KW - 6} height={54} rx={7} fill={lit ? '#6a7890' : '#3a4352'} />; }))}
			<rect x={BKSP[0] - 22} y={BKSP[1] - 27} width={44} height={54} rx={7} fill={th.press > 0.3 && Math.abs(th.p[0] - BKSP[0]) < 26 && Math.abs(th.p[1] + 10 - BKSP[1]) < 36 ? '#8a98b0' : '#2e3644'} />
			<path d={`M${BKSP[0] - 12},${BKSP[1]} l8,-9 h16 v18 h-16 Z M${BKSP[0] - 1},${BKSP[1] - 4} l8,8 M${BKSP[0] + 7},${BKSP[1] - 4} l-8,8`} stroke="#e6ecf5" strokeWidth={2} fill="none" />
			<rect x={SX + 70} y={SY + SHH - 114} width={SW - 190} height={54} rx={7} fill="#3a4352" />
			<rect x={SX + SW - 112} y={SY + SHH - 114} width={100} height={54} rx={7} fill="#2f7cf6" /><text x={SX + SW - 62} y={SY + SHH - 79} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, fontWeight: 700}} fill="#fff">搜索</text>
		</g>}
		<rect x={SX + 18} y={SY + 76} width={SW - 36} height={62} rx={31} fill="#263243" stroke={mid === '谁' ? GOLD : active ? '#5a86c0' : '#3a4a60'} strokeWidth={2} />
		<circle cx={SX + 48} cy={SY + 104} r={9} fill="none" stroke="#9fb3cc" strokeWidth={3} /><path d={`M${SX + 54},${SY + 111} l7,7`} stroke="#9fb3cc" strokeWidth={3} strokeLinecap="round" />
		<text x={SX + 70} y={SY + 115} style={{fontFamily: SANS, fontSize: 22, fontWeight: 500}} fill="#ffffff">{BASE_Q}<tspan fill={mid === '谁' ? GOLD : latin ? '#9fc8ff' : '#fff'} fontWeight={mid === '谁' ? 700 : 500} textDecoration={latin ? 'underline' : undefined}>{mid}</tspan>？</text>
		{blink && <rect x={SX + 70 + 8 * 22 + mw + 1} y={SY + 94} width={3} height={28} fill="#6fb1ff" />}
	</g>;
};
const ChatList: React.FC<{t: number}> = ({t}) => <g>
	<rect x={SX} y={SY} width={SW} height={SHH} fill="#141b26" />
	<text x={SX + 26} y={SY + 112} style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill="#e6ecf5">消息</text>
	{[0, 1, 2, 3, 4, 5].map((i) => { const y = SY + 140 + i * 92, pin = i === 0, tap = pin ? Math.max(0, 1 - Math.abs(t - 135.62) / 0.15) : 0;
		return <g key={i}>
			{pin && <rect x={SX} y={y} width={SW} height={92} fill={tap > 0 ? '#34445c' : '#1f2a3a'} />}
			<circle cx={SX + 50} cy={y + 46} r={30} fill={pin ? '#e8a35a' : ['#4a5668', '#56606e', '#3e4a5a', '#5a5466', '#46525e'][i % 5]} />
			{pin && <text x={SX + 50} y={y + 55} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24, fontWeight: 700}} fill="#fff">饭</text>}
			{pin ? <text x={SX + 96} y={y + 40} style={{fontFamily: SANS, fontSize: 24, fontWeight: 700}} fill="#e6ecf5">饭搭子</text> : <rect x={SX + 96} y={y + 26} width={90 + 60 * rnd(i, 3)} height={14} rx={7} fill="#5a6678" />}
			<rect x={SX + 96} y={y + 56} width={pin ? 150 : 120 + 80 * rnd(i, 4)} height={10} rx={5} fill="#3a4658" />
			{pin && <g><rect x={SX + SW - 70} y={y + 18} width={50} height={24} rx={6} fill="#2f3c50" /><text x={SX + SW - 45} y={y + 36} textAnchor="middle" style={{fontFamily: SANS, fontSize: 15}} fill="#9fb3cc">置顶</text></g>}
		</g>; })}
</g>;
const Waveform: React.FC<{x: number; y: number; n: number; step: number; amp: number; t: number; col: string; live?: boolean}> = ({x, y, n, step, amp, t, col, live}) => <g>{Array.from({length: n}, (_, i) => { const h = (6 + amp * Math.abs(Math.sin(i * 1.7 + 0.4 + (live ? t * 9 : 0))) * (0.5 + 0.5 * Math.sin(i * 0.5))); return <rect key={i} x={x + i * step} y={y - h / 2} width={step * 0.55} height={h} rx={2} fill={col} />; })}</g>;
const Chat: React.FC<{t: number; reply: boolean}> = ({t, reply}) => {
	const n = cl(Math.floor((t - 135.98) / 0.07) + 1, 0, 7), typed = '明天一起吃饭？'.slice(0, n), sent = t >= 136.58, pop = easeOutBack(seg(t, 136.58, 136.78));
	return <g>
		<rect x={SX} y={SY} width={SW} height={SHH} fill="#141b26" />
		<text x={SX + 24} y={SY + 108} style={{fontFamily: SANS, fontSize: 30}} fill="#9fb3cc">‹</text>
		<text x={PHX} y={SY + 106} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24, fontWeight: 700}} fill="#e6ecf5">饭搭子</text>
		<rect x={SX} y={SY + 130} width={SW} height={1.5} fill="#2a3444" />
		{sent && <g transform={`translate(${SX + SW - 22},${SY + 206}) scale(${pop}) translate(${-(SX + SW - 22)},${-(SY + 206)})`}>
			<rect x={SX + SW - 228} y={SY + 178} width={206} height={56} rx={16} fill="#3fae5a" /><text x={SX + SW - 125} y={SY + 214} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22, fontWeight: 500}} fill="#fff">明天一起吃饭？</text></g>}
		{reply && <g>
			<circle cx={SX + 42} cy={SY + 290} r={22} fill="#e8a35a" /><text x={SX + 42} y={SY + 298} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, fontWeight: 700}} fill="#fff">饭</text>
			<rect x={SX + 74} y={SY + 260} width={250} height={60} rx={16} fill="#eef2f6" /><path d={`M${SX + 96},${SY + 276} l18,14 l-18,14 Z`} fill="#2b3442" />
			<Waveform x={SX + 128} y={SY + 290} n={16} step={9} amp={22} t={t} col="#2b3442" live />
			<text x={SX + 314} y={SY + 297} textAnchor="end" style={{fontFamily: SANS, fontSize: 16}} fill="#6a7484">0:03</text>
			<rect x={SX + 74} y={SY + 330} width={262} height={56} rx={12} fill="#2a3444" /><text x={SX + 205} y={SY + 366} textAnchor="middle" style={{fontFamily: SANS, fontSize: 21, fontWeight: 700}} fill="#ffe6b0">你也没睡？明天吃火锅！</text>
		</g>}
		<rect x={SX + 16} y={SY + SHH - 92} width={SW - 90} height={60} rx={30} fill="#263243" />
		{!sent && <text x={SX + 40} y={SY + SHH - 54} style={{fontFamily: SANS, fontSize: 22}} fill="#fff">{typed}</text>}
		<circle cx={SX + SW - 46} cy={SY + SHH - 62} r={28} fill={n > 0 && !sent ? '#3fae5a' : '#2f3c50'} /><path d={`M${SX + SW - 58},${SY + SHH - 62} h22 m-8,-8 l8,8 l-8,8`} stroke="#fff" strokeWidth={3} fill="none" />
	</g>;
};
const PhoneB: React.FC<{t: number}> = ({t}) => {
	const down = ease(seg(t, 136.85, 137.5)), up = ease(seg(t, 138.75, 139.35)), pos = down * (1 - up), flipU = sm(seg(pos, 0.15, 0.85)), sy = Math.cos(Math.PI * flipU);
	const buzz = (t > 137.766 ? Math.exp(-(t - 137.766) / 0.25) : 0) + (t > 138.2 ? Math.exp(-(t - 138.2) / 0.2) : 0), jit = 6 * buzz * Math.sin(t * 95);
	const lightOn = sm(seg(t, 137.766, 137.84));
	const th = thumbB(t), mode = t < 135.25 ? 0 : t < 135.8 ? 1 : 2, slide1 = 1 - ease(seg(t, 135.25, 135.45)), slide2 = 1 - ease(seg(t, 135.8, 136.0));
	const screenLit = sy > 0 ? 1 : 0, reply = t > 138.6;
	return <g transform={`translate(${lerp(0, -140, pos) + jit},${lerp(0, 760, pos)}) rotate(${PROT + lerp(0, -10, pos)} ${PHX} ${PHY})`}>
		{lightOn > 0 && sy < 0 && <Glow x={PHX} y={PHY} r={560} c="#bcd4ff" o={0.75 * lightOn * (0.8 + 0.2 * Math.sin(t * 20))} id="rbPhLeak" />}
		{sy > 0 && <Glow x={PHX} y={PHY} r={520} c="#7fa6ff" o={0.2} id="rbPhG" />}
		<HandBack />
		<g transform={`translate(${PHX},${PHY}) scale(1,${Math.max(0.02, Math.abs(sy))}) translate(${-PHX},${-PHY})`}>
			<rect x={PHX - PW / 2} y={PHY - PH / 2} width={PW} height={PH} rx={58} fill={screenLit ? '#111318' : '#1a1c23'} stroke="#2a2d36" strokeWidth={3} />
			{screenLit ? <g>
				<defs><clipPath id="rbScrC"><rect x={SX} y={SY} width={SW} height={SHH} rx={44} /></clipPath>
					<linearGradient id="rbScr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2534" /><stop offset="1" stopColor="#0b1018" /></linearGradient></defs>
				<rect x={SX} y={SY} width={SW} height={SHH} rx={44} fill="url(#rbScr)" />
				<g clipPath="url(#rbScrC)">
					{mode === 0 && <SearchScreen t={t} th={th} />}
					{mode >= 1 && <g transform={`translate(${mode === 1 ? slide1 * SW : 0},0)`}><ChatList t={t} /></g>}
					{mode === 2 && <g transform={`translate(${slide2 * SW},0)`}><Chat t={t} reply={reply} /></g>}
					<rect x={SX} y={SY} width={SW} height={52} fill="#1b2534" opacity={0.9} />
					<rect x={PHX - 50} y={SY + 16} width={100} height={26} rx={13} fill="#05070a" />
					<text x={SX + 34} y={SY + 40} style={{fontFamily: SANS, fontSize: 22, fontWeight: 700}} fill="#e6ecf5">03:12</text>
					<rect x={SX + SW - 70} y={SY + 26} width={34} height={15} rx={4} fill="none" stroke="#e6ecf5" strokeWidth={2} /><rect x={SX + SW - 67} y={SY + 29} width={11} height={9} rx={2} fill="#e6ecf5" />
				</g>
			</g> : <g>
				<rect x={PHX - PW / 2 + 30} y={PHY - PH / 2 + 30} width={130} height={150} rx={30} fill="#23262e" /><circle cx={PHX - PW / 2 + 70} cy={PHY - PH / 2 + 70} r={22} fill="#0c0d10" /><circle cx={PHX - PW / 2 + 70} cy={PHY - PH / 2 + 140} r={22} fill="#0c0d10" />
			</g>}
		</g>
		{pos < 0.05 && t < 136.9 && <Thumb p={th.p} press={th.press} />}
	</g>;
};
const VoiceBubble: React.FC<{t: number}> = ({t}) => {
	const a = easeOutBack(seg(t, 137.85, 138.12)), out = sm(seg(t, 139.05, 139.4)), op = cl(seg(t, 137.85, 137.95)) * (1 - out);
	if (op <= 0) return null;
	const s = Math.max(0.01, a * (1 - 0.4 * out)), cx = 1130, cy = 610 + 120 * out;
	return <g opacity={op} transform={`translate(${cx},${cy}) scale(${s})`}>
		<rect x={-326} y={-92} width={660} height={200} rx={38} fill="#000" opacity={0.3} />
		<rect x={-330} y={-100} width={660} height={200} rx={38} fill="#f2f5f8" />
		<path d="M-300,96 L-330,140 L-250,100 Z" fill="#f2f5f8" />
		<circle cx={-410} cy={-40} r={46} fill="#e8a35a" stroke="#fff" strokeWidth={4} /><text x={-410} y={-26} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40, fontWeight: 700}} fill="#fff">饭</text>
		<circle cx={-270} cy={-38} r={30} fill="#3fae5a" /><path d="M-280,-54 L-254,-38 L-280,-22 Z" fill="#fff" />
		<Waveform x={-220} y={-38} n={28} step={15} amp={44} t={t} col="#2b3442" live />
		<text x={306} y={-28} textAnchor="end" style={{fontFamily: SANS, fontSize: 26}} fill="#6a7484">0:03</text>
		<circle cx={322} cy={-92} r={12} fill="#e5483d" />
		<text x={0} y={66} textAnchor="middle" style={{fontFamily: SANS, fontSize: 46, fontWeight: 700}} fill="#1f2733">你也没睡？明天吃火锅！</text>
	</g>;
};
type CamK = [number, number, P2];
const TODAY_CAM: CamK[] = [[128.706, 2.1, [1480, 880]], [131.5, 1.0, [960, 540]], [134.9, 1.2, [1290, 520]], [136.75, 1.24, [1300, 530]], [137.6, 1.0, [960, 560]], [140.596, 1.05, [900, 520]]];
const todayCam = (t: number): {z: number; L: P2} => {
	let i = 0; while (i < TODAY_CAM.length - 1 && t >= TODAY_CAM[i + 1][0]) i++;
	const a = TODAY_CAM[i], b = TODAY_CAM[Math.min(TODAY_CAM.length - 1, i + 1)], u = i === TODAY_CAM.length - 1 ? 1 : ease(seg(t, a[0], b[0]));
	let z = Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)), L = lerpP(a[2], b[2], u);
	if (t > 140.596) { const k = ease(seg(t, 140.596, 141.65)); z = Math.exp(lerp(Math.log(1.05), Math.log(6), k)); L = lerpP(L, [418, 230], ease(seg(t, 140.596, 141.4))); }
	L = [cl(L[0], W / 2 / z, W - W / 2 / z), cl(L[1], H / 2 / z, H - H / 2 / z)];   // never show past the room's edges
	return {z, L};
};
const Today: React.FC<{t: number}> = ({t}) => {
	const c = todayCam(t), dawn = sm(seg(t, 137.8, 140.2));
	const down = ease(seg(t, 136.85, 137.5)), up = ease(seg(t, 138.75, 139.35)), pos = down * (1 - up), laugh = sm(seg(t, 138.85, 139.2)) * (1 - sm(seg(t, 140.0, 140.6)));
	const buzzLight = sm(seg(t, 137.766, 137.84)) * (1 - up);
	const ring = (k: number) => { const d = t - 137.766 - k * 0.22; return d > 0 && d < 0.9 ? d : -1; };
	return <g>
		<LookCam z={c.z} L={c.L} S={[960, 540]}>
			<Room />
			{Array.from({length: 10}, (_, i) => <circle key={i} cx={130 + rnd(i, 31) * 370} cy={430 + rnd(i, 32) * 100} r={3 + 3 * rnd(i, 33)} fill="#ffe2b0" opacity={0.25 * (1 - dawn) * (0.5 + 0.5 * Math.sin(t * (1.2 + rnd(i, 34) * 2) + i))} />)}
			{dawn > 0 && <g opacity={dawn}><Room dawn /></g>}
			<PhoneB t={t} />
			{/* the blanket on the chest; the phone's light comes through it */}
			{pos > 0 && <g opacity={sm(pos * 1.5)}>
				<path d="M700,1100 Q760,990 960,1000 Q1200,960 1400,1000 Q1600,990 1800,960 L2000,1100 Z" fill="#241c26" />
				<path d="M820,1040 Q1000,1000 1180,1030 M1300,1010 Q1500,990 1700,1000" stroke="#3a2e3c" strokeWidth={6} fill="none" />
				<Glow x={1300} y={990} r={380} c="#bcd4ff" o={0.45 * buzzLight * (0.8 + 0.2 * Math.sin(t * 20))} id="rbBlkG" />
			</g>}
			{[0, 1, 2].map((k) => { const d = ring(k); return d > 0 && <g key={k} opacity={0.7 * (1 - d / 0.9)}>
				<path d={`M${1050 - 60 * d},${940 - 70 * d} q${-30 - 40 * d},${50} 0,${100 + 60 * d}`} stroke="#d8e6ff" strokeWidth={5} fill="none" />
				<path d={`M${1500 + 60 * d},${910 - 70 * d} q${30 + 40 * d},${50} 0,${100 + 60 * d}`} stroke="#d8e6ff" strokeWidth={5} fill="none" /></g>; })}
			<g transform={`translate(0,${26 * pos - 7 * laugh * Math.abs(Math.sin(t * 15))}) rotate(${-3 * pos - 3 * laugh} 430 1000)`}><Viewer t={t} /></g>
		</LookCam>
		<VoiceBubble t={t} />
	</g>;
};

/* ======================= 141.3–145.124 the dawn sky, the title in gold, the follow pill ======================= */
const TL1 = '人活着为了什么？', TL2 = '人类问了近四千年';
const EndSky: React.FC<{t: number}> = ({t}) => {
	const u = seg(t, 141.3, 145.124), z = lerp(1.0, 1.06, u), glow = sm(seg(t, 142.0, 143.4)), pill = easeOutBack(seg(t, 143.2, 143.55));
	const ch = (s: string, i: number, x0: number, adv: number, y: number, size: number, a: number) => { const k = seg(t, a, a + 0.28);
		return k > 0 && <text key={`${s}${i}`} x={x0 + i * adv + adv / 2} y={y + 16 * (1 - easeOut(k))} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: size}} fill="url(#rbGold)" stroke="#3a2008" strokeWidth={5} paintOrder="stroke" opacity={easeOut(k)}>{s}</text>; };
	return <g>
		<defs><linearGradient id="rbGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" /><stop offset="0.55" stopColor="#f2c25a" /><stop offset="1" stopColor="#c98a24" /></linearGradient></defs>
		<g transform={`translate(960,540) scale(${z}) translate(-960,-540)`}>
			<Sky id="rbEnSky" stops={[[0, '#1a2448'], [0.42, '#4a5a8e'], [0.72, '#b88aa0'], [0.9, '#f2b88a'], [1, '#f6c89a']]} />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i, 101) * 1920} cy={rnd(i, 102) * 380} r={1 + 1.5 * rnd(i, 103)} fill="#f4f6ff" opacity={(0.5 + 0.4 * rnd(i, 104)) * (1 - seg(t, 141.3, 144.5))} />)}
			<Glow x={960} y={1010} r={820} c="#ffc89a" o={0.55} id="rbEnSun" />
			<path d="M0,1080 L0,930 L90,930 L90,880 L180,880 L180,940 L260,940 L260,860 L360,860 L360,920 L470,920 L470,890 L560,890 L560,950 L700,950 L700,870 L790,870 L790,930 L900,930 L900,900 L1010,900 L1010,955 L1120,955 L1120,880 L1230,880 L1230,935 L1330,935 L1330,860 L1430,860 L1430,925 L1540,925 L1540,895 L1660,895 L1660,945 L1760,945 L1760,885 L1920,885 L1920,1080 Z" fill="#1e1c2c" />
			{Array.from({length: 24}, (_, i) => <rect key={i} x={rnd(i, 105) * 1900} y={900 + rnd(i, 106) * 140} width={6} height={8} fill="#ffd9a0" opacity={0.5 * rnd(i, 107)} />)}
		</g>
		<Glow x={960} y={460} r={700} c="#ffcf6a" o={0.3 * glow} id="rbEnTtG" />
		{TL1.split('').map((s, i) => ch(s, i, 960 - 4 * 116, 116, 410, 106, 141.9 + i * 0.1))}
		{TL2.split('').map((s, i) => ch(s, i, 960 - 4 * 100, 100, 545, 90, 142.65 + i * 0.09))}
		{pill > 0.01 && <g transform={`translate(960,660) scale(${pill})`}>
			<rect x={-260} y={-34} width={520} height={68} rx={34} fill="#120e1c" opacity={0.55} stroke={GOLD} strokeWidth={2} />
			<circle cx={-218} cy={0} r={20} fill={GOLD} /><path d="M-228,0 h20 M-218,-10 v20" stroke="#2a1a08" strokeWidth={4} />
			<text x={18} y={11} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill="#fff3d6">关注 Juno · 一起看懂世界</text>
		</g>}
	</g>;
};

/* ======================= the cut ======================= */
const lay = (k: string, op: number, node: React.ReactNode) => (op > 0.001 ? <g key={k} opacity={Math.min(1, op)}>{node}</g> : null);
export const RoughB: React.FC<{t: number}> = ({t}) => {
	const L: React.ReactNode[] = [];
	if (t < 84.91) L.push(lay('st', 1, <Stair t={t} />));
	else if (t < 96.231) L.push(lay('mr', 1, <March t={t} />));
	else if (t < 107.3) L.push(lay('wn', 1, <WindowShot t={t} />));
	else if (t < 107.8) {
		const w = Math.max(1 - 0.85 * sm(seg(t, 107.3, 107.6)), easeIn(seg(t, 107.62, 107.8)));
		L.push(lay('fs', 1, <g><FaceSky t={t} /><rect width={W} height={H} fill="#fffaf2" opacity={w} /></g>));
	} else if (t < 116.4) {
		if (t < 112.9) L.push(lay('hv', 1, <g><Harvard t={DT2.harvard + Math.min((t - 107.8) * 0.863, 6.9 - DT2.harvard)} /><rect width={W} height={H} fill="#fffaf2" opacity={Math.exp(-(t - 107.8) / 0.15)} /></g>));
		if (t >= 112.4 && t < 115.1) L.push(lay('bd', sm(seg(t, 112.4, 112.85)), <Board t={t} />));
		if (t >= 114.75) L.push(lay('bn', sm(seg(t, 114.75, 115.05)), <Bench t={t} />));
		if (t >= 116.043) L.push(lay('ct', sm(seg(t, 116.043, 116.3)), <CodaTablet t={t} />));
	} else if (t < 120.45) {
		if (t < 118.8) L.push(lay('ct', 1, <CodaTablet t={t} />));
		if (t >= 118.25) L.push(lay('tv', sm(seg(t, 118.25, 118.75)), <Tavern t={t} />));
		if (t >= 120.15) L.push(lay('hd', sm(seg(t, 120.15, 120.45)), <Hands t={t} />));
	} else if (t < 127.031) {
		if (t < 123.85) L.push(lay('hd', 1, <Hands t={t} />));
		if (t >= 123.5) L.push(lay('hg', sm(seg(t, 123.5, 123.85)), <Hug t={t} />));
	} else if (t < 141.8) {
		if (t < 129.3) L.push(lay('hh', 1, <Hands t={t} hold />));
		if (t >= 128.706) L.push(lay('td', sm(seg(t, 128.706, 129.26)), <Today t={t} />));
		if (t >= 141.35) L.push(lay('en', sm(seg(t, 141.35, 141.75)), <EndSky t={t} />));
	} else L.push(lay('en', 1, <EndSky t={t} />));
	return <g>
		{L}
		<rect width={W} height={H} fill="#000" opacity={sm(seg(t, 144.3, 145.08))} />
	</g>;
};

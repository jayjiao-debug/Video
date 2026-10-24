import React from 'react';
import {W, H, SANS, SERIF, GOLD, rnd, lerp, Glow, Plate, Blur, Smoke, Rimmed, fkPose, jointAt, Look4, Pose} from './kit42';
import {gaitPose, gaitStride, mixPose} from './figure42';
import {LK, Tablet} from './frames42';
import {LookCam, beatAt} from './demo42';
import {Egypt2} from './demo42b';
import {LINES42, M42} from './lines42';
/* ep42 rough cut, part A (25.477–79.815): Babylon → Lu → Athens → Danube. Every shot drifts and acts its line; the
   hand-offs are a pan east (Egypt → Babylon), sand blown east (→ Lu), a matched raised hand (→ Athens), a star that
   becomes a lamp flame (→ Danube); the part ends on Marcus's door slamming at the CRASH. Beats are keyed to LINES42. */
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const easeIn = (u: number) => Math.pow(cl(u), 3);
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
type P2 = [number, number];
const LS = (id: string) => (LINES42.find((l) => l.id === id) ?? {start: 0}).start;
const drift = (t: number, a = 1): P2 => [a * (8 * Math.sin(t * 0.31) + 4 * Math.sin(t * 0.83 + 1)), a * (5 * Math.sin(t * 0.27 + 2) + 2 * Math.sin(t * 1.1))];
type FK = {hip: number; lean: number; neck: number; lt: number; lk: number; rt: number; rk: number; la: number; le: number; ra: number; re: number; lf?: number; rf?: number};
const mixF = (a: FK, b: FK, k: number): FK => Object.fromEntries(Object.keys(a).map((n) => [n, lerp((a as Record<string, number>)[n], (b as Record<string, number>)[n] ?? (a as Record<string, number>)[n], k)])) as FK;
const STAND: FK = {hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
/** a walker covering x0→x1 between ta and tb (feet synced to the stride), standing still outside that window */
const walkAt = (t: number, ta: number, tb: number, x0: number, x1: number, h: number, stand: Pose, g = '08_04'): {x: number; pose: Pose} => {
	const u = seg(t, ta, tb), x = lerp(x0, x1, u), dist = Math.abs(x - x0), ph = dist / (gaitStride(g) * h);
	const k = Math.min(seg(t, ta - 0.01, ta + 0.25), 1 - seg(t, tb - 0.25, tb + 0.01));
	return {x, pose: mixPose(stand, gaitPose(g, ph), sm(k))};
};
const Flame: React.FC<{x: number; y: number; s?: number; t: number; id: string}> = ({x, y, s = 1, t, id}) => { const f = (i: number) => 1 + 0.15 * Math.sin(t * (11 + i * 3) + i) + 0.08 * Math.sin(t * 23 + i * 2);
	return <g><Glow x={x} y={y - 30 * s} r={200 * s} c="#ff9a3a" o={0.55} id={id} />
		<path d={`M${x - 34 * s},${y} Q${x - 30 * s},${y - 60 * s * f(0)} ${x},${y - 110 * s * f(1)} Q${x + 30 * s},${y - 60 * s * f(2)} ${x + 34 * s},${y} Z`} fill="#ff8a2a" />
		<path d={`M${x - 18 * s},${y} Q${x - 14 * s},${y - 40 * s * f(3)} ${x + 2 * s},${y - 70 * s * f(4)} Q${x + 16 * s},${y - 40 * s * f(5)} ${x + 18 * s},${y} Z`} fill="#ffd27a" /></g>; };

/** a soft vertical band that hides the join between two panels during a pan */
const Seam: React.FC<{x: number; c: string; id: string; w?: number}> = ({x, c, id, w = 520}) => <g>
	<defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={c} stopOpacity="0" /><stop offset="0.5" stopColor={c} stopOpacity="0.9" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
	<rect x={x - w / 2} y={0} width={w} height={H} fill={`url(#${id})`} /></g>;
/* =============================== BABYLON 25.477–39.061 =============================== */
const BAB = {pan0: M42.babylon, pan1: M42.babylon + 1.6, run0: 26.6, run1: 28.3, hands: 28.5, bq: LS('BQ'), tab0: LS('BQ') + 1.3, b3: LS('B3'), out0: 37.6, lu: M42.lu};
/** the pan east: the end of the Egypt shot, a stretch of desert and a second river, then the sea at the edge of the world */
const DesertStrip: React.FC<{t: number}> = ({t}) => <g>
	<defs><linearGradient id="dsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d6a8e" /><stop offset="0.5" stopColor="#e2a888" /><stop offset="0.62" stopColor="#c99a7a" /><stop offset="1" stopColor="#5e4636" /></linearGradient></defs>
	<rect x={0} y={0} width={W} height={H} fill="url(#dsSky)" />
	<path d={`M0,640 Q300,600 600,630 Q900,660 1200,620 Q1500,590 1920,630 L1920,1080 L0,1080 Z`} fill="#a07a5c" />
	<path d={`M0,720 Q400,690 800,712 Q1300,740 1920,705 L1920,1080 L0,1080 Z`} fill="#86644c" />
	<path d="M700,760 Q1000,730 1320,770 Q1500,800 1920,760 L1920,800 Q1500,840 1300,810 Q1000,775 700,800 Z" fill="#7a8aa8" opacity={0.85} />
	{Array.from({length: 14}, (_, i) => <rect key={i} x={760 + i * 80 + ((t * 20) % 80)} y={772 + 8 * Math.sin(i)} width={40} height={2} fill="#ffe2c0" opacity={0.3} />)}
	<path d="M0,860 Q500,840 1100,870 Q1500,890 1920,900 L1920,1080 L0,1080 Z" fill="#5a4436" />
</g>;
const Tavern: React.FC<{t: number}> = ({t}) => <g>
	<Glow x={1440} y={760} r={420} c="#ffae5a" o={0.4 + 0.04 * Math.sin(t * 7)} id="rbTvG" />
	<path d="M1180,912 L1180,470 L1230,470 L1230,452 L1300,452 L1300,470 L1560,470 L1560,452 L1630,452 L1630,470 L1720,470 L1720,912 Z" fill="#2a1d1c" />
	{[1210, 1265, 1600, 1660].map((xx) => <rect key={xx} x={xx} y={500} width={14} height={412} fill="#1f1514" />)}
	{Array.from({length: 14}, (_, i) => <rect key={i} x={1180} y={490 + i * 30} width={540} height={2} fill="#3a2a26" opacity={0.6} />)}
	<rect x={1180} y={462} width={540} height={10} fill="#3a2826" />
	<rect x={1350} y={672} width={140} height={240} fill="#ffb862" /><rect x={1340} y={662} width={160} height={14} fill="#1a1110" />
	<Glow x={1420} y={760} r={150} c="#fff0c8" o={0.6} id="rbTvD" />
	<rect x={1620} y={560} width={40} height={30} fill="#ffb862" opacity={0.85} />
	<g transform="translate(1540,912)"><path d="M-26,0 Q-40,-50 -18,-84 L18,-84 Q40,-50 26,0 Z" fill="#1d1414" /><rect x={-14} y={-96} width={28} height={14} fill="#1d1414" /></g>
</g>;
const BabylonShore: React.FC<{t: number}> = ({t}) => {
	const gh = 600, g = 912, stand = fkPose({...STAND, lean: 6, neck: 6});
	const w = walkAt(t, BAB.run0, BAB.run1, 360, 760, gh, stand);
	const hands = fkPose({hip: 0.65, lean: 10, neck: 26, lt: 4, lk: 6, rt: -6, rk: 6, la: 58, le: 70, ra: 66, re: 62});
	const listen = fkPose({hip: 0.65, lean: 4, neck: 0, lt: 4, lk: 6, rt: -6, rk: 6, la: 14, le: 30, ra: 8, re: 24});
	let gp = w.pose; if (t > BAB.run1) gp = mixPose(mixPose(stand, hands, sm(seg(t, BAB.hands, BAB.hands + 0.6))), listen, sm(seg(t, BAB.bq - 0.1, BAB.bq + 0.5)));
	const bt = (t - beatAt(52)) / 0.56605, sp = 0.5 - 0.5 * Math.cos(Math.PI * bt);
	const aw = mixPose(fkPose({...STAND, la: 30, le: 70, ra: 8, re: 20}), fkPose({hip: 0.65, lean: 6, neck: 0, lt: 3, lk: 4, rt: -4, rk: 4, la: 34, le: 70, ra: lerp(55, 85, sp), re: lerp(20, 0, sp)}), sm(seg(t, BAB.bq, BAB.bq + 0.4)));
	const ax = lerp(1420, 1380, sm(seg(t, BAB.bq - 0.3, BAB.bq + 0.3))), jug = jointAt(aw, 'LHand', ax, g, 540, true);
	return <g>
		<Plate k="sea" />
		<path d="M0,830 Q700,812 1920,840 L1920,1080 L0,1080 Z" fill="#3a2a30" opacity={0.6} />
		{/* the fire on the shore and the empty place beside it */}
		<Flame x={250} y={900} s={0.7} t={t} id="rbFire" /><Smoke x={250} y={800} s={0.9} col="#b0a0a8" op={0.25} seed={2} id="rbFs" />
		<rect x={300} y={892} width={110} height={18} rx={8} fill="#1a1012" /><rect x={110} y={892} width={90} height={18} rx={8} fill="#1a1012" />
		{Array.from({length: 9}, (_, i) => { const x = 380 + i * 44; return x < w.x - 30 && <ellipse key={i} cx={x} cy={930 + (i % 2) * 12} rx={12} ry={4} fill="#1a1218" opacity={0.5} />; })}
		<Tavern t={t} />
		<Rimmed x={ax} ground={g} h={540} pose={aw} look={LK.alewife} flip col="#100b0e" rim="#ffc27a" rimOp={0.6} rimDx={2.2} />
		<g transform={`translate(${jug[0] - 6},${jug[1] + 10})`}><path d="M-20,0 Q-28,40 -14,64 L14,64 Q28,40 20,0 Z" fill="#100b0e" /><path d="M18,10 Q36,18 22,40" stroke="#100b0e" strokeWidth={6} fill="none" /></g>
		<Rimmed x={w.x} ground={g} h={gh} pose={gp} look={LK.gilg} col="#0c090e" rim="#ffb27a" rimOp={0.5} rimDx={2.2} />
	</g>;
};
/** the tablet: her line glows wedge by wedge; then a gust of sand covers the lower columns */
const TB = {x: 520, y: 140, w: 880, h: 780, rows: 12, row: 4};
const TabletLine: React.FC<{t: number}> = ({t}) => {
	const rowH = (TB.h - 60) / TB.rows, rowY = TB.y + 36 + TB.row * rowH, reveal = seg(t, BAB.tab0 + 0.3, LS('BQ') + 3.4), sand = sm(seg(t, BAB.b3 + 0.3, BAB.b3 + 2.6));
	const gust = seg(t, BAB.b3, BAB.out0 + 1.5);
	return <g>
		<rect width={W} height={H} fill="#0e0705" /><Glow x={960} y={520} r={820} c="#ff9e4a" o={0.32} id="rbTbW" />
		<Tablet x={TB.x} y={TB.y} w={TB.w} h={TB.h} seed={9} rows={TB.rows} />
		<defs><clipPath id="rbRev"><rect x={TB.x} y={rowY - rowH * 0.6} width={20 + (TB.w / 2) * reveal} height={rowH * 1.2} /></clipPath></defs>
		<g clipPath="url(#rbRev)"><Tablet x={TB.x} y={TB.y} w={TB.w} h={TB.h} seed={9} rows={TB.rows} glowRow={TB.row} /></g>
		{reveal > 0 && reveal < 1 && <Glow x={TB.x + 20 + (TB.w / 2) * reveal} y={rowY} r={70} c="#ffe2a0" o={0.7} id="rbTbS" />}
		{/* sand: a drift slides in from the left over the lower rows; grains stream east */}
		<defs><clipPath id="rbSandC"><rect x={TB.x} y={TB.y} width={TB.w} height={TB.h} rx={24} /></clipPath></defs>
		{sand > 0 && <g clipPath="url(#rbSandC)">{(() => { const top = rowY + rowH * 0.85, xr = lerp(TB.x - 60, TB.x + TB.w + 120, sand), bot = TB.y + TB.h + 20;
			const wave = Array.from({length: 10}, (_, i) => { const x = lerp(TB.x - 60, xr, (i + 1) / 10); return `L${x.toFixed(1)},${(top + 10 * Math.sin(i * 1.7 + t * 0.8)).toFixed(1)}`; }).join(' ');
			return <g><path d={`M${TB.x - 60},${bot} L${TB.x - 60},${top} ${wave} Q${xr + 50},${top + 20} ${xr + 110},${bot} Z`} fill="#b8925e" opacity={0.95} />
				{Array.from({length: 60}, (_, i) => <circle key={i} cx={lerp(TB.x, xr, rnd(i, 31))} cy={lerp(top + 14, bot, rnd(i, 32))} r={1.5 + 2 * rnd(i, 33)} fill={i % 2 ? '#d8b884' : '#8a6a42'} opacity={0.6} />)}</g>; })()}</g>}
		{gust > 0 && Array.from({length: 120}, (_, i) => { const life = 0.9 + rnd(i, 3) * 0.8, u = ((gust * 6 + rnd(i, 1) * life) % life) / life, y = rowY + rowH * 1.2 + rnd(i, 2) * 420 - 80 * u;
			return <rect key={i} x={-100 + u * 2200} y={y} width={6 + 24 * rnd(i, 5)} height={2} fill="#e8cc98" opacity={0.6 * Math.sin(Math.PI * u) * Math.min(1, gust * 4)} />; })}
	</g>;
};

/* =============================== LU 39.061–52.645 =============================== */
const LU = {c1: LS('C1'), look: LS('C1') + 1.9, cq: LS('CQ'), brk: M42.luBreak, c2: M42.luReentry, raise: M42.athens - 0.75, end: M42.athens};
const LuScene: React.FC<{t: number}> = ({t}) => {
	const g = 905, zh = 600, kh = 600, lit = sm(seg(t, LU.c2, LU.c2 + 0.6));
	const zAsk = fkPose({hip: 0.2, lean: 6, neck: -4, lt: 67, lk: 157, rt: 64, rk: 154, lf: 180, rf: 180, la: 22 + 14 * Math.max(0, Math.sin((t - LU.c1) * 4)) * (t < LU.look ? 1 : 0), le: 70, ra: 18, re: 74});
	const zLook = fkPose({hip: 0.2, lean: 2, neck: -14, lt: 67, lk: 157, rt: 64, rk: 154, lf: 180, rf: 180, la: 18, le: 74, ra: 14, re: 76});
	const zFlip = t > LU.look && t < LU.brk + 0.2;   // he turns to the sunset, then the master turns him back
	const zP = t < LU.look ? zAsk : t < LU.brk + 0.2 ? zLook : mixPose(zLook, zAsk, sm(seg(t, LU.brk + 0.2, LU.brk + 0.7)));
	const kx = lerp(1120, 1010, sm(seg(t, LU.brk - 0.4, LU.brk + 0.2)));
	const bt = (t - beatAt(76)) / 0.56605, alt = 0.5 - 0.5 * Math.cos(Math.PI * bt);
	const kSpeak = fkPose({hip: 0.655, lean: 8, neck: 8, lt: 4, lk: 4, rt: -5, rk: 4, la: 4, le: 12, ra: lerp(40, 66, alt), re: lerp(30, -6, alt)});
	const kTurn = fkPose({hip: 0.655, lean: 14, neck: 10, lt: 8, lk: 6, rt: -8, rk: 4, la: 78, le: 6, ra: 104, re: -18});
	const kHigh = fkPose({hip: 0.655, lean: 4, neck: 0, lt: 4, lk: 4, rt: -5, rk: 4, la: 6, le: 10, ra: 128, re: -10});
	let kP = fkPose({hip: 0.655, lean: 8, neck: 8, lt: 4, lk: 4, rt: -5, rk: 4, la: 4, le: 12, ra: 30, re: 30});
	if (t > LU.cq) kP = mixPose(kP, kSpeak, sm(seg(t, LU.cq, LU.cq + 0.4)));
	if (t > LU.brk - 0.4) kP = mixPose(kP, kTurn, sm(seg(t, LU.brk - 0.4, LU.brk + 0.1)) * (1 - sm(seg(t, LU.c2 + 1.0, LU.c2 + 1.6))));
	if (t > LU.raise - 0.6) kP = mixPose(kP, kHigh, sm(seg(t, LU.raise - 0.6, LU.raise + 0.4)));
	const ox = lerp(1900, 1450, seg(t, LU.c2, LU.end)), kid = (i: number) => lerp(1250 + i * 70, 1700 + i * 60, seg(t, LU.c2 + 0.3 + i * 0.2, LU.end));
	const sunY = lerp(600, 640, seg(t, LU.c1 - 1.5, LU.end));
	return <g>
		<defs><linearGradient id="luSkyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3a5c" /><stop offset="0.45" stopColor="#c47a62" /><stop offset="0.62" stopColor="#f0b070" /><stop offset="1" stopColor="#6a4a48" /></linearGradient></defs>
		<rect x={-400} y={0} width={W + 800} height={H} fill="url(#luSkyR)" />
		<Glow x={330} y={sunY} r={260} c="#ffd27a" o={0.7} id="luSunR" /><circle cx={330} cy={sunY} r={58} fill="#ffe0a0" />
		<path d="M-400,640 Q300,600 620,628 Q900,650 1200,610 Q1500,580 2300,620 L2300,1080 L-400,1080 Z" fill="#6a4a50" />
		<path d="M-400,700 Q400,680 800,700 Q1300,720 2300,690 L2300,1080 L-400,1080 Z" fill="#4a3440" />
		{[[1330, 700, 1], [1520, 690, 0.9], [1720, 700, 1.1], [1900, 696, 0.9]].map(([x, y, s], i) => <g key={i}>
			<g opacity={lit}><Smoke x={x + 20 * s} y={y - 80 * s - 30 * ((t * 0.3 + i * 0.2) % 1)} s={s * 0.9} col="#d9c8c0" op={0.4} seed={i} id={`luSmR${i}`} /></g>
			<path d={`M${x - 70 * s},${y} L${x - 70 * s},${y - 50 * s} L${x},${y - 100 * s} L${x + 70 * s},${y - 50 * s} L${x + 70 * s},${y} Z`} fill="#3a2830" />
			<rect x={x - 12 * s} y={y - 34 * s} width={24 * s} height={34 * s} fill={lit > 0.5 ? '#ffb862' : '#5a3a34'} />{lit > 0 && <Glow x={x} y={y - 17 * s} r={50 * s} c="#ffb862" o={0.6 * lit} id={`luDr${i}`} />}</g>)}
		{/* an ox brought home, children running: life comes back to the village */}
		{t > LU.c2 && <g opacity={lit}>
			<g transform={`translate(${ox},716)`}><path d="M-46,-30 Q-40,-46 0,-44 L30,-44 Q46,-50 52,-38 L60,-34 L58,-26 L46,-26 L40,-18 L36,0 L28,0 L28,-16 L-24,-16 L-26,0 L-34,0 L-36,-18 Q-50,-20 -46,-30 Z" fill="#2a1c22" /><path d="M44,-46 L50,-56 M52,-44 L60,-52" stroke="#2a1c22" strokeWidth={3} /></g>
			<Rimmed x={ox + 70} ground={716} h={110} pose={walkAt(t, LU.c2, LU.end, 0, -400, 110, fkPose(STAND)).pose} look={{dress: 'robe', head: 'bun'}} flip col="#2a1c22" rimOp={0} />
			{[0, 1].map((i) => <Rimmed key={i} x={kid(i)} ground={712 + i * 4} h={70} pose={gaitPose('08_04', (t * 2.2 + i * 0.4) % 1)} look={{dress: 'tunic', head: 'child'}} col="#2a1c22" rimOp={0} />)}
		</g>}
		<path d="M-400,820 Q960,800 2300,830 L2300,1080 L-400,1080 Z" fill="#2a1e24" />
		<g fill="#140e14" transform={`translate(120,0) rotate(${0.6 * Math.sin(t * 0.8)} 1320 905)`}><path d="M1290,905 Q1300,700 1270,560 Q1250,470 1180,420 L1200,404 Q1260,440 1300,500 Q1330,430 1420,380 L1430,396 Q1350,450 1330,560 Q1320,720 1350,905 Z" />
			{Array.from({length: 22}, (_, i) => <ellipse key={i} cx={980 + rnd(i, 1) * 800 + 4 * Math.sin(t * 1.1 + i)} cy={120 + rnd(i, 2) * 300} rx={90 + 80 * rnd(i, 3)} ry={50 + 40 * rnd(i, 4)} />)}</g>
		{/* leaves and dust blown east by the wind that came off the tablet */}
		{Array.from({length: 26}, (_, i) => { const u = ((t - LU.c1 + 3) * (0.25 + 0.2 * rnd(i, 1)) + rnd(i, 2)) % 1, x = -100 + u * 2100, y = 380 + rnd(i, 3) * 480 + 30 * Math.sin(t * 2 + i);
			return <ellipse key={i} cx={x} cy={y} rx={6} ry={3} fill={i % 3 ? '#e8c890' : '#3a2a20'} opacity={0.5 * Math.max(0, 1 - seg(t, LU.c1 + 3, LU.c1 + 5))} transform={`rotate(${t * 200 + i * 40} ${x} ${y})`} />; })}
		<Rimmed x={760} ground={g} h={zh} pose={zP} look={LK.zilu} flip={zFlip} col="#0f0a10" rim="#ffc890" rimOp={0.55} rimDx={zFlip ? 2.2 : -2.2} />
		<Rimmed x={kx} ground={g} h={kh} pose={kP} look={LK.kong} flip col="#0f0a10" rim="#ffc890" rimOp={0.45} rimDx={2.2} />
	</g>;
};
const luCam = (t: number) => { const p = ease(seg(t, LU.c2 + 0.1, LU.c2 + 2.4)), d = drift(t);
	return {z: lerp(1.02, 1.0, p) * (1 + 0.04 * seg(t, LU.c1, LU.c2)), L: [lerp(940, 1080, p) + d[0], 540 + d[1]] as P2}; };

/* =============================== ATHENS 52.645–66.231 =============================== */
const AT = {s1: LS('S1'), vote: LS('S1') + 0.3, split: LS('S1') + 2.6, sq: LS('SQ'), s2: LS('S2'), out: M42.danube};
const SOC = {x: 470, g: 868, h: 560};
const socPose = (t: number) => { const raised = fkPose({hip: 0.655, lean: 2, neck: 0, lt: 4, lk: 4, rt: -5, rk: 4, la: 8, le: 26, ra: 118, re: -8});
	const speak = fkPose({hip: 0.655, lean: 3, neck: 2, lt: 4, lk: 4, rt: -5, rk: 4, la: 8, le: 26, ra: 70 + 10 * Math.sin(t * 2.4), re: 24});
	const calm = fkPose({hip: 0.655, lean: 0, neck: -2, lt: 4, lk: 4, rt: -5, rk: 4, la: 8, le: 26, ra: 96, re: 10});
	let p = mixPose(raised, speak, sm(seg(t, AT.s1 + 0.4, AT.s1 + 1.2)));
	p = mixPose(p, calm, sm(seg(t, AT.sq - 0.2, AT.sq + 0.5)));
	return p; };
const AthensScene: React.FC<{t: number}> = ({t}) => {
	const sit = fkPose({hip: 0.37, lean: 4, neck: 6, lt: 86, lk: 90, rt: 82, rk: 86, la: 14, le: 48, ra: 10, re: 50});
	const vote = fkPose({hip: 0.64, lean: 24, neck: 14, lt: 10, lk: 14, rt: -8, rk: 6, la: 8, le: 14, ra: lerp(30, 50, sm(seg(t, AT.vote, AT.vote + 0.5))), re: 10});
	const vx = 1150, vg = 930, vh = 470, hand = jointAt(vote, 'RHand', vx, vg, vh, true), drop = seg(t, AT.vote + 0.5, AT.vote + 0.9);
	const split = sm(seg(t, AT.split, AT.split + 0.8)), guilty = sm(seg(t, AT.split + 0.9, AT.split + 1.5)), night = sm(seg(t, AT.s2 - 0.3, AT.s2 + 2.0));
	const rows = [{g: 660, h: 220, n: 7, x0: 1260, dx: 96}, {g: 740, h: 250, n: 7, x0: 1230, dx: 100}, {g: 820, h: 280, n: 6, x0: 1300, dx: 104}];
	return <g>
		{/* the sky above the court runs from afternoon into night as we tilt up */}
		<defs><linearGradient id="atSkyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060a1c" /><stop offset="0.5" stopColor="#1c2a4c" /><stop offset="0.8" stopColor="#5f7aa0" /><stop offset="1" stopColor="#f0c890" /></linearGradient></defs>
		<rect x={-100} y={-1300} width={W + 200} height={1700} fill="url(#atSkyR)" />
		{Array.from({length: 90}, (_, i) => <circle key={i} cx={rnd(i, 11) * W} cy={-1250 + rnd(i, 12) * 1250} r={0.8 + 1.6 * rnd(i, 13) ** 3} fill="#eef0ff" opacity={(0.3 + 0.6 * rnd(i, 14)) * (0.6 + 0.4 * Math.sin(t * (1 + 2 * rnd(i, 15)) + i)) * night} />)}
		{/* one small star is the 3 a.m. search box */}
		<g opacity={night} transform={`translate(1240,-640) scale(${1 + 0.6 * sm(seg(t, AT.out - 0.7, AT.out))})`}>
			<Glow x={0} y={0} r={140} c="#9fc8ff" o={0.55 + 0.15 * Math.sin(t * 3)} id="atStar" />
			<rect x={-150} y={-22} width={300} height={44} rx={22} fill="#1b2534" stroke="#9fc8ff" strokeWidth={2} />
			<text x={0} y={8} textAnchor="middle" style={{fontFamily: SANS, fontSize: 19, fontWeight: 500}} fill="#fff">人活着，到底为了什么？</text>
		</g>
		<rect x={0} y={330} width={W} height={470} fill="#4a3a3a" />
		<rect x={0} y={260} width={W} height={70} fill="#d8bf98" /><rect x={0} y={250} width={W} height={12} fill="#b89c78" /><path d="M0,250 L0,226 L1920,226 L1920,250 Z" fill="#8a5a46" />
		{Array.from({length: 15}, (_, i) => { const x = 40 + i * 136; return <g key={i}><rect x={x - 26} y={330} width={52} height={470} fill="#e2c9a0" /><rect x={x + 6} y={330} width={20} height={470} fill="#b99c78" /><rect x={x - 34} y={322} width={68} height={12} fill="#d0b48c" /></g>; })}
		<rect x={0} y={790} width={W} height={290} fill="#8a6e58" /><path d="M0,790 L1920,790" stroke="#5a4636" strokeWidth={3} />
		<Glow x={300} y={500} r={900} c="#ffd49a" o={0.25} id="atSunR" />
		{/* the jurors split into two nearly equal halves; the larger, guilty side lights up; 30 sits in the gap */}
		{rows.map((r, ri) => <g key={ri}>
			<rect x={1160} y={r.g - 4} width={760} height={1080 - r.g} fill={['#5a4434', '#4e3a2e', '#443228'][ri]} />
			{Array.from({length: r.n}, (_, i) => { const left = i < Math.ceil(r.n * 0.56), x = r.x0 + i * r.dx + (ri % 2) * 20 + (left ? -34 : 34) * split, bob = 3 * Math.sin(t * 2 + i + ri);
				return <Rimmed key={i} x={x} ground={r.g + bob * 0} h={r.h} pose={sit} look={{...LK.juror, beard: rnd(i, ri) > 0.3 ? 'full' : undefined, head: rnd(i, ri + 5) > 0.7 ? 'baldf' : 'short'}} flip col={left ? (guilty > 0.5 ? '#2e1414' : '#21181c') : '#21181c'} rim={left ? '#ff9a6a' : '#ffd9a6'} rimOp={0.4 + 0.4 * (left ? guilty : 0)} rimDx={-2.2} />; })}
			<rect x={1160} y={r.g - r.h * 0.37} width={760} height={r.h * 0.06} fill="#3a2a22" />
		</g>)}
		{split > 0 && <g opacity={split}><Glow x={1560} y={560} r={120} c="#ffe2a0" o={0.6} id="at30" /><text x={1560} y={590} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 92}} fill={GOLD} stroke="rgba(0,0,0,0.6)" strokeWidth={6} paintOrder="stroke">30</text></g>}
		<rect x={300} y={868} width={360} height={36} fill="#b89c7c" /><rect x={300} y={868} width={360} height={6} fill="#d8c0a0" />
		<g transform="translate(720,930)"><rect x={-6} y={-150} width={12} height={150} fill="#3a2a22" /><rect x={-50} y={-150} width={100} height={10} fill="#3a2a22" />
			<path d="M-36,-150 Q-46,-200 -26,-220 L26,-220 Q46,-200 36,-150 Z" fill="#a0603a" /><path d="M-22,-62 Q-34,-30 -20,0 L20,0 Q34,-30 22,-62 Z" fill="#a0603a" />
			<path d="M0,-150 L0,-64" stroke="#bcd8e8" strokeWidth={2} strokeDasharray="6 6" strokeDashoffset={-t * 40} opacity={0.8} /></g>
		<Rimmed x={SOC.x} ground={SOC.g} h={SOC.h} pose={socPose(t)} look={LK.socr} col="#16101a" rim="#ffe0b0" rimOp={0.6} />
		{[880, 1000].map((x, i) => <g key={i} transform={`translate(${x},930)`}><path d="M-36,0 Q-58,-60 -30,-108 L30,-108 Q58,-60 36,0 Z" fill="#7a4a30" /><rect x={-34} y={-118} width={68} height={14} rx={4} fill="#5a3422" /></g>)}
		<Rimmed x={vx} ground={vg} h={vh} pose={vote} look={LK.juror} flip col="#14101a" rim="#ffd9a6" rimOp={0.55} />
		{drop > 0 && drop < 1 && <circle cx={lerp(hand[0] - 4, 1000, drop)} cy={lerp(hand[1] + 10, 812, easeIn(drop))} r={7} fill="#e8dcc8" />}
		{/* time-lapse to night over the court */}
		<rect x={-100} y={0} width={W + 200} height={H + 100} fill="#0a1024" opacity={0.6 * night} />
		<g opacity={sm(seg(t, AT.sq + 0.2, AT.sq + 0.8)) * (1 - night)}><text x={W - 60} y={880} textAnchor="end" style={{fontFamily: SANS, fontSize: 24}} fill="#fff" opacity={0.8}>柏拉图《申辩篇》</text></g>
	</g>;
};
const athCam = (t: number, matchS: P2) => { const hp = jointAt(socPose(AT.s1), 'RHand', SOC.x, SOC.g, SOC.h), m = easeOut(seg(t, AT.s1, AT.s1 + 1.4)), d = drift(t);
	const tilt = ease(seg(t, AT.s2, AT.s2 + 2.4)), toStar = easeIn(seg(t, AT.out - 0.9, AT.out));
	const z = lerp(1.18, 1.02, m) * lerp(1, 4.5, toStar);
	const L: P2 = [lerp(lerp(hp[0], 960, m) + d[0], 1240, toStar), lerp(lerp(lerp(hp[1], 540, m), -360, tilt) + d[1], -640, toStar)];
	const S: P2 = [lerp(matchS[0], 960, m), lerp(matchS[1], 540, m)];
	return {z, L, S}; };

/* =============================== DANUBE 66.231–79.815 =============================== */
const DN = {start: M42.danube, m1: LS('M1'), dawn: M42.bump1, mq1: LS('MQ1'), up: M42.bump2, stand: M42.bump2 + 0.9, cloak: M42.bump2 + 1.6, walk0: LS('M2') + 0.2, walk1: M42.bump3 - 1.0, yawn: M42.bump3 - 0.9, door: M42.bump3, out0: M42.bump3 + 0.35, shut: M42.crash};
const LAMP: P2 = [700, 700], BED = {x0: 980, x1: 1500, top: 800}, DOOR = {x: 1620, w: 190, y: 500, h: 400};
const DanubeRoom: React.FC<{t: number}> = ({t}) => {
	const dawn = sm(seg(t, DN.dawn - 0.25, DN.dawn + 0.35)), lampOn = 1 - dawn, open = sm(seg(t, DN.door - 0.1, DN.door + 0.35)) * (1 - easeIn(seg(t, DN.shut - 0.22, DN.shut)));
	const g = 900, mh = 560;
	// Marcus: writing at night → in bed → throws the blanket off → stands, cloak → walks to the door, yawns → out
	const write = fkPose({hip: 0.37, lean: 18, neck: 16, lt: 86, lk: 90, rt: 82, rk: 86, la: 46, le: 64, ra: 50 + 4 * Math.sin(t * 9), re: 66});
	const sitBed = fkPose({hip: 0.2, lean: 14, neck: 6, lt: 100, lk: 150, rt: 96, rk: 146, la: 20, le: 40, ra: 70, re: -30});
	const fasten = fkPose({...STAND, ra: 150, re: 30, la: 120, le: 60, neck: 10});
	const yawn = fkPose({...STAND, neck: -22, lean: -4, ra: 130, re: 70});
	let fig: React.ReactNode = null, cloakOn = t < DN.dawn || t > DN.cloak;
	if (t < DN.dawn) fig = <Rimmed x={560} ground={g} h={mh} pose={write} look={LK.marcus} col="#141018" rim="#ffc890" rimOp={0.6} rimDx={2.2} />;
	else if (t < DN.up) fig = null;   // in bed (drawn with the bed)
	else { const w = walkAt(t, DN.walk0, DN.walk1, 1250, 1560, mh, fkPose(STAND)), out = walkAt(t, DN.out0, DN.shut - 0.25, 1560, 1760, mh, fkPose(STAND));
		let p: Pose = sitBed, x = 1250;
		if (t > DN.stand - 0.4) p = mixPose(sitBed, fkPose(STAND), sm(seg(t, DN.stand - 0.4, DN.stand)));
		if (t > DN.stand && t < DN.walk0) p = mixPose(fkPose(STAND), fasten, Math.sin(Math.PI * seg(t, DN.stand + 0.1, DN.walk0 - 0.1)));
		if (t >= DN.walk0) { p = w.pose; x = w.x; }
		if (t > DN.yawn && t < DN.door) p = mixPose(fkPose(STAND), yawn, Math.sin(Math.PI * seg(t, DN.yawn, DN.door)));
		if (t >= DN.out0) { p = out.pose; x = out.x; }
		const k = 1 - seg(t, DN.shut - 0.5, DN.shut - 0.2);
		fig = <g opacity={k}>{cloakOn ? <Rimmed x={x} ground={g} h={mh} pose={p} look={LK.marcus} col="#141018" rim="#ffd8b0" rimOp={0.5} rimDx={2.2} />
			: <Rimmed x={x} ground={g} h={mh} pose={p} look={{dress: 'tunic', head: 'short', beard: 'full'}} col="#141018" rim="#ffd8b0" rimOp={0.5} rimDx={2.2} />}</g>; }
	// in bed: lying figure + blanket (pulled over the head on MQ1, thrown off on 「我起来」)
	const inBed = t >= DN.dawn - 0.25 && t < DN.up, overHead = sm(seg(t, DN.mq1 + 0.2, DN.mq1 + 0.8)), toss = seg(t, DN.up - 0.15, DN.up + 0.45);
	const lieX = BED.x1 - 20, lieY = BED.top - 34, bx0 = lerp(BED.x0 + 150, BED.x0 + 20, overHead), lump = 6 * Math.sin(t * 2.2);
	return <g>
		{/* stone room */}
		<rect width={W} height={H} fill="#2a2c36" />
		{Array.from({length: 16}, (_, r) => Array.from({length: 13}, (_, c) => <rect key={`${r}_${c}`} x={-40 + c * 160 + (r % 2) * 80} y={r * 58} width={154} height={52} rx={6} fill="#353844" opacity={0.7} />))}
		{/* the high window: night → dawn */}
		<rect x={260} y={190} width={180} height={140} fill={dawn > 0.5 ? '#c8b8c8' : '#0e1428'} />
		<rect x={260} y={190} width={180} height={140} fill="#f0c8a8" opacity={dawn * 0.7} />
		<path d="M350,190 V330 M260,260 H440" stroke="#1a1a22" strokeWidth={10} /><rect x={260} y={190} width={180} height={140} fill="none" stroke="#1a1a22" strokeWidth={14} />
		<path d={`M260,330 L440,330 L${560 + 200 * dawn},900 L${200},900 Z`} fill="#f8d8b8" opacity={0.12 * dawn} />
		<Glow x={LAMP[0]} y={LAMP[1] - 30} r={700} c="#ffb35a" o={0.55 * lampOn} id="dnLampG" />
		<rect width={W} height={H} fill="#0a0c16" opacity={0.25 * (1 - dawn) * 0} />
		{/* the floor, the table with lamp and scroll, the stool, the bed, the door */}
		<rect x={0} y={900} width={W} height={180} fill="#1c1a20" />
		<rect x={600} y={720} width={300} height={16} fill="#3a2a22" /><rect x={620} y={736} width={14} height={164} fill="#3a2a22" /><rect x={866} y={736} width={14} height={164} fill="#3a2a22" />
		<g transform={`translate(${LAMP[0]},${LAMP[1] + 18})`}><ellipse cx={0} cy={0} rx={34} ry={10} fill="#8a5a34" /><path d="M20,-4 L44,-10 L44,2 Z" fill="#8a5a34" /></g>
		{lampOn > 0.02 && <g opacity={lampOn}><path d={`M${LAMP[0] + 42},${LAMP[1] + 6} Q${LAMP[0] + 34 + 3 * Math.sin(t * 13)},${LAMP[1] - 18} ${LAMP[0] + 44},${LAMP[1] - 34 - 4 * Math.sin(t * 9)} Q${LAMP[0] + 54},${LAMP[1] - 12} ${LAMP[0] + 46},${LAMP[1] + 6} Z`} fill="#ffd27a" /><Glow x={LAMP[0] + 44} y={LAMP[1] - 10} r={60} c="#fff0c8" o={0.9} id="dnFl" /></g>}
		{dawn > 0 && dawn < 1 && <Smoke x={LAMP[0] + 44} y={LAMP[1] - 30} s={0.5} col="#c8c0c0" op={0.3 * Math.sin(Math.PI * dawn)} seed={3} id="dnLs" />}
		<g transform="translate(790,712) rotate(-6)"><rect x={-60} y={-8} width={120} height={14} fill="#e8dcbc" /><rect x={-70} y={-11} width={14} height={20} rx={6} fill="#cdb98e" /><rect x={56} y={-11} width={14} height={20} rx={6} fill="#cdb98e" /></g>
		<g transform="translate(560,900)"><path d="M-46,-206 L46,0 M46,-206 L-46,0" stroke="#1a1418" strokeWidth={9} /><rect x={-56} y={-212} width={112} height={12} fill="#1a1418" /></g>
		<rect x={BED.x0} y={BED.top} width={BED.x1 - BED.x0} height={30} fill="#3a2a22" /><rect x={BED.x0 + 10} y={BED.top + 30} width={16} height={70} fill="#3a2a22" /><rect x={BED.x1 - 26} y={BED.top + 30} width={16} height={70} fill="#3a2a22" />
		<rect x={BED.x0 + 10} y={BED.top - 22} width={110} height={24} rx={10} fill="#6a6470" />
		{inBed && <g>
			<g transform={`rotate(-90 ${lieX} ${lieY})`}><Rimmed x={lieX} ground={lieY} h={480} pose={fkPose({...STAND, la: 4, le: 6, ra: 6, re: 8})} look={{dress: 'tunic', head: 'short', beard: 'full'}} col="#141018" rimOp={0.3} /></g>
			<g transform={`translate(${toss * 260},${-Math.sin(Math.PI * toss) * 260 + toss * 120}) rotate(${toss * 40} ${BED.x1} ${BED.top})`} opacity={1 - seg(toss, 0.8, 1)}>
				<path d={`M${bx0},${BED.top + 6} L${bx0},${lieY - 40 - lump} Q${(bx0 + BED.x1) / 2},${lieY - 70 - lump} ${BED.x1 + 10},${lieY - 30} L${BED.x1 + 14},${BED.top + 40} L${bx0 - 6},${BED.top + 40} Z`} fill="#6a4a3a" />
				<path d={`M${bx0 + 30},${lieY - 46} Q${(bx0 + BED.x1) / 2},${lieY - 62 - lump} ${BED.x1 - 30},${lieY - 32}`} stroke="#8a6a54" strokeWidth={3} fill="none" /></g>
		</g>}
		{toss >= 1 && <path d={`M${BED.x1 + 60},900 Q${BED.x1 + 140},860 ${BED.x1 + 240},880 L${BED.x1 + 260},900 Z`} fill="#6a4a3a" />}
		{/* the door: opening shows the camp at dawn, soldiers at their fires */}
		<rect x={DOOR.x - 14} y={DOOR.y - 14} width={DOOR.w + 28} height={DOOR.h + 14} fill="#141218" />
		<g><defs><clipPath id="dnDoorC"><rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} /></clipPath></defs>
			<g clipPath="url(#dnDoorC)"><Plate k="danube" x={DOOR.x - 500} y={DOOR.y - 260} w={1200} h={675} />
				{[[DOOR.x + 40, DOOR.y + 330], [DOOR.x + 140, DOOR.y + 340]].map(([x, y], i) => <g key={i}><Glow x={x} y={y} r={30} c="#ffb04a" o={0.9} id={`dnF${i}`} /><Rimmed x={x + 22} ground={y + 6} h={90} pose={fkPose({...STAND, la: 20 + 10 * Math.sin(t * 3 + i), le: 40})} look={{dress: 'cloak', head: 'bowl'}} flip={i === 1} col="#1a1c24" rimOp={0} /></g>)}
				{[0, 1, 2].map((i) => <Rimmed key={i} x={DOOR.x + 60 + i * 34} ground={DOOR.y + 300} h={60} pose={fkPose(STAND)} look={{dress: 'cloak', head: 'bowl'}} col="#1a1c24" rimOp={0} />)}</g>
			<Glow x={DOOR.x + DOOR.w / 2} y={DOOR.y + DOOR.h / 2} r={500} c="#ffd8b0" o={0.35 * open} id="dnDoorL" />
			<path d={`M${DOOR.x},${DOOR.y + DOOR.h} L${DOOR.x + DOOR.w},${DOOR.y + DOOR.h} L${DOOR.x + DOOR.w + 300 * open},1080 L${DOOR.x - 200 * open},1080 Z`} fill="#ffe0c0" opacity={0.12 * open} />
			{/* the door leaf swings inward (foreshortened) */}
			<g><rect x={DOOR.x} y={DOOR.y} width={DOOR.w * (1 - 0.85 * open)} height={DOOR.h} fill="#4a3424" />{[0.25, 0.5, 0.75].map((u) => <rect key={u} x={DOOR.x + DOOR.w * (1 - 0.85 * open) * u} y={DOOR.y} width={3} height={DOOR.h} fill="#2a1c14" />)}
				<rect x={DOOR.x} y={DOOR.y + 80} width={DOOR.w * (1 - 0.85 * open)} height={10} fill="#2a2a30" /><rect x={DOOR.x} y={DOOR.y + 300} width={DOOR.w * (1 - 0.85 * open)} height={10} fill="#2a2a30" /></g>
		</g>
		{/* his cloak on the peg until he puts it on */}
		{!cloakOn && <path d="M1540,430 L1520,600 L1580,620 L1572,430 Z" fill="#5a2a26" />}
		<rect x={1548} y={420} width={20} height={10} fill="#1a1418" />
		{fig}
		{inBed ? null : null}
		{/* dawn light wash */}
		<rect width={W} height={H} fill="#ffd8c0" opacity={0.05 * dawn} />
	</g>;
};
const dnCam = (t: number) => { const pull = easeOut(seg(t, DN.start, DN.start + 1.4)), d = drift(t), bed = sm(seg(t, DN.dawn - 0.2, DN.dawn + 0.6)) * (1 - sm(seg(t, DN.stand, DN.walk0 + 0.6))), door = sm(seg(t, DN.walk0 + 0.6, DN.door)), shake = Math.exp(-((t - DN.shut) ** 2) / 0.002) * 6;
	const z = lerp(4.5, 1.08, pull) * (1 + 0.12 * bed + 0.08 * door);
	const L: P2 = [lerp(LAMP[0] + 44, lerp(lerp(940, 1220, bed), 1380, door), pull) + d[0] + shake * Math.sin(t * 90), lerp(LAMP[1] - 10, lerp(560, 640, bed), pull) + d[1]];
	return {z, L}; };

/* =============================== the part =============================== */
export const RoughA: React.FC<{t: number}> = ({t}) => {
	// Babylon: the pan from the Nile (25.477–27.08), shore, push to the door, the tablet, the sand out to Lu
	if (t < BAB.tab0) {
		const pan = ease(seg(t, BAB.pan0, BAB.pan1)), X = pan * 3840, blur = Math.sin(Math.PI * pan) * 18;
		const push = ease(seg(t, BAB.bq + 0.2, BAB.tab0)), d = drift(t), zb = lerp(1.0, 1.9, easeIn(push));
		return <g>
			<g style={blur > 0.5 ? {filter: `blur(${blur * 0.5}px)`} : undefined}>
				{X < W && <g transform={`translate(${-X},0)`}><Egypt2 t={t} /></g>}
				{X > 0 && X < 2 * W && <g transform={`translate(${W - X},0)`}><DesertStrip t={t} /></g>}
				{X > 0 && X < 2 * W && <Seam x={W - X} c="#b08878" id="rsm1" />}
				{X > W && <g transform={`translate(${2 * W - X},0)`}><LookCam z={zb} L={[lerp(960, 1420, push) + d[0] * (1 - push), lerp(540, 690, push) + d[1]]} S={[960, 540]}><BabylonShore t={t} /></LookCam></g>}
				{X > W && X < 3 * W && <Seam x={2 * W - X} c="#a07c78" id="rsm2" />}
			</g>
			{push > 0.6 && <rect width={W} height={H} fill="#ffcf8a" opacity={(push - 0.6) * 1.2} />}
		</g>;
	}
	// the tablet (her line glows; the sand) → the sand streams east into Lu's courtyard
	if (t < BAB.lu) {
		const intro = 1 - sm(seg(t, BAB.tab0, BAB.tab0 + 0.4)), pan = ease(seg(t, BAB.out0, BAB.lu)), X = pan * W, d = drift(t);
		return <g>
			<g style={pan > 0.02 && pan < 0.98 ? {filter: `blur(${Math.sin(Math.PI * pan) * 8}px)`} : undefined}>
				<g transform={`translate(${-X},0)`}><LookCam z={lerp(1.0, 1.08, seg(t, BAB.tab0, BAB.out0))} L={[960 + d[0], 540 + d[1]]} S={[960, 540]}><TabletLine t={t} /></LookCam></g>
				{X > 0 && <g transform={`translate(${W - X},0)`}><LookCam {...(() => { const c = luCam(t); return {z: c.z, L: c.L}; })()} S={[960, 540]}><LuScene t={t} /></LookCam></g>}
				{X > 0 && <Seam x={W - X} c="#3a2620" id="rsm3" w={640} />}
			</g>
			<rect width={W} height={H} fill="#ffcf8a" opacity={0.7 * intro} />
		</g>;
	}
	if (t < M42.athens) { const c = luCam(t); return <LookCam z={c.z} L={c.L} S={[960, 540]}><LuScene t={t} /></LookCam>; }
	if (t < M42.danube) {
		// match cut: Socrates's raised hand lands where Confucius's hand was at the cut
		const lc = luCam(M42.athens - 0.001), kh = jointAt(fkPose({hip: 0.655, lean: 4, neck: 0, lt: 4, lk: 4, rt: -5, rk: 4, la: 6, le: 10, ra: 128, re: -10}), 'RHand', 1010, 905, 600, true);
		const matchS: P2 = [960 + (kh[0] - lc.L[0]) * lc.z, 540 + (kh[1] - lc.L[1]) * lc.z];
		const c = athCam(t, matchS), flash = seg(t, M42.danube - 0.3, M42.danube);
		return <g><LookCam z={c.z} L={c.L} S={c.S}><AthensScene t={t} /></LookCam><rect width={W} height={H} fill="#fff4dc" opacity={0.55 * flash} /></g>;
	}
	const c = dnCam(t), flash = 1 - seg(t, M42.danube, M42.danube + 0.3), dark = sm(seg(t, M42.crash - 0.12, M42.crash));
	return <g><LookCam z={c.z} L={c.L} S={[960, 540]}><DanubeRoom t={t} /></LookCam><rect width={W} height={H} fill="#fff4dc" opacity={0.5 * flash} /><rect width={W} height={H} fill="#000" opacity={0.35 * dark} /></g>;
};
void SERIF; void Blur;

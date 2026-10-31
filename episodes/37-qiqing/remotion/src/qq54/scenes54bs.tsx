import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, RimF, Lamel, Sack, P, rnd, f1} from './cao54b';
import {Npc, LampStand} from './npc54b';
import {SIL, KEY, ACC, COOL, PAL, Horse, Rider, Carriage, Banner, GateTower, Trebuchet, Puller, Palisade, Tower, Qun, Store, limb} from './set54bs';
import {CaoBack, CaoSeated, CaoSeatedShadow, IvoryFlame} from './set54bs2';
/* ep54 look B · key scenes owned by the set builder: K4 许都 (196), K5 官渡 (200), K6 the handover frame to the AI drop, K8 洛阳 (220).
   The 马首 铜灯影 grammar: 3–6 cut-out depth planes with haze between them, one key light on its object, warm-black silhouettes rimmed
   by that key; 曹操 alone drawn (cao54b rig, or the set54bs2 variants), with his cool 石青 accent rim #8FD0DC on the back edge.
   Overlay-safe zones kept calm: subtitles x 150–1150 / y 90–300, stamp x 1200–1800 / y 30–200, counter x 150–460 / y 900–1010,
   seal ≈ x 1720–1800 / y 930–1010. */
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
const at = (x: number, y: number, k: number, flip?: boolean) => `translate(${f1(x)},${f1(y)}) scale(${flip ? -k : k},${k})`;
/** a soft cast shadow on the ground, stretched away from the light (dir = +1 to the right) */
const Shadow: React.FC<{x: number; y: number; w: number; len: number; dir?: number; o?: number}> = ({x, y, w, len, dir = 1, o = 0.45}) =>
	<path d={`M${x - w / 2},${y} L${x + w / 2},${y} L${x + w / 2 + dir * len},${y + 6} L${x - w / 2 + dir * len * 0.9},${y + 8} Z`} fill="#0A0706" opacity={o} filter="url(#shb)" />;

/* ================= K4 · 196 许: the emperor's carriage arrives at the gate of 许; 曹操 bows at the roadside ================= */
export const K4: React.FC = () => { const GY = 845, k = 1.15, AX = 760;
	const crenel = Array.from({length: 38}, (_, i) => 962 + i * 26);
	const courses = Array.from({length: 17}, (_, i) => 578 + i * 13.5);
	const pass = (cx: number, w: number, h: number) => <g key={cx}>
		<rect x={cx - w / 2 - 8} y={800 - h - 10} width={w + 16} height={h + 10} fill="#1C1511" />
		<rect x={cx - w / 2} y={800 - h} width={w} height={h} fill="url(#k4psg)" />
		{[0.14, 0.32, 0.68, 0.86].map((u) => <rect key={u} x={cx - w / 2 + w * u - 2} y={800 - h} width={4} height={h} fill="#3A2A1E" opacity={0.5} />)}
		<rect x={cx - w / 2 - 8} y={800 - h - 10} width={w + 16} height={7} fill="#2A1E16" /></g>;
	const caoArm = {sh: [8, 84] as P, el: [24, 200] as P, hd: [92, 222] as P};
	return <Svg>
		<defs>
			<linearGradient id="k4sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E2C33" /><stop offset="0.3" stopColor="#33454A" /><stop offset="0.52" stopColor="#6A7268" /><stop offset="0.64" stopColor="#B5AE94" /><stop offset="0.7" stopColor="#D9CDA8" /></linearGradient>
			<radialGradient id="k4sun" cx="250" cy="662" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF4DC" stopOpacity="0.95" /><stop offset="0.08" stopColor="#F6E4BE" stopOpacity="0.6" /><stop offset="0.35" stopColor="#E4CFA4" stopOpacity="0.22" /><stop offset="1" stopColor="#E4CFA4" stopOpacity="0" /></radialGradient>
			<linearGradient id="k4wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A5A48" /><stop offset="0.25" stopColor="#4E4236" /><stop offset="1" stopColor="#3A3029" /></linearGradient>
			<linearGradient id="k4psg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E4A38" /><stop offset="0.6" stopColor="#B89874" /><stop offset="1" stopColor="#E2C9A0" /></linearGradient>
			<linearGradient id="k4fld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7C7A66" /><stop offset="1" stopColor="#4A4438" /></linearGradient>
			<linearGradient id="k4gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4034" /><stop offset="0.4" stopColor="#30281F" /><stop offset="1" stopColor="#17110D" /></linearGradient>
			<linearGradient id="k4road" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B8A27E" stopOpacity="0.55" /><stop offset="0.5" stopColor="#8A765A" stopOpacity="0.32" /><stop offset="1" stopColor="#6A5A46" stopOpacity="0.22" /></linearGradient>
			<linearGradient id="k4haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9BC9A" stopOpacity="0" /><stop offset="0.6" stopColor="#C9BC9A" stopOpacity="0.4" /><stop offset="1" stopColor="#C9BC9A" stopOpacity="0" /></linearGradient>
			<radialGradient id="k4vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.42" /></radialGradient>
			<Blur id="k4b3" s={3} /><Blur id="k4b1" s={1.1} /><Blur id="k4b6" s={6} /><Blur id="shb" s={3} />
			<RimF id="k4rim" lx={-1} ly={-0.25} k={2.6} c="#FFE0B0" o={0.95} lx2={0.2} ly2={-1} k2={1.6} c2={COOL} o2={0.4} />
			<RimF id="k4rimF" lx={-1} ly={-0.3} k={3.4} c="#FFE0B0" o={0.9} />
			<RimF id="k4hero" lx={-1} ly={-0.3} k={5} c="#FFE6C0" o={0.95} lx2={1} ly2={-0.15} k2={4} c2={ACC} o2={0.95} blur={1} />
			<clipPath id="k4lo"><rect x={-400} y={296} width={800} height={600} /></clipPath>
			<clipPath id="k4up"><rect x={-400} y={-400} width={800} height={708} /></clipPath>
			<clipPath id="k4olo"><rect x={1300} y={700} width={400} height={400} /></clipPath>
			<clipPath id="k4oup"><rect x={1300} y={200} width={400} height={516} /></clipPath>
		</defs>
		{/* P0 sky: the late sun low on the left, thin cloud bars lit from below */}
		<rect width={W} height={H} fill="url(#k4sky)" />
		<rect width={W} height={H} fill="url(#k4sun)" />
		<g filter="url(#k4b6)" opacity={0.6}>
			<ellipse cx={520} cy={520} rx={420} ry={8} fill="#8A8676" /><ellipse cx={980} cy={470} rx={360} ry={7} fill="#6E7268" /><ellipse cx={300} cy={585} rx={300} ry={6} fill="#E8D8B4" />
			<ellipse cx={1500} cy={420} rx={300} ry={7} fill="#56625E" />
		</g>
		<circle cx={250} cy={662} r={36} fill="#FFF6E2" />
		{/* P1 far: low hills and a tree line, hazed */}
		<g filter="url(#k4b3)">
			<path d="M-20,700 C120,676 240,680 360,690 C480,666 640,668 780,684 C880,672 960,676 1000,690 L1000,760 L-20,760 Z" fill="#6E7266" />
			{Array.from({length: 22}, (_, i) => { const x = 30 + i * 44 + rnd(i, 7) * 20, h = 12 + rnd(i, 8) * 14; return <ellipse key={i} cx={x} cy={700 - h * 0.4} rx={10 + rnd(i, 9) * 8} ry={h} fill="#5A5E54" />; })}
		</g>
		<rect x={-20} y={704} width={1020} height={100} fill="url(#k4fld)" />
		<rect y={640} width={W} height={130} fill="url(#k4haze)" />
		{/* P2 the rammed-earth wall of 许 with its 门楼, a corner bastion at the left end, the gate passages lit within */}
		<g filter="url(#k4b1)">
			<rect x={960} y={566} width={980} height={236} fill="url(#k4wall)" />
			{courses.map((y, i) => <path key={i} d={`M960,${y} L1940,${y + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.16} strokeWidth={1.4} />)}
			{courses.map((y, i) => <path key={'h' + i} d={`M960,${y + 2} L1300,${y + 2}`} stroke="#FFE8C0" strokeOpacity={0.07} strokeWidth={1} />)}
			<g fill="#2E261F">{crenel.map((x) => <rect key={x} x={x} y={550} width={16} height={17} />)}<rect x={956} y={562} width={990} height={8} /></g>
			<rect x={950} y={540} width={86} height={262} fill="#5E5040" /><rect x={950} y={540} width={14} height={262} fill="#8C7A60" opacity={0.6} />
			{[0, 1, 2].map((i) => <rect key={i} x={952 + i * 30} y={526} width={18} height={16} fill="#3A3028" />)}
			{pass(1650, 96, 140)}{pass(1512, 68, 108)}{pass(1788, 68, 108)}
			<g transform="translate(1650,566) scale(0.92)"><GateTower win={0.32} wall="#3A3029" dark="#221B16" roof="#262A2A" /></g>
		</g>
		{/* P3 ground: the road to the gate, the sun's long light along it */}
		<rect y={800} width={W} height={H - 800} fill="url(#k4gnd)" />
		<path d={`M-20,812 L1940,808 L1940,872 L-20,890 Z`} fill="url(#k4road)" />
		<rect y={790} width={W} height={60} fill="url(#k4haze)" opacity={0.6} />
		{/* the procession (all silhouettes), moving right to the gate: 汉 banners at the rear, a rider, 戟 men, the carriage, the vanguard at the gate */}
		{[[330, 1], [430, -1], [610, 1], [665, 1], [AX, 1], [1120, 1], [1600, 1], [1660, 1], [1720, 1]].map(([x], i) => <Shadow key={i} x={x} y={GY} w={60} len={140} />)}
		<g fill={SIL} color={SIL} filter="url(#k4rim)">
			{[1600, 1662, 1724].map((x, i) => <Npc key={x} x={x} y={832} k={1.0} kind="ji" stride={i % 2 ? -0.5 : 0.5} />)}
			{[300, 400].map((x, i) => <g key={x}><Npc x={x} y={GY} k={k} kind="hold" stride={i ? -0.4 : 0.4} /><g transform={at(x + 30 * k, GY - 10, k)}><Banner h={430} ch="汉" wave={i ? 6 : -4} cloth="#4A1E1A" clothS="#2A110E" ink="#E8D2A6" /></g></g>)}
			<g transform={at(520, GY - 4, k)}><Horse pose={1} tail="free" /><g transform="translate(18,2)"><Rider kind="ji" /></g></g>
			{[628, 676].map((x, i) => <Npc key={x} x={x} y={GY} k={k} kind="ji" stride={i ? 0.5 : -0.5} />)}
			<g transform={at(AX + 170 * k, GY - 8 * k, k)}><Horse pose={1} harness farFill="#2A1E18" /></g>
			<g transform={at(AX, GY, k)}><Carriage yx={210} /></g>
			<g transform={at(AX + 160 * k, GY, k)}><Horse pose={0} harness /></g>
			<Npc x={1176} y={GY - 4} k={k * 0.98} kind="ji" stride={0.5} />
		</g>
		{/* P4 foreground: 曹操 (42, court robe, 武冠) bows toward the carriage; an officer behind him does the same */}
		<Shadow x={1500} y={968} w={80} len={180} o={0.5} />
		<g fill={SIL} filter="url(#k4rimF)">
			<g clipPath="url(#k4olo)"><Npc x={1500} y={968} k={2.5} kind="hold" flip /></g>
			<g transform="rotate(-20 1500 708)"><g clipPath="url(#k4oup)"><Npc x={1500} y={968} k={2.5} kind="hold" flip /></g></g>
		</g>
		<Shadow x={1340} y={1012} w={120} len={240} o={0.55} />
		<g filter="url(#k4hero)">
			<g transform={`translate(1340,${1012 - 750 * 0.6}) scale(-0.6,0.6)`}>
				<g clipPath="url(#k4lo)"><Cao pal={PAL} id="k4a" old armour={false} arm={caoArm} dao={false} /><path d="M-30,300 L-18,298 L-12,520 L-24,524 Z" fill="#5A4266" /><path d="M-30,300 L-26,300 L-21,522 L-24,524 Z" fill="#33243C" /></g>
				<g transform="rotate(19 0 300)"><g clipPath="url(#k4up)"><Cao pal={PAL} id="k4b" old armour={false} arm={caoArm} dao={false} /></g></g>
			</g>
		</g>
		{/* P5 the near verge, out of focus */}
		<g filter="url(#k4b6)" fill="#0C0806">
			<path d="M-20,1080 L-20,1030 C80,1020 200,1036 320,1048 C420,1056 520,1060 600,1080 Z" />
			<path d="M1940,1080 L1940,1040 C1860,1046 1780,1060 1720,1080 Z" />
		</g>
		<rect width={W} height={H} fill="url(#k4vig)" />
	</Svg>; };

/* ================= K5 · 200 官渡: 不满一万 against 十余万 ================= */
/** one rank of a massed army as a single silhouette: shoulders and heads along the top, a forest of spears above, banners here and there */
const Crowd: React.FC<{y: number; k: number; seed: number; ban: number; spear?: number}> = ({y, k, seed, ban, spear = 0.55}) => { const sp = 46 * k, n = Math.ceil(2000 / sp);
	let d = `M-40,${f1(y + 6)} `;
	const tops: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const x = -40 + i * sp + (rnd(i, seed) - 0.5) * sp * 0.6, hy = y - (150 + rnd(i, seed + 1) * 22) * k, sw = y - (128 + rnd(i, seed + 1) * 18) * k;
		d += `L${f1(x)},${f1(sw)} L${f1(x + sp * 0.28)},${f1(hy + 6 * k)} Q${f1(x + sp * 0.5)},${f1(hy - 8 * k)} ${f1(x + sp * 0.72)},${f1(hy + 6 * k)} L${f1(x + sp)},${f1(sw)} `;
		const r = rnd(i, seed + 2);
		if (r < spear) { const sx = x + sp * (0.3 + rnd(i, seed + 3) * 0.4), top = y - (290 + rnd(i, seed + 4) * 110) * k, ln = (rnd(i, seed + 5) - 0.5) * 30 * k;
			tops.push(<g key={i}><line x1={sx} y1={hy} x2={sx + ln} y2={top} stroke="currentColor" strokeWidth={Math.max(1, 2.6 * k)} /><path d={`M${f1(sx + ln)},${f1(top - 20 * k)} L${f1(sx + ln - 3 * k)},${f1(top + 2)} L${f1(sx + ln + 3 * k)},${f1(top + 2)} Z`} />
				{rnd(i, seed + 6) < ban / spear && <path d={`M${f1(sx + ln + 1)},${f1(top + 6 * k)} L${f1(sx + ln + 62 * k)},${f1(top + 8 * k)} L${f1(sx + ln + 64 * k)},${f1(top + 140 * k)} L${f1(sx + ln + 1)},${f1(top + 138 * k)} Z`} fill="#3E2016" />}</g>); } }
	d += `L1960,${f1(y + 6)} Z`;
	return <g><path d={d} />{tops}</g>; };
/** a hemp grain sack, nearly empty: grain only in the bottom, the slack cloth above creased and sagging, the tied neck flopped over;
    base centre (x, y), height h */
const EmptySack: React.FC<{x: number; y: number; h: number; flip?: boolean}> = ({x, y, h, flip}) => { const w = h * 0.9, id = `es${Math.round(x)}`;
	const X = (u: number) => f1(u * w), Y = (v: number) => f1(-v * h);
	const body = `M${X(-0.48)},0 C${X(-0.58)},${Y(0.2)} ${X(-0.5)},${Y(0.4)} ${X(-0.32)},${Y(0.47)} C${X(-0.24)},${Y(0.52)} ${X(-0.28)},${Y(0.6)} ${X(-0.16)},${Y(0.67)} C${X(-0.08)},${Y(0.72)} ${X(-0.02)},${Y(0.7)} ${X(0.04)},${Y(0.75)} L${X(0.1)},${Y(0.82)} L${X(0.18)},${Y(0.83)} C${X(0.3)},${Y(0.82)} ${X(0.4)},${Y(0.76)} ${X(0.4)},${Y(0.66)} L${X(0.33)},${Y(0.64)} C${X(0.3)},${Y(0.7)} ${X(0.24)},${Y(0.72)} ${X(0.18)},${Y(0.72)} C${X(0.26)},${Y(0.62)} ${X(0.36)},${Y(0.54)} ${X(0.42)},${Y(0.44)} C${X(0.56)},${Y(0.28)} ${X(0.57)},${Y(0.1)} ${X(0.5)},0 Z`;
	return <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
		<defs><clipPath id={id}><path d={body} /></clipPath></defs>
		<path d={body} fill="#7A6247" />
		<g clipPath={`url(#${id})`}>
			<path d={`M${X(-0.7)},${Y(1)} L${X(-0.12)},${Y(1)} C${X(-0.22)},${Y(0.5)} ${X(-0.18)},${Y(0.2)} ${X(-0.24)},4 L${X(-0.7)},4 Z`} fill="#4A3826" />
			<path d={`M${X(0.2)},${Y(0.46)} C${X(0.42)},${Y(0.36)} ${X(0.5)},${Y(0.2)} ${X(0.44)},0 L${X(0.6)},0 L${X(0.6)},${Y(0.5)} Z`} fill="#B8996C" />
			<path d={`M${X(0.12)},${Y(0.82)} C${X(0.26)},${Y(0.8)} ${X(0.36)},${Y(0.74)} ${X(0.4)},${Y(0.66)} L${X(0.5)},${Y(0.7)} L${X(0.4)},${Y(0.9)} Z`} fill="#B8996C" />
			{[0.5, 0.56, 0.62, 0.68].map((v, i) => <path key={v} d={`M${X(-0.4)},${Y(v + (i % 2) * 0.02)} C${X(-0.14)},${Y(v + 0.05)} ${X(0.1)},${Y(v - 0.03)} ${X(0.4)},${Y(v + 0.02)}`} fill="none" stroke="#3A2A1A" strokeOpacity={0.55} strokeWidth={1.5} />)}
			<path d={`M${X(-0.44)},${Y(0.2)} C${X(-0.1)},${Y(0.26)} ${X(0.2)},${Y(0.24)} ${X(0.5)},${Y(0.18)}`} fill="none" stroke="#3A2A1A" strokeOpacity={0.25} strokeWidth={1.2} />
		</g>
		<path d={`M${X(0.08)},${Y(0.78)} C${X(0.12)},${Y(0.76)} ${X(0.18)},${Y(0.76)} ${X(0.22)},${Y(0.79)}`} fill="none" stroke="#2A1C10" strokeWidth={h * 0.035} strokeLinecap="round" />
	</g>; };
export const K5: React.FC = () => { const HZ = 640;
	const pickets: [number, number, number][] = [[40, 712, 0.3], [180, 706, 0.26], [330, 716, 0.32], [520, 708, 0.27], [700, 718, 0.33], [880, 707, 0.26], [1150, 720, 0.34], [1330, 709, 0.28], [1500, 718, 0.32], [1690, 706, 0.26], [1850, 716, 0.31]];
	const volleys: [P, P, P][] = [[[1420, 290], [1060, 230], [720, 800]], [[1530, 290], [1180, 210], [900, 860]], [[1850, 330], [1500, 260], [1220, 930]]];
	const qp = (a: P, c: P, b: P, u: number): P => { const m = 1 - u; return [m * m * a[0] + 2 * m * u * c[0] + u * u * b[0], m * m * a[1] + 2 * m * u * c[1] + u * u * b[1]]; };
	return <Svg>
		<defs>
			<linearGradient id="k5sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16222B" /><stop offset="0.3" stopColor="#2A3A40" /><stop offset="0.48" stopColor="#56605A" /><stop offset="0.56" stopColor="#9C9884" /><stop offset="0.6" stopColor="#D2C5A2" /></linearGradient>
			<radialGradient id="k5glow" cx="1450" cy="640" r="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.7" /><stop offset="0.25" stopColor="#E8D6AE" stopOpacity="0.28" /><stop offset="1" stopColor="#E8D6AE" stopOpacity="0" /></radialGradient>
			<linearGradient id="k5fld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E3C34" /><stop offset="1" stopColor="#24211C" /></linearGradient>
			<linearGradient id="k5camp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C251E" /><stop offset="0.5" stopColor="#1E1814" /><stop offset="1" stopColor="#120D0A" /></linearGradient>
			<linearGradient id="k5haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9AE8E" stopOpacity="0" /><stop offset="0.55" stopColor="#B9AE8E" stopOpacity="0.45" /><stop offset="1" stopColor="#B9AE8E" stopOpacity="0" /></linearGradient>
			<linearGradient id="k5mound" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1A1613" /><stop offset="0.7" stopColor="#24201B" /><stop offset="1" stopColor="#3A322A" /></linearGradient>
			<radialGradient id="k5pool" cx="1150" cy="1000" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.16" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<radialGradient id="k5vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<Blur id="k5b2" s={2} /><Blur id="k5b1" s={0.8} /><Blur id="k5b6" s={6} /><Blur id="shb" s={3} />
			<RimF id="k5rimFar" lx={1} ly={-0.4} k={1.4} c="#FFE6BE" o={0.75} />
			<RimF id="k5rim" lx={1} ly={-0.35} k={2.4} c="#FFE0B0" o={0.9} lx2={-0.3} ly2={-1} k2={1.4} c2={COOL} o2={0.4} />
			<RimF id="k5hero" lx={1} ly={-0.35} k={5} c="#FFE6C0" o={0.95} lx2={-1} ly2={-0.15} k2={4} c2={ACC} o2={0.95} blur={1} />
			<Lamel pal={PAL} />
		</defs>
		{/* P0 dusk: the light has gone down behind 袁绍's lines */}
		<rect width={W} height={H} fill="url(#k5sky)" />
		<rect width={W} height={H} fill="url(#k5glow)" />
		<g filter="url(#k5b6)" opacity={0.55}><ellipse cx={1250} cy={430} rx={520} ry={8} fill="#7A7A6C" /><ellipse cx={600} cy={380} rx={420} ry={7} fill="#4E5A5A" /><ellipse cx={1500} cy={560} rx={380} ry={6} fill="#EADCB8" /></g>
		{/* P1 the far camp of 袁绍 to both edges: tents, hazed */}
		<g fill="#3A3630" filter="url(#k5b2)" opacity={0.8}>
			{Array.from({length: 70}, (_, i) => { const x = -20 + i * 28.6 + rnd(i, 21) * 10, h = 10 + rnd(i, 22) * 8; return <path key={i} d={`M${x - h},${HZ - 20} L${x},${HZ - 20 - h} L${x + h},${HZ - 20} Z`} />; })}
			<rect x={-20} y={HZ - 22} width={1960} height={30} />
		</g>
		{/* P2 the 土山 (piled earth, terraced, with ramps) and their 高橹 full of archers */}
		<g fill="url(#k5mound)" color="#1E1916" filter="url(#k5rimFar)">
			<path d="M110,652 L170,620 L200,618 L240,592 L420,590 L470,618 L500,620 L570,652 Z" />
			<path d="M1150,664 L1230,610 L1262,606 L1330,520 L1366,516 L1392,480 L1568,480 L1600,520 L1640,524 L1700,606 L1730,610 L1800,664 Z" />
			<path d="M1610,668 L1690,604 L1716,600 L1790,516 L1960,512 L1960,668 Z" />
		</g>
		<path d="M1270,606 L1350,520 L1362,520 L1284,606 Z" fill="#000" opacity={0.25} />
		<g fill="#1E1916" color="#1E1916" filter="url(#k5rimFar)">
			<g transform="translate(330,592) scale(0.36)"><Tower archers={3} /></g>
			<g transform="translate(1426,482) scale(0.64)"><Tower archers={4} /></g>
			<g transform="translate(1540,482) scale(0.64)"><Tower archers={4} /></g>
			<g transform="translate(1860,514) scale(0.56)"><Tower archers={3} /></g>
		</g>
		{/* the sea of 袁 spears and banners, rank behind rank, off both edges */}
		<g fill="#2A2420" color="#2A2420" filter="url(#k5b1)"><Crowd y={650} k={0.085} seed={31} ban={0.12} /></g>
		<g fill="#221D19" color="#221D19" filter="url(#k5b1)"><Crowd y={662} k={0.11} seed={41} ban={0.1} /></g>
		<g fill="#1A1512" color="#1A1512"><Crowd y={676} k={0.145} seed={51} ban={0.09} /></g>
		<g fill="#16110E" color="#16110E" filter="url(#k5rimFar)"><Crowd y={694} k={0.19} seed={61} ban={0.07} spear={0.5} /></g>
		<rect y={620} width={W} height={60} fill="url(#k5haze)" opacity={0.35} />
		{/* the forward pickets: 袁 banners at the near edge of their lines */}
		<g fill="#140F0C" color="#140F0C" filter="url(#k5rimFar)">
			{pickets.map(([x, y, kk], i) => <g key={x}><g transform={at(x, y, kk)}><Banner h={470 + (i % 3) * 30} w={84} ch="袁" cloth="#4A2A1A" clothS="#2E180F" ink="#DCC49A" wave={i % 2 ? 6 : -5} /></g>
				<Npc x={x - 24 * kk * 3} y={y} k={kk} kind="ji" flip={i % 3 === 0} /><Npc x={x + 30 * kk * 3} y={y + 2} k={kk * 0.96} kind="ji" /></g>)}
		</g>
		{/* the open ground between, a trench line, the arrows coming in */}
		<rect y={698} width={W} height={124} fill="url(#k5fld)" />
		<path d="M-20,752 C400,748 900,754 1940,750 L1940,758 C900,762 400,756 -20,760 Z" fill="#0E0B09" opacity={0.6} />
		{volleys.map(([a, c, b], i) => <g key={i}>{[0.42, 0.52, 0.6, 0.7, 0.78].map((u, j) => { const p0 = qp(a, c, b, u + (j % 2) * 0.012), p1 = qp(a, c, b, u + 0.03 + (j % 2) * 0.012), ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI, off = (j - 2) * 9;
			return <g key={j} transform={`translate(${f1(p0[0] + off)},${f1(p0[1] - off * 0.4)}) rotate(${f1(ang)})`}><line x1={-26} y1={0} x2={0} y2={0} stroke="#1A1410" strokeWidth={1.6} /><path d="M0,-2.4 L6,0 L0,2.4 Z" fill="#1A1410" /><path d="M-26,0 L-31,-3 M-26,0 L-31,3" stroke="#1A1410" strokeWidth={1.2} /></g>; })}</g>)}
		{/* P3 曹操's palisade (营栅): logs side by side, sharpened */}
		<rect y={684} width={W} height={70} fill="url(#k5haze)" opacity={0.75} />
		<g fill="#120D0A" filter="url(#k5rim)"><Palisade x0={-30} x1={1950} y={818} h={98} gap={13} w={14} seed={5} /></g>
		{/* P4 the camp: a 霹雳车 being hauled, its stone in the sling; one 曹 banner; nearly empty grain sacks */}
		<rect y={814} width={W} height={H - 814} fill="url(#k5camp)" />
		<rect width={W} height={H} fill="url(#k5pool)" />
		<Shadow x={520} y={905} w={240} len={-140} dir={-1} o={0.4} />
		<g fill={SIL} color={SIL} filter="url(#k5rim)">
			<g transform={at(520, 905, 0.62)}><Trebuchet a={-112} ropes={[[180, -162], [234, -158], [286, -162], [344, -158], [396, -162], [450, -158]]} /></g>
			{[628, 662, 694, 730, 762, 796].map((x, i) => <g key={x} transform={at(x + 18, 905 + (i % 2) * 4, 0.62, true)}><Puller lean={0.6 + (i % 3) * 0.25} /></g>)}
			<g transform={at(822, 892, 0.52)}><Banner h={440} w={70} ch="曹" cloth="#4E1E18" clothS="#2C100C" ink="#EAD4A8" wave={-6} /></g>
			<Npc x={808} y={892} k={0.52} kind="hold" />
			{[884, 936].map((x) => <g key={x}><Npc x={x} y={884} k={0.5} kind="hold" /><path d={`M${x + 15},${884 - 98} l16,-5 l3,52 l-16,5 Z`} /></g>)}
		</g>
		{/* a stone from the other engine already in flight toward the towers */}
		<g><circle cx={1000} cy={350} r={8} fill="#1A1410" /><path d="M992,354 L930,380" stroke="#EADCC0" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" /></g>
		{/* the rampart (土垒) he stands on: a rammed-earth bank inside the palisade, its top lit by the sky */}
		<path d="M860,1014 C1000,1010 1500,1010 1760,1016 L1800,1080 L820,1080 Z" fill="#2A221B" />
		{[1030, 1046, 1062].map((y) => <path key={y} d={`M${850 - (y - 1014) * 0.4},${y} L${1772 + (y - 1014) * 0.4},${y}`} stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} />)}
		<path d="M860,1014 C1000,1010 1500,1010 1760,1016" fill="none" stroke="#E8D8B4" strokeOpacity={0.3} strokeWidth={2} />
		{/* arrows stuck in the camp ground */}
		{[[1240, 1048, 24], [1300, 1062, 30], [1560, 1040, 18], [760, 975, 26], [980, 1000, 22], [1640, 1062, 28], [1190, 1000, 34]].map(([x, y, a], i) => <g key={i} transform={`translate(${x},${y}) rotate(${a})`}><rect x={-1.2} y={-46} width={2.4} height={46} fill="#1A120E" /><path d="M-1.2,-46 L-6,-54 M1.2,-46 L6,-54" stroke="#CBB898" strokeOpacity={0.5} strokeWidth={1.4} /></g>)}
		{/* the sacks: slack, the empty cloth folded over the little grain left; an empty one lying flat; the 斛 tipped, empty */}
		<EmptySack x={1330} y={1050} h={100} />
		<EmptySack x={1430} y={1044} h={112} flip />
		<EmptySack x={1530} y={1056} h={92} />
		<path d="M1600,1068 C1612,1052 1644,1046 1680,1052 C1696,1056 1694,1066 1680,1070 Z" fill="#6A5640" /><path d="M1604,1066 C1630,1058 1656,1058 1680,1064" fill="none" stroke="#3A2A1A" strokeWidth={2} opacity={0.6} />
		{Array.from({length: 12}, (_, i) => <ellipse key={i} cx={1590 + rnd(i, 81) * 100} cy={1068 + rnd(i, 82) * 8} rx={2} ry={1.2} fill="#C8B080" opacity={0.7} />)}
		<g transform="translate(1238,1062) rotate(-78)"><path d="M-26,0 L26,0 L22,-40 L-22,-40 Z" fill="#5A4430" /><path d="M-26,0 L-12,0 L-10,-40 L-22,-40 Z" fill="#3A2A1C" /><path d="M14,0 L26,0 L22,-40 L12,-40 Z" fill="#8A6E4E" /><path d="M-22,-40 L22,-40 L23,-44 L-23,-44 Z" fill="#2A1C12" /></g>
		{/* 曹操 (46, 札甲, greying short beard) on the rampart, looking across */}
		<Shadow x={1070} y={1016} w={130} len={-200} dir={-1} o={0.5} />
		<g filter="url(#k5hero)">
			<g transform={`translate(1070,${1016 - 750 * 0.6}) scale(0.6)`}>
				<Cao pal={PAL} id="k5c" old armour arm={{sh: [10, 84], el: [22, 200], hd: [54, 266]}} cape={0.4} />
			</g>
		</g>
		<rect width={W} height={H} fill="url(#k5vig)" />
	</Svg>; };

/* ================= K6 · 1:40.2 · the handover frame: night, 曹操 leads the 5,000 out with torches toward 乌巢 ================= */
const COL: P[] = [[985, 986], [900, 962], [826, 932], [740, 893], [676, 856], [650, 820], [676, 790], [730, 765], [748, 742], [700, 722], [610, 706], [510, 692], [430, 679], [370, 666], [326, 654], [292, 643], [266, 633], [248, 624]];
const colAt = (u: number): P => { const n = COL.length - 1, s = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(s), t = s - i, a = COL[i], b = COL[i + 1];
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
export const K6: React.FC = () => { const HZ = 612, kOf = (y: number) => 0.0025 * (y - HZ + 6);
	const men = Array.from({length: 190}, (_, i) => { const u = Math.pow(i / 189, 0.62), [x, y] = colAt(u), kk = kOf(y), side = (i % 2 ? 1 : -1) * 22 * kk;
		return {x: x + side, y: y + (i % 2 ? 1.5 : -1.5) * kk, k: kk, torch: i % 3 !== 1, i}; });
	const near = men.filter((m) => m.k > 0.2).sort((a, b) => a.y - b.y), far = men.filter((m) => m.k <= 0.2).reverse();
	const S = 3.5, CX = 1236, CY = 1022;
	return <Svg>
		<defs>
			<linearGradient id="k6sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#111B22" /><stop offset="0.3" stopColor="#1C2A32" /><stop offset="0.48" stopColor="#2E3E44" /><stop offset="0.57" stopColor="#4A5856" /></linearGradient>
			<radialGradient id="k6moon" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#DCE4DA" stopOpacity="0.4" /><stop offset="0.3" stopColor="#9FB8B6" stopOpacity="0.14" /><stop offset="1" stopColor="#9FB8B6" stopOpacity="0" /></radialGradient>
			<linearGradient id="k6pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E4A48" /><stop offset="0.3" stopColor="#2C3534" /><stop offset="1" stopColor="#1A2020" /></linearGradient>
			<linearGradient id="k6rise" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C2020" /><stop offset="1" stopColor="#0C0E0E" /></linearGradient>
			<linearGradient id="k6haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E7670" stopOpacity="0" /><stop offset="0.6" stopColor="#6E7670" stopOpacity="0.42" /><stop offset="1" stopColor="#6E7670" stopOpacity="0" /></linearGradient>
			<radialGradient id="k6fg"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.4" /><stop offset="0.3" stopColor="#F3DDB4" stopOpacity="0.2" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<radialGradient id="k6key" cx="1426" cy="350" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.3" /><stop offset="0.4" stopColor="#F3DDB4" stopOpacity="0.1" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<radialGradient id="k6vig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.58" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
			<Blur id="k6b2" s={2.2} /><Blur id="k6b1" s={1} /><Blur id="k6b6" s={7} />
			<RimF id="k6rimN" lx={0.6} ly={-0.8} k={2} c="#FFE2B4" o={0.85} lx2={-1} ly2={-0.3} k2={1.4} c2={COOL} o2={0.35} />
			<RimF id="k6hero" lx={0.75} ly={-0.65} k={5} c="#FFE6C0" o={0.95} lx2={-1} ly2={-0.25} k2={4.5} c2={ACC} o2={0.95} blur={1} />
		</defs>
		{/* P0 night sky, a low moon behind cloud, a few stars */}
		<rect width={W} height={H} fill="url(#k6sky)" />
		{Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i, 61) * W} cy={30 + rnd(i, 62) * 420} r={0.6 + rnd(i, 63)} fill="#E8EEE6" opacity={0.2 + rnd(i, 64) * 0.4} />)}
		<circle cx={760} cy={420} r={170} fill="url(#k6moon)" />
		<path d="M760,402 A18,18 0 1 0 760,438 A14,18 0 1 1 760,402 Z" fill="#DCE2D8" transform="rotate(-25 760 420)" />
		<g filter="url(#k6b6)" opacity={0.6}><ellipse cx={700} cy={430} rx={300} ry={7} fill="#3C4C50" /><ellipse cx={1300} cy={480} rx={420} ry={8} fill="#36464A" /><ellipse cx={420} cy={520} rx={360} ry={6} fill="#40504E" /></g>
		{/* P1 the horizon: our camp far left (where the column comes from), 乌巢 far right: 囷 granaries, raised stores, a palisade, unlit */}
		<g filter="url(#k6b2)">
			<path d="M-20,616 C300,606 700,610 1000,614 C1300,612 1600,606 1940,612 L1940,640 L-20,640 Z" fill="#2A3433" />
			<g fill="#222B2B"><rect x={150} y={600} width={210} height={12} />{Array.from({length: 22}, (_, i) => <path key={i} d={`M${150 + i * 10},612 L${153 + i * 10},596 L${156 + i * 10},612 Z`} />)}</g>
			{[176, 236, 300, 338].map((x, i) => <circle key={x} cx={x} cy={602 - i % 2 * 3} r={2} fill="#F3DDB4" opacity={0.5} />)}
			<g transform="translate(0,616)">
				<g fill="#2E3A39">{Array.from({length: 44}, (_, i) => <path key={i} d={`M${1452 + i * 9},0 L${1455 + i * 9},-22 L${1458 + i * 9},0 Z`} />)}<rect x={1450} y={-15} width={400} height={3} /></g>
				{[[1508, 0.34], [1580, 0.4], [1720, 0.36], [1790, 0.3]].map(([x, s]) => <g key={x} transform={`translate(${x},-4) scale(${s})`}><Qun drum="#3A4644" thatch="#313C3A" edge="#6A7672" /></g>)}
				<g transform="translate(1650,-2) scale(0.3)"><Store body="#36423F" roof="#2C3634" /></g>
				<g fill="#2C3634"><rect x={1470} y={-78} width={3.4} height={76} /><rect x={1486} y={-78} width={3.4} height={76} /><rect x={1464} y={-86} width={32} height={9} /><path d="M1458,-86 L1502,-86 L1490,-98 L1470,-98 Z" /></g>
				<circle cx={1480} cy={-82} r={2.2} fill="#F3DDB4" opacity={0.5} /><circle cx={1652} cy={-16} r={1.8} fill="#F3DDB4" opacity={0.4} />
			</g>
		</g>
		<rect y={570} width={W} height={90} fill="url(#k6haze)" />
		{/* P2 the plain */}
		<path d="M-20,622 C400,618 900,622 1940,620 L1940,1080 L-20,1080 Z" fill="url(#k6pl)" />
		<rect y={640} width={W} height={120} fill="url(#k6haze)" opacity={0.45} />
		{/* the column of 5,000: far — only torch points on the snaking road, then small figures with torches */}
		<g>{far.map((m) => <g key={m.i}>
			<rect x={m.x - 12 * m.k} y={m.y - 160 * m.k} width={Math.max(1, 24 * m.k)} height={160 * m.k} fill="#0E1112" opacity={0.6} />
			{m.torch && <><circle cx={m.x + 20 * m.k} cy={m.y - 165 * m.k} r={Math.max(5, 90 * m.k)} fill="url(#k6fg)" /><ellipse cx={m.x + 20 * m.k} cy={m.y - 168 * m.k} rx={Math.max(0.8, 6 * m.k)} ry={Math.max(1.2, 10 * m.k)} fill="#FFF2D8" /></>}
		</g>)}</g>
		<g fill="#120E0C" color="#120E0C" filter="url(#k6rimN)">
			{near.map((m) => <Npc key={m.i} x={m.x} y={m.y} k={m.k} kind={m.torch ? 'torch' : 'ji'} stride={m.i % 2 ? 0.5 : -0.5} />)}
		</g>
		{near.filter((m) => m.torch).map((m) => <IvoryFlame key={m.i} id={`k6f${m.i}`} x={m.x + 31 * m.k} y={m.y - 151 * m.k} s={15 * m.k} glow={0.5} t={m.i} />)}
		{/* P3 the low rise he has climbed */}
		<path d="M-20,1080 L-20,1010 C200,1000 520,968 760,958 C900,950 1060,980 1200,1008 C1380,1020 1600,1016 1940,1030 L1940,1080 Z" fill="url(#k6rise)" />
		<path d="M760,958 C900,950 1060,980 1200,1008 C1380,1020 1600,1016 1940,1030" fill="none" stroke="#8FA4A2" strokeOpacity={0.18} strokeWidth={2} />
		{Array.from({length: 30}, (_, i) => { const x = 680 + i * 42 + rnd(i, 71) * 20, y = 1000 + (x > 1200 ? (x - 1200) * 0.01 : (1200 - x) * -0.0) + 8 + rnd(i, 72) * 30; return <path key={i} d={`M${x},${y} l${-3 + rnd(i, 73) * 6},${-10 - rnd(i, 74) * 10}`} stroke="#252B2B" strokeWidth={2} />; })}
		<rect width={W} height={H} fill="url(#k6key)" />
		{/* P4 曹操 from behind, the torch raised toward 乌巢 */}
		<ellipse cx={CX + 10} cy={CY + 4} rx={90} ry={10} fill="#050606" opacity={0.6} />
		<g filter="url(#k6hero)"><g transform={at(CX, CY, S)}><CaoBack id="k6c" /></g></g>
		<IvoryFlame id="k6hf" x={CX + 54.6 * S} y={CY - 195 * S} s={34} glow={1.1} />
		<rect width={W} height={H} fill="url(#k6vig)" />
	</Svg>; };

/* ================= K8 · 220 洛阳: the last night; one lamp; he writes his 遗令 on bamboo slips ================= */
export const K8: React.FC = () => { const FY = 900, k = 4.1, CX = 820, LX = 1330, LY = 896, LK = 4.0;
	const flame: P = [LX, LY - 124 * LK];
	return <Svg>
		<defs>
			<radialGradient id="k8lamp" cx={flame[0]} cy={flame[1]} r="1200" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.55" /><stop offset="0.18" stopColor="#E9CB98" stopOpacity="0.3" /><stop offset="0.55" stopColor="#B08A64" stopOpacity="0.08" /><stop offset="1" stopColor="#B08A64" stopOpacity="0" /></radialGradient>
			<linearGradient id="k8wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#241D19" /><stop offset="1" stopColor="#3A2F27" /></linearGradient>
			<linearGradient id="k8floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2D23" /><stop offset="1" stopColor="#15100C" /></linearGradient>
			<linearGradient id="k8win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C4248" /><stop offset="1" stopColor="#5F716A" /></linearGradient>
			<linearGradient id="k8beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9FB8B6" stopOpacity="0.2" /><stop offset="1" stopColor="#9FB8B6" stopOpacity="0" /></linearGradient>
			<radialGradient id="k8pool" cx={LX - 120} cy="930" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.3" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<radialGradient id="k8vig" cx="0.56" cy="0.52" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<radialGradient id="k8lg"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.5" /><stop offset="0.3" stopColor="#F3DDB4" stopOpacity="0.16" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<Blur id="k8b2" s={2.4} /><Blur id="k8b10" s={14} /><Blur id="k8b8" s={8} /><Blur id="k8b5" s={5} /><Blur id="k8b4" s={4} /><Blur id="k8b25" s={2.5} />
			<radialGradient id="k8wash" cx="1000" cy="460" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#E9CB98" stopOpacity="0.2" /><stop offset="0.6" stopColor="#E9CB98" stopOpacity="0.1" /><stop offset="1" stopColor="#E9CB98" stopOpacity="0" /></radialGradient>
			<RimF id="k8rim" lx={1} ly={-0.3} k={2.4} c="#FFE0B0" o={0.85} />
			<RimF id="k8hero" lx={1} ly={-0.4} k={4} c="#FFE6C0" o={0.95} lx2={-1} ly2={-0.2} k2={3.4} c2={ACC} o2={0.9} blur={0.9} />
		</defs>
		{/* P0 the back wall (plastered), lit by the lamp's falloff; the timber frame */}
		<rect width={W} height={780} fill="url(#k8wall)" />
		<rect width={W} height={H} fill="url(#k8lamp)" />
		<rect x={0} y={0} width={W} height={56} fill="#18110D" /><rect x={0} y={56} width={W} height={22} fill="#221812" />
		<rect x={0} y={22} width={W} height={26} fill="#3A1A15" opacity={0.85} />
		{Array.from({length: 24}, (_, i) => <path key={i} d={`M${20 + i * 82},40 c10,-14 26,-14 32,0 c5,10 -8,16 -13,8 M${58 + i * 82},30 c6,-6 14,-6 18,0`} fill="none" stroke="#9A6A40" strokeOpacity={0.35} strokeWidth={2} />)}<rect x={0} y={76} width={W} height={3} fill="#E9CB98" opacity={0.12} />
		{[80, 1780].map((x) => <g key={x}><rect x={x} y={56} width={64} height={724} fill="#1C140F" /><rect x={x + (x < 900 ? 52 : 0)} y={56} width={12} height={724} fill="#E9CB98" opacity={x < 900 ? 0.06 : 0.16} /></g>)}
		{/* the latticed window (直棂窗) with the cold night outside, its light across the floor */}
		<rect x={222} y={316} width={340} height={318} fill="#1A1410" />
		<rect x={236} y={330} width={312} height={290} fill="url(#k8win)" />
		{Array.from({length: 13}, (_, i) => <rect key={i} x={236 + i * 24} y={330} width={7} height={290} fill="#1A1410" />)}
		<rect x={236} y={468} width={312} height={7} fill="#1A1410" />
		<path d="M236,640 L548,640 L760,1080 L360,1080 Z" fill="url(#k8beam)" filter="url(#k8b5)" />
		{/* the curtain (帷) gathered at the left post */}
		<path d="M144,56 C176,200 168,380 196,560 C200,620 186,700 176,780 L144,780 Z" fill="#3A1C17" />
		<path d="M144,56 C160,220 150,420 168,600 L156,780 L144,780 Z" fill="#24110E" />
		<path d="M1780,56 C1740,240 1752,420 1720,600 C1712,680 1722,740 1730,780 L1780,780 Z" fill="#4A2219" />
		<path d="M1752,140 C1740,300 1744,460 1724,620" fill="none" stroke="#2A120E" strokeWidth={6} opacity={0.7} />
		{/* P1 his lamp shadow on the plastered wall behind him (the look's 灯影), and a folding screen (屏风) at the right: black lacquer, red border */}
		<rect x={560} y={80} width={1300} height={700} fill="url(#k8wash)" />
		<g transform={`translate(${CX - 210},782) scale(${k * 1.25},${k * 1.08})`} fill="#140C08" color="#140C08" opacity={0.6} filter="url(#k8b25)"><CaoSeatedShadow /></g>
		<g>
			<rect x={1440} y={452} width={300} height={330} fill="#17110E" />
			{[0, 1].map((i) => <g key={i}><rect x={1440 + i * 150} y={452} width={150} height={330} fill="none" stroke="#5A2420" strokeWidth={6} />
				<path d={`M${1466 + i * 150},${540} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${1480 + i * 150},${660} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#8A4430" strokeOpacity={0.45} strokeWidth={3} /></g>)}
			<rect x={1440} y={452} width={300} height={330} fill="url(#k8lamp)" opacity={0.5} />
			{[1456, 1724].map((x) => <rect key={x} x={x - 8} y={780} width={16} height={16} fill="#100B08" />)}
		</g>
		{/* P2 the floor, the mat (席), the lamp's pool */}
		<rect y={780} width={W} height={H - 780} fill="url(#k8floor)" />
		{Array.from({length: 7}, (_, i) => <path key={i} d={`M0,${800 + i * i * 6 + i * 14} L${W},${800 + i * i * 6 + i * 14}`} stroke="#000" strokeOpacity={0.2} strokeWidth={1.5} />)}
		<rect width={W} height={H} fill="url(#k8pool)" />
		<path d={`M600,${FY - 22} L1180,${FY - 22} L1210,${FY} L570,${FY} Z`} fill="#4E4030" />
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${600 + i * 19.6},${FY - 22} L${570 + i * 21.3},${FY}`} stroke="#2A2018" strokeOpacity={0.5} strokeWidth={1.2} />)}
		<rect x={570} y={FY} width={640} height={7} fill="#2A2018" />
		<path d={`M600,${FY - 22} L1180,${FY - 22}`} stroke="#F3DDB4" strokeOpacity={0.18} strokeWidth={2} />
		{/* the low desk (案) with the slips: a roll at the far end, the open slips across the top, an inkstone */}
		<g>
			<path d={`M${CX + 22 * k},${FY - 33 * k} L${CX + 106 * k},${FY - 33 * k} L${CX + 110 * k},${FY - 30 * k} L${CX + 20 * k},${FY - 30 * k} Z`} fill="#5A3A26" />
			<path d={`M${CX + 22 * k},${FY - 33 * k} L${CX + 106 * k},${FY - 33 * k} L${CX + 100 * k},${FY - 39 * k} L${CX + 28 * k},${FY - 39 * k} Z`} fill="#6E4A30" />
			<rect x={CX + 20 * k} y={FY - 30 * k} width={90 * k} height={3.4 * k} fill="#2A1A10" />
			<rect x={CX + 20 * k} y={FY - 30 * k} width={90 * k} height={0.8 * k} fill="#F3DDB4" opacity={0.25} />
			{[[25, -1], [104, 1]].map(([x, f]) => <path key={x} d={`M${CX + (x - 2.2) * k},${FY - 27 * k} L${CX + (x + 2.2) * k},${FY - 27 * k} C${CX + (x + 2) * k},${FY - 14 * k} ${CX + (x + 1.6 + f) * k},${FY - 6 * k} ${CX + (x + 2.6 + f * 2) * k},${FY - 1.4 * k} L${CX + (x + 2.6 + f * 2) * k},${FY} L${CX + (x - 2.4 + f * 1.4) * k},${FY} L${CX + (x - 1.4 + f) * k},${FY - 2 * k} C${CX + (x - 1.6) * k},${FY - 8 * k} ${CX + (x - 2) * k},${FY - 16 * k} ${CX + (x - 2.2) * k},${FY - 27 * k} Z`} fill="#24170F" />)}
			{/* the open slips laid across the top: pale bamboo strips bound by two cords */}
			{Array.from({length: 24}, (_, i) => { const x0 = CX + (34 + i * 2.1) * k; return <path key={i} d={`M${x0},${FY - 33.4 * k} L${x0 + 2.5 * k},${FY - 38.6 * k} L${x0 + 4.3 * k},${FY - 38.6 * k} L${x0 + 1.8 * k},${FY - 33.4 * k} Z`} fill={i % 2 ? '#CDB88A' : '#BCA676'} />; })}
			<path d={`M${CX + 34 * k},${FY - 35 * k} L${CX + 85 * k},${FY - 35 * k} M${CX + 35 * k},${FY - 37.2 * k} L${CX + 86 * k},${FY - 37.2 * k}`} stroke="#5A3A26" strokeWidth={0.5 * k} />
			{Array.from({length: 14}, (_, i) => { const x0 = CX + (36 + i * 2.1) * k; return <path key={i} d={`M${x0 + 1.4 * k},${FY - 34.4 * k} L${x0 + 2.4 * k},${FY - 36.4 * k} M${x0 + 2.6 * k},${FY - 36.8 * k} L${x0 + 3.2 * k},${FY - 38 * k}`} stroke="#2A1A10" strokeWidth={0.45 * k} opacity={i < 9 ? 0.75 : 0} />; })}
			{/* the rest of the bundle, still rolled (seen end-on), and a flat inkstone with its grinder */}
			<circle cx={CX + 93 * k} cy={FY - 40.6 * k} r={6.4 * k} fill="#B49E70" />
			<path d={`M${CX + 93 * k},${FY - 40.6 * k} m${-1 * k},0 a${1 * k},${1 * k} 0 1 1 ${2 * k},0 a${2.2 * k},${2.2 * k} 0 1 1 ${-4.4 * k},0 a${3.4 * k},${3.4 * k} 0 1 1 ${6.8 * k},0 a${4.6 * k},${4.6 * k} 0 1 1 ${-9.2 * k},0 a${5.8 * k},${5.8 * k} 0 1 1 ${11.6 * k},0`} fill="none" stroke="#6E5638" strokeWidth={0.5 * k} />
			<path d={`M${CX + 99.4 * k},${FY - 40.6 * k} A${6.4 * k},${6.4 * k} 0 0 1 ${CX + 93 * k},${FY - 34.2 * k}`} fill="none" stroke="#F3DDB4" strokeOpacity={0.5} strokeWidth={0.6 * k} />
			<rect x={CX + 20.5 * k} y={FY - 35.6 * k} width={10 * k} height={2.4 * k} fill="#141416" /><rect x={CX + 20.5 * k} y={FY - 35.6 * k} width={10 * k} height={0.5 * k} fill="#8A8A86" opacity={0.6} />
			<rect x={CX + 23 * k} y={FY - 37.6 * k} width={2.6 * k} height={2 * k} fill="#2A2A2C" />
		</g>
		{/* the lamp on its stand (the one key) */}
		<g fill="#140D0A" filter="url(#k8rim)"><LampStand x={LX} y={LY} k={LK} /></g>
		<circle cx={flame[0]} cy={flame[1]} r={170} fill="url(#k8lg)" />
		{/* P3 曹操 at 66, kneeling, writing */}
		<g filter="url(#k8hero)"><g transform={at(CX, FY - 22 * 0.2, k)}><CaoSeated id="k8c" /></g></g>
		{/* P4 the near edge: a dark post out of focus at the right */}
		<g filter="url(#k8b10)" fill="#0A0605"><rect x={1880} y={-20} width={80} height={1120} /></g>
		<rect width={W} height={H} fill="url(#k8vig)" />
	</Svg>; };
void KEY; void limb;

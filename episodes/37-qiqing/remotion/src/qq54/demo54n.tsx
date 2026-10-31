import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, Head, RimF, Lamel, Pal, P, f1, rnd} from './cao54b';
import {LampStand} from './npc54b';
import {NpcWalk, Flame, flick, npcWalk} from './rig54b';
import {SIL, ACC, PAL, Horse, Rider, Banner} from './set54bs';
import {npcTorsoT, Helmet, band, Kneeler, CaoKneel, Dong, CaoStand, Smoke, BoyWalk, sstep, cl01} from './fig54n';
/* ep54 demo · new scenes in look B (铜灯影 · 主角刻画): t = FILM time (s).
   Huangjin = card 5 (16.59–20.57, 184 颍川, dusk): 曹操 30, 骑都尉 in 札甲 + 武冠, on a rise before his horsemen; the plain full of
     黄巾 (muted ochre headbands), smoke columns rising over the villages one after another; slow lateral drift.
   Dongzhuo = card 6 (20.57–24.56, 189 洛阳 palace hall): cold light from high windows; 董卓 massive on the dais points; the boy
     emperor is led away by two armoured guards; officials kneel bowed in rows; 曹操 (进贤冠) alone lifts his face; slow push.
   Lv = card 8 (28.54–32.53, 189, a farmhouse near 成皋 at night): 曹操 back-lit in the doorway, a drawn 环首刀 lowered, his face half
     in shadow; an overturned lamp burning on the ground; the lamplight flickers; a slow uneasy push. No bodies, no blood.
   Overlay zones kept calm: subtitles x 150–1150 / y 90–300, stamp x 1200–1800 / y 30–200, counter x 150–460 / y 900–1010. */
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
const at = (x: number, y: number, k: number, flip?: boolean) => `translate(${f1(x)},${f1(y)}) scale(${(flip ? -k : k).toFixed(3)},${k.toFixed(3)})`;
const OCHRE = '#9A7E46', OCHRE_S = '#6E5A32';

/* =============================== card 5 · 黄巾 · 184 颍川 · dusk =============================== */
/** a far crowd as one silhouette band: shoulders and heads, poles and a few pennants, an ochre headband on each head */
const Mass: React.FC<{y: number; k: number; x0: number; x1: number; seed: number; fill: string}> = ({y, k, x0, x1, seed, fill}) => {
	const sp = 34 * k, n = Math.ceil((x1 - x0) / sp);
	let d = `M${f1(x0)},${f1(y + 4)} `; const bands: React.ReactNode[] = [], poles: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const x = x0 + i * sp + (rnd(i, seed) - 0.5) * sp * 0.5, hy = y - (160 + rnd(i, seed + 1) * 22) * k, sw = y - (128 + rnd(i, seed + 1) * 16) * k;
		d += `L${f1(x)},${f1(sw)} L${f1(x + sp * 0.3)},${f1(hy + 7 * k)} Q${f1(x + sp * 0.5)},${f1(hy - 7 * k)} ${f1(x + sp * 0.7)},${f1(hy + 7 * k)} L${f1(x + sp)},${f1(sw)} `;
		bands.push(<rect key={i} x={f1(x + sp * 0.3)} y={f1(hy + 2 * k)} width={f1(sp * 0.42)} height={f1(Math.max(1.3, 6 * k))} />);
		if (rnd(i, seed + 2) < 0.22) { const px = x + sp * 0.5, top = y - (300 + rnd(i, seed + 3) * 90) * k, ln = (rnd(i, seed + 4) - 0.5) * 30 * k;
			poles.push(<g key={i}><line x1={f1(px)} y1={f1(hy)} x2={f1(px + ln)} y2={f1(top)} stroke={fill} strokeWidth={Math.max(1, 2.4 * k)} />
				{rnd(i, seed + 5) < 0.35 && <path d={`M${f1(px + ln)},${f1(top)} L${f1(px + ln + 50 * k)},${f1(top + 4 * k)} L${f1(px + ln + 48 * k)},${f1(top + 34 * k)} L${f1(px + ln)},${f1(top + 30 * k)} Z`} fill={OCHRE_S} />}</g>); } }
	d += `L${f1(x1 + 40)},${f1(y + 4)} Z`;
	return <g><g fill={fill}><path d={d} /></g>{poles}<g fill={OCHRE} opacity={0.85}>{bands}</g></g>; };
type Reb = {x: number; y: number; k: number; dir: 1 | -1; L: number; f: number; t0: number; kind: 'plain' | 'torch'; flag: boolean; i: number};
const REB: Reb[] = Array.from({length: 30}, (_, i) => { const y = 750 + rnd(i, 11) * 96, k = 0.0029 * (y - 640) + 0.005, dir: 1 | -1 = rnd(i, 12) < 0.7 ? 1 : -1;
	return {x: (dir > 0 ? 820 : 1300) + rnd(i, 13) * 1000, y, k, dir, L: 60 + rnd(i, 14) * 12, f: 1.6 + rnd(i, 15) * 0.5, t0: rnd(i, 16) * 2, kind: (i % 3 === 0 ? 'torch' : 'plain') as 'plain' | 'torch', flag: i % 5 === 0, i}; }).sort((a, b) => a.y - b.y);
const VIL: {x: number; s: number; h: number; w: number; start: number}[] = [
	{x: 230, s: 0.8, h: 290, w: 34, start: -99}, {x: 600, s: 1, h: 380, w: 42, start: 17.55}, {x: 900, s: 0.9, h: 400, w: 40, start: -99},
	{x: 1240, s: 1.1, h: 430, w: 46, start: 16.9}, {x: 1530, s: 0.85, h: 380, w: 38, start: 18.3}, {x: 1830, s: 1, h: 420, w: 44, start: -99}, {x: 2080, s: 0.9, h: 380, w: 40, start: 19.0}];
const Village: React.FC<{x: number; s: number}> = ({x, s}) => <g fill="#34322C">
	{[-46, -18, 12, 40].map((dx, i) => { const w = (20 + rnd(i, x) * 12) * s, h = (10 + rnd(i, x + 1) * 7) * s, X = x + dx * s;
		return <g key={i}><rect x={f1(X - w / 2)} y={f1(640 - h)} width={f1(w)} height={f1(h)} /><path d={`M${f1(X - w / 2 - 4 * s)},${f1(640 - h)} L${f1(X)},${f1(640 - h - 9 * s)} L${f1(X + w / 2 + 4 * s)},${f1(640 - h)} Z`} /></g>; })}
	<ellipse cx={x + 60 * s} cy={634} rx={14 * s} ry={9 * s} /></g>;
export const Huangjin: React.FC<{t: number}> = ({t}) => {
	const u = t - 16.59, cam = -40 + 20 * u, sx = (p: number) => f1(-cam * p);
	const SUNX = 1560, SUNY = 598;
	const S = 0.5, CX = 1085, CY = 962, HX = 600, HY = 946, HK = 2.05;
	const cape = 0.36 + 0.12 * Math.sin(t * 1.9) + 0.05 * Math.sin(t * 4.3 + 1), tilt = 3 + 3 * sstep(17.4, 19.2, t);
	return <Svg>
		<defs>
			<linearGradient id="n1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18232B" /><stop offset="0.3" stopColor="#2B363A" /><stop offset="0.47" stopColor="#4C504A" /><stop offset="0.56" stopColor="#77705F" /><stop offset="0.6" stopColor="#8C7F68" /></linearGradient>
			<radialGradient id="n1sun" cx={SUNX} cy={SUNY} r="980" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#E9D6AE" stopOpacity="0.62" /><stop offset="0.1" stopColor="#D9C29A" stopOpacity="0.32" /><stop offset="0.42" stopColor="#B49C78" stopOpacity="0.1" /><stop offset="1" stopColor="#B49C78" stopOpacity="0" /></radialGradient>
			<linearGradient id="n1pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E5546" /><stop offset="0.35" stopColor="#3C362D" /><stop offset="1" stopColor="#1E1A16" /></linearGradient>
			<linearGradient id="n1haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A89A80" stopOpacity="0" /><stop offset="0.55" stopColor="#A89A80" stopOpacity="0.42" /><stop offset="1" stopColor="#A89A80" stopOpacity="0" /></linearGradient>
			<linearGradient id="n1ridge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#26201B" /><stop offset="1" stopColor="#15110E" /></linearGradient>
			<linearGradient id="n1rise" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C1713" /><stop offset="1" stopColor="#0C0907" /></linearGradient>
			<radialGradient id="n1emb"><stop offset="0" stopColor="#8E5C3C" stopOpacity="0.55" /><stop offset="0.5" stopColor="#7A5038" stopOpacity="0.2" /><stop offset="1" stopColor="#7A5038" stopOpacity="0" /></radialGradient>
			<radialGradient id="n1vig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.48" /></radialGradient>
			<Blur id="n1b2" s={2} /><Blur id="n1b3" s={3} /><Blur id="n1sm" s={7} /><Blur id="n1b14" s={14} /><Blur id="n1b6" s={6} />
			<RimF id="n1rimFar" lx={1} ly={-0.4} k={1.2} c="#D8BC8E" o={0.6} />
			<RimF id="n1rim" lx={1} ly={-0.35} k={2.2} c="#E0C292" o={0.85} lx2={-0.3} ly2={-1} k2={1.2} c2="#9FB8B6" o2={0.3} />
			<RimF id="n1hero" lx={1} ly={-0.35} k={5} c="#F2D6AA" o={0.92} lx2={-1} ly2={-0.15} k2={4} c2={ACC} o2={0.95} blur={1} />
			<clipPath id="n1body"><rect x={-400} y={52} width={900} height={800} /></clipPath>
			<Lamel pal={PAL} />
		</defs>
		{/* P0 dusk sky; the sun low and veiled by the smoke on the right (the key) */}
		<rect width={W} height={H} fill="url(#n1sky)" />
		<rect width={W} height={H} fill="url(#n1sun)" />
		<g transform={`translate(${sx(0.03)},0)`}><circle cx={SUNX} cy={SUNY} r={30} fill="#EEDCB6" opacity={0.55} filter="url(#n1b2)" /></g>
		{/* the smoke pall drifting over the whole sky */}
		<g filter="url(#n1b14)">{[[300, 420, 520, 26, 0.32], [900, 360, 600, 22, 0.28], [1500, 450, 520, 24, 0.34], [1950, 380, 480, 22, 0.3], [700, 520, 700, 18, 0.25]].map(([x, y, rx, ry, o], i) =>
			<ellipse key={i} cx={f1(x - u * (7 + i * 1.5) - cam * 0.06)} cy={y} rx={rx} ry={ry} fill="#3A3530" opacity={o} />)}</g>
		{/* P1 the horizon: low hills, the villages, a smoke column over each (several catch one after another), dull ember glows */}
		<g transform={`translate(${sx(0.15)},0)`}>
			<g filter="url(#n1b2)"><path d="M-200,642 C100,628 300,630 520,636 C760,622 1000,626 1240,636 C1500,624 1800,628 2300,636 L2300,660 L-200,660 Z" fill="#4A4840" /></g>
			{VIL.map((v, i) => { const vis = cl01((t - v.start) * 1.2); return <g key={i}>
				{vis > 0 && <ellipse cx={v.x} cy={636} rx={90 * v.s} ry={26 * v.s} fill="url(#n1emb)" opacity={vis * (0.8 + 0.2 * Math.sin(t * 2.3 + i * 1.7))} />}
				<Village x={v.x} s={v.s} /></g>; })}
			<g filter="url(#n1sm)">{VIL.map((v, i) => <Smoke key={i} x={v.x + 10} y={632} h={v.h * 1.1} w={v.w * 1.35} t={t} seed={i + 3} start={v.start} drift={170} rate={0.15} o={0.95} />)}</g>
		</g>
		<rect y={600} width={W} height={110} fill="url(#n1haze)" />
		{/* P2 the plain */}
		<path d="M-20,646 L1940,646 L1940,1080 L-20,1080 Z" fill="url(#n1pl)" />
		<ellipse cx={1500 + Number(sx(0.3))} cy={690} rx={700} ry={60} fill="#C8B28A" opacity={0.12} filter="url(#n1b6)" />
		{/* far masses of 黄巾 across the plain, drifting */}
		<g transform={`translate(${f1(Number(sx(0.3)) + u * 5)},0)`} filter="url(#n1rimFar)"><Mass y={684} k={0.11} x0={380} x1={2200} seed={3} fill="#2E2822" /></g>
		<g transform={`translate(${f1(Number(sx(0.38)) + u * 7)},0)`} filter="url(#n1rimFar)"><Mass y={712} k={0.16} x0={700} x1={2300} seed={7} fill="#241E1A" /></g>
		<rect y={660} width={W} height={90} fill="url(#n1haze)" opacity={0.5} />
		{/* P3 the near plain: rebels in loose streams, headbands, staves and pennants */}
		<g transform={`translate(${sx(0.55)},0)`}>
			{REB.map((r) => { const hx0 = npcWalk(r.t0, r.L, r.f).hipX, X = r.x - r.dir * r.k * hx0, w = Math.sin(t * 9 + r.i);
				return <g key={r.i} transform={at(X, r.y, r.k, r.dir < 0)} fill="#16110E" filter="url(#n1rimFar)">
					<NpcWalk t={u} kind={r.kind} L={r.L} f={r.f} t0={r.t0} lean={6} swing={1.2} />
					<g transform={npcTorsoT(u, r.L, r.f, r.t0, 6)}>
						<path d={band(w)} fill={OCHRE} />
						{r.kind === 'torch' && <path d="M21,-116 L39,-262 L41.8,-261.6 L24,-115 Z" />}
						{r.flag && <path d={`M40,-258 C52,${f1(-258 + w * 3)} 62,${f1(-252 - w * 3)} 74,${f1(-254 + w * 2)} L72,${f1(-226 + w * 2)} C60,${f1(-224 - w * 3)} 50,${f1(-230 + w * 3)} 38,-230 Z`} fill={OCHRE_S} />}
					</g>
				</g>; })}
		</g>
		{/* P4 the ridge behind him: his horsemen at rest, a banner, 戟 upright */}
		<g transform={`translate(${sx(0.8)},0)`}>
			<path d="M-200,834 C100,824 460,820 760,830 C900,840 1000,872 1120,930 L1120,1080 L-200,1080 Z" fill="url(#n1ridge)" />
			<g fill="#1E1814" color="#1E1814" filter="url(#n1rim)">
				<g transform={at(70, 826, 1.0)}><Horse pose={0} tail="free" /><g transform="translate(18,2)"><Rider kind="ji" /></g></g>
				<g transform={at(470, 828, 1.04)}><Horse pose={1} tail="knot" /><g transform="translate(18,2)"><Rider kind="ji" /></g></g>
			</g>
			<g fill="#160F0C" color="#160F0C" filter="url(#n1rim)">
				<g transform={at(270, 838, 1.12)}><Horse pose={1} tail="knot" /><g transform="translate(18,2)"><Rider kind="plain" /></g></g>
				<g transform={at(270 + 40 * 1.12, 838 - 160 * 1.12, 1.12)}><Banner h={250} w={56} ch="曹" cloth="#4A1D18" clothS="#2A100D" ink="#D9C49C" wave={5 * Math.sin(t * 2.1)} /></g>
			</g>
		</g>
		{/* P5 the rise: his horse beside him, 曹操 (30, 骑都尉: 札甲, cape, 武冠, a light moustache) looking over the plain */}
		<g transform={`translate(${sx(1)},0)`}>
			<path d="M-200,958 C200,946 700,944 1040,956 C1200,964 1340,994 1520,1080 L-200,1080 Z" fill="url(#n1rise)" />
			<path d="M-200,958 C200,946 700,944 1040,956 C1200,964 1340,994 1520,1080" fill="none" stroke="#C8AE84" strokeOpacity={0.22} strokeWidth={2} />
			{Array.from({length: 26}, (_, i) => { const x = -100 + i * 60 + rnd(i, 31) * 30, y = 955 + rnd(i, 32) * 10 + (x > 1040 ? (x - 1040) * 0.25 : 0); return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(-4 + rnd(i, 33) * 8)},${f1(-10 - rnd(i, 34) * 12)} M${f1(x + 5)},${f1(y)} l${f1(2 + rnd(i, 35) * 6)},${f1(-8 - rnd(i, 36) * 8)}`} stroke="#2A231C" strokeWidth={2} />; })}
			<ellipse cx={HX + 30} cy={HY + 4} rx={260} ry={12} fill="#060403" opacity={0.5} />
			<g fill="#120D0A" color="#120D0A" filter="url(#n1rim)"><g transform={at(HX, HY, HK)}><Horse pose={1} tail="free" /></g></g>
			<ellipse cx={CX - 30} cy={CY + 3} rx={110} ry={9} fill="#060403" opacity={0.55} />
			<g filter="url(#n1hero)"><g transform={`translate(${CX},${f1(CY - 750 * S)}) scale(${S})`}>
				<g clipPath="url(#n1body)"><Cao pal={PAL} id="n1c" old={false} armour arm={{sh: [10, 84], el: [22, 200], hd: [54, 266]}} cape={cape} /></g>
				<g transform={`translate(0,49) rotate(${f1(tilt)} 0 -8) scale(0.88) translate(0,-40)`}><Head old={false} mid pal={PAL} id="n1h" cap="wu" /></g>
			</g></g>
		</g>
		{/* near grass, out of focus */}
		<g transform={`translate(${sx(1.35)},0)`} filter="url(#n1b6)" fill="#0A0806">
			<path d="M1560,1080 C1600,1040 1680,1030 1760,1044 C1840,1036 1900,1050 1990,1080 Z" />
			{Array.from({length: 14}, (_, i) => <path key={i} d={`M${1600 + i * 26},1060 l${f1(-10 + rnd(i, 41) * 20)},${f1(-40 - rnd(i, 42) * 40)} l6,0 Z`} />)}
		</g>
		<rect width={W} height={H} fill="url(#n1vig)" />
	</Svg>; };

/* =============================== card 6 · 董卓废立 · 189 洛阳 · the palace hall =============================== */
const ROWA = Array.from({length: 11}, (_, i) => ({x: 60 + i * 92 + (rnd(i, 51) - 0.5) * 14, bow: 22 + rnd(i, 52) * 8, hb: 10 + rnd(i, 53) * 10, i}));
const ROWB = Array.from({length: 9}, (_, i) => ({x: 30 + i * 128 + (rnd(i, 54) - 0.5) * 16, bow: 20 + rnd(i, 55) * 10, hb: 12 + rnd(i, 56) * 8, i})).filter((r) => Math.abs(r.x - 700) > 40);
export const Dongzhuo: React.FC<{t: number}> = ({t}) => {
	const u = t - 20.57, FX = 1000, FY = 580;
	const Z = (p: number) => { const z = 1 + 0.017 * u * p; return `translate(${FX},${FY}) scale(${z.toFixed(5)}) translate(${-FX},${-FY})`; };
	const pt = sstep(20.95, 21.8, t), lift = sstep(21.35, 22.25, t);
	/* the procession: guards (k 0.95) and the boy (k 0.76) walk left at the same pace, 85.5 px/s */
	const GK = 1.1, GL = 54, GF = 1.3, BK = 0.84, BL = 44, BF = GL * GF * GK / (BL * BK), WY = 716;
	const walker = (x0: number, k: number, L: number, f: number, t0: number, lean: number) => { const hx0 = npcWalk(t0, L, f).hipX; return {T: at(x0 + k * hx0, WY, k, true), torso: npcTorsoT(u, L, f, t0, lean)}; };
	const g1 = walker(1000, GK, GL, GF, 0.21, 3), boy = walker(1074, BK, BL, BF, 0.05, 5), g2 = walker(1150, GK, GL, GF, 0.47, 3);
	const flA = flick(t, 13), DK = 1.75, DX = 1420, DY = 738;
	return <Svg>
		<defs>
			<linearGradient id="n2wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14181B" /><stop offset="0.6" stopColor="#1E2426" /><stop offset="1" stopColor="#262C2C" /></linearGradient>
			<radialGradient id="n2lit" cx="860" cy="610" r="560" gradientUnits="userSpaceOnUse" gradientTransform="translate(860 610) scale(1 0.62) translate(-860 -610)"><stop offset="0" stopColor="#8EA6A4" stopOpacity="0.5" /><stop offset="0.45" stopColor="#6E8684" stopOpacity="0.2" /><stop offset="1" stopColor="#6E8684" stopOpacity="0" /></radialGradient>
			<linearGradient id="n2win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9C0BE" /><stop offset="1" stopColor="#E2ECE6" /></linearGradient>
			<linearGradient id="n2shaft" x1="0.85" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#D6E6E2" stopOpacity="0.3" /><stop offset="0.6" stopColor="#C2D6D2" stopOpacity="0.12" /><stop offset="1" stopColor="#C2D6D2" stopOpacity="0" /></linearGradient>
			<linearGradient id="n2floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C3231" /><stop offset="0.4" stopColor="#1C2020" /><stop offset="1" stopColor="#0E1010" /></linearGradient>
			<radialGradient id="n2pool" cx="900" cy="760" r="520" gradientUnits="userSpaceOnUse" gradientTransform="translate(900 760) scale(1 0.3) translate(-900 -760)"><stop offset="0" stopColor="#B8CCC8" stopOpacity="0.26" /><stop offset="1" stopColor="#B8CCC8" stopOpacity="0" /></radialGradient>
			<radialGradient id="n2door" cx="0.5" cy="0.8" r="0.7"><stop offset="0" stopColor="#5E7270" stopOpacity="0.9" /><stop offset="1" stopColor="#1A2020" stopOpacity="1" /></radialGradient>
			<radialGradient id="n2vig" cx="0.52" cy="0.5" r="0.76"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="n2b2" s={2} /><Blur id="n2b8" s={8} /><Blur id="n2b16" s={16} /><Blur id="n2b1" s={1} />
			<RimF id="n2rimK" lx={0.55} ly={-1} k={1.6} c="#AFC6C4" o={0.6} />
			<RimF id="n2rimW" lx={0.4} ly={-1} k={1.5} c="#CCDCD8" o={0.75} lx2={-1} ly2={0} k2={1.2} c2="#CCDCD8" o2={0.45} />
			<RimF id="n2rimD" lx={0.5} ly={-1} k={3} c="#D8E8E4" o={0.9} lx2={1} ly2={-0.2} k2={2.6} c2="#A8C2BE" o2={0.75} />
			<RimF id="n2hero" lx={1} ly={-0.7} k={4.5} c="#DCEAE6" o={0.92} lx2={-1} ly2={-0.2} k2={3.6} c2={ACC} o2={0.9} blur={1} />
		</defs>
		{/* P0 the back wall of the hall: beams and brackets, red-lacquered pillars, curtains, the high windows (the key), a side door */}
		<g transform={Z(0.55)}>
			<rect x={-200} y={-200} width={2320} height={920} fill="url(#n2wall)" />
			<rect x={-200} y={300} width={2320} height={420} fill="url(#n2lit)" />
			<rect x={300} y={404} width={124} height={300} fill="#0E1112" /><rect x={308} y={412} width={108} height={292} fill="url(#n2door)" />
			{[1240, 1600].map((x) => <g key={x}><rect x={x - 10} y={198} width={300} height={132} fill="#120F0D" /><rect x={x} y={208} width={280} height={112} fill="url(#n2win)" />
				{Array.from({length: 15}, (_, i) => <rect key={i} x={x + 4 + i * 18.6} y={208} width={6} height={112} fill="#120F0D" />)}<rect x={x} y={258} width={280} height={6} fill="#120F0D" /></g>)}
			<rect x={-200} y={-200} width={2320} height={262} fill="#0F0C0B" />
			{Array.from({length: 24}, (_, i) => <g key={i} fill="#100D0B"><rect x={-40 + i * 86} y={62} width={34} height={20} /><rect x={-54 + i * 86} y={80} width={62} height={10} /></g>)}
			<rect x={-200} y={90} width={2320} height={14} fill="#16110F" />
			{[210, 690, 1170].map((x) => <g key={x}><rect x={x} y={100} width={54} height={610} fill="#2C1411" /><rect x={x + 44} y={100} width={10} height={610} fill="#8AA6A2" opacity={0.18} /><rect x={x - 6} y={692} width={66} height={18} fill="#1A1210" /></g>)}
			{/* curtains (帷) gathered at the pillars, a scalloped valance */}
			{[210, 690, 1170].map((x, j) => { const sw = Math.sin(t * 0.9 + j) * 3;
				return <g key={x} fill="#2A120F">
					<path d={`M${x - 46},104 C${x - 34},180 ${x - 14},300 ${x - 6},380 C${x - 2},460 ${x - 18 + sw},560 ${x - 30 + sw},700 L${x},700 L${x},104 Z`} />
					<path d={`M${x + 100},104 C${x + 88},180 ${x + 68},300 ${x + 60},380 C${x + 56},460 ${x + 72 + sw},560 ${x + 84 + sw},700 L${x + 54},700 L${x + 54},104 Z`} />
					<path d={`M${x - 6},380 L${x + 60},380 L${x + 60},396 L${x - 6},396 Z`} fill="#4A3A26" /></g>; })}
			<path d={`M-200,104 L2120,104 L2120,128 ${Array.from({length: 30}, (_, i) => `Q${-160 + i * 80},${150 + (i % 2) * 4} ${-120 + i * 80},128`).join(' ')} L-200,128 Z`} fill="#321612" />
			<rect x={-200} y={700} width={2320} height={600} fill="url(#n2floor)" />
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M-200,${f1(708 + i * i * 5 + i * 12)} L2120,${f1(708 + i * i * 5 + i * 12)}`} stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} />)}
			<rect x={-200} y={690} width={2320} height={160} fill="url(#n2pool)" />
		</g>
		{/* the procession at the back: the boy emperor in his 冕, led away by two armoured guards (walking left) */}
		<g transform={Z(0.68)} fill={SIL} filter="url(#n2rimW)">
			<g transform={g1.T}><NpcWalk t={u} kind="ji" L={GL} f={GF} t0={0.21} lean={3} /><g transform={g1.torso}><path d={Helmet} /></g></g>
			<g transform={boy.T}><BoyWalk t={u} L={BL} f={BF} t0={0.05} lean={5} bow={9} /></g>
			<g transform={g2.T}><NpcWalk t={u} kind="ji" L={GL} f={GF} t0={0.47} lean={3} swing={0.8} /><g transform={g2.torso}><path d={Helmet} /></g></g>
		</g>
		{/* the window light falling through the hall, dust in it */}
		<g transform={Z(0.6)} filter="url(#n2b8)">
			<path d="M1240,320 L1520,320 L1160,770 L760,770 Z" fill="url(#n2shaft)" />
			<path d="M1600,320 L1880,320 L1560,820 L1180,820 Z" fill="url(#n2shaft)" opacity={0.8} />
		</g>
		{/* P1 the dais: its steps, the screen, the empty throne, a lamp; 董卓 on it */}
		<g transform={Z(0.78)}>
			<path d="M1190,700 L2000,700 L2000,748 L1172,748 Z" fill="#2A2724" />
			<rect x={1172} y={748} width={828} height={102} fill="#1A1310" /><rect x={1172} y={748} width={828} height={8} fill="#4A1C16" />
			{Array.from({length: 7}, (_, i) => <path key={i} d={`M${1220 + i * 110},${800} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#6A3A2A" strokeOpacity={0.4} strokeWidth={3} />)}
			<path d="M1172,748 L2000,748" stroke="#C8DAD6" strokeOpacity={0.28} strokeWidth={2} />
			{[0, 1, 2].map((i) => <rect key={i} x={1088 + i * 28} y={850 - (i + 1) * 34} width={84 - i * 28} height={(i + 1) * 34} fill={i % 2 ? '#1E1714' : '#221A16'} />)}
			{[0, 1, 2].map((i) => <rect key={'e' + i} x={1088 + i * 28} y={850 - (i + 1) * 34} width={28} height={3} fill="#C8DAD6" opacity={0.22} />)}
			<rect x={1490} y={372} width={410} height={332} fill="#141110" />
			{[0, 1, 2].map((i) => <g key={i}><rect x={1490 + i * 136.7} y={372} width={136.7} height={332} fill="none" stroke="#5A2420" strokeWidth={6} />
				<path d={`M${1520 + i * 136.7},${470} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${1536 + i * 136.7},${600} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#8A4430" strokeOpacity={0.4} strokeWidth={3} /></g>)}
			<rect x={1490} y={372} width={410} height={4} fill="#C8DAD6" opacity={0.25} />
			<g fill="#1C1612"><rect x={1580} y={664} width={270} height={22} /><rect x={1586} y={686} width={14} height={16} /><rect x={1830} y={686} width={14} height={16} /><path d="M1600,664 C1606,640 1640,636 1680,640 L1690,664 Z" /><rect x={1800} y={636} width={10} height={28} /><rect x={1760} y={632} width={60} height={7} /></g>
			<path d="M1580,664 L1850,664" stroke="#C8DAD6" strokeOpacity={0.3} strokeWidth={2} />
			<ellipse cx={1235} cy={748} rx={120} ry={14} fill="#F3DDB4" opacity={0.12 * flA.s} />
			<g fill="#140D0A"><LampStand x={1235} y={748} k={1.45} /></g>
			<Flame x={1235} y={748 - 117 * 1.45} s={1.45} t={t} seed={13} ivory glow={1.0} />
			{/* the shadow of the man on the dais falls across the floor toward the kneeling rows */}
			<path d="M1330,850 L1520,850 L1240,1080 L900,1080 Z" fill="#050606" opacity={0.32} filter="url(#n2b16)" />
			<g fill="#0E0B0A" color="#0E0B0A" filter="url(#n2rimD)"><g transform={at(DX, DY, DK)}><Dong pt={pt} cape={Math.sin(t * 1.3)} jab={Math.sin(Math.PI * cl01((t - 21.62) / 0.42))} br={Math.sin(t * 1.7)} /></g></g>
		</g>
		<g transform={Z(0.7)}>{Array.from({length: 36}, (_, i) => { const a = (t * (0.03 + rnd(i, 61) * 0.03) + rnd(i, 62)) % 1, sx0 = 900 + rnd(i, 63) * 700, y = 340 + a * 420, x = sx0 - (y - 340) * 0.7 + Math.sin(t * 0.8 + i) * 6;
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={1 + rnd(i, 64) * 1.2} fill="#E6F0EC" opacity={(0.25 + rnd(i, 65) * 0.35) * Math.sin(Math.PI * a)} />; })}</g>
		{/* P2 the officials kneeling in rows, bowed toward the dais */}
		<g transform={Z(0.9)} fill="#1E1816" filter="url(#n2rimK)">{ROWA.map((r) => <g key={r.i} transform={at(r.x, 792, 1.12)}><Kneeler bow={r.bow} hb={r.hb} /></g>)}</g>
		<g transform={Z(0.95)} fill="#150F0D" filter="url(#n2rimK)">{ROWB.map((r) => <g key={r.i} transform={at(r.x, 884, 1.55)}><Kneeler bow={r.bow} hb={r.hb} /></g>)}</g>
		<g transform={Z(1)}>
			<g fill={SIL} filter="url(#n2rimK)"><g transform={at(240, 1014, 2.65)}><Kneeler bow={26} hb={14} /></g><g transform={at(1160, 1014, 2.65)}><Kneeler bow={22} hb={18} /></g></g>
			{/* 曹操 among them, the only face: he lifts his head and looks up at 董卓 */}
			<g filter="url(#n2hero)"><g transform={at(690, 1016, 2.9)}><CaoKneel id="n2c" look={14 - 40 * lift} bow={16 - 11 * lift + 0.6 * Math.sin(t * 2.1)} /></g></g>
		</g>
		{/* P3 the near pillar, out of focus */}
		<g transform={Z(1.3)} filter="url(#n2b16)" fill="#0A0706"><rect x={-60} y={-100} width={150} height={1300} /><path d="M90,-100 C140,0 150,200 120,420 L90,420 Z" fill="#1E0C0A" /></g>
		<rect width={W} height={H} fill="url(#n2vig)" />
	</Svg>; };

/* =============================== card 8 · 吕伯奢家 · 189 · night =============================== */
const LVPAL: Pal = {...PAL, skin: '#B4845E', skinS: '#7E5638', skinH: '#E6B88C', robe: '#26231F', robeS: '#121110', robeH: '#4E473E', trim: '#2E2620', metal: '#8A8C88', metalS: '#3A3A38', metalH: '#ECE8DC'};
export const Lv: React.FC<{t: number}> = ({t}) => {
	const u = t - 28.54, FX = 1290, FY = 640;
	const wx = 5 * Math.sin(2 * Math.PI * u / 3.3), wy = 2.5 * Math.sin(2 * Math.PI * u / 2.4 + 1);
	const Z = (p: number) => { const z = 1 + 0.022 * u * p; return `translate(${f1(wx * p)},${f1(wy * p)}) translate(${FX},${FY}) scale(${z.toFixed(5)}) translate(${-FX},${-FY})`; };
	const F1 = flick(t, 7), I = 1 + 0.55 * (F1.s - 1), F2 = flick(t, 19), I2 = 1 + 0.8 * (F2.s - 1);
	const S = 0.56, CX = 1300, CY = 896;
	const head = 10 - 9 * sstep(29.7, 30.7, t), glint = (t - 31.25) / 0.55, lf = 1374 + 5 * Math.sin(u * 0.9 + 0.4);
	return <Svg>
		<defs>
			<linearGradient id="n3sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141E26" /><stop offset="0.35" stopColor="#1F2F37" /><stop offset="0.5" stopColor="#34433F" /><stop offset="0.62" stopColor="#4E5752" /></linearGradient>
			<radialGradient id="n3moon"><stop offset="0" stopColor="#DCE4DA" stopOpacity="0.4" /><stop offset="0.3" stopColor="#9FB8B6" stopOpacity="0.15" /><stop offset="1" stopColor="#9FB8B6" stopOpacity="0" /></radialGradient>
			<radialGradient id="n3in" cx="1330" cy="650" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FBEBCB" /><stop offset="0.45" stopColor="#E2C190" /><stop offset="1" stopColor="#7A5A3E" /></radialGradient>
			<radialGradient id="n3wash" cx="1318" cy="700" r="460" gradientUnits="userSpaceOnUse" gradientTransform="translate(1318 700) scale(1 1.25) translate(-1318 -700)"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.3" /><stop offset="0.35" stopColor="#D9A877" stopOpacity="0.12" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<linearGradient id="n3wedge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.5" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></linearGradient>
			<radialGradient id="n3spill"><stop offset="0" stopColor="#F6E2BC" stopOpacity="0.55" /><stop offset="0.4" stopColor="#E9CB98" stopOpacity="0.2" /><stop offset="1" stopColor="#E9CB98" stopOpacity="0" /></radialGradient>
			<linearGradient id="n3wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24221F" /><stop offset="1" stopColor="#2A2520" /></linearGradient>
			<linearGradient id="n3house" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C1815" /><stop offset="1" stopColor="#241E19" /></linearGradient>
			<linearGradient id="n3gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C2822" /><stop offset="1" stopColor="#100D0B" /></linearGradient>
			<radialGradient id="n3vig" cx="0.6" cy="0.55" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
			<Blur id="n3b3" s={3} /><Blur id="n3b6" s={6} /><Blur id="n3b10" s={10} /><Blur id="n3b2" s={2} />
			<RimF id="n3rimM" lx={-0.4} ly={-1} k={1.8} c="#A8C0BE" o={0.55} lx2={1} ly2={-0.2} k2={1.6} c2="#E8C48E" o2={0.55} />
			<RimF id="n3rimL" lx={0.4} ly={-1} k={2} c="#F0D0A0" o={0.85} />
			<RimF id="n3hero" lx={-0.5} ly={-0.85} k={4.5} c="#FFE2B4" o={0.95} lx2={1} ly2={-0.1} k2={4} c2={ACC} o2={0.9} blur={1} />
		</defs>
		{/* P0 night sky, stars, the moon over the courtyard */}
		<g transform={Z(0.3)}>
			<rect x={-200} y={-200} width={2320} height={1100} fill="url(#n3sky)" />
			{Array.from({length: 46}, (_, i) => <circle key={i} cx={f1(rnd(i, 71) * 1300)} cy={f1(rnd(i, 72) * 440)} r={0.7 + rnd(i, 73) * 1.2} fill="#E8EEE6" opacity={(0.2 + rnd(i, 74) * 0.4) * (0.85 + 0.15 * Math.sin(t * (1 + rnd(i, 75) * 2) + i))} />)}
			<circle cx={600} cy={352} r={150} fill="url(#n3moon)" /><circle cx={600} cy={352} r={20} fill="#E6EAE0" />
			{/* trees beyond the wall */}
			<g fill="#1E2828" filter="url(#n3b3)">
				<path d="M-60,500 C-20,420 40,380 110,400 C150,350 230,350 270,400 C330,380 380,420 400,480 L400,520 L-60,520 Z" />
				<path d="M520,520 C540,450 600,420 660,440 C700,400 760,410 790,450 C830,440 870,470 880,520 Z" />
				<rect x={156} y={420} width={10} height={100} /><rect x={668} y={450} width={8} height={70} />
			</g>
		</g>
		{/* P1 the courtyard wall (rammed earth, tiled coping) */}
		<g transform={Z(0.6)}>
			<rect x={-200} y={480} width={1300} height={300} fill="url(#n3wall)" />
			{Array.from({length: 20}, (_, i) => <path key={i} d={`M-200,${492 + i * 14} L1100,${492 + i * 14 + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.15} strokeWidth={1.3} />)}
			<path d="M-200,486 L1100,486 L1100,470 C800,466 200,466 -200,470 Z" fill="#191716" />
			<path d="M-200,470 C200,466 800,466 1100,470" fill="none" stroke="#9FB8B6" strokeOpacity={0.35} strokeWidth={1.6} />
			{Array.from({length: 54}, (_, i) => <circle key={i} cx={-190 + i * 24} cy={485} r={3} fill="#24211F" />)}
			<rect x={-200} y={770} width={2320} height={500} fill="url(#n3gnd)" />
		</g>
		{/* P2 the well with its windlass, a millstone */}
		<g transform={Z(0.75)}>
			<ellipse cx={470} cy={858} rx={110} ry={10} fill="#060505" opacity={0.5} />
			<g fill={SIL} filter="url(#n3rimM)">
				<g transform="translate(470,852) scale(1.35)">
					{/* the well: a square curb, two posts under a little gabled roof, a pulley, the rope, a bucket on the curb */}
					<path d="M-48,0 L48,0 L46,-56 L-46,-56 Z" /><path d="M-54,-56 L54,-56 L54,-64 L-54,-64 Z" />
					<rect x={-38} y={-150} width={6} height={88} /><rect x={32} y={-150} width={6} height={88} />
					<path d="M-58,-146 L58,-146 L40,-170 L-40,-170 Z" /><rect x={-44} y={-150} width={88} height={6} />
					<circle cx={0} cy={-134} r={9} fill="none" stroke="currentColor" strokeWidth={3} /><circle cx={0} cy={-134} r={2.4} />
					<line x1={-8} y1={-134} x2={-8} y2={-64} stroke="currentColor" strokeWidth={1.2} /><line x1={8} y1={-134} x2={22} y2={-82} stroke="currentColor" strokeWidth={1.2} />
					<path d="M14,-64 L32,-64 L34,-84 L12,-84 Z" /><path d="M12,-84 C14,-94 32,-94 34,-84" fill="none" stroke="currentColor" strokeWidth={1.4} />
				</g>
				<g transform="translate(800,882) scale(1.3)">
					{/* a millstone (石磨): the round base slab, two stones, the wooden handle */}
					<path d="M-58,0 L58,0 L54,-12 L-54,-12 Z" />
					<path d="M-34,-12 L34,-12 L34,-28 C20,-31 -20,-31 -34,-28 Z" /><path d="M-32,-30 L32,-30 L32,-46 C18,-49 -18,-49 -32,-46 Z" />
					<path d="M30,-40 L62,-46 L63,-42 L31,-36 Z" /><rect x={58} y={-62} width={4} height={18} />
				</g>
			</g>
		</g>
		{/* P3 the farmhouse: thatched roof, rammed-earth front, a small lit window, the door ajar with the lamplight inside */}
		<g transform={Z(0.9)}>
			<rect x={880} y={330} width={1240} height={580} fill="url(#n3house)" />
			<rect x={880} y={330} width={1240} height={580} fill="url(#n3wash)" opacity={I} />
			{Array.from({length: 16}, (_, i) => <path key={i} d={`M880,${380 + i * 34} L2120,${380 + i * 34}`} stroke="#000" strokeOpacity={0.12} strokeWidth={1.2} />)}
			{/* the window (牖), dim */}
			<rect x={1600} y={520} width={150} height={104} fill="#120E0B" /><rect x={1610} y={530} width={130} height={84} fill="#8A6A48" opacity={0.35 * I} />
			{Array.from({length: 8}, (_, i) => <rect key={i} x={1612 + i * 16.4} y={530} width={5} height={84} fill="#120E0B" />)}
			{/* jars (瓮) and a hoe against the wall */}
			<g fill="#16100C" filter="url(#n3rimL)">
				<path d="M1560,906 C1530,900 1520,860 1532,836 C1540,820 1550,816 1560,814 L1600,814 C1612,816 1622,822 1628,838 C1636,862 1626,900 1600,906 Z" />
				<path d="M1652,906 C1632,900 1626,876 1634,860 C1640,850 1650,846 1660,846 L1684,846 C1694,848 1700,856 1704,866 C1708,884 1700,902 1684,906 Z" />
				<path d="M1770,906 L1830,560 L1836,561 L1776,906 Z" /><path d="M1822,560 L1850,566 L1846,592 L1826,586 Z" />
			</g>
			{/* the doorway: the interior lit by a lamp (the key), the left leaf swung in, the right leaf ajar */}
			<rect x={1186} y={372} width={264} height={524} fill="url(#n3in)" />
			<rect x={1186} y={372} width={264} height={524} fill="#3A2818" opacity={0.18 * (1 - I) + 0.05} />
			<path d="M1186,820 L1450,820 L1450,896 L1186,896 Z" fill="#7A5A3C" opacity={0.5} />
			<rect x={1186} y={600} width={264} height={4} fill="#5A4030" opacity={0.25} />
			<g><LampStand x={1418} y={818} k={1.25} /></g>
			<Flame x={1418} y={818 - 117 * 1.25} s={1.25} t={t} seed={7} ivory glow={1.6} />
			<path d="M1186,372 L1224,392 L1224,876 L1186,896 Z" fill="#2A1C14" /><path d="M1224,392 L1224,876" stroke="#F3DDB4" strokeOpacity={0.4} strokeWidth={2} />
			<path d={`M1450,372 L${f1(lf)},394 L${f1(lf)},872 L1450,896 Z`} fill="#2E2016" />
			{Array.from({length: 5}, (_, i) => <path key={i} d={`M${f1(lf + i * (1450 - lf) / 5)},${394 - i * 4.4} L${f1(lf + i * (1450 - lf) / 5)},${872 + i * 4.8}`} stroke="#140C08" strokeOpacity={0.6} strokeWidth={1.4} />)}
			<path d={`M${f1(lf)},394 L${f1(lf)},872`} stroke="#F3DDB4" strokeOpacity={0.55} strokeWidth={2.4} />
			{/* the frame: posts, lintel, threshold */}
			<rect x={1160} y={346} width={26} height={566} fill="#1A120D" /><rect x={1450} y={346} width={26} height={566} fill="#1A120D" />
			<rect x={1150} y={340} width={336} height={30} fill="#1A120D" /><rect x={1170} y={892} width={300} height={16} fill="#22180F" />
			<rect x={1170} y={892} width={300} height={3} fill="#F3DDB4" opacity={0.35 * I} />
			{/* the thatch, heavy and ragged, the eave in shadow */}
			<path d="M820,356 C900,346 1000,350 1100,344 C1300,340 1600,346 2120,338 L2120,40 L1240,60 C1100,150 960,260 820,356 Z" fill="#211B15" />
			{Array.from({length: 46}, (_, i) => { const x = 840 + i * 28 + rnd(i, 81) * 10; return <path key={i} d={`M${f1(x)},${f1(352 - rnd(i, 82) * 6)} L${f1(x + 40 + rnd(i, 83) * 30)},${f1(200 - rnd(i, 84) * 60)}`} stroke="#3A3024" strokeOpacity={0.5} strokeWidth={1.4} />; })}
			<path d={`M820,356 ${Array.from({length: 44}, (_, i) => `L${f1(830 + i * 30)},${f1(352 + (rnd(i, 85) - 0.3) * 10)}`).join(' ')} L2120,338`} fill="none" stroke="#120E0B" strokeWidth={8} />
			<path d="M1240,60 C1100,150 960,260 820,356" fill="none" stroke="#9FB8B6" strokeOpacity={0.3} strokeWidth={2} />
			<rect x={880} y={360} width={1240} height={22} fill="#000" opacity={0.25} filter="url(#n3b6)" />
		</g>
		{/* P4 the yard before the door: the light falling out of the door, his long shadow in it; the overturned lamp */}
		<g transform={Z(1)}>
			<path d="M1224,898 L1374,898 L1230,1100 L860,1100 Z" fill="url(#n3wedge)" opacity={0.9 * I} filter="url(#n3b6)" />
			<path d="M1272,898 L1336,898 L1150,1100 L1030,1100 Z" fill="#070504" opacity={0.6 * (0.9 + 0.1 * I)} filter="url(#n3b6)" />
			<ellipse cx={1050} cy={962} rx={230 * (0.95 + 0.05 * I2)} ry={46} fill="url(#n3spill)" opacity={0.85 * I2} />
			<ellipse cx={1000} cy={970} rx={70} ry={10} fill="#0C0806" opacity={0.75} /><ellipse cx={994} cy={968} rx={30} ry={3} fill="#F3DDB4" opacity={0.35 * I2} />
			{/* the 豆形灯 on its side: base to the right, the cup tipped toward the spilled oil */}
			<g fill="#1A120C" filter="url(#n3rimL)" transform="translate(1084,958) scale(1.6) translate(-1084,-958)">
				<path d="M1118,940 L1124,976 C1128,980 1132,980 1134,976 L1128,938 Z" />
				<path d="M1066,952 L1122,956 L1122,962 L1066,960 Z" />
				<path d="M1040,946 C1050,940 1064,942 1068,950 L1068,964 C1060,972 1046,972 1040,964 Z" />
			</g>
			<Flame x={1000} y={968} s={1.2} t={t} seed={19} ivory glow={1.1} />
			{/* 曹操 in the doorway, back-lit, the drawn 环首刀 lowered, his face half in shadow */}
			<g filter="url(#n3hero)"><g transform={`translate(${CX},${f1(CY - 750 * S)}) scale(${-S},${S})`}>
				<CaoStand id="n3c" pal={LVPAL} head={head} blade={1.6 * Math.sin(t * 1.1)} breath={Math.sin(t * 2.2)} glint={glint} />
			</g></g>
			<rect x={1186} y={372} width={264} height={524} fill="#F3DDB4" opacity={0.04 * (I - 0.9)} />
		</g>
		{/* P5 the near woodpile, out of focus */}
		<g transform={Z(1.25)} filter="url(#n3b10)" fill="#090605">
			<path d="M-60,1100 L-60,930 C40,900 160,900 260,930 C330,950 380,1000 420,1100 Z" />
			{Array.from({length: 7}, (_, i) => <rect key={i} x={-20 + i * 50} y={880 + (i % 3) * 18} width={16} height={240} transform={`rotate(${-10 + i * 4} ${i * 50} 1000)`} />)}
		</g>
		<rect width={W} height={H} fill="url(#n3vig)" />
	</Svg>; };
void cl01; type _P = P;

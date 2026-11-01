import React from 'react';
import {W, H, P, f2, rnd, tube, build, Pose, Built, DU_L, B1, B2, B3} from './kit55';
import {FigA, PalA, DuA, Brush, GLOVE, EarCup, Lantern} from './look55a';
import {Npc} from '../qq54/npc54b';
/* LOOK C 「陶俑微缩 · 灯下泥塑」 — the story as a lamplit clay miniature: the soldiers are small painted terracotta figures
   (the 兵马俑's own material, with traces of their original paint), the sets are modelled clay, wood and straw on a table-top
   stage, lit by one small warm lamp with soft cast shadows and a shallow depth of field (far and near planes melt). The one
   accent is the 石绿 green the 俑 were painted with; the 牍 is the light. */
const GREEN = '#6F9C7E';
const C_HF: PalA = {skin: '#D2A07E', skinS: '#9A6A50', skinH: '#F0C8A4', hair: '#3A2C24', robe: GREEN, robeS: '#4A6E58', trim: '#A8503C', trousers: '#7E7064', wrap: '#9A8A78', shoe: '#4A3A30', metal: '#4A3A30', metalH: '#8A7A6A', lace: '#A8503C', line: '#4A2E22', band: '#B85A44'};
const C_JG: PalA = {...C_HF, robe: '#A2624C', robeS: '#6E3E30', trim: '#6F9C7E', trousers: '#7A6C60'};
const C_MO: PalA = {...C_HF, robe: '#B49C7E', robeS: '#7A6650', trim: GREEN, hair: '#6A5E54', skin: '#D4A486', skinS: '#9A6E58'};
const C_ZH: PalA = {...C_HF, robe: '#8A7A5E', robeS: '#5E5240', trim: '#5A4E3E'};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const at = (x: number, y: number, k: number, flip = false) => `translate(${x},${y}) scale(${flip ? -k : k},${k})`;

/** clay: the alpha, blurred, is the height; a fine noise roughens it; one distant warm light shades it (rig cm or screen px) */
const Clay: React.FC<{id: string; blur: number; scale: number; az: number; el?: number; noise?: number; nf?: number; k?: number; amb?: number; col?: string}> = ({id, blur, scale, az, el = 40, noise = 0.08, nf = 0.9, k = 0.85, amb = 0.42, col = '#FFE8CC'}) =>
	<filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
		<feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="b" />
		<feTurbulence type="fractalNoise" baseFrequency={nf} numOctaves="2" seed="4" result="n" />
		<feComposite in="b" in2="n" operator="arithmetic" k2="1" k3={noise} result="h" />
		<feDiffuseLighting in="h" surfaceScale={scale} diffuseConstant="1" lightingColor={col} result="l"><feDistantLight azimuth={az} elevation={el} /></feDiffuseLighting>
		<feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1={k} k2={amb} result="lit" />
		<feComposite in="lit" in2="SourceAlpha" operator="in" />
	</filter>;
const ClayDefs: React.FC<{p: string; az?: number; azSet?: number}> = ({p, az = -35, azSet}) => <>
	<Clay id={`${p}tL`} blur={2.2} scale={6} az={az} noise={0.035} nf={0.5} />
	<Clay id={`${p}tS`} blur={1.3} scale={4} az={az} noise={0.035} nf={0.5} />
	<pattern id={`${p}lam`} width={5.2} height={6.4} patternUnits="userSpaceOnUse">
		<rect width={5.2} height={6.4} fill="#3A2E26" />
		<path d="M0.4,0.4 L4.8,0.4 L4.8,5 C3.9,5.6 1.3,5.6 0.4,5 Z" fill="#5A4A3E" />
		<circle cx={2.6} cy={2.4} r={0.5} fill="#D8C4A8" />
		<rect x={0} y={5.5} width={5.2} height={0.9} fill="#B85A44" />
	</pattern>
	<filter id={`${p}sh`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
	<filter id={`${p}dof`} x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="3.2" /></filter>
	<filter id={`${p}dof2`} x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="6" /></filter>
	<filter id={`${p}bloom`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
	<Clay id={`${p}set`} blur={5} scale={6} az={azSet ?? az} noise={0.12} nf={0.25} k={0.8} amb={0.45} />
	<Clay id={`${p}setS`} blur={2.4} scale={4} az={azSet ?? az} noise={0.1} nf={0.4} k={0.8} amb={0.45} />
	<radialGradient id={`${p}vig`} cx="0.5" cy="0.52" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
</>;
/** a clay figure with its contact shadow and a soft cast shadow thrown away from the key (dx per unit height) */
const ClayFig: React.FC<{b: Built; pal: PalA; p: string; id: string; x: number; y: number; k: number; flip?: boolean; cast?: number; floorY?: number}> = ({b, pal, p, id, x, y, k, flip, cast = -0.8, floorY}) => {
	const fy = floorY ?? y + b.floor * k;
	return <g>
		<g filter={`url(#${p}sh)`} opacity={0.55}><ellipse cx={x + (flip ? -1 : 1) * 14 * k} cy={fy} rx={40 * k} ry={6 * k} fill="#120A06" />
			<g transform={`translate(${x},${fy}) matrix(1,0,${cast},0.28,0,0) translate(${-x},${-fy})`}><g transform={at(x, y, k, flip)}><FigA b={b} pal={pal} p={p} id={`${id}s`} sil silC="#120A06" /></g></g></g>
		<g transform={at(x, y, k, flip)}><FigA b={b} pal={pal} p={p} id={id} eye="#2A1A12" /></g>
	</g>; };

const tent = (x: number, y: number, w: number, h: number, dep: number) => `M${x - w / 2},${y} L${x},${y - h} L${x + dep},${y - h - dep * 0.18} L${x + w / 2 + dep},${y - dep * 0.18} L${x + w / 2},${y} Z`;
/** a small glowing fire: translucent orange tongues with bloom, clay logs */
const FireC: React.FC<{x: number; y: number; s: number; p: string}> = ({x, y, s, p}) => {
	const tongues = [[-40, 150, -0.2], [-16, 240, 0.05], [10, 280, 0.12], [34, 190, 0.3], [-56, 96, -0.4], [52, 120, 0.5]];
	const fl = (k2: number, c: string, ww: number, o: number) => tongues.map(([dx, h, l], i) => { const bx = x + dx * s, hh = h * s * k2;
		return <path key={i} opacity={o} d={`M${f2(bx - ww * s)},${f2(y)} C${f2(bx - ww * 1.2 * s)},${f2(y - hh * 0.4)} ${f2(bx + l * hh * 0.3)},${f2(y - hh * 0.6)} ${f2(bx + l * hh * 0.45)},${f2(y - hh)} C${f2(bx + ww * 0.6 * s)},${f2(y - hh * 0.55)} ${f2(bx + ww * 1.2 * s)},${f2(y - hh * 0.3)} ${f2(bx + ww * s)},${f2(y)} Z`} fill={c} />; });
	return <g>
		<defs><radialGradient id={`${p}fg${x}`}><stop offset="0" stopColor="#FFB060" stopOpacity="0.6" /><stop offset="0.3" stopColor="#FF8A3A" stopOpacity="0.2" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient></defs>
		<circle cx={x} cy={y - 100 * s} r={600 * s} fill={`url(#${p}fg${x})`} />
		<g filter={`url(#${p}setS)`} fill="#4A3020"><path d={tube([x - 130 * s, y + 10 * s], [x + 60 * s, y - 26 * s], 15 * s, 13 * s)} /><path d={tube([x + 120 * s, y + 14 * s], [x - 50 * s, y - 30 * s], 14 * s, 12 * s)} /></g>
		<g filter={`url(#${p}bloom)`} opacity={0.9}>{fl(1.05, '#FF8A3A', 34, 0.9)}</g>
		{fl(1, '#F07A34', 26, 0.85)}{fl(0.7, '#FFB458', 17, 0.9)}{fl(0.4, '#FFF0C0', 9, 0.95)}
	</g>; };

/* ============================== beat 1 ============================== */
export const Look1: React.FC = () => { const S = B1, hb = build(S.heifu.pose), jb = build(S.jing.pose), hf = S.heifu;
	const duP: P = [hf.x + S.du.at[0] * hf.k, hf.y + S.du.at[1] * hf.k];
	const npcs = [{x: 200, y: 776, k: 2.2, pose: {kind: 'soldier', seat: 'log', lean: 8, neck: 6, thN: 78, shN: 8, thF: 84, shF: 14, hN: [34, 2], hF: [28, 4]} as Pose},
		{x: 548, y: 780, k: 2.2, flip: true, pose: {kind: 'armour', seat: 'log', lean: 14, neck: 10, thN: 76, shN: 10, thF: 80, shF: 14, hN: [36, -4], hF: [30, 0]} as Pose}];
	return <Svg>
		<defs><ClayDefs p="c1" az={-20} />
			<linearGradient id="c1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141E2A" /><stop offset="0.55" stopColor="#24323E" /><stop offset="0.65" stopColor="#3A4044" /></linearGradient>
			<linearGradient id="c1gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A4636" /><stop offset="1" stopColor="#2E2018" /></linearGradient>
			<radialGradient id="c1warm" cx="1500" cy="900" r="1250" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FF9A50" stopOpacity="0.42" /><stop offset="0.45" stopColor="#B05A2A" stopOpacity="0.14" /><stop offset="1" stopColor="#B05A2A" stopOpacity="0" /></radialGradient>
		</defs>
		{/* the painted backdrop: a night sky with pinhole stars */}
		<rect width={W} height={H} fill="url(#c1sky)" />
		{Array.from({length: 50}, (_, i) => <circle key={i} cx={1000 + rnd(i, 1) * 920} cy={30 + rnd(i, 2) * 520} r={1 + rnd(i, 3) * 1.4} fill="#F2E6CC" opacity={0.25 + rnd(i, 4) * 0.5} />)}
		{/* far: modelled hills and the camp, out of focus */}
		<g filter="url(#c1dof2)">
			<g filter="url(#c1set)"><path d="M-40,640 C120,560 300,560 460,600 C620,540 820,540 1000,590 C1180,546 1400,550 1600,596 C1760,560 1880,570 1960,590 L1960,720 L-40,720 Z" fill="#2E3836" /></g>
			<g filter="url(#c1setS)" fill="#6A5A48">{Array.from({length: 26}, (_, i) => { const x = 20 + i * 76 + rnd(i, 9) * 40, y = 668 + rnd(i, 10) * 12, s2 = 0.7 + rnd(i, 11) * 0.5; return rnd(i, 13) < 0.18 ? null : <path key={i} d={tent(x, y, 70 * s2, 44 * s2, 26 * s2)} />; })}</g>
			<g fill="#3A2E24">{Array.from({length: 80}, (_, i) => <rect key={i} x={i * 24.4} y={668 - (i % 3)} width={4} height={24} />)}
				{[[300, 680, 150, 30, 58], [980, 680, 170, 34, 64], [1240, 680, 150, 30, 56], [1820, 680, 160, 32, 60]].map(([x, y, h, fw, fh], i) => <path key={i} fill="#1E1814" d={`M${x - 2},${y} L${x - 2},${y - h} L${x + 2},${y - h} L${x + 2},${y} Z M${x + 2},${y - h + 6} L${x + fw},${y - h + 4} L${x + fw},${y - h + fh} L${x + 2},${y - h + fh - 4} Z`} />)}</g>
			{[[180, 676, 1], [720, 672, 0.8], [1700, 676, 1.1]].map(([x, y, s], i) => <circle key={i} cx={x} cy={y - 6} r={26 * s} fill="#FFB060" opacity={0.5} />)}
		</g>
		{/* the clay ground slab, crumbly, warmed by the fire */}
		<g filter="url(#c1set)"><rect y={690} width={W} height={H - 690} fill="url(#c1gnd)" /></g>
		<rect width={W} height={H} fill="url(#c1warm)" style={{mixBlendMode: 'screen'}} />
		{/* mid: the figures round the second fire, softly out of focus */}
		<g filter="url(#c1dof)">
			{npcs.map((n, i) => <ClayFig key={i} b={build(n.pose)} pal={i ? C_JG : C_HF} p="c1" id={`c1n${i}`} x={n.x} y={n.y} k={n.k} flip={n.flip} cast={-0.4} />)}
			<FireC x={374} y={800} s={0.26} p="c1" />
		</g>
		{/* near: the log and the stone, the two clay soldiers, the 牍, the fire */}
		<g filter="url(#c1dof)"><g filter="url(#c1set)">
			<path d="M560,1080 L540,930 C540,904 560,892 600,892 L790,890 C820,890 834,904 834,930 L850,1080 Z" fill="#6A5848" />
			<path d="M760,1090 C756,1010 770,950 820,936 C900,926 1080,930 1200,934 C1250,936 1270,970 1268,1090 Z" fill="#6E4E36" />
		</g></g>
		<ClayFig b={jb} pal={C_JG} p="c1" id="c1j" x={S.jing.x} y={S.jing.y} k={S.jing.k} cast={-1.2} floorY={940} />
		<ClayFig b={hb} pal={C_HF} p="c1" id="c1h" x={hf.x} y={hf.y} k={hf.k} cast={-1.2} floorY={980} />
		<g transform={`translate(${duP[0]},${duP[1]}) rotate(${S.du.tilt}) scale(${hf.k * S.du.s})`}><DuA id="c1du" cols={3} glow={1.2} /></g>
		<g transform={at(hf.x, hf.y, hf.k)}><Brush a={S.brush.a} b={S.brush.b} /><g filter="url(#c1tS)"><path d={hb.armN.hand} fill={C_HF.skin} /></g></g>
		<FireC x={S.fire.x} y={S.fire.y} s={S.fire.s} p="c1" />
		<rect width={W} height={H} fill="url(#c1vig)" />
	</Svg>; };

/* ============================== beat 2 ============================== */
export const Look2: React.FC = () => { const S = B2, mb = build(S.mother.pose), zb = build(S.zhong.pose), m = S.mother;
	const duP: P = [m.x - S.du.at[0] * m.k, m.y + S.du.at[1] * m.k];
	return <Svg>
		<defs><ClayDefs p="c2" az={-30} azSet={-150} /><ClayDefs p="c2m" az={-150} azSet={-150} />
			<Clay id="c2fig" blur={2.4} scale={7} az={-25} noise={0.1} nf={0.8} />
			<linearGradient id="c2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24303C" /><stop offset="0.45" stopColor="#4E5258" /><stop offset="0.6" stopColor="#A07A5C" /><stop offset="0.68" stopColor="#D8945A" /></linearGradient>
			<linearGradient id="c2gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A6450" /><stop offset="1" stopColor="#3A2C20" /></linearGradient>
			<radialGradient id="c2du" cx={duP[0]} cy={duP[1] - 60} r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD9A0" stopOpacity="0.55" /><stop offset="0.3" stopColor="#FFB870" stopOpacity="0.2" /><stop offset="1" stopColor="#FFB870" stopOpacity="0" /></radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#c2sky)" />
		<g filter="url(#c2dof2)">
			<g filter="url(#c2set)"><path d="M-40,650 C160,590 340,580 520,610 C700,570 900,576 1080,606 C1300,570 1560,580 1960,600 L1960,720 L-40,720 Z" fill="#5A5048" /></g>
			<g filter="url(#c2setS)" fill="#6A5848">{[[120, 676], [210, 670], [600, 674], [700, 678]].map(([x, y], i) => <path key={i} d={`M${x - 36},${y} L${x - 30},${y - 18} L${x + 30},${y - 18} L${x + 36},${y} Z`} />)}</g>
			<g filter="url(#c2setS)"><path d="M700,620 C690,560 720,500 780,480 C800,430 880,420 920,450 C980,430 1040,470 1030,520 C1070,560 1040,610 1000,620 Z" fill="#4E5A3E" /><path d="M846,700 L852,600 L862,600 L868,700 Z" fill="#4A3828" /></g>
			<g filter="url(#c2setS)"><path d="M-20,700 L-20,646 L1110,646 L1110,700 Z" fill="#8A6E54" /><path d="M-30,650 C300,632 800,632 1120,646 L1120,634 C800,620 300,618 -30,636 Z" fill="#9A8460" /></g>
		</g>
		<g filter="url(#c2set)"><rect y={698} width={W} height={H - 698} fill="url(#c2gnd)" /></g>
		{/* the well and the 桔槔, modelled wood and clay */}
		<g filter="url(#c2dof)"><g filter="url(#c2setS)">
			<path d="M320,850 C320,830 380,822 440,822 C500,822 560,830 560,850 L556,900 C530,914 350,914 324,900 Z" fill="#8A7660" />
			<path d="M640,900 L646,560 L660,560 L666,900 Z" fill="#6A4E36" /><path d="M372,424 L900,676 L896,686 L368,434 Z" fill="#7A5A3E" />
			<ellipse cx={904} cy={688} rx={28} ry={22} fill="#7A7068" /><path d="M412,780 L448,780 L444,812 L416,812 Z" fill="#5A4030" />
		</g><path d="M374,430 L430,780" stroke="#3A2A1E" strokeWidth={2.4} /></g>
		{/* the house: rammed-earth wall in layers, thatch, the dark doorway, the step */}
		<g filter="url(#c2set)"><path d="M1060,930 L1060,470 L1960,470 L1960,930 Z" fill="#9A7E60" /></g>
		<g filter="url(#c2setS)">{Array.from({length: 18}, (_, i) => <path key={i} d={`M1060,${492 + i * 25} L1960,${492 + i * 25 + (i % 2 ? 2 : -2)} L1960,${498 + i * 25} L1060,${498 + i * 25} Z`} fill="#8A6E52" />)}</g>
		<path d="M1250,930 L1250,580 L1520,580 L1520,930 Z" fill="#1A120C" />
		<path d="M1700,700 L1820,700 L1820,770 L1700,770 Z" fill="#1A120C" />
		<g filter="url(#c2set)"><path d="M990,512 C1000,498 1060,470 1160,410 C1240,362 1300,330 1340,300 L1960,300 L1960,526 C1700,540 1300,538 1000,530 C984,528 982,518 990,512 Z" fill="#9A8058" /></g>
		<g>{Array.from({length: 120}, (_, i) => { const u = i / 119, x0 = 995 + u * 965, x1 = 1340 + u * 620; return <path key={i} d={`M${f2(x0 + (rnd(i, 1) - 0.5) * 10)},${f2(530 + rnd(i, 2) * 10)} L${f2(x1 + (rnd(i, 3) - 0.5) * 20)},${300 + rnd(i, 4) * 90}`} stroke={i % 3 ? '#5A4428' : '#C8A870'} strokeOpacity={0.45} strokeWidth={1.6} />; })}</g>
		<g filter="url(#c2set)"><path d="M1040,930 L1980,930 L1980,1000 L1020,1000 Z" fill="#7A6450" /></g>
		<rect width={W} height={H} fill="url(#c2du)" style={{mixBlendMode: 'screen'}} />
		{/* the figures (lit by the 牍 in front of them: local +x) */}
		<ClayFig b={zb} pal={C_ZH} p="c2" id="c2z" x={S.zhong.x} y={S.zhong.y} k={S.zhong.k} cast={-0.9} />
		<ClayFig b={mb} pal={C_MO} p="c2m" id="c2m" x={m.x} y={m.y} k={m.k} flip cast={0.9} />
		<g transform={`translate(${duP[0]},${duP[1]}) rotate(${-S.du.tilt}) scale(${m.k * S.du.s})`}><DuA id="c2du" cols={4} glow={1.4} /></g>
		<g transform={at(m.x, m.y, m.k, true)} filter="url(#c2mtS)"><path d={mb.armN.hand} fill={C_MO.skin} /></g>
		<rect width={W} height={H} fill="url(#c2vig)" />
	</Svg>; };

/* ============================== beat 3 ============================== */
export const Look3: React.FC = () => { const D = B3.du, k = D.k, L: P = [1530, 400];
	const HL = {x: 830, y: 905, a: 6}, HR = {x: 1150, y: 880, a: -8};
	const hand = (h: {x: number; y: number; a: number}, left: boolean, part: 'under' | 'thumb') => <g transform={`translate(${h.x},${h.y}) rotate(${h.a}) scale(${left ? -k : k},${k})`}>
		{part === 'under' ? <g>
			<g filter="url(#c3tL)"><path d={GLOVE.sleeve} fill="#4A6A86" /></g>
			<g filter="url(#c3tS)"><path d={GLOVE.cuff} fill="#D8D0C0" /><path d={GLOVE.palm} fill="#EEE8DC" /></g>
		</g> : <g filter="url(#c3tS)"><path d={GLOVE.thumb} fill="#F2ECE0" /></g>}
	</g>;
	return <Svg>
		<defs><ClayDefs p="c3" az={-50} />
			<radialGradient id="c3lamp" cx={L[0]} cy={L[1]} r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD9A0" stopOpacity="0.55" /><stop offset="0.3" stopColor="#F0B070" stopOpacity="0.22" /><stop offset="0.65" stopColor="#B07040" stopOpacity="0.06" /><stop offset="1" stopColor="#B07040" stopOpacity="0" /></radialGradient>
		</defs>
		<rect width={W} height={H} fill="#1C140F" />
		{/* the 椁, modelled timber; the far wall and the near corners fall out of focus */}
		<g filter="url(#c3dof)">
			<g filter="url(#c3set)">{Array.from({length: 9}, (_, i) => { const x = -160 + i * 270; return <path key={i} d={`M${x + 4},${H + 20} L${x + 124},236 L${x + 376},236 L${x + 266},${H + 20} Z`} fill={i % 2 ? '#5A4030' : '#4E3828'} />; })}</g>
			<g stroke="#2A1C12" strokeOpacity={0.45} fill="none">{Array.from({length: 9}, (_, i) => { const x = -160 + i * 270; return <g key={i}>{Array.from({length: 5}, (_, j) => <path key={j} d={`M${x + 40 + j * 46},${H + 20} C${x + 90 + j * 40},700 ${x + 140 + j * 44},420 ${x + 160 + j * 42},236`} strokeWidth={1.4} />)}</g>; })}</g>
		</g>
		<g filter="url(#c3dof2)"><g filter="url(#c3set)"><path d="M-20,-20 L1960,-20 L1960,240 L-20,240 Z" fill="#3A2A1E" />{Array.from({length: 8}, (_, i) => <rect key={i} x={-20} y={4 + i * 29} width={1980} height={22} fill="#40301F" />)}</g></g>
		<rect width={W} height={H} fill="url(#c3lamp)" style={{mixBlendMode: 'screen'}} />
		<g filter="url(#c3dof)">
			<g filter="url(#c3setS)">
				<EarCup x={300} y={640} s={1.25} ang={-18} out="#2A1A14" inn="#9A3424" />
				<EarCup x={420} y={850} s={1.05} ang={14} out="#2A1A14" inn="#8A2E20" />
				<g transform="translate(1600,860)"><ellipse cx={0} cy={-16} rx={160} ry={96} fill="#2A1612" /><ellipse cx={0} cy={-16} rx={124} ry={72} fill="none" stroke="#9A3424" strokeWidth={8} /></g>
				<g transform="translate(190,400)"><ellipse cx={0} cy={30} rx={86} ry={50} fill="#6A5442" /><ellipse cx={0} cy={-10} rx={60} ry={36} fill="#7A624C" /></g>
			</g>
			<ellipse cx={190} cy={390} rx={34} ry={20} fill="#1A100A" />
		</g>
		<g filter="url(#c3bloom)"><circle cx={L[0]} cy={L[1] - 70} r={90} fill="#FFE2B0" opacity={0.8} /></g>
		<Lantern x={L[0]} y={L[1] + 10} s={1.05} body="#2A2420" glass="#FFE2B0" flame="#FFFFFF" />
		{hand(HL, true, 'under')}{hand(HR, false, 'under')}
		<g transform={`translate(${D.x + 18},${D.y + 30}) rotate(${D.ang + 90}) scale(${k}) translate(0,${DU_L / 2})`} filter="url(#c3sh)" opacity={0.5}><rect x={-1.7} y={-DU_L} width={3.4} height={DU_L} fill="#000" /></g>
		<g transform={`translate(${D.x},${D.y}) rotate(${D.ang + 90}) scale(${k}) translate(0,${DU_L / 2})`}><DuA id="c3du" age={1} cols={4} glow={0.8} /></g>
		{hand(HL, true, 'thumb')}{hand(HR, false, 'thumb')}
		<rect width={W} height={H} fill="url(#c3vig)" />
	</Svg>; };
void Npc;

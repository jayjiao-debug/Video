import React from 'react';
import {W, H, P, f2, rnd, sm, tube, build, Pose, DU_OUT, duMarks, DU_L, DU_W, B1, B2, B3} from './kit55';
import {FigA, PalA, Brush, GLOVE, EarCup} from './look55a';
import {Theme} from '../qq50/kit50';
/* LOOK B 「墨牍 · 水墨」 — the letter's own medium. The film is brush and ink on warm paper: depth is ink density (far =
   pale wash in mist, near = dense ink), people are 写意 washes with a 白描 line for faces and hands, the paper itself is the
   light. Two colours only: 朱 (cinnabar) for fire and lacquer — the accent — and the 牍's warm wood, the one object that
   carries colour and a gold halo in every frame. Everything else is ink. */
const PAPER = '#ECE3CF', INK = '#1E1A16', ZHU = '#C8412B';
export const thInk: Theme = {ink: '#1E1A16', key: ZHU, rule: ZHU, dim: 0.8, halo: `0 0 2px ${PAPER}, 0 0 8px ${PAPER}, 0 0 18px rgba(236,227,207,0.95)`};
const PB: PalA = {skin: '#E9DCC2', skinS: '#D6C8AC', skinH: '#E9DCC2', hair: '#221D18', robe: '#A69C8A', robeS: '#7E7566', trim: '#4A443A', trousers: '#5C554A', wrap: '#8E8676', shoe: '#2A2520', metal: '#555', metalH: '#999', lace: '#333', line: INK, band: ZHU};
const PB_ARM: PalA = {...PB, robe: '#8C8474', robeS: '#6A6356', trim: '#3A352E'};
const PB_MOM: PalA = {...PB, robe: '#9A9280', robeS: '#746C5E', trim: '#4A443A', hair: '#5A544C'};
const PB_FAR: PalA = {...PB, robe: '#7E7768', robeS: '#5E584C', hair: '#1A1612'};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const at = (x: number, y: number, k: number, flip = false) => `translate(${x},${y}) scale(${flip ? -k : k},${k})`;

/* ---------- the ink kit: brush wobble (screen px), wash edges that pool darker, paper fibre ---------- */
const InkDefs: React.FC<{p: string}> = ({p}) => <>
	<filter id={`${p}br`} x="-5%" y="-5%" width="110%" height="110%">
		<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="n" />
		<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
	</filter>
	<filter id={`${p}wash`} x="-10%" y="-10%" width="120%" height="120%">
		<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="3" result="n" />
		<feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d" />
		<feGaussianBlur in="d" stdDeviation="2.2" result="bl" />
		<feMorphology in="SourceAlpha" operator="erode" radius="5" result="er" />
		<feGaussianBlur in="er" stdDeviation="5" result="erb" />
		<feComposite in="bl" in2="erb" operator="arithmetic" k2="1" k3="-0.35" result="edge" />
		<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" result="g" />
		<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.2" result="ga" />
		<feComposite in="edge" in2="ga" operator="in" />
	</filter>
	{/* per part (rig cm): the wash darkens where it pools at the shape's edge */}
	<filter id={`${p}tL`} x="-20%" y="-20%" width="140%" height="140%">
		<feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="er" />
		<feGaussianBlur in="er" stdDeviation="0.9" result="erb" />
		<feComposite in="SourceAlpha" in2="erb" operator="out" result="edge" />
		<feFlood floodColor={INK} floodOpacity="0.3" /><feComposite in2="edge" operator="in" result="ec" />
		<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="ec" /></feMerge>
	</filter>
	<filter id={`${p}tS`} x="-20%" y="-20%" width="140%" height="140%">
		<feMorphology in="SourceAlpha" operator="erode" radius="0.7" result="er" />
		<feGaussianBlur in="er" stdDeviation="0.6" result="erb" />
		<feComposite in="SourceAlpha" in2="erb" operator="out" result="edge" />
		<feFlood floodColor={INK} floodOpacity="0.3" /><feComposite in2="edge" operator="in" result="ec" />
		<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="ec" /></feMerge>
	</filter>
	<pattern id={`${p}lam`} width={5.2} height={6.4} patternUnits="userSpaceOnUse">
		<rect width={5.2} height={6.4} fill="#958D7E" />
		<path d="M0.5,0.4 L0.5,4.2 C0.5,5.8 4.7,5.8 4.7,4.2 L4.7,0.4" fill="#7E7768" stroke={INK} strokeWidth={0.3} />
		<circle cx={2.6} cy={2.2} r={0.42} fill={INK} />
	</pattern>
	<filter id={`${p}fib`} x="0" y="0" width="100%" height="100%">
		<feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="11" result="f" />
		<feColorMatrix in="f" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 -1.4 0.82" />
	</filter>
	<radialGradient id={`${p}vig`} cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#8A7A60" stopOpacity="0" /><stop offset="1" stopColor="#8A7A60" stopOpacity="0.35" /></radialGradient>
</>;
const Paper: React.FC<{p: string}> = ({p}) => <><rect width={W} height={H} fill="#B8A88A" filter={`url(#${p}fib)`} opacity={0.35} style={{mixBlendMode: 'multiply'}} /><rect width={W} height={H} fill={`url(#${p}vig)`} /></>;

/** the 牍 on paper: the one warm object, a gold-ochre halo washed round it */
export const DuB: React.FC<{age?: number; cols?: number; halo?: number; id: string}> = ({age = 0, cols = 3, halo = 1, id}) => <g>
	<defs>
		<radialGradient id={`${id}g`}><stop offset="0" stopColor="#E0A840" stopOpacity={0.5 * halo} /><stop offset="0.35" stopColor="#E0A840" stopOpacity={0.2 * halo} /><stop offset="1" stopColor="#E0A840" stopOpacity="0" /></radialGradient>
		<linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={age ? '#2A2018' : '#C8964E'} /><stop offset="0.5" stopColor={age ? '#3E2E20' : '#E8C27E'} /><stop offset="1" stopColor={age ? '#1E1610' : '#B07E3C'} /></linearGradient>
	</defs>
	{halo > 0 && <ellipse cx={0} cy={-DU_L / 2} rx={DU_L * 0.8} ry={DU_L * 0.95} fill={`url(#${id}g)`} />}
	<path d={DU_OUT} fill={`url(#${id}w)`} stroke={INK} strokeWidth={0.18} />
	<path d={duMarks(cols, 3)} stroke={age ? '#0A0604' : INK} strokeWidth={0.34} strokeLinecap="round" fill="none" opacity={age ? 0.7 : 0.92} />
	<path d={`M${DU_W / 2 - 0.3},-0.4 L${DU_W / 2 - 0.3},${-DU_L + 0.4}`} stroke="#F6D890" strokeWidth={0.3} opacity={0.9} />
</g>;
/** fire as a cinnabar wash: tongues blurred and pooled, a pale 朱 halo, cinnabar sparks */
const FireB: React.FC<{x: number; y: number; s: number; id: string}> = ({x, y, s, id}) => {
	const tongues = [[-46, 150, -0.2], [-20, 250, 0.05], [8, 290, 0.12], [34, 200, 0.3], [-62, 96, -0.4], [58, 120, 0.5]];
	return <g>
		<defs><radialGradient id={`${id}h`}><stop offset="0" stopColor={ZHU} stopOpacity="0.28" /><stop offset="0.4" stopColor={ZHU} stopOpacity="0.08" /><stop offset="1" stopColor={ZHU} stopOpacity="0" /></radialGradient></defs>
		<circle cx={x} cy={y - 120 * s} r={420 * s} fill={`url(#${id}h)`} />
		<g filter="url(#b0wash)" opacity={0.9}>
			{tongues.map(([dx, h, l], i) => { const bx = x + dx * s, hh = h * s;
				const T = (k: number, c: string, ww: number, o: number) => <path key={k} opacity={o} d={`M${f2(bx - ww * s)},${f2(y)} C${f2(bx - ww * 1.2 * s)},${f2(y - hh * 0.4 * k)} ${f2(bx + l * hh * 0.3 * k)},${f2(y - hh * 0.6 * k)} ${f2(bx + l * hh * 0.45 * k)},${f2(y - hh * k)} C${f2(bx + ww * 0.6 * s)},${f2(y - hh * 0.55 * k)} ${f2(bx + ww * 1.2 * s)},${f2(y - hh * 0.3 * k)} ${f2(bx + ww * s)},${f2(y)} Z`} fill={c} />;
				return <g key={i}>{T(1, ZHU, 30, 0.75)}{T(0.6, '#E07A3A', 18, 0.7)}</g>; })}
		</g>
		<g fill={INK} filter="url(#b0br)"><path d={tube([x - 130 * s, y + 10 * s], [x + 60 * s, y - 26 * s], 14 * s, 12 * s)} /><path d={tube([x + 120 * s, y + 14 * s], [x - 50 * s, y - 30 * s], 13 * s, 11 * s)} /></g>
		{Array.from({length: 14}, (_, i) => <circle key={i} cx={x + (rnd(i, 1) - 0.5) * 240 * s} cy={y - 220 * s - rnd(i, 2) * 360 * s} r={(1.6 + rnd(i, 3) * 2.2) * s} fill={ZHU} opacity={0.4 + rnd(i, 4) * 0.5} />)}
	</g>; };
const tent = (x: number, y: number, w: number, h: number, dep: number) => `M${x - w / 2},${y} L${x},${y - h} L${x + dep},${y - h - dep * 0.18} L${x + w / 2 + dep},${y - dep * 0.18} L${x + w / 2},${y} Z`;
/** a mountain ridge wash: ink at the crest, fading into mist below */
const Ridge: React.FC<{d: string; c: string; id: string; o?: number}> = ({d, c, id, o = 1}) => <g opacity={o}>
	<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.55" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
	<path d={d} fill={`url(#${id})`} filter="url(#b0wash)" /></g>;

/* ============================== beat 1 ============================== */
export const Look1: React.FC = () => { const S = B1, hb = build(S.heifu.pose), jb = build(S.jing.pose), hf = S.heifu;
	const duP: P = [hf.x + S.du.at[0] * hf.k, hf.y + S.du.at[1] * hf.k];
	const npcs = [{x: 200, y: 776, k: 2.2, pose: {kind: 'soldier', seat: 'log', lean: 8, neck: 6, thN: 78, shN: 8, thF: 84, shF: 14, hN: [34, 2], hF: [28, 4]} as Pose},
		{x: 548, y: 780, k: 2.2, flip: true, pose: {kind: 'armour', seat: 'log', lean: 14, neck: 10, thN: 76, shN: 10, thF: 80, shF: 14, hN: [36, -4], hF: [30, 0]} as Pose}];
	const ink = {c: INK, w: 0.32};
	return <Svg>
		<defs><InkDefs p="b0" />
			<linearGradient id="b1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B4AC9C" /><stop offset="0.35" stopColor="#D2C9B6" /><stop offset="0.6" stopColor={PAPER} /></linearGradient>
			<linearGradient id="b1gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A89E8A" /><stop offset="0.5" stopColor="#6E6658" /><stop offset="1" stopColor="#3A342C" /></linearGradient>
			<radialGradient id="b1night"><stop offset="0" stopColor={INK} stopOpacity="0" /><stop offset="0.07" stopColor={INK} stopOpacity="0" /><stop offset="0.12" stopColor={INK} stopOpacity="0.5" /><stop offset="0.45" stopColor={INK} stopOpacity="0.32" /><stop offset="0.8" stopColor={INK} stopOpacity="0.1" /><stop offset="1" stopColor={INK} stopOpacity="0" /></radialGradient>
		</defs>
		<rect width={W} height={H} fill={PAPER} />
		<rect width={W} height={700} fill="url(#b1sky)" filter="url(#b0wash)" />
		{/* a moon left in the paper, a ring of wash round it */}
		<circle cx={1640} cy={330} r={980} fill="url(#b1night)" filter="url(#b0wash)" />
		<circle cx={1640} cy={330} r={150} fill="#7E7666" opacity={0.35} filter="url(#b0wash)" /><circle cx={1640} cy={330} r={50} fill={PAPER} />
		{/* far hills in two washes, the mist between */}
		<Ridge id="b1r1" c="#9C9482" d="M-40,620 C120,540 260,520 380,560 C520,480 700,470 840,540 C980,500 1120,520 1260,560 C1420,500 1640,490 1960,560 L1960,700 L-40,700 Z" o={0.7} />
		<Ridge id="b1r2" c="#7A7262" d="M-40,660 C200,610 420,620 600,640 C820,600 1060,612 1300,640 C1520,616 1760,620 1960,640 L1960,720 L-40,720 Z" />
		{/* the camp: tents and banners as ink in mist, the palisade in dry strokes */}
		<g fill="#4E473E" filter="url(#b0br)">
			{Array.from({length: 26}, (_, i) => { const x = 20 + i * 76 + rnd(i, 9) * 40, y = 670 + rnd(i, 10) * 12, s2 = 0.7 + rnd(i, 11) * 0.5; return rnd(i, 13) < 0.18 ? null : <path key={i} d={tent(x, y, 70 * s2, 44 * s2, 26 * s2)} opacity={0.55 + rnd(i, 12) * 0.3} />; })}
			{Array.from({length: 90}, (_, i) => <rect key={i} x={i * 21.6 + rnd(i, 4) * 6} y={672 - rnd(i, 5) * 6} width={2.6} height={22 + rnd(i, 6) * 8} opacity={0.6} />)}
			{[[300, 680, 150, 30, 58], [980, 680, 170, 34, 64], [1240, 680, 150, 30, 56], [1820, 680, 160, 32, 60]].map(([x, y, h, fw, fh], i) => <path key={i} fill={INK} d={`M${x - 1.6},${y} L${x - 1.6},${y - h} L${x + 1.6},${y - h} L${x + 1.6},${y} Z M${x + 1.6},${y - h + 6} L${x + fw},${y - h + 4} L${x + fw},${y - h + fh} L${x + fw * 0.6},${y - h + fh - 8} L${x + 1.6},${y - h + fh - 4} Z`} />)}
		</g>
		{/* the ground: a wash that deepens toward us, dry-brush scumble */}
		<rect y={690} width={W} height={H - 690} fill="url(#b1gnd)" filter="url(#b0wash)" />
		<g stroke={INK} strokeWidth={3} opacity={0.22} filter="url(#b0br)">{Array.from({length: 26}, (_, i) => <path key={i} d={`M${rnd(i, 1) * 1900},${760 + rnd(i, 2) * 300} l${80 + rnd(i, 3) * 160},${-4 + rnd(i, 4) * 8}`} />)}</g>
		{/* mid: soldiers round a second fire, as ink silhouettes */}
		<FireB x={374} y={796} s={0.26} id="b1f2" />
		<g filter="url(#b0br)">{npcs.map((n, i) => <g key={i} transform={at(n.x, n.y, n.k, n.flip)}><FigA b={build(n.pose)} pal={PB} p="b0" id={`b1n${i}`} sil silC="#3A342C" /></g>)}</g>
		{/* near: the log, the brothers, the 牍, the fire */}
		<g fill="#3A342C" filter="url(#b0br)"><path d="M560,1080 L540,930 C540,904 560,892 600,892 L790,890 C820,890 834,904 834,930 L850,1080 Z" /><path d="M760,1090 C756,1010 770,950 820,936 C900,926 1080,930 1200,934 C1250,936 1270,970 1268,1090 Z" /></g>
		<g filter="url(#b0br)">
			<g transform={at(S.jing.x, S.jing.y, S.jing.k)}><FigA b={jb} pal={PB_ARM} p="b0" id="b1j" ink={ink} eye={INK} /></g>
			<g transform={at(hf.x, hf.y, hf.k)}><FigA b={hb} pal={PB} p="b0" id="b1h" ink={ink} eye={INK} /></g>
		</g>
		<g transform={`translate(${duP[0]},${duP[1]}) rotate(${S.du.tilt}) scale(${hf.k * S.du.s})`}><DuB id="b1du" cols={3} /></g>
		<g transform={at(hf.x, hf.y, hf.k)} filter="url(#b0br)"><Brush a={S.brush.a} b={S.brush.b} /><path d={hb.armN.hand} fill={PB.skin} stroke={INK} strokeWidth={0.32} /></g>
		<FireB x={S.fire.x} y={S.fire.y} s={S.fire.s} id="b1f" />
		<Paper p="b0" />
	</Svg>; };

/* ============================== beat 2 ============================== */
export const Look2: React.FC = () => { const S = B2, mb = build(S.mother.pose), zb = build(S.zhong.pose), m = S.mother;
	const duP: P = [m.x - S.du.at[0] * m.k, m.y + S.du.at[1] * m.k], ink = {c: INK, w: 0.32};
	return <Svg>
		<defs><InkDefs p="b0" />
			<linearGradient id="b2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C4BBA8" /><stop offset="0.5" stopColor={PAPER} /><stop offset="0.62" stopColor="#E6D2B0" /></linearGradient>
			<linearGradient id="b2gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6CCB6" /><stop offset="1" stopColor="#8E8574" /></linearGradient>
		</defs>
		<rect width={W} height={H} fill={PAPER} />
		<rect width={W} height={720} fill="url(#b2sky)" filter="url(#b0wash)" />
		<Ridge id="b2r1" c="#A49C8A" d="M-40,640 C160,580 340,570 520,600 C700,560 900,566 1080,596 C1300,560 1560,570 1960,590 L1960,720 L-40,720 Z" o={0.75} />
		{/* kitchen smoke from the village, pale ink */}
		{[[205, 650], [610, 654]].map(([x, y], i) => <path key={i} d={`M${x},${y} C${x - 20},${y - 80} ${x + 40},${y - 150} ${x + 20},${y - 260}`} stroke="#8E8676" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.3} filter="url(#b0wash)" />)}
		{[[120, 676], [210, 670], [600, 674], [700, 678]].map(([x, y], i) => <path key={i} d={`M${x - 36},${y} L${x - 30},${y - 18} L${x + 30},${y - 18} L${x + 36},${y} Z`} fill="#6E675A" opacity={0.6} filter="url(#b0br)" />)}
		{/* the courtyard wall and a mulberry in ink dabs */}
		<g filter="url(#b0br)">
			{Array.from({length: 60}, (_, i) => { const a = rnd(i, 1) * Math.PI * 2, r = rnd(i, 2) * 120; return <ellipse key={i} cx={860 + Math.cos(a) * r * 1.3} cy={520 + Math.sin(a) * r * 0.7} rx={18 + rnd(i, 3) * 10} ry={9 + rnd(i, 4) * 5} transform={`rotate(${rnd(i, 5) * 180} ${860 + Math.cos(a) * r * 1.3} ${520 + Math.sin(a) * r * 0.7})`} fill={INK} opacity={0.35 + rnd(i, 6) * 0.35} />; })}
			<path d="M852,700 L856,560 L866,560 L872,700 Z" fill={INK} opacity={0.8} />
			<path d="M-20,700 L-20,646 L1110,646 L1110,700 Z" fill="#B6AC98" stroke={INK} strokeWidth={2} />
			<path d="M-30,650 C300,632 800,632 1120,646 L1120,634 C800,620 300,618 -30,636 Z" fill="#4E473E" />
		</g>
		<rect y={698} width={W} height={H - 698} fill="url(#b2gnd)" filter="url(#b0wash)" />
		{/* the well and its 桔槔 in brush line */}
		<g filter="url(#b0br)" fill={INK} stroke={INK}>
			<path d="M320,850 C320,830 380,822 440,822 C500,822 560,830 560,850 L556,900 C530,914 350,914 324,900 Z" fill="#9A9282" strokeWidth={3} />
			<path d="M640,900 L646,560 L660,560 L666,900 Z" /><path d="M372,424 L900,676 L896,686 L368,434 Z" />
			<ellipse cx={904} cy={688} rx={28} ry={22} /><path d="M374,430 L430,780" strokeWidth={2.4} fill="none" /><path d="M412,780 L448,780 L444,812 L416,812 Z" />
		</g>
		{/* the house: rammed-earth courses in a pale wash, the thatch as massed dry strokes, the dark doorway */}
		<g filter="url(#b0br)">
			<path d="M1060,930 L1060,470 L1960,470 L1960,930 Z" fill="#CFC4AC" stroke={INK} strokeWidth={3} />
			{Array.from({length: 18}, (_, i) => <path key={i} d={`M1060,${492 + i * 25} L1960,${492 + i * 25 + (i % 2 ? 2 : -2)}`} stroke="#6E675A" strokeOpacity={0.45} strokeWidth={2} />)}
			<path d="M1250,930 L1250,580 L1520,580 L1520,930 Z" fill="#2A251F" />
			<path d="M1700,700 L1820,700 L1820,770 L1700,770 Z" fill="#2A251F" />
			<path d="M990,512 C1000,498 1060,470 1160,410 C1240,362 1300,330 1340,300 L1960,300 L1960,526 C1700,540 1300,538 1000,530 C984,528 982,518 990,512 Z" fill="#8E8676" />
			{Array.from({length: 110}, (_, i) => { const u = i / 109, x0 = 995 + u * 965, x1 = 1340 + u * 620; return <path key={i} d={`M${f2(x0 + (rnd(i, 1) - 0.5) * 10)},${f2(530 + rnd(i, 2) * 10)} L${f2(x1 + (rnd(i, 3) - 0.5) * 20)},${300 + rnd(i, 4) * 90}`} stroke={INK} strokeOpacity={0.25 + rnd(i, 5) * 0.4} strokeWidth={1.4 + rnd(i, 6) * 2} />; })}
			<path d="M1040,930 L1980,930 L1980,1000 L1020,1000 Z" fill="#A69C88" stroke={INK} strokeWidth={2.4} />
		</g>
		<g filter="url(#b0br)">
			<g transform={at(S.zhong.x, S.zhong.y, S.zhong.k)}><FigA b={zb} pal={PB_FAR} p="b0" id="b2z" ink={ink} eye={INK} /></g>
			<g transform={at(m.x, m.y, m.k, true)}><FigA b={mb} pal={PB_MOM} p="b0" id="b2m" ink={ink} eye={INK} /></g>
		</g>
		<g transform={`translate(${duP[0]},${duP[1]}) rotate(${-S.du.tilt}) scale(${m.k * S.du.s})`}><DuB id="b2du" cols={4} halo={1.3} /></g>
		<g transform={at(m.x, m.y, m.k, true)} filter="url(#b0br)"><path d={mb.armN.hand} fill={PB.skin} stroke={INK} strokeWidth={0.32} /></g>
		<Paper p="b0" />
	</Svg>; };

/* ============================== beat 3 ============================== */
export const Look3: React.FC = () => { const D = B3.du, k = D.k, L: P = [1530, 400];
	const HL = {x: 830, y: 905, a: 6}, HR = {x: 1150, y: 880, a: -8};
	const hand = (h: {x: number; y: number; a: number}, left: boolean, part: 'under' | 'thumb') => <g transform={`translate(${h.x},${h.y}) rotate(${h.a}) scale(${left ? -k : k},${k})`} strokeLinejoin="round">
		{part === 'under' ? <g>
			<path d={GLOVE.sleeve} fill="#6A6356" stroke={INK} strokeWidth={0.2} />
			<path d={GLOVE.cuff} fill="#D8CFBC" stroke={INK} strokeWidth={0.14} />
			<path d={GLOVE.palm} fill="#F2EAD8" stroke={INK} strokeWidth={0.16} />
			<path d={GLOVE.crease} stroke={INK} strokeWidth={0.1} fill="none" opacity={0.6} />
		</g> : <g><path d={GLOVE.thumb} fill="#F2EAD8" stroke={INK} strokeWidth={0.14} /></g>}
	</g>;
	return <Svg>
		<defs><InkDefs p="b0" />
			<radialGradient id="b3lamp" cx={L[0]} cy={L[1]} r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#E0A840" stopOpacity="0.4" /><stop offset="0.3" stopColor="#E0A840" stopOpacity="0.12" /><stop offset="1" stopColor="#E0A840" stopOpacity="0" /></radialGradient>
			<linearGradient id="b3dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0.2" stopColor={INK} stopOpacity="0" /><stop offset="0.55" stopColor={INK} stopOpacity="0.2" /><stop offset="1" stopColor={INK} stopOpacity="0.6" /></linearGradient>
		</defs>
		<rect width={W} height={H} fill={PAPER} />
		{/* the 椁: boards as broad ink strokes with dry-brush grain, the wall band at the top in dense ink */}
		<g filter="url(#b0wash)">
			{Array.from({length: 9}, (_, i) => { const x = -160 + i * 270; return <path key={i} d={`M${x + 6},${H + 20} L${x + 126},236 L${x + 374},236 L${x + 264},${H + 20} Z`} fill={i % 2 ? '#6A6254' : '#766E60'} />; })}
			<path d="M-20,-20 L1960,-20 L1960,240 L-20,240 Z" fill="#B4AA96" />
		</g>
		<g filter="url(#b0br)" stroke={INK} fill="none">
			{Array.from({length: 9}, (_, i) => { const x = -160 + i * 270; return <g key={i}><path d={`M${x},${H + 20} L${x + 120},236`} strokeWidth={5} opacity={0.8} />
				{Array.from({length: 4}, (_, j) => <path key={j} d={`M${x + 50 + j * 56},${H + 20} C${x + 100 + j * 48},700 ${x + 150 + j * 50},420 ${x + 170 + j * 50},236`} strokeWidth={1.6} opacity={0.35} />)}</g>; })}
			{Array.from({length: 8}, (_, i) => <path key={i} d={`M-20,${18 + i * 28} L1960,${22 + i * 28}`} strokeWidth={2} opacity={0.3} />)}
		</g>
		<rect width={W} height={H} fill="url(#b3dark)" />
		<rect width={W} height={H} fill="url(#b3lamp)" />
		{/* lacquer in ink with cinnabar interiors — the accent — and the 奁 */}
		<g filter="url(#b0br)">
			<EarCup x={300} y={640} s={1.25} ang={-18} out={INK} inn={ZHU} rim="#F0B090" />
			<EarCup x={420} y={850} s={1.05} ang={14} out={INK} inn={ZHU} rim="#F0B090" />
			<g transform="translate(1600,860)"><ellipse cx={0} cy={-16} rx={160} ry={96} fill={INK} /><ellipse cx={0} cy={-16} rx={124} ry={72} fill="none" stroke={ZHU} strokeWidth={8} /><ellipse cx={0} cy={-16} rx={88} ry={50} fill="none" stroke={ZHU} strokeWidth={3} /></g>
			<g transform="translate(190,400)"><ellipse cx={0} cy={30} rx={86} ry={50} fill="#4E473E" /><ellipse cx={0} cy={-10} rx={34} ry={20} fill={INK} /></g>
		</g>
		{/* the lamp: a few lines, its light a gold wash */}
		<g filter="url(#b0br)" stroke={INK} fill="none" strokeWidth={4} transform={`translate(${L[0]},${L[1] + 10}) scale(1.05)`}>
			<path d="M-46,0 L46,0 L42,-26 L-42,-26 Z" fill={INK} /><path d="M-30,-26 C-44,-60 -44,-100 -26,-128 L26,-128 C44,-100 44,-60 30,-26 Z" fill="#F2D49A" />
			<path d="M-36,-128 L36,-128 L28,-150 L-28,-150 Z" fill={INK} /><path d="M-40,-140 C-50,-200 50,-200 40,-140" />
		</g>
		<g filter="url(#b0br)">{hand(HL, true, 'under')}{hand(HR, false, 'under')}</g>
		<g transform={`translate(${D.x},${D.y}) rotate(${D.ang + 90}) scale(${k}) translate(0,${DU_L / 2})`}><DuB id="b3du" age={1} cols={4} halo={1.1} /></g>
		<g filter="url(#b0br)">{hand(HL, true, 'thumb')}{hand(HR, false, 'thumb')}</g>
		<Paper p="b0" />
	</Svg>; };
void sm;

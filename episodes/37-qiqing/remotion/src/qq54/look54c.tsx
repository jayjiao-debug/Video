import React from 'react';
import {W, H, SANS, SERIF, rnd} from '../qq50/kit50';
import {Han, Kit, Lite, Pose, Cel, mixc} from './char54c';
/* ep54 look C 「全角色」 — the 马首 family (flat-vector 2.5D layered sets, one key light, warm-black silhouettes with rim light),
   with every named / foreground character drawn as a cel-shaded flat-vector person with a face. Masses stay silhouettes.
   Look1 = the style sheet (owner's call 2026-10-31: style first). Look2 / Look3 are stubs. */
const PAL = {sky0: '#16242A', sky1: '#2F4246', sky2: '#4A5752', earth: '#8A6A4E', tile: '#2A2826', sil: '#140D0A', lamp: '#F3DDB4', skin: '#C99A78', zao: '#3A2C26', red: '#A8321F', cream: '#F2E6CC'};
const CAP: React.CSSProperties = {position: 'absolute', fontFamily: SANS, fontSize: 23, fontWeight: 500, color: PAL.cream, letterSpacing: '0.04em', whiteSpace: 'nowrap'};
const f1 = (v: number) => v.toFixed(1);
const lt0: Lite = {L: [0.8, -0.6], s: 3, rim: [-0.74, -0.67], r: 0.42, rimC: '#7F9290', dark: '#160D0B', k: 0.52};

/* ---------- Han architecture parts (set units) ---------- */
/** a hip roof seen frontally: eave from x0..x1 at y (eave line), ridge from r0..r1 at yr; straight ridge, ends raised by up */
const Roof: React.FC<{x0: number; x1: number; y: number; r0: number; r1: number; yr: number; up?: number; col?: string; rim?: string; tiles?: number; eave?: number; id: string}> = ({x0, x1, y, r0, r1, yr, up = 6, col = PAL.tile, rim = '#8C9A94', tiles = 40, eave = 9, id}) => {
	const lines: string[] = []; for (let i = 1; i < tiles; i++) { const u = i / tiles, xe = x0 + (x1 - x0) * u, xr = r0 + (r1 - r0) * u; lines.push(`M${f1(xe)},${f1(y - 1)} L${f1(xr)},${f1(yr + 4)}`); }
	const dots: React.ReactNode[] = []; for (let i = 0; i <= tiles; i++) { const xe = x0 + 6 + (x1 - x0 - 12) * i / tiles; dots.push(<circle key={i} cx={xe} cy={y + eave * 0.55} r={eave * 0.32} fill={mixc(col, '#000000', 0.35)} />); }
	return <g>
		<defs><linearGradient id={`rf${id}`} x1="0" y1={yr} x2="0" y2={y} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={mixc(col, rim, 0.28)} /><stop offset="1" stopColor={col} /></linearGradient></defs>
		<path d={`M${x0},${y} L${r0},${yr} L${r1},${yr} L${x1},${y} Z`} fill={`url(#rf${id})`} />
		<path d={lines.join(' ')} stroke={mixc(col, '#000000', 0.4)} strokeWidth={1.6} opacity={0.8} />
		<path d={lines.join(' ')} stroke={mixc(col, rim, 0.25)} strokeWidth={0.8} opacity={0.5} transform="translate(1.6,0)" />
		<path d={`M${x0 - 4},${y} L${x1 + 4},${y} L${x1 + 2},${y + eave} L${x0 - 2},${y + eave} Z`} fill={mixc(col, '#000000', 0.25)} />{dots}
		<path d={`M${r0 - 10},${yr - up} Q${r0},${yr + 1} ${r0 + 20},${yr} L${r1 - 20},${yr} Q${r1},${yr + 1} ${r1 + 10},${yr - up} L${r1 + 8},${yr + 9} L${r0 - 8},${yr + 9} Z`} fill={mixc(col, '#000000', 0.3)} />
		<path d={`M${r0 - 10},${yr - up} Q${r0},${yr + 1} ${r0 + 20},${yr} L${r1 - 20},${yr} Q${r1},${yr + 1} ${r1 + 10},${yr - up}`} stroke={rim} strokeWidth={1.4} fill="none" opacity={0.7} />
		<path d={`M${x0},${y} L${r0},${yr + 6} M${x1},${y} L${r1},${yr + 6}`} stroke={mixc(col, rim, 0.35)} strokeWidth={2.2} />
	</g>; };
/** 斗拱 band: one bracket set (栌斗 + 栱 + three 散斗) centred at x on the beam line y, scale s */
const Dougong: React.FC<{x: number; y: number; s?: number; c?: string; lit?: string}> = ({x, y, s = 1, c = '#2E1E16', lit = '#7A5236'}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d="M-9,0 L9,0 L7,-8 L-7,-8 Z" fill={c} /><path d="M-26,-8 L26,-8 L24,-13 L-24,-13 Z" fill={c} />
	{[-22, 0, 22].map((dx) => <path key={dx} d={`M${dx - 6},-13 L${dx + 6},-13 L${dx + 5},-19 L${dx - 5},-19 Z`} fill={c} />)}
	<path d="M-26,-8 L26,-8 M-9,0 L9,0" stroke={lit} strokeWidth={1} opacity={0.8} /></g>;
/** rammed-earth tamping courses on a rect */
const Courses: React.FC<{x0: number; x1: number; y0: number; y1: number; step?: number; o?: number; seed?: number}> = ({x0, x1, y0, y1, step = 13, o = 0.16, seed = 1}) => {
	const d: string[] = []; for (let y = y0 + step, i = 0; y < y1; y += step, i++) { d.push(`M${x0},${f1(y + (rnd(i, seed) - 0.5) * 1.6)} L${x1},${f1(y + (rnd(i + 9, seed) - 0.5) * 1.6)}`);
		for (let x = x0 + rnd(i, seed + 3) * 110; x < x1; x += 90 + rnd(i * 7 + x, seed) * 80) d.push(`M${f1(x)},${f1(y)} L${f1(x)},${f1(y + step)}`); }
	return <path d={d.join(' ')} stroke="#000000" strokeWidth={1.1} opacity={o} />; };

/* ---------- silhouettes (masses) ---------- */
const SilMan: React.FC<{x: number; y: number; h: number; flip?: boolean; ji?: boolean; lamp?: boolean; walk?: number; rim?: string; rimSide?: number}> = ({x, y, h, flip, ji, lamp, walk = 0, rim = '#E8B07A', rimSide = 1}) => { const k = h / 100, sx = flip ? -k : k;
	const body = `M-7,-80 C-11,-70 -12,-50 -11,-40 C-12,-26 ${-13 - walk * 6},-10 ${-14 - walk * 8},0 L-4,0 L-2,-22 L1,0 L${12 + walk * 8},0 C${11 + walk * 5},-12 10,-28 9,-40 C10,-52 9,-70 6,-80 C2,-83 -3,-83 -7,-80 Z`;
	return <g transform={`translate(${x},${y}) scale(${sx},${k})`}>
		{ji && <><path d="M15,4 L15,-118" stroke={PAL.sil} strokeWidth={2.2} /><path d="M13.8,-118 L15,-128 L16.2,-118 Z M15,-112 L24,-109 L15,-107.6 Z" fill={PAL.sil} /></>}
		{lamp && <><path d="M12,-50 L22,-74 L22,-60" stroke={PAL.sil} strokeWidth={1.6} fill="none" /><ellipse cx={22} cy={-55} rx={4} ry={5.5} fill={PAL.lamp} /><circle cx={22} cy={-55} r={22} fill="url(#lampGlow)" /></>}
		<path d={body} fill={PAL.sil} />
		<ellipse cx={0.5} cy={-89} rx={6.4} ry={7.4} fill={PAL.sil} /><path d="M-6,-93 C-6,-101 6,-102 7,-94 L7,-91 L-6,-90 Z" fill={PAL.sil} />
		<path d="M-8,-79 C-14,-66 -14,-52 -10,-44 M9,-79 C14,-68 16,-56 13,-48" stroke={PAL.sil} strokeWidth={5} strokeLinecap="round" fill="none" />
		<path d={body} fill="none" stroke={rim} strokeWidth={1.3 / k} opacity={0.85} transform={`translate(${-rimSide * 1.1 / k},0)`} clipPath="url(#none)" />
	</g>; };

/* ---------- 1. the set: 洛阳 city gate at night (1600 × 900 set units) ---------- */
const Gate: React.FC = () => {
	const passages: [number, number, number][] = [[735, 865, 556], [622, 708, 592], [892, 978, 592]];
	return <g>
		<defs>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C2B31" /><stop offset="0.45" stopColor="#2A3D42" /><stop offset="0.75" stopColor="#3A4D4D" /><stop offset="1" stopColor="#56645C" /></linearGradient>
			<radialGradient id="moonHalo"><stop offset="0" stopColor="#DCE3D8" stopOpacity="0.5" /><stop offset="0.2" stopColor="#B9C6C0" stopOpacity="0.16" /><stop offset="1" stopColor="#8FA19E" stopOpacity="0" /></radialGradient>
			<radialGradient id="gateGlow" cx="800" cy="650" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F0C890" stopOpacity="0.85" /><stop offset="0.3" stopColor="#D49A62" stopOpacity="0.5" /><stop offset="0.6" stopColor="#8A5A3A" stopOpacity="0.14" /><stop offset="1" stopColor="#5A3A2A" stopOpacity="0" /></radialGradient>
			<radialGradient id="passGlow"><stop offset="0" stopColor="#FFF0D0" /><stop offset="0.35" stopColor={PAL.lamp} /><stop offset="0.75" stopColor="#D49A62" /><stop offset="1" stopColor="#7A4A2C" /></radialGradient>
			<radialGradient id="lampGlow"><stop offset="0" stopColor={PAL.lamp} stopOpacity="0.55" /><stop offset="1" stopColor={PAL.lamp} stopOpacity="0" /></radialGradient>
			<linearGradient id="wallG" x1="0" y1="470" x2="0" y2="700" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#48443C" /><stop offset="0.25" stopColor="#3A352F" /><stop offset="1" stopColor="#2A231E" /></linearGradient>
			<linearGradient id="haze1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.sky2} stopOpacity="0" /><stop offset="0.7" stopColor={PAL.sky2} stopOpacity="0.5" /><stop offset="1" stopColor={PAL.sky2} stopOpacity="0.15" /></linearGradient>
			<linearGradient id="roadG" x1="0" y1="690" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#B88A5E" /><stop offset="0.35" stopColor="#6E5038" /><stop offset="1" stopColor="#2A1E16" /></linearGradient>
			<linearGradient id="queG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1A1210" /><stop offset="0.8" stopColor="#2A1D16" /><stop offset="1" stopColor="#4A3222" /></linearGradient>
			<linearGradient id="queGR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#1A1210" /><stop offset="0.8" stopColor="#2A1D16" /><stop offset="1" stopColor="#4A3222" /></linearGradient>
			<filter id="b2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2" /></filter>
			<filter id="b4" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4" /></filter>
			<filter id="b9" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
			<radialGradient id="vig" cx="0.5" cy="0.55" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
		</defs>
		{/* L0 sky */}
		<rect width={1600} height={900} fill="url(#sky)" />
		{Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i, 3) * 1600} cy={rnd(i, 4) * 330} r={0.6 + rnd(i, 5) * 0.9} fill="#DDE6E0" opacity={0.25 + rnd(i, 6) * 0.4} />)}
		<circle cx={1330} cy={128} r={170} fill="url(#moonHalo)" /><circle cx={1330} cy={128} r={17} fill="#E6E4D4" />
		{/* L1 far: 邙山 and the roofs of the city inside the wall (haze, blurred) */}
		<g filter="url(#b4)">
			<path d="M0,520 C120,470 260,452 420,478 C560,500 640,440 820,436 C980,432 1100,470 1240,462 C1380,454 1500,488 1600,470 L1600,640 L0,640 Z" fill="#2C3B3C" />
			{[[180, 470, 120], [420, 482, 90], [1180, 470, 140], [1420, 480, 100]].map(([x, y, w], i) => <g key={i}><path d={`M${x - w / 2},${y} L${x - w / 3},${y - 26} L${x + w / 3},${y - 26} L${x + w / 2},${y} Z`} fill="#26332F" /><rect x={x - w * 0.36} y={y} width={w * 0.72} height={30} fill="#26332F" />{[0, 1, 2].map((j) => <rect key={j} x={x - w * 0.25 + j * w * 0.2} y={y + 9} width={w * 0.06} height={10} fill={PAL.lamp} opacity={0.45} />)}</g>)}
		</g>
		<rect y={380} width={1600} height={300} fill="url(#haze1)" />
		{/* L2 the city wall (rammed earth) with its parapet, lit by the passages */}
		<rect x={0} y={470} width={1600} height={232} fill="url(#wallG)" />
		<Courses x0={0} x1={1600} y0={470} y1={700} step={14} o={0.2} />
		<rect x={0} y={470} width={1600} height={232} fill="url(#gateGlow)" />
		{Array.from({length: 54}, (_, i) => <rect key={i} x={i * 30} y={454} width={18} height={17} fill="#3A3630" />)}
		<rect x={0} y={466} width={1600} height={6} fill="#4C4840" />
		<path d="M0,454 L1600,454" stroke="#7E8C88" strokeWidth={1} opacity={0.35} />
		{/* 一门三道: flat timber-lintel passages (Han gates were not arched), torch-lit inside */}
		{passages.map(([a, b, t], i) => { const w = b - a, ix = a + w * 0.3, iw = w * 0.4, iy = t + (700 - t) * 0.32;
			return <g key={i}>
				<rect x={a - 8} y={t - 12} width={w + 16} height={14} fill="#2A1A10" /><path d={`M${a - 8},${t - 12} L${b + 8},${t - 12}`} stroke="#9A6A42" strokeWidth={1.2} />
				<rect x={a} y={t} width={w} height={702 - t} fill="#5A3622" />
				<path d={`M${a},${t} L${ix},${iy} L${ix},702 L${a},702 Z`} fill="#8A5A36" /><path d={`M${b},${t} L${ix + iw},${iy} L${ix + iw},702 L${b},702 Z`} fill="#6E4428" />
				{[0.25, 0.5, 0.75].map((u) => <path key={u} d={`M${a + (ix - a) * u},${t + (iy - t) * u} L${a + (ix - a) * u},702 M${b - (b - ix - iw) * u},${t + (iy - t) * u} L${b - (b - ix - iw) * u},702`} stroke="#3A2214" strokeWidth={2.4} />)}
				<path d={`M${a},${t} L${ix},${iy} L${ix + iw},${iy} L${b},${t} Z`} fill="#3E2416" />
				<rect x={ix} y={iy} width={iw} height={702 - iy} fill="url(#passGlow)" />
			</g>; })}
		{/* 门楼 on the wall: 平坐 railing, five bays, 斗拱, hip roof with straight ridge */}
		<rect x={548} y={440} width={504} height={18} fill="#2A1C14" /><path d="M548,440 L1052,440" stroke="#8A6A4A" strokeWidth={1.2} />
		{Array.from({length: 25}, (_, i) => <rect key={i} x={556 + i * 20} y={426} width={3} height={14} fill="#2A1C14" />)}<rect x={548} y={424} width={504} height={4} fill="#3A2818" />
		<rect x={590} y={344} width={420} height={96} fill="#3A2A20" />
		{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={604 + i * 82} y={362} width={64} height={62} fill="#7A5A3A" opacity={0.85} /><rect x={604 + i * 82} y={362} width={64} height={62} fill="#E9C48E" opacity={0.25 + (i === 2 ? 0.25 : 0.1)} />
			{Array.from({length: 7}, (_, j) => <path key={j} d={`M${612 + i * 82 + j * 8},362 L${612 + i * 82 + j * 8},424`} stroke="#3A2618" strokeWidth={2} />)}<path d={`M${604 + i * 82},392 L${668 + i * 82},392`} stroke="#3A2618" strokeWidth={2} /></g>)}
		{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={588 + i * 82} y={344} width={12} height={96} fill="#2A1A10" />)}
		<rect x={576} y={334} width={448} height={10} fill="#2A1A10" />
		{[0, 1, 2, 3, 4, 5].map((i) => <Dougong key={i} x={594 + i * 82} y={334} s={0.95} />)}
		{[0, 1, 2, 3, 4].map((i) => <Dougong key={i} x={635 + i * 82} y={334} s={0.6} />)}
		<Roof id="ml" x0={500} x1={1100} y={300} r0={650} r1={950} yr={212} up={9} tiles={46} eave={10} />
		{/* haze at the wall base */}
		<rect y={640} width={1600} height={70} fill="#8A6A50" opacity={0.12} />
		{/* the road and the light spilling out of the passages */}
		<path d="M0,702 L1600,702 L1600,900 L0,900 Z" fill="#1E1713" />
		<path d="M622,702 L978,702 L1330,900 L270,900 Z" fill="url(#roadG)" opacity={0.85} />
		<g filter="url(#b9)" opacity={0.7}>{passages.map(([a, b], i) => <path key={i} d={`M${a + 6},702 L${b - 6},702 L${b + (b - 800) * 1.4 + 70},900 L${a + (a - 800) * 1.4 - 70},900 Z`} fill="#F0C890" opacity={i ? 0.3 : 0.5} />)}</g>
		<rect y={560} width={1600} height={150} fill="#56645C" opacity={0.1} />
		{[600, 1000].map((x) => <g key={x}><path d={`M${x},640 L${x},600`} stroke="#1A110C" strokeWidth={4} /><ellipse cx={x} cy={594} rx={5} ry={9} fill={PAL.lamp} /><circle cx={x} cy={594} r={40} fill="url(#lampGlow)" /></g>)}
		{/* gate guards (silhouettes, rim from the passage light) */}
		<Han id="g1" x={706} y={704} k={0.5} kit={kit20} lt={ltSil(-1)} sil={PAL.sil} shadow={0} pose={guardPose} />
		<Han id="g2" x={894} y={704} k={0.5} flip kit={kit20} lt={ltSil(1)} sil={PAL.sil} shadow={0} pose={guardPose} />
		{/* L3 the paired 门阙 (子母阙), nearer, warm black with the gate-side rim */}
		{[[290, -1], [1310, 1]].map(([c, s]) => { const sx = s as number, inner = -sx, g = sx < 0 ? 'url(#queG)' : 'url(#queGR)';
			return <g key={c}>
				<rect x={c + sx * 58 + (sx < 0 ? -78 : 0)} y={560} width={78} height={190} fill={g} />
				<Roof id={`zq${c}`} x0={c + sx * 58 + (sx < 0 ? -104 : -14)} x1={c + sx * 58 + (sx < 0 ? 14 : 104)} y={560} r0={c + sx * 58 + (sx < 0 ? -66 : 18)} r1={c + sx * 58 + (sx < 0 ? -18 : 66)} yr={526} up={4} tiles={12} eave={7} col="#1E1714" rim="#C08A5C" />
				<path d={`M${c - 80},752 L${c + 80},752 L${c + 76},724 L${c - 76},724 Z`} fill="#1A1210" />
				<path d={`M${c - 66},724 L${c + 66},724 L${c + 60},410 L${c - 60},410 Z`} fill={g} />
				<Courses x0={c - 64} x1={c + 64} y0={410} y1={724} step={16} o={0.25} seed={c} />
				<path d={`M${c + inner * 66},724 L${c + inner * 60},410`} stroke="#E8B07A" strokeWidth={2.4} opacity={0.85} />
				<rect x={c - 72} y={392} width={144} height={18} fill="#22160F" /><path d={`M${c - 72},392 L${c + 72},392`} stroke="#B07A50" strokeWidth={1} opacity={0.7} />
				{[-50, -17, 17, 50].map((dx) => <Dougong key={dx} x={c + dx} y={392} s={0.62} c="#1A110C" lit="#B07A50" />)}
				<rect x={c - 82} y={366} width={164} height={14} fill="#1E140E" />{Array.from({length: 9}, (_, j) => <rect key={j} x={c - 78 + j * 19} y={368} width={8} height={10} fill="#3A281C" />)}
				{[-60, -20, 20, 60].map((dx) => <Dougong key={dx} x={c + dx} y={366} s={0.72} c="#1A110C" lit="#B07A50" />)}
				<Roof id={`q1${c}`} x0={c - 124} x1={c + 124} y={346} r0={c - 54} r1={c + 54} yr={290} up={7} tiles={26} eave={10} col="#1E1714" rim="#C08A5C" />
			</g>; })}
		{/* L4 travellers on the road (silhouettes): a clerk with a lamp-pole and his servant walking to the gate */}
		<Han id="t1" x={488} y={852} k={0.86} kit={{...kit20, cap: 'ze'}} lt={ltSil(1)} sil={PAL.sil} shadow={0.35} pose={{near: {S: [-12, -134], E: [-15, -112], H: [-9, -98], w1: 11, w2: 13, drape: 9}, far: {S: [10, -135], E: [14, -113], H: [12, -98]}}} />
		<Han id="t2" x={570} y={846} k={0.98} kit={kit20} lt={ltSil(1)} sil={PAL.sil} shadow={0.35} pose={{near: {S: [-12, -134], E: [-15, -112], H: [-9, -99], w1: 11, w2: 13, drape: 9}, far: {S: [10, -135], E: [20, -120], H: [30, -124]},
			gripFar: <g><path d="M30,-124 L44,-150 L44,-134" stroke={PAL.sil} strokeWidth={1.6} fill="none" /><ellipse cx={44} cy={-128} rx={4.4} ry={6} fill={PAL.lamp} /><circle cx={44} cy={-128} r={30} fill="url(#lampGlow)" /></g>}} />
		{/* L5 foreground: willow branches, out of focus */}
		<g filter="url(#b9)" opacity={0.95}>
			<path d="M0,900 L0,840 C300,820 500,850 700,880 L700,900 Z" fill="#0E0A08" />
		</g>
		{/* L4b the hero in the set (variant C: named characters are drawn people): the young 北部尉 with his rod, keyed by the gate light, moon rim */}
		<ellipse cx={1150} cy={892} rx={130} ry={10} fill="#0A0605" opacity={0.55} />
		<path d="M1150,886 L1330,912 L1318,924 L1140,896 Z" fill="#0A0605" opacity={0.32} />
		<Han id="hero" x={1170} y={890} k={1.95} flip kit={kit20} lt={{L: [-0.92, -0.38], s: 3.4, rim: [0.55, -0.83], r: 0.6, rimC: '#9DB0AC', dark: '#140C0A', k: 0.6}} shadow={0}
			pose={{near: {S: [-12, -134], E: [-17.5, -113], H: [-13, -99], w1: 11, w2: 12.5, drape: 9}, far: {S: [10, -135], E: [19, -116], H: [25, -106], w1: 10, w2: 12, drape: 8},
				gripFar: <Rod x={29.5} y0={2} y1={-168} c={PAL.red} w={3.4} />}} />
		<Pine />
		<rect width={1600} height={900} fill="url(#vig)" />
	</g>; };
/** a pine bough hanging into the top-left corner: flat needle pads (jagged top edge), moonlit top rim; nearest plane, crisp */
const pad = (cx: number, cy: number, w: number, h: number, seed: number) => { const n = 26, top: string[] = [], bot: string[] = [];
	for (let i = 0; i <= n; i++) { const u = i / n, x = cx - w / 2 + w * u, e = Math.sin(u * Math.PI);
		top.push(`${(x + (rnd(i, seed) - 0.5) * 6).toFixed(1)},${(cy - h * e * (0.7 + 0.5 * rnd(i, seed + 1)) - (i % 2 ? 7 : 0) * e).toFixed(1)}`);
		bot.push(`${x.toFixed(1)},${(cy + h * 0.35 * e).toFixed(1)}`); }
	return 'M' + top.join(' L') + ' L' + bot.reverse().join(' L') + 'Z'; };
const Pine: React.FC = () => { const pads: [number, number, number, number][] = [[60, 96, 230, 46], [250, 150, 210, 40], [120, 214, 170, 34], [-10, 300, 150, 30]];
	return <g>
		<path d="M-40,40 C40,60 120,110 250,150 M60,96 C80,150 100,190 120,214 M20,120 C10,200 0,250 -10,300" stroke="#0B0706" strokeWidth={10} fill="none" strokeLinecap="round" />
		{pads.map(([x, y, w, h], i) => <g key={i}><path d={pad(x, y, w, h, i * 7 + 1)} fill="#0B0706" /><path d={pad(x, y, w, h, i * 7 + 1)} fill="none" stroke="#6E7E7A" strokeWidth={1.2} opacity={0.55} transform="translate(0,-1.2)" clipPath="url(#none)" /></g>)}
	</g>; };

/* ---------- 2. 曹操 ---------- */
const ltSil = (side: number): Lite => ({L: [side, 0], s: 0, rim: [side, -0.2], r: 1.4, rimC: '#E8B07A', dark: PAL.sil, k: 0});
const guardPose: Pose = {near: {S: [-12, -134], E: [-13, -112], H: [-4, -104], w1: 10, w2: 10, drape: 4}, far: {S: [10, -135], E: [16, -114], H: [22, -110]},
	gripFar: <g><path d="M24,4 L24,-196" stroke={PAL.sil} strokeWidth={2.6} /><path d="M22.4,-196 L24,-212 L25.6,-196 Z M24,-188 L36,-184 L24,-181.6 Z" fill={PAL.sil} /></g>};
const kit20: Kit = {skin: '#C99A78', hair: '#1B1512', robe: '#3A2C26', trim: PAL.red, under: '#D9CDB5', belt: '#2A1E16', shoe: '#1A1310', cap: 'wu', capC: '#211C1A', zeC: '#2E2420', beard: 1, slim: 0.9};
const kit46: Kit = {...kit20, beard: 2, slim: 1.02, armor: '#4A433C', lam: '#9C8E7C', robe: '#3E2E27'};
const Rod: React.FC<{x: number; y0: number; y1: number; c: string; w?: number}> = ({x, y0, y1, c, w = 3}) => <g>
	<rect x={x - w / 2} y={y1} width={w} height={y0 - y1} rx={w / 2} fill={mixc(c, '#000000', 0.35)} />
	<rect x={x - w / 2} y={y1} width={w * 0.55} height={y0 - y1} rx={w * 0.27} fill={c} />
	<rect x={x - w * 0.25} y={y1 + 2} width={w * 0.18} height={y0 - y1 - 4} fill="#ffffff" opacity={0.25} /></g>;
const Sword: React.FC<{sheath?: boolean}> = () => <g>
	{/* scabbard from the belt, angled back; grip forward with the ring pommel */}
	<path d="M-5,-95 L-41,-26 L-37.4,-24.4 L-1.6,-93.4 Z" fill="#1E1614" /><path d="M-5,-95 L-41,-26" stroke="#5A4A3A" strokeWidth={0.5} />
	<path d="M-8.6,-88 L-5.6,-86.4 M-37,-33 L-34,-31.4" stroke="#B49A62" strokeWidth={2.4} />
	<path d="M-3,-96.6 L7,-102" stroke="#2A1E16" strokeWidth={3.4} strokeLinecap="round" /><path d="M-3,-96.6 L7,-102" stroke="#6A5236" strokeWidth={3.4} strokeDasharray="0.9 1.2" />
	<circle cx={10.6} cy={-104} r={3.6} fill="none" stroke="#8A7A5A" strokeWidth={1.4} />
	<path d="M-4.6,-98.6 L-1.4,-94.4" stroke="#8A7A5A" strokeWidth={1.6} /></g>;
const Cao: React.FC = () => {
	const lt: Lite = {...lt0};
	return <g>
		<Han id="c20" x={1440} y={658} k={2.32} kit={kit20} lt={lt}
			pose={{near: {S: [-12, -134], E: [-17.5, -113], H: [-13, -99], w1: 11, w2: 12.5, drape: 9}, far: {S: [10, -135], E: [19, -116], H: [25, -106], w1: 10, w2: 12, drape: 8},
				gripFar: <Rod x={29.5} y0={2} y1={-168} c={PAL.red} w={3.4} />}} />
		<Han id="c46" x={1720} y={658} k={2.32} kit={kit46} lt={lt}
			pose={{near: {S: [-13, -134], E: [-18, -113], H: [-4, -101], w1: 10.5, w2: 10, drape: 4}, far: {S: [10, -135], E: [16, -114], H: [17, -98], w1: 10, w2: 10, drape: 4}, propUnder: <Sword />}} />
	</g>; };

/* ---------- 3. props ---------- */
const FIVE = ['#3F6E6A', PAL.red, '#B8913E', '#D8CFBC', '#262322'];
const RackP: React.FC = () => <g>
	<rect x={30} y={150} width={202} height={12} fill="#3A2618" /><rect x={30} y={150} width={202} height={3} fill="#8A6040" />
	{Array.from({length: 10}, (_, i) => <g key={i} transform={`rotate(${(i % 2 ? 1 : -1) * 1.2} ${50 + i * 18} 150)`}><Rod x={50 + i * 18} y0={152} y1={20 + (i % 3) * 3} c={FIVE[i % 5]} w={7.5} /></g>)}
	{[[36, 30], [222, 30]].map(([x]) => <g key={x}><rect x={x - 5} y={34} width={10} height={130} fill="#3A2618" /><rect x={x - 5} y={34} width={3} height={130} fill="#8A6040" /></g>)}
	<rect x={26} y={44} width={210} height={9} fill="#4A3020" /><rect x={26} y={44} width={210} height={2.5} fill="#9A7050" />
	<rect x={26} y={112} width={210} height={8} fill="#4A3020" /><rect x={26} y={112} width={210} height={2.5} fill="#9A7050" />
</g>;
const DaoP: React.FC = () => <g transform="translate(0,6)">
	<circle cx={30} cy={70} r={12} fill="none" stroke="#5E5A52" strokeWidth={5} /><circle cx={30} cy={70} r={12} fill="none" stroke="#A89F8E" strokeWidth={1.2} transform="translate(-1,-1)" />
	<rect x={41} y={65} width={42} height={10} rx={2} fill="#3A2A1E" />{Array.from({length: 8}, (_, i) => <path key={i} d={`M${44 + i * 5},65 L${48 + i * 5},75`} stroke="#7A5E40" strokeWidth={1.4} />)}
	<rect x={83} y={62} width={6} height={16} fill="#8A7A5A" />
	<path d="M89,64 L230,64 L244,70 L238,76 L89,76 Z" fill="#6E7476" /><path d="M89,64 L230,64 L244,70 L89,69 Z" fill="#A6ADAE" /><path d="M89,76 L238,76" stroke="#E2E6E2" strokeWidth={1} />
	<path d="M89,69.2 L236,69.6" stroke="#4A5052" strokeWidth={0.8} />
	<rect x={64} y={104} width={170} height={14} rx={6} fill="#211816" /><rect x={64} y={104} width={170} height={4} rx={2} fill="#4A3A30" />
	{[78, 150, 222].map((x) => <rect key={x} x={x} y={102} width={7} height={18} rx={1.5} fill="#B49A62" />)}
</g>;
const BannerP: React.FC = () => <g>
	<path d="M64,8 L64,184" stroke="#3A2618" strokeWidth={5} /><path d="M62.5,8 L62.5,184" stroke="#8A6040" strokeWidth={1.4} />
	<path d="M58,10 L64,-2 L70,10 Z" fill="#8A7A5A" /><path d="M60,22 L176,22" stroke="#3A2618" strokeWidth={4} />
	<defs><linearGradient id="banF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7A2014" /><stop offset="0.3" stopColor={PAL.red} /><stop offset="0.55" stopColor="#8E2818" /><stop offset="0.8" stopColor={PAL.red} /><stop offset="1" stopColor="#6E1C12" /></linearGradient></defs>
	<path d="M70,24 L170,24 C172,70 168,120 172,166 L150,158 L132,170 L112,160 L90,170 L72,162 C74,118 68,70 70,24 Z" fill="url(#banF)" />
	<path d="M78,32 L162,32 C163,74 160,116 163,152 L80,152 C81,112 77,72 78,32 Z" fill="none" stroke="#E2B98A" strokeWidth={1.6} opacity={0.55} />
	<text x={120} y={118} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={62} fill="#F3E2C0">曹</text>
	<path d="M172,30 C190,40 196,60 206,72 M172,40 C186,54 188,74 198,90" stroke={PAL.red} strokeWidth={4} fill="none" strokeLinecap="round" />
</g>;
const GranaryP: React.FC = () => { const cx = 130;
	return <g>
		<defs><linearGradient id="granB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A3628" /><stop offset="0.35" stopColor="#7A5A40" /><stop offset="0.7" stopColor={PAL.earth} /><stop offset="1" stopColor="#B08A64" /></linearGradient>
			<linearGradient id="granR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A3A22" /><stop offset="0.6" stopColor="#8A7444" /><stop offset="1" stopColor="#C2A468" /></linearGradient></defs>
		<ellipse cx={cx} cy={176} rx={78} ry={10} fill="#0A0605" opacity={0.5} />
		<path d={`M${cx - 74},150 L${cx + 74},150 L${cx + 70},176 L${cx - 70},176 Z`} fill="#3A2C22" />
		<path d={`M${cx - 58},78 L${cx + 58},78 L${cx + 60},164 C${cx + 20},172 ${cx - 20},172 ${cx - 60},164 Z`} fill="url(#granB)" />
		{[96, 116, 136, 154].map((y) => <path key={y} d={`M${cx - 59},${y} C${cx - 20},${y + 7} ${cx + 20},${y + 7} ${cx + 59},${y}`} stroke="#2A1C14" strokeWidth={1.2} opacity={0.5} fill="none" />)}
		<rect x={cx + 6} y={96} width={22} height={18} fill="#1A110C" /><rect x={cx + 6} y={96} width={22} height={3} fill="#C8A478" opacity={0.6} />
		<path d={`M${cx - 78},86 C${cx - 30},98 ${cx + 30},98 ${cx + 78},86 L${cx + 6},10 L${cx - 6},10 Z`} fill="url(#granR)" />
		{Array.from({length: 22}, (_, i) => { const u = i / 21, xb = cx - 76 + 152 * u; return <path key={i} d={`M${cx + (u - 0.5) * 10},14 L${xb},${88 + Math.sin(u * Math.PI) * 9}`} stroke="#3A2C18" strokeWidth={1} opacity={0.55} />; })}
		<path d={`M${cx - 78},86 C${cx - 30},98 ${cx + 30},98 ${cx + 78},86`} stroke="#E0C890" strokeWidth={1.5} fill="none" opacity={0.6} />
		<path d={`M${cx - 10},12 L${cx + 10},12 L${cx + 6},2 L${cx - 6},2 Z`} fill="#3A2C18" />
	</g>; };
const TowerP: React.FC = () => <g>
	<path d="M10,180 C40,140 80,128 130,126 C180,128 220,140 252,180 Z" fill="#3A2C22" /><path d="M40,150 C80,132 180,132 222,150" stroke="#8A6A4E" strokeWidth={1.4} opacity={0.6} fill="none" />
	<path d="M82,134 L98,58 M178,134 L162,58" stroke="#1E1510" strokeWidth={7} /><path d="M82,134 L98,58" stroke="#C08A5C" strokeWidth={1.2} opacity={0.6} />
	<path d="M90,96 L170,96 M86,116 L174,116 M94,76 L166,76 M88,114 L168,78 M92,78 L172,114" stroke="#1E1510" strokeWidth={3.2} />
	<path d="M120,134 L126,60 M134,134 L136,60 M121,124 L134,124 M122,112 L134,112 M123,100 L135,100 M124,88 L135,88 M125,76 L136,76" stroke="#2A1C14" strokeWidth={1.8} />
	<rect x={80} y={50} width={100} height={10} fill="#2A1C14" />
	{Array.from({length: 6}, (_, i) => <rect key={i} x={82 + i * 16.4} y={26} width={13} height={25} rx={2} fill="#2E2018" stroke="#7A5A3A" strokeWidth={0.8} />)}
	{[96, 126, 158].map((x) => <g key={x}><ellipse cx={x + 6} cy={22} rx={4.6} ry={5.4} fill={PAL.sil} /><path d={`M${x + 2},20 L${x + 26},12`} stroke={PAL.sil} strokeWidth={1.4} /></g>)}
	<path d="M180,50 L180,0" stroke="#2A1C14" strokeWidth={2.4} /><path d="M181,2 L214,2 L214,40 L181,36 Z" fill="#2C3440" />
	<text x={197} y={30} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={24} fill="#D8CCB0">袁</text>
	<path d="M80,50 L180,50" stroke="#C08A5C" strokeWidth={1} opacity={0.6} />
</g>;

/* ---------- the sheet ---------- */
const Panel: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode; bg?: string}> = ({x, y, w, h, children, bg = '#1A1210'}) => <g>
	<rect x={x} y={y} width={w} height={h} rx={4} fill={bg} /><rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={4} fill="none" stroke="#5A4434" strokeWidth={1} />{children}</g>;
const SW: [string, string, string][] = [['夜空 石青', PAL.sky1, ''], ['夯土', PAL.earth, ''], ['瓦 · 木', PAL.tile, ''], ['剪影 暖黑', PAL.sil, ''], ['灯光 暖象牙', PAL.lamp, ''], ['肤色', PAL.skin, ''], ['皂衣', PAL.zao, ''], ['曹 朱', PAL.red, '★ 强调色']];
export const Look1: React.FC = () => {
	const SX = 48, SY = 64, SW_ = 1200, SH = 675, PY = 790;
	const props: [string, React.FC][] = [['五色棒架 · 青赤黄白黑', RackP], ['环首刀（鞘）', DaoP], ['曹 旗', BannerP], ['囷（圆仓 · 草顶）', GranaryP], ['袁军 高橹 · 土山', TowerP]];
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs>
				<radialGradient id="boardG" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stopColor="#1E1512" /><stop offset="1" stopColor="#0E0908" /></radialGradient>
				<radialGradient id="charBg" cx="0.78" cy="0.38" r="0.85"><stop offset="0" stopColor="#7A5E46" /><stop offset="0.45" stopColor="#47362A" /><stop offset="1" stopColor="#1E1512" /></radialGradient>
				<clipPath id="setClip"><rect x={SX} y={SY} width={SW_} height={SH} rx={4} /></clipPath>
				<clipPath id="charClip"><rect x={1290} y={64} width={582} height={675} rx={4} /></clipPath>
				<clipPath id="none"><rect x={-1e4} y={-1e4} width={2e4} height={2e4} /></clipPath>
			</defs>
			<rect width={W} height={H} fill="url(#boardG)" />
			{/* set */}
			<g clipPath="url(#setClip)"><g transform={`translate(${SX},${SY}) scale(${SW_ / 1600})`}><Gate /></g></g>
			<rect x={SX + 0.5} y={SY + 0.5} width={SW_ - 1} height={SH - 1} rx={4} fill="none" stroke="#5A4434" />
			{/* characters */}
			<Panel x={1290} y={SY} w={582} h={SH} bg="url(#charBg)">
				<g clipPath="url(#charClip)"><Courses x0={1290} x1={1872} y0={SY} y1={600} step={22} o={0.14} seed={5} />
				<rect x={1290} y={600} width={582} height={SH + SY - 600} fill="#1E1612" /><path d="M1290,600 L1872,600" stroke="#8A6A4E" strokeWidth={1.2} opacity={0.6} />
</g>
				<ellipse cx={1580} cy={662} rx={270} ry={22} fill="#0C0806" opacity={0.5} />
			</Panel>
			<Cao />
			{/* props */}
			{props.map(([, C], i) => <Panel key={i} x={SX + i * 276} y={PY} w={262} h={238}><g transform={`translate(${SX + i * 276},${PY + 12})`}><C /></g></Panel>)}
			{/* palette */}
			<Panel x={1440} y={PY} w={432} h={238} bg="#140E0C">
				{SW.map(([, c, acc], i) => { const x = 1460 + (i % 4) * 103, y = PY + 16 + Math.floor(i / 4) * 98;
					return <g key={i}><rect x={x} y={y} width={88} height={44} rx={3} fill={c} stroke={acc ? '#F2E6CC' : '#5A4434'} strokeWidth={acc ? 2.5 : 1} />
						{acc && <text x={x + 80} y={y + 16} textAnchor="end" fontFamily={SANS} fontSize={15} fontWeight={700} fill="#F2E6CC">★</text>}</g>; })}
			</Panel>
		</svg>
		<div style={{...CAP, left: SX + 4, top: SY + SH + 10}}>场景样张 · 洛阳城门之夜：门楼 + 子母双阙，一门三道（平顶门道），夯土城墙；主光 = 门道火光，近景 = 角色，远景 = 剪影</div>
		<div style={{...CAP, left: 1310, top: SY + SH + 10}}>曹操 · 20岁（北部尉）　|　46岁（官渡）</div>
		<div style={{...CAP, fontSize: 20, left: 1300, width: 280, textAlign: 'center', top: SY + 618, opacity: 0.85}}>帻 + 武冠 · 皂袍 · 五色棒</div>
		<div style={{...CAP, fontSize: 20, left: 1586, width: 280, textAlign: 'center', top: SY + 618, opacity: 0.85}}>札甲 · 短须 · 环首刀</div>
		{props.map(([s], i) => <div key={i} style={{...CAP, fontSize: 22, left: SX + i * 276, width: 262, textAlign: 'center', top: PY + 200}}>{s}</div>)}
		{SW.map(([n, c, acc], i) => { const x = 1460 + (i % 4) * 103, y = PY + 16 + Math.floor(i / 4) * 98;
			return <div key={i} style={{...CAP, fontSize: 15, lineHeight: '18px', left: x, top: y + 48, width: 92}}><div style={{fontWeight: 700, color: acc ? '#F6C9A8' : PAL.cream}}>{n}</div><div style={{opacity: 0.8, fontFamily: "'Noto Sans Mono','DejaVu Sans Mono',monospace"}}>{c.toUpperCase()}</div></div>; })}
		<div style={{...CAP, fontSize: 15, left: 1460, top: PY + 210, opacity: 0.75}}>★ 强调色只给「曹」：领缘、赤棒、旗</div>
	</>;
};
export const Look2: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#1A1210" /></svg>;
export const Look3: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#1A1210" /></svg>;
void Cel; void SilMan;

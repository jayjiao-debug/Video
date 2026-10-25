import React from 'react';
import {stringPath, strandD, ticksD, furrows, treeD} from './kit50';
import {W, H, Theme, Subs, Stamp, Counter, Seal, Glyph, COMP_C, cowrie, bubi, spade, qrCells, Jiaozi, Walker, bentWalk, jointAt, grounded, shop, seg, ease, eio, eout, land, lerp, cl, rnd, typed, KAI} from './kit50';
/* LOOK A 「拓」 — the ink rubbing. The film is a sheet of 宣纸 laid over carved stone: a thing exists where the stone is
   raised, and it appears when the dabber (拓包) passes over it. Depth = ink density: far layers are light 蝉翼拓 grey,
   near layers heavy 乌金拓 black; incised details are paper-white lines. Metal is graphite (cold); the money is 朱拓
   vermilion — the episode accent. People are 汉画像石 figures: one heavy rubbed silhouette with a few incised lines. */
export const A = {paper: '#EDE5D3', paper2: '#E4D9C2', ink: '#1D1A17', mid: '#5E5850', far: '#A79E8F', red: '#C8412B', redL: '#E0664A', graph: '#4A4E54', graphL: '#A9B0B7'};
export const thA: Theme = {ink: '#1B1815', key: A.red, rule: A.red, dim: 0.78,
	halo: `0 0 2px ${A.paper}, 0 0 6px ${A.paper}, 0 0 14px rgba(237,229,211,0.9)`};

/** the rubbing filters: edge roughness + dabber blotches + paper-pore speckle; d = density (alpha ceiling) */
const RubF: React.FC<{id: string; d: number; seed: number; blot?: number; pores?: number}> = ({id, d, seed, blot = 0.012, pores = 1.1}) =>
	<filter id={id} x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
		<feTurbulence type="fractalNoise" baseFrequency={blot} numOctaves={3} seed={seed} result="blot" />
		<feTurbulence type="fractalNoise" baseFrequency={pores} numOctaves={2} seed={seed + 9} result="pore" />
		<feTurbulence type="turbulence" baseFrequency="0.06" numOctaves={2} seed={seed + 3} result="wob" />
		<feDisplacementMap in="SourceGraphic" in2="wob" scale={4} xChannelSelector="R" yChannelSelector="G" result="edge" />
		<feColorMatrix in="blot" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${0.9 * d} 0 0 0 ${0.47 * d}`} result="dens" />
		<feColorMatrix in="pore" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -2.75" result="holes" />
		<feComposite in="edge" in2="dens" operator="in" result="e2" />
		<feComposite in="e2" in2="holes" operator="in" />
	</filter>;
/** paper sheet: base, long fibres, soft stains */
export const Paper: React.FC<{seed?: number}> = ({seed = 2}) => <g>
	<defs>
		<filter id={`fib${seed}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.045" numOctaves={3} seed={seed} />
			<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 2.2 -1.05" /></filter>
		<filter id={`stn${seed}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0025" numOctaves={4} seed={seed + 4} />
			<feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.52  0 0 0 0 0.36  0 0 0 1.8 -0.85" /></filter>
		<filter id={`grn${seed}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={seed + 8} />
			<feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.26  0 0 0 0 0.2  0 0 0 1.4 -0.5" /></filter>
		<radialGradient id="pvig" cx="0.5" cy="0.48" r="0.75"><stop offset="0.6" stopColor="#6B5A3E" stopOpacity="0" /><stop offset="1" stopColor="#6B5A3E" stopOpacity="0.22" /></radialGradient>
	</defs>
	<rect width={W} height={H} fill={A.paper} />
	<rect width={W} height={H} filter={`url(#stn${seed})`} opacity={0.28} />
	<rect width={W} height={H} filter={`url(#fib${seed})`} opacity={0.12} />
	<rect width={W} height={H} filter={`url(#grn${seed})`} opacity={0.18} />
	<rect width={W} height={H} fill="url(#pvig)" />
</g>;
export const RubDefs: React.FC = () => <defs>
	<RubF id="rubH" d={1.05} seed={11} />
	<RubF id="rubM" d={0.97} seed={21} />
	<RubF id="rubL" d={0.9} seed={31} pores={0.9} />
	<RubF id="rubR" d={1.0} seed={41} />
	<filter id="lift" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#4A3A22" floodOpacity="0.32" /></filter>
	<filter id="liftS" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4A3A22" floodOpacity="0.3" /></filter>
	<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" baseFrequency="0.08" numOctaves={2} seed={5} /><feDisplacementMap in="SourceGraphic" scale={3} xChannelSelector="R" yChannelSelector="G" /></filter>
	<linearGradient id="graphSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={A.graph} /><stop offset="0.42" stopColor={A.graph} /><stop offset="0.5" stopColor="#C9D2DA" /><stop offset="0.58" stopColor={A.graph} /><stop offset="1" stopColor="#3A4048" /></linearGradient>
</defs>;
/** a carved 画像石 border band: double rule + diamond lattice, light ink */
const Border: React.FC<{y: number; x0: number; x1: number}> = ({y, x0, x1}) => { const n = Math.floor((x1 - x0) / 46);
	return <g filter="url(#rubL)" fill={A.far}>
		<rect x={x0} y={y} width={x1 - x0} height={7} /><rect x={x0} y={y + 40} width={x1 - x0} height={7} />
		<path d={Array.from({length: n}, (_, i) => { const cx = x0 + 23 + i * 46; return `M${cx},${y + 12} L${cx + 17},${y + 23.5} L${cx},${y + 35} L${cx - 17},${y + 23.5} Z`; }).join('')} />
	</g>; };
/** the 拓包 dabber: a silk-wrapped cotton ball, tied at the neck, with its shadow on the paper */
export const Dabber: React.FC<{x: number; y: number; s?: number; lift?: number}> = ({x, y, s = 1, lift = 0}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<defs><linearGradient id="padG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2ECDD" /><stop offset="1" stopColor="#B9AC90" /></linearGradient>
		<linearGradient id="woodG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6E5034" /><stop offset="0.5" stopColor="#A07C55" /><stop offset="1" stopColor="#6A4C31" /></linearGradient></defs>
	<ellipse cx={8 + lift * 12} cy={4} rx={54 - lift * 10} ry={10 - lift * 3} fill="#3A2E1E" opacity={0.25 - lift * 0.12} />
	<g transform={`translate(0,${-lift * 34})`}>
		{/* wooden handle, set into the tied neck of the pad */}
		<path d="M-8,-30 L10,-150 L26,-148 L10,-28 Z" fill="url(#woodG)" />
		{/* the silk pad: a flat cushion, ink on its face */}
		<path d="M-52,-6 Q-54,-34 -22,-40 Q0,-44 22,-40 Q54,-34 52,-6 Q0,6 -52,-6 Z" fill="url(#padG)" />
		<path d="M-52,-6 Q0,8 52,-6 L50,0 Q0,12 -50,0 Z" fill={A.ink} opacity={0.85} />
		<path d="M-20,-40 Q-14,-28 -16,-10 M18,-41 Q22,-28 20,-10 M-40,-34 Q-36,-20 -40,-8 M38,-34 Q36,-20 40,-8" stroke="#A2947A" strokeWidth={1.8} fill="none" />
		{/* gathered silk and the tie */}
		<path d="M-16,-40 Q-12,-54 -4,-58 L12,-58 Q20,-54 22,-40 Z" fill="#D9CFB9" stroke="#A2947A" strokeWidth={1.5} />
		<path d="M-8,-52 Q4,-46 18,-52" stroke="#8B2A1E" strokeWidth={4} fill="none" strokeLinecap="round" />
	</g>
</g>;
/** dab-by-dab reveal: zig-zag dabs over a box; returns the dabs visible at time t and where the dabber is */
export const dabs = (box: [number, number, number, number], n: number, ta: number, tb: number, t: number, seed: number) => {
	const [x0, y0, x1, y1] = box, cols = Math.max(2, Math.round(Math.sqrt(n * (x1 - x0) / (y1 - y0)))), rows = Math.ceil(n / cols), r = Math.max((x1 - x0) / cols, (y1 - y0) / rows) * 0.85;
	const all = Array.from({length: rows * cols}, (_, i) => { const row = Math.floor(i / cols), c0 = i % cols, c = row % 2 ? cols - 1 - c0 : c0;
		return {x: x0 + (c + 0.5) * (x1 - x0) / cols + (rnd(i, seed) - 0.5) * r * 0.5, y: y0 + (row + 0.5) * (y1 - y0) / rows + (rnd(i + 50, seed) - 0.5) * r * 0.5, t: lerp(ta, tb, i / (rows * cols - 1))}; });
	const vis = all.filter((d) => d.t <= t).map((d) => ({...d, k: eout(seg(t, d.t, d.t + 0.12))}));
	const fi = Math.min(all.length - 1, Math.max(0, Math.floor((t - ta) / (tb - ta) * (all.length - 1)))), fu = ((t - ta) / (tb - ta) * (all.length - 1)) % 1;
	const a = all[fi], b = all[Math.min(all.length - 1, fi + 1)];
	return {vis, r, pad: {x: lerp(a.x, b.x, eio(fu)), y: lerp(a.y, b.y, eio(fu)) + 30, lift: Math.sin(Math.PI * fu)}, on: t >= ta && t <= tb + 0.1};
};
const DabMask: React.FC<{id: string; vis: {x: number; y: number; k: number}[]; r: number; invert?: boolean}> = ({id, vis, r, invert}) => <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
	{invert && <rect width={W} height={H} fill="#fff" />}
	<g filter="url(#dabN)">{vis.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={r * (0.55 + 0.5 * d.k)} fill={invert ? '#000' : '#fff'} opacity={0.35 + 0.65 * d.k} />)}</g>
</mask>;
const DabDefs: React.FC = () => <defs><filter id="dabN" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={9} result="n" />
	<feGaussianBlur in="SourceGraphic" stdDeviation={6} result="b" /><feDisplacementMap in="b" in2="n" scale={40} xChannelSelector="R" yChannelSelector="G" /></filter></defs>;

/* ---------- A1: the hook ---------- */
const CH = ['财', '货', '贵', '钱'], CX = [236, 566, 896, 1290], CY = 410, CS = 300;
/** a cowrie rubbing in vermilion */
const Cowrie: React.FC<{x: number; y: number; L: number; rot?: number; o?: number}> = ({x, y, L, rot = 0, o = 1}) => { const c = cowrie(L);
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
		<g filter="url(#rubR)"><path d={c.body} fill={A.red} /></g>
		<path d={c.slit} fill={A.paper} opacity={0.95} /><path d={c.teeth} stroke={A.paper} strokeWidth={L * 0.03} strokeLinecap="round" />
		
	</g>; };
const REST = [[640, 858, -8], [745, 862, 6], [835, 856, -3]];
export const HookA: React.FC<{t: number}> = ({t}) => {
	const cam = 1 + 0.02 * ease(seg(t, 0, 4));
	const r1 = '财、货、贵，都带个"贝"，', r2 = '偏偏"钱"，是[金]字旁。';
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Paper seed={2} />
			<RubDefs />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<Border y={346} x0={150} x1={1640} />
				{/* 2026, the stall: a plank counter, a standing code plaque and your phone (it just paid: ✓) */}
				<g filter="url(#rubL)"><rect x={540} y={880} width={860} height={14} fill={A.mid} /><rect x={540} y={898} width={860} height={92} fill={A.far} /></g>
				<path d="M560,920 Q760,912 960,922 T1380,918 M560,948 Q800,956 1000,946 T1380,952 M560,972 Q760,966 980,975 T1380,970" stroke={A.paper} strokeWidth={2.5} fill="none" opacity={0.7} />
				<g filter="url(#rubM)"><rect x={1112} y={770} width={112} height={112} rx={6} fill={A.mid} /><rect x={1150} y={880} width={36} height={8} fill={A.mid} /></g>
				<g transform="translate(1124,782)"><path d={qrCells(22, 4).map(([j, i]) => `M${j * 4},${i * 4}h4.2v4.2h-4.2z`).join('')} fill={A.paper} />
					{[[0, 0], [0, 15], [15, 0]].map(([i, j]) => <g key={`${i}${j}`}><rect x={j * 4} y={i * 4} width={28} height={28} fill={A.paper} /><rect x={j * 4 + 4} y={i * 4 + 4} width={20} height={20} fill={A.mid} /><rect x={j * 4 + 8} y={i * 4 + 8} width={12} height={12} fill={A.paper} /></g>)}</g>
				<g transform="translate(925,770) rotate(-7)">
					<g filter="url(#rubH)"><rect x={0} y={0} width={96} height={180} rx={15} fill={A.ink} /></g>
					<rect x={7} y={14} width={82} height={150} rx={7} fill={A.paper} />
					<circle cx={48} cy={82} r={26} fill="none" stroke={A.red} strokeWidth={5} opacity={seg(t, 0.15, 0.35)} />
					<path d="M35,82 l9,10 l18,-21" fill="none" stroke={A.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={seg(t, 0.2, 0.4)} />
				</g>
				{CH.map((ch, i) => { const a = 0.12 + i * 0.32, k = land(seg(t, a, a + 0.5)), x = CX[i], s = CS;
					if (k <= 0) return null;
					const sc = lerp(1.25, 1, k), op = cl(k * 3), isQ = ch === '钱', [ccx, ccy] = COMP_C[ch];
					return <g key={ch} opacity={op} transform={`translate(${x + s / 2},${CY + s / 2}) scale(${sc}) translate(${-x - s / 2},${-CY - s / 2})`}>
						<Glyph ch={ch} x={x} y={CY} s={s} part="rest" id={`a${i}`} fill={A.ink} filter="url(#rubH)" />
						{!isQ && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`ag${i}`} fill={A.far} filter="url(#rubL)" style={{opacity: 0.6 * seg(t, 0.75 + i * 0.2, 1.05 + i * 0.2)}} />}
						{isQ && <g>
							<Glyph ch={ch} x={x} y={CY} s={s} part="comp" id="aq" fill={t > 1.35 ? 'url(#graphSheen)' : A.ink} filter="url(#rubM)" />
							{t > 1.35 && <path d={`M${x + ccx * s + 62},${CY + 62} l7,-22 l7,22 l22,7 l-22,7 l-7,22 l-7,-22 l-22,-7 Z`} fill="#F6F8FA" opacity={Math.sin(Math.PI * seg(t, 1.35, 2.7)) * 0.95} />}
						</g>}
					</g>; })}
				{/* each 贝 turns vermilion, peels off the stone (lift + shadow), becomes a cowrie and drops onto the counter */}
				{[0, 1, 2].map((i) => { const a = 0.55 + 0.2 * i, x = CX[i], s = CS, ch = CH[i], [ccx, ccy] = COMP_C[ch], lx = x + ccx * s, ly = CY + ccy * s;
					const red = seg(t, a, a + 0.15), lk = eio(seg(t, a + 0.15, a + 0.5)), mk = ease(seg(t, a + 0.5, a + 0.85)), dk = seg(t, 2.35 + 0.15 * i, 2.75 + 0.15 * i);
					if (t < 0.12 + i * 0.32) return null;
					const [rx, ry, rr] = REST[i], dy = dk >= 1 ? 0 : dk;
					const cxw = lerp(lx, rx, eio(dk)), cyw = lerp(ly - 40, ry, dk * dk) - Math.sin(Math.PI * dk) * 60 + (dk >= 1 ? 0 : 0) * dy;
					return <g key={i}>
						{mk < 1 && <g opacity={1 - mk} transform={`translate(${lx},${ly}) translate(${-14 * lk},${-46 * lk}) rotate(${-6 * lk}) scale(${1 + 0.1 * lk - 0.4 * mk}) translate(${-lx},${-ly})`} filter={lk > 0.02 ? 'url(#lift)' : undefined}>
							<Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`ar${i}`} fill={red > 0 ? A.red : A.ink} filter="url(#rubR)" />
						</g>}
						{mk > 0 && <g filter={dk < 1 ? 'url(#lift)' : undefined}><Cowrie x={cxw} y={cyw} L={lerp(s * 0.5, 118, dk)} rot={lerp(-12, rr, dk)} o={mk} /></g>}
					</g>; })}
			</g>
		</svg>
		<Subs rows={[{s: r1, n: typed(r1, t, 0, 0.5)}, {s: r2, n: typed(r2, t, 1.15, 0.6)}].filter((r, i) => i === 0 || t > 1.15)} th={thA} />
		<Counter year="2026" th={thA} />
		<Seal />
	</>;
};

/* ---------- A2: the Song street, 交子 ---------- */
/** the 贯: 1000 iron coins on a cord, folded into a heavy hanging loop (graphite rubbing, cold) */
const IronString: React.FC<{hx: number; hy: number; g: number; sway?: number}> = ({hx, hy, g, sway = 0}) => {
	const pts = stringPath(hx, hy, g, sway), e = pts[pts.length - 1];
	return <g>
		<g filter="url(#rubM)" fill="none" stroke={A.graph} strokeLinecap="round"><path d={strandD(pts, -8)} strokeWidth={20} /><path d={strandD(pts, 8)} strokeWidth={20} /></g>
		<path d={ticksD(pts, 15)} stroke={A.paper} strokeWidth={2} opacity={0.6} />
		<g filter="url(#rubM)">{[[-6, -16, -18], [16, -20, 8], [36, -14, 22]].map(([dx, dy, r], i) => { const x = e[0] + dx, y = e[1] + dy;
			return <g key={i} transform={`rotate(${r},${x},${y})`}><circle cx={x} cy={y} r={20} fill={A.graph} stroke={A.graphL} strokeWidth={2} /><rect x={x - 6} y={y - 6} width={12} height={12} fill={A.paper} /></g>; })}</g>
		<path d={`M${hx - 12},${hy + 2} L${hx + 14},${hy + 2}`} stroke={A.ink} strokeWidth={7} strokeLinecap="round" />
	</g>;
};
export const SongA: React.FC<{t: number}> = ({t}) => {
	const g = 905, h = 600, wx = 820 + 34 * t, ph = 0.22 + t / 1.5, sw = Math.sin(t * 4.2), pose = bentWalk(ph, 0.9 + 0.1 * sw);
	const nh = jointAt(pose, 'LHand', wx, g, h), fh = jointAt(pose, 'RHand', wx, g, h);
	const cam = -24 * t;
	const s1 = shop(-160, g - 4, 560, 390), s2 = shop(450, g - 4, 520, 360), s3 = shop(1080, g - 4, 600, 410), s4 = shop(1740, g - 4, 520, 380);
	const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, 560, 300, 120 + 50 * rnd(i, 3)));
	const r1 = '于是有了[交子]：', r2 = '一张纸，能换一千文。';
	const C = {far: '#CFC6B3', mid: '#9D9484', grd: '#857C6E'};
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Paper seed={5} />
			<RubDefs />
			<g transform={`translate(${cam * 0.25},0)`}>
				<g filter="url(#rubL)" fill={C.far}>{far.map((s, i) => <path key={i} d={s.roof} />)}
					<path d="M1260,560 V420 H1540 V560 Z M1210,420 Q1320,392 1340,352 H1460 Q1480,392 1590,420 Z M1290,352 Q1370,334 1380,306 H1420 Q1430,334 1510,352 Z" /></g>
			</g>
			<g transform={`translate(${cam * 0.6},0)`}>
				{[s1, s2, s3, s4].map((s, i) => <g key={i}>
					<g filter="url(#rubM)" fill={C.mid}><path d={s.roof} /><path d={s.posts} /><path d={s.beam} /><path d={s.counter} /></g>
					<path d={s.tiles} stroke={A.paper} strokeWidth={3} opacity={0.6} />
					<g filter="url(#rubL)"><path d={s.sign} fill={C.far} /></g>
					<path d={s.shutter} stroke={C.mid} strokeWidth={6} opacity={0.55} />
				</g>)}
				{[[255, 560], [700, 575], [1360, 545]].map(([x, y], i) => <g key={i} filter="url(#rubM)" fill={C.mid}><rect x={x - 1.5} y={y - 44} width={3} height={20} /><ellipse cx={x} cy={y} rx={22} ry={27} /><rect x={x - 12} y={y + 24} width={24} height={8} /></g>)}
				<g filter="url(#rubM)" fill={C.mid}><rect x={1036} y={430} width={8} height={475} /><path d="M1044,446 H1122 V650 L1083,628 L1044,650 Z" /></g>
				<path d="M1056,474 h54 M1056,504 h54 M1056,534 h54 M1056,564 h54" stroke={A.paper} strokeWidth={3} opacity={0.55} />
				{/* a stall-keeper behind his counter with strings of coins piled on it (mid-grey, one layer back) */}
				<g filter="url(#rubM)"><Walker x={1250} ground={g - 4} h={420} pose={grounded({lean: 6, neck: 12, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 70, ra: 24, re: 74})} col="#8C8373" look={{dress: 'robe', head: 'futou'}} />
					<path d={s3.counter} fill={C.mid} />
					{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={1150 + i * 46} cy={g - 4 - 0.3 * 410 - 12} rx={26} ry={13} fill="#77736E" />)}</g>
			</g>
			<g filter="url(#rubM)"><rect x={-20} y={g} width={W + 40} height={H - g + 20} fill={C.grd} /></g>
			<path d={Array.from({length: 16}, (_, i) => `M${((i * 150 + cam) % 2400 + 2400) % 2400 - 240},${g + 6} l-46,${H - g}`).join(' ') + ` M-20,${g + 74} H1940`} stroke={A.paper} strokeWidth={3} opacity={0.5} />
			<IronString hx={nh[0]} hy={nh[1]} g={g} sway={sw * 0.3} />
			<g filter="url(#rubH)"><Walker x={wx} ground={g} h={h} pose={pose} col={A.ink} look={{dress: 'tunic', head: 'futou', legs: 'trousers'}} /></g>
			<g stroke={A.paper} strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round">
				{(() => { const hp = jointAt(pose, 'Hips', wx, g, h), nk = jointAt(pose, 'Neck1', wx, g, h); return <>
					<path d={`M${hp[0] - 0.07 * h},${hp[1] + 0.035 * h} Q${hp[0]},${hp[1] + 0.05 * h} ${hp[0] + 0.075 * h},${hp[1] + 0.03 * h}`} />
					<path d={`M${nk[0] - 0.03 * h},${nk[1] + 0.006 * h} Q${nk[0] + 0.01 * h},${nk[1] + 0.045 * h} ${nk[0] + 0.045 * h},${nk[1] + 0.012 * h}`} />
				</>; })()}
			</g>
			<g transform={`translate(${fh[0] - 6},${fh[1] - 160}) rotate(${-5 + 2.5 * Math.sin(t * 2)})`} filter="url(#lift)">
				<Jiaozi w={100} h={162} red={A.red} ink={A.ink} paper="#F7F0E2" id="jz" />
			</g>
			<g fontFamily={KAI} fontWeight={700} fontSize={46}>
				<text x={fh[0] + 112} y={fh[1] - 74} fill={A.red}>一张</text>
				<path d={`M${nh[0] - 170},${g - 24} L${nh[0] - 220},${g - 112}`} stroke={A.ink} strokeWidth={2} opacity={0.6} />
				<text x={nh[0] - 360} y={g - 124} fill={A.ink} stroke={A.paper} strokeWidth={8} style={{paintOrder: 'stroke'}}>一千文</text>
			</g>
		</svg>
		<Subs rows={[{s: r1}, {s: r2}]} th={thA} />
		<Stamp y="北宋" place="益州" note="一交一缗" th={thA} />
		<Counter era="北宋" th={thA} />
		<Seal />
	</>;
};

/* ---------- motion test: 钅 → spade → 布币, dab by dab ---------- */
export const MorphA: React.FC<{t: number}> = ({t}) => {
	const s = 520, cam = 1 + 0.03 * eio(seg(t, 0, 4));
	const rest = 1 - ease(seg(t, 0.3, 0.9)), slide = eio(seg(t, 0.35, 1.0));
	const qx = lerp(560, 760, slide), qy = lerp(330, 340, slide);
	const D1 = dabs([720, 400, 1160, 900], 24, 0.95, 2.0, t, 3);       // the spade is rubbed in
	const shrink = eio(seg(t, 2.05, 2.75));
	const D2 = dabs([760, 380, 1140, 880], 14, 2.75, 3.3, t, 7);         // the coin is re-rubbed in vermilion
	const hop = seg(t, 3.25, 3.75);
	const sp = spade(400, 190), bb = bubi(470), cx = 940, cy = lerp(720, 640, shrink);
	const r1 = '原来，"钱"是一把[铲子]。', r2 = '东周时，铲子变成了货币，';
	const pad = D1.on ? D1.pad : D2.on ? D2.pad : null;
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Paper seed={8} />
			<RubDefs />
			<DabDefs />
			<DabMask id="mSp" vis={D1.vis} r={D1.r} /><DabMask id="mQ" vis={D1.vis} r={D1.r} invert /><DabMask id="mRed" vis={D2.vis} r={D2.r} />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<Border y={268} x0={240} x1={1640} />
				<g filter="url(#rubL)" fill="#C9C0AE"><path d={treeD(1480, 900, 1.5)} /><path d={treeD(380, 900, 1.1)} /><rect x={-20} y={900} width={W + 40} height={200} /></g>
				<path d={furrows(900)} stroke={A.paper} strokeWidth={4} fill="none" opacity={0.7} />
				{rest > 0.01 && <Glyph ch="钱" x={560} y={330} s={s} part="rest" id="mr" fill={A.ink} filter="url(#rubH)" style={{opacity: rest}} />}
				<g mask="url(#mQ)"><Glyph ch="钱" x={qx} y={qy} s={s} part="comp" id="mq" fill="url(#graphSheen)" filter="url(#rubM)" /></g>
				<g mask="url(#mSp)">
					<g transform={`translate(${cx},${cy}) scale(${lerp(1, 0.96, shrink)})`}>
						<g opacity={1 - shrink} filter="url(#rubM)"><path d={sp.handle} fill="#8C6A44" /></g>
						<g opacity={1 - shrink} filter="url(#rubH)"><path d={sp.blade} fill={A.ink} /></g>
						<g opacity={shrink}>
							<g filter="url(#rubH)"><path d={bb.body} fill={A.ink} /></g>
							<path d={bb.hole} fill={A.paper} /><path d={bb.nail} fill={A.paper} /><path d={bb.ribs} stroke={A.paper} strokeWidth={5} opacity={0.55} fill="none" />
						</g>
					</g>
				</g>
				<g mask="url(#mRed)"><g transform={`translate(${cx},${cy}) scale(0.96)`}>
					<g filter="url(#rubR)"><path d={bb.body} fill={A.red} /></g>
					<path d={bb.hole} fill={A.paper} /><path d={bb.nail} fill={A.paper} /><path d={bb.ribs} stroke={A.paper} strokeWidth={5} opacity={0.55} fill="none" />
				</g></g>
				{/* the name follows the coin: a paper tag with 钱 drops beside it */}
				{hop > 0 && <g transform={`translate(${1260},${lerp(420, 520, eout(hop)) - Math.sin(Math.PI * hop) * 50})`} opacity={cl(hop * 3)} filter="url(#liftS)">
					<rect x={-18} y={-14} width={176} height={176} fill="#F4ECDC" />
					<Glyph ch="钱" x={0} y={0} s={140} part="rest" id="hr" fill={A.ink} />
					<Glyph ch="钱" x={0} y={0} s={140} part="comp" id="hq" fill="url(#graphSheen)" />
				</g>}
				{pad && <Dabber x={pad.x} y={pad.y} s={1.3} lift={pad.lift} />}
			</g>
		</svg>
		<Subs rows={[t < 2.05 ? {s: r1} : {s: r2, n: typed(r2, t, 2.05, 0.5)}]} th={thA} />
		<Counter era={t < 2.05 ? '商周' : '东周'} th={thA} />
		<Seal />
	</>;
};

import React from 'react';
import {stringPath, strandD, ticksD, furrows, treeD} from './kit50';
import {W, H, Theme, Subs, Stamp, Counter, Seal, Glyph, COMP_C, cowrie, bubi, spade, qrCells, Jiaozi, Walker, bentWalk, jointAt, grounded, shop, seg, ease, eio, eout, land, lerp, cl, rnd, typed, KAI} from './kit50';
/* LOOK B 「漆」 — 秦汉漆器. The film is painted on a lacquered box: black lacquer ground, cinnabar flats, fine gold line,
   and 云气纹 cloud scrolls that carry every movement (things are drawn by a gold line, then flooded with lacquer; cloud
   curls sweep in as transitions). The light is the gloss of lacquer: a soft window reflection slides as the box turns.
   Metal is silver inlay (金银错, cold); the money is gold leaf — the episode accent. People are lacquer-black silhouettes
   with a gold contour, standing on cinnabar. */
export const B = {lac: '#1A0F0C', lac2: '#2A1511', far: '#3E1A13', red: '#B5341F', redL: '#D0503A', redD: '#7C2416', ochre: '#9C6B33', gold: '#E2B45E', goldL: '#FFE3A0', silver: '#C9D1D6', cream: '#F6EBD2'};
export const thB: Theme = {ink: '#FBF1DF', key: B.gold, rule: B.gold, dim: 0.75, pool: 'rgba(14,6,4,A)', poolA: 0.45,
	halo: '0 0 2px rgba(14,6,4,0.95), 0 2px 8px rgba(14,6,4,0.75), 0 2px 22px rgba(14,6,4,0.6)'};

/** a 云气纹 curl: a spiral that unwinds into a long tail; dir = ±1 */
export const curl = (x: number, y: number, r: number, dir = 1, tail = 3, rise = 0.5) => {
	const pts: [number, number][] = [];
	for (let i = 0; i <= 36; i++) { const th = (i / 36) * 2.3 * Math.PI, rr = r * (0.12 + 0.88 * i / 36); pts.push([x + dir * rr * Math.cos(th), y - rr * Math.sin(th)]); }
	const [lx, ly] = pts[pts.length - 1];
	for (let j = 1; j <= 18; j++) { const u = j / 18; pts.push([lx + dir * u * r * tail, ly + Math.sin(u * Math.PI) * r * rise - u * r * 0.2]); }
	return 'M' + pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join('L');
};
export const LacDefs: React.FC = () => <defs>
	<filter id="lacN" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0015 0.03" numOctaves={2} seed={4} />
		<feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 1.6 -0.6" /></filter>
	<filter id="lacG" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={8} />
		<feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0.9 -0.4" /></filter>
	<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF0C0" /><stop offset="0.3" stopColor="#F2C66A" /><stop offset="0.55" stopColor="#D79B3E" /><stop offset="0.75" stopColor="#F6D488" /><stop offset="1" stopColor="#B57A2C" /></linearGradient>
	<linearGradient id="silv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E979D" /><stop offset="0.45" stopColor="#C9D1D6" /><stop offset="0.52" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#B8C1C7" /><stop offset="1" stopColor="#6F787E" /></linearGradient>
	<linearGradient id="iron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3B3E42" /><stop offset="0.5" stopColor="#8E959B" /><stop offset="1" stopColor="#34373B" /></linearGradient>
	<filter id="gl" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.55" /></filter>
	<filter id="glS" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" /></filter>
	<filter id="edge" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius={3} result="d" /><feFlood floodColor={B.gold} /><feComposite in2="d" operator="in" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
</defs>;
/** lacquer ground: deep black-red, a long soft window reflection sliding with the box (sheen 0..1) */
export const Lacquer: React.FC<{sheen: number; id: string}> = ({sheen, id}) => <g>
	<defs><linearGradient id={`rf${id}`} gradientUnits="userSpaceOnUse" x1={lerp(-600, 1400, sheen)} y1={0} x2={lerp(-600, 1400, sheen) + 900} y2={700}>
		<stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.45" stopColor="#FFE9D0" stopOpacity="0.07" /><stop offset="0.5" stopColor="#FFE9D0" stopOpacity="0.11" /><stop offset="0.55" stopColor="#FFE9D0" stopOpacity="0.07" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
		<radialGradient id={`lv${id}`} cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#3A1C15" /><stop offset="0.7" stopColor={B.lac} /><stop offset="1" stopColor="#0E0806" /></radialGradient></defs>
	<rect width={W} height={H} fill={`url(#lv${id})`} />
	<rect width={W} height={H} filter="url(#lacN)" opacity={0.16} />
	<rect width={W} height={H} filter="url(#lacG)" opacity={0.05} />
	<rect width={W} height={H} fill={`url(#rf${id})`} />
</g>;
/** a cinnabar band with a running gold cloud scroll */
const ScrollBand: React.FC<{y: number; x0: number; x1: number; h?: number; flow?: number}> = ({y, x0, x1, h = 48, flow = 0}) => { const n = Math.ceil((x1 - x0) / 150) + 1;
	return <g>
		<rect x={x0} y={y} width={x1 - x0} height={h} fill={B.redD} />
		<rect x={x0} y={y + 3} width={x1 - x0} height={2} fill={B.gold} opacity={0.8} /><rect x={x0} y={y + h - 5} width={x1 - x0} height={2} fill={B.gold} opacity={0.8} />
		<clipPath id={`sb${y}`}><rect x={x0} y={y} width={x1 - x0} height={h} /></clipPath>
		<g clipPath={`url(#sb${y})`}><g transform={`translate(${-(flow % 150)},0)`}>
			{Array.from({length: n + 1}, (_, i) => <path key={i} d={curl(x0 + i * 150 + 30, y + h * 0.56, h * 0.36, i % 2 ? -1 : 1, 3.4, 0.5)} fill="none" stroke={B.gold} strokeWidth={2.4} strokeLinecap="round" transform={i % 2 ? `translate(${90},0)` : undefined} />)}
		</g></g>
	</g>; };

/* ---------- B1: the hook ---------- */
const CH = ['财', '货', '贵', '钱'], CX = [236, 566, 896, 1290], CY = 410, CS = 300;
const Cowrie: React.FC<{x: number; y: number; L: number; rot?: number; o?: number}> = ({x, y, L, rot = 0, o = 1}) => { const c = cowrie(L);
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
		<path d={c.body} fill="url(#leaf)" stroke={B.goldL} strokeWidth={1.5} />
		<ellipse cx={-L * 0.08} cy={-L * 0.2} rx={L * 0.2} ry={L * 0.06} fill="#FFF6D8" opacity={0.7} transform={`rotate(-8)`} /><path d={c.slit} fill={B.lac} /><path d={c.teeth} stroke={B.goldL} strokeWidth={L * 0.025} strokeLinecap="round" />
	</g>; };
const REST = [[640, 858, -8], [745, 862, 6], [835, 856, -3]];
export const HookB: React.FC<{t: number}> = ({t}) => {
	const r1 = '财、货、贵，都带个"贝"，', r2 = '偏偏"钱"，是[金]字旁。';
	const cam = 1 + 0.02 * ease(seg(t, 0, 4));
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<LacDefs />
			<Lacquer sheen={0.15 + 0.12 * t} id="h" />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<ScrollBand y={346} x0={150} x1={1640} flow={t * 40} />
				{/* faint cloud scrolls drifting in the lacquer behind the characters (depth) */}
				<g opacity={0.35} fill="none" stroke={B.redD} strokeWidth={3}>{[[300, 760, 50, 1], [820, 800, 40, -1], [1500, 760, 56, -1], [1580, 520, 40, 1]].map(([x, y, r, d], i) => <path key={i} d={curl(x + 10 * t, y, r, d, 3)} />)}</g>
				{/* 2026, the stall: a cinnabar counter with gold line, a code plaque and the phone (gold line = today's money) */}
				<rect x={540} y={880} width={860} height={110} fill={B.redD} /><rect x={540} y={880} width={860} height={6} fill={B.gold} opacity={0.85} />
				<path d={Array.from({length: 6}, (_, i) => curl(600 + i * 140, 945, 18, i % 2 ? -1 : 1, 2.4, 0.5)).join(' ')} fill="none" stroke={B.gold} strokeWidth={2} opacity={0.75} />
				<rect x={1112} y={770} width={112} height={112} rx={6} fill={B.cream} />
				<g transform="translate(1124,782)"><QRg /></g>
				<g transform="translate(925,770) rotate(-7)">
					<rect x={0} y={0} width={96} height={180} rx={15} fill={B.lac} stroke={B.gold} strokeWidth={3} />
					<rect x={8} y={14} width={80} height={150} rx={7} fill="#2A1A14" />
					<circle cx={48} cy={82} r={26} fill="none" stroke={B.goldL} strokeWidth={5} opacity={seg(t, 0.15, 0.35)} />
					<path d="M35,82 l9,10 l18,-21" fill="none" stroke={B.goldL} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={seg(t, 0.2, 0.4)} />
				</g>
				{CH.map((ch, i) => { const a = 0.12 + i * 0.32, k = land(seg(t, a, a + 0.5)), x = CX[i], s = CS;
					if (k <= 0) return null;
					const sc = lerp(1.25, 1, k), op = cl(k * 3), isQ = ch === '钱', [ccx] = COMP_C[ch];
					return <g key={ch} opacity={op} transform={`translate(${x + s / 2},${CY + s / 2}) scale(${sc}) translate(${-x - s / 2},${-CY - s / 2})`}>
						<Glyph ch={ch} x={x} y={CY} s={s} part="rest" id={`b${i}`} fill={B.red} stroke={B.gold} sw={3} />
						{!isQ && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`bg${i}`} fill="none" stroke={B.gold} sw={2} style={{opacity: 0.55 * seg(t, 0.75 + i * 0.2, 1.05 + i * 0.2)}} />}
						{isQ && <g>
							<Glyph ch={ch} x={x} y={CY} s={s} part="comp" id="bq" fill={t > 1.35 ? 'url(#silv)' : B.red} stroke={t > 1.35 ? '#E8EEF1' : B.gold} sw={2} />
							{t > 1.35 && <path d={`M${x + ccx * s + 62},${CY + 62} l7,-22 l7,22 l22,7 l-22,7 l-7,22 l-7,-22 l-22,-7 Z`} fill="#FFFFFF" opacity={Math.sin(Math.PI * seg(t, 1.35, 2.7)) * 0.95} />}
						</g>}
					</g>; })}
				{[0, 1, 2].map((i) => { const a = 0.55 + 0.2 * i, x = CX[i], s = CS, ch = CH[i], [ccx, ccy] = COMP_C[ch], lx = x + ccx * s, ly = CY + ccy * s;
					const gold = seg(t, a, a + 0.2), lk = eio(seg(t, a + 0.15, a + 0.5)), mk = ease(seg(t, a + 0.5, a + 0.85)), dk = seg(t, 2.35 + 0.15 * i, 2.75 + 0.15 * i);
					if (t < 0.12 + i * 0.32) return null;
					const [rx, ry, rr] = REST[i];
					const cxw = lerp(lx, rx, eio(dk)), cyw = lerp(ly - 30, ry, dk * dk) - Math.sin(Math.PI * dk) * 60;
					/* the gold-leaf 贝 lifts on a cloud curl that draws itself under it */
					const trail = curl(lx - 60, ly + 70, 34, i % 2 ? -1 : 1, 2.2, 0.4);
					return <g key={i}>
						{lk > 0 && mk < 1 && <path d={trail} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lk} fill="none" stroke={B.goldL} strokeWidth={3} strokeLinecap="round" opacity={0.9 * (1 - mk)} />}
						{mk < 1 && <g opacity={1 - mk} transform={`translate(${lx},${ly}) translate(${-14 * lk},${-46 * lk}) rotate(${-6 * lk}) scale(${1 + 0.1 * lk - 0.4 * mk}) translate(${-lx},${-ly})`} filter={lk > 0.02 ? 'url(#gl)' : undefined}>
							<Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`br${i}`} fill={gold > 0 ? 'url(#leaf)' : B.red} stroke={gold > 0 ? B.goldL : B.gold} sw={2} />
						</g>}
						{mk > 0 && <g filter={dk < 1 ? 'url(#gl)' : 'url(#glS)'}><Cowrie x={cxw} y={cyw} L={lerp(s * 0.5, 118, dk)} rot={lerp(-12, rr, dk)} o={mk} /></g>}
					</g>; })}
			</g>
		</svg>
		<Subs rows={[{s: r1, n: typed(r1, t, 0, 0.5)}, {s: r2, n: typed(r2, t, 1.15, 0.6)}].filter((r, i) => i === 0 || t > 1.15)} th={thB} />
		<Counter year="2026" th={thB} />
		<Seal disc={B.cream} />
	</>;
};
const QRg: React.FC = () => <g>
	<path d={qrCells(22, 4).map(([j, i]) => `M${j * 4},${i * 4}h4.2v4.2h-4.2z`).join('')} fill={B.lac} />
	{[[0, 0], [0, 15], [15, 0]].map(([i, j]) => <g key={`${i}${j}`}><rect x={j * 4} y={i * 4} width={28} height={28} fill={B.lac} /><rect x={j * 4 + 4} y={i * 4 + 4} width={20} height={20} fill={B.cream} /><rect x={j * 4 + 8} y={i * 4 + 8} width={12} height={12} fill={B.lac} /></g>)}
</g>;

/* ---------- B2: the Song street ---------- */
const IronString: React.FC<{hx: number; hy: number; g: number; sway?: number}> = ({hx, hy, g, sway = 0}) => {
	const pts = stringPath(hx, hy, g, sway), e = pts[pts.length - 1];
	return <g>
		<g fill="none" strokeLinecap="round">{[-8, 8].map((o) => <g key={o}><path d={strandD(pts, o)} stroke="#2E3134" strokeWidth={22} /><path d={strandD(pts, o)} stroke="url(#iron)" strokeWidth={17} /></g>)}</g>
		<path d={ticksD(pts, 15)} stroke="#1E2023" strokeWidth={2} opacity={0.85} />
		{[[-6, -16, -18], [16, -20, 8], [36, -14, 22]].map(([dx, dy, r], i) => { const x = e[0] + dx, y = e[1] + dy;
			return <g key={i} transform={`rotate(${r},${x},${y})`}><circle cx={x} cy={y} r={20} fill="#55595E" stroke="#9AA2A8" strokeWidth={2} /><rect x={x - 6} y={y - 6} width={12} height={12} fill={B.lac} /></g>; })}
	</g>;
};
export const SongB: React.FC<{t: number}> = ({t}) => {
	const g = 905, h = 600, wx = 820 + 34 * t, ph = 0.22 + t / 1.5, sw = Math.sin(t * 4.2), pose = bentWalk(ph, 0.9 + 0.1 * sw);
	const nh = jointAt(pose, 'LHand', wx, g, h), fh = jointAt(pose, 'RHand', wx, g, h);
	const cam = -24 * t;
	const shops = [shop(-160, g - 4, 560, 390), shop(450, g - 4, 520, 360), shop(1080, g - 4, 600, 410), shop(1740, g - 4, 520, 380)];
	const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, 560, 300, 120 + 50 * rnd(i, 3)));
	const r1 = '于是有了[交子]：', r2 = '一张纸，能换一千文。';
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<LacDefs />
			<Lacquer sheen={0.3 + 0.1 * t} id="s" />
			{/* sky: gold cloud scrolls drifting (the lacquer painter fills the air with 云气) */}
			<g fill="none" stroke={B.gold} strokeWidth={2.5} strokeLinecap="round" opacity={0.55}>{[[260, 330, 40, 1], [700, 390, 32, -1], [1180, 300, 44, 1], [1560, 380, 30, -1], [980, 440, 26, 1]].map(([x, y, r, d], i) => <path key={i} d={curl(x + cam * 0.15 + 8 * t, y, r, d, 3.2)} />)}</g>
			<g transform={`translate(${cam * 0.25},0)`}>
				<g fill={B.far}>{far.map((s, i) => <path key={i} d={s.roof} />)}
					<path d="M1260,560 V420 H1540 V560 Z M1210,420 Q1320,392 1340,352 H1460 Q1480,392 1590,420 Z M1290,352 Q1370,334 1380,306 H1420 Q1430,334 1510,352 Z" /></g>
				<g fill="none" stroke={B.ochre} strokeWidth={1.5} opacity={0.7}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g>
				<rect x={-200} y={560} width={2600} height={360} fill={B.far} />
			</g>
			<g transform={`translate(${cam * 0.6},0)`}>
				{shops.map((s, i) => <g key={i}>
					<path d={s.roof} fill={B.lac2} stroke={B.gold} strokeWidth={2.5} />
					<path d={s.tiles} stroke={B.gold} strokeWidth={1.5} opacity={0.5} />
					<path d={s.posts} fill={B.redD} /><path d={s.beam} fill={B.red} stroke={B.gold} strokeWidth={2} />
					<path d={s.sign} fill={B.lac} stroke={B.gold} strokeWidth={2} />
					<path d={s.counter} fill={B.red} stroke={B.gold} strokeWidth={2} />
					<path d={s.shutter} stroke={B.redD} strokeWidth={7} />
				</g>)}
				{/* back walls in cinnabar so the black walker reads against red */}
				<rect x={-200} y={560} width={2600} height={350} fill={B.red} opacity={0.0} />
				{[[255, 560], [700, 575], [1360, 545]].map(([x, y], i) => <g key={i}><rect x={x - 1.5} y={y - 44} width={3} height={20} fill={B.gold} /><ellipse cx={x} cy={y} rx={22} ry={27} fill={B.redL} stroke={B.gold} strokeWidth={2} /><rect x={x - 12} y={y + 24} width={24} height={8} fill={B.gold} /></g>)}
				<rect x={1036} y={430} width={8} height={475} fill={B.ochre} /><path d="M1044,446 H1122 V650 L1083,628 L1044,650 Z" fill={B.redL} stroke={B.gold} strokeWidth={2} />
				<Walker x={1250} ground={g - 4} h={420} pose={grounded({lean: 6, neck: 12, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 70, ra: 24, re: 74})} col={B.lac2} look={{dress: 'robe', head: 'futou'}} />
				<path d={shops[2].counter} fill={B.red} stroke={B.gold} strokeWidth={2} />
				{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={1150 + i * 46} cy={g - 4 - 0.3 * 410 - 12} rx={26} ry={13} fill="url(#iron)" />)}
			</g>
			{/* ground: a cinnabar band with a gold lozenge lattice */}
			<rect x={-20} y={g} width={W + 40} height={H - g + 20} fill={B.redD} />
			<rect x={-20} y={g} width={W + 40} height={4} fill={B.gold} />
			<path d={Array.from({length: 30}, (_, i) => { const x = ((i * 90 + cam) % 2700 + 2700) % 2700 - 300; return `M${x},${g + 30} l45,40 l-45,40 l-45,-40 Z`; }).join(' ')} fill="none" stroke={B.gold} strokeWidth={2} opacity={0.6} />
			{/* the walker: lacquer black with a gold contour, a warm cinnabar halo field behind him */}
			<ellipse cx={wx + 20} cy={g - 280} rx={260} ry={330} fill={B.red} opacity={0.0} />
			<IronString hx={nh[0]} hy={nh[1]} g={g} sway={sw * 0.3} />
			<g filter="url(#edge)"><Walker x={wx} ground={g} h={h} pose={pose} col={B.lac} look={{dress: 'tunic', head: 'futou', legs: 'trousers'}} /></g>
			<g transform={`translate(${fh[0] - 6},${fh[1] - 160}) rotate(${-5 + 2.5 * Math.sin(t * 2)})`} filter="url(#gl)">
				<rect x={-5} y={-5} width={110} height={172} fill="url(#leaf)" />
				<Jiaozi w={100} h={162} red={B.red} ink={B.lac} paper={B.cream} id="jz" />
			</g>
			<g fontFamily={KAI} fontWeight={700} fontSize={46}>
				<text x={fh[0] + 116} y={fh[1] - 74} fill={B.goldL} style={{paintOrder: 'stroke'}} stroke={B.lac} strokeWidth={6}>一张</text>
				<path d={`M${nh[0] - 170},${g - 24} L${nh[0] - 220},${g - 112}`} stroke={B.cream} strokeWidth={2} opacity={0.6} />
				<text x={nh[0] - 360} y={g - 124} fill={B.cream} stroke={B.lac} strokeWidth={6} style={{paintOrder: 'stroke'}}>一千文</text>
			</g>
		</svg>
		<Subs rows={[{s: r1}, {s: r2}]} th={thB} />
		<Stamp y="北宋" place="益州" note="一交一缗" th={thB} />
		<Counter era="北宋" th={thB} />
		<Seal disc={B.cream} />
	</>;
};

/* ---------- motion test: 钅 unspools into a gold line → the spade is drawn and lacquered → a cloud curl casts it into the gold-leaf 布币 ---------- */
export const MorphB: React.FC<{t: number}> = ({t}) => {
	const s = 520, cam = 1 + 0.03 * eio(seg(t, 0, 4));
	const rest = 1 - ease(seg(t, 0.3, 0.9)), slide = eio(seg(t, 0.35, 1.0)), qFade = 1 - ease(seg(t, 1.0, 1.5));
	const qx = lerp(560, 760, slide), qy = lerp(330, 340, slide);
	const draw = eio(seg(t, 0.85, 1.5)), flood = eio(seg(t, 1.35, 1.95));
	const swirl = seg(t, 2.1, 2.9), shrink = eio(seg(t, 2.25, 2.85)), leafK = eio(seg(t, 2.75, 3.3)), hop = seg(t, 3.25, 3.75);
	const sp = spade(400, 260), bb = bubi(470), cx = 940, cy = lerp(720, 640, shrink);
	const r1 = '原来，"钱"是一把[铲子]。', r2 = '东周时，铲子变成了货币，';
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<LacDefs />
			<Lacquer sheen={0.1 + 0.18 * t} id="m" />
			<defs><clipPath id="floodB"><rect x={-600} y={lerp(230, -480, flood)} width={1200} height={1200} /></clipPath>
				<clipPath id="leafB"><rect x={-600} y={lerp(250, -250, leafK)} width={1200} height={1200} /></clipPath></defs>
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<ScrollBand y={268} x0={240} x1={1640} flow={t * 60} />
				<path d={treeD(1480, 900, 1.5)} fill={B.far} stroke={B.gold} strokeWidth={2} /><path d={treeD(380, 900, 1.1)} fill={B.far} stroke={B.gold} strokeWidth={2} />
				<path d={curl(1200 + 10 * t, 420, 34, -1, 3)} fill="none" stroke={B.gold} strokeWidth={2.4} opacity={0.6} />
				<rect x={-20} y={900} width={W + 40} height={200} fill={B.redD} /><rect x={-20} y={900} width={W + 40} height={4} fill={B.gold} />
				<path d={furrows(900)} stroke={B.gold} strokeWidth={2} fill="none" opacity={0.55} />
				{rest > 0.01 && <Glyph ch="钱" x={560} y={330} s={s} part="rest" id="mr" fill={B.red} stroke={B.gold} sw={3} style={{opacity: rest}} />}
				{qFade > 0.01 && <g opacity={qFade}><Glyph ch="钱" x={qx} y={qy} s={s} part="comp" id="mq" fill="url(#silv)" stroke="#EEF2F4" sw={2} /></g>}
				<g transform={`translate(${cx},${cy}) scale(${lerp(1, 0.96, shrink)}) rotate(${-14 * Math.sin(Math.PI * swirl)})`}>
					<g opacity={1 - shrink}>
						<g clipPath="url(#floodB)"><path d={sp.handle} fill={B.ochre} /><path d={sp.blade} fill={B.red} /></g>
						<path d={sp.handle} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} fill="none" stroke={B.gold} strokeWidth={4} />
						<path d={sp.blade} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} fill="none" stroke={B.goldL} strokeWidth={5} />
					</g>
					<g opacity={shrink}>
						<path d={bb.body} fill={B.red} stroke={B.gold} strokeWidth={4} />
						<g clipPath="url(#leafB)"><path d={bb.body} fill="url(#leaf)" /></g>
						<path d={bb.hole} fill={B.lac} /><path d={bb.nail} fill={B.lac} /><path d={bb.ribs} stroke={B.lac} strokeWidth={4} opacity={0.5} fill="none" />
					</g>
				</g>
				{/* the cloud curl that wraps the spade and closes on the coin */}
				{swirl > 0 && swirl < 1 && <path d={curl(cx - 40, cy - 40, 220, 1, 1.6, 0.3)} pathLength={1} strokeDasharray={`${0.6 * Math.sin(Math.PI * swirl)} 1`} strokeDashoffset={-swirl * 0.5} fill="none" stroke={B.goldL} strokeWidth={6} strokeLinecap="round" />}
				{hop > 0 && <g transform={`translate(${1260},${lerp(420, 520, eout(hop)) - Math.sin(Math.PI * hop) * 50})`} opacity={cl(hop * 3)} filter="url(#glS)">
					<rect x={-18} y={-14} width={176} height={176} fill={B.redD} stroke={B.gold} strokeWidth={3} />
					<Glyph ch="钱" x={0} y={0} s={140} part="rest" id="hr" fill={B.cream} />
					<Glyph ch="钱" x={0} y={0} s={140} part="comp" id="hq" fill="url(#silv)" />
				</g>}
			</g>
		</svg>
		<Subs rows={[t < 2.05 ? {s: r1} : {s: r2, n: typed(r2, t, 2.05, 0.5)}]} th={thB} />
		<Counter era={t < 2.05 ? '商周' : '东周'} th={thB} />
		<Seal disc={B.cream} />
	</>;
};

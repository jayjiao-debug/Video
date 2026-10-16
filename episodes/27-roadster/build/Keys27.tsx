import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {K, W, H, SANS, Air, Sub, Lab, Site, Vignette} from './kit27';
import {Car, Plume, NOZZLES} from './Car27';
import {CURL, CEIL_Y, Curl, Flood, Horizon, Lineup} from './World27';
import {JUNO} from '../brand/identity';

/** local car point → world */
const carPt = (lx: number, ly: number, x: number, y: number, s: number, rot: number) => {
	const a = (rot * Math.PI) / 180, px = (lx - 510) * s, py = (ly - 292) * s;
	return {x: x + px * Math.cos(a) - py * Math.sin(a), y: y + px * Math.sin(a) + py * Math.cos(a)};
};
const Mark: React.FC = () => <div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#f3ede2'}}>{JUNO.mark}</div>;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>{children}</svg>;

/* K1 · cold open: the car hangs at the top of the curl */
const SiteScene: React.FC<{t: number; title?: boolean}> = ({t, title}) => {
	const p = {x: 760, y: CEIL_Y, rot: 180};
	return (
		<Site hy={880}>
			<Svg>
				<Horizon hy={880} />
				<Curl id="k1" />
				<Flood id="k1f" sx={1500} sy={990} tx={p.x} ty={p.y + 80} spread={0.17} motes={170} t={t} />
				<rect x={0} y={944} width={W} height={140} fill="#1e252f" />
				<rect x={0} y={940} width={CURL.cx} height={5} fill="#d9e1ea" opacity={0.35} />
				<Car id="k1c" x={p.x} y={p.y} s={0.56} rot={p.rot} spin={t * 40} />
				{/* the car's reflection on the wet ground */}
				<ellipse cx={p.x} cy={990} rx={200} ry={10} fill="#e9eef5" opacity={0.08} />
			</Svg>
			{title && (
				<div style={{position: 'absolute', left: 120, top: 560, fontFamily: SANS, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(8,14,26,0.75)'}}>
					<div style={{fontSize: 96, letterSpacing: '0.04em'}}>凭什么</div>
					<div style={{fontSize: 128, letterSpacing: '0.02em', marginTop: -6}}>能开上<span style={{color: K.amber}}>天花板</span>？</div>
				</div>
			)}
			<Vignette />
		</Site>
	);
};

/* K3 · the jump over the lineup */
const Jump: React.FC<{t: number}> = ({t}) => {
	const x = 980, y = 430, s = 0.62, rot = -10;
	return (
		<Site hy={820}>
			<Svg>
				<Horizon hy={820} dx={-80} />
				<rect x={0} y={900} width={W} height={180} fill="#1e252f" />
				<Flood id="k3f" sx={1900} sy={1120} tx={x} ty={y} spread={0.2} motes={140} t={t} />
				<Lineup x={210} y={902} s={0.92} />
				{NOZZLES.slice(0, 4).map(([lx, ly], i) => {
					const q = carPt(lx, ly, x, y, s, rot);
					return <Plume key={i} id={`k3p${i}`} x={q.x} y={q.y} a={98 + i * 2} L={300 + i * 30} w={0.22} seed={i + 3} />;
				})}
				<Car id="k3c" x={x} y={y} s={s} rot={rot} spin={t * 200} nozzles={0} />
				{/* the arc it flies */}
				<path d="M 140 860 C 500 250, 1400 250, 1800 860" stroke={K.amber} strokeWidth={4} strokeDasharray="6 22" strokeLinecap="round" fill="none" opacity={0.6} />
				<Lab x={110} y={150} anchor="start" size={44} weight={700} col={K.mute}>2026.10.15 · 美国得州 · SpaceX 测试场</Lab>
			</Svg>
			<Vignette />
		</Site>
	);
};

/* K4 · the column of air on your phone (CSS 3D: a phone on a table, a glass column rising out of frame) */
const Column: React.FC<{t: number}> = ({t}) => {
	const pw = 380, pd = 780, ch = 2000;
	const face = (w: number): React.CSSProperties => ({position: 'absolute', width: w, height: ch, top: -ch, background: 'linear-gradient(0deg, rgba(191,227,255,0.26), rgba(191,227,255,0.03) 80%)', borderLeft: '2px solid rgba(191,227,255,0.55)', borderRight: '2px solid rgba(191,227,255,0.55)'});
	const dots = (seed: number) => (
		<svg width={pw} height={ch} style={{position: 'absolute', inset: 0}}>
			<Air x={0} y={0} w={pw} h={ch} n={520} seed={seed} t={t} r={3.2} o={0.9} density={(_, yy) => 0.15 + 0.85 * (yy / ch) ** 2} />
		</svg>
	);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #172640 0%, #2b4062 55%, #3a4a63 100%)'}}>
			<AbsoluteFill style={{background: 'radial-gradient(700px 500px at 50% 78%, rgba(255,214,170,0.30), rgba(255,214,170,0) 70%)'}} />
			<div style={{position: 'absolute', inset: 0, perspective: 1700, perspectiveOrigin: '50% 30%'}}>
				<div style={{position: 'absolute', left: 820, top: 700, transformStyle: 'preserve-3d', transform: 'translateZ(-900px) rotateX(-28deg) rotateY(-32deg)'}}>
					{/* table */}
					<div style={{position: 'absolute', left: -1900, top: -1900, width: 3800, height: 3800, transform: 'translateY(14px) rotateX(90deg)',
						background: 'radial-gradient(1300px 1100px at 50% 50%, #8a6a52 0%, #5e4a3c 35%, #3b3029 70%, #2c2520 100%)'}} />
					{/* phone body + screen */}
					<div style={{position: 'absolute', left: -pw / 2 - 6, top: -pd / 2 - 6, width: pw + 12, height: pd + 12, borderRadius: 64, background: '#0a0d12', transform: 'translateY(13px) rotateX(90deg)'}} />
					<div style={{position: 'absolute', left: -pw / 2, top: -pd / 2, width: pw, height: pd, borderRadius: 58, background: '#0d1117', transform: 'rotateX(90deg)', padding: 12, boxSizing: 'border-box'}}>
						<div style={{width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', position: 'relative', background: 'linear-gradient(160deg, #6fb6ff 0%, #4a63d8 55%, #2a2f7a 100%)'}}>
							<div style={{position: 'absolute', top: 18, left: '50%', marginLeft: -60, width: 120, height: 34, borderRadius: 17, background: '#000'}} />
							<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.85)'}}>10月16日 星期五</div>
							<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 130, color: '#fff'}}>21:04</div>
							<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 40%)'}} />
						</div>
					</div>
					{/* the column of air standing on the screen */}
					<div style={{...face(pw), left: -pw / 2, transform: `translateZ(${pd / 2}px)`}}>{dots(5)}</div>
					<div style={{...face(pw), left: -pw / 2, transform: `translateZ(${-pd / 2}px)`}} />
					<div style={{...face(pd), left: -pd / 2, transform: `translateX(${-pw / 2}px) rotateY(90deg)`}} />
					<div style={{...face(pd), left: -pd / 2, transform: `translateX(${pw / 2}px) rotateY(90deg)`}}>{dots(8)}</div>
					<div style={{position: 'absolute', left: -pw / 2, top: -ch, width: pw, height: ch, transform: 'translateZ(0px)'}}>{dots(12)}</div>
				</div>
			</div>
			<Svg>
				<Lab x={1330} y={360} anchor="start" size={56}>这一柱空气</Lab>
				<text x={1320} y={520} style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, paintOrder: 'stroke'}} stroke="rgba(8,12,20,0.5)" strokeWidth={8} fill={K.amber}>≈100<tspan style={{fontSize: 72}} dx={12}>公斤</tspan></text>
				<Lab x={1330} y={620} anchor="start" size={42} weight={600} col={K.mute}>一直通到大气层顶</Lab>
			</Svg>
			<Vignette />
		</AbsoluteFill>
	);
};

/* K5 / K6 · x-ray of the inverted car against the ceiling */
const Ceiling: React.FC<{t: number; board?: boolean}> = ({t, board}) => {
	const cy = 230, s = board ? 0.86 : 1.25, x = 960, rot = 180;
	const floorY = cy + (292 - 230) * s, half = 470 * s;
	const rear = carPt(40, 204, x, cy, s, rot);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #1b2d48 0%, #2d4566 55%, #3b5070 100%)'}}>
			<Svg>
				<defs>
					<linearGradient id="k5ceil" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={K.steelDk} />
						<stop offset="0.8" stopColor={K.steel} />
						<stop offset="1" stopColor={K.steelHi} />
					</linearGradient>
				</defs>
				{/* air everywhere, thin in the sealed gap under the floor */}
				<Air x={0} y={cy} w={W} h={H - cy} n={2000} seed={9} t={t} r={2.1} o={board ? 0.35 : 0.6}
					density={(xx, yy) => (yy < floorY + 2 && Math.abs(xx - x) < half ? 0.1 : 1)} />
				<rect x={x - half} y={cy} width={half * 2} height={floorY - cy} fill="#08101d" opacity={0.38} />
				<Air x={x - half} y={cy} w={half * 2} h={floorY - cy} n={60} seed={4} t={t} r={2.1} o={0.6} />
				<rect width={W} height={cy} fill="url(#k5ceil)" />
				{Array.from({length: 22}, (_, i) => <line key={i} x1={i * 92 + 20} y1={0} x2={i * 92 + 20} y2={cy} stroke="rgba(20,26,36,0.4)" strokeWidth={3} />)}
				<rect x={0} y={cy - 12} width={W} height={4} fill={K.amber} opacity={0.6} style={{strokeDasharray: '30 30'}} />
				<rect x={0} y={cy - 3} width={W} height={3} fill="#f3f7fb" opacity={0.9} />
				<Car id="k5c" x={x} y={cy} s={s} rot={rot} xray={1} fan={1} tanks={0} spin={t * 400} />
				<Plume id="k5ex" x={rear.x} y={rear.y} a={0} L={board ? 200 : 300} w={0.2} o={0.5} />
				{!board && (
					<>
						<Lab x={x} y={130} size={50} weight={900} col={K.ink} scrim={0.6}>车底：空气被抽薄</Lab>
						<path d={`M ${x} 150 L ${x} ${cy + (floorY - cy) / 2}`} stroke={K.ink} strokeWidth={3} />
						<circle cx={x} cy={cy + (floorY - cy) / 2} r={7} fill={K.ink} />
						{[460, 1460].map((ax) => (
							<g key={ax}>
								<path d={`M ${ax} 880 L ${ax} ${floorY + 250}`} stroke={K.amber} strokeWidth={18} strokeLinecap="round" />
								<path d={`M ${ax - 46} ${floorY + 296} L ${ax} ${floorY + 240} L ${ax + 46} ${floorY + 296}`} stroke={K.amber} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />
							</g>
						))}
						<Lab x={960} y={790} size={54}>外面的空气多，把车往上推</Lab>
					</>
				)}
				{board && (
					<g>
						<Lab x={960} y={560} size={56}>车底约4平方米，空气能推约<tspan fill={K.amber}>40吨</tspan></Lab>
						<rect x={260} y={630} width={1400} height={90} rx={14} fill="#bfe3ff" opacity={0.28} />
						<rect x={260} y={630} width={1400} height={90} rx={14} fill="none" stroke={K.air} strokeWidth={3} />
						{Array.from({length: 19}, (_, i) => <line key={i} x1={260 + (i + 1) * 70} y1={634} x2={260 + (i + 1) * 70} y2={716} stroke={K.air} strokeWidth={1.5} opacity={0.35} />)}
						<rect x={260} y={630} width={70} height={90} rx={14} fill={K.amber} />
						<path d="M 295 730 L 295 770" stroke={K.amber} strokeWidth={4} />
						<Lab x={275} y={830} anchor="start" size={52}>车重约2吨 = <tspan fill={K.amber} style={{fontSize: 80, fontWeight: 900}}>5%</tspan></Lab>
						<Lab x={1660} y={790} anchor="end" size={40} weight={600} col={K.mute}>每一格 = 2吨</Lab>
					</g>
				)}
			</Svg>
			<Vignette />
		</AbsoluteFill>
	);
};

/* K7 · balloon → tanks and nozzles */
const Tanks: React.FC<{t: number}> = ({t}) => {
	const x = 1120, y = 760, s = 1.05;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #172a45 0%, #2a4263 70%, #34496a 100%)'}}>
			<Svg>
				{/* faint drafting grid */}
				{Array.from({length: 26}, (_, i) => <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={H} stroke={K.xray} strokeWidth={1} opacity={0.07} />)}
				{Array.from({length: 15}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={W} y2={i * 80} stroke={K.xray} strokeWidth={1} opacity={0.07} />)}
				<rect x={0} y={y} width={W} height={4} fill={K.air} opacity={0.35} />
				{/* the balloon */}
				<g transform="translate(330 300) rotate(-24)">
					<Plume id="k7b" x={0} y={78} a={110} L={150} w={0.22} o={0.7} />
					<ellipse cx={0} cy={0} rx={70} ry={86} fill="#ff7a5c" />
					<ellipse cx={-22} cy={-30} rx={16} ry={26} fill="#fff" opacity={0.45} />
					<path d="M -10 84 L 10 84 L 0 72 Z" fill="#d4553b" />
				</g>
				<Lab x={330} y={490} size={44} weight={700} col={K.mute}>松手的气球</Lab>
				<path d="M 470 330 C 560 300, 640 320, 700 380" stroke={K.amber} strokeWidth={4} strokeDasharray="8 14" fill="none" />
				<path d="M 684 352 L 704 384 L 668 390" stroke={K.amber} strokeWidth={4} fill="none" />
				{NOZZLES.slice(0, 4).map(([lx, ly], i) => {
					const q = carPt(lx, ly, x, y, s, 0);
					return <Plume key={i} id={`k7p${i}`} x={q.x} y={q.y} a={90} L={180} w={0.25} seed={i + 9} o={0.85} />;
				})}
				<Car id="k7c" x={x} y={y} s={s} xray={1} tanks={1} nozzles={1} />
				<Lab x={1120} y={330} size={56}>高压气瓶，塞满每个空隙</Lab>
				<Lab x={1120} y={420} size={46} weight={700} col={K.mute}>据报道：10个喷口 · 600升压缩空气</Lab>
			</Svg>
			<Vignette />
		</AbsoluteFill>
	);
};

/* K8 · three versions, and the date */
const Trims: React.FC<{t: number}> = ({t}) => {
	const cols = [
		{x: 340, name: 'Performance', l1: '能倒挂，不会飞', l2: '定金 5万美元', fly: false},
		{x: 960, name: 'Thrust', l1: '车尾喷气', l2: '加速更猛', fly: false},
		{x: 1580, name: 'Rocket', l1: '会"飞"·单座', l2: '仅邀请 · 不能上路', fly: true},
	];
	return (
		<Site hy={600}>
			<Svg>
				<Horizon hy={600} />
				<rect x={0} y={600} width={W} height={480} fill="#1f2630" />
				<Flood id="k8f" sx={960} sy={-40} tx={960} ty={560} spread={0.62} o={0.8} />
				{cols.map((c, i) => {
					const y = c.fly ? 470 : 560;
					return (
						<g key={i}>
							{c.fly && NOZZLES.slice(0, 4).map(([lx, ly], j) => {
								const q = carPt(lx, ly, c.x, y, 0.44, 0);
								return <Plume key={j} id={`k8p${j}`} x={q.x} y={q.y} a={90} L={110} w={0.25} seed={j + 2} o={0.85} />;
							})}
							{i === 1 && <Plume id="k8r" x={carPt(26, 186, c.x, y, 0.44, 0).x} y={carPt(26, 186, c.x, y, 0.44, 0).y} a={180} L={160} w={0.2} />}
							<Car id={`k8c${i}`} x={c.x} y={y} s={0.44} />
							<Lab x={c.x} y={680} size={56} weight={900}>{c.name}</Lab>
							<Lab x={c.x} y={760} size={44} weight={700} col={c.fly ? K.amber : K.ink}>{c.l1}</Lab>
							<Lab x={c.x} y={826} size={44} weight={700} col={K.mute}>{c.l2}</Lab>
						</g>
					);
				})}
				<g transform="translate(1590 200) rotate(-6)">
					<rect x={-230} y={-70} width={460} height={120} rx={14} fill="none" stroke={K.amber} strokeWidth={6} />
					<text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 64, fontWeight: 900}} fill={K.amber}>2028年才量产</text>
				</g>
			</Svg>
			<Vignette />
		</Site>
	);
};

const FRAMES: {el: (t: number) => React.ReactNode; sub: string}[] = [
	{el: (t) => <SiteScene t={t} />, sub: '倒挂在头顶上'},
	{el: (t) => <SiteScene t={t} title />, sub: ''},
	{el: (t) => <Jump t={t} />, sub: '还从一排车顶上跳了过去'},
	{el: (t) => <Column t={t} />, sub: '你的手机屏幕上，压着约[100公斤]'},
	{el: (t) => <Ceiling t={t} />, sub: '把车底的空气抽走一点'},
	{el: (t) => <Ceiling t={t} board />, sub: '车底的空气，只要少[约5%]'},
	{el: (t) => <Tanks t={t} />, sub: '特斯拉把气球换成了[高压气瓶]'},
	{el: (t) => <Trims t={t} />, sub: '会飞的版本：单座、仅邀请、不能上路'},
];

export const Keys27: React.FC = () => {
	const f = useCurrentFrame();
	const k = FRAMES[Math.min(f, FRAMES.length - 1)];
	return (
		<AbsoluteFill style={{background: '#16233a'}}>
			{k.el(3)}
			<Sub t={k.sub} />
			<Mark />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="KEYS27" component={Keys27} durationInFrames={FRAMES.length} fps={30} width={W} height={H} />;
registerRoot(Root);

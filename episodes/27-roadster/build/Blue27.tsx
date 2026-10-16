import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, SANS, Sub, rng} from './kit27';
import {BODY, WHEELS} from './Car27';
import {JUNO} from '../brand/identity';

/* ep27 v4 look "蓝图": one huge engineering sheet. Lines draw themselves, parts explode out, sections cut open,
   forces are vectors, the spec is the drawing's title block. White ink on blueprint blue, one hot colour for force. */
export const B = {
	paper: '#0c3a86', paperDk: '#082a66', ink: '#eaf3ff', inkMute: 'rgba(234,243,255,0.62)', faint: 'rgba(234,243,255,0.16)',
	cyan: '#7fe3ff', force: '#ff7a45', amber: '#ffc95c', stamp: '#ff5a4a',
};
const GLASS = 'M 628 116 C 590 84, 552 74, 470 72 C 410 72, 352 88, 300 112 C 296 116, 300 120, 308 120 L 612 124 C 624 124, 632 120, 628 116 Z';
const TANKS: [number, number, number, number][] = [[300, 196, 420, 24], [120, 140, 160, 30], [130, 176, 150, 26], [690, 166, 210, 30], [520, 152, 100, 26]];
const NOZ: [number, number][] = [[118, 232], [330, 232], [690, 232], [905, 232], [26, 186], [996, 204]];

/** the sheet: paper, grid, drawing border */
export const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: `radial-gradient(1400px 900px at 45% 40%, ${B.paper}, ${B.paperDk} 100%)`}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<defs>
				<pattern id="gMin" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(234,243,255,0.06)" strokeWidth="1" /></pattern>
				<pattern id="gMaj" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="url(#gMin)" /><path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(234,243,255,0.11)" strokeWidth="1.2" /></pattern>
				<filter id="paperN"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
			</defs>
			<rect width={W} height={H} fill="url(#gMaj)" />
			<rect width={W} height={H} filter="url(#paperN)" />
		</svg>
		{children}
	</AbsoluteFill>
);

/** line-art car (side elevation). Local 1000 × 292, wheel line at y 292. Hidden parts dashed; highlights optional. */
export const LineCar: React.FC<{sw?: number; parts?: number; fan?: number; tanks?: number; nozzles?: number; lift?: number; ghost?: number}> = ({sw = 3, parts = 0.5, fan = 0, tanks = 0, nozzles = 0, lift = 0, ghost = 0}) => (
	<g>
		{/* body shell (lifts away in the exploded view) */}
		<g transform={`translate(0 ${-lift})`} opacity={1 - ghost * 0.6}>
			<path d={BODY} fill="rgba(234,243,255,0.05)" stroke={B.ink} strokeWidth={sw} strokeLinejoin="round" />
			<path d={GLASS} fill="rgba(127,227,255,0.10)" stroke={B.ink} strokeWidth={sw * 0.8} />
			<path d="M 60 150 C 300 128, 640 140, 960 182" stroke={B.inkMute} strokeWidth={sw * 0.6} fill="none" />
			<path d="M 300 128 L 296 214 M 612 126 C 618 160, 616 196, 606 220" stroke={B.inkMute} strokeWidth={sw * 0.6} fill="none" />
			<path d="M 946 176 C 966 180, 984 188, 992 198" stroke={B.ink} strokeWidth={sw} fill="none" />
		</g>
		{/* chassis line + wheels */}
		<path d="M 60 230 L 970 230" stroke={B.ink} strokeWidth={sw} />
		{WHEELS.map(([cx, cy], i) => (
			<g key={i}>
				<circle cx={cx} cy={cy} r={56} fill={B.paperDk} stroke={B.ink} strokeWidth={sw} />
				<circle cx={cx} cy={cy} r={36} fill="none" stroke={B.inkMute} strokeWidth={sw * 0.6} />
				<circle cx={cx} cy={cy} r={6} fill={B.ink} />
				<path d={`M ${cx - 70} ${cy} L ${cx + 70} ${cy} M ${cx} ${cy - 70} L ${cx} ${cy + 70}`} stroke={B.faint} strokeWidth={1.5} strokeDasharray="10 6 2 6" />
			</g>
		))}
		{/* hidden parts */}
		<g opacity={parts}>
			{TANKS.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} fill={tanks ? `rgba(255,201,92,${0.25 * tanks})` : 'none'} stroke={tanks ? B.amber : B.inkMute} strokeWidth={sw * 0.7} strokeDasharray={tanks ? undefined : '10 7'} />)}
			<rect x={420} y={206} width={180} height={22} rx={8} fill={fan ? `rgba(127,227,255,${0.3 * fan})` : 'none'} stroke={fan ? B.cyan : B.inkMute} strokeWidth={sw * 0.7} strokeDasharray={fan ? undefined : '10 7'} />
		</g>
		{nozzles > 0 && NOZ.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={B.paperDk} stroke={B.force} strokeWidth={sw * 0.8} opacity={nozzles} />)}
	</g>
);

/** dimension line between two points with a label (blueprint style: ticks + text) */
export const Dim: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; size?: number; off?: number; col?: string}> = ({x1, y1, x2, y2, label, size = 40, off = 0, col = B.ink}) => {
	const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
	const X1 = x1 + nx * off, Y1 = y1 + ny * off, X2 = x2 + nx * off, Y2 = y2 + ny * off;
	const mx = (X1 + X2) / 2, my = (Y1 + Y2) / 2;
	return (
		<g>
			<line x1={x1} y1={y1} x2={X1 + nx * 10} y2={Y1 + ny * 10} stroke={B.inkMute} strokeWidth={1.5} />
			<line x1={x2} y1={y2} x2={X2 + nx * 10} y2={Y2 + ny * 10} stroke={B.inkMute} strokeWidth={1.5} />
			<line x1={X1} y1={Y1} x2={X2} y2={Y2} stroke={col} strokeWidth={2} />
			{[[X1, Y1, 1], [X2, Y2, -1]].map(([px, py, s], i) => <path key={i} d={`M ${px} ${py} l ${Math.cos(a) * 18 * s - nx * 7} ${Math.sin(a) * 18 * s - ny * 7} l ${nx * 14} ${ny * 14} Z`} fill={col} />)}
			<text x={mx} y={my - 12} textAnchor="middle" style={{fontFamily: SANS, fontSize: size, fontWeight: 800}} fill={col} transform={`rotate(${(a * 180) / Math.PI} ${mx} ${my})`}>{label}</text>
		</g>
	);
};
/** force vector */
export const Vec: React.FC<{x: number; y: number; dx: number; dy: number; w?: number; col?: string}> = ({x, y, dx, dy, w = 10, col = B.force}) => {
	const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, hx = x + dx, hy = y + dy, hw = w * 2.6, hl = w * 3.4;
	return (
		<g>
			<line x1={x} y1={y} x2={hx - ux * hl * 0.8} y2={hy - uy * hl * 0.8} stroke={col} strokeWidth={w} strokeLinecap="round" />
			<path d={`M ${hx} ${hy} L ${hx - ux * hl - uy * hw} ${hy - uy * hl + ux * hw} L ${hx - ux * hl + uy * hw} ${hy - uy * hl - ux * hw} Z`} fill={col} />
		</g>
	);
};
/** numbered callout: circle + leader + label */
export const Call: React.FC<{n: string; x: number; y: number; tx: number; ty: number; label: string; col?: string; size?: number}> = ({n, x, y, tx, ty, label, col = B.ink, size = 48}) => (
	<g>
		<line x1={x} y1={y} x2={tx} y2={ty} stroke={col} strokeWidth={2} />
		<circle cx={x} cy={y} r={7} fill={col} />
		<circle cx={tx} cy={ty} r={34} fill={B.paperDk} stroke={col} strokeWidth={3} />
		<text x={tx} y={ty + 13} textAnchor="middle" style={{fontFamily: SANS, fontSize: 38, fontWeight: 900}} fill={col}>{n}</text>
		<text x={tx + 52} y={ty + 16} style={{fontFamily: SANS, fontSize: size, fontWeight: 900}} fill={col}>{label}</text>
	</g>
);
const Fig: React.FC<{x: number; y: number; n: string; t: string}> = ({x, y, n, t}) => (
	<g>
		<text x={x} y={y} style={{fontFamily: SANS, fontSize: 30, fontWeight: 700, letterSpacing: '0.18em'}} fill={B.inkMute}>{`FIG. ${n}`}</text>
		<text x={x} y={y + 52} style={{fontFamily: SANS, fontSize: 44, fontWeight: 900}} fill={B.ink}>{t}</text>
		<line x1={x} y1={y + 70} x2={x + 300} y2={y + 70} stroke={B.inkMute} strokeWidth={2} />
	</g>
);
const Mark: React.FC = () => <div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#eaf3ff'}}>{JUNO.mark}</div>;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>{children}</svg>;

/* ---------- K1 · the stunt, drawn: loop elevation, car hanging under the ceiling ---------- */
const K1: React.FC = () => {
	const cx = 1240, cy = 600, R = 330, band = 46;
	const s = 0.5, carX = 760, ceil = cy - R;
	const hatch = Array.from({length: 70}, (_, i) => <line key={i} x1={360 + i * 18} y1={ceil - band} x2={360 + i * 18 + 30} y2={ceil} stroke={B.inkMute} strokeWidth={1.5} />);
	return (
		<Paper>
			<Svg>
				<defs><clipPath id="k1band"><path d={`M 360 ${ceil} L ${cx} ${ceil} A ${R} ${R} 0 0 1 ${cx} ${cy + R} L ${cx} ${cy + R + band} A ${R + band} ${R + band} 0 0 0 ${cx} ${ceil - band} L 360 ${ceil - band} Z`} /></clipPath></defs>
				{/* construction lines */}
				<circle cx={cx} cy={cy} r={R} fill="none" stroke={B.faint} strokeWidth={1.5} strokeDasharray="14 8" />
				<path d={`M ${cx - 380} ${cy} L ${cx + 420} ${cy} M ${cx} ${cy - 400} L ${cx} ${cy + 420}`} stroke={B.faint} strokeWidth={1.5} strokeDasharray="22 8 4 8" />
				<line x1={cx} y1={cy} x2={cx + R * Math.cos(-0.6)} y2={cy + R * Math.sin(-0.6)} stroke={B.inkMute} strokeWidth={2} />
				<text x={cx + 120} y={cy - 110} style={{fontFamily: SANS, fontSize: 36, fontWeight: 800}} fill={B.inkMute}>R ≈ 6 m</text>
				{/* track section: hatched */}
				<g clipPath="url(#k1band)">{hatch}{Array.from({length: 40}, (_, i) => <line key={i} x1={cx} y1={cy} x2={cx + 900 * Math.cos(-1.6 + i * 0.08)} y2={cy + 900 * Math.sin(-1.6 + i * 0.08)} stroke={B.inkMute} strokeWidth={1.5} />)}</g>
				<path d={`M 360 ${ceil} L ${cx} ${ceil} A ${R} ${R} 0 0 1 ${cx} ${cy + R} L 120 ${cy + R}`} fill="none" stroke={B.ink} strokeWidth={4} />
				<path d={`M 360 ${ceil - band} L ${cx} ${ceil - band} A ${R + band} ${R + band} 0 0 1 ${cx} ${cy + R + band} L 120 ${cy + R + band}`} fill="none" stroke={B.ink} strokeWidth={3} />
				<line x1={360} y1={ceil - band} x2={360} y2={ceil} stroke={B.ink} strokeWidth={4} />
				{/* the run, as a dashed path with direction ticks */}
				<path d={`M 200 ${cy + R - 30} L ${cx} ${cy + R - 30} A ${R - 30} ${R - 30} 0 0 0 ${cx} ${ceil + 30} L ${carX + 300} ${ceil + 30}`} fill="none" stroke={B.cyan} strokeWidth={3} strokeDasharray="4 14" strokeLinecap="round" />
				{/* the car, inverted */}
				<g transform={`translate(${carX} ${ceil}) rotate(180) scale(${s}) translate(-510 -292)`}><LineCar sw={5} parts={0.55} /></g>
				{/* motion ticks */}
				{[0, 1, 2].map((i) => <line key={i} x1={carX + 270 + i * 40} y1={ceil + 40 + i * 22} x2={carX + 340 + i * 40} y2={ceil + 40 + i * 22} stroke={B.ink} strokeWidth={3} strokeLinecap="round" opacity={0.7 - i * 0.18} />)}
				<Vec x={carX} y={ceil + 210} dx={0} dy={90} w={8} col={B.inkMute} />
				<text x={carX + 26} y={ceil + 290} style={{fontFamily: SANS, fontSize: 40, fontWeight: 800}} fill={B.inkMute}>重力 ↓</text>
				<Fig x={110} y={110} n="01" t="倒挂行驶" />
			</Svg>
		</Paper>
	);
};

/* ---------- K2 · exploded view: two parts ---------- */
const K2: React.FC = () => {
	const s = 1.15, x0 = 960 - 510 * s, y0 = 640 - 292 * s;
	const T = (lx: number, ly: number) => ({x: x0 + lx * s, y: y0 + ly * s});
	const fan = T(510, 217), tank = T(720, 181);
	return (
		<Paper>
			<Svg>
				{/* explode guide lines */}
				{[60, 300, 640, 960].map((lx) => { const a = T(lx, 230), b = T(lx, 230 - 150); return <line key={lx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={B.faint} strokeWidth={2} strokeDasharray="8 8" />; })}
				<g transform={`translate(${x0} ${y0}) scale(${s})`}><LineCar sw={3.5} parts={1} fan={1} tanks={1} lift={170} ghost={0.4} /></g>
				<Call n="1" x={fan.x} y={fan.y + 10} tx={fan.x - 330} ty={fan.y + 210} label="风扇" col={B.cyan} />
				<Call n="2" x={tank.x} y={tank.y + 8} tx={tank.x + 120} ty={tank.y + 230} label="高压气瓶" col={B.amber} />
				<Fig x={110} y={110} n="02" t="拆开：只有两样东西" />
			</Svg>
		</Paper>
	);
};

/* ---------- K3 · section through the floor: air in, air out, the 5 % ---------- */
const K3: React.FC = () => {
	const top = 300, floorY = 380, x1 = 300, x2 = 1400;
	const R = rng(4), dots: React.ReactNode[] = [];
	for (let i = 0; i < 520; i++) { const x = 140 + R() * 1640, y = floorY + 120 + R() * 420, rr = 3 + R() * 3; dots.push(<circle key={i} cx={x} cy={y} r={rr} fill="none" stroke={B.ink} strokeWidth={1.6} opacity={0.55} />); }
	for (let i = 0; i < 40; i++) { const x = x1 + 20 + R() * (x2 - x1 - 40), y = top + 10 + R() * (floorY - top - 20); dots.push(<circle key={'g' + i} cx={x} cy={y} r={4} fill="none" stroke={B.cyan} strokeWidth={1.8} />); }
	return (
		<Paper>
			<Svg>
				{/* ceiling, sectioned */}
				<rect x={0} y={170} width={W} height={top - 170} fill="rgba(234,243,255,0.06)" />
				<g>{Array.from({length: 120}, (_, i) => <line key={i} x1={i * 18 - 130} y1={top} x2={i * 18} y2={170} stroke={B.inkMute} strokeWidth={1.4} />)}</g>
				<line x1={0} y1={top} x2={W} y2={top} stroke={B.ink} strokeWidth={4} />
				{/* car floor (sectioned plate) + wheels touching */}
				<rect x={x1} y={floorY} width={x2 - x1} height={44} fill="rgba(234,243,255,0.08)" stroke={B.ink} strokeWidth={4} />
				{[x1 + 170, x2 - 170].map((wx) => <g key={wx}><circle cx={wx} cy={top + 55} r={55} fill={B.paperDk} stroke={B.ink} strokeWidth={4} /><circle cx={wx} cy={top + 55} r={8} fill={B.ink} /></g>)}
				<rect x={x1} y={top} width={x2 - x1} height={floorY - top} fill="rgba(127,227,255,0.06)" />
				{/* fan pulling air out sideways */}
				<rect x={800} y={floorY - 6} width={120} height={56} rx={10} fill={B.paperDk} stroke={B.cyan} strokeWidth={3} />
				<Vec x={920} y={floorY + 22} dx={560} dy={0} w={7} col={B.cyan} />
				<text x={1000} y={floorY + 90} style={{fontFamily: SANS, fontSize: 40, fontWeight: 800}} fill={B.cyan}>抽出去</text>
				{dots}
				{/* forces */}
				{[520, 850, 1180].map((x) => <Vec key={x} x={x} y={880} dx={0} dy={-(880 - floorY - 70)} w={12} />)}
				<Vec x={1600} y={floorY + 60} dx={0} dy={120} w={9} col={B.ink} />
				<text x={1600} y={floorY + 240} textAnchor="middle" style={{fontFamily: SANS, fontSize: 44, fontWeight: 900}} fill={B.ink}>车重 ≈2吨</text>
				<text x={110} y={640} style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill={B.force}>外面空气往上推</text>
				<text x={110} y={720} style={{fontFamily: SANS, fontSize: 64, fontWeight: 900}} fill={B.force}>≈40吨</text>
				<Dim x1={x1} y1={top - 10} x2={x2} y2={top - 10} label="车底面积 ≈4 m²" off={-90} size={40} />
				<text x={x2 + 30} y={top + 60} style={{fontFamily: SANS, fontSize: 42, fontWeight: 900}} fill={B.cyan}>← 车底：空气少约5%</text>
				<Fig x={110} y={60} n="03" t="剖面：车底" />
			</Svg>
		</Paper>
	);
};

/* ---------- K4 · front view: how it rolls ---------- */
const K4: React.FC = () => {
	const cx = 760, cy = 560, w = 520, h = 200;
	return (
		<Paper>
			<Svg>
				<g transform={`rotate(-28 ${cx} ${cy})`}>
					{/* front elevation */}
					<path d={`M ${cx - w / 2} ${cy + h / 2 - 30} C ${cx - w / 2} ${cy - 10}, ${cx - w / 2 + 40} ${cy - h / 2 + 30}, ${cx - 150} ${cy - h / 2 + 10} L ${cx - 110} ${cy - h / 2 - 40} L ${cx + 110} ${cy - h / 2 - 40} L ${cx + 150} ${cy - h / 2 + 10} C ${cx + w / 2 - 40} ${cy - h / 2 + 30}, ${cx + w / 2} ${cy - 10}, ${cx + w / 2} ${cy + h / 2 - 30} L ${cx + w / 2 - 20} ${cy + h / 2} L ${cx - w / 2 + 20} ${cy + h / 2} Z`} fill="rgba(234,243,255,0.05)" stroke={B.ink} strokeWidth={4} />
					<path d={`M ${cx - 105} ${cy - h / 2 - 30} L ${cx + 105} ${cy - h / 2 - 30} L ${cx + 140} ${cy - h / 2 + 8} L ${cx - 140} ${cy - h / 2 + 8} Z`} fill="rgba(127,227,255,0.12)" stroke={B.ink} strokeWidth={3} />
					{[-1, 1].map((sd) => <rect key={sd} x={cx + sd * (w / 2 - 70) - 40} y={cy + h / 2 - 10} width={80} height={90} rx={18} fill={B.paperDk} stroke={B.ink} strokeWidth={4} />)}
					<path d={`M ${cx} ${cy - h} L ${cx} ${cy + h + 40}`} stroke={B.faint} strokeWidth={2} strokeDasharray="22 8 4 8" />
					{/* jets: left side blows down, right side blows up */}
					<circle cx={cx - w / 2 + 30} cy={cy + h / 2} r={12} fill={B.paperDk} stroke={B.force} strokeWidth={3} />
					<circle cx={cx + w / 2 - 30} cy={cy - h / 2 + 40} r={12} fill={B.paperDk} stroke={B.force} strokeWidth={3} />
					{Array.from({length: 4}, (_, i) => <path key={i} d={`M ${cx - w / 2 + 30} ${cy + h / 2 + 14} l ${-26 + i * 18} ${120 + i * 10}`} stroke={B.inkMute} strokeWidth={2.5} strokeDasharray="10 8" />)}
					{Array.from({length: 4}, (_, i) => <path key={i} d={`M ${cx + w / 2 - 30} ${cy - h / 2 + 26} l ${-26 + i * 18} ${-120 - i * 10}`} stroke={B.inkMute} strokeWidth={2.5} strokeDasharray="10 8" />)}
					<Vec x={cx - w / 2 + 30} y={cy + h / 2 - 20} dx={0} dy={-150} w={10} />
					<Vec x={cx + w / 2 - 30} y={cy - h / 2 + 60} dx={0} dy={150} w={10} />
				</g>
				{/* rotation arrow */}
				<path d={`M ${cx - 60} ${cy - 420} A 420 420 0 0 1 ${cx + 410} ${cy - 90}`} fill="none" stroke={B.amber} strokeWidth={8} />
				<path d={`M ${cx + 384} ${cy - 96} l 54 -6 l -18 52 Z`} fill={B.amber} />
				<text x={cx + 360} y={cy - 360} style={{fontFamily: SANS, fontSize: 56, fontWeight: 900}} fill={B.amber}>翻身</text>
				<text x={1300} y={650} style={{fontFamily: SANS, fontSize: 46, fontWeight: 800}} fill={B.ink}>左边往下喷 → 左边被推上去</text>
				<text x={1300} y={720} style={{fontFamily: SANS, fontSize: 46, fontWeight: 800}} fill={B.ink}>右边往上喷 → 右边被压下来</text>
				<Fig x={110} y={110} n="04" t="正视图：怎么翻身" />
			</Svg>
		</Paper>
	);
};

/* ---------- K5 · the title block = the reality check ---------- */
const K5: React.FC = () => {
	const rows: [string, string, string?][] = [['型号', 'Rocket（会“飞”的版本）'], ['座位', '1'], ['购买', '仅邀请'], ['能否上路', '不能', 'x'], ['飞多高 / 飞多久', '未公布', 'x'], ['最便宜版本定金', '5万美元'], ['量产', '2028年']];
	const x = 820, y = 170, w = 980, rh = 84;
	return (
		<Paper>
			<Svg>
				<g transform={`translate(420 640) scale(0.52) translate(-510 -292)`}><LineCar sw={5} parts={0.5} nozzles={1} /></g>
				<rect x={x} y={y} width={w} height={rh * (rows.length + 1)} fill="rgba(8,42,102,0.85)" stroke={B.ink} strokeWidth={4} />
				<rect x={x} y={y} width={w} height={rh} fill="rgba(234,243,255,0.08)" />
				<text x={x + 30} y={y + 56} style={{fontFamily: SANS, fontSize: 44, fontWeight: 900, letterSpacing: '0.1em'}} fill={B.ink}>规格 · 特斯拉 Roadster（2026.10）</text>
				{rows.map(([k, v, f], i) => (
					<g key={i}>
						<line x1={x} y1={y + rh * (i + 1)} x2={x + w} y2={y + rh * (i + 1)} stroke={B.inkMute} strokeWidth={2} />
						<text x={x + 30} y={y + rh * (i + 1) + 56} style={{fontFamily: SANS, fontSize: 40, fontWeight: 700}} fill={B.inkMute}>{k}</text>
						<text x={x + 390} y={y + rh * (i + 1) + 56} style={{fontFamily: SANS, fontSize: 44, fontWeight: 900}} fill={f ? B.stamp : B.ink}>{v}</text>
					</g>
				))}
				<line x1={x + 360} y1={y + rh} x2={x + 360} y2={y + rh * (rows.length + 1)} stroke={B.inkMute} strokeWidth={2} />
				<g transform={`translate(${x + 760} ${y + rh * 7 + 30}) rotate(-12)`}>
					<rect x={-150} y={-62} width={300} height={110} rx={12} fill="none" stroke={B.stamp} strokeWidth={7} />
					<text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 60, fontWeight: 900}} fill={B.stamp}>还早</text>
				</g>
				<Fig x={110} y={110} n="05" t="规格表" />
			</Svg>
		</Paper>
	);
};

/* ---------- K6 · pull back: the whole sheet ---------- */
const K6: React.FC = () => (
	<Paper>
		<AbsoluteFill style={{transform: 'scale(0.5)', transformOrigin: '50% 50%'}}>
			<div style={{position: 'absolute', left: -960, top: -540, width: W, height: H}}><K1 /></div>
			<div style={{position: 'absolute', left: 960, top: -540, width: W, height: H}}><K2 /></div>
			<div style={{position: 'absolute', left: 2880, top: -540, width: W, height: H}}><K3 /></div>
			<div style={{position: 'absolute', left: -960, top: 540, width: W, height: H}}><K4 /></div>
			<div style={{position: 'absolute', left: 960, top: 540, width: W, height: H}}><K5 /></div>
			<div style={{position: 'absolute', left: 2880, top: 540, width: W, height: H}}><K1 /></div>
		</AbsoluteFill>
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{background: 'rgba(8,42,102,0.88)', border: `4px solid ${B.ink}`, padding: '30px 70px', fontFamily: SANS, fontWeight: 900, fontSize: 100, color: B.ink}}>托住它的，是<span style={{color: B.cyan}}>空气</span></div>
		</div>
	</Paper>
);

const FR: {el: React.FC; sub: string}[] = [
	{el: K1, sub: '它开上了天花板，还没掉下来'},
	{el: K2, sub: '拆开看，只有两样东西'},
	{el: K3, sub: '车底只要比外面少[约5%]的空气'},
	{el: K4, sub: '一边往下喷，一边往上喷，车就翻身'},
	{el: K5, sub: '会“飞”的那款，不能上路'},
	{el: K6, sub: ''},
];
export const Blue27: React.FC = () => {
	const f = useCurrentFrame();
	const k = FR[Math.min(f, FR.length - 1)];
	const El = k.el;
	return (
		<AbsoluteFill>
			<El />
			<Sub t={k.sub} />
			<Mark />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="BLUE27" component={Blue27} durationInFrames={FR.length} fps={30} width={W} height={H} />;
registerRoot(Root);

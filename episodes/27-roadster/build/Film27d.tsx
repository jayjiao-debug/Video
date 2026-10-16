import React from 'react';
import {AbsoluteFill, Composition, Easing, interpolate, registerRoot, Sequence, useCurrentFrame} from 'remotion';
import {W, H, SANS, Sub, rng} from './kit27';
import {B, Paper, LineCar, Dim, Vec, Call, Fig} from './bluekit';
import {EndCard} from '../brand/Brand';
import {JUNO} from '../brand/identity';
import LINES from './lines27d.json';

/* ep27 v4 · "蓝图". One big engineering sheet, one camera. Panels:
   P1 FIG.01 demo ① (the curved ramp: up the wall, upside down at the top, off the lip, barrel roll, land)
   P2 FIG.02 exploded view · P3 FIG.03 section through the floor · P4 FIG.04 demo ② (jump over five vehicles)
   P5 FIG.05 Tesla's numbers · P6 FIG.06 spec title block. Music: owner's track, story to 82.25, end card to 89.86. */
export const FPS = 30, FILM_END = 89.86, END_AT = 82.25;
const EZ = {io: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.7, 0, 0.84, 0), lin: (x: number) => x, cam: Easing.bezier(0.45, 0, 0.25, 1)};
const r = (t: number, a: number, b: number, e = EZ.io) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (p: number, a: number, b: number) => a + (b - a) * p;
const pop = (t: number, a: number, d = 0.35) => r(t, a, a + d, Easing.bezier(0.2, 1.5, 0.4, 1));
const pw = (t: number, pts: [number, number][]) => interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const subAt = (t: number) => { for (const [s, e, x] of LINES as [number, number, string][]) if (t >= s && t < e) return x; return ''; };
/** stroke that draws itself: p 0 → 1 */
const Draw: React.FC<{d: string; p: number; sw?: number; col?: string; dash?: string; fill?: string; o?: number}> = ({d, p, sw = 3, col = B.ink, dash, fill = 'none', o = 1}) => p <= 0 ? null : (
	dash ? <path d={d} fill={fill} stroke={col} strokeWidth={sw} strokeDasharray={dash} opacity={o * Math.min(1, p * 3)} style={{clipPath: undefined}} />
		: <path d={d} fill={fill} stroke={col} strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={o} strokeLinejoin="round" strokeLinecap="round" />
);
const Txt: React.FC<{x: number; y: number; s?: number; w?: number; col?: string; a?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode}> = ({x, y, s = 44, w = 800, col = B.ink, a = 'start', o = 1, children}) => (
	<text x={x} y={y} textAnchor={a} opacity={o} style={{fontFamily: SANS, fontSize: s, fontWeight: w}} fill={col}>{children}</text>
);
/** blueprint jets: dashed streamlines fanning out of a nozzle, flowing */
const Jet: React.FC<{x: number; y: number; a: number; L: number; t: number; o?: number}> = ({x, y, a, L, t, o = 1}) => o <= 0.01 ? null : (
	<g transform={`translate(${x} ${y}) rotate(${a})`} opacity={o}>
		<path d={`M 0 0 L ${L} ${-L * 0.28} L ${L} ${L * 0.28} Z`} fill={B.cyan} opacity={0.12} />
		{[-0.22, -0.1, 0, 0.1, 0.22].map((k, i) => <path key={i} d={`M 6 0 Q ${L * 0.5} ${k * L * 0.5} ${L} ${k * L}`} fill="none" stroke={i === 2 ? '#ffffff' : B.cyan} strokeWidth={i === 2 ? 4 : 2.5} strokeDasharray="18 12" strokeDashoffset={-t * 240 - i * 7} strokeLinecap="round" />)}
	</g>
);

/* ---------------- sheet layout ---------------- */
const PANEL = (i: number) => ({x: (i % 3) * 2000, y: Math.floor(i / 3) * 1200});
const PanelFrame: React.FC<{i: number; n: string; title: string; p: number}> = ({i, n, title, p}) => {
	const {x, y} = PANEL(i);
	return (
		<g transform={`translate(${x} ${y})`}>
			<Draw d={`M 30 30 L 1890 30 L 1890 1050 L 30 1050 Z`} p={p} sw={3} col={B.inkMute} />
			<Draw d={`M 46 46 L 1874 46 L 1874 1034 L 46 1034 Z`} p={p} sw={1.5} col={B.faint} />
			<g opacity={r(p, 0.3, 0.8)}><Fig x={90} y={110} n={n} t={title} /></g>
		</g>
	);
};

/* ---------------- P1: the ramp (panel coords) ---------------- */
const R1 = {cx: 1150, cy: 600, r: 400, band: 50, ground: 1000, lipDeg: -125};
const S1 = 0.4, HALF1 = (292 - 170) * S1, WB1 = 285 * S1, SAG1 = R1.r - Math.sqrt(R1.r * R1.r - WB1 * WB1);
const arcPt = (deg: number, rr: number) => ({x: R1.cx + rr * Math.cos((deg * Math.PI) / 180), y: R1.cy + rr * Math.sin((deg * Math.PI) / 180)});
type St = {x: number; y: number; rot: number; fx: number; fy: number; spin: number; jets: number; roll: number; land: number};
const onArc = (deg: number): St => {
	const p = arcPt(deg, R1.r - SAG1), rot = deg - 90, a = (rot * Math.PI) / 180;
	return {x: p.x + Math.sin(a) * HALF1, y: p.y - Math.cos(a) * HALF1, rot, fx: 1, fy: 1, spin: 0, jets: 0, roll: 0, land: 0};
};
const car1 = (t: number): St => {
	if (t < 31.42) {
		const deg = t < 2.6 ? mix(r(t, 0, 2.6, Easing.bezier(0.3, 0.25, 0.6, 1)), 38, -90) : t < 5.13 ? mix(r(t, 2.6, 5.13, EZ.out), -90, -108) : t < 28.8 ? -108 : mix(r(t, 28.8, 31.42, Easing.bezier(0.5, 0, 0.9, 0.9)), -108, R1.lipDeg);
		return {...onArc(deg), spin: t * 500};
	}
	if (t < 43.0) { // off the lip: push away, slow-motion barrel roll, brake, land
		const u = pw(t, [[31.42, 0], [33.0, 0.22], [39.6, 0.7], [41.42, 1], [43.0, 1]]);
		const s0 = onArc(R1.lipDeg);
		const landX = 300, y1 = R1.ground - HALF1;
		const roll = r(t, 35.76, 38.6, EZ.io);
		const x = t < 41.42 ? mix(u, s0.x, landX) : mix(r(t, 41.42, 43.0, EZ.out), landX, 170);
		const y = t < 41.42 ? s0.y + (y1 - s0.y) * u * u : y1;
		return {x, y, rot: t < 41.42 ? -35 * (1 - r(u, 0, 0.3)) : 0, fx: -1, fy: -Math.cos(Math.PI * roll), spin: 900 + t * 200,
			jets: Math.max(1 - r(t, 31.6, 32.4), r(t, 40.0, 40.4) * (1 - r(t, 41.3, 41.7))), roll: r(t, 35.5, 35.9) * (1 - r(t, 38.6, 39.0)), land: r(t, 41.3, 41.6)};
	}
	return {x: 170, y: R1.ground - HALF1, rot: 0, fx: -1, fy: 1, spin: 0, jets: 0, roll: 0, land: 1};
};
const carPt = (c: St, s: number, lx: number, ly: number) => {
	const a = (c.rot * Math.PI) / 180, px = (lx - 510) * s * c.fx, py = (ly - 170) * s * c.fy;
	return {x: c.x + px * Math.cos(a) - py * Math.sin(a), y: c.y + px * Math.sin(a) + py * Math.cos(a)};
};
const CarAt: React.FC<{c: St; s: number; parts?: number; nozzles?: number}> = ({c, s, parts = 0.35, nozzles = 0}) => (
	<g transform={`translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${s * c.fx} ${s * c.fy}) translate(-510 -170)`}><LineCar sw={4 / s * 0.45} parts={parts} nozzles={nozzles} /></g>
);

const P1: React.FC<{t: number}> = ({t}) => {
	const dr = r(t, 0, 1.4, EZ.out), c = car1(t);
	const band = R1.r + R1.band, lip = arcPt(R1.lipDeg, R1.r), lipO = arcPt(R1.lipDeg, band);
	const inner = `M 60 ${R1.ground} L ${R1.cx} ${R1.ground} A ${R1.r} ${R1.r} 0 1 0 ${lip.x} ${lip.y}`;
	const outer = `M 60 ${R1.ground + R1.band} L ${R1.cx} ${R1.ground + R1.band} A ${band} ${band} 0 1 0 ${lipO.x} ${lipO.y}`;
	const hatch: React.ReactNode[] = [];
	for (let d = 90; d >= R1.lipDeg; d -= 5) { const a = arcPt(d, R1.r), b = arcPt(d - 4, band); hatch.push(<line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={B.inkMute} strokeWidth={1.5} />); }
	const grav = pop(t, 5.13, 0.4) * (1 - r(t, 9.8, 10.4));
	const gp = carPt(c, S1, 510, 100);
	const detail = r(t, 35.2, 35.8, EZ.out) * (1 - r(t, 39.4, 40.0));
	return (
		<g>
			{/* construction */}
			<g opacity={dr * 0.9}>
				<circle cx={R1.cx} cy={R1.cy} r={R1.r} fill="none" stroke={B.faint} strokeWidth={1.5} strokeDasharray="14 8" />
				<path d={`M ${R1.cx - 520} ${R1.cy} L ${R1.cx + 560} ${R1.cy} M ${R1.cx} ${R1.cy - 520} L ${R1.cx} ${R1.cy + 470}`} stroke={B.faint} strokeWidth={1.5} strokeDasharray="22 8 4 8" />
				<line x1={R1.cx} y1={R1.cy} x2={arcPt(-30, R1.r).x} y2={arcPt(-30, R1.r).y} stroke={B.inkMute} strokeWidth={2} />
				<Txt x={R1.cx + 150} y={R1.cy - 120} s={36} col={B.inkMute}>R</Txt>
			</g>
			<g opacity={r(t, 0.6, 1.4)}>{hatch}</g>
			<Draw d={inner} p={dr} sw={5} />
			<Draw d={outer} p={dr} sw={3} />
			<Draw d={`M ${lip.x} ${lip.y} L ${lipO.x} ${lipO.y}`} p={r(t, 1.0, 1.4)} sw={5} />
			{/* support legs */}
			{[20, -10, -40].map((d, i) => { const p = arcPt(d, band); return <Draw key={i} d={`M ${p.x} ${p.y} L ${p.x + 60} ${R1.ground + R1.band}`} p={r(t, 0.8 + i * 0.15, 1.6 + i * 0.15)} sw={3} col={B.inkMute} />; })}
			<Draw d={`M 60 ${R1.ground + R1.band + 30} L 1860 ${R1.ground + R1.band + 30}`} p={dr} sw={2} col={B.inkMute} dash="30 10" />
			{/* where it's been */}
			{t < 31.4 && <path d={`M ${arcPt(38, R1.r - 26).x} ${arcPt(38, R1.r - 26).y} A ${R1.r - 26} ${R1.r - 26} 0 0 0 ${arcPt(Math.max(-108, mix(r(t, 0, 2.6), 38, -90)), R1.r - 26).x} ${arcPt(Math.max(-108, mix(r(t, 0, 2.6), 38, -90)), R1.r - 26).y}`} fill="none" stroke={B.cyan} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={0.9} />}
			{/* flight path once airborne */}
			{t > 31.4 && t < 46 && (() => {
				const s0 = onArc(R1.lipDeg), y1 = R1.ground - HALF1;
				const pts = Array.from({length: 24}, (_, i) => { const u = i / 23; return `${mix(u, s0.x, 300)},${s0.y + (y1 - s0.y) * u * u}`; }).join(' ');
				return <polyline points={pts} fill="none" stroke={B.amber} strokeWidth={3.5} strokeDasharray="6 16" strokeLinecap="round" opacity={0.85 * r(t, 31.5, 32.2)} />;
			})()}
			{/* jets */}
			{c.jets > 0.02 && Math.abs(c.fy) > 0.4 && [118, 330, 690, 905].map((lx, i) => { const q = carPt(c, S1, lx, 232); return <Jet key={i} x={q.x} y={q.y} a={(c.fy > 0 ? 90 : -90) + c.rot} L={150} t={t + i * 0.1} o={c.jets} />; })}
			{c.roll > 0.02 && (() => { const a1 = carPt(c, S1, 300, 232), a2 = carPt(c, S1, 700, 60); return <><Jet x={a1.x} y={a1.y} a={c.fy > 0 ? 90 : -90} L={140} t={t} o={c.roll} /><Jet x={a2.x} y={a2.y} a={c.fy > 0 ? -90 : 90} L={140} t={t + 0.3} o={c.roll} /></>; })()}
			<CarAt c={c} s={S1} nozzles={t > 31 ? 1 : 0} />
			{/* gravity */}
			{grav > 0.01 && <g opacity={Math.min(1, grav)}><Vec x={gp.x} y={gp.y + 40} dx={0} dy={160 * Math.min(1, grav)} w={10} col={B.force} /><Txt x={gp.x + 40} y={gp.y + 190} s={44} w={900} col={B.force}>重力</Txt></g>}
			{/* DETAIL A: front view of the roll, in a bubble beside the car */}
			{detail > 0.01 && (() => {
				const bx = c.x + 430, by = c.y - 120, rr = 230 * detail;
				const ang = Math.PI * r(t, 35.76, 38.6, EZ.io); // 0 → 180°
				return (
					<g opacity={detail}>
						<line x1={c.x + 60} y1={c.y} x2={bx - rr} y2={by} stroke={B.ink} strokeWidth={2} />
						<circle cx={bx} cy={by} r={rr} fill={B.paperDk} stroke={B.ink} strokeWidth={3} />
						<g transform={`translate(${bx} ${by}) rotate(${180 + (ang * 180) / Math.PI}) scale(${detail})`}>
							<path d="M -150 50 C -150 0, -130 -30, -80 -40 L -60 -80 L 60 -80 L 80 -40 C 130 -30, 150 0, 150 50 L 140 66 L -140 66 Z" fill="rgba(234,243,255,0.06)" stroke={B.ink} strokeWidth={4} />
							<rect x={-150} y={60} width={50} height={50} rx={12} fill={B.paperDk} stroke={B.ink} strokeWidth={4} />
							<rect x={100} y={60} width={50} height={50} rx={12} fill={B.paperDk} stroke={B.ink} strokeWidth={4} />
							{t > 35.8 && t < 38.6 && <><Jet x={-130} y={66} a={90} L={90} t={t} /><Jet x={130} y={-40} a={-90} L={90} t={t + 0.2} /></>}
						</g>
						<path d={`M ${bx - 150} ${by - 190} A 240 240 0 0 1 ${bx + 150} ${by - 190}`} fill="none" stroke={B.amber} strokeWidth={6} opacity={detail} />
						<path d={`M ${bx + 150} ${by - 190} l -2 44 l 38 -30 Z`} fill={B.amber} />
						<Txt x={bx} y={by + rr + 56} s={42} w={900} a="middle" col={B.amber}>正面看：翻身</Txt>
					</g>
				);
			})()}
		</g>
	);
};

/* ---------------- P2: exploded ---------------- */
const P2: React.FC<{t: number}> = ({t}) => {
	const s = 1.15, x0 = 960 - 510 * s, y0 = 640 - 292 * s;
	const T = (lx: number, ly: number) => ({x: x0 + lx * s, y: y0 + ly * s});
	const lift = 170 * r(t, 10.56, 11.2, Easing.bezier(0.2, 1.3, 0.4, 1));
	const fan = T(510, 217), tank = T(720, 181);
	const c1 = pop(t, 13.17, 0.4), c2 = pop(t, 14.48, 0.4);
	return (
		<g>
			{[60, 300, 640, 960].map((lx) => { const a = T(lx, 230), b = T(lx, 230 - 150); return <line key={lx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={B.faint} strokeWidth={2} strokeDasharray="8 8" opacity={r(t, 10.8, 11.2)} />; })}
			<g transform={`translate(${x0} ${y0}) scale(${s})`}><LineCar sw={3.5} parts={mix(r(t, 10.56, 11.0), 0.35, 1)} fan={r(t, 13.17, 13.6)} tanks={r(t, 14.48, 14.9)} lift={lift} ghost={r(t, 10.8, 11.4) * 0.4} /></g>
			{c1 > 0.01 && <g opacity={Math.min(1, c1)}><Call n="1" x={fan.x} y={fan.y + 10} tx={fan.x - 330} ty={fan.y + 210} label="风扇" col={B.cyan} /></g>}
			{c2 > 0.01 && <g opacity={Math.min(1, c2)}><Call n="2" x={tank.x} y={tank.y + 8} tx={tank.x + 120} ty={tank.y + 230} label="高压气瓶" col={B.amber} /></g>}
		</g>
	);
};

/* ---------------- P3: section ---------------- */
const P3: React.FC<{t: number}> = ({t}) => {
	const top = 360, floorY = 440, x1 = 300, x2 = 1400;
	const thin = r(t, 15.9, 17.6), push = r(t, 18.39, 19.0, EZ.out), dimP = r(t, 21.0, 21.9), nums = pop(t, 21.6, 0.4), five = pop(t, 24.9, 0.4);
	const R = rng(4), dots: React.ReactNode[] = [];
	for (let i = 0; i < 380; i++) { const x = 140 + R() * 1640, y0 = floorY + 120 + R() * 420, rr = 3 + R() * 3; const y = y0 - ((t * 30 * push) % 40); dots.push(<circle key={i} cx={x} cy={y} r={rr} fill="none" stroke={B.ink} strokeWidth={1.6} opacity={0.5} />); }
	for (let i = 0; i < 46; i++) { const keep = R(), x0 = x1 + 20 + R() * (x2 - x1 - 40), y = top + 10 + R() * (floorY - top - 20); if (keep < thin * 0.85) continue; const x = x0 + ((t * 300 * thin) % 400); if (x > x2) continue; dots.push(<circle key={'g' + i} cx={x} cy={y} r={4} fill="none" stroke={B.cyan} strokeWidth={1.8} />); }
	return (
		<g>
			<rect x={0} y={230} width={1920} height={top - 230} fill="rgba(234,243,255,0.06)" />
			<g>{Array.from({length: 120}, (_, i) => <line key={i} x1={i * 18 - 130} y1={top} x2={i * 18} y2={230} stroke={B.inkMute} strokeWidth={1.4} />)}</g>
			<line x1={0} y1={top} x2={1920} y2={top} stroke={B.ink} strokeWidth={4} />
			<Txt x={1300} y={300} s={36} col={B.ink}>坡道（倒过来的“天花板”）</Txt>
			<rect x={x1} y={floorY} width={x2 - x1} height={44} fill="rgba(234,243,255,0.08)" stroke={B.ink} strokeWidth={4} />
			<Txt x={x1 + 20} y={floorY + 100} s={36} col={B.inkMute}>车底板</Txt>
			{[x1 + 170, x2 - 170].map((wx) => <g key={wx}><circle cx={wx} cy={top + 55} r={55} fill={B.paperDk} stroke={B.ink} strokeWidth={4} /><circle cx={wx} cy={top + 55} r={8} fill={B.ink} /></g>)}
			<rect x={800} y={floorY - 6} width={120} height={56} rx={10} fill={B.paperDk} stroke={B.cyan} strokeWidth={3} />
			<g transform={`rotate(${t * 720} 860 ${floorY + 22})`}><path d={`M 860 ${floorY + 2} L 860 ${floorY + 42} M 840 ${floorY + 22} L 880 ${floorY + 22}`} stroke={B.cyan} strokeWidth={4} /></g>
			{thin > 0.01 && <g opacity={thin}><Vec x={920} y={floorY + 22} dx={560 * thin} dy={0} w={7} col={B.cyan} /><Txt x={1000} y={floorY + 90} s={40} col={B.cyan}>抽出去</Txt></g>}
			{dots}
			{push > 0.01 && <g opacity={push}>{[520, 850, 1180].map((x) => <Vec key={x} x={x} y={900} dx={0} dy={-(900 - floorY - 70) * push} w={12} />)}</g>}
			{nums > 0.01 && <g opacity={Math.min(1, nums)}>
				<Txt x={110} y={680} s={52} w={900} col={B.force}>外面空气往上推</Txt>
				<Txt x={110} y={760} s={64} w={900} col={B.force}>≈40吨</Txt>
				<Vec x={1600} y={floorY + 60} dx={0} dy={120} w={9} col={B.ink} />
				<Txt x={1600} y={floorY + 240} s={44} w={900} a="middle">车重 ≈2吨</Txt>
			</g>}
			{dimP > 0 && <g opacity={Math.min(1, dimP * 2)}><Dim x1={x1} y1={top - 10} x2={x1 + (x2 - x1) * dimP} y2={top - 10} label={dimP > 0.9 ? '车底面积 ≈4 m²' : ''} off={-90} size={40} /></g>}
			{five > 0.01 && <g opacity={Math.min(1, five)}>
				<Txt x={x2 + 30} y={top + 60} s={42} w={900} col={B.cyan}>← 车底：空气少</Txt>
				<g transform={`translate(1500 790) scale(${mix(Math.min(1, five), 1.4, 1)})`}>
					<rect x={-190} y={-110} width={380} height={150} rx={14} fill={B.paperDk} stroke={B.cyan} strokeWidth={4} />
					<Txt x={0} y={10} s={120} w={900} a="middle" col={B.cyan}>约5%</Txt>
				</g>
			</g>}
		</g>
	);
};

/* ---------------- P4: demo ② the jump ---------------- */
const G4 = 900, S4 = 0.2, HALF4 = (292 - 170) * S4;
const car4 = (t: number): St => {
	const u = pw(t, [[45.2, 0], [46.3, 0.3], [48.0, 0.7], [49.09, 1]]);
	if (t < 45.2) return {x: mix(r(t, 44.0, 45.2, EZ.lin), 60, 420), y: G4 - HALF4, rot: 0, fx: 1, fy: 1, spin: t * 900, jets: 0, roll: 0, land: 0};
	if (t < 49.09) return {x: mix(u, 420, 1830), y: G4 - HALF4 - 420 * Math.pow(Math.sin(Math.PI * u), 0.5), rot: -9 * Math.cos(Math.PI * u), fx: 1, fy: Math.cos(2 * Math.PI * r(u, 0.44, 0.6)), spin: t * 900,
		jets: 0.55 + 0.45 * Math.max(1 - r(u, 0, 0.2), r(u, 0.8, 0.95)), roll: 0, land: 0};
	return {x: mix(r(t, 49.09, 50.4, EZ.out), 1830, 1860), y: G4 - HALF4, rot: 0, fx: 1, fy: 1, spin: 0, jets: 0, roll: 0, land: 1};
};
const Vehicles: React.FC<{p: number}> = ({p}) => {
	const shapes = [
		{w: 200, d: 'M 0 -20 C 6 -60, 40 -92, 100 -94 C 160 -92, 194 -60, 200 -20 Z', wh: [40, 160], name: '小型无人车'},
		{w: 300, d: 'M 0 -24 L 6 -70 L 120 -76 L 170 -112 L 250 -108 L 300 -72 L 300 -24 Z', wh: [55, 245], name: '皮卡'},
		{w: 460, d: 'M 0 -26 L 0 -190 L 320 -190 L 320 -46 L 340 -46 L 340 -136 L 420 -140 L 456 -96 L 460 -26 Z', wh: [40, 110, 280, 380, 430], name: '半挂卡车'},
		{w: 260, d: 'M 0 -24 C 4 -58, 30 -72, 70 -78 L 110 -112 L 196 -112 L 236 -76 C 254 -68, 260 -52, 260 -24 Z', wh: [52, 210], name: 'SUV'},
		{w: 260, d: 'M 0 -24 C 4 -50, 30 -60, 70 -64 L 110 -94 L 190 -94 L 230 -64 C 252 -60, 260 -46, 260 -24 Z', wh: [50, 210], name: '轿车'},
	];
	let x = 540 / 0.75;
	return (
		<g transform={`translate(0 ${G4}) scale(0.75) translate(0 ${-G4})`}>
			{shapes.map((sh, i) => {
				const g = (
					<g key={i} transform={`translate(${x} ${G4})`}>
						<Draw d={sh.d} p={r(p, i * 0.12, i * 0.12 + 0.5)} sw={3} fill="rgba(234,243,255,0.04)" />
						{sh.wh.map((w) => <circle key={w} cx={w} cy={-17} r={17} fill={B.paperDk} stroke={B.ink} strokeWidth={3} opacity={r(p, i * 0.12 + 0.3, i * 0.12 + 0.6)} />)}
					</g>
				);
				x += sh.w + 24;
				return g;
			})}
		</g>
	);
};
const P4: React.FC<{t: number}> = ({t}) => {
	const c = car4(t), dp = r(t, 43.6, 44.8, EZ.out);
	const det = pop(t, 46.6, 0.4) * (1 - r(t, 48.6, 49.1));
	return (
		<g>
			<Draw d={`M 40 ${G4} L 1880 ${G4}`} p={dp} sw={4} />
			<g opacity={dp}>{Array.from({length: 92}, (_, i) => <line key={i} x1={40 + i * 20} y1={G4 + 4} x2={40 + i * 20 - 14} y2={G4 + 24} stroke={B.inkMute} strokeWidth={1.5} />)}</g>
			<Vehicles p={dp} />
			<Draw d={'M ' + Array.from({length: 41}, (_, i) => { const u = i / 40; return `${mix(u, 420, 1830)} ${G4 - 20 - 420 * Math.pow(Math.sin(Math.PI * u), 0.5)}`; }).join(' L ')} p={r(t, 45.2, 46.6)} sw={3.5} col={B.amber} dash="6 16" />
			{c.jets > 0.02 && c.fy > 0.4 && [118, 330, 690, 905].map((lx, i) => { const q = carPt(c, S4, lx, 232); return <Jet key={i} x={q.x} y={q.y} a={90 + c.rot} L={80} t={t + i * 0.1} o={c.jets} />; })}
			<CarAt c={c} s={S4} nozzles={1} />
			{det > 0.01 && <g opacity={Math.min(1, det)}>
				{[118, 330, 690, 905].map((lx, i) => { const q = carPt(c, S4, lx, 280); return <Vec key={i} x={q.x} y={q.y + 120} dx={0} dy={-100} w={6} />; })}
				<Txt x={c.x + 150} y={c.y + 20} s={40} w={900} col={B.force}>喷气推力</Txt>
				<Txt x={c.x + 150} y={c.y + 70} s={36} col={B.inkMute}>（特斯拉说：轮胎的4–5倍）</Txt>
			</g>}
		</g>
	);
};

/* ---------------- P5: Tesla's numbers ---------------- */
const P5: React.FC<{t: number}> = ({t}) => {
	const ax = 260, ay = 790, w = 1000, h = 500;
	const p = r(t, 51.8, 52.7, EZ.lin), axes = r(t, 50.6, 51.4);
	const stamp = pop(t, 54.22, 0.3);
	const pts = Array.from({length: 40}, (_, i) => { const u = (i / 39) * p; return `${ax + u * w * 0.8},${ay - Math.pow(u, 0.6) * h}`; }).join(' ');
	return (
		<g>
			<Draw d={`M ${ax} ${ay - h - 60} L ${ax} ${ay} L ${ax + w + 80} ${ay}`} p={axes} sw={4} />
			<Txt x={ax - 30} y={ay - h - 80} s={38} col={B.inkMute}>速度</Txt>
			<Txt x={ax + w + 60} y={ay + 60} s={38} col={B.inkMute}>时间</Txt>
			<g opacity={axes}>
				<line x1={ax} y1={ay - h} x2={ax + w} y2={ay - h} stroke={B.faint} strokeWidth={2} strokeDasharray="12 8" />
				<Txt x={ax + 20} y={ay - h - 16} s={40} w={900}>60 英里/时（≈97 km/h）</Txt>
				<line x1={ax + w * 0.8} y1={ay} x2={ax + w * 0.8} y2={ay - h} stroke={B.faint} strokeWidth={2} strokeDasharray="12 8" />
				<Txt x={ax + w * 0.8} y={ay + 56} s={44} w={900} a="middle" col={B.amber}>&lt; 1 秒</Txt>
			</g>
			{p > 0 && <polyline points={pts} fill="none" stroke={B.cyan} strokeWidth={6} strokeLinecap="round" />}
			{stamp > 0.01 && <g transform={`translate(1500 420) rotate(-10) scale(${mix(Math.min(1, stamp), 1.5, 1)})`} opacity={Math.min(1, stamp * 1.5)}>
				<rect x={-230} y={-90} width={460} height={170} rx={14} fill="none" stroke={B.stamp} strokeWidth={8} />
				<Txt x={0} y={-12} s={56} w={900} a="middle" col={B.stamp}>特斯拉称</Txt>
				<Txt x={0} y={58} s={56} w={900} a="middle" col={B.stamp}>待验证</Txt>
			</g>}
		</g>
	);
};

/* ---------------- P6: spec title block ---------------- */
const ROWS: [string, string, number, boolean?][] = [['型号', 'Rocket（会“飞”的版本）', 56.63], ['飞多高 / 飞多久', '未公布', 59.23, true], ['座位', '1', 61.83], ['购买', '仅邀请', 62.5], ['能否上路', '不能', 64.23, true], ['最便宜版本定金', '5万美元', 65.5], ['量产', '2028年', 66.83]];
const P6: React.FC<{t: number}> = ({t}) => {
	const x = 760, y = 170, w = 1000, rh = 84, frame = r(t, 55.8, 56.6);
	const stamp = pop(t, 66.83, 0.3);
	return (
		<g>
			<g transform={`translate(380 620) scale(0.5) translate(-510 -292)`} opacity={frame}><LineCar sw={6} parts={0.5} nozzles={1} /></g>
			<Draw d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + rh * 8} L ${x} ${y + rh * 8} Z`} p={frame} sw={4} fill={frame > 0.95 ? 'rgba(8,42,102,0.85)' : 'none'} />
			<g opacity={frame}>
				<Txt x={x + 30} y={y + 56} s={44} w={900}>规格 · 特斯拉 Roadster（2026.10）</Txt>
				<line x1={x + 380} y1={y + rh} x2={x + 380} y2={y + rh * 8} stroke={B.inkMute} strokeWidth={2} />
			</g>
			{ROWS.map(([k, v, a, red], i) => {
				const o = pop(t, a, 0.3);
				return (
					<g key={i}>
						<line x1={x} y1={y + rh * (i + 1)} x2={x + w * frame} y2={y + rh * (i + 1)} stroke={B.inkMute} strokeWidth={2} />
						<Txt x={x + 30} y={y + rh * (i + 1) + 56} s={40} w={700} col={B.inkMute} o={frame}>{k}</Txt>
						{o > 0.01 && <Txt x={x + 410} y={y + rh * (i + 1) + 56} s={44} w={900} col={red ? B.stamp : B.ink} o={Math.min(1, o)}>{v}</Txt>}
					</g>
				);
			})}
			{stamp > 0.01 && <g transform={`translate(${x + 800} ${y + rh * 7 + 40}) rotate(-12) scale(${mix(Math.min(1, stamp), 1.6, 1)})`} opacity={Math.min(1, stamp * 1.5)}>
				<rect x={-140} y={-62} width={280} height={110} rx={12} fill="none" stroke={B.stamp} strokeWidth={7} />
				<Txt x={0} y={18} s={60} w={900} a="middle" col={B.stamp}>还早</Txt>
			</g>}
		</g>
	);
};

/* ---------------- camera ---------------- */
const CAM: [number, number, number, number][] = [
	// t, x, y, zoom (sheet coords)
	[0, 1380, 640, 1.45], [2.6, 1150, 320, 1.35], [5.13, 1150, 380, 1.2], [7.4, 960, 540, 1.0], [10.0, 960, 540, 1.0], [10.9, 2960, 540, 1.0], [15.2, 2960, 540, 1.0],
	[16.1, 4960, 540, 1.0], [27.6, 4960, 540, 1.0], [28.8, 1150, 330, 1.3], [31.42, 1020, 330, 1.3], [33.4, 820, 420, 1.15], [35.8, 900, 520, 1.0], [39.4, 820, 560, 1.0], [41.42, 520, 780, 1.15], [43.0, 520, 760, 1.05],
	[44.0, 520, 1960, 1.35], [45.2, 640, 1930, 1.3], [46.8, 1130, 1830, 1.05], [48.4, 1600, 1930, 1.2], [49.6, 1760, 1960, 1.3], [50.6, 2960, 1740, 1.0], [55.6, 2960, 1740, 1.0], [56.4, 4960, 1740, 1.0], [69.4, 4960, 1740, 1.02],
	[73.4, 2960, 1140, 0.32], [82.4, 2960, 1140, 0.3],
];
const camAt = (t: number) => {
	let i = 0;
	while (i < CAM.length - 2 && CAM[i + 1][0] <= t) i++;
	const [t0, x0, y0, z0] = CAM[i], [t1, x1, y1, z1] = CAM[i + 1];
	const p = r(t, t0, t1, EZ.cam);
	// zoom out a touch in the middle of long moves so the travel reads as a move across the sheet
	const far = Math.hypot(x1 - x0, y1 - y0) > 1500 ? Math.sin(Math.PI * p) * 0.35 : 0;
	return {x: mix(p, x0, x1), y: mix(p, y0, y1), z: mix(p, z0, z1) * (1 - far)};
};

export const Film27d: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const cam = camAt(t);
	const panel = (i: number, el: React.ReactNode) => <g transform={`translate(${PANEL(i).x} ${PANEL(i).y})`}>{el}</g>;
	const title = r(t, 7.73, 8.2, Easing.bezier(0.2, 1.4, 0.4, 1)) * (1 - r(t, 9.9, 10.4));
	const finale = pop(t, 77.25, 0.4);
	const mark = r(t, 0.4, 1.0) * (1 - r(t, END_AT - 0.5, END_AT));
	return (
		<AbsoluteFill>
			<Paper>
				<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(${W / 2} ${H / 2}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
						{cam.z < 0.9 && <rect x={-200} y={-200} width={6400} height={2700} fill="none" stroke={B.ink} strokeWidth={6} opacity={1 - r(cam.z, 0.5, 0.9)} />}
						<PanelFrame i={0} n="01" title="演示①：开上天花板" p={r(t, 0, 1.2)} />
						<PanelFrame i={1} n="02" title="拆开：只有两样东西" p={r(t, 9.8, 11.0)} />
						<PanelFrame i={2} n="03" title="剖面：车底" p={r(t, 15.2, 16.4)} />
						<PanelFrame i={3} n="04" title="演示②：跳过五辆车" p={r(t, 43.4, 44.6)} />
						<PanelFrame i={4} n="05" title="特斯拉给的数字" p={r(t, 50.0, 51.2)} />
						<PanelFrame i={5} n="06" title="规格表" p={r(t, 55.6, 56.8)} />
						{panel(0, <P1 t={t} />)}
						{t > 9.5 && panel(1, <P2 t={Math.min(t, 16.5)} />)}
						{t > 15.0 && panel(2, <P3 t={Math.min(t, 28.5)} />)}
						{t > 43.0 && panel(3, <P4 t={Math.min(t, 51)} />)}
						{t > 50.0 && panel(4, <P5 t={Math.min(t, 57)} />)}
						{t > 55.6 && panel(5, <P6 t={t} />)}
					</g>
				</svg>
				{title > 0.01 && (
					<div style={{position: 'absolute', left: 110, bottom: 190, opacity: Math.min(1, title), transform: `scale(${mix(Math.min(1, title), 1.15, 1)})`, transformOrigin: 'left bottom', background: 'rgba(8,42,102,0.9)', border: `4px solid ${B.ink}`, padding: '18px 40px', fontFamily: SANS, fontWeight: 900, color: B.ink}}>
						<div style={{fontSize: 34, letterSpacing: '0.2em', color: B.inkMute, fontWeight: 700}}>问题</div>
						<div style={{fontSize: 104}}>凭什么能开上<span style={{color: B.cyan}}>天花板</span>？</div>
					</div>
				)}
				{finale > 0.01 && t < END_AT + 0.5 && (
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{opacity: Math.min(1, finale), transform: `scale(${mix(Math.min(1, finale), 1.2, 1)})`, background: 'rgba(8,42,102,0.92)', border: `5px solid ${B.ink}`, padding: '30px 80px', fontFamily: SANS, fontWeight: 900, fontSize: 112, color: B.ink}}>托住它的，是<span style={{color: B.cyan}}>空气</span></div>
					</div>
				)}
			</Paper>
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={{id: 'ep27', src: '', title: '凭什么能开上天花板？', kicker: '', tagline: '', taglineEn: '', motif: 'bars', card: [7.73, 10.4], extend: 0, question: '这车要是真卖了，你敢坐吗？', sources: '来源：TechCrunch、Fox Business、Electrek、Benzinga 2026.10；“约”为估算', duration: 0}} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
			{t < END_AT && <Sub t={subAt(t)} />}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#eaf3ff'}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM27D" component={Film27d} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);

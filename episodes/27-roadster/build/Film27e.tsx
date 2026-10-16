import React from 'react';
import {AbsoluteFill, Composition, Easing, interpolate, registerRoot, Sequence, useCurrentFrame} from 'remotion';
import {W, H, SANS, Sub, rng} from './kit27';
import {B, Paper, LineCar, Dim, Vec, Call, Fig} from './bluekit';
import {EndCard} from '../brand/Brand';
import {JUNO} from '../brand/identity';
import LINES from './lines27e.json';

/* ep27 v5 · blueprint sheet, camera travels one way (snake: row 1 left→right, down, row 2 right→left, pull out).
   Row 1: [0] demo ① on the ramp · [1] exploded · [2] section through the hanging car · [3] demo ① cont.: off the lip, roll, land
   Row 2: [7] sheet title · [6] spec table · [5] Tesla's numbers · [4] demo ② the jump.  Music: owner's track; story to 82.25. */
export const FPS = 30, FILM_END = 89.86, END_AT = 82.25;
const EZ = {io: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.7, 0, 0.84, 0), lin: (x: number) => x, cam: Easing.bezier(0.45, 0, 0.25, 1)};
const r = (t: number, a: number, b: number, e = EZ.io) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (p: number, a: number, b: number) => a + (b - a) * p;
const pop = (t: number, a: number, d = 0.35) => r(t, a, a + d, Easing.bezier(0.2, 1.5, 0.4, 1));
const pw = (t: number, pts: [number, number][]) => interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const subAt = (t: number) => { for (const [s, e, x] of LINES as [number, number, string][]) if (t >= s && t < e) return x; return ''; };
const Draw: React.FC<{d: string; p: number; sw?: number; col?: string; dash?: string; fill?: string; o?: number}> = ({d, p, sw = 3, col = B.ink, dash, fill = 'none', o = 1}) => p <= 0 ? null : (
	dash ? <path d={d} fill={fill} stroke={col} strokeWidth={sw} strokeDasharray={dash} opacity={o * Math.min(1, p * 3)} />
		: <path d={d} fill={fill} stroke={col} strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={o} strokeLinejoin="round" strokeLinecap="round" />
);
const Txt: React.FC<{x: number; y: number; s?: number; w?: number; col?: string; a?: 'start' | 'middle' | 'end'; o?: number; bg?: boolean; children: React.ReactNode}> = ({x, y, s = 52, w = 800, col = B.ink, a = 'start', o = 1, bg, children}) => (
	<g opacity={o}>
		{bg && <text x={x} y={y} textAnchor={a} style={{fontFamily: SANS, fontSize: s, fontWeight: w}} stroke={B.paperDk} strokeWidth={s * 0.35} strokeLinejoin="round" fill={B.paperDk}>{children}</text>}
		<text x={x} y={y} textAnchor={a} style={{fontFamily: SANS, fontSize: s, fontWeight: w}} fill={col}>{children}</text>
	</g>
);
const Jet: React.FC<{x: number; y: number; a: number; L: number; t: number; o?: number}> = ({x, y, a, L, t, o = 1}) => o <= 0.01 ? null : (
	<g transform={`translate(${x} ${y}) rotate(${a})`} opacity={o}>
		<path d={`M 0 0 L ${L} ${-L * 0.28} L ${L} ${L * 0.28} Z`} fill={B.cyan} opacity={0.12} />
		{[-0.22, -0.1, 0, 0.1, 0.22].map((k, i) => <path key={i} d={`M 6 0 Q ${L * 0.5} ${k * L * 0.5} ${L} ${k * L}`} fill="none" stroke={i === 2 ? '#ffffff' : B.cyan} strokeWidth={i === 2 ? 4 : 2.5} strokeDasharray="18 12" strokeDashoffset={-t * 240 - i * 7} strokeLinecap="round" />)}
	</g>
);

/* ---------------- sheet ---------------- */
const SLOT = [[0, 0], [2000, 0], [4000, 0], [6000, 0], [6000, 1200], [4000, 1200], [2000, 1200], [0, 1200]];
const PanelFrame: React.FC<{i: number; n: string; title: string; p: number; z: number; cx: number; cy: number}> = ({i, n, title, p, z, cx, cy}) => {
	const [x, y] = SLOT[i];
	const sx = 960 + (x + 80 - cx) * z, sy = 540 + (y + 80 - cy) * z; // where the title would land on screen
	const inView = r(sx, -40, 30, EZ.lin) * r(sy, -40, 20, EZ.lin) * (1 - r(sx + 640 * z, 1890, 1960, EZ.lin));
	return (
		<g transform={`translate(${x} ${y})`}>
			<Draw d="M 30 30 L 1890 30 L 1890 1050 L 30 1050 Z" p={p} sw={3} col={B.inkMute} />
			<Draw d="M 46 46 L 1874 46 L 1874 1034 L 46 1034 Z" p={p} sw={1.5} col={B.faint} />
			{/* the panel title only when the whole panel is in view, so it is never cut by the frame edge */}
			<g opacity={r(p, 0.3, 0.8) * (1 - r(z, 1.02, 1.1)) * inView}><Fig x={90} y={110} n={n} t={title} /></g>
		</g>
	);
};

/* ---------------- the ramp (panels 0 and 3) ---------------- */
const RP = {cx: 1250, cy: 560, r: 400, band: 50, ground: 960, lip: 700};
const CEIL = RP.cy - RP.r; // 160
const S1 = 0.36, HALF1 = (292 - 170) * S1, WB1 = 285 * S1, SAG1 = RP.r - Math.sqrt(RP.r * RP.r - WB1 * WB1);
const PARK = 1000;
type St = {x: number; y: number; rot: number; fx: number; fy: number; jets: number; roll: number};
const arcPt = (deg: number, rr: number) => ({x: RP.cx + rr * Math.cos((deg * Math.PI) / 180), y: RP.cy + rr * Math.sin((deg * Math.PI) / 180)});
const centreOf = (wx: number, wy: number, rot: number) => { const a = (rot * Math.PI) / 180; return {x: wx + Math.sin(a) * HALF1, y: wy - Math.cos(a) * HALF1}; };
const car1 = (t: number): St => {
	const base = {fx: 1, fy: 1, jets: 0, roll: 0};
	if (t < 2.2) { // already on the curve at frame 0: wheel chord inset so both wheels touch and nothing cuts the track
		const deg = mix(r(t, 0, 2.2, Easing.bezier(0.3, 0.25, 0.6, 1)), 38, -90), rot = deg - 90;
		const p = arcPt(deg, RP.r - SAG1 - 5); // 5 px of air so stroke widths never touch the track
		return {...base, ...centreOf(p.x, p.y, rot), rot};
	}
	if (t < 31.42) { // along the flat underside: brake to the middle, wait, then floor it to the lip
		const x = t < 5.13 ? mix(r(t, 2.2, 5.13, EZ.out), RP.cx, PARK) : t < 28.8 ? PARK : mix(r(t, 28.8, 31.42, Easing.bezier(0.5, 0, 0.95, 0.9)), PARK, RP.lip);
		const inset = (SAG1 + 5) * r(x, RP.cx - 120, RP.cx, EZ.lin);
		return {...base, ...centreOf(x, CEIL + inset, 180), rot: 180};
	}
	const landX = 260, y0 = CEIL + HALF1, y1 = RP.ground - HALF1;
	if (t < 41.42) { // off the lip (upside down, facing left), roll in slow motion, brake with the jets, land
		const u = pw(t, [[31.42, 0], [33.0, 0.22], [39.6, 0.7], [41.42, 1]]);
		const roll = r(t, 35.76, 38.6, EZ.io);
		return {x: mix(u, RP.lip, landX), y: y0 + (y1 - y0) * u * u, rot: 0, fx: -1, fy: -Math.cos(Math.PI * roll),
			jets: Math.max(1 - r(t, 31.6, 32.4), r(t, 40.0, 40.4) * (1 - r(t, 41.3, 41.7))), roll: r(t, 35.5, 35.9) * (1 - r(t, 38.6, 39.0))};
	}
	return {x: mix(r(t, 41.42, 43.0, EZ.out), landX, 170), y: y1, rot: 0, fx: -1, fy: 1, jets: 0, roll: 0};
};
const carPt = (c: St, s: number, lx: number, ly: number) => {
	const a = (c.rot * Math.PI) / 180, px = (lx - 510) * s * c.fx, py = (ly - 170) * s * c.fy;
	return {x: c.x + px * Math.cos(a) - py * Math.sin(a), y: c.y + px * Math.sin(a) + py * Math.cos(a)};
};
const CarAt: React.FC<{c: St; s: number; parts?: number; nozzles?: number; sw?: number}> = ({c, s, parts = 0.35, nozzles = 0, sw = 4}) => (
	<g transform={`translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${s * c.fx} ${s * c.fy}) translate(-510 -170)`}><LineCar sw={sw / s} parts={parts} nozzles={nozzles} /></g>
);

const Ramp: React.FC<{t: number; id: string; part: 'demo' | 'launch'}> = ({t, id, part}) => {
	const dr = r(t, 0, 1.4, EZ.out);
	const c = car1(part === 'demo' ? Math.min(t, 28.7) : t);
	const R = RP.r + RP.band, topO = CEIL - RP.band;
	const inner = `M 60 ${RP.ground} L ${RP.cx} ${RP.ground} A ${RP.r} ${RP.r} 0 0 0 ${RP.cx} ${CEIL} L ${RP.lip} ${CEIL}`;
	const outer = `M 60 ${RP.ground + RP.band} L ${RP.cx} ${RP.ground + RP.band} A ${R} ${R} 0 0 0 ${RP.cx} ${topO} L ${RP.lip} ${topO}`;
	const hatch: React.ReactNode[] = [];
	for (let d = 90; d >= -90; d -= 6) { const a = arcPt(d, RP.r), b = arcPt(d - 4, R); hatch.push(<line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={B.inkMute} strokeWidth={1.5} />); }
	for (let x = RP.cx - 30; x > RP.lip; x -= 30) hatch.push(<line key={'f' + x} x1={x} y1={CEIL} x2={x + 22} y2={topO} stroke={B.inkMute} strokeWidth={1.5} />);
	const bubble = part === 'launch' ? r(t, 35.2, 35.8, EZ.out) * (1 - r(t, 39.4, 40.0)) : 0;
	const grav = part === 'demo' ? pop(t, 5.13, 0.4) * (1 - r(t, 9.8, 10.4)) : 0;
	const gp = carPt(c, S1, 510, 60);
	return (
		<g>
			<defs><clipPath id={`${id}-below`}><rect x={0} y={CEIL + 2} width={1920} height={1080} /></clipPath></defs>
			<g opacity={dr * 0.9 * (1 - bubble)}>
				<circle cx={RP.cx} cy={RP.cy} r={RP.r} fill="none" stroke={B.faint} strokeWidth={1.5} strokeDasharray="14 8" />
				<path d={`M ${RP.cx - 520} ${RP.cy} L ${RP.cx + 560} ${RP.cy} M ${RP.cx} ${RP.cy - 440} L ${RP.cx} ${RP.cy + 440}`} stroke={B.faint} strokeWidth={1.5} strokeDasharray="22 8 4 8" />
			</g>
			<g opacity={r(t, 0.6, 1.4)}>{hatch}</g>
			<Draw d={inner} p={dr} sw={5} />
			<Draw d={outer} p={dr} sw={3} />
			<Draw d={`M ${RP.lip} ${topO} L ${RP.lip} ${CEIL}`} p={r(t, 1.0, 1.4)} sw={5} />
			{/* the rig: a gantry beam above the overhang, legs under the curve */}
			<Draw d={`M ${RP.lip - 60} 70 L ${RP.cx + 80} 70`} p={r(t, 0.8, 1.6)} sw={3} col={B.inkMute} />
			{[RP.lip + 60, RP.lip + 300].map((x, i) => <Draw key={x} d={`M ${x} 70 L ${x} ${topO}`} p={r(t, 1.0 + i * 0.1, 1.6 + i * 0.1)} sw={3} col={B.inkMute} />)}
			{[40, 10, -20].map((d, i) => { const p = arcPt(d, R); return <Draw key={i} d={`M ${p.x} ${p.y} L ${p.x + 70} ${RP.ground + RP.band}`} p={r(t, 0.8 + i * 0.15, 1.6 + i * 0.15)} sw={3} col={B.inkMute} />; })}
			{/* trail while climbing */}
			{t < 2.6 && <path d={`M ${arcPt(38, RP.r - 24).x} ${arcPt(38, RP.r - 24).y} A ${RP.r - 24} ${RP.r - 24} 0 0 0 ${arcPt(mix(r(t, 0, 2.2), 38, -90), RP.r - 24).x} ${arcPt(mix(r(t, 0, 2.2), 38, -90), RP.r - 24).y}`} fill="none" stroke={B.cyan} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" />}
			{/* flight path once airborne */}
			{part === 'launch' && t > 31.4 && (() => {
				const y0 = CEIL + HALF1, y1 = RP.ground - HALF1;
				const pts = Array.from({length: 24}, (_, i) => { const u = i / 23; return `${mix(u, RP.lip, 260)},${y0 + (y1 - y0) * u * u}`; }).join(' ');
				return <polyline points={pts} fill="none" stroke={B.amber} strokeWidth={3.5} strokeDasharray="6 16" strokeLinecap="round" opacity={0.85 * r(t, 31.5, 32.2)} />;
			})()}
			{/* jets, cut where they meet the track */}
			<g clipPath={`url(#${id}-below)`}>
				{c.jets > 0.02 && Math.abs(c.fy) > 0.4 && [118, 330, 690, 905].map((lx, i) => { const q = carPt(c, S1, lx, 232); return <Jet key={i} x={q.x} y={q.y} a={(c.fy > 0 ? 90 : -90) + c.rot} L={130} t={t + i * 0.1} o={c.jets} />; })}
				{c.roll > 0.02 && (() => { const a1 = carPt(c, S1, 300, 232), a2 = carPt(c, S1, 700, 60); return <><Jet x={a1.x} y={a1.y} a={c.fy > 0 ? 90 : -90} L={120} t={t} o={c.roll} /><Jet x={a2.x} y={a2.y} a={c.fy > 0 ? -90 : 90} L={120} t={t + 0.3} o={c.roll} /></>; })()}
			</g>
			<CarAt c={c} s={S1} nozzles={part === 'launch' && t > 31 ? 1 : 0} />
			{grav > 0.01 && <g opacity={Math.min(1, grav)}><Vec x={gp.x} y={gp.y + 30} dx={0} dy={170 * Math.min(1, grav)} w={11} col={B.force} /><Txt x={gp.x + 40} y={gp.y + 190} s={56} w={900} col={B.force}>重力</Txt></g>}
			{/* DETAIL A: the roll seen from the front, inside the loop */}
			{bubble > 0.01 && (() => {
				const bx = RP.cx, by = RP.cy + 20, rr = 250 * bubble;
				const ang = 180 * r(t, 35.76, 38.6, EZ.io);
				return (
					<g opacity={bubble}>
						<line x1={c.x + 50} y1={c.y} x2={bx - rr} y2={by} stroke={B.ink} strokeWidth={2.5} strokeDasharray="10 8" />
						<circle cx={bx} cy={by} r={rr} fill={B.paperDk} stroke={B.ink} strokeWidth={4} />
						<g transform={`translate(${bx} ${by}) rotate(${180 + ang}) scale(${bubble})`}>
							<path d="M -150 50 C -150 0, -130 -30, -80 -40 L -60 -80 L 60 -80 L 80 -40 C 130 -30, 150 0, 150 50 L 140 66 L -140 66 Z" fill="rgba(234,243,255,0.06)" stroke={B.ink} strokeWidth={4} />
							<path d="M -56 -72 L 56 -72 L 72 -42 L -72 -42 Z" fill="rgba(127,227,255,0.15)" stroke={B.ink} strokeWidth={3} />
							<rect x={-150} y={60} width={50} height={50} rx={12} fill={B.paperDk} stroke={B.ink} strokeWidth={4} />
							<rect x={100} y={60} width={50} height={50} rx={12} fill={B.paperDk} stroke={B.ink} strokeWidth={4} />
							{t > 35.8 && t < 38.6 && <><Jet x={-130} y={66} a={90} L={90} t={t} /><Jet x={130} y={-40} a={-90} L={90} t={t + 0.2} /></>}
						</g>
						<path d={`M ${bx - 170} ${by - 200} A 262 262 0 0 1 ${bx + 170} ${by - 200}`} fill="none" stroke={B.amber} strokeWidth={7} />
						<path d={`M ${bx + 170} ${by - 200} l -4 48 l 42 -32 Z`} fill={B.amber} />
						<Txt x={bx} y={by + rr + 66} s={52} w={900} a="middle" col={B.amber} bg>正面看：翻身</Txt>
					</g>
				);
			})()}
		</g>
	);
};

/* ---------------- [1] exploded ---------------- */
const Exploded: React.FC<{t: number}> = ({t}) => {
	const s = 1.15, x0 = 960 - 510 * s, y0 = 640 - 292 * s;
	const T = (lx: number, ly: number) => ({x: x0 + lx * s, y: y0 + ly * s});
	const lift = 170 * r(t, 10.56, 11.2, Easing.bezier(0.2, 1.3, 0.4, 1));
	const fan = T(510, 217), tank = T(720, 181);
	const c1 = pop(t, 13.17, 0.4), c2 = pop(t, 13.82, 0.4);
	return (
		<g>
			{[60, 300, 640, 960].map((lx) => { const a = T(lx, 230), b = T(lx, 230 - 150); return <line key={lx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={B.faint} strokeWidth={2} strokeDasharray="8 8" opacity={r(t, 10.8, 11.2)} />; })}
			<g transform={`translate(${x0} ${y0}) scale(${s})`}><LineCar sw={3.5} parts={mix(r(t, 10.56, 11.0), 0.35, 1)} fan={r(t, 13.17, 13.6)} tanks={r(t, 13.82, 14.2)} lift={lift} ghost={r(t, 10.8, 11.4) * 0.4} /></g>
			{c1 > 0.01 && <g opacity={Math.min(1, c1)}><Call n="1" x={fan.x} y={fan.y + 10} tx={fan.x - 360} ty={fan.y + 220} label="风扇" col={B.cyan} size={56} /></g>}
			{c2 > 0.01 && <g opacity={Math.min(1, c2)}><Call n="2" x={tank.x} y={tank.y + 8} tx={tank.x + 80} ty={tank.y + 240} label="高压气瓶" col={B.amber} size={56} /></g>}
		</g>
	);
};

/* ---------------- [2] section: the whole car hanging under the track ---------------- */
const Section: React.FC<{t: number}> = ({t}) => {
	const ceil = 300, s = 1.2, cx = 960;
	const floorY = ceil + (292 - 230) * s; // 374
	const half = 470 * s;
	const gap = r(t, 15.79, 16.5), thin = r(t, 16.2, 17.8), push = r(t, 18.39, 19.0, EZ.out), nums = pop(t, 21.0, 0.4), dimP = r(t, 21.6, 22.6), five = pop(t, 24.92, 0.4);
	const roofY = (x: number) => { // where the (upside-down) body ends below, for the push arrows
		const lx = 510 - (x - cx) / s; const pts: [number, number][] = [[30, 150], [230, 112], [440, 62], [642, 112], [930, 168], [996, 210]];
		for (let i = 0; i < pts.length - 1; i++) if (lx >= pts[i][0] && lx <= pts[i + 1][0]) { const k = (lx - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return ceil + (292 - (pts[i][1] + k * (pts[i + 1][1] - pts[i][1]))) * s; }
		return ceil + 200;
	};
	const R = rng(4), dots: React.ReactNode[] = [];
	for (let i = 0; i < 300; i++) {
		const x = 120 + R() * 1680, y0 = 520 + R() * 420, rr = 3 + R() * 3;
		if (Math.abs(x - cx) < half && y0 < roofY(x) + 10) continue;
		const y = y0 - ((t * 30 * push) % 30);
		dots.push(<circle key={i} cx={x} cy={y} r={rr} fill="none" stroke={B.ink} strokeWidth={1.6} opacity={0.5} />);
	}
	for (let i = 0; i < 40; i++) { const keep = R(), x0 = cx - half + 30 + R() * (2 * half - 60), y = ceil + 10 + R() * (floorY - ceil - 20); if (keep < thin * 0.85) continue; const x = x0 + ((t * 260 * thin) % 300); if (x > cx + half - 10) continue; dots.push(<circle key={'g' + i} cx={x} cy={y} r={4.5} fill="none" stroke={B.cyan} strokeWidth={2} />); }
	return (
		<g>
			{/* the track above, sectioned */}
			<rect x={0} y={200} width={1920} height={ceil - 200} fill="rgba(234,243,255,0.06)" />
			<g>{Array.from({length: 120}, (_, i) => <line key={i} x1={i * 18 - 100} y1={ceil} x2={i * 18} y2={200} stroke={B.inkMute} strokeWidth={1.4} />)}</g>
			<line x1={0} y1={ceil} x2={1920} y2={ceil} stroke={B.ink} strokeWidth={4} />
			<Txt x={1840} y={262} s={40} w={900} a="end" bg>坡道顶（车倒挂在下面）</Txt>
			{/* the gap between floor and track */}
			{gap > 0.01 && <rect x={cx - half} y={ceil} width={2 * half * gap} height={floorY - ceil} fill={B.cyan} opacity={0.14} />}
			{/* the car, upside down */}
			<g transform={`translate(${cx} ${ceil}) rotate(180) scale(${s}) translate(-510 -292)`}><LineCar sw={3.4} parts={0.25} /></g>
			{/* fan in the floor, spinning, blowing the gap air out the back */}
			<g transform={`translate(${cx} ${floorY - 4})`}>
				<circle r={30} fill={B.paperDk} stroke={B.cyan} strokeWidth={3} />
				<g transform={`rotate(${t * 900})`}>{[0, 120, 240].map((a) => <path key={a} d="M 0 0 C 8 -10, 18 -22, 4 -26 Z" fill={B.cyan} transform={`rotate(${a})`} />)}</g>
			</g>
			{thin > 0.01 && <g opacity={thin}>
				<Vec x={cx + 40} y={(ceil + floorY) / 2} dx={(half - 10) * thin + 260 * thin} dy={0} w={8} col={B.cyan} />
				<Txt x={cx + half + 60} y={(ceil + floorY) / 2 + 70} s={52} w={900} col={B.cyan} bg>抽出去</Txt>
			</g>}
			{dots}
			{push > 0.01 && <g opacity={push}>{[cx - 380, cx, cx + 380].map((x) => <Vec key={x} x={x} y={960} dx={0} dy={-(960 - roofY(x) - 14) * push} w={13} />)}</g>}
			{nums > 0.01 && <g opacity={Math.min(1, nums)}>
				<Txt x={100} y={700} s={56} w={900} col={B.force} bg>外面的空气往上推</Txt>
				<Txt x={100} y={790} s={72} w={900} col={B.force} bg>≈40吨</Txt>
				<Vec x={1760} y={520} dx={0} dy={130} w={10} col={B.ink} />
				<Txt x={1760} y={730} s={52} w={900} a="middle" bg>车重≈2吨</Txt>
			</g>}
			{dimP > 0.9 && <rect x={cx - 180} y={160} width={360} height={58} rx={8} fill={B.paperDk} />}
			{dimP > 0 && <g opacity={Math.min(1, dimP * 2)}><Dim x1={cx - half} y1={ceil} x2={cx - half + 2 * half * dimP} y2={ceil} label={dimP > 0.9 ? '车底 ≈4 m²' : ''} off={-80} size={44} /></g>}
			{five > 0.01 && <g opacity={Math.min(1, five)}>
				<line x1={cx - half + 40} y1={(ceil + floorY) / 2} x2={300} y2={470} stroke={B.cyan} strokeWidth={3} />
				<g transform={`translate(300 520) scale(${mix(Math.min(1, five), 1.3, 1)})`}>
					<rect x={-210} y={-70} width={420} height={140} rx={14} fill={B.paperDk} stroke={B.cyan} strokeWidth={4} />
					<Txt x={0} y={-12} s={40} w={800} a="middle" col={B.cyan}>缝里的空气少</Txt>
					<Txt x={0} y={52} s={64} w={900} a="middle" col={B.cyan}>约5%</Txt>
				</g>
			</g>}
		</g>
	);
};

/* ---------------- [4] demo ②: the jump ---------------- */
const G4 = 900, S4 = 0.2, HALF4 = (292 - 170) * S4, LINE_K = 0.7, LINE_X = 520, TAKE = 420, LAND = 1750;
const car4 = (t: number): St => {
	const u = pw(t, [[45.2, 0], [46.3, 0.3], [48.0, 0.7], [49.09, 1]]);
	if (t < 45.2) return {x: mix(r(t, 44.0, 45.2, EZ.lin), 80, TAKE), y: G4 - HALF4, rot: 0, fx: 1, fy: 1, jets: 0, roll: 0};
	if (t < 49.09) return {x: mix(u, TAKE, LAND), y: G4 - HALF4 - 420 * Math.pow(Math.sin(Math.PI * u), 0.5), rot: -9 * Math.cos(Math.PI * u), fx: 1, fy: Math.cos(2 * Math.PI * r(u, 0.44, 0.6)),
		jets: 0.55 + 0.45 * Math.max(1 - r(u, 0, 0.2), r(u, 0.8, 0.95)), roll: 0};
	return {x: mix(r(t, 49.09, 50.2, EZ.out), LAND, LAND + 30), y: G4 - HALF4, rot: 0, fx: 1, fy: 1, jets: 0, roll: 0};
};
const Vehicles: React.FC<{p: number}> = ({p}) => {
	const shapes = [
		{w: 200, d: 'M 0 -20 C 6 -60, 40 -92, 100 -94 C 160 -92, 194 -60, 200 -20 Z', wh: [40, 160]},
		{w: 300, d: 'M 0 -24 L 6 -70 L 120 -76 L 170 -112 L 250 -108 L 300 -72 L 300 -24 Z', wh: [55, 245]},
		{w: 460, d: 'M 0 -26 L 0 -190 L 320 -190 L 320 -46 L 340 -46 L 340 -136 L 420 -140 L 456 -96 L 460 -26 Z', wh: [40, 110, 280, 380, 430]},
		{w: 260, d: 'M 0 -24 C 4 -58, 30 -72, 70 -78 L 110 -112 L 196 -112 L 236 -76 C 254 -68, 260 -52, 260 -24 Z', wh: [52, 210]},
		{w: 260, d: 'M 0 -24 C 4 -50, 30 -60, 70 -64 L 110 -94 L 190 -94 L 230 -64 C 252 -60, 260 -46, 260 -24 Z', wh: [50, 210]},
	];
	let x = LINE_X / LINE_K;
	return (
		<g transform={`translate(0 ${G4}) scale(${LINE_K}) translate(0 ${-G4})`}>
			{shapes.map((sh, i) => {
				const g = (
					<g key={i} transform={`translate(${x} ${G4})`}>
						<Draw d={sh.d} p={r(p, i * 0.12, i * 0.12 + 0.5)} sw={3 / LINE_K} fill="rgba(234,243,255,0.04)" />
						{sh.wh.map((w) => <circle key={w} cx={w} cy={-17} r={17} fill={B.paperDk} stroke={B.ink} strokeWidth={3 / LINE_K} opacity={r(p, i * 0.12 + 0.3, i * 0.12 + 0.6)} />)}
					</g>
				);
				x += sh.w + 24;
				return g;
			})}
		</g>
	);
};
const Jump: React.FC<{t: number}> = ({t}) => {
	const c = car4(t), dp = r(t, 41.6, 43.4, EZ.out);
	const det = pop(t, 46.6, 0.4) * (1 - r(t, 48.6, 49.1));
	const arc = 'M ' + Array.from({length: 41}, (_, i) => { const u = i / 40; return `${mix(u, TAKE, LAND)} ${G4 - 20 - 420 * Math.pow(Math.sin(Math.PI * u), 0.5)}`; }).join(' L ');
	return (
		<g>
			<Draw d={`M 60 ${G4} L 1860 ${G4}`} p={dp} sw={4} />
			<g opacity={dp}>{Array.from({length: 90}, (_, i) => <line key={i} x1={60 + i * 20} y1={G4 + 4} x2={60 + i * 20 - 14} y2={G4 + 24} stroke={B.inkMute} strokeWidth={1.5} />)}</g>
			<Vehicles p={dp} />
			<Draw d={arc} p={r(t, 45.2, 46.6)} sw={3.5} col={B.amber} dash="6 16" />
			{c.jets > 0.02 && c.fy > 0.4 && [118, 330, 690, 905].map((lx, i) => { const q = carPt(c, S4, lx, 232); return <Jet key={i} x={q.x} y={q.y} a={90 + c.rot} L={80} t={t + i * 0.1} o={c.jets} />; })}
			<CarAt c={c} s={S4} nozzles={1} sw={3.5} />
			{det > 0.01 && <g opacity={Math.min(1, det)}>
				{[118, 330, 690, 905].map((lx, i) => { const q = carPt(c, S4, lx, 280); return <Vec key={i} x={q.x} y={q.y + 120} dx={0} dy={-100} w={6} />; })}
				<Txt x={c.x + 150} y={c.y + 10} s={52} w={900} col={B.force} bg>喷气推力</Txt>
				<Txt x={c.x + 150} y={c.y + 70} s={40} col={B.ink} bg>特斯拉说：轮胎抓地力的4–5倍</Txt>
			</g>}
		</g>
	);
};

/* ---------------- [5] Tesla's numbers ---------------- */
const Numbers: React.FC<{t: number}> = ({t}) => {
	const ax = 260, ay = 800, w = 1000, h = 500;
	const p = r(t, 51.8, 52.7, EZ.lin), axes = r(t, 50.3, 51.2), stamp = pop(t, 54.22, 0.3);
	const pts = Array.from({length: 40}, (_, i) => { const u = (i / 39) * p; return `${ax + u * w * 0.8},${ay - Math.pow(u, 0.6) * h}`; }).join(' ');
	return (
		<g>
			<Draw d={`M ${ax} ${ay - h - 70} L ${ax} ${ay} L ${ax + w + 80} ${ay}`} p={axes} sw={4} />
			<g opacity={axes}>
				<Txt x={ax - 20} y={ay - h - 90} s={44} col={B.inkMute}>速度</Txt>
				<Txt x={ax + w + 30} y={ay + 64} s={44} col={B.inkMute}>时间</Txt>
				<line x1={ax} y1={ay - h} x2={ax + w} y2={ay - h} stroke={B.inkMute} strokeWidth={2} strokeDasharray="12 8" />
				<Txt x={ax + 24} y={ay - h - 18} s={48} w={900}>60 英里/时（≈97 km/h）</Txt>
				<line x1={ax + w * 0.8} y1={ay} x2={ax + w * 0.8} y2={ay - h} stroke={B.inkMute} strokeWidth={2} strokeDasharray="12 8" />
				<Txt x={ax + w * 0.8} y={ay + 64} s={56} w={900} a="middle" col={B.amber}>不到1秒</Txt>
			</g>
			{p > 0 && <polyline points={pts} fill="none" stroke={B.cyan} strokeWidth={7} strokeLinecap="round" />}
			{stamp > 0.01 && <g transform={`translate(1560 430) rotate(-10) scale(${mix(Math.min(1, stamp), 1.5, 1)})`} opacity={Math.min(1, stamp * 1.5)}>
				<rect x={-240} y={-95} width={480} height={180} rx={14} fill="none" stroke={B.stamp} strokeWidth={8} />
				<Txt x={0} y={-12} s={60} w={900} a="middle" col={B.stamp}>特斯拉称</Txt>
				<Txt x={0} y={62} s={60} w={900} a="middle" col={B.stamp}>待验证</Txt>
			</g>}
		</g>
	);
};

/* ---------------- [6] spec table ---------------- */
const ROWS: [string, string, number, boolean?][] = [['型号', 'Rocket（会“飞”）', 56.63], ['飞多高 / 飞多久', '未公布', 59.23, true], ['座位', '1', 61.83], ['购买', '仅邀请', 62.5], ['能否上路', '不能', 64.23, true], ['最便宜版本定金', '5万美元', 65.5], ['量产', '2028年', 66.83]];
const TX = 760, TY = 170, TW = 1000, RH = 96;
const Spec: React.FC<{t: number}> = ({t}) => {
	const frame = r(t, 55.6, 56.5), stamp = pop(t, 66.83, 0.3);
	let cur = -1; ROWS.forEach(([, , a], i) => { if (t >= a) cur = i; });
	return (
		<g>
			<g transform="translate(380 640) scale(0.5) translate(-510 -292)" opacity={frame}><LineCar sw={6} parts={0.5} nozzles={1} /></g>
			{/* the road sign for 不能上路 */}
			{t > 64.2 && <g transform={`translate(380 860) scale(${mix(pop(t, 64.23, 0.3), 1.4, 1)})`} opacity={Math.min(1, pop(t, 64.23, 0.3))}>
				<circle r={70} fill="none" stroke={B.stamp} strokeWidth={10} /><line x1={-50} y1={50} x2={50} y2={-50} stroke={B.stamp} strokeWidth={10} />
				<Txt x={100} y={18} s={52} w={900} col={B.stamp}>不能上路</Txt>
			</g>}
			<Draw d={`M ${TX} ${TY} L ${TX + TW} ${TY} L ${TX + TW} ${TY + RH * 8} L ${TX} ${TY + RH * 8} Z`} p={frame} sw={4} fill={frame > 0.95 ? 'rgba(8,42,102,0.85)' : 'none'} />
			<g opacity={frame}>
				<Txt x={TX + 30} y={TY + 64} s={48} w={900}>规格 · 特斯拉 Roadster（2026.10）</Txt>
				<line x1={TX + 400} y1={TY + RH} x2={TX + 400} y2={TY + RH * 8} stroke={B.inkMute} strokeWidth={2} />
			</g>
			{cur >= 0 && <rect x={TX + 2} y={TY + RH * (cur + 1) + 2} width={(TW - 4) * r(t, ROWS[cur][2], ROWS[cur][2] + 0.3)} height={RH - 4} fill={B.cyan} opacity={0.12} />}
			{ROWS.map(([k, v, a, red], i) => {
				const o = pop(t, a, 0.3);
				return (
					<g key={i}>
						<line x1={TX} y1={TY + RH * (i + 1)} x2={TX + TW * frame} y2={TY + RH * (i + 1)} stroke={B.inkMute} strokeWidth={2} />
						<Txt x={TX + 30} y={TY + RH * (i + 1) + 64} s={44} w={700} col={B.inkMute} o={frame}>{k}</Txt>
						{o > 0.01 && <Txt x={TX + 430} y={TY + RH * (i + 1) + 64} s={52} w={900} col={red ? B.stamp : B.ink} o={Math.min(1, o)}>{v}</Txt>}
					</g>
				);
			})}
			{stamp > 0.01 && <g transform={`translate(${TX + 820} ${TY + RH * 7 + 46}) rotate(-12) scale(${mix(Math.min(1, stamp), 1.6, 1)})`} opacity={Math.min(1, stamp * 1.5)}>
				<rect x={-140} y={-62} width={280} height={110} rx={12} fill={B.paperDk} stroke={B.stamp} strokeWidth={7} />
				<Txt x={0} y={18} s={64} w={900} a="middle" col={B.stamp}>还早</Txt>
			</g>}
		</g>
	);
};

/* ---------------- [7] the sheet's own title block ---------------- */
const SheetTitle: React.FC<{p: number}> = ({p}) => (
	<g opacity={p}>
		<rect x={360} y={330} width={1200} height={420} fill="none" stroke={B.ink} strokeWidth={6} />
		<line x1={360} y1={460} x2={1560} y2={460} stroke={B.inkMute} strokeWidth={3} />
		<Txt x={400} y={420} s={56} w={700} col={B.inkMute}>图纸 · VIBE知识大赏</Txt>
		<Txt x={960} y={600} s={96} w={900} a="middle">凭什么能开上天花板？</Txt>
		<Txt x={960} y={700} s={48} w={700} a="middle" col={B.inkMute}>特斯拉 Roadster 发布会 · 2026.10.15</Txt>
	</g>
);

/* ---------------- camera ---------------- */
const RowY = (i: number) => 1200 + TY + RH * (i + 1) + RH / 2;
const CAM: [number, number, number, number][] = [
	[0, 1450, 640, 1.3], [2.2, 1250, 380, 1.3], [5.13, 1050, 420, 1.15], [7.4, 960, 540, 1.0], [10.0, 960, 540, 1.0],
	[10.9, 2960, 540, 1.0], [15.5, 2960, 540, 1.0], [16.2, 4960, 540, 1.0], [27.8, 4960, 540, 1.0],
	[28.8, 7000, 420, 1.2], [31.42, 6780, 420, 1.2], [33.4, 6640, 500, 1.05], [35.8, 6900, 560, 0.95], [39.4, 6820, 580, 0.95], [41.42, 6460, 780, 1.12], [42.8, 6700, 980, 0.9],
	[44.0, 6520, 1960, 1.3], [45.2, 6640, 1930, 1.25], [46.8, 7100, 1830, 1.0], [48.4, 7520, 1930, 1.15], [49.6, 7620, 1950, 1.2],
	[50.6, 4960, 1740, 1.0], [55.4, 4960, 1740, 1.0], [56.4, 3060, 1820, 1.0], [68.6, 3050, 1810, 1.04], [69.2, 3100, 1700, 0.95],
	[73.4, 3960, 1140, 0.235], [82.4, 3960, 1140, 0.225],
];
const camAt = (t: number) => {
	let i = 0;
	while (i < CAM.length - 2 && CAM[i + 1][0] <= t) i++;
	const [t0, x0, y0, z0] = CAM[i], [t1, x1, y1, z1] = CAM[i + 1];
	const p = r(t, t0, t1, EZ.cam);
	const far = Math.hypot(x1 - x0, y1 - y0) > 1500 && Math.min(z0, z1) >= 0.9 ? Math.sin(Math.PI * p) * 0.3 : 0;
	return {x: mix(p, x0, x1), y: mix(p, y0, y1), z: mix(p, z0, z1) * (1 - far)};
};

export const Film27e: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const cam = camAt(t);
	const slot = (i: number, el: React.ReactNode) => <g transform={`translate(${SLOT[i][0]} ${SLOT[i][1]})`}>{el}</g>;
	const title = r(t, 7.73, 8.2, Easing.bezier(0.2, 1.4, 0.4, 1)) * (1 - r(t, 9.9, 10.4));
	const finale = pop(t, 77.25, 0.4);
	const mark = r(t, 0.4, 1.0) * (1 - r(t, END_AT - 0.5, END_AT));
	return (
		<AbsoluteFill>
			<Paper>
				<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(${W / 2} ${H / 2}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
						<PanelFrame i={0} n="01" title="演示①：开上天花板" p={r(t, 0, 1.2)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={1} n="02" title="拆开：只有两样东西" p={r(t, 9.8, 11.0)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={2} n="03" title="剖面：倒挂的车" p={r(t, 15.0, 16.2)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={3} n="04" title="演示①：冲出去、翻身、落地" p={r(t, 27.6, 28.8)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={4} n="05" title="演示②：跳过五辆车" p={r(t, 41.6, 43.0)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={5} n="06" title="特斯拉给的数字" p={r(t, 49.8, 51.0)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={6} n="07" title="规格表" p={r(t, 55.2, 56.4)} z={cam.z} cx={cam.x} cy={cam.y} />
						<PanelFrame i={7} n="00" title="" p={r(t, 69.0, 71.0)} z={cam.z} cx={cam.x} cy={cam.y} />
						{(t < 11.5 || t > 69) && slot(0, <Ramp t={t} id="rA" part="demo" />)}
						{t > 9.5 && (t < 17.0 || t > 69) && slot(1, <Exploded t={Math.min(t, 16.5)} />)}
						{t > 15.0 && (t < 29.6 || t > 69) && slot(2, <Section t={Math.min(t, 28.5)} />)}
						{t > 27.0 && (t < 44.5 || t > 69) && slot(3, <Ramp t={t} id="rB" part="launch" />)}
						{t > 41.0 && (t < 51.5 || t > 69) && slot(4, <Jump t={Math.min(t, 51)} />)}
						{t > 49.5 && (t < 57.5 || t > 69) && slot(5, <Numbers t={Math.min(t, 57)} />)}
						{t > 55.0 && slot(6, <Spec t={t} />)}
						{t > 69.0 && slot(7, <SheetTitle p={r(t, 69.5, 71.5)} />)}
					</g>
				</svg>
				{title > 0.01 && (
					<div style={{position: 'absolute', left: 110, bottom: 190, opacity: Math.min(1, title), transform: `scale(${mix(Math.min(1, title), 1.15, 1)})`, transformOrigin: 'left bottom', background: 'rgba(8,42,102,0.92)', border: `4px solid ${B.ink}`, padding: '18px 40px', fontFamily: SANS, fontWeight: 900, color: B.ink}}>
						<div style={{fontSize: 40, letterSpacing: '0.2em', color: B.inkMute, fontWeight: 700}}>问题</div>
						<div style={{fontSize: 104}}>凭什么能开上<span style={{color: B.cyan}}>天花板</span>？</div>
					</div>
				)}
				{finale > 0.01 && t < END_AT + 0.5 && (
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{opacity: Math.min(1, finale), transform: `scale(${mix(Math.min(1, finale), 1.2, 1)})`, background: 'rgba(8,42,102,0.94)', border: `5px solid ${B.ink}`, padding: '30px 80px', fontFamily: SANS, fontWeight: 900, fontSize: 112, color: B.ink}}>托住它的，是<span style={{color: B.cyan}}>空气</span></div>
					</div>
				)}
			</Paper>
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={{id: 'ep27', src: '', title: '凭什么能开上天花板？', kicker: '', tagline: '', taglineEn: '', motif: 'bars', card: [7.73, 10.4], extend: 0, question: '这车要是真卖了，你敢坐吗？', sources: '来源：TechCrunch、Fox Business、Electrek、Benzinga 2026.10；“约”为估算', duration: 0}} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
			{t < END_AT && <Sub t={subAt(t)} />}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#eaf3ff'}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM27E" component={Film27e} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);

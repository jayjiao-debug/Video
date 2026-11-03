import React from 'react';
import {Glow, P, W, H, f1, lerp, rnd, noise1, spline, poly, mix, cl, sm, wrap} from './kit3';
import {Earth, SatView, satPt, routeSlice, ROUTE} from '../qq59/globe59';
import {useFonts59} from '../qq59/skin59';
import {KAI} from './act2_kit';

/* ep59 v3 · act 2 · the two top shots: the drifting floe field (graphic) and the pull-up over the strait (the Earth). */
const GOLD = '#FFC24A';

/* ===================================================== drift =====================================================
   Straight down on the pack: white floes with blue shadow edges in a black-blue sea, all sliding north (up the frame) with the current
   (chevrons in the leads point the same way). A dashed line is the way they meant to go (due west); the gold dotted track is where they
   actually went: it bends further and further north while the two dots plod on. */
const FLOE_CELL = 128;
const floes = (t: number, drift: number) => {
	const out: {d: string; sh: string; hi: string; c: P}[] = [];
	const cols = Math.ceil((W + 600) / FLOE_CELL), rows = Math.ceil((H + 700) / (FLOE_CELL * 0.86));
	for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
		const id = r * 97 + q, cx0 = -300 + q * FLOE_CELL + (r % 2) * FLOE_CELL / 2 + (rnd(id, 1) - 0.5) * 40, cy0 = -350 + r * FLOE_CELL * 0.86 + (rnd(id, 2) - 0.5) * 40;
		if (rnd(id, 3) < 0.22) continue;   // open water here
		const cy = wrap(cy0 - drift * (0.92 + 0.16 * rnd(id, 4)), -350, -350 + rows * FLOE_CELL * 0.86), cx = cx0 + Math.sin(t * 0.4 + id) * 3;
		const sz = FLOE_CELL * (0.26 + 0.42 * Math.pow(rnd(id, 5), 1.6)), n = 5 + Math.floor(rnd(id, 6) * 4), rot = t * 0.05 * (rnd(id, 7) - 0.5) + rnd(id, 8) * 6;
		const pts: P[] = Array.from({length: n}, (_, k) => { const a = rot + k / n * Math.PI * 2, rr = sz * (0.6 + rnd(id * 9 + k, 9) * 0.7); return [cx + Math.cos(a) * rr * (1 + 0.3 * rnd(id, 13)), cy + Math.sin(a) * rr * 0.92] as P; });
		const d = poly(pts), sh = poly(pts.map(([x, y]) => [x + 7, y + 9] as P)), hi = poly(pts.map(([x, y]) => [lerp(x, cx, 0.12) - 3, lerp(y, cy, 0.12) - 4] as P));
		out.push({d, sh, hi, c: [cx, cy]});
	}
	return out;
};
export const DriftShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur}) => {
	useFonts59('北洋流计划路线');
	const e = sm(cl(t / dur)), drift = 60 * t + 30;
	const F = floes(t, drift);
	// the track (Earth frame): due west from the right, bending north as the current takes them
	const x0 = 1560, y0 = 860, x1 = 360;
	const at = (u: number): P => { const x = lerp(x0, x1, u); return [x, y0 - 520 * Math.pow(u, 1.7) + noise1(u * 9, 3) * 10]; };
	const p = lerp(0.12, 0.9, sm((t + 0.1) / (dur - 0.2)));
	const dots: React.ReactNode[] = [];
	for (let i = 0; i <= 120; i++) { const u = i / 120; if (u > p) break; const q = at(u); dots.push(<circle key={i} cx={f1(q[0])} cy={f1(q[1])} r={5.2} fill={GOLD} opacity={0.55 + 0.45 * (u / p)} />); }
	const head = at(p), back = at(Math.max(0, p - 0.035));
	const zoom = lerp(1.1, 1.0, e), rot = lerp(-3, 0, e);
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0, background: '#0a1322'}}>
		<defs>
			<radialGradient id="a2dsea" cx="0.45" cy="0.45" r="0.8"><stop offset="0" stopColor="#173049" /><stop offset="1" stopColor="#081220" /></radialGradient>
			<linearGradient id="a2dfl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f7fb" /><stop offset="1" stopColor="#c6d2e2" /></linearGradient>
			<radialGradient id="a2dhd"><stop offset="0" stopColor="#fff3d0" stopOpacity="1" /><stop offset="0.35" stopColor={GOLD} stopOpacity="0.55" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
		</defs>
		<g transform={`translate(960,540) rotate(${rot.toFixed(2)}) scale(${zoom.toFixed(4)}) translate(-960,-540)`}>
			<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="url(#a2dsea)" />
			{/* the current: chevrons drifting north in the water */}
			<g opacity={0.22} fill="none" stroke="#7fb4e0" strokeWidth={4} strokeLinecap="round">{Array.from({length: 30}, (_, i) => { const x = -200 + rnd(i, 11) * (W + 400), y = wrap(rnd(i, 12) * (H + 400) - drift * 1.6, -200, H + 200);
				return <path key={i} d={`M${f1(x - 16)},${f1(y + 10)} L${f1(x)},${f1(y - 6)} L${f1(x + 16)},${f1(y + 10)}`} />; })}</g>
			<g fill="#0b1626" opacity={0.75}>{F.map((fl, i) => <path key={i} d={fl.sh} />)}</g>
			<g fill="url(#a2dfl)">{F.map((fl, i) => <path key={i} d={fl.d} />)}</g>
			<g fill="#ffffff" opacity={0.55}>{F.map((fl, i) => <path key={i} d={fl.hi} />)}</g>
			{/* the planned line: due west */}
			<path d={`M${x0},${y0} L${x1 - 120},${y0}`} stroke="#0a1322" strokeWidth={10} opacity={0.55} fill="none" />
			<path d={`M${x0},${y0} L${x1 - 120},${y0}`} stroke="#f4ead8" strokeWidth={4} strokeDasharray="16 14" opacity={0.9} fill="none" />
			<path d={`M${x1 - 130},${y0} l26,-15 l0,30 Z`} fill="#f4ead8" opacity={0.85} />
			{/* the real track */}
			<path d={'M' + Array.from({length: 61}, (_, i) => at(p * i / 60)).map((q) => `${f1(q[0])},${f1(q[1])}`).join(' L')} stroke="#0a1322" strokeWidth={14} opacity={0.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<g style={{filter: 'drop-shadow(0 0 6px rgba(255,170,60,0.7))'}}>{dots}</g>
			<circle cx={back[0]} cy={back[1]} r={34} fill="url(#a2dhd)" /><circle cx={back[0]} cy={back[1]} r={8} fill="#f4ead8" stroke="#0a1322" strokeWidth={3} />
			<circle cx={head[0]} cy={head[1]} r={46} fill="url(#a2dhd)" /><circle cx={head[0]} cy={head[1]} r={10} fill={GOLD} stroke="#0a1322" strokeWidth={3} />
		</g>
		{/* north */}
		<g transform="translate(1560,250)" opacity={0.92}>
			<path d="M0,-58 L20,6 L0,-6 L-20,6 Z" fill="#f4ead8" stroke="#0a1322" strokeWidth={3} />
			<text x={0} y={46} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 40}} fill="#f4ead8" stroke="rgba(8,10,16,0.85)" strokeWidth={6} paintOrder="stroke">北</text>
		</g>
		<rect width={W} height={H} fill="url(#a2dvig)" />
		<defs><radialGradient id="a2dvig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient></defs>
	</svg>;
};

/* ===================================================== strait =====================================================
   Rising through the clouds (it draws its own transition: the clouds close over the gold road, then part below us) to the strait from
   high up: the Earth, the white sea ice between two coasts labelled 美洲 and 亚洲 (no borders), and two dots crossing from America to
   Asia on a gold line. */
type LL = [number, number];
const WALES: LL = [-168.09, 65.6], UELEN: LL = [-169.82, 66.16];
/** their line across: a zig-zag (dragged north, then south) from Cape Prince of Wales to Uelen */
const CROSS: LL[] = [WALES, [-168.4, 65.78], [-168.62, 66.02], [-168.95, 66.22], [-169.25, 66.12], [-169.5, 66.05], [-169.7, 66.12], UELEN];
const crossAt = (u: number): LL => { const n = CROSS.length - 1, x = cl(u) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return [lerp(CROSS[i][0], CROSS[i + 1][0], f), lerp(CROSS[i][1], CROSS[i + 1][1], f)]; };
const ICE = (() => { const out: {c: LL; r: number}[] = [];
	for (let la = 58; la <= 73; la += 1.4) for (let lo = -186; lo <= -156; lo += 2.2) { const k = Math.round(la * 10 + lo); out.push({c: [lo + (rnd(k, 1) - 0.5) * 1.6, la + (rnd(k, 2) - 0.5) * 1.0], r: 1.1 + rnd(k, 3) * 0.9}); }
	return out; })();

const Clouds: React.FC<{t: number; cover: number; tint: string}> = ({t, cover, tint}) => {
	if (cover <= 0.001) return null;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		<defs><radialGradient id="a2cl"><stop offset="0" stopColor={tint} stopOpacity="1" /><stop offset="0.6" stopColor={tint} stopOpacity="0.75" /><stop offset="1" stopColor={tint} stopOpacity="0" /></radialGradient></defs>
		<rect width={W} height={H} fill={tint} opacity={cl(cover * 1.25 - 0.25)} />
		{Array.from({length: 26}, (_, i) => { const y = wrap(rnd(i, 1) * 2200 + (t + 1) * 1500 * (0.8 + rnd(i, 2) * 0.5), -500, 1700), x = rnd(i, 3) * (W + 400) - 200, r = 380 + rnd(i, 4) * 520;
			return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="url(#a2cl)" opacity={cover} />; })}
	</svg>; };

export const StraitShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur}) => {
	useFonts59('美洲亚洲白令海峡');
	const u = cl(t / dur), e = sm(u);
	const v: SatView = {lon: lerp(-168.95, -168.6, e), lat: lerp(65.8, 65.15, e), alt: lerp(0.022, 0.15, Math.pow(e, 0.8)), tilt: lerp(18, 6, e), roll: lerp(3, 0, e), cy: 600};
	const p = sm((t - 0.15) / (dur - 0.55));
	const path = Array.from({length: 41}, (_, i) => crossAt(p * i / 40));
	const pts = path.map((ll) => satPt(v, ll)).filter((q): q is [number, number] => !!q);
	const head = satPt(v, crossAt(p)), back = satPt(v, crossAt(Math.max(0, p - 0.06)));
	const am = satPt(v, [-163.4, 65.2]), as = satPt(v, [-173.6, 65.7]);
	const cover = t < 0 ? sm((t + 0.43) / 0.36) : 1 - sm(t / 0.5);
	const lab = sm((t - 0.35) / 0.35);
	const label = (q: [number, number] | null, s: string) => q && <text x={cl(q[0], 240, 1560)} y={cl(q[1], 470, 900)} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 54, letterSpacing: '0.12em'}} fill="#FFF4E2" stroke="rgba(8,10,16,0.8)" strokeWidth={8} paintOrder="stroke" opacity={lab}>{s}</text>;
	const before = routeSlice(ROUTE.key.bering - 0.025, ROUTE.key.bering).map((ll) => satPt(v, ll)).filter((q): q is [number, number] => !!q);
	return <>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, background: '#060912', opacity: t < -0.05 ? 0 : 1}}>
			<defs><radialGradient id="a2shd"><stop offset="0" stopColor="#fff3d0" stopOpacity="1" /><stop offset="0.35" stopColor={GOLD} stopOpacity="0.55" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient></defs>
			<Earth id="a2st" v={v} ice={ICE} clouds={0.6} />
			{before.length > 1 && <path d={'M' + before.map((q) => `${f1(q[0])},${f1(q[1])}`).join(' L')} stroke={GOLD} strokeWidth={5} fill="none" opacity={0.85} strokeLinecap="round" />}
			{pts.length > 1 && <g><path d={'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join(' L')} stroke="#ffa62e" strokeOpacity={0.3} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d={'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join(' L')} stroke={GOLD} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 12" /></g>}
			{back && <g><circle cx={back[0]} cy={back[1]} r={30} fill="url(#a2shd)" /><circle cx={back[0]} cy={back[1]} r={8} fill="#f4ead8" stroke="#0a1322" strokeWidth={3} /></g>}
			{head && <g><circle cx={head[0]} cy={head[1]} r={44} fill="url(#a2shd)" /><circle cx={head[0]} cy={head[1]} r={10} fill={GOLD} stroke="#0a1322" strokeWidth={3} /></g>}
			{label(am, '美洲')}{label(as, '亚洲')}
			<rect width={W} height={H} fill="url(#a2svig)" />
			<defs><radialGradient id="a2svig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient></defs>
		</svg>
		<Clouds t={t} cover={cover} tint="#f3e2cf" />
	</>;
};
void Glow; void spline; void mix; void H;

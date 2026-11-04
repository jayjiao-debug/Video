import React from 'react';
import {Stage, Layer, FPath, Shape, FigureSlot, karlTravel, CastShadow, Particles, Mist, FogBand, FogFoot, Glow, SkyGrad, Sun, INF, Cam, useFog, useGround, useProject,
	P, W, H, f1, lerp, rnd, noise1, fbm, ridge, spline, taper, poly, mix, cl, sm, GOLD} from './kit3';
import {tuftD, bareTreeD, CloudBands, moundD, forestD, iceBlockPts, camelD} from './props3';
import {Camel as RigCamel, CAMEL_STRIDE, KARL_CYCLE, Cart} from './karl3';

/* ep59 v3 · act 3 · land sets, part 1: the Siberian frozen river (winter road on the ice), the Gobi caravan at sunset,
   the closed border gate at dusk, the empty pandemic road to the sea. Built from kit3 primitives in the sets3 family. */

/* ===================================== SIBERIA · a frozen river, the winter road on the ice ===================================== */
const RV = {focus: 4, hz: 560, K: 1200, vp: [560, 560] as P, sun: [1190, 290] as P};
const rgY = (D: number) => RV.hz + RV.K / D;
const RiverSky: React.FC = () => <>
	<SkyGrad y0={0} y1={RV.hz + 10} stops={[[0, '#56607a'], [0.25, '#8a92a8'], [0.55, '#c4c5cc'], [0.85, '#e6e0d6'], [1, '#efe8dd']]} />
	<Sun x={RV.sun[0]} y={RV.sun[1]} r={26} c="#fff0d8" core="#fffbf2" bloom={7} bloomO={0.75} halo={215} dogs pillar={320} />
</>;
/** the river ice: a cold gradient, sastrugi (wind-carved snow streaks), patches of clear blue ice with cracks, the winter-road ruts */
const RiverIce: React.FC<{t: number}> = () => {
	const g = useGround(RV.hz, RV.K), streaks: string[] = [], glare: string[] = [], cracks: string[] = [], ruts: string[] = [];
	for (let i = 0; i < 150; i++) { const D = 1.6 * Math.pow(40 / 1.6, rnd(i, 3)), y = rgY(D), x = -400 + rnd(i, 4) * (W + 800), L = 4000 / D * (0.4 + rnd(i, 5)), th = 50 / D * (0.4 + rnd(i, 6));
		streaks.push(spline(([[x - L / 2, y], [x - L * 0.1, y - th], [x + L / 2, y + th * 0.2], [x, y + th * 0.5]] as P[]).map(g), true)); }
	for (let i = 0; i < 9; i++) { const D = 2.2 * Math.pow(9, rnd(i, 13)), y = rgY(D), x = -200 + rnd(i, 14) * (W + 400), L = 2200 / D * (0.6 + rnd(i, 15)), th = 160 / D * (0.5 + rnd(i, 16));
		const pts: P[] = Array.from({length: 10}, (_, k) => { const a = k / 10 * Math.PI * 2; return [x + Math.cos(a) * L / 2 * (0.75 + 0.5 * rnd(k, i + 20)), y + Math.sin(a) * th * (0.75 + 0.5 * rnd(k, i + 21))] as P; });
		glare.push(spline(pts.map(g), true));
		for (let c = 0; c < 4; c++) { const a: P = [x + (rnd(c, i + 30) - 0.5) * L * 0.8, y + (rnd(c, i + 31) - 0.5) * th]; const b: P = [a[0] + (rnd(c, i + 32) - 0.5) * L * 0.5, a[1] + (rnd(c, i + 33) - 0.5) * th * 1.6];
			cracks.push(taper(([a, [(a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2], b] as P[]).map(g), 2.2, 0.3)); } }
	// the winter road: two pairs of ruts running along the river at depths 6 … 7.4
	for (const D of [6.0, 6.5, 7.0, 7.5]) { const y = rgY(D); for (let x = -600; x < W + 600; x += 300) ruts.push(poly(([[x, y - 1], [x + 290, y - 1.6], [x + 290, y + 1.2], [x, y + 1.6]] as P[]).map(g))); }
	return <g>
		<defs><linearGradient id="rvice" gradientUnits="userSpaceOnUse" x1="0" y1={RV.hz} x2="0" y2={H}><stop offset="0" stopColor="#e6e3df" /><stop offset="0.25" stopColor="#d5d7de" /><stop offset="1" stopColor="#b3bccc" /></linearGradient></defs>
		<rect x={-600} y={RV.hz} width={W + 1200} height={H} fill="url(#rvice)" />
		<Glow x={RV.sun[0]} y={rgY(9)} r={700} ry={70} c="#fff6e8" o={0.6} />
		<Shape d={glare.join(' ')} fill="#8f9fb8" o={0.55} />
		<Shape d={cracks.join(' ')} fill="#f4f7fb" o={0.7} />
		<Shape d={streaks.join(' ')} fill="#f7f6f3" o={0.75} />
		<Shape d={ruts.join(' ')} fill="#98a2b6" o={0.45} />
	</g>; };
/** the marker sticks (small firs stuck in the snow) that mark the ice road, at depth D */
const Markers: React.FC<{D: number; x0: number; step: number; seed: number}> = ({D, x0, step, seed}) => {
	const fog = useFog(), y = rgY(D), s = RV.focus / D, d: string[] = [];
	for (let x = x0, i = 0; x < W + 1400; x += step * s, i++) { const hh = 130 * s * (0.8 + 0.4 * rnd(i, seed)), xx = x + (rnd(i, seed + 1) - 0.5) * 30 * s;
		d.push(taper([[xx, y + 2], [xx + 2 * s, y - hh]], 5 * s, 2 * s));
		for (let k = 0; k < 4; k++) { const yy = y - hh * (0.45 + k * 0.14); d.push(taper([[xx, yy], [xx - 18 * s * (1 - k * 0.2), yy + 10 * s]], 4 * s, 1), taper([[xx, yy], [xx + 18 * s * (1 - k * 0.2), yy + 10 * s]], 4 * s, 1)); } }
	return <Shape d={d.join(' ')} fill={fog('#2d3330')} />; };
const Birch: React.FC<{x: number; D: number; seed: number; hgt?: number}> = ({x, D, seed, hgt = 2400}) => {
	const fog = useFog(), y = rgY(D), s = RV.focus / D, h = hgt * s, tree = bareTreeD(x, y + 4, h, seed, {w: 36 * s, spread: 26, depth: 4, droop: 14, lean: (rnd(seed, 2) - 0.5) * 6});
	const marks = Array.from({length: 12}, (_, i) => { const yy = y - h * (0.05 + i * 0.05) - rnd(i, seed) * 20 * s, ww = 36 * s * (0.4 + rnd(i, seed + 1) * 0.6); return `M${f1(x - ww / 2)},${f1(yy)} L${f1(x + ww * 0.2)},${f1(yy - 3 * s)} L${f1(x + ww * 0.1)},${f1(yy + 4 * s)} Z`; }).join(' ');
	return <g><Shape d={tree.slice(1).join(' ')} fill={fog('#3a363c')} /><path d={tree[0]} fill={fog('#efece6')} /><path d={marks} fill={fog('#2a272c')} /></g>; };

export const FrozenRiver: React.FC<{t: number; cam: Cam; kx: number; kh: number}> = ({t, cam, kx, kh}) => {
	const tr = karlTravel('pushCart', t, kh), ph = tr.phase;
	return <Stage t={t} cam={cam} atm={{haze: '#d8d9de', density: 0.05, focus: RV.focus, aperture: 1.3, rim: '#fff0d6', lightDir: 30, grain: 0.06, vignette: 0.45, pp: RV.vp}} bg="#9aa0ae">
		<Layer D={INF}><RiverSky /></Layer>
		<Layer D={70}><FPath d={ridge(-400, W + 400, (x) => -(RV.hz - 14 - Math.abs(fbm(x, 380, 26, 7, 3)) - (x > 380 && x < 760 ? -8 : 10)), RV.hz + 6, 12)} c="#7d8798" /></Layer>
		<Layer D={45}><FPath d={forestD(-400, 380, rgY(45), 70, 12, 3, rgY(45) + 4) + ' ' + forestD(800, W + 400, rgY(45), 80, 12, 4, rgY(45) + 4)} c="#6a7486" /></Layer>
		<Layer D={INF}><RiverIce t={t} /></Layer>
		<Layer D={22}><FPath d={forestD(-400, 420, rgY(22), 190, 20, 5, rgY(22) + 3)} c="#3a4252" /><FogFoot y0={rgY(22) - 90} y1={rgY(22)} o={0.6} /></Layer>
		<Layer D={14}><FPath d={forestD(720, 1000, rgY(14), 200, 28, 6, rgY(14) + 3) + ' ' + forestD(1000, W + 500, rgY(14), 300, 30, 7, rgY(14) + 3)} c="#262c38" />
			<FPath d={spline([[640, rgY(14) + 4], [800, rgY(14) - 14], [1300, rgY(14) - 20], [2400, rgY(14) - 24], [2400, rgY(14) + 10], [640, rgY(14) + 8]], true)} c="#f2f0ec" />
			<FogFoot y0={rgY(14) - 130} y1={rgY(14) + 2} o={0.5} /></Layer>
		{[[1260, 12.5, 3], [1520, 12, 9], [1840, 12.8, 15]].map(([x, D, sd], i) => <Layer key={'bi' + i} D={D}><Birch x={x} D={D} seed={sd} /></Layer>)}
		<Layer D={11}><Mist n={7} seed={4} y0={RV.hz + 20} y1={RV.hz + 90} t={t} speed={9} o={0.6} c="#f2efea" w={[600, 1500]} h={[40, 100]} /></Layer>
		<Layer D={8.2}><Markers D={8.2} x0={-300} step={520} seed={3} /></Layer>
		<Layer D={7.4}><FPath d={[0, 1, 2].map((k) => poly(iceBlockPts(1500 + k * 120, rgY(7.4) + 4, 140 - k * 30, 70 - k * 14, 40 + k))).join(' ')} c="#c9d2de" />
			<FPath d={poly(iceBlockPts(240, rgY(7.4) + 4, 110, 50, 51))} c="#cfd6e0" /></Layer>
		<Layer D={5.6}><Markers D={5.6} x0={-120} step={560} seed={8} /></Layer>
		<Layer D={6}><Mist n={5} seed={9} y0={rgY(6) - 60} y1={rgY(6) + 10} t={t} speed={14} o={0.42} c="#f6f3ee" w={[700, 1500]} h={[50, 110]} /></Layer>
		<FigureSlot x={kx + tr.dx} y={rgY(RV.focus)} h={kh} attire="siberia" action="pushCart" phase={ph} facing={1} rim="#fff0d6" lightDir={30} rimO={0.9} breath shadow={{k: 0.12, skew: -1.1, o: 0.25, c: '#6f7890', blur: 3}} />
		<Particles kind="diamond" n={80} seed={31} D={[1.2, 9]} box={[400, 0, 1900, 900]} c="#fff8ea" o={1} size={1.1} />
		<Particles kind="snow" n={60} seed={32} D={[0.8, 10]} c="#ffffff" o={0.5} wind={40} size={0.7} />
		<Layer D={2.6}><Mist n={3} seed={12} y0={rgY(2.6) - 40} y1={rgY(2.6) + 40} t={t} speed={18} o={0.3} c="#f6f4f0" w={[900, 1600]} h={[60, 140]} /></Layer>
		<Layer D={1.5}><FPath d={spline([[-400, 1300], [-400, 1010], [300, 990], [900, 1040], [1500, 1010], [2400, 1000], [2400, 1300]], true)} c="#eceae7" />
			<FPath d={tuftD(120, 1020, 22, 120, 260, 4, 8) + ' ' + tuftD(1560, 1030, 16, 100, 220, 6, -10) + ' ' + tuftD(900, 1060, 12, 80, 160, 9, 4)} c="#5b5148" /></Layer>
		<Layer D={0.9} blur={8}><Shape d={taper([[-30, 1300], [10, 600], [40, -100]], 110, 80)} fill="#e9e6e1" /><Shape d={[0, 1, 2, 3, 4, 5].map((i) => { const y = 1000 - i * 190 - rnd(i, 2) * 60; return `M${-30},${f1(y)} L${f1(60 + rnd(i, 3) * 20)},${f1(y - 8)} L${f1(55 + rnd(i, 4) * 10)},${f1(y + 10)} Z`; }).join(' ')} fill="#2a272c" /></Layer>
	</Stage>;
};

/* ===================================== GOBI · the caravan at sunset ===================================== */
const GB = {focus: 4, hz: 640, K: 460, sun: [1560, 604] as P};
const ggY = (D: number) => GB.hz + GB.K / D;
const GobiSky: React.FC<{t: number}> = ({t}) => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#1d1434'], [0.16, '#3d1c46'], [0.32, '#802c48'], [0.45, '#c95539'], [0.53, '#ee8c43'], [0.575, '#ffc676'], [0.592, '#ffe0a0'], [0.594, '#f0a464'], [1, '#6a2f3e']]} />
	<CloudBands id="gcb3" t={t} top="#371a42" mid="#7a2f4e" under="#c4544a" warm="#ffb66a" warmFrom={3}
		bands={[[96, 34, 3, 0.45], [196, 40, 7, 0.6], [300, 26, 11, 0.6], [398, 16, 15, 0.65], [466, 10, 19, 0.7], [520, 6, 23, 0.7]]} />
	<Sun x={GB.sun[0]} y={GB.sun[1]} r={46} c="#ffc05e" core="#fff3d0" bloom={9} bloomO={0.9} />
</>;
const Dunes: React.FC<{x0?: number; x1?: number; y: number; amp: number; wl: number; seed: number; shade: string; lit: string; extra?: number}> = ({x0 = -600, x1 = W + 900, y, amp, wl, seed, shade, lit, extra = 0}) => {
	const fog = useFog(), out: React.ReactNode[] = [];
	for (let x = x0, i = 0; x < x1; i++) { const w = wl * (0.7 + rnd(i, seed) * 0.8), hh = amp * (0.45 + rnd(i, seed + 1) * 0.55), sx = x + w * (0.35 + rnd(i, seed + 2) * 0.3);
		const m = moundD(x, sx, y - hh, x + w, y + rnd(i, seed + 3) * amp * 0.1, 1, 0.25 + rnd(i, seed + 4) * 0.2);
		out.push(<g key={i}><path d={m.body} fill={fog(shade, extra)} /><path d={m.lit} fill={fog(lit, extra)} /><path d={m.crest} fill={fog('#fff0c8', extra)} opacity={0.6} /></g>);
		x += w * (0.45 + rnd(i, seed + 5) * 0.3); }
	return <g>{out}</g>; };
const BigDune: React.FC<{lx: number; sx: number; sy: number; rx: number; by: number; shade: string; lit: string; bend?: number; ext?: number; id: string}> = ({lx, sx, sy, rx, by, shade, lit, bend = 0.35, ext = 900, id}) => {
	const fog = useFog(), m = moundD(lx, sx, sy, rx, by, 1, bend, ext);
	return <g><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={sy} x2="0" y2={Math.min(by, sy + 400)}><stop offset="0" stopColor={fog(mix(lit, '#fff0c0', 0.35))} /><stop offset="1" stopColor={fog(mix(lit, shade, 0.35))} /></linearGradient></defs>
		<path d={m.body} fill={fog(shade)} /><path d={m.lit} fill={`url(#${id})`} /><path d={m.crest} fill={fog('#ffe2a6')} opacity={0.8} /></g>; };
const Ripples: React.FC<{n: number; seed: number; y0: number; y1: number; x0?: number; x1?: number; c: string; o?: number}> = ({n, seed, y0, y1, x0 = -600, x1 = W + 900, c, o = 0.35}) => {
	const g = useGround(GB.hz, GB.K), out: string[] = [];
	for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i, seed), 1.4), y = lerp(y0, y1, u), x = lerp(x0, x1, rnd(i, seed + 1)), d = y - GB.hz, L = d * (0.8 + rnd(i, seed + 2) * 1.6), th = d * 0.02;
		out.push(spline(([[x - L / 2, y], [x, y - th], [x + L / 2, y + th * 0.3], [x, y + th * 0.4]] as P[]).map(g), true)); }
	return <Shape d={out.join(' ')} fill={c} o={o} />; };
const Saxaul: React.FC<{t: number}> = ({t}) => {
	const br = bareTreeD(1960, 1180, 380, 5, {w: 20, spread: 40, depth: 4, droop: -6, lean: -34}).concat(bareTreeD(1840, 1230, 280, 9, {w: 14, spread: 44, depth: 3, lean: 10}));
	return <g transform={`rotate(${(Math.sin(t * 0.8) * 0.8).toFixed(2)} 1800 1180)`}><Shape d={br.join(' ')} fill="#1a0e14" />
		<path d={tuftD(80, 1120, 30, 200, 280, 3, 10)} fill="#24121a" /></g>; };

/** the nose ropes: each camel's nose peg to the tail of the one ahead (they span depths: projected per frame) */
const Ropes: React.FC<{items: {D: number; x: number}[]; kh: number; D0: number}> = ({items, kh, D0}) => {
	const pr = useProject(), d: string[] = [];
	for (let k = 1; k < items.length; k++) { const a = items[k], b = items[k - 1], sa = D0 / a.D, sb = D0 / b.D;
		const n = pr(a.D, [a.x + 1.36 * kh * sa, ggY(a.D) - 1.1 * kh * sa]).p, tl = pr(b.D, [b.x - 0.6 * kh * sb, ggY(b.D) - 0.98 * kh * sb]).p;
		if (n[0] > tl[0] - 4) continue;
		d.push(`M${f1(n[0])},${f1(n[1])} Q${f1((n[0] + tl[0]) / 2)},${f1(Math.max(n[1], tl[1]) + 14 * sa)} ${f1(tl[0])},${f1(tl[1])}`); }
	return <path d={d.join(' ')} stroke="#2a1812" strokeWidth={1.6} fill="none" opacity={0.85} />; };
/** the caravan: Karl leads (his own lead camel), the string of camels follows on a line curving back into depth. The camera tracks at
    his pace, so every camel (each in its own depth layer, walking at its own depth's screen speed) holds its place in frame and the
    desert slides by — parallax does the rest. */
export const GobiCaravan: React.FC<{t: number; cam: Cam; kx: number; kh: number}> = ({t, cam, kx, kh}) => {
	const D0 = GB.focus, tr = karlTravel('leadCamel', t, kh), ph = tr.phase, cph = ph * KARL_CYCLE.leadCamel.stride / CAMEL_STRIDE;
	// the string: depth and rest-screen x (at t = 0) of each following camel; each one's nose just behind the tail of the one ahead
	const string: {D: number; x: number}[] = [];
	let prevX = kx - 1.86 * kh;
	for (let k = 1; k <= 7; k++) { const D1 = D0 * Math.pow(1.28, k), s1 = D0 / D1, x = prevX - 1.45 * kh * s1; string.push({D: D1, x}); prevX = x; }
	const shadow = (D: number) => ({k: 0.26, skew: 3.0, o: 0.65 * (0.6 + 0.4 * D0 / D), c: '#4a1d38', blur: 0.8});
	return <Stage t={t} cam={cam} atm={{haze: '#ec9a62', density: 0.03, focus: D0, aperture: 1.6, rim: '#ffcf7a', lightDir: 12, grain: 0.06, vignette: 0.55, pp: [GB.sun[0], GB.hz]}} bg="#2a1630">
		<Layer D={INF}><GobiSky t={t} /></Layer>
		<Layer D={60}><FPath d={ridge(-600, W + 900, (x) => -(GB.hz - 30 - Math.abs(fbm(x, 420, 70, 3, 4, 0.55)) - (x < 1000 ? 26 : 0)), GB.hz + 8, 10)} c="#5e2c55" /></Layer>
		<Layer D={28}><Dunes y={ggY(28) + 6} amp={26} wl={300} seed={5} shade="#80384f" lit="#f4a25c" /></Layer>
		<Layer D={16}><Dunes y={ggY(16) + 10} amp={50} wl={460} seed={9} shade="#6a2c47" lit="#f39a52" /><FogFoot y0={ggY(16) - 70} y1={ggY(16) + 10} o={0.35} c="#ffcf8f" /></Layer>
		<Layer D={INF}>
			<defs><linearGradient id="gsad3" gradientUnits="userSpaceOnUse" x1="0" y1={ggY(14)} x2="0" y2={ggY(3)}><stop offset="0" stopColor="#ffc982" /><stop offset="0.5" stopColor="#f0a35f" /><stop offset="1" stopColor="#c87452" /></linearGradient></defs>
			<path d={`M-600,${f1(ggY(14))} L${W + 900},${f1(ggY(14))} L${W + 900},${H + 300} L-600,${H + 300} Z`} fill="url(#gsad3)" />
			<Glow x={GB.sun[0] - 300} y={ggY(8)} r={1100} ry={70} c="#fff0c0" o={0.55} />
			<Ripples n={220} seed={4} y0={ggY(14) + 4} y1={ggY(2.6)} c="#a2513e" o={0.38} />
		</Layer>
		{string.slice().reverse().map(({D, x: cx}, i) => { const k = string.length - i, s1 = D0 / D, hk = kh * s1, ck = cph + 0.27 * k;
			const xx = cx + tr.dx * s1;   // walking at its depth's screen speed (the camera's truck cancels it)
			return <Layer key={'c' + k} D={D}>
				{(() => { const y = ggY(D), c = camelD(xx + 0.2 * hk, y, 1.3 * hk, ck, true); return <g transform={`matrix(1,0,3,-0.26,${f1(-3 * y)},${f1(1.26 * y)})`} opacity={shadow(D).o}><path d={c.far + ' ' + c.body + ' ' + c.pack} fill="#4a1d38" /></g>; })()}
				<RigCamel x={xx} y={ggY(D)} h={hk} phase={ck} walking t={t} rim="#ffcf7a" lightDir={10} rimO={s1 > 0.42 ? 0.9 : 0} />
			</Layer>; })}
		<Ropes items={[{D: D0, x: kx - 1.86 * kh + tr.dx}, ...string.map(({D, x: cx}) => ({D, x: cx + tr.dx * D0 / D}))]} kh={kh} D0={D0} />
		<Layer D={8.5}><BigDune id="gbd1" lx={1500} sx={1800} sy={ggY(8.5) - 50} rx={2700} by={ggY(8.5) + 3} shade="#5a2440" lit="#f6ab62" bend={0.28} ext={4} /></Layer>
		<FigureSlot x={kx + tr.dx} y={ggY(D0)} h={kh} attire="gobi" action="leadCamel" phase={ph} facing={1} rim="#ffcf7a" lightDir={10} rimO={0.95} shadow={{k: 0.26, skew: 3.0, o: 0.7, c: '#4a1d38', blur: 0.8}} />
		<Particles kind="dust" n={70} seed={41} D={[2, 12]} box={[600, 300, 1900, 820]} c="#ffe2a8" o={0.8} size={1} />
		<Particles kind="sand" n={90} seed={42} D={[1.6, 7]} box={[-100, 680, W + 100, 1080]} c="#ffd79a" o={0.45} wind={-300} />
		<Layer D={2.6}><BigDune id="gbd2" lx={-900} sx={-60} sy={ggY(2.6) + 70} rx={1000} by={ggY(2.6) + 330} shade="#4a1d36" lit="#e98b4c" bend={0.5} /></Layer>
		<Layer D={1.9}><BigDune id="gbd3" lx={1100} sx={1760} sy={ggY(1.9) + 60} rx={2900} by={ggY(1.9) + 280} shade="#3d1730" lit="#d98048" bend={0.4} /></Layer>
		<Layer D={1.05} blur={8}><Saxaul t={t} /></Layer>
	</Stage>;
};

/* ===================================== BORDER · the closed gate at dusk ===================================== */
const BD = {focus: 4, hz: 600, K: 1080, vp: [960, 600] as P};
const bgY = (D: number) => BD.hz + BD.K / D;
/** a chain-link fence with barbed-wire coils on top, from x0 to x1 at depth D (posts every `step`) */
const Fence: React.FC<{D: number; x0: number; x1: number; hgt: number; step: number; gap?: [number, number]; col: string}> = ({D, x0, x1, hgt, step, gap, col}) => {
	const fog = useFog(), y = bgY(D), s = BD.focus / D, h = hgt * s, posts: string[] = [], wire: string[] = [];
	for (let x = x0; x <= x1; x += step * s) { if (gap && x > gap[0] && x < gap[1]) continue; posts.push(poly([[x - 5 * s, y + 2], [x + 5 * s, y + 2], [x + 4 * s, y - h], [x - 4 * s, y - h]]), poly([[x - 3 * s, y - h], [x + 2 * s, y - h - 20 * s], [x + 6 * s, y - h - 18 * s], [x + 3 * s, y - h]])); }
	const segs: [number, number][] = gap ? [[x0, gap[0]], [gap[1], x1]] : [[x0, x1]];
	for (const [a, b] of segs) { for (let k = 0; k < 3; k++) wire.push(poly([[a, y - h * (0.05 + k * 0.45) - 1], [b, y - h * (0.05 + k * 0.45) - 1], [b, y - h * (0.05 + k * 0.45) + 1.4 * s], [a, y - h * (0.05 + k * 0.45) + 1.4 * s]]));
		for (let x = a; x < b; x += 26 * s) wire.push(`M${f1(x)},${f1(y - h - 26 * s)} m-${f1(14 * s)},0 a${f1(14 * s)},${f1(12 * s)} 0 1,0 ${f1(28 * s)},0 a${f1(14 * s)},${f1(12 * s)} 0 1,0 -${f1(28 * s)},0 Z m${f1(3 * s)},0 a${f1(11 * s)},${f1(9 * s)} 0 1,1 ${f1(22 * s)},0 a${f1(11 * s)},${f1(9 * s)} 0 1,1 -${f1(22 * s)},0 Z`); }
	const mesh = segs.map(([a, b]) => `M${f1(a)},${f1(y - h)} L${f1(b)},${f1(y - h)} L${f1(b)},${f1(y)} L${f1(a)},${f1(y)} Z`).join(' ');
	return <g><path d={mesh} fill={fog(col)} opacity={0.22} /><Shape d={wire.join(' ')} fill={fog(col)} /><Shape d={posts.join(' ')} fill={fog(col)} /></g>; };

/** a red ✕ that slams on (two brush strokes, each scaling down from big with a small overshoot), u0 = its start time */
export const RedX: React.FC<{t: number; t0: number; x: number; y: number; r: number; o?: number}> = ({t, t0, x, y, r, o = 1}) => {
	const strokes = [0, 1].map((k) => { const u = (t - t0 - k * 0.09) / 0.16; if (u <= 0) return null;
		const sc = u >= 1 ? 1 + 0.06 * Math.exp(-6 * (u - 1)) * Math.cos(9 * (u - 1)) : lerp(1.7, 1, sm(u)), op = cl(u * 2);
		const a = k === 0 ? 45 : -45, L = r * sc, pts: P[] = Array.from({length: 7}, (_, i) => { const v = i / 6 - 0.5; return [v * 2 * L, Math.sin(v * 3 + k) * r * 0.04] as P; });
		return <g key={k} transform={`translate(${f1(x)},${f1(y)}) rotate(${a})`} opacity={op * o}>
			<path d={taper(pts, r * 0.26, r * 0.16)} fill="#1a0606" opacity={0.35} transform="translate(6,8)" />
			<path d={taper(pts, r * 0.24, r * 0.14)} fill="#d8322c" />
			<path d={taper(pts.map(([px, py]) => [px, py - r * 0.05] as P), r * 0.07, r * 0.03)} fill="#ff6a56" opacity={0.6} /></g>; });
	return <g>{strokes}</g>; };

export const BorderGate: React.FC<{t: number; cam: Cam; beat: number}> = ({t, cam, beat}) => {
	const kx = 700, kh = 300, ky = bgY(BD.focus), Dg = 7, gy = bgY(Dg), sg = BD.focus / Dg;
	return <Stage t={t} cam={cam} atm={{haze: '#b7768a', density: 0.045, focus: BD.focus, aperture: 1.2, rim: '#ffb98a', lightDir: 170, grain: 0.06, vignette: 0.6, pp: BD.vp}} bg="#2a1c34">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={BD.hz + 10} stops={[[0, '#1f1838'], [0.35, '#4b2a52'], [0.62, '#9a4a5c'], [0.82, '#e38a62'], [1, '#ffc488']]} />
			<CloudBands id="bdcb" t={t} top="#2a1d40" mid="#5d3456" under="#b25c5c" warm="#ffa86a" warmFrom={2} bands={[[150, 30, 4, 0.5], [270, 22, 8, 0.6], [390, 14, 12, 0.6], [470, 8, 16, 0.65]]} />
			<Glow x={330} y={BD.hz - 10} r={520} ry={160} c="#ffb070" o={0.7} />
		</Layer>
		<Layer D={60}><FPath d={ridge(-400, W + 400, (x) => -(BD.hz - 40 - Math.abs(fbm(x, 300, 120, 11, 4, 0.5)) * (0.6 + 0.4 * Math.sin(x / 700))), BD.hz + 6, 10)} c="#6a3a5a" /></Layer>
		<Layer D={30}><FPath d={ridge(-400, W + 400, (x) => -(BD.hz - 6 - Math.abs(fbm(x, 260, 60, 21, 4, 0.5))), BD.hz + 30, 10)} c="#4a2a46" /></Layer>
		<Layer D={INF}>
			<defs><linearGradient id="bdgr" gradientUnits="userSpaceOnUse" x1="0" y1={BD.hz} x2="0" y2={H}><stop offset="0" stopColor="#8a5a5e" /><stop offset="0.4" stopColor="#5a3a48" /><stop offset="1" stopColor="#2a1c2a" /></linearGradient></defs>
			<rect x={-600} y={BD.hz} width={W + 1200} height={H} fill="url(#bdgr)" />
			<path d={`M${960 - 30},${BD.hz} L${960 + 30},${BD.hz} L${1960},${H + 40} L${-40},${H + 40} Z`} fill="#3a2a38" opacity={0.7} />
			<path d={`M${958},${BD.hz} L${962},${BD.hz} L${990},${H + 40} L${930},${H + 40} Z`} fill="#c9a07a" opacity={0.35} />
		</Layer>
		{/* the watchtower, the floodlight mast and its cone of light (dust in it), the booth with its lit window */}
		<Layer D={14}><FPath d={'M1580,612 L1600,470 L1660,470 L1680,612 Z M1586,470 L1674,470 L1674,430 L1586,430 Z M1576,430 L1684,430 L1630,404 Z M1600,612 L1660,520 L1664,524 L1606,612 Z M1660,612 L1600,520 L1596,524 L1654,612 Z'} c="#2a1a2a" />
			<rect x={1598} y={440} width={64} height={16} fill={GOLD} opacity={0.55} /></Layer>
		<Layer D={Dg}>
			<Fence D={Dg} x0={-500} x1={W + 600} hgt={420} step={260} gap={[800, 1340]} col="#2a1c28" />
			{/* gate pillars and the sliding gate, closed */}
			{(() => { const L = 800, R = 1340, ph = 520 * sg, c = '#251822', g: string[] = [];
				for (let x = L + 30; x < R - 20; x += 34 * sg) g.push(poly([[x, gy - 10], [x + 6 * sg, gy - 10], [x + 6 * sg, gy - 380 * sg], [x, gy - 380 * sg]]));
				g.push(poly([[L, gy - 380 * sg], [R, gy - 380 * sg], [R, gy - 366 * sg], [L, gy - 366 * sg]]), poly([[L, gy - 190 * sg], [R, gy - 190 * sg], [R, gy - 180 * sg], [L, gy - 180 * sg]]), poly([[L, gy - 30 * sg], [R, gy - 30 * sg], [R, gy - 20 * sg], [L, gy - 20 * sg]]));
				return <g><Shape d={g.join(' ')} fill={c} />
					<path d={poly([[L - 40, gy + 4], [L + 10, gy + 4], [L + 10, gy - ph], [L - 40, gy - ph]]) + ' ' + poly([[R - 10, gy + 4], [R + 40, gy + 4], [R + 40, gy - ph], [R - 10, gy - ph]])} fill="#3a2a34" />
					<path d={poly([[L - 46, gy - ph], [L + 16, gy - ph], [L + 16, gy - ph - 16], [L - 46, gy - ph - 16]]) + ' ' + poly([[R - 16, gy - ph], [R + 46, gy - ph], [R + 46, gy - ph - 16], [R - 16, gy - ph - 16]])} fill="#4a3640" />
					{/* a lamp on each pillar */}
					{[L - 15, R + 15].map((x, i) => <g key={i}><Glow x={x} y={gy - ph - 34} r={60} c="#ffd9a0" o={0.8} /><circle cx={x} cy={gy - ph - 34} r={6} fill="#fff4dc" /></g>)}
				</g>; })()}
			{/* the guard booth */}
			<path d={`M1400,${gy} L1400,${gy - 230 * sg} L1560,${gy - 230 * sg} L1560,${gy} Z M1388,${gy - 230 * sg} L1572,${gy - 230 * sg} L1560,${gy - 256 * sg} L1400,${gy - 256 * sg} Z`} fill="#2c1e2a" />
			<rect x={1424} y={gy - 190 * sg} width={110} height={70 * sg} fill={GOLD} opacity={0.85} />
			<Glow x={1479} y={gy - 150 * sg} r={170} ry={110} c="#ffc46a" o={0.35} />
			{/* the boom barrier (white with dark bands), down across the road */}
			{(() => { const p0: P = [1372, gy - 60 * sg], p1: P = [600, gy - 48 * sg], th = 11 * sg, at = (u: number): P => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)];
				return <g><path d={`M1360,${gy} L1360,${gy - 72 * sg} L1386,${gy - 72 * sg} L1386,${gy} Z`} fill="#2c1e2a" />
					<path d={poly([p0, p1, [p1[0], p1[1] + th], [p0[0], p0[1] + th]])} fill="#e8dcd0" />
					{[0.12, 0.32, 0.52, 0.72, 0.9].map((u) => { const a = at(u), b = at(u + 0.08); return <path key={u} d={poly([a, b, [b[0], b[1] + th], [a[0], a[1] + th]])} fill="#3a2a34" />; })}
					<path d={poly([[p1[0] + 4, p1[1] + th], [p1[0] + 10, p1[1] + th], [p1[0] + 10, gy], [p1[0] + 4, gy]])} fill="#2c1e2a" /></g>; })()}
		</Layer>
		<Layer D={11}><FPath d={'M240,700 L252,330 L262,330 L274,700 Z M226,330 L290,330 L290,300 L226,300 Z'} c="#2a1a28" />
			<Glow x={258} y={318} r={70} c="#fff0d0" o={0.9} /><path d="M232,326 L284,326 L520,700 L-20,700 Z" fill="#ffe8c0" opacity={0.08} /></Layer>
		<Layer D={INF}>{(() => { const gr = useGround(BD.hz, BD.K), rocks: string[] = [], tracks: string[] = [];
			for (let i = 0; i < 90; i++) { const D = 3 * Math.pow(9, rnd(i, 71)), y = bgY(D), x = -300 + rnd(i, 72) * (W + 600), r = 60 / D * (0.4 + rnd(i, 73));
				if (Math.abs(x - 960) < 140 * 4 / D) continue; rocks.push(spline(([[x - r, y], [x - r * 0.6, y - r * 0.7], [x + r * 0.3, y - r * 0.8], [x + r, y]] as P[]).map(gr), true)); }
			for (const X of [-70, -30, 30, 70]) tracks.push(spline(Array.from({length: 8}, (_, k) => { const D = 2 * Math.pow(3.5, k / 7); return [960 + X * 4 / D * 2.2 + (X > 0 ? 3 : -3), bgY(D)] as P; }).concat(Array.from({length: 8}, (_, k) => { const D = 2 * Math.pow(3.5, (7 - k) / 7); return [960 + X * 4 / D * 2.2 + (X > 0 ? 3 : -3) + 6 * 4 / D, bgY(D)] as P; })), true));
			return <g><Shape d={tracks.join(' ')} fill="#2a1c26" o={0.4} /><Shape d={rocks.join(' ')} fill="#2c1c2a" o={0.85} />
				<Glow x={1070} y={bgY(7) + 30} r={520} ry={70} c="#ffd0a0" o={0.35} /><Glow x={258} y={bgY(11) + 20} r={300} ry={50} c="#ffe8c8" o={0.3} /></g>; })()}</Layer>
		<Particles kind="dust" n={60} seed={61} D={[3, 12]} box={[0, 300, 1900, 760]} c="#ffd8b0" o={0.7} size={1} />
		<Layer D={BD.focus}><Cart x={kx - 0.75 * kh} y={ky} h={kh} kind="orange" gripY={0.32} rim="#ffb98a" lightDir="left" rimO={0.8} /></Layer>
		<FigureSlot x={kx} y={ky} h={kh} attire="home2026" action="stand" phase={t / 4.2 + 0.3} facing={1} rim="#ffb98a" lightDir={170} rimO={0.9} shadow={{k: 0.12, skew: 1.6, o: 0.45, c: '#120a12', blur: 2}} />
		<Layer D={1.9}><FPath d={spline([[-300, 1300], [-300, 1010], [200, 980], [520, 1030], [700, 1300]], true) + ' ' + spline([[1300, 1300], [1500, 1020], [1800, 990], [2300, 1000], [2300, 1300]], true)} c="#1c1018" />
			<FPath d={tuftD(120, 1000, 18, 150, 260, 4, 10) + ' ' + tuftD(1640, 1000, 14, 120, 220, 7, -6)} c="#1a0e16" /></Layer>
		<g><RedX t={t} t0={beat * 1} x={1070} y={bgY(Dg) - 210 * sg} r={190} /></g>
	</Stage>;
};

/* ===================================== THE EMPTY ROAD to the grey shore (the pandemic) ===================================== */
const RD = {focus: 4, hz: 560, K: 1160, vp: [1240, 560] as P};
const rdY = (D: number) => RD.hz + RD.K / D;
/** a surgical mask hooked on the fence wire by one loop, flapping in the wind */
export const Mask: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => {
	const fl = Math.sin(t * 7.5) * 0.5 + Math.sin(t * 13 + 1) * 0.25, sw = 14 + 10 * fl, a = sw * Math.PI / 180;
	const cx = x + Math.sin(a) * 40 * s, cy = y + Math.cos(a) * 40 * s, w = 70 * s, h = 40 * s, sk = fl * 0.25;
	const body = `M${f1(cx - w / 2)},${f1(cy - h / 2)} Q${f1(cx)},${f1(cy - h / 2 - 6 * s)} ${f1(cx + w / 2)},${f1(cy - h / 2 + sk * h)} L${f1(cx + w / 2 - 3 * s)},${f1(cy + h / 2 + sk * h)} Q${f1(cx)},${f1(cy + h / 2 + 8 * s)} ${f1(cx - w / 2 + 3 * s)},${f1(cy + h / 2)} Z`;
	return <g>
		<path d={`M${f1(x)},${f1(y)} Q${f1((x + cx - w / 2) / 2 - 6 * s)},${f1((y + cy) / 2)} ${f1(cx - w / 2)},${f1(cy - h / 3)}`} stroke="#e9eef2" strokeWidth={2.2 * s} fill="none" />
		<path d={`M${f1(cx + w / 2)},${f1(cy - h / 3 + sk * h)} q${f1(24 * s + fl * 10 * s)},${f1(10 * s)} ${f1(10 * s)},${f1(34 * s)}`} stroke="#e9eef2" strokeWidth={2.2 * s} fill="none" />
		<path d={body} fill="#9cc6dc" />
		{[0.3, 0.52, 0.74].map((k) => <path key={k} d={`M${f1(cx - w / 2 + 2 * s)},${f1(cy - h / 2 + k * h)} L${f1(cx + w / 2 - 2 * s)},${f1(cy - h / 2 + k * h + sk * h)}`} stroke="#6e9cb6" strokeWidth={1.6 * s} />)}
		<path d={body} fill="none" stroke="#e6f2f8" strokeWidth={1.2 * s} opacity={0.7} />
	</g>; };
export const EmptyRoad: React.FC<{t: number; cam: Cam; kx: number; kh: number}> = ({t, cam, kx, kh}) => {
	const ph = karlTravel('pushCart', t, kh).phase, dx = karlTravel('pushCart', t, kh).dx, D0 = RD.focus;
	return <Stage t={t} cam={cam} atm={{haze: '#a9b0b8', density: 0.06, focus: D0, aperture: 1.4, rim: '#f2e6d6', lightDir: 150, grain: 0.065, vignette: 0.5, pp: RD.vp}} bg="#59616c">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={RD.hz + 10} stops={[[0, '#3d4552'], [0.4, '#68717e'], [0.8, '#a3a9b0'], [1, '#c4c4c0']]} />
			<CloudBands id="rdcb" t={t} top="#3a414c" mid="#5c6470" under="#8b929a" warm="#c2bcb2" warmFrom={3} drift={18} bands={[[120, 40, 5, 0.6], [240, 34, 9, 0.6], [360, 22, 13, 0.55], [450, 12, 17, 0.6]]} />
			{/* the grey sea at the end of the road */}
			<rect x={900} y={RD.hz - 2} width={W + 800} height={60} fill="#7d8790" />
			<path d={`M900,${RD.hz + 2} L${W + 800},${RD.hz + 2}`} stroke="#c9ccc8" strokeWidth={1.4} opacity={0.6} />
		</Layer>
		<Layer D={40}><FPath d={ridge(-500, 1000, (x) => -(RD.hz - 10 - Math.abs(fbm(x, 300, 40, 31, 3)) * (1 - cl((x - 600) / 400))), RD.hz + 8, 10)} c="#646a72" /></Layer>
		<Layer D={INF}>
			<defs><linearGradient id="rdgr" gradientUnits="userSpaceOnUse" x1="0" y1={RD.hz} x2="0" y2={H}><stop offset="0" stopColor="#8d9188" /><stop offset="0.3" stopColor="#6c7068" /><stop offset="1" stopColor="#3e423e" /></linearGradient>
				<linearGradient id="rdsea" gradientUnits="userSpaceOnUse" x1="0" y1={RD.hz} x2="0" y2={rdY(9)}><stop offset="0" stopColor="#8c959c" /><stop offset="1" stopColor="#5f6a72" /></linearGradient></defs>
			<rect x={-600} y={RD.hz + 6} width={W + 1400} height={H} fill="url(#rdgr)" />
			<path d={`M1000,${RD.hz + 2} L${W + 900},${RD.hz + 2} L${W + 900},${f1(rdY(12))} Q1500,${f1(rdY(10))} 1250,${f1(rdY(14))} Z`} fill="url(#rdsea)" />
		</Layer>
		{/* the road along the coast: asphalt band at depths 5 … 6.6, the centre dashes, the guard rail on the sea side */}
		<Layer D={INF}>{(() => { const g = (x: number, D: number): P => [x, rdY(D)];
			const road = poly([g(-600, 4.4), g(W + 900, 4.4), g(W + 900, 6.8), g(-600, 6.8)]), dash: string[] = [];
			for (let x = -600; x < W + 900; x += 160) dash.push(poly([g(x, 5.5), g(x + 80, 5.5), g(x + 80, 5.62), g(x, 5.62)]));
			return <g><path d={road} fill="#4c4f52" /><Shape d={dash.join(' ')} fill="#c9c6b8" o={0.75} /><path d={poly([g(-600, 6.8), g(W + 900, 6.8), g(W + 900, 6.9), g(-600, 6.9)])} fill="#9a9c98" opacity={0.6} /></g>; })()}</Layer>
		<Layer D={7.2}>{(() => { const y = rdY(7.2), s = D0 / 7.2, d: string[] = [];
			for (let x = -500; x < W + 800; x += 150 * s) d.push(poly([[x, y + 2], [x + 6 * s, y + 2], [x + 6 * s, y - 55 * s], [x, y - 55 * s]]));
			d.push(poly([[-500, y - 55 * s], [W + 800, y - 55 * s], [W + 800, y - 40 * s], [-500, y - 40 * s]]));
			return <Shape d={d.join(' ')} fill="#5c6064" />; })()}
			{/* street lamps (dark), a bus shelter, empty */}
			{[200, 980, 1760].map((x, i) => { const y = rdY(7.2), s = D0 / 7.2; return <g key={i}><path d={poly([[x, y], [x + 7 * s, y], [x + 5 * s, y - 520 * s], [x + 2 * s, y - 520 * s]])} fill="#4a4e54" /><path d={`M${x + 4 * s},${y - 520 * s} q${40 * s},${-20 * s} ${90 * s},${-6 * s} l0,${10 * s} l${-30 * s},0 Z`} fill="#4a4e54" /></g>; })}
			{(() => { const y = rdY(7.2), s = D0 / 7.2, x = 1300; return <g fill="#555a60"><path d={poly([[x, y], [x + 8 * s, y], [x + 8 * s, y - 250 * s], [x, y - 250 * s]]) + ' ' + poly([[x + 380 * s, y], [x + 388 * s, y], [x + 388 * s, y - 250 * s], [x + 380 * s, y - 250 * s]]) + ' ' + poly([[x - 20 * s, y - 250 * s], [x + 408 * s, y - 250 * s], [x + 400 * s, y - 270 * s], [x - 12 * s, y - 270 * s]])} />
				<rect x={x + 8 * s} y={y - 230 * s} width={372 * s} height={200 * s} fill="#a9b4bc" opacity={0.25} /><rect x={x + 30 * s} y={y - 70 * s} width={300 * s} height={10 * s} /></g>; })()}
		</Layer>
		<Layer D={16}><Mist n={5} seed={6} y0={RD.hz} y1={RD.hz + 40} t={t} speed={20} o={0.4} c="#c8ccce" w={[600, 1400]} h={[30, 70]} /></Layer>
		<FigureSlot x={kx + dx} y={rdY(D0) + 0} h={kh} attire="home2026" action="pushCart" phase={ph} facing={1} rim="#efe2d0" lightDir={150} rimO={0.8} shadow={{k: 0.1, skew: -1.4, o: 0.35, c: '#20242a', blur: 3}} />
		<Particles kind="dust" n={50} seed={71} D={[1.5, 10]} box={[-60, 200, 1980, 1000]} c="#dfe2e0" o={0.5} wind={160} />
		{/* the near fence post (weathered wood, barbed wire) with a surgical mask hooked on the wire, flapping */}
		<Layer D={1.5}>{(() => { const x = 1470, top = 330, wy1 = 476, wy2 = 640; return <g>
			<path d={`M-1700,${wy1 - 14} Q-500,${wy1 + 12} -200,${wy1 - 6} Q700,${wy1 + 14} ${x},${wy1} Q1800,${wy1 - 8} ${W + 200},${wy1 + 6} Q${W + 1300},${wy1 + 16} ${W + 2600},${wy1 + 2} M-1700,${wy2 - 10} Q-500,${wy2 + 14} -200,${wy2 - 4} Q700,${wy2 + 16} ${x},${wy2} Q1800,${wy2 - 6} ${W + 200},${wy2 + 8} Q${W + 1300},${wy2 + 18} ${W + 2600},${wy2 + 4}`} stroke="#25221f" strokeWidth={3.4} fill="none" />
			{[-1300, -900, -480, -60, 260, 640, 1020, 1720, 2300, 2800, 3300].map((bx, i) => <path key={i} d={`M${bx - 8},${wy1 + 6 - i} l8,-14 l6,16 l8,-12 M${bx + 40},${wy2 + 4} l8,-14 l6,16 l8,-12`} stroke="#25221f" strokeWidth={2.6} fill="none" />)}
			<path d={`M${x - 26},${1200} L${x - 22},${top + 12} L${x - 8},${top} L${x + 22},${top + 4} L${x + 26},${1200} Z`} fill="#3b3430" />
			<path d={`M${x - 22},${top + 12} L${x - 8},${top} L${x - 2},${top + 2} L${x - 12},${1200} L${x - 26},${1200} Z`} fill="#5a4e44" opacity={0.6} />
			{[0, 1, 2, 3].map((k) => <path key={k} d={`M${x - 10 + k * 7},${top + 60 + k * 90} q4,40 -2,90`} stroke="#2a2420" strokeWidth={2} fill="none" />)}
			<Mask x={x + 24} y={wy1 + 2} s={2.3} t={t} />
			<path d={tuftD(x, 1100, 18, 220, 260, 3, 18)} fill="#2e302a" />
		</g>; })()}</Layer>
	</Stage>;
};

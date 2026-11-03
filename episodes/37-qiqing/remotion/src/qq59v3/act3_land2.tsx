import React from 'react';
import {Stage, Layer, FPath, Shape, FigureSlot, karlTravel, Particles, Mist, FogFoot, FogBand, Glow, SkyGrad, Sun, INF, Cam, useFog, useGround, useProject, useUid,
	P, W, H, f1, lerp, rnd, noise1, fbm, ridge, spline, taper, poly, mix, cl, sm, GOLD} from './kit3';
import {tuftD, CloudBands, personD, blobD} from './props3';
import {Karl, Attire, Action, mixHex} from './karl3';
import {SeaCam} from './act3_sea';
import {RedX} from './act3_land';

/* ep59 v3 · act 3 · land sets, part 2: the grey shore (close), his boots at the water (POV), the Caspian's far shore at dawn,
   the Bosphorus Bridge (wide + on the deck), the Channel Tunnel portal, the white cliffs (far, for the swim), Dover's shingle. */

/* ---------- Karl wading: the figure split at the water line (the part under water dim and tinted), a foam ring at his legs ---------- */
export const Wader: React.FC<{x: number; y: number; h: number; wy: number; attire: Attire; action?: Action; phase: number; facing?: 1 | -1; t: number;
	rim: string; lightDir: number | 'left' | 'right'; rimO?: number; foam?: string; tint?: string; tintO?: number; drip?: number}> = ({x, y, h, wy, attire, action = 'walk', phase, facing = 1, t, rim, lightDir, rimO = 0.9, foam = '#fff2e4', tint = '#2a3a48', tintO = 0.08, drip = 0}) => {
	const id = useUid('wd'), fr = ((phase % 1) + 1) % 1;
	const k = <Karl x={x} y={y} h={h} attire={attire} action={action} phase={phase} facing={facing} t={t} rim={rim} lightDir={lightDir} rimO={rimO} />;
	return <g>
		<defs><clipPath id={`${id}u`}><rect x={x - 3 * h} y={y - 3 * h} width={6 * h} height={wy - (y - 3 * h)} /></clipPath>
			<clipPath id={`${id}d`}><rect x={x - 3 * h} y={wy} width={6 * h} height={3 * h} /></clipPath></defs>
		<g clipPath={`url(#${id}d)`} opacity={tintO}>{k}</g>
		<rect x={x - 0.5 * h} y={wy} width={h} height={0.03 * h} fill={tint} opacity={0.25} />
		<g clipPath={`url(#${id}u)`}>{k}</g>
		{/* the foam ring and the bow wave pushed by each leg */}
		<ellipse cx={x + facing * 0.02 * h} cy={wy + 0.004 * h} rx={0.2 * h} ry={0.018 * h} fill="none" stroke={foam} strokeWidth={Math.max(1.2, 0.006 * h)} opacity={0.75} />
		<path d={`M${f1(x + facing * 0.05 * h)},${f1(wy)} Q${f1(x + facing * (0.14 + 0.03 * Math.sin(fr * 2 * Math.PI * 2)) * h)},${f1(wy - 0.012 * h)} ${f1(x + facing * 0.24 * h)},${f1(wy + 0.006 * h)}`} stroke={foam} strokeWidth={Math.max(1.5, 0.008 * h)} fill="none" opacity={0.85} />
		{Array.from({length: 8}, (_, i) => { const a = ((t * 1.4 + i / 8) % 1), r = (0.14 + 0.4 * a) * h;
			return <ellipse key={i} cx={x - facing * a * 0.25 * h} cy={wy + 0.005 * h} rx={r * (0.4 + 0.2 * rnd(i, 3))} ry={r * 0.03} fill="none" stroke={foam} strokeWidth={1.2} opacity={f1(0.5 * (1 - a))} />; })}
		{drip > 0 && Array.from({length: 10}, (_, i) => { const a = ((t * (0.9 + rnd(i, 4) * 0.5) + rnd(i, 5)) % 1), px = x + (rnd(i, 6) - 0.5) * 0.3 * h, py = lerp(y - h * (0.4 + 0.45 * rnd(i, 7)), wy, a * a);
			return py < wy ? <ellipse key={'dr' + i} cx={px} cy={py} rx={1.6} ry={3.5} fill={foam} opacity={f1(drip * 0.8 * (1 - a))} /> : null; })}
	</g>; };

/* ===================================== THE GREY SHORE · close on him, wind ===================================== */
const SH = {hz: 560, K: 2960, focus: 2.6};
const shY = (D: number) => SH.hz + SH.K / D;
export const ShoreClose: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
	const g = (D: number) => shY(D);
	return <Stage t={t} cam={cam} atm={{haze: '#9ba5ae', density: 0.05, focus: SH.focus, aperture: 2.2, rim: '#f4e6d2', lightDir: 15, grain: 0.07, vignette: 0.55, pp: [1150, SH.hz]}} bg="#4a525c">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={SH.hz + 10} stops={[[0, '#262c36'], [0.35, '#4a525e'], [0.7, '#8a929a'], [0.92, '#c9c6bc'], [1, '#d8d2c4']]} />
			<CloudBands id="shcb" t={t} top="#232933" mid="#3e4652" under="#7a828c" warm="#d4c8b2" warmFrom={3} drift={40} bands={[[90, 50, 3, 0.7], [210, 44, 7, 0.65], [330, 30, 11, 0.6], [430, 18, 15, 0.6], [500, 10, 19, 0.65]]} />
			<Glow x={1180} y={SH.hz - 30} r={520} ry={150} c="#f6e6c8" o={0.55} />
		</Layer>
		<Layer D={INF}>{(() => { const caps: string[] = [], gr = useGround(SH.hz, SH.K);
			for (let i = 0; i < 160; i++) { const D = 5 * Math.pow(70 / 5, rnd(i, 3)), y = g(D) + ((t * 30 / D) % 30), x = -300 + rnd(i, 4) * (W + 600), L = 3000 / D * (0.4 + rnd(i, 5)), th = 60 / D;
				caps.push(spline(([[x - L / 2, y], [x, y - th], [x + L / 2, y], [x, y + th * 0.4]] as P[]).map(gr), true)); }
			return <g><defs><linearGradient id="shsea" gradientUnits="userSpaceOnUse" x1="0" y1={SH.hz} x2="0" y2={H}><stop offset="0" stopColor="#a8acaa" /><stop offset="0.12" stopColor="#6e7880" /><stop offset="0.5" stopColor="#3e4a56" /><stop offset="1" stopColor="#26303a" /></linearGradient></defs>
				<rect x={-600} y={SH.hz} width={W + 1200} height={H} fill="url(#shsea)" />
				<Glow x={1180} y={SH.hz + 40} r={500} ry={60} c="#eadcc0" o={0.4} />
				<Shape d={caps.join(' ')} fill="#e8eae6" o={0.6} /></g>; })()}</Layer>
		{/* breakers rolling in: long white foam lines at depths 9 … 14, advancing */}
		{[14, 11, 8.6].map((D0, i) => { const ph = ((t * 0.32 + i * 0.33) % 1), D = D0 - ph * 2.2, y = g(D), o = Math.sin(Math.PI * ph);
			return <Layer key={'br' + i} D={D}><path d={`M-400,${f1(y)} ${Array.from({length: 24}, (_, k) => { const x = -400 + k * 120; return `Q${x + 60},${f1(y - 8 - 6 * Math.sin(k * 1.7 + i))} ${x + 120},${f1(y + 3 * Math.sin(k + t))}`; }).join(' ')} L${W + 600},${f1(y + 16)} L-400,${f1(y + 16)} Z`} fill="#eef0ec" opacity={0.65 * o} /></Layer>; })}
		<Particles kind="spindrift" n={70} seed={81} D={[1, 8]} box={[-100, 200, W + 100, 1000]} c="#eef0f0" o={0.45} wind={-700} size={0.8} />
		<FigureSlot x={370} y={g(SH.focus)} h={1300} attire="home2026" action="stand" phase={t / 4.2 + 0.4} facing={1} rim="#f6e8d2" lightDir={12} rimO={1} />
		<Layer D={1.4}>{(() => { const sway = Math.sin(t * 2.6) * 6 + Math.sin(t * 5.1) * 3; return <g transform={`skewX(${f1(-sway * 0.6)})`}><FPath d={tuftD(1500, 1180, 26, 300, 380, 11, -18 - sway) + ' ' + tuftD(1780, 1200, 20, 260, 300, 13, -22 - sway)} c="#2a2a26" /></g>; })()}</Layer>
		<Particles kind="spray" n={30} seed={82} D={[0.8, 2]} box={[900, 600, 1900, 1080]} c="#eef2f2" o={0.35} />
	</Stage>;
};

/* ===================================== HIS BOOTS · looking down at the water (POV) ===================================== */
/** one walking boot seen from above, toe up (the sea side), heel toward the camera; (x, y) = toe tip; s = scale */
const BootTop: React.FC<{x: number; y: number; s: number; side: 1 | -1; wet: number}> = ({x, y, s, side, wet}) => {
	const P = (u: number, v: number) => `${f1(x + u * s * side)},${f1(y + v * s)}`;
	const sole = `M${P(0, -6)} C${P(48, -4)} ${P(66, 40)} ${P(64, 120)} C${P(62, 220)} ${P(58, 300)} ${P(52, 420)} L${P(-52, 420)} C${P(-58, 300)} ${P(-60, 220)} ${P(-60, 120)} C${P(-62, 40)} ${P(-48, -4)} ${P(0, -6)} Z`;
	const upper = `M${P(0, 6)} C${P(40, 8)} ${P(54, 44)} ${P(54, 120)} C${P(54, 220)} ${P(50, 300)} ${P(46, 420)} L${P(-46, 420)} C${P(-50, 300)} ${P(-54, 220)} ${P(-54, 120)} C${P(-54, 44)} ${P(-40, 8)} ${P(0, 6)} Z`;
	const tongue = `M${P(-22, 150)} C${P(-20, 120)} ${P(20, 120)} ${P(22, 150)} L${P(26, 420)} L${P(-26, 420)} Z`;
	const laces = [170, 205, 240, 275, 310, 345, 380].map((v, i) => `M${P(-30, v)} L${P(30, v + (i % 2 ? -10 : 10))} L${P(30, v + (i % 2 ? -6 : 14))} L${P(-30, v + 4)} Z`).join(' ');
	return <g>
		<path d={sole} fill="#120f0d" />
		<path d={upper} fill={mixHex('#3a2c22', '#1c1612', wet)} />
		<path d={`M${P(-30, 30)} C${P(-10, 18)} ${P(10, 18)} ${P(30, 30)} L${P(34, 70)} C${P(10, 58)} ${P(-10, 58)} ${P(-34, 70)} Z`} fill="#4c3a2c" opacity={0.7} />
		<path d={tongue} fill="#2a2018" /><path d={laces} fill="#8a7a62" opacity={0.85} />
		<path d={`M${P(side > 0 ? -50 : 50, 120)} C${P(side > 0 ? -52 : 52, 60)} ${P(side > 0 ? -30 : 30, 14)} ${P(0, 10)}`} stroke="#d8c8b0" strokeWidth={2.4} fill="none" opacity={0.45} />
	</g>; };
export const BootsPOV: React.FC<{t: number; beat: number; dur: number}> = ({t, beat, dur}) => {
	const id = useUid('bp');
	// the swash: wave 1 creeps up short of his toes and slides back; wave 2 comes fast and big — he steps back on the beat
	const edge = (tt: number) => { const a = cl(tt / 1.05), b = cl((tt - 1.05) / 0.7), c = cl((tt - 1.75) / 0.55), d = cl((tt - 2.3) / 1.2);
		return lerp(160, 600, Math.sin(a * Math.PI / 2)) - 420 * sm(b) + 560 * Math.sin(c * Math.PI / 2) + (tt > 2.3 ? 0 - 120 * sm(d) : 0); };
	const ey = edge(t), back = sm((t - 5 * beat) / 0.28), back2 = sm((t - 5 * beat - 0.16) / 0.28);
	const lift1 = Math.sin(Math.PI * cl((t - 5 * beat) / 0.28)), lift2 = Math.sin(Math.PI * cl((t - 5 * beat - 0.16) / 0.28));
	const wetL = cl((ey - 640) / 80) * (1 - back), cam = 1 + 0.03 * (t / dur);
	const lace = (y0: number) => { let d = `M-100,${f1(y0)}`; for (let x = -100; x <= W + 100; x += 40) d += ` L${x},${f1(y0 + 10 * Math.sin(x / 70 + t * 1.6) + 8 * Math.sin(x / 23 + t * 3) + 6 * noise1(x / 50, 3))}`; return d; };
	const fill = (y0: number) => lace(y0) + ` L${W + 100},-200 L-100,-200 Z`;
	return <Stage t={t} atm={{grain: 0.07, vignette: 0.55}} bg="#5e5a55">
		<g transform={`translate(960,540) scale(${cam.toFixed(4)}) translate(-960,-540)`}>
			<defs><linearGradient id={`${id}sand`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a5e60" /><stop offset="0.5" stopColor="#6e6a64" /><stop offset="1" stopColor="#7a736a" /></linearGradient>
				<linearGradient id={`${id}wat`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e2a34" /><stop offset="0.6" stopColor="#3c4c58" /><stop offset="1" stopColor="#6c7c84" /></linearGradient></defs>
			<rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#${id}sand)`} />
			{/* wet-sand sheen (the sky in it), shell bits and pebbles */}
			<path d={`M-100,${f1(ey + 60)} Q960,${f1(ey + 140)} ${W + 100},${f1(ey + 50)} L${W + 100},${f1(ey + 260)} Q960,${f1(ey + 330)} -100,${f1(ey + 250)} Z`} fill="#a4a8a8" opacity={0.25} />
			{Array.from({length: 120}, (_, i) => <ellipse key={i} cx={f1(rnd(i, 1) * W)} cy={f1(rnd(i, 2) * H)} rx={f1(2 + 6 * rnd(i, 3))} ry={f1(1.5 + 3 * rnd(i, 4))} fill={rnd(i, 5) > 0.5 ? '#4a4844' : '#a69c8c'} opacity={0.5} />)}
			{/* the swash: dark water behind, a thin sheet sliding up, the foam lace at its edge, bubbles */}
			<path d={fill(ey)} fill={`url(#${id}wat)`} opacity={0.88} />
			<path d={fill(ey - 260)} fill="#16202a" opacity={0.6} />
			<path d={lace(ey - 180) + ` L${W + 100},${f1(ey - 230)} ` + lace(ey - 230).replace(/^M/, 'L').split(' L').reverse().join(' L') + ' Z'} fill="#e6eae8" opacity={0.25} />
			<path d={lace(ey)} stroke="#f4f6f2" strokeWidth={9} fill="none" opacity={0.9} />
			<path d={lace(ey - 16)} stroke="#e8ece8" strokeWidth={3} fill="none" opacity={0.6} />
			{Array.from({length: 70}, (_, i) => { const x = rnd(i, 7) * W, y = ey - 10 - rnd(i, 8) * 120; return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(2 + 5 * rnd(i, 9))} fill="none" stroke="#f2f4f0" strokeWidth={1.4} opacity={0.6} />; })}
			{/* his boots (and trouser hems), stepping back on the beat */}
			{([[790, -1, back, lift1], [1130, 1, back2, lift2]] as [number, 1 | -1, number, number][]).map(([x, side, b, l], i) => <g key={i} transform={`translate(0,${f1(250 * b)}) translate(${x},${f1(720 + 120)}) scale(${f1(1 + 0.08 * l)}) translate(${-x},${-840})`}>
				<ellipse cx={x + 10} cy={1000 + 30 * l} rx={90} ry={260} fill="#000" opacity={0.25 - 0.1 * l} />
				<BootTop x={x} y={700} s={1.25} side={side} wet={wetL} />
				<path d={`M${x - 80},${1250} L${x - 76},${1150} Q${x},${1110} ${x + 76},${1150} L${x + 80},${1250} Z`} fill="#141318" />
				<path d={`M${x - 76},${1150} Q${x},${1110} ${x + 76},${1150}`} stroke="#3a3842" strokeWidth={4} fill="none" />
			</g>)}
		</g>
	</Stage>;
};

/* ===================================== THE CASPIAN'S FAR SHORE at dawn ===================================== */
const CF = {hz: 520, K: 1300, focus: 4, sun: [360, 470] as P};
const cfY = (D: number) => CF.hz + CF.K / D;
const pumpjackD = (x: number, y: number, s: number, a: number) => {
	const beamA = a * Math.PI / 180, px = x, py = y - 46 * s, L1 = 40 * s, L2 = 30 * s, hx = px + Math.cos(beamA) * L1, hy = py - Math.sin(beamA) * L1, tx = px - Math.cos(beamA) * L2, ty = py + Math.sin(beamA) * L2;
	return [poly([[x - 26 * s, y], [x - 20 * s, y], [px, py], [px + 2 * s, py]]), poly([[x + 22 * s, y], [x + 16 * s, y], [px, py], [px - 2 * s, py]]), taper([[tx, ty], [hx, hy]], 5 * s, 5 * s),
		`M${f1(hx)},${f1(hy - 6 * s)} q${f1(10 * s)},${f1(4 * s)} ${f1(6 * s)},${f1(18 * s)} L${f1(hx - 2 * s)},${f1(hy + 10 * s)} Z`, poly([[hx + 3 * s, hy + 10 * s], [hx + 4 * s, hy + 10 * s], [hx + 4 * s, y], [hx + 3 * s, y]]),
		poly([[x - 34 * s, y], [x + 40 * s, y], [x + 40 * s, y - 4 * s], [x - 34 * s, y - 4 * s]])].join(' '); };
export const CaspianShore: React.FC<{t: number; cam: Cam; dur: number}> = ({t, cam, dur}) => {
	const kh = 430, tr = karlTravel('walk', t, kh, 0.75), kx = 700 + tr.dx, depth = lerp(0.46, 0.2, sm(t / dur)), wy = cfY(CF.focus), ky = wy + depth * kh;
	const shoreX = (D: number) => 1000 + 1000 / D;
	return <Stage t={t} cam={cam} atm={{haze: '#f0c8a8', density: 0.035, focus: CF.focus, aperture: 1.6, rim: '#ffd59a', lightDir: 160, grain: 0.055, vignette: 0.5, pp: [CF.sun[0], CF.hz]}} bg="#1e2238">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={CF.hz + 10} stops={[[0, '#1e2644'], [0.3, '#3e466c'], [0.6, '#8c7490'], [0.82, '#e0a088'], [0.95, '#ffcf9a'], [1, '#ffe4b8']]} />
			<CloudBands id="cfcb" t={t} top="#30365a" mid="#6e6688" under="#c8909a" warm="#ffc890" warmFrom={2} drift={4} bands={[[120, 26, 31, 0.4], [230, 30, 35, 0.5], [330, 18, 39, 0.55], [420, 10, 43, 0.65], [470, 6, 47, 0.7]]} />
			<Sun x={CF.sun[0]} y={CF.sun[1]} r={34} c="#ffcf8e" core="#fff6e2" bloom={10} bloomO={0.9} />
		</Layer>
		{/* the sea (sky reflected, the sun's path), then the far shore: low hills, pumpjacks, the people waiting on the beach */}
		<Layer D={INF}>{(() => { const gr = useGround(CF.hz, CF.K), gl: string[] = [], sw: string[] = [];
			for (let i = 0; i < 600; i++) { const u = Math.pow(rnd(i, 11), 1.3), y = lerp(CF.hz + 1, H + 40, u), d = y - CF.hz, x = CF.sun[0] + (rnd(i, 12) + rnd(i, 13) - 1) * (30 + d * 0.5) * 1.6, tw = Math.pow(Math.max(0, Math.sin(t * (2 + rnd(i, 14) * 3) + i)), 2), L = (4 + d * 0.08) * (0.4 + tw);
				if (tw < 0.05) continue; gl.push(spline(([[x - L, y], [x, y - 0.6 - d * 0.005], [x + L, y], [x, y + 0.6 + d * 0.005]] as P[]).map(gr), true)); }
			for (let i = 0; i < 140; i++) { const u = Math.pow(rnd(i, 21), 1.6), y = lerp(CF.hz + 2, H + 40, u), d = y - CF.hz, x = -300 + ((rnd(i, 22) * (W + 600) + t * 10) % (W + 600)), L = d * (1.5 + rnd(i, 23) * 3), th = Math.max(0.6, d * 0.02);
				sw.push(spline(([[x - L / 2, y], [x, y - th], [x + L / 2, y], [x, y - th * 0.35]] as P[]).map(gr), true)); }
			return <g><defs><linearGradient id="cfsea" gradientUnits="userSpaceOnUse" x1="0" y1={CF.hz} x2="0" y2={H}><stop offset="0" stopColor="#f6d0aa" /><stop offset="0.12" stopColor="#c09aa0" /><stop offset="0.45" stopColor="#6a6a88" /><stop offset="1" stopColor="#2a3050" /></linearGradient></defs>
				<rect x={-600} y={CF.hz} width={W + 1400} height={H} fill="url(#cfsea)" />
				<Glow x={CF.sun[0]} y={CF.hz + 160} r={240} ry={220} c="#ffdcaa" o={0.4} />
				<Shape d={sw.join(' ')} fill="#e8c4b4" o={0.35} /><Shape d={gl.join(' ')} fill="#fff1d0" o={0.95} /></g>; })()}</Layer>
		<Layer D={30}><FPath d={ridge(1000, W + 800, (x) => -(CF.hz - 18 - Math.abs(fbm(x, 260, 30, 13, 3)) * cl((x - 1000) / 300)), CF.hz + 10, 10)} c="#6e5468" />
			<FPath d={[1380, 1500, 1640, 1820].map((x, i) => pumpjackD(x, CF.hz - 14 - Math.abs(fbm(x, 260, 30, 13, 3)) * 0.9, 0.6, 10 * Math.sin(t * 2.2 + i * 1.3))).join(' ')} c="#3e3048" /></Layer>
		{/* the beach: the coast receding to the right, wet sand at the waterline, a dry band, the swash line */}
		<Layer D={INF}>{(() => { const gr = useGround(CF.hz, CF.K), Ds = [40, 28, 20, 14, 10, 7, 5, 3.6, 2.6, 1.9, 1.4, 1.1], pts: P[] = Ds.map((D) => [shoreX(D) + 14 * Math.sin(D * 0.9), cfY(D)] as P);
			const beach = spline([...pts, [W + 900, cfY(1.1)], [W + 900, CF.hz + 3]].map((p) => gr(p as P)), true);
			const dry = spline(([...pts.map(([x, y]) => [x + 120 * (y - CF.hz) / 300, y] as P), [W + 900, cfY(1.1)], [W + 900, CF.hz + 3]] as P[]).map(gr), true);
			const foam = spline(pts.map(([x, y]) => [x - 8 * (y - CF.hz) / 300 + 6 * Math.sin(t * 1.8 + y / 40), y] as P).map(gr), false);
			return <g><path d={beach} fill="#9a7a78" /><path d={dry} fill="#d0a684" /><path d={foam} stroke="#fff0dc" strokeWidth={2.6} fill="none" opacity={0.85} />
				<path d={spline(pts.map(([x, y]) => [x - 40 * (y - CF.hz) / 300, y] as P).map(gr), false)} stroke="#ffe6cc" strokeWidth={1.4} fill="none" opacity={0.5} /></g>; })()}</Layer>
		<Layer D={16}><FPath d={spline([[1080, cfY(16) - 2], [1300, cfY(16) - 26], [1600, cfY(16) - 34], [2200, cfY(16) - 40], [2200, cfY(16) + 6], [1080, cfY(16) + 4]], true)} c="#b08a74" />
			<FPath d={tuftD(1400, cfY(16) - 22, 10, 30, 160, 3, 4) + ' ' + tuftD(1700, cfY(16) - 30, 12, 34, 200, 5, 6)} c="#5e4a52" /></Layer>
		<Layer D={10}>{(() => { const y = cfY(10), s = CF.focus / 10;
			return <g><FPath d={[0, 1, 2, 3].map((i) => personD(1330 + i * 46 + (i > 1 ? 30 : 0), y - 4, 170 * s * (0.92 + rnd(i, 5) * 0.12), 40 + i, i === 1 ? 1 : i === 3 ? -1 : 0)).join(' ')} c="#2e2236" /></g>; })()}</Layer>
		<Layer D={14}><FPath d={'M-30,0 L30,0 L28,-6 L-26,-8 Z'} c="#2a2a40" transform={`translate(${f1(170)},${f1(cfY(14))})`} />
			{(() => { const y = cfY(14), s = 4 / 14 * 24; return <g transform={`translate(160,${f1(y + Math.sin(t * 1.2) * 2)}) scale(${f1(s / 10)},${f1(-s / 10)})`}>
				<path d="M-66,-5 L-69,2 L-70,15 L-30,16 L10,18 L45,20 L72,24 L70,16 L63,4 L56,-5 Z" fill="#2c2f46" /><path d="M-14,16 L-14,37 L24,37 L36,22 L36,18 Z" fill="#30344c" /><rect x={-9} y={26} width={26} height={6} fill={GOLD} opacity={0.9} /></g>; })()}</Layer>
		<Wader x={kx} y={ky} h={kh} wy={wy} attire="swim" phase={tr.phase} t={t} rim="#ffd8a8" lightDir={165} rimO={1} foam="#fff0dc" tint="#3a3a5a" drip={1} />
		<Layer D={2}><Mist n={4} seed={17} y0={cfY(2) - 40} y1={cfY(2) + 40} t={t} speed={10} o={0.18} c="#ffe2c8" w={[700, 1400]} h={[30, 70]} /></Layer>
		<Layer D={1.5} blur={5}>{(() => { const y = cfY(1.5); return <path d={`M-400,${f1(y)} ${Array.from({length: 14}, (_, k) => { const x = -400 + k * 200; return `Q${x + 100},${f1(y - 26 - 14 * Math.sin(k * 1.3 + t * 1.4))} ${x + 200},${f1(y + 6 * Math.sin(k + t))}`; }).join(' ')} L${W + 400},${H + 300} L-400,${H + 300} Z`} fill="#1c2238" />; })()}</Layer>
	</Stage>;
};

/* ===================================== THE BOSPHORUS BRIDGE ===================================== */
/** a city on a hill line: blocks, domed mosques with minarets, cypresses (one path) */
const cityD = (x0: number, x1: number, y: number, s: number, seed: number, mosque = 0.25) => {
	const d: string[] = []; let x = x0, i = 0;
	while (x < x1) { const r = rnd(i, seed);
		if (r < mosque) { const R = (18 + 14 * rnd(i, seed + 1)) * s, bw = R * 2.6, cx = x + bw / 2, base = y - 14 * s;
			d.push(poly([[x, y], [x + bw, y], [x + bw, base], [x, base]]), `M${f1(cx - R)},${f1(base)} A${f1(R)},${f1(R * 0.9)} 0 0,1 ${f1(cx + R)},${f1(base)} Z`, `M${f1(cx - R * 1.9)},${f1(base)} A${f1(R * 0.6)},${f1(R * 0.5)} 0 0,1 ${f1(cx - R * 0.8)},${f1(base)} Z`, `M${f1(cx + R * 0.8)},${f1(base)} A${f1(R * 0.6)},${f1(R * 0.5)} 0 0,1 ${f1(cx + R * 1.9)},${f1(base)} Z`,
				poly([[cx - 1.5 * s, base - R * 0.9], [cx + 1.5 * s, base - R * 0.9], [cx, base - R * 1.15]]));
			const nm = rnd(i, seed + 2) > 0.5 ? 4 : 2;
			for (let m = 0; m < nm; m++) { const mx = x + (nm === 2 ? (m ? bw + 6 * s : -6 * s) : [-6 * s, bw * 0.2, bw * 0.8, bw + 6 * s][m]), mh = (70 + 30 * rnd(i, seed + 3 + m)) * s * (nm === 4 && (m === 1 || m === 2) ? 0.82 : 1);
				d.push(poly([[mx - 1.8 * s, y], [mx + 1.8 * s, y], [mx + 1.5 * s, y - mh], [mx - 1.5 * s, y - mh]]), poly([[mx - 1.6 * s, y - mh], [mx + 1.6 * s, y - mh], [mx, y - mh - 12 * s]]), poly([[mx - 3 * s, y - mh * 0.72], [mx + 3 * s, y - mh * 0.72], [mx + 3 * s, y - mh * 0.72 + 2.4 * s], [mx - 3 * s, y - mh * 0.72 + 2.4 * s]])); }
			x += bw + (20 + 30 * rnd(i, seed + 5)) * s;
		} else if (r < mosque + 0.12) { const hh = (24 + 18 * rnd(i, seed + 6)) * s; d.push(spline([[x, y], [x + 4 * s, y - hh * 0.6], [x + 2.5 * s, y - hh], [x + 1 * s, y - hh * 0.6], [x - 1 * s, y]], true)); x += 8 * s;
		} else { const bw = (12 + 26 * rnd(i, seed + 7)) * s, bh = (10 + 22 * rnd(i, seed + 8)) * s; d.push(poly([[x, y], [x + bw, y], [x + bw, y - bh], [x, y - bh]])); x += bw + 2 * s; }
		i++; }
	return d.join(' '); };

/** the wide: the bridge leaping the strait at dawn, the near tower on the European shore, the far one in haze, the old city beyond */
export const BosphorusWide: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
	const hz = 560, near = [1330, 1395], far = [500, 530];
	const cable = (dx: number) => { const a: P = [near[0] + dx, 74], m: P = [930 + dx * 0.6, 488], b: P = [far[0] + dx * 0.4, 330]; return [a, m, b] as P[]; };
	const deck = (x: number) => lerp(468, 512, cl((near[0] + 600 - x) / 1500));
	const hangers = (dx: number) => { const [a, m, b] = cable(dx), d: string[] = [];
		const bez = (u: number): P => { const v = 1 - u; return [v * v * a[0] + 2 * v * u * (m[0] * 2 - (a[0] + b[0]) / 2) + u * u * b[0], v * v * a[1] + 2 * v * u * (m[1] * 2 - (a[1] + b[1]) / 2) + u * u * b[1]]; };
		for (let k = 1; k < 40; k++) { const u = k / 40, p = bez(u), q = bez(u + (k % 2 ? 0.012 : -0.012)); d.push(`M${f1(p[0])},${f1(p[1])} L${f1(q[0])},${f1(deck(q[0]) - 4)}`); }
		const c = (u: number) => bez(u); return {d: d.join(' '), path: 'M' + Array.from({length: 41}, (_, k) => c(k / 40)).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')}; };
	const H1 = hangers(0), H2 = hangers(22);
	return <Stage t={t} cam={cam} atm={{haze: '#e8b8a0', density: 0.04, focus: 4, aperture: 1.0, rim: '#ffd09a', lightDir: 170, grain: 0.055, vignette: 0.5, pp: [500, hz]}} bg="#1e2440">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={hz + 10} stops={[[0, '#232a4c'], [0.3, '#4a4a72'], [0.6, '#a07890'], [0.82, '#eaa486'], [0.95, '#ffd09c'], [1, '#ffe2b4']]} />
			<CloudBands id="bwcb" t={t} top="#2e3156" mid="#6a5c80" under="#c88c94" warm="#ffc08a" warmFrom={2} drift={4} bands={[[110, 26, 61, 0.4], [210, 30, 65, 0.5], [320, 18, 69, 0.55], [410, 10, 73, 0.6]]} />
			<Sun x={250} y={hz - 70} r={30} c="#ffc888" core="#fff4dc" bloom={10} bloomO={0.9} />
		</Layer>
		{/* the Asian shore (left, far) and the old city far down the strait (centre), in haze */}
		<Layer D={80}><FPath d={ridge(-400, 820, (x) => -(hz - 30 - Math.abs(fbm(x, 300, 40, 51, 3))), hz + 30, 10)} c="#7a5c78" /><FPath d={cityD(-300, 760, hz - 8, 0.62, 3, 0.3)} c="#6a4e6c" /></Layer>
		<Layer D={60}><FPath d={cityD(640, 1260, hz + 2, 0.8, 9, 0.35)} c="#8a6a82" /></Layer>
		<Layer D={INF}>{(() => { const gr = useGround(hz, 500), gl: string[] = [];
			for (let i = 0; i < 400; i++) { const u = Math.pow(rnd(i, 11), 1.3), y = lerp(hz + 2, H + 20, u), d = y - hz, x = 250 + (rnd(i, 12) + rnd(i, 13) - 1) * (30 + d * 0.5) * 1.8, tw = Math.pow(Math.max(0, Math.sin(t * (2 + rnd(i, 14) * 3) + i)), 2), L = (4 + d * 0.07) * (0.4 + tw);
				if (tw < 0.05) continue; gl.push(spline(([[x - L, y], [x, y - 0.6], [x + L, y], [x, y + 0.6]] as P[]).map(gr), true)); }
			return <g><defs><linearGradient id="bwsea" gradientUnits="userSpaceOnUse" x1="0" y1={hz} x2="0" y2={H}><stop offset="0" stopColor="#f2c6a6" /><stop offset="0.2" stopColor="#a88898" /><stop offset="0.6" stopColor="#4c4c70" /><stop offset="1" stopColor="#262a46" /></linearGradient></defs>
				<rect x={-600} y={hz} width={W + 1200} height={H} fill="url(#bwsea)" /><Shape d={gl.join(' ')} fill="#fff0d0" o={0.9} /></g>; })()}</Layer>
		{/* the bridge: far tower in haze, cables and hangers, the deck, the near tower on the European shore */}
		<Layer D={14}>{(() => { const fog = '#6e5a74';
			return <g>
				<path d={`M${far[0] - 5},${514} L${far[0] + 5},${514} L${far[0] + 3},${330} L${far[0] - 3},${330} Z M${far[1] - 4},${514} L${far[1] + 4},${514} L${far[1] + 2},${336} L${far[1] - 2},${336} Z M${far[0] - 4},${342} L${far[1] + 3},${346} L${far[1] + 3},${350} L${far[0] - 4},${346} Z`} fill={fog} />
				<path d={`M${far[0]},${332} Q${far[0] - 220},${470} -300,${540}`} stroke={fog} strokeWidth={2.4} fill="none" />
				<path d={H2.path} stroke="#5a4a66" strokeWidth={3.4} fill="none" /><path d={H2.d} stroke="#5a4a66" strokeWidth={1} fill="none" opacity={0.7} />
				<path d={H1.path} stroke="#3e3450" strokeWidth={4.6} fill="none" /><path d={H1.d} stroke="#3e3450" strokeWidth={1.3} fill="none" opacity={0.85} />
				<path d={`M-300,${f1(deck(-300) + 6)} L${W + 400},${f1(deck(W + 400) - 8)} L${W + 400},${f1(deck(W + 400) + 22)} L-300,${f1(deck(-300) + 12)} Z`} fill="#3a3048" />
				<path d={`M-300,${f1(deck(-300) + 6)} L${W + 400},${f1(deck(W + 400) - 2)}`} stroke="#ffcf9a" strokeWidth={1.4} opacity={0.6} />
				{/* the near tower: two legs, three portal beams, the saddles */}
				<path d={`M${near[0] - 22},${700} L${near[0] + 8},${700} L${near[0] + 3},${70} L${near[0] - 15},${70} Z M${near[1] - 16},${700} L${near[1] + 14},${700} L${near[1] + 9},${78} L${near[1] - 9},${78} Z`} fill="#2c2440" />
				{[[78, 22], [300, 16], [452, 14]].map(([y, h], i) => <path key={i} d={`M${near[0] - 14},${y} L${near[1] + 10},${y + 4} L${near[1] + 10},${y + 4 + h} L${near[0] - 14},${y + h} Z`} fill="#2c2440" />)}
				<path d={`M${near[0] - 4},${92} L${near[0] + 3},${700}`} stroke="#ffc890" strokeWidth={2} opacity={0.35} />
				<path d={`M${near[0] - 6},${76} Q${near[0] + 300},${300} ${W + 300},${440}`} stroke="#3e3450" strokeWidth={4.6} fill="none" />
				{/* him: a tiny walker on the deck */}
				<g transform={`translate(${f1(1180 + t * 6)},${f1(deck(1180 + t * 6) + 4)})`}><Karl x={0} y={0} h={22} attire="home2026" action="walk" phase={t / 1.3} facing={1} rim="#ffd09a" lightDir="left" rimO={0.9} /></g>
			</g>; })()}</Layer>
		{/* the European shore below the near tower: the waterfront, houses up the hill, a mosque by the water, cypresses */}
		<Layer D={9}><FPath d={spline([[1150, 714], [1240, 694], [1330, 676], [1520, 630], [1760, 602], [2300, 588], [2300, 1300], [1900, 1300], [1500, 900], [1250, 760]], true)} c="#2e2240" />
			<FPath d={cityD(1300, W + 400, 652, 0.9, 21, 0.1)} c="#352a48" />
			<FPath d={cityD(1220, 1700, 704, 1.25, 27, 0.4)} c="#2a2140" />
			{Array.from({length: 40}, (_, i) => { const x = 1280 + rnd(i, 3) * 800, y = 640 + rnd(i, 4) * 60 + (x - 1280) * -0.04; return <rect key={i} x={f1(x)} y={f1(y)} width={3} height={3} fill={GOLD} opacity={f1(0.4 + 0.5 * rnd(i, 5))} />; })}
			<path d="M1150,716 Q1300,780 1500,904 L1900,1300" stroke="#ffcf8a" strokeWidth={3} fill="none" opacity={0.3} /></Layer>
		<Particles kind="dust" n={40} seed={91} D={[3, 14]} box={[0, 200, 1900, 800]} c="#ffe6c4" o={0.6} size={1} />
		<Layer D={2.2} blur={5}><path d={`M-400,${H - 60} Q600,${H - 110} ${W + 400},${H - 40} L${W + 400},${H + 300} L-400,${H + 300} Z`} fill="#141a30" /></Layer>
	</Stage>;
};

/** on the deck: he walks the walkway past the 「Welcome to Europe」 sign, the hangers rising behind him, the strait and the city far below */
export const BosphorusDeck: React.FC<{t: number; cam: Cam; kx: number; kh: number}> = ({t, cam, kx, kh}) => {
	const tr = karlTravel('walk', t, kh), D0 = 4, hz = 520, deckY = 870;   // the water is far below: everything beyond the rail sits near the horizon
	return <Stage t={t} cam={cam} atm={{haze: '#e9bfa4', density: 0.035, focus: D0, aperture: 1.6, rim: '#ffd09a', lightDir: 175, grain: 0.055, vignette: 0.5, pp: [kx, hz]}} bg="#1e2440">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={hz + 10} stops={[[0, '#262c4e'], [0.35, '#55507a'], [0.65, '#b0808e'], [0.86, '#f0aa88'], [1, '#ffdcae']]} />
			<CloudBands id="bdcb2" t={t} top="#2e3156" mid="#6a5c80" under="#c88c94" warm="#ffc08a" warmFrom={2} drift={4} bands={[[120, 30, 62, 0.4], [230, 30, 66, 0.5], [340, 18, 70, 0.55], [430, 10, 74, 0.6]]} />
			<Sun x={260} y={hz - 50} r={30} c="#ffc888" core="#fff4dc" bloom={10} bloomO={0.9} />
		</Layer>
		{/* far below: the strait and the old city across it — domes and minarets in the haze */}
		<Layer D={90}><FPath d={ridge(-600, W + 600, (x) => -(hz + 30 - Math.abs(fbm(x, 400, 26, 41, 3))), hz + 60, 10)} c="#8c6a86" /><FPath d={cityD(-500, W + 500, hz + 34, 0.7, 13, 0.3)} c="#8c6a86" /></Layer>
		<Layer D={50}><FPath d={cityD(-500, W + 500, hz + 64, 1.0, 17, 0.22) + ' ' + ridge(-600, W + 600, (x) => -(hz + 62 - Math.abs(fbm(x, 300, 14, 45, 3))), hz + 120, 10)} c="#6e5070" /></Layer>
		<Layer D={INF}><defs><linearGradient id="bdsea" gradientUnits="userSpaceOnUse" x1="0" y1={hz + 100} x2="0" y2={H}><stop offset="0" stopColor="#d6a6a0" /><stop offset="0.5" stopColor="#7c6c8a" /><stop offset="1" stopColor="#3a3a5c" /></linearGradient></defs>
			<rect x={-600} y={hz + 96} width={W + 1200} height={H} fill="url(#bdsea)" />
			{Array.from({length: 120}, (_, i) => { const y = hz + 100 + Math.pow(rnd(i, 1), 1.5) * 500, x = 260 + (rnd(i, 2) + rnd(i, 3) - 1) * (60 + (y - hz) * 0.9), tw = Math.pow(Math.max(0, Math.sin(t * (2 + rnd(i, 4) * 3) + i)), 2);
				return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(3 + (y - hz) * 0.02 * (0.4 + tw))} ry={1} fill="#fff0d0" opacity={f1(0.3 + 0.6 * tw)} />; })}
			{/* a ferry crossing far below, its wake */}
			{(() => { const x = 1120 + t * 9, y = hz + 190; return <g><path d={`M${x - 240},${y + 6} L${x - 20},${y + 2} L${x - 20},${y + 5} Z`} fill="#f4e0d0" opacity={0.5} /><path d={`M${x - 26},${y} L${x + 26},${y} L${x + 20},${y + 7} L${x - 22},${y + 7} Z M${x - 16},${y} L${x - 16},${y - 9} L${x + 14},${y - 9} L${x + 14},${y} Z M${x - 2},${y - 9} L${x - 1},${y - 16} L${x + 3},${y - 16} L${x + 4},${y - 9} Z`} fill="#4a3c58" /></g>; })()}
		</Layer>
		{/* the main cable sweeping up toward the tower (right) and its zigzag hangers dropping to the deck edge behind the rail */}
		<Layer D={7}>{(() => { const c = (x: number) => 560 - 0.0000006 * Math.pow(Math.max(0, x + 600), 2.9) * 0.9 - (x - 400) * 0.12, d: string[] = [];
			for (let x = -560, k = 0; x < W + 900; x += 90, k++) { const x2 = x + (k % 2 ? 45 : -45); d.push(`M${f1(x)},${f1(c(x))} L${f1(x2)},${f1(deckY - 110)}`); }
			const cp = 'M' + Array.from({length: 60}, (_, i) => { const x = -600 + i * 50; return `${f1(x)},${f1(c(x))}`; }).join(' L');
			return <g><path d={d.join(' ')} stroke="#4a3a54" strokeWidth={2.6} fill="none" /><path d={cp} stroke="#3a2e48" strokeWidth={16} fill="none" /><path d={cp} stroke="#ffcf9a" strokeWidth={2} fill="none" opacity={0.4} transform="translate(0,-6)" />
				{/* the tower leg on the right */}
				<path d={`M${W + 260},${-100} L${W + 420},${-100} L${W + 430},${deckY} L${W + 250},${deckY} Z`} fill="#2e2642" transform="translate(-520,0)" />
				<path d={`M${W - 280},${-100} L${W - 272},${deckY}`} stroke="#ffc890" strokeWidth={3} opacity={0.35} /></g>; })()}</Layer>
		{/* the welcome sign on its posts at the walkway edge */}
		<Layer D={4.6}>{(() => { const x = 1400, y = 520, w = 420, h = 124, by = deckY - 70; return <g>
			<path d={`M${x + 30},${by} L${x + 40},${by} L${x + 40},${y + h} L${x + 30},${y + h} Z M${x + w - 40},${by} L${x + w - 30},${by} L${x + w - 30},${y + h} L${x + w - 40},${y + h} Z`} fill="#3a3248" />
			<rect x={x} y={y} width={w} height={h} rx={8} fill="#1f4f8c" /><rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} rx={5} fill="none" stroke="#e8eef6" strokeWidth={3} />
			<text x={x + w / 2} y={y + 50} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={700} fontSize={26} fill="#f2f4f8">AVRUPA'YA HOŞ GELDİNİZ</text>
			<text x={x + w / 2} y={y + 90} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={700} fontSize={30} fill="#f2f4f8">WELCOME TO EUROPE</text>
			<path d={`M${x},${y + 2} L${x + w},${y + 2}`} stroke="#ffd9a8" strokeWidth={2} opacity={0.5} /></g>; })()}</Layer>
		{/* the rail at the deck edge (behind him) */}
		<Layer D={4.5}>{(() => { const d: string[] = []; for (let x = -600; x < W + 800; x += 70) d.push(poly([[x, deckY - 8], [x + 5, deckY - 8], [x + 5, deckY - 150], [x, deckY - 150]]));
			d.push(poly([[-600, deckY - 150], [W + 800, deckY - 150], [W + 800, deckY - 140], [-600, deckY - 140]]), poly([[-600, deckY - 90], [W + 800, deckY - 90], [W + 800, deckY - 84], [-600, deckY - 84]]), poly([[-600, deckY - 10], [W + 800, deckY - 10], [W + 800, deckY + 40], [-600, deckY + 40]]));
			return <g><Shape d={d.join(' ')} fill="#2c2438" /><path d={`M-600,${deckY - 150} L${W + 800},${deckY - 150}`} stroke="#ffcf9a" strokeWidth={2} opacity={0.55} /></g>; })()}</Layer>
		<Layer D={INF}><rect x={-600} y={deckY - 4} width={W + 1200} height={H} fill="#4c4258" /><rect x={-600} y={deckY - 4} width={W + 1200} height={6} fill="#ffd3a0" opacity={0.25} /></Layer>
		<FigureSlot x={kx + tr.dx} y={deckY + 30} h={kh} attire="home2026" action="walk" phase={tr.phase} facing={1} rim="#ffd09a" lightDir={175} rimO={1} shadow={{k: 0.1, skew: 1.6, o: 0.35, c: '#1c1626', blur: 2}} />
		<Particles kind="dust" n={40} seed={92} D={[2, 12]} box={[0, 200, 1900, 900]} c="#ffe6c4" o={0.6} size={1} />
		<Layer D={2.2}><rect x={-600} y={deckY + 120} width={W + 1200} height={H} fill="#262036" /><rect x={-600} y={deckY + 120} width={W + 1200} height={8} fill="#ffcf9a" opacity={0.18} />
			{[200, 900, 1600].map((x) => <rect key={x} x={x} y={deckY + 150} width={120} height={8} fill="#d8cfc0" opacity={0.4} />)}</Layer>
	</Stage>;
};

/* ===================================== THE CHANNEL TUNNEL PORTAL ===================================== */
const TP = {hz: 560, K: 1200, focus: 4};
const tpY = (D: number) => TP.hz + TP.K / D;
export const TunnelPortal: React.FC<{t: number; cam: Cam; beat: number}> = ({t, cam, beat}) => {
	const D1 = 12, py = tpY(D1);
	// rails converging on the portal mouth
	const rail = (X: number) => { const pts: P[] = []; for (let D = 1.6; D <= D1; D *= 1.12) pts.push([1060 + X * TP.focus / D, tpY(D)]); pts.push([1060 + X * TP.focus / D1, py]); return pts; };
	return <Stage t={t} cam={cam} atm={{haze: '#5a6a80', density: 0.05, focus: TP.focus, aperture: 1.3, rim: '#d6e2f0', lightDir: 150, grain: 0.065, vignette: 0.6, pp: [1060, TP.hz]}} bg="#141a26">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={TP.hz + 10} stops={[[0, '#0e1422'], [0.45, '#1e2a40'], [0.8, '#3c4c66'], [1, '#6a7890']]} />
			<CloudBands id="tpcb" t={t} top="#121a2a" mid="#26324a" under="#4a5a76" warm="#8c96a8" warmFrom={3} bands={[[140, 30, 91, 0.6], [260, 24, 95, 0.6], [380, 14, 99, 0.55]]} />
		</Layer>
		<Layer D={40}><FPath d={ridge(-400, W + 400, (x) => -(TP.hz - 60 - Math.abs(fbm(x, 500, 60, 101, 3))), TP.hz + 20, 12)} c="#2a3346" /></Layer>
		<Layer D={INF}><defs><linearGradient id="tpgr" gradientUnits="userSpaceOnUse" x1="0" y1={TP.hz} x2="0" y2={H}><stop offset="0" stopColor="#3a4250" /><stop offset="1" stopColor="#151a22" /></linearGradient></defs>
			<rect x={-600} y={TP.hz} width={W + 1200} height={H} fill="url(#tpgr)" />
			{/* ballast bed and rails */}
			{[-260, 260].map((X) => <path key={X} d={poly([...rail(X - 120), ...rail(X + 120).reverse()])} fill="#262a30" />)}
			{[-320, -200, 200, 320].map((X) => <path key={X} d={'M' + rail(X).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} stroke="#9aa6b4" strokeWidth={2.4} fill="none" opacity={0.75} />)}
		</Layer>
		{/* the portal: a concrete headwall cut into the hill, two dark arched bores, the catenary masts */}
		<Layer D={D1}>{(() => { const w = 760, h = 360, x0 = 1060 - w / 2, y0 = py;
			const bore = (cx: number) => `M${f1(cx - 120)},${f1(y0)} L${f1(cx - 120)},${f1(y0 - 150)} A120,120 0 0,1 ${f1(cx + 120)},${f1(y0 - 150)} L${f1(cx + 120)},${f1(y0)} Z`;
			return <g>
				<FPath d={spline([[x0 - 600, y0 + 4], [x0 - 300, y0 - h * 0.7], [x0 + 80, y0 - h - 40], [x0 + w - 40, y0 - h - 60], [x0 + w + 300, y0 - h * 0.8], [x0 + w + 700, y0 + 4]], true)} c="#232c3a" />
				<path d={poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 - h], [x0, y0 - h]])} fill="#5a6270" />
				<path d={poly([[x0 - 10, y0 - h], [x0 + w + 10, y0 - h], [x0 + w + 10, y0 - h - 24], [x0 - 10, y0 - h - 24]])} fill="#6c7482" />
				<path d={bore(1060 - 190) + ' ' + bore(1060 + 190)} fill="#06080c" />
				{[1060 - 190, 1060 + 190].map((cx) => <path key={cx} d={`M${f1(cx - 120)},${f1(y0 - 150)} A120,120 0 0,1 ${f1(cx + 120)},${f1(y0 - 150)}`} stroke="#8a929e" strokeWidth={10} fill="none" />)}
				{[1060 - 190, 1060 + 190].map((cx) => <rect key={'l' + cx} x={cx - 6} y={y0 - 300} width={12} height={8} fill="#ffb060" opacity={0.85} />)}
				<path d={poly([[x0 + w / 2 - 12, y0], [x0 + w / 2 + 12, y0], [x0 + w / 2 + 12, y0 - h], [x0 + w / 2 - 12, y0 - h]])} fill="#4a525e" />
			</g>; })()}</Layer>
		{[7, 9.5].map((D) => <Layer key={'m' + D} D={D}>{(() => { const y = tpY(D), s = TP.focus / D; return <g fill="#1c222c">
			{[1060 - 520 * s, 1060 + 520 * s].map((x) => <path key={x} d={poly([[x - 6 * s, y], [x + 6 * s, y], [x + 5 * s, y - 520 * s], [x - 5 * s, y - 520 * s]])} />)}
			<path d={poly([[1060 - 530 * s, y - 500 * s], [1060 + 530 * s, y - 500 * s], [1060 + 530 * s, y - 488 * s], [1060 - 530 * s, y - 488 * s]])} />
			<path d={`M${f1(1060 - 520 * s)},${f1(y - 430 * s)} L${f1(1060 + 520 * s)},${f1(y - 430 * s)}`} stroke="#2c3440" strokeWidth={2} /></g>; })()}</Layer>)}
		<Layer D={9}><Mist n={5} seed={5} y0={tpY(9) - 60} y1={tpY(9)} t={t} speed={8} o={0.3} c="#8a96aa" w={[500, 1200]} h={[40, 90]} /></Layer>
		{/* floodlight */}
		<Layer D={10}><FPath d={'M1630,640 L1638,330 L1646,330 L1654,640 Z'} c="#1a2028" /><Glow x={1642} y={326} r={90} c="#e8f0ff" o={0.85} /><circle cx={1642} cy={326} r={7} fill="#ffffff" /></Layer>
		<FigureSlot x={460} y={tpY(TP.focus)} h={300} attire="home2026" action="stand" phase={t / 4.2 + 0.6} facing={1} rim="#d6e2f0" lightDir={150} rimO={0.9} shadow={{k: 0.08, skew: -1.6, o: 0.4, c: '#05070a', blur: 2}} />
		{/* the security fence in front of him */}
		<Layer D={3.2}>{(() => { const y = tpY(3.2), d: string[] = []; for (let x = -200; x < 900; x += 220) d.push(poly([[x, y + 4], [x + 7, y + 4], [x + 6, y - 420], [x + 1, y - 420]]));
			let mesh = ''; for (let x = -200; x < 900; x += 22) mesh += `M${x},${y} L${x + 180},${y - 420} M${x + 180},${y} L${x},${y - 420} `;
			return <g><path d={mesh} stroke="#2a3240" strokeWidth={1.4} fill="none" opacity={0.7} /><Shape d={d.join(' ')} fill="#1c222c" /><path d={`M-200,${y - 420} L900,${y - 420} M-200,${y - 210} L900,${y - 210}`} stroke="#1c222c" strokeWidth={5} /></g>; })()}</Layer>
		<RedX t={t} t0={beat * 1} x={1060} y={py - 140} r={240} />
	</Stage>;
};

/** the white cliffs of Dover far ahead on the sea horizon (for the Channel swim): chalk face lit by the low sun, a green cap */
export const FarCliffs = (x0: number, x1: number, hgt: number) => (c: SeaCam) => {
	const y = c.HZ + 1, pts: P[] = [];
	for (let x = x0; x <= x1; x += 14) pts.push([x, y - hgt * (0.55 + 0.45 * cl((x - x0) / 140)) * (0.85 + 0.15 * noise1(x / 60, 5)) * (1 - 0.7 * cl((x - (x1 - 200)) / 200))]);
	const face = 'M' + [[x0, y], ...pts, [x1, y]].map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L') + ' Z';
	const cap = 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L') + ' L' + pts.slice().reverse().map((p) => `${f1(p[0])},${f1(p[1] + hgt * 0.1)}`).join(' L') + ' Z';
	return <g><path d={face} fill="#f6f0e4" /><path d={face} fill="#ffe2b8" opacity={0.35} /><path d={cap} fill="#6e8460" />
		{Array.from({length: 22}, (_, i) => { const x = lerp(x0 + 20, x1 - 40, rnd(i, 7)); return <path key={i} d={`M${f1(x)},${f1(y)} L${f1(x + 3)},${f1(y - hgt * (0.3 + 0.4 * rnd(i, 8)))} L${f1(x + 7)},${f1(y)} Z`} fill="#b4b8c0" opacity={0.45} />; })}
		<rect x={x0 - 40} y={y - hgt * 1.2} width={x1 - x0 + 80} height={hgt * 1.4} fill="#efdcc0" opacity={0.12} /></g>; };

/* ===================================== DOVER · Shakespeare Beach, the white cliffs ===================================== */
const DV = {hz: 520, K: 1400, focus: 4};
const dvY = (D: number) => DV.hz + DV.K / D;
/** the waterline's x at depth D (from the bottom-left foreground to the cliff foot) */
const dvEdge = (D: number) => 1010 - 1050 / D;
/** the chalk cliff: a tall face with vertical gullies, lit warm on its sea-facing side, blue in its folds, a green cap, chalk fall at its foot */
const Cliff: React.FC<{x0: number; top: number; base: number; seed: number; x1?: number}> = ({x0, top, base, seed, x1 = W + 700}) => {
	const fog = useFog(), pts: P[] = [], gul: string[] = [];
	for (let x = x0; x <= x1; x += 18) { const u = cl((x - x0) / 260); pts.push([x, lerp(base - 40, top, Math.pow(u, 0.6)) + fbm(x, 160, 22, seed, 3) + 14 * noise1(x / 40, seed + 3)]); }
	const face = spline([[x0 - 40, base + 10], ...pts, [x1, base + 10]], true);
	for (let i = 0; i < 34; i++) { const x = lerp(x0 + 60, x1 - 60, rnd(i, seed + 1)), yt = pts[Math.min(pts.length - 1, Math.max(0, Math.round((x - x0) / 18)))][1] + 30 + 80 * rnd(i, seed + 6), w = 4 + 26 * Math.pow(rnd(i, seed + 2), 2);
		gul.push(spline([[x - w / 2, yt], [x + (rnd(i, seed + 4) - 0.5) * 30, lerp(yt, base, 0.5)], [x - w * 0.3, base], [x + w * 0.6, base], [x + w / 2 + (rnd(i, seed + 5) - 0.5) * 20, lerp(yt, base, 0.45)], [x + w / 2, yt + 10]], true)); }
	const cap = spline([...pts.map(([x, y]) => [x, y - 6] as P), ...pts.slice().reverse().map(([x, y], i) => [x, y + 22 + 10 * noise1(i * 0.5, seed + 9)] as P)], true);
	const fall = spline([[x0 - 80, base + 12], [x0 + 60, base - 70], [x0 + 400, base - 50], [x1, base - 60], [x1, base + 12]], true);
	return <g>
		<defs><linearGradient id={`cl${seed}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={fog('#fbf2e2')} /><stop offset="0.35" stopColor={fog('#f2e8da')} /><stop offset="1" stopColor={fog('#cfd2d8')} /></linearGradient></defs>
		<path d={face} fill={`url(#cl${seed})`} /><Shape d={gul.slice(0, 17).join(' ')} fill={fog('#a9b4c4')} o={0.45} /><Shape d={gul.slice(17).join(' ')} fill={fog('#c4ccd6')} o={0.4} />
		<path d={'M' + pts.map(([x, y]) => `${f1(x)},${f1(y + 18)}`).join(' L')} stroke={fog('#fff6e4')} strokeWidth={6} fill="none" opacity={0.6} />
		<path d={cap} fill={fog('#6f8a58')} /><path d={fall} fill={fog('#d8d2c6')} />
	</g>; };
export const DoverWide: React.FC<{t: number; cam: Cam; dur: number}> = ({t, cam, dur}) => {
	const kh = 330, tr = karlTravel('walk', t, kh, 0.8), kx = 470 + tr.dx, depth = lerp(0.42, 0.04, sm(t / (dur * 0.95))), wy = dvY(DV.focus), ky = wy + depth * kh;
	return <Stage t={t} cam={cam} atm={{haze: '#c8d4dc', density: 0.035, focus: DV.focus, aperture: 1.4, rim: '#fff0d8', lightDir: 160, grain: 0.055, vignette: 0.45, pp: [700, DV.hz]}} bg="#2a3440">
		<Layer D={INF}><SkyGrad y0={0} y1={DV.hz + 10} stops={[[0, '#3a5270'], [0.4, '#7a92aa'], [0.75, '#c8ccd0'], [1, '#f2e2c8']]} />
			<CloudBands id="dvcb" t={t} top="#5a6e88" mid="#90a0b2" under="#d6d0c8" warm="#f6dcb8" warmFrom={2} drift={6} bands={[[110, 30, 111, 0.5], [220, 26, 115, 0.5], [330, 16, 119, 0.5]]} />
			<Glow x={200} y={DV.hz - 60} r={600} ry={240} c="#fff0d0" o={0.5} /></Layer>
		<Layer D={INF}>{(() => { const gr = useGround(DV.hz, DV.K), sw: string[] = [];
			for (let i = 0; i < 160; i++) { const u = Math.pow(rnd(i, 21), 1.6), y = lerp(DV.hz + 2, H + 40, u), d = y - DV.hz, x = -300 + ((rnd(i, 22) * (W + 600) + t * 12) % (W + 600)), L = d * (1.5 + rnd(i, 23) * 3), th = Math.max(0.6, d * 0.02);
				sw.push(spline(([[x - L / 2, y], [x, y - th], [x + L / 2, y], [x, y - th * 0.35]] as P[]).map(gr), true)); }
			return <g><defs><linearGradient id="dvsea" gradientUnits="userSpaceOnUse" x1="0" y1={DV.hz} x2="0" y2={H}><stop offset="0" stopColor="#d6dcd8" /><stop offset="0.15" stopColor="#8aa4a8" /><stop offset="0.6" stopColor="#4a6a74" /><stop offset="1" stopColor="#24404c" /></linearGradient></defs>
				<rect x={-600} y={DV.hz} width={W + 1200} height={H} fill="url(#dvsea)" /><Shape d={sw.join(' ')} fill="#e6f0ee" o={0.4} /></g>; })()}</Layer>
		<Layer D={22}><Cliff x0={980} top={150} base={dvY(22)} seed={3} /></Layer>
		{/* the shingle: grey-brown pebbles from the cliff foot out to the waterline, which runs in from the left */}
		<Layer D={INF}>{(() => { const gr = useGround(DV.hz, DV.K), edge: P[] = [];
			for (let D = 22; D >= 1.3; D *= 0.84) edge.push([dvEdge(D) + 10 * Math.sin(D), dvY(D)]);
			const beach = spline([...edge, [W + 900, dvY(1.3)], [W + 900, dvY(22)]].map((p) => gr(p as P)), true);
			const peb: string[] = []; for (let i = 0; i < 500; i++) { const D = 1.4 * Math.pow(16, rnd(i, 31)), y = dvY(D), x = 700 + rnd(i, 32) * 1800, r = 22 / D * (0.5 + rnd(i, 33));
				if (x < dvEdge(D) + 20) continue; peb.push(`M${f1(x - r)},${f1(y)} a${f1(r)},${f1(r * 0.55)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r * 0.55)} 0 1,0 ${f1(-2 * r)},0 Z`); }
			const foam = 'M' + edge.map(([x, y]) => gr([x - 10 - 8 * Math.sin(t * 2 + y / 30), y])).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');
			return <g><path d={beach} fill="#8a8072" /><Shape d={peb.join(' ')} fill="#a89e8e" o={0.6} /><Shape d={peb.slice(0, 250).join(' ')} fill="#5a544c" o={0.35} />
				<path d={foam} stroke="#f4f6f2" strokeWidth={5} fill="none" opacity={0.85} /></g>; })()}</Layer>
		<Layer D={9}>{(() => { const y = dvY(9) - 4, s = DV.focus / 9, wave = Math.sin(t * 5) * 0.5 + 0.5;
			return <FPath d={personD(1330, y, 180 * s * 0.88, 3, 0) + ' ' + personD(1372, y, 180 * s, 7, wave > 0.3 ? 1 : 0) + ' ' + personD(1420, y, 180 * s * 0.95, 11, 0) + ' ' + personD(1452, y, 130 * s, 13, 0)} c="#2a2a30" />; })()}</Layer>
		<Wader x={kx} y={ky} h={kh} wy={wy} attire="swim" phase={tr.phase} t={t} rim="#fff0d8" lightDir={165} rimO={1} foam="#f6f8f4" tint="#2a4a54" drip={1} />
		<Particles kind="spray" n={30} seed={101} D={[2, 6]} box={[300, 700, 1200, 900]} c="#f4f8f6" o={0.4} />
		<Layer D={1.6} blur={4}><path d={`M-400,${f1(dvY(1.6))} ${Array.from({length: 14}, (_, k) => { const x = -400 + k * 200; return `Q${x + 100},${f1(dvY(1.6) - 20 - 10 * Math.sin(k * 1.3 + t * 1.6))} ${x + 200},${f1(dvY(1.6) + 5 * Math.sin(k + t))}`; }).join(' ')} L${W + 400},${H + 300} L-400,${H + 300} Z`} fill="#1e3640" /></Layer>
	</Stage>;
};
/** he stands on the shingle and looks up at the cliffs; his family waits up the beach */
export const DoverStand: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
	const D0 = 4, kh = 560, y0 = 600, K = (940 - y0) * D0, gy = (D: number) => y0 + K / D;
	return <Stage t={t} cam={cam} atm={{haze: '#c4d0da', density: 0.03, focus: D0, aperture: 2.0, rim: '#fff0d8', lightDir: 160, grain: 0.055, vignette: 0.45, pp: [1000, y0]}} bg="#2a3440">
		<Layer D={INF}><SkyGrad y0={0} y1={y0 + 10} stops={[[0, '#2c405e'], [0.4, '#6a84a0'], [0.8, '#c4c8cc'], [1, '#f0e2ca']]} />
			<CloudBands id="dscb" t={t} top="#4a5e7a" mid="#8094aa" under="#d0ccc6" warm="#f4dcb8" warmFrom={2} drift={5} bands={[[100, 30, 121, 0.45], [210, 22, 125, 0.45], [330, 14, 129, 0.45]]} />
			<Glow x={120} y={y0 - 120} r={700} ry={300} c="#fff0d0" o={0.45} /></Layer>
		<Layer D={22}><Cliff x0={820} top={170} base={gy(22)} seed={7} /></Layer>
		<Layer D={INF}>{(() => { const gr = useGround(y0, K); return <g>
			<defs><linearGradient id="dssea" gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={H}><stop offset="0" stopColor="#c8d4d4" /><stop offset="0.3" stopColor="#6e8e96" /><stop offset="1" stopColor="#2e4a56" /></linearGradient>
				<linearGradient id="dssh" gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={H}><stop offset="0" stopColor="#a49888" /><stop offset="0.4" stopColor="#8a7e70" /><stop offset="1" stopColor="#5e564c" /></linearGradient></defs>
			<rect x={-600} y={y0} width={W + 1200} height={H} fill="url(#dssea)" />
			<path d={spline(([[300, y0 + 1], [180, gy(10)], [40, gy(4)], [-200, gy(2)], [-400, gy(1.2)], [W + 600, gy(1.2)], [W + 600, y0 + 1]] as P[]).map(gr), true)} fill="url(#dssh)" />
			<path d={spline(([[300, y0 + 1], [180, gy(10)], [40, gy(4)], [-200, gy(2)], [-400, gy(1.2)]] as P[]).map(([x, y]) => gr([x - 6 + 5 * Math.sin(t * 2 + y / 30), y])), false)} stroke="#f4f6f2" strokeWidth={4} fill="none" opacity={0.85} /></g>; })()}</Layer>
		<Layer D={7}>{(() => { const y = gy(7) - 2, s = D0 / 7, wave = Math.sin(t * 5) * 0.5 + 0.5;
			return <FPath d={personD(1230, y, 180 * s * 0.88, 3, 0) + ' ' + personD(1282, y, 180 * s, 7, wave > 0.35 ? 1 : -1) + ' ' + personD(1340, y, 180 * s * 0.95, 11, 0) + ' ' + personD(1382, y, 125 * s, 13, 0) + ' ' + personD(1450, y, 175 * s, 17, 1)} c="#26262c" />; })()}</Layer>
		<Layer D={INF}>{(() => { const peb: string[] = []; for (let i = 0; i < 700; i++) { const D = 1.2 * Math.pow(12, rnd(i, 41)), y = gy(D), x = -200 + rnd(i, 42) * 2400, r = 26 / D * (0.5 + rnd(i, 43));
				if (x < 300 - 1400 / D * 0.6) continue; peb.push(`M${f1(x - r)},${f1(y)} a${f1(r)},${f1(r * 0.55)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r * 0.55)} 0 1,0 ${f1(-2 * r)},0 Z`); }
			return <g><Shape d={peb.join(' ')} fill="#c0b6a6" o={0.5} /><Shape d={peb.slice(0, 350).join(' ')} fill="#4a443c" o={0.4} /></g>; })()}</Layer>
		<FigureSlot x={640} y={gy(D0)} h={kh} attire="swim" action="lookUp" phase={t / 4.2 + 0.1} facing={1} rim="#fff0d8" lightDir={165} rimO={1} shadow={{k: 0.1, skew: 1.4, o: 0.35, c: '#2a2420', blur: 3}} />
		<Layer D={D0}>{Array.from({length: 12}, (_, i) => { const a = ((t * (0.9 + rnd(i, 4) * 0.5) + rnd(i, 5)) % 1), px = 640 + (rnd(i, 6) - 0.4) * 0.22 * kh, py = lerp(gy(D0) - kh * (0.35 + 0.5 * rnd(i, 7)), gy(D0), a * a);
			return <ellipse key={i} cx={px} cy={py} rx={1.8} ry={4} fill="#eef4f6" opacity={f1(0.8 * (1 - a))} />; })}</Layer>
		<Layer D={1.5} blur={6}>{(() => { const peb: string[] = []; for (let i = 0; i < 36; i++) { const x = rnd(i, 51) * 2200 - 100, y = 1020 + rnd(i, 52) * 140, r = 30 + 40 * rnd(i, 53); peb.push(blobD(x, y, r, r * 0.6, i, 8, 0.15)); }
			return <Shape d={peb.join(' ')} fill="#3e3934" />; })()}</Layer>
	</Stage>;
};

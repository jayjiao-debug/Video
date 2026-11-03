import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Rimmed, gaitPose, Look4} from '../qq44/figure44';
import {gaitStride} from '../qq44/figure44';
/* ep57 prototype (owner 09:03: "still PPT; scrap and create the scenes anew with dynamic parts"):
   斗兽场 「新皇帝把湖填了，建起斗兽场，还给罗马人民」 — built for motion, in the ep44 way: a layered set, a camera that cranes up
   through it with parallax, mocap-walking Romans streaming to the arches, a family crossing close to camera, flags, clouds.
   5.016 s = 3 bars at 143.6 BPM (t = 0 is a downbeat; beat 0.418 s). */
const W = 1920, H = 1080, FPS = 30, DUR = 5.016, BEAT = 0.418;
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const rnd = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
const INK = '#2A211B';
/* the camera: starts low among the crowd, cranes up and trucks right; each layer moves by its depth z (0 far … 1 near) */
const camAt = (t: number) => { const u = eio(t / DUR); return {x: lerp(-60, 90, u), y: lerp(330, 0, u), z: lerp(1.16, 1.0, u)}; };
const Layer: React.FC<{t: number; z: number; children: React.ReactNode}> = ({t, z, children}) => {
	const c = camAt(t), s = 1 + (c.z - 1) * (0.4 + z);
	return <g transform={`translate(${W / 2},${H / 2}) scale(${s}) translate(${-W / 2 - c.x * z},${-H / 2 + c.y * z})`}>{children}</g>; };

/* the amphitheatre: an elliptical façade, three arcades + attic, seen from the front-left */
const CX = 1020, BASE = 700, A = 820, TIERS = [[BASE - 92, BASE], [BASE - 178, BASE - 92], [BASE - 262, BASE - 178]], ATTIC = [BASE - 318, BASE - 262];
const Colosseum: React.FC<{t: number}> = ({t}) => {
	const N = 34, th = (i: number) => -78 + 156 * i / (N - 1), xs = (d: number) => CX + A * Math.sin(d * Math.PI / 180);
	const dyA = (d: number) => 46 * Math.cos(d * Math.PI / 180) - 46;   // depth: the middle is nearer (lower), the ends recede
	const arcPath = (y: number) => Array.from({length: 41}, (_, j) => { const d = -80 + 4 * j; return `${j ? 'L' : 'M'}${xs(d).toFixed(1)},${(y + dyA(d)).toFixed(1)}`; }).join(' ');
	const out: React.ReactNode[] = [];
	const top = arcPath(ATTIC[0]), bot = Array.from({length: 41}, (_, j) => { const d = 80 - 4 * j; return `L${xs(d).toFixed(1)},${(BASE + dyA(d)).toFixed(1)}`; }).join(' ');
	out.push(<path key="wall" d={`${top} ${bot} Z`} fill="#E9DCC0" stroke={INK} strokeWidth={4} />);
	for (const [y0] of [...TIERS, ATTIC]) out.push(<path key={`b${y0}`} d={arcPath(y0)} fill="none" stroke={INK} strokeWidth={3} />);
	for (let i = 0; i < N - 1; i++) {
		const a = xs(th(i)), b = xs(th(i + 1)), w = b - a, dy = dyA((th(i) + th(i + 1)) / 2), shade = 0.18 * (1 - Math.cos((th(i) + 6) * Math.PI / 180)) + (th(i) > 30 ? .08 : 0);
		out.push(<rect key={`s${i}`} x={a} y={ATTIC[0] + dy} width={w} height={BASE - ATTIC[0]} fill="#6B5A48" opacity={shade} />);
		out.push(<g key={`c${i}`} transform={`translate(0,${dy})`}>{TIERS.map(([y0, y1], k) => {
			const aw = w * .62, ax = a + (w - aw) / 2, top = y0 + (y1 - y0) * .18, r = aw / 2;
			return <g key={k}><path d={`M${ax},${y1} L${ax},${top + r} A${r},${r} 0 0 1 ${ax + aw},${top + r} L${ax + aw},${y1} Z`} fill={k === 0 ? '#3E3128' : '#5A4A3C'} stroke={INK} strokeWidth={2} />
				<line x1={a} y1={y0 + 4} x2={a} y2={y1} stroke={INK} strokeWidth={2} opacity={.5} /></g>;
		})}</g>);
		if (i % 2 === 0) out.push(<rect key={`w${i}`} x={a + w * .35} y={ATTIC[0] + 18 + dy} width={w * .3} height={20} fill="#5A4A3C" stroke={INK} strokeWidth={1.5} />);
		if (i % 3 === 1) {   // masts with streaming pennants (they snap harder on each beat)
			const mx = a + w / 2, my = ATTIC[0] + dy, ph = t * 9 + i, kick = 1 + .5 * Math.exp(-((t % BEAT) / .12));
			const fl = (u: number) => `${mx + 70 * u},${my - 70 + 10 * Math.sin(ph - u * 4) * kick * u}`;
			out.push(<line key={`m${i}`} x1={mx} y1={my} x2={mx} y2={my - 82} stroke={INK} strokeWidth={3} />);
			out.push(<polygon key={`f${i}`} points={`${mx},${my - 82} ${fl(1)} ${mx + 35},${my - 62 + 5 * Math.sin(ph - 2) * kick} ${mx},${my - 56}`} fill={i % 2 ? '#B8322A' : '#F4EEE2'} stroke={INK} strokeWidth={2} />);
		}
	}
	// the velarium shadow line and a warm sun rim on the left face
	out.push(<path key="rim" d={`M${xs(-80)},${ATTIC[0]} L${xs(-80)},${BASE}`} stroke="#FFE7B0" strokeWidth={10} opacity={.5} />);
	return <g>{out}</g>;
};
/* the crowd: Romans walking on the plaza toward the ground-floor arches; size by depth (perspective) */
const HORIZON = 640;
const LOOKS: Look4[] = [{dress: 'tunic', head: 'short'}, {dress: 'himation', head: 'bald', beard: 'short'}, {dress: 'dress', head: 'bun'}, {dress: 'tunic', head: 'cap'},
	{dress: 'cloak', head: 'short', beard: 'full'}, {dress: 'himation', head: 'bun'}, {dress: 'tunic', head: 'child'}, {dress: 'robe', head: 'long'}];
const COLS = ['#3B2E2A', '#4A3328', '#2F2A33', '#553A2A', '#3A3A2E'];
type Walker = {x0: number; y0: number; x1: number; y1: number; t0: number; sp: number; look: Look4; col: string; g: '08_04' | '08_01' | '08_11'};
const WALKERS: Walker[] = Array.from({length: 46}, (_, i) => {
	const side = i % 2 ? 1 : -1, y0 = 760 + 300 * rnd(i + 3), x0 = CX + side * (520 + 700 * rnd(i + 9)), gate = CX + A * Math.sin((-60 + 120 * rnd(i + 21)) * Math.PI / 180);
	return {x0, y0, x1: gate, y1: BASE + 6 + 46 * Math.cos(Math.asin(Math.max(-1, Math.min(1, (gate - CX) / A)))) - 46, t0: -6 * rnd(i + 5), sp: .085 + .05 * rnd(i + 7), look: LOOKS[i % LOOKS.length], col: COLS[i % COLS.length], g: (['08_04', '08_01', '08_11'] as const)[i % 3]};
});
const Crowd: React.FC<{t: number}> = ({t}) => {
	const items = WALKERS.map((w, i) => {
		const u = (t - w.t0) * w.sp; if (u < 0 || u > 1) return null;
		const x = lerp(w.x0, w.x1, u), y = lerp(w.y0, w.y1, u), k = (y - HORIZON) / (1080 - HORIZON), h = 40 + 330 * k * k;
		const dist = Math.hypot(w.x1 - w.x0, w.y1 - w.y0) * w.sp * h / 300;
		const ph = (t * w.sp * Math.hypot(w.x1 - w.x0, w.y1 - w.y0)) / (gaitStride(w.g) * h * 1.6) + rnd(i);
		const fade = cl((1 - u) / .06);   // vanish into the dark arch
		return {y, el: <g key={i} opacity={fade}><Rimmed x={x} ground={y} h={h} pose={gaitPose(w.g, ph)} look={w.look} col={w.col} flip={w.x1 < w.x0} rim="#ffd9a0" rimOp={.45} /></g>};
	}).filter(Boolean) as {y: number; el: React.ReactNode}[];
	return <g>{items.sort((a, b) => a.y - b.y).map((o) => o.el)}</g>;
};
/* the family walking across close to the camera (strong parallax), right to left */
const Family: React.FC<{t: number}> = ({t}) => {
	const fam: [number, Look4, number, string][] = [[0, {dress: 'himation', head: 'short', beard: 'short', build: 1.05}, 640, '#2A221E'],
		[150, {dress: 'dress', head: 'bun'}, 600, '#33251F'], [280, {dress: 'tunic', head: 'child'}, 380, '#2C2622']];
	return <g>{fam.map(([dx, look, h, col], i) => { const x = 2200 - 520 * t + dx, ph = (520 * t) / (gaitStride('08_04') * h * 1.6) + i * .3;
		return <Rimmed key={i} x={x} ground={1180} h={h} pose={gaitPose('08_04', ph)} look={look} col={col} flip rim="#ffd9a0" rimOp={.55} />; })}</g>;
};
const Scene: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const clouds = [0, 1, 2, 3].map((i) => { const x = ((i * 600 + t * (22 + 8 * i)) % 2600) - 300, y = 120 + 60 * (i % 2);
		return <g key={i} opacity={.9}><ellipse cx={x} cy={y} rx={150} ry={42} fill="#FFFFFF" /><ellipse cx={x + 90} cy={y - 22} rx={90} ry={40} fill="#FFFFFF" /><ellipse cx={x - 90} cy={y - 10} rx={80} ry={34} fill="#FFFFFF" /></g>; });
	const birds = [0, 1, 2].map((i) => { const x = -100 + t * 260 + i * 60, y = 230 + i * 18 + 8 * Math.sin(t * 5 + i), w = 9 * Math.sin(t * 13 + i);
		return <path key={i} d={`M${x - 15},${y - w} Q${x - 7},${y - 6} ${x},${y} Q${x + 7},${y - 6} ${x + 15},${y - w}`} stroke={INK} strokeWidth={3} fill="none" />; });
	return <AbsoluteFill style={{background: '#9BC4E8'}}>
		<svg width={W} height={H}>
			<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E9AD6" /><stop offset=".7" stopColor="#BFD9EE" /><stop offset="1" stopColor="#F2E6CF" /></linearGradient>
				<linearGradient id="plaza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9C7A4" /><stop offset="1" stopColor="#B99C74" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#sky)" />
			<Layer t={t} z={.05}>{clouds}{birds}</Layer>
			<Layer t={t} z={.2}><path d="M-400,640 C0,560 300,600 700,570 C1100,540 1500,600 2400,560 L2400,760 L-400,760 Z" fill="#8FA86A" stroke={INK} strokeWidth={3} />
				{[-200, 80, 260, 1580, 1760, 2050].map((x, i) => <path key={i} d={`M${x},${600} C${x - 22},${520} ${x - 8},${450} ${x},${420} C${x + 8},${450} ${x + 22},${520} ${x},${600} Z`} fill="#3F5A33" stroke={INK} strokeWidth={2.5} />)}</Layer>
			<Layer t={t} z={.45}><Colosseum t={t} /></Layer>
			<Layer t={t} z={.6}><rect x={-600} y={BASE} width={3200} height={900} fill="url(#plaza)" />
				{Array.from({length: 22}, (_, i) => { const x = -900 + i * 180; return <line key={i} x1={CX + (x - CX) * .12} y1={BASE} x2={x} y2={1700} stroke="#A8895F" strokeWidth={2} opacity={.6} />; })}
				<Crowd t={t} /></Layer>
			<Layer t={t} z={1.0}><Family t={t} />
				<path d={`M-80,1400 L-80,300 L60,300 L60,1400 Z`} fill="#CDBB98" stroke={INK} strokeWidth={4} transform={`translate(${-40 + 0},0)`} />
			</Layer>
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="P57COLO" component={Scene} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={W} height={H} />);

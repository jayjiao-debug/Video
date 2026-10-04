import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import land50 from 'world-atlas/land-50m.json';
import {Liquid} from '../../src/art/glow/Liquid';
import {GlowDefs} from '../../src/art/glow/kit';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/**
 * v3 look, re-drawn on the craft rules of the reference (《微醺》):
 *  - one soft light source per shot, everything else near-silhouette, dark and low-saturation;
 *    each section changes hue, never the lighting philosophy;
 *  - thin, elegant line weights; detail comes from many small procedural elements
 *    (stalks, leaves, motes) varying in size, opacity and blur, i.e. depth;
 *  - the hero material is light: liquid shader, embers, glow; no flat cartoon fills;
 *  - lots of negative space, small serif/caps labels, bloom + haze + grain on top.
 */

const W = 1920;
const H = 1080;

/** depth-of-field motes: a few big soft ones in front, many fine ones behind */
const Haze: React.FC<{seed: string; n?: number; color?: string; y0?: number; y1?: number; f?: number}> = ({seed, n = 70, color = '#ffd9a0', y0 = 0, y1 = H, f = 0}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const near = random(`${seed}n${i}`) > 0.85;
			const r = near ? 10 + random(`${seed}r${i}`) * 26 : 1 + random(`${seed}r${i}`) * 2.6;
			const x = random(`${seed}x${i}`) * W + 20 * noise2D(seed, i, f / 200);
			const y = y0 + random(`${seed}y${i}`) * (y1 - y0) - (f * (0.2 + random(`${seed}v${i}`) * 0.5)) % 80;
			return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={near ? 0.08 : 0.25 + 0.5 * random(`${seed}o${i}`)} filter={near ? 'url(#b8)' : undefined} />;
		})}
	</g>
);

const Grade: React.FC<{vig?: number; grain?: number}> = ({vig = 0.9, grain = 0.05}) => (
	<g pointerEvents="none">
		<rect width={W} height={H} fill="url(#vig3)" opacity={vig} />
		<rect width={W} height={H} filter="url(#grain)" opacity={grain} style={{mixBlendMode: 'overlay'}} />
	</g>
);

const Sub: React.FC<{text: string; hl?: string}> = ({text, hl}) => {
	const [a, b] = hl ? text.split(hl) : [text, ''];
	return (
		<text x={960} y={1006} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: '#f3ead8', letterSpacing: '0.04em'}}>
			{a}
			{hl ? <tspan fill="#f2b45a">{hl}</tspan> : null}
			{b}
		</text>
	);
};

const Tag: React.FC<{en: string; zh: string; x?: number; y?: number}> = ({en, zh, x = 150, y = 120}) => (
	<g>
		<text x={x} y={y} style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.32em', fill: '#c99a5a'}} opacity={0.7}>
			{en.toUpperCase()}
		</text>
		<text x={x} y={y + 28} style={{fontFamily: font.sans, fontSize: 19, letterSpacing: '0.14em', fill: '#efe4d0'}} opacity={0.6}>
			{zh}
		</text>
	</g>
);

// ---------------------------------------------------------------- 1. the heartbeat on the liquid

const Heartbeat: React.FC<{f: number}> = ({f}) => {
	// a real PQRST trace; the newest beat is the tall one (the "revival")
	const beat = (u: number, k: number) => {
		const p = 0.08 * Math.exp(-(((u - 0.18) / 0.035) ** 2));
		const q = -0.1 * Math.exp(-(((u - 0.3) / 0.012) ** 2));
		const r = k * Math.exp(-(((u - 0.33) / 0.012) ** 2));
		const s = -0.22 * Math.exp(-(((u - 0.36) / 0.014) ** 2));
		const t = 0.16 * Math.exp(-(((u - 0.58) / 0.06) ** 2));
		return p + q + r + s + t;
	};
	const head = 1500;
	const per = 330;
	let d = '';
	for (let x = 120; x <= head; x += 2) {
		const n = Math.floor((head - x) / per);
		const u = 1 - ((head - x) % per) / per;
		const k = n === 0 ? 1.35 : n === 1 ? 0.9 : n === 2 ? 0.55 : 0; // older beats smaller: the line came back to life
		d += `${d ? 'L' : 'M'}${x},${540 - beat(u, k) * 300} `;
	}
	return (
		<g>
			<defs>
				<linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset="0.5" stopColor="#000" stopOpacity="0.78" />
					<stop offset="1" stopColor="#000" stopOpacity="0" />
				</linearGradient>
				<linearGradient id="trail" x1="120" y1="0" x2={head} y2="0" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#ffe7b8" stopOpacity="0" />
					<stop offset="0.55" stopColor="#ffe7b8" stopOpacity="0.45" />
					<stop offset="1" stopColor="#fff6e0" stopOpacity="1" />
				</linearGradient>
			</defs>
			<rect width={W} height={H} fill="#000" opacity={0.35} />
			<rect x={0} y={240} width={W} height={600} fill="url(#band)" />
			{/* the faintest monitor grid, only near the trace */}
			<g opacity={0.07} stroke="#ffe0b0" strokeWidth={1}>
				{Array.from({length: 40}, (_, i) => <line key={`v${i}`} x1={i * 48} y1={300} x2={i * 48} y2={780} />)}
				{Array.from({length: 11}, (_, i) => <line key={`h${i}`} x1={0} y1={300 + i * 48} x2={W} y2={300 + i * 48} />)}
			</g>
			<path d={d} fill="none" stroke="url(#trail)" strokeWidth={9} opacity={0.5} filter="url(#b8)" />
			<path d={d} fill="none" stroke="url(#trail)" strokeWidth={2.6} strokeLinejoin="round" />
			<circle cx={head} cy={540} r={60} fill="url(#ember)" />
			<circle cx={head} cy={540} r={5} fill="#fff" />
			<text x={1770} y={150} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 64, fill: '#ffe7b8'}} opacity={0.9}>
				72
			</text>
			<text x={1770} y={180} textAnchor="end" style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.4em', fill: '#c99a5a'}}>
				BPM
			</text>
			<Sub text="你管它叫——续命。" hl="续命" />
		</g>
	);
};

// ---------------------------------------------------------------- 2. the synapse, adenosine in the dark

const Synapse: React.FC<{f: number}> = ({f}) => {
	const rx = [560, 960, 1360];
	const cup = (x: number, glow: number, filled: boolean) => (
		<g key={x} transform={`translate(${x},770)`}>
			<ellipse cx={0} cy={-40} rx={150} ry={110} fill="url(#cyan-soft)" opacity={0.5 + 0.5 * glow} />
			{/* the receptor: two thin walls of a cup, open at the top */}
			<path d="M-74,-96 C-70,-30 -52,10 -30,24 M74,-96 C70,-30 52,10 30,24" fill="none" stroke="#9fe8f0" strokeWidth={2.2} opacity={0.9} />
			<path d="M-86,-92 C-82,-20 -62,26 -34,40 L34,40 C62,26 82,-20 86,-92" fill="none" stroke="#9fe8f0" strokeWidth={1.2} opacity={0.35} />
			<path d="M-30,24 Q0,34 30,24" fill="none" stroke="#9fe8f0" strokeWidth={2.2} opacity={0.9} />
			{filled ? (
				<g>
					<circle cx={0} cy={-26} r={46} fill="url(#ember)" />
					<circle cx={0} cy={-26} r={9} fill="#fff4d8" />
				</g>
			) : null}
		</g>
	);
	return (
		<g>
			<defs>
				<radialGradient id="indigo-pool" cx="50%" cy="38%" r="60%">
					<stop offset="0" stopColor="#2a2366" />
					<stop offset="0.55" stopColor="#100c2c" />
					<stop offset="1" stopColor="#05040e" />
				</radialGradient>
				<radialGradient id="cyan-soft" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#5fd8e6" stopOpacity="0.35" />
					<stop offset="1" stopColor="#5fd8e6" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#9fe8f0" stopOpacity="0.16" />
					<stop offset="1" stopColor="#9fe8f0" stopOpacity="0" />
				</linearGradient>
			</defs>
			<rect width={W} height={H} fill="url(#indigo-pool)" />
			{/* the sending side: a membrane arc above, vesicles inside it */}
			<path d="M-40,250 C420,150 1500,150 1960,250 L1960,-40 L-40,-40 Z" fill="#9fe8f0" opacity={0.05} />
			<path d="M-40,250 C420,150 1500,150 1960,250" fill="none" stroke="#9fe8f0" strokeWidth={1.6} opacity={0.6} />
			{Array.from({length: 9}, (_, i) => (
				<circle key={i} cx={260 + i * 175 + 30 * Math.sin(i)} cy={150 - 40 * Math.sin((i / 8) * Math.PI)} r={26 + 8 * random(`ves${i}`)} fill="none" stroke="#9fe8f0" strokeWidth={1.2} opacity={0.35} />
			))}
			{/* the receiving side */}
			<path d="M-40,790 C420,860 1500,860 1960,790 L1960,1120 L-40,1120 Z" fill="url(#mem)" transform="scale(1,-1) translate(0,-1660)" />
			<path d="M-40,790 C420,860 1500,860 1960,790" fill="none" stroke="#9fe8f0" strokeWidth={1.6} opacity={0.6} />
			{rx.map((x, i) => cup(x, i === 0 ? 1 : 0.3, i === 0))}
			{/* adenosine drifting down through the cleft: depth of field */}
			{Array.from({length: 90}, (_, i) => {
				const z = random(`az${i}`);
				const x = random(`ax${i}`) * W + 30 * noise2D('ad', i, f / 150);
				const y = 280 + random(`ay${i}`) * 420 + 20 * noise2D('ady', i, f / 170);
				const far = z < 0.75;
				const r = far ? 2 + 3 * z : 14 + 20 * (z - 0.75) * 4;
				return (
					<g key={i} opacity={far ? 0.55 + 0.45 * z : 0.22}>
						<circle cx={x} cy={y} r={r * 2.2} fill="url(#ember)" opacity={far ? 0.5 : 0.3} filter={far ? undefined : 'url(#b8)'} />
						<circle cx={x} cy={y} r={r * 0.5} fill="#ffe2a8" filter={far ? undefined : 'url(#b8)'} />
					</g>
				);
			})}
			<Tag en="Adenosine · synaptic cleft" zh="腺苷 · 神经突触间隙" />
			<Sub text="它一点点落进受体，你就一点点困下去。" />
		</g>
	);
};

// ---------------------------------------------------------------- 3. the hillside in bloom, backlit at dawn

const Bloom: React.FC<{f: number}> = ({f}) => {
	const ridgeD = (base: number, amp: number, seed: string) => {
		let d = `M-40,${H + 40} `;
		for (let x = -40; x <= W + 40; x += 12) d += `L${x},${base - amp * (0.5 + 0.5 * noise2D(seed, x / 700, 0))} `;
		return d + `L${W + 40},${H + 40} Z`;
	};
	// a shrub: a few thin stems, many small leaves, white blossoms along the stems catching the light
	const shrub = (x: number, y: number, s: number, seed: string, o: number) => (
		<g key={seed} transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
			{Array.from({length: 6}, (_, k) => {
				const a = -Math.PI / 2 + (k - 2.5) * 0.28 + (random(`${seed}a${k}`) - 0.5) * 0.2;
				const len = 120 + random(`${seed}l${k}`) * 90;
				const sway = 0.03 * Math.sin(f / 40 + k + x);
				const ex = Math.cos(a + sway) * len;
				const ey = Math.sin(a + sway) * len;
				return (
					<g key={k}>
						<path d={`M0,0 Q${ex * 0.4},${ey * 0.6} ${ex},${ey}`} stroke="#120a05" strokeWidth={2.4} fill="none" />
						{Array.from({length: 7}, (_, j) => {
							const u = (j + 1) / 8;
							const px = ex * u + (j % 2 ? 9 : -9);
							const py = ey * u;
							return (
								<g key={j}>
									<ellipse cx={px} cy={py} rx={13} ry={4.5} transform={`rotate(${(j % 2 ? 30 : -30) + (a * 180) / Math.PI + 90},${px},${py})`} fill="#140b05" />
									{random(`${seed}b${k}${j}`) > 0.55 ? (
										<g>
											<circle cx={px + (j % 2 ? -4 : 4)} cy={py + 2} r={7} fill="#fff1d0" opacity={0.22} />
											<circle cx={px + (j % 2 ? -4 : 4)} cy={py + 2} r={3.6} fill="#fffaf0" />
										</g>
									) : null}
								</g>
							);
						})}
					</g>
				);
			})}
		</g>
	);
	return (
		<g>
			<defs>
				<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#140c08" />
					<stop offset="0.3" stopColor="#5a3418" />
					<stop offset="0.5" stopColor="#e8b06a" />
					<stop offset="0.58" stopColor="#fff2d6" />
					<stop offset="1" stopColor="#2a160a" />
				</linearGradient>
			</defs>
			<rect width={W} height={H} fill="url(#dawn)" />
			<circle cx={1060} cy={600} r={700} fill="url(#ember)" opacity={0.8} />
			<circle cx={1060} cy={600} r={120} fill="#fffaf0" opacity={0.95} filter="url(#b8)" />
			<path d={ridgeD(610, 80, 'r1')} fill="#7a4a24" opacity={0.5} />
			<path d={ridgeD(660, 100, 'r2')} fill="#3a2010" opacity={0.85} />
			{/* rows of shrubs, back to front, smaller and fainter in the distance */}
			{Array.from({length: 3}, (_, row) =>
				Array.from({length: 13 - row * 3}, (_, i) => {
					const s = 0.55 + row * 0.33;
					const x = -60 + i * (W / (12 - row * 3)) + random(`sx${row}${i}`) * 60;
					const y = 720 + row * 95;
					return shrub(x, y, s, `s${row}${i}`, 0.65 + row * 0.18);
				}),
			)}
			<rect y={880} width={W} height={200} fill="#000" opacity={0.55} filter="url(#b8)" />
			{/* petals and pollen in the low sun */}
			<Haze seed="pet" n={110} color="#fff4e0" y0={300} y1={1000} f={f} />
			<Tag en="Coffea arabica · in bloom" zh="咖啡花 · 只开三四天" />
			<Sub text="旱季后的第一场雨，整座山的咖啡树几乎同时开花。" hl="几乎同时开花" />
		</g>
	);
};

// ---------------------------------------------------------------- 4. the routes, on a dark map

const LAND = feature(land50 as never, (land50 as never as {objects: {land: never}}).objects.land) as never;
const CITIES: {n: string; y: string; p: [number, number]; dx?: number; dy?: number; a?: 'end'}[] = [
	{n: '摩卡', y: '也门', p: [43.25, 13.3], dx: 18, dy: 34},
	{n: '奇克马加卢尔', y: '1670 · 七颗种子', p: [75.77, 13.32], dx: 18, dy: 34},
	{n: '阿姆斯特丹', y: '1706', p: [4.9, 52.37], dx: -18, dy: -14, a: 'end'},
	{n: '巴黎', y: '1714', p: [2.35, 48.86], dx: -18, dy: 30, a: 'end'},
	{n: '马提尼克', y: '1723', p: [-61.02, 14.64], dx: -18, dy: -14, a: 'end'},
];
const MapRoutes: React.FC = () => {
	const proj = geoNaturalEarth1().scale(420).translate([1060, 620]).rotate([-10, 0]);
	const path = geoPath(proj);
	const xy = (p: [number, number]) => proj(p) as [number, number];
	const arc = (a: [number, number], b: [number, number]) => {
		const ip = geoInterpolate(a, b);
		return path({type: 'LineString', coordinates: Array.from({length: 60}, (_, k) => ip(k / 59))}) ?? '';
	};
	const legs: [number, number][] = [
		[0, 1],
		[0, 2],
		[2, 3],
		[3, 4],
	];
	return (
		<g>
			<rect width={W} height={H} fill="#07080c" />
			<circle cx={1000} cy={560} r={900} fill="url(#warm-pool)" opacity={0.55} />
			<path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#c99a5a" strokeWidth={0.6} opacity={0.12} />
			<path d={path(LAND) ?? ''} fill="#1a140f" stroke="#7a5a3a" strokeWidth={0.9} opacity={0.95} />
			{legs.map(([a, b], i) => (
				<g key={i}>
					<path d={arc(CITIES[a].p, CITIES[b].p)} fill="none" stroke="#f2b45a" strokeWidth={8} opacity={0.25} filter="url(#b8)" />
					<path d={arc(CITIES[a].p, CITIES[b].p)} fill="none" stroke="#ffd896" strokeWidth={2} />
				</g>
			))}
			{/* from Martinique the line branches out over half the Americas */}
			{[
				[-75, 4],
				[-47, -15],
				[-84, 10],
				[-66, 8],
				[-90, 15],
				[-77, 18],
			].map((p, i) => (
				<path key={i} d={arc(CITIES[4].p, p as [number, number])} fill="none" stroke="#ffd896" strokeWidth={1.4} opacity={0.7} />
			))}
			{CITIES.map((c) => {
				const [x, y] = xy(c.p);
				return (
					<g key={c.n}>
						<circle cx={x} cy={y} r={34} fill="url(#ember)" />
						<circle cx={x} cy={y} r={4} fill="#fff" />
						<text x={x + (c.dx ?? 18)} y={y + (c.dy ?? 0)} textAnchor={c.a ?? 'start'} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 26, fill: '#f3ead8'}}>
							{c.n}
						</text>
						<text x={x + (c.dx ?? 18)} y={y + (c.dy ?? 0) + 24} textAnchor={c.a ?? 'start'} style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.2em', fill: '#c99a5a'}}>
							{c.y}
						</text>
					</g>
				);
			})}
			<Tag en="The smuggled seeds" zh="被偷偷带走的种子" />
			<Sub text="一棵送给法国国王的咖啡树，后代漂洋过海，长满了半个美洲。" hl="长满了半个美洲" />
		</g>
	);
};

// ---------------------------------------------------------------- sheet

export const LOOK3_N = 4;

export const XumingLook3: React.FC = () => {
	loadEpisodeFonts('xuming');
	const i = useCurrentFrame();
	const f = 120;
	return (
		<AbsoluteFill style={{background: '#07060a'}}>
			{i === 0 ? <Liquid t={13} light={[0.7, 0.35, 0.6]} gain={0.95} veins={0.9} /> : null}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<GlowDefs />
				<defs>
					<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
					<radialGradient id="vig3" cx="50%" cy="48%" r="72%">
						<stop offset="0.5" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.85" />
					</radialGradient>
				</defs>
				{i === 0 ? <Heartbeat f={f} /> : i === 1 ? <Synapse f={f} /> : i === 2 ? <Bloom f={f} /> : <MapRoutes />}
				{i !== 2 ? <Haze seed={`h${i}`} n={50} f={f} /> : null}
				<text x={1770} y={64} textAnchor="end" style={{fontFamily: font.sans, fontSize: 18, fill: '#efe4d0', letterSpacing: '0.1em'}} opacity={0.5}>
					◆ Juno · VIBE知识大赏
				</text>
				<Grade />
			</svg>
		</AbsoluteFill>
	);
};

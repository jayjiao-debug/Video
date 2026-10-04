import React from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';

/**
 * Props and defs for 《续命》 (coffee). Same rules as the rest of the library:
 * material gradients, one warm key, soft rims. Origins are documented per prop.
 */

export const COFFEE = {
	espresso: '#2b1810',
	coffee: '#4a2a18',
	crema: '#c48a4a',
	milk: '#efe3cf',
	kraft: '#b98a58',
	cup: '#f4efe6',
	cupShade: '#d9d0c2',
	cherry: '#c0302a',
	cherryDark: '#7a1712',
	bean: '#6a4226',
	leaf: '#2f5a3a',
	leafDark: '#1d3a26',
	petal: '#fbf7ee',
	dawnTop: '#2a3a5c',
	dawnMid: '#c98a6a',
	dawnLow: '#f3c98a',
};

export const COFFEE_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="sky-dawn" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#1f2c4a" />
			<stop offset="0.45" stopColor="#6a5a78" />
			<stop offset="0.72" stopColor="#d99070" />
			<stop offset="1" stopColor="#f6cf8e" />
		</linearGradient>
		<linearGradient id="sky-morning" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#8fb0cf" />
			<stop offset="0.6" stopColor="#e9d3b4" />
			<stop offset="1" stopColor="#f6d79a" />
		</linearGradient>
		<linearGradient id="sky-afternoon" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#6f9cc6" />
			<stop offset="1" stopColor="#e8d6b8" />
		</linearGradient>
		<radialGradient id="glow-sun" cx="50%" cy="50%" r="50%">
			<stop offset="0" stopColor="#fff6dc" stopOpacity="1" />
			<stop offset="0.25" stopColor="#ffd98f" stopOpacity="0.7" />
			<stop offset="1" stopColor="#ffb054" stopOpacity="0" />
		</radialGradient>
		<linearGradient id="beam-sun" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#fff2cf" stopOpacity="0.55" />
			<stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
		</linearGradient>
		<linearGradient id="cup-paper" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#d6cfc3" />
			<stop offset="0.35" stopColor="#fbf8f2" />
			<stop offset="0.7" stopColor="#efe9df" />
			<stop offset="1" stopColor="#c9c1b4" />
		</linearGradient>
		<linearGradient id="cup-kraft" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#8a6238" />
			<stop offset="0.4" stopColor="#c99a62" />
			<stop offset="1" stopColor="#7d5732" />
		</linearGradient>
		<linearGradient id="ceramic" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#cfc6b8" />
			<stop offset="0.4" stopColor="#fbf6ee" />
			<stop offset="1" stopColor="#bfb5a6" />
		</linearGradient>
		<radialGradient id="coffee-surface" cx="45%" cy="40%" r="60%">
			<stop offset="0" stopColor="#6a3c20" />
			<stop offset="0.7" stopColor="#3a2014" />
			<stop offset="0.92" stopColor="#a8703e" />
			<stop offset="1" stopColor="#d49a5a" />
		</radialGradient>
		<radialGradient id="cherry-red" cx="35%" cy="30%" r="70%">
			<stop offset="0" stopColor="#f2685a" />
			<stop offset="0.5" stopColor="#c0302a" />
			<stop offset="1" stopColor="#6e1410" />
		</radialGradient>
		<radialGradient id="bean-brown" cx="35%" cy="30%" r="75%">
			<stop offset="0" stopColor="#9a6a42" />
			<stop offset="0.6" stopColor="#5e3a20" />
			<stop offset="1" stopColor="#2e1a0e" />
		</radialGradient>
		<radialGradient id="bean-green" cx="35%" cy="30%" r="75%">
			<stop offset="0" stopColor="#dcd6a8" />
			<stop offset="1" stopColor="#9a9a68" />
		</radialGradient>
		<radialGradient id="petal" cx="30%" cy="30%" r="80%">
			<stop offset="0" stopColor="#ffffff" />
			<stop offset="0.7" stopColor="#f6f1e4" />
			<stop offset="1" stopColor="#d9d2bd" />
		</radialGradient>
		<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#4f8a58" />
			<stop offset="0.5" stopColor="#2f5a3a" />
			<stop offset="1" stopColor="#1a3322" />
		</linearGradient>
		<radialGradient id="bokeh-green" cx="50%" cy="50%" r="50%">
			<stop offset="0" stopColor="#c9d98a" stopOpacity="0.5" />
			<stop offset="1" stopColor="#c9d98a" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="bokeh-gold" cx="50%" cy="50%" r="50%">
			<stop offset="0" stopColor="#ffe2a0" stopOpacity="0.55" />
			<stop offset="1" stopColor="#ffe2a0" stopOpacity="0" />
		</radialGradient>
		<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#f3e6da" stopOpacity="0" />
			<stop offset="0.5" stopColor="#f3e6da" stopOpacity="0.55" />
			<stop offset="1" stopColor="#f3e6da" stopOpacity="0" />
		</linearGradient>
		<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#e8e2d2" />
			<stop offset="1" stopColor="#cfc6b2" />
		</linearGradient>
	</defs>
);

/**
 * Steam rising from a cup. `t` is a time in frames, not the frame itself, so a
 * rewind can play it backwards. Origin at the cup's mouth.
 */
export const Steam: React.FC<{t: number; seed?: string; height?: number; width?: number; opacity?: number; color?: string}> = ({
	t,
	seed = 'st',
	height = 220,
	width = 40,
	opacity = 0.5,
	color = '#fff8ec',
}) => (
	<g>
		{Array.from({length: 3}, (_, k) => {
			const pts = Array.from({length: 14}, (_, i) => {
				const u = i / 13;
				const x = (k - 1) * width * 0.5 + Math.sin(u * 5 + t / 18 + k * 2) * width * u + noise2D(seed + k, u * 2, t / 60) * 18 * u;
				return `${x.toFixed(1)},${(-u * height).toFixed(1)}`;
			});
			return (
				<polyline
					key={k}
					points={pts.join(' ')}
					fill="none"
					stroke={color}
					strokeWidth={10 - k * 2}
					strokeLinecap="round"
					opacity={opacity * (0.7 + 0.3 * Math.sin(t / 25 + k))}
					filter="url(#blur-sm)"
				/>
			);
		})}
	</g>
);

/** A takeaway cup with lid and kraft sleeve. Origin: bottom centre; ~200 tall. */
export const PaperCup: React.FC<{sleeve?: boolean; lid?: boolean; mark?: string}> = ({sleeve = true, lid = true, mark}) => (
	<g>
		<path d="M-62,-190 L62,-190 L50,0 L-50,0 Z" fill="url(#cup-paper)" />
		{sleeve ? (
			<g>
				<path d="M-59,-140 L59,-140 L53,-60 L-53,-60 Z" fill="url(#cup-kraft)" />
				{mark ? (
					<text y={-92} textAnchor="middle" style={{fontFamily: 'serif', fontWeight: 700, fontSize: 22, fill: '#4a2f18', letterSpacing: '0.1em'}}>
						{mark}
					</text>
				) : null}
			</g>
		) : null}
		{lid ? (
			<g>
				<path d="M-70,-190 L70,-190 L66,-206 L-66,-206 Z" fill="#efe9de" />
				<path d="M-60,-206 L60,-206 C56,-222 -56,-222 -60,-206 Z" fill="#e2dbcf" />
				<rect x={18} y={-220} width={16} height={6} rx={3} fill="#bdb4a6" />
			</g>
		) : null}
		<path d="M-50,0 L50,0" stroke="#000" strokeOpacity={0.25} strokeWidth={3} />
	</g>
);

/** A ceramic cup (London 'dish' or a modern mug when `handle`). Origin: bottom centre. */
export const CeramicCup: React.FC<{handle?: boolean; fill?: number; w?: number; h?: number}> = ({handle = true, fill = 0.85, w = 120, h = 100}) => (
	<g>
		{handle ? <path d={`M${w / 2 - 6},${-h * 0.75} C${w / 2 + 40},${-h * 0.8} ${w / 2 + 40},${-h * 0.2} ${w / 2 - 8},${-h * 0.25}`} fill="none" stroke="url(#ceramic)" strokeWidth={14} /> : null}
		<path d={`M${-w / 2},${-h} L${w / 2},${-h} C${w / 2},${-h * 0.3} ${w * 0.3},0 0,0 C${-w * 0.3},0 ${-w / 2},${-h * 0.3} ${-w / 2},${-h} Z`} fill="url(#ceramic)" />
		<ellipse cx={0} cy={-h} rx={w / 2} ry={w * 0.12} fill="#e9e2d4" />
		<ellipse cx={0} cy={-h + 2} rx={w / 2 - 6} ry={w * 0.1} fill="url(#coffee-surface)" opacity={fill > 0 ? 1 : 0} />
	</g>
);

/** A roasted (or green) coffee bean, flat side up: the S-shaped crease. r ≈ half-length. */
export const Bean: React.FC<{r?: number; green?: boolean; rot?: number}> = ({r = 30, green, rot = 0}) => (
	<g transform={`rotate(${rot})`}>
		<ellipse rx={r * 0.72} ry={r} fill={green ? 'url(#bean-green)' : 'url(#bean-brown)'} />
		<path d={`M0,${-r * 0.85} C${-r * 0.25},${-r * 0.3} ${r * 0.25},${r * 0.3} 0,${r * 0.85}`} fill="none" stroke={green ? '#7a7a4a' : '#2a160b'} strokeWidth={r * 0.1} strokeLinecap="round" />
		<ellipse cx={-r * 0.22} cy={-r * 0.35} rx={r * 0.16} ry={r * 0.3} fill="#fff" opacity={0.18} />
	</g>
);

/**
 * A coffee cherry. `cut` 0..1 splits it open to show the two seeds lying flat
 * side to flat side ("back to back").
 */
export const Cherry: React.FC<{r?: number; cut?: number; ripe?: number}> = ({r = 30, cut = 0, ripe = 1}) => {
	const col = ripe >= 1 ? 'url(#cherry-red)' : ripe > 0.5 ? '#d9822e' : '#6f9a46';
	if (cut <= 0) {
		return (
			<g>
				<ellipse rx={r * 0.9} ry={r} fill={col} />
				<circle cx={0} cy={-r * 0.95} r={r * 0.12} fill="#3a2a1a" />
				<ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.22} ry={r * 0.3} fill="#fff" opacity={0.35} />
			</g>
		);
	}
	const gap = cut * r * 0.9;
	return (
		<g>
			{[-1, 1].map((d) => (
				<g key={d} transform={`translate(${d * gap},0)`}>
					<path d={`M0,${-r} A${r * 0.9},${r} 0 0,${d > 0 ? 1 : 0} 0,${r} Z`} fill={col} />
					<path d={`M0,${-r * 0.85} A${r * 0.72},${r * 0.85} 0 0,${d > 0 ? 1 : 0} 0,${r * 0.85} Z`} fill="#f3e6c4" />
					<g transform={`translate(${d * r * 0.34},0)`}>
						<ellipse rx={r * 0.3} ry={r * 0.7} fill="url(#bean-green)" />
						<path d={`M${-d * r * 0.3},${-r * 0.6} L${-d * r * 0.3},${r * 0.6}`} stroke="#8a8a58" strokeWidth={2} />
					</g>
				</g>
			))}
		</g>
	);
};

/** Five-petalled white coffee flower; `open` 0..1 unfurls it. */
export const CoffeeFlower: React.FC<{r?: number; open?: number; rot?: number}> = ({r = 40, open = 1, rot = 0}) => (
	<g transform={`rotate(${rot})`}>
		{Array.from({length: 5}, (_, i) => {
			const a = (i / 5) * 360;
			const len = r * (0.35 + 0.65 * open);
			return (
				<g key={i} transform={`rotate(${a}) `}>
					<path d={`M0,0 C${r * 0.22},${-len * 0.3} ${r * 0.2},${-len * 0.9} 0,${-len} C${-r * 0.2},${-len * 0.9} ${-r * 0.22},${-len * 0.3} 0,0 Z`} fill="url(#petal)" />
				</g>
			);
		})}
		{open > 0.3
			? Array.from({length: 5}, (_, i) => {
					const a = ((i + 0.5) / 5) * Math.PI * 2;
					const l = r * 0.42 * open;
					return (
						<g key={i}>
							<line x1={0} y1={0} x2={Math.sin(a) * l} y2={-Math.cos(a) * l} stroke="#efe6c4" strokeWidth={1.4} />
							<ellipse cx={Math.sin(a) * l} cy={-Math.cos(a) * l} rx={2.6} ry={4} fill="#e2b84a" transform={`rotate(${(a * 180) / Math.PI}, ${Math.sin(a) * l}, ${-Math.cos(a) * l})`} />
						</g>
					);
				})
			: null}
		<circle r={r * 0.1} fill="#e8d98a" />
	</g>
);

/** A glossy coffee leaf, pointing along +x. */
export const Leaf: React.FC<{len?: number; rot?: number}> = ({len = 90, rot = 0}) => (
	<g transform={`rotate(${rot})`}>
		<path d={`M0,0 C${len * 0.3},${-len * 0.28} ${len * 0.8},${-len * 0.22} ${len},0 C${len * 0.8},${len * 0.22} ${len * 0.3},${len * 0.28} 0,0 Z`} fill="url(#leaf)" />
		<path d={`M0,0 L${len * 0.95},0`} stroke="#9ac48a" strokeOpacity={0.5} strokeWidth={1.5} />
		{[0.3, 0.5, 0.7].map((u) => (
			<path key={u} d={`M${len * u},0 L${len * (u + 0.12)},${-len * 0.12} M${len * u},0 L${len * (u + 0.12)},${len * 0.12}`} stroke="#9ac48a" strokeOpacity={0.3} strokeWidth={1} />
		))}
	</g>
);

/** A coffee branch along +x: leaf pairs with clusters of flowers or cherries at the nodes. */
export const Branch: React.FC<{len?: number; f?: number; mode?: 'flower' | 'cherry' | 'leaf'; open?: number; ripe?: number; seed?: string; sway?: number}> = ({
	len = 520,
	f = 0,
	mode = 'cherry',
	open = 1,
	ripe = 1,
	seed = 'br',
	sway = 1,
}) => {
	const nodes = 5;
	const bend = sway * 3 * Math.sin(f / 40 + random(seed) * 6);
	return (
		<g transform={`rotate(${bend})`}>
			<path d={`M0,0 C${len * 0.3},${-12} ${len * 0.7},${8} ${len},${-6}`} stroke="#5a4632" strokeWidth={7} fill="none" strokeLinecap="round" />
			{Array.from({length: nodes}, (_, i) => {
				const x = ((i + 0.6) / nodes) * len;
				const y = -4 + Math.sin(i) * 4;
				return (
					<g key={i} transform={`translate(${x},${y})`}>
						<Leaf len={110 - i * 8} rot={-55 + random(`${seed}a${i}`) * 10} />
						<Leaf len={104 - i * 8} rot={55 + random(`${seed}b${i}`) * 10} />
						{mode === 'cherry'
							? Array.from({length: 5}, (_, k) => (
									<g key={k} transform={`translate(${(k - 2) * 15 + random(`${seed}c${i}${k}`) * 6},${8 + (k % 2) * 14})`}>
										<Cherry r={13} ripe={random(`${seed}r${i}${k}`) < ripe ? 1 : 0.6} />
									</g>
								))
							: mode === 'flower'
								? Array.from({length: 4}, (_, k) => (
										<g key={k} transform={`translate(${(k - 1.5) * 20},${-6 + (k % 2) * 12})`}>
											<CoffeeFlower r={17} open={Math.max(0, Math.min(1, open * 1.4 - k * 0.12))} rot={random(`${seed}f${i}${k}`) * 60} />
										</g>
									))
								: null}
					</g>
				);
			})}
		</g>
	);
};

/**
 * A honeybee in side view, facing +x. `flap` is the wing phase (frames); the
 * wings blur when they move fast. Natural colouring, slightly stylised.
 */
export const Bee: React.FC<{flap?: number; s?: number; fly?: number}> = ({flap = 0, s = 1, fly = 1}) => {
	const w = Math.sin(flap * 2.2) * fly;
	return (
		<g transform={`scale(${s})`}>
			{/* far wing */}
			<ellipse cx={-8} cy={-22} rx={20} ry={8} fill="#e6f0f6" opacity={0.25} transform={`rotate(${-30 + w * 40}, 0, -14)`} />
			{/* abdomen with stripes */}
			<ellipse cx={-30} cy={0} rx={28} ry={18} fill="#d9a23a" />
			{[-44, -32, -20].map((x) => (
				<path key={x} d={`M${x},-17 C${x - 5},-6 ${x - 5},6 ${x},17`} stroke="#3a2614" strokeWidth={6} fill="none" />
			))}
			<path d="M-58,0 L-64,0" stroke="#3a2614" strokeWidth={3} />
			{/* thorax, fuzzy */}
			<circle cx={2} cy={-4} r={17} fill="#a8742e" />
			{Array.from({length: 12}, (_, i) => {
				const a = (i / 12) * Math.PI * 2;
				return <line key={i} x1={2 + Math.cos(a) * 14} y1={-4 + Math.sin(a) * 14} x2={2 + Math.cos(a) * 20} y2={-4 + Math.sin(a) * 20} stroke="#c99a4a" strokeWidth={2} />;
			})}
			{/* head, eye, antennae */}
			<circle cx={24} cy={-2} r={11} fill="#3a2614" />
			<ellipse cx={27} cy={-5} rx={5} ry={7} fill="#1a120a" />
			<circle cx={28} cy={-8} r={1.6} fill="#fff" opacity={0.7} />
			<path d="M28,-12 C32,-26 40,-30 44,-28 M24,-12 C26,-28 32,-34 36,-34" stroke="#2a1a0e" strokeWidth={2} fill="none" />
			{/* legs */}
			{[-6, 4, 12].map((x, i) => (
				<path key={x} d={`M${x},10 L${x - 6 + i * 2},26 L${x - 2 + i * 3},34`} stroke="#2a1a0e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
			))}
			{/* near wing */}
			<ellipse cx={-6} cy={-24} rx={24} ry={9} fill="#f2f8fc" opacity={0.32} stroke="#ffffff" strokeOpacity={0.7} transform={`rotate(${-20 + w * 45}, 0, -14)`} />
		</g>
	);
};

/**
 * Melitta Bentz's 1908 brewer: a brass pot with a perforated top, a sheet of
 * blotting paper laid in it. `holes` 0..1 punches the holes; `paper` 0..1 lays the
 * sheet; `drip` 0..1 runs coffee through. Origin: bottom centre of the pot.
 */
export const BrassFilterPot: React.FC<{holes?: number; paper?: number; drip?: number; t?: number}> = ({holes = 1, paper = 1, drip = 0, t = 0}) => {
	return (
		<g>
			{/* the pot below */}
			<path d="M-90,-150 L90,-150 C96,-60 80,0 0,0 C-80,0 -96,-60 -90,-150 Z" fill="url(#ceramic)" />
			<ellipse cx={0} cy={-150} rx={90} ry={16} fill="#d9d0c2" />
			<path d="M88,-120 C140,-120 140,-40 84,-40" stroke="url(#ceramic)" strokeWidth={14} fill="none" />
			{/* brass cup on top */}
			<g transform="translate(0,-26)">
				<path d="M-110,-270 L110,-270 L70,-160 L-70,-160 Z" fill="url(#brass)" />
				<ellipse cx={0} cy={-270} rx={110} ry={20} fill="#8a6a2e" />
				<ellipse cx={0} cy={-270} rx={100} ry={16} fill="#3a2a14" />
				<ellipse cx={0} cy={-160} rx={70} ry={9} fill="#6a4a1e" />
				{/* the punched holes, seen as light through the base */}
				{Array.from({length: 5}, (_, i) => (
					<circle key={i} cx={(i - 2) * 22} cy={-160} r={3} fill="#120a04" opacity={Math.max(0, Math.min(1, holes * 5 - i))} />
				))}
			</g>
			{/* blotting paper lining */}
			{paper > 0 ? (
				<path
					d={`M${-96 * paper},-294 C${-60 * paper},${-256} ${60 * paper},${-256} ${96 * paper},-294 L${70 * paper},-302 L${-70 * paper},-302 Z`}
					fill="#f4efe2"
					opacity={0.95}
				/>
			) : null}
			{/* drips falling into the pot */}
			{drip > 0
				? [0, 1, 2].map((k) => {
						const u = ((t / 14 + k / 3) % 1);
						return <ellipse key={k} cx={(k - 1) * 22} cy={-184 + u * 30} rx={3} ry={5} fill="#4a2a14" opacity={drip * (1 - u)} />;
					})
				: null}
		</g>
	);
};

/** An 18th-century coffee pot (Leipzig / London), tall with a long spout. Origin: bottom centre. */
export const CoffeePot18: React.FC = () => (
	<g>
		<path d="M-50,-220 C-60,-150 -70,-60 -60,0 L60,0 C70,-60 60,-150 50,-220 Z" fill="url(#brass)" />
		<path d="M-56,-220 L56,-220 C50,-244 -50,-244 -56,-220 Z" fill="#a8803a" />
		<circle cx={0} cy={-250} r={10} fill="#8a6a2e" />
		<path d="M52,-150 C110,-160 120,-210 140,-240" stroke="url(#brass)" strokeWidth={14} fill="none" strokeLinecap="round" />
		<path d="M-52,-180 C-110,-170 -110,-60 -60,-70" stroke="#3a2614" strokeWidth={12} fill="none" />
	</g>
);

/** A bamboo back-basket for picking cherries. Origin: bottom centre. */
export const Basket: React.FC<{fill?: number}> = ({fill = 0}) => (
	<g>
		<path d="M-60,-140 L60,-140 L44,0 L-44,0 Z" fill="#b99258" />
		{Array.from({length: 7}, (_, i) => (
			<line key={i} x1={-60 + i * 20} y1={-140} x2={-44 + i * 14.6} y2={0} stroke="#8a6a3a" strokeWidth={2} />
		))}
		{Array.from({length: 6}, (_, i) => (
			<line key={`h${i}`} x1={-60 + i * 2.6} y1={-140 + i * 24} x2={60 - i * 2.6} y2={-140 + i * 24} stroke="#8a6a3a" strokeWidth={2} />
		))}
		{fill > 0
			? Array.from({length: Math.round(18 * fill)}, (_, i) => (
					<circle key={i} cx={-48 + (i % 6) * 19} cy={-140 - Math.floor(i / 6) * 10 + (i % 2) * 4} r={9} fill="url(#cherry-red)" />
				))
			: null}
	</g>
);

/** Soft out-of-focus lights for macro shots. */
export const Bokeh: React.FC<{f: number; n?: number; seed?: string; gold?: number; w?: number; h?: number}> = ({f, n = 30, seed = 'bk', gold = 0.4, w = 1920, h = 1080}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const r = 30 + random(`${seed}r${i}`) * 110;
			const x = random(`${seed}x${i}`) * w + Math.sin(f / 90 + i) * 14;
			const y = random(`${seed}y${i}`) * h + Math.cos(f / 110 + i) * 10;
			return <circle key={i} cx={x} cy={y} r={r} fill={random(`${seed}g${i}`) < gold ? 'url(#bokeh-gold)' : 'url(#bokeh-green)'} />;
		})}
	</g>
);

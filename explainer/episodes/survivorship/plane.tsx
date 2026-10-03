import React from 'react';
import {random} from 'remotion';
import {ease, prog} from '../../src/lib/context';
import {color} from '../../src/lib/theme';

// A four-engine bomber seen from above, nose up, centred on (0, 0), ~520 x 380 units.

type Pt = [number, number];
const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [-x, y] as Pt).reverse();

const WING_L: Pt[] = [[-22, -52], [-252, -22], [-258, -6], [-250, 8], [-22, 22]];
const TAIL_L: Pt[] = [[-10, 138], [-96, 158], [-100, 172], [-10, 174]];
export const ENGINES = [-140, -70, 70, 140].map((x) => ({x, y0: -82, y1: 2, w: 22}));
const FUSE_HALF = (y: number) =>
	y < -150 ? Math.max(0, 22 * Math.sqrt(Math.max(0, (y + 192) / 42))) : y < 90 ? 22 : Math.max(4, 22 - ((y - 90) / 96) * 16);

const toPath = (pts: Pt[]) => 'M' + pts.map((p) => p.join(',')).join('L') + 'Z';
const fuselagePath = (() => {
	const ys = [];
	for (let y = -192; y <= 186; y += 6) ys.push(y);
	const right = ys.map((y) => `${FUSE_HALF(y).toFixed(1)},${y}`);
	const left = ys.reverse().map((y) => `${(-FUSE_HALF(y)).toFixed(1)},${y}`);
	return `M${right.join('L')}L${left.join('L')}Z`;
})();

const inPoly = (x: number, y: number, pts: Pt[]) => {
	let inside = false;
	for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
		const [xi, yi] = pts[i];
		const [xj, yj] = pts[j];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
};

export type Zone = 'engine' | 'cockpit' | 'fuselage' | 'wing' | 'tail';

export const zoneAt = (x: number, y: number): Zone | null => {
	for (const e of ENGINES) if (Math.abs(x - e.x) <= e.w / 2 && y >= e.y0 && y <= e.y1) return 'engine';
	if (Math.abs(x) <= FUSE_HALF(y) && y >= -192 && y <= 186) return y < -128 ? 'cockpit' : 'fuselage';
	if (inPoly(x, y, WING_L) || inPoly(x, y, mirror(WING_L))) return 'wing';
	if (inPoly(x, y, TAIL_L) || inPoly(x, y, mirror(TAIL_L))) return 'tail';
	return null;
};

export type Hole = {x: number; y: number; zone: Zone; t: number};

/** Deterministic hits: `counts` per zone, each with a 0..1 stagger time `t`. */
export const holesIn = (seed: string, counts: Partial<Record<Zone, number>>): Hole[] => {
	const out: Hole[] = [];
	let k = 0;
	for (const [zone, n] of Object.entries(counts) as [Zone, number][]) {
		let got = 0;
		while (got < n && k < 20000) {
			const x = (random(`${seed}x${k}`) - 0.5) * 520;
			const y = (random(`${seed}y${k}`) - 0.5) * 380;
			k++;
			if (zoneAt(x, y) === zone) {
				out.push({x, y, zone, t: random(`${seed}t${k}`)});
				got++;
			}
		}
	}
	return out.sort((a, b) => a.t - b.t);
};

/** The hero plane's survivor pattern: lots of fuselage/wing/tail damage, none on the engines. */
export const SURVIVOR = holesIn('hero', {fuselage: 20, wing: 30, tail: 10});

/** A fleet that is hit uniformly; the planes with engine hits are the ones that are lost. */
export const FLEET = new Array(12).fill(0).map((_, i) => {
	const lost = [1, 4, 6, 9, 10].includes(i);
	const holes = holesIn(`fleet${i}`, lost ? {engine: 1 + (i % 2), wing: 2, fuselage: 1 + (i % 3), tail: i % 2} : {wing: 3, fuselage: 2 + (i % 2), tail: 1});
	return {lost, holes};
});

export const PlaneShape: React.FC<{
	ink?: string;
	fill?: string;
	ghost?: boolean;
	engineGlow?: number;
	armor?: number;
	armorStrike?: number;
	draw?: number;
	/** stroke multiplier, for planes drawn small */
	weight?: number;
}> = ({ink = color.dim, fill = 'rgba(24,28,40,0.92)', ghost = false, engineGlow = 0, armor = 0, armorStrike = 0, draw = 1, weight = 1}) => {
	const dash = ghost ? `${7 * weight} ${7 * weight}` : undefined;
	const common = {stroke: ink, strokeWidth: (ghost ? 2 : 2.4) * weight, fill: ghost ? 'none' : fill, strokeDasharray: dash, strokeLinejoin: 'round' as const};
	return (
		<g opacity={draw}>
			<path d={toPath(WING_L)} {...common} />
			<path d={toPath(mirror(WING_L))} {...common} />
			<path d={toPath(TAIL_L)} {...common} />
			<path d={toPath(mirror(TAIL_L))} {...common} />
			<path d={fuselagePath} {...common} />
			{!ghost ? (
				<>
					<path d="M-8,-168 L8,-168 L6,-150 L-6,-150 Z" fill="rgba(160,190,230,0.35)" />
					<line x1={0} y1={-120} x2={0} y2={150} stroke={ink} strokeOpacity={0.25} strokeWidth={1.2} />
					{[-200, -120, 120, 200].map((x) => (
						<line key={x} x1={x} y1={-30 + Math.abs(x) * 0.02} x2={x} y2={14} stroke={ink} strokeOpacity={0.22} strokeWidth={1.2} />
					))}
				</>
			) : null}
			{ENGINES.map((e) => (
				<g key={e.x}>
					{engineGlow > 0 ? (
						<ellipse cx={e.x} cy={(e.y0 + e.y1) / 2} rx={34 + 8 * engineGlow} ry={64 + 8 * engineGlow} fill="url(#spot-gold)" opacity={engineGlow} />
					) : null}
					<rect
						x={e.x - e.w / 2}
						y={e.y0}
						width={e.w}
						height={e.y1 - e.y0}
						rx={9}
						{...common}
						stroke={engineGlow > 0 ? color.gold : ink}
						fill={ghost ? 'none' : engineGlow > 0 ? `rgba(241,197,109,${0.25 * engineGlow})` : fill}
					/>
					<line x1={e.x - 18} y1={e.y0 - 6} x2={e.x + 18} y2={e.y0 - 6} stroke={ink} strokeOpacity={ghost ? 0.4 : 0.6} strokeWidth={2} />
				</g>
			))}
			{armor > 0 ? <Armor amount={armor} strike={armorStrike} /> : null}
		</g>
	);
};

/** Plates the officers would bolt on: over the fuselage and the inner wings. */
const Armor: React.FC<{amount: number; strike: number}> = ({amount, strike}) => {
	const plates: [number, number, number, number][] = [
		[-17, -110, 34, 200],
		[-205, -36, 50, 44],
		[155, -36, 50, 44],
		[-112, -44, 26, 58],
		[86, -44, 26, 58],
		[-70, 148, 50, 20],
		[20, 148, 50, 20],
	];
	return (
		<g opacity={amount * (1 - 0.75 * strike)}>
			<defs>
				<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="8" stroke={color.steel} strokeWidth="2" strokeOpacity="0.5" />
				</pattern>
			</defs>
			{plates.map(([x, y, w, h], i) => {
				const p = prog(amount * 30, i * 2, 12, ease.out);
				return (
					<rect
						key={i}
						x={x}
						y={y + (1 - p) * -30 + strike * (i % 2 ? 40 : 25)}
						width={w}
						height={h}
						rx={4}
						fill="url(#hatch)"
						stroke={color.steel}
						strokeWidth={2}
						opacity={p}
						transform={`rotate(${strike * (i % 2 ? 14 : -10)}, ${x + w / 2}, ${y + h / 2})`}
					/>
				);
			})}
		</g>
	);
};

/** Bullet holes popping in; `p` 0..1 reveals them in stagger order. */
export const Holes: React.FC<{holes: Hole[]; p: number; size?: number; pulse?: number; only?: Zone[]; tone?: string}> = ({
	holes,
	p,
	size = 1,
	pulse = 0,
	only,
	tone,
}) => (
	<g>
		{holes.map((h, i) => {
			if (only && !only.includes(h.zone)) return null;
			const local = Math.min(1, Math.max(0, (p - h.t * 0.85) / 0.15));
			if (local <= 0) return null;
			const pop = local < 0.6 ? (local / 0.6) * 1.35 : 1.35 - (local - 0.6) * 0.875;
			const r = 9 * size * pop * (1 + 0.25 * pulse);
			return (
				<g key={i} transform={`translate(${h.x},${h.y})`}>
					<circle r={r * 1.35} fill={tone ?? 'url(#hole-red)'} opacity={0.5} />
					<circle r={r * 0.42} fill="#1a0806" stroke={color.red} strokeWidth={1.4 * size} />
				</g>
			);
		})}
	</g>
);

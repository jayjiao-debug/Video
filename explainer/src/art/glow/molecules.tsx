import React from 'react';
import {font} from '../../lib/theme';
import {AMBER} from './kit';

/**
 * Skeletal formulas drawn as glowing line-art, geometry computed from a purine
 * core (6-ring fused to a 5-ring on the C4–C5 bond), bond length B.
 * Caffeine and adenosine share that core, which is the whole point of the
 * episode: the key fits the lock because it is nearly the same shape.
 */
const B = 60;
const S3 = Math.sqrt(3) / 2;
const hexC = [-S3 * B, 0];
const pentC = [0.688 * B, 0];
const RP = 0.8507 * B;
const at = (c: number[], r: number, deg: number): [number, number] => [c[0] + r * Math.cos((deg * Math.PI) / 180), c[1] + r * Math.sin((deg * Math.PI) / 180)];

const P = {
	C5: at(hexC, B, -30),
	C4: at(hexC, B, 30),
	N3: at(hexC, B, 90),
	C2: at(hexC, B, 150),
	N1: at(hexC, B, 210),
	C6: at(hexC, B, 270),
	N9: at(pentC, RP, 72),
	C8: at(pentC, RP, 0),
	N7: at(pentC, RP, -72),
};
/** a substituent one bond out from `p`, pointing away from ring centre `c` */
const out = (p: [number, number], c: number[], k = 1): [number, number] => {
	const dx = p[0] - c[0];
	const dy = p[1] - c[1];
	const l = Math.hypot(dx, dy);
	return [p[0] + (dx / l) * B * k, p[1] + (dy / l) * B * k];
};

type Atom = {p: [number, number]; label?: string};
type Bond = [string, string, 1 | 2];
type Mol = {atoms: Record<string, Atom>; bonds: Bond[]};

const core: Record<string, Atom> = {
	C5: {p: P.C5},
	C4: {p: P.C4},
	N3: {p: P.N3, label: 'N'},
	C2: {p: P.C2},
	N1: {p: P.N1, label: 'N'},
	C6: {p: P.C6},
	N9: {p: P.N9, label: 'N'},
	C8: {p: P.C8},
	N7: {p: P.N7, label: 'N'},
};
const ring: Bond[] = [
	['C5', 'C6', 1],
	['C6', 'N1', 1],
	['N1', 'C2', 1],
	['C2', 'N3', 1],
	['N3', 'C4', 1],
	['C4', 'C5', 2],
	['C5', 'N7', 1],
	['N7', 'C8', 1],
	['C8', 'N9', 2],
	['N9', 'C4', 1],
];

export const CAFFEINE: Mol = {
	atoms: {
		...core,
		O6: {p: out(P.C6, hexC), label: 'O'},
		O2: {p: out(P.C2, hexC), label: 'O'},
		M1: {p: out(P.N1, hexC), label: 'CH₃'},
		M3: {p: out(P.N3, hexC), label: 'CH₃'},
		M7: {p: out(P.N7, pentC), label: 'CH₃'},
	},
	bonds: [...ring, ['C6', 'O6', 2], ['C2', 'O2', 2], ['N1', 'M1', 1], ['N3', 'M3', 1], ['N7', 'M7', 1]],
};

// adenosine: adenine (NH₂ on C6, aromatic) with a ribose ring hung off N9
const r1 = out(P.N9, pentC);
const dir9 = [Math.cos((72 * Math.PI) / 180), Math.sin((72 * Math.PI) / 180)];
const ribC: [number, number] = [r1[0] + dir9[0] * RP, r1[1] + dir9[1] * RP];
const rib = (deg: number) => at(ribC, RP, deg);
// ring vertices: C1' points back at N9 (252°), then O4', C4', C3', C2'
const R = {c1: rib(252), o4: rib(324), c4: rib(36), c3: rib(108), c2: rib(180)};
const c5r = out(R.c4, ribC, 0.9);
export const ADENOSINE: Mol = {
	atoms: {
		...core,
		N6: {p: out(P.C6, hexC), label: 'NH₂'},
		R1: {p: R.c1},
		RO: {p: R.o4, label: 'O'},
		R4: {p: R.c4},
		R3: {p: R.c3},
		R2: {p: R.c2},
		OH2: {p: out(R.c2, ribC, 0.9), label: 'OH'},
		OH3: {p: out(R.c3, ribC, 0.9), label: 'OH'},
		C5r: {p: c5r},
		OH5: {p: [c5r[0] + B * 0.9, c5r[1]], label: 'OH'},
	},
	bonds: [
		['C5', 'C6', 1],
		['C6', 'N1', 2],
		['N1', 'C2', 1],
		['C2', 'N3', 2],
		['N3', 'C4', 1],
		['C4', 'C5', 2],
		['C5', 'N7', 1],
		['N7', 'C8', 2],
		['C8', 'N9', 1],
		['N9', 'C4', 1],
		['C6', 'N6', 1],
		['N9', 'R1', 1],
		['R1', 'RO', 1],
		['RO', 'R4', 1],
		['R4', 'R3', 1],
		['R3', 'R2', 1],
		['R2', 'R1', 1],
		['R2', 'OH2', 1],
		['R3', 'OH3', 1],
		['R4', 'C5r', 1],
		['C5r', 'OH5', 1],
	],
};

/** Draws a molecule; `draw` 0..1 strokes the bonds on in order, `core` highlights the shared purine rings. */
export const Molecule: React.FC<{mol: Mol; draw?: number; color?: string; coreColor?: string; coreGlow?: number; w?: number; bg?: string}> = ({
	mol,
	draw = 1,
	color = AMBER.gold,
	coreColor,
	coreGlow = 0,
	w = 4,
	bg = AMBER.ink,
}) => {
	const n = mol.bonds.length;
	const inCore = (a: string) => a in core;
	return (
		<g strokeLinecap="round">
			{coreGlow > 0 ? (
				<g opacity={coreGlow}>
					<polygon points={[P.C5, P.C6, P.N1, P.C2, P.N3, P.C4].map((p) => p.join(',')).join(' ')} fill={coreColor ?? color} opacity={0.18} />
					<polygon points={[P.C5, P.N7, P.C8, P.N9, P.C4].map((p) => p.join(',')).join(' ')} fill={coreColor ?? color} opacity={0.18} />
				</g>
			) : null}
			<g filter="url(#g-sm)">
				{mol.bonds.map(([a, b, order], i) => {
					const k = Math.max(0, Math.min(1, draw * n - i));
					if (k <= 0) return null;
					const pa = mol.atoms[a].p;
					const pb = mol.atoms[b].p;
					const c = coreColor && inCore(a) && inCore(b) ? coreColor : color;
					const x2 = pa[0] + (pb[0] - pa[0]) * k;
					const y2 = pa[1] + (pb[1] - pa[1]) * k;
					// second line of a double bond: offset toward the inside
					const dx = pb[0] - pa[0];
					const dy = pb[1] - pa[1];
					const l = Math.hypot(dx, dy);
					const nx = (-dy / l) * 9;
					const ny = (dx / l) * 9;
					return (
						<g key={i} stroke={c} strokeWidth={w}>
							<line x1={pa[0]} y1={pa[1]} x2={x2} y2={y2} />
							{order === 2 ? <line x1={pa[0] + nx + dx * 0.15} y1={pa[1] + ny + dy * 0.15} x2={pa[0] + nx + dx * 0.85 * k} y2={pa[1] + ny + dy * 0.85 * k} /> : null}
						</g>
					);
				})}
			</g>
			{Object.entries(mol.atoms).map(([id, a]) => {
				if (!a.label) return null;
				const idx = mol.bonds.findIndex(([x, y]) => x === id || y === id);
				const o = Math.max(0, Math.min(1, draw * n - idx));
				if (o <= 0) return null;
				const wide = a.label.length > 1;
				return (
					<g key={id} opacity={o}>
						<rect x={a.p[0] - (wide ? 30 : 15)} y={a.p[1] - 17} width={wide ? 60 : 30} height={34} rx={10} fill={bg} />
						<text x={a.p[0]} y={a.p[1] + 10} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 30, fill: coreColor && inCore(id) ? coreColor : color}}>
							{a.label}
						</text>
					</g>
				);
			})}
		</g>
	);
};

import React from 'react';
import {PAL, sp, poly, mx, M, T, R, chain, ap, V, Pt, lerp, cl} from '../qq60/geo60';

/* ep61 · layered animal heads (face rig v2, owner note 2026-11-06: "the rigging for their face is all out of place").
   Every non-human head is drawn in the rig's head frame (face +x, y down, neck pivot at 0,0) from SEPARATE parts, back → front:
     1  far ear (darker), throat skin (stretches from the skull underside to the lower jaw, so nothing opens under the chin)
     2  mouth interior: dark red wedge computed every frame from the upper gape line and the TURNED lower gape line, pushed into both
        jaws, so it fills every opening angle; tongue (jaw frame) and teeth (upper teeth on the skull, lower teeth in the jaw frame)
        are clipped to that wedge — a tooth is only ever seen inside the open mouth, attached to its own jaw
     3  lower jaw / lower mandible: one closed shape turned about an anatomical hinge (carnivores: back of the gape, below and in
        front of the ear; birds: the gape corner under the eye), its own markings clipped to it
     4  skull with the upper muzzle / upper beak: covers the hinge with the cheek / jowl / ruff, so the joint is never seen
     5  everything ON the face (eye, kohl, brow, nose, cere, whisker pads, malar stripe, markings) clipped to the skull silhouette
     6  ears: own shape turned about the ear root (drawn behind the skull, inner-ear colour inside the same transform + clip)
   States (FaceState): jaw 0 closed … 0.3 talk … 1 wide (per-head max angle 40–56°), roar 0..1 (= wide + teeth + nose wrinkle + frown;
   God61 also throws the head back), eyes 0 open … 0.5 half … 1 closed (lids close along the almond), look −1 back … +1 front,
   brow −1 frown … +1 raised, ear degrees (+ = back), sneer 0..1 (Set: snout wrinkle + lip lift + a little jaw).
   `guide` draws only the outer outlines (skull, turned jaw, throat, ears) in one colour: FACECHECK61 lays it over the head. */

export type AnimalKind = 'lioness' | 'cat' | 'seth' | 'jackal' | 'ibis' | 'falcon';
export const ANIMAL_KINDS: AnimalKind[] = ['lioness', 'cat', 'seth', 'jackal', 'ibis', 'falcon'];
export type FaceState = {jaw?: number; roar?: number; ear?: number; eyes?: number; look?: number; brow?: number; sneer?: number};
type Ctx = {OW: number; LW: number};
type Tooth = [number, number, number, number?]; // x, root y, length, half width
type EyeSpec = {x: number; y: number; L: number; H?: number; tilt?: number; iris: string; sclera?: string; irisR?: number; pupil?: 'round' | 'slit' | 'none'; rim: string; kohl?: string; tail: number; glint?: boolean};
type EarSpec = {near: Pt[]; inner?: Pt[]; k?: number; pivot: V; tip: number; innerFill: string; far?: V; farFill?: string; farInner?: string};
export type HeadSpec = {
	skull: string; jaw: string; jawFill?: string; hinge: V; maxA: number; U: V[]; L: V[]; inner: string; tongue?: string; tongueFill?: string;
	teethU?: Tooth[]; teethL?: Tooth[]; throat?: {top: V[]; jaw: V[]; sag: V}; deep?: number;
	eye: EyeSpec; brow?: {d: string; pivot: V; fill: string}; ears?: EarSpec;
	face: (st: Req, c: Ctx) => React.ReactNode; chin?: (st: Req, c: Ctx) => React.ReactNode; back?: (st: Req, c: Ctx) => React.ReactNode;
};
type Req = Required<FaceState> & {open: number};

const about = (h: V, a: number): M => chain(T(h[0], h[1]), R(a), T(-h[0], -h[1]));
/** ears BEND instead of turning rigidly: each point turns about the root by a share of the angle growing from 0 at the root line to 1 at
   the tip, so the ear root stays planted in the skull (no corner popping out of the head) while the tip folds forward / back */
const bend = (pts: Pt[], piv: V, a: number, tipY: number, d: V = [0, 0]): Pt[] => pts.map((p) => { const w = cl((piv[1] - p[1]) / (piv[1] - tipY)), u = w * w * (3 - 2 * w);
	const q = ap(about(piv, a * u), [p[0], p[1]]); return (p[2] ? [q[0] + d[0], q[1] + d[1], 1] : [q[0] + d[0], q[1] + d[1]]) as Pt; });
const Sol: React.FC<{d: string; f: string; c: Ctx; k?: number; m?: M}> = ({d, f, c, k = 1, m}) => <g transform={m ? mx(m) : undefined}>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={f} /></g>;
const ln = (d: string, col: string, w: number, o?: number) => <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
const tooth = ([x, y, l, w = 0.06]: Tooth, down: boolean, c: Ctx, k: number) => { const L = l * k, s = down ? 1 : -1;
	return <path key={`${x}${down}`} d={`M${x - w} ${y - s * 0.08}L${x - w} ${y}Q${x - w * 0.6} ${y + s * L * 0.7} ${x + w * 0.15} ${y + s * L}Q${x + w * 0.7} ${y + s * L * 0.55} ${x + w} ${y}L${x + w} ${y - s * 0.08}Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.7} strokeLinejoin="round" />; };
/** offset a polyline perpendicular (+ = to the left of the direction of travel = up for a line drawn back → front) */
const shift = (pts: V[], d: number): V[] => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [p[0] + (dy / n) * d, p[1] - (dx / n) * d]; });

/* ---------------- the eye: Egyptian almond, iris filling it, kohl rim + tail; lids close along the almond ---------------- */
const AlmondEye: React.FC<{e: EyeSpec; st: Req; c: Ctx; id: string}> = ({e, st, c, id}) => {
	const {L, tail} = e, h = L * (e.H ?? 0.36), closed = cl(st.eyes), open = 1 - closed, fr = cl(-st.brow, 0, 1) * 0.45, rs = cl(st.brow, 0, 1) * 0.12;
	const A: V = [-L * 0.55, 0], B: V = [L * 0.47, h * 0.05], D1: V = [L * 0.15, h * 0.78], D2: V = [-L * 0.25, h * 0.62];
	const U1o: V = [-L * 0.2, -h * (1 + rs)], U2o: V = [L * 0.25, -h * (0.9 + rs) * (1 - fr)], U1c: V = [-L * 0.2, h * 0.36], U2c: V = [L * 0.22, h * 0.4];
	const U1: V = [lerp(U1c[0], U1o[0], open), lerp(U1c[1], U1o[1], open)], U2: V = [lerp(U2c[0], U2o[0], open), lerp(U2c[1], U2o[1], open)];
	const shape = sp([[A[0], A[1], 1], U1, U2, [B[0], B[1], 1], D1, D2], true, 0.2), lid = sp([A, U1, U2, B], false, 0.2), cid = `${id}-eye`;
	const ir = L * (e.irisR ?? 0.27), ix = L * 0.06 + cl(st.look, -1, 1) * L * 0.13, iy = h * 0.12, kohl = e.kohl ?? PAL.ink;
	const tailD = sp([[A[0] + L * 0.05, A[1] - h * 0.12], [A[0] - tail * 0.55, A[1] - h * 0.05], [A[0] - tail, A[1] + h * 0.18, 1], [A[0] - tail * 0.5, A[1] + h * 0.3], [A[0] + L * 0.04, A[1] + h * 0.16]], true, 0.15);
	return <g transform={`translate(${e.x},${e.y}) rotate(${e.tilt ?? 0})`}>
		<defs><clipPath id={cid}><path d={shape} /></clipPath></defs>
		{closed < 0.92 && <><path d={shape} fill={e.sclera ?? PAL.eye} />
			<g clipPath={`url(#${cid})`}><circle cx={ix} cy={iy} r={ir} fill={e.iris} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />
				{e.pupil !== 'none' && (e.pupil === 'slit' ? <ellipse cx={ix} cy={iy} rx={ir * 0.18} ry={ir * 0.82} fill={PAL.black} /> : <circle cx={ix} cy={iy} r={ir * 0.45} fill={PAL.black} />)}
				{e.glint && <circle cx={ix + ir * 0.3} cy={iy - ir * 0.35} r={ir * 0.16} fill="#FFFFFF" />}</g>
			<path d={shape} fill="none" stroke={e.rim} strokeWidth={c.LW * 1.2} strokeLinejoin="round" /></>}
		<path d={tailD} fill={kohl} />
		{ln(lid, kohl, c.LW * (closed > 0.92 ? 2.0 : 2.3))}
		{closed < 0.92 && ln(sp([B, D1, D2, A], false, 0.2), kohl, c.LW * 0.9)}
	</g>;
};

/* ---------------- the head ---------------- */
export const AnimalHead: React.FC<{kind: AnimalKind; col: string; col2: string; st?: FaceState; c: Ctx; id: string; guide?: string; /** the gold wig fillet (animal heads on a tripartite wig): drawn behind the skull so it shows on the wig only */ fillet?: boolean}> = ({kind, col, col2, st = {}, c, id, guide, fillet}) => {
	const roar = cl(st.roar ?? 0), sneer = cl(st.sneer ?? 0);
	const open = cl(Math.max(st.jaw ?? 0, roar, 0.16 * sneer));
	const S: Req = {jaw: st.jaw ?? 0, roar, ear: st.ear ?? 0, eyes: st.eyes ?? 0, look: st.look ?? 0.2, brow: st.brow ?? (roar > 0 ? -0.8 * roar : 0), sneer, open};
	const H = SPECS[kind](col, col2), a = H.maxA * open, rm = about(H.hinge, a);
	const E = H.ears, ek = E?.k ?? 0.12;
	const earD = E && sp(bend(E.near, E.pivot, -S.ear, E.tip), true, ek), earIn = E?.inner && sp(bend(E.inner, E.pivot, -S.ear, E.tip), true, ek);
	const farD = E?.far && sp(bend(E.near, E.pivot, -S.ear * 0.8, E.tip, E.far), true, ek), farIn = E?.far && E.inner && sp(bend(E.inner, E.pivot, -S.ear * 0.8, E.tip, E.far), true, ek);
	// the mouth wedge: hinge → upper gape (pushed up into the skull) → front → turned lower gape (pushed down into the jaw)
	const e = 0.07, Uw = shift(H.U, e), Lw = shift(H.L, -e).map((p) => ap(rm, p));
	const uf = Uw[Uw.length - 1], lf = Lw[Lw.length - 1], mid: V = [lerp(lerp(uf[0], lf[0], 0.5), H.hinge[0], 0.12), lerp(lerp(uf[1], lf[1], 0.5), H.hinge[1], 0.12)];
	const wedge = poly([H.hinge, ...Uw, mid, ...Lw.reverse()]);
	// throat skin: skull underside (back → cheek) → the jaw's underside (turned) → sagging down to the neck: drawn behind, so only its lower edge shows
	const throat = H.throat && sp([...H.throat.top, ...H.throat.jaw.map((p) => ap(rm, p)), [H.throat.sag[0] + 0.1 * open, H.throat.sag[1] + 0.3 * open]], true, 0.2);
	const cid = `${id}-${kind}`;
	if (guide) { const g = (d: string, m?: M) => <path d={d} transform={m ? mx(m) : undefined} fill="none" stroke={guide} strokeWidth={c.LW * 0.9} strokeLinejoin="round" />;
		return <g>{g(H.skull)}{g(H.jaw, rm)}{earD && g(earD)}{farD && g(farD)}{throat && open > 0.02 && g(throat)}</g>; }
	return <g>
		<defs>
			<clipPath id={`${cid}-sk`}><path d={H.skull} /></clipPath>
			<clipPath id={`${cid}-jw`}><path d={H.jaw} /></clipPath>
			<clipPath id={`${cid}-mo`}><path d={wedge} /></clipPath>
			{earD && <clipPath id={`${cid}-ear`}><path d={earD} /></clipPath>}{farD && <clipPath id={`${cid}-far`}><path d={farD} /></clipPath>}
			<radialGradient id={`${cid}-deep`} gradientUnits="userSpaceOnUse" cx={H.hinge[0]} cy={H.hinge[1]} r={H.deep ?? 1.1}><stop offset="0" stopColor="#1E0408" stopOpacity={0.95} /><stop offset="1" stopColor="#1E0408" stopOpacity={0} /></radialGradient>
		</defs>
		{H.back?.(S, c)}
		{fillet && <path d="M0.42 -1.25Q-0.4 -1.7 -1.35 -1.5" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.2} />}
		{E && farD && <g><Sol d={farD} f={E.farFill ?? col2} c={c} />{farIn && <g clipPath={`url(#${cid}-far)`}><path d={farIn} fill={E.farInner ?? E.innerFill} /></g>}</g>}
		{throat && open > 0.02 && <Sol d={throat} f={col} c={c} />}
		{a > 0.5 && <g>
			<path d={wedge} fill={H.inner} />
			<g clipPath={`url(#${cid}-mo)`}>
				<path d={wedge} fill={`url(#${cid}-deep)`} />
				{H.tongue && <path d={H.tongue} transform={mx(rm)} fill={H.tongueFill ?? '#D45A6A'} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />}
				{(H.teethU ?? []).map((t) => tooth(t, true, c, 1))}
				<g transform={mx(rm)}>{(H.teethL ?? []).map((t) => tooth(t, false, c, 1))}</g>
			</g></g>}
		<g transform={mx(rm)}><Sol d={H.jaw} f={H.jawFill ?? col} c={c} />{H.chin && <g clipPath={`url(#${cid}-jw)`}>{H.chin(S, c)}</g>}</g>
		{E && earD && <g><Sol d={earD} f={col} c={c} />{earIn && <g clipPath={`url(#${cid}-ear)`}><path d={earIn} fill={E.innerFill} /></g>}</g>}
		<Sol d={H.skull} f={col} c={c} />
		<g clipPath={`url(#${cid}-sk)`}>
			{H.face(S, c)}
			{H.brow && <path d={H.brow.d} fill={H.brow.fill} transform={mx(chain(T(0, -0.13 * Math.max(S.brow, 0) + 0.05 * Math.max(-S.brow, 0)), about(H.brow.pivot, 16 * Math.max(-S.brow, 0) - 5 * Math.max(S.brow, 0))))} />}
			<AlmondEye e={H.eye} st={S} c={c} id={cid} />
		</g>
	</g>;
};

/* ---------------- per-head geometry (head frame) ---------------- */
const dots = (pts: V[], r: number, f: string) => pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill={f} />);
const SPECS: Record<AnimalKind, (col: string, col2: string) => HeadSpec> = {
	/* lioness (Tefnut, Sekhmet): broad flat nose, deep strong muzzle, cheek ruff framing the face, round ears, heavy brow, amber eye */
	lioness: (col, col2) => ({
		skull: sp([[-0.55, 0.22], [-0.96, -0.5], [-1.03, -1.35], [-0.8, -2.1], [-0.25, -2.52], [0.45, -2.6], [1.02, -2.38], [1.38, -2.0], [1.56, -1.68], [1.92, -1.52], [2.22, -1.4], [2.42, -1.2, 1], [2.46, -0.9, 1], [2.33, -0.76], [2.34, -0.54], [2.16, -0.39], [1.6, -0.37], [1.06, -0.41, 1], [0.92, -0.2], [1.04, -0.04, 1], [0.84, 0.08], [0.95, 0.26, 1], [0.66, 0.32], [0.38, 0.4, 1], [0.12, 0.28], [-0.2, 0.32, 1]], true, 0.16),
		jaw: sp([[0.28, -0.64, 1], [1.06, -0.41], [1.6, -0.37], [2.14, -0.39, 1], [2.22, -0.22], [2.1, 0.0], [1.76, 0.14], [1.25, 0.2], [0.8, 0.2], [0.36, 0.02], [0.2, -0.32]], true, 0.16),
		hinge: [0.56, -0.5], maxA: 50, U: [[1.06, -0.41], [1.6, -0.37], [2.16, -0.39], [2.32, -0.52]], L: [[1.06, -0.41], [1.6, -0.38], [2.14, -0.39]],
		inner: '#7A1724', tongue: sp([[1.0, -0.42], [1.5, -0.52], [1.98, -0.48], [2.04, -0.4], [1.5, -0.36], [1.0, -0.36]], true, 0.2), tongueFill: '#D85C6E',
		teethU: [[2.02, -0.4, 0.44, 0.085], [2.2, -0.42, 0.12, 0.045], [1.66, -0.38, 0.14, 0.06]],
		teethL: [[1.84, -0.38, 0.36, 0.08], [2.04, -0.39, 0.1, 0.045], [1.5, -0.38, 0.12, 0.055]],
		throat: {top: [[-0.2, 0.25], [0.82, -0.12]], jaw: [[1.75, 0.1]], sag: [0.4, 0.3]},
		eye: {x: 1.1, y: -1.66, L: 0.54, H: 0.4, tilt: -7, iris: '#F2BF3A', sclera: '#F6DE8A', irisR: 0.3, rim: PAL.ink, tail: 0.32},
		brow: {d: sp([[0.66, -1.92], [1.02, -2.08], [1.44, -1.98], [1.42, -1.88], [1.04, -1.95], [0.7, -1.84]], true, 0.2), pivot: [0.68, -1.88], fill: '#8A5A22'},
		ears: {near: [[-0.34, -2.2], [-0.4, -2.66], [-0.14, -2.98], [0.2, -2.94], [0.38, -2.66], [0.36, -2.2]], inner: [[-0.22, -2.4], [-0.24, -2.68], [-0.07, -2.86], [0.16, -2.83], [0.25, -2.62], [0.22, -2.4]], k: 0.2, pivot: [0.0, -2.4], tip: -2.98, innerFill: '#8A5524', far: [-0.46, 0.08], farFill: col2, farInner: '#6E4018'},
		back: () => null,
		face: (S, c) => <g>
			{/* the ruff: darker mane behind a tufted edge from the crown, behind the eye, round the cheek to the throat (covers the hinge) */}
			<path d={sp([[0.6, -2.75], [0.32, -2.36, 1], [0.4, -2.16], [0.14, -1.92, 1], [0.24, -1.7], [0.04, -1.46, 1], [0.2, -1.24], [0.1, -1.0, 1], [0.36, -0.86], [0.34, -0.62, 1], [0.6, -0.56], [0.64, -0.3, 1], [0.86, -0.3], [0.86, 0.0, 1], [1.1, 0.5], [-1.6, 0.6], [-1.6, -2.75]], true, 0.12)} fill={col2} />
			{[[-0.3, -2.2, -0.62, -1.4], [-0.2, -1.6, -0.62, -0.7], [0.0, -1.0, -0.4, -0.1], [0.3, -0.5, 0.0, 0.2], [-0.62, -2.0, -0.85, -1.1]].map(([a, b, x, y], i) => <path key={i} d={`M${a} ${b}Q${(a + x) / 2 + 0.12} ${(b + y) / 2} ${x} ${y}`} fill="none" stroke="#9A6420" strokeWidth={c.LW * 1.3} />)}
			{/* pale muzzle + whisker pad, broad flat nose, tear line, pale patch under the eye */}
			<path d={sp([[1.55, -0.34], [1.68, -0.82], [2.08, -0.92], [2.36, -0.82], [2.38, -0.4], [2.0, -0.32]], true, 0.2)} fill="#F2DDA8" />
			{dots([[1.86, -0.72], [2.0, -0.7], [2.14, -0.68], [1.8, -0.6], [1.94, -0.58], [2.08, -0.56], [1.88, -0.48], [2.02, -0.47]], 0.025, '#6B4220')}
			<path d={sp([[2.1, -1.36], [2.4, -1.26], [2.48, -1.02, 1], [2.42, -0.86], [2.2, -0.9], [2.06, -1.1]], true, 0.2)} fill="#7B4636" stroke={PAL.ink} strokeWidth={c.LW * 0.8} />
			{ln('M2.42 -0.88Q2.34 -0.8 2.36 -0.66', PAL.ink, c.LW * 1.1)}
			<path d={sp([[0.86, -1.48], [1.16, -1.44], [1.4, -1.5], [1.3, -1.36], [1.0, -1.32]], true, 0.2)} fill="#F2DDA8" />
			{ln('M1.38 -1.6Q1.54 -1.4 1.66 -1.12', '#6B4220', c.LW * 1.3)}
			{S.open > 0.55 && ln('M1.66 -1.56Q1.78 -1.46 1.94 -1.5M1.72 -1.44Q1.84 -1.36 1.98 -1.4', '#8A5A22', c.LW * 1.2, cl((S.open - 0.55) * 3))}
		</g>,
		chin: () => <path d={sp([[1.55, -0.45], [2.3, -0.45], [2.24, -0.12], [1.95, 0.0], [1.7, -0.16]], true, 0.2)} fill="#F2DDA8" />,
	}),
	/* cat (Bastet): rounder skull, short muzzle, small triangle nose, cream muzzle pad with the whiskers rooted on it, tall ears, slit pupil */
	cat: (col, col2) => ({
		skull: sp([[-0.5, 0.2], [-0.88, -0.5], [-0.96, -1.35], [-0.72, -2.02], [-0.18, -2.42], [0.48, -2.46], [0.98, -2.2], [1.28, -1.82], [1.42, -1.52], [1.56, -1.3], [1.74, -1.16], [1.88, -1.0, 1], [1.9, -0.86, 1], [1.8, -0.74], [1.82, -0.58], [1.72, -0.47], [1.46, -0.43], [1.12, -0.46, 1], [0.98, -0.26], [1.02, -0.04], [0.82, 0.18], [0.4, 0.3], [-0.1, 0.28]], true, 0.16),
		jaw: sp([[0.42, -0.66, 1], [1.12, -0.46], [1.46, -0.43], [1.7, -0.47, 1], [1.74, -0.36], [1.62, -0.2], [1.36, -0.1], [1.0, -0.04], [0.66, -0.06], [0.4, -0.3]], true, 0.16),
		hinge: [0.72, -0.53], maxA: 50, U: [[1.12, -0.46], [1.46, -0.43], [1.72, -0.47], [1.8, -0.57]], L: [[1.12, -0.46], [1.46, -0.44], [1.7, -0.47]],
		inner: '#7A1F2B', tongue: sp([[1.05, -0.47], [1.4, -0.54], [1.6, -0.51], [1.6, -0.45], [1.1, -0.43]], true, 0.2), tongueFill: '#E58A98',
		teethU: [[1.62, -0.47, 0.2, 0.05], [1.72, -0.5, 0.07, 0.03]], teethL: [[1.54, -0.45, 0.17, 0.045], [1.66, -0.46, 0.06, 0.03]],
		throat: {top: [[-0.2, 0.22], [0.86, -0.1]], jaw: [[1.5, -0.2]], sag: [0.45, 0.24]},
		eye: {x: 1.0, y: -1.56, L: 0.6, H: 0.42, tilt: -10, iris: '#D9C23E', sclera: '#EBDD8A', irisR: 0.3, pupil: 'slit', rim: PAL.ink, tail: 0.36},
		brow: {d: sp([[0.62, -1.92], [0.98, -2.02], [1.3, -1.9], [1.28, -1.84], [0.98, -1.93], [0.64, -1.86]], true, 0.2), pivot: [0.64, -1.88], fill: col2},
		ears: {near: [[0.06, -2.0, 1], [0.3, -2.9], [0.56, -3.72, 1], [0.96, -2.85], [1.14, -2.0, 1]], inner: [[0.32, -2.28], [0.56, -3.4, 1], [0.86, -2.28]], k: 0.12, pivot: [0.58, -2.24], tip: -3.72, innerFill: '#E2A0A0', far: [-0.64, 0.12], farFill: col2, farInner: '#B07878'},
		face: (S, c) => <g>
			{[[0.0, -2.3, 0.5, -1.92], [0.3, -2.4, 0.72, -2.0], [-0.3, -2.1, 0.3, -1.8]].map(([a, b, x, y], i) => ln(`M${a} ${b}Q${(a + x) / 2} ${(b + y) / 2 - 0.08} ${x} ${y}`, col2, c.LW * 1.3))}
			{ln('M0.42 -1.42Q0.0 -1.36 -0.4 -1.22M0.48 -1.26Q0.1 -1.12 -0.25 -0.95', col2, c.LW * 1.3)}
			<path d={sp([[1.44, -0.44], [1.48, -0.74], [1.7, -0.86], [1.86, -0.74], [1.84, -0.5], [1.66, -0.43]], true, 0.2)} fill="#E4D8BE" />
			{dots([[1.6, -0.68], [1.7, -0.7], [1.58, -0.6], [1.68, -0.6], [1.78, -0.6]], 0.022, PAL.ink)}
			{[[-0.68, 0.0], [-0.6, 0.06], [-0.52, 0.12]].map(([y0, d], i) => ln(`M1.6 ${y0}Q1.72 ${y0 + d * 0.2} 1.82 ${y0 + d}`, PAL.ink, c.LW * 0.55))}
			{ln('M1.22 -0.64Q1.4 -0.66 1.55 -0.64', col2, c.LW * 0.9)}
			<path d={sp([[1.72, -1.1], [1.92, -0.98, 1], [1.92, -0.82, 1], [1.78, -0.88]], true, 0.2)} fill="#C98080" stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
			{ln('M1.86 -0.84L1.82 -0.72', PAL.ink, c.LW)}
		</g>,
		chin: () => <path d={sp([[1.1, -0.47], [1.72, -0.47], [1.66, -0.2], [1.3, -0.12]], true, 0.2)} fill="#E4D8BE" />,
	}),
	/* Set animal: long down-curved snout, square-tipped tall ears, heavy brow, narrow eye */
	seth: (col, col2) => ({
		skull: sp([[-0.5, 0.2], [-0.9, -0.55], [-0.96, -1.4], [-0.72, -2.05], [-0.15, -2.42], [0.5, -2.4], [1.0, -2.12], [1.36, -1.78], [1.78, -1.52], [2.3, -1.38], [2.82, -1.22], [3.2, -0.96], [3.42, -0.64], [3.47, -0.4, 1], [3.3, -0.37], [2.7, -0.44], [2.0, -0.48], [1.34, -0.52, 1], [1.14, -0.28], [1.1, 0.0], [0.8, 0.22], [0.3, 0.3], [-0.1, 0.28]], true, 0.16),
		jaw: sp([[0.55, -0.72, 1], [1.34, -0.52], [2.0, -0.48], [2.7, -0.44], [3.22, -0.39, 1], [3.24, -0.28], [2.9, -0.17], [2.2, -0.11], [1.5, -0.05], [1.0, -0.02], [0.62, -0.24]], true, 0.16),
		hinge: [0.86, -0.6], maxA: 42, U: [[1.34, -0.52], [2.0, -0.48], [2.7, -0.44], [3.28, -0.38], [3.42, -0.42]], L: [[1.34, -0.52], [2.0, -0.49], [2.7, -0.45], [3.22, -0.4]],
		inner: '#6E1622', tongue: sp([[1.3, -0.53], [2.2, -0.6], [2.8, -0.56], [2.82, -0.48], [2.0, -0.46], [1.3, -0.47]], true, 0.2), tongueFill: '#C85464',
		teethU: [[3.0, -0.41, 0.24, 0.06], [3.2, -0.4, 0.1, 0.04], [2.55, -0.45, 0.1, 0.05], [2.15, -0.47, 0.09, 0.05]], teethL: [[2.8, -0.44, 0.22, 0.06], [3.08, -0.41, 0.08, 0.04], [2.3, -0.47, 0.09, 0.05], [1.9, -0.49, 0.08, 0.05]],
		throat: {top: [[-0.2, 0.22], [0.95, -0.15]], jaw: [[2.1, -0.14]], sag: [0.5, 0.24]},
		eye: {x: 1.18, y: -1.68, L: 0.56, H: 0.32, tilt: -6, iris: '#E07A2C', sclera: '#F0C890', irisR: 0.28, rim: PAL.ink, tail: 0.34},
		brow: {d: sp([[0.7, -1.98], [1.1, -2.1], [1.56, -1.96], [1.52, -1.86], [1.08, -1.96], [0.74, -1.89]], true, 0.2), pivot: [0.72, -1.94], fill: col2},
		ears: {near: [[0.0, -2.0, 1], [-0.02, -3.2], [-0.2, -3.86, 1], [0.64, -3.96, 1], [0.5, -3.2], [0.54, -2.0, 1]], inner: [[0.14, -2.3], [0.1, -3.3], [0.0, -3.74], [0.46, -3.8], [0.38, -3.3], [0.4, -2.3]], k: 0.1, pivot: [0.27, -2.25], tip: -3.96, innerFill: col2, far: [-0.56, 0.1], farFill: col2, farInner: '#4E2010'},
		face: (S, c) => <g>
			{ln('M1.5 -1.48Q2.4 -1.3 3.18 -0.9', col2, c.LW * 1.6)}
			{ln('M3.34 -0.64Q3.42 -0.56 3.36 -0.5', PAL.ink, c.LW * 1.2)}
			{ln('M1.36 -1.0Q1.0 -0.8 0.9 -0.4', col2, c.LW * 1.3)}
			{S.sneer > 0.05 && ln('M2.55 -1.28Q2.66 -1.16 2.8 -1.2M2.66 -1.36Q2.78 -1.24 2.92 -1.27', PAL.ink, c.LW * 1.1, cl(S.sneer * 1.5))}
			{S.sneer > 0.05 && ln(`M1.42 -0.56Q1.6 ${-0.62 - 0.08 * S.sneer} 1.9 -0.56`, PAL.ink, c.LW * 1.2, cl(S.sneer * 1.5))}
		</g>,
	}),
	/* jackal (Anubis): long snout, black nose, tall ears with a gold inside, gold-rimmed eye (the ep60 colours) */
	jackal: (col, col2) => ({
		skull: sp([[-0.48, 0.2], [-0.84, -0.6], [-0.86, -1.4], [-0.6, -1.98], [-0.1, -2.3], [0.5, -2.3], [0.95, -1.95], [1.32, -1.58], [1.75, -1.32], [2.3, -1.12], [2.78, -0.98], [2.96, -0.86], [3.0, -0.7, 1], [2.86, -0.62], [2.5, -0.58], [2.0, -0.52], [1.5, -0.46, 1], [1.22, -0.22], [1.16, 0.04], [0.85, 0.22], [0.3, 0.28], [-0.1, 0.26]], true, 0.16),
		jaw: sp([[0.7, -0.76, 1], [1.5, -0.46], [2.0, -0.52], [2.5, -0.58], [2.82, -0.62, 1], [2.84, -0.52], [2.5, -0.4], [1.95, -0.22], [1.45, -0.08], [1.05, 0.0], [0.72, -0.3]], true, 0.16),
		hinge: [1.0, -0.6], maxA: 44, U: [[1.5, -0.46], [2.0, -0.52], [2.5, -0.58], [2.86, -0.63], [2.98, -0.7]], L: [[1.5, -0.47], [2.0, -0.53], [2.5, -0.59], [2.8, -0.62]],
		inner: '#7A1F2B', tongue: sp([[1.45, -0.5], [2.1, -0.62], [2.55, -0.64], [2.56, -0.58], [2.0, -0.5], [1.45, -0.46]], true, 0.2), tongueFill: '#C85A6A',
		teethU: [[2.6, -0.6, 0.2, 0.055], [2.8, -0.63, 0.08, 0.035], [2.25, -0.55, 0.08, 0.045], [1.95, -0.52, 0.08, 0.045]], teethL: [[2.46, -0.59, 0.18, 0.05], [2.7, -0.61, 0.07, 0.035], [2.05, -0.54, 0.07, 0.045]],
		throat: {top: [[-0.2, 0.22], [1.0, -0.15]], jaw: [[2.0, -0.26]], sag: [0.55, 0.22]},
		eye: {x: 1.38, y: -1.44, L: 0.5, H: 0.36, tilt: -9, iris: '#3A2412', sclera: PAL.eye, irisR: 0.29, rim: PAL.gold, kohl: PAL.gold, tail: 0.3},
		brow: {d: sp([[1.0, -1.7], [1.36, -1.82], [1.74, -1.66], [1.72, -1.6], [1.36, -1.72], [1.02, -1.64]], true, 0.2), pivot: [1.02, -1.66], fill: col2},
		ears: {near: [[0.08, -1.9, 1], [0.22, -3.0], [0.42, -4.1, 1], [0.78, -3.0], [0.95, -1.9, 1]], inner: [[0.3, -2.25], [0.43, -3.65, 1], [0.7, -2.25]], k: 0.12, pivot: [0.5, -2.1], tip: -4.1, innerFill: PAL.gold, far: [-0.5, 0.1], farFill: col2, farInner: '#9A7A2A'},
		face: (S, c) => <g>
			{ln('M2.75 -0.95Q2.2 -1.08 1.65 -1.26', col2, c.LW * 1.6)}
			<path d={sp([[2.78, -0.99], [2.98, -0.9], [3.03, -0.72, 1], [2.9, -0.7], [2.8, -0.82]], true, 0.2)} fill="#0C0A0C" stroke={col2} strokeWidth={c.LW * 0.8} />
			{ln('M1.5 -0.48Q1.3 -0.6 1.25 -0.85', col2, c.LW * 1.2)}
		</g>,
	}),
	/* ibis (Thoth): long down-curved beak (grey) from the gape under the small eye, black head */
	ibis: (col, col2) => ({
		skull: sp([[-0.45, 0.18], [-0.74, -0.55], [-0.74, -1.2], [-0.52, -1.7], [0.0, -1.98], [0.6, -1.92], [0.98, -1.55], [1.18, -1.22], [1.6, -1.1], [2.2, -0.92], [2.75, -0.64], [3.2, -0.27], [3.48, 0.08], [3.56, 0.3, 1], [3.42, 0.22], [3.1, -0.1], [2.6, -0.46], [2.0, -0.76], [1.45, -0.93], [1.12, -0.99, 1], [0.96, -0.72], [0.74, -0.3], [0.48, 0.18]], true, 0.16),
		jaw: sp([[0.84, -1.06, 1], [1.12, -0.99], [1.45, -0.93], [2.0, -0.76], [2.6, -0.46], [3.08, -0.1], [3.38, 0.2, 1], [3.3, 0.27], [3.0, 0.06], [2.5, -0.3], [1.95, -0.6], [1.4, -0.79], [1.05, -0.85], [0.84, -0.92]], true, 0.14), jawFill: col2,
		hinge: [1.0, -1.0], maxA: 40, U: [[1.12, -0.99], [1.45, -0.93], [2.0, -0.76], [2.6, -0.46], [3.1, -0.1], [3.42, 0.22]], L: [[1.12, -0.99], [1.45, -0.93], [2.0, -0.77], [2.6, -0.47], [3.08, -0.11], [3.36, 0.18]],
		inner: '#6E1A2A', deep: 2.2, tongue: sp([[1.1, -1.0], [2.0, -0.82], [2.4, -0.62], [2.38, -0.56], [1.9, -0.76], [1.1, -0.94]], true, 0.2), tongueFill: '#D86A7A',
		throat: {top: [[0.3, 0.12], [0.9, -0.7]], jaw: [[1.6, -0.8]], sag: [0.6, 0.0]},
		eye: {x: 0.56, y: -1.38, L: 0.38, H: 0.42, tilt: -4, iris: '#2A1A10', sclera: PAL.eye, irisR: 0.3, rim: PAL.gold, kohl: PAL.gold, tail: 0.2},
		face: (S, c) => <g>
			<path d={sp([[1.08, -1.6, 1], [3.9, -1.6, 1], [3.9, 0.6, 1], [1.1, -0.9, 1], [1.2, -1.22, 1]], true, 0.1)} fill={col2} />
			{ln('M1.2 -1.22Q1.14 -1.1 1.12 -0.99', PAL.ink, c.LW * 1.0)}
			{ln('M1.3 -1.06Q2.0 -0.9 2.6 -0.56', PAL.ink, c.LW * 0.8, 0.8)}
		</g>,
	}),
	/* falcon (Horus, Ra): hooked beak with the dark cere, round dark eye, the dark malar stripe (the wedjat marking) from the eye down
	   the cheek, white cheek behind it and white throat in front; lower mandible hinged at the gape corner under the eye */
	falcon: (col, col2) => ({
		skull: sp([[-0.48, 0.18], [-0.84, -0.5], [-0.88, -1.2], [-0.64, -1.72], [-0.1, -2.04], [0.52, -2.08], [1.04, -1.84], [1.32, -1.46], [1.52, -1.33], [1.76, -1.24], [1.92, -1.02], [1.96, -0.76], [1.86, -0.5, 1], [1.77, -0.62], [1.62, -0.68], [1.36, -0.72], [1.12, -0.74, 1], [1.04, -0.46], [0.96, -0.12], [0.5, 0.18]], true, 0.16),
		jaw: sp([[0.86, -0.83, 1], [1.12, -0.74], [1.36, -0.72], [1.6, -0.68, 1], [1.62, -0.6], [1.45, -0.52], [1.2, -0.5], [0.92, -0.57]], true, 0.14), jawFill: '#3C454E',
		hinge: [1.05, -0.77], maxA: 46, U: [[1.12, -0.74], [1.36, -0.72], [1.62, -0.68], [1.76, -0.62]], L: [[1.12, -0.74], [1.36, -0.72], [1.6, -0.68]],
		inner: '#6A1A22', tongue: sp([[1.08, -0.75], [1.4, -0.8], [1.52, -0.76], [1.4, -0.71], [1.1, -0.7]], true, 0.2), tongueFill: '#D87080',
		throat: {top: [[0.4, 0.12], [0.98, -0.5]], jaw: [[1.4, -0.56]], sag: [0.75, -0.05]},
		eye: {x: 0.88, y: -1.28, L: 0.54, H: 0.6, tilt: 0, iris: '#3A2214', sclera: '#5A3A22', irisR: 0.3, rim: PAL.ink, tail: 0.34, glint: true},
		brow: {d: sp([[0.44, -1.66], [0.86, -1.78], [1.24, -1.64], [1.22, -1.56], [0.86, -1.66], [0.47, -1.6]], true, 0.2), pivot: [0.46, -1.63], fill: col2},
		face: (S, c) => <g>
			<path d={sp([[0.18, -0.84], [0.48, -1.0], [0.68, -1.04], [0.72, -0.56], [0.66, -0.18, 1], [0.44, -0.36]], true, 0.24)} fill={PAL.white} />
			<path d={sp([[0.96, -0.86], [1.12, -0.76], [1.06, -0.44], [0.98, -0.1], [0.86, -0.1], [0.92, -0.5]], true, 0.2)} fill={PAL.white} />
			<path d={sp([[0.6, -1.1], [1.06, -1.1], [1.0, -0.8], [0.92, -0.42], [0.85, -0.08, 1], [0.72, -0.42], [0.66, -0.8]], true, 0.2)} fill="#1E2E3A" />
			<path d={sp([[1.3, -1.7, 1], [2.4, -1.7, 1], [2.4, 0.0, 1], [1.12, -0.74, 1], [1.36, -1.0], [1.36, -1.3]], true, 0.12)} fill="#3C454E" />
			<path d={sp([[1.86, -0.5], [1.97, -0.76], [1.94, -1.0], [1.84, -1.12], [1.84, -0.74], [1.74, -0.6]], true, 0.2)} fill="#16141A" />
			<path d={sp([[1.28, -1.62, 1], [1.56, -1.5], [1.58, -1.0], [1.5, -0.74], [1.24, -0.74, 1], [1.3, -1.2]], true, 0.2)} fill="#16141A" />
			<ellipse cx={1.47} cy={-1.2} rx={0.06} ry={0.045} fill="#5A6470" />
			{ln('M1.58 -0.71Q1.72 -0.68 1.8 -0.6', '#16141A', c.LW * 0.9)}
		</g>,
		chin: () => null,
	}),
};
export const HEAD_SPEC = SPECS;
export type {Pt};

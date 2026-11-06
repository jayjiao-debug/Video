import React from 'react';
import {AmmitPose, AMMIT_PIV, AMMIT_REST} from '../qq60/rig60';
import {M, T, R, chain, ap, mx, sp, poly, Pt, PAL, Role, lerp, cl, V} from '../qq60/geo60';

/* ep61 · Ammit61 — the ep60 Ammit2 (act60b_kit.tsx, unchanged and still used by ep60) forked for ep61 with the face rig fixed:
   the mouth interior is a wedge between the upper gape and the turned lower gape (fills the open mouth to the snout tips, no background
   between the jaws); the teeth of both jaws are clipped to that wedge (no tooth outside the mouth or past the snout outline); eye and
   brow are clipped to the skull; new face states: fs.eyes 0..1 (upper lid closes), fs.brow −1 frown … +1 raised, fs.look −1…+1.
   Body, mane, legs, tail, pivots and poses are Ammit2's, so every ep60 pose carries over.  `guide` = outlines only (FACECHECK61). */
type C = {OW: number; LW: number};
const cx = (s: number): C => ({OW: 2.7 / s, LW: 1.5 / s});
const col = (r: Role | string) => (PAL as Record<string, string>)[r] ?? r;
const Solid: React.FC<{d: string; r: Role | string; c: C; m?: M; k?: number; o?: number}> = ({d, r, c, m, k = 1, o}) => <g transform={m && mx(m)} opacity={o}>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={col(r)} /></g>;
export type Ammit61Face = {eyes?: number; brow?: number; look?: number};
export const AMMIT61_REST = AMMIT_REST;
export const ammit61Solve = (p: AmmitPose, roar = 0) => {
	const lean = p.lean + 5 * roar, B = chain(T(AMMIT_PIV.hip[0], AMMIT_PIV.hip[1]), R(-lean));
	const N = chain(B, T(AMMIT_PIV.neck[0] + 0.85 * roar, AMMIT_PIV.neck[1] + 0.1 * roar), R(-(p.neck + 4 * roar) + lean * 0.6));
	const J_ = chain(N, T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(Math.max(p.jaw, 46 * roar)));
	return {B, N, J: J_};
};
const AM_BODY61 = (br: number) => sp([[-2.6, 2.38, 1], [-3.15, 1.0], [-3.1, -0.7], [-2.45, -2.1], [-0.9, -2.95], [0.9, -3.2], [2.2, -3.5], [3.2, -3.9], [4.2, -3.65], [4.85 + br * 0.08, -2.6], [4.8 + br * 0.1, -1.0], [4.1, 0.3], [2.9, 0.95], [1.7, 1.3], [0.2, 1.9], [-1.4, 2.32]], true, 0.17);
export const Ammit61: React.FC<{pose: AmmitPose; x: number; face?: 1 | -1; y: number; s: number; t?: number; mr?: number; fs?: Ammit61Face; guide?: string; wig?: number; look?: number; rim?: number; roar?: number; id?: string; inMouth?: React.ReactNode}> = ({pose, x, y, s, face = 1, t = 0, mr = 0, wig = 0, look: look0 = 0.6, rim = 0, roar = 0, id = 'am61', inMouth, fs = {}, guide}) => {
	const look = fs.look !== undefined ? fs.look * 1.2 : look0, c = cx(s), g = ammit61Solve(pose, roar), br = pose.breathe, bristle = Math.max(roar, 0.35 * mr);
	const W = chain(g.B, T(3.0, -1.6), R(wig), T(-3.0, 1.6));
	const body = AM_BODY61(br), paw = pose.paw ?? 0, rimC = '#FF3A1E', ink = PAL.ink;
	const S0 = ap(g.B, [AMMIT_PIV.shoulder[0], AMMIT_PIV.shoulder[1]]);
	// forelegs between the (moving) shoulder and the (planted) paw: fill shape grows up into the chest; outline only below
	const fore = (dx: number, pw: number) => { const S: V = [S0[0] + dx * 0.5, S0[1]], P: V = [3.35 + dx + pw, 0];
		const fill = sp([[S[0] - 1.05, S[1] - 0.5], [S[0] + 0.95, S[1] - 0.7], [S[0] + 0.85, S[1] + 1.2], [P[0] + 0.5, P[1] - 1.6], [P[0] + 0.62, P[1] - 0.62], [P[0] + 1.5, P[1] - 0.45], [P[0] + 1.66, P[1], 1], [P[0] - 0.58, P[1], 1], [P[0] - 0.52, P[1] - 1.5], [S[0] - 0.62, S[1] + 1.4]], true, 0.17);
		const edge = sp([[S[0] + 0.85, S[1] + 1.2], [P[0] + 0.5, P[1] - 1.6], [P[0] + 0.62, P[1] - 0.62], [P[0] + 1.5, P[1] - 0.45], [P[0] + 1.66, P[1], 1], [P[0] - 0.58, P[1], 1], [P[0] - 0.52, P[1] - 1.5], [S[0] - 0.62, S[1] + 1.4]], false, 0.17);
		const claws = [0.62, 1.02, 1.42].map((k) => <path key={k} d={`M${P[0] + k} -0.1L${P[0] + k + 0.36} 0.04L${P[0] + k + 0.04} 0.07Z`} fill="#F8F3E7" stroke={ink} strokeWidth={c.LW * 0.7} />);
		const toes = [0.45, 0.85].map((k) => <path key={k} d={`M${P[0] + k + 0.15} -0.02L${P[0] + k + 0.05} -0.34`} stroke={ink} strokeWidth={c.LW} />);
		return {fill, edge, claws, toes}; };
	const far = fore(-0.95, 0), near = fore(0, paw);
	// near hind foot, planted forward under the belly (fill grows up into the haunch)
	const hf = ap(W, [0.45, 2.4]), hind = {fill: sp([[hf[0] - 1.6, hf[1] - 2.2], [hf[0] + 0.5, hf[1] - 2.0], [hf[0] + 1.35, hf[1] - 0.62], [hf[0] + 1.55, hf[1] - 0.1], [hf[0] + 1.5, 0, 1], [hf[0] - 1.0, 0, 1], [hf[0] - 1.5, -0.6]], true, 0.17),
		edge: sp([[hf[0] + 0.62, hf[1] - 1.75], [hf[0] + 1.35, hf[1] - 0.62], [hf[0] + 1.55, hf[1] - 0.1], [hf[0] + 1.5, 0, 1], [hf[0] - 1.0, 0, 1], [hf[0] - 1.5, -0.6], [hf[0] - 1.62, hf[1] - 1.3]], false, 0.17)};
	const farHind = sp([[1.0, 0.9], [2.4, 0.8], [2.5, 1.9], [2.8, 2.4, 1], [1.1, 2.4, 1], [0.95, 1.8]], true, 0.17);
	const tailM = chain(W, T(-3.0, -0.5), R(30 + pose.tail + 5 * Math.sin(t * 1.7)));
	const tail = sp([[-0.2, -0.1], [0.22, -0.05], [0.24, 0.7], [0.34, 1.25], [-0.12, 1.32], [-0.3, 0.7]]);
	// the mane: a ruff of locks round the neck joint (back, top, chin), bristling on the roar
	const NL = 22, a0 = 62, a1 = 336, mane = sp([...Array.from({length: NL * 2 + 1}, (_, i) => { const a = (a0 + (i / (NL * 2)) * (a1 - a0)) * Math.PI / 180, out = i % 2 === 0;
		const rr = out ? 2.55 + 0.28 * Math.sin(i * 1.7) + 0.75 * bristle + 0.2 * mr * Math.sin(t * 17 + i) + 0.06 * bristle * Math.sin(t * 40 + i * 2) : 1.95 + 0.25 * bristle;
		return [-0.5 + Math.cos(a) * rr * 0.95, 0.55 + Math.sin(a) * rr * 1.12] as Pt; }), [0.9, 0.0], [0.55, 1.4]], true, 0.1);
	const maneIn = sp(Array.from({length: NL * 2 + 1}, (_, i) => { const a = (a0 + 8 + (i / (NL * 2)) * (a1 - a0 - 16)) * Math.PI / 180, out = i % 2 === 0;
		const rr = out ? 1.9 + 0.18 * Math.sin(i * 2.3) + 0.45 * bristle + 0.15 * mr * Math.sin(t * 17 + i + 1) : 1.4;
		return [-0.4 + Math.cos(a) * rr * 0.95, 0.5 + Math.sin(a) * rr * 1.1] as Pt; }), true, 0.1);
	// the head: long croc skull and lower jaw, interlocking teeth, a raised eye under a heavy brow
	const skull = sp([[-0.55, -1.15], [0.2, -1.78], [1.1, -2.08], [1.75, -2.38], [2.45, -2.0], [3.4, -1.64], [4.8, -1.34], [6.0, -1.16], [6.42, -1.32], [6.86, -1.06], [6.95, -0.6, 1], [6.6, -0.16, 1], [4.0, -0.1], [1.2, -0.08, 1], [0.3, 0.15], [-0.45, 0.25]], true, 0.16);
	const jawD = sp([[-1.05, -0.12, 1], [5.95, -0.14, 1], [6.18, 0.08], [5.6, 0.44], [3.0, 0.64], [0.6, 0.74], [-0.5, 0.56], [-1.1, 0.2]], true, 0.16);
	const jawTip = ap(chain(T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(Math.max(pose.jaw, 46 * roar))), [5.95, -0.14]), jawBack = ap(chain(T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(Math.max(pose.jaw, 46 * roar))), [0.2, 0.3]);
	const open = Math.max(pose.jaw, 46 * roar);
	// ep61: mouth wedge in the neck frame N (the jaw frame J = N · T(jaw pivot) · R(open))
	const rmN = chain(T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(open));
	const jt = ap(rmN, [5.95, -0.06]), wmid: V = [lerp((6.5 + jt[0]) / 2, 0.7, 0.1), lerp((-0.24 + jt[1]) / 2, 0.05, 0.1)];
	const wedge = poly([[0.7, 0.05], [1.2, -0.16], [4.0, -0.18], [6.5, -0.24], wmid, ...([[5.95, -0.06], [3.0, -0.04], [0.4, -0.02]] as V[]).map((p) => ap(rmN, p))]);
	const eyes = cl(fs.eyes ?? 0), brw = cl(fs.brow ?? (roar > 0 ? -0.8 * roar : 0), -1, 1), lidY = -1.85 + 0.56 * eyes;
	const browM = chain(T(0, -0.1 * Math.max(brw, 0) + 0.06 * Math.max(-brw, 0)), T(1.15, -2.0), R(12 * Math.max(-brw, 0) - 4 * Math.max(brw, 0)), T(-1.15, 2.0));
	const upT = Array.from({length: 14}, (_, i) => { const xx = 1.35 + i * 0.38, L = i === 2 || i === 9 || i === 12 ? 0.46 : 0.27; return <path key={i} d={`M${xx} -0.16L${xx + 0.09} ${-0.1 + L}L${xx + 0.19} -0.16Z`} fill={PAL.white} stroke={ink} strokeWidth={c.LW * 0.6} />; });
	const loT = Array.from({length: 13}, (_, i) => { const xx = 0.6 + i * 0.4, L = i === 1 || i === 8 || i === 12 ? 0.44 : 0.26; return <path key={i} d={`M${xx} -0.06L${xx + 0.1} ${-0.12 - L}L${xx + 0.2} -0.06Z`} fill={PAL.white} stroke={ink} strokeWidth={c.LW * 0.6} />; });
	const lion = poly([[1.0, -4.6], [6.0, -4.6], [6.0, 2.5], [1.45, 2.5], [1.2, 1.4], [1.55, 0.6], [1.05, -0.2], [1.5, -1.0], [1.0, -1.8], [1.45, -2.6], [0.95, -3.4], [1.35, -4.0]]);
	const tufts = [[1.2, 1.4], [1.05, -0.2], [1.0, -1.8], [0.95, -3.4]].map(([a, b], i) => <path key={i} d={`M${a + 0.3} ${b - 0.35}L${a - 0.45} ${b + 0.1}L${a + 0.35} ${b + 0.4}Z`} fill={PAL.lion} />);
	const pid = `${id}-${face}`;
	const rimStroke = (d: string, m: M, k = 8) => <path d={d} transform={mx(m)} fill="none" stroke={rimC} strokeWidth={c.OW * k} strokeLinejoin="round" />;
	if (guide) return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<path d={skull} transform={mx(g.N)} fill="none" stroke={guide} strokeWidth={c.LW * 0.9} /><path d={jawD} transform={mx(g.J)} fill="none" stroke={guide} strokeWidth={c.LW * 0.9} /></g>;
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<defs>
			<clipPath id={`${pid}-clip`}><path d={body} transform={mx(W)} /></clipPath>
			<mask id={`${pid}-mask`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={40} height={40}><rect x={-20} y={-20} width={40} height={40} fill="white" /><path d={body} transform={mx(W)} fill="black" /></mask>
		</defs>
		{/* rim light: thick red strokes behind the whole silhouette, only their outer half shows */}
		{rim > 0 && <g opacity={rim} style={{mixBlendMode: 'screen'}}>
			{rimStroke(body, W)}{rimStroke(mane, g.N, 7)}{rimStroke(skull, g.N, 7)}{rimStroke(jawD, g.J, 7)}
			<path d={near.fill} fill="none" stroke={rimC} strokeWidth={c.OW * 7} /><path d={far.fill} fill="none" stroke={rimC} strokeWidth={c.OW * 7} />
		</g>}
		{/* far legs and the tail, behind the body */}
		<path d={farHind} transform={mx(W)} fill={PAL.hippo2} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
		<path d={far.fill} fill={PAL.lion2} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />{far.claws}
		<g transform={mx(tailM)}><Solid d={tail} r="hippo" c={c} />{[-0.2, 0.0, 0.2].map((dx) => <path key={dx} d={`M${dx * 0.8} 1.2L${dx * 1.6} 1.75`} stroke={ink} strokeWidth={c.LW * 2.2} strokeLinecap="round" />)}</g>
		{/* the body: one silhouette, hippo rump into lion forepart without a seam */}
		<path d={body} transform={mx(W)} fill={PAL.hippo} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
		<g clipPath={`url(#${pid}-clip)`}><g transform={mx(W)}>
			<ellipse cx={-1.4} cy={0.3} rx={1.9} ry={1.7} fill={PAL.hippo2} opacity={0.35} />
			<ellipse cx={-1.0} cy={-0.2} rx={1.5} ry={1.3} fill={PAL.hippo} />
			<path d="M-2.9 -0.9Q-1.9 -2.5 -0.2 -2.85" fill="none" stroke="#D27A55" strokeWidth={c.LW * 3.4} opacity={0.75} />
			<path d={lion} fill={PAL.lion} />{tufts}
			<ellipse cx={3.6} cy={0.4} rx={1.6} ry={0.7} fill={PAL.lion2} opacity={0.5} />
			{([[2.9, -2.6], [3.7, -1.7], [3.2, -0.6], [4.1, -0.3], [2.3, -1.6], [2.6, -0.2]] as V[]).map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={0.2} ry={0.13} fill={PAL.lion2} />)}
			<path d="M-2.3 1.1Q-0.6 2.1 1.1 1.55" fill="none" stroke={PAL.hippo2} strokeWidth={c.LW * 3} opacity={0.6} />
		</g></g>
		{/* near legs in front of the body: fills overlap it, outlines only outside it */}
		<path d={hind.fill} fill={PAL.hippo} />
		<path d={near.fill} fill={PAL.lion} />
		<g mask={`url(#${pid}-mask)`}>
			<path d={hind.edge} fill="none" stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" strokeLinecap="round" />
			<path d={near.edge} fill="none" stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" strokeLinecap="round" />
		</g>
		{[0.45, 0.85].map((k) => <line key={k} x1={hf[0] + k} y1={-0.02} x2={hf[0] + k - 0.1} y2={-0.32} stroke={ink} strokeWidth={c.LW} />)}
		{near.toes}{near.claws}
		{/* the mane over the neck joint */}
		<g transform={mx(g.N)}>
			<path d={mane} fill={PAL.lion2} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
			<path d={maneIn} fill={PAL.lion} />
			{Array.from({length: 11}, (_, i) => { const a = (75 + i * 25) * Math.PI / 180, r0 = 0.9, r1 = 2.05 + 0.45 * bristle + 0.15 * mr * Math.sin(t * 17 + i * 2);
				return <path key={i} d={`M${-0.45 + Math.cos(a) * r0 * 0.95} ${0.5 + Math.sin(a) * r0 * 1.1}Q${-0.45 + Math.cos(a + 0.12) * (r0 + r1) / 2 * 0.95} ${0.5 + Math.sin(a + 0.12) * (r0 + r1) / 2 * 1.1} ${-0.45 + Math.cos(a) * r1 * 0.95} ${0.5 + Math.sin(a) * r1 * 1.1}`} fill="none" stroke={PAL.lion2} strokeWidth={c.LW * 2.2} />; })}
			{/* the mouth (ep61 fix): a wedge from the hinge between the upper gape (pushed into the skull) and the TURNED lower gape (pushed into
			    the jaw) — fills the mouth to the snout tips at every angle; teeth of both jaws clipped to it, so no tooth floats outside the mouth */}
			<defs><clipPath id={`${pid}-mo`}><path d={wedge} /></clipPath><clipPath id={`${pid}-sk`}><path d={skull} /></clipPath></defs>
			{open > 0.5 && <g><path d={wedge} fill="#A3222F" />
				<g clipPath={`url(#${pid}-mo)`}>
					<path d={poly([[0.7, 0.05], [2.6, -0.2], ap(rmN, [1.6, 0.0])])} fill="#3A0408" />
					<path d={sp([[0.4, -0.02], [3.0, -0.16], [4.2, -0.1], [3.0, 0.0], [0.6, 0.08]], true, 0.2)} transform={mx(rmN)} fill="#C4505A" stroke={ink} strokeWidth={c.LW * 0.6} />
					{upT}<g transform={mx(rmN)}>{loT}</g></g></g>}
		</g>
		{inMouth && <g transform={`scale(${1 / (s * face)},${1 / s}) translate(${-x},${-y})`}>{inMouth}</g>}
		<g transform={mx(g.N)}>
					</g>
		<g transform={mx(g.J)}><Solid d={jawD} r="croc" c={c} />
			<path d="M0.2 0.4Q2.6 0.56 5.2 0.32" fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.8} />
			{[1.4, 2.4, 3.4, 4.4].map((xx) => <path key={xx} d={`M${xx} 0.12L${xx + 0.25} 0.5`} stroke={PAL.croc2} strokeWidth={c.LW * 1.2} />)}</g>
		<g transform={mx(g.N)}>
			<Solid d={skull} r="croc" c={c} />
			<g clipPath={`url(#${pid}-sk)`}>
			{[2.7, 3.3, 3.9, 4.5, 5.1].map((xx, i) => <path key={xx} d={`M${xx - 0.16} ${-1.55 + i * 0.065 + 0.05}Q${xx} ${-1.75 + i * 0.065} ${xx + 0.16} ${-1.55 + i * 0.065 + 0.05}`} fill={PAL.croc2} stroke={ink} strokeWidth={c.LW * 0.8} />)}
			{[2.4, 3.0, 3.6, 4.2, 4.8, 5.4].map((xx) => <path key={'l' + xx} d={`M${xx} ${-1.3 + (xx - 2.4) * 0.05}Q${xx + 0.16} -0.75 ${xx} -0.3`} fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.3} />)}
			<ellipse cx={6.55} cy={-1.2} rx={0.13} ry={0.08} fill={ink} />
			{/* the eye on its raised socket, under a heavy brow, glowing */}
			<ellipse cx={1.8} cy={-1.6} rx={0.56} ry={0.42} fill={PAL.croc2} stroke={ink} strokeWidth={c.LW * 1.2} />
			<circle cx={1.85} cy={-1.58} r={0.55} fill="url(#g60-gold)" opacity={0.55} style={{mixBlendMode: 'screen'}} />
			<ellipse cx={1.86} cy={-1.57} rx={0.33} ry={0.24} fill="#FFC21A" stroke={ink} strokeWidth={c.LW * 1.4} />
			<g clipPath={`url(#${pid}-eye)`}><ellipse cx={1.86 + 0.1 * Math.cos(look)} cy={-1.57 - 0.05 * Math.sin(look)} rx={0.065} ry={0.21} fill={ink} />
				<circle cx={1.78} cy={-1.65} r={0.05} fill="#FFFFFF" />
				{/* the upper lid closes down over the eye (eyes 0 open … 1 closed) */}
				{eyes > 0.02 && <path d={`M1.4 -2.0L2.3 -2.0L2.3 ${lidY}Q1.86 ${lidY + 0.08} 1.4 ${lidY}Z`} fill={PAL.croc2} />}</g>
			<defs><clipPath id={`${pid}-eye`}><ellipse cx={1.86} cy={-1.57} rx={0.33} ry={0.24} /></clipPath></defs>
			{eyes > 0.02 && <path d={`M1.53 ${lidY}Q1.86 ${lidY + 0.08} 2.19 ${lidY}`} fill="none" stroke={ink} strokeWidth={c.LW * (eyes > 0.9 ? 2.2 : 1.6)} strokeLinecap="round" />}
			<g transform={mx(browM)}><path d={sp([[1.15, -2.0, 1], [2.45, -1.86], [2.6, -1.68, 1], [2.1, -1.74], [1.3, -1.8]], true, 0.2)} fill={PAL.croc2} stroke={ink} strokeWidth={c.LW * 1.2} /></g>
			<path d="M0.15 -1.75Q0.4 -0.8 0.1 0.12" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3.2} /><path d="M0.15 -1.75Q0.4 -0.8 0.1 0.12" fill="none" stroke={ink} strokeWidth={c.LW * 0.8} />
			</g>
		</g>
	</g>;
};
export type {Pt};

import React from 'react';
import {PAL, sp, poly, mx, M, T, R, chain} from '../qq60/geo60';
import {Eye} from '../qq60/rig60';

/* ep61 · face layer for the ep60/ep61 god heads (head frame: face +x, neck pivot at 0,0).
   The ep60 rig draws ONE fixed open eye per head. Expressions are drawn on top, per head type:
     eyes  0 open · 0.5 half · 1 closed        look  -1 back … +1 front (iris moves inside the eye)
     brow  +1 raised (surprise / pleased) … 0 rest … -1 frowning (inner end down)
     smile 0..1 (human heads: mouth corner and cheek crease)       mouth 0..1 (human heads: small open mouth)
   The eye is re-drawn with the SAME Eye geometry as the rig (x, y, L, kohl tail), after painting the head fill over the original eye. */
export type Look = {eyes?: number; look?: number; brow?: number; smile?: number; mouth?: number};
export type HeadKind61 = 'human' | 'jackal' | 'ibis' | 'falcon' | 'lioness' | 'cat' | 'seth';
type Ctx = {OW: number; LW: number};
type EyeSpec = {x: number; y: number; L: number; rim: string; tail: number; brow: boolean; sclera?: string};
/** eye placement per head type: copied from rig60.tsx (human, jackal, ibis, falcon) and cast61.tsx (lioness, cat, seth) */
export const EYES: Record<HeadKind61, EyeSpec> = {
	human: {x: 0.98, y: -1.17, L: 0.48, rim: PAL.black, tail: 0.36, brow: true},
	jackal: {x: 1.4, y: -1.38, L: 0.46, rim: PAL.gold, tail: 0.3, brow: false},
	ibis: {x: 0.62, y: -1.32, L: 0.4, rim: PAL.gold, tail: 0.22, brow: false},
	falcon: {x: 1.04, y: -1.3, L: 0.5, rim: PAL.ink, tail: 0.25, brow: false},
	lioness: {x: 1.2, y: -1.55, L: 0.56, rim: PAL.gold2, tail: 0.4, brow: false},
	cat: {x: 1.1, y: -1.5, L: 0.6, rim: PAL.ink, tail: 0.4, brow: false},
	seth: {x: 1.22, y: -1.6, L: 0.6, rim: PAL.ink, tail: 0.3, brow: false, sclera: PAL.red},
};
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export const FaceOver: React.FC<{kind: HeadKind61; fill: string; c: Ctx; look: Look; id: string}> = ({kind, fill, c, look, id}) => {
	const e = EYES[kind], {x, y, L, tail} = e, closed = cl(look.eyes ?? 0), lk = cl(look.look ?? 0.2, -1, 1), br = cl(look.brow ?? 0, -1, 1);
	const open = Math.max(1 - closed, 0.06), h = L * 0.36 * open * 1.25 + L * 0.02;
	const al = sp([[x - L * 0.55, y, 1], [x - L * 0.2, y - h], [x + L * 0.25, y - h * 0.9], [x + L * 0.45, y + h * 0.05, 1], [x + L * 0.15, y + h * 0.75], [x - L * 0.25, y + h * 0.6]], true, 0.2);
	const cid = `${id}-eye`, sc = e.sclera ?? PAL.eye, ir = L * 0.17;
	// brow: base is a tapered bar above the eye, raised / lowered / tilted about its back end
	const bx0 = x - L * 0.95, bx1 = x + L * 0.5, by = y - L * 0.58, thick = L * (0.15 + 0.05 * Math.max(0, -br));
	const dy = -L * 0.5 * Math.max(br, 0) + L * 0.1 * Math.max(0, -br), rotA = 24 * Math.max(0, -br) - 6 * Math.max(br, 0);
	const browD = sp([[bx1, by - thick * 0.4], [x - L * 0.1, by - thick * 1.6 - L * 0.1 * Math.max(br, 0)], [bx0 + L * 0.15, by - thick], [bx0, by + thick * 0.5, 1], [x - L * 0.1, by - thick * 0.2], [bx1 - L * 0.05, by + thick * 0.7, 1]], true, 0.15);
	const browM: M = chain(T(bx0, by), R(rotA), T(-bx0, -by + dy));
	const showBrow = e.brow || Math.abs(br) > 0.12;
	const patchTop = e.brow || Math.abs(br) > 0.12 ? L * 0.95 : L * 0.45;
	const mouth = look.mouth ?? 0, smile = cl(look.smile ?? 0);
	return <g>
		{/* paint the head fill over the rig's own eye (and brow) */}
		<path d={sp([[x - L * 0.95 - tail, y - patchTop * 0.4, 1], [x - L * 0.3, y - patchTop], [x + L * 0.55, y - patchTop * 0.7, 1], [x + L * 0.62, y + L * 0.2, 1], [x + L * 0.1, y + L * 0.62], [x - L * 0.6 - tail * 0.6, y + L * 0.38, 1]], true, 0.2)} fill={fill} />
		<defs><clipPath id={cid}><path d={al} /></clipPath></defs>
		<path d={al} fill={sc} />
		{closed < 0.9 && <g clipPath={`url(#${cid})`}><circle cx={x + L * 0.08 + lk * L * 0.2} cy={y - h * 0.05} r={Math.min(ir * 1.5, h * 0.95)} fill={PAL.black} /></g>}
		<path d={al} fill="none" stroke={e.rim} strokeWidth={c.LW * 1.5} strokeLinejoin="round" />
		{closed > 0.55 && <path d={`M${x - L * 0.55} ${y}Q${x} ${y + L * 0.12} ${x + L * 0.45} ${y + h * 0.05}`} fill="none" stroke={e.rim === PAL.gold ? PAL.ink : e.rim} strokeWidth={c.LW * 2.2} strokeLinecap="round" />}
		<path d={sp([[x - L * 0.55, y - h * 0.08], [x - L * 0.55 - tail * 0.6, y + h * 0.05], [x - L * 0.55 - tail, y + h * 0.35, 1], [x - L * 0.55 - tail * 0.5, y + h * 0.4], [x - L * 0.5, y + h * 0.18]], true, 0.15)} fill={e.rim} />
		{showBrow && <path d={browD} transform={mx(browM)} fill={kind === 'human' ? PAL.black : PAL.ink} />}
		{kind === 'human' && (smile > 0.02 || mouth > 0.02) && <g>
			<path d={poly([[1.1, -0.62], [1.32, -0.62], [1.32, -0.34], [1.1, -0.34]])} fill={fill} />
			{mouth > 0.02 && <path d={sp([[1.14, -0.5 - 0.02 * smile, 1], [1.3, -0.52 - 0.04 * smile, 1], [1.27, -0.5 + 0.2 * mouth], [1.17, -0.46 + 0.22 * mouth]], true, 0.2)} fill="#5A1A1E" stroke={PAL.ink} strokeWidth={c.LW * 0.8} />}
			{mouth <= 0.02 && <path d={`M1.31 ${-0.5}Q1.2 ${-0.48 + 0.08 * smile} ${1.1 - 0.04 * smile} ${-0.5 - 0.1 * smile}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW} strokeLinecap="round" />}
			{smile > 0.1 && <path d={`M${1.08 - 0.04 * smile} ${-0.52 - 0.1 * smile}q-0.07 0.03 -0.1 0.09`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 0.8} strokeLinecap="round" />}
		</g>}
	</g>;
};
export {Eye};

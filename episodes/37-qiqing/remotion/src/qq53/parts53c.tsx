import React from 'react';
import {W, H, rnd, lerp, cl, SANS, KAI} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {Rimmed, Pose} from '../qq44/figure44';
import {grounded} from '../qq47/pose47';
import {ikArm, toBody, J} from '../qq51/partsB51';
import {LOOKS52} from '../qq52/props52';
import {Cam, poly, proj, V3, mix, P2} from './parts53';
/* ep53 · TakeC helpers copied from the key frames (kfD53: coffin, digger; kfE53: glove) so the key-frame files stay untouched.
   Digger: the reach is clamped instead of thrown (the digger walks with the lid, the hand never floats far). */
export const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => ({
	top: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] as V3[], front: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] as V3[],
	back: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]] as V3[], left: [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]] as V3[], right: [[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]] as V3[]});
export const LAC = '#1A110D', LAC_HI = '#4A3830', RED_LINE = '#6E2A1C';
/** an open lacquered coffin box (walls only), seen from the front-above */
export const OpenCoffin: React.FC<{c: Cam; x: number; y: number; z: number; t: number; id: string; inner?: string}> = ({c, x, y, z, t, id, inner = '#2A0F0A'}) => {
	const xo = x, yo = y, b = box(-xo, xo, -yo, yo, 0, z), bi = box(-xo + t, xo - t, -yo + t, yo - t, 0.04, z);
	return <g>
		<path d={poly(c, b.back)} fill={LAC} />
		<path d={poly(c, bi.back)} fill={inner} /><path d={poly(c, bi.left)} fill={mix(inner, '#000000', 0.3)} /><path d={poly(c, bi.right)} fill={mix(inner, '#000000', 0.2)} />
		<path d={poly(c, [[-xo + t, -yo + t, 0.04], [xo - t, -yo + t, 0.04], [xo - t, yo - t, 0.04], [-xo + t, yo - t, 0.04]])} fill={mix(inner, '#000000', 0.45)} />
		<path d={poly(c, b.left)} fill={mix(LAC, LAC_HI, 0.3)} /><path d={poly(c, b.right)} fill={LAC} />
		<path d={poly(c, b.front)} fill={mix(LAC, LAC_HI, 0.15)} />
		{/* the painted border on the lacquer (a thin red line), and the rim catching the lamp */}
		<path d={poly(c, [[-xo + 0.06, -yo - 0.001, z - 0.06], [xo - 0.06, -yo - 0.001, z - 0.06], [xo - 0.06, -yo - 0.001, 0.06], [-xo + 0.06, -yo - 0.001, 0.06]])} fill="none" stroke={RED_LINE} strokeWidth={2} strokeOpacity={0.7} />
		<path d={poly(c, [[-xo, -yo, z], [xo, -yo, z], [xo, yo, z], [-xo, yo, z]])} fill="none" stroke="#C89A60" strokeOpacity={0.55} strokeWidth={2} />
		<title>{id}</title>
	</g>; };
export const LOOK_DIG = LOOKS52.worker.look;
/** an excavator standing on the chamber floor at x, facing the coffin (dir +1 = facing screen-right); both hands on the lid
    end at world point grip (the near hand a little nearer the camera) */
export const Digger: React.FC<{c: Cam; xw: number; yw?: number; dir: 1 | -1; grip: V3; id: string}> = ({c, xw, yw = 0.05, dir, grip, id}) => {
	const f0 = proj(c, [xw, yw, 0]), h = c.f * 1.66 / f0[2], x = f0[0], g = f0[1], flip = proj(c, grip)[0] < x;   // upright billboard scaled by depth; faces its grip on screen
	const sd = flip ? -1 : 1, g0 = proj(c, grip), gN = [g0[0] - sd * 4, g0[1] + 9], gF = [g0[0] + sd * 6, g0[1] - 8];   // both hands on the lid's end edge (near hand a touch lower)
	let pose: Pose = grounded({lean: 24, neck: 6, lt: 16, lk: 22, rt: -10, rk: 16, la: 60, le: 20, ra: 60, re: 20});
	const tN: P2 = toBody(gN[0], gN[1], x, g, h, flip), tF: P2 = toBody(gF[0], gF[1], x, g, h, flip);
	pose = ikArm(ikArm(pose, 'L', tN), 'R', tF);
	return <g><Rimmed x={x} ground={g} h={h} pose={pose} look={LOOK_DIG} col="#18100C" flip={flip} rim="#FFD49A" rimOp={0.55} rimDx={(flip ? 1 : -1) * 2.4} rimDy={-2} />
		<title>{`${id} hands ${J(pose, 'LHand', x, g, h, flip).map((v) => v.toFixed(0))} / ${J(pose, 'RHand', x, g, h, flip).map((v) => v.toFixed(0))}`}</title></g>; };
/* ---------- a hand wrapped round a horizontal bar (seen from above) in one-tone lacquer brown: a tapered sleeve running off the frame
   edge, a cuff, a visible wrist, four fingers over the bar and the thumb along the top. #2B1A12 with a #4A2E14 rim light. ---------- */
const SLV = '#2B1A12', SLV_RIM = '#4A2E14', SLV_DK = '#1A0F0A';
export const Glove: React.FC<{x: number; y: number; w: number; bar: number; sleeveTo: [number, number]; id: string; rot?: number}> = ({x, y, w, bar, sleeveTo, id, rot = 0}) => {
	const hw = w / 2, hh = bar * 0.95;
	const wr: [number, number] = [x, y + hh * 0.95], sx = sleeveTo[0], sy = sleeveTo[1], dx = sx - wr[0], dy = sy - wr[1], dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl, nx = -uy, ny = ux;
	const wW = w * 0.2, cW = w * 0.3, sW0 = w * 0.34, sW1 = w * 0.58, q = (p: number, n: number): [number, number] => [wr[0] + ux * p + nx * n, wr[1] + uy * p + ny * n];
	const cuff0 = w * 0.34, cuff1 = w * 0.62;
	const P = (a: [number, number]) => `${a[0].toFixed(1)},${a[1].toFixed(1)}`;
	const sleeve = `M${P(q(cuff1, sW0))} L${P(q(dl, sW1))} L${P(q(dl, -sW1))} L${P(q(cuff1, -sW0))} Z`;
	const cuff = `M${P(q(cuff0, cW))} L${P(q(cuff1, sW0))} L${P(q(cuff1, -sW0))} L${P(q(cuff0, -cW))} Q${P(q(cuff0 - 6, 0))} ${P(q(cuff0, cW))} Z`;
	const wrist = `M${P(q(-hh * 0.3, wW))} L${P(q(cuff0 + 2, cW * 0.9))} L${P(q(cuff0 + 2, -cW * 0.9))} L${P(q(-hh * 0.3, -wW))} Z`;
	const rim = (a: number, b: number, n: number) => `M${P(q(a, n))} L${P(q(b, n * (b > a ? 1.0 : 1.0)))}`;
	return <g>
		<path d={sleeve} fill={SLV} />
		{[0.28, 0.5, 0.74].map((u) => { const p = cuff1 + (dl - cuff1) * u; return <path key={u} d={`M${P(q(p, sW0 + (sW1 - sW0) * u * 0.9))} Q${P(q(p + 24, (sW0 + (sW1 - sW0) * u) * 0.2))} ${P(q(p + 8, -(sW0 + (sW1 - sW0) * u) * 0.7))}`} stroke={SLV_DK} strokeOpacity={0.7} strokeWidth={4} fill="none" strokeLinecap="round" />; })}
		<path d={rim(cuff1, dl, sW0 + (sW1 - sW0) * 0)} stroke={SLV_RIM} strokeWidth={3} fill="none" opacity={0} />
		<path d={`M${P(q(cuff1, -sW0))} L${P(q(dl, -sW1))}`} stroke={SLV_RIM} strokeWidth={3.5} fill="none" strokeLinecap="round" />
		<path d={cuff} fill="#34200F" /><path d={`M${P(q(cuff0, -cW))} L${P(q(cuff1, -sW0))}`} stroke={SLV_RIM} strokeWidth={3} fill="none" />
		<path d={`M${P(q(cuff1, sW0))} L${P(q(cuff1, -sW0))}`} stroke={SLV_DK} strokeWidth={4} opacity={0.8} />
		<path d={wrist} fill={SLV} /><path d={`M${P(q(-hh * 0.3, -wW))} L${P(q(cuff0 + 2, -cW * 0.9))}`} stroke={SLV_RIM} strokeWidth={3} fill="none" />
		<g transform={`rotate(${rot} ${x} ${y})`}>
			<path d={`M${x - hw},${y - hh * 0.2} Q${x - hw},${y - hh} ${x - hw * 0.4},${y - hh} L${x + hw * 0.5},${y - hh} Q${x + hw},${y - hh} ${x + hw},${y - hh * 0.25} L${x + hw},${y + hh * 0.55} Q${x + hw},${y + hh * 0.95} ${x + hw * 0.6},${y + hh * 0.95} L${x - hw * 0.6},${y + hh * 0.95} Q${x - hw},${y + hh * 0.95} ${x - hw},${y + hh * 0.5} Z`} fill={SLV} />
			{[-0.5, 0, 0.5].map((u) => <path key={u} d={`M${x + u * hw},${y - hh * 0.9} L${x + u * hw},${y + hh * 0.25}`} stroke={SLV_DK} strokeWidth={3} strokeOpacity={0.85} strokeLinecap="round" />)}
			<path d={`M${x - hw * 0.95},${y - hh * 0.7} Q${x - hw * 0.3},${y - hh * 1.3} ${x + hw * 0.62},${y - hh * 1.08}`} stroke={SLV} strokeWidth={hh * 0.5} strokeLinecap="round" fill="none" />
			<path d={`M${x - hw * 0.95},${y - hh * 0.7} Q${x - hw * 0.3},${y - hh * 1.3} ${x + hw * 0.62},${y - hh * 1.08}`} stroke={SLV_DK} strokeWidth={2.5} strokeOpacity={0.75} fill="none" transform={`translate(0,${hh * 0.22})`} />
			<path d={`M${x - hw * 0.98},${y - hh * 0.95} Q${x - hw * 0.3},${y - hh * 1.5} ${x + hw * 0.62},${y - hh * 1.3}`} stroke={SLV_RIM} strokeWidth={3} fill="none" strokeLinecap="round" />
			<path d={`M${x - hw},${y - hh * 0.2} Q${x - hw},${y - hh} ${x - hw * 0.4},${y - hh} L${x + hw * 0.5},${y - hh} Q${x + hw},${y - hh} ${x + hw},${y - hh * 0.25}`} fill="none" stroke={SLV_RIM} strokeWidth={3} />
		</g>
	</g>; };

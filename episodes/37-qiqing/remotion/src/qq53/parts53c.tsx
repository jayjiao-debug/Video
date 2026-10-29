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
/* ---------- a gloved hand wrapped round a horizontal bar (seen from above), its sleeve running off the frame edge ---------- */
export const Glove: React.FC<{x: number; y: number; w: number; bar: number; sleeveTo: [number, number]; id: string; rot?: number}> = ({x, y, w, bar, sleeveTo, id, rot = 0}) => {
	const hw = w / 2, hh = bar * 0.95;   // the wrap is a little taller than the bar it holds
	const wr: [number, number] = [x, y + hh * 0.9], sx = sleeveTo[0], sy = sleeveTo[1], nx = -(sy - wr[1]), ny = sx - wr[0], nl = Math.hypot(nx, ny) || 1, sw = w * 0.42;
	const sleeve = `M${wr[0] + nx / nl * sw},${wr[1] + ny / nl * sw} L${sx + nx / nl * sw * 1.5},${sy + ny / nl * sw * 1.5} L${sx - nx / nl * sw * 1.5},${sy - ny / nl * sw * 1.5} L${wr[0] - nx / nl * sw},${wr[1] - ny / nl * sw} Z`;
	return <g>
		<defs><linearGradient id={`gv${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4C52" /><stop offset="0.5" stopColor="#2C2E34" /><stop offset="1" stopColor="#1A1B20" /></linearGradient></defs>
		<defs><linearGradient id={`sl${id}`} gradientUnits="userSpaceOnUse" x1={wr[0]} y1={wr[1]} x2={sx} y2={sy}><stop offset="0" stopColor="#262833" /><stop offset="1" stopColor="#101118" /></linearGradient></defs>
		<path d={sleeve} fill={`url(#sl${id})`} />
		{[0.35, 0.62].map((u) => { const cx = lerp(wr[0], sx, u), cy = lerp(wr[1], sy, u); return <path key={u} d={`M${cx + nx / nl * sw * (1 + u * 0.5) * 0.8},${cy + ny / nl * sw * (1 + u * 0.5) * 0.8} Q${cx + 10},${cy + 14} ${cx - nx / nl * sw * 0.3},${cy - ny / nl * sw * 0.3}`} stroke="#07080C" strokeOpacity={0.55} strokeWidth={3} fill="none" />; })}
		<path d={`M${wr[0] + nx / nl * sw},${wr[1] + ny / nl * sw} L${sx + nx / nl * sw * 1.5},${sy + ny / nl * sw * 1.5}`} stroke="#FFD49A" strokeOpacity={0.3} strokeWidth={2} />
		<g transform={`rotate(${rot} ${x} ${y})`}>
			{/* the cuff, the wrap of four fingers over the bar, the thumb along the top */}
			<rect x={x - hw * 0.8} y={y + hh * 0.55} width={w * 0.8} height={hh * 0.7} rx={hh * 0.25} fill="#23252C" />
			<path d={`M${x - hw},${y - hh * 0.2} Q${x - hw},${y - hh} ${x - hw * 0.4},${y - hh} L${x + hw * 0.5},${y - hh} Q${x + hw},${y - hh} ${x + hw},${y - hh * 0.25} L${x + hw},${y + hh * 0.55} Q${x + hw},${y + hh * 0.9} ${x + hw * 0.6},${y + hh * 0.9} L${x - hw * 0.6},${y + hh * 0.9} Q${x - hw},${y + hh * 0.9} ${x - hw},${y + hh * 0.5} Z`} fill={`url(#gv${id})`} />
			{[-0.5, 0, 0.5].map((u) => <path key={u} d={`M${x + u * hw},${y - hh * 0.95} L${x + u * hw},${y + hh * 0.2}`} stroke="#14151A" strokeWidth={2.5} strokeOpacity={0.7} />)}
			<path d={`M${x - hw * 0.9},${y - hh * 0.75} Q${x - hw * 0.3},${y - hh * 1.25} ${x + hw * 0.55},${y - hh * 1.05}`} stroke="#3C3E46" strokeWidth={hh * 0.42} strokeLinecap="round" fill="none" />
			<path d={`M${x - hw},${y - hh * 0.2} Q${x - hw},${y - hh} ${x - hw * 0.4},${y - hh} L${x + hw * 0.5},${y - hh}`} fill="none" stroke="#FFD49A" strokeOpacity={0.45} strokeWidth={2} />
		</g>
	</g>; };


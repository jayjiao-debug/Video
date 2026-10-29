import React from 'react';
import {W, H, rnd, lerp, cl, SANS, KAI} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Rimmed, Pose} from '../qq44/figure44';
import {grounded} from '../qq47/pose47';
import {ikArm, toBody, J} from '../qq51/partsB51';
import {LOOKS52} from '../qq52/props52';
import {Frame53, Sub53, Stamp53, DepthTag, Cam, lookAt, proj, poly, V3, mix, P2} from './parts53';
/* ep53 key frames, part D: D4 — inside the 1965 pit at the chamber floor (−10.8 m). The 椁 roof is already off; the near
   wall planks are down to one low plank (opened for access), so we see into the coffin chamber. The outer coffin's lid
   leans on the far wall (counted 1); two excavators at the two ends lift the inner coffin's lid (counted 2). The camera
   stays above and outside every lid. World units: metres; the chamber floor at z = 0. Figures: one tone, 1965 work jackets
   and caps, rim-lit by the hanging hurricane lamp; hands are aimed at the lid's end corners with two-bone IK and the reach
   is asserted (an unreachable grip throws, so the frame fails instead of showing a floating hand). */
const CAM_D4 = lookAt([0.12, -4.5, 4.5], [0, 0.3, 0.45], 1350, 960, 640);
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => ({
	top: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] as V3[], front: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] as V3[],
	back: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]] as V3[], left: [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]] as V3[], right: [[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]] as V3[]});
const LAC = '#1A110D', LAC_HI = '#4A3830', RED_LINE = '#6E2A1C';
/** an open lacquered coffin box (walls only), seen from the front-above */
const OpenCoffin: React.FC<{c: Cam; x: number; y: number; z: number; t: number; id: string; inner?: string}> = ({c, x, y, z, t, id, inner = '#2A0F0A'}) => {
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
const LOOK_DIG = LOOKS52.worker.look;
/** an excavator standing on the chamber floor at x, facing the coffin (dir +1 = facing screen-right); both hands on the lid
    end at world point grip (the near hand a little nearer the camera) */
const Digger: React.FC<{c: Cam; xw: number; dir: 1 | -1; grip: V3; id: string}> = ({c, xw, dir, grip, id}) => {
	const f0 = proj(c, [xw, 0.05, 0]), h = c.f * 1.66 / f0[2], x = f0[0], g = f0[1], flip = proj(c, grip)[0] < x;   // upright billboard scaled by depth; faces its grip on screen
	const sd = flip ? -1 : 1, g0 = proj(c, grip), gN = [g0[0] - sd * 4, g0[1] + 9], gF = [g0[0] + sd * 6, g0[1] - 8];   // both hands on the lid's end edge (near hand a touch lower)
	let pose: Pose = grounded({lean: 24, neck: 6, lt: 16, lk: 22, rt: -10, rk: 16, la: 60, le: 20, ra: 60, re: 20});
	const tN: P2 = toBody(gN[0], gN[1], x, g, h, flip), tF: P2 = toBody(gF[0], gF[1], x, g, h, flip);
	const reach = (s: 'L' | 'R', t: P2) => { const sh = pose[`${s}Sh`], d = Math.hypot(t[0] - sh[0], t[1] - sh[1]); if (d > 0.194 + 0.135 + 0.03) throw new Error(`${id}: ${s} hand cannot reach the lid (${d.toFixed(3)} body units)`); };
	reach('L', tN); reach('R', tF);
	pose = ikArm(ikArm(pose, 'L', tN), 'R', tF);
	return <g><Rimmed x={x} ground={g} h={h} pose={pose} look={LOOK_DIG} col="#18100C" flip={flip} rim="#FFD49A" rimOp={0.55} rimDx={(flip ? 1 : -1) * 2.4} rimDy={-2} />
		<title>{`${id} hands ${J(pose, 'LHand', x, g, h, flip).map((v) => v.toFixed(0))} / ${J(pose, 'RHand', x, g, h, flip).map((v) => v.toFixed(0))}`}</title></g>; };
export const KF06: React.FC = () => { const c = CAM_D4;
	/* chamber: walls 0.18 thick, interior x ±2.3, y ±1.3, far wall full height 1.9, near wall cut down to one plank (0.42) */
	const far = box(-2.48, 2.48, 1.3, 1.48, 0, 1.9), left = box(-2.48, -2.3, -1.48, 1.48, 0, 1.9), right = box(2.3, 2.48, -1.48, 1.48, 0, 1.9), near = box(-2.48, 2.48, -1.48, -1.3, 0, 0.42);
	const planks = (x0: number, x1: number, y: number, z0: number, z1: number, n: number) => Array.from({length: n - 1}, (_, i) => { const z = lerp(z0, z1, (i + 1) / n); return <path key={`${y}${i}`} d={poly(c, [[x0, y, z], [x1, y, z]], false)} stroke="#120A06" strokeOpacity={0.55} strokeWidth={1.5} fill="none" />; });
	/* the inner lid, lifted: left end up 0.34, right end up 0.24, pulled a little toward the camera */
	const L0 = 0.86, lid = (x: number, y: number, top: boolean): V3 => [x, y - 0.03, (x < 0 ? L0 + 0.34 : L0 + 0.24) + (top ? 0.07 : 0)];
	const lidTop = [lid(-1.12, -0.38, true), lid(1.12, -0.38, true), lid(1.12, 0.38, true), lid(-1.12, 0.38, true)];
	const lidFront = [lid(-1.12, -0.38, true), lid(1.12, -0.38, true), lid(1.12, -0.38, false), lid(-1.12, -0.38, false)];
	const lidEndL = [lid(-1.12, -0.38, true), lid(-1.12, 0.38, true), lid(-1.12, 0.38, false), lid(-1.12, -0.38, false)];
	const lamp = proj(c, [0.25, -0.15, 2.35]), lampTop = proj(c, [0.25, -0.15, 6]);
	const tag = (p: [number, number, number], n: string, id: string) => <g key={id}><circle cx={p[0]} cy={p[1]} r={34} fill="#120A06" opacity={0.6} /><circle cx={p[0]} cy={p[1]} r={30} fill="none" stroke={B.goldL} strokeWidth={3} />
		<text x={p[0]} y={p[1] + 18} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={50} fill={B.goldL}>{n}</text></g>;
	return <Frame53 id="k6" ground={false} vig={0.58} over={<><Sub53 id="D4" /><Stamp53 id="D4" /><DepthTag v={10.8} gold /><SealHollow /></>}>
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#24201A" />
		{/* the pit wall behind: white clay, lit from the lamp; the roof planks lifted out lean against it */}
		<path d={poly(c, [[-4, 2.2, 0], [4, 2.2, 0], [4, 2.2, 6], [-4, 2.2, 6]])} fill="#7E7A6C" />
		<Pool id="k6w" x={lamp[0]} y={lamp[1] - 60} rx={900} ry={420} a={0.32} col="#FFC888" />
		{Array.from({length: 40}, (_, i) => { const p = proj(c, [-4 + 8 * rnd(i, 3), 2.19, 6 * rnd(i, 4)]); return <circle key={i} cx={p[0]} cy={p[1]} r={2 + 4 * rnd(i, 5)} fill="#4E4A40" opacity={0.3} />; })}
		{[-3.1, -2.75].map((x, i) => <path key={`rp${i}`} d={poly(c, [[x, 2.1, 0.05], [x + 0.3, 2.1, 0.05], [x + 0.3 + 0.12, 2.18, 3.6], [x + 0.12, 2.18, 3.6]])} fill="#2E1E14" stroke="#120A06" strokeWidth={1.5} />)}
		{/* chamber floor */}
		<path d={poly(c, [[-2.3, -1.3, 0], [2.3, -1.3, 0], [2.3, 1.3, 0], [-2.3, 1.3, 0]])} fill="#3A2A1E" />
		<path d={poly(c, far.front)} fill="#4A3426" />{planks(-2.3, 2.3, 1.299, 0, 1.9, 6)}
		<path d={poly(c, far.top)} fill="#4A3424" />
		<path d={poly(c, left.right)} fill="#2A1C14" /><path d={poly(c, right.left)} fill="#241812" />
		<path d={poly(c, left.top)} fill="#4A3424" /><path d={poly(c, right.top)} fill="#4A3424" />
		{/* the outer coffin's lid (1), leaning on the far wall */}
		<path d={poly(c, [[-1.35, 0.8, 0.02], [1.35, 0.8, 0.02], [1.35, 1.27, 1.75], [-1.35, 1.27, 1.75]])} fill="#1A100C" stroke="#D8A868" strokeOpacity={0.55} strokeWidth={2} />
		<path d={poly(c, [[-1.25, 0.84, 0.14], [1.25, 0.84, 0.14], [1.25, 1.24, 1.64], [-1.25, 1.24, 1.64]])} fill="none" stroke={RED_LINE} strokeOpacity={0.7} strokeWidth={2} />
		<Pool id="k6p" x={proj(c, [0, 0, 0.9])[0]} y={proj(c, [0, 0, 0.9])[1]} rx={760} ry={360} a={0.4} col="#FFB060" />
		{/* outer coffin (open), the inner coffin inside it (its lid lifting) */}
		<OpenCoffin c={c} x={1.32} y={0.52} z={1.04} t={0.08} id="outer" inner="#1E0C08" />
		<g transform="translate(0,0)"><OpenCoffin c={c} x={1.12} y={0.38} z={0.86} t={0.07} id="inner" inner="#240C08" /></g>
		{/* the gap under the lid: the dark inside, the lamp light just reaching in */}
		<path d={poly(c, [lid(-1.12, -0.38, false), lid(1.12, -0.38, false), [1.12, -0.41, L0], [-1.12, -0.41, L0]])} fill="#050302" opacity={0.85} />
		<Digger c={c} xw={-1.56} dir={1} grip={[-1.14, -0.03, L0 + 0.37]} id="digL" />
		<Digger c={c} xw={1.55} dir={-1} grip={[1.14, -0.03, L0 + 0.27]} id="digR" />
		<path d={poly(c, lidEndL)} fill="#1E1410" />
		<path d={poly(c, lidFront)} fill="#1A110D" />
		<path d={poly(c, lidTop)} fill="#140C0A" stroke="#D8A868" strokeOpacity={0.6} strokeWidth={2} />
		<path d={poly(c, [lid(-1.0, -0.3, true), lid(1.0, -0.3, true), lid(1.0, 0.3, true), lid(-1.0, 0.3, true)])} fill="none" stroke={RED_LINE} strokeOpacity={0.6} strokeWidth={2} />
		{/* the near wall, cut down to one plank */}
		<path d={poly(c, near.top)} fill="#4A3424" /><path d={poly(c, near.front)} fill="#2A1C14" />{planks(-2.48, 2.48, -1.481, 0, 0.42, 2)}
		{/* the hurricane lamp hung from a beam across the pit */}
		<path d={`M${lampTop[0]},${-20} L${lamp[0]},${lamp[1] - 34}`} stroke="#0A0605" strokeWidth={2.5} />
		<Pool id="k6l" x={lamp[0]} y={lamp[1]} rx={150} ry={130} a={0.55} col="#FFD490" />
		<g transform={`translate(${lamp[0]},${lamp[1]})`}><path d="M-14,-34 Q0,-48 14,-34" fill="none" stroke="#2A1E16" strokeWidth={3} /><rect x={-16} y={-30} width={32} height={8} rx={3} fill="#2A1E16" />
			<ellipse cx={0} cy={0} rx={15} ry={22} fill="#FFE8B8" opacity={0.95} /><ellipse cx={0} cy={2} rx={6} ry={10} fill="#FFFFFF" /><rect x={-17} y={20} width={34} height={9} rx={3} fill="#2A1E16" />
			<path d={'M-15,-22 L-15,20 M15,-22 L15,20'} stroke="#2A1E16" strokeWidth={3} /></g>
		{tag(proj(c, [-0.9, 1.1, 1.3]), '1', 't1')}
		{tag(proj(c, [0.15, -0.05, L0 + 0.62]), '2', 't2')}
	</Frame53>; };
void rnd; void cl; void KAI; void H;

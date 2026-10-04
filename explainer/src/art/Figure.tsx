import React from 'react';
import {random} from 'remotion';
import {P} from './palette';

/**
 * A posable character. One skeleton and one set of proportions (~5.5 heads) keep
 * the whole cast consistent; looks (outfit, hair, accessories) and poses vary.
 *
 * Local coordinates: origin between the feet, figure ~340 units tall, facing right
 * in three-quarter view (mirror with `flip`). `facing: 'back'` draws the figure
 * from behind, the reference films' favourite storytelling shot.
 *
 * Limbs are tapered shapes, not sticks. Arms can be posed by angles or by a hand
 * target (two-bone IK): `reach: {near: [x, y]}` puts the near hand at that point.
 */

export type Outfit = 'suit' | 'uniform' | 'overalls' | 'flight' | 'labcoat' | 'dress' | 'casual' | 'frock';
export type Hair = 'slick' | 'short' | 'bald' | 'bob' | 'bun' | 'pony' | 'long' | 'wig' | 'none';
export type Hat = 'officer' | 'garrison' | 'ballcap' | 'helmet' | 'tricorn' | 'straw' | 'headwrap' | 'bowler' | 'flatcap' | 'boater' | 'bonnet' | 'none';
export type Expression = 'neutral' | 'smile' | 'surprise' | 'worried' | 'stern' | 'thinking';

export type Look = {
	skin: string;
	hair: Hair;
	hairColor: string;
	outfit: Outfit;
	top: string;
	bottom: string;
	accent?: string;
	hat?: Hat;
	hatColor?: string;
	glasses?: boolean;
	mustache?: boolean;
	/** a full beard over the jaw (19th-century scholars) */
	beard?: boolean;
	/** side-whiskers (mutton chops) down the cheek, chin shaved (Victorian gentlemen) */
	whiskers?: boolean;
	/** an apron over the outfit (colour) */
	apron?: string;
};

/** Joint angles in degrees. Arms/legs: 0 = hanging down, + = swung forward. Elbows bend forward, knees back. */
export type Pose = {
	lean: number;
	head: number;
	armNear: [number, number];
	armFar: [number, number];
	legNear: [number, number];
	legFar: [number, number];
	lift: number;
	/** hand direction relative to the forearm, degrees (+ = toward the front); default 0 */
	wristNear?: number;
	wristFar?: number;
	/** 1 = palm toward the camera side (thumb in front), -1 = back of the hand toward camera */
	palmNear?: 1 | -1;
	palmFar?: 1 | -1;
	/** the whole body above the knees sinks by this much (figure units, + = down), for crouching and squatting */
	drop?: number;
};

/**
 * Human joint ranges (degrees, rig conventions). Every pose is clamped to these
 * before drawing, so an elbow or knee can never fold backwards and a wrist can
 * never twist past what a real wrist does. Reference: CMU mocap (pipeline/mocap.py).
 */
export const JOINT_LIMITS = {
	lean: [-30, 90],
	head: [-40, 45],
	upperArm: [-70, 185],
	elbow: [0, 150],
	thigh: [-45, 130],
	knee: [0, 150],
	wrist: [-70, 80],
} as const;
const clampTo = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));
export const limitPose = (p: Pose): Pose => ({
	...p,
	lean: clampTo(p.lean, JOINT_LIMITS.lean),
	head: clampTo(p.head, JOINT_LIMITS.head),
	armNear: [clampTo(p.armNear[0], JOINT_LIMITS.upperArm), clampTo(p.armNear[1], JOINT_LIMITS.elbow)],
	armFar: [clampTo(p.armFar[0], JOINT_LIMITS.upperArm), clampTo(p.armFar[1], JOINT_LIMITS.elbow)],
	legNear: [clampTo(p.legNear[0], JOINT_LIMITS.thigh), clampTo(p.legNear[1], JOINT_LIMITS.knee)],
	legFar: [clampTo(p.legFar[0], JOINT_LIMITS.thigh), clampTo(p.legFar[1], JOINT_LIMITS.knee)],
	wristNear: p.wristNear === undefined ? undefined : clampTo(p.wristNear, JOINT_LIMITS.wrist),
	wristFar: p.wristFar === undefined ? undefined : clampTo(p.wristFar, JOINT_LIMITS.wrist),
});

const L = {upper: 58, fore: 54, thigh: 76, shin: 74};
const SHOULDER_NEAR: [number, number] = [14, -258];
const SHOULDER_FAR: [number, number] = [-12, -256];
const HIP_Y = -150;
export const HEAD_CENTER: [number, number] = [6, -308];
/** Useful hand targets in figure space. */
export const SPOTS = {chin: [22, -292] as [number, number], chest: [20, -228] as [number, number], forward: [110, -250] as [number, number]};

export const POSES: Record<string, Pose> = {
	stand: {lean: 0, head: 0, armNear: [6, 10], armFar: [-6, 12], legNear: [3, 3], legFar: [-4, 3], lift: 0},
	point: {lean: -2, head: -4, armNear: [96, 6], armFar: [-4, 16], legNear: [8, 3], legFar: [-7, 3], lift: 0},
	pointUp: {lean: -3, head: -14, armNear: [150, 8], armFar: [-4, 16], legNear: [8, 3], legFar: [-7, 3], lift: 0},
	think: {lean: 3, head: 9, armNear: [0, 0], armFar: [22, 84], legNear: [3, 3], legFar: [-4, 3], lift: 0},
	present: {lean: -2, head: -3, armNear: [52, 46], armFar: [18, 30], legNear: [9, 3], legFar: [-8, 3], lift: 0},
	shrug: {lean: 0, head: 7, armNear: [26, 96], armFar: [20, 100], legNear: [3, 3], legFar: [-4, 3], lift: 0},
	write: {lean: 16, head: 22, armNear: [50, 64], armFar: [36, 74], legNear: [3, 3], legFar: [-4, 3], lift: 0},
	hold: {lean: 0, head: 6, armNear: [34, 76], armFar: [28, 82], legNear: [3, 3], legFar: [-4, 3], lift: 0},
	sit: {lean: 4, head: 6, armNear: [40, 50], armFar: [32, 56], legNear: [86, 88], legFar: [82, 90], lift: -66},
	recoil: {lean: -12, head: -14, armNear: [64, 104], armFar: [44, 112], legNear: [-6, 6], legFar: [12, 8], lift: 0},
};

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
	const l = (x: number, y: number) => x + (y - x) * t;
	const l2 = (x: [number, number], y: [number, number]): [number, number] => [l(x[0], y[0]), l(x[1], y[1])];
	return {
		lean: l(a.lean, b.lean),
		head: l(a.head, b.head),
		armNear: l2(a.armNear, b.armNear),
		armFar: l2(a.armFar, b.armFar),
		legNear: l2(a.legNear, b.legNear),
		legFar: l2(a.legFar, b.legFar),
		lift: l(a.lift, b.lift),
	};
};

/** Walk cycle pose at a phase (radians); one full step per 2π. */
export const walkPose = (phase: number, stride = 1): Pose => {
	const s = Math.sin(phase);
	const c = Math.cos(phase);
	return {
		lean: 2,
		head: -1,
		armNear: [-18 * s * stride, 12 + 6 * Math.max(0, s)],
		armFar: [18 * s * stride, 12 + 6 * Math.max(0, -s)],
		legNear: [18 * s * stride, (Math.max(0, -c) * 26 + 4) * stride],
		legFar: [-18 * s * stride, (Math.max(0, c) * 26 + 4) * stride],
		lift: -Math.abs(c) * 4 * stride,
	};
};

/** Eye openness 0..1, blinking every few seconds at a per-character rhythm. */
export const blinkAt = (frame: number, seed: string) => {
	const period = 96 + Math.floor(random(seed) * 70);
	const t = (frame + Math.floor(random(seed + 'o') * period)) % period;
	return t < 2 ? 0.1 : t < 4 ? 0.45 : 1;
};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const dir = (a: number, len: number): [number, number] => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len];

/** Two-bone IK: angles [upper, elbow] that put the hand at `target` from `shoulder`. */
export const reachAngles = (shoulder: [number, number], target: [number, number], l1 = L.upper, l2 = L.fore): [number, number] => {
	const dx = target[0] - shoulder[0];
	const dy = target[1] - shoulder[1];
	const d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, Math.hypot(dx, dy)));
	const theta = deg(Math.atan2(dx, dy));
	const A = deg(Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
	const a1 = theta - A;
	const [ex, ey] = dir(a1, l1);
	const a2abs = deg(Math.atan2(dx - ex, dy - ey));
	return [a1, a2abs - a1];
};

/**
 * Where a hand ends up (figure space, before `flip`), for attaching ropes, tickets
 * and other props to it. Mirrors the arm drawing: shoulder → upper arm → forearm,
 * then the body lean about the hip. `grip` = true returns the centre of the grip.
 */
export const handAt = (rawPose: Pose, near = true, grip = true): [number, number] => {
	const pose = limitPose(rawPose);
	const shoulder = near ? SHOULDER_NEAR : SHOULDER_FAR;
	const [a, e] = near ? pose.armNear : pose.armFar;
	const [ux, uy] = dir(a, L.upper);
	const [fx, fy] = dir(a + e, L.fore);
	const [gx, gy] = grip ? dir(a + e, 14) : [0, 0];
	let x = shoulder[0] + ux + fx + gx;
	let y = shoulder[1] + uy + fy + gy;
	// the lean rotates the upper body about the hip
	const hipY = HIP_Y + pose.lift;
	const r = rad(pose.lean);
	const dx = x;
	const dy = y - hipY;
	x = dx * Math.cos(r) - dy * Math.sin(r);
	y = hipY + dx * Math.sin(r) + dy * Math.cos(r) + (pose.drop ?? 0);
	return [x, y];
};

/** Pose arithmetic: a + b·k (for layering idle motion or offsets on a key pose). */
export const addPose = (a: Pose, b: Partial<Pose>, k = 1): Pose => ({
	lean: a.lean + (b.lean ?? 0) * k,
	head: a.head + (b.head ?? 0) * k,
	armNear: [a.armNear[0] + (b.armNear?.[0] ?? 0) * k, a.armNear[1] + (b.armNear?.[1] ?? 0) * k],
	armFar: [a.armFar[0] + (b.armFar?.[0] ?? 0) * k, a.armFar[1] + (b.armFar?.[1] ?? 0) * k],
	legNear: [a.legNear[0] + (b.legNear?.[0] ?? 0) * k, a.legNear[1] + (b.legNear?.[1] ?? 0) * k],
	legFar: [a.legFar[0] + (b.legFar?.[0] ?? 0) * k, a.legFar[1] + (b.legFar?.[1] ?? 0) * k],
	lift: a.lift + (b.lift ?? 0) * k,
});

/**
 * Idle life for a standing figure: breathing (a slow lean and shoulder rise), a weight
 * shift every few seconds, and small head turns. Deterministic per `seed`; layer it
 * with addPose(pose, idle(f, 'name')). `k` scales it (0 = frozen).
 */
export const idle = (f: number, seed: string, k = 1): Partial<Pose> => {
	const o = random(seed + 'idle') * 100;
	const breath = Math.sin((f + o) / 26);
	const shift = Math.sin((f + o * 3) / 97);
	const look = Math.sin((f + o * 7) / 71) + 0.4 * Math.sin((f + o) / 31);
	return {
		lean: k * (0.7 * breath + 1.2 * shift),
		head: k * (2.2 * look - 0.8 * breath),
		armNear: [k * (1.6 * breath), k * (1.2 * breath)],
		armFar: [k * (-1.2 * breath), k * (1.4 * breath)],
		legNear: [k * 1.5 * shift, 0],
		legFar: [k * -1.5 * shift, 0],
		lift: k * 0.6 * Math.abs(shift),
	};
};

/**
 * Pose at frame `f` along key poses [[frame, pose], …]: each segment eases in and out
 * (smoothstep), so a move has a start, a travel and a settle. Use an overshoot key
 * (a pose slightly past the target, 3–5 frames before it) for follow-through.
 */
export const keyPoses = (f: number, keys: [number, Pose][]): Pose => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [f0, p0] = keys[i];
		const [f1, p1] = keys[i + 1];
		if (f <= f1) {
			const t = (f - f0) / Math.max(1, f1 - f0);
			return lerpPose(p0, p1, t * t * (3 - 2 * t));
		}
	}
	return keys[keys.length - 1][1];
};

export const shade = (hex: string, k: number) => {
	if (!hex.startsWith('#')) return hex;
	const n = parseInt(hex.slice(1), 16);
	const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
	return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

/** A tapered two-segment limb with rounded joints; returns the end point and angle. */
const limb = (from: [number, number], a1: number, a2abs: number, l1: number, l2: number, w: [number, number, number]) => {
	const [x0, y0] = from;
	const [dx1, dy1] = dir(a1, l1);
	const [x1, y1] = [x0 + dx1, y0 + dy1];
	const [dx2, dy2] = dir(a2abs, l2);
	const [x2, y2] = [x1 + dx2, y1 + dy2];
	const seg = (ax: number, ay: number, bx: number, by: number, wa: number, wb: number) => {
		const len = Math.hypot(bx - ax, by - ay) || 1;
		const nx = -(by - ay) / len;
		const ny = (bx - ax) / len;
		return `M${ax + (nx * wa) / 2},${ay + (ny * wa) / 2} L${bx + (nx * wb) / 2},${by + (ny * wb) / 2} L${bx - (nx * wb) / 2},${by - (ny * wb) / 2} L${ax - (nx * wa) / 2},${ay - (ny * wa) / 2} Z`;
	};
	return {
		upper: seg(x0, y0, x1, y1, w[0], w[1]),
		lower: seg(x1, y1, x2, y2, w[1] * 0.96, w[2]),
		joints: [
			[x0, y0, w[0] / 2],
			[x1, y1, w[1] / 2],
		] as [number, number, number][],
		end: [x2, y2] as [number, number],
		endAngle: a2abs,
	};
};

const Shoe: React.FC<{color?: string}> = ({color = '#1b1a1d'}) => <path d="M-8,-6 C-9,4 -5,8 3,8 L23,8 C25,2 20,-4 10,-6 Z" fill={color} />;
export type HandShape = 'relaxed' | 'grip' | 'open' | 'point' | 'pinch';

/**
 * A hand in forearm space: the wrist at the origin, the fingers toward +y, the thumb
 * toward +x (the front of a figure facing right). Big enough to read at phone size
 * (~0.09 of the figure's height). `holding` sits in the grip (or between the
 * pinched fingertips) and is counter-rotated by the caller so props stay upright.
 */
const HAND_SCALE = 1.2;
const GRIP: Record<HandShape, [number, number]> = {relaxed: [2, 15], grip: [2, 14], open: [1, 20], point: [2, 13], pinch: [9, 27]};

/** An outlined finger (or thumb): a capsule from (x1,y1) to (x2,y2), optionally bent at a knuckle. */
const Digit: React.FC<{d: string; w: number; skin: string; edge: string}> = ({d, w, skin, edge}) => (
	<g fill="none" strokeLinecap="round" strokeLinejoin="round">
		<path d={d} stroke={edge} strokeWidth={w + 2} />
		<path d={d} stroke={skin} strokeWidth={w} />
	</g>
);

const Hand: React.FC<{skin: string; shape: HandShape; holding?: React.ReactNode; holdAngle?: number}> = ({skin, shape, holding, holdAngle = 0}) => {
	const edge = shade(skin, 0.72);
	const thumb = shade(skin, 0.95);
	const [gx, gy] = GRIP[shape];
	const held = holding ? <g transform={`translate(${gx * HAND_SCALE},${gy * HAND_SCALE}) rotate(${holdAngle})`}>{holding}</g> : null;
	const palm = <path d="M-7,-1 C-9,6 -9,13 -7,18 C-4,21 5,21 8,18 C10,13 10,6 7,-1 Z" fill={skin} stroke={edge} strokeWidth={1.1} />;
	const fist = <path d="M-8,-1 C-10,7 -9,16 -5,20 C0,23 8,21 10,15 C11,9 10,3 7,-1 Z" fill={skin} stroke={edge} strokeWidth={1.1} />;
	// four curled fingertips rolled toward the front
	const rolls = (y0: number) => (
		<g>
			{[0, 1, 2, 3].map((i) => (
				<ellipse key={i} cx={6.5 - i * 0.6} cy={y0 + i * 3.6} rx={3.6} ry={2.1} fill={skin} stroke={edge} strokeWidth={1} />
			))}
		</g>
	);
	const body = (() => {
		switch (shape) {
			case 'grip':
				return (
					<g>
						{fist}
						{rolls(5)}
						<Digit d="M4,3 C9,4 12,8 10,13" w={4.6} skin={thumb} edge={edge} />
					</g>
				);
			case 'open':
				return (
					<g>
						{[
							[-5, 17, -6, 29],
							[-1.6, 18, -1.8, 31],
							[1.8, 18, 2.4, 30.5],
							[5, 17, 6.6, 27.5],
						].map(([x1, y1, x2, y2], i) => (
							<Digit key={i} d={`M${x1},${y1} L${x2},${y2}`} w={3.4} skin={skin} edge={edge} />
						))}
						{palm}
						<Digit d="M6,4 C12,7 15,11 16,16" w={4.2} skin={thumb} edge={edge} />
					</g>
				);
			case 'point':
				return (
					<g>
						<Digit d="M6,14 L8.5,31" w={3.6} skin={skin} edge={edge} />
						{fist}
						{rolls(9)}
						<Digit d="M4,3 C9,4 12,8 10,12" w={4.6} skin={thumb} edge={edge} />
					</g>
				);
			case 'pinch':
				// fingers behind the held item, the thumb in front of it (drawn in the return)
				return (
					<g>
						{palm}
						<Digit d="M-5,16 C-6,22 -3,25 1,24" w={3.4} skin={skin} edge={edge} />
						<Digit d="M-1,17 C-1,22 1,25 4,25" w={3.4} skin={skin} edge={edge} />
						<Digit d="M4,16 C6,21 8,25 10,27" w={3.4} skin={skin} edge={edge} />
					</g>
				);
			default:
				// relaxed: fingers loosely curled, the thumb resting along the index
				return (
					<g>
						{palm}
						<Digit d="M-5,16 C-6,22 -3,26 1,26" w={3.6} skin={skin} edge={edge} />
						<Digit d="M-1,17 C-1,23 2,27 5,26" w={3.6} skin={skin} edge={edge} />
						<Digit d="M3,17 C4,22 6,25 8.5,24" w={3.6} skin={skin} edge={edge} />
						<Digit d="M6,4 C11,7 12,12 10,17" w={4.4} skin={thumb} edge={edge} />
					</g>
				);
		}
	})();
	if (shape === 'pinch') {
		return (
			<g>
				<g transform={`scale(${HAND_SCALE})`}>{body}</g>
				{held}
				<g transform={`scale(${HAND_SCALE})`}>
					<Digit d="M6,4 C12,8 13,18 10.5,26" w={4.4} skin={thumb} edge={edge} />
				</g>
			</g>
		);
	}
	return (
		<g>
			{held}
			<g transform={`scale(${HAND_SCALE})`}>{body}</g>
		</g>
	);
};

export const Figure: React.FC<{
	look: Look;
	pose?: Pose;
	/** hand IK targets in figure space; override the arm angles */
	reach?: {near?: [number, number]; far?: [number, number]};
	expression?: Expression;
	blink?: number;
	facing?: 'side' | 'back';
	flip?: boolean;
	rim?: 'cool' | 'warm' | 'moon' | 'none';
	silhouette?: string;
	holdNear?: React.ReactNode;
	holdFar?: React.ReactNode;
	/** hand shapes; default: grip when holding something, else relaxed */
	hands?: {near?: HandShape; far?: HandShape};
	talk?: number;
	shadow?: boolean;
}> = ({look, pose: rawPose = POSES.stand, reach, expression = 'neutral', blink = 1, facing = 'side', flip, rim = 'cool', silhouette, holdNear, holdFar, hands, talk = 0, shadow = true}) => {
	const pose = limitPose(rawPose);
	const drop = pose.drop ?? 0;
	const sil = silhouette;
	const c = (x: string) => sil ?? x;
	const skin = c(look.skin);
	const skinFar = sil ?? shade(look.skin, 0.86);
	const top = c(look.top);
	const topDark = sil ?? shade(look.top, 0.74);
	const bottom = c(look.bottom);
	const bottomDark = sil ?? shade(look.bottom, 0.74);
	const long = look.outfit === 'labcoat' || look.outfit === 'dress' || look.outfit === 'frock';
	const hem = long ? -66 : -138;
	const back = facing === 'back';
	const hipY = HIP_Y + pose.lift + drop;
	const filter = rim === 'none' ? undefined : `url(#rim-${rim})`;

	// legs
	const legShape = (near: boolean) => {
		const [a, k] = near ? pose.legNear : pose.legFar;
		const hip: [number, number] = [near ? 6 : -6, hipY];
		const l = limb(hip, a, a - k, L.thigh, L.shin, [28, 21, 17]);
		const col = near ? bottom : bottomDark;
		const showThigh = !long || pose.lift < -20;
		return (
			<g key={near ? 'ln' : 'lf'}>
				{showThigh ? <path d={l.upper} fill={col} /> : null}
				<path d={l.lower} fill={col} />
				{l.joints.map(([x, y, r], i) => (showThigh || i > 0 ? <circle key={i} cx={x} cy={y} r={r} fill={col} /> : null))}
				<g transform={`translate(${l.end[0]},${l.end[1]})`}>
					<Shoe color={sil} />
				</g>
			</g>
		);
	};

	// arms
	const armShape = (near: boolean) => {
		const shoulder = back ? ([near ? 24 : -24, -258] as [number, number]) : near ? SHOULDER_NEAR : SHOULDER_FAR;
		const rawTarget = near ? reach?.near : reach?.far;
		// targets are in figure space; the arm is drawn inside the sunk upper body
		const target: [number, number] | undefined = rawTarget ? [rawTarget[0], rawTarget[1] - drop] : undefined;
		let [a, e] = target ? reachAngles(shoulder, target) : near ? pose.armNear : pose.armFar;
		e = clampTo(e, JOINT_LIMITS.elbow);
		if (back && !target) {
			a = -a;
			e = -e;
		}
		const l = limb(shoulder, a, a + e, L.upper, L.fore, [21, 16, 12]);
		const col = near ? top : topDark;
		const lower = look.outfit === 'overalls' ? (near ? skin : skinFar) : col;
		return (
			<g key={near ? 'an' : 'af'}>
				<path d={l.upper} fill={col} />
				<circle cx={l.joints[0][0]} cy={l.joints[0][1]} r={l.joints[0][2]} fill={col} />
				<circle cx={l.joints[1][0]} cy={l.joints[1][1]} r={l.joints[1][2]} fill={look.outfit === 'overalls' ? col : col} />
				<path d={l.lower} fill={lower} />
				{look.outfit !== 'overalls' && !sil ? (
					// cuff
					<circle cx={l.end[0] - dir(l.endAngle, 4)[0]} cy={l.end[1] - dir(l.endAngle, 4)[1]} r={6.5} fill={look.outfit === 'labcoat' ? P.labCoat : P.shirt} opacity={0.9} />
				) : null}
				<g transform={`translate(${l.end[0]},${l.end[1]}) rotate(${-(l.endAngle + ((near ? pose.wristNear : pose.wristFar) ?? 0))}) scale(${(near ? pose.palmNear : pose.palmFar) === -1 ? -1 : 1},1)`}>
					{(() => {
							const item = near ? holdNear : holdFar;
							const shape = (near ? hands?.near : hands?.far) ?? (item ? 'grip' : 'relaxed');
							return <Hand skin={near ? skin : skinFar} shape={shape} holding={item ?? undefined} holdAngle={l.endAngle} />;
						})()}
				</g>
			</g>
		);
	};

	const torsoPath = back
		? `M-27,-264 C-20,-276 20,-276 27,-264 C30,-240 28,-210 22,-180 L${long ? 30 : 24},${hem} L${long ? -30 : -24},${hem} L-22,-180 C-28,-210 -30,-240 -27,-264 Z`
		: `M-25,-262 C-18,-276 18,-278 25,-264 C29,-246 29,-224 23,-196 L20,-178 L${long ? 30 : 23},${hem} L${long ? -28 : -21},${hem} L-17,-178 C-24,-206 -28,-236 -25,-262 Z`;

	const details = (() => {
		if (sil || back) return null;
		switch (look.outfit) {
			case 'suit':
			case 'uniform':
				return (
					<g>
						<path d="M2,-276 L16,-272 L8,-226 Z" fill={look.outfit === 'uniform' ? P.khaki : P.shirt} />
						<path d="M8,-270 L11,-270 L10.5,-232 L8,-226 L6.5,-232 Z" fill={look.accent ?? '#7a2c2c'} />
						<path d="M2,-276 L-4,-246 L8,-218 L6,-250 Z" fill={topDark} />
						<path d="M16,-272 L24,-248 L8,-218 L13,-250 Z" fill={topDark} />
						<circle cx={11} cy={-200} r={2.2} fill={look.outfit === 'uniform' ? P.brass : '#15161a'} />
						<circle cx={11} cy={-182} r={2.2} fill={look.outfit === 'uniform' ? P.brass : '#15161a'} />
						{look.outfit === 'uniform' ? (
							<>
								<rect x={-19} y={-176} width={42} height={6} fill={shade(look.top, 0.62)} />
								<rect x={-22} y={-266} width={13} height={4} rx={2} fill={P.brass} />
								<path d="M14,-238 L22,-238 L21,-226 L14,-226 Z" fill={shade(look.top, 0.82)} />
							</>
						) : (
							<path d="M15,-238 L23,-237" stroke={P.shirt} strokeWidth={2.5} />
						)}
					</g>
				);
			case 'flight':
				return (
					<g>
						<path d="M-2,-278 C6,-266 16,-264 24,-272 L20,-256 C10,-252 2,-258 -2,-266 Z" fill={look.accent ?? P.shirt} />
						<path d="M-8,-276 L2,-262 L-4,-250 Z M24,-270 L14,-258 L20,-246 Z" fill={shade(look.top, 0.6)} />
						<line x1={9} y1={-256} x2={10} y2={hem + 2} stroke={shade(look.top, 0.55)} strokeWidth={2} />
						<rect x={-21} y={hem - 10} width={44} height={11} rx={3} fill={shade(look.top, 0.78)} />
					</g>
				);
			case 'overalls':
				return (
					<g>
						<rect x={-6} y={-240} width={22} height={16} rx={3} fill={shade(look.top, 0.82)} />
						<line x1={4} y1={-276} x2={4} y2={hem} stroke={shade(look.top, 0.62)} strokeWidth={2} />
						<rect x={-20} y={-180} width={42} height={6} fill={shade(look.top, 0.7)} />
					</g>
				);
			case 'labcoat':
				return (
					<g>
						<path d="M2,-276 L14,-272 L7,-236 Z" fill={look.accent ?? '#6b7a8c'} />
						<line x1={7} y1={-236} x2={9} y2={hem + 2} stroke="#b9c2c9" strokeWidth={2} />
						<path d="M-2,-270 C-12,-240 -4,-222 8,-226" fill="none" stroke="#3a3d44" strokeWidth={3} />
						<circle cx={8} cy={-226} r={4} fill="#9aa1aa" />
						<rect x={14} y={-226} width={10} height={14} rx={2} fill="#d5dbe0" />
					</g>
				);
			case 'dress':
				return <path d="M2,-276 C8,-268 14,-268 20,-274" stroke={P.paper} strokeWidth={3} fill="none" />;
			case 'casual':
				// open jacket over a tee
				return (
					<g>
						<path d="M-2,-276 C4,-266 14,-266 22,-274 L20,-200 L0,-200 Z" fill={look.accent ?? P.shirt} />
						<path d="M-2,-276 L-6,-180 L4,-180 L6,-250 Z" fill={topDark} />
						<path d="M22,-274 L24,-180 L16,-180 L15,-248 Z" fill={topDark} />
						<path d="M4,-266 C10,-262 14,-262 18,-266" stroke={shade(look.accent ?? P.shirt, 0.8)} strokeWidth={2} fill="none" />
					</g>
				);
			case 'frock':
				// 18th-century coat: waistcoat with buttons, a stock at the throat
				return (
					<g>
						<path d="M2,-276 L18,-272 L16,-150 L4,-150 Z" fill={look.accent ?? '#8a6a3a'} />
						{[-246, -228, -210, -192, -174].map((y) => (
							<circle key={y} cx={11} cy={y} r={2} fill={P.brass} />
						))}
						<path d="M4,-278 C8,-268 14,-268 18,-276 L16,-262 C12,-258 8,-258 6,-262 Z" fill="#efe8da" />
					</g>
				);
			default:
				return null;
		}
	})();

	const hairPath = (() => {
		switch (look.hair) {
			case 'slick':
				return 'M-22,-312 C-26,-340 2,-352 24,-338 C30,-332 31,-326 30,-321 C18,-332 2,-334 -10,-328 C-14,-322 -16,-310 -18,-296 L-22,-298 Z';
			case 'short':
				return 'M-23,-310 C-26,-342 4,-352 26,-336 C31,-330 32,-324 31,-318 C22,-328 8,-330 -4,-326 C-12,-320 -16,-308 -19,-294 L-23,-296 Z';
			case 'bald':
				return 'M-22,-304 C-23,-314 -20,-320 -15,-321 C-17,-312 -17,-304 -14,-292 L-21,-292 Z';
			case 'bob':
				return 'M-25,-306 C-28,-346 8,-354 28,-336 C33,-328 33,-318 31,-312 C18,-326 0,-328 -8,-316 C-10,-304 -6,-292 -8,-284 L-25,-284 Z';
			case 'bun':
				return 'M-22,-310 C-26,-342 4,-352 26,-336 C31,-330 32,-324 31,-318 C20,-330 4,-330 -8,-324 C-14,-316 -16,-306 -19,-294 L-22,-296 Z M-30,-330 a12,12 0 1,0 0.1,0 Z';
			case 'pony':
				return 'M-22,-310 C-26,-344 6,-354 28,-336 C32,-330 33,-322 31,-316 C20,-330 4,-330 -8,-322 C-14,-314 -16,-304 -19,-294 L-22,-296 Z M-24,-326 C-44,-322 -50,-300 -44,-278 C-40,-284 -36,-300 -26,-310 Z';
			case 'long':
				return 'M-26,-304 C-30,-348 8,-356 29,-336 C34,-328 34,-318 31,-312 C20,-328 2,-330 -8,-318 C-12,-304 -10,-286 -12,-262 L-30,-258 C-32,-276 -30,-292 -26,-304 Z';
			case 'wig':
				// powdered periwig: rolled curls over the ears, tied queue behind
				return 'M-24,-312 C-26,-346 8,-354 28,-338 C32,-330 32,-322 30,-318 C20,-330 4,-332 -8,-326 C-12,-318 -14,-308 -16,-300 Z M-19,-302 a6,5 0 1,0 0.1,0 Z M-19,-291 a6,5 0 1,0 0.1,0 Z M-28,-308 C-40,-300 -42,-280 -36,-266 L-30,-270 C-34,-282 -32,-296 -24,-304 Z';
			default:
				return '';
		}
	})();

	const brow = {neutral: 0, smile: 1.5, surprise: -4, worried: 4.5, stern: -4.5, thinking: 3}[expression];
	const eyeRy = 2.9 * blink * (expression === 'surprise' ? 1.25 : 1);
	const mouth = (() => {
		const open = talk > 0.5;
		const k = {stroke: P.ink, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const};
		switch (expression) {
			case 'smile':
				return <path d="M13,-289 Q19,-284 24,-290" {...k} />;
			case 'surprise':
				return <ellipse cx={19} cy={-288} rx={3} ry={4} fill="#3a1f1a" />;
			case 'worried':
				return <path d="M13,-287 Q19,-290 24,-287" {...k} />;
			case 'stern':
				return <line x1={14} y1={-289} x2={23} y2={-289.5} {...k} strokeWidth={2.4} />;
			default:
				return open ? <ellipse cx={19} cy={-288} rx={3.2} ry={2.4} fill="#3a1f1a" /> : <path d="M14,-289 Q19,-287.5 23,-289" {...k} />;
		}
	})();

	const headX = HEAD_CENTER[0];
	const headY = HEAD_CENTER[1];
	const head = (
		<g transform={`rotate(${back ? 0 : pose.head}, 2, -280)`}>
			<path d="M-5,-292 L11,-292 L10,-268 L-4,-268 Z" fill={sil ?? shade(look.skin, 0.88)} />
			{back ? (
				<>
					<ellipse cx={headX - 6} cy={headY} rx={26} ry={29} fill={skin} />
					<ellipse cx={headX - 32} cy={headY + 4} rx={5} ry={8} fill={skin} />
					<ellipse cx={headX + 20} cy={headY + 4} rx={5} ry={8} fill={skin} />
					{look.hair !== 'none' && look.hair !== 'bald' ? (
						<path d={`M${headX - 33},${headY + 4} C${headX - 34},${headY - 36} ${headX + 22},${headY - 36} ${headX + 21},${headY + 4} C${headX + 18},${headY + 18} ${headX - 30},${headY + 18} ${headX - 33},${headY + 4} Z`} fill={c(look.hairColor)} />
					) : null}
					{look.hair === 'bald' ? <path d={`M${headX - 32},${headY + 2} C${headX - 28},${headY + 22} ${headX + 16},${headY + 22} ${headX + 20},${headY + 2} L${headX + 20},${headY + 12} C${headX + 8},${headY + 24} ${headX - 22},${headY + 24} ${headX - 32},${headY + 12} Z`} fill={c(look.hairColor)} /> : null}
				</>
			) : (
				<>
					{/* skull + jaw, three-quarter */}
					<path d="M-21,-316 C-20,-342 26,-346 31,-318 C33,-310 33,-302 31,-296 C29,-286 22,-278 10,-278 C-6,-278 -21,-292 -21,-312 Z" fill={skin} />
					<path d="M31,-310 C35,-306 34,-301 30,-299" fill={skin} />
					{!sil ? <path d="M-21,-314 C-21,-292 -8,-279 4,-278 C-8,-283 -13,-296 -13,-314 Z" fill={P.skinShade} /> : null}
					<path d="M-11,-306 C-15,-306 -16,-296 -11,-294 C-8,-294 -7,-304 -11,-306 Z" fill={sil ?? shade(look.skin, 0.84)} />
					{hairPath ? <path d={hairPath} fill={c(look.hairColor)} /> : null}
					{!sil ? (
						<>
							<ellipse cx={10} cy={-305} rx={2} ry={eyeRy} fill={P.ink} />
							<ellipse cx={22} cy={-305} rx={2.1} ry={eyeRy} fill={P.ink} />
							<path d={`M6,${-313 - brow * 0.25} L13,${-314 + brow * 0.35}`} stroke={c(look.hairColor)} strokeWidth={2.2} strokeLinecap="round" />
							<path d={`M18,${-314 + brow * 0.35} L26,${-313 - brow * 0.25}`} stroke={c(look.hairColor)} strokeWidth={2.2} strokeLinecap="round" />
							<path d="M29,-303 C31,-298 30,-296 27,-295" stroke={shade(look.skin, 0.75)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
							{look.beard ? <path d="M-13,-300 C-16,-284 -8,-264 8,-259 C22,-256 32,-268 33,-283 C33,-289 32,-293 30,-295 C27,-291 23,-290 19,-291 C14,-292 9,-293 5,-291 C1,-295 -6,-300 -13,-300 Z" fill={c(look.hairColor)} /> : null}
							{look.whiskers ? <path d="M-14,-306 C-18,-292 -14,-276 -2,-270 C6,-268 10,-274 8,-282 C2,-286 -4,-292 -6,-304 Z" fill={c(look.hairColor)} /> : null}
							{look.mustache || look.beard ? <path d="M15,-294 C18,-297 26,-297 29,-294 C26,-292 18,-292 15,-294 Z" fill={shade(look.hairColor, 0.8)} /> : null}
							{mouth}
							<ellipse cx={24} cy={-295} rx={4} ry={2.4} fill="#e28b7a" opacity={expression === 'smile' ? 0.35 : 0.15} />
							{look.glasses ? (
								<g fill="rgba(210,230,255,0.10)" stroke="#2a2522" strokeWidth={1.4}>
									<circle cx={10} cy={-305} r={5} />
									<circle cx={22.5} cy={-305} r={5.4} />
									<line x1={15} y1={-306} x2={17} y2={-306} />
									<line x1={5} y1={-306} x2={-8} y2={-307} />
								</g>
							) : null}
						</>
					) : null}
				</>
			)}
			{look.hat === 'officer' ? (
				<g>
					<path d="M-24,-326 C-24,-350 30,-354 34,-332 L32,-324 L-24,-322 Z" fill={c(look.hatColor ?? shade(look.top, 1.05))} />
					{!back ? <path d="M2,-326 L42,-322 C40,-316 22,-316 4,-320 Z" fill={c('#1d1b17')} /> : null}
					<rect x={-23} y={-328} width={56} height={5} fill={c(shade(look.hatColor ?? look.top, 0.7))} />
					{!sil && !back ? <circle cx={18} cy={-338} r={4} fill={P.brass} /> : null}
				</g>
			) : null}
			{look.hat === 'garrison' ? <path d="M-22,-328 C-16,-346 22,-346 30,-332 L28,-324 L-22,-322 Z" fill={c(look.hatColor ?? shade(look.top, 0.9))} /> : null}
			{look.hat === 'helmet' ? (
				<g>
					<path d="M-28,-318 C-30,-358 34,-362 36,-320 L40,-314 L-30,-312 Z" fill={c(look.hatColor ?? '#4a4f36')} />
					<path d="M-30,-316 L42,-314" stroke={c(shade(look.hatColor ?? '#4a4f36', 0.6))} strokeWidth={4} strokeLinecap="round" />
					{!sil && !back ? <path d="M30,-312 C32,-300 26,-292 20,-290" stroke="#3a2a1a" strokeWidth={2} fill="none" /> : null}
				</g>
			) : null}
			{look.hat === 'tricorn' ? (
				<g>
					<path d="M-34,-326 C-20,-356 32,-358 42,-326 C30,-334 18,-336 4,-334 C-10,-334 -22,-332 -34,-326 Z" fill={c(look.hatColor ?? '#1e1a17')} />
					<path d="M-30,-330 C-10,-350 24,-352 36,-332" fill="none" stroke={c(shade(look.hatColor ?? '#1e1a17', 1.6))} strokeWidth={2} />
				</g>
			) : null}
			{look.hat === 'straw' ? (
				<g>
					<path d="M-46,-322 C-20,-336 30,-338 58,-322 C40,-316 -30,-314 -46,-322 Z" fill={c(look.hatColor ?? '#c9a35e')} />
					<path d="M-20,-326 C-18,-352 26,-354 30,-328 Z" fill={c(look.hatColor ?? '#c9a35e')} />
					<path d="M-20,-328 L30,-330" stroke={c(shade(look.hatColor ?? '#c9a35e', 0.6))} strokeWidth={4} />
				</g>
			) : null}
			{look.hat === 'headwrap' ? (
				<g>
					<path d="M-26,-306 C-30,-350 14,-360 32,-332 C30,-324 28,-322 26,-322 C10,-334 -8,-332 -16,-318 C-18,-310 -20,-300 -22,-294 Z" fill={c(look.hatColor ?? '#2f5f6a')} />
					<path d="M-24,-330 C-6,-338 18,-338 30,-328" stroke={c(shade(look.hatColor ?? '#2f5f6a', 1.4))} strokeWidth={3} fill="none" strokeDasharray="5 6" />
					<path d="M-26,-312 C-40,-306 -44,-292 -38,-282 C-34,-292 -30,-300 -22,-304 Z" fill={c(look.hatColor ?? '#2f5f6a')} />
				</g>
			) : null}
			{look.hat === 'bowler' ? (
				<g>
					<path d="M-26,-324 C-30,-322 -30,-318 -24,-317 C-4,-314 22,-314 40,-318 C44,-319 44,-323 40,-325 Z" fill={c(look.hatColor ?? '#1c1b1e')} />
					<path d="M-20,-324 C-22,-360 30,-364 32,-324 Z" fill={c(look.hatColor ?? '#1c1b1e')} />
					{!sil ? <path d="M-19,-330 C-6,-332 18,-332 31,-330 L31,-325 L-19,-325 Z" fill={shade(look.hatColor ?? '#1c1b1e', 0.55)} /> : null}
					{!sil ? <path d="M-10,-352 C-2,-358 12,-358 20,-352" stroke="#fff" strokeOpacity={0.12} strokeWidth={3} fill="none" /> : null}
				</g>
			) : null}
			{look.hat === 'flatcap' ? (
				<g>
					<path d="M-24,-318 C-28,-344 2,-354 30,-340 C40,-334 46,-326 48,-320 C30,-318 4,-318 -24,-318 Z" fill={c(look.hatColor ?? '#5a5446')} />
					{!back ? <path d="M22,-322 L50,-318 C46,-312 30,-312 18,-316 Z" fill={c(shade(look.hatColor ?? '#5a5446', 0.7))} /> : null}
					{!sil ? <path d="M-14,-340 C4,-344 22,-340 34,-334" stroke={shade(look.hatColor ?? '#5a5446', 0.75)} strokeWidth={1.5} fill="none" /> : null}
				</g>
			) : null}
			{look.hat === 'boater' ? (
				<g>
					<ellipse cx={8} cy={-322} rx={40} ry={6} fill={c(look.hatColor ?? '#d9bf7f')} />
					<path d="M-20,-322 L-18,-346 C-4,-350 20,-350 34,-346 L36,-322 Z" fill={c(look.hatColor ?? '#d9bf7f')} />
					<rect x={-19} y={-333} width={54} height={8} fill={c(look.accent ?? '#2a2f45')} />
					{!sil ? <ellipse cx={8} cy={-347} rx={27} ry={3} fill={shade(look.hatColor ?? '#d9bf7f', 1.08)} /> : null}
				</g>
			) : null}
			{look.hat === 'bonnet' ? (
				// an Edwardian wide-brimmed hat, a ribbon and a flower
				<g>
					<path d="M-20,-326 C-22,-352 30,-356 34,-326 Z" fill={c(look.hatColor ?? '#4a3a4a')} />
					<path d="M-46,-322 C-30,-334 50,-336 64,-322 C50,-314 -30,-312 -46,-322 Z" fill={c(look.hatColor ?? '#4a3a4a')} />
					{!sil ? <path d="M-19,-334 C0,-338 18,-338 33,-334 L33,-327 L-19,-327 Z" fill={look.accent ?? '#c9a35e'} /> : null}
					{!sil ? (
						<g transform="translate(-12,-334)">
							{[0, 72, 144, 216, 288].map((r) => (
								<ellipse key={r} cx={0} cy={-5} rx={3.5} ry={5} transform={`rotate(${r})`} fill="#e9d6d0" />
							))}
							<circle r={2.5} fill={look.accent ?? '#c9a35e'} />
						</g>
					) : null}
				</g>
			) : null}
			{look.hat === 'ballcap' ? (
				<g>
					<path d="M-22,-322 C-22,-350 28,-352 30,-324 Z" fill={c(look.accent ?? '#3a4a5c')} />
					{!back ? <path d="M14,-326 L44,-322 C42,-316 28,-316 10,-320 Z" fill={c(shade(look.accent ?? '#3a4a5c', 0.7))} /> : null}
				</g>
			) : null}
		</g>
	);

	const torso = (
		<g>
			<path d={torsoPath} fill={top} />
			{!sil && !back ? <path d={`M-25,-262 C-20,-272 -10,-276 -2,-276 C-6,-240 -6,-200 -4,${hem} L${long ? -28 : -21},${hem} L-17,-178 C-24,-206 -28,-236 -25,-262 Z`} fill="#000" opacity={0.16} /> : null}
			{details}
			{look.apron && !back ? (
				<path d={`M-14,-232 C-4,-236 16,-236 24,-232 L${long ? 30 : 22},${hem + 6} L${long ? -22 : -16},${hem + 6} Z`} fill={c(look.apron)} opacity={0.96} />
			) : null}
		</g>
	);

	const lean = `translate(0,${drop}) rotate(${pose.lean}, 0, ${hipY - drop})`;
	const body = back ? (
		<g>
			{legShape(false)}
			{legShape(true)}
			<g transform={lean}>
				{armShape(false)}
				{armShape(true)}
				{torso}
				{head}
			</g>
		</g>
	) : (
		<g>
			<g transform={lean}>{armShape(false)}</g>
			{legShape(false)}
			{legShape(true)}
			<g transform={lean}>
				{torso}
				{head}
				{armShape(true)}
			</g>
		</g>
	);

	return (
		<g transform={flip ? 'scale(-1,1)' : undefined}>
			{shadow ? <ellipse cx={4} cy={8} rx={44} ry={7} fill="#000" opacity={0.32} /> : null}
			<g filter={filter}>{body}</g>
		</g>
	);
};

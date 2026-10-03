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

export type Outfit = 'suit' | 'uniform' | 'overalls' | 'flight' | 'labcoat' | 'dress';
export type Hair = 'slick' | 'short' | 'bald' | 'bob' | 'bun' | 'none';
export type Hat = 'officer' | 'garrison' | 'ballcap' | 'none';
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
};

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
const Hand: React.FC<{skin: string; holding?: React.ReactNode}> = ({skin, holding}) => (
	<g>
		{holding}
		<path d="M-6,-2 C-8,6 -5,13 1,13 C6,13 8,8 7,2 C7,-2 4,-4 0,-4 C-3,-4 -5,-3 -6,-2 Z" fill={skin} />
		<path d="M5,0 C9,1 10,5 8,7" stroke={skin} strokeWidth={4} strokeLinecap="round" fill="none" />
	</g>
);

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
	talk?: number;
	shadow?: boolean;
}> = ({look, pose = POSES.stand, reach, expression = 'neutral', blink = 1, facing = 'side', flip, rim = 'cool', silhouette, holdNear, holdFar, talk = 0, shadow = true}) => {
	const sil = silhouette;
	const c = (x: string) => sil ?? x;
	const skin = c(look.skin);
	const skinFar = sil ?? shade(look.skin, 0.86);
	const top = c(look.top);
	const topDark = sil ?? shade(look.top, 0.74);
	const bottom = c(look.bottom);
	const bottomDark = sil ?? shade(look.bottom, 0.74);
	const long = look.outfit === 'labcoat' || look.outfit === 'dress';
	const hem = long ? -66 : -138;
	const back = facing === 'back';
	const hipY = HIP_Y + pose.lift;
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
		const target = near ? reach?.near : reach?.far;
		let [a, e] = target ? reachAngles(shoulder, target) : near ? pose.armNear : pose.armFar;
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
				<g transform={`translate(${l.end[0]},${l.end[1]}) rotate(${-l.endAngle})`}>
					<Hand skin={near ? skin : skinFar} holding={near ? holdNear : holdFar} />
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
							{look.mustache ? <path d="M15,-294 C18,-297 26,-297 29,-294 C26,-292 18,-292 15,-294 Z" fill={look.hairColor} /> : null}
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
		</g>
	);

	const lean = `rotate(${pose.lean}, 0, ${hipY})`;
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

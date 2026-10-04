import React from 'react';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, addPose, blinkAt, handAt, idle, keyPoses, type HandShape, type Pose} from '../../src/art/Figure';
import {BallotBox, Ticket, oxHalterRing, type OxPose} from '../../src/art/Ox';

/**
 * 《八百人猜牛》 acting, posed by hand (arm angles solved so the hands land on the
 * slot, the rope and the chin) and keyed with anticipation → action → overshoot → settle.
 * Idle breathing and weight shifts are layered on every figure that is not mid-action.
 */

const P = (p: Partial<Pose>): Pose => ({...POSES.stand, ...p});

// ---------------------------------------------------------------- the butcher posts his ticket

export const BUTCHER = {
	/** reading the ticket held at the chest, head down */
	read: P({lean: 4, head: 16, armNear: [-17, 137], armFar: [8, 14]}),
	/** anticipation: lifts it, leans back */
	lift: P({lean: -3, head: 4, armNear: [50, 80], armFar: [4, 18]}),
	/** the hand at the slot */
	post: P({lean: 4, head: 12, armNear: [30, 30], armFar: [10, 16]}),
	/** follow-through: pushes it a little further in */
	over: P({lean: 8, head: 14, armNear: [28, 34], armFar: [12, 16]}),
	/** done: straightens, looks up at the ox */
	done: P({lean: -1, head: -6, armNear: [8, 12], armFar: [-4, 14]}),
};

/** Slot position in the butcher's own space (his hand at `post` lands here). */
export const SLOT_LOCAL: [number, number] = [103, -170];
/** Where the ticket box's slot is, in the scene, for a poster standing at (x, y) scale s. */
export const slotFor = (x: number, y: number, s = 0.95): [number, number] => [x + SLOT_LOCAL[0] * s, y + SLOT_LOCAL[1] * s];

/**
 * The butcher at (x, y) scale s, his ticket box placed so its slot meets his hand.
 * `t0` is the frame the action starts (he reads until then).
 */
export const ButcherPosting: React.FC<{f: number; t0: number; x: number; y: number; s?: number; who?: keyof typeof CAST; box?: boolean}> = ({f, t0, x, y, s = 0.95, who = 'butcher', box: showBox = true}) => {
	const k = f - t0;
	const pose = keyPoses(k, [
		[0, BUTCHER.read],
		[8, BUTCHER.lift],
		[15, BUTCHER.post],
		[19, BUTCHER.over],
		[25, BUTCHER.post],
		[42, BUTCHER.done],
	]);
	// idle stays on before and after the move, eases off during it
	const still = k < 0 || k > 44 ? 1 : k < 4 ? 1 - k / 4 : k > 36 ? (k - 36) / 8 : 0;
	const p = addPose(pose, idle(f, who), still);
	const released = k >= 19;
	const hand: HandShape = k < 19 ? 'pinch' : k < 34 ? 'open' : 'relaxed';
	// box: the slot (box-local [0, -195] at scale 0.9) sits at the hand's post position
	const slotX = x + SLOT_LOCAL[0] * s;
	const slotY = y + SLOT_LOCAL[1] * s;
	const box = {x: slotX, y: slotY + 195 * 0.9};
	// after release the ticket drops into the slot, clipped by the lid
	const drop = released ? Math.min(1, (k - 19) / 6) : 0;
	return (
		<g>
			<g transform={`translate(${x},${y}) scale(${s})`}>
				<Figure
					look={CAST[who]}
					pose={p}
					hands={{near: hand}}
					rim="warm"
					blink={blinkAt(f, who)}
					expression={k > 30 ? 'smile' : k < 2 ? 'thinking' : 'neutral'}
					holdNear={
						!released ? (
							<g transform={`rotate(${k < 8 ? -70 : -88}) scale(0.13)`}>
								<Ticket lod="mid" />
							</g>
						) : undefined
					}
				/>
			</g>
			<g transform={`translate(${box.x},${box.y}) scale(0.9)`}>
				{showBox ? <BallotBox /> : null}
				{released && drop < 1 ? (
					<g>
						<clipPath id="slot-clip">
							<rect x={-40} y={-300} width={80} height={105} />
						</clipPath>
						<g clipPath="url(#slot-clip)">
							<g transform={`translate(0,${-205 + 34 * drop}) rotate(-90) scale(0.14)`}>
								<Ticket lod="mid" />
							</g>
						</g>
					</g>
				) : null}
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- the drover holds the ox

export const DROVER: Pose = P({lean: 2, head: 6, armNear: [29, 62], armFar: [6, 14]});

/**
 * The drover standing at the ox's head, facing it, holding the lead rope in his near hand.
 * Pass the ox's transform (ox x, y, scale and pose) so the rope runs from the halter ring
 * to his fist, with a little slack.
 */
export const DroverWithRope: React.FC<{f: number; x: number; y: number; s?: number; ox: {x: number; y: number; s: number; pose: OxPose}; expression?: 'neutral' | 'smile'}> = ({
	f,
	x,
	y,
	s = 0.95,
	ox,
	expression = 'neutral',
}) => {
	const pose = addPose(DROVER, idle(f, 'drover'), 0.8);
	const [hx, hy] = handAt(pose, true);
	// he faces left (flip): mirror x
	const hand = [x - hx * s, y + hy * s];
	const [rx, ry] = oxHalterRing(ox.pose);
	const ring = [ox.x + rx * ox.s, ox.y + ry * ox.s];
	const mid = [(hand[0] + ring[0]) / 2, Math.max(hand[1], ring[1]) + 26];
	return (
		<g>
			<path d={`M${ring[0]},${ring[1]} Q${mid[0]},${mid[1]} ${hand[0]},${hand[1]}`} stroke="#b08a52" strokeWidth={4.5} fill="none" strokeLinecap="round" />
			{/* the rope's tail hangs from his fist */}
			<path d={`M${hand[0]},${hand[1]} C${hand[0] + 6},${hand[1] + 30} ${hand[0] - 4},${hand[1] + 60} ${hand[0] + 2 + 4 * Math.sin(f / 20)},${hand[1] + 92}`} stroke="#b08a52" strokeWidth={4} fill="none" strokeLinecap="round" />
			<g transform={`translate(${x},${y}) scale(${s})`}>
				<Figure look={CAST.drover} pose={pose} hands={{near: 'grip'}} flip rim="warm" blink={blinkAt(f, 'dr')} expression={expression} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- Galton

export const GALTON = {
	/** stroking his whiskers, unconvinced */
	chin: P({lean: 3, head: 8, armNear: [6, 12], armFar: [47, 144]}),
	stand: P({lean: 1, head: 2, armNear: [6, 12], armFar: [-4, 14]}),
};

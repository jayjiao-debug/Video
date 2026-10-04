import React from 'react';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, addPose, blinkAt, idle, keyPoses, type Expression, type HandShape, type Pose} from '../../src/art/Figure';

/**
 * 《越难越爱》 acting. Poses are set by hand (arm angles chosen so the hand lands on the
 * phone, the card, the chalk), keyed anticipation → action → overshoot → settle,
 * with idle breathing layered on whoever is not mid-action. Joint limits are the rig's.
 */

const P = (p: Partial<Pose>): Pose => ({...POSES.stand, ...p});
const SIT = POSES.sit;

/** a phone in her hand: the screen faces her (up and back), lit */
export const HandPhone: React.FC<{lit?: number; down?: boolean}> = ({lit = 1, down}) => (
	<g transform={`rotate(${down ? 80 : -30}) scale(0.9)`}>
		<rect x={-13} y={-24} width={26} height={48} rx={5} fill="#15161f" />
		<rect x={-11} y={-21} width={22} height={42} rx={3} fill={down ? '#15161f' : '#c8d2ff'} opacity={down ? 1 : 0.35 + 0.65 * lit} />
	</g>
);

/** an index card held between the fingers */
export const HandCard: React.FC = () => (
	<g transform="rotate(-70) scale(0.55)">
		<rect x={-60} y={-40} width={120} height={80} fill="#efe6d2" />
		{[0, 1, 2].map((i) => (
			<rect key={i} x={-46} y={-24 + i * 16} width={70 + ((i * 23) % 30)} height={5} rx={2} fill="#3a2e22" opacity={0.6} />
		))}
	</g>
);

/** a clipboard held at the side */
export const Clipboard: React.FC = () => (
	<g transform="rotate(-10) scale(0.7)">
		<rect x={-40} y={-56} width={80} height={110} rx={4} fill="#8a6a44" />
		<rect x={-34} y={-46} width={68} height={94} fill="#efe6d2" />
		<rect x={-14} y={-62} width={28} height={12} rx={3} fill="#9a9a9a" />
		{[0, 1, 2, 3].map((i) => (
			<rect key={i} x={-26} y={-30 + i * 16} width={44} height={4} rx={2} fill="#3a2e22" opacity={0.5} />
		))}
	</g>
);

/** a stick of chalk */
export const Chalk: React.FC = () => <rect x={-3} y={-10} width={6} height={20} rx={2} fill="#efeae0" transform="rotate(-30)" />;

// ---------------------------------------------------------------- her (2026)

export const SHE_POSE = {
	/** on the bed edge, forearms forward, the phone low in front of the chest, head bent to it */
	phone: {...SIT, lean: 14, head: 30, armNear: [12, 92], armFar: [8, 96], wristNear: 34, wristFar: 30} as Pose,
	/** thumb typing: same, phone a touch higher */
	type: {...SIT, lean: 15, head: 30, armNear: [16, 98], armFar: [11, 100], wristNear: 40, wristFar: 34} as Pose,
	/** phone lowered to the lap, shoulders down */
	lap: {...SIT, lean: 16, head: 30, armNear: [12, 64], armFar: [8, 70], wristNear: 10} as Pose,
	/** head up, a breath out */
	sigh: {...SIT, lean: -2, head: -12, armNear: [10, 56], armFar: [6, 60]} as Pose,
	/** puts the phone face down beside her on the bed */
	place: {...SIT, lean: 18, head: 34, armNear: [4, 6], armFar: [8, 60], wristNear: 20} as Pose,
	/** both hands cupped in front of her (the light gathers there) */
	cup: {...SIT, lean: 12, head: 26, armNear: [24, 104], armFar: [20, 108], wristNear: 40, wristFar: 40} as Pose,
};

/** her on the bed with the phone, keyed from `t0`: look → type → stop → lower; `lit` is the screen */
export const SheOnBed: React.FC<{f: number; x: number; y: number; s?: number; keys?: [number, Pose][]; hand?: HandShape; expression?: Expression; phone?: 'up' | 'down' | 'none'; lit?: number; rim?: 'cool' | 'warm'}> = ({
	f,
	x,
	y,
	s = 1.15,
	keys,
	hand = 'grip',
	expression = 'thinking',
	phone = 'up',
	lit = 1,
	rim = 'cool',
}) => {
	const base = keys ? keyPoses(f, keys) : SHE_POSE.phone;
	const p = addPose(base, idle(f, 'she', 0.6));
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<Figure look={CAST.she} pose={p} hands={{near: hand, far: hand}} rim={rim} blink={blinkAt(f, 'she')} expression={expression} shadow={false} holdNear={phone === 'none' ? undefined : <HandPhone lit={lit} down={phone === 'down'} />} />
		</g>
	);
};

// ---------------------------------------------------------------- 1959

export const COED_POSE = {
	/** sitting at the table, the card held up to read */
	read: {...SIT, lean: 6, head: 16, armNear: [44, 92], armFar: [10, 40], wristNear: 10} as Pose,
	/** shrinking: head down, the card lowered, shoulders in */
	flush: {...SIT, lean: 18, head: 34, armNear: [30, 80], armFar: [14, 60], wristNear: 20} as Pose,
	/** listening with headphones on, hands folded on the table */
	listen: {...SIT, lean: 4, head: 6, armNear: [46, 50], armFar: [40, 56]} as Pose,
	/** bored / then convinced: chin up, small smile */
	rate: {...SIT, lean: 8, head: 14, armNear: [52, 70], armFar: [40, 60], wristNear: 20} as Pose,
};

export const EXP_POSE = {
	/** at the board, chalk up */
	write: P({lean: 2, head: -6, armNear: [128, 34], armFar: [-6, 16], wristNear: -10}),
	/** stepping back to look */
	look: P({lean: -4, head: -2, armNear: [20, 40], armFar: [-4, 16]}),
	/** seated across the table, clipboard on the knee */
	sit: {...SIT, lean: 4, head: 10, armNear: [36, 70], armFar: [30, 76]} as Pose,
};

export const Person: React.FC<{who: keyof typeof CAST; f: number; x: number; y: number; s?: number; pose: Pose; flip?: boolean; hand?: HandShape; hold?: React.ReactNode; expression?: Expression; rim?: 'cool' | 'warm' | 'moon'; back?: boolean; still?: number; shadow?: boolean}> = ({
	who,
	f,
	x,
	y,
	s = 1,
	pose,
	flip,
	hand,
	hold,
	expression = 'neutral',
	rim = 'warm',
	back,
	still = 1,
	shadow,
}) => (
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		<Figure look={CAST[who]} pose={addPose(pose, idle(f, who), still)} hands={hand ? {near: hand} : undefined} holdNear={hold} rim={rim} blink={blinkAt(f, who)} expression={expression} facing={back ? 'back' : 'side'} shadow={shadow ?? pose.lift > -30} />
	</g>
);

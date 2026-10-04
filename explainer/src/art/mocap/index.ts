import type {Pose} from '../Figure';
import c1304 from './13_04.json';
import c1306 from './15_06.json';
import c1307 from './13_07.json';
import c1808 from './18_08.json';
import c2610 from './26_10.json';
import c7708 from './77_08.json';

/**
 * Motion reference clips from the CMU motion-capture database, converted to the
 * rig's joint angles by pipeline/mocap.py (side view, figure facing right, 30 fps).
 * Use them to drive a figure (`mocapPose`) or as the reference a hand-keyed pose is
 * checked against (src/MocapBoard.tsx shows them side by side).
 */
export type MocapFrame = {
	lean: number;
	head: number;
	armNear: [number, number];
	armFar: [number, number];
	legNear: [number, number];
	legFar: [number, number];
	wristNear: number;
	wristFar: number;
	palmNear: 1 | -1;
	palmFar: 1 | -1;
	hipY: number;
	joints: Record<string, [number, number]>;
};
export type MocapClip = {clip: string; near: string; fps: number; frames: MocapFrame[]};

export const MOCAP: Record<string, {data: MocapClip; zh: string; en: string}> = {
	'13_07': {data: c1307 as unknown as MocapClip, zh: '拿着东西：拧瓶盖、喝水', en: 'unscrew bottlecap, drink'},
	'77_08': {data: c7708 as unknown as MocapClip, zh: '双手端详地上的东西', en: 'investigate thing with two hands'},
	'15_06': {data: c1306 as unknown as MocapClip, zh: '前倾、伸手去够', en: 'lean forward, reach for'},
	'13_04': {data: c1304 as unknown as MocapClip, zh: '坐着，托腮', en: 'sit on stepstool, chin in hand'},
	'18_08': {data: c1808 as unknown as MocapClip, zh: '边说边比划', en: 'explain with hand gestures'},
	'26_10': {data: c2610 as unknown as MocapClip, zh: '弯腰、抬起', en: 'bend, lift'},
};

/** the rig pose for frame `f` (30 fps) of a clip; crouching sinks the body (`drop`) like the actor's hips */
export const mocapPose = (clip: string, f: number): Pose => {
	const fr = MOCAP[clip].data.frames;
	const m = fr[Math.max(0, Math.min(fr.length - 1, Math.round(f)))];
	return {
		lean: m.lean,
		head: m.head,
		armNear: m.armNear,
		armFar: m.armFar,
		legNear: m.legNear,
		legFar: m.legFar,
		lift: 0,
		drop: Math.max(0, -m.hipY * 340),
		wristNear: m.wristNear,
		wristFar: m.wristFar,
		palmNear: m.palmNear,
		palmFar: m.palmFar,
	};
};

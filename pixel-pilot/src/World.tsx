// The room: background, props, narrator, lighting. Everything is driven by cues.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CAMERAS, DEFAULT_POSE, LINES, NARRATOR_POS, NARRATOR_SET, cuesOf, lastCue, lineFrames, windows} from './script';
import {H, Sprite, W, popY} from './pixel';

const SLOTS: Record<string, {x: number; y: number}> = {
	desk: {x: 222, y: 158},
	desk_right: {x: 288, y: 160},
};
const NARRATOR = NARRATOR_POS;
const CLOCK = {x: 290, y: 30};

const camAt = (frame: number) => {
	let cur = CAMERAS.establish;
	let prev = CAMERAS.establish;
	let since = Infinity;
	lineFrames.forEach((l, i) => {
		if (frame >= l.start) {
			const next = CAMERAS[LINES[i].camera];
			if (next !== cur) {
				prev = cur;
				cur = next;
				since = frame - l.start;
			}
		}
	});
	const k = interpolate(since, [0, 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});
	const zoom = prev.zoom + (cur.zoom - prev.zoom) * k;
	const x = prev.x + (cur.x - prev.x) * k;
	const y = prev.y + (cur.y - prev.y) * k;
	// settle on whole screen pixels so the resting frame is exact
	return {zoom, tx: Math.round(960 - x * zoom), ty: Math.round(540 - y * zoom)};
};

const Props: React.FC<{frame: number}> = ({frame}) => {
	const items: React.ReactNode[] = [];
	for (const c of cuesOf('prop_in')) {
		const sprite = c.sprite as string;
		const out = cuesOf('prop_out').find((o) => o.sprite === sprite && o.frame > c.frame);
		const slot = SLOTS[c.slot as string];
		const age = frame - c.frame;
		const dy = popY(age);
		if (dy === null) continue;
		let x = slot.x;
		let y = slot.y + dy;
		let opacity = 1;
		if (out && frame >= out.frame) {
			// slide off to the right, in whole pixels
			const t = frame - out.frame;
			x += Math.round(t * t * 0.9);
			y -= Math.min(t, 6);
			if (x > W + 20) continue;
		}
		if (sprite === 'phone') {
			const buzz = age < 14 ? (age % 2 === 0 ? 1 : -1) : 0;
			const on = age < 70 || (out && frame >= out.frame) ? true : Math.floor(age / 45) % 2 === 0;
			if (on) items.push(<Sprite key="glow" name="phone_glow" x={x - 23} y={y - 16} blend="screen" opacity={opacity * 0.9} />);
			items.push(<Sprite key={sprite} name={on ? 'phone_on' : 'phone'} x={x + buzz} y={y} opacity={opacity} />);
		} else {
			items.push(<Sprite key={sprite} name={sprite} x={x} y={y} opacity={opacity} />);
		}
	}
	return <>{items}</>;
};

const Narrator: React.FC<{frame: number}> = ({frame}) => {
	const p = lastCue(['pose'], frame);
	let pose = (p?.pose as string) ?? DEFAULT_POSE;
	const age = p ? frame - p.frame : frame;
	if (['sit', 'read', 'idle', 'look'].includes(pose) && frame % 96 >= 90) pose = 'blink';
	const breathe = Math.floor(frame / 36) % 2; // 1 px rise and fall
	const jump = pose === 'shock' ? (popY(age) ?? 0) : 0;
	return <Sprite name={`${NARRATOR_SET}_${pose}`} x={NARRATOR.x} y={NARRATOR.y + breathe + jump} />;
};

const Clock: React.FC<{frame: number}> = ({frame}) => {
	const spin = cuesOf('clock_spin')[0];
	let idx = 0;
	if (spin && frame >= spin.frame) idx = Math.min(23, Math.floor((frame - spin.frame) / 1.5));
	if (spin && frame >= spin.frame + 36) idx = 23;
	return (
		<>
			<Sprite name="clock" x={CLOCK.x} y={CLOCK.y} />
			<Sprite name={`hands_${String(idx).padStart(2, '0')}`} x={CLOCK.x - 1} y={CLOCK.y - 1} />
		</>
	);
};

const Steam: React.FC<{frame: number}> = ({frame}) => {
	const puffs = [0, 1, 2].map((k) => {
		const t = (frame + k * 20) % 60;
		const x = 320 + Math.round(Math.sin((frame + k * 20) / 9) * 2);
		const y = 152 - Math.floor(t / 4);
		return <Sprite key={k} name="steam" x={x} y={y} opacity={t > 40 ? 0.25 : 0.6} />;
	});
	return <>{puffs}</>;
};

export const World: React.FC = () => {
	const frame = useCurrentFrame();
	const cam = camAt(frame);
	const flicker = [1, 1, 1, 0.92, 1, 1, 0.96, 1][Math.floor(frame / 5) % 8];
	return (
		<AbsoluteFill style={{background: '#16111e', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					width: W,
					height: H,
					transformOrigin: '0 0',
					transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.zoom})`,
				}}
			>
				<Sprite name="stage" x={0} y={0} />
				<Clock frame={frame} />
				{NARRATOR.front ? null : <Narrator frame={frame} />}
				<Sprite name="desk" x={0} y={0} />
				<Steam frame={frame} />
				<Props frame={frame} />
				{NARRATOR.front ? <Narrator frame={frame} /> : null}
				<Sprite name="light" x={0} y={0} blend="screen" opacity={flicker} />
				<Sprite name="vignette" x={0} y={0} />
			</div>
		</AbsoluteFill>
	);
};

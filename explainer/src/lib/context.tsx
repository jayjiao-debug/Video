import React, {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {Scene, Timeline} from './types';
import {layouts, type Layout} from './theme';

const TimelineCtx = createContext<Timeline | null>(null);
const SceneCtx = createContext<Scene | null>(null);

export const TimelineProvider = TimelineCtx.Provider;
export const SceneProvider = SceneCtx.Provider;

export const useTimeline = (): Timeline => {
	const t = useContext(TimelineCtx);
	if (!t) throw new Error('useTimeline outside <Episode>');
	return t;
};

export const useLayout = (): Layout => layouts[useTimeline().format];

export const useScene = (): Scene => {
	const s = useContext(SceneCtx);
	if (!s) throw new Error('useScene outside a scene');
	return s;
};

/** Frame (relative to the scene) at which subtitle line `i` appears. Negative i counts from the end. */
export const useCue = () => {
	const scene = useScene();
	return (i: number, offset = 0) => {
		const ln = scene.lines[i < 0 ? scene.lines.length + i : i];
		return (ln ? ln.from : 0) + offset;
	};
};

/** Absolute frame number, even inside a scene's <Sequence>. */
export const useAbsoluteFrame = () => {
	const frame = useCurrentFrame();
	const scene = useContext(SceneCtx);
	return frame + (scene ? scene.from : 0);
};

/** Music energy 0..1 at the current frame (smoothed RMS of the track). */
export const useEnergy = () => {
	const {music, fps} = useTimeline();
	const f = useAbsoluteFrame();
	const x = (f / fps) * music.energyHz;
	const i = Math.floor(x);
	const a = music.energy[Math.min(i, music.energy.length - 1)] ?? 0;
	const b = music.energy[Math.min(i + 1, music.energy.length - 1)] ?? a;
	return a + (b - a) * (x - i);
};

/** 1 on each beat, decaying to 0; `every` = 4 pulses once a bar. */
export const useBeat = (decay = 7, every = 1) => {
	const {music} = useTimeline();
	const f = useAbsoluteFrame();
	let last = -1e9;
	for (let i = 0; i < music.beats.length; i += every) {
		if (music.beats[i] > f) break;
		last = music.beats[i];
	}
	return Math.exp(-(f - last) / decay);
};

/** 1 on each accented beat of the track (scaled by its strength), decaying to 0. */
export const useHit = (decay = 6, min = 0) => {
	const {music} = useTimeline();
	const f = useAbsoluteFrame();
	let v = 0;
	for (const [t, s] of music.hits ?? []) {
		if (t > f) break;
		if (s >= min) v = s * Math.exp(-(f - t) / decay);
	}
	return v;
};

/** Scene-local frames of the track's accents, so a scene can land its own events on them. */
export const useHitFrames = (min = 0) => {
	const {music} = useTimeline();
	const scene = useContext(SceneCtx);
	const from = scene ? scene.from : 0;
	return (music.hits ?? []).filter(([, s]) => s >= min).map(([t]) => t - from);
};

/** The beat (scene-local frame) nearest to `frame`. */
export const useSnapBeat = () => {
	const {music} = useTimeline();
	const scene = useContext(SceneCtx);
	const from = scene ? scene.from : 0;
	return (frame: number) => music.beats.reduce((best, b) => (Math.abs(b - from - frame) < Math.abs(best - frame) ? b - from : best), 1e9);
};

export const ease = {
	out: Easing.bezier(0.16, 1, 0.3, 1),
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	in: Easing.bezier(0.7, 0, 0.84, 0),
	back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** 0..1 progress from frame `start` over `dur` frames. */
export const prog = (frame: number, start: number, dur = 18, e = ease.out) =>
	interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: e,
	});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

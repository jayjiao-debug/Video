// Turns the script (lines.json) and the voice timings (timeline.json) into
// frame-accurate cues. Every visual reads its state from here, so editing a line
// and re-running tools/voice.py re-times the whole film.
import script from '../lines.json';
import timeline from './timeline.json';

export const FPS = 30;
export const DURATION = Math.ceil(timeline.duration * FPS);

export type Ev = {at: 'start' | 'key' | 'end'; do: string; [k: string]: unknown};
export type Line = {
	text: string;
	key: string;
	chapter: number;
	camera: string;
	events: Ev[];
};

export const LINES = script.lines as Line[];
export const CHAPTERS = script.chapters as string[];
export const CAMERAS = script.cameras as Record<string, {zoom: number; x: number; y: number}>;
export const TIMES = timeline.lines;
// sprite prefix of the narrator: "narrator" = original detective, "conan" = private-test Conan
export const NARRATOR_POS = ((script as {narrator_pos?: {x: number; y: number; front?: boolean}}).narrator_pos ?? {x: 208, y: 100, front: false});
export const DEFAULT_POSE = ((script as {default_pose?: string}).default_pose ?? 'sit') as string;
export const PORTRAIT = ((script as {portrait?: string}).portrait ?? '') as string;
export const NARRATOR_SET = ((script as {narrator?: string}).narrator ?? 'narrator') as string;

export type Cue = Ev & {frame: number; line: number};

const f = (s: number) => Math.round(s * FPS);

export const lineFrames = TIMES.map((t) => ({start: f(t.start), key: f(t.key), end: f(t.end)}));

export const CUES: Cue[] = LINES.flatMap((line, i) =>
	line.events.map((e) => ({...e, frame: lineFrames[i][e.at], line: i})),
).sort((a, b) => a.frame - b.frame);

export const cuesOf = (kind: string) => CUES.filter((c) => c.do === kind);

/** Last cue of a kind at or before frame (or undefined). */
export const lastCue = (kinds: string[], frame: number) => {
	let out: Cue | undefined;
	for (const c of CUES) if (kinds.includes(c.do) && c.frame <= frame) out = c;
	return out;
};

/** Index of the line on screen at a frame (line stays up until the next starts). */
export const lineAt = (frame: number) => {
	let idx = -1;
	lineFrames.forEach((l, i) => {
		if (frame >= l.start) idx = i;
	});
	return idx;
};

/** Window [inFrame, outFrame) for show/hide pairs like stat_card / stat_card_out. */
export const windows = (show: string, hide: string) => {
	const out: {in: number; out: number; cue: Cue}[] = [];
	for (const c of CUES) {
		if (c.do === show) {
			const prev = out[out.length - 1];
			if (prev && prev.out === Infinity) prev.out = c.frame; // re-show closes the last one
			out.push({in: c.frame, out: Infinity, cue: c});
		}
		if (c.do === hide && out.length && out[out.length - 1].out === Infinity) out[out.length - 1].out = c.frame;
	}
	return out;
};

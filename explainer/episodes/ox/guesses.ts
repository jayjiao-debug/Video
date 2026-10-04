import {random} from 'remotion';

/**
 * 787 illustrative guesses (示意), shaped like Galton's: middle half between 1162 and 1236 lb,
 * a long tail of misses either side, sorted; the middlemost (index 393, the 394th card) is 1207
 * as Galton published it. Deterministic.
 */
const MU = 1211;
const SD = 50;
const TAIL = 0.2;
const LOW_MU = 1120;
const LOW_SD = 70;
const normal = (i: number) => {
	const u = Math.max(1e-6, random(`g-u${i}`));
	const v = random(`g-v${i}`);
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// a main body plus a longer low tail (Galton's data was skewed low: mean 1197 < median 1207)
const raw = Array.from({length: 787}, (_, i) => Math.round(random(`g-t${i}`) < TAIL ? LOW_MU + LOW_SD * normal(i) : MU + SD * normal(i)));
raw.sort((a, b) => a - b);
// pin Galton's published quantiles (Q1 1162, median 1207, Q3 1236) by a monotone remap, then
// stretch the tail below Q1 until the mean is his 1197
const q1 = raw[196];
const md = raw[393];
const q3 = raw[590];
const remap = (g: number, tail: number) =>
	g <= q1 ? 1162 - (q1 - g) * ((1207 - 1162) / (md - q1)) * tail : g <= md ? 1207 - (md - g) * ((1207 - 1162) / (md - q1)) : 1207 + (g - md) * ((1236 - 1207) / (q3 - md));
let tail = 1;
for (let it = 0; it < 40; it++) {
	const mean = raw.reduce((a, g) => a + remap(g, tail), 0) / raw.length;
	tail *= 1 + (mean - 1197) / 200;
}
export const GUESSES: number[] = raw.map((g) => Math.round(remap(g, tail)));
export const MEDIAN_INDEX = 393;

/** Cards laid out on the desk in the quiet break (index into GUESSES), incl. the two far misses. */
export const SPREAD: {i: number; x: number; y: number; r: number}[] = (() => {
	const picks = [8, 782, 120, 560, 393 - 40, 250, 640, 30, 455, 180, 760, 330, 520, 95, 610, 420, 220, 690, 60, 480, 300, 740, 150, 580];
	return picks.map((i, k) => ({
		i,
		x: 340 + (k % 6) * 270 + (random(`sx${k}`) - 0.5) * 70,
		y: 400 + Math.floor(k / 6) * 150 + (random(`sy${k}`) - 0.5) * 50,
		r: (random(`sr${k}`) - 0.5) * 24,
	}));
})();

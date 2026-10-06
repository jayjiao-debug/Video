import {Easing, interpolate} from 'remotion';
import DATA from './data.json';

/**
 * 《鸡皮疙瘩在等什么》 (ep13) · Look C "Riso Coaster": the world model.
 * The coaster track is the graph of TENSION over film time (not loudness): y = 652 − 430·T, 135 world px per film
 * second, the cart = the playhead. Segments (audio/segments.json) give the edited soundtrack; a few "original"
 * arrangements are shown ahead of the cart until the scissors cut them (storyboard.md).
 */

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const PX = 135; // world px per film second
export const GROUND = 652;

export const C = {
	paper: '#F2ECDF',
	paperShade: '#E2D8C4',
	pink: '#FF48B0',
	blue: '#0078BF',
	yellow: '#FFE800',
	ink: '#1D2B5E',
	drained: '#A6A2B0',
	drainedType: '#7F7B8C',
	pinkSub: '#FF8FCC',
	gold: '#F1C56D',
	card: '#F3EDE2',
};
export const SANS = '"Noto Sans CJK SC", sans-serif';
export const SERIF = '"Noto Serif CJK SC", serif';
export const MONO = '"DejaVu Sans Mono", monospace';

export type Seg = {id: string; kind: string; film_from: number; film_to: number; track: [number, number] | null; reps?: number; fx: string; gain: number; bars: number};
export const SEGS = DATA.segments as Seg[];
export const COLS = DATA.cols as [number, number, number, number, number][];
export const LINES = DATA.lines as [number, number, string][];
export const LENGTH = DATA.length as number;
export const FRAMES = DATA.frames as number;
export const seg = (id: string) => SEGS.find((s) => s.id === id)!;
export const A0 = (id: string) => seg(id).film_from;
export const A1 = (id: string) => seg(id).film_to;

// key moments (film seconds)
export const T_TITLE = A0('title');
export const T_SNIP1 = 28.352;
export const T_CLIFF = A0('sil1');
export const T_PATCH = A0('bed2');
export const T_SNIP2 = 45.581;
export const T_DROP2 = A0('drop2');
export const T_SNIP3 = 66.305;
export const T_PRED = 70.856; // where the drop would have come
export const T_LATE = A0('drop3');
export const T_DRAIN = A0('cut4');
export const T_MDROP = A0('drop4');
export const T_SWEEP = A0('sweep');
export const T_BREATH = A0('breath');
export const T_FINAL = A0('final');
export const T_OUTRO = A0('outro');
export const T_CARD = A0('outro') + 2.03; // one outro bar after the final drop's 4 bars

export const ez = {
	io: Easing.inOut(Easing.cubic),
	out: Easing.bezier(0.2, 0.8, 0.2, 1),
	in: Easing.in(Easing.cubic),
	lin: (x: number) => x,
};
export const pr = (t: number, a: number, d = 0.4, e: (x: number) => number = ez.out) =>
	interpolate(t, [a, a + Math.max(1 / FPS, d)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const stampK = (t: number, at: number) => {
	const k = (t - at) * FPS;
	if (k < 0) return 0;
	if (k < 4) return 1.25 - 0.25 * (k / 4);
	return 1;
};

// ---------------------------------------------------------------- tension functions (storyboard formula)

const CREST = 0.94;
const LOW = 0.03;
const PL = 0.375;
const climb = (k: number, a: number, b: number, n: number) => a + (b - a) * Math.pow(clamp(k / n), 1.3) + 0.02 * Math.sin(2 * Math.PI * k) * (1 - k / n);
const crest = (k: number, n: number, amp = 0.015) => CREST + amp * Math.sin((Math.PI * k) / n);
const hills = (k: number, base: number, amp: number, per = 2) => base + amp * Math.sin((Math.PI * k) / per) ** 2;
const plunge = (k: number, n: number, t0: number, low: number, peak: number, end: number) =>
	k < PL
		? t0 - ((t0 - low) * (1 - Math.cos((Math.PI * k) / PL))) / 2
		: ((u: number) => low + (end - low) * u + (peak - (low + end) / 2) * Math.sin(Math.PI * u) ** 2)((k - PL) / (n - PL));
const smooth = (x: number) => {
	const u = clamp(x);
	return u * u * (3 - 2 * u);
};

/** bar index within a segment */
const kOf = (s: Seg, t: number) => (t - s.film_from) / ((s.film_to - s.film_from) / s.bars);

/** the EDITED track (what the film plays). null = no rail (the deleted drop) */
export const tension = (t: number, T: number): number | null => {
	// after the first cut and until the patch, the world past the cliff is void
	if (T >= T_SNIP1 && T < T_PATCH && t >= T_CLIFF) return null;
	// demo 2: nothing past the next bed is printed yet (the next demo's climb must not preview under "删掉铺垫")
	if (T >= 42.0 && T < T_DROP2 && t >= A0('cut3')) return null;
	if (t < 0) return climb((t + 4.06) / 2.03, 0.12, 0.26, 2);
	const s = SEGS.find((x) => t >= x.film_from && t < x.film_to) ?? SEGS[SEGS.length - 1];
	const k = kOf(s, t);
	switch (s.id) {
		case 'hook':
			return k < 3 ? climb(k, 0.26, CREST, 3) : crest(k - 3, 1);
		case 'title':
		case 'drop3':
		case 'drop4':
			return plunge(k, 2, CREST, LOW, 0.36, 0.16);
		case 'bed1':
		case 'bed3':
		case 'bed5':
			return hills(k, 0.16, 0.08);
		case 'bed4':
			return hills(k, 0.16, 0.08);
		case 'cut1':
			return k < 2 ? climb(k, 0.24, CREST, 2) : crest(k - 2, 1);
		case 'sil1':
			return T >= T_PATCH ? ramp(t) : null;
		case 'bed2':
			return ramp(t);
		case 'cut2':
			return hills(k, 0.1, 0.03, 1);
		case 'drop2':
			return plunge(k, 2, 0.1, 0.04, 0.2, 0.16);
		case 'cut3':
			return climb(k, 0.16, CREST, 2);
		case 'wait3':
			return crest(k, 3, 0.02);
		case 'cut4':
			return k < 1 ? climb(k, 0.24, CREST, 1) : crest(k - 1, 1);
		case 'sweep':
			return climb(k, 0.16, CREST, 2);
		case 'breath':
			return crest(k, 1);
		case 'final':
			return plunge(k, 4, CREST, 0.02, 0.4, 0.12);
		case 'outro':
			return hills(k, 0.12, 0.04);
		default:
			return 0.16;
	}
};
const ramp = (t: number) => {
	const s = seg('bed2');
	const H0 = hills(kOf(s, t), 0.1, 0.04);
	return CREST + (H0 - CREST) * smooth((t - T_CLIFF) / 4.6);
};

/** the ORIGINAL arrangement shown ahead of the cart until each cut (ghost afterwards) */
export const ORIGINALS: {from: number; to: number; cut: number; fn: (t: number) => number; lift: number}[] = [
	// demo 1: the drop that gets deleted
	{from: T_CLIFF, to: T_CLIFF + 8, cut: T_SNIP1, lift: 40, fn: (t) => (t - T_CLIFF < 4.06 ? plunge((t - T_CLIFF) / 2.03, 2, CREST, LOW, 0.36, 0.16) : hills((t - T_CLIFF - 4.06) / 2.03, 0.16, 0.08))},
	// demo 2: the build that gets lifted out
	{
		from: T_DROP2,
		to: T_DROP2 + 12.2,
		cut: T_SNIP2,
		lift: 60,
		fn: (t) => {
			const k = (t - T_DROP2) / 2.03;
			return k < 3 ? climb(k, 0.1, CREST, 3) : k < 4 ? crest(k - 3, 1) : plunge(k - 4, 2, CREST, LOW, 0.36, 0.16);
		},
	},
	// demo 3: the drop where it was predicted
	{from: T_PRED, to: T_PRED + 8.1, cut: T_SNIP3, lift: 0, fn: (t) => (t - T_PRED < 4.06 ? plunge((t - T_PRED) / 2.03, 2, CREST, LOW, 0.36, 0.16) : hills((t - T_PRED - 4.06) / 2.03, 0.16, 0.08))},
];

// ---------------------------------------------------------------- the cart (playhead) and the camera

/** film time the cart is at (it stops at the cliff and catches up after the patch) */
export const cartT = (T: number) => {
	if (T >= T_CLIFF && T < T_PATCH) return T_CLIFF;
	if (T >= T_PATCH && T < T_PATCH + 1) return mix(T_CLIFF, T, ez.in(clamp(T - T_PATCH)));
	return T;
};

type Mode = {t: number; d: number; A?: number; z: number; panAt?: number};
/** camera modes: ride (A fixed: the cart's screen x) or static (panAt: the time the camera froze); d = blend seconds */
const MODES: Mode[] = [
	{t: -10, d: 0, z: 1, panAt: 0, A: 430},
	{t: 9.2, d: 2.4, z: 1, A: 760},
	{t: 26.0, d: 0.8, z: 1, A: 560},
	{t: 30.383, d: 0.01, z: 1, panAt: 30.383, A: 560},
	{t: 34.9, d: 1.5, z: 1, A: 760},
	{t: 42.504, d: 0.8, z: 0.55, A: 400},
	{t: 46.6, d: 1.0, z: 1, A: 560},
	{t: 60.79, d: 0.8, z: 0.85, A: 420},
	{t: 67.4, d: 1.0, z: 0.8, A: 620},
	{t: 70.856, d: 0.01, z: 0.8, panAt: 70.856, A: 620},
	{t: 79.94, d: 0.8, z: 0.62, panAt: 71.86, A: 700},
	{t: 83.34, d: 0.8, z: 0.62, A: 1100},
	{t: 86.94, d: 0.8, z: 1, A: 620},
	{t: 104.64, d: 0.01, z: 1, panAt: 104.64, A: 620},
	// the payoff holds one static frame: climb, crest, plunge and rebound (labels readable through line 35)
	{t: 110.0, d: 1.3, z: 0.72, panAt: 103, A: 0},
	// the song is ending: ride on with the cart into the outro; the end card grows from it
	{t: 119.44, d: 1.6, z: 0.9, A: 1100},
];
const modeCam = (m: Mode, T: number) => {
	const pan = m.panAt !== undefined ? PX * m.panAt - (m.A ?? 620) / m.z : PX * cartT(T) - (m.A ?? 620) / m.z;
	return {pan, z: m.z};
};
export const camera = (T: number) => {
	let i = 0;
	while (i < MODES.length - 1 && T >= MODES[i + 1].t) i++;
	const cur = MODES[i];
	const prev = MODES[Math.max(0, i - 1)];
	const k = cur.d > 0 && i > 0 ? ez.io(clamp((T - cur.t) / cur.d)) : 1;
	const a = modeCam(prev, T);
	const b = modeCam(cur, T);
	// blend the screen position of the cart rather than raw pan (keeps the cart smooth)
	const z = mix(a.z, b.z, k);
	const Aa = (PX * cartT(T) - a.pan) * a.z;
	const Ab = (PX * cartT(T) - b.pan) * b.z;
	const A = mix(Aa, Ab, k);
	return {pan: PX * cartT(T) - A / z, z};
};

/** world (film time, tension) → screen */
export const toScreen = (t: number, Tn: number, cam: {pan: number; z: number}) => ({x: (PX * t - cam.pan) * cam.z, y: GROUND - 430 * Tn * cam.z});

/** shake on the plunges (world layers only) */
export const shake = (T: number) => {
	let s = 0;
	for (const [at, amp] of [
		[T_TITLE, 12],
		[T_DROP2, 5],
		[T_LATE, 12],
		[T_MDROP, 12],
		[T_FINAL, 14],
	] as const) {
		const f = (T - at) * FPS;
		if (f >= 0 && f < 12) s = Math.max(s, amp * Math.exp(-f / 3));
	}
	return {x: s * Math.sin(T * 97), y: s * Math.cos(T * 71)};
};

// ---------------------------------------------------------------- the muffled ink (demo 4)

const cutoff = (time: number) => {
	const k = clamp((time - T_SWEEP) / 4.052);
	return 400 * Math.pow(30, Math.pow(k, 1.6));
};
const reink = (time: number) => clamp((Math.log(cutoff(time)) - Math.log(920)) / (Math.log(4400) - Math.log(920)));
/** 0 = pink, 1 = drained, for a world point at film time t seen at film time T */
export const drain = (t: number, T: number) => {
	if (T < T_DRAIN || t < T_DRAIN) return 0;
	if (T < T_SWEEP) {
		const front = T + ((T - T_DRAIN) / 0.33) * 15; // the grey runs ahead of the playhead over ~10 frames
		return t <= front ? 1 : 0;
	}
	if (t < T_SWEEP) return 1;
	return 1 - reink(Math.min(t, T));
};
export const knobHz = (T: number) => (T < T_SWEEP ? 800 : cutoff(T));
export const colorMix = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a);
	const B = p(b);
	return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], k))).join(',')})`;
};

// ---------------------------------------------------------------- the inside meter (示意; floor 12 %)

const METER: [number, number][] = [
	[0, 30],
	[1.0, 32],
	[1.1, 42],
	[6.084, 70],
	[8.09, 76],
	[8.23, 96],
	[13.5, 40],
	[26.331, 38],
	[30.38, 70],
	[32.4, 72],
	[34.4, 58],
	[36, 40],
	[42.5, 32],
	[48.58, 30],
	[48.72, 74],
	[52, 42],
	[64.79, 38],
	[68.84, 70],
	[74.88, 72],
	[75.0, 74],
	[79, 45],
	[89.06, 40],
	[93.1, 65],
	[93.25, 62],
	[97, 42],
	[105.27, 40],
	[109.32, 75],
	[111.33, 82],
	[111.45, 96],
	[114.5, 80],
	[116.85, 74],
	[116.95, 94],
	[119.44, 66],
	[121.5, 55],
];
export const meter = (T: number) => {
	let v = METER[METER.length - 1][1];
	for (let i = 0; i < METER.length - 1; i++) {
		const [a, va] = METER[i];
		const [b, vb] = METER[i + 1];
		if (T >= a && T < b) {
			v = mix(va, vb, ez.io((T - a) / (b - a)));
			break;
		}
	}
	const jitter = (T > 6.08 && T < 8.1) || (T > 68.84 && T < 74.88) ? 2.5 * Math.sin(T * 75) : 0;
	return Math.max(12, v + jitter);
};

// ---------------------------------------------------------------- the strip clips and the timecode

export type Clip = {from: number; to: number; name: string; kind: 'build' | 'breath' | 'drop' | 'bed' | 'deleted'; muffled: boolean; trackFrom: number; trackLen: number};
const kindName: Record<string, [string, Clip['kind']]> = {
	build: ['铺垫', 'build'],
	breath: ['吸气', 'breath'],
	drop: ['高潮', 'drop'],
	after: ['高潮后', 'bed'],
	inter: ['间奏', 'bed'],
	tail: ['尾声', 'bed'],
};
const mk = (s: Seg, from: number, to: number, k: string): Clip => {
	const [name, kind] = kindName[k];
	const muffled = s.fx === 'lowpass';
	const trackLen = s.track ? (s.track[1] - s.track[0]) : 0;
	const trackFrom = s.track ? s.track[0] + ((from - s.film_from) % Math.max(0.001, trackLen)) : 0;
	return {from, to, name: name + (muffled ? '·闷' : ''), kind, muffled, trackFrom, trackLen};
};
export const CLIPS: Clip[] = (() => {
	const out: Clip[] = [];
	for (const s of SEGS) {
		const a = s.film_from;
		const b = s.film_to;
		switch (s.id) {
			case 'hook':
				out.push(mk(s, a, 6.084, 'build'), mk(s, 6.084, b, 'breath'));
				break;
			case 'cut1':
				out.push(mk(s, a, 30.383, 'build'), mk(s, 30.383, b, 'breath'));
				break;
			case 'cut4':
				out.push(mk(s, a, 91.092, 'build'), mk(s, 91.092, b, 'breath'));
				break;
			case 'wait3': {
				const d = (b - a) / 3;
				for (let i = 0; i < 3; i++) out.push(mk(s, a + i * d, a + (i + 1) * d, 'breath'));
				break;
			}
			case 'sil1':
				out.push({from: a, to: b, name: '已删除', kind: 'deleted', muffled: false, trackFrom: 0, trackLen: 0});
				break;
			case 'title':
			case 'drop2':
			case 'drop3':
			case 'drop4':
			case 'final':
				out.push(mk(s, a, b, 'drop'));
				break;
			case 'bed2':
			case 'cut2':
				out.push(mk(s, a, b, 'inter'));
				break;
			case 'cut3':
			case 'sweep':
				out.push(mk(s, a, b, 'build'));
				break;
			case 'breath':
				out.push(mk(s, a, b, 'breath'));
				break;
			case 'outro':
				out.push(mk(s, a, b, 'tail'));
				break;
			default:
				out.push(mk(s, a, b, 'after'));
		}
	}
	return out;
})();
export const SPLICES = [26.331, 34.412, 42.504, 48.582, 64.789, 70.856, 72.87, 89.06, 105.268, A0('outro')];

/** the position in the ORIGINAL song at film time T (edits show as jumps) */
export const songTime = (T: number) => {
	const s = SEGS.find((x) => T >= x.film_from && T < x.film_to);
	if (!s || !s.track) return null;
	const len = s.track[1] - s.track[0];
	return s.track[0] + ((T - s.film_from) % len);
};
export const fmtTime = (x: number | null) => {
	if (x === null) return '--:--.-';
	const m = Math.floor(x / 60);
	const s = x - m * 60;
	return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
};

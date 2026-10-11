import walk from './data/walk.json';
import pickup from './data/pickup.json';
import explain from './data/explain.json';
import putdown from './data/putdown.json';

/* Shared 3D motion for the two character renderers (flat 2D at 35°, cel-shaded 3D).
   The skeleton is the mocap actor's own (no retargeting, so feet and hands land where the actor's did);
   style comes from how each renderer dresses the bones (bigger head, mitten hands, coat).
   World: +x = walking direction, +y = up (floor 0), +z = the character's left. Units: body heights. */

export type V3 = [number, number, number];
export type J = Record<string, V3>;
type Clip = {fps: number; frames: J[]};
export const CLIPS = {walk: walk as unknown as Clip, pickup: pickup as unknown as Clip, putdown: putdown as unknown as Clip, explain: explain as unknown as Clip};

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => mul(a, 1 / (len(a) || 1e-9));
export const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const smooth = (x: number) => {
	const k = Math.max(0, Math.min(1, x));
	return k * k * (3 - 2 * k);
};
const lerpJ = (a: J, b: J, k: number): J => {
	const o: J = {};
	for (const n of Object.keys(a)) o[n] = lerp3(a[n], b[n] ?? a[n], k);
	return o;
};

const sampleClip = (c: Clip, t: number): J => {
	const n = c.frames.length;
	const x = Math.max(0, Math.min(n - 1, t * c.fps));
	const i = Math.min(n - 2, Math.floor(x));
	return lerpJ(c.frames[i], c.frames[i + 1], x - i);
};
/** joints relative to the hips' floor position, and that floor position */
const split = (j: J): {local: J; root: [number, number]} => {
	const h = j.Hips;
	const local: J = {};
	for (const n of Object.keys(j)) local[n] = [j[n][0] - h[0], j[n][1], j[n][2] - h[2]];
	return {local, root: [h[0], h[2]]};
};

type Seg = {clip: Clip | ((t: number) => J); at: number; from?: number; xf?: number};
const segJ = (s: Seg, t: number): J => (typeof s.clip === 'function' ? s.clip(t) : sampleClip(s.clip, t - s.at + (s.from ?? 0)));

/** A timeline of clips: each one continues from where the body is when it starts; crossfades blend pose and root. */
export const makeTrack = (segs: Seg[]) => {
	const offs: [number, number][] = [];
	const segRoot = (i: number, t: number): {local: J; root: [number, number]} => {
		const s = segs[i];
		const cur = split(segJ(s, t));
		const start = split(segJ(s, s.at));
		return {local: cur.local, root: [cur.root[0] - start.root[0] + offs[i][0], cur.root[1] - start.root[1] + offs[i][1]]};
	};
	const at = (t: number, upto = segs.length) => {
		let local: J | null = null;
		let root: [number, number] = [0, 0];
		for (let i = 0; i < upto; i++) {
			const s = segs[i];
			if (i > 0 && t < s.at) break;
			const r = segRoot(i, t);
			const k = i === 0 || !local ? 1 : smooth((t - s.at) / (s.xf ?? 0.3));
			local = local ? lerpJ(local, r.local, k) : r.local;
			root = [root[0] + (r.root[0] - root[0]) * k, root[1] + (r.root[1] - root[1]) * k];
		}
		const out: J = {};
		for (const n of Object.keys(local!)) out[n] = [local![n][0] + root[0], local![n][1], local![n][2] + root[1]];
		return out;
	};
	segs.forEach((s, i) => {
		if (i === 0) offs.push([0, 0]);
		else {
			const j = at(s.at, i);
			offs.push([j.Hips[0], j.Hips[2]]);
		}
	});
	return (t: number) => at(t);
};

/** Two-bone IK: move elbow and wrist so the wrist reaches `target`, bending toward the current elbow. */
export const ikArm = (j: J, side: 'Right' | 'Left', target: V3, k: number, handDir?: V3): J => {
	if (k <= 0) return j;
	const S = j[`${side}Arm`], E = j[`${side}ForeArm`], W = j[`${side}Hand`];
	const a = len(sub(E, S)), b = len(sub(W, E));
	const T0 = lerp3(W, target, k);
	const st = sub(T0, S);
	const d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, len(st)));
	const u = norm(st);
	const x = (a * a - b * b + d * d) / (2 * d);
	const h = Math.sqrt(Math.max(0, a * a - x * x));
	let pole = sub(E, S);
	pole = sub(pole, mul(u, dot(pole, u)));
	if (len(pole) < 1e-5) pole = [0, -1, 0];
	const Ep = add(add(S, mul(u, x)), mul(norm(pole), h));
	const Wp = add(S, mul(u, d));
	const o: J = {...j, [`${side}ForeArm`]: Ep, [`${side}Hand`]: Wp};
	const idx = sub(j[`${side}HandIndex1`], W), th = sub(j[side === 'Right' ? 'RThumb' : 'LThumb'], W);
	const dir = handDir ? lerp3(norm(idx), norm(handDir), k) : norm(idx);
	o[`${side}HandIndex1`] = add(Wp, mul(norm(dir), len(idx)));
	o[side === 'Right' ? 'RThumb' : 'LThumb'] = add(Wp, th);
	return o;
};

/** Torso frame: forward (chest facing), up (spine), left (shoulder axis). */
export const torso = (j: J) => {
	const up = norm(sub(j.Neck, j.Hips));
	const left = norm(sub(j.LeftArm, j.RightArm));
	const fwd = norm(cross(up, left));
	return {fwd, up, left};
};

/** Stylized head: 1.45× an adult head, sitting on the neck; its frame can be turned toward a target. */
export const HEAD_R = 0.088;
export const head = (j: J, look?: V3, k = 0) => {
	const upRaw = norm(sub(j.Head_end, j.Head));
	const t = torso(j);
	let fwd = norm(sub(t.fwd, mul(upRaw, dot(t.fwd, upRaw))));
	let up = upRaw;
	const c0 = add(j.Head, mul(up, HEAD_R * 0.6));
	if (look && k > 0) {
		const want = norm(sub(look, c0));
		// the neck turns up to ~70° and tilts up/down up to ~40°
		const flat = norm([want[0], 0, want[2]]);
		const pitch = Math.max(-0.65, Math.min(0.55, want[1]));
		const target = norm(add(mul(flat, Math.sqrt(1 - pitch * pitch)), [0, pitch, 0]));
		fwd = norm(lerp3(fwd, target, k));
		up = norm(sub([0, 1, 0], mul(fwd, dot([0, 1, 0], fwd))));
		up = norm(lerp3(upRaw, up, k));
	}
	const left = norm(cross(fwd, up));
	const c = add(j.Head, mul(up, HEAD_R * 0.6));
	return {c, fwd, up, left};
};

/* ---------------- the test scene: walk in, pick up a lantern, lift it to look, talk holding it ---------------- */
const hold = (t: number): J => {
	const end = sampleClip(CLIPS.pickup, 99);
	const b = Math.sin(t * 2.2) * 0.004;
	const o: J = {};
	for (const n of Object.keys(end)) o[n] = n.includes('Leg') || n.includes('Foot') || n.includes('Toe') ? end[n] : [end[n][0], end[n][1] + b, end[n][2]];
	return o;
};
const track = makeTrack([
	{clip: CLIPS.walk, at: 0, from: 0.05},
	{clip: CLIPS.pickup, at: 2.2, from: 0.15, xf: 0.45},
	{clip: hold, at: 5.2, xf: 0.5},
	{clip: CLIPS.putdown, at: 7.3, from: 0.0, xf: 0.5},
	{clip: CLIPS.explain, at: 9.3, from: 0.0, xf: 0.7},
]);
export const DEMO_T = 13.5;
export const T_READ = 5.25;
export const T_TALK = 9.4;
const lowest = (a: number, b: number) => {
	let best = a, low = 9;
	for (let t = a; t < b; t += 1 / 30) {
		const y = track(t).RightHand[1];
		if (y < low) {
			low = y;
			best = t;
		}
	}
	return Math.round(best * 30) / 30;
};
export const T_GRAB = lowest(2.6, 4.8);
export const T_PUT = lowest(7.6, 9.2);
const grip = (j: J): V3 => lerp3(j.RightHand, j.RightHandIndex1, 0.5);
export const LANTERN_SPOT: V3 = grip(track(T_GRAB));
/** where it is set down: under the hand at the put-down moment, on the floor */
export const LANTERN_REST: V3 = (() => {
	const g = grip(track(T_PUT));
	return [g[0], g[1], g[2]];
})();
/** the camera direction (subject → camera): the character's right side, turned 35° toward the front, 6° above */
export const CAM_YAW = 35;
export const camDir = (yaw = CAM_YAW, pitch = 6): V3 => {
	const a = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
	return norm([Math.sin(a) * Math.cos(p), Math.sin(p), -Math.cos(a) * Math.cos(p)]);
};

export const demoAt = (t: number) => {
	let j = track(t);
	const tf = torso(j);
	const kRead = smooth((t - T_READ) / 0.7) * (1 - smooth((t - 7.25) / 0.6));
	const h0 = head(j);
	const down: V3 = [0.15, -1, 0];
	j = ikArm(j, 'Right', add(add(h0.c, mul(tf.fwd, 0.2)), [0, -0.05, -0.06]), kRead, down);
	const held = t >= T_GRAB && t < T_PUT;
	const lantern: V3 = held ? grip(j) : t >= T_PUT ? LANTERN_REST : LANTERN_SPOT;
	// look: the lantern on the floor while approaching, in hand while reading, where it goes down, then the camera
	const kFloor = smooth((t - 1.0) / 0.6) * (1 - smooth((t - T_GRAB - 0.3) / 0.5));
	const kHand = smooth((t - T_READ - 0.2) / 0.5) * (1 - smooth((t - 7.3) / 0.5));
	const kPut = smooth((t - 7.4) / 0.4) * (1 - smooth((t - T_PUT - 0.4) / 0.5));
	const kCam = smooth((t - T_TALK - 0.2) / 0.6);
	const target = kHand > 0.01 ? add(lantern, [0, -0.08, 0]) : kPut > 0.01 ? LANTERN_REST : kCam > 0.01 ? add(h0.c, mul(camDir(), 2)) : LANTERN_SPOT;
	const kLook = Math.max(kFloor, kHand, kPut, kCam * 0.85);
	const hd = head(j, target, kLook);
	return {j, lantern, held, head: hd, expr: t > T_TALK ? 'smile' : t > T_READ && t < 7.3 ? 'thinking' : 'neutral', talk: t > T_TALK + 0.3 && Math.sin(t * 15) > 0 && Math.sin(t * 2.3) > -0.6};
};

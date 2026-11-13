// HER EYES: the reporter's camera of the Newton film (PLAN 4), kept generic (Qin's machinery). WP3.
// A camera is a story.ts CamPose (vertical fov in degrees, roll in radians). Everything here is a PURE function of its
// arguments: the frame in, a pose out; no state between frames; all noise from hash() (never Math.random / Date).
// THIS FILM: she IS the camera (eyes 1.6 m, fov 62); the camera moves because HE moves. The default mood is "still"
// (NO breathing sway); a light handheld comes only with `walk` (her walking / trotting: 0..1, 1.5 = a trot).
//
//   povCam(f, keys, o)    THE CAMERA: eased keyframes (position, look-at, fov) + the handheld layer (mood still by
//                         default; the walking bob at 2.2 steps/s with `walk`), moods: still | calm | excited | scared
//   keyCam / handheld     the two halves of povCam, for a camera that comes from elsewhere (follow, a rig point)
//   the moves (a CamPose in, a CamPose out, so they stack):
//     punchIn    fov x 0.8 in 4-6 frames, ease-out (a reaction)
//     whip       a whip pan out of one view and into another, the cut hidden in the blur ({ cam, post, smear })
//     follow     behind / beside a walking figure, lagging a little (smoothed); with back < 0 she walks backwards in
//                front of him (the garden)
//     dip / duck / aside / creep / lean / handCover / lower / nudge   (Qin's; creep = the slow PUSH-IN of 44-50)
//   overlays     whipSmear(k, dir), palm(cover): React nodes for Pose.overlays (1080 x 1920)
// HER MIC AND HANDS (first-person things IN the 3D scene, so they take the place's light and the lens blur):
//   micPose(cam, f, o)    where the mic (props "mic") and her left hand ("hand", pose grip) go for this camera:
//                         o.aim = a world point it is held toward (the speaker's mouth; the door's knock point) or
//                         "lens" (an ASIDE: the red head turned to the lens, big, lower middle; returns a dof that
//                         focuses on it so he goes soft behind); o.lens 0..1 blends toward the aside (ease the swing);
//                         o.enter 0..1 (0 = out of frame at the lower left: it enters on that diagonal); o.rap 0..1
//                         (the head pushed out to touch `aim`: rapK(f, ons) gives the strikes); o.tilt deg (the head
//                         dipped toward something low: the drafts); o.avoid = a screen box it slides right out of
//                         (SCREEN.card while a fact card shows). The red head never comes below y 1190 px.
//                         -> { mic: {at, rot}, hand: {at, rot, pose}, head, headPx, dof?, visible }
//   putMic(w, cam, f, o)  the same, put into the World (w.prop("mic"), w.prop("hand"))
//   freeHand(cam, grip, o) her RIGHT hand ("handR") gripping a bar at a world point (the chair's rail, the board's
//                         edge), the forearm back toward her right shoulder; o.pose "open" = a flat hand there
//   chairDrag(cam, at, yaw)  the right hand on the chair's top rail (the shot moves the chair)
//   wipe(cam, f, nose, on)   the handkerchief in the right hand: in from the lower right, TWO strokes across his nose
//                         (noseOf(rig) gives the point), out: { hand, cloth, strokes: [frame, frame] (swap his ink
//                         figure on these), visible }
//   boardHold(cam, f, o)  the board held up close by both edges, its drawing upright to the lens (right hand; the left
//                         hand, the mic out of shot, takes the other edge): { board, hand, handL }
//   clapHands(cam, f, ons) she claps alone: the open right hand meets the back of the left (mic) hand at each frame of
//                         `ons`: { mic, hand, handR }
//   camFrame / toScreen / fromScreen   the camera's frame with its roll; world <-> 1080 x 1920 px
// Rules (PLAN 4): never inside geometry (keep 0.15 m from walls); his eyes in the upper third; faces out of the subtitle
// band; the mic enters from the LOWER LEFT and its red head stays ABOVE the subtitle band (y < 1190 px).
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, hash, h, type CamPose, type V3Like } from "./story";
import { EYE, FOV } from "./layout/base";
import { MIC, CHAIR, BOARD } from "./props/things";
import type { World } from "./world";

export { EYE, FOV };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const v3 = (p: V3Like) => (p instanceof THREE.Vector3 ? p.clone() : V(p[0], p[1], p[2]));
const arr = (p: THREE.Vector3): [number, number, number] => [p.x, p.y, p.z];
const RAD = Math.PI / 180, UP = V(0, 1, 0);
type Ease = (x: number) => number;

// ------------------------------------------------------------------------------------------------------- the basics
/** the camera's frame: forward (unit), right (unit, horizontal), up (unit, perpendicular to both), and the distance to
 *  the look point */
export const camAxes = (c: CamPose) => {
  const p = v3(c.pos), l = v3(c.look), fwd = l.clone().sub(p), dist = Math.max(1e-4, fwd.length());
  fwd.divideScalar(dist);
  const right = fwd.clone().cross(UP); if (right.lengthSq() < 1e-8) right.set(1, 0, 0); right.normalize();
  const up = right.clone().cross(fwd).normalize();
  return { p, l, fwd, right, up, dist };
};
/** the camera turned about its own position: yaw (deg, + = to the RIGHT), pitch (deg, + = up), plus a shift of the
 *  lens (m) along its right / up / forward axes, plus roll (deg, + = the horizon tilts clockwise on screen). The look
 *  point keeps its distance. */
export const nudge = (c: CamPose, o: { yaw?: number; pitch?: number; roll?: number; right?: number; up?: number; fwd?: number }): CamPose => {
  const A = camAxes(c), d = A.fwd.clone();
  if (o.yaw) d.applyAxisAngle(UP, -o.yaw * RAD);
  if (o.pitch) { const r = d.clone().cross(UP).normalize(); if (r.lengthSq() > 1e-8) d.applyAxisAngle(r, o.pitch * RAD); }
  const p = A.p.clone().addScaledVector(A.right, o.right ?? 0).addScaledVector(A.up, o.up ?? 0).addScaledVector(A.fwd, o.fwd ?? 0);
  return { ...c, pos: arr(p), look: arr(p.clone().addScaledVector(d, A.dist)), roll: (c.roll ?? 0) + (o.roll ?? 0) * RAD };
};
/** a frame's progress through [on, on + len) with an easing (0 before, 1 after) */
const prog = (f: number, on: number, len: number, e: Ease = smooth) => e(clamp01((f - on) / Math.max(1, len)));
/** in over `len` from `on`, out over `len` up to `off` (off undefined = it stays): 0..1 */
const inOut = (f: number, on: number, off: number | undefined, len: number, e: Ease = easeInOutCubic) =>
  prog(f, on, len, e) * (off === undefined ? 1 : 1 - prog(f, off - len, len, e));
/** smooth value noise in -1..1: t in cycles, `k` a stream id */
const noise = (t: number, k: number) => { const i = Math.floor(t), u = t - i, s = u * u * (3 - 2 * u); return (lerp(hash(i, k), hash(i + 1, k), s) - 0.5) * 2; };

// ---------------------------------------------------------------------------------------------------- the keyframes
/** a camera key: on frame f the lens is at pos looking at look (fov: default the previous key's, else FOV; roll in
 *  degrees); `ease` shapes the move that ARRIVES at this key (default easeInOutCubic) */
export type CamKey = { f: number; pos: V3Like; look: V3Like; fov?: number; roll?: number; ease?: Ease };
/** the camera of the keys alone (no handheld): eased between the two keys around f, held before the first and after
 *  the last.  keyCam(f, [{ f: 0, pos: [100, 1.55, 4.2], look: [100, 1.35, -10] }, { f: 90, pos: [100, 1.55, 1.8], look: [100, 1.35, -10] }]) */
export const keyCam = (f: number, keys: CamKey[], fov = FOV): CamPose => {
  if (!keys.length) throw new Error("keyCam: no keys");
  const fovs: number[] = []; let last = fov; for (const k of keys) fovs.push((last = k.fov ?? last));
  let i = 0; while (i + 1 < keys.length && keys[i + 1].f <= f) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  if (b === a || f <= a.f) return { pos: arr(v3(a.pos)), look: arr(v3(a.look)), fov: fovs[i], roll: (a.roll ?? 0) * RAD };
  const t = (b.ease ?? easeInOutCubic)(clamp01((f - a.f) / Math.max(1, b.f - a.f)));
  return { pos: arr(v3(a.pos).lerp(v3(b.pos), t)), look: arr(v3(a.look).lerp(v3(b.look), t)), fov: lerp(fovs[i], fovs[i + 1], t), roll: lerp(a.roll ?? 0, b.roll ?? 0, t) * RAD };
};

// ---------------------------------------------------------------------------------------------------- the handheld
export type Mood = "still" | "calm" | "excited" | "scared";
/** the handheld amounts of a mood: breathing (Hz; lens rise m; sway m; yaw / pitch / roll deg), tremble (deg at 8-12 Hz) */
export const MOODS: Record<Mood, { hz: number; rise: number; sway: number; yaw: number; pitch: number; roll: number; tremble: number }> = {
  still: { hz: 0.25, rise: 0, sway: 0, yaw: 0, pitch: 0, roll: 0, tremble: 0 },
  calm: { hz: 0.25, rise: 0.006, sway: 0.004, yaw: 0.35, pitch: 0.25, roll: 0.35, tremble: 0 },
  excited: { hz: 0.32, rise: 0.009, sway: 0.007, yaw: 0.7, pitch: 0.45, roll: 0.7, tremble: 0.05 },
  scared: { hz: 0.42, rise: 0.011, sway: 0.008, yaw: 0.6, pitch: 0.5, roll: 0.6, tremble: 0.16 },
};
/** the handheld options: mood = one mood or step keys [frame, mood] (each change blends over 8 frames; default "still":
 *  no breathing camera in this film); walk = 0..1 (how much she is walking; up to 1.5 = a trot) or eased keys [frame,
 *  amount]; seed = another handheld (default 1); amp = a multiplier on all of it (default 1); fov = the default fov of
 *  the keys */
export type HandO = { mood?: Mood | [number, Mood][]; walk?: number | [number, number][]; seed?: number; amp?: number; fov?: number };
/** her steps: 2.2 a second */
export const STEP_HZ = 2.2;
const moodAt = (f: number, m: HandO["mood"]) => {
  const keys: [number, Mood][] = typeof m === "string" || m === undefined ? [[-1e9, m ?? "still"]] : m;
  let cur = MOODS[keys[0][1]];
  for (let i = 1; i < keys.length; i++) {
    const [k, md] = keys[i]; if (f < k) break;
    const t = smooth((f - k) / 8), nx = MOODS[md], o = cur;
    cur = { hz: lerp(o.hz, nx.hz, t), rise: lerp(o.rise, nx.rise, t), sway: lerp(o.sway, nx.sway, t), yaw: lerp(o.yaw, nx.yaw, t), pitch: lerp(o.pitch, nx.pitch, t), roll: lerp(o.roll, nx.roll, t), tremble: lerp(o.tremble, nx.tremble, t) };
  }
  return cur;
};
/** how light her walking camera is (PLAN 4: "a very light handheld only on walks / trots") */
export const WALK_K = 0.55;
const cw = (x: number) => Math.max(0, Math.min(1.5, x));
const walkAt = (f: number, w: HandO["walk"]) => {
  if (w === undefined) return 0;
  if (typeof w === "number") return cw(w);
  let i = 0; while (i + 1 < w.length && w[i + 1][0] <= f) i++;
  const a = w[i], b = w[Math.min(i + 1, w.length - 1)];
  if (b === a || f <= a[0]) return cw(a[1]);
  return cw(lerp(a[1], b[1], easeInOutCubic(clamp01((f - a[0]) / Math.max(1, b[0] - a[0])))));
};
/** THE HANDHELD LAYER on any camera: breathing sway (a slow rise and fall with a little drift), the walking bob (one dip
 *  per step, a side-to-side sway and roll once per two steps), the tremble (8-12 Hz, small).
 *  handheld(cam, f, { mood: "scared", walk: [[0, 1], [40, 0]] }) */
export const handheld = (c: CamPose, f: number, o: HandO = {}): CamPose => {
  const M = moodAt(f, o.mood), amp = o.amp ?? 1, s = (o.seed ?? 1) * 13.7, t = f / FPS, wk = walkAt(f, o.walk) * WALK_K;
  if (amp === 0) return c;
  // breathing: a sine at the mood's rate with a slow wander in its phase and size
  const ph = 2 * Math.PI * M.hz * t + 0.8 * noise(t * 0.15, s + 1), br = Math.sin(ph) * (0.8 + 0.2 * noise(t * 0.3, s + 2));
  const dr = (k: number) => noise(t * 0.45, s + k) * 0.7 + noise(t * 1.1, s + k + 50) * 0.3;          // the drift of the hands
  // the walk: the lens dips at each footfall (|sin| at the step rate), sways and rolls at half of it (a trot steps faster)
  const sp = Math.PI * STEP_HZ * (1 + 0.25 * Math.max(0, wk / WALK_K - 1)) * t, bob = (Math.abs(Math.sin(sp)) - 0.64) * 0.026 * wk, side = Math.sin(sp) * wk;
  // the tremble: value noise at 10 cycles a second, two streams
  const tr = (k: number) => noise(t * 10, s + k) * 0.7 + noise(t * 7.3, s + k + 9) * 0.3;
  return nudge(c, {
    up: amp * (M.rise * br + bob),
    right: amp * (M.sway * dr(3) + 0.011 * side),
    yaw: amp * (M.yaw * dr(4) + 0.35 * side + M.tremble * tr(5)),
    pitch: amp * (M.pitch * (0.6 * br + 0.4 * dr(6)) - 0.3 * (Math.abs(Math.sin(sp)) - 0.64) * wk + M.tremble * tr(7)),
    roll: amp * (M.roll * dr(8) + 0.8 * side + M.tremble * 0.6 * tr(9)),
  });
};
/** THE CAMERA: her eyes from keys, with the handheld layer.
 *  povCam(f, [{ f: 0, pos: [100.2, 1.55, 4.2], look: [100, 1.35, -10] }, { f: 120, pos: [100.1, 1.55, 0.9], look: [100, 1.35, -10] }], { mood: "scared", walk: 1 }) */
export const povCam = (f: number, keys: CamKey[], o: HandO = {}): CamPose => handheld(keyCam(f, keys, o.fov ?? FOV), f, o);

// ---------------------------------------------------------------------------------------------------------- the moves
/** PUNCH IN: the fov narrows to k (0.8 = -20 %) over len (4-6) frames from `on`, ease-out; with `off` it eases back
 *  out over len frames ending on off.  punchIn(cam, f, capWord("A05", "朕").from, { len: 5 }) */
export const punchIn = (c: CamPose, f: number, on: number, o: { k?: number; len?: number; off?: number } = {}): CamPose => {
  const len = o.len ?? 5, k = o.k ?? 0.8;
  const t = prog(f, on, len, easeOutCubic) * (o.off === undefined ? 1 : 1 - prog(f, o.off - len, len, easeInOutCubic));
  return t ? { ...c, fov: c.fov * lerp(1, k, t) } : c;
};
/** WHIP PAN: from `on`, `out` frames (4) yawing away from `c` (ease-in, `deg` 25, dir 1 = to the right), then `in`
 *  frames (4) arriving into `to` (default c) from the other side (ease-out); settled on on + out + in. Returns the
 *  camera, the post (a lens blur through the film's DOF, all depths alike: focus 0.05 m) and smear 0..1 (for
 *  whipSmear) and cut (true from the arriving half on: show the next view's things).
 *    const W = whip(camA, f, on, { dir: 1, to: camB }); return { camera: W.cam, post: W.post, overlays: whipSmear(W.smear, 1) } */
export const whip = (c: CamPose, f: number, on: number, o: { dir: 1 | -1; to?: CamPose; deg?: number; out?: number; in?: number; blur?: number }) => {
  const out = o.out ?? 4, inn = o.in ?? 4, deg = o.deg ?? 25, end = on + out + inn;
  if (f < on || f >= end) return { cam: f >= end && o.to ? o.to : c, post: undefined, smear: 0, cut: f >= end && !!o.to };
  const leaving = f < on + out, u = leaving ? (f - on + 1) / out : (f - on - out) / inn;
  const yaw = leaving ? o.dir * deg * easeInCubic(u) : -o.dir * deg * (1 - easeOutCubic(u));
  const k = leaving ? easeInCubic(u) : 1 - easeOutCubic(u);
  return { cam: nudge(leaving ? c : o.to ?? c, { yaw }), post: { dof: { focus: 0.05, amount: (o.blur ?? 22) * k } }, smear: k, cut: !leaving && !!o.to };
};
/** FOLLOW: the lens behind (back m) and beside (side m, + = to the walker's right) a walking figure, at her eye height,
 *  looking ahead of the figure; `who(f)` gives the figure's floor point on any frame (pure), smoothed over `win`
 *  frames (the camera lags half of it); the direction is the walker's own (from its path), or `yaw` when it stands.
 *    follow(f, (g) => walkAlong(PATH, 1.1, g / FPS).at, { back: 1.8, side: 0.3 }) */
export const follow = (f: number, who: (f: number) => THREE.Vector3, o: { back?: number; side?: number; y?: number; ahead?: number; lookY?: number; win?: number; yaw?: number; fov?: number; look?: "ahead" | "him" } = {}): CamPose => {
  const win = Math.max(1, Math.round(o.win ?? 10)), p = V(); let wsum = 0;
  for (let i = 0; i < win; i++) { const w = win - i; p.addScaledVector(who(f - i), w); wsum += w; }
  p.divideScalar(wsum);
  const vel = who(f).sub(who(f - win)), dir = vel.lengthSq() > 1e-4 ? V(vel.x, 0, vel.z).normalize() : V(Math.sin(o.yaw ?? 0), 0, Math.cos(o.yaw ?? 0));
  const right = V(-dir.z, 0, dir.x);                  // the walker's right, looking along dir
  const pos = p.clone().addScaledVector(dir, -(o.back ?? 1.8)).addScaledVector(right, o.side ?? 0.3); pos.y = p.y + (o.y ?? EYE);
  const look = o.look === "him" ? p.clone() : p.clone().addScaledVector(dir, o.ahead ?? 2.5); look.y = p.y + (o.lookY ?? 1.3);
  return { pos: arr(pos), look: arr(look), fov: o.fov ?? FOV };
};
/** DIP: from `on` the lens sinks `depth` (0.6 m) and pitches down `pitch` deg (12: more puts a figure 3-6 m away
 *  out of the top of the frame) over len frames, strains while
 *  down (a small 6 Hz shake that grows), and comes back up over len frames ending on `off`.
 *    dip(cam, f, capWord("B05", "搬").from, capWord("B06", "起").to) */
export const dip = (c: CamPose, f: number, on: number, off?: number, o: { depth?: number; pitch?: number; len?: number; strain?: number } = {}): CamPose => {
  const len = o.len ?? 10, k = inOut(f, on, off, len);
  if (!k) return c;
  const t = f / FPS, held = clamp01((f - on - len) / 20), sh = (o.strain ?? 1) * k * (0.25 + 0.35 * held);
  return nudge(c, { up: -(o.depth ?? 0.6) * k + 0.004 * sh * noise(t * 6, 71), pitch: -(o.pitch ?? 12) * k + sh * 0.5 * noise(t * 6, 72), yaw: sh * 0.4 * noise(t * 5.3, 73), roll: sh * 0.9 * noise(t * 4.1, 74) });
};
/** DUCK: from `on` the lens drops to `to` m (1.0) above floorY over len frames (6, fast, ease-out), keeping the look
 *  point (the subject stays framed, the camera tips up a little), and rises back over len frames ending on `off`.
 *    duck(cam, f, capWord("F06", "有").from, undefined, { to: 1.0 }) */
export const duck = (c: CamPose, f: number, on: number, off?: number, o: { to?: number; len?: number; floorY?: number } = {}): CamPose => {
  const len = o.len ?? 6, k = prog(f, on, len, easeOutCubic) * (off === undefined ? 1 : 1 - prog(f, off - len, len, easeInOutCubic));
  if (!k) return c;
  const p = v3(c.pos), drop = (p.y - ((o.floorY ?? 0) + (o.to ?? 1.0))) * k;
  return { ...c, pos: [p.x, p.y - drop, p.z] };
};
/** ASIDE: from `on` the camera swings over len frames (8) to look at `wall` (a point on the near wall), moving `push`
 *  m (0.25) toward it, holds, and swings back over len frames ending on `off`.
 *    aside(cam, f, line("C08").from - 6, line("C08").to + 4, QHALL.asideWall) */
export const aside = (c: CamPose, f: number, on: number, off: number | undefined, wall: V3Like, o: { len?: number; push?: number; roll?: number } = {}): CamPose => {
  const k = inOut(f, on, off, o.len ?? 8);
  if (!k) return c;
  const p = v3(c.pos), w = v3(wall), toW = w.clone().sub(p), d = toW.length(), push = Math.min(o.push ?? 0.25, Math.max(0, d - 0.6));
  const pos = p.clone().addScaledVector(toW.normalize(), push * k), look = v3(c.look).lerp(w, k);
  return { ...c, pos: arr(pos), look: arr(look), roll: (c.roll ?? 0) + (o.roll ?? 2) * RAD * Math.sin(Math.PI * k) };
};
/** CREEP: a steady push of `dist` m along the view (horizontal) between frames from and to, with soft starts (6 frames)
 *  and no stop in between.  creep(cam, f, seg("G").from, seg("G").from + 150, 2.4) */
export const creep = (c: CamPose, f: number, from: number, to: number, dist: number): CamPose => {
  const n = Math.max(1, to - from), ramp = Math.min(6, n / 3), x = clamp01((f - from) / n) * n;
  // constant speed with a ramp in and out: the distance done by frame x of n
  const v = 1 / (n - ramp), done = x < ramp ? (v * x * x) / (2 * ramp) : x > n - ramp ? 1 - (v * (n - x) * (n - x)) / (2 * ramp) : v * (x - ramp / 2);
  if (!done) return c;
  const A = camAxes(c), d = V(A.fwd.x, 0, A.fwd.z).normalize().multiplyScalar(dist * clamp01(done));
  return { ...c, pos: arr(A.p.add(d)), look: arr(A.l.add(d)) };
};
/** LEAN, where he must be: the distance from the lens to the middle of a head `headW` m wide for it to fill `fill`
 *  (0.6) of the frame's width at the vertical fov `fov` on 9:16.  leanDist(0.6, 64, 0.52) -> 1.23 */
export const leanDist = (fill = 0.6, fov = FOV, headW = 0.52, aspect = 9 / 16) => headW / (2 * fill * Math.tan((fov * RAD) / 2) * aspect);
/** LEAN, his floor point: along the camera's view (horizontal), far enough that his head (headY m up, headW wide)
 *  fills `fill` of the width.  const at = leanStand(cam, { headY: 1.58 * 1.08 }) */
export const leanStand = (c: CamPose, o: { fill?: number; headW?: number; headY?: number; floorY?: number } = {}): THREE.Vector3 => {
  const A = camAxes(c), d = leanDist(o.fill ?? 0.6, c.fov, o.headW ?? 0.52), dy = (o.headY ?? 1.7) - A.p.y + (o.floorY ?? 0);
  const flat = Math.sqrt(Math.max(0.04, d * d - dy * dy)), dir = V(A.fwd.x, 0, A.fwd.z).normalize();
  const at = A.p.clone().addScaledVector(dir, flat); at.y = o.floorY ?? 0;
  return at;
};
/** LEAN, the camera: as his head (world centre `head`) comes in from `on`, the lens gives way `back` m (0.08) and turns
 *  to keep the head's middle in the upper third (NDC y +1/3), over len frames (8).
 *    lean(cam, f, capWord("C09", "嗯").from, r.headWorld()) */
export const lean = (c: CamPose, f: number, on: number, head: V3Like, o: { back?: number; len?: number; third?: number } = {}): CamPose => {
  const k = prog(f, on, o.len ?? 8, easeOutCubic);
  if (!k) return c;
  const A = camAxes(c), p = A.p.clone().addScaledVector(V(A.fwd.x, 0, A.fwd.z).normalize(), -(o.back ?? 0.08) * k);
  const hd = v3(head), dist = hd.distanceTo(p), drop = dist * Math.tan(((c.fov * RAD) / 2)) * (o.third ?? 1 / 3);
  const aim = hd.clone(); aim.y -= drop;
  return { ...c, pos: arr(p), look: arr(A.l.clone().lerp(aim, k)) };
};
/** HAND OVER THE LENS: from `on` his palm comes at the lens over len frames (6): cover 0..1 (ease-in), the camera
 *  jolts back 3 cm and tips as it lands. Draw palm(cover) in the overlays; at cover 1 the frame is his dark palm (the
 *  cut).  const H = handCover(cam, f, capWord("A12", "拍").from); return { camera: H.cam, overlays: palm(H.cover) } */
export const handCover = (c: CamPose, f: number, on: number, o: { len?: number } = {}) => {
  const len = o.len ?? 6, cover = prog(f, on, len, easeInCubic);
  if (f < on) return { cam: c, cover: 0 };
  const hit = f - (on + len), jolt = hit >= 0 && hit < 6 ? (1 - hit / 6) * (hit % 2 ? -0.5 : 1) : 0;
  return { cam: nudge(c, { fwd: -0.03 * cover, pitch: -1.5 * cover + 0.8 * jolt, roll: 1.2 * jolt }), cover };
};
/** LOWER: from `on` she lets the camera droop over len frames (30) to `to` m (0.6) above floorY, the view sinking with
 *  it and tipping down 6 deg, the horizon tilting `tilt` deg (8).  lower(cam, f, capWord("G06", "原").from) */
export const lower = (c: CamPose, f: number, on: number, o: { to?: number; tilt?: number; len?: number; floorY?: number; pitch?: number } = {}): CamPose => {
  const k = prog(f, on, o.len ?? 30, easeInOutCubic);
  if (!k) return c;
  const p = v3(c.pos), l = v3(c.look), drop = (p.y - ((o.floorY ?? 0) + (o.to ?? 0.6))) * k;
  return nudge({ ...c, pos: [p.x, p.y - drop, p.z], look: [l.x, l.y - drop * 0.85, l.z] }, { pitch: -(o.pitch ?? 6) * k, roll: (o.tilt ?? 8) * k });
};

// ------------------------------------------------------------------------------------------------------- overlays
/** the whip's smear (k 0..1 from whip().smear): soft pale horizontal streaks drifting the pan's way, never opaque.
 *  whipSmear(W.smear, 1) */
export const whipSmear = (k: number, dir: 1 | -1, seed = 3) => {
  if (k <= 0.01) return null;
  const bars: ReturnType<typeof h>[] = [];
  for (let i = 0; i < 16; i++) {
    const a = hash(i, seed), b = hash(i, seed + 1), y = ((i + 0.5) / 16) * 1920 + (a - 0.5) * 70, hgt = 20 + 70 * b, len = 600 + 800 * a;
    const x = dir > 0 ? -len * 0.4 + b * 1080 * (1 - k) : 1080 - len * 0.6 - b * 1080 * (1 - k);
    bars.push(h("div", { key: i, style: { position: "absolute", left: x, top: y - hgt / 2, width: len, height: hgt, borderRadius: hgt / 2, background: i % 3 === 2 ? "#d9c08a" : "#f3ead8", opacity: (0.18 + 0.22 * a) * k } }));
  }
  return h("div", { key: "whipSmear", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", pointerEvents: "none" } },
    h("div", { style: { position: "absolute", inset: 0, background: "#efe6d2", opacity: 0.22 * k * k } }), ...bars);
};
/** his palm over the lens (cover 0..1 from handCover().cover): a big warm shadowed palm closing in from the lower
 *  right, its rim lit; at 1 the whole frame is the palm's dark warm brown (never pure black).  palm(H.cover) */
export const palm = (cover: number) => {
  if (cover <= 0.001) return null;
  const k = clamp01(cover), r = lerp(260, 2400, k), cx = lerp(1180, 620, k), cy = lerp(2050, 1100, k);
  return h("div", { key: "palm", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", pointerEvents: "none" } },
    h("div", { style: { position: "absolute", left: cx - r, top: cy - r * 1.15, width: 2 * r, height: 2.3 * r, borderRadius: "50%",
      background: `radial-gradient(ellipse at 45% 45%, #2a1d19 0%, #33231d ${Math.round(40 + 25 * k)}%, #5a3c2e 88%, #8a5e46 100%)`, boxShadow: `0 0 ${Math.round(60 + 80 * (1 - k))}px ${Math.round(20 * (1 - k))}px rgba(42,29,25,0.7)` } }),
    k > 0.98 ? h("div", { style: { position: "absolute", inset: 0, background: "#2a1d19" } }) : null);
};

// ================================================================================================= HER MIC AND HANDS
// Everything below is in the CAMERA's frame first (metres: x right, y up, z forward from the lens), then put into the
// world: so the mic and her hands move with any camera move (whip, push-in, the walk bob) and stay where the frame
// rules want them. The numbers are tuned for fov 62 on 9:16 (they scale with the fov: screen positions are kept).
/** the frame size the screen numbers are in */
const FW = 1080, FH = 1920;
/** her body in the camera's frame: the shoulders (m from the lens) and her arm's reach from a shoulder to the fist */
export const BODY = { shoulderL: [-0.18, -0.25, -0.06] as [number, number, number], shoulderR: [0.18, -0.25, -0.06] as [number, number, number], reach: 0.64 };
/** where the mic sits on the 1080 x 1920 frame: REST (x, y of the head's centre, depth m), the ASIDE, the lowest the
 *  head's centre may go (its bottom edge stays above the subtitle band: MIC_MAX_Y = 1190 minus its radius), how far
 *  toward the aim's x it slides */
export const MIC_FRAME = { rest: [330, 1050, 0.56] as [number, number, number], aside: [530, 990, 0.4] as [number, number, number], band: 1190, minX: 230, maxX: 640, follow: 0.38 };
/** the camera's frame with its roll: lens p, forward, right, up; tanV / tanH = the half-angle tangents */
export type CamFrame = { p: THREE.Vector3; fwd: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3; tanV: number; tanH: number };
export const camFrame = (c: CamPose, aspect = FW / FH): CamFrame => {
  const A = camAxes(c), r = c.roll ?? 0, cr = Math.cos(r), sr = Math.sin(r);
  const right = A.right.clone().multiplyScalar(cr).addScaledVector(A.up, sr), up = A.up.clone().multiplyScalar(cr).addScaledVector(A.right, -sr);
  const tanV = Math.tan((c.fov * RAD) / 2);
  return { p: A.p, fwd: A.fwd, right, up, tanV, tanH: tanV * aspect };
};
/** a camera-space point (x right, y up, z forward) -> world */
export const camToWorld = (F: CamFrame, x: number, y: number, z: number) => F.p.clone().addScaledVector(F.right, x).addScaledVector(F.up, y).addScaledVector(F.fwd, z);
/** world -> camera space */
export const worldToCam = (F: CamFrame, w: V3Like) => { const d = v3(w).sub(F.p); return V(d.dot(F.right), d.dot(F.up), d.dot(F.fwd)); };
/** a screen point (px on 1080 x 1920) at `depth` m along the view -> camera space */
export const fromScreen = (F: CamFrame, px: number, py: number, depth: number) => V(((px / FW) * 2 - 1) * depth * F.tanH, (1 - (py / FH) * 2) * depth * F.tanV, depth);
/** a camera-space point -> the screen (px) and its depth */
export const camToScreen = (F: CamFrame, q: THREE.Vector3) => { const z = Math.max(1e-4, q.z); return { x: ((q.x / (z * F.tanH)) + 1) * 0.5 * FW, y: (1 - q.y / (z * F.tanV)) * 0.5 * FH, z: q.z }; };
/** world -> the screen (px) */
export const toScreen = (c: CamPose, w: V3Like) => { const F = camFrame(c); return camToScreen(F, worldToCam(F, w)); };
/** a world rotation from a hand's (or a prop's) local axes given as camera-space vectors y (its +y) and z (its +z) */
const quatFromYZ = (F: CamFrame, yc: THREE.Vector3, zc: THREE.Vector3) => {
  const y = V().addScaledVector(F.right, yc.x).addScaledVector(F.up, yc.y).addScaledVector(F.fwd, yc.z).normalize();
  let z = V().addScaledVector(F.right, zc.x).addScaledVector(F.up, zc.y).addScaledVector(F.fwd, zc.z);
  z.addScaledVector(y, -z.dot(y)); if (z.lengthSq() < 1e-8) z = V(0, 0, 1); z.normalize();
  const x = V().crossVectors(y, z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
};
/** a world rotation from a hand's local axes given as WORLD vectors */
const quatFromYZw = (yw: THREE.Vector3, zw: THREE.Vector3) => {
  const y = yw.clone().normalize(); let z = zw.clone(); z.addScaledVector(y, -z.dot(y)); if (z.lengthSq() < 1e-8) z = V(0, 0, 1); z.normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(y, z), y, z));
};
/** which way her forearms run from the wrist (camera space): the left one off to the lower left, the right one off to
 *  the lower right, both a little back toward her (the sleeves leave the frame at its lower corners) */
export const ARM = { L: [-0.8, -0.38, -0.46] as [number, number, number], R: [0.8, -0.38, -0.46] as [number, number, number] };
/** a hand placed so that its grip is at `grip` (camera space) round a bar along `bar` (camera space), its forearm off
 *  along ARM[side] (local -z that way, made perpendicular to the bar; if the bar runs along the arm, the arm drops) */
const handOn = (F: CamFrame, grip: THREE.Vector3, bar: THREE.Vector3, side: "L" | "R") => {
  const b = bar.clone().normalize(), arm = V(...ARM[side]).normalize();
  if (Math.abs(arm.dot(b)) > 0.92) arm.set(side === "L" ? -0.3 : 0.3, -0.9, -0.3).normalize();
  return { at: camToWorld(F, grip.x, grip.y, grip.z), rot: quatFromYZ(F, b, arm.multiplyScalar(-1)) };
};
/** a slight life on a held hand (never frozen): millimetres, slow */
const life = (f: number, k: number) => V(0.0025 * Math.sin(f * 0.07 + k), 0.002 * Math.sin(f * 0.053 + 1.3 + k), 0.0015 * Math.sin(f * 0.041 + 2.1 + k));
export type Put = { at: THREE.Vector3; rot: THREE.Quaternion };
export type HandPut = Put & { pose: "grip" | "open" };
export type MicO = {
  /** a world point it is held toward (the speaker's mouth; the door's knock point), or "lens" (an aside) */
  aim?: V3Like | "lens";
  /** 0..1: toward the aside pose (ease the swing round with it); aim "lens" = 1 */
  lens?: number;
  /** 0 = out of frame at the lower left .. 1 = in place (default 1): it enters on that diagonal */
  enter?: number;
  /** 0..1: the head pushed out to touch `aim` (rapK(f, ons) gives the strikes) */
  rap?: number;
  /** degrees: the head dipped toward something low (+ = down) */
  tilt?: number;
  /** the dof of an aside: blur-disc px at infinity (default 14) */
  blur?: number;
  /** a screen box (px on 1080 x 1920) the red head keeps out of, sliding right past its x1: the fact card's slot
   *  while a card shows (layout.ts SCREEN.card) */
  avoid?: { x0: number; y0: number; x1: number; y1: number };
};
export type MicPose = {
  mic: Put; hand: HandPut;
  /** the foam ball's centre (world) and on screen (px, its radius in px) */
  head: THREE.Vector3; headPx: { x: number; y: number; r: number };
  /** the asides: focus on the mic's head, he goes soft behind (Pose.post.dof); a light focus on the aim otherwise */
  dof?: { focus: number; amount: number };
  visible: boolean;
};
/** THE MIC for this camera on frame f (see the head of this file). Pure. */
export const micPose = (c: CamPose, f: number, o: MicO = {}): MicPose => {
  const F = camFrame(c), M = MIC_FRAME;
  const lensK = o.aim === "lens" ? 1 : clamp01(o.lens ?? 0);
  const aimC = o.aim !== undefined && o.aim !== "lens" ? worldToCam(F, o.aim) : null;
  // REST / AIM: the head on the frame; with an aim it slides toward the aim's x, its axis half toward the aim
  const aimPx = aimC && aimC.z > 0.05 ? camToScreen(F, aimC) : null;
  const hx = aimPx ? Math.max(M.minX, Math.min(M.maxX, lerp(M.rest[0], aimPx.x, M.follow))) : M.rest[0];
  const headA = fromScreen(F, hx, M.rest[1], M.rest[2]);
  const D0 = V(0.36, 0.55, 0.75).normalize();
  let DA = D0.clone();
  if (aimC) { const da = aimC.clone().sub(headA).normalize(); DA = D0.clone().lerp(da, 0.5).normalize(); }
  if (o.tilt) DA.applyAxisAngle(V(1, 0, 0), -o.tilt * RAD);
  // THE RAP: the head pushed out to the aim (its surface touching), as far as her arm reaches
  const rap = clamp01(o.rap ?? 0);
  if (aimC && rap > 0) {
    const da = aimC.clone().sub(headA).normalize(), touch = aimC.clone().addScaledVector(da, -MIC.r);
    const DR = da.clone().lerp(D0, 0.25).normalize();
    headA.lerp(touch, rap); DA.lerp(DR, rap).normalize();
  }
  // THE ASIDE: the head lower middle, near the lens, turned to face it (its axis back toward the lens and up)
  const headL = fromScreen(F, M.aside[0], M.aside[1], M.aside[2]);
  const DL = headL.clone().multiplyScalar(-1).normalize().add(V(-0.12, 0.42, 0)).normalize();
  const k = easeInOutCubic(lensK);
  const head = headA.clone().lerp(headL, k), D = DA.clone().lerp(DL, k).normalize();
  // enter from the lower left, and a slight life
  const e = clamp01(o.enter ?? 1), out = 1 - easeOutCubic(e);
  head.add(V(-0.3, -0.34, -0.06).multiplyScalar(out)).add(life(f, 0));
  // her arm reaches so far: keep the fist within reach of her left shoulder
  const sh = V(...BODY.shoulderL);
  let grip = head.clone().addScaledVector(D, -MIC.head);
  if (grip.distanceTo(sh) > BODY.reach) { const back = grip.clone().sub(sh).setLength(BODY.reach).add(sh).sub(grip); grip.add(back); head.add(back); }
  // never below the band: the head's bottom edge above y 1190 (once it is in; this wins over the reach)
  if (out < 0.01) {
    const s = camToScreen(F, head), rpx = (MIC.r / Math.max(0.05, head.z)) * FH / (2 * F.tanV);
    if (s.y + rpx > M.band - 4) { const q = fromScreen(F, s.x, M.band - 4 - rpx, head.z), dy = q.y - head.y; head.y += dy; grip.y += dy; }
  }
  // out of a box (the fact card): slide right past it, at the same depth
  if (o.avoid && out < 0.01) {
    const s = camToScreen(F, head), rpx = (MIC.r / Math.max(0.05, head.z)) * FH / (2 * F.tanV), A = o.avoid;
    if (s.x - rpx < A.x1 && s.x + rpx > A.x0 && s.y + rpx > A.y0 && s.y - rpx < A.y1) {
      const q = fromScreen(F, A.x1 + rpx + 8, s.y, head.z), dx = q.x - head.x; head.x += dx; grip.x += dx;
    }
  }
  const hp = handOn(F, grip, D, "L");
  const sp = camToScreen(F, head), r = (MIC.r / Math.max(0.05, head.z)) * FH / (2 * F.tanV);
  const dof = k > 0.5 ? { focus: head.length(), amount: (o.blur ?? 14) * smooth((k - 0.5) / 0.5) } : aimC ? { focus: aimC.length(), amount: 3 } : undefined;
  return {
    mic: { at: hp.at.clone(), rot: hp.rot.clone() }, hand: { ...hp, pose: "grip" },
    head: camToWorld(F, head.x, head.y, head.z), headPx: { x: sp.x, y: sp.y, r }, dof, visible: e > 0.001,
  };
};
/** THE MIC put into the World (props "mic" and "hand"); returns the pose (its dof for Pose.post) */
export const putMic = (w: World, c: CamPose, f: number, o: MicO = {}): MicPose => {
  const P = micPose(c, f, o);
  if (P.visible) { w.prop("mic").put(P.mic.at, { rot: P.mic.rot }); w.prop("hand").put(P.hand.at, { rot: P.hand.rot, pose: "grip" }); }
  return P;
};
/** THE RAPS: 0..1 for the mic's rap on frame f, a strike landing (1) on each frame of `ons` (in over 3 frames, back
 *  over 4).  micPose(cam, f, { aim: STAIRS.knock, rap: rapK(f, [k0, k0 + 7, k0 + 14]) }) */
export const rapK = (f: number, ons: number[], len = 3, back = 4) => {
  let k = 0;
  for (const on of ons) { const d = f - on; if (d >= -len && d <= 0) k = Math.max(k, easeInCubic((d + len) / len)); else if (d > 0 && d <= back) k = Math.max(k, 1 - easeOutCubic(d / back)); }
  return k;
};
/** HER FREE (RIGHT) HAND at a world grip point: pose "grip" round a bar along `bar` (world direction, default the
 *  camera's up), or "open" (the palm's middle there, the fingers along `bar`, the palm facing `palm`); the forearm runs
 *  back toward her right shoulder. Pure. */
export const freeHand = (c: CamPose, grip: V3Like, o: { bar?: V3Like; palm?: V3Like; pose?: "grip" | "open"; side?: "R" | "L" } = {}): HandPut => {
  const F = camFrame(c), g = worldToCam(F, grip), sh = o.side === "L" ? BODY.shoulderL : BODY.shoulderR;
  const toSh = V(...sh).sub(g).normalize();
  if ((o.pose ?? "grip") === "open") {
    // open: local +z = the fingers (along bar, default away from the shoulder), local -y = the palm
    const fz = o.bar ? worldToCam(F, v3(o.bar).add(F.p)).normalize() : toSh.clone().multiplyScalar(-1);
    const pal = o.palm ? worldToCam(F, v3(o.palm).add(F.p)).normalize() : V(0, -1, 0);
    // y = -palm, z = fingers (made perpendicular)
    return { at: v3(grip), rot: quatFromYZ(F, pal.multiplyScalar(-1), fz), pose: "open" };
  }
  const bar = o.bar ? worldToCam(F, v3(o.bar).add(F.p)).normalize() : V(0, 1, 0);
  const H = handOn(F, g, bar, o.side ?? "R");
  return { at: H.at, rot: H.rot, pose: "grip" };
};
/** THE CHAIR DRAG: her right hand on the chair's top rail (the chair put at `at` with yaw `yaw`); the shot moves the
 *  chair (w.prop("chair").put(at, { rot: yaw })) and puts the hand: w.prop("handR").put(H.at, { rot: H.rot, pose }) */
export const chairDrag = (c: CamPose, at: V3Like, yaw = 0): HandPut => {
  const p = v3(at), cy = Math.cos(yaw), sy = Math.sin(yaw), r = CHAIR.rail, along = V(cy, 0, -sy);
  const rail = V(p.x + r[0] * cy + r[2] * sy, p.y + r[1] + 0.03, p.z - r[0] * sy + r[2] * cy);
  // her hand takes the rail where it is nearest the frame's right-middle (x 700) among its middle and its two ends,
  // of those her right arm reaches (else the nearest one): never stretched across the chair, never at the frame's edge
  const F = camFrame(c), half = CHAIR.w / 2 - 0.08, sh = V(...BODY.shoulderR);
  const cand = [0, 1, -1].map((k) => { const w = rail.clone().addScaledVector(along, k * half), q = worldToCam(F, w); return { w, d: q.distanceTo(sh), x: camToScreen(F, q).x }; });
  const ok = cand.filter((q) => q.d <= BODY.reach + 0.06);
  const pick = ok.length ? ok.reduce((a, b) => (Math.abs(b.x - 700) < Math.abs(a.x - 700) ? b : a)) : cand.reduce((a, b) => (b.d < a.d ? b : a));
  return freeHand(c, pick.w, { bar: along });
};
/** the front of a figure's nose (world), for wipe(): the head's middle, out along the face (faceYaw) by the head's
 *  radius, a little down. `scale` = the Person's scale. Call after w.update(). */
export const noseOf = (r: { headWorld(): THREE.Vector3; faceYaw: number }, scale = 1) => {
  const y = r.faceYaw;
  return r.headWorld().add(V(Math.sin(y), 0, Math.cos(y)).multiplyScalar(0.25 * scale)).add(V(0, -0.045 * scale, 0));
};
/** THE WIPE (D): from `on` her right hand comes in from the lower right with the handkerchief (8 frames), wipes across
 *  his nose (world point `nose`) twice (7 frames each: toward screen left, then back), and goes out (8 frames).
 *  strokes = the two frames on which the cloth crosses the middle of his nose (swap his ink figure there).
 *  The hand and the cloth come with a `scale` (WIPE.hand, WIPE.cloth: his toon head is half a metre across, and a
 *  true-size hand at his face reads as a doll's): put them with it.  Returns null outside its frames. */
export const WIPE = { inF: 8, stroke: 7, outF: 8, hand: 1.35, cloth: 1.5 } as const;
export const wipe = (c: CamPose, f: number, nose: V3Like, on: number) => {
  const W = WIPE, end = on + W.inF + 2 * W.stroke + W.outF;
  if (f < on || f > end) return null;
  const F = camFrame(c), n = worldToCam(F, nose), dist = n.length(), toCam = n.clone().normalize().multiplyScalar(-1);
  const side = V(1, 0, 0), half = 0.045;                                           // half a stroke, m, across his face
  const touch = (s: number) => n.clone().addScaledVector(toCam, 0.04).addScaledVector(side, s * half);   // 4 cm out: the 1.5x wad touches his nose, never sinks into it
  const outP = fromScreen(F, 1180, 1900, Math.min(0.5, dist * 0.45));
  let q: THREE.Vector3, d = f - on;
  if (d < W.inF) q = outP.clone().lerp(touch(1), easeOutCubic(d / W.inF));
  else if ((d -= W.inF) < W.stroke) q = touch(lerp(1, -1, easeInOutCubic(d / W.stroke)));
  else if ((d -= W.stroke) < W.stroke) q = touch(lerp(-1, 1, easeInOutCubic(d / W.stroke)));
  else { d -= W.stroke; q = touch(1).lerp(outP, easeInCubic(d / W.outF)); }
  // the cloth's wad is held at the knuckles, the hand behind it (toward her)
  const H = handOn(F, q.clone().addScaledVector(toCam, 0.045).add(V(0.012, 0.012, 0)), V(0.25, 1, -0.2).normalize(), "R");
  const cloth: Put & { scale: number } = { at: camToWorld(F, q.x, q.y + 0.02, q.z), rot: quatFromYZ(F, V(0, 1, 0), toCam), scale: WIPE.cloth };
  const s1 = on + W.inF + Math.round(W.stroke / 2), s2 = s1 + W.stroke;
  return { hand: { ...H, pose: "grip" as const, scale: WIPE.hand }, cloth, strokes: [s1, s2] as [number, number], visible: true };
};
/** THE BOARD HELD UP (G): k 0..1 = it comes up into frame from below; the board faces the lens a little tilted back
 *  (tilt deg), its middle at (px, py) on the frame at `depth` m (default 540, 820, 0.72: it fills about 85 % of the
 *  width, the drawing upright and readable); her right hand grips its right edge, the left (mic) hand its left edge
 *  (the mic out of shot). Returns the puts for "board", "handR", "hand" (pose grip). */
export const boardHold = (c: CamPose, f: number, o: { k?: number; px?: number; py?: number; depth?: number; tilt?: number } = {}) => {
  const F = camFrame(c), k = easeOutCubic(clamp01(o.k ?? 1)), depth = o.depth ?? 0.72;
  const mid = fromScreen(F, o.px ?? 540, (o.py ?? 820) + (1 - k) * 1300, depth).add(life(f, 2));
  const tilt = (o.tilt ?? 6) * RAD, roll = 0.035 * Math.sin(f * 0.05) + 0.05 * (1 - k);
  // the board's axes in camera space (x right, y up, z forward: a LEFT-handed frame, so +x = z cross y): its face (+z)
  // toward the lens, its +y up the frame (the drawing upright), its +x to the right
  const zb = V(0, Math.sin(tilt), -Math.cos(tilt)).normalize();
  const up0 = V(-Math.sin(roll), Math.cos(roll), 0), yb = up0.addScaledVector(zb, -up0.dot(zb)).normalize();
  const xb = V().crossVectors(zb, yb).normalize();
  const rot = quatFromYZ(F, yb, zb);
  const edge = (s: number) => mid.clone().addScaledVector(xb, s * (BOARD.w / 2 + 0.004)).addScaledVector(yb, -0.04);
  const R = handOn(F, edge(1), yb, "R"), L = handOn(F, edge(-1), yb, "L");
  return { board: { at: camToWorld(F, mid.x, mid.y, mid.z), rot } as Put, hand: { ...R, pose: "grip" as const }, handL: { ...L, pose: "grip" as const } };
};
/** SHE CLAPS ALONE (D): the left hand holds the mic low in the middle; the open right hand strikes the back of the left
 *  hand on each frame of `ons` (closing over 4 frames, apart again over 4). Returns { mic, hand (left), handR }. */
export const clapHands = (c: CamPose, f: number, ons: number[]) => {
  const F = camFrame(c);
  let g = 1;
  for (const on of ons) { const d = f - on; g = Math.min(g, d < -4 ? 1 : d <= 0 ? 1 - easeInCubic((d + 4) / 4) : d <= 4 ? easeOutCubic(d / 4) : 1); }
  // the left fist with the mic: low middle-left, the mic upright-ish
  const gripL = fromScreen(F, 400, 1500, 0.42).add(life(f, 3)), D = V(0.15, 0.85, 0.5).normalize();
  const L = handOn(F, gripL, D, "L");
  // the right palm: comes at the back of the left fist from the right
  const hit = gripL.clone().add(V(0.05, 0.01, -0.01)), away = hit.clone().add(V(0.12, 0.03, 0.02));
  const pR = hit.clone().lerp(away, g);
  const fingers = V(-0.3, 0.75, 0.6).normalize(), palm = V(-1, 0, 0);
  const R = { at: camToWorld(F, pR.x, pR.y, pR.z), rot: quatFromYZ(F, palm.clone().multiplyScalar(-1), fingers), pose: "open" as const };
  return { mic: { at: L.at.clone(), rot: L.rot.clone() } as Put, hand: { ...L, pose: "grip" as const }, handR: R };
};

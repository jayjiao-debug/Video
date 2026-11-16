// HER EYES: the vlog camera of the Qin film (PLAN 4), generic so a later "a day with ..." film can reuse it. WP3.
// A camera is a story.ts CamPose (vertical fov in degrees, roll in radians). Everything here is a PURE function of its
// arguments: the frame in, a pose out; no state between frames; all noise from hash() (never Math.random / Date).
//
//   povCam(f, keys, o)    THE CAMERA: eased keyframes (position, look-at, fov) + the handheld layer (breathing, the
//                         walking bob at 2.2 steps/s, the tremble), its amounts by mood: still | calm | excited | scared
//   keyCam / handheld     the two halves of povCam, for a camera that comes from elsewhere (follow, a rig point)
//   the moves (a CamPose in, a CamPose out, so they stack: lower(dip(povCam(...)))):
//     punchIn    fov x 0.8 in 4-6 frames, ease-out (a reaction)
//     whip       a whip pan out of one view and into another, the cut hidden in the blur ({ cam, post, smear })
//     follow     behind / beside a walking figure, lagging a little (smoothed)
//     dip        sinks 0.6 m and pitches down, a strain shake while down (she lifts something heavy)
//     duck       drops to 1.0 m behind a foreground object (hiding), the subject kept in frame
//     aside      swings to a near wall, holds (her whisper to the viewer), swings back
//     creep      a slow steady push along the view (pair it with mood "calm", amp 0.3: sway almost 0)
//     lean       he steps into the lens: leanDist / leanStand say where he must stand for his head to fill 60 % of
//                the width; lean() makes the camera give way a little and keeps his eyes in the upper third
//     handCover  his palm over the lens: { cam, cover } (cover 0..1) + palm(cover) the overlay (a dark warm palm, a cut)
//     lower      she lets the camera droop to 0.6 m, the horizon tilting 8 deg (shock)
//   overlays     whipSmear(k, dir), palm(cover): React nodes for Pose.overlays (1080 x 1920)
// Rules (PLAN 4): never inside geometry (the handheld layer moves the lens 3 cm at most: keep 0.15 m from walls); his
// eyes in the upper third; faces out of the caption band (y 1190-1498).
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, hash, h, type CamPose, type V3Like } from "./story";
import { EYE, FOV } from "./layout/base";

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
/** the handheld options: mood = one mood or step keys [frame, mood] (each change blends over 8 frames); walk = 0..1
 *  (how much she is walking) or eased keys [frame, amount]; seed = another handheld (default 1); amp = a multiplier
 *  on all of it (default 1); fov = the default fov of the keys */
export type HandO = { mood?: Mood | [number, Mood][]; walk?: number | [number, number][]; seed?: number; amp?: number; fov?: number };
/** her steps: 2.2 a second */
export const STEP_HZ = 2.2;
const moodAt = (f: number, m: HandO["mood"]) => {
  const keys: [number, Mood][] = typeof m === "string" || m === undefined ? [[-1e9, m ?? "calm"]] : m;
  let cur = MOODS[keys[0][1]];
  for (let i = 1; i < keys.length; i++) {
    const [k, md] = keys[i]; if (f < k) break;
    const t = smooth((f - k) / 8), nx = MOODS[md], o = cur;
    cur = { hz: lerp(o.hz, nx.hz, t), rise: lerp(o.rise, nx.rise, t), sway: lerp(o.sway, nx.sway, t), yaw: lerp(o.yaw, nx.yaw, t), pitch: lerp(o.pitch, nx.pitch, t), roll: lerp(o.roll, nx.roll, t), tremble: lerp(o.tremble, nx.tremble, t) };
  }
  return cur;
};
const walkAt = (f: number, w: HandO["walk"]) => {
  if (w === undefined) return 0;
  if (typeof w === "number") return clamp01(w);
  let i = 0; while (i + 1 < w.length && w[i + 1][0] <= f) i++;
  const a = w[i], b = w[Math.min(i + 1, w.length - 1)];
  if (b === a || f <= a[0]) return clamp01(a[1]);
  return clamp01(lerp(a[1], b[1], easeInOutCubic(clamp01((f - a[0]) / Math.max(1, b[0] - a[0])))));
};
/** THE HANDHELD LAYER on any camera: breathing sway (a slow rise and fall with a little drift), the walking bob (one dip
 *  per step, a side-to-side sway and roll once per two steps), the tremble (8-12 Hz, small).
 *  handheld(cam, f, { mood: "scared", walk: [[0, 1], [40, 0]] }) */
export const handheld = (c: CamPose, f: number, o: HandO = {}): CamPose => {
  const M = moodAt(f, o.mood), amp = o.amp ?? 1, s = (o.seed ?? 1) * 13.7, t = f / FPS, wk = walkAt(f, o.walk);
  if (amp === 0) return c;
  // breathing: a sine at the mood's rate with a slow wander in its phase and size
  const ph = 2 * Math.PI * M.hz * t + 0.8 * noise(t * 0.15, s + 1), br = Math.sin(ph) * (0.8 + 0.2 * noise(t * 0.3, s + 2));
  const dr = (k: number) => noise(t * 0.45, s + k) * 0.7 + noise(t * 1.1, s + k + 50) * 0.3;          // the drift of the hands
  // the walk: the lens dips at each footfall (|sin| at the step rate), sways and rolls at half of it
  const sp = Math.PI * STEP_HZ * t, bob = (Math.abs(Math.sin(sp)) - 0.64) * 0.026 * wk, side = Math.sin(sp) * wk;
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
export const follow = (f: number, who: (f: number) => THREE.Vector3, o: { back?: number; side?: number; y?: number; ahead?: number; lookY?: number; win?: number; yaw?: number; fov?: number } = {}): CamPose => {
  const win = Math.max(1, Math.round(o.win ?? 10)), p = V(); let wsum = 0;
  for (let i = 0; i < win; i++) { const w = win - i; p.addScaledVector(who(f - i), w); wsum += w; }
  p.divideScalar(wsum);
  const vel = who(f).sub(who(f - win)), dir = vel.lengthSq() > 1e-4 ? V(vel.x, 0, vel.z).normalize() : V(Math.sin(o.yaw ?? 0), 0, Math.cos(o.yaw ?? 0));
  const right = V(-dir.z, 0, dir.x);                  // the walker's right, looking along dir
  const pos = p.clone().addScaledVector(dir, -(o.back ?? 1.8)).addScaledVector(right, o.side ?? 0.3); pos.y = p.y + (o.y ?? EYE);
  const look = p.clone().addScaledVector(dir, o.ahead ?? 2.5); look.y = p.y + (o.lookY ?? 1.3);
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

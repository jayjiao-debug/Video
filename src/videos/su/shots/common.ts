// The Su film's shared ACTION LIBRARY: Qin's shots/common.ts (an adapted copy of Wanbi's; WP1), SHARED from then on:
// segment builders ADD verbs (additive only: never change what another segment uses; say what you added in
// requests.md). Everything here is a pure function of its arguments: nothing keeps state between frames. Her camera
// (povCam and its moves: punchIn, whip, follow, dip, duck, aside, creep, lean, lower, nudge) is cam.ts (WP3); her hand
// and red mic are her.ts (WP3); the HUD's overlay helpers (InkWipe, InkDissolve) are hud/ (WP1).
//
//   basics     V, v3, yawTo, wrapA, lerpA, lid (blinks), speak (lip-sync of a Quote), says (several lines of one speaker),
//              accent (head accents by frame), heads
//   keys       at (step keys), ky / kv (eased keys), path (a point through keys), swaps (blink over expression changes)
//   places     rel (a point in a figure's own frame), hang, halberdHand, staged (a point in screen terms), headPx (a
//              head on screen), kick (a 3-frame camera jolt), frag (several overlays as one node)
//   moving     walkAlong / walkTime (a walker on a floor path, feet planted), hopArc (a jump)
//   sitting    seated (on a seat: layout.ts TaSeat, with the held partial rise), lap, kneel (a sink), bow (a head
//              bow), salute (the 拱手 bow: the only forward lean the rig has)
//   crowd      stagger, alive
//   verbs      headM (metres -> head radii), headPop (the 3-frame pop), swapTo (one person's two figures, swapped on a
//              frame), clap, yawCam / whip (a whip pan), shake (the camera's decaying shake on a hit)
//   staging    eye (a camera at her eye height), standing (an idle, alive figure), standIn (THE STAND-IN STAGING of
//              the WP1 segment stubs: the frame's place, her eyes, SU standing on his mark in view)
//
// Conventions (group/kit/rig3d): metres, floor y 0, facing 0 = toward +z (the camera side), PI/2 = toward +x; the
// person's LEFT is +x when facing 0. arm 0 = the person's right hand (screen left when they face the camera), 1 = left.
// Frames are absolute film frames; a shot takes its time from the f it is given, never from w.t.
// FACES NEVER TURN TO PROFILE (FACE_MAX 12 deg): turning away = a body turn / back view (turn: 1), the gaze, a tilt.
import * as THREE from "three";
import React from "react";
import { rigWalk, rigSpeak, rigHeadAccent, rigHeadAdd, type Rig, type RigState, type RigHead, type RigPose } from "../../group/kit/rig3d";
import { lidAt } from "../../group/kit/cast";
import { PEOPLE, SU, type Person } from "../people";
import { STAND, EYE, FOV, type TaSeat } from "../layout";
import type { World } from "../world";
import { placeAt } from "../beats";
import { FPS, clamp01, lerp, lin, smooth, hash, easeInCubic, easeOutCubic, easeInOutCubic, camMix, h, quote, type Quote, type V3Like, type CamPose, type Vec3, type Pose, type Place, type Speaker } from "../story";

export { rigWalk, rigSpeak, rigHeadAccent, rigHeadAdd };
export type { Rig, RigState, RigHead, RigPose };
type Extra = Partial<RigState>;

// ------------------------------------------------------------------------------------------------------------ basics
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const v3 = (p: V3Like | readonly number[]) => (p instanceof THREE.Vector3 ? p.clone() : V(p[0], p[1], p[2]));
const arr = (p: V3Like): Vec3 => (Array.isArray(p) ? p : [p.x, p.y, p.z]);
/** the facing of someone at `from` who looks toward `to` */
export const yawTo = (from: V3Like | readonly number[], to: V3Like | readonly number[]) => { const a = v3(from), b = v3(to); return Math.atan2(b.x - a.x, b.z - a.z); };
/** an angle brought into -PI .. PI */
export const wrapA = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
/** angle a -> b the short way round */
export const lerpA = (a: number, b: number, t: number) => a + wrapA(b - a) * t;
/** eyelid for `blink:` (0 open, 0.5, 1 shut): 4-frame blinks every 2.2-4.4 s, different for every id; `swaps` =
 *  times (s) of expression changes to hide under a blink (see swaps()) */
export const lid = (t: number, id: number, sw: number[] = []) => lidAt(t, id, sw);
/** A character's own quoted words, lip-synced: { mouth, head, blink } to spread into set({...}). f = the film frame,
 *  id = any number per speaker (it picks the mouth shapes and the lean), stress = which syllables hit hardest
 *  (0-based). Outside the quote (+- a few frames) it returns {}.   ...speak(quote("di", "A03"), f, 1) */
export const speak = (q: Quote, f: number, id = 0, stress?: number[]): { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } => {
  if (f < q.from - 6 || f > q.to + 10) return {};
  const sp = rigSpeak(f / FPS, { from: q.start, to: q.end, syl: q.syl, stress }, id);
  const out: { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } = {};
  if (sp.mouth) out.mouth = sp.mouth;
  if (sp.head) out.head = sp.head;
  if (sp.blink !== undefined) out.blink = sp.blink;
  return out;
};
/** THE LIP-SYNC OF SEVERAL LINES of one speaker (WP1): speak(quote(who, id), f, n) of each line id, merged (outside
 *  every line it is {}); quote() throws when a line is not that speaker's.  ...says("su", ["A02", "A04", "A05"], f, 1) */
export const says = (who: Speaker, ids: string[], f: number, id = 0): ReturnType<typeof speak> => Object.assign({}, ...ids.map((l) => speak(quote(who, l), f, id)));
/** a head accent that starts on film frame `on`: accent("jolt", f, BEAT.A.turn). undefined before it and once it is
 *  over. kinds: pop, squash, nod, jolt, shake, laugh, lean (o.dur seconds for laugh / lean; o.dir 1 = screen right; o.amp) */
export const accent = (kind: Parameters<typeof rigHeadAccent>[0], f: number, on: number, o: Parameters<typeof rigHeadAccent>[2] = {}) => (f < on ? undefined : rigHeadAccent(kind, (f - on) / FPS, o));
/** several accents / heads added up (undefined ones are skipped) */
export const heads = (...hs: (RigHead | undefined)[]): RigHead | undefined => { const k = hs.filter(Boolean) as RigHead[]; return k.length ? rigHeadAdd(...k) : undefined; };

// ------------------------------------------------------------------------------------------------------------ keys
/** STEP keys: the value of the last key at or before f. For expr, gaze, anything that snaps.
 *    expr: at(f, [[0, "stern"], [BEAT.A.blush + 1, "smile_closed"]]) */
export const at = <X,>(f: number, keys: [number, X][]): X => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
/** EASED keys [frame, value]: a smooth ease inside each interval, no overshoot; holds before the first and after the last */
export const ky = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) if (f <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], smooth((f - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  return keys[keys.length - 1][1];
};
/** eased keys of a Vec3 */
export const kv = (f: number, keys: [number, Vec3][]): Vec3 => [0, 1, 2].map((k) => ky(f, keys.map(([a, v]) => [a, v[k]] as [number, number]))) as Vec3;
/** a point's way through [frame, point, ease?] keys (a hand that travels): it stands on the first point before the
 *  first key and on the last one after the last; `ease` shapes the leg that ARRIVES at its key (default smooth) */
export type PathKey = [number, THREE.Vector3, ((x: number) => number)?];
export const path = (f: number, keys: PathKey[]) => {
  if (f <= keys[0][0]) return keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return keys[i - 1][1].clone().lerp(keys[i][1], (keys[i][2] ?? smooth)(lin(f, keys[i - 1][0], keys[i][0])));
  return keys[keys.length - 1][1].clone();
};
/** the frames of the changes of a step-key list, in seconds, for lid(t, id, swaps(keys)): an expression change hides
 *  under a blink (this is Hongmen's blink helper; an ACTOR swap is two actors, one visible: WP7's swapTo) */
export const swaps = (keys: [number, unknown][]) => keys.slice(1).map(([k]) => k / FPS);

// ------------------------------------------------------------------------------------------------------------ places
/** a point given in a standing figure's own frame: x = to its LEFT, y up from its feet, z = forward */
export const rel = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => p.clone().add(V(Math.cos(facing) * x + Math.sin(facing) * z, y, -Math.sin(facing) * x + Math.cos(facing) * z));
/** where an idle figure's hand hangs (measured on Hongmen's cast), to start a pinned gesture from */
export const hang = (p: THREE.Vector3, facing: number, arm: 0 | 1) => rel(p, facing, arm ? 0.172 : -0.172, 0.58, 0.035);
/** A GUARD'S HALBERD HAND (kit acc/held.ts halberd(); people.ts: QIN_GUARD holds it in hand 1, QIN_GUARD_B in hand 0):
 *  ALWAYS pin it with this, never leave it hanging: with a hanging hand the shaft went 1.6-2.0 cm into the armour
 *  skirt (Hongmen, measured). The hand moves out: 0.23 m out, `y` up, 4 cm forward. Standing: y 0.6-0.64, out
 *  0.225-0.23; running: y 0.66, out 0.25. Returns the hand's target for that hand's slot. */
export const halberdHand = (p: THREE.Vector3, facing: number, arm: 0 | 1, y = 0.6, out = 0.23) => rel(p, facing, arm ? out : -out, y, 0.04);
/** a point staged for the camera (after w.setCamera): `right` m to screen right of the floor point `p`, `up` above
 *  the floor, `fwd` toward the camera. For claps, shrugs, a hand beside a head. */
export const staged = (w: World, p: THREE.Vector3, right: number, up: number, fwd: number) => {
  const toCam = V(w.camera.position.x - p.x, 0, w.camera.position.z - p.z).normalize(), r = V(toCam.z, 0, -toCam.x);
  return p.clone().addScaledVector(r, right).addScaledVector(toCam, fwd).add(V(0, up, 0));
};
/** a head on screen (after w.update): its centre in px and r = the px length of 0.24 m (the head's radius) at its
 *  depth. The anchor of every name tag, mark and icon. */
export const headPx = (w: World, r: Rig) => { const c = r.headWorld(), p = w.project(c), q = w.project(c.clone().add(V(0, 0.24, 0))); return { x: p.x, y: p.y, r: Math.abs(p.y - q.y) }; };
/** a camera kick on an impact: 3 frames from `on`, straight down and back ([1, -0.55, 0.2] x amp metres), never a roll */
export const kick = (c: CamPose, f: number, on: number, amp = 0.045): CamPose => {
  const k = [1, -0.55, 0.2][f - on];
  if (k === undefined) return c;
  const p = arr(c.pos), l = arr(c.look);
  return { ...c, pos: [p[0], p[1] - amp * k, p[2]], look: [l[0], l[1] - amp * k, l[2]] };
};
/** several overlay nodes as one (segment files are .ts: no JSX) */
export const frag = (...kids: React.ReactNode[]) => h(React.Fragment, null, ...kids);

// ------------------------------------------------------------------------------------------------------------ moving
export type Leg = {
  /** where the walker is (floor point; y from the path) */ at: THREE.Vector3;
  /** which way it faces */ facing: number;
  /** the pose: walk while moving, idle before and after */ pose: RigPose;
  moving: boolean; arrived: boolean;
  /** metres walked, metres left */ d: number; left: number;
};
/** A walker (speed about 1.3) or a runner (2.6 - 3.6) on a path of floor points, t seconds after setting off. Feet
 *  stay planted (rigWalk). Before t = 0 it stands at the first point, after the last point it stands there (idle) and
 *  turns to o.endFacing within 5 frames. Corners are rounded over 0.25 m. o.startFacing = the facing while waiting. */
export const walkAlong = (pts: (V3Like | readonly number[])[], speed: number, t: number, o: { endFacing?: number; startFacing?: number; bounce?: number } = {}): Leg => {
  const P = pts.map(v3), seg: number[] = [], yaw: number[] = [];
  let Lt = 0;
  for (let i = 0; i + 1 < P.length; i++) { const d = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z); seg.push(d); Lt += d; yaw.push(Math.atan2(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z)); }
  const first = yaw[0] ?? 0, lastYaw = yaw[yaw.length - 1] ?? 0;
  if (t <= 0 || Lt === 0) return { at: P[0].clone(), facing: o.startFacing ?? first, pose: { kind: "idle", t }, moving: false, arrived: false, d: 0, left: Lt };
  const d = Math.min(Lt, speed * t);
  if (d >= Lt) {
    const ta = t - Lt / speed, end = o.endFacing ?? lastYaw;
    return { at: P[P.length - 1].clone(), facing: lerpA(lastYaw, end, smooth(ta / (5 / FPS))), pose: { kind: "idle", t: ta }, moving: false, arrived: true, d: Lt, left: 0 };
  }
  let acc = 0, i = 0;
  while (i < seg.length - 1 && acc + seg[i] < d) { acc += seg[i]; i++; }
  const u = seg[i] > 0 ? (d - acc) / seg[i] : 0, p = P[i].clone().lerp(P[i + 1], u);
  let facing = yaw[i];
  const R = 0.25;
  if (i > 0 && d - acc < R) facing = lerpA(yaw[i - 1], yaw[i], 0.5 + 0.5 * ((d - acc) / R));
  else if (i < seg.length - 1 && acc + seg[i] - d < R) facing = lerpA(yaw[i], yaw[i + 1], 0.5 - 0.5 * ((acc + seg[i] - d) / R));
  return { at: p, facing, pose: rigWalk(d, speed, o.bounce ?? 1), moving: true, arrived: false, d, left: Lt - d };
};
/** how long walkAlong needs for this path at this speed (s) */
export const walkTime = (pts: (V3Like | readonly number[])[], speed: number) => { const P = pts.map(v3); let Lt = 0; for (let i = 0; i + 1 < P.length; i++) Lt += Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z); return Lt / speed; };
/** a jump from a to b (u 0..1): the point on the arc, `hgt` above the straight line at the top */
export const hopArc = (a: V3Like | readonly number[], b: V3Like | readonly number[], u: number, hgt = 0.22) => { const k = clamp01(u), p = v3(a).lerp(v3(b), k); p.y += hgt * 4 * k * (1 - k); return p; };

// ----------------------------------------------------------------------------------------------------------- sitting
/** A figure on a 榻 (layout.ts TaSeat; a seat the segment builds from its marks): spread over the state.
 *      r.set({ ...seated(seat, t), expr, visible: true })
 *  The hands rest on the lap by themselves. NO SEATED LEAN (Wanbi's BIBLE 5): sitting forward = o.back -0.10; lounging =
 *  o.facing +0.35 with o.back +0.06 (and a hand pinned on HALL.armrestTop).
 *  rise 0..1 = RISING from the seat: the seat's top goes from the cushion up to standing hip height (the seat's floor
 *  + the figure's hip height x its scale); a HELD PARTIAL RISE ("leaning out", the hook and 10a) is rise 0.45 kept
 *  (proven by rig.qa in WP1b: /home/user/wanbi_work/wp1b). Give the figure's own hipY (r.dim.hipY, unscaled) and its
 *  Person.scale (the King of Qin 1.08). At rise 1 switch to a standing pose. */
export const seated = (s: TaSeat, t: number, o: { rise?: number; hipY?: number; scale?: number; back?: number; facing?: number } = {}): Extra => {
  const k = clamp01(o.rise ?? 0), top = s.top.clone();
  if (k > 0) top.y = lerp(s.top.y, s.floor + ((o.hipY ?? 0.62) - 0.028) * (o.scale ?? 1), k);
  return { at: V(s.top.x, s.floor, s.top.z), facing: o.facing ?? s.facing, pose: { kind: "sit", t }, seat: { top, floor: s.floor, back: o.back ?? s.back } };
};
/** HANDS ON THE LAP for a sitter (spread over the state, after seated()): the rig's own lap rest is 2-3.4 cm inside the
 *  wide robes of the two kings (clearance "self" hand x robe), so the block-out pins them 4 cm forward and 4 cm up,
 *  on the robe (King of Qin lap(seat, 0.11, 0.26, 0.20), King of Zhao lap(seat, 0.096, 0.25, 0.195): clearance 0).
 *  Measured rests from the seat's top in the sitter's frame (x left, y up, z forward): the King of Qin (+-0.11, 0.22,
 *  0.155), the King of Zhao (+-0.096, 0.215, 0.153). dx = the half-spread of the hands. */
export const lap = (s: TaSeat, dx: number, y: number, z: number, facing = s.facing): Extra =>
  ({ hands: [rel(s.top, facing, -dx, y, z), rel(s.top, facing, dx, y, z)] });
/** KNEELING, the films' way (the rig cannot kneel): the figure sinks straight down by k x KNEEL_DROP so the shins
 *  disappear, the head bows. k 0 = standing .. 1 = down. Spread the result over your state (it replaces `at`):
 *      r.set({ at, facing, pose: { kind: "idle", t }, ...kneel(k, at), visible: true })
 *  Reads as kneeling in medium and wide shots; never show a kneeler's feet in close-up. */
export const KNEEL_DROP = 0.38;
export const kneel = (k: number, p: THREE.Vector3, bowDeg = 30): Extra => {
  const e = clamp01(k);
  return { at: p.clone().add(V(0, -KNEEL_DROP * e, 0)), lookDown: bowDeg * e, head: e > 0 ? { dy: -0.2 * e } : undefined };
};
/** a standing bow of the HEAD only: spread over the state. k 0..1 */
export const bow = (k: number, deg = 26): Extra => ({ lookDown: deg * clamp01(k), head: { dy: -0.12 * clamp01(k) } });
/** THE 拱手 BOW from the waist (Hongmen 07 finding 4): the only forward lean the rig has: the "haul" pose run backwards
 *  with both hands pinned together in front of the chest, about 19 degrees, feet staggered. p = the figure's floor
 *  point, facing = its facing. Spread over the state (it sets pose, hands, lookDown, head):
 *      r.set({ at: p, facing, ...salute(k, p, facing), visible: true })       k 0 = upright .. 1 = bowed
 *  Seated it reads as "sit": a seated bow = hands pinned together at the chest + lookDown 18. Hold it >= 12 frames. */
export const salute = (k: number, p: THREE.Vector3, facing: number, t = 0): Extra => {
  const e = clamp01(k);
  if (e <= 0) return { pose: { kind: "idle", t } };
  return { pose: { kind: "haul", t: 0, phase: 0, amount: -e }, hands: [rel(p, facing, -0.05, 0.8, 0.36), rel(p, facing, 0.05, 0.8, 0.36)], lookDown: 22 * e, head: { dy: -0.08 * e } };
};

// ------------------------------------------------------------------------------------------------------------- crowd
/** a per-figure delay in frames so a group does not move as one block: spread 0 .. `max`, fixed per id */
export const stagger = (id: number, max = 6, k = 0) => Math.floor(hash(id, 17 + k) * (max + 1));
/** an idle figure's life: a little sway of the gaze and a blink, different per id. Spread over the state. */
export const alive = (t: number, id: number): Extra => ({ blink: lid(t, id), gaze: [0, 0, 0.5, 0, -0.5, 0][Math.floor(t * 0.9 + hash(id, 3) * 6) % 6] });

// ------------------------------------------------------------------------------------------------- the film's verbs
/** metres of head movement (the storyboard's "head.dy -0.02") as the rig's head units (RigHead dx / dy are in head
 *  radii, a head is 0.24 m in radius): headM(-0.02) = -0.083 */
export const headM = (m: number) => m / 0.24;
/** A HEAD POP on a word (Wanbi's BIBLE 5: a swap or a hard word lands with it): scale 1.12 / 1.06 / 1.02 on the three frames
 *  from `on`, undefined otherwise. Add it with heads(...). */
export const headPop = (f: number, on: number, k: [number, number, number] = [1.12, 1.06, 1.02]): RigHead | undefined => {
  const i = f - on;
  return i >= 0 && i < 3 ? { scale: k[i] } : undefined;
};
/** AN ACTOR SWAP (EMPEROR <-> EMPEROR_BLUSH1 <-> EMPEROR_BLUSH2, EMPEROR -> EMPEROR_HOOD): two figures with the same Look,
 *  one shown. Returns the figure that plays on frame f (`to` from frame `on`, `from` before it): set it as usual,
 *  beginFrame keeps the other hidden. Land it on a word with headPop(f, on) or a puff. */
export const swapTo = (w: World, f: number, on: number, from: Person, to: Person): Rig => w.actor(f >= on ? to : from);
/** A CLAP (召, 12a): the two hands meet in front of the chest on each frame of `ons` (apart `spread` m, closing over the
 *  4 frames before, together on the frame, apart again over 3). p = the floor point under the figure (for a sitter
 *  the seat's top with y 0), facing, y = the hands' world height, z = how far in front. Returns [hand 0, hand 1]. */
export const clap = (f: number, ons: number[], p: THREE.Vector3, facing: number, y = 0.95, z = 0.3, spread = 0.16): [THREE.Vector3, THREE.Vector3] => {
  let g = 1;
  for (const on of ons) { const d = f - on; g = Math.min(g, d < -4 ? 1 : d <= 0 ? 1 - easeInCubic((d + 4) / 4) : d <= 3 ? easeOutCubic(d / 3) : 1); }
  const x = 0.025 + (spread / 2) * g, q = V(p.x, 0, p.z);
  return [rel(q, facing, -x, y, z), rel(q, facing, x, y, z)];
};
/** a camera turned `deg` degrees about its own position round the vertical (+ = to the RIGHT) */
export const yawCam = (c: CamPose, deg: number): CamPose => {
  if (!deg) return c;
  const p = v3(c.pos as V3Like), l = v3(c.look as V3Like).sub(p).applyAxisAngle(V(0, 1, 0), (-deg * Math.PI) / 180).add(p);
  return { ...c, pos: [p.x, p.y, p.z], look: [l.x, l.y, l.z] };
};
/** THE WHIP PAN (Wanbi's BIBLE rule 5a: toward Zhao = RIGHT, toward Qin = LEFT; 4 frames out + 4 in, hard under the streak).
 *  dir 1 = the pan goes right. way "out": the last frames [from, to] of a shot yaw away `deg` (ease-in: full on `to`);
 *  "in": the first frames [from, to] of the next shot arrive yawing in from the other side (full on `from`, ease-out,
 *  settled on to + 1). Give hud streak({ f, from: out's from, to: in's to, dir }) on the frames of both shots. */
export const whip = (c: CamPose, f: number, from: number, to: number, dir: 1 | -1, way: "out" | "in", deg = 25): CamPose => {
  if (f < from || f > to) return c;
  const n = to - from + 1;
  return way === "out" ? yawCam(c, dir * deg * easeInCubic((f - from + 1) / n)) : yawCam(c, -dir * deg * (1 - easeOutCubic((f - from) / n)));
};
/** a small camera shake on an impact (shot 1's stop, 11's 碎): `px` px on the frame at the depth `dist` m (vertical fov
 *  `fov`), alternating sides each frame, decaying over `len` frames from `on`; sideways and up, never a roll */
export const shake = (c: CamPose, f: number, on: number, px = 6, dist = 6.3, len = 8): CamPose => {
  const i = f - on;
  if (i < 0 || i >= len) return c;
  const m = ((px / 1920) * 2 * dist * Math.tan((c.fov * Math.PI) / 360)) * (1 - i / len) * (i % 2 ? -1 : 1);
  const p = v3(c.pos as V3Like), l = v3(c.look as V3Like), r = V().subVectors(l, p).cross(V(0, 1, 0)).normalize();
  const d = r.multiplyScalar(m).add(V(0, 0.5 * m, 0));
  return { ...c, pos: [p.x + d.x, p.y + d.y, p.z + d.z], look: [l.x + d.x, l.y + d.y, l.z + d.z] };
};


// ----------------------------------------------------------------------------------------------------------- staging
/** a camera at HER EYES: standing at (x, z) on a floor at `floorY` (0), looking at `look`, her lens (layout.ts EYE
 *  1.50, FOV 62). (Her real camera with its sway and moves is cam.ts.) */
export const eye = (x: number, z: number, look: V3Like, fov = FOV, floorY = 0): CamPose => ({ pos: [x, floorY + EYE, z], look, fov });
/** a standing figure, idle and alive (the blank staging) */
export const standing = (p: THREE.Vector3, facing: number, f: number, id: number, extra: Extra = {}): Extra =>
  ({ at: p.clone(), facing, pose: { kind: "idle", t: f / FPS + 0.41 * id }, ...alive(f / FPS, id), expr: "neutral", ...extra, visible: true });
/** THE STAND-IN STAGING (a quick block-out staging: the place frame f shows (beats.ts placeAt, or `place`), her eyes
 *  from layout.ts STAND, `who` (default SU) standing on the place's stand-in mark facing her, idle and alive (a slow
 *  breathing sway and blinks: never frozen). `extra` runs after the figures are set and before w.update() (put props
 *  and other figures there); `after` after it. */
export const standIn = (w: World, f: number, o: { place?: Place; slate?: string; who?: Person; extra?: (w: World) => void; after?: (w: World) => void } = {}): Pose => {
  const place = o.place ?? placeAt(f), S = STAND[place];
  w.setPlace(place);
  const camera: CamPose = { pos: S.cam.pos, look: S.cam.look, fov: S.cam.fov };
  w.setCamera(camera);
  w.actor(o.who ?? SU).set(standing(S.su, S.facing, f, 1));
  o.extra?.(w);
  w.update();
  o.after?.(w);
  return { camera, slate: o.slate ?? `${place} (stand-in)` };
};

export { PEOPLE, FPS, lerp, lin, clamp01, smooth, easeOutCubic, easeInOutCubic, camMix };

// The Hongmen film's shared ACTION LIBRARY (engine-owned and FROZEN after the skeleton: segment builders import from
// it, never edit it; staging and film-specific verbs go into shots/stage.ts / shots/verbs.ts of the layout owner, or
// into your own segX_*.ts). Everything here is a pure function of its arguments: nothing keeps state between frames.
//
//   basics     V, v3, yawTo, lerpA, lid (blinks), speak (lip-sync of a Quote), accent (head accents by frame), heads
//   keys       at (step keys), ky / kv (eased keys), path (a point through keys), swaps (blink over expression changes)
//   places     rel (a point in a figure's own frame), hang (where an idle hand hangs), staged (a point in screen terms),
//              headPx (a head on screen), kick (a 3-frame camera jolt), frag (several overlays as one node)
//   moving     walkAlong / walkTime (a walker on a floor path, feet planted), hopArc (a jump)
//   sitting    seated (the banquet's floor seats, with the verified rise), kneel (a sink), bow (a head bow), salute
//              (the 拱手 bow: the only forward lean the rig has)
//   crowd      stagger, alive
//   cameras    cam, shotCam (a beats.ts shot's camera on frame f, with its eased move)
//   staging    ROLE (who sits on which layout seat), banquet (everybody on their seat for this camera, cups on the
//              tables): the BLANK staging of the skeleton, enough for an animatic
//
// Conventions (group/kit/rig3d): metres, floor y 0, facing 0 = toward +z (the camera side), PI/2 = toward +x; the
// person's LEFT is +x when facing 0. arm 0 = the person's right hand (screen left when they face the camera), 1 = left.
// Frames are absolute film frames; a shot takes its time from the f it is given, never from w.t.
import * as THREE from "three";
import React from "react";
import { rigWalk, rigSpeak, rigHeadAccent, rigHeadAdd, type Rig, type RigState, type RigHead, type RigPose } from "../../group/kit/rig3d";
import { lidAt } from "../../group/kit/cast";
import { PEOPLE, type Person } from "../people";
import { CAMS, SEATS, PAD_TOP, type Seat, type Role } from "../layout";
import type { World } from "../world";
import type { ShotDef } from "../beats";
import type { CupName } from "../props";
import { FPS, clamp01, lerp, lin, smooth, hash, easeOutCubic, easeInOutCubic, camMix, h, type Quote, type V3Like, type CamPose, type Vec3 } from "../story";

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
 *  (0-based). Outside the quote (+- a few frames) it returns {}.   ...speak(quote("xiangYu", 9), f, 3) */
export const speak = (q: Quote, f: number, id = 0, stress?: number[]): { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } => {
  if (f < q.from - 6 || f > q.to + 10) return {};
  const sp = rigSpeak(f / FPS, { from: q.start, to: q.end, syl: q.syl, stress }, id);
  const out: { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } = {};
  if (sp.mouth) out.mouth = sp.mouth;
  if (sp.head) out.head = sp.head;
  if (sp.blink !== undefined) out.blink = sp.blink;
  return out;
};
/** a head accent that starts on film frame `on`: accent("jolt", f, HIT.slam). undefined before it and once it is over.
 *  kinds: pop, squash, nod, jolt, shake, laugh, lean (o.dur seconds for laugh / lean; o.dir 1 = screen right; o.amp) */
export const accent = (kind: Parameters<typeof rigHeadAccent>[0], f: number, on: number, o: Parameters<typeof rigHeadAccent>[2] = {}) => (f < on ? undefined : rigHeadAccent(kind, (f - on) / FPS, o));
/** several accents / heads added up (undefined ones are skipped) */
export const heads = (...hs: (RigHead | undefined)[]): RigHead | undefined => { const k = hs.filter(Boolean) as RigHead[]; return k.length ? rigHeadAdd(...k) : undefined; };

// ------------------------------------------------------------------------------------------------------------ keys
/** STEP keys: the value of the last key at or before f. For expr, gaze, anything that snaps.
 *    expr: at(f, [[0, "neutral"], [HIT.slam, "huff"]]) */
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
 *  under a blink */
export const swaps = (keys: [number, unknown][]) => keys.slice(1).map(([k]) => k / FPS);

// ------------------------------------------------------------------------------------------------------------ places
/** a point given in a standing figure's own frame: x = to its LEFT, y up from its feet, z = forward */
export const rel = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => p.clone().add(V(Math.cos(facing) * x + Math.sin(facing) * z, y, -Math.sin(facing) * x + Math.cos(facing) * z));
/** where an idle figure's hand hangs (measured), to start a pinned gesture from */
export const hang = (p: THREE.Vector3, facing: number, arm: 0 | 1) => rel(p, facing, arm ? 0.172 : -0.172, 0.58, 0.035);
/** A GUARD'S HALBERD HAND (acc/held.ts halberd(); people.ts: GUARD / LIU_GUARD hold it in hand 1, GUARD_B /
 *  LIU_GUARD_B in hand 0): ALWAYS pin it with this, never leave it hanging. The rig's hanging hand is 0.17-0.19 m out
 *  from the middle, the shaft passes 3 cm outside the hand and leans out at the top to clear the big head, so below
 *  the hand it swings IN: with a hanging hand it went 1.6-2.0 cm into the armour skirt (hem 0.2 m out, 0.29 m up;
 *  measured, 2026-11-12). No straight shaft through a hanging hand clears both the head and the hem, so the hand
 *  moves out: 0.23 m out, `y` up, 4 cm forward (0.215 still left 1 cm in the skirt). Standing: y 0.6-0.64, out 0.225-0.23; running: y 0.66, out 0.25
 *  (the skirt swings further out, and a pinned hand neither swings nor dips with the step, so the butt stays off
 *  the ground). Returns the hand's target for that hand's slot. */
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
/** A figure on one of the banquet's floor seats (layout.ts Seat: SEATS.liu, NIGHT_X.seat): spread over the state.
 *      r.set({ ...seated(SEATS.liu, t), expr, visible: true })
 *  The hands rest on the low table by themselves (verified: reach 0, clear >= 0).
 *  rise 0..1 = RISING from the seat (07 finding 3): the seat's top goes from the pad up to standing hip height over
 *  about 6 frames, then switch to a standing pose; give the figure's own hip height (r.dim.hipY). The table's edge is
 *  dropped from the first frame of the rise (dropping it mid-rise moves the head 6 cm in one frame). */
export const seated = (s: Seat, t: number, o: { rise?: number; hipY?: number } = {}): Extra => {
  const k = clamp01(o.rise ?? 0), top = s.top.clone();
  if (k > 0) top.y = lerp(PAD_TOP, (o.hipY ?? 0.62) - 0.028, k);
  return { at: V(s.top.x, 0, s.top.z), facing: s.facing, pose: { kind: "sit", t }, seat: { top, deskEdge: k > 0 ? undefined : s.deskEdge, deskTop: s.deskTop } };
};
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
/** THE 拱手 BOW from the waist (07 finding 4, checked on the cast in g3): the only forward lean the rig has: the
 *  "haul" pose run backwards with both hands pinned together in front of the chest, about 19 degrees, feet staggered.
 *  p = the figure's floor point, facing = its facing. Spread over the state (it sets pose, hands, lookDown, head):
 *      r.set({ at: p, facing, ...salute(k, p, facing), visible: true })       k 0 = upright .. 1 = bowed
 *  clear >= 0 for every figure but Fan Kuai (-0.011). Hold it at least 12 frames. */
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

// ----------------------------------------------------------------------------------------------------------- cameras
export const cam = (pos: Vec3, look: Vec3, fov: number): CamPose => ({ pos, look, fov });
/** the camera of a beats.ts shot on frame f: its checked camera, or on its eased move to the second one (ease in and
 *  out, as 08 T8 asks). Not for the privy shots (sets/privy.ts gives their camera). */
export const shotCam = (s: ShotDef, f: number): CamPose => {
  if (s.cam === "privy") throw new Error(`shotCam: shot ${s.id} is a privy shot (use privyOpening / privyClosing)`);
  const a = CAMS[s.cam];
  if (!s.move) return a;
  const [to, f0, f1] = s.move, k = easeInOutCubic(lin(f, f0, f1));
  return k <= 0 ? a : k >= 1 ? CAMS[to] : camMix(a, CAMS[to], k);
};

// ----------------------------------------------------------------------------------------------------------- staging
/** who sits on which seat of layout.ts SEATS */
export const ROLE: Record<Role, Person> = { liu: PEOPLE.liuBang, zhang: PEOPLE.zhangLiang, fankuai: PEOPLE.fanKuai, xiangyu: PEOPLE.xiangYu, uncle: PEOPLE.xiangBo, fanzeng: PEOPLE.fanZeng };
const ROLES_IN_ORDER: Role[] = ["liu", "zhang", "fankuai", "xiangyu", "uncle", "fanzeng"];
/** true when a figure at `p` facing `facing` shows the camera its back (more than 100 degrees off): it then needs
 *  turn: 1, or the rig turns its head back over its shoulder at the camera (07, "seated figures seen from behind") */
export const backToCamera = (w: World, p: THREE.Vector3, facing: number) => Math.abs(wrapA(facing - Math.atan2(w.camera.position.x - p.x, w.camera.position.z - p.z))) > 1.75;
/** THE BLANK BANQUET (after w.setPlace("tent") and w.setCamera): seats everybody who is `in`, in the sit pose, with a
 *  blink and a wandering gaze, a true back view for those who face away from this camera, and puts a cup on every
 *  table. f = the film frame. Returns the figures by role (only those seated).
 *    in      who sits (default: liu, zhang, xiangyu, uncle, fanzeng: the banquet before Fan Kuai; Fan Kuai's seat is
 *            an empty table in script v4)
 *    extra   per role, laid over the state (expr, hands, head ...)
 *    cups    false = no cups; or the list of roles whose cup stands on its table (default: all six tables)
 *  The layout / staging owner supersedes this with the real banquet(w, f, opts) in shots/stage.ts. */
export const banquet = (w: World, f: number, o: { in?: Role[]; extra?: Partial<Record<Role, Extra>>; cups?: false | Role[] } = {}): Partial<Record<Role, Rig>> => {
  const t = f / FPS, who = o.in ?? ["liu", "zhang", "xiangyu", "uncle", "fanzeng"], out: Partial<Record<Role, Rig>> = {};
  for (const k of ROLES_IN_ORDER) {
    if (!who.includes(k)) continue;
    const s = SEATS[k], id = ROLES_IN_ORDER.indexOf(k) + 1, r = w.actor(ROLE[k]);
    r.set({ ...seated(s, t + 0.37 * id), ...alive(t, id), expr: "neutral", ...(backToCamera(w, s.top, s.facing) ? { turn: 1 } : {}), ...(o.extra?.[k] ?? {}), visible: true });
    out[k] = r;
  }
  if (o.cups !== false) for (const k of o.cups ?? ROLES_IN_ORDER) w.prop(`cup:${k}` as CupName).put(SEATS[k].cup);
  return out;
};
/** a standing figure, idle and alive: r.set(standing(p, facing, f, id)) (the blank staging of the skeleton) */
export const standing = (p: THREE.Vector3, facing: number, f: number, id: number, extra: Extra = {}): Extra =>
  ({ at: p.clone(), facing, pose: { kind: "idle", t: f / FPS + 0.41 * id }, ...alive(f / FPS, id), expr: "neutral", ...extra, visible: true });

export { PEOPLE, CAMS, SEATS, FPS, lerp, lin, clamp01, smooth, easeOutCubic, easeInOutCubic, camMix };

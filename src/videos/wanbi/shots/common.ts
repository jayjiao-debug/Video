// The Wanbi film's shared ACTION LIBRARY: a copy of Hongmen's shots/common.ts (WP1b), owned by WP7 from then on (WP7
// adds the film's own verbs, listed under "film verbs" below). Everything here is a pure function of its arguments:
// nothing keeps state between frames.
//
//   basics     V, v3, yawTo, wrapA, lerpA, lid (blinks), speak (lip-sync of a Quote), accent (head accents by frame), heads
//   keys       at (step keys), ky / kv (eased keys), path (a point through keys), swaps (blink over expression changes)
//   places     rel (a point in a figure's own frame), hang, halberdHand, staged (a point in screen terms), headPx (a
//              head on screen), kick (a 3-frame camera jolt), frag (several overlays as one node)
//   moving     walkAlong / walkTime (a walker on a floor path, feet planted), hopArc (a jump)
//   sitting    seated (on a 榻: layout.ts TaSeat, with the held partial rise), kneel (a sink), bow (a head bow), salute
//              (the 拱手 bow: the only forward lean the rig has)
//   crowd      stagger, alive
//   cameras    shotCam (a beats.ts shot's camera on frame f, with its eased move)
//   staging    linFor / servantFor (which figure plays the envoy / the servant on frame f), blockOut (THE BLANK
//              STAGING of the block-out: every shot's place, camera and placed list on their marks; the segment stubs
//              use it until WP7-WP11 write the real shots)
//   film verbs (WP7) headM (a head offset in metres -> head radii), headPop (the 3-frame pop), swapTo (one person's two
//              figures, swapped on a frame), raiseJade (the jade stood on one hand: rim grip), handOver (the jade
//              between two holders), kingWave / WAVE / kingShake (the King of Qin's hand wave and head shake), clap,
//              yawCam / whip (the whip pan: out on a shot's last 4 frames, in on the next shot's first 4), shake (the
//              camera's decaying shake on a hit)
//
// Conventions (group/kit/rig3d): metres, floor y 0, facing 0 = toward +z (the camera side), PI/2 = toward +x; the
// person's LEFT is +x when facing 0. arm 0 = the person's right hand (screen left when they face the camera), 1 = left.
// Frames are absolute film frames; a shot takes its time from the f it is given, never from w.t.
import * as THREE from "three";
import React from "react";
import { rigWalk, rigSpeak, rigHeadAccent, rigHeadAdd, type Rig, type RigState, type RigHead, type RigPose } from "../../group/kit/rig3d";
import { lidAt } from "../../group/kit/cast";
import { PEOPLE, type Person } from "../people";
import { CAMS, HALL, ZHAO, ROAD, type TaSeat } from "../layout";
import type { World } from "../world";
import { shotAt, shot, BEAT, HIT, hookOffAt, type ShotDef, type PlacedCode } from "../beats";
import { JADE, JADE_HANDS, JADE_STAND, PROP_SCALE } from "../props";
import { FPS, clamp01, lerp, lin, smooth, hash, easeInCubic, easeOutCubic, easeInOutCubic, camMix, h, cap, type Quote, type V3Like, type CamPose, type Vec3, type Pose } from "../story";

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
 *  (0-based). Outside the quote (+- a few frames) it returns {}.   ...speak(quote("lin", 6), f, 1) */
export const speak = (q: Quote, f: number, id = 0, stress?: number[]): { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } => {
  if (f < q.from - 6 || f > q.to + 10) return {};
  const sp = rigSpeak(f / FPS, { from: q.start, to: q.end, syl: q.syl, stress }, id);
  const out: { mouth?: RigState["mouth"]; head?: RigHead; blink?: number } = {};
  if (sp.mouth) out.mouth = sp.mouth;
  if (sp.head) out.head = sp.head;
  if (sp.blink !== undefined) out.blink = sp.blink;
  return out;
};
/** a head accent that starts on film frame `on`: accent("jolt", f, HIT.smash1). undefined before it and once it is
 *  over. kinds: pop, squash, nod, jolt, shake, laugh, lean (o.dur seconds for laugh / lean; o.dir 1 = screen right; o.amp) */
export const accent = (kind: Parameters<typeof rigHeadAccent>[0], f: number, on: number, o: Parameters<typeof rigHeadAccent>[2] = {}) => (f < on ? undefined : rigHeadAccent(kind, (f - on) / FPS, o));
/** several accents / heads added up (undefined ones are skipped) */
export const heads = (...hs: (RigHead | undefined)[]): RigHead | undefined => { const k = hs.filter(Boolean) as RigHead[]; return k.length ? rigHeadAdd(...k) : undefined; };

// ------------------------------------------------------------------------------------------------------------ keys
/** STEP keys: the value of the last key at or before f. For expr, gaze, anything that snaps.
 *    expr: at(f, [[0, "huff"], [HIT.glint1 + 1, "nervous"]]) */
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
/** A figure on a 榻 (layout.ts TaSeat: HALL.seat, ZHAO.seat): spread over the state.
 *      r.set({ ...seated(HALL.seat, t), expr, visible: true })
 *  The hands rest on the lap by themselves. NO SEATED LEAN (BIBLE 5): sitting forward = o.back -0.10; lounging =
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

// ----------------------------------------------------------------------------------------------------------- cameras
/** the camera of a beats.ts shot on frame f: its checked camera, or on its eased move to the second one (ease in and
 *  out, BIBLE rule 8) */
export const shotCam = (s: ShotDef, f: number): CamPose => {
  const a = CAMS[s.cam];
  if (!s.move) return a;
  const [to, f0, f1] = s.move, k = easeInOutCubic(lin(f, f0, f1));
  return k <= 0 ? a : k >= 1 ? CAMS[to] : camMix(a, CAMS[to], k);
};

// ----------------------------------------------------------------------------------------------------------- staging
/** which figure plays the envoy on frame f (beats.ts PLACED "L"): LIN_RAGE in shots 1-2 (in 2 he stands behind the
 *  camera at the pillar: the same moment as 1), in 10b-11 and on 抢 (line 15, until 只好答应), LIN_OFFICIAL from 当
 *  (the 23b swap), else LIN */
export const linFor = (f: number): Person => {
  if (f >= HIT.crown) return PEOPLE.linOfficial;
  const rage: [number, number][] = [[0, shot("2").to], [shot("10b").from, shot("11").to], [HIT.rage2, cap(15, 1).from - 1]];
  return rage.some(([a, b]) => f >= a && f <= b) ? PEOPLE.linRage : PEOPLE.lin;
};
/** which figure plays the servant on frame f: SERVANT_ROUGH from the puff (粗) */
export const servantFor = (f: number): Person => (f >= HIT.puff ? PEOPLE.servantRough : PEOPLE.servant);
/** a standing figure, idle and alive (the blank staging) */
export const standing = (p: THREE.Vector3, facing: number, f: number, id: number, extra: Extra = {}): Extra =>
  ({ at: p.clone(), facing, pose: { kind: "idle", t: f / FPS + 0.41 * id }, ...alive(f / FPS, id), expr: "neutral", ...extra, visible: true });

type LinMark = "pillar" | "present" | "give" | "mid" | "zhao" | "road" | "kneel";
type KingQ = "seat" | "risen" | "map";
type JadeAt = "pillar" | "zhao" | "chest" | "stand";
/** the block-out of each shot: where the envoy stands, how the King of Qin sits, where the jade is (the holds of BIBLE
 *  section 4 are measured with these) */
const BLOCK: Record<string, { lin?: LinMark; q?: KingQ; jade?: JadeAt }> = {
  "1": { lin: "pillar", q: "risen", jade: "pillar" }, "2": { lin: "pillar", q: "risen" }, "3": { jade: "zhao" },
  "5a": { lin: "zhao" }, "5b": { lin: "zhao" }, "6": { lin: "zhao", jade: "chest" },
  "7a": { lin: "present", q: "seat" }, "7b": { lin: "give", q: "seat" }, "8a": { lin: "present", q: "seat" }, "8b": { lin: "mid", q: "seat" },
  "9": { lin: "give", q: "seat" }, "10a": { lin: "pillar", q: "risen" }, "10b": { lin: "pillar", jade: "pillar" }, "11": { lin: "pillar", q: "risen", jade: "pillar" },
  "12a": { lin: "pillar", q: "seat" }, "12b": { lin: "pillar", q: "map" }, "13": { lin: "mid", q: "map" }, "14": { lin: "mid", q: "map" }, "15": { lin: "mid", q: "map" },
  "16a": { lin: "road" }, "16b": {},
  "17a": { lin: "present", q: "seat" }, "17b": { lin: "present", q: "seat" }, "18a": { lin: "mid", q: "seat" }, "18b": { lin: "mid", q: "seat" },
  "19": { lin: "mid", q: "seat" }, "20a": { lin: "mid", q: "seat" }, "20b": { lin: "mid", q: "seat" }, "21a": { lin: "mid", q: "seat" },
  "21b": { lin: "mid", q: "seat" }, "22": { lin: "mid", q: "seat" }, "23a": { jade: "zhao" }, "23b": { lin: "kneel", jade: "stand" },
};
/** the envoy's chest hold in Zhao (shot 6): the disc's centre in his own frame (x left, y up, z forward) */
const CHEST: Vec3 = [0, 0.97, 0.24];
/** his facing in 6 before the turn left: the disc then sits just right of his head (zhaoLin: jade at the chest 44/49) */
const CHEST_FACING = 0.05;
/** THE BLANK STAGING (WP1b's block-out; the segment stubs pose every frame with it until WP7-WP11 write the real
 *  shots): the shot's place (with the ceremony dressing and the map stand on their beats.ts spans), its camera (with
 *  its eased move) and EXACTLY its placed list (beats.ts SHOTS[].placed / PLACED) standing or sitting on their layout
 *  marks, idle and alive; the jade where the block-out's holds need it (the hook's raise, the Zhao king's two hands,
 *  the envoy's chest in 6, the stand in 23b); the guards' halberd hands pinned. No overlays (hud/ is WP6). */
export const blockOut = (w: World, f: number): Pose => {
  const s = shotAt(f), t = f / FPS, B = BLOCK[s.id] ?? {}, placed = new Set<PlacedCode>(s.placed);
  w.setPlace(s.place);
  if (s.place === "hall") {
    w.set.setCeremony(f >= BEAT.ceremony[0] && f <= BEAT.ceremony[1] ? 1 : 0);
    w.set.setMapStand(f >= BEAT.mapStand[0] && f <= BEAT.mapStand[1]);
  }
  const camera = shotCam(s, f);
  w.setCamera(camera);
  const after: (() => void)[] = [];
  // ---- the envoy
  if (placed.has("L")) {
    const r = w.actor(linFor(f));
    if (B.lin === "pillar") {
      const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, B.jade === "pillar" ? HALL.jadeHand0.clone() : null];
      r.set({ ...standing(HALL.pillar, HALL.pillarFacing, f, 1), hands, expr: linFor(f) === PEOPLE.linRage ? "huff" : "neutral" });
      if (B.jade === "pillar") after.push(() => w.prop("jade").put(HALL.jadeHand0, { grip: "rim" }));
    } else if (B.lin === "give") r.set(standing(HALL.give, HALL.giveFacing, f, 1));
    else if (B.lin === "present" || B.lin === "mid") r.set(standing(B.lin === "mid" ? HALL.mid : HALL.present, -0.9, f, 1));
    else if (B.lin === "zhao") {
      const fc = B.jade === "chest" ? CHEST_FACING : -0.35;
      if (B.jade === "chest") {
        const c = rel(ZHAO.lin, fc, ...CHEST), hd = JADE_HANDS.pair.map(([x]) => rel(ZHAO.lin, fc, CHEST[0] + x * PROP_SCALE.jade, CHEST[1], CHEST[2]));
        r.set({ ...standing(ZHAO.lin, fc, f, 1), hands: [hd[0], hd[1]] });
        after.push(() => w.prop("jade").put(c, { grip: "pair", rot: fc }));
      } else r.set(standing(ZHAO.lin, fc, f, 1));
    } else if (B.lin === "road") r.set(standing(ROAD.envoy, 0.5, f, 1));
    else if (B.lin === "kneel") r.set({ ...standing(ZHAO.kneel, ZHAO.kneelFacing, f, 1), ...kneel(1, ZHAO.kneel, 20) });
  }
  // ---- the King of Qin
  if (placed.has("Q")) {
    const r = w.actor(PEOPLE.qinWang), sc = PEOPLE.qinWang.scale ?? 1;
    if (B.q === "map") r.set(standing(HALL.kingMap, 0.7, f, 2));
    else if (B.q === "risen") {
      const k = HALL.kingHookHand, p = HALL.seat.top;
      r.set({ ...seated(HALL.seat, t, { rise: 0.45, hipY: r.dim.hipY, scale: sc }), ...alive(t, 2), expr: "shock", hands: [V(p.x - k.x, k.y, p.z + k.z), V(p.x + k.x, k.y, p.z + k.z)], visible: true });
    } else r.set({ ...seated(HALL.seat, t), ...alive(t, 2), ...lap(HALL.seat, 0.11, 0.26, 0.20), visible: true });
  }
  // ---- the ladies, the ministers, the guards, the usher, the official (hall)
  if (placed.has("A")) w.actor(PEOPLE.ladyA).set(standing(HALL.ladyA, 0.9, f, 3));
  if (placed.has("B")) w.actor(PEOPLE.ladyB).set(standing(HALL.ladyB, 0.4, f, 4));
  if (placed.has("M")) {
    w.actor(PEOPLE.qinMinA).set(standing(HALL.minA, HALL.minFacing, f, 5));
    w.actor(PEOPLE.qinMinB).set(standing(HALL.minB, HALL.minFacing, f, 6));
    if (!placed.has("O")) w.actor(PEOPLE.qinMinC).set(standing(HALL.minC, HALL.minFacing, f, 7));
  }
  if (placed.has("O")) w.actor(PEOPLE.qinMinC).set({ ...standing(HALL.official, Math.PI, f, 7), ...kneel(1, HALL.official, 10), turn: 1 });
  if (placed.has("G")) {
    w.actor(PEOPLE.qinGuard).set({ ...standing(HALL.guardL, 0.6, f, 8), hands: [null, halberdHand(HALL.guardL, 0.6, 1)] });
    w.actor(PEOPLE.qinGuardB).set({ ...standing(HALL.guardR, -0.6, f, 9), hands: [halberdHand(HALL.guardR, -0.6, 0), null] });
  }
  if (placed.has("C")) w.actor(PEOPLE.qinGuardB).set({ ...standing(HALL.guardC, -0.8, f, 9), hands: [halberdHand(HALL.guardC, -0.8, 0), null] });
  if (placed.has("U")) w.actor(PEOPLE.qinUsher).set(standing(HALL.usher, -0.5, f, 10));
  // ---- Zhao and the road
  if (placed.has("Z")) {
    const r = w.actor(PEOPLE.zhaoWang);
    if (s.id === "23b") r.set(standing(ZHAO.kingStand, ZHAO.kingStandFacing, f, 11));
    else if (B.jade === "zhao") {
      const hd = JADE_HANDS.pair.map(([x]) => ZHAO.jade.clone().add(V(x * PROP_SCALE.jade, 0, 0)));
      r.set({ ...seated(ZHAO.seat, t), ...alive(t, 11), hands: [hd[0], hd[1]], visible: true });
      after.push(() => w.prop("jade").put(ZHAO.jade, { grip: "pair" }));
    } else r.set({ ...seated(ZHAO.seat, t), ...alive(t, 11), ...lap(ZHAO.seat, 0.096, 0.25, 0.195), visible: true });
  }
  if (placed.has("E")) w.actor(PEOPLE.miaoXian).set(s.id === "23b" ? standing(ZHAO.miao23, -0.7, f, 12) : standing(ZHAO.miao, -0.6, f, 12));
  if (placed.has("N")) {
    w.actor(PEOPLE.zhaoMinA).set(standing(ZHAO.minA, ZHAO.minFacing, f, 13));
    w.actor(PEOPLE.zhaoMinB).set(standing(ZHAO.minB, ZHAO.minFacing, f, 14));
  }
  if (placed.has("S")) {
    const r = w.actor(servantFor(f));
    if (s.id === "16b") r.set(standing(ROAD.ridgeFrom.clone().lerp(ROAD.ridgeTo, 0.5), Math.PI / 2, f, 15));
    else r.set(standing(ROAD.servant, -0.5, f, 15));
  }
  if (B.jade === "stand") {
    w.prop("jadeStand").put(ZHAO.jadeStand);
    after.push(() => w.prop("jade").put(ZHAO.jadeStand.clone().add(V(0, JADE_STAND.disc, 0))));
  }
  if (s.id === "12b" || s.id === "13" || s.id === "14" || s.id === "15") w.prop("mapScroll").put(HALL.mapBar, { open: 1 });
  w.update();
  for (const a of after) a();
  return { camera, hud: !hookOffAt(f), slate: `${s.id} ${s.cam} (block-out)` };
};

// ------------------------------------------------------------------------------------------------- the film's verbs
// WP7: the verbs the storyboard names (BUILD_PLAN 1: handOver, raiseJade, kingWave, clap, headPop, whip, swapTo), for
// every segment. Each is a pure function of its arguments; distances in metres, frames absolute unless named a clock.
/** metres of head movement (the storyboard's "head.dy -0.02") as the rig's head units (RigHead dx / dy are in head
 *  radii, a head is 0.24 m in radius): headM(-0.02) = -0.083 */
export const headM = (m: number) => m / 0.24;
/** A HEAD POP on a word (BIBLE 5: a swap or a hard word lands with it): scale 1.12 / 1.06 / 1.02 on the three frames
 *  from `on`, undefined otherwise. Add it with heads(...). */
export const headPop = (f: number, on: number, k: [number, number, number] = [1.12, 1.06, 1.02]): RigHead | undefined => {
  const i = f - on;
  return i >= 0 && i < 3 ? { scale: k[i] } : undefined;
};
/** AN ACTOR SWAP (BIBLE 5: LIN <-> LIN_RAGE <-> LIN_OFFICIAL, SERVANT -> SERVANT_ROUGH): two figures with the same Look,
 *  one shown. Returns the figure that plays on frame f (`to` from frame `on`, `from` before it): set it as usual,
 *  beginFrame keeps the other hidden. Land it on a word with headPop(f, on) or a puff. (linFor / servantFor say who
 *  plays the envoy / the servant on any frame of the film.) */
export const swapTo = (w: World, f: number, on: number, from: Person, to: Person): Rig => w.actor(f >= on ? to : from);
/** THE ONE-HANDED RAISE (BIBLE 5: no two-handed overhead hold; the producer took the one-handed raise for 双手): the
 *  jade's centre `c`, turned `rot` (a yaw, or [rx, ry, rz] Euler YXZ as props put), stands on ONE hand by its bottom
 *  edge (grip "rim"). Returns the hand's point (pin the holder's hand there) and the put options: after w.update(),
 *  w.prop("jade").put(R.hand, R.put). */
export const raiseJade = (c: THREE.Vector3, rot: number | [number, number, number] = 0) => {
  const e = Array.isArray(rot) ? new THREE.Euler(rot[0], rot[1], rot[2], "YXZ") : new THREE.Euler(0, rot, 0, "YXZ");
  const hand = c.clone().add(V(0, -JADE.r, 0).applyEuler(e));
  return { hand, put: { grip: "rim" as const, rot } };
};
/** A HAND-OVER of the jade from A's grip point `a` to B's `b` over frames [from, to] (eased in and out, lifted `lift`
 *  m at the middle): the jade's centre on frame f, the progress k, who holds it (0 = A until the middle, 1 = B from
 *  then) and `both` (the frames both hands touch it: pin both to their grip points of `at`). The glint and the chip
 *  land on `to` (HIT.take, HIT.toLady ...). Reach: keep a and b within both figures' 0.40 m arms (HALL.meet, HALL.pass). */
export const handOver = (f: number, from: number, to: number, a: THREE.Vector3, b: THREE.Vector3, lift = 0.03) => {
  const k = smooth(lin(f, from, to)), at = a.clone().lerp(b, k);
  at.y += lift * 4 * k * (1 - k);
  return { at, k, holder: (k < 0.5 ? 0 : 1) as 0 | 1, both: k > 0.3 && k < 0.7 };
};
/** the wave's sizes: `sway` = how far each hand swings OUTWARD from HALL.kingHookHand (m), `bob` = up and down (m).
 *  0.11 keeps his right hand inside the hook's left edge (at 0.15 it reached 0.3 % x) */
/** sway / bob: the wave's sideways and up-down travel (m); drop: the hands 2 cm under HALL.kingHookHand (at its
 *  height his upper arm brushed his shaking head: rig.qa.clear -17 mm on 64; 2 cm lower, 0-171 is clean) */
export const WAVE = { sway: 0.11, bob: 0.03, drop: 0.02 };
/** THE KING OF QIN'S FRANTIC WAVE (shots 1, 2, 11): his two hands up and out at HALL.kingHookHand (x, z in his body
 *  frame from the seat's top, y world height), swinging sideways at 4 Hz on the clock `u` (frames since the hook's
 *  first frame, so 852 waves exactly as 0 does), amplitude `amp` 0..1 (the freeze of the wind-up = 0: the hands stay
 *  high and out). COUNTER-PHASE: each hand's outward swing is half a cycle from the other's, so both hands sway the
 *  same way across the frame and never come in front of his face (each swings OUTWARD from +-0.22 by up to WAVE.sway;
 *  mirrored inward swings would cover the face: the hands start at its edges), and bob up and down against each other
 *  (WAVE.bob). Returns [hand 0, hand 1] world points (hand 0 = his right, screen left). */
export const kingWave = (u: number, amp = 1, s: TaSeat = HALL.seat): [THREE.Vector3, THREE.Vector3] => {
  const k = HALL.kingHookHand, ph = (2 * Math.PI * 4 * u) / FPS, sw = Math.sin(ph), p = V(s.top.x, 0, s.top.z);
  const o0 = WAVE.sway * 0.5 * amp * (1 + sw), o1 = WAVE.sway * 0.5 * amp * (1 - sw), b = WAVE.bob * amp * Math.cos(ph);
  const y = k.y - WAVE.drop;
  return [rel(p, s.facing, -(k.x + o0), y + b, k.z), rel(p, s.facing, k.x + o1, y - b, k.z)];
};
/** the King of Qin's head shake while he waves (1, 2, 11): +-4 deg and a little sideways at 2 Hz on the same clock */
export const kingShake = (u: number, amp = 1): RigHead => { const s = Math.sin((2 * Math.PI * 2 * u) / FPS); return { tilt: 4 * amp * s, dx: 0.04 * amp * s }; };
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
/** THE WHIP PAN (BIBLE rule 5a: toward Zhao = RIGHT, toward Qin = LEFT; 4 frames out + 4 in, hard under the streak).
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

export { PEOPLE, CAMS, HALL, ZHAO, ROAD, FPS, lerp, lin, clamp01, smooth, easeOutCubic, easeInOutCubic, camMix };

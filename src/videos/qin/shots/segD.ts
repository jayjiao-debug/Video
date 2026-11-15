// SEGMENT D, lines D01-D06: 午时, the terrace (SERIOUS). WP5 segD. PLAN.md 7D, beats.ts BEAT.D. The emperor is "plain"
// all through D (people.ts BLUSH SWAPS: D never blushes). Every frame comes from line() / capWord() / BEAT.D / SEGMENTS,
// every mark from layout/terrace.ts.
//   arrive  S.from .. day2-1   the whip out of the hall LANDS here (C.whip dir 1 arriving + whipSmear, 5 frames), already
//                              following him across the terrace to the parapet, the wind in the banners. He stops at
//                              the parapet, back to us; far below, the LONG line of carriages. D01: on 丞相 his chin
//                              lifts at the road, on 这么多车 his right hand jabs down at it and he half-turns his
//                              shoulders to her (the "can you believe this" glance: his face comes round in two
//                              frames, never a profile); D02 哼: the huff said TO her, then he turns back to the road.
//                              Her camera: the follow walk settles 2 m behind him, calm.
//   day 2   day2 .. turn0-1    the 第二天 card: a new clip (the autofocus hunts: the cut hides in the blur), the same
//                              view a step to the left, FEW carriages. He stands at the parapet, still, breathing, his
//                              head bowed to the road. D03 (quietly): she CREEPS up beside him to the parapet and tilts
//                              down over it at the road: three carriages (on 车少了).
//   turn    turn0 .. card      D04 (under the tense music): she lifts the lens off the road onto his back and backs
//                              off a step, the handheld turns scared. 昨天 from his back; from 那句话 his body comes
//                              round VERY slowly (1 s) to a three-quarter back view, and on 是谁 his head and shoulders
//                              come the rest of the way at once: the eyes land on the lens (turnFor: the face crosses
//                              the edge of the head in a frame); the lens creeps in; on 传出去 a slow nod and his eyes
//                              slide to the attendants (screen right).
//   pan     card               she follows his eyes: a nervous swing right (sinking to the kneelers' level, 1.12 m: she
//                              shrinks, the guard towers) onto the ATTENDANTS kneeling (heads bowed,
//                              trembling; one dares a glance up at the lens and ducks again), a slow drift across them,
//                              ending on the GUARD who stares into the lens (a slow push in). Under the fact card
//                              (faces kept below y 560); he is out of frame before the card comes in.
//   stare   card end .. D05    she whips back once the card is gone: he is RIGHT THERE (he walked up while she looked
//                              away): she flinches, he LEANS in slowly through 你 (chin down), his left hand comes to
//                              rest on the sword's hilt (the threat; he never draws), her lens sinks (she shrinks).
//                              D05 你 (a chin jab), 昨天 a tilt, 在不在 the other way; stern, no blink through the stare.
//   tremble D06                her camera trembles; on 不、不在 the lens shakes "no"; on 我什么都没拍到 she lowers it a little
//                              and tilts it away (hiding it); his eyes drop to the camera in her hands (a slow blink) and
//                              come back up, slit-eyed: "sure you didn't" (cool).
//   black   BEAT.D.black       the fade to the film's darkest warm tone (#2a1d19, not #000) over 6 frames, held to the
//                              last frame of D (segment E fades in from it).
import * as THREE from "three";
import { SEGMENTS, line, capWord, quote, FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, hash, h, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { EMPEROR, ATTENDANT, GUARD } from "../people";
import { hiltGrip } from "../acc/sword";
import { TX, TERRACE, TERRACE_SET } from "../layout/terrace";
import { EYE, FOV } from "../layout";
import type { World } from "../world";
import { V, rel, lid, at, ky, accent, heads, headPop, speak, frag, walkAlong, walkTime, kneel, halberdHand, yawTo, lerpA, wrapA, kick, type RigState } from "./common";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[3];
const RAD = Math.PI / 180;
const sec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;
const between = (f: number, a: number, b: number, e: (x: number) => number = easeInOutCubic) => e(clamp01((f - a) / Math.max(1, b - a)));
/** smooth value noise -1..1 (t in cycles, k a stream) */
const noise = (t: number, k: number) => { const i = Math.floor(t), u = t - i, s = u * u * (3 - 2 * u); return (lerp(hash(i, k), hash(i + 1, k), s) - 0.5) * 2; };
/** the film's darkest warm tone (the palm's black): D ends in it, E fades in from it */
const WARM_BLACK = "#2a1d19";

// ====================================================================================================== the frames
const T = {
  from: S.from, to: S.to,
  d01: line("D01").from, chengxiang: word("D01", "丞相"), duoche: word("D01", "这么多"), che: word("D01", "车"), d01end: line("D01").to,
  d02: line("D02").from, d02end: line("D02").to,
  day2: BEAT.D.fewCars,
  d03: line("D03").from, shaole: word("D03", "车少了"), d03end: line("D03").to,
  turn0: BEAT.D.turn[0], d04: line("D04").from, zuotian: word("D04", "昨天"), juhua: word("D04", "那句话"), shui: word("D04", "是谁"), chuan: word("D04", "传出去"), d04end: line("D04").to,
  card: BEAT.D.card, pan: BEAT.D.pan,
  lean: BEAT.D.lean[0], d05: line("D05").from, zuotian5: word("D05", "昨天"), zaibuzai: word("D05", "在不在"), d05end: line("D05").to,
  d06: line("D06").from, buzai: word("D06", "不在"), shenme: word("D06", "什么"), paidao: word("D06", "拍到"), d06end: line("D06").to,
  black: BEAT.D.black[0],
};
/** the whip lands: C's last 5 frames leave to the right, D's first 5 arrive (decelerating) */
const LAND_ON = T.from - 5;
/** D04's turn: the music goes out, she lifts the lens off the road onto his back and backs off (by LIFT1); 昨天 comes
 *  from his back; he turns VERY slowly from 那句话 to 传出去 (1.6 s), so the whole turn plays on screen */
const LIFT1 = T.turn0 + 36, TURN0 = T.juhua - 4, TURN1 = T.chuan;
/** the turn's three parts: the body comes round SLOWLY to a three-quarter back view (110 deg from her lens, the face
 *  still hidden), then his head and shoulders come the rest of the way in 5 frames (the eyes land on her on 是谁: the
 *  face crosses the edge of the head, where it would be a sliver of a profile, in a frame or two), then it settles */
const FAST0 = T.shui - 5, FAST1 = T.shui;
/** the swing onto the attendants: his eyes slide to them on 传出去 and she follows them as D04 ends (he is out of
 *  frame before the card comes in) */
const SWING0 = T.d04end - 6, SWING1 = SWING0 + 11;
/** the slow drift across them, the guard's stare at its end */
const DRIFT1 = T.pan[1] - 6;
/** she turns back to him: he is right there on BEAT.D.lean */
const BACK1 = T.card[1] + 6, BACK0 = BACK1 - 14;
/** the lean: she finds him right there (the fact card is gone by then, so his face is never under it), and he leans
 *  in, slowly, through 你 to 昨天 */
const LEAN = BACK1 - 1, LEAN1 = T.zuotian5;
const leanK = (f: number) => between(f, LEAN, LEAN1, easeInOutCubic);
/** the fade to warm black (6 frames), held to S.to */
const FADE = 6;

// ====================================================================================================== the marks
const E0 = TERRACE.emperor.clone();
/** his head's centre above his floor point (rig, measured with the probe) */
const HEAD_Y = 1.3;
/** a point far down on the road where the procession travels (the set's road polyline: its far bend) */
const ROAD_PTS = TERRACE_SET.road.pts;
const ROAD_FAR = V(ROAD_PTS[3][0] - 4, TERRACE_SET.fields.y, ROAD_PTS[3][1] - 15);
/** he faces the road (a little right of straight out) */
const F_ROAD = yawTo(E0, ROAD_FAR);
/** his walk onto the terrace: from the hall doors' side to the parapet, arriving just before 这么多车 */
const WALK_SPEED = 1.15;
/** (review) nearly straight out from the hall doors (3.4 deg left of -z): a walk 17 deg to the left turned the follow
 *  camera past the far sky card's left end at x TX - 360 (a hard seam in the sky at the left edge), and from straight
 *  behind him the long line of carriages lies beside him in the frame instead of off its right edge */
const P0 = V(E0.x + 0.18, 0, 0.75);
const WALK_PTS = [P0, E0];
/** the walk's direction (the follow keeps it once he stops: without it C.follow falls back to +z and the camera
 *  jumped as he arrived) */
const WDIR = V(E0.x - P0.x, 0, E0.z - P0.z).normalize();
const WYAW = Math.atan2(WDIR.x, WDIR.z);
const ARRIVE = T.duoche - 8;
const WALK0 = ARRIVE - Math.round(walkTime(WALK_PTS, WALK_SPEED) * FPS);
const walkAt = (f: number) => walkAlong(WALK_PTS, WALK_SPEED, (f - WALK0) / FPS, { endFacing: F_ROAD });
/** her places: 2 m behind him (day 1), a step left (day 2's new clip), beside him at the parapet (D03), backed off (D04) */
const HER1 = V(E0.x - WDIR.x * 1.9 - WDIR.z * 0.32, EYE, E0.z - WDIR.z * 1.9 + WDIR.x * 0.32);   // where the follow ends
const HER1B = V(TX + 0.05, EYE, 0.05);
const HER2 = V(TX + 0.5, EYE, -2.05);
const HER3 = V(TX - 0.5, EYE, -0.5);   // (review) behind him: from TX + 0.12 the lens looked 24 deg left and the sky card's end showed beside his head (and the west pillar's edge crawled at the frame's left edge)
/** the backing-off she does during the pan (a step back) */
const HER4 = V(TX + 0.02, EYE, -0.45);
/** he turns to her (D04) */
const F_HER = yawTo(E0, HER3);
/** the back view as a function of how far he faces from her lens: a true back view (1) from 105 deg on, turned to the
 *  camera (0) within 70 deg (the rig's own default goes over 115-170 deg, a slow turn would show the face at the edge
 *  of the head for many frames) */
const turnFor = (p: THREE.Vector3, facing: number, cam: CamPose) => {
  const c = cam.pos as Vec3;
  return smooth((Math.abs(wrapA(facing - Math.atan2(c[0] - p.x, c[2] - p.z))) - 70 * RAD) / (35 * RAD));
};
/** D04's turn as a fraction of the way from the road to her: slow (ease in) to 110 deg, fast to 60 deg, settling */
const F_TURN0 = F_ROAD + 0.12;
/** (review) always round over his RIGHT shoulder (the side she and the attendants are on): she is almost straight behind
 *  him, so the shortest way round is a coin toss */
const D_TURN = ((d) => (d > 0 ? d - 2 * Math.PI : d))(wrapA(F_HER - F_TURN0));
const OFF0 = Math.abs(D_TURN);
const U1 = clamp01(1 - (110 * RAD) / OFF0), U2 = clamp01(1 - (60 * RAD) / OFF0);
const turnedAt = (f: number) =>
  f < FAST0 ? U1 * between(f, TURN0, FAST0, (x) => x * x) : f < FAST1 ? lerp(U1, U2, (f - FAST0) / (FAST1 - FAST0)) : lerp(U2, 1, between(f, FAST1, TURN1, easeOutCubic));
/** D01's glance: on 这么多车 he turns his shoulders round to her (a real half-turn, so his face and its huff show), and
 *  back to the road on 哼 */
const F_CAM1 = yawTo(E0, HER1);
const glanceAt = (f: number) => between(f, T.che - 2, T.che + 8) * (1 - between(f, T.d02end - 1, T.d02end + 8));
const day1Facing = (f: number) => lerpA(walkAt(f).facing, F_CAM1, 0.75 * glanceAt(f));
/** while she looks away he walks up: RIGHT THERE in front of her lens (his head about 55 % of the width) */
const LEAN_D = C.leanDist(0.44, FOV);   // not bigger: she looks up at him and his crown must stay clear of the REC row
const toE = V(E0.x - HER4.x, 0, E0.z - HER4.z).normalize();
const LEAN_AT = V(HER4.x + toE.x * LEAN_D, 0, HER4.z + toE.z * LEAN_D);
const LEAN_IN = V(HER4.x + toE.x * (LEAN_D - 0.16), 0, HER4.z + toE.z * (LEAN_D - 0.16));
const F_LEAN = yawTo(LEAN_AT, HER4);
const STEP_PTS = [E0, LEAN_AT];
const STEP0 = SWING1 + 4;
const stepAt = (f: number) => walkAlong(STEP_PTS, 0.9, (f - STEP0) / FPS, { endFacing: F_LEAN, startFacing: F_HER });
/** the attendants and the guard */
const ATT = TERRACE.attendants;
/** day 2: the fourth kneels nearer the hall doors, off her line to the guard (on the mark he filled the lower half of the
 *  guard's close-up, a giant head in the caption band) */
const ATT2 = ATT.map((p, i) => (i === 3 ? V(TX + 1.1, 0, 1.5) : i === 4 ? V(TX + 2.81, 0, 1.0) : p.clone()));
// (review) the fifth kneels to the guard's right (screen left): on its mark it sat in line under the guard's halberd,
// the pole ending in its topknot
const GUARD_AT = TERRACE.guard.clone();
const F_GUARD = yawTo(GUARD_AT, HER4);

// ====================================================================================================== her camera
/** a camera as angles (so a pan interpolates its direction, not a look point): yaw (0 = +z, PI/2 = +x), pitch */
type Ang = { p: THREE.Vector3; yaw: number; pitch: number; fov: number };
/** her eyes at p, turned so that the world point tgt lands on screen at (sx, sy) of 1080 x 1920 */
const aim = (p: THREE.Vector3, tgt: THREE.Vector3, sx: number, sy: number, fov = FOV): Ang => {
  const d = tgt.clone().sub(p), hz = Math.hypot(d.x, d.z), tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  return { p: p.clone(), yaw: Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th), pitch: Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), fov };
};
const mixA = (a: Ang, b: Ang, t: number): Ang => ({ p: a.p.clone().lerp(b.p, t), yaw: lerpA(a.yaw, b.yaw, t), pitch: lerp(a.pitch, b.pitch, t), fov: lerp(a.fov, b.fov, t) });
const pose = (a: Ang): CamPose => {
  const d = V(Math.sin(a.yaw) * Math.cos(a.pitch), Math.sin(a.pitch), Math.cos(a.yaw) * Math.cos(a.pitch));
  const l = a.p.clone().addScaledVector(d, 3);
  return { pos: [a.p.x, a.p.y, a.p.z], look: [l.x, l.y, l.z], fov: a.fov };
};
const angOf = (c: CamPose): Ang => {
  const p = V(...(c.pos as Vec3)), l = V(...(c.look as Vec3)), d = l.sub(p);
  return { p, yaw: Math.atan2(d.x, d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)), fov: c.fov };
};
const head = (p: THREE.Vector3) => V(p.x, HEAD_Y, p.z);
const attHead = (i: number) => V(ATT[i].x, 0.78, ATT[i].z);

// the views
const STAND1 = aim(HER1, head(E0), 330, 630);   // aimed low enough that the eave never slivers in at the top
const STAND2 = aim(HER1B, head(E0), 450, 545);
/** beside him at the parapet, tilted down over it at the road (the three carriages a little above the middle) */
const ROADVIEW = aim(HER2, ROAD_FAR, 600, 820, FOV - 26);   // she zooms in to count them (they are specks at the wide lens)
/** backed off, on him as he turns (his eyes in the upper third) */
const ONHIM = aim(HER3, head(E0), 545, 615);   // the crown clear of the REC row and the battery
const ONHIM_IN = aim(V(HER3.x, EYE, HER3.z).addScaledVector(V(E0.x - HER3.x, 0, E0.z - HER3.z).normalize(), 0.14), head(E0), 540, 605, FOV - 5);
/** the attendants: the first (closest) one, the far ones, the guard */
/** (review) she sinks to the kneelers' level as she follows his eyes onto them (she shrinks; the guard towers): from
 *  1.12 m the parapet hides the plain's far edges, which showed as hard green slabs above it from her full height */
const LOW = 1.12;
const HER4L = V(HER4.x, LOW, HER4.z);
const ATT1 = aim(HER4L, attHead(0), 470, 900);
const ATTS = aim(HER4L, attHead(2), 560, 860);
const GUARDV = aim(HER4L, V(GUARD_AT.x, 1.22, GUARD_AT.z), 545, 690, FOV - 4);
const GUARD_IN = aim(HER4L, V(GUARD_AT.x, 1.22, GUARD_AT.z), 545, 670, FOV - 14);
/** back to him: the halfway direction (so the swing turns the short way round past the attendants) and his close-up */
const CLOSE = aim(HER4, head(LEAN_AT), 540, 665);
const BACK_MID = mixA(GUARD_IN, CLOSE, 0.5);

/** the camera of the keys (no handheld) and a lens blur for the fast moves */
const baseCam = (f: number): { cam: CamPose; blur: number } => {
  let blur = 0;
  // ---- day 1: the follow, settling behind him
  if (f < T.day2) {
    const fol = C.follow(f, (g) => walkAt(g).at, { back: 1.9, side: 0.32, lookY: 0.75, ahead: 3.2, yaw: WYAW });
    const k = between(f, ARRIVE - 16, ARRIVE + 16);
    return { cam: pose(mixA(angOf(fol), STAND1, k)), blur };
  }
  // ---- day 2: a new clip (the cut is in the blur), the creep to the parapet, the look down
  let a = STAND2;
  a = mixA(a, ROADVIEW, between(f, T.d03 - 8, T.shaole + 6));
  // the turn: up off the road onto him, backing off a step
  a = mixA(a, ONHIM, between(f, T.turn0, LIFT1));
  a = mixA(a, ONHIM_IN, between(f, T.shui, T.d04end, smooth));
  // the swing onto the attendants (fast at first: a nervous follow of his eyes), the drift, the guard
  const sw = between(f, SWING0, SWING1);
  a = mixA(a, ATT1, sw);
  blur += 9 * Math.sin(Math.PI * sw) * (sw > 0 && sw < 1 ? 1 : 0);
  a = mixA(a, ATTS, between(f, SWING1, T.pan[0] + 20, smooth));
  a = mixA(a, GUARDV, between(f, T.pan[0] + 20, DRIFT1));
  a = mixA(a, GUARD_IN, between(f, DRIFT1 - 4, BACK0 + 2, smooth));
  // back to him: he is right there
  const b1 = between(f, BACK0, BACK0 + 7, easeInCubic), b2 = between(f, BACK0 + 7, BACK1, easeOutCubic);
  if (f >= BACK0) { a = f < BACK0 + 7 ? mixA(a, BACK_MID, b1) : mixA(BACK_MID, CLOSE, b2); blur += 12 * (f < BACK0 + 7 ? b1 : 1 - b2); }
  return { cam: pose(a), blur };
};

const camAt = (f: number, headW: THREE.Vector3 | null) => {
  const B = baseCam(f);
  let cam = B.cam;
  // the handheld: calm while she follows, a walk while she moves, scared from his turn on
  cam = C.handheld(cam, f, {
    mood: [[T.from, "calm"], [T.turn0 + 16, "scared"]],
    walk: [[T.from, 1], [ARRIVE - 4, 1], [ARRIVE + 14, 0], [T.d03 - 6, 0], [T.d03 + 4, 0.55], [T.shaole + 4, 0.55], [T.shaole + 12, 0], [T.turn0 + 8, 0], [T.turn0 + 16, 0.5], [T.turn0 + 36, 0], [SWING1, 0], [SWING1 + 4, 0.35], [T.pan[0] + 10, 0]],
    amp: f < T.turn0 ? 0.85 : 1,
  });
  // the stare: his head comes in, she gives way and keeps his eyes in the upper third; she shrinks
  if (headW && f >= LEAN) cam = C.lean(cam, f, LEAN, headW, { back: 0.08, len: 10, third: 0.345 });   // his eyes in the upper third (review: 0.38 put the crown into the REC row)
  if (f >= LEAN) cam = C.duck(cam, f, LEAN + 4, undefined, { to: 1.42, len: 16 });
  // the flinch when she finds him right there
  cam = kick(cam, f, BACK1 - 1, 0.03);
  // D06: the tremble grows; "no" on 不、不在; she lowers the camera a little and tilts it away on 我什么都没拍到
  if (f >= T.d06 - 6) {
    const t = f / FPS, g = 0.5 + 0.5 * between(f, T.d06 - 6, T.d06end);
    const no = f >= T.buzai - 8 && f < T.buzai + 10 ? Math.sin(((f - (T.buzai - 8)) / 9) * Math.PI * 2) * 1.6 * (1 - (f - (T.buzai - 8)) / 18) : 0;
    const hide = between(f, T.shenme - 4, T.shenme + 14);
    cam = C.nudge(cam, { yaw: no + g * 0.45 * noise(t * 9, 41) + 2.5 * hide, pitch: g * 0.4 * noise(t * 8.3, 42) + 1.0 * hide, roll: g * 0.5 * noise(t * 7.1, 43) + 3.5 * hide, up: -0.02 * hide });
  }
  // the landing of C's whip: the first 5 frames arrive from the left (C's pan went right), decelerating
  const W = C.whip(cam, f, LAND_ON, { dir: 1, out: 5, in: 5, to: cam });
  const blur = B.blur;
  const post = W.post ?? (blur > 0.3 ? { dof: { focus: 0.05, amount: blur } } : undefined);
  return { cam: W.cam, post, smear: W.smear };
};

// ====================================================================================================== the people
/** HIS expressions, gazes and blinks */
const EXPR: [number, Expr][] = [
  [T.from, "stern"], [T.duoche, "huff"], [T.d01end + 2, "stern"], [T.d02, "huff"], [T.d02end + 6, "stern"],
  // D04-D05: cold, no smile, no blink through the stare (the menace is in the stillness); D06: as her lie ends and his
  // eyes come back up from the camera, the slit-eyed "sure you didn't" (the smirk of a man who knows)
  [T.paidao + 10, "cool"],
];
const GAZE: [number, number][] = [
  [T.from, 0], [T.chuan - 2, 0], [T.chuan + 4, 1], [SWING1, 1], [SWING1 + 6, 0],
];
/** no blink through the stare (a stare does not blink); blinks elsewhere, the expression changes under one */
const blinkAt = (f: number) => {
  const t = f / FPS;
  if (f >= LEAN - 4 && f < T.d05end + 6) return 0;
  const sw = EXPR.slice(1).map(([k]) => k / FPS);
  const slow = f >= T.shenme - 2 && f < T.shenme + 10 ? Math.sin(((f - T.shenme + 2) / 12) * Math.PI) : 0;   // the slow blink of disbelief
  return Math.max(lid(t, 1, sw), slow);
};

/** THE EMPEROR on frame f */
const emperor = (w: World, f: number, cam: CamPose) => {
  const r = w.actor(EMPEROR), t = f / FPS;
  const base: Extra = { expr: at(f, EXPR), gaze: ky(f, GAZE), blink: blinkAt(f), visible: true };
  // ---- day 1: the walk, the stop, the point, the half-turn to her, 哼
  if (f < T.day2) {
    const L = walkAt(f);
    const idle = { kind: "idle" as const, t: t + 0.3 };
    // 这么多: the jab down at the road with the right hand; 车？: he turns to her and the hand turns up, open (the
    // "can you believe this?"); 哼: it drops as he turns back (eased in and out: the hand travels, it never snaps)
    const fa = day1Facing(f), g = glanceAt(f);
    const pk = between(f, T.duoche - 4, T.duoche + 3, easeOutCubic) * (1 - between(f, T.che - 4, T.che + 4));
    const hang0 = rel(L.at, fa, -0.215, 0.64, 0.09);
    const out0 = rel(L.at, L.facing, -0.3, 0.78, 0.42);
    const palm = rel(L.at, fa, -0.27, 0.8, 0.3);
    const hand = pk + g > 0.01 ? hang0.clone().lerp(out0, pk).lerp(palm, g) : null;
    // the half-turn of his shoulders toward her on 这么多车 (a glance over the shoulder), back to the road on 哼
    const turn = glanceAt(f) > 0 ? turnFor(L.at, fa, cam) : 1;
    const chin = ky(f, [[T.chengxiang - 4, 0], [T.chengxiang + 4, -8], [T.duoche, 6], [T.d02 + 2, 8], [T.day2, 4]]);
    r.set({
      ...base, at: L.at, facing: day1Facing(f), pose: L.moving ? L.pose : idle, turn, lookDown: chin,
      hands: [hand, null],
      ...speak(quote("di", "D01"), f, 1), ...(f >= T.d02 - 6 ? speak(quote("di", "D02"), f, 1) : {}),
      head: heads(f >= T.d02 - 6 ? speak(quote("di", "D02"), f, 1).head : speak(quote("di", "D01"), f, 1).head, accent("nod", f, T.duoche, { amp: 0.7 }), accent("squash", f, T.d02), headPop(f, T.d02 - 1)),
    });
    return r;
  }
  // ---- day 2: still at the parapet, the slow turn, the walk up while she looks away, the lean, the stare
  const S2 = stepAt(f);
  const turned = turnedAt(f);     // VERY slow to the three-quarter back view, then the head comes round on 是谁
  const facing = f < STEP0 ? F_TURN0 + D_TURN * turned : S2.facing;
  let atP = f < STEP0 ? E0.clone() : S2.at;
  // the lean: a last step in, chin down
  const li = leanK(f);
  if (f >= LEAN) atP = LEAN_AT.clone().lerp(LEAN_IN, li);
  const turn = f < TURN0 ? 1 : turnFor(E0, facing, cam);
  const look = ky(f, [[T.day2, 9], [TURN0, 9], [TURN0 + 30, 2], [T.chuan, 2], [T.chuan + 8, 7], [T.d04end + 4, 3], [LEAN, 3], [T.d05 - 2, 7], [T.zaibuzai, 5], [T.shenme - 2, 5], [T.shenme + 6, 13], [T.paidao + 2, 13], [T.paidao + 12, 5]]);
  const idle = { kind: "idle" as const, t: t + 0.3 };
  // the head: the D04 tilt (cold), the nod on 传出去, the D05 chin jab on 你, the tilts on 昨天 / 在不在, D06's tiny tilt
  const tilt = ky(f, [[T.juhua - 4, 0], [T.juhua + 6, -4], [T.chuan, -2], [T.d04end, 0], [T.zuotian5 - 2, 0], [T.zuotian5 + 6, 3.5], [T.zaibuzai, -3.5], [T.d05end + 6, -1.5], [T.paidao, -1.5], [T.paidao + 10, 2]]);
  const breathe = { dy: 0.012 * Math.sin(t * 2 * Math.PI * 0.24), dx: 0.01 * Math.sin(t * 2 * Math.PI * 0.11 + 1) };
  const sp4 = speak(quote("di", "D04"), f, 1), sp5 = speak(quote("di", "D05"), f, 1);
  const sp = { ...(f < LEAN - 20 ? sp4 : sp5) };
  if (f >= LEAN - 4 && f < T.d05end + 6) delete sp.blink;     // the stare does not blink, not even at the line's joints
  r.set({
    ...base, at: atP, facing, pose: f >= STEP0 && S2.moving ? S2.pose : idle, turn: f >= STEP0 ? 0 : turn, lookDown: look,
    ...sp,
    head: heads(sp.head, { tilt }, breathe, accent("nod", f, T.chuan, { amp: 0.6 }), accent("nod", f, T.d05 - 1, { amp: 1 }), headPop(f, T.d05 - 1, [1.06, 1.03, 1.01])),
  });
  return r;
};

/** the attendants: standing along the east side on day 1, kneeling and trembling on day 2 (one dares a glance up) */
const attendants = (w: World, f: number) => {
  const t = f / FPS;
  (f < T.day2 ? ATT : ATT2).forEach((p, i) => {
    const r = w.actor(ATTENDANT, String(i + 1)), facing = yawTo(p, E0);
    if (f < T.day2) {
      r.set({ at: p.clone(), facing, pose: { kind: "idle", t: t + 0.37 * i }, expr: "neutral", blink: lid(t, 10 + i), gaze: 0, visible: true });
      return;
    }
    const K = kneel(1, p, 28);
    // a fast small tremble of the bowed heads (deterministic: a sine per figure, never a frame-to-frame jitter)
    const tr = { dx: 0.05 * Math.sin(t * 2 * Math.PI * 3.1 + i * 1.9), dy: 0.02 * Math.sin(t * 2 * Math.PI * 2.3 + i) };
    // the one who looks up at the lens as it passes (the second), and ducks again
    const up = i === 1 ? ky(f, [[T.pan[0] + 4, 0], [T.pan[0] + 10, 1], [T.pan[0] + 22, 1], [T.pan[0] + 26, 0]]) : 0;
    r.set({
      ...K, facing, pose: { kind: "idle", t: t + 0.37 * i }, expr: i === 1 && up > 0.5 ? "shock" : at(f, [[T.day2, "nervous" as Expr], [T.d04 + 5 * i, i === 1 ? "wince" : "nervous"]]),
      lookDown: (K.lookDown ?? 28) * (1 - 0.85 * up), gaze: i === 1 ? 0 : 0.5 * Math.sin(t * 0.7 + i), blink: lid(t, 10 + i), turn: 0,
      head: heads(K.head, tr), visible: true,
    });
  });
};

/** the guard by the hall doors: on day 2 he stares into the lens (one slow blink, then none) */
const guard = (w: World, f: number) => {
  const t = f / FPS, r = w.actor(GUARD, "1"), facing = f < T.day2 ? yawTo(GUARD_AT, E0) : F_GUARD;
  const stare = f >= T.pan[0];
  r.set({
    at: GUARD_AT.clone(), facing, pose: { kind: "idle", t: t + 0.8 }, expr: stare ? "stern" : "deadpan", gaze: 0,
    blink: stare ? (f >= T.pan[0] + 6 && f < T.pan[0] + 12 ? Math.sin(((f - T.pan[0] - 6) / 6) * Math.PI) : 0) : lid(t, 21),
    hands: [null, halberdHand(GUARD_AT, facing, 1)], head: { dy: 0.01 * Math.sin(t * 1.5) }, turn: 0, visible: true,
  });
};

// ====================================================================================================== the overlays
const dark = (k: number) => (k <= 0.001 ? null : h("div", { key: "dDark", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: WARM_BLACK, opacity: clamp01(k), pointerEvents: "none" } }));

// ====================================================================================================== the segment
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f): Pose => {
    w.setPlace("terrace");
    // day 1: the long line of carriages; from 第二天 on, three
    w.set.param("carriages", f < T.day2 ? 1 : 0);
    w.set.param("wind", f < T.day2 ? 1 : 0.8);
    // the camera needs his head for the lean: it is where his feet are (a pure function of f), at HEAD_Y
    const headW = f >= LEAN ? V(LEAN_AT.x, HEAD_Y, LEAN_AT.z).lerp(V(LEAN_IN.x, HEAD_Y, LEAN_IN.z), leanK(f)) : null;
    const K = camAt(f, headW);
    // the 第二天 cut: the autofocus hunts as the new clip starts
    const hunt = f >= T.day2 - 3 && f < T.day2 + 12 ? Math.sin(((f - (T.day2 - 3)) / 15) * Math.PI) : 0;
    const post = K.post ?? (hunt > 0.05 ? { dof: { focus: 0.05, amount: 14 * hunt } } : undefined);
    w.setCamera(K.cam);
    emperor(w, f, K.cam);
    attendants(w, f);
    guard(w, f);
    w.update();
    // day 1: his left hand steadies the sword at his hip while he walks and stands (a swinging hand hit the hilt):
    // pinned just outside the hilt's grip, then solved again
    if (f < T.day2) {
      const r = w.actor(EMPEROR), g = hiltGrip(r);
      if (g) {
        const fa = day1Facing(f), left = V(Math.cos(fa), 0, -Math.sin(fa)), fwd = V(Math.sin(fa), 0, Math.cos(fa));
        r.set({ hands: [r.state.hands?.[0] ?? null, g.clone().addScaledVector(left, 0.06).addScaledVector(fwd, 0.03).add(V(0, 0.03, 0))] });
        w.update();
      }
    }
    // the stare: as he leans in, his left hand comes to rest on the sword's hilt (from the whip's blur on) and stays there
    // through D05 and D06: the threat is in the hand, he never draws
    if (f >= LEAN - 2) {
      const r = w.actor(EMPEROR), g = hiltGrip(r), st = r.state;
      if (g && st.at && st.facing !== undefined) {
        const p0 = V(st.at.x, 0, st.at.z), fa = st.facing, left = V(Math.cos(fa), 0, -Math.sin(fa)), fwd = V(Math.sin(fa), 0, Math.cos(fa));
        const onHilt = g.clone().addScaledVector(left, 0.035).addScaledVector(fwd, 0.085).add(V(0, 0.03, 0));   // in front of the grip: from her side the hand covers it
        const hang = rel(p0, fa, 0.25, 0.62, 0.07);   // just outside his robe (common.ts hang() is inside its flare)
        // the hand travels out and round the robe's flare (a straight line would cut through it)
        const k = between(f, LEAN - 2, LEAN + 10), arc = Math.sin(Math.PI * k);
        r.set({ hands: [st.hands?.[0] ?? null, hang.lerp(onHilt, k).addScaledVector(left, 0.09 * arc).addScaledVector(fwd, 0.07 * arc)] });
        w.update();
      }
    }
    const fade = f >= T.black ? easeInCubic(clamp01((f - T.black + 1) / FADE)) : 0;
    const slate = f < T.day2 ? "D arrive" : f < T.turn0 ? "D day 2" : f < SWING0 ? "D turn" : f < BACK0 ? "D pan" : f < T.d06 ? "D stare" : f < T.black ? "D tremble" : "D black";
    return {
      camera: K.cam, post, overlays: frag(C.whipSmear(K.smear, 1), dark(fade)),
      focus: f >= SWING0 && f < BACK1 ? [TX + 1.8, 0.2] : [E0.x + 0.3, E0.z + 0.6], slate,
    };
  },
};

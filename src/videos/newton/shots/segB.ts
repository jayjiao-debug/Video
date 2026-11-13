// SEGMENT B · 上午 · his room, clean white morning light (PLAN 7 B; script scene 2, lines 07-15 = B01-B09). WP5-B.
// One take after the plate insert, the camera moving only because people move (her eyes at 1.6 m):
//   B1  THE PLATE (the day's clock, first tick): close on the window table (ROOM_CAMS.plate, fov 50). HUMPHREY's hands
//       set the covered dinner down and lift the lid: steam (the lid comes up on the mix's anchor, B01 start - 1.1 s).
//   B2  PULL BACK (she straightens and steps back to the front of the room): the window table with its steaming plate
//       on the left, NEWTON writing at the paper-buried desk on the right, HUMPHREY between them with the lid in his
//       hand. 07 "Sir, your dinner." (the mic comes in from the lower left toward him). Newton does not look up.
//   B3  HUMPHREY waits, sighs, goes: to the door in the left wall, pulls it open, out; she turns her head after him and
//       the mic swings to the door: 08 「他说马上来！」; the door shuts behind him.
//   B4  she turns back: the steaming plate three steps from his elbow, Newton writing on; she walks up to the desk
//       asking 09; 10 (he answers without looking up); 11 the mic tilts to the drafts stack; 12; 13; 14 he stops the
//       quill and lifts his eyes to her, cold ("Not on me."), then back to the page.
//   B5  ASIDE 15 「没笑。」: the mic swings round to the lens, Newton soft behind it, writing; CARD 2 over the scratching
//       quill (the mic lowered out of the card's slot; she leans in a little toward the page).
// Every frame is a pure function of f; every time comes from line() / card() / BEAT / the mix's anchors.
import * as THREE from "three";
import { SEGMENTS, line, card, capWord, FPS, clamp01, lerp, smooth, easeOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON_INK, NEWTON_HIDE, HUMPHREY } from "../people";
import { RMX, ROOM, ROOM_CAMS, ROOM_SET, EYE, FOV, SCREEN } from "../layout";
import { PLATE, QUILL } from "../props";
import { V, rel, hang, lid, speak, saying, accent, heads, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, asideK, cardLower, CHAIR_ASIDE, type Rig, type RigPose } from "./common";
import type { World } from "../world";

const S = SEGMENTS[1];
const sec = (s: number) => Math.round(s * FPS);
const L1 = line("B01"), L2 = line("B02"), L3 = line("B03"), L4 = line("B04"), L5 = line("B05"), L6 = line("B06"), L8 = line("B08"), L9 = line("B09");
const CARD2 = card("B09");

// ---------------------------------------------------------------------------------------------------- the beats
/** the covered plate comes down into the insert and touches the table */
const T_SET = S.from + sec(0.27);
/** THE LID comes up (steam): the mix's anchor, B01 start - 1.1 s (SYNC_POINTS) */
const T_LID = L1.from - sec(1.1);
/** the cover tilts up on its far edge (steam), comes off and is set down beside the plate; his hand lets go */
const T_TILT = T_LID + 7, T_DOWN = T_TILT + 11, T_FREE = T_DOWN + 7;
/** the pull back (she straightens and steps back) */
const T_PULL0 = BEAT.B.pullBack[0];
const T_PULL1 = L1.to + 4;
/** HUMPHREY turns from the table toward NEWTON and takes a step (with the lid) */
const T_TURN0 = T_FREE - 2, T_TURN1 = L1.from + 6;
/** he waits; Newton does not look up; he sighs and goes */
const T_SIGH = L1.to + 2;
const T_GO = L1.to + sec(0.3);
/** her mic comes in from the lower left toward Humphrey, mid-"Sir, your dinner" */
const T_MIC = L1.from + sec(0.5);
/** the mic (and her eyes, a little) tilt to the drafts stack (11) and come back for his answer */
const T_DR0 = BEAT.B.micDrafts, T_DR1 = L5.to + 2;
/** 14: he stops the quill and lifts his eyes to her; back to the page as her aside starts */
const T_UP0 = L8.from + 3, T_UP1 = Math.min(L8.to, L9.from - 4);
const T_NOT = capWord("B08", "Not").from;
/** card 2: she leans in toward the page */
const T_LEAN0 = CARD2.from + 4, T_LEAN1 = CARD2.to;

// ---------------------------------------------------------------------------------------------------- the marks
const T = ROOM_SET.table, D = ROOM_SET.desk;
const P = (x: number, z: number, y = 0) => V(RMX + x, y, z);
/** HUMPHREY at the window table for the insert: front-right of the plate, out of the insert's frame but for his arms */
const H0 = P(T.x + 0.23, T.z + 0.44);
const H0_FACING = yawTo(H0, ROOM.plate);
/** where he says "Sir, your dinner.": two steps toward the desk (between the plate and Newton in the wide) */
const H1 = P(T.x + 0.75, T.z + 0.42);
const H1_FACING = yawTo(H1, ROOM.newtonDesk) - 0.25;
/** his way out: the door stands open (he came in with the dinner in both hands), lying back along the wall's hinge
 *  side; he walks to the doorway (clear of the open leaf and its ring) ... */
const DOOR_Z = (ROOM_SET.door.z0 + ROOM_SET.door.z1) / 2;
const LEG_A = [H1, P(-1.25, 0.0), P(-1.95, DOOR_Z + 0.17)];
/** ... looks back at her once ("He says he's coming!"), and goes out onto the landing */
const LEG_B = [LEG_A[2], P(-2.4, DOOR_Z + 0.1), P(-3.0, DOOR_Z + 0.08)];
const SPEED_A = 1.7, SPEED_B = 1.8;
const T_DZ = T_GO + Math.round(walkTime(LEG_A, SPEED_A) * FPS);
const T_GOB = T_DZ + sec(0.5);
const T_OUT = T_GOB + Math.round(walkTime(LEG_B, SPEED_B) * FPS);
/** the door: open (0.9) until he is out, then pulled shut from the landing */
const DOOR_OPEN = 0.9;
const doorK = (f: number) => ky(f, [[T_OUT - 3, DOOR_OPEN], [T_OUT + 8, 0]]);
const T_GONE = T_OUT + 8;
/** she turns back from the door: the steaming plate, Newton writing on */
const T_BACK0 = Math.max(L2.to + sec(0.15), T_OUT + 2), T_BACK1 = T_BACK0 + sec(0.5);
/** she walks up to the desk asking 09 (setting off as her head comes back round) */
const T_WALK0 = T_BACK0 + 8, T_WALK1 = L3.to - 2;

/** NEWTON behind the desk, writing standing (his page on ROOM.deskWrite, in reach) */
const N_AT = ROOM.newtonDesk, N_FACING = ROOM.deskFacing;
const N_EYE = 1.14, H_EYE = 1.14 * (HUMPHREY.scale ?? 1);

// ---------------------------------------------------------------------------------------------------- framing
/** a camera at `pos` turned so that the world point `p` lands on screen (sx, sy) px (fov vertical, 9:16) */
const frameOn = (pos: THREE.Vector3, p: THREE.Vector3, sx: number, sy: number, fov = FOV): CamPose => {
  const tanV = Math.tan((fov * Math.PI) / 360), tanH = tanV * (1080 / 1920);
  const d = p.clone().sub(pos), yawP = Math.atan2(d.x, -d.z), pitchP = Math.atan2(d.y, Math.hypot(d.x, d.z));
  const yaw = yawP - Math.atan(((sx / 1080) * 2 - 1) * tanH), pitch = pitchP - Math.atan((1 - (sy / 1920) * 2) * tanV);
  const L = 3;
  return { pos: [pos.x, pos.y, pos.z], look: [pos.x + Math.sin(yaw) * Math.cos(pitch) * L, pos.y + Math.sin(pitch) * L, pos.z - Math.cos(yaw) * Math.cos(pitch) * L], fov };
};
const eyesOf = (p: THREE.Vector3, e: number) => p.clone().add(V(0, e, 0));
/** B2 / B4: from the front of the room: the plate (left) and Newton (right) in one frame, his eyes high */
const POS_WIDE = P(-0.28, 1.95, EYE);
const MID_WIDE = V(lerp(ROOM.plate.x, N_AT.x, 0.5), N_EYE, lerp(ROOM.plate.z, N_AT.z, 0.5));
const CAM_WIDE = frameOn(POS_WIDE, MID_WIDE, 540, 600);
/** B3: Humphrey at the door, from the same place (her head turned) */
const camDoor = (p: THREE.Vector3) => frameOn(POS_WIDE, eyesOf(p, H_EYE), 600, 640);
/** B4: at the desk, Newton left of the middle, the drafts stack right of it; his eyes in the upper third */
const POS_INT = P(1.2, 0.1, EYE);
const CAM_INT = frameOn(POS_INT, eyesOf(N_AT, N_EYE), 380, 600);
/** the drafts: her eyes dip toward the stack with the mic (11) */
const CAM_DRAFTS = C.nudge(CAM_INT, { yaw: 3, pitch: -3 });
/** B1: the insert: WP2's plate camera (fov 50, her eyes bent low over the table) moved in to the table's front-left
 *  corner, level with Humphrey, who stands close at the front-right (the rig's short arms reach the near rim): his head
 *  stays beside her, out of the close-up; the plate a little below the middle, room above it for the lid and the steam */
const CAM_PLATE: CamPose = frameOn(P(T.x - 0.32, T.z + 0.68, 1.22), ROOM.plate.clone().add(V(0, 0.05, 0)), 540, 1040, ROOM_CAMS.plate.fov);

// ---------------------------------------------------------------------------------------------------- HUMPHREY
type HState = { at: THREE.Vector3; facing: number; pose: RigPose; walking: boolean };
/** where Humphrey is on frame f (null once the door has shut behind him) */
const humphreyAt = (f: number): HState | null => {
  const t = f / FPS;
  if (f >= T_GONE) return null;
  if (f < T_TURN0) return { at: H0.clone(), facing: H0_FACING, pose: { kind: "idle", t: t + 0.8 }, walking: false };
  if (f < T_GO) {
    // he turns from the table and takes a step toward the desk (two short steps), then stands
    const k = smooth(clamp01((f - T_TURN0) / Math.max(1, T_TURN1 - T_TURN0)));
    const p = H0.clone().lerp(H1, k), mv = k > 0 && k < 1;
    const facing = lerpA(H0_FACING, H1_FACING, smooth(clamp01((f - T_TURN0) / 9)));
    return { at: p, facing, pose: mv ? { kind: "walk", phase: (k * H0.distanceTo(H1)) / 0.8, stride: 0.16, amount: 0.6 } : { kind: "idle", t: t + 0.8 }, walking: mv };
  }
  if (f < T_GOB) {
    const g = walkAlong(LEG_A, SPEED_A, (f - T_GO) / FPS, { startFacing: H1_FACING, endFacing: -Math.PI / 2 });
    // in the doorway he looks back at her over his shoulder (her line), then turns to go
    const back = ky(f, [[T_DZ, 0], [T_DZ + 5, 0.8], [T_GOB - 4, 0.8], [T_GOB, 0]]);
    return { at: g.at, facing: lerpA(g.facing, yawTo(g.at, POS_WIDE), back), pose: g.pose, walking: g.moving };
  }
  const g = walkAlong(LEG_B, SPEED_B, (f - T_GOB) / FPS, { startFacing: -Math.PI / 2, endFacing: -Math.PI / 2 });
  return { at: g.at, facing: g.facing, pose: g.pose, walking: g.moving };
};
/** the covered plate in his hand coming down onto the table (0 = on the table) */
const plateLift = (f: number) => 0.15 * (1 - easeOutCubic(clamp01((f - S.from + 2) / Math.max(1, T_SET - S.from + 2))));
/** THE COVER, handled by its NEAR rim (the rig's arms are short: the knob in the plate's middle is out of reach): it
 *  tilts up on its far edge (the steam out), he lifts it off and sets it down on the table beside the plate, dome up */
const U = H0.clone().sub(ROOM.plate).setY(0).normalize();
const LID_AXIS = V().crossVectors(U, V(0, 1, 0)).normalize();
const LID_BASE = ROOM.plate.clone().add(V(0, PLATE.h - 0.004, 0));
const LID_RIM = V(U.x * (PLATE.lidR - 0.006), 0.012, U.z * (PLATE.lidR - 0.006));
const LID_PIVOT = LID_BASE.clone().addScaledVector(U, -PLATE.lidR).add(V(0, 0.008, 0));
/** where the cover is set down: the table's right end, clear of the plate and inside the cloth's edge */
const LID_DOWN = V(RMX + T.x + 0.29, ROOM.tableTop + 0.002, T.z + 0.07);
/** his fist sits on the rim, a little above the rim point */
const GRIP = V(0, 0.024, 0);
const qAxis = (a: THREE.Vector3, r: number) => new THREE.Quaternion().setFromAxisAngle(a, r);
const Q0 = new THREE.Quaternion();
/** the cover's pose on frame f (from T_LID on): its origin, its rotation and his hand on its near rim (null: let go) */
const lidPose = (f: number): { o: THREE.Vector3; q: THREE.Quaternion; hand: THREE.Vector3 | null } => {
  const tilted = (k: number) => { const q = qAxis(LID_AXIS, 1.2 * k); return { o: LID_PIVOT.clone().add(LID_BASE.clone().sub(LID_PIVOT).applyQuaternion(q)).add(V(0, 0.012 * k, 0)), q }; };
  const withHand = (o: THREE.Vector3, q: THREE.Quaternion) => ({ o, q, hand: o.clone().add(LID_RIM.clone().applyQuaternion(q)).add(GRIP) });
  if (f < T_TILT) { const A = tilted(easeOutCubic(clamp01((f - T_LID) / (T_TILT - T_LID)))); return withHand(A.o, A.q); }
  if (f < T_DOWN) {
    // up off the plate first, over, and down flat on its spot
    const A = tilted(1), k = clamp01((f - T_TILT) / (T_DOWN - T_TILT)), e = smooth(k);
    const o = A.o.clone().lerp(LID_DOWN, e).add(V(0, 0.09 * Math.sin(Math.PI * Math.min(1, k * 1.15)), 0));
    return withHand(o, A.q.clone().slerp(Q0, smooth(Math.min(1, k * 1.25))));
  }
  return f < T_FREE ? withHand(LID_DOWN.clone(), Q0) : { o: LID_DOWN.clone(), q: Q0, hand: null };
};
/** the near rim of the plate (the hand that sets it down) and of the cover on it */
const PLATE_RIM = U.clone().multiplyScalar(PLATE.r - 0.005).add(V(0, 0.02, 0)).add(GRIP);
const LID_RIM_ON = LID_BASE.clone().add(LID_RIM).add(GRIP);

// ---------------------------------------------------------------------------------------------------- NEWTON's quill
/** how much he is writing (1) or holding the quill still over the page (0: 14, he looks up) */
const writeK = (f: number) => 1 - ky(f, [[T_UP0 - 2, 0], [T_UP0 + 4, 1], [T_UP1, 1], [T_UP1 + 8, 0]]);
/** the nib on the page at frame f: lines of small loops from his left to his right, a carriage return every line,
 *  a lift between words (all from t) */
const nibAt = (f: number) => {
  const t = f / FPS, LT = 2.4, RT = 0.38, CY = LT + RT;
  const n = Math.floor(t / CY), u = t - n * CY, row = ((n % 9) + 9) % 9, z0 = 0.06 - row * 0.012;
  let x: number, z: number, y: number;
  if (u < LT) {
    const p = u / LT, w = 2 * Math.PI * 4.6 * t;
    x = 0.05 - 0.1 * p + 0.0032 * Math.sin(w);
    z = z0 + 0.0045 * Math.max(0, Math.cos(w)) - 0.001;
    y = 0.003 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 1.45 * t)), 10);
  } else {
    const p = smooth((u - LT) / RT);
    x = -0.05 + 0.1 * p; z = z0 - 0.012 * p; y = 0.012 * Math.sin(Math.PI * p);
  }
  const k = writeK(f), still = V(0.0, 0.016 + 0.002 * Math.sin(t * 1.3), 0.0);
  const nib = V(x, 0.004 + y, z).lerp(still.add(V(x, 0, z)), 1 - k);
  return ROOM.deskWrite.clone().add(nib);
};
/** the quill's direction from the nib up the feather (toward his right shoulder, a little back) */
const QDIR = V(-0.36, 0.84, -0.4).normalize();
const QROT = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), QDIR);
const quillHand = (f: number) => nibAt(f).addScaledVector(QDIR, -QUILL.nib);
const leftHand = (f: number) => ROOM.deskWrite.clone().add(V(0.15 + 0.004 * Math.sin(f * 0.031), 0.06, 0.01 + 0.003 * Math.sin(f * 0.023 + 1)));

// ---------------------------------------------------------------------------------------------------- the camera
/** her eyes on frame f (before the mic): the insert, the pull back, her head after Humphrey to the door and back, the
 *  walk to the desk, the dip to the drafts, the lean toward the page under card 2 */
const camAt = (f: number): CamPose => {
  // where Humphrey is for her head turn (smoothed: her head follows him a little late)
  const hLook = (g: number) => { const h = humphreyAt(Math.min(g, T_OUT - 2)); return h ? h.at : LEG_B[2]; };
  const hp = V(); let ws = 0;
  for (let i = 0; i < 6; i++) { const wgt = 6 - i; hp.addScaledVector(hLook(f - i), wgt); ws += wgt; }
  hp.divideScalar(ws);
  const doorCam = camDoor(hp);
  const kDoor = ky(f, [[T_GO + 2, 0], [T_GO + sec(0.6), 1], [T_BACK0, 1], [T_BACK1, 0]]);
  const base = f < T_PULL0 ? CAM_PLATE : f < T_PULL1 ? pullCam(f) : C.keyCam(f, [
    { f: T_WALK0, ...CAM_WIDE }, { f: T_WALK1, ...CAM_INT, ease: stride },
    { f: T_DR0, ...CAM_INT }, { f: T_DR0 + 14, ...CAM_DRAFTS }, { f: T_DR1, ...CAM_DRAFTS }, { f: T_DR1 + 14, ...CAM_INT }]);
  let cam = kDoor > 0 ? mixCam(base, doorCam, kDoor) : base;
  if (f >= T_LEAN0) cam = C.creep(cam, f, T_LEAN0, T_LEAN1, 0.32);
  // her walking: a light step only while she walks (the pull back, the walk to the desk)
  return C.handheld(cam, f, { walk: [[T_PULL0, 0], [T_PULL0 + 8, 0.55], [T_PULL1 - 10, 0.55], [T_PULL1, 0], [T_WALK0, 0], [T_WALK0 + 6, 0.7], [T_WALK1 - 6, 0.7], [T_WALK1, 0]] });
};
/** THE PULL BACK: she straightens and steps back from the plate to the front of the room in one steady move; her eyes
 *  go from the plate to Humphrey as he turns to speak, then open out to the wide (the plate, Humphrey, Newton) */
const PULL_FROM = V(...(CAM_PLATE.pos as [number, number, number]));
/** she backs straight away from the table first (keeping her distance from Humphrey, who steps off to her right),
 *  then curves round to the front of the room */
const PULL_VIA = V(PULL_FROM.x - 0.3, lerp(PULL_FROM.y, EYE, 0.3), PULL_FROM.z + 1.4);
const pullCam = (f: number): CamPose => {
  const u = stride((f - T_PULL0) / (T_PULL1 - T_PULL0)), fov = lerp(CAM_PLATE.fov, FOV, smooth(u));
  const pos = PULL_FROM.clone().multiplyScalar((1 - u) * (1 - u)).addScaledVector(PULL_VIA, 2 * u * (1 - u)).addScaledVector(POS_WIDE, u * u);
  const h = humphreyAt(f), onPlate = frameOn(pos, ROOM.plate.clone().add(V(0, 0.05, 0)), 540, 1040, fov);
  const onHim = h ? frameOn(pos, eyesOf(h.at, H_EYE), 400, 620, fov) : onPlate, onWide = frameOn(pos, MID_WIDE, 540, 600, fov);
  // her eyes go to him once she has backed off enough to hold him (head and chest) as he starts to speak
  const k1 = ky(f, [[T_PULL0 + 13, 0], [L1.from + 9, 1]]), k2 = ky(f, [[L1.from + 15, 0], [T_PULL1, 1]]);
  return mixCam(mixCam(onPlate, onHim, k1), onWide, k2);
};
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average, not
 *  the 3 x of a cubic ease) */
const stride = (x: number) => {
  const r = 0.25, v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
const mixCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  const A = C.camAxes(a), B = C.camAxes(b), e = smooth(k);
  const pos = A.p.clone().lerp(B.p, e), dir = A.fwd.clone().lerp(B.fwd, e).normalize(), dist = lerp(A.dist, B.dist, e);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, e) };
};

// ---------------------------------------------------------------------------------------------------- the mic
type Aim = (f: number) => THREE.Vector3;
/** an aim through step keys, each change eased over `len` frames */
const aimThrough = (f: number, keys: [number, Aim][], len = 9) => {
  let i = 0; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  const cur = keys[i][1](f);
  if (i === 0) return cur;
  const k = smooth(clamp01((f - keys[i][0]) / len));
  return k >= 1 ? cur : keys[i - 1][1](f).lerp(cur, k);
};

// ---------------------------------------------------------------------------------------------------- the shot
/** Newton: "focus" while he writes in silence, the flat deadpan on his own (dry) lines; the swaps hide under blinks */
const NEWTON_EXPR: [number, "focus" | "deadpan"][] = [[S.from, "focus"], [L4.from - 4, "deadpan"], [L4.to + 6, "focus"], [L6.from - 4, "deadpan"], [L6.to + 6, "focus"], [L8.from - 4, "deadpan"], [T_UP1 + 6, "focus"]];
const HUMPHREY_EXPR: [number, "neutral" | "smile" | "sigh" | "deadpan"][] = [[S.from, "neutral"], [L1.from - 3, "smile"], [T_SIGH, "sigh"], [T_DZ + 3, "deadpan"], [T_GOB - 2, "sigh"]];

const pose = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "morning");
  w.set.param("door", doorK(f));
  const cam0 = camAt(f);
  w.setCamera(cam0);

  // NEWTON: writing standing at the paper-buried desk; his mouth only on his own lines
  const n: Rig = w.actor(NEWTON_INK);
  const nq = saying("nt", f);
  const up = 1 - writeK(f), ns = nq ? speak(nq, f, 1) : {};
  n.set({
    at: N_AT.clone(), facing: N_FACING, pose: { kind: "idle", t: t + 1.7 }, expr: at(f, NEWTON_EXPR),
    blink: lid(t, 1, swaps(NEWTON_EXPR)), ...ns,
    head: heads(ns.head, accent("nod", f, T_NOT, { amp: 0.5 })),
    lookDown: lerp(44, 4, up), gaze: 0, hands: [quillHand(f), leftHand(f)], hide: NEWTON_HIDE, visible: true,
  });

  // HUMPHREY: the plate, the lid, "Sir, your dinner.", the sigh, out of the door
  const hs = humphreyAt(f);
  let hm: Rig | null = null;
  if (hs) {
    hm = w.actor(HUMPHREY);
    const hq = saying("hm", f);
    // his right hand on the plate's near rim while it comes down, then on the cover's near rim: up, off, carried
    const plateAt = ROOM.plate.clone().add(V(0, plateLift(f), 0));
    const toLid = smooth(clamp01((f - T_SET) / Math.max(1, T_LID - T_SET)));
    const lp = f < T_LID ? null : lidPose(f);
    let right = f < T_LID ? plateAt.clone().add(PLATE_RIM).lerp(LID_RIM_ON, toLid) : lp?.hand ?? null;
    // letting go: the fist lifts off the rim and drops back to his side before the rig takes the arm again
    if (f >= T_FREE && f < T_FREE + 8) {
      const k = (f - T_FREE) / 8, back = rel(hs.at, hs.facing, -0.17, 0.84, 0.12);
      right = k < 0.5 ? LID_DOWN.clone().add(LID_RIM).add(GRIP).lerp(back, smooth(k * 2)) : back.lerp(hang(hs.at, hs.facing, 0), smooth(k * 2 - 1));
    }
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [right, null];
    const ex = at(f, HUMPHREY_EXPR), hsp = hq ? speak(hq, f, 2) : {};
    hm.set({
      at: hs.at, facing: hs.facing, pose: hs.pose, expr: ex, blink: lid(t, 2, swaps(HUMPHREY_EXPR)), ...hsp,
      head: heads(hsp.head, f >= T_SIGH && f < T_SIGH + sec(0.6) ? { dy: -0.06 * Math.sin(Math.PI * (f - T_SIGH) / sec(0.6)) } : undefined),
      lookDown: f < T_TURN0 ? 18 : 0, gaze: f < T_SIGH ? 0.5 : 0, hands, visible: true,
    });
  }

  // the room: the plate (covered, then lifted: steam), the desk's things, the chair aside
  const plateY = hs ? plateLift(f) : 0;
  // the lid's first frame up is the plate's own lid (lifted 3 cm); the loose lid prop takes over from the next
  w.prop("plate").put(ROOM.plate.clone().add(V(0, plateY, 0)), { rot: H0_FACING, lid: f < T_LID ? 1 : f === T_LID ? 0.82 : 0, steam: 1, t });
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: 3 });
  w.prop("chair").put(CHAIR_ASIDE, { rot: ROOM.chairFacing });

  w.update();

  // the held things: his quill, Humphrey's lid
  w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT });
  if (f > T_LID) {
    // the cover in his fist goes where his fist really is (the rig's hand), so it never floats off it
    const L = lidPose(f), o = hm && L.hand && f < T_DOWN ? L.o.clone().add(hm.handWorld(0).sub(L.hand)) : L.o;
    w.prop("lid").put(o, { rot: L.q });
  }

  // HER MIC: in from the lower left toward Humphrey, after him to the door, back to the plate, to Newton, to the
  // drafts, round to the lens on the aside, lowered out of the card's slot under card 2
  const mouth = (r: Rig) => r.headWorld().add(V(0, -0.1, 0));
  const nMouth: Aim = () => mouth(n);
  const hMouth: Aim = (g) => (hm && humphreyAt(g) ? mouth(hm) : eyesOf(LEG_B[1], 1.0));
  const doorway: Aim = () => eyesOf(ROOM.door, 1.0);
  const draftsTop: Aim = () => ROOM.drafts.clone().add(V(0, 0.08, 0));
  // (the door shut, she turns back: the mic goes back to the steaming plate, then over to Newton as she asks 09)
  const plateTop: Aim = () => ROOM.plate.clone().add(V(0, 0.1, 0));
  const aim = aimThrough(f, [[S.from, hMouth], [T_OUT - 6, doorway], [T_BACK0, plateTop], [Math.max(T_BACK1, L3.from + 12), nMouth], [T_DR0, draftsTop], [T_DR1, nMouth]]);
  const enter = Math.min(easeOutCubic(clamp01((f - T_MIC) / 12)), 1 - cardLower(f));
  const M = C.putMic(w, cam0, f, { aim, lens: asideK(f), enter, tilt: ky(f, [[T_DR0, 0], [T_DR0 + 10, 14], [T_DR1, 14], [T_DR1 + 10, 0]]), avoid: f >= CARD2.from && f <= CARD2.to ? SCREEN.card : undefined });

  // the insert: a soft window behind the plate, easing out as she pulls back (her mic's own focus once it is in)
  const soft = 1 - smooth(clamp01((f - T_PULL0) / 14));
  const dof = M.visible && M.dof ? M.dof : soft > 0.02 ? { focus: V(...(cam0.pos as [number, number, number])).distanceTo(ROOM.plate), amount: 5 * soft } : undefined;
  return { camera: cam0, post: dof ? { dof } : undefined, slate: "B" };
};

export const SEG: Segment = { id: "B", from: S.from, to: S.to, enter() {}, exit() {}, pose };

// Segment C (lines 10-13): the banquet. Line 10: the toast, then Fan Zeng's glare (his tag). Line 11: the jade ring
// three times (counted), Xiang Yu drinking and looking anywhere else; the close-up of the man who does not react.
// Line 12: Fan Zeng waves a man in: 项庄 comes through the door, salutes, draws, dances, and the blade drifts toward
// Liu Bang (the idiom stamp). Line 13: the uncle gets up and draws (his own shot, from the east: he is the man who
// sat beside Xiang Yu), comes round his table, beats the blade up and keeps his body in the way.
//
// TWO TRACKS, each a pure function of the frame, shared by every camera that looks at them:
//   feast(w, f)   frames S.from .. line 12 - 1   (shots 10a, 10b, 11 and the close-up 11i)
//   dance(w, f)   line 12 .. S.to                (shots 12a, 12b, 13a = the uncle rises, 13b)
// Every hand that leaves its rest is pinned from where the rig rests it (a first solve of the frame gives that point),
// so pinning and releasing never pops; every hand target is pulled inside the arm's reach (armTo).
// The swords are world props on the solved hands; a blade's direction goes through keys on great-circle arcs (slerp).
// Notes: /home/user/hm_notes/seg_C.md
import * as THREE from "three";
import type { CamPose, Pose, Segment, Vec3 } from "../story";
import { SEGMENTS, cap } from "../story";
import type { World } from "../world";
import { HIT, TAG, TAG_LEN, shot, type ShotDef } from "../beats";
import { DANCE_MARKS, PAD_TOP, type Role } from "../layout";
import { hiltWorld } from "../acc/garb";
import {
  CAMS, FPS, PEOPLE, SEATS, V, accent, at, banquet, cam, camMix, clamp01, easeInOutCubic, easeOutCubic, frag, headPx, heads, hopArc, ky, lerp, lerpA,
  lid, lin, path, rel, salute, seated, smooth, walkAlong, walkTime, yawTo, type PathKey, type Rig, type RigState,
} from "./common";
import { stamp, tag, times } from "../hud";
import { burst, flapLift } from "./segC_ov";

const S = SEGMENTS[2];
const S10a = shot("10a"), S10b = shot("10b"), S11 = shot("11"), S12a = shot("12a"), S12b = shot("12b"), S13 = shot("13");
const slate = (s: ShotDef, what: string) => `${s.id} ${s.place} ${what}`;
type Ex = NonNullable<RigState["expr"]>;
type St = Partial<RigState>;
/** the QA:C lines (heads on screen, cup and jade, blade clearances): only in the offline node run
 *  (/home/user/hm_work/seg/C/off/build.sh sets HM_SEGC_LOG); the previews and the film stay quiet */
const LOG = !!(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.HM_SEGC_LOG;
const log = (f: number, s: string) => { if (LOG) console.log(`QA:C f${f} ${s}`); };
const px = (p: { x: number; y: number }) => `${Math.round((p.x / 1080) * 100)}/${Math.round((p.y / 1920) * 100)}`;

// ------------------------------------------------------------------------------------------------------------ geometry
const floorOf = (p: THREE.Vector3) => V(p.x, 0, p.z);
const P_XY = floorOf(SEATS.xiangyu.top), F_XY = SEATS.xiangyu.facing;
const P_LIU = floorOf(SEATS.liu.top), F_LIU = SEATS.liu.facing;
const P_FZ = floorOf(SEATS.fanzeng.top), F_FZ = SEATS.fanzeng.facing;
const LIU_HEAD = SEATS.liu.head;
/** half the cup's height: a hand grips a cup at its middle; the prop's origin is its foot */
const CUP_H = 0.045;
/** a held cup is gripped by its SIDE: its axis stands GRIP in front of the fist (along the forearm, level), so that
 *  the hand ball sits on the cup's wall. Through the middle of the hand a 10 cm cup swallows the 4.6 cm ball (the hand
 *  vanished into the cup) and its wall cut the wrist. Xiang Yu is drawn 1.14 times, his fist too. */
const GRIP = 0.05, GRIP_XY = 0.062;
/** at the mouth the cup is brought this far toward the lens along the line of sight: on screen it stays on the drawn
 *  mouth (the face is drawn turned to the camera), in 3D it comes off the head, the beard and the shoulder guards */
const MOUTH_OUT = 0.06;
/** the cup's foot in the hand that holds it this frame (after the solve) */
const cupIn = (r: Rig, i: 0 | 1, g = GRIP) => { const h = r.handWorld(i), d = h.clone().sub(r.elbowWorld(i)).setY(0), l = d.length(); if (l > 1e-4) h.addScaledVector(d, g / l); return h.add(V(0, -CUP_H, 0)); };
/** where a hand goes so that the middle of the cup it holds comes to m (the forearm's level direction is taken as the
 *  one from the shoulder to m) */
const gripFor = (m: THREE.Vector3, shoulder: THREE.Vector3, g = GRIP) => { const d = m.clone().sub(shoulder).setY(0); return d.lengthSq() > 1e-8 ? m.clone().addScaledVector(d.normalize(), -g) : m.clone(); };
type Arm = { sx: number; sy: number; r: number };
/** shoulders and reach: standing; seated on the floor seats; Xiang Yu seated (he is drawn 1.14 times the others) */
const STAND: Arm = { sx: 0.17, sy: 0.98, r: 0.345 }, SIT: Arm = { sx: 0.17, sy: 0.57, r: 0.34 }, SIT_XY: Arm = { sx: 0.19, sy: 0.64, r: 0.38 };
/** a hand target given in a figure's own frame (x = to its left, y up from the floor, z = forward), pulled inside
 *  the reach of that arm's shoulder: a pinned hand always arrives */
const armTo = (p: THREE.Vector3, facing: number, arm: 0 | 1, x: number, y: number, z: number, A: Arm = STAND) => {
  const sx = (arm ? 1 : -1) * A.sx, d = V(x - sx, y - A.sy, z), l = d.length();
  if (l > A.r) d.multiplyScalar(A.r / l);
  return rel(p, facing, sx + d.x, A.sy + d.y, d.z);
};
/** a WORLD point pulled inside the reach of that figure's arm (a hilt at the hip is lower than a hand goes) */
const within = (p: THREE.Vector3, yaw: number, arm: 0 | 1, q: THREE.Vector3, A: Arm = STAND) => {
  const d = q.clone().sub(p), c = Math.cos(yaw), sn = Math.sin(yaw);
  return armTo(p, yaw, arm, d.x * c - d.z * sn, d.y, d.x * sn + d.z * c, A);
};
/** a direction given in a figure's own frame -> world */
const toWorld = (yaw: number, x: number, y: number, z: number) => V(Math.cos(yaw) * x + Math.sin(yaw) * z, y, -Math.sin(yaw) * x + Math.cos(yaw) * z);
/** a blade direction in its holder's frame: az degrees (0 = straight ahead, + = to his left), el degrees up */
const aim = (az: number, el: number): Vec3 => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180; return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)]; };
/** from one direction to another along the great circle: a blade swings in an arc */
const slerp = (a: THREE.Vector3, b: THREE.Vector3, t: number) => {
  const om = Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
  if (om < 1e-4 || om > Math.PI - 1e-3) return a.clone().lerp(b, t).normalize();
  const s = Math.sin(om);
  return a.clone().multiplyScalar(Math.sin((1 - t) * om) / s).addScaledVector(b, Math.sin(t * om) / s).normalize();
};
/** the scabbard's axis in its wearer's frame, mouth -> tip (acc/garb.ts swordBelt, right hip) */
const SCAB: Vec3 = [-0.12, -0.8, -0.585];
/** a draw: how far the hand is from the hilt, up the scabbard's axis, on the first three frames the sword is in it.
 *  The first is already the blade's length less the grip: its point is at the scabbard's mouth. garb.ts's scabbard is
 *  0.44 m long and 4.3 x 6 cm across, the blade 0.80 m long and 5.6 cm wide: a blade shown part-way in it (0.3 m out,
 *  before) had its point out beyond the chape and its edges through the scabbard's sides. */
const DRAW = [0.74, 0.8, 0.86];
type Ease = (x: number) => number;
/** hand keys: [frame, a point in the holder's own frame | a world point, ease of the leg that arrives] */
type HK = [number, Vec3 | THREE.Vector3, Ease?];
/** blade keys: [frame, a direction in the holder's own frame | a world direction, ease] */
type BK = [number, Vec3 | THREE.Vector3, Ease?];
const handAt = (f: number, keys: HK[], p: THREE.Vector3, yaw: number, arm: 0 | 1, A: Arm = STAND) =>
  path(f, keys.map(([k, v, e]) => [k, v instanceof THREE.Vector3 ? v : armTo(p, yaw, arm, v[0], v[1], v[2], A), e] as PathKey));
const bladeAt = (f: number, keys: BK[], yaw: number) => {
  const W = (v: Vec3 | THREE.Vector3) => (v instanceof THREE.Vector3 ? v.clone().normalize() : toWorld(yaw, v[0], v[1], v[2]).normalize());
  if (f <= keys[0][0]) return W(keys[0][1]);
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return slerp(W(keys[i - 1][1]), W(keys[i][1]), (keys[i][2] ?? smooth)(lin(f, keys[i - 1][0], keys[i][0])));
  return W(keys[keys.length - 1][1]);
};
/** steps: [first frame, last frame, to]: a light hop from where the figure stands to `to` */
type Step = [number, number, THREE.Vector3];
const stepAt = (f: number, from: THREE.Vector3, steps: Step[], hgt = 0.035) => {
  let p = from;
  for (const [f0, f1, to] of steps) { if (f >= f1) { p = to; continue; } if (f > f0) return hopArc(p, to, smooth(lin(f, f0, f1)), hgt); break; }
  return p.clone();
};
const sq = (x: number) => x * x;
const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
const moved = (c: CamPose, k: number): CamPose => { const p = c.pos as Vec3, l = c.look as Vec3; return { ...c, pos: [lerp(p[0], l[0], k), lerp(p[1], l[1], k), lerp(p[2], l[2], k)] }; };

// ------------------------------------------------------------------------------------------------------------ beats
const N11 = HIT.noReaction;
const T = {
  // ---- line 10, the toast (master)
  xyUp: S10a.from + 4, xyTop: S10a.from + 11, liuUp: S10a.from + 9, liuTop: S10a.from + 16,
  sip: S10a.from + 23, sipAt: S10a.from + 28, sipEnd: S10a.from + 37, cupDown: S10a.from + 44,
  // ---- line 10, Fan Zeng (jadeIn): his hand goes to the jade at his belt after 必须死, takes it off (lift), brings it
  // out in front of him; on the cut to line 11 it is the big ring of the raises
  grab: HIT.mustDie + 8, lift: HIT.mustDie + 10,
  // ---- line 11: Xiang Yu's second and third drink
  jadeOut: S11.from - 1,
  xy2Up: S11.from + 3, xy2Sip: S11.from + 11, xy2SipEnd: S11.from + 24, xy2Chest: S11.from + 31,
  away: cap(11, 1).from,
  xy3Up: N11 - 5, xy3Sip: N11 + 3, xy3SipEnd: N11 + 11, xy3Chest: N11 + 17,
  xyPut: S12a.from + 3,
  // ---- line 12, first half (master): the dancer is in the doorway on the first frame
  in0: S12a.from - 10,
};
/** the three raises of the jade; the ring is drawn a little larger than life (it is the subject of line 11) */
const JADE = HIT.jade, JADE_SC = 1.2;
/** the jade while it comes off the belt (line 10, from T.lift to the cut): the size of the belt's pendant (garb.ts
 *  pendant: a ring 7.4 cm across; the prop is 17.4 cm), hanging from the hand with its ring where the pendant's was.
 *  It becomes the big ring of line 11 on the cut (a cut hides the change of size; see seg_C.md) */
const PEND_SC = 0.425, PEND_DROP = 0.09;
/** Fan Zeng's left fist between the raises, and from the end of line 11 to the end of the segment: he keeps the ring
 *  in his fist in front of him (it stood back on his belt from line 12 on, 0.9 s after the third raise, with nobody
 *  seeing him put it back). His beard hangs to y 0.40 over his left side (x 0.12 .. 0.24, z < 0.2): the ring on this
 *  fist is in front of it and above the table */
const FZ_LOW = armTo(P_FZ, F_FZ, 1, 0.2, 0.44, 0.32, SIT);
/** the big ring standing on Fan Zeng's left fist, its face to the camera; the prop's +y is "up the cord": turned down,
 *  the cord hangs under the hand */
const putJade = (w: World, FZ: Rig) => { const at = FZ.handWorld(1).add(V(0, 0.075 * JADE_SC + 0.012, 0)); w.prop("jade").put(at, { up: [0, -1, 0], face: w.camera.position.clone().sub(at).setY(0).normalize(), scale: JADE_SC }); return at; };

// ====================================================================================================== lines 10-11
/** the shoulders of the two cup arms (Xiang Yu's left, Liu Bang's right) */
const SH_XY = rel(P_XY, F_XY, SIT_XY.sx, SIT_XY.sy, 0), SH_LIU = rel(P_LIU, F_LIU, -SIT.sx, SIT.sy, 0);
/** Xiang Yu's cup hand (his left: the cup stands on his left) for the whole segment, and his cup. `rest` = where the
 *  rig rests that hand this frame, `lips` = the cup's middle at his mouth this frame (mouthCup). Every place below is
 *  where the CUP's middle goes; the hand holds it by the side (gripFor). The cup at his chest stands well in front of
 *  his left shoulder guard (at 0.2 / 0.72 / 0.23 it was 4 cm inside it). */
function hostCup(w: World, f: number, XY: Rig, rest: THREE.Vector3, lips: THREE.Vector3) {
  const C = SEATS.xiangyu.cup, H = (m: THREE.Vector3) => within(P_XY, F_XY, 1, gripFor(m, SH_XY, GRIP_XY), SIT_XY);
  const grip = H(C.clone().add(V(0, CUP_H, 0)));
  const toast = H(rel(P_XY, F_XY, 0.36, 0.84, 0.3)), chest = H(rel(P_XY, F_XY, 0.14, 0.68, 0.36));
  lips = H(lips);
  const active = (f > T.xyUp - 3 && f < T.cupDown + 2) || (f > T.xy2Up - 3 && f < T.xyPut + 4);
  if (!active) return { hand: null as THREE.Vector3 | null, held: 0, C };
  const swirl = V(0.012 * Math.sin(f * 0.9), 0, 0.012 * Math.cos(f * 0.9)).multiplyScalar(lin(f, JADE[2] - 4, JADE[2]) * (1 - lin(f, T.xy3Up - 3, T.xy3Up)));
  const hand = path(f, [
    [T.xyUp - 3, rest], [T.xyUp + 2, grip], [T.xyTop, toast, easeOutCubic], [T.sip, toast], [(T.sip + T.sipAt) / 2, roundHead(XY, toast, lips, 0.42), sq], [T.sipAt, lips, easeOutQuad], [T.sipEnd, lips], [T.cupDown - 2, grip], [T.cupDown + 2, rest],
    [T.xy2Up - 3, rest], [T.xy2Up + 2, grip], [T.xy2Sip, lips], [T.xy2SipEnd, lips], [T.xy2Chest, chest], [T.xy3Up, chest], [T.xy3Sip, lips], [T.xy3SipEnd, lips],
    [T.xy3Chest, chest], [T.xyPut - 5, chest], [T.xyPut, grip], [T.xyPut + 4, rest],
  ]).add(swirl);
  const held = Math.max(smooth(lin(f, T.xyUp, T.xyUp + 3)) * (1 - smooth(lin(f, T.cupDown - 3, T.cupDown))), smooth(lin(f, T.xy2Up, T.xy2Up + 3)) * (1 - smooth(lin(f, T.xyPut - 2, T.xyPut + 1))));
  return { hand, held, C };
}
/** the cup's place at a drinker's mouth: against the lower front of the head as this camera sees the face (k = the
 *  figure's scale) */
const lipsOf = (r: Rig, k = 1, front = 0) => { const a = lerpA(r.faceYaw, r.bodyYaw, front); return r.headWorld().add(V(Math.sin(a) * 0.8, -0.62, Math.cos(a) * 0.8).normalize().multiplyScalar(0.245 * k + 0.075)); };
/** the cup's middle at the mouth for THIS camera: lipsOf brought MOUTH_OUT toward the lens along the line of sight */
const mouthCup = (w: World, r: Rig, k = 1, front = 0) => { const m = lipsOf(r, k, front); return m.addScaledVector(w.camera.position.clone().sub(m).normalize(), MOUTH_OUT); };
/** Xiang Yu's: turned a fifth of the way from his drawn face toward his body's front. From the master (58 degrees to
 *  his left) the mouth's line of sight runs over his raised left shoulder guard: there the cup sat 4-7 cm inside it.
 *  On screen this is about 43 px toward his front (the cup itself is about 40 px wide there); from the frontal cameras of
 *  lines 11 / 11i face and body agree and nothing moves */
const XY_MOUTH_FRONT = 0.3;
/** halfway from a point beside the head to the mouth, round the head instead of across the face: the middle of the
 *  two pushed out to `r` from the head's centre */
const roundHead = (r: Rig, a: THREE.Vector3, b: THREE.Vector3, rad: number) => { const c = r.headWorld(), m = a.clone().lerp(b, 0.5).sub(c); return c.add(m.multiplyScalar(Math.max(1, rad / Math.max(1e-4, m.length())))); };

/** THE FEAST (lines 10 and 11) for any camera. Returns what the overlays need. */
function feast(w: World, f: number, o: { who?: Role[] } = {}) {
  const t = f / FPS, XY = w.actor(PEOPLE.xiangYu), LIU = w.actor(PEOPLE.liuBang), FZ = w.actor(PEOPLE.fanZeng);
  const jadeCam = f >= S10b.from && f < N11;
  // ---- faces
  const sipXY = Math.max(lin(f, T.sipAt - 3, T.sipAt) * (1 - lin(f, T.sipEnd, T.sipEnd + 3)), lin(f, T.xy2Sip - 3, T.xy2Sip) * (1 - lin(f, T.xy2SipEnd, T.xy2SipEnd + 3)), lin(f, T.xy3Sip - 3, T.xy3Sip) * (1 - lin(f, T.xy3SipEnd, T.xy3SipEnd + 3)));
  const sipLiu = lin(f, T.sipAt - 1, T.sipAt + 2) * (1 - lin(f, T.sipEnd, T.sipEnd + 3));
  const EXY: [number, Ex][] = [[0, "smile"], [T.cupDown, "smile_closed"], [T.xy3SipEnd + 1, "relief"]];
  const studies = smooth(lin(f, T.xy2Chest - 2, T.xy2Chest + 4)) * (1 - smooth(lin(f, T.away - 3, T.away + 2)));
  const awayK = smooth(lin(f, T.away - 2, T.away + 4)) * (1 - smooth(lin(f, T.xy3Up - 2, T.xy3Up + 2)));
  const xy: St = {
    expr: at(f, EXY), blink: sipXY > 0.5 ? 1 : lid(t, 4, [T.cupDown / FPS, (T.xy3SipEnd + 1) / FPS]),
    gaze: f < T.cupDown ? (sipXY > 0.5 ? 0 : -1) : awayK > 0.5 ? -1 : 0,
    lookDown: 12 * studies, head: heads({ dy: 0.03 * sipXY, tilt: -3 * sipXY }, { dx: -0.07 * awayK, tilt: -4 * awayK }, f >= T.xy3SipEnd ? { dy: -0.04 * smooth(lin(f, T.xy3SipEnd, T.xy3SipEnd + 6)) * (1 - smooth(lin(f, T.xy3SipEnd + 8, T.xy3SipEnd + 14))) } : undefined),
    armFront: [undefined, true],
  };
  const liu: St = {
    expr: at(f, [[0, "smile"], [T.cupDown - 4, "neutral"]] as [number, Ex][]), blink: sipLiu > 0.5 ? 1 : lid(t, 1), gaze: sipLiu > 0.5 ? 0 : f < T.cupDown ? 1 : 0,
    head: { dy: 0.03 * sipLiu, tilt: 3 * sipLiu }, armFront: [true, undefined],
  };
  // Fan Zeng: the glare at Liu Bang (screen left from the east cameras), harder on 必须死; then one glance at Xiang Yu
  // (also screen left) with every raise, his eyes on the jade between them
  const EFZ: [number, Ex][] = [[0, "stern"], [HIT.mustDie, "huff"], [S11.from + 2, "stern"], [JADE[2] - 3, "huff"]];
  const sink = smooth(lin(f, cap(10, 2).from, cap(10, 2).from + 8));
  const raiseK = (i: number) => smooth(lin(f, JADE[i] - 4, JADE[i])) * (1 - smooth(lin(f, JADE[i] + (i === 2 ? N11 - JADE[2] : 9), JADE[i] + (i === 2 ? N11 - JADE[2] + 6 : 14))));
  const glance = Math.max(raiseK(0), raiseK(1), raiseK(2));
  const fz: St = jadeCam ? {
    expr: at(f, EFZ), blink: lid(t, 6, [HIT.mustDie / FPS]), gaze: f < S11.from ? -1 : glance > 0.3 ? -1 : 0,
    head: heads({ dy: -0.1 * sink * (1 - lin(f, S11.from, S11.from + 8)) }, accent("pop", f, HIT.mustDie), accent("jolt", f, JADE[0], { amp: 0.5 }), accent("jolt", f, JADE[1], { amp: 0.75 }), accent("jolt", f, JADE[2], { amp: 1 }),
      // he cranes back from the ring he holds up (it stays clear of his own face) and tips his head at Xiang Yu
      { dx: 0.05 * glance, tilt: -4 * glance }),
    hide: f >= T.lift ? ["pendant"] : undefined,
  } : f >= T.lift ? { hide: ["pendant"] } : {};
  const uncle: St = { gaze: f < T.cupDown ? -1 : 0 };
  banquet(w, f, { in: o.who, cups: ["zhang", "fankuai", "uncle", "fanzeng"], extra: { xiangyu: xy, liu, fanzeng: fz, uncle } });
  w.update();                                                              // first solve: the resting hands, the heads
  // ---- the cups
  const hc = hostCup(w, f, XY, XY.handWorld(1), mouthCup(w, XY, 1.14, XY_MOUTH_FRONT));
  if (hc.hand) XY.set({ hands: [null, hc.hand] });
  let liuHand: THREE.Vector3 | null = null, liuHeld = 0;
  const LC = SEATS.liu.cup;
  if (f > T.liuUp - 3 && f < T.cupDown + 1) {
    const H = (m: THREE.Vector3) => within(P_LIU, F_LIU, 0, gripFor(m, SH_LIU), SIT);
    const rest = LIU.handWorld(0), grip = H(LC.clone().add(V(0, CUP_H, 0))), toast = H(rel(P_LIU, F_LIU, -0.32, 0.8, 0.28)), lips = H(mouthCup(w, LIU));
    liuHand = path(f, [[T.liuUp - 3, rest], [T.liuUp + 2, grip], [T.liuTop, toast, easeOutCubic], [T.sip + 1, toast], [(T.sip + T.sipAt + 3) / 2, roundHead(LIU, toast, lips, 0.36), sq], [T.sipAt + 2, lips, easeOutQuad], [T.sipEnd, lips], [T.cupDown - 3, grip], [T.cupDown + 1, rest]]);
    liuHeld = smooth(lin(f, T.liuUp, T.liuUp + 3)) * (1 - smooth(lin(f, T.cupDown - 4, T.cupDown - 1)));
    LIU.set({ hands: [liuHand, null] });
  }
  // ---- the jade: Fan Zeng's LEFT hand (the pendant hangs at his left hip; that hand is the one this camera sees).
  // He pinches the ring at its rim and holds it UP on his fist (the cord hangs down past the hand): hung from its cord
  // under the hand it would only reach his chest (a seated arm is short, the head is big), and the raise would not
  // read. Between the raises the fist is down at his belly behind the table edge; every raise brings the ring up
  // beside his chin, toward Xiang Yu
  // The way it comes out (his own frame; measured with the clearance checker's probe): his long beard hangs to y 0.40
  // and, turned with the drawn face to these cameras on his left, lies over his left side (x 0.12 .. 0.24, z < 0.2);
  // the table top is at y 0.30 .. 0.34 from z 0.26. So: the hand takes the cord of the pendant at his left hip
  // (garb.ts pendant: x 0.13, top y 0.29, z 0.08), draws it forward UNDER the beard and behind the table edge, lifts it
  // in front of the beard, and holds the fist at J_LOW (the ring on it clear in front of the beard) until the raises.
  // (Before: the hand went 25 cm away from the pendant to the middle of the belt, the pendant vanished from the hip
  // and the ring appeared in the hand, inside the beard: 8 cm, then 2 cm on each way down.)
  let jadeHand: THREE.Vector3 | null = null;
  const UPJ = [0, 1, 2].map((i) => armTo(P_FZ, F_FZ, 1, 0.24, 0.62 + 0.02 * i, 0.33, SIT));
  const J_LOW = FZ_LOW;
  if (f > T.grab - 6) {
    const A = (x: number, y: number, z: number) => armTo(P_FZ, F_FZ, 1, x, y, z, SIT);
    // (back from the table edge first; the fist ends a little higher than J_LOW so that the small ring hanging under it
    // clears the table top; on the cut the ring stands on the fist)
    const rest = FZ.handWorld(1), back = A(0.1, 0.38, 0.17), cord = A(0.13, 0.31, 0.08), under = A(0.15, 0.31, 0.21), front = A(0.16, 0.45, 0.21), out = A(0.18, 0.47, 0.3);
    const keys: PathKey[] = [[T.grab - 6, rest], [T.grab - 3, back], [T.grab, cord], [T.lift, cord], [T.lift + 2, under], [T.lift + 5, front], [T.jadeOut, out]];
    for (let i = 0; i < 3; i++) {
      keys.push([JADE[i] - 5, J_LOW], [JADE[i], UPJ[i], easeOutCubic]);
      if (i < 2) keys.push([JADE[i] + 9, UPJ[i]], [JADE[i] + 14, J_LOW]);
    }
    keys.push([N11 - 1, UPJ[2]], [N11 + 8, J_LOW]);   // (in 11i, out of the frame, the third raise comes down)
    jadeHand = path(f, keys);
    // the shake at the top of each raise: harder every time; the third goes on until the cut
    for (let i = 0; i < 3; i++) {
      const u = f - JADE[i], len = i === 2 ? N11 - JADE[2] : 9;
      if (u > 0 && u <= len) jadeHand.add(V(0, (0.012 + 0.007 * i) * Math.sin(u * 2.1) * (i === 2 ? 1 : 1 - u / len), 0));
    }
    FZ.set({ hands: [null, jadeHand] });
  }
  w.update();
  // ---- props on the solved hands
  const xyCup = hc.hand ? hc.C.clone().lerp(cupIn(XY, 1, GRIP_XY), hc.held) : hc.C;
  w.prop("cup:xiangyu").put(xyCup);
  w.prop("cup:liu").put(liuHand ? LC.clone().lerp(cupIn(LIU, 0), liuHeld) : LC);
  let jadeAt: THREE.Vector3 | null = null;
  if (jadeHand && f >= T.lift) {
    const hnd = FZ.handWorld(1);
    if (f < S11.from) {
      // off the belt: hanging from the cord in his hand, the pendant's size
      jadeAt = hnd.clone().add(V(0, -PEND_DROP, 0));
      w.prop("jade").put(jadeAt, { up: [0, 1, 0], face: w.camera.position.clone().sub(jadeAt).setY(0).normalize(), scale: PEND_SC });
    } else jadeAt = putJade(w, FZ);
  }
  if (LOG) {
    const cupD = xyCup.clone().add(V(0, CUP_H, 0)).distanceTo(XY.headWorld());
    log(f, `feast xy ${px(w.project(XY.headWorld()))} liu ${px(w.project(LIU.headWorld()))} fz ${px(w.project(FZ.headWorld()))} xyCup-head ${cupD.toFixed(2)}${jadeAt ? ` jade ${px(w.project(jadeAt))} y ${jadeAt.y.toFixed(2)}` : ""} yaw fz ${FZ.bodyYaw.toFixed(2)}/${FZ.faceYaw.toFixed(2)} xy ${XY.bodyYaw.toFixed(2)}/${XY.faceYaw.toFixed(2)} liu ${LIU.bodyYaw.toFixed(2)}`);
  }
  return { XY, LIU, FZ, jadeAt, UPJ };
}

// layout's master looking 15 cm further east: Xiang Yu's head comes out from under the button column (from CAMS.master
// it ends at 92 % of the width); a slow push toward the two cups
const MASTER = cam(CAMS.master.pos as Vec3, [(CAMS.master.look as Vec3)[0] + 0.15, (CAMS.master.look as Vec3)[1], (CAMS.master.look as Vec3)[2]], CAMS.master.fov);
const M_OUT = moved(MASTER, -0.04), M_IN = moved(MASTER, 0.03);
/** 10a: the master, a slow push toward the two cups. The door cloth of segment B's wipe is rolled up off the frame. */
function shot10a(w: World, f: number): Pose {
  const c = camMix(M_OUT, M_IN, easeInOutCubic(lin(f, S10a.from, S10a.to + 1)));
  w.setPlace("tent"); w.setCamera(c);
  feast(w, f);
  return { camera: c, overlays: flapLift(easeOutCubic(lin(f, S10a.from - 1, S10a.from + 5))), slate: slate(S10a, "master: the toast") };
}
// layout's jadeIn tripod, tilted down a little and pulled back: Fan Zeng's chin stays above the caption band and his
// name plate has room above his head under the source tag; it creeps in to JI2
const JIL = cam(CAMS.jadeIn.pos as Vec3, [(CAMS.jadeIn.look as Vec3)[0], (CAMS.jadeIn.look as Vec3)[1] - 0.06, (CAMS.jadeIn.look as Vec3)[2]], CAMS.jadeIn.fov);
const JI = moved(JIL, -0.27), JI2 = moved(JIL, -0.1);
/** layout's jade two-shot looking 10 cm lower and 7 cm further south: the ring is clear above the caption band and
 *  Xiang Yu's whole head is inside the left edge */
const JADE2 = cam(CAMS.jade.pos as Vec3, [(CAMS.jade.look as Vec3)[0], (CAMS.jade.look as Vec3)[1] - 0.1, (CAMS.jade.look as Vec3)[2] - 0.07], CAMS.jade.fov);
const camFZ = (f: number): CamPose => camMix(JI, JI2, 0.55 * easeOutCubic(lin(f, S10b.from, HIT.mustDie - 6)) + 0.45 * easeOutCubic(lin(f, HIT.mustDie, HIT.mustDie + 4)));
/** 10b: Fan Zeng alone, glaring at Liu Bang: a slow creep in, a punch on 必须死 */
function shot10b(w: World, f: number): Pose {
  const c = camFZ(f);
  w.setPlace("tent"); w.setCamera(c);
  const R = feast(w, f);
  // the plate is pinned above his head (a free placement could change sides while the camera creeps)
  const ov = tag({ f, who: "fanZeng", at: headPx(w, R.FZ), from: TAG.fanZeng, len: TAG_LEN, side: "up" });
  return { camera: c, overlays: ov, slate: slate(S10b, "jadeIn: the glare") };
}
/** 11: the same tripod eases back to the two-shot: the jade three times, Xiang Yu drinking */
function shot11(w: World, f: number): Pose {
  const c = camMix(JI2, JADE2, easeInOutCubic(lin(f, S11.from, S11.from + 16)));
  w.setPlace("tent"); w.setCamera(c);
  const R = feast(w, f);
  // the count stands beside the top of the raises, on the free side of the hand (between the two heads, under Xiang
  // Yu's): one place for all three, so that only the number changes
  const q = w.project(R.UPJ[2].clone().add(V(0, 0.075 * JADE_SC, 0)));
  const ov = times({ f, hits: JADE.map((j) => j + 1), out: N11 - 5, x: Math.max(150, q.x - 155), y: Math.max(300, q.y) });
  return { camera: c, overlays: ov, slate: slate(S11, "jadeIn>jade: the jade x3") };
}
/** 11i: 项羽【没反应】: the man himself, frontal, drinking: a still frame for the joke (a very slow creep) */
const XY_CU0 = cam([-1.75, 1.5, 0.1], [1.15, 0.8, 0.44], 35), XY_CU1 = cam([-1.62, 1.47, 0.12], [1.15, 0.8, 0.44], 35);
function shot11i(w: World, f: number): Pose {
  const c = camMix(XY_CU0, XY_CU1, easeOutCubic(lin(f, N11, S12a.from)));
  w.setPlace("tent"); w.setCamera(c);
  feast(w, f, { who: ["liu", "xiangyu", "uncle", "fanzeng"] });       // Zhang Liang's cap stands right under this lens
  return { camera: c, slate: slate(S11, "xy: no reaction") };
}

// ====================================================================================================== lines 12-13
// ---- the floor
/** layout's DANCE_MARKS.dancer, 4 cm east: on the mark itself his skirt sat in Zhang Liang's table leg */
const D0 = DANCE_MARKS.dancer.clone().add(V(0.04, 0, 0));
/** the way in: through the MIDDLE of the doorway (layout ENTER.path runs 0.21 m from the door post: a head is 0.47 m
 *  wide), then layout's pocket beside Liu Bang's pad and the corner gap onto the floor. The pocket keys sit 6 cm
 *  further east than before and the last two 0.1 m further north, so the robe hem clears Liu Bang's pad and Zhang
 *  Liang's table leg (the old route went into both); SQUEEZE below turns his shoulder through the corner gap */
const PATH_IN = [V(-0.15, 0, -3.1), V(-0.15, 0, -2.45), V(-0.36, 0, -2.0), V(-0.44, 0, -1.2), V(-0.34, 0, -0.88), V(-0.2, 0, -0.55), D0];
const WSP = 2.8;
/** through the 0.38 m gap between Fan Kuai's table and Liu Bang's he turns his shoulder (SQUEEZE rad to his right
 *  of the way he walks, while his feet are between z -1.0 and 0.3): a straight-on walker's scabbard (garb.ts: its tip
 *  0.25 m to his right and 0.28 m behind, at the floor) swept through the south-east leg and the edge of Fan Kuai's
 *  table (2.5 cm) and its north-east leg (1.3 cm); turned, it trails behind him past them */
const SQUEEZE = -0.35, SQ_Z = [-1.0, -0.85, 0.0, 0.3];
const squeezeK = (p: THREE.Vector3) => smooth(lin(p.z, SQ_Z[0], SQ_Z[1])) * (1 - smooth(lin(p.z, SQ_Z[2], SQ_Z[3])));
const F_SAL = yawTo(D0, P_XY);
/** the dancer's marks: he lunges from D0 to D1 (through DM), is beaten back to D2, feints left (DL) and right (DR) */
const D1 = V(-0.3, 0, 0), DM = D0.clone().lerp(D1, 0.5), D2 = V(-0.4, 0, 0.36), DL = V(-0.48, 0, 0.26), DR = V(-0.28, 0, 0.4);
/** the uncle: he rises and draws at his seat, hurries round his table's north end to U0, EAST of the blade (from the
 *  dance camera every place west of the blade is in front of Liu Bang: he only passes there), beats the blade up from
 *  there, and goes on onto the line between the dancer and Liu Bang (UM, U; then UL / UR with every feint).
 *  The way round (measured with the clearance checker; his walking robe is 0.44-0.46 m across at the hem, 0.36 at the
 *  table tops): up off his pad east of his table, then WEST exactly down the middle between the legs of his table
 *  (z -0.29) and of Xiang Yu's (z 0.19), a gap of 0.43 m between the legs: the hem passes them by 0.5 cm or less. U0 is
 *  clear of both tables (layout unclePath's (1.25, -0.05) -> (0.62, -0.12) ran 5 cm from his table: the robe went 5-7 cm
 *  through its top and its north-west leg). UL is a little nearer the dancer than the others (0.52 of the way to Liu
 *  Bang, not 0.57): at 0.57 his robe went 3 cm into the north-west leg of Liu Bang's table. */
const U0 = V(0.5, 0, -0.15);
const onLine = (d: THREE.Vector3, k = 0.5) => floorOf(d.clone().lerp(LIU_HEAD, k));
const U = onLine(D2, 0.57), UL = onLine(DL, 0.52), UR = onLine(DR, 0.57), UM = U0.clone().lerp(U, 0.5);
/** he rises with a little push back from his table (RISE_BACK, see dance()); standing, he is on his pad (PAD_TOP) */
const RISE_BACK = 0.08;
const U_UP = rel(floorOf(SEATS.uncle.top), SEATS.uncle.facing, 0, 0, -RISE_BACK).setY(PAD_TOP);
const UPATH = [U_UP, V(1.3, 0, -0.14), V(1.1, 0, -0.04), V(0.64, 0, -0.04), U0];
/** he hurries (the way round is 1.34 m; he must be at U0 one frame before the clang) */
const USP = 2.4;
/** and his hands come up off his lap as he rises (out, up, a little forward of where the rig rests them): resting,
 *  they went 2-3 cm into the robe while it changed from the lap to the standing skirt */
const RH = [0.06, 0.05, 0.04];
const RISE_HAND = (i: 0 | 1, yaw: number, f: number) => toWorld(yaw, (i ? 1 : -1) * RH[0], RH[1], RH[2]).multiplyScalar(smooth(lin(f, K.uRise - 2, K.uRise + 1)) * (1 - smooth(lin(f, K.uStand, K.uStand + 5))));
/** the cut from the uncle's own shot back to the dance camera */
const C13B = cap(13, 1).from + 2;
const K0 = S12b.from;
const K = {
  arr: T.in0 + Math.ceil(walkTime(PATH_IN, WSP) * FPS) + 1,
  hilt: S12a.to - 3,
  // 12b: the draw is under way on the first frame
  turn0: K0 + 14, turn1: K0 + 24,
  // the uncle (shot 13a): he is rising on the cut, his hand goes to the hilt, he glares, draws, and sets off so that
  // he reaches U0 one frame before the blades meet
  uRise: S13.from - 2, uStand: S13.from + 4, uGrip: S13.from + 5, uDraw: S13.from + 9,
  uGo: C13B + 9 - 1 - Math.ceil(walkTime(UPATH, USP) * FPS),
  clang: C13B + 9,
  wing: HIT.shield13, f1: HIT.shield13 + 7, f2: HIT.shield13 + 21,
  flapShut0: S12a.from + 14, flapShut1: S12a.from + 26,
};
const D_STEPS: Step[] = [[K0 + 24, K0 + 30, DM], [C13B - 1, C13B + 5, D1], [K.clang + 1, K.clang + 8, D2], [K.f1 - 1, K.f1 + 5, DL], [K.f2 - 1, K.f2 + 5, DR]];
const U_STEPS: Step[] = [[K.clang + 1, K.clang + 5, UM], [K.clang + 5, K.clang + 9, U], [K.f1 + 1, K.f1 + 6, UL], [K.f2 + 1, K.f2 + 6, UR]];
const posD = (f: number) => stepAt(f, D0, D_STEPS);
const posU = (f: number) => stepAt(f, U0, U_STEPS);
const F_LIU_D = (p: THREE.Vector3) => yawTo(p, LIU_HEAD);
const facD = (f: number) => lerpA(F_SAL, F_LIU_D(posD(f)), smooth(lin(f, K.turn0, K.turn1)));
// ---- the dancer's sword hand and blade (his own frame). After the draw: up to the salute over his head, the arc
// across the front, the wind-up while he turns, the thrust at Liu Bang; beaten up; guard; the circle and the cut that
// the uncle's guard stops; the two feints
const DH: HK[] = [
  [K0 + 3, [-0.22, 0.98, 0.3]], [K0 + 8, [-0.3, 1.22, 0.14]], [K0 + 12, [-0.15, 1.2, 0.3]], [K0 + 15, [-0.05, 1.12, 0.32]], [K0 + 18, [-0.2, 1.25, 0.28]], [K0 + 22, [-0.3, 1.05, 0.1]], [K0 + 30, [-0.14, 1.0, 0.33], sq],
  [K.clang, [-0.14, 1.0, 0.33]], [K.clang + 3, [-0.22, 1.14, 0.2], easeOutCubic], [K.clang + 12, [-0.2, 1.0, 0.24]],
  [K.f1 - 5, [-0.2, 1.0, 0.24]], [K.f1 - 1, [-0.2, 1.0, 0.3]], [K.f1 + 4, [-0.1, 1.05, 0.3], sq], [K.f1 + 6, [-0.1, 1.05, 0.3]], [K.f1 + 9, [-0.26, 1.2, 0.16]],
  [K.f2 - 3, [-0.2, 1.12, 0.3]], [K.f2 + 1, [-0.12, 1.05, 0.28]], [K.f2 + 4, [-0.1, 1.05, 0.3], sq], [K.f2 + 9, [-0.1, 1.05, 0.3]], [K.f2 + 16, [-0.2, 1.0, 0.2]],
];
const DB: BK[] = [
  [K0 + 2, SCAB], [K0 + 3, aim(-5, -75)], [K0 + 5, aim(-10, 40)], [K0 + 8, aim(-60, 80)], [K0 + 12, aim(0, 60)], [K0 + 15, aim(70, 20)], [K0 + 18, aim(-10, 85)], [K0 + 22, aim(-100, 30)], [K0 + 30, aim(-4, -8), sq],
  [K.clang, aim(-4, -8)], [K.clang + 3, aim(25, 58), easeOutCubic], [K.clang + 12, aim(0, 65)],
  [K.f1 - 5, aim(0, 65)], [K.f1 - 1, aim(50, 60)], [K.f1 + 4, aim(42, -4), sq], [K.f1 + 6, aim(42, -4)], [K.f1 + 9, aim(0, 80)],
  [K.f2 - 3, aim(75, 40)], [K.f2 + 1, aim(62, 2)], [K.f2 + 4, aim(42, -4), sq], [K.f2 + 9, aim(42, -4)], [K.f2 + 16, aim(30, 60)],
];
// ---- where the blades meet: on the dancer's blade, 0.4 m from his hand, on the frame of the clang
const F_D1 = F_LIU_D(D1), DH_CL: Vec3 = [-0.14, 1.0, 0.33], DB_CL = aim(-4, -8);
const XC = armTo(D1, F_D1, 0, DH_CL[0], DH_CL[1], DH_CL[2]).addScaledVector(toWorld(F_D1, DB_CL[0], DB_CL[1], DB_CL[2]).normalize(), 0.4);
const F_U0 = yawTo(U0, D1);
/** the uncle's hand under the meeting point on the clang (his own frame) */
const UH_CL: Vec3 = [-0.24, 0.72, 0.16];
/** the low carry before the beat: a WORLD direction, under the dancer's blade and away from the dancer; it is
 *  lowered ON THE CUT back to the dance camera (he is outside both frames there), so that it does not swing down in
 *  front of Liu Bang's face */
const UB_DIP = V(-0.55, -0.45, -0.6).normalize();
const UB_CL = XC.clone().add(V(0, 0, -0.02)).sub(armTo(U0, F_U0, 0, UH_CL[0], UH_CL[1], UH_CL[2])).normalize();
// the uncle's sword hand and blade after his draw: the blade comes out and up (13a), he carries it upright round the
// table, dips it, and beats UP through the meeting point as he arrives; guard; on 用身子挡着 he squares up: the blade
// upright at his right shoulder, the left arm out and low toward Liu Bang behind him (from the dance camera anything he
// holds out to his right is hidden behind the dancer's head, and a level left arm crosses Liu Bang's face). Both feints
// come at his right side (a thrust past his left would cross his chest and end on Liu Bang's face on screen: it would
// read as getting through): his blade stands upright between the dancer's blade and himself, and takes it
const UH: HK[] = [
  [K.uDraw + 6, [-0.3, 1.05, 0.2]], [K.uGo - 1, [-0.3, 1.05, 0.2]], [K.uGo + 4, [-0.32, 0.9, 0.24]], [K.clang - 10, [-0.32, 0.9, 0.24]], [K.clang - 9, [-0.3, 0.8, 0.06]], [K.clang - 2, [-0.3, 0.8, 0.06]], [K.clang, UH_CL, sq], [K.clang + 4, [-0.2, 1.12, 0.24], easeOutCubic], [K.clang + 12, [-0.2, 1.0, 0.26]],
  [K.wing, [-0.2, 1.0, 0.26]], [K.wing + 6, [-0.34, 0.98, 0.12]], [K.f1 + 1, [-0.34, 0.98, 0.12]], [K.f1 + 6, [-0.3, 0.92, 0.3]], [K.f2, [-0.3, 0.92, 0.3]],
  [K.f2 + 5, [-0.3, 0.95, 0.33]], [S13.to, [-0.3, 0.95, 0.33]],
];
const UB: BK[] = [
  [K.uDraw + 2, SCAB], [K.uDraw + 4, aim(-70, -55)], [K.uDraw + 6, aim(-20, 62)], [K.uGo - 1, aim(-20, 62)], [K.uGo + 4, aim(-15, 75)], [K.clang - 10, aim(-15, 75)], [K.clang - 9, UB_DIP], [K.clang - 2, UB_DIP], [K.clang, UB_CL, sq], [K.clang + 4, aim(5, 72), easeOutCubic], [K.clang + 12, aim(15, 45)],
  [K.wing, aim(15, 45)], [K.wing + 6, aim(15, 68)], [K.f1 + 1, aim(15, 68)], [K.f1 + 6, aim(5, 78)], [K.f2, aim(5, 78)],
  [K.f2 + 5, aim(-5, 72)], [S13.to, aim(-5, 72)],
];
/** the uncle's wing hand (his left, on Liu Bang's side of the screen) */
const UW: HK[] = [[K.wing + 6, [0.42, 0.7, -0.05]], [K.f2, [0.42, 0.7, -0.05]], [K.f2 + 5, [0.36, 0.72, -0.16]], [S13.to, [0.36, 0.72, -0.16]]];

const segDist = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => { const ab = b.clone().sub(a), u = clamp01(p.clone().sub(a).dot(ab) / ab.lengthSq()); return a.clone().addScaledVector(ab, u).distanceTo(p); };
const segSeg = (a0: THREE.Vector3, a1: THREE.Vector3, b0: THREE.Vector3, b1: THREE.Vector3) => { let m = 9; for (let i = 0; i <= 14; i++) m = Math.min(m, segDist(a0.clone().lerp(a1, i / 14), b0, b1)); return m; };
/** the closest points of two segments: [s, t] along p0->p1 and q0->q1 (0..1) */
const closest = (p0: THREE.Vector3, p1: THREE.Vector3, q0: THREE.Vector3, q1: THREE.Vector3): [number, number] => {
  const d1 = p1.clone().sub(p0), d2 = q1.clone().sub(q0), r = p0.clone().sub(q0), a = d1.dot(d1), e = d2.dot(d2), f2 = d2.dot(r), c = d1.dot(r), b = d1.dot(d2), den = a * e - b * b;
  let s = den > 1e-9 ? clamp01((b * f2 - c * e) / den) : 0, t = (b * s + f2) / e;
  if (t < 0) { t = 0; s = clamp01(-c / a); } else if (t > 1) { t = 1; s = clamp01((b - c) / a); }
  return [s, t];
};
/** the whole sword (props/things.ts sword) from its pommel (0.108 m behind the hand, a disc 6 cm across) through the
 *  grip (3.7 cm thick) and the guard (0.066 .. 0.108 m: a lozenge 10 cm across, 5 cm thick) to the tip (0.80 m): half
 *  width / half thickness across it at u m out of the hand (the blade 2.8 -> 2.3 cm wide by 0.8 -> 0.65 cm at
 *  0.66 m), its flat facing the prop's z */
const BL0 = -0.108, BL1 = 0.8;
const bladeHalf = (u: number) => { if (u < -0.07) return [0.03, 0.03]; if (u < 0.066) return [0.0185, 0.0185]; if (u < 0.108) return [0.05, 0.025]; const k = clamp01((u - 0.095) / (0.66 - 0.095)); return [lerp(0.028, 0.023, k), lerp(0.008, 0.0065, k)]; };
/** BLADE AGAINST BLADE: they may touch, never pass through each other. If the middle lines of the two swords come
 *  nearer than their own half widths / thicknesses across the line between them (+ 3 mm), the sword that meets the
 *  other farther from its own hand (the smaller turn) is turned about that hand just far enough to lie on the other.
 *  Returns both directions. (Before: the feints' contacts went 1.6-1.9 cm through each other, once into the uncle's
 *  guard.) */
function parry(hA: THREE.Vector3, dA0: THREE.Vector3, fA: THREE.Vector3, hB: THREE.Vector3, dB0: THREE.Vector3, fB: THREE.Vector3, eye: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const axes = (d: THREE.Vector3, face: THREE.Vector3) => { const z = face.clone().addScaledVector(d, -face.dot(d)).normalize(); return { x: d.clone().cross(z), z }; };
  const dA = dA0.clone(), dB = dB0.clone();
  for (let it = 0; it < 4; it++) {
    const A = axes(dA, fA), B = axes(dB, fB), a0 = hA.clone().addScaledVector(dA, BL0), a1 = hA.clone().addScaledVector(dA, BL1), b0 = hB.clone().addScaledVector(dB, BL0), b1 = hB.clone().addScaledVector(dB, BL1);
    const [s, t] = closest(a0, a1, b0, b1), pa = a0.clone().lerp(a1, s), pb = b0.clone().lerp(b1, t), ua = lerp(BL0, BL1, s), ub = lerp(BL0, BL1, t);
    let n = pb.clone().sub(pa); const dist = n.length();
    if (dist < 1e-4) { n = dA.clone().cross(dB); if (n.lengthSq() < 1e-8) n.set(0, 1, 0); n.normalize(); if (n.dot(eye.clone().sub(pa)) < 0) n.negate(); } else n.divideScalar(dist);
    const [wa, ta] = bladeHalf(ua), [wb, tb] = bladeHalf(ub);
    const need = wa * Math.abs(A.x.dot(n)) + ta * Math.abs(A.z.dot(n)) + wb * Math.abs(B.x.dot(n)) + tb * Math.abs(B.z.dot(n)) + 0.003;
    if (dist >= need) break;
    const push = need - dist + 0.001;
    if (Math.abs(ub) >= Math.abs(ua)) dB.copy(pb.addScaledVector(n, push).sub(hB).normalize());
    else dA.copy(pa.addScaledVector(n, -push).sub(hA).normalize());
  }
  return [dA, dB];
}

/** THE DANCE (lines 12 and 13) for any camera */
function dance(w: World, f: number) {
  const t = f / FPS, up = f >= K.uRise;
  const XY = w.actor(PEOPLE.xiangYu), LIU = w.actor(PEOPLE.liuBang), FZ = w.actor(PEOPLE.fanZeng), DN = w.actor(PEOPLE.xiangZhuang), UN = w.actor(PEOPLE.xiangBo);
  const master = f < K0, drawn = f >= K0, uDrawn = f > K.uDraw;
  const pD = drawn ? posD(f) : D0, pU = posU(f);
  /** where the uncle really stands this frame (his seat, his way round the table, his marks) */
  let uAt = pU;
  // ---- the seated: Liu Bang is the one it is about
  const threat = smooth(lin(f, K.turn1 - 4, K0 + 30)), safe = smooth(lin(f, K.clang, K.clang + 10)), wing = smooth(lin(f, K.wing, K.wing + 6));
  const peek = ky(f, [[K.wing + 2, 0], [K.f1 + 6, 1], [K.f2 - 2, 1], [K.f2 + 6, -1], [S13.to - 4, -0.4]]);
  const ELIU: [number, Ex][] = [[0, "neutral"], [K0 + 6, "nervous"], [K.turn1 + 2, "shock"], [K0 + 34, "nervous"], [K.clang, "shock"], [K.clang + 10, "nervous"], [K.f2 + 12, "relief"]];
  const liu: St = {
    expr: at(f, ELIU), blink: lid(t, 1, ELIU.slice(1).map(([k]) => k / FPS)),
    gaze: master ? (f < S12a.from + 6 ? 0 : -1) : f > K.clang - 8 && f < K.clang - 1 ? 1 : -1,
    head: heads({ dx: 0.1 * threat * (1 - safe) + 0.11 * peek * wing, dy: 0.03 * threat * (1 - safe) - 0.06 * wing, tilt: 6 * threat * (1 - safe) + 4 * peek * wing }, accent("jolt", f, K.turn1 + 2, { amp: 0.6 }), accent("jolt", f, C13B + 3, { amp: 0.5 }), accent("jolt", f, K.clang, { amp: 0.5 })),
  };
  const xy: St = { expr: "neutral", gaze: -1, head: accent("nod", f, K.arr + 6), armFront: [undefined, true] };
  // Fan Zeng (a back view from the north): his right arm waves the man in
  const fz: St = { expr: "stern", gaze: 0, hide: ["pendant"] };
  const uncleSeat: St = { expr: at(f, [[0, "neutral"], [K.arr + 2, "stern"]] as [number, Ex][]), gaze: -1 };
  banquet(w, f, { in: up ? ["liu", "zhang", "xiangyu", "fanzeng"] : undefined, cups: ["liu", "zhang", "fankuai", "uncle", "fanzeng"], extra: { liu, xiangyu: xy, fanzeng: fz, uncle: uncleSeat } });
  // ---- the dancer
  const leg = walkAlong(PATH_IN, WSP, (f - T.in0) / FPS, { endFacing: F_SAL });
  const sal = ky(f, [[K.arr + 1, 0], [K.arr + 5, 1], [K.arr + 10, 1], [K.arr + 13, 0]]);
  const EDN: [number, Ex][] = [[0, "smug"], [K.clang, "shock"], [K.clang + 9, "stern"], [K.f2 + 10, "huff"]];
  const dBase: St = drawn
    ? { at: pD, facing: facD(f), pose: { kind: "idle", t: t + 0.3 }, turn: smooth(lin(f, K.turn0, K.turn1)) }
    : { at: leg.at, facing: leg.facing + SQUEEZE * squeezeK(leg.at), pose: leg.pose, ...(sal > 0 ? { ...salute(sal, D0, F_SAL, t), hands: undefined } : {}) };
  DN.set({ ...dBase, expr: at(f, EDN), blink: lid(t, 11, [K.clang / FPS]), gaze: master ? 1 : f < K.turn0 ? 0.5 : 1, armFront: [true, undefined], hide: drawn ? ["hilt"] : undefined, visible: true });
  // ---- the uncle: rises at his seat, draws there (13a), hurries round his table, beats the blade, stands in the way
  if (up) {
    const EUN: [number, Ex][] = [[0, "stern"], [K.clang + 4, "huff"], [K.wing, "stern"]];
    const uSt: St = { expr: at(f, EUN), blink: lid(t, 5, [(K.clang + 4) / FPS]), gaze: f < K.uGo ? 0 : -1, armFront: [true, true], hide: uDrawn ? ["hilt"] : undefined, visible: true };
    if (f < K.uStand) {
      // he rises with a little push BACK from his table (RISE_BACK): rising straight up, his robe (which keeps out of the
      // table only while he sits) spread 2 cm into the table top and his hands into the robe
      const k = lin(f, K.uRise, K.uStand), sh = rel(V(0, PAD_TOP * k, 0), SEATS.uncle.facing, 0, 0, -RISE_BACK * smooth(k)), st = seated(SEATS.uncle, t, { rise: k, hipY: UN.dim.hipY });
      uAt = floorOf(SEATS.uncle.top).add(sh);
      UN.set({ ...st, at: uAt, ...(st.seat ? { seat: { ...st.seat, top: st.seat.top.clone().add(sh) } } : {}), ...uSt });
    }
    else if (f < K.clang) { const lg = walkAlong(UPATH, USP, (f - K.uGo) / FPS, { startFacing: SEATS.uncle.facing, endFacing: F_U0 }); uAt = lg.at.clone(); UN.set({ at: lg.at, facing: lg.facing, pose: lg.moving ? lg.pose : { kind: "idle", t: t + 0.7 }, ...uSt }); }
    else UN.set({ at: pU, facing: yawTo(pU, pD), pose: { kind: "idle", t: t + 0.7 }, ...uSt });
  }
  w.update();                                                              // first solve: resting hands, body yaws, hilts
  // ---- Xiang Yu puts his cup down (the end of the drink of line 11)
  const hc = hostCup(w, f, XY, XY.handWorld(1), mouthCup(w, XY, 1.14, XY_MOUTH_FRONT));
  if (hc.hand) XY.set({ hands: [null, hc.hand] });
  // ---- Fan Zeng's wave toward the door: up beside his head on the first frames, two beckons, down
  // (his left fist keeps the jade: FZ_LOW)
  if (f < S12a.from + 26) {
    const rest = FZ.handWorld(0), WV: Arm = { ...SIT, r: 0.3 }, hi = armTo(P_FZ, F_FZ, 0, -0.46, 0.84, 0.1, WV), beck = armTo(P_FZ, F_FZ, 0, -0.38, 0.76, 0.22, WV);
    FZ.set({ hands: [path(f, [[S12a.from - 5, rest], [S12a.from + 1, hi, easeOutCubic], [S12a.from + 6, beck], [S12a.from + 10, hi], [S12a.from + 15, beck], [S12a.from + 19, hi], [S12a.from + 26, rest]]), FZ_LOW] });
  } else FZ.set({ hands: [null, FZ_LOW] });
  // ---- the dancer's sword hand
  const yawD = DN.bodyYaw;
  let dHand: THREE.Vector3 | null = null, dDir: THREE.Vector3 | null = null;
  if (!drawn) {
    const kh = smooth(lin(f, K.hilt, K.hilt + 3)), hw = hiltWorld(DN);
    if (kh > 0 && hw) DN.set({ hands: [DN.handWorld(0).lerp(within(pD, yawD, 0, hw), kh), null] });
    // the salute's two hands come together from where they hang (common.ts salute pins them from its first frame)
    else if (sal > 0) { const sh = salute(sal, D0, F_SAL, t).hands, e = smooth(Math.min(1, sal * 1.6)); const out = (i: 0 | 1) => toWorld(F_SAL, (i ? 1 : -1) * 0.1, 0, 0.14).multiplyScalar(Math.sin(Math.PI * e)); if (sh?.[0] && sh[1]) DN.set({ hands: [DN.handWorld(0).lerp(sh[0], e).add(out(0)), DN.handWorld(1).lerp(sh[1], e).add(out(1))] }); }
  } else {
    const hw = hiltWorld(DN) ?? rel(pD, yawD, -0.19, 0.5, 0.02), scab = toWorld(yawD, SCAB[0], SCAB[1], SCAB[2]).normalize();
    // the pull, along the scabbard's axis (DRAW): on the cut the point is just leaving the mouth
    const pull = (s: number) => hw.clone().addScaledVector(scab, -s);
    const keys: HK[] = [[K0, within(pD, yawD, 0, pull(DRAW[0]))], [K0 + 1, within(pD, yawD, 0, pull(DRAW[1]))], [K0 + 2, within(pD, yawD, 0, pull(DRAW[2]))], ...DH];
    dHand = handAt(f, keys, pD, yawD, 0);
    dDir = bladeAt(f, DB, yawD);
    // the tip circles a little while it creeps at Liu Bang
    const men = smooth(lin(f, K0 + 30, K0 + 34)) * (1 - lin(f, K.clang - 2, K.clang));
    if (men > 0) dDir.add(toWorld(yawD, 0.035 * Math.sin(f * 0.8) * men, 0.03 * Math.cos(f * 0.8) * men, 0)).normalize();
    DN.set({ hands: [dHand, null] });
  }
  // ---- the uncle's hands
  let uHand: THREE.Vector3 | null = null, uDir: THREE.Vector3 | null = null;
  if (up && f >= K.uGrip) {
    const yawU = UN.bodyYaw, hw = hiltWorld(UN) ?? rel(uAt, yawU, -0.19, 0.5, 0.02), scab = toWorld(yawU, SCAB[0], SCAB[1], SCAB[2]).normalize();
    const pull = (s: number) => hw.clone().addScaledVector(scab, -s);
    if (f <= K.uDraw) uHand = UN.handWorld(0).add(RISE_HAND(0, yawU, f)).lerp(within(uAt, yawU, 0, hw), smooth(lin(f, K.uGrip - 1, K.uGrip + 4)));
    else {
      uHand = handAt(f, [[K.uDraw, within(uAt, yawU, 0, hw)], [K.uDraw + 1, within(uAt, yawU, 0, pull(DRAW[0]))], [K.uDraw + 2, within(uAt, yawU, 0, pull(DRAW[2]))], ...UH], uAt, yawU, 0);
      uDir = bladeAt(f, UB, yawU);
    }
    const wingHand = f > K.wing ? handAt(f, [[K.wing, UN.handWorld(1)], ...UW], uAt, yawU, 1) : null;
    UN.set({ hands: [uHand, wingHand ?? (f < K.uStand + 5 ? UN.handWorld(1).add(RISE_HAND(1, yawU, f)) : null)] });
  } else if (up) UN.set({ hands: [UN.handWorld(0).add(RISE_HAND(0, UN.bodyYaw, f)), UN.handWorld(1).add(RISE_HAND(1, UN.bodyYaw, f))] });
  w.update();
  // ---- props
  w.prop("cup:xiangyu").put(hc.hand ? hc.C.clone().lerp(cupIn(XY, 1, GRIP_XY), hc.held) : hc.C);
  putJade(w, FZ);
  const eye = w.camera.position;
  const blades: { n: string; a: THREE.Vector3; b: THREE.Vector3; own: Rig }[] = [];
  if (dHand && dDir && uHand && uDir) { const ha = DN.handWorld(0), hb = UN.handWorld(0); [dDir, uDir] = parry(ha, dDir, eye.clone().sub(ha), hb, uDir, eye.clone().sub(hb), eye); }
  if (dHand && dDir) { const hnd = DN.handWorld(0); w.prop("sword0").put(hnd, { up: dDir, face: eye.clone().sub(hnd) }); blades.push({ n: "s0", a: hnd.clone().addScaledVector(dDir, 0.1), b: hnd.clone().addScaledVector(dDir, 0.8), own: DN }); }
  if (uHand && uDir) { const hnd = UN.handWorld(0); w.prop("sword1").put(hnd, { up: uDir, face: eye.clone().sub(hnd) }); blades.push({ n: "s1", a: hnd.clone().addScaledVector(uDir, 0.1), b: hnd.clone().addScaledVector(uDir, 0.8), own: UN }); }
  // the flap: up while he comes through, let down behind him
  w.set.setFlap(1 - smooth(lin(f, K.flapShut0, K.flapShut1)));
  if (LOG) {
    const figs: [string, Rig, number][] = [["liu", LIU, 0.25], ["xy", XY, 0.29], ["fz", FZ, 0.25], ["dn", DN, 0.25], ["zh", w.actor(PEOPLE.zhangLiang), 0.25]];
    if (up) figs.push(["un", UN, 0.25]);
    let s = `dance dn ${px(w.project(DN.headWorld()))} liu ${px(w.project(LIU.headWorld()))}${up ? ` un ${px(w.project(UN.headWorld()))}` : ""}`;
    for (const bl of blades) {
      let mh = 9, mb = 9, nh = "", nb = "";
      for (const [n, r, rad] of figs) {
        const hcw = r.headWorld(), dh = segDist(hcw, bl.a, bl.b) - rad;
        if (dh < mh) { mh = dh; nh = n; }
        if (r !== bl.own) { const db = segSeg(bl.a, bl.b, V(hcw.x, hcw.y - 0.3, hcw.z), V(hcw.x, Math.max(0.12, hcw.y - 1.0), hcw.z)) - 0.17; if (db < mb) { mb = db; nb = n; } }
      }
      s += ` | ${bl.n} tip ${px(w.project(bl.b))} y ${bl.b.y.toFixed(2)} head ${mh.toFixed(2)}(${nh}) body ${mb.toFixed(2)}(${nb})${mh < 0.04 || mb < 0.05 || bl.b.y < 0.06 ? " !!CLIP" : ""}`;
    }
    if (blades.length === 2) s += ` | xx ${segSeg(blades[0].a, blades[0].b, blades[1].a, blades[1].b).toFixed(3)}`;
    // on screen: how much of a blade is hidden behind / lies across another man's head (12 samples per blade)
    const hp = (r: Rig) => ({ ...headPx(w, r), d: r.headWorld().distanceTo(eye) });
    const across = (bl: { a: THREE.Vector3; b: THREE.Vector3 }, r: Rig) => { const H = hp(r); let nb = 0, nf = 0; for (let i = 0; i <= 11; i++) { const q = bl.a.clone().lerp(bl.b, i / 11), sp = w.project(q); if (Math.hypot(sp.x - H.x, sp.y - H.y) < H.r) { if (q.distanceTo(eye) > H.d) nb++; else nf++; } } return `${nb}b${nf}f`; };
    for (const bl of blades) s += ` | ${bl.n}@ ${bl.own === DN ? (up ? `un ${across(bl, UN)} ` : "") : `dn ${across(bl, DN)} `}liu ${across(bl, LIU)}`;
    if (up) { const HL = hp(LIU), lh = w.project(UN.handWorld(1)), HU = hp(UN); s += ` | unLH ${px(lh)}${Math.hypot(lh.x - HL.x, lh.y - HL.y) < HL.r ? " ON-LIU" : ""} unRH ${px(w.project(UN.handWorld(0)))} | un-liu heads ${(Math.hypot(HU.x - HL.x, HU.y - HL.y) / (HU.r + HL.r)).toFixed(2)}`; }
    log(f, s);
  }
  return { XY, LIU, FZ, DN, UN, up };
}

const M12 = cam([1.25, 2.55, 4.85], [0.12, 0.36, -0.95], 46);
/** 12a: the master. Fan Zeng waves, the man comes through the door; the camera eases after him to the floor. */
function shot12a(w: World, f: number): Pose {
  const c = camMix(MASTER, M12, easeInOutCubic(lin(f, S12a.from + 6, S12a.to - 4)));
  w.setPlace("tent"); w.setCamera(c);
  const R = dance(w, f);
  const ov = tag({ f, who: "dancer", at: headPx(w, R.DN), from: TAG.dancer, out: Math.min(TAG.dancer + TAG_LEN, S12a.to - 4), side: "up" });
  return { camera: c, overlays: ov, slate: slate(S12a, "master: the dancer comes in") };
}
// layout's dance tripod 8 % further back: the dancer on the left, the uncle in the middle and Liu Bang on the right
// are all inside the frame and clear of the button column (from CAMS.dance itself Liu Bang's head ends at 89 % of the
// width and the dancer's leaves the frame on his step back)
const DANCE = moved(CAMS.dance, -0.08), DANCE_L = moved(cam(CAMS.dance.pos as Vec3, [-0.44, 0.78, -0.82], 50), -0.08), DANCE_IN = moved(CAMS.dance, -0.03);
/** 13a: the uncle's own shot, from the east over Fan Kuai's empty seat: he faces this lens. It tilts up with him as he
 *  rises; the dancer's blade lies across the bottom of the frame, still on its way to Liu Bang. */
const UNC0 = cam([-1.6, 1.5, -0.5], [1.35, 1.0, -0.68], 34), UNC1 = cam([-1.6, 1.5, -0.5], [1.35, 1.25, -0.72], 34);
function shot13a(w: World, f: number): Pose {
  const c = camMix(UNC0, UNC1, easeInOutCubic(lin(f, K.uRise, K.uRise + 12)));
  w.setPlace("tent"); w.setCamera(c);
  dance(w, f);
  return { camera: c, slate: slate(S13, "east: the uncle rises and draws") };
}
/** 12b + 13: the dance camera: it starts on the dancer, pans with the blade to Liu Bang as he turns on him, and pushes
 *  in slowly once the uncle stands in the way */
function shotDance(s: ShotDef) {
  return (w: World, f: number): Pose => {
    const a = camMix(DANCE_L, DANCE, easeInOutCubic(lin(f, K.turn0, K0 + 34)));
    const c = camMix(a, DANCE_IN, easeInOutCubic(lin(f, K.wing - 8, S13.to - 6)));
    w.setPlace("tent"); w.setCamera(c);
    dance(w, f);
    const q = w.project(XC);
    const ov = frag(
      stamp({ f, id: "dance", from: HIT.idiomDance, out: Math.min(HIT.idiomDance + 36, S12b.to - 4) }),
      burst(f, { at: K.clang, x: q.x, y: q.y, r: 130, n: 10 }));
    return { camera: c, overlays: ov, slate: slate(s, f < C13B ? "dance: the blade at Liu Bang" : "dance: the uncle in the way") };
  };
}

// a guard for the timing this file was staged for (a re-timed voice moves every beat; these must still hold)
if (T.lift + 5 >= T.jadeOut || T.jadeOut >= JADE[0] - 5 || K.arr + 13 > K.hilt + 1 || K.uDraw + 6 >= K.uGo - 1 || K.uGo + 4 >= K.clang - 10 || K.clang - 9 !== C13B || K.clang + 12 >= K.wing || C13B - S13.from < 18 || N11 - S11.from < 40 || S12a.from - N11 < 18) console.log(`QA:C TIMING the staging of segment C no longer fits the voice: arr ${K.arr} hilt ${K.hilt} uDraw ${K.uDraw} uGo ${K.uGo} clang ${K.clang} wing ${K.wing} N11 ${N11}`);

if (LOG) console.log(`QA:C BEATS ${JSON.stringify({ S10a, S10b, S11, N11, S12a, S12b, S13, C13B, T, K, JADE })}`);
const TABLE: [number, (w: World, f: number) => Pose][] = [
  [S10a.from, shot10a], [S10b.from, shot10b], [S11.from, shot11], [N11, shot11i], [S12a.from, shot12a], [S12b.from, shotDance(S12b)], [S13.from, shot13a], [C13B, shotDance(S13)],
];
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) { let fn = TABLE[0][1]; for (const [from, g] of TABLE) if (f >= from) fn = g; return fn(w, f); },
};

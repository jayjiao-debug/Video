// SEGMENT E (frames 1686-2106), lines 20-23: THE RELEASE, THE BILL, THE RHYME, THE PROMOTION (STORYBOARD "Segment E").
// WP11.
//   20a  ministers  满朝大臣面面相觑: the three Qin ministers' gazes snap at each other (A -> B, B -> C, C -> A), then all
//                   to screen right, the envoy; every face shock (相视而嘻: alarm, never a laugh); no tag
//   20b  hallMid    有人要拖他出去: guardC strides in from the right edge (a back view, from his mark since 1725) and takes
//                   the envoy's LEFT upper arm (his screen-right side) on 拖 (1751), and tugs toward the door: the envoy's
//                   arm is pulled out, his head tilts 6 deg, feet planted, deadpan; the king looks on, shocked
//   21a  throne     秦王说: the King of Qin's flat STOP hand toward screen right (stern); 杀了他: a chop of the hand
//                   (lip-sync from 1794); 玉也回不来: he slumps (head down, hands to his lap), sad -> sigh; the cauldron's
//                   rim a foreground shape at the bottom
//   21b  hallMid    放他回去吧: the guard lets go (1840) and walks back out of the right edge; the king's small seated bow
//                   (厚遇…毕礼而归之), the envoy bows back (salute, 1845-1853), turns right and walks off (the cut on the walk)
//   22   hallDoor   from the WEST: the envoy walks away toward the bright east door (a back view) on the walk he started
//                   in 21b; THE BILL (V6): two red 「0」 (没给城, 没给玉); whip pan RIGHT out (toward Zhao)
//   23a  zhaoThrone the rhyme of 3 (its camera and pose): the King of Zhao with the jade, happy; the stamp 价值连城; the
//                   arch of fifteen cities pops in SOLID (shot 3's arch) and vanishes from the left; he glances up
//                   (deadpan), back to the jade (smile)
//   23b  zhaoCrown  the king standing with the official's cap, the envoy kneeling, the eunuch, the jade on its stand;
//                   倒是那个门客: the tag returns; 回国就当了大官: the cap passes (both hands), he lifts it toward his head,
//                   on 当 the swap LIN -> LIN_OFFICIAL puts it on (head pop, gold burst), the tag's role flips to 上大夫;
//                   the eunuch claps four times; he rises, smiling; the chip and the source tag fade; the end stamp
// ONE STAGING for the hall (hallE, 20a-22): every figure's clock is the film frame and every walk one function of it,
// so a figure in two consecutive shots keeps its pose (rule 12); a shot picks its camera and its 2D layer (segE_ov.ts).
// Continuity from 19 (segD): the envoy at mid facing -0.75, his right hand out toward the cauldron (off-screen in 20a it
// goes back to the belly); the king seated, shocked, his left hand at his chest; the ministers on their marks; guardC on
// his mark; the cauldron on HALL.cauldron (it stays to the end of 22).
// Every frame number is looked up (beats.ts HIT / TAG / BEAT, segE_ov.ts T, cap / capWord / quote); every mark and
// camera is layout.ts's, except the marks this file derives and names (CAP_PASS, KING23: see 23b's notes). RIG FIELDS
// ONLY (BIBLE 5): hands are pinned points, the bow is salute's, no seated lean. HANDS ARE PINNED IN THE DRAWN TORSO'S
// FRAME (shownYaw, as segments C and D: the rig draws a standing figure's torso turned toward the camera, up to 45 deg).
import * as THREE from "three";
import type { Pose, Segment, Vec3 } from "../story";
import { SEGMENTS, FPS, lerp, lin, smooth, clamp01, quote } from "../story";
import type { World } from "../world";
import { BEAT, HIT, type ShotDef } from "../beats";
import { CAMS, HALL, ZHAO } from "../layout";
import { JADE_STAND, holdPoints } from "../props";
import { PEOPLE } from "../people";
import {
  V, rel, lid, at, ky, path, accent, heads, headPx, headM, headPop, speak, frag, seated, lap, walkAlong, walkTime, swaps, lerpA,
  wrapA, yawTo, whip, salute, kneel, clap, halberdHand, swapTo, type RigState,
} from "./common";
import { T, ov22, ov23a, ov23b, S20a, S20b, S21a, S21b, S22, S23a, S23b } from "./segE_ov";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
type V3 = THREE.Vector3;
type Hands = [V3 | null, V3 | null];
const S = SEGMENTS[4];
const slate = (s: ShotDef, more = "") => `${s.id} ${s.cam}${more ? " " + more : ""}`;
const KQ = PEOPLE.qinWang;

// ====================================================================================================== helpers
/** the yaw the rig DRAWS a standing figure's torso at (rig3d's "show yaw", copied as segments C and D do): the body
 *  turns toward the camera, softly up to 45 deg; a figure turned far away (or given `turn`) goes over to its true back
 *  view. Hands and held things are placed in this frame */
const shownYaw = (cam: V3, p: V3, facing: number, turn?: number): number => {
  const sm = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
  const hz = Math.hypot(cam.x - p.x, cam.z - p.z), vt = Math.max(Math.abs(cam.y - (p.y + 1)), 1e-3);
  const follow = sm((hz / vt - 0.35) / 0.6), camYaw = Math.atan2(cam.x - p.x, cam.z - p.z);
  const off = wrapA(facing - camYaw), aOff = Math.abs(off), maxB = Math.PI / 4, knee = 0.7 * maxB;
  const soft = aOff < knee ? aOff : knee + (maxB - knee) * (1 - Math.exp(-(aOff - knee) / (maxB - knee)));
  const wB = turn !== undefined ? clamp01(turn) : sm((aOff - (115 * Math.PI) / 180) / ((55 * Math.PI) / 180));
  return facing + follow * wrapA(camYaw + Math.sign(off) * lerp(soft, aOff, wB) - facing);
};
/** a point in a figure's drawn frame (x to its left, y up from its feet, z forward) */
const loc = (p: V3, yaw: number, q: Vec3) => rel(p, yaw, q[0], q[1], q[2]);
const ez = (f: number, a: number, b: number) => smooth(lin(f, a, b));
const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ====================================================================================================== the envoy (hall)
/** his facing at mid (19's: turned toward the king's side, screen left) and the walk out to the east door */
const F19 = -0.75, LIN_WALK = [HALL.mid, HALL.exit], LIN_V = 1.0, F_EXIT = yawTo(HALL.mid, HALL.exit);
/** his hands (drawn frame): together at the belly (18a's hold); 19's open hand (where segment D leaves his right
 *  hand); the idle rests; salute's hands at the chest */
const BELLY: [Vec3, Vec3] = [[-0.04, 0.85, 0.20], [0.04, 0.85, 0.20]], OPEN19: Vec3 = [-0.20, 0.88, 0.18];
const LIN_REST: [Vec3, Vec3] = [[-0.161, 0.604, 0.035], [0.161, 0.604, 0.035]], BOWH: [Vec3, Vec3] = [[-0.045, 0.82, 0.30], [0.045, 0.82, 0.30]];
/** how deep his bow back is (salute's k): the cauldron's rim is 0.31 m off his right elbow (at k 1 the elbow went 6 cm
 *  into it) */
const LIN_BOW = 0.6;
/** THE GRAB (20b). His left hand is pulled out from the belly to his side (PULL[0], on 拖) and further out by the tug
 *  (PULL[1]); the guard's hand sits on the outside of his left upper arm, about a third of the way from the elbow to
 *  the shoulder (the arm measured with the rig, WP11 probe.ts: shoulder about (0.12, 0.975, 0), elbow (0.20, 0.82,
 *  0.10) at the belly, (0.20, 0.81, 0.01) and (0.24, 0.84, 0.00) pulled out), its middle a hand's radius (2.3 cm) and
 *  a sleeve outside the arm's axis: GRAB_ON[i] for the belly hold and the two pulls */
const PULL: [Vec3, Vec3] = [[0.20, 0.62, 0.06], [0.24, 0.66, 0.08]];
const GRAB_ON: [Vec3, Vec3, Vec3] = [[0.232, 0.875, 0.06], [0.229, 0.867, 0.01], [0.255, 0.887, 0.0]];
/** the tug's two legs on frame f: a = belly -> PULL[0] (3 frames from 拖), b = PULL[0] -> PULL[1]; both run back
 *  together when the guard lets go (1840-1845) */
const tug = (f: number) => {
  if (f < T.release) return { a: ez(f, T.tug[0], T.tug[0] + 3), b: ez(f, T.tug[0] + 3, T.tug[1]) };
  const k = 1 - ez(f, T.release, T.release + 5);
  return { a: k, b: k };
};
/** his left hand and the guard's grab point (drawn frame) on frame f */
const leftArm = (f: number) => {
  const { a, b } = tug(f);
  return { hand: lerp3(lerp3(BELLY[1], PULL[0], a), PULL[1], b), grab: lerp3(lerp3(GRAB_ON[0], GRAB_ON[1], a), GRAB_ON[2], b) };
};
/** the envoy in the hall on frame f (cam = the camera's position): where he stands, how he turns, his hands */
const linHall = (f: number, cam: V3, shotId: string) => {
  const t = f / FPS;
  // ---- the walk out (from T.walk): one function of the frame for 21b and 22 (rule 12)
  if (f >= T.walk) {
    const L = walkAlong(LIN_WALK, LIN_V, (f - T.walk) / FPS, { startFacing: F_EXIT, endFacing: F_EXIT });
    const st: Extra = {
      at: L.at, facing: L.facing, pose: L.pose, hands: [null, null], expr: "cool", blink: lid(t, 1), gaze: 0,
      turn: shotId === "22" ? 1 : undefined, visible: true,
    };
    return { st, p: L.at, Y: shownYaw(cam, L.at, L.facing, st.turn) };
  }
  const p = HALL.mid.clone(), facing = f < T.turn ? F19 : lerpA(F19, F_EXIT, ez(f, T.turn, T.turn + 4)), Y = shownYaw(cam, p, facing);
  const Lc = (q: Vec3) => loc(p, Y, q);
  let hands: Hands, more: Extra = { pose: { kind: "idle", t: t + 0.4 } };
  const head: (RigState["head"] | undefined)[] = [];
  if (f < S20b.from) {
    // 20a (off-screen): 19's open hand goes back to the belly, the free left hand joins it
    const k = ez(f, S20a.from, S20a.from + 10);
    hands = [Lc(lerp3(OPEN19, BELLY[0], k)), Lc(lerp3(LIN_REST[1], BELLY[1], k))];
  } else if (f < T.linBow[0]) {
    // 20b-21b: the belly hold; the left hand pulled out by the guard from 拖 to the release, then back
    hands = [Lc(BELLY[0]), Lc(leftArm(f).hand)];
    const { a, b } = tug(f);
    head.push({ tilt: 6 * (0.6 * a + 0.4 * b) });
  } else {
    // 21b: the bow back (salute's lean and its hands, eased from the belly), then the hands drop to his sides
    const k = ky(f, [[T.linBow[0], 0], [T.linBow[1], 1], [T.linBow[2], 1], [T.linBow[3], 0]]);
    if (k > 0) { const s = salute(LIN_BOW * k, p, facing, t); more = { pose: s.pose, lookDown: s.lookDown }; head.push(s.head); }
    const bh = BOWH.map(Lc), bl = BELLY.map(Lc);
    hands = [bl[0].lerp(bh[0], k), bl[1].lerp(bh[1], k)];
    if (f >= T.linBow[3]) {
      const d = ez(f, T.linBow[3], T.turn);
      hands = f >= T.turn ? [null, null] : [bl[0].lerp(Lc(LIN_REST[0]), d), bl[1].lerp(Lc(LIN_REST[1]), d)];
    }
  }
  const st: Extra = {
    at: p, facing, ...more, hands, expr: f < T.turn ? "deadpan" : "cool", blink: lid(t, 1),
    gaze: f < T.turn ? -1 : 0, head: heads(...head), visible: true,
  };
  return { st, p, Y };
};

// ====================================================================================================== the King of Qin
const SEAT = HALL.seat, ST = V(SEAT.top.x, 0, SEAT.top.z);
const LAPK = lap(SEAT, 0.11, 0.26, 0.20).hands as [V3, V3];
/** his left hand: at his chest (where 19's recoil leaves it); the flat STOP toward screen right (storyboard (0.30,
 *  1.05, 0.30) of his body: x to his left, y world, z forward from the seat); the chop's low point; his seated bow
 *  (both hands together at the chest) */
const K_CHEST = rel(ST, 0, 0.13, 0.95, 0.24), K_STOP = rel(ST, 0, 0.30, 1.05, 0.30), K_CHOP = rel(ST, 0, 0.29, 0.94, 0.34);
const K_BOW: [V3, V3] = [rel(ST, 0, -0.05, 0.94, 0.30), rel(ST, 0, 0.05, 0.94, 0.30)];
/** his faces; the courteous smile comes only after his quote (放他回去吧 ends on Q21.to, 1860): under the lip-sync
 *  smile_closed's open mouth read as a laugh straight after the slump and the sigh (director f1848) */
const Q21 = quote("qinWang", 21);
const KX: [number, Expr][] = [[S20a.from, "shock"], [T.stop, "stern"], [T.slump, "sad"], [T.sigh, "sigh"], [Q21.to + 1, "smile_closed"]];
const kingE = (f: number): Extra => {
  const t = f / FPS;
  let h1: V3;
  if (f < T.stop) h1 = K_CHEST;
  else if (f < T.chop) h1 = path(f, [[T.stop, K_CHEST], [T.stop + 4, K_STOP, (x) => 1 - (1 - x) * (1 - x)]]);
  else if (f < T.slump) h1 = path(f, [[T.chop, K_STOP], [T.chop + 3, K_CHOP, (x) => x * x], [T.chop + 9, K_STOP]]);
  else h1 = path(f, [[T.slump, K_STOP], [T.slump + 6, LAPK[1]]]);
  let hands: [V3, V3] = [LAPK[0], h1];
  const bow = ky(f, [[T.kingBow[0], 0], [T.kingBow[1], 1], [T.kingBow[2], 1], [T.kingBow[3], 0]]);
  if (bow > 0) hands = [LAPK[0].clone().lerp(K_BOW[0], bow), LAPK[1].clone().lerp(K_BOW[1], bow)];
  // the slump (玉也回不来): head down 4 cm, lookDown 10, held into 21b; he lifts it again after his bow
  const slump = ez(f, T.slump, T.slump + 6) * (1 - ez(f, T.kingBow[2], T.kingBow[3] + 4));
  const sp = speak(Q21, f, 2);
  return {
    ...seated(SEAT, t), hands, expr: at(f, KX), blink: sp.blink ?? lid(t, 2, swaps(KX)), mouth: sp.mouth,
    gaze: f >= T.slump && f < T.release ? 0 : 1,
    lookDown: 10 * slump + 12 * bow,
    head: heads(sp.head, { dy: headM(-0.04) * slump }, accent("jolt", f, T.stop, { amp: 0.6 })),
    visible: true,
  };
};

// ====================================================================================================== the ministers
/** 面面相觑 (20a): each minister's keys at the four snaps (T.snaps: A -> B, B -> C, C -> A, all -> the envoy):
 *  facing (radians; minFacing 0.9 is a 3/4 view toward screen right, 0.4 nearly frontal: a look toward screen left),
 *  gaze (-1 screen left .. 1 screen right), lookDown (negative = up), face (shock only: 嘻 is alarm. Fix round: huff's
 *  lidded eyes and small "o" mouth read smug at this size (director f1712); B looks down at C by his facing and gaze,
 *  lookDown 2 (the half-closed eyes in f1712 were his blink: MIN_BLINK) */
type MinKeys = { facing: [number, number][]; gaze: [number, number][]; down: [number, number][]; expr: [number, Expr][] };
const [s0, s1, s2, s3] = T.snaps;
const MINK: Record<"A" | "B" | "C", MinKeys> = {
  // A (middle): looks at B (screen right, up) on s0, back at C (screen left, down) when C looks at him, then the envoy
  A: { facing: [[s0, 0.9], [s0 + 2, 1.02], [s2, 1.02], [s2 + 2, 0.55], [s3, 0.55], [s3 + 2, 1.0]],
    gaze: [[S20a.from, 0], [s0, 1], [s2, -1], [s3, 1]], down: [[s0, 0], [s0 + 2, -6], [s2, -6], [s2 + 2, 5], [s3, 5], [s3 + 2, 0]],
    expr: [[S20a.from, "shock"]] },
  // B (top right, at the back): looks at C (screen left, below him) on s1, then the envoy
  B: { facing: [[s1, 0.9], [s1 + 2, 0.4], [s3, 0.4], [s3 + 2, 1.0]],
    gaze: [[S20a.from, 0], [s1, -1], [s3, 1]], down: [[s1, 0], [s1 + 2, 2], [s3, 2], [s3 + 2, 0]],
    expr: [[S20a.from, "shock"]] },
  // C (front left, the largest): looks up at A (screen right) on s2, then far right at the envoy on s3
  C: { facing: [[s2, 0.9], [s2 + 2, 0.78], [s3, 0.78], [s3 + 2, 1.05]],
    gaze: [[S20a.from, 0], [s2, 1], [s3, 1]], down: [[s2, 0], [s2 + 2, -8], [s3, -8], [s3 + 2, 0]],
    expr: [[S20a.from, "shock"]] },
};
const SNAP_OF: Record<"A" | "B" | "C", number[]> = { A: [s0, s2, s3], B: [s1, s3], C: [s2, s3] };
/** their blink clocks (lid ids): B's own id 6 blinked on 1709-1712, in the middle of his look at C, and that
 *  half-closed frame read smug in the director's still f1712 (and again in the fix round's): id 9 has no blink in 20a;
 *  A blinks as he turns to the envoy (1721-1724), C early (1693-1696) */
const MIN_BLINK: Record<"A" | "B" | "C", number> = { A: 5, B: 9, C: 7 };
const minE = (f: number, who: "A" | "B" | "C", p: V3, id: number): Extra => {
  const K = MINK[who], t = f / FPS;
  return {
    at: p.clone(), facing: ky(f, K.facing), pose: { kind: "idle", t: t + 0.41 * id }, expr: at(f, K.expr),
    blink: lid(t, MIN_BLINK[who], swaps(K.expr)), gaze: at(f, K.gaze), lookDown: ky(f, K.down),
    head: heads(...SNAP_OF[who].map((on) => accent("jolt", f, on, { amp: 0.45 }))), visible: true,
  };
};

// ====================================================================================================== guardC
/** guardC (QIN_GUARD_B, his halberd in hand 0): on his mark facing -0.8 (outside every frame) until G_GO, then a
 *  stride (2.2 m/s, a true back view: walking away from hallMid's lens) ROUND E1's east side (G_WAY: the straight line
 *  from his mark to HALL.guardGrab passes 9 cm from the pillar's axis: clearance had him 22 cm inside it) to
 *  G_GRAB, arriving 4 frames before 拖; his left hand comes up to the envoy's arm over the last 5 frames and
 *  holds it; the tug moves him 4 cm back toward the door; on the release he lets go, steps back 0.2 m toward G_WAY_OUT
 *  (his halberd clear of the envoy's head) while he turns round (to a front 3/4 view), and walks back round the east
 *  side to his mark, out of hallMid's right edge (G_WAY is at 132 % x in hallMid, 85 % in hallDoor) */
/** where he stands for the grab: HALL.guardGrab moved G_OFF to screen right (hallMid's right is +x). Fix round (director
 *  f1756): from the mark his head (a back view) overlapped the right side of the envoy's head and his gripping arm
 *  was hidden. 8 cm: the heads 15-34 px apart on screen through the grab, rig.qa reach 0 (WP11 probe16.ts; at 9 cm
 *  his hand was 7 mm short on 1754, as the tug pulls the arm out); local to segment E (the mark is layout's) */
const G_OFF = 0.08, G_GRAB = HALL.guardGrab.clone().add(V(G_OFF, 0, 0));
const G_HOME = HALL.guardC, G_HOME_F = -0.8, G_WAY = V(2.0, 0, -1.45), G_IN = [G_HOME, G_WAY, G_GRAB], G_V = 2.2;
/** the way back goes wider (his halberd, in his right hand, is on the pillar's side walking back, his torso turned to
 *  the lens: by G_WAY it went 22 cm into E1, 0.72 m off E1's axis 12 cm): east along the envoy's row to G_WAY_OUT,
 *  south past E1 a metre off its axis, then in to his mark */
const G_WAY_OUT = V(2.40, 0, -1.85), G_WAY_OUT2 = V(2.45, 0, -0.90);
const G_GO = HIT.grab - 4 - Math.ceil(walkTime(G_IN, G_V) * FPS);
const G_BACK = V(0.04, 0, 0.0), G_STEP = 0.2;
const G_OUT_V = 2.4;
/** his free hand hanging (his drawn frame, measured) */
const G_HANG: Vec3 = [0.194, 0.59, 0.04];
const guardE = (f: number, cam: V3, grabAt: (g: number) => V3): Extra => {
  // segment D leaves him neutral on his mark; stern from the moment he sets off
  const t = f / FPS, base = { expr: (f < G_GO ? "neutral" : "stern") as Expr, blink: lid(t, 9), visible: true };
  const halb = (p: V3, Y: number, moving: boolean) => (moving ? halberdHand(p, Y, 0, 0.66, 0.25) : halberdHand(p, Y, 0));
  if (f < G_GO) return { ...base, at: G_HOME.clone(), facing: G_HOME_F, pose: { kind: "idle", t: t + 3.7 }, hands: [halb(G_HOME, shownYaw(cam, G_HOME, G_HOME_F), false), null] };
  const gF = yawTo(G_GRAB, grabAt(HIT.grab));
  if (f < HIT.grab) {
    const L = walkAlong(G_IN, G_V, (f - G_GO) / FPS, { endFacing: gF });
    const hang = (g: number) => { const Lg = walkAlong(G_IN, G_V, (g - G_GO) / FPS, { endFacing: gF }); return loc(Lg.at, Lg.facing, G_HANG); };
    // the reach goes out round his body (straight from the hang it brushed his armour)
    const h0 = hang(T.reach), mid = h0.clone().lerp(grabAt(HIT.grab), 0.5).add(rel(V(), gF, 0.05, 0, 0.03));
    const h1 = f < T.reach ? null : path(f, [[T.reach, h0], [T.reach + 2, mid], [HIT.grab, grabAt(HIT.grab)]]);
    return { ...base, at: L.at, facing: L.facing, pose: L.pose, turn: 1, hands: [halb(L.at, L.facing, L.moving), h1] };
  }
  const { a, b } = tug(f), p = G_GRAB.clone().addScaledVector(G_BACK, 0.5 * a + 0.5 * b);
  if (f < T.release) return { ...base, at: p, facing: gF, pose: { kind: "idle", t: t + 3.7 }, turn: 1, hands: [halb(p, gF, false), grabAt(f)] };
  // let go (3 frames), step back toward G_WAY_OUT while turning round (from his back view to a front 3/4 view), walk back
  const p0 = G_GRAB.clone(), out = G_WAY_OUT.clone().sub(p0).setY(0).normalize(), pOut = p0.clone().addScaledVector(out, G_STEP);
  const outF = yawTo(pOut, G_WAY_OUT), k = ez(f, T.guardTurn[0], T.guardTurn[1]);
  if (f < T.guardTurn[1]) {
    const q = p.clone().lerp(pOut, ez(f, T.release, T.guardTurn[1])), facing = lerpA(gF, outF, k), turn = 1 - k, Y = shownYaw(cam, q, facing, turn);
    const h1 = f < T.release + 3 ? path(f, [[T.release, grabAt(T.release)], [T.release + 3, loc(p, gF, G_HANG)]]) : null;
    return { ...base, at: q, facing, pose: { kind: "idle", t: t + 3.7 }, turn, hands: [halb(q, Y, false), h1] };
  }
  const L = walkAlong([pOut, G_WAY_OUT, G_WAY_OUT2, G_HOME], G_OUT_V, (f - T.guardTurn[1]) / FPS, { endFacing: G_HOME_F }), Y = shownYaw(cam, L.at, L.facing);
  return { ...base, at: L.at, facing: L.facing, pose: L.pose, hands: [halb(L.at, Y, L.moving), null] };
};

// ====================================================================================================== the hall (20a-22)
/** THE HALL IN E: the ceremony dressing (to the end of 22), the camera, the four of the placed list (L Q M C) on their
 *  clocks, the cauldron on its mark */
const hallE = (w: World, f: number, s: ShotDef, camera: Pose["camera"]) => {
  w.setPlace("hall");
  w.set.setCeremony(f >= BEAT.ceremony[0] && f <= BEAT.ceremony[1] ? 1 : 0);
  w.setCamera(camera);
  const cam = w.camera.position;
  const lin = w.actor(PEOPLE.lin), L = linHall(f, cam, s.id);
  lin.set(L.st);
  const king = w.actor(KQ);
  king.set(kingE(f));
  const M = ([["A", PEOPLE.qinMinA, HALL.minA, 5], ["B", PEOPLE.qinMinB, HALL.minB, 6], ["C", PEOPLE.qinMinC, HALL.minC, 7]] as const)
    .map(([who, p, at0, id]) => { const r = w.actor(p); r.set(minE(f, who, at0, id)); return r; });
  // the guard's hand on the envoy's arm, in the envoy's drawn frame of this camera (the envoy stands at mid until he
  // turns, long after the release)
  const Y19 = shownYaw(cam, HALL.mid, F19);
  const grabAt = (g: number) => loc(HALL.mid, Y19, leftArm(g).grab);
  const guard = w.actor(PEOPLE.qinGuardB);
  guard.set(guardE(f, cam, grabAt));
  w.update();
  w.prop("cauldron").put(HALL.cauldron);
  return { lin, king, guard, M };
};

/** shot 20a (1686-1736, ministers): 面面相觑 */
function shot20a(w: World, f: number): Pose {
  const camera = CAMS.ministers;
  hallE(w, f, S20a, camera);
  const n = T.snaps.filter((x) => f >= x).length;
  return { camera, slate: slate(S20a, ["", "A->B", "B->C", "C->A", "all->envoy"][n]) };
}
/** shot 20b (1737-1771, hallMid): the guard comes in and grabs */
function shot20b(w: World, f: number): Pose {
  const camera = CAMS.hallMid;
  hallE(w, f, S20b, camera);
  return { camera, slate: slate(S20b, f < HIT.grab ? "the guard" : "the grab") };
}
/** shot 21a (1772-1837, throne): stop; killing him won't bring it back */
function shot21a(w: World, f: number): Pose {
  const camera = CAMS.throne;
  hallE(w, f, S21a, camera);
  return { camera, slate: slate(S21a, f < T.chop ? "stop" : f < T.slump ? "kill him" : "the slump") };
}
/** shot 21b (1838-1863, hallMid): let him go; the bows; he turns and walks */
function shot21b(w: World, f: number): Pose {
  const camera = CAMS.hallMid;
  hallE(w, f, S21b, camera);
  return { camera, slate: slate(S21b, f < T.linBow[0] ? "released" : f < T.turn ? "the bows" : "turns and walks") };
}
/** shot 22 (1864-1938, hallDoor; the whip pan RIGHT out on 1934-1938): the walk to the door; THE BILL */
function shot22(w: World, f: number): Pose {
  const camera = whip(CAMS.hallDoor, f, T.whip4[0], T.whip4[1], 1, "out");
  hallE(w, f, S22, camera);
  return { camera, overlays: frag(...ov22(f)), slate: slate(S22, f < T.bill ? "the walk" : f < T.billOut ? "the bill" : f < T.whip4[0] ? "at the door" : "whip right") };
}

// ====================================================================================================== 23a: the rhyme
/** the floor point under the Zhao king's seat, and the jade where shot 3 starts (segA J3[0]: in his two hands at the
 *  lap, 12 cm under ZHAO.jade, facing 0): the same king, the same jade, the same framing */
const ZT = V(ZHAO.seat.top.x, 0, ZHAO.seat.top.z);
const J23 = rel(ZT, 0, 0, 0.68, 0.33);
const ZX23: [number, Expr][] = [[S23a.from, "happy"], [T.glanceUp, "deadpan"], [T.glanceBack, "smile"]];
/** shot 23a (1939-2014, zhaoThrone; the whip lands on 1939-1942) */
function shot23a(w: World, f: number): Pose {
  const camera = whip(CAMS.zhaoThrone, f, T.whip4[2], T.whip4[3], 1, "in");
  w.setPlace("zhao");
  w.setCamera(camera);
  const t = f / FPS, king = w.actor(PEOPLE.zhaoWang), hands = holdPoints("jade", J23, { grip: "pair", rot: 0 });
  king.set({
    ...seated(ZHAO.seat, t, { facing: 0 }), hands: [hands[0], hands[1]], expr: at(f, ZX23), blink: lid(t, 11, swaps(ZX23)), gaze: 0,
    // looking down at the jade (shot 3's 14 deg); up at the empty arch (deadpan); back down. Fix round: -28 (at -10
    // and at -18 his head barely moved, f1996 / f1992: the rig tips the head 0.6 x lookDown and slides the face up
    // only 0.4 x, at most 12 deg, so the tipped-back crown is what reads as the glance up)
    lookDown: ky(f, [[T.glanceUp - 2, 14], [T.glanceUp + 2, -28], [T.glanceBack - 2, -28], [T.glanceBack + 2, 14]]),
    head: heads(accent("pop", f, HIT.liancheng + 2, { amp: 0.5 }), accent("nod", f, T.glanceBack + 1, { amp: 0.6 })),
    visible: true,
  });
  w.update();
  w.prop("jade").put(J23, { grip: "pair", rot: 0 });
  const what = f <= T.whip4[3] ? "whip in" : f < T.arch ? "价值连城" : f < T.vanish ? "the arch" : f < T.glanceBack ? "vanish" : "the jade";
  return { camera, overlays: frag(...ov23a(f)), slate: slate(S23a, what) };
}

// ====================================================================================================== 23b: the promotion
// STAGING NOTES (rig.qa, WP11 probe2-4.ts; fix round probe11-15.ts):
//  - THE MARKS (local, like the build's): the king stands 0.10 m toward the lens from ZHAO.kingStand and 0.02 west
//    (KING23), the envoy kneels 0.02 east of ZHAO.kneel (E23). Fix round: the director's f2036 / f2050 (the board stood
//    against the king's beard and read as a long beard; at the pass the envoy's head was jammed against the king's
//    arm and the board). From the lens side the king's short arms reach the cap 10 cm lower (its top under his beard)
//    and the pass point sits between the two heads with air round it. The envoy goes only 2 cm east: further, his
//    kneeling head covers the left edge of the jade disc on its stand (5 cm: 7 px over it; 2 cm: 10 px clear).
//  - THE PASS POINT. At ZHAO.capPass (40.03, 0.97, -2.62) the kneeling envoy is 6-8 cm short and his arms go through
//    his body: the rig draws his torso turned 45 deg toward the lens (his facing is a profile, -PI/2), so the cap sat
//    at his far right, and at y 0.97 it was at his face. The cap passes at CAP_PASS instead (26 cm lower, 21 cm nearer
//    the lens): both reach 0, king clear 0, envoy clear -0.004; on screen the board is 26 px clear of the envoy's head
//    and 18 px clear of the king's (his beard), the king's arms 71 px clear of the envoy's head (probe19.ts).
//  - THE KNEEL. A full kneel (sink 0.38) puts the rig's arms 1.4-1.7 cm into his body even hanging; at k 0.8 his joined
//    hands are 0.7-0.9 cm in, at k 0.7 (sink 0.27) 0.3 cm (probe7.ts). He kneels at k 0.7 with his hands joined, rises
//    to the upright kneel (k 0.6, 長跪) to take the cap (2042-2048), and to his feet after the swap. His hands under the
//    cap stay 0.5-0.8 cm in (rig.qa clear; the clearance checker finds nothing over its 1 cm).
const KING23 = ZHAO.kingStand.clone().add(V(-0.02, 0, 0.10)), K23_F = ZHAO.kingStandFacing;
const E23 = ZHAO.kneel.clone().add(V(0.02, 0, 0)), E23_F = ZHAO.kneelFacing, M23 = ZHAO.miao23, M23_F = -0.9;
/** THE CAP'S PATH. Its board is black, 0.32 m tall on a gold band: held, it must stand against his teal robe, never
 *  his black beard (fix round). While he holds it (to 2045) it is at his belly, its top 15 px under his beard line,
 *  turned CAP_HOLD_TURN from his drawn torso toward the lens (its front and gold band face us) and tipped forward
 *  CAP_HOLD_PITCH (the board leans 13 deg toward the lens instead of 13 deg back into his chest: leaning back, at his
 *  belly it went 7 cm into him) (K_CAP: rig.qa reach 0.1 cm, clear 0; 2-3 cm lower or nearer his body his arms are
 *  short); held out to CAP_PASS (2045-2050), turned CAP_PASS_TURN and tipped forward only CAP_PASS_PITCH (the board
 *  leans back 6 deg toward the king, away from the envoy's face: leaning back 13 deg its top touched the king's beard,
 *  upright it came near the envoy's head); the envoy lifts it toward his head (CAP_LIFT) and on 当 it is on his head (the
 *  swap). (Lifted at his brow it went 4.5 cm into his head; the rig's arms do not reach above his head) */
const K_CAP: Vec3 = [0.02, 0.66, 0.23], CAP_HOLD_TURN = 0.35, CAP_HOLD_PITCH = 0.45;
const CAP_PASS = V(39.98, 0.71, -2.41), CAP_PASS_TURN = 0.25, CAP_PASS_PITCH = 0.12, CAP_LIFT = V(40.06, 0.79, -2.34);
/** the envoy's joined hands (his drawn frame from his sunk floor point), and on his feet closer in (forward 0.30, his
 *  torso drawn 45 deg to the lens, they stuck out toward the king in the last frame) */
const E_JOIN: [Vec3, Vec3] = [[-0.05, 0.86, 0.30], [0.05, 0.86, 0.30]], E_JOIN_UP: [Vec3, Vec3] = [[-0.05, 0.86, 0.21], [0.05, 0.86, 0.21]];
const KNEEL_K = 0.7, KNEEL_UP = 0.6;
/** the idle hand rests (drawn frames, measured): the King of Zhao's, the eunuch's (the whisk in his left) */
const ZK_HANG: [Vec3, Vec3] = [[-0.204, 0.609, 0.035], [0.204, 0.609, 0.035]], MIAO_HANG: [Vec3, Vec3] = [[-0.237, 0.603, 0.031], [0.235, 0.602, 0.04]];
/** how deep the envoy kneels on frame f (1 = KNEEL_DROP), and how far he has risen to his feet */
const kneelK = (f: number) => ky(f, [[T.upKneel[0], KNEEL_K], [T.upKneel[1], KNEEL_UP], [T.rise[0], KNEEL_UP], [T.rise[1], 0]]);
const risen = (f: number) => ez(f, T.rise[0], T.rise[1]);
/** the envoy's floor point on frame f (sunk by the kneel). (The build stepped him 8 cm east as he rose: standing at
 *  0.45 m their heads touched. The king now stands 0.59 m from him, and stepped east his body covered the disc) */
const envAt = (f: number) => E23.clone().add(V(0, -0.38 * kneelK(f), 0));
/** the two hands of a grip on the cap, ordered for a holder whose drawn torso turns to yaw Y: hand 0 (his right) the
 *  one further to his right */
const byRight = (h: V3[], Y: number): [V3, V3] => {
  const rx = -Math.cos(Y), rz = Math.sin(Y), d = (q: V3) => q.x * rx + q.z * rz;
  return d(h[0]) >= d(h[1]) ? [h[0], h[1]] : [h[1], h[0]];
};
/** a turn for the cap (props PutOpts.rot: a yaw, or [pitch, yaw, roll] in YXZ order) */
type CapRot = [number, number, number];
/** THE CAP on frame f: where it is (shows false = on his head from 当), its turn, the king's and the envoy's hands */
const cap23 = (f: number, cam: V3) => {
  const Yk = shownYaw(cam, KING23, K23_F), Ye = shownYaw(cam, E23, E23_F);
  const belly = loc(KING23, Yk, K_CAP);
  const kOut = ez(f, T.capOut[0], T.capOut[1]), rotPass: CapRot = [CAP_PASS_PITCH, Yk - CAP_PASS_TURN, 0];
  const rot: CapRot = [lerp(CAP_HOLD_PITCH, CAP_PASS_PITCH, kOut), Yk - lerp(CAP_HOLD_TURN, CAP_PASS_TURN, kOut), 0];
  const c = f < T.capOut[0] ? belly : f < T.letGo ? path(f, [[T.capOut[0], belly], [T.capOut[1], CAP_PASS]]) : path(f, [[T.letGo, CAP_PASS], [T.lift[1], CAP_LIFT]]);
  const shows = f < HIT.crown;
  // the king: the band's sides until he lets go, then his hands drop to his sides (out round his body)
  const kOn = byRight(holdPoints("officialCap", c, { grip: "pair", rot }), Yk), kRest = ZK_HANG.map((q) => loc(KING23, Yk, q));
  let king: Hands;
  if (f < T.letGo) king = kOn;
  else if (f < T.letGo + 6) {
    const g = byRight(holdPoints("officialCap", CAP_PASS, { grip: "pair", rot: rotPass }), Yk), side = [-0.06, 0.06];
    king = [0, 1].map((i) => {
      // he lets go by drawing his hands back toward himself and up a little first (2 frames: 5 cm back, 3 up), over the
      // envoy's arms under it (straight down and out, his left hand brushed the envoy's right forearm: clearance 1.5 cm)
      const back = g[i].clone().add(rel(V(), Yk, 0, 0.03, -0.05)), m = g[i].clone().lerp(kRest[i], 0.5).add(rel(V(), Yk, side[i], 0, -0.04));
      return path(f, [[T.letGo, g[i]], [T.letGo + 2, back], [T.letGo + 4, m], [T.letGo + 6, kRest[i]]]);
    }) as Hands;
  } else king = [null, null];
  // the envoy: joined; up under the cap (2045-2050); under it to the swap; joined again (the cap is on his head)
  const join = (g: number) => E_JOIN.map((q, i) => loc(envAt(g), Ye, lerp3(q, E_JOIN_UP[i], risen(g)))) as [V3, V3];
  const under = (cc: V3, rr: CapRot) => byRight(holdPoints("officialCap", cc, { grip: "pair", rot: rr }, "under"), Ye);
  let lin: Hands;
  if (f < T.capOut[0]) lin = join(f);
  else if (f < T.capOut[1]) { const j = join(T.capOut[0]), u = under(CAP_PASS, rotPass); lin = [path(f, [[T.capOut[0], j[0]], [T.capOut[1], u[0]]]), path(f, [[T.capOut[0], j[1]], [T.capOut[1], u[1]]])]; }
  else if (f < HIT.crown) lin = under(c, rot);
  else { const u = under(CAP_LIFT, rot), j = join(f), k = ez(f, HIT.crown, HIT.crown + 6); lin = [u[0].lerp(j[0], k), u[1].lerp(j[1], k)]; }
  return { c, rot, shows, king, lin, Yk, Ye, top: c.clone().add(V(0, 0.2, 0)) };
};
/** the eunuch's clap (common clap's y, forward and spread, and `side`: the meeting point moved toward his left) and the
 *  clap with it (common.ts clap, its point moved sideways: added here, common.ts is frozen) */
const MIAO_CLAP = { y: 0.97, z: 0.19, spread: 0.10, side: 0.13 };
const clapSide = (f: number, ons: number[], q: V3, Y: number, c: typeof MIAO_CLAP): [V3, V3] => {
  const [a, b] = clap(f, ons, q, Y, c.y, c.z, c.spread), d = rel(V(), Y, c.side, 0, 0);
  return [a.add(d), b.add(d)];
};
const LX23: [number, Expr][] = [[S23b.from, "cool"], [HIT.crown, "smile_closed"]];
const KX23: [number, Expr][] = [[S23b.from, "smile"], [HIT.crown, "happy"]];
const MX23: [number, Expr][] = [[S23b.from, "smile"], [HIT.crown, "happy"]];
/** shot 23b (2015-2106, zhaoCrown): the promotion. The last frame: the promoted envoy standing between his king and the
 *  eunuch, the jade on its stand, the end stamp (no tag, no chip, no source tag) */
function shot23b(w: World, f: number): Pose {
  const camera = CAMS.zhaoCrown;
  w.setPlace("zhao");
  w.setCamera(camera);
  const t = f / FPS, cam = w.camera.position, C = cap23(f, cam);
  // ---- the King of Zhao: standing (stepped down), the cap at his chest, held out, let go; smile -> happy; a nod on 当
  const king = w.actor(PEOPLE.zhaoWang);
  king.set({
    at: KING23.clone(), facing: K23_F, pose: { kind: "idle", t: t + 1.3 }, hands: C.king, expr: at(f, KX23), blink: lid(t, 11, swaps(KX23)),
    gaze: 1, lookDown: ky(f, [[T.capOut[0], 6], [T.capOut[1], 12], [T.letGo + 6, 4]]), head: heads(accent("nod", f, HIT.crown + 2, { amp: 0.6 })), visible: true,
  });
  // ---- the envoy: LIN kneeling -> the upright kneel -> LIN_OFFICIAL from 当 (head pop) -> on his feet; a nod; a blink
  const env = swapTo(w, f, HIT.crown, PEOPLE.lin, PEOPLE.linOfficial), k = kneelK(f), kn = kneel(k, E23, 16);
  const look = f < T.upKneel[0] ? 16 * k : f < HIT.crown ? ky(f, [[T.upKneel[0], 16 * KNEEL_K], [T.capOut[1], 2], [T.lift[1], -6]]) : ky(f, [[HIT.crown, -6], [HIT.crown + 6, 8 * k]]);
  const nod = ky(f, [[T.nod, 0], [T.nod + 4, 1], [T.nod + 9, 0]]);
  const blink = f >= T.blink && f < T.blink + 4 ? [0.5, 1, 1, 0.5][f - T.blink] : lid(t, 1, swaps(LX23));
  env.set({
    at: kn.at, facing: E23_F, pose: { kind: "idle", t: t + 0.4 }, hands: C.lin, expr: at(f, LX23), blink,
    gaze: f < T.rise[1] ? -1 : 0, lookDown: look + 12 * nod,
    head: heads(kn.head, headPop(f, HIT.crown), nod > 0 ? { dy: headM(-0.02) * nod } : undefined), visible: true,
  });
  // ---- the eunuch: smile; four claps (hands up from his sides 2057-2061, back down 2083-2089); happy from 当. Fix
  //      round (director f2065: only his far hand showed, at the jade disc's right edge, and read as reaching for it):
  //      the claps are in front of his chest, under his chin, 13 cm toward his left (the lens side, away from the
  //      stand) with a narrower spread (MIAO_CLAP; probe15.ts / probe11.ts: rig.qa clear +0.1 cm met, +0.5 open, both
  //      hands in front of his chest, the open hands 70 px clear of the disc, met 89; still f2065 at 10 cm: 47 px)
  const miao = w.actor(PEOPLE.miaoXian), Ym = shownYaw(cam, M23, M23_F), MQ = V(M23.x, 0, M23.z);
  const hang = MIAO_HANG.map((q) => loc(M23, Ym, q)), cl = (g: number) => clapSide(g, T.claps, MQ, Ym, MIAO_CLAP);
  const c0 = T.claps[0] - 5, c1 = T.claps[T.claps.length - 1] + 3;
  let mh: Hands = [null, null];
  // up from his sides and back down by way of a point 12 cm out in front (straight, his right hand crossed his chest
  // to the clap point on his left: clearance 5 cm into his body)
  const out = (o: V3, i: number) => hang[i].clone().lerp(o, 0.5).add(rel(V(), Ym, 0, 0, 0.12));
  if (f >= c0 - 4 && f < c0) { const o = cl(c0); mh = [0, 1].map((i) => path(f, [[c0 - 4, hang[i]], [c0 - 2, out(o[i], i)], [c0, o[i]]])) as Hands; }
  else if (f >= c0 && f <= c1) mh = cl(f);
  else if (f > c1 && f < c1 + 6) { const o = cl(c1); mh = [0, 1].map((i) => path(f, [[c1, o[i]], [c1 + 3, out(o[i], i)], [c1 + 6, hang[i]]])) as Hands; }
  miao.set({ at: M23.clone(), facing: M23_F, pose: { kind: "idle", t: t + 2.1 }, hands: mh, expr: at(f, MX23), blink: lid(t, 12, swaps(MX23)), gaze: -1, visible: true });
  // ---- the jade upright on its stand on the dais (the motif ends on screen); the cap
  w.update();
  w.prop("jadeStand").put(ZHAO.jadeStand);
  w.prop("jade").put(ZHAO.jadeStand.clone().add(V(0, JADE_STAND.disc, 0)));
  if (C.shows) w.prop("officialCap").put(C.c, { grip: "pair", rot: C.rot });
  const ov = ov23b(f, { lin: headPx(w, env), king: headPx(w, king), miao: headPx(w, miao), cap: C.shows ? w.project(C.top) : null });
  const what = f < T.capOut[0] ? "kneeling" : f < T.letGo ? "the cap" : f < HIT.crown ? "the lift" : f < T.rise[0] ? "上大夫" : "risen";
  return { camera, overlays: frag(...ov), slate: slate(S23b, what) };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [[S20a, shot20a], [S20b, shot20b], [S21a, shot21a], [S21b, shot21b], [S22, shot22], [S23a, shot23a], [S23b, shot23b]];
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    let fn = TABLE[0][1];
    for (const [s, g] of TABLE) if (f >= s.from) fn = g;
    return fn(w, f);
  },
};

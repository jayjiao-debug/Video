// SEGMENT D, lines D27-D31: 下午, the order at the new gate. WP5 segD. PLAN.md 8D, beats.ts BEAT.D.
// ONE TAKE (PLAN 12, the camera pass: see "the take" below and /home/user/su_work/cam2/D_plan.md): she stands frozen in
// the yard where the hooves found her, looking out through the open red gate at the hill road, and only turns and zooms:
// the courier in the gateway, wide as the family comes out, a snap on 琼州, back for the hand-down to GUO, in on the
// order, the extreme close on 好吃, back to a medium on him for her aside. The staging is unchanged (deep focus).
//   pre       the hooves: the COURIER in red rides up the road and reins in, in the gateway (BEAT.D.rein), turned three
//             quarters to her; he lifts the rolled order and unrolls it. The family comes out of the house behind her:
//             GUO first, out to the gate; MAI holding the KID's hand, to the left; SU comes up last from the right,
//             popping a lychee into his mouth, still chewing, and stops in the foreground right.
//   D27       the courier reads, loud and formal (stern, his eyes on the scroll, up at SU on 苏轼). SU stops chewing on
//             his name; on 琼州 a short shock, then stunned (deadpan); MAI's head sinks; the kid fidgets.
//   D28       she asks, lost (the red mic swings in toward GUO, who will answer). The courier rolls the order up and
//             holds it down to GUO, who has stepped out to the horse's shoulder; GUO takes it.
//   D29       GUO walks it back to his father and says 「海南。」 on the way (stunned). The kid's fidget stops.
//   read      (D29's after) nobody moves. SU takes the order from GUO (BEAT.D.take), turns to her, unrolls it and
//             reads it for a long time (focus). GUO steps back a little. Hold.
//   D30       he looks up (BEAT.D.look), genuinely curious: focus -> the open eyes of his resting smile (a
//             head tilt on 有什么) -> happy (BEAT.D.brighten, 好吃).
//   D31       her aside, stunned, half laughing (PLAN 12.4: the camera stays on him, a medium with the family round him
//             and a small slow step closer: camD). SU rolls the order up, happy, and looks to the courier for an answer; the
//             courier is lost (dazed), GUO dumbfounded, MAI laughs with relief, the kid is happy again. The fade through gold (hud TRANSITIONS, transitionAt).
// Every frame from beats.ts (BEAT.D) / lineId / capWord / SEGMENTS; every mark from layout/yard.ts (YARD.courier,
// YARD.road); the people stand on floor points given in her view (cp: metres out along her line of sight, metres to
// its right) from the camera that stands on YARD.courier's line. Props pinned after w.update().
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU, GUO, MAI, KID, COURIER, SU_HAT } from "../people";
import { YARD, EYE } from "../layout";
import { courierSeat, holdPoints } from "../props";
import { putHer, herKeys, type MicO } from "../her";
import { transitionAt } from "../hud";
import { V, rel, yawTo, wrapA, lerpA, says, accent, heads, at, ky, path, walkAlong, walkTime, lid, swaps, frag, type RigState } from "./common";

type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[3], B = BEAT.D;
const ln = (id: string) => lineId(id);
const word = (id: string, w: string) => capWord(id, w).from;

// ------------------------------------------------------------------------------------------------------- the beats
const L27 = ln("D27"), L28 = ln("D28"), L29 = ln("D29"), L30 = ln("D30");
const W_NAME = word("D27", "苏轼"), W_QIONG = word("D27", "琼州"), W_ANZHI = word("D27", "昌化军安置");
const W_YOU = word("D30", "有什么"), W_TIANBIAN = word("D31", "天边"), W_CHI = word("D31", "问吃的");
/** the horse walks the last of the road and stops on BEAT.D.rein; the courier lifts the order and unrolls it */
const RAISE = [B.rein, B.rein + 10] as const, UNROLL = [B.rein + 6, B.rein + 20] as const;
/** after D27: he rolls it up and holds it down to GUO on the horse's near side; GUO takes it (T1) */
const ROLL = [L27.to + 3, L27.to + 15] as const, OFFER = [L27.to + 15, L28.from + 20] as const, T1 = L28.from + 23;
/** GUO: out to the gate (from the house behind her), out to the horse after D27, back to SU with the order */
const G_OUT = S.from + 4, G_FETCH = L27.to + 1, G_TURN = [T1 + 6, T1 + 16] as const, G_BACK = G_TURN[1];
/** MAI and the kid come out (BEAT.D.family); SU comes up last, popping a lychee into his mouth on the way */
const SU_IN = B.family - 2, POP = [B.family + 10, B.family + 20] as const;
/** SU takes the order from GUO (BEAT.D.take), turns to her with it, unrolls it, reads */
const TAKE = B.take, TURN = [B.take + 2, B.take + 12] as const, OPEN = [B.take + 6, B.take + 20] as const, READ = B.take + 12;
/** GUO steps back a little once he has given it */
const G_STEP = [B.take + 14, B.take + 30] as const;
/** D31: SU rolls the order up, and looks to the courier on 天边 */
const ROLLUP = [B.aside + 12, B.aside + 26] as const;

// ------------------------------------------------------------------------------------------------------- her camera
/** her line of sight, turned this far (rad) toward +x from straight out of the yard (+z): the gate, the courier and the
 *  valley behind him in the middle; the house behind her */
const YAW = 0.26;
const FW = V(Math.sin(YAW), 0, Math.cos(YAW)), RT = V(-Math.cos(YAW), 0, Math.sin(YAW));
/** she stands this far from the courier's mark (YARD.courier: where he reins in) */
const CAM_D = 5.6;
const FEET = YARD.courier.clone().addScaledVector(FW, -CAM_D);
/** a floor point `d` m out along her line of sight and `r` m to its right (screen right) */
const cp = (d: number, r: number) => FEET.clone().addScaledVector(FW, d).addScaledVector(RT, r);
/** her lens: she stands here the whole scene (the camera pass turns and zooms from it: "the take" below) */
const POS: Vec3 = [FEET.x, EYE, FEET.z];
const L31 = ln("D31");

// ------------------------------------------------------------------------------------------------------- the marks
/** the courier reins in on his mark, turned three quarters to her (his horse's near flank and head to her) */
const HORSE_AT = YARD.courier.clone();
const HORSE_ROT = yawTo(HORSE_AT, FEET) + 0.55;
/** GUO: from behind her left shoulder out to the gateway; then the horse's near shoulder; back beside his father */
const G0 = cp(1.6, -0.9), G1 = cp(4.15, -0.32);
/** his way back to his father, round MAI */
const G2b = cp(3.7, -0.12);
/** MAI with the kid by the hand (the kid on his right), from behind her, to the left: he stands turned toward the
 *  courier and cheated toward her (MAI_FACE: the face reads, his eyes go to the courier and later to SU, both on his
 *  screen right), the kid at his right side, so their hands meet without crossing a body whichever way they look */
const M0 = cp(2.2, -2.4), M1 = cp(3.8, -0.85);
const MAI_FACE = lerpA(yawTo(M1, YARD.courier), yawTo(M1, FEET), 0.4);
const KID_SIDE = 0.46;
const K1 = rel(M1, MAI_FACE, -KID_SIDE, 0, 0), K0 = rel(M0, yawTo(M0, M1), -KID_SIDE, 0, 0);
/** the kid walks a little faster or slower so that the two arrive together */
const M_V = 1.3, K_V = M_V * (K0.distanceTo(K1) / M0.distanceTo(M1));
/** SU: in from the right edge, to the foreground right (his head a third of the frame wide) */
const S0 = cp(2.9, 1.4), S1 = cp(2.4, 0.42);
/** the frame his walk in ends */
const SU_STOP = SU_IN + Math.ceil(walkTime([S0, S1], 0.8) * FPS);
/** GUO hands it to him from beside him (his left, screen left), then steps back round the kid (his head clear of the
 *  courier's face) */
const G3 = cp(2.45, -0.2), G4 = cp(3.05, -0.32);

// ------------------------------------------------------------------------------------------------------- the horse
const H_V = 1.3, H_N = 22;
const H_PATH = [YARD.road[2].clone(), HORSE_AT.clone()];
const H_LEN = H_PATH[0].distanceTo(H_PATH[1]);
const H_HEAD = yawTo(H_PATH[0], H_PATH[1]);
/** where the horse is on frame f, which way it faces, its pose, clock and walk amount: a walk at H_V that eases to a
 *  stop on BEAT.D.rein (the legs swing less and less), turning from the road toward her as it stops */
const horseAt = (f: number) => {
  const decel = (H_V * H_N) / (2 * FPS);
  let d: number, amount: number;
  if (f >= B.rein) { d = H_LEN; amount = 0; }
  else if (f >= B.rein - H_N) { const u = (f - (B.rein - H_N)) / H_N; d = H_LEN - decel + ((H_V * H_N) / FPS) * (u - (u * u) / 2); amount = 1 - u; }
  else { d = H_LEN - decel - (H_V * (B.rein - H_N - f)) / FPS; amount = 1; }
  const at = H_PATH[0].clone().lerp(H_PATH[1], d / H_LEN);
  const rot = lerpA(H_HEAD, HORSE_ROT, smooth(clamp01(d / H_LEN)));
  const walking = f < B.rein;
  return { at, rot, pose: walking ? "walk" : "stand", t: walking ? d / H_V : f / FPS, amount };
};

// ------------------------------------------------------------------------------------------------------- the order
/** THE ORDER changes hands twice: the courier holds it by its two ends (the roller's knobs: holdPoints pair), GUO
 *  carries it by two hands near its middle (so that the courier before him and SU after him can hold the ends without
 *  their hands meeting), SU holds it by the ends. Its yaw is always its holder's own frame (hand 0 at its -x), so the
 *  sheet's written face looks out from the reader, toward her: we see the columns and the red seal. */
const INNER = 0.075;
/** two hands on the roller at c, `shift` m along its -x from the middle (GUO takes the courier's offer by the half
 *  that points at him: shift 0.12) */
const inner = (c: THREE.Vector3, yaw: number, shift = 0): [THREE.Vector3, THREE.Vector3] => {
  const ax = V(Math.cos(yaw), 0, -Math.sin(yaw));
  return [c.clone().addScaledVector(ax, -INNER - shift), c.clone().addScaledVector(ax, INNER - shift)];
};
/** GUO takes the offer with his right hand by the end that points at him (shift 0.095: just inside the knob), slides
 *  it to the middle while he turns the roller across his chest, and puts his left hand to it */
const TAKE_SHIFT = 0.095;
const gShift = (f: number) => TAKE_SHIFT * (1 - smooth(clamp01((f - T1) / 12)));
const ends = (c: THREE.Vector3, rot: [number, number, number], open: number) => holdPoints("scroll", c, { grip: "pair", rot, open }) as [THREE.Vector3, THREE.Vector3];
type Order = { c: THREE.Vector3; open: number; rot: [number, number, number] };

/** the courier: the order rolled in both hands at his lap while he rides; lifted and unrolled before his chest, the
 *  sheet tipped a little toward the family (he reads it from behind); rolled up after D27 and held down to his right
 *  (her side) in his right hand by its near end, pointing at GUO, who takes it by the middle (T1).
 *  Returns the order and the courier's two hand targets (null = rest). */
const GIVE_HAND = (seatTop: THREE.Vector3, rot: number) => rel(seatTop, rot, -0.27, 0.12, 0.16);
const giveAxis = (seatTop: THREE.Vector3, rot: number) => { const u = G2.clone().sub(GIVE_HAND(seatTop, rot)).setY(0).normalize(); return { u, yaw: Math.atan2(u.z, -u.x) }; };
const courierOrder = (f: number, seatTop: THREE.Vector3, rot: number): Order & { hands: [THREE.Vector3 | null, THREE.Vector3 | null]; letGo?: THREE.Vector3 } => {
  const lap = rel(seatTop, rot, 0, 0.24, 0.27), read = rel(seatTop, rot, 0, 0.52, 0.3);
  const A = GIVE_HAND(seatTop, rot), G = giveAxis(seatTop, rot), give = A.clone().addScaledVector(G.u, 0.19);
  const open = f < ROLL[0] ? smooth(clamp01((f - UNROLL[0]) / (UNROLL[1] - UNROLL[0]))) : 1 - smooth(clamp01((f - ROLL[0]) / (ROLL[1] - ROLL[0])));
  if (f < ROLL[1]) {
    const c = path(f, [[RAISE[0], lap], [RAISE[1], read, easeOutCubic]]);
    const o: Order = { c, open, rot: [0.15 * open, rot, 0] };
    return { ...o, hands: ends(o.c, o.rot, o.open) };
  }
  // the offer: out and down to GUO, turning to point at him; the left hand lets go, the right slides to the near end
  const k = smooth(clamp01((f - OFFER[0]) / (OFFER[1] - OFFER[0])));
  const c = read.clone().lerp(give, k), yaw = lerpA(rot, G.yaw, k);
  const ax = V(Math.cos(yaw), 0, -Math.sin(yaw));
  const right = c.clone().addScaledVector(ax, lerp(-0.19, 0.19, k));
  const left = c.clone().addScaledVector(ax, 0.19);
  return { c, open: 0, rot: [0, yaw, 0], hands: [right, f < OFFER[0] + 2 ? left : null], letGo: left };
};

// ------------------------------------------------------------------------------------------------------- the courier
const COURIER_EXPR: [number, Expr][] = [[S.from, "neutral"], [UNROLL[0], "stern"], [L27.to + 6, "neutral"], [B.brighten + 4, "dazed"], [W_TIANBIAN, "nervous"]];

// ------------------------------------------------------------------------------------------------------- GUO
/** beside the horse's near shoulder (its right, toward her), where the courier hands the order down */
const G2 = rel(HORSE_AT, HORSE_ROT, -0.9, 0, 0.3);
/** his facing at G3 / G4: toward his father, cheated toward her so the face reads */
const G3_FACE = yawTo(G3, S1), G4_FACE = lerpA(yawTo(G4, S1), yawTo(G4, FEET), 0.4);
/** at the gate during D27: turned to the courier, cheated toward her (his face reads, his eyes go to the courier) */
const G1_FACE = lerpA(yawTo(G1, HORSE_AT), yawTo(G1, FEET), 0.4);
/** a walk that sets off from a standing facing turns into the path over its first 6 frames (no snap) */
/** walkAlong with gentle turns: from a standing facing into the path over its first `inN` frames, and from the path's
 *  last heading to `endFacing` over `outN` frames once there (walkAlong's own turn takes 5 frames: a body that flips
 *  from her back view to its front) */
const walk2 = (pts: THREE.Vector3[], speed: number, t: number, o: { startFacing?: number; endFacing?: number; inN?: number; outN?: number } = {}) => {
  const L = walkAlong(pts, speed, t, { startFacing: o.startFacing });
  const inN = o.inN ?? 6, outN = o.outN ?? 12, n = pts.length;
  if (L.moving && o.startFacing !== undefined && t * FPS < inN) L.facing = lerpA(o.startFacing, L.facing, smooth(clamp01((t * FPS) / inN)));
  if (L.arrived && o.endFacing !== undefined) L.facing = lerpA(yawTo(pts[n - 2], pts[n - 1]), o.endFacing, smooth(clamp01(((t - walkTime(pts, speed)) * FPS) / outN)));
  return L;
};
/** GUO's floor point, facing and pose on frame f */
const guoAt = (f: number) => {
  if (f < G_FETCH) return walk2([G0, G1], 1.4, (f - G_OUT) / FPS, { endFacing: G1_FACE, outN: 18 });
  if (f < G_BACK) {
    const toHand = yawTo(G2, GIVE_HAND(courierSeat(HORSE_AT, HORSE_ROT, "stand", 0).seat.top, HORSE_ROT));
    const L = walk2([G1, G2], 1.15, (f - G_FETCH) / FPS, { startFacing: G1_FACE, endFacing: toHand, inN: 12, outN: 10 });
    if (f >= G_TURN[0]) L.facing = lerpA(toHand, yawTo(G2, G2b), smooth(clamp01((f - G_TURN[0]) / (G_TURN[1] - G_TURN[0]))));
    return L;
  }
  if (f < G_STEP[0]) return walk2([G2, G2b, G3], 1.35, (f - G_BACK) / FPS, { endFacing: G3_FACE, outN: 10 });
  // the step back: he backs away from his father, still turned to him (his robe hides the feet)
  const L = walkAlong([G3, G4], 0.6, (f - G_STEP[0]) / FPS, { endFacing: G4_FACE });
  L.facing = lerpA(G3_FACE, G4_FACE, smooth(clamp01(L.d / G3.distanceTo(G4))));
  return L;
};
/** D29 stunned (blank); in the hold after it he is sad, handing his father the order; deadpan at 好吃, a smile at 问吃的 */
const GUO_EXPR: [number, Expr][] = [[S.from, "neutral"], [W_QIONG, "shock"], [W_QIONG + 12, "neutral"], [W_ANZHI, "pained"], [L29.from - 4, "neutral"], [L29.to + 6, "sad"], [B.brighten + 2, "deadpan"], [W_CHI, "smile"]];

// ------------------------------------------------------------------------------------------------------- MAI and the kid
// (people.ts: Person.expr is the RESTING face and replaces "neutral": SU's and MAI's is "smile", the KID's "happy"; so a
// plain, blank face here is "deadpan" and a kid who has not understood yet is "smile")
const MAI_EXPR: [number, Expr][] = [[S.from, "smile"], [W_NAME + 4, "deadpan"], [W_QIONG + 2, "shock"], [W_QIONG + 14, "sad"], [B.brighten + 6, "relief_open"], [W_CHI, "smile"]];
/** the kid picks up the mood: blank at 昌化军安置, worried in the hold (his fidget stops, he looks up), happy again at 好吃 */
const KID_EXPR: [number, Expr][] = [[S.from, "happy"], [W_ANZHI + 6, "smile"], [L29.to + 4, "sad"], [B.brighten + 8, "happy"]];

// ------------------------------------------------------------------------------------------------------- SU
/** chewing, pleased; his name: he stops chewing and looks up (his resting smile, the eyes open); 琼州: a shock, held,
 *  then stunned (deadpan: blank, slit eyes) through D28 / D29; the read (focus, eyes on the page); he looks up, curious
 *  (the open eyes again: 海南……有什么), and brightens on 好吃 (happy), a grin while she says her aside */
const SU_EXPR: [number, Expr][] = [
  [S.from, "smile_closed"], [POP[1] - 2, "lick"], [POP[1] + 10, "smile_closed"], [W_NAME + 3, "smile"], [W_QIONG + 2, "shock"],
  [W_QIONG + 22, "deadpan"], [READ, "focus"], [B.look, "smile"], [B.brighten, "happy"], [W_CHI + 6, "grin"],
];
/** his facing at his mark: the courier, cheated toward her (the face reads); to GUO for the hand-off; to her to read */
const SU_TO_COURIER = lerpA(yawTo(S1, HORSE_AT), yawTo(S1, FEET), 0.55);
const SU_TO_GUO = yawTo(S1, G3);
const SU_TO_HER = lerpA(yawTo(S1, FEET), yawTo(S1, HORSE_AT), 0.12);
const suFacing = (f: number) => {
  if (f < L29.to) return SU_TO_COURIER;
  if (f < TURN[0]) return lerpA(SU_TO_COURIER, SU_TO_GUO, smooth(clamp01((f - L29.to) / 10)));
  return lerpA(SU_TO_GUO, SU_TO_HER, smooth(clamp01((f - TURN[0]) / (TURN[1] - TURN[0]))));
};
/** THE HAND-OFF (BEAT.D.take): straight before SU turned to GUO, at his reading height (his short arms reach it
 *  there); the roller across his front (yaw PSI = SU's frame: he holds the ends, GUO the middle from the other side) */
const PSI = SU_TO_GUO;
const HAND_OFF = rel(S1, PSI, 0, 0.98, 0.4);
/** the hand-off turns the two of them side-on to her: the rig may keep a body that far from her lens (its face still
 *  turns to her) so that the hands meet in front of the chests */
const SIDE_ON = 1.6, BODY_MAX = 45 * (Math.PI / 180);
/** the rig's body limit eased from its default (45 deg) to side-on over [a0, a1] and back over [b0, b1] (no snap) */
const sideOn = (f: number, a0: number, a1: number, b0: number, b1: number) => {
  const k = smooth(clamp01((f - a0) / (a1 - a0))) * (1 - smooth(clamp01((f - b0) / (b1 - b0))));
  return k > 0 ? lerp(BODY_MAX, SIDE_ON, k) : undefined;
};
/** THE BODY YAW THE RIG SHOWS (rig3d update step 1, the same sums for a standing figure under this still camera): the
 *  body turns toward her lens. A free hand hangs in that frame (HANG, measured on this cast), so a hand that is taken
 *  or let go starts or ends exactly where it hangs and never jumps. */
const shownYaw = (p: THREE.Vector3, facing: number, maxB = BODY_MAX, turn?: number) => {
  const dx = POS[0] - p.x, dz = POS[2] - p.z, deg = Math.PI / 180;
  const follow = smooth(clamp01((Math.hypot(dx, dz) / Math.max(Math.abs(POS[1] - (p.y + 1)), 1e-3) - 0.35) / 0.6));
  const camYaw = Math.atan2(dx, dz), off = wrapA(facing - camYaw), aOff = Math.abs(off), knee = 0.7 * maxB;
  const soft = aOff < knee ? aOff : knee + (maxB - knee) * (1 - Math.exp(-(aOff - knee) / Math.max(maxB - knee, 1e-4)));
  const wB = turn !== undefined ? clamp01(turn) : smooth(clamp01((aOff - 115 * deg) / (55 * deg)));
  return facing + follow * wrapA(camYaw + Math.sign(off) * lerp(soft, aOff, wB) - facing);
};
/** the rig's own back-view weight for a facing (what `turn: undefined` gives), to ease `turn` in from */
const autoTurn = (p: THREE.Vector3, facing: number) => smooth(clamp01((Math.abs(wrapA(facing - Math.atan2(POS[0] - p.x, POS[2] - p.z))) - (115 * Math.PI) / 180) / ((55 * Math.PI) / 180)));
/** where a standing figure's free hands hang in its shown body frame (x out, y up, z forward; measured in this shot) */
const HANG = { su: [0.29, 0.66, 0.03], guo: [0.179, 0.56, 0.034] } as const;
const hang = (p: THREE.Vector3, bodyYaw: number, h: readonly [number, number, number]): [THREE.Vector3, THREE.Vector3] => [rel(p, bodyYaw, -h[0], h[1], h[2]), rel(p, bodyYaw, h[0], h[1], h[2])];
/** the order in GUO's hands, from the courier's (T1) to the hand-off: carried before his chest, then held out */
const guoOrder = (f: number, g: { at: THREE.Vector3; facing: number }, co: Order): Order => {
  const carry = rel(g.at, g.facing, 0, 0.86, 0.27);
  const c = path(f, [[T1, co.c], [T1 + 12, carry], [TAKE - 12, carry], [TAKE, HAND_OFF]]);
  if (f < T1 + 12) c.copy(co.c.clone().lerp(carry, smooth(clamp01((f - T1) / 12))));
  else if (f < TAKE - 12) c.copy(carry);
  // the roller turns from pointing at him (the courier's offer: its yaw is a quarter turn short of his facing) to lie
  // across his chest in his own frame, then across SU's front for the hand-off (GUO facing SU: the same line)
  const yaw = f < TAKE - 12 ? lerpA(co.rot[1], g.facing, smooth(clamp01((f - T1) / 12))) : lerpA(g.facing, PSI + Math.PI, smooth(clamp01((f - (TAKE - 12)) / 10)));
  return { c, open: 0, rot: [0, yaw, 0] };
};
/** the order in SU's hands: taken by the ends at the hand-off; turned to her and lifted to reading height; unrolled
 *  (tipped back like a page, its foot clear of his belly); read; rolled up again in D31 and held at his belly */
const suOrder = (f: number, facing: number): Order => {
  const read = rel(S1, facing, 0, 1.0, 0.4), hold = rel(S1, facing, 0, 0.84, 0.36);
  const c = path(f, [[TAKE, HAND_OFF], [TURN[1], read, easeInOutCubic], [ROLLUP[0], read], [ROLLUP[1], hold]]);
  const open = f < ROLLUP[0] ? smooth(clamp01((f - OPEN[0]) / (OPEN[1] - OPEN[0]))) : 1 - smooth(clamp01((f - ROLLUP[0]) / (ROLLUP[1] - ROLLUP[0])));
  const yaw = lerpA(PSI, facing, smooth(clamp01((f - TURN[0]) / (TURN[1] - TURN[0]))));
  return { c, open, rot: [-0.45 * open, yaw, 0] };
};

// ------------------------------------------------------------------------------------------------------- her mic
const MIC_KEYS: [number, MicO["mode"], number?][] = [[L28.from - 8, "in", 12], [B.aside, "lens", 12]];

// ------------------------------------------------------------------------------------------------------- the take
// THE CAMERA PASS (PLAN 12, Jay's camera rules; the plan table: /home/user/su_work/cam2/D_plan.md). ONE TAKE, no cut
// (the fade through gold at the end is the join, unchanged). She does not move her feet (frozen where she stood when the
// hooves came: POS, the old tripod's spot, so the rig's turn-to-the-lens sums above stay exact); every move is her
// turning and zooming from there, each for a reason, landing on its word; between the moves the lens holds, with only
// her calm breathing (no drift, no sway):
//   0  pre        her look: the courier reining in, framed in the gateway, the fence and the open gate leaf before him
//   1  苏轼        STEP BACK WIDE as the family comes out round her (SU up from the right): the courier on top, SU in the
//                 right foreground; lands on D27's first word
//   2  琼州        SNAP ZOOM onto SU's shock (close), a decaying jolt; hold through 昌化军安置 (the calm look)
//   3  D28        STEP BACK to the stacked two-thing as the courier hands the order down to GUO (lands as the offer
//                 starts); hold through D29 and GUO's walk back
//   4  take       STEP IN and down along his look: SU's face over the opened order he holds out to her (lands as it is
//                 open); hold through the long read, his look up and 海南……有什么
//   5  好吃        SNAP ZOOM to the scene's one EXTREME CLOSE: his face lighting up; holds a second
//   6  aside      STEP BACK to a medium on him (calm), the family's and the courier's reactions round him; lands just
//                 before D31: the aside never leaves him
//   7  D31        SLOW PUSH: the aside's small step closer, to the fade
const RAD = Math.PI / 180;
const EYE_AT = V(POS[0], POS[1], POS[2]);
/** a camera at `pos` turned so that the world point `tgt` lands on screen (sx, sy) (px of 1080 x 1920) */
const aim = (pos: THREE.Vector3, tgt: THREE.Vector3, sy: number, sx: number, fov: number): CamPose => {
  const d = tgt.clone().sub(pos), hz = Math.hypot(d.x, d.z);
  const tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  const pitch = Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), yaw = Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th);
  const look = pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov };
};
/** a set-up: the world point tgt on screen (sx, sy) px, the lens angle (her feet never move) */
type Shot = { tgt: THREE.Vector3; sy: number; sx: number; fov: number };
const mixShot = (a: Shot, b: Shot, t: number): Shot => ({ tgt: a.tgt.clone().lerp(b.tgt, t), sy: lerp(a.sy, b.sy, t), sx: lerp(a.sx, b.sx, t), fov: lerp(a.fov, b.fov, t) });
const out3 = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
/** the little shake that lands with a snap: decays over n frames from `on` (one per event) */
const jolt = (c: CamPose, f: number, on: number, amp = 1, n = 7): CamPose => {
  const k = f - on; if (k < 0 || k >= n) return c; const d = amp * Math.pow(1 - k / n, 2);
  return C.nudge(c, { yaw: 0.9 * d * Math.sin(k * 2.3), pitch: 0.7 * d * Math.cos(k * 2.9), roll: 0.5 * d * Math.sin(k * 1.7) });
};
/** her calm breathing and nothing else (PLAN 12.2: still is the default; no wandering): a slow rise and fall */
const breathe = (c: CamPose, f: number): CamPose => { const b = Math.sin(2 * Math.PI * C.MOODS.calm.hz * (f / FPS)); return C.nudge(c, { up: 0.005 * b, pitch: 0.12 * b }); };
/** what she frames: the courier's head on his horse at its mark, SU's head on his mark */
const COURIER_HEAD = HORSE_AT.clone().add(V(0, 1.6, 0)), SU_HEAD = S1.clone().add(V(0, 1.3, 0));
const OPEN_: Shot = { tgt: COURIER_HEAD, sx: 520, sy: 700, fov: 34 };          // 0 the courier in the gateway
const WIDE: Shot = { tgt: SU_HEAD, sx: 800, sy: 700, fov: 62 };               // 1/3 the stacked two-thing
const SHOCK: Shot = { tgt: SU_HEAD, sx: 740, sy: 700, fov: 46 };              // 2 琼州
const READS: Shot = { tgt: SU_HEAD, sx: 600, sy: 660, fov: 48 };              // 4 the order
const XCU: Shot = { tgt: SU_HEAD, sx: 520, sy: 860, fov: 30 };                // 5 好吃
const ASIDE: Shot = { tgt: SU_HEAD, sx: 790, sy: 640, fov: 56 };              // 6 the aside
const NEAR: Shot = { ...ASIDE, sx: 760, fov: 50 };                                     // 7 its small step closer
/** the moves' frames (all from the beats) */
const M_WIDE = [B.rein + 2, L27.from] as const, M_BACK = [L27.to - 1, OFFER[0] + 4] as const, M_READ = [TAKE - 2, OPEN[1] - 2] as const;
const M_ASIDE = [B.brighten + 30, L31.from - 2] as const, M_PUSH = [L31.from + 4, B.fade[0]] as const;
export const camD = (f: number): CamPose => {
  let s = OPEN_;
  const go = (a: number, b: number, to: Shot, ease: (x: number) => number = smooth) => { if (f >= a) s = mixShot(s, to, ease((f - a) / Math.max(1, b - a))); };
  go(M_WIDE[0], M_WIDE[1], WIDE);                    // 1 the family comes out: step back wide, lands on 苏轼
  go(W_QIONG - 5, W_QIONG, SHOCK, out3);             // 2 snap onto his shock
  go(M_BACK[0], M_BACK[1], WIDE);                    // 3 the order goes down to GUO
  go(M_READ[0], M_READ[1], READS);                   // 4 SU takes it and opens it to her
  go(B.brighten - 5, B.brighten, XCU, out3);         // 5 好吃: the extreme close
  go(M_ASIDE[0], M_ASIDE[1], ASIDE);                 // 6 her aside: back to a medium, on him
  go(M_PUSH[0], M_PUSH[1], NEAR);                    // 7 the small step closer (slow, soft ends)
  return jolt(breathe(aim(EYE_AT, s.tgt, s.sy, s.sx, s.fov), f), f, W_QIONG, 0.8);
};

// ------------------------------------------------------------------------------------------------------- the shot
const restHands = (p: THREE.Vector3, facing: number, y = 0.64, x = 0.24, z = 0.06): [THREE.Vector3, THREE.Vector3] => [rel(p, facing, -x, y, z), rel(p, facing, x, y, z)];
/** a pair of hands that goes from `a` to `b` between frames f0 and f1 (eased) */
const handsTo = (f: number, f0: number, f1: number, a: [THREE.Vector3, THREE.Vector3], b: [THREE.Vector3, THREE.Vector3]): [THREE.Vector3, THREE.Vector3] => {
  const k = smooth(clamp01((f - f0) / Math.max(1, f1 - f0)));
  return [a[0].clone().lerp(b[0], k), a[1].clone().lerp(b[1], k)];
};

export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    const t = f / FPS;
    w.setPlace("yard");
    w.set.param("sun", "afternoon");
    w.set.param("lantern", 1);
    w.set.param("shells", 1);
    w.set.param("gate", 1);
    const cam = camD(f);
    w.setCamera(cam);

    // ---- the horse and its rider: the order in his hands until GUO has it
    const H = horseAt(f), seat = courierSeat(H.at, H.rot, H.pose, H.t, H.amount);
    const co = w.actor(COURIER);
    const CO = courierOrder(f, seat.seat.top, H.rot);
    const coRest = restHands(seat.seat.top, H.rot, 0.2, 0.12, 0.24);
    // his left hand lets go of the roller as the offer starts and goes down to his lap
    const coLeft = CO.hands[1] ?? courierOrder(OFFER[0] + 2, seat.seat.top, H.rot).letGo!.clone().lerp(coRest[1], smooth(clamp01((f - (OFFER[0] + 2)) / 10)));
    const coHands: [THREE.Vector3 | null, THREE.Vector3 | null] = f < T1 + 2 ? [CO.hands[0], coLeft]
      : handsTo(f, T1 + 2, T1 + 12, [GIVE_HAND(seat.seat.top, H.rot), coRest[1]], coRest);
    const onName = f >= W_NAME - 2 && f < W_NAME + 16;
    co.set({
      at: seat.at, facing: H.rot, seat: seat.seat, pose: { kind: "sit", t },
      hands: coHands,
      expr: at(f, COURIER_EXPR), blink: lid(t, 21, swaps(COURIER_EXPR)),
      lookDown: f >= UNROLL[1] - 4 && f < L27.to + 4 && !onName ? 9 : 0,
      gaze: onName ? -0.5 : f >= B.brighten && f < W_TIANBIAN ? 0.5 : 0,
      ...says("chai", ["D27"], f, 5),
      visible: true,
    });

    // ---- GUO: out to the gate, out to the horse, the order back to his father, a step back
    const g = guoAt(f), guo = w.actor(GUO);
    const gMax = sideOn(f, TAKE - 20, TAKE - 10, TAKE + 2, TAKE + 12);
    // at the horse his back is to her: the true back view (the rig would turn the body toward her lens and pull his
    // arms off the order); he turns back to her as he turns round with it
    const gTurn = f >= G_FETCH && f < G_TURN[1] ? lerp(autoTurn(g.at, g.facing), 1, smooth(clamp01((f - G_FETCH) / 12))) * (1 - smooth(clamp01((f - G_TURN[0]) / (G_TURN[1] - G_TURN[0])))) : undefined;
    const gRest = hang(g.at, shownYaw(g.at, g.facing, gMax, gTurn), HANG.guo);
    const GO = guoOrder(f, g, CO);
    let gHands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null];
    if (f >= T1 - 10 && f < T1) gHands = [handsTo(f, T1 - 10, T1, gRest, inner(CO.c, CO.rot[1], TAKE_SHIFT))[0], null];
    else if (f >= T1 && f < T1 + 12) { const p2 = inner(GO.c, GO.rot[1], gShift(f)); gHands = [p2[0], f < T1 + 4 ? null : handsTo(f, T1 + 4, T1 + 12, gRest, p2)[1]]; }
    else if (f >= T1 && f < TAKE + 2) gHands = inner(GO.c, GO.rot[1]);
    else if (f >= TAKE + 2 && f < TAKE + 12) gHands = handsTo(f, TAKE + 2, TAKE + 12, inner(HAND_OFF, PSI + Math.PI), gRest);
    // then they hang (pinned there: no swing on his step back)
    else if (f >= TAKE + 12) gHands = gRest;
    guo.set({
      at: g.at, facing: g.facing, pose: g.pose, hands: gHands, maxBody: gMax, turn: gTurn,
      expr: at(f, GUO_EXPR), blink: lid(t, 4, swaps(GUO_EXPR)),
      lookDown: f >= W_ANZHI && f < G_FETCH ? 6 : 0,
      gaze: (g.arrived && f < G_FETCH) || (f >= TAKE && f < B.aside) ? 0.5 : 0,
      ...says("guo", ["D29"], f, 4),
      // (off the left edge until he sets off: a sliver of his arm would show at the frame's edge)
      visible: f >= G_OUT,
    });

    // ---- MAI and the kid, hand in hand (MAI's right, the kid's left); the kid fidgets until D29
    const mL = walk2([M0, M1], M_V, (f - B.family) / FPS, { endFacing: MAI_FACE });
    const kL = walk2([K0, K1], K_V, (f - B.family) / FPS, { endFacing: MAI_FACE });
    const mai = w.actor(MAI), kid = w.actor(KID);
    const still = f >= L29.from;
    const fidget = still ? 0 : 0.22 * Math.sin(t * 2.3) + 0.12 * Math.sin(t * 3.7 + 1);
    const maiFace = mL.facing, kidFace = kL.facing + (kL.moving ? 0 : fidget);
    // the hands meet between MAI's right hand and the kid's left, at the height MAI's arm reaches down to
    const hm = mL.at.clone().lerp(kL.at, 0.5); hm.y = 0.58;
    const ax = kL.at.clone().sub(mL.at).setY(0).normalize();
    mai.set({
      at: mL.at, facing: maiFace, pose: mL.pose, hands: [hm.clone().addScaledVector(ax, -0.022), null],
      expr: at(f, MAI_EXPR), blink: lid(t, 6, swaps(MAI_EXPR)), lookDown: f >= W_ANZHI && f < B.brighten ? 8 : 0,
      gaze: f >= W_NAME ? 0.5 : 0,
      head: accent("laugh", f, B.brighten + 6, { dur: 0.7, amp: 0.4 }), visible: true,
    });
    kid.set({
      at: kL.at, facing: kidFace, pose: kL.pose, hands: [null, hm.clone().addScaledVector(ax, 0.022)],
      expr: at(f, KID_EXPR), blink: lid(t, 8, swaps(KID_EXPR)),
      gaze: still ? 0.5 : [0, -0.5, 0.5, 0][Math.floor(t * 1.1) % 4],
      lookDown: still && f < B.brighten ? -6 : 0,
      head: still ? undefined : { tilt: 5 * Math.sin(t * 1.9) }, visible: true,
    });

    // ---- SU: in last, a lychee popped into his mouth; chewing until his name; the order from GUO; the read; D30
    const sL = walkAlong([S0, S1], 0.8, (f - SU_IN) / FPS, { endFacing: SU_TO_COURIER });
    const su = w.actor(SU);
    const facing = sL.moving || f < L29.to ? sL.facing : suFacing(f);
    const SO = suOrder(f, facing);
    const chew = f >= POP[1] && f < W_NAME + 2 ? { squash: 0.035 * Math.sin((f - POP[1]) * 0.75) } : undefined;
    const reading = f >= READ && f < B.look + 2;
    // his hands are pinned all through (a free hand would swing on his walk in): they hang where they hang by
    // themselves (HANG in his shown body frame) unless they hold something
    const sMax = sideOn(f, TAKE - 16, TAKE - 6, TURN[1], TURN[1] + 8);
    const sHang = hang(sL.at, shownYaw(sL.at, facing, sMax), HANG.su);
    const carry = rel(sL.at, facing, -0.26, 0.76, 0.2), mouthP = rel(sL.at, facing, -0.07, 1.12, 0.3);
    // his left hand is kept at his side a little back, where his beard (it always turns to her lens) cannot hang over
    // it: the end of his walk in (he turns to the courier) and side-on at the take
    const leftBack = rel(sL.at, facing, 0.31, 0.68, -0.1);
    const L_IN: [number, number, number, number] = [SU_STOP - 12, SU_STOP - 6, SU_STOP + 6, SU_STOP + 12];
    const kBack = smooth(clamp01((f - L_IN[0]) / (L_IN[1] - L_IN[0]))) * (1 - smooth(clamp01((f - L_IN[2]) / (L_IN[3] - L_IN[2]))));
    let right: THREE.Vector3, left: THREE.Vector3 = sHang[1].clone().lerp(leftBack, kBack);
    // the right hand: the lychee to his mouth (on his way in), down to its hang; to the order's end at the take
    if (f < POP[0] - 6) right = carry;
    else if (f < POP[1] + 8) right = path(f, [[POP[0] - 6, carry], [POP[0] + 2, mouthP], [POP[1] - 2, mouthP], [POP[1] + 8, sHang[0]]]);
    else if (f < TAKE - 8) right = sHang[0];
    else if (f < TAKE) right = sHang[0].clone().lerp(ends(HAND_OFF, [0, PSI, 0], 0)[0], smooth(clamp01((f - (TAKE - 8)) / 8)));
    else right = ends(SO.c, SO.rot, SO.open)[0];
    // the left hand: back out of his beard as he turns to GUO; to the order's other end once he has turned to her
    // (side-on to her his face, and its long beard, still turn to her lens and hang over his near, left, arm)
    if (f >= L29.to - 14 && f < TURN[1] - 6) left = sHang[1].clone().lerp(leftBack, smooth(clamp01((f - (L29.to - 14)) / 8)));
    else if (f >= TURN[1] - 6) left = leftBack.clone().lerp(ends(SO.c, SO.rot, SO.open)[1], smooth(clamp01((f - (TURN[1] - 6)) / 6)));
    const sHands: [THREE.Vector3 | null, THREE.Vector3 | null] = [right, left];
    const sp = says("su", ["D30"], f, 1);
    su.set({
      at: sL.at, facing, pose: sL.pose,
      // the lychee to his mouth: the arm in front of his beard
      hands: sHands, armFront: [f >= POP[0] - 2 && f < POP[1] + 4 ? true : undefined, undefined],
      maxBody: sMax,
      expr: at(f, SU_EXPR), blink: lid(t, 1, swaps(SU_EXPR)), ...sp,
      head: heads(chew, sp.head, accent("pop", f, W_NAME), accent("jolt", f, W_QIONG), accent("nod", f, B.look + 2, { amp: 0.4 }), accent("pop", f, B.brighten),
        { tilt: ky(f, [[B.look, 0], [B.look + 8, 4], [W_YOU, 4], [W_YOU + 8, -2], [L30.to, -2], [L30.to + 10, 0]]) }),
      gaze: f >= W_NAME && f < L28.from ? -0.5 : f >= L28.from && f < TAKE ? -0.5 : f >= W_TIANBIAN && f < W_CHI + 4 ? -0.5 : 0,
      lookDown: reading ? 9 : f >= W_ANZHI && f < L28.from ? 4 : 0,
      hide: [...SU_HAT.cap],
      // (off the right edge until he sets off: a sliver of his hand would show at the frame's edge)
      visible: f >= SU_IN,
    });

    w.update();

    // ---- props: the horse, the order, the lychee
    w.prop("horse").put(H.at, { rot: H.rot, pose: H.pose, t: H.t, amount: H.amount, rider: "#c23a30" });
    const O = f < T1 ? CO : f < TAKE ? GO : SO;
    w.prop("scroll").put(O.c, { rot: O.rot, open: O.open });
    if (f >= SU_IN && f < POP[1] - 2) w.prop("lychee").put(su.handWorld(0), { grip: "hilt", peeled: 1, scale: 1.35 });

    // ---- her mic: toward GUO (who answers D28), over to SU (D30), round to the lens (D31)
    const gHead = guo.headWorld(), sHead = su.headWorld();
    const mAim = gHead.clone().lerp(sHead, smooth(clamp01((f - (L29.to + 2)) / 16))).add(V(0, -0.1, 0));
    putHer(w, cam, f, { mic: { ...herKeys(f, MIC_KEYS), aim: mAim, avoid: [gHead, sHead] } });

    return { camera: cam, overlays: frag(transitionAt(f)?.node ?? null), slate: `D ${f < L27.from ? "rein" : f < L28.from ? "order" : f < L29.to ? "where" : f < B.look ? "read" : f < B.aside ? "food" : "aside"}` };
  },
};

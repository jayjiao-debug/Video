// Segment B helper: the S05-S08 camera (f536-1012), re-fitted to the 84-seat classroom (sets/classroom v2).
// Builder B owns this file. Every move is a Catmull-Rom path through key poses, travelled by ARC LENGTH with the
// storyboard's easing (so speed is 0 at both ends of every move and nothing jerks at a key); look points and fov are keyed
// to the same keys. Positions are checked in segB.ts (dbg) against desks, chairs, heads, walls and every rope.
//
// Storyboard -> re-fit (YOU = seat 41, hip (-0.558, 0.472, 1.048); the room is 3 blocks x 7 rows, Y3 runs level along
// the lane behind row 3's chairs at z 1.33 to the riser at x -5.70):
//   OTS_YOU      = floor(41) + (0.30, 1.40, 0.55), look floor(41) + (-0.05, 0.60, -0.45), fov 55   (formula unchanged, H1)
//   WIDE5_A      (2.66, 2.85, 5.50) yaw 21 deg pitch -22 fov 76: the room from the back corner over the heads (WIDE5's
//                (2.70, 2.45, 3.90) now sits among row 5's heads); ~40 seats in frame, YOU at x ~20 %
//   S06 pan      yaw 21 -> 43 deg (toward the windows), position fixed, f697-742
//   TWO_FISTS    (-1.18, 2.35, 2.15) -> your fists (-0.58, 0.80, 1.04), fov 54: high over your left shoulder, 2.0 m
//                back, looking down on the back of your head and both fists held out sideways, 0.9 m apart (the
//                formula's spot 0.9 m behind the toon head fills 80 % of the frame with it; a front view hides the fists)
//   C1_GRIP      (-0.30, 1.75, -0.10) -> (0.0, 1.0, 0.95), fov 44: above the front of your desk, behind row 2's heads,
//                looking back at C1's face and grip with Y5 coming in from the left (C1 is the adjacent desk now,
//                0.68 m away: from beside you the toon heads fill the frame)
//   KNOT_CAM     (-4.95, 1.85, 1.95) -> the knot at y 40 %, fov 36: above the lane between row 3 and row 4, looking
//                down at the riser (Y3 is 5 m long now)
//   MED_YOU_WIN  (-0.90, 2.10, -0.15) -> YOUR face, fov 42: high over row 2's backs, 1.5 m in front of you (the
//                storyboard's spot in front of the desks would look at you through three rows of heads)
//   FEET         (-2.00, 1.05, 1.50) -> G2's end by your LEFT shoe, fov 52: the window-side aisle is on your left in
//                the re-fit and G2 comes along the lane behind row 3; at y 0.32 the chair and desk legs fill the frame
//   aisle travel x -1.98..-1.95, y 0.95, z 1.50 -> 3.75, looking down along G2 on the aisle floor toward C2
//   C2 grip      (-1.95, 1.05, 4.10) -> C2's hand, fov 50
//   C2_BEHIND    (-2.90, 2.65, 5.10) -> (-0.56, 0.67, 1.05), fov 34 (H2): the formula C2 + (-0.28, 1.38, 0.57) puts
//                seat 52's head 9 cm from the line to YOUR head; this one, high behind C2's left shoulder, clears every
//                head by >= 0.2 m
import * as THREE from "three";
import type { CamPose, Vec3 } from "../story";
import { lin, lerp, smooth, easeInOutCubic, easeInOutQuad } from "../story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const D = Math.PI / 180;
type Key = { p: Vec3; l: Vec3; fov: number };
/** the unit direction for a yaw (deg, 0 = looking -z, + = turning toward -x, the windows) and pitch (deg) */
export const dirOf = (yaw: number, pitch: number): Vec3 => [-Math.sin(yaw * D) * Math.cos(pitch * D), Math.sin(pitch * D), -Math.cos(yaw * D) * Math.cos(pitch * D)];
const along = (p: Vec3, d: Vec3, k: number): Vec3 => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

const cr = (P: Vec3[], k: number, t: number): Vec3 => {
  const n = P.length, g = (i: number): Vec3 => {
    if (i < 0) return [2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1], 2 * P[0][2] - P[1][2]];
    if (i >= n) return [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1], 2 * P[n - 1][2] - P[n - 2][2]];
    return P[i];
  };
  const p0 = g(k - 1), p1 = g(k), p2 = g(k + 1), p3 = g(k + 2), t2 = t * t, t3 = t2 * t;
  const o: Vec3 = [0, 0, 0];
  for (let c = 0; c < 3; c++) o[c] = 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3);
  return o;
};
/** one camera move: keys travelled by arc length with an easing; look / fov follow the same key parameter */
class Move {
  private P: Vec3[]; private L: Vec3[]; private F: number[];
  private cum: number[] = []; private seg: number[] = []; private tau: number[] = []; private total = 0;
  constructor(readonly f0: number, readonly f1: number, keys: Key[], readonly ease: (x: number) => number = easeInOutCubic) {
    this.P = keys.map((k) => k.p); this.L = keys.map((k) => k.l); this.F = keys.map((k) => k.fov);
    const N = 48; let prev = V(...this.P[0]), acc = 0;
    this.cum.push(0); this.seg.push(0); this.tau.push(0);
    for (let k = 0; k < keys.length - 1; k++) for (let j = 1; j <= N; j++) {
      const q = V(...cr(this.P, k, j / N)); acc += q.distanceTo(prev); prev = q;
      this.cum.push(acc); this.seg.push(k); this.tau.push(j / N);
    }
    this.total = acc;
  }
  /** (key segment, local t) at eased progress u */
  private loc(u: number): [number, number] {
    if (this.total < 1e-6) { const x = u * (this.P.length - 1), k = Math.min(this.P.length - 2, Math.floor(x)); return [k, x - k]; }
    const s = u * this.total; let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < s) i++;
    const a = this.cum[i - 1], b = this.cum[i], w = b > a ? (s - a) / (b - a) : 0;
    const k = this.seg[i], t0 = this.seg[i - 1] === k ? this.tau[i - 1] : 0;
    return [k, t0 + (this.tau[i] - t0) * w];
  }
  at(f: number): CamPose {
    const [k, t] = this.loc(this.ease(lin(f, this.f0, this.f1)));
    return { pos: cr(this.P, k, t), look: cr(this.L, k, t), fov: lerp(this.F[k], this.F[k + 1], smooth(t)) };
  }
}

// ------------------------------------------------------------------------------------------------- key poses
export const WIDE5_A = { pos: [2.66, 2.85, 5.5] as Vec3, yaw: 21, pitch: -22, fov: 76 };
/** S05's slow dolly 0.30 m left (perpendicular to the view, yaw 21) ends here; S06 pans from it */
export const WIDE5_B: Vec3 = along(WIDE5_A.pos, [-Math.cos(21 * D), 0, Math.sin(21 * D)], 0.3);
export const PAN_YAW = 22;
export const C1_GRIP: CamPose = { pos: [-0.3, 1.75, -0.1], look: [0.0, 1.0, 0.95], fov: 44 };
export const KNOT_LOOK: Vec3 = [-5.68, 0.93, 1.36];
export const KNOT_CAM: CamPose = { pos: [-4.95, 1.85, 1.95], look: KNOT_LOOK, fov: 36 };
export const MED_YOU_WIN: CamPose = { pos: [-0.9, 2.1, -0.15], look: [-0.56, 0.9, 1.0], fov: 42 };
export const FEET: CamPose = { pos: [-2.0, 1.05, 1.5], look: [-1.1, 0.02, 1.28], fov: 52 };
export const C2_GRIP: CamPose = { pos: [-1.95, 1.05, 4.1], look: [-2.42, 1.05, 4.95], fov: 50 };
/** H2 (B -> C, static f990-1012): segment C starts from exactly this */
export const C2_BEHIND: CamPose = { pos: [-2.9, 2.65, 5.1], look: [-0.56, 0.67, 1.05], fov: 34 };

export type BCams = { OTS_YOU: CamPose; TWO_FISTS: CamPose; at: (f: number) => CamPose };
/** build the segment's camera from YOUR seat's floor point (the storyboard's SEAT_YOU) */
export function buildCams(you: THREE.Vector3): BCams {
  const F = (dx: number, dy: number, dz: number): Vec3 => [you.x + dx, dy, you.z + dz];
  const OTS_YOU: CamPose = { pos: F(0.3, 1.4, 0.55), look: F(-0.05, 0.6, -0.45), fov: 55 };
  const TWO_FISTS: CamPose = { pos: F(-0.62, 2.35, 1.1), look: F(-0.02, 0.8, -0.01), fov: 54 };
  const W5look = along(WIDE5_A.pos, dirOf(WIDE5_A.yaw, WIDE5_A.pitch), 6);
  const op = OTS_YOU.pos as Vec3, ol = OTS_YOU.look as Vec3;
  // S05 f536-590: straight up to y 2.3 (the first ~15 % of the path: f536-552 under the easing), then back-right over
  // the heads to WIDE5_A; easeInOutCubic overall
  const rise = new Move(536, 590, [
    { p: op, l: ol, fov: 55 },
    { p: [op[0], 1.85, op[2]], l: [ol[0] - 0.01, 0.61, ol[2] - 0.2], fov: 57 },
    { p: [op[0] + 0.06, 2.3, op[2] + 0.15], l: [ol[0] + 0.06, 0.62, ol[2] - 0.55], fov: 61 },
    { p: [1.2, 2.62, 3.75], l: [0.1, 0.62, 0.25], fov: 70 },
    { p: WIDE5_A.pos, l: W5look, fov: WIDE5_A.fov },
  ]);
  const W5Blook = (yaw: number) => along(WIDE5_B, dirOf(yaw, WIDE5_A.pitch), 6);
  const endYaw = WIDE5_A.yaw + PAN_YAW;
  // S07 f793-815: forward over the heads (y >= 2.35) and down onto your left shoulder (TWO_FISTS)
  const glide = new Move(793, 815, [
    { p: WIDE5_B, l: W5Blook(endYaw), fov: 76 },
    { p: [1.0, 2.6, 4.2], l: [-0.5, 0.9, 1.0], fov: 64 },
    { p: [-0.4, 2.62, 2.9], l: [-0.58, 0.8, 1.02], fov: 60 },
    { p: TWO_FISTS.pos as Vec3, l: TWO_FISTS.look as Vec3, fov: 54 },
  ]);
  // f818-836: right along Y5, over your head (0.7 m clear) and round in front of your desk to C1's grip and face
  const toC1 = new Move(818, 836, [
    { p: TWO_FISTS.pos as Vec3, l: TWO_FISTS.look as Vec3, fov: 54 },
    { p: [-0.45, 2.15, 1.0], l: [-0.1, 0.9, 1.0], fov: 50 },
    { p: [-0.3, 1.95, 0.32], l: [0.0, 0.98, 0.98], fov: 46 },
    { p: C1_GRIP.pos as Vec3, l: C1_GRIP.look as Vec3, fov: 44 },
  ]);
  // f838-858: up over your fists and head, then along Y3 (above the lane, over row 3's heads) down to the knot
  const toKnot = new Move(838, 858, [
    { p: C1_GRIP.pos as Vec3, l: C1_GRIP.look as Vec3, fov: 44 },
    { p: [-0.7, 2.12, 0.95], l: [-1.9, 0.95, 1.3], fov: 42 },
    { p: [-2.4, 2.12, 1.75], l: [-4.6, 0.95, 1.34], fov: 38 },
    { p: [-3.9, 2.0, 1.9], l: [-5.5, 0.93, 1.36], fov: 36 },
    { p: KNOT_CAM.pos as Vec3, l: KNOT_LOOK, fov: 36 },
  ]);
  // f862-882: up and back from the knot, the look running back along Y3 to YOU
  // (YOU are in frame by f870, when the "?" pops; still from f880)
  const toMed = new Move(862, 880, [
    { p: KNOT_CAM.pos as Vec3, l: KNOT_LOOK, fov: 36 },
    { p: [-3.9, 2.3, 0.9], l: [-0.75, 0.95, 1.05], fov: 40 },
    { p: MED_YOU_WIN.pos as Vec3, l: MED_YOU_WIN.look as Vec3, fov: 42 },
  ]);
  // S08 f888-915: crane down the window-side aisle to the floor by G2's end
  const crane = new Move(888, 915, [
    { p: MED_YOU_WIN.pos as Vec3, l: MED_YOU_WIN.look as Vec3, fov: 42 },
    { p: [-1.5, 2.1, 0.4], l: [-0.85, 0.5, 1.15], fov: 46 },
    { p: [-2.0, 1.8, 1.2], l: [-1.15, 0.1, 1.28], fov: 50 },
    { p: FEET.pos as Vec3, l: FEET.look as Vec3, fov: 52 },
  ]);
  // f915-945: turn and travel up the aisle along G2 (easeInOutQuad)
  const travel = new Move(915, 945, [
    { p: FEET.pos as Vec3, l: FEET.look as Vec3, fov: 52 },
    { p: [-1.98, 0.95, 2.75], l: [-2.0, 0.0, 4.1], fov: 52 },
    { p: [-1.95, 0.95, 3.75], l: [-2.25, 0.35, 4.95], fov: 52 },
  ], easeInOutQuad);
  const riseC2 = new Move(945, 958, [
    { p: [-1.95, 0.95, 3.75], l: [-2.25, 0.35, 4.95], fov: 52 },
    { p: C2_GRIP.pos as Vec3, l: C2_GRIP.look as Vec3, fov: 50 },
  ]);
  // f960-990: arc up behind C2 to C2_BEHIND (H2)
  const arc = new Move(960, 990, [
    { p: C2_GRIP.pos as Vec3, l: C2_GRIP.look as Vec3, fov: 50 },
    { p: [-1.9, 1.45, 4.72], l: [-2.15, 0.6, 4.0], fov: 48 },
    { p: [-2.05, 1.95, 5.42], l: [-1.6, 0.45, 2.6], fov: 42 },
    { p: [-2.55, 2.45, 5.42], l: [-0.9, 0.6, 1.5], fov: 37 },
    { p: C2_BEHIND.pos as Vec3, l: C2_BEHIND.look as Vec3, fov: C2_BEHIND.fov },
  ]);
  const at = (f: number): CamPose => {
    if (f <= 536) return OTS_YOU;
    if (f <= 590) return rise.at(f);
    if (f <= 672) { const p = along(WIDE5_A.pos, [-Math.cos(21 * D), 0, Math.sin(21 * D)], 0.3 * lin(f, 590, 672)); return { pos: p, look: along(p, dirOf(WIDE5_A.yaw, WIDE5_A.pitch), 6), fov: 76 }; }
    if (f <= 793) { const yaw = WIDE5_A.yaw + PAN_YAW * easeInOutCubic(lin(f, 697, 742)); return { pos: WIDE5_B, look: W5Blook(yaw), fov: 76 }; }
    if (f <= 815) return glide.at(f);
    if (f <= 818) return TWO_FISTS;
    if (f <= 836) return toC1.at(f);
    if (f <= 838) return C1_GRIP;
    if (f <= 858) return toKnot.at(f);
    if (f <= 862) return KNOT_CAM;
    if (f <= 880) return toMed.at(f);
    if (f <= 888) return MED_YOU_WIN;
    if (f <= 915) return crane.at(f);
    if (f <= 945) return travel.at(f);
    if (f <= 958) return riseC2.at(f);
    if (f <= 960) return C2_GRIP;
    if (f <= 990) return arc.at(f);
    return C2_BEHIND;
  };
  return { OTS_YOU, TWO_FISTS, at };
}

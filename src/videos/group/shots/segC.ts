// segment C, frames 771-1366 (lines 07-10): the blindfold version of the 1974 rope experiment (Ingham et al., exp. 2),
// then the push into the dial. The dial shows the TOTAL real force on the rope, one person's full solo pull = 16 units.
//   771-776  H2 hold (segB's last frame): cams.side, all six standing on the rope, the researcher with her clipboard, dial 20.
//   777      cut to cams.pos1 (line 07). The researcher, behind square 1 on the window side, lifts a dark cloth in both
//            hands (puller 1 glances back at her, nervous), brings it over the head and ties it: 眼睛 (f815) the
//            blindfold is on (from then only puller 1's mouth / brows act, no glances). Meanwhile pullers 3-6 let go
//            and walk out to the bench by the +z wall (off-frame in pos1 and in side); puller 2 stays. 告诉你: she
//            gestures back along the rope; 一起拉: puller 2 leans in as if pulling, but the rope behind square 1 goes
//            slack (pretend). She steps away to the window side (out of pos1's frame) before the wide beat.
//   917      cut to cams.side (line 08), a slow eased push of the lens: puller 1 pulls for real (hook -> square 1 taut,
//            needle 3 -> 16), puller 2 leans but the rope to him hangs slack; 你一个人: the taut rope glows a little, a
//            假装 chip pops over puller 2. The researcher by the windows watches the dial with her clipboard.
//   1009     the label card 以为有几个帮手 (segB's PctCard): 0个 100% (the reference) ; 90% (f1050) 1个 90%, needle 16 ->
//            14.4 ; pullers 3-6 walk back in from the bench, turn, pick the rope off the floor, pretend (slack through all
//            of them, one chip 都在假装) ; 85% (f1143) 2-6个 85%, needle -> 13.6. She reads the dial and writes each time.
//            The card leaves by f1194.
//   1199     cut to a plain eye-level framing on puller 1 near pos1 (line 10), a slow push-in: blindfolded, pulling in a
//            relaxed, comfortable way, content; 15% (f1250) the gold −15% (segA_minus) beside the head, gone by f1302.
//   1311     松的劲: cut to the dial, square-on (cams.dial's lens), a straight eased push along the ray through the bezel
//            centre to the match frame f1366: bezel 0.92 W wide, centre (540, 760), needle settling at 13.6 (segD's
//            back-wall clock takes over at f1367 at the same size and place).
// Every number on screen is from the script (100 / 90 / 85). The crew solver is shots/segC_crew.ts (labcommon.crewPose
// copied and extended; labcommon stays untouched). dbg logs the geometry checks (IP='{"dbg":true}').
import React from "react";
import { getInputProps } from "remotion";
import * as THREE from "three";
import type { Segment, CamPose, Vec3 } from "../story";
import { SEGMENTS, FPS, h, spl, smooth, lerp, clamp01, spring, mix3, between, easeInOutCubic, easeInOutQuad } from "../story";
import type { World } from "../world";
import { lidAt, type FigState, type FxKind, type Figure } from "../kit/cast";
import { WALK_CYCLE_M, type Expr } from "../kit/toon";
import { Rope } from "../kit/rope";
import { RopeChip } from "../kit/overlay";
import { acquireCrew, releaseCrew, crewPose, H2_CAM, h2Pullers, H2_RESEARCHER, H2_DIAL, type Crew } from "./labcommon";
import { crewC, footY, type CPuller } from "./segC_crew";
import { PctCard } from "./segB_card";
import { MinusPct } from "./segA_minus";

const S = SEGMENTS.find((s) => s.id === "C")!;
const IP = getInputProps() as { dbg?: boolean };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------- beats (frames)
// captions: 于是他们 777 · 蒙上你的【眼睛】800-834 · 告诉你 835 · 身后还有人【一起拉】864-916 · 其实绳子上 917 ·
// 只有【你一个人】947-983 · 在用力 984 · 以为有【1个】帮手 1007 · 你出【90%】1050 · 以为有【2到6个】1099 · 只剩【85%】1143-1195 ·
// 这回 1199 · 没有同步的问题 1210 · 少的这【15%】1250 · 是你自己【松的劲】1311-1358
const B = {
  h2End: 776,
  pos1: 777,
  /** she lifts the cloth / it goes over the head / blindfold on (眼睛) / knot done */
  raise: 783, over: 801, blind: 815, tied: 832,
  /** 告诉你: the gesture back along the rope (in, out) */
  tell: 838, tellOut: 866,
  /** pullers 3-6 let go and leave (start frames, the walk frames) */
  leave: [0, 0, 789, 793, 797, 801], leaveDur: 62,
  /** 一起拉: puller 2 leans in, the rope behind square 1 goes slack */
  p2: 881,
  /** she steps away to the window side (out of line 07's frame) */
  resGo: 878, resAt: 908,
  side: 917,
  /** line 09: cut from main to side (the dial, the card, the walk-ins) */
  l09: 1007,
  /** puller 1 starts to really pull */
  pull: 918,
  /** 你一个人: glow + chip */
  one: 950, oneOut: 998,
  card: 1009, b0: 1013, b90: 1050, b85: 1143, cardOut: 1186,
  /** walkers 3-6: walk start, arrival (turn), grip (down = 1), lift done (pretend) */
  walk0: [0, 0, 1066, 1076, 1086, 1096], walkDur: 62, downDur: 6, liftDur: 8,
  /** the group chip 都在假装 */
  group: 1170, groupOut: 1190,
  p1: 1199,
  pct: 1251, pctOut: 1296,
  dial: 1311, end: S.to,
};
/** grip frame of walker i (the turn takes 2 frames, the reach down B.down) */
const arrive = (i: number) => B.walk0[i] + B.walkDur;
const grip = (i: number) => arrive(i) + 2 + B.downDur;

// ---------------------------------------------------------------------------------------------------- places
/** the researcher's spot by the windows for lines 08-10 (window side, 1.45 m off the rope line, in front of radiator 2):
 *  in the side view her head sits in the gap between the heads of squares 4 and 5 (measured in dbg) */
const RES_ASIDE = V(-0.85, 0, -2.15);
/** where she ties the blindfold: just behind square 1 on the window side (anchors.researcher moved 0.1 m to the
 *  camera's left; the cut hides it). From line 07's raised camera her head sits above-left of square 1's head */
const TIE = V(-1.67, 0, -1.165);
/** she leaves line 07's frame toward the windows (off its left edge), then goes on to RES_ASIDE off-screen */
const EXIT_W = V(-1.45, 0, -2.25);
/** where her line-07 walk ends: off line 07's left edge (0.3 m short of EXIT_W; the cut to line 08 covers the rest) */
const EXIT_07 = V(-1.75, 0, -2.25);
/** the bench by the +z wall where the confederates wait (x -1.5..0.5, z 2.09..2.49): walkers stop short of it; the
 *  spots are off-frame in pos1 and side (checked in dbg) */
const offSpot = (w: World, i: number) => V(w.lab.A.positions[i].x, 0, i <= 3 ? 1.85 : i === 4 ? 1.72 : 1.9);

// ---------------------------------------------------------------------------------------------------- cameras
/** line 07: pos1's spot raised to standing eye height (1.5 m, ~11 deg down, like side / main) with a wider lens and
 *  2 deg to the left: the researcher's head (behind square 1, farther) sits above-left of square 1's head */
const L07: CamPose = { pos: [-3.3, 1.5, 0.23], look: [-1.98, 1.15, -0.67], fov: 54 };
/** line 08: cams.main (the faces camera beside the gauge: square 1 large at the left, the rope out of the left edge to
 *  the shackle, square 2 behind it) with a slow eased push along its axis */
const L08_PUSH = 0.2, L08_FOV = 66, L08_PAN = 8.5;
/** line 10: from pos1's spot, a wider lens (square 1 head to knees, the rope to the shackle at the left, square 2
 *  behind at the right), then a slow push-in along pos1's axis to a medium close-up (head and torso) */
const L10_FOV0 = 60, L10_FOV1 = 50, L10_PUSH = 0.2;
/** the dial push: square-on (axis -x), cams.dial's lens; the bezel's front rim lies 1 cm in front of the face plane */
const DIAL_FOV = 74, TAN_V = Math.tan((DIAL_FOV * Math.PI) / 360);
const MATCH = { d: 0.92 * 1080, y: 760 };
const dialCam = (w: World, d: number): CamPose => {
  const A = w.lab.A, xb = A.dialCentre.x + 0.01;
  // a level dolly along -x (no tilt: square-on) at the height that puts the bezel centre at screen y 760 at D_END
  // (it rises from ~y 820 at D_START); the rope below stays >= 0.41 m from the lens
  const dy = ((960 - MATCH.y) / 960) * TAN_V * D_END;
  const y = A.dialCentre.y - dy;
  return { pos: [xb + d, y, A.dialCentre.z], look: [xb - 1, y, A.dialCentre.z], fov: DIAL_FOV };
};
/** bezel front-rim distance that makes it MATCH.d px across */
const D_END = (0.324 * 1920) / (MATCH.d * TAN_V), D_START = 1.16;
/** trapezoid-velocity progress 0..1 over [f0, f1]: smooth ramps of `a` frames in and `d` frames out */
const trap = (f: number, f0: number, f1: number, a: number, d: number) => {
  const T = f1 - f0, x = Math.max(0, Math.min(T, f - f0));
  const vmax = 1 / (T - a / 2 - d / 2);
  if (x <= a) return vmax * (x * x) / (2 * a);
  if (x <= T - d) return vmax * (a / 2 + (x - a));
  const y = T - x;
  return 1 - vmax * (y * y) / (2 * d);
};
const cpose = (c: { pos: unknown; look: unknown; fov: number }): CamPose => ({ pos: [...(c.pos as Vec3)] as Vec3, look: [...(c.look as Vec3)] as Vec3, fov: c.fov });
const camAt = (w: World, f: number): CamPose => {
  const cams = w.lab.set.cams;
  if (f <= B.h2End) return cpose(H2_CAM(w));
  if (f < B.side) return cpose(L07);
  if (f < B.l09) {
    // line 08: main panned L08_PAN deg toward square 1, pushed slowly along that axis (eased inside the line)
    const k = between(f, B.side, B.l09 - 1, easeInOutQuad), a = cpose(cams.main), ap = a.pos as Vec3;
    const dir = V(...(a.look as Vec3)).sub(V(...ap)).applyAxisAngle(V(0, 1, 0), (L08_PAN * Math.PI) / 180).normalize();
    const pos = V(...ap).addScaledVector(dir, L08_PUSH * k), look = pos.clone().addScaledVector(dir, 5);
    return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(cams.main.fov, L08_FOV, k) };
  }
  // line 09: exactly cams.side, still (the card is up, the walkers move)
  if (f < B.p1) return cpose(cams.side);
  if (f < B.dial) {
    const k = trap(f, B.p1, B.dial + 24, 10, 40), a = cpose(cams.pos1);
    const d = V(...(a.look as Vec3)).sub(V(...(a.pos as Vec3))).normalize().multiplyScalar(L10_PUSH * k);
    const ap = a.pos as Vec3;
    return { pos: [ap[0] + d.x, ap[1] + d.y, ap[2] + d.z], look: a.look, fov: lerp(L10_FOV0, L10_FOV1, k) };
  }
  const k = trap(f, B.dial - 3, B.end, 3, 40);
  return dialCam(w, lerp(D_START, D_END, k));
};

// ---------------------------------------------------------------------------------------------------- the dial
const sp = (f: number, at: number) => spring((f - at) / FPS, { freq: 1.5, zeta: 0.7 });
/** total real force on the rope (dial units, one solo pull = 16): 6 relaxed 20 -> 2 relaxed 6.7 -> p1 relaxed 3.3 ->
 *  p1 pulling 16 -> 90 % 14.4 -> 85 % 13.6; trembles a few tenths while p1 pulls (fading to 0 at the match frame) */
const dialAt = (f: number) => {
  const t = f / FPS;
  const base = H2_DIAL + (6.7 - H2_DIAL) * sp(f, B.leave[2] + 2) + (3.3 - 6.7) * sp(f, B.p2 + 4) + (16 - 3.3) * sp(f, B.pull + 2)
    + (14.4 - 16) * sp(f, B.b90 + 2) + (13.6 - 14.4) * sp(f, B.b85 + 2);
  const amp = 0.3 * smooth((f - B.pull) / 12) * (1 - smooth((f - (B.end - 18)) / 16));
  return base + amp * (0.7 * Math.sin(2 * Math.PI * 1.7 * t) + 0.3 * Math.sin(2 * Math.PI * 4.3 * t + 1.3));
};

// ---------------------------------------------------------------------------------------------------- acting helpers
const ky = (f: number, keys: [number, number][]) => spl(keys, f, smooth);
const exprAt = (f: number, keys: [number, Expr][]) => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
/** the crew's blink clock (t + 30, id 100 + i), with a blink across every expression swap */
const blinkAt = (f: number, id: number, keys: [number, Expr][]) => lidAt(f / FPS + 30, id, keys.slice(1).map(([k]) => k / FPS + 30));
const fxAt = (f: number, kind: FxKind, at: number, out: number): { kind: FxKind; t: number }[] => {
  if (f < at || f >= out + 5) return [];
  if (f < out) return [{ kind, t: (f - at) / FPS }];
  return [{ kind, t: 0.2 * (1 - (f - out + 1) / 5) }];
};
/** H2 haul phases (labcommon h2Pullers) */
const H2PH = [0, 1, 2, 3, 4, 5].map((i) => (0.15 + i * 0.23) % 1);
/** a slow drift of the standing grip from the H2 phase (alive, never a jump at the hand-off) */
const standPhase = (i: number, f: number) => (H2PH[i] + 0.035 * Math.sin((f - 771) * 0.07 + i) * smooth((f - 771) / 20) + 1) % 1;
/** a haul cycle phase that runs at `rate` cycles / s from frame f0 (continuous from the phase it had there) */
const runPhase = (i: number, f: number, f0: number, rate: number, ramp = 15) => {
  // integral of rate x smooth ramp: rate x (x - ramp/2) for x > ramp, rate x x^3 (1/ramp^2 - x/(2 ramp^3)) below
  const x = Math.max(0, f - f0), r = ramp;
  const integ = x >= r ? x - r / 2 : (x * x * x) / (r * r) - (x * x * x * x) / (2 * r * r * r);
  return ((standPhase(i, f0) + (rate * integ) / FPS) % 1 + 1) % 1;
};

// puller 1: curious -> nervous (the cloth) ; blindfold on ; listening ; reassured (一起拉) ; effort (line 08) ; a bit
// easier on 90 % ; comfortable on 85 % ; line 10 content, whistling innocence on 15 %
const P1_EX: [number, Expr][] = [[771, "neutral"], [790, "nervous"], [B.blind, "nervous"], [B.tell + 4, "neutral"], [B.p2 + 3, "relief"],
  [B.pull + 2, "huff"], [B.b90 + 3, "stern"], [B.b85 + 3, "smile"], [B.p1, "smile_closed"], [B.pct + 1, "relief"]];
const P2_EX: [number, Expr][] = [[771, "neutral"], [B.p2, "smug"], [B.one + 2, "grin"], [B.one + 30, "smug"]];
const PW_EX: [number, Expr][] = [[771, "neutral"], [1060, "smug"]];
const RES_EX: [number, Expr][] = [[771, "neutral"], [B.tell, "smug"], [B.tellOut, "neutral"], [B.b90 + 4, "deadpan"], [B.b85 + 4, "smug"]];

/** the walk progress 0..1 (trapezoid speed: 8 frames to get going, a soft 14-frame stop) */
const walkK = (f: number, f0: number, dur: number) => trap(f, f0, f0 + dur, 8, 14);

/** puller i's state at f (not the H2 frames) */
function pullerAt(w: World, i: number, f: number): CPuller {
  const A = w.lab.A;
  if (i === 0) {
    const blind = f >= B.blind;
    const front = f < B.side || (f >= B.p1 && f < B.dial);
    // haul effort: standing (H2) -> pulls for real from B.pull -> a bit less on 90 % -> comfortable on 85 % -> relaxed
    const amount = f < B.pull ? 0.15 + 0.04 * smooth((f - B.raise) / 20) * (1 - smooth((f - B.p2) / 12))
      : ky(f, [[B.pull, 0.15], [B.pull + 12, 0.86], [B.b90 + 2, 0.84], [B.b90 + 12, 0.74], [B.b85 + 2, 0.73], [B.b85 + 14, 0.6], [B.p1 - 1, 0.6], [B.p1, 0.42]])
        + 0.03 * Math.sin(f * 0.19);
    const phase = f < B.pull ? standPhase(0, f) : runPhase(0, f, B.pull, f < B.p1 ? 0.72 : 0.5);
    // before the blindfold: a glance back at her (she is screen-left in pos1) as she lifts the cloth, then front
    const look = blind ? 0 : ky(f, [[777, 0], [786, 0], [790, -0.9], [806, -0.9], [811, 0]]);
    const faceTurn: -1 | 0 = !blind && f >= 789 && f < 809 ? -1 : 0;
    // listening tilt toward her voice on 告诉你 (front view: - = top toward canvas left = toward her), small sway
    const headTilt = (front ? ky(f, [[B.tell, 0], [B.tell + 6, -7], [B.tellOut, -6], [B.tellOut + 8, 0]]) : 0) + 1.6 * Math.sin(f * 0.11) * smooth((f - 771) / 20)
      + (f >= B.p1 ? 2.2 * Math.sin(f * 0.09 + 1) : 0);
    return { mode: f < B.pull ? "stand" : "pull", amount, phase, blind, view: front ? "front" : "side", expr: exprAt(f, P1_EX), blink: blinkAt(f, 100, P1_EX),
      look, faceTurn, headTilt, lookUp: front && !blind ? ky(f, [[777, 0], [790, 0], [795, 0.25], [806, 0.25], [811, 0]]) : 0 };
  }
  if (i === 1) {
    if (f < B.p2) return { mode: "stand", amount: 0.15, phase: standPhase(1, f), expr: "neutral", view: f < B.side ? "front" : "side" };
    const amount = 0.15 + 0.37 * smooth((f - B.p2) / 10) + 0.05 * Math.sin(f * 0.17 + 2);
    return { mode: "pretend", amount, phase: runPhase(1, f, B.p2, 0.62), expr: exprAt(f, P2_EX), blink: blinkAt(f, 101, P2_EX), view: f < B.side ? "front" : "side",
      fx: [] };
  }
  // pullers 3-6: leave (line 07), off, walk back in (line 09), pick the rope up, pretend
  const sq = A.positions[i], off = offSpot(w, i);
  const l0 = B.leave[i], w0 = B.walk0[i];
  if (f < l0) return { mode: "stand", amount: 0.15, phase: standPhase(i, f), expr: "neutral" };
  if (f < l0 + B.leaveDur) return { mode: "walk", from: sq, to: off, k: walkK(f, l0, B.leaveDur), expr: "neutral" };
  if (f < w0) return { mode: "off" };
  if (f < arrive(i)) return { mode: "walk", from: off, to: sq, k: walkK(f, w0, B.walkDur), expr: exprAt(f, PW_EX), blink: blinkAt(f, 100 + i, PW_EX) };
  const g = grip(i);
  if (f < arrive(i) + 2) return { mode: "turn", facing: Math.PI * 1.25, expr: exprAt(f, PW_EX) };
  if (f < g + B.liftDur) {
    const down = clamp01((f - (arrive(i) + 2) + 1) / B.downDur), lift = clamp01((f - g) / B.liftDur);
    return { mode: "pick", down, lift, expr: exprAt(f, PW_EX) };
  }
  const amount = 0.2 + 0.32 * smooth((f - (g + B.liftDur)) / 10) + 0.05 * Math.sin(f * 0.15 + i);
  return { mode: "pretend", amount, phase: runPhase(i, f, g + B.liftDur, 0.55 + 0.05 * i), expr: exprAt(f, PW_EX), blink: blinkAt(f, 100 + i, PW_EX) };
}

// ---------------------------------------------------------------------------------------------------- the researcher
const camRight = (w: World) => V().setFromMatrixColumn(w.camera.matrixWorld, 0).setY(0).normalize();
/** line 07: she lifts the cloth over square 1's head, ties it, rests a hand on his near shoulder on 告诉你, drops her
 *  hands and walks off toward the windows (out of the frame at the left). head = square 1's head (world) and radius
 *  from a first solve of this frame */
function resPos1(w: World, f: number, head: THREE.Vector3, hr: number): FigState {
  const A = w.lab.A, t = f / FPS, at = TIE.clone();
  const facing = Math.atan2(A.positions[0].x - at.x, A.positions[0].z - at.z);
  const expr = exprAt(f, RES_EX), blink = blinkAt(f, 109, RES_EX);
  const cr = camRight(w), up = V(0, 1, 0);
  if (f >= B.resGo) {
    if (f >= B.resAt) return { at: EXIT_07.clone(), facing: 0.35, pose: { kind: "idle", t }, expr, blink, visible: true };
    const k = walkK(f, B.resGo, B.resAt - B.resGo);
    const pos = at.clone().lerp(EXIT_07, k), dist = at.distanceTo(EXIT_07) * k, dir = EXIT_07.clone().sub(at).normalize();
    // planted feet: the phase advances with the distance along the card's axis (as segC_crew's walkers)
    const camP = V().setFromMatrixPosition(w.camera.matrixWorld), toCam = Math.atan2(camP.x - pos.x, camP.z - pos.z);
    const cosA = Math.max(0.35, Math.abs(Math.cos(toCam) * dir.x - Math.sin(toCam) * dir.z));
    return { at: pos, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase: (((dist * cosA) / WALK_CYCLE_M) % 1 + 1) % 1 }, expr, blink, visible: true };
  }
  // hand targets (world). Her arms are short next to his big head, so the cloth never goes up past her own face:
  // she unfolds it across her chest (raise), carries the near end up to his eyes while the far hand stays at her chest
  // (over: the cloth runs diagonally below her chin), and once it is on (眼睛) both hands work behind his head (tie)
  const chest = at.clone().add(V(Math.sin(facing) * 0.3, 0.96, Math.cos(facing) * 0.3)).addScaledVector(cr, -0.03);
  const eyes = head.clone().addScaledVector(cr, -hr * 0.85).addScaledVector(up, -hr * 0.05);
  const unfold = smooth((f - B.raise) / 12), over = smooth((f - B.over) / 11), tied = smooth((f - (B.blind - 1)) / 4), drop = smooth((f - (B.tied + 1)) / 6);
  const spread = lerp(0.03, 0.13, unfold);
  const h0 = chest.clone().addScaledVector(cr, -spread).addScaledVector(up, 0.03 * unfold);
  const h1 = chest.clone().addScaledVector(cr, spread).lerp(eyes, over);
  // tying: both hands at the back of his head (his card hides them but the near edge), small alternating loops
  const ph = (f - B.blind) * 0.9, tie = 0.03;
  h0.lerp(eyes.clone().addScaledVector(cr, -0.05).addScaledVector(up, tie * Math.sin(ph)), tied);
  h1.lerp(eyes.clone().addScaledVector(cr, 0.06).addScaledVector(up, -tie * Math.sin(ph + 1.4)), tied);
  h0.lerp(chest.clone().addScaledVector(cr, -0.08), drop); h1.lerp(chest.clone().addScaledVector(cr, 0.08), drop);
  // 告诉你: the near hand rests on his near shoulder (two small pats), then both hands go down to her sides to walk off
  const sh = smooth((f - (B.tell - 3)) / 7) * (1 - smooth((f - B.tellOut) / 6));
  if (sh > 0) {
    const shoulder = head.clone().addScaledVector(cr, -hr * 1.15).addScaledVector(up, -hr * 1.2);
    shoulder.addScaledVector(up, 0.025 * Math.max(0, Math.sin(((f - B.tell) / 9) * Math.PI)) * (f < B.tell + 18 ? 1 : 0));
    h1.lerp(shoulder, sh);
  }
  const down = smooth((f - (B.resGo - 7)) / 6);
  if (down > 0) {
    h0.lerp(at.clone().addScaledVector(cr, -0.16).addScaledVector(up, 0.5), down);
    h1.lerp(at.clone().addScaledVector(cr, 0.16).addScaledVector(up, 0.5), down);
  }
  // she watches her hands (up at his head) and him on 告诉你; then ahead
  const looking = f < B.tied + 4;
  return { at, facing, pose: { kind: "hold", t }, aimAt: [h0, h1], expr, blink, visible: true,
    lookUp: looking ? -0.25 * unfold * (1 - over) : 0, look: looking ? 0.5 * Math.max(over, 1 - unfold) : 0.55 * sh };
}
/** lines 08-10, the clipboard and pen back in hand. Line 08: by the window where she left line 07 (EXIT_W), writing,
 *  then watching square 1 on 你一个人. Line 09: a few steps on to RES_ASIDE (clear of the heads in the side view), reads
 *  the dial (screen-left) and writes after each reading. Line 10: writes, glances up on 15 %. */
function resSide(w: World, f: number): FigState {
  const t = f / FPS, expr = exprAt(f, RES_EX), blink = blinkAt(f, 109, RES_EX);
  const props: [null | "clipboard", null | "pen"] = ["clipboard", "pen"];
  const walkEnd = B.l09 + 24;
  if (f >= B.l09 && f < walkEnd) {
    const k = walkK(f, B.l09, walkEnd - B.l09), dir = RES_ASIDE.clone().sub(EXIT_W), len = dir.length();
    const pos = EXIT_W.clone().lerp(RES_ASIDE, k);
    dir.normalize();
    const camP = V().setFromMatrixPosition(w.camera.matrixWorld), toCam = Math.atan2(camP.x - pos.x, camP.z - pos.z);
    const cosA = Math.max(0.35, Math.abs(Math.cos(toCam) * dir.x - Math.sin(toCam) * dir.z));
    return { at: pos, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase: (((len * k * cosA) / WALK_CYCLE_M) % 1 + 1) % 1, props: ["clipboard", null] }, expr, blink, visible: true };
  }
  const inW = (ws: [number, number][]) => ws.reduce((m, [a, b]) => Math.max(m, smooth((f - a) / 4) * (1 - smooth((f - b) / 4))), 0);
  // reading windows (look at the dial, screen-left in side) / watching square 1 (line 08, screen-right) / writing
  const reads: [number, number][] = [[B.b90 - 4, B.b90 + 14], [B.b85 - 4, B.b85 + 14], [B.pct + 1, B.pct + 30]];
  const watch: [number, number][] = [[B.one - 3, B.oneOut]];
  const writes: [number, number][] = [[B.side + 3, B.one - 6], [B.b90 + 18, B.b90 + 40], [B.b85 + 18, B.b85 + 42], [B.p1 + 4, B.pct - 2], [B.pct + 34, B.dial]];
  const rd = inW(reads), wa = inW(watch), wr = inW(writes);
  const scrib = wr * Math.sin(f * 1.3) * 6;
  const line08 = f < B.l09;
  return {
    at: (line08 ? EXIT_W : RES_ASIDE).clone(), facing: line08 ? -0.375 : 0.35, expr, blink, visible: true,
    pose: { kind: "hold", t, aim: [{ dir: -38, reach: 0.62 }, { dir: -150 + scrib, reach: 0.55 + 0.05 * wr }], props, headTilt: 2 * Math.sin(t * 1.1) - 4 * wr },
    look: -0.9 * rd + 0.6 * wa, faceTurn: rd > 0.5 ? -1 : wa > 0.5 ? 1 : 0, lookUp: 0.12 * rd - 0.7 * wr,
  };
}

// ---------------------------------------------------------------------------------------------------- the cloth
/** a dark cloth strip between the researcher's hands (line 07 until the blindfold is on): its own mesh in the lab scene */
let cloth: THREE.Mesh | null = null;
const CLOTH_N = 14;
function buildCloth(): THREE.Mesh {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((CLOTH_N + 1) * 2 * 3), 3));
  const idx: number[] = [];
  for (let i = 0; i < CLOTH_N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: "#2b2d3a", side: THREE.DoubleSide }));
  m.name = "segC:cloth"; m.frustumCulled = false; m.renderOrder = 1.5;
  return m;
}
function poseCloth(w: World, a: THREE.Vector3 | null, b: THREE.Vector3 | null) {
  if (!cloth) return;
  if (!a || !b) { cloth.visible = false; return; }
  cloth.visible = true;
  const up = V().setFromMatrixColumn(w.camera.matrixWorld, 1).normalize(), wid = 0.075;
  const pos = cloth.geometry.getAttribute("position") as THREE.BufferAttribute, len = a.distanceTo(b), sag = Math.max(0.02, 0.32 - len) * 0.45;
  for (let i = 0; i <= CLOTH_N; i++) {
    const u = i / CLOTH_N, p = a.clone().lerp(b, u); p.y -= sag * 4 * u * (1 - u);
    pos.setXYZ(i * 2, p.x + up.x * wid / 2, p.y + up.y * wid / 2, p.z + up.z * wid / 2);
    pos.setXYZ(i * 2 + 1, p.x - up.x * wid / 2, p.y - up.y * wid / 2, p.z - up.z * wid / 2);
  }
  pos.needsUpdate = true; cloth.geometry.computeBoundingSphere();
}

// ---------------------------------------------------------------------------------------------------- segment
let crew: Crew | null = null;
let pickRope: Rope | null = null;
const tv = V(), tw = V();
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter(w) {
    crew = acquireCrew(w);
    pickRope = w.lab.ropes.acquire({ radius: 0.016, gold: 0.55, seed: 6 });
    if (!cloth) cloth = buildCloth();
    w.lab.scene.add(cloth); cloth.visible = false;
  },
  exit(w) {
    if (crew) crew.rope.setGold(0.55, 0);
    releaseCrew(w, crew); crew = null;
    if (pickRope) w.lab.ropes.release(pickRope); pickRope = null;
    if (cloth) { cloth.visible = false; w.lab.scene.remove(cloth); }
  },
  pose(w, f) {
    const c = crew!, L = w.lab, A = L.A, t = f / FPS;
    const cam = camAt(w, f);
    const dialShot = f >= B.dial;
    // the dial shot: the camera stands on the rope line in front of square 1, so the cards (all behind it) are solved for
    // the side camera and the visible end of the rope is laid on the line (below)
    w.setCamera(dialShot ? cpose(L.set.cams.side) : cam);
    L.set.setDial(f <= B.h2End ? H2_DIAL : dialAt(f));
    L.set.animate(t);
    L.set.setLight({ sun: 1, lamp: 1 });
    // ---- people + ropes
    let p1Head: THREE.Vector3 | null = null, p1R = 0.2;
    if (f <= B.h2End) {
      c.rope.setGold(0.55, 0);
      crewPose(w, c, f, { pullers: h2Pullers(), researcher: H2_RESEARCHER(w) });
      pickRope!.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) });
      poseCloth(w, null, null);
    } else {
      const pullers = [0, 1, 2, 3, 4, 5].map((i) => pullerAt(w, i, f));
      const glow = f >= B.one ? 0.45 * Math.exp(-Math.max(0, f - B.one - 4) / 24) * smooth((f - B.one) / 4) : 0;
      const slack = f < B.p2 ? 0 : 0.75 * smooth((f - B.p2) / 12);
      if (f < B.side) {
        // two solves: the first finds puller 1's head, the researcher's hands are aimed at it in the second
        crewC(w, c, pickRope!, f, { pullers, researcher: { ...H2_RESEARCHER(w), pose: { kind: "idle", t } }, slack });
        p1Head = c.pullers[0].headWorld(); p1R = c.pullers[0].headR;
        crewC(w, c, pickRope!, f, { pullers, researcher: resPos1(w, f, p1Head, p1R), slack });
        const holding = f < B.blind && f >= B.pos1;
        if (holding) {
          // her arm is too short to reach his eyes on screen: the cloth's near end runs from her hand onto his face
          // (a point 8 cm in front of his card, at eye level, inside the near edge of the face); 眼睛 swaps it for the
          // kit's blindfold
          const over = smooth((f - B.over) / 11), cr = camRight(w), toCam = V(...(cam.pos as Vec3)).sub(p1Head).normalize();
          const eye = p1Head.clone().addScaledVector(cr, -p1R * 0.42).addScaledVector(V(0, 1, 0), p1R * 0.12).addScaledVector(toCam, 0.08);
          poseCloth(w, c.res.handWorld(0), c.res.handWorld(1).lerp(eye, over));
        } else poseCloth(w, null, null);
      } else {
        const res: FigState = f < B.p1 ? resSide(w, f) : { ...resSide(w, f), visible: true };
        crewC(w, c, pickRope!, f, { pullers, researcher: res, slack, glow });
        poseCloth(w, null, null);
      }
      if (dialShot) {
        // the visible end of the rope: from the shackle straight along the rope line toward square 1's (off-frame) hands
        const sq = A.positions[0];
        c.rope.update({ a: A.hook, b: V(sq.x - 0.12, 0.92, A.ropeZ), via: [V(sq.x - 0.4, 0.905, A.ropeZ)], attachA: { kind: "knot", axis: A.hookTie.axis, postR: A.hookTie.postR }, attachB: { kind: "hand", tail: 0 }, gold: 0.55, glow: 0 });
      }
    }
    if (dialShot) w.setCamera(cam);
    // ---- overlays
    const kids: React.ReactNode[] = [];
    const proj = (p: THREE.Vector3) => w.project(p);
    if (f >= B.one && f <= B.oneOut + 8 && f < B.p1) {
      const hd = c.pullers[1].headWorld(tv), top = proj(tw.copy(hd).setY(hd.y + c.pullers[1].headR));
      kids.push(h(RopeChip, { key: "fake", frame: f, at: B.one, out: B.oneOut, x: top.x, y: top.y - 8, dy: -92, text: "假装", tone: "grey", scale: 0.9 }));
    }
    if (f >= B.card && f <= B.cardOut + 8) {
      kids.push(h(PctCard, { key: "card", f, at: B.card, out: B.cardOut, title: "以为有几个帮手", top: 122,
        rows: [{ label: "0个", value: 100, at: B.b0 }, { label: "1个", value: 90, at: B.b90 }, { label: "2-6个", value: 85, at: B.b85 }] }));
    }
    if (f >= B.group && f <= B.groupOut + 8 && f < B.p1) {
      const hd = c.pullers[2].headWorld(tv), top = proj(tw.copy(hd).setY(hd.y + c.pullers[2].headR));
      kids.push(h(RopeChip, { key: "group", frame: f, at: B.group, out: B.groupOut, x: top.x, y: top.y - 8, dy: -96, text: "都在假装", tone: "grey", scale: 0.9 }));
    }
    if (f >= B.pct && f <= B.pctOut + 6) {
      const hd = c.pullers[0].headWorld(tv), hp = proj(hd), r = (c.pullers[0].headR / Math.max(0.1, hp.z)) * 960 / Math.tan((cam.fov * Math.PI) / 360);
      const mx = Math.min(760, Math.max(310, hp.x - 0.55 * r - 120)), my = Math.min(560, Math.max(330, hp.y - r - 150));
      if (IP.dbg && f === B.pct + 10) console.log(`[segC] f${f} MINUS at ${mx.toFixed(0)},${my.toFixed(0)} head ${hp.x.toFixed(0)},${hp.y.toFixed(0)} r${r.toFixed(0)}px`);
      kids.push(h(MinusPct, { key: "pct", f, at: B.pct, out: B.pctOut, x: mx, y: my, size: 200 }));
    }
    if (IP.dbg) logChecks(w, c, f, cam);
    return { scene: "lab", camera: cam, overlays: kids.length ? h(React.Fragment, null, ...kids) : null };
  },
};

// ---------------------------------------------------------------------------------------------------- dbg checks
function logChecks(w: World, c: Crew, f: number, cam: CamPose) {
  const L = w.lab, A = L.A, col = L.set.objects.colliders;
  const camP = V(...(cam.pos as Vec3));
  const figs: [string, Figure][] = [...c.pullers.map((p, i) => [`p${i + 1}`, p] as [string, Figure]), ["res", c.res]];
  const px = (p: THREE.Vector3) => { const q = w.project(p); return `${q.x.toFixed(0)},${q.y.toFixed(0)}${q.front ? "" : "(behind)"}`; };
  const vis = figs.filter(([, F]) => F.mesh.visible);
  const heads = vis.map(([n, F]) => `${n} head ${px(F.headWorld())} r${F.headR.toFixed(2)} foot ${footY(F).toFixed(3)} cam ${F.headWorld().distanceTo(camP).toFixed(2)}m view ${F.sv?.view}`).join(" | ");
  const ropes = ([["rope", c.rope], ["behind", c.behind], ["tail", c.tail]] as [string, Rope][]).map(([n, r]) => { const k = r.clearance(col); return `${n} len ${r.length.toFixed(2)} hits ${k.hits} worst ${(k.worst * 100).toFixed(1)}cm`; }).join(" | ");
  const gauge = col.reduce((m, b) => Math.min(m, b.distanceToPoint(camP)), Infinity);
  const resLine = Math.abs(c.res.mesh.position.z - A.ropeZ);
  // the researcher's card vs the taut rope (hook -> square 2), as in preview/lab_common
  console.log(`[segC] f${f} cam ${(cam.pos as Vec3).map((x) => x.toFixed(3)).join(",")} fov ${cam.fov.toFixed(2)} | min cam->collider ${gauge.toFixed(2)}m | res off line ${resLine.toFixed(2)}m | dial ${L.set.objects.needle ? dialAt(f).toFixed(2) : "?"}`);
  console.log(`[segC] f${f} ${heads}`);
  console.log(`[segC] f${f} ${ropes}`);
  if (f === 1180 || f === 960) {
    // (temporary) candidate spots for the researcher: head px at y 1.25
    const out: string[] = [];
    for (const x of [-2.0, -1.6, -1.3, -1.0, -0.7, 0.9, 1.3]) for (const z of [-2.15, -1.85, -1.55]) out.push(`(${x},${z})->${px(V(x, 1.25, z))}`);
    console.log(`[segC] f${f} CAND ${out.join(" ")}`);
  }
  if (f === S.to || f === B.dial || f === B.end - 1) {
    // the match frame: projected bezel (front rim, 1 cm in front of the face) diameter and centre
    const xb = A.dialCentre.x + 0.01, cy = A.dialCentre.y, cz = A.dialCentre.z, R = A.dialBezelRadius;
    const l = w.project(V(xb, cy, cz + R)), r = w.project(V(xb, cy, cz - R)), tp = w.project(V(xb, cy + R, cz)), bt = w.project(V(xb, cy - R, cz));
    console.log(`[segC] f${f} BEZEL width ${(r.x - l.x).toFixed(1)}px height ${(bt.y - tp.y).toFixed(1)}px centre ${((l.x + r.x) / 2).toFixed(1)},${((tp.y + bt.y) / 2).toFixed(1)} face centre ${px(A.dialCentre)}`);
  }
}

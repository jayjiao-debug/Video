// segment C, frames 771-1366 (lines 07-10): the blindfold version of the 1974 rope experiment (Ingham et al., exp. 2),
// then the push into the dial. The dial shows the TOTAL real force on the rope, one person's full solo pull = 16 units.
//   771-776  H2 hold (segB's last frame): cams.side, all six standing on the rope, the researcher (hidden behind squares
//            1-2) with her clipboard, dial 20.
//   777      cut to line 07's camera (its look point and line 10's sit low enough that his grip on the rope stays above
//            the caption band): pos1's spot raised to standing eye height (1.5 m, ~11 deg down, fov 54, 2 deg to
//            the left) so the researcher's head (just behind square 1 on the window side, TIE) sits above-left of square
//            1's head. She shakes a dark cloth out between her hands at her chest (left of his body, in view; puller 1
//            glances at her, nervous), lifts it to his head: her near hand comes to the side of his head (just outside
//            it) and the cloth runs from it across his forehead and slides down over his eyes, on the kit blindfold's
//            line and tilt; 眼睛 (f815) the kit blindfold takes over (from then only puller 1's mouth / brows act, no
//            glances) and she ties it at the side of his head. Meanwhile pullers 3-6 let go and walk out (off the right
//            edge) to the bench by the +z wall; when the last lets go the spare rope falls to the floor (kit drop);
//            puller 2 stays. 告诉你: a hand on his near shoulder, a knowing smirk. 一起拉 (f881): puller 2
//            leans in as if pulling but the rope behind square 1 hangs slack (pretend). She walks off the left edge.
//   917      cut to line 08: cams.main panned 8.5 deg toward square 1 with a slow eased push (0.2 m, fov 70 -> 66): puller
//            1 pulls for real (taut rope out of the left edge to the shackle, needle 3 -> 14.4 off-screen: he believes
//            one helper pulls with him, 16 x 0.90), puller 2 leans
//            but the rope to him hangs to the floor and the rest lies along the empty squares; 你一个人: the taut rope
//            glows a little, a 假装 chip pops over puller 2. The researcher by the window (clipboard back in hand)
//            writes, then watches puller 1.
//   1007     cut to line 09: segB's opening framing (OPEN_B: squares 1-2 and the dial large, so the blindfolded "you"
//            and the slack helper read on 1个 / 90%), held; on 2到6个 (f1099) a cut out on the same axis to exactly
//            cams.side, still, for the walk-ins. She walks on along the windows (a curve clear of radiator 2)
//            to RES_ASIDE, where her face sits in the gap between the heads of squares 5 and 6. The label card
//            以为有几个帮手 (segC_card: segB's PctCard design, a wider label column): 独自 100% (the reference, with the
//            card) ; 90% (f1050) 1个 90% (the needle already reads 14.4: nothing changed for him) ; 2到6个 (f1099):
//            pullers 3-4 walk back in from the bench (+z, left edge), 5-6 from the door (right edge, a short curve away
//            from the lens that ends square-on to the line; from the bench they would cross the whole frame large, over
//            squares 1-2 and the dial), each bends for the spare rope a step in front of it (the rope rises off the
//            floor in a long curve behind each lifted hand, so nobody folds over into the caption band), lifts it and
//            pretends (slack through all of them) ;
//            85% (f1143, as puller 3 lifts the rope) 2-6个 85%, needle -> 13.6 ; a 都在假装 chip over square 3 as the
//            last of them lifts it (f1180). A gold 你 chip marks puller 1 (far left, by the dial) from the card to f1094. She reads the dial and writes after each reading. The card is gone by f1194.
//   1199     cut to line 10: pos1's spot at eye level (1.22 m), fov 60, a slow push-in along pos1's axis (0.2 m, fov
//            -> 50): puller 1 blindfolded, pulling in a relaxed, comfortable way, content; 15% (f1251) the gold −15%
//            (segA_minus) upper left, gone by f1302. The researcher is behind puller 1 in this view (hidden).
//   1311     松的劲: cut to the dial, square-on (cams.dial's lens), a level dolly along -x to the match frame f1366: bezel
//            0.92 W wide, centre (540, 760), needle settling at 13.6 (segD's back-wall clock takes over at f1367 at the
//            same size and place).
// Every number on screen is from the script (100 / 90 / 85). The crew solver is shots/segC_crew.ts (labcommon.crewPose
// copied and extended; labcommon stays untouched). dbg logs the geometry checks (IP='{"dbg":true}').
import React from "react";
import { getInputProps } from "remotion";
import * as THREE from "three";
import type { Segment, CamPose, Vec3 } from "../story";
import { SEGMENTS, FPS, h, spl, smooth, lerp, clamp01, spring, mix3, between, easeInOutCubic, easeInOutQuad } from "../story";
import type { World } from "../world";
import { lidAt, cardClearance, type FigState, type FxKind, type Figure } from "../kit/cast";
import { WALK_CYCLE_M, SU, dimsOf, type Expr } from "../kit/toon";
import { Rope, ropeMotion, lieLength, lieSlack } from "../kit/rope";
import { RopeChip } from "../kit/overlay";
import { acquireCrew, releaseCrew, crewPose, H2_CAM, h2Pullers, H2_RESEARCHER, H2_DIAL, type Crew } from "./labcommon";
import { crewC, footY, ropeEnd, walkAlong, type CPuller } from "./segC_crew";
import { PctCardC } from "./segC_card";
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
  leave: [0, 0, 789, 793, 797, 801], leaveDur: [0, 0, 62, 62, 84, 56],
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
  card: 1009, b90: 1050, b85: 1143, cardOut: 1186,
  /** walkers 3-6: walk start and length (frames), then the turn (2 f), the reach down (downDur), the lift (liftDur[i]).
   *  The first of them steps into the side view on 2到6个 (f1099). The grip + lift windows never overlap (the solver
   *  carries one gripped picker at a time; a picker holds the rope from arrive + 11 to arrive + 11 + liftDur): 1141-1151
   *  (puller 3 lifts on 85 %) / 1153-1163 / 1164-1174 / 1175-1186 (puller 6 bends only once puller 5 has the rope up) */
  walk0: [0, 0, 1068, 1080, 1099, 1124], walkDur: [0, 0, 62, 62, 54, 40], downDur: 9, liftDur: [0, 0, 11, 11, 11, 12],
  /** the group chip 都在假装 (as the last of them lifts the rope) */
  group: 1180, groupOut: 1192,
  p1: 1199,
  pct: 1251, pctOut: 1296,
  dial: 1311, end: S.to,
};
/** the gold 你 chip over puller 1 in line 09 (from the card until puller 3 walks in on 2到6个) */
const YOU_OUT = 1090;   // (its 8 f exit ends before the cut to the side view at 1099)
/** grip frame of walker i (the turn takes 2 frames, the reach down B.down) */
const arrive = (i: number) => B.walk0[i] + B.walkDur[i];
const grip = (i: number) => arrive(i) + 2 + B.downDur;
/** the spare rope's drape while the newcomers lift it in turn: from puller 3's lift (the rope comes up off the floor
 *  behind the last hand as a long shallow curve, so pullers 4-6 reach down less and their heads stay above the caption
 *  band) back to the lying drape over puller 6's lift */
// (the rise starts as puller 3 bends, so the rope comes up toward his hand and he grips it off the floor instead of
// diving for it at floor level)
const drapeAt = (f: number) => 0.4 + 0.8 * (smooth((f - (arrive(2) + 2)) / (B.downDur + B.liftDur[2])) - smooth((f - grip(5)) / B.liftDur[5]));

// ---------------------------------------------------------------------------------------------------- places
/** the researcher's spot by the windows for lines 09-10 (window side, 1.42 m off the rope line, in front of the right
 *  end of radiator 2, 0.2 m clear of it): in the side view, with all six on the rope, her face sits in the one real
 *  gap, between the heads of squares 5 and 6 (searched over the floor: overlap with any nearer head disc <= ~12 % of
 *  her head's width, i.e. the hair edge; the old spot between squares 4 and 5 lost half her face behind square 5's
 *  head once square 5 was filled). In line 10's pos1 view she is then hidden behind puller 1 (no half figure at the
 *  frame edge) */
const RES_ASIDE = V(0.15, 0, -2.12);
/** control point of her line-09 walk from EXIT_W to RES_ASIDE (a curve that keeps her 0.3+ m off radiator 2) */
const RES_VIA = V(-0.65, 0, -1.72);
/** where she ties the blindfold: just behind square 1 on the window side (anchors.researcher moved 0.22 m to line
 *  07's left; the cut hides it; 0.57 m off the rope line). From line 07's raised camera her head sits above-left of
 *  square 1's head with a gap between them, so her near hand shows in that gap at the side of his head */
const TIE = V(-1.74, 0, -1.265);
/** she leaves line 07's frame toward the windows (off its left edge), then goes on to RES_ASIDE off-screen */
const EXIT_W = V(-1.45, 0, -2.25);
/** where her line-07 walk ends: off line 07's left edge (0.3 m short of EXIT_W; the cut to line 08 covers the rest) */
const EXIT_07 = V(-1.75, 0, -2.25);
/** where the confederates wait between line 07 and line 09 (all off-frame in pos1, main and side, body included;
 *  checked in dbg): pullers 3-4 by the bench on the +z wall (x -1.5..0.5, z 2.09..2.49: they stop 0.34 m short of it, card clear),
 *  straight back from their squares; pullers 5-6 by the door (the +x end wall), off the side camera's right edge.
 *  Squares 5-6 are the nearest to the side camera, so a walk in from the bench would cross the whole frame large, over
 *  squares 1-2 and the dial; from the door it is a short curved walk away from the lens (a quadratic Bezier through
 *  `offVia`) that stays on the camera side of the spare rope lying on the floor and ends square-on to the line, the way
 *  the bench walkers arrive, and passes only empty squares (5 goes before 6). The line-07 exits run the same paths
 *  backwards (off-frame there; 5 walks slower than 6 so their curves never come within 0.5 m). */
const offSpot = (w: World, i: number) => (i <= 3 ? V(w.lab.A.positions[i].x, 0, 1.75) : i === 4 ? V(3.25, 0, -0.62) : V(3.4, 0, -0.12));
const offVia = (w: World, i: number) => (i <= 3 ? undefined : V(w.lab.A.positions[i].x + 0.11, 0, -0.21));
const turnFacing = (i: number) => (i <= 3 ? Math.PI * 1.25 : -Math.PI / 2);
/** the returning pretenders stop this far in front of their square (camera side, +z): the spare rope lies along the
 *  rope line through the empty squares, so arriving ON the square put their shoes on it; they settle onto the square
 *  while they lift the rope (from the grip, when the rope in front of them is off the floor) */
const ARRIVE_DZ = 0.24;
/** puller 6's walk in (line 09) starts farther from the side camera than his line-07 exit ended (off-frame either way),
 *  so he comes into frame at about the others' size instead of a giant half-face at the right edge */
const inSpot = (w: World, i: number) => (i === 5 ? V(3.35, 0, -0.36) : offSpot(w, i));
const inVia = (w: World, i: number) => (i === 5 ? V(w.lab.A.positions[i].x + 0.11, 0, -0.28) : offVia(w, i));

// ---------------------------------------------------------------------------------------------------- cameras
/** line 07: pos1's spot raised to standing eye height (1.5 m, ~11 deg down, like side / main) with a wider lens and
 *  2 deg to the left: the researcher's head (behind square 1, farther) sits above-left of square 1's head */
// (look point 0.13 m lower than the first cut, ~4 deg more down-tilt: his grip on the rope sits above the caption band
// (62-78 %) instead of under the words; the window headroom above his head absorbs it)
const L07: CamPose = { pos: [-3.3, 1.5, 0.23], look: [-1.98, 1.02, -0.67], fov: 54 };
/** line 08: cams.main (the faces camera beside the gauge: square 1 large at the left, the rope out of the left edge to
 *  the shackle, square 2 behind it) with a slow eased push along its axis */
const L08_PUSH = 0.2, L08_FOV = 66, L08_PAN = 8.5;
/** line 10: from pos1's spot, a wider lens (square 1 head to knees, the rope to the shackle at the left, square 2
 *  behind at the right), then a slow push-in along pos1's axis to a medium close-up (head and torso) */
const L10_FOV0 = 60, L10_FOV1 = 50, L10_PUSH = 0.2;
/** line 10's look point is lowered this much (m) from pos1's: the relaxed grip (the point of 松的劲 / 15%) lands above
 *  the caption band, not under the words */
const L10_LOOK_DY = -0.13;
/** line 09 opens on segB's opening framing (squares 1-2 and the dial large: the blindfolded "you" and the slack helper
 *  read while the card says 1个 90%) and holds it; on 以为有【2到6个】 (L09_WIDE) it cuts out on the same axis to exactly
 *  cams.side for the walk-ins. (A pull-back there was tried: pullers 3-4 walk in from the bench right past the lens of
 *  this framing, as giant figures over squares 1-2; in the side view they come in small from the left edge.) */
const L09_OPEN: CamPose = { pos: [1.15, 1.38, 0.36], look: [-2.45, 1.08, -1.1], fov: 62 };
const L09_WIDE = 1099;
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
  // line 09: segB's opening framing (held), cut on 2到6个 to exactly cams.side (still)
  if (f < B.p1) return f < L09_WIDE ? cpose(L09_OPEN) : cpose(cams.side);
  if (f < B.dial) {
    const k = trap(f, B.p1, B.dial + 24, 10, 40), a = cpose(cams.pos1);
    const d = V(...(a.look as Vec3)).sub(V(...(a.pos as Vec3))).normalize().multiplyScalar(L10_PUSH * k);
    const ap = a.pos as Vec3, al = a.look as Vec3;
    return { pos: [ap[0] + d.x, ap[1] + d.y, ap[2] + d.z], look: [al[0], al[1] + L10_LOOK_DY, al[2]], fov: lerp(L10_FOV0, L10_FOV1, k) };
  }
  const k = trap(f, B.dial - 3, B.end, 3, 40);
  return dialCam(w, lerp(D_START, D_END, k));
};

// ---------------------------------------------------------------------------------------------------- the dial
const sp = (f: number, at: number) => spring((f - at) / FPS, { freq: 1.5, zeta: 0.7 });
/** total real force on the rope (dial units, one solo pull = 16): 6 relaxed 20 -> 2 relaxed 6.7 -> p1 relaxed 3.3 ->
 *  p1 pulling while he believes one helper pulls with him (puller 2 pretends from 一起拉): 16 x 0.90 = 14.4 -> when the
 *  others join as pretenders (2-6 believed helpers): 16 x 0.85 = 13.6. The dial shows what is true at every moment, so
 *  it already reads 14.4 when the side camera first shows it (line 09); 90 % is the card's job. It trembles a few
 *  tenths while p1 pulls (fading to 0 at the match frame) */
const dialAt = (f: number) => {
  const t = f / FPS;
  const base = H2_DIAL + (6.7 - H2_DIAL) * sp(f, B.leave[2] + 2) + (3.3 - 6.7) * sp(f, B.p2 + 4) + (14.4 - 3.3) * sp(f, B.pull + 2)
    + (13.6 - 14.4) * sp(f, B.b85 + 2);
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

// puller 1: curious -> nervous (the cloth) ; blindfold on ; listening ; reassured (一起拉) ; effort (line 08, the same
// through 90 %: nothing changed for him) ; comfortable when the others join (85 %) ; line 10 content, pleased on 15 %
const P1_EX: [number, Expr][] = [[771, "neutral"], [790, "nervous"], [B.blind, "nervous"], [B.tell + 4, "neutral"], [B.p2 + 3, "relief"],
  [B.pull + 2, "huff"], [B.b85 + 3, "smile"], [B.p1, "smile_closed"], [B.pct + 1, "relief"]];
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
      : ky(f, [[B.pull, 0.15], [B.pull + 12, 0.82], [B.b85 + 2, 0.8], [B.b85 + 14, 0.64], [B.p1 - 1, 0.64], [B.p1, 0.42]])
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
  if (f < l0 + B.leaveDur[i]) return { mode: "walk", from: sq, to: off, via: offVia(w, i), k: walkK(f, l0, B.leaveDur[i]), expr: "neutral" };
  if (f < w0) return { mode: "off" };
  const sqIn = V(sq.x, 0, sq.z + ARRIVE_DZ), lift = B.liftDur[i];
  if (f < arrive(i)) return { mode: "walk", from: inSpot(w, i), to: sqIn, via: inVia(w, i), k: walkK(f, w0, B.walkDur[i]), expr: exprAt(f, PW_EX), blink: blinkAt(f, 100 + i, PW_EX) };
  const g = grip(i), at = sqIn.clone().lerp(sq, smooth((f - g) / (lift + 8)));
  // the 2 frames between the walk and the reach: the bench walkers (walking -z, seen from behind) turn through the
  // idle drawing; the door walkers already walk toward the gauge in the side drawing, so they stay in it (the reach
  // pose at 0: standing, side view) instead of flashing the idle drawing's back view
  if (f < arrive(i) + 2) return i <= 3 ? { mode: "turn", facing: turnFacing(i), expr: exprAt(f, PW_EX), at } : { mode: "pick", down: 0, lift: 0, expr: exprAt(f, PW_EX), at };
  if (f < g + lift) {
    const down = clamp01((f - (arrive(i) + 2) + 1) / B.downDur), up = clamp01((f - g) / lift);
    return { mode: "pick", down, lift: up, expr: exprAt(f, PW_EX), at };
  }
  const amount = 0.2 + 0.32 * smooth((f - (g + lift)) / 10) + 0.05 * Math.sin(f * 0.15 + i);
  // ease from the reach pose's upright lift into the haul drawing over 9 frames (no one-frame snap into the lean)
  const settle = f < g + lift + 9 ? smooth((f - (g + lift) + 1) / 10) : undefined;
  return { mode: "pretend", amount, phase: runPhase(i, f, g + lift, 0.55 + 0.05 * i), settle, expr: exprAt(f, PW_EX), blink: blinkAt(f, 100 + i, PW_EX), at };
}

// ---------------------------------------------------------------------------------------------------- the researcher
const camRight = (w: World) => V().setFromMatrixColumn(w.camera.matrixWorld, 0).setY(0).normalize();
/** screen point (px, 1080 x 1920) at view depth z (m) -> world */
function screenToWorld(w: World, x: number, y: number, z: number): THREE.Vector3 {
  const cam = w.camera, camP = V().setFromMatrixPosition(cam.matrixWorld), fwd = V().setFromMatrixColumn(cam.matrixWorld, 2).negate().normalize();
  const q = V((x / 1080) * 2 - 1, 1 - (y / 1920) * 2, 0.5).unproject(cam).sub(camP);
  return camP.addScaledVector(q, z / q.dot(fwd));
}
/** an aimAt target that puts the tip of `fig`'s arm `arm` ON the screen point P (px): the kit draws the arm at its full
 *  length toward the target, foreshortened by the target's depth, so the target is tilted toward the camera until the
 *  projected length equals the screen distance (P beyond reach: the arm points at it at full length) */
function aimScreen(w: World, fig: Figure, arm: 0 | 1, P: { x: number; y: number }): THREE.Vector3 {
  const S = fig.shoulderWorld(arm), sp = w.project(S), cam = w.camera;
  const right = V().setFromMatrixColumn(cam.matrixWorld, 0).normalize(), up = V().setFromMatrixColumn(cam.matrixWorld, 1).normalize();
  const toCam = V().setFromMatrixColumn(cam.matrixWorld, 2).normalize();
  const focal = 960 / Math.tan((cam.fov * Math.PI) / 360), k = sp.z / focal;
  const inPlane = right.multiplyScalar((P.x - sp.x) * k).addScaledVector(up, -(P.y - sp.y) * k);
  const lenM = dimsOf(fig.look).aLen * SU, Ls = inPlane.length();
  if (Ls >= lenM * 0.98) return S.clone().add(inPlane);
  const cos = Ls / lenM, sin = Math.sqrt(1 - cos * cos);
  return S.clone().addScaledVector(inPlane.normalize(), lenM * cos).addScaledVector(toCam, lenM * sin);
}
type Px = { x: number; y: number };
const pxLerp = (a: Px, b: Px, t: number): Px => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
/** line 07 timing of the cloth: she shakes it out across her chest (raise .. open), lifts it to his head (lift .. onHead),
 *  slides it down over his eyes (onHead .. B.blind - 2), 眼睛 (B.blind) = the kit blindfold; she ties it (to B.tied) */
const CL = { open: 795, lift: 800, onHead: 807 };
/** p1's head on screen this frame (centre, radius px, view depth) and the line the kit blindfold is drawn on: through the
 *  head's own centre (after its tilt about the chin), along the head frame's x axis (d), up = the head frame's up (u),
 *  half-length to the outline L (the kit band is clipped to the head x 1.04) */
type HeadPx = { x: number; y: number; r: number; z: number; c: Px; d: Px; u: Px; L: number };
function headPx(w: World, fig: Figure, fov: number): HeadPx {
  const hw = fig.headWorld(), q = w.project(hw), focal = 960 / Math.tan((fov * Math.PI) / 360), k = focal / q.z;
  const D = dimsOf(fig.look), sv = fig.sv!, r = fig.headR * k, hb = D.H.b * SU * k;
  // toon paint: the head is drawn rotated by Ah = lean + headTilt + quirk about the chin (canvas degrees, clockwise);
  // out.head is the head centre on the leaned body (before the head's own tilt): move it by the extra turn
  const lean = (sv.lean * Math.PI) / 180, ah = ((sv.lean + sv.headTilt + D.Q.headTilt) * Math.PI) / 180;
  const c = { x: q.x - hb * Math.sin(lean) + hb * Math.sin(ah), y: q.y + hb * Math.cos(lean) - hb * Math.cos(ah) };
  return { x: q.x, y: q.y, r, z: q.z, c, d: { x: Math.cos(ah), y: Math.sin(ah) }, u: { x: Math.sin(ah), y: -Math.cos(ah) }, L: 1.04 * r };
}
const pxAdd = (a: Px, b: Px, k: number): Px => ({ x: a.x + b.x * k, y: a.y + b.y * k });
/** line 07: she takes the cloth out and shakes it open across her chest (her hands left of his body, in view), lifts it
 *  to his head: her near hand comes to the left edge of his head (just outside it, so it shows) and the cloth runs from
 *  it across his forehead and slides down over his eyes; 眼睛: the kit blindfold; she ties it at the side of his head
 *  (small loops of the near hand, the far hand behind his head), 告诉你: her near hand on his near shoulder (two pats),
 *  then her hands drop and she walks off toward the windows (off the left edge). hp = p1's head on screen from a first
 *  solve of this frame (null on that first solve) */
/** the cloth this frame: from her near hand to her far hand (k 0, sagging), or (k 1) from her near hand to the left end
 *  of the band line on his head (a) and across to its right end (b); open 0..1 (shaken out) */
type ClothState = { k: number; a: Px; b: Px; open: number };
function resPos1(w: World, f: number, hp: HeadPx | null, res: Figure): { st: FigState; cloth: ClothState | null } {
  const A = w.lab.A, t = f / FPS, at = TIE.clone();
  const facing = Math.atan2(A.positions[0].x - at.x, A.positions[0].z - at.z);
  const expr = exprAt(f, RES_EX), blink = blinkAt(f, 109, RES_EX);
  const cr = camRight(w), up = V(0, 1, 0);
  if (f >= B.resGo) {
    if (f >= B.resAt) return { st: { at: EXIT_07.clone(), facing: 0.35, pose: { kind: "idle", t }, expr, blink, visible: true }, cloth: null };
    const k = walkK(f, B.resGo, B.resAt - B.resGo);
    const pos = at.clone().lerp(EXIT_07, k), dist = at.distanceTo(EXIT_07) * k, dir = EXIT_07.clone().sub(at).normalize();
    // planted feet: the phase advances with the distance along the card's axis (as segC_crew's walkers)
    const camP = V().setFromMatrixPosition(w.camera.matrixWorld), toCam = Math.atan2(camP.x - pos.x, camP.z - pos.z);
    const cosA = Math.max(0.35, Math.abs(Math.cos(toCam) * dir.x - Math.sin(toCam) * dir.z));
    return { st: { at: pos, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase: (((dist * cosA) / WALK_CYCLE_M) % 1 + 1) % 1 }, expr, blink, visible: true }, cloth: null };
  }
  // her own chest (world) and its screen point: the cloth is shaken out here, left of his body
  const chestW = at.clone().add(V(Math.sin(facing) * 0.3, 0.98, Math.cos(facing) * 0.3)).addScaledVector(cr, -0.06);
  const breath = 0.012 * Math.sin(t * 2.3);
  // world targets for the chest phases (both arms in front of her torso)
  const unfold = smooth((f - B.raise) / 10), spread = lerp(0.02, 0.15, unfold);
  const snap = f >= CL.open ? 0.03 * Math.exp(-(f - CL.open) / 3) * Math.sin((f - CL.open) * 1.6) : 0;
  let h0: THREE.Vector3 = chestW.clone().addScaledVector(cr, -spread - snap).addScaledVector(up, 0.02 * unfold + breath);
  let h1: THREE.Vector3 = chestW.clone().addScaledVector(cr, spread + snap).addScaledVector(up, 0.02 * unfold + breath);
  let cloth: ClothState | null = null;
  const lift = smooth((f - CL.lift) / (CL.onHead - CL.lift)), down = smooth((f - CL.onHead) / (B.blind - 2 - CL.onHead));
  const drop = smooth((f - (B.tied + 1)) / 6);
  const sh = smooth((f - (B.tell - 3)) / 7) * (1 - smooth((f - B.tellOut) / 6));
  const rest = smooth((f - (B.resGo - 8)) / 7);
  if (hp) {
    // the band line on his head, raised toward the forehead while it is lifted and sliding down over the eyes
    const raise = 0.3 * hp.r * (1 - down), cB = pxAdd(hp.c, hp.u, raise), Lb = hp.L * (1 - 0.05 * (1 - down));
    const endL = pxAdd(cB, hp.d, -Lb), endR = pxAdd(cB, hp.d, Lb);
    // her near hand: at her chest (shaking the cloth out), then just outside his head at the band's left end (so it
    // shows); the far hand goes behind his head (his card hides it)
    const cs = w.project(chestW), spreadPx = lerp(16, 86, unfold) + 30 * snap / 0.03;
    let p1: Px = { x: cs.x + spreadPx, y: cs.y - 6 * unfold + 40 * breath };
    let p0: Px = { x: cs.x - spreadPx, y: cs.y - 6 * unfold + 40 * breath };
    p1 = pxLerp(p1, pxAdd(endL, hp.d, -0.12 * hp.r), lift);
    p0 = pxLerp(p0, pxAdd(cB, hp.d, 0.4 * hp.r), lift);
    // tying (眼睛 .. tied): small loops of the near hand at the side of his head, the far hand works behind it
    const tie = smooth((f - (B.blind - 1)) / 3) * (1 - drop), ph = (f - B.blind) * 0.85;
    const side = pxAdd(endL, hp.d, -0.14 * hp.r);
    p1 = pxLerp(p1, { x: side.x + 0.07 * hp.r * Math.cos(ph), y: side.y + 0.07 * hp.r * Math.sin(ph) }, tie);
    p0 = pxLerp(p0, { x: cB.x + 0.35 * hp.r + 0.1 * hp.r * Math.sin(ph + 1), y: cB.y }, tie);
    // knot done: hands back to her chest
    const chestPx: [Px, Px] = [{ x: cs.x - 70, y: cs.y + 10 }, { x: cs.x + 70, y: cs.y + 10 }];
    if (drop > 0) { p1 = pxLerp(p1, chestPx[1], drop); p0 = pxLerp(p0, chestPx[0], drop); }
    // 告诉你: the near hand rests on his near shoulder, at the edge of his hair (two small pats)
    if (sh > 0) {
      const pat = 0.06 * hp.r * Math.max(0, Math.sin(((f - B.tell) / 9) * Math.PI)) * (f < B.tell + 18 ? 1 : 0);
      p1 = pxLerp(p1, { x: hp.x - 1.27 * hp.r, y: hp.y + 1.12 * hp.r - pat }, sh);
    }
    h0 = aimScreen(w, res, 0, p0); h1 = aimScreen(w, res, 1, p1);
    // the cloth: shaken out between her hands, then from her near hand across his head and down over his eyes; the kit
    // blindfold takes over on 眼睛
    // on the head the strip ends on the head outline, as the kit band (clipped to the head x 1.04) does: the chord of
    // the outline at the band's height, short enough that its square corners stay inside it (no strip overhanging the
    // hair, nothing to change when the kit band takes over on 眼睛)
    const Lc = Math.sqrt(Math.max(0, Lb * Lb - (raise + 0.15 * hp.r) ** 2));
    if (f >= B.raise && f < B.blind) cloth = { k: lift, a: pxAdd(cB, hp.d, -Lc), b: pxAdd(cB, hp.d, Lc), open: unfold };
  }
  if (rest > 0) {
    h0.lerp(at.clone().addScaledVector(cr, -0.16).addScaledVector(up, 0.5), rest);
    h1.lerp(at.clone().addScaledVector(cr, 0.16).addScaledVector(up, 0.5), rest);
  }
  // she watches the cloth while she opens it, then his head; on 告诉你 him (a knowing look)
  const looking = f < B.tied + 4;
  return {
    // 告诉你: she leans in toward his ear (torso and head toward him, the knowing smirk; no talking mouth: the narrator speaks)
    st: { at, facing, pose: { kind: "hold", t, lean: 7 * sh, headTilt: 3 * Math.sin(t * 1.3) + 6 * sh }, aimAt: [h0, h1], expr, blink, visible: true,
      lookUp: looking ? -0.35 * unfold * (1 - lift) : 0, look: looking ? 0.5 * Math.max(lift, 1 - unfold) : 0.55 * sh },
    cloth,
  };
}
/** lines 08-10, the clipboard and pen back in hand. Line 08: by the window where she left line 07 (EXIT_W), writing,
 *  then watching square 1 on 你一个人. Line 09: she walks on along the windows to RES_ASIDE (her face in the gap between squares 5 and 6), reads
 *  the dial (screen-left) and writes after each reading. Line 10: writes, glances up on 15 %. */
function resSide(w: World, f: number): FigState {
  const t = f / FPS, expr = exprAt(f, RES_EX), blink = blinkAt(f, 109, RES_EX);
  const props: [null | "clipboard", null | "pen"] = ["clipboard", "pen"];
  const walkEnd = B.l09 + 40;
  if (f >= B.l09 && f < walkEnd) {
    // a curve bowed 0.35 m off the windows (RES_VIA) so her stride never reaches into radiator 2; planted feet
    const k = walkK(f, B.l09, walkEnd - B.l09), camP = V().setFromMatrixPosition(w.camera.matrixWorld);
    const { at: pos, dir, phaseDist } = walkAlong(EXIT_W, RES_VIA, RES_ASIDE, k, camP);
    return { at: pos, facing: Math.atan2(dir.x, dir.z), pose: { kind: "walk", phase: ((phaseDist / WALK_CYCLE_M) % 1 + 1) % 1, props: ["clipboard", null] }, expr, blink, visible: true };
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
/** the dark cloth (line 07, until the kit blindfold takes over on 眼睛): its own strip mesh in the lab scene, the
 *  blindfold's colour. It is laid out in SCREEN space (two end points in px, a thickness in px, a sag in px) on a plane
 *  just in front of square 1's card, so it draws over his face when it is on his head and over nothing else while it is
 *  at her chest (her hands are left of his body there; checked in dbg). Thickness = the kit band (0.3 x head radius). */
let cloth: THREE.Mesh | null = null;
const CLOTH_N = 16;
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
/** path: screen points (px) the cloth runs through; thick (px); sag (px, downward at the middle of the run); z: view
 *  depth (m) of the plane it is laid on */
function poseCloth(w: World, path: Px[] | null, thick = 0, sag = 0, z = 1) {
  if (!cloth) return;
  if (!path || path.length < 2) { cloth.visible = false; return; }
  cloth.visible = true;
  // resample the polyline by arc length, sag it, then offset both edges along the local normal
  const segL = path.slice(1).map((q, i) => Math.hypot(q.x - path[i].x, q.y - path[i].y)), total = segL.reduce((m, x) => m + x, 0) || 1;
  const at = (u: number): Px => {
    let d = u * total, i = 0;
    while (i < segL.length - 1 && d > segL[i]) { d -= segL[i]; i++; }
    const k = segL[i] > 0 ? Math.min(1, d / segL[i]) : 0;
    return { x: lerp(path[i].x, path[i + 1].x, k), y: lerp(path[i].y, path[i + 1].y, k) + sag * 4 * u * (1 - u) };
  };
  const pts = Array.from({ length: CLOTH_N + 1 }, (_, i) => at(i / CLOTH_N));
  const pos = cloth.geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i <= CLOTH_N; i++) {
    const pa = pts[Math.max(0, i - 1)], pb = pts[Math.min(CLOTH_N, i + 1)], dx = pb.x - pa.x, dy = pb.y - pa.y, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, u = i / CLOTH_N;
    // a hanging cloth twists a little narrower in the middle; full width when straight
    const tk = (thick * (1 - 0.25 * Math.min(1, sag / 60) * Math.sin(Math.PI * u))) / 2;
    const p0 = screenToWorld(w, pts[i].x + nx * tk, pts[i].y + ny * tk, z), p1 = screenToWorld(w, pts[i].x - nx * tk, pts[i].y - ny * tk, z);
    pos.setXYZ(i * 2, p0.x, p0.y, p0.z); pos.setXYZ(i * 2 + 1, p1.x, p1.y, p1.z);
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
    if (f <= B.h2End) {
      c.rope.setGold(0.55, 0);
      crewPose(w, c, f, { pullers: h2Pullers(), researcher: H2_RESEARCHER(w) });
      pickRope!.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) }); pickRope!.mesh.visible = false;   // parked: hide the 2 cm stub at the origin
      poseCloth(w, null);
    } else {
      const pullers = [0, 1, 2, 3, 4, 5].map((i) => pullerAt(w, i, f));
      const glow = f >= B.one ? 0.45 * Math.exp(-Math.max(0, f - B.one - 4) / 24) * smooth((f - B.one) / 4) : 0;
      const slack = f < B.p2 ? 0 : 0.75 * smooth((f - B.p2) / 12);
      if (f < B.side) {
        // two solves: the first finds puller 1's head (and her shoulders), her hands are aimed at it in the second
        crewC(w, c, pickRope!, f, { pullers, researcher: resPos1(w, f, null, c.res).st, slack });
        const hp = headPx(w, c.pullers[0], cam.fov);
        const R = resPos1(w, f, hp, c.res);
        crewC(w, c, pickRope!, f, { pullers, researcher: R.st, slack });
        if (R.cloth) {
          // the cloth: her near hand -> her far hand (shaken out, sagging), blending into her near hand -> the band line
          // across his head (straight); thickness = the kit band's (0.3 x head radius), a little less while it hangs
          const n = w.project(c.res.handWorld(1)), fr = w.project(c.res.handWorld(0)), k = R.cloth.k;
          const N: Px = { x: n.x, y: n.y }, F: Px = { x: fr.x, y: fr.y };
          // (the strip's near end leaves her near hand for the head outline as it goes on, so her hand shows beside the band)
          const path = [pxLerp(N, R.cloth.a, k), pxLerp(pxLerp(N, F, 0.5), R.cloth.a, k), pxLerp(F, R.cloth.b, k)];
          const thick = 0.3 * hp.r * lerp(0.82, 1, k), sag = lerp(lerp(8, 60, R.cloth.open), 0, smooth(k * 1.3));
          poseCloth(w, path, thick, sag, hp.z - 0.05);
          if (IP.dbg) console.log(`[segC] f${f} CLOTH ${path.map((q) => `${q.x.toFixed(0)},${q.y.toFixed(0)}`).join(" > ")} thick ${thick.toFixed(0)} sag ${sag.toFixed(0)} | band c ${hp.c.x.toFixed(0)},${hp.c.y.toFixed(0)} tilt ${(Math.atan2(hp.d.y, hp.d.x) * 180 / Math.PI).toFixed(1)}deg L ${hp.L.toFixed(0)}`);
        } else poseCloth(w, null);
        // the last helper lets go (B.leave[5]): the rope beyond square 2 falls to the floor (the kit's free-end drop, its
        // length easing out to the lying length) instead of switching from hand height to the floor in one frame; the
        // rest of the spare rope lies from where it lands to the fixed floor end
        const go = B.leave[5];
        if (f >= go && f < go + 16) {
          const p2h = c.pullers[1].handWorld(0), sq = A.positions[5], E = ropeEnd(w);
          const G0 = V(sq.x - 0.12, A.ropeY, A.ropeZ), G1 = V(sq.x - 0.12, 0.016, A.ropeZ - 0.06);
          const tg = (f - go) / FPS, dr = ropeMotion.drop(tg, { dur: 0.3 }), L0 = p2h.distanceTo(G0);
          const bo = ropeMotion.boing(tg, { to: lieLength(p2h, G1) - L0 });
          c.tail.update({ a: p2h, b: G1, bFrom: G0, endT: dr.endT, endLift: dr.endLift, length: L0 + bo.slack, attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
          const endP = c.tail.points[c.tail.points.length - 1].clone();
          pickRope!.update({ a: endP, b: E, slack: lieSlack(endP, E, 0, 0.016), attachA: { kind: "end" }, attachB: { kind: "end" } });
        }
        if (IP.dbg) {
          const h0 = w.project(c.res.handWorld(0)), h1 = w.project(c.res.handWorld(1));
          console.log(`[segC] f${f} RES hands ${h0.x.toFixed(0)},${h0.y.toFixed(0)} / ${h1.x.toFixed(0)},${h1.y.toFixed(0)} | p1 head ${hp.x.toFixed(0)},${hp.y.toFixed(0)} r${hp.r.toFixed(0)}px (left edge x ${(hp.x - hp.r).toFixed(0)})`);
        }
      } else {
        const res: FigState = f < B.p1 ? resSide(w, f) : { ...resSide(w, f), visible: true };
        const ci = crewC(w, c, pickRope!, f, { pullers, researcher: res, slack, glow, drape: drapeAt(f) });
        poseCloth(w, null);
        if (IP.dbg && ci.pickPoint) console.log(`[segC] f${f} PICK p${ci.picker + 1} at ${ci.pickPoint.toArray().map((x) => x.toFixed(2)).join(",")} gap ${(ci.pickGap * 100).toFixed(1)}cm drape ${drapeAt(f).toFixed(2)}`);
      }
      if (dialShot) {
        // the visible end of the rope: from the shackle straight along the rope line toward square 1's (off-frame) hands.
        // Seen from 0.6-1.2 m on the rope line the kit's 2-turn hitch reads as a tangle of strands under the load cell;
        // one turn and a shorter tail read as a plain knot (the shackle is off-frame in every other close shot)
        const sq = A.positions[0];
        c.rope.update({ a: A.hook, b: V(sq.x - 0.12, 0.92, A.ropeZ), via: [V(sq.x - 0.4, 0.905, A.ropeZ)], attachA: { kind: "knot", axis: A.hookTie.axis, postR: A.hookTie.postR, turns: 1, tail: 0.025 }, attachB: { kind: "hand", tail: 0 }, gold: 0.55, glow: 0 });
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
    if (f >= B.card + 4 && f <= YOU_OUT + 8 && f < B.p1) {
      // line 09: who the numbers are about (puller 1 is small at the far end of the side view, by the dial): a gold 你
      // over his head, the film's colour for "you", until the walkers come back in
      const hd = c.pullers[0].headWorld(tv), top = proj(tw.copy(hd).setY(hd.y + c.pullers[0].headR));
      kids.push(h(RopeChip, { key: "you", frame: f, at: B.card + 4, out: YOU_OUT, x: top.x, y: top.y - 6, dx: 34, dy: -84, text: "你", tone: "gold", scale: 0.9 }));
    }
    if (f >= B.card && f <= B.cardOut + 8) {
      // the reference row (alone = 100 %) comes with the card; then each row on its spoken number
      kids.push(h(PctCardC, { key: "card", f, at: B.card, out: B.cardOut, title: "以为有几个帮手", top: 122, labelW: 150,
        rows: [{ label: "独自", value: 100, at: B.card }, { label: "1个", value: 90, at: B.b90 }, { label: "2-6个", value: 85, at: B.b85 }] }));
    }
    if (f >= B.group && f <= B.groupOut + 8 && f < B.p1) {
      // over square 3 (the first of the returning pretenders), so the chip never sits over the researcher's head (she
      // stands behind squares 4-5 in this view and must not read as the one pretending)
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
  const ropes = ([["rope", c.rope], ["behind", c.behind], ["tail", c.tail], ["pick", pickRope!]] as [string, Rope][]).map(([n, r]) => { const k = r.clearance(col); return `${n} len ${r.length.toFixed(2)} hits ${k.hits} worst ${(k.worst * 100).toFixed(1)}cm`; }).join(" | ");
  const gauge = col.reduce((m, b) => Math.min(m, b.distanceToPoint(camP)), Infinity);
  const resLine = Math.abs(c.res.mesh.position.z - A.ropeZ);
  // the researcher's card vs the taut rope (hook -> square 2), as in preview/lab_common
  console.log(`[segC] f${f} cam ${(cam.pos as Vec3).map((x) => x.toFixed(3)).join(",")} fov ${cam.fov.toFixed(2)} | min cam->collider ${gauge.toFixed(2)}m | res off line ${resLine.toFixed(2)}m | dial ${L.set.objects.needle ? dialAt(f).toFixed(2) : "?"}`);
  console.log(`[segC] f${f} ${heads}`);
  console.log(`[segC] f${f} ${ropes}`);
  // walkers / pickers: root, distance to the rope lying on the floor (tail + pick pieces, points below 0.1 m) and to the
  // other figures' roots; the researcher's face vs every head in front of it (screen px overlap of the head discs)
  const focal = 960 / Math.tan((cam.fov * Math.PI) / 360);
  const floorPts = [c.tail, pickRope!].flatMap((r) => r.points.filter((q) => q.y < 0.1 && q.y > -1));
  const roots = vis.map(([n, F]) => [n, F.mesh.position.clone().setY(0)] as [string, THREE.Vector3]);
  const walk = vis.filter(([n, F]) => n !== "p1" && n !== "p2" && n !== "res" && F.st.pose.kind !== "haul").map(([n, F]) => {
    const r = F.mesh.position.clone().setY(0);
    const dRope = floorPts.reduce((m, q) => Math.min(m, Math.hypot(q.x - r.x, q.z - r.z)), Infinity);
    const dFig = roots.filter(([m]) => m !== n).reduce((m, [, q]) => Math.min(m, q.distanceTo(r)), Infinity);
    return `${n} ${F.st.pose.kind} at ${r.x.toFixed(2)},${r.z.toFixed(2)} rope ${dRope.toFixed(2)}m fig ${dFig.toFixed(2)}m`;
  });
  if (walk.length) console.log(`[segC] f${f} WALK ${walk.join(" | ")}`);
  // feet vs every rope piece (a shoe stepping through the rope): closest ankle -> rope point, horizontal and height
  const allPts = [c.rope, c.behind, c.tail, pickRope!].flatMap((r) => r.points.filter((q) => q.y > -1 && q.y < 0.25));
  const ank = vis.map(([n, F]) => {
    let best = Infinity, dy = 0;
    for (const i of [0, 1] as const) {
      const a = F.ankleWorld(i);
      for (const q of allPts) { const d = Math.hypot(q.x - a.x, q.z - a.z); if (d < best) { best = d; dy = a.y - q.y; } }
    }
    return best < 0.12 ? `${n} ${(best * 100).toFixed(1)}cm (dy ${(dy * 100).toFixed(1)}cm)` : "";
  }).filter(Boolean);
  console.log(`[segC] f${f} ANKLES ${ank.join(" | ") || "all >12cm from rope"}`);
  // card pixels vs the set's solid boxes (穿模): every visible figure
  const cc = vis.map(([n, F]) => { const k = cardClearance(F, col, 32); return k.hits ? `${n} ${k.hits} hits ${(k.worst * 100).toFixed(1)}cm` : ""; }).filter(Boolean);
  console.log(`[segC] f${f} CARDS ${cc.join(" | ") || "0 hits"}`);
  if (c.res.mesh.visible) {
    const rh = w.project(c.res.headWorld()), rr = (c.res.headR / rh.z) * focal;
    const over = vis.filter(([n]) => n !== "res").map(([n, F]) => {
      const q = w.project(F.headWorld()), r = (F.headR / q.z) * focal, d = Math.hypot(q.x - rh.x, q.y - rh.y);
      return q.z < rh.z && d < r + rr ? `${n} ${(((r + rr - d) / (2 * rr)) * 100).toFixed(0)}%` : "";
    }).filter(Boolean);
    console.log(`[segC] f${f} RESFACE ${rh.x.toFixed(0)},${rh.y.toFixed(0)} r${rr.toFixed(0)}px covered by: ${over.join(", ") || "none"}`);
  }
  if (f === 1007) console.log(`[segC] f${f} SIDECAM look ${(L.set.cams.side.look as number[]).map((x) => x.toFixed(3)).join(",")}`);
  if (f === S.to || f === B.dial || f === B.end - 1) {
    // the match frame: projected bezel (front rim, 1 cm in front of the face) diameter and centre
    const xb = A.dialCentre.x + 0.01, cy = A.dialCentre.y, cz = A.dialCentre.z, R = A.dialBezelRadius;
    const l = w.project(V(xb, cy, cz + R)), r = w.project(V(xb, cy, cz - R)), tp = w.project(V(xb, cy + R, cz)), bt = w.project(V(xb, cy - R, cz));
    console.log(`[segC] f${f} BEZEL width ${(r.x - l.x).toFixed(1)}px height ${(bt.y - tp.y).toFixed(1)}px centre ${((l.x + r.x) / 2).toFixed(1)},${((tp.y + bt.y) / 2).toFixed(1)} face centre ${px(A.dialCentre)}`);
  }
}

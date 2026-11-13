// SEGMENT G, lines G01-G09: the last day on the road at 沙丘, then the museum. WP5 seg G.
//   road    G01   out of F's palm (the same dark warm brown fades up): the hot still road, battery 8 %; she creeps,
//                 tired, up behind the officials' queue at the closed carriage. 「陛下？」 the lens lifts, hopeful;
//                 「还拍吗」 it leans in. Official A hands his bundle to the 宦官 at the curtain, who slips it through;
//                 an unseen hand inside draws it in.
//           G02   「准。」 the eunuch (not the emperor) listens at the curtain, says it flat, nods; the lens perks up
//           G03   「准。」 again, before official B has even arrived: the hope goes out of the lens
//           G04   the narration: she pushes slowly toward the closed window; on 死 the lens sinks; the officials keep
//                 handing their slips in, calm, unaware; on 瞒 the eunuch's eyes flick to the lens and away; on 递
//                 official D's bundle goes through the curtain
//           G05   the flies start; on 臭 she steps back and turns to the rear rack; two attendants carry baskets of
//                 salted whole fish in and set them on the rack, each landing on its bundle_thud; they step back, bow
//           G06   LOWER: the camera droops to 0.6 m, the horizon tilts; the flies over the baskets against the sky
//   museum  G07   straight cut: the first perfectly still frame of the film (no handheld, no REC): rows of terracotta
//                 facing the lens; 大哥 in clay hides once at the left edge (one blink, late: the easter egg)
//           G08   his voice off-screen; G09 her 「不删。」; hold, then the fade to the darkest warm tone by the last frame
// Every frame comes from line() / capWord() / BEAT / SEGMENTS; every mark from layout/road.ts and layout/museum.ts.
import * as THREE from "three";
import { SEGMENTS, line, capWord, quote, FPS, clamp01, lerp, lin, smooth, easeOutCubic, easeInOutCubic, h, type Segment, type Pose, type CamPose } from "../story";
import { BEAT } from "../beats";
import type { World } from "../world";
import * as C from "../cam";
import { HUANGUAN, OFFICIAL, ATTENDANT, TERRACOTTA, DAGE_CLAY } from "../people";
import { ROAD, RX } from "../layout/road";
import { MUSEUM, MUSEUM_CAMS, museumMark } from "../layout/museum";
import { holdPoints, SLIPS, BIG_CARRIAGE, type Prop } from "../props";
import { V, rel, lid, path, accent, heads, speak, frag, walkAlong, alive, salute, bow, lerpA, wrapA, yawTo, type RigState, type RigHead } from "./common";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[6];
const sec = (s: number) => Math.round(s * FPS);
const WARM = "#2a1d19";                                   // F's palm / the film's darkest warm tone

// ====================================================================================================== the frames
const G01 = line("G01"), G02 = line("G02"), G03 = line("G03"), G04 = line("G04"), G05 = line("G05"), G06 = line("G06");
const G07 = line("G07"), G09 = line("G09");
const T = {
  /** out of the palm: the warm brown fades up over 14 frames */ fadeUp: [S.from, S.from + 14] as [number, number],
  /** she arrives behind the queue */ arrive: G01.from + sec(1.9),
  /** 「陛下？」 the lens lifts */ hope: capWord("G01", "陛下").from,
  /** 「还拍吗」 it leans in */ lean: capWord("G01", "拍").from,
  /** 「准。」 x 2 */ zhun1: G02.from, zhun2: G03.from,
  /** 死: the lens sinks */ dead: capWord("G04", "死").from,
  /** 瞒: the eunuch's glance */ hide: capWord("G04", "瞒").from,
  /** 递: D's bundle goes in */ hand: capWord("G04", "递").from,
  /** 臭: she steps back to the rack */ smell: capWord("G05", "臭").from,
  /** 臭: the eunuch steps back from the window and withdraws */ withdraw: capWord("G05", "臭").from - 6,
  /** the flies (sound: G05 start - 0.3 s) */ flies: G05.from - sec(0.3),
  /** the two baskets land (sound: bundle_thud at G05 end - 1.30 s and - 0.50 s) */
  thud1: Math.round((G05.end - 1.3) * FPS), thud2: Math.round((G05.end - 0.5) * FPS),
  /** the droop */ lower: BEAT.G.lower,
  /** the museum */ museum: BEAT.G.museum,
  /** 大哥's one blink: late in the hold after 不删 */ dageBlink: G09.to + sec(0.7),
  fade: BEAT.G.fade,
};

// ====================================================================================================== the road marks
/** the 宦官 at the curtain (beside the window, clear of the wheel), his base facing (toward the queue and the lens), and
 *  his way out on 臭 (a step back from the window, then off to the right) */
const EUN = V(RX + 1.38, 0, -6.05), EUN_FACE = 0.25;
const EUN_OFF = [EUN, V(RX + 1.9, 0, -5.9), V(RX + 2.7, 0, -6.6)];
/** the queue: Q[0] = the head (in front of the eunuch), then back toward the lens on the right */
const Q = [V(RX + 1.85, 0, -5.45), V(RX + 2.05, 0, -4.6), V(RX + 2.25, 0, -3.75), V(RX + 2.45, 0, -2.9)];
/** where a bundle changes hands, where it meets the window (its inner end just outside the curtain), and inside */
const HAND = V(RX + 1.56, 0.8, -5.71);
/** the eunuch carries a bundle ON his open right palm (the hand under it: never buried in it): the bundle's middle sits
 *  UNDER (R + the palm) above the hand and SLIDE behind it along the bundle (the hand under its outer half at the push) */
const UNDER = SLIPS.r + 0.018, SLIDE: [number, number] = [0.04, 0.11];
/** his right hand at the window (out to his side, clear of his big head), the bundle's middle at the push (its inner
 *  end at the curtain, the bundle well inside the window's height: sill 1.12, head 1.62), and inside */
const WINH = V(RX + 1.0, 1.21, -6.16), WIN1 = V(RX + 1.0 - SLIDE[1], 1.21 + UNDER, -6.16), INSIDE = V(RX + 0.45, 1.21 + UNDER, -6.16);
/** the way out of the queue: off the right of the frame through the gap in the roadside grass tufts (sets/road.ts seeds
 *  them along the road's edge, x RX + 2.3 .. 2.9: the gap is at z -5.3, between the tufts at z -4.78 and -5.76), one
 *  end point each, 0.67 m apart */
const exitPath = (k: number) => [Q[0], V(RX + 3.6, 0, -5.15), V(RX + 5.0 + 0.5 * k, 0, -5.5 - 0.45 * k)];
/** a bundle's yaw for a holder facing `fc` (the bundle is symmetric: brought into -PI/2 .. PI/2) */
const rotFor = (fc: number) => { let r = wrapA(fc); if (r > Math.PI / 2) r -= Math.PI; if (r <= -Math.PI / 2) r += Math.PI; return r; };
const FACE_Q0 = yawTo(Q[0], EUN);
const ROT_Q0 = rotFor(FACE_Q0);
/** a holder's two hands on a bundle at `c` (yaw rot): [right, left] by which end is on his right */
const handsOn = (p: THREE.Vector3, fc: number, c: THREE.Vector3, rot: number): [THREE.Vector3, THREE.Vector3] => {
  const [a, b] = holdPoints("slips", c, { grip: "pair", rot }), right = V(-Math.cos(fc), 0, Math.sin(fc));
  return a.clone().sub(p).dot(right) >= b.clone().sub(p).dot(right) ? [a, b] : [b, a];
};
/** the bundle held at the chest */
const chest = (p: THREE.Vector3, fc: number, bob = 0) => rel(p, fc, 0, 0.78 + bob, 0.25);

/** ONE HANDOVER: official `k` walks up from Q[k] (from `walk`), offers at the head, the eunuch takes it (`take`), turns
 *  it to the window and pushes it through the parted curtain (`push`); it is drawn in from inside; the eunuch says his
 *  准 (`answer`, or none); the official bows and walks off (`leave`, or stays). */
type Cycle = { k: number; walk: number; take: number; push: number; answer?: number; leave?: number };
const SPEED = 1.0;
const walkF = (k: number) => Math.round((Q[k].distanceTo(Q[0]) / SPEED) * FPS);
//   each leaves once his bow is over (bowOn + 22: the bow never pops off), and the next one arrives at the head 33+
//   frames after that (he walks up the queue's line while the last one walks out east: their heads never meet)
const CYCLES: Cycle[] = [
  { k: 0, walk: S.from - 60, take: T.hope + 6, push: T.hope + 46, answer: T.zhun1, leave: T.zhun1 + 22 },
  { k: 1, walk: T.zhun1 + 28, take: T.zhun2 + 45, push: T.zhun2 + 67, leave: T.zhun2 + 99 },
  { k: 2, walk: T.zhun2 + 79, take: T.hide - 27, push: T.hide - 5, leave: T.hide + 27 },
  { k: 3, walk: T.hand - 22 - walkF(3) - 14, take: T.hand - 22, push: T.hand, leave: T.hand + 34 },
];
/** the curtain: parts before each push, closes once the bundle is drawn in */
const curtainAt = (f: number) => Math.max(0, ...CYCLES.map((c) => lin(f, c.push - 14, c.push - 4) * (1 - lin(f, c.push + 14, c.push + 24)))) * 0.65;

type Bundle = { c: THREE.Vector3; rot: number } | null;
/** official k on frame f: his state, the bundle (when he holds it) */
function official(f: number, cy: Cycle): { st: Extra; bundle: Bundle; holds: boolean } {
  const { k } = cy, t = f / FPS;
  const lifeT = t + 0.37 * k;
  const breath = 0.006 * Math.sin(2 * Math.PI * 0.27 * lifeT + k);
  // walking up to the head of the queue
  const up = k === 0 ? { at: Q[0].clone(), facing: FACE_Q0, moving: false, arrived: true, pose: { kind: "idle" as const, t: lifeT } }
    : walkAlong([Q[k], Q[0]], SPEED, (f - cy.walk) / FPS, { endFacing: FACE_Q0, startFacing: yawTo(Q[k], Q[0]) });
  if (f < cy.take) {
    const p = up.at, fc = up.facing;
    // holding the bundle at the chest; once at the head he offers it out to HAND over the 12 frames before the take
    // (from his arrival when he arrives later than that: the bundle never jumps out to the offer on the step he stops)
    const arr = k === 0 ? cy.walk : cy.walk + walkF(k) + 1;
    const offer = up.arrived ? smooth(lin(f, Math.max(cy.take - 14, arr), cy.take - 2)) : 0;
    const c = chest(p, fc, breath).lerp(HAND, offer), rot = lerpA(rotFor(fc), ROT_Q0, offer);
    return {
      st: { at: p, facing: fc, pose: up.moving ? up.pose : { kind: "idle", t: lifeT }, ...alive(t, 20 + k), hands: handsOn(p, fc, c, rot),
        expr: "neutral", lookDown: 6 + 8 * offer, turn: 1, visible: true },
      bundle: { c, rot }, holds: true,
    };
  }
  // given: his hands go from the bundle's ends to a clasp before his belly (the salute's own hand points, so the bow
  // starts without a snap) and stay there; he bows (salute) after the answer / the push, then walks off (or stays)
  const bowOn = (cy.answer ?? cy.push + 10);
  const grip = handsOn(Q[0], FACE_Q0, HAND, ROT_Q0), let_ = smooth(lin(f, cy.take, cy.take + 8));
  const clasp = (p: THREE.Vector3, fc: number): [THREE.Vector3, THREE.Vector3] => [rel(p, fc, -0.05, 0.8, 0.36), rel(p, fc, 0.05, 0.8, 0.36)];
  const kb = smooth(lin(f, bowOn + 2, bowOn + 8)) * (1 - smooth(lin(f, bowOn + 16, bowOn + 22)));
  if (cy.leave === undefined || f < cy.leave) {
    const p = Q[0], fc = FACE_Q0, cl = clasp(p, fc);
    const hands: [THREE.Vector3, THREE.Vector3] = [grip[0].clone().lerp(cl[0], let_), grip[1].clone().lerp(cl[1], let_)];
    return { st: { at: p, facing: fc, ...alive(t, 20 + k), hands, ...salute(kb, p, fc, lifeT), expr: "neutral", turn: 1, visible: true }, bundle: null, holds: false };
  }
  const out = walkAlong(exitPath(k), SPEED, (f - cy.leave) / FPS, { startFacing: FACE_Q0 });
  const outFc = lerpA(FACE_Q0, out.facing, smooth(lin(f, cy.leave, cy.leave + 10)));   // the turn to go (no snap)
  return { st: { at: out.at, facing: outFc, pose: out.pose, hands: clasp(out.at, outFc), ...alive(t, 20 + k), expr: "neutral", turn: 1, visible: true }, bundle: null, holds: false };
}

/** the end of the offered bundle on the eunuch's right (unit, from its middle), and where his right hand takes it: his
 *  open palm under it, 4 cm off the middle toward that end (the official's hands stay on the ends until he lets go) */
const grabDir = (fc: number) => { const ax = V(Math.cos(ROT_Q0), 0, -Math.sin(ROT_Q0)), right = V(-Math.cos(fc), 0, Math.sin(fc)); return ax.dot(right) >= 0 ? ax : ax.negate(); };
const grabPt = (fc: number) => HAND.clone().addScaledVector(grabDir(fc), SLIDE[0]).add(V(0, -UNDER, 0));
/** the bundle's yaw from the take to the window (+x outward): the way round that keeps it pointing away from his
 *  body halfway (it then extends forward of the hand, never back into his belly) */
const sweep = (fc: number): [number, number] => {
  const a0 = grabDir(fc), ang0 = Math.atan2(-a0.z, a0.x), fwd = V(Math.sin(fc), 0, Math.cos(fc));
  let a1 = 0; while (a1 - ang0 > Math.PI) a1 -= 2 * Math.PI; while (ang0 - a1 > Math.PI) a1 += 2 * Math.PI;
  const mid = (ang0 + a1) / 2;
  if (Math.cos(mid) * fwd.x - Math.sin(mid) * fwd.z > 0) a1 += a1 > ang0 ? -2 * Math.PI : 2 * Math.PI;
  return [ang0, a1];
};
/** the eunuch on frame f: his state and the bundle he holds (if any) */
function eunuch(f: number): { st: Extra; bundle: Bundle } {
  const t = f / FPS;
  // 臭: his work done, he steps back from the window and withdraws to the right, hands in his sleeves (out of her
  // frame before she reaches the rack)
  const wk = walkAlong(EUN_OFF, 0.8, (f - T.withdraw) / FPS, { startFacing: EUN_FACE });
  if (f > T.withdraw) {
    const cl: [THREE.Vector3, THREE.Vector3] = [rel(wk.at, wk.facing, -0.05, 0.82, 0.25), rel(wk.at, wk.facing, 0.05, 0.82, 0.25)];
    const wfc = lerpA(EUN_FACE, wk.facing, smooth(lin(f, T.withdraw, T.withdraw + 8)));   // the turn to go (no snap)
    return { st: { at: wk.at, facing: wfc, pose: wk.moving ? wk.pose : { kind: "idle", t: t + 0.6 }, hands: wk.moving ? undefined : cl, expr: "deadpan", ...alive(t, 31), lookDown: 8, visible: true }, bundle: null };
  }
  const clasp: [THREE.Vector3, THREE.Vector3] = [rel(EUN, EUN_FACE, -0.05, 0.82, 0.25), rel(EUN, EUN_FACE, 0.05, 0.82, 0.25)];
  // the cycle he is in: from 10 frames before a take to 12 after its push
  const cy = CYCLES.find((c) => f >= c.take - 10 && f <= c.push + 14);
  let hands: [THREE.Vector3, THREE.Vector3] = clasp, bundle: Bundle = null, facing = EUN_FACE, bw = 0;
  if (cy) {
    const turn = smooth(lin(f, cy.take + 4, cy.push - 8)) * (1 - smooth(lin(f, cy.push + 4, cy.push + 14)));
    facing = lerp(EUN_FACE, 0.12, turn);
    bw = 0.5 * turn;
    if (f < cy.take) {
      // reaching for the official's bundle at HAND
      const k = smooth(lin(f, cy.take - 10, cy.take));
      hands = [clasp[0].clone().lerp(grabPt(facing), k), clasp[1]];
    } else if (f <= cy.push) {
      // the official lets go; his RIGHT palm (under the bundle) takes it up and out to his side, swinging it end-on to
      // the window (the bundle slides forward over the palm, which ends under its outer half) and in at the curtain
      const u = smooth(lin(f, cy.take, cy.push));
      const hand = path(f, [[cy.take, grabPt(facing)], [Math.round(lerp(cy.take, cy.push, 0.35)), rel(EUN, facing, -0.16, 0.86, 0.36)],
        [Math.round(lerp(cy.take, cy.push, 0.7)), rel(EUN, facing, -0.24, 0.95, 0.32)], [cy.push, WINH.clone(), easeOutCubic]]);
      const sw = sweep(facing), ang = lerp(sw[0], sw[1], u), a = V(Math.cos(ang), 0, -Math.sin(ang));
      const c = hand.clone().add(V(0, UNDER, 0)).addScaledVector(a, -lerp(SLIDE[0], SLIDE[1], u));
      bundle = { c, rot: ang };
      hands = [hand, clasp[1]];
    } else {
      // the bundle is drawn in off his palm (drawnIn): the palm stays at the curtain 2 frames, then back to the clasp
      const k = smooth(lin(f, cy.push + 2, cy.push + 11));
      hands = [WINH.clone().lerp(clasp[0], k), clasp[1]];
    }
  }
  // the face: flat (deadpan); his eyes on the work (screen left, the curtain); on 瞒 they flick to the lens and away
  const glance = f >= T.hide && f < T.hide + 18;
  const listen = (f >= T.zhun1 - 16 && f < T.zhun1 + 4) || (f >= T.zhun2 - 8 && f < T.zhun2 + 4);
  const expr: Expr = glance ? "focus" : "deadpan";
  const gaze = glance ? 0 : listen ? -1 : cy ? -0.5 : [0, -0.5, 0, 0.5][Math.floor(t * 0.6) % 4];
  const sp = { ...speak(quoteOf("G02"), f, 5), ...speak(quoteOf("G03"), f, 5) };
  const bw0 = bow(bw);
  const head: RigHead | undefined = heads(
    sp.head, bw0.head,
    listen ? { tilt: -6 * smooth(lin(f, T.zhun1 - 16, T.zhun1 - 8)), dx: -0.05 } : undefined,
    accent("nod", f, T.zhun1 + 2, { amp: 0.7 }),
    accent("nod", f, T.zhun2 + 2, { amp: 0.5 }),
  );
  const blink = sp.blink ?? lid(t, 31, [T.hide / FPS, (T.hide + 18) / FPS]);
  return {
    st: { at: EUN, facing, pose: { kind: "idle", t: t + 0.6 }, hands, expr, gaze, blink, mouth: sp.mouth, head, lookDown: bw0.lookDown, visible: true },
    bundle,
  };
}
const quoteOf = (id: string) => quote("huanguan", id);

/** the bundle a cycle's push left in the window, drawn in off his palm by an unseen hand over 6 frames (from the push:
 *  its inner end is in the window from the 2nd frame; hidden once wholly inside) */
function drawnIn(f: number): Bundle {
  for (const c of CYCLES) {
    if (f > c.push && f <= c.push + 6) {
      const p = WIN1.clone().lerp(INSIDE, easeInOutCubic(lin(f, c.push, c.push + 6)));
      p.x = Math.min(p.x, WIN1.x);
      if (p.x > RX + 0.5) return { c: p, rot: 0 };
    }
  }
  return null;
}

// ------------------------------------------------------------------------------------------------- the attendants
/** two attendants carry a basket of salted fish each in from the sides of the frame to the two ENDS of the rear rack
 *  (she films from behind the carriage: nobody stands between her lens and the baskets), lift it up at the end of the
 *  rack, step in and set it on, each landing on its bundle_thud; they step back, bow to the carriage and go back out the
 *  way they came (out of the frame before her camera droops) */
type Lifter = { key: string; from: THREE.Vector3; set: THREE.Vector3; on: number; side: 1 | -1 };
const RACK_Z = ROAD.rack.z + 0.06;                       // the baskets' middle on the rack (clear of the body's floor beam)
const RACK_HALF = BIG_CARRIAGE.rack.w / 2;               // the rack's ends: ROAD.rack.x -+ RACK_HALF
const LIFTERS: Lifter[] = [
  { key: "1", from: V(RX - 3.2, 0, -4.4), set: V(ROAD.rack.x - 0.275, ROAD.rack.y, RACK_Z), on: T.thud1, side: -1 },
  { key: "2", from: V(RX + 2.9, 0, -4.5), set: V(ROAD.rack.x + 0.3, ROAD.rack.y, RACK_Z), on: T.thud2, side: 1 },
];
/** the lift (frames before the thud): up at the end of the rack, then the step in and over, then down on it */
const LIFT = 26, LIFT_UP = 17, LIFT_OVER = 4, LIFT_SPEED = 1.0;
/** where each stands to set it (just off the rack's end, his robe clear of it), and where he lifts it (PRE_BACK further
 *  out: the basket in front of him still clear of the rack's end and its bearer) */
const PRE_BACK = 0.6;
const standOf = (L: Lifter) => V(ROAD.rack.x + L.side * (RACK_HALF + 0.2), 0, RACK_Z + 0.04);
const faceOf = (L: Lifter) => yawTo(standOf(L), L.set);
const preOf = (L: Lifter) => rel(standOf(L), faceOf(L), 0, 0, -PRE_BACK);
/** carried low and out in front (the top under the big head, the near side clear of the belly) */
const carry = (p: THREE.Vector3, fc: number) => rel(p, fc, 0, 0.4, 0.48);
/** the palms on the basket's near wall (rig hands: balls), for a basket whose origin is `b`, held by someone facing `fc` */
const basketHands = (b: THREE.Vector3, fc: number): [THREE.Vector3, THREE.Vector3] => [rel(b, fc, -0.12, 0.2, -0.255), rel(b, fc, 0.12, 0.2, -0.255)];
/** the basket's place during a lift (the same path lifter() pins the hands to): up in front of him at the rack's end
 *  (its bottom 8 cm over the rack's top before it moves over it), over the rack as he steps in, then down on its mark */
function liftBasket(f: number, L: Lifter) {
  const fc = faceOf(L), pre = preOf(L), c0 = carry(pre, fc), up = rel(pre, fc, 0, ROAD.rack.y + 0.08, 0.5), over = L.set.clone().add(V(0, 0.05, 0));
  return path(f, [[L.on - LIFT, c0], [L.on - LIFT_UP, up], [L.on - LIFT_OVER, over], [L.on, L.set.clone(), easeOutCubic]]);
}
function lifter(f: number, L: Lifter, id: number): { st: Extra; basket: THREE.Vector3 | null } {
  const t = f / FPS, fc = faceOf(L), pre = preOf(L), stand = standOf(L);
  const start = L.on - LIFT - Math.round((L.from.distanceTo(pre) / LIFT_SPEED) * FPS) - 4;
  // not on the road before he sets off (his mark is off her frame then, but in the queue shots it stood among the
  // officials, his basket in their robes)
  if (f < start) return { st: { visible: false }, basket: null };
  if (f < L.on - LIFT) {
    const wk = walkAlong([L.from, pre], LIFT_SPEED, (f - start) / FPS, { endFacing: fc });
    const b = carry(wk.at, wk.facing);
    return { st: { at: wk.at, facing: wk.facing, pose: wk.moving ? wk.pose : { kind: "idle", t: t + id }, hands: basketHands(b, wk.facing), expr: "focus", ...alive(t, 40 + id), lookDown: 10, visible: true }, basket: b };
  }
  // the lift: up at the rack's end, a step in as it goes over, down on it (lands on L.on)
  const u = lin(f, L.on - LIFT, L.on), step = smooth(lin(f, L.on - LIFT_UP, L.on - LIFT_OVER));
  if (f <= L.on + 6) {
    const p = pre.clone().lerp(stand, step), b = liftBasket(f, L);
    return { st: { at: p, facing: fc, pose: { kind: "idle", t: t + id }, hands: basketHands(b, fc), expr: "focus", blink: lid(t, 40 + id), lookDown: 10 - 6 * u, visible: true }, basket: b };
  }
  // set down: hands off, a step back out, a bow to the carriage, then back out of the frame the way he came (head low)
  const back = smooth(lin(f, L.on + 6, L.on + 20)), kb = smooth(lin(f, L.on + 22, L.on + 30)) * (1 - smooth(lin(f, L.on + 40, L.on + 48)));
  const rest = stand.clone().lerp(pre, 0.5);
  const clasp = (p: THREE.Vector3, c: number): [THREE.Vector3, THREE.Vector3] => [rel(p, c, -0.05, 0.8, 0.36), rel(p, c, 0.05, 0.8, 0.36)];
  if (f >= L.on + 50) {
    const off = walkAlong([rest, L.from.clone().add(V(0, 0, 0.5))], 1.1, (f - L.on - 50) / FPS, { startFacing: fc });
    const ofc = lerpA(fc, off.facing, smooth(lin(f, L.on + 50, L.on + 60)));   // the turn round (no snap)
    return { st: { at: off.at, facing: ofc, pose: off.pose, hands: clasp(off.at, ofc), ...alive(t, 40 + id), expr: "sad", lookDown: 12, visible: !off.arrived }, basket: L.set.clone() };
  }
  const q = stand.clone().lerp(rest, back), g0 = basketHands(L.set, fc), cq = clasp(q, fc), lt = smooth(lin(f, L.on + 6, L.on + 16));   // off the basket as he steps back (clear of the rack's end)
  const hands: [THREE.Vector3, THREE.Vector3] = [g0[0].clone().lerp(cq[0], lt), g0[1].clone().lerp(cq[1], lt)];
  return { st: { at: q, facing: fc, ...alive(t, 40 + id), hands, ...salute(kb, q, fc, t + id), expr: "sad", lookDown: 12 + 12 * kb, visible: true }, basket: L.set.clone() };
}

/** the flies of a fish basket prop (the prop's swarm, turned and bobbing: never frozen). `away` (m) shifts the swarm
 *  toward +z in the world (a basket of yaw `rot` on the rack: its swarm's ring, 0.3 across its middle, would otherwise
 *  circle through the carriage's rear wall 0.28 m behind the basket's middle) */
const buzz = (pr: Prop, f: number, seed: number, away = 0, rot = 0) => {
  let i = 0;
  pr.group.traverse((o) => {
    if (o.name !== "fishBasket.flies") return;
    const t = f / FPS, s = seed * 1.7 + i * 2.3;
    o.rotation.set(0.09 * Math.sin(t * 2.3 + s), t * (1.6 + 0.3 * (i % 2)) * (i % 2 ? -1 : 1) + s, 0.08 * Math.sin(t * 3.1 + s * 0.7));
    o.position.set(-away * Math.sin(rot), 0.035 * Math.sin(t * 4.2 + s), away * Math.cos(rot));
    i++;
  });
  pr.group.updateMatrixWorld(true);
};

// ------------------------------------------------------------------------------------------------------ her camera
const START: C.CamKey = { f: S.from, pos: [RX + 1.7, 1.55, 2.2], look: [RX + 1.05, 1.3, -6.3] };
const QCAM = { pos: [RX + 1.5, 1.55, -1.0] as [number, number, number], look: [RX + 1.2, 1.25, -6.0] as [number, number, number] };
const QCAM2 = { pos: [RX + 1.32, 1.53, -1.8] as [number, number, number], look: [RX + 1.0, 1.27, -6.15] as [number, number, number] };
/** G05: she has stepped back behind the carriage, square on to its rear rack: the two ends of the rack (where the
 *  attendants set the baskets) inside the frame, the eunuch and the officials out of it on the right */
const RACK = { pos: [ROAD.rack.x, 1.52, -0.4] as [number, number, number], look: [ROAD.rack.x, 0.98, ROAD.rack.z] as [number, number, number] };
function roadCam(f: number): CamPose {
  const turn = T.smell - 50;
  let cam = C.povCam(f, [
    START,
    { f: T.arrive, ...QCAM, ease: easeOutCubic },
    { f: G04.preFrom, ...QCAM },
    { f: T.hand - 20, ...QCAM2, ease: easeInOutCubic },
    { f: turn, ...QCAM2 },
    { f: T.smell + 10, ...RACK, ease: easeInOutCubic },
  ], {
    mood: "calm", amp: 0.85, seed: 7,
    walk: [[S.from, 0.55], [T.arrive - 24, 0.45], [T.arrive, 0], [G04.preFrom, 0], [G04.preFrom + 20, 0.1], [T.hand - 30, 0.1], [T.hand - 20, 0], [turn, 0], [turn + 12, 0.4], [T.smell + 10, 0.25], [T.smell + 22, 0]],
  });
  // 「陛下？」 the lens lifts a little (hope); 「还拍吗」 it leans in; 准 (1) it perks up, 准 (2) the hope goes out of it
  const hope = smooth(lin(f, T.hope - 4, T.hope + 10)) * (1 - smooth(lin(f, T.zhun2, T.zhun2 + 30)));
  const lean = smooth(lin(f, T.lean - 6, T.lean + 8)) * (1 - smooth(lin(f, T.zhun2 + 2, T.zhun2 + 30)));
  cam = C.nudge(cam, { pitch: 1.2 * hope, up: 0.015 * hope, fwd: 0.08 * lean });
  cam = C.punchIn(cam, f, T.zhun1 + 1, { k: 0.95, len: 5, off: T.zhun2 + 16 });
  // 死: a held breath, the lens sinks and stays a little low through G04
  const sink = smooth(lin(f, T.dead - 4, T.dead + 26)) * (1 - smooth(lin(f, G05.from, G05.from + 20)));
  cam = C.nudge(cam, { pitch: -1.6 * sink, up: -0.03 * sink });
  // 臭: a small recoil as she steps back
  cam = C.nudge(cam, { fwd: -0.05 * Math.sin(Math.PI * clamp01((f - T.smell + 2) / 16)) });
  // G06: she lets it droop, the horizon tilting
  return C.lower(cam, f, T.lower, { to: 0.6, tilt: 8, len: 34 });
}

// ================================================================================================= THE ROAD (G01-G06)
function road(w: World, f: number): Pose {
  w.setPlace("road");
  w.set.param("heat", 1);
  w.set.param("flies", false);
  const camera = roadCam(f);
  w.setCamera(camera);
  // the officials
  const bundles: Bundle[] = [];
  CYCLES.forEach((cy) => {
    const o = official(f, cy);
    w.actor(OFFICIAL, String(cy.k)).set(o.st as RigState);
    if (o.holds) bundles.push(o.bundle);
  });
  const e = eunuch(f);
  w.actor(HUANGUAN).set(e.st as RigState);
  bundles.push(e.bundle, drawnIn(f));
  // the attendants with the baskets
  const baskets = LIFTERS.map((L, i) => {
    const a = lifter(f, L, i);
    w.actor(ATTENDANT, L.key).set(a.st as RigState);
    return a.basket;
  });
  w.update();
  // the props: the carriage (its curtain parts for each push), the bundles, the baskets (lifted: put where the hands
  // are), the baggage cart ahead with its own baskets
  w.prop("bigCarriage").put(ROAD.carriage, { open: curtainAt(f) });
  bundles.forEach((b, i) => { if (b) w.prop("slips", `g${i}`).put(b.c, { grip: "pair", rot: b.rot, n: 1 }); });
  const fliesOn = f >= T.flies;
  LIFTERS.forEach((L, i) => {
    const b = baskets[i];
    if (!b) return;
    const pr = w.prop("fishBasket", L.key).put(b, { on: fliesOn, rot: 0.6 * i });
    if (fliesOn) buzz(pr, f, i + 1, 0.16, 0.6 * i);
  });
  const cart = w.prop("fishCart").put(ROAD.fishCart, { on: fliesOn });
  if (fliesOn) buzz(cart, f, 5);
  const what = f < T.zhun1 ? "creep, G01" : f < G04.preFrom ? "准" : f < G05.from ? "the queue (G04)" : f < T.lower ? "the fish" : "lower";
  return { camera, overlays: frag(fadeUp(f)), slate: `G road: ${what}` };
}
/** G's first frames: F's palm (the dark warm brown) fading up */
const fadeUp = (f: number) => {
  const a = 1 - smooth(lin(f, T.fadeUp[0], T.fadeUp[1]));
  return a > 0.001 ? h("div", { key: "fadeUp", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: WARM, opacity: a } }) : null;
};

// ============================================================================================= THE MUSEUM (G07-G09)
/** the rail camera (MUSEUM_CAMS.rail) 10 cm nearer the rail and aimed MDOWN deg down: the front rank's faces (chins
 *  included) above the caption band, the handrail low in the frame. Perfectly still: no handheld at all. */
const MDOWN = 29;
const MR = MUSEUM_CAMS.rail;
const MCAM: CamPose = { pos: [MR.pos[0], MR.pos[1], MR.pos[2] - 0.1], look: [MR.look[0], MR.pos[1] - Math.tan((MDOWN * Math.PI) / 180) * Math.hypot(MR.pos[0] - MR.look[0], MR.pos[2] - 0.1 - MR.look[2]), MR.look[2]], fov: MR.fov };
/** the grid mark 大哥 takes (the left file, third rank: he stands a third of a step out toward the wall) */
const DAGE_MARK = { file: 0, rank: 2 };
function museum(w: World, f: number): Pose {
  w.setPlace("museum");
  w.set.param("light", 1);
  w.setCamera(MCAM);
  // the warriors: clay, perfectly still (each a slightly different breath phase frozen, so the rows are not clones);
  // a calm, flat face (TERRACOTTA's neutral reads as a sly grin on 23 faces at once: wrong for this ending)
  for (let r = 0; r < 6; r++) for (let fl = 0; fl < 4; fl++) {
    if (fl === DAGE_MARK.file && r === DAGE_MARK.rank) continue;
    w.actor(TERRACOTTA, `${fl}.${r}`).set({ at: museumMark(fl, r), facing: MUSEUM.facing, pose: { kind: "idle", t: 0.37 * (fl + 4 * r) }, expr: "deadpan", gaze: 0, blink: 0, visible: true });
  }
  // 大哥 in clay among them: hush, the finger at his lips; one blink, late (the easter egg)
  const bl = f - T.dageBlink, blink = bl >= 0 && bl < 4 ? [0.5, 1, 1, 0.5][bl] : 0;
  w.actor(DAGE_CLAY).set({ at: MUSEUM.dage, facing: MUSEUM.facing, pose: { kind: "shh", t: 0 }, expr: "hush", gaze: 0, blink, visible: true });
  w.update();
  // G06's caption (captions.ts holds it 8 frames past its line) stays on the road side of the cut: the museum opens
  // clean, and its first caption is G07's
  return { camera: MCAM, rec: false, ...(f < G07.from ? { captions: false } : {}), overlays: frag(fadeOut(f)), slate: `G museum${f >= BEAT.G.voice ? " (voice)" : ""}` };
}
/** the end: the darkest warm tone over BEAT.G.fade, full on the last frame */
const fadeOut = (f: number) => {
  const a = smooth(lin(f, T.fade[0], T.fade[1]));
  return a > 0.001 ? h("div", { key: "fadeOut", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: WARM, opacity: a } }) : null;
};

export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f) => (f < T.museum ? road(w, f) : museum(w, f)),
};

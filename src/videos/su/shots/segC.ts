// SEGMENT C, lines C19-C26: 中午, under the lychee tree. WP5 segC, RESTAGED IN A BAMBOO CHAIR by the C-chair lane
// (2026-11-14: Jay saw him upright on the rattan day bed with his shins sunk into it, "very off"; PLAN 11.6). PLAN.md 8C,
// beats.ts BEAT.C; PLAN 11.1-3: no mic, no arm (her.ts draws only what her invisible hand holds), asides without the mic.
// One handheld take in her eyes (a hard cut in from B's stove, a hard cut out to D's hooves):
//   tree     C pre     the lychee tree heavy with red fruit, SU sitting back in the BAMBOO CHAIR in its shade in his 东坡巾
//                      (SU_HAT.cap), his feet on the ground, his left forearm over the armrest dangling a bunch of lychees
//                      outside it, peeling one with his right hand; she walks in; he TOSSES it (BEAT.C.toss): it flies into
//                      the lower right of her frame and STOPS DEAD as her invisible hand closes on it (BEAT.C.catch), her
//                      camera jolts a little.
//   ask      C19       amazed, the lychee held low in the lower right (under the captions), bobbing with her camera; he
//                      lifts the bunch, plucks another and peels it, amused, smug on 真的假的.
//   wink     C20       mock-solemn (deadpan), the peeled lychee raised like a lecturer's pointer on 诗嘛; on 夸张 THE WINK
//                      (the SU_WINK swap: smug, a head tilt, eyes to the lens).
//   shells   C20 after THE TILT DOWN: she steps back and her camera tips down and pans off him to the ground BESIDE THE
//                      CHAIR on his left: the mountain of red shells (yard param shells 1) fills the frame's middle (it was
//                      never in frame before: layout YARD.shells, every earlier framing measured); he eats the fruit off
//                      the frame. C21 「一点。」 is an ASIDE: a small further turn away, a tilt and a push in (she leans to the
//                      viewer, deadpan) while his empty shell sails in from the left and lands on the top on 点.
//   sincere  C22-C23   her camera comes back to him; he listens, the smile softening, plucks and peels a third; C23
//                      content, meaning it: holds it up on 有荔枝吃, eats it on 吃, waves the bunch out at the yard on 一辈子.
//   lieBack  C23 after he leans back in the chair (the rig has no recline: his back on the backrest, the head dropping
//                      back): the bunch dropped in his lap, the empty shell left on his belly, BOTH HANDS BEHIND HIS HEAD,
//                      elbows out (she drifts round to face him, so both elbows show); the far-off temple bell: eyes
//                      shut, bliss.
//   recite   C24-C25   she asks; he recites drowsy, eyes half shut, his head rocking to the metre; a slow push in.
//   snore    C26-end   C26 is an ASIDE (she translates to the viewer: her camera turns away from him toward the tree side,
//                      tilts, pushes in, holds, comes back); when it comes back he has nodded off: slumped in the chair,
//                      head lolled over to one side and back, hands still behind his head, the shell on his belly rising
//                      with slow deep breaths; the camera drifts back and over, so he sits in the right half and card 2
//                      takes the left (his face never under it, out of the top rows and the top-right HUD corner).
// Every frame from beats.ts (BEAT.C) / lineId / capWord / SEGMENTS; every mark from layout/yard.ts (YARD.chair,
// YARD.chairRot, YARD.shells) and props/ (chairSeat, chairHands); her invisible hand is her.ts (putHer, hand only); props
// pinned after w.update().
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU, SU_WINK, SU_HAT } from "../people";
import { YARD, EYE } from "../layout";
import { chairSeat, chairHands } from "../props";
import { putHer, herKeys, type HandO } from "../her";
import { transitionAt } from "../hud";
import { setSeat } from "../../../kit/acc/garb";
import type { World } from "../world";
import { V, rel, says, accent, heads, at, ky, path, hopArc, frag, lid, swaps, type Rig, type RigState, type PathKey } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[2], B = BEAT.C;
const ln = (id: string) => lineId(id);
const word = (id: string, w: string) => capWord(id, w).from;
const sec = (s: number) => Math.round(s * FPS);

// ------------------------------------------------------------------------------------------------------- the beats
const L19 = ln("C19"), L20 = ln("C20"), L21 = ln("C21"), L22 = ln("C22"), L23 = ln("C23"), L24 = ln("C24"), L25 = ln("C25"), L26 = ln("C26");
const W_ZHEN = word("C19", "真的假的"), W_SHIMA = word("C20", "诗嘛"), W_DIAN21 = word("C21", "点");
const W_NANGUO = word("C22", "难过"), W_CHI = word("C23", "吃"), W_ZAI = word("C23", "在这儿"), W_BEIZI = word("C23", "一辈子");
const W_DAOREN = word("C25", "道人"), W_ZHONG = word("C25", "五更钟"), W_SHUI = word("C26", "睡得");
/** under the tree at noon the bamboo hat is off: the 东坡巾 cap (PLAN 2) */
const HAT = SU_HAT.cap;
/** her walk in ends (eased) on this frame: the talking framing */
const ARRIVE = L19.from + sec(0.8);
/** the wink: the SU_WINK figure from B.wink for this many frames */
const WINK_N = 16;
/** he lifts the bunch and plucks the second lychee off it (right hand), peels it under C19 */
const PICK2 = B.catch + 8, PEEL2 = [L19.from + 24, L19.to - 6] as const;
/** he eats it while her camera is down on the pile, then flicks the empty shell onto the pile on C21's 点 */
const EAT2 = B.tilt[0] + 8, FLICK = W_DIAN21 - 9, LAND = W_DIAN21 + 2;
/** the third lychee: plucked as she starts C22, peeled under it, held up on 有荔枝吃, eaten on 吃 */
const PICK3 = L22.from + 6, PEEL3 = [L22.from + 28, L22.to - 4] as const;
/** the lean back: the shell left on his belly, the bunch laid in his lap, both hands up behind his head */
const SETDOWN = B.lieBack + 14, DROP = B.lieBack + 4, HANDS_UP = B.lieBack + 30;
/** he nods off during C26 (under her aside): the lids close from W_SHUI on; slumped by the time her camera is back */
const DOZE = W_SHUI;
/** C26: her aside to the viewer (the turn away starts just before the line, comes back just after it) */
const ASIDE26 = [L26.from - 9, L26.to + 14] as const;
/** C21: her deadpan aside over the pile (B.aside is the turn's start; it comes back as her camera returns to him) */
const ASIDE21 = [B.aside, L21.to + 11] as const;

// ------------------------------------------------------------------------------------------------------- the marks
/** the bamboo chair (its origin: the ground under the middle of its seat's front edge) and his seat in it: the rig's
 *  sit with his back on the backrest and his feet on the ground, facing YARD.chairRot (toward her side of the yard) */
const CHAIR = YARD.chair, CHAIR_ROT = YARD.chairRot;
const CS = chairSeat(CHAIR, CHAIR_ROT);
const FACE = CS.facing;
const TOP = CS.seat.top;
/** a point in his seated frame: x = to his LEFT (screen right), y up from the seat's top, z forward (toward her) from
 *  the seat's middle */
const sp = (x: number, y: number, z: number) => rel(TOP, FACE, x, y, z);
/** his head centre in the chair (measured headless: the hip sits 3 cm behind the seat's middle with his round back on
 *  the reclined panel; the belly's front is about 0.2 m ahead of the seat's middle, the knees 0.27 ahead and 0.08 up,
 *  the feet on the ground 0.31 ahead; the armrests' tops are 0.23 up, 0.29 out each side) */
const HEAD = sp(0.01, 0.723, 0.043);
/** his hands at rest: the right on his right thigh just in front of the belly; the left over the left armrest, the bunch
 *  dangling OUTSIDE the chair from it; peeling = the right hand alone in front of his belly ("one-handed") */
const LAP_R = sp(-0.13, 0.2, 0.27), ARM_L = sp(0.39, 0.27, 0.12);
/** the left hand lifted over the armrest (the dangling bunch clears it: it hangs 0.18 m under the hand) */
const OVER_L = sp(0.36, 0.47, 0.2);
const PEEL_R = (f: number) => sp(-0.03, 0.3 + 0.007 * Math.sin(f * 1.3), 0.33);
/** the bunch lifted in front of his belly for the right hand to pluck from; the bunch laid in his lap (on its side
 *  along his left thigh, its stem at his belly and its fruit toward his knee, resting on the robe (measured with the
 *  clearance checker: touching, not in it): it tips over as he lays it down, SETDOWN - 8 .. SETDOWN) */
const BUNCH_UP = sp(0.05, 0.4, 0.35), BUNCH_DOWN = sp(0.09, 0.17, 0.2);
const BUNCH_DOWN_ROT: [number, number, number] = [0, FACE - 0.3, 1.45];
/** the cluster of a bunch held at h (lycheeBunch: the fruit hang 0.1 m under the stem's top) */
const cluster = (h: THREE.Vector3) => h.clone().add(V(0.01, -0.095, 0.015));
/** his lychees and shells are drawn a third larger than life: at 2 m a 4 cm fruit is a few pixels on a phone */
const BIG = 1.35;
/** where the shells end: the top of the pile beside the chair (yard param shells 1) and his belly */
const PILE = YARD.shells;
const PILE_TOP = V(PILE.x - 0.02, 0.445, PILE.z - 0.04);
const BELLY = sp(-0.11, 0.21, 0.22);

// ------------------------------------------------------------------------------------------------------- her camera
type K = { pos: Vec3; look: Vec3 };
/** a camera at `pos` aimed so the world point `target` lands at screen (sx, sy) px (of 1080 x 1920; no roll) */
const aim = (pos: Vec3, target: THREE.Vector3, sx: number, sy: number, fov = C.FOV): K => {
  const p = V(...pos), d = target.clone().sub(p), hd = Math.hypot(d.x, d.z), t = Math.tan((fov * Math.PI) / 360);
  const f0 = V(d.x / hd, 0, d.z / hd), r0 = V(-f0.z, 0, f0.x);
  const dyaw = Math.atan((sx / 540 - 1) * t * (9 / 16)), pitch = Math.atan2(d.y, hd) - Math.atan((1 - sy / 960) * t);
  const fw = f0.multiplyScalar(Math.cos(dyaw)).addScaledVector(r0, -Math.sin(dyaw)).multiplyScalar(Math.cos(pitch)).add(V(0, Math.sin(pitch), 0));
  const l = p.addScaledVector(fw, d.length());
  return { pos, look: [l.x, l.y, l.z] };
};
/** her eyes `dist` m from his head (horizontally), `az` deg round from +z toward +x (his chair faces 14 deg) */
const around = (az: number, dist: number): Vec3 => [HEAD.x + dist * Math.sin((az * Math.PI) / 180), EYE, HEAD.z + dist * Math.cos((az * Math.PI) / 180)];
/** THE PILE STAYS HIDDEN until the tilt: it lies on the ground beside the chair on his left (screen right), so every
 *  framing of him before the tilt keeps his head right of the frame's middle and the pile past its right edge
 *  (measured with the probe, every key and the walk in between).
 *  The talking framing: her eyes 2.1 m from him, at his left-front (11 deg off the way he faces); his eyes in the upper
 *  third, his head a third of the frame wide, a little right of the middle (the tree's trunk behind him on the left) */
const TALK = aim(around(25, 2.1), HEAD, 670, 585);
/** C pre: from further out on the yard side, his head lower in the frame, the lychee tree's trunk and its fruit-hung
 *  crown over him; she walks in to TALK */
const START = aim(around(22, 3.2), HEAD, 765, 900);
/** THE TILT DOWN, a comic pull-back and pan: she steps back 0.3 m and right 0.2 m and her camera tips down and swings
 *  off him to the pile beside the chair: the mountain of shells big in the middle (its body above the caption
 *  band, where the flicked shell lands), he and his chair out of the frame on the left, a hen pecking behind it */
const REVEAL = (() => {
  const p = V(...TALK.pos), back = p.clone().sub(HEAD).setY(0).normalize(), right = V(back.z, 0, -back.x);
  const q = p.addScaledVector(back, 0.3).addScaledVector(right, 0.2);
  return aim([q.x, EYE, q.z], V(PILE.x, 0.42, PILE.z), 610, 930);
})();
/** he leans back: she drifts round to face him (3 deg off the way he faces: his hands behind his head read from in
 *  front, both elbows out beside his jaw; chairHands), his head a touch lower in the frame */
const TALK2 = aim(around(17, 2.1), HEAD, 640, 600);
/** C25: a slow push in on the recital (from in front too) */
const CLOSE = aim(around(18, 1.72), HEAD, 640, 600);
/** the end: drifted back and over, so he sits in the right half (card 2 on the left, his face right of its edge x 760) */
const CARD_IN = aim(around(24, 3.35), HEAD, 880, 545);
/** ...and still easing back under the card */
const END = aim(around(24, 3.5), HEAD, 885, 540);
const key = (f: number, k: K, ease?: (x: number) => number): C.CamKey => ({ f, pos: k.pos, look: k.look, fov: C.FOV, ease });
const KEYS: C.CamKey[] = [
  key(S.from, START),
  key(ARRIVE, TALK, easeOutCubic),
  key(B.tilt[0], TALK),
  key(B.tilt[0] + 24, REVEAL),
  key(L21.to + 1, REVEAL),
  key(L22.from + 12, TALK),
  key(B.lieBack + 4, TALK),
  key(B.lieBack + 30, TALK2),
  key(L25.from - 4, TALK2),
  key(L25.to, CLOSE, (x) => x),
  key(B.snore[0] + 6, CLOSE),
  key(B.card[0] - 2, CARD_IN, easeInOutCubic),
  key(S.to, END, (x) => x),
];
/** in over `len` frames from `on`, out over `len` frames ending on `off` (0..1, eased) */
const inOut = (f: number, on: number, off: number, len: number) =>
  easeInOutCubic(clamp01((f - on) / len)) * (1 - easeInOutCubic(clamp01((f - (off - len)) / len)));
/** THE ASIDES (PLAN 11.3): her camera turns away from him toward an empty side (yaw, + = right), tilts (roll), pushes
 *  in a little, holds for the line and comes back: C21 a small further lean over the pile (she is already turned away
 *  from him, to his left), C26 25 deg to the left (the tree's side): he slides out of the frame on the right and is
 *  found asleep when it comes back */
const asides = (c: CamPose, f: number): CamPose => {
  const a = inOut(f, ASIDE21[0], ASIDE21[1], 9), b = inOut(f, ASIDE26[0], ASIDE26[1], 11);
  if (!a && !b) return c;
  return C.nudge(c, { yaw: 8 * a - 25 * b, pitch: 1.5 * a + 1.2 * b, roll: 2.5 * a - 3 * b, fwd: 0.12 * a + 0.12 * b });
};
/** the catch: her camera jolts a little as her hand closes on the lychee (the frame after it stops) */
const jolt = (c: CamPose, f: number): CamPose => {
  const hit = f - (B.catch + 1);
  if (hit < 0 || hit >= 8) return c;
  const j = (1 - hit / 8) * (hit % 2 ? -0.5 : 1);
  return C.nudge(c, { pitch: -1.3 * j, roll: 0.9 * j, up: -0.006 * j });
};
/** her camera on frame f (pure): the keys, a gentle handheld (walking in at the start; nearly still while he dozes),
 *  the catch's jolt and the two asides */
export const camC = (f: number): CamPose => asides(jolt(C.povCam(f, KEYS, {
  mood: [[S.from, "calm"], [B.snore[0], "still"]],
  walk: [[S.from, 1], [ARRIVE - 12, 0.8], [ARRIVE, 0]],
  amp: 0.8, seed: 3,
}), f), f);
/** the catch: where the lychee stops dead in her (invisible) hand: the lower right of the frame, under the caption
 *  band, 0.40 m from her lens, on the camera of the catch frame: where her.ts's "hold" (with HAND_DY) then keeps it, so
 *  it does not drift after it stops */
const CATCH_AT = (() => {
  const c = camC(B.catch), p = V(...(c.pos as Vec3)), A = C.camAxes(c), tan = Math.tan((c.fov * Math.PI) / 360), d = 0.4;
  return p.addScaledVector(A.fwd, d).addScaledVector(A.right, 0.24 * d * tan * (9 / 16)).addScaledVector(A.up, -0.565 * d * tan);
})();

// ------------------------------------------------------------------------------------------------------- his hands
/** the left hand (arm 1) holds the bunch: over the armrest, the bunch dangling outside the chair; lifted to his belly
 *  for each pluck; out to the yard on C23's 一辈子 (he waves the bunch at it all); dropped in his lap as he leans back */
const handL = (f: number): THREE.Vector3 => {
  for (const pk of [PICK2, PICK3]) if (f >= pk - 10 && f < pk + 24) return path(f, [[pk - 10, ARM_L], [pk - 5, OVER_L], [pk, BUNCH_UP], [pk + 10, BUNCH_UP], [pk + 19, OVER_L], [pk + 24, ARM_L]]);
  if (f >= W_ZAI - 6 && f < B.lieBack) return path(f, [[W_ZAI - 6, ARM_L], [W_BEIZI - 4, sp(0.47, 0.5, 0.32)], [L23.to - 8, sp(0.45, 0.47, 0.3)], [B.lieBack - 1, ARM_L]]);
  if (f >= B.lieBack) return path(f, [[B.lieBack, ARM_L], [B.lieBack + 5, OVER_L], [SETDOWN - 8, sp(0.13, 0.36, 0.33)], [SETDOWN, BUNCH_DOWN]]);
  return ARM_L.clone();
};
/** the right hand (arm 0): peels the first lychee, the wind-up and THE TOSS; plucks the second off the bunch, peels it,
 *  raises it on 诗嘛, to his mouth, the backhand flick of the empty shell over his left knee onto the pile; the third the
 *  same; its shell dropped on his belly */
const TOSS_FROM = sp(-0.3, 0.38, 0.06), TOSS_AT = sp(-0.18, 0.5, 0.4);
const RAISE = sp(-0.25, 0.55, 0.3), MOUTH = sp(-0.06, 0.59, 0.33);
const handR = (f: number): THREE.Vector3 => {
  if (f < PICK2 - 6) return path(f, [[S.from, PEEL_R(f)], [B.toss - 6, PEEL_R(f)], [B.toss - 1, TOSS_FROM], [B.toss + 1, TOSS_AT, easeOutCubic], [B.toss + 5, TOSS_AT], [PICK2 - 6, LAP_R]]);
  const pluck = (pk: number): PathKey[] => [[pk - 6, LAP_R], [pk + 4, cluster(BUNCH_UP).add(V(-0.08, -0.01, 0.02))], [pk + 7, cluster(BUNCH_UP).add(V(-0.08, -0.01, 0.02))], [pk + 16, LAP_R]];
  if (f < PICK3 - 6) return path(f, [
    ...pluck(PICK2),
    [PEEL2[0], PEEL_R(f)], [PEEL2[1], PEEL_R(f)], [PEEL2[1] + 8, LAP_R],
    [W_SHIMA - 2, RAISE, easeOutCubic], [L20.to - 2, RAISE],
    [EAT2 - 2, MOUTH], [EAT2 + 6, MOUTH], [EAT2 + 14, sp(-0.15, 0.4, 0.33)], [FLICK - 6, sp(-0.14, 0.42, 0.3)],
    [FLICK, sp(0.02, 0.5, 0.4), easeOutCubic], [FLICK + 10, LAP_R],
  ]);
  return path(f, [
    ...pluck(PICK3),
    [PEEL3[0], PEEL_R(f)], [PEEL3[1], PEEL_R(f)],
    [L23.from + 2, RAISE, easeOutCubic], [W_CHI - 5, RAISE], [W_CHI, MOUTH], [W_CHI + 6, MOUTH], [W_CHI + 14, LAP_R],
    [DROP - 3, LAP_R], [DROP + 2, sp(-0.06, 0.28, 0.3)],
  ]);
};
/** the way up behind his head: out to his side and up first (over the armrest, never through the belly or the beard) */
const upTo = (from: THREE.Vector3, to: THREE.Vector3, side: number, k: number) => {
  const mid = sp(0.36 * side, 0.58, 0.2);
  return k < 0.5 ? from.clone().lerp(mid, smooth(k * 2)) : mid.lerp(to, smooth(k * 2 - 1));
};
/** the arms drawn in front of his own head and long beard (the raised lychee, the hand at his mouth; the bunch lifted
 *  to his belly for a pluck) */
const armFrontR = (f: number) => (f >= W_SHIMA - 6 && f < EAT2 + 12) || (f >= L23.from - 2 && f < W_CHI + 10);
const armFrontL = (f: number) => [PICK2, PICK3].some((pk) => f >= pk - 10 && f < pk + 24);

// ------------------------------------------------------------------------------------------------------- his face
const EXPR: [number, Expr][] = [
  [S.from, "smile"], [B.toss - 3, "grin"], [B.catch + 4, "happy"], [W_ZHEN, "smug"], [L19.to + 4, "smile"],
  [W_SHIMA, "deadpan"], [B.wink, "smug"], [B.wink + WINK_N, "grin"], [EAT2 + 2, "lick"], [EAT2 + 22, "smug"],
  [B.micBack, "smile"], [W_NANGUO, "smile_closed"], [L22.to + 4, "smile"], [L23.from, "happy"], [W_CHI + 2, "lick"],
  [W_ZAI, "happy"], [W_BEIZI, "smile_closed"], [B.lieBack, "relief"], [B.bell, "smile_closed"], [L24.to - 6, "smug"],
  [L25.from, "smile"], [DOZE + 14, "sleep"],
];
/** the eyelids: open and blinking; shut in bliss after the lean back; half shut through the recital; closing under
 *  C26; shut asleep */
const lids = (f: number) => {
  const t = f / FPS, blink = lid(t, 7, swaps(EXPR));
  if (f >= B.lieBack + 10 && f < B.bell + 8) return Math.max(blink, ky(f, [[B.lieBack + 10, 0], [B.lieBack + 22, 0.85]]));
  if (f >= L25.from - 8 && f < L26.from) return Math.max(blink, 0.5);
  if (f >= L26.from) return Math.max(blink, ky(f, [[L26.from, 0.5], [DOZE + 14, 1]]));
  return blink;
};
/** the head layer: tilts and nods that land on the words (and the metre of the recital); the doze: the head lolls over
 *  to his left (screen right) and back, and bobs with the snores */
const headAt = (f: number) => {
  const tilt = ky(f, [[B.wink - 4, 0], [B.wink + 2, 7], [B.wink + WINK_N + 4, 7], [B.wink + WINK_N + 12, 0], [W_NANGUO, 0], [W_NANGUO + 10, -4], [L22.to, -4], [L23.from + 6, 0],
    [B.lieBack + 6, 0], [B.lieBack + 20, -3], [L24.from, -3], [L24.from + 10, 0], [DOZE, 0], [DOZE + 40, 11]]);
  const rock = f >= L25.from && f < L25.to + 6 ? 3.5 * Math.sin(((f - L25.from) / (W_DAOREN - L25.from)) * Math.PI * 2) : 0;
  const nodOff = f >= DOZE ? ky(f, [[DOZE, 0], [DOZE + 24, -0.08], [DOZE + 32, -0.04], [DOZE + 50, -0.07]]) : 0;
  const snore = f >= B.snore[0] ? 0.028 * Math.sin(((f - B.snore[0]) / FPS) * 2 * Math.PI * 0.2) : 0;
  return heads(
    { tilt: tilt + rock, dy: nodOff + snore },
    accent("pop", f, B.toss),
    accent("nod", f, W_SHIMA, { amp: 0.6 }),
    accent("laugh", f, B.wink + WINK_N - 2, { dur: 0.6, amp: 0.5 }),
    accent("nod", f, W_BEIZI, { amp: 0.5 }),
    accent("squash", f, B.lieBack + 18, { amp: 0.6 }),
    accent("nod", f, W_ZHONG, { amp: 0.4 }),
  );
};
/** where he looks: at her (0), out at the valley on 难过 */
const gazeAt = (f: number) => (f >= W_NANGUO + 6 && f < L22.to ? -0.5 : 0);
/** looking down at his peeling hands; the head dropping back as he leans back (negative) and further back asleep */
const lookDownAt = (f: number) => ky(f, [[PEEL2[0] - 6, 0], [PEEL2[0] + 4, 10], [PEEL2[1] - 4, 10], [PEEL2[1] + 4, 0],
  [PEEL3[0] - 6, 0], [PEEL3[0] + 4, 9], [PEEL3[1] - 4, 9], [PEEL3[1] + 4, 0], [B.lieBack + 4, 0], [B.lieBack + 20, -6], [L24.from, -6], [L24.from + 10, -3], [DOZE, -3], [DOZE + 40, -7]]);

// ------------------------------------------------------------------------------------------------------- him
const suState = (f: number): St => {
  const t = f / FPS, asleep = f >= B.snore[0];
  const sp_ = says("su", ["C20", "C23", "C25"], f, 1);
  return {
    at: CS.at, facing: FACE, seat: CS.seat,
    pose: { kind: "sit", t: asleep ? B.snore[0] / FPS + (t - B.snore[0] / FPS) * 0.6 : t },
    expr: at(f, EXPR), ...sp_,
    blink: lids(f),
    head: heads(sp_.head, headAt(f)),
    gaze: gazeAt(f),
    lookDown: lookDownAt(f),
    hide: [...HAT],
    visible: true,
  };
};

// ------------------------------------------------------------------------------------------------------- the props
/** the chair, the bunch (in his left hand, then in his lap), the lychees (the tossed one: in his right hand, then in the
 *  air; the second and third in his right hand) and the shells (the flicked one onto the pile, the one on his belly) */
const props = (w: World, f: number, r: Rig, caught: THREE.Vector3 | null) => {
  w.prop("bambooChair").put(CHAIR, { rot: CHAIR_ROT });
  if (f < SETDOWN - 8) w.prop("lycheeBunch").put(r.handWorld(1), { grip: "hook" });
  else if (f < SETDOWN) { const k = smooth((f - (SETDOWN - 8)) / 8); w.prop("lycheeBunch").put(r.handWorld(1), { grip: "hook", rot: [0, BUNCH_DOWN_ROT[1], BUNCH_DOWN_ROT[2] * k] }); }
  else w.prop("lycheeBunch").put(BUNCH_DOWN, { rot: BUNCH_DOWN_ROT });
  // the tossed lychee: in his hand, then flying into the lower right of her frame; the last frames bend onto the point
  // where her invisible hand holds it (it stops dead there: her.ts draws it from B.catch - 1 on)
  if (f < B.toss) w.prop("lychee", "toss").put(r.handWorld(0), { grip: "hilt", peeled: 0, scale: BIG });
  else if (f < B.catch - 1) {
    const u = (f - B.toss) / (B.catch - B.toss), p = hopArc(TOSS_AT, CATCH_AT, u, 0.2);
    if (caught) p.lerp(caught, smooth(clamp01((f - (B.catch - 3)) / 3)));
    w.prop("lychee", "toss").put(p, { rot: [u * 9, u * 4, 0], scale: lerp(BIG, 1, u) });
  }
  // the second lychee: in his right hand from the pluck; peeled under C19; eaten while her camera is on the pile
  if (f >= PICK2 + 10 && f < EAT2 + 4) w.prop("lychee", "two").put(r.handWorld(0), { grip: "hilt", scale: BIG, peeled: smooth(clamp01((f - PEEL2[0]) / (PEEL2[1] - PEEL2[0]))) });
  if (f >= EAT2 + 4 && f < FLICK) w.prop("shell", "two").put(r.handWorld(0).add(V(0, 0.028, 0)), { rot: [-0.4, 0, 0.2], scale: BIG });
  if (f >= FLICK) {
    const u = clamp01((f - FLICK) / (LAND - FLICK)), p = hopArc(sp(0.03, 0.52, 0.42), PILE_TOP, u, 0.35);
    w.prop("shell", "two").put(p, { rot: [lerp(-0.4, 0.1, u) + 6.28 * u, 0, 0.2], scale: BIG });
  }
  // the third: plucked under C22, peeled, held up on 有荔枝吃, eaten on 吃; its shell dropped on his belly
  if (f >= PICK3 + 10 && f < W_CHI + 2) w.prop("lychee", "three").put(r.handWorld(0), { grip: "hilt", scale: BIG, peeled: smooth(clamp01((f - PEEL3[0]) / (PEEL3[1] - PEEL3[0]))) });
  if (f >= W_CHI + 2 && f < DROP + 2) w.prop("shell", "three").put(r.handWorld(0).add(V(0, 0.028, 0)), { rot: [-0.4, 0, 0.2], scale: BIG });
  if (f >= DROP + 2) {
    const breath = f >= B.snore[0] ? 0.008 * Math.sin(((f - B.snore[0]) / FPS) * 2 * Math.PI * 0.2) : 0;
    w.prop("shell", "three").put(BELLY.clone().add(V(0, breath + 0.05 * (1 - smooth(clamp01((f - DROP - 2) / 5))), 0)), { rot: [-0.5, FACE, 0.2], scale: BIG });
  }
};

// ------------------------------------------------------------------------------------------------------- her
/** her invisible hand (PLAN 11.2: her.ts draws only the lychee): it closes on the lychee where it stops (catch), holds it
 *  low in the lower right (under the caption band) bobbing with her camera, and takes it out of the frame before the
 *  tilt. The mic is gone (PLAN 11.1): no mic keys. */
const HAND_KEYS: [number, HandO["mode"], number?][] = [[B.catch - 6, "catch", 6], [B.catch, "hold", 1], [L19.to - 6, "off", 14]];   // gone before C20 (a floating fruit reads odd for long)
/** the hold's screen offset (NDC): the held lychee sits where it was caught, under the caption band (y > 1500) */
const HAND_DY = { hold: -0.24, off: -0.24 };

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {},
  exit(w) { setSeat(w.actor(SU), null); setSeat(w.actor(SU_WINK), null); },
  pose(w, f): Pose {
    w.setPlace("yard");
    w.set.param("sun", "noon");
    w.set.param("lantern", 1);
    w.set.param("shells", 1);
    const cam = camC(f);
    w.setCamera(cam);
    const winking = f >= B.wink && f < B.wink + WINK_N;
    const su = w.actor(winking ? SU_WINK : SU);
    setSeat(su, CS.seat, FACE);
    const st = suState(f);
    const hR = handR(f), hL = handL(f);
    su.set({ ...st, hands: [hR, hL], armFront: [armFrontR(f) ? true : undefined, armFrontL(f) ? true : undefined] });
    w.update();
    // the lean back: both hands go up behind his head (two passes: chairHands reads the head of this very frame), out
    // to his sides and up first; the right one first leaves the empty shell on his belly, the left the bunch in his lap
    const kL = ky(f, [[SETDOWN + 2, 0], [HANDS_UP, 1]]), kR = ky(f, [[DROP + 4, 0], [HANDS_UP + 4, 1]]);
    if (kL > 0 || kR > 0) {
      const [bR, bL] = chairHands(su.headWorld(), FACE);
      su.set({ hands: [upTo(hR, bR, -1, kR), upTo(hL, bL, 1, kL)] });
      w.update();
    }
    // her invisible hand: only the lychee it holds is drawn
    const hk = herKeys(f, HAND_KEYS);
    const out = putHer(w, cam, f, {
      hand: { ...hk, at: CATCH_AT, item: f >= B.catch - 1 ? "lychee" : undefined, curl: f < B.catch - 1 ? 0.12 : undefined, dy: HAND_DY },
    });
    props(w, f, su, out.hand?.item ?? null);
    return { camera: cam, overlays: frag(transitionAt(f)?.node ?? null), slate: `C ${f < L19.from ? "tree" : f < L20.from ? "ask" : f < B.tilt[0] ? "wink" : f < B.micBack + 16 ? "shells" : f < B.lieBack ? "sincere" : f < L26.from ? "recite" : "snore"}` };
  },
};

// SEGMENT C, lines C19-C26: 中午, under the lychee tree. WP5 segC, RESTAGED IN A BAMBOO CHAIR by the C-chair lane
// (2026-11-14: Jay saw him upright on the rattan day bed with his shins sunk into it, "very off"; PLAN 11.6). PLAN.md 8C,
// beats.ts BEAT.C; PLAN 11.1-3: no mic, no arm (her.ts draws only what her invisible hand holds), asides without the mic.
// One take in her eyes, no cut inside (a hard cut in from B's stove, a hard cut out to D's hooves):
//   tree     C pre     the lychee tree heavy with red fruit, SU sitting back in the BAMBOO CHAIR in its shade in his 东坡巾
//                      (SU_HAT.cap), his feet on the ground, his left forearm over the armrest dangling a bunch of lychees
//                      outside it, peeling one with his right hand; she walks in; he TOSSES it (BEAT.C.toss): it flies into
//                      the lower right of her frame and STOPS DEAD as her invisible hand closes on it (BEAT.C.catch), her
//                      camera jolts a little.
//   ask      C19       amazed, the lychee held low in the lower right (under the captions), bobbing with her camera; he
//                      lifts the bunch, plucks another and peels it, amused, smug on 真的假的.
//   wink     C20       mock-solemn (deadpan), the peeled lychee raised like a lecturer's pointer on 诗嘛; on 夸张 THE WINK
//                      (the SU_WINK swap: smug, a head tilt, eyes to the lens).
//   shells   C20 after he eats the second lychee (on camera since the camera pass). C21 「一点。」 is her aside about a
//                      THING, so it is a GLANCE (PLAN 12.4): he flicks the empty shell and her lens follows it down and
//                      right to the ground BESIDE THE CHAIR on his left, the mountain of red shells (yard param shells 1;
//                      never in frame before: every earlier set-up measured), on it from 点 as the shell lands on top,
//                      and back on him inside 1 s.
//   sincere  C22-C23   her camera comes back to him; he listens, the smile softening, plucks and peels a third; C23
//                      content, meaning it: holds it up on 有荔枝吃, eats it on 吃, waves the bunch out at the yard on 一辈子.
//   lieBack  C23 after he leans back in the chair (the rig has no recline: his back on the backrest, the head dropping
//                      back): the bunch dropped in his lap, the empty shell left on his belly, BOTH HANDS BEHIND HIS HEAD,
//                      elbows out (seen whole from her step back on 一辈子, the pile in front of him); the far-off
//                      temple bell: eyes shut, bliss.
//   recite   C24-C25   she steps back in and asks (from in front: both elbows read); he recites drowsy, eyes half shut,
//                      his head rocking to the metre; a slow push in that lands on 五更钟.
//   snore    C26-end   C26 is an ASIDE (she translates to the viewer): her lens NEVER leaves him (PLAN 12.4), a small step
//                      closer and a 2 deg tip; he nods off under it: slumped in the chair, head lolled over to one side
//                      and back, hands still behind his head, the shell on his belly rising with slow deep breaths; she
//                      drifts back and crouches a little, his face above card 2 (y 770-1086: it crosses his body, never
//                      his face), his body, the chair and his feet filling the lower half.
// THE CAMERA (PLAN 12, the camera pass): one take, still by default, every move for a reason and landing on its word:
// see "her camera" below and /home/user/su_work/cam2/C_plan.md.
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
const W_XINSHI = word("C24", "新诗"), W_DAOREN = word("C25", "道人"), W_ZHONG = word("C25", "五更钟"), W_SHUI = word("C26", "睡得");
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
// THE CAMERA PASS (PLAN 12, Jay's camera rules; plan: /home/user/su_work/cam2/C_plan.md). ONE TAKE, no cut: she
// stands in the shade a couple of metres from his chair and the view changes only when she moves it, for a reason the
// scene gives her (the named set-ups below, mixed by ramps that land on the words). Still is the default: only her
// breathing bob (no wandering sway) between the moves; her walking bob on the walk in.
//   1 walk in (she arrives)          OPEN -> TALK        S.from .. ARRIVE (the toss / the catch's jolt on the way)
//   2 snap zoom on 夸张 (the wink)    TALK -> WINK        lands on W_KUA (the scene's one extreme close), holds
//   3 calm look back out             WINK -> TALK        after C20 (after two fast moves, one calm look)
//   4 THE GLANCE on 「一点。」          TALK -> PILE -> TALK out with the flicked shell, on the pile from 点, back inside 1 s
//   5 push in on 难过 (warmth)         TALK -> NEAR        lands on W_NANGUO (she asks the sincere question)
//   6 step back on 一辈子              NEAR -> WIDE        he waves the bunch at the yard: the yard, the pile in front
//   7 round and in (lie-back, C24)   WIDE -> TALK2       he lies back (both elbows read from his front), she asks
//   8 slow push on the recital       TALK2 -> CLOSE      lands on W_ZHONG
//   9 C26 her aside: a small lean in (a step closer, a 2 deg tip), never off him
//  10 the slow drift back as he snores: END, his face above card 2 (the card crosses his body, never his face)
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
/** her eyes `dist` m from his head (horizontally), `az` deg round from +z toward +x (his chair faces 14 deg), `eye` high */
const around = (az: number, dist: number, eye = EYE): Vec3 => [HEAD.x + dist * Math.sin((az * Math.PI) / 180), eye, HEAD.z + dist * Math.cos((az * Math.PI) / 180)];
/** a set-up: her lens at pos, the world point tgt at screen (sx, sy) px, the lens angle (vertical fov, deg) */
type Shot = { pos: Vec3; tgt: THREE.Vector3; sx: number; sy: number; fov: number };
const shot = (s: Shot): CamPose => { const k = aim(s.pos, s.tgt, s.sx, s.sy, s.fov); return { pos: k.pos, look: k.look, fov: s.fov }; };
const mixShot = (a: Shot, b: Shot, t: number): Shot => ({
  pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
  tgt: a.tgt.clone().lerp(b.tgt, t), sx: lerp(a.sx, b.sx, t), sy: lerp(a.sy, b.sy, t), fov: lerp(a.fov, b.fov, t),
});
/** where her glance lands: the middle of the shell pile beside the chair (yard param shells 1) */
const PILE_SEE = V(PILE.x - 0.04, 0.24, PILE.z + 0.02);
/** THE PILE STAYS HIDDEN until the glance: it lies beside the chair on his left (screen right), so every framing before
 *  it keeps his head right of the frame's middle and the pile past the right edge (the probe: every set-up before 点).
 *  1 OPEN: from further out on his left-front, low in the frame, the lychee tree's crown hung with fruit over him (wide:
 *  the place); not centred, not front-on; the tossed lychee then flies at her lens, the foreground */
const OPEN: Shot = { pos: around(32, 3.3), tgt: HEAD, sx: 735, sy: 960, fov: 62 };
/** the talking two-thing: his face high (eyes y ~650), his peeling hands and the bunch under it, the chair and his feet
 *  down to the bottom (the tall frame filled); head about 40 % of the width */
const TALK: Shot = { pos: around(24, 1.72), tgt: HEAD, sx: 640, sy: 690, fov: 62 };
/** 2 the snap on 夸张: the wink fills the frame (size x 1.5: the scene's one extreme close) */
const WINK: Shot = { ...TALK, sx: 610, sy: 840, fov: 45 };
/** 4 the glance: the same place, her lens turned down and right onto the pile (above the caption band) */
const GLANCE: Shot = { pos: TALK.pos, tgt: PILE_SEE, sx: 560, sy: 800, fov: 60 };
/** 5 the sincere question: half a step in, a touch tighter (size x 1.3), his face a little lower and left */
const NEAR: Shot = { pos: around(20, 1.5), tgt: HEAD, sx: 600, sy: 790, fov: 56 };
/** 6 on 一辈子: she steps back and right: he waves the bunch at the yard; the pile now sits in front of him on the right
 *  (the foreground), the tree's trunk behind; the lie-back reads whole here (both elbows out) */
const WIDE: Shot = { pos: around(44, 2.6), tgt: HEAD, sx: 430, sy: 830, fov: 64 };
/** 7 as he lies back she comes round to his front and in, landing on C24's 新诗 (his hands behind his head read from
 *  the front, both elbows out) */
const TALK2: Shot = { pos: around(16, 1.85), tgt: HEAD, sx: 600, sy: 680, fov: 62 };
/** 8 the recital: the slow push (size x 1.33) */
const CLOSE: Shot = { pos: around(17, 1.5), tgt: HEAD, sx: 600, sy: 790, fov: 57 };
/** 10 the end: she drifts back and crouches a little (lens 1.25 m), his face above card 2 (card y 770-1086: the card crosses his body, not his face),
 *  his body, the shell on his belly, the chair and his feet filling the lower half */
const END: Shot = { pos: around(22, 2.15, 1.25), tgt: HEAD, sx: 705, sy: 600, fov: 62 };
const END2: Shot = { ...END, pos: around(22, 2.25, 1.25) };
/** the frames of the moves (every one from the beats; a move ENDS on its word) */
const W_KUA = B.wink;
const GL = [FLICK + 2, W_DIAN21, LAND + 7, LAND + 14] as const;          // out with the shell, on the pile from 点, back
const PUSH = [L22.from + 6, W_NANGUO] as const;
const BACK = [W_BEIZI - 18, W_BEIZI] as const;
const ASK = [B.lieBack + 4, W_XINSHI] as const;
const RECITE = [L25.from + 6, W_ZHONG] as const;
const DRIFT = [B.snore[0] + 2, B.card[0] + 4] as const;
const smoothE = (x: number) => smooth(clamp01(x));
/** the keys alone (no handheld), on frame f: each ramp starts from wherever the previous ones left the lens */
const setUp = (f: number): Shot => {
  let s = OPEN;
  const go = (a: number, b: number, to: Shot, ease: (x: number) => number = easeInOutCubic) => { if (f >= a) s = mixShot(s, to, ease(clamp01((f - a) / Math.max(1, b - a)))); };
  go(S.from, ARRIVE, TALK, easeOutCubic);              // 1 she walks in
  go(W_KUA - 5, W_KUA, WINK, easeOutCubic);            // 2 snap zoom on 夸张
  go(L20.to + 2, L20.to + 26, TALK);                   // 3 one calm look back out
  go(GL[0], GL[1], GLANCE, easeOutCubic);              // 4 the glance to the pile ...
  go(GL[2], GL[3], TALK);                              //   ... and back to him
  go(PUSH[0], PUSH[1], NEAR, smoothE);                 // 5 push in on 难过
  go(BACK[0], BACK[1], WIDE);                          // 6 step back on 一辈子
  go(ASK[0], ASK[1], TALK2);                           // 7 round to his front as he lies back, in for her question
  go(RECITE[0], RECITE[1], CLOSE, smoothE);            // 8 the slow push on the recital
  go(DRIFT[0], DRIFT[1], END);                         // 10 the drift back as he snores ...
  go(DRIFT[1], S.to, END2, (x) => x);                  //    ... still easing back under the card
  return s;
};
/** in over `len` frames from `on`, out over `len` frames ending on `off` (0..1, eased) */
const inOut = (f: number, on: number, off: number, len: number) =>
  easeInOutCubic(clamp01((f - on) / len)) * (1 - easeInOutCubic(clamp01((f - (off - len)) / len)));
/** 9 C26, HER ASIDE (PLAN 12.4: never leaves him): a small step closer and a 2 deg tip, as if she turned her shoulder
 *  to the viewer; back as the line ends (he has nodded off under it) */
const aside26 = (c: CamPose, f: number): CamPose => {
  const b = inOut(f, ASIDE26[0], ASIDE26[1], 10);
  return b ? C.nudge(c, { roll: -2 * b, pitch: 1.4 * b, fwd: 0.12 * b }) : c;
};
/** the catch: her camera jolts a little as her hand closes on the lychee (the frame after it stops; decays in 8) */
const jolt = (c: CamPose, f: number): CamPose => {
  const hit = f - (B.catch + 1);
  if (hit < 0 || hit >= 8) return c;
  const j = (1 - hit / 8) * (hit % 2 ? -0.5 : 1);
  return C.nudge(c, { pitch: -1.3 * j, roll: 0.9 * j, up: -0.006 * j });
};
/** her breathing (the calm bob, no drift): a slow rise and fall of the lens and a hint of pitch; softer while he sleeps */
const breathe = (c: CamPose, f: number): CamPose => {
  const t = f / FPS, a = f >= B.snore[0] ? 0.5 : 1, ph = 2 * Math.PI * 0.24 * t;
  return C.nudge(c, { up: 0.005 * a * Math.sin(ph + 0.7), pitch: 0.16 * a * Math.sin(ph + 1.9) });
};
/** her camera on frame f (pure): the set-ups, her walking bob on the walk in (cam.ts handheld, mood "still": no
 *  sway), her breathing, the catch's jolt and the C26 aside */
export const camC = (f: number): CamPose => aside26(jolt(breathe(C.handheld(shot(setUp(f)), f, {
  mood: "still", walk: [[S.from, 1], [ARRIVE - 12, 0.8], [ARRIVE, 0]], seed: 3,
}), f), f), f);
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
 *  low in the lower right (under the caption band) bobbing with her camera, and takes it out of the frame at the end
 *  of C19. The mic is gone (PLAN 11.1): no mic keys. */
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

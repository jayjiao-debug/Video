// SEGMENT C, lines C19-C26: 中午, under the lychee tree. WP5 segC. PLAN.md 8C, beats.ts BEAT.C.
// One handheld take in her eyes (a hard cut in from B's stove, a hard cut out to D's hooves):
//   tree     C pre     the lychee tree heavy with red fruit, SU sitting on the rattan bed in its shade in his 东坡巾
//                      (SU_HAT.cap), a bunch of lychees in his left hand, peeling one with his right; she walks in; he
//                      TOSSES it (BEAT.C.toss) and HER HAND snaps in from the lower right and CATCHES it (BEAT.C.catch).
//   ask      C19       amazed, the lychee in her palm (held low, under the captions), the mic swings in; he plucks
//                      another off the bunch and peels it one-handed, amused, smug on 真的假的.
//   wink     C20       mock-solemn (deadpan), the peeled lychee raised like a lecturer's pointer on 诗嘛; on 夸张 THE
//                      WINK (the SU_WINK swap: smug, a head tilt, eyes to the lens).
//   shells   C20 after THE TILT DOWN as a pull-back (she steps back and tips down): the pile of red shells at the bed's
//                      foot fills the lower frame (yard param shells 1), his smug face top right while he eats the fruit;
//                      the mic swings round to the lens; on C21 「一点。」 the empty shell flicks from his hand onto the top.
//   sincere  C22-C23   the camera tips back up, the mic back to him; he listens, the smile softening, picks and peels a
//                      third; C23 content, meaning it: holds it up on 有荔枝吃, eats it on 吃, the bunch waved out at
//                      the yard on 一辈子.
//   lieBack  C23 after he settles back (the rig has no lying pose: he stays seated): the bunch set down, the empty shell
//                      left on his belly, hands behind his head; the far-off temple bell: eyes shut, bliss.
//   recite   C24-C25   she asks (mic toward him); he recites drowsy, eyes half shut, his head rocking to the metre; a
//                      slow push in.
//   snore    C26-end   the mic turns to the lens (she translates); he nods off; asleep (sleep, slow deep breaths, the shell
//                      on his belly rising with them); the camera drifts back and over, so he sits in the right half and
//                      card 2 takes the left (his face and the shell never under it).
// Every frame from beats.ts (BEAT.C) / lineId / capWord / SEGMENTS; every mark from layout/yard.ts (YARD.bed, YARD.shells)
// and props/ (bedSeat); her hand and mic are her.ts (lowered out of the caption band here); props pinned after w.update().
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU, SU_WINK, SU_HAT } from "../people";
import { YARD, EYE } from "../layout";
import { bedSeat } from "../props";
import { putHer, herKeys, type HandO, type MicO } from "../her";
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
const W_ZHEN = word("C19", "真的假的"), W_SHIMA = word("C20", "诗嘛"), W_YIDIAN20 = word("C20", "一点"), W_DIAN21 = word("C21", "点");
const W_NANGUO = word("C22", "难过"), W_CHI = word("C23", "吃"), W_ZAI = word("C23", "在这儿"), W_BEIZI = word("C23", "一辈子");
const W_DAOREN = word("C25", "道人"), W_ZHONG = word("C25", "五更钟"), W_SHUI = word("C26", "睡得");
/** under the tree at noon the bamboo hat is off: the 东坡巾 cap (PLAN 2) */
const HAT = SU_HAT.cap;
/** her walk in ends (eased) on this frame: the talking framing */
const ARRIVE = L19.from + sec(0.8);
/** the wink: the SU_WINK figure from B.wink for this many frames */
const WINK_N = 16;
/** he plucks the second lychee off the bunch in his left hand (right hand), peels it one-handed under C19 */
const PICK2 = B.catch + 8, PEEL2 = [L19.from + 24, L19.to - 6] as const;
/** he eats it off the top of the frame (the tilt), then flicks the empty shell onto the pile on C21 */
const EAT2 = B.tilt[0] + 8, FLICK = W_DIAN21 - 9, LAND = W_DIAN21 + 2;
/** the third lychee: plucked as she starts C22, peeled under it, held up on 有荔枝吃, eaten on 吃 */
const PICK3 = L22.from + 6, PEEL3 = [L22.from + 28, L22.to - 4] as const;
/** the lie-back: the bunch set down on the bed by his hip, the shell dropped on his belly, both hands behind his head */
const SETDOWN = B.lieBack + 8, DROP = B.lieBack + 4, HANDS_UP = B.lieBack + 22;
/** he nods off during C26: the lids close from W_SHUI to its end */
const DOZE = W_SHUI;

// ------------------------------------------------------------------------------------------------------- the marks
/** the rattan bed (its origin: the middle of its top) and his seat on it: the rig sits near the head end, his back on
 *  the backrest, facing +z (toward her) */
const BED = YARD.bed;
const BS = bedSeat(BED);
const FACE = BS.facing;
const TOP = BS.seat.top;
/** a point in his seated frame: x = to his LEFT (screen right), y up from the bed top, z forward (toward her) */
const sp = (x: number, y: number, z: number) => rel(TOP, FACE, x, y, z);
/** his head centre on the bed (measured: clearance --dump, the rig sits him back against the rest; the belly's front
 *  is 0.27 m ahead of the seat point, the raised knees 0.30 ahead and 0.28 up: every hand target is in front of them) */
const HEAD = sp(0, 0.734, 0.09);
/** his hands at rest on his lap (just in front of the belly, over the knees); the left holds the bunch up by his left
 *  knee (it hangs 0.16 m below the hand, outside the knee); peeling = the right hand alone at his belly ("one-handed") */
const LAP_R = sp(-0.14, 0.31, 0.37), KNEE_L = sp(0.31, 0.37, 0.36);
const PEEL_R = (f: number) => sp(-0.03, 0.38 + 0.007 * Math.sin(f * 1.3), 0.4);
/** the bunch lifted to his belly for the right hand to pluck from; the bunch set down on the bed by his left hip */
const BUNCH_UP = sp(0.04, 0.46, 0.47), BUNCH_DOWN = sp(0.33, 0.165, 0.25);
/** the cluster of a bunch held at h (lycheeBunch: the fruit hang 0.1 m under the stem's top) */
const cluster = (h: THREE.Vector3) => h.clone().add(V(0.01, -0.095, 0.015));
/** his lychees and shells are drawn a third larger than life: at 2 m a 4 cm fruit is a few pixels on a phone */
const BIG = 1.35;
/** where the shells end: the top of the pile at the bed's foot (yard param shells 1) and his belly */
const PILE_TOP = V(YARD.shells.x - 0.02, 0.445, YARD.shells.z - 0.04);
const BELLY = sp(0.13, 0.24, 0.27);

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
/** THE PILE STAYS HIDDEN until the tilt: it lies across the bed's foot (yard.shells: 0.92 m across, 0.42 high), so
 *  every framing of him before the tilt stands within 2.2 m of his head (the pile then sits under the frame's bottom)
 *  or well off to his left side (the pile outside the frame's left edge): measured with the probe for every key.
 *  The talking framing: her eyes 2.2 m from him, off to his left (screen right of him) by 0.85 m, beside the pile; his
 *  eyes in the upper third, his head a third of the frame wide */
const TALK = aim([HEAD.x + 0.85, EYE, HEAD.z + 2.03], HEAD, 520, 585);
/** C pre: from the yard's side (the house side of the bed), the tree heavy with fruit behind him; she walks in to TALK */
const START = aim([HEAD.x + 1.45, EYE, HEAD.z + 1.85], HEAD, 560, 1010);
/** THE TILT DOWN, stepping back along the pile's right side (a comic pull-back reveal): the mountain of shells big in
 *  the middle of the frame (its top above the caption band, where the flicked shell lands), his smug face peeking in at
 *  the upper right */
const TILT = aim([HEAD.x + 0.65, EYE, HEAD.z + 3.34], V(YARD.shells.x - 0.05, 0.2, YARD.shells.z - 0.1), 470, 1150);
/** he lies back: his head a touch lower in the frame */
const TALK2 = aim(TALK.pos, HEAD, 520, 600);
/** C25: a slow push in on the recital */
const CLOSE = aim([HEAD.x + 0.66, EYE, HEAD.z + 1.62], HEAD, 525, 600);
/** the end: drifted back and over, so he lies in the right half (card 2 on the left, his face above its top) */
const CARD_IN = aim([HEAD.x + 1.42, EYE, HEAD.z + 3.05], HEAD, 880, 535);
/** ...and still easing back under the card (both framings keep him right of its edge, x 760) */
const END = aim([HEAD.x + 1.5, EYE, HEAD.z + 3.2], HEAD, 885, 530);
const key = (f: number, k: K, ease?: (x: number) => number): C.CamKey => ({ f, pos: k.pos, look: k.look, fov: C.FOV, ease });
const KEYS: C.CamKey[] = [
  key(S.from, START),
  key(ARRIVE, TALK, easeOutCubic),
  key(B.tilt[0], TALK),
  key(B.tilt[0] + 26, TILT),
  key(B.micBack - 6, TILT),
  key(B.micBack + 22, TALK),
  key(B.lieBack + 4, TALK),
  key(B.lieBack + 30, TALK2),
  key(L25.from - 4, TALK2),
  key(L25.to, CLOSE, (x) => x),
  key(B.snore[0] + 6, CLOSE),
  key(B.card[0] - 2, CARD_IN, easeInOutCubic),
  key(S.to, END, (x) => x),
];
/** her camera on frame f (pure): the keys and a gentle handheld (walking in at the start); nearly still while he
 *  dozes */
export const camC = (f: number): CamPose => C.povCam(f, KEYS, {
  mood: [[S.from, "calm"], [B.snore[0], "still"]],
  walk: [[S.from, 1], [ARRIVE - 12, 0.8], [ARRIVE, 0]],
  amp: 0.8, seed: 3,
});
/** the catch: where the lychee meets her hand (lower right of the frame, half a metre from her lens, on the camera of
 *  the catch frame) */
const CATCH_AT = (() => {
  const c = camC(B.catch), p = V(...(c.pos as Vec3)), A = C.camAxes(c), tan = Math.tan((c.fov * Math.PI) / 360), d = 0.5;
  return p.addScaledVector(A.fwd, d).addScaledVector(A.right, 0.42 * d * tan * (9 / 16)).addScaledVector(A.up, -0.45 * d * tan);
})();

// ------------------------------------------------------------------------------------------------------- his hands
/** the left hand (arm 1) holds the bunch: up by the knee; lifted to his belly for each pluck; out to the yard on C23's
 *  一辈子 (he waves the bunch at it all); set down on the bed by his hip as he lies back */
const handL = (f: number): THREE.Vector3 => {
  for (const pk of [PICK2, PICK3]) if (f >= pk - 8 && f < pk + 22) return path(f, [[pk - 8, KNEE_L], [pk, BUNCH_UP], [pk + 10, BUNCH_UP], [pk + 22, KNEE_L]]);
  if (f >= W_ZAI - 6 && f < B.lieBack) return path(f, [[W_ZAI - 6, KNEE_L], [W_BEIZI - 4, sp(0.4, 0.56, 0.38)], [L23.to - 8, sp(0.38, 0.53, 0.38)], [B.lieBack - 1, KNEE_L]]);
  if (f >= B.lieBack) return path(f, [[B.lieBack, KNEE_L], [SETDOWN, BUNCH_DOWN]]);
  return KNEE_L.clone();
};
/** the right hand (arm 0): peels the first lychee, the wind-up and THE TOSS; plucks the second off the bunch, peels it,
 *  raises it on 诗嘛, to his mouth, the flick of the empty shell onto the pile; the third the same; its shell dropped on
 *  his belly */
const TOSS_FROM = sp(-0.31, 0.42, 0.12), TOSS_AT = sp(-0.22, 0.54, 0.44);
const RAISE = sp(-0.25, 0.6, 0.34), MOUTH = sp(-0.06, 0.6, 0.38);
const handR = (f: number): THREE.Vector3 => {
  if (f < PICK2 - 6) return path(f, [[S.from, PEEL_R(f)], [B.toss - 6, PEEL_R(f)], [B.toss - 1, TOSS_FROM], [B.toss + 1, TOSS_AT, easeOutCubic], [B.toss + 5, TOSS_AT], [PICK2 - 6, LAP_R]]);
  const pluck = (pk: number): PathKey[] => [[pk - 6, LAP_R], [pk + 4, cluster(BUNCH_UP).add(V(-0.08, -0.01, 0.02))], [pk + 7, cluster(BUNCH_UP).add(V(-0.08, -0.01, 0.02))], [pk + 16, LAP_R]];
  if (f < PICK3 - 6) return path(f, [
    ...pluck(PICK2),
    [PEEL2[0], PEEL_R(f)], [PEEL2[1], PEEL_R(f)], [PEEL2[1] + 8, LAP_R],
    [W_SHIMA - 2, RAISE, easeOutCubic], [L20.to - 2, RAISE],
    [EAT2 - 2, MOUTH], [EAT2 + 6, MOUTH], [EAT2 + 14, sp(-0.15, 0.4, 0.38)], [FLICK - 6, sp(-0.15, 0.44, 0.3)],
    [FLICK, sp(-0.12, 0.52, 0.46), easeOutCubic], [FLICK + 10, LAP_R],
  ]);
  return path(f, [
    ...pluck(PICK3),
    [PEEL3[0], PEEL_R(f)], [PEEL3[1], PEEL_R(f)],
    [L23.from + 2, RAISE, easeOutCubic], [W_CHI - 5, RAISE], [W_CHI, MOUTH], [W_CHI + 6, MOUTH], [W_CHI + 14, LAP_R],
    [DROP - 3, LAP_R], [DROP + 2, sp(-0.05, 0.29, 0.38)],
  ]);
};
/** HANDS BEHIND HIS HEAD: tucked behind the back of his head (hidden by it: the rig never draws a hand in front of its
 *  own head), just outside its shape, so what shows is the arms going up and back, elbows out (props bedHands puts the
 *  hands beside the ears, where they read as a raised hand) */
const behindHead = (head: THREE.Vector3): [THREE.Vector3, THREE.Vector3] => {
  const h = head.clone().sub(TOP);
  return [sp(h.x - 0.26, h.y + 0.04, h.z - 0.12), sp(h.x + 0.26, h.y + 0.04, h.z - 0.12)];
};
/** the way up behind his head: out to his side first (never through the belly or the beard) */
const upTo = (from: THREE.Vector3, to: THREE.Vector3, side: number, k: number) => {
  const mid = sp(0.36 * side, 0.58, 0.22);
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
/** the eyelids: open and blinking; half shut through the recital; closing under C26; shut asleep */
const lids = (f: number) => {
  const t = f / FPS, blink = lid(t, 7, swaps(EXPR));
  if (f >= B.lieBack + 10 && f < B.bell + 8) return Math.max(blink, ky(f, [[B.lieBack + 10, 0], [B.lieBack + 22, 0.85]]));
  if (f >= L25.from - 8 && f < L26.from) return Math.max(blink, 0.5);
  if (f >= L26.from) return Math.max(blink, ky(f, [[L26.from, 0.5], [DOZE + 14, 1]]));
  return blink;
};
/** the head layer: tilts and nods that land on the words (and the metre of the recital) */
const headAt = (f: number) => {
  const tilt = ky(f, [[B.wink - 4, 0], [B.wink + 2, 7], [B.wink + WINK_N + 4, 7], [B.wink + WINK_N + 12, 0], [W_NANGUO, 0], [W_NANGUO + 10, -4], [L22.to, -4], [L23.from + 6, 0]]);
  const rock = f >= L25.from && f < L25.to + 6 ? 3.5 * Math.sin(((f - L25.from) / (W_DAOREN - L25.from)) * Math.PI * 2) : 0;
  const nodOff = f >= DOZE ? ky(f, [[DOZE, 0], [DOZE + 30, -0.12]]) : 0;
  const snore = f >= B.snore[0] ? 0.03 * Math.sin(((f - B.snore[0]) / FPS) * 2 * Math.PI * 0.2) : 0;
  return heads(
    { tilt: tilt + rock, dy: nodOff + snore },
    accent("pop", f, B.toss),
    accent("nod", f, W_SHIMA, { amp: 0.6 }),
    accent("laugh", f, B.wink + WINK_N - 2, { dur: 0.6, amp: 0.5 }),
    accent("nod", f, W_BEIZI, { amp: 0.5 }),
    accent("nod", f, W_ZHONG, { amp: 0.4 }),
  );
};
/** where he looks: at her (0), down at his peeling hands, out at the valley on 难过 */
const gazeAt = (f: number) => (f >= W_NANGUO + 6 && f < L22.to ? -0.5 : f >= PEEL2[0] && f < PEEL2[1] - 20 ? 0 : 0);
const lookDownAt = (f: number) => ky(f, [[PEEL2[0] - 6, 0], [PEEL2[0] + 4, 10], [PEEL2[1] - 4, 10], [PEEL2[1] + 4, 0],
  [PEEL3[0] - 6, 0], [PEEL3[0] + 4, 9], [PEEL3[1] - 4, 9], [PEEL3[1] + 4, 0], [B.lieBack + 4, 0], [B.lieBack + 20, -4], [DOZE, -4], [DOZE + 30, 6]]);

// ------------------------------------------------------------------------------------------------------- him
const suState = (f: number): St => {
  const t = f / FPS, asleep = f >= B.snore[0];
  const sp_ = says("su", ["C20", "C23", "C25"], f, 1);
  return {
    at: BS.at, facing: FACE, seat: BS.seat,
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
/** the bed, the bunch (in his left hand, then on the bed), the lychees (the tossed one: in his right hand, then in the
 *  air; the second and third in his right hand) and the shells (the flicked one on the pile, the one on his belly) */
const props = (w: World, f: number, r: Rig, palm: THREE.Vector3 | null) => {
  w.prop("rattanBed").put(BED);
  if (f < SETDOWN) w.prop("lycheeBunch").put(r.handWorld(1), { grip: "hook" });
  else w.prop("lycheeBunch").put(BUNCH_DOWN, { rot: 0.4 });
  // the tossed lychee: in his hand, then flying to her palm (the last frames bend onto where her hand holds it)
  if (f < B.toss) w.prop("lychee", "toss").put(r.handWorld(0), { grip: "hilt", peeled: 0, scale: BIG });
  else if (f < B.catch - 1) {
    const u = (f - B.toss) / (B.catch - B.toss), p = hopArc(TOSS_AT, CATCH_AT, u, 0.3);
    if (palm) p.lerp(palm, smooth(clamp01((f - (B.catch - 3)) / 3)));
    w.prop("lychee", "toss").put(p, { rot: [u * 9, u * 4, 0], scale: lerp(BIG, 1, u) });
  }
  // the second lychee: in his right hand from the pluck; peeled under C19; eaten off the frame's top: the shell is left
  if (f >= PICK2 + 10 && f < EAT2 + 4) w.prop("lychee", "two").put(r.handWorld(0), { grip: "hilt", scale: BIG, peeled: smooth(clamp01((f - PEEL2[0]) / (PEEL2[1] - PEEL2[0]))) });
  if (f >= EAT2 + 4 && f < FLICK) w.prop("shell", "two").put(r.handWorld(0).add(V(0, 0.028, 0)), { rot: [-0.4, 0, 0.2], scale: BIG });
  if (f >= FLICK) {
    const u = clamp01((f - FLICK) / (LAND - FLICK)), p = hopArc(sp(-0.12, 0.54, 0.48), PILE_TOP, u, 0.28);
    w.prop("shell", "two").put(p, { rot: [lerp(-0.4, 0.1, u) + 6.28 * u, 0, 0.2], scale: BIG });
  }
  // the third: plucked under C22, peeled, held up on 有荔枝吃, eaten on 吃; its shell dropped on his belly
  if (f >= PICK3 + 10 && f < W_CHI + 2) w.prop("lychee", "three").put(r.handWorld(0), { grip: "hilt", scale: BIG, peeled: smooth(clamp01((f - PEEL3[0]) / (PEEL3[1] - PEEL3[0]))) });
  if (f >= W_CHI + 2 && f < DROP + 2) w.prop("shell", "three").put(r.handWorld(0).add(V(0, 0.028, 0)), { rot: [-0.4, 0, 0.2], scale: BIG });
  if (f >= DROP + 2) {
    const breath = f >= B.snore[0] ? 0.008 * Math.sin(((f - B.snore[0]) / FPS) * 2 * Math.PI * 0.2) : 0;
    w.prop("shell", "three").put(BELLY.clone().add(V(0, breath + 0.05 * (1 - smooth(clamp01((f - DROP - 2) / 5))), 0)), { rot: [-0.5, 0, 0.2], scale: BIG });
  }
};

// ------------------------------------------------------------------------------------------------------- her
const HAND_KEYS: [number, HandO["mode"], number?][] = [[B.catch - 6, "catch", 6], [B.catch + 1, "hold", 12], [B.tilt[0] - 6, "off", 12]];
const MIC_KEYS: [number, MicO["mode"], number?][] = [
  [L19.from - 2, "in", 10], [B.aside, "lens", 10], [B.micBack, "toward", 12], [L26.from - 8, "lens", 10], [L26.to + 6, "off", 14],
];
// her.ts holds the caught lychee (palm at NDC y -0.62) and points the mic (head at -0.6) inside the caption band
// (y 1190-1498): here both go lower on screen, in camera space, by NDC units (see requests.md, WP5 segC -> WP3)
const MIC_DROP: Record<MicO["mode"], number> = { in: 0.16, toward: 0.16, lens: 0.08, low: 0, off: 0.16 };
const handDrop = (f: number) => 0.26 * smooth(clamp01((f - (B.catch + 1)) / 12));
const micDrop = (m: { mode: MicO["mode"]; from: MicO["mode"]; k: number }) => lerp(MIC_DROP[m.from], MIC_DROP[m.mode], smooth(m.k));
const lower = (w: World, cam: CamPose, name: "herHand" | "herMic", ndc: number) => {
  const g = w.prop(name).group;
  if (ndc <= 0 || !g.visible) return null;
  const A = C.camAxes(cam), d = g.position.clone().sub(A.p).dot(A.fwd);
  const sh = A.up.multiplyScalar(-ndc * d * Math.tan(((cam.fov ?? C.FOV) * Math.PI) / 360));
  g.position.add(sh);
  return sh;
};

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
    setSeat(su, BS.seat, FACE);
    const st = suState(f);
    const hR = handR(f), hL = handL(f);
    su.set({ ...st, hands: [hR, hL], armFront: [armFrontR(f) ? true : undefined, armFrontL(f) ? true : undefined] });
    w.update();
    // the lie-back: both hands go up behind his head (two passes: bedHands reads the head of this very frame), out
    // to his sides first; the right one first leaves the empty shell on his belly, the left the bunch on the bed
    const kL = ky(f, [[SETDOWN + 2, 0], [HANDS_UP, 1]]), kR = ky(f, [[DROP + 4, 0], [HANDS_UP + 4, 1]]);
    if (kL > 0 || kR > 0) {
      const [bR, bL] = behindHead(su.headWorld());
      su.set({ hands: [upTo(hR, bR, -1, kR), upTo(hL, bL, 1, kL)] });
      w.update();
    }
    // her hand and the mic (the mic points at his mouth, kept under his face)
    const head = su.headWorld(), mouth = head.clone().add(V(0, -0.1, 0.18));
    const hk = herKeys(f, HAND_KEYS), mk = herKeys(f, MIC_KEYS);
    const out = putHer(w, cam, f, {
      hand: { ...hk, at: CATCH_AT, item: f >= B.catch - 1 ? "lychee" : undefined, curl: f < B.catch - 1 ? 0.12 : undefined },
      mic: { ...mk, aim: mouth, avoid: [head] },
    });
    lower(w, cam, "herMic", micDrop(mk));
    const sh = lower(w, cam, "herHand", handDrop(f)), palm = out.hand?.item ?? null;
    if (palm && sh) palm.add(sh);
    props(w, f, su, palm);
    return { camera: cam, overlays: frag(transitionAt(f)?.node ?? null), slate: `C ${f < L19.from ? "tree" : f < L20.from ? "ask" : f < B.tilt[0] ? "wink" : f < B.micBack + 16 ? "shells" : f < B.lieBack ? "sincere" : f < L26.from ? "recite" : "snore"}` };
  },
};

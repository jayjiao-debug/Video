// SEGMENT B, lines B06-B18: 上午, the yard on 白鹤峰 + the 黄州 flashback. WP5 segB. PLAN.md 8B, beats.ts BEAT.B.
// One handheld take in her eyes, three cuts (the whip down to the dog, the whip into the flashback, the ink dissolve back):
//   land     B pre     A's whip lands in the yard (its arriving half, 4 frames): the new house and its board 「德有邻堂」,
//                      SU squatting at the clay stove stirring the pot with the long chopsticks, the kids chasing round
//                      the yard, the dog lying in the sun in front; he looks up at her: happy. She walks in to the stove.
//   steps    B06       one action per phrase (capWord): 煮熟 the bone comes up out of the pot on the chopsticks /
//                      泡酒 dipped in the wine bowl / 撒盐 a pinch of salt from his left hand / 烤到微焦 laid on the grill;
//                      on 微焦 he picks up the bone that is already done (kept warm on the stove top behind the pot).
//   offer    B07       he rises and holds it out to her on the chopsticks, across the stove; HER HAND reaches into the
//                      frame and takes it on 慢慢剔 (reach -> the fingers close -> the bone is hers: she gnaws it, "eat");
//                      blissful; he fishes his own bone out of the pot, hands it to his left hand and on 螃蟹 picks at it
//                      with the chopsticks like crab meat; the chopsticks then rest low in his right hand.
//   gnaw     B08       she asks with her mouth full (hand "eat", the mic toward him); he gnaws his bone, listening.
//   clean    B09       he pulls it away from his mouth: picked spotless white; he looks at it, deadpan, mock-sorry, then
//                      at her (狗都不高兴), and flicks it down to the dog (one spin in the air).
//   dog      B09 after THE WHIP DOWN (4 frames out, 4 in, a vertical smear) to her camera 0.55 m over the ground: the
//                      white bone lands at the forepaws of the yard dog begging by the stove; it sniffs it, then looks up
//                      at him, betrayed (head tilt, ears back), her lens tilting up with it.
//   aside    B10       her aside (PLAN 11.3: no mic): her lens, still low on the dog, leans in a little to the viewer
//                      (a small turn, a tilt, a push), she laughs (a shake of laughter); the camera rises back to her
//                      eye height on him (he is laughing, gnawing a new bone).
//   house    B11       beaming; on 房子 he waves the bone at the house and the camera pans with it to the house: the
//                      lantern hung and lit, MAI on the ladder; on 一家人 MAI turns round on the ladder and waves back, a
//                      kid runs through; on 团聚 the pan comes back to him, hand on his belly, warm. The dog stands by,
//                      watching the bone.
//   count    B12-B14   she asks; he counts on his raised fingers (黄州 / 惠州), cheerful; a light shrug, writing in the
//                      air (写诗), deadpan on 四个多月, a laugh on 牢; a small slow push.
//   黄州     B15-B17   THE WHIP RIGHT into the flashback (beats placeAt / vignetteAt): the ink-scroll hillside, SU behind
//                      the plough walking his furrow, a slow lateral drift (B15, his voice over: no lip-sync); the pot
//                      on the little fire at night, steam, the slow push (B16); the lid lifts: the glossy red pork (B16's
//                      after) and she exclaims over it (B17; no mic in the painting).
//   yard     B18       the ink dissolve back (hud TRANSITIONS) on B18's first word: SU at the stove, amused, correcting
//                      her, gnawing his bone; on 那块坡 a thumb jabbed back over his shoulder, far away. The hard cut to C.
// Every frame from beats.ts (BEAT.B), lineId / capWord / SEGMENTS; every mark from layout/yard.ts and huangzhou.ts (his
// working points are derived from YARD.suSquat and the stove's stovePoint); props pinned after w.update().
// THE PROPS AND HANDS (the rig's arms are short, 0.42 m: nothing on the stove top is in reach of a hand, so every bone
// on the stove travels on the long chopsticks, riding ON TOP of both tips): boneA (the one he demonstrates: pot, wine,
// salt, grill) stays on the grill; boneB (done, golden, on the stove top) is the one he serves her; boneD (his own, out
// of the pot) is gnawed clean and flicked to the dog (then the dog's white bone); boneE (his next one) is in his left
// hand from the dog cutaway on. The chopsticks lie on the stove top behind the pot from the dog cutaway (put down while
// her lens is on the dog). MAI holds the carried lantern up toward the hook until BEAT.B.hang[1] (a frame her lens is on
// SU), then the set's own lantern hangs there, lit.
// MEASURED WORKAROUNDS (clearance --seg B): SU's idle hand hangs 0.265 m out (suRest, not common.ts hang: his robe is
// wider); the stool / bench are put 1.3 / 1.5 cm low (their feet float); the dog's height per pose (DOG_Y); MAI 4.5 cm
// back from YARD.mai (his robe touched the ladder); arms in front of the long beard are drawn over the head (armFront).
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, hash, h, type Pose, type Segment, type CamPose, type Vec3, type PostPose } from "../story";
import { BEAT, vignetteAt } from "../beats";
import * as C from "../cam";
import { SU, MAI, KID, KID2 } from "../people";
import { YARD, HUANGZHOU, HUANGZHOU_CAMS, EYE, FOV, SU_HEAD } from "../layout";
import { stovePoint, ladderRot, ploughFor, GRILL, STOOL, WINE_BOWL, CHOPSTICKS, STOVE as STOVE_DIM } from "../props";
import { putHer, herKeys, type HandO, type MicO, type MicMode } from "../her";
import { transitionAt } from "../hud";
import type { World } from "../world";
import { V, rel, yawTo, says, accent, heads, at, ky, walkAlong, walkTime, frag, lid, swaps, alive, type Rig, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[1], B = BEAT.B, A = BEAT.A;
const ln = (id: string) => lineId(id);
const word = (id: string, w: string) => capWord(id, w).from;
const PI = Math.PI, RAD = PI / 180;
/** step keys eased over `len` frames after each key (a head tilt that settles, not one that snaps) */
const eased = (f: number, keys: [number, number][], len = 8) => {
  let i = -1; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  if (i < 0) return keys[0][1];
  const prev = i > 0 ? keys[i - 1][1] : keys[i][1];
  return lerp(prev, keys[i][1], smooth(clamp01((f - keys[i][0]) / len)));
};

// ------------------------------------------------------------------------------------------------------- the beats
const L06 = ln("B06"), L07 = ln("B07"), L08 = ln("B08"), L09 = ln("B09"), L10 = ln("B10"), L11 = ln("B11"), L12 = ln("B12");
const L13 = ln("B13"), L14 = ln("B14"), L16 = ln("B16"), L17 = ln("B17"), L18 = ln("B18");
const [ZHU, PAO, SA, KAO] = B.steps;
const W_WEIJIAO = word("B06", "微焦"), W_KEN = word("B07", "能啃"), W_YITIAN = word("B07", "一整天");
const W_GOU8 = word("B08", "狗"), W_GOU9 = word("B09", "狗"), W_BUGAO = word("B09", "不高兴");
const W_FANGZI = word("B11", "房子"), W_JIA = word("B11", "一家人"), W_TUAN = word("B11", "团聚");
const W_HUIZ = word("B13", "惠州"), W_SHI = word("B14", "写诗"), W_LAO = word("B14", "牢"), W_ZUO = word("B14", "四个多月");
const W_HZ18 = word("B18", "黄州"), W_ZHONG = word("B18", "种地");
/** he rises from the squat (after 微焦, as he lifts the done bone off the grill) */
const RISE0 = W_WEIJIAO + 8, RISE1 = B.take - 2;
/** the serve: the bone held out on the chopsticks; her hand reaches, the fingers close (the bone is hers on GRAB + 3) */
const OUT = B.take - 2, REACH = B.take - 6, GRAB = B.take + 8, MINE = GRAB + 3, TO_EAT = GRAB + 6;
/** his own bone (boneD): out of the pot on the chopsticks, into his left hand, the crab, the chopsticks into the pot */
const PICK_D = W_KEN + 6, HANDOFF = B.crab - 12, CHOP_POT = L07.to + 2;
/** B08 he gnaws; the pull-away (the bone comes away CLEAN); the flick to the dog */
const GNAW0 = L08.from - 2, PULL = L09.from - 4, CLEAN = L09.from - 2, FLICK = B.dog[0] - 10, LET_GO = B.dog[0] - 8;
/** the whip down to the dog: the cut (its arriving half's first frame); the dog sniffs, looks up (betrayed) */
const DOG_CUT = B.dog[0], SNIFF = B.dog[0] + 2, BETRAY = B.dog[0] + 20;
/** B10: her aside (the mic to the lens from B.aside), the rise back to her eye height, his new bone (boneE, off screen) */
const RISE_CAM0 = B.rise - 7, RISE_CAM1 = L11.from - 3, BONE_E = B.dog[0] + 40;
/** B11's pan: out to the house with the wave (房子), MAI waves back (一家人), back to him (团聚) */
const PAN0 = W_FANGZI - 10, PAN1 = W_JIA - 2, PAN2 = W_TUAN - 18, PAN3 = W_TUAN + 10;
/** the lantern: carried by MAI until this frame (her lens is on SU), then the set's hangs at YARD.lantern, lit */
const HUNG = B.hang[1];
/** the whip right into the flashback (its leaving half: the last 4 yard frames) and the lid */
const WHIP_HZ = B.flashIn - 4, LID0 = B.lid, LID1 = B.lid + 20;

// ------------------------------------------------------------------------------------------------------- the marks
/** his mark behind the stove (he squats there for B06, then stands there for the rest) */
const SQ = YARD.suSquat;
/** her eyes for the talking shots (and so his facing: toward her) */
const TALK_POS = V(SQ.x + 0.2, EYE, SQ.z + 1.9);
const FACE = yawTo(SQ, TALK_POS);
/** a point in his frame: x to his LEFT, y up from the floor, z forward (toward her) */
const loc = (x: number, y: number, z: number) => rel(SQ, FACE, x, y, z);
/** a direction in his frame -> the world (unit) */
const dirL = (x: number, y: number, z: number) => rel(V(), FACE, x, y, z).normalize();
/** the squat: the figure sinks DROP (the films' kneel sink; the stove hides his legs) */
const DROP = 0.24;
const sinkK = (f: number) => 1 - smooth(clamp01((f - RISE0) / (RISE1 - RISE0)));
const suAt = (f: number) => V(SQ.x, -DROP * sinkK(f), SQ.z);
/** his head's middle (the rig's head ball, his scale): squatting / standing */
const HEAD_SQ = V(SQ.x, SU_HEAD - DROP, SQ.z), HEAD_UP = V(SQ.x, SU_HEAD, SQ.z);
const headAt = (f: number) => V(SQ.x, SU_HEAD - DROP * sinkK(f), SQ.z);
/** the stove, its pot (the broth's middle) and its grill (the grill's feet; its bars' top) */
const STOVE_AT = YARD.stove, POT = stovePoint(STOVE_AT, 0, "pot"), GRILL_AT = stovePoint(STOVE_AT, 0, "grill");
const GRILL_TOP = GRILL_AT.y + GRILL.top, BONE_R = 0.016;
/** where the bones lie: boneB (done, golden: the one he serves) kept warm on the stove top behind the gap between the
 *  pot and the grill, along the stove (the chopsticks reach it from his right without passing over anything); boneA
 *  (the one he demonstrates) is laid in the grill's middle (the grill is on his left: its right half is what his right
 *  hand reaches) and stays there */
const SLOT = { B: V(STOVE_AT.x + 0.01, STOVE_DIM.top - 0.005 + 0.0285, STOVE_AT.z - 0.12), A: V(GRILL_AT.x - 0.07, GRILL_TOP + BONE_R, GRILL_AT.z) };
/** the stool with the wine bowl and its salt dish at his right */
/** (the stool's and the bench's feet stop 1.3 / 1.5 cm over their origin: both are put that much lower, so they stand) */
const STOOL_SINK = 0.013, BENCH_SINK = 0.015;
const STOOL_AT = V(YARD.wine.x, -STOOL_SINK, YARD.wine.z), BOWL_AT = V(YARD.wine.x + 0.05, STOOL.top - STOOL_SINK, YARD.wine.z);
/** the dip: the bone (on the tips) laid across the bowl's mouth, just over its rim (it is wider than the bowl) */
const WINE_IN = BOWL_AT.clone().add(V(0, WINE_BOWL.h + 0.012, 0));

// --------------------------------------------------------------------------------------------- the dog, MAI, kids
/** where the dog sits begging, at the stove's right end by his left side, and her low lens in front of it */
const DOG_SIT = loc(0.84, 0, 0.3);
/** (QA1: 1.0 -> 1.4 m back: from 1 m the whole dog took half the frame's height and its look-up put its head under the REC
 *  timestamp; from here it sits between the top rows and the caption band) */
const DOG_CAM_POS = V(DOG_SIT.x - 0.42, 0.55, DOG_SIT.z + 1.34);
const DOG_ROT = yawTo(DOG_SIT, DOG_CAM_POS);
/** the white bone just in front of its forepaws, under its nose when it sniffs (where the flick lands) */
const DOG_BONE = DOG_SIT.clone().add(V(Math.sin(DOG_ROT), 0, Math.cos(DOG_ROT)).multiplyScalar(0.27)).setY(0.0285);
/** its walk over from the bench (a little after the serve, mostly out of her frame) */
/** where it lies in the sun at the landing (in front of the stove, her landing frame's lower right), and its walk over
 *  to beg when the salted bone goes on the grill (her lens is on the stove: it walks in from the right) */
const DOG_LIE = loc(1.2, 0, 2.3), DOG_LIE_ROT = FACE - PI / 2 - 0.25;
const DOG_WALK0 = PAO + 20, DOG_V = 0.8;
const DOG_PATH = [DOG_LIE, DOG_SIT];
const MAI_FACE = PI;
/** MAI on his rung, 4.5 cm back from the layout's mark (his robe touched the leaning ladder's rails) */
const MAI_AT = YARD.mai.clone().add(V(0, 0, 0.045));
/** MAI's left hand holds the lantern up toward the hook (as far as his short arm goes) */
const MAI_SH = rel(MAI_AT, MAI_FACE, 0.2, 0.95, 0.08);
const LAN_HOLD = MAI_SH.clone().add(V(-0.22, 0.17, -0.15));
/** the kids' chase loop: YARD.kids moved 1.0 m right and 0.3 m back (QA1: on YARD.kids itself the kid running through
 *  B11's house pan passed 1.5-2 m from her lens and its face fell into the caption band; from here it runs past 3 m
 *  away, face above the band, still clear of the ladder, the bench, the dog and the stove) */
const KIDS_PATH = YARD.kids.map((p) => V(p.x + 1.0, p.y, p.z - 0.3));
const KID_SPEED = 1.8, LOOP_T = walkTime(KIDS_PATH, KID_SPEED);
const kidLeg = (f: number, k: number) => walkAlong(KIDS_PATH, KID_SPEED, (((f / FPS - 0.55 * k) % LOOP_T) + LOOP_T) % LOOP_T + 1e-3);

// ------------------------------------------------------------------------------------------------------- the cameras
const key = (f: number, c: CamPose, ease?: (x: number) => number): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov, ease });
/** a camera at `pos` turned so that the world point `tgt` lands on screen (sx, sy) (px of 1080 x 1920) */
const aim = (pos: THREE.Vector3, tgt: THREE.Vector3, sy: number, sx = 540, fov = FOV): CamPose => {
  const d = tgt.clone().sub(pos), hz = Math.hypot(d.x, d.z);
  const tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  const pitch = Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), yaw = Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th);
  const look = pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov };
};
/** the whip lands: SU squatting at the stove (left third), the house's board 「德有邻堂」 whole over his shoulder (upper
 *  right), the dog lying in the sun (lower right); she walks straight in from here (5 m) to STOVE by 撒盐 */
const LAND = aim(loc(1.2, EYE, 4.8), HEAD_SQ, 690, 330);
/** B06: the stove and his hands at work (the four actions read above the caption band) */
const STOVE = aim(loc(-0.1, EYE, 2.4), HEAD_SQ, 520, 650);
/** B07: she steps in, a little to his right, so the bone he serves on the chopsticks shows in the lower right quarter
 *  (where her taking hand reaches: her.ts) above the caption band */
const OFFER = aim(loc(-0.45, EYE, 1.65), HEAD_UP, 500, 430);
/** B08-B09 and B11-B14, B18: talking, his head about 40 % of the width */
const TALK = aim(TALK_POS, HEAD_UP, 595, 500);   // (QA1: sy +35..40 on the talk framings: his hat clear of the REC timestamp)
const TALK_B = aim(TALK_POS.clone().add(V(0.05, 0, 0.1)), HEAD_UP, 605, 520);
const TALK_IN = aim(loc(0.18, EYE, 1.62), HEAD_UP, 585, 510);
const TALK_18 = aim(loc(0.26, EYE, 1.85), HEAD_UP, 600, 505);
/** B11's pan: from his place, the house: the lantern (left) and MAI on the ladder (right), the kids below */
const HOUSE = aim(TALK_POS.clone().add(V(0.05, 0, 0.1)), V((YARD.lantern.x + MAI_AT.x) / 2 + 0.1, 1.75, (YARD.lantern.z + MAI_AT.z) / 2), 660, 540);   // (QA1: 700 -> 660: the running kid's face above the caption band)
/** the dog: her lens 0.55 m over the ground; its sniffing head over the bone in the upper middle (its betrayed look up
 *  higher still, the bone at its paws above the caption band) */
const DOG_HEAD = DOG_SIT.clone().add(V(0, 0.2, 0)).lerp(DOG_CAM_POS.clone().setY(0.2), 0.12);
const DOG_CAM = aim(DOG_CAM_POS, DOG_HEAD, 700, 560);
/** ... and tilted up with it when it looks up at him (betrayed) */
const DOG_CAM_UP = aim(DOG_CAM_POS, DOG_SIT.clone().add(V(0, 0.42, 0)), 640, 560);

const K1: C.CamKey[] = [
  key(S.from, LAND),
  key(SA - 4, STOVE),
  key(RISE0, STOVE),
  key(OUT + 2, OFFER),
  key(TO_EAT + 14, OFFER),
  key(B.crab - 6, TALK),
  key(L09.from, TALK),
  key(W_BUGAO, TALK_B),
];
const K2: C.CamKey[] = [
  key(RISE_CAM0, DOG_CAM_UP),
  key(RISE_CAM1, TALK_B),
  key(PAN0, TALK_B),
  key(PAN1, HOUSE),
  key(PAN2, HOUSE),
  key(PAN3, TALK_B),
  key(L13.from, TALK),
  key(L14.from + 10, TALK),
  key(L14.to, TALK_IN),
];
const K18: C.CamKey[] = [key(B.flashOut, TALK_18), key(S.to, aim(loc(0.24, EYE, 1.7), HEAD_UP, 595, 505))];
const MOOD: [number, C.Mood][] = [[S.from, "excited"], [SA - 4, "calm"], [B.aside, "excited"], [L11.from, "calm"]];
const WALK: [number, number][] = [[S.from, 0.8], [SA - 8, 0.8], [SA - 2, 0], [RISE0 - 2, 0], [RISE0 + 2, 0.6], [OUT, 0.5], [OUT + 4, 0], [S.to, 0]];
/** her yard camera (no whips): the keys + the handheld; the dog shot; her laugh */
const yardCam = (f: number): CamPose => {
  let c: CamPose;
  if (f < DOG_CUT) c = C.keyCam(f, K1);
  else if (f < RISE_CAM0) c = C.keyCam(f, [key(DOG_CUT, DOG_CAM), key(BETRAY + 2, DOG_CAM), key(BETRAY + 14, DOG_CAM_UP)]);
  else if (f < B.flashIn) c = C.keyCam(f, K2);
  else c = C.keyCam(f, K18);
  c = C.handheld(c, f, { mood: MOOD, walk: WALK, amp: f >= DOG_CUT && f < RISE_CAM0 ? 0.55 : 0.85, seed: 2 });
  // her laugh (B10): a shake of laughter, a few bounces, dying away
  const lk = ky(f, [[L10.from - 2, 0], [L10.from + 6, 1], [L10.to - 10, 0.8], [L10.to + 14, 0]]);
  if (lk > 0.001) { const t = f / FPS; c = C.nudge(c, { up: 0.006 * lk * Math.abs(Math.sin(2 * PI * 2.6 * t)), pitch: 0.8 * lk * Math.sin(2 * PI * 2.6 * t + 0.5), roll: 0.9 * lk * Math.sin(2 * PI * 1.3 * t) }); }
  // her bites (B07-B08): a small nod of her camera as the bone comes up to her mouth
  const bk = biteK(f);
  if (bk > 0.001) c = C.nudge(c, { pitch: -2.2 * bk, up: -0.008 * bk });
  // B10 is an ASIDE (PLAN 11.3: no mic): her lens is already off him (on the betrayed dog); she leans in a little to the
  // viewer (a small turn, a tilt, a push) for the line and comes out of it as she rises back to him
  const ak = easeInOutCubic(clamp01((f - (L10.from - 8)) / 10)) * (1 - easeInOutCubic(clamp01((f - (RISE_CAM0 - 2)) / 12)));
  if (ak > 0.001) c = C.nudge(c, { yaw: 6 * ak, pitch: 1 * ak, roll: 2.5 * ak, fwd: 0.05 * ak });
  return c;
};
/** her camera in the flashback: the slope's lateral drift, then the pot's slow push, the lid, the pork */
const hzCam = (f: number): CamPose => {
  const k = (c: CamPose | { pos: Vec3; look: Vec3; fov: number }, g: number, e?: (x: number) => number) => key(g, c as CamPose, e);
  if (vignetteAt(f) === "slope") return C.povCam(f, [k(HUANGZHOU_CAMS.slope, B.flashIn), k(HUANGZHOU_CAMS.slopeEnd, B.pot - 1, (x) => x)], { mood: "calm", amp: 0.35, seed: 4 });
  return C.povCam(f, [k(HUANGZHOU_CAMS.pot, B.pot), k(HUANGZHOU_CAMS.potClose, L16.to, (x) => smooth(x)), k(HUANGZHOU_CAMS.lid, LID1 + 4), k(HUANGZHOU_CAMS.pork, L17.from + 4), k(HUANGZHOU_CAMS.pork, B.flashOut)], { mood: "calm", amp: 0.3, seed: 4 });
};
/** THE WHIP DOWN to the dog (a tilt: 4 frames out pitching down, 4 in arriving from above), the cut on `on` */
const whipDown = (cA: CamPose, cB: CamPose, f: number, on: number, deg = 30) => {
  if (f < on - 4 || f >= on + 4) return null;
  const leaving = f < on, u = leaving ? (f - (on - 4) + 1) / 4 : (f - on) / 4;
  const k = leaving ? easeInCubic(u) : 1 - easeOutCubic(u);
  return { cam: C.nudge(leaving ? cA : cB, { pitch: leaving ? -deg * k : deg * k }), post: { dof: { focus: 0.05, amount: 22 * k } } as PostPose, smear: k };
};
/** the whip down's smear: soft pale vertical streaks drifting down (never opaque) */
const vSmear = (k: number, seed = 5) => {
  if (k <= 0.01) return null;
  const bars: ReturnType<typeof h>[] = [];
  for (let i = 0; i < 12; i++) {
    const a = hash(i, seed), b = hash(i, seed + 1), x = ((i + 0.5) / 12) * 1080 + (a - 0.5) * 60, wd = 18 + 50 * b, len = 900 + 900 * a;
    bars.push(h("div", { key: i, style: { position: "absolute", left: x - wd / 2, top: -len * 0.3 + b * 1920 * (1 - k), width: wd, height: len, borderRadius: wd / 2, background: i % 3 === 2 ? "#d9c08a" : "#f3ead8", opacity: (0.16 + 0.2 * a) * k } }));
  }
  return h("div", { key: "vSmear", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", pointerEvents: "none" } },
    h("div", { style: { position: "absolute", inset: 0, background: "#efe6d2", opacity: 0.2 * k * k } }), ...bars);
};
/** her camera on frame f, with the whips: { camera, post, smear, vsmear } */
function camAt(f: number): { camera: CamPose; post?: PostPose; smear: number; vsmear: number } {
  if (f >= B.flashIn - 4 && f < B.flashIn + 4) { const W = C.whip(yardCam(f), f, WHIP_HZ, { dir: 1, to: hzCam(f) }); return { camera: W.cam, post: W.post, smear: W.smear, vsmear: 0 }; }
  if (f >= B.flashIn && f < B.flashOut) return { camera: hzCam(f), smear: 0, vsmear: 0 };
  const D = whipDown(yardCam(f), yardCam(f), f, DOG_CUT);
  if (D) return { camera: D.cam, post: D.post, smear: 0, vsmear: D.smear };
  const c = yardCam(f);
  const W = C.whip(c, f, A.whip, { dir: 1, to: c });
  return { camera: W.cam, post: W.post, smear: W.smear, vsmear: 0 };
}

/** her camera on frame f (for previews and checks) */
export const camB = (f: number): CamPose => camAt(f).camera;

// ---------------------------------------------------------------------------------------------- the chopsticks
/** a bone's axis in his left hand (grip hilt: the hand holds its lower end): up and a little toward her (k 0) .. across
 *  his mouth, gnawing (k 1) */
const boneUp = (k: number) => dirL(-0.35, 0.8, 0.45).multiplyScalar(1 - k).add(dirL(-0.95, 0.15, 0.1).multiplyScalar(k)).normalize();
/** the wave of B11 (房子): the bone held up and out, clear of his hat's brim */
const WAVE_UP = dirL(0.5, 0.75, 0.3);
/** the chopsticks' TIPS (world) and their direction from his hand to the tips (his frame) on key frames */
const POT_UP = POT.clone().add(V(0, 0.14, 0.04)), POT_HI = POT.clone().add(V(0, 0.1, 0)), WINE_UP = WINE_IN.clone().add(V(0, 0.15, 0.02));
/** up out of the bowl, high enough to swing over the pot's rim to the middle */
const WINE_LIFT = WINE_IN.clone().add(V(0, 0.22, 0.02));
/** the salt: the bone held up over the stove's middle (against his dark beard: it reads), the chopsticks coming in from
 *  his right (clear of the beard); the pinching hand beside the beard (his hands are dark: over the beard they vanish) */
const MID = loc(0.07, 0.85, 0.6);
const UP_A = SLOT.A.clone().add(V(0, 0.07, 0)), UP_B = SLOT.B.clone().add(V(0, 0.08, 0));
/** boneB is picked up from his right (the chopsticks across the stove top, behind the pot) */
const D_PICKB: Vec3 = [0.85, -0.35, 0.4];
/** the serve: held out across the stove from his right shoulder (the arm straight forward, clear of his beard) */
const OUT_TIP = loc(-0.03, 1.04, 0.7);
/** the chopsticks held low at his right while he talks (B07, B08-B09) */
const REST_TIP = loc(-0.2, 0.72, 0.45);
/** the handoff of his own bone to his left hand (that hand waits just under the tips; in it the bone stands just left
 *  of them) */
const HAND_TIP = loc(0.18, 0.98, 0.42), HAND_L = HAND_TIP.clone().addScaledVector(boneUp(0), -0.055).add(dirL(1, 0, 0).multiplyScalar(0.028));
/** the crab: the bone up in his left hand, the tips picking at its right side (touching, not in it) */
const CRAB_L = loc(0.18, 1.03, 0.44), CRAB_TIP = CRAB_L.clone().addScaledVector(boneUp(0), 0.055).add(dirL(-1, 0, 0).multiplyScalar(0.026));
const D_POT: Vec3 = [0.05, -0.6, 0.8], D_UP: Vec3 = [0.05, -0.32, 0.95], D_WINE: Vec3 = [-0.55, -0.6, 0.58], D_MID: Vec3 = [0.35, -0.15, 0.92];
const D_GRILL: Vec3 = [0.4, -0.3, 0.87], D_OUT: Vec3 = [0.45, -0.08, 0.89], D_REST: Vec3 = [0.15, -0.6, 0.78], D_CRAB: Vec3 = [0.97, -0.05, 0.25];
/** a direction of his frame (a Vec3 of the keys) in the world, unit */
const dirW = (d: Vec3) => dirL(d[0], d[1], d[2]);
/** where the tips go so that a bone riding on them sits at `bone` (the inverse of onTips, below) */
const TIP_BACK = 0.012, TIP_UNDER = 0.0145;
const upNormal = (dir: THREE.Vector3) => V(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
const pickTip = (bone: THREE.Vector3, d: Vec3) => { const dir = dirW(d); return bone.clone().addScaledVector(dir, TIP_BACK).addScaledVector(upNormal(dir), -TIP_UNDER); };
/** boneA laid on the grill (its tips under it on the bars), the tips slid back out from under it; boneB picked up */
const PUT_A = pickTip(SLOT.A, D_GRILL), OFF_A = PUT_A.clone().addScaledVector(dirW(D_GRILL), -0.06), PICK_B = pickTip(SLOT.B, D_PICKB);
/** boneB: the tips come over it from the grill, down beside it, and slide in under it along their own line */
const IN_B = PICK_B.clone().addScaledVector(dirW(D_PICKB), -0.05).add(V(0, 0.004, 0)), HIGH_B = IN_B.clone().add(V(0, 0.07, 0));
/** the bones' yaw on the grill: as they ride on the tips there (across the chopsticks), so they do not turn on the drop */
const YAW_GRILL = Math.atan2(dirW(D_GRILL).x, dirW(D_GRILL).z);
const YAW_PICKB = Math.atan2(dirW(D_PICKB).x, dirW(D_PICKB).z);
/** boneB lies along the stove (yaw PI/2: its length front to back) and rides on the tips at the same yaw */
const SLOT_YAW = { B: PI / 2, A: YAW_GRILL + 0.15 }, B_ON_TIPS = PI / 2 - YAW_PICKB;
type TipKey = [number, THREE.Vector3, Vec3];
const TIPS: TipKey[] = [
  [S.from, POT, D_POT], [ZHU - 3, POT, D_POT],
  [ZHU + 10, POT_UP, D_UP], [PAO + 1, POT_UP, D_UP],
  [PAO + 8, WINE_UP, D_WINE], [PAO + 12, WINE_IN, D_WINE], [SA - 6, WINE_IN, D_WINE], [SA - 2, WINE_LIFT, D_WINE],
  [SA + 4, MID, D_MID], [KAO - 1, MID, D_MID],
  [KAO + 6, UP_A, D_GRILL], [KAO + 10, PUT_A, D_GRILL], [KAO + 13, OFF_A, D_GRILL],
  [W_WEIJIAO - 3, HIGH_B, D_PICKB], [W_WEIJIAO, IN_B, D_PICKB], [W_WEIJIAO + 3, PICK_B, D_PICKB], [W_WEIJIAO + 6, PICK_B, D_PICKB],
  [RISE0 + 4, UP_B.clone().add(V(0, 0.06, 0)), D_PICKB],
  [OUT, OUT_TIP, D_OUT], [MINE + 1, OUT_TIP, D_OUT],
  [MINE + 14, REST_TIP, D_REST], [PICK_D - 6, REST_TIP, D_REST],
  [PICK_D + 2, POT_HI, D_POT], [PICK_D + 6, POT, D_POT], [PICK_D + 10, POT, D_POT], [PICK_D + 18, POT_UP, D_UP],
  [HANDOFF - 4, HAND_TIP, D_CRAB], [HANDOFF + 6, HAND_TIP, D_CRAB],
  [B.crab - 2, CRAB_TIP, D_CRAB], [CHOP_POT, CRAB_TIP, D_CRAB],
  [CHOP_POT + 12, REST_TIP, D_REST], [DOG_CUT, REST_TIP, D_REST],
];
/** the tips and the unit direction (world) on frame f, with the stirring, the crab-picking and an idle sway on top */
const chopTip = (f: number): { tip: THREE.Vector3; dir: THREE.Vector3 } => {
  let i = 0; while (i + 1 < TIPS.length && TIPS[i + 1][0] <= f) i++;
  const a = TIPS[i], b = TIPS[Math.min(i + 1, TIPS.length - 1)];
  const u = b === a || f <= a[0] ? 0 : smooth(clamp01((f - a[0]) / (b[0] - a[0])));
  const tip = a[1].clone().lerp(b[1], u);
  const d = V(...a[2]).normalize().lerp(V(...b[2]).normalize(), u).normalize();
  const t = f / FPS;
  if (f < ZHU - 3) tip.add(V(0.032 * Math.cos(2 * PI * 1.1 * t), 0, 0.032 * Math.sin(2 * PI * 1.1 * t)));
  if (f >= B.crab - 2 && f < CHOP_POT - 2) { const k = ky(f, [[B.crab - 2, 0], [B.crab + 2, 1], [CHOP_POT - 8, 1], [CHOP_POT - 2, 0]]); tip.add(dirL(...D_CRAB).multiplyScalar(-0.03 * k * Math.abs(Math.sin(2 * PI * 2.2 * t))).add(V(0, 0.012 * k * Math.sin(2 * PI * 4.4 * t), 0))); }
  if ((f >= MINE + 14 && f < PICK_D - 6) || f >= CHOP_POT + 12) tip.add(V(0.01 * Math.sin(2 * PI * 0.4 * t), 0.008 * Math.sin(2 * PI * 0.55 * t + 1), 0));
  return { tip, dir: rel(V(), FACE, d.x, d.y, d.z).normalize() };
};
const CHOP_LEN = CHOPSTICKS.len - CHOPSTICKS.grip;
/** the chopsticks' rot (Euler YXZ): their -y runs along `dir`, the two sticks side by side LEVEL (so a bone rests on both) */
const _m = new THREE.Matrix4(), _e = new THREE.Euler();
const rotChop = (dir: THREE.Vector3): Vec3 => {
  const y = dir.clone().normalize().negate(), x = V(0, 1, 0).cross(y);
  if (x.lengthSq() < 1e-6) x.set(1, 0, 0); x.normalize();
  const z = x.clone().cross(y).normalize();
  _m.makeBasis(x, y, z); _e.setFromRotationMatrix(_m, "YXZ"); return [_e.x, _e.y, _e.z];
};
/** a rot (Euler YXZ) that turns a prop's +y onto `axis` (a bone in a hand: grip hilt, the bone's length up from it) */
const _q = new THREE.Quaternion();
const rotUp = (axis: THREE.Vector3): Vec3 => { _q.setFromUnitVectors(V(0, 1, 0), axis.clone().normalize()); _e.setFromQuaternion(_q, "YXZ"); return [_e.x, _e.y, _e.z]; };
/** a bone riding on the tips: on top of both sticks, 1.2 cm back from their ends (they show under it, 2 mm into it) */
const onTips = (tip: THREE.Vector3, dir: THREE.Vector3) => tip.clone().addScaledVector(dir, -TIP_BACK).addScaledVector(upNormal(dir), TIP_UNDER);
/** the chopsticks laid down on the stove top's back strip, behind the pot (B10 on: put there while her lens is on the
 *  dog): along the stove, the tips toward the grill */
const CHOP_REST = V(STOVE_AT.x - 0.27, STOVE_DIM.top - 0.0005, STOVE_AT.z - 0.21), CHOP_REST_ROT = rotChop(V(1, 0, 0));

// ------------------------------------------------------------------------------------------------- his two hands
/** where SU's idle hand hangs (measured: his robe is wider than the cast's `hang`), to start a pinned gesture from */
const suRest = (f: number, arm: 0 | 1) => rel(suAt(f), FACE, arm ? 0.265 : -0.265, 0.64, 0.035);
/** a hand track: [frame, a world point | "rest"] keys, eased; "rest" = where an idle hand hangs (rest -> rest = a free hand) */
type HandKey = [number, THREE.Vector3 | "rest"];
const track = (f: number, keys: HandKey[], arm: 0 | 1): THREE.Vector3 | null => {
  const res = (k: THREE.Vector3 | "rest") => (k === "rest" ? suRest(f, arm) : k);
  let i = 0; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  const a = keys[i], b = keys[i + 1];
  if (!b || f <= a[0]) return a[1] === "rest" ? null : a[1].clone();
  if (a[1] === "rest" && b[1] === "rest") return null;
  return res(a[1]).clone().lerp(res(b[1]), smooth((f - a[0]) / (b[0] - a[0])));
};
/** his left hand (arm 1): the salt, the handoff, the crab, the gnawing, the clean bone, the flick, then boneE and the
 *  gestures of B11-B18 */
const SALT = loc(0.21, 0.98, 0.43);
const GNAW = loc(0.15, 1.2, 0.36), LOOK = loc(0.3, 1.22, 0.38), WIND = loc(0.33, 1.3, 0.3), FLING = loc(0.4, 0.82, 0.34);
const HOLD_L = loc(0.3, 0.74, 0.16), WAVE_L = loc(0.42, 1.2, 0.12), SWEEP_L = loc(0.46, 1.12, 0.22), BELLY_L = loc(0.3, 0.84, 0.17);
const SHRUG_L = loc(0.42, 0.86, 0.14), SHRUG_R = loc(-0.42, 0.86, 0.14);
const LEFT: HandKey[] = [
  [S.from, "rest"], [SA - 6, "rest"], [SA + 1, SALT], [KAO - 2, SALT], [KAO + 6, "rest"],
  [HANDOFF - 14, "rest"], [HANDOFF - 4, HAND_L], [HANDOFF + 6, HAND_L], [B.crab - 2, CRAB_L], [CHOP_POT + 2, CRAB_L],
  [GNAW0, GNAW], [PULL, GNAW], [L09.from + 4, LOOK], [FLICK - 6, LOOK], [FLICK - 1, WIND], [LET_GO + 3, FLING], [DOG_CUT + 14, "rest"],
  [BONE_E, "rest"], [BONE_E + 2, HOLD_L], [RISE_CAM0 - 10, GNAW], [L11.from + 2, GNAW], [PAN0, HOLD_L],
  [W_FANGZI - 2, WAVE_L], [W_JIA - 6, WAVE_L], [W_JIA + 6, SWEEP_L], [W_TUAN - 6, SWEEP_L], [W_TUAN + 6, BELLY_L], [L11.to + 4, BELLY_L],
  [L12.from + 4, GNAW], [L12.to - 6, GNAW], [L13.from, HOLD_L], [L14.from - 2, HOLD_L], [L14.from + 6, SHRUG_L], [L14.from + 24, SHRUG_L], [L14.from + 34, HOLD_L],
  [B.flashIn, HOLD_L],
  [B.flashOut, GNAW], [W_HZ18 - 4, GNAW], [W_ZHONG + 4, HOLD_L],
];
/** his right hand (arm 0): the chopsticks until the dog cut (the hand = tips - dir x their length); then free: the
 *  count, the shrug, the writing in the air, the thumb over his shoulder */
const COUNT = loc(-0.3, 1.18, 0.25), WRITE = loc(-0.22, 1.0, 0.34), THUMB = loc(-0.36, 1.12, 0.1);
const RIGHT: HandKey[] = [
  [DOG_CUT, "rest"],
  [B.count - 10, "rest"], [B.count - 2, COUNT], [L13.to + 2, COUNT], [L14.from - 2, "rest"], [L14.from + 6, SHRUG_R], [L14.from + 24, SHRUG_R], [L14.from + 32, "rest"],
  [W_SHI - 6, "rest"], [W_SHI + 2, WRITE], [W_SHI + 16, WRITE], [W_SHI + 26, "rest"],
  [B.flashOut, "rest"], [B.thumb - 8, "rest"], [B.thumb, THUMB], [S.to, THUMB],
];
const handsAt = (f: number): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  const t = f / FPS;
  let r: THREE.Vector3 | null;
  if (f < DOG_CUT) { const c = chopTip(f); r = c.tip.clone().addScaledVector(c.dir, -CHOP_LEN); }
  else r = track(f, RIGHT, 0);
  let l = track(f, LEFT, 1);
  if (l) {
    // the sprinkle, the gnawing, the wave of the bone, the shrug's lift
    if (f >= SA && f < KAO - 2) l.add(V(0.012 * Math.sin(2 * PI * 7 * t), 0.006 * Math.abs(Math.sin(2 * PI * 7 * t)), 0));
    const gn = (f >= GNAW0 + 4 && f < PULL) || (f >= RISE_CAM0 - 4 && f < L11.from + 2) || (f >= L12.from + 8 && f < L12.to - 6) || (f >= B.flashOut + 4 && f < W_HZ18 - 4);
    if (gn) l.add(V(0, 0.012 * Math.sin(2 * PI * 3.1 * t), 0.008 * Math.abs(Math.sin(2 * PI * 3.1 * t))));
    if (f >= W_FANGZI - 2 && f < W_JIA - 4) l.add(dirL(1, 0, 0).multiplyScalar(0.06 * Math.sin(2 * PI * 2.2 * (t - W_FANGZI / FPS))));
    if (f >= L14.from + 6 && f < L14.from + 30) l.add(V(0, 0.05 * Math.sin(PI * clamp01((f - L14.from - 6) / 20)), 0));
  }
  if (r && f >= DOG_CUT) {
    if (f >= B.count - 2 && f < L13.to) { for (const on of [B.count, W_HUIZ]) { const d = f - on; if (d >= 0 && d < 10) r.add(V(0, 0.05 * Math.sin((PI * d) / 10), 0)); } }
    if (f >= L14.from + 6 && f < L14.from + 30) r.add(V(0, 0.05 * Math.sin(PI * clamp01((f - L14.from - 6) / 20)), 0));
    if (f >= W_SHI + 2 && f < W_SHI + 16) r.add(dirL(1, 0, 0).multiplyScalar(0.035 * Math.sin(2 * PI * 3.2 * t)).add(V(0, -0.02 * ((f - W_SHI) / 14), 0)));
    // the thumb jabs back over his shoulder twice (那块坡: far away back there)
    if (f >= B.thumb && f < B.thumb + 16) r.add(dirL(0, 0.3, -1).multiplyScalar(0.035 * Math.abs(Math.sin((PI * (f - B.thumb)) / 8))));
  }
  return [r, l];
};

// --------------------------------------------------------------------------------------------------- his face
const EXPR: [number, Expr][] = [
  [S.from, "focus"], [ZHU - 14, "happy"], [ZHU, "smile"], [PAO, "happy"], [SA, "smug"], [KAO, "focus"], [W_WEIJIAO, "grin"],
  [OUT - 4, "happy"], [B.take + 4, "smile_closed"], [W_KEN, "happy"], [B.crab, "grin"], [L07.to + 4, "smile"],
  [GNAW0 + 6, "smile_closed"], [W_GOU8, "neutral"], [CLEAN, "deadpan"],
  [RISE_CAM0 - 20, "laugh"], [L11.from, "happy"], [W_FANGZI, "grin"], [W_JIA, "happy"], [W_TUAN, "smile_closed"],
  [L12.from + 6, "smile"], [L12.to - 8, "focus"], [L13.from, "happy"], [W_HUIZ, "grin"], [L14.from, "smile"], [W_SHI, "smug"], [W_ZUO, "deadpan"], [W_LAO, "smile"],
  [B.flashIn, "smile_closed"],
  [B.flashOut, "smug"], [W_HZ18, "smile"], [B.thumb, "happy"],
];
/** where his eyes and head go: down into the pot / at the bone / at her; the gaze toward what he looks at */
const LOOKDOWN: [number, number][] = [
  [S.from, 18], [ZHU - 16, 18], [ZHU - 12, 4], [ZHU + 6, 4], [ZHU + 12, 12], [SA, 6], [KAO, 16], [W_WEIJIAO, 4], [RISE0, 10], [OUT, 2],
  [L09.from, 2], [L09.from + 6, 8], [W_GOU9 - 4, 8], [W_GOU9 + 2, 2], [FLICK, 4], [LET_GO + 6, 10], [DOG_CUT + 20, 2],
  [L12.to - 10, 2], [L12.to + 2, 6], [L13.from, 2],
];
const GAZE: [number, number][] = [
  [S.from, 0], [L09.from + 4, 0.5], [W_GOU9, 0], [LET_GO, 0.5], [DOG_CUT + 16, 0],
  [W_FANGZI - 4, 0.5], [W_JIA + 8, 1], [W_TUAN - 8, 0], [L12.to - 8, -0.5], [L13.from, 0], [B.thumb - 2, -0.5], [B.thumb + 18, 0],
];

function su(w: World, f: number): Rig {
  const t = f / FPS, r = w.actor(SU);
  const sp = says("su", ["B06", "B07", "B09", "B11", "B13", "B14", "B18"], f, 1);
  const tilt = eased(f, [[S.from, 0], [SA, 5], [KAO, 0], [B.crab, 6], [L07.to, 0], [L09.from + 6, -4], [W_GOU9, 0], [W_FANGZI, 4], [W_JIA, 0], [W_SHI, 5], [W_ZUO, 0], [B.thumb, -6]]);
  const head = heads(
    sp.head, { tilt },
    accent("nod", f, ZHU), accent("nod", f, PAO, { amp: 0.7 }), accent("nod", f, W_WEIJIAO, { amp: 1.2 }), accent("pop", f, B.take + 4),
    accent("shake", f, W_YITIAN, { amp: 0.5 }), accent("nod", f, W_GOU8, { amp: 0.5 }), accent("shake", f, W_BUGAO, { amp: 0.6 }),
    accent("laugh", f, RISE_CAM0 - 20, { dur: 1.6 }), accent("nod", f, W_JIA), accent("nod", f, B.count), accent("nod", f, W_HUIZ),
    accent("lean", f, L14.from + 4, { dur: 0.8, dir: 1 }), accent("laugh", f, W_LAO, { dur: 0.7, amp: 0.6 }), accent("nod", f, B.flashOut + 2, { amp: 0.6 }),
    accent("lean", f, B.thumb - 2, { dur: 0.9, dir: -1 }),
    (f >= GNAW0 + 4 && f < PULL) ? { dy: 0.03 * Math.sin(2 * PI * 3.1 * t) } : undefined,
  );
  const [r0, l0] = handsAt(f);
  r.set({
    at: suAt(f), facing: FACE, pose: { kind: "idle", t: t + 0.41 }, visible: true,
    expr: at(f, EXPR), blink: sp.blink ?? lid(t, 1, swaps(EXPR)), mouth: sp.mouth,
    lookDown: ky(f, LOOKDOWN), gaze: at(f, GAZE), head,
    hands: [r0, l0],
    // the gnawing hand is in front of his face
    // a hand in front of his beard is drawn over the head (rig rule 4): the salt, the serve, the handoff and the crab,
    // the gnawing
    armFront: [
      (f >= SA - 2 && f < KAO + 2) || (f >= OUT - 4 && f < MINE + 10) || (f >= HANDOFF - 6 && f < CHOP_POT + 8) ? true : undefined,
      (f >= SA - 4 && f < KAO + 2) || (f >= HANDOFF - 6 && f < CHOP_POT + 2) || (f >= GNAW0 && f < L09.from + 4) || (f >= RISE_CAM0 - 12 && f < PAN0) || (f >= L12.from && f < L13.from) || (f >= B.flashOut && f < W_ZHONG + 4) ? true : undefined,
    ],
  });
  return r;
}

// ------------------------------------------------------------------------------------------------------ the world
/** the yard's dressing and the props that do not move with a hand */
function dressYard(w: World, f: number) {
  const t = f / FPS;
  w.prop("stove").put(STOVE_AT, { steam: 1, t });
  w.prop("grill").put(GRILL_AT);
  w.prop("stool").put(STOOL_AT);
  w.prop("wineBowl").put(BOWL_AT);
  w.prop("bench").put(YARD.bench.clone().add(V(0, -BENCH_SINK, 0)));
  w.prop("ladder").put(YARD.ladder, { rot: ladderRot(YARD.ladder, YARD.ladderTop) });
  // boneB kept warm on the stove top until he takes it
  if (f < W_WEIJIAO + 5) w.prop("bone", "B").put(SLOT.B, { rot: [0, SLOT_YAW.B, PI / 2] });
  // the white bone in front of the dog, from the moment it lands
  if (f >= DOG_CUT + 1) w.prop("bone", "dog").put(DOG_BONE, { clean: true, rot: [0, DOG_ROT + 1.2, PI / 2] });
  if (f >= DOG_CUT) w.prop("chopsticks").put(CHOP_REST, { grip: "hilt", rot: CHOP_REST_ROT });
}
/** the yard dog: lying in the sun, then over to the stove to beg (sitting), the white bone: sniff, the betrayed look */
/** the dog prop's poses do not all stand on its origin (measured with the clearance check): lying sinks 4.8 cm into the
 *  ground, sitting floats 4.4 cm over it, sniffing puts the nose 1.3 cm in. Its height per pose, blended like the pose */
const DOG_Y: Record<string, number> = { lie: 0.048, sit: -0.044, sniff: 0.013 };
const dogAt = (p: THREE.Vector3, pose: string, from?: string, k = 1) => p.clone().setY(lerp(DOG_Y[from ?? pose] ?? 0, DOG_Y[pose] ?? 0, k));
function dog(w: World, f: number, suHead: THREE.Vector3, bone: THREE.Vector3) {
  const t = f / FPS, tw = (f - DOG_WALK0) / FPS;
  if (tw < 0) { w.prop("dog").put(dogAt(DOG_LIE, "lie"), { pose: "lie", t, rot: DOG_LIE_ROT, lookAt: suHead }); return; }
  const leg = walkAlong(DOG_PATH, DOG_V, tw, { endFacing: DOG_ROT });
  if (leg.moving) { w.prop("dog").put(leg.at, { pose: "walk", t, rot: leg.facing }); return; }
  const at0 = DOG_SIT, rot = leg.arrived ? leg.facing : DOG_ROT;
  const put = (pose: "sit" | "sniff" | "lookUp" | "idle", from: "walk" | "sit" | "sniff" | "lookUp", k: number, lookAt?: THREE.Vector3) =>
    w.prop("dog").put(dogAt(at0, pose, from, k), { pose, from, k, t, rot, lookAt });
  // begging by his side; the white bone: the sniff, the betrayed look up at him; then it stands on, watching the next
  // bone in his hand (the wave on 房子 included), tail going
  // (it puts its nose down as the bone falls, in the whip's smear: a blend of the two poses dips into the ground)
  if (f < DOG_CUT - 3) return put("sit", "walk", clamp01((f - DOG_WALK0 - walkTime(DOG_PATH, DOG_V) * FPS) / 8), suHead);
  if (f < BETRAY) return put("sniff", "sit", 1);
  if (f < RISE_CAM1 + 30) return put("lookUp", "sniff", smooth(clamp01((f - BETRAY) / 6)), suHead);
  put("idle", "lookUp", smooth(clamp01((f - RISE_CAM1 - 30) / 12)), bone);
}
/** MAI on the ladder: the lantern held up toward the hook (back to us), then hung; on 一家人 he waves back */
function mai(w: World, f: number): Rig {
  const t = f / FPS, m = w.actor(MAI);
  const waving = f >= W_JIA - 4 && f < W_TUAN + 12;
  // back to us on his rung; on 一家人 he turns round to us on the ladder and waves (turn 0 = toward her lens)
  const turn = 1 - ky(f, [[W_JIA - 12, 0], [W_JIA - 4, 1], [W_TUAN + 12, 1], [W_TUAN + 22, 0]]);
  m.set({
    at: MAI_AT.clone(), facing: MAI_FACE - (waving ? 0.35 : 0.12), turn, visible: true,
    pose: waving ? { kind: "wave", t, arm: 0 } : { kind: "idle", t: t + 1.3 },
    expr: "smile", ...alive(t, 2),
    hands: [null, f < HUNG ? LAN_HOLD.clone().add(V(0.01 * Math.sin(2 * PI * 0.7 * t), 0.012 * Math.sin(2 * PI * 0.5 * t), 0)) : null],
  });
  return m;
}
/** the two kids chasing round the yard (not on the dog's low shot) */
function kids(w: World, f: number) {
  for (const k of [0, 1]) {
    const leg = kidLeg(f, k), t = f / FPS;
    w.actor(k ? KID2 : KID).set({ at: leg.at, facing: leg.facing, pose: leg.pose, expr: k ? "laugh" : "happy", ...alive(t, 3 + k), visible: true });
  }
}
/** the bones that move with a hand or with the chopsticks (after w.update) */
function heldBones(w: World, f: number, s: Rig) {
  const across = (d: THREE.Vector3, extra = 0): Vec3 => [0, Math.atan2(d.x, d.z) + extra, PI / 2];
  const inHand = (up: THREE.Vector3) => ({ grip: "hilt" as const, rot: rotUp(up) });
  if (f < DOG_CUT) {
    // the chopsticks in his right hand; whatever rides on their tips sits where the SOLVED hand puts them
    const c = chopTip(f), tip = s.handWorld(0).addScaledVector(c.dir, CHOP_LEN), onTip = onTips(tip, c.dir);
    w.prop("chopsticks").put(s.handWorld(0), { grip: "hilt", rot: rotChop(c.dir) });
    // boneA: out of the pot on 煮熟 (it rises out of the broth), the wine, the salt, dropped onto the grill (it stays)
    if (f >= ZHU - 2 && f < KAO + 10) w.prop("bone", "A").put(onTip, { rot: across(c.dir, 0.15) });
    // boneB: off the grill on 微焦, held out to her across the stove, hers from MINE
    if (f >= W_WEIJIAO + 5 && f < MINE) w.prop("bone", "B").put(onTip, { rot: across(c.dir, B_ON_TIPS) });
    // boneD (his own): up out of the broth, over to his left hand
    if (f >= PICK_D + 12 && f < HANDOFF + 2) w.prop("bone", "D").put(onTip, { rot: across(c.dir, 0.1) });
  }
  if (f >= KAO + 10) w.prop("bone", "A").put(SLOT.A, { rot: [0, SLOT_YAW.A, PI / 2] });
  // boneD in his left hand: golden, gnawed, then CLEAN from the pull-away; the flick; the flight down to the dog
  if (f >= HANDOFF + 2 && f < LET_GO) {
    const gk = ky(f, [[CHOP_POT, 0], [GNAW0, 1], [PULL, 1], [L09.from + 4, 0]]);
    w.prop("bone", "D").put(s.handWorld(1), { ...inHand(boneUp(gk)), clean: f >= CLEAN });
  } else if (f >= LET_GO && f <= DOG_CUT) {
    // (one spin in the air; it lands on the cut, as the dog bone that lies there from the next frame)
    const u = clamp01((f - LET_GO) / (DOG_CUT - LET_GO)), p0 = track(LET_GO, LEFT, 1) ?? loc(0.36, 1.05, 0.32);
    const p = p0.clone().lerp(DOG_BONE, u); p.y += 0.22 * 4 * u * (1 - u);
    w.prop("bone", "D").put(p, { clean: true, rot: [2 * PI * u, DOG_ROT + 1.2, PI / 2] });
  }
  // boneE: his next one (from B10, out of the pot while her lens is on the dog), in his left hand; up and out for
  // the wave on 房子
  const gkE = f >= B.flashOut ? ky(f, [[B.flashOut, 1], [W_HZ18 - 4, 1], [W_ZHONG + 4, 0]])
    : ky(f, [[BONE_E, 0], [RISE_CAM0 - 10, 1], [L11.from + 2, 1], [PAN0, 0], [L12.from, 0], [L12.from + 4, 1], [L12.to - 6, 1], [L13.from, 0]]);
  const wk = ky(f, [[PAN0, 0], [W_FANGZI - 2, 1], [W_JIA - 6, 1], [W_JIA + 6, 0]]);
  if (f >= BONE_E + 2) w.prop("bone", "E").put(s.handWorld(1), inHand(boneUp(gkE).lerp(WAVE_UP, wk).normalize()));
}
/** the bone he serves (her hand reaches for it): where the PLANNED chopsticks hold it, frozen from her grab */
const serveAt = (f: number) => { const c = chopTip(Math.min(f, GRAB)); return onTips(c.tip, c.dir); };
/** his mouth (the mic's aim) */
const mouthOf = (r: Rig) => r.headWorld().add(rel(V(), FACE, 0, -0.08, 0.1));

// --------------------------------------------------------------------------------------------- her hand and mic
const MIC: [number, MicMode, number?][] = [
  [ZHU - 2, "in"], [ZHU + 10, "toward"], [FLICK - 4, "off", 8], [B.aside, "lens", 10], [RISE_CAM1 - 4, "toward", 12],
];
const micAt = (f: number): Pick<MicO, "mode" | "from" | "k"> => herKeys<MicMode>(f, MIC, "off");
/** HER INVISIBLE HAND'S BONE (PLAN 11.2: only the bone is drawn): held at the bottom of her lens BELOW the caption band
 *  (her.ts "eat" with dy: only its top end shows, under the subtitles), and a bite in each of the two gaps between
 *  the lines (B07 / B08 / B09): the bone lifts toward the lens and her camera nods (biteK, yardCam) */
const BITES = [L07.to + 2, L08.to + 1];
const biteK = (f: number) => BITES.reduce((m, b) => Math.max(m, f >= b && f < b + 10 ? Math.sin((PI * (f - b)) / 10) : 0), 0);
const EAT_DY = -0.55;
function herHand(f: number): HandO | undefined {
  if (f < REACH) return undefined;
  const dy = { eat: EAT_DY + 0.14 * biteK(f), off: EAT_DY };
  if (f < GRAB) return { mode: "reach", from: "off", k: clamp01((f - REACH) / 10), at: serveAt(f) };
  if (f < TO_EAT) return { mode: "reach", k: 1, at: serveAt(f), curl: clamp01((f - GRAB) / 5), item: "bone" };
  if (f < L09.from + 6) return { mode: "eat", from: "reach", k: clamp01((f - TO_EAT) / 12), item: "bone", curl: 1, dy };
  if (f < L09.from + 20) return { mode: "off", from: "eat", k: clamp01((f - L09.from - 6) / 12), item: "bone", curl: 1, dy };
  return undefined;
}

// ------------------------------------------------------------------------------------------------ the flashback
function huangzhou(w: World, f: number) {
  w.set.param("vignette", vignetteAt(f));
  if (vignetteAt(f) === "pot") {
    const k = smooth(clamp01((f - LID0) / (LID1 - LID0)));
    w.set.param("lid", k);
    w.set.param("steam", 1 - 0.6 * k);
    return;
  }
  // the slope: SU walks his furrow behind the plough (his voice over it: no lip-sync), fond
  const t = f / FPS, leg = walkAlong(HUANGZHOU.furrow, 0.42, (f - B.flashIn + 6) / FPS);
  const P = ploughFor(leg.at, leg.facing);
  w.actor(SU).set({ at: leg.at, facing: leg.facing, pose: leg.moving ? leg.pose : { kind: "idle", t }, expr: "smile_closed", blink: lid(t, 1), lookDown: 6, hands: P.hands, visible: true });
  w.prop("plough").put(P.at, { rot: P.rot });
}

const phase = (f: number) =>
  f < ZHU ? "land" : f < OUT ? "steps" : f < GNAW0 ? "offer" : f < L09.from ? "gnaw" : f < DOG_CUT ? "clean" : f < RISE_CAM0 ? "dog" : f < L11.from ? "aside"
  : f < L12.from ? "house" : f < B.flashIn ? "count" : f < B.flashOut ? `黄州 ${vignetteAt(f)}` : "yard B18";

export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    const K = camAt(f);
    const hz = f >= B.flashIn && f < B.flashOut;
    w.setPlace(hz ? "huangzhou" : "yard");
    w.setCamera(K.camera);
    const overlays = frag(C.whipSmear(K.smear, 1), vSmear(K.vsmear), transitionAt(f)?.node);
    if (hz) {
      huangzhou(w, f);
      w.update();
      return { camera: K.camera, post: K.post, overlays, slate: `B ${phase(f)}` };
    }
    w.set.param("sun", "morning");
    w.set.param("lantern", f >= HUNG ? 0.35 + 0.65 * smooth(clamp01((f - HUNG) / 40)) : 0);
    dressYard(w, f);
    const s = su(w, f);
    const lowDog = f >= DOG_CUT && f < RISE_CAM0;
    const m = mai(w, f);
    if (!lowDog) kids(w, f);
    dog(w, f, headAt(f).add(V(0, 0.05, 0)), track(f, LEFT, 1) ?? suRest(f, 1));
    w.update();
    if (f < HUNG) w.prop("lantern").put(m.handWorld(1), { grip: "hook", lit: 0 });
    heldBones(w, f, s);
    putHer(w, K.camera, f, { mic: { ...micAt(f), aim: mouthOf(s) }, hand: herHand(f) });
    return { camera: K.camera, post: K.post, overlays, focus: [SQ.x + 0.6, SQ.z + 0.6], slate: `B ${phase(f)}` };
  },
};

// SEGMENT B, lines B01-B09 (+ C01's silent beat): 辰时, the hall desk. WP5 segB. PLAN.md 7B, beats.ts BEAT.B.
// One handheld take in her eyes:
//   in       B01 pre   the whip from A lands in the hall (5 frames, decelerating); she follows him in, the drawn sword
//                      still on his shoulder
//   wow      B01       哇: she stops and her eyes go left and down to the slip towers (he walks on out of frame right);
//                      好多竹简 she drifts along them; 陛下: she pans back and he is already at the desk, writing, the
//                      sword away (scabbard on the floor beside him); 称重: without looking up he picks a bundle off the
//                      desk with his left hand and TOSSES it into the scale's pan (the bundle_thud)
//   scale    B02       the punch-in on the scale: the beam dips and wobbles, damped (the scale_creak), and settles
//                      still pan-up (still short); her eyes come back to him on 还差: a sidelong glance at the pan,
//                      三十斤 flat, writing, not looking up
//   pounds   B03-B04   奏章……论斤算的？ the camera tilts its head; 嗯 a nod, a quick proud glance up; the fact card:
//                      he writes on, framed low (his face under the card)
//   lift     B05-B07   你搬一捆试试: he looks up, smug, and points the brush at the slip tower on 一捆; she pans there,
//                      steps over and bends (THE DIP): she yanks the top bundle, it comes up a few cm and thumps
//                      back down (the bundle_thud, a kick); (the tossed bundle leaves the pan while her eyes are on
//                      the tower: segC's pan is empty) 是。唔…… she heaves again: it rises toward her lens, trembling,
//                      the camera straining; 好沉…… it sinks back; 呵: she looks up at him from down there: smug, chin up
//   care     B08-B09   she rises, out of breath, steps back; 好辛苦啊 she leans in; he stops writing, caught; the pause
//                      (B09's beat): smile_closed and BLUSH1 on a blink, eyes away; 这句，留着 stern, the brush pointing
//                      at her lens on 这句, a nod on 留着
//   nod      C01 pre   he nods off over the slips (sleep, the head sinks, the brush slips out of his fingers behind
//                      the desk), the snore; he snorts himself awake (the jerk), the blush gone, and GLARES into the
//                      lens. The last frame = segC's first: seated (pose sit), stern, her eyes 1.6 m in front of the
//                      desk (segC.ts DESK_CAM), calm handheld, seed 3
// Every frame is looked up (lineId / capWord / BEAT / SEGMENTS, the sound anchors from the lines' voice times); every
// mark comes from layout/hall.ts QHALL and props deskSeat / scalePan / slipSpot.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, capsOf, quote, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, easeInCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { emperorAt, EMPEROR, type EmpState } from "../people";
import { QHALL, EYE, FOV } from "../layout";
import { deskSeat, scalePan, slipSpot, SLIPS } from "../props";
import type { World } from "../world";
import { swordShoulder, swordRot } from "../acc/sword";
import { V, v3, rel, lid, speak, accent, heads, headM, headPop, at, ky, walkAlong, swaps, frag, shake, kick, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[1];
const B = BEAT.B;
const ln = (id: string) => lineId(id);
const sec = (s: number) => Math.round(s * FPS);
/** a time on the voice track (s) -> the film frame (the mix's anchors are line start / end + an offset) */
const atSec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;
const PI = Math.PI, RAD = PI / 180;
const ES = EMPEROR.scale ?? 1.08;

// ------------------------------------------------------------------------------------------------ the sound anchors
/** the fixed mix's hits in segment B (scripts/qin/sound/cues.json): the picture lands on them */
const SND = {
  /** the tossed bundle lands in the pan */ thud1: atSec(ln("B02").start - 0.25),
  /** the beam creaks on its swing */ creak: atSec(ln("B02").start + 0.4),
  /** the bundle she yanks drops back onto the tower */ thud2: atSec(ln("B06").start - 0.1),
  /** the snore (2 s: an inhale, the long snore from 0.53 s, loudest about 1.1 s, over at 1.55 s) */ snore: atSec(ln("C01").start - 1.35),
};

// ------------------------------------------------------------------------------------------------------- the marks
const SEAT = deskSeat(QHALL.desk);
/** the cushion's top: the seat's floor (segC's: the crossed shins rest on it instead of going through it) */
const CUSHION_TOP = SEAT.seat.top.y;
/** his head seated at the desk (segC's measure) */
const HEAD_SIT = V(SEAT.at.x, 0.86, SEAT.at.z + 0.06);
/** the scabbard he took off, on the floor at his right, hilt outward (segC's dressing) */
const SCABBARD_AT = V(SEAT.at.x - 0.9, 0.06, SEAT.at.z - 0.15);
const DESK = QHALL.desk, TOP = QHALL.deskTop;
/** the scale: rot PI turns the pan toward the desk */
const SCALE_ROT = PI;
/** the bundle he tosses: a SMALL one (0.4 size: it has to fit inside the pan's three cords), on the desk at his
 *  left hand; in the pan it lies along z (between the cords: rot PI turned them to 60 / 180 / 300 deg) on the dish.
 *  The cords make a tent over the pan (radius 0.07 at their feet, 0.28 m below the hang point, 0 at it): the bundle
 *  comes in from behind (-z), low, sliding along its own axis between the cords at 60 / 300 deg, over the rim, then
 *  settles 2.3 cm onto the dish (its middle 0.275 m below the hang point: the cords 6 mm clear of its sides) */
const TOSS_K = 0.4, TOSS_B = V(DESK.x + 0.3, TOP, DESK.z - 0.12), TOSS_R = SLIPS.r * TOSS_K;
/** the bundle's origin lying in the pan (for the beam at tilt), and where it comes in from (behind, 2.3 cm higher) */
const panRest = (tilt: number) => scalePan(QHALL.scale, tilt, SCALE_ROT).add(V(0, 0.003 - TOSS_R, 0));
const PAN_ENTRY = V(0, 0.023, -0.21);
const tossOpt = (rot: [number, number, number]) => ({ scale: TOSS_K, rot });
/** the slip tower she tries to lift from (left of the desk, nearest her) and its top bundle's origin (slipSpot 8 of 9,
 *  the lone bundle of the top layer, along x: a put of n 1 there draws it exactly where the tower of 9 draws it) */
const T1 = QHALL.slips[1], T1_N = 9;
const T1_TOP = T1.clone().add(slipSpot(T1_N - 1, T1_N).p).add(V(0, -SLIPS.r, 0));
/** THE LIFT: the top bundle in her hands (they are below the frame): on the yank it comes up a few cm, one end first,
 *  and thumps back down (thud2); on 唔 she heaves again: it rises toward her lens, trembling; on 好沉 it sinks back
 *  onto the tower. k 0 = it lies on the tower (the tower is one put, n 9) */
const t1Lift = (f: number): { k: number; p: THREE.Vector3; rot: [number, number, number] } => {
  const yank = ky(f, [[SND.thud2 - 6, 0], [SND.thud2 - 2, 1], [SND.thud2, 0]]);
  const heave = ky(f, [[SND.thud2 + 8, 0], [SND.thud2 + 18, 1], [W_HAOCHEN - 2, 1], [W_HAOCHEN + 6, 0]]);
  const up = 0.035 * yank + 0.075 * heave;
  if (up < 0.0015) return { k: 0, p: T1_TOP, rot: [0, 0, 0] };
  const t = f / FPS, tr = heave * (0.7 + 0.3 * Math.sin(2 * PI * 1.3 * t));
  const toHer = V(T1_POS.x - T1.x, 0, T1_POS.z - T1.z).normalize();
  const p = T1_TOP.clone().add(V(0.004 * tr * Math.sin(2 * PI * 9 * t), up + 0.004 * tr * Math.sin(2 * PI * 7.3 * t + 1), 0)).addScaledVector(toHer, 0.6 * up);
  return { k: 1, p, rot: [0, 0, 0.12 * yank + 0.16 * heave + 0.035 * tr * Math.sin(2 * PI * 5.5 * t)] };
};
/** where the dropped brush comes to rest: on the cushion at his right, below the desk's edge from her eyes */
const BRUSH_REST = V(SEAT.at.x - 0.5, 0.012, SEAT.at.z + 0.12);
/** the scale's tilt (+ = the pan end down): empty against its stop, then the bundle; it stays pan-up (short) */
const TILT_EMPTY = -0.2, TILT_SHORT = -0.12;
/** B's last dressing, for segC to continue (requests.md "WP5 segB") */
export const B_END = { scaleRot: SCALE_ROT, scaleTilt: TILT_SHORT, panBundle: true } as const;

/** his walk in (the sword on his shoulder): from the hall's middle to before the desk, set off before the cut */
const WALK0 = S.from - sec(0.6), WALK_V = 1.3;
const P_IN0 = V(DESK.x + 0.2, 0, DESK.z + 3.15), P_IN1 = V(DESK.x + 0.45, 0, DESK.z + 1.0);
const walkOf = (f: number) => walkAlong([P_IN0, P_IN1], WALK_V, (f - WALK0) / FPS, { endFacing: PI });

// ------------------------------------------------------------------------------------------------------- the beats
const B01 = ln("B01"), B02 = ln("B02"), B03 = ln("B03"), B04 = ln("B04"), B05 = ln("B05"), B06 = ln("B06"), B07 = ln("B07"), B08 = ln("B08"), B09 = ln("B09");
const CAP_BIXIA = capsOf("B01")[1]?.from ?? word("B01", "陛下");
const W_JIN = word("B02", "三十斤"), W_HAICHA = word("B02", "还差"), W_LUN = word("B03", "论斤"), W_BAN = word("B05", "搬"), W_YIKUN = word("B05", "一捆");
const W_HAOCHEN = word("B06", "好沉"), W_MEITIAN = word("B08", "每天"), W_XINKU = word("B08", "辛苦"), W_ZHEJU = word("B09", "这句"), W_LIU = word("B09", "留着");
/** she stops (哇), the pan to the towers, the drift along them, the pan back to him (陛下) */
const STOP0 = B01.from - 3, TOWERS = B01.from + 16, PAN_BACK = CAP_BIXIA - 14, SEEN = CAP_BIXIA + 6;
/** he is seated from here (off screen: her eyes are on the towers) */
const SIT_F = TOWERS + 4;
/** the toss: reach, grab, lift, release (the flight lands on thud1), the hand back */
const TOSS = { reach: SND.thud1 - 24, grab: SND.thud1 - 17, lift: SND.thud1 - 10, rel: SND.thud1 - 6, back: SND.thud1 + 8 };
const CARD = B.card;
/** B05: he looks up, the point at the tower (on 一捆), the pan to it, her steps there */
const LOOKUP = B05.from - 6, POINT0 = W_YIKUN - 6, PAN_T1 = W_YIKUN + 6, AT_T1 = SND.thud2 - 7;
/** the tossed bundle leaves the pan (off screen: her eyes are on the tower, the scale 70+ deg out of the view) */
const PAN_GONE = PAN_T1 + 2;
/** the dip: down, the yank (thud2), the strain, her look up at him (呵), the rise */
const DOWN0 = AT_T1 - 2, DOWN1 = SND.thud2 - 1, LOOK_UP0 = B07.from - 12, RISE0 = B.rise + 2, RISE1 = B.rise + 26;
/** 好辛苦啊: she leans in; B09: the pause (his blush), the line; the nod-off, the snore, the jerk */
const PUSH0 = W_XINKU - 4, PUSH1 = W_XINKU + 18;
const BACK0 = B09.to + 2, BACK1 = B09.to + 12;
const DROWSE = B09.to + 3, ASLEEP = SND.snore, BRUSH_DROP = SND.snore + 8;
const JERK = Math.min(SND.snore + sec(1.08), S.to - 6);

// --------------------------------------------------------------------------------------------------- his face
const BLUSH: [number, EmpState][] = [[S.from, "plain"], [B.blush, "blush1"], [ASLEEP + 6, "plain"]];
const EXPR: [number, Expr][] = [
  [S.from, "cool"], [SIT_F, "focus"], [TOSS.reach, "deadpan"], [B02.to + 6, "focus"], [W_LUN + 4, "deadpan"], [B04.from - 2, "smug"], [B04.to + 6, "focus"],
  [LOOKUP, "smug"], [B06.from + 6, "smile"], [W_HAOCHEN, "grin"], [B07.from - 3, "smug"], [B07.to + 8, "focus"],
  [W_XINKU + 2, "neutral"], [B.blush, "smile_closed"], [B09.from - 2, "stern"], [DROWSE + 4, "sleep"], [JERK, "shock"], [JERK + 3, "stern"],
];
/** the expression changes that hide under a blink (the swap, the melt) */
const BLINKS = [B.blush, B09.from - 2].map((k) => k / FPS);
/** his pupils: on his work (a little aside), at her for 嗯 / 你搬 / 呵, away for the blush, back at the lens at the end */
const GAZE: [number, number][] = [
  [S.from, 0], [SIT_F, 0.3], [W_HAICHA, 0.9], [W_JIN + 2, 0.3], [B04.from - 2, 0], [B04.to + 6, 0.3], [LOOKUP, 0], [B07.to + 8, 0.3], [W_XINKU + 2, 0],
  [W_MEITIAN, 0.1], [W_MEITIAN + 10, 0.3], [B.blush + 4, 1], [W_ZHEJU - 2, 0.8], [W_LIU + 4, 1], [JERK, 0],
];
/** head down over the slips (deg): writing, looking up at her, the nod-off (sinks), the jerk */
const LOOKDOWN: [number, number][] = [
  [SIT_F, 20], [B04.from - 4, 20], [B04.from + 2, 4], [B04.to + 8, 4], [B04.to + 16, 20], [CARD[1] - 14, 20], [CARD[1] - 6, 6],
  [LOOKUP + 5, 0], [B07.to + 8, 0], [B07.to + 18, 18], [W_XINKU, 18], [W_XINKU + 5, 0],
  [DROWSE, 0], [ASLEEP, 16], [ASLEEP + 16, 12], [JERK - 6, 26], [JERK, -4], [JERK + 4, 0],
];
const DI = ["B02", "B04", "B05", "B07", "B09"];
const STRESS: Record<string, number[]> = { B02: [4, 5], B04: [0], B05: [1, 3], B07: [0], B09: [0, 3] };
const talk = (f: number) => { for (const id of DI) { const s = speak(quote("di", id), f, 1, STRESS[id]); if (s.mouth || s.head) return s; } return {} as ReturnType<typeof speak>; };

// ------------------------------------------------------------------------------------------------------ his moves
/** writing 0..1 (the brush hand on its strokes) vs his hand free (talking to her, pointing, asleep) */
const writing = (f: number) => ky(f, [
  [SIT_F, 1], [LOOKUP - 2, 1], [LOOKUP + 4, 0], [B07.to + 6, 0], [B07.to + 16, 1], [W_XINKU, 1], [W_XINKU + 6, 0], [DROWSE, 0],
]);
/** the brush hand's stroke on the desk (the rig's write loop, 2.4 s, on his own clock): his frame (x = his left) */
const strokeHand = (f: number) => {
  const t = f / FPS, T = 2.4, u = (((t / T) % 1) + 1) % 1, back = u < 0.84 ? 0 : (u - 0.84) / 0.16, along = u < 0.84 ? u / 0.84 : 1 - smooth(back), w = t * 2 * PI * 2.2;
  return rel(SEAT.at, SEAT.facing, -0.07 - (along - 0.5) * 0.075 + 0.0065 * Math.sin(w), TOP + 0.15 + 0.012 * Math.sin(PI * back), 0.37 + 0.004 * Math.sin(w + 1.1));
};
/** the brush in the hand: writing (the tip down onto the slips), or pointing along a direction */
const BRUSH_WRITE: [number, number, number] = [PI * 0.85, 0, 0];
/** the scale's tilt on frame f: against its stop, the bundle lands (thud1): a damped wobble, settles pan-up */
const tiltAt = (f: number) => {
  if (f < SND.thud1) return TILT_EMPTY;
  const u = (f - SND.thud1) / FPS, w = 2 * PI * 1.15;
  return TILT_SHORT + ((TILT_EMPTY - TILT_SHORT) * Math.cos(w * u) + 0.2 * Math.sin(w * u)) * Math.exp(-2.1 * u);
};
/** the tossed bundle's origin on frame f (on the desk, in his hand, in flight, in the pan) and its spin */
const handHold = (hand: THREE.Vector3) => hand.clone().add(V(0, -(2 * TOSS_R + 0.02), 0));

/** HIM, every frame */
function emperor(w: World, f: number, cam: CamPose): void {
  const t = f / FPS, T = talk(f), camPos = v3(cam.pos);
  const r = w.actor(emperorAt(f, BLUSH));
  const base: St = { expr: at(f, EXPR), gaze: at(f, GAZE), blink: Math.max(lid(t, 1, [...BLINKS, ...swaps(BLUSH)]), T.blink ?? 0), mouth: T.mouth, visible: true };

  // 1. the walk in, the sword on his shoulder (as A left him), his back to her
  if (f < SIT_F) {
    const L = walkOf(f);
    r.set({ ...base, at: L.at, facing: L.facing, pose: L.moving ? L.pose : { kind: "idle", t: t + 0.3 }, turn: 1, hide: ["hilt"], head: T.head });
    w.update();
    const sh = swordShoulder({ at: L.at, facing: L.facing, lens: camPos, scale: ES });
    r.set({ hands: [null, sh.hand] });
    w.update();
    w.prop("sword").put(r.handWorld(1), { grip: "hilt", rot: sh.rot });
    w.prop("slips", "toss").put(TOSS_B, tossOpt([0, 0, 0]));
    return;
  }

  // 2. seated at the desk (pose sit: the forearms on the desk; the brush hand pinned on its strokes)
  const wr = writing(f);
  const slump = ky(f, [[DROWSE, 0], [ASLEEP + 4, 1], [JERK - 1, 1], [JERK + 1, -0.4], [JERK + 5, 0]]);
  const lean = ky(f, [[SIT_F, 0.6], [LOOKUP - 2, 0.6], [LOOKUP + 6, 0], [B07.to + 8, 0], [B07.to + 18, 0.6], [W_XINKU, 0.6], [W_XINKU + 6, 0]]);
  const back = SEAT.seat.back - 0.07 * lean - 0.06 * Math.max(0, slump) + 0.03 * Math.min(0, slump);
  const chin = ky(f, [[B07.from - 3, 0], [B07.from + 3, 1], [B07.to + 4, 1], [B07.to + 12, 0]]) * 0.025
    + ky(f, [[B09.from - 2, 0], [B09.from + 3, 1], [B09.to + 2, 1], [DROWSE, 0]]) * 0.018;
  const hTilt = 2.5 * Math.sin(2 * PI * t / 2.4) * wr                         // the head rides the strokes
    + ky(f, [[B07.from - 3, 0], [B07.from + 3, 7], [B07.to + 6, 7], [B07.to + 14, 0]])
    + ky(f, [[B.blush, 0], [B.blush + 8, -8], [W_LIU, -8], [W_LIU + 4, -3], [DROWSE, -3], [ASLEEP, 6], [JERK - 1, 9], [JERK + 2, 0]])
    + ky(f, [[B05.from, 0], [W_BAN, 4], [W_YIKUN + 6, 4], [B05.to + 4, 0]])
    + ky(f, [[W_JIN - 4, 0], [W_JIN + 4, -3], [B02.to + 4, 0]]);
  // the snore: the head rises on the inhale, sinks on the long snore
  const breath = f >= ASLEEP && f < JERK ? ky(f, [[ASLEEP, 0], [ASLEEP + sec(0.42), 0.6], [ASLEEP + sec(0.55), 0], [JERK - 2, -0.6]]) : 0;
  const head = heads(
    T.head,
    { dy: headM(chin + 0.012 * breath - 0.04 * Math.max(0, slump)), tilt: hTilt },
    accent("nod", f, B04.from + 1, { amp: 1.1 }), accent("nod", f, W_LIU, { amp: 0.9 }), headPop(f, W_XINKU + 2, [1.06, 1.03, 1.01]),
    headPop(f, JERK, [1.12, 1.06, 1.02]), headPop(f, B.blush, [1.04, 1.02, 1.01]),
  );
  const seat = { ...SEAT.seat, floor: CUSHION_TOP, back };
  r.set({ ...base, at: SEAT.at, facing: SEAT.facing, seat, pose: { kind: "sit", t }, hide: ["swordBelt", "hilt"], lookDown: ky(f, LOOKDOWN), head, hands: [null, null] });
  w.update();
  const rest0 = r.handWorld(0), rest1 = r.handWorld(1);

  // the brush hand: strokes / point at the tower (一捆) / point at her lens (这句) / slack as he nods off
  const pT1 = ky(f, [[POINT0, 0], [W_YIKUN, 1], [B05.to - 2, 1], [B05.to + 6, 0]]);
  const pLens = ky(f, [[W_ZHEJU - 6, 0], [W_ZHEJU + 1, 1], [W_LIU + 2, 1], [B09.to + 6, 0]]);
  const slack = ky(f, [[DROWSE, 0], [BRUSH_DROP, 1]]);
  const free = rel(SEAT.at, SEAT.facing, -0.16, TOP + 0.2, 0.34);                    // the hand lifted off the slips
  const atT1 = rel(SEAT.at, SEAT.facing, -0.3, TOP + 0.36, 0.42);
  const atLens = rel(SEAT.at, SEAT.facing, -0.12, TOP + 0.4, 0.44);
  let h0 = strokeHand(f).lerp(free, 1 - wr);
  h0 = h0.lerp(atT1, easeInOutCubic(pT1)).lerp(atLens, easeInOutCubic(pLens));
  const knee = rel(SEAT.at, SEAT.facing, -0.4, CUSHION_TOP + 0.3, 0.14);          // the slack hand beside his knee
  const offDesk = rel(SEAT.at, SEAT.facing, -0.4, TOP + 0.19, 0.2);
  if (slack > 0) h0 = slack < 0.5 ? h0.lerp(offDesk, easeInOutCubic(slack * 2)) : offDesk.lerp(knee, easeInOutCubic(slack * 2 - 1));
  const wake = ky(f, [[JERK - 1, 0], [JERK + 4, 1]]);
  if (wake > 0) h0 = knee.lerp(rest0, easeOutCubic(wake));

  // the toss hand (his left): rest -> the bundle -> lift -> the flick -> rest
  let h1: THREE.Vector3 | null = null;
  const grabAt = TOSS_B.clone().add(V(0, 2 * TOSS_R + 0.02, 0)), liftAt = rel(SEAT.at, SEAT.facing, 0.3, TOP + 0.34, 0.36), relAt = rel(SEAT.at, SEAT.facing, 0.36, TOP + 0.4, 0.46);
  if (f >= TOSS.reach && f < TOSS.back) {
    if (f < TOSS.grab) h1 = rest1.clone().lerp(grabAt, easeInOutCubic((f - TOSS.reach) / (TOSS.grab - TOSS.reach)));
    else if (f < TOSS.lift) h1 = grabAt.clone().lerp(liftAt, easeInOutCubic((f - TOSS.grab) / (TOSS.lift - TOSS.grab)));
    else if (f < TOSS.rel) h1 = liftAt.clone().lerp(relAt, easeInCubic((f - TOSS.lift) / (TOSS.rel - TOSS.lift)));
    else h1 = relAt.clone().lerp(rest1, easeInOutCubic((f - TOSS.rel) / (TOSS.back - TOSS.rel)));
  }
  r.set({ hands: [h0, h1], armFront: [pLens > 0.3 ? true : undefined, undefined] });
  w.update();

  // the brush: in the hand (writing / pointing / slack), then the fall to the cushion behind the desk
  const hw0 = r.handWorld(0);
  if (f < BRUSH_DROP) {
    let rot: [number, number, number] = BRUSH_WRITE;
    if (pT1 > 0.01 || pLens > 0.01) {
      const d = T1.clone().add(V(0, 0.6, 0)).sub(hw0).normalize().lerp(camPos.clone().sub(hw0).normalize().add(V(0.35, -0.1, 0)).normalize(), pLens).normalize();
      const write = V(0, Math.cos(PI * 0.85), Math.sin(PI * 0.85));
      const dir = write.lerp(d, Math.max(pT1, pLens)).normalize();
      rot = swordRot(dir, camPos.clone().sub(hw0));
    }
    w.prop("brush").put(hw0, { grip: "hilt", rot });
  } else {
    const k = easeInCubic(clamp01((f - BRUSH_DROP) / 6)), from = rel(SEAT.at, SEAT.facing, -0.4, CUSHION_TOP + 0.3, 0.14);
    const p = from.lerp(BRUSH_REST, k);
    w.prop("brush").put(p, { rot: [PI * 0.85 * (1 - k), 0.3 * k, (PI / 2) * k] });
  }

  // the tossed bundle: on the desk, in his hand, in flight, in the pan (it rides the beam). It is gone from the pan by
  // the time her eyes come back from the tower (segC's pan is empty): taken off while the scale is out of her view
  const tilt = tiltAt(f);
  if (f < TOSS.grab) w.prop("slips", "toss").put(TOSS_B, tossOpt([0, 0, 0]));
  else if (f < TOSS.rel) w.prop("slips", "toss").put(handHold(r.handWorld(1)), tossOpt([0, 0, 0.15 * clamp01((f - TOSS.lift) / 4)]));
  else if (f < SND.thud1) {
    // the lob: up and over to behind the pan (the spin done by then), then the slide in between the cords
    const u = (f - TOSS.rel) / (SND.thud1 - TOSS.rel), p0 = handHold(relAt), fin = panRest(TILT_EMPTY), entry = fin.clone().add(PAN_ENTRY);
    const sp = clamp01(u / 0.6);
    let p: THREE.Vector3;
    if (u < 0.6) {
      const v = u / 0.6;
      p = p0.clone().lerp(entry, easeOutCubic(v));
      p.y = lerp(p0.y, entry.y, v) + 0.16 * 4 * v * (1 - v);
    } else p = entry.clone().lerp(fin.clone().setY(entry.y), (u - 0.6) / 0.4);
    w.prop("slips", "toss").put(p, tossOpt([0, (PI / 2) * sp, 0.15 + (2 * PI - 0.15) * sp]));           // one tumble, end over end
  } else if (f < PAN_GONE) w.prop("slips", "toss").put(panRest(tilt), tossOpt([0, PI / 2, 0]));
  w.prop("scale").put(QHALL.scale, { tilt, rot: SCALE_ROT });
}

// --------------------------------------------------------------------------------------------------- the dressing
function dressHall(w: World, f: number) {
  w.prop("desk").put(DESK);
  w.prop("cushion").put(SEAT.cushion, { rot: SEAT.facing });
  QHALL.slips.forEach((p, i) => { if (i !== 1) w.prop("slips", `tower${i}`).put(p, { n: [6, 9, 4][i] }); });
  // the tower she tries (one put, n 9, as segC has it). While its top bundle is off it (THE LIFT) the tower is
  // put with n 8 and the bundle is its own put (t1Lift). (The clearance checker reads a slips tower of n < 12 as 12, so on those
  // frames it reports the lifted bundle inside tower1: expected, logged in requests.md "WP5 segB")
  const L = t1Lift(f);
  if (L.k > 0) {
    w.prop("slips", "tower1").put(T1, { n: T1_N - 1 });
    w.prop("slips", "t1top").put(L.p, { n: 1, rot: L.rot });
  } else w.prop("slips", "tower1").put(T1, { n: T1_N });
  w.prop("slips", "desk").put(V(DESK.x - 0.25, TOP, DESK.z + 0.02), { n: 1 });
  w.prop("inkstone").put(V(DESK.x + 0.4, TOP, DESK.z + 0.04));
  if (f >= SIT_F) w.prop("scabbard").put(SCABBARD_AT, { rot: [0, 0, PI / 2] });
  else w.prop("scale").put(QHALL.scale, { tilt: TILT_EMPTY, rot: SCALE_ROT });
}

// --------------------------------------------------------------------------------------------------- her camera
/** a camera at `pos` turned so that the world point `tgt` lands on screen (sx, sy) (px on 1080 x 1920): segC's aim */
const aim = (pos: Vec3 | THREE.Vector3, tgt: THREE.Vector3, sy: number, sx = 540, fov = FOV): CamPose => {
  const p = v3(pos), d = tgt.clone().sub(p), hz = Math.hypot(d.x, d.z);
  const tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  const pitch = Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), yaw = Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th);
  const look = p.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  return { pos: [p.x, p.y, p.z], look: [look.x, look.y, look.z], fov };
};
const key = (f: number, c: CamPose, ease?: (x: number) => number): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov, ease });
/** segC's first framing (B's last): her eyes 1.6 m in front of the desk, his head at y 610 */
const DESK_POS = V(DESK.x, EYE, DESK.z + 1.6);
const DESK_CAM = aim(DESK_POS, HEAD_SIT, 610);
/** the follow behind him (the walk in) */
const followCam = (f: number) => C.follow(f, (g) => walkOf(g).at, { back: 1.75, side: 0.12, lookY: 1.2, ahead: 2.4, win: 8 });
/** 哇: she has stopped short of the desk; her eyes go left and down to the towers, drift along them */
const STOP_POS = V(DESK.x + 0.05, EYE - 0.02, DESK.z + 2.3);
const TOWER_LOOK = V(T1.x - 0.1, 0.4, T1.z + 0.05), TOWER_LOOK2 = V(QHALL.slips[0].x + 0.1, 0.5, QHALL.slips[0].z - 0.1);
/** 陛下: back to him; she comes closer for the toss (him left of the middle, the scale's pan right) */
const SEE_POS = V(DESK.x + 0.18, EYE - 0.1, DESK.z + 1.75);
const SEE_CAM = aim(SEE_POS, HEAD_SIT, 520, 430);
/** the punch-in on the pan (the beam and the pan, his writing hand at the edge) */
const PAN_LOOK = scalePan(QHALL.scale, TILT_SHORT, SCALE_ROT).add(V(0.12, 0.08, 0));
const SCALE_CAM: CamPose = { pos: SEE_CAM.pos, look: PAN_LOOK.toArray() as Vec3, fov: FOV * 0.62 };
/** B03 / B04: on him; the card: framed low (his face below the card's y 560) */
const TALK_POS = V(DESK.x + 0.08, EYE - 0.12, DESK.z + 1.65);
const TALK_CAM = aim(TALK_POS, HEAD_SIT, 525);
const CARD_CAM = aim(V(TALK_POS.x + 0.06, TALK_POS.y + 0.04, TALK_POS.z + 0.08), HEAD_SIT, 820);
const UP_CAM = aim(TALK_POS, HEAD_SIT, 545);
/** the tower: she looks where he points, steps over; down low (the dip); her look up at him (呵) */
const T1_POS = V(T1.x + 0.42, EYE, T1.z + 0.72);
const T1_LOOK = T1_TOP.clone().add(V(0, 0.08, 0));
const T1_CAM_UP = aim(TALK_POS, T1_LOOK, 1000, 540);
const T1_STAND = aim(T1_POS, T1_LOOK, 900);
const T1_LOW_POS = T1_POS.clone().add(V(0.02, -0.6, 0.05));
const T1_LOW = aim(T1_LOW_POS, T1_LOOK, 900);
const LOW_HIM = aim(T1_LOW_POS.clone().add(V(0, 0.04, 0)), HEAD_SIT, 560, 560);
/** she rises and steps back (B08), leans in on 好辛苦啊, back to the desk framing for the end */
const RISE_POS = V(DESK.x - 0.06, EYE - 0.06, DESK.z + 1.62);
const RISE_CAM = aim(RISE_POS, HEAD_SIT, 535);
const PUSH_CAM = aim(RISE_POS.clone().add(V(0.03, -0.05, -0.2)), HEAD_SIT, 540);
const KEYS: C.CamKey[] = [
  key(STOP0, followCam(STOP0)),
  { f: TOWERS, pos: STOP_POS, look: TOWER_LOOK, ease: easeOutCubic },
  { f: PAN_BACK, pos: STOP_POS.clone().add(V(-0.05, 0, -0.08)), look: TOWER_LOOK2 },
  key(SEEN, aim(STOP_POS.clone().add(V(0.02, -0.04, -0.2)), HEAD_SIT, 530, 450)),
  key(TOSS.reach, SEE_CAM),
  key(SND.thud1, SEE_CAM),
  key(B02.to + 4, SEE_CAM),
  key(B03.from + 10, TALK_CAM),
  key(CARD[0] - 2, TALK_CAM),
  key(CARD[0] + 10, CARD_CAM),
  key(CARD[1] - 4, CARD_CAM),
  key(LOOKUP + 6, UP_CAM),
  key(W_YIKUN + 2, UP_CAM),
  key(PAN_T1, T1_CAM_UP, easeOutCubic),
  key(AT_T1, T1_STAND),
  key(DOWN1, T1_LOW, easeOutCubic),
  key(LOOK_UP0, T1_LOW),
  key(B07.from + 2, LOW_HIM, easeOutCubic),
  key(RISE0, LOW_HIM),
  key(RISE1, RISE_CAM),
  key(PUSH0, RISE_CAM),
  key(PUSH1, PUSH_CAM),
  key(BACK0, PUSH_CAM),
  key(BACK1, DESK_CAM),
];
const MOOD: [number, C.Mood][] = [[S.from, "excited"], [STOP0, "excited"], [SEEN, "calm"], [SND.thud1, "excited"], [B02.to, "calm"], [AT_T1, "excited"], [RISE1, "calm"]];
const WALK: [number, number][] = [[S.from, 1], [STOP0 - 2, 1], [STOP0 + 8, 0], [SEEN - 10, 0], [SEEN - 4, 0.4], [TOSS.reach, 0], [PAN_T1, 0], [PAN_T1 + 3, 0.7], [AT_T1, 0.7], [AT_T1 + 3, 0], [RISE0 + 6, 0], [RISE0 + 10, 0.6], [RISE1 - 2, 0], [S.to, 0]];

/** her camera on frame f: { camera, post, smear } */
function camAt(f: number): { camera: CamPose; post?: Pose["post"]; smear: number } {
  let c = f <= STOP0 ? followCam(f) : C.keyCam(f, KEYS);
  // the handheld: seed 3 throughout (segC's DESK_CAM layer), calm by the end
  c = C.handheld(c, f, { mood: MOOD, walk: WALK, amp: 0.9, seed: 3 });
  // her own extra life: the follow's bob, the strain down low, out of breath after it (fades to 0 before the end)
  const strainK = ky(f, [[DOWN1, 0], [DOWN1 + 4, 1], [W_HAOCHEN + 10, 1.3], [B06.to + 4, 0.5], [LOOK_UP0, 0.3], [RISE0, 0]]);
  c = C.dip(c, f, DOWN0, RISE0 + 10, { depth: 0, pitch: 0, strain: 2.2 * strainK + 0.01 });
  const pant = ky(f, [[RISE0, 0], [RISE1, 1], [B08.to, 0.6], [B09.to, 0]]);
  if (pant > 0.001) c = C.nudge(c, { up: 0.012 * pant * Math.sin(2 * PI * 0.9 * (f / FPS)), pitch: 0.5 * pant * Math.sin(2 * PI * 0.9 * (f / FPS) + 0.6) });
  // 论斤算的？ she tilts her head (the camera rolls); 一捆: the heave as she straightens a little (唔) and sinks (好沉)
  const puzzled = ky(f, [[W_LUN - 6, 0], [W_LUN + 4, 1], [B04.from, 1], [B04.from + 10, 0]]);
  const heave = ky(f, [[SND.thud2 + 8, 0], [SND.thud2 + 16, 1], [W_HAOCHEN - 2, 1], [W_HAOCHEN + 8, -0.6], [B06.to, -0.6], [LOOK_UP0, 0]]);
  c = C.nudge(c, { roll: -5 * puzzled, up: 0.03 * heave, pitch: 1.2 * heave });
  // the nod-off: she creeps in to look, then flinches back on the jerk, settled on segC's framing before the last frame
  const creep = ky(f, [[ASLEEP + 4, 0], [JERK - 1, 1], [JERK + 4, 0]]);
  const flinch = f >= JERK && f < S.to ? Math.sin(PI * clamp01((f - JERK) / (S.to - JERK))) : 0;
  c = C.nudge(c, { fwd: 0.13 * creep - 0.04 * flinch, pitch: -1.5 * creep + 1.2 * flinch });
  // the hits: the toss lands (a small kick), the yank drops back (a kick), the jerk (a shake, over before the end)
  c = kick(c, f, SND.thud2, 0.03);
  c = shake(c, f, SND.thud1, 3, 2, 5);
  c = shake(c, f, JERK, 5, 2, Math.min(6, S.to - JERK));
  // 称重: the punch-in on the scale as the bundle lands, held through the wobble, eased back to him for 还差三十斤
  const pk = ky(f, [[SND.thud1 - 3, 0], [SND.thud1 + 2, 1], [W_HAICHA - 10, 1], [W_HAICHA + 4, 0]]);
  if (pk > 0) {
    const sc = C.handheld(SCALE_CAM, f, { mood: "excited", amp: 0.8, seed: 3 });
    c = { ...c, look: v3(c.look).lerp(v3(sc.look), easeOutCubic(pk)).toArray() as Vec3, fov: lerp(c.fov, sc.fov, easeOutCubic(pk)) };
  }
  // the whip from A lands: the first 5 frames arrive from the left (decelerating), blur and smear falling off
  const W = C.whip(c, f, S.from - 5, { dir: 1, out: 5, in: 5 });
  if (W.post) return { camera: W.cam, post: W.post, smear: W.smear };
  return { camera: c, smear: 0 };
}

const phase = (f: number) =>
  f < STOP0 ? "in" : f < SEEN ? "wow (towers)" : f < B02.to + 6 ? "scale" : f < LOOKUP ? "pounds / card" : f < B.rise ? "lift (dip)" : f < DROWSE ? "care" : "nod";

export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w: World, f: number): Pose {
    w.setPlace("hall");
    const K = camAt(f);
    w.setCamera(K.camera);
    dressHall(w, f);
    emperor(w, f, K.camera);
    return { camera: K.camera, post: K.post, overlays: frag(C.whipSmear(K.smear, 1)), focus: [0.3, -2.6], slate: `B ${phase(f)}` };
  },
};

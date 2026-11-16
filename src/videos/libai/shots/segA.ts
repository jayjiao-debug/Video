// SEGMENT A, lines A01-A09: 卯时, the tavern in the morning. beats.ts BEAT.A.
//   sleep   A01        REC on. 李白 asleep face down on his table, hugging the wine jar; a drinker asleep at the next
//                      table, the keeper wiping by the screen. The invisible hand knocks twice: the table jumps.
//   wake    A01 end    he lifts his head, dazed, squints at the lens.
//   lean    A02        哟，月亮？ her lens is the moon to him: the camera pushes in on him (he peers).
//   jar     A04        好！先喝一杯！ the jar comes up to the lens in both hands.
//   proud   A06        早酒: very pleased with himself (smug, a head tilt).
//   count   A08        a hand up (counting), 一日: both hands out, a shrug.
//   aside   A09        her whisper to the viewers (whisper.ts): the lens leans in on him, he carries on.
//   card 1             back on him: he drinks from the jar. The last 4 frames whip right.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, quote, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI } from "../people";
import { RX } from "../layout";

import { transitionAt } from "../hud";
import type { World } from "../world";
import { V, rel, lid, says, speak, accent, heads, headPop, at, ky } from "./common";
import { aim, ramp, held, mixCam, tavern, LI_TABLE, DRINKER_PEOPLE, type St } from "./lb";
import { whisperLean } from "../whisper";
import { DRINK } from "../drunk";
import { KEEPER } from "../people";

const S = SEGMENTS[0], A = BEAT.A, T = LI_TABLE;
const word = (id: string, w: string) => capWord(id, w).from;
const L4 = lineId("A04"), L5 = lineId("A05"), L8 = lineId("A08");

/** his head when seated upright (about) */
const HEAD = rel(T.at, T.facing, 0, 0.98, 0.0);
/** THE CAMERA PLAN (one take, still unless something gives her a reason):
 *    open     from in front of him, him on the centre line (16 Nov), the table filling the
 *             foot of the frame; her breathing only. The knocks: a small jolt each.
 *    月亮      A02: he leans right up to the lens, so she leans in too: the scene's one extreme close (his card freezes
 *             on it).
 *    jar      A04: the jar comes at the lens: she pulls back fast (6 frames) to the open framing.
 *    早酒      A06: snap zoom landing on 早酒, held to her next question.
 *    aside    A09: the whisper (whisper.ts): a small lean in and a tip, he carries on.
 *    card 1   held while he drinks; the last 4 frames whip right (the join). */
const CAM0 = V(T.at.x - 0.2, 1.36, T.at.z + 1.95), CAM_IN = V(T.at.x - 0.06, 1.16, T.at.z + 0.72);
/** CENTRED (Jay, 16 Nov: "the camera is off center from the character, creating that odd feeling"): she stands in
 *  front of him, not half a metre to his side, and he sits on the frame's centre line. The screen x handed to aim() is
 *  where his UPRIGHT SEAT's head point lands; his real head sits a little right of it (his lean), measured with the
 *  head probe: these values put the head itself on x 540. */
const SX_WIDE = 505, SX_CLOSE = 372;

/** the jar: on the table in front of him (hugged), lifted to the lens on A04, back down, up to his mouth on the card */
const JAR_TABLE = T.on(0, 0.1).add(V(0, 0.17 * 0.72, 0));
const JAR_UP = rel(T.at, T.facing, -0.12, 0.72, 0.42);
/** THE DRINK on card 1 (Jay, 16 Nov: "Can we do a drinking animation here"): he swings the jar up to his mouth, its
 *  mouth at his lips and its bottom up to the left, tips his head back, three big gulps (the jar bobs, his head nods
 *  with each), then down with a satisfied ahh. DRINK (drunk.ts): lift, drink, lower (frames into the card) */
const GULP = DRINK.gulp, DRINK_A = -1.95;
const LIPS = HEAD.clone().add(V(0.12, -0.15, 0.3));
const drinkK = (f: number) => { const d = f - A.card[0]; return d < DRINK.up[0] || d > DRINK.down[1] ? 0 : ramp(d, DRINK.up[0], DRINK.up[1]) * (1 - ramp(d, DRINK.down[0], DRINK.down[1])); };
const gulp = (f: number) => { const d = f - A.card[0] - DRINK.up[1]; return d < 0 || d >= DRINK.gulps * GULP ? 0 : Math.max(0, Math.sin((d / GULP) * Math.PI * 2)); };
const jarAt = (f: number) => {
  const up = ramp(f, L4.from - 8, L4.from + 6) * (1 - ramp(f, L5.from + 4, L5.from + 18));
  const k = drinkK(f), e = k * k * (3 - 2 * k), a = DRINK_A * e + 0.07 * gulp(f) * e;
  // the jar's mouth (0.34 up its axis) on his lips: origin = lips - the axis turned by a about z
  const at = LIPS.clone().sub(V(-0.34 * Math.sin(a), 0.34 * Math.cos(a), 0)).add(V(0, 0.012 * gulp(f), 0));
  const p = JAR_TABLE.clone().lerp(JAR_UP, up);
  return { p: e > 0 ? p.lerp(at, e).add(V(0, 0.05 * Math.sin(Math.PI * Math.min(1, e * 1.6)), 0)) : p, rot: (e > 0 ? [0, 0, a] : [0, 0, 0]) as [number, number, number], drink: e, held: up > 0 || k > 0 || f < A.wake + 10 };
};

/** WE WALK IN (Jay, 15 Nov: "intro can be us going into the tavern"): REC comes on at the tavern's door curtain (hud/curtain.tsx;
 *  the doorway in the right wall), it parts and she walks in between the tables to him, the title over it, and stops at his table just before the
 *  knocks. The 1.6 s it takes were added in front of the voice (voice_timing_v6: every line 48 frames later). */
const DOOR = V(RX + 3.25, 1.5, 0.85), GO = 10, ARRIVE = A.knock[0] - 4;
const cam = (f: number): CamPose => {
  const wide0 = aim(CAM0, HEAD.clone().add(V(0, -0.1, 0)), 860, SX_WIDE);
  // she stands at the door curtain (hud/curtain.tsx) until it parts, then walks: a steady pace, eased at both ends
  const u = Math.min(1, Math.max(0, (f - GO) / (ARRIVE - GO))), walkK = 0.5 * (u + u * u * (3 - 2 * u));
  const wide = f < ARRIVE ? mixCam(aim(DOOR, V(T.at.x, 1.05, T.at.z + 0.55), 900, 560), wide0, walkK) : wide0;
  const close = aim(CAM_IN, HEAD.clone().add(V(0, -0.06, 0)), 800, SX_CLOSE);
  const inK = ramp(f, A.lean - 6, A.lean + 12) * (1 - ramp(f, L4.from - 9, L4.from - 3));
  let c = mixCam(wide, close, inK);
  c = C.handheld(c, f, { mood: "calm", amp: 0.7, walk: [[GO - 4, 0], [GO + 6, 1], [ARRIVE - 12, 1], [ARRIVE, 0]] });
  for (const k of A.knock) c = C.jolt(c, f, k, { len: 4, amp: 0.7 });
  c = C.snap(c, f, word("A06", "早酒"), lineId("A07").from);
  return whisperLean(f, c, { at: HEAD });
};

const li = (w: World, f: number): St => {
  const t = f / FPS, asleep = f < A.wake;
  const wakeK = ramp(f, A.wake - 2, A.wake + 10);
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "sleep"], [A.wake, "dazed"], [A.wake + 22, "smile"], [A.lean, "happy"], [lineId("A03").from + 8, "shock"], [lineId("A03").to - 10, "grin"], [L4.from, "laugh"], [L5.from + 10, "smile"], [A.proud, "smug"], [lineId("A07").from, "happy"], [A.shrug, "grin"], [A.card[0], "happy"], [A.card[0] + DRINK.up[1] - 4, "smile_closed"], [A.card[0] + DRINK.down[0] + 4, "laugh"], [A.card[0] + DRINK.down[1] + 4, "happy"]]);
  const J = jarAt(f);
  const jar = held("jar", J.p, { rot: J.rot });
  // the hands: hugging the jar / holding it up; A08 counting (right hand up), 一日 shrug (both out)
  let hands: St["hands"] = J.held ? jar.hands : [null, null];
  if (f >= L8.from && f < A.shrug) hands = [rel(T.at, T.facing, -0.26, 0.88, 0.3), jar.hands[1]];
  if (f >= A.shrug && f < L8.to + 18) { const k = ramp(f, A.shrug, A.shrug + 6); hands = [rel(T.at, T.facing, -0.18 - 0.14 * k, 0.75 + 0.08 * k, 0.22), rel(T.at, T.facing, 0.18 + 0.14 * k, 0.75 + 0.08 * k, 0.22)]; }
  const mouth = says("li", ["A02", "A04", "A06", "A08"], f, 2);
  const head = heads(
    asleep ? { dy: -0.45 } : undefined, mouth.head,
    f >= A.wake ? accent("jolt", f, A.wake) : undefined, accent("lean", f, A.lean, { dur: 0.9, dir: 1 }),
    accent("laugh", f, L4.from, { dur: 0.8 }), headPop(f, A.proud), f >= A.proud && f < lineId("A07").from ? { tilt: 8 } : undefined,
    f >= A.shrug && f < L8.to + 18 ? { tilt: -6 } : undefined, J.drink ? { tilt: -9 * J.drink, dy: -0.012 * gulp(f) } : undefined, f >= A.knock[0] && f < A.wake ? accent("jolt", f, A.knock[1], { amp: 0.4 }) : undefined,
  );
  return {
    at: T.at.clone(), facing: T.facing, seat: T.seat, pose: { kind: "sit", t }, hands, expr, visible: true,
    // asleep he slumps forward over the jar on the table (the posture patch), then sits back up into his own lean
    lean: { pitch: 26 * (1 - wakeK) - 5 * wakeK - 7 * J.drink, roll: 3 },
    lookDown: asleep ? 38 : 38 * (1 - wakeK) - 14 * J.drink, blink: asleep ? 1 : mouth.blink ?? lid(t, 2, [A.wake / FPS]),
    mouth: mouth.mouth, head, gaze: 0, armFront: J.held ? [true, true] : undefined,
  };
};

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit(w) { DRINKER_PEOPLE.forEach((p) => w.actor(p).set({ visible: false })); w.actor(KEEPER).set({ visible: false }); },
  pose(w, f) {
    w.setPlace("tavern");
    w.set.param("sun", 0.55);
    let camera = cam(f);
    const W = C.whip(camera, f, A.whip, { dir: 1, out: 4, in: 0 });
    camera = W.cam;
    w.setCamera(camera);
    tavern(w, f, { drinkers: 2, sleepers: true, lamps: 0 });
    w.actor(LI).set(li(w, f));
    w.update();
    // the table jumps on each knock (1 cm, 2 frames)
    const jump = A.knock.some((k) => f >= k && f < k + 2) ? 0.012 : 0;
    w.prop("desk").put(T.at0.clone().add(V(0, jump, 0)), { rot: T.rot });
    const J = jarAt(f);
    held("jar", J.p.clone().add(V(0, jump, 0)), { rot: J.rot }).put(w);
    return { camera, post: W.post, overlays: C.whipSmear(W.smear, 1) ?? transitionAt(f)?.node, slate: "A tavern morning" };
  },
};
void speak; void quote; void ky; void THREE;

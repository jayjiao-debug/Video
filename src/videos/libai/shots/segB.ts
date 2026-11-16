// SEGMENT B, lines B10-B18: 辰时, outside the tavern (Su's market street as 长安's). beats.ts BEAT.B.
//   land    B10       the whip lands on him on a bench at the tavern's door (the 酒 flag beside him), cup in hand.
//   proud   B11       翰林待诏！ he sits up, proud.            deflate B13: 就是……等皇上叫 (a sigh, the head drops)
//   cup     B15       所以我在这儿等: the cup goes up.
//   run     B15-B16   the messenger eunuch runs in down the street, stops beside him: 李翰林！陛下在沉香亭……
//   rise    B17       好，走！ he gets to his feet ... teeters ... drops back onto the bench (B18: 他站不起来了！)
//   splash  B18 after a second eunuch with a basin: water in his face; he blinks, dripping, and grins. Card 2.
//   fade    the last frames fade through warm cream (the HUD's TRANSITIONS).
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI, HUAN, DAGE } from "../people";
import { MX } from "../layout";
import { benchSeat, FOOT_LIFT } from "../props";
import { transitionAt } from "../hud";
import type { World } from "../world";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, walkAlong, seated } from "./common";
import { aim, ramp, held, mixCam, type St } from "./lb";
import { clamp01 } from "../story";
import { setSeat } from "../../../kit/acc/garb";
import { trackHead } from "../track";

const S = SEGMENTS[1], B = BEAT.B;
const word = (id: string, w: string) => capWord(id, w).from;
const L16 = lineId("B16"), L17 = lineId("B17");

/** the bench at the tavern's door (along z, the sitter faces -x, toward the street), him on its middle */
const BENCH = V(MX + 2.15, 0, 4.4), BROT = -Math.PI / 2;
const SEAT = benchSeat(BENCH.clone().setY(-FOOT_LIFT.bench), BROT, 0);
const TA = { top: SEAT.seat.top, floor: 0, back: 0.03, facing: SEAT.facing };
const FLAG = V(MX + 2.3, 0, 3.15);
/** the tops of the bun stall's steamer stacks (the market set's; measured by a raycast on picture 1100) */
const STEAMERS = [V(MX + 3.04, 1.135, 3.75), V(MX + 3.04, 1.135, 4.76)];
const HEAD = rel(SEAT.at, SEAT.facing, 0, 1.12, 0);
/** the messenger: runs in from down the street to his left side, facing him */
const HUAN_END = rel(SEAT.at, SEAT.facing, -0.9, 0, 0.4);
const HUAN_PATH = [V(MX - 0.4, 0, -4.5), V(MX + 0.7, 0, 1.6), HUAN_END];
const HUAN_SPEED = 3.0;
const huanGo = B.run[0];
/** the second eunuch with the basin: walks in behind the first during B17, splashes from in front of him */
const BASIN_END = rel(SEAT.at, SEAT.facing, 0.85, 0, 0.42);
const BASIN_PATH = [V(MX - 0.6, 0, 10.5), V(MX + 0.7, 0, 7.0), BASIN_END];
const basinGo = L17.from - 70;
/** 大哥 (the account's cameo; Jay, 15 Nov: "Tavern door, 0:45"): behind the cloth stall's counter next door, by the
 *  wine flag's pole, a finger to his lips. The pan to the messenger finds him; at the messenger's 李翰林！ he ducks
 *  behind the counter and is gone before the messenger runs in (on screen about 1.3 s, the left edge of the frame).
 *  He faces the street (the 0.25 m between the counter's back and the shop front is all the room there is) and the
 *  camera sees him from his left: the default hand (dage.ts). */
const DG = { at: V(MX + 3.42, 0, 2.6), facing: -Math.PI / 2 + 0.12, from: B.run[0] - 6, duck: L16.from + 6, down: 6 };
const dageAt = (f: number) => {
  const k = clamp01((f - DG.duck) / DG.down);
  return DG.at.clone().setY(-0.9 * k * k);
};
/** THE CAMERA PLAN (one take):
 *    open     the whip lands on him on the bench, a little from below (he is about to boast), him on the centre line
 *             (Jay, 16 Nov: "the camera is off center from the character"): she stands in front of him
 *    翰林待诏  B11: snap zoom landing on the title, held through her question
 *    run      the messenger runs in from the street: she pans left to meet him (大哥 at the frame's left edge), then
 *             steps back and to the side as he arrives so BOTH men stand inside the frame (before, the two faces were
 *             cut by its two edges), and back to 李白 when he answers
 *    splash   the second eunuch lifts the basin: she steps back (the place does something to him), the water hits
 *             (a jolt), then a snap in on his dripping grin
 *    card 2   held; the scene ends on the clock race (the join to C) */
const CAM0 = rel(SEAT.at, SEAT.facing, 0.1, 1.24, 2.05);
/** the aim's screen x that puts his HEAD on the centre line (measured with the head probe) */
const SX = 498;
/** the two-shot when the messenger has arrived: from further back, between the two men */
const CAM_PAIR = rel(SEAT.at, SEAT.facing, -0.4, 1.3, 2.95), PAIR_MID = rel(SEAT.at, SEAT.facing, -0.47, 1.22, 0.2);
/** the messenger is at his mark 8.37 m of path later (HUAN_SPEED) */
const HUAN_ARRIVE = huanGo + Math.round((8.37 / HUAN_SPEED) * FPS);

/** the pan to the street (deg): 大哥 lands at the frame's left edge, as before */
const PAN = 15.8;
const cam = (f: number): CamPose => {
  let c = aim(CAM0, HEAD.clone().add(V(0, -0.38, 0)), 1010, SX);
  // the run: a pan left to meet the messenger, then back when 李白 answers
  const back17 = 1 - ramp(f, L17.from - 16, L17.from - 2);
  const k = ramp(f, B.run[0] - 4, B.run[0] + 12) * back17;
  if (k) c = C.nudge(c, { yaw: -PAN * k });
  const pair = ramp(f, HUAN_ARRIVE - 34, HUAN_ARRIVE - 8) * back17;
  if (pair) c = mixCam(c, aim(CAM_PAIR, PAIR_MID, 640, 540), pair);
  // the splash: she steps back as the basin comes up, then pushes in again on the grin
  const back = ramp(f, B.splash - 18, B.splash - 6) * (1 - ramp(f, B.drip - 6, B.drip + 4));
  if (back) c = C.nudge(c, { fwd: -0.7 * back });
  c = C.handheld(c, f, { mood: f >= B.splash - 4 && f < B.drip ? "excited" : "calm", amp: 0.7 });
  c = C.jolt(c, f, UP.land, { len: 5, amp: 0.7 });       // he drops back onto the bench
  c = C.jolt(c, f, B.splash, { len: 7, amp: 1.6 });
  c = C.snap(c, f, B.proud, lineId("B12").from + 6);
  c = C.snap(c, f, B.drip, undefined, { k: 0.74, len: 6 });
  return c;
};

/** THE ATTEMPT TO STAND (B17 好，走！; Jay, 15 Nov: "his movements when he was trying to get up off the bench is not
 *  emphasised"): 好 he rocks forward to get going, 走 he shoves himself up, nearly standing, arms flung out for balance,
 *  teeters forward and back and side to side ... and drops back onto the bench with a bump (her 他站不起来了！ after it). */
const UP = { gather: B.rise - 2, push: B.rise + 9, top: B.rise + 19, fall: B.sitBack, land: B.sitBack + 5 };
/** HE GETS TO HIS FEET (Jay, 15 Nov: "his clothing clipping"): the old half rise lifted the SITTING figure off the
 *  bench: its feet left the ground and its shins came through the robe. Now he really stands: two frames of the lift,
 *  then a standing figure on its own feet in front of the bench (STAND_AT), teetering, and back onto the bench. */
const STAND = { on: UP.push + 2, off: UP.fall + 3 };
const STAND_AT = rel(SEAT.at, SEAT.facing, 0, 0, 0.38).setY(0);
const isUp = (f: number) => f >= STAND.on && f < STAND.off;
/** the seat's lift on the frames into and out of standing (0..1 of the way to standing hip height) */
const riseAt = (f: number) => (f >= UP.push && f < STAND.on ? 0.22 * (f - UP.push + 1) : f >= STAND.off && f < UP.land ? 0.3 * (1 - (f - STAND.off + 1) / (UP.land - STAND.off + 1)) : 0);
/** how far he is up, 0..1, for the hands (they go out for balance) */
const upK = (f: number) => ramp(f, UP.push, STAND.on + 2) * (1 - ramp(f, STAND.off - 1, UP.land));
/** the teeter: big as he gets up and dying away a little; 0 outside the attempt */
const teeter = (f: number) => (isUp(f) ? 1 - 0.4 * clamp01((f - STAND.on) / (STAND.off - STAND.on)) : 0);
export const LI_LANDS = UP.land;
const cupAt = (f: number) => {
  const up = ramp(f, B.cup, B.cup + 8) * (1 - ramp(f, lineId("B15").to + 10, lineId("B15").to + 22));
  const rest = rel(SEAT.at, SEAT.facing, -0.17, 0.82 + 0.25 * up, 0.24 + 0.05 * up);
  // the attempt: the cup hand flies out to his right for balance (and comes back as he lands)
  const out = ramp(f, UP.push - 2, UP.top - 2) * (1 - ramp(f, UP.fall + 1, UP.land + 6));
  return out ? rest.lerp(rel(SEAT.at, SEAT.facing, -0.52, 1.0 + 0.2 * upK(f) + 0.07 * Math.sin(f * 0.9) * teeter(f), 0.2 + 0.36 * upK(f)), out) : rest;
};
const freeHand = (f: number) => {
  const out = ramp(f, UP.push - 2, UP.top - 2) * (1 - ramp(f, UP.fall + 1, UP.land + 6));
  if (out) return rel(SEAT.at, SEAT.facing, 0.52, 1.0 + 0.2 * upK(f) - 0.07 * Math.sin(f * 0.9) * teeter(f), 0.2 + 0.36 * upK(f));
  // 翰林待诏！ he taps his own chest with it, proud (and lets it drop as the title sinks in)
  const proud = ramp(f, B.proud - 3, B.proud + 5) * (1 - ramp(f, lineId("B11").to + 6, lineId("B11").to + 16));
  if (proud) return rel(SEAT.at, SEAT.facing, 0.06, 0.78 + 0.012 * Math.sin(f * 1.1), 0.17);
  return null;
};

const li = (f: number): St => {
  const t = f / FPS;
  const rise = riseAt(f), tt = teeter(f);
  const wob = tt ? Math.sin((f - STAND.on) * 0.5) * 0.2 * tt : 0, up = isUp(f);
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "happy"], [B.proud, "smug"], [B.deflate, "sigh"], [lineId("B14").from + 10, "deadpan"], [B.cup, "grin"], [L16.from, "shock"], [L16.from + 30, "happy"], [B.rise, "grin"], [B.sitBack, "dazed"], [B.splash, "wince"], [B.drip, "laugh"], [B.drip + 30, "happy"]]);
  const mouth = says("li", ["B11", "B13", "B15", "B17"], f, 3);
  const head = heads(mouth.head, headPop(f, B.proud), f >= B.deflate && f < lineId("B14").from ? { dy: -0.1 } : undefined,
    accent("jolt", f, L16.from, { amp: 0.8 }), wob ? { tilt: -wob * 40 } : undefined, accent("squash", f, UP.land, { amp: 1.6 }), accent("shake", f, B.splash + 2, { amp: 1.2 }), accent("laugh", f, B.drip, { dur: 1.0 }));
  const lookAtHuan = f >= L16.from - 10 && f < B.splash;
  return {
    ...(up ? { at: STAND_AT.clone(), pose: { kind: "idle" as const, t } } : seated(TA, t, { rise, hipY: 0.62 })), facing: SEAT.facing + (lookAtHuan ? -0.45 : 0) + wob,
    hands: [cupAt(f), freeHand(f)], expr, mouth: mouth.mouth, head, visible: true,
    // 好: rocks forward to get going; up: teeters forward and back, side to side; the bump: thrown back as he lands
    lean: f >= UP.gather && f < UP.land + 14 ? {
      // seated: he rocks forward; up: he lurches up bent forward, straightens, teeters, tips back; the bump: thrown back
      pitch: up ? 16 * (1 - ramp(f, STAND.on, STAND.on + 5)) + 11 * tt * Math.sin((f - STAND.on) * 0.36) - 24 * ramp(f, STAND.off - 4, STAND.off)
        : -5 + 22 * ramp(f, UP.gather, UP.push) * (f < STAND.on ? 1 : 0) - 12 * ramp(f, STAND.off - 1, UP.land) * (1 - ramp(f, UP.land + 2, UP.land + 14)),
      roll: 3 + 13 * tt * Math.sin((f - STAND.on) * 0.47 + 0.6),
    } : undefined,
    blink: f >= B.splash && f < B.drip ? 1 : mouth.blink ?? lid(t, 2), gaze: lookAtHuan ? -1 : 0,
  };
};

export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit(w) { setSeat(w.actor(LI), null); w.actor(HUAN).set({ visible: false }); w.actor(HUAN, "2").set({ visible: false }); w.actor(DAGE).set({ visible: false }); },
  pose(w, f) {
    w.setPlace("street");
    w.set.param("carcass", false);
    w.set.param("crowd", 0.7);
    // the join from A: the first 4 frames whip in
    const W = C.whip(cam(f), f, S.from - 4, { dir: 1, out: 4, in: 4 });
    const camera = W.cam;
    w.setCamera(camera);
    w.prop("bench").put(BENCH.clone().setY(-FOOT_LIFT.bench), { rot: BROT });
    w.prop("flag").put(FLAG);
    w.prop("jar", "door0").put(V(MX + 2.3, 0, 5.35), { scale: 1.1 });
    w.prop("jar", "door1").put(V(MX + 2.55, 0, 5.75), { scale: 1.0, rot: 0.6 });
    // thin steam off the bun stall's two steamer stacks behind him (Jay, 16 Nov), each on its own clock
    STEAMERS.forEach((p, i) => w.prop("steam", `s${i}`).put(p, { t: f / FPS + i * 1.3, open: 1 }));
    const t = f / FPS;
    setSeat(w.actor(LI), SEAT.seat, SEAT.facing);
    w.actor(LI).set(li(f));
    // the messenger
    const hl = walkAlong(HUAN_PATH, HUAN_SPEED, (f - huanGo) / FPS, { endFacing: yawTo(HUAN_END, SEAT.at) });
    const hm = says("huan", ["B16"], f, 5);
    w.actor(HUAN).set({ at: hl.at, facing: hl.facing, pose: hl.pose, visible: f >= huanGo - 30, expr: f < L16.to ? "nervous" : f < B.splash ? "shock" : "deadpan", mouth: hm.mouth, head: hm.head, blink: hm.blink ?? lid(t, 5) });
    // the basin eunuch
    const bl = walkAlong(BASIN_PATH, 1.4, (f - basinGo) / FPS, { endFacing: yawTo(BASIN_END, SEAT.at) });
    const B2 = w.actor(HUAN, "2");
    const back = ramp(f, B.splash + 18, B.splash + 32);
    const tip = ramp(f, B.splash - 6, B.splash + 3) * (1 - back);
    const lift = ramp(f, B.splash - 22, B.splash - 8) * (1 - back);
    const basinAt = rel(bl.at, bl.facing, 0, 0.62 + 0.38 * lift, 0.3 + 0.08 * lift);
    const brot = bl.facing;
    const bh = held("basin", basinAt, { rot: brot, open: tip });
    B2.set({ at: bl.at, facing: bl.facing, pose: bl.pose, hands: bh.hands, visible: f >= basinGo - 10, expr: f < B.splash ? "focus" : "grin", blink: lid(t, 7) });
    // 大哥
    const dg = f >= DG.from && f < DG.duck + DG.down + 1;
    w.actor(DAGE).set(dg ? { at: dageAt(f), facing: DG.facing, pose: { kind: "shh", t }, expr: "hush", blink: lid(t, 9), visible: true } : { visible: false });
    w.update();
    trackHead(w, "huan", w.actor(HUAN), f);
    // the bowl goes where his hand got to (flung out for balance, the hand can fall short of the target)
    w.prop("wineBowl").put(w.actor(LI).handWorld(0), { grip: "hilt" });
    if (f >= basinGo - 10) bh.put(w);
    const sp = (f - B.splash + 2) / 14;
    if (sp > 0 && sp < 1) w.prop("splash").put(rel(bl.at, bl.facing, 0, 1.05, 0.45), { rot: bl.facing, open: sp });
    return { camera, post: W.post, overlays: C.whipSmear(W.smear, 1) ?? transitionAt(f)?.node, slate: "B tavern door" };
  },
};
void word; void THREE;

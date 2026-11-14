// SEGMENT B, lines B10-B18: 辰时, outside the tavern (Su's market street as 长安's). beats.ts BEAT.B.
//   land    B10       the whip lands on him on a bench at the tavern's door (the 酒 flag beside him), cup in hand.
//   proud   B11       翰林待诏！ he sits up, proud.            deflate B13: 就是……等皇上叫 (a sigh, the head drops)
//   cup     B15       所以我在这儿等: the cup goes up.
//   run     B15-B16   the messenger eunuch runs in down the street, stops beside him: 李翰林！陛下在沉香亭……
//   rise    B17       好，走！ he rises halfway ... wobbles ... sits back down (B18: 他站不起来了！)
//   splash  B18 after a second eunuch with a basin: water in his face; he blinks, dripping, and grins. Card 2.
//   fade    the last frames fade through warm cream (the HUD's TRANSITIONS).
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI, HUAN } from "../people";
import { MX } from "../layout";
import { benchSeat, FOOT_LIFT } from "../props";
import { transitionAt } from "../hud";
import type { World } from "../world";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, walkAlong, seated } from "./common";
import { aim, ramp, held, type St } from "./lb";
import { setSeat } from "../../../kit/acc/garb";

const S = SEGMENTS[1], B = BEAT.B;
const word = (id: string, w: string) => capWord(id, w).from;
const L16 = lineId("B16"), L17 = lineId("B17");

/** the bench at the tavern's door (along z, the sitter faces -x, toward the street), him on its middle */
const BENCH = V(MX + 2.15, 0, 4.4), BROT = -Math.PI / 2;
const SEAT = benchSeat(BENCH.clone().setY(-FOOT_LIFT.bench), BROT, 0);
const TA = { top: SEAT.seat.top, floor: 0, back: 0.03, facing: SEAT.facing };
const FLAG = V(MX + 2.3, 0, 3.15);
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
const CAM0 = rel(SEAT.at, SEAT.facing, 0.2, 1.45, 3.7);

const cam = (f: number): CamPose => {
  const look = HEAD.clone().add(V(0, -0.2, 0));
  let c = aim(CAM0, look, 700);
  // the run: a small pan left to meet the messenger, then back
  const k = ramp(f, B.run[0] - 6, B.run[0] + 14) * (1 - ramp(f, L16.from + 20, L16.from + 44));
  if (k) c = C.nudge(c, { yaw: -8 * k });
  c = C.handheld(c, f, { mood: f >= B.splash - 4 && f < B.drip ? "excited" : "calm" });
  c = C.punchIn(c, f, B.proud, { k: 0.9, len: 4, off: B.proud + 24 });
  c = C.punchIn(c, f, B.drip, { k: 0.86, len: 6 });
  return C.whip(c, f, S.from - 4, { dir: 1, out: 4, in: 4 }).cam;
};

const cupAt = (f: number) => {
  const up = ramp(f, B.cup, B.cup + 8) * (1 - ramp(f, lineId("B15").to + 10, lineId("B15").to + 22));
  return rel(SEAT.at, SEAT.facing, -0.17, 0.82 + 0.25 * up, 0.24 + 0.05 * up);
};

const li = (f: number): St => {
  const t = f / FPS;
  // the rise and the fall back
  const rise = ramp(f, B.rise, B.rise + 10) * 0.55 * (1 - ramp(f, B.sitBack - 4, B.sitBack + 4));
  const wob = f > B.rise + 8 && f < B.sitBack ? Math.sin((f - B.rise) * 0.55) * 0.18 : 0;
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "happy"], [B.proud, "smug"], [B.deflate, "sigh"], [lineId("B14").from + 10, "deadpan"], [B.cup, "grin"], [L16.from, "shock"], [L16.from + 30, "happy"], [B.rise, "grin"], [B.sitBack, "dazed"], [B.splash, "wince"], [B.drip, "laugh"], [B.drip + 30, "happy"]]);
  const mouth = says("li", ["B11", "B13", "B15", "B17"], f, 3);
  const head = heads(mouth.head, headPop(f, B.proud), f >= B.deflate && f < lineId("B14").from ? { dy: -0.1 } : undefined,
    accent("jolt", f, L16.from, { amp: 0.8 }), wob ? { tilt: wob * 30 } : undefined, accent("shake", f, B.splash + 2, { amp: 1.2 }), accent("laugh", f, B.drip, { dur: 1.0 }));
  const lookAtHuan = f >= L16.from - 10 && f < B.splash;
  return {
    ...seated(TA, t, { rise, hipY: 0.62 }), facing: SEAT.facing + (lookAtHuan ? -0.45 : 0) + wob,
    hands: [cupAt(f), null], expr, mouth: mouth.mouth, head, visible: true,
    blink: f >= B.splash && f < B.drip ? 1 : mouth.blink ?? lid(t, 2), gaze: lookAtHuan ? -1 : 0,
  };
};

export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit(w) { setSeat(w.actor(LI), null); w.actor(HUAN).set({ visible: false }); w.actor(HUAN, "2").set({ visible: false }); },
  pose(w, f) {
    w.setPlace("street");
    w.set.param("carcass", false);
    w.set.param("crowd", 0.7);
    const camera = cam(f);
    w.setCamera(camera);
    w.prop("bench").put(BENCH.clone().setY(-FOOT_LIFT.bench), { rot: BROT });
    w.prop("flag").put(FLAG);
    w.prop("jar", "door0").put(V(MX + 2.3, 0, 5.35), { scale: 1.1 });
    w.prop("jar", "door1").put(V(MX + 2.55, 0, 5.75), { scale: 1.0, rot: 0.6 });
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
    w.update();
    w.prop("wineBowl").put(cupAt(f), { grip: "hilt" });
    if (f >= basinGo - 10) bh.put(w);
    const sp = (f - B.splash + 2) / 14;
    if (sp > 0 && sp < 1) w.prop("splash").put(rel(bl.at, bl.facing, 0, 1.05, 0.45), { rot: bl.facing, open: sp });
    return { camera, overlays: transitionAt(f)?.node, slate: "B tavern door" };
  },
};
void word; void THREE;

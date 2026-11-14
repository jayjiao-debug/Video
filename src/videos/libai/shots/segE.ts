// SEGMENT E, lines E28-E33: 酉时, the tavern in the evening. beats.ts BEAT.E.
//   pour    E28     今天我请！ he tips the chest of gold out on his table; the drinkers cheer.
//   aside   E29     一个下午，花得差不多了: the camera goes down to the table: a few coins left.
//   poem    E31     三百六十日，日日醉如泥: proud of it.        aside2 E32: the camera turns away to the jars.
//   leave   E33     太白兄，我先回了啊！ his friend gets up and goes; the room is empty, the lamps go out. Fade to blue.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI_RED, YOU } from "../people";
import { RX, ROOM } from "../layout";
import { transitionAt } from "../hud";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, walkAlong, standing } from "./common";
import { aim, ramp, held, tavern, LI_TABLE, DRINKER_PEOPLE, atTable, type St } from "./lb";
import { KEEPER } from "../people";

const S = SEGMENTS[4], E = BEAT.E, T = LI_TABLE;
const L28 = lineId("E28"), L33 = lineId("E33");
const HEAD = rel(T.at, T.facing, 0, 0.98, 0);
const CAM0 = V(T.at.x - 0.55, 1.45, T.at.z + 2.9);
const JARS = V(RX - 2.4, 0.9, -2.9);
/** the friend sits at his left, on a cushion of his own */
const YOU_SEAT = { ...T, at: rel(T.at, T.facing, 0.8, 0, -0.05), seat: { ...T.seat, top: rel(T.seat.top, T.facing, 0.8, 0, -0.05) }, facing: T.facing - 0.7 } as typeof T;
const DOOR = ROOM.door;
const YOU_OUT = [YOU_SEAT.at.clone().add(V(0.25, 0, 0.45)), V(RX + 2.2, 0, 0.6), DOOR, DOOR.clone().add(V(1.0, 0, 0))];
const youGo = L33.to + 6;
const crowdGone = E.aside2 + 20;
const lampsOut = [youGo + 40, youGo + 62];

const cam = (f: number): CamPose => {
  let c = aim(CAM0, HEAD.clone().add(V(0.25, -0.15, 0)), 740);
  c = C.handheld(c, f, { mood: f >= E.cheer - 4 && f < E.aside ? "excited" : "calm" });
  c = C.tiltDown(c, f, E.aside, lineId("E29").to + 4, T.on(0, 0.1), { len: 10 });
  c = C.aside(c, f, E.aside2, lineId("E32").to + 8, JARS, { len: 10 });
  if (f >= youGo) c = C.nudge(c, { yaw: 14 * ramp(f, youGo, youGo + 30) * (1 - ramp(f, youGo + 50, youGo + 75)) });
  return c;
};

export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit(w) { DRINKER_PEOPLE.forEach((p) => w.actor(p).set({ visible: false })); w.actor(KEEPER).set({ visible: false }); w.actor(YOU).set({ visible: false }); },
  pose(w, f) {
    w.setPlace("tavern");
    w.set.param("sun", 0.12);
    const camera = cam(f);
    w.setCamera(camera);
    const t = f / FPS;
    const lit = f < lampsOut[0] ? 1 : f < lampsOut[1] ? 0.6 : 0;
    const cheer = f >= E.cheer - 4 && f < E.cheer + 40;
    tavern(w, f, {
      drinkers: f < crowdGone ? 4 : 0, keeper: f < crowdGone, lamps: lit,
      drinker: (k, s) => (cheer ? { ...s, pose: { kind: "cheer", t: t + k * 0.2 }, expr: "laugh" } : { ...s, expr: k % 2 ? "laugh" : "happy" }),
    });
    // 李白, red-cheeked
    const expr = at<NonNullable<St["expr"]>>(f, [[0, "grin"], [L28.from, "laugh"], [E.aside, "happy"], [lineId("E30").from, "smile"], [lineId("E31").from, "happy"], [E.poem, "smug"], [E.aside2, "smile_closed"], [L33.from, "smile"], [youGo + 20, "sigh"], [lampsOut[1], "smile_closed"]]);
    const m = says("li", ["E28", "E31"], f, 2);
    const pour = ramp(f, E.pour, E.pour + 14);
    const chestP = T.on(-0.05, 0.12).add(V(0, 0.08 + 0.18 * (1 - ramp(f, E.pour + 14, E.pour + 30)) * (f >= E.pour - 10 ? 1 : 0), 0));
    const holding = f < E.pour + 20;
    const hc = held("chest", chestP, { rot: [-1.6 * pour, 0, 0], open: Math.max(pour, ramp(f, S.from, S.from + 1)) });
    w.actor(LI_RED).set({
      ...atTable(T, f, 1, {}), expr, mouth: m.mouth, blink: m.blink ?? lid(t, 2), hands: holding ? hc.hands : [null, null],
      head: heads(m.head, accent("laugh", f, L28.from, { dur: 0.8 }), headPop(f, E.poem), f >= E.poem && f < E.aside2 ? { tilt: 8 } : undefined, f >= youGo + 20 ? { dy: -0.06 } : undefined),
      gaze: f >= L33.from - 6 && f < youGo + 60 ? 1 : 0,
    });
    // the friend
    const ym = says("you", ["E33"], f, 6);
    const yl = walkAlong(YOU_OUT, 1.3, (f - youGo) / FPS);
    const y = w.actor(YOU);
    if (f < youGo) y.set({ ...atTable(YOU_SEAT, f, 6, {}), expr: f < L33.from ? "laugh" : "grin", mouth: ym.mouth, head: ym.head, blink: ym.blink ?? lid(t, 6), pose: cheer ? { kind: "cheer", t } : { kind: "sit", t } });
    else y.set({ ...standing(yl.at, yl.facing, f, 6), seat: undefined, pose: yl.pose, expr: "happy", visible: !yl.arrived, turn: yl.moving ? undefined : 0 });
    w.update();
    w.prop("cushion", "you").put(YOU_SEAT.at, { rot: YOU_SEAT.facing });
    if (f < E.pour + 40) hc.put(w);
    else w.prop("chest").put(T.on(0.38, -0.08), { rot: 0.5, open: 1, scale: 1 });
    // the heap: all of it on the pour, a few coins by E29
    const left = f < E.pour + 6 ? 0 : 1 - 0.85 * ramp(f, E.cheer + 30, E.aside);
    if (left > 0) w.prop("goldPile").put(T.on(-0.05, 0.12), { open: left });
    w.prop("wineBowl").put(T.on(0.22, 0.18));
    void yawTo; void THREE;
    return { camera, overlays: transitionAt(f)?.node, slate: "E tavern evening" };
  },
};

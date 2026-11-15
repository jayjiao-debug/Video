// SEGMENT E, lines E28-E33: 酉时, the tavern in the evening. beats.ts BEAT.E.
//   pour    E28     今天我请！ he tips the chest of gold out on his table; the drinkers cheer.
//   aside   E29     一个下午，花得差不多了: her whisper (whisper.ts); a few coins left on the table in front of him.
//   poem    E31     三百六十日，日日醉如泥: proud of it.        aside2 E32: her whisper.
//   leave   E33     太白兄，我先回了啊！ his friend gets up and goes; the room is empty, the lamps go out; the last lamp matches to F's moon.
import * as THREE from "three";
import { trackHead } from "../track";
import { SEGMENTS, FPS, lineId, capWord, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI_RED, YOU } from "../people";
import { RX, ROOM } from "../layout";
import { transitionAt } from "../hud";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, walkAlong, standing, kneel } from "./common";
import { aim, ramp, held, mixCam, tavern, LI_TABLE, DRINKER_PEOPLE, atTable, type St } from "./lb";
import { whisperLean } from "../whisper";
import { KEEPER } from "../people";

const S = SEGMENTS[4], E = BEAT.E, T = LI_TABLE;
const L28 = lineId("E28"), L33 = lineId("E33");
const HEAD = rel(T.at, T.facing, 0, 0.98, 0);
/** THE CAMERA PLAN (one take):
 *    open     the full tavern at evening, him at his table right of centre, the gold coming out of the chest
 *    今天我请  E28: snap zoom landing on 我请, held through the cheer
 *    E29      her whisper (the gold heap on the table in front of him, nearly gone)
 *    E31      三百六十日: snap zoom landing on 三百, held to her question; E32 her whisper
 *    E33      his friend gets up and goes: she pans with him to the door and back
 *    lamps    the lamps go out one by one: she tilts up to the last lamp as it dies; the cut to F matches it to the
 *             moon (the join) */
const CAM0 = V(T.at.x - 0.6, 1.38, T.at.z + 2.3);
/** the friend sits at his left, on a cushion of his own */
const YOU_SEAT = { ...T, at: rel(T.at, T.facing, 0.8, 0, -0.05), seat: { ...T.seat, top: rel(T.seat.top, T.facing, 0.8, 0, -0.05) }, facing: T.facing - 0.7 } as typeof T;
const DOOR = ROOM.door;
const YOU_UP = YOU_SEAT.at.clone().add(V(0.25, 0, 0.45)).setY(0);
const YOU_OUT = [YOU_UP, V(RX + 2.2, 0, 0.6), DOOR, DOOR.clone().add(V(1.0, 0, 0))];
const youGo = L33.to + 6, YOU_RISE = 9;
/** his own moves (Jay, 15 Nov): 谁都别跟我抢！ both arms flung out to the room; 我写诗告诉她了 a hand on his heart */
const WIDE = [capWord("E28", "谁都").from - 3, lineId("E28").to + 14] as const, HEART = [capWord("E31", "我写诗").from - 3, capWord("E31", "三百").from + 4] as const;
const liHands = (f: number): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  const w = ramp(f, WIDE[0], WIDE[0] + 6) * (1 - ramp(f, WIDE[1] - 8, WIDE[1]));
  // from the lap out and up (never past his face): low and close at the start, wide and high at the top
  if (w) { const y = -0.56 + 0.38 * w + 0.015 * Math.sin(f * 0.8), x = 0.2 + 0.36 * w; return [rel(HEAD, T.facing, -x, y, 0.14), rel(HEAD, T.facing, x, y, 0.14)]; }
  const h = ramp(f, HEART[0], HEART[0] + 6) * (1 - ramp(f, HEART[1] - 6, HEART[1]));
  if (h) return [null, rel(HEAD, T.facing, 0.06, -0.36, 0.15)];
  return [null, null];
};
/** THE ROOM EMPTIES, ON FOOT (Jay, 15 Nov: "By 2:02, the character just poof goes into thin air": the four drinkers
 *  and the keeper were switched off under her second whisper). Now the drinkers leave when the gold is spent (her E29:
 *  一个下午，花得差不多了): one after another they get up from their tables, go round behind him and out of the door,
 *  the last one through it before his poem. The keeper stays in his tavern. */
const DOOR_PRE = V(RX + 2.6, 0, 0.45), DOOR_OUT = DOOR.clone().add(V(1.0, 0, 0)), SIDE = V(RX + 2.6, 0, -0.5);
/** the way round behind him: between the cushion of the table behind him and the lamp stand by the screen (the set's
 *  dressing at RX + 2.15, -2.05: a head needs 0.45 m from it), then along the right wall to the door */
const GAP = V(RX + 1.76, 0, -1.82), RIGHT = V(RX + 2.45, 0, -1.15);
/** per drinker (lb.ts DRINKERS' order: 0 and 2 at the far left table, 1 and 3 at the table behind him): the frame he
 *  gets up, where he comes to his feet (`up`: a point, or metres [left, forward] from his seat) and the way to the door */
const GO0 = lineId("E29").from + 5;
const LEAVERS: { go: number; up: THREE.Vector3 | [number, number]; via: THREE.Vector3[] }[] = [
  { go: GO0 + 64, up: [0, -0.42], via: [V(RX - 0.3, 0, -2.98), V(RX + 0.2, 0, -2.88), V(RX + 0.75, 0, -2.5), V(RX + 1.35, 0, -2.45), GAP, RIGHT, SIDE] },
  { go: GO0 + 18, up: [0, -0.42], via: [GAP, RIGHT, SIDE] },
  { go: GO0 + 40, up: V(RX + 0.2, 0, -2.9), via: [V(RX + 0.75, 0, -2.5), V(RX + 1.35, 0, -2.45), GAP, RIGHT, SIDE] },
  { go: GO0, up: [0.3, -0.15], via: [RIGHT, SIDE] },
];
/** getting up from a floor cushion: he shuffles back off it on his knees (SHIFT frames), comes to his feet (RISE), walks */
const SHIFT = 6, RISE = 8, WALK = 1.5;
const getUp = (seatAt: THREE.Vector3, seatF: number, L: { go: number; up: THREE.Vector3 | [number, number]; via: THREE.Vector3[] }, f: number, id: number): St | null => {
  if (f < L.go) return null;
  const up = Array.isArray(L.up) ? rel(seatAt, seatF, L.up[0], 0, L.up[1]).setY(0) : L.up;
  const path = [up, ...L.via, DOOR_PRE, DOOR, DOOR_OUT], d = f - L.go;
  if (d < SHIFT + RISE) {
    // (already a fifth of the way on the first frame: on his knees his head would meet his neighbour's)
    const p = seatAt.clone().setY(0).lerp(up, ramp(d, -1.5, SHIFT)), k = 1 - ramp(d, SHIFT, SHIFT + RISE);
    return { ...standing(p, seatF, f, id), ...kneel(k, p, 12), seat: undefined, expr: "happy" };
  }
  const leg = walkAlong(path, WALK, (d - SHIFT - RISE) / FPS, { startFacing: seatF });
  return { ...standing(leg.at, leg.facing, f, id), seat: undefined, pose: leg.pose, expr: "happy", visible: !leg.arrived };
};
/** the first lamp goes out after the friend has gone; the last one burns low to the cut (it becomes F's moon) */
const lampsOut = [youGo + 30, S.to + 1];

/** the last lamp to go out (lb.ts tavern: lamp1) and where it sits on screen as it dies (the moon sits there when F
 *  opens: shots/segF.ts MOON_SCREEN) */
export const LAST_LAMP = V(RX + 1.25, 2.55, -1.25);
export const LAMP_SCREEN = { sx: 640, sy: 520 };
/** where the lantern's BODY lands with that aim (measured on the still of picture 3745: x 637, film y 570; aim() works on
 *  the 1920 reference, film y + 60): segF puts the moon's disc there */
export const LAMP_BODY = { sx: 637, sy: 630 };
const cam = (f: number): CamPose => {
  let c = aim(CAM0, HEAD.clone().add(V(0.0, -0.12, 0)), 860, 640);
  c = C.snap(c, f, capWord("E28", "我请").from, lineId("E28").to + 24);
  c = C.snap(c, f, E.poem, lineId("E32").from - 4, { k: 0.75 });
  if (f >= youGo) c = C.nudge(c, { yaw: 14 * ramp(f, youGo, youGo + 30) * (1 - ramp(f, youGo + 50, youGo + 75)) });
  const up = ramp(f, youGo + 44, youGo + 66);
  if (up) c = mixCam(c, aim(CAM0, LAST_LAMP, LAMP_SCREEN.sy, LAMP_SCREEN.sx), up);
  c = C.handheld(c, f, { mood: f >= E.cheer - 4 && f < E.cheer + 40 ? "excited" : "calm", amp: f >= youGo ? 0.4 : 0.7 });
  return whisperLean(f, c, { at: HEAD });
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
      drinkers: 4, keeper: true, lamps: lit,
      drinker: (k, s) => getUp(s.at as THREE.Vector3, s.facing as number, LEAVERS[k], f, 10 + k)
        ?? (cheer ? { ...s, pose: { kind: "cheer", t: t + k * 0.2 }, expr: "laugh" } : { ...s, expr: k % 2 ? "laugh" : "happy" }),
    });
    // 李白, red-cheeked
    const expr = at<NonNullable<St["expr"]>>(f, [[0, "grin"], [L28.from, "laugh"], [E.aside, "happy"], [lineId("E30").from, "smile"], [lineId("E31").from, "happy"], [E.poem, "smug"], [E.aside2, "smile_closed"], [L33.from, "smile"], [youGo + 20, "sigh"], [lampsOut[1], "smile_closed"]]);
    const m = says("li", ["E28", "E31"], f, 2);
    const pour = ramp(f, E.pour, E.pour + 14);
    const chestP = T.on(-0.05, 0.22).add(V(0, 0.08 + 0.07 * (1 - ramp(f, E.pour + 14, E.pour + 30)) * (f >= E.pour - 10 ? 1 : 0), 0)); // low and to the front: it must not hide his face
    const holding = f < E.pour + 20;
    const hc = held("chest", chestP, { rot: [-1.6 * pour, 0, 0], open: Math.max(pour, ramp(f, S.from, S.from + 1)) });
    w.actor(LI_RED).set({
      ...atTable(T, f, 1, {}), expr, mouth: m.mouth, blink: m.blink ?? lid(t, 2), hands: holding ? hc.hands : liHands(f),
      head: heads(m.head, accent("laugh", f, L28.from, { dur: 0.8 }), headPop(f, E.poem), f >= E.poem && f < E.aside2 ? { tilt: 8 } : undefined, f >= youGo + 20 ? { dy: -0.06 } : undefined),
      gaze: f >= L33.from - 6 && f < youGo + 60 ? 1 : 0,
    });
    // the friend
    const ym = says("you", ["E33"], f, 6);
    // he comes to his feet beside his cushion, then walks
    const yd = f - youGo, yl = walkAlong(YOU_OUT, 1.3, (yd - YOU_RISE) / FPS, { startFacing: YOU_SEAT.facing });
    const yp = YOU_UP;
    const y = w.actor(YOU);
    if (f < youGo) y.set({ ...atTable(YOU_SEAT, f, 6, {}), expr: f < L33.from ? "laugh" : "grin", mouth: ym.mouth, head: ym.head, blink: ym.blink ?? lid(t, 6), pose: cheer ? { kind: "cheer", t } : { kind: "sit", t } });
    else if (yd < YOU_RISE) y.set({ ...standing(yp, YOU_SEAT.facing, f, 6), ...kneel(1 - ramp(yd, 2, YOU_RISE), yp, 12), seat: undefined, expr: "happy", visible: true });
    else y.set({ ...standing(yl.at, yl.facing, f, 6), seat: undefined, pose: yl.pose, expr: "happy", visible: !yl.arrived, turn: yl.moving ? undefined : 0 });
    w.update();
    trackHead(w, "you", y, f);
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

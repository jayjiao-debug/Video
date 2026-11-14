// SEGMENT D, lines D23-D27: 未时, outside the palace gate (Qin's colonnade with a gate across it). beats.ts BEAT.D.
//   give    D23     the messenger eunuch hands him the little red chest of gold (这是赏的金子).
//   shut    D23 end the eunuch goes back in; the great gate shuts behind 李白.
//   look    D24     he looks down at the chest ...      laugh D25: 有钱了！ he bursts out laughing; 天生我材: the chest up high.
//   stride  D27     喝酒！ he strides off past the lens (screen right). Fade through amber.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI, HUAN } from "../people";
import { CX } from "../layout";
import { transitionAt } from "../hud";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, walkAlong, standing } from "./common";
import { aim, ramp, held, type St } from "./lb";

const S = SEGMENTS[3], D = BEAT.D;
const L23 = lineId("D23");
const GATE = V(CX, 0, -4.3);
const LI_AT = V(CX - 0.1, 0, -2.4);
const HUAN_AT = V(CX + 0.65, 0, -2.75), HUAN_F = yawTo(HUAN_AT, LI_AT) + 0.4;
const HUAN_BACK = [HUAN_AT, V(CX + 0.35, 0, -4.0), V(CX + 0.2, 0, -6.0)];
const CAM0 = V(CX + 0.35, 1.45, 0.75);
/** the stride: from his mark past the lens on its right */
const STRIDE = [LI_AT, V(CX + 0.7, 0, -1.0), V(CX + 1.2, 0, 1.2)];

const cam = (f: number): CamPose => {
  let c = aim(CAM0, LI_AT.clone().add(V(0.15, 1.05, 0)), 720);
  c = C.handheld(c, f, { mood: f >= D.laugh ? "excited" : "calm" });
  c = C.punchIn(c, f, D.hold, { k: 0.88, len: 6, off: lineId("D26").from });
  if (f >= D.stride) c = C.nudge(c, { yaw: 22 * ramp(f, D.stride + 6, D.stride + 30) });
  return c;
};

/** the chest: in the eunuch's hands until the give, then his; up high on 天生 */
const chestAt = (f: number, liAt: THREE.Vector3, liF: number) => {
  const give = ramp(f, D.give - 4, D.give + 8);
  const huanHold = rel(HUAN_AT, HUAN_F, 0, 0.72, 0.3), liHold = rel(liAt, liF, 0, 0.7, 0.32), liHigh = rel(liAt, liF, -0.3, 1.0, 0.34);
  const up = ramp(f, D.hold - 6, D.hold + 6) * (1 - ramp(f, lineId("D25").to, lineId("D25").to + 12));
  return { p: huanHold.lerp(liHold, give).lerp(liHigh, up), open: ramp(f, D.look - 6, D.look + 6), mine: give > 0.5 };
};

export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit(w) { w.actor(HUAN).set({ visible: false }); },
  pose(w, f) {
    w.setPlace("corridor");
    w.set.param("dawn", 0.0);
    const camera = cam(f);
    w.setCamera(camera);
    const t = f / FPS;
    w.prop("gate").put(GATE, { open: 1 - ramp(f, D.shut[0], D.shut[1]) });
    // 李白
    const leg = walkAlong(STRIDE, 1.9, (f - D.stride - 4) / FPS);
    const liF = f < D.stride + 4 ? 0 : leg.facing;
    const ch = chestAt(f, leg.at, liF);
    const expr = at<NonNullable<St["expr"]>>(f, [[0, "neutral"], [D.give, "shock"], [D.shut[0] + 6, "deadpan"], [D.look, "focus"], [D.laugh - 4, "laugh"], [D.hold + 20, "grin"], [lineId("D26").from + 10, "happy"], [D.stride, "laugh"]]);
    const m = says("li", ["D25", "D27"], f, 3);
    const hc = held("chest", ch.p, { rot: liF, open: ch.open });
    w.actor(LI).set({
      ...standing(leg.at, liF, f, 1), pose: leg.pose, expr, mouth: m.mouth, blink: m.blink ?? lid(t, 1),
      head: heads(m.head, accent("jolt", f, D.shut[1] - 2, { amp: 0.6 }), accent("laugh", f, D.laugh, { dur: 1.2 }), headPop(f, D.hold)),
      lookDown: f >= D.look && f < D.laugh ? 22 : 0, hands: ch.mine ? hc.hands : [null, null],
    });
    // the messenger
    const back = walkAlong(HUAN_BACK, 2.0, (f - D.give - 6) / FPS);
    const hm = says("huan", ["D23"], f, 5);
    const hh = held("chest", ch.p, { rot: HUAN_F });
    w.actor(HUAN).set({ ...standing(back.at, f < D.give + 6 ? HUAN_F : back.facing, f, 5), pose: back.pose, expr: "smile", mouth: hm.mouth, head: hm.head, blink: hm.blink ?? lid(t, 5), hands: ch.mine ? [null, null] : hh.hands, visible: f < D.shut[1] });
    w.update();
    hc.put(w);
    return { camera, overlays: transitionAt(f)?.node, slate: "D palace gate" };
  },
};
void L23;

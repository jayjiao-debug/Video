// SCENE G, Saint Helena, about 1820 (G34-G39). A small garden with the sea all round; he waters beans in a straw hat.
// 「我说过吗？」(G35); she asks about France (G36): he turns and looks at the sea for a long time; 「……不可能。」(G37: the
// counter turns 1/1); 「记下来。但法典，他们删不掉。」(G39): he puts the hat straight and goes back to the beans. The
// picture ends on the hat against the sea.
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, yawTo, L0, L1, ramp, saying, speak, alive, standing } from "./common";
import { NP_HELENA } from "../people";
import { ISLAND, HELENA } from "../sets";

const S = seg("G"), X = ISLAND.helena, ME = V(X, 1.5, 2);
export const SAID_AT = L1("G37") - 2;
export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("helena");
    const t = f / 30, q = saying("np", f);
    const NP = V(X + HELENA.beans[0] - 1.0, 0, HELENA.beans[1] - 0.25);
    const toMe = yawTo(NP, ME), toBeans = Math.PI / 2 - 0.3, toSea = Math.PI + 0.35;
    const k1 = ramp(f, L0("G35") - 10, L0("G35") + 4);                     // from the beans to her
    const k2 = ramp(f, L1("G36") + 8, L1("G36") + 30);                     // to the sea
    const k3 = ramp(f, L0("G37") + 20, L1("G37") + 16);                    // back to her
    const k4 = ramp(f, L1("G39") + 34, L1("G39") + 56);                    // back to the beans
    let facing = toBeans + (toMe - toBeans) * k1;
    facing += (toSea - toMe) * k2; facing += (toMe - toSea) * k3; facing += (toBeans - toMe) * k4;
    const watering = k1 < 0.5 || k4 > 0.6, hat = ramp(f, L1("G39") + 8, L1("G39") + 18) * (1 - ramp(f, L1("G39") + 30, L1("G39") + 40));
    const can = V(NP.x + 0.42, 0.95 + 0.04 * Math.sin(t * 2), NP.z + 0.02);
    if (watering) w.prop("can").put(can, { yaw: 0, tilt: -0.5 });
    else w.prop("can").put(V(NP.x + 0.5, 0.3, NP.z - 0.4), { yaw: 0.8 });
    const expr = f >= L0("G39") ? "smile_closed" : f >= L0("G37") - 6 ? "sad" : k2 > 0.5 ? "gloom" : f >= L0("G35") ? "deadpan" : "neutral";
    w.actor(NP_HELENA).set({
      ...standing(NP, facing, f, 1), ...alive(t, 1), expr, ...(q ? speak(q, f, 1) : {}), ...(k2 > 0.5 && k3 < 0.5 ? { turn: 1 } : {}),
      ...(watering ? { hands: [can, null] } : hat > 0.05 ? { hands: [V(NP.x + 0.3, 1.95, NP.z + 0.1), null], armFront: [true, undefined] } : {}),
    } as never);
    const camera = povCam(f, [
      { f: S.from, pos: [X - 0.6, 1.5, 2.6], look: [X - 2, 1.38, -30], fov: 62 },
      { f: L0("G34") + 10, pos: [X, 1.5, 2.0], look: [NP.x + 0.2, 1.08, NP.z], fov: 50 },
      { f: L1("G35") + 20, pos: [X, 1.5, 1.7], look: [NP.x, 1.23, NP.z], fov: 44 },
      { f: L1("G36") + 30, pos: [X + 0.9, 1.5, 1.6], look: [NP.x - 0.5, 1.38, NP.z - 2], fov: 48 },
      { f: L0("G37") + 10, pos: [X + 0.9, 1.5, 1.5], look: [NP.x - 0.3, 1.38, NP.z - 1], fov: 44 },
      { f: L1("G37") + 20, pos: [X + 0.3, 1.5, 1.4], look: [NP.x, 1.28, NP.z], fov: 40 },
      { f: L1("G39") + 30, pos: [X + 0.2, 1.5, 1.5], look: [NP.x, 1.28, NP.z], fov: 42 },
      { f: S.to - 20, pos: [X + 0.6, 1.25, 1.2], look: [NP.x, 1.9, NP.z - 3], fov: 40 },
    ], {});
    return { camera };
  },
};

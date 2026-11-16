// SCENE A (清晨): she arrives at the study; the guest turns from the window and answers. The camera eases in on him.
import { line, seg, quote } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, speak, saying, yawTo } from "./common";
import { GUEST } from "../people";

const S = seg("A");
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("study");
    w.set.param("hour", "morning");
    const at = V(0.4, 0, -1.6), me = V(0, 1.6, 1.6);
    const q = saying("gu", f);
    w.actor(GUEST).set({ ...standing(at, yawTo(at, me), f, 1), ...(q ? speak(q, f, 1) : {}) });
    const l3 = line("A03");
    const camera = povCam(f, [
      { f: S.from, pos: [0, 1.6, 2.6], look: [0.3, 1.4, -1.6] },
      { f: quote("gu", "A02").from, pos: [0, 1.6, 1.8], look: [0.35, 1.45, -1.6] },
      { f: l3.to, pos: [-0.2, 1.6, 1.4], look: [0.4, 1.4, -1.6], fov: 50 },
    ], { walk: f < quote("gu", "A02").from ? 0.6 : 0 });
    return { camera };
  },
};

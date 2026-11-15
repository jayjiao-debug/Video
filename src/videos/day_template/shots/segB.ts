// SCENE B (上午): at the desk. She asks what he is writing; he answers without looking up.
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, speak, saying } from "./common";
import { GUEST } from "../people";

const S = seg("B");
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("study");
    w.set.param("hour", "noon");
    const at = V(-0.2, 0, -0.9);
    const q = saying("gu", f);
    w.actor(GUEST).set({ ...standing(at, Math.PI, f, 1), lookDown: 18, ...(q ? speak(q, f, 1) : {}) });
    const camera = povCam(f, [
      { f: S.from, pos: [1.6, 1.6, 1.8], look: [-0.2, 1.1, -1.4] },
      { f: S.to, pos: [1.2, 1.6, 1.2], look: [-0.2, 1.1, -1.4], fov: 54 },
    ]);
    return { camera };
  },
};

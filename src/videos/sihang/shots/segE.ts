// SCENE E (placeholder until its shots are written)
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { ck } from "./kit";
const S = seg("E");
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const camera = povCam(f, [ck("hall", S.from, [0.3, 1.5, 2], [0, 1.2, -5], 62)], { mood: "calm" });
    w.setCamera(camera); w.update();
    return { camera };
  },
};

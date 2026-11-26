// SCENE E (placeholder staging)
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { ck, lead, P } from "./kit";
const S = seg("E");
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office");
    const camera = povCam(f, [ck("office", S.from, [0.2, 1.5, 2.6], [0, 1.0, 0], 60)], {});
    w.setCamera(camera);
    lead(w, f, { at: P("office", 0, 0, 0.6), facing: 0 });
    w.update();
    return { camera };
  },
};

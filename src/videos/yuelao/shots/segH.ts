// SCENE H · 22:40. THE TURN, played quiet: no effects, no meter, no stamps. She sits down next to him on the step and
// asks about his own thread. He meant to tie one for himself once this busy spell was over; the busy spell has lasted
// twelve hundred years. He tells her to file his as 缘分未到 too.
// CAMERA: low and close beside him, almost still; it only breathes.
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { ck, lead, sit, startOf, endOf, wordAt, ky } from "./kit";
import { SEAT, SEAT_TOP, SEAT_FACING, oldThread, hisThread } from "./night";

const S = seg("H");
export const SEG: Segment = {
  id: "H", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", 0); w.set.param("lit", 0.35); w.set.param("moon", 0.6);
    const h01 = startOf("H01"), h02 = startOf("H02"), h03 = startOf("H03"), x03 = endOf("H03"), h04 = startOf("H04"), x04 = endOf("H04"), h05 = startOf("H05"), x05 = endOf("H05");
    const camera = povCam(f, [
      ck("street", S.from, [-0.45, 1.34, -0.1], [-0.85, 0.93, -2.3], 47),
      ck("street", h01 - 4, [-0.3, 1.02, -0.75], [-0.85, 0.93, -2.3], 46),
      ck("street", h03, [-0.3, 1.0, -0.8], [-0.85, 0.93, -2.3], 45),
      ck("street", x04, [-0.34, 0.98, -0.95], [-0.85, 0.93, -2.3], 43),
      ck("street", S.to, [-0.36, 0.98, -1.0], [-0.85, 0.93, -2.3], 42),
    ], { mood: "calm", amp: 0.45, walk: [[S.from, 0.3], [h01 - 6, 0.2], [h01 - 2, 0]] });
    w.setCamera(camera);
    const up = ky(f, [[x04 - 20, 0], [x04 - 6, 1], [h05 - 8, 1], [h05 + 4, 0]]), down = ky(f, [[S.from, 1], [h01 + 10, 1], [h02, 0.3], [h03 - 2, 0.5], [x03, 0.7], [h04, 0.4], [x04 - 20, 0.2]]) * (1 - up) + ky(f, [[wordAt("H05", "缘分") - 4, 0], [x05 + 10, 0.9]]);
    lead(w, f, {
      at: SEAT, facing: SEAT_FACING, more: sit(SEAT, SEAT_FACING, SEAT_TOP, f / 30),
      expr: [[S.from, "small"], [h01 + 14, "look"], [h02 - 2, "wonder"], [h03 - 4, "quiet"], [wordAt("H03", "想着") - 2, "wry"], [x03 + 4, "quiet"], [h04 - 2, "tired"], [x04 - 4, "wonder"], [h05 - 4, "wry"], [wordAt("H05", "缘分") - 3, "small"], [x05 + 6, "quiet"]],
      lookDown: 14 * down - 12 * up, gaze: f >= h03 && f < x03 ? -0.4 : 0,
      head: { dy: -0.05 * down + 0.05 * up },
    });
    w.update();
    oldThread(w, 0); hisThread(w);
    return { camera, post: { bloom: 0.35 } };
  },
};

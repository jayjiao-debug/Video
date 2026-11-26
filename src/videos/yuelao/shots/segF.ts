// SCENE F · 19:00, the noodle table outside her tower. THE BLIND DATE her mother set up: 月老 stands behind the table,
// sure of it this time. He asks about flat and salary, she asks whether he can take 996; he answers a message, she
// opens her laptop and fixes a bug. The thread between their ankles goes slack and comes undone. The second stamp.
// CAMERA: over the table at the two of them, 月老 between them at the back; a slow push to his face at the end.
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { P, ck, lead, put, sit, startOf, endOf, wordAt, ky, h, frag, hit, V, thread, ring, rel } from "./kit";
import { XIAOMAN, XIANGQIN } from "../people";
import { Hua, FateStamp, OS } from "../hud/skin";

const S = seg("F");
export const SEG: Segment = {
  id: "F", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street"); w.set.param("time", "dusk"); w.set.param("door", 0); w.set.param("lit", 0.6); w.set.param("moon", 0);
    const f01 = startOf("F01"), x01 = endOf("F01"), f02 = startOf("F02"), f03 = startOf("F03"), f04 = startOf("F04"), x04 = endOf("F04"), f05 = startOf("F05"), x05 = endOf("F05"), f06 = startOf("F06");
    const t = f / 30, HALF = Math.PI / 2;
    const camera = povCam(f, [
      ck("street", S.from, [-2.6, 1.46, 1.6], [-3.3, 0.95, -1.7], 54),
      ck("street", f01 + 10, [-3.2, 1.42, 1.25], [-3.3, 0.92, -1.7], 56),
      ck("street", f06 - 10, [-3.22, 1.42, 1.15], [-3.3, 0.9, -1.7], 56),
      ck("street", f06 + 14, [-3.2, 1.4, 0.2], [-3.3, 1.0, -2.45], 42),
      ck("street", S.to, [-3.2, 1.4, 0.15], [-3.3, 1.0, -2.45], 42),
    ], { mood: "calm", amp: 0.7, walk: [[S.from, 0.6], [f01 + 6, 0.4], [f01 + 12, 0]] });
    w.setCamera(camera);
    const A = P("street", -3.92, 0, -1.5), B = P("street", -2.68, 0, -1.5), TOP = 0.62;
    const lap = f >= f05 - 8, ph = f >= f04 + 14;
    const xm = put(w, f, XIAOMAN, {
      at: A, facing: HALF, id: 2, who: "xm",
      expr: [[S.from, "polite"], [f02 + 20, "flat"], [f03 - 2, "calm"], [f04, "flat"], [f05 - 8, "smile"], [x05 + 4, "flat"]],
      more: sit(A, HALF, 0.34, t), hands: lap ? [rel(A, HALF, -0.09, TOP + 0.05, 0.3), rel(A, HALF, 0.09, TOP + 0.05 + 0.012 * Math.sin(f * 1.3), 0.3)] : undefined,
      lookDown: lap ? 14 : 0,
    });
    const xq = put(w, f, XIANGQIN, {
      at: B, facing: -HALF, id: 3, who: "xq",
      expr: [[S.from, "polite"], [f03, "look"], [f03 + 30, "worry"], [f04 - 2, "polite"], [f04 + 14, "flat"]],
      more: { ...sit(B, -HALF, 0.34, t), ...(ph ? { pose: { kind: "phone" as const, t, amount: 0, arm: 1 as const } } : {}) },
      lookDown: ph ? 12 : 0, head: { dy: 0.04 * hit(f, f02, 8) },
    });
    const BACK = P("street", -3.3, 0, -2.5);
    const rub = f < f02 ? 0.03 * Math.sin(f * 0.9) : 0, cheer = ky(f, [[wordAt("F01", "稳") - 3, 0], [wordAt("F01", "稳") + 3, 1], [f02 - 4, 1], [f02 + 4, 0]]);
    lead(w, f, {
      at: BACK, facing: 0,
      hands: cheer > 0.02 ? [rel(BACK, 0, -0.2, 0.62 + 0.5 * cheer, 0.14), rel(BACK, 0, 0.2, 0.62 + 0.5 * cheer, 0.14)] : f < f02 ? [rel(BACK, 0, -0.05, 0.8 + rub, 0.24), rel(BACK, 0, 0.05, 0.8 - rub, 0.24)] : undefined,
      expr: [[S.from, "sly"], [f01 - 2, "beam"], [f02, "proud"], [f03, "look"], [f03 + 24, "worry"], [f04 + 14, "panic"], [f05, "strain"], [x05 + 2, "sag"], [f06 - 2, "small"], [wordAt("F06", "缘分") - 2, "sag"]],
      gaze: f >= f02 && f < f06 - 10 ? (f < f03 || (f >= f04 && f < f05) ? 0.6 : -0.6) : 0,
      lookDown: 10 * ky(f, [[x05 + 2, 0], [x05 + 10, 1], [f06 + 4, 1], [f06 + 12, 0]]),
    });
    w.update();
    w.prop("bowl", "b").put(P("street", -3.12, TOP, -1.5 + 0.1));
    if (!lap) w.prop("bowl").put(P("street", -3.48, TOP, -1.5 - 0.1));
    else w.prop("laptop").put(P("street", -3.5, TOP, -1.5), { yaw: HALF });
    // the thread between their ankles: tight and bright at first, slack as they stop looking at each other, gone at the bug
    const a = xm.footWorld(1).add(V(0, 0.06, 0)), b = xq.footWorld(0).add(V(0, 0.06, 0));
    const gone = ky(f, [[x05 - 2, 1], [x05 + 8, 0]]), slack = ky(f, [[f04 + 10, 0], [x04 + 4, 1]]);
    if (gone > 0.02) {
      ring(w, "a", a, 0.05, 0.25); ring(w, "b", b, 0.05, 0.25);
      thread(w, "ab", a, b, 0.02 + 0.03 * slack, { r: 0.008, glow: 0.9 - 0.6 * slack, cut: gone });
    }
    const overlays = frag(
      h(Hua, { key: "a", f, from: wordAt("F01", "稳") - 1, to: f02 - 2, text: "稳了！", x: 540, y: 620, px: 140, rot: -6 }),
      h(OS, { key: "o", f, from: f03 + 20, to: f04 + 10, x: 110, y: 560, text: "这是相亲还是面试？" }),
      h(Hua, { key: "b", f, from: f05 + 14, to: x05 + 10, text: "修 bug > 相亲", x: 540, y: 620, px: 92, rot: 5, col: "#f8efd8" }),
      h(FateStamp, { key: "f", f, from: wordAt("F06", "缘分") + 2, to: S.to - 3, x: 600, y: 640 }),
    );
    void x01;
    return { camera, overlays };
  },
};

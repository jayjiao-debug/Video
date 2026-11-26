// SCENE B · 08:10, 天庭姻缘司. THE OFFICE AND THE NUMBERS: he sits behind his desk and complains (one clerk, 007), brags
// (18,000 couples a day), deflates (7,500 split the same day; the fact card), mimes the scissors, then gets up and shows
// her the KPI board: one couple short, due at midnight. The meter starts here.
// CAMERA (her eyes, one take): across the desk at him; a lean in on the brag; she follows him to the board on the right
// wall; back to his face for the penalty.
import { seg, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { P, ck, lead, sit, startOf, endOf, wordAt, ky, rel, h, frag, hit, walkAlong, faceTo, v3 } from "./kit";
import { Hua, Truth } from "../hud/skin";

const S = seg("B");
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.42); w.set.param("kpi", 0); w.set.param("smoke", 0);
    const b01 = startOf("B01"), b02 = startOf("B02"), b03 = startOf("B03"), b04 = startOf("B04"), e04 = endOf("B04"), b05 = startOf("B05"), e05 = endOf("B05"), b06 = startOf("B06"), b07 = startOf("B07"), b08 = startOf("B08");
    const go = e05 - 4, STOOL = P("office", 0.35, 0, -1.95), BOARD = P("office", 2.5, 0, -1.6);
    const path = [STOOL, P("office", 1.5, 0, -1.95), BOARD], leg = f >= go + 8 ? walkAlong(path, 1.5, (f - go - 8) / 30, { endFacing: -0.75 }) : null;
    const rise = ky(f, [[go, 0], [go + 8, 1]]);
    const camera0 = povCam(f, [
      ck("office", S.from, [0.25, 1.34, 0.0], [0.35, 1.0, -1.95], 52),
      ck("office", b03 - 4, [0.25, 1.34, -0.05], [0.35, 1.0, -1.95], 52),
      ck("office", b03 + 8, [0.28, 1.3, -0.4], [0.35, 1.02, -1.95], 50),
      ck("office", b04 + 10, [0.28, 1.32, -0.25], [0.35, 1.0, -1.95], 51),
      ck("office", go + 4, [0.28, 1.34, -0.15], [0.35, 1.0, -1.95], 52),
      ck("office", b06 + 4, [0.2, 1.5, 0.85], [2.93, 1.34, -1.15], 58),
      ck("office", b07 - 4, [0.25, 1.5, 0.8], [2.93, 1.34, -1.15], 57),
      ck("office", b08 + 2, [0.6, 1.46, 0.3], [2.5, 1.04, -1.55], 52),
      ck("office", S.to, [0.6, 1.46, 0.25], [2.5, 1.02, -1.55], 52),
    ], { mood: "calm", amp: 0.7, walk: [[S.from, 0], [b03 - 4, 0], [b03 + 2, 0.3], [b03 + 8, 0], [go + 4, 0], [go + 14, 0.4], [b06 + 4, 0]] });
    const camera = punchIn(camera0, f, wordAt("B01", "零零七") - 1, { k: 0.86, len: 5, off: b02 - 2 });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    const snip = hit(f, wordAt("B05", "剪"), 10), pointK = ky(f, [[b06 + 2, 0], [b06 + 8, 1], [b07 - 6, 1], [b07 + 2, 0]]);
    const expr: [number, string][] = [[S.from, "tired"], [b01 + 24, "grumble"], [wordAt("B01", "别") - 2, "plead"], [b02, "look"], [b03 - 2, "proud"], [b04 - 2, "sag"], [e04 + 14, "tired"], [b05 - 2, "grumble"], [e05, "worry"], [b06 + 30, "plead"], [b07, "worry"], [b08 - 2, "sag"], [wordAt("B08", "还") - 2, "grumble"]];
    if (!leg) {
      const up = rel(STOOL, 0, -0.16, 1.0 + 0.05 * snip, 0.3), fist = ky(f, [[b03 - 2, 0], [b03 + 5, 1], [b04 - 6, 1], [b04 + 2, 0]]), sc = ky(f, [[wordAt("B05", "自") - 4, 0], [wordAt("B05", "自") + 2, 1], [e05 - 2, 1], [e05 + 4, 0]]);
      lead(w, f, {
        at: STOOL, facing: 0, expr,
        more: { ...sit(STOOL, 0, 0.34, f / 30), ...(rise > 0 ? {} : {}) },
        hands: fist > 0.02 ? [rel(STOOL, 0, -0.2, 0.86 + 0.3 * fist, 0.2), null] : sc > 0.02 ? [up.clone().lerp(rel(STOOL, 0, -0.2, 0.8, 0.2), 1 - sc), null] : undefined,
        head: { dy: 0.05 * hit(f, b03, 8) - 0.08 * ky(f, [[b04, 0], [b04 + 10, 1], [e04 + 16, 1], [b05, 0]]) },
        lookDown: 10 * ky(f, [[b04, 0], [b04 + 10, 1], [e04 + 16, 1], [b05, 0]]),
      });
    } else {
      lead(w, f, {
        at: leg.at, facing: leg.pose.kind === "walk" ? leg.facing : faceTo(leg.at, camP), pose: pointK > 0.3 ? { kind: "point", t: f / 30, arm: 1 } : leg.pose, expr,
        turn: pointK > 0.3 ? -0.25 : undefined,
        lookDown: 12 * ky(f, [[b08, 0], [b08 + 8, 1], [wordAt("B08", "还") - 2, 1], [wordAt("B08", "还") + 4, 0]]),
        head: f >= b08 ? { dy: -0.08 * ky(f, [[b08, 0], [b08 + 8, 1], [wordAt("B08", "还") - 2, 1], [wordAt("B08", "还") + 4, 0.3]]) } : undefined,
      });
    }
    w.update();
    const overlays = frag(
      h(Hua, { key: "a", f, from: wordAt("B01", "零零七") - 1, to: b02 - 1, text: "007", x: 800, y: 640, px: 150, rot: 9 }),
      h(Hua, { key: "b", f, from: b03 + 6, to: b04 - 2, text: "18000 对/天", x: 560, y: 560, px: 104, rot: -5, col: "#f8efd8" }),
      h(Hua, { key: "c", f, from: wordAt("B04", "七") - 1, to: e04 + 8, text: "散 7500", x: 760, y: 610, px: 110, rot: 7 }),
      h(Hua, { key: "d", f, from: wordAt("B05", "剪") - 1, to: e05 + 2, text: "咔嚓！", x: 300, y: 640, px: 128, rot: -10 }),
      h(Hua, { key: "e", f, from: wordAt("B06", "差") - 1, to: b07 - 4, text: "就差 1 对！", x: 430, y: 1130, px: 100, rot: -4 }),
      h(Truth, { key: "t", f, from: b03 + 10, to: b04 - 4, x: 860, y: 760, kind: "演绎" }),
    );
    return { camera, overlays };
  },
};

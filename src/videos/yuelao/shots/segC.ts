// SCENE C · 09:30, the case-file cabinet. HIS OLD RESULTS: he trots to the wall of drawers and pulls five famous files,
// each one a brag that goes wrong: 牛郎织女 (once a year), 梁祝 (butterflies; "don't write that down"), 许仙白娘子
// (cross-species, a thousand years of paperwork), 宝玉黛玉 (his hand shook: 宝钗), 董永七仙女 (the boss's own daughter).
// Each file is a card of the 喜帖 skin with its verdict stamped on; a note says all five are this film's invention.
// CAMERA: she follows him to the cabinet, then holds him low in the frame (the card sits above him); a lean in for the
// whisper about the Jade Emperor.
import { seg, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { P, ck, lead, startOf, endOf, wordAt, ky, h, frag, hit, walkAlong, faceTo, v3, holdUp, V } from "./kit";
import { CaseFile, Disclaimer, Hua, Truth } from "../hud/skin";

const S = seg("C");
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.42); w.set.param("kpi", 0); w.set.param("smoke", 0);
    const c01 = startOf("C01"), c02 = startOf("C02"), c03 = startOf("C03"), c04 = startOf("C04"), e04 = endOf("C04"), c05 = startOf("C05"), c06 = startOf("C06"), c07 = startOf("C07"), c08 = startOf("C08"), c09 = startOf("C09"), c10 = startOf("C10"), c11 = startOf("C11"), e11 = endOf("C11");
    const CAB = P("office", -1.95, 0, -0.35), go = S.from + 4;
    const leg = walkAlong([P("office", 2.35, 0, -1.4), P("office", 1.3, 0, -0.5), P("office", -0.9, 0, -0.1), CAB], 1.9, (f - go) / 30, {});
    const walking = leg.pose.kind === "walk";
    const whisper = wordAt("C09", "那是");
    const camera0 = povCam(f, [
      ck("office", S.from, [0.6, 1.46, 0.3], [2.5, 1.02, -1.55], 52),
      ck("office", go + 30, [0.3, 1.48, 1.3], [0.6, 1.05, -0.4], 58),
      ck("office", c02 - 14, [-0.55, 1.5, 1.5], [-1.95, 1.42, -0.35], 56),
      ck("office", c05 - 6, [-0.55, 1.5, 1.5], [-1.95, 1.42, -0.35], 56),
      ck("office", c05 + 6, [-0.6, 1.5, 1.4], [-1.95, 1.43, -0.35], 55),
      ck("office", c07 - 4, [-0.6, 1.5, 1.4], [-1.95, 1.43, -0.35], 55),
      ck("office", c07 + 8, [-0.5, 1.5, 1.45], [-1.95, 1.42, -0.35], 56),
      ck("office", whisper - 6, [-0.5, 1.5, 1.45], [-1.95, 1.42, -0.35], 56),
      ck("office", whisper + 6, [-0.75, 1.42, 1.0], [-1.95, 1.3, -0.35], 52),
      ck("office", c11 + 4, [-0.75, 1.42, 1.0], [-1.95, 1.3, -0.35], 52),
      ck("office", e11 + 6, [-0.6, 1.48, 1.3], [-1.95, 1.36, -0.35], 55),
    ], { mood: "calm", amp: 0.7, walk: [[S.from, 0], [go + 4, 0.5], [c02 - 20, 0.5], [c02 - 12, 0], [whisper - 6, 0], [whisper, 0.3], [whisper + 6, 0]] });
    const camera = punchIn(camera0, f, wordAt("C07", "绑成") - 1, { k: 0.86, len: 5, off: c08 - 2 });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // the five files: each comes out of a drawer (the hands dip to the side, then up in front of the chest)
    const cases = [c02 - 6, c05 - 4, c06 - 4, c07 - 4, c09 - 4];
    let k = 0; for (const c of cases) if (f >= c) k = ky(f, [[c, 0], [c + 7, 1]]);
    const drop = ky(f, [[e11 - 4, 1], [e11 + 6, 0]]);
    const up = f >= cases[0] ? k * drop : 0, shakeK = hit(f, wordAt("C07", "抖"), 14);
    const facing = walking ? leg.facing : faceTo(CAB, camP) + 0.12;
    const hands = !walking && up > 0.02 ? holdUp(leg.at, facing, up, 0.66 + 0.03 * Math.sin(f * 1.9) * shakeK * 3, 0.12, 0.31) : undefined;
    const sagK = (a: number, b: number) => ky(f, [[a, 0], [a + 8, 1], [b - 4, 1], [b + 4, 0]]);
    const low = Math.max(sagK(c04 - 2, e04 + 4), sagK(wordAt("C05", "变") - 2, c06 - 6), sagK(c08 - 2, c09 - 6), sagK(c11 - 2, e11 + 20));
    const r = lead(w, f, {
      at: leg.at, facing, pose: walking ? leg.pose : undefined, hands,
      expr: [[S.from, "proud"], [c02 - 4, "beam"], [wordAt("C02", "牢") - 2, "proud"], [c03, "look"], [c04 - 2, "small"], [c05 - 3, "proud"], [wordAt("C05", "变") - 4, "small"], [wordAt("C05", "这单") - 2, "hush"], [c06 - 3, "proud"], [wordAt("C06", "跨") - 2, "strain"], [wordAt("C06", "审批") - 2, "tired"], [c07 - 3, "proud"], [wordAt("C07", "手") - 2, "worry"], [wordAt("C07", "绑成") - 2, "panic"], [c08 - 2, "grumble"], [c09 - 3, "proud"], [whisper - 3, "hush"], [c10, "worry"], [c11 - 2, "sag"]],
      lookDown: 10 * low, head: { dy: -0.07 * low + 0.05 * hit(f, wordAt("C02", "我绑") , 8) },
      lean: f >= whisper - 2 && f < c10 ? { pitch: 8 } : undefined,
    });
    w.update();
    if (hands && up > 0.3) {
      const a = r.handWorld(0), b = r.handWorld(1), mid = a.clone().lerp(b, 0.5).add(V(0, 0.02, 0));
      w.prop("file").put(mid, { yaw: facing, pitch: -0.35, roll: 0.06 * Math.sin(f * 1.9) * shakeK * 3 });
    }
    const X = 540, Y = 660;
    const overlays = frag(
      h(CaseFile, { key: "1", f, from: c02 + 2, to: c05 - 6, x: X, y: Y, kind: "niulang", stampAt: wordAt("C04", "异地") - (c02 + 2), rot: -3 }),
      h(CaseFile, { key: "2", f, from: c05, to: c06 - 6, x: X, y: Y, kind: "liangzhu", stampAt: wordAt("C05", "变") - c05, rot: 2 }),
      h(CaseFile, { key: "3", f, from: c06, to: c07 - 6, x: X, y: Y, kind: "baishe", stampAt: wordAt("C06", "跨") - c06, rot: -2 }),
      h(CaseFile, { key: "4", f, from: c07, to: c09 - 6, x: X, y: Y, kind: "baodai", stampAt: wordAt("C07", "绑成") - c07, rot: 3 }),
      h(CaseFile, { key: "5", f, from: c09, to: e11 + 4, x: X, y: Y, kind: "qixian", stampAt: wordAt("C09", "亲闺女") - c09, rot: -3 }),
      h(Disclaimer, { key: "d", f, from: c02 + 10, to: e11 + 4, y: 905, text: "以上卷宗，纯属演绎" }),
      h(Truth, { key: "t", f, from: c02 + 14, to: c03 - 2, x: 880, y: 500, kind: "传说" }),
      h(Hua, { key: "h1", f, from: wordAt("C02", "牢") - 1, to: c03 - 2, text: "牢！", x: 250, y: 1020, px: 130, rot: -8 }),
      h(Hua, { key: "h2", f, from: wordAt("C05", "这单") , to: c06 - 4, text: "别记！", x: 800, y: 1040, px: 110, rot: 7 }),
      h(Hua, { key: "h3", f, from: c08 + 4, to: c09 - 6, text: "挨骂 200 年", x: 540, y: 1040, px: 92, rot: -4, col: "#f8efd8" }),
      h(Hua, { key: "h4", f, from: wordAt("C11", "三百") - 1, to: e11 + 6, text: "-300 年仙丹", x: 540, y: 1040, px: 96, rot: 5 }),
    );
    return { camera, overlays };
  },
};

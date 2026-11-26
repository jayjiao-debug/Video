// SCENE B · the same night. Which one is 谢团附? The boy does not know (three months in); the old squad leader does:
// "全楼，就一个坐着的。" The one man sitting writes by a lantern: his will (原话). Then the slit: the neon across the
// creek ("上海，真亮啊"), and the letter begins: 娘，儿在上海。
// CAMERA:
//   1  B01-B02   on 满仓 (medium)
//   2  B03       pan to 老班长 on his sack; his strip; he tips his chin
//   3  B03 gap   she walks round the column to the crate desk
//   4  B04-B05   谢晋元 across his desk, the lantern between; he does not look up. His strip; 原话 after; he looks up, nods
//   5  B06       满仓 calls from the slit: she goes over
//   6  B07-B08   through the slit: the neon on the water; then his face in its light
//   7  B09-B12   medium on him; her paper comes up and the first columns are written
import { seg, line, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { MANCANG, LAO_RIFLE, XIE, MEN } from "../people";
import { P, ck, put, loopWalk, sit, startOf, screenOf, endOf, ky, rel, h, frag, V, win } from "./kit";
import { NameStrip, QuoteSeal, Letter, type LetterCol } from "../hud/skin";

const S = seg("B");
/** the letter so far, column by column (the frames each is written on come from the lines) */
export const letterCols = (): LetterCol[] => {
  const b11a = screenOf("B11", 1), b11b = screenOf("B11", 2), e11 = endOf("B11");
  return [
    { text: "娘：", from: b11a + 8, to: b11a + 22 },
    { text: "儿在上海。", from: b11a + 26, to: b11b - 2 },
    { text: "住的洋楼，高得很。", from: b11b + 6, to: e11 + 10 },
  ];
};
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const b01 = startOf("B01"), b03 = startOf("B03"), e03 = endOf("B03"), b04 = startOf("B04"), b05 = startOf("B05"), e05 = endOf("B05"), b06 = startOf("B06"), e06 = endOf("B06");
    const b07 = startOf("B07"), b08 = startOf("B08"), e08 = endOf("B08"), b09 = startOf("B09"), b11 = startOf("B11");
    const atDesk = f >= e03 + 14 && f < b06 - 6;
    w.set.param("time", "night"); w.set.param("lamp", atDesk ? "desk" : "south");
    const MC0 = P("hall", 1.05, 0, -3.3), SLIT = P("hall", 0.78, 0, -5.02);
    // --- the camera
    const HEAD = [0.78, 1.14, -5.02];
    let camera = povCam(f, [
      ck("hall", S.from, [0.7, 1.48, -0.9], [1.05, 1.1, -3.3], 58),
      ck("hall", b03 - 8, [0.7, 1.48, -0.9], [1.05, 1.1, -3.3], 58),
      ck("hall", b03 + 6, [0.85, 1.42, -1.0], [2.2, 0.98, -3.36], 56),
      ck("hall", e03 + 6, [0.85, 1.42, -1.0], [2.2, 0.98, -3.36], 56),
      ck("hall", e03 + 22, [1.4, 1.48, 0.7], [3.4, 1.0, -0.2], 60),
      ck("hall", b04 - 4, [2.75, 1.46, 1.95], [3.86, 0.86, -0.36], 56),
      ck("hall", e05 + 40, [2.8, 1.44, 1.85], [3.86, 0.88, -0.36], 54),
      ck("hall", b06 - 6, [2.8, 1.44, 1.85], [3.86, 0.88, -0.36], 54),
      ck("hall", b06 + 12, [1.3, 1.48, -1.4], [0.78, 1.15, -5.0], 60),
      ck("hall", e06, [0.25, 1.46, -3.1], HEAD, 58),
      ck("hall", b07 + 4, [0.02, 1.44, -5.6], [-2.0, 7.0, -60], 50),
      ck("hall", b08 + 20, [0.02, 1.44, -5.62], [-2.4, 7.4, -60], 48),
      ck("hall", b08 + 36, [0.05, 1.36, -4.05], HEAD, 50),
      ck("hall", e08 + 40, [0.05, 1.36, -4.0], HEAD, 48),
      ck("hall", b09 + 10, [-0.35, 1.44, -3.25], [0.5, 1.12, -5.02], 56),
      ck("hall", S.to, [-0.35, 1.44, -3.3], [0.5, 1.12, -5.02], 56),
    ], { mood: "calm", amp: 0.8, walk: [[e03 + 6, 0], [e03 + 12, 0.7], [b04 - 10, 0.7], [b04 - 2, 0], [b06 - 4, 0], [b06 + 2, 0.8], [e06 - 6, 0.8], [e06, 0.3], [b07 + 4, 0]] });
    camera = punchIn(camera, f, b01 - 2, { k: 1, len: 2 });
    w.setCamera(camera);
    // --- the haulers go on in the back (fewer: it is late)
    [[-5.6, 0.0], [-4.3, 6.5], [5.3, 5.0]].forEach(([x, ph], i) => {
      const leg = loopWalk([P("hall", x, 0, 3.4), P("hall", x + 0.25, 0, -4.7), P("hall", x + 0.75, 0, -4.7), P("hall", x + 0.9, 0, 3.4)], 1.0, f / 30 + ph);
      put(w, f, MEN[i], { at: leg.at, facing: leg.facing, id: 20 + i, pose: leg.pose, expr: "calm" }, `h${i}`);
    });
    // --- 老班长 on his sack, a hand on his rifle; he tips his chin at the desk on "一个坐着的"
    const LB = P("hall", 2.2, 0, -3.36), chin = win(f, b03 + 14, e03 + 10, 6, 8);
    put(w, f, LAO_RIFLE, {
      at: LB, facing: 0.5, id: 3, who: "lb", expr: [[S.from, "dry"], [b03 - 2, "halfLaugh"], [e03 + 12, "dry"]],
      hands: [rel(LB, 0.5, -0.3, 0.82, 0.3), null], head: chin > 0.01 ? { tilt: -9 * chin, dy: 0.03 * chin } : undefined, gaze: chin > 0.3 ? -1 : 0,
      more: sit(LB, 0.5, 0.45, f / 30),
    });
    // --- 谢晋元 at his crate, writing; after his words he looks up at the lens and nods once
    const XJ = P("hall", 3.91, 0, -0.44), XF = -0.5, up = win(f, e05 + 22, b06 + 10, 8, 8), nod = win(f, e05 + 44, e05 + 60, 5, 6);
    const wr = Math.sin(f * 0.5) * 0.02, wr2 = Math.sin(f * 0.23) * 0.03;
    put(w, f, XIE, {
      at: XJ, facing: XF, id: 4, who: "xj", expr: [[S.from, "calm"], [e05 + 22, "grave"]],
      lookDown: 24 * (1 - up) + 10 * nod, hands: [rel(XJ, XF, -0.1 + wr2, 0.66, 0.42 + wr), rel(XJ, XF, 0.16, 0.655, 0.4)],
      more: sit(XJ, XF, 0.4, f / 30),
    });
    w.prop("paper", "will").put(rel(XJ, XF, 0.0, 0.628, 0.46), { yaw: XF + 0.15 });
    // --- 满仓: with her at first; then at the slit, looking out; turned to her for the letter
    const atSlit = f >= e05 + 10;
    const turn = atSlit ? ky(f, [[b06 - 4, 0], [b06 + 8, 0.7], [e06 + 2, 0.7], [b07, 0], [b08 + 24, 0], [b08 + 40, 0.6], [b09 - 6, 0.6], [b09 + 6, 1]]) : 1;
    const mcAt = atSlit ? SLIT : MC0, mcF = atSlit ? -2.56 + 2.1 * turn : 0.14;
    put(w, f, MANCANG, {
      at: mcAt, facing: mcF, id: 1, who: "mc",
      expr: [[S.from, "bright"], [startOf("B02") - 2, "shy"], [b03, "bright"], [b06 - 4, "awe"], [b09 - 4, "shy"], [b11 - 2, "think"], [screenOf("B11", 1) + 4, "bright"], [startOf("B12") - 2, "think"]],
      hands: f >= b06 - 2 && f < e06 ? [rel(SLIT, -2.56, -0.1, 1.2, 0.42), null] : undefined,
      gaze: f >= startOf("B12") ? 1 : 0, lookDown: f >= screenOf("B11", 1) && f < startOf("B12") ? -8 : 0,
    });
    w.update();
    // --- over the picture
    const cols = letterCols(), paperK = win(f, screenOf("B11", 1) - 4, S.to - 2, 12, 10);
    const overlays = frag(
      h(NameStrip, { key: "lb", f, from: b03 + 8, to: e03 + 12, x: 420, y: 520, name: "老班长", sub: "在淞沪打了三个月", invented: true, rot: 2 }),
      h(NameStrip, { key: "xj", f, from: b04 + 4, to: b05 + 62, x: 400, y: 500, name: "谢晋元", sub: "三十二岁 · 广东蕉岭 · 中校团附" }),
      h(QuoteSeal, { key: "q", f, from: e05 + 4, to: e05 + 60, x: 760, y: 560, src: "10月26日 · 他的遗书" }),
      h(Letter, { key: "l", f, k: paperK, cols, x: 60, y: 760, scale: 0.86 }),
    );
    return { camera, overlays, post: { bloom: f >= b07 && f < b09 ? 0.9 : 0.6 } };
  },
};
void line; void V;

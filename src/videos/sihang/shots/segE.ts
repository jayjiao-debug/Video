// SCENE E · 28 Oct, evening. The battalion stands in rows. 杨瑞符 (原话): say there are eight hundred of you, never
// that there is only one battalion. Then the man who was writing: "与最后阵地共存亡" (原话): so that is 谢团附.
// THE QUIET SCENE (no music, no effects but her paper): by a lantern the letter goes on. Food at every meal. Grain
// to the roof. "我们人多，有八百人。" Her pencil stops. "写八百。娘听了放心。" 老班长: his mother cannot read.
// CAMERA:
//   1  E01      from inside the rows, between two helmets: 杨瑞符 in the lantern light; his strip; 原话 after
//   2  E02      to 满仓 beside her: "原来他就是谢团附"
//   3  E03      谢晋元, closer; 原话 after; hold on the rows; a dip to black (later that night)
//   4  E04-E08  she sits opposite 满仓 on his sack; he is top right, her paper bottom left
//   5  E09      to 老班长 in the half dark; back to the boy; a slow push through the long hold
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { MANCANG, LAO, XIE_CAP, YANG, MEN, RUNNER } from "../people";
import { P, ck, put, sit, startOf, screenOf, endOf, ky, rel, h, frag, win, hang } from "./kit";
import { NameStrip, QuoteSeal, Letter, Black, type LetterCol } from "../hud/skin";
import { letterCols as colsB } from "./segB";

const S = seg("E");
export const letterCols = (): LetterCol[] => {
  const e05a = screenOf("E05", 0), e05b = screenOf("E05", 1), e5 = endOf("E05"), e08b = screenOf("E08", 1), e8 = endOf("E08"), e09 = startOf("E09");
  return [
    ...colsB(),
    { text: "顿顿有粮吃，", from: e05a + 20, to: e05b + 4 },
    { text: "粮食堆到房顶。", from: e05b + 10, to: e5 + 14 },
    { text: "我们人多，有八百人。", from: e08b - 4, to: e8 + 16 },
    { text: "莫挂念。", from: e09 + 4, to: e09 + 26 },
  ];
};
const ROWS: [number, number][] = [[-1.2, 0.6], [-0.2, -0.4], [0.95, 0.25], [1.7, -0.7], [-2.1, 1.5], [2.3, 0.5]];
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const e01 = startOf("E01"), x01 = endOf("E01"), e02 = startOf("E02"), x02 = endOf("E02"), e03 = startOf("E03"), x03 = endOf("E03"), e04 = startOf("E04");
    const e05 = startOf("E05"), e06 = startOf("E06"), e07 = startOf("E07"), e08 = startOf("E08"), e09 = startOf("E09"), x09 = endOf("E09");
    const CUT = Math.round((x03 + 50 + e04 - 14) / 2), later = f >= CUT;
    w.set.param("time", later ? "night" : "eve"); w.set.param("lamp", later ? "letter" : "mid");
    let camera;
    if (!later) {
      const YR = P("hall", -1.9, 0, -1.1), XJ0 = P("hall", -1.05, 0, -1.55), XJ1 = P("hall", -1.2, 0, -1.1), MC = P("hall", -0.15, 0, 2.15), LB = P("hall", -0.7, 0, 3.1);
      const fwd = ky(f, [[x01 + 30, 0], [x01 + 48, 1]]), XJ = XJ0.clone().lerp(XJ1, fwd);
      camera = povCam(f, [
        ck("hall", S.from, [0.95, 1.5, 1.65], [-1.6, 1.2, -1.2], 54),
        ck("hall", e01 - 8, [0.95, 1.5, 1.65], [-1.75, 1.18, -1.2], 42),
        ck("hall", x01 + 34, [0.95, 1.5, 1.65], [-1.7, 1.18, -1.2], 40),
        ck("hall", e02 - 8, [0.9, 1.46, 1.65], [-0.15, 1.1, 2.15], 56),
        ck("hall", x02 + 2, [0.9, 1.46, 1.65], [-0.15, 1.1, 2.15], 56),
        ck("hall", e03 - 3, [0.9, 1.5, 1.6], [-1.2, 1.22, -1.1], 40),
        ck("hall", CUT, [0.9, 1.5, 1.6], [-1.2, 1.22, -1.1], 37),
      ], { mood: "calm", amp: 0.7 });
      w.setCamera(camera);
      const chop = Math.max(win(f, screenOf("E01", 0) + 20, screenOf("E01", 0) + 34, 3, 6), win(f, screenOf("E01", 1) + 6, screenOf("E01", 1) + 22, 3, 6));
      const point = win(f, x01 + 26, e03 - 4, 6, 8);
      put(w, f, YANG, {
        at: YR, facing: 0.78, id: 5, who: "yr", expr: "hard",
        hands: chop > 0.02 || point > 0.02 ? [hang(YR, 0.78, 0).lerp(point > chop ? rel(YR, 0.78, -0.5, 1.0, 0.1) : rel(YR, 0.78, -0.12, 1.02 - 0.12 * chop, 0.36), Math.max(chop, point)), null] : undefined,
      });
      put(w, f, XIE_CAP, { at: XJ, facing: 0.72, id: 4, who: "xj", expr: [[S.from, "calm"], [e03 - 4, "hard"], [x03 + 14, "grave"]], pose: fwd > 0.02 && fwd < 0.98 ? ({ kind: "walk", t: f / 30 } as never) : undefined });
      ROWS.forEach(([x, z], i) => put(w, f, i === 5 ? RUNNER : MEN[3 + (i % 5)], { at: P("hall", x, 0, z), facing: -2.36 + 0.12 * Math.sin(i * 2.1), id: 40 + i, expr: "alert" }, `r${i}`));
      put(w, f, MANCANG, { at: MC, facing: f >= e02 - 10 && f < x02 + 6 ? 1.75 : -2.5, id: 1, who: "mc", expr: [[S.from, "steady"], [e02 - 8, "awe"], [x02 + 6, "steady"]] });
      put(w, f, LAO, { at: LB, facing: -2.45, id: 3, expr: "dry" });
    } else {
      const SEAT = P("hall", -1.42, 0, -4.5), MF = 0.41, LB = P("hall", -2.5, 0, -3.72);
      const AIM = [-1.56, 0.7, -4.44];
      camera = povCam(f, [
        ck("hall", CUT, [-0.75, 1.12, -2.95], AIM, 60),
        ck("hall", e09 - 6, [-0.75, 1.12, -2.95], AIM, 60),
        ck("hall", e09 + 6, [-0.8, 1.14, -2.9], [-2.5, 1.1, -3.72], 56),
        ck("hall", x09 + 4, [-0.8, 1.14, -2.9], [-2.5, 1.1, -3.72], 56),
        ck("hall", x09 + 22, [-0.75, 1.12, -2.95], AIM, 58),
        ck("hall", S.to, [-0.84, 1.1, -3.2], [-1.52, 0.76, -4.44], 52),
      ], { mood: "calm", amp: 0.6 });
      w.setCamera(camera);
      const down = Math.max(win(f, e05 - 6, e06 - 6, 8, 8), win(f, x09 + 20, S.to + 40, 14, 4));
      put(w, f, MANCANG, {
        at: SEAT, facing: MF, id: 1, who: "mc",
        expr: [[CUT, "think"], [screenOf("E05", 0) + 16, "bright"], [e06 - 2, "proud"], [e07 - 2, "bright"], [e08 - 4, "steady"], [screenOf("E08", 1) - 2, "shy"], [e09, "shy"], [x09 + 16, "steady"]],
        lookDown: 14 * down, gaze: f >= e05 && f < screenOf("E05", 0) + 16 ? 1 : 0,
        more: sit(SEAT, MF, 0.45, f / 30),
      });
      put(w, f, LAO, { at: LB, facing: 0.95, id: 3, who: "lb", expr: [[CUT, "dry"], [e09 - 4, "kind"], [x09 + 10, "heavy"]], lookDown: f >= x09 + 10 ? 12 : 0 });
    }
    w.update();
    const cols = letterCols(), paperK = later ? win(f, e04 - 4, S.to - 4, 12, 10) : 0;
    const overlays = frag(
      !later && h(NameStrip, { key: "yr", f, from: e01 + 6, to: x01 - 4, x: 380, y: 480, name: "杨瑞符", sub: "营长" }),
      !later && h(QuoteSeal, { key: "q1", f, from: x01 + 4, to: x01 + 44, x: 690, y: 540, src: "杨瑞符《孤军奋斗四日记》" }),
      !later && h(QuoteSeal, { key: "q2", f, from: x03 + 4, to: x03 + 46, x: 720, y: 560, src: "10月28日 · 对全营官兵" }),
      h(Letter, { key: "l", f, k: paperK, cols, x: 50, y: 800, scale: 0.84 }),
    );
    const dip = win(f, CUT - 9, CUT + 10, 8, 8);
    return { camera, overlays, top: h(Black, { k: dip }), post: { bloom: 0.6 } };
  },
};

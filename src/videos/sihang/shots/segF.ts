// SCENE F · 28 Oct, night, to first light on the 29th. A rope through a hole in the east wall: Shanghai is sending
// food. "记者先吃。" A tin with no pull ring ("城里人"). The paper says it: 八百孤军，死守四行. "我娘看得见不？"
// A folded cloth: "旗。对岸一个女学生送来的。" Then THE ROOF AT DAWN: the film never shows the flag; its shadow
// crosses the roof to the men's boots, and the far bank sees it (the second blackboard: 同胞与你们同在).
// CAMERA:
//   1  pre      the rope hole: two men hauling a sack in; the fact card
//   2  F01-F03  满仓 holds a tin out to her lens; 老班长 opens it with a bayonet point
//   3  F04-F06  老班长 reads the paper under the lantern; the headline clipping; 满仓's question
//   4  F07      the folded cloth in his hands; the seal after; a dip
//   5  roof     low on a row of faces looking up; the shadow slides to their boots; they salute; a pan right:
//               the far bank's roofs, hats in the air, the board
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { MANCANG, LAO, XIE_CAP, YANG, MEN, RUNNER } from "../people";
import { P, ck, put, startOf, screenOf, endOf, ky, rel, h, frag, win, hang, saluteHands, V } from "./kit";
import { Fact, Headline, Black } from "../hud/skin";

const S = seg("F");
const ROOF_ROW: [number, number][] = [[-1.9, -3.5], [-2.3, -2.55], [-2.7, -1.6], [-3.1, -3.95], [-3.5, -3.0], [-3.9, -2.05], [-4.4, -4.3], [-4.8, -3.4]];
export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    const f01 = startOf("F01"), x01 = endOf("F01"), f02 = startOf("F02"), f03 = startOf("F03"), x03 = endOf("F03"), f04 = startOf("F04"), x04 = endOf("F04"), f05 = startOf("F05");
    const f06 = startOf("F06"), x06 = endOf("F06"), f07 = startOf("F07"), x07 = endOf("F07");
    const CUT = x07 + 62, roof = f >= CUT;
    let camera, overlays;
    if (!roof) {
      w.setPlace("hall");
      w.set.param("time", "night"); w.set.param("lamp", "east");
      const MC = P("hall", 6.35, 0, -2.25), LB = P("hall", 7.25, 0, -2.75), MF = -0.5, LF = -0.95;
      const MCH = [6.35, 1.1, -2.25], LBH = [7.25, 1.16, -2.75];
      camera = povCam(f, [
        ck("hall", S.from, [5.3, 1.5, -1.0], [8.5, 0.95, -3.3], 58),
        ck("hall", f01 - 22, [5.5, 1.5, -1.0], [8.5, 0.95, -3.3], 54),
        ck("hall", f01 - 4, [5.45, 1.46, -0.6], MCH, 56),
        ck("hall", f03 - 6, [5.45, 1.46, -0.6], MCH, 56),
        ck("hall", f03 + 4, [5.5, 1.46, -0.7], LBH, 54),
        ck("hall", f05 - 6, [5.5, 1.46, -0.7], LBH, 54),
        ck("hall", f05 + 4, [5.45, 1.46, -0.6], MCH, 54),
        ck("hall", f06 - 6, [5.45, 1.46, -0.6], MCH, 54),
        ck("hall", f06 + 3, [5.5, 1.46, -0.7], LBH, 54),
        ck("hall", x07 + 10, [5.6, 1.44, -0.9], LBH, 50),
        ck("hall", CUT, [5.7, 1.4, -1.1], [7.2, 0.95, -2.7], 44),
      ], { mood: "calm", amp: 0.7 });
      w.setCamera(camera);
      // the rope gang: two men hauling at the hole, a sack coming through, sacks already in
      const pull = (f / 30) % 1.6;
      [[7.9, -3.3], [7.0, -3.45]].forEach(([x, z], i) => put(w, f, MEN[6 + i], { at: P("hall", x, 0, z), facing: Math.PI / 2, id: 50 + i, pose: { kind: "haul", t: f / 30 + i * 0.3 } as never, expr: "alert" }, `g${i}`));
      w.prop("sack", "in").put(P("hall", 8.75 - 0.35 * Math.min(1, pull / 1.2), 0.95, -3.3), { yaw: 0 });
      w.prop("sack", "a").put(P("hall", 8.2, 0, -4.1), { yaw: 0.4 }); w.prop("sack", "b").put(P("hall", 8.25, 0.24, -4.15), { yaw: -0.3 }); w.prop("sack", "c").put(P("hall", 7.5, 0, -4.3), { yaw: 1.2 });
      // 满仓: the tin held out to her; then listening, then asking
      const offer = win(f, f01 - 10, f03 + 6, 8, 8);
      const tinAt = rel(MC, MF, -0.06, 0.98 + 0.02 * Math.sin(f * 0.2), 0.44);
      put(w, f, MANCANG, {
        at: MC, facing: MF, id: 1, who: "mc",
        expr: [[S.from, "bright"], [f02, "bright"], [f04, "think"], [f05 - 2, "awe"], [screenOf("F05", 1) - 2, "shy"], [x06, "bright"], [f07, "awe"]],
        hands: offer > 0.02 ? [hang(MC, MF, 0).lerp(tinAt.clone().add(V(0, -0.03, 0)), offer), null] : undefined,
        gaze: f >= f04 && f < f05 - 2 ? -1 : 0,
      });
      if (offer > 0.5 && f < f03 - 4) w.prop("tin").put(tinAt, {});
      // 老班长: takes the tin and opens it on the bayonet's point; then the paper; then the cloth
      const tinL = f >= f03 - 4 && f < f04 - 10, paper = f >= f04 - 10 && f < f07 - 12, cloth = f >= f07 - 12;
      const hl = rel(LB, LF, -0.14, 0.92, 0.3), hr = rel(LB, LF, 0.14, 0.92, 0.3);
      put(w, f, LAO, {
        at: LB, facing: LF, id: 3, who: "lb",
        expr: [[S.from, "dry"], [f03 - 2, "halfLaugh"], [x03 + 8, "dry"], [f04 - 2, "alert"], [x04 + 2, "dry"], [f06 - 2, "kind"], [f07 - 4, "heavy"], [x07 + 6, "kind"]],
        hands: tinL || paper || cloth ? [hl, hr] : undefined, lookDown: paper && f < f06 - 8 ? 14 : cloth ? 10 : 0,
      });
      if (tinL) { w.prop("tin", "l").put(hr.clone().add(V(0, 0.02, 0)), {}); w.prop("bayonet").put(hl.clone().add(V(0, 0.08 + 0.02 * Math.sin(f * 0.9), 0)), { yaw: LF + 1.2, pitch: 1.2 }); }
      if (paper) w.prop("paper", "news").put(hl.clone().lerp(hr, 0.5).add(V(0, 0.1, 0)), { yaw: LF, pitch: -1.0 });
      if (cloth) w.prop("cloth").put(hl.clone().lerp(hr, 0.5).add(V(0, 0.0, 0)), { yaw: LF + Math.PI / 2 });
      w.update();
      overlays = frag(
        h(Fact, { key: "c", f, from: S.from + 20, to: f01 - 14, y: 520, rows: ["不到一天，上海市民捐的东西", "装满了十辆卡车"], stamp: "号外" }),
        h(Headline, { key: "hd", f, from: f04 + 2, to: f05 - 4 }),
        h(Fact, { key: "s", f, from: x07 + 8, to: CUT - 8, y: 540, rows: ["献旗的是女童子军杨惠敏", "怎么送到的，说法不一"] }),
      );
    } else {
      w.setPlace("roof");
      const t0 = CUT, UP = t0 + 26;
      const raise = ky(f, [[t0, 0.1], [UP + 80, 1]]), sal = ky(f, [[UP + 8, 0], [UP + 20, 1]]), LOOK = t0 + 122;
      w.set.param("raise", raise); w.set.param("cheer", ky(f, [[UP + 40, 0.15], [UP + 84, 1]])); w.set.param("board", f >= LOOK - 30 ? 2 : 0);
      camera = povCam(f, [
        ck("roof", t0, [2.3, 1.16, -1.55], [-2.6, 1.08, -2.9], 54),
        ck("roof", LOOK - 22, [2.1, 1.12, -1.6], [-2.6, 1.02, -2.9], 50),
        ck("roof", LOOK + 4, [2.3, 1.4, -4.2], [1.6, 0.6, -12], 52),          // she turns and walks to the parapet
        ck("roof", LOOK + 26, [2.5, 1.52, -7.5], [1.2, -14, -50], 44),        // over it: the creek, the far bank
        ck("roof", LOOK + 44, [2.5, 1.52, -7.55], [0.4, -20.3, -65.3], 30),   // the board
        ck("roof", S.to, [2.5, 1.52, -7.55], [0.2, -20.5, -65.3], 27),
      ], { mood: "calm", amp: 0.6, walk: [[t0, 0], [LOOK - 16, 0], [LOOK - 8, 1], [LOOK + 22, 1], [LOOK + 30, 0]] });
      w.setCamera(camera);
      const FACE = 1.9, people = [MANCANG, LAO, MEN[3], MEN[4], MEN[5], MEN[6], MEN[7], RUNNER];
      ROOF_ROW.forEach(([x, z], i) => {
        const at = P("roof", x, 0, z), sc = people[i].scale ?? 1;
        put(w, f, people[i], { at, facing: FACE, id: i === 0 ? 1 : i === 1 ? 3 : 60 + i, expr: i === 0 ? "awe" : i === 1 ? "heavy" : "calm", lookDown: -16, hands: i >= 2 && i <= 4 ? undefined : saluteHands(at, FACE, sal * (i % 2 ? 1 : Math.min(1, sal * 1.2)), sc) }, i < 2 ? "" : `t${i}`);   // the men under arms stand to attention
      });
      put(w, f, XIE_CAP, { at: P("roof", 0.2, 0, -4.9), facing: FACE + 0.1, id: 4, expr: "grave", lookDown: -16, hands: saluteHands(P("roof", 0.2, 0, -4.9), FACE + 0.1, sal, 1.02) });
      put(w, f, YANG, { at: P("roof", -0.5, 0, -5.6), facing: FACE + 0.1, id: 5, expr: "hard", lookDown: -16, hands: saluteHands(P("roof", -0.5, 0, -5.6), FACE + 0.1, sal, 1.03) });
      w.update();
      overlays = null;
    }
    const dip = Math.max(win(f, CUT - 8, CUT + 9, 7, 7), win(f, S.to - 6, S.to + 20, 6, 2));
    return { camera, overlays, top: h(Black, { k: dip }), post: { bloom: roof ? 0.35 : 0.6 } };
  },
};

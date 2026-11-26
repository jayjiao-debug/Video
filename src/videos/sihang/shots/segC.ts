// SCENE C · 27 Oct, morning. The south bank is watching: roofs and the quay black with people, a blackboard held up
// (敌在北站以东集结: the film's first 花字, and it is theirs). 老班长 reads it: "东边，准备。" The first attack: he
// teaches her the sounds (ours, ours, theirs). The bank cheers. "几点换班呀？" "八百也不换。"
// CAMERA:
//   1  pre       through the slit: the crowd, the board; a slow punch in on the board; the fact card above it
//   2  C01       back from the slit, round to 老班长 (left of the slit) as he turns and calls east
//   3  attack    she ducks behind the breastwork; dust; C02-C04 close on him, each sound a small jolt; C04 a big one
//   4  C05       her whisper; hold on him
//   5  C06       满仓 (right of the slit) peeking out; then the slit again: hats in the air
//   6  C07-C10   pans between the two; after: the 真事 seal; a shell's dust whites the lens out
import { seg, type Segment } from "../story";
import { povCam, duck } from "../cam";
import { MANCANG_RIFLE, LAO_RIFLE, MEN } from "../people";
import { P, ck, put, startOf, screenOf, endOf, ky, rel, h, frag, win, hit, shake, hang } from "./kit";
import { Fact, Wash } from "../hud/skin";

const S = seg("C");
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const c01 = startOf("C01"), e01 = endOf("C01"), c02 = startOf("C02"), c03 = startOf("C03"), c04 = startOf("C04"), e04 = endOf("C04"), e05 = endOf("C05");
    const c06 = startOf("C06"), e06 = endOf("C06"), c07 = startOf("C07"), c08 = startOf("C08"), c09 = startOf("C09"), c10 = startOf("C10"), e10 = endOf("C10");
    const fight = f >= e01 + 12 && f < c06 - 4;
    // the sounds she is taught: three reports (ours, ours, theirs: the last is close)
    const bang = Math.max(hit(f, c02 - 9, 8), hit(f, c03 - 9, 8)), near = hit(f, c04 - 8, 22);
    w.set.param("time", "day"); w.set.param("lamp", "none");
    w.set.param("board", f < e01 + 40 ? 1 : 0); w.set.param("cheer", ky(f, [[S.from, 0.45], [c06 - 10, 0.45], [c06 + 6, 1], [c07, 1], [c07 + 30, 0.5]]));
    w.set.param("dust", Math.min(1, 0.35 * (fight ? 1 : 0) + near + 0.9 * win(f, e10 + 30, S.to + 30, 10, 2)));
    const LB = P("hall", -1.02, 0, -5.22), MC = P("hall", 0.8, 0, -5.05);
    const LBH = [-1.02, 1.16, -5.22], MCH = [0.8, 1.1, -5.05];
    // --- the camera
    let camera = povCam(f, [
      ck("hall", S.from, [0.0, 1.44, -5.6], [0.0, 2.3, -60], 50),
      ck("hall", S.from + 40, [0.0, 1.44, -5.6], [0.0, 2.3, -60], 50),
      ck("hall", c01 - 34, [0.0, 1.44, -5.62], [0.0, 3.9, -62], 21),
      ck("hall", c01 - 12, [0.0, 1.44, -5.62], [0.0, 3.9, -62], 21),
      ck("hall", c01 + 6, [-0.62, 1.44, -3.72], LBH, 56),
      ck("hall", e01 + 10, [-0.62, 1.44, -3.72], LBH, 56),
      ck("hall", e01 + 22, [-0.55, 1.3, -3.7], LBH, 54),
      ck("hall", e05 + 10, [-0.55, 1.3, -3.7], LBH, 54),
      ck("hall", c06 - 2, [-0.4, 1.38, -3.6], MCH, 54),
      ck("hall", e06 + 2, [-0.4, 1.38, -3.6], MCH, 54),
      ck("hall", e06 + 12, [0.0, 1.44, -5.6], [1.0, 2.6, -60], 34),
      ck("hall", c07 - 6, [0.0, 1.44, -5.6], [1.0, 2.6, -60], 32),
      ck("hall", c07 + 8, [-0.55, 1.42, -3.7], LBH, 56),
      ck("hall", c09 - 5, [-0.55, 1.42, -3.7], LBH, 56),
      ck("hall", c09 + 1, [-0.55, 1.42, -3.7], MCH, 54),
      ck("hall", c10 - 4, [-0.55, 1.42, -3.7], MCH, 54),
      ck("hall", c10 + 3, [-0.55, 1.42, -3.7], LBH, 54),
      ck("hall", S.to, [-0.55, 1.42, -3.65], LBH, 52),
    ], { mood: [[S.from, "calm"], [e01 + 10, "scared"], [c06 - 6, "calm"]], amp: 0.8 });
    camera = duck(camera, f, e01 + 12, c06 - 10, { to: 1.12, len: 7 });
    camera = shake(camera, f, c02 - 9, 7, 3, 8); camera = shake(camera, f, c03 - 9, 7, 3, 8); camera = shake(camera, f, c04 - 8, 26, 3, 16);
    camera = shake(camera, f, e10 + 34, 30, 3, 18);
    w.setCamera(camera);
    // --- men at the other windows, rifles at the slits (backs to her)
    [[-5.2, -5.1, 3.1], [-4.0, -5.1, 3.2], [4.1, -5.1, 3.0], [5.3, -5.1, 3.25]].forEach(([x, z, fc], i) => put(w, f, MEN[3 + (i % 3)], { at: P("hall", x, 0, z), facing: fc, id: 30 + i, expr: "alert" }, `w${i}`));
    // --- 老班长: at the slit (looking out) -> turned to the room: "东边，准备" -> down behind the sacks with her, a finger up at each sound
    const lbTurn = ky(f, [[c01 - 8, 0], [c01 + 4, 1]]);
    const lbF = 2.75 + (0.62 - 2.75) * lbTurn;
    const finger = Math.max(win(f, c02 - 2, c02 + 16, 4, 6), win(f, c03 - 2, c03 + 18, 4, 6), win(f, c04 - 2, e04 + 4, 4, 8));
    put(w, f, LAO_RIFLE, {
      at: LB, facing: lbF, id: 3, who: "lb",
      expr: [[S.from, "dry"], [c01 - 4, "alert"], [c02 - 6, "dry"], [c04 - 10, "alert"], [e04 + 10, "dry"], [c08 - 2, "halfLaugh"], [screenOf("C08", 1), "dry"], [c10 - 2, "halfLaugh"], [e10 + 8, "kind"]],
      hands: finger > 0.02 ? [null, hang(LB, lbF, 1).lerp(rel(LB, lbF, 0.2, 1.22, 0.2), finger)] : undefined,
      head: near > 0.05 ? { dy: -0.06 * near } : undefined,
      gaze: f >= c08 && f < c09 ? 0 : 0,
    });
    // --- 满仓: at the slit's other side, rifle grounded; he ducks at the close one; he peeks out and cannot believe it
    const peek = win(f, c06 - 14, c07 - 4, 8, 8);
    const mcF = -0.55 + (-2.6 + 0.55) * peek * (f < e06 + 4 ? 0.55 : 1);
    put(w, f, MANCANG_RIFLE, {
      at: MC, facing: mcF, id: 1, who: "mc",
      expr: [[S.from, "bright"], [e01 + 8, "stunned"], [e05, "bright"], [c06 - 12, "awe"], [c07, "bright"], [c09 - 3, "steady"], [c10, "bright"]],
      head: near > 0.05 ? { dy: -0.12 * near } : bang > 0.05 ? { dy: -0.05 * bang } : undefined,
      lean: near > 0.05 ? { pitch: 10 * near } : undefined,
    });
    w.update();
    const overlays = frag(
      h(Fact, { key: "c", f, from: S.from + 24, to: c01 - 16, y: 470, rows: ["对岸观战的人", "最多时约三万"], stamp: "号外" }),
      h(Fact, { key: "s", f, from: e10 + 5, to: e10 + 40, y: 520, rows: ["四天四夜，没人合眼"] }),
    );
    const white = win(f, e10 + 36, S.to + 40, 8, 2);
    return { camera, overlays, top: h(Wash, { k: 0.92 * white, col: "#e9e2d2" }), post: { bloom: 0.4 } };
  },
};


// SCENE D · 28 Oct, first light. NO EFFECTS IN THIS SCENE. A young soldier stands at the west window with his back to
// us, stick grenades tied round his waist, looking down. 老班长: "在挖墙脚。要炸楼。" She turns to him; when she
// looks back the window is empty. "你——" Then the blast below. Plain white words: 陈树生，二十一岁。1937年10月28日。
// 满仓 takes his helmet off. Black.  (陈树生 is a real man: only his back is ever shown.)
// CAMERA:
//   1  pre     his back at the window, a slow push
//   2  D01     pan to 老班长 (to the right, by the sacks)
//   3  gap     his eyes go to the window; she whips back: the window is empty
//   4  D02     "你——"; a beat; the blast: light from below, the room shakes, dust
//   5  after   hold on the empty window: the white words; then down to 满仓, bare-headed, his helmet in his hand; black
import { seg, type Segment } from "../story";
import { povCam, whip } from "../cam";
import { MANCANG, MANCANG_BARE, LAO_RIFLE, CHEN } from "../people";
import { P, ck, put, startOf, endOf, ky, h, frag, win, hit, shake, bow } from "./kit";
import { Wash, WhiteWords, Black } from "../hud/skin";

const S = seg("D");
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const d01 = startOf("D01"), e01 = endOf("D01"), d02 = startOf("D02"), e02 = endOf("D02");
    const GONE = e01 + 30, BLAST = e02 + 20, WORDS = BLAST + 62, OFF = S.to - 44, BLACK = S.to - 8;
    const blast = hit(f, BLAST, 34);
    w.set.param("time", "dawn"); w.set.param("lamp", "none");
    w.set.param("flash", Math.min(1, 1.3 * blast)); w.set.param("dust", f >= BLAST ? Math.min(1, (f - BLAST) / 8) * (1 - 0.5 * Math.min(1, (f - BLAST) / 160)) : 0);
    const WIN = [-7.1, 1.5, -2.6], LB = P("hall", -5.3, 0, -4.9), MC = P("hall", -5.0, 0, -1.2);
    // --- the camera
    let camera = povCam(f, [
      ck("hall", S.from, [-3.7, 1.5, -3.75], WIN, 58),
      ck("hall", d01 - 8, [-4.0, 1.5, -3.6], WIN, 54),
      ck("hall", d01 + 6, [-4.0, 1.48, -3.6], [-5.3, 1.18, -4.9], 54),
      ck("hall", GONE - 5, [-4.0, 1.48, -3.6], [-5.3, 1.18, -4.9], 54),
      ck("hall", GONE + 2, [-4.0, 1.5, -3.6], WIN, 54),
      ck("hall", OFF - 40, [-4.05, 1.5, -3.55], WIN, 52),
      ck("hall", OFF - 12, [-3.7, 1.46, -2.9], [-5.0, 1.1, -1.2], 50),
      ck("hall", S.to, [-3.7, 1.46, -2.9], [-5.0, 1.1, -1.2], 50),
    ], { mood: [[S.from, "calm"], [GONE, "scared"], [BLAST + 60, "calm"]], amp: 0.7 });
    const wp = whip(camera, f, GONE - 4, { dir: -1, deg: 18 }); camera = wp.cam;
    camera = shake(camera, f, BLAST, 34, 3.4, 28);
    w.setCamera(camera);
    // --- 陈树生: his back, at the sill. Gone when she looks again.
    if (f < GONE - 2) put(w, f, CHEN, { at: P("hall", -6.45, 0, -2.6), facing: -Math.PI / 2, id: 9, lookDown: 14 });
    // --- 老班长: by the sacks, watching the window
    put(w, f, LAO_RIFLE, {
      at: LB, facing: 0.75, id: 3, who: "lb", gaze: f >= e01 + 8 && f < GONE + 20 ? 1 : 0,
      expr: [[S.from, "alert"], [e01 + 12, "stunned"], [BLAST + 40, "heavy"]], ...(f >= BLAST + 50 ? { lookDown: 16 } : {}),
    });
    // --- 满仓: by the column; after the words he has his helmet in his hand and his head down
    const off = f >= OFF;
    put(w, f, off ? MANCANG_BARE : MANCANG, { at: MC, facing: 0.95, id: 1, expr: [[S.from, "stunned"], [BLAST + 30, "sorrow"]], more: off ? bow(ky(f, [[OFF, 0.3], [OFF + 20, 1]]), 22) : undefined });
    w.update();
    const top = frag(
      h(Wash, { key: "w", k: 0.85 * hit(f, BLAST, 16), col: "#fff6e6" }),
      h(WhiteWords, { key: "t", f, rows: [{ text: "陈树生，二十一岁。", from: WORDS }, { text: "1937年10月28日。", from: WORDS + 34, px: 46 }], to: OFF - 6, y: 1010 }),
      h(Black, { key: "b", k: win(f, BLACK, S.to + 30, 6, 2) }),
    );
    return { camera, top, post: { bloom: 0.45, ...(wp.post ?? {}) }, cards: false };
  },
};


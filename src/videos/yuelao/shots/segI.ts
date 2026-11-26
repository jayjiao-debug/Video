// SCENE I · 22:55. THE FIX HE DID NOT MAKE: beside him on the step he finds an old, dusty thread under his own: it runs
// from her door to the rider's scooter and was there long before today. He lifts his off it. She comes out; the rider
// has put an extra egg in tonight's order; she asks his name. The old thread lights up; the target is met. He jumps
// up and claims it ("all mine!"); the reporter points out it was there already; he coughs: file it as 缘分已到.
// CAMERA: down to the step with his hand; along the old thread up to the door and across to the scooter; back to his
// face; then the two of them by the scooter, and 月老 jumping into the foreground.
import { seg, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { P, ck, lead, put, sit, startOf, endOf, wordAt, ky, h, frag, hit, walkAlong, faceTo, v3, rel, V, thread, ring, hopArc } from "./kit";
import { XIAOMAN, RIDER } from "../people";
import { Hua, FateStamp, OS } from "../hud/skin";
import { SEAT, SEAT_TOP, SEAT_FACING, LANDING, INSIDE, BY_SCOOTER, HER_STOP, DOWN, oldThread, hisThread } from "./night";

const S = seg("I");
export const SEG: Segment = {
  id: "I", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    const i01 = startOf("I01"), x01 = endOf("I01"), i02 = startOf("I02"), x02 = endOf("I02"), i03 = startOf("I03"), x03 = endOf("I03"), i04 = startOf("I04"), i05 = startOf("I05"), x05 = endOf("I05"), i06 = startOf("I06"), x06 = endOf("I06"), i07 = startOf("I07"), i08 = startOf("I08");
    const out = i04 - 140, doorK = ky(f, [[out - 12, 0], [out, 1], [out + 60, 1], [out + 76, 0]]);
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", doorK); w.set.param("lit", 0.35); w.set.param("moon", 0.8);
    const t = f / 30, see = wordAt("I01", "这根") - 6, jump = i06 - 6;
    const camera0 = povCam(f, [
      ck("street", S.from, [-0.36, 0.98, -1.0], [-0.85, 0.93, -2.3], 42),
      ck("street", see, [-0.36, 1.0, -1.0], [-0.8, 0.93, -2.3], 43),
      ck("street", see + 14, [-0.25, 1.3, -0.85], [0.2, 0.22, -2.2], 50),
      ck("street", i02 - 2, [-0.25, 1.3, -0.85], [0.25, 0.22, -2.2], 50),
      ck("street", i02 + 26, [-0.1, 1.42, -0.5], [0.3, 0.9, -3.2], 52),
      ck("street", x02 - 6, [0.0, 1.45, -0.2], [1.9, 0.5, -1.15], 52),
      ck("street", i03 - 8, [0.0, 1.45, -0.2], [2.1, 0.7, -1.05], 52),
      ck("street", i03 + 6, [-0.3, 1.05, -0.8], [-0.85, 0.93, -2.3], 44),
      ck("street", x03 + 8, [-0.3, 1.05, -0.8], [-0.85, 0.93, -2.3], 43),
      ck("street", i04 - 14, [0.7, 1.48, 1.0], [1.85, 0.98, -1.15], 56),
      ck("street", jump - 4, [0.7, 1.48, 0.95], [1.85, 0.98, -1.15], 55),
      ck("street", jump + 8, [0.6, 1.48, 1.0], [0.95, 1.06, -0.4], 54),
      ck("street", S.to, [0.6, 1.48, 1.0], [0.95, 1.04, -0.4], 53),
    ], { mood: "calm", amp: 0.7, walk: [[S.from, 0], [x03 + 8, 0], [x03 + 16, 0.4], [i04 - 16, 0]] });
    const camera = punchIn(camera0, f, wordAt("I05", "名字") + 4, { k: 0.86, len: 6, off: jump - 6 });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // 月老: on the step, then up in front of the lens
    const FRONT = P("street", 0.95, 0, -0.4);
    const reach = ky(f, [[see + 4, 0], [see + 16, 1], [x02 - 8, 1], [x02 + 4, 0]]);
    const pick = P("street", -0.2, 0.5, -2.3);
    let yl;
    if (f < jump) {
      yl = lead(w, f, {
        at: SEAT, facing: SEAT_FACING + 0.5 * reach, more: sit(SEAT, SEAT_FACING + 0.5 * reach, SEAT_TOP, t),
        hands: reach > 0.02 ? [rel(SEAT, SEAT_FACING, -0.17, 0.5, 0.2).lerp(pick, reach), null] : undefined,
        expr: [[S.from, "quiet"], [i01 - 2, "suspicious"], [see + 6, "wonder"], [i02 - 2, "look"], [wordAt("I02", "让我") - 2, "wry"], [x02, "quiet"], [i03 - 2, "warm"], [x03 + 20, "smile"], [i04, "look"], [i05, "wonder"], [wordAt("I05", "名字"), "joy"]],
        lookDown: 16 * reach * ky(f, [[i02 + 10, 1], [i02 + 26, 0]]), gaze: f >= i04 - 20 ? -0.7 : reach > 0.5 ? -0.5 : 0, turn: f >= i04 - 20 ? -0.45 : undefined,
      });
    } else {
      const u = (f - jump) / 9, at = hopArc(P("street", 0.6, 0, -0.9), FRONT, u, 0.3), hop = f >= i06 && f < x06 ? 0.06 * Math.abs(Math.sin((f - i06) * 0.42)) : 0;
      at.y += hop;
      const facing = faceTo(FRONT, camP), bowK = ky(f, [[i07 + 10, 0], [i07 + 22, 1], [i08 + 30, 1], [i08 + 40, 0]]);
      yl = lead(w, f, {
        at, facing, pose: f < x06 + 4 ? { kind: "cheer", t } : undefined,
        hands: f >= i08 && f < i08 + 34 ? [rel(at, facing, -0.06, 0.98, 0.26), null] : undefined,
        expr: [[jump, "joy"], [i06, "shout"], [x06 + 2, "beam"], [i07 + 8, "small"], [i08 - 2, "cough"], [wordAt("I08", "这句") - 2, "hush"], [wordAt("I08", "缘分") - 2, "sly"]],
        lookDown: 8 * bowK, lean: f >= wordAt("I08", "这句") - 2 ? { pitch: 6 } : undefined,
        head: { dy: 0.05 * hit(f, wordAt("I06", "快记"), 8) },
      });
    }
    // the rider waits by his scooter; she comes down the steps to him
    const waveK = ky(f, [[i04 - 8, 0], [i04, 1], [i04 + 26, 1], [i04 + 34, 0]]);
    const legX = walkAlong([INSIDE, ...DOWN], 1.7, (f - out) / 30, {}), wk = legX.pose.kind === "walk";
    const rd = put(w, f, RIDER, {
      at: BY_SCOOTER, facing: f >= i04 - 30 ? faceTo(BY_SCOOTER, HER_STOP) : 0.3, id: 4, who: "qs",
      pose: waveK > 0.3 ? { kind: "wave", t, arm: 0 } : f < i04 - 30 ? { kind: "phone", t, amount: 0, arm: 1 } : undefined,
      expr: [[S.from, "calm"], [i04 - 20, "beam"], [wordAt("I04", "今天") - 2, "shy"], [i05, "look"], [wordAt("I05", "名字"), "beam"]],
      lookDown: f < i04 - 30 ? 12 : 0,
    });
    let xm = null as ReturnType<typeof put> | null;
    if (f >= out) xm = put(w, f, XIAOMAN, {
      at: legX.at, facing: wk ? legX.facing : faceTo(HER_STOP, BY_SCOOTER), id: 2, who: "xm", pose: wk ? legX.pose : undefined,
      expr: [[out, "tired"], [i04 + 4, "look"], [wordAt("I04", "今天") + 10, "wonder"], [i05 - 2, "shy"], [wordAt("I05", "你叫") - 2, "smile"], [x05 + 6, "beam"]],
      lookDown: f >= i05 - 2 && f < wordAt("I05", "你叫") - 4 ? 10 : 0,
    });
    w.update();
    // the threads
    const gold = ky(f, [[see + 10, 0], [x01 + 10, 0.45], [i05, 0.5], [wordAt("I05", "名字"), 1]]);
    const hisCut = ky(f, [[x02 - 12, 1], [x02 + 6, 0]]);
    if (f < wordAt("I05", "你叫")) oldThread(w, gold);
    else if (xm) {
      const a = xm.footWorld(1).add(V(0, 0.06, 0)), b = rd.footWorld(0).add(V(0, 0.06, 0));
      ring(w, "ra", a, 0.05, 0.25); ring(w, "rb", b, 0.05, 0.25);
      w.props.thread("old", w.props.hang(a, b, 0.03, 5), { r: 0.008, glow: 1, col: "#ffcf6a" });
    }
    if (hisCut > 0.02) hisThread(w, reach, yl.handWorld(0), hisCut);
    const overlays = frag(
      h(OS, { key: "o", f, from: i02 + 30, to: i03 - 6, x: 110, y: 560, text: "从她门口，到他车上" }),
      h(Hua, { key: "a", f, from: wordAt("I04", "多加") , to: i05 - 2, text: "+1 蛋", x: 300, y: 640, px: 120, rot: -8, col: "#f8efd8" }),
      h(Hua, { key: "b", f, from: i06 + 2, to: x06 + 2, text: "成了！！", x: 540, y: 600, px: 150, rot: -5 }),
      h(Hua, { key: "c", f, from: i07 + 4, to: i08 - 2, text: "……是吗？", x: 780, y: 700, px: 92, rot: 6, col: "#f8efd8" }),
      h(FateStamp, { key: "f", f, from: wordAt("I08", "缘分") + 2, to: S.to - 3, x: 600, y: 640, ok: true }),
    );
    void LANDING;
    return { camera, overlays };
  },
};

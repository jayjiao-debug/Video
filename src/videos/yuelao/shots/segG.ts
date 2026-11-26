// SCENE G · 22:00, the street under her tower. HE HAS LOST THE THREAD: it is wound round her camera. While he picks it
// off the lens, the delivery rider trots up the steps behind him; she comes out; 「又是你啊」. He sees none of it, sits
// down on the step: one hour left, it is over.
// CAMERA: threads across the lens; he comes right up to it; a turn to the door for the delivery; down to him on the step.
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { P, ck, lead, put, sit, startOf, endOf, wordAt, ky, h, frag, hit, walkAlong, faceTo, v3, rel, V, thread, inHand } from "./kit";
import { XIAOMAN, RIDER } from "../people";
import { Hua, OS } from "../hud/skin";
import { SEAT, SEAT_TOP, SEAT_FACING, LANDING, INSIDE, UP, oldThread, hisThread } from "./night";

const S = seg("G");
export const SEG: Segment = {
  id: "G", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    const g01 = startOf("G01"), g02 = startOf("G02"), x02 = endOf("G02"), g03 = startOf("G03"), g04 = startOf("G04"), x04 = endOf("G04"), g05 = startOf("G05");
    const doorK = ky(f, [[g03 - 26, 0], [g03 - 12, 1], [x04 + 30, 1], [x04 + 46, 0]]);
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", doorK); w.set.param("lit", 0.5); w.set.param("moon", 0.3);
    const t = f / 30, sat = g03 - 8;
    const camera = povCam(f, [
      ck("street", S.from, [-0.3, 1.5, 1.5], [-0.5, 1.02, -0.7], 56),
      ck("street", g02 + 8, [-0.3, 1.5, 1.5], [-0.38, 1.05, 0.2], 56),
      ck("street", x02 + 2, [-0.3, 1.5, 1.5], [-0.38, 1.05, 0.2], 56),
      ck("street", g03 - 2, [-0.15, 1.5, 1.3], [0.45, 1.1, -3.0], 50),
      ck("street", x04 + 8, [-0.15, 1.5, 1.25], [0.45, 1.1, -3.0], 49),
      ck("street", g05 - 2, [-0.45, 1.36, 0.0], [-0.85, 0.93, -2.3], 48),
      ck("street", S.to, [-0.45, 1.34, -0.1], [-0.85, 0.93, -2.3], 47),
    ], { mood: "calm", amp: 0.8, walk: [[S.from, 0], [x04 + 8, 0], [x04 + 16, 0.4], [g05 - 4, 0]] });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // 月老: searching, to the lens, then on the step
    const LOOKING = P("street", -0.5, 0, -0.7), LENS = P("street", -0.36, 0, 0.45);
    let yl;
    if (f < sat) {
      const leg = walkAlong([LOOKING, LENS], 1.6, (f - (g02 - 10)) / 30, {}), walking = leg.pose.kind === "walk", at = leg.at, near = f >= g02 + 12;
      const facing = walking || near ? faceTo(at, camP) : 0.9 * Math.sin((f - S.from) * 0.11);
      const pick = near ? 1 : 0, pat = !near && !walking ? 1 : 0;
      yl = lead(w, f, {
        at, facing, pose: walking ? leg.pose : undefined,
        hands: pick ? [rel(at, facing, -0.1 + 0.03 * Math.sin(f * 0.9), 1.28, 0.34), rel(at, facing, 0.12 - 0.03 * Math.sin(f * 0.9), 1.24 + 0.03 * Math.cos(f * 0.9), 0.34)] : pat ? [rel(at, facing, -0.14, 0.72 + 0.1 * Math.sin(f * 0.7), 0.2), rel(at, facing, 0.14, 0.72 - 0.1 * Math.sin(f * 0.7), 0.2)] : undefined,
        expr: [[S.from, "panic"], [g01 + 20, "shout"], [g02 - 6, "suspicious"], [g02, "strain"], [x02 - 8, "proud"]],
        lookDown: pat ? 10 : pick ? -8 : 0,
      });
    } else {
      yl = lead(w, f, {
        at: SEAT, facing: SEAT_FACING, more: sit(SEAT, SEAT_FACING, SEAT_TOP, t),
        expr: [[sat, "tired"], [g05 - 2, "sag"], [wordAt("G05", "完了") - 3, "small"]],
        lookDown: f < g05 - 6 ? 16 : 10 * ky(f, [[wordAt("G05", "完了") - 4, 0], [wordAt("G05", "完了") + 6, 1]]),
        head: { dy: -0.06 * ky(f, [[wordAt("G05", "完了") - 4, 0], [wordAt("G05", "完了") + 6, 1]]) },
      });
    }
    // the rider and her: only around the delivery
    const rgo = g03 - 78, back = x04 + 10;
    let rd = null as ReturnType<typeof put> | null, xm = null as ReturnType<typeof put> | null;
    if (f >= rgo) {
      const legR = f < back ? walkAlong(UP, 2.3, (f - rgo) / 30, {}) : walkAlong([...UP].reverse(), 2.0, (f - back) / 30, { endFacing: -1.2 });
      const walking = legR.pose.kind === "walk", hand = f >= g03 - 6 && f < wordAt("G04", "谢谢") + 8;
      rd = put(w, f, RIDER, {
        at: legR.at, facing: walking ? legR.facing : f < back ? faceTo(legR.at, LANDING) : -1.2, id: 4, who: "qs", pose: walking ? legR.pose : undefined,
        hands: hand && !walking ? [null, rel(legR.at, faceTo(legR.at, LANDING), 0.1, 0.8, 0.3)] : undefined,
        expr: [[rgo, "calm"], [g03 - 4, "beam"], [g04, "smile"], [back, "calm"]],
      });
      const out = g03 - 14, inn = x04 + 16;
      if (f >= out && f < inn + 40) {
        const legX = f < inn ? walkAlong([INSIDE, LANDING], 1.4, (f - out) / 30, {}) : walkAlong([LANDING, INSIDE], 1.4, (f - inn) / 30, {});
        const wk = legX.pose.kind === "walk";
        xm = put(w, f, XIAOMAN, {
          at: legX.at, facing: wk ? legX.facing : faceTo(legX.at, rd.group.position.clone().setY(legX.at.y)), id: 2, who: "xm", pose: wk ? legX.pose : undefined,
          expr: [[out, "tired"], [g04 - 2, "polite"], [wordAt("G04", "又是") - 2, "smile"], [inn, "flat"]],
          hands: !wk && f >= wordAt("G04", "谢谢") + 2 ? [rel(legX.at, 0.6, -0.1, 0.72, 0.26), null] : undefined,
        });
      }
    }
    w.update();
    // the bag: in his hand, then in hers
    if (rd && f < wordAt("G04", "谢谢") + 8) inHand(w, "bag", rd, 1, { dy: -0.27 });
    else if (xm) inHand(w, "bag", xm, 0, { dy: -0.27 });
    // the threads round her lens (gone when he has picked them off)
    const offK = ky(f, [[x02 - 10, 1], [x02 + 2, 0]]);
    if (f < sat && offK > 0.02) {
      const c = camP;
      thread(w, "l0", c.clone().add(V(-0.42, 0.2, -0.42)), c.clone().add(V(0.4, -0.16, -0.44)), 0.06, { r: 0.005, cut: offK });
      thread(w, "l1", c.clone().add(V(0.42, 0.24, -0.5)), c.clone().add(V(-0.36, -0.2, -0.46)), 0.04, { r: 0.005, cut: offK });
      thread(w, "l2", c.clone().add(V(-0.44, -0.05, -0.4)), c.clone().add(V(0.44, 0.02, -0.42)), 0.09, { r: 0.005, cut: offK });
      thread(w, "l3", c.clone().add(V(0.1, -0.3, -0.42)), yl.handWorld(0), 0.2, { r: 0.006 });
    }
    oldThread(w, 0);
    if (f >= sat) hisThread(w);
    const overlays = frag(
      h(Hua, { key: "a", f, from: g01 + 4, to: g02 - 4, text: "线呢？！", x: 540, y: 640, px: 130, rot: -6 }),
      h(OS, { key: "o", f, from: g02 + 10, to: x02 + 4, x: 110, y: 560, text: "原来在我机器上……" }),
      h(Hua, { key: "b", f, from: wordAt("G04", "又是") - 1, to: x04 + 10, text: "又是你？", x: 300, y: 640, px: 104, rot: -6, col: "#f8efd8" }),
      h(Hua, { key: "c", f, from: wordAt("G05", "完了") , to: S.to - 4, text: "完了……", x: 760, y: 680, px: 110, rot: 6 }),
    );
    void hit; void P;
    return { camera, overlays };
  },
};

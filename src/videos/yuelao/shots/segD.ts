// SCENE D · 11:00. THE ORDER: the burner smokes: a rush prayer from the 月老 temple. He runs over; the mother's voice
// comes out of the smoke (her daughter is 30, works every night, "I am not getting up until it is done"); the order slip
// builds on screen. He picks the case: 林小满, tonight. He pushes the spool at the lens and hurries her out.
// CAMERA: a whip to the burner as he runs; she steps in on the smoke; he comes up to the lens with the spool and leaves
// past her shoulder.
import { seg, type Segment } from "../story";
import { povCam, whip, whipSmear } from "../cam";
import { P, ck, lead, startOf, endOf, wordAt, ky, h, frag, hit, walkAlong, faceTo, v3, rel, inHand } from "./kit";
import { OrderSlip, Hua } from "../hud/skin";

const S = seg("D");
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.42); w.set.param("kpi", 0);
    const d01 = startOf("D01"), d02 = startOf("D02"), d03 = startOf("D03"), e03 = endOf("D03"), d04 = startOf("D04"), d05 = startOf("D05"), e05 = endOf("D05");
    w.set.param("smoke", ky(f, [[S.from + 2, 0], [d01, 1], [e03, 1], [d04 + 20, 0.25]]));
    const CAB = P("office", -1.95, 0, -0.35), BURN = P("office", 1.7, 0, 0.4), NEAR = P("office", 0.75, 0, 1.75);
    const run = walkAlong([CAB, P("office", -0.4, 0, 0.3), BURN], 3.0, (f - (d01 - 4)) / 30, {});
    const come = d05 - 8, out = e05 + 2;
    const leg2 = f >= out ? walkAlong([NEAR, P("office", 0.75, 0, 2.6), P("office", 0.7, 0, 3.6)], 2.2, (f - out) / 30, {}) : f >= come ? walkAlong([BURN, NEAR], 2.0, (f - come) / 30, {}) : null;
    const camA = povCam(f, [
      ck("office", S.from, [-0.6, 1.48, 1.3], [-1.95, 1.36, -0.35], 55),
      ck("office", d01 - 6, [-0.6, 1.48, 1.3], [-1.95, 1.3, -0.35], 55),
    ], { mood: "calm", amp: 0.7 });
    const camB = povCam(f, [
      ck("office", d01, [0.1, 1.5, 2.45], [1.55, 1.05, 0.6], 56),
      ck("office", d02 + 10, [0.25, 1.48, 2.3], [1.2, 1.1, 0.6], 54),
      ck("office", d04 - 4, [0.25, 1.48, 2.3], [1.2, 1.1, 0.6], 54),
      ck("office", d04 + 8, [0.2, 1.48, 2.4], [1.6, 1.02, 0.45], 54),
      ck("office", come, [0.2, 1.48, 2.4], [1.6, 1.02, 0.45], 54),
      ck("office", come + 14, [0.2, 1.48, 2.5], [0.75, 1.0, 1.75], 56),
      ck("office", out + 2, [0.2, 1.48, 2.5], [0.75, 1.0, 1.75], 56),
      ck("office", out + 22, [0.15, 1.5, 2.55], [0.9, 1.1, 3.0], 58),
    ], { mood: "calm", amp: 0.8, walk: [[d01, 0], [d02, 0.3], [d02 + 10, 0], [out, 0], [out + 10, 0.6]] });
    const Wp = whip(camA, f, d01 - 5, { dir: 1, to: camB });
    const camera = f < d01 - 5 ? camA : Wp.cam;
    w.setCamera(camera);
    const camP = v3(camera.pos);
    const leg = leg2 ?? run, walking = leg.pose.kind === "walk";
    const facing = walking ? leg.facing : f < d04 - 6 ? faceTo(leg.at, P("office", 2.3, 0, 1.0)) * 0.55 + faceTo(leg.at, camP) * 0.45 : faceTo(leg.at, camP);
    const slipK = ky(f, [[d04 - 10, 0], [d04 - 2, 1], [d05 - 12, 1], [d05 - 6, 0]]), give = ky(f, [[come + 10, 0], [come + 18, 1], [out, 1], [out + 6, 0]]);
    const at = leg.at;
    const hands = give > 0.02 ? [rel(at, facing, -0.05, 0.62 + 0.42 * give, 0.1 + 0.34 * give), null] as [typeof at, null] : slipK > 0.02 && !walking ? [null, rel(at, facing, 0.14, 0.6 + 0.2 * slipK, 0.26)] as [null, typeof at] : undefined;
    const r = lead(w, f, {
      at, facing, pose: walking ? leg.pose : undefined, hands,
      expr: [[S.from, "sag"], [S.from + 8, "wonder"], [d01 - 2, "shout"], [d02 - 2, "look"], [d02 + 50, "worry"], [d03 - 2, "panic"], [d04 - 4, "proud"], [wordAt("D04", "今晚") - 2, "shout"], [d05 - 2, "beam"], [out, "proud"]],
      head: { dy: 0.06 * hit(f, d04, 8) + 0.05 * hit(f, wordAt("D04", "今晚"), 8) },
      lookDown: 8 * ky(f, [[d02, 0], [d02 + 10, 1], [d04 - 8, 1], [d04 - 2, 0]]),
    });
    w.update();
    if (slipK > 0.3 && !walking && !give) inHand(w, "slip", r, 1, { dy: 0.04, yaw: facing });
    if (give > 0.3) inHand(w, "spool", r, 0, { dy: 0.0, yaw: facing });
    const overlays = frag(
      whipSmear(Wp.smear, 1),
      h(Hua, { key: "a", f, from: wordAt("D01", "加急") - 1, to: d02 + 6, text: "加急！", x: 300, y: 620, px: 130, rot: -8 }),
      h(OrderSlip, { key: "s", f, from: d02 + 8, to: d04 + 6, x: 300, y: 660 }),
      h(Hua, { key: "b", f, from: wordAt("D03", "不起来") - 1, to: e03 + 6, text: "妈妈跪了", x: 740, y: 1120, px: 92, rot: 6, col: "#f8efd8" }),
      h(Hua, { key: "c", f, from: wordAt("D04", "今晚") - 1, to: d05 - 4, text: "今晚必须成！", x: 540, y: 600, px: 100, rot: -4 }),
    );
    return { camera, overlays, post: Wp.post };
  },
};

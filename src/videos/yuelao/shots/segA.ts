// SCENE A · 08:00, 天庭姻缘司. THE COLD OPEN: she walks in on 月老 stuck waist-deep in a heap of tangled red thread, a
// thread in his teeth, picking at a knot. 「月老？您被线绑架了？」 「别动！一动，三对离婚。」 HIS CARD (the picture freezes; he
// is lifted into a full moon). He yanks the knot free, peers into her lens, decides she is heaven's inspector, and bows
// her in. THE TITLE over the bureau as he shuffles to his desk.
// CAMERA (one take, her eyes):
//   1  open      close on him in the heap, working the knot with his teeth; a slow step in
//   2  A02       PUNCH IN on 「三对离婚」; the card freezes right after the line
//   3  yank      she steps back half a step as the heap drops; he comes right up to the lens (A03)
//   4  A05       he bows; she tilts down with him
//   5  title     he shuffles off to the desk; the lens eases wide: the whole bureau, the title on its thread
import { seg, TITLE_BLOCK, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { CARD } from "../freeze";
import { P, ck, lead, thread, mouthOf, startOf, endOf, wordAt, ky, rel, h, frag, hit, V, walkAlong } from "./kit";
import { Hua, Truth } from "../hud/skin";

const S = seg("A");
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office");
    const a01 = startOf("A01"), a02 = startOf("A02"), e02 = endOf("A02"), a03 = startOf("A03"), a04 = startOf("A04"), a05 = startOf("A05"), e05 = endOf("A05");
    const yank = CARD.to + 5, T0 = TITLE_BLOCK.from, three = wordAt("A02", "三");
    const tangle = ky(f, [[yank, 1], [yank + 7, 0.42]]);
    w.set.param("tangle", tangle);
    // --- the camera
    let camera = povCam(f, [
      ck("office", S.from, [0.25, 1.48, 2.5], [-0.5, 0.92, 0.5], 56),
      ck("office", a01, [0.15, 1.46, 2.15], [-0.5, 0.94, 0.5], 56),
      ck("office", yank, [0.15, 1.46, 2.15], [-0.5, 0.94, 0.5], 56),
      ck("office", yank + 10, [0.2, 1.48, 2.45], [-0.45, 0.95, 0.6], 58),
      ck("office", a03 + 10, [0.2, 1.47, 2.5], [-0.25, 1.0, 1.2], 58),
      ck("office", a05 - 2, [0.2, 1.47, 2.5], [-0.25, 1.0, 1.2], 58),
      ck("office", a05 + 20, [0.2, 1.45, 2.5], [-0.25, 0.9, 1.2], 58),
      ck("office", e05 + 6, [0.2, 1.46, 2.5], [-0.25, 0.98, 1.2], 58),
      ck("office", T0 + 26, [0.1, 1.5, 2.9], [0.15, 1.25, -1.6], 64),
      ck("office", S.to, [0.1, 1.5, 2.8], [0.15, 1.22, -1.6], 64),
    ], { mood: "calm", amp: 0.7, walk: [[S.from, 0.6], [a01 - 6, 0.6], [a01 + 4, 0], [yank, 0], [yank + 4, 0.4], [yank + 12, 0], [T0 + 4, 0], [T0 + 10, 0.3], [T0 + 26, 0]] });
    camera = punchIn(camera, f, three - 1, { k: 0.74, len: 5, off: CARD.to + 1 });
    w.setCamera(camera);
    // --- 月老: in the heap -> out to the lens -> bows -> shuffles to his desk
    const HEAP = P("office", -0.5, 0, 0.5), NEAR = P("office", -0.28, 0, 1.3), DESK = P("office", 0.9, 0, -0.75);
    const outK = ky(f, [[a03 - 16, 0], [a03 + 4, 1]]);
    const go = e05 + 14, leg = f >= go ? walkAlong([NEAR, P("office", 0.3, 0, 0.6), DESK], 1.25, (f - go) / 30, { endFacing: 0.2 }) : null;
    const at = leg ? leg.at : HEAP.clone().lerp(NEAR, outK), facing = leg ? leg.facing : 0.12;
    const strain = f < a01 + 4 ? 1 : 0, wig = strain ? Math.sin(f * 0.9) * 3.5 : 0;
    const bowK = ky(f, [[a05 + 2, 0], [a05 + 14, 1], [e05 - 6, 1], [e05 + 8, 0]]);
    const pullK = ky(f, [[yank - 2, 0], [yank + 3, 1], [yank + 16, 0]]);
    // the knot he works at, in front of his chest; on the yank the hands fly apart
    const hands = f < a03 - 12 ? [rel(at, facing, -0.1 - 0.24 * pullK, 0.74 + 0.03 * Math.sin(f * 0.8) * strain + 0.12 * pullK, 0.2), rel(at, facing, 0.1 + 0.24 * pullK, 0.7 - 0.03 * Math.sin(f * 0.8) * strain + 0.1 * pullK, 0.2)] as [typeof at, typeof at] : undefined;
    const r = lead(w, f, {
      at, facing,
      expr: [[S.from, "strain"], [a01 + 2, "suspicious"], [a02 - 3, "shout"], [e02 + 2, "hush"], [yank - 2, "strain"], [yank + 6, "proud"], [a03 - 12, "suspicious"], [wordAt("A03", "您"), "fawn"], [a04, "worry"], [a05 - 2, "fawn"], [e05 + 12, "proud"]],
      hands, pose: leg ? leg.pose : undefined,
      lean: bowK > 0.01 ? { pitch: 24 * bowK } : outK > 0.5 && f < a04 ? { pitch: 9 } : { roll: wig },
      lookDown: 14 * bowK, gaze: f >= a01 - 2 || !strain ? 0 : (Math.floor(f / 9) % 2 ? 0.5 : -0.5),
      head: f >= a02 && f < a02 + 12 ? { dy: 0.06 * hit(f, a02, 12) } : undefined,
      turn: leg && f > go + 8 ? ky(f, [[go + 8, 0], [go + 22, 0.85]]) : undefined,
    });
    w.update();
    // --- the threads: one in his teeth down to the knot, loose ones from the heap over his shoulders (gone after the yank)
    if (f < yank + 3) {
      const m = mouthOf(w, r), h0 = r.handWorld(0), h1 = r.handWorld(1);
      thread(w, "teeth", m, h0.clone().lerp(h1, 0.5), 0.04, { r: 0.006 });
      thread(w, "knot", h0, h1, 0.05 - 0.05 * pullK, { r: 0.008 });
      thread(w, "sh0", rel(HEAP, 0, -0.55, 0.42, 0.25), h0, 0.1); thread(w, "sh1", rel(HEAP, 0, 0.6, 0.4, 0.1), h1, 0.12);

    }
    // --- over the picture
    const overlays = frag(
      h(Hua, { key: "h1", f, from: e02 - 2, to: CARD.from - 1, text: "三对！", x: 760, y: 560, px: 120, rot: 8 }),
      h(Hua, { key: "h2", f, from: a05 + 16, to: e05 + 16, text: "暗访（并没有）", x: 560, y: 600, px: 78, rot: -4, col: "#f8efd8" }),
      h(Truth, { key: "t", f, from: yank + 20, to: a03 - 6, x: 840, y: 640, kind: "演绎" }),
    );
    return { camera, overlays, post: { bloom: 0.5 } };
  },
};

// SCENE B · 08:10, 天庭姻缘司. THE BUREAU AND THE NUMBERS. He is behind his desk, writing in the 姻缘簿 without looking
// up: one clerk for the whole bureau (others work 996, he works 007). The brag: eighteen thousand couples a day. The
// truth, a breath later: seven and a half thousand split the same day (THE FACT CARD, in the silence). He ties a knot in
// a thread to show how it goes, and it parts in his hands: young people cut it themselves. Then the board on the wall:
// one couple short, due at midnight. If he misses: no elixir, and a written self-criticism.
// CAMERA PLAN (her eyes, one take; 29 s, six moves):
//   open     LOOK AT him writing, past his pile of ledgers   medium close, three-quarter, he is right of centre   she comes round the desk's corner to face him (slow arc)
//   零零七    his deadpan face                                 close (snap zoom, a third tighter)                  lands on the word, held to her question
//   B02-B04  the brag and the slump                            medium, the desk and book in the frame              eased back; still through the fact card
//   B05      the thread between his hands                      medium                                              still (the hands do it)
//   就差一对  THE BOARD on the wall                             the sheet fills the width                           a pan right along his pointing arm
//   今晚      back to him                                       medium close                                        the pan back, then a slow push to the end (a thought landing)
import { seg, type Segment } from "../story";
import { povCam, punchIn, whip, whipSmear } from "../cam";
import { P, ck, wv, startOf, endOf, wordAt, ky, rel, hit, V, SEATS, VERBS, smooth } from "./kit";
import { act, YL, stroke, type MoodKey } from "./act";
import { taut, recoil, FLAT } from "./thread";
import { draw, type Fx } from "./fx";
import { FOV } from "../cam";

const S = seg("B"), C0 = seg("C").from;
const SEAT = SEATS.stool, AT = SEAT.top.clone().setY(0);
/** the first camera of scene C (the whip pan lands on it): see segC */
export const CAM_C0 = { pos: wv("office", [-0.55, 1.5, 1.2]), look: wv("office", [-2.72, 1.06, -0.4]), fov: 56 };
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.46); w.set.param("kpi", 0); w.set.param("smoke", 0);
    const b01 = startOf("B01"), b02 = startOf("B02"), b03 = startOf("B03"), b04 = startOf("B04"), e04 = endOf("B04"), b05 = startOf("B05"), e05 = endOf("B05");
    const b06 = startOf("B06"), b07 = startOf("B07"), b08 = startOf("B08"), e08 = endOf("B08");
    const only = wordAt("B01", "就我"), others = wordAt("B01", "别人"), zero = wordAt("B01", "零零七"), tied = wordAt("B05", "线刚"), cut = wordAt("B05", "剪了");
    const short = wordAt("B06", "就差"), tonight = wordAt("B06", "今晚"), also = wordAt("B08", "还得");
    // ---------------------------------------------------------------------------------------------- the camera
    const HIM: [number, number, number] = [0.35, 0.98, -1.84], BOARD: [number, number, number] = [2.93, 1.5, -0.62];
    const cam0 = povCam(f, [
      ck("office", S.from, [-0.62, 1.12, -0.62], [0.32, 0.9, -1.8], 50),
      ck("office", b01 + 10, [-0.6, 1.14, -0.6], [0.32, 0.9, -1.8], 50),
      ck("office", only + 16, [0.28, 1.38, -0.12], HIM, 52),
      ck("office", short - 6, [0.28, 1.38, -0.12], HIM, 52),
      ck("office", short + 4, [0.5, 1.46, 0.3], BOARD, 50),
      ck("office", tonight - 9, [0.5, 1.46, 0.3], BOARD, 50),
      ck("office", tonight + 2, [0.3, 1.4, -0.12], HIM, 52),
      ck("office", b08, [0.3, 1.4, -0.14], HIM, 52),
      ck("office", e08 + 6, [0.32, 1.38, -0.42], [0.35, 0.96, -1.84], 50),
    ], { mood: "calm", amp: 0.55, walk: [[S.from, 0], [b01 + 10, 0], [b01 + 20, 0.35], [only + 10, 0.35], [only + 16, 0]] });
    let camera = punchIn(cam0, f, zero - 5, { k: 0.7, len: 5, off: b02 + 12 });
    // the join to C: a whip to the left, round to the cabinet wall
    const W = whip(camera, f, C0 - 4, { dir: -1, to: CAM_C0 });
    camera = W.cam;
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老 at his desk
    const t = f / 30, writing = f < only - 4 || (f > e04 + 26 && f < b05 - 12);
    const proudK = ky(f, [[b03 - 3, 0], [b03 + 5, 1], [b04 - 4, 1], [b04 + 4, 0]]);
    const slump = ky(f, [[b04 + 2, 0], [b04 + 16, 1], [b05 - 14, 1], [b05 - 2, 0.25], [b06 - 4, 0.25], [b06 + 4, 0]]) + 0.8 * ky(f, [[b08 + 2, 0], [b08 + 14, 0.6], [also, 0.6], [also + 12, 1]]);
    const knotK = ky(f, [[b05 + 2, 0], [b05 + 12, 1], [e05 + 4, 1], [e05 + 12, 0]]);          // both hands up with a thread
    const pull = ky(f, [[tied - 2, 0], [tied + 8, 1], [cut - 1, 1.15], [cut + 3, 2.6], [cut + 20, 2.2]]);
    const pointK = ky(f, [[short - 9, 0], [short - 1, 1], [tonight + 6, 1], [tonight + 16, 0]]);
    const chest = (dx: number, dy = 0, dz = 0) => rel(AT, 0, dx, 0.8 + dy, 0.27 + dz);
    const hx = 0.05 + 0.05 * pull;
    const hands = knotK > 0.02 ? [VERBS.hang(AT, 0, 0).setY(0.66).lerp(chest(-hx, 0.01 * Math.sin(f * 0.7)), smooth(knotK)), VERBS.hang(AT, 0, 1).setY(0.66).lerp(chest(hx, -0.01 * Math.sin(f * 0.7)), smooth(knotK))] as [ReturnType<typeof V>, ReturnType<typeof V>]
      : proudK > 0.02 ? (() => { const s = stroke(AT, 0, f, proudK); return s ? [s[0]!.add(V(0, -0.02, 0.07)), null] as [ReturnType<typeof V>, null] : undefined; })()
      : pointK > 0.02 ? [null, VERBS.hang(AT, 0, 1).setY(0.7).lerp(rel(AT, 0, 0.42, 0.97, 0.16), smooth(pointK))] as [null, ReturnType<typeof V>]
      : undefined;
    const faces: MoodKey[] = [
      [S.from, "tired"], [only - 2, "grumble"], [others - 2, "flat"], [b02 + 14, "look"], [b03 - 2, "proud"], [b04 + 4, "sag", "sink"],
      [b05 - 2, "grumble"], [cut + 1, "small", "take", 0.6], [b06 - 2, "worry"], [tonight - 2, "dread", "take", 0.7], [b07 + 10, "lost"], [b08 - 1, "sag", "sink"], [also - 2, "small"],
    ];
    const r = act(w, f, YL, {
      at: AT, facing: 0, seat: SEAT, faces,
      pose: writing ? { kind: "write", t, arm: 0 } : hands ? { kind: "hold", t } : { kind: "desk", t },
      show: writing ? ["pen"] : undefined, hands: writing ? undefined : hands,
      lookDown: writing ? undefined : 16 * Math.min(1, slump) + (knotK > 0.5 && f < cut ? 8 : 0),
      lean: { pitch: 9 * Math.min(1, slump) - 7 * proudK },
      gaze: writing ? 0 : pointK > 0.5 && f < tonight - 4 ? 1 : knotK > 0.5 && f < cut ? 0 : undefined,
      talkGaze: f < only ? 0 : undefined,
      head: { dy: -0.05 * Math.min(1, slump) + 0.05 * hit(f, b03, 8), tilt: pointK > 0.5 && f < tonight - 4 ? -6 : 0 },
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the thread he shows her
    if (knotK > 0.3) {
      const h0 = r.handWorld(0), h1 = r.handWorld(1), mid = h0.clone().lerp(h1, 0.5);
      if (f < cut) w.props.thread("show", taut(h0, h1, f, [tied + 8], { sag: 0.02 * (1.2 - Math.min(1.2, pull)), amp: 0.008 }), { r: 0.0075 });
      else { const d = f - cut; w.props.thread("show", recoil(h0, mid, d, FLAT, { n: 6, whip: 0.5 }), { r: 0.0075 }); w.props.thread("show2", recoil(h1, mid, d, FLAT, { n: 6, whip: 0.5 }), { r: 0.0075 }); }
    }
    const FX: Fx[] = [];
    return { camera, overlays: [draw(f, FX), whipSmear(W.smear, -1)], shown: FX, post: W.post };
  },
};
void FOV;

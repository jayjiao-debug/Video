// SCENE B · 08:10, 天庭姻缘司. THE BUREAU AND THE NUMBERS. He is behind his desk, writing in the 姻缘簿 without looking
// up: one clerk for the whole bureau (others work 996, he works 007). The brag: eighteen thousand couples a day. The
// truth, a breath later: seven and a half thousand split the same day (THE FACT CARD, in the silence). He ties a knot in
// a thread to show how it goes, and it parts in his hands: young people cut it themselves. Then the board on the wall:
// one couple short, due at midnight. If he misses: no elixir, and a written self-criticism.
// CAMERA PLAN (her eyes, one take; 29 s, six moves):
//   open     LOOK AT the page and his brush (he does not look up)   close, from above                         held: she reads over the desk
//   就我      his face as he looks up                             medium close, level                       the lens comes down from the page to his eyes
//   零零七    his deadpan face                                    extreme close (snap zoom, a third tighter) lands on the word, held to her question
//   一万八千  the brag                                            medium close from BELOW, 4 deg of tilt     she dips for the boast
//   散七千五  one clerk and all that paper                        WIDE, he is small behind the desk          she steps back as he sinks; still through the fact card
//   线刚绑上  the thread between his hands                        close on the hands, his face above         a quick step in to the thing
//   剪了      his face                                            medium close                               a tilt up for the reaction
//   就差一对  THE BOARD on the wall                               the sheet fills the width                  a pan right along his pointing arm
//   今晚      back to him                                         medium close, then closer                  the pan back, then a slow push to the end (a thought landing)
import { seg, type Segment } from "../story";
import { povCam, punchIn, whip, whipSmear } from "../cam";
import { P, ck, wv, startOf, endOf, wordAt, ky, rel, hit, V, SEATS, VERBS, smooth, walkAlong } from "./kit";
import { OFFICE } from "../places";
import { act, YL, stroke, type MoodKey } from "./act";
import { droop, taut, recoil, type Floor } from "./thread";
import { draw, type Fx } from "./fx";
import { FOV } from "../cam";

const S = seg("B"), C0 = seg("C").from;
/** his stool at the desk, with the desk's top where his hands and the brush really rest: the open book's pages (v6,
 *  owner's note 9 on v5: his hand and the pen went into the book) */
const SEAT = { ...SEATS.stool, deskTop: OFFICE.book.top }, AT = SEAT.top.clone().setY(0);
/** what his wide sleeves lie on (act({ rests })): the desk's top and the book's pages */
const DK = OFFICE.desk, BK = OFFICE.book;
const RESTS = [
  { x0: DK.x - DK.w / 2 - 0.03, x1: DK.x + DK.w / 2 + 0.03, z0: DK.z - DK.d / 2 - 0.03, z1: DK.z + DK.d / 2 + 0.03, y: DK.top },
  { x0: BK.x - BK.w / 2, x1: BK.x + BK.w / 2, z0: BK.z - BK.d / 2, z1: BK.z + BK.d / 2, y: BK.top },
];
/** the top under a thread lying on the desk: the book's pages where it is over the book, else the desk */
const onDesk = (x: number, z: number) => (Math.abs(x - BK.x) <= BK.w / 2 && Math.abs(z - BK.z) <= BK.d / 2 ? BK.top : DK.top);
/** the first camera of scene C (the whip pan lands on it): see segC */
export const CAM_C0 = { pos: wv("office", [-0.55, 1.5, 1.2]), look: wv("office", [-2.72, 1.0, -0.4]), fov: 56 };
/** HE IS OFF TO THE CABINET before the whip pan: up from the stool (he slides off its left side), round the desk's end,
 *  across to the wall of drawers. Scene C goes on with the same walk. */
export const HOP = 0.42, CAB_SPEED = 2.8, GO_CAB = endOf("B08") + 14, CAB_AT = C0 + 10, BRAKE = 8;
export const TO_CAB = [P("office", OFFICE.stool.x - HOP, 0, OFFICE.stool.z), P("office", -0.75, 0, -1.72), P("office", -1.55, 0, -0.95), P("office", -2.1, 0, -0.3)];
/** HIS RUN, both sides of the whip pan. The pan hides the middle of it: in scene B he is off as the lens starts to turn
 *  (GO_CAB), in scene C he is a step from his place when the lens lands and pulls up at CAB_AT, slowing over BRAKE frames. */
export const toCab = (f: number) => {
  if (f < C0) return walkAlong(TO_CAB, CAB_SPEED, (f - GO_CAB) / 30);
  const T = VERBS.walkTime(TO_CAB, CAB_SPEED), left = CAB_AT - f;
  if (left <= 0) return walkAlong(TO_CAB, CAB_SPEED, T + 0.001 - left / 30);
  return walkAlong(TO_CAB, CAB_SPEED, T - (left >= BRAKE ? (left - BRAKE / 2) / 30 : (left * left) / (2 * BRAKE * 30)));
};
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.46); w.set.param("kpi", 0); w.set.param("smoke", 0);
    const b01 = startOf("B01"), b02 = startOf("B02"), b03 = startOf("B03"), b04 = startOf("B04"), e04 = endOf("B04"), b05 = startOf("B05"), e05 = endOf("B05");
    const b06 = startOf("B06"), b07 = startOf("B07"), b08 = startOf("B08"), e08 = endOf("B08");
    const only = wordAt("B01", "就我"), others = wordAt("B01", "别人"), zero = wordAt("B01", "零零七"), tied = wordAt("B05", "线刚"), cut = wordAt("B05", "剪了");
    const short = wordAt("B06", "就差"), tonight = wordAt("B06", "今晚"), also = wordAt("B08", "还得");
    // ---------------------------------------------------------------------------------------------- the camera
    // (BOARD: the middle of the decree from heaven on the right wall, sets/office.ts DECREE: 1.12 to 2.53 m high)
    const HIM: [number, number, number] = [0.35, 0.98, -1.88], BOARD: [number, number, number] = [2.93, 1.8, -0.62];
    const BOOK = { pos: [0.9, 1.5, -0.5], look: [0.378, 0.74, -1.62], fov: 55 }, FRONT = { pos: [0.28, 1.38, -0.12], look: HIM, fov: 52 };
    const LOW = { pos: [0.18, 0.9, -0.2], look: [0.35, 1.08, -1.88], fov: 50 }, WIDE = { pos: [0.3, 1.4, 0.45], look: [0.35, 0.74, -1.88], fov: 56 };
    const HANDS = { pos: [0.3, 1.34, -0.32], look: [0.35, 0.92, -1.62], fov: 46 }, FACE = { pos: [0.3, 1.36, -0.5], look: [0.35, 1.0, -1.88], fov: 50 };
    const K = (at: number, c: { pos: number[]; look: number[]; fov: number }, roll = 0) => ck("office", at, c.pos, c.look, c.fov, { roll });
    const cam0 = povCam(f, [
      K(S.from, BOOK), K(b01 + 10, BOOK),                         // the page and the brush
      K(only + 12, FRONT), K(b03 - 16, FRONT),                    // up to his face as he looks up
      K(b03 - 3, LOW, 4), K(b04 + 2, LOW, 4),                     // the brag, from below
      K(e04 + 2, WIDE), K(tied - 14, WIDE),                       // back and wide: one clerk and all that paper (the fact card lands here)
      K(tied - 3, HANDS), K(cut + 8, HANDS),                      // in on the thread between his hands
      K(cut + 17, FACE), K(short - 7, FACE),                      // up to his face
      K(short + 4, { pos: [0.5, 1.46, 0.3], look: BOARD, fov: 46 }), K(tonight - 9, { pos: [0.5, 1.46, 0.3], look: BOARD, fov: 46 }),   // along his arm to the decree
      K(tonight + 2, FRONT), K(b08, { pos: [0.3, 1.4, -0.14], look: HIM, fov: 52 }),
      K(e08 + 6, { pos: [0.32, 1.37, -0.32], look: [0.35, 0.98, -1.88], fov: 50 }),                                                      // a slow push: the thought lands
    ], { mood: "calm", amp: 0.55, walk: [[S.from, 0], [b04 + 4, 0], [b04 + 14, 0.3], [e04 - 6, 0.3], [e04 + 2, 0], [tied - 14, 0], [tied - 10, 0.3], [tied - 3, 0]] });
    let camera = punchIn(cam0, f, zero - 5, { k: 0.7, len: 5, off: b02 + 12 });
    // the join to C: a whip to the left, round to the cabinet wall
    const W = whip(camera, f, C0 - 4, { dir: -1, to: CAM_C0 });
    camera = W.cam;
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老 at his desk
    const t = f / 30, writing = f < only - 4 || (f > e04 + 26 && f < b05 - 12);
    const proudK = ky(f, [[b03 - 3, 0], [b03 + 5, 1], [b04 - 4, 1], [b04 + 4, 0]]);
    const slump = ky(f, [[b04 + 2, 0], [b04 + 16, 1], [b05 - 14, 1], [b05 - 2, 0.25], [b06 - 4, 0.25], [b06 + 4, 0]]) + 0.8 * ky(f, [[b08 + 2, 0], [b08 + 14, 0.6], [also, 0.6], [also + 12, 1]]);
    const knotK = ky(f, [[b05 + 2, 0], [b05 + 12, 1], [e05 + 4, 1], [e05 + 12, 0]]);          // both hands up IN FRONT of his beard with a thread
    // he ties it where she can see: the hands come together, wind once, part, and a bow sits in the middle; on 剪了 it parts
    const tieK = ky(f, [[tied - 9, 0], [tied - 2, 1], [tied + 6, 1], [tied + 13, 0]]), TIED = tied + 9;
    const snapK = ky(f, [[cut - 1, 0], [cut + 3, 1], [cut + 14, 0.55]]);
    const pointK = ky(f, [[short - 9, 0], [short - 1, 1], [tonight + 6, 1], [tonight + 16, 0]]);
    const chest = (dx: number, dy = 0, dz = 0) => rel(AT, 0, dx, 0.8 + dy, 0.33 + dz);
    const hx = 0.105 - 0.08 * smooth(tieK) + 0.03 * (f >= TIED ? 1 : 0) * (1 - smooth(tieK)) + 0.05 * snapK, wind = tieK > 0.5 ? (f - tied) * 0.9 : 0;
    const rest = (sg: number) => rel(AT, 0, sg * 0.1, OFFICE.book.top + 0.032, 0.35);   // where his hands lie: on the book, not in it
    const hands = knotK > 0.02 ? [rest(-1).lerp(chest(-hx, 0.012 * Math.sin(wind) * tieK + 0.02 * snapK, 0.012 * Math.cos(wind) * tieK), smooth(knotK)), rest(1).lerp(chest(hx, -0.012 * Math.sin(wind) * tieK + 0.02 * snapK, -0.012 * Math.cos(wind) * tieK), smooth(knotK))] as [ReturnType<typeof V>, ReturnType<typeof V>]
      : proudK > 0.02 ? (() => { const s = stroke(AT, 0, f, proudK); return s ? [s[0]!.add(V(0, -0.02, 0.07)), null] as [ReturnType<typeof V>, null] : undefined; })()
      : pointK > 0.02 ? [null, VERBS.hang(AT, 0, 1).setY(0.7).lerp(rel(AT, 0, 0.42, 0.97, 0.16), smooth(pointK))] as [null, ReturnType<typeof V>]
      : undefined;
    // HIS FACES, one per thought (9 in 29 s; owner's note 4 on v5): overworked (tired) · only me, 007 (grumble) · the brag
    // (proud) · the truth (sag) · young people! (grumble) · it parts in his hands (small) · one couple short (worry) ·
    // tonight! (dread) · the elixir, the self-criticism (sag) · an idea: his old results (eager)
    const faces: MoodKey[] = [
      [S.from, "tired"], [only - 2, "grumble"], [b03 - 2, "proud"], [b04 + 4, "sag", "sink"],
      [b05 - 2, "grumble"], [cut + 1, "small", "take", 0.6], [b06 - 2, "worry"], [tonight - 2, "dread", "take", 0.7], [b08 - 1, "sag", "sink"], [e08 + 2, "eager", "take", 0.6],
    ];
    // a thought: his old results! His head comes up and his eyes go to the cabinet (ideaK); a beat, then he is off the stool
    // and away, out of her frame as the whip pan starts after him
    const riseK = ky(f, [[GO_CAB - 7, 0], [GO_CAB, 1]]), ideaK = ky(f, [[e08 + 1, 0], [e08 + 7, 1]]), upK = Math.max(riseK, ideaK), leg = f >= GO_CAB ? toCab(f) : null;
    const seat = riseK > 0 ? { ...SEAT, top: SEAT.top.clone().add(V(-HOP * smooth(riseK), 0, 0)) } : SEAT;
    const r = leg
      ? act(w, f, YL, { at: leg.at, facing: leg.facing, faces, pose: leg.pose })
      : act(w, f, YL, {
        at: AT, facing: 0, seat, rise: riseK, faces,
        pose: writing ? { kind: "write", t, arm: 0 } : hands ? { kind: "hold", t } : { kind: "desk", t },
        show: writing ? ["pen"] : undefined, hands: writing ? undefined : hands, armFront: knotK > 0.3 ? [true, true] : undefined,
        // (a gentle slump: his big head is a hand's breadth over the desk, and a deep one put his chin in the book)
        lookDown: writing ? 11 : 10 * Math.min(1, slump) * (1 - upK) + (knotK > 0.5 && f < cut ? 8 : 0),   // (writing: his eyes on the page, not on her)
        lean: { pitch: (4 * Math.min(1, slump) - 7 * proudK) * (1 - upK) }, rests: RESTS,
        gaze: writing ? 0 : pointK > 0.5 && f < tonight - 4 ? 1 : knotK > 0.5 && f < cut ? 0 : ideaK > 0 ? -smooth(ideaK) : undefined,
        talkGaze: f < only ? 0 : undefined,
        head: { dy: -0.025 * Math.min(1, slump) * (1 - upK) + 0.05 * hit(f, b03, 8) + 0.035 * hit(f, e08 + 2, 9), tilt: pointK > 0.5 && f < tonight - 4 ? -6 : 0 },
      });
    w.update();
    // ---------------------------------------------------------------------------------------------- the thread he shows her
    const DESK: Floor = onDesk, th = { r: 0.0075 }, LET_GO = e05 + 2;
    if (knotK > 0.3 && f < cut) {
      const h0 = r.handWorld(0), h1 = r.handWorld(1), mid = h0.clone().lerp(h1, 0.5);
      if (f < TIED) w.props.thread("show", droop(h0, h1, 0.34 * (1 - 0.8 * smooth(tieK)), DESK, { n: 10 }), th);                 // slack between his hands, wound up as they meet
      else {
        // tied: drawn straight, a bow in the middle with two short tails (in the plane that faces her lens)
        const k = smooth((f - TIED) / 5), sz = 0.034 * (0.5 + 0.5 * k), bow: ReturnType<typeof V>[] = [];
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; bow.push(mid.clone().add(V(sz * Math.sin(a), sz * 0.55 * Math.sin(2 * a) + 0.004, 0.006))); }
        w.props.thread("show", taut(h0, h1, f, [TIED + 4], { sag: 0.006, amp: 0.006 }), th);
        w.props.thread("bow", bow, { ...th, closed: true });
        w.props.thread("bowt0", [mid.clone().add(V(-0.004, 0, 0.006)), mid.clone().add(V(-0.014, -0.022, 0.008)), mid.clone().add(V(-0.012, -0.046 * k, 0.008))], th);
        w.props.thread("bowt1", [mid.clone().add(V(0.004, 0, 0.006)), mid.clone().add(V(0.015, -0.02, 0.008)), mid.clone().add(V(0.017, -0.04 * k, 0.008))], th);
      }
    } else if (f >= cut) {
      // it parts in the middle: each half springs back to its hand and hangs from it; he lets them go as his hands sink,
      // and the two ends lie on the desk for the rest of the scene
      const d = f - cut, k = smooth((f - LET_GO) / 6);
      [0, 1].forEach((i) => {
        const sg = i ? 1 : -1;
        const lie = Array.from({ length: 9 }, (_, j) => { const q = rel(AT, 0, sg * (0.2 - 0.012 * j), 0, 0.4 + 0.012 * Math.sin(j * 0.9 + i)); return q.setY(onDesk(q.x, q.z) + 0.0075); });
        if (k <= 0) { const h = [r.handWorld(0), r.handWorld(1)]; w.props.thread(i ? "show2" : "show", recoil(h[i], h[0].clone().lerp(h[1], 0.5), d, DESK, { n: 8, whip: 0.45 }), th); return; }
        const hk = rest(sg).lerp(chest(sg * 0.155, 0.011), 1), hang = recoil(hk, hk.clone().add(V(-sg * 0.1, 0, 0)), LET_GO - cut, DESK, { n: 8, whip: 0.45 });
        w.props.thread(i ? "show2" : "show", hang.map((q, j) => q.clone().lerp(lie[j], k)), th);
      });
    }
    const FX: Fx[] = [];
    return { camera, overlays: [draw(f, FX), whipSmear(W.smear, -1)], shown: FX, post: W.post };
  },
};
void FOV;

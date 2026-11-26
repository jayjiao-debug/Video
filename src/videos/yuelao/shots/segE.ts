// SCENE E · 人间 14:00, her office. THE JOB: they stand invisible beside 林小满 at her laptop. He flicks the thread and it
// winds round her ANKLE (not the wrist: the fact card). Then she picks up her phone and swipes left three times; every
// swipe snaps one of the threads he had lined up for her. He files it as 缘分未到 (the first stamp of the running gag).
// CAMERA: she walks in behind him; ducks to the floor for the ankle; up to his face for the lecture; wide for the swipes.
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { P, ck, lead, put, sit, startOf, endOf, wordAt, screenOf, ky, h, frag, hit, faceTo, v3, rel, V, thread, ring, inHand } from "./kit";
import { XIAOMAN } from "../people";
import { Hua, FateStamp, Snaps, Truth } from "../hud/skin";

const S = seg("E");
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("work"); w.set.param("glow", 1); w.set.param("late", 0.15);
    const e01 = startOf("E01"), e02 = startOf("E02"), e03 = startOf("E03"), e03b = screenOf("E03", 1), x03 = endOf("E03"), e04 = startOf("E04"), x04 = endOf("E04"), e05 = startOf("E05"), x05 = endOf("E05"), e06 = startOf("E06");
    const tie = e02 - 12, hits = [e04 + Math.round(0.22 * (x04 - e04)), e04 + Math.round(0.55 * (x04 - e04)), e04 + Math.round(0.92 * (x04 - e04))];
    const camera = povCam(f, [
      ck("work", S.from, [1.0, 1.46, 2.3], [0.5, 0.95, -1.4], 54),
      ck("work", e01 + 6, [0.55, 1.44, 1.55], [0.5, 0.92, -1.4], 57),
      ck("work", tie - 4, [0.55, 1.44, 1.55], [0.5, 0.92, -1.4], 57),
      ck("work", e02 + 4, [1.75, 0.5, -0.1], [0.2, 0.14, -1.45], 50),
      ck("work", e03 + 30, [1.7, 0.5, -0.15], [0.2, 0.14, -1.45], 49),
      ck("work", e03b - 4, [1.05, 1.42, 0.5], [1.05, 1.02, -1.35], 48),
      ck("work", x03 + 60, [1.05, 1.42, 0.55], [1.05, 1.02, -1.35], 48),
      ck("work", e04 - 2, [0.55, 1.44, 1.5], [0.5, 0.92, -1.4], 57),
      ck("work", e06 - 6, [0.55, 1.44, 1.45], [0.5, 0.92, -1.4], 57),
      ck("work", e06 + 12, [1.0, 1.42, 0.6], [0.95, 1.0, -1.35], 48),
      ck("work", S.to, [1.0, 1.42, 0.55], [0.95, 1.0, -1.35], 48),
    ], { mood: "calm", amp: 0.7, walk: [[S.from, 0.7], [e01, 0.5], [e01 + 6, 0], [tie - 4, 0], [tie, 0.3], [e02 + 4, 0]] });
    w.setCamera(camera);
    const camP = v3(camera.pos), t = f / 30;
    // 小满: typing, then her phone
    const CH = P("work", 0, 0, -1.55), onPhone = f >= e04 - 14;
    const swipe = Math.max(...hits.map((hh) => hit(f, hh - 2, 8)));
    const xm = put(w, f, XIAOMAN, {
      at: CH, facing: 0, id: 2, who: "xm",
      expr: [[S.from, "flat"], [e04 - 14, "tired"], [e04 - 2, "flat"], [x04 + 6, "tired"]],
      more: { ...sit(CH, 0, 0.34, t), ...(onPhone ? { pose: { kind: "phone" as const, t, amount: 0, arm: 1 as const } } : {}) },
      lookDown: onPhone ? 12 : 8, head: { dx: 0.05 * swipe },
    });
    // 月老 beside her chair
    const TIE = P("work", 1.05, 0, -1.35), facing = faceTo(TIE, camP);
    const flick = ky(f, [[tie - 8, 0], [tie, 1], [tie + 10, 0.4], [e03 - 4, 0]]), wave = ky(f, [[e05 - 4, 0], [e05 + 4, 1], [x05, 1], [x05 + 8, 0]]);
    const hands = wave > 0.02 ? [rel(TIE, facing, -0.22, 0.6 + (0.62 + 0.08 * Math.sin(f * 1.1)) * wave, 0.12), rel(TIE, facing, 0.22, 0.6 + (0.62 - 0.08 * Math.sin(f * 1.1)) * wave, 0.12)] as [typeof TIE, typeof TIE]
      : flick > 0.02 ? [null, rel(TIE, facing, 0.2, 0.6 + 0.3 * flick, 0.18 + 0.1 * flick)] as [null, typeof TIE] : undefined;
    const yl = lead(w, f, {
      at: TIE, facing, hands,
      pose: f >= e01 - 4 && f < tie - 10 ? { kind: "shh", t, arm: 0, amount: 1 } : f >= e03b && f < x03 - 4 ? { kind: "point", t, arm: 0 } : undefined,
      expr: [[S.from, "sly"], [e01 - 2, "hush"], [tie - 8, "strain"], [tie + 4, "proud"], [e02, "look"], [e03 - 2, "proud"], [e03b - 2, "grumble"], [x03 + 6, "proud"], [e04 - 6, "look"], [hits[0], "worry"], [hits[1], "panic"], [e05 - 2, "shout"], [x05 + 4, "sag"], [e06 - 2, "plead"], [wordAt("E06", "缘分") - 2, "small"]],
      turn: f >= e04 - 6 && f < e05 - 2 ? -0.5 : undefined,
      lookDown: 10 * ky(f, [[x05 + 4, 0], [x05 + 12, 1], [e06 + 6, 1], [e06 + 14, 0]]),
      head: { dy: 0.05 * hit(f, e05, 8) },
    });
    w.update();
    // the thread: from his hand to her ankle, then a ring round it; three threads run from the ankle out to the city
    const ank = xm.footWorld(0).add(V(0, 0.06, 0));
    if (f >= tie) {
      ring(w, "ank", ank, 0.05, 0.25);
      if (f < e04 - 10) thread(w, "tie", yl.handWorld(1), ank, 0.25, { r: 0.007, glow: 0.7, cut: ky(f, [[tie, 0], [tie + 7, 1]]) });
    }
    const far = [P("work", -4.2, 1.5, -2.9), P("work", 3.6, 2.0, -2.9), P("work", -1.4, 2.5, -2.9)];
    far.forEach((to, i) => {
      const on = e03b + 20 + i * 6, c = f < hits[i] ? ky(f, [[on, 0], [on + 10, 1]]) : ky(f, [[hits[i], 1], [hits[i] + 5, 0]]);
      if (f >= on && c > 0.02) thread(w, "far" + i, ank, to, 0.12 + (f >= hits[i] ? 0.5 : 0), { r: 0.008, glow: 0.8, cut: c });
    });
    void inHand;
    const overlays = frag(
      h(Hua, { key: "a", f, from: e01 + 2, to: e02 - 14, text: "隐身中", x: 250, y: 620, px: 96, rot: -6, col: "#f8efd8" }),
      h(Hua, { key: "b", f, from: tie + 2, to: e03 - 2, text: "绑脚？！", x: 300, y: 700, px: 120, rot: -8 }),
      h(Truth, { key: "t", f, from: e03 + 8, to: e03b - 4, x: 850, y: 640, kind: "传说" }),
      h(Hua, { key: "c", f, from: wordAt("E03", "瞎改") - 1, to: x03 + 4, text: "电视剧：？", x: 760, y: 620, px: 92, rot: 6, col: "#f8efd8" }),
      h(Snaps, { key: "s", f, from: hits[0] - 2, to: e06 - 4, x: 300, y: 640, hits }),
      h(Hua, { key: "d", f, from: e05 + 2, to: x05, text: "别滑了！！", x: 760, y: 1120, px: 104, rot: 7 }),
      h(FateStamp, { key: "f", f, from: wordAt("E06", "缘分") + 2, to: S.to - 3, x: 620, y: 660 }),
    );
    return { camera, overlays };
  },
};

// SCENE E, Russia, 1812 (E25-E27). White everywhere, no music. He walks on and says nothing (E25's long hold); on E27
// 「这……不叫战略。」 he looks at the ground for the first time.
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, L0, L1, ramp, saying, speak, alive, fig } from "./common";
import { NP_SNOW, GRENADIER } from "../people";
import { ISLAND } from "../sets";

const S = seg("E"), X = ISLAND.russia;
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("russia");
    const t = f / 30, n = f - S.from, stop = L0("E27") - 4;
    const walked = 0.62 * Math.min(n, stop - S.from) / 30 + 0.3 * ramp(f, stop - 30, stop) * 0;            // slow, into the wind
    const x = X - 2.6 + walked, at = V(x, 0, -2.2), moving = f < stop;
    const down = ramp(f, L0("E27") + 4, L0("E27") + 24);
    const q = saying("np", f);
    w.actor(NP_SNOW).set({
      at, facing: Math.PI / 2 - 0.9 * ramp(f, stop - 10, stop + 14), pose: moving ? { kind: "walk", phase: (walked / 0.55) % 1, stride: 0.14, amount: 0.5 } : { kind: "idle", t },
      ...alive(t, 1), expr: down > 0.3 ? "gloom" : "stern", lookDown: 24 * down, ...(q ? speak(q, f, 1) : {}),
    } as never);
    // stragglers behind him, slower, heads down
    [[-2.6, -3.0], [-4.4, -2.5], [-6.5, -3.4], [-9, -2.8]].forEach(([dx, z], i) => {
      const sx = X - 2.6 + dx + 0.45 * n / 30, p = V(sx, 0, z);
      fig(w, GRENADIER, `s${i}`, p, Math.PI / 2, f, 3 + i, undefined, { pose: { kind: "walk", phase: ((0.45 * n / 30) / 0.5 + i * 0.3) % 1, stride: 0.12, amount: 0.4 }, expr: "gloom", lookDown: 18 });
    });
    const camera = povCam(f, [
      { f: S.from, pos: [X - 0.4, 1.5, 2.6], look: [X - 2.4, 1.2, -2.4], fov: 62 },
      { f: L1("E25") + 30, pos: [X, 1.5, 2.2], look: [x - 0.2, 1.13, -2.2], fov: 52 },
      { f: stop, pos: [X + 0.6, 1.5, 1.9], look: [at.x, 1.18, -2.2], fov: 46 },
      { f: L1("E27") + 30, pos: [X + 0.7, 1.45, 1.5], look: [at.x, 1.23, -2.2], fov: 40 },
      { f: S.to, pos: [X + 0.7, 1.45, 1.4], look: [at.x, 1.23, -2.2], fov: 39 },
    ], { walk: 0 });
    return { camera, post: { bloom: 0.2 } };
  },
};

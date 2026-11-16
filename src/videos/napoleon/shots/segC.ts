// SCENE C, the eve of Austerlitz, 1 December 1805 (C12-C16). Night, a fire. He walks along the bivouac, stops at an old
// grenadier, pinches his ear (C13); the old man glows (C14). After C16 the soldiers light straw torches one after
// another until the whole hill burns with them.
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, yawTo, L0, L1, ramp, fig, walkAlong, saying, speak, alive } from "./common";
import { NP_CONSUL, VETERAN, GRENADIER } from "../people";
import { ISLAND, CAMP } from "../sets";

const S = seg("C"), X = ISLAND.camp;
const VT = V(X - 0.5, 0, -2.3), STOP = V(X + 0.38, 0, -2.0), ME = V(X, 1.5, 2);
const hh = (n: number, k = 0) => { const s = Math.sin(n * 91.7 + k * 47.3) * 43758.5453; return s - Math.floor(s); };
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("camp");
    const t = f / 30, arrive = L0("C13") - 8;
    const leg = walkAlong([V(X + 5.5, 0, -2.6), V(X + 2.5, 0, -2.3), STOP], 1.25, (f - (arrive - 132)) / 30, { endFacing: yawTo(STOP, VT) });
    const pinch = ramp(f, L0("C13") + 4, L0("C13") + 16) * (1 - ramp(f, L1("C13") + 2, L1("C13") + 14));
    const q = saying("np", f), lit = L1("C16") + 14;
    const turn = ramp(f, L0("C16") - 6, L0("C16") + 8);
    w.actor(NP_CONSUL).set({
      visible: true, at: leg.at, facing: leg.arrived ? yawTo(STOP, VT) * (1 - turn) + yawTo(STOP, ME) * turn : leg.facing, pose: leg.pose, ...alive(t, 1),
      expr: f >= L0("C13") && f < L0("C15") ? "smile" : f > lit + 30 ? "smile_closed" : "stern", ...(q ? speak(q, f, 1) : {}),
      ...(pinch > 0.05 ? { hands: [V(VT.x + 0.3 - 0.06 * pinch, 1.5, VT.z + 0.12), null], armFront: [true, undefined] } : {}),
    } as never);
    fig(w, VETERAN, "", VT, yawTo(VT, STOP) * 0.7 + yawTo(VT, ME) * 0.3, f, 2, "bg", { expr: f < arrive ? "doze" : f < L0("C14") ? "shock" : "happy", head: pinch > 0.05 ? { tilt: 5 * pinch } : undefined });
    // the men round the fire and along the row; each lights a torch after C16, one after another
    const men: [number, number][] = [[-2.7, -3.2], [-2.2, -1.9], [1.9, -3.6], [3.1, -2.9], [-3.9, -2.6], [4.3, -4.0]];
    men.forEach(([x, z], i) => {
      const p = V(X + x, 0, z), k = ramp(f, lit + i * 7, lit + i * 7 + 10);
      fig(w, GRENADIER, `m${i}`, p, yawTo(p, leg.at), f, 3 + i, undefined, { expr: k > 0.5 ? "happy" : i % 2 ? "doze" : "neutral", ...(k > 0.05 ? { pose: { kind: "cheer", t } } : {}) });
      if (k > 0.05) w.prop("torch", `m${i}`).put(V(p.x + 0.26, 1.2 + 0.75 * k, p.z + 0.1), { lit: k, t: t + i, tilt: 0.15 });
    });
    for (let i = 0; i < CAMP.torches; i++) {
      const k = ramp(f, lit + 30 + i * 2.4, lit + 38 + i * 2.4);
      if (k <= 0.02) continue;
      const a = hh(i, 1), d = hh(i, 2);
      w.prop("torch", `far${i}`).put(V(X - 26 + 52 * a, 1.2 + 4.2 * d - 0.004 * Math.pow((a - 0.5) * 52, 2), -9 - 20 * d), { lit: k, t: t + i * 0.7, scale: 2.2 + 2 * d });
    }
    const camera = povCam(f, [
      { f: S.from, pos: [X + 0.6, 1.5, 2.2], look: [X + 4.5, 1.18, -2.6], fov: 56 },
      { f: arrive, pos: [X, 1.5, 1.7], look: [X - 0.05, 1.18, -2.1], fov: 50 },
      { f: L0("C13") + 10, pos: [X - 0.05, 1.5, 1.7], look: [X - 0.06, 1.2, -2.15], fov: 50 },
      { f: L1("C14") + 6, pos: [X - 0.05, 1.5, 1.7], look: [X - 0.06, 1.2, -2.15], fov: 50 },
      { f: L0("C16"), pos: [X, 1.5, 1.6], look: [X + 0.1, 1.28, -2.0], fov: 44 },
      { f: lit, pos: [X, 1.5, 1.7], look: [X + 0.1, 1.28, -2.0], fov: 46 },
      { f: lit + 70, pos: [X, 1.5, 2.6], look: [X, 2.6, -8], fov: 62 },
      { f: S.to, pos: [X, 1.5, 2.9], look: [X, 3.0, -8], fov: 64 },
    ], {});
    return { camera };
  },
};

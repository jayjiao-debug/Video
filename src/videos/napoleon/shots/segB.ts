// SCENE B, Notre-Dame, 2 December 1804 (B08-B11). The Pope waits with the crown; he takes it out of the Pope's hands
// (B09), lifts it (B10) and sets it on his own head; the Pope's hands stay in the air.
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, yawTo, L0, L1, ramp, mix, fig } from "./common";
import { NP_SACRE, NP_CROWNED, POPE, DAVID, SECRETARY } from "../people";
import { ISLAND } from "../sets";

const S = seg("B"), X = ISLAND.notredame;
const NP = V(X - 0.35, 0, -2.3), PO = V(X + 0.95, 0, -2.5), ME = V(X, 1.5, 2);
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("notredame");
    const take0 = L1("B09") + 6, take1 = take0 + 16, lift0 = L0("B10") + 6, on = L1("B10") + 22;
    const held = V(PO.x - 0.42, 1.22, PO.z + 0.34);                                   // the crown in the Pope's hands
    const mine = V(NP.x + 0.02, 1.2, NP.z + 0.36), up = V(NP.x, 2.2, NP.z + 0.1), headTop = V(NP.x, 1.86, NP.z);
    const kTake = ramp(f, take0, take1), kLift = ramp(f, lift0, lift0 + 18), kOn = ramp(f, on - 10, on);
    const crown = mix(mix(mix(held, mine, kTake), up, kLift), headTop, kOn);
    const crowned = f >= on;
    if (!crowned) w.prop("crown").put(crown, { yaw: 0.3 });
    const hands = kTake > 0.05 && !crowned ? [V(crown.x - 0.17, crown.y + 0.03, crown.z), V(crown.x + 0.17, crown.y + 0.03, crown.z)] : undefined;
    const np = crowned ? NP_CROWNED : NP_SACRE;
    fig(w, np, "", NP, yawTo(NP, ME) + 0.25 * (1 - ramp(f, lift0, lift0 + 12)), f, 1, "np", { expr: crowned ? "smug" : kTake > 0 ? "cool" : "stern", ...(hands ? { hands, armFront: [true, true] } : {}) });
    w.actor(crowned ? NP_SACRE : NP_CROWNED).set({ visible: false } as never);
    fig(w, POPE, "", PO, yawTo(PO, NP) * 0.6 + yawTo(PO, ME) * 0.4, f, 2, undefined, { expr: kTake > 0.5 ? (crowned ? "speechless" : "shock") : "neutral", hands: [V(held.x - 0.17, held.y + 0.03, held.z), V(held.x + 0.17, held.y + 0.03, held.z)] });
    const dv = V(X - 2.5, 0, -3.3); fig(w, DAVID, "", dv, yawTo(dv, NP), f, 3, undefined, { pose: { kind: "write", t: f / 30 }, expr: "focus" });
    [[-3.2, -5.2], [2.9, -5.0], [3.6, -3.8]].forEach(([x, z], i) => { const p = V(X + x, 0, z); fig(w, SECRETARY, `c${i}`, p, yawTo(p, NP), f, 5 + i, undefined, { expr: crowned ? "shock" : "neutral" }); });
    const camera = povCam(f, [
      { f: S.from, pos: [X, 1.5, 2.6], look: [X + 0.3, 2.6, -8], fov: 62 },
      { f: L0("B08") + 20, pos: [X, 1.5, 1.8], look: [X + 0.3, 1.13, -2.4], fov: 52 },
      { f: take0, pos: [X, 1.5, 1.6], look: [X + 0.3, 1.08, -2.4], fov: 48 },
      { f: lift0 + 18, pos: [X - 0.1, 1.5, 1.4], look: [NP.x + 0.1, 1.53, NP.z], fov: 42 },
      { f: on + 30, pos: [X - 0.1, 1.5, 1.2], look: [NP.x + 0.2, 1.33, NP.z], fov: 40 },
      { f: L1("B11") + 40, pos: [X + 0.1, 1.5, 1.3], look: [X + 0.35, 1.28, -2.4], fov: 46 },
    ], {});
    return { camera };
  },
};

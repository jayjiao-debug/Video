// SCENE A, the Alps, May 1800 (script_v2 A01-A07). A snow path under a rock wall; grenadiers drag a cannon lashed in a
// tree trunk; he rides past her on a MULE in the grey coat and the hat. 「不可能？这个词，不是法语。」 then THE FREEZE
// (his card). She looks down at the mule (A03), the famous painting flashes over it (A05), he rides on (A07: the title).
import { seg, TITLE_BLOCK, FREEZE } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, speak, saying, seated, yawTo, L0, L1, ramp, fig } from "./common";
import { NP_CONSUL, GRENADIER } from "../people";
import { ISLAND, ALPS } from "../sets";
import { seatOf } from "../props";

const S = seg("A"), X = ISLAND.alps, Z = ALPS.pathZ;
/** the mule on frame f: where it stands and its yaw (0 = facing her right) */
export const muleAt = (f: number) => {
  const stop = FREEZE.at, go = L1("A07") + 8;
  const x = f <= stop ? X - 6.2 + 6.3 * ramp(f, S.from - 20, stop) : X + 0.1 + 9 * Math.pow(Math.max(0, (f - go) / 110), 1.6);
  const yaw = -0.3 * ramp(f, stop - 40, stop) * (1 - ramp(f, go, go + 30));
  const moving = f < stop - 2 || f > go;
  return { at: V(x, 0, Z), yaw, moving };
};
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("alps");
    const m = muleAt(f), t = f / 30;
    w.prop("mule").put(m.at, { yaw: m.yaw, t, walk: m.moving ? 1 : 0 });
    const q = saying("np", f);
    const expr = f >= L0("A05") && f <= L1("A05") + 30 ? "smug" : f >= L0("A07") ? "cool" : "stern";
    w.actor(NP_CONSUL).set({ ...standing(m.at, m.yaw + Math.PI / 2, f, 1), ...seated(seatOf(m.at, m.yaw), t), expr, ...(q ? speak(q, f, 1) : {}) } as never);
    // the cannon and the two who drag it, well behind him; they stop when he stops and stare
    const cx = m.at.x - 5.2 - (f > FREEZE.at ? 0 : 0), hauling = m.moving && f < FREEZE.at;
    const cAt = V(Math.min(cx, X - 5.0), 0, Z - 0.5);
    w.prop("cannon").put(cAt, { yaw: 0 });
    [[1.9, 0.35], [2.5, -0.35]].forEach(([dx, dz], i) => {
      const p = V(cAt.x + dx, 0, cAt.z + dz);
      w.actor(GRENADIER, `h${i}`).set({ ...standing(p, Math.PI / 2, f, 4 + i), ...(hauling ? { pose: { kind: "haul", t, amount: 0.8 } } : {}), expr: hauling ? "pained" : "nervous" } as never);
    });
    void fig; void yawTo;
    const head = [m.at.x - 0.1, 1.98, Z + 0.15] as [number, number, number];
    const muleHead = [m.at.x + 0.55, 1.55, Z + 0.2] as [number, number, number];
    const camera = povCam(f, [
      { f: S.from, pos: [X, 1.5, 2.3], look: [X - 4.6, 1.2, Z], fov: 58 },
      { f: L1("A01"), pos: [X, 1.5, 2.3], look: [X - 2.8, 1.5, Z], fov: 54 },
      { f: FREEZE.at, pos: [X, 1.5, 2.2], look: [X, 1.6, Z], fov: 45 },
      { f: L0("A03") - 6, pos: [X, 1.5, 2.2], look: [X, 1.6, Z], fov: 45 },
      { f: L0("A03") + 10, pos: [X + 0.4, 1.45, 2.2], look: muleHead, fov: 50 },
      { f: L1("A03") + 6, pos: [X + 0.4, 1.45, 2.2], look: muleHead, fov: 50 },
      { f: L0("A04") + 10, pos: [X + 0.2, 1.5, 2.2], look: [head[0] + 0.25, 1.8, head[2]], fov: 48 },
      { f: L1("A06") + 4, pos: [X + 0.2, 1.5, 2.2], look: [head[0] + 0.25, 1.75, head[2]], fov: 48 },
      { f: L1("A07") + 8, pos: [X, 1.5, 2.2], look: [X + 0.2, 1.6, Z], fov: 50 },
      { f: TITLE_BLOCK.from + 20, pos: [X + 0.3, 1.5, 2.3], look: [X + 3.4, 1.5, Z], fov: 56 },
    ], { walk: 0 });
    return { camera };
  },
};

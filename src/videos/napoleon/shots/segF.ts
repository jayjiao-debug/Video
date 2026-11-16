// SCENE F, Laffrey, 7 March 1815, then Waterloo (F28-F33). A line of the King's soldiers across the road, muskets up.
// He walks toward them alone (F29), stops, opens his arms (F30: 「谁想打死自己的皇帝，开枪。」); silence; every musket
// drops and they cheer. On 「这也行？！」 the stamp 一百天后 · 滑铁卢 slams and the place changes (WATERLOO_AT): dusk,
// smoke, him beside the white horse; he opens his mouth, shuts it (F32), 「上马。」 and rides off.
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, yawTo, L0, L1, ramp, saying, speak, alive, fig, walkAlong, standing, seated } from "./common";
import { NP_CONSUL, GRENADIER } from "../people";
import { ISLAND } from "../sets";
import { seatOf } from "../props";

const S = seg("F"), XL = ISLAND.laffrey, XW = ISLAND.waterloo;
/** the first frame of Waterloo (the stamp covers the change) */
export const WATERLOO_AT = L1("F31") + 34;
export const STAMP_AT = L1("F31") + 22;
const LINE_Z = -6.2;
export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    const t = f / 30, q = saying("np", f);
    if (f < WATERLOO_AT) {
      w.setPlace("laffrey");
      const go = L1("F28") + 10, drop = L1("F30") + 44;
      const leg = walkAlong([V(XL + 0.5, 0, -0.9), V(XL, 0, -3.4)], 1.1, (f - go) / 30, { endFacing: Math.PI, startFacing: Math.PI });
      const open = ramp(f, L0("F30") - 10, L0("F30") + 6);
      w.actor(NP_CONSUL).set({
        visible: true, at: leg.at, facing: Math.PI, pose: leg.pose, turn: 1, ...alive(t, 1), expr: "stern", ...(q ? speak(q, f, 1) : {}),
        ...(open > 0.05 ? { hands: [V(leg.at.x - 0.34 * open - 0.1, 1.05 + 0.1 * open, leg.at.z - 0.05), V(leg.at.x + 0.34 * open + 0.1, 1.05 + 0.1 * open, leg.at.z - 0.05)] } : {}),
      } as never);
      const k = ramp(f, drop, drop + 12), cheer = f > drop + 16;
      for (let i = 0; i < 7; i++) {
        const p = V(XL - 3 + i * 1.0, 0, LINE_Z - 0.25 * (i % 2)), d = ramp(f, drop + i * 2, drop + 10 + i * 2);
        fig(w, GRENADIER, `r${i}`, p, 0, f, 3 + i, undefined, { expr: cheer ? "happy" : d > 0.3 ? "relief" : "nervous", ...(cheer ? { pose: { kind: "cheer", t: t + i * 0.2 } } : {}) });
        if (!cheer) w.prop("musket", `r${i}`).put(V(p.x + 0.24, 0.98 - 0.4 * d, p.z + 0.3), { yaw: -Math.PI / 2, tilt: -1.0 * d });
      }
      void k;
      const camera = povCam(f, [
        { f: S.from, pos: [XL + 0.2, 1.5, 2.4], look: [XL, 1.08, LINE_Z], fov: 54 },
        { f: go + 40, pos: [XL + 0.9, 1.5, 1.6], look: [XL - 0.2, 1.08, -4], fov: 50 },
        { f: L0("F30"), pos: [XL + 1.3, 1.5, 0.2], look: [XL - 0.3, 1.13, -4.2], fov: 46 },
        { f: drop, pos: [XL + 1.4, 1.5, -0.2], look: [XL - 0.3, 1.13, -4.4], fov: 42 },
        { f: drop + 40, pos: [XL + 1.2, 1.5, 0.4], look: [XL - 0.2, 1.18, -4.6], fov: 52 },
      ], {});
      return { camera };
    }
    w.setPlace("waterloo");
    const NP = V(XW + 0.3, 0, -2.2), HS = V(XW - 1.5, 0, -2.9), ME = V(XW, 1.5, 2);
    const mount = L1("F33") + 14, gone = Math.max(0, (f - mount) / 30);
    const hAt = V(HS.x - 1.3 * gone * gone, 0, HS.z - 0.4 * gone), yaw = Math.PI - 0.2;
    w.prop("horse").put(hAt, { yaw, t, walk: gone > 0 ? 1 : 0 });
    const gape = f >= L1("F32") + 14 && f < L1("F32") + 34;
    if (f < mount) w.actor(NP_CONSUL).set({ ...standing(NP, yawTo(NP, ME) - 0.5 * ramp(f, L0("F33") - 4, L0("F33") + 8), f, 1), expr: gape ? "speechless" : "gloom", lookDown: gape ? 0 : 10, ...(q ? speak(q, f, 1) : {}) } as never);
    else w.actor(NP_CONSUL).set({ ...standing(hAt, yaw + Math.PI / 2, f, 1), ...seated(seatOf(hAt, yaw), t), expr: "stern", turn: 1 } as never);
    const camera = povCam(f, [
      { f: WATERLOO_AT, pos: [XW, 1.5, 2.4], look: [XW + 0.2, 1.18, -2.4], fov: 54 },
      { f: L0("F32"), pos: [XW, 1.5, 1.8], look: [NP.x, 1.23, NP.z], fov: 44 },
      { f: L1("F32") + 30, pos: [XW + 0.1, 1.5, 1.4], look: [NP.x, 1.28, NP.z], fov: 38 },
      { f: mount, pos: [XW + 0.1, 1.5, 1.5], look: [NP.x - 0.4, 1.23, NP.z], fov: 42 },
      { f: mount + 50, pos: [XW, 1.5, 2.2], look: [XW - 3.2, 1.28, -3.4], fov: 54 },
    ], {});
    return { camera };
  },
};

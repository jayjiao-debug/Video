// SCENE A, Arcole, 15 Nov 1796 (script_v1.md A01-A07). She is on the near bank; across the water two grenadiers have
// just hauled him out, soaked, the flag still in his fist. BLOCKING for the look stills: the camera comes down from the
// bridge to him (A01), holds on him for A02 and THE FREEZE (his card, story.ts FREEZE), then she crouches on
// 「Plus bas.」 until the bridge sits behind his legs (A05), and he walks off on 「À cheval.」 (the title lands there).
import { line, seg, quote, TITLE_BLOCK } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, standing, speak, saying, yawTo } from "./common";
import { NP_GENERAL_WET, GRENADIER } from "../people";
import { ISLAND } from "../sets";

const S = seg("A"), X = ISLAND.arcole;
export const A_AT = V(X + 0.15, 0, -1.9);
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("arcole");
    const me = V(X, 1.5, 2.0);
    const q = saying("np", f);
    const gone = Math.max(0, (f - (line("A07").to + 12)) / 30);            // he walks off to her right after 「À cheval.」
    const at = V(A_AT.x + 1.6 * gone * gone, 0, A_AT.z - 0.6 * gone);
    w.actor(NP_GENERAL_WET).set({ ...standing(at, gone > 0 ? Math.PI / 2 : yawTo(at, me), f, 1), ...(q ? speak(q, f, 1) : {}) });
    w.actor(GRENADIER, "a").set(standing(V(X - 0.85, 0, -2.5), yawTo(V(X - 0.85, 0, -2.5), at), f, 2));
    w.actor(GRENADIER, "b").set(standing(V(X + 1.25, 0, -2.8), yawTo(V(X + 1.25, 0, -2.8), at), f, 3));
    w.prop("flag").put(V(at.x - 0.36, 0, at.z + 0.05), { yaw: Math.PI - 0.35, tilt: 0.1, t: f / 30 });
    const a2 = quote("np", "A02"), a4 = line("A04"), a5 = line("A05");
    const camera = povCam(f, [
      { f: S.from, pos: [X, 1.5, 2.2], look: [X + 2.4, 1.9, -5.2], fov: 56 },
      { f: line("A01").to, pos: [X, 1.5, 2.0], look: [X + 0.15, 1.25, -1.9], fov: 46 },
      { f: a2.to + 9, pos: [X, 1.5, 1.9], look: [X + 0.15, 0.86, -1.9], fov: 46 },
      { f: a4.from, pos: [X, 1.5, 1.9], look: [X + 0.15, 0.9, -1.9], fov: 44 },
      { f: a4.to + 14, pos: [X, 0.3, 1.9], look: [X + 0.15, 1.1, -1.9], fov: 50 },
      { f: a5.to + 60, pos: [X, 0.3, 1.9], look: [X + 0.15, 1.15, -1.9], fov: 48 },
      { f: line("A07").from, pos: [X, 1.5, 1.9], look: [X + 0.15, 1.3, -1.9], fov: 46 },
      { f: TITLE_BLOCK.from, pos: [X, 1.5, 2.0], look: [X + 1.2, 1.7, -5.2], fov: 54 },
    ], { walk: 0 });
    return { camera };
  },
};

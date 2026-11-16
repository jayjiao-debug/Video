// SCENE D, the Tuileries, about 1806 (D17-D24). He paces and dictates to three clerks at once (D17-18: 「四封。你也记。」
// and he points at her); dinner arrives and is gone (D19-20); cards at the small table by her: she pans down to the card
// under his sleeve (D21) 「这也叫战略。」(D22); the London print on the table (D23); he stands very straight (D24).
import { seg } from "../story";
import type { Segment } from "../story";
import { povCam } from "../cam";
import { V, yawTo, L0, L1, ramp, fig, walkAlong, saying, speak, alive, mix } from "./common";
import { NP_GREEN, SECRETARY } from "../people";
import { ISLAND, TUILERIES } from "../sets";

const S = seg("D"), X = ISLAND.tuileries, ME = V(X, 1.5, 2);
const [TX, TZ] = TUILERIES.table, TOP = TUILERIES.tableTop;
const DESK = V(X - 0.2, 0, -1.75), TABLE = V(X + TX - 0.25, 0, TZ - 0.72);
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("tuileries");
    const t = f / 30;
    // the clerks write without looking up; each jumps when he points at him
    TUILERIES.clerks.forEach(([cx, cz], i) => {
      const p = V(X + cx, 0, cz), hit = Math.sin(t * 2.1 + i * 2.1) > 0.75 && f < L0("D19");
      w.actor(SECRETARY, `k${i}`).set({ visible: true, at: p, facing: 0, pose: { kind: "write", t: t * (1.6 + 0.2 * i) }, seat: { top: V(p.x, 0.46, p.z), floor: 0, back: 0.03 }, expr: hit ? "shock" : "nervous", ...alive(t, 10 + i) } as never);
    });
    // 1 he paces along the desks, 2 to his desk for dinner, 3 to the card table
    const toDesk = L0("D19") - 30, toTable = L1("D20") - 6;
    const pace = 1.6 * Math.sin((f - S.from) / 34);
    const pacing = walkAlong([V(X + 1.6, 0, -3.3), V(X - 1.6, 0, -3.3)], 1.5, 0, {});
    void pacing;
    const q = saying("np", f);
    let st: Record<string, unknown>;
    if (f < toDesk) {
      const dir = Math.cos((f - S.from) / 34) >= 0 ? 1 : -1, point = f >= L0("D18") + 16 && f <= L1("D18") + 10;
      const p = V(X + pace, 0, -3.3);
      st = point ? { at: p, facing: yawTo(p, ME), pose: { kind: "point", t, arm: 0 } } : { at: p, facing: dir * Math.PI / 2, pose: { kind: "walk", phase: ((f - S.from) / 22) % 1, stride: 0.2 } };
    } else if (f < toTable) {
      const leg = walkAlong([V(X + 1.6 * Math.sin((toDesk - S.from) / 34), 0, -3.3), V(X + 1.3, 0, -3.35), V(X + 1.3, 0, -1.85), DESK], 3.2, (f - toDesk) / 30, { endFacing: 0 });
      st = { at: leg.at, facing: leg.facing, pose: leg.pose };
    } else {
      const leg = walkAlong([DESK, V(X + 0.2, 0, -1.2), TABLE], 2.0, (f - toTable) / 30, { endFacing: yawTo(TABLE, ME) });
      st = { at: leg.at, facing: leg.facing, pose: leg.pose };
    }
    const tall = ramp(f, L0("D24") - 2, L0("D24") + 6);
    const eat = f >= L1("D19") - 4 && f < L1("D19") + 24 ? V(X - 0.62, 1.08, -1.74) : null;
    const cheat = f >= L1("D20") + 40 && f < L0("D23") - 10;
    const hand = V(X + TX - 0.2, TOP + 0.05, TZ - 0.28);
    const expr = f >= L0("D24") ? "rage" : f >= L0("D23") ? "huff" : f >= L0("D22") - 4 ? "smug" : f >= L0("D21") ? "deadpan" : f >= toTable ? "scheming" : "stern";
    w.actor(NP_GREEN).set({ visible: true, ...st, ...alive(t, 1), expr, ...(q ? speak(q, f, 1) : {}), ...(cheat ? { hands: [hand, null], armFront: [true, undefined] } : eat ? { hands: [eat, null], armFront: [true, undefined] } : {}), ...(tall > 0 ? { head: { dy: 0.12 * tall, scale: 1 + 0.05 * tall } } : {}) } as never);
    // dinner: a servant brings the plate; it is empty before he has let go
    const serve0 = L0("D19") - 30;
    if (f >= serve0 && f < toTable + 50) {
      const leg = walkAlong([V(X - 5, 0, -1.6), V(X - 1.0, 0, -1.8)], 2.0, (f - serve0) / 30, { endFacing: Math.PI / 2 });
      const sAt = leg.at;
      fig(w, SECRETARY, "sv", sAt, leg.facing, f, 7, undefined, { pose: leg.pose, expr: leg.arrived ? "shock" : "neutral" });
      const full = 1 - ramp(f, L1("D19") + 4, L1("D19") + 22);
      w.prop("plate").put(V(sAt.x + 0.34, 1.02, sAt.z + 0.06), { full });
    }
    // the cards and the print on the little table
    if (f >= toTable) {
      [[-0.1, 0.12], [0.02, 0.16], [0.14, 0.13]].forEach(([dx, dz], i) => w.prop("card", `t${i}`).put(V(X + TX + dx, TOP + 0.004 + i * 0.001, TZ + dz), { yaw: (i - 1) * 0.3 }));
      [[-0.12, -0.2], [-0.02, -0.22]].forEach(([dx, dz], i) => w.prop("card", `h${i}`).put(V(X + TX + dx, TOP + 0.004, TZ + dz), { yaw: 0.2 * i, back: true }));
      if (cheat || f >= L0("D21")) w.prop("card", "ace").put(mix(V(hand.x + 0.02, TOP + 0.006, hand.z + 0.03), V(hand.x + 0.12, TOP + 0.006, hand.z + 0.14), ramp(f, L1("D21"), L1("D21") + 10)), { yaw: 0.5 });
    }
    if (f >= L0("D23") - 14) w.prop("print").put(V(X + TX + 0.12, TOP + 0.012, TZ + 0.05), { yaw: -0.2 });
    const tabLook = [X + TX - 0.1, TOP - 0.3, TZ - 0.2] as [number, number, number];
    const camera = povCam(f, [
      { f: S.from, pos: [X, 1.5, 2.4], look: [X, 1.08, -3.6], fov: 60 },
      { f: L0("D18") + 16, pos: [X, 1.5, 2.2], look: [X + pace * 0.6, 1.18, -3.3], fov: 50 },
      { f: toDesk + 24, pos: [X, 1.5, 2.0], look: [X + 0.7, 1.15, -2.4], fov: 50 },
      { f: toDesk + 56, pos: [X, 1.5, 2.0], look: [X - 0.62, 1.1, -1.8], fov: 46 },
      { f: L1("D19") + 26, pos: [X, 1.5, 1.8], look: [X - 0.62, 1.05, -1.8], fov: 42 },
      { f: toTable + 46, pos: [X + 0.3, 1.5, 1.5], look: [X + TX - 0.2, 1.18, TZ - 0.6], fov: 50 },
      { f: L0("D21") - 8, pos: [X + 0.3, 1.5, 1.5], look: [X + TX - 0.2, 1.18, TZ - 0.6], fov: 50 },
      { f: L0("D21") + 8, pos: [X + 0.5, 1.55, 1.1], look: tabLook, fov: 34 },
      { f: L1("D21") + 8, pos: [X + 0.5, 1.55, 1.1], look: tabLook, fov: 32 },
      { f: L0("D22") + 4, pos: [X + 0.3, 1.5, 1.4], look: [TABLE.x, 1.28, TABLE.z], fov: 42 },
      { f: L0("D23") - 12, pos: [X + 0.3, 1.5, 1.4], look: [TABLE.x, 1.28, TABLE.z], fov: 42 },
      { f: L0("D23") + 4, pos: [X + 0.6, 1.55, 1.0], look: [X + TX + 0.12, TOP, TZ + 0.05], fov: 30 },
      { f: L1("D23") + 2, pos: [X + 0.6, 1.55, 1.0], look: [X + TX + 0.12, TOP, TZ + 0.05], fov: 30 },
      { f: L0("D24") + 6, pos: [X + 0.3, 1.2, 1.5], look: [TABLE.x, 1.02, TABLE.z], fov: 44 },
      { f: S.to, pos: [X + 0.3, 1.2, 1.6], look: [TABLE.x, 1.02, TABLE.z], fov: 46 },
    ], {});
    return { camera };
  },
};

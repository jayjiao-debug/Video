// SHARED KIT: src/kit/acc/held.ts (KIT.md, acc/README.md). Built for Hongmen; any toon film imports it from here.
// HELD things of the Hongmen cast: what hangs in a figure's hand as part of the figure (the swords, the shield, the
// cups, the pig leg and the tray are world props: props/).
//   halberd   a gate guard's halberd (戟), upright in one hand. slots: hand0 / hand1
import * as THREE from "three";
import type { Acc, PartKit } from "../../videos/group/kit/rig3d";
import { dimsOf } from "../../videos/group/kit/toon";
import { turned, roundBox, shade } from "../../videos/group/kit/rigacc/shapes";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const rad = (d: number) => (d * Math.PI) / 180;
/** the height of the body's bottom above the ground when the figure stands */
const standHip = (b: PartKit) => { const D = dimsOf(b.look), ys = clamp((D.H.b / D.H.a) * 0.95, 0.85, 0.97); return 1.45 - b.R * ys - b.headY; };
/** one normal per position (the mean of the faces that meet there), so that the ink hull stays closed over seams */
const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};

/** A guard's halberd, held upright in one hand (0 = the person's right, the default): a wooden shaft `len` long
 *  (2.0 m) with a spear point on top and a dagger blade (戈) standing out to the side under it, and a tassel in the
 *  camp's colour. PIN THE HALBERD HAND with shots/common.ts halberdHand() (2026-11-12: left hanging, the shaft goes
 *  1.6-2 cm into the armour skirt below the hand; no straight shaft through a hanging hand clears both head and hem).
 *  Unpinned, the arm hangs and stays down in wave, point and cheer (held hang); the hand
 *  is on the shaft where a hanging hand is, about 0.6 m up, and the butt stands `lift` above the ground when the
 *  figure stands idle (default 0.03 m; give 0.09 to a guard who walks: the body dips 6 cm in every step and the
 *  halberd with it). It leans out a little at the top, clear of the head. layer "limb" (default) = like the hand it is
 *  never drawn in front of the figure's own head; "free" = plain depth. */
export const halberd = (o: { hand?: 0 | 1; len?: number; col?: string; lift?: number; head?: string; tassel?: string | false; layer?: "limb" | "free" } = {}): Acc => {
  const hand = o.hand ?? 0, len = o.len ?? 2.0, col = o.col ?? "#7a4a2c", lift = o.lift ?? 0.03, steel = o.head ?? "#c9cfd8", tassel = o.tassel === undefined ? "#6a2f9a" : o.tassel, s = hand ? 1 : -1;
  return {
    name: "halberd", slots: [hand ? "hand1" : "hand0"], key: ["halberd", hand, len, col, lift, steel, tassel, o.layer ?? "limb"].join("|"),
    build(b) {
      // where the hanging hand is when the figure stands (the rig's own rule for a hanging arm)
      const hipY = standHip(b), shY = 0.84 * b.Ht, r = b.bodyR(0.84, s * 72) + 0.0177, A = 2 * b.R * 0.84, reach = 0.972 * A;
      const dx = b.rb + 0.05 - Math.sin(rad(72)) * r, dz = 0.03 - Math.cos(rad(72)) * r, handY = hipY + shY - Math.sqrt(Math.max(0.01, reach * reach - dx * dx - dz * dz));
      // the shaft passes the hand on its outer side and leans out toward the top: at the head's height it is clear
      // of the head (whose half width is more than the hand's distance from the body's axis)
      const out = 0.03, need = b.R * 1.1 + 0.035 - (b.rb + 0.05 + out), rise = b.headY - (handY - hipY), tilt = clamp(Math.atan2(Math.max(need, 0), rise), rad(3), rad(11));
      const g = b.held(hand, { offset: [s * out, 0, 0], rot: [0, 0, -s * tilt], layer: o.layer ?? "limb", hang: true });
      const y0 = -(handY - lift) / Math.cos(tilt), rs = 0.0155, hl = 0.3, ink = 0.0058, sl = len - hl + 0.04;
      // (rings all the way up the shaft: rig.qa.held measures a held thing's points against the body and the head)
      b.solid(g, new THREE.CylinderGeometry(rs, rs, sl, 14, Math.ceil(sl / 0.06)), { col, ink }).position.y = y0 + sl / 2;
      // the head: a socket on the shaft's end, a flat leaf point, and the side blade under it, pointing away from the body
      b.solid(g, turned([[0, 0], [0.024, 0], [0.019, 0.085], [0, 0.085]], 0.005, 18), { col: shade(steel, 0.8), ink }).position.y = y0 + len - hl - 0.012;
      const leaf = turned([[0, 0], [0.014, 0], [0.045, 0.085], [0.028, 0.18], [0, 0.245]], 0.012, 28);
      leaf.scale(1, 1, 0.3);
      b.solid(g, weld(leaf), { col: steel, ink }).position.y = y0 + len - 0.245;
      const blade = turned([[0, 0], [0.016, 0], [0.04, 0.07], [0.022, 0.15], [0, 0.2]], 0.012, 24);
      blade.scale(1, 1, 0.3);
      const bm = b.solid(g, weld(blade), { col: steel, ink });
      bm.rotation.z = s * Math.PI / 2 * -1; bm.position.set(s * 0.012, y0 + len - hl + 0.03, 0);
      // the blade's short tang on the other side of the shaft
      b.solid(g, roundBox(0.07, 0.03, 0.02, 0.4), { col: shade(steel, 0.85), ink: 0.005 }).position.set(-s * 0.04, y0 + len - hl + 0.03, 0);
      if (tassel) {
        const t = turned([[0, 0], [0.012, 0], [0.03, 0.05], [0.022, 0.1], [0, 0.11]], 0.01, 18);
        b.solid(g, t, { col: tassel, paint: "cloth", ink: 0.005 }).position.set(0, y0 + len - hl - 0.13, 0);
      }
    },
  };
};

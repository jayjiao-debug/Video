// HELD things of the Wanbi cast (BIBLE 5; BUILD_PLAN WP4): what a figure carries as part of the figure (the jade, the
// map, the cauldron and the official's cap are world props: props/).
//   whisk()   缪贤's white horsetail whisk (拂尘, V10: a Ming-Qing stage emblem of eunuchs, kept for readability): a short
//             black lacquer handle with a gold ferrule in his LEFT hand (hand 1), the white horsehair falling from the
//             handle's top end down along the outside of his hand and forearm. It hangs (held hang): the left arm stays
//             down in wave / point / cheer, a wave or a point goes to his right arm (V7's open hand and pat are his
//             right hand). Pinned hands (the claps of 23b) still move it: it follows the hand. Slot hand1; hide:
//             ["whisk"]. Kit acc/held.ts halberd is the model.
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { turned, shade } from "../../group/kit/rigacc/shapes";

/** the eunuch's white horsetail whisk in the left hand; see the head of this file. hair / handle = the colours,
 *  len = the hair's length (m) */
export const whisk = (o: { hair?: string; handle?: string; len?: number } = {}): Acc => {
  const hair = o.hair ?? "#f4f1e8", handle = o.handle ?? "#2e2830", len = o.len ?? 0.36;
  return {
    name: "whisk", slots: ["hand1"], key: ["whisk", hair, handle, len].join("|"),
    build(b) {
      // in the body's frame from the hand (x = the person's left, y up, z forward): the handle stands up through the
      // fist, leaning a little forward and out; the hair hangs from its top end on the outer side
      const g = b.held(1, { offset: [0.014, 0, 0.02], rot: [0.2, 0, -0.16], layer: "limb", hang: true });
      const hl = 0.25, foot = -0.04, rs = 0.0095, ink = 0.0046, top = foot + hl;
      b.solid(g, new THREE.CylinderGeometry(rs, rs * 1.15, hl, 12, 5), { col: handle, ink }).position.y = foot + hl / 2;
      // the gold ferrule at the top, the knob at the foot
      b.solid(g, turned([[0, 0], [0.0145, 0], [0.0165, 0.02], [0.013, 0.032], [0, 0.034]], 0.004, 16), { col: "#e2b03a", ink: 0.0042 }).position.y = top - 0.008;
      b.solid(g, new THREE.SphereGeometry(0.0135, 12, 9), { col: shade(handle, 1.2), ink: 0.0042 }).position.y = foot;
      // the hair: a long slim tail from the ferrule, falling down past the outer side of the hand (flattened a little)
      const prof: [number, number][] = [[0, 0], [0.008, 0.008], [0.021, 0.045], [0.026, len * 0.45], [0.022, len * 0.78], [0.012, len - 0.012], [0, len]];
      const tail = turned(prof, 0.012, 20);
      tail.scale(1, -1, 0.78);                  // (hanging down from its top)
      const map = b.tex(64, 256, (cg) => {
        cg.fillStyle = "#ffffff"; cg.fillRect(0, 0, 64, 256);
        cg.strokeStyle = "#c9c4ba"; cg.lineWidth = 2.4; cg.lineCap = "round";
        for (let k = 0; k < 9; k++) { cg.beginPath(); cg.moveTo(4 + k * 7, 30); cg.lineTo(5 + k * 7, 250); cg.stroke(); }
        cg.fillStyle = "#b8b2a6"; cg.fillRect(0, 0, 64, 14);
      }, "wanbiWhisk");
      const t = b.solid(g, flipWinding(tail), { col: hair, map, paint: "cloth", ink: 0.0052 });
      t.position.set(0.03, top + 0.012, -0.004);
      t.rotation.z = -0.13;
    },
  };
};
/** a geometry mirrored by a negative scale has its faces inside out: turn them back (and keep one normal per point) */
const flipWinding = (g: THREE.BufferGeometry) => {
  const I = g.index!;
  for (let i = 0; i < I.count; i += 3) { const a = I.getX(i + 1); I.setX(i + 1, I.getX(i + 2)); I.setX(i + 2, a); }
  I.needsUpdate = true;
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};

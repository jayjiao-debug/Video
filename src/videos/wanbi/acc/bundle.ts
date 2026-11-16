// THE SERVANT'S ROAD GEAR (BIBLE 5, V4; BUILD_PLAN WP4): what SERVANT_ROUGH wears after the cloak is flung over him
// (16a, 1339): the only brown figure of the film.
//   bundle()      a cloth bundle (包袱) on his back: a soft rounded parcel between the shoulder blades, its two corners
//                 tied over the shoulders into a knot on his chest (the ties are painted on his robe). Fixed to the
//                 body (it leans and turns with it); the arms keep clear of it (keepOut). Slot back; hide: ["bundle"].
//   headCloth()   a brown head-cloth (巾): a plain cloth tied round the head that hugs it (no rolled edge: with one it
//                 read as a bowl hat), low on the brow, no knot bump, a small knot and two short ends at the back
//                 (acc/envoy.ts clothWrap). Slots hat + crown; hide: ["headCloth"].
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { roundBox, shade } from "../../group/kit/rigacc/shapes";
import { clothWrap } from "./envoy";

/** the cloth bundle on the back; see the head of this file. col = the cloth, tie = the ties and the knot */
export const bundle = (o: { col?: string; tie?: string } = {}): Acc => {
  const col = o.col ?? "#6b4f36", tie = o.tie ?? "#4f3a28";
  return {
    name: "bundle", slots: ["back"], key: ["bundle", col, tie].join("|"),
    outfit(c) {
      // the two ties: from behind each shoulder down over the chest to a knot a little to the left of the middle
      const t0 = 0.62, kz = 12, w = c.LW * 3.2;
      for (const s of [-1, 1]) c.line([c.P(s * 120, 0.97), c.P(s * 52, 0.99), c.P(kz + s * 10, t0 + 0.05)], tie, w);
      const [x, y] = c.P(kz, t0), rx = (c.az(0.024, t0) / 360) * c.W, ry = 0.022 * c.pxUp(t0);
      c.g.beginPath(); c.g.ellipse(x, y, rx, ry, 0, 0, 7); c.g.fillStyle = tie; c.g.fill(); c.g.strokeStyle = shade(tie, 0.55); c.g.lineWidth = 4; c.g.stroke();
      for (const s of [-1, 1]) c.line([c.P(kz + s * 2, t0 - 0.01), c.P(kz + s * 7, t0 - 0.07)], tie, w * 0.8);
    },
    build(b) {
      // the parcel: a soft pillow between the shoulder blades, standing clear of the back
      const t = 0.6, back = b.bodyR(t, 180), w = 0.25, h = 0.2, d = 0.12;
      const map = b.tex(128, 128, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 128, 128);
        g.strokeStyle = "#9a8f84"; g.lineWidth = 4; g.lineCap = "round";
        g.beginPath(); g.moveTo(10, 30); g.quadraticCurveTo(64, 50, 118, 26); g.stroke();
        g.beginPath(); g.moveTo(20, 96); g.quadraticCurveTo(64, 80, 108, 100); g.stroke();
      }, "wanbiBundle");
      const m = b.solid("body", roundBox(w, h, d, 0.62), { col, map, paint: "cloth", ink: 0.007 });
      m.position.set(0, t * b.Ht, -(back + d / 2 - 0.012));
      // the knot of its corners on top, at the nape side
      const k = b.solid("body", roundBox(0.07, 0.05, 0.05, 0.7), { col: tie, paint: "cloth", ink: 0.005 });
      k.position.set(0, t * b.Ht + h / 2 - 0.006, -(back + 0.02));
      b.keepOut(new THREE.Vector3(0, t * b.Ht, -(back + d / 2)), 0.1);
    },
  };
};

/** the servant's brown head-cloth; see the head of this file */
export const headCloth = (o: { col?: string } = {}): Acc =>
  clothWrap("headCloth", { col: o.col ?? "#6e5238", band: o.col ?? "#6e5238", bump: 0, ends: 0.34, rim: 64, back: 14, r: 1.035, crown: 1.08, roll: 0, folds: true });

// THE BANDITS' FACE CLOTH of the Qin film (segment F: 兰池遇盗), drawn on the face (the rig's faceMask, group/kit/rigacc/
// facemask.ts, is the model): a dark cloth tied over the nose and the mouth, its top edge just under the eyes, hanging
// in a point under the chin, with a knot and two short ends at the side of the head. The bandits never speak, so
// hiding the mouth costs nothing; at phone size the dark lower face reads as "bandit" at once.
//   banditCloth({ col, knot })   slots mouth + lip + chin (no beard with it); hide it by giving another Person.
// Units (group/kit/rig3d.ts FaceKit): u = 1 % of the head's width from the middle of the eye line, y down; the eyes are
// at x +-14, about 10u tall; the chin's outline near y 44. Nothing random.
import type { Acc, P2 } from "../../group/kit/rig3d";

export const banditCloth = (o: { col?: string; fold?: string; knot?: number } = {}): Acc => {
  const col = o.col ?? "#4a3a30", fold = o.fold ?? "#6a5444", side = o.knot ?? 1;
  return {
    name: "banditCloth", slots: ["mouth", "lip", "chin"], key: `${col}|${fold}|${side}`,
    face(f) {
      // the outline: the top edge under the eyes (a little lower over the nose bridge), out past the cheeks, down to a
      // soft point under the chin
      const top: P2[] = f.quad([-52, 8], [0, 12.5], [52, 8], 14);
      const right: P2[] = f.quad([52, 8], [50, 26], [26, 41], 8);
      const point: P2[] = f.quad([26, 41], [0, 56], [-26, 41], 10);
      const left: P2[] = f.quad([-26, 41], [-50, 26], [-52, 8], 8);
      f.fill([...top, ...right.slice(1), ...point.slice(1), ...left.slice(1)], col, 2.2);
      // two folds: soft arcs down toward the point
      for (const [y, w] of [[22, 34], [31, 24]] as [number, number][]) f.line(f.quad([-w, y - 3], [0, y + 3], [w, y - 3], 10), 1.6, fold);
      // the knot at the side of the head and its two short ends
      const kx = side * 47, ky = 12;
      f.fill(f.arc(kx, ky, 4.2, 3.4), col, 1.8);
      for (const [dx, dy] of [[5, 13], [9, 9]] as [number, number][]) f.line(f.quad([kx, ky + 2], [kx + side * dx * 0.5, ky + dy * 0.6], [kx + side * dx, ky + dy], 5), 2.6, col);
    },
  };
};

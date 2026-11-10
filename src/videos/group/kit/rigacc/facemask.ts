import type { Acc, P2 } from "../rig3d";

/** A surgical mask drawn on the face: from just under the eyes down to the chin, so it hides the mouth. Light blue
 *  with two pleats and a loop to each ear (the doctor, the patient, anyone who does not want to be known). */
export const faceMask = (o: { col?: string; pleat?: string } = {}): Acc => {
  const col = o.col ?? "#a9d6ea", pleat = o.pleat ?? "#5f97b8";
  return {
    name: "faceMask", slots: ["mouth", "lip", "chin", "cheek"], key: `${col}|${pleat}`,
    face(f) {
      // the outline: the top edge just under the eyes, the sides hugging the cheeks, the bottom at the chin
      const top: P2[] = f.quad([-44, 7], [0, 11.5], [44, 7], 12);
      const right: P2[] = f.quad([44, 7], [47.5, 20], [42, 33], 8);
      const bottom: P2[] = f.quad([42, 33], [24, 43], [0, 43.5], 12);
      const left: P2[] = f.quad([0, 43.5], [-24, 43], [-42, 33], 12);
      const outline: P2[] = [...top, ...right.slice(1), ...bottom.slice(1), ...left.slice(1), ...f.quad([-42, 33], [-47.5, 20], [-44, 7], 8).slice(1)];
      f.fill(outline, col, 2.2);
      // two pleats: arcs across the mask, bowed down
      for (const y of [19, 27]) f.line(f.quad([-37, y - 1.5], [0, y + 2], [37, y - 1.5], 12), 1.7, pleat);
      // ear loops: from the mask's corners out to the ears at the side of the head
      for (const s of [-1, 1]) f.line(f.quad([s * 44, 13], [s * 48, 6], [s * 50, -4], 6), 1.8, f.INK);
    },
  };
};

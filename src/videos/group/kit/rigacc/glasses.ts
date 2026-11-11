import type { Acc, P2 } from "../rig3d";

/** Glasses, drawn on the face. round = thin wire circles (the scholar, the clerk); square = heavy dark frames (the
 *  nerd, the accountant); shades = dark lenses that hide the eyes (the cool one, the bodyguard). */
export const glasses = (o: { kind?: "round" | "square" | "shades"; col?: string } = {}): Acc => {
  const kind = o.kind ?? "round", col = o.col ?? "#2a2230";
  return {
    name: "glasses", slots: ["eyes"], key: `${kind}|${col}`, lens: true,
    face(f) {
      const sp = f.sp, r = kind === "round" ? 11.6 : 12.2, cy = -0.6;
      const box = (s: number, hw: number, hh: number, rr: number): P2[] => {
        const b: P2[] = [];
        for (const [qx, qy, a0] of [[1, -1, -90], [1, 1, 0], [-1, 1, 90], [-1, -1, 180]]) b.push(...f.arc(s * sp + qx * (hw - rr), cy + qy * (hh - rr), rr, rr, a0, a0 + 90, 6));
        return b;
      };
      for (const s of [-1, 1]) {
        const lens = kind === "round" ? f.arc(s * sp, cy, r, r * 0.95) : kind === "square" ? box(s, r, r * 0.8, 3.2) : box(s, r + 0.6, r * 0.72, 5);
        if (kind === "shades") {
          f.fill(lens, "#2b2a35", 2.6);
          f.line([[s * sp - 6.5, cy - 3.5], [s * sp - 2.5, cy - 6]], 1.6, "#8f93a8");          // one drawn glint
        } else f.fill(lens, null, kind === "square" ? 3.6 : 2.3);
        f.line([[s * (sp + r), cy - 2], [s * 47, cy - 5]], kind === "round" ? 1.9 : 2.6, col);   // the arm to the ear
      }
      f.line([[-sp + r, cy - 1], [sp - r, cy - 1]], kind === "round" ? 1.9 : 2.6, col);          // the bridge
    },
  };
};

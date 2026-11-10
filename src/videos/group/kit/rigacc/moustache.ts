import type { Acc, P2 } from "../rig3d";

/** A moustache, drawn on the face over the mouth's upper edge. curl = two ink curls (the gentleman, the villain);
 *  handlebar = a full coloured one with turned-up ends (the showman, the strongman); walrus = a heavy one that hangs
 *  over the mouth (the captain, the old boss); pencil = a thin bar (the clerk). */
export const moustache = (o: { kind?: "curl" | "handlebar" | "walrus" | "pencil"; col?: string } = {}): Acc => {
  const kind = o.kind ?? "handlebar", col = o.col ?? "#6b4a33";
  return {
    name: "moustache", slots: ["lip"], key: `${kind}|${col}`,
    face(f) {
      const [mx] = f.mouth, y = 11.6 + f.jit(100, 0.4);
      f.turned(mx, y, f.jit(101, 2), () => {
        if (kind === "curl") {
          for (const s of [-1, 1]) f.line(f.quad([mx + s * 0.8, y + 1.2], [mx + s * 8.5, y + 5.2], [mx + s * 12.5, y - 2.6]), f.PEN);
        } else if (kind === "pencil") {
          f.line([[mx - 6.5, y + 1], [mx + 6.5, y + 1]], 3.4);
        } else {
          const half = (s: number): P2[] => kind === "handlebar"
            ? [...f.quad([mx, y - 1.6], [mx + s * 7, y - 3.4], [mx + s * 15.5, y - 4.4], 10), ...f.quad([mx + s * 15.5, y - 4.4], [mx + s * 12.5, y + 4.6], [mx, y + 3.8], 10)]
            : [...f.quad([mx, y - 2.6], [mx + s * 9, y - 4.2], [mx + s * 14.5, y + 3.6], 10), ...f.quad([mx + s * 14.5, y + 3.6], [mx + s * 9.5, y + 8.4], [mx, y + 5.2], 10)];
          for (const s of [-1, 1]) f.fill(half(s), col, 1.5);
        }
      });
    },
  };
};

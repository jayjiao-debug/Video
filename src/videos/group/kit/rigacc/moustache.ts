import type { Acc, P2 } from "../rig3d";

/** A moustache, drawn on the face between the eyes and the mouth. curl = solid ink with tips that turn up (the
 *  gentleman, the villain); handlebar = a full coloured one with raised ends (the showman, the boss); walrus = a
 *  heavy coloured one that hangs over the mouth (the captain, the old professor); pencil = two thin ink slivers (the
 *  clerk, the smooth talker). col = the colour of the two coloured kinds. */
export const moustache = (o: { kind?: "curl" | "handlebar" | "walrus" | "pencil"; col?: string } = {}): Acc => {
  const kind = o.kind ?? "handlebar", col = o.col ?? "#6b4a33";
  return {
    name: "moustache", slots: ["lip"], key: `${kind}|${col}`,
    face(f) {
      // behind glasses it sits lower (f.lip) and its ends turn up less (k), so that it stays clear of the rims
      const [mx] = f.mouth, y = f.lip + f.jit(100, 0.4), k = f.lens ? 0.45 : 1;
      // one half as a closed outline, from the middle's top edge out to the tip and back along the lower edge
      const half = (s: number): P2[] => {
        const X = (x: number) => mx + s * x, q = f.quad;
        if (kind === "curl") return [...q([X(0), y - 2.2], [X(8), y - 5.4 * k], [X(14.5), y - 1.2], 10), ...q([X(14.5), y - 1.2], [X(18.6), y + 1.4], [X(19.2), y - 6.2 * k], 8),
          ...q([X(19.2), y - 6.2 * k], [X(21.6), y + 5.6], [X(12.5), y + 4.4], 10), ...q([X(12.5), y + 4.4], [X(5), y + 3.6], [X(0), y + 2.6], 8)];
        if (kind === "pencil") return [[X(1.3), y - 1.3], [X(8.5), y - 0.6], [X(15.4), y + 3.6], [X(8), y + 3.9], [X(1.3), y + 3.6]];
        if (kind === "handlebar") return [...q([X(0), y - 2.2], [X(8), y - 5 * k], [X(18), y - 5.6 * k], 10), ...q([X(18), y - 5.6 * k], [X(15), y + 5.4], [X(0), y + 4.4], 10)];
        return [...q([X(0), y - 3], [X(10), y - 5.2 * k], [X(16.5), y + 4.4], 10), ...q([X(16.5), y + 4.4], [X(11), y + 10.6], [X(0), y + 6.4], 10)];
      };
      f.turned(mx, y, f.jit(101, 2), () => {
        const ink = kind === "curl" || kind === "pencil";
        for (const s of [-1, 1]) f.fill(half(s), ink ? f.INK : col, ink ? 0 : 1.5);
      });
    },
  };
};

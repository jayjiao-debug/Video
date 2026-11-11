import type { Acc, P2 } from "../rig3d";
import type { Look } from "../toon";

/** 大哥 ("big bro"): the account's own cameo figure, hidden once in every film. All in greys, as if cut out of a
 *  black-and-white photo: a block of a head with a square jaw wider than its crown (Look.head), combed dark hair, a
 *  shadow of stubble with drawn cheekbones and a cleft chin, narrowed eyes under heavy brows (expr "cool"), a broad
 *  chest in a grey tee. The hair and the tee are mid greys, not black: next to the ink line and the near-ink limbs a
 *  black head of hair over a black tee joins up into one dark frame round the face and reads as a hood.
 *  Use: rc.add(DAGE, { acc: dage() }) and expr: "cool" (he never changes his face). */
export const DAGE: Look = {
  seed: 777, skin: "#ececef", width: 1.22,
  top: "tee", topCol: "#70707a", bottom: "jeans", botCol: "#3a3a42", shoes: "#18181c", shoeSole: "#8c8c94",
  hair: "short", hairCol: "#585863", part: 1,
  head: { nTop: 2.3, nBot: 4.4, egg: 0.2, asym: 0, rot: 0, noise: 0.004 },
};

/** a chiselled lower face, drawn on the face: a shadow of stubble over the lip, the chin and the jaw, a drawn
 *  cheekbone on each side and a cleft in the chin. shade = the stubble (a see-through grey). */
export const chiselled = (o: { shade?: string } = {}): Acc => {
  const shade = o.shade ?? "rgba(52,52,66,0.26)";
  return {
    name: "chiselled", slots: ["chin", "cheek"], key: shade,
    faceUnder(f) {
      const [mx, my] = f.mouth, q = f.quad;
      // the stubble's upper edge on one side: from outside the head's outline in under the cheekbone to the lip
      const top = (s: number): P2[] => [
        ...q([s * 62, 5], [s * 44, 8.5], [s * 31, 15.5], 8), ...q([s * 31, 15.5], [s * 24, 12.5], [s * 15.5, my - 7.6], 8),
        ...q([s * 15.5, my - 7.6], [s * 8, my - 9.6], [mx + s * 1.4, my - 7.4], 6),
      ];
      f.fill([...top(-1), ...top(1).reverse(), [62, 80], [-62, 80]], shade, 0);
    },
    face(f) {
      const [mx, my] = f.mouth;
      for (const s of [-1, 1]) f.line(f.quad([s * 36.5, 5.5], [s * 30.5, 9.5], [s * 27.5, 17], 8), 2.4);   // the cheekbones
      f.line([[mx, my + 16.5], [mx + 0.4, my + 21]], 2.4);                                                    // the cleft chin
    },
  };
};

/** everything he wears, for RigCast.add(DAGE, { acc: dage() }) */
export const dage = (): Acc[] => [chiselled()];

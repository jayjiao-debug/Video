import { CHEEK_PEN, cheekbone } from "../rig3d";
import type { Acc, P2 } from "../rig3d";
import type { Look } from "../toon";
import { finger } from "./finger";

/** 大哥 ("big bro"): the account's own cameo figure, hidden once in every film, a finger to his lips. All in greys, as
 *  if cut out of a black-and-white photo: a block of a head with a cut jaw (Look.head: wide at the jaw's corners, then
 *  straight in to the chin, a diamond), combed
 *  dark hair, a shadow of stubble with drawn cheekbones and a cleft chin, narrowed eyes under heavy brows with one of
 *  them cocked (expr "hush"), a broad chest in a grey tee. The hair and the tee are mid greys, not black: next to the
 *  ink line and the near-ink limbs a black head of hair over a black tee joins up into one dark frame round the face
 *  and reads as a hood.
 *  Use: rc.add(DAGE, { acc: dage() }), and in every frame expr: "hush", pose: { kind: "shh" } (he never changes).
 *  Which hand: his head is wider than a standard one, and the arm of the far side cannot come round his jaw. Seen
 *  from in front or from his left, his left hand (the default). Seen from his right (he has turned to his left of
 *  the camera): dage({ hand: 0 }) and pose: { kind: "shh", arm: 0 }. Rig.qa.reach and .clear say when it is wrong. */
export const DAGE: Look = {
  seed: 777, skin: "#ececef", width: 1.22,
  top: "tee", topCol: "#70707a", bottom: "jeans", botCol: "#3a3a42", shoes: "#18181c", shoeSole: "#8c8c94",
  hair: "short", hairCol: "#585863", part: 1,
  head: { nTop: 2.3, nBot: 4.4, egg: 0.2, asym: 0, rot: 0, noise: 0.004, jaw: [0.4, 0.42] },
};

/** a chiselled lower face, drawn on the face: a shadow of stubble over the lip, the chin and the jaw, a drawn
 *  cheekbone on each side (left to the expression when it draws them itself, as "hush" does) and a cleft in the
 *  chin. shade = the stubble (a see-through grey); cleft: false = no cleft (for a face with a hand held in front of
 *  the chin: the half of the cleft that shows under the hand reads as the finger going through it). */
export const chiselled = (o: { shade?: string; cleft?: boolean } = {}): Acc => {
  const shade = o.shade ?? "rgba(52,52,66,0.26)", cleft = o.cleft ?? true;
  return {
    name: "chiselled", slots: ["chin", "cheek"], key: `${shade}|${cleft ? 1 : 0}`,
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
      if (!f.cheek) for (const s of [-1, 1]) f.line(cheekbone(s), CHEEK_PEN);                                // the cheekbones
      if (cleft) f.line([[mx, my + 16.5], [mx + 0.4, my + 21]], 2.4);                                         // the cleft chin
    },
  };
};

/** everything he wears and holds, for RigCast.add(DAGE, { acc: dage() }): his face and the finger of one hand
 *  (hand 1 = his left, the default; the same hand as pose.arm) */
export const dage = (o: { hand?: 0 | 1 } = {}): Acc[] => [chiselled({ cleft: false }), finger({ hand: o.hand ?? 1 })];

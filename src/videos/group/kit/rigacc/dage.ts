import type { Acc, P2 } from "../rig3d";
import type { Look } from "../toon";
import { finger } from "./finger";

/** 大哥 ("big bro"): the account's own cameo figure, hidden once in every film, a finger to his lips. All in greys, as
 *  if cut out of a black-and-white photo: a block of a head with a square jaw (Look.head), black hair combed back
 *  from a point in the middle of the forehead, hollow cheeks under drawn cheekbones, a long nose, narrowed eyes under
 *  heavy brows with one of them cocked (expr "hush"), a grey jacket over a black shirt.
 *  Use: rc.add(DAGE, { acc: dage() }), and in every frame expr: "hush", pose: { kind: "shh" } (he never changes).
 *  Which hand: his head is wider than a standard one, and the arm of the far side cannot come round his jaw. Seen
 *  from in front or from his left, his left hand (the default). Seen from his right (he has turned to his left of
 *  the camera): dage({ hand: 0 }) and pose: { kind: "shh", arm: 0 }. Rig.qa.reach and .clear say when it is wrong. */
export const DAGE: Look = {
  seed: 777, skin: "#ececef", width: 1.16,
  top: "jacket", topCol: "#7c7c88", inner: "#1e1e24", bottom: "chinos", botCol: "#4c4c57", shoes: "#18181c", shoeSole: "#8c8c94",
  hair: "short", hairCol: "#2a2a31", part: 1,
  head: { nTop: 2.3, nBot: 4.0, egg: 0.12, asym: 0, rot: 0, noise: 0.004 },
};

/** a sharp-cut face, drawn on the face: the hairline's point in the middle of the forehead (in the hair's colour),
 *  hollow cheeks (a see-through shade under each cheekbone, down the sides of the jaw), full lips, a cheekbone on
 *  each side and the line of a long nose. shade = the hollows; lips = the lips' fill. */
export const chiselled = (o: { shade?: string; lips?: string } = {}): Acc => {
  const shade = o.shade ?? "rgba(52,52,66,0.22)", lips = o.lips ?? "#9a9aa6";
  return {
    name: "chiselled", slots: ["chin", "cheek"], key: `${shade}|${lips}`,
    faceUnder(f) {
      const [mx, my] = f.mouth, q = f.quad;
      // the point of the hairline: it starts well under the hair, so it stays joined to it as the face slides
      if (f.look.hairCol) f.fill([[-19, -52], ...q([-19, -36], [-7, -31.5], [0, -22.5], 10), ...q([0, -22.5], [7, -31.5], [19, -36], 10), [19, -52]], f.look.hairCol, 0);
      // the hollows: under the cheekbone in from outside the head's outline, down past the corner of the mouth, and
      // out again under the jaw; the middle of the face (lip, mouth and chin) stays light
      for (const s of [-1, 1]) {
        const a: P2[] = [...q([s * 62, 5], [s * 44, 8.5], [s * 30, 15.5], 8), ...q([s * 30, 15.5], [s * 21.5, 22], [s * 17.5, 32], 8), [s * 16, 41], [s * 15, 80], [s * 62, 80]];
        f.fill(a, shade, 0);
      }
      f.fill([...q([mx - 8.2, my], [mx, my - 4.8], [mx + 8.2, my], 10), ...q([mx + 8.2, my], [mx, my + 5.6], [mx - 8.2, my], 10)], lips, 0.9);
    },
    face(f) {
      for (const s of [-1, 1]) f.line(f.quad([s * 36.5, 5], [s * 30.5, 9], [s * 27.5, 16.5], 8), 2.4);   // the cheekbones
      f.line([...f.quad([-2.4, -3], [-3.4, 3], [-4.8, 8], 6), ...f.quad([-4.8, 8], [-4.4, 10.8], [-1.2, 10.4], 5)], 2.2);   // the nose
    },
  };
};

/** everything he wears and holds, for RigCast.add(DAGE, { acc: dage() }): his face and the finger of one hand
 *  (hand 1 = his left, the default; the same hand as pose.arm) */
export const dage = (o: { hand?: 0 | 1 } = {}): Acc[] => [chiselled(), finger({ hand: o.hand ?? 1 })];

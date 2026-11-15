// A FIGURE CUT IN STONE (owner note 15 Nov: "make dage big brother more proper statue like"). The film's own code: the
// shared kit's figure (group/kit/rigacc/dage.ts, read only) is taken as it is and turned to stone here, in three steps:
//   stoneLook(look)   the look in stone: skin, clothes and hair in THREE tones of one pale limestone (the body, the
//                     hair cap darker, the carved features darkest); the seed, the head and the build are untouched,
//                     so the silhouette is his own
//   carved()          an accessory that goes LAST in the list: it re-inks everything drawn on the face (brows, lids,
//                     the smirk, the cheekbones, the stubble's shade, a blink's closed lids) in the carve tone and
//                     lays a pale edge under and to the right of every line: a cut with a lit lip, not a pen line
//   stoneRig(rig)     the limbs, hands and feet: the kit paints them near-ink (LIMB_COL, no option), so their paints
//                     are re-coloured on the built figure, with a matt lit band in place of the glossy stripe; and
//                     the head's paint: the stone's tone as given (not bleached as pale skin is), its inner shade
//                     in the stone's own colour (not the light's lavender)
// The ink outline stays (RIG_INK): he is still a drawing, of a statue. Nothing here moves: stillness is the shot's job
// (shots/segC.ts: pose time frozen).
//   people.ts:  { look: stoneLook(DAGE), acc: () => stoneDage(), finish: stoneRig }
import * as THREE from "three";
import type { Look } from "../../group/kit/toon";
import type { Acc, Rig } from "../../group/kit/rig3d";
import { LIMB_COL } from "../../group/kit/rig3d";
import { chiselled } from "../../group/kit/rigacc/dage";
import { finger } from "../../group/kit/rigacc/finger";
import { headMaterials } from "../../../kit/fx/rim";

/** THE STONE: one pale, weathered limestone, a touch greyer and cooler than the garden's cream ashlar and gravel
 *  (sets/parts/newton.ts NC.stone #dccfb2), so the figure separates from the pedestal it stands on and from the wall.
 *    body   the head and the bare stone          cloth  the tee (a tone under the head, so the chin still reads)
 *    lower  the trousers' band                   limb   arms, hands, the finger, legs, feet
 *    hair   the hair cap (the darker tone)       carve  every cut line of the face (the darkest tone)
 *    lip    the lit lower lip of a cut           shade  the stubble's shade over the jaw, as a see-through carve tone */
export const STONE = {
  body: "#e6dcc6", cloth: "#c9bfa9", lower: "#bcb29d", limb: "#cdc3ad",
  hair: "#7d7564", carve: "#4f483c", lip: "#f6f0e2", shade: "rgba(79,72,60,0.2)",
};
export type Stone = typeof STONE;

/** the look in stone: only colours change (the seed, head, hair cut, width stay: the same figure) */
export const stoneLook = (L: Look, S: Stone = STONE): Look => ({
  ...L, skin: S.body, topCol: S.cloth, botCol: S.lower, shoes: S.limb, shoeSole: S.limb, hairCol: S.hair,
});

/** THE CARVED FACE: put it LAST among the figure's accessories. Everything the face drawing holds by then (the
 *  expression's own lines, a blink, other accessories' lines and shades) keeps its shape and its alpha and takes the
 *  carve tone; a copy in the lip tone lies under it, `relief` u down and to the right: the lit side of each cut. It
 *  takes no slot. (The edge band a face with an under layer repeats past the drawing is that layer's own colour: give
 *  chiselled() the stone's `shade`, as stoneDage does.) */
export const carved = (S: Stone = STONE, relief = 1.3): Acc => ({
  name: "carved", slots: [], key: `${S.carve}|${S.lip}|${relief}`,
  face(f) {
    const g = f.g, c = g.canvas, W = c.width, H = c.height;
    g.setTransform(1, 0, 0, 1, 0, 0);
    // the lit lip: the drawing as it stands, all in the lip tone, on a canvas of its own
    const lit = document.createElement("canvas"); lit.width = W; lit.height = H;
    const lg = lit.getContext("2d");
    if (lg) {
      lg.drawImage(c, 0, 0);
      lg.globalCompositeOperation = "source-atop"; lg.fillStyle = S.lip; lg.fillRect(0, 0, W, H);
    }
    // the cuts: every drawn pixel in the carve tone (its alpha kept)
    g.globalCompositeOperation = "source-atop"; g.fillStyle = S.carve; g.fillRect(0, 0, W, H);
    // the lip under them, shifted toward the lower right (the key comes from the upper left of the drawing)
    if (lg) { g.globalCompositeOperation = "destination-over"; g.globalAlpha = 0.7; g.drawImage(lit, relief * f.u * 0.7, relief * f.u); }
  },
});

/** everything 大哥 wears as a statue: his chiselled lower face (the stubble as a stone shade, no cleft: the finger is
 *  in front of the chin), the raised finger of his left hand (hand 1, as dage()'s default) in the limbs' stone, and
 *  the carved face LAST */
export const stoneDage = (S: Stone = STONE, o: { hand?: 0 | 1 } = {}): Acc[] => [chiselled({ shade: S.shade, cleft: false }), finger({ hand: o.hand ?? 1, col: S.limb }), carved(S)];

type Uni = Record<string, { value: unknown } | undefined>;
/** THE LIMBS IN STONE, on a built figure (call it once, before the figure's first frame: people.ts addPerson does,
 *  through Person.finish): every paint that carries the kit's limb colour (arms, hands, shoulder caps, legs, feet)
 *  takes the stone's `limb`; its glossy stripe (x 1.86: made for near-ink) becomes a matt lit band and the far side
 *  gets a light inner shade, so a limb reads as a round of stone; the head's paint takes the stone's `body` as it is.
 *  The ink hulls are not touched. */
export const stoneRig = (r: Rig, S: Stone = STONE): Rig => {
  const from = new THREE.Color(LIMB_COL), to = new THREE.Color(S.limb);
  // the head: the stone's own tone as given (the cast light bleaches a pale SKIN toward white: stone is not skin), and
  // its inner shade in the stone's own colour, a little deeper, in place of the light's lavender (that is skin's shade)
  for (const m of headMaterials(r.group)) {
    (m as THREE.MeshBasicMaterial).color.set(S.body);
    if (m.userData.nwStone) continue;
    m.userData.nwStone = true;
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, rn) => {
      prev.call(m, sh, rn);
      const u = sh.uniforms as Uni;
      if (u.uSat) u.uSat.value = 0.75;
      if (u.uK) u.uK.value = 0.3;
    };
    m.needsUpdate = true;
  }
  r.group.traverse((o) => {
    const mm = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const mat of Array.isArray(mm) ? mm : mm ? [mm] : []) {
      const m = mat as THREE.MeshBasicMaterial;
      if (m.userData.nwStone || m.side === THREE.BackSide || !m.color || !m.color.equals(from)) continue;
      m.userData.nwStone = true;
      m.color.copy(to);
      const prev = m.onBeforeCompile;
      m.onBeforeCompile = (sh, rn) => {
        prev.call(m, sh, rn);
        const u = sh.uniforms as Uni;
        (u.uStripe?.value as THREE.Vector4 | undefined)?.set(1.1, 1.1, 1.08, (u.uStripe!.value as THREE.Vector4).w);
        if (u.uK) u.uK.value = 0.26;
        (u.uBand?.value as THREE.Vector2 | undefined)?.set(0.15, 0.8);
        if (u.uSat) u.uSat.value = 0.4;
      };
      m.needsUpdate = true;
    }
  });
  return r;
};

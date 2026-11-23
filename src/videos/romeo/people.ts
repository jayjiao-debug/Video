// THE CAST of 采访罗密欧与朱丽叶 (design stage: gate 1). Three figures on the kit's rig3d cast.
//   ROMEO    Montague BLUE. The lovesick dreamer (恋爱脑): soft floppy hair, a slouch beret with a long cream feather,
//            a blue doublet with gold buttons, a short cape. Resting face: the lovesick sigh.
//   JULIET   Capulet RED. The planner (行动派): long dark hair under a gold-and-pearl cap, a crimson gown with a square
//            neck and gold trim. Resting face: a small sure smile under level brows.
//   FRIAR    Friar Laurence, the herbalist: a brown habit with the hood down on his shoulders, a rope belt, a bald crown with a ring of hair,
//            grey brows and a short grey beard. Resting face: weary and warm.
// Each Person is Wanbi's type (a kit Look made once + accessories + scale + resting face); addPerson is Wanbi's plus
// the limbs' colours.
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigFace } from "../group/kit/rig3d";
import { addPerson as addKitPerson, type Person as KitPerson } from "../wanbi/people";
import { limbColours, napeHair } from "../su/acc/figure";
import { legColours, baldHead } from "./acc/figure";
import { robe } from "../../kit/acc/garb";
import { beret, curls, julietCap, tresses, hairRing } from "./acc/head";
import { doublet, peplum, puffs, shortCape, gown, girdleEnd, habit, ropeEnd, cowl } from "./acc/garb";
import { letter, vial, herbBasket } from "./acc/held";
import { maskStick, darkBottleHeld, quillHeld } from "./acc/held2";
import { beard } from "../../kit/acc/facehair";
import { moustache } from "../group/kit/rigacc";
import { lashes, lips, cheeks, shine, jewel, freckles, softBrows, bushyBrows, ageLines, nose, fullBeard, tears } from "./acc/face";

export type Person = KitPerson & { limbs?: { hand?: string; arm?: string }; legs?: { leg?: string; foot?: string }; nape?: boolean; bald?: boolean };
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addKitPerson(rc, p);
  if (p.limbs) limbColours(r, p.limbs);
  if (p.legs) legColours(r, p.legs);
  if (p.nape) napeHair(r, p.look);
  if (p.bald) baldHead(r);
  return r;
}

/** the film's cast colours (never pure black: the ink stays the darkest thing) */
export const COL = {
  blue: "#2f5fb8", blueDeep: "#1f3f86", blueLight: "#8fb2e8",
  red: "#b8252f", redDeep: "#8a1a26", rose: "#e58a94",
  gold: "#e2b03a", cream: "#f3ead6", pearl: "#f7f3ea",
  habit: "#7a5a3c", habitDeep: "#5e4430", rope: "#efe6d0",
  hairRomeo: "#5a3a26", hairJuliet: "#3a2a26", hairFriar: "#a9a6a8",
  skinRomeo: "#f6dcc4", skinJuliet: "#fbe6d6", skinFriar: "#eccaa6",
} as const;

const face = (eyesE: Expr, mouth: Expr, browsE: Expr, marks?: Expr): RigFace => ({ eyes: eyesE, mouth, brows: browsE, marks: marks ?? browsE });

const ROMEO_LOOK: Look = {
  seed: 1597, skin: COL.skinRomeo, top: "tee", topCol: COL.blue, bottom: "chinos", botCol: COL.blueDeep, shoes: "#4a3524", shoeSole: "#2e2118",
  hair: "curly", hairCol: COL.hairRomeo, part: 1, width: 0.9,
};
export const ROMEO: Person = {
  name: "romeo", scale: 1.03, look: ROMEO_LOOK, limbs: { hand: COL.skinRomeo, arm: COL.blue }, legs: { leg: "#c7d3ea", foot: "#7a5232" }, nape: true,
  expr: face("neutral", "smile", "sad") as unknown as Expr,
  acc: (): Acc[] => [doublet({ col: COL.blue }), shortCape({ col: COL.blueDeep, lining: COL.gold }), peplum({ col: COL.blueDeep }), puffs({ col: COL.blue, pane: COL.cream }), beret({ col: COL.blueDeep }), curls(), letter(), softBrows({ weight: 3.4 }), freckles(), cheeks({ k: 0.32 }), shine()],
};
const JULIET_LOOK: Look = {
  seed: 1303, skin: COL.skinJuliet, top: "tee", topCol: COL.red, bottom: "chinos", botCol: COL.redDeep, shoes: "#5a2a2a", shoeSole: "#2e1818",
  hair: "long", hairCol: COL.hairJuliet, part: 1, width: 0.84,
};
export const JULIET: Person = {
  name: "juliet", scale: 0.97, look: JULIET_LOOK, limbs: { hand: COL.skinJuliet, arm: COL.red }, nape: true, expr: face("smile", "smile", "neutral") as unknown as Expr,
  acc: (): Acc[] => [robe({ col: COL.red, band: COL.gold, sash: false }), gown({ col: COL.red }), girdleEnd(), puffs({ col: COL.red, pane: COL.cream, size: 0.046 }), julietCap(), tresses(), vial({ size: 1.4 }), lips(), softBrows({ weight: 2.6 }), lashes(), cheeks({ k: 0.55 }), shine(), jewel()],
};
const FRIAR_LOOK: Look = {
  seed: 1226, skin: COL.skinFriar, top: "tee", topCol: COL.habit, bottom: "chinos", botCol: COL.habitDeep, shoes: "#4a3a2a", shoeSole: "#2e2218",
  hair: "buzz", hairCol: COL.hairFriar, part: 1, width: 1.2,
};
const FRIAR_BEARD = "#b4b1b3";
/** the Friar, with a design variant: his beard (none | goatee | full) */
export const friar = (o: { beard?: "none" | "goatee" | "full" } = {}): Person => {
  const bk = o.beard ?? "full";
  return {
    name: `friar${bk === "full" ? "" : "_" + bk}`, look: FRIAR_LOOK, limbs: { hand: COL.skinFriar, arm: COL.habit }, bald: true, expr: face("neutral", "smile", "sad") as unknown as Expr,
    acc: (): Acc[] => [robe({ col: COL.habit, band: COL.habitDeep, sash: false }), habit({ col: COL.habit }), ropeEnd(), cowl({ col: COL.habitDeep }), hairRing(), herbBasket(),
      ...(bk === "goatee" ? [beard({ kind: "goatee", col: FRIAR_BEARD })] : bk === "full" ? [fullBeard({ col: FRIAR_BEARD }), moustache({ kind: "walrus", col: FRIAR_BEARD })] : []),
      bushyBrows(), ageLines(), nose(), cheeks({ k: 0.3, col: "#e8907c" })],
  };
};
export const FRIAR: Person = friar();

export const ROMEO_BARE: Person = { ...ROMEO, name: "romeoBare", acc: (): Acc[] => ROMEO.acc().filter((a) => a.name !== "beret" && a.name !== "curls").concat([curls({ cowlick: true })]) };
/** Romeo at dawn in the grove (scene 1): the same figure with tears (a swap under a blink) */
export const ROMEO_CRY: Person = { ...ROMEO, name: "romeoCry", acc: (): Acc[] => [...ROMEO.acc(), tears()] };
/** Romeo at the feast: his half mask on a stick (hand 1; his letter stays on hand 0, hidden by the shots) */
export const ROMEO_MASK: Person = { ...ROMEO, name: "romeoMask", acc: (): Acc[] => [...ROMEO.acc(), maskStick()] };
/** Romeo in Mantua and the vault: the apothecary's dark bottle (his right hand; his letter is left out: it is hidden in
 *  both scenes, and the bottle takes its hand) */
export const ROMEO_BOTTLE: Person = { ...ROMEO, name: "romeoBottle", acc: (): Acc[] => [...ROMEO.acc().filter((a) => a.name !== "letter"), darkBottleHeld({ hand: 0, size: 1.3 })] };
/** the Friar writing his letter: the quill (hand 0; the herb basket stays on hand 1) */
export const FRIAR_QUILL: Person = { ...FRIAR, name: "friarQuill", acc: (): Acc[] => [...FRIAR.acc(), quillHeld()] };
/** the vial is drawn 1.4x (taste review of v1: at 7.8 cm it was lost in F02-F04); the dark bottle 1.3x (lost against the
 *  vault's brown stone). The Friar on Tuesday holding the vial out (F02-F04), and holding his sealed letter (F07-F08): hand 0 each (a figure
 *  takes one thing per hand, so each is its own figure; the shot switches between them at the hand-over) */
export const FRIAR_VIAL: Person = { ...FRIAR, name: "friarVial", acc: (): Acc[] => [...FRIAR.acc(), vial({ hand: 0, size: 1.4 })] };
export const FRIAR_LETTER: Person = { ...FRIAR, name: "friarLetter", acc: (): Acc[] => [...FRIAR.acc(), letter({ hand: 0 })] };
/** the young friar who takes the letter (F08): no beard, a little smaller, the letter in his right hand */
export const YOUNG_FRIAR: Person = {
  ...friar({ beard: "none" }), name: "youngFriar", scale: 0.93,
  // young: a brown ring of hair lying close (the old Friar's grey puffs read as a grey visor on him from the side), soft
  // brown brows, no age lines
  acc: (): Acc[] => [robe({ col: COL.habit, band: COL.habitDeep, sash: false }), habit({ col: COL.habit }), ropeEnd(), cowl({ col: COL.habitDeep }),
    hairRing({ col: "#6b4a2e", puff: 0.15 }), softBrows({ col: "#5a3c24" }), nose(), cheeks({ k: 0.3, col: "#e8907c" }), letter({ hand: 0 })],
};
export const PEOPLE = { friarVial: FRIAR_VIAL, friarLetter: FRIAR_LETTER, youngFriar: YOUNG_FRIAR, romeoMask: ROMEO_MASK, romeoBottle: ROMEO_BOTTLE, friarQuill: FRIAR_QUILL, romeoBare: ROMEO_BARE, romeoCry: ROMEO_CRY, romeo: ROMEO, juliet: JULIET, friar: FRIAR, friarGoatee: friar({ beard: "goatee" }), friarBare: friar({ beard: "none" }) } satisfies Record<string, Person>;
export type PersonKey = keyof typeof PEOPLE;
/** FACES by name (preview: expr "<name>"). Romeo: puppy (his resting face), dreamy, wail, blank, hollow.
 *  Juliet: sure (her resting face), bossy, swoon, caught, brave. The Friar: weary (resting), dry, worried, warn. */
export const FACES: Record<string, Expr | RigFace> = {
  puppy: face("neutral", "smile", "sad"), dreamy: face("relief", "smile", "sad"), wail: face("wince", "shock", "sad"), blank: face("smile", "neutral", "shock", "neutral"), hollow: face("neutral", "sad", "sad"),
  sure: face("smile", "smile", "neutral"), bossy: { eyes: "smile", mouth: "smile", brows: "neutral", browsTo: "stern", k: 0.5, marks: "neutral" }, swoon: face("relief", "relief", "sad", "neutral"), caught: face("smile", "nervous", "shock", "nervous"), brave: face("neutral", "smile", "sad", "neutral"),
  // taste review of v1 (23 Nov): faces that fought their beats. wail had the laugh mouth (it read 笑哭) and caught had the
  // ring eyes (on Juliet they read as round spectacles); the bier, the waking and her sincere line get their own faces
  tender: face("sad", "smile", "sad"), grief: face("sad", "sad", "sad"), waking: face("neutral", "sigh", "sad"),
  puzzled: face("smile", "whistle", "shock", "neutral"), soft: face("smile", "smile", "sad", "neutral"),
  weary: face("neutral", "smile", "sad"), dry: face("deadpan", "smug", "smug", "neutral"), worried: face("neutral", "nervous", "sad", "neutral"), warn: face("neutral", "neutral", "stern", "neutral"),
};
/** test looks: one per kit hair kind (preview: who "hair:curly") */
export const hairTest = (hair: Look["hair"], seed = 1597): Person => ({ name: `hair_${hair}_${seed}`, look: { ...ROMEO_LOOK, seed, hair }, acc: () => [] });

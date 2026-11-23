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
import { beret, beretOn, curls, julietCap, tresses, hairRing } from "./acc/head";
import { herEyes, loveEyes } from "./acc/eyes";
import { doublet, peplum, puffs, shortCape, gown, girdleEnd, habit, ropeEnd, cowl } from "./acc/garb";
import { letter, vial, herbBasket } from "./acc/held";
import { maskStick, darkBottleHeld, quillHeld } from "./acc/held2";
import { beard } from "../../kit/acc/facehair";
import { moustache } from "../group/kit/rigacc";
import { lashes, lips, cheeks, shine, jewel, freckles, softBrows, bushyBrows, ageLines, nose, fullBeard, tears, mole, liner, domino } from "./acc/face";
import { hairShell, drills, tiara, comma, sideLocks, type ShellO } from "./acc/hair";
import { backFall, backBow, napeLocks } from "./acc/backhair";

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
  hairRomeo: "#6b4126", hairJuliet: "#e6bb52", hairFriar: "#a9a6a8",
  // v3 (23 Nov): her blonde (a warm honey gold: the rig's lights bleach a pale one to white) and its strands; his chestnut
  blondeLight: "#fae39b", blondeDeep: "#b5822c", blondeRing: "#fff3c8", chestLight: "#a8703f", chestDeep: "#43261a", chestRing: "#c08a56",
  // (v2's dark hair, kept for the before/after sheet)
  hairRomeoV2: "#5a3a26", hairJulietV2: "#3a2a26",
  skinRomeo: "#f6dcc4", skinJuliet: "#fbe6d6", skinFriar: "#eccaa6",
} as const;

const face = (eyesE: Expr, mouth: Expr, browsE: Expr, marks?: Expr): RigFace => ({ eyes: eyesE, mouth, brows: browsE, marks: marks ?? browsE });

const ROMEO_LOOK: Look = {
  seed: 1597, skin: COL.skinRomeo, top: "tee", topCol: COL.blue, bottom: "chinos", botCol: COL.blueDeep, shoes: "#4a3524", shoeSole: "#2e2118",
  hair: "curly", hairCol: COL.hairRomeo, part: 1, width: 0.9,
};
/** v3 (23 Nov, "romeo more charming, the hair matters a lot"): sculpted chestnut hair with volume, parted on his left
 *  and swept across into one long lock on his right that ends in a curl over his brow (逗号刘海); longer at the nape.
 *  The beret sits back on it, tipped to his left, so the fringe shows. A beauty mark (泪痣) under his left eye. */
export const ROMEO_HAIR: ShellO = {
  front: 0.9, temple: 0.6, side: 0.38, back: -0.8,
  locks: [{ a: -28, w: 42, len: 0.46, lean: -0.8 }, { a: 10, w: 16, len: 0.18, lean: -0.6 }, { a: -64, w: 14, len: 0.18, lean: -0.5 }, { a: 62, w: 13, len: 0.14, lean: 0.5 },
    { a: 148, w: 14, len: 0.2, lean: 0.3 }, { a: 172, w: 13, len: 0.24 }, { a: -160, w: 14, len: 0.2, lean: -0.3 }, { a: -134, w: 13, len: 0.16, lean: -0.4 }],
  thF: 0.08, thS: 0.12, thB: 0.12, top: 1.2, featherF: 8, relief: 0.04, ridges: { n: 15, amp: 0.04, from: 35 }, lift: [{ a: 12, el: 50, w: 34, h: 0.14 }, { a: -150, el: 30, w: 50, h: 0.05 }],
  col: COL.hairRomeo, light: COL.chestLight, deep: COL.chestDeep, ring: COL.chestRing, part: 38, sideTo: 100, backFrom: 128,
  // v3b: the shine ring lower, across the back of his head under the beret's band (at 56 deg it showed only as a pale
  // zigzag between the band and the fringe)
  ringEl: 14, ringA: 0.5, ringN: 20,
};
/** (v3's hair as on the first sheet, for the before/after sheet: the ring round the crown) */
const ROMEO_HAIR_V3: ShellO = { ...ROMEO_HAIR, ringEl: undefined, ringA: undefined, ringN: undefined };
const ROMEO_BERET = (): Acc => beretOn({ on: ROMEO_HAIR, col: COL.blueDeep, tilt: [12, -16], foot: 38, top: 48, size: 1 });
const romeoHead = (hair: ShellO = ROMEO_HAIR): Acc[] => [hairShell(hair), comma({ col: COL.hairRomeo }), sideLocks({ col: COL.hairRomeo, locks: [{ a: -84, y0: 0.5, y1: -0.36, wide: 0.21, r: 1.08, curl: -0.08, peak: 0.2 }, { a: 84, y0: 0.5, y1: -0.3, wide: 0.21, r: 1.08, curl: -0.08, peak: 0.2 }, { a: -104, y0: 0.42, y1: -0.2, wide: 0.19, r: 1.11, curl: -0.12 }, { a: 104, y0: 0.42, y1: -0.16, wide: 0.19, r: 1.11, curl: -0.12 }] })];
export const ROMEO: Person = {
  name: "romeo", scale: 1.03, look: ROMEO_LOOK, limbs: { hand: COL.skinRomeo, arm: COL.blue }, legs: { leg: "#c7d3ea", foot: "#7a5232" }, nape: true,
  expr: face("neutral", "smile", "sad") as unknown as Expr,
  // v3b (the owner's pick, 23 Nov: "romeo v3 with hat but no clipping of hairs"): the beret in every scene, FITTED to
  // the sculpted hair (head.ts beretOn: its band lies on the hair all round, so no hair comes through it), sitting back
  // and tipped to his left so the fringe shows; his own eyes are the rig's, his love eyes are drawn (eyes.ts loveEyes)
  // v3b (the owner: "the hair from back needs to be appealing as well"): layered pointed locks at the back of his head
  // that flick out at the nape (backhair.ts napeLocks), in place of v2's nape curls (under the sculpted hair they showed
  // only as two flaps behind the ears)
  acc: (): Acc[] => [doublet({ col: COL.blue }), shortCape({ col: COL.blueDeep, lining: COL.gold }), peplum({ col: COL.blueDeep }), puffs({ col: COL.blue, pane: COL.cream }), ...romeoHead(), ROMEO_BERET(), napeLocks({ on: ROMEO_HAIR, col: COL.hairRomeo }), letter(), softBrows({ weight: 3.4 }), mole(), loveEyes(), cheeks({ k: 0.32 }), shine()],
};
/** (the sheet's name for him in the beret: the film's Romeo) */
export const ROMEO_HAT: Person = { ...ROMEO, name: "romeoHat" };
/** v3 as sent on the first sheet: the round beret (its band sank into the sculpted hair: the hair came through it) */
export const ROMEO_HAT_V3: Person = {
  ...ROMEO, name: "romeoHatV3",
  acc: (): Acc[] => [doublet({ col: COL.blue }), shortCape({ col: COL.blueDeep, lining: COL.gold }), peplum({ col: COL.blueDeep }), puffs({ col: COL.blue, pane: COL.cream }), ...romeoHead(ROMEO_HAIR_V3), beret({ col: COL.blueDeep, r0: 0.9, base: 0.74, tilt: [12, -16], size: 0.95 }), curls(), letter(), softBrows({ weight: 3.4 }), mole(), cheeks({ k: 0.32 }), shine()],
};
/** Romeo as v2 drew him (the before/after sheet only) */
export const ROMEO_V2: Person = {
  ...ROMEO, name: "romeoV2", look: { ...ROMEO_LOOK, hairCol: COL.hairRomeoV2 },
  acc: (): Acc[] => [doublet({ col: COL.blue }), shortCape({ col: COL.blueDeep, lining: COL.gold }), peplum({ col: COL.blueDeep }), puffs({ col: COL.blue, pane: COL.cream }), beret({ col: COL.blueDeep }), curls(), letter(), softBrows({ weight: 3.4 }), freckles(), cheeks({ k: 0.32 }), shine()],
};
const JULIET_LOOK: Look = {
  seed: 1303, skin: COL.skinJuliet, top: "tee", topCol: COL.red, bottom: "chinos", botCol: COL.redDeep, shoes: "#5a2a2a", shoeSole: "#2e1818",
  hair: "long", hairCol: COL.hairJuliet, part: 1, width: 0.84,
};
/** v3 (23 Nov, "make juliet blonde and 大小姐 looking"): a glossy honey-blonde crown with volume and a fringe of pointed
 *  locks, a shine ring round it, parted on her left; twin drill curls (縦ロール) from behind her ears to her waist, tied
 *  with Capulet-red bows; a low gold tiara with a red stone and pearls (it replaces the net cap); lined eyes with a wing */
export const JULIET_HAIR: ShellO = {
  front: 0.8, temple: 0.52, side: 0.38, back: -0.86,
  locks: [{ a: -40, w: 19, len: 0.31, lean: -0.6 }, { a: -17, w: 18, len: 0.31, lean: -0.5 }, { a: 5, w: 17, len: 0.25, lean: -0.4 }, { a: 26, w: 14, len: 0.14, lean: -0.3 }],
  thF: 0.085, thS: 0.15, thB: 0.15, top: 1.27, featherF: 8, lift: [{ a: 0, el: 62, w: 40, h: 0.05 }], relief: 0.03, ridges: { n: 22, amp: 0.025 }, hat: 56,
  col: COL.hairJuliet, light: COL.blondeLight, deep: COL.blondeDeep, ring: COL.blondeRing, part: 40, sideTo: 100, backFrom: 128,
};
export const JULIET: Person = {
  // (hair "bob", not v2's "long": the rig hangs a long fall behind the body for "long" whatever the accessories say, and
  // under the shell its top showed as two lobes at the nape)
  name: "juliet", scale: 0.97, look: { ...JULIET_LOOK, hair: "bob" }, limbs: { hand: COL.skinJuliet, arm: COL.red }, nape: true, expr: face("smile", "smile", "neutral") as unknown as Expr,
  acc: (): Acc[] => [robe({ col: COL.red, band: COL.gold, sash: false }), gown({ col: COL.red }), girdleEnd(), puffs({ col: COL.red, pane: COL.cream, size: 0.046 }),
    hairShell(JULIET_HAIR), sideLocks({ col: COL.hairJuliet, locks: [{ a: -78, y0: 0.52, y1: -0.42, wide: 0.24, r: 1.07, curl: 0.05, peak: 0.2 }, { a: 78, y0: 0.52, y1: -0.36, wide: 0.24, r: 1.07, curl: 0.05, peak: 0.2 }] }), drills({ col: COL.hairJuliet, light: COL.blondeLight, deep: COL.blondeDeep }), tiara({ on: JULIET_HAIR, lean: 24 }),
    // v3b (the owner, 23 Nov: "v3 juliet her eyes are weird, try learning from Ra's daughter"): her eyes are drawn the
    // way 拉的女儿's were (eyes.ts herEyes: the rig's eye wiped, one lid line with her liner's wing, a round ink pupil with
    // its lights), in place of v3's three loose strokes over the rig's dot (lashes, liner, shine)
    vial({ size: 1.4 }), lips(), softBrows({ weight: 2.6 }), herEyes(), cheeks({ k: 0.5 }),
    // v3b (the owner: "the hair from back needs to be appealing as well"): the hair half up, tied with a big red bow at
    // the back of her head, and the rest down her back to the waist in pointed locks (backhair.ts; the fall is on the
    // body, as 拉的女儿's was, so a turn of her head does not swing it through her back)
    backBow({ on: JULIET_HAIR }), backFall({ col: COL.hairJuliet, light: COL.blondeLight, deep: COL.blondeDeep, ring: COL.blondeRing })],
};
/** Juliet as the first v3 sheet drew her eyes (the before/after sheet only) */
export const JULIET_V3: Person = { ...JULIET, name: "julietV3", acc: (): Acc[] => [...JULIET.acc().filter((a) => !["herEyes", "cheeks", "backBow", "backFall"].includes(a.name)), lashes({ len: 1.3 }), liner(), cheeks({ k: 0.5 }), shine()] };
/** Juliet as v2 drew her (the before/after sheet only) */
export const JULIET_V2: Person = {
  ...JULIET, name: "julietV2", look: { ...JULIET_LOOK, hairCol: COL.hairJulietV2 },
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

/** Romeo bare-headed (v3: the curls at the nape stay; v2 added a cowlick on the bare crown, the sculpted hair has its own crown) */
export const ROMEO_BARE: Person = { ...ROMEO, name: "romeoBare", acc: (): Acc[] => ROMEO.acc().filter((a) => a.name !== "beret") };
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
/** THE FEAST'S DANCERS (scene B, v3: "less moving around"; the script always had dancers in the hall): masked Capulet
 *  guests in muted colours (the leads keep the strongest blue and red), a gold domino each, nothing in their hands */
const guest = (name: string, o: { lady: boolean; col: string; deep: string; hair: Look["hair"]; hairCol: string; seed: number }): Person => ({
  name, scale: o.lady ? 0.95 : 1.0,
  look: { seed: o.seed, skin: o.lady ? COL.skinJuliet : COL.skinRomeo, top: "tee", topCol: o.col, bottom: "chinos", botCol: o.deep, shoes: "#3a2a24", shoeSole: "#22181a", hair: o.hair, hairCol: o.hairCol, part: 1, width: o.lady ? 0.84 : 0.9 },
  limbs: { hand: o.lady ? COL.skinJuliet : COL.skinRomeo, arm: o.col }, ...(o.lady ? {} : { legs: { leg: "#d9cfbc", foot: "#4a3524" } }),
  expr: face("smile", "smile", "neutral") as unknown as Expr,
  acc: (): Acc[] => o.lady
    ? [robe({ col: o.col, band: COL.gold, sash: false }), gown({ col: o.col }), puffs({ col: o.col, pane: COL.cream, size: 0.044 }), domino(), lips(), lashes(), cheeks({ k: 0.4 }), shine()]
    : [doublet({ col: o.col }), peplum({ col: o.deep }), puffs({ col: o.col, pane: COL.cream }), domino(), softBrows({ weight: 3 }), cheeks({ k: 0.25 }), shine()],
});
export const GUEST_LADY_A = guest("guestLadyA", { lady: true, col: "#4f7d5c", deep: "#365a41", hair: "bun", hairCol: "#5a3c28", seed: 2101 });
export const GUEST_MAN_A = guest("guestManA", { lady: false, col: "#7a3446", deep: "#57222f", hair: "short", hairCol: "#2e2420", seed: 2113 });
export const GUEST_LADY_B = guest("guestLadyB", { lady: true, col: "#76608f", deep: "#53426a", hair: "bun", hairCol: "#a7743e", seed: 2129 });
export const GUEST_MAN_B = guest("guestManB", { lady: false, col: "#6c5d35", deep: "#4c4124", hair: "side", hairCol: "#3b2a1e", seed: 2137 });

export const PEOPLE = { romeoV2: ROMEO_V2, julietV2: JULIET_V2, friarVial: FRIAR_VIAL, friarLetter: FRIAR_LETTER, youngFriar: YOUNG_FRIAR, romeoMask: ROMEO_MASK, romeoBottle: ROMEO_BOTTLE, friarQuill: FRIAR_QUILL, romeoBare: ROMEO_BARE, romeoHat: ROMEO_HAT, romeoHatV3: ROMEO_HAT_V3, julietV3: JULIET_V3, romeoCry: ROMEO_CRY, romeo: ROMEO, juliet: JULIET, friar: FRIAR, friarGoatee: friar({ beard: "goatee" }), friarBare: friar({ beard: "none" }), guestLadyA: GUEST_LADY_A, guestManA: GUEST_MAN_A, guestLadyB: GUEST_LADY_B, guestManB: GUEST_MAN_B } satisfies Record<string, Person>;
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
  // v3b (the owner, 23 Nov: "give them expressive emotion showing they are in love"): the love eyes (eyes.ts) by the
  // rig eye expressions no face here used before. smitten: big pupils with a heart-shaped light and a flush; hearts:
  // HEART EYES, the film's one signature emote (once or twice)
  smitten: face("lick", "smile", "relief", "smile"), smittenOpen: face("lick", "relief_open", "relief", "smile"), hearts: face("speechless", "relief_open", "relief", "relief_open"),
  // (hers: the small smile with the tip of the tongue, not his big grin: she is the 大小姐)
  heartsSoft: face("speechless", "relief", "relief", "relief"),
  weary: face("neutral", "smile", "sad"), dry: face("deadpan", "smug", "smug", "neutral"), worried: face("neutral", "nervous", "sad", "neutral"), warn: face("neutral", "neutral", "stern", "neutral"),
};
/** test looks: one per kit hair kind (preview: who "hair:curly") */
export const hairTest = (hair: Look["hair"], seed = 1597): Person => ({ name: `hair_${hair}_${seed}`, look: { ...ROMEO_LOOK, seed, hair }, acc: () => [] });

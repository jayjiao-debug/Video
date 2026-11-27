// THE CAST of 采访月老的一天. Figures on the kit's rig3d cast (group/kit, never edited).
//   月老     the lead: a small, round, quick old god. Snow-white long beard, walrus moustache and long drooping brows,
//            rosy cheeks, a white topknot tied in red with a gold pin, a 朱红 robe with a gold band and sash (the
//            strongest colour in every frame), a red spool swinging at his belt. Resting face: a worried smile.
//   林小满   30, programmer: grey-blue hoodie, bob, square glasses, a lanyard; resting face deadpan.
//   小满妈   plum cardigan, a bun, kneeling in the temple (seen only through the burner's smoke).
//   相亲男   navy jacket, side parting, round glasses, a checklist.
//   骑手     the delivery rider: yellow top, a yellow helmet, a paper bag.
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigFace } from "../group/kit/rig3d";
import { classmate } from "../group/kit/cast";
import { addPerson as addSuPerson, type Person as SuPerson } from "../su/people";
import { legColours } from "../romeo/acc/figure";
import { bushyBrows, softBrows, ageLines, cheeks, nose, shine, lashes } from "../romeo/acc/face";
import { beard } from "../../kit/acc/facehair";
import { robe, pendant } from "../../kit/acc/garb";
import { topknot } from "../../kit/acc/headwear";
import { moustache, glasses, phone, finger, pen } from "../group/kit/rigacc";
import { hardHat } from "../group/kit/rigacc/hardhat";

export type Person = SuPerson & { legs?: { leg?: string; foot?: string } };
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addSuPerson(rc, p);
  if (p.legs) legColours(r, p.legs);
  return r;
}
const face = (eyes: Expr, mouth: Expr, brows: Expr, marks?: Expr): RigFace => ({ eyes, mouth, brows, marks: marks ?? brows });

/** the film's colours: 朱红 is his alone */
export const COL = {
  red: "#d23a2a", redBand: "#f0c04a", redDeep: "#a82a20", gold: "#f0c04a", white: "#dfe5ee", whiteLo: "#c4ccd8",
  hoodie: "#7d8fa6", jeans: "#3d4a66", plum: "#8a5a7a", navy: "#34425e", rider: "#f2c21a", riderLo: "#3a3d46",
} as const;
const SKIN = { old: "#f2c9a4", fair: "#f6d9bd", warm: "#f0cfae", tan: "#e3b58d" } as const;

// ------------------------------------------------------------------------------------------------------- 月老
const YL_LOOK: Look = {
  seed: classmate(64).seed, skin: SKIN.old, top: "tee", topCol: COL.red, bottom: "chinos", botCol: COL.redDeep, shoes: "#3a2a26", shoeSole: "#221815",
  hair: "short", hairCol: COL.white, part: 1, width: 1.26, head: { nTop: 2.1, nBot: 2.0, egg: 0.12 },
};
/** his beard: the kit's long 3D beard hanging over the chest, but drawn on the face as a chin tuft only (no sideburns:
 *  with white hair the kit's sideburns framed his face like a hood) */
const longBeard = (len = 2.7, wide = 1.15): Acc => {
  const Lg = beard({ kind: "long", col: COL.white, len, wide }), G = beard({ kind: "goatee", col: COL.white });
  return { ...Lg, faceUnder: (G as never as { faceUnder: never }).faceUnder, sideburn: false, key: Lg.key + "|goat" } as never as Acc;
};
const ylAcc = (extra: Acc[] = []): Acc[] => [
  robe({ col: COL.red, band: COL.redBand, sash: COL.gold, inner: "#fff6e4" }),
  longBeard(), moustache({ kind: "walrus", col: COL.white }),
  bushyBrows({ col: COL.white, weight: 4.4, droop: 1.5 }), cheeks({ k: 0.6, col: "#f08a7a" }), nose({ tint: "#f0a090" }), ageLines({ k: 0.5 }), shine(),
  topknot({ band: COL.red, pin: COL.gold, size: 1.15, pinLen: 0.3, guan: COL.red }),
  pendant({ col: COL.red, cord: COL.gold, side: 1 }),
  finger({ hand: 1, col: SKIN.old }), pen({ hand: 0, col: "#b8935a" }),
  ...extra,
];
export const YUELAO: Person = { name: "yuelao", scale: 0.98, expr: face("smile", "nervous", "sad") as unknown as Expr, look: YL_LOOK, acc: () => ylAcc(), limbs: { hand: SKIN.old, arm: COL.red }, nape: false };

// ------------------------------------------------------------------------------------------------------- the mortals
const modern = (seed: number, o: Partial<Look> & Pick<Look, "top" | "topCol" | "hair">): Look => ({
  seed, skin: SKIN.fair, bottom: "jeans", botCol: COL.jeans, shoes: "#e8e4dc", shoeSole: "#b9b4aa", hairCol: "#2a2428", part: 1, width: 0.92, ...o,
});
export const XIAOMAN: Person = {
  name: "xiaoman", scale: 0.97, expr: face("deadpan", "neutral", "neutral") as unknown as Expr,
  look: modern(3107, { top: "hoodie", topCol: COL.hoodie, trim: "#e9edf2", hair: "bob", width: 0.86, lanyard: "#2f6fd0" }),
  acc: () => [glasses({ kind: "square", col: "#2a2c34" }), softBrows({ weight: 3.0, col: "#2a2428" }), lashes({}), phone({ col: "#e0567a", hand: 1 })],
  limbs: { hand: SKIN.fair, arm: COL.hoodie }, legs: { leg: COL.jeans, foot: "#e8e4dc" },
};
export const MA: Person = {
  name: "ma", scale: 0.95, expr: face("neutral", "sad", "sad") as unknown as Expr,
  look: modern(3203, { top: "cardigan", topCol: COL.plum, inner: "#efe2d2", hair: "bun", hairCol: "#4a4448", bottom: "skirt", botCol: "#4a3d4a", width: 1.04, skin: SKIN.warm, shoes: "#3a3034" }),
  acc: () => [softBrows({ weight: 3.2, col: "#4a4448" }), ageLines({ k: 0.4 }), cheeks({ k: 0.3 })],
  limbs: { hand: SKIN.warm, arm: COL.plum }, legs: { leg: "#5a4d5a", foot: "#3a3034" },
};
/** the mother as the vision in the incense smoke (scene D): the same woman, 0.42 of her size */
export const MA_MINI: Person = { ...MA, name: "ma_mini", scale: 0.42 };
export const XIANGQIN: Person = {
  name: "xiangqin", scale: 1.0, expr: face("neutral", "smile", "neutral") as unknown as Expr,
  look: modern(3301, { top: "jacket", topCol: COL.navy, inner: "#f2f2f0", hair: "side", bottom: "chinos", botCol: "#7a7466", width: 0.98, shoes: "#3a2c24" }),
  acc: () => [glasses({ kind: "round", col: "#2a2c34" }), softBrows({ weight: 3.4, col: "#2a2428" }), phone({ col: "#2f4a7a", hand: 0 })],
  limbs: { hand: SKIN.fair, arm: COL.navy }, legs: { leg: "#7a7466", foot: "#3a2c24" },
};
export const RIDER: Person = {
  name: "rider", scale: 1.0, expr: face("smile", "smile", "neutral") as unknown as Expr,
  look: modern(3407, { top: "run", topCol: COL.rider, trim: COL.riderLo, hair: "short", bottom: "chinos", botCol: COL.riderLo, width: 0.96, skin: SKIN.fair, shoes: "#2e3038" }),
  acc: () => [hardHat({ col: COL.rider }), softBrows({ weight: 3.2, col: "#2a2428" }), cheeks({ k: 0.35 })],
  limbs: { hand: SKIN.tan, arm: COL.rider }, legs: { leg: COL.riderLo, foot: "#2e3038" },
};

export const PEOPLE = { yuelao: YUELAO, xiaoman: XIAOMAN, ma: MA, xiangqin: XIANGQIN, rider: RIDER } as Record<string, Person>;
/** FACES by name */
export const FACES: Record<string, Expr | RigFace> = {
  // 月老
  worry: face("smile", "nervous", "sad"), fawn: face("happy", "grin", "sad", "neutral"), proud: face("happy", "grin", "neutral"), panic: face("shock", "shock", "sad", "neutral"),
  grumble: face("deadpan", "huff", "stern", "neutral"), small: face("nervous", "nervous", "sad", "neutral"), strain: face("wince", "wince", "stern", "neutral"),
  suspicious: face("focus", "neutral", "focus", "neutral"), sly: face("smug", "smug", "neutral"), sag: face("sad", "sigh", "sad", "neutral"), quiet: face("sad", "neutral", "sad", "neutral"),
  wry: face("sad", "smile", "sad", "neutral"), wonder: face("smile", "whistle", "sad", "neutral"), joy: face("happy", "laugh", "neutral"), warm: face("smile", "smile", "neutral"),
  cough: face("smile_closed", "hush", "neutral"), shout: face("stern", "shock", "stern", "neutral"), hush: face("smile", "hush", "neutral"),
  // a thread in his teeth: busy / caught / hissing / grave
  bite: face("focus", "wince", "stern", "neutral"), caught: face("shock", "wince", "sad", "neutral"), hiss: face("stern", "wince", "stern", "neutral"), grave: face("deadpan", "wince", "stern", "neutral"),
  eager: face("happy", "smile", "sad", "neutral"), hope: face("smile", "smile", "sad", "neutral"), dread: face("shock", "nervous", "sad", "nervous"), sheepish: face("smile_closed", "nervous", "sad", "nervous"),
  // at her lens: wild with it / an awkward cough / coaxing her, eyes on the lens
  thrill: face("smile", "laugh", "neutral"), oh: face("smile", "whistle", "neutral", "neutral"), ahem: face("wince", "nervous", "sad", "nervous"), coax: face("smile", "smile", "sad", "nervous"),
  intent: face("smile", "whistle", "focus", "neutral"), resolve: face("stern", "grin", "stern", "neutral"), peer: face("focus", "whistle", "focus", "neutral"), tender: face("smile_closed", "smile", "sad", "neutral"), lost: face("sad", "nervous", "sad", "neutral"),
  // the mortals
  flat: face("deadpan", "neutral", "neutral"), tired: face("deadpan", "sigh", "sad", "neutral"), look: face("smile", "neutral", "neutral"), smile: face("smile", "smile", "neutral"),
  beam: face("happy", "grin", "neutral"), plead: face("sad", "shock", "sad", "neutral"), polite: face("smile", "smile", "neutral"), shy: face("smile", "nervous", "sad", "relief"),
  calm: face("neutral", "neutral", "neutral"),
};

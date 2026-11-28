// THE CAST of 采访月老的一天. Figures on the kit's rig3d cast (group/kit, never edited).
//   月老     the lead (v6, 28 Nov 2026: redesigned after the owner's notes on the v5 cut; his parts are acc/yl.ts, which
//            says why each is drawn as it is and in what order): a small, round, kindly old god. BALD (a clean peach
//            dome) with a small white topknot tied in red; long drooping white 寿眉; a
//            white moustache with a cloud curl at each end and a white beard that hangs over his chest in three cloud
//            tiers; the series' ink eyes (no white ring eyes); a vermilion robe with WIDE SLEEVES, gold cloud borders,
//            a deep red sash and a crescent moon of pale jade with a red tassel at his hip. Round skin hands. 朱红 is
//            the strongest colour in every frame. Resting face: a kind smile, half-shut eyes.
//            YUELAO_B (option B, 天庭书吏): the same face under a red official's cap, a short beard, a badge on the chest.
//            YUELAO_C (option C, 云游仙人): long white hair down his back, a tall topknot with a gold pin, a cloud collar,
//            a staff with a gourd and a skein of red thread.
//   林小满   30, programmer: grey-blue hoodie, bob, square glasses, a lanyard; resting face deadpan.
//   小满妈   plum cardigan, a bun, kneeling in the temple (seen only through the burner's smoke).
//   相亲男   navy jacket, side parting, round glasses, a checklist.
//   骑手     the delivery rider: yellow top, a yellow helmet, a paper bag.
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigFace } from "../group/kit/rig3d";
import { classmate } from "../group/kit/cast";
import { addPerson as addSuPerson, type Person as SuPerson } from "../su/people";
import { futou } from "../su/acc/hats";
import { legColours, baldHead, freeDepth } from "../romeo/acc/figure";
import { softBrows, ageLines, cheeks, nose, lashes } from "../romeo/acc/face";
import { beard } from "../../kit/acc/facehair";
import { robe, pendant } from "../../kit/acc/garb";
import { topknot } from "../../kit/acc/headwear";
import { glasses, phone, pen } from "../group/kit/rigacc";
import { hardHat } from "../group/kit/rigacc/hardhat";
import { YL, hemmed, ylEyes, longBrows, cloudMoustache, cloudBeard, forehead, wideSleeves, robeTrim, moonToken, officialBadge, cloudCollar, staff } from "./acc/yl";

/** a Person (su's) + the legs' colours + bald (acc/yl.ts: no hair painted on the head ball at all; his hair is 3D) */
export type Person = SuPerson & { legs?: { leg?: string; foot?: string }; bald?: boolean };
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addSuPerson(rc, p);
  if (p.legs) legColours(r, p.legs);
  if (p.bald) baldHead(r);
  // (parts marked for their true depth, acc/yl.ts cloudBeard: a hand in front of the beard is drawn in front of it)
  freeDepth(r);
  return r;
}
const face = (eyes: Expr, mouth: Expr, brows: Expr, marks?: Expr): RigFace => ({ eyes, mouth, brows, marks: marks ?? brows });

/** the film's colours: 朱红 is his alone */
export const COL = {
  red: YL.red, redBand: YL.gold, redDeep: YL.redDeep, gold: YL.gold, white: YL.white, whiteLo: YL.whiteLo,
  hoodie: "#7d8fa6", jeans: "#3d4a66", plum: "#8a5a7a", navy: "#34425e", rider: "#f2c21a", riderLo: "#3a3d46",
} as const;
const SKIN = { old: YL.skin, fair: "#f6d9bd", warm: "#f0cfae", tan: "#e3b58d" } as const;

// ------------------------------------------------------------------------------------------------------- 月老
const YL_LOOK: Look = {
  seed: classmate(64).seed, skin: SKIN.old, top: "tee", topCol: COL.red, bottom: "chinos", botCol: COL.redDeep, shoes: "#3a2a26", shoeSole: "#221815",
  hair: "buzz", hairCol: COL.white, part: 1, width: 1.26, head: { nTop: 2.1, nBot: 2.0, egg: 0.12 },
};
/** his face, in its drawing order (acc/yl.ts): under the mouth the nose and the beard; over it the eyes, the moustache,
 *  the brows, the forehead; the blush goes under all of them (destination-over) */
const ylFace = (o: { beard?: Acc; moustache?: Acc | false; forehead?: Acc | false } = {}): Acc[] => [
  nose({ tint: "#eea08c", y: 6.0 }), o.beard ?? cloudBeard(),
  ylEyes(), ...(o.moustache === false ? [] : [o.moustache ?? cloudMoustache()]), longBrows({ col: COL.white }), ...(o.forehead === false ? [] : [o.forehead ?? forehead()]), cheeks({ k: 0.55, col: "#ef8a7a", y: 11 }),
];
/** his robe: the kit robe in vermilion with a gold band, the deep red sash, the cream under-robe; the trim, the sleeves,
 *  the crescent token */
const ylRobe = (o: { sleeves?: boolean; token?: boolean } = {}): Acc[] => [
  hemmed(robe({ col: COL.red, band: COL.gold, sash: COL.redDeep, inner: YL.cream })), robeTrim(),
  ...(o.sleeves === false ? [] : [wideSleeves()]),
  ...(o.token === false ? [] : [pendant({ col: YL.jade, cord: COL.red, side: 1, az: 30 }), moonToken()]),
];
const ylAcc = (extra: Acc[] = []): Acc[] => [
  ...ylRobe(), ...ylFace(),
  // (no ring of hair at the back: from behind it read as a row of teeth, from the side as blocks; a clean dome)
  topknot({ band: COL.red, pin: false, size: 0.95, back: 22 }),
  pen({ hand: 0, col: "#b8935a" }),
  ...extra,
];
/** 月老 (option A, 月下仙翁): see the head of this file */
export const YUELAO: Person = { name: "yuelao", scale: 0.98, expr: face("smile", "smile", "neutral") as unknown as Expr, look: YL_LOOK, acc: () => ylAcc(), limbs: { hand: SKIN.old, arm: COL.red }, nape: false, bald: true };
/** option B (天庭书吏): white hair under a red official's cap (幞头) with short wings, a short beard and moustache, a
 *  navy badge on his chest with the crescent and a red thread */
export const YUELAO_B: Person = {
  ...YUELAO, name: "yuelaoB", bald: false, look: { ...YL_LOOK, hair: "short" },
  acc: () => [...ylRobe({ token: false }), officialBadge(), ...ylFace({ beard: cloudBeard({ len: 1.25, wide: 0.9 }), forehead: forehead({ shine: false, lines: 1 }) }), futou({ col: COL.redDeep, wingLen: 1.2 }), pen({ hand: 0, col: "#b8935a" })],
};
/** option C (云游仙人): long white hair down his back, a tall topknot with a gold pin, a cloud collar, a staff */
export const YUELAO_C: Person = {
  ...YUELAO, name: "yuelaoC", bald: false, look: { ...YL_LOOK, hair: "long", width: 1.1 },
  acc: () => [...ylRobe({ token: false }), cloudCollar(), ...ylFace({ beard: cloudBeard({ len: 2.9, wide: 0.95 }), forehead: false }), topknot({ band: COL.red, pin: COL.gold, size: 1.45, pinLen: 0.42, back: 8 }), staff({ hand: 1 })],
};

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
/** the mother as the vision in the incense smoke (scene D): the same woman, half her size (v6b: 0.42 read too small) */
export const MA_MINI: Person = { ...MA, name: "ma_mini", scale: 0.5 };
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

export const PEOPLE = { yuelao: YUELAO, yuelaoB: YUELAO_B, yuelaoC: YUELAO_C, xiaoman: XIAOMAN, ma: MA, xiangqin: XIANGQIN, rider: RIDER } as Record<string, Person>;
/** FACES by name */
export const FACES: Record<string, Expr | RigFace> = {
  // 月老
  worry: face("smile", "nervous", "sad"), fawn: face("happy", "grin", "sad", "neutral"), proud: face("happy", "grin", "neutral"), panic: face("shock", "shock", "sad", "neutral"),
  grumble: face("deadpan", "huff", "stern", "neutral"), small: face("nervous", "nervous", "sad", "neutral"), strain: face("wince", "wince", "stern", "neutral"),
  suspicious: face("focus", "neutral", "focus", "neutral"), sly: face("smug", "smug", "neutral"), sag: face("sad", "sigh", "sad", "neutral"), quiet: face("sad", "neutral", "sad", "neutral"),
  wry: face("sad", "smile", "sad", "neutral"), wonder: face("smile", "whistle", "sad", "neutral"), joy: face("happy", "laugh", "neutral"), warm: face("smile", "smile", "neutral"),
  cough: face("smile_closed", "hush", "neutral"), shout: face("stern", "shock", "stern", "neutral"), hush: face("smile", "hush", "neutral"),
  // v6: caught in the middle of the knot, don't you move (wide eyes, stern brows, a held breath)
  warn: face("shock", "huff", "stern", "neutral"),
  // a thread in his teeth: busy / caught / hissing / grave
  bite: face("focus", "wince", "stern", "neutral"), caught: face("shock", "wince", "sad", "neutral"), hiss: face("stern", "wince", "stern", "neutral"), grave: face("deadpan", "wince", "stern", "neutral"),
  eager: face("happy", "smile", "sad", "neutral"), hope: face("smile", "smile", "sad", "neutral"), dread: face("shock", "nervous", "sad", "nervous"), sheepish: face("smile_closed", "nervous", "sad", "nervous"),
  // at her lens: wild with it / an awkward cough / coaxing her, eyes on the lens
  thrill: face("smile", "laugh", "neutral"), oh: face("smile", "whistle", "neutral", "neutral"), ahem: face("wince", "nervous", "sad", "nervous"), coax: face("smile", "smile", "sad", "nervous"),
  intent: face("smile", "whistle", "focus", "neutral"), resolve: face("stern", "grin", "stern", "neutral"), peer: face("focus", "whistle", "focus", "neutral"), tender: face("smile_closed", "smile", "sad", "neutral"), lost: face("sad", "nervous", "sad", "neutral"),
  // the mortals
  flat: face("deadpan", "neutral", "neutral"), tired: face("deadpan", "sigh", "sad", "neutral"), look: face("smile", "neutral", "neutral"), smile: face("smile", "smile", "neutral"),
  beam: face("happy", "grin", "neutral"), plead: face("sad", "shock", "sad", "neutral"), beg: face("shock", "nervous", "sad", "neutral"), wail: face("wince", "shock", "sad", "neutral"), polite: face("smile", "smile", "neutral"), shy: face("smile", "nervous", "sad", "relief"),
  calm: face("neutral", "neutral", "neutral"),
};

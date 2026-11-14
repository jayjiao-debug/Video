// THE CAST of the Li Bai film. Each Person = a kit Look + the accessories that make the role readable at phone size +
// scale + resting face (+ the accessories hidden by default). Built on the Su film's people.ts (song() looks, addPerson
// with default hides, the hair down the back of the head) and Qin's eunuch and blush.
//   LI (LI_RED)  GAO  HUAN  EMPEROR  HE  YOU  KEEPER  VILLAGER (VILLAGER2..4)
//   CAST = all by key (PEOPLE is the same table);  SPEAKER_PERSON;  VILLAGERS;  addPerson(rc, p) -> Rig
// WHO IS WHO AT A GLANCE:
//   李白     slim (0.96), a WHITE robe with a sky-blue band and sash, a topknot tied with a blue ribbon, a thin moustache
//            and a small goatee, rosy cheeks (blush light; LI_RED = strong, after the cups); resting face happy
//   高力士   round, beardless, pale; a deep PURPLE robe with a gold band, the soft black round cap; resting face smug
//   宦官     the messenger eunuch: round, beardless; an OLIVE robe, the soft black round cap (Qin's HUANGUAN)
//   皇帝     seen only from behind or far: a YELLOW robe with a red band, the black winged 幞头, 1.06 x
//   贺知章   old: white hair and a long white beard, a deep RED official robe, the wingless black 幞头 (ink flashback)
//   酒友     YOU: a rust short robe, a goatee, a topknot; the tavern keeper KEEPER: stocky with a pale apron
//   村民     VILLAGER..4: the Su film's market people (straw, sage, slate, rust), the tavern's drinkers
// NOTES FOR SHOT BUILDERS:
//   - Person.expr is the RESTING face. Faces never turn to profile; a back view is turn: 1.
//   - ji (the reporter) is the camera: no figure, no hands, no microphone. Things she hands over float (props).
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast } from "../group/kit/rig3d";
import { classmate, friend } from "../group/kit/cast";
import { moustache } from "../group/kit/rigacc";
import { shade } from "../group/kit/rigacc/shapes";
import { topknot } from "../../kit/acc/headwear";
import { robe } from "../../kit/acc/garb";
import { beard } from "../../kit/acc/facehair";
import { addPerson as addKitPerson, personalise, type Person as KitPerson } from "../wanbi/people";
import { headCloth } from "../wanbi/acc/bundle";
import { bambooHat, futou } from "./acc/hats";
import { stains, apronBib } from "./acc/cloth";
import { roundCap } from "../wanbi/acc/envoy";
import { blush, BLUSH } from "../qin/acc/blush";
import { napeHair, limbColours } from "./acc/figure";
import type { Speaker } from "./voice";

export { personalise };
/** a Person (Wanbi's type) + the accessories hidden by default (a shot's own `hide` replaces this list) + the figure
 *  fixes of acc/figure.ts: nape = how far down the back of the head the hair goes (deg from the crown; default NAPE
 *  165, false = the rig's own line), limbs = the ball hands' / arm tubes' colours (default: the rig's near-ink) */
export type Person = KitPerson & { hide?: string[]; nape?: number | false; limbs?: { hand?: string; arm?: string } };

type Inner = { _update: (cam: unknown) => void };
/** Adds the figure to the cast: Wanbi's addPerson (accessories, rim light, the hair over the beard, the resting face
 *  and the size), the figure fixes (acc/figure.ts: the hair down the back of the head for everyone, the hands' colour
 *  where the Person gives one), then the default hides: while the shot gives no `hide`, the Person's own list is used. */
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addKitPerson(rc, p);
  napeHair(r, p.look, { nape: p.nape });
  if (p.limbs) limbColours(r, p.limbs);
  if (p.hide?.length) {
    const rr = r as unknown as Inner, base = rr._update.bind(r), def = p.hide;
    rr._update = (cam) => {
      const st = r.state;
      if (st.hide !== undefined) { base(cam); return; }
      st.hide = def; base(cam); st.hide = undefined;
    };
  }
  return r;
}

const HAIR = "#262229";
/** the film's colours (never pure black: the ink stays the darkest thing; nothing brighter than #f4f1ea) */
export const COL = {
  li: "#eeeae0", liBand: "#7fa8c8", liSash: "#5d86a8", liRibbon: "#5d86a8",
  gao: "#5e3f78", gaoBand: "#d8b04a", huan: "#6a7458", huanBand: "#d8cfae",
  emperor: "#e0b23a", emperorBand: "#b8322a", he: "#9e3a32", heBand: "#6e2620", white: "#eeeae2", grey: "#a49e96",
  butcher: "#8a6446", butcherBand: "#5e4430", apron: "#e2d8c0", headCloth: "#6e5a48",
  straw: "#c8b07a", sage: "#8fa08a", slate: "#7a8698", rust: "#a8644a",
  inkBlack: "#2a2630",
} as const;
const S_RUDDY = "#eab08a", S_TAN = "#e6b48c", S_OLD = "#dcac84", S_FAIR = "#f6d9bd", S_PALE = "#fbe7d3", S_WARM = "#f3d2b0", S_WEATHER = "#e8b892";

/** a Song look from a kit look: its head (seed), skin and build stay; a plain top under the garment, dark cloth shoes,
 *  hair tied up (the kit's "buzz": a clean hairline under a topknot or a cap); nothing modern is carried over */
const song = (from: Look, o: Partial<Look> & { topCol: string }): Look => ({
  seed: from.seed, skin: from.skin, part: from.part, width: from.width,
  top: "tee", bottom: "chinos", botCol: "#3a3440", shoes: "#2d2a30", shoeSole: "#1f1c22", hair: "buzz", hairCol: HAIR,
  ...o,
});

// ---------------------------------------------------------------------------------------------------- 李白
const liAcc = (k: number): Acc[] => [
  robe({ col: COL.li, band: COL.liBand, sash: COL.liSash }),
  moustache({ kind: "pencil", col: HAIR }), beard({ kind: "goatee", col: HAIR, len: 0.7 }),
  topknot({ band: COL.liRibbon, pin: false, size: 0.95 }), blush(k),
];
const LI_LOOK = song(friend(7), { width: 0.96, skin: S_FAIR, topCol: COL.li });
/** 李白 (see the head of this file): the white robe with the blue band, light blush; resting face happy */
export const LI: Person = { name: "li", expr: "happy", look: LI_LOOK, acc: () => liAcc(BLUSH.light) };
/** the same, red-cheeked (after the cups: E, F) */
export const LI_RED: Person = { ...LI, name: "liRed", acc: () => liAcc(BLUSH.strong) };

// ---------------------------------------------------------------------------------------------------- the palace
/** 高力士: round, beardless, a purple robe with gold, the round cap; resting face smug */
export const GAO: Person = {
  name: "gao", expr: "smug", look: song(classmate(64), { width: 1.2, skin: S_PALE, topCol: COL.gao, head: { nTop: 2.2, nBot: 2, egg: 0.12 } }),
  acc: () => [robe({ col: COL.gao, band: COL.gaoBand, sash: COL.gaoBand }), roundCap()],
};
/** the messenger eunuch: round, beardless, olive robe, the round cap */
export const HUAN: Person = {
  name: "huan", expr: "neutral", look: song(classmate(33), { width: 1.14, skin: S_PALE, topCol: COL.huan, head: { nTop: 2.2, nBot: 2, egg: 0.12 } }),
  acc: () => [robe({ col: COL.huan, band: COL.huanBand, sash: COL.inkBlack }), roundCap()],
};
/** 皇帝, seen from behind: the yellow robe, the winged 幞头, 1.06 x */
export const EMPEROR: Person = {
  name: "emperor", scale: 1.06, expr: "neutral", look: song(classmate(8), { width: 1.1, skin: S_WARM, topCol: COL.emperor }),
  acc: () => [robe({ col: COL.emperor, band: COL.emperorBand, sash: COL.emperorBand }), beard({ kind: "goatee", col: HAIR }), moustache({ kind: "pencil", col: HAIR }), futou({ wings: true })],
};
/** 贺知章 (the flashback): old, long white beard, the red official robe, the wingless 幞头 */
export const HE: Person = {
  name: "he", expr: "laugh", look: song(classmate(42), { width: 1.0, skin: S_WEATHER, hairCol: COL.white, topCol: COL.he }),
  acc: () => [robe({ col: COL.he, band: COL.heBand, sash: COL.inkBlack }), beard({ kind: "long", col: COL.white, len: 2.0, wide: 0.9 }), moustache({ kind: "walrus", col: COL.white }), futou({ wings: false })],
};

// ---------------------------------------------------------------------------------------------------- the tavern
/** 酒友: a rust short robe, a goatee, a topknot */
export const YOU: Person = {
  name: "you", expr: "grin", look: song(friend(9), { width: 1.04, skin: S_WEATHER, topCol: COL.rust }),
  acc: () => [robe({ col: COL.rust, band: shade(COL.rust, 0.7), sash: COL.inkBlack, skirt: "short", knot: false }), beard({ kind: "goatee", col: HAIR }), topknot({ band: "#5e3a2a", pin: false, size: 0.85 })],
};
/** the tavern keeper: stocky, a brown short robe, a pale apron, a head cloth */
export const KEEPER: Person = {
  name: "keeper", expr: "smile", look: song(classmate(3), { width: 1.22, skin: S_WEATHER, topCol: COL.butcher }),
  acc: () => [robe({ col: COL.butcher, band: COL.butcherBand, sash: COL.butcherBand, skirt: "short", knot: false }), apronBib({ col: COL.apron }), stains(), beard({ kind: "stubble", col: HAIR }), headCloth({ col: COL.headCloth })],
};
const villager = (name: string, seed: Look, skin: string, col: string, head: Acc, extra: Acc[] = []): Person => ({
  name, expr: "neutral", look: song(seed, { width: 1.0, skin, topCol: col }),
  acc: () => [robe({ col, band: shade(col, 0.7), sash: COL.inkBlack, skirt: "short", knot: false }), head, ...extra],
});
/** the drinkers and passers-by: four plain robes (straw, sage, slate, rust) */
export const VILLAGER: Person = villager("villager", classmate(2), S_WARM, COL.straw, topknot({ band: false, pin: false, size: 0.85 }));
export const VILLAGER2: Person = villager("villager2", classmate(12), S_TAN, COL.sage, headCloth({ col: "#6a705e" }));
export const VILLAGER3: Person = villager("villager3", friend(11), S_FAIR, COL.slate, topknot({ band: "#4a5262", pin: false, size: 0.8 }), [moustache({ kind: "pencil", col: HAIR })]);
export const VILLAGER4: Person = villager("villager4", classmate(29), S_WEATHER, COL.straw, bambooHat({ col: "#cdb57c" }));

// ---------------------------------------------------------------------------------------------------- tables
/** every Person by its key */
export const CAST = {
  li: LI, liRed: LI_RED, gao: GAO, huan: HUAN, emperor: EMPEROR, he: HE, you: YOU, keeper: KEEPER,
  villager: VILLAGER, villager2: VILLAGER2, villager3: VILLAGER3, villager4: VILLAGER4,
} satisfies Record<string, Person>;
export const PEOPLE = CAST;
export type PersonKey = keyof typeof CAST;
/** who plays each speaker (ji, the reporter, is the camera: null) */
export const SPEAKER_PERSON: Record<Speaker, Person | null> = { ji: null, li: LI, huan: HUAN, you: YOU };
export const ALL_PEOPLE: Person[] = Object.values(CAST);
export const NAMED: Person[] = [LI, GAO, HUAN, EMPEROR, HE, YOU, KEEPER, VILLAGER];
export const VILLAGERS: Person[] = [VILLAGER, VILLAGER2, VILLAGER3, VILLAGER4];

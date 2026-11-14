// THE CAST of the Su film (PLAN section 2; WP3). Each Person = a kit Look (made ONCE: a look's identity keys cached
// drawings) + the accessories that make the role readable at a glance at phone size + scale + resting face (+ the
// accessories hidden by default). Wanbi's people.ts is the model (its addPerson / personalise are used here). The
// wardrobe is the shared kit's (src/kit/acc: robe, beards, topknot) and the film's own (acc/hats.ts bambooHat,
// dongpoCap, futou, twinBuns, wink; acc/cloth.ts patches, stains, apronBib).
//   SU (SU_WINK)  SU_DAN  SU_OLD  GUO  MAI  WIFE  KID  KID2  COURIER  BUTCHER  SERVANT  VILLAGER (VILLAGER2..4)
//   CAST = all by key (PEOPLE is the same table: shots/common.ts re-exports it);  SPEAKER_PERSON;  AGES;  VILLAGERS;
//   SU_HAT (hide lists: hat on / cap on / bare);  SU_MOOD (his moods -> RIG_EXPRS);  addPerson(rc, p) -> Rig
// (World.actor caches one figure per Person; a second figure of one Person = w.actor(P, "2"): the servants, the kids)
// WHO IS WHO AT A GLANCE (one silhouette feature + one colour each; preview/people_lineup.ts):
//   苏东坡 (60)  BIG (1.06 x) and the ROUNDEST body of the cast (width 1.38); a long grey-black beard and walrus
//            moustache (the most beard of anyone), a ruddy round face; an OCHRE-BROWN robe with two darker square
//            PATCHES (belly left, chest right) and a dark cloth belt; the wide conical BAMBOO HAT (斗笠) outdoors, the
//            tall square black 东坡巾 cap without it; resting face smile
//   (wink)   SU_WINK: the same with one eye closed in an arch (acc/hats.ts wink): a swap for a few frames (C20)
//   苏东坡 (儋州)  SU_DAN: the same man two years on: thinner (width 1.08), tanned, the beard and hair nearly WHITE, the
//            same robe faded pale (the patches faded too), bare-headed (topknot); resting face smile
//   苏东坡 (金山)  SU_OLD: four years on: very thin (width 0.86), white hair and long white beard, a plain GREY robe, the
//            东坡巾 cap; the walking stick is the prop "stick" in his left hand (hand 1); resting face smile_closed
//   苏过     slim and young (mid-20s), clean-shaven, a plain BLUE-GREY robe, a topknot with a dark band
//   苏迈     about 38: a small black goatee and a thin moustache, a DARK GREEN robe, a topknot
//   媳妇     苏迈's wife: a muted ROSE robe, her hair long with ONE low bun and a pin (Wanbi's ladyBun), lashes and a rose
//            mouth (Wanbi's ladyFace); slim; resting face smile_closed
//   孙子     KID (0.62): a RED short robe, two buns (双丫髻) tied with yellow; KID2 (0.62): a YELLOW short robe, one
//            small tuft with a red band. Both resting face happy
//   差役     COURIER: a RED official coat (short robe) with a black band and belt, dark boots, the black 幞头 with two
//            stiff side wings (acc/hats.ts futou); rides the kit horse (props "horse", horseSeat)
//   屠夫     BUTCHER: stocky, a brown short robe under a pale BIB APRON with faded stains, a head cloth (Wanbi's headCloth)
//   衙役     SERVANT (x2: w.actor(SERVANT, "1") / "2"): official livery: a DARK BLUE robe, a black sash, a wingless
//            black 幞头
//   村民     VILLAGER, VILLAGER2, VILLAGER3, VILLAGER4 (or keys of one): plain robes in four muted colours (straw,
//            sage, slate, rust), topknots / a head cloth / a straw-coloured bamboo hat on one
// NOTES FOR SHOT BUILDERS:
//   - Everybody is 1.45 m except SU / SU_DAN (scale 1.06), SU_OLD (1.04), the KIDS (0.62). addPerson makes a scaled
//     figure behave like any other: world places in (at, seat, hands), world places out (headWorld, handWorld,
//     elbowWorld, footWorld). rig.dim and rig.qa stay in the figure's own unscaled metres.
//   - Person.expr is the RESTING face: it replaces "neutral" (and no expr at all).
//   - Person.hide is what is hidden BY DEFAULT: a shot that gives its own `hide` replaces it. SU's default hides the
//     东坡巾 (the bamboo hat is on): give SU_HAT.cap to show the cap instead, SU_HAT.bare for neither (indoors, E).
//   - Expressions only from RIG_EXPRS (group/kit/rig3d.ts). The rig CANNOT WINK (no face has one eye shut, except
//     "pained" = one eye squeezed with pained brows and bared teeth): SU_WINK draws it (a swap of figures on a blink,
//     shots/common.ts swapTo + lid); without the swap the closest is "smug" + a head tilt (head: { tilt: 6 }) + gaze 0
//     to the lens. SU_MOOD lists the faces for his moods (PLAN 2).
//   - Robes have a 3D skirt; the World sets its ground every frame (the seat's floor for a sitter): nothing to do.
//     A figure on furniture of chair height (the rattan bed, the bench) can be told its seat with kit garb.ts
//     setSeat(rig, seat, facing) so the skirt lies over the thighs (props/index.ts bedSeat / benchSeat say how).
//   - Faces never turn to profile (FACE_MAX 12 deg): "turning away" = a body turn / back view (turn: 1), the gaze, a tilt.
//   - Accessories hide by name (state.hide): "bambooHat", "dongpoCap", "futou", "twinBuns", "topknot", "beard",
//     "moustache", "ladyBun", "headCloth", "robe" (the 3D skirt only: the painted garment stays), "patches".
//   - The bamboo hat is 0.27 m out from his head's axis each side (1.78 head radii) and its rim sits about 0.08 m
//     above his brows: a hand raised to his head or a held thing beside it keeps clear of the rim (self-head).
//   - ji (the reporter) is the camera: she has no figure (her hand and red mic: her.ts).
//   - WP3-fix (2026-11-14, acc/figure.ts, every Person): the hair goes on down the back of the head to the collar
//     (Person.nape, default 165 deg from the crown): a back view (turn 1) shows the back of a head of hair, not a skin
//     oval under a hair band. SU, SU_WINK, SU_DAN, SU_OLD: skin-coloured ball hands and arms in the robe's band colour
//     (Person.limbs), so a hand over his long beard reads (the rest of the cast keep the rig's near-ink limbs).
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
import { ladyBun, ladyFace } from "../wanbi/acc/lady";
import { bambooHat, dongpoCap, futou, twinBuns, wink } from "./acc/hats";
import { patches, stains, apronBib } from "./acc/cloth";
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
  su: "#b07a42", suBand: "#7c5430", suBelt: "#5a3e2a", patch: "#6f4a2a",       // the ochre-brown robe, its patches
  suFaded: "#c9a978", suFadedBand: "#9c7f58", patchFaded: "#a08460",            // the same robe two years on
  suOld: "#8e8a86", suOldBand: "#6a6662",                                       // the plain grey robe at 金山
  greyBlack: "#5c5458", white: "#ece8e0", whiteOld: "#f2eee6",
  guo: "#7b8fa0", guoBand: "#566878", mai: "#4a6a4e", maiBand: "#34503a",
  wife: "#c08a8e", wifeBand: "#9a6a70",
  kidRed: "#cc4a3a", kidYellow: "#e2b23e",
  courier: "#c23a30", courierBand: "#2f2c36", boots: "#2d2a30",
  butcher: "#8a6446", butcherBand: "#5e4430", apron: "#e2d8c0", headCloth: "#6e5a48",
  servant: "#34406a", servantBand: "#252c4a",
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

// ---------------------------------------------------------------------------------------------------- 苏东坡
/** his round head (a soft square crown, a round full jaw) */
const SU_HEAD = { nTop: 2.15, nBot: 2.0, egg: 0.16 };
/** SU's one look (SU and SU_WINK are a swap of one body) */
const SU_LOOK = song(classmate(64), { width: 1.38, skin: S_RUDDY, hairCol: COL.greyBlack, topCol: COL.su, head: SU_HEAD });
const suAcc = (): Acc[] => [
  robe({ col: COL.su, band: COL.suBand, sash: COL.suBelt }), patches({ col: COL.patch }),
  beard({ kind: "long", col: COL.greyBlack, len: 2.3, wide: 1.0 }), moustache({ kind: "walrus", col: COL.greyBlack }),
  bambooHat(), dongpoCap(),
];
/** 苏东坡 at 60 (see the head of this file): 1.06 x, the roundest body, the long grey-black beard, the patched ochre robe,
 *  the bamboo hat (default) or the 东坡巾 (hide SU_HAT.cap); resting face smile */
export const SU: Person = { name: "su", scale: 1.06, expr: "smile", look: SU_LOOK, acc: suAcc, hide: ["dongpoCap"], limbs: { hand: S_RUDDY, arm: COL.suBand } };
/** the same with a wink (one eye closed in an arch on the side of the smirk): a swap for a few frames (C20) */
export const SU_WINK: Person = { ...SU, name: "suWink", acc: () => [...suAcc(), wink()] };
/** 苏东坡 two years later (儋州): thinner, tanned, nearly white hair and beard, the robe faded, bare-headed */
export const SU_DAN: Person = {
  name: "suDan", scale: 1.06, expr: "smile", look: song(classmate(64), { width: 1.08, skin: S_TAN, hairCol: COL.white, topCol: COL.suFaded, head: SU_HEAD }),
  limbs: { hand: S_TAN, arm: COL.suFadedBand },
  acc: () => [
    robe({ col: COL.suFaded, band: COL.suFadedBand, sash: COL.suBelt }), patches({ col: COL.patchFaded, thread: "#efe4c8" }),
    beard({ kind: "long", col: COL.white, len: 2.15, wide: 1.0 }), moustache({ kind: "walrus", col: COL.white }),
    topknot({ band: COL.suFadedBand, pin: false, size: 0.8 }),
  ],
};
/** 苏东坡 four years later (金山): very thin, white hair and beard, a plain grey robe, the 东坡巾; the stick is a prop */
export const SU_OLD: Person = {
  name: "suOld", scale: 1.04, expr: "smile_closed", look: song(classmate(64), { width: 0.8, skin: S_OLD, hairCol: COL.whiteOld, topCol: COL.suOld, head: { ...SU_HEAD, egg: 0.06 } }),
  limbs: { hand: S_OLD, arm: COL.suOldBand },
  acc: () => [
    robe({ col: COL.suOld, band: COL.suOldBand, sash: COL.suOldBand }),
    beard({ kind: "long", col: COL.whiteOld, len: 2.25, wide: 0.86 }), moustache({ kind: "walrus", col: COL.whiteOld }),
    dongpoCap({ solo: true }),
  ],
};

// ---------------------------------------------------------------------------------------------------- the family
/** 苏过, the youngest son: slim, clean-shaven, a blue-grey robe, a topknot with a dark band */
export const GUO: Person = {
  name: "guo", look: song(friend(7), { width: 0.92, skin: S_FAIR, topCol: COL.guo }),
  acc: () => [robe({ col: COL.guo, band: COL.guoBand, sash: COL.guoBand }), topknot({ band: COL.inkBlack, pin: false, size: 0.9 })],
};
/** 苏迈, the eldest son: a short black beard, a dark green robe, a topknot */
export const MAI: Person = {
  name: "mai", expr: "smile", look: song(classmate(23), { width: 1.02, skin: S_WARM, topCol: COL.mai }),
  acc: () => [robe({ col: COL.mai, band: COL.maiBand, sash: COL.maiBand }), beard({ kind: "goatee", col: HAIR }), moustache({ kind: "pencil", col: HAIR }), topknot({ band: COL.maiBand, pin: false, size: 0.95 })],
};
/** 苏迈's wife: a muted rose robe, long hair with one low bun and a pin, lashes and a rose mouth */
export const WIFE: Person = {
  name: "wife", expr: "smile_closed", look: { ...song(friend(3), { width: 0.86, skin: S_PALE, topCol: COL.wife }), hair: "long" },
  acc: () => [robe({ col: COL.wife, band: COL.wifeBand, sash: COL.inkBlack }), ladyBun({ pin: "#c9a24a" }), ladyFace()],
};
/** the grandchildren (0.62): KID in red with two buns, KID2 in yellow with one tuft */
export const KID: Person = {
  name: "kid", scale: 0.62, expr: "happy", look: song(friend(11), { width: 0.95, skin: S_FAIR, topCol: COL.kidRed }),
  acc: () => [robe({ col: COL.kidRed, band: "#9a3428", sash: COL.kidYellow, skirt: "short", knot: false }), twinBuns({ ribbon: COL.kidYellow })],
};
export const KID2: Person = {
  name: "kid2", scale: 0.62, expr: "happy", look: song(friend(5), { width: 0.95, skin: S_WARM, topCol: COL.kidYellow }),
  acc: () => [robe({ col: COL.kidYellow, band: "#b8862c", sash: COL.kidRed, skirt: "short", knot: false }), topknot({ band: COL.kidRed, pin: false, size: 0.7 })],
};

// ---------------------------------------------------------------------------------------------------- the others
/** 差役, the courier with the order: a red official coat to the knees, dark boots, the black winged 幞头 */
export const COURIER: Person = {
  name: "courier", expr: "neutral", look: song(classmate(29), { width: 1.02, skin: S_TAN, topCol: COL.courier, shoes: COL.boots, botCol: COL.boots }),
  acc: () => [robe({ col: COL.courier, band: COL.courierBand, sash: COL.courierBand, skirt: "short", knot: false }), moustache({ kind: "pencil", col: HAIR }), futou({ wings: true })],
};
/** the butcher: stocky, a brown short robe, a pale bib apron with faded stains, a head cloth */
export const BUTCHER: Person = {
  name: "butcher", expr: "neutral", look: song(classmate(3), { width: 1.22, skin: S_WEATHER, topCol: COL.butcher }),
  acc: () => [robe({ col: COL.butcher, band: COL.butcherBand, sash: COL.butcherBand, skirt: "short", knot: false }), apronBib({ col: COL.apron }), stains(), beard({ kind: "stubble", col: HAIR }), headCloth({ col: COL.headCloth })],
};
/** the official's servants (x2, keys "1" / "2"): dark blue livery, a black sash, a wingless black 幞头 */
export const SERVANT: Person = {
  name: "servant", expr: "neutral", look: song(classmate(5), { width: 0.98, skin: S_FAIR, topCol: COL.servant }),
  acc: () => [robe({ col: COL.servant, band: COL.servantBand, sash: COL.inkBlack }), futou({ wings: false })],
};
const villager = (name: string, seed: Look, skin: string, col: string, head: Acc, extra: Acc[] = []): Person => ({
  name, expr: "neutral", look: song(seed, { width: 1.0, skin, topCol: col }),
  acc: () => [robe({ col, band: shade(col, 0.7), sash: COL.inkBlack, skirt: "short", knot: false }), head, ...extra],
});
/** the market villagers: four plain robes (straw, sage, slate, rust); keys give more of each */
export const VILLAGER: Person = villager("villager", classmate(2), S_WARM, COL.straw, topknot({ band: false, pin: false, size: 0.85 }));
export const VILLAGER2: Person = villager("villager2", classmate(12), S_TAN, COL.sage, headCloth({ col: "#6a705e" }));
export const VILLAGER3: Person = villager("villager3", friend(9), S_FAIR, COL.slate, topknot({ band: "#4a5262", pin: false, size: 0.8 }), [beard({ kind: "goatee", col: HAIR })]);
export const VILLAGER4: Person = villager("villager4", classmate(33), S_WEATHER, COL.rust, bambooHat({ col: "#cdb57c" }));

// ---------------------------------------------------------------------------------------------------- tables
/** every Person by its key */
export const CAST = {
  su: SU, suWink: SU_WINK, suDan: SU_DAN, suOld: SU_OLD, guo: GUO, mai: MAI, wife: WIFE, kid: KID, kid2: KID2,
  courier: COURIER, butcher: BUTCHER, servant: SERVANT, villager: VILLAGER, villager2: VILLAGER2, villager3: VILLAGER3, villager4: VILLAGER4,
} satisfies Record<string, Person>;
/** the same table under Qin's old name (shots/common.ts re-exports it) */
export const PEOPLE = CAST;
export type PersonKey = keyof typeof CAST;
/** who plays each speaker (ji, the reporter, is the camera: null; chai = the courier) */
export const SPEAKER_PERSON: Record<Speaker, Person | null> = { ji: null, su: SU, guo: GUO, chai: COURIER };
/** every Person the film uses, for a line-up */
export const ALL_PEOPLE: Person[] = Object.values(CAST);
/** one figure per role (the line-up's phone-size and silhouette tests: no swaps) */
export const NAMED: Person[] = [SU, GUO, MAI, WIFE, KID, KID2, COURIER, BUTCHER, SERVANT, VILLAGER];
/** his three ages */
export const AGES: Person[] = [SU, SU_DAN, SU_OLD];
/** the market crowd's four looks */
export const VILLAGERS: Person[] = [VILLAGER, VILLAGER2, VILLAGER3, VILLAGER4];
/** SU's hats as hide lists: hat = the bamboo hat on (his default), cap = the 东坡巾 on, bare = neither */
export const SU_HAT = { hat: ["dongpoCap"], cap: ["bambooHat"], bare: ["bambooHat", "dongpoCap"] } as const satisfies Record<string, readonly string[]>;
/** his moods (PLAN 2) as rig faces (and what goes with them) */
export const SU_MOOD = {
  delighted: ["happy", "grin", "laugh"], conspiratorial: ["smug"], mockSorry: ["deadpan"], drowsy: ["sleep", "dazed"],
  stunned: ["shock", "neutral"], longRead: ["focus"], brightening: ["smile", "happy"], fond: ["smile_closed"],
  breaking: ["sad", "pained"], crying: ["sad"], throughTears: ["smile_closed"], dozing: ["sleep"],
} as const satisfies Record<string, readonly Expr[]>;

// THE CAST of the Arthur film. Each Person = a kit Look (made ONCE: a look's identity keys cached drawings) + the
// accessories that make the role readable at a glance (BIBLE.md, "Cast"; acc/headwear.ts, acc/garb.ts).
//   PEOPLE.arthur / arthurKing / kay / ector / lord(i 0..7) / guard(i 0..3) / commoner(i 0..15)
//       (the same Person object every call: World.actor caches the figure per Person)
//   addPerson(rc, p) -> Rig        ALL_PEOPLE = every Person, for a line-up (preview/people_lineup.ts)
// Notes for shot builders:
//   - Everybody is the same height: 1.45 m. Person.scale is 1 for all: the rig solves in world space, so a scaled
//     group shrinks toward the world's origin (the figure leaves its mark and its feet leave a raised floor) and its
//     hand points no longer match what is drawn. Arthur reads as the boy by his narrow build (width 0.9), his bare
//     tousled head and his bright blue next to wide, hatted, bearded adults; Kay's helmet makes him 4 cm taller.
//   - Arthur is the ONLY figure in saturated blue with red at the neck: nobody else wears a bright blue.
//   - arthurKing = the same look as arthur (same face and hair) in the same tunic, + the crown + a red cloak with a
//     fur collar (the collar covers the neck: no scarf under it). hide: ["crown"] takes the crown off (it leaves no
//     trace: the hair is drawn as on arthur); hide: ["cloak"] hides only the cape, its shoulders are painted.
//   - Kay's EMPTY scabbard hangs low at his LEFT hip (the person's left = screen right when he faces the camera).
//   - Guards hold the spear in hand 1 (the person's left; even i) or hand 0 (odd i); that arm stays down in wave /
//     point / cheer. Do not pin that hand. The butt is 5 cm off the ground when they stand (it dips with each step).
//   - Hooded, coifed and capped figures have short hair on purpose (a ponytail or long hair would come out through
//     the back of the wrap); cloaked figures too (long hair would hang through the fur collar).
//   - Hats / helmets hide by name: "crown", "coronet", "plumedHat", "kettleHelm", "openHelm", "hood", "linenCap",
//     "strawHat" (3D parts only: a pulled-down one still cuts the fringe; painted cape-lets / mantles / ties stay).
import type { Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast } from "../group/kit/rig3d";
import { classmate, friend, YOU } from "../group/kit/cast";
import { moustache, apron } from "../group/kit/rigacc";
import { coronet, crown, kettleHelm, openHelm, hood, linenCap, strawHat, plumedHat } from "./acc/headwear";
import { tunic, surcoat, cloak, beard, scabbard, spear } from "./acc/garb";

export type Person = { name: string; look: Look; acc: () => Acc[]; scale?: number };

/** a medieval look from a kit look: its head (seed), skin and build stay; plain top, plain hose, dark leather shoes;
 *  nothing modern is carried over (no glasses, lanyard, tag, headband, hoodie strings: only the listed fields) */
const med = (from: Look, o: Partial<Look> & { topCol: string; hair: Look["hair"]; hairCol: string }): Look => ({
  seed: from.seed, skin: from.skin, part: from.part, width: from.width,
  top: "tee", bottom: "chinos", botCol: "#4a3b30", shoes: "#3a2a20", shoeSole: "#2a1f18",
  ...o,
});
const S_FAIR = "#f6d9bd", S_PALE = "#fbe7d3", S_WARM = "#f3d2b0", S_TAN = "#efc9a4", S_RUDDY = "#f2c4a4";

// ---- colours ----
const ARTHUR_BLUE = "#2a6fe0", ARTHUR_RED = "#d8322c";
const KAY_RED = "#c2332f", KAY_GOLD = "#f2c230";
const GUARD_BLUE = "#7388a3";
const FUR = "#f1eadb", GOLD = "#e9b53a", ECTOR_GREY = "#a09e9b";
const OCHRE = "#c8962e", RUST = "#a8502c", BROWN = "#8a6a44", GREEN = "#6f8a4a", GREYBLUE = "#8696a3", CREAM = "#e8dcc0";

// ---- the principals ----
const ARTHUR_LOOK = med(YOU, { hair: "short", hairCol: "#8f5a2c", topCol: ARTHUR_BLUE, botCol: "#5a4632", width: 0.9, skin: S_FAIR });
const arthurTunic = (scarf: boolean) => tunic({ col: ARTHUR_BLUE, belt: "#5b3a22", scarf: scarf ? ARTHUR_RED : false });
const arthur: Person = { name: "arthur", look: ARTHUR_LOOK, scale: 1, acc: () => [arthurTunic(true)] };
const arthurKing: Person = {
  name: "arthurKing", look: ARTHUR_LOOK, scale: 1,
  acc: () => [arthurTunic(false), cloak({ col: "#c8282f", fur: FUR, clasp: GOLD }), crown()],
};
const kay: Person = {
  name: "kay", scale: 1,
  look: med(friend(3), { hair: "buzz", hairCol: "#3b2a22", topCol: "#7f8894", botCol: "#4a4a55", width: 1.08, skin: S_WARM }),
  acc: () => [surcoat({ col: KAY_RED, charge: "chevron", chargeCol: KAY_GOLD }), scabbard({ empty: true }), openHelm({ mantle: false })],
};
const ector: Person = {
  name: "ector", scale: 1,
  look: med(classmate(17), { hair: "short", hairCol: ECTOR_GREY, topCol: BROWN, botCol: "#4a3a2c", width: 1.14, skin: S_WARM }),
  acc: () => [tunic({ col: BROWN, belt: "#3a2a22" }), cloak({ col: "#2c5a3a", fur: FUR }), beard({ col: ECTOR_GREY, kind: "full" }), moustache({ kind: "walrus", col: ECTOR_GREY })],
};

// ---- the lords: wide, caped, crowned or plumed, bearded; each one different ----
type LordSpec = {
  from: Look; skin: string; hair: Look["hair"]; hairCol: string; width: number; tunic: string;
  cape: string; lining?: string; fur?: boolean;
  hat: () => Acc; beard?: "full" | "short" | "fork"; tache?: "curl" | "handlebar" | "walrus" | "pencil";
};
const LORDS: LordSpec[] = [
  { from: classmate(3), skin: S_WARM, hair: "side", hairCol: "#3b2a22", width: 1.3, tunic: CREAM, cape: "#7a2f8f", hat: () => coronet({ gem: "#d8283e" }), tache: "handlebar" },
  { from: classmate(8), skin: S_RUDDY, hair: "short", hairCol: "#8c8a88", width: 1.4, tunic: "#3a3a48", cape: "#b0263a", fur: true, hat: () => plumedHat({ col: "#2d2a36", plume: "#d8283e" }), beard: "fork", tache: "walrus" },
  { from: classmate(29), skin: S_FAIR, hair: "side", hairCol: "#a3552a", width: 1.25, tunic: "#6a2530", cape: "#d9a520", hat: () => coronet({ gem: "#2f7fe0" }), beard: "short", tache: "handlebar" },
  { from: classmate(42), skin: S_TAN, hair: "buzz", hairCol: "#1f1a18", width: 1.35, tunic: "#c9b48a", cape: "#2d2a36", lining: "#b0263a", fur: true, hat: () => coronet({ gem: "#2fa65a", points: 5 }), beard: "full", tache: "handlebar" },
  { from: classmate(51), skin: S_PALE, hair: "side", hairCol: "#c9a25a", width: 1.3, tunic: CREAM, cape: "#24357a", fur: true, hat: () => plumedHat({ col: "#b0263a", plume: "#f6f1e4" }), tache: "curl" },
  { from: classmate(64), skin: S_RUDDY, hair: "short", hairCol: "#7a3b22", width: 1.4, tunic: "#c9b48a", cape: "#1f8a55", hat: () => coronet({ gem: "#a04ad0", points: 7 }), beard: "full", tache: "walrus" },
  { from: classmate(75), skin: S_WARM, hair: "bob", hairCol: "#6b4a33", width: 1.25, tunic: "#3a3a48", cape: "#b0263a", lining: "#d9a520", hat: () => plumedHat({ col: "#1f7a4f", plume: "#f0dfa8" }), beard: "fork", tache: "curl" },
  { from: classmate(80), skin: S_TAN, hair: "buzz", hairCol: "#5c5a5e", width: 1.35, tunic: "#8f1d2a", cape: "#d9a520", fur: true, hat: () => coronet({ gem: "#d8283e", points: 5, tilt: 7 }), beard: "short", tache: "pencil" },
];
const lords: Person[] = LORDS.map((s, i) => ({
  name: `lord${i}`, scale: 1,
  look: med(s.from, { skin: s.skin, hair: s.hair, hairCol: s.hairCol, width: s.width, topCol: s.tunic, botCol: "#3a3236", shoes: "#2d2a30" }),
  acc: () => {
    const a: Acc[] = [tunic({ col: s.tunic, belt: "#3a2a22", hem: GOLD }), cloak({ col: s.cape, lining: s.lining, fur: s.fur ? FUR : false, clasp: GOLD })];
    if (s.beard) a.push(beard({ col: s.hairCol, kind: s.beard }));
    if (s.tache) a.push(moustache({ kind: s.tache, col: s.hairCol }));
    a.push(s.hat());
    return a;
  },
}));

// ---- the guards: identical knights, two heads ----
const GUARD_LOOKS: Look[] = [
  med(classmate(12), { skin: S_FAIR, hair: "buzz", hairCol: "#3b2a22", width: 1.06, topCol: "#7f8894", botCol: "#4a4a55" }),
  med(classmate(33), { skin: S_TAN, hair: "buzz", hairCol: "#6b4a33", width: 1.06, topCol: "#7f8894", botCol: "#4a4a55" }),
];
const guards: Person[] = [0, 1, 2, 3].map((i) => ({
  name: `guard${i}`, scale: 1, look: GUARD_LOOKS[i % 2],
  acc: () => [surcoat({ col: GUARD_BLUE, charge: "plain" }), spear({ hand: i % 2 ? 0 : 1, lift: 0.05 }), kettleHelm()],
}));

// ---- the commons: thin, earthy, hooded / capped / straw-hatted / bare-headed, men and women ----
type CommonSpec = {
  from: Look; skin: string; hair: Look["hair"]; hairCol: string; width: number; tunic: string; hem?: string;
  hat?: () => Acc; apron?: string; beard?: "full" | "short" | "fork" | "stubble"; tache?: "curl" | "handlebar" | "walrus" | "pencil";
};
const COMMONS: CommonSpec[] = [
  { from: classmate(1), skin: S_FAIR, hair: "short", hairCol: "#3b2a22", width: 0.96, tunic: OCHRE, hat: () => hood({ col: "#5f7d45" }) },
  { from: classmate(2), skin: S_PALE, hair: "bob", hairCol: "#6b4a33", width: 0.92, tunic: RUST, hat: () => linenCap(), apron: "#efe6d2" },
  { from: classmate(4), skin: S_TAN, hair: "side", hairCol: "#2a221e", width: 1.0, tunic: GREEN, hat: () => strawHat() },
  { from: classmate(5), skin: S_FAIR, hair: "long", hairCol: "#7a5236", width: 0.9, tunic: GREYBLUE, hem: CREAM },
  { from: classmate(6), skin: S_WARM, hair: "buzz", hairCol: "#4a3326", width: 1.04, tunic: BROWN, hat: () => hood({ col: "#c79a3a" }), beard: "stubble" },
  { from: classmate(7), skin: S_RUDDY, hair: "curly", hairCol: "#2a221e", width: 1.05, tunic: RUST, apron: "#6b4a33", beard: "full" },
  { from: classmate(9), skin: S_FAIR, hair: "bob", hairCol: "#1f1a18", width: 0.94, tunic: OCHRE, hem: "#8a5a34", hat: () => linenCap() },
  { from: classmate(10), skin: S_WARM, hair: "ponytail", hairCol: "#8a5a34", width: 0.92, tunic: GREEN, hat: () => strawHat({ band: "#a8502c" }) },
  { from: classmate(11), skin: S_PALE, hair: "bob", hairCol: "#4a3326", width: 0.9, tunic: BROWN, hem: CREAM, hat: () => hood({ col: "#7d8ea0" }) },
  { from: classmate(13), skin: S_TAN, hair: "short", hairCol: "#7a5236", width: 1.0, tunic: OCHRE, beard: "full" },
  { from: classmate(14), skin: S_FAIR, hair: "bun", hairCol: "#3b2a22", width: 0.92, tunic: GREEN, apron: "#efe6d2" },
  { from: classmate(15), skin: S_WARM, hair: "side", hairCol: "#1f1a18", width: 0.98, tunic: GREYBLUE, hat: () => hood({ col: "#9a3f34" }) },
  { from: classmate(16), skin: S_RUDDY, hair: "buzz", hairCol: "#6b4a33", width: 1.02, tunic: RUST, hat: () => strawHat(), beard: "stubble" },
  { from: classmate(18), skin: S_TAN, hair: "short", hairCol: "#2a221e", width: 0.96, tunic: BROWN, hat: () => linenCap({ ties: false }) },
  { from: classmate(19), skin: S_PALE, hair: "ponytail", hairCol: "#a3552a", width: 0.9, tunic: OCHRE, hem: CREAM },
  { from: classmate(20), skin: S_WARM, hair: "short", hairCol: "#8c8a88", width: 1.0, tunic: GREEN, hat: () => hood({ col: "#7a5a3c" }), tache: "walrus" },
];
const commons: Person[] = COMMONS.map((s, i) => ({
  name: `commoner${i}`, scale: 1,
  look: med(s.from, { skin: s.skin, hair: s.hair, hairCol: s.hairCol, width: s.width, topCol: s.tunic, botCol: i % 2 ? "#4a3b30" : "#3f3a36" }),
  acc: () => {
    const a: Acc[] = [tunic({ col: s.tunic, belt: i % 2 ? "#5b3a22" : "#3a2a20", buckle: "#b9a27a", hem: s.hem ?? false, lace: !s.apron })];
    if (s.apron) a.push(apron({ col: s.apron }));
    if (s.beard) a.push(beard({ col: s.hairCol, kind: s.beard }));
    if (s.tache) a.push(moustache({ kind: s.tache, col: s.hairCol }));
    if (s.hat) a.push(s.hat());
    return a;
  },
}));

const pick = (a: Person[], i: number) => a[((Math.floor(i) % a.length) + a.length) % a.length];
export const PEOPLE = {
  arthur, arthurKing, kay, ector,
  lord: (i: number): Person => pick(lords, i),
  guard: (i: number): Person => pick(guards, i),
  commoner: (i: number): Person => pick(commons, i),
};
/** adds the figure to the cast and applies its scale */
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = rc.add(p.look, { acc: p.acc() });
  if (p.scale !== undefined && p.scale !== 1) r.group.scale.setScalar(p.scale);
  return r;
}
/** every Person the film uses, for a line-up */
export const ALL_PEOPLE: Person[] = [arthur, arthurKing, kay, ector, ...lords, ...guards, ...commons];

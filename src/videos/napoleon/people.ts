// THE CAST of the Napoleon film (采访拿破仑的一天). Each Person is Wanbi's type (a kit Look made once + accessories +
// scale + resting face); addPerson is Wanbi's. The reporter (ji) is the camera and has no figure.
//   NAPOLEON at seven stops = FIVE FIGURES with ONE face (swap them at the joins between scenes, never inside one):
//     NP_GENERAL  1796 Arcole: 27, thin, long hair to the collar, the dark-blue coat of a general of the Republic with
//                 gold oak leaves and a tricolour sash, no hat (NP_GENERAL_WET: the same, soaked)
//     NP_CONSUL   1800 the Alps, 1812 Russia (NP_SNOW), 1815 Waterloo: the GREY greatcoat and THE HAT
//     NP_SACRE    1804 Notre-Dame: the crimson robe with gold bees, the ermine, the gold laurel
//     NP_GREEN    about 1805, the Tuileries: the GREEN coat of the chasseurs of the Guard (his colour), white lapels
//                 and waistcoat, red collar, gold epaulettes, the star; bare-headed indoors (NP_GREEN_HAT with the hat)
//     NP_HELENA   about 1820: heavier, the loose white gown, the wide straw hat
//   DORSAZ the mountain guide (B);  DAVID the painter (C);  GRENADIER (A: hauls him out);  SECRETARY (D)
// At a glance: he is the smallest figure with the biggest hat; green is his and nobody else wears it.
import type { Look } from "../group/kit/toon";
import { addPerson, type Person } from "../wanbi/people";
import { uniform, greatcoat, sacre, gownLoose, bicorne, laurel, strawHat, EMPIRE } from "./acc/empire";

export { addPerson, type Person };

const SKIN = "#f3d6bd";
/** his one face: a round head a little wider at the jaw; scale 0.97 of the cast (he was of average height: the joke is
 *  that everyone THINKS he is small, so he is NOT drawn small) */
const face = (o: Partial<Look>): Look => ({
  seed: 1769, skin: SKIN, top: "jacket", topCol: EMPIRE.green, bottom: "shorts", botCol: EMPIRE.white, legCol: EMPIRE.black, shoes: EMPIRE.black, shoeSole: "#1f1c22",
  hair: "side", hairCol: "#4a3528", part: 1, width: 1.0, head: { nTop: 2.1, nBot: 2.2, egg: 0.1, asym: 0.02 }, ...o,
});
const SCALE = 1.0;
const general = (name: string, wet: number): Person => ({
  name, scale: SCALE, expr: "stern",
  look: face({ hair: "long", topCol: EMPIRE.blue, width: 0.9 }),
  acc: () => [uniform({ col: EMPIRE.blue, lapel: EMPIRE.blue, piping: EMPIRE.gold, collar: EMPIRE.red, sash: true, embroidery: true, wet }), bicorne()],
});
export const NP_GENERAL = general("npGeneral", 0);
export const NP_GENERAL_WET = general("npGeneralWet", 1);
const consul = (name: string, snow: number): Person => ({
  name, scale: SCALE, expr: "stern", look: face({ topCol: EMPIRE.grey, width: 1.0 }),
  acc: () => [greatcoat({ snow }), bicorne({ snow })],
});
export const NP_CONSUL = consul("npConsul", 0);
export const NP_SNOW = consul("npSnow", 1);
export const NP_SACRE: Person = {
  name: "npSacre", scale: SCALE, expr: "smug", look: face({ topCol: EMPIRE.crimson, botCol: EMPIRE.white, legCol: EMPIRE.white, shoes: EMPIRE.white, width: 1.06 }),
  acc: () => [sacre(), laurel()],
};
const green = (name: string, hat: boolean): Person => ({
  name, scale: SCALE, expr: "stern", look: face({ topCol: EMPIRE.green, width: 1.06 }),
  acc: () => [uniform({ col: EMPIRE.green, lapel: EMPIRE.white, piping: EMPIRE.red, collar: EMPIRE.red, epaulettes: true, star: true }), ...(hat ? [bicorne()] : [])],
});
export const NP_GREEN = green("npGreen", false);
export const NP_GREEN_HAT = green("npGreenHat", true);
export const NP_HELENA: Person = {
  name: "npHelena", scale: SCALE, expr: "neutral", look: face({ topCol: EMPIRE.cream, botCol: EMPIRE.cream, legCol: EMPIRE.white, shoes: "#6a5a48", width: 1.3, hairCol: "#6a5a50" }),
  acc: () => [gownLoose(), strawHat()],
};

/** the mountain guide of Bourg-Saint-Pierre: young, broad, brown homespun, a round felt hat */
export const DORSAZ: Person = {
  name: "dorsaz", scale: 1.02, expr: "smile",
  look: { seed: 1800, skin: "#f0c9a8", top: "jacket", topCol: "#7a6248", inner: "#d8ccb4", bottom: "shorts", botCol: "#5a4a3c", legCol: "#b8ac98", shoes: "#4a3a30", hair: "short", hairCol: "#6a4a30", part: -1, width: 1.15 },
  acc: () => [strawHat({ col: "#6e5a48", band: "#4a3a30" })],
};
/** the First Painter: 56, slim, a dark coat with a high white collar, grey curls, a sketchbook in the shots */
export const DAVID: Person = {
  name: "david", scale: 1.0, expr: "focus",
  look: { seed: 1748, skin: "#f1d2b8", top: "jacket", topCol: "#3a3a48", inner: EMPIRE.white, bottom: "shorts", botCol: "#3a3a48", legCol: EMPIRE.white, shoes: EMPIRE.black, hair: "curly", hairCol: "#9a948c", part: 1, width: 0.92 },
  acc: () => [uniform({ col: "#3a3a48", lapel: "#3a3a48", piping: "#3a3a48", collar: EMPIRE.white, button: "#8a8478" })],
};
/** a grenadier of 1796: blue coat, white lapels, red epaulettes painted as piping, a plain bicorne (no cockade trim) */
export const GRENADIER: Person = {
  name: "grenadier", scale: 1.08, expr: "nervous",
  look: { seed: 1796, skin: "#eec6a4", top: "jacket", topCol: EMPIRE.blue, bottom: "shorts", botCol: EMPIRE.white, legCol: EMPIRE.black, shoes: EMPIRE.black, hair: "short", hairCol: "#3a2c24", part: -1, width: 1.12 },
  acc: () => [uniform({ col: EMPIRE.blue, lapel: EMPIRE.white, piping: EMPIRE.red, collar: EMPIRE.red, button: "#c8b890" }), bicorne({ wide: 0.8, tall: 0.8 })],
};
export const SECRETARY: Person = {
  name: "secretary", scale: 0.98, expr: "nervous",
  look: { seed: 1805, skin: "#f2d4bc", top: "jacket", topCol: "#4a4038", inner: EMPIRE.white, bottom: "shorts", botCol: "#4a4038", legCol: EMPIRE.white, shoes: EMPIRE.black, hair: "side", hairCol: "#5a4030", part: -1, width: 0.95 },
  acc: () => [uniform({ col: "#4a4038", lapel: "#4a4038", piping: "#4a4038", collar: EMPIRE.white, button: "#8a8478" })],
};

export const PEOPLE = {
  npGeneral: NP_GENERAL, npGeneralWet: NP_GENERAL_WET, npConsul: NP_CONSUL, npSnow: NP_SNOW, npSacre: NP_SACRE, npGreen: NP_GREEN, npGreenHat: NP_GREEN_HAT, npHelena: NP_HELENA,
  dorsaz: DORSAZ, david: DAVID, grenadier: GRENADIER, secretary: SECRETARY,
} satisfies Record<string, Person>;
export const ALL_PEOPLE: Person[] = Object.values(PEOPLE);
/** his five figures in life order */
export const NP_STAGES: Person[] = [NP_GENERAL_WET, NP_CONSUL, NP_SACRE, NP_GREEN, NP_HELENA];
/** one figure per role */
export const NAMED: Person[] = [NP_GREEN_HAT, DORSAZ, DAVID, GRENADIER];
/** the starter shots' guest, until every scene is built */
export const GUEST: Person = NP_GREEN_HAT;

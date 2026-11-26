// THE CAST of 采访八百壮士的一天. Figures on the kit's rig3d cast (group/kit, never edited).
//   满仓 (演绎)   19, 湖北通城, three months in: a helmet a size too big, wide eyes, a quick smile.
//   老班长 (演绎)  three months of fighting round Shanghai behind him: stubble, heavy brows, lines, never hurried.
//   谢晋元        32, 中校团附: lean, bare-headed at his crate desk, a cross strap; the only man sitting.
//   杨瑞符        the battalion commander: broad, a helmet, a hard face.
//   陈树生        21: seen from the back only, stick grenades tied round his waist. No face is ever shown.
//   the men       soldiers by seed; the runner; two British soldiers and Shanghai civilians at the bridge's south end.
// The enemy is never drawn. No flag, badge or emblem is drawn on anyone.
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigFace } from "../group/kit/rig3d";
import { addPerson as addKitPerson, type Person as KitPerson } from "../wanbi/people";
import { limbColours } from "../su/acc/figure";
import { legColours } from "../romeo/acc/figure";
import { softBrows, bushyBrows, ageLines, cheeks, nose, freckles, shine } from "../romeo/acc/face";
import { beard } from "../../kit/acc/facehair";
import { moustache, glasses } from "../group/kit/rigacc";
import { m35, fieldCap, brodie, fedora, tunic, rifle, sackHeld, helmetHeld, UNI } from "./acc/soldier";

export type Person = KitPerson & { limbs?: { hand?: string; arm?: string }; legs?: { leg?: string; foot?: string } };
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addKitPerson(rc, p);
  if (p.limbs) limbColours(r, p.limbs);
  if (p.legs) legColours(r, p.legs);
  return r;
}
const face = (eyes: Expr, mouth: Expr, brows: Expr, marks?: Expr): RigFace => ({ eyes, mouth, brows, marks: marks ?? brows });

export const SKIN = { boy: "#e4ba8e", tan: "#d3a87c", pale: "#e0b98f", brit: "#efc7ae" } as const;
const HAIR = "#2a2420";
const soldierLook = (seed: number, skin: string, width = 0.95, hair: Look["hair"] = "buzz"): Look => ({
  seed, skin, top: "tee", topCol: UNI.cloth, bottom: "chinos", botCol: UNI.trousers, shoes: UNI.shoe, shoeSole: "#2e281f", hair, hairCol: HAIR, part: 1, width,
});
const limbs = (skin: string, col: string = UNI.cloth) => ({ limbs: { hand: skin, arm: col }, legs: { leg: UNI.puttee, foot: UNI.shoe } });

// ------------------------------------------------------------------------------------------------------- 满仓
const MC_LOOK = soldierLook(1907, SKIN.boy, 0.88);
const mcAcc = (extra: Acc[] = []): Acc[] => [tunic({ sling: true, worn: 0.35 }), m35({ size: 1.13, tip: 7, lean: 4 }), softBrows({ weight: 3.0, col: HAIR }), cheeks({ k: 0.42 }), freckles(), shine(), ...extra];
export const MANCANG: Person = { name: "mancang", scale: 0.95, look: MC_LOOK, ...limbs(SKIN.boy), expr: face("smile", "smile", "neutral") as unknown as Expr, acc: () => mcAcc() };
export const MANCANG_SACK: Person = { ...MANCANG, name: "mancangSack", acc: () => mcAcc([sackHeld({ hand: 1 })]) };
export const MANCANG_RIFLE: Person = { ...MANCANG, name: "mancangRifle", acc: () => mcAcc([rifle({ hand: 0 })]) };
/** bare-headed (scene D's end: he takes his helmet off) */
export const MANCANG_BARE: Person = { ...MANCANG, name: "mancangBare", acc: () => [...mcAcc().filter((a) => a.name !== "m35"), helmetHeld({ hand: 1 })] };

// ------------------------------------------------------------------------------------------------------- 老班长
const LB_LOOK = soldierLook(1731, SKIN.tan, 1.04);
const lbAcc = (extra: Acc[] = []): Acc[] => [tunic({ sling: true, worn: 0.8 }), m35({}), beard({ kind: "stubble", col: "#4a443e" }), bushyBrows({ col: "#3a332c" }), ageLines(), nose(), ...extra];
export const LAO: Person = { name: "lao", scale: 1.0, look: LB_LOOK, ...limbs(SKIN.tan), expr: face("deadpan", "neutral", "neutral") as unknown as Expr, acc: () => lbAcc() };
export const LAO_RIFLE: Person = { ...LAO, name: "laoRifle", acc: () => lbAcc([rifle({ hand: 0 })]) };

// ------------------------------------------------------------------------------------------------------- the officers
const XIE_LOOK: Look = { ...soldierLook(1905, SKIN.pale, 0.9, "side"), head: { egg: -0.06, nTop: 2.3, nBot: 2.5 } };
const xieAcc = (cap: boolean): Acc[] => [tunic({ strap: true, worn: 0.25, tabs: "#6d6b48" }), ...(cap ? [fieldCap({})] : []), softBrows({ weight: 3.6, col: HAIR }), nose()];
export const XIE: Person = { name: "xie", scale: 1.02, look: XIE_LOOK, ...limbs(SKIN.pale), expr: face("neutral", "neutral", "neutral") as unknown as Expr, acc: () => xieAcc(false) };
export const XIE_CAP: Person = { ...XIE, name: "xieCap", acc: () => xieAcc(true) };
const YANG_LOOK: Look = { ...soldierLook(1902, SKIN.tan, 1.12), head: { nBot: 3.2, egg: 0.08 } };
export const YANG: Person = {
  name: "yang", scale: 1.03, look: YANG_LOOK, ...limbs(SKIN.tan), expr: face("stern", "stern", "stern") as unknown as Expr,
  acc: () => [tunic({ strap: true, worn: 0.5, tabs: "#6d6b48" }), m35({}), bushyBrows({ col: "#2e2822", weight: 4.2 }), moustache({ kind: "pencil", col: "#2e2822" }), nose()],
};

// ------------------------------------------------------------------------------------------------------- the men
/** 陈树生: only ever seen from behind */
export const CHEN: Person = { name: "chen", scale: 0.99, look: soldierLook(1916, SKIN.tan, 0.94), ...limbs(SKIN.tan), expr: face("neutral", "neutral", "stern") as unknown as Expr, acc: () => [tunic({ grenades: true, worn: 0.6 }), m35({})] };
const man = (name: string, seed: number, skin: string, o: { width?: number; scale?: number; rifle?: boolean; sack?: boolean; brows?: number; stubble?: boolean; expr?: RigFace } = {}): Person => ({
  name, scale: o.scale ?? 1, look: soldierLook(seed, skin, o.width ?? 0.96), ...limbs(skin), expr: (o.expr ?? face("neutral", "neutral", "neutral")) as unknown as Expr,
  acc: () => [tunic({ sling: true, worn: 0.6 }), m35({}), softBrows({ weight: o.brows ?? 3.2, col: HAIR }), ...(o.stubble ? [beard({ kind: "stubble", col: "#4a443e" })] : []), ...(o.rifle ? [rifle({ hand: 0 })] : []), ...(o.sack ? [sackHeld({ hand: 1 })] : [])],
});
export const MEN: Person[] = [
  man("manA", 2203, SKIN.tan, { sack: true }), man("manB", 2207, SKIN.boy, { sack: true, width: 0.9, scale: 0.97 }), man("manC", 2213, SKIN.pale, { sack: true, width: 1.02 }),
  man("manD", 2221, SKIN.tan, { rifle: true, stubble: true }), man("manE", 2237, SKIN.boy, { rifle: true, scale: 0.98 }), man("manF", 2239, SKIN.tan, { rifle: true, width: 1.05, scale: 1.02 }),
  man("manG", 2243, SKIN.pale, { width: 0.92 }), man("manH", 2251, SKIN.tan, { stubble: true, width: 1.0 }),
];
export const RUNNER: Person = man("runner", 2267, SKIN.boy, { width: 0.9, scale: 0.96 });
/** a wounded man on a stretcher (scene E): bare-headed, a bandage is the stretcher's blanket; lies down */
export const WOUNDED: Person = { ...man("wounded", 2269, SKIN.pale), acc: () => [tunic({ worn: 0.8 }), softBrows({ weight: 3, col: HAIR })] };

// ------------------------------------------------------------------------------------------------------- the south bank
const britLook = (seed: number): Look => ({ seed, skin: SKIN.brit, top: "tee", topCol: UNI.brit, bottom: "chinos", botCol: UNI.brit, shoes: "#3a2c20", shoeSole: "#221a14", hair: "short", hairCol: "#a8804a", part: 1, width: 1.0 });
export const BRIT_A: Person = { name: "britA", scale: 1.06, look: britLook(2301), limbs: { hand: SKIN.brit, arm: UNI.brit }, legs: { leg: "#8a7d58", foot: "#3a2c20" }, expr: face("neutral", "neutral", "neutral") as unknown as Expr, acc: () => [tunic({ col: UNI.brit, brit: true, worn: 0.1, tabs: false, belt: "#b7a98a" }), brodie({}), moustache({ kind: "walrus", col: "#a8804a" })] };
export const BRIT_B: Person = { ...BRIT_A, name: "britB", scale: 1.04, look: britLook(2311), acc: () => [tunic({ col: UNI.brit, brit: true, worn: 0.1, tabs: false, belt: "#b7a98a" }), brodie({})] };
const civ = (name: string, seed: number, o: { col: string; deep: string; hat?: string | false; lady?: boolean; specs?: boolean; scale?: number; hair?: Look["hair"] }): Person => ({
  name, scale: o.scale ?? (o.lady ? 0.94 : 1.0),
  look: { seed, skin: SKIN.pale, top: o.lady ? "cardigan" : "jacket", topCol: o.col, inner: "#e8e2d2", bottom: o.lady ? "skirt" : "chinos", botCol: o.deep, shoes: "#2e2622", shoeSole: "#1c1714", hair: o.hair ?? (o.lady ? "bob" : "short"), hairCol: HAIR, part: 1, width: o.lady ? 0.86 : 0.96 },
  expr: face("neutral", "neutral", "sad") as unknown as Expr,
  acc: () => [...(o.hat ? [fedora({ col: o.hat })] : []), ...(o.specs ? [glasses({ kind: "round" })] : []), softBrows({ weight: 3, col: HAIR })],
});
/** the fellow reporter who shouts the last question (a felt hat, round glasses) */
export const NEWSMAN: Person = civ("newsman", 2401, { col: "#6a6558", deep: "#4c483f", hat: "#7a6f5c", specs: true });
export const CIVS: Person[] = [
  civ("civA", 2411, { col: "#55606b", deep: "#3f4750", hat: "#4f4a44" }), civ("civB", 2417, { col: "#7b4f4a", deep: "#4a3a3e", lady: true }),
  civ("civC", 2423, { col: "#5f6a52", deep: "#454c3e", hat: false, scale: 0.92, hair: "side" }), civ("civD", 2437, { col: "#4a5a6e", deep: "#39424f", lady: true, hair: "bun" }),
  civ("civE", 2441, { col: "#6e6250", deep: "#4a4338", hat: "#5c5244" }),
];

export const PEOPLE = {
  mancang: MANCANG, mancangSack: MANCANG_SACK, mancangRifle: MANCANG_RIFLE, mancangBare: MANCANG_BARE, lao: LAO, laoRifle: LAO_RIFLE, xie: XIE, xieCap: XIE_CAP, yang: YANG, chen: CHEN,
  runner: RUNNER, wounded: WOUNDED, britA: BRIT_A, britB: BRIT_B, newsman: NEWSMAN,
  ...Object.fromEntries(MEN.map((m) => [m.name, m])), ...Object.fromEntries(CIVS.map((m) => [m.name, m])),
} as Record<string, Person>;
/** FACES by name. 满仓: bright (resting), proud, awe, shy, think, hurt, shout, steady, sorrow. 老班长: dry (resting),
 *  alert, kind, heavy. Officers: calm, hard. */
export const FACES: Record<string, Expr | RigFace> = {
  bright: face("smile", "smile", "neutral"), proud: face("smile", "grin", "neutral"), awe: face("neutral", "whistle", "sad", "neutral"), shy: face("smile", "nervous", "sad", "relief"),
  think: face("focus", "neutral", "focus", "neutral"), hurt: face("neutral", "sad", "sad", "neutral"), shout: face("stern", "shock", "stern", "neutral"), steady: face("neutral", "smile", "neutral"),
  sorrow: face("sad", "sad", "sad", "neutral"), stunned: face("shock", "neutral", "sad", "neutral"), grinShout: face("smile", "laugh", "neutral"),
  dry: face("deadpan", "neutral", "neutral"), alert: face("stern", "neutral", "stern", "neutral"), kind: face("deadpan", "smile", "sad", "neutral"), heavy: face("deadpan", "sad", "sad", "neutral"), halfLaugh: face("deadpan", "smug", "sad", "neutral"),
  calm: face("neutral", "neutral", "neutral"), hard: face("stern", "stern", "stern"), grave: face("neutral", "neutral", "sad", "neutral"),
};

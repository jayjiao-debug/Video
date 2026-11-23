// THE CAST of 采访蒙娜丽莎的一天 (look test, 23 Nov 2026): one figure on the kit's rig3d cast.
//   MONA   Lisa Gherardini as Leonardo painted her (Louvre INV 779): the smile, heavy lids and no brows (acc/face.ts);
//          dark hair parted in the middle under a fine veil, falling in loose ringlets to her chest (acc/hair.ts); a
//          dark green gown with a gathered neck and a gold braid, mustard sleeves, a dark mantle rolled over her left
//          shoulder (acc/garb.ts); her right hand laid over her left wrist.
// Each Person is Wanbi's type (a kit Look made once + accessories + scale + resting face).
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigFace } from "../group/kit/rig3d";
import { addPerson as addKitPerson, type Person as KitPerson } from "../wanbi/people";
import { limbColours, napeHair } from "../su/acc/figure";
import { robe } from "../../kit/acc/garb";
import { monaFace, type MonaFaceO } from "./acc/face";
import { veilHair, ringlets } from "./acc/hair";
import { monaGown } from "./acc/garb";
import { monaSleeves } from "./acc/sleeves";
import type { ShellO } from "../romeo/acc/hair";
import { backFall } from "../romeo/acc/backhair";

export type Person = KitPerson & { limbs?: { hand?: string; arm?: string }; nape?: boolean; /** her hands' size, as a multiple of the kit's ball hand */ handK?: number; hideArms?: boolean };
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addKitPerson(rc, p);
  if (p.limbs) limbColours(r, p.limbs);
  if (p.nape) napeHair(r, p.look);
  // (the hand mesh carries its own ink hull as a child: both grow together; the rig only moves it)
  r.group.userData.monaArmMats = (r as unknown as { armMats?: unknown }).armMats;   // (acc/sleeves.ts: a sleeve follows its arm in front of the head)
  // (sleeves that dress the whole arm: the rig's own tube and its ink line under them are not drawn, or the tube's
  //  ink shows as a second dark arm beside a thin sleeve)
  if (p.hideArms) for (const a of ((r as unknown as { armMats?: { visible: boolean }[][] }).armMats ?? [])) { if (a[0]) a[0].visible = false; if (a[2]) a[2].visible = false; }
  if (p.handK) for (const h of (r as unknown as { hands?: { scale: { setScalar(k: number): void } }[] }).hands ?? []) h.scale.setScalar(p.handK);
  return r;
}

/** her colours, off the panel (never pure black: the line stays the darkest thing) */
export const COL = {
  /** the skin: old ivory under yellowed varnish */
  skin: "#f7e3c6",
  hair: "#4a2c1a", hairLight: "#8a5a30", hairDeep: "#2a1810", veil: "#2e2118",
  gown: "#3c4630", gownDeep: "#262d20", braid: "#c79a3c", sleeve: "#b8873a", sleeveDeep: "#7c5622", mantle: "#2f3326",
} as const;

const face = (eyesE: Expr, mouth: Expr, browsE: Expr, marks?: Expr): RigFace => ({ eyes: eyesE, mouth, brows: browsE, marks: marks ?? browsE });

const MONA_LOOK: Look = {
  seed: 1503, skin: COL.skin, top: "tee", topCol: COL.gown, bottom: "chinos", botCol: COL.gownDeep, shoes: "#3a2a20", shoeSole: "#22181a",
  hair: "bob", hairCol: COL.hair, part: 1, width: 1.18,
  head: { nTop: 2.05, nBot: 2.1, egg: -0.03, asym: 0.01 },
};
/** her crown under the veil: a high bare forehead, the edge (the veil's hem) arched over it and coming down past the
 *  temples; sleek, with little volume; parted in the middle; no fringe, no shine ring */
export const MONA_HAIR: ShellO = {
  // (v5, after the owner's note on the straight hairline: the hair parts at the middle and sweeps down to each temple
  //  in one soft curve, like two curtains; two wide shallow "locks" bend the shell's level front edge into that curve)
  front: 0.66, temple: 0.38, side: 0.33, back: -0.84, locks: [{ a: -45, w: 45, len: 0.11 }, { a: 45, w: 45, len: 0.11 }],
  thF: 0.05, thS: 0.1, thB: 0.12, top: 1.13, featherF: 9, edge: 0.012,
  col: COL.hair, light: COL.hairLight, deep: COL.hairDeep, ring: null, part: 0, hat: 52, sideTo: 100, backFrom: 128,
};
export type MonaO = { face?: MonaFaceO; skin?: string; gauze?: number; /** the sleeves' thickness: the upper arm's radius in metres */ sleeve?: number; /** the hands' size against the kit's */ hand?: number };
export const mona = (o: MonaO = {}): Person => ({
  name: `mona${Object.keys(o).length ? "_" + JSON.stringify(o) : ""}`, scale: 1.0, look: o.skin ? { ...MONA_LOOK, skin: o.skin } : MONA_LOOK, limbs: { hand: o.skin ?? COL.skin, arm: COL.sleeve }, nape: true, handK: o.hand ?? 1, hideArms: true,
  expr: face("smile", "smile", "neutral") as unknown as Expr,
  acc: (): Acc[] => [robe({ col: COL.gown, band: COL.gownDeep, sash: false }), monaGown({ col: COL.gown, skin: o.skin ?? COL.skin, braid: COL.braid, mantle: COL.mantle }), monaSleeves({ col: COL.sleeve, deep: COL.sleeveDeep, thick: o.sleeve ?? 0.0135 }),
    veilHair({ shell: MONA_HAIR, skin: o.skin ?? COL.skin, gauze: o.gauze ?? 0, tint: 0.85 }), ringlets({ col: COL.hair, light: COL.hairLight, deep: COL.hairDeep }),
    backFall({ col: COL.hair, light: COL.hairLight, deep: COL.hairDeep, ring: COL.hair, n: 5, notchMid: 1.7, notchSide: 1.45, tips: [0.2, 0.16, 0.12] }),
    monaFace({ veil: false, ...o.face })],
});
export const MONA: Person = mona();

export const PEOPLE: Record<string, Person> = { mona: MONA, monaFull: mona({ sleeve: 0.046, hand: 1.3 }), monaSlim: mona({ sleeve: 0.034, hand: 1.2 }), monaStick0: mona({ sleeve: 0.0105, hand: 1 }), monaThin: mona({ sleeve: 0.025, hand: 1.1 }), monaPanel: mona({ face: { style: "panel" }, skin: "#f1dcae" }), monaGauze: mona({ gauze: 5.5, face: { veil: false } }), monaCracks: mona({ face: { cracks: 1 } }) };
export type PersonKey = keyof typeof PEOPLE;
/** FACES by name (preview: expr "<name>") */
export const FACES: Record<string, Expr | RigFace> = {
  /** THE SMILE (on duty): her resting face */
  pose: face("smile", "smile", "neutral"),
  /** off duty */
  plain: face("neutral", "neutral", "neutral"), tired: face("deadpan", "speechless", "sad", "neutral"), sore: face("pained", "gloom", "sad", "neutral"), sigh: face("sigh", "sigh", "sad", "neutral"),
  caught: face("shock", "shock", "shock", "neutral"),
};
export const hairTest = (hair: Look["hair"], seed = 1503): Person => ({ name: `hair_${hair}_${seed}`, look: { ...MONA_LOOK, seed, hair }, acc: () => [] });

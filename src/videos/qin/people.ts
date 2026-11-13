// THE CAST of the Qin film (PLAN 2, bible 1). WP3. Each Person is Wanbi's type (a kit Look made ONCE + its
// accessories + scale + resting face), Wanbi's people.ts is the model (its addPerson / personalise are re-exported).
//   EMPEROR (EMPEROR_BLUSH1, EMPEROR_BLUSH2, EMPEROR_HOOD, EMPEROR_HOOD_BLUSH1)  XUFU  BOSHI  HUANGUAN  GUARD  ATTENDANT
//   OFFICIAL  BANDIT  TERRACOTTA  DAGE_CLAY;  PEOPLE = all by key;  SPEAKER_PERSON = who plays each speaker;
//   emperorAt(f, keys) = which emperor figure plays frame f;  addPerson(rc, p) -> Rig
// (the same Person object every time: World.actor caches the figure per Person; four guards = World.actor(GUARD, "1") ..)
// WHO IS WHO AT A GLANCE (one silhouette feature + one colour each, told apart at phone size on the line-up,
// preview/people_lineup.ts):
//   秦始皇   stout, 1.08 x everyone; BLACK robe with a thin RED collar band and a red sash; the flat crown board (冕) with
//            gold bead fringes over his head (Wanbi's mianCrown); goatee + upturned moustache; the sword at his LEFT hip
//            (black lacquer scabbard, gold hilt: acc/sword.ts qinSword); resting face stern
//   (blush)  the same, a pink blush on the cheeks (acc/blush.ts): BLUSH1 light 0.45, BLUSH2 strong 0.9
//   (hood)   the night disguise: a dark grey-violet hood with a soft point and a short cape, a plain grey-brown robe with
//            a rope-coloured sash; five gold bead strings poke out under the hood's front edge (acc/hood.ts hoodBeads:
//            hide: ["hoodBeads"] once he has shoved them in, F05); the sword stays at his hip
//   徐福     slim and tall-hatted: a VIOLET robe with gold band and sash, the tall black scholar's cap with a gold band,
//            a pencil moustache and a small goatee; resting face smug (the salesman's grin)
//   博士     old: grey hair, a long WHITE beard and walrus moustache, a pale cream-grey robe with a black sash, the black
//            flat cap (the only drum-shaped cap); resting face deadpan
//   宦官     round, beardless, pale; an OLIVE robe with a cream band, the soft black round cap; resting face smile
//   卫兵     charcoal ARMOUR with an ochre sash, a grey round helmet with a leather neck guard, a halberd in hand 1
//   侍从     small; a plain grey-brown robe, a brown cloth wrapped over his topknot (they kneel in rows)
//   大臣     a charcoal robe with a gold sash, the black GABLE cap, a full black beard; slips in hand (props "slips")
//   强盗     a short BROWN robe to the knees, a brown head cloth, a dark cloth over the nose and mouth (acc/mask.ts),
//            heavy brows; the only masked faces
//   兵马俑   all CLAY (skin, hair, armour, sash, shoes): armour, a clay topknot, an upturned clay moustache; neutral
//   大哥     in clay among them (the rig's DAGE look recoloured, in the same clay armour): his square jaw, short hair and
//            the finger at his lips (expr "hush", pose { kind: "shh" }) give him away; small, at the edge of a row
// NOTES FOR SHOT BUILDERS (as Wanbi's):
//   - Everybody is 1.45 m tall, except the EMPEROR (Person.scale 1.08: he looks down into her lens). addPerson makes a
//     scaled figure behave like any other: give it world places (at, seat, hands), read world places back (headWorld,
//     handWorld, elbowWorld, footWorld). Hand targets in HIS frame are multiplied by 1.08 (acc/sword.ts does it).
//   - Person.expr is a figure's RESTING face: it replaces "neutral" (and no expr at all). The EMPEROR's is "stern".
//   - Expressions: only what RIG_EXPRS in group/kit/rig3d.ts has (neutral, smile, happy, grin, laugh, smile_closed,
//     relief, smug, deadpan, focus, stern, huff, sad, sigh, nervous, shock, dazed, pained, wince, sleep, cool, hush ..):
//     startled = shock; rage (暴怒, E07) = huff + a head shake; tsundere pleased = stern + EMPEROR_BLUSH1 (smile_closed
//     draws its own blush: never with BLUSH2); cold menace (D05) = stern or cool, no blush; nodding off = sleep.
//   - Faces never turn to profile (FACE_MAX 12 deg): "turning away" = a body turn / back view (turn: 1), the gaze, a tilt.
//   - THE SWORD (acc/sword.ts): the scabbard hangs low at his left hip, angled back; keep his left hand out of it in
//     poses (it rests beside it). hide: ["hilt"] while the world prop "sword" is in his hand; hide: ["swordBelt",
//     "hilt"] when he sits on the floor or at the desk (put props "scabbard" beside him). The draw: swordDraw().
//   - AT THE DESK: props/index.ts deskSeat(QHALL.desk) = the cushion's place and the RigSeat + facing for "write" /
//     "sit" (seat top 0.12 on the cushion, desk top 0.42: rig QA reach 0, clear >= 0; QHALL.sit is the same point).
//     The crossbow in both hands: PROP_INFO crossbow gives a hold that passes rig QA.
//   - The guards hold the halberd in hand 1: pin that hand (shots/common.ts halberdHand), never let it hang. Keep them
//     to idle, walk, point (the shaft crosses the face in hold and haul).
//   - Accessories hide by name (state.hide): "mianCrown", "qinHood", "hoodBeads", "swordBelt", "hilt", "scholarCap",
//     "flatCap", "roundCap", "officerCap", "helmet", "halberd", "topknot", "headCloth", "robe" / "armour" (the 3D
//     skirt only: the painted garment stays). A hidden hat leaves the look's buzz hair.
//   - ji (小记者) is the camera: she has no figure.
// BLUSH SWAPS (PLAN 2, 7; the bible's tic 1 "blush, look away, 哼"): a blush is part of the face drawing, so a rising
// blush is a SWAP of figures with one Look (body, robe, face the same), each change under a blink: w.actor(emperorAt(f,
// KEYS)) with blink: lid(t, id, swaps(KEYS)) (shots/common.ts). Which level where (line ids of voice.ts):
//   A05 she offers to help while he still struggles with the stuck sword -> "plain"; on the blink just before 帮 (her
//       "help", tug 4) -> "blush1" (住口 follows with the blush)
//   A11 "千古一帝" lands -> A12 pre (he looks away, straightens the crown, "咳。拍好看点。") -> "blush2"; back to
//       "blush1" once his back is to the lens in A13, "plain" by the cut
//   B07 "呵" (smug) -> "plain"; B09 "这句，留着。" (eyes away) -> "blush1" (stern or smile_closed with it)
//   C, D, E -> "plain" (D is serious: no blush ever; E07's rage is huff, no blush)
//   F01 he puts the hood on -> "hood"; F05 "嘘！" (shoves the beads in: hide ["hoodBeads"] from here) -> "hoodBlush1";
//       F07-F09 "刚才，朕没有吓到 ... 那段，删了" -> "hoodBlush1" (glances at the lens)
//   G: he is only a voice
import * as THREE from "three";
import type { Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast } from "../group/kit/rig3d";
import { classmate, friend } from "../group/kit/cast";
import { moustache } from "../group/kit/rigacc";
import { DAGE, chiselled } from "../group/kit/rigacc/dage";
import { finger } from "../group/kit/rigacc/finger";
import { topknot, scholarCap, flatCap, helmet, officerCap } from "../../kit/acc/headwear";
import { robe, armour } from "../../kit/acc/garb";
import { beard, swordBrows } from "../../kit/acc/facehair";
import { halberd } from "../../kit/acc/held";
import { QIN_WANG, addPerson as addKitPerson, personalise, type Person } from "../wanbi/people";
import { mianCrown } from "../wanbi/acc/crown";
import { roundCap } from "../wanbi/acc/envoy";
import { headCloth } from "../wanbi/acc/bundle";
import { blush, BLUSH } from "./acc/blush";
import { hood, hoodBeads } from "./acc/hood";
import { qinSword } from "./acc/sword";
import { banditCloth } from "./acc/mask";
import type { Speaker } from "./voice";

export { personalise, blush, BLUSH, type Person };

// ---------------------------------------------------------------------------------------------------- miniatures
/** A figure smaller than this (Person.scale) is a MINIATURE (the tiny emperor on the sand table, 0.08-0.085). */
export const MINI_BELOW = 0.5;
/** Adds the figure to the cast (Wanbi's addPerson: accessories, rim light, resting face, size) and fixes what does not
 *  follow Person.scale on a miniature. The rig's ink hulls are pushed out along the view-space normal by a width in
 *  METRES (rig3d.ts hullMat uW: 1.75 cm on the body, 2.1 cm on the head, 1.1 cm on a prop part) and the head's curls
 *  sit 3 cm behind the ball (curlPullU / curlDepthU): personalise scales the figure's drawing, not those. At 1.08 that
 *  is invisible; at the table's 0.08 the 1.75 cm hull is 12 x too thick and, wobbled by the brush, swallows the figure
 *  in a puffy ink blob much wider than his head (WP5 review, "why is the figure black"). Here every hull of a miniature
 *  is drawn at its width x scale (its line then has the weight it has at full size, at least the rig's 1.6 px) and
 *  the curls' pull and depth offset are scaled too. Every other figure is built exactly as before. */
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addKitPerson(rc, p), s = p.scale ?? 1;
  if (s < MINI_BELOW) miniInk(r, s);
  return r;
}
type InkU = { value: number };
/** the rig's private uniforms a miniature's fix touches (rig3d.ts Rig: pullU / curlPullU, depthU / curlDepthU) */
type RigInner = { _update: (cam: THREE.Camera) => void; curlPullU: InkU; depthU: InkU; curlDepthU: InkU };
const miniInk = (r: Rig, s: number) => {
  // the hulls: every material made by rig3d.ts hullMat (its program key "rig3-hull"), on the body, limbs, head and
  // every accessory part; the width uniform is the hull's own (each hull mesh has a material of its own)
  let n = 0;
  r.group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
      if (mat.userData.qinMiniInk || mat.customProgramCacheKey() !== "rig3-hull") continue;
      mat.userData.qinMiniInk = s;
      const base = mat.onBeforeCompile;
      // (a new uniform object from the rig's own value every compile: a recompile never scales it twice)
      mat.onBeforeCompile = function (this: THREE.Material, sh, renderer) {
        base.call(this, sh, renderer);
        const u = sh.uniforms as Record<string, InkU | undefined>;
        if (u.uW) u.uW = { value: u.uW.value * s };
      };
      mat.needsUpdate = true;
      n++;
    }
  });
  if (!n) console.warn(`[qin people] miniature ${r.group.name || "figure"}: no rig3-hull ink found (rig3d.ts changed?): its ink is not scaled`);
  const rr = r as unknown as RigInner;
  rr.curlPullU.value *= s;
  const up = rr._update;
  rr._update = (cam: THREE.Camera) => { up(cam); rr.curlDepthU.value = rr.depthU.value - 0.03 * s; };
};
/** a miniature of a Person (a figure of its own: World caches one figure per Person): the same look and accessories at
 *  `scale` (< MINI_BELOW: addPerson scales its ink). The sand table's tiny emperor: miniature(EMPEROR, "emperorTinyC", 0.085) */
export const miniature = (p: Person, name: string, scale: number): Person => ({ ...p, name, scale });

const HAIR = "#1f1c22";
/** the film's colours (never pure black: the ink must stay the darkest thing; nothing brighter than #f4f1ea) */
export const COL = {
  robe: "#36323d",          // the EMPEROR's black robe (kept off black, as Wanbi's King of Qin)
  red: "#b8322a",           // its thin red collar band
  redSash: "#9e2a24",       // its red sash
  gold: "#e2b03a",
  inkBlack: "#2a2630",
  plain: "#5a5058", plainBand: "#463e46", rope: "#9a8460",            // the night disguise's plain robe
  hood: "#3b3644",
  xufu: "#6b5b9a", boshi: "#cfc6ae", boshiBand: "#a39a82", huanguan: "#6a7458", huanguanBand: "#d8cfae",
  attendant: "#8a7c6c", attendantCloth: "#5e5044", official: "#4a4652",
  armour: "#4a4f5e", ochre: "#b08a3c", helmet: "#8a8a92",
  bandit: "#7a5a3c", banditCloth: "#4e3a2a", banditMask: "#3e322c",
  clay: "#b48c6a", clayLo: "#94704f", clayHi: "#c8a07c", clayInk: "#7a5a40",
  grey: "#9a968f", white: "#eeeae2",
} as const;
const S_FAIR = "#f6d9bd", S_PALE = "#fbe7d3", S_TAN = "#efc9a4", S_OLD = "#e0b088", S_WEATHER = "#e6b994";

/** a Qin look from a kit look: its head (seed), skin and build stay; a plain top under the garment, dark cloth shoes,
 *  black hair tied up (the kit's "buzz"); nothing modern is carried over (Wanbi's han()) */
const han = (from: Look, o: Partial<Look> & { topCol: string }): Look => ({
  seed: from.seed, skin: from.skin, part: from.part, width: from.width,
  top: "tee", bottom: "chinos", botCol: "#3a3440", shoes: "#2d2a30", shoeSole: "#1f1c22", hair: "buzz", hairCol: HAIR,
  ...o,
});

// ---------------------------------------------------------------------------------------------------- the emperor
/** the EMPEROR's one look (every swap shares it): Wanbi's King of Qin's body and face */
const EMP_LOOK: Look = QIN_WANG.look;
const empRobe = () => robe({ col: COL.robe, band: COL.red, sash: COL.redSash });
const empFace = (): Acc[] => [beard({ kind: "goatee", col: HAIR }), moustache({ kind: "handlebar", col: HAIR })];
const emperor = (name: string, extra: Acc[] = []): Person => ({ name, scale: 1.08, expr: "stern", look: EMP_LOOK, acc: () => [empRobe(), ...empFace(), mianCrown(), ...qinSword(), ...extra] });
/** 秦始皇: Wanbi's King of Qin re-dressed (see the head of this file); 1.08 x; resting face stern */
export const EMPEROR: Person = emperor("emperor");
/** the same with a light blush (0.45): swap on a blink */
export const EMPEROR_BLUSH1: Person = emperor("emperorBlush1", [blush(BLUSH.light)]);
/** the same with a strong blush (0.9) */
export const EMPEROR_BLUSH2: Person = emperor("emperorBlush2", [blush(BLUSH.strong)]);
const hoodRobe = () => robe({ col: COL.plain, band: COL.plainBand, sash: COL.rope });
const hooded = (name: string, extra: Acc[] = []): Person => ({ name, scale: 1.08, expr: "stern", look: EMP_LOOK, acc: () => [hoodRobe(), ...empFace(), hood({ col: COL.hood }), hoodBeads(), ...qinSword(), ...extra] });
/** the night disguise (F): the plain robe, the hood with the crown's beads poking out (hide: ["hoodBeads"] = shoved in) */
export const EMPEROR_HOOD: Person = hooded("emperorHood");
/** the night disguise with the light blush (F05 on) */
export const EMPEROR_HOOD_BLUSH1: Person = hooded("emperorHoodBlush1", [blush(BLUSH.light)]);

// ---------------------------------------------------------------------------------------------------- the others
/** 徐福 the 方士: a smooth salesman in a violet robe with gold, the tall scholar's cap, a pencil moustache and a small
 *  goatee; resting face smug */
export const XUFU: Person = {
  name: "xufu", expr: "smug", look: han(classmate(19), { width: 0.92, skin: S_FAIR, topCol: COL.xufu }),
  acc: () => [robe({ col: COL.xufu, band: COL.gold, sash: COL.gold }), moustache({ kind: "pencil", col: HAIR }), beard({ kind: "goatee", col: HAIR, len: 0.8 }), scholarCap({ band: COL.gold, pin: COL.gold, tall: 1.3 })],
};
/** 博士 the old scholar: grey hair, a long white beard, a pale cream-grey robe, the black flat cap; resting face deadpan */
export const BOSHI: Person = {
  name: "boshi", expr: "deadpan", look: han(classmate(42), { width: 1.0, skin: S_OLD, hairCol: COL.grey, topCol: COL.boshi }),
  acc: () => [robe({ col: COL.boshi, band: COL.boshiBand, sash: COL.inkBlack }), beard({ kind: "long", col: COL.white }), moustache({ kind: "walrus", col: COL.white }), flatCap({ col: COL.inkBlack, band: "#5a5462" })],
};
/** 宦官 the eunuch at the carriage's curtain: round, beardless, pale; an olive robe, the soft black round cap */
export const HUANGUAN: Person = {
  name: "huanguan", expr: "smile", look: han(classmate(64), { width: 1.18, skin: S_PALE, topCol: COL.huanguan, head: { nTop: 2.2, nBot: 2, egg: 0.12 } }),
  acc: () => [robe({ col: COL.huanguan, band: COL.huanguanBand, sash: COL.inkBlack }), roundCap()],
};
/** 卫兵 (x4: actor(GUARD, "1") ..): charcoal armour, ochre sash, grey helmet, a halberd in hand 1 (Wanbi's QIN_GUARD) */
export const GUARD: Person = {
  name: "guard", look: han(classmate(5), { width: 1.06, skin: S_FAIR, topCol: COL.armour }),
  acc: () => [armour({ col: COL.armour, trim: "#8a8fa0", sash: COL.ochre }), halberd({ hand: 1, lift: 0.05 }), helmet({ col: COL.helmet })],
};
/** 侍从 (x5, they kneel): small; a plain grey-brown robe, a brown cloth over the topknot */
export const ATTENDANT: Person = {
  name: "attendant", look: han(friend(7), { width: 0.92, skin: S_FAIR, topCol: COL.attendant }),
  acc: () => [robe({ col: COL.attendant, band: "#6a5e50", sash: "#6a5e50" }), topknot({ band: false, pin: false, size: 0.85, cloth: COL.attendantCloth })],
};
/** 大臣 (x4, queue with slips): a charcoal robe, gold sash, the black gable cap, a full black beard */
export const OFFICIAL: Person = {
  name: "official", look: han(classmate(8), { width: 1.0, skin: S_TAN, topCol: COL.official }),
  acc: () => [robe({ col: COL.official, band: COL.inkBlack, sash: COL.gold }), beard({ kind: "full", col: HAIR }), moustache({ kind: "walrus", col: HAIR }), officerCap({ col: COL.inkBlack, band: COL.gold })],
};
/** 强盗 (x3): a short brown robe, a head cloth, a dark cloth over the nose and mouth, heavy brows */
export const BANDIT: Person = {
  name: "bandit", look: han(classmate(3), { width: 1.04, skin: S_WEATHER, topCol: COL.bandit }),
  acc: () => [robe({ col: COL.bandit, band: COL.banditCloth, sash: COL.banditCloth, skirt: "short", knot: false }), headCloth({ col: COL.banditCloth }), banditCloth({ col: COL.banditMask }), swordBrows({ weight: 6.5, down: 2.4, rise: 3.0, len: 1.1 })],
};
/** the clay of the warriors: every colour of the figure (skin, hair, clothes, shoes) */
const clayLook = (from: Look): Look => ({ ...from, skin: COL.clayHi, topCol: COL.clay, botCol: COL.clayLo, hairCol: COL.clayLo, shoes: COL.clayLo, shoeSole: COL.clayInk });
const clayArmour = () => armour({ col: COL.clay, trim: COL.clayHi, sash: COL.clayLo, under: COL.clayLo });
/** 兵马俑: an all-clay armoured figure, neutral face (the museum rows) */
export const TERRACOTTA: Person = {
  name: "terracotta", expr: "neutral",
  look: clayLook(han(classmate(5), { width: 1.06, topCol: COL.clay })),
  acc: () => [clayArmour(), topknot({ band: false, pin: false, size: 0.95, back: 18 }), moustache({ kind: "handlebar", col: COL.clayInk })],
};
/** 大哥 in clay, hidden once among the warriors: the rig's DAGE look recoloured clay, in the warriors' clay armour; his
 *  stubble and finger in clay too. ALWAYS expr "hush", pose { kind: "shh" } (group/kit/rigacc/dage.ts; seen from his
 *  right, use DAGE_CLAY_R with pose { kind: "shh", arm: 0 }) */
export const DAGE_CLAY: Person = {
  name: "dageClay", expr: "hush", look: clayLook(DAGE),
  acc: () => [clayArmour(), chiselled({ shade: "rgba(110,72,44,0.26)", cleft: false }), finger({ hand: 1, col: COL.clayHi })],
};
/** the same with the finger in his RIGHT hand (seen from his right: pose { kind: "shh", arm: 0 }) */
export const DAGE_CLAY_R: Person = { ...DAGE_CLAY, name: "dageClayR", acc: () => [clayArmour(), chiselled({ shade: "rgba(110,72,44,0.26)", cleft: false }), finger({ hand: 0, col: COL.clayHi })] };

// ---------------------------------------------------------------------------------------------------- tables
/** every Person by its key */
export const PEOPLE = {
  emperor: EMPEROR, emperorBlush1: EMPEROR_BLUSH1, emperorBlush2: EMPEROR_BLUSH2, emperorHood: EMPEROR_HOOD, emperorHoodBlush1: EMPEROR_HOOD_BLUSH1,
  xufu: XUFU, boshi: BOSHI, huanguan: HUANGUAN, guard: GUARD, attendant: ATTENDANT, official: OFFICIAL, bandit: BANDIT,
  terracotta: TERRACOTTA, dageClay: DAGE_CLAY, dageClayR: DAGE_CLAY_R,
} satisfies Record<string, Person>;
export type PersonKey = keyof typeof PEOPLE;
/** who plays each speaker (ji, the interviewer, is the camera: null) */
export const SPEAKER_PERSON: Record<Speaker, Person | null> = { ji: null, di: EMPEROR, xufu: XUFU, boshi: BOSHI, huanguan: HUANGUAN };
/** every Person the film uses, for a line-up */
export const ALL_PEOPLE: Person[] = Object.values(PEOPLE);
/** one figure per role (the line-up's phone-size and silhouette tests: no swaps) */
export const NAMED: Person[] = [EMPEROR, XUFU, BOSHI, HUANGUAN, GUARD, ATTENDANT, OFFICIAL, BANDIT, TERRACOTTA, DAGE_CLAY];
/** the EMPEROR's swaps (one Look) */
export const EMPEROR_SWAPS: Person[] = [EMPEROR, EMPEROR_BLUSH1, EMPEROR_BLUSH2, EMPEROR_HOOD, EMPEROR_HOOD_BLUSH1];

/** the emperor's states for emperorAt: plain, the two blushes, the hood, the hood with the light blush */
export type EmpState = "plain" | "blush1" | "blush2" | "hood" | "hoodBlush1";
export const EMP_BY: Record<EmpState, Person> = { plain: EMPEROR, blush1: EMPEROR_BLUSH1, blush2: EMPEROR_BLUSH2, hood: EMPEROR_HOOD, hoodBlush1: EMPEROR_HOOD_BLUSH1 };
/** WHICH EMPEROR PLAYS FRAME f: step keys [frame, state] (the first key's state before it). Show it with
 *  w.actor(emperorAt(f, KEYS)) and hide each change under a blink: blink: lid(f / FPS, id, swaps(KEYS)) (shots/common.ts).
 *    const KEYS: [number, EmpState][] = [[S.from, "plain"], [capWord("A05", "帮").from - 3, "blush1"], [BEAT.A.blush, "blush2"]];
 *  The notes on which level goes where: "BLUSH SWAPS" at the head of this file. */
export const emperorAt = (f: number, keys: [number, EmpState][]): Person => {
  let s = keys[0][1];
  for (const [k, x] of keys) if (f >= k) s = x;
  return EMP_BY[s];
};

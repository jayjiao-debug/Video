// THE CAST of the Wanbi film (完璧归赵), BIBLE section 5. Each Person = a kit Look (made ONCE: a look's identity keys
// cached drawings) + the accessories that make the role readable at a glance: the shared kit's wardrobe
// (src/kit/acc: robe, armour, caps, beards, halberd) and the film's own (acc/envoy.ts envoyCap, rageHair, roundCap;
// acc/crown.ts mianCrown, chinBeard; acc/lady.ts ladyBun, ladyFace; acc/held.ts whisk; acc/bundle.ts bundle,
// headCloth). WP4; Hongmen's people.ts is the model.
//   ZHAO = TEAL + CREAM:  LIN (LIN_RAGE, LIN_OFFICIAL)  ZHAO_WANG  MIAO_XIAN  ZHAO_MIN_A/B  SERVANT (SERVANT_ROUGH)
//   QIN  = BLACK + GOLD:  QIN_WANG  LADY_A/B  QIN_MIN_A/B/C  QIN_USHER  QIN_GUARD (QIN_GUARD_B)
//   ROLES = the roles with their side and name;  PEOPLE = the same by key;  addPerson(rc, p) -> Rig
// (the same Person object every time: World.actor caches the figure per Person; a second figure of one Person =
//  World.actor(P, key))
// Who is who at a glance (ONE silhouette feature each, BIBLE 5; told apart at 100 px and as black silhouettes on the
// line-up, preview/people_lineup.ts):
//   蔺相如  slim; the ONLY bright-teal robe in the Qin hall (cream band and sash); a soft black cloth wrap over his
//          topknot (its bump on the crown) with two short LIMP ends at the back; a thin pencil moustache, no beard
//   (rage)  the same, with his hair standing up in seven spiky tufts that lift the wrap 0.13 m and cock it 8 deg, and
//          heavy sword brows (LIN_RAGE: frames 0-107, 803-924, 1253-1271)
//   (promoted) the same robe with a GOLD band and sash and the tall black official's cap with a gold band and pin:
//          the tallest hat of the film (LIN_OFFICIAL, from 2061)
//   秦王   stout and 1.08 x everyone; black robe, gold band, wide gold sash; the FLAT CROWN BOARD over his head with
//          short gold bead fringes that end above his brows; an upturned moustache and a goatee; resting face smug
//   赵王   plump; deep-teal robe, gold band and sash; a small GOLD crown on his topknot with a gold pin; a short beard
//          on the chin only (no sideburns: the kit's short beard ringed his face in black and read as a hood)
//   缪贤   round and plump, round jaw, BEARDLESS; sage-cream robe, teal sash; a soft black ROUND cap; a white horsetail
//          whisk in his left hand; resting face smile
//   美人   the only women: long hair framing the face, ONE low bun at the nape with a single plain gold pin; two lash
//          strokes per eye and a rose mouth (ladyFace); peach (A) and pink (B) long robes with a BLACK sash; slim;
//          resting face smile_closed (the blush)
//   秦国大臣 charcoal robes, gold sash, black GABLE caps; A a long grey beard, B a full black beard, C a thin moustache
//   傧     the usher: a minister's charcoal robe with a gold-edged black sash, black gable cap, clean-shaven, young
//   卫兵   charcoal armour, ochre sash, grey helmet, a halberd
//   赵国大臣 grey-green robes, teal sash; A the tall scholar's cap and a short beard, B a flat cap and a grey beard
//   随从   small; a short pale teal-grey robe and a plain topknot; then (SERVANT_ROUGH) ROUGH BROWN hemp, a brown
//          head-cloth and a cloth bundle on his back: the only brown figure
// Notes for shot builders:
//   - Everybody is 1.45 m tall, except the King of Qin (Person.scale 1.08). addPerson makes a scaled figure behave
//     like any other: give it world places as always (at, seat, hands) and read world places back (headWorld,
//     handWorld, elbowWorld, footWorld); it is scaled about the ground point under it. Only rig.dim and rig.qa stay
//     in the figure's own unscaled metres.
//   - Person.expr is a figure's RESTING face: it replaces "neutral" (and no expr at all). The King of Qin's is
//     "smug", the eunuch's "smile", the ladies' "smile_closed", the enraged envoy's "huff". Any other expression
//     shows as given ("deadpan" is the nearest to a plain face).
//   - Robes and armour have a 3D skirt; its ground is set by the World every frame (the seat's floor for a sitter,
//     at.y for a figure on the dais): nothing to do per shot.
//   - SWAPS, never animated accessories (BIBLE 5): LIN <-> LIN_RAGE <-> LIN_OFFICIAL and SERVANT -> SERVANT_ROUGH are
//     separate figures with the same Look (body, robe, face identical; only the head / costume differs): show one,
//     hide the other on the same frame (shots/common.ts linFor / servantFor / swapTo).
//   - The guards hold the halberd in hand 1 (QIN_GUARD) / hand 0 (QIN_GUARD_B): ALWAYS pin that hand with
//     shots/common.ts halberdHand() (a hanging hand puts the shaft into the skirt). Keep them to idle, walk, wave,
//     point, cheer (the shaft crosses the face in hold and haul).
//   - The eunuch's whisk hangs in his LEFT hand (hand 1, held hang): his left arm stays down in wave / point /
//     cheer and a wave or a point goes to his right arm; a pinned left hand (the claps) carries the whisk with it.
//     hide: ["whisk"] if a shot needs his left hand empty.
//   - Accessories hide by name (state.hide): "envoyCap", "rageHair", "roundCap", "mianCrown", "ladyBun", "headCloth",
//     "bundle", "whisk", "topknot", "scholarCap", "flatCap", "officerCap", "helmet", "halberd", "robe" / "armour"
//     (the 3D skirt only: the painted garment stays). A hidden hat leaves the look's buzz hair.
//   - LIN_RAGE's tufts stand 0.32 m out from his head's axis at about the top of his head (the wrap above them): a
//     hand or the jade raised beside his head keeps 5 cm clear of them (the clearance checker's self-head and
//     prop-fig categories report it).
//   - Back views (turn: 1) show the envoy's limp ends, the ladies' bun and pin, the servant's bundle.
import * as THREE from "three";
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigSeat } from "../group/kit/rig3d";
import { classmate, friend, YOU } from "../group/kit/cast";
import { moustache } from "../group/kit/rigacc";
import { topknot, scholarCap, flatCap, helmet, officerCap } from "../../kit/acc/headwear";
import { robe, armour, trackFace } from "../../kit/acc/garb";
import { beard, hairOverBeard, swordBrows } from "../../kit/acc/facehair";
import { halberd } from "../../kit/acc/held";
import { softRim } from "../../kit/fx/rim";
import { envoyCap, rageHair, roundCap, RAGE } from "./acc/envoy";
import { mianCrown, chinBeard } from "./acc/crown";
import { ladyBun, ladyFace } from "./acc/lady";
import { whisk } from "./acc/held";
import { bundle, headCloth } from "./acc/bundle";

/** scale = the figure's size against the cast's 1.45 m (default 1). expr = the resting face (shown whenever a shot
 *  gives "neutral" or no expression) */
export type Person = { name: string; look: Look; acc: () => Acc[]; scale?: number; expr?: Expr };
export type Camp = "qin" | "zhao";

const HAIR = "#1f1c22";
/** the film's colours (BIBLE 5): never pure black (the ink must stay the darkest thing) */
export const COL = {
  teal: "#2f9a96",          // the envoy's robe: the ONLY bright teal in the Qin hall
  cream: "#efe4c8",         // the envoy's band and sash
  zhaoTeal: "#1f6e6e",      // the King of Zhao's deep teal
  plateTeal: "#2f8f8a",     // Zhao's sashes, the eunuch's sash
  qinBlack: "#36323d",      // the King of Qin's robe (the hall's light keeps it off black: WP2)
  gold: "#e2b03a",
  inkBlack: "#2a2630",      // caps, the ladies' sashes, the envoy's wrap
  miao: "#d8cfae",          // the eunuch's sage-cream robe
  peach: "#f2c09a", pink: "#eaa0a8",
  qinMin: "#4a4652",        // the Qin ministers' and the usher's charcoal
  armour: "#4a4f5e", ochre: "#b08a3c", helmet: "#8a8a92",
  zhaoMin: "#8f9e8c",       // the Zhao ministers' grey-green
  servant: "#a9b8b0", rough: "#8a6a48", roughCloth: "#6e5238", bundle: "#5e4630",
  grey: "#9a968f",
} as const;
const S_FAIR = "#f6d9bd", S_PALE = "#fbe7d3", S_WARM = "#f3d2b0", S_TAN = "#efc9a4", S_RUDDY = "#f2c4a4", S_OLD = "#e0b088";

/** a Warring States look from a kit look: its head (seed), skin and build stay; a plain top under the garment, dark
 *  cloth shoes, black hair tied up (the kit's "buzz": a clean hairline with no fringe, under a topknot or a cap);
 *  nothing modern is carried over (only the listed fields) */
const han = (from: Look, o: Partial<Look> & { topCol: string }): Look => ({
  seed: from.seed, skin: from.skin, part: from.part, width: from.width,
  top: "tee", bottom: "chinos", botCol: "#3a3440", shoes: "#2d2a30", shoeSole: "#1f1c22", hair: "buzz", hairCol: HAIR,
  ...o,
});

// ---------------------------------------------------------------------------------------------------- Zhao
/** the envoy's ONE look: the three envoys (plain, rage, promoted) are swaps of one body (same seed, skin, width) */
const LIN_LOOK = han(classmate(11), { width: 0.92, skin: S_PALE, topCol: COL.teal });
const linRobe = (gold = false) => robe({ col: COL.teal, band: gold ? COL.gold : COL.cream, sash: gold ? COL.gold : COL.cream });
const linFace = () => moustache({ kind: "pencil", col: HAIR });
/** 蔺相如, the envoy: slim, the bright teal robe with cream band and sash, the soft black wrap with limp ends, a pencil
 *  moustache */
export const LIN: Person = { name: "lin", look: LIN_LOOK, acc: () => [linRobe(), linFace(), envoyCap()] };
/** the envoy enraged (frames 0-107, 803-924, 1253-1271): the hair stands up in spiky tufts and lifts the wrap 0.13 m,
 *  cocked 8 deg; heavy brows */
export const LIN_RAGE: Person = {
  name: "linRage", expr: "huff", look: LIN_LOOK,
  acc: () => [linRobe(), linFace(), swordBrows({ weight: 7.5, down: 3.0, rise: 4.2, len: 1.2 }), rageHair(RAGE), envoyCap(RAGE)],
};
/** the envoy promoted (from 2061): a GOLD sash and band + the tall black official's cap with a gold band and pin (the
 *  tallest hat of the film: taller than the Zhao minister's) */
export const LIN_OFFICIAL: Person = { name: "linOfficial", look: LIN_LOOK, acc: () => [linRobe(true), linFace(), scholarCap({ band: COL.gold, pin: COL.gold, tall: 1.22 })] };
/** 赵王: plump, deep teal, gold band and sash, a small gold crown on his topknot with a gold pin, a short beard on the
 *  chin only (chinBeard) */
export const ZHAO_WANG: Person = {
  name: "zhaoWang", look: han(classmate(17), { width: 1.2, skin: S_WARM, topCol: COL.zhaoTeal }),
  acc: () => [robe({ col: COL.zhaoTeal, band: COL.gold, sash: COL.gold }), chinBeard(), moustache({ kind: "walrus", col: HAIR }), topknot({ band: COL.gold, pin: COL.gold, guan: COL.gold })],
};
/** 缪贤, the palace eunuch: round and plump with a round jaw, BEARDLESS, sage-cream robe with a teal sash, the soft
 *  black round cap, the white whisk in his left hand; resting face smile */
export const MIAO_XIAN: Person = {
  name: "miaoXian", expr: "smile", look: han(classmate(64), { width: 1.3, skin: S_FAIR, topCol: COL.miao, head: { nTop: 2.2, nBot: 2, egg: 0.12 } }),
  acc: () => [robe({ col: COL.miao, band: "#b3a682", sash: COL.plateTeal }), roundCap(), whisk()],
};
/** the two Zhao ministers: grey-green robes, teal sashes; A the tall scholar's cap and a short black beard, B a flat
 *  cap, a grey beard and a walrus moustache */
export const ZHAO_MIN_A: Person = {
  name: "zhaoMinA", look: han(classmate(23), { width: 1.0, skin: S_TAN, topCol: COL.zhaoMin }),
  acc: () => [robe({ col: COL.zhaoMin, band: "#5f6e5c", sash: COL.plateTeal }), beard({ kind: "short", col: HAIR }), scholarCap({ band: COL.plateTeal, pin: false })],
};
export const ZHAO_MIN_B: Person = {
  name: "zhaoMinB", look: han(classmate(33), { width: 1.06, skin: S_OLD, hairCol: COL.grey, topCol: COL.zhaoMin }),
  acc: () => [robe({ col: COL.zhaoMin, band: "#5f6e5c", sash: COL.plateTeal }), beard({ kind: "full", col: COL.grey }), moustache({ kind: "walrus", col: COL.grey }), flatCap({ col: COL.inkBlack })],
};
/** the servant's one look (SERVANT and SERVANT_ROUGH are a swap of one body) */
const SERVANT_LOOK = han(classmate(2), { width: 0.9, skin: S_WARM, topCol: COL.servant });
/** the envoy's servant: small, a short pale teal-grey robe, a plain topknot */
export const SERVANT: Person = {
  name: "servant", look: SERVANT_LOOK,
  acc: () => [robe({ col: COL.servant, band: "#7e8d86", sash: "#7e8d86", skirt: "short", knot: false }), topknot({ band: false, pin: false, size: 0.85 })],
};
/** the servant in ROUGH BROWN hemp (from 1339, V4): a brown head-cloth and a cloth bundle on his back: the only brown
 *  figure */
export const SERVANT_ROUGH: Person = {
  name: "servantRough", look: { ...SERVANT_LOOK, topCol: COL.rough },
  acc: () => [robe({ col: COL.rough, band: COL.roughCloth, sash: COL.roughCloth, skirt: "short", knot: false }), headCloth({ col: COL.roughCloth }), bundle({ col: COL.bundle })],
};

// ---------------------------------------------------------------------------------------------------- Qin
/** 秦王: stout, 1.08 x; black robe with a gold band and a wide gold sash; the flat crown board with gold bead fringes;
 *  upturned moustache + goatee; resting face smug */
export const QIN_WANG: Person = {
  name: "qinWang", scale: 1.08, expr: "smug", look: han(YOU, { width: 1.25, skin: S_RUDDY, topCol: COL.qinBlack }),
  acc: () => [robe({ col: COL.qinBlack, band: COL.gold, sash: COL.gold }), beard({ kind: "goatee", col: HAIR }), moustache({ kind: "handlebar", col: HAIR }), mianCrown()],
};
/** lady B's bun is swept 55 deg toward her right (lady A's sits in the middle of the back): it keeps 1 cm off the gold
 *  screen she stands against at HALL.ladyB (0.23 m from her axis: a centred bun went 7.4 cm into it, clearance B) */
const LADY_B_BUN = -55;
/** the ladies' look: long hair (it frames the face; its fall hangs from the bun as its tail), slim */
const ladyLook = (seed: Look, col: string): Look => ({ ...han(seed, { width: 0.85, skin: S_PALE, topCol: col }), hair: "long" });
const ladyHead = (face: boolean, side = 0): Acc[] => [ladyBun({ side }), ...(face ? [ladyFace()] : [])];
/** 美人, the king's ladies: the only women: long hair with ONE low bun and a single plain pin, lashes and a rose mouth,
 *  peach / pink long robes with a BLACK sash, slim; resting face smile_closed (the blush) */
export const LADY_A: Person = { name: "ladyA", expr: "smile_closed", look: ladyLook(friend(3), COL.peach), acc: () => [robe({ col: COL.peach, band: "#d99a74", sash: COL.inkBlack }), ...ladyHead(true)] };
export const LADY_B: Person = { name: "ladyB", expr: "smile_closed", look: ladyLook(friend(5), COL.pink), acc: () => [robe({ col: COL.pink, band: "#c97c86", sash: COL.inkBlack }), ...ladyHead(true, LADY_B_BUN)] };
const minister = (name: string, seed: Look, skin: string, face: Acc[], hair = HAIR): Person => ({
  name, look: han(seed, { width: 1.0, skin, hairCol: hair, topCol: COL.qinMin }),
  acc: () => [robe({ col: COL.qinMin, band: COL.inkBlack, sash: COL.gold }), ...face, officerCap({ col: COL.inkBlack, band: COL.gold })],
});
/** the three Qin ministers: charcoal robes, gold sashes, black gable caps; A a long grey beard, B a full black beard,
 *  C a thin moustache (C is also the official at the map, 12b-15) */
export const QIN_MIN_A: Person = minister("qinMinA", classmate(42), S_OLD, [beard({ kind: "long", col: COL.grey }), moustache({ kind: "walrus", col: COL.grey })], COL.grey);
export const QIN_MIN_B: Person = minister("qinMinB", classmate(8), S_TAN, [beard({ kind: "full", col: HAIR }), moustache({ kind: "walrus", col: HAIR })]);
export const QIN_MIN_C: Person = minister("qinMinC", classmate(12), S_FAIR, [moustache({ kind: "pencil", col: HAIR })]);
/** the usher 傧 (17a): a minister's charcoal robe with a gold-edged black sash, a black gable cap, clean-shaven, young */
export const QIN_USHER: Person = {
  name: "qinUsher", look: han(friend(7), { width: 0.95, skin: S_FAIR, topCol: COL.qinMin }),
  acc: () => [robe({ col: COL.qinMin, band: COL.gold, sash: COL.inkBlack }), officerCap({ col: COL.inkBlack, band: COL.inkBlack })],
};
const guardOf = (i: 0 | 1): Person => ({
  name: i ? "qinGuardB" : "qinGuard", look: han(classmate(i ? 29 : 5), { width: 1.06, skin: i ? S_TAN : S_FAIR, topCol: COL.armour }),
  acc: () => [armour({ col: COL.armour, trim: "#8a8fa0", sash: COL.ochre }), halberd({ hand: i ? 0 : 1, lift: 0.05 }), helmet({ col: COL.helmet })],
});
/** the Qin guards: charcoal armour, ochre sash, grey helmet, a halberd in hand 1 (QIN_GUARD = guardL) / hand 0
 *  (QIN_GUARD_B = guardR, then guardC in the ceremony) */
export const QIN_GUARD = guardOf(0), QIN_GUARD_B = guardOf(1);

// ---------------------------------------------------------------------------------------------------- tables
/** every Person by its PEOPLE key (the keys the World's rigNames, the line-up and the quotes use: "lin", "qinWang") */
export const PEOPLE = {
  lin: LIN, linRage: LIN_RAGE, linOfficial: LIN_OFFICIAL, qinWang: QIN_WANG, zhaoWang: ZHAO_WANG, miaoXian: MIAO_XIAN,
  ladyA: LADY_A, ladyB: LADY_B, qinMinA: QIN_MIN_A, qinMinB: QIN_MIN_B, qinMinC: QIN_MIN_C, qinUsher: QIN_USHER,
  qinGuard: QIN_GUARD, qinGuardB: QIN_GUARD_B, zhaoMinA: ZHAO_MIN_A, zhaoMinB: ZHAO_MIN_B, servant: SERVANT, servantRough: SERVANT_ROUGH,
} satisfies Record<string, Person>;
export type PersonKey = keyof typeof PEOPLE;
/** a role of the film: who it is and on which side (the tag strings live in hud/index.ts TAGS) */
export type RoleDef = { id: string; person: Person; camp: Camp; zh: string; en: string };
export const ROLES: RoleDef[] = [
  { id: "LIN", person: LIN, camp: "zhao", zh: "蔺相如", en: "the envoy" },
  { id: "LIN_RAGE", person: LIN_RAGE, camp: "zhao", zh: "蔺相如", en: "the envoy" },
  { id: "LIN_OFFICIAL", person: LIN_OFFICIAL, camp: "zhao", zh: "蔺相如", en: "the envoy" },
  { id: "QIN_WANG", person: QIN_WANG, camp: "qin", zh: "秦王", en: "King of Qin" },
  { id: "ZHAO_WANG", person: ZHAO_WANG, camp: "zhao", zh: "赵王", en: "King of Zhao" },
  { id: "MIAO_XIAN", person: MIAO_XIAN, camp: "zhao", zh: "赵国宦官", en: "the palace eunuch" },
  { id: "LADY_A", person: LADY_A, camp: "qin", zh: "美人", en: "the king's ladies" },
  { id: "LADY_B", person: LADY_B, camp: "qin", zh: "美人", en: "the king's ladies" },
  { id: "QIN_MIN_A", person: QIN_MIN_A, camp: "qin", zh: "秦国大臣", en: "Qin's ministers" },
  { id: "QIN_MIN_B", person: QIN_MIN_B, camp: "qin", zh: "秦国大臣", en: "Qin's ministers" },
  { id: "QIN_MIN_C", person: QIN_MIN_C, camp: "qin", zh: "秦国大臣", en: "Qin's ministers" },
  { id: "QIN_USHER", person: QIN_USHER, camp: "qin", zh: "傧", en: "" },
  { id: "QIN_GUARD", person: QIN_GUARD, camp: "qin", zh: "卫兵", en: "" },
  { id: "QIN_GUARD_B", person: QIN_GUARD_B, camp: "qin", zh: "卫兵", en: "" },
  { id: "ZHAO_MIN_A", person: ZHAO_MIN_A, camp: "zhao", zh: "赵国大臣", en: "Zhao's ministers" },
  { id: "ZHAO_MIN_B", person: ZHAO_MIN_B, camp: "zhao", zh: "赵国大臣", en: "Zhao's ministers" },
  { id: "SERVANT", person: SERVANT, camp: "zhao", zh: "随从", en: "his servant" },
  { id: "SERVANT_ROUGH", person: SERVANT_ROUGH, camp: "zhao", zh: "随从", en: "his servant" },
];
/** every Person the film uses, for a line-up (BIBLE 5's order) */
export const ALL_PEOPLE: Person[] = ROLES.map((r) => r.person);
/** the named figures, one per role (the line-up's 100 px and silhouette tests: no swaps, one lady, one guard) */
export const NAMED: Person[] = [LIN, QIN_WANG, ZHAO_WANG, MIAO_XIAN, LADY_A, QIN_MIN_A, ZHAO_MIN_A, SERVANT];
/** the swaps, each beside its base figure (LIN, LIN_RAGE, LIN_OFFICIAL, SERVANT, SERVANT_ROUGH) */
export const SWAPS: Person[] = [LIN, LIN_RAGE, LIN_OFFICIAL, SERVANT, SERVANT_ROUGH];
/** candidates that are not in the film (line-up: who: ["ladyAPlain"]): the ladies WITHOUT ladyFace (the 100 px test
 *  decides whether it is needed) */
export const ALTERNATES: Person[] = [
  { ...LADY_A, name: "ladyAPlain", acc: () => [robe({ col: COL.peach, band: "#d99a74", sash: COL.inkBlack }), ...ladyHead(false)] },
  { ...LADY_B, name: "ladyBPlain", acc: () => [robe({ col: COL.pink, band: "#c97c86", sash: COL.inkBlack }), ...ladyHead(false, LADY_B_BUN)] },
];

/** A figure with a resting face and / or a size of its own (a copy of Hongmen's people.ts personalise). The rig solves
 *  every figure at 1.45 m in world space and its group must stay at the origin while it does, so a plain group.scale
 *  shrinks a figure toward the world's origin. Here the figure is SOLVED AS A NORMAL ONE in a space of its own and
 *  DRAWN scaled about the ground point under it (its `at`, or the floor under its seat): before the rig's update the
 *  camera, the seat and the pinned hands are brought into that space, after it the group gets the scale and the head
 *  shader's own head centre and radius are put into the world. headWorld, handWorld, elbowWorld, footWorld are given
 *  in the world; rig.dim and rig.qa stay in the figure's own unscaled metres. */
export const personalise = (r: Rig, p: Person) => {
  const s = p.scale ?? 1, face = p.expr;
  if (s === 1 && !face) return;
  type Inner = { _update: (cam: THREE.Camera) => void; faceU: { uHead: { value: THREE.Vector4 } }; depthU: { value: number }; curlDepthU: { value: number } };
  const rr = r as unknown as Inner, base = rr._update.bind(r), P = new THREE.Vector3(), lcam = new THREE.Object3D() as unknown as THREE.Camera, t = new THREE.Vector3();
  const toL = (v: THREE.Vector3) => v.clone().sub(P).multiplyScalar(1 / s).add(P), toW = (v: THREE.Vector3) => v.sub(P).multiplyScalar(s).add(P), yL = (y: number) => P.y + (y - P.y) / s;
  const place = (k: number) => {
    const g = r.group;
    g.scale.setScalar(k); g.position.copy(P).multiplyScalar(1 - k); g.updateMatrix();
    if (g.parent) g.matrixWorld.multiplyMatrices(g.parent.matrixWorld, g.matrix); else g.matrixWorld.copy(g.matrix);
  };
  rr._update = (cam: THREE.Camera) => {
    const st = r.state, e0 = st.expr;
    if (face && (e0 === undefined || e0 === "neutral")) st.expr = face;
    if (s === 1 || st.visible === false) { base(cam); st.expr = e0; return; }
    const seat0 = st.seat, hands0 = st.hands;
    if (seat0) P.set(seat0.top.x, seat0.floor ?? 0, seat0.top.z); else P.copy(st.at);
    if (seat0) {
      const q: RigSeat = { ...seat0, top: toL(seat0.top) };
      if (seat0.back !== undefined) q.back = seat0.back / s;
      if (seat0.front !== undefined) q.front = seat0.front / s;
      if (seat0.deskEdge !== undefined) { q.deskEdge = seat0.deskEdge / s; q.deskTop = yL(seat0.deskTop ?? 0.75); }
      if (seat0.backrest !== undefined) { q.backrest = seat0.backrest / s; q.backrestTop = yL(seat0.backrestTop ?? seat0.top.y + 0.42); }
      st.seat = q;
    }
    if (hands0) st.hands = hands0.map((h) => (h ? toL(h) : null)) as typeof hands0;
    cam.updateMatrixWorld();
    lcam.matrixWorld.copy(cam.matrixWorld).setPosition(toL(t.setFromMatrixPosition(cam.matrixWorld)));
    place(1);
    base(lcam);
    st.seat = seat0; st.hands = hands0; st.expr = e0;
    place(s); r.group.updateMatrixWorld(true);
    const uh = rr.faceU.uHead.value; toW(t.set(uh.x, uh.y, uh.z)); uh.set(t.x, t.y, t.z, uh.w * s);
    rr.depthU.value *= s; rr.curlDepthU.value = rr.depthU.value - 0.03;
  };
  if (s !== 1) {
    const hw = r.handWorld.bind(r), ew = r.elbowWorld.bind(r), fw = r.footWorld.bind(r), hd = r.headWorld.bind(r);
    r.handWorld = (i) => toW(hw(i)); r.elbowWorld = (i) => toW(ew(i)); r.footWorld = (i) => toW(fw(i)); r.headWorld = () => toW(hd());
  }
};

/** adds the figure to the cast: its accessories, the film's rim light on its head (kit fx/rim.ts), the hair over its
 *  beard's sideburns, its resting face and its size; it makes the cast tell its figures where their drawn faces point
 *  (garb.ts trackFace) */
export function addPerson(rc: RigCast, p: Person): Rig {
  trackFace(rc);
  const r = rc.add(p.look, { acc: p.acc() });
  softRim(r.group);
  hairOverBeard(r);
  personalise(r, p);
  return r;
}

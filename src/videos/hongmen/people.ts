// THE CAST of the Hongmen film (鸿门宴). Each Person = a kit Look (made ONCE: a look's identity keys cached drawings)
// + the accessories that make the role readable at a glance (acc/garb.ts, acc/headwear.ts, acc/held.ts).
//   LIU_BANG  ZHANG_LIANG  FAN_KUAI  CAO_WUSHANG  LIU_GUARD (LIU_GUARD_B)        Liu's side: it carries RED
//   XIANG_YU  FAN_ZENG  XIANG_BO  XIANG_ZHUANG  GUARD (GUARD_B)  SERVANT        Xiang's side: CHARCOAL + DEEP PURPLE
//   ROLES = the roles with their name-tag text;  PEOPLE = the same by name;  addPerson(rc, p) -> Rig
// (the same Person object every time: World.actor caches the figure per Person; a second guard = GUARD_B, or
//  World.actor(GUARD, key))
// Who is who at a glance (one silhouette feature each; see /home/user/hm_notes/g3_cast.md for the pictures):
//   刘邦   the only all-red figure: red robe, black collar band, gold sash; a small red cap on his topknot with a long
//          gold pin through it (the only long pin with a cap); thin moustache and a chin tuft
//   张良   slim and pale: blue-green robe with a red collar and sash; the tall black cap; no beard
//   樊哙   the widest body: leather-brown armour to the knees, red sash, red neck cloth, red brow band; bushy black beard; sword
//   曹无伤 the informer, a RED-camp officer: dark red short armour with black edges over a red tunic to the knees (his
//          legs show), red neck cloth, the low black GABLE cap (a little pitched roof: nobody else has one), a thin
//          drooping moustache, a pale roll of bamboo slips tied in red at his belt. No sword. Give him gaze: +-1 (shifty
//          sideways eyes) and expr "smug" / "nervous" per shot; his tag is ROLES' tagBefore until line 9, tag after
//   项羽   THE WARLORD, the biggest figure of the cast (Person.scale 1.14): his hair bound up in a big knot that
//          stands in a small gold crown with a long gold pin (束发冠), a purple brow band with a gold boss, loose
//          hair down his back; black-iron lamellar (upright plates in level rows with bronze lacing, the skirt in
//          hanging panels), shoulder guards wider than his head, armoured arms with leather bracers, a beast-mask
//          belt, heavy boots, a long purple cloak down his back tied at the neck; heavy sword brows, a scowl (his
//          resting face: Person.expr "stern"), a bristling black beard with a moustache. Standing still, give him
//          state.hands = warlordHands(rig): the right hand on the hilt, the left fist on the hip
//   范增   thin and old: deep-purple robe, pale sash, white hair knot, tanned face, the LONG WHITE beard, a jade ring
//   项伯   grey: grey-purple robe, flat cap, grey hair and a grey beard
//   项庄   young: charcoal knee-length robe with a purple sash (his legs show), topknot, no beard, sword
// Notes for shot builders:
//   - Everybody is 1.45 m tall, except a Person with `scale` (项羽: 1.14). addPerson makes a scaled figure behave
//     like any other: give it world places as always (at, seat, hands) and read world places back (headWorld,
//     handWorld, elbowWorld, footWorld, hiltWorld); it is scaled about the ground point under it. Only rig.dim (hipY,
//     R ...) and rig.qa stay in the figure's own unscaled metres: multiply by the Person's scale for the world.
//   - Person.expr is a figure's RESTING face: it replaces "neutral" (and no expr at all). 项羽's is "stern". Any
//     other expression you give shows as given ("deadpan" is the nearest to a plain face if you need one).
//   - Robes and armour have a 3D skirt that hides the legs in every pose and on the floor seats (acc/garb.ts, top of
//     the file). Nothing to do per frame. A figure that stands on a dais: setGround(rig, y).
//   - Swords: 樊哙, 项羽, 范增, 项伯 and 项庄 wear a scabbard at the RIGHT hip (the drawing hand's side: the rig cannot
//     draw across the body) with the hilt as its own accessory: state.hide = ["hilt"] while the drawn sword (a world
//     prop) is out; hiltWorld(rig) = where the hand grips it. 刘邦 and 张良 are unarmed.
//   - 范增's jade ring hangs at his LEFT hip: hide: ["pendant"] while he holds up the world prop.
//   - The guards hold the halberd in hand 1 (GUARD, the person's left) / hand 0 (GUARD_B). PIN that hand with
//     shots/common.ts halberdHand() (2026-11-12, measured: a hanging hand puts the shaft 1.6-2 cm into the skirt).
//   - Headwear hides by name: "topknot", "scholarCap", "flatCap", "helmet", "officerCap", "warCrown"; also "robe" /
//     "armour" (the 3D skirt only: the painted garment stays), "cloak", "pauldrons", "armGuards", "warBoots",
//     "swordBelt", "beard" (the long beard's hanging part).
//   - Beards (acc/facehair.ts): a beard is part of the HAIR: it lies under the hair's edge, has the hair's shading
//     and goes round the side of the head to the outline (addPerson sets the figure's head up for it). Every head
//     gets the film's soft white rim light (fx/rim.ts) in addPerson.
//   - 范增's long beard is drawn over his own body and arms (it belongs to the head); it follows the drawn face and is
//     gone with it in a back view, which needs addPerson (it wraps the cast's update once: garb.ts trackFace).
//   - The guards' halberd crosses the face in "hold" and "haul": keep them to idle, walk, wave, point, cheer.
//   - A bow (07 finding 4): pose haul, phase 0, amount -1, both hands pinned at (+-0.05, 0.80, 0.36) from the
//     figure's place (turned with its facing): clear >= 0 for all but 樊哙 (-0.011).
import * as THREE from "three";
import type { Expr, Look } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigSeat } from "../group/kit/rig3d";
import { classmate, friend, YOU } from "../group/kit/cast";
import { moustache } from "../group/kit/rigacc";
import { topknot, scholarCap, flatCap, helmet, officerCap, warHelmet, warCrown, mane } from "./acc/headwear";
import { robe, armour, swordBelt, hilt, hiltWorld, pendant, scroll, whiskers, trackFace } from "./acc/garb";
import { beard, hairOverBeard, swordBrows } from "./acc/facehair";
import { pauldrons, cloak, warBelt, lamellar, armGuards, warBoots } from "./acc/armour";
import { halberd } from "./acc/held";
import { softRim } from "./fx/rim";

/** scale = the figure's size against the cast's 1.45 m (default 1; see addPerson). expr = the resting face: shown
 *  whenever a shot gives "neutral" or no expression */
export type Person = { name: string; look: Look; acc: () => Acc[]; scale?: number; expr?: Expr };
export type Camp = "liu" | "xiang";

/** a Han look from a kit look: its head (seed), skin and build stay; a plain top under the garment, dark cloth shoes;
 *  black hair tied up (the kit's "buzz": a clean hairline with no fringe, under a topknot or a cap); nothing modern
 *  is carried over (only the listed fields) */
const han = (from: Look, o: Partial<Look> & { topCol: string }): Look => ({
  seed: from.seed, skin: from.skin, part: from.part, width: from.width,
  top: "tee", bottom: "chinos", botCol: "#3a3440", shoes: "#2d2a30", shoeSole: "#1f1c22", hair: "buzz", hairCol: HAIR,
  ...o,
});

// ---- colours (hex; the two camps: Liu's side carries RED, Xiang's side CHARCOAL + DEEP PURPLE) ----
export const COL = {
  red: "#c8322c",          // Han red: Liu Bang's robe, the red on his people
  darkRed: "#7c1f27",      // the informer's short armour (a deep crimson: clearly not Fan Kuai's brown)
  gold: "#e2b03a",
  inkBlack: "#2a2630",     // collar bands, caps (never pure black)
  qing: "#a9d9cd",         // Zhang Liang's pale blue-green
  leather: "#8a5a34",      // Fan Kuai's armour
  charcoal: "#4a4f5e",     // Xiang's armour and Xiang Zhuang's robe (not pure black: it would merge with the ink)
  purple: "#5b2a86",       // Xiang Yu's cape and plume
  deepPurple: "#4b2a72",   // Fan Zeng's robe
  greyPurple: "#7d6f98",   // the uncle's robe
  sashPale: "#e6dcc6",
  sashPurple: "#7a3fa8",
  jade: "#3fae6e",
  white: "#f1f1ee",        // Fan Zeng's hair and beard
  grey: "#8c8a88",         // the uncle's hair and beard
  servant: "#9c9a94",
} as const;
const HAIR = "#1f1c22";
const S_FAIR = "#f6d9bd", S_PALE = "#fbe7d3", S_WARM = "#f3d2b0", S_TAN = "#efc9a4", S_RUDDY = "#f2c4a4";
/** an old man's weathered skin: darker than luma 0.76, so the day key does not bleach it and a white beard reads on it */
const S_OLD = "#e0b088";
/** the informer's sallow skin (a little yellower and darker than the others of his camp) */
const S_SALLOW = "#ecd2a4";

// ---- Liu's side ----
export const LIU_BANG: Person = {
  name: "liuBang", scale: 1,
  look: han(YOU, { width: 1.0, skin: S_FAIR, topCol: COL.red }),
  acc: () => [robe({ col: COL.red, band: COL.inkBlack, sash: COL.gold }), beard({ kind: "goatee", col: HAIR }), moustache({ kind: "pencil", col: HAIR }), topknot({ band: COL.gold, pin: COL.gold, guan: "#a3271f", size: 1.05 })],
};
export const ZHANG_LIANG: Person = {
  name: "zhangLiang", scale: 1,
  look: han(classmate(11), { width: 0.86, skin: S_PALE, topCol: COL.qing }),
  acc: () => [robe({ col: COL.qing, band: COL.red, sash: COL.red }), scholarCap({ band: COL.red })],
};
export const FAN_KUAI: Person = {
  name: "fanKuai", scale: 1,
  look: han(classmate(8), { width: 1.5, skin: S_RUDDY, topCol: COL.leather }),
  acc: () => [armour({ col: COL.leather, trim: "#d2b27c", sash: COL.red, scarf: COL.red }), swordBelt(), hilt(), beard({ kind: "full", col: HAIR }), moustache({ kind: "walrus", col: HAIR }), topknot({ headband: COL.red, band: COL.red, pin: false, size: 1.1 })],
};
/** 曹无伤, the informer: an officer of Liu's camp. Seen as a silhouette (line 2), unnamed (5-6), named (9), and again
 *  40 seconds later (20): the gable cap, the dark red over red and the pale roll at his belt are his alone */
export const CAO_WUSHANG: Person = {
  name: "caoWushang", scale: 1,
  look: han(classmate(23), { width: 1.0, skin: S_SALLOW, topCol: COL.darkRed }),
  acc: () => [armour({ col: COL.darkRed, trim: COL.inkBlack, scarf: COL.red, tunic: COL.red }), scroll(), whiskers(), officerCap({ band: COL.red })],
};

// ---- Xiang's side ----
/** 项羽, the 西楚霸王: the one figure a stranger points at. Bigger than everyone (XY_SCALE), broad (shoulder guards
 *  wider than his head, armoured arms, boots), in black-iron lamellar with a beast-mask belt and a purple cloak,
 *  scowling under sword brows, with a bristling beard. Three heads were tried (see /home/user/hm_notes/g3_cast.md):
 *  round 2 (chosen) = the bound hair in a gold crown with a brow band and loose hair (warCrown): blind viewers read
 *  round 1's helmet with spike and tassel as a QING / Joseon officer, 1,500 years too late;
 *  XIANG_YU_A = that helmet on round 1's gear, XIANG_YU_B = round 1's plain topknot candidate (neither is used). */
const XY_SCALE = 1.14, XY_FACE: Expr = "stern";
/** black iron (a warm charcoal, lighter than the ink: `charcoal` is bluish and read as navy), its lacing, the tunic */
const XY_IRON = "#4d4a52", XY_LACE = "#b08a3c", XY_TUNIC = "#3a2452";
const XY_LOOK = han(classmate(42), { width: 1.4, skin: S_TAN, topCol: XY_IRON });
const xyGear = (): Acc[] => [
  armour({ col: XY_IRON, trim: COL.gold }), lamellar({ col: XY_IRON, lace: XY_LACE, trim: COL.gold, under: XY_TUNIC }), warBelt({ trim: COL.gold, boss: 1.2, beast: true }),
  pauldrons({ col: XY_IRON, trim: COL.gold, size: 1.6, lean: 50, plates: true, lace: XY_LACE }), armGuards({ col: XY_IRON, lace: XY_LACE, trim: COL.gold, cloth: XY_TUNIC }), warBoots({ trim: COL.gold }),
  cloak({ col: COL.purple, trim: COL.gold }),
  swordBelt({ col: "#3a2630" }), hilt(), beard({ kind: "short", col: HAIR, lip: true, wild: true }), swordBrows({ weight: 8.4, down: 3.2, rise: 4.6, len: 1.3 }),
];
const xyGearR1 = (): Acc[] => [
  armour({ col: COL.charcoal, trim: COL.gold }), warBelt({ trim: COL.gold }), pauldrons({ col: "#454a5b", trim: COL.gold, size: 1.25 }), cloak({ col: COL.purple, trim: COL.gold }),
  swordBelt({ col: "#3a2630" }), hilt(), beard({ kind: "short", col: HAIR, lip: true }), swordBrows(),
];
const XY_LOOK_R1 = han(classmate(42), { width: 1.4, skin: S_TAN, topCol: COL.charcoal });
export const XIANG_YU: Person = { name: "xiangYu", scale: XY_SCALE, expr: XY_FACE, look: XY_LOOK, acc: () => [...xyGear(), warCrown({ band: COL.sashPurple })] };
export const XIANG_YU_A: Person = { name: "xiangYuA", scale: XY_SCALE, expr: XY_FACE, look: XY_LOOK_R1, acc: () => [...xyGearR1(), warHelmet({ tassel: "#7438a8" })] };
export const XIANG_YU_B: Person = { name: "xiangYuB", scale: XY_SCALE, expr: XY_FACE, look: XY_LOOK_R1, acc: () => [...xyGearR1(), topknot({ headband: COL.sashPurple, band: COL.gold, pin: COL.gold, pinLen: 0.3, size: 1.3 }), mane()] };
export const FAN_ZENG: Person = {
  name: "fanZeng", scale: 1,
  look: han(classmate(17), { width: 0.9, skin: S_OLD, hairCol: COL.white, topCol: COL.deepPurple }),
  acc: () => [robe({ col: COL.deepPurple, band: COL.inkBlack, sash: COL.sashPale }), pendant(), swordBelt(), hilt(), beard({ kind: "long", col: COL.white }), moustache({ kind: "walrus", col: COL.white }), topknot({ band: "#8f86a8", pin: COL.jade, pinLen: 0.14, size: 0.9 })],
};
export const XIANG_BO: Person = {
  name: "xiangBo", scale: 1,
  look: han(classmate(64), { width: 1.06, skin: S_WARM, hairCol: COL.grey, topCol: COL.greyPurple }),
  acc: () => [robe({ col: COL.greyPurple, band: "#3d3550", sash: "#3d3550" }), swordBelt(), hilt(), beard({ kind: "full", col: COL.grey }), moustache({ kind: "walrus", col: COL.grey }), flatCap()],
};
export const XIANG_ZHUANG: Person = {
  name: "xiangZhuang", scale: 1,
  look: han(friend(3), { width: 1.0, skin: S_FAIR, topCol: COL.charcoal }),
  acc: () => [robe({ col: COL.charcoal, band: COL.inkBlack, sash: COL.sashPurple, skirt: "short" }), swordBelt({ col: "#3a2630" }), hilt(), topknot({ band: COL.sashPurple, pin: false })],
};
const GUARD_LOOKS: Look[] = [
  han(classmate(12), { width: 1.06, skin: S_FAIR, topCol: COL.charcoal }),
  han(classmate(33), { width: 1.06, skin: S_TAN, topCol: COL.charcoal }),
];
const LIU_GUARD_LOOKS: Look[] = [
  han(classmate(12), { width: 1.06, skin: S_FAIR, topCol: COL.red }),
  han(classmate(33), { width: 1.06, skin: S_TAN, topCol: COL.red }),
];
/** a pawn soldier with a helmet and a halberd: camp "xiang" = charcoal with a purple sash, "liu" = plain red */
const guardOf = (i: number, camp: Camp = "xiang"): Person => camp === "xiang" ? {
  name: `guard${i}`, scale: 1, look: GUARD_LOOKS[i % 2],
  acc: () => [armour({ col: COL.charcoal, trim: "#8a8fa0", sash: COL.sashPurple }), halberd({ hand: i % 2 ? 0 : 1, lift: 0.05 }), helmet()],
} : {
  name: `liuGuard${i}`, scale: 1, look: LIU_GUARD_LOOKS[i % 2],
  acc: () => [armour({ col: COL.red, trim: "#e6c9a0" }), halberd({ hand: i % 2 ? 0 : 1, lift: 0.05, tassel: COL.red }), helmet()],
};
/** a gate guard of Xiang's camp (halberd in the left hand) and his twin with another face (halberd in the right) */
export const GUARD = guardOf(0), GUARD_B = guardOf(1);
/** the same two as plain RED soldiers of Liu's camp (line 20: they march the informer off). LIU_GUARD holds his
 *  halberd in his left hand, LIU_GUARD_B in his right: put LIU_GUARD at the prisoner's left side and LIU_GUARD_B at
 *  his right, and each has his free hand next to him */
export const LIU_GUARD = guardOf(0, "liu"), LIU_GUARD_B = guardOf(1, "liu");
export const SERVANT: Person = {
  name: "servant", scale: 1,
  look: han(classmate(2), { width: 0.9, skin: S_WARM, topCol: COL.servant }),
  acc: () => [robe({ col: COL.servant, band: "#6f6d68", sash: "#6f6d68", skirt: "short", knot: false }), topknot({ band: false, pin: false, size: 0.85 })],
};

/** a role of the film: `id` = the exported name, `tag` = the name-tag text shown at the first appearance (empty: no
 *  tag), `name` / `title` = its two parts, `seat` = the role's key in layout.ts SEATS (the six who sit at the banquet) */
export type RoleDef = { id: string; person: Person; camp: Camp; name: string; title: string; tag: string;
  /** the tag shown while the film has not named him yet (曹无伤 before line 9) */ tagBefore?: string; seat?: "liu" | "zhang" | "fankuai" | "xiangyu" | "uncle" | "fanzeng" };
export const ROLES: RoleDef[] = [
  { id: "LIU_BANG", person: LIU_BANG, camp: "liu", name: "刘邦", title: "", tag: "刘邦", seat: "liu" },
  { id: "ZHANG_LIANG", person: ZHANG_LIANG, camp: "liu", name: "张良", title: "刘邦的谋士", tag: "张良 · 刘邦的谋士", seat: "zhang" },
  { id: "FAN_KUAI", person: FAN_KUAI, camp: "liu", name: "樊哙", title: "刘邦的保镖", tag: "樊哙 · 刘邦的保镖", seat: "fankuai" },
  { id: "CAO_WUSHANG", person: CAO_WUSHANG, camp: "liu", name: "曹无伤", title: "告密的", tag: "曹无伤 · 告密的", tagBefore: "刘邦的军官" },
  { id: "XIANG_YU", person: XIANG_YU, camp: "xiang", name: "项羽", title: "", tag: "项羽", seat: "xiangyu" },
  { id: "FAN_ZENG", person: FAN_ZENG, camp: "xiang", name: "范增", title: "项羽的谋士", tag: "范增 · 项羽的谋士", seat: "fanzeng" },
  { id: "XIANG_BO", person: XIANG_BO, camp: "xiang", name: "项伯", title: "项羽的叔叔", tag: "项伯 · 项羽的叔叔", seat: "uncle" },
  { id: "XIANG_ZHUANG", person: XIANG_ZHUANG, camp: "xiang", name: "项庄", title: "", tag: "项庄" },
  { id: "GUARD", person: GUARD, camp: "xiang", name: "卫兵", title: "", tag: "" },
  { id: "SERVANT", person: SERVANT, camp: "xiang", name: "侍从", title: "", tag: "" },
  { id: "LIU_GUARD", person: LIU_GUARD, camp: "liu", name: "士兵", title: "", tag: "" },
];
/** the eight named figures, in line-up order (Liu's four, then Xiang's four) */
export const NAMED: Person[] = [LIU_BANG, ZHANG_LIANG, FAN_KUAI, CAO_WUSHANG, XIANG_YU, FAN_ZENG, XIANG_BO, XIANG_ZHUANG];
/** the six who sit at the banquet, in the order of layout.ts SEATS */
export const SEATED: Person[] = [LIU_BANG, ZHANG_LIANG, FAN_KUAI, XIANG_YU, XIANG_BO, FAN_ZENG];
export const PEOPLE = { liuBang: LIU_BANG, zhangLiang: ZHANG_LIANG, fanKuai: FAN_KUAI, caoWushang: CAO_WUSHANG, liuGuard: LIU_GUARD, liuGuardB: LIU_GUARD_B, xiangYu: XIANG_YU, fanZeng: FAN_ZENG, xiangBo: XIANG_BO, xiangZhuang: XIANG_ZHUANG, guard: GUARD, guardB: GUARD_B, servant: SERVANT };
/** every Person the film uses, for a line-up */
export const ALL_PEOPLE: Person[] = [...NAMED, GUARD, GUARD_B, SERVANT, LIU_GUARD, LIU_GUARD_B];

/** candidates and alternates that are not in the film (line-up tool: who: ["xiangYuB"]) */
export const ALTERNATES: Person[] = [XIANG_YU_A, XIANG_YU_B];

/** A figure with a resting face and / or a size of its own. The rig solves every figure at 1.45 m in world space and
 *  its group must stay at the origin while it does (group/kit/rig3d.ts: limbs are built in world space), so a plain
 *  group.scale shrinks a figure toward the world's origin. Here the figure is SOLVED AS A NORMAL ONE in a space of its
 *  own and DRAWN scaled about the ground point under it (its `at`, or the floor under its seat): before the rig's
 *  update the camera, the seat and the pinned hands are brought into that space (a uniform scaling about one point:
 *  the picture is exactly the scaled figure, and a pinned hand lands on its world target), after it the group gets
 *  the scale and the head shader's own head centre and radius are put into the world. What a shot reads back
 *  (headWorld, handWorld, elbowWorld, footWorld) is given in the world. */
const personalise = (r: Rig, p: Person) => {
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

/** 项羽 STANDING AS A WARLORD STANDS: the right hand on the sword's hilt, the left fist on the hip at the belt (the
 *  kit has no stance of its own: an idle figure's arms hang straight, which blind viewers read as a sentry at
 *  attention). Give the result to state.hands of a standing 项羽 (idle; not for a walk or a seat). Like hiltWorld it
 *  reads the figure's last solve: call it after the cast's update and use it on the next (in a still: solve twice). */
export const warlordHands = (rig: Rig): [THREE.Vector3 | null, THREE.Vector3 | null] => {
  const torso = rig.group.children[0], d = rig.dim as unknown as { rb: number; Ht?: number };
  torso.updateWorldMatrix(true, false);
  const Ht = d.Ht ?? 0.42;
  return [hiltWorld(rig), torso.localToWorld(new THREE.Vector3(d.rb + 0.028, 0.33 * Ht, 0.05))];
};

/** adds the figure to the cast: its accessories, the film's rim light on its head (fx/rim.ts), the hair over its
 *  beard's sideburns (acc/facehair.ts), its resting face and its size (Person.expr, Person.scale), and it makes the
 *  cast tell its figures where their drawn faces point (garb.ts trackFace) */
export function addPerson(rc: RigCast, p: Person): Rig {
  trackFace(rc);
  const r = rc.add(p.look, { acc: p.acc() });
  softRim(r.group);
  hairOverBeard(r);
  personalise(r, p);
  return r;
}

// THE PROPS of the Qin film behind ONE interface (Props), Wanbi's registry shape. The World builds it once per page and
// hides EVERY prop at the start of every frame (begin()): a shot puts the props it shows, every frame.
//
// The builders are props/things.ts (WP3: the kit's prop Part: merged meshes + one black hull outline, layer NOINK).
// Every name, origin, axis and grip is listed in PROP_INFO / PROP_GRIP / PROP_HANDS.
//
//   w.prop("sword").put(hand, { grip: "hilt", rot })   `at` is the HAND: the grip point is set on it; without grip,
//                                                    `at` is the prop's origin
//   put(at, { scale })   absolute scale; default = the film's size (PROP_SCALE)
//   put(at, { rot })     a yaw (radians, like a figure's facing: 0 = the prop's front toward +z), or [rx, ry, rz]
//                        (Euler "YXZ", radians) for a tilted thing (the sword swung up, a slip bundle in two hands)
//   put(at, { open })    seaChart: 0 = rolled .. 1 = the sheet hangs open; bigCarriage: 0 .. 1 = its +x curtain parts
//   put(at, { tilt })    scale: the beam's tilt (radians, + = the PAN end (+x) down); the wobble is the shot's numbers
//   put(at, { n })       slips: how many bundles in the tower (1 .. 12, log-cabin layers of two)
//   put(at, { on })      fishCart / fishBasket: the flies round it; scabbard: false = empty (no hilt in its mouth)
//   w.prop(name, key)    another instance of the same prop (the slip towers, the four halberds)
// HANDS: holdPoints(name, at, opts) = the world points the holder's hands are pinned to for that very put: pin the
// hands there, w.update(), then put the prop with the same (at, opts). A HAND of the rig is a ball 4.6 cm across with
// no fingers: a grip passes through (or within a centimetre of) the ball's middle. Never read handWorld before update.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { makeKit, V, type Kit } from "../../../kit/props/kit";
import * as T from "./things";
import type { Hook } from "./things";
export { PC, SCALE, scalePanLocal, slipSpot, CHART, CUSHION, BIG_CARRIAGE, FISH_BASKET, SCABBARD_LEN } from "./things";

type V3Like = [number, number, number] | THREE.Vector3;
type T3 = [number, number, number];
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

export type PropName =
  | "sword" | "scabbard" | "slips" | "scale" | "desk" | "brush" | "crossbow" | "seaChart" | "fish" | "boat" | "tree" | "hat"
  | "carriage" | "bigCarriage" | "fishCart" | "halberd" | "knife" | "railing" | "lantern"
  | "cushion" | "inkstone" | "bolt" | "fishBasket";
/** what each prop is, where its origin is and which way its axes point (sizes at the film's scale) */
export const PROP_INFO: Record<PropName, string> = {
  sword: "the EMPEROR's long sword (the draw gag): blade 1.30 m (5.6 cm wide, a ridge down the middle), a corded red grip 0.10 m, a gold lozenge guard and disc pommel (the hilt at his hip, at his size). Origin = the middle of the grip; +y = toward the tip (1.375 m out); the flat of the blade faces z. Grip hilt (the origin)",
  scabbard: "its black lacquer scabbard with gold fittings as a thing of its own (lying beside him; the one he wears is acc/sword.ts): 0.54 m, the hilt standing in its mouth (put({ on: false }) = empty). Origin = the middle of its mouth; it runs down -y from there, the hilt points +y. Grip hilt (the middle of the hilt's grip, 8 cm above the mouth)",
  slips: "a bundle of bamboo slips (竹简), rolled and tied with two red cords: 0.30 long, r 0.07. Origin = on the floor (or the desk) under the tower's middle; put({ n }) (1..12) lays n bundles in log-cabin layers of two (each layer crosswise to the one below, 0.13 apart; an odd last bundle lies across the middle). One bundle (n 1) runs along x. Grip pair = the two hands on its ends (x +-0.12, 0.07 up: holdPoints)",
  scale: "the steelyard balance (衡) on its stand: a post 1.10 m on a lacquer base, the beam 0.90 m pivoting at 1.13 m; a bronze PAN hangs from the +x end (the bundles go in it: scalePanLocal(tilt) = its top middle), a bronze bell weight from the -x end, both plumb. put({ tilt }): + = the pan end down. Origin = on the floor under the post",
  desk: "the low desk (案): top 1.30 x 0.60 at 0.42 m, black lacquer with a red inner panel and gold corners, four short legs on two floor bars. Origin = on the floor under its middle; its long side along x, the sitter behind it at -z faces +z (deskSeat)",
  cushion: "a square floor cushion: 0.62 x 0.62, 0.10 high (0.12 with its puffed top), dark red with a gold edge. Origin = on the floor under its middle (deskSeat puts it behind the desk)",
  brush: "a writing brush, 0.25 m: bamboo shaft, black hair tip. Origin = the middle of the shaft; +y = toward the tip. Grip hilt (3 cm from the middle away from the tip: the tip shows below the hand)",
  inkstone: "an ink stone with a black ink pool: 0.16 x 0.10, 0.03 high. Origin = on the desk under its middle",
  crossbow: "the repeating crossbow (连弩): a stock 0.72 m along +z, a recurved bow 0.76 m across x at the front, a red-edged magazine box on top with bolt tails. Origin = the rear grip under the stock; grip grip (the origin, one hand) or pair (hand 0 on the grip, hand 1 under the stock 0.28 m forward; the EMPEROR (facing 0 at the origin) holds it pair at (-0.18, 0.8, 0.18), rot 0.8: reach 0, clear 0; any higher and the magazine covers his chin and mouth)",
  bolt: "one crossbow bolt: 0.36 m, a bronze head, two pale vanes. Origin = its middle; +y = toward the head",
  seaChart: "Xu Fu's sea chart: a roller 0.48 m along x (gold knobs: 0.56 overall), r 0.03; open 0..1 unrolls a painted sheet 0.40 m down from it (sea, the islands of the immortals, a red route, the fish) with a second roller at its foot. Origin = the middle of the top roller. Grip pair (the roller's ends, x +-0.2)",
  fish: "the giant cartoon fish of the flashback, at the sand table's scale: 0.48 m long with its tail, swims along +x, a big eye each side. Origin = the middle of its belly at the waterline",
  boat: "the tiny boat on the sand table: 0.26 m long, bow toward +z, a cabin, a mast and a square sail. Origin = the middle of its keel at the waterline",
  tree: "the pine of 泰山 on the sand table (it is made 五大夫): 0.38 m high, a crooked trunk and flat tiers of needles. Origin = its foot",
  hat: "the official's hat (五大夫) that pops onto the tree: 0.06 m high, black with a red band and a little gable. Origin = the middle of its foot",
  carriage: "a small carriage of the procession (seen far): a lacquer box 1.3 x 1.6 on two spoked wheels under a red parasol (2.34 m high), a plain horse in front (to z -2.4). Origin = on the ground under the box's middle; it travels toward -z",
  bigCarriage: "the closed ornate carriage (辒凉车) at the road set's sizes (layout/road.ts ROAD_SET.carriage): 1.7 wide, 3.0 long, the body from 0.92 to 2.15 m with a curtained window each side (BIG_CARRIAGE.window), a low hipped roof to 2.42 m, two spoked wheels r 0.72 toward the front, shafts forward, a rack out at the back (BIG_CARRIAGE.rack: its top 0.82; the baskets go on it). put({ open }) parts the +x window's curtain. Origin = on the ground under its middle; faces -z (travels away)",
  fishCart: "the baggage cart with three baskets of salted fish at the road set's sizes (ROAD_SET.cart): 1.4 x 2.2, the bed at 0.78 with low side boards, two wheels r 0.55, shafts toward -z; put({ on }) = the flies. Origin = on the ground under its middle; faces -z",
  fishBasket: "a round wicker basket heaped with salted fish: r 0.25, 0.34 high with the heap; put({ on }) = a few flies over it. Origin = on the ground under its middle",
  halberd: "a guard's halberd (戟) as a thing on its own (the guards' own are their accessory): pole 2.32 m, a bronze spear point (to 1.66 m above the grip) and a dagger-axe blade toward +x, a red tassel. Origin = the grip, 0.95 m from the foot; +y = up the pole. Grip grip (the origin)",
  knife: "a bandit's knife (环首刀): 0.65 m, a slightly curved single edge toward +x, a ring pommel. Origin = the middle of the grip; +y = toward the tip. Grip hilt (the origin)",
  railing: "a museum railing section: 2.0 m along x, top rail 1.0 m, two posts on round feet, a lower rail. Origin = on the floor under its middle",
  lantern: "a hanging paper lantern, lit (it glows): 0.40 m high with its caps (the tassel to 0.53), r 0.15. Origin = the hook at its top. Grip hook (the origin)",
};
export const PROP_NAMES = Object.keys(PROP_INFO) as PropName[];
/** the film's size of each prop (put's default scale) */
export const PROP_SCALE: Record<PropName, number> = Object.fromEntries(PROP_NAMES.map((n) => [n, 1])) as Record<PropName, number>;

// ---------------------------------------------------------------------------------------------------- grips
export type Grip = "hilt" | "pair" | "grip" | "hook";
/** every prop's grips, in the prop's own (unscaled) axes: the point put(hand, { grip }) sets on `at` */
export const PROP_GRIP: Partial<Record<PropName, Partial<Record<Grip, T3>>>> = {
  sword: { hilt: [0, 0, 0] }, knife: { hilt: [0, 0, 0] }, brush: { hilt: [0, -0.03, 0] }, halberd: { grip: [0, 0, 0] },
  crossbow: { grip: [0, 0, 0], pair: [0, 0, 0] }, slips: { pair: [0, 0.07, 0] }, seaChart: { pair: [0, 0, 0] }, lantern: { hook: [0, 0, 0] },
  scabbard: { hilt: [0, 0.08, 0] },
};
/** the two hands of a two-hand grip (prop axes): hand 0 at -x, hand 1 at +x (a holder facing the way the prop faces);
 *  the crossbow: hand 0 on the rear grip, hand 1 under the fore-stock */
export const PROP_HANDS: Partial<Record<PropName, Partial<Record<Grip, T3[]>>>> = {
  slips: { pair: [[-0.12, 0.07, 0], [0.12, 0.07, 0]] }, seaChart: { pair: [[-0.2, 0, 0], [0.2, 0, 0]] },
  crossbow: { pair: [[0, 0, 0], [0, 0.02, 0.28]] },
};
const gripOf = (name: PropName, grip: Grip): T3 => {
  const q = PROP_GRIP[name]?.[grip];
  if (!q) throw new Error(`props: ${name} has no grip "${grip}" (it has: ${Object.keys(PROP_GRIP[name] ?? {}).join(", ") || "none"})`);
  return q;
};
/** the sword at the film's size (tip = from the middle of the grip; acc/sword.ts SWORD_REACH is the same number) */
export const SWORD = T.SWORD;
/** the desk at the film's size */
export const DESK = T.DESK;
/** the slip bundle at the film's size */
export const SLIPS = T.SLIPS;
/** the scale's pan (its top middle, where a bundle sits) in the world, for the scale put at `at` with { tilt, rot }
 *  (rot = its yaw: Math.PI turns the pan to -x).  w.prop("slips", "pan").put(scalePan(QHALL.scale, 0.15, Math.PI)) */
export const scalePan = (at: V3Like, tilt = 0, rot = 0) => T.scalePanLocal(tilt).applyAxisAngle(V(0, 1, 0), rot).add(toV(at));
/** THE SEAT behind the desk (the rig's "write" / "sit" poses on a cushion, checked with rig QA: reach 0, clear >= 0):
 *  the desk's origin `at` and its yaw `rot` -> where the cushion goes and the RigSeat + facing for the sitter.
 *    const S = deskSeat(QHALL.desk); w.prop("desk").put(QHALL.desk); w.prop("cushion").put(S.cushion, { rot: S.facing });
 *    a.set({ at: S.at, facing: S.facing, seat: S.seat, pose: { kind: "write", t } }) */
export const deskSeat = (at: V3Like, rot = 0) => {
  const o = toV(at), c = Math.cos(rot), sn = Math.sin(rot), back = -(DESK.d / 2 + 0.25);
  const p = V(o.x + sn * back, o.y, o.z + c * back);
  return {
    at: p.clone(), facing: rot, cushion: p.clone(),
    seat: { top: V(p.x, o.y + 0.12, p.z), floor: o.y, back: 0.03, deskEdge: 0.25, deskTop: o.y + DESK.top },
  };
};

export type PutOpts = { scale?: number; rot?: number | [number, number, number]; grip?: Grip; open?: number; tilt?: number; n?: number; on?: boolean };
export type Prop = {
  name: PropName;
  group: THREE.Group;
  /** shows the prop with its origin (or, with grip, its grip point) at `at` (world) */
  put(at: V3Like, o?: PutOpts): Prop;
  hide(): void;
};
export type Props = {
  /** every prop's group (instances made with a key are added to it when first asked for) */
  group: THREE.Group;
  names: PropName[];
  /** the prop with this name (key: another instance of it). Throws on an unknown name. */
  prop(name: PropName, key?: string): Prop;
  /** hides every prop and puts it back to its film scale, no turn: the World's beginFrame calls it */
  begin(): void;
};

const _e = new THREE.Euler(), _q = new THREE.Quaternion();
const quatOf = (o: PutOpts, q = _q) => (Array.isArray(o.rot) ? q.setFromEuler(_e.set(o.rot[0], o.rot[1], o.rot[2], "YXZ")) : q.setFromEuler(_e.set(0, o.rot ?? 0, 0, "YXZ")));

/** THE HANDS for a put: the world points a holder's hands are pinned to when the prop is put at `at` with `o` (the same
 *  arguments as put): a one-hand grip -> [the hand]; a two-hand grip (PROP_HANDS) -> [hand 0, hand 1]; no grip -> [].
 *  Pure: it does not touch the prop. */
export const holdPoints = (name: PropName, at: V3Like, o: PutOpts = {}): THREE.Vector3[] => {
  if (!o.grip) return [];
  const s = o.scale ?? PROP_SCALE[name], q = quatOf(o, new THREE.Quaternion()), origin = toV(at);
  const off = (p: T3) => V(p[0], p[1], p[2]).multiplyScalar(s).applyQuaternion(q);
  origin.sub(off(gripOf(name, o.grip)));
  const two = PROP_HANDS[name]?.[o.grip];
  return (two ?? [gripOf(name, o.grip)]).map((p) => origin.clone().add(off(p)));
};

// ---------------------------------------------------------------------------------------------------- the builders
const BUILD: Record<PropName, (K: Kit, g: THREE.Group) => Hook> = {
  sword: T.sword, scabbard: T.scabbardProp, slips: T.slips, scale: T.scale, desk: T.desk, cushion: T.cushion, brush: T.brush,
  inkstone: T.inkstone, crossbow: T.crossbow, bolt: T.bolt, seaChart: T.seaChart, fish: T.fish, boat: T.boat, tree: T.tree,
  hat: T.hat, carriage: T.carriage, bigCarriage: T.bigCarriage, fishCart: T.fishCart, fishBasket: T.fishBasket,
  halberd: T.halberd, knife: T.knife, railing: T.railing, lantern: T.lantern,
};
const _g = V();
export function buildProps(M: Mats): Props {
  const group = new THREE.Group(); group.name = "qin-props";
  const K = makeKit(M);
  const made = new Map<string, Prop>();
  const make = (name: PropName, key: string): Prop => {
    const g = new THREE.Group(); g.name = key ? `prop.${name}:${key}` : `prop.${name}`; g.visible = false;
    const hook = BUILD[name](K, g) || null, film = PROP_SCALE[name];
    group.add(g);
    const prop: Prop = {
      name, group: g,
      put(at, o = {}) {
        const s = o.scale ?? film;
        g.visible = true; g.position.copy(toV(at)); g.scale.setScalar(s);
        g.quaternion.copy(quatOf(o));
        if (o.grip) { const q = gripOf(name, o.grip); g.position.sub(_g.set(q[0], q[1], q[2]).multiplyScalar(s).applyQuaternion(g.quaternion)); }
        hook?.(o, g);
        g.updateMatrixWorld(true);
        return prop;
      },
      hide() { g.visible = false; },
    };
    made.set(key ? `${name}|${key}` : name, prop);
    return prop;
  };
  for (const n of PROP_NAMES) make(n, "");
  return {
    group, names: PROP_NAMES,
    prop(name, key = "") {
      if (!(name in BUILD)) throw new Error(`props: no prop "${name}" (${PROP_NAMES.join(", ")})`);
      return made.get(key ? `${name}|${key}` : name) ?? make(name, key);
    },
    begin() { for (const [k, q] of made) { q.group.visible = false; q.group.scale.setScalar(PROP_SCALE[k.split("|")[0] as PropName]); q.group.rotation.set(0, 0, 0); } },
  };
}

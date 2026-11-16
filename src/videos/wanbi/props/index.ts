// THE PROPS of the Wanbi film behind ONE interface (Props). The World builds it once per page and hides EVERY prop at
// the start of every frame (begin()): a shot puts the props it shows, every frame.
//
// STATE OF THIS FILE: the REAL props (WP5). The jade and the cauldron are the kit's things (src/kit/props/things.ts
// bi, ding) at the film's size, the cauldron with water in it; jadeStand and officialCap are props/things.ts, the map
// is props/map.ts. Every name, origin, axis and grip of the WP1b stand-ins is kept; new: the cap's grips (foot, pair,
// under), holdPoints() and mapCitiesWorld(). Sheet: preview/props_sheet.ts.
//
//   w.prop("jade").put(hand, { grip: "rim" })        `at` is the HAND: the grip point is set on it (the disc stands
//                                                    on the hand); without grip, `at` is the prop's origin
//   put(at, { scale })   absolute scale; default = the film's size (PROP_SCALE: the jade 1.5 x the kit's bi, the
//                        cauldron 1.8 x the kit's ding), so { scale: 1.5 } on the jade is the same as nothing
//   put(at, { rot })     a yaw (radians, like a figure's facing: 0 = the prop's front toward +z), or [rx, ry, rz]
//                        (Euler "YXZ", radians) for a tilted thing (the jade held up, the cap in a hand)
//   put(at, { open })    the mapScroll only: 0 = rolled up .. 1 = the sheet hangs open (the bottom roller drops)
//   w.prop(name, key)    another instance of the same prop (the clearance checker's seeds; never two jades on screen)
// HANDS: holdPoints(name, at, opts) = the world points the holder's hands are pinned to for that very put (the jade's
// two rim points, the cap's band or foot, the map's bottom roller at any `open`): pin the hands there, w.update(), then
// put the prop with the same (at, opts). A HAND of the rig is a ball 4.6 cm across with no fingers: a grip passes
// through (or within a centimetre of) the ball's middle. Never read handWorld before w.update().
// INK: every prop is on layer NOINK with its own black hull outline (kit props/kit.ts Part); the map's silk is a cloth
// with a painted edge. The outline pass never sees a prop.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { makeKit, type Kit } from "../../../kit/props/kit";
import { bi, BI, DING, jadeStand, officialCap, cauldron, JADE_STAND, OFFICIAL_CAP } from "./things";
import { mapScroll, MAP, MAP_CITIES, MAP_HANDS, mapDrop } from "./map";

export { JADE_STAND, OFFICIAL_CAP, MAP, MAP_CITIES, MAP_HANDS, mapDrop };

type V3Like = [number, number, number] | THREE.Vector3;
type T3 = [number, number, number];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

export type PropName = "jade" | "jadeStand" | "mapScroll" | "cauldron" | "officialCap";
/** what each prop is, where its origin is and which way its axes point (sizes at the film's scale) */
export const PROP_INFO: Record<PropName, string> = {
  jade: "和氏璧, the white jade disc (kit bi x 1.5): 0.255 across, hole 0.072, 0.02 thick, #eef1e4. Origin = its centre; it faces +z (the camera side at rot 0). Grips (PROP_GRIP.jade): rim = one hand under the bottom edge (the disc stands on the hand: centre 0.1275 above it; the frame-0 hold overhead); pair = the two hands at +-0.12 on the rim (JADE_HANDS; `at` = the centre). The brightest thing in its frame; never two on screen",
  jadeStand: "the small black-lacquer stand that holds the disc upright (23b): a plinth 0.20 x 0.12 with a red line, a turned black post with gold bands, a red-lacquer cradle with a slot (lips 1 cm clear of the disc's faces). Origin = on the dais under its middle; +y up; the disc's centre sits JADE_STAND.disc (0.5675) above the origin, its rim on the slot's floor (put the jade there, no rot: facing +z like the stand)",
  mapScroll: "the map of the fifteen cities (12b-15): two dark-wood rollers with gold caps, 0.95 long, Ø 0.04; the TOP roller hangs from the stand's bar, the silk (0.85 wide) hangs from it to the BOTTOM roller and faces +z. Origin = the middle of the TOP roller (HALL.mapBar); open 0..1 drops the bottom roller from 0.10 to 0.60 below it (mapDrop): the top of the map shows at full size, the rest stays rolled on the bottom roller. Painted: Qin grey-black in the west (-x), Zhao teal in the north-east, the Yellow River down the frontier, the Wei, hills, a dotted frame, and the 15 cities as cream dots ringed black in Qin's east near Zhao: MAP_CITIES (prop axes, open 1), mapCitiesWorld(prop) in the world. The official holds the bottom roller at MAP_HANDS (x +-0.25): holdPoints(\"mapScroll\", HALL.mapBar, { open })",
  cauldron: "汤镬, the bronze cauldron (kit ding x 1.8) with pale water 6 cm under its lip: 0.97 high, r 0.49 (the ears 0.96 across). Origin = on the floor under its middle; +y up. The steam is 2D",
  officialCap: "the official's tall black cap as a thing (23b): the cast's own scholarCap as LIN_OFFICIAL wears it (gold band, gold pin): a gold band r 0.07, 0.044 high, and on it a black board 0.14 wide at its top (0.09 at its foot), 0.32 high, leaning back 13 deg; 0.34 high in all. Origin = the middle of the band's foot; +y up; the board's face toward +z (its front, the way its wearer looks: give rot = the facing of the man who will wear it; the board leans back toward -z, so at the hand-over it leans toward the envoy, away from the giver's head; turn it 0.5-0.6 rad toward the camera when it would be seen edge-on). Grips (PROP_GRIP.officialCap): foot = standing on one hand; pair = the two hands on the band's sides (CAP_HANDS.pair, x +-0.082); under = the two hands under its foot, palms up (CAP_HANDS.under, x +-0.04)",
};
export const PROP_NAMES = Object.keys(PROP_INFO) as PropName[];
/** the film's size of each prop (put's default scale) */
export const PROP_SCALE: Record<PropName, number> = { jade: 1.5, jadeStand: 1, mapScroll: 1, cauldron: 1.8, officialCap: 1 };

// ---------------------------------------------------------------------------------------------------- grips
export type Grip = "rim" | "pair" | "foot" | "under";
/** the jade's grips, in the prop's own (unscaled) axes: the point that put(hand, { grip }) sets on `at`. rim = the
 *  disc's bottom edge (one hand under it); pair = the centre (the two hands at JADE_HANDS) */
export const JADE_GRIP = { rim: [0, -BI.r, 0] as T3, pair: [0, 0, 0] as T3 };
/** pair grip: the two hands in the prop's own (unscaled) axes: x +-0.08 x 1.5 = +-0.12 m on the rim. A holder who
 *  faces the same way as the disc (rot = his facing) has hand 0 (his right) at -x and hand 1 (his left) at +x */
export const JADE_HANDS = { pair: [[-0.08, 0, 0], [0.08, 0, 0]] as T3[] };
/** the cap's grips (prop axes): foot = the band's foot on one hand; pair = the band's middle (the two hands on its
 *  sides); under = 2 cm under the foot (the two hands under it, palms up) */
export const CAP_GRIP = { foot: [0, 0, 0] as T3, pair: [0, 0.022, 0] as T3, under: [0, -0.02, 0] as T3 };
/** the cap's two hands (prop axes): hand 0 at -x, hand 1 at +x (as the jade's) */
export const CAP_HANDS = { pair: [[-0.082, 0.022, 0], [0.082, 0.022, 0]] as T3[], under: [[-0.04, -0.02, 0], [0.04, -0.02, 0]] as T3[] };
/** every prop's grips (a prop that is not listed has none: put it by its origin) */
export const PROP_GRIP: Partial<Record<PropName, Partial<Record<Grip, T3>>>> = { jade: JADE_GRIP, officialCap: CAP_GRIP };
const gripOf = (name: PropName, grip: Grip): T3 => {
  const q = PROP_GRIP[name]?.[grip];
  if (!q) throw new Error(`props: ${name} has no grip "${grip}" (it has: ${Object.keys(PROP_GRIP[name] ?? {}).join(", ") || "none"})`);
  return q;
};

// ---------------------------------------------------------------------------------------------------- sizes
/** the jade at the film's size: radius, thickness */
export const JADE = { r: BI.r * PROP_SCALE.jade, t: BI.t * PROP_SCALE.jade };
/** the cauldron at the film's size */
export const CAULDRON = { h: DING.h * PROP_SCALE.cauldron, r: DING.r * PROP_SCALE.cauldron };

export type PutOpts = { scale?: number; rot?: number | [number, number, number]; grip?: Grip; open?: number };
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

/** THE HANDS for a put: the world points a holder's hands are pinned to when the prop is put at `at` with `o` (the
 *  same arguments as put). `hands` = which grip's hands (default o.grip): another holder's hands on the same prop (the
 *  king holds the cap by "pair", the envoy's hands go "under" it: holdPoints("officialCap", at, { grip: "pair", rot },
 *  "under")). jade rim -> [the hand]; jade pair -> [hand 0, hand 1] on the rim; officialCap foot -> [the hand]; pair /
 *  under -> [hand 0, hand 1]; mapScroll (at = HALL.mapBar, o.open) -> the official's two hands on the bottom roller
 *  ([west, east]); any other -> []. The pairs are ordered for a holder who faces the way the prop faces (rot = his
 *  facing: hand 0, his right, at the prop's -x); a holder who faces the prop (the official at the map, the envoy
 *  taking the cap) takes them the other way round. Pure: it does not touch the prop. */
export const holdPoints = (name: PropName, at: V3Like, o: PutOpts = {}, hands: Grip | undefined = o.grip): THREE.Vector3[] => {
  const s = o.scale ?? PROP_SCALE[name], q = quatOf(o, new THREE.Quaternion()), origin = toV(at);
  const off = (p: T3) => V(p[0], p[1], p[2]).multiplyScalar(s).applyQuaternion(q), pt = (p: T3) => origin.clone().add(off(p));
  if (o.grip) origin.sub(off(gripOf(name, o.grip)));
  if (name === "mapScroll") { const d = mapDrop(o.open ?? 1); return MAP_HANDS.map(([x, y, z]) => pt([x, y - d, z])); }
  if (!hands) return [];
  const one = gripOf(name, hands);
  if (name === "jade") return hands === "pair" ? JADE_HANDS.pair.map(pt) : [pt(one)];
  if (name === "officialCap") return hands === "foot" ? [pt(one)] : CAP_HANDS[hands === "under" ? "under" : "pair"].map(pt);
  return [];
};
/** the 15 cities of the map in the WORLD for the prop as it was last put (call after put, open 1): for w.project */
export const mapCitiesWorld = (p: Prop): THREE.Vector3[] => { p.group.updateMatrixWorld(true); return MAP_CITIES.map((c) => p.group.localToWorld(V(c[0], c[1], c[2]))); };

// ---------------------------------------------------------------------------------------------------- the registry
type Hook = ((o: PutOpts, g: THREE.Group) => void) | void;
const BUILD: Record<PropName, (K: Kit, g: THREE.Group) => Hook> = {
  jade: (K, g) => bi(K, g), jadeStand: (K, g) => jadeStand(K, g), mapScroll: (K, g) => mapScroll(K, g), cauldron: (K, g) => cauldron(K, g), officialCap: (K, g) => officialCap(K, g),
};
const _g = V();
export function buildProps(M: Mats): Props {
  const group = new THREE.Group(); group.name = "wanbi-props";
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

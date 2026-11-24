// THE PROPS of 采访罗密欧与朱丽叶 behind ONE interface (Newton's props/index.ts is the model). The World builds it once
// per page and hides EVERY prop at the start of every frame (begin()): a shot shows the ones it uses, every frame:
//
//   w.prop("sword").put([x, y, z], { rot: spot.facing })       `at` = the prop's origin (world); PROP_INFO says where
//   put(at, { rot })     a yaw (radians, like a figure's facing), [rx, ry, rz] (Euler "YXZ") or a THREE.Quaternion
//   put(at, { scale })   absolute scale (default 1 = the film's size)
//   put(at, { t })       seconds, for what moves by itself (the horse's gait)
//   spill:        { amount } 0..1 = how far the stain has spread (0 = none)
//   horseRider:   { go } 0..1 = leaving: it moves RIDER.go (9 m) along its facing at a gallop; 0 = standing; { t }
//                 { gait } = the shot moves it along its own path (segG: out through the gate); this names the gait
//   darkBottle:   { lying: true } = on its side (default standing)
//   letterSealed: { stand: true } = upright on its long edge, face toward +z (default lying face up)
//   w.prop(name, key)    another instance of the same prop (two crumpled pages, a second shard pile)
// Builders: props/things.ts (kit props Part: merged meshes + one black hull, layer NOINK). The hand-held versions
// (maskStick, darkBottleHeld, quillHeld) are rig accessories in acc/held2.ts, worn by the persons in people.ts.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { makeKit, V } from "../../../kit/props/kit";
import * as T from "./things";
export { SWORD, DARK_BOTTLE, SPILL, LETTER, QUILL, RIDER } from "./things";

type V3Like = [number, number, number] | THREE.Vector3;
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

export type PropName =
  | "sword" | "redCap" | "darkBottle" | "spill" | "letterSealed" | "quill" | "inkpot" | "waxStick" | "glassShards" | "horseRider" | "crumpledPage" | "vialFree" | "sunBurst";
/** what each prop is, where its origin is and which way its axes point (metres) */
export const PROP_INFO: Record<PropName, string> = {
  sword: "a plain Renaissance RAPIER lying on the stones: blade 0.74 m toward +x, a cup hilt (no cross guard), knuckle bow, dark grip, ball pommel (SWORD). Origin = on the ground under the cup; rot = the yaw of the blade (the street's mark `sword` has facing 0.4)",
  redCap: "a soft RED CAP lying on the ground, a little crumpled (r 0.13), a short pale feather. Origin = on the ground under its middle. The only red thing in the street",
  darkBottle: "THE DARK BOTTLE (the apothecary's poison): square-shouldered plum-black glass with a paper label, a dark wax-capped cork, 0.10 m high (DARK_BOTTLE). Origin = under its middle; put({ lying: true }) lays it on its side, the neck toward -x",
  spill: "a DARK STAIN on stone (plum-brown, crisp lobed edge, a wet glint) 0.8 mm over the floor; put({ amount }) 0..1 spreads it to r 0.36 (SPILL), running out toward +x. Origin = where it started (lay it on the floor: y = the floor). Never near a mouth",
  letterSealed: "A FOLDED LETTER with a red wax seal, 0.19 x 0.12 (LETTER). Origin = under its middle. Default lying face up (on a desk); put({ stand: true }) = upright on its long edge leaning back a little, face toward +z. Behind the street's boarded window: put([ISLAND.street + 2.47, 0.9, -0.2], { stand: true, rot: -Math.PI / 2 })",
  quill: "a goose QUILL lying on the desk, 0.28 m, the feather toward +x, the inked nib at -x. Origin = on the desk under its middle",
  inkpot: "a squat glazed earthenware INKPOT, r 0.042, 5.8 cm high, black ink in its mouth. Origin = on the desk under its middle",
  waxStick: "a stick of dark red SEALING WAX, 0.10 m along x, its burnt tip at +x. Origin = on the desk under its middle",
  glassShards: "CAMERA-GLASS SHARDS: six flat broken pieces and one domed piece of the front element, within 0.3 m round the origin, pale smoky glass. Origin = on the floor at the middle of the scatter (the tomb's shardFloor mark)",
  horseRider: "A HORSE WITH A SMALL CLOAKED RIDER (kit horse, grey; hooded grey-brown cloak), seen far away. Origin = on the ground under the horse's middle; the head toward +z (rot PI = riding toward -z, the Mantua mark `rider`). put({ go }) 0..1 = leaving (moves 9 m along its facing at a gallop, eased in), put({ gait }) = the shot moves it itself, { t } = the gait's seconds",
  crumpledPage: "a CRUMPLED PAGE: a lumpy paper ball r ~4.5 cm with creases and a few lines of writing. Origin = on the floor under it",
  vialFree: "HER VIAL out of her hand (v7: she drinks it, it empties, she drops it): the pale teal round bottle she holds, 11 cm high at her size. Origin = under its foot, the neck up +y. put({ amount }) 0..1 how full; put({ go }) 0..1 the cork pulled and gone",
  sunBurst: "HIS SUNBURST (v7 emote, emo.ts c03Sun): warm rays round his head, a flat unlit disc 1.24 m across BEHIND him (his head, hat and arm in front of it). Origin = its middle; put({ rot }) a quaternion turning +z to the lens; put({ amount }) 0..1 strength; put({ t }) seconds (it turns)",
};
export const PROP_NAMES = Object.keys(PROP_INFO) as PropName[];
const BUILD: Record<PropName, T.Build> = {
  sword: T.sword, redCap: T.redCap, darkBottle: T.darkBottle, spill: T.spill, letterSealed: T.letterSealed, quill: T.quill, inkpot: T.inkpot,
  waxStick: T.waxStick, glassShards: T.glassShards, horseRider: T.horseRider, crumpledPage: T.crumpledPage, vialFree: T.vialFree, sunBurst: T.sunBurst,
};

export type PutOpts = {
  rot?: number | [number, number, number] | THREE.Quaternion; scale?: number;
  /** seconds for what moves by itself (the horse) */ t?: number;
  /** spill: 0..1 */ amount?: number;
  /** horseRider: 0..1 */ go?: number;
  /** horseRider: the shot moves it along its own path; this is the gait */ gait?: "stand" | "walk" | "gallop";
  /** darkBottle */ lying?: boolean;
  /** letterSealed */ stand?: boolean;
};
export type Prop = {
  name: PropName;
  group: THREE.Group;
  /** shows the prop with its origin at `at` (world) */
  put(at: V3Like, o?: PutOpts): Prop;
  hide(): void;
};
export type Props = {
  group: THREE.Group;
  names: PropName[];
  /** the prop with this name (key: another instance of it). Throws on an unknown name. */
  prop(name: PropName, key?: string): Prop;
  /** hides every prop, back to scale 1 and no turn: the World's beginFrame calls it */
  begin(): void;
};

const _e = new THREE.Euler();
const quatOf = (o: PutOpts, q = new THREE.Quaternion()) => (o.rot instanceof THREE.Quaternion ? q.copy(o.rot) : Array.isArray(o.rot) ? q.setFromEuler(_e.set(o.rot[0], o.rot[1], o.rot[2], "YXZ")) : q.setFromEuler(_e.set(0, o.rot ?? 0, 0, "YXZ")));
/** a world point of a prop put at `at` with `o`: `local` in the prop's own axes */
export const propPoint = (at: V3Like, o: PutOpts, local: [number, number, number]) => toV(at).add(V(...local).multiplyScalar(o.scale ?? 1).applyQuaternion(quatOf(o)));

export function buildProps(M: Mats): Props {
  const group = new THREE.Group(); group.name = "romeo-props";
  const K = makeKit(M);
  const made = new Map<string, Prop>();
  const make = (name: PropName, key: string): Prop => {
    const g = new THREE.Group(); g.name = key ? `prop.${name}:${key}` : `prop.${name}`; g.visible = false;
    const hook = BUILD[name](K, g) || null;
    group.add(g);
    const prop: Prop = {
      name, group: g,
      put(at, o = {}) {
        g.visible = true; g.position.copy(toV(at)); g.scale.setScalar(o.scale ?? 1); g.quaternion.copy(quatOf(o));
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
      if (!(name in BUILD)) throw new Error(`romeo props: no prop "${name}" (${PROP_NAMES.join(", ")})`);
      return made.get(key ? `${name}|${key}` : name) ?? make(name, key);
    },
    begin() { for (const q of made.values()) { q.group.visible = false; q.group.scale.setScalar(1); q.group.rotation.set(0, 0, 0); } },
  };
}

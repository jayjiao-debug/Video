// THE PROPS of the Newton film behind ONE interface (Props), Wanbi's / Qin's registry shape. The World builds it once per
// page and hides EVERY prop at the start of every frame (begin()): a shot puts the props it shows, every frame.
//
// The builders are props/things.ts (WP3: the kit's prop Part: merged meshes + one black hull outline, layer NOINK).
// Every name, origin, axis and grip is listed in PROP_INFO / PROP_GRIP / PROP_HANDS.
//
//   w.prop("quill").put(hand, { grip: "hilt", rot })   `at` is the HAND: the grip point is set on it; without grip, `at`
//                                                    is the prop's origin
//   put(at, { scale })   absolute scale; default = the film's size (PROP_SCALE)
//   put(at, { rot })     a yaw (radians, like a figure's facing: 0 = the prop's front toward +z), [rx, ry, rz] (Euler
//                        "YXZ", radians) or a THREE.Quaternion (cam.ts gives the first-person things as quaternions)
//   put(at, { t })       seconds, for what moves by itself: the steam, the fly's legs, the candle's flame (default 0)
//   plate:  { bites } 0..3, { lid } 0..1 (0 off, 1 on, between = lifted), { steam } 0..1, { fly } 0..1 (its place on
//           its walk; leave it out = no fly)
//   candle: { len } 0..1 (stub .. new), { lit } (default true)
//   sack:   { full } 0 / 1, { slump } (dropped on its side, lumps spilled)
//   sheets / books: { n }      shovel: { load }      poker / crucible: { hot } 0..1      bellows: { open } 0..1
//   hand / handR: { pose } "grip" | "open"
//   w.prop(name, key)    another instance of the same prop (two candles, a second plate)
// HANDS: holdPoints(name, at, opts) = the world points the holder's hands are pinned to for that very put: pin the
// hands there, w.update(), then put the prop with the same (at, opts). A HAND of the rig is a ball 4.6 cm across with
// no fingers: a grip passes through (or within a centimetre of) the ball's middle. Never read handWorld before update.
// HER HAND AND MIC (mic, hand, handR) are placed from the camera every frame by cam.ts (micPose / putMic and the
// free-hand helpers): never by hand-typed numbers.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { makeKit, V, type Kit } from "../../../kit/props/kit";
import * as T from "./things";
import type { Hook } from "./things";
export { PC, PLATE, flyAt, QUILL, INK_BOTTLE, SHEET, DRAFTS, NOTES, BOOK, OLD_BOOK, CANDLE, candleTop, CHAIR, STOOL, SACK, SHOVEL, POKER, BOARD, boardDrawing, CRUCIBLE, FLASK, BELLOWS, MIC, HAND, INK_NEAR } from "./things";

type V3Like = [number, number, number] | THREE.Vector3;
type T3 = [number, number, number];
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

export type PropName =
  | "plate" | "lid" | "fork" | "knife" | "quill" | "inkwell" | "inkBottle" | "sheets" | "drafts" | "notes" | "books" | "oldBook"
  | "candle" | "chair" | "stool" | "handkerchief" | "sack" | "shovel" | "poker" | "board" | "charcoal" | "crucible" | "flask" | "bellows"
  | "mic" | "hand" | "handR";
/** what each prop is, where its origin is and which way its axes point (sizes at the film's scale) */
export const PROP_INFO: Record<PropName, string> = {
  plate: "THE DINNER (the day's clock): a pewter plate r 0.13 (rim 3.4 cm, 2.2 cm high) with a mutton chop, a bread roll and peas. put({ bites }) 0..3 bites out of the chop (two from E, three at 2 a.m.); { lid } 0..1: 1 = the domed cover on it (the covered dinner), 0 = off, between = lifted 16 cm up and toward +z, tilted; { steam } 0..1 = three soft wisps rising (with t; hidden under the lid); { fly } 0..1 = the fly's place on its walk over the rim and the chop (with t its legs walk; leave it out = no fly; flyAt(u) gives its point). Origin = on the table under its middle. Grip pair = two hands on the rim (x +-0.12)",
  lid: "the domed pewter cover on its own (Humphrey lifts it off): r 0.122, 8.5 cm high + a knob. Origin = the middle of its rim; grip knob (the top, 0.1 up)",
  fork: "a two-tined steel fork with a bone handle, 0.18 m. Origin = the middle of the handle; +y toward the tines. Grip hilt (the origin)",
  knife: "a table knife with a bone handle, 0.2 m. Origin = the middle of the handle; +y toward the tip. Grip hilt (the origin)",
  quill: "a goose quill: the cream vane to 0.24 above the grip, the nib 5 cm below it (QUILL). Origin = where the fingers hold it; +y up the feather. Grip hilt (the origin). Behind his ear it is NEWTON's accessory earQuill (hide it when the prop is in his hand)",
  inkwell: "a squat pewter inkwell, r 0.047, 4.6 cm high, black ink in its mouth. Origin = on the desk under its middle",
  inkBottle: "Humphrey's (empty) ink bottle: brown stoneware, 0.13 m with its cork. Origin = under its middle; grip grip (its body, 5.5 cm up)",
  sheets: "loose written sheets (0.2 x 0.29) fanned on the desk; put({ n }) 1..6 (3). Origin = on the desk under the middle",
  drafts: "THE DRAFTS: a stack of written drafts a hand's breadth thick (0.21 x 0.30 x 0.09), a little ragged, page edges on its sides, the top page written. Origin = on the desk under its middle",
  notes: "the sheaf of lecture notes: 0.2 x 0.3, 2.2 cm thick, a red tape round it. Origin = its middle; grip grip (its +x edge: under his arm or in one hand)",
  books: "closed leather books (0.17 x 0.24, about 4.5 cm each) stacked askew; put({ n }) 1..4 (3). Origin = under the stack's middle",
  oldBook: "THE MOULDY OLD BOOK lying open: 0.34 x 0.24, two page blocks of brown script with green-grey mould spots, a cracked cover. Origin = on the bench under its spine; the spine runs along z",
  candle: "THE CANDLE in a pewter chamberstick (saucer r 0.065, a ring handle at +x): put({ len }) 0..1 = a 2.5 cm stub .. a new 20 cm candle; { lit } (default true) = the flame, which flickers with t (candleTop(len) = the flame's height above the origin). Origin = under the saucer's middle; grip grip = the ring handle (x 0.07, 1.2 cm up)",
  chair: "a plain wooden chair: seat 0.42 x 0.40 at 0.45 m, back to 0.95 m (CHAIR). Origin = on the floor under the seat's middle; the sitter faces +z, the back is at -z. Grip rail = the middle of the top rail (0, 0.92, -0.185): her hand drags it by that",
  stool: "a three-legged stool: a round seat r 0.16 at 0.42 m (STOOL). Origin = on the floor under the seat's middle",
  handkerchief: "a white linen handkerchief crumpled into a wad, a long corner hanging 16 cm down -y and a short one off to +x (cam.ts wipe() puts it at WIPE.cloth scale). Origin = the pinch at the wad's top; grip pinch (the origin)",
  sack: "THE SACK of hessian: put({ full }) 1 (default) = full of charcoal, 0.54 high, its neck gathered with a cord and lumps at its mouth; 0 = empty (lying flat, folded); { slump: true } = the full sack dropped on its side, lumps spilled toward +z. Origin = on the floor under its middle; grip neck = the gathered neck (0, 0.5, 0)",
  shovel: "the charcoal shovel: a wooden handle with a T grip and an iron scoop, 0.95 m. Origin = the grip (the handle's middle); +y toward the blade (0.6 up). put({ load }) = charcoal heaped on the blade. Grips grip (the origin), pair (hand 0 at the T, hand 1 low on the shaft)",
  poker: "the iron poker: a rod 0.72 m with a ring handle. Origin = the grip under the ring; +y toward the tip. put({ hot }) 0..1 = the tip glows. Grip grip (the origin)",
  board: "THE BOARD: a plank 0.42 x 0.31, 1.6 cm thick, with his charcoal figures on its face (an ellipse round the point S, the triangles SAB, SBC, SCD swept from S, a tangent, circles, the letters). Origin = its middle; the drawn face faces +z (on his knee: rot [-PI/2, yaw, 0]). Grips edge (the middle of its +x edge) and pair (both side edges)",
  charcoal: "a stick of charcoal: 7 cm, 1.3 cm thick. Origin = its middle; +y toward the worn tip. Grip hilt (the origin)",
  crucible: "a clay crucible: a tapered pot 0.11 high, r 0.05 at the mouth, sooty below; put({ hot }) 0..1 = molten metal glowing in its mouth. Origin = under its middle",
  flask: "a glass flask: a round body r 0.065 and a long neck, 0.24 high, pale green glass with a little dark liquid. Origin = under its middle",
  bellows: "the bellows: two pear-shaped boards with leather between and a brass nozzle toward +z, 0.55 long. put({ open }) 0..1 = the upper board lifted (pumping). Origin = its middle; grip pair = the two handles at the back (-z)",
  mic: "HER MICROPHONE: a black handle and a RED FOAM windscreen (r 0.033), no logo. Origin = the grip (where her fist closes, 7.5 cm from the handle's end); +y toward the head, whose centre is at MIC.head (0.15). Placed by cam.ts micPose / putMic",
  hand: "HER LEFT HAND (the mic hand), a young woman's, with the cuff of her mustard jacket sleeve running back along -z. put({ pose }) grip (a fist round a bar along +y through the origin: the mic's handle) | open (palm down at the origin, fingers +z). Placed by cam.ts",
  handR: "HER RIGHT HAND (the free hand): the same mirrored. grip = the chair's rail, the board's edge, the handkerchief's wad; open = the clap. Placed by cam.ts",
};
export const PROP_NAMES = Object.keys(PROP_INFO) as PropName[];
/** the film's size of each prop (put's default scale) */
export const PROP_SCALE: Record<PropName, number> = Object.fromEntries(PROP_NAMES.map((n) => [n, 1])) as Record<PropName, number>;

// ---------------------------------------------------------------------------------------------------- grips
export type Grip = "hilt" | "pair" | "grip" | "knob" | "rail" | "pinch" | "neck" | "edge";
/** every prop's grips, in the prop's own (unscaled) axes: the point put(hand, { grip }) sets on `at` */
export const PROP_GRIP: Partial<Record<PropName, Partial<Record<Grip, T3>>>> = {
  plate: { pair: [0, 0.018, 0] }, lid: { knob: [0, 0.1, 0] }, fork: { hilt: [0, 0, 0] }, knife: { hilt: [0, 0, 0] }, quill: { hilt: [0, 0, 0] },
  inkBottle: { grip: [0, T.INK_BOTTLE.grip, 0] }, notes: { grip: [T.NOTES.w / 2, 0, 0] }, candle: { grip: [T.CANDLE.handle, 0.012, 0] },
  chair: { rail: T.CHAIR.rail }, handkerchief: { pinch: [0, 0, 0] }, sack: { neck: T.SACK.neck }, shovel: { grip: [0, 0, 0], pair: [0, 0, 0] },
  poker: { grip: [0, 0, 0] }, board: { edge: [T.BOARD.w / 2, 0, 0], pair: [0, 0, 0] }, charcoal: { hilt: [0, 0, 0] }, bellows: { pair: [0, 0, -0.2] },
  mic: { grip: [0, 0, 0] },
};
/** the two hands of a two-hand grip (prop axes): hand 0 at -x, hand 1 at +x (a holder facing the way the prop faces) */
export const PROP_HANDS: Partial<Record<PropName, Partial<Record<Grip, T3[]>>>> = {
  plate: { pair: [[-0.12, 0.018, 0], [0.12, 0.018, 0]] }, board: { pair: [[-T.BOARD.w / 2, 0, 0], [T.BOARD.w / 2, 0, 0]] },
  shovel: { pair: [[0, -0.2, 0], [0, 0.1, 0]] }, bellows: { pair: [[-0.04, -0.025, -0.22], [0.04, -0.025, -0.22]] },
};
const gripOf = (name: PropName, grip: Grip): T3 => {
  const q = PROP_GRIP[name]?.[grip];
  if (!q) throw new Error(`props: ${name} has no grip "${grip}" (it has: ${Object.keys(PROP_GRIP[name] ?? {}).join(", ") || "none"})`);
  return q;
};

export type PutOpts = {
  scale?: number; rot?: number | [number, number, number] | THREE.Quaternion; grip?: Grip;
  /** seconds for what moves by itself (steam, the fly, the flame) */ t?: number;
  /** plate */ bites?: number; lid?: number; steam?: number; fly?: number;
  /** candle */ len?: number; lit?: boolean;
  /** sack */ full?: number; slump?: boolean;
  /** sheets, books */ n?: number;
  /** shovel */ load?: boolean;
  /** poker, crucible */ hot?: number;
  /** board: firelight on its drawn face 0..1 (default 0: the place's light alone; things.ts board) */ warm?: number;
  /** bellows */ open?: number;
  /** hand, handR */ pose?: "grip" | "open";
};
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
const quatOf = (o: PutOpts, q = _q) => (o.rot instanceof THREE.Quaternion ? q.copy(o.rot) : Array.isArray(o.rot) ? q.setFromEuler(_e.set(o.rot[0], o.rot[1], o.rot[2], "YXZ")) : q.setFromEuler(_e.set(0, o.rot ?? 0, 0, "YXZ")));

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
/** a world point of a prop put at `at` with `o`: `local` in the prop's own axes (e.g. the mic's head [0, MIC.head, 0],
 *  the candle's flame [0, candleTop(len), 0]) */
export const propPoint = (name: PropName, at: V3Like, o: PutOpts, local: T3): THREE.Vector3 => {
  const s = o.scale ?? PROP_SCALE[name], q = quatOf(o, new THREE.Quaternion()), origin = toV(at);
  if (o.grip) { const g = gripOf(name, o.grip); origin.sub(V(g[0], g[1], g[2]).multiplyScalar(s).applyQuaternion(q)); }
  return origin.add(V(local[0], local[1], local[2]).multiplyScalar(s).applyQuaternion(q));
};

// ---------------------------------------------------------------------------------------------------- the builders
const BUILD: Record<PropName, (K: Kit, g: THREE.Group) => Hook> = {
  plate: T.plate, lid: T.lid, fork: T.fork, knife: T.knife, quill: T.quill, inkwell: T.inkwell, inkBottle: T.inkBottle, sheets: T.sheets,
  drafts: T.drafts, notes: T.notes, books: T.books, oldBook: T.oldBook, candle: T.candle, chair: T.chair, stool: T.stool,
  handkerchief: T.handkerchief, sack: T.sack, shovel: T.shovel, poker: T.poker, board: T.board, charcoal: T.charcoal,
  crucible: T.crucible, flask: T.flask, bellows: T.bellows, mic: T.mic, hand: T.hand, handR: T.handR,
};
const _g = V();
/** SHE IS INVISIBLE (Jay, 14 Nov): her mic and her hands are never drawn. The shots still put them (so the props they
 *  hold keep their places), but these three stay hidden: the handkerchief, the chair, the board and the door's raps
 *  move as if an invisible hand did it (the Qin film's way). */
export const INVISIBLE: ReadonlySet<PropName> = new Set<PropName>(["mic", "hand", "handR"]);
export function buildProps(M: Mats): Props {
  const group = new THREE.Group(); group.name = "newton-props";
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
        g.visible = !INVISIBLE.has(name); g.position.copy(toV(at)); g.scale.setScalar(s);
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

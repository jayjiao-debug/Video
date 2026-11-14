// THE PROPS of the Su film behind ONE interface (Props), Qin's / Wanbi's registry shape (PLAN section 4; WP3). The
// World builds it once per page and hides EVERY prop at the start of every frame (begin()): a shot puts the props it
// shows, every frame. The builders: props/things.ts (the things), props/dog.ts (the yard dog), props/horse.ts (the
// courier's horse: a copy of the kit's with a walk amount), props/her.ts (her hand and red mic: su/her.ts poses them).
// Every name, origin, axis, size and grip is in PROP_INFO / PROP_GRIP / PROP_HANDS below.
//
//   w.prop("cleaver").put(hand, { grip: "hilt", rot })   `at` is the HAND: the grip point is set on it; without grip,
//                                                       `at` is the prop's origin
//   put(at, { scale })     absolute scale; default = the film's size (PROP_SCALE)
//   put(at, { rot })       a yaw (radians, like a figure's facing: 0 = the prop's front toward +z), or [rx, ry, rz]
//                          (Euler "YXZ", radians) for a tilted thing (a bone held up, the ladder against the eave)
//   put(at, { open })      scroll: 0 rolled .. 1 open; trunk: the lid 0 shut .. 1 up; oyster: the top shell
//   put(at, { lit })       lantern: 0 dull .. 1 glowing; fire: the flames' size;  lantern { rest: true }: set down (no tassel)
//   put(at, { lid })       porkPot: 0 on .. 1 lifted off and set beside it
//   put(at, { steam, t })  stove: the steam over the pot (0..1) and its clock (seconds: f / FPS)
//   put(at, { ink })       letter: the writing 0 blank .. 1 the whole letter, cell by cell
//   put(at, { clean })     bone: true = picked spotless white
//   put(at, { peeled })    lychee: 0 whole .. 1 peeled (the shell's top lifts off the white fruit)
//   put(at, { pose, t, lookAt, from, k })   dog (props/dog.ts); horse: pose "stand" | "walk" | "gallop", t, amount
//                          (the walk's size: ease 1 -> 0 to stop), rider (the colour of the rider's legs it draws)
//   put(at, { t, on })     boat: the stern oar's swing (on: false = still)
//   put(at, { curl, item, peeled, wrist })   herHand; herMic: put(at, { wrist }) (su/her.ts does both)
//   w.prop(name, key)      another instance of the same prop (two bones, a row of lychees, the pile of shells)
// HANDS: holdPoints(name, at, opts) = the world points the holder's hands are pinned to for that very put: pin the
// hands there, w.update(), then put the prop with the same (at, opts). A HAND of the rig is a ball 4.6 cm across with
// no fingers: a grip passes through (or within a centimetre of) the ball's middle. Never read handWorld before update.
// SEATS: deskSeat (the cushion behind the desk, "write" / "sit"), bedSeat (the rattan bed), benchSeat (the bench),
// boatSeat (the stern seat), courierSeat (on the horse): each gives { at, facing, seat } for rig.set and, where the
// robe's skirt must lie over the thighs, says so (kit acc/garb.ts setSeat(rig, seat, facing)).
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { makeKit, V, type Kit } from "../../../kit/props/kit";
import * as T from "./things";
import { dog, DOG, type DogO } from "./dog";
import { horse, horseSeat, COATS, HORSE, type HorseO } from "./horse";
export { PC, STOVE, GRILL, BED, BENCH, BOAT, LADDER, DESK, CUSHION, SCROLL, LETTER, TRUNK, PORK_POT, OYSTER, STICK, BONE, SPINE, CLEAVER, BLOCK, LYCHEE, WINE_BOWL, STOOL, CHOPSTICKS, PLOUGH, FIRE } from "./things";
export { DOG, HORSE, horseSeat };
export { JAR, BASIN, CHEST, GATE, STONE } from "./things";

type V3Like = [number, number, number] | THREE.Vector3;
type T3 = [number, number, number];
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

export type PropName =
  | "cleaver" | "block" | "spine" | "coin" | "bone" | "stove" | "grill" | "wineBowl" | "stool" | "chopsticks" | "porkPot"
  | "ladder" | "lantern" | "bench" | "lychee" | "lycheeBunch" | "shell" | "rattanBed" | "scroll" | "desk" | "cushion"
  | "brush" | "inkstone" | "letter" | "trunk" | "robes" | "plough" | "boat" | "fire" | "oyster" | "stick" | "dog" | "horse"
  | "jar" | "basin" | "splash" | "boot" | "chest" | "goldPile" | "gate" | "blossomTree" | "peony" | "flag" | "turtle" | "stone";
/** what each prop is, where its origin is and which way its axes point (sizes at the film's scale) */
export const PROP_INFO = {
  cleaver: "the butcher's cleaver (A): a broad steel blade 0.20 x 0.10 with its edge toward +x, a wooden handle 0.12 m along -y. Origin = the middle of the grip; +y = toward the blade's far end. Grip hilt (the origin)",
  block: "the butcher's chopping block (A): a round log slab r 0.34, its end-grain top (rings, cut marks) at 0.80 m (layout MARKET_SET.block), on three splayed legs. Origin = the floor under its middle. (The carcass on the rack is the market SET's)",
  spine: "a bare lamb spine (A): nine vertebrae along x with spikes and side wings, a few pink scraps, 0.42 m. Origin = its middle. Grip pair = his two hands on its ends (x +-0.15: holdPoints)",
  coin: "a copper cash coin with a square hole, r 0.016, its face toward +z (A: he pays). Origin = its middle; grip hilt (the middle)",
  bone: "a grilled lamb bone (B): 0.16 m along y, knobbly ends, golden-brown with char stripes and meat on it; put({ clean: true }) = picked spotless white (B09). Origin = its middle; grip hilt = its lower end (y -0.055: the other end sticks up out of the hand)",
  stove: "the yard's clay stove (B): a double-mouthed clay stove 0.78 x 0.50, top 0.62 (layout YARD_SET.stove), an iron pot of broth on its left hole (STOVE.pot), the right hole for the grill (STOVE.grill), two glowing fire mouths in front (+z); put({ steam: 0..1, t }) = the steam rising from the pot. Origin = the ground under its middle (stovePoint gives the pot / grill in the world)",
  grill: "a small iron grill (B): five bars on a frame 0.24 x 0.18, its bars' top 0.05 above its feet. Origin = under its middle: put it at stovePoint(at, rot, \"grill\"); a bone on it lies at + GRILL.top",
  wineBowl: "the wine bowl (B): a shallow celadon bowl r 0.075, 0.05 high, amber wine in it. Origin = under its foot (on the stool: STOOL.top)",
  stool: "a low round stool beside the stove (B): top r 0.17 at 0.47 m, three legs, a little dish of salt on it (at x -0.09, z +0.04). Origin = the floor under its middle (layout YARD.wine is about its top)",
  chopsticks: "a pair of long cooking chopsticks (B): bamboo, 0.36 m, running down -y from the grip to the tips (1 cm apart there). Origin = the grip, 8 cm from their top ends; grip hilt (the origin)",
  porkPot: "the clay pot of red-braised pork (东坡肉; the flashback, the end picture): r 0.16, 0.18 high, glossy red cubes inside; put({ lid: 0..1 }) = the lid lifts up and over to its +x side, onto the same ground. Origin = under its middle. (The huangzhou SET draws its own pot: use one, never both)",
  ladder: "a bamboo ladder (B): two rails 2.80 m along +y, 0.42 apart, a rung every 0.30 m (the first at 0.25). Origin = the middle of its foot on the ground. Lean it: put(foot, { rot: ladderRot(foot, top) }); ladderRung(foot, top, k) = the middle of rung k in the world",
  lantern: "the red paper lantern (B, C, D, F): 0.40 m high with its caps (the tassel to 0.53), r 0.15, red paper on dark ribs, a gold band; put({ lit: 0..1 }) = lit from inside (self-lit; the place's light is its glow on other things); put({ rest: true }) = set down on its bottom cap (the tassel hidden). Origin = the hook at its top; grip hook (the origin). LANTERN_CENTRE = its paper's middle below the hook; LANTERN = its sizes (base -0.405 = the bottom cap's underside)",
  bench: "a rustic bench (B, E): a plank 1.50 x 0.36 at 0.45 m on four splayed legs, its long side along x (layout YARD_SET.bench). Origin = the floor under its middle. A sitter: benchSeat(at, rot, x)",
  lychee: "one lychee (C): a red bumpy fruit r 0.02; put({ peeled: 0..1 }) = its shell's top lifts away from the white flesh (1 = the white fruit in the shell's lower half). Origin = its middle; grip hilt (the middle)",
  lycheeBunch: "a bunch of eight lychees on a twig with three leaves (C), 0.16 m. Origin = the stem's top; grip hook (the origin)",
  shell: "one empty red lychee shell half (C26: on his sleeping belly), r 0.021, open side up (+y). Origin = its middle",
  rattanBed: "the rattan day bed under the lychee tree (C): 1.90 long along z x 0.72 wide, its woven top at 0.42 (layout YARD_SET.bed), a slanted woven backrest at the head end (-z, from z -0.62) rising 0.55 above the top, short legs. Origin = the MIDDLE OF ITS TOP (layout YARD.bed is that point); the sitter faces +z: bedSeat(at, rot)",
  scroll: "the order (D): a dark roller 0.42 m along x with gold knobs, a yellow silk sheet 0.36 x 0.30 with columns of ink and a red seal unrolling down -y with put({ open: 0..1 }), a second roller at its foot. Origin = the middle of the top roller; grip pair (the roller's ends, x +-0.19: holdPoints)",
  desk: "his writing desk (E): plain pale wood, top 1.20 x 0.56 at 0.42 m, four square legs; its long side along x. Origin = the floor under its middle; the sitter behind it at -z faces +z (deskSeat). (layout ROOM_SET.desk.top is 0.36: requested to follow this desk's 0.42)",
  cushion: "a square floor cushion (E): 0.62 x 0.62, 0.10 high (0.12 puffed), indigo with a pale edge. Origin = the floor under its middle (deskSeat puts it behind the desk)",
  brush: "a writing brush (E), 0.25 m: bamboo shaft, black hair tip. Origin = the middle of the shaft; +y = toward the tip. Grip hilt (3 cm from the middle away from the tip: the tip shows below the hand)",
  inkstone: "an ink stone (E) with a black ink pool: 0.16 x 0.10, 0.03 high. Origin = on the desk under its middle",
  letter: "the letter he writes (E): a sheet 0.30 x 0.22 flat on the desk with a paperweight along its far edge (-z); put({ ink: 0..1 }) = the writing appears cell by cell, 8 columns of 7 (0 = blank). Origin = the middle of the sheet on the desk top",
  trunk: "a wooden travel trunk (E): 0.70 x 0.42, 0.40 high, iron corners, cloth inside; put({ open: 0..1 }) = the lid swings up about its back edge to 105 deg. Origin = the floor under its middle; its front +z",
  robes: "a stack of three folded robes (E: ochre, blue-grey, rose), 0.40 x 0.30, 0.15 high. Origin = under its middle (the floor, a trunk's lid, the bench)",
  plough: "a wooden plough (B15, 黄州): the iron share in the ground at the front (z +1.0..1.15), the curved beam up and back to the handle at 0.85 m with a crossbar; the ploughman stands behind it at -z facing +z. Origin = the ground under the handle's grip; grip grip (the handle top, PLOUGH.grip) and pair (the crossbar's ends, x +-0.12)",
  boat: "the river boat (G): a low wooden hull 3.6 x 1.0 with its bottom ON y 0 (the water is 4 cm below), a black woven awning over the middle (z -1.0..0.1), a plank seat at the stern (BOAT.seat, top 0.36), a stern oar (橹) on a pivot on the +x rail (BOAT.oar) trailing back to the water, its handle forward at the oarsman's hands, swinging 0.12 rad with put({ t }) (on: false = still); bow toward -z (it moves away from the camera at rot 0), the stern toward +z. Origin = the middle of its bottom. boatSeat(at, rot): SU on the stern seat facing the stern, GUO standing at the oar behind the seat on the +x side (BOAT.stand), guoHands(t) on the handle",
  fire: "a small driftwood fire: four crossed logs, a glowing ember bed, five flames that flicker from put({ t }); put({ lit: 0..1 }) = the flames' size. Origin = the ground under its middle. (The beach SET draws its own fire in the ring: this is for a fire that is a prop)",
  oyster: "an oyster (H): a rough grey-brown top shell over a pearly cup with the oyster in it, 0.11 long along +z; put({ open: 0..1 }) lifts the top shell about the hinge. Origin = the hinge (-z end); grip hilt (the hinge: the cup sticks out toward +z)",
  stick: "his walking stick (I): a gnarled stick 0.90 m with a little crook at the top. Origin = the grip at its top; it runs down -y to its foot at -0.90 (SU_OLD's hand at 0.85-0.9 m puts its foot on the ground); grip hilt (the origin)",
  dog: "the yard dog (B, G): a small yellow village dog in toon geometry, 0.56 m long, its back 0.30 m up; put({ pose, t, lookAt, from, k }): idle / sniff / lookUp (head tilt, ears back: betrayed) / sit / walk / lie (props/dog.ts). Origin = the ground under its body's middle; it faces +z",
  horse: "the courier's horse (D): the kit's toon horse (bay, cream saddle cloth), 1.5 m long, back 0.965; put({ rot, pose: \"stand\" | \"walk\", t, amount, rider }): amount = the walk's size (ease 1 -> 0 to stop), rider = the colour of the rider's legs it draws (\"#c23a30\" for the courier). Origin = the ground under its middle, head toward +z. courierSeat(at, rot, pose, t, amount) = the rider's seat",
} as Record<PropName, string>;
Object.assign(PROP_INFO, {
  jar: "the wine jar (酒坛): brown clay r 0.15, 0.34 high, a red cloth over the mouth, a red 酒 label on +z. Origin = under its middle; grip pair (hands at x +-0.155, y 0.17)",
  basin: "a wooden basin of water r 0.2, 0.12 high; put({ open }) tips it forward (+z). Origin = under its middle; grip pair (x +-0.205, y 0.08)",
  splash: "a burst of water blobs flying toward +z; put({ open: 0..1 }) = its progress. Not solid (.spill)",
  boot: "a black court boot: shaft down -y from the origin (its top), foot toward +z. Grip hilt (the origin)",
  chest: "the little red chest of gold 0.32 x 0.2, 0.16 high; put({ open }) lifts the lid. Origin = under its middle; grip pair (x +-0.175, y 0.08)",
  goldPile: "gold ingots and coins heaped on a table top, r 0.2; put({ open: 0..1 }) = how much is left. Origin = the table top",
  gate: "the palace gate: two red studded doors across a 2.7 m opening, 3.0 high, on a dark frame; put({ open }) swings them away (-z). Origin = the floor under the opening's middle; faces +z",
  blossomTree: "a blossom tree, trunk 2.4 m, pink crown r ~1.6 from 1.9 m up. Origin = the trunk's foot",
  peony: "a blue-white pot of peonies, 0.85 m high. Origin = under the pot",
  flag: "the wine flag: a pole 3.2 m, a 酒 banner hanging toward +x. Origin = the pole's foot",
  turtle: "the gold turtle on a red cord, 0.07 long. Origin = its middle; grip hilt",
  stone: "a low flat stone seat 0.8 x 0.55, top 0.42. Origin = the ground under its middle",
});
export const PROP_NAMES = Object.keys(PROP_INFO) as PropName[];
/** the film's size of each prop (put's default scale) */
export const PROP_SCALE: Record<PropName, number> = Object.fromEntries(PROP_NAMES.map((n) => [n, 1])) as Record<PropName, number>;
PROP_SCALE.jar = 0.72; PROP_SCALE.wineBowl = 1.25;

// ---------------------------------------------------------------------------------------------------- grips
export type Grip = "hilt" | "pair" | "grip" | "hook";
/** every prop's grips, in the prop's own (unscaled) axes: the point put(hand, { grip }) sets on `at` */
export const PROP_GRIP: Partial<Record<PropName, Partial<Record<Grip, T3>>>> = {
  cleaver: { hilt: [0, 0, 0] }, coin: { hilt: [0, 0, 0] }, bone: { hilt: [0, T.BONE.hilt, 0] }, chopsticks: { hilt: [0, 0, 0] },
  lantern: { hook: [0, 0, 0] }, lychee: { hilt: [0, 0, 0] }, lycheeBunch: { hook: [0, 0, 0] }, brush: { hilt: [0, -0.03, 0] },
  oyster: { hilt: [0, 0, 0] }, stick: { hilt: [0, 0, 0] }, boot: { hilt: [0, 0, 0] }, turtle: { hilt: [0, 0, 0] }, wineBowl: { hilt: [0, 0.015, 0] },
  jar: { pair: [0, T.JAR.handY, 0] }, basin: { pair: [0, 0.08, 0] }, chest: { pair: [0, 0.08, 0] },
  spine: { pair: [0, 0, 0] }, scroll: { pair: [0, 0, 0] },
  plough: { grip: [0, T.PLOUGH.grip.y, 0], pair: [0, T.PLOUGH.grip.y, 0] },
};
/** the two hands of a two-hand grip (prop axes): hand 0 at -x, hand 1 at +x (a holder facing the way the prop faces) */
export const PROP_HANDS: Partial<Record<PropName, Partial<Record<Grip, T3[]>>>> = {
  spine: { pair: [[-T.SPINE.hand, 0, 0], [T.SPINE.hand, 0, 0]] }, scroll: { pair: [[-T.SCROLL.hand, 0, 0], [T.SCROLL.hand, 0, 0]] },
  plough: { pair: [[-0.12, T.PLOUGH.grip.y, 0], [0.12, T.PLOUGH.grip.y, 0]] },
  jar: { pair: [[-T.JAR.hand, T.JAR.handY, 0], [T.JAR.hand, T.JAR.handY, 0]] }, basin: { pair: [[-T.BASIN.hand, 0.08, 0], [T.BASIN.hand, 0.08, 0]] }, chest: { pair: [[-T.CHEST.hand, 0.08, 0], [T.CHEST.hand, 0.08, 0]] },
};
const gripOf = (name: PropName, grip: Grip): T3 => {
  const q = PROP_GRIP[name]?.[grip];
  if (!q) throw new Error(`props: ${name} has no grip "${grip}" (it has: ${Object.keys(PROP_GRIP[name] ?? {}).join(", ") || "none"})`);
  return q;
};

export type PutOpts = {
  scale?: number; rot?: number | [number, number, number]; grip?: Grip;
  open?: number; lit?: number; lid?: number; steam?: number; ink?: number; clean?: boolean; peeled?: number;
  /** seconds, for whatever moves by itself (steam, fire, dog, horse, the oar) */ t?: number;
  /** dog / horse */ pose?: string; lookAt?: V3Like; from?: string; k?: number; amount?: number; rider?: string;
  /** herHand */ curl?: number; item?: string;
  /** herMic / herHand: the forearm's bend at the wrist (Euler YXZ, radians; su/her.ts computes it) */ wrist?: [number, number, number];
  /** lantern: set down on its bottom cap (the tassel hidden) */ rest?: boolean;
  on?: boolean;
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
/** a point in a prop's own axes -> the world, for the prop put at `at` (its origin, no grip) with yaw / [rx, ry, rz] */
export const propPoint = (local: V3Like, at: V3Like, rot: PutOpts["rot"] = 0, scale = 1) => toV(local).multiplyScalar(scale).applyQuaternion(quatOf({ rot }, new THREE.Quaternion())).add(toV(at));

// ---------------------------------------------------------------------------------------------------- seats and spots
/** THE SEAT behind the desk (the rig's "write" / "sit" on the cushion; Qin's numbers, rig QA reach 0, clear >= 0): the
 *  desk's origin `at` and its yaw `rot` -> the cushion's place and the RigSeat + facing for the sitter.
 *    const S = deskSeat(ROOM.desk); w.prop("desk").put(ROOM.desk); w.prop("cushion").put(S.cushion, { rot: S.facing });
 *    a.set({ at: S.at, facing: S.facing, seat: S.seat, pose: { kind: "write", t } })   (low floor seat: no setSeat) */
export const deskSeat = (at: V3Like, rot = 0) => {
  const o = toV(at), c = Math.cos(rot), sn = Math.sin(rot), back = -(T.DESK.d / 2 + 0.25);
  const p = V(o.x + sn * back, o.y, o.z + c * back);
  return {
    at: p.clone(), facing: rot, cushion: p.clone(),
    seat: { top: V(p.x, o.y + 0.12, p.z), floor: o.y, back: 0.03, deskEdge: 0.25, deskTop: o.y + T.DESK.top },
  };
};
/** THE SEAT on the rattan bed (C): the rig has no lying pose (RIG3D pose kinds: idle walk wave point haul hold cheer sit
 *  desk write phone shh), so "stretched out" is the rig's "sit" on the bed's top near the head end, his back against
 *  the slanted backrest and his legs along the bed (the rig lays the shins on the bed when nothing lets them hang);
 *  "lie back, hands behind his head" = the same seat with both hands pinned beside the back of his head (bedHands).
 *  `at` = the bed's origin (the middle of its top, YARD.bed), rot its yaw. Returns { at, facing, seat } and the robe's
 *  seat (call kit garb.ts setSeat(rig, seat, facing) so the skirt lies over his thighs, not through the bed). */
export const bedSeat = (at: V3Like, rot = 0) => {
  const o = toV(at), hip = propPoint([0, 0, T.BED.back.z + 0.24], [o.x, o.y, o.z], rot);
  return {
    at: V(hip.x, o.y - T.BED.top, hip.z), facing: rot,
    seat: { top: hip, floor: o.y - T.BED.top, back: 0.03, front: T.BED.len / 2 - (T.BED.back.z + 0.24), backrest: 0.2, backrestTop: o.y + T.BED.back.h },
  };
};
/** the two world points his hands go to for "hands behind his head" (bedSeat, C after C23): beside and a little behind
 *  his head, at his ears' height (head = his headWorld() of the frame before, or the seat's head estimate) */
export const bedHands = (head: V3Like, facing: number, scale = 1.06): [THREE.Vector3, THREE.Vector3] => {
  const h = toV(head), c = Math.cos(facing), s = Math.sin(facing), side = 0.27 * scale, back = -0.06 * scale;
  return [V(h.x - c * side + s * back, h.y - 0.02, h.z + s * side + c * back), V(h.x + c * side + s * back, h.y - 0.02, h.z - s * side + c * back)];
};
/** THE SEAT on the bench (B, E): `at` = the bench's origin, rot its yaw, x = how far along it (m, + = its +x end); the
 *  sitter faces the bench's front (+z at rot 0). For a figure of chair height call setSeat(rig, seat, facing). */
export const benchSeat = (at: V3Like, rot = 0, x = 0) => {
  const o = toV(at), top = propPoint([x, T.BENCH.top, 0.02], o, rot);
  return { at: V(top.x, o.y, top.z), facing: rot, seat: { top, floor: o.y, back: 0.03, front: T.BENCH.d / 2 + 0.02 } };
};
/** THE BOAT'S PLACES (G): SU sits on the stern seat facing the stern (toward the camera at rot 0); GUO stands at the
 *  oar just behind the awning on the boat's +x side (behind SU and to the right as we see it from the stern), facing
 *  the stern too, his two hands on the oar's handle (guoHands: it swings with t, so pass the boat's t);
 *  `at` = the boat's origin, rot its yaw.
 *    const B = boatSeat(at, rot); su.set({ at: B.at, facing: B.facing, seat: B.seat, pose: { kind: "sit", t } })
 *    guo.set({ at: B.guo, facing: B.facing, pose: { kind: "idle", t }, hands: B.guoHands(t) })   (B.guo.y = the deck) */
export const boatSeat = (at: V3Like, rot = 0) => {
  const o = toV(at), top = propPoint(T.BOAT.seat, o, rot), deck = o.y + T.BOAT.deck;
  const handle = (t: number, dx: number) => {
    const local = T.BOAT.handle.clone().add(V(dx, 0, 0.01)).applyAxisAngle(V(0, 1, 0), T.boatSwing(t)).add(T.BOAT.oar);
    return propPoint(local, o, rot);
  };
  return {
    at: V(top.x, deck, top.z), facing: rot, seat: { top, floor: deck, back: 0.03, front: 0.15 },
    guo: (() => { const p = propPoint(T.BOAT.stand, o, rot); p.y = deck; return p; })(), oar: propPoint(T.BOAT.oar, o, rot),
    /** GUO's two hands on the oar's handle at time t (s): [right, left] (the rig's arm 0, arm 1) */
    guoHands: (t: number): [THREE.Vector3, THREE.Vector3] => [handle(t, -0.09), handle(t, 0.0)],
  };
};
/** THE RIDER on the horse (D): the RigSeat for the courier on a horse put at `at` with yaw `rot`, pose, t, amount (the
 *  same as the horse's put): seat.top = horseSeat (it rides the bob); facing = rot. The rig cannot straddle: its seat
 *  is inside the horse's back and the horse draws the rider's legs (put({ rider: "#c23a30" })): the clearance checker
 *  lists the rider's legs in the horse as `rider` (by design). */
export const courierSeat = (at: V3Like, rot = 0, pose = "stand", t = 0, amount = 1) => {
  const o = toV(at), top = horseSeat(o, rot, pose, t, 1, amount);
  return { at: V(top.x, o.y, top.z), facing: rot, seat: { top, floor: o.y, back: 0.03 } };
};
/** THE PLOUGHMAN (B15, 黄州): the plough in front of a figure standing at `at` facing `facing` (the plough's grip 0.32 m
 *  ahead of him, the plough pointing his way) and his two hands on its crossbar. Walk him along the furrow and put the
 *  plough from his walking point every frame: it goes with him.
 *    const P = ploughFor(leg.at, leg.facing); w.prop("plough").put(P.at, { rot: P.rot }); su.set({ ..., hands: P.hands }) */
export const ploughFor = (at: V3Like, facing = 0) => {
  const p = propPoint([0, 0, 0.32], toV(at), facing);
  return { at: p, rot: facing, hands: holdPoints("plough", propPoint(T.PLOUGH.grip, p, facing), { grip: "pair", rot: facing }) as [THREE.Vector3, THREE.Vector3] };
};
/** the ladder leaning from its foot to its top (world points): the rot for put (its +y runs from foot to top) */
export const ladderRot = (foot: V3Like, top: V3Like): [number, number, number] => {
  const d = toV(top).sub(toV(foot)), yaw = Math.atan2(d.x, d.z), lean = Math.atan2(Math.hypot(d.x, d.z), d.y);
  return [lean, yaw, 0];
};
/** the middle of rung k (0 = the lowest, at 0.25 m along the rails) of the ladder from foot toward top, in the world */
export const ladderRung = (foot: V3Like, top: V3Like, k: number) => {
  const f = toV(foot), d = toV(top).sub(f).normalize();
  return f.addScaledVector(d, 0.25 + k * T.LADDER.rung);
};
/** the stove's pot (its broth's middle) or grill place (where the grill's feet stand) in the world */
export const stovePoint = (at: V3Like, rot = 0, which: "pot" | "grill" = "pot") => propPoint(which === "pot" ? T.STOVE.pot : T.STOVE.grill, at, rot);
/** the lantern's paper middle below its hook (for the pines' glow param and the warm light on his face) */
export const LANTERN_CENTRE = T.LANTERN.centre;
/** the lantern's sizes under its hook (things.ts LANTERN: centre, base = the bottom cap's underside -0.405, tassel tip
 *  -0.53, paper radius 0.15). Set down on a step: put(V(x, stepTop - LANTERN.base, z), { rest: true }) */
export const LANTERN = T.LANTERN;
/** HOW FAR THESE PROPS' FEET STOP ABOVE THEIR ORIGIN (m; measured with the clearance checker, 2026-11-13: segA
 *  BLOCK_SINK, segB STOOL_SINK / BENCH_SINK, segE's bench): put them that much LOWER to stand them on the ground,
 *  put(at.clone().setY(groundY - FOOT_LIFT.bench)). The geometry is left as it is on purpose: A, B and E already sink
 *  them by exactly these numbers (a fixed prop would then sink into the ground there). WP3-fix, 2026-11-14 */
export const FOOT_LIFT = { block: 0.012, stool: 0.013, bench: 0.015 } as const;

// ---------------------------------------------------------------------------------------------------- the builders
type Builder = (K: Kit, g: THREE.Group) => ((o: PutOpts, g: THREE.Group) => void) | void;
const BUILD: Record<PropName, Builder> = {
  cleaver: T.cleaver, block: T.block, spine: T.spine, coin: T.coin, bone: T.bone, stove: T.stove, grill: T.grill, wineBowl: T.wineBowl,
  stool: T.stool, chopsticks: T.chopsticks, porkPot: T.porkPot, ladder: T.ladder, lantern: T.lantern, bench: T.bench, lychee: T.lychee,
  lycheeBunch: T.lycheeBunch, shell: T.shell, rattanBed: T.rattanBed, scroll: T.scroll, desk: T.desk, cushion: T.cushion, brush: T.brush,
  inkstone: T.inkstone, letter: T.letter, trunk: T.trunk, robes: T.robes, plough: T.plough, boat: T.boat, fire: T.fire, oyster: T.oyster,
  stick: T.stick,
  dog: (K, g) => { const hk = dog(K, g); return (o, gg) => hk({ pose: o.pose, t: o.t, lookAt: o.lookAt, from: o.from, k: o.k } as DogO, gg); },
  horse: (K, g) => { const hk = horse(K, g, COATS.horse); return (o, gg) => hk({ t: o.t, pose: o.pose, rider: o.rider, amount: o.amount } as HorseO, gg); },
  jar: T.jar, basin: T.basin, splash: T.splash, boot: T.boot, chest: T.chest, goldPile: T.goldPile, gate: T.gate, blossomTree: T.blossomTree, peony: T.peony, flag: T.flag, turtle: T.turtle, stone: T.stone,
};
const _g = V();
export function buildProps(M: Mats): Props {
  const group = new THREE.Group(); group.name = "su-props";
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
export { HORSE as HORSE_SIZES, DOG as DOG_SIZES };
export { DOG_GROUND, dogGroundY } from "./dog";

// THE PROPS of the Hongmen film behind ONE interface (Props). The World builds it once per page and hides EVERY prop
// at the start of every frame (begin()): a shot puts the props it shows, every frame.
//
// STATE OF THIS FILE: the REAL props (props/things.ts, props/horse.ts, built with props/kit.ts). Every name of the
// engine's stand-in is kept with its origin and axes; the new names are listed in PROP_INFO. Notes, sizes, grips and
// which line uses what: /home/user/hm_notes/w_props.md. Sheet: preview/props_sheet.ts.
//
// Every prop has an ORIGIN and AXES (PROP_INFO): put(at) sets the origin on the world point `at`.
//   put(at, { facing })       turns it about y like a figure: facing 0 = its front (+z of the prop) toward +z (the
//                             camera side), PI/2 = toward +x
//   put(at, { up, face? })    full orientation: the prop's +y along `up`, its +z as near `face` as it can (default:
//                             toward +z); for a sword in a hand, a shield held upright, a jade ring held up
//   put(at, { scale })        uniform scale (default 1)
//   put(at, { grip: true })   `at` is the HAND: the prop's grip point (PROP_GRIP, in the prop's own axes) is set on
//                             `at` instead of its origin (the jade hangs under the hand, the banner's pole passes through it)
//   put(at, { t, pose })      t (seconds) drives what moves by itself (a flame, a cloth, the horse's gait); pose = the
//                             horse's "stand" | "walk" | "gallop". A pure function of t: nothing is kept between frames.
//   put(at, { rider })        horses only: a colour = the rider's two legs are drawn down the horse's sides in it (the
//                             rig cannot straddle; see props/horse.ts). Leave out: no rider.
// A prop that follows a hand is put AFTER w.update():  w.prop("sword0").put(r.handWorld(0), { up: tipDir })
// A HAND of the rig is a ball 4.6 cm across with no fingers: a grip passes through the ball's middle (grips here are
// 3 to 4 cm thick, so the hand shows round them). The rig draws a figure's own arms BEHIND its head unless the shot
// sets armFront: a prop is drawn at its true depth, so a hand that holds a prop in front of the face needs armFront.
// INK: every prop is on layer NOINK with its own black hull outline (props/kit.ts): the outline pass never sees a prop.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import * as L from "../layout";
import { makeKit } from "./kit";
import * as T from "./things";
import { horse, horseGait, horseSeat, HORSE, COATS } from "./horse";

type V3Like = [number, number, number] | THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());

export type CupName = `cup:${L.Role}`;
export type PropName =
  | "sword0" | "sword1" | "sword2" | "shield" | "shieldDown" | CupName | "bigCup" | "earCup" | "ladle" | "wineJar" | "ding" | "dish0" | "dish1"
  | "pigLeg" | "legSlice" | "jade" | "bi" | "yudou" | "shards" | "tray" | "trayRest" | "flag" | "banner:liu" | "banner:xiang" | "torch0" | "torch1"
  | "cap" | "horse" | "horse1" | "horse2" | "horse3" | "note";
/** what each prop is, where its origin is and which way its axes point */
export const PROP_INFO: Record<PropName, string> = {
  sword0: "the dancer's drawn sword (剑; lines 2, 12, 13; Fan Kuai cuts the leg with it at 15). Origin = the middle of the grip (the hand); +y = toward the TIP (0.80 m from the hand; the pommel 0.11 m the other way); the blade's flat faces the prop's z: give face = toward the camera. Purple grip",
  sword1: "the uncle's drawn sword (lines 2, 13). As sword0, grey-purple grip",
  sword2: "Fan Kuai's own drawn sword (lines 14, 15, if both dance swords are in the picture). As sword0, red grip",
  shield: "Fan Kuai's tall red lacquer shield (0.58 wide along the prop's x, 0.80 tall along its z, 7 cm thick + the boss). Origin = the middle of its BACK; +y = out of its front (boss). put(at) = lying on the floor at `at`, boss up, its long side along z. Held upright: { up: the way it faces, face: [0, 1, 0] } (the long side stands up)",
  shieldDown: "the same shield lying FACE DOWN: the chopping board of line 15. Origin = on the floor under its middle; +y up; the flat back is the top, 0.07 m above the origin; long side along z (facing 0)",
  "cup:liu": "Liu Bang's wine cup (卮): RED lacquer with a gold band (the cup on the empty seat). Origin = the middle of its foot; +y up; 0.09 high, 0.10 across. On the table: put(SEATS.liu.cup)",
  "cup:zhang": "Zhang Liang's cup: black lacquer, red band, red inside (as cup:liu)", "cup:fankuai": "the cup on Fan Kuai's empty table (as cup:zhang)",
  "cup:xiangyu": "Xiang Yu's cup (as cup:zhang); also at NIGHT_X.seat.cup", "cup:uncle": "the uncle's cup (as cup:zhang); also in Liu Bang's hand at line 7",
  "cup:fanzeng": "Fan Zeng's cup (as cup:zhang)",
  bigCup: "the big cup (斗卮) handed to Fan Kuai: the lacquer cup 1.8 times as big (0.16 high, 0.18 across) with a ring handle toward +x. Origin = the middle of its foot; +y up",
  earCup: "a loose ear cup (耳杯): an oval lacquer bowl with two ears, 0.16 long (x), 0.05 high. Origin = the middle of its foot; +y up. (Every table of the tent set already carries a fixed one)",
  ladle: "the wine ladle (勺). Origin = the bottom of its bowl; +y up; the handle rises toward +x; grip at the handle's end",
  wineJar: "the wine vessel (樽): a lacquer drum on three bronze feet, 0.33 across, 0.32 high, wine in it. Origin = on the floor under its middle; +y up",
  ding: "a bronze cauldron (鼎): 0.54 across, 0.54 high, three legs, two ears. Origin = on the floor under its middle; +y up. Dressing: never beside the raw leg (the joke is that nothing is cooked)",
  dish0: "a lacquer dish with three pieces of cooked meat, 0.19 across. Origin = the middle of its foot; +y up", dish1: "as dish0",
  pigLeg: "the RAW pork leg (line 15): a whole shoulder with the rind and the trotter, raw meat at the thick end. Origin = its middle; it lies along x (0.535 m: the cut end at -x, the hoof at +x; 0.24 thick), +y up. Lying on a surface: origin 0.103 above it",
  legSlice: "a cut slice of the raw leg (line 15). Origin = the middle of its underside; +y up; 0.15 x 0.12 m, 2.4 cm thick",
  jade: "Fan Zeng's jade ring (玉玦; line 11 raised three times): a flat green ring 0.15 across with a slit at the bottom, on a red cord. Origin = its centre; the ring faces +z; +y = up the cord; the hand holds the cord's knot 0.15 above the centre (grip)",
  bi: "one white jade disc (白璧; line 21 in Xiang Yu's hand): 0.17 across. Origin = its centre; it faces +z",
  yudou: "one jade wine cup (玉斗). Origin = the middle of its foot; +y up; 0.062 high",
  shards: "the two jade cups smashed (not in script v4's picture plan): pieces on the floor within 0.17 m. Origin = on the floor in their middle",
  tray: "the gift table (lines 19, 21): a small lacquer stand with a red silk pad, on it the PAIR of white jade discs and the PAIR of jade cups. Origin = on the floor under its middle (layout TRAY); +y up; its long side (0.44) along z. Carried: a hand under each short end of the top",
  trayRest: "the gift table with ONE disc left (the other is the prop `bi` in Xiang Yu's hand). As tray",
  flag: "the red flag on its pole (line 3). Origin = the pole's foot; +y = up the pole (layout CARD.city.pole); the cloth flies toward +x (two tails) and ripples with { t }",
  "banner:liu": "a carried army banner of Liu Bang's side: a 2.3 m pole, a cross bar, a red hanging cloth with 刘. Origin = the pole's foot; +y up the pole; the cloth hangs on the +x side and faces z; grip 0.95 up the pole; sways with { t }",
  "banner:xiang": "as banner:liu: deep purple with a gold 项",
  torch0: "a hand torch. Origin = the grip; +y = toward the flame (its foot 0.44 up, its tip 0.71); the flame rises straight up in the world whatever the tilt and breathes with { t }", torch1: "as torch0",
  cap: "the informer's gable cap as a thing on the ground (line 20): the cast's own cap shape. Origin = the middle of its foot; +y up; the ridge runs along z; 0.22 x 0.25 at the foot, 0.36 across the eaves, 0.27 high",
  horse: "Liu Bang's horse (lines 8, 18): bay, a cream saddle cloth (a red rider reads on it), a red noseband, no stirrups. Origin = on the ground under its middle; its head toward +z; 1.5 m long, back 0.965, ears 1.56 (short legs, a big head: the figures' style). { pose: stand | walk | gallop, t, rider: the rider's robe colour }. The rider's seat.top = horseSeat(at, facing, pose, t)",
  horse1: "a rider's horse: grey, cream saddle cloth (as horse)", horse2: "the chariot's horse: dark brown, a yoke bar 0.72 wide over the withers, no saddle (as horse)", horse3: "a rider's horse: dun, red saddle cloth (as horse)",
  note: "the informer's message (line 5, if it is handed over): a ROLL OF BAMBOO SLIPS tied with red cord (no paper). Origin = its middle; it lies along x (0.2 m), 5.4 cm thick",
};
export const PROP_NAMES = Object.keys(PROP_INFO) as PropName[];
/** where a hand holds a prop, in the prop's own axes (put(hand, { grip: true })). A prop that is not listed is held at its origin. */
export const PROP_GRIP: Partial<Record<PropName, [number, number, number]>> = {
  jade: [0, T.JADE_D.grip, 0], ladle: T.LADLE.grip, "banner:liu": [0, T.BANNER.grip, 0], "banner:xiang": [0, T.BANNER.grip, 0], flag: [0, 0.3, 0],
  bigCup: [0.047 * T.CUP.bigK + 0.02, 0.085, 0],
};
/** the sizes a shot needs (metres) */
export const PROP_DIMS = { SWORD: T.SWORD, SHIELD: T.SHIELD_D, PIG: T.PIG, SLICE: T.SLICE, JADE: T.JADE_D, BI: T.BI, YUDOU: T.YUDOU, CUP: T.CUP, WINE: T.WINE, DING: T.DING, TORCH: T.TORCH, BANNER: T.BANNER, CAP: T.CAP, HORSE };
export { horseSeat, horseGait, HORSE };

export type PutOpts = { facing?: number; up?: V3Like; face?: V3Like; scale?: number; grip?: boolean; t?: number; pose?: string; rider?: string };
export type Prop = {
  name: PropName;
  group: THREE.Group;
  /** shows the prop with its origin (or, with grip: true, its grip point) at `at` (world) */
  put(at: V3Like, o?: PutOpts): Prop;
  hide(): void;
};
export type Props = {
  /** every prop's group; add it to the scene once */
  group: THREE.Group;
  names: PropName[];
  /** the prop with this name. Throws on an unknown name. */
  prop(name: PropName): Prop;
  /** hides every prop and puts it back to scale 1, no turn: the World's beginFrame calls it */
  begin(): void;
};

const _x = V(), _y = V(), _z = V(), _g = V(), _m = new THREE.Matrix4();
export function buildProps(M: Mats): Props {
  const group = new THREE.Group(); group.name = "hongmen-props";
  const K = makeKit(M);
  const made = new Map<PropName, Prop>();
  const make = (name: PropName, build: (g: THREE.Group) => T.Hook | void) => {
    const g = new THREE.Group(); g.name = `prop.${name}`; g.visible = false;
    const hook = build(g) || null, grip = PROP_GRIP[name];
    group.add(g);
    const prop: Prop = {
      name, group: g,
      put(at, o = {}) {
        const s = o.scale ?? 1;
        g.visible = true; g.position.copy(toV(at)); g.scale.setScalar(s);
        if (o.up) {
          _y.copy(toV(o.up)).normalize(); _z.copy(o.face ? toV(o.face) : V(0, 0, 1));
          _x.crossVectors(_y, _z); if (_x.lengthSq() < 1e-8) _x.crossVectors(_y, V(1, 0, 0));
          _x.normalize(); _z.crossVectors(_x, _y).normalize();
          g.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
        } else g.rotation.set(0, o.facing ?? 0, 0);
        if (o.grip && grip) g.position.sub(_g.set(grip[0], grip[1], grip[2]).multiplyScalar(s).applyQuaternion(g.quaternion));
        hook?.({ t: o.t ?? 0, pose: o.pose, rider: o.rider }, g);
        g.updateMatrixWorld(true);
        return prop;
      },
      hide() { g.visible = false; },
    };
    made.set(name, prop);
  };

  make("sword0", (g) => T.sword(K, g, "#5b3f8a")); make("sword1", (g) => T.sword(K, g, "#7d6f98")); make("sword2", (g) => T.sword(K, g, "#a82a26"));
  make("shield", (g) => T.shield(K, g, true)); make("shieldDown", (g) => T.shield(K, g, false));
  for (const r of Object.keys(L.SEATS) as L.Role[]) make(`cup:${r}`, (g) => T.cup(K, g, r === "liu"));
  make("bigCup", (g) => T.cup(K, g, false, T.CUP.bigK, true));
  make("earCup", (g) => T.earCup(K, g)); make("ladle", (g) => T.ladle(K, g)); make("wineJar", (g) => T.wineJar(K, g)); make("ding", (g) => T.ding(K, g));
  make("dish0", (g) => T.dish(K, g)); make("dish1", (g) => T.dish(K, g));
  make("pigLeg", (g) => T.pigLeg(K, g)); make("legSlice", (g) => T.legSlice(K, g));
  make("jade", (g) => T.jade(K, g)); make("bi", (g) => T.bi(K, g)); make("yudou", (g) => T.yudou(K, g)); make("shards", (g) => T.shards(K, g));
  make("tray", (g) => T.tray(K, g, true)); make("trayRest", (g) => T.tray(K, g, false));
  make("flag", (g) => T.flag(K, g));
  make("banner:liu", (g) => T.banner(K, g, "#c8322c", "#8a211f", "#f4e7c4", "刘")); make("banner:xiang", (g) => T.banner(K, g, "#5b36a0", "#3a2168", "#e2b03a", "项"));
  make("torch0", (g) => T.torch(K, g)); make("torch1", (g) => T.torch(K, g));
  make("cap", (g) => T.cap(K, g));
  for (const n of ["horse", "horse1", "horse2", "horse3"] as const) make(n, (g) => horse(K, g, COATS[n]));
  make("note", (g) => T.note(K, g));

  return {
    group, names: PROP_NAMES,
    prop(name) { const q = made.get(name); if (!q) throw new Error(`props: no prop "${name}" (${PROP_NAMES.join(", ")})`); return q; },
    begin() { for (const q of made.values()) { q.group.visible = false; q.group.scale.setScalar(1); q.group.rotation.set(0, 0, 0); } },
  };
}

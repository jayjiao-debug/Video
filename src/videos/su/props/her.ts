// HER ARMS as props (PLAN 3; WP3): the geometry of the reporter's right hand with the RED MIC and of her left hand, in
// the kit's toon prop style (one ink hull per part, layer NOINK, the place's paint: at night her hand is night-lit).
// They are PROPS (props/index.ts "herMic", "herHand") so that the clearance checker tests them against the figures,
// the props and the set like anything else (prop-fig, prop-set; the float test lists them as "support below": by
// design, she holds them). WHERE they are is su/her.ts (putHer: posed from the camera every frame); this file only
// builds them and reads the put's options:
//   herMic   origin = the middle of the mic's foam ball; +y = from her hand toward the ball (the mic's axis); +z = the
//            back of her hand (up on screen in the "toward" hold). The red body runs down -y from the ball through her
//            fist (MIC.grip) to its end; the cream-pink jacket cuff and sleeve go on down -y from her wrist.
//            Options: wrist [rx, ry, rz] = the forearm's bend at the wrist (Euler YXZ, radians: su/her.ts sends the sleeve
//            off toward her shoulder, out of the frame, whatever way the mic points). The hand is always closed round it.
//   herHand  origin = the middle of her palm; +y = toward her fingertips; +z = the back of her hand; her thumb on +x
//            (a LEFT hand, palm down). Options: curl 0..1 (0 = open flat, 1 = closed round what it holds), item
//            "bone" | "boneClean" | "lychee" | "lycheePeeled" | none (held in the palm), peeled (the lychee's shell),
//            wrist (the forearm's bend, as for the mic)
// Sizes: MIC, HAND. The ink is thin (1.2 mm): these are 0.2-0.6 m from the lens, where a prop's usual 6 mm line would be
// 25 px wide.
import * as THREE from "three";
import { V, Part, limb, ball, type Kit } from "../../../kit/props/kit";
import type { PutOpts } from "./index";
import { BONE, LYCHEE } from "./things";

/** the mic: the foam ball's radius, the ring, the body's length below the ball, where her fist grips it (y), the cuff */
export const MIC = { ball: 0.032, ring: -0.036, body: 0.2, grip: -0.13, wrist: -0.175, sleeve: 0.42 } as const;
/** her hand: the palm's width / length / thickness, a finger's radius and length, the sleeve's length */
export const HAND = { w: 0.074, len: 0.074, t: 0.03, finger: 0.0092, fLen: 0.05, sleeve: 0.42 } as const;
const INK = 0.0012;
export const HER_COL = { skin: "#f8d8c0", skinLo: "#eebca0", cuff: "#f2cfc8", cuffBand: "#e2aea8", sleeve: "#f6dcd4", mic: "#d23a34", micLo: "#a82a28", foam: "#4a464e", ring: "#f0ece4" } as const;

/** a finger: a two-joint chain in a group per joint (curl bends both) */
type Finger = { base: THREE.Group; mid: THREE.Group };
const fingerOf = (K: Kit, parent: THREE.Object3D, at: THREE.Vector3, len: number, r: number, skin: THREE.Material, name: string): Finger => {
  const base = new THREE.Group(); base.position.copy(at); parent.add(base);
  new Part(K).add(skin, limb(V(0, 0, 0), V(0, len * 0.55, 0), r, r * 0.95, 10), INK).add(skin, ball(V(0, 0, 0), r, [1, 1, 1], 10), 0).into(base, name);
  const mid = new THREE.Group(); mid.position.set(0, len * 0.55, 0); base.add(mid);
  new Part(K).add(skin, limb(V(0, 0, 0), V(0, len * 0.45, 0), r * 0.95, r * 0.88, 10), INK).add(skin, ball(V(0, len * 0.45, 0), r * 0.88, [1, 1, 1], 10), INK).add(skin, ball(V(0, 0, 0), r * 0.95, [1, 1, 1], 10), 0).into(mid, name);
  return { base, mid };
};
/** the sleeve: a cream-pink cuff band at the wrist and the sleeve going on back down -y (out of the frame), in a group
 *  that pivots at the wrist (the forearm's bend: put({ wrist })) */
const sleeveOf = (K: Kit, g: THREE.Object3D, wrist: number, len: number, name: string) => {
  const pivot = new THREE.Group(); pivot.position.set(0, wrist, 0); g.add(pivot);
  const S = new Part(K);
  S.add(K.flat(HER_COL.cuffBand, { rough: 0.85 }), new THREE.CylinderGeometry(0.036, 0.038, 0.03, 18).translate(0, -0.015, 0), INK);
  S.add(K.flat(HER_COL.sleeve, { rough: 0.9 }), new THREE.CylinderGeometry(0.037, 0.05, len, 18).translate(0, -0.03 - len / 2, 0), INK);
  S.into(pivot, name);
  return pivot;
};
const bend = (pivot: THREE.Object3D, w?: [number, number, number]) => { if (w) pivot.rotation.set(w[0], w[1], w[2], "YXZ"); else pivot.rotation.set(0, 0, 0); };

/** the right hand with the red mic (see the head of this file) */
export const herMic = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), red = K.flat(HER_COL.mic, { rough: 0.35 }), redLo = K.flat(HER_COL.micLo, { rough: 0.4 }), skin = K.flat(HER_COL.skin, { rough: 0.7 });
  P.add(K.flat(HER_COL.foam, { rough: 0.95 }), ball(V(0, 0, 0), MIC.ball, [1, 1, 1], 18), INK);
  P.add(K.flat(HER_COL.ring, { rough: 0.4 }), new THREE.CylinderGeometry(0.021, 0.02, 0.01, 18).translate(0, MIC.ring, 0), INK);
  P.add(red, new THREE.CylinderGeometry(0.0195, 0.0145, MIC.body - 0.04, 18).translate(0, MIC.ring - 0.005 - (MIC.body - 0.04) / 2, 0), INK);
  P.add(redLo, new THREE.CylinderGeometry(0.0148, 0.0135, 0.016, 16).translate(0, MIC.ring - MIC.body + 0.03, 0), INK);
  // the fist round the handle: the back of the hand toward +z, the knuckles on top, four curled fingers wrapping under
  // to -z, the thumb along the handle's +x side
  const gy = MIC.grip;
  P.add(skin, ball(V(-0.004, gy - 0.004, 0.018), 0.03, [1.05, 1.15, 0.72], 16), INK);
  for (let i = 0; i < 4; i++) {
    const y = gy + 0.024 - i * 0.016;
    P.add(skin, ball(V(-0.022, y, 0.006), 0.0105, [1, 0.95, 1.1], 10), INK);                 // the knuckle side, wrapping round
    P.add(skin, ball(V(-0.012, y - 0.002, -0.02), 0.0098, [1.1, 0.9, 1], 10), INK);          // the fingertips under the handle
  }
  P.add(skin, limb(V(0.018, gy - 0.012, 0.01), V(0.02, gy + 0.022, 0.012), 0.0105, 0.0095, 10), INK);   // the thumb
  P.add(skin, ball(V(0.02, gy + 0.024, 0.012), 0.0095, [1, 1, 1], 10), 0);
  P.add(skin, new THREE.CylinderGeometry(0.026, 0.03, 0.05, 16).translate(0, MIC.wrist + 0.01, 0.006), INK);   // the wrist
  P.into(g, "herMic");
  const pivot = sleeveOf(K, g, MIC.wrist - 0.005, MIC.sleeve, "herMic.sleeve");
  return (o: PutOpts) => bend(pivot, o.wrist);
};

/** the left hand (see the head of this file) */
export const herHand = (K: Kit, g: THREE.Group) => {
  const skin = K.flat(HER_COL.skin, { rough: 0.7 }), H = HAND;
  const P = new Part(K);
  // the palm: a soft slab, a heel at the wrist
  const palm = new THREE.SphereGeometry(0.5, 18, 12).scale(H.w, H.len, H.t).translate(0, 0, 0);
  P.add(skin, palm, INK);
  P.add(skin, new THREE.CylinderGeometry(0.026, 0.029, 0.05, 16).translate(0, -H.len / 2 - 0.012, -0.002), INK);
  P.into(g, "herHand");
  const pivot = sleeveOf(K, g, -H.len / 2 - 0.03, H.sleeve, "herHand.sleeve");
  // four fingers along +y from the palm's top edge, a thumb from its +x side
  const fingers: Finger[] = [-0.027, -0.009, 0.009, 0.027].map((x, i) => fingerOf(K, g, V(x, H.len / 2 - 0.006, 0.002), H.fLen * [0.86, 1, 0.96, 0.8][i], H.finger, skin, "herHand.finger"));
  const thumb = fingerOf(K, g, V(H.w / 2 - 0.006, -0.008, -0.004), 0.042, H.finger * 1.05, skin, "herHand.thumb");
  thumb.base.rotation.set(0, 0, -0.75);
  // the things she holds (in the palm, under the curled fingers)
  const items = new Map<string, THREE.Group>();
  const item = (name: string, build: (gg: THREE.Group) => void) => { const gg = new THREE.Group(); gg.visible = false; g.add(gg); build(gg); items.set(name, gg); };
  const boneOf = (clean: boolean) => (gg: THREE.Group) => {
    const Q = new Part(K), m = K.flat(clean ? "#f0e8d8" : "#b8743a", { rough: 0.6 }), e = K.flat(clean ? "#f0e8d8" : "#8a4e26", { rough: 0.6 });
    Q.add(m, new THREE.CylinderGeometry(0.0125, 0.014, BONE.len - 0.04, 12).rotateZ(Math.PI / 2), INK * 1.5);
    for (const s of [-1, 1]) Q.add(e, ball(V(s * (BONE.len / 2 - 0.016), 0, 0), 0.017, [0.9, 1, 0.85], 10), INK * 1.5);
    if (!clean) Q.add(e, ball(V(-0.03, 0, 0), 0.02, [1.6, 1.05, 1.05], 10), INK * 1.5);
    Q.into(gg, "herHand.item");
    gg.position.set(0.02, 0.026, -0.03);
  };
  item("bone", boneOf(false)); item("boneClean", boneOf(true));
  const lycheeOf = (peeled: boolean) => (gg: THREE.Group) => {
    new Part(K).add(K.flat(peeled ? "#f4eee2" : "#c8323a", { rough: peeled ? 0.2 : 0.7 }), ball(V(0, 0, 0), LYCHEE.r * (peeled ? 0.88 : 1), [1, 1.08, 1], 14), INK * 1.5).into(gg, "herHand.item");
    gg.position.set(0, 0.02, -0.034);
  };
  item("lychee", lycheeOf(false)); item("lycheePeeled", lycheeOf(true));
  return (o: PutOpts) => {
    bend(pivot, o.wrist);
    const c = Math.max(0, Math.min(1, o.curl ?? 0));
    // a closed hand: each finger bends ~75 deg at the base and ~95 at the middle (toward the palm, -z)
    fingers.forEach((f, i) => { f.base.rotation.set(-1.3 * c - 0.08 * (1 - c) * i, 0, (i - 1.5) * 0.06 * (1 - c)); f.mid.rotation.set(-1.65 * c - 0.1, 0, 0); });
    thumb.base.rotation.set(-0.7 * c, 0.4 * c, -0.75 + 0.5 * c); thumb.mid.rotation.set(-0.5 * c, 0, 0);
    for (const gg of items.values()) gg.visible = false;
    const want = o.item === "lychee" && (o.peeled ?? 0) > 0.5 ? "lycheePeeled" : o.item;
    if (want && items.has(want)) items.get(want)!.visible = true;
  };
};

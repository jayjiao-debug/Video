// THE SMALL PROPS of the Wanbi film that the kit does not have (WP5), built with the kit's prop kit (src/kit/props/kit.ts:
// Part = merged meshes + ONE black hull outline, layer NOINK; paint = mip-mapped canvas textures). Each builder fills a
// prop's group; origins and axes are those of props/index.ts PROP_INFO.
//   jade        the kit's 白璧 (src/kit/props/things.ts bi) at 1.5 x: re-exported unchanged (BUILD_PLAN 6, kit request 2)
//   jadeStand   the black-lacquer stand that holds the disc upright on the Zhao dais (23b): a plinth, a turned post
//               with gold bands and a red-lacquer cradle with a slot; the disc's rim rests on the slot's floor
//   officialCap the promoted envoy's tall black cap as a thing (23b): THE CAST'S OWN SHAPE (kit acc/headwear.ts
//               scholarCap, as LIN_OFFICIAL wears it: tall 1.22 on a head of R 0.2324) cut where it leaves the head,
//               so the cap in the king's hands is the cap the swap puts on his head on 2061
//   cauldron    汤镬: the kit's bronze ding (src/kit/props/things.ts) at 1.8 x with a pale water surface in its bowl
//               (the steam is 2D, hud steam)
// The kit's rules hold (src/kit/props/README.md): nothing thinner than 1.2 cm, parts overlap by a centimetre (hidden)
// or stand apart, small pattern is paint, colours between #2b2630 and #f4f1ea, nothing random.
import * as THREE from "three";
import { C, V, Part, paint, bandTex, lenAt, turned, ringSeg, limb, ball, box, type Kit } from "../../../kit/props/kit";
import { bi, ding, BI, DING } from "../../../kit/props/things";
import { roundBox } from "../../group/kit/rigacc/shapes";

export { bi, ding, BI, DING };

// ===================================================================================================== the jade's stand
/** the stand (m): its height to the cradle (the disc's lowest point), the disc's centre above the origin (= h + the
 *  disc's radius at the film's size, so the disc stands in the cradle), its width; the jade's radius and thickness at
 *  the film's size (kit BI x 1.5) */
export const JADE_STAND = { h: 0.44, disc: 0.44 + BI.r * 1.5, w: 0.20 };
const DISC_R = BI.r * 1.5, DISC_T = BI.t * 1.5, LAC = "#2e2a33";
export const jadeStand = (K: Kit, g: THREE.Group) => {
  const S = JADE_STAND, P = new Part(K);
  // the plinth: black lacquer with a red line round each face
  const plinthTex = paint(128, 64, (c, w, h) => { c.fillStyle = LAC; c.fillRect(0, 0, w, h); c.strokeStyle = C.lacRed; c.lineWidth = 5; c.strokeRect(9, 9, w - 18, h - 18); });
  P.add(K.flat("#ffffff", { map: plinthTex, rough: 0.35 }), box(S.w, 0.045, 0.12, 0, 0.0225, 0), 0.005);
  // the post: turned, black with gold bands at the foot, the knop and the head
  const post: [number, number][] = [[0, 0.035], [0.034, 0.035], [0.034, 0.052], [0.019, 0.072], [0.016, 0.165], [0.027, 0.2], [0.027, 0.228], [0.016, 0.262], [0.016, 0.36], [0.026, 0.392], [0.04, 0.415], [0.04, 0.432], [0, 0.432]], f = lenAt(post);
  const postTex = bandTex(LAC, [[f[1], f[2], C.gold], [f[5] - 0.005, f[6] + 0.005, C.gold], [f[9], f[10], C.gold]]);
  P.add(K.flat("#ffffff", { map: postTex, rough: 0.35 }), turned(post, 24, 48), 0.005);
  // the cradle: a red-lacquer arc under the disc with a slot (the disc's rim rests on the slot's floor, r = DISC_R round
  // the disc's centre; the two lips rise 3.4 cm in front of and behind the disc, 1 cm clear of its faces)
  const R0 = DISC_R, R1 = R0 + 0.022, Ri = R0 - 0.034, H = 0.033, G = DISC_T / 2 + 0.0098, A = 0.7;
  const slot: [number, number][] = [[R1, H], [Ri, H], [Ri, G], [R0, G], [R0, -G], [Ri, -G], [Ri, -H], [R1, -H]];
  P.add(K.flat(C.lacRed, { rough: 0.4 }), ringSeg(slot, -A, 2 * A, 28).rotateX(Math.PI / 2).translate(0, S.disc, 0), 0.0045);
  P.into(g, "jadeStand");
};

// ===================================================================================================== the official's cap
/** the cap as LIN_OFFICIAL wears it: the head's radius it is built on (headless: rig dim.R of linOfficial), the kit
 *  scholarCap's `tall`, the head height (head units) where it leaves the head; its sizes as a thing (m): the band's
 *  radius and height, the board's height, its lean back */
const CAP_R = 0.2324, CAP_TALL = 1.22, CAP_Y0 = 0.93;
export const OFFICIAL_CAP = { band: 0.3 * CAP_R, bandH: 0.19 * CAP_R, board: 1.12 * CAP_TALL * CAP_R, lean: (13 * Math.PI) / 180, top: (0.09 + 1.12 * CAP_TALL) * CAP_R };
export const officialCap = (K: Kit, g: THREE.Group) => {
  const R = CAP_R, h = 1.12 * CAP_TALL, P = new Part(K), black = K.flat("#2a2630", { rough: 0.7 }), gold = K.flat(C.gold, { rough: 0.4 });
  // the band: a short gold drum, closed at the foot (the origin) and the top
  P.add(gold, turned([[0, 0], [0.3 * R, 0], [0.3 * R, 0.15 * R], [0.27 * R, 0.185 * R], [0, 0.19 * R]], 32), 0.007);
  // the board (scholarCap's tower): narrow at its foot, wider at its top, its front corner higher than its back
  const tower = roundBox(0.5 * R, h * R, 0.3 * R, 0.3), T = tower.attributes.position;
  for (let i = 0; i < T.count; i++) {
    const t = T.getY(i) / (h * R) + 0.5, z = T.getZ(i) / (0.15 * R);
    T.setX(i, T.getX(i) * (0.74 + 0.5 * t)); T.setY(i, T.getY(i) + 0.1 * R * z * t * t); T.setZ(i, T.getZ(i) * (1.1 - 0.25 * t));
  }
  tower.computeVertexNormals();
  // it and the pin lean back 13 degrees about the band's top (as kit scholarCap's tilt), the band stays upright
  const pivot = 0.15 * R, lean = new THREE.Matrix4().makeTranslation(0, pivot, 0).multiply(new THREE.Matrix4().makeRotationX(-OFFICIAL_CAP.lean)).multiply(new THREE.Matrix4().makeTranslation(0, -pivot, 0));
  P.add(black, tower.translate(0, (1.02 - CAP_Y0) * R + (h * R) / 2, 0), 0.009, lean);
  // the gold pin through its foot from side to side, a knob at each end
  const py = (1.2 - CAP_Y0) * R, half = 0.52 * R;
  P.add(gold, limb(V(-half, py, 0), V(half, py, 0), 0.035 * R, 0.035 * R, 12), 0.004, lean);
  for (const s of [-1, 1]) P.add(gold, ball(V(s * half, py, 0), 0.07 * R, [1, 1, 1], 12), 0.004, lean);
  P.into(g, "officialCap");
};

// ===================================================================================================== the cauldron
/** how far the kit's ding is lifted inside the prop (kit units) so its lowest point is the origin's floor */
export const CAULDRON_LIFT = 0.0039;
/** the kit's ding with a pale water surface 3.5 cm under its lip (kit units; the film puts it at 1.8 x) */
export const cauldron = (K: Kit, g: THREE.Group) => {
  // the kit's slanted legs end 4 mm (kit units) under their foot point: lifted by that, the feet stand ON the floor
  const d = new THREE.Group(); d.name = "cauldron.body"; d.position.y = CAULDRON_LIFT; g.add(d); g = d;
  ding(K, g);
  const water = paint(128, 128, (c, w, h) => {
    const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "#c9d5cf"); gr.addColorStop(0.75, "#bccbc5"); gr.addColorStop(1, "#97aaa5");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  });
  // the bowl's inside is the cone (0.245, 0.455) -> (0.225, 0.40): at y 0.42 its radius is 0.2323; the water reaches
  // 1 mm into it (hidden)
  new Part(K).add(K.flat("#ffffff", { map: water, rough: 0.25 }), new THREE.CircleGeometry(0.2335, 40).rotateX(-Math.PI / 2).translate(0, 0.42, 0), 0).into(g, "cauldron.water", { cast: false });
};

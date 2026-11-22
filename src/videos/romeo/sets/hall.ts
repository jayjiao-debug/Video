// THE HALL (place "hall", island x 120): scene 2, Sunday night, the Capulets' masked feast. Set builder B.
// A long stone hall: a nave (the dance floor, brightest, under a candle chandelier) between two arcades of round
// columns; the side aisles darker, their walls hung with tapestries in muted Capulet wine and gold; torches on the
// columns and the aisle walls; the high table with the food across the back; a stone stair up the right aisle; the
// masks on a side table in the left aisle behind Romeo.
//
// WHERE THINGS ARE (local to the island; places.ts STAGE.hall has the marks and cameras; the camera side is +z)
//   nave x -1.88 .. 2.48 (the arcades' faces), arcade centre lines x -2.1 / 2.7, columns at z 0.95, -1.25, -3.45, -5.65
//   aisle walls x -3.4 / 4.3, back wall z -6.8, front wall z 2.6, ceiling y 4.4
//   romeoWall (-1.6, -0.9): in front of the left column at z -1.25 (it stands just left behind him in his frame)
//   julietTiptoe (2.2, -3.2): in front of the right column at z -3.45, the stair's foot (z -3.75) behind her
//   the dance floor: the inlaid floor x -1.45 .. 2.05, z -4.9 .. 0.2, kept clear
//   the high table: nave back, x -1.4 .. 2.0, z -6.25 .. -5.65; the mask table: left aisle wall, z -2.1 .. -3.3
// LIGHT: the point light is the chandelier over the dance floor (the middle brightest); a weak warm key from above
// for the figures' shadows; the torches are flames + halos + painted pools on the floor; everything flickers a
// little (animate, pure in t).
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig } from "../../../kit/sets/okit";
import { ISLAND } from "../places";
import { CAST_BASE, maker, boxG, levelQuad, ceilQuad, tileUV, lathe, bar, archWallG, ashlarTex, boardsTex, paint, rng, css, mix, blotch, Part, makeFire, addCandle, lightPool, hangingCloth, clothFaceTex, type Fire, type G2 } from "./parts/b_common";
import { jug, fruitBowl, loaf, plate, roast, mask, maskTex } from "./parts/b_props";

const X0 = ISLAND.hall;
const XL = -3.4, XR = 4.3, AL = -2.1, AR = 2.7, ZB = -6.8, ZF = 2.6, YC = 4.4, AT = 0.44, SPRING = 2.45;
const COLS = [0.95, -1.25, -3.45, -5.65];
const CR = 0.22;                               // column shaft radius (the arcade wall is 2 CR thick)
const CHAND = new THREE.Vector3(0.3, 3.15, -2.3);
const STAIR = { x0: 3.05, x1: 4.25, z0: -3.75, n: 9, rise: 0.2, tread: 0.28 };

/** colours: warm stone, darker walls, Capulet wine (duller and darker than her #b8252f) and old gold */
const HC = {
  stone: "#b3a28a", stoneLo: "#8e7e6a", stoneHi: "#cbbca2", joint: "#6e604f",
  wall: "#675c54", wallLo: "#524842", wallHi: "#766a60", wallJoint: "#38302c",
  col: "#9c8e7e", colLo: "#807466",
  wine: "#6a2a2c", wineLo: "#4e1f22", wineHi: "#7e3a36", gold: "#b48a3e", goldLo: "#8e6a2e",
  wood: "#6a4a32", woodLo: "#4e3626", woodDark: "#3e2c22", iron: "#3a3438",
  cloth: "#e4d8bc", clothLo: "#cbbd9e",
};

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.09, 0.07, 0.06]], [0, [0.15, 0.11, 0.09]], [90, [0.19, 0.15, 0.12]]],
  boxes: [{ az: 0, el: 60, rot: 0, w: 30, h: 16, soft: 18, col: [0.55, 0.4, 0.28] }],
};
const CAST: CastLight = {
  ...CAST_BASE, key: [0.25, 0.65, 0.6], tint: [1.0, 0.84, 0.64], tintK: 0.75, gain: 0.96, shade: [1.08, 0.94, 1.3], broad: 0.3, sheen: 0.22, contactLen: 0.2,
} as unknown as CastLight;
const LOOK: PlaceLook = {
  bg: "#1e1512",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.7, color: "#1e140f" },
  cast: CAST,
  fill: FILL,
  bloom: 0.5,
};
const PARAMS: Record<string, ParamValue> = {};

// ---------------------------------------------------------------------------------------------------- paintings
/** the floor: one picture over the whole floor (u along x, v along z): big quiet flags, the dance floor's inlay
 *  (a wine-and-gold border band round large lozenges in two warm stones), and the painted light: brighter in the
 *  middle, darker toward the walls */
const floorTex = () => {
  const ppm = 150, W = Math.round((XR - XL) * ppm), H = Math.round((ZF - ZB) * ppm);
  const px = (x: number) => (x - XL) * ppm, pz = (z: number) => (ZF - z) * ppm;      // canvas top = the front (z ZF)
  return paint(W, H, (g) => {
    const r = rng(201);
    g.fillStyle = "#6e5e4e"; g.fillRect(0, 0, W, H);
    // flags 0.75 m, staggered courses running along x
    const fw = 0.75 * ppm, fh = 0.6 * ppm, j = 5;
    for (let row = 0; row * fh < H; row++) for (let c = -1; c * fw < W; c++) {
      const x = c * fw + (row % 2 ? fw / 2 : 0), y = row * fh;
      g.fillStyle = css(mix("#9a8670", r() < 0.5 ? "#7e6c58" : "#ae9a80", 0.15 + 0.35 * r())); g.fillRect(x + j / 2, y + j / 2, fw - j, fh - j);
      blotch(g, x + fw * r(), y + fh * r(), fw * 0.4, r() < 0.5 ? "#b8a488" : "#6e5e4c", 0.1);
    }
    // the dance floor inlay
    const ix0 = px(-1.45), ix1 = px(2.05), iz0 = pz(0.2), iz1 = pz(-4.9), bw = 0.22 * ppm;
    g.fillStyle = "#5a2a26"; g.fillRect(ix0, iz0, ix1 - ix0, iz1 - iz0);
    g.fillStyle = "#a07e44"; g.fillRect(ix0 + bw * 0.25, iz0 + bw * 0.25, ix1 - ix0 - bw * 0.5, iz1 - iz0 - bw * 0.5);
    g.fillStyle = "#5e2c28"; g.fillRect(ix0 + bw * 0.45, iz0 + bw * 0.45, ix1 - ix0 - bw * 0.9, iz1 - iz0 - bw * 0.9);
    const jx0 = ix0 + bw, jx1 = ix1 - bw, jz0 = iz0 + bw, jz1 = iz1 - bw;
    g.save(); g.beginPath(); g.rect(jx0, jz0, jx1 - jx0, jz1 - jz0); g.clip();
    const L = 0.62 * ppm;
    for (let a = -2; a * L < (jx1 - jx0) + L * 2; a++) for (let b = -2; b * L < (jz1 - jz0) + L * 2; b++) {
      const cx = jx0 + a * L + (b % 2 ? L / 2 : 0), cy = jz0 + b * L / 2;
      const light = (a + b) % 2 === 0;
      g.fillStyle = css(mix(light ? "#c8b494" : "#a2785a", "#8a7058", 0.12 * r()));
      g.beginPath(); g.moveTo(cx, cy - L / 2 + 2); g.lineTo(cx + L / 2 - 2, cy); g.lineTo(cx, cy + L / 2 - 2); g.lineTo(cx - L / 2 + 2, cy); g.closePath(); g.fill();
    }
    g.restore();
    // the centre medallion: a gold-ringed disc
    const mx = px(0.3), mz = pz(-2.35), mr = 0.62 * ppm;
    g.fillStyle = "#5a2a26"; g.beginPath(); g.arc(mx, mz, mr, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#a88446"; g.lineWidth = 0.06 * ppm; g.beginPath(); g.arc(mx, mz, mr * 0.86, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#c2aa84"; g.beginPath(); g.arc(mx, mz, mr * 0.62, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#a07e44";
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.ellipse(mx + Math.cos(a) * mr * 0.36, mz + Math.sin(a) * mr * 0.36, mr * 0.2, mr * 0.09, a, 0, Math.PI * 2); g.fill(); }
    // the painted light: warm pool in the middle, the walls darker
    const gr = g.createRadialGradient(mx, mz, 0.4 * ppm, mx, mz, 5.2 * ppm);
    gr.addColorStop(0, "rgba(255,220,170,0.16)"); gr.addColorStop(0.45, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(20,10,6,0.45)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
};
/** a tapestry face: wine field, gold border, a garden-and-hat device (the Capulet hat), small flowers; NO crosses */
const tapestryTex = (w: number, h: number, seed: number, field = HC.wine) => clothFaceTex({
  w, h, field, fieldLo: HC.wineLo, border: HC.gold, borderW: 0.09, seed, px: 140,
  draw: (g: G2, W: number, H: number) => {
    const r = rng(seed + 3);
    // a dark inner field and a millefleur scatter of small pale flowers
    g.fillStyle = css(mix(field, "#2e2420", 0.3)); g.fillRect(W * 0.1, H * 0.08, W * 0.8, H * 0.84);
    for (let i = 0; i < 70; i++) {
      const x = W * (0.13 + 0.74 * r()), y = H * (0.1 + 0.8 * r()), s = W * 0.012;
      g.fillStyle = css(r() < 0.5 ? "#c8a85e" : "#9a5a48", 0.75);
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.7, 0, Math.PI * 2); g.fill(); }
    }
    // the device: a gold shield (round-bottomed) with the hat
    const cx = W / 2, cy = H * 0.45, sw = W * 0.26, sh = H * 0.22;
    g.fillStyle = HC.gold; g.beginPath(); g.moveTo(cx - sw, cy - sh); g.lineTo(cx + sw, cy - sh); g.lineTo(cx + sw, cy + sh * 0.2); g.quadraticCurveTo(cx + sw, cy + sh, cx, cy + sh * 1.15); g.quadraticCurveTo(cx - sw, cy + sh, cx - sw, cy + sh * 0.2); g.closePath(); g.fill();
    g.strokeStyle = "#3a2420"; g.lineWidth = W * 0.015; g.stroke();
    g.fillStyle = HC.wineLo; g.beginPath(); g.ellipse(cx, cy + sh * 0.12, sw * 0.7, sh * 0.16, 0, 0, Math.PI * 2); g.fill();           // the brim
    g.beginPath(); g.moveTo(cx - sw * 0.38, cy + sh * 0.1); g.quadraticCurveTo(cx - sw * 0.4, cy - sh * 0.55, cx, cy - sh * 0.58); g.quadraticCurveTo(cx + sw * 0.4, cy - sh * 0.55, cx + sw * 0.38, cy + sh * 0.1); g.fill();   // the crown
    g.strokeStyle = "#d8b864"; g.lineWidth = W * 0.012; g.beginPath(); g.moveTo(cx - sw * 0.36, cy - sh * 0.05); g.lineTo(cx + sw * 0.36, cy - sh * 0.05); g.stroke();   // the band
    // a wreath line round the device
    g.strokeStyle = css("#8a9a5a", 0.8); g.lineWidth = W * 0.02; g.beginPath(); g.arc(cx, cy, sw * 1.45, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    // a fringe at the bottom
    g.fillStyle = HC.goldLo; for (let x = 0; x < W; x += W / 30) g.fillRect(x, H * 0.965, W / 60, H * 0.035);
  },
});
/** a long banner (hangs from the arcade into the nave): wine, a gold chevron band and three gold roundels */
const bannerTex = (seed: number) => clothFaceTex({
  w: 0.62, h: 1.8, field: HC.wine, fieldLo: HC.wineLo, border: HC.gold, borderW: 0.06, seed, px: 120,
  draw: (g: G2, W: number, H: number) => {
    g.fillStyle = HC.gold;
    g.beginPath(); g.moveTo(0, H * 0.34); g.lineTo(W / 2, H * 0.24); g.lineTo(W, H * 0.34); g.lineTo(W, H * 0.42); g.lineTo(W / 2, H * 0.32); g.lineTo(0, H * 0.42); g.closePath(); g.fill();
    for (const y of [0.55, 0.68, 0.81]) { g.beginPath(); g.arc(W / 2, H * y, W * 0.12, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = HC.wineLo; g.beginPath(); g.arc(W / 2, H * 0.12, W * 0.16, 0, Math.PI * 2); g.fill();
  },
});
const clothTableTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = HC.cloth; g.fillRect(0, 0, W, H);
  for (let i = 0; i < W; i += 4) { g.fillStyle = css(HC.clothLo, 0.12); g.fillRect(i, 0, 1, H); }
  g.fillStyle = HC.wine; g.fillRect(0, H * 0.82, W, H * 0.1); g.fillStyle = HC.gold; g.fillRect(0, H * 0.8, W, H * 0.02);
}, true);

// ---------------------------------------------------------------------------------------------------- the builder
const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "hall";
  const Mk = maker(K, group);
  const X = (x: number) => X0 + x;
  const mWall = Mk.tex(ashlarTex({ seed: 210, base: HC.wall, lo: HC.wallLo, hi: HC.wallHi, joint: HC.wallJoint, nx: 3, ny: 6, bw: 0.7, bh: 0.35 }), 0.92);
  const mArc = Mk.tex(ashlarTex({ seed: 211, base: "#7e7266", lo: "#685e54", hi: "#8e8274", joint: "#463e38", nx: 3, ny: 6, bw: 0.7, bh: 0.35 }), 0.92);
  const mCol = Mk.flat(HC.col, 0.8), mColLo = Mk.flat(HC.colLo, 0.85);
  const mCeil = Mk.tex(boardsTex({ seed: 212, n: 4, base: "#4e3828", lo: "#3a2a20" }), 0.9), mBeam = Mk.flat(HC.woodDark, 0.85);
  const mStone = Mk.flat(HC.stone, 0.85), mStair = Mk.tex(ashlarTex({ seed: 213, base: "#a89680", lo: "#8a7a66", hi: "#bcaa90", joint: "#6a5c4c", nx: 2, ny: 2, bw: 0.6, bh: 0.2 }), 0.9);
  const mWood = Mk.flat(HC.wood, 0.75), mWoodLo = Mk.flat(HC.woodLo, 0.8), mIron = Mk.flat(HC.iron, 0.55), mGold = Mk.flat(HC.gold, 0.5);

  // ============================================================================================ floor, ceiling
  Mk.mesh("hall.floor", levelQuad(X(XL), X(XR), ZB, ZF, 0, (x, z) => [(x - X(XL)) / (XR - XL), (z - ZB) / (ZF - ZB)]), Mk.tex(floorTex(), 0.8), { cast: false });
  Mk.mesh("hall.ceiling", ceilQuad(X(XL), X(XR), ZB, ZF, YC, (x, z) => [x / 1.6, z / 1.6]), mCeil);
  for (const z of COLS) for (const [a, b] of [[XL, AL], [AL, AR], [AR, XR]] as [number, number][]) Mk.mesh("hall.beam", boxG(X(a), X(b), YC - 0.3, YC + 0.01, z - 0.13, z + 0.13), mBeam);

  // ============================================================================================ walls
  Mk.mesh("hall.wall.left", tileUV(boxG(X(XL - 0.3), X(XL), 0, YC, ZB - 0.3, ZF + 0.3), 2.1, 2.1), mWall);
  Mk.mesh("hall.wall.right", tileUV(boxG(X(XR), X(XR + 0.3), 0, YC, ZB - 0.3, ZF + 0.3), 2.1, 2.1), mWall);
  // the back wall with the upper doorway (from the stair's landing) on the right
  Mk.mesh("hall.wall.back", archWallG({ axis: "x", at: ZB - 0.15, u0: X(XL - 0.3), u1: X(XR + 0.3), y0: 0, y1: YC, thick: 0.3, holes: [{ c: X(3.65), w: 0.95, y0: 1.8, spring: 3.5 }], tile: 2.1 }), mWall);
  Mk.mesh("hall.door.back", boxG(X(3.65 - 0.5), X(3.65 + 0.5), 1.8, 4.0, ZB - 0.32, ZB - 0.28), Mk.flat(HC.woodDark, 0.8), { cast: false });
  // the front wall (behind the cameras: hidden from the usual spots by view())
  Mk.mesh("hall.wall.front", archWallG({ axis: "x", at: ZF + 0.15, u0: X(XL - 0.3), u1: X(XR + 0.3), y0: 0, y1: YC, thick: 0.3, notches: [{ c: X(0.3), w: 1.6, y0: 0, spring: 2.4 }], tile: 2.1 }), mWall);

  // ============================================================================================ the arcades
  for (const ax of [AL, AR]) {
    const notches = [];
    const zs = [ZF, ...COLS];
    for (let i = 0; i < zs.length - 1; i++) {
      const a = zs[i] - (i === 0 ? 0.1 : CR), b = zs[i + 1] + CR;
      notches.push({ c: (a + b) / 2, w: a - b, y0: SPRING, spring: SPRING });
    }
    // the wall above the arches (u = z)
    Mk.mesh(`hall.arcade.${ax < 0 ? "L" : "R"}`, archWallG({ axis: "z", at: X(ax), u0: ZB, u1: ZF, y0: SPRING, y1: YC, thick: AT, notches, tile: 2.1 }), mArc);
    // the back bay: solid down to the floor (a niche of wall)
    Mk.mesh("hall.arcade.backbay", tileUV(boxG(X(ax - AT / 2), X(ax + AT / 2), 0, SPRING + 0.01, ZB, COLS[3] - CR - 0.01), 2.1), mArc);
    // a moulded string course along the top of the arches
    Mk.mesh("hall.arcade.course", boxG(X(ax - AT / 2 - 0.05), X(ax + AT / 2 + 0.05), 3.48, 3.6, ZB, ZF), mColLo);
    // the columns
    for (const z of COLS) {
      const prof: [number, number][] = [[0.001, 0.0], [0.3, 0.0], [0.3, 0.1], [0.27, 0.13], [0.28, 0.18], [0.24, 0.24], [CR + 0.01, 0.3], [CR, 0.5], [CR - 0.012, 1.9], [CR - 0.008, 2.12], [0.25, 2.16], [0.25, 2.2], [0.21, 2.24], [0.3, 2.33], [0.001, 2.33]];
      Mk.mesh("hall.column", lathe(prof, 28).translate(X(ax), 0, z), mCol);
      Mk.mesh("hall.column.abacus", boxG(X(ax - 0.32), X(ax + 0.32), 2.33, SPRING, z - 0.32, z + 0.32), mColLo);
    }
  }

  // ============================================================================================ the stair (right aisle)
  {
    const S = STAIR, top = S.n * S.rise, zTop = S.z0 - S.n * S.tread;
    for (let i = 0; i < S.n; i++) {
      const zf = S.z0 - i * S.tread;
      Mk.mesh("hall.stair.step", tileUV(boxG(X(S.x0), X(S.x1), 0, (i + 1) * S.rise, zTop, zf), 0.6, 0.2), mStair);
    }
    Mk.mesh("hall.stair.landing", tileUV(boxG(X(S.x0), X(XR), 0, top, ZB, zTop), 0.6, 0.2), mStair);
    // the parapet on the nave side: a sloped stone wall following the flight, a newel post with a ball at the foot
    const s = new THREE.Shape([new THREE.Vector2(S.z0 + 0.05, 0), new THREE.Vector2(S.z0 + 0.05, 0.95), new THREE.Vector2(zTop, top + 0.95), new THREE.Vector2(ZB, top + 0.95), new THREE.Vector2(ZB, 0)].map((v) => v));
    const pg = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false }).translate(0, 0, -0.08).rotateY(-Math.PI / 2).translate(X(S.x0 + 0.02), 0, 0);
    Mk.mesh("hall.stair.parapet", tileUV(pg, 0.6, 0.3), mStone);
    Mk.mesh("hall.stair.coping", boxG(X(S.x0 - 0.07), X(S.x0 + 0.11), top + 0.95, top + 1.02, ZB, zTop), mColLo);
    // the sloped coping as a thin bar on the flight
    Mk.mesh("hall.stair.copingSlope", bar(new THREE.Vector3(X(S.x0 + 0.02), 1.0, S.z0 + 0.05), new THREE.Vector3(X(S.x0 + 0.02), top + 1.0, zTop), 0.07, 0.07, 8), mColLo);
    Mk.mesh("hall.stair.newel", tileUV(boxG(X(S.x0 - 0.1), X(S.x0 + 0.14), 0, 1.05, S.z0 - 0.06, S.z0 + 0.18), 0.6), mColLo);
    Mk.mesh("hall.stair.newelCap", boxG(X(S.x0 - 0.13), X(S.x0 + 0.17), 1.05, 1.11, S.z0 - 0.09, S.z0 + 0.21), mCol);
    Mk.mesh("hall.stair.ball", new THREE.SphereGeometry(0.11, 16, 12).translate(X(S.x0 + 0.02), 1.22, S.z0 + 0.06), mCol);
  }

  // ============================================================================================ cloth: tapestries and banners
  const sways: ((t: number) => void)[] = [];
  const hangOnWall = (name: string, tex: THREE.Texture, w: number, h: number, at: THREE.Vector3, yaw: number, ph: number, rodCol = mIron) => {
    const c = hangingCloth(Mk.tex(tex, 0.95, THREE.DoubleSide), w, h, { folds: Math.round(w * 3.5), fold: 0.025, ph, amp: 0.008 });
    c.mesh.position.copy(at); c.mesh.rotation.y = yaw; c.mesh.name = name; group.add(c.mesh); sways.push(c.sway);
    const rod = new Part(K); const d = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    rod.add(rodCol, bar(at.clone().addScaledVector(d, -w / 2 - 0.08).add(new THREE.Vector3(0, 0.02, 0)), at.clone().addScaledVector(d, w / 2 + 0.08).add(new THREE.Vector3(0, 0.02, 0)), 0.018, 0.018, 8), 0.004);
    for (const s of [-1, 1]) rod.add(mGold, new THREE.SphereGeometry(0.035, 10, 8).translate(...at.clone().addScaledVector(d, s * (w / 2 + 0.1)).add(new THREE.Vector3(0, 0.02, 0)).toArray() as [number, number, number]), 0.004);
    rod.into(group, name + ".rod");
  };
  // left aisle wall (faces +x): tapestries between the columns; behind Romeo's mask table the big one
  hangOnWall("hall.tapestry", tapestryTex(1.5, 2.1, 1), 1.5, 2.1, new THREE.Vector3(X(XL + 0.06), 3.05, -2.55), Math.PI / 2, 0.3);
  hangOnWall("hall.tapestry", tapestryTex(1.5, 2.1, 2), 1.5, 2.1, new THREE.Vector3(X(XL + 0.06), 3.05, -0.15), Math.PI / 2, 1.1);
  hangOnWall("hall.tapestry", tapestryTex(1.5, 2.1, 3), 1.5, 2.1, new THREE.Vector3(X(XL + 0.06), 3.05, -4.75), Math.PI / 2, 2.0);
  // right aisle wall (faces -x): one by the stair's foot, one high over the flight
  hangOnWall("hall.tapestry", tapestryTex(1.4, 2.0, 4), 1.4, 2.0, new THREE.Vector3(X(XR - 0.06), 3.0, -1.7), -Math.PI / 2, 0.7);
  hangOnWall("hall.tapestry", tapestryTex(1.3, 1.5, 5), 1.3, 1.5, new THREE.Vector3(X(XR - 0.06), 3.85, -4.65), -Math.PI / 2, 1.6);
  // the back wall, over the high table: the big family hanging
  hangOnWall("hall.tapestry", tapestryTex(2.6, 2.3, 6), 2.6, 2.3, new THREE.Vector3(X(0.3), 3.85, ZB + 0.06), 0, 0.2);
  // long banners from the arcades into the nave, over the columns
  COLS.forEach((z, i) => {
    for (const [ax, s] of [[AL, 1], [AR, -1]] as [number, number][]) {
      if (z > 0.5 && s > 0) continue;
      hangOnWall("hall.banner", bannerTex(30 + i), 0.62, 1.6, new THREE.Vector3(X(ax + s * (AT / 2 + 0.1)), 4.25, z), s > 0 ? Math.PI / 2 : -Math.PI / 2, i * 0.9 + s, mGold);
    }
  });

  // ============================================================================================ torches
  const fires: Fire[] = [];
  const torch = (P: Part, base: THREE.Vector3, out: THREE.Vector3, ph: number, floorPool = true, halo = 0.7, haloA = 0.5) => {
    // an iron bracket out of the wall / column, a wooden torch in a cup, the flame on top
    const o = out.clone().normalize(), cup = base.clone().addScaledVector(o, 0.2).add(new THREE.Vector3(0, 0.05, 0));
    P.add(mIron, bar(base, cup.clone().add(new THREE.Vector3(0, -0.08, 0)), 0.015, 0.015, 6), 0.003);
    P.add(mIron, boxG(-0.05, 0.05, -0.08, 0.08, -0.03, 0.03).applyMatrix4(new THREE.Matrix4().makeRotationY(Math.atan2(o.x, o.z))).translate(base.x, base.y - 0.04, base.z), 0.003);
    P.add(mIron, lathe([[0.02, -0.12], [0.045, -0.03], [0.05, 0.02], [0.001, 0.02]], 10).translate(cup.x, cup.y, cup.z), 0.003);
    const tip = cup.clone().addScaledVector(o, 0.04).add(new THREE.Vector3(0, 0.2, 0));
    P.add(mWoodLo, bar(cup.clone().add(new THREE.Vector3(0, -0.1, 0)), tip, 0.022, 0.03, 8), 0.004);
    P.add(Mk.flat("#3a2a24", 0.9), new THREE.CylinderGeometry(0.042, 0.034, 0.08, 10).translate(tip.x, tip.y, tip.z), 0.004);
    const f = makeFire(tip.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.19, ph, { halo, haloA, col: "#ffb870" });
    group.add(f.group); fires.push(f);
    // the light it throws: on the wall behind it and on the floor below
    const back = lightPool(base.clone().addScaledVector(o, 0.012).add(new THREE.Vector3(0, 0.3, 0)), o, 1.5, 1.9, "#ffa860", 0.2);
    group.add(back); f.pools.push(back);
    if (floorPool) { const fl = lightPool(new THREE.Vector3(base.x, 0.0015, base.z).addScaledVector(o, 0.7), new THREE.Vector3(0, 1, 0), 2.2, 2.2, "#ffa860", 0.1); group.add(fl); f.pools.push(fl); }
  };
  {
    const P = new Part(K);
    // on the columns' nave faces (Romeo's column at z -1.25, Juliet's at -3.45, and the front pair)
    // (not on the two interview columns at z -1.25 / -3.45: a flame would stand right over Romeo's or Juliet's head)
    for (const z of [0.95, -5.65]) {
      torch(P, new THREE.Vector3(X(AL + CR), 1.6, z), new THREE.Vector3(1, 0, 0), z * 1.3);
      torch(P, new THREE.Vector3(X(AR - CR), 1.6, z), new THREE.Vector3(-1, 0, 0), z * 1.7 + 2);
    }
    // on the AISLE sides of the two interview columns: the flame hides behind the column and its glow edges it, so
    // Romeo and Juliet stand in front of a dark column rimmed with warm light (and the aisle behind is lit)
    for (const [ax, s, z] of [[AL, -1, -1.25], [AR, 1, -3.45]] as [number, number, number][]) torch(P, new THREE.Vector3(X(ax + s * CR), 1.4, z), new THREE.Vector3(s, 0, 0), z * 3.1, true, 1.3, 0.85);
    // on the right wall over the flight (behind Juliet, right of her column)
    torch(P, new THREE.Vector3(X(XR), 3.0, -5.95), new THREE.Vector3(-1, 0, 0), 6.3, false);
    // on the aisle walls, between the tapestries
    for (const z of [-1.35, -3.65]) torch(P, new THREE.Vector3(X(XL), 1.95, z), new THREE.Vector3(1, 0, 0), z * 2.1 + 1);
    torch(P, new THREE.Vector3(X(XR), 1.95, -0.5), new THREE.Vector3(-1, 0, 0), 4.2);
    torch(P, new THREE.Vector3(X(XR), 2.9, -3.1), new THREE.Vector3(-1, 0, 0), 5.1, false);
    P.into(group, "hall.torches");
  }

  // ============================================================================================ festive garlands
  // swags of greenery between the columns along both arcades (under the arches), wine bows where they are tied
  {
    const P = new Part(K), mLeaf = Mk.flat("#5a6a40", 0.85), mLeaf2 = Mk.flat("#6e7a4a", 0.85), mBow = Mk.flat(HC.wineHi, 0.7);
    const mBuds = [Mk.flat("#e0d0a8", 0.7), Mk.flat(HC.gold, 0.55), Mk.flat("#9a4a40", 0.7)];
    let seed = 0;
    for (const [ax, s] of [[AL, 1], [AR, -1]] as [number, number][]) {
      const xs = X(ax + s * (CR + 0.03));
      for (let i = 0; i < COLS.length - 1; i++) {
        const za = COLS[i] - CR - 0.02, zb = COLS[i + 1] + CR + 0.02, ya = 2.28, sag = 0.36, n = 14, pts: THREE.Vector3[] = [];
        for (let k = 0; k <= n; k++) { const u = k / n; pts.push(new THREE.Vector3(xs + s * 0.04 * Math.sin(u * Math.PI), ya - sag * (1 - Math.pow(2 * u - 1, 2)), za + (zb - za) * u)); }
        const curve = new THREE.CatmullRomCurve3(pts), tube = new THREE.TubeGeometry(curve, 40, 0.06, 7, false);
        const p = tube.attributes.position as THREE.BufferAttribute;
        for (let k = 0; k < p.count; k++) { const w = 1 + 0.25 * Math.sin(k * 1.7 + seed) * Math.sin(k * 0.37); const c = curve.getPoint(Math.floor(k / 8) / 40); p.setXYZ(k, c.x + (p.getX(k) - c.x) * w, c.y + (p.getY(k) - c.y) * w, c.z + (p.getZ(k) - c.z) * w); }
        tube.computeVertexNormals();
        P.add(i % 2 ? mLeaf : mLeaf2, tube, 0.005);
        for (let k = 1; k < 12; k++) { const c = curve.getPoint(k / 12); P.add(mBuds[(k + i) % 3], new THREE.SphereGeometry(0.03, 8, 6).translate(c.x + s * 0.05, c.y - 0.02 * (k % 2), c.z), 0.003); }
        seed += 3;
      }
      // the bows on the columns
      for (const z of COLS) {
        const y = 2.26, x = X(ax + s * (CR + 0.06));
        for (const d of [-1, 1]) P.add(mBow, new THREE.SphereGeometry(0.07, 10, 8).scale(0.45, 0.75, 1.0).translate(x, y, z + d * 0.07), 0.004);
        P.add(mBow, new THREE.SphereGeometry(0.035, 8, 6).translate(x + s * 0.02, y, z), 0.004);
        for (const d of [-1, 1]) P.add(mBow, boxG(-0.015, 0.015, -0.22, 0, -0.03, 0.03).rotateX(d * 0.25).translate(x, y - 0.02, z + d * 0.04), 0.003);
      }
    }
    P.into(group, "hall.garlands", { cast: true });
  }

  // ============================================================================================ the chandelier
  const candleFires: Fire[] = [];
  {
    const P = new Part(K), c = new THREE.Vector3(X(CHAND.x), CHAND.y, CHAND.z), R = 0.72, mWax = Mk.flat("#eadfc4", 0.7);
    P.add(mIron, new THREE.TorusGeometry(R, 0.03, 8, 40).rotateX(Math.PI / 2).translate(c.x, c.y, c.z), 0.004);
    P.add(mIron, new THREE.TorusGeometry(R * 0.45, 0.022, 8, 28).rotateX(Math.PI / 2).translate(c.x, c.y + 0.25, c.z), 0.004);
    P.add(mIron, lathe([[0.001, -0.25], [0.05, -0.2], [0.07, -0.05], [0.04, 0.1], [0.05, 0.3], [0.001, 0.36]], 12).translate(c.x, c.y, c.z), 0.004);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; P.add(mIron, bar(new THREE.Vector3(c.x + Math.cos(a) * R, c.y, c.z + Math.sin(a) * R), new THREE.Vector3(c.x, YC - 0.3, c.z), 0.012, 0.012, 5), 0.003); }
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2; P.add(mIron, bar(new THREE.Vector3(c.x, c.y, c.z), new THREE.Vector3(c.x + Math.cos(a) * R, c.y, c.z + Math.sin(a) * R), 0.014, 0.014, 5), 0.003); }
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; const f = addCandle(P, { wax: mWax, dish: mIron }, c.x + Math.cos(a) * R, c.y + 0.02, c.z + Math.sin(a) * R, 0.13, k * 1.3); group.add(f.group); candleFires.push(f); }
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.3; const f = addCandle(P, { wax: mWax, dish: mIron }, c.x + Math.cos(a) * R * 0.45, c.y + 0.27, c.z + Math.sin(a) * R * 0.45, 0.11, k * 2.1 + 0.5); group.add(f.group); candleFires.push(f); }
    P.into(group, "hall.chandelier", { cast: false });
    const glow = lightPool(new THREE.Vector3(X(CHAND.x), YC - 0.005, CHAND.z), new THREE.Vector3(0, -1, 0), 3.2, 3.2, "#ffb060", 0.22); group.add(glow);
  }

  // ============================================================================================ the high table and the food
  {
    const x0 = X(-1.4), x1 = X(2.0), z0 = -6.25, z1 = -5.65, top = 0.78, P = new Part(K);
    const mCloth = Mk.tex(clothTableTex(), 0.95);
    for (const sx of [x0 + 0.1, x1 - 0.1]) for (const sz of [z0 + 0.08, z1 - 0.08]) P.add(mWood, boxG(sx - 0.05, sx + 0.05, 0, top - 0.04, sz - 0.05, sz + 0.05), 0.005);
    P.shell([[mCloth, tileUV(boxG(x0 - 0.04, x1 + 0.04, top - 0.3, top, z0 - 0.02, z1 + 0.04), 0.9, 0.3)]], 0.005);
    // two benches-worth of carved chairs at the back (just their tall backs show over the food)
    for (const cx of [-0.9, 0.3, 1.5]) {
      P.add(mWoodLo, boxG(X(cx) - 0.24, X(cx) + 0.24, 0, 0.45, z0 - 0.5, z0 - 0.08), 0.005);
      P.add(mWoodLo, boxG(X(cx) - 0.24, X(cx) + 0.24, 0.45, 1.35, z0 - 0.5, z0 - 0.42), 0.005);
      P.add(mGold, new THREE.SphereGeometry(0.05, 10, 8).translate(X(cx) - 0.22, 1.38, z0 - 0.46), 0.003);
      P.add(mGold, new THREE.SphereGeometry(0.05, 10, 8).translate(X(cx) + 0.22, 1.38, z0 - 0.46), 0.003);
    }
    const mPew = Mk.flat("#9a948a", 0.45), mBread = Mk.flat("#c08a4e", 0.8), mMeat = Mk.flat("#9a5a32", 0.7), mJug = Mk.flat("#8a6a4a", 0.6), mJug2 = Mk.flat("#b4a07a", 0.6), mBowl = Mk.flat("#7a5a3e", 0.7);
    const fruit = [Mk.flat("#d0883a", 0.6), Mk.flat("#8a3a3e", 0.6), Mk.flat("#a8a050", 0.6), Mk.flat("#6a3a5a", 0.6)];
    const zc = (z0 + z1) / 2, y = top;
    roast(P, { meat: mMeat, plate: mPew }, X(0.3), y, zc, 0.11, 0.2);
    fruitBowl(P, { bowl: mBowl, fruit }, X(-0.55), y, zc - 0.05, 0.15, 3);
    fruitBowl(P, { bowl: mPew, fruit: [fruit[1], fruit[3]] }, X(1.25), y, zc + 0.02, 0.13, 7);
    loaf(P, mBread, X(-1.05), y, zc + 0.08, 0.08); loaf(P, mBread, X(-0.2), y, zc + 0.12, 0.06, true, 0.3); loaf(P, mBread, X(0.85), y, zc - 0.1, 0.065, true, -0.4); loaf(P, mBread, X(1.7), y, zc + 0.05, 0.075);
    jug(P, mJug, X(-0.85), y, zc - 0.15, 0.24, 0.07, 0.5); jug(P, mJug2, X(0.95), y, zc + 0.12, 0.2, 0.06, 2.6); jug(P, mJug, X(1.85), y, zc - 0.12, 0.22, 0.065, 1.2);
    for (const px of [-1.25, -0.35, 0.65, 1.5]) plate(P, mPew, X(px), y, zc + 0.18, 0.1);
    for (const px of [-1.2, 0.0, 0.6, 1.8]) P.add(mPew, lathe([[0.001, 0], [0.04, 0], [0.012, 0.03], [0.01, 0.1], [0.035, 0.14], [0.04, 0.2], [0.03, 0.2], [0.001, 0.16]], 12).translate(X(px), y, zc + 0.02 + (px > 1 ? -0.1 : 0.08)), 0.003);   // goblets
    // candlesticks on the table
    const mWax = Mk.flat("#eadfc4", 0.7);
    for (const px of [-0.75, 1.35]) {
      P.add(mPew, lathe([[0.001, 0], [0.08, 0], [0.08, 0.02], [0.03, 0.05], [0.025, 0.25], [0.05, 0.28], [0.001, 0.29]], 14).translate(X(px), y, zc - 0.05), 0.004);
      const f = addCandle(P, { wax: mWax, dish: mPew }, X(px), y + 0.29, zc - 0.05, 0.16, px * 3, false); group.add(f.group); candleFires.push(f);
    }
    P.into(group, "hall.table", { cast: true });
  }

  // ============================================================================================ the mask table (left aisle)
  {
    const x0 = X(XL + 0.02), x1 = X(XL + 0.5), z0 = -5.4, z1 = -4.1, top = 0.86, P = new Part(K), dz = -2.05;
    P.add(mWood, boxG(x0, x1, top - 0.05, top, z0, z1), 0.005);
    P.add(mWoodLo, boxG(x0 + 0.03, x1 - 0.03, top - 0.16, top - 0.05, z0 + 0.03, z1 - 0.03), 0.005);
    for (const z of [z0 + 0.06, z1 - 0.06]) { P.add(mWoodLo, boxG(x1 - 0.1, x1 - 0.03, 0, top - 0.05, z - 0.035, z + 0.035), 0.005); P.add(mWoodLo, boxG(x0 + 0.03, x0 + 0.1, 0, top - 0.05, z - 0.035, z + 0.035), 0.005); }
    P.add(mWoodLo, boxG(x0 + 0.05, x1 - 0.05, 0.12, 0.16, z0 + 0.06, z1 - 0.06), 0.005);
    const faces = [maskTex("#d8c8a0", "#b48a3e", 1), maskTex("#8a3a36", "#c8a050", 2), maskTex("#e8dcc4", "#8a3a36", 3), maskTex("#6a7a5a", "#d0b060", 4), maskTex("#b48a3e", "#6a2a2c", 5), maskTex("#4a3a4e", "#c8a050", 6)].map((t) => Mk.tex(t, 0.55));
    const mx = (x0 + x1) / 2 + 0.04;
    mask(P, faces[0], mx, top + 0.022, -2.25 + dz, 0.11, Math.PI / 2, Math.PI / 2 - 0.15);
    mask(P, faces[1], mx - 0.05, top + 0.022, -2.55 + dz, 0.1, Math.PI / 2 + 0.3, Math.PI / 2 - 0.1);
    mask(P, faces[2], mx + 0.02, top + 0.022, -2.85 + dz, 0.11, Math.PI / 2 - 0.25, Math.PI / 2 - 0.2);
    mask(P, faces[3], mx - 0.04, top + 0.022, -3.15 + dz, 0.1, Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    // two masks propped up on stands (on a stick), looking into the hall
    for (const [z, f] of [[-2.4 + dz, 4], [-3.0 + dz, 5]] as [number, number][]) {
      P.add(mGold, new THREE.CylinderGeometry(0.05, 0.06, 0.03, 12).translate(mx - 0.08, top + 0.015, z), 0.003);
      P.add(mGold, new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6).translate(mx - 0.08, top + 0.13, z), 0.003);
      mask(P, faces[f], mx - 0.06, top + 0.27, z, 0.11, Math.PI / 2, -0.15);
    }
    P.into(group, "hall.maskTable", { cast: true });
  }

  // ============================================================================================ the light
  const keyAt: [number, number, number] = [X(0.3), 0, -2.3];
  const Lr = lightRig(group, { dir: [-0.25, 0.88, 0.4], k: 0.4, col: "#ffe2c4", at: keyAt, half: 7, hemi: ["#5a4c4c", "#1c1412", 0.28], point: { col: "#ffd4a4", k: 30, at: [X(CHAND.x), CHAND.y - 0.25, CHAND.z], dist: 8 } });
  Lr.key.shadow.bias = -0.0004;
  const pointK = Lr.point.intensity;

  // what the camera stands behind
  const hide: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name === "hall.wall.left") hide.push([o, (p) => p.x < X(XL) - 0.02]);
    if (o.name === "hall.wall.right") hide.push([o, (p) => p.x > X(XR) + 0.02]);
    if (o.name === "hall.wall.back") hide.push([o, (p) => p.z < ZB - 0.02]);
    if (o.name === "hall.wall.front") hide.push([o, (p) => p.z > ZF + 0.02]);
  });
  let lastCam = new THREE.Vector3(X(0), 1.5, 1);
  return {
    group,
    view(cam: THREE.Vector3) {
      for (const [o, behind] of hide) o.visible = !behind(cam);
      lastCam = cam.clone();
      for (const f of fires) f.face(lastCam);
      for (const f of candleFires) f.face(lastCam);
    },
    animate(t: number) {
      for (const f of fires) f.animate(t);
      for (const f of candleFires) f.animate(t);
      for (const s of sways) s(t);
      Lr.point.intensity = pointK * (1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 9.7 + 1.1));
    },
  };
};

export const HALL: PlaceDef = { look: LOOK, params: PARAMS, build };

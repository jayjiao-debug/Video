// JULIET'S ROOM (place "bedroom", island x 600): scene 6b, Tuesday night. Set builder B.
// Quiet and intimate: a canopy bed with its foot toward the lens (muted wine curtains lined cream, a cream cover,
// darker and duller than her dress), one candle on a chest right of the bed's foot (the warm pool on her), cool
// moonlight through an open window in the right wall falling across the bed, a small rug, a door, a lute on the chest.
//
// WHERE THINGS ARE (local to the island; places.ts STAGE.bedroom has the mark and the cameras; the camera side is +z)
//   walls: left x -2.0 (the door z 0.25 .. 1.15), right x 2.0 (the window z -2.3 .. -1.5, sill 0.95), back z -3.1,
//   front z 2.4; ceiling 3.0
//   the bed: x -0.72 .. 0.72, z -2.95 .. -0.8 (the foot edge), the cover's top y 0.42 = her seat; canopy posts at the
//   four corners up to the tester at 2.25; the head against the back wall
//   julietBed (0, -1.0): on the foot edge facing the lens; the chest with the candle: x 0.84 .. 1.32, z -1.38 .. -0.9 (right of the bed's foot)
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig } from "../../../kit/sets/okit";
import { ISLAND } from "../places";
import { CAST_BASE, maker, boxG, levelQuad, ceilQuad, tileUV, lathe, archWallG, boardsTex, paint, rng, css, Part, addCandle, lightPool, hangingCloth, clothFaceTex, sunShaft, glowCard, type G2 } from "./parts/b_common";
import { jug, book } from "./parts/b_props";

const X0 = ISLAND.bedroom;
const XL = -2.0, XR = 2.0, ZB = -3.1, ZF = 2.4, YC = 3.0, WT = 0.36;
const BED = { x0: -0.72, x1: 0.72, z0: -2.95, z1: -0.8, top: 0.42, tester: 2.25 };
const WIN = { z0: -2.3, z1: -1.5, y0: 0.95, spring: 2.0 };
const DOOR = { z0: 0.25, z1: 1.15, h: 2.1 };
const CANDLE = new THREE.Vector3(0.92, 0.6, -1.08);
const MOON: [number, number, number] = [0.74, 0.56, -0.37];        // toward the moon (through the window, high on the right)

const BC = {
  wall: "#94806e", wallLo: "#7e6a5e", dado: "#5a3a34", wood: "#6a4632", woodLo: "#4e3426", woodDark: "#3e2a22",
  wine: "#5e2a30", wineLo: "#46202a", wineHi: "#723a3a", cream: "#ddd0b6", creamLo: "#c4b496", gold: "#a8843e",
};
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.07, 0.06, 0.07]], [0, [0.13, 0.11, 0.13]], [90, [0.16, 0.16, 0.2]]],
  boxes: [{ az: -90, el: 30, rot: 0, w: 26, h: 20, soft: 16, col: [0.45, 0.48, 0.6] }],
};
const CAST: CastLight = {
  ...CAST_BASE, key: [0.7, 0.35, 0.6], tint: [1.0, 0.8, 0.58], tintK: 0.8, gain: 0.9, shade: [1.05, 0.9, 1.6], broad: 0.35, sheen: 0.24,
} as unknown as CastLight;
const LOOK: PlaceLook = {
  bg: "#141118",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.7, color: "#140e12" },
  cast: CAST,
  fill: FILL,
  bloom: 0.5,
};
const PARAMS: Record<string, ParamValue> = {};

// ---------------------------------------------------------------------------------------------------- paintings
/** the night outside the window: a dusky slate sky (not saturated), the big pale moon, the roofs of Verona */
const nightTex = () => paint(512, 640, (g, W, H) => {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#262a3c"); sky.addColorStop(0.7, "#3a3c50"); sky.addColorStop(1, "#4a4656");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const mx = W * 0.62, my = H * 0.3, mr = W * 0.13;
  const halo = g.createRadialGradient(mx, my, mr, mx, my, mr * 3.2); halo.addColorStop(0, "rgba(230,226,210,0.35)"); halo.addColorStop(1, "rgba(230,226,210,0)");
  g.fillStyle = halo; g.fillRect(0, 0, W, H);
  g.fillStyle = "#ebe6d2"; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(200,194,176,0.5)"; for (const [dx, dy, r] of [[-0.3, -0.2, 0.25], [0.25, 0.3, 0.18], [0.1, -0.35, 0.12]]) { g.beginPath(); g.arc(mx + dx * mr, my + dy * mr, r * mr, 0, Math.PI * 2); g.fill(); }
  // a few big soft stars
  const r = rng(601); g.fillStyle = "rgba(230,226,214,0.7)"; for (let i = 0; i < 9; i++) { const x = W * r(), y = H * 0.55 * r(); if (Math.hypot(x - mx, y - my) < mr * 2) continue; g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill(); }
  // roofs and a tower (dark silhouettes, a warm window or two)
  g.fillStyle = "#1c1a22";
  g.beginPath(); g.moveTo(0, H * 0.78); g.lineTo(W * 0.18, H * 0.7); g.lineTo(W * 0.36, H * 0.78); g.lineTo(W * 0.36, H * 0.72); g.lineTo(W * 0.5, H * 0.66); g.lineTo(W * 0.66, H * 0.73); g.lineTo(W * 0.8, H * 0.73); g.lineTo(W * 0.8, H * 0.5); g.lineTo(W * 0.88, H * 0.46); g.lineTo(W * 0.96, H * 0.5); g.lineTo(W * 0.96, H * 0.74); g.lineTo(W, H * 0.74); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.fillStyle = "#c8904e"; g.fillRect(W * 0.86, H * 0.56, W * 0.03, H * 0.04); g.fillRect(W * 0.24, H * 0.8, W * 0.025, H * 0.03);
});
/** the curtains' face: muted wine damask (a soft repeating flower), a cream lining edge, a gold fringe at the foot */
const damaskTex = (w: number, h: number, seed: number) => clothFaceTex({
  w, h, field: BC.wine, fieldLo: BC.wineLo, border: BC.wineHi, borderW: 0.04, seed, px: 120, edge: "#2b2026",
  draw: (g: G2, W: number, H: number) => {
    const s = 0.28 * 120;
    g.fillStyle = css(BC.wineHi, 0.55);
    for (let y = s / 2; y < H; y += s) for (let x = ((y / s) % 2 ? s / 2 : 0); x < W + s; x += s) {
      g.beginPath(); g.ellipse(x, y, s * 0.12, s * 0.26, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x, y, s * 0.26, s * 0.1, 0, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = BC.gold; g.fillRect(0, H - 10, W, 10);
  },
});
const coverTex = () => paint(512, 512, (g, W, H) => {
  g.fillStyle = BC.cream; g.fillRect(0, 0, W, H);
  for (let i = 0; i < W; i += 5) { g.fillStyle = css(BC.creamLo, 0.14); g.fillRect(i, 0, 2, H); }
  // a quilted diamond pattern (soft) and a wine band round the edge
  g.strokeStyle = css(BC.creamLo, 0.7); g.lineWidth = 3;
  for (let k = -8; k < 16; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64 + H, H); g.stroke(); g.beginPath(); g.moveTo(k * 64, H); g.lineTo(k * 64 + H, 0); g.stroke(); }
  g.strokeStyle = BC.wine; g.lineWidth = 26; g.strokeRect(20, 20, W - 40, H - 40);
  g.strokeStyle = BC.gold; g.lineWidth = 4; g.strokeRect(38, 38, W - 76, H - 76);
});
const rugTex = () => paint(512, 320, (g, W, H) => {
  g.fillStyle = "#6a3a32"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#b08a58"; g.fillRect(18, 18, W - 36, H - 36);
  g.fillStyle = "#5a3430"; g.fillRect(34, 34, W - 68, H - 68);
  g.fillStyle = "#8a5a42"; g.beginPath(); g.moveTo(W / 2, 60); g.lineTo(W - 90, H / 2); g.lineTo(W / 2, H - 60); g.lineTo(90, H / 2); g.closePath(); g.fill();
  g.fillStyle = "#c8a46a"; g.beginPath(); g.arc(W / 2, H / 2, 34, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#d8c8a0"; for (let x = 4; x < W; x += 12) { g.fillRect(x, 0, 5, 10); g.fillRect(x, H - 10, 5, 10); }
});
const wallTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(602);
  g.fillStyle = BC.wall; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) { const x = W * r(), y = H * r(), rr = W * (0.05 + 0.12 * r()); const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, css(r() < 0.5 ? BC.wallLo : "#a08a7a", 0.14)); gr.addColorStop(1, css(BC.wall, 0)); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
}, true);
/** a painted frieze under the ceiling: a vine scroll in muted gold on wine */
const friezeTex = () => paint(512, 64, (g, W, H) => {
  g.fillStyle = BC.wineLo; g.fillRect(0, 0, W, H);
  g.strokeStyle = css(BC.gold, 0.8); g.lineWidth = 4; g.beginPath();
  for (let x = 0; x <= W; x += 4) { const y = H / 2 + Math.sin((x / W) * Math.PI * 4) * H * 0.22; x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  g.fillStyle = css(BC.gold, 0.8); for (let k = 0; k < 8; k++) { const x = (k + 0.25) * (W / 8), y = H / 2 + Math.sin(((k + 0.25) / 8) * Math.PI * 4) * H * 0.22; g.beginPath(); g.ellipse(x, y - 9, 6, 9, 0.5, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = BC.gold; g.fillRect(0, 0, W, 4); g.fillRect(0, H - 4, W, 4);
}, true);

// ---------------------------------------------------------------------------------------------------- the builder
const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "bedroom";
  const Mk = maker(K, group), X = (x: number) => X0 + x;
  const mWall = Mk.tex(wallTex(), 0.95), mFloor = Mk.tex(boardsTex({ seed: 603, n: 4, base: "#7a5a42", lo: "#5a4030" }), 0.8);
  const mWood = Mk.flat(BC.wood, 0.7), mWoodLo = Mk.flat(BC.woodLo, 0.75), mWoodDark = Mk.flat(BC.woodDark, 0.8), mDado = Mk.flat(BC.dado, 0.85);
  const mCeil = Mk.tex(boardsTex({ seed: 604, n: 5, base: "#5a4232", lo: "#44322a" }), 0.9), mGold = Mk.flat(BC.gold, 0.5);

  // ============================================================================================ floor, ceiling, walls
  Mk.mesh("bedroom.floor", levelQuad(X(XL), X(XR), ZB, ZF, 0, (x, z) => [x / 0.9, -z / 1.8]), mFloor, { cast: false });
  Mk.mesh("bedroom.ceiling", ceilQuad(X(XL), X(XR), ZB, ZF, YC), mCeil);
  for (const z of [-2.2, -0.6, 1.0]) Mk.mesh("bedroom.beam", boxG(X(XL), X(XR), YC - 0.18, YC + 0.01, z - 0.09, z + 0.09), mWoodDark);
  Mk.mesh("bedroom.wall.back", tileUV(boxG(X(XL - WT), X(XR + WT), 0, YC + 0.01, ZB - WT, ZB), 1.8), mWall);
  Mk.mesh("bedroom.wall.front", tileUV(boxG(X(XL - WT), X(XR + WT), 0, YC + 0.01, ZF, ZF + WT), 1.8), mWall);
  Mk.mesh("bedroom.wall.right", archWallG({ axis: "z", at: X(XR + WT / 2), u0: ZB - WT, u1: ZF + WT, y0: 0, y1: YC + 0.01, thick: WT, holes: [{ c: (WIN.z0 + WIN.z1) / 2, w: WIN.z1 - WIN.z0, y0: WIN.y0, spring: WIN.spring }], tile: 1.8 }), mWall);
  Mk.mesh("bedroom.wall.left", archWallG({ axis: "z", at: X(XL - WT / 2), u0: ZB - WT, u1: ZF + WT, y0: 0, y1: YC + 0.01, thick: WT, notches: [{ c: (DOOR.z0 + DOOR.z1) / 2, w: DOOR.z1 - DOOR.z0, y0: 0, spring: DOOR.h, round: false }], tile: 1.8 }), mWall);
  // a dark wine dado and its rail, a painted frieze under the ceiling (all four walls; the window and door cut it)
  const mFrieze = Mk.tex(friezeTex(), 0.9);
  for (const [a, b, n] of [[[XL, ZB], [XR, ZB], [0, 0, 1]], [[XL, ZF], [XL, ZB], [1, 0, 0]], [[XR, ZB], [XR, ZF], [-1, 0, 0]]] as [[number, number], [number, number], number[]][]) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(n[0], n[2]);
    const at = (u: number, y: number, off: number) => new THREE.Vector3(X(a[0] + (b[0] - a[0]) * u) + n[0] * off, y, a[1] + (b[1] - a[1]) * u + n[2] * off);
    const fr = new THREE.PlaneGeometry(len, 0.26); const uv = fr.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / 1.3);
    const c = at(0.5, YC - 0.35, 0.004); fr.rotateY(yaw).translate(c.x, c.y, c.z); Mk.mesh("bedroom.frieze", fr, mFrieze, { cast: false, noink: true });
    // the dado: a low dark band (skip where the door is: the left wall's band stops short of it)
    const segs: [number, number][] = n[0] === 1 ? [[0, (ZF - DOOR.z1) / len], [(ZF - DOOR.z0) / len, 1]] : [[0, 1]];
    for (const [u0, u1] of segs) {
      const d = new THREE.PlaneGeometry(len * (u1 - u0), 0.9), cc = at((u0 + u1) / 2, 0.45, 0.004); d.rotateY(yaw).translate(cc.x, cc.y, cc.z); Mk.mesh("bedroom.dado", d, mDado, { cast: false });
      const rl = boxG(-len * (u1 - u0) / 2, len * (u1 - u0) / 2, -0.025, 0.025, -0.02, 0.02).rotateY(yaw); const cr = at((u0 + u1) / 2, 0.92, 0.02); rl.translate(cr.x, cr.y, cr.z); Mk.mesh("bedroom.rail", rl, mWoodLo);
    }
  }

  // ============================================================================================ the window and the night
  {
    const wc = (WIN.z0 + WIN.z1) / 2, ww = WIN.z1 - WIN.z0;
    Mk.mesh("bedroom.sill", boxG(X(XR - 0.06), X(XR + WT), WIN.y0 - 0.06, WIN.y0, WIN.z0 - 0.05, WIN.z1 + 0.05), mWood);
    Mk.mesh("bedroom.night", new THREE.PlaneGeometry(3.0, 3.4).rotateY(-Math.PI / 2).translate(X(XR + WT + 1.2), 1.7, wc - 0.3), Mk.basic("#ffffff", { map: nightTex() }), { cast: false, receive: false, noink: true });
    // two shutters folded open against the reveal (inside)
    const P = new Part(K);
    for (const s of [-1, 1]) P.add(mWoodLo, boxG(X(XR - 0.42), X(XR - 0.02), WIN.y0 + 0.04, WIN.spring + 0.05, wc + s * (ww / 2 + 0.02) - 0.02, wc + s * (ww / 2 + 0.02) + 0.02), 0.005);
    P.into(group, "bedroom.shutters");
    // the moon's light on the floor in front of the window (a cool pool) and a faint shaft
    const dir = new THREE.Vector3(...MOON).normalize().negate(), gx = X(XR - 0.01), top = WIN.spring + ww * 0.4;
    const corners = [new THREE.Vector3(gx, WIN.y0, WIN.z0), new THREE.Vector3(gx, WIN.y0, WIN.z1), new THREE.Vector3(gx, top, WIN.z1), new THREE.Vector3(gx, top, WIN.z0)];
    const sh = sunShaft(corners, dir, 2.4, "#b8c4e0", 0.07); sh.name = "bedroom.moonShaft"; group.add(sh);
  }

  // ============================================================================================ the door (left wall, closed)
  {
    const P = new Part(K), dz0 = DOOR.z0, dz1 = DOOR.z1, x = X(XL - 0.06);
    P.add(mWoodLo, boxG(x - 0.05, x + 0.03, 0, DOOR.h, dz0, dz1), 0.006);
    for (const y of [0.4, 1.05, 1.7]) P.add(mWoodDark, boxG(x + 0.02, x + 0.045, y - 0.05, y + 0.05, dz0 + 0.05, dz1 - 0.05), 0.003);
    P.add(Mk.flat("#3c3640", 0.5), new THREE.TorusGeometry(0.05, 0.012, 6, 12).rotateY(Math.PI / 2).translate(x + 0.06, 1.0, dz0 + 0.15), 0.003);
    for (const z of [dz0 - 0.07, dz1 + 0.07]) P.add(mWood, boxG(X(XL) - 0.01, X(XL) + 0.05, 0, DOOR.h + 0.08, z - 0.07, z + 0.07), 0.004);
    P.add(mWood, boxG(X(XL) - 0.01, X(XL) + 0.05, DOOR.h, DOOR.h + 0.12, dz0 - 0.14, dz1 + 0.14), 0.004);
    P.into(group, "bedroom.door");
  }

  // ============================================================================================ THE BED
  const sways: ((t: number) => void)[] = [];
  {
    const B = BED, x0 = X(B.x0), x1 = X(B.x1), P = new Part(K);
    const mCover = Mk.tex(coverTex(), 0.95), mSkirt = Mk.flat(BC.wineLo, 0.9), mCream = Mk.flat(BC.cream, 0.9), mCreamLo = Mk.flat(BC.creamLo, 0.9);
    // the base and its skirt, the mattress under a quilted cover whose top is her seat (0.42)
    P.add(mWoodDark, boxG(x0 + 0.04, x1 - 0.04, 0, 0.1, B.z0 + 0.04, B.z1 - 0.04), 0.005);
    P.add(mSkirt, boxG(x0 + 0.02, x1 - 0.02, 0.06, 0.3, B.z0, B.z1 - 0.03), 0.005);
    const cov = boxG(x0 - 0.02, x1 + 0.02, 0.1, B.top, B.z0 + 0.02, B.z1 + 0.02);
    const cu = cov.attributes.uv as THREE.BufferAttribute, cp = cov.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cu.count; i++) cu.setXY(i, (cp.getX(i) - x0) / (x1 - x0), (cp.getZ(i) - B.z0) / (B.z1 - B.z0) * 1.4);
    P.add(mCover, cov, 0.006);
    // a wine coverlet folded across the middle, the pillows and a bolster at the head
    P.add(Mk.flat(BC.wine, 0.9), boxG(x0 - 0.005, x1 + 0.005, B.top - 0.06, B.top + 0.035, -2.05, -1.72), 0.005);
    P.add(mCream, new THREE.CylinderGeometry(0.1, 0.1, (x1 - x0) - 0.08, 14).rotateZ(Math.PI / 2).translate((x0 + x1) / 2, B.top + 0.09, B.z0 + 0.22), 0.005);
    for (const s of [-1, 1]) P.add(mCreamLo, new THREE.SphereGeometry(0.26, 16, 12).scale(1.05, 0.42, 0.7).rotateX(-0.5).translate((x0 + x1) / 2 + s * 0.32, B.top + 0.22, B.z0 + 0.32), 0.005);
    // the headboard (carved crest), the four posts, the tester frame
    P.add(mWood, boxG(x0, x1, 0.1, 1.25, B.z0 - 0.06, B.z0), 0.006);
    const crest = new THREE.Shape(); crest.moveTo(-0.72, 0); crest.lineTo(0.72, 0); crest.lineTo(0.72, 0.08); crest.quadraticCurveTo(0.4, 0.12, 0.2, 0.28); crest.quadraticCurveTo(0, 0.42, -0.2, 0.28); crest.quadraticCurveTo(-0.4, 0.12, -0.72, 0.08); crest.closePath();
    P.add(mWood, new THREE.ExtrudeGeometry(crest, { depth: 0.06, bevelEnabled: false, curveSegments: 10 }).translate((x0 + x1) / 2, 1.25, B.z0 - 0.06), 0.006);
    P.add(mGold, new THREE.SphereGeometry(0.05, 12, 10).translate((x0 + x1) / 2, 1.62, B.z0 - 0.03), 0.004);
    for (const x of [x0 - 0.02, x1 + 0.02]) for (const z of [B.z0 - 0.03, B.z1 + 0.02]) {
      P.add(mWood, lathe([[0.001, 0], [0.07, 0], [0.07, 0.12], [0.05, 0.16], [0.042, 0.3], [0.06, 0.42], [0.04, 0.55], [0.035, B.tester - 0.05], [0.05, B.tester - 0.02], [0.001, B.tester]], 14).translate(x, 0, z), 0.005);
      P.add(mGold, new THREE.SphereGeometry(0.045, 10, 8).translate(x, B.tester + 0.18, z), 0.003);
    }
    // the tester (canopy roof): a frame and a cloth roof
    P.add(mWoodLo, boxG(x0 - 0.08, x1 + 0.08, B.tester, B.tester + 0.12, B.z0 - 0.09, B.z1 + 0.08), 0.006);
    P.add(Mk.flat(BC.wineLo, 0.9), boxG(x0 - 0.06, x1 + 0.06, B.tester + 0.12, B.tester + 0.16, B.z0 - 0.07, B.z1 + 0.06), 0.004);
    // the gathered curtains tied back at the foot posts and drawn toward the head along the sides
    const drape = (x: number, z: number, h: number, wide: number, flatX: boolean) => lathe([[0.001, 0], [0.13 * wide, 0.02], [0.15 * wide, 0.3], [0.07, h * 0.48], [0.06, h * 0.52], [0.1 * wide, h * 0.62], [0.17 * wide, h * 0.92], [0.18 * wide, h], [0.001, h + 0.01]], 14).scale(flatX ? 0.55 : 1.25, 1, flatX ? 1.25 : 0.55).translate(x, 0, z);
    const mDrape = Mk.flat(BC.wine, 0.9), mDrape2 = Mk.flat("#542630", 0.9);
    for (const s of [-1, 1]) {
      const xp = s > 0 ? x1 + 0.1 : x0 - 0.1;
      P.add(mDrape, drape(xp, B.z1 + 0.04, B.tester - 0.02, 1.15, true), 0.006);                    // at the foot post
      P.add(mDrape2, drape(xp, B.z0 + 0.18, B.tester - 0.02, 1.6, true), 0.006);                    // drawn back at the head
      P.add(mGold, new THREE.TorusGeometry(0.075, 0.016, 6, 14).rotateX(Math.PI / 2).scale(0.6, 1, 1.3).translate(xp, (B.tester - 0.02) * 0.5, B.z1 + 0.04), 0.003);   // the tie
    }
    P.into(group, "bedroom.bed", { cast: true });
    // the back curtain behind the headboard and the valance round the tester (cloth: folds, a breath of sway)
    const back = hangingCloth(Mk.tex(damaskTex(1.6, 2.2, 1), 0.95, THREE.DoubleSide), 1.6, B.tester - 0.05, { folds: 6, fold: 0.03, amp: 0.004 });
    back.mesh.position.set(X(0), B.tester, B.z0 - 0.12); back.mesh.name = "bedroom.backCurtain"; group.add(back.mesh); sways.push(back.sway);
    const val = (w: number, at: THREE.Vector3, yaw: number, ph: number) => {
      const c = hangingCloth(Mk.tex(damaskTex(w, 0.3, 7), 0.95, THREE.DoubleSide), w, 0.3, { folds: Math.round(w * 6), fold: 0.012, amp: 0.004, ph, nx: 32 });
      c.mesh.position.copy(at); c.mesh.rotation.y = yaw; c.mesh.name = "bedroom.valance"; group.add(c.mesh); sways.push(c.sway);
    };
    val((x1 - x0) + 0.2, new THREE.Vector3(X(0), B.tester + 0.12, B.z1 + 0.105), 0, 0);
    val((B.z1 - B.z0) + 0.2, new THREE.Vector3(x0 - 0.105, B.tester + 0.12, (B.z0 + B.z1) / 2), -Math.PI / 2, 1);
    val((B.z1 - B.z0) + 0.2, new THREE.Vector3(x1 + 0.105, B.tester + 0.12, (B.z0 + B.z1) / 2), Math.PI / 2, 2);
  }

  // ============================================================================================ the chest, the candle, small things
  let candle: ReturnType<typeof addCandle>;
  {
    const P = new Part(K), cx0 = X(0.84), cx1 = X(1.32), cz0 = -1.38, cz1 = -0.9, h = 0.52;
    P.add(mWood, boxG(cx0, cx1, 0.04, h - 0.06, cz0, cz1), 0.006);
    P.add(mWoodLo, boxG(cx0 - 0.02, cx1 + 0.02, h - 0.06, h, cz0 - 0.02, cz1 + 0.02), 0.006);           // the lid
    P.add(mWoodLo, boxG(cx0 + 0.02, cx1 - 0.02, 0, 0.05, cz0 + 0.02, cz1 - 0.02), 0.005);
    for (const z of [cz0 + 0.12, cz1 - 0.12]) P.add(Mk.flat("#3c3640", 0.5), boxG(cx0 - 0.012, cx0 + 0.005, 0.08, h - 0.08, z - 0.025, z + 0.025), 0.003);   // iron straps
    P.add(mGold, boxG(cx0 - 0.018, cx0, h - 0.18, h - 0.1, (cz0 + cz1) / 2 - 0.04, (cz0 + cz1) / 2 + 0.04), 0.003);                                       // the lock plate
    // the candle in a pewter stick, a small book, a cup
    const mPew = Mk.flat("#8e8a84", 0.45);
    P.add(mPew, lathe([[0.001, 0], [0.07, 0], [0.07, 0.015], [0.022, 0.03], [0.018, 0.07], [0.032, 0.08], [0.001, 0.085]], 14).translate(X(CANDLE.x), h, CANDLE.z), 0.004);
    candle = addCandle(P, { wax: Mk.flat("#ece2c8", 0.7), dish: mPew }, X(CANDLE.x), h + 0.085, CANDLE.z, 0.12, 0.7, false);
    group.add(candle.group);
    book(P, { cover: Mk.flat("#5e3a34", 0.7), pages: Mk.flat("#ece2c8", 0.9) }, X(1.13), h, -1.25, 0.2, 0.15, 0.04, -0.4);
    P.add(mPew, lathe([[0.001, 0], [0.03, 0], [0.026, 0.02], [0.034, 0.08], [0.001, 0.07]], 12).translate(X(1.2), h, -1.0), 0.003);
    // a lute leaning on the chest's far side
    const mLute = Mk.flat("#9a6a3e", 0.6);
    P.add(mLute, new THREE.SphereGeometry(0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1.35).rotateX(Math.PI / 2 + 0.3).rotateY(-Math.PI / 2).translate(X(1.48), 0.22, -1.15), 0.005);
    P.add(mWoodDark, boxG(-0.025, 0.025, 0, 0.42, -0.012, 0.012).rotateX(-0.3).rotateY(-Math.PI / 2).translate(X(1.48), 0.36, -1.15), 0.004);
    // a jug and basin on a stand by the window, slippers by the bed
    P.add(mWoodLo, lathe([[0.001, 0], [0.16, 0], [0.12, 0.05], [0.04, 0.1], [0.04, 0.72], [0.18, 0.76], [0.001, 0.78]], 14).translate(X(-1.5), 0, -1.25), 0.005);
    P.add(Mk.flat("#c8bca4", 0.6), lathe([[0.001, 0], [0.08, 0], [0.16, 0.07], [0.15, 0.08], [0.001, 0.03]], 18).translate(X(-1.5), 0.78, -1.25), 0.004);
    jug(P, Mk.flat("#d4c8ae", 0.6), X(-1.5), 0.8, -1.25, 0.2, 0.06, 0.8);
    P.into(group, "bedroom.things", { cast: true });
    // the candle's pool on the chest lid, the wall behind it and the floor
    for (const [p, n, w, a] of [[new THREE.Vector3(X(CANDLE.x), h + 0.002, CANDLE.z), new THREE.Vector3(0, 1, 0), 0.9, 0.35], [new THREE.Vector3(X(CANDLE.x), 0.0015, CANDLE.z + 0.3), new THREE.Vector3(0, 1, 0), 2.8, 0.14]] as [THREE.Vector3, THREE.Vector3, number, number][]) {
      const m = lightPool(p, n, w, w, "#ffb468", a); group.add(m); candle.pools.push(m);
    }
  }
  // the rug at the bed's foot (a sheet at 1 mm, under the figures' contact shadow)
  Mk.mesh("bedroom.rug", new THREE.PlaneGeometry(1.5, 0.95).rotateX(-Math.PI / 2).translate(X(0), 0.001, -0.25), Mk.tex(rugTex(), 0.95), { cast: false, noink: true });
  const halo = glowCard(0.5, "#ffb060", 0.18); halo.position.set(X(CANDLE.x), 0.75, CANDLE.z); group.add(halo);

  // ============================================================================================ the light
  const Lr = lightRig(group, { dir: MOON, k: 2.8, col: "#a4b0d4", at: [X(0), 0, -1.4], half: 3.6, hemi: ["#4a4c62", "#1e1818", 0.55], point: { col: "#ffb468", k: 4.6, at: [X(CANDLE.x) - 0.05, 0.85, CANDLE.z + 0.1], dist: 6 } });
  Lr.key.shadow.bias = -0.0004;
  const pk = Lr.point.intensity;

  const hide: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name === "bedroom.wall.left") hide.push([o, (p) => p.x < X(XL) - 0.02]);
    if (o.name === "bedroom.wall.right") hide.push([o, (p) => p.x > X(XR) + 0.02]);
    if (o.name === "bedroom.wall.back") hide.push([o, (p) => p.z < ZB - 0.02]);
    if (o.name === "bedroom.wall.front") hide.push([o, (p) => p.z > ZF + 0.02]);
  });
  return {
    group,
    view(cam: THREE.Vector3) {
      for (const [o, behind] of hide) o.visible = !behind(cam);
      candle.face(cam); halo.rotation.set(0, Math.atan2(cam.x - halo.position.x, cam.z - halo.position.z), 0);
    },
    animate(t: number) {
      candle.animate(t);
      const k = candle.level(t);
      Lr.point.intensity = pk * k;
      (halo.material as THREE.MeshBasicMaterial).opacity = 0.18 * k;
      for (const s of sways) s(t);
    },
  };
};

export const BEDROOM: PlaceDef = { look: LOOK, params: PARAMS, build };

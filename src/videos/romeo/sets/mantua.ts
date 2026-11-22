// THE MANTUA (place "mantua", island x = ISLAND.mantua): scene 7, Wednesday noon. Set builder C. Marks and cameras:
// places.ts STAGE.mantua. The opposite of Verona's warmth: a bare, bleached street under a flat white noon light.
//
// WHAT THERE IS (the cameras look down the street toward -z)
//   - a long straight street 5.2 m wide (house fronts at x -2.6 and +2.6) of packed pale dust, two worn wheel ruts
//     down it, a few stones;
//   - low pale houses (one and two storeys, 3.4 to 5 m) of bleached lime plaster, flat tops behind low parapets or a
//     low pale-tiled roof, FEW windows (small, shut with grey boards, or dark), plank doors; a stretch of bare wall;
//   - a DEAD TREE leaning out of a gap on the left (z -6.8), bare grey limbs;
//   - a WELL on the right near the camera (z -2.8): a round stone curb, a wooden frame, a bucket;
//   - THE TOWN GATE closing the far end (z -31): a squat crenellated tower with an arched passage, the bright empty
//     country seen through it (a painted card); where the rider leaves (the shots add the horse: prop horseRider);
//   - pale dust drifting low over the street (animate, a pure function of t).
// THE LIGHT: the sun nearly overhead, white; the hemisphere strong and pale: almost no shadow, short ones straight down.
// Nothing warm, nothing red. Seeded painting.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig, paint, rng, css, mix, toHex, blotch, skyDome, farCard, limb, NOINK, type SkyStops } from "../../../kit/sets/okit";
import { maker, levelQuad } from "../../newton/sets/parts/common";
import { ISLAND } from "../places";
import { Batch, boxG, house, houseAt, frontTex, tilesTex, raftersTex, softCard, holedWall, revealG, type FrontPal, type Win } from "./parts/c_town";

const X0 = ISLAND.mantua;
/** the Mantua street's numbers (local to the island) */
export const MANTUA_SET = { fxL: -2.6, fxR: 2.6, gateZ: -31, tree: [-1.95, -6.8] as [number, number], well: [1.5, -3.1] as [number, number], bush: [-0.95, -2.3] as [number, number] };
const S = MANTUA_SET;

const CAST = {
  key: [0.15, 0.95, 0.28], tint: [1.0, 1.0, 0.98], tintK: 0.5, gain: 0.97, grad: 0.2, bodyGrad: 0.14, sideTint: [0.95, 0.95, 1.0],
  shade: [1.02, 0.98, 1.14], shadeK: 0.26, wrap: [30, 58], edge: 0.14, broad: 0.05, bodySat: 0.08, sheen: 0.05, lift: 0.03, contactLen: 0,
} as unknown as Partial<CastLight>;
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.8, 0.77, 0.72]], [-10, [0.86, 0.83, 0.78]], [4, [0.96, 0.95, 0.93]], [40, [0.94, 0.95, 0.96]], [90, [0.95, 0.96, 0.97]]],
  boxes: [{ az: 70, el: 80, rot: 0, w: 40, h: 30, soft: 20, col: [1.1, 1.08, 1.04] }],
};
const LOOK: PlaceLook = {
  bg: "#ecebe6",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 0.85, color: "#7a7680" },
  cast: { ...CAST, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.25,
};
const PARAMS: Record<string, ParamValue> = {};
const SKY: SkyStops = [[-10, "#dcd8ce"], [0, "#f2f0ea"], [12, "#eeefea"], [40, "#e6e9e8"], [90, "#dde2e3"]];
const PAL = (wall: string, o: Partial<FrontPal> = {}): FrontPal => ({
  wall, wallLo: toHex(mix(wall, "#bdb6aa", 0.35)), wallHi: toHex(mix(wall, "#ffffff", 0.5)), trim: toHex(mix(wall, "#d8d0c2", 0.5)), shutter: "#a29c92", plinth: "#cbc2b2", line: "#6a6258",
  brick: "#bca896", dark: "#5e5856", ...o,
});
const WALLS = [PAL("#f2eee4"), PAL("#ece6da"), PAL("#f4f0e8"), PAL("#e8e3d8"), PAL("#f0eade")];

function build(K: Kit): PlaceBuild {
  const group = new THREE.Group(); group.name = "mantua";
  const Mk = maker(K, group), BT = new Batch();
  const L = (x: number) => X0 + x;
  const roof = { tile: Mk.tex(tilesTex(71, "#cfc4b4", "#b0a696", "#e2dacc"), 0.95), under: Mk.tex(raftersTex("#9a9286", "#7a746c"), 0.95), fascia: Mk.flat("#a8a096", 0.9), end: Mk.flat("#ddd6c8", 0.92) };
  const mDoorBack = Mk.tex(paint(128, 256, (g, W, H) => { g.fillStyle = "#a49c90"; g.fillRect(0, 0, W, H); g.strokeStyle = "#7e776e"; g.lineWidth = 4; for (let x = 0; x < W; x += W / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.fillStyle = "#8a8378"; g.fillRect(0, H * 0.22, W, 12); g.fillRect(0, H * 0.72, W, 12); }), 0.92), mReveal = Mk.flat("#d6cebe", 0.92);

  // ---------------------------------------------------------------------------------------------- the ground: pale dust, ruts
  const dust = Mk.tex(paint(512, 512, (g, W, H) => {
    const r = rng(72); g.fillStyle = "#ddd2bc"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { const x = W * r(), y = H * r(), rr = 30 + 70 * r(); for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blotch(g, x + dx, y + dy, rr, r() < 0.5 ? "#e8e0cc" : "#cbbfa6", 0.22); }
    for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? "rgba(150,136,116,0.22)" : "rgba(250,246,236,0.2)"; g.fillRect(W * r(), H * r(), 2 + 4 * r(), 2 + 3 * r()); }
  }, true), 0.97);
  Mk.mesh("mantua.ground", levelQuad(L(-50), L(50), -90, 30, 0, (x, z) => [(x - X0) / 3.6, -z / 3.6]), dust, { cast: false });
  const ruts = Mk.tex(paint(256, 512, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    for (const cx of [0.24, 0.76]) {
      const gr = g.createLinearGradient(W * (cx - 0.12), 0, W * (cx + 0.12), 0);
      gr.addColorStop(0, "rgba(176,160,136,0)"); gr.addColorStop(0.35, "rgba(176,160,136,0.55)"); gr.addColorStop(0.5, "rgba(160,144,120,0.6)"); gr.addColorStop(0.65, "rgba(236,228,212,0.5)"); gr.addColorStop(1, "rgba(236,228,212,0)");
      g.fillStyle = gr; g.fillRect(W * (cx - 0.12), 0, W * 0.24, H);
    }
    const r = rng(73); for (let i = 0; i < 40; i++) blotch(g, W * r(), H * r(), 18 + 30 * r(), "#c4b69c", 0.25);
  }, true), 0.97);
  (ruts as THREE.MeshPhysicalMaterial).transparent = true; (ruts as THREE.MeshPhysicalMaterial).depthWrite = false;
  const rutM = Mk.mesh("mantua.ruts", levelQuad(L(-1.25), L(1.25), S.gateZ + 0.5, 12, 0.0006, (x, z) => [(x - X0 + 1.25) / 2.5, -z / 6]), ruts, { cast: false, receive: true });
  rutM.layers.set(NOINK); rutM.renderOrder = 1;

  // ---------------------------------------------------------------------------------------------- the houses
  type HS = { side: "L" | "R"; z0: number; z1: number; h: number; wins: Win[]; roof: "flat" | "eaves"; door?: { u: number; w: number; h: number; arch?: number } };
  const HOUSES: HS[] = [
    { side: "L", z0: 7, z1: 0.6, h: 4.6, roof: "eaves", wins: [{ u: 1.6, y0: 2.75, y1: 3.45, w: 0.55, kind: "plank" }], door: { u: 4.4, w: 1.0, h: 2.1 } },
    { side: "L", z0: 0.6, z1: -5.6, h: 3.6, roof: "flat", wins: [{ u: 1.2, y0: 1.3, y1: 1.85, w: 0.5, kind: "dark" }], door: { u: 3.6, w: 1.0, h: 2.05, arch: 0.4 } },
    { side: "L", z0: -8.0, z1: -14.5, h: 4.9, roof: "eaves", wins: [{ u: 1.5, y0: 3.0, y1: 3.65, w: 0.55, kind: "plank" }, { u: 4.6, y0: 3.0, y1: 3.65, w: 0.55, kind: "dark" }], door: { u: 3.0, w: 1.05, h: 2.15 } },
    { side: "L", z0: -14.5, z1: -21, h: 3.5, roof: "flat", wins: [{ u: 4.8, y0: 1.35, y1: 1.85, w: 0.45, kind: "plank" }], door: { u: 1.9, w: 1.0, h: 2.0 } },
    { side: "L", z0: -21, z1: -31, h: 4.4, roof: "eaves", wins: [{ u: 2.0, y0: 2.8, y1: 3.4, w: 0.5, kind: "plank" }, { u: 7.5, y0: 2.8, y1: 3.4, w: 0.5, kind: "plank" }], door: { u: 5.0, w: 1.0, h: 2.1 } },
    { side: "R", z0: -31, z1: -22.5, h: 3.8, roof: "flat", wins: [{ u: 2.5, y0: 1.4, y1: 1.9, w: 0.45, kind: "dark" }], door: { u: 5.6, w: 1.0, h: 2.05 } },
    { side: "R", z0: -22.5, z1: -15.5, h: 5.0, roof: "eaves", wins: [{ u: 1.8, y0: 3.05, y1: 3.7, w: 0.55, kind: "plank" }, { u: 5.2, y0: 3.05, y1: 3.7, w: 0.55, kind: "plank" }], door: { u: 3.5, w: 1.05, h: 2.15, arch: 0.45 } },
    { side: "R", z0: -15.5, z1: -9.2, h: 3.4, roof: "flat", wins: [], door: { u: 4.6, w: 1.0, h: 2.0 } },
    { side: "R", z0: -9.2, z1: -3.6, h: 4.3, roof: "eaves", wins: [{ u: 3.9, y0: 2.6, y1: 3.2, w: 0.5, kind: "plank" }], door: { u: 1.6, w: 1.0, h: 2.1 } },
    { side: "R", z0: -3.6, z1: 7, h: 3.7, roof: "flat", wins: [{ u: 6.2, y0: 1.3, y1: 1.85, w: 0.5, kind: "dark" }], door: { u: 8.6, w: 1.0, h: 2.05 } },
  ];
  HOUSES.forEach((hs, i) => {
    const w = Math.abs(hs.z1 - hs.z0), M = hs.side === "L" ? houseAt(L(S.fxL), hs.z0, Math.PI / 2) : houseAt(L(S.fxR), hs.z0, -Math.PI / 2), pal = WALLS[i % WALLS.length];
    const d = hs.door, holes = d ? [{ u0: d.u - d.w / 2, u1: d.u + d.w / 2, y0: 0, y1: d.h, arch: d.arch, surround: 0.1 }] : [];
    const tex = frontTex({ seed: 900 + i, w, h: hs.h, ppm: 44, pal, wins: hs.wins, courses: [], cornice: false, plinth: 0.4, holes, brickPatches: i % 3 === 0 ? 1 : 0, cracks: 3 });
    house(Mk, BT, M, { w, h: hs.h, D: 5, face: Mk.tex(tex, 0.95), side: Mk.flat(toHex(mix(pal.wall, "#b0a898", 0.15)), 0.95), holes, back: mDoorBack, recess: 0.22, reveal: mReveal, roof: { kind: hs.roof, rise: 0.8, over: 0.35, m: roof }, cast: true }, `mantua.house${i}`);
  });
  // the stretch of bare wall with the gap the dead tree leans out of (left, z -5.6 .. -8.0)
  const mWall = Mk.tex(frontTex({ seed: 960, w: 2.4, h: 2.3, ppm: 44, pal: WALLS[2], wins: [], plinth: 0.3, cracks: 2 }), 0.95);
  Mk.mesh("mantua.wall", new THREE.BoxGeometry(0.4, 2.3, 0.7).translate(L(S.fxL - 0.2), 1.15, -5.95), [mWall, mWall, Mk.flat("#ddd6c8", 0.92), mWall, mWall, mWall], { cast: true });
  Mk.mesh("mantua.wall2", new THREE.BoxGeometry(0.4, 2.3, 0.6).translate(L(S.fxL - 0.2), 1.15, -7.7), [mWall, mWall, Mk.flat("#ddd6c8", 0.92), mWall, mWall, mWall], { cast: true });

  // ---------------------------------------------------------------------------------------------- the gate
  {
    const gz = S.gateZ, gw = 9.0, gh = 7.2, a: [number, number] = [L(-gw / 2), gz], b: [number, number] = [L(gw / 2), gz];
    const hole = { u0: gw / 2 - 1.25, u1: gw / 2 + 1.25, y0: 0, y1: 3.8, arch: 1.2 };
    const mGate = Mk.tex(frontTex({ seed: 980, w: gw, h: gh, ppm: 36, pal: PAL("#e2dccd"), wins: [{ u: gw / 2, y0: 5.0, y1: 5.7, w: 0.4, kind: "dark" }], plinth: 0.6, holes: [{ ...hole, surround: 0.3 }], courses: [4.6], brickPatches: 2, cracks: 4 }), 0.95);
    Mk.mesh("mantua.gate.front", holedWall(a, b, 0, gh, [hole], gw, gh), mGate, { cast: true });
    const deep = 1.6, mSide = Mk.flat("#d2cabb", 0.95);
    Mk.mesh("mantua.gate.reveal", revealG(a, b, { ...hole, arch: 0 }, deep, 0.6, [0, 1, 3]), mReveal, { cast: false });
    // the arched soffit through the passage
    const n = 12, pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = hole.u1 - (hole.u1 - hole.u0) * t, y = hole.y1 - hole.arch + hole.arch * Math.sin(Math.PI * t) ** 0.6; pts.push(new THREE.Vector3(L(-gw / 2) + x, Math.min(hole.y1, y), gz)); }
    const pos: number[] = [];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[i + 1], P2 = q.clone().setZ(gz - deep), P3 = p.clone().setZ(gz - deep); for (const v of [p, q, P2, p, P2, P3]) pos.push(v.x, v.y, v.z); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.computeVertexNormals();
    Mk.mesh("mantua.gate.soffit", sg, mReveal, { cast: false });
    // the masses either side of and over the passage, the crenellations, the back face
    BT.add(mSide, boxG(L(-gw / 2), L(hole.u0 - gw / 2), 0, gh, gz - deep, gz - 0.01));
    BT.add(mSide, boxG(L(hole.u1 - gw / 2), L(gw / 2), 0, gh, gz - deep, gz - 0.01));
    BT.add(mSide, boxG(L(hole.u0 - gw / 2), L(hole.u1 - gw / 2), hole.y1, gh, gz - deep, gz - 0.01));
    for (let x = -gw / 2; x < gw / 2 - 0.2; x += 1.1) BT.add(mSide, boxG(L(x), L(x + 0.62), gh - 0.01, gh + 0.75, gz - deep, gz + 0.02));
    BT.add(mSide, boxG(L(-gw / 2 - 0.05), L(gw / 2 + 0.05), gh - 0.25, gh, gz - deep - 0.05, gz + 0.06));
  }
  // ---------------------------------------------------------------------------------------------- the dead tree
  {
    const [tx, tz] = S.tree, mBark = Mk.tex(paint(64, 256, (g, W, H) => { g.fillStyle = "#9a948c"; g.fillRect(0, 0, W, H); g.strokeStyle = "rgba(90,84,78,0.5)"; g.lineWidth = 3; for (let x = 6; x < W; x += 12) { g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 5, H * 0.3, x - 5, H * 0.6, x + 2, H); g.stroke(); } }, true), 0.95);
    const V = (x: number, y: number, z: number) => new THREE.Vector3(L(tx + x), y, tz + z);
    const limbs: [THREE.Vector3, THREE.Vector3, number, number][] = [
      [V(0, -0.1, 0), V(0.25, 1.6, 0.05), 0.2, 0.15], [V(0.25, 1.6, 0.05), V(0.62, 2.7, 0.1), 0.15, 0.1],
      [V(0.62, 2.7, 0.1), V(1.25, 3.5, 0.0), 0.1, 0.06], [V(0.62, 2.7, 0.1), V(0.45, 3.7, -0.1), 0.09, 0.05],
      [V(0.25, 1.6, 0.05), V(1.0, 2.2, 0.25), 0.1, 0.06], [V(1.0, 2.2, 0.25), V(1.55, 2.35, 0.3), 0.06, 0.045],
      [V(0.25, 1.6, 0.05), V(-0.35, 2.6, -0.2), 0.09, 0.055], [V(-0.35, 2.6, -0.2), V(-0.55, 3.2, -0.2), 0.055, 0.045],
      [V(1.25, 3.5, 0.0), V(1.7, 3.75, 0.05), 0.06, 0.045], [V(0.45, 3.7, -0.1), V(0.6, 4.2, -0.12), 0.05, 0.045],
    ];
    for (const [a, b, ra, rb] of limbs) BT.add(mBark, limb(a, b, ra, rb, 12));
    for (const [a, , ra] of limbs) BT.add(mBark, new THREE.SphereGeometry(ra * 1.02, 12, 8).translate(a.x, a.y, a.z));
    BT.add(mBark, new THREE.ConeGeometry(0.34, 0.3, 12).translate(L(tx), 0.1, tz));   // the root flare
  }
  // ---------------------------------------------------------------------------------------------- the well
  {
    const [wx, wz] = S.well, x = L(wx), mStone = Mk.flat("#d8d0c2", 0.92), mStoneLo = Mk.flat("#bfb6a6", 0.92), mWood = Mk.flat("#8e867a", 0.9);
    BT.add(mStone, new THREE.LatheGeometry([[0, 0], [0.62, 0], [0.62, 0.1], [0.56, 0.14], [0.56, 0.66], [0.63, 0.7], [0.63, 0.8], [0.44, 0.8], [0.44, 0.6], [0, 0.6]].map(([a, b]) => new THREE.Vector2(a, b)), 24).translate(x, 0, wz));
    for (const s of [-1, 1]) BT.add(mWood, boxG(x + s * 0.56 - 0.07, x + s * 0.56 + 0.07, 0.7, 1.85, wz - 0.07, wz + 0.07));
    BT.add(mWood, boxG(x - 0.7, x + 0.7, 1.82, 1.95, wz - 0.06, wz + 0.06));
    BT.add(mStoneLo, new THREE.CylinderGeometry(0.12, 0.12, 0.09, 16).rotateX(Math.PI / 2).translate(x, 1.72, wz));
    // the bucket on the curb
    const P = new Part(K); P.add(K.flat("#9a9082", { rough: 0.9 }), new THREE.CylinderGeometry(0.13, 0.1, 0.24, 16).translate(x - 0.3, 0.92, wz + 0.42), 0.006); P.into(group, "mantua.bucket");
  }
  // stones and a few dry tufts along the wall feet (props-kit parts: no ink pass)
  {
    const r = rng(74), P = new Part(K), mSt = K.flat("#c8bea8", { rough: 0.95 }), mTuft = K.flat("#b4aa86", { rough: 0.95 });
    for (let i = 0; i < 14; i++) { const x = (r() < 0.5 ? -1 : 1) * (1.2 + 1.2 * r()), z = 2 - 26 * r(); P.add(mSt, new THREE.SphereGeometry(0.06 + 0.06 * r(), 10, 7).scale(1.3, 0.55, 1).translate(L(x), 0.02, z), 0.006); }
    for (let i = 0; i < 9; i++) {
      const sx = r() < 0.5 ? -1 : 1, x = sx * (S.fxR - 0.12), z = 3 - 25 * r();
      for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + r(); P.add(mTuft, new THREE.ConeGeometry(0.03, 0.22 + 0.1 * r(), 6).rotateZ(Math.cos(a) * 0.5).rotateX(Math.sin(a) * 0.5).translate(L(x) + Math.cos(a) * 0.04, 0.1, z + Math.sin(a) * 0.04), 0.005); }
    }
    // a dry thorn bush and two big stones near the camera (the lower part of the frame from "above")
    const [bx, bz] = S.bush, mTwig = K.flat("#a69c84", { rough: 0.95 });
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2 + 0.3 * r(), l = 0.32 + 0.18 * r(); P.add(mTwig, limb(new THREE.Vector3(L(bx), 0.02, bz), new THREE.Vector3(L(bx) + Math.cos(a) * l * 0.8, 0.18 + 0.25 * r(), bz + Math.sin(a) * l * 0.8), 0.022, 0.012, 6), 0.005); }
    P.add(mSt, new THREE.SphereGeometry(0.2, 14, 10).scale(1.4, 0.7, 1.1).translate(L(bx + 0.45), 0.06, bz + 0.35), 0.008);
    P.add(mSt, new THREE.SphereGeometry(0.14, 12, 9).scale(1.2, 0.8, 1).translate(L(-1.9), 0.05, -3.4), 0.008);
    P.into(group, "mantua.bits");
  }
  BT.flush(group, "mantua.parts");

  // ---------------------------------------------------------------------------------------------- the sky and the country beyond the gate
  group.add(skyDome(new THREE.Vector3(L(0), 0, -10), SKY));
  const far = farCard(L(-30), L(30), -0.5, 12, -70, 1536, 384, (g, k0) => {
    const k = { ...k0, px: (x: number) => k0.px(L(x)) };
    const r = rng(75);
    g.fillStyle = "#e4dccb"; g.fillRect(0, k.py(1.2), k.W, k.py(-0.5) - k.py(1.2));
    g.fillStyle = "#d6d3c8"; g.beginPath(); g.moveTo(0, k.py(1.2)); for (let x = -30; x <= 30; x += 2) g.lineTo(k.px(x), k.py(1.2 + 1.6 * (0.5 + 0.5 * Math.sin(x * 0.21 + 1)) * r() + 0.4)); g.lineTo(k.W, k.py(1.2)); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const x = -26 + 52 * r(); g.fillStyle = "#b8b4a8"; g.fillRect(k.px(x), k.py(1.9), 0.12 * k.s, 0.8 * k.s); g.beginPath(); g.ellipse(k.px(x + 0.06), k.py(2.2), 0.45 * k.s, 0.3 * k.s, 0, 0, 7); g.fill(); }
  });
  (far.material as THREE.MeshBasicMaterial).alphaTest = 0.5; group.add(far);

  // ---------------------------------------------------------------------------------------------- drifting dust
  const veils: { m: THREE.Mesh; x0: number; z: number; sp: number; ph: number; y: number }[] = [];
  [[-0.5, -12, 0.35, 0.0, 0.5], [1.2, -20, 0.25, 0.4, 0.7], [-1.4, -6, 0.3, 0.7, 0.4], [0.4, -26, 0.22, 0.2, 0.9]].forEach(([x, z, sp, ph, y], i) => {
    const m = softCard(3.2 + i * 0.4, 1.0, "#f4ecdc", 0.4); m.layers.set(NOINK); m.renderOrder = 3; m.name = "mantua.dust"; group.add(m);
    veils.push({ m, x0: x, z, sp, ph, y });
  });
  const animate = (t: number) => {
    for (const v of veils) {
      const u = ((t * v.sp * 0.25 + v.ph) % 1 + 1) % 1, k = Math.sin(Math.PI * u);
      v.m.position.set(L(v.x0 - 2 + 4 * u), v.y + 0.1 * Math.sin(t * 0.7 + v.ph * 6), v.z);
      (v.m.material as THREE.MeshBasicMaterial).opacity = 0.35 * k;
    }
  };
  animate(0);
  lightRig(group, { dir: [0.38, 1, 0.22], k: 1.3, col: "#fffaf2", at: [L(0), 0, -8], half: 14, hemi: ["#fbfaf6", "#efe6d6", 2.9] });
  return { group, animate, cast() { return CAST; } };
}

/** scene 7's Mantua street at noon: no params */
export const MANTUA: PlaceDef = { look: LOOK, params: PARAMS, build };

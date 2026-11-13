// THE GARDEN (place "garden", island x 300): the small walled garden below Newton's window, at noon and at night (PLAN
// 1, 7C, F start, G end). WP2's set; the exports are the contract of sets/index.ts: GARDEN_LOOK, GARDEN_PARAMS,
// buildGarden(K) -> { group, view, animate, setParam, cast }; gardenCast(time) is the figure light per time.
// Every place-number is layout/garden.ts GARDEN_SET.
//
// WHAT THERE IS (the camera mostly looks north, -z)
//   - RAKED GRAVEL walks (the rake lines run along each walk) round two lawn beds edged with low box hedges, clipped
//     box cones at the corners, a sundial on a stone pillar in the south bed;
//   - WEST: the college range: red brick in English bond, a stone plinth and string course, stone-framed leaded
//     windows with hood moulds, a parapet and a tiled roof with chimneys; his STAIRCASE DOOR (a four-centred stone
//     arch, the door open on a dim stair foot) and HIS WINDOW on the first floor (param window 0..1: lit warm);
//   - NORTH: the chapel's flank: pale ashlar, buttresses with set-offs and pinnacles, battlements against the sky, two
//     big traceried windows; against it his ELABORATORY: a brick lean-to with a tiled pent roof, a brick chimney, a
//     plank door standing ajar and a little leaded window (param glow 0..1: the door's gap, the window and the
//     chimney's mouth glow orange, a warm light falls on the gravel in front);
//   - EAST and SOUTH: brick garden walls with stone copings (a gate in the south one), trees beyond.
// THE TIME (param time): "noon" = a high sun from the front left (short shadows), a blue sky with clouds; "night" =
// MOONLIGHT: a cool key from the moon behind her right shoulder, a strong blue sky fill, a deep blue sky with the moon
// and stars: a BLUE MID-TONE where gravel, stone and brick all read (never black).
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, skyDome, Batch, glowCard, type SkyStops } from "../../../kit/sets/okit";
import { GARDEN_SET as S, GDX } from "../layout/garden";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, wallQuad, tileUV, lathe, roundBox, rockG, Part, quad4 } from "./parts/common";
import { NC, NOINK, holedWall, revealG, wallPoly, brickTex, ashlarTex, gravelTex, leadedTex, plasterTex, roofTilesTex, plankTex, type Hole } from "./parts/newton";

export type GardenTime = "noon" | "night";
const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" };
/** THE FIGURES' LIGHT per time (cast() lays it over GARDEN_LOOK.cast; or w.setPlace("garden", { light: gardenCast("night") })) */
export const GARDEN_CAST: Record<GardenTime, Partial<CastLight>> = {
  noon: { key: [-0.45, 0.78, 0.45], tint: [1.0, 0.97, 0.92], tintK: 0.7, gain: 0.97, shade: [1.04, 0.95, 1.34], broad: 0, sheen: 0.08, contactLen: 0.45 },
  night: { key: [0.42, 0.62, 0.66], tint: [0.8, 0.88, 1.0], tintK: 0.75, gain: 0.86, shade: [1.0, 0.92, 1.9], broad: 0.3, sheen: 0.1, contactLen: 0.2 },
} as unknown as Record<GardenTime, Partial<CastLight>>;
export const gardenCast = (t: GardenTime): Partial<CastLight> => GARDEN_CAST[t] ?? GARDEN_CAST.noon;

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.48, 0.45, 0.4]], [-10, [0.55, 0.53, 0.5]], [4, [0.75, 0.8, 0.88]], [30, [0.66, 0.74, 0.88]], [90, [0.58, 0.67, 0.88]]],
  boxes: [{ az: 135, el: 50, rot: 0, w: 36, h: 20, soft: 14, col: [1.0, 0.96, 0.88] }],
};
/** the garden's look (the figure light is noon's; cast() lays night over it) */
export const GARDEN_LOOK: PlaceLook = {
  bg: "#9cc0e0",
  ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.7, color: "#2e2c40" },
  cast: { grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.94, 1.0], shadeK: 0.36, wrap: [26, 52], edge: 0.13, bodySat: 0.13, lift: 0, ...GARDEN_CAST.noon, ...BAKED } as unknown as CastLight,
  fill: FILL,
  bloom: 0.35,
};
/** the per-frame dressing: time "noon" | "night", glow 0..1 (the elaboratory's door, window and chimney), window 0..1
 *  (his window lit) */
export const GARDEN_PARAMS: Record<string, ParamValue> = { time: "noon", glow: 0, window: 0 };

const B = S.bounds, WK = S.walks, R = S.range, C = S.chapel, E = S.elab;
const X0 = GDX + B.x0, X1 = GDX + B.x1, Z0 = B.z0, Z1 = B.z1;
const SKY_NOON: SkyStops = [[-10, "#c9c2b0"], [0, "#e4ebee"], [8, "#c6dbee"], [25, "#9cc0e6"], [60, "#78a6dc"], [90, "#6a9ad6"]];
const SKY_NIGHT: SkyStops = [[-10, "#2c3658"], [0, "#56689c"], [8, "#465a92"], [25, "#36487e"], [60, "#2a3a6e"], [90, "#243266"]];

// ---------------------------------------------------------------------------------------------------- paintings
const lawnTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(91);
  g.fillStyle = NC.grass; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) { g.fillStyle = css(i % 2 ? NC.grassLo : "#93ae5e", 0.18); g.fillRect((W * i) / 4, 0, W / 4, H); }   // mowing stripes
  for (let i = 0; i < 900; i++) { g.fillStyle = css(r() < 0.5 ? NC.grassLo : "#9cba66", 0.35); g.fillRect(W * r(), H * r(), 2, 4 + 4 * r()); }
}, true);
const leafTex = (base: string, lo: string, hi: string, seed: number) => paint(256, 256, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 320; i++) { const x = W * r(), y = H * r(), s = 3 + 6 * r(); for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { g.fillStyle = css(r() < 0.5 ? lo : hi, 0.5); g.beginPath(); g.ellipse(x + dx, y + dy, s, s * 0.7, r() * 3, 0, 7); g.fill(); } }
}, true);
/** a big perpendicular chapel window: pale stone mullions and tracery over dark glass (blue-grey by day) */
const traceryTex = (w: number, h: number, rise: number) => paint(Math.round(w * 100), Math.round(h * 100), (g, W, H) => {
  const ppm = W / w, r = rng(93);
  g.fillStyle = "#5a6478"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { g.fillStyle = css(r() < 0.5 ? "#6e7a90" : "#4a5266", 0.6); g.fillRect(W * r(), H * r(), 8 + 10 * r(), 10 + 14 * r()); }   // glass quarries' tone
  g.strokeStyle = "rgba(40,40,50,0.55)"; g.lineWidth = 1.5;
  for (let x = 0; x < W; x += 0.14 * ppm) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 0.2 * ppm) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const st = NC.stoneHi, mw = 0.11 * ppm, n = 5;
  g.fillStyle = st;
  for (let i = 1; i < n; i++) g.fillRect((W * i) / n - mw / 2, (rise / h) * H * 0.4, mw, H);           // mullions
  for (const v of [0.42, 0.72]) g.fillRect(0, H * (1 - v * (1 - rise / h)), W, mw * 0.9);               // transoms
  // the tracery in the head: little arched panels (cinquefoil-ish) under the arch
  g.strokeStyle = st; g.lineWidth = mw * 0.8;
  const top = (rise / h) * H;
  for (let i = 0; i < n; i++) { const x0 = (W * i) / n, x1 = (W * (i + 1)) / n, cx = (x0 + x1) / 2; g.beginPath(); g.moveTo(x0, top * 1.15); g.quadraticCurveTo(cx, top * 0.55, x1, top * 1.15); g.stroke(); }
  g.beginPath(); g.moveTo(W * 0.2, top * 0.95); g.quadraticCurveTo(W * 0.5, -top * 0.1, W * 0.8, top * 0.95); g.stroke();
  g.lineWidth = mw * 0.6; g.beginPath(); g.arc(W * 0.5, top * 0.62, W * 0.09, 0, 7); g.stroke();
});
/** the stair foot seen through his open door: dim oak steps going up into the dark */
const stairFootTex = () => paint(256, 384, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#2e2620"); gr.addColorStop(1, "#5a4636");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { const y = H - (i + 1) * H * 0.11; g.fillStyle = css(mix("#7a5a3e", "#3a2c22", i / 7)); g.fillRect(W * 0.15, y, W * 0.7, H * 0.035); }
  g.fillStyle = "rgba(230,215,190,0.18)"; g.fillRect(0, 0, W * 0.12, H); g.fillRect(W * 0.88, 0, W * 0.12, H);
});
/** the elaboratory's firelit inside, seen through the door gap and the window (unlit: its colour is the glow) */
const fireInsideTex = () => paint(128, 192, (g, W, H) => {
  const gr = g.createRadialGradient(W * 0.4, H * 0.8, 0, W * 0.4, H * 0.8, H * 0.9); gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.35, "#ffa040"); gr.addColorStop(1, "#7a2a10");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(60,20,10,0.5)"; g.fillRect(W * 0.6, H * 0.2, W * 0.25, H * 0.6);
});
// ---------------------------------------------------------------------------------------------------- the builder
export function buildGarden(K: Kit) {
  const group = new THREE.Group(); group.name = "garden";
  const Mk = maker(K, group), BT = new Batch();
  const mGravelZ = Mk.tex(gravelTex({ seed: 94, lines: 9 }), 0.95), mGravelX = Mk.tex(gravelTex({ seed: 95, lines: 9 }), 0.95);
  const mLawn = Mk.tex(lawnTex(), 0.95), mBox = Mk.tex(leafTex(NC.box, NC.boxLo, NC.boxHi, 96), 0.9);
  const mBrick = Mk.tex(brickTex({ seed: 97 }), 0.9), mBrickE = Mk.tex(brickTex({ seed: 98, soot: 0.25 }), 0.9);
  const mStone = Mk.tex(ashlarTex({ seed: 99, nx: 3, ny: 4 }), 0.9), mStonePlain = Mk.flat(NC.stone, 0.9), mStoneLo = Mk.flat(NC.stoneLo, 0.9);
  const mTile = Mk.tex(roofTilesTex(), 0.85), mIron = Mk.flat(NC.iron, 0.5), mBronze = Mk.flat("#9a7a3e", 0.5), mBark = Mk.flat("#5e4636", 0.9);
  const mTree = Mk.flat("#5d8a48", 0.9), mTreeLo = Mk.flat("#4c7a3c", 0.9);

  // =================================================================================================== the ground
  const uvZ = (x: number, z: number): [number, number] => [(x - X0) / WK.w, -z / WK.w];
  const uvX = (x: number, z: number): [number, number] => [-z / WK.w + 0.5, x / WK.w];
  Mk.mesh("garden.gravel", levelQuad(X0, X1, Z0, Z1, 0, uvZ), mGravelZ, { cast: false });
  // the E-W walks (north, cross, south): their own rake lines along x, between the west and east walks
  for (const zc of [WK.north, WK.cross, WK.south]) Mk.mesh("garden.walkX", levelQuad(GDX + WK.west + WK.w / 2, GDX + WK.east - WK.w / 2, zc - WK.w / 2, zc + WK.w / 2, 0.0005, uvX), mGravelX, { cast: false });
  // the lawn beds, their box hedges and cones
  const mCone = Mk.tex(leafTex("#4a7838", "#3a6230", "#5e8c48", 100), 0.9);
  for (const [bx0, bx1, bz0, bz1] of S.beds) {
    const x0 = GDX + bx0, x1 = GDX + bx1, t = S.box.t, h = S.box.h;
    Mk.mesh("garden.lawn", levelQuad(x0, x1, bz0, bz1, 0.0009, (x, z) => [x / 2.0, -z / 2.0]), mLawn, { cast: false });
    const hedge = (cx: number, cz: number, lx: number, lz: number) => BT.add(mBox, tileUV(roundBox(lx, h, lz, 0.1, 2).translate(cx, h / 2 - 0.01, cz), 0.5));
    hedge((x0 + x1) / 2, bz0 + t / 2, x1 - x0, t); hedge((x0 + x1) / 2, bz1 - t / 2, x1 - x0, t);
    hedge(x0 + t / 2, (bz0 + bz1) / 2, t, bz1 - bz0 - 2 * t + 0.02); hedge(x1 - t / 2, (bz0 + bz1) / 2, t, bz1 - bz0 - 2 * t + 0.02);
    const cone = lathe([[0.0, 0], [S.cone.r * 0.6, 0.02], [S.cone.r, 0.18], [S.cone.r * 0.82, 0.45], [S.cone.r * 0.45, 0.8], [0.05, S.cone.h], [0, S.cone.h + 0.02]], 18);
    for (const [cx, cz] of [[x0 + t / 2, bz0 + t / 2], [x1 - t / 2, bz0 + t / 2], [x0 + t / 2, bz1 - t / 2], [x1 - t / 2, bz1 - t / 2]]) BT.add(mCone, cone.clone().translate(cx, h - 0.06, cz));
  }
  BT.flush(group, "garden.box");
  // the sundial
  {
    const P = new Part(K), x = GDX + S.sundial.x, z = S.sundial.z;
    P.add(mStonePlain, lathe([[0.22, 0], [0.22, 0.08], [0.14, 0.12], [0.1, 0.3], [0.13, 0.6], [0.09, 0.85], [0.16, 0.92], [0.18, 1.0], [0, 1.0]], 20).translate(x, 0, z), 0.006);
    P.add(mBronze, new THREE.CylinderGeometry(0.17, 0.17, 0.015, 24).translate(x, 1.008, z), 0.004);
    P.add(mBronze, new THREE.BufferGeometry().copy(new THREE.BoxGeometry(0.012, 0.1, 0.14)).translate(x, 1.06, z - 0.02), 0.003);
    P.into(group, "garden.sundial", { cast: true });
  }

  // =================================================================================================== the range (west)
  const rx = GDX + R.x, aR: [number, number] = [rx, Z1], bR: [number, number] = [rx, Z0];        // faces +x; u = Z1 - z
  const U = (z: number) => Z1 - z;
  const holes: (Hole & { kind: string })[] = [];
  holes.push({ kind: "door", u0: U(R.door.z) - R.door.w / 2, u1: U(R.door.z) + R.door.w / 2, y0: 0, y1: R.door.h, arch: R.door.arch });
  holes.push({ kind: "his", u0: U(R.his.z) - R.his.w / 2, u1: U(R.his.z) + R.his.w / 2, y0: R.his.y0, y1: R.his.y1 });
  for (const z of R.ground) holes.push({ kind: "g", u0: U(z) - R.gw / 2, u1: U(z) + R.gw / 2, y0: R.gy0, y1: R.gy1 });
  for (const z of R.first) holes.push({ kind: "f", u0: U(z) - R.gw / 2, u1: U(z) + R.gw / 2, y0: R.his.y0, y1: R.his.y1 });
  Mk.mesh("garden.range", holedWall(aR, bR, 0, R.h, holes, 0.96, 0.68), mBrick, { cast: true });
  // stone dressings: plinth, string course, parapet coping; a frame and a hood mould round every window and the door
  Mk.mesh("garden.range.plinth", tileUV(boxG(rx - 0.02, rx + 0.07, 0, 0.45, Z0, Z1), 0.6), mStone);
  Mk.mesh("garden.range.string", boxG(rx - 0.02, rx + 0.09, R.floor1 - 0.08, R.floor1 + 0.1, Z0, Z1), mStonePlain);
  Mk.mesh("garden.range.cope", boxG(rx - 0.25, rx + 0.1, R.h - 0.05, R.h + 0.18, Z0, Z1), mStonePlain);
  const glassFor: Record<string, THREE.MeshBasicMaterial[]> = { his: [], other: [] };
  const mGlassDay = leadedTex({ w: 1.2, h: 1.5, q: 0.11, glass: "#8fa2b6", hi: "#b6c6d4", lo: "#6c7e94", lead: "#3a3a44" });
  for (const h of holes) {
    const zc = Z1 - (h.u0 + h.u1) / 2, w = h.u1 - h.u0, fw = 0.12, fd = 0.08;
    if (h.kind === "door") {
      Mk.mesh("garden.range.doorframe", boxG(rx - 0.01, rx + fd, 0, h.y1 + fw, zc + w / 2, zc + w / 2 + fw), mStonePlain);
      Mk.mesh("garden.range.doorframe", boxG(rx - 0.01, rx + fd, 0, h.y1 + fw, zc - w / 2 - fw, zc - w / 2), mStonePlain);
      Mk.mesh("garden.range.doorframe", boxG(rx - 0.01, rx + fd, h.y1 - (h.arch ?? 0) * 0.3, h.y1 + fw, zc - w / 2 - fw, zc + w / 2 + fw), mStonePlain);
      for (const [k, nm] of ["jambL", "jambR", "head"].entries()) Mk.mesh(`garden.range.door.${nm}`, revealG(aR, bR, { ...h, arch: 0, y1: h.y1 - (h.arch ?? 0) }, 0.45, 1, [k]), mStonePlain, { cast: true });
      // the open doorway: the stair foot in the dim inside, a step of stone at the threshold
      Mk.mesh("garden.range.doorway", new THREE.PlaneGeometry(w, h.y1).rotateY(Math.PI / 2).translate(rx - 0.45, h.y1 / 2, zc), Mk.tex(stairFootTex(), 0.9), { cast: false });
      Mk.mesh("garden.range.step", boxG(rx - 0.05, rx + 0.32, 0, 0.1, zc - w / 2 - 0.1, zc + w / 2 + 0.1), mStonePlain);
      continue;
    }
    Mk.mesh("garden.range.frame", boxG(rx - 0.01, rx + fd, h.y0 - fw, h.y1 + fw, zc + w / 2, zc + w / 2 + fw), mStonePlain);
    Mk.mesh("garden.range.frame", boxG(rx - 0.01, rx + fd, h.y0 - fw, h.y1 + fw, zc - w / 2 - fw, zc - w / 2), mStonePlain);
    Mk.mesh("garden.range.frame", boxG(rx - 0.01, rx + fd + 0.03, h.y0 - fw, h.y0, zc - w / 2 - fw, zc + w / 2 + fw), mStonePlain);
    Mk.mesh("garden.range.hood", boxG(rx - 0.01, rx + fd + 0.06, h.y1, h.y1 + fw + 0.04, zc - w / 2 - fw - 0.08, zc + w / 2 + fw + 0.08), mStonePlain);
    Mk.mesh("garden.range.reveal", revealG(aR, bR, h, 0.22, 1), mStonePlain, { cast: true });
    const lights = h.kind === "his" ? R.his.lights : 2;
    const gm = new THREE.MeshBasicMaterial({ map: mGlassDay, fog: false, color: "#ffffff" });
    (h.kind === "his" ? glassFor.his : glassFor.other).push(gm);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h.y1 - h.y0).rotateY(Math.PI / 2).translate(rx - 0.2, (h.y0 + h.y1) / 2, zc), gm);
    glass.layers.set(NOINK); glass.name = "garden.range.glass." + h.kind; glass.castShadow = false; group.add(glass);
    for (let i = 1; i < lights; i++) { const z = zc + w / 2 - (w * i) / lights; Mk.mesh("garden.range.mullion", boxG(rx - 0.22, rx - 0.12, h.y0, h.y1, z - 0.04, z + 0.04), mStonePlain); }
  }
  // the roof behind the parapet and two chimney stacks
  Mk.mesh("garden.range.roof", quad4(new THREE.Vector3(rx - 0.2, R.h, Z1), new THREE.Vector3(rx - 0.2, R.h, Z0 - 2), new THREE.Vector3(rx - 4.5, R.h + 3.6, Z0 - 2), new THREE.Vector3(rx - 4.5, R.h + 3.6, Z1), (Z1 - Z0 + 2) / 2, 3), mTile, { cast: true });
  for (const z of [-7.0, 3.0]) Mk.mesh("garden.range.chimney", tileUV(boxG(rx - 2.9, rx - 2.1, R.h + 1.0, R.h + 5.0, z - 0.6, z + 0.6), 0.96, 0.68), mBrick);

  // =================================================================================================== the chapel (north)
  const cz = C.z, aC: [number, number] = [X0 - 3, cz], bC: [number, number] = [X1 + 4, cz];         // faces +z; u = x - (X0 - 3)
  const cHoles: Hole[] = C.windows.map(([x0, x1, y0, y1]) => ({ u0: GDX + x0 - aC[0], u1: GDX + x1 - aC[0], y0, y1, arch: (x1 - x0) * 0.62 }));
  Mk.mesh("garden.chapel", holedWall(aC, bC, 0, C.h, cHoles, 1.8, 1.28), mStone, { cast: true });
  for (const [i, h] of cHoles.entries()) {
    const [x0, x1, y0, y1] = C.windows[i], w = x1 - x0, rise = h.arch ?? 0;
    Mk.mesh("garden.chapel.reveal", revealG(aC, bC, { ...h, arch: 0, y1: y1 - rise }, 0.55, 1.2), mStoneLo, { cast: true });
    // the glass with its tracery, set back in the reveal: the arched outline as one shape
    const sh = new THREE.Shape(); const n = 14; sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w, y1 - y0 - rise);
    for (let k = 1; k <= n; k++) { const t = k / n; sh.lineTo(w - w * t, y1 - y0 - rise + rise * Math.sin(Math.PI * t) ** 0.6); }
    const g = new THREE.ShapeGeometry(sh, 2), p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) uv.setXY(k, p.getX(k) / w, p.getY(k) / (y1 - y0));
    g.translate(GDX + x0, y0, cz - 0.5);
    const mT = new THREE.MeshBasicMaterial({ map: traceryTex(w, y1 - y0, rise), fog: false });
    const m = Mk.mesh("garden.chapel.glass", g, mT, { cast: false, noink: true }); m.userData.day = true;
    glassFor.other.push(mT);
    // the head's reveal: a dark soffit card behind the arch (so the arch's opening is not see-through above the reveal)
    Mk.mesh("garden.chapel.head", new THREE.PlaneGeometry(w + 0.02, rise + 0.02).translate(GDX + x0 + w / 2, y1 - rise / 2, cz - 0.56), mStoneLo, { cast: false });
  }
  // buttresses with two set-offs, gabled tops and pinnacles; the plinth; battlements
  for (const bx of C.buttress.x) {
    const x = GDX + bx, w = C.buttress.w, d = C.buttress.d;
    Mk.mesh("garden.chapel.buttress", tileUV(boxG(x - w / 2, x + w / 2, 0, 6.5, cz - 0.05, cz + d), 0.6, 0.32), mStone);
    Mk.mesh("garden.chapel.buttress", tileUV(boxG(x - w / 2 + 0.06, x + w / 2 - 0.06, 6.5, 11.2, cz - 0.05, cz + d * 0.68), 0.6, 0.32), mStone);
    Mk.mesh("garden.chapel.buttress", tileUV(boxG(x - w / 2 + 0.12, x + w / 2 - 0.12, 11.2, C.h + 0.9, cz - 0.05, cz + d * 0.4), 0.6, 0.32), mStone);
    for (const [y, dd] of [[6.5, d], [11.2, d * 0.68]] as [number, number][]) Mk.mesh("garden.chapel.setoff", quad4(new THREE.Vector3(x - w / 2, y, cz + dd), new THREE.Vector3(x + w / 2, y, cz + dd), new THREE.Vector3(x + w / 2, y + 0.45, cz + dd * 0.66), new THREE.Vector3(x - w / 2, y + 0.45, cz + dd * 0.66)), mStonePlain);
    // the pinnacle: a square shaft and a tall pyramid
    const px = x, pz = cz + d * 0.2;
    Mk.mesh("garden.chapel.pinnacle", boxG(px - 0.28, px + 0.28, C.h + 0.9, C.h + 2.0, pz - 0.28, pz + 0.28), mStonePlain);
    Mk.mesh("garden.chapel.pinnacle", new THREE.ConeGeometry(0.34, 2.4, 4).rotateY(Math.PI / 4).translate(px, C.h + 3.2, pz), mStonePlain);
  }
  Mk.mesh("garden.chapel.plinth", tileUV(boxG(aC[0], bC[0], 0, 0.6, cz - 0.02, cz + 0.12), 0.6), mStoneLo);
  Mk.mesh("garden.chapel.parapet", tileUV(boxG(aC[0], bC[0], C.h - 0.3, C.h + 0.3, cz - 0.3, cz + 0.18), 0.6), mStonePlain);
  for (let x = aC[0] + 0.3; x < bC[0]; x += 1.25) Mk.mesh("garden.chapel.merlon", boxG(x, x + 0.62, C.h + 0.3, C.h + 0.95, cz - 0.3, cz + 0.16), mStonePlain);

  // =================================================================================================== the elaboratory (outside)
  const ex0 = GDX + E.x0, ex1 = GDX + E.x1, ez0 = E.z0, ez1 = E.z1, eb = E.eaveBack, ef = E.eaveFront, wt = 0.24;
  const eave = (z: number) => eb + ((ef - eb) * (z - ez0)) / (ez1 - ez0);
  const glowMats: THREE.MeshBasicMaterial[] = [];
  {
    // the front wall with the door and the window (faces +z)
    const aE: [number, number] = [ex0, ez1], bE: [number, number] = [ex1, ez1];
    const dH: Hole = { u0: E.door.x - E.door.w / 2 - E.x0, u1: E.door.x + E.door.w / 2 - E.x0, y0: 0, y1: E.door.h };
    const wH: Hole = { u0: E.win.x - E.win.w / 2 - E.x0, u1: E.win.x + E.win.w / 2 - E.x0, y0: E.win.y0, y1: E.win.y1 };
    Mk.mesh("garden.elab.front", holedWall(aE, bE, 0, ef, [dH, wH], 0.96, 0.68), mBrickE, { cast: true });
    for (const [k, nm] of ["jambL", "jambR", "head"].entries()) Mk.mesh(`garden.elab.door.${nm}`, revealG(aE, bE, dH, wt, 1, [k]), mBrickE, { cast: true });
    Mk.mesh("garden.elab.front.reveal", revealG(aE, bE, wH, wt, 1), mBrickE, { cast: true });
    Mk.mesh("garden.elab.lintel", boxG(GDX + E.door.x - E.door.w / 2 - 0.15, GDX + E.door.x + E.door.w / 2 + 0.15, E.door.h, E.door.h + 0.14, ez1 - 0.02, ez1 + 0.05), mStonePlain);
    // the two sides (sloping tops) and the back is the chapel's buttress line
    Mk.mesh("garden.elab.sideE", wallPoly([ex1, ez1], [ex1, ez0], [[0, 0], [ez1 - ez0, 0], [ez1 - ez0, eb], [0, ef]], 0, 0.96, 0.68), mBrickE, { cast: true });
    Mk.mesh("garden.elab.sideW", wallPoly([ex0, ez0], [ex0, ez1], [[0, 0], [ez1 - ez0, 0], [ez1 - ez0, ef], [0, eb]], 0, 0.96, 0.68), mBrickE, { cast: true });
    // the pent roof: one slab from the back (high) to the front (low), overhanging
    const o = 0.3, th = 0.08;
    Mk.mesh("garden.elab.roof", quad4(new THREE.Vector3(ex0 - o, eave(ez1 + o) + th, ez1 + o), new THREE.Vector3(ex1 + o, eave(ez1 + o) + th, ez1 + o), new THREE.Vector3(ex1 + o, eb + th, ez0 - 0.1), new THREE.Vector3(ex0 - o, eb + th, ez0 - 0.1), (ex1 - ex0 + 2 * o) / 1.2, 3.2), mTile, { cast: true });
    Mk.mesh("garden.elab.roofEdge", boxG(ex0 - o, ex1 + o, eave(ez1 + o), eave(ez1 + o) + th + 0.01, ez1 + o - 0.06, ez1 + o), Mk.flat("#6a4630", 0.8));
    // the chimney (against the west end, through the roof), its stone cap and its glowing mouth
    const ch = E.chimney, cx = GDX + ch.x;
    Mk.mesh("garden.elab.chimney", tileUV(boxG(cx - ch.w / 2, cx + ch.w / 2, 1.2, ch.top, ch.z - ch.w / 2, ch.z + ch.w / 2), 0.96, 0.68), mBrickE);
    Mk.mesh("garden.elab.chimneyCap", boxG(cx - ch.w / 2 - 0.06, cx + ch.w / 2 + 0.06, ch.top, ch.top + 0.1, ch.z - ch.w / 2 - 0.06, ch.z + ch.w / 2 + 0.06), mStonePlain);
    const mMouth = new THREE.MeshBasicMaterial({ color: "#000000", fog: false }); glowMats.push(mMouth);
    Mk.mesh("garden.elab.mouth", new THREE.PlaneGeometry(ch.w * 0.6, ch.w * 0.6).rotateX(-Math.PI / 2).translate(cx, ch.top + 0.102, ch.z), mMouth, { cast: false, receive: false, noink: true });
    // the door: plank leaf standing ajar (inward), the firelit inside behind it; the little window glowing
    const mInside = new THREE.MeshBasicMaterial({ map: fireInsideTex(), color: "#000000", fog: false }); glowMats.push(mInside);
    Mk.mesh("garden.elab.inside", new THREE.PlaneGeometry(E.door.w + 0.3, E.door.h + 0.2).translate(GDX + E.door.x, E.door.h / 2, ez1 - wt - 0.6), mInside, { cast: false, receive: false, noink: true });
    Mk.mesh("garden.elab.insideW", new THREE.PlaneGeometry(E.win.w + 0.2, E.win.y1 - E.win.y0 + 0.2).translate(GDX + E.win.x, (E.win.y0 + E.win.y1) / 2, ez1 - wt - 0.3), mInside, { cast: false, receive: false, noink: true });
    const leaf = new THREE.Mesh(boxG(0, E.door.w - 0.02, 0.01, E.door.h - 0.01, -0.025, 0.025), [Mk.flat("#5a4030", 0.8), Mk.flat("#5a4030", 0.8), Mk.flat("#5a4030", 0.8), Mk.flat("#5a4030", 0.8), Mk.tex(plankTex("#6e5038", 101), 0.85), Mk.tex(plankTex("#6e5038", 101), 0.85)]);
    leaf.position.set(GDX + E.door.x - E.door.w / 2 + 0.01, 0, ez1 - wt + 0.03); leaf.rotation.y = 0.55; leaf.name = "garden.elab.door"; leaf.castShadow = true; leaf.receiveShadow = true; group.add(leaf);
    const mWinGlass = new THREE.MeshBasicMaterial({ map: leadedTex({ w: E.win.w, h: E.win.y1 - E.win.y0, q: 0.1, glass: "#ffffff", hi: "#ffffff", lo: "#e0d0c0" }), color: "#6a6a74", fog: false, transparent: true, opacity: 0.85 });
    glowMats.push(mWinGlass);
    Mk.mesh("garden.elab.glass", new THREE.PlaneGeometry(E.win.w, E.win.y1 - E.win.y0).translate(GDX + E.win.x, (E.win.y0 + E.win.y1) / 2, ez1 - 0.12), mWinGlass, { cast: false, receive: false, noink: true });
  }
  // the chimney's glow sits IN its mouth: view() slides the card 0.5 m from the mouth toward the camera so the stack never
  // hides half of it
  const chimMouth = new THREE.Vector3(GDX + E.chimney.x, E.chimney.top + 0.2, E.chimney.z);
  const chimGlow = glowCard(0.62, "#ff8a3a", 0); chimGlow.position.copy(chimMouth); group.add(chimGlow);
  const doorGlow = glowCard(1.1, "#ff9a4a", 0); doorGlow.position.set(GDX + E.door.x, 1.0, ez1 + 0.05); group.add(doorGlow);

  // =================================================================================================== the garden walls (east, south) and beyond
  const wh = S.wall.h, cp = S.wall.cope;
  Mk.mesh("garden.wallE", tileUV(boxG(X1, X1 + 0.36, 0, wh, Z0, Z1 + 0.36), 0.96, 0.68), mBrick);
  Mk.mesh("garden.wallE.cope", boxG(X1 - 0.05, X1 + 0.41, wh, wh + cp, Z0, Z1 + 0.41), mStonePlain);
  Mk.mesh("garden.wallS", tileUV(boxG(X0, X1 + 0.36, 0, wh, Z1, Z1 + 0.36), 0.96, 0.68), mBrick);
  Mk.mesh("garden.wallS.cope", boxG(X0, X1 + 0.41, wh, wh + cp, Z1 - 0.05, Z1 + 0.41), mStonePlain);
  Mk.mesh("garden.gate", new THREE.PlaneGeometry(1.1, 2.1).rotateY(Math.PI).translate(GDX - 0.8, 1.05, Z1 - 0.005), Mk.tex(plankTex("#6a4c36", 102), 0.85), { cast: false });
  // trees beyond the east and south walls (chunky canopies on trunks)
  {
    const T = new Batch(), r = rng(103);
    const tree = (x: number, z: number, s: number) => {
      T.add(mBark, new THREE.CylinderGeometry(0.16 * s, 0.24 * s, 4.2 * s, 10).translate(x, 2.1 * s, z));
      for (let i = 0; i < 5; i++) T.add(i % 2 ? mTree : mTreeLo, rockG(400 + Math.round(x * 7 + z * 3) + i, 2.6 * s * (0.8 + 0.4 * r()), 2.0 * s * (0.8 + 0.4 * r()), 2.4 * s * (0.8 + 0.4 * r()), 2, 0).translate(x + (r() - 0.5) * 1.8 * s, 3.8 * s + 1.6 * s * r(), z + (r() - 0.5) * 1.8 * s));
    };
    for (const [x, z, s] of [[8.5, -11, 1.3], [9.5, -4, 1.5], [8.2, 2.5, 1.2], [10.5, 7.5, 1.4], [-2, 12, 1.3], [4, 12.5, 1.2], [9, 13, 1.5]] as [number, number, number][]) tree(GDX + x, z, s);
    T.flush(group, "garden.trees");
    Mk.mesh("garden.beyond", levelQuad(GDX - 40, GDX + 40, -60, 40, -0.02, (x, z) => [x / 4, -z / 4]), Mk.tex(lawnTex(), 0.95), { cast: false });
  }

  // =================================================================================================== skies
  const skyNoon = skyDome(new THREE.Vector3(GDX, 0, -4), SKY_NOON, (g, W, H) => {
    const r = rng(104), elY = (el: number) => ((90 - el) / 180) * H;
    for (let i = 0; i < 26; i++) { const x = W * r(), y = elY(10 + 30 * r()), s = W * (0.012 + 0.02 * r()); for (let k = 0; k < 5; k++) blotch(g, x + (k - 2) * s * 0.8, y + (r() - 0.5) * s * 0.4, s * (0.7 + 0.5 * r()), "#ffffff", 0.5); }
  });
  const skyNight = skyDome(new THREE.Vector3(GDX, 0, -4), SKY_NIGHT, (g, W, H) => {
    const r = rng(105), elY = (el: number) => ((90 - el) / 180) * H;
    for (let i = 0; i < 260; i++) { g.fillStyle = css("#e8eeff", 0.4 + 0.5 * r()); const s = 1 + 1.6 * r(); g.fillRect(W * r(), elY(8 + 80 * r()), s, s); }
    // the moon behind her right shoulder is not in the north sky: a soft moonlit haze low in the south-west instead
    const mx = W * 0.96, my = elY(34);
    for (const dx of [0, -W]) { const gr = g.createRadialGradient(mx + dx, my, 0, mx + dx, my, H * 0.12); gr.addColorStop(0, "rgba(230,236,255,0.95)"); gr.addColorStop(0.08, "rgba(230,236,255,0.9)"); gr.addColorStop(0.1, "rgba(200,212,250,0.35)"); gr.addColorStop(1, "rgba(160,180,240,0)"); g.fillStyle = gr; g.fillRect(mx + dx - H * 0.12, my - H * 0.12, H * 0.24, H * 0.24); }
  });
  skyNight.visible = false; group.add(skyNoon, skyNight);

  // =================================================================================================== the light
  const keyAt = new THREE.Vector3(GDX - 0.2, 0, -4);
  const Lr = lightRig(group, { dir: S.sun, k: 3.0, col: "#fff4e2", at: [keyAt.x, 0, keyAt.z], half: 15, hemi: ["#cfe0f0", "#a89a7c", 1.0], point: { col: "#ff9a48", k: 0, at: [GDX + E.door.x, 1.1, ez1 + 0.9], dist: 7 } });
  // every lit material with its base env strength and colour: at night the env drops and the colour goes to MOONLIGHT
  // BLUE (a multiply, so the bricks stay brick and the gravel stays gravel, only blue and a step darker: a mid-tone)
  const envMats: [THREE.MeshStandardMaterial, number, THREE.Color][] = [];
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const q of m ? (Array.isArray(m) ? m : [m]) : []) if ((q as THREE.MeshStandardMaterial).isMeshStandardMaterial && !envMats.some(([e]) => e === q)) envMats.push([q as THREE.MeshStandardMaterial, (q as THREE.MeshStandardMaterial).envMapIntensity, (q as THREE.MeshStandardMaterial).color.clone()]);
  });
  const NIGHT_TINT = new THREE.Color(0.5, 0.64, 1.0);
  let time: GardenTime = "noon", glow = 0, win = 0;
  const warm = new THREE.Color("#ffc870"), dark = new THREE.Color("#2a3252"), day = new THREE.Color("#ffffff"), nightGlass = new THREE.Color("#46557e");
  const applyTime = () => {
    const night = time === "night";
    const d = new THREE.Vector3(...(night ? S.moon : S.sun)).normalize();
    Lr.key.position.copy(keyAt).addScaledVector(d, 30); Lr.key.target.position.copy(keyAt); Lr.key.target.updateMatrixWorld();
    Lr.key.color.set(night ? "#a8bcf0" : "#fff4e2"); Lr.key.intensity = night ? 1.5 : 3.0;
    Lr.hemi.color.set(night ? "#7084c4" : "#cfe0f0"); Lr.hemi.groundColor.set(night ? "#323c66" : "#a89a7c"); Lr.hemi.intensity = night ? 1.5 : 1.0;
    skyNoon.visible = !night; skyNight.visible = night;
    for (const [m, e, c] of envMats) { m.envMapIntensity = e * (night ? 0.3 : 1); m.color.copy(c); if (night) m.color.multiply(NIGHT_TINT); }
    for (const m of glassFor.other) m.color.copy(night ? nightGlass : day);
    for (const m of glassFor.his) m.color.copy(night ? dark : day).lerp(warm, win);
  };
  applyTime();
  const hideable: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name === "garden.range") hideable.push([o, (p) => p.x < rx - 0.02]);
    if (o.name === "garden.chapel") hideable.push([o, (p) => p.z < cz - 0.02]);
    if (o.name === "garden.elab.front") hideable.push([o, (p) => p.z < ez1 - 0.02 && p.x > ex0 && p.x < ex1]);
  });
  return {
    group,
    view(cam: THREE.Vector3) {
      for (const [o, behind] of hideable) o.visible = !behind(cam);
      chimGlow.position.copy(cam).sub(chimMouth).normalize().multiplyScalar(0.5).add(chimMouth);
      chimGlow.lookAt(cam); doorGlow.lookAt(cam);
    },
    animate(t: number) {
      const k = glow * (1 + 0.08 * Math.sin(t * 6.3) + 0.05 * Math.sin(t * 11.1 + 0.7) + 0.03 * Math.sin(t * 17.3 + 1.9));
      Lr.point.intensity = 5.0 * k;
      for (const m of glowMats) m.color.setRGB(Math.min(1, 0.08 + k), Math.min(1, 0.06 + 0.72 * k), Math.min(1, 0.06 + 0.35 * k));
      chimGlow.material.opacity = 0.55 * k; doorGlow.material.opacity = 0.35 * k;
    },
    setParam(name: string, v: ParamValue) {
      if (name === "time") { time = v === "night" ? "night" : "noon"; applyTime(); }
      if (name === "glow") glow = Math.max(0, Math.min(1, Number(v)));
      if (name === "window") { win = Math.max(0, Math.min(1, Number(v))); applyTime(); }
    },
    cast(): Partial<CastLight> { return gardenCast(time); },
  };
}
void plasterTex;

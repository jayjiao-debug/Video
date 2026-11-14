// HIS ROOM (place "room", island x 200): Newton's study-bedroom at Trinity, ONE set lit four ways by the param `hour`
// (PLAN 1, 7B, C end, E, G end). WP2's set; the exports are the contract of sets/index.ts: ROOM_LOOK, ROOM_PARAMS,
// buildRoom(K) -> { group, view, animate, setParam, cast }; roomCast(hour) is the figure light per hour for a shot
// that wants it by hand. Every place-number is layout/room.ts ROOM_SET.
//
// WHAT THERE IS (the camera side is +z)
//   - oak panelling to 2.3 m (a cornice on top, a skirting below), a limewashed plaster frieze over it to the ceiling,
//     a plaster ceiling with a big oak summer beam, wide oak floor boards;
//   - THE WINDOW in the back wall, left: a stone cross window (mullion and transom), four leaded lights, five iron bars
//     inside the glass, a deep plaster reveal and an oak sill board; the glass is painted light (old crown glass) whose
//     colour is the hour's; a hidden caster in the glass throws the leading, the transom and THE BARS as shadow;
//   - THE WINDOW TABLE right under it (turned oak legs, a linen cloth): the day's clock (WP3's plate goes on it,
//     ROOM.plate); at noon the bars' short sharp shadows fall across its cloth;
//   - THE DESK to the right, BURIED IN PAPER: stacks of drafts, books shut and open, loose sheets; his writing place, the
//     drafts corner and the inkwell spot are left clear for WP3's props (ROOM.deskWrite, ROOM.drafts, ROOM.inkwell);
//   - a tall bookcase on the right wall, a stone fireplace further forward on the right (cold: it is May);
//   - THE DOOR to the stairs in the left wall (param door 0..1, opens inward), a dim landing behind it.
// THE HOURS (param hour): the sun's direction, colour and strength (the shadowed key through the window), the sky's
// colour in the glass, the shaft of light (and dust in the morning), the hemisphere fill, the materials' share of the
// environment fill, the night candle (the point light at ROOM.candle), and the figures' light (cast()):
//   morning  clean white, from the left, a long patch across the floor toward the desk
//   noon     hard and high: short sharp bar shadows across the table cloth
//   evening  low slanting gold from the right, across the table and the floor
//   night    the window dark blue, a faint cool moon; the candle on the window table lights the room orange
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css } from "../../../kit/sets/okit";
import { ROOM_SET as S, ROOM, RMX } from "../layout/room";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, ceilQuad, wallQuad, tileUV, lathe, Part } from "./parts/common";
import { NC, paperPile, holedWall, revealG, leadedWindow, doorLeaf, doorTex, panelTex, plasterTex, oakBoardsTex, sunShaft, dustMotes, pageTex, pageEdgeTex, spinesTex, ashlarTex } from "./parts/newton";

export type Hour = "morning" | "noon" | "evening" | "night";
export const HOURS: Hour[] = ["morning", "noon", "evening", "night"];
const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" };
const CAST0 = { grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.92, 1.0], shadeK: 0.4, wrap: [30, 60], edge: 0.14, bodySat: 0.13, lift: 0.03, contactLen: 0.15 };
/** THE FIGURES' LIGHT PER HOUR (laid over ROOM_LOOK.cast by the World through cast(); a shot may pass it by hand:
 *  w.setPlace("room", { light: roomCast("noon") })) */
export const ROOM_CAST: Record<Hour, Partial<CastLight>> = {
  morning: { key: [-0.55, 0.5, 0.45], tint: [1.0, 0.97, 0.93], tintK: 0.5, gain: 1.0, shade: [1.04, 0.95, 1.34], broad: 0.15, sheen: 0.1 },
  noon: { key: [-0.25, 0.85, 0.4], tint: [1.0, 0.98, 0.94], tintK: 0.6, gain: 1.0, shade: [1.04, 0.95, 1.3], broad: 0.1, sheen: 0.1 },
  evening: { key: [0.55, 0.3, 0.55], tint: [1.0, 0.8, 0.55], tintK: 0.8, gain: 0.96, shade: [1.08, 0.94, 1.25], broad: 0.25, sheen: 0.2 },
  night: { key: [-0.55, 0.2, 0.55], tint: [1.0, 0.7, 0.42], tintK: 0.85, gain: 0.88, shade: [1.0, 0.9, 1.65], broad: 0.35, sheen: 0.22 },
} as unknown as Record<Hour, Partial<CastLight>>;
export const roomCast = (hour: Hour): Partial<CastLight> => ROOM_CAST[hour] ?? ROOM_CAST.morning;

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.3, 0.25, 0.21]], [-10, [0.36, 0.31, 0.27]], [10, [0.46, 0.43, 0.41]], [90, [0.52, 0.52, 0.52]]],
  boxes: [{ az: -90, el: 30, rot: 0, w: 40, h: 30, soft: 16, col: [0.95, 0.93, 0.9] }],
};
/** the room's look (its figure light is the morning's; cast() lays each hour over it) */
export const ROOM_LOOK: PlaceLook = {
  bg: "#2e2824",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.8, color: "#2a201c" },
  cast: { ...CAST0, ...ROOM_CAST.morning, ...BAKED } as unknown as CastLight,
  fill: FILL,
  bloom: 0.35,
};
/** the per-frame dressing: hour "morning" | "noon" | "evening" | "night", door 0..1 (the door to the stairs, inward),
 *  shaftSoft 0..1 (added by WP5-B; 0 = the shaft as built, the default: 1 = the hour's sun shaft as a SOFT volume, the
 *  owner's lighting rule: no hard-edged wedge, its sides, its far end and its window end fading to nothing, half the
 *  opacity, swept down to the floor) */
export const ROOM_PARAMS: Record<string, ParamValue> = { hour: "morning", door: 0, shaftSoft: 0 };

/** the hours' set light: the sun (toward it), its colour and strength, the glass, the shaft, the hemisphere, the
 *  environment share, the candle */
type HourLight = { sun: [number, number, number]; col: string; k: number; glass: string; shaft: number; shaftCol: string; hemi: [string, string, number]; env: number; candle: number };
const HL: Record<Hour, HourLight> = {
  morning: { sun: [-0.62, 0.42, -0.66], col: "#fff3e4", k: 5.0, glass: "#f2f7fa", shaft: 0.055, shaftCol: "#fff8ee", hemi: ["#e6ebf0", "#8a7a6a", 0.85], env: 1.0, candle: 0 },
  noon: { sun: [0.12, 0.8, -0.58], col: "#fff9ee", k: 6.5, glass: "#fffaf0", shaft: 0.04, shaftCol: "#fffaf0", hemi: ["#f2eee6", "#8a7a66", 0.8], env: 1.0, candle: 0 },
  evening: { sun: [0.45, 0.22, -0.86], col: "#ffa040", k: 7.0, glass: "#ffc46a", shaft: 0.1, shaftCol: "#ffb060", hemi: ["#c89a74", "#5e3e2c", 0.6], env: 0.7, candle: 0 },
  night: { sun: [0.2, 0.55, -0.8], col: "#8ea0d8", k: 0.35, glass: "#2a3458", shaft: 0, shaftCol: "#8090c0", hemi: ["#4e5674", "#3a2a22", 0.32], env: 0.38, candle: 3.4 },
};

const W = S.walls, WI = S.window, T = S.table, D = S.desk, DR = S.door, B = S.books, FP = S.fire;
const X0 = RMX + W.x0, X1 = RMX + W.x1, Z0 = W.z0, Z1 = W.z1, YC = S.ceil, YP = S.panel;

// ---------------------------------------------------------------------------------------------------- paintings
/** the table's LINEN CLOTH: a soft weave, a faint fold grid, a darker hem */
const linenTex = () => paint(256, 256, (g, Wd, H) => {
  const r = rng(71);
  g.fillStyle = NC.linen; g.fillRect(0, 0, Wd, H);
  for (let i = 0; i < Wd; i += 3) { g.fillStyle = css(NC.linenLo, 0.12 + 0.08 * r()); g.fillRect(i, 0, 1, H); g.fillRect(0, i, Wd, 1); }
  g.strokeStyle = css(NC.linenLo, 0.5); g.lineWidth = 2; for (const f of [0.33, 0.66]) { g.beginPath(); g.moveTo(Wd * f, 0); g.lineTo(Wd * f, H); g.stroke(); g.beginPath(); g.moveTo(0, H * f); g.lineTo(Wd, H * f); g.stroke(); }
}, true);
/** a book's covers (leather) and its page block */
const leatherCols = ["#6e3426", "#5a3a26", "#7e5232", "#4a4630", "#62302a", "#3e4636"];

// ---------------------------------------------------------------------------------------------------- the builder
export function buildRoom(K: Kit) {
  const group = new THREE.Group(); group.name = "room";
  const Mk = maker(K, group);
  const mPanel = Mk.tex(panelTex({ seed: 72, cols: 2, rows: 3, tw: 1.2, th: YP, base: NC.oakWarm, lo: "#5a3c26", hi: "#b08860" }), 0.75);
  const mPlaster = Mk.tex(plasterTex(73), 0.95), mCeil = Mk.tex(plasterTex(74, "#e6dac2", "#cbbb9c"), 0.95);
  const mBoards = Mk.tex(oakBoardsTex({ seed: 75, n: 3, base: "#8a6040", lo: "#5e3e28" }), 0.75);
  const mOak = Mk.flat(NC.oak, 0.6), mOakDark = Mk.flat(NC.oakDark, 0.6), mBeam = Mk.flat("#6a4630", 0.7), mIron = Mk.flat(NC.iron, 0.5);
  const mStone = Mk.tex(ashlarTex({ seed: 76, nx: 2, ny: 3, bw: 0.4, bh: 0.3 }), 0.9), mHearth = Mk.flat("#3a302c", 0.95);

  // =================================================================================================== floor, ceiling
  Mk.mesh("room.floor", levelQuad(X0, X1, Z0, Z1, 0, (x, z) => [x / 0.75, -z / 1.5]), mBoards, { cast: false });
  Mk.mesh("room.ceiling", ceilQuad(X0, X1, Z0, Z1, YC, (x, z) => [x / 1.2, z / 1.2]), mCeil, { cast: true });
  Mk.mesh("room.beam", tileUV(boxG(X0, X1, YC - 0.26, YC + 0.01, -0.45, -0.17), 0.6), mBeam);
  for (const z of [-1.6, 0.9]) Mk.mesh("room.joist", tileUV(boxG(X0, X1, YC - 0.12, YC + 0.01, z - 0.07, z + 0.07), 0.6), mBeam);

  // =================================================================================================== walls
  const aB: [number, number] = [X0, Z0], bB: [number, number] = [X1, Z0];                 // back (faces +z)
  const aL: [number, number] = [X0, Z1], bL: [number, number] = [X0, Z0];                 // left (faces +x)
  const aR: [number, number] = [X1, Z0], bR: [number, number] = [X1, Z1];                 // right (faces -x)
  const aF: [number, number] = [X1, Z1], bF: [number, number] = [X0, Z1];                 // front (faces -z)
  const wHole = { u0: WI.x0 - W.x0, u1: WI.x1 - W.x0, y0: WI.y0, y1: WI.y1 };
  const dHole = { u0: Z1 - DR.z1, u1: Z1 - DR.z0, y0: 0, y1: DR.h };
  const fop0 = FP.z0 + 0.18, fop1 = FP.z1 - 0.18, fHole = { u0: fop0 - Z0, u1: fop1 - Z0, y0: 0, y1: FP.h - 0.22 };
  const panels: [string, [number, number], [number, number], { u0: number; u1: number; y0: number; y1: number }[]][] = [
    ["room.wall.back", aB, bB, [wHole]], ["room.wall.left", aL, bL, [dHole]], ["room.wall.right", aR, bR, [fHole]], ["room.wall.front", aF, bF, []],
  ];
  for (const [name, a, b, holes] of panels) {
    Mk.mesh(name, holedWall(a, b, 0, YP, holes, 1.2, YP), mPanel, { cast: true });
    Mk.mesh(name + ".frieze", wallQuad(a, b, YP, YC + 0.01, { tileU: 1.2, vTile: 1.2 }), mPlaster, { cast: true });
  }
  // cornice and skirting (chunky boards; they make the panelling read as joinery)
  {
    const cz = 0.06, sk = 0.035;
    Mk.mesh("room.cornice", boxG(X0, X1, YP - 0.02, YP + 0.08, Z0, Z0 + cz), mOakDark);
    Mk.mesh("room.cornice", boxG(X0, X1, YP - 0.02, YP + 0.08, Z1 - cz, Z1), mOakDark);
    Mk.mesh("room.cornice", boxG(X0, X0 + cz, YP - 0.02, YP + 0.08, Z0, Z1), mOakDark);
    Mk.mesh("room.cornice", boxG(X1 - cz, X1, YP - 0.02, YP + 0.08, Z0, Z1), mOakDark);
    Mk.mesh("room.skirting", boxG(X0, X1, 0, 0.14, Z0, Z0 + sk), mOakDark);
    Mk.mesh("room.skirting", boxG(X1 - sk, X1, 0, 0.14, Z0, Z1), mOakDark);
    Mk.mesh("room.skirting", boxG(X0, X0 + sk, 0, 0.14, Z0, DR.z0 - 0.12), mOakDark);
    Mk.mesh("room.skirting", boxG(X0, X0 + sk, 0, 0.14, DR.z1 + 0.12, Z1), mOakDark);
  }
  // the window's reveal (plaster) and its oak sill board; the door's oak lining and architrave
  Mk.mesh("room.window.reveal", revealG(aB, bB, wHole, WI.wall, 1.2), mPlaster, { cast: true });
  Mk.mesh("room.window.sill", boxG(RMX + WI.x0 - 0.06, RMX + WI.x1 + 0.06, WI.y0 - 0.02, WI.y0 + 0.035, Z0 - WI.inset, Z0 + 0.07), mOak);
  for (const [k, nm] of ["jambL", "jambR", "head"].entries()) Mk.mesh(`room.door.${nm}`, revealG(aL, bL, dHole, DR.wall, 1, [k]), mOak, { cast: true });
  {
    const aw = 0.12, ad = 0.05;
    Mk.mesh("room.architrave", boxG(X0 - 0.005, X0 + ad, 0, DR.h + aw, DR.z0 - aw, DR.z0), mOakDark);
    Mk.mesh("room.architrave", boxG(X0 - 0.005, X0 + ad, 0, DR.h + aw, DR.z1, DR.z1 + aw), mOakDark);
    Mk.mesh("room.architrave", boxG(X0 - 0.005, X0 + ad, DR.h, DR.h + aw, DR.z0 - aw, DR.z1 + aw), mOakDark);
  }

  // =================================================================================================== the window
  const mGlass = new THREE.MeshBasicMaterial({ color: HL.morning.glass, fog: false });
  const win = leadedWindow(K, { a: aB, b: bB, hole: wHole, inset: WI.inset, mats: { glass: mGlass, frame: Mk.flat(NC.stone, 0.85), bar: mIron }, lights: WI.lights, transom: WI.transom, bars: WI.bars, barR: 0.013, q: 0.12, name: "room.window", glassMat: mGlass, mullionW: 0.08 });
  group.add(win.group);
  const gz = Z0 - WI.inset + 0.02, corners = [new THREE.Vector3(RMX + WI.x0, WI.y0, gz), new THREE.Vector3(RMX + WI.x1, WI.y0, gz), new THREE.Vector3(RMX + WI.x1, WI.y1, gz), new THREE.Vector3(RMX + WI.x0, WI.y1, gz)];
  const shafts = {} as Record<Hour, THREE.Mesh>;
  for (const h of ["morning", "noon", "evening"] as Hour[]) {
    const dir = new THREE.Vector3(...HL[h].sun).normalize().negate();
    shafts[h] = sunShaft(corners, dir, h === "noon" ? 1.9 : 3.2, HL[h].shaftCol, HL[h].shaft); shafts[h].name = "room.shaft." + h; group.add(shafts[h]);
  }
  // (WP5-B, param shaftSoft) THE SOFT SHAFT of each hour: the same window swept down to the floor, its texture fading
  // to nothing on all four edges of every face (the box's long edges, where two faces meet, are both faded: no hard
  // silhouette) and well before the floor (no cut line where it lands); crossfaded with the built shaft by shaftSoft
  const softTex = paint(64, 256, (g, W, H) => {
    const img = g.createImageData(W, H), sm = (a: number, b: number, x: number) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    for (let py = 0; py < H; py++) {
      const v = 1 - py / (H - 1), pv = sm(0.12, 0.55, v) * (1 - 0.45 * sm(0.75, 1, v));
      for (let px = 0; px < W; px++) {
        const u = px / (W - 1), a = pv * sm(0, 0.4, u) * sm(0, 0.4, 1 - u), i = 4 * (py * W + px);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(255 * a);
      }
    }
    g.putImageData(img, 0, 0);
  });
  const softShafts = {} as Record<Hour, THREE.Mesh>;
  for (const h of ["morning", "noon", "evening"] as Hour[]) {
    const dir = new THREE.Vector3(...HL[h].sun).normalize().negate();
    softShafts[h] = sunShaft(corners, dir, h === "noon" ? 1.9 : 3.2, HL[h].shaftCol, HL[h].shaft * 0.5, 0); softShafts[h].name = "room.shaft.soft." + h;
    const sm = softShafts[h].material as THREE.MeshBasicMaterial; sm.map = softTex; sm.needsUpdate = true;
    softShafts[h].visible = false; group.add(softShafts[h]);
  }
  let shaftSoft = 0;
  const showShafts = () => {
    for (const k of Object.keys(shafts) as Hour[]) {
      const on = k === hour;
      shafts[k].visible = on && shaftSoft < 1; (shafts[k].material as THREE.MeshBasicMaterial).opacity = HL[k].shaft * (1 - shaftSoft);
      softShafts[k].visible = on && shaftSoft > 0; (softShafts[k].material as THREE.MeshBasicMaterial).opacity = HL[k].shaft * 0.5 * shaftSoft;
    }
  };
  const dust = dustMotes(30, corners, new THREE.Vector3(...HL.morning.sun).normalize().negate(), 2.6, { size: 0.01, seed: 77 }); group.add(dust.points);

  // =================================================================================================== the window table
  {
    const P = new Part(K), mCloth = Mk.tex(linenTex(), 0.95), x = RMX + T.x, z = T.z, top = T.top;
    const leg = lathe([[0.022, 0], [0.026, 0.05], [0.02, 0.12], [0.032, 0.2], [0.02, 0.3], [0.026, 0.45], [0.022, 0.58], [0.028, top - 0.06]], 14);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(mOak, leg.clone().translate(x + sx * (T.w / 2 - 0.06), 0, z + sz * (T.d / 2 - 0.06)), 0.004);
    P.add(mOak, boxG(x - T.w / 2 + 0.06, x + T.w / 2 - 0.06, 0.1, 0.14, z - 0.02, z + 0.02), 0.004);       // the stretcher
    // the cloth: one shell over the top, hanging `drop` at the front and the sides (the back is against the wall)
    P.shell([[mCloth, boxG(x - T.w / 2 - 0.02, x + T.w / 2 + 0.02, top - T.drop, top + T.cloth, z - T.d / 2 - 0.005, z + T.d / 2 + 0.02)]], 0.005);
    P.into(group, "room.windowTable", { cast: true });
  }

  // =================================================================================================== the desk, buried in paper
  {
    const x = RMX + D.x, z = D.z, top = D.top, P = new Part(K);
    // the desk itself: a heavy oak top, a frieze with a drawer, turned legs, stretchers
    Mk.mesh("room.desk.top", boxG(x - D.w / 2, x + D.w / 2, top - 0.045, top, z - D.d / 2, z + D.d / 2), mOak);
    Mk.mesh("room.desk.frieze", boxG(x - D.w / 2 + 0.05, x + D.w / 2 - 0.05, top - 0.17, top - 0.045, z - D.d / 2 + 0.05, z + D.d / 2 - 0.05), mOakDark);
    const leg = lathe([[0.034, 0], [0.04, 0.06], [0.03, 0.16], [0.046, 0.28], [0.03, 0.42], [0.04, 0.52], [0.036, top - 0.17]], 14);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(mOakDark, leg.clone().translate(x + sx * (D.w / 2 - 0.09), 0, z + sz * (D.d / 2 - 0.09)), 0.005);
    P.add(mOakDark, boxG(x - D.w / 2 + 0.09, x + D.w / 2 - 0.09, 0.09, 0.14, z - 0.025, z + 0.025), 0.005);
    P.add(mIron, new THREE.SphereGeometry(0.018, 10, 8).translate(x, top - 0.11, z + D.d / 2 - 0.035), 0.003);     // the drawer knob
    P.into(group, "room.desk.legs", { cast: true });
    // the paper: stacks (page-edge sides, a written top sheet), books shut and open, loose sheets; the writing place,
    // the drafts corner and the inkwell spot stay clear
    const Q = new Part(K), r = rng(78);
    const mEdge = Mk.tex(pageEdgeTex(79), 0.9);
    const PM = { edges: [mEdge, Mk.tex(pageEdgeTex(87, "#e9d9b4"), 0.9), Mk.tex(pageEdgeTex(88, "#f2e8cf"), 0.9)], tops: [Mk.tex(pageTex(80, { figure: true }), 0.9), Mk.tex(pageTex(81), 0.9), Mk.tex(pageTex(82, { lines: 26 }), 0.9), Mk.tex(pageTex(83, { figure: true, lines: 18 }), 0.9)] };
    const clear = [ROOM.deskWrite, ROOM.drafts, ROOM.inkwell].map((p) => [p.x, p.z, 0.2] as [number, number, number]);
    clear[0][2] = 0.24;
    const free = (px: number, pz: number, rad: number) => clear.every(([cx, cz, cr]) => Math.hypot(px - cx, pz - cz) > cr + rad);
    // piles all round the clear places: tall ones at the back and the ends, low ones in front; some carry a loose sheet
    const spots: [number, number, number][] = [
      [-0.6, -0.27, 0.22], [-0.38, -0.3, 0.13], [0.34, -0.28, 0.17], [0.6, -0.25, 0.27], [0.12, -0.3, 0.07],
      [-0.62, 0.04, 0.12], [-0.58, 0.28, 0.07], [-0.32, 0.25, 0.05], [0.06, 0.28, 0.035], [0.62, -0.02, 0.1], [0.3, 0.08, 0.02],
    ];
    let i = 0;
    for (const [dx, dz, h] of spots) {
      const px = x + dx, pz = z + dz;
      if (!free(px, pz, 0.12)) continue;
      const yTop = paperPile(Q, PM, px, top, pz, h, 300 + i++, { yaw: (r() - 0.5) * 0.4, loose: r() < 0.45 });
      void yTop;
    }
    // loose sheets skewed over the desk's free front edge (one hangs over it)
    for (const [dx, dz, yaw] of [[-0.18, 0.3, 0.9], [0.38, 0.33, -0.35]] as [number, number, number][]) {
      const g = boxG(-0.115, 0.115, 0, 0.003, -0.15, 0.15).rotateY(yaw).translate(x + dx, top, z + dz);
      Q.shell([[PM.edges[0], g], [PM.tops[1], new THREE.PlaneGeometry(0.226, 0.296).rotateX(-Math.PI / 2).rotateY(yaw).translate(x + dx, top + 0.0045, z + dz)]], 0.003);
    }
    // books: three shut ones stacked on the left pile, one big open one at the back right (the shut ones stay off the
    // writing place and the drafts corner: ROOM.deskWrite / ROOM.drafts, where WP3's sheets and drafts go)
    const book = (px: number, pz: number, y0: number, w: number, d: number, h: number, yaw: number, col: string) => {
      const mL = Mk.flat(col, 0.7);
      Q.shell([[mL, boxG(-w / 2, w / 2, 0, h, -d / 2, d / 2).rotateY(yaw).translate(px, y0, pz)], [mEdge, boxG(-w / 2 + 0.008, w / 2 + 0.002, 0.006, h - 0.006, -d / 2 + 0.008, d / 2 - 0.008).rotateY(yaw).translate(px, y0, pz)]], 0.004);
    };
    book(x - 0.62, z - 0.02, top + 0.1, 0.2, 0.27, 0.05, 0.3, leatherCols[0]);
    book(x - 0.61, z - 0.03, top + 0.15, 0.24, 0.17, 0.045, 1.45, leatherCols[3]);
    book(x - 0.62, z - 0.01, top + 0.195, 0.19, 0.26, 0.05, 0.12, leatherCols[2]);
    // the open book (two page fans on a leather board)
    {
      const px = x + 0.2, pz = z - 0.32, yaw = 0.1, mL = Mk.flat(leatherCols[1], 0.7), mP = Mk.tex(pageTex(84, { lines: 20 }), 0.9);
      Q.add(mL, boxG(-0.2, 0.2, 0, 0.012, -0.13, 0.13).rotateY(yaw).translate(px, top, pz), 0.004);
      for (const s of [-1, 1]) Q.shell([[mEdge, boxG(s > 0 ? 0.005 : -0.185, s > 0 ? 0.185 : -0.005, 0.012, 0.035, -0.12, 0.12).rotateY(yaw).translate(px, top, pz)], [mP, new THREE.PlaneGeometry(0.175, 0.235).rotateX(-Math.PI / 2).translate(s * 0.095, 0.0365, 0).rotateY(yaw).translate(px, top, pz)]], 0.004);
    }
    Q.into(group, "room.desk.paper", { cast: true });
    // loose sheets on the floor by the desk (a couple fallen)
    const mLoose = Mk.tex(pageTex(85), 0.9);
    for (const [dx, dz, yaw] of [[-0.95, 0.35, 0.4], [0.95, 0.5, -0.7]] as [number, number, number][]) Mk.mesh("room.sheet", new THREE.PlaneGeometry(0.22, 0.29).rotateX(-Math.PI / 2).rotateY(yaw).translate(x + dx, 0.0008, z + dz), mLoose, { cast: false, noink: true });
  }

  // =================================================================================================== bookcase and fireplace (right wall)
  {
    const xb = X1 - B.d, mSp = Mk.tex(spinesTex(86, B.z1 - B.z0, 0.36), 0.8);
    Mk.mesh("room.books.side", boxG(xb, X1, 0, B.h, B.z0 - 0.04, B.z0), mOakDark);
    Mk.mesh("room.books.side", boxG(xb, X1, 0, B.h, B.z1, B.z1 + 0.04), mOakDark);
    Mk.mesh("room.books.top", boxG(xb - 0.03, X1, B.h, B.h + 0.06, B.z0 - 0.07, B.z1 + 0.07), mOakDark);
    Mk.mesh("room.books.plinth", boxG(xb, X1, 0, 0.1, B.z0, B.z1), mOakDark);
    for (const y of B.shelves) {
      Mk.mesh("room.books.shelf", boxG(xb, X1, y - 0.03, y, B.z0, B.z1), mOak);
      // the spines: a painted row standing a little in from the shelf's front
      if (y < B.h - 0.1) Mk.mesh("room.books.spines", new THREE.PlaneGeometry(B.z1 - B.z0, 0.34).rotateY(-Math.PI / 2).translate(xb + 0.05, y + 0.17, (B.z0 + B.z1) / 2), mSp, { cast: false });
    }
    Mk.mesh("room.books.spines", new THREE.PlaneGeometry(B.z1 - B.z0, 0.3).rotateY(-Math.PI / 2).translate(xb + 0.05, 0.1 + 0.15, (B.z0 + B.z1) / 2), mSp, { cast: false });
    // the fireplace: a stone surround with a lintel and a dark hearth opening, a stone hearth slab
    const xf = X1, fz0 = FP.z0, fz1 = FP.z1, op0 = fop0, op1 = fop1;
    Mk.mesh("room.fire.jamb", tileUV(boxG(xf - 0.16, xf + 0.01, 0, FP.h, fz0, op0), 0.6), mStone);
    Mk.mesh("room.fire.jamb", tileUV(boxG(xf - 0.16, xf + 0.01, 0, FP.h, op1, fz1), 0.6), mStone);
    Mk.mesh("room.fire.lintel", tileUV(boxG(xf - 0.16, xf + 0.01, FP.h - 0.22, FP.h + 0.04, fz0, fz1), 0.6), mStone);
    Mk.mesh("room.fire.shelf", boxG(xf - 0.24, xf + 0.01, FP.h + 0.04, FP.h + 0.1, fz0 - 0.06, fz1 + 0.06), mOakDark);
    Mk.mesh("room.fire.back", wallQuad([xf + 0.3, op0], [xf + 0.3, op1], 0, FP.h - 0.22, { tileU: 1 }), mHearth, { cast: false });
    Mk.mesh("room.fire.sideA", wallQuad([xf, op0], [xf + 0.3, op0], 0, FP.h - 0.22, { tileU: 1 }), mHearth, { cast: false });
    Mk.mesh("room.fire.sideB", wallQuad([xf + 0.3, op1], [xf, op1], 0, FP.h - 0.22, { tileU: 1 }), mHearth, { cast: false });
    Mk.mesh("room.fire.top", ceilQuad(xf, xf + 0.3, op0, op1, FP.h - 0.22), mHearth, { cast: false });
    Mk.mesh("room.fire.hearth", boxG(xf - 0.42, xf + 0.3, 0, 0.03, fz0 - 0.05, fz1 + 0.05), mStone);
  }

  // =================================================================================================== the door and the landing behind it
  const dTex = doorTex({ w: DR.z1 - DR.z0, h: DR.h, base: NC.oakDark, lo: "#3a281c", hi: "#8a6444" });
  const leaf = doorLeaf(K, { w: DR.z1 - DR.z0, h: DR.h, t: DR.t, face: Mk.tex(dTex, 0.6), back: Mk.tex(dTex, 0.65), edge: mOakDark, iron: mIron, name: "room.door", gap: 0.015 });
  leaf.position.copy(ROOM.hinge); leaf.rotation.y = -Math.PI / 2; group.add(leaf);
  {
    const lx = X0 - DR.wall, lz0 = DR.z0 - 0.9, lz1 = DR.z1 + 0.9;
    const mDim = Mk.tex(plasterTex(89, "#a8977c", "#8e7e66"), 0.95);
    Mk.mesh("room.landing.floor", levelQuad(lx - 1.6, X0, lz0, lz1, 0, (x, z) => [x / 0.6, -z / 1.2]), mBoards, { cast: false });
    Mk.mesh("room.landing.rail", boxG(lx - 1.55, lx - 1.49, 0.84, 0.9, lz0, lz1), mOakDark);
    Mk.mesh("room.landing.wall", wallQuad([lx - 1.6, lz1], [lx - 1.6, lz0], 0, YC, { tileU: 1.2, vTile: 1.2 }), mDim, { cast: false });
    Mk.mesh("room.landing.wallB", wallQuad([lx - 1.6, lz0], [X0, lz0], 0, YC, { tileU: 1.2, vTile: 1.2 }), mDim, { cast: false });
    Mk.mesh("room.landing.wallF", wallQuad([X0, lz1], [lx - 1.6, lz1], 0, YC, { tileU: 1.2, vTile: 1.2 }), mDim, { cast: false });
  }

  // =================================================================================================== the light
  const Lr = lightRig(group, { dir: HL.morning.sun, k: HL.morning.k, col: HL.morning.col, at: [RMX - 0.2, 0, -0.9], half: 3.8, hemi: HL.morning.hemi, point: { col: "#ffa244", k: 0, at: [RMX + S.candle.x, S.table.top + 0.32, S.candle.z + 0.12], dist: 5.5 } });
  Lr.key.shadow.bias = -0.0004;
  const keyAt = new THREE.Vector3(RMX - 0.2, 0, -0.9);
  // the share of the environment fill per hour: every material of the room keeps its own base value
  const envMats: [THREE.MeshStandardMaterial, number][] = [];
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const q of m ? (Array.isArray(m) ? m : [m]) : []) if ((q as THREE.MeshStandardMaterial).isMeshStandardMaterial && !envMats.some(([e]) => e === q)) envMats.push([q as THREE.MeshStandardMaterial, (q as THREE.MeshStandardMaterial).envMapIntensity]);
  });

  const hideable: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name.startsWith("room.wall.left")) hideable.push([o, (p) => p.x < X0 - 0.02]);
    if (o.name.startsWith("room.wall.right")) hideable.push([o, (p) => p.x > X1 + 0.02]);
    if (o.name.startsWith("room.wall.back")) hideable.push([o, (p) => p.z < Z0 - 0.02]);
    if (o.name.startsWith("room.wall.front")) hideable.push([o, (p) => p.z > Z1 + 0.02]);
  });
  let hour: Hour = "morning";
  const applyHour = (h: Hour) => {
    const L = HL[h];
    hour = h;
    const d = new THREE.Vector3(...L.sun).normalize();
    Lr.key.position.copy(keyAt).addScaledVector(d, 30); Lr.key.target.position.copy(keyAt); Lr.key.target.updateMatrixWorld();
    Lr.key.color.set(L.col); Lr.key.intensity = L.k;
    Lr.hemi.color.set(L.hemi[0]); Lr.hemi.groundColor.set(L.hemi[1]); Lr.hemi.intensity = L.hemi[2];
    Lr.point.intensity = L.candle;
    mGlass.color.set(L.glass);
    showShafts();
    for (const [m, e] of envMats) m.envMapIntensity = e * L.env;
  };
  applyHour("morning");
  return {
    group,
    view(cam: THREE.Vector3) { for (const [o, behind] of hideable) o.visible = !behind(cam); },
    animate(t: number) {
      dust.update(t, hour === "morning" ? 1 : hour === "evening" ? 0.6 : 0);
      if (hour === "night") Lr.point.intensity = HL.night.candle * (1 + 0.05 * Math.sin(t * 7.7) + 0.03 * Math.sin(t * 13.1 + 0.8));
    },
    setParam(name: string, v: ParamValue) {
      if (name === "hour") { const h = (HOURS as string[]).includes(String(v)) ? (v as Hour) : "morning"; applyHour(h); }
      if (name === "door") leaf.rotation.y = -Math.PI / 2 + Math.max(0, Math.min(1, Number(v))) * DR.swing;
      if (name === "shaftSoft") { shaftSoft = Math.max(0, Math.min(1, Number(v))); showShafts(); }
    },
    cast(): Partial<CastLight> { return roomCast(hour); },
  };
}

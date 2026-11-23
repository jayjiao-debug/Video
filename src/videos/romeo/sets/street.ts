// THE STREET (place "street", island x = ISLAND.street): scene 5, Monday dusk, the film's turn (the music stops here);
// and scene 7's match cut on the boarded window (light "day"). Set builder C. Marks and cameras: places.ts STAGE.street.
//
// WHAT THERE IS (the camera "back" looks down the street toward -z, at Romeo's back)
//   - a straight street 4.6 m wide (house fronts at x -2.3 and +2.3), paved in big warm pink-grey flags with a gutter of
//     small setts down the middle; it runs to z -15.2 and opens into a little piazza with a well (vera da pozzo);
//   - plain Verona houses of warm stucco (ochre, rose, cream, peach) with painted louvered shutters, stone surrounds,
//     string courses, cornices, a patch of bare brick here and there, deep tiled eaves on chunky fascias; two balconies;
//   - ON THE LEFT, between the second and third house, THE ALLEY he runs off into (z -2.9 .. -4.1), under an arch
//     carrying a room over it (a sottoportico), closed 6 m in by another house;
//   - ON THE RIGHT, house F with the GROUND-FLOOR WINDOW at z -0.2 (sill 0.90, head 1.75, 0.5 wide, 0.34 deep): an
//     open window with a stone sill (inside, a letter may stand on the sill), PLANKS nailed across it one by one
//     (param "boards" 0..1, from the top down: the last plank covers the sill);
//   - laundry on a line high across the street (it sways), lit windows at dusk, the far side of the piazza as a painted
//     card with a plain civic tower, the low sun sitting in the gap of the skyline.
// THE LIGHT (param "light"): "dusk" = a low orange sun straight down the street from the far end (the left fronts
//   catch it at a graze, the right fronts stand in a cool violet shade; the houses on the right do not cast, so the
//   street keeps its warm floor and Romeo his long shadow toward the camera), a peach-to-violet sky; "day" = an
//   ordinary daylight from high over the camera's left (scene 7's window, straight on).
//   - (v5, the owner on the v4 cut: "Make this background more complete and high quality") THE STREET IS LIVED IN: door
//     steps, two real doorways, a baker's and a cobbler's sign on iron arms, lanterns lit at dusk, a bench, barrels,
//     sacks and crates at the wall feet, a loaded handcart, a shop's awning over a table of baskets, pots, rain pipes,
//     a ladder; THE PIAZZA has two market stalls, barrels, a bucket on the well, and A FAR SIDE OF ITS OWN: two houses
//     and between them a low arcaded loggia with a tiled roof (lit from inside), the tower and the sun over it.
//     All of it stands at the wall feet or beyond the street's mouth: the stones where they fight are bare.
// Nothing red in the set. No blood. (v5: the duel is played here and Tybalt lies on these stones, shots/segE; the red
// cap is gone.) Seeded painting; animate is a pure function of t.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig, paint, rng, css, mix, toHex, blotch, skyDome, farCard, glowCard, makeBanner, NOINK, type SkyStops } from "../../../kit/sets/okit";
import { maker, quad4 } from "../../newton/sets/parts/common";
import { ISLAND } from "../places";
import { Batch, boxG, house, houseAt, onHouse, frontTex, upperWins, tilesTex, raftersTex, balustradeTex, pavingTex, softCard, type FrontPal, type Win } from "./parts/c_town";
import { gridLines, patchG, metrePaint } from "./parts/ground";
import { dresser, VERONA_DRESS } from "./parts/d_dress";
import { archWallG } from "./parts/b_common";

const X0 = ISLAND.street;
/** the street's numbers (local to the island) */
export const STREET_SET = {
  fxL: -2.3, fxR: 2.3, end: -15.2,
  alley: { z0: -2.9, z1: -4.1, archTop: 2.75, spring: 2.2, deep: 1.2 },
  /** the boardable window: in house F's front (x = fxR, facing -x), centre z, sill and head heights, width, depth */
  win: { z: -0.2, y0: 0.9, y1: 1.75, w: 0.5, deep: 0.34, planks: 5 },
  well: [1.9, -21] as [number, number],
  sun: { az: 0.06, el: 0.105 },
};
const S = STREET_SET;

// ---------------------------------------------------------------------------------------------------- the light
const DUSK = { dir: [0.33, 0.17, -1] as [number, number, number], col: "#ffa860", k: 4.2, hemi: ["#b890b8", "#a07062", 1.15] as [string, string, number] };
const DAY = { dir: [-0.42, 0.82, 0.4] as [number, number, number], col: "#fff1da", k: 2.7, hemi: ["#e2e4e6", "#a8957c", 1.05] as [string, string, number] };
const CAST_DUSK = {
  key: [0.55, 0.32, -0.77], tint: [1.0, 0.8, 0.6], tintK: 0.85, gain: 0.95, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.9, 1.0],
  shade: [1.05, 0.9, 1.5], shadeK: 0.42, wrap: [40, 72], edge: 0.14, broad: 0.22, bodySat: 0.16, sheen: 0.28, lift: 0.02, contactLen: 1.9,
} as unknown as Partial<CastLight>;
const CAST_DAY = {
  key: [-0.45, 0.75, 0.5], tint: [1.0, 0.97, 0.92], tintK: 0.6, gain: 0.97, shade: [1.04, 0.95, 1.34], shadeK: 0.36, wrap: [28, 56], edge: 0.13,
  broad: 0.1, bodySat: 0.13, sheen: 0.1, lift: 0.02, contactLen: 0.4,
} as unknown as Partial<CastLight>;
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.34, 0.27, 0.26]], [-10, [0.46, 0.37, 0.35]], [4, [0.78, 0.62, 0.52]], [25, [0.62, 0.55, 0.64]], [90, [0.5, 0.47, 0.6]]],
  boxes: [{ az: -90, el: 8, rot: 0, w: 34, h: 12, soft: 12, col: [0.75, 0.55, 0.42] }],
};
const LOOK: PlaceLook = {
  bg: "#c48a90",
  ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.6, color: "#33243a" },
  cast: { ...CAST_DUSK, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.4,
};
const PARAMS: Record<string, ParamValue> = { boards: 0, light: "dusk" };

const SKY_DUSK: SkyStops = [[-10, "#6e5060"], [0, "#ffbe86"], [3, "#ffaa76"], [9, "#ee9184"], [20, "#bf80a2"], [42, "#8a6ea6"], [90, "#62588e"]];
const SKY_DAY: SkyStops = [[-10, "#c8c0b0"], [0, "#efe8da"], [8, "#e2e4e2"], [35, "#c8d2da"], [90, "#b2c2d0"]];

// the stucco palettes (muted and warm; shutters olive, brown, grey-green, faded ochre: no blue, no red)
const P = (wall: string, shutter: string, o: Partial<FrontPal> = {}): FrontPal => ({
  wall, wallLo: toHex(mix(wall, "#8a6a5a", 0.3)), wallHi: toHex(mix(wall, "#fff4e0", 0.35)), trim: "#e6d8c0", shutter, plinth: "#b4a090", line: "#4a3434",
  brick: "#b48466", dark: "#4a3a3c", ...o,
});
const PAL = {
  ochre: P("#dcae72", "#7a7a52"), rose: P("#d9a08a", "#6e6a4e"), cream: P("#e8d6b4", "#8a6a48"), peach: P("#e2b48e", "#5e6a56"),
  sand: P("#d8bc8c", "#7a5e44"), apricot: P("#e8c29a", "#6a7258"), stone: P("#cdb8a0", "#6e5a46"),
};

type G2 = CanvasRenderingContext2D;
/** THE STREET'S FLOOR, painted in METRES (x across from the island's middle, z along: parts/ground.ts metrePaint): big
 *  worn pink-grey flags laid in courses, a drain of small setts down the middle, a footway kerb of long stones under
 *  each row of fronts, a threshold course at the piazza's mouth; wear, cracks, dust in the joints, a weed or two.
 *  The low sun is at the far end (-z): each flag's far edge catches it, its near edge is in shade. `px` = one pixel
 *  in metres. */
const streetPaint = (g: G2, px: number) => {
  const r = rng(52), X = S.fxR, Z0 = S.end - 0.05, Z1 = 12.05, KERB = 0.52, DRAIN = 0.17, J = 0.018;
  const tone = (base: string) => { const k = r(); return css(mix(base, k < 0.5 ? "#a68e7e" : "#ccb6a4", 0.75 * Math.abs(k - 0.5) * 2)); };
  const line = (pts: [number, number][], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = Math.max(w, px * 0.8); g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z))); g.stroke(); };
  /** one stone: a fill with worn corners, a lit far edge, a shaded near edge, an uneven face */
  const stone = (x0: number, z0: number, w: number, d: number, base: string, crack = false) => {
    const a = x0 + J / 2, b = z0 + J / 2, ww = w - J, dd = d - J, c = Math.min(0.035, ww * 0.2, dd * 0.2) * (0.5 + r());
    g.fillStyle = tone(base); g.beginPath(); g.roundRect(a, b, ww, dd, c); g.fill();
    g.save(); g.beginPath(); g.roundRect(a, b, ww, dd, c); g.clip();
    blotch(g, a + ww * r(), b + dd * r(), Math.max(ww, dd) * (0.35 + 0.3 * r()), r() < 0.5 ? "#d2bdaa" : "#a08878", 0.3);
    if (r() < 0.6) blotch(g, a + ww * r(), b + dd * r(), Math.min(ww, dd) * 0.5, "#8f7868", 0.22);
    g.fillStyle = "rgba(255,236,214,0.3)"; g.fillRect(a, b, ww, 0.022); g.fillStyle = "rgba(70,48,52,0.2)"; g.fillRect(a, b + dd - 0.02, ww, 0.02);
    if (crack) { let x = a + ww * (0.2 + 0.6 * r()), z = b; const pts: [number, number][] = [[x, z]]; while (z < b + dd) { z += dd * (0.2 + 0.2 * r()); x += (r() - 0.5) * ww * 0.3; pts.push([x, Math.min(z, b + dd)]); } line(pts, 0.011, "rgba(84,62,60,0.6)"); line(pts.map(([px0, pz0]) => [px0 + 0.012, pz0]), 0.006, "rgba(255,238,220,0.3)"); }
    g.restore();
  };
  g.fillStyle = "#8f796b"; g.fillRect(-X - 0.1, Z0, 2 * X + 0.2, Z1 - Z0);                      // the joints' bed
  // THE FLAGS: courses across each half of the carriageway, two or three flags to a course
  for (const sx of [-1, 1]) {
    const xa = sx > 0 ? DRAIN : -X + KERB, xb = sx > 0 ? X - KERB : -DRAIN, wAll = xb - xa;
    for (let z = Z0 - 0.3 * r(); z < Z1;) {
      const d = 0.52 + 0.36 * r(), n = r() < 0.45 ? 2 : 3, cuts = [0];
      for (let i = 1; i < n; i++) cuts.push((i + (r() - 0.5) * 0.5) / n);
      cuts.push(1);
      for (let i = 0; i < n; i++) stone(xa + wAll * cuts[i], z, wAll * (cuts[i + 1] - cuts[i]), d, "#b9a190", r() < 0.07);
      z += d;
    }
  }
  // THE DRAIN: two rows of small setts down the middle, a dark wet joint between them
  g.fillStyle = "#7c6659"; g.fillRect(-DRAIN, Z0, 2 * DRAIN, Z1 - Z0);
  for (const row of [0, 1]) for (let z = Z0 - (row ? 0.11 : 0); z < Z1;) { const d = 0.19 + 0.05 * r(); stone(row ? 0.005 : -DRAIN, z, DRAIN - 0.005, d, "#a28c7c"); z += d; }
  { const gr = g.createLinearGradient(-DRAIN, 0, DRAIN, 0); gr.addColorStop(0, "rgba(50,36,40,0)"); gr.addColorStop(0.5, "rgba(50,36,40,0.3)"); gr.addColorStop(1, "rgba(50,36,40,0)"); g.fillStyle = gr; g.fillRect(-DRAIN, Z0, 2 * DRAIN, Z1 - Z0); }
  // THE KERBS: long stones under each row of fronts
  for (const sx of [-1, 1]) for (let z = Z0 - 1.2 * r(); z < Z1;) { const d = 1.5 + 1.0 * r(); stone(sx > 0 ? X - KERB : -X, z, KERB, d, "#c4b4a6", r() < 0.1); z += d; }
  // the threshold course at the piazza's mouth
  for (let x = -X; x < X;) { const w = 0.7 + 0.5 * r(); stone(x, Z0, Math.min(w, X - x), 0.42, "#c4b4a6"); x += w; }
  // wear: the middle of each half trodden pale, the wall feet and the drain's sides dark with dirt
  for (const [x0, x1, col] of [[-1.35, -0.45, "236,214,196"], [0.45, 1.35, "236,214,196"]] as [number, number, string][]) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.5, `rgba(${col},0.16)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x0, Z0, x1 - x0, Z1 - Z0); }
  for (const sx of [-1, 1]) { const gr = g.createLinearGradient(sx * X, 0, sx * (X - 0.45), 0); gr.addColorStop(0, "rgba(72,50,56,0.36)"); gr.addColorStop(1, "rgba(72,50,56,0)"); g.fillStyle = gr; g.fillRect(Math.min(sx * X, sx * (X - 0.45)), Z0, 0.45, Z1 - Z0); }
  for (let i = 0; i < 420; i++) blotch(g, -X + 2 * X * r(), Z0 + (Z1 - Z0) * r(), 0.25 + 0.6 * r(), r() < 0.5 ? "#cdb7a4" : "#98806f", 0.14);
  // dust in the joints, grit
  for (let i = 0; i < 16000; i++) { g.fillStyle = r() < 0.5 ? "rgba(90,66,62,0.2)" : "rgba(246,226,204,0.2)"; g.fillRect(-X + 2 * X * r(), Z0 + (Z1 - Z0) * r(), 0.01 + 0.024 * r(), 0.01 + 0.018 * r()); }
  // weeds in the joints at the wall feet (grey-olive, small)
  for (let i = 0; i < 46; i++) {
    const sx = r() < 0.5 ? -1 : 1, x = sx * (X - 0.03 - 0.12 * r() * r()), z = Z0 + (Z1 - Z0) * r();
    for (let k = 0; k < 5; k++) { const a = r() * 6.28, l = 0.03 + 0.05 * r(); line([[x, z], [x + Math.cos(a) * l, z + Math.sin(a) * l * 0.7]], 0.012, r() < 0.5 ? "rgba(112,116,78,0.8)" : "rgba(138,136,92,0.75)"); }
  }
  // a few fallen leaves and wisps of straw
  for (let i = 0; i < 150; i++) { const x = -X + 2 * X * r(), z = Z0 + (Z1 - Z0) * r(), a = r() * 3.14, l = 0.04 + 0.07 * r(); line([[x, z], [x + Math.cos(a) * l, z + Math.sin(a) * l]], 0.008, r() < 0.5 ? "rgba(214,188,140,0.7)" : "rgba(150,120,90,0.55)"); }
};

function build(K: Kit): PlaceBuild {
  const group = new THREE.Group(); group.name = "street";
  const Mk = maker(K, group), BT = new Batch(), RB = new Batch();
  const r = rng(5150);
  const L = (x: number) => X0 + x;
  // ---------------------------------------------------------------------------------------------- materials
  const roof = { tile: Mk.tex(tilesTex(51, "#b47a5e", "#8a5a48", "#cc9a7a"), 0.9), under: Mk.tex(raftersTex("#7a5444", "#4e3a36"), 0.9), fascia: Mk.flat("#6e4e3c", 0.85), end: Mk.flat("#c49a7c", 0.9) };
  const mSlab = Mk.flat("#e2d4bc", 0.9), mRail = Mk.tex(balustradeTex("#e6dac4", "#a8947e", "#4a3434"), 0.9), mSill = Mk.flat("#e8dcc6", 0.88);
  const mReveal = Mk.flat("#c8b49c", 0.9), mDoorBack = Mk.tex(paint(128, 256, (g, W, H) => {
    g.fillStyle = "#6a4c38"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#4a3428"; g.lineWidth = 3; for (let x = 0; x < W; x += W / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    g.fillStyle = "#3e3234"; for (const y of [0.35, 0.65]) for (let x = 14; x < W; x += 32) { g.beginPath(); g.arc(x, H * y, 3.5, 0, 7); g.fill(); }
  }), 0.85);
  const mRoom = Mk.tex(paint(256, 256, (g, W, H) => {
    // the dim room behind the window: a darker plaster wall, the edge of a shelf with jars, a hanging cloth
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#6a5a54"); gr.addColorStop(1, "#7a6658"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 10; i++) blotch(g, W * Math.abs(Math.sin(i * 7.1)), H * Math.abs(Math.sin(i * 3.3)), 60, i % 2 ? "#3c3032" : "#64524a", 0.25);
    g.fillStyle = "#6a503c"; g.fillRect(0, H * 0.36, W, 10); g.fillStyle = "#3e3032"; g.fillRect(0, H * 0.36 + 10, W, 4);
    for (let i = 0; i < 4; i++) { const x = 30 + i * 58, h = 26 + (i % 2) * 12; g.fillStyle = ["#7a6a58", "#5e5a4e", "#806a54", "#6a5e52"][i]; g.fillRect(x, H * 0.36 - h, 26, h); }
  }), 0.95);

  // ---------------------------------------------------------------------------------------------- the ground
  // (v5: the paving was ONE quad of 80 x 110 m with the gutter and the kerbs as sheets 0.6 and 0.7 mm over it: the same
  // two faults as Mantua's ground, parts/ground.ts. Now the street between the fronts is one painting, in metres, with
  // its drain and its kerbs painted INTO it, on a grid; the alley and the piazza keep the tiled paving, on the same grid)
  const mPave = Mk.tex(pavingTex(52, { base: "#b9a190", lo: "#a68e7e", hi: "#c8b2a0", joint: "#a48e7e" }), 0.95);
  {
    const ZE = S.end, ZC = 12;
    const xs = gridLines(L(-40), L(40), L(-9), L(6), 1, [L(S.fxL), L(S.fxR)]), zs = gridLines(-80, 30, -18, 6, 1, [ZE, ZC]);
    const tile = (x: number, z: number): [number, number] => [(x - X0) / 3.2, -z / 3.2];
    Mk.mesh("street.paving", patchG(xs, zs, L(-40), L(S.fxL), -80, 30, 0, tile), mPave, { cast: false });
    Mk.mesh("street.paving", patchG(xs, zs, L(S.fxR), L(40), -80, 30, 0, tile), mPave, { cast: false });
    Mk.mesh("street.paving", patchG(xs, zs, L(S.fxL), L(S.fxR), -80, ZE, 0, tile), mPave, { cast: false });
    Mk.mesh("street.paving", patchG(xs, zs, L(S.fxL), L(S.fxR), ZC, 30, 0, tile), mPave, { cast: false });
    const MP = metrePaint(S.fxL, S.fxR, ZE, ZC, 150);
    const tex = paint(MP.W, MP.H, (g) => { MP.begin(g); streetPaint(g, 1 / 150); });
    Mk.mesh("street.floor", patchG(xs, zs, L(S.fxL), L(S.fxR), ZE, ZC, 0, (x, z) => MP.uvOf(x - X0, z)), Mk.tex(tex, 0.95), { cast: false });
  }

  // ---------------------------------------------------------------------------------------------- the houses
  type HSpec = { name: string; z0: number; z1: number; side: "L" | "R"; h: number; pal: FrontPal; storeys: number[]; cols: number; ground: Win[]; holes?: { u0: number; u1: number; y0: number; y1: number; arch?: number; surround?: number }[]; back?: THREE.Material; balcony?: { u: number; s: number; w: number }; lit?: number[]; bricks?: number; recess?: number; ppm?: number };
  const HOUSES: HSpec[] = [
    // left row (fronts at x -2.3 facing +x; u runs toward -z from z0)
    { name: "A", side: "L", z0: 9.0, z1: 1.2, h: 7.4, pal: PAL.ochre, storeys: [2.9, 5.1], cols: 3, ground: [{ u: 2.0, y0: 1.0, y1: 2.15, w: 0.8, kind: "closed" }, { u: 5.6, y0: 0, y1: 2.3, w: 1.1, kind: "door" }], bricks: 1 },
    { name: "B", side: "L", z0: 1.2, z1: S.alley.z0, h: 6.5, pal: PAL.rose, storeys: [2.8, 4.75], cols: 2, ground: [{ u: 0.9, y0: 1.0, y1: 2.1, w: 0.7, kind: "half" }], holes: [{ u0: 2.35, u1: 3.45, y0: 0, y1: 2.55, arch: 0.55, surround: 0.15 }], back: mDoorBack, bricks: 1 },
    { name: "C", side: "L", z0: S.alley.z1, z1: -9.6, h: 8.1, pal: PAL.cream, storeys: [3.1, 5.6], cols: 3, ground: [{ u: 3.9, y0: 1.05, y1: 2.2, w: 0.8, kind: "closed" }], holes: [{ u0: 0.74, u1: 1.86, y0: 0, y1: 2.4, arch: 0.5, surround: 0.15 }], back: mDoorBack, balcony: { u: 2.75, s: 0, w: 1.9 }, lit: [4] },
    { name: "D", side: "L", z0: -9.6, z1: S.end, h: 7.2, pal: PAL.peach, storeys: [2.9, 5.0], cols: 3, ground: [{ u: 2.8, y0: 0, y1: 2.3, w: 1.1, kind: "door" }], lit: [1], bricks: 1 },
    // right row (fronts at x +2.3 facing -x; u runs toward +z from z1)
    { name: "H", side: "R", z0: S.end, z1: -9.9, h: 7.7, pal: PAL.sand, storeys: [3.0, 5.3], cols: 3, ground: [{ u: 1.6, y0: 0, y1: 2.3, w: 1.1, kind: "door" }, { u: 4.0, y0: 1.0, y1: 2.15, w: 0.8, kind: "open" }], lit: [3] },
    { name: "G", side: "R", z0: -9.9, z1: -4.6, h: 6.9, pal: PAL.rose, storeys: [2.9, 4.95], cols: 2, ground: [{ u: 1.4, y0: 1.0, y1: 2.15, w: 0.8, kind: "closed" }], holes: [{ u0: 3.38, u1: 4.42, y0: 0, y1: 2.3, surround: 0.14 }], back: mDoorBack, balcony: { u: 2.65, s: 0, w: 1.7 }, bricks: 2 },
    { name: "F", side: "R", z0: -4.6, z1: 2.8, h: 7.3, pal: PAL.apricot, storeys: [2.95, 5.15], cols: 3, ground: [{ u: 1.5, y0: 0, y1: 2.3, w: 1.1, kind: "door" }, { u: 6.4, y0: 1.0, y1: 2.15, w: 0.8, kind: "closed" }], holes: [{ u0: S.win.z + 4.6 - S.win.w / 2, u1: S.win.z + 4.6 + S.win.w / 2, y0: S.win.y0, y1: S.win.y1, surround: 0.1 }], back: mRoom, recess: S.win.deep, ppm: 280, bricks: 1 },
    { name: "E", side: "R", z0: 2.8, z1: 9.0, h: 6.6, pal: PAL.stone, storeys: [2.8, 4.8], cols: 2, ground: [{ u: 2.2, y0: 1.0, y1: 2.15, w: 0.8, kind: "half" }] },
  ];
  const mats = new Map<string, THREE.Material>();
  const sideOf = (pal: FrontPal) => { const k = pal.wall; if (!mats.has(k)) mats.set(k, Mk.flat(toHex(mix(pal.wall, "#9a7a6a", 0.12)), 0.92)); return mats.get(k)!; };
  const litRects: { M: THREE.Matrix4; wn: Win }[] = [];
  /** each house's placement, by its letter (the dressing stands on the fronts) */
  const HM: Record<string, THREE.Matrix4> = {};
  let hi = 0;
  for (const hs of HOUSES) {
    const w = Math.abs(hs.z1 - hs.z0), M = hs.side === "L" ? houseAt(L(S.fxL), hs.z0, Math.PI / 2) : houseAt(L(S.fxR), hs.z0, -Math.PI / 2);
    HM[hs.name] = M;
    const wins = [...hs.ground, ...upperWins(600 + hi, w, hs.storeys, hs.cols)];
    if (hs.balcony) { const k = wins.findIndex((q, i) => i >= hs.ground.length && Math.abs(q.u - hs.balcony!.u) < w / hs.cols / 2 && Math.abs(q.y0 - hs.storeys[0] - 0.85) < 0.01); if (k >= 0) wins[k] = { ...wins[k], u: hs.balcony.u, y0: hs.storeys[0] + 0.02, y1: hs.storeys[0] + 2.1, w: 0.9, kind: "open" }; }
    for (const li of hs.lit ?? []) { const q = wins[hs.ground.length + li]; if (q) { q.kind = "open"; litRects.push({ M, wn: q }); } }
    const tex = frontTex({ seed: 700 + hi, w, h: hs.h, ppm: hs.ppm ?? 56, pal: hs.pal, wins, courses: hs.storeys.map((y) => y - 0.05), cornice: true, holes: hs.holes, brickPatches: hs.bricks ?? 0, cracks: 2 });
    house(Mk, BT, M, {
      w, h: hs.h, D: 5.5, face: Mk.tex(tex, 0.92), side: sideOf(hs.pal), holes: hs.holes, back: hs.back, recess: hs.recess, reveal: mReveal,
      roof: { kind: "eaves", rise: 1.5, over: 0.55, m: roof },
      balcony: hs.balcony ? { u: hs.balcony.u, y: hs.storeys[0], w: hs.balcony.w, slab: mSlab, rail: mRail } : undefined,
      sills: hs.name === "F" ? [[S.win.z + 4.6, S.win.y0, S.win.w + 0.3]] : [], sillMat: mSill,
      cast: hs.side === "L",
    }, `street.house${hs.name}`);
    hi++;
  }

  // ---------------------------------------------------------------------------------------------- the alley and its arch
  {
    const A = S.alley, w = A.z0 - A.z1, M = houseAt(L(S.fxL), A.z0, Math.PI / 2), top = 6.2, deep = A.deep, n = 12;
    const curve: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const t = i / n; curve.push([w * t, A.spring + (A.archTop - A.spring) * Math.sin(Math.PI * t)]); }
    const sh = new THREE.Shape([...curve.map(([u, y]) => new THREE.Vector2(u, y)), new THREE.Vector2(w, top), new THREE.Vector2(0, top)]);
    const front = new THREE.ShapeGeometry(sh, 4), back = front.clone();
    const uvq = (g: THREE.BufferGeometry) => { const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w, p.getY(i) / top); };
    uvq(front); uvq(back);
    const pal = PAL.rose, tex = frontTex({ seed: 790, w, h: top, ppm: 56, pal, wins: [{ u: w / 2, y0: 3.95, y1: 5.0, w: 0.6, kind: "closed" }], courses: [2.95], plinth: 0, holes: [], cracks: 1 });
    Mk.mesh("street.alleyArch.front", front.applyMatrix4(M), Mk.tex(tex, 0.92), { cast: true });
    back.scale(1, 1, -1).translate(0, 0, -deep); back.index && back.setIndex(Array.from(back.index.array).reverse()); back.computeVertexNormals();
    Mk.mesh("street.alleyArch.back", back.applyMatrix4(M), sideOf(pal), { cast: true });
    const faces: THREE.Vector3[][] = [];
    for (let i = 0; i < n; i++) { const [u0, y0] = curve[i], [u1, y1] = curve[i + 1]; faces.push([new THREE.Vector3(u1, y1, 0), new THREE.Vector3(u0, y0, 0), new THREE.Vector3(u0, y0, -deep), new THREE.Vector3(u1, y1, -deep)]); }
    const soffit = new THREE.BufferGeometry(), pos: number[] = [];
    for (const f of faces) for (const k of [0, 1, 2, 0, 2, 3]) pos.push(f[k].x, f[k].y, f[k].z);
    soffit.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); soffit.computeVertexNormals();
    Mk.mesh("street.alleyArch.soffit", soffit.applyMatrix4(M), mReveal, { cast: false });
    BT.add(roof.fascia, boxG(-0.02, w + 0.02, top, top + 0.22, -deep, 0.08).applyMatrix4(M));
    // the house that closes the alley 6.5 m in (front facing +x), and a lantern bracket's worth of shade
    const Mc = houseAt(L(-8.6), -1.6, Math.PI / 2);
    house(Mk, BT, Mc, { w: 4.0, h: 6.0, D: 4, face: Mk.tex(frontTex({ seed: 795, w: 4, h: 6, ppm: 40, pal: PAL.stone, wins: upperWins(796, 4, [2.6], 2), courses: [2.55], cornice: true }), 0.92), side: sideOf(PAL.stone), roof: { kind: "eaves", rise: 1.2, over: 0.5, m: roof }, cast: true }, "street.alleyEnd");
  }

  // ---------------------------------------------------------------------------------------------- the boards (param)
  const planks: THREE.Group[] = [];
  {
    const W0 = S.win, n = W0.planks, len = W0.w + 0.36, ht = 0.17;
    const plankTex = (seed: number) => paint(256, 64, (g, W, H) => {
      const rr = rng(seed); g.fillStyle = css(mix("#a08a72", "#8a7660", rr())); g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(80,62,50,0.45)"; g.lineWidth = 2;
      for (let k = 0; k < 5; k++) { const y = H * (0.15 + 0.7 * rr()); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + (rr() - 0.5) * 8, W * 0.7, y + (rr() - 0.5) * 8, W, y); g.stroke(); }
      g.fillStyle = "rgba(60,46,40,0.5)"; g.beginPath(); g.ellipse(W * (0.3 + 0.4 * rr()), H * 0.5, 7, 4, 0, 0, 7); g.fill();
      g.fillStyle = "#3e3a40"; for (const x of [0.07, 0.93]) for (const y of [0.3, 0.7]) { g.beginPath(); g.arc(W * x, H * y, 4, 0, 7); g.fill(); }   // nail heads
      g.fillStyle = "rgba(255,240,220,0.18)"; g.fillRect(0, 0, W, 4);
    });
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group(); g.name = `street.plank${i}`;
      const yc = W0.y1 + 0.03 - ht / 2 - i * ((W0.y1 - W0.y0 + 0.06 - ht) / (n - 1)), tilt = [0.05, -0.04, 0.035, -0.06, 0.03][i % 5], dz = [0.02, -0.03, 0.01, 0.03, -0.02][i % 5];
      new Part(K).add(K.flat("#ffffff", { map: plankTex(880 + i), rough: 0.9 }), new THREE.BoxGeometry(len, ht, 0.026), 0.005).into(g, `street.plank${i}`);
      // THE PLANK'S BODY IS SEEN BY THE INK PASS (v5, the owner on the v4 cut: "The lines are clipping here": the window's
      // two jamb lines and its lintel line ran across the planks). A props-kit part is on the NOINK layer: the pass does
      // not know it is there and draws the set's lines behind it over it unless it stands 1.5 % of the distance + 3 cm
      // clear (kit fx/README.md, rule 5), and these lie ON the wall. In the pass's own picture the planks now cover the
      // window's edges; their outline stays their own black hull.
      g.children.forEach((c) => { if (!c.name.endsWith(".ink")) c.layers.set(0); });
      // the plank's own frame: length along x, its face toward +z; turned to lie on the front (facing -x)
      g.position.set(L(S.fxR - 0.016 - (i % 2) * 0.012), yc, W0.z + dz); g.rotation.set(0, -Math.PI / 2, tilt, "YXZ");
      g.visible = false; group.add(g); planks.push(g);
    }
  }

  // ---------------------------------------------------------------------------------------------- the well in the piazza
  {
    const [wx, wz] = S.well, x = L(wx), mStone = Mk.flat("#d4c2aa", 0.9), mStoneLo = Mk.flat("#b8a48e", 0.9), mWood = Mk.flat("#6e5040", 0.85);
    const curb = new THREE.LatheGeometry([[0, 0], [0.7, 0], [0.7, 0.12], [0.62, 0.16], [0.62, 0.72], [0.7, 0.76], [0.7, 0.88], [0.5, 0.88], [0.5, 0.7], [0, 0.7]].map(([a, b]) => new THREE.Vector2(a, b)), 24).translate(x, 0, wz);
    BT.add(mStone, curb);
    for (const s of [-1, 1]) BT.add(mStoneLo, boxG(x + s * 0.62 - 0.1, x + s * 0.62 + 0.1, 0.8, 2.0, wz - 0.1, wz + 0.1));
    BT.add(mWood, boxG(x - 0.78, x + 0.78, 1.98, 2.12, wz - 0.07, wz + 0.07));
    BT.add(mWood, new THREE.CylinderGeometry(0.14, 0.14, 0.09, 16).rotateX(Math.PI / 2).translate(x, 1.86, wz));
    BT.add(mStoneLo, new THREE.CylinderGeometry(1.05, 1.1, 0.12, 28).translate(x, 0.06, wz));
  }
  // ---------------------------------------------------------------------------------------------- the street is lived in (v5)
  // the glows of the lanterns and of the lit windows: shown at dusk only
  const litG = new THREE.Group(); litG.name = "street.lit"; group.add(litG);
  /** the piazza's things and its far side do not cast: the sun is behind them and their shadows would lie the whole
   *  length of the street */
  const PB = new Batch();
  {
    const d = dresser(Mk, BT, VERONA_DRESS, 5151), dp = dresser(Mk, PB, VERONA_DRESS, 5152);
    // ---- the left row (the fronts face +x; u runs toward -z)
    d.step(HM.C, 1.3, 1.5); d.sign(HM.C, 0.36, 2.95, "loaf"); d.bench(L(-2.04), -8.0, Math.PI / 2, 1.3);
    d.barrel(L(-1.96), -9.05); d.barrel(L(-1.93), -9.72, { h: 0.74, r: 0.26 }); d.sack(L(-1.62), -9.38, 0.95, 0.6); d.pipe(HM.C, 5.42, 7.6);
    d.step(HM.D, 2.8, 1.45); d.lantern(HM.D, 1.9, 2.8, { lit: litG }); d.pot(L(-2.06), -11.62, { plant: "tall", r: 0.16 }); d.pot(L(-2.06), -13.18, { plant: "tall", r: 0.16 });
    d.crate(L(-2.0), 0, -10.35, 0.52, 0.36, 0.42, 0.1); d.crate(L(-2.02), 0.36, -10.33, 0.38, 0.26, 0.32, -0.25); d.ladder(HM.D, 4.75, 3.2);
    // ---- the right row (the fronts face -x; u runs toward +z)
    d.step(HM.F, 1.5, 1.4);
    d.step(HM.G, 3.9, 1.4); d.sign(HM.G, 0.7, 2.85, "boot"); d.pot(L(2.07), -5.28, { plant: "bush" }); d.pot(L(2.07), -6.74, { plant: "bush", r: 0.15 });
    d.cart(L(1.74), -8.95, -Math.PI / 2, { load: true }); d.pipe(HM.H, 5.26, 7.2);
    d.awning(HM.H, 4.0, 2.5, 1.8); d.bench(L(1.98), -11.2, Math.PI / 2, 1.5); d.basket(L(1.98), 0.46, -11.62, 0.19, "leaf"); d.basket(L(1.98), 0.46, -11.14, 0.18, "bloom"); d.jar(L(1.97), 0.46, -10.74, 0.85);
    d.step(HM.H, 1.6, 1.45); d.lantern(HM.H, 2.55, 2.8, { lit: litG }); d.barrel(L(1.97), -14.62); d.sack(L(1.66), -14.3, 0.9, 2.2);
    // ---- the piazza: two stalls shut for the evening, barrels, the bucket on the well's curb
    dp.stall(L(-1.25), -19.3, 0.22); dp.stall(L(0.45), -24.2, -0.18, { w: 1.6 });
    dp.barrel(L(-1.95), -16.7); dp.barrel(L(-1.4), -16.95, { h: 0.7, r: 0.25 }); dp.crate(L(-1.68), 0, -16.25, 0.5, 0.34, 0.4, 0.3);
    dp.bucket(L(S.well[0] - 0.44), 0.88, S.well[1] + 0.42); dp.sack(L(S.well[0] + 1.25), S.well[1] + 0.2, 0.9, 1.1);
    // ---- THE FAR SIDE OF THE PIAZZA: two houses, and between them a low arcaded loggia under a tiled roof. The tower
    // and the low sun stand over the loggia (the painted far card behind keeps the roofs beyond)
    const ZF = -27.5, lx0 = -4.4, lx1 = 3.6, lh = 3.3, lDeep = 2.7;
    const far: { name: string; x0: number; w: number; h: number; pal: FrontPal; storeys: number[]; cols: number; ground: Win[]; lit: number[] }[] = [
      { name: "P", x0: -11.6, w: 7.2, h: 7.5, pal: PAL.cream, storeys: [3.1, 5.4], cols: 4, ground: [{ u: 1.6, y0: 0, y1: 2.4, w: 1.15, kind: "door" }, { u: 3.9, y0: 1.0, y1: 2.2, w: 0.8, kind: "closed" }, { u: 5.9, y0: 0, y1: 2.4, w: 1.1, kind: "door" }], lit: [2, 7] },
      { name: "Q", x0: lx1, w: 7.0, h: 6.8, pal: PAL.ochre, storeys: [2.9, 5.0], cols: 4, ground: [{ u: 1.3, y0: 1.0, y1: 2.2, w: 0.8, kind: "half" }, { u: 3.5, y0: 0, y1: 2.3, w: 1.1, kind: "door" }], lit: [1] },
    ];
    far.forEach((hs, i) => {
      const M = houseAt(L(hs.x0), ZF, 0), wins = [...hs.ground, ...upperWins(640 + i, hs.w, hs.storeys, hs.cols)];
      for (const li of hs.lit) { const q = wins[hs.ground.length + li]; if (q) { q.kind = "open"; litRects.push({ M, wn: q }); } }
      const tex = frontTex({ seed: 740 + i, w: hs.w, h: hs.h, ppm: 48, pal: hs.pal, wins, courses: hs.storeys.map((y) => y - 0.05), cornice: true, brickPatches: 1, cracks: 1 });
      house(Mk, PB, M, { w: hs.w, h: hs.h, D: 5.5, face: Mk.tex(tex, 0.92), side: sideOf(hs.pal), roof: { kind: "eaves", rise: 1.4, over: 0.5, m: roof }, cast: false }, `street.far${hs.name}`);
    });
    // the loggia: four round arches on piers, a dim room behind them with two lit windows, a lean-to roof of tiles
    const mLog = Mk.flat("#e0cfb4", 0.9), mLogIn = Mk.flat("#8a6a5e", 0.95), nA = 4, bay = (lx1 - lx0) / nA;
    PB.add(mLog, archWallG({ axis: "x", at: ZF, u0: L(lx0), u1: L(lx1), y0: 0, y1: lh, thick: 0.42, notches: Array.from({ length: nA }, (_, i) => ({ c: L(lx0 + bay * (i + 0.5)), w: bay - 0.56, y0: 0, spring: 1.72, round: true })) }));
    PB.add(mLogIn, boxG(L(lx0), L(lx1), 0, lh + 0.9, ZF - lDeep - 0.2, ZF - lDeep));
    PB.add(mSlab, boxG(L(lx0) - 0.04, L(lx1) + 0.04, lh, lh + 0.14, ZF - 0.25, ZF + 0.3));                 // the cornice over the arches
    PB.add(roof.tile, quad4(new THREE.Vector3(L(lx0), lh + 0.14, ZF + 0.28), new THREE.Vector3(L(lx1), lh + 0.14, ZF + 0.28), new THREE.Vector3(L(lx1), lh + 1.0, ZF - lDeep), new THREE.Vector3(L(lx0), lh + 1.0, ZF - lDeep), (lx1 - lx0) / 1.1, 2.8));
    for (let i = 0; i <= nA; i++) PB.add(mSlab, boxG(L(lx0 + bay * i) - 0.3, L(lx0 + bay * i) + 0.3, 0, 0.16, ZF - 0.24, ZF + 0.3));   // the piers' plinths
    for (const cx of [lx0 + bay * 0.5, lx0 + bay * 2.5]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1).translate(L(cx), 1.6, ZF - lDeep + 0.012), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.72, 0.4), fog: false }));
      win.layers.set(NOINK); win.name = "street.litWin"; litG.add(win);
    }
    for (const i of [1, 3]) dp.pot(L(lx0 + bay * i), ZF + 0.52, { plant: "tall", r: 0.2 });
    dp.bench(L(lx0 + bay * 1.5), ZF - 1.2, 0, 1.6); dp.barrel(L(lx0 + bay * 3.5 + 0.3), ZF - 1.6);
  }
  BT.flush(group, "street.parts");
  RB.flush(group, "street.parts2");
  PB.flush(group, "street.piazza", false, true);

  // ---------------------------------------------------------------------------------------------- laundry across the street
  const laundry: { animate(t: number): void }[] = [];
  {
    const zl = -12.4, yl = 4.4, cloths: [number, number, number, string][] = [[-1.5, 0.7, 0.9, "#e8dcc0"], [-0.4, 0.55, 0.62, "#d8b880"], [0.55, 0.85, 1.05, "#c8c4a4"], [1.6, 0.5, 0.7, "#e2cdb4"]];
    const P0 = new Part(K); P0.add(K.flat("#d8c8a8", { rough: 0.9 }), new THREE.CylinderGeometry(0.008, 0.008, 4.6, 6).rotateZ(Math.PI / 2).translate(L(0), yl, zl), 0.005); P0.into(group, "street.line");
    cloths.forEach(([cx, cw, chh, col], i) => {
      const t = paint(128, 160, (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); g.fillStyle = css(mix(col, "#8a7060", 0.25)); g.fillRect(0, H * 0.08, W, 5); for (let k = 0; k < 3; k++) { g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(W * (0.2 + 0.3 * k), 0, 6, H); } g.strokeStyle = "#4a3a3c"; g.lineWidth = 6; g.strokeRect(0, 0, W, H); });
      const b = makeBanner(K.flat("#ffffff", { map: t, rough: 0.95, side: THREE.DoubleSide }), cw, chh, { dags: 1, tail: 0.002, amp: 0.05, ph: i * 1.7 });
      b.mesh.position.set(L(cx), yl - 0.01, zl); group.add(b.mesh); laundry.push(b);
    });
  }

  // ---------------------------------------------------------------------------------------------- the windows lit at dusk
  {
    const mLit = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.72, 0.4), fog: false });
    for (const { M, wn } of litRects) {
      const g = new THREE.PlaneGeometry(wn.w * 0.98, (wn.y1 - wn.y0) * 0.98).translate(wn.u, (wn.y0 + wn.y1) / 2, 0.012).applyMatrix4(M);
      const m = new THREE.Mesh(g, mLit); m.layers.set(NOINK); m.name = "street.litWin"; litG.add(m);
    }
  }

  // ---------------------------------------------------------------------------------------------- sky, sun, the far side of the piazza
  const sunDir = new THREE.Vector3(Math.sin(S.sun.az), Math.sin(S.sun.el), -Math.cos(S.sun.az)).normalize();
  const skyD = skyDome(new THREE.Vector3(L(0), 0, -4), SKY_DUSK, (g, W, H) => {
    const rr = rng(54), elY = (el: number) => ((90 - el) / 180) * H;
    for (let i = 0; i < 16; i++) { const x = W * rr(), y = elY(10 + 26 * rr()), s = W * (0.01 + 0.016 * rr()); for (let k = 0; k < 5; k++) blotch(g, x + (k - 2) * s * 0.9, y + (rr() - 0.5) * s * 0.3, s * (0.8 + 0.5 * rr()), rr() < 0.5 ? "#ffc8a0" : "#d890a8", 0.4); }
  });
  const skyY = skyDome(new THREE.Vector3(L(0), 0, -4), SKY_DAY, (g, W, H) => {
    const rr = rng(55), elY = (el: number) => ((90 - el) / 180) * H;
    for (let i = 0; i < 18; i++) { const x = W * rr(), y = elY(14 + 30 * rr()), s = W * (0.012 + 0.018 * rr()); for (let k = 0; k < 5; k++) blotch(g, x + (k - 2) * s * 0.8, y + (rr() - 0.5) * s * 0.4, s * (0.7 + 0.5 * rr()), "#ffffff", 0.45); }
  });
  group.add(skyD, skyY);
  const sunG = new THREE.Group(); sunG.name = "street.sun"; group.add(sunG);
  {
    const at = new THREE.Vector3(L(0), 1.5, 0).addScaledVector(sunDir, 380);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(7.5, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.86, 0.58), fog: false, depthWrite: false }));
    disc.position.copy(at); disc.lookAt(L(0), 1.5, 0); disc.layers.set(NOINK); disc.renderOrder = -90; sunG.add(disc);
    const halo = glowCard(46, "#ffb070", 0.55); halo.position.copy(at).addScaledVector(sunDir, 2); halo.lookAt(L(0), 1.5, 0); sunG.add(halo);
    const halo2 = glowCard(110, "#ff9a70", 0.3); halo2.position.copy(at).addScaledVector(sunDir, 4); halo2.lookAt(L(0), 1.5, 0); sunG.add(halo2);
  }
  // the far side: low houses, a plain civic tower, two cypresses; a gap where the sun sits (dusk: silhouettes, day: lit)
  const farOf = (dusk: boolean) => {
    const m = farCard(L(-26), L(26), -0.4, 15, -44, 2048, 604, (g, k0) => {
      const k = { ...k0, px: (x: number) => k0.px(L(x)) };
      const rr = rng(56), body = dusk ? "#6e4e5e" : "#cdb69c", body2 = dusk ? "#7a5866" : "#d8c2a6", rim = dusk ? "#ffb488" : "#efe4d2", win = dusk ? "#ffc27a" : "#6a5450";
      const bldg = (x0: number, x1: number, h: number, col: string) => {
        g.fillStyle = col; g.fillRect(k.px(x0), k.py(h), k.px(x1) - k.px(x0), k.py(-0.4) - k.py(h));
        g.fillStyle = rim; g.fillRect(k.px(x0), k.py(h), k.px(x1) - k.px(x0), Math.max(2, 0.12 * k.s));
        g.fillStyle = dusk ? "rgba(60,36,50,0.5)" : "rgba(120,96,80,0.35)"; g.fillRect(k.px(x0), k.py(h) + 0.12 * k.s, k.px(x1) - k.px(x0), 0.18 * k.s);    // eaves shade
        for (let y = 1.2; y < h - 1.2; y += 2.2) for (let x = x0 + 0.6; x < x1 - 0.6; x += 1.4) if (rr() < (dusk ? 0.22 : 0.7)) { g.fillStyle = win; g.fillRect(k.px(x), k.py(y + 0.9), 0.5 * k.s, 0.9 * k.s); }
      };
      let x = -26;
      while (x < 26) { const w = 3 + 3 * rr(); if (!(x + w > -2.2 && x < 3.6)) bldg(x, x + w, 4.5 + 3.5 * rr(), rr() < 0.5 ? body : body2); x += w; }
      bldg(-2.2, 3.6, 2.4, body2);                                               // the low gap (a loggia) under the sun
      // the plain civic tower (crenellated, no spire, nothing on top)
      const tx = -6.5, tw = 2.4, th = 13;
      g.fillStyle = body; g.fillRect(k.px(tx), k.py(th), tw * k.s, k.py(0) - k.py(th));
      for (let i = 0; i < 4; i++) g.fillRect(k.px(tx + i * 0.68), k.py(th + 0.7), 0.42 * k.s, 0.72 * k.s);
      g.fillStyle = rim; g.fillRect(k.px(tx + tw - 0.25), k.py(th), 0.25 * k.s, k.py(0) - k.py(th));
      g.fillStyle = dusk ? "#4e3646" : "#7a6658"; g.fillRect(k.px(tx + 0.7), k.py(th - 1.6), 1.0 * k.s, 1.5 * k.s);
      // cypresses
      for (const [cx, ch] of [[6.2, 8.5], [7.4, 7.0], [-11, 8]] as [number, number][]) {
        g.fillStyle = dusk ? "#4e4448" : "#6a7458"; g.beginPath(); g.moveTo(k.px(cx), k.py(ch)); g.quadraticCurveTo(k.px(cx + 0.9), k.py(ch * 0.45), k.px(cx + 0.45), k.py(0)); g.lineTo(k.px(cx - 0.45), k.py(0)); g.quadraticCurveTo(k.px(cx - 0.9), k.py(ch * 0.45), k.px(cx), k.py(ch)); g.fill();
      }
      // a warm haze over the low gap (dusk)
      if (dusk) { const hz = g.createLinearGradient(0, k.py(5), 0, k.py(0)); hz.addColorStop(0, "rgba(255,170,120,0)"); hz.addColorStop(1, "rgba(255,170,120,0.35)"); g.fillStyle = hz; g.fillRect(0, k.py(5), k.W, k.py(-0.4) - k.py(5)); }
    });
    const mt = m.material as THREE.MeshBasicMaterial; mt.alphaTest = 0.5; mt.transparent = false;
    m.name = dusk ? "street.farDusk" : "street.farDay"; group.add(m); return m;
  };
  const farD = farOf(true), farY = farOf(false);
  // the light pouring into the street from the far end (dusk): a soft warm veil over the piazza's mouth
  const veil = softCard(9, 3.6, "#ffb07a", 0.22, true); veil.position.set(L(0.2), 1.4, S.end - 1.5); veil.layers.set(NOINK); veil.renderOrder = 4; veil.name = "street.veil"; group.add(veil);

  // ---------------------------------------------------------------------------------------------- the light rig
  const at: [number, number, number] = [L(0), 0, -3.5];
  const rig = lightRig(group, { dir: DUSK.dir, k: DUSK.k, col: DUSK.col, at, half: 11, hemi: DUSK.hemi });
  let light = "dusk";
  const setLight = (v: string) => {
    light = v === "day" ? "day" : "dusk";
    const L0 = light === "day" ? DAY : DUSK, d = new THREE.Vector3(...L0.dir).normalize();
    rig.key.color.set(L0.col); rig.key.intensity = L0.k; rig.key.position.set(...at).addScaledVector(d, 30);
    rig.hemi.color.set(L0.hemi[0]); rig.hemi.groundColor.set(L0.hemi[1]); rig.hemi.intensity = L0.hemi[2];
    const dusk = light === "dusk";
    skyD.visible = dusk; sunG.visible = dusk; farD.visible = dusk; veil.visible = dusk; litG.visible = dusk;
    skyY.visible = !dusk; farY.visible = !dusk;
  };
  setLight("dusk");
  void r; void quad4;
  return {
    group,
    animate(t) { for (const b of laundry) b.animate(t); },
    setParam(name, v) {
      if (name === "boards") { const n = planks.length, k = Math.max(0, Math.min(1, Number(v))); planks.forEach((g, i) => (g.visible = k * n >= i + 0.5)); }
      else if (name === "light") setLight(String(v));
    },
    cast() { return light === "day" ? CAST_DAY : CAST_DUSK; },
  };
}

/** scene 5's street (and scene 7's boarded window): params boards 0..1 (planks one by one, from the top down),
 *  light "dusk" | "day" */
export const STREET: PlaceDef = { look: LOOK, params: PARAMS, build };

// THE STREET (place "street", island x 400): out of the college gate along a Cambridge street on a May afternoon,
// 1686 (PLAN 1, 7D start). WP2's set; the exports are the contract of sets/index.ts: STREET_LOOK, STREET_PARAMS (none),
// buildStreet(K) -> { group, cast }. Every place-number is layout/street.ts STREET_SET.
//
// WHAT THERE IS (the camera mostly looks back up the street, -z, at NEWTON walking toward her)
//   - the carriageway: COBBLES with a stone kennel (gutter) down the middle, stone-flag footways along both fronts, oak
//     posts guarding the east footway;
//   - WEST: the college: THE GATEHOUSE (red brick, stone string courses, four octagonal corner turrets with
//     battlements, a heraldic panel over a big four-centred arch; the great gates folded open in the passage and the
//     sunny court beyond), the college's brick range either side, then two town houses;
//   - EAST: town houses: timber-framed and jettied (dark oak studs and braces on pale plaster, joist ends under the
//     jetty, gables to the street with barge boards), brick ones with shaped gables, colour-washed plaster ones with the
//     eaves to the street; shop fronts with the lower shutter let down as a counter and the upper one propped as a
//     canopy (a bookseller's, a draper's, a potter's), plank doors, leaded casements and oriels, hanging signs;
//   - both ends closed by more houses across the street (it bends), a church tower over the roofs at the far end.
// THE LIGHT: an afternoon sun behind her left shoulder (the gate's front in sun, the east fronts in a warm shade), a
// blue sky with a few clouds.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, skyDome, Batch, type SkyStops } from "../../../kit/sets/okit";
import { STREET_SET as S, STRX } from "../layout/street";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, wallQuad, tileUV, quad4 } from "./parts/common";
import { NC, NOINK, holedWall, brickTex, ashlarTex, leadedTex, plasterTex, roofTilesTex, plankTex, spinesTex, type Hole } from "./parts/newton";

const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" };
const CAST: Partial<CastLight> = { key: S.sun, tint: [1.0, 0.96, 0.9], tintK: 0.7, gain: 0.97, shade: [1.04, 0.95, 1.34], broad: 0, sheen: 0.08, contactLen: 0.5 } as unknown as Partial<CastLight>;
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.46, 0.43, 0.38]], [-10, [0.54, 0.51, 0.47]], [4, [0.76, 0.79, 0.85]], [30, [0.66, 0.73, 0.86]], [90, [0.58, 0.66, 0.86]]],
  boxes: [{ az: 45, el: 40, rot: 0, w: 36, h: 20, soft: 14, col: [1.0, 0.95, 0.86] }],
};
/** the street's look */
export const STREET_LOOK: PlaceLook = {
  bg: "#a4c4e2",
  ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.7, color: "#2e2c40" },
  cast: { grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.94, 1.0], shadeK: 0.36, wrap: [26, 52], edge: 0.13, bodySat: 0.13, lift: 0, ...CAST, ...BAKED } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
/** the street has no per-frame dressing */
export const STREET_PARAMS: Record<string, ParamValue> = {};

const SKY: SkyStops = [[-10, "#c9c2b0"], [0, "#e8ecea"], [8, "#cadcec"], [25, "#a2c4e6"], [60, "#7caade"], [90, "#6e9ed8"]];
const G = S.gate, WX = STRX + S.x0, EX = STRX + S.x1;
type Kind = "timber" | "brick" | "plaster";

// ---------------------------------------------------------------------------------------------------- paintings
const PPM = 90;
/** A TIMBER-FRAMED storey: pale plaster panels in a frame of dark oak (corner posts, sill and head rails, a middle
 *  rail, close studs, curved-ish braces at the ends); w x h metres, uv 0..1 over the whole face */
const timberTex = (seed: number, w: number, h: number, o: { studs?: number; braces?: boolean; mid?: boolean; plaster?: string; oak?: string; triangle?: boolean } = {}) =>
  paint(Math.round(w * PPM), Math.round(h * PPM), (g, W, H) => {
    const r = rng(seed), p = o.plaster ?? "#ece0c4", oak = o.oak ?? "#5a3c28", m = PPM;
    g.fillStyle = p; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) blotch(g, W * r(), H * r(), m * (0.3 + 0.6 * r()), r() < 0.6 ? "#d8c8a6" : "#f6eedc", 0.18);
    const beam = (x0: number, y0: number, x1: number, y1: number, t: number) => {
      g.strokeStyle = css(mix(oak, r() < 0.5 ? "#3e2a1c" : "#6e4c32", 0.3 * r())); g.lineWidth = t * m; g.lineCap = "butt";
      g.beginPath(); g.moveTo(x0 * m, H - y0 * m); g.lineTo(x1 * m, H - y1 * m); g.stroke();
    };
    const st = o.studs ?? 0.42;
    if (o.triangle) {   // a gable: the raking edges, a collar, king post and studs
      beam(0, 0.1, w, 0.1, 0.2); beam(w / 2, 0, w / 2, h, 0.18); beam(w * 0.22, h * 0.45, w * 0.78, h * 0.45, 0.14);
      for (let x = st; x < w - 0.05; x += st) { const top = x < w / 2 ? (x / (w / 2)) * h : ((w - x) / (w / 2)) * h; if (Math.abs(x - w / 2) > 0.2) beam(x, 0, x, top, 0.11); }
      beam(0.35, 0.2, w / 2 - 0.1, h * 0.42, 0.13); beam(w - 0.35, 0.2, w / 2 + 0.1, h * 0.42, 0.13);
    } else {
      beam(0, 0.1, w, 0.1, 0.2); beam(0, h - 0.1, w, h - 0.1, 0.2);               // sill and head rails
      if (o.mid ?? true) beam(0, h * 0.42, w, h * 0.42, 0.13);
      for (let x = st; x < w - 0.1; x += st) beam(x + (r() - 0.5) * 0.03, 0, x, h, 0.11);   // close studs
      beam(0.11, 0, 0.11, h, 0.24); beam(w - 0.11, 0, w - 0.11, h, 0.24);         // corner posts
      if (o.braces ?? true) { beam(0.2, h * 0.42, 1.0, h - 0.12, 0.14); beam(w - 0.2, h * 0.42, w - 1.0, h - 0.12, 0.14); }
    }
    g.fillStyle = "rgba(40,26,18,0.25)"; g.fillRect(0, 0, W, 3);                    // a dark line under the head
  });
/** COLOUR-WASHED PLASTER (ochre, pink, cream), a little weathered at the foot */
const washTex = (seed: number, base: string) => plasterTex(seed, base, css(mix(base, "#8a7a62", 0.25)), 256);
/** STONE FLAGS for the footways: big rectangular slabs in courses along v */
const flagsTex = (seed: number) => paint(256, 512, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#8e8474"; g.fillRect(0, 0, W, H);
  let y = 0;
  while (y < H) {
    const h = 60 + 50 * r(); let x = 0; const off = r() * 60;
    while (x < W + 80) { const w = 70 + 70 * r(); g.fillStyle = css(mix("#c4b8a0", r() < 0.5 ? "#a89c86" : "#d6ccb4", 0.2 + 0.5 * r())); g.fillRect(x - off + 2, y + 2, w - 4, h - 4); x += w; }
    y += h;
  }
}, true);
/** THE CARRIAGEWAY (WP5-D, for the director's note on the round cobbles that read as polka dots): small, irregular,
 *  tightly packed granite SETTS laid in courses across the street (rows along u = x), each a slightly skewed rounded
 *  block of its own grey, thin dark joints, only a faint lit top edge (no domes). 512 px = 1.4 m: courses 0.1 m,
 *  stones 0.1-0.17 m long. Tiles both ways. */
const roadSettsTex = (seed: number) => paint(512, 512, (g, W, H) => {
  const r = rng(seed), rows = 14, ch = H / rows;
  g.fillStyle = "#5f584f"; g.fillRect(0, 0, W, H);
  const greys = ["#8e8679", "#9a9184", "#a69d8e", "#847c70", "#958c7c", "#a0988c"];
  for (let j = 0; j < rows; j++) {
    const y0 = j * ch, ws: number[] = [];
    let tot = 0; while (tot < W - 40) { const w = 38 + 26 * r(); ws.push(w); tot += w; }
    const k = W / tot, off = r() * W;                                                   // stretch the course to tile exactly
    let x = 0;
    for (const w0 of ws) {
      const w = w0 * k, gap = 2.6 + 1.2 * r(), j1 = () => (r() - 0.5) * 2.4;
      const pts: [number, number][] = [[x + gap / 2 + j1(), y0 + gap / 2 + j1()], [x + w - gap / 2 + j1(), y0 + gap / 2 + j1()], [x + w - gap / 2 + j1(), y0 + ch - gap / 2 + j1()], [x + gap / 2 + j1(), y0 + ch - gap / 2 + j1()]];
      const col = css(mix(greys[Math.floor(r() * greys.length)], r() < 0.5 ? "#7c7468" : "#b0a796", 0.35 * r()));
      for (const dx of [-W, 0, W]) for (const dy of j === 0 ? [0, H] : j === rows - 1 ? [0, -H] : [0]) {
        const P = pts.map(([px, py]) => [px + off + dx, py + dy] as [number, number]);
        g.fillStyle = col; g.beginPath(); P.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill();
        // a faint lit top edge and a soft shadowed bottom edge (worn, nearly flat tops)
        g.fillStyle = "rgba(255,246,228,0.09)"; g.fillRect(P[0][0] + 2, P[0][1], P[1][0] - P[0][0] - 4, 3);
        g.fillStyle = "rgba(30,26,22,0.16)"; g.fillRect(P[3][0] + 2, P[3][1] - 3, P[2][0] - P[3][0] - 4, 3);
      }
      x += w;
    }
  }
  // a little grit and wear, and a gentle unevenness of tone across the courses
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? "rgba(40,36,30,0.18)" : "rgba(220,210,190,0.10)"; g.fillRect(W * r(), H * r(), 1.5 + 2 * r(), 1.5 + 2 * r()); }
}, true);
/** the KENNEL: narrow stone setts along v, darker and damp in the middle */
const settsTex = (seed: number) => paint(128, 512, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#6e675e"; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 26) for (let x = (y / 26) % 2 ? -16 : 0; x < W; x += 32) { g.fillStyle = css(mix("#9a9082", r() < 0.5 ? "#857c6e" : "#aaa090", 0.5 * r())); g.fillRect(x + 2, y + 2, 28, 22); }
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "rgba(40,40,46,0)"); gr.addColorStop(0.5, "rgba(40,40,46,0.12)"); gr.addColorStop(1, "rgba(40,40,46,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}, true);
/** a SHOP's dim inside seen over the counter: shelves of wares on a dark ground */
const shopTex = (seed: number, wares: "books" | "cloth" | "pots") => paint(256, 192, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#3a2c24"; g.fillRect(0, 0, W, H);
  for (const y of [0.3, 0.62, 0.94]) {
    g.fillStyle = "#6a4a34"; g.fillRect(0, H * y, W, 6);
    let x = 4;
    while (x < W - 8) {
      if (wares === "books") { const w = 6 + 8 * r(), h = H * (0.18 + 0.08 * r()); g.fillStyle = css(mix(["#7a3a2a", "#5e3a26", "#8a6a3a", "#4a5240", "#6a2e2a"][Math.floor(r() * 5)], "#000000", 0.1)); g.fillRect(x, H * y - h, w, h); x += w + 1; }
      else if (wares === "cloth") { const w = 22 + 14 * r(), h = H * (0.12 + 0.1 * r()); g.fillStyle = css(["#7a4a6a", "#4a6a8a", "#b08a4a", "#6a8a5a", "#c0b090"][Math.floor(r() * 5)]); g.fillRect(x, H * y - h, w, h); g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(x, H * y - h * 0.5, w, 2); x += w + 3; }
      else { const rr = 8 + 7 * r(); g.fillStyle = css(["#b0704a", "#8a5a3a", "#c49a6a", "#6a7a8a"][Math.floor(r() * 4)]); g.beginPath(); g.ellipse(x + rr, H * y - rr * 1.1, rr, rr * 1.1, 0, 0, 7); g.fill(); x += rr * 2 + 4; }
    }
  }
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(20,14,10,0.45)"); gr.addColorStop(1, "rgba(20,14,10,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
});
/** a HANGING SIGN: a board with a moulded edge and its device (a book, a boot, grapes) */
const signTex = (kind: number) => paint(160, 128, (g, W, H) => {
  const grounds = ["#2e5a46", "#e6dcc0", "#6a2e2a"], ground = grounds[kind % 3];
  g.fillStyle = "#4a3424"; g.fillRect(0, 0, W, H);
  g.fillStyle = ground; g.fillRect(8, 8, W - 16, H - 16);
  g.strokeStyle = "#c8a24a"; g.lineWidth = 3; g.strokeRect(14, 14, W - 28, H - 28);
  if (kind % 3 === 0) {   // an open book, gold
    g.fillStyle = "#e8d48a"; g.beginPath(); g.moveTo(W / 2, 46); g.quadraticCurveTo(W * 0.3, 32, 34, 40); g.lineTo(34, 92); g.quadraticCurveTo(W * 0.3, 84, W / 2, 98); g.quadraticCurveTo(W * 0.7, 84, W - 34, 92); g.lineTo(W - 34, 40); g.quadraticCurveTo(W * 0.7, 32, W / 2, 46); g.fill();
    g.strokeStyle = "#8a6a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2, 46); g.lineTo(W / 2, 98); g.stroke();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(44, 52 + i * 10); g.lineTo(W / 2 - 8, 56 + i * 10); g.moveTo(W / 2 + 8, 56 + i * 10); g.lineTo(W - 44, 52 + i * 10); g.stroke(); }
  } else if (kind % 3 === 1) {   // a black boot
    g.fillStyle = "#2a2426"; g.beginPath(); g.moveTo(62, 26); g.lineTo(92, 26); g.lineTo(94, 76); g.quadraticCurveTo(122, 80, 124, 100); g.lineTo(52, 100); g.lineTo(58, 76); g.closePath(); g.fill();
    g.fillStyle = "#c8a24a"; g.fillRect(58, 28, 38, 6);
  } else {   // a bunch of grapes and a leaf
    g.fillStyle = "#4e7a3a"; g.beginPath(); g.ellipse(W / 2 + 18, 34, 18, 10, -0.5, 0, 7); g.fill();
    g.fillStyle = "#5a3a6e";
    for (let j = 0; j < 5; j++) for (let i = 0; i < 5 - j; i++) { g.beginPath(); g.arc(W / 2 - (4 - j) * 6 + i * 12, 46 + j * 11, 6.5, 0, 7); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.3)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(W / 2 - 18 + i * 7, 48 + (i % 3) * 11, 2, 0, 7); g.fill(); }
  }
});
/** THE COURT seen through the gate passage: sunlit lawn, a fountain, the far range of the court under a blue sky */
const courtTex = () => paint(256, 360, (g, W, H) => {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.45); sky.addColorStop(0, "#8ab4e0"); sky.addColorStop(1, "#cfe0ee");
  g.fillStyle = sky; g.fillRect(0, 0, W, H * 0.45);
  g.fillStyle = "#d8c4a0"; g.fillRect(0, H * 0.22, W, H * 0.4);                    // the far range (stone)
  g.fillStyle = "#c9b18c"; for (let x = 0; x < W; x += 22) g.fillRect(x, H * 0.18, 12, H * 0.05);   // battlements
  g.fillStyle = "#5a6478"; for (let x = 10; x < W; x += 46) { g.fillRect(x, H * 0.3, 18, H * 0.1); g.fillRect(x, H * 0.46, 18, H * 0.1); }
  g.fillStyle = "#e0d0b0"; g.fillRect(0, H * 0.62, W, H * 0.06);                   // the path
  g.fillStyle = "#8aa85a"; g.fillRect(0, H * 0.68, W, H * 0.32);                   // the lawn
  g.fillStyle = "#e6dcc4"; g.fillRect(W * 0.42, H * 0.44, W * 0.16, H * 0.26);      // the fountain's canopy
  g.fillStyle = "#c8b896"; g.beginPath(); g.moveTo(W * 0.38, H * 0.45); g.lineTo(W * 0.5, H * 0.34); g.lineTo(W * 0.62, H * 0.45); g.fill();
  g.fillStyle = "rgba(255,248,230,0.25)"; g.fillRect(0, 0, W, H);
});
/** THE HERALDIC PANEL over the arch: four painted shields on a stone ground */
const armsTex = () => paint(320, 80, (g, W, H) => {
  g.fillStyle = NC.stone; g.fillRect(0, 0, W, H);
  g.strokeStyle = NC.stoneDark; g.lineWidth = 3; g.strokeRect(3, 3, W - 6, H - 6);
  const cols = [["#2a3a7a", "#c8a24a"], ["#a02a2a", "#c8a24a"], ["#c8a24a", "#2a3a7a"], ["#a02a2a", "#e8e0d0"]];
  for (let i = 0; i < 4; i++) {
    const cx = W * (0.125 + 0.25 * i), [a, b] = cols[i];
    g.fillStyle = a; g.beginPath(); g.moveTo(cx - 22, 14); g.lineTo(cx + 22, 14); g.lineTo(cx + 22, 42); g.quadraticCurveTo(cx + 20, 62, cx, 70); g.quadraticCurveTo(cx - 20, 62, cx - 22, 42); g.closePath(); g.fill();
    g.fillStyle = b; g.fillRect(cx - 22, 30, 44, 8); g.fillRect(cx - 4, 14, 8, 50);
  }
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildStreet(K: Kit) {
  const group = new THREE.Group(); group.name = "street";
  const Mk = maker(K, group), BT = new Batch();
  const mBrick = Mk.tex(brickTex({ seed: 201 }), 0.9), mBrick2 = Mk.tex(brickTex({ seed: 202, base: "#a85a40", soot: 0.15 }), 0.9);
  const mStone = Mk.tex(ashlarTex({ seed: 203, nx: 3, ny: 4 }), 0.9), mStonePlain = Mk.flat(NC.stone, 0.9), mStoneLo = Mk.flat(NC.stoneLo, 0.9);
  const mTile = Mk.tex(roofTilesTex(204), 0.85), mUnder = Mk.flat("#4a3a30", 0.9), mOak = Mk.flat("#5a3c28", 0.8), mOakHi = Mk.flat("#7a5236", 0.8);
  const mIron = Mk.flat(NC.iron, 0.5), mSide = Mk.flat("#c9b896", 0.9), mPlank = Mk.tex(plankTex("#6a4c36", 205), 0.85);
  const glassT = leadedTex({ w: 0.5, h: 0.8, q: 0.1, glass: "#8fa2b6", hi: "#b6c6d4", lo: "#6c7e94", lead: "#3a3a44" });
  glassT.wrapS = glassT.wrapT = THREE.RepeatWrapping; glassT.needsUpdate = true;
  const mGlass = new THREE.MeshBasicMaterial({ map: glassT, fog: false, color: "#ffffff" });
  const glass = (geo: THREE.BufferGeometry, name: string) => { const m = new THREE.Mesh(geo, mGlass); m.layers.set(NOINK); m.name = name; m.castShadow = false; m.receiveShadow = false; group.add(m); return m; };
  /** uv in metres / the glass tile (0.5 x 0.8) for a plane w x h */
  const glassPlane = (w: number, h: number) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 0.5, (uv.getY(i) * h) / 0.8); return g; };

  // =================================================================================================== the ground
  const X0 = WX, X1 = EX, Z0 = S.z0, Z1 = S.z1;
  Mk.mesh("street.cobbles", levelQuad(X0 - 0.3, X1 + 0.3, Z0 - 0.3, Z1 + 0.3, 0, (x, z) => [x / 1.4, -z / 1.4]), Mk.tex(roadSettsTex(206), 0.95), { cast: false });
  Mk.mesh("street.kennel", levelQuad(STRX - S.kennel / 2, STRX + S.kennel / 2, Z0, Z1, 0.0005, (x, z) => [(x - STRX + S.kennel / 2) / S.kennel, -z / 1.6]), Mk.tex(settsTex(207), 0.9), { cast: false });
  const mFlags = Mk.tex(flagsTex(208), 0.92);
  Mk.mesh("street.footW", levelQuad(X0, X0 + S.foot, Z0, Z1, 0.0008, (x, z) => [(x - X0) / 1.2, -z / 2.4]), mFlags, { cast: false });
  Mk.mesh("street.footE", levelQuad(X1 - S.foot, X1, Z0, Z1, 0.0008, (x, z) => [(x - X1) / 1.2, -z / 2.4]), mFlags, { cast: false });
  // the oak posts (square, a pyramid cap) guarding the east footway
  for (const z of S.posts.z) {
    const x = STRX + S.posts.x;
    BT.add(mOak, boxG(x - 0.09, x + 0.09, 0, S.posts.h, z - 0.09, z + 0.09));
    BT.add(mOak, new THREE.ConeGeometry(0.135, 0.14, 4).rotateY(Math.PI / 4).translate(x, S.posts.h + 0.07, z));
  }

  // =================================================================================================== the houses
  /** one town house, built in its own frame (front at z 0 facing +z, u 0..w along +x, depth into -z) and placed by
   *  `at` (its left end on the building line) and `yaw` */
  let seed = 300;
  const house = (at: [number, number], yaw: number, w: number, kind: Kind, gH: number, uH: number, jetty: number, gable: number, shop: "books" | "cloth" | "pots" | null, sign: number | null) => {
    const sd = seed++, r = rng(sd), D = 6.0, top0 = gH + uH;
    const M = new THREE.Matrix4().makeRotationY(yaw).setPosition(at[0], 0, at[1]);
    const W = (g: THREE.BufferGeometry) => g.applyMatrix4(M);
    const add = (m: THREE.Material, g: THREE.BufferGeometry) => BT.add(m, W(g));
    const one = (name: string, g: THREE.BufferGeometry, m: THREE.Material, o: { cast?: boolean; noink?: boolean } = {}) => Mk.mesh(name, W(g), m, o);
    const front = (y0: number, y1: number, z: number) => new THREE.PlaneGeometry(w, y1 - y0).translate(w / 2, (y0 + y1) / 2, z);
    const nm = `street.house${sd}`;
    // the body
    if (kind === "brick") {
      Mk.mesh(nm + ".body", tileUV(W(boxG(0, w, 0, top0, -D, 0)), 0.96, 0.68), sd % 2 ? mBrick : mBrick2, { cast: true });
      add(mStonePlain, boxG(-0.02, w + 0.02, gH - 0.06, gH + 0.12, -0.02, 0.07));                // string course
      for (const u of [0, w - 0.26]) add(mStonePlain, boxG(u, u + 0.26, 0, top0, -0.02, 0.035));  // quoin strips
    } else {
      one(nm + ".ground", boxG(0, w, 0, gH, -D, 0), mSide, { cast: true });
      one(nm + ".upper", boxG(0, w, gH, top0, -D, jetty), mSide, { cast: true });
      const pl = kind === "timber" ? ["#ece0c4", "#efe4cc", "#e8dabc"][sd % 3] : ["#e4c88e", "#e8c4ac", "#efe2c2"][sd % 3];
      if (kind === "timber") {
        one(nm + ".faceG", front(0, gH, 0.006), Mk.tex(timberTex(sd, w, gH, { studs: 0.9, braces: false, mid: false, plaster: pl }), 0.9), { cast: false });
        one(nm + ".faceU", front(gH, top0, jetty + 0.006), Mk.tex(timberTex(sd + 50, w, uH, { plaster: pl }), 0.9), { cast: false });
      } else {
        const mW = Mk.tex(washTex(sd, pl), 0.9);
        one(nm + ".faceG", front(0, gH, 0.006), mW, { cast: false });
        one(nm + ".faceU", front(gH, top0, jetty + 0.006), mW, { cast: false });
        for (const u of [0, w - 0.22]) add(mOak, boxG(u, u + 0.22, 0, gH, 0, 0.03));
      }
      if (jetty > 0) {   // the bressumer and the joist ends under the jetty
        add(mOak, boxG(-0.01, w + 0.01, gH - 0.02, gH + 0.2, jetty - 0.1, jetty + 0.03));
        for (let u = 0.2; u < w - 0.1; u += 0.42) add(mOak, boxG(u - 0.06, u + 0.06, gH - 0.14, gH - 0.02, 0, jetty - 0.02));
      }
    }
    const fz = kind === "brick" ? 0 : jetty;    // the upper front's z
    // the roof: a gable to the street (ridge along the depth) or the eaves to the street
    const o = 0.28;
    if (gable > 0) {
      const s = gable / (w / 2), Ye = top0 - s * o, Yr = top0 + gable, zf = kind === "brick" ? -0.05 : fz + 0.3, zb = -D - 0.2;
      add(mTile, quad4(new THREE.Vector3(-o, Ye, zf), new THREE.Vector3(w / 2, Yr, zf), new THREE.Vector3(w / 2, Yr, zb), new THREE.Vector3(-o, Ye, zb), 4, (w / 2 + o) / 0.9));
      add(mTile, quad4(new THREE.Vector3(w / 2, Yr, zf), new THREE.Vector3(w + o, Ye, zf), new THREE.Vector3(w + o, Ye, zb), new THREE.Vector3(w / 2, Yr, zb), 4, (w / 2 + o) / 0.9));
      add(mUnder, quad4(new THREE.Vector3(w / 2, Yr - 0.06, zf), new THREE.Vector3(-o, Ye - 0.06, zf), new THREE.Vector3(-o, Ye - 0.06, zb), new THREE.Vector3(w / 2, Yr - 0.06, zb)));
      add(mUnder, quad4(new THREE.Vector3(w + o, Ye - 0.06, zf), new THREE.Vector3(w / 2, Yr - 0.06, zf), new THREE.Vector3(w / 2, Yr - 0.06, zb), new THREE.Vector3(w + o, Ye - 0.06, zb)));
      // the gable's face (a triangle) and its barge boards
      const tri = new THREE.BufferGeometry();
      tri.setAttribute("position", new THREE.Float32BufferAttribute([0, top0, fz + 0.006, w, top0, fz + 0.006, w / 2, Yr, fz + 0.006], 3));
      tri.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2)); tri.computeVertexNormals();
      const triBack = new THREE.BufferGeometry();
      triBack.setAttribute("position", new THREE.Float32BufferAttribute([0, top0, -D, w / 2, Yr, -D, w, top0, -D], 3)); triBack.computeVertexNormals();
      add(mSide, triBack);
      if (kind === "brick") {
        // a SHAPED gable: brick, curved shoulders, a little pediment, stone copings
        const sh = new THREE.Shape();
        sh.moveTo(-0.1, top0); sh.lineTo(w + 0.1, top0); sh.lineTo(w + 0.1, top0 + 0.35);
        sh.quadraticCurveTo(w * 0.78, top0 + 0.4, w * 0.72, top0 + gable * 0.55); sh.lineTo(w * 0.64, top0 + gable * 0.58); sh.lineTo(w * 0.64, top0 + gable * 0.86);
        sh.lineTo(w / 2, top0 + gable * 1.08); sh.lineTo(w * 0.36, top0 + gable * 0.86); sh.lineTo(w * 0.36, top0 + gable * 0.58); sh.lineTo(w * 0.28, top0 + gable * 0.55);
        sh.quadraticCurveTo(w * 0.22, top0 + 0.4, -0.1, top0 + 0.35); sh.closePath();
        Mk.mesh(nm + ".gable", tileUV(W(new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: false, curveSegments: 6 }).translate(0, 0, -0.1)), 0.96, 0.68), sd % 2 ? mBrick : mBrick2, { cast: true });
        add(mStonePlain, boxG(w * 0.36 - 0.05, w * 0.64 + 0.05, top0 + gable * 0.86 - 0.04, top0 + gable * 0.86 + 0.06, -0.12, 0.16));
      } else {
        one(nm + ".gableFace", tri, Mk.tex(timberTex(sd + 90, w, gable, { triangle: true, plaster: kind === "timber" ? "#ece0c4" : "#efe2c2" }), 0.9), { cast: false });
        const L = Math.hypot(w / 2 + o, Yr - Ye), ang = Math.atan2(Yr - Ye, w / 2 + o);
        add(mOakHi, new THREE.BoxGeometry(L, 0.2, 0.05).rotateZ(ang).translate((-o + w / 2) / 2, (Ye + Yr) / 2 - 0.08, zf - 0.02));
        add(mOakHi, new THREE.BoxGeometry(L, 0.2, 0.05).rotateZ(-ang).translate((w / 2 + w + o) / 2, (Ye + Yr) / 2 - 0.08, zf - 0.02));
        add(mOak, boxG(-0.02, w + 0.02, top0 - 0.04, top0 + 0.14, fz - 0.02, fz + 0.12));       // the tie beam
      }
      // a chimney stack at the back of the ridge
      add(mBrick2, tileUV(boxG(w / 2 - 0.35, w / 2 + 0.35, Yr - 1.2, Yr + 1.1, -D * 0.62 - 0.35, -D * 0.62 + 0.35), 0.96, 0.68));
    } else {
      const rise = 2.5, Ye = top0 - 0.12, zf = fz + o, zr = -2.8;
      add(mTile, quad4(new THREE.Vector3(-0.05, Ye, zf), new THREE.Vector3(w + 0.05, Ye, zf), new THREE.Vector3(w + 0.05, top0 + rise, zr), new THREE.Vector3(-0.05, top0 + rise, zr), w / 1.0, 3.2));
      add(mTile, quad4(new THREE.Vector3(w + 0.05, Ye, -D - 0.2), new THREE.Vector3(-0.05, Ye, -D - 0.2), new THREE.Vector3(-0.05, top0 + rise, zr), new THREE.Vector3(w + 0.05, top0 + rise, zr), w / 1.0, 3.2));
      add(mUnder, quad4(new THREE.Vector3(w + 0.05, Ye - 0.05, zf), new THREE.Vector3(-0.05, Ye - 0.05, zf), new THREE.Vector3(-0.05, top0 + rise - 0.05, zr), new THREE.Vector3(w + 0.05, top0 + rise - 0.05, zr)));
      add(mOak, boxG(-0.02, w + 0.02, top0 - 0.16, top0, fz - 0.02, fz + 0.1));                 // the eaves board
      for (const u of [0, w]) {   // the gable ends (seen over a lower neighbour)
        const t = new THREE.BufferGeometry();
        const pts = u === 0 ? [0, top0, fz, 0, top0 + rise, zr, 0, top0, -D] : [w, top0, fz, w, top0, -D, w, top0 + rise, zr];
        t.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); t.computeVertexNormals(); add(mSide, t);
      }
      add(mBrick2, tileUV(boxG(w * 0.7 - 0.3, w * 0.7 + 0.3, top0 + 0.6, top0 + rise + 1.0, zr - 0.3, zr + 0.3), 0.96, 0.68));
    }
    // THE WINDOWS: oak-framed leaded casements (an oriel on a timber house's upper floor), a small one in the gable
    const casement = (cx: number, y0: number, y1: number, cw: number, z: number, lights: number, oriel = 0) => {
      const f = 0.07, d = 0.06, zz = z + oriel;
      if (oriel > 0) {
        add(mOak, boxG(cx - cw / 2 - 0.08, cx + cw / 2 + 0.08, y0 - 0.12, y0, z, zz + 0.06));
        add(mOak, boxG(cx - cw / 2 - 0.08, cx + cw / 2 + 0.08, y1, y1 + 0.1, z, zz + 0.06));
        for (const sx of [-1, 1]) { const gx = cx + sx * (cw / 2); const sg = glassPlane(oriel, y1 - y0).rotateY(sx * Math.PI / 2).translate(gx, (y0 + y1) / 2, z + oriel / 2); glass(W(sg), nm + ".glass"); }
      }
      add(mOak, boxG(cx - cw / 2 - f, cx - cw / 2, y0, y1, zz, zz + d)); add(mOak, boxG(cx + cw / 2, cx + cw / 2 + f, y0, y1, zz, zz + d));
      add(mOak, boxG(cx - cw / 2 - f, cx + cw / 2 + f, y0 - f, y0, zz, zz + d + 0.03)); add(mOak, boxG(cx - cw / 2 - f, cx + cw / 2 + f, y1, y1 + f, zz, zz + d));
      for (let i = 1; i < lights; i++) { const x = cx - cw / 2 + (cw * i) / lights; add(mOak, boxG(x - 0.03, x + 0.03, y0, y1, zz, zz + d * 0.8)); }
      glass(W(glassPlane(cw, y1 - y0).translate(cx, (y0 + y1) / 2, zz + 0.012)), nm + ".glass");
    };
    const upY0 = gH + 0.75, upY1 = gH + Math.min(uH - 0.45, 1.95);
    if (kind === "timber") casement(w / 2, upY0, upY1, Math.min(2.2, w * 0.42), fz, 4, 0.32);
    else { for (const cx of w > 5 ? [w * 0.27, w * 0.73] : [w / 2]) casement(cx, upY0, upY1, 1.05, fz, 2); }
    if (gable > 1.6 && kind !== "brick") casement(w / 2, top0 + 0.45, top0 + 1.15, 0.7, fz, 2);
    if (kind === "brick" && gable > 1.6) casement(w / 2, top0 + 0.55, top0 + 1.25, 0.6, 0.12, 2);
    // THE GROUND FLOOR: a shop front (the counter let down, the canopy propped up, the wares inside) and a plank door
    const doorU = w > 5 ? w - 1.25 : w - 1.05, dw = 0.95, dh = 2.0;
    add(mOak, boxG(doorU - dw / 2 - 0.09, doorU - dw / 2, 0, dh + 0.09, 0, 0.05)); add(mOak, boxG(doorU + dw / 2, doorU + dw / 2 + 0.09, 0, dh + 0.09, 0, 0.05));
    add(mOak, boxG(doorU - dw / 2 - 0.09, doorU + dw / 2 + 0.09, dh, dh + 0.12, 0, 0.06));
    one(nm + ".door", new THREE.PlaneGeometry(dw, dh).translate(doorU, dh / 2, 0.012), mPlank, { cast: false });
    add(mStoneLo, boxG(doorU - dw / 2 - 0.12, doorU + dw / 2 + 0.12, 0, 0.12, 0, 0.32));            // the doorstep
    if (shop) {
      const sx0 = 0.45, sx1 = doorU - dw / 2 - 0.4, sy0 = 0.78, sy1 = 2.05, cx = (sx0 + sx1) / 2, sw = sx1 - sx0;
      one(nm + ".wares", new THREE.PlaneGeometry(sw, sy1 - sy0).translate(cx, (sy0 + sy1) / 2, 0.01), Mk.basic("#ffffff", { map: shopTex(sd, shop) }), { cast: false, noink: true });
      add(mOak, boxG(sx0 - 0.1, sx0, 0, sy1 + 0.1, 0, 0.06)); add(mOak, boxG(sx1, sx1 + 0.1, 0, sy1 + 0.1, 0, 0.06));
      add(mOak, boxG(sx0 - 0.1, sx1 + 0.1, sy1, sy1 + 0.12, 0, 0.07));
      add(mOakHi, boxG(sx0, sx1, sy0 - 0.05, sy0, 0, 0.5));                                         // the counter (lower shutter, let down)
      add(mOak, boxG(sx0 + 0.1, sx0 + 0.16, 0.3, sy0 - 0.05, 0.38, 0.44)); add(mOak, boxG(sx1 - 0.16, sx1 - 0.1, 0.3, sy0 - 0.05, 0.38, 0.44));   // its legs
      add(mOak, boxG(sx0, sx1, 0, sy0 - 0.05, 0.0, 0.03));                                         // the stall board under it
      const can = new THREE.BoxGeometry(sw, 0.04, 0.62).translate(0, 0, 0.31).rotateX(0.3).translate(cx, sy1 + 0.28, 0.04);
      add(mOakHi, can);                                                                             // the canopy (upper shutter, propped)
      // a few wares out on the counter
      const rr = rng(sd + 7);
      for (let i = 0; i < 4; i++) { const x = sx0 + 0.25 + (sw - 0.5) * (i / 3); add(shop === "pots" ? Mk.flat(["#b0704a", "#8a5a3a", "#c49a6a"][i % 3], 0.6) : Mk.flat(["#7a3a2a", "#4a5a6a", "#8a6a3a", "#5a3a4a"][i % 4], 0.8), shop === "pots" ? new THREE.CylinderGeometry(0.07 + 0.03 * rr(), 0.06, 0.16 + 0.08 * rr(), 10).translate(x, sy0 + 0.1, 0.25) : boxG(x - 0.12, x + 0.12, sy0, sy0 + 0.06 + 0.04 * rr(), 0.12, 0.36)); }
    } else {
      casement(w * 0.32, 0.95, 2.05, 1.1, 0, 2);
    }
    // the hanging sign on its iron
    if (sign !== null) {
      const su = 0.9, sy = S.signs.y;
      add(mIron, boxG(su - 0.025, su + 0.025, sy - 0.025, sy + 0.025, fz, fz + 1.05));
      add(mIron, new THREE.BoxGeometry(0.02, 0.02, 0.7).rotateX(-0.6).translate(su, sy - 0.2, fz + 0.3));
      const sg = new THREE.PlaneGeometry(0.62, 0.5).rotateY(-Math.PI / 2).translate(su, sy - 0.32, fz + 0.72);
      one(nm + ".sign", sg, Mk.tex(signTex(sign), 0.8, THREE.DoubleSide), { cast: true });
      for (const z of [0.47, 0.97]) add(mIron, boxG(su - 0.006, su + 0.006, sy - 0.07, sy, fz + z - 0.006, fz + z + 0.006));
    }
    void r;
  };
  // the east row (fronts on x = EX, facing -x: yaw -PI/2, the left end at the smaller z)
  const shops: ("books" | "cloth" | "pots" | null)[] = ["books", null, "cloth", "pots", null, "books", null, "cloth"];
  const signs = new Map<number, number>([[2, 0], [4, 1], [6, 2]]);
  for (const [i, [z0, z1, kind, g, u, j, gb]] of S.east.entries()) house([EX, z0], -Math.PI / 2, z1 - z0, kind, g, u, j, gb, shops[i % shops.length], signs.get(i) ?? null);
  // the west houses after the range (fronts on x = WX facing +x: yaw PI/2, the left end at the larger z)
  for (const [i, [z0, z1, kind, g, u, j, gb]] of S.west.entries()) house([WX, z1], Math.PI / 2, z1 - z0, kind, g, u, j, gb, i === 0 ? "pots" : null, null);
  // the ends: the street bends, houses across it (the far end facing +z, the near end facing -z)
  house([WX - 2.2, Z0], 0, 5.6, "timber", 2.8, 2.6, 0.45, 2.8, "cloth", null);
  house([WX + 3.4, Z0], 0, 5.8, "brick", 3.0, 2.9, 0, 3.2, null, null);
  house([EX + 2.2, Z1], Math.PI, 5.6, "plaster", 2.9, 2.7, 0.4, 0, "books", null);
  house([EX - 3.4, Z1], Math.PI, 5.8, "timber", 2.8, 2.6, 0.45, 2.7, null, null);

  // =================================================================================================== the college range (west)
  const R = S.range, rx = WX;
  for (const [za, zb] of [[G.z0, Z0 - 0.4], [S.range.rangeTo, G.z1]] as [number, number][]) {      // a = the larger z: faces +x
    const a: [number, number] = [rx, za], b: [number, number] = [rx, zb], len = za - zb, holes: Hole[] = [];
    for (let u = 1.6; u < len - 1.0; u += 3.1) { holes.push({ u0: u - R.w / 2, u1: u + R.w / 2, y0: R.gy0, y1: R.gy1 }); holes.push({ u0: u - R.w / 2, u1: u + R.w / 2, y0: R.fy0, y1: R.fy1 }); }
    Mk.mesh("street.range", holedWall(a, b, 0, R.h, holes, 0.96, 0.68), mBrick, { cast: true });
    BT.add(mStone, tileUV(boxG(rx - 0.02, rx + 0.07, 0, 0.45, zb, za), 0.6));
    BT.add(mStonePlain, boxG(rx - 0.02, rx + 0.09, 3.3, 3.48, zb, za));
    BT.add(mStonePlain, boxG(rx - 0.25, rx + 0.1, R.h - 0.05, R.h + 0.18, zb, za));
    for (const h of holes) {
      const zc = za - (h.u0 + h.u1) / 2, w = h.u1 - h.u0, fw = 0.11;
      BT.add(mStonePlain, boxG(rx - 0.01, rx + 0.07, h.y0 - fw, h.y1 + fw, zc + w / 2, zc + w / 2 + fw));
      BT.add(mStonePlain, boxG(rx - 0.01, rx + 0.07, h.y0 - fw, h.y1 + fw, zc - w / 2 - fw, zc - w / 2));
      BT.add(mStonePlain, boxG(rx - 0.01, rx + 0.1, h.y0 - fw, h.y0, zc - w / 2 - fw, zc + w / 2 + fw));
      BT.add(mStonePlain, boxG(rx - 0.01, rx + 0.12, h.y1, h.y1 + fw + 0.04, zc - w / 2 - fw - 0.07, zc + w / 2 + fw + 0.07));
      // the reveal and the glass set back in it, a mullion
      BT.add(mStoneLo, boxG(rx - 0.2, rx, h.y1 - 0.01, h.y1, zc - w / 2, zc + w / 2)); BT.add(mStoneLo, boxG(rx - 0.2, rx, h.y0, h.y0 + 0.01, zc - w / 2, zc + w / 2));
      BT.add(mStoneLo, boxG(rx - 0.2, rx, h.y0, h.y1, zc + w / 2 - 0.01, zc + w / 2)); BT.add(mStoneLo, boxG(rx - 0.2, rx, h.y0, h.y1, zc - w / 2, zc - w / 2 + 0.01));
      glass(glassPlane(w, h.y1 - h.y0).rotateY(Math.PI / 2).translate(rx - 0.18, (h.y0 + h.y1) / 2, zc), "street.range.glass");
      BT.add(mStonePlain, boxG(rx - 0.19, rx - 0.1, h.y0, h.y1, zc - 0.04, zc + 0.04));
    }
    BT.add(mTile, quad4(new THREE.Vector3(rx - 0.2, R.h, za), new THREE.Vector3(rx - 0.2, R.h, zb), new THREE.Vector3(rx - 4.0, R.h + 3.2, zb), new THREE.Vector3(rx - 4.0, R.h + 3.2, za), len / 2, 2.8));
    for (let z = zb + 3.0; z < za - 1.5; z += 7.5) BT.add(mBrick2, tileUV(boxG(rx - 2.6, rx - 1.8, R.h + 1.0, R.h + 4.4, z - 0.55, z + 0.55), 0.96, 0.68));
  }

  // =================================================================================================== the gatehouse
  {
    const gx = STRX + G.x, gz0 = G.z0, gz1 = G.z1, A = G.arch, aw = A.w, top = A.h + A.rise, inner = gx - 0.25, back = gx - G.depth;
    const a: [number, number] = [gx, gz1], b: [number, number] = [gx, gz0], U = (z: number) => gz1 - z;
    const holes: Hole[] = [
      { u0: U(A.z) - aw / 2, u1: U(A.z) + aw / 2, y0: 0, y1: top, arch: A.rise },
      { u0: U(A.z) - 1.2, u1: U(A.z) + 1.2, y0: 6.1, y1: 7.6 },
      { u0: U(A.z) - 1.0, u1: U(A.z) + 1.0, y0: 8.7, y1: 10.0 },
    ];
    Mk.mesh("street.gate.front", holedWall(a, b, 0, G.h, holes, 0.96, 0.68), mBrick, { cast: true });
    // the masses behind the front: either side of the passage and over it
    Mk.mesh("street.gate.massN", tileUV(boxG(back, inner, 0, G.h, gz0, A.z - aw / 2), 0.96, 0.68), mBrick, { cast: true });
    Mk.mesh("street.gate.massS", tileUV(boxG(back, inner, 0, G.h, A.z + aw / 2, gz1), 0.96, 0.68), mBrick, { cast: true });
    Mk.mesh("street.gate.massTop", tileUV(boxG(back, inner, top, G.h, A.z - aw / 2, A.z + aw / 2), 0.96, 0.68), mBrick, { cast: true });
    // the passage: stone walls, a ribbed ceiling, cobbles, the great gates folded back, the sunny court at the far end
    const mPass = Mk.tex(ashlarTex({ seed: 209, nx: 3, ny: 4, base: "#cfc2a4", lo: "#b4a688" }), 0.9);
    Mk.mesh("street.gate.passageN", wallQuad([back, A.z - aw / 2 + 0.002], [gx + 0.001, A.z - aw / 2 + 0.002], 0, top, { tileU: 1.8, vTile: 1.28 }), mPass, { cast: false });
    Mk.mesh("street.gate.passageS", wallQuad([gx + 0.001, A.z + aw / 2 - 0.002], [back, A.z + aw / 2 - 0.002], 0, top, { tileU: 1.8, vTile: 1.28 }), mPass, { cast: false });
    Mk.mesh("street.gate.ceiling", new THREE.PlaneGeometry(G.depth, aw).rotateX(Math.PI / 2).translate((back + gx) / 2, top - 0.002, A.z), mStoneLo, { cast: false });
    for (let x = back + 0.8; x < gx - 0.3; x += 1.3) BT.add(mStonePlain, boxG(x - 0.09, x + 0.09, top - 0.2, top, A.z - aw / 2, A.z + aw / 2));
    Mk.mesh("street.gate.floor", levelQuad(back, gx, A.z - aw / 2, A.z + aw / 2, 0, (x, z) => [x / 1.4, -z / 1.4]), Mk.tex(roadSettsTex(210), 0.95), { cast: false });
    Mk.mesh("street.gate.court", new THREE.PlaneGeometry(aw + 0.02, top + 0.02).rotateY(Math.PI / 2).translate(back + 0.01, top / 2, A.z), Mk.basic("#ffffff", { map: courtTex() }), { cast: false, noink: true });
    const mGate = Mk.tex(plankTex("#5e4430", 211), 0.85);
    for (const sz of [-1, 1]) {
      const z = A.z + sz * (aw / 2 - 0.08);
      Mk.mesh("street.gate.leaf", boxG(gx - 0.55 - aw / 2, gx - 0.55, 0.02, A.h - 0.05, z - 0.06, z + 0.06), [mOak, mOak, mOak, mOak, mGate, mGate], { cast: true });
    }
    // the stone dressings: the arch's surround, string courses, the heraldic panel, the windows' frames, the parapet
    const zc = A.z;
    BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.1, 0, A.h + 0.1, zc + aw / 2, zc + aw / 2 + 0.24));
    BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.1, 0, A.h + 0.1, zc - aw / 2 - 0.24, zc - aw / 2));
    BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.14, top + 0.05, top + 0.25, zc - aw / 2 - 0.4, zc + aw / 2 + 0.4));
    for (const y of [5.75, 8.3]) BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.1, y - 0.08, y + 0.1, gz0, gz1));
    Mk.mesh("street.gate.arms", new THREE.PlaneGeometry(3.0, 0.75).rotateY(Math.PI / 2).translate(gx + 0.015, 5.2, zc), Mk.tex(armsTex(), 0.85), { cast: false });
    for (const h of holes.slice(1)) {
      const z0 = gz1 - h.u1, z1 = gz1 - h.u0, w = z1 - z0, fw = 0.12;
      BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.08, h.y0 - fw, h.y1 + fw, z1, z1 + fw)); BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.08, h.y0 - fw, h.y1 + fw, z0 - fw, z0));
      BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.11, h.y0 - fw, h.y0, z0 - fw, z1 + fw)); BT.add(mStonePlain, boxG(gx - 0.01, gx + 0.13, h.y1, h.y1 + fw + 0.04, z0 - fw - 0.08, z1 + fw + 0.08));
      BT.add(mStoneLo, boxG(gx - 0.25, gx, h.y1 - 0.01, h.y1, z0, z1)); BT.add(mStoneLo, boxG(gx - 0.25, gx, h.y0, h.y0 + 0.01, z0, z1));
      BT.add(mStoneLo, boxG(gx - 0.25, gx, h.y0, h.y1, z0, z0 + 0.01)); BT.add(mStoneLo, boxG(gx - 0.25, gx, h.y0, h.y1, z1 - 0.01, z1));
      glass(glassPlane(w, h.y1 - h.y0).rotateY(Math.PI / 2).translate(gx - 0.2, (h.y0 + h.y1) / 2, (z0 + z1) / 2), "street.gate.glass");
      for (let i = 1; i < 3; i++) { const z = z0 + (w * i) / 3; BT.add(mStonePlain, boxG(gx - 0.21, gx - 0.12, h.y0, h.y1, z - 0.04, z + 0.04)); }
      BT.add(mStonePlain, boxG(gx - 0.21, gx - 0.12, (h.y0 + h.y1) / 2 + 0.15, (h.y0 + h.y1) / 2 + 0.23, z0, z1));
    }
    BT.add(mStonePlain, boxG(gx - 0.3, gx + 0.1, G.h - 0.05, G.h + 0.2, gz0, gz1));
    for (let z = gz0 + 0.45; z < gz1 - 0.4; z += 1.05) BT.add(mBrick, tileUV(boxG(gx - 0.3, gx + 0.08, G.h + 0.2, G.h + 0.85, z, z + 0.55), 0.96, 0.68));
    // the four octagonal turrets with stone bands, a corbelled top and battlements
    const T = G.turret;
    for (const [tx, tz] of [[gx + T.out, gz0], [gx + T.out, gz1], [back + 0.5, gz0], [back + 0.5, gz1]] as [number, number][]) {
      BT.add(mBrick, tileUV(new THREE.CylinderGeometry(T.r, T.r, T.h, 8).rotateY(Math.PI / 8).translate(tx, T.h / 2, tz), 0.96, 0.68));
      for (const y of [5.75, 8.3]) BT.add(mStonePlain, new THREE.CylinderGeometry(T.r + 0.05, T.r + 0.05, 0.18, 8).rotateY(Math.PI / 8).translate(tx, y, tz));
      BT.add(mStonePlain, new THREE.CylinderGeometry(T.r + 0.16, T.r, 0.4, 8).rotateY(Math.PI / 8).translate(tx, T.h - 0.2, tz));
      BT.add(mBrick, tileUV(new THREE.CylinderGeometry(T.r + 0.16, T.r + 0.16, 0.25, 8).rotateY(Math.PI / 8).translate(tx, T.h + 0.12, tz), 0.96, 0.68));
      for (let k = 0; k < 8; k += 2) { const ang = (k / 8) * Math.PI * 2 + Math.PI / 8; BT.add(mBrick, tileUV(new THREE.BoxGeometry(0.5, 0.55, 0.22).rotateY(-ang).translate(tx + Math.cos(ang) * (T.r + 0.05), T.h + 0.52, tz + Math.sin(ang) * (T.r + 0.05)), 0.96, 0.68)); }
      // arrow-slit windows up the shaft (dark)
      for (const y of [3.2, 6.9, 9.6, 12.0]) BT.add(mUnder, boxG(tx + T.r * 0.9, tx + T.r * 0.96, y, y + 0.7, tz - 0.06, tz + 0.06));
    }
  }

  // =================================================================================================== the tower beyond the near end
  {
    const tx = STRX + 1.4, tz = Z1 + 13, w = 5.0, h = 22;
    BT.add(mStone, tileUV(boxG(tx - w / 2, tx + w / 2, 0, h, tz - w / 2, tz + w / 2), 1.8, 1.28));
    for (const sx of [-1, 1]) BT.add(mStone, tileUV(boxG(tx + sx * (w / 2) - 0.35, tx + sx * (w / 2) + 0.35, 0, h - 1.5, tz - w / 2 - 0.4, tz - w / 2 + 0.2), 1.8, 1.28));
    BT.add(mUnder, boxG(tx - 0.9, tx + 0.9, h - 6.5, h - 2.2, tz - w / 2 - 0.01, tz - w / 2 + 0.05));     // the belfry opening
    for (let x = tx - w / 2 + 0.2; x < tx + w / 2; x += 0.9) BT.add(mStonePlain, boxG(x, x + 0.45, h, h + 0.6, tz - w / 2, tz - w / 2 + 0.3));
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) BT.add(mStonePlain, new THREE.ConeGeometry(0.4, 2.6, 4).rotateY(Math.PI / 4).translate(tx + px * (w / 2 - 0.3), h + 1.3, tz + pz * (w / 2 - 0.3)));
  }
  BT.flush(group, "street.parts");
  Mk.mesh("street.beyond", levelQuad(STRX - 60, STRX + 60, -80, 80, -0.02, (x, z) => [x / 3, -z / 3]), Mk.flat("#9a9478", 0.95), { cast: false });

  // =================================================================================================== the sky and the light
  const sky = skyDome(new THREE.Vector3(STRX, 0, -4), SKY, (g, W, H) => {
    const r = rng(212), elY = (el: number) => ((90 - el) / 180) * H;
    for (let i = 0; i < 22; i++) { const x = W * r(), y = elY(12 + 30 * r()), s = W * (0.012 + 0.02 * r()); for (let k = 0; k < 5; k++) blotch(g, x + (k - 2) * s * 0.8, y + (r() - 0.5) * s * 0.4, s * (0.7 + 0.5 * r()), "#ffffff", 0.5); }
  });
  group.add(sky);
  lightRig(group, { dir: S.sun, k: 3.0, col: "#fff0d6", at: [STRX - 0.5, 0, -4], half: 19, hemi: ["#d2e0ee", "#a89a7c", 1.0], point: { col: "#ffffff", k: 0, at: [STRX, 2, 0], dist: 1 } });
  return {
    group,
    cast(): Partial<CastLight> { return CAST; },
  };
}

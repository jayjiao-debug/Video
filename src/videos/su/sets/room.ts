// THE ROOM (place "room", island x 200): inside the new house at evening (PLAN 1, 8E). WP2a's set; the exports are the
// contract of sets/index.ts: ROOM_LOOK, ROOM_PARAMS, buildRoom(K) -> { group, view, setParam }. Every place number is
// layout/room.ts (ROOM_SET, ROOM); its header has the plan.
//
// WHAT THERE IS
//   - a timber room: pale fresh boards to the waist rail, cream plaster above, a frieze board, posts, a boarded ceiling
//     on chunky beams, a board floor;
//   - THE BIG LATTICE WINDOW in the back wall right of the middle: an open step lattice (it casts its pattern with the
//     low gold sun onto the desk and the floor), the gold evening outside it (a glowing painted card: the sky, the low
//     sun, a bamboo silhouette), warm light shafts in the air; a small high lattice window in the left wall (a second
//     shaft); the DOORWAY in the right wall onto the dim veranda (a painted card);
//   - the BED SCREEN in the back right corner (three panels, an ink landscape), a shelf unit with scroll boxes and books
//     on the right wall, a hanging scroll over the bench, a tall lamp stand right of the desk, packed bundles, baskets
//     and a rolled mat along the left wall (they are moving in: E);
//   - param `sun` 0..1: the gold sun through the windows (its light, the shafts, the window's glow).
// INK / FLICKER: boards, plaster, lattices, the screen's painting, books and the scroll are PAINT; inked geometry is
// chunky (posts 16 cm, beams 18 cm, frames 8 cm); the dressing is props-kit Parts; the window cards, the shafts and the
// doorway card are NOINK.
// SET vs PROP: the desk, the cushion, the brush and ink stone, the letter, the trunks, the robes and the bench are WP3's
// props (PLAN 4): the set leaves their marks clear (ROOM.desk / sit / trunks / robes / bench / kids / wife).
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, Batch, NOINK } from "../../../kit/sets/okit";
import { ROOM_SET as S, ROOM, RX } from "../layout/room";
import type { PlaceLook, ParamValue } from "./index";
import { maker, lathe, bar, shade, wallQuad, ceilQuad, levelQuad, uvRect } from "./parts/common";
import { V3, boardTex, boxM, blobG } from "./parts/town";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.56, 0.42, 0.3]], [-10, [0.7, 0.55, 0.4]], [4, [0.9, 0.78, 0.62]], [30, [0.86, 0.76, 0.64]], [90, [0.78, 0.7, 0.62]]],
  boxes: [{ az: -90, el: 18, rot: 0, w: 34, h: 20, soft: 12, col: [1.0, 0.8, 0.5] }],
};
/** EVENING INSIDE: the gold low sun through the lattice behind him, a warm bright room; the figures' key from the front
 *  left (the room's warm bounce) so faces read; held under 1 */
export const ROOM_LOOK: PlaceLook = {
  bg: "#e8c890",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.6, color: "#4a3238" },
  cast: {
    key: [-0.35, 0.58, 0.74], tint: [1.0, 0.88, 0.7], tintK: 0.85, gain: 0.95, grad: 0.2, bodyGrad: 0.16, sideTint: [1.0, 0.86, 0.66],
    shade: [1.06, 0.92, 1.16], shadeK: 0.34, wrap: [30, 58], edge: 0.16, broad: 0.1, bodySat: 0.14, sheen: 0.08, lift: 0.02, contactLen: 0.35,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.38,
};
/** the per-frame dressing: sun 0..1 (the gold evening sun through the windows: its light, the shafts, the glow) */
export const ROOM_PARAMS: Record<string, ParamValue> = { sun: 1 };

const COL = {
  board: "#e2c08e", boardLo: "#c49e6c", joint: "#9a7650", plaster: "#f2e6cc", timber: "#c89a64", timberLo: "#9a7046", timberHi: "#e0b880",
  floor: "#d2a872", floorLo: "#b08458", ceiling: "#d8b482", beam: "#b08050",
  gold: "#ffcf7a", goldHi: "#fff0c0", sky: "#f6b866", dusk: "#e8905a", bamboo: "#6a5a3e",
  cloth: ["#4a6a8a", "#a85a48", "#6a8a5a", "#c8a050", "#7a5a7a"], basket: "#c8a26a", mat: "#d8bf7a", paper: "#f2e8d2", ink: "#2e2a2e",
  screen: "#5a3e2e", book: ["#3e5a7a", "#8a3a32", "#5a6a4a", "#b08a3e", "#4a3a5a", "#e8dcc0"], lamp: "#5a4636",
};
const L = (x: number) => RX + x;

// ---------------------------------------------------------------------------------------------------- the paintings
/** THE WALL (a 1 m tile across, the full height up): pale vertical boards to the waist rail, the rail, cream plaster
 *  above, the frieze board at the top */
const wallTex = () => paint(256, 742, (g, W, H) => {
  const r = rng(401), Y = (y: number) => H * (1 - y / S.wallH), m = H / S.wallH;
  g.fillStyle = COL.plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) { const x = W * r(), y = Y(1.0 + 1.7 * r()); for (const dx of [-W, 0, W]) blotch(g, x + dx, y, 30 + 30 * r(), r() < 0.5 ? "#fffaf0" : "#dccdae", 0.12); }
  // the boards (two to a metre) up to the rail
  const y0 = Y(0.95);
  for (let i = 0; i < 2; i++) {
    g.fillStyle = shade(COL.board, (r() - 0.5) * 0.08); g.fillRect((i * W) / 2, y0, W / 2, H - y0);
    g.strokeStyle = css(COL.boardLo, 0.4); g.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) { const x = (i * W) / 2 + (W / 2) * (0.2 + 0.6 * r()); g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 4, y0 + (H - y0) * 0.3, x - 4, y0 + (H - y0) * 0.7, x, H); g.stroke(); }
    g.fillStyle = COL.joint; g.fillRect((i * W) / 2 - 1, y0, 3, H - y0);
  }
  g.fillStyle = "#8a6a4a"; g.fillRect(0, H - 0.1 * m, W, 0.1 * m);                                  // the skirting
  const rail = (ya: number, yb: number) => { g.fillStyle = COL.timber; g.fillRect(0, Y(yb), W, (yb - ya) * m); g.fillStyle = COL.timberHi; g.fillRect(0, Y(yb), W, 3); g.fillStyle = COL.timberLo; g.fillRect(0, Y(ya) - 3, W, 3); };
  rail(0.9, 1.0); rail(S.wallH - 0.2, S.wallH);
}, true);
/** an OPEN LATTICE (alpha: the cells see through): a step lattice of pale bars in a frame; w x h m */
const latticeTex = (wm: number, hm: number, cell: number) => paint(Math.round(wm * 400), Math.round(hm * 400), (g, W, H) => {
  const m = W / wm, bw = 0.032 * m, fr = 0.07 * m, nx = Math.max(2, Math.round(wm / cell)), ny = Math.max(2, Math.round(hm / cell)), cx = (W - 2 * fr) / nx, cy = (H - 2 * fr) / ny;
  g.clearRect(0, 0, W, H);
  const bar = (x: number, y: number, w: number, h: number) => { g.fillStyle = COL.timber; g.fillRect(x, y, w, h); g.fillStyle = COL.timberLo; g.fillRect(x, y + h - 2, w, 2); };
  for (let i = 1; i < nx; i++) bar(fr + i * cx - bw / 2, fr, bw, H - 2 * fr);
  for (let j = 1; j < ny; j++) bar(fr, fr + j * cy - bw / 2, W - 2 * fr, bw);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = fr + i * cx, y = fr + j * cy;
    if ((i + j) % 2 === 0) bar(x + cx * 0.28, y + cy * 0.5 - bw / 2, cx * 0.44, bw); else bar(x + cx * 0.5 - bw / 2, y + cy * 0.28, bw, cy * 0.44);
  }
  g.fillStyle = COL.timber; g.fillRect(0, 0, W, fr); g.fillRect(0, H - fr, W, fr); g.fillRect(0, 0, fr, H); g.fillRect(W - fr, 0, fr, H);
  g.fillStyle = COL.timberLo; g.fillRect(fr - 3, fr - 3, W - 2 * fr + 6, 3); g.fillRect(fr - 3, fr - 3, 3, H - 2 * fr + 6);
});
/** THE GOLD EVENING outside a window (the card's glow): a warm sky, the low sun's bloom, a bamboo spray silhouette */
const eveningTex = (seed: number, sunX: number) => paint(512, 512, (g, W, H) => {
  const r = rng(seed), gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#f8b860"); gr.addColorStop(0.55, "#f0a048"); gr.addColorStop(1, "#e08848");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const sg = g.createRadialGradient(W * sunX, H * 0.62, 0, W * sunX, H * 0.62, W * 0.55); sg.addColorStop(0, "rgba(255,236,170,1)"); sg.addColorStop(0.2, "rgba(255,210,120,0.75)"); sg.addColorStop(1, "rgba(255,190,100,0)");
  g.fillStyle = sg; g.fillRect(0, 0, W, H);
  // far hills (soft), a bamboo spray coming in from one side
  g.fillStyle = "rgba(214,150,96,0.55)"; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, H * 0.8 - 30 * Math.sin(x / 70 + seed) - 16 * Math.sin(x / 23)); g.lineTo(W, H); g.closePath(); g.fill();
  g.strokeStyle = css(COL.bamboo, 0.55); g.lineWidth = 7; const bx = W * (1 - sunX) * 0.4; g.beginPath(); g.moveTo(bx, H); g.quadraticCurveTo(bx + 20, H * 0.5, bx + 60, 0); g.stroke();
  for (let i = 0; i < 60; i++) { const y = H * 0.6 * r(), x = bx + 40 * (1 - y / H) + (r() - 0.3) * 120; g.fillStyle = css(COL.bamboo, 0.45); g.beginPath(); g.ellipse(x, y, 22, 4, (r() - 0.5) * 1.4, 0, 7); g.fill(); }
});
/** a shaft of sun in the air (along its length u: from the window, fading; across v: soft edges, lattice streaks) */
const shaftTex = () => paint(256, 128, (g, W, H) => {
  const r = rng(409);
  for (let y = 0; y < H; y++) {
    const v = y / H, edge = Math.sin(Math.PI * v), streak = 0.65 + 0.35 * Math.sin(v * 38 + 1.3);
    const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, css(COL.goldHi, 0.9 * edge * streak)); gr.addColorStop(0.6, css(COL.gold, 0.35 * edge * streak)); gr.addColorStop(1, css(COL.gold, 0));
    g.fillStyle = gr; g.fillRect(0, y, W, 1);
  }
  void r;
});
/** the folding screen's painting (ink landscape on silk: mountains, mist, a pine, a boat) */
const screenTex = () => paint(768, 512, (g, W, H) => {
  const r = rng(411); g.fillStyle = "#efe2c4"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 3; k++) {
    g.fillStyle = css(k === 0 ? "#b8b0a0" : k === 1 ? "#8a8478" : "#5a5650", 0.8); g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) g.lineTo(x, H * (0.35 + 0.17 * k) - (60 - 12 * k) * Math.abs(Math.sin(x / (90 + 40 * k) + k * 2)) - 20 * Math.sin(x / 31 + k));
    g.lineTo(W, H); g.closePath(); g.fill();
    g.fillStyle = "rgba(239,226,196,0.65)"; g.fillRect(0, H * (0.48 + 0.17 * k), W, 22);
  }
  g.strokeStyle = COL.ink; g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.78, H); g.quadraticCurveTo(W * 0.74, H * 0.6, W * 0.8, H * 0.38); g.stroke();
  for (let i = 0; i < 9; i++) { g.fillStyle = css("#3e4a3a", 0.85); g.beginPath(); g.ellipse(W * (0.7 + 0.18 * r()), H * (0.38 + 0.3 * r()), 30 + 20 * r(), 8, (r() - 0.5) * 0.6, 0, 7); g.fill(); }
  g.fillStyle = COL.ink; g.fillRect(W * 0.3, H * 0.78, 34, 5);
  g.strokeStyle = "#a8803a"; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
});
/** the hanging scroll: brush strokes (not a text: an abstract calligraphy) on paper with a silk border, a red seal */
const scrollTex = () => paint(256, 640, (g, W, H) => {
  const r = rng(413); g.fillStyle = "#c8b48a"; g.fillRect(0, 0, W, H);
  g.fillStyle = COL.paper; g.fillRect(W * 0.12, H * 0.14, W * 0.76, H * 0.72);
  g.strokeStyle = COL.ink; g.lineCap = "round";
  for (let c = 0; c < 2; c++) for (let k = 0; k < 6; k++) {
    const cx = W * (0.64 - c * 0.28), cy = H * (0.22 + k * 0.105);
    for (let s = 0; s < 3; s++) { g.lineWidth = 4 + 5 * r(); g.beginPath(); const x = cx + (r() - 0.5) * 30, y = cy + (r() - 0.5) * 30; g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 30, x + (r() - 0.5) * 36, y + (r() - 0.5) * 36); g.stroke(); }
  }
  g.fillStyle = "#c23a30"; g.fillRect(W * 0.2, H * 0.76, 22, 22);
});
/** a shelf unit's front (open shelves: books lying and standing, scroll boxes, a vase) */
const shelfTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(417); g.fillStyle = "#6a4c38"; g.fillRect(0, 0, W, H);
  const rows = 4, rh = H / rows;
  for (let j = 0; j < rows; j++) {
    const y1 = (j + 1) * rh - 14;
    for (let x = 18; x < W - 30;) {
      const kind = r();
      if (kind < 0.55) { const w = 12 + 10 * r(), h = rh * (0.5 + 0.3 * r()); g.fillStyle = COL.book[Math.floor(r() * COL.book.length)]; g.fillRect(x, y1 - h, w, h); g.fillStyle = "rgba(255,240,210,0.5)"; g.fillRect(x + 2, y1 - h + 8, w - 4, 4); x += w + 2; }
      else if (kind < 0.8) { const w = 60 + 30 * r(), n = 2 + Math.floor(r() * 3); for (let k = 0; k < n; k++) { g.fillStyle = COL.book[Math.floor(r() * 4)]; g.fillRect(x, y1 - (k + 1) * 14, w, 13); } x += w + 8; }
      else { g.fillStyle = "#e8dcc0"; g.beginPath(); g.ellipse(x + 20, y1 - 10, 18, 10, 0, 0, 7); g.fill(); g.fillStyle = "#c8b890"; g.fillRect(x + 2, y1 - 30, 36, 20); x += 48; }
    }
    g.fillStyle = COL.timber; g.fillRect(0, y1, W, 14); g.fillStyle = COL.timberLo; g.fillRect(0, y1 + 11, W, 3);
  }
  g.fillStyle = COL.timber; g.fillRect(0, 0, 16, H); g.fillRect(W - 16, 0, 16, H); g.fillRect(0, 0, W, 16);
});
/** the doorway's view: the dim veranda boards, a post, the gold light falling off outside */
const doorwayTex = () => paint(256, 512, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#c88a5a"); gr.addColorStop(0.55, "#e8a868"); gr.addColorStop(0.62, "#8a6448"); gr.addColorStop(1, "#6a4a36");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,214,150,0.6)"; g.fillRect(0, H * 0.18, W, H * 0.4);
  g.fillStyle = "#5a4030"; g.fillRect(W * 0.62, 0, 26, H * 0.66);
  g.strokeStyle = "rgba(60,40,30,0.5)"; g.lineWidth = 3; for (let k = 0; k < 6; k++) { const y = H * (0.66 + k * 0.06); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildRoom(K: Kit) {
  const group = new THREE.Group(); group.name = "set-room";
  const Mk = maker(K, group), B = new Batch(), Pd = new Part(K), fl = (c: string, rough = 0.8) => K.flat(c, { rough });
  const F = S.floor, H = S.wallH, T = 0.16;                                      // wall thickness (outside the room)
  const mWall = Mk.tex(wallTex(), 0.9), mShell = Mk.flat("#c8b28a", 0.9), mTimber = Mk.tex(boardTex(421, { base: COL.timber, n: 2 }), 0.85);
  const mFloor = Mk.tex(boardTex(423, { base: COL.floor, n: 4, joint: "#8a6440" }), 0.85), mCeil = Mk.tex(boardTex(425, { base: COL.ceiling, n: 4, lying: true }), 0.9), mBeam = Mk.flat(COL.beam, 0.85);

  // =================================================================================================== floor, ceiling, beams
  B.add(mFloor, levelQuad(F.x0, F.x1, F.z0, F.z1, 0, (x, z) => [x * 0.8, -z * 0.8]));
  const ceil = new THREE.Group(); ceil.name = "room.ceiling"; group.add(ceil);
  { const CB = new Batch();
    CB.add(mCeil, ceilQuad(F.x0, F.x1, F.z0, F.z1, H, (x, z) => [x, -z]));
    for (let z = F.z0 + 0.9; z < F.z1 - 0.3; z += 1.45) CB.add(mBeam, boxM(F.x0, F.x1, H - 0.2, H, z - 0.09, z + 0.09));
    CB.add(mBeam, boxM(L(-0.1), L(0.1), H - 0.24, H - 0.2, F.z0, F.z1));
    CB.flush(ceil, "room.ceiling", false, true); }

  // =================================================================================================== THE WALLS (each a group: view() hides the one the camera is behind)
  type Hole = { a0: number; a1: number; y0: number; y1: number };
  const walls: { g: THREE.Group; inside: (p: THREE.Vector3) => number }[] = [];
  /** a wall along a straight line (the painted inside quads around its holes, a thick shell outside); a = its left end
   *  seen from inside, the holes in metres from a */
  const wall = (name: string, a: [number, number], b: [number, number], holes: Hole[], inside: (p: THREE.Vector3) => number) => {
    const g = new THREE.Group(); g.name = name; group.add(g); walls.push({ g, inside });
    const W = new Batch(), len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len, nx = -uz, nz = ux;   // n points into the room
    const P = (s: number): [number, number] => [a[0] + ux * s, a[1] + uz * s];
    const piece = (s0: number, s1: number, y0: number, y1: number) => {
      if (s1 - s0 < 1e-3 || y1 - y0 < 1e-3) return;
      W.add(mWall, wallQuad(P(s0), P(s1), y0, y1, { u0: s0, tileU: 1, vTile: H }));
      const [x0, z0] = P(s0), [x1, z1] = P(s1), ox = -nx * T, oz = -nz * T;
      const minX = Math.min(x0, x1, x0 + ox, x1 + ox), maxX = Math.max(x0, x1, x0 + ox, x1 + ox), minZ = Math.min(z0, z1, z0 + oz, z1 + oz), maxZ = Math.max(z0, z1, z0 + oz, z1 + oz);
      W.add(mShell, boxM(minX, maxX, y0, y1, minZ, maxZ).translate(-nx * 0.004, 0, -nz * 0.004));
    };
    const cuts = [...holes].sort((p, q) => p.a0 - q.a0);
    let s = 0;
    for (const h of cuts) { piece(s, h.a0, 0, H); piece(h.a0, h.a1, 0, h.y0); piece(h.a0, h.a1, h.y1, H); s = h.a1; }
    piece(s, len, 0, H);
    W.flush(g, name, true, true);
    return g;
  };
  const Wn = S.window, W2 = S.window2, Dr = S.door;
  wall("room.wallBack", [F.x0, F.z0], [F.x1, F.z0], [{ a0: Wn.x0 - F.x0, a1: Wn.x1 - F.x0, y0: Wn.y0, y1: Wn.y1 }], (p) => p.z - F.z0);
  wall("room.wallLeft", [F.x0, F.z1], [F.x0, F.z0], [{ a0: F.z1 - W2.z1, a1: F.z1 - W2.z0, y0: W2.y0, y1: W2.y1 }], (p) => p.x - F.x0);
  wall("room.wallRight", [F.x1, F.z0], [F.x1, F.z1], [{ a0: Dr.z0 - F.z0, a1: Dr.z1 - F.z0, y0: 0, y1: Dr.h }], (p) => F.x1 - p.x);
  wall("room.wallFront", [F.x1, F.z1], [F.x0, F.z1], [], (p) => F.z1 - p.z);

  // posts at the corners, flanking the big window, along the walls; the window and door frames
  const post = (x: number, z: number) => B.add(mTimber, boxM(x - 0.08, x + 0.08, 0, H - 0.2, z - 0.08, z + 0.08));
  for (const [x, z] of [[F.x0 + 0.06, F.z0 + 0.06], [F.x1 - 0.06, F.z0 + 0.06], [F.x0 + 0.06, F.z1 - 0.06], [F.x1 - 0.06, F.z1 - 0.06], [Wn.x0 - 0.1, F.z0 + 0.06], [Wn.x1 + 0.1, F.z0 + 0.06], [F.x0 + 0.06, 0.6]] as [number, number][]) post(x, z);
  const frame = (x0: number, x1: number, y0: number, y1: number, z: number, d: number, alongZ: boolean, sill: boolean) => {
    const bx = (a0: number, a1: number, b0: number, b1: number) => B.add(mTimber, alongZ ? boxM(z, z + d, b0, b1, a0, a1) : boxM(a0, a1, b0, b1, z, z + d));
    bx(x0 - 0.08, x1 + 0.08, y1, y1 + 0.09); bx(x0 - 0.08, x0, y0, y1); bx(x1, x1 + 0.08, y0, y1);
    if (sill) bx(x0 - 0.12, x1 + 0.12, y0 - 0.07, y0);
  };
  frame(Wn.x0, Wn.x1, Wn.y0, Wn.y1, F.z0, 0.07, false, true);
  B.add(mTimber, boxM(Wn.x0 - 0.12, Wn.x1 + 0.12, Wn.y0 - 0.05, Wn.y0, F.z0, F.z0 + 0.18));          // the inside sill board
  frame(W2.z0, W2.z1, W2.y0, W2.y1, F.x0, 0.07, true, true);
  frame(Dr.z0, Dr.z1, -0.09, Dr.h, F.x1 - 0.07, 0.07, true, false);
  B.add(mTimber, boxM(F.x1 - T, F.x1, 0, 0.04, Dr.z0, Dr.z1));                                                   // the threshold

  // =================================================================================================== THE WINDOWS: open lattices (they cast their pattern), the gold evening behind them
  const glowCards: THREE.MeshBasicMaterial[] = [];
  const lattice = (name: string, w: number, h: number, put: (g: THREE.PlaneGeometry) => THREE.BufferGeometry) => {
    const m = Mk.own("#ffffff", { map: latticeTex(w, h, 0.2), rough: 0.85, side: THREE.DoubleSide }); m.alphaTest = 0.5;
    const x = Mk.mesh(name, put(new THREE.PlaneGeometry(w, h)), m, { cast: true, receive: false, noink: true });   // NOINK: no outline round every cell (it still casts)
    return x;
  };
  lattice("room.lattice", Wn.x1 - Wn.x0, Wn.y1 - Wn.y0, (g) => g.translate((Wn.x0 + Wn.x1) / 2, (Wn.y0 + Wn.y1) / 2, F.z0 - 0.06));
  lattice("room.lattice2", W2.z1 - W2.z0, W2.y1 - W2.y0, (g) => g.rotateY(Math.PI / 2).translate(F.x0 - 0.06, (W2.y0 + W2.y1) / 2, (W2.z0 + W2.z1) / 2));
  const card = (name: string, t: THREE.Texture, geo: THREE.BufferGeometry) => {
    const m = new THREE.MeshBasicMaterial({ map: t, fog: false }); glowCards.push(m);
    const x = new THREE.Mesh(geo, m); x.name = name; x.layers.set(NOINK); x.castShadow = false; x.receiveShadow = false; group.add(x); return x;
  };
  card("room.evening", eveningTex(431, 0.7), new THREE.PlaneGeometry(Wn.x1 - Wn.x0 + 1.6, Wn.y1 - Wn.y0 + 1.2).translate((Wn.x0 + Wn.x1) / 2, (Wn.y0 + Wn.y1) / 2, F.z0 - T - 0.5));
  card("room.evening2", eveningTex(433, 0.3), new THREE.PlaneGeometry(W2.z1 - W2.z0 + 1.0, W2.y1 - W2.y0 + 0.8).rotateY(Math.PI / 2).translate(F.x0 - T - 0.4, (W2.y0 + W2.y1) / 2, (W2.z0 + W2.z1) / 2));
  { const m = new THREE.MeshBasicMaterial({ map: doorwayTex(), fog: false }), x = new THREE.Mesh(new THREE.PlaneGeometry(Dr.z1 - Dr.z0 + 0.8, Dr.h + 0.4).rotateY(-Math.PI / 2).translate(F.x1 + T + 0.5, (Dr.h + 0.4) / 2 - 0.02, (Dr.z0 + Dr.z1) / 2), m);
    x.name = "room.doorway"; x.layers.set(NOINK); group.add(x); }

  // =================================================================================================== THE SUN SHAFTS (additive, NOINK) from the windows along the light
  const SUN_DIR = new THREE.Vector3(0.25, 0.36, -0.9).normalize(), ray = SUN_DIR.clone().negate();
  const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex(), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const shafts = new THREE.Group(); shafts.name = "room.shafts"; group.add(shafts);
  const shaft = (top: THREE.Vector3, bot: THREE.Vector3, len: number) => {
    const g = new THREE.BufferGeometry(), A = top, Bp = bot, C = bot.clone().addScaledVector(ray, len), D = top.clone().addScaledVector(ray, len);
    g.setAttribute("position", new THREE.Float32BufferAttribute([A.x, A.y, A.z, Bp.x, Bp.y, Bp.z, C.x, C.y, C.z, D.x, D.y, D.z], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 1, 1], 2)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const x = new THREE.Mesh(g, shaftMat); x.name = "room.light"; x.layers.set(NOINK); x.renderOrder = 8; x.castShadow = false; x.receiveShadow = false; shafts.add(x);
  };
  for (const u of [0.18, 0.5, 0.82]) { const x = Wn.x0 + (Wn.x1 - Wn.x0) * u; shaft(V3(x, Wn.y1 - 0.08, F.z0 + 0.02), V3(x, Wn.y0 + 0.06, F.z0 + 0.02), 3.6); }
  for (const u of [0.3, 0.7]) { const z = W2.z0 + (W2.z1 - W2.z0) * u; shaft(V3(F.x0 + 0.02, W2.y1 - 0.06, z), V3(F.x0 + 0.02, W2.y0 + 0.05, z), 2.2); }

  // =================================================================================================== the bed screen, the shelves, the scroll, the lamp stand
  { // the folding screen: three panels in a zigzag, each a dark frame with the painting on its front
    const Sc = S.screen, n = 3, pw = (Sc.x1 - Sc.x0) / n, paintM = Mk.tex(screenTex(), 0.85), frameM = Mk.flat(COL.screen, 0.7);
    for (let i = 0; i < n; i++) {
      const cx = Sc.x0 + pw * (i + 0.5), yaw = i % 2 ? -0.22 : 0.22, M = new THREE.Matrix4().makeRotationY(yaw).setPosition(cx, 0, Sc.z + (i % 2 ? 0.06 : 0));
      B.add(frameM, boxM(-pw / 2, pw / 2, 0.08, Sc.h, -0.03, 0.03).applyMatrix4(M));
      for (const x of [-pw / 2 + 0.03, pw / 2 - 0.03]) B.add(frameM, boxM(x - 0.03, x + 0.03, 0, 0.12, -0.05, 0.05).applyMatrix4(M));
      B.add(paintM, uvRect(new THREE.PlaneGeometry(pw - 0.08, Sc.h - 0.24).translate(0, (Sc.h + 0.08) / 2, 0.032), -pw / 2 + 0.04 - i * pw + (Sc.x1 - Sc.x0) / 2 - pw / 2, -pw / 2 + 0.04 - i * pw + (Sc.x1 - Sc.x0) / 2 + pw / 2 - 0.08, 0.2, Sc.h - 0.04).applyMatrix4(M));
    }
  }
  { // the shelf unit on the right wall (between the screen and the door)
    const x1 = F.x1 - 0.005, x0 = x1 - 0.36, z0 = -2.2, z1 = -0.6, h = 1.85, fm = Mk.tex(shelfTex(), 0.85), side = mTimber;
    Mk.mesh("room.shelf", new THREE.BoxGeometry(x1 - x0, h, z1 - z0).translate((x0 + x1) / 2, h / 2, (z0 + z1) / 2), [side, fm, side, side, side, side]);
    Pd.add(fl("#5a7a8a", 0.5), lathe([[0.0, 0.0], [0.07, 0.0], [0.1, 0.12], [0.05, 0.24], [0.06, 0.28], [0.0, 0.28]], 14).translate(x0 + 0.18, h, -1.0), 0.006);
  }
  { // the hanging scroll over the bench (paper on the wall, rollers top and bottom)
    const x = ROOM.bench.x, y0 = 1.25, y1 = 2.42, z = F.z0 + 0.012, w = 0.5;
    B.add(Mk.tex(scrollTex(), 0.9), new THREE.PlaneGeometry(w, y1 - y0).translate(x, (y0 + y1) / 2, z));
    Pd.add(fl("#5a3e2e", 0.6), new THREE.CylinderGeometry(0.018, 0.018, w + 0.08, 8).rotateZ(Math.PI / 2).translate(x, y0, z + 0.02), 0.004);
    Pd.add(fl("#5a3e2e", 0.6), new THREE.CylinderGeometry(0.014, 0.014, w + 0.02, 8).rotateZ(Math.PI / 2).translate(x, y1, z + 0.015), 0.004);
    Pd.add(fl("#5a3e2e", 0.6), bar(V3(x - 0.15, y1, z + 0.015), V3(x, y1 + 0.16, z + 0.01), 0.004, 0.004, 4), 0);
    Pd.add(fl("#5a3e2e", 0.6), bar(V3(x + 0.15, y1, z + 0.015), V3(x, y1 + 0.16, z + 0.01), 0.004, 0.004, 4), 0);
  }
  { // a tall lamp stand right of the desk (an oil dish on a turned post, a paper shade)
    const x = L(2.15), z = -2.05;
    Pd.add(fl(COL.lamp, 0.7), lathe([[0.0, 0.0], [0.17, 0.0], [0.15, 0.05], [0.04, 0.09], [0.035, 1.05], [0.06, 1.08], [0.0, 1.1]], 14).translate(x, 0, z), 0.006);
    Pd.add(Mk.own("#fff0d0", { rough: 0.9 }), lathe([[0.12, 0.0], [0.135, 0.12], [0.13, 0.26], [0.0, 0.26]].map(([a, b]) => [a, b] as [number, number]), 16).translate(x, 1.1, z), 0.006);
  }

  // =================================================================================================== they are moving in: bundles, baskets, a rolled mat along the left wall
  {
    const r = rng(441), knot = (x: number, y: number, z: number, c: THREE.Material) => Pd.add(c, blobG(443 + Math.round(x * 10), 1, 0.3).scale(0.07, 0.06, 0.07).translate(x, y, z), 0.004);
    const bundles: [number, number, number, number, number, number][] = [[-2.85, 1.05, 0.5, 0.36, 0.42, 0.25], [-2.8, 1.65, 0.46, 0.3, 0.36, -0.2], [-2.9, 1.35, 0.42, 0.26, 0.3, 0.1], [-2.75, 2.35, 0.55, 0.32, 0.45, 0.4]];
    bundles.forEach(([x, z, w, h, d, yaw], i) => {
      const c = fl(COL.cloth[i % COL.cloth.length], 0.9), y = i === 2 ? 0.36 : 0;
      Pd.add(c, new THREE.BoxGeometry(w, h, d).rotateY(yaw).translate(L(x), y + h / 2, z), 0.007);
      knot(L(x), y + h + 0.03, z, c);
    });
    for (const [x, z, s] of [[-2.85, 2.95, 1.0], [-2.3, 3.15, 0.8]] as [number, number, number][]) Pd.add(fl(COL.basket, 0.9), lathe([[0.0, 0.0], [0.2 * s, 0.0], [0.25 * s, 0.32 * s], [0.0, 0.32 * s]], 16).translate(L(x), 0, z), 0.007);
    Pd.add(fl(COL.mat, 0.9), new THREE.CylinderGeometry(0.11, 0.11, 1.1, 14).translate(L(-3.1), 0.55, 0.3), 0.006);
    void r;
  }

  B.flush(group, "room.build");
  Pd.into(group, "room.dressing", { cast: true, receive: false });

  // =================================================================================================== the light: the low gold sun through the window, a warm room
  const sunAt: [number, number, number] = [L(0.6), 0.5, -1.2];
  const L0 = lightRig(group, { dir: [SUN_DIR.x, SUN_DIR.y, SUN_DIR.z], k: 3.2, col: "#ffc070", at: sunAt, half: 5, hemi: ["#ffe6c0", "#b08060", 1.25], point: { col: "#ffcf96", k: 2.2, at: [L(0.4), 2.2, 0.9], dist: 7 } });
  const setSun = (k: number) => {
    const s = Math.max(0, Math.min(1, k));
    L0.key.intensity = 3.2 * s; shaftMat.opacity = 0.16 * s; shafts.visible = s > 0.02;
    for (const m of glowCards) m.color.setScalar(0.4 + 0.6 * s);
    L0.hemi.intensity = 1.05 + 0.2 * s;
  };
  setSun(1);
  return {
    group,
    /** hides the walls the camera stands behind or close to (the front wall from the room's lens), and the ceiling when the
     *  lens is above it */
    view(cam: THREE.Vector3) { for (const w of walls) w.g.visible = w.inside(cam) > 0.6; ceil.visible = cam.y < H - 0.1; },
    setParam(name: string, v: ParamValue) { if (name === "sun") setSun(Number(v)); },
  };
}

// THE BALCONY (place "balcony", island x = ISLAND.balcony): scene 3, Sunday late night: Juliet's balcony on the
// Capulet house over the orchard. THE FILM'S KEY TRICK lives here: the screen splits top / bottom (her close interview
// above, his below), the two pictures widen until they meet and turn out to be ONE picture: camera "reveal" frames her
// at the rail in the top part of the 9:16 frame and him in the bushes in the bottom part, the balcony's edge between.
//
// WHAT THERE IS (her lens looks -z at the house; local x, z round the island)
//   - THE HOUSE: a warm stone front (painted ashlar, weathering, IVY climbing the corner and spreading under the
//     balcony) at z -1.75 from its corner at x -0.8 to the right; a cornice and a tiled roof above; a shuttered window
//     upstairs and downstairs on the right. Left of the corner the night opens: the orchard's back wall, cypresses and
//     far Verona painted on a ring, and THE BIG LOW MOON (upper left of the reveal), its haze and a few stars;
//   - THE BALCONY: a stone slab (top y 2.6, x -0.8..1.3, out to z -0.45) on three scroll corbels, a balustrade of
//     turned balusters (rail top y 3.55, its front at z -0.55), two pots of white jasmine; behind her THE LIT DOORWAY
//     (round-arched, x -0.4..0.6, up to y 4.65), dark wine curtains tied back, the warm room glowing inside;
//   - THE ORCHARD: dark moonlit grass, fruit trees with pale pears (two framing the reveal at its sides), the BUSHES he
//     crouches in round (0.35, 0.35), a big laurel at the right front whose leaves come into his close camera, and
//     THE ORCHARD WALL on the right (x 3.1, running toward the camera) where he runs at the end.
// LIGHT: cool pale moonlight from the upper left (the moon's side), a slate night fill, the warm door light (the
// place's point light) on the balcony, the rail and her back. Never black: night is a muted slate mid-tone. No
// saturated blue anywhere; Capulet reds (the curtains) dark and dull.
// INK / FLICKER: stone joints, ivy on the wall, grass, fruit, the room are PAINT; inked geometry is chunky (wall,
// slab, corbels, balusters r 5.5 cm, rail, pots, trunks, bush blobs); the moon, sky, ring, room, glows, leaf cards and
// curtains are NOINK.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig, paint, rng, css, blotch, skyDome, Batch, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { groundGrid } from "./parts/ground";
import { ISLAND } from "../places";
import { maker, lathe, blobG, bentLimb, panoramaRing, wrapBlotch, glowSprite, leafClusterTex, crossCardsG, tileUV, Part, NOINK, shade, shadeHex } from "./parts/a_util";

const X0 = ISLAND.balcony;
const WALL_Z = -1.75, CORNER = -0.8, FLOOR = 2.6, RAIL_Z = -0.55, RAIL_TOP = 3.25, SLAB = { x0: -0.8, x1: 1.3, z1: -0.45 };
const DOOR = { x0: -0.4, x1: 0.6, top: 4.65 }, DOOR_R = (DOOR.x1 - DOOR.x0) / 2, DOOR_SPRING = DOOR.top - DOOR_R, DOOR_CX = (DOOR.x0 + DOOR.x1) / 2;
const HOUSE = { x1: 6.0, top: 5.8 };
/** the moon, placed for the reveal camera: bearing (0 = -z, + toward +x) and elevation in degrees, apparent diameter */
const REVEAL_EYE = new THREE.Vector3(X0 + 0.5, 1.6, 5.4);
const MOON = { az: -15.5, el: 19.5, deg: 7.2, dist: 70 };

const COL = {
  wall: "#bca282", wallHi: "#cdb594", wallLo: "#a08a6e", joint: "#86725c", stone: "#d2bc9a", stoneLo: "#b49e80",
  ivy: ["#3e5a3a", "#4a6a42", "#36503a"], ivyHi: "#5e7e4e", ivyLine: "#1e2a20",
  grass: "#46543e", grassHi: "#5a6a4c", grassLo: "#36422f", earth: "#5a5040",
  leaf: ["#34503a", "#3e5c40", "#2e4834"], leafHi: "#557a52", pear: "#c8a65a", bark: "#5e5048", barkLo: "#4a3e38",
  laurel: ["#3a5a40", "#46684a", "#30503a"], laurelHi: "#628a5c",
  curtain: "#4e2228", curtainLo: "#3c1a20", pot: "#a8624a", potLo: "#8a4e3c", jasmine: "#3e5a3e", flower: "#f2eee2",
  wood: "#5a4436", shutter: "#5c6650", roof: "#9a5a42", roofLo: "#7e4836",
  moon: "#f6eed6", moonLo: "#e2d8bc", moonGlow: "#a8acc8",
};
const SKY: SkyStops = [[-10, "#3c4258"], [0, "#5a6078"], [4, "#545a74"], [12, "#464c66"], [30, "#3a405a"], [60, "#30364e"], [90, "#2c3248"]];

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.2, 0.2, 0.22]], [-10, [0.26, 0.27, 0.32]], [8, [0.36, 0.38, 0.48]], [45, [0.32, 0.34, 0.44]], [90, [0.28, 0.3, 0.4]]],
  boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.78, 0.8, 0.92] }],
};
export const BALCONY_LOOK: PlaceLook = {
  bg: "#3a4058",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.7, color: "#1c1e2a" },
  cast: {
    key: [-0.5, 0.55, 0.67], tint: [0.86, 0.89, 1.0], tintK: 0.62, gain: 0.92, grad: 0.24, bodyGrad: 0.16, sideTint: [0.88, 0.9, 1.0],
    shade: [1.0, 0.93, 1.6], shadeK: 0.42, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.12, sheen: 0.14, lift: 0.03, contactLen: 0.2,
    ...BAKED_LIGHT,
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.55,
};
export const BALCONY_PARAMS: Record<string, ParamValue> = {};

// ---------------------------------------------------------------------------------------------------- paintings
/** THE HOUSE FRONT (one painting over x CORNER..HOUSE.x1, y 0..HOUSE.top): ashlar courses, soft weathering, the ivy */
const frontTex = () => paint(2048, Math.round(2048 * HOUSE.top / (HOUSE.x1 - CORNER)), (g, W, H) => {
  const r = rng(301), s = W / (HOUSE.x1 - CORNER), px = (x: number) => (x - CORNER) * s, py = (y: number) => (HOUSE.top - y) * s;
  g.fillStyle = COL.wall; g.fillRect(0, 0, W, H);
  // ashlar: courses 0.32 m, blocks 0.5..0.8 m, each its own tone, joints painted
  const ch = 0.32 * s;
  for (let y = 0, row = 0; y < H; y += ch, row++) {
    let x = -((row * 0.37) % 1) * 0.6 * s;
    while (x < W) {
      const bw = (0.5 + 0.3 * r()) * s;
      g.fillStyle = shade(COL.wall, (r() - 0.5) * 0.1); g.fillRect(x, y, bw, ch);
      g.fillStyle = "rgba(255,240,220,0.12)"; g.fillRect(x, y, bw, ch * 0.12);
      g.fillStyle = css(COL.joint, 0.75); g.fillRect(x - 2, y, 4, ch); x += bw;
    }
    g.fillStyle = css(COL.joint, 0.75); g.fillRect(0, y - 2, W, 4);
  }
  for (let i = 0; i < 50; i++) blotch(g, W * r(), H * r(), s * (0.4 + 0.9 * r()), r() < 0.6 ? COL.wallHi : COL.wallLo, 0.12);
  // rain streaks under the balcony and the cornice
  for (let i = 0; i < 24; i++) { const x = px(SLAB.x0 + (SLAB.x1 - SLAB.x0) * r()), y0 = py(FLOOR - 0.2); const gr = g.createLinearGradient(0, y0, 0, y0 + s * (0.6 + 0.8 * r())); gr.addColorStop(0, css(COL.wallLo, 0.4)); gr.addColorStop(1, css(COL.wallLo, 0)); g.fillStyle = gr; g.fillRect(x, y0, s * 0.06, s * 1.4); }
  // a darker damp base along the ground
  const bg = g.createLinearGradient(0, py(0.7), 0, py(0)); bg.addColorStop(0, "rgba(70,64,52,0)"); bg.addColorStop(1, "rgba(70,64,52,0.55)"); g.fillStyle = bg; g.fillRect(0, py(0.7), W, py(0) - py(0.7));
  // IVY: leaf masses climbing the corner from the ground, spreading under the balcony, a tendril up the right window
  const ivyLeaf = (x: number, y: number, sz: number, col: string) => {
    g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 1.6); g.beginPath();
    for (let i = 0; i <= 6; i++) { const t = i / 6, a = -Math.PI / 2 + (t - 0.5) * 3.0, rr = i % 2 === 0 ? sz : sz * 0.62; if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.lineTo(0, sz * 0.3); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = css(COL.ivyLine, 0.7); g.lineWidth = 2; g.stroke(); g.restore();
  };
  const mass = (cx: number, cy: number, rx: number, ry: number, n: number) => {
    for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()); const x = px(cx + Math.cos(a) * rx * d), y = py(cy + Math.sin(a) * ry * d); ivyLeaf(x, y, s * (0.05 + 0.035 * r()), r() < 0.2 ? COL.ivyHi : COL.ivy[Math.floor(r() * 3)]); }
  };
  // stems first
  g.strokeStyle = css("#4a3e34", 0.8); g.lineCap = "round";
  for (let i = 0; i < 14; i++) { g.lineWidth = s * 0.02; g.beginPath(); let x = px(CORNER + 0.1 + 0.5 * r()), y = py(0); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (r() - 0.45) * s * 0.3; y -= s * (0.25 + 0.15 * r()); g.lineTo(x, y); } g.stroke(); }
  mass(CORNER + 0.35, 0.6, 0.45, 0.7, 260); mass(CORNER + 0.3, 1.6, 0.38, 0.6, 200); mass(CORNER + 0.3, 2.3, 0.45, 0.35, 160);
  mass(0.2, 2.25, 1.0, 0.22, 240); mass(-0.2, 1.95, 0.5, 0.2, 90); mass(CORNER + 0.2, 3.3, 0.25, 0.6, 110); mass(CORNER + 0.15, 4.3, 0.18, 0.5, 70);
  mass(2.15, 1.0, 0.3, 0.9, 140); mass(2.6, 2.3, 0.25, 0.5, 70); mass(1.75, 0.35, 0.5, 0.35, 120);
});
/** plain worked stone (slab, rail, corbels, cornice): soft tone, a few pits */
const stoneTex = (seed: number, base: string) => paint(256, 256, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) wrapBlotch(g, W, H, W * r(), H * r(), 20 + 40 * r(), r() < 0.5 ? shadeHex(base, 0.08) : shadeHex(base, -0.06), 0.25);
  for (let i = 0; i < 60; i++) { g.fillStyle = css(shade(base, -0.18), 0.35); g.fillRect(W * r(), H * r(), 2, 2); }
}, true);
/** the room through the door: warm plaster, candle glow at the left, the edge of a dark wine bed curtain at the right */
const roomTex = () => paint(512, 768, (g, W, H) => {
  const r = rng(311);
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#c88a52"); bg.addColorStop(0.55, "#f0b26a"); bg.addColorStop(1, "#d8945a");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  blotch(g, W * 0.3, H * 0.52, W * 0.55, "#ffe0a0", 0.85); blotch(g, W * 0.3, H * 0.52, W * 0.18, "#fff2d0", 0.9);
  // a little table with the candle
  g.fillStyle = "#7a4a32"; g.fillRect(W * 0.18, H * 0.62, W * 0.26, H * 0.04); g.fillRect(W * 0.2, H * 0.66, W * 0.03, H * 0.3); g.fillRect(W * 0.39, H * 0.66, W * 0.03, H * 0.3);
  g.fillStyle = "#f6ecd8"; g.fillRect(W * 0.295, H * 0.55, W * 0.03, H * 0.07); g.fillStyle = "#ffd070"; g.beginPath(); g.ellipse(W * 0.31, H * 0.535, W * 0.012, H * 0.016, 0, 0, 7); g.fill();
  // the bed curtain's edge at the right
  g.fillStyle = "#7a3036"; g.beginPath(); g.moveTo(W * 0.72, 0); g.quadraticCurveTo(W * 0.66, H * 0.5, W * 0.76, H); g.lineTo(W, H); g.lineTo(W, 0); g.closePath(); g.fill();
  g.strokeStyle = "rgba(60,20,24,0.5)"; g.lineWidth = 4; for (let i = 0; i < 4; i++) { const x = W * (0.8 + 0.05 * i); g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x - 10, H * 0.5, x + 6, H); g.stroke(); }
  // a tapestry on the back wall (muted)
  g.fillStyle = "rgba(150,90,60,0.5)"; g.fillRect(W * 0.08, H * 0.12, W * 0.5, H * 0.3); g.strokeStyle = "rgba(200,150,80,0.6)"; g.lineWidth = 5; g.strokeRect(W * 0.1, H * 0.14, W * 0.46, H * 0.26);
  // the floor
  const fg = g.createLinearGradient(0, H * 0.9, 0, H); fg.addColorStop(0, "#a8683e"); fg.addColorStop(1, "#c07a48"); g.fillStyle = fg; g.fillRect(0, H * 0.92, W, H * 0.08);
  void r;
});
/** dark moonlit orchard grass (one painting over 20 m) with the light pool from her door under the balcony */
const groundPaint = (S: number) => paint(S, S, (g) => {
  const r = rng(321), size = 20, s = S / size, px = (x: number) => ((x) / size + 0.5) * S, pz = (z: number) => ((z - 0.5) / size + 0.5) * S;
  g.fillStyle = COL.grass; g.fillRect(0, 0, S, S);
  g.save(); g.beginPath(); g.rect(S * 0.02, S * 0.02, S * 0.96, S * 0.96); g.clip();
  for (let i = 0; i < 140; i++) blotch(g, S * (0.05 + 0.9 * r()), S * (0.05 + 0.9 * r()), s * (0.4 + 1.2 * r()), r() < 0.5 ? COL.grassHi : COL.grassLo, 0.28);
  // earth under the trees and the bushes, a worn track along the house
  for (const [x, z, rr] of [[-1.9, -0.3, 1.0], [2.5, -0.6, 1.0], [0.35, 0.3, 0.9], [-2.6, 2.4, 0.9], [2.9, 3.4, 0.9]] as [number, number, number][]) blotch(g, px(x), pz(z), s * rr, COL.earth, 0.45);
  g.fillStyle = css(COL.earth, 0.35); g.fillRect(px(-6), pz(-1.55), px(3) - px(-6), s * 0.35);
  g.lineCap = "round";
  for (let i = 0; i < 26000; i++) { const x = S * r(), y = S * r(), l = s * (0.03 + 0.03 * r()), a = -Math.PI / 2 + (r() - 0.5) * 0.9; g.strokeStyle = css(r() < 0.5 ? COL.grassHi : COL.grassLo, 0.4); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 1400; i++) { const x = S * r(), y = S * r(); g.fillStyle = r() < 0.75 ? "rgba(214,214,206,0.6)" : "rgba(214,196,130,0.6)"; g.beginPath(); g.arc(x, y, 1.3 + r(), 0, 7); g.fill(); }
  // fallen pears under the trees
  for (let i = 0; i < 18; i++) { const t = r() < 0.5 ? [-1.9, -0.3] : [2.5, -0.6], x = px(t[0] + (r() - 0.5) * 1.6), y = pz(t[1] + (r() - 0.5) * 1.6); g.fillStyle = COL.pear; g.beginPath(); g.ellipse(x, y, s * 0.035, s * 0.045, r() * 3, 0, 7); g.fill(); g.strokeStyle = "rgba(40,36,30,0.6)"; g.lineWidth = 1.5; g.stroke(); }
  g.restore();
});
/** a leaf skin for blobs (bushes, crowns): leaf strokes, optional pears */
const foliageTex = (seed: number, pears: boolean) => paint(256, 256, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#e4ece0"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 300; i++) {
    const x = W * r(), y = H * r(), a = r() * 6.28, l = 7 + 6 * r(), v = 0.7 + 0.35 * r();
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { if (x + dx < -16 || x + dx > W + 16 || y + dy < -16 || y + dy > H + 16) continue; g.save(); g.translate(x + dx, y + dy); g.rotate(a); g.beginPath(); g.ellipse(0, 0, l * 0.4, l, 0, 0, 7); g.fillStyle = css([255 * v * 0.9, 255 * v, 255 * v * 0.88]); g.fill(); g.strokeStyle = "rgba(40,50,40,0.25)"; g.lineWidth = 1.2; g.stroke(); g.restore(); }
  }
  if (pears) for (let i = 0; i < 14; i++) { const x = W * (0.08 + 0.84 * r()), y = H * (0.08 + 0.84 * r()); g.fillStyle = "#e8c070"; g.beginPath(); g.ellipse(x, y, 7, 9, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(50,40,30,0.7)"; g.lineWidth = 2; g.stroke(); }
}, true);
/** shutters: vertical boards with two rails, a painted outline (u across, v up) */
const shutterTex = () => paint(256, 512, (g, W, H) => {
  g.fillStyle = COL.shutter; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { g.fillStyle = shade(COL.shutter, (i % 2 ? 0.06 : -0.04)); g.fillRect((i * W) / 6, 0, W / 6, H); g.fillStyle = "rgba(30,34,30,0.6)"; g.fillRect((i * W) / 6 - 1.5, 0, 3, H); }
  g.fillStyle = shade(COL.shutter, -0.15); g.fillRect(0, H * 0.18, W, H * 0.06); g.fillRect(0, H * 0.76, W, H * 0.06);
  g.fillStyle = "rgba(30,34,30,0.8)"; g.fillRect(W / 2 - 2, 0, 4, H);
  g.strokeStyle = "rgba(30,34,30,0.9)"; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
});
/** the roof's tiles (u along the eave, v up the slope) */
const roofTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = COL.roof; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { const x = (i + 0.5) * W / 8, gr = g.createLinearGradient(x - W / 16, 0, x + W / 16, 0); gr.addColorStop(0, COL.roofLo); gr.addColorStop(0.5, shade(COL.roof, 0.14)); gr.addColorStop(1, COL.roofLo); g.fillStyle = gr; g.fillRect(x - W / 16, 0, W / 8, H); }
  g.fillStyle = "rgba(50,30,24,0.45)"; for (let y = 0; y < H; y += H / 5) g.fillRect(0, y, W, 3);
}, true);

// ---------------------------------------------------------------------------------------------------- the place
const buildBalcony = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "balcony";
  const Mk = maker(K, group);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(X0 + x, y, z);

  // ============================================================================================ THE HOUSE
  const front = frontTex();
  const frontM = Mk.tex(front, 0.92), stoneM = Mk.tex(stoneTex(331, COL.stone), 0.9), stoneLoM = Mk.tex(stoneTex(333, COL.stoneLo), 0.9);
  const HW = HOUSE.x1 - CORNER;
  const WIN = [{ x0: 1.75, x1: 2.45, y0: 0.9, y1: 2.0 }, { x0: 2.05, x1: 2.7, y0: 3.05, y1: 4.35 }];
  {
    // the front wall with its holes (the door, two windows), 0.3 thick; uv = the front painting
    const sh = new THREE.Shape([new THREE.Vector2(CORNER, 0), new THREE.Vector2(HOUSE.x1, 0), new THREE.Vector2(HOUSE.x1, HOUSE.top), new THREE.Vector2(CORNER, HOUSE.top)]);
    const door = new THREE.Path(); door.moveTo(DOOR.x0, FLOOR); door.lineTo(DOOR.x1, FLOOR); door.lineTo(DOOR.x1, DOOR_SPRING); door.absarc(DOOR_CX, DOOR_SPRING, DOOR_R, 0, Math.PI, false); door.lineTo(DOOR.x0, FLOOR);
    sh.holes.push(door);
    for (const w of WIN) sh.holes.push(new THREE.Path([new THREE.Vector2(w.x0, w.y0), new THREE.Vector2(w.x1, w.y0), new THREE.Vector2(w.x1, w.y1), new THREE.Vector2(w.x0, w.y1)]));
    const wall = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false, curveSegments: 20 }).translate(X0, 0, WALL_Z - 0.3);
    const p = wall.attributes.position as THREE.BufferAttribute, uv = wall.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - X0 - CORNER) / HW, p.getY(i) / HOUSE.top);
    Mk.mesh("balcony.house.front", wall, frontM);
    // the house behind (a plain block), the cornice, the roof
    const back = new THREE.BoxGeometry(HW, HOUSE.top, 6).translate(X0 + CORNER + HW / 2, HOUSE.top / 2, WALL_Z - 0.3 - 3 - 0.6);
    Mk.mesh("balcony.house.back", back, Mk.flat(COL.wallLo, 0.9));
    Mk.mesh("balcony.house.cornice", tileUV(new THREE.BoxGeometry(HW + 0.3, 0.24, 0.5).translate(X0 + CORNER + HW / 2 - 0.15, HOUSE.top + 0.1, WALL_Z - 0.12), 0.6), stoneM);
    const roof = new THREE.BoxGeometry(HW + 0.4, 0.14, 4.2).rotateX(-0.42).translate(X0 + CORNER + HW / 2 - 0.2, HOUSE.top + 1.0, WALL_Z - 1.8);
    { const u = roof.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * HW / 1.2, u.getY(i) * 4); }
    Mk.mesh("balcony.house.roof", roof, Mk.tex(roofTex(), 0.85));
    // quoins up the corner: slightly proud, alternating long and short (14 cm proud: a clear step)
    const Q = new Batch();
    for (let y = 0, i = 0; y < HOUSE.top - 0.1; y += 0.32, i++) Q.add(stoneM, tileUV(new THREE.BoxGeometry(i % 2 ? 0.34 : 0.55, 0.3, 0.14).translate(X0 + CORNER + (i % 2 ? 0.17 : 0.275) - 0.02, y + 0.16, WALL_Z + 0.06), 0.6));
    Q.flush(group, "balcony.house.quoins");
    // the windows: stone frames, closed shutters inside
    const shM = Mk.tex(shutterTex(), 0.85);
    for (const w of WIN) {
      Mk.mesh("balcony.window.shutter", new THREE.BoxGeometry(w.x1 - w.x0, w.y1 - w.y0, 0.06).translate(X0 + (w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2, WALL_Z - 0.2), shM);
      // (v5: the sill 4 mm over the hole's own foot and the lintel 4 mm under its head: each lay in the hole's plane and
      // the pair flickered, stone against stucco: parts/ground.ts, the audit of surfaces in one plane)
      Mk.mesh("balcony.window.sill", tileUV(new THREE.BoxGeometry(w.x1 - w.x0 + 0.24, 0.1, 0.26).translate(X0 + (w.x0 + w.x1) / 2, w.y0 - 0.046, WALL_Z + 0.03), 0.6), stoneM);
      Mk.mesh("balcony.window.lintel", tileUV(new THREE.BoxGeometry(w.x1 - w.x0 + 0.24, 0.16, 0.2).translate(X0 + (w.x0 + w.x1) / 2, w.y1 + 0.076, WALL_Z + 0.02), 0.6), stoneM);
    }
  }
  // ============================================================================================ THE DOORWAY AND HER ROOM
  {
    // the room: a warm painted card behind the door (unlit, NOINK), its floor, the reveal's stone surround
    const room = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4).translate(X0 + DOOR_CX, FLOOR + 1.2, WALL_Z - 0.88), new THREE.MeshBasicMaterial({ map: roomTex(), fog: false }));
    room.layers.set(NOINK); room.name = "balcony.room"; group.add(room);
    const roomSide = Mk.flat("#b07a4e", 0.9);
    // (v5: the room's floor starts where the wall's own doorway ends, z -0.30: its first 2 cm lay in the doorway's foot)
    Mk.mesh("balcony.room.floor", new THREE.BoxGeometry(1.6, 0.1, 0.58).translate(X0 + DOOR_CX, FLOOR - 0.05, WALL_Z - 0.59), Mk.flat("#9a6a44", 0.85));
    Mk.mesh("balcony.room.sideL", new THREE.BoxGeometry(0.1, 2.4, 0.6).translate(X0 + DOOR_CX - 0.8, FLOOR + 1.2, WALL_Z - 0.58), roomSide);
    Mk.mesh("balcony.room.sideR", new THREE.BoxGeometry(0.1, 2.4, 0.6).translate(X0 + DOOR_CX + 0.8, FLOOR + 1.2, WALL_Z - 0.58), roomSide);
    Mk.mesh("balcony.room.ceil", new THREE.BoxGeometry(1.7, 0.1, 0.6).translate(X0 + DOOR_CX, FLOOR + 2.45, WALL_Z - 0.58), roomSide);
    // a flat stone surround round the door (8 cm proud: under the camera-distance step band, reads as one line)
    const sur = new THREE.Shape(); const o = 0.16;
    sur.moveTo(DOOR.x0 - o, FLOOR); sur.lineTo(DOOR.x0, FLOOR); sur.lineTo(DOOR.x0, DOOR_SPRING); sur.absarc(DOOR_CX, DOOR_SPRING, DOOR_R, Math.PI, 0, true); sur.lineTo(DOOR.x1, FLOOR); sur.lineTo(DOOR.x1 + o, FLOOR); sur.lineTo(DOOR.x1 + o, DOOR_SPRING); sur.absarc(DOOR_CX, DOOR_SPRING, DOOR_R + o, 0, Math.PI, false); sur.lineTo(DOOR.x0 - o, FLOOR);
    // (v5: from the wall's own face, not 2 cm inside it: its inner sides lay in the doorway's own sides there)
    const sg = new THREE.ExtrudeGeometry(sur, { depth: 0.06, bevelEnabled: false, curveSegments: 20 }).translate(X0, 0, WALL_Z);
    Mk.mesh("balcony.door.surround", sg, stoneM);
    // the keystone
    Mk.mesh("balcony.door.key", new THREE.BoxGeometry(0.2, 0.3, 0.12).translate(X0 + DOOR_CX, DOOR.top + 0.08, WALL_Z + 0.04), stoneM);
  }
  // the curtains, tied back at both sides of the door (NOINK cloth with painted folds, a little sway)
  const curtainTex = paint(128, 512, (g, W, H) => {
    g.fillStyle = COL.curtain; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { const x = (i + 0.5) * W / 6, gr = g.createLinearGradient(x - W / 12, 0, x + W / 12, 0); gr.addColorStop(0, COL.curtainLo); gr.addColorStop(0.5, shade(COL.curtain, 0.12)); gr.addColorStop(1, COL.curtainLo); g.fillStyle = gr; g.fillRect(x - W / 12, 0, W / 6, H); }
    g.fillStyle = "#b08a4a"; g.fillRect(0, H * 0.58, W, H * 0.03);
    g.strokeStyle = "#2e1a1e"; g.lineWidth = 5; g.strokeRect(2, 2, W - 4, H - 4);
  });
  const curtains: THREE.Mesh[] = [];
  {
    const m = K.M.paint({ color: "#ffffff", map: curtainTex, roughness: 0.9, specular: 0.1, envMapIntensity: 0.4, side: THREE.DoubleSide }) as THREE.MeshPhysicalMaterial;
    for (const sgn of [-1, 1]) {
      // a gathered panel: wide at the top, pinched at the tie (58 % down), flaring again to the floor
      const g = new THREE.PlaneGeometry(0.34, 2.0, 4, 16), p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), v = (1 - y) / 2, pinch = 1 - 0.55 * Math.exp(-(((v - 0.58) / 0.16) ** 2));
        p.setXYZ(i, x * pinch + sgn * (0.06 * (1 - pinch)), y, 0.04 * Math.sin(x * 30));
      }
      g.computeVertexNormals();
      const c = new THREE.Mesh(g.translate(X0 + DOOR_CX + sgn * (DOOR_R - 0.14), FLOOR + 1.0, WALL_Z - 0.34), m);
      c.layers.set(NOINK); c.name = "balcony.curtain"; c.castShadow = true; group.add(c); curtains.push(c);
    }
  }

  // ============================================================================================ THE BALCONY
  {
    const B = new Batch();
    // the slab (moulded edge painted), 18 cm thick
    const T = (g: THREE.BufferGeometry) => tileUV(g, 0.6);
    B.add(stoneM, T(new THREE.BoxGeometry(SLAB.x1 - SLAB.x0, 0.18, SLAB.z1 - WALL_Z).translate(X0 + (SLAB.x0 + SLAB.x1) / 2, FLOOR - 0.09, (WALL_Z + SLAB.z1) / 2)));
    B.add(stoneLoM, T(new THREE.BoxGeometry(SLAB.x1 - SLAB.x0 - 0.1, 0.1, SLAB.z1 - WALL_Z - 0.06).translate(X0 + (SLAB.x0 + SLAB.x1) / 2, FLOOR - 0.23, (WALL_Z + SLAB.z1) / 2 - 0.03)));
    // three scroll corbels (an S profile in z-y, extruded along x)
    const prof: [number, number][] = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14; prof.push([WALL_Z + 0.85 * (1 - Math.pow(1 - t, 1.6)), FLOOR - 0.28 - 0.62 * (1 - t) + 0.07 * Math.sin(Math.PI * t)]); }
    // (v5: no spike down the wall under the scroll's foot: it was a 5 cm face lying in the wall's own plane)
    const cs = new THREE.Shape([new THREE.Vector2(WALL_Z, FLOOR - 0.28), ...prof.slice().reverse().map(([z, y]) => new THREE.Vector2(z, y))]);
    for (const cx of [-0.55, 0.25, 1.05]) {
      // the shape's x is world z; rotateY(-90 deg) maps (x, y, z) -> (-z, y, x): the extrusion runs along -x
      B.add(stoneM, new THREE.ExtrudeGeometry(cs, { depth: 0.2, bevelEnabled: false, curveSegments: 8 }).rotateY(-Math.PI / 2).translate(X0 + cx + 0.1, 0, 0));
    }
    // the balustrade: plinth, top rail, end posts, balusters (r 5.5 cm, 12 sides, smooth)
    const railD = 0.16, rz = RAIL_Z;
    B.add(stoneM, T(new THREE.BoxGeometry(SLAB.x1 - SLAB.x0 - 0.04, 0.12, railD + 0.02).translate(X0 + (SLAB.x0 + SLAB.x1) / 2, FLOOR + 0.06, rz)));
    B.add(stoneM, T(new THREE.BoxGeometry(SLAB.x1 - SLAB.x0 + 0.04, 0.11, railD + 0.06).translate(X0 + (SLAB.x0 + SLAB.x1) / 2, RAIL_TOP - 0.055, rz)));
    for (const ex of [SLAB.x0 + 0.08, SLAB.x1 - 0.08]) {
      B.add(stoneM, T(new THREE.BoxGeometry(0.16, RAIL_TOP - FLOOR - 0.1, 0.16).translate(X0 + ex, (FLOOR + RAIL_TOP - 0.1) / 2, rz)));
      // the side rails back to the wall
      B.add(stoneM, T(new THREE.BoxGeometry(railD + 0.06, 0.11, RAIL_Z - WALL_Z).translate(X0 + ex, RAIL_TOP - 0.055, (RAIL_Z + WALL_Z) / 2)));
      B.add(stoneM, T(new THREE.BoxGeometry(railD, 0.12, RAIL_Z - WALL_Z).translate(X0 + ex, FLOOR + 0.06, (RAIL_Z + WALL_Z) / 2)));
    }
    const balH = RAIL_TOP - 0.11 - (FLOOR + 0.12), baluster = lathe([[0.045, 0], [0.05, 0.06], [0.035, 0.1], [0.035, 0.16], [0.058, 0.32], [0.06, 0.4], [0.04, 0.52], [0.03, 0.6], [0.04, 0.66], [0.046, 0.7]].map(([r, y]) => [r, (y / 0.7) * balH] as [number, number]), 14);
    const n = 11, xa = SLAB.x0 + 0.24, xb = SLAB.x1 - 0.24;
    for (let i = 0; i < n; i++) B.add(stoneM, baluster.clone().translate(X0 + xa + ((xb - xa) * i) / (n - 1), FLOOR + 0.12, rz));
    for (const ex of [SLAB.x0 + 0.08, SLAB.x1 - 0.08]) for (let k = 1; k <= 3; k++) B.add(stoneM, baluster.clone().translate(X0 + ex, FLOOR + 0.12, RAIL_Z - (k * (RAIL_Z - WALL_Z)) / 4));
    B.flush(group, "balcony.balcony");
  }
  // two pots of white jasmine against the wall beside the door (props-kit Part)
  {
    const P = new Part(K), potM = K.flat(COL.pot, { rough: 0.85 }), potLoM = K.flat(COL.potLo, { rough: 0.85 });
    const jas = K.flat(COL.jasmine, { map: foliageTex(341, false), rough: 0.95 }), fl = K.flat(COL.flower, { rough: 0.7 });
    const r = rng(343);
    for (const [x, z] of [[-0.6, WALL_Z + 0.25], [1.08, WALL_Z + 0.25]] as [number, number][]) {
      P.add(potM, lathe([[0.0, 0], [0.12, 0], [0.15, 0.06], [0.17, 0.24], [0.19, 0.27], [0.19, 0.3], [0.0, 0.3]], 16).translate(X0 + x, FLOOR, z), 0.006);
      P.add(potLoM, new THREE.CylinderGeometry(0.16, 0.16, 0.02, 16).translate(X0 + x, FLOOR + 0.3, z), 0);
      P.add(jas, blobG(345 + Math.round(x * 10), 2, 0.25).scale(0.26, 0.3, 0.22).translate(X0 + x, FLOOR + 0.52, z), 0.006);
      for (let i = 0; i < 16; i++) { const a = r() * 6.28, e = r() * 1.2; P.add(fl, new THREE.IcosahedronGeometry(0.022, 1).translate(X0 + x + Math.cos(a) * Math.cos(e) * 0.25, FLOOR + 0.52 + Math.sin(e) * 0.28, z + Math.sin(a) * Math.cos(e) * 0.2), 0.004); }
    }
    P.into(group, "balcony.pots");
  }
  // IVY in leaves: crossed cards up the corner and hanging off the slab's left end
  const ivyM = (() => { const m = K.M.paint({ color: "#ffffff", map: leafClusterTex("ivy", COL.ivy, COL.ivyHi, COL.ivyLine, 351, 40), roughness: 0.9, specular: 0.2, envMapIntensity: 0.5, side: THREE.DoubleSide }) as THREE.MeshPhysicalMaterial; m.alphaTest = 0.5; return m; })();
  {
    const B = new Batch(), r = rng(353);
    for (let i = 0; i < 9; i++) { const y = 0.3 + i * 0.32; for (const gq of crossCardsG(V(CORNER + 0.12 + 0.15 * r(), y, WALL_Z + 0.12), 0.42 + 0.15 * r(), r() * 3, 1.1)) B.add(ivyM, gq); }
    for (let i = 0; i < 6; i++) for (const gq of crossCardsG(V(SLAB.x0 + 0.05 + 0.5 * r(), FLOOR - 0.35 - 0.2 * r(), WALL_Z + 0.3 + 0.9 * r()), 0.4, r() * 3, 1.3)) B.add(ivyM, gq);
    for (let i = 0; i < 3; i++) for (const gq of crossCardsG(V(2.1 + 0.3 * r(), 0.4 + 0.5 * i, WALL_Z + 0.1), 0.4, r() * 3)) B.add(ivyM, gq);
    B.flush(group, "balcony.ivy", false, true);
    group.children.filter((c) => c.name === "balcony.ivy").forEach((c) => c.layers.set(NOINK));
  }

  // ============================================================================================ THE ORCHARD
  {
    const S = 2048, gtex = groundPaint(S);
    // (v5: a grid, not the kit's one 600 m quad, which lands a pixel off on every frame: parts/ground.ts)
    Mk.mesh("balcony.ground", groundGrid(X0, 0.5, 20, 300, { fine: 14, at: [X0, 2] }), Mk.tex(gtex, 0.95), { cast: false });
  }
  const leafM = K.flat("#4c6c4a", { map: foliageTex(361, false), rough: 0.95 });
  const pearM = K.flat("#4a6a46", { map: foliageTex(363, true), rough: 0.95 });
  const bushLeafM = (() => { const m = K.M.paint({ color: "#ffffff", map: leafClusterTex("oval", COL.leaf, COL.leafHi, "#16221a", 369, 36), roughness: 0.9, specular: 0.2, envMapIntensity: 0.5, side: THREE.DoubleSide }) as THREE.MeshPhysicalMaterial; m.alphaTest = 0.5; return m; })();
  const leafCards = new Batch();
  {
    const B = new Batch(), r = rng(365);
    const barkM = Mk.flat(COL.bark, 0.9);
    const tint = (c: string) => K.flat(c, { map: foliageTex(367, true), rough: 0.95 });
    const crownMs = [tint("#4a6a48"), tint("#56764e"), tint("#3e5e42")];
    // fruit trees: a gnarled trunk splitting in two, a round crown of 4 blobs
    for (const [x, z, s] of [[-1.95, -0.3, 1.0], [2.55, -0.65, 1.0], [-2.7, 2.5, 1.05], [3.0, 3.6, 0.95], [-3.8, -1.0, 1.1], [-1.2, 4.6, 0.9], [4.6, 1.2, 1.0]] as [number, number, number][]) {
      const base = V(x, -0.05, z), mid = V(x + (r() - 0.5) * 0.3, 1.25 * s, z + (r() - 0.5) * 0.2);
      for (const gq of bentLimb(base, mid, 0.15 * s, 0.11 * s, new THREE.Vector3((r() - 0.5) * 0.2, 0, 0))) B.add(barkM, gq);
      for (const sgn of [-1, 1]) { const tip = mid.clone().add(new THREE.Vector3(sgn * 0.55 * s, 0.75 * s, (r() - 0.5) * 0.4)); for (const gq of bentLimb(mid, tip, 0.1 * s, 0.06 * s, new THREE.Vector3(0, 0.1, 0))) B.add(barkM, gq); }
      for (let k = 0; k < 4; k++) { const a = (k / 4) * 6.28 + r(), c = mid.clone().add(new THREE.Vector3(Math.cos(a) * 0.55 * s, (0.95 + 0.35 * r()) * s, Math.sin(a) * 0.45 * s)); B.add(crownMs[k % 3], blobG(370 + k + Math.round(x * 13), 2, 0.2).scale(0.75 * s, 0.6 * s, 0.7 * s).translate(c.x, c.y, c.z)); }
      B.add(crownMs[1], blobG(380 + Math.round(z * 11), 2, 0.2).scale(0.8 * s, 0.65 * s, 0.75 * s).translate(mid.x, mid.y + 1.45 * s, mid.z));
    }
    // THE BUSHES round his mark (0.35, 0.35): none closer than ~0.35 m to him
    const bush = (x: number, z: number, w: number, h: number, d: number, seed: number, m: THREE.Material) => {
      B.add(m, blobG(seed, 2, 0.24).scale(w / 2, h / 2, d / 2).translate(X0 + x, h * 0.42, z));
      // leaf clusters round its top and sides: a leafy silhouette instead of a boulder's
      const q = rng(seed);
      for (let i = 0; i < 7; i++) { const a = q() * 6.28, e = 0.2 + 0.9 * q(); for (const gq of crossCardsG(V(x + Math.cos(a) * Math.cos(e) * w * 0.45, h * 0.42 + Math.sin(e) * h * 0.45, z + Math.sin(a) * Math.cos(e) * d * 0.45), 0.32 + 0.12 * q(), q() * 3)) leafCards.add(bushLeafM, gq); }
    };
    bush(-0.5, 0.3, 0.9, 0.95, 0.8, 391, leafM); bush(1.2, 0.15, 0.8, 0.9, 0.75, 392, leafM); bush(0.2, -0.55, 1.1, 1.0, 0.7, 393, pearM);
    bush(0.05, 1.12, 0.85, 0.72, 0.55, 394, leafM); bush(0.75, 1.15, 0.7, 0.66, 0.5, 395, leafM); bush(-1.1, 1.0, 0.8, 0.7, 0.7, 396, leafM);
    bush(-0.9, -0.9, 0.9, 1.05, 0.7, 397, leafM); bush(1.6, -1.05, 1.0, 1.1, 0.7, 398, leafM);
    // the laurel at the right front (his close camera looks past its leaves)
    const laurelM = K.flat("#4e6e4c", { map: foliageTex(399, false), rough: 0.95 });
    B.add(laurelM, blobG(401, 2, 0.24).scale(0.55, 0.58, 0.5).translate(X0 + 1.55, 0.55, 1.8));
    B.add(laurelM, blobG(402, 2, 0.24).scale(0.38, 0.4, 0.36).translate(X0 + 1.5, 1.0, 1.4));
    B.flush(group, "balcony.orchard");
    leafCards.flush(group, "balcony.bushLeaves", false, true);
    group.children.filter((c) => c.name === "balcony.bushLeaves").forEach((c) => c.layers.set(NOINK));
  }
  // laurel leaf cards near his close camera (the foreground leaves) and on the laurel
  const laurelLeafM = (() => { const m = K.M.paint({ color: "#ffffff", map: leafClusterTex("oval", COL.laurel, COL.laurelHi, "#1a2a1e", 403, 30), roughness: 0.9, specular: 0.2, envMapIntensity: 0.5, side: THREE.DoubleSide }) as THREE.MeshPhysicalMaterial; m.alphaTest = 0.5; return m; })();
  {
    const B = new Batch();
    for (const [x, y, z, s] of [[0.78, 0.98, 1.7, 0.24], [0.95, 1.22, 1.62, 0.22], [1.0, 1.35, 1.5, 0.35], [0.85, 0.75, 1.75, 0.3]] as [number, number, number, number][]) for (const gq of crossCardsG(V(x, y, z), s, x * 3)) B.add(laurelLeafM, gq);
    B.flush(group, "balcony.laurelLeaves", false, true);
    group.children.filter((c) => c.name === "balcony.laurelLeaves").forEach((c) => c.layers.set(NOINK));
  }
  // THE ORCHARD WALL on the right (toward the camera) and the back wall at the left behind the corner
  {
    const wallM = K.flat("#ffffff", { map: stoneTex(411, "#ae9e86"), rough: 0.92 });
    const B = new Batch();
    const wl = new THREE.BoxGeometry(0.4, 2.2, 9).translate(X0 + 3.15, 1.1, WALL_Z + 4.5);
    { const u = wl.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 6, u.getY(i) * 1.5); }
    B.add(wallM, wl);
    B.add(stoneM, new THREE.BoxGeometry(0.52, 0.12, 9.1).translate(X0 + 3.15, 2.26, WALL_Z + 4.5));
    const bw = new THREE.BoxGeometry(14, 2.5, 0.4).translate(X0 + CORNER - 7, 1.25, -6.5);
    { const u = bw.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 9, u.getY(i) * 1.6); }
    B.add(wallM, bw);
    B.add(stoneM, new THREE.BoxGeometry(14.1, 0.12, 0.52).translate(X0 + CORNER - 7, 2.56, -6.5));
    B.flush(group, "balcony.walls");
  }

  // ============================================================================================ the night: ring, sky, moon
  const azR = (MOON.az * Math.PI) / 180, elR = (MOON.el * Math.PI) / 180;
  const MOON_DIR = new THREE.Vector3(Math.sin(azR) * Math.cos(elR), Math.sin(elR), -Math.cos(azR) * Math.cos(elR));
  const moonR = MOON.dist * Math.tan(((MOON.deg / 2) * Math.PI) / 180), moonAt = REVEAL_EYE.clone().addScaledVector(MOON_DIR, MOON.dist);
  {
    const moonTex = paint(256, 256, (g, W) => {
      const r = rng(421), c = W / 2;
      g.clearRect(0, 0, W, W); g.save(); g.beginPath(); g.arc(c, c, c - 2, 0, 7); g.clip();
      g.fillStyle = COL.moon; g.fillRect(0, 0, W, W);
      for (let i = 0; i < 8; i++) blotch(g, c + (r() - 0.5) * W * 0.6, c + (r() - 0.5) * W * 0.6, 16 + 28 * r(), COL.moonLo, 0.7);
      const gr = g.createRadialGradient(c, c, c * 0.65, c, c, c); gr.addColorStop(0, "rgba(255,255,240,0)"); gr.addColorStop(1, "rgba(255,255,244,0.55)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
      g.restore();
    });
    const moon = new THREE.Mesh(new THREE.CircleGeometry(moonR, 48), new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, fog: false, depthWrite: false }));
    moon.name = "balcony.moon"; moon.layers.set(NOINK); moon.renderOrder = -66; moon.position.copy(moonAt); moon.lookAt(REVEAL_EYE); group.add(moon);
    const halo = glowSprite(moonR * 3.2, COL.moonGlow, 0.5); halo.name = "balcony.moon.halo"; halo.renderOrder = -67; halo.position.copy(moonAt).addScaledVector(MOON_DIR, 2); halo.lookAt(REVEAL_EYE); group.add(halo);
    const ring = panoramaRing(X0, -1, 34, -1, 30, 4096, 1024, 1.5, (g: G2, k) => {
      g.clearRect(0, 0, k.W, k.H);
      const r = rng(423);
      // a moonlit haze along the horizon
      const hg = g.createLinearGradient(0, k.row(5), 0, k.row(-1)); hg.addColorStop(0, "rgba(120,124,150,0)"); hg.addColorStop(1, "rgba(110,114,140,0.6)"); g.fillStyle = hg; g.fillRect(0, k.row(5), k.W, k.row(-1) - k.row(5));
      // far hills, then Verona's roofs and towers with a few warm windows (left half), the orchard's trees round
      const range = (a0: number, a1: number, base: number, amp: number, col: string, f: number, ph: number) => { g.fillStyle = col; g.beginPath(); g.moveTo(k.col(a0), k.row(-1)); for (let a = a0; a <= a1; a += 1) g.lineTo(k.col(a), k.row(base + amp * (0.55 + 0.3 * Math.sin(a * f + ph) + 0.15 * Math.sin(a * f * 2.7 + ph * 2)))); g.lineTo(k.col(a1), k.row(-1)); g.closePath(); g.fill(); };
      range(-180, 180, 2.2, 2.6, "#4a5068", 0.05, 1.1); range(-180, 180, 1.2, 1.4, "#40465c", 0.09, 0.4);
      for (let i = 0; i < 70; i++) { const a = -70 + 60 * r(), x = k.col(a), w = 6 + 16 * r(), h = k.row(0) - k.row(1.0 + 1.6 * r()); g.fillStyle = "#3a3f52"; g.fillRect(x, k.row(0) - h, w, h + 4); if (r() < 0.35) { blotch(g, x + w / 2, k.row(0) - h * 0.5, 5, "#ffbe78", 0.6); g.fillStyle = "#ffd49a"; g.fillRect(x + w / 2 - 1.5, k.row(0) - h * 0.5 - 1.5, 3, 3); } }
      for (const a of [-52, -33, -24]) { const x = k.col(a), w = 10, top = k.row(4 + 2 * r()); g.fillStyle = "#363b4e"; g.fillRect(x - w / 2, top, w, k.row(0) - top); g.beginPath(); g.moveTo(x - w * 0.8, top); g.lineTo(x, top - 18); g.lineTo(x + w * 0.8, top); g.fill(); }
      // tall cypresses beyond the orchard wall (dark flames), clear of the moon
      for (let i = 0; i < 26; i++) {
        const a = -100 + 80 * r(); if (Math.abs(a - MOON.az) < 7) continue;
        const x = k.col(a), hgt = k.row(0) - k.row(6 + 6 * r()), w = hgt * 0.16, base = k.row(0) + 2;
        g.fillStyle = r() < 0.5 ? "#2e3a34" : "#34403a"; g.beginPath(); g.moveTo(x - w / 2, base); g.quadraticCurveTo(x - w * 0.7, base - hgt * 0.5, x, base - hgt); g.quadraticCurveTo(x + w * 0.7, base - hgt * 0.5, x + w / 2, base); g.closePath(); g.fill();
      }
      // round orchard crowns low all round
      for (let i = 0; i < 120; i++) { const a = 360 * r(), x = k.col(a), rr = 18 + 26 * r(), y = k.row(1.5 + 2 * r()); g.fillStyle = r() < 0.5 ? "#34423a" : "#3a4840"; g.beginPath(); g.ellipse(x, y, rr * 1.3, rr, 0, 0, 7); g.fill(); g.fillRect(x - rr * 1.3, y, rr * 2.6, k.row(-1) - y); }
    });
    ring.name = "balcony.far"; (ring.material as THREE.MeshBasicMaterial).transparent = true; group.add(ring);
    const mu = 0.75 - MOON.az / 360;
    group.add(skyDome(new THREE.Vector3(X0, 0, -1), SKY, (g, W, H) => {
      const r = rng(425), elY = (el: number) => (H * (90 - el)) / 180, mx = W * (mu % 1);
      for (let i = 0; i < 320; i++) { const x = W * r(), el = 8 + 82 * Math.sqrt(r()), y = elY(el), s = r(); const dx = Math.min(Math.abs(x - mx), W - Math.abs(x - mx)); if (Math.hypot(dx, y - elY(MOON.el)) < 160) continue; g.fillStyle = css(s < 0.85 ? "#e4e4f0" : "#fff0cc", 0.35 + 0.5 * r()); g.beginPath(); g.arc(x, y, s < 0.9 ? 1.3 : 2.2, 0, 7); g.fill(); }
      for (const dx of [-W, 0, W]) { blotch(g, mx + dx, elY(MOON.el), 380, "#6a6e8e", 0.55); blotch(g, mx + dx, elY(MOON.el), 160, "#8a8eaa", 0.5); }
    }));
  }

  // ============================================================================================ the light
  const L = lightRig(group, { dir: [-0.62, 0.62, 0.48], k: 1.35, col: "#c2c8de", at: [X0 + 0.5, 0, -0.5], half: 8, hemi: ["#6a7090", "#2c2c2a", 1.25], point: { col: "#ffae5c", k: 7.5, at: [X0 + DOOR_CX, FLOOR + 1.05, WALL_Z + 0.35], dist: 5.5 } });
  L.point.decay = 1.6;
  // the door's glow on the night air (soft, additive)
  const doorGlow = glowSprite(1.3, "#ffb868", 0.22); doorGlow.position.set(X0 + DOOR_CX, FLOOR + 1.2, WALL_Z + 0.25); doorGlow.name = "balcony.door.glow"; group.add(doorGlow);

  const pose = (t: number) => {
    const k = 1 + 0.025 * Math.sin(t * 5.3) + 0.015 * Math.sin(t * 8.7 + 1.1);
    L.point.intensity = 7.5 * k;
    curtains.forEach((c, i) => { c.rotation.set(0, 0, 0); c.position.z = 0.012 * Math.sin(t * 0.8 + i * 1.7); });
  };
  pose(0);
  return { group, animate(t: number) { pose(t); } };
};

export const BALCONY: PlaceDef = { look: BALCONY_LOOK, params: BALCONY_PARAMS, build: buildBalcony };

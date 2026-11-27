// THE STREET (place "street", island x 400): the pavement in front of 小满's office tower, a winter evening in a big city.
// The tower's podium wall stands at z = STREET.wallZ (grey stone cladding); in the middle three steps go up to a landing
// and a glass double door (a warm lobby behind it, 云海大厦 over it); to the left a small noodle shop in the podium (its
// lit window, a red 面 sign box, a menu board, ONE round table with two stools); to the right a street lamp, a parked
// delivery scooter, a bare tree in a pavement square with year-end fairy lights. Above the podium the tower's glass shaft
// rises from x -0.6 to the right; to its LEFT the sky is open over the podium roof and the far skyline: the full moon
// stands there (upper left from the steps).
// PARAMS
//   time  "dusk" | "night"   19:00 (blue-orange twilight) | 22:00+ (dark, full moon, shop closing, few office windows)
//   door  0..1               the glass double door's two leaves slide apart
//   lit   0..1               share of the tower's office windows lit (at night x0.45); HER window stays lit if lit > 0
//   moon  0..1               extra glow of the moon (a bigger halo and ring)
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { ceilQuad } from "../../romeo/sets/parts/b_common";
import { ISLAND, STREET as S } from "../places";
import { maker, boxG, paint, rng, css, blotch, NOINK, glowCard, lightPool, levelQuad, tileUV, bar, FONT, lightRig, V, flatFace } from "./common";

const X0 = ISLAND.street;
const WZ: number = S.wallZ, WB = WZ - 0.3;             // the podium wall's front and back faces
const POD = 4.4, CORN = 4.65;                  // the podium's top, its cornice's top
const FAR_X = -96, RIGHT_X = 152;                             // how far the street goes on to the left (scene J looks down it)
const BAY = { x0: -2.0, x1: 2.0, top: 3.4 };   // the glazed entrance bay
const SHOP = { x0: -5.2, x1: -2.2, y0: 0.45, y1: 2.7, back: WZ - 2.2 };
const TW = { x0: -0.6, cols: 10, cw: 1.5, fh: 3.6, floors: 25 };   // the tower shaft (front face at z = WB)
const LAMP_HEAD = V(1.45, 2.95, S.lamp.z);
/** the moon: its direction from the usual camera spot (0.3, 1.5, 1.6): 26 deg left of -z, 40 deg up; 150 m away */
const MOON_DIR = (() => { const az = (-26 * Math.PI) / 180, el = (40 * Math.PI) / 180; return V(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)); })();
const MOON_AT = V(0.3, 1.5, 1.6).addScaledVector(MOON_DIR, 150);
/** the moon's centre (street local), for a camera that tilts up to it */
export const MOON_LOCAL: [number, number, number] = [MOON_AT.x, MOON_AT.y, MOON_AT.z];
/** HER window: third floor up (the second office floor over the podium), the third column right of the tower's left edge */
const HERS = { i: 2, j: 1 };
export const STREET_HER_WINDOW = { x: TW.x0 + TW.cw * (HERS.i + 0.5), y: CORN + TW.fh * HERS.j + 2.25, z: WB } as const;

export type StreetTime = "dusk" | "night";
type TL = {
  key: [number, number, number]; keyCol: string; keyK: number; hemi: [string, string, number]; lampK: number;
  env: number; tint: string; sky: number; skyline: string; tower: string; shop: number; shopPool: number; lobby: number; spill: number; moon: boolean; litK: number; cast: Partial<CastLight>;
};
const TL_: Record<StreetTime, TL> = {
  dusk: {
    key: [-0.45, 0.55, 0.7], keyCol: "#ffb890", keyK: 0.6, hemi: ["#7a8cd0", "#363648", 1.3], lampK: 3.5,
    env: 1.0, tint: "#f0f0ff", sky: 0, skyline: "#5d6688", tower: "#8c98bc", shop: 1.0, shopPool: 0.3, lobby: 0.84, spill: 0.22, moon: false, litK: 1,
    cast: flatFace({ key: [0.62, 0.5, 0.6], tint: [1.0, 0.88, 0.76], tintK: 0.55, gain: 0.96, grad: 0.22, shade: [0.92, 0.96, 1.4], shadeK: 0.44, broad: 0.24, sheen: 0.16, edge: 0.16 }) as unknown as Partial<CastLight>,
  },
  night: {
    key: [-0.4, 0.8, 0.45], keyCol: "#9fb2e0", keyK: 0.25, hemi: ["#3e4c80", "#1a1822", 1.0], lampK: 9,
    env: 0.4, tint: "#a4acc4", sky: 1, skyline: "#222a44", tower: "#4c5674", shop: 0.62, shopPool: 0.16, lobby: 0.9, spill: 0.42, moon: true, litK: 0.45,
    cast: flatFace({ key: [0.66, 0.52, 0.54], tint: [1.0, 0.8, 0.6], tintK: 0.72, gain: 0.9, grad: 0.24, shade: [0.88, 0.94, 1.5], shadeK: 0.5, broad: 0.3, sheen: 0.26, edge: 0.2 }, 0.1) as unknown as Partial<CastLight>,
  },
};
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.2, 0.19, 0.22]], [0, [0.36, 0.38, 0.48]], [90, [0.4, 0.45, 0.62]]],
  boxes: [{ az: 100, el: 20, rot: 0, w: 40, h: 24, soft: 18, col: [0.95, 0.78, 0.6] }],
};
const LOOK: PlaceLook = {
  bg: "#141a2e",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.6, color: "#1c1e2c" },
  cast: { bodyGrad: 0.16, sideTint: [0.9, 0.92, 1.0], wrap: [30, 60], bodySat: 0.13, lift: 0.03, contactLen: 0.3, ...TL_.dusk.cast, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.5,
};
const PARAMS: Record<string, ParamValue> = { time: "dusk", door: 0, lit: 0.5, moon: 0 };

// ===================================================================================================== paintings
const paverTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(401), n = 4, c = W / n;
  g.fillStyle = "#56585e"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const k = r(), base = k < 0.33 ? "#8d8f95" : k < 0.66 ? "#85878d" : "#929398";
    g.fillStyle = base; g.fillRect(i * c + 3, j * c + 3, c - 6, c - 6);
    for (let q = 0; q < 4; q++) blotch(g, i * c + c * r(), j * c + c * r(), c * (0.15 + 0.3 * r()), r() < 0.5 ? "#77797f" : "#9c9da2", 0.18);
  }
  const r2 = rng(402);
  for (let q = 0; q < 6; q++) blotch(g, W * r2(), H * r2(), W * (0.05 + 0.08 * r2()), "#5e6066", 0.12);   // old stains
}, true);
const stoneTex = (seed: number, base: string) => paint(512, 512, (g, W, H) => {
  const r = rng(seed); g.fillStyle = "#4e5258"; g.fillRect(0, 0, W, H);
  const cw = W / 2, ch = H / 4;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) {
    g.fillStyle = base; g.fillRect(i * cw + 2, j * ch + 2, cw - 4, ch - 4);
    for (let q = 0; q < 5; q++) blotch(g, i * cw + cw * r(), j * ch + ch * r(), cw * (0.12 + 0.3 * r()), r() < 0.5 ? "#6c7076" : "#8a8e94", 0.14);
  }
  for (let q = 0; q < 4; q++) { const x = W * r(); g.fillStyle = css("#555a62", 0.12); g.fillRect(x, 0, 6 + 10 * r(), H); }   // rain streaks
}, true);
const graniteTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(405); g.fillStyle = "#9c9a96"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) blotch(g, W * r(), H * r(), W * (0.08 + 0.15 * r()), r() < 0.5 ? "#8a8884" : "#aaa8a2", 0.18);
}, true);
const towerTex = () => paint(128, 256, (g, W, H) => {
  // one cell: 1.5 m x 3.6 m; spandrel at the bottom (0.95 m), glass above, mullions at the sides
  const sp = H * (0.95 / 3.6);
  const gr = g.createLinearGradient(0, 0, 0, H - sp); gr.addColorStop(0, "#56688c"); gr.addColorStop(1, "#3a4866");
  g.fillStyle = gr; g.fillRect(0, 0, W, H - sp);
  g.fillStyle = css("#9aaccc", 0.16); g.beginPath(); g.moveTo(W * 0.15, 0); g.lineTo(W * 0.45, 0); g.lineTo(W * 0.2, H - sp); g.lineTo(W * 0.02, H - sp); g.fill();
  g.fillStyle = "#5d6270"; g.fillRect(0, H - sp, W, sp);
  g.fillStyle = "#4a4e5a"; g.fillRect(0, H - sp, W, 4);
  g.fillStyle = "#6c7280"; g.fillRect(0, 0, 6, H); g.fillRect(W - 6, 0, 6, H);
}, true);
const litWinTex = () => paint(64, 128, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, "#f2ece2"); gr.addColorStop(1, "#c8bca8");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "#ffffff"; g.fillRect(4, 8, W - 8, 5);                         // a ceiling light strip
  blotch(g, W * 0.5, H * 0.2, W * 0.6, "#ffffff", 0.5);
  g.fillStyle = css("#8a7e6c", 0.35); g.fillRect(0, H * 0.8, W, H * 0.2);       // desks below the sill line
});
const skyTex = (night: boolean) => paint(1024, 512, (g, W, H) => {
  // equirect: canvas top = zenith, middle = horizon
  const gr = g.createLinearGradient(0, 0, 0, H);
  if (night) { gr.addColorStop(0, "#060a18"); gr.addColorStop(0.3, "#0b1328"); gr.addColorStop(0.46, "#1c2846"); gr.addColorStop(0.5, "#2a3452"); gr.addColorStop(1, "#141826"); }
  else { gr.addColorStop(0, "#1a2656"); gr.addColorStop(0.18, "#2c3c78"); gr.addColorStop(0.27, "#5c5a98"); gr.addColorStop(0.34, "#b8748e"); gr.addColorStop(0.41, "#ec9a6c"); gr.addColorStop(0.5, "#f6b878"); gr.addColorStop(1, "#2e2a3a"); }
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(night ? 411 : 412);
  if (!night) for (let i = 0; i < 14; i++) blotch(g, W * r(), H * (0.24 + 0.12 * r()), W * (0.04 + 0.05 * r()), "#c47a7c", 0.18);   // pink cloud wisps
});
const moonTex = () => paint(256, 256, (g, W) => {
  const c = W / 2, R = W * 0.48;
  g.clearRect(0, 0, W, W);
  const gr = g.createRadialGradient(c - R * 0.2, c - R * 0.2, R * 0.1, c, c, R); gr.addColorStop(0, "#fffbec"); gr.addColorStop(0.8, "#fbefd0"); gr.addColorStop(1, "#efdfb8");
  g.fillStyle = gr; g.beginPath(); g.arc(c, c, R, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(c, c, R, 0, 7); g.clip();
  const r = rng(415);
  for (const [x, y, s] of [[-0.25, -0.2, 0.28], [0.15, -0.3, 0.2], [0.25, 0.05, 0.24], [-0.05, 0.25, 0.18], [-0.35, 0.15, 0.14]]) blotch(g, c + x * R, c + y * R, s * R, "#d8cba8", 0.55);
  for (let i = 0; i < 9; i++) { g.strokeStyle = css("#e2d4b0", 0.6); g.lineWidth = 2; g.beginPath(); g.arc(c + (r() - 0.5) * R * 1.4, c + (r() - 0.5) * R * 1.4, 4 + 8 * r(), 0, 7); g.stroke(); }
  g.restore();
});
const cloudTex = () => paint(512, 256, (g, W, H) => {
  g.clearRect(0, 0, W, H); const r = rng(417);
  for (let k = 0; k < 3; k++) { const y = H * (0.3 + 0.22 * k); for (let i = 0; i < 26; i++) { const x = W * (0.08 + 0.84 * r()); g.fillStyle = css("#ffffff", 0.05 + 0.06 * r()); g.beginPath(); g.ellipse(x, y + 10 * (r() - 0.5), W * (0.04 + 0.08 * r()), 5 + 7 * r(), 0, 0, 7); g.fill(); } }
});
const ringTex = () => paint(256, 256, (g, W) => {
  const c = W / 2, gr = g.createRadialGradient(c, c, 0, c, c, c);
  gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.62, "rgba(255,255,255,0)"); gr.addColorStop(0.8, "rgba(255,255,255,0.9)"); gr.addColorStop(0.86, "rgba(255,240,220,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, W);
});
const skylineTex = () => paint(2048, 512, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  const r = rng(421); let x = 0;
  const tops: [number, number, number][] = [];
  while (x < W) {
    const w = 50 + 110 * r(), h = H * (0.3 + 0.62 * r() * r());
    g.fillStyle = "#ffffff"; g.fillRect(x, H - h, w, h);
    if (r() < 0.3) g.fillRect(x + w * 0.4, H - h - 30, 4, 30);    // a mast
    tops.push([x, w, h]); x += w + 6 * r();
  }
  for (const [bx, w, h] of tops) for (let y = H - h + 10; y < H - 6; y += 12) for (let q = bx + 6; q < bx + w - 6; q += 10) if (r() < 0.16) { g.fillStyle = r() < 0.6 ? "#ffd99a" : "#e6eeff"; g.fillRect(q, y, 5, 6); }
  for (const [bx, w, h] of tops) if (h > H * 0.62) { g.fillStyle = "#ff5040"; g.fillRect(bx + w / 2 - 3, H - h - 4, 6, 6); }
});
const shopTex = () => paint(768, 704, (g, W, H) => {
  // the back of the noodle shop, seen through the window (3.0 x 2.75 m)
  // (the wall under the ceiling is in shade, and its LEFT half is bare: in scene F's three-shot the REC label and the
  // clock sit over that part of the window, so nothing bright or lettered may be behind them)
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#8a5f37"); gr.addColorStop(0.27, "#b58653"); gr.addColorStop(0.46, "#e6bd82"); gr.addColorStop(0.6, "#eec58a"); gr.addColorStop(1, "#c89660");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "#5c3b22"; g.fillRect(0, 0, W, 26); g.fillStyle = "#74502f"; g.fillRect(0, 26, W, 5);       // the beam the tags hang from
  // the menu strips under the beam, right of the window's middle bar: red tags with white names
  const items = ["牛肉面", "炸酱面", "酸辣粉", "排骨面", "馄饨"];
  items.forEach((s, i) => {
    const x = 366 + i * 76, y = 44; g.fillStyle = "#3a2616"; g.fillRect(x + 31, 28, 2, 16); g.fillStyle = "#b8322a"; g.fillRect(x, y, 64, 132);
    g.fillStyle = "#fff4e0"; g.font = `bold 27px ${FONT}`; g.textAlign = "center"; g.textBaseline = "top";
    [...s].forEach((ch, k) => g.fillText(ch, x + 32, y + 12 + k * 33));
  });
  // the pass-through and the kitchen: steel shelf, pots steaming, bowls stacked
  g.fillStyle = "#9a7a5a"; g.fillRect(0, 300, W, 10);
  g.fillStyle = "#b9b8b4"; g.fillRect(60, 360, 300, 14);
  for (const [x, w] of [[90, 110], [230, 120]]) { g.fillStyle = "#8c8a86"; g.fillRect(x, 300, w, 70); g.fillStyle = "#a8a6a2"; g.fillRect(x - 6, 296, w + 12, 10); }
  for (let i = 0; i < 9; i++) blotch(g, 140 + 120 * Math.sin(i * 1.7) * 0.5 + i * 14, 290 - i * 26, 50 + i * 4, "#ffffff", 0.32);
  for (let s = 0; s < 3; s++) for (let i = 0; i < 4 - s; i++) { g.fillStyle = i % 2 ? "#f4f0e6" : "#e8e2d4"; g.beginPath(); g.ellipse(470 + s * 70, 360 - i * 16, 30, 9, 0, 0, 7); g.fill(); g.fillStyle = "#3a6ea8"; g.fillRect(442 + s * 70, 358 - i * 16, 56, 3); }
  // the counter (wood, a red strip), two bowls on it, a chopstick tube
  g.fillStyle = "#8a5a36"; g.fillRect(0, 440, W, H - 440); g.fillStyle = "#a66c40"; g.fillRect(0, 430, W, 22);
  g.fillStyle = "#b8322a"; g.fillRect(0, 500, W, 16);
  for (const x of [96, 592]) { g.fillStyle = "#f4f0e6"; g.beginPath(); g.ellipse(x, 428, 46, 14, 0, 0, 7); g.fill(); g.fillStyle = "#c97a3a"; g.beginPath(); g.ellipse(x, 424, 38, 9, 0, 0, 7); g.fill(); blotch(g, x, 380, 40, "#ffffff", 0.3); }
  g.fillStyle = "#6a8a4a"; g.fillRect(360, 380, 26, 50);
  // a lucky cat and a red paper lantern
  g.fillStyle = "#f6f2e8"; g.beginPath(); g.arc(680, 400, 22, 0, 7); g.fill(); g.fillStyle = "#d84030"; g.fillRect(668, 410, 24, 6);
  g.fillStyle = "#d8402e"; g.beginPath(); g.ellipse(640, 230, 34, 42, 0, 0, 7); g.fill(); g.fillStyle = "#e8b04a"; g.fillRect(630, 184, 20, 8); g.fillRect(630, 268, 20, 8);
});
const shopSignTex = () => paint(512, 128, (g, W, H) => {
  g.fillStyle = "#c22a22"; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,255,255,0.18)"); gr.addColorStop(1, "rgba(0,0,0,0.12)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#ffe8d0"; g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20);
  g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `bold 96px ${FONT}`; g.fillText("面", W / 2, H / 2 + 4);
  g.font = `bold 30px ${FONT}`; g.fillText("张记", 90, H / 2); g.fillText("牛肉面", W - 100, H / 2);
});
const glassDecalTex = () => paint(512, 96, (g, W, H) => {
  g.clearRect(0, 0, W, H); g.fillStyle = "#c8302a"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `bold 46px ${FONT}`; g.fillText("手 工 拉 面", W / 2, H / 2);
});
const menuTex = () => paint(256, 384, (g, W, H) => {
  g.fillStyle = "#2c3a32"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) blotch(g, W * Math.abs(Math.sin(i * 2.3)), H * Math.abs(Math.cos(i * 1.7)), 60, "#4a5a50", 0.2);
  g.fillStyle = "#f4f0e0"; g.textBaseline = "top"; g.textAlign = "center"; g.font = `bold 34px ${FONT}`; g.fillText("今日面单", W / 2, 22);
  g.textAlign = "left"; g.font = `26px ${FONT}`;
  [["牛肉面", "18"], ["小  面", "12"], ["酸辣粉", "14"], ["排骨面", "22"], ["加  蛋", "+2"]].forEach(([a, b], i) => {
    g.fillStyle = "#f4f0e0"; g.fillText(a, 28, 90 + i * 52); g.fillStyle = "#f2c24a"; g.fillText(b, 176, 90 + i * 52);
  });
  g.strokeStyle = "#f08a8a"; g.lineWidth = 3; g.beginPath(); g.moveTo(28, 352); g.lineTo(228, 352); g.stroke();
});
const plateTex = () => paint(512, 84, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#4a505a"); gr.addColorStop(1, "#353a42");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "#f6f1e6"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `bold 46px ${FONT}`; g.fillText("云 海 大 厦", W / 2, H * 0.42);
  g.font = `14px ${FONT}`; g.fillStyle = "#c8ccd4"; g.fillText("Y U N H A I   T O W E R", W / 2, H * 0.84);
});
const lobbyBackTex = () => paint(512, 448, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#f2dcb4"); gr.addColorStop(1, "#d8b688"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(431);
  for (let i = 0; i < 20; i++) { g.strokeStyle = css("#c8a478", 0.4); g.lineWidth = 2; g.beginPath(); let x = W * r(), y = H * r(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += 40 * (r() - 0.3); y += 30 * (r() - 0.5); g.lineTo(x, y); } g.stroke(); }
  // two lift doors (steel), their lit floor numbers
  for (const x of [120, 300]) { g.fillStyle = "#b4b2ae"; g.fillRect(x, 150, 92, H - 150); g.fillStyle = "#8e8c88"; g.fillRect(x + 45, 150, 2, H - 150); g.fillStyle = "#6a4a2a"; g.fillRect(x - 8, 142, 108, 8); g.fillStyle = "#ffb050"; g.fillRect(x + 36, 118, 20, 14); }
  // (no lettering on this wall: the tower's name is on the sign over the door outside; across the top of this wall it sat
  // right behind her camera's REC display in every level shot of the door)
});
const lobbyFloorTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = "#d2b48a"; g.fillRect(0, 0, W, H);
  g.strokeStyle = css("#a68a64", 0.6); g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * W / 4, 0); g.lineTo(i * W / 4, H); g.stroke(); g.beginPath(); g.moveTo(0, i * H / 4); g.lineTo(W, i * H / 4); g.stroke(); }
  blotch(g, W * 0.5, H * 0.3, W * 0.4, "#fff2d8", 0.35);
}, true);
const ceilTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = "#e4c89a"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { blotch(g, W * (i + 0.5) / 3, H * (j + 0.5) / 3, 30, "#ffffff", 0.9); }
});
const grateTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = "#3e3c3a"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#5a5856"; g.lineWidth = 7; g.strokeRect(6, 6, W - 12, H - 12);
  for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(24 + i * 15, 24); g.lineTo(24 + i * 15, H - 24); g.stroke(); }
  g.fillStyle = "#2c2a28"; g.beginPath(); g.arc(W / 2, H / 2, 40, 0, 7); g.fill();
});
const manholeTex = () => paint(256, 256, (g, W) => {
  const c = W / 2; g.clearRect(0, 0, W, W);
  g.fillStyle = "#4e4e52"; g.beginPath(); g.arc(c, c, c - 2, 0, 7); g.fill();
  g.strokeStyle = "#666870"; g.lineWidth = 5; g.beginPath(); g.arc(c, c, c - 14, 0, 7); g.stroke();
  for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(c - 90, 50 + i * 20); g.lineTo(c + 90, 50 + i * 20); g.stroke(); }
  g.fillStyle = "#4e4e52"; g.fillRect(c - 50, c - 18, 100, 36); g.fillStyle = "#6a6c74"; g.font = `bold 26px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("污 水", c, c);
});
const boxTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = "#f2c230"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#e0ac20"; g.fillRect(0, H - 30, W, 30);
  g.fillStyle = "#d8dce2"; g.fillRect(0, H * 0.58, W, 16);          // a reflective strip
  g.fillStyle = "#3a3a40"; g.font = `bold 40px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("外卖", W / 2, H * 0.36);
});
/** the lobby light down the steps: v 0 at the door (canvas bottom), 1 two and a half metres out; widening as it goes */
const spillTex = () => paint(128, 128, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  for (let k = 0; k < 10; k++) {
    const s = k / 10, a = 0.11;
    g.fillStyle = css("#ffffff", a); g.beginPath();
    const wb = W * (0.26 + 0.06 * s), wt = W * (0.42 + 0.06 * s), top = H * (0.1 + 0.85 * (1 - s));
    g.moveTo(W / 2 - wb, H); g.lineTo(W / 2 + wb, H); g.lineTo(W / 2 + wt, top); g.lineTo(W / 2 - wt, top); g.closePath(); g.fill();
  }
});
const softDot = () => paint(32, 32, (g, Sz) => { const gr = g.createRadialGradient(Sz / 2, Sz / 2, 0, Sz / 2, Sz / 2, Sz / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, Sz, Sz); });

// ===================================================================================================== the build
const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "street";
  const Mk = maker(K, group), X = (x: number) => X0 + x;
  const UNLIT = { cast: false, receive: false, noink: true } as const;
  const decal = (m: THREE.Material) => { Object.assign(m, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); return m; };

  // ------------------------------------------------------------------------------------------ the ground
  const mPave = Mk.tex(paverTex(), 0.92);
  Mk.mesh("street.pavement", levelQuad(X(FAR_X), X(RIGHT_X), WZ, 2.2, 0, (x, z) => [x / 2, -z / 2]), mPave, { cast: false });
  const mKerb = Mk.tex(graniteTex(), 0.9);
  Mk.mesh("street.kerb", tileUV(boxG(X(FAR_X), X(RIGHT_X), -0.14, 0.03, 2.2, 2.4), 1), mKerb);
  Mk.mesh("street.road", levelQuad(X(FAR_X - 20), X(RIGHT_X + 20), 2.4, 24, -0.12), Mk.flat("#3d4049", 0.95), { cast: false });
  {
    // the road's paint: the cycle lane's line, the dashed middle line, the far lane's line
    const quads = (list: [number, number, number, number][], y: number) => {
      const pos: number[] = [], idx: number[] = []; let n = 0;
      for (const [x0, x1, z0, z1] of list) { pos.push(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1); idx.push(n, n + 2, n + 1, n, n + 3, n + 2); n += 4; }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
    };
    const lines: [number, number, number, number][] = [[X(FAR_X), X(RIGHT_X), 4.66, 4.78], [X(FAR_X), X(RIGHT_X), 12.3, 12.42]];
    for (let x = FAR_X + 1; x < RIGHT_X; x += 6) if (x < -16.5 || x > -9.5) lines.push([X(x), X(x + 2.2), 8.44, 8.56]);
    for (let z = 2.75; z < 23.5; z += 0.9) lines.push([X(-15.2), X(-10.8), z, z + 0.45]);                // a zebra crossing down the street
    Mk.mesh("street.road.paint", quads(lines, -0.116), decal(Mk.flat("#a9adb8", 0.9)), { cast: false });
  }
  Mk.mesh("street.grate", levelQuad(X(4.0), X(5.2), -2.2, -1.0, 0.004, (x, z) => [(x - X(4.0)) / 1.2, (-1.0 - z) / 1.2]), decal(Mk.tex(grateTex(), 0.8)), { cast: false });
  Mk.mesh("street.manhole", new THREE.CircleGeometry(0.33, 28).rotateX(-Math.PI / 2).translate(X(3.4), 0.004, 1.1), decal(K.flat("#ffffff", { map: manholeTex(), rough: 0.7 })), { cast: false });

  // ------------------------------------------------------------------------------------------ the podium wall
  const mStone = Mk.tex(stoneTex(403, "#6e7580"), 0.9), mDark = Mk.tex(stoneTex(404, "#535964"), 0.9);
  const wall = (x0: number, x1: number, y0: number, y1: number, m: THREE.Material = mStone, z0 = WB, z1 = WZ) => Mk.mesh("street.wall", tileUV(boxG(X(x0), X(x1), y0, y1, z0, z1), 2.4), m);
  wall(FAR_X, SHOP.x0, 0, POD); wall(SHOP.x0, SHOP.x1, 0, SHOP.y0); wall(SHOP.x0, SHOP.x1, SHOP.y1, POD);
  wall(SHOP.x1, BAY.x0, 0, POD); wall(BAY.x0, BAY.x1, 0, S.steps.landingY); wall(BAY.x0, BAY.x1, BAY.top, POD); wall(BAY.x1, RIGHT_X, 0, POD);
  wall(FAR_X, RIGHT_X, POD, CORN, mDark, WB, WZ + 0.14);                                       // the cornice
  wall(FAR_X, RIGHT_X, 0, 0.18, mDark, WZ - 0.02, WZ + 0.03);                                  // a dark plinth
  Mk.mesh("street.podium.roof", boxG(X(FAR_X), X(TW.x0), POD, CORN - 0.05, -40, WB), mDark, { cast: false });
  // a dark shopfront to the right of the steps (an office's closed glass front)
  {
    const p = paint(256, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#3c465c"); gr.addColorStop(1, "#2c3446"); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = css("#8aa0c8", 0.14); g.beginPath(); g.moveTo(40, 0); g.lineTo(120, 0); g.lineTo(60, H); g.lineTo(0, H); g.fill(); g.fillStyle = css("#ffd090", 0.5); g.fillRect(180, 120, 30, 10); });
    Mk.mesh("street.closedfront", new THREE.PlaneGeometry(3.4, 2.6).translate(X(5.0), 1.75, WZ + 0.006), Mk.basic("#b4bccc", { map: p }), UNLIT);
  }

  // ------------------------------------------------------------------------------------------ the steps
  const mStep = Mk.tex(graniteTex(), 0.85), st = S.steps;
  for (let k = 1; k <= st.n; k++) {
    const front = st.front - st.run * (k - 1);
    Mk.mesh("street.step", tileUV(boxG(X(st.x0), X(st.x1), st.rise * (k - 1), st.rise * k, WZ, front), 1), mStep);
  }
  Mk.mesh("street.cheek", tileUV(boxG(X(st.x0 - 0.24), X(st.x0), 0, st.landingY + 0.1, WZ, st.front), 1), mDark);
  Mk.mesh("street.cheek", tileUV(boxG(X(st.x1), X(st.x1 + 0.24), 0, st.landingY + 0.1, WZ, st.front), 1), mDark);

  // ------------------------------------------------------------------------------------------ the lobby (warm, unlit paint)
  const lobbyMats: [THREE.MeshBasicMaterial, THREE.Color][] = [];
  const lb = (c: string, map?: THREE.Texture) => { const m = Mk.basic(c, { map: map ?? null }); lobbyMats.push([m, m.color.clone()]); return m; };
  const LZ = WB - 5.0, LY = st.landingY;
  Mk.mesh("street.lobby.floor", levelQuad(X(BAY.x0), X(BAY.x1), LZ, WB, LY, (x, z) => [x / 1.6, -z / 1.6]), lb("#ffe6c4", lobbyFloorTex()), UNLIT);
  Mk.mesh("street.lobby.ceil", ceilQuad(X(BAY.x0), X(BAY.x1), LZ, WB, 3.6, (x, z) => [x / 2, z / 2]), lb("#fff0d8", ceilTex()), UNLIT);
  Mk.mesh("street.lobby.back", new THREE.PlaneGeometry(BAY.x1 - BAY.x0, 3.6 - LY).translate(X(0), (3.6 + LY) / 2, LZ), lb("#ffeedd", lobbyBackTex()), UNLIT);
  Mk.mesh("street.lobby.side", new THREE.PlaneGeometry(5.0, 3.6 - LY).rotateY(Math.PI / 2).translate(X(BAY.x0), (3.6 + LY) / 2, (LZ + WB) / 2), lb("#d8b88c"), UNLIT);
  Mk.mesh("street.lobby.side", new THREE.PlaneGeometry(5.0, 3.6 - LY).rotateY(-Math.PI / 2).translate(X(BAY.x1), (3.6 + LY) / 2, (LZ + WB) / 2), lb("#d8b88c"), UNLIT);
  Mk.mesh("street.lobby.desk", boxG(X(0.35), X(1.75), LY, LY + 1.05, WB - 3.1, WB - 2.5), lb("#a8703e"), UNLIT);
  Mk.mesh("street.lobby.desktop", boxG(X(0.3), X(1.8), LY + 1.05, LY + 1.1, WB - 3.15, WB - 2.45), lb("#e8dcc8"), UNLIT);
  Mk.mesh("street.lobby.pot", new THREE.CylinderGeometry(0.22, 0.18, 0.5, 14).translate(X(-1.5), LY + 0.25, WB - 3.6), lb("#7a6656"), UNLIT);
  Mk.mesh("street.lobby.plant", new THREE.SphereGeometry(0.4, 12, 8).scale(1, 1.4, 1).translate(X(-1.5), LY + 1.0, WB - 3.6), lb("#4e7a4a"), UNLIT);

  // ------------------------------------------------------------------------------------------ the glass front and its door
  const P = new Part(K);
  const mSteel = Mk.flat("#5c626c", 0.45), mGlass = new THREE.MeshBasicMaterial({ color: "#a8c4e0", transparent: true, opacity: 0.14, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const gZ = WZ - 0.04, D = S.door, dh = LY + D.h, hw = D.w / 2;
  const frame = (x0: number, x1: number, y0: number, y1: number, z: number, t = 0.06, into = P) => {
    into.add(mSteel, boxG(X(x0), X(x1), y0, y0 + t, z - 0.03, z + 0.03), 0.005); into.add(mSteel, boxG(X(x0), X(x1), y1 - t, y1, z - 0.03, z + 0.03), 0.005);
    into.add(mSteel, boxG(X(x0), X(x0) + t, y0, y1, z - 0.03, z + 0.03), 0.005); into.add(mSteel, boxG(X(x1) - t, X(x1), y0, y1, z - 0.03, z + 0.03), 0.005);
  };
  // the frosted safety band across all the glass at these people's waist height (0.6 m: higher, it crossed the face of anyone inside): on the leaves it shows the door sliding open
  const mBand = new THREE.MeshBasicMaterial({ color: "#f2f6ff", transparent: true, opacity: 0.42, depthWrite: false, fog: false, side: THREE.DoubleSide }), BAND_Y = LY + 0.6;
  for (const [a, b] of [[BAY.x0, -hw], [hw, BAY.x1]] as const) {
    frame(a, b, LY, BAY.top, gZ); P.add(mGlass, new THREE.PlaneGeometry(b - a, BAY.top - LY).translate(X((a + b) / 2), (BAY.top + LY) / 2, gZ), 0);
    P.add(mBand, new THREE.PlaneGeometry(b - a - 0.14, 0.11).translate(X((a + b) / 2), BAND_Y, gZ + 0.004), 0);
  }
  frame(-hw, hw, dh, BAY.top, gZ); P.add(mGlass, new THREE.PlaneGeometry(D.w, BAY.top - dh).translate(X(0), (BAY.top + dh) / 2, gZ), 0);
  P.add(mSteel, boxG(X(-hw - 0.04), X(hw + 0.04), dh - 0.04, dh + 0.04, gZ - 0.14, gZ + 0.03), 0.005);   // the door head
  const leaves: THREE.Group[] = [];
  for (const sgn of [-1, 1]) {
    const lg = new THREE.Group(); lg.name = "street.door.leaf"; group.add(lg); leaves.push(lg);
    const L = new Part(K), x0 = sgn < 0 ? -hw : 0, x1 = sgn < 0 ? 0 : hw, z = gZ - 0.09;
    frame(x0, x1, LY, dh - 0.04, z, 0.05, L);
    L.add(mGlass, new THREE.PlaneGeometry(hw - 0.04, dh - LY - 0.06).translate(X((x0 + x1) / 2), (LY + dh) / 2, z), 0);
    L.add(mBand, new THREE.PlaneGeometry(hw - 0.12, 0.11).translate(X((x0 + x1) / 2), BAND_Y, z + 0.004), 0);
    L.add(mSteel, bar(V(X(sgn * 0.12), LY + 0.7, z + 0.06), V(X(sgn * 0.12), LY + 1.5, z + 0.06), 0.016), 0.004);   // the pull bar
    L.into(lg, "street.door.leaf", { cast: false, receive: true });
  }
  // the sign plate over the door
  P.add(mSteel, boxG(X(-1.18), X(1.18), 3.5, 3.9, WZ, WZ + 0.05), 0.006);
  const mPlate = Mk.basic("#ffffff", { map: plateTex() });
  Mk.mesh("street.sign.plate", new THREE.PlaneGeometry(2.3, 0.38).translate(X(0), 3.7, WZ + 0.052), mPlate, UNLIT);
  frame(3.3, 6.7, 0.45, 3.05, WZ + 0.03); for (const x of [4.43, 5.57]) P.add(mSteel, boxG(X(x - 0.03), X(x + 0.03), 0.45, 3.05, WZ, WZ + 0.06), 0.005);   // the dark shopfront's frame
  // the lobby's glow sits INSIDE, behind anyone who walks in the lobby: a person behind the glass is a solid person in a
  // bright room (in front of the glass it washed her out like a ghost)
  const doorGlow = glowCard(1.7, "#ffcf8a", 0.3); doorGlow.position.set(X(0), 1.6, WB - 1.0); group.add(doorGlow);

  // ------------------------------------------------------------------------------------------ the noodle shop
  const shopMats: [THREE.MeshBasicMaterial, THREE.Color][] = [];
  const sb = (c: string, map?: THREE.Texture) => { const m = Mk.basic(c, { map: map ?? null }); shopMats.push([m, m.color.clone()]); return m; };
  const sw = SHOP.x1 - SHOP.x0, scx = (SHOP.x0 + SHOP.x1) / 2, sd = WB - SHOP.back;
  Mk.mesh("street.shop.back", new THREE.PlaneGeometry(sw, 2.75).translate(X(scx), 1.375, SHOP.back), sb("#ffffff", shopTex()), UNLIT);
  Mk.mesh("street.shop.floor", levelQuad(X(SHOP.x0), X(SHOP.x1), SHOP.back, WB, 0.05), sb("#9a7656"), UNLIT);
  Mk.mesh("street.shop.ceil", ceilQuad(X(SHOP.x0), X(SHOP.x1), SHOP.back, WB, 2.75, (x, z) => [x / 1.5, z / 1.5]), sb("#ffe6b8", ceilTex()), UNLIT);
  Mk.mesh("street.shop.side", new THREE.PlaneGeometry(sd, 2.75).rotateY(Math.PI / 2).translate(X(SHOP.x0), 1.375, (WB + SHOP.back) / 2), sb("#d8a46c"), UNLIT);
  Mk.mesh("street.shop.side", new THREE.PlaneGeometry(sd, 2.75).rotateY(-Math.PI / 2).translate(X(SHOP.x1), 1.375, (WB + SHOP.back) / 2), sb("#d8a46c"), UNLIT);
  Mk.mesh("street.shop.counter", boxG(X(SHOP.x0 + 0.1), X(SHOP.x0 + 1.4), 0.05, 1.0, SHOP.back + 0.5, SHOP.back + 1.0), sb("#9a6038"), UNLIT);
  const sgZ = WZ - 0.06;
  frame(SHOP.x0, SHOP.x1, SHOP.y0, SHOP.y1, sgZ);
  P.add(mSteel, boxG(X(scx - 0.03), X(scx + 0.03), SHOP.y0, SHOP.y1, sgZ - 0.03, sgZ + 0.03), 0.005);
  P.add(mGlass, new THREE.PlaneGeometry(sw, SHOP.y1 - SHOP.y0).translate(X(scx), (SHOP.y0 + SHOP.y1) / 2, sgZ), 0);
  Mk.mesh("street.shop.decal", new THREE.PlaneGeometry(1.6, 0.3).translate(X(scx), 0.85, sgZ + 0.035), Mk.basic("#ffffff", { map: glassDecalTex(), transparent: true }), UNLIT);
  // the sign box: red, its face lit
  const mRed = Mk.flat("#a8261e", 0.6);
  P.add(mRed, boxG(X(SHOP.x0 + 0.1), X(SHOP.x1 - 0.1), 2.85, 3.45, WZ, WZ + 0.24), 0.007);
  const mSign = Mk.basic("#ffffff", { map: shopSignTex() });
  Mk.mesh("street.shop.sign", new THREE.PlaneGeometry(sw - 0.24, 0.56).translate(X(scx), 3.15, WZ + 0.243), mSign, UNLIT);
  const signGlow = glowCard(1.6, "#ff5a40", 0.18); signGlow.scale.set(1.3, 0.55, 1); signGlow.position.set(X(scx), 3.15, WZ + 0.26); group.add(signGlow);
  const shopGlow = glowCard(1.9, "#ffc070", 0.22); shopGlow.scale.set(1.1, 0.8, 1); shopGlow.position.set(X(scx), 1.55, WZ + 0.1); group.add(shopGlow);
  // steam over the pots (behind the glass)
  const steamTex = softDot(), steams: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: steamTex, color: "#ffffff", transparent: true, opacity: 0.3, depthWrite: false, fog: false })); m.layers.set(NOINK); m.renderOrder = 3; group.add(m); steams.push(m); }
  // the menu board (an A-frame), the table, its two stools
  {
    const mb = new THREE.Group(); mb.position.set(X(-5.75), 0, WZ + 0.75); mb.rotation.y = 0.35; group.add(mb);
    const Q = new Part(K), mWood = Mk.flat("#7a5232", 0.8);
    const mt = new THREE.Matrix4().makeRotationX(-0.16);
    Q.add(mWood, new THREE.BoxGeometry(0.58, 0.9, 0.04).translate(0, 0.45, 0), 0.005, mt);
    Q.add(mWood, new THREE.BoxGeometry(0.58, 0.9, 0.04).translate(0, 0.45, 0), 0.005, new THREE.Matrix4().makeRotationX(0.16).setPosition(0, 0, -0.29));
    Q.into(mb, "street.menuboard");
    const face = Mk.mesh("street.menu", new THREE.PlaneGeometry(0.48, 0.72).translate(0, 0.47, 0.021).applyMatrix4(mt), Mk.basic("#e8e8e8", { map: menuTex() }), { ...UNLIT, into: mb });
    void face;
  }
  {
    const T = S.table, mTop = Mk.flat("#d8c8a8", 0.6), mLeg = Mk.flat("#4a4e56", 0.4), mSeat = Mk.flat("#a8744a", 0.7);
    P.add(mTop, new THREE.CylinderGeometry(T.r, T.r, 0.035, 28).translate(X(T.x), T.top - 0.0175, T.z), 0.006);
    P.add(mLeg, new THREE.CylinderGeometry(0.035, 0.035, T.top - 0.05, 10).translate(X(T.x), (T.top - 0.05) / 2 + 0.02, T.z), 0.005);
    P.add(mLeg, new THREE.CylinderGeometry(0.22, 0.24, 0.025, 44).translate(X(T.x), 0.0125, T.z), 0.005);
    for (const s of S.stools) {
      P.add(mSeat, new THREE.CylinderGeometry(0.16, 0.15, 0.04, 20).translate(X(s.x), s.top - 0.02, s.z), 0.006);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.785; P.add(mLeg, bar(V(X(s.x) + 0.1 * Math.cos(a), s.top - 0.04, s.z + 0.1 * Math.sin(a)), V(X(s.x) + 0.14 * Math.cos(a), 0, s.z + 0.14 * Math.sin(a)), 0.012), 0.004); }
    }
    // a chopstick tube, a vinegar bottle, a napkin box (at the table's back edge)
    P.add(Mk.flat("#3a6e5a", 0.6), new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10).translate(X(T.x - 0.08), T.top + 0.06, T.z - 0.24), 0.004);
    P.add(Mk.flat("#e8c070", 0.5), boxG(X(T.x - 0.085), X(T.x - 0.075), T.top + 0.12, T.top + 0.2, T.z - 0.25, T.z - 0.23), 0.002);
    P.add(Mk.flat("#5a2e22", 0.3), lathe_([[0.025, 0], [0.025, 0.1], [0.01, 0.14], [0.01, 0.16]]).translate(X(T.x + 0.06), T.top, T.z - 0.25), 0.004);
    P.add(Mk.flat("#f2efe8", 0.8), boxG(X(T.x + 0.1), X(T.x + 0.2), T.top, T.top + 0.07, T.z - 0.29, T.z - 0.2), 0.004);
  }

  // ------------------------------------------------------------------------------------------ the street lamp
  const mPole = Mk.flat("#3e444e", 0.5), Lp = S.lamp;
  P.add(mPole, new THREE.CylinderGeometry(0.12, 0.14, 0.3, 14).translate(X(Lp.x), 0.15, Lp.z), 0.006);
  P.add(mPole, new THREE.CylinderGeometry(0.045, 0.065, Lp.h, 12).translate(X(Lp.x), Lp.h / 2, Lp.z), 0.006);
  P.add(mPole, bar(V(X(Lp.x), Lp.h - 0.1, Lp.z), V(X(LAMP_HEAD.x + 0.15), LAMP_HEAD.y + 0.12, Lp.z), 0.03), 0.005);
  P.add(mPole, boxG(X(LAMP_HEAD.x - 0.25), X(LAMP_HEAD.x + 0.22), LAMP_HEAD.y + 0.04, LAMP_HEAD.y + 0.14, Lp.z - 0.13, Lp.z + 0.13), 0.006);
  const mLens = Mk.basic("#ffe2b0"); mLens.color.multiplyScalar(2.2);
  Mk.mesh("street.lamp.lens", new THREE.PlaneGeometry(0.4, 0.2).rotateX(Math.PI / 2).translate(X(LAMP_HEAD.x - 0.015), LAMP_HEAD.y + 0.035, Lp.z), mLens, UNLIT);
  const lampGlow = glowCard(0.75, "#ffc888", 0.55); lampGlow.position.set(X(LAMP_HEAD.x), LAMP_HEAD.y - 0.05, Lp.z); group.add(lampGlow);
  const lampPool = lightPool(V(X(1.0), 0.003, -1.2), V(0, 1, 0), 4.6, 4.0, "#ffb870", 0.22); group.add(lampPool);
  // THE STREET GOING ON TO THE LEFT (scene J: her own thread runs away down it). The same lamp every 9 m, each with its
  // pool on the pavement; a few closed fronts and one all-night shop in the podium wall; the far crossing's buildings.
  const farGlows: THREE.Object3D[] = [], farPools: THREE.Mesh[] = [];
  // (to the right the lamps between 20 and 40 m are left out: in scene J's last look they would stand right behind his head)
  const LAMPS_X = [...Array.from({ length: 9 }, (_, i) => -9.5 - 9 * i), Lp.x + 9, ...Array.from({ length: 12 }, (_, i) => Lp.x + 40 + 9 * i)];
  for (const lx of LAMPS_X) {
    const hx = lx - 0.65;
    P.add(mPole, new THREE.CylinderGeometry(0.12, 0.14, 0.3, 14).translate(X(lx), 0.15, Lp.z), 0.006);
    P.add(mPole, new THREE.CylinderGeometry(0.045, 0.065, Lp.h, 12).translate(X(lx), Lp.h / 2, Lp.z), 0.006);
    P.add(mPole, bar(V(X(lx), Lp.h - 0.1, Lp.z), V(X(hx + 0.15), LAMP_HEAD.y + 0.12, Lp.z), 0.03), 0.005);
    P.add(mPole, boxG(X(hx - 0.25), X(hx + 0.22), LAMP_HEAD.y + 0.04, LAMP_HEAD.y + 0.14, Lp.z - 0.13, Lp.z + 0.13), 0.006);
    Mk.mesh("street.lamp.lens", new THREE.PlaneGeometry(0.4, 0.2).rotateX(Math.PI / 2).translate(X(hx - 0.015), LAMP_HEAD.y + 0.035, Lp.z), mLens, UNLIT);
    const g = glowCard(0.75, "#ffc888", 0.55); g.position.set(X(hx), LAMP_HEAD.y - 0.05, Lp.z); group.add(g); farGlows.push(g);
    const pool = lightPool(V(X(lx - 1.1), 0.003, -0.9), V(0, 1, 0), 4.8, 4.8, "#ffb870", 0.22); group.add(pool); farPools.push(pool);
  }
  {
    // closed fronts (dark glass, one small light left on) and THE ALL-NIGHT SHOP (便利店): a bright window, a teal sign, its light on the pavement
    const dark = paint(256, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#343e54"); gr.addColorStop(1, "#262e40"); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = css("#8aa0c8", 0.12); g.beginPath(); g.moveTo(40, 0); g.lineTo(120, 0); g.lineTo(60, H); g.lineTo(0, H); g.fill(); g.fillStyle = css("#ffd090", 0.55); g.fillRect(170, 110, 34, 12); g.fillStyle = "#1c2230"; g.fillRect(W / 2 - 3, 0, 6, H); });
    const mDarkFront = Mk.basic("#b4bccc", { map: dark });
    for (const fx of [-9.6, -31.5, -40.5, -52, -63, 17.5, 26.5, 41, 52.5, 68, 83, 99, 117, 134]) Mk.mesh("street.closedfront", new THREE.PlaneGeometry(3.6, 2.5).translate(X(fx), 1.6, WZ + 0.006), mDarkFront, UNLIT);
    const shop = paint(768, 448, (g, W, H) => {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#f4faff"); gr.addColorStop(1, "#dbe8f4"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const r = rng(77), cols = ["#e8584e", "#f2b840", "#58a8e0", "#6cc070", "#f08a4c", "#b07ad8", "#f4f4f4"];
      for (let row = 0; row < 4; row++) { g.fillStyle = "#b8c4d2"; g.fillRect(20, 96 + row * 84, W * 0.62, 6); for (let x = 26; x < W * 0.62; x += 16 + 10 * r()) { g.fillStyle = cols[Math.floor(r() * cols.length)]; const h = 30 + 30 * r(); g.fillRect(x, 96 + row * 84 - h, 12, h); } }
      g.fillStyle = "#c8d6e4"; g.fillRect(W * 0.66, 0, 6, H); g.fillRect(W * 0.83, 0, 6, H);                        // the door's frames
      g.fillStyle = "#7c8ea4"; g.fillRect(W * 0.7, H * 0.5, 40, 8); g.fillRect(W * 0.87, H * 0.5, 40, 8);           // its handles
      g.fillStyle = "#e6eef6"; g.fillRect(W * 0.68, H * 0.72, W * 0.3, H * 0.28);
    });
    const mShop = Mk.basic("#ffffff", { map: shop }); mShop.color.multiplyScalar(1.25);
    Mk.mesh("street.allnight", new THREE.PlaneGeometry(4.6, 2.5).translate(X(-20.5), 1.55, WZ + 0.006), mShop, UNLIT);
    const sign = paint(768, 96, (g, W, H) => { g.fillStyle = "#1e9a86"; g.fillRect(0, 0, W, H); g.fillStyle = "#ffffff"; g.fillRect(0, H * 0.78, W, H * 0.08); g.font = `bold 60px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("24H 便利店", W / 2, H * 0.42); });
    const mSign24 = Mk.basic("#ffffff", { map: sign }); mSign24.color.multiplyScalar(1.3);
    P.add(Mk.flat("#16705f", 0.6), boxG(X(-22.9), X(-18.1), 2.9, 3.48, WZ, WZ + 0.2), 0.006);
    Mk.mesh("street.allnight.sign", new THREE.PlaneGeometry(4.7, 0.5).translate(X(-20.5), 3.19, WZ + 0.205), mSign24, UNLIT);
    const sg = glowCard(3.6, "#dff0ff", 0.26); sg.scale.set(1.3, 0.75, 1); sg.position.set(X(-20.5), 1.6, WZ + 0.12); group.add(sg); farGlows.push(sg);
    const sp = lightPool(V(X(-20.5), 0.003, WZ + 1.7), V(0, 1, 0), 6.0, 3.6, "#d8ecff", 0.3); group.add(sp);
    // the far crossing: a wall of city across the end of the street, its windows lit
    const city = paint(1024, 512, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      const r = rng(913); let x = 0; const tops: [number, number, number][] = [];
      while (x < W) { const w = 46 + 90 * r(), h = H * (0.34 + 0.6 * r() * r()); g.fillStyle = "#1b2137"; g.fillRect(x, H - h, w, h); tops.push([x, w, h]); x += w + 3 * r(); }
      for (const [bx, w, h] of tops) for (let y = H - h + 9; y < H - 5; y += 11) for (let q = bx + 5; q < bx + w - 6; q += 9) if (r() < 0.2) { g.fillStyle = r() < 0.65 ? "#ffd590" : "#dfeaff"; g.fillRect(q, y, 5, 6); }
      for (const [bx, w, h] of tops) if (h > H * 0.66) { g.fillStyle = "#ff5040"; g.fillRect(bx + w / 2 - 3, H - h - 5, 6, 6); }
    });
    const mCity = new THREE.MeshBasicMaterial({ map: city, transparent: true, alphaTest: 0.4, fog: false });
    Mk.mesh("street.farcity", new THREE.PlaneGeometry(120, 38).rotateY(Math.PI / 2).translate(X(FAR_X + 2), 18, -14), mCity, UNLIT);   // (its tall tower stands clear of her REC label)
    const cg = glowCard(46, "#ffb878", 0.12); cg.scale.set(1.6, 0.36, 1); cg.position.set(X(FAR_X + 4), 3, 0); cg.rotation.y = Math.PI / 2; group.add(cg);
    // the same the other way (scene J's last look: he goes off down the street to the right)
    Mk.mesh("street.farcity.right", new THREE.PlaneGeometry(150, 19).rotateY(-Math.PI / 2).translate(X(RIGHT_X - 2), 9, 10), mCity, UNLIT);       // (low: under her REC row)
    const cg2 = glowCard(60, "#ffb878", 0.12); cg2.scale.set(1.6, 0.36, 1); cg2.position.set(X(RIGHT_X - 4), 3, 0); cg2.rotation.y = -Math.PI / 2; group.add(cg2);
  }
  const shopPool = lightPool(V(X(scx), 0.003, WZ + 1.4), V(0, 1, 0), 4.2, 3.0, "#ffb060", 0.3); group.add(shopPool);
  // the lobby light down the steps (one sheet over the treads and risers, a little proud of them)
  const spill = (() => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [], e = 0.004, xa = st.x0, xb = st.x1;
    const U = (x: number) => (x - xa) / (xb - xa), Vv = (z: number) => Math.min(1, (z - WZ) / 2.6);
    const quad = (p: [number, number, number][], uvq: [number, number][]) => { const b = pos.length / 3; for (let i = 0; i < 4; i++) { pos.push(X(p[i][0]), p[i][1], p[i][2]); uv.push(...uvq[i]); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
    const tread = (y: number, z0: number, z1: number) => quad([[xa, y, z1], [xb, y, z1], [xb, y, z0], [xa, y, z0]], [[U(xa), Vv(z1)], [U(xb), Vv(z1)], [U(xb), Vv(z0)], [U(xa), Vv(z0)]]);
    const riser = (z: number, y0: number, y1: number) => quad([[xa, y0, z], [xb, y0, z], [xb, y1, z], [xa, y1, z]], [[U(xa), Vv(z)], [U(xb), Vv(z)], [U(xb), Vv(z)], [U(xa), Vv(z)]]);
    for (let k = st.n; k >= 1; k--) {
      const front = st.front - st.run * (k - 1), back = k === st.n ? WZ : front - st.run;
      tread(st.rise * k + e, back, front); riser(front + e, st.rise * (k - 1), st.rise * k);
    }
    tread(e, st.front, Math.min(-0.2, st.front + 2.0));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.MeshBasicMaterial({ map: spillTex(), color: "#ffc684", transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const mesh = new THREE.Mesh(g, m); mesh.name = "street.spill"; mesh.layers.set(NOINK); mesh.renderOrder = 4; mesh.castShadow = mesh.receiveShadow = false; group.add(mesh);
    return mesh;
  })();

  // ------------------------------------------------------------------------------------------ the delivery scooter
  {
    const sc = new THREE.Group(); sc.name = "street.scooter"; sc.position.set(X(S.scooter.x), 0, S.scooter.z); sc.rotation.y = S.scooter.yaw; group.add(sc);
    const Q = new Part(K), mTyre = Mk.flat("#26262c", 0.9), mHub = Mk.flat("#9a9ea6", 0.4), mBody = Mk.flat("#2f5a8e", 0.45), mWhite = Mk.flat("#e4e6ea", 0.5), mSeat = Mk.flat("#2a2a30", 0.7);
    const R = 0.22;
    for (const wx of [-0.55, 0.62]) { Q.add(mTyre, new THREE.TorusGeometry(R - 0.055, 0.055, 8, 22).translate(wx, R, 0), 0.006); Q.add(mHub, new THREE.CylinderGeometry(0.1, 0.1, 0.08, 14).rotateX(Math.PI / 2).translate(wx, R, 0), 0.004); }
    Q.add(mBody, boxG(-0.3, 0.38, 0.2, 0.3, -0.17, 0.17), 0.006);                                   // the footboard
    Q.add(mBody, boxG(-0.78, -0.22, 0.28, 0.62, -0.19, 0.19), 0.006);                               // the rear body
    Q.add(mWhite, boxG(-0.8, -0.5, 0.36, 0.56, -0.195, 0.195), 0.004);                              // its side panel
    Q.add(mBody, boxG(-0.75, -0.42, 0.42, 0.5, -0.1, 0.1).translate(0, 0, 0), 0);                   // (fender fill)
    Q.add(mSeat, boxG(-0.7, -0.14, 0.62, 0.71, -0.15, 0.15), 0.006);                                // the seat
    Q.add(mBody, new THREE.BoxGeometry(0.13, 0.72, 0.34), 0.006, new THREE.Matrix4().makeRotationZ(-0.3).setPosition(0.44, 0.6, 0));   // the leg shield
    for (const dz of [-0.07, 0.07]) Q.add(mHub, bar(V(0.62, R, dz), V(0.52, 0.92, dz), 0.022), 0.004);                                   // the fork
    Q.add(mBody, new THREE.BoxGeometry(0.2, 0.16, 0.28), 0.006, new THREE.Matrix4().makeRotationZ(-0.3).setPosition(0.53, 0.96, 0));   // the head
    Q.add(mHub, bar(V(0.5, 1.03, -0.32), V(0.5, 1.03, 0.32), 0.016), 0.004);                        // the handlebar
    for (const dz of [-0.3, 0.3]) { Q.add(mSeat, bar(V(0.5, 1.03, dz * 0.9), V(0.5, 1.03, dz * 1.12), 0.024), 0.004); Q.add(mHub, bar(V(0.5, 1.04, dz * 0.75), V(0.46, 1.25, dz * 0.85), 0.007), 0.003); Q.add(mSeat, new THREE.CylinderGeometry(0.04, 0.04, 0.015, 10).rotateZ(Math.PI / 2).translate(0.46, 1.27, dz * 0.85), 0.003); }
    Q.add(mWhite, new THREE.CylinderGeometry(0.055, 0.055, 0.03, 14).rotateZ(Math.PI / 2).translate(0.64, 0.97, 0), 0.003);   // the headlight
    Q.add(mHub, boxG(-0.86, -0.3, 0.71, 0.73, -0.16, 0.16), 0.004);                                 // the rack
    Q.add(K.flat("#ffffff", { map: boxTex(), rough: 0.6 }), boxG(-0.9, -0.34, 0.73, 1.17, -0.23, 0.23), 0.007);   // THE YELLOW BOX
    Q.add(Mk.flat("#d89a18", 0.6), boxG(-0.92, -0.32, 1.17, 1.2, -0.25, 0.25), 0.005);             // its lid
    Q.add(Mk.flat("#c0302a", 0.5), boxG(-0.83, -0.79, 0.4, 0.48, -0.12, 0.12), 0.003);              // the tail light
    Q.add(mHub, bar(V(-0.1, 0.2, 0.17), V(-0.2, 0.0, 0.3), 0.012), 0.003);                          // the side stand
    Q.into(sc, "street.scooter", { cast: true, receive: true });
  }

  // ------------------------------------------------------------------------------------------ the tree (bare, fairy lights)
  const fairyPts: number[] = [];
  {
    const r = rng(441), mBark = Mk.flat("#5a4c44", 0.9), base = V(X(4.6), 0, -1.6);
    const branch = (a: THREE.Vector3, d: THREE.Vector3, len: number, rad: number, depth: number) => {
      const b = a.clone().addScaledVector(d, len);
      P.add(mBark, bar(a, b, rad, rad * 0.68, 7), depth >= 1 ? 0.005 : 0);
      if (depth <= 1) for (let q = 0; q < 3; q++) { const t = 0.3 + 0.7 * r(); fairyPts.push(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t); }
      if (depth > 0) {
        const n = depth >= 3 ? 3 : 2;
        for (let i = 0; i < n; i++) {
          const yaw = r() * Math.PI * 2, tilt = 0.35 + 0.45 * r(), nd = d.clone().multiplyScalar(0.6).add(V(Math.cos(yaw) * Math.sin(tilt), Math.cos(tilt), Math.sin(yaw) * Math.sin(tilt))).normalize();
          branch(b, nd, len * (0.62 + 0.15 * r()), rad * 0.68, depth - 1);
        }
      }
    };
    branch(base, V(0.02, 1, 0).normalize(), 2.0, 0.09, 4);
  }
  {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(fairyPts, 3));
    const m = new THREE.PointsMaterial({ map: softDot(), color: "#ffd890", size: 0.09, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const pts = new THREE.Points(g, m); pts.layers.set(NOINK); pts.frustumCulled = false; pts.name = "street.fairy"; pts.renderOrder = 5; group.add(pts);
  }
  P.into(group, "street.dressing", { cast: true, receive: true });

  // ------------------------------------------------------------------------------------------ the tower shaft, its windows
  const mTower = Mk.basic("#8c98bc", { map: towerTex() });
  const facade = (w: number, h: number) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / TW.cw, uv.getY(i) * h / TW.fh); return g; };
  const TWW = TW.cols * TW.cw, TWH = TW.floors * TW.fh;
  Mk.mesh("street.tower.front", facade(TWW, TWH).translate(X(TW.x0 + TWW / 2), CORN + TWH / 2, WB), mTower, { cast: false, receive: false });
  Mk.mesh("street.tower.side", facade(24, TWH).rotateY(-Math.PI / 2).translate(X(TW.x0), CORN + TWH / 2, WB - 12), mTower, { cast: false, receive: false });
  const NW = TW.cols * TW.floors, wins = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.32, 2.42), new THREE.MeshBasicMaterial({ map: litWinTex(), color: "#ffffff", fog: false }), NW);
  wins.name = "street.tower.lit"; wins.layers.set(NOINK); wins.frustumCulled = false; wins.castShadow = wins.receiveShadow = false; group.add(wins);
  {
    const r = rng(451), list: { i: number; j: number; k: number }[] = [];
    for (let j = 0; j < TW.floors; j++) for (let i = 0; i < TW.cols; i++) list.push({ i, j, k: i === HERS.i && j === HERS.j ? -1 : r() });
    list.sort((a, b) => a.k - b.k);
    const mt = new THREE.Matrix4(), col = new THREE.Color(), rc = rng(452);
    list.forEach((w, n) => {
      mt.makeTranslation(X(TW.x0 + TW.cw * (w.i + 0.5)), CORN + TW.fh * w.j + 2.25, WB + 0.01); wins.setMatrixAt(n, mt);
      if (w.k < 0) col.set("#ffd8a0").multiplyScalar(1.35); else col.set(rc() < 0.55 ? "#ffd9a6" : "#e2ecff").multiplyScalar(0.8 + 0.25 * rc());
      wins.setColorAt(n, col);
    });
    wins.instanceMatrix.needsUpdate = true; if (wins.instanceColor) wins.instanceColor.needsUpdate = true;
  }

  // ------------------------------------------------------------------------------------------ the sky, the far city, the moon
  const skyD = skyTex(false), skyN = skyTex(true);
  const mSky = new THREE.MeshBasicMaterial({ map: skyD, side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = Mk.mesh("street.sky", new THREE.SphereGeometry(300, 48, 24).translate(X(0), 0, 0), mSky, UNLIT); sky.renderOrder = -10;
  const mSkyline = new THREE.MeshBasicMaterial({ map: skylineTex(), color: "#5d6688", transparent: true, alphaTest: 0.4, fog: false });
  Mk.mesh("street.skyline", new THREE.PlaneGeometry(320, 80).translate(X(-40), 38, -112), mSkyline, UNLIT);
  const moonG = new THREE.Group(); moonG.name = "street.moon"; moonG.position.set(X(MOON_AT.x), MOON_AT.y, MOON_AT.z); group.add(moonG);
  const mMoon = new THREE.MeshBasicMaterial({ map: moonTex(), transparent: true, depthWrite: false, fog: false }); mMoon.color.setRGB(1.5, 1.45, 1.35);
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mMoon); moon.layers.set(NOINK); moon.renderOrder = 2; moonG.add(moon);
  const halo = glowCard(16, "#d6e0ff", 0.4); halo.position.z = -0.5; halo.renderOrder = 1; moonG.add(halo);
  const halo2 = glowCard(34, "#a8b8ec", 0.0); halo2.position.z = -0.8; halo2.renderOrder = 1; moonG.add(halo2);
  const mRing = new THREE.MeshBasicMaterial({ map: ringTex(), color: "#e8eeff", transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), mRing); ring.layers.set(NOINK); ring.renderOrder = 1; ring.position.z = -0.6; moonG.add(ring);
  const cloud = new THREE.Mesh(new THREE.PlaneGeometry(44, 22), new THREE.MeshBasicMaterial({ map: cloudTex(), color: "#9eaad0", transparent: true, depthWrite: false, fog: false }));
  cloud.layers.set(NOINK); cloud.renderOrder = 3; cloud.position.set(3, -5.5, 0.4); moonG.add(cloud);
  moonG.lookAt(X(0.3), 1.5, 1.6);

  // ------------------------------------------------------------------------------------------ light
  const Lr = lightRig(group, { dir: TL_.dusk.key, k: TL_.dusk.keyK, col: TL_.dusk.keyCol, at: [X(0), 0, -1.5], half: 9, hemi: TL_.dusk.hemi, point: { col: "#ffc07a", k: TL_.dusk.lampK, at: [X(1.2), 2.7, -1.2], dist: 9 } });
  Lr.point.decay = 1.4;

  // this place's own painted materials (Mk.tex makes a fresh one per call): their env share and colour follow the hour
  const own: [THREE.MeshStandardMaterial, number, THREE.Color][] = [];
  for (const m of [mPave, mKerb, mStone, mDark, mStep]) { const q = m as THREE.MeshStandardMaterial; own.push([q, q.envMapIntensity, q.color.clone()]); }
  let time: StreetTime = "dusk", door = 0, lit = 0.5, moonK = 0;
  const applyLit = () => {
    const L = TL_[time];
    wins.count = lit <= 0 ? 0 : Math.max(1, Math.round(lit * L.litK * NW));
  };
  const applyLive = () => {
    const L = TL_[time];
    for (const lg of leaves) lg.position.x = (lg === leaves[0] ? -1 : 1) * 0.8 * door;
    (spill.material as THREE.MeshBasicMaterial).opacity = L.spill * (1 + 0.8 * door);
    doorGlow.material.opacity = 0.26 + 0.24 * door;
    halo.scale.setScalar(1 + 0.5 * moonK); halo.material.opacity = 0.4 + 0.25 * moonK;
    halo2.material.opacity = 0.3 * moonK; mRing.opacity = 0.08 + 0.16 * moonK;
    mMoon.color.setRGB(1.5, 1.45, 1.35).multiplyScalar(1 + 0.25 * moonK);
  };
  const applyTime = (tm: StreetTime) => {
    time = tm; const L = TL_[tm];
    Lr.key.color.set(L.keyCol); Lr.key.intensity = L.keyK;
    Lr.key.position.copy(Lr.key.target.position).addScaledVector(V(...L.key).normalize(), 30);
    Lr.hemi.color.set(L.hemi[0]); Lr.hemi.groundColor.set(L.hemi[1]); Lr.hemi.intensity = L.hemi[2];
    Lr.point.intensity = L.lampK;
    for (const [m, e, c] of own) { m.envMapIntensity = e * L.env; m.color.copy(c).multiply(new THREE.Color(L.tint)); }
    mSky.map = L.sky ? skyN : skyD; mSky.needsUpdate = true;
    mSkyline.color.set(L.skyline); mTower.color.set(L.tower);
    for (const [m, c] of shopMats) m.color.copy(c).multiplyScalar(L.shop);
    for (const [m, c] of lobbyMats) m.color.copy(c).multiplyScalar(L.lobby);
    shopPool.material instanceof THREE.MeshBasicMaterial && (shopPool.material.opacity = L.shopPool);
    shopGlow.material.opacity = 0.22 * L.shop;
    lampPool.material instanceof THREE.MeshBasicMaterial && (lampPool.material.opacity = tm === "night" ? 0.3 : 0.18);
    for (const fp of farPools) fp.material instanceof THREE.MeshBasicMaterial && (fp.material.opacity = tm === "night" ? 0.3 : 0.18);
    mPlate.color.setRGB(1, 1, 1).multiplyScalar(tm === "night" ? 1.15 : 1.0);
    moonG.visible = L.moon;
    applyLit(); applyLive();
  };
  applyTime("dusk");

  return {
    group,
    view(c: THREE.Vector3) {
      lampGlow.lookAt(c); for (const g of farGlows) g.lookAt(c); doorGlow.lookAt(c.x, doorGlow.position.y, Math.max(c.z, doorGlow.position.z + 0.5));
      moonG.lookAt(c);
      for (const s of steams) s.lookAt(c);
    },
    animate(t: number) {
      steams.forEach((s, i) => {
        const ph = (t * 0.22 + i / 3) % 1;
        s.position.set(X(SHOP.x0 + 0.9 + 0.25 * i + 0.06 * Math.sin(t * 1.3 + i)), 1.15 + 0.9 * ph, SHOP.back + 0.75);
        s.scale.setScalar(0.7 + 0.9 * ph); (s.material as THREE.MeshBasicMaterial).opacity = 0.32 * Math.sin(Math.PI * ph) * TL_[time].shop;
      });
    },
    setParam(name: string, v: ParamValue) {
      if (name === "time") applyTime(v === "night" ? "night" : "dusk");
      else if (name === "door") { door = Math.max(0, Math.min(1, Number(v))); applyLive(); }
      else if (name === "lit") { lit = Math.max(0, Math.min(1, Number(v))); applyLit(); }
      else if (name === "moon") { moonK = Math.max(0, Math.min(1, Number(v))); applyLive(); }
    },
    cast(): Partial<CastLight> {
      const c = { ...TL_[time].cast } as Record<string, unknown>;
      if (door > 0) { c.edge = (Number(c.edge) || 0.14) + 0.1 * door; c.gain = (Number(c.gain) || 0.9) + 0.04 * door; }
      return c as Partial<CastLight>;
    },
  };
};
/** a small turned bottle */
const lathe_ = (pts: [number, number][]) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 12);

export const STREET_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };

// THE STAGE of 采访蒙娜丽莎的一天 (first build, 23 Nov 2026). The film's idea: the lead never moves and the world changes
// round her picture. So there is ONE picture (sets/painting.ts: she stands in it), lifted so that its middle is at the
// reporter's eye, and round it a wall, a floor and a few things that are swapped per scene:
//   studio    Florence, 1503 to 1507: warm plaster, pinned red-chalk drawings, a shelf of colours, the panel on an easel
//   cloux     France, 1517: pale stone, a leaded window, a tapestry, the master's high chair
//   palace0   the king's wall: walnut panelling under a painted wall (Fontainebleau)
//   palace1   crimson damask and gilt mouldings
//   palace2   a green wall hung full of other pictures
//   bedroom   1800, night: a green wallpaper with gold bees, a bed under the picture, a candle
//   salon     the Louvre in 1911: a red wall, her neighbours' frames
//   louvre    the Louvre now: the dark blue wall, the glass, the console, the crowd
// Everything is built once; room(), mount(), state() and the dials below only show, hide and set opacities, so a shot
// may call them on every frame (a join between scenes = one call of room()).
//   const S = stageSet(M); scene.add(S.group)
//   S.room("cloux"); S.mount("easel"); S.state("head" | "body" | "done"); S.cracks(0..1); S.glass(0..1)
//   S.stain("stone" | "cake" | "soup", 0..1); S.crowd(0..1); S.plate("卢浮宫", "1911")
//   S.torch(x, y, r, k), S.dim(k): the painting's own (world coordinates here)
// World: x = screen right, y = up, the wall at z = WZ, the camera side is +z. Her picture's opening: PIC.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { NOINK } from "../../../kit/fx/ink";
import { paintingSet, OPEN, FRAME_Z, type PaintingSet } from "./painting";

/** how far the picture (and she in it) is lifted above the rooms' floor */
export const LIFT = 0.35;
export const WZ = FRAME_Z - 0.03;
/** the picture's opening in the world */
export const PIC = { x0: OPEN.x0, x1: OPEN.x1, y0: OPEN.y0 + LIFT, y1: OPEN.y1 + LIFT, cy: (OPEN.y0 + OPEN.y1) / 2 + LIFT } as const;
export const ROOMS = ["studio", "cloux", "palace0", "palace1", "palace2", "bedroom", "salon", "louvre"] as const;
export type Room = (typeof ROOMS)[number];
export type Mount = "easel" | "frame";
export type PanelState = "head" | "body" | "done";
/** the light of a room: the sun's colour and strength, how dark the night sheet is, a warm glow (the torch disc used
 *  as a candle: x, y, r, k), the page's background */
export type Mood = { sun: string; k: number; night: number; glow?: [number, number, number, number]; bg: string };
export const MOODS: Record<Room, Mood> = {
  studio: { sun: "#fff0d2", k: 1.0, night: 0, bg: "#3a2a1c" },
  cloux: { sun: "#f4f2ea", k: 0.95, night: 0, bg: "#3a362e" },
  palace0: { sun: "#ffe9c4", k: 0.9, night: 0, bg: "#2a1c12" },
  palace1: { sun: "#fff0d8", k: 0.95, night: 0, bg: "#2a1014" },
  palace2: { sun: "#f2f0e6", k: 0.95, night: 0, bg: "#20261c" },
  bedroom: { sun: "#aebcdc", k: 0.7, night: 0.5, glow: [-0.74, 1.45, 1.25, 0.85], bg: "#0c1410" },
  salon: { sun: "#fff2dc", k: 1.0, night: 0, bg: "#2a1010" },
  louvre: { sun: "#ffffff", k: 1.0, night: 0, bg: "#141a2c" },
};
/** where things stand (world): the master's chair at Cloux (a rig seat), the bed's edge Napoleon sits up on */
export const SPOTS = {
  chair: { at: [-0.5, 0, 1.55] as [number, number, number], yaw: 0.4, top: 0.34 },
  bed: { at: [-0.45, 0, 0.86] as [number, number, number], top: 0.42 },
} as const;

type G = CanvasRenderingContext2D;
const rng = (seed: number) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const tex = (w: number, h: number, draw: (g: G) => void, repeat = false) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
const mottle = (g: G, W: number, H: number, cols: string[], n: number, seed: number, a = 0.12, r0 = 0.04, r1 = 0.14) => {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = W * R(), y = H * R(), rr = W * (r0 + (r1 - r0) * R()), c = cols[Math.floor(R() * cols.length)];
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
};

// =====================================================================================================================
// the walls: one painted sheet per room, 6 m x 4 m (x -3 .. 3, y 0 .. 4)
// =====================================================================================================================
const WW = 1536, WH = 1024, WX0 = -3, WX1 = 3, WY1 = 4;
type Pen = { g: G; X: (x: number) => number; Y: (y: number) => number; S: number; box: (x0: number, y0: number, x1: number, y1: number, col: string) => void; poly: (pts: [number, number][], col: string) => void; line: (pts: [number, number][], col: string, w: number) => void };
const pen = (g: G): Pen => {
  const X = (x: number) => ((x - WX0) / (WX1 - WX0)) * WW, Y = (y: number) => (1 - y / WY1) * WH, S = WW / (WX1 - WX0);
  const path = (pts: [number, number][]) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); };
  return {
    g, X, Y, S,
    box: (x0, y0, x1, y1, col) => { g.fillStyle = col; g.fillRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1)); },
    poly: (pts, col) => { path(pts); g.closePath(); g.fillStyle = col; g.fill(); },
    line: (pts, col, w) => { path(pts); g.strokeStyle = col; g.lineWidth = w * S; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); },
  };
};
/** light through a window lying on the wall: a slanted patch with the shadows of its bars */
const lightPatch = (P: Pen, a: [number, number], w: number, h: number, lean: number, col: string, k: number, bars = 2) => {
  const { g } = P, pts: [number, number][] = [[a[0], a[1]], [a[0] + w, a[1]], [a[0] + w + lean, a[1] - h], [a[0] + lean, a[1] - h]];
  g.save(); g.filter = `blur(${0.025 * P.S}px)`;
  P.poly(pts, rgba(col, k));
  g.globalCompositeOperation = "destination-out"; g.filter = `blur(${0.012 * P.S}px)`;
  g.globalCompositeOperation = "source-over";
  for (let i = 1; i <= bars; i++) { const u = i / (bars + 1); P.line([[a[0] + w * u, a[1]], [a[0] + w * u + lean, a[1] - h]], "rgba(60,40,20,0.10)", 0.035); }
  P.line([[a[0] + lean * 0.5, a[1] - h * 0.5], [a[0] + w + lean * 0.5, a[1] - h * 0.5]], "rgba(60,40,20,0.10)", 0.035);
  g.restore();
};
/** a sheet of paper pinned to the wall with a red-chalk drawing on it (kind 0 .. 4) */
const sketchSheet = (P: Pen, cx: number, cy: number, w: number, h: number, rot: number, kind: number) => {
  const { g, S } = P;
  g.save(); g.translate(P.X(cx), P.Y(cy)); g.rotate(rot); g.scale(S, S);
  g.fillStyle = "rgba(40,24,10,0.28)"; g.fillRect(-w / 2 + 0.012, -h / 2 + 0.016, w, h);
  g.fillStyle = "#ead9b3"; g.fillRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = "rgba(120,90,50,0.5)"; g.lineWidth = 0.004; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = "#6e5a3c"; g.beginPath(); g.arc(0, -h / 2 + 0.018, 0.008, 0, 7); g.fill();
  g.strokeStyle = "#a8513a"; g.lineWidth = 0.0055; g.lineCap = "round"; g.lineJoin = "round";
  const L = (pts: number[]) => { g.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo(pts[i], pts[i + 1]) : g.moveTo(pts[i], pts[i + 1])); g.stroke(); };
  const r = Math.min(w, h) * 0.34;
  if (kind === 0) {            // the man in the circle and the square
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.strokeRect(-r * 0.82, -r * 0.72, r * 1.64, r * 1.64);
    g.beginPath(); g.arc(0, -r * 0.5, r * 0.14, 0, 7); g.stroke();
    L([0, -r * 0.36, 0, r * 0.25]); L([-r * 0.8, -r * 0.2, r * 0.8, -r * 0.2]); L([-r * 0.7, -r * 0.62, 0, -r * 0.2, r * 0.7, -r * 0.62]);
    L([0, r * 0.25, -r * 0.3, r * 0.9]); L([0, r * 0.25, r * 0.3, r * 0.9]); L([0, r * 0.25, -r * 0.62, r * 0.76]); L([0, r * 0.25, r * 0.62, r * 0.76]);
  } else if (kind === 1) {     // a wing
    L([-r * 1.1, r * 0.5, -r * 0.4, -r * 0.5, r * 1.1, -r * 0.7]);
    for (let i = 0; i < 6; i++) { const u = i / 5; g.beginPath(); g.moveTo(-r * 0.4 + u * r * 1.5, -r * 0.5 - u * r * 0.2); g.quadraticCurveTo(-r * 0.2 + u * r * 1.3, r * 0.2, -r * 0.9 + u * r * 1.9, r * 0.75 - u * r * 0.2); g.stroke(); }
    L([-r * 1.1, r * 0.5, r * 1.0, r * 0.55]);
  } else if (kind === 2) {     // wheels with teeth
    for (const [x, y, rr, n] of [[-r * 0.35, -r * 0.1, r * 0.55, 12], [r * 0.55, r * 0.45, r * 0.32, 8]] as number[][]) {
      g.beginPath(); g.arc(x, y, rr, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, rr * 0.2, 0, 7); g.stroke();
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; L([x + Math.cos(a) * rr, y + Math.sin(a) * rr, x + Math.cos(a) * rr * 1.2, y + Math.sin(a) * rr * 1.2]); }
    }
  } else if (kind === 3) {     // the screw that flies
    L([0, r, 0, -r * 0.9]); L([-r * 0.7, r, r * 0.7, r]);
    for (let i = 0; i < 4; i++) { const y = r * 0.6 - i * r * 0.42, k = 1 - i * 0.2; g.beginPath(); g.ellipse(0, y, r * 0.95 * k, r * 0.2 * k, 0, 0, Math.PI); g.stroke(); }
  } else {                     // a hand
    L([-r * 0.5, r * 0.8, -r * 0.55, 0, -r * 0.4, -r * 0.6]); L([-r * 0.4, -r * 0.6, -r * 0.2, -r * 0.1]);
    for (let i = 0; i < 4; i++) { const x = -r * 0.2 + i * r * 0.25; L([x, -r * 0.1, x + r * 0.08, -r * (0.85 - Math.abs(i - 1.2) * 0.14), x + r * 0.2, -r * 0.1]); }
    L([r * 0.75, -r * 0.1, r * 0.6, r * 0.8]);
  }
  // his notes, written backwards: three lines of scribble
  g.lineWidth = 0.003; for (let k = 0; k < 3; k++) { g.beginPath(); for (let i = 0; i <= 12; i++) { const x = w * 0.36 - (i / 12) * w * 0.72, y = h / 2 - 0.05 + k * 0.014 + (i % 2 ? 0.004 : -0.004); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.restore();
};
/** another picture on the wall, painted flat: a gilt frame, a dark old canvas with a vague subject */
const otherPicture = (P: Pen, x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const { g } = P, R = rng(seed), f = 0.07;
  P.box(x0 + 0.03, y0 - 0.04, x1 + 0.03, y1 - 0.04, "rgba(20,10,6,0.3)");
  P.box(x0, y0, x1, y1, "#a8802c"); P.box(x0 + 0.015, y0 + 0.015, x1 - 0.015, y1 - 0.015, "#d8b254"); P.box(x0 + f - 0.015, y0 + f - 0.015, x1 - f + 0.015, y1 - f + 0.015, "#8a6420");
  const cols = [["#3a2c20", "#6a4a2c", "#a8743c"], ["#24303a", "#48606a", "#b89a6a"], ["#3a2424", "#7a3a2c", "#c89a70"]][Math.floor(R() * 3)];
  const gr = g.createLinearGradient(0, P.Y(y1), 0, P.Y(y0)); gr.addColorStop(0, cols[1]); gr.addColorStop(1, cols[0]);
  g.fillStyle = gr; g.fillRect(P.X(x0 + f), P.Y(y1 - f), P.X(x1 - f) - P.X(x0 + f), P.Y(y0 + f) - P.Y(y1 - f));
  g.save(); g.beginPath(); g.rect(P.X(x0 + f), P.Y(y1 - f), P.X(x1 - f) - P.X(x0 + f), P.Y(y0 + f) - P.Y(y1 - f)); g.clip();
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0 - 2 * f, h = y1 - y0 - 2 * f;
  if (R() < 0.6) {   // a sitter: a pale face over dark shoulders
    g.fillStyle = "#1c1410"; g.beginPath(); g.ellipse(P.X(cx), P.Y(cy - h * 0.42), w * 0.42 * P.S, h * 0.38 * P.S, 0, 0, 7); g.fill();
    g.fillStyle = cols[2]; g.beginPath(); g.ellipse(P.X(cx), P.Y(cy + h * 0.1), w * 0.17 * P.S, h * 0.16 * P.S, 0, 0, 7); g.fill();
  } else {           // a landscape: a pale sky, dark trees
    g.fillStyle = rgba(cols[2], 0.7); g.fillRect(P.X(x0 + f), P.Y(y1 - f), w * P.S, h * 0.45 * P.S);
    g.fillStyle = "#1c1c14"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(P.X(x0 + f + w * R()), P.Y(cy - h * 0.05), w * 0.2 * P.S, h * 0.25 * P.S, 0, 0, 7); g.fill(); }
  }
  g.fillStyle = "rgba(150,112,30,0.2)"; g.fillRect(P.X(x0), P.Y(y1), (x1 - x0) * P.S, (y1 - y0) * P.S);
  g.restore();
};

const WALLS: Record<Room, (P: Pen) => void> = {
  studio: (P) => {
    const { g } = P;
    const gr = g.createLinearGradient(0, 0, 0, WH); gr.addColorStop(0, "#d2ad84"); gr.addColorStop(1, "#c09468");
    g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
    mottle(g, WW, WH, ["#a87a50", "#e2c49a", "#b88a5c"], 70, 11, 0.13);
    P.box(-3, 0, 3, 0.8, "rgba(120,70,40,0.5)"); P.box(-3, 0.8, 3, 0.83, "#8a5a36");
    // cracks in the plaster
    P.line([[-2.4, 3.6], [-2.2, 3.1], [-2.3, 2.7]], "rgba(90,60,36,0.35)", 0.006); P.line([[1.9, 0.9], [2.0, 1.5], [1.85, 1.9]], "rgba(90,60,36,0.3)", 0.006);
    lightPatch(P, [-1.55, 3.6], 0.9, 2.5, 0.85, "#fff2c8", 0.3);
    sketchSheet(P, -0.84, 2.42, 0.34, 0.44, -0.06, 0); sketchSheet(P, -0.86, 1.86, 0.32, 0.4, 0.07, 1); sketchSheet(P, -0.83, 1.32, 0.3, 0.38, -0.05, 2);
    sketchSheet(P, 0.84, 2.48, 0.32, 0.4, 0.07, 3); sketchSheet(P, 0.86, 1.34, 0.3, 0.38, -0.08, 4); sketchSheet(P, -1.3, 2.1, 0.3, 0.4, 0.1, 4); sketchSheet(P, 1.34, 1.9, 0.3, 0.4, -0.1, 0);
  },
  cloux: (P) => {
    const { g } = P;
    g.fillStyle = "#e0d4b8"; g.fillRect(0, 0, WW, WH);
    mottle(g, WW, WH, ["#c8b894", "#f0e8d2", "#d2c2a0"], 60, 21, 0.14);
    // ashlar: courses 0.36 high, blocks 0.72 long, every other course shifted
    g.strokeStyle = "rgba(150,130,96,0.55)"; g.lineWidth = 0.008 * P.S;
    for (let r = 0; r * 0.36 < 4; r++) {
      g.beginPath(); g.moveTo(0, P.Y(r * 0.36)); g.lineTo(WW, P.Y(r * 0.36)); g.stroke();
      for (let x = -3 + (r % 2) * 0.36; x < 3; x += 0.72) { g.beginPath(); g.moveTo(P.X(x), P.Y(r * 0.36)); g.lineTo(P.X(x), P.Y((r + 1) * 0.36)); g.stroke(); }
    }
    // the window at the left: a stone surround, leaded lozenges, the sky
    const wx0 = -1.36, wx1 = -0.66, wy0 = 1.0, wy1 = 2.75;
    P.box(wx0 - 0.09, wy0 - 0.09, wx1 + 0.09, wy1 + 0.09, "#c2b28c"); P.box(wx0 - 0.04, wy0 - 0.04, wx1 + 0.04, wy1 + 0.04, "#a89872");
    const sky = g.createLinearGradient(0, P.Y(wy1), 0, P.Y(wy0)); sky.addColorStop(0, "#a8cde6"); sky.addColorStop(0.7, "#dcecf0"); sky.addColorStop(1, "#b8d0a8");
    g.fillStyle = sky; g.fillRect(P.X(wx0), P.Y(wy1), (wx1 - wx0) * P.S, (wy1 - wy0) * P.S);
    g.save(); g.beginPath(); g.rect(P.X(wx0), P.Y(wy1), (wx1 - wx0) * P.S, (wy1 - wy0) * P.S); g.clip();
    g.strokeStyle = "rgba(70,70,74,0.75)"; g.lineWidth = 0.007 * P.S;
    for (let k = -30; k < 30; k++) { g.beginPath(); g.moveTo(P.X(wx0 + k * 0.11), P.Y(wy0)); g.lineTo(P.X(wx0 + k * 0.11 + 1.1), P.Y(wy0 + 1.9)); g.stroke(); g.beginPath(); g.moveTo(P.X(wx0 + k * 0.11), P.Y(wy0)); g.lineTo(P.X(wx0 + k * 0.11 - 1.1), P.Y(wy0 + 1.9)); g.stroke(); }
    g.restore();
    P.box((wx0 + wx1) / 2 - 0.03, wy0, (wx0 + wx1) / 2 + 0.03, wy1, "#b4a47e"); P.box(wx0, 1.92, wx1, 1.98, "#b4a47e");
    // the tapestry at the right: flowers on dark blue-green, a gold border, hung from a rod
    const tx0 = 0.64, tx1 = 1.42, ty0 = 0.86, ty1 = 2.72, R = rng(23);
    P.box(tx0 + 0.03, ty0 - 0.05, tx1 + 0.03, ty1 - 0.03, "rgba(40,30,16,0.28)");
    P.box(tx0, ty0, tx1, ty1, "#9a7a34"); P.box(tx0 + 0.05, ty0 + 0.05, tx1 - 0.05, ty1 - 0.05, "#1f3d3c");
    for (let i = 0; i < 90; i++) {
      const x = tx0 + 0.09 + R() * (tx1 - tx0 - 0.18), y = ty0 + 0.09 + R() * (ty1 - ty0 - 0.18), c = ["#b8423a", "#e0c060", "#e8e0c8", "#5a8a5a"][Math.floor(R() * 4)];
      g.fillStyle = c; g.beginPath(); g.arc(P.X(x), P.Y(y), (0.012 + R() * 0.012) * P.S, 0, 7); g.fill();
      g.strokeStyle = "#3f6a4c"; g.lineWidth = 0.004 * P.S; g.beginPath(); g.moveTo(P.X(x), P.Y(y)); g.lineTo(P.X(x + (R() - 0.5) * 0.03), P.Y(y - 0.05)); g.stroke();
    }
    P.box(tx0 - 0.06, ty1 - 0.01, tx1 + 0.06, ty1 + 0.025, "#5a4028");
    lightPatch(P, [-0.6, 3.3], 0.7, 1.7, 0.5, "#ffffff", 0.22, 1);
  },
  palace0: (P) => {
    const { g } = P;
    // above: a painted wall, warm, with garlands; below: walnut panelling with gilt lines
    const gr = g.createLinearGradient(0, 0, 0, P.Y(1.15)); gr.addColorStop(0, "#b89a68"); gr.addColorStop(1, "#c8a878");
    g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
    mottle(g, WW, WH, ["#a07a48", "#dcc090", "#8a6a44"], 60, 31, 0.16);
    for (const s of [-1, 1]) {
      // a stucco cartouche at each side of the picture: scrolls and a garland of fruit
      for (let k = 0; k < 2; k++) { const x = s * (1.0 + k * 0.95); P.line([[x - 0.3, 2.9], [x - 0.34, 1.5]], "#e6d2a4", 0.05); P.line([[x + 0.3, 2.9], [x + 0.34, 1.5]], "#e6d2a4", 0.05); g.strokeStyle = "#e6d2a4"; g.lineWidth = 0.05 * P.S; g.beginPath(); g.arc(P.X(x), P.Y(2.9), 0.3 * P.S, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(P.X(x), P.Y(1.5), 0.34 * P.S, 0, Math.PI); g.stroke();
        const R = rng(33 + k); for (let i = 0; i < 16; i++) { const a = Math.PI * (i / 15); g.fillStyle = ["#a8482c", "#c89a3a", "#5e7a3c"][Math.floor(R() * 3)]; g.beginPath(); g.arc(P.X(x - 0.24 * Math.cos(a)), P.Y(2.55 - 0.2 * Math.sin(a)), 0.035 * P.S, 0, 7); g.fill(); } }
    }
    P.box(-3, 0, 3, 1.15, "#4a2e1c"); P.box(-3, 1.15, 3, 1.21, "#c8a040"); P.box(-3, 1.21, 3, 1.24, "#6a4a22");
    for (let x = -2.85; x < 3; x += 0.62) {
      P.box(x, 0.14, x + 0.5, 1.02, "#5a3824"); g.strokeStyle = "#c8a040"; g.lineWidth = 0.008 * P.S; g.strokeRect(P.X(x + 0.04), P.Y(0.98), 0.42 * P.S, 0.8 * P.S);
      g.fillStyle = "#c8a040"; g.font = `700 ${0.26 * P.S}px Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("F", P.X(x + 0.25), P.Y(0.58));
    }
  },
  palace1: (P) => {
    const { g } = P;
    g.fillStyle = "#8a2430"; g.fillRect(0, 0, WW, WH);
    // damask: a soft repeating flower, darker on the red
    for (let r = 0; r * 0.3 < 4.2; r++) for (let x = -3 + (r % 2) * 0.15; x < 3.2; x += 0.3) {
      const y = r * 0.3; g.fillStyle = "rgba(60,10,20,0.32)";
      g.beginPath(); g.ellipse(P.X(x), P.Y(y), 0.035 * P.S, 0.085 * P.S, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(P.X(x), P.Y(y), 0.085 * P.S, 0.03 * P.S, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(200,90,90,0.22)"; g.beginPath(); g.arc(P.X(x), P.Y(y), 0.018 * P.S, 0, 7); g.fill();
    }
    mottle(g, WW, WH, ["#5a1018", "#b03a44"], 40, 41, 0.12);
    // gilt mouldings: a tall panel round her, one more at each side; a marble dado
    for (const [a, b] of [[-0.68, 0.68], [-1.72, -0.86], [0.86, 1.72], [-2.9, -1.9], [1.9, 2.9]]) { g.strokeStyle = "#d8b048"; g.lineWidth = 0.035 * P.S; g.strokeRect(P.X(a), P.Y(3.3), (b - a) * P.S, 2.42 * P.S); g.strokeStyle = "#8a6420"; g.lineWidth = 0.008 * P.S; g.strokeRect(P.X(a + 0.03), P.Y(3.27), (b - a - 0.06) * P.S, 2.36 * P.S); }
    P.box(-3, 0, 3, 0.72, "#b8a8a0");
    const R = rng(43); g.save(); g.beginPath(); g.rect(0, P.Y(0.72), WW, WH); g.clip();
    for (let i = 0; i < 26; i++) { let x = -3 + R() * 6, y = R() * 0.72; g.strokeStyle = "rgba(120,80,80,0.5)"; g.lineWidth = (0.004 + R() * 0.008) * P.S; g.beginPath(); g.moveTo(P.X(x), P.Y(y)); for (let k = 0; k < 5; k++) { x += 0.1 + R() * 0.2; y += (R() - 0.5) * 0.2; g.lineTo(P.X(x), P.Y(y)); } g.stroke(); }
    g.restore();
    P.box(-3, 0.72, 3, 0.79, "#d8b048"); P.box(-3, 0.79, 3, 0.81, "#8a6420");
  },
  palace2: (P) => {
    const { g } = P;
    g.fillStyle = "#5f6b50"; g.fillRect(0, 0, WW, WH);
    mottle(g, WW, WH, ["#48543c", "#7a8666"], 50, 51, 0.14);
    P.box(-3, 0, 3, 0.7, "#3a3226"); P.box(-3, 0.7, 3, 0.74, "#7a6a48");
    // hung full: three rows of other pictures at each side, one over her
    let seed = 52;
    for (const s of [-1, 1]) {
      const a = s > 0 ? 0.64 : -1.5;
      otherPicture(P, a, 0.92, a + 0.86, 1.72, seed++); otherPicture(P, a + 0.04, 1.82, a + 0.5, 2.5, seed++); otherPicture(P, a + 0.56, 1.82, a + 0.86, 2.3, seed++);
      otherPicture(P, a, 2.6, a + 0.86, 3.5, seed++);
      const b = s > 0 ? 1.62 : -2.6; otherPicture(P, b, 1.0, b + 0.98, 2.4, seed++); otherPicture(P, b, 2.5, b + 0.98, 3.4, seed++);
    }
    otherPicture(P, -0.5, 2.24, 0.5, 2.98, seed++);
  },
  bedroom: (P) => {
    const { g } = P;
    g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, WW, WH);
    for (let x = -3; x < 3; x += 0.24) P.box(x, 0, x + 0.12, 4, "rgba(20,40,30,0.25)");
    // gold bees in a lattice
    for (let r = 0; r * 0.24 < 3.2; r++) for (let x = -2.94 + (r % 2) * 0.24; x < 3; x += 0.48) {
      const y = 0.2 + r * 0.24, s = 0.022 * P.S; g.fillStyle = "#c8a040";
      g.beginPath(); g.ellipse(P.X(x), P.Y(y), s * 0.5, s, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(P.X(x) - s * 0.9, P.Y(y) - s * 0.2, s * 0.7, s * 0.4, 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(P.X(x) + s * 0.9, P.Y(y) - s * 0.2, s * 0.7, s * 0.4, -0.5, 0, 7); g.fill();
    }
    P.box(-3, 3.1, 3, 3.2, "#c8a040"); P.box(-3, 3.2, 3, 4, "#e6dcc0"); P.box(-3, 3.04, 3, 3.1, "#8a6420");
    P.box(-3, 0, 3, 0.16, "#4a2a1e");
    lightPatch(P, [0.55, 3.0], 0.8, 2.3, -0.7, "#c4d4f4", 0.3);
    // the candle on the wall at the left: its warm pool
    const gl = g.createRadialGradient(P.X(-0.74), P.Y(1.5), 0, P.X(-0.74), P.Y(1.5), 0.8 * P.S); gl.addColorStop(0, "rgba(255,206,130,0.5)"); gl.addColorStop(1, "rgba(255,206,130,0)");
    g.fillStyle = gl; g.fillRect(0, 0, WW, WH);
  },
  salon: (P) => {
    const { g } = P;
    g.fillStyle = "#7c2c2c"; g.fillRect(0, 0, WW, WH);
    for (let x = -3; x < 3; x += 0.045) P.box(x, 0, x + 0.012, 4, "rgba(40,8,8,0.16)");
    mottle(g, WW, WH, ["#5a1a1a", "#9a4038"], 50, 61, 0.13);
    P.box(-3, 0, 3, 0.74, "#3e2a1c"); P.box(-3, 0.74, 3, 0.79, "#6a4a2c"); for (let x = -2.9; x < 3; x += 0.7) P.box(x, 0.1, x + 0.58, 0.64, "#4a3222");
    otherPicture(P, -1.5, 0.96, -0.6, 2.3, 62); otherPicture(P, 0.6, 1.0, 1.46, 2.26, 63); otherPicture(P, -1.4, 2.42, -0.62, 3.3, 64); otherPicture(P, 0.62, 2.4, 1.5, 3.3, 65);
    otherPicture(P, -2.8, 1.0, -1.62, 2.9, 66); otherPicture(P, 1.6, 1.0, 2.8, 2.9, 67); otherPicture(P, -0.46, 2.36, 0.46, 2.98, 68);
  },
  louvre: (P) => {
    const { g } = P;
    g.fillStyle = "#2a3860"; g.fillRect(0, 0, WW, WH);
    // the lamps on her: a soft pool round the picture
    const gr = g.createRadialGradient(P.X(0), P.Y(1.5), 0.2 * P.S, P.X(0), P.Y(1.5), 2.2 * P.S); gr.addColorStop(0, "rgba(90,112,170,0.5)"); gr.addColorStop(1, "rgba(20,26,50,0.45)");
    g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
    P.box(-3, 0, 3, 0.1, "#1c2644");
  },
};

// =====================================================================================================================
// the floors: one tile each, repeated
// =====================================================================================================================
const FLOORS: Record<Room, [number, (g: G, S: number) => void]> = {
  // [the tile's size in metres, its painting on a 512 px tile]
  studio: [1.2, (g, S) => {
    g.fillStyle = "#8a4a34"; g.fillRect(0, 0, S, S); const R = rng(71), n = 4, c = S / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = ["#b56a48", "#a85e40", "#c07652", "#b0664a"][Math.floor(R() * 4)]; g.fillRect(i * c + 3, j * c + 3, c - 6, c - 6); }
    mottle(g, S, S, ["#7a3e2a", "#d08a64"], 20, 72, 0.12);
  }],
  cloux: [1.6, (g, S) => {
    const R = rng(73), n = 5, c = S / n; for (let i = 0; i < n; i++) { g.fillStyle = ["#8a6a46", "#80623e", "#94734c"][Math.floor(R() * 3)]; g.fillRect(i * c, 0, c, S); g.fillStyle = "rgba(50,34,18,0.55)"; g.fillRect(i * c, 0, 3, S); const y = R() * S; g.fillRect(i * c, y, c, 3); }
    mottle(g, S, S, ["#5e4426", "#a8875c"], 16, 74, 0.1);
  }],
  palace0: [1.0, (g, S) => {
    g.fillStyle = "#94703f"; g.fillRect(0, 0, S, S); g.save(); g.translate(S / 2, S / 2); g.rotate(Math.PI / 4);
    const c = S / Math.SQRT2 / 2; for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) { g.fillStyle = (i + j) % 2 ? "#a27c48" : "#86633a"; g.fillRect(i * c + 2, j * c + 2, c - 4, c - 4); }
    g.restore(); g.strokeStyle = "#5e4424"; g.lineWidth = 8; g.strokeRect(0, 0, S, S);
  }],
  palace1: [1.0, (g, S) => FLOORS.palace0[1](g, S)],
  palace2: [1.0, (g, S) => FLOORS.palace0[1](g, S)],
  bedroom: [1.0, (g, S) => { FLOORS.palace0[1](g, S); g.fillStyle = "rgba(20,14,10,0.35)"; g.fillRect(0, 0, S, S); }],
  salon: [0.8, (g, S) => {
    // herringbone
    g.fillStyle = "#6e5030"; g.fillRect(0, 0, S, S); const R = rng(75), w = S / 8, l = S / 2;
    for (let i = -1; i < 9; i++) for (let j = -1; j < 5; j++) for (const k of [0, 1]) {
      g.save(); g.translate(i * w * 2 + (k ? w : 0) + (j % 2 ? 0 : 0), j * l + (k ? l / 2 : 0)); g.rotate(k ? Math.PI / 4 : -Math.PI / 4);
      g.fillStyle = ["#8c6a44", "#96724a", "#82603c"][Math.floor(R() * 3)]; g.fillRect(-w / 2 + 2, -l / 2 + 2, w * 1.3 - 4, l - 4); g.restore();
    }
  }],
  louvre: [0.8, (g, S) => { FLOORS.salon[1](g, S); g.fillStyle = "rgba(230,200,150,0.25)"; g.fillRect(0, 0, S, S); }],
};

// =====================================================================================================================
// what lies on the picture: the bare ground with his drawing, the cracks, the glass and what was thrown at it
// =====================================================================================================================
const OW = OPEN.x1 - OPEN.x0, OH = OPEN.y1 - OPEN.y0, PX = 680;
/** a canvas over the opening (local metres -> px; y up) */
const overTex = (draw: (g: G, X: (x: number) => number, Y: (y: number) => number, S: number) => void, w = OW, h = OH, x0: number = OPEN.x0, y0: number = OPEN.y0) =>
  tex(Math.round(w * PX), Math.round(h * PX), (g) => draw(g, (x) => (x - x0) * PX, (y) => (h - (y - y0)) * PX, PX));
/** his drawing in red chalk on the white ground: the whole figure and the land behind (picture coordinates) */
const drawChalk = (g: G, X: (x: number) => number, Y: (y: number) => number, S: number, part: "all" | "low") => {
  g.strokeStyle = "rgba(168,76,52,0.8)"; g.lineCap = "round"; g.lineJoin = "round";
  const L = (pts: [number, number][], w = 0.006, a = 0.8) => { g.strokeStyle = `rgba(168,76,52,${a})`; g.lineWidth = w * S; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); g.stroke(); };
  const Q = (a: [number, number], c: [number, number], b: [number, number], w = 0.006, al = 0.8) => { g.strokeStyle = `rgba(168,76,52,${al})`; g.lineWidth = w * S; g.beginPath(); g.moveTo(X(a[0]), Y(a[1])); g.quadraticCurveTo(X(c[0]), Y(c[1]), X(b[0]), Y(b[1])); g.stroke(); };
  // the hands: the left forearm laid across, the right hand over its wrist
  Q([0.34, 0.66], [0.16, 0.74], [-0.02, 0.8]); Q([0.34, 0.74], [0.18, 0.83], [0.0, 0.86]);
  g.lineWidth = 0.006 * S; g.beginPath(); g.ellipse(X(-0.05), Y(0.815), 0.05 * S, 0.034 * S, -0.2, 0, 7); g.stroke(); g.beginPath(); g.ellipse(X(-0.135), Y(0.785), 0.052 * S, 0.034 * S, 0.3, 0, 7); g.stroke();
  for (let i = 0; i < 4; i++) L([[-0.16 - i * 0.012, 0.77 - i * 0.004], [-0.2 - i * 0.012, 0.745 - i * 0.008]], 0.004);
  Q([-0.36, 0.7], [-0.26, 0.76], [-0.17, 0.77]); Q([-0.36, 0.62], [-0.2, 0.66], [-0.1, 0.75]);
  // the chair's arm and the parapet
  L([[-0.37, 0.64], [0.37, 0.64]], 0.004, 0.5);
  if (part === "low") return;
  // the plumb line and a cross at her eyes' height
  g.setLineDash([0.02 * S, 0.016 * S]); L([[0, 1.58], [0, 0.62]], 0.003, 0.45); L([[-0.35, 1.2], [0.35, 1.2]], 0.003, 0.35); g.setLineDash([]);
  // the shoulders, the neckline, the mantle
  Q([-0.36, 0.72], [-0.3, 0.98], [-0.09, 1.02]); Q([0.36, 0.7], [0.32, 0.96], [0.09, 1.02]); Q([-0.13, 0.99], [0, 0.9], [0.13, 0.99]);
  Q([0.3, 0.95], [0.2, 0.8], [0.26, 0.66], 0.004, 0.6);
  // the land: a horizon higher on the right than on the left, a road, a bridge
  L([[-0.37, 1.2], [-0.24, 1.2]], 0.004, 0.6); L([[0.24, 1.3], [0.37, 1.3]], 0.004, 0.6);
  L([[-0.37, 1.42], [-0.32, 1.5], [-0.28, 1.44], [-0.24, 1.52]], 0.004, 0.55); L([[0.24, 1.5], [0.29, 1.56], [0.33, 1.47], [0.37, 1.53]], 0.004, 0.55);
  L([[-0.3, 0.98], [-0.36, 1.03], [-0.29, 1.08], [-0.35, 1.13]], 0.004, 0.55);
  for (let i = 0; i < 3; i++) { g.lineWidth = 0.004 * S; g.beginPath(); g.arc(X(0.28 + i * 0.03), Y(1.08), 0.014 * S, Math.PI, 0); g.stroke(); }
};

// =====================================================================================================================
// the crowd: backs of heads and raised screens, painted flat
// =====================================================================================================================
type Head = { x: number; top: number; r: number; hair: string; coat: string; phone?: [number, number]; kind?: number };
const crowdTex = (w: number, h: number, people: Head[]) => tex(Math.round(w * 400), Math.round(h * 400), (g) => {
  const S = 400, X = (x: number) => (x + w / 2) * S, Y = (y: number) => (h - y) * S, ink = "#1c1a22";
  g.lineJoin = "round"; g.lineCap = "round";
  for (const p of people) {
    const cy = p.top - p.r, sh = cy - p.r * 0.95;
    // shoulders and back
    g.fillStyle = p.coat; g.strokeStyle = ink; g.lineWidth = 0.018 * S;
    g.beginPath(); g.moveTo(X(p.x - p.r * 1.25), Y(0)); g.lineTo(X(p.x - p.r * 1.25), Y(sh - 0.06)); g.quadraticCurveTo(X(p.x - p.r * 1.2), Y(sh + 0.05), X(p.x), Y(sh + 0.06)); g.quadraticCurveTo(X(p.x + p.r * 1.2), Y(sh + 0.05), X(p.x + p.r * 1.25), Y(sh - 0.06)); g.lineTo(X(p.x + p.r * 1.25), Y(0)); g.closePath(); g.fill(); g.stroke();
    // an arm up with a screen
    if (p.phone) {
      const [px, py] = p.phone, s = px > p.x ? 1 : -1;
      g.strokeStyle = ink; g.lineWidth = 0.075 * S; g.beginPath(); g.moveTo(X(p.x + s * p.r * 1.05), Y(sh - 0.02)); g.lineTo(X(px), Y(py - 0.09)); g.stroke();
      g.strokeStyle = p.coat; g.lineWidth = 0.045 * S; g.beginPath(); g.moveTo(X(p.x + s * p.r * 1.05), Y(sh - 0.02)); g.lineTo(X(px), Y(py - 0.09)); g.stroke();
      g.fillStyle = "#f0d8b8"; g.strokeStyle = ink; g.lineWidth = 0.014 * S; g.beginPath(); g.arc(X(px), Y(py - 0.07), 0.04 * S, 0, 7); g.fill(); g.stroke();
      const pw = 0.085, ph = 0.15;
      g.fillStyle = "#16161c"; g.beginPath(); g.roundRect(X(px - pw / 2), Y(py + ph / 2), pw * S, ph * S, 0.012 * S); g.fill(); g.stroke();
      // on the screen: her, very small
      g.fillStyle = "#9db08c"; g.fillRect(X(px - pw / 2 + 0.008), Y(py + ph / 2 - 0.01), (pw - 0.016) * S, (ph - 0.02) * S);
      g.fillStyle = "#4a2c1a"; g.beginPath(); g.arc(X(px), Y(py + 0.012), 0.026 * S, 0, 7); g.fill();
      g.fillStyle = "#f3dcba"; g.beginPath(); g.arc(X(px), Y(py + 0.006), 0.017 * S, 0, 7); g.fill();
      g.fillStyle = "#3c4630"; g.fillRect(X(px - 0.026), Y(py - 0.022), 0.052 * S, 0.042 * S);
    }
    // the head from behind
    g.fillStyle = p.hair; g.strokeStyle = ink; g.lineWidth = 0.018 * S;
    g.beginPath(); g.arc(X(p.x), Y(cy), p.r * S, 0, 7); g.fill(); g.stroke();
    if (p.kind === 1) { g.beginPath(); g.arc(X(p.x), Y(p.top + p.r * 0.1), p.r * 0.36 * S, 0, 7); g.fill(); g.stroke(); }                 // a bun
    if (p.kind === 2) { g.fillStyle = "#c8443a"; g.beginPath(); g.arc(X(p.x), Y(cy + p.r * 0.2), p.r * 1.02 * S, Math.PI, 0); g.fill(); g.stroke(); } // a cap
    if (p.kind === 3) { g.fillStyle = "#f0d8b8"; g.beginPath(); g.arc(X(p.x), Y(cy), p.r * 0.985 * S, Math.PI * 1.1, Math.PI * 1.9); g.fill(); }      // a bald crown
  }
});

// =====================================================================================================================
// the stage
// =====================================================================================================================
export type Stage = {
  group: THREE.Group; pic: PaintingSet;
  room: (r: Room) => void; mount: (m: Mount) => void; state: (s: PanelState) => void;
  cracks: (k: number) => void; glass: (k: number) => void; stain: (n: "stone" | "cake" | "soup", k: number) => void; crowd: (k: number) => void;
  plate: (a: string, b?: string) => void; torch: (x: number, y: number, r: number, k: number) => void; dim: (k: number) => void;
};
export const stageSet = (M: Mats): Stage => {
  const G = new THREE.Group(); G.name = "mona.stage";
  const P = paintingSet(M, { room: false }); P.group.position.y = LIFT; G.add(P.group);
  const { x0, x1, y0, y1 } = PIC;
  const mk = <T extends THREE.Object3D>(into: THREE.Object3D, m: T, shadow = true) => { m.traverse((q) => { q.castShadow = shadow; q.receiveShadow = true; }); into.add(m); return m; };
  const paint = (c: string, rough = 0.85) => M.paint({ color: c, roughness: rough });
  const metal = (c: string, rough = 0.4) => M.metalWith({ color: c, map: null, roughness: rough, metalness: 0.8 });
  const box = (into: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, shadow = true) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); q.position.set(x, y, z); return mk(into, q, shadow); };
  const lathe = (into: THREE.Object3D, pts: [number, number][], x: number, y: number, z: number, m: THREE.Material, seg = 20) => { const q = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, yy]) => new THREE.Vector2(Math.max(0.0005, r), yy)), seg), m); q.position.set(x, y, z); return mk(into, q); };
  const limb = (into: THREE.Object3D, a: [number, number, number], b: [number, number, number], ra: number, rb: number, m: THREE.Material) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), q = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, A.distanceTo(B), 12), m);
    q.position.copy(A).add(B).multiplyScalar(0.5); q.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return mk(into, q);
  };
  const flatPlane = (into: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, map: THREE.Texture, order = 5, opacity = 1, solid = false) => {
    // solid: a cut-out that writes depth, so nothing behind it is inked through it (the crowd in front of the glass)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: solid, alphaTest: solid ? 0.06 : 0, opacity, fog: false }));
    m.position.set(x, y, z); m.renderOrder = order; m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; into.add(m); return m;
  };

  // ----- the wall (four sheets round the opening) and the floor: one material each per room
  const wallMats = {} as Record<Room, THREE.Material>, floorMats = {} as Record<Room, THREE.Material>;
  for (const r of ROOMS) {
    wallMats[r] = M.paint({ color: "#ffffff", map: tex(WW, WH, (g) => WALLS[r](pen(g))), roughness: 0.95 });
    const [size, draw] = FLOORS[r], t = tex(512, 512, (g) => draw(g, 512), true); t.repeat.set(12 / size, 8 / size);
    floorMats[r] = M.paint({ color: "#ffffff", map: t, roughness: 0.8 });
  }
  const walls: THREE.Mesh[] = [];
  for (const [a, b, c, d] of [[WX0, 0, x0, WY1], [x1, 0, WX1, WY1], [x0, y1, x1, WY1], [x0, 0, x1, y0]] as [number, number, number, number][]) {
    const g = new THREE.PlaneGeometry(c - a, d - b), uv = g.attributes.uv as THREE.BufferAttribute, p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + (a + c) / 2 - WX0) / (WX1 - WX0), (p.getY(i) + (b + d) / 2) / WY1);
    const m = new THREE.Mesh(g, wallMats.louvre); m.position.set((a + c) / 2, (b + d) / 2, WZ); mk(G, m, false); walls.push(m);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), floorMats.louvre); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, WZ + 4); mk(G, floor, false);

  // ----- the mounts: the gilt frame is the painting's; the easel and the bare panel's edge are here
  const easel = new THREE.Group(); easel.name = "mona.easel"; G.add(easel);
  {
    const wood = paint("#76532f", 0.8), woodLo = paint("#5e4124", 0.85), edge = paint("#c9aa7c", 0.9), ez = WZ + 0.05;
    // the panel's own edge: bare poplar, a finger thick
    for (const [w, h, x, y] of [[x1 - x0 + 0.05, 0.025, 0, y1 + 0.0125], [x1 - x0 + 0.05, 0.025, 0, y0 - 0.0125], [0.025, y1 - y0, x0 - 0.0125, PIC.cy], [0.025, y1 - y0, x1 + 0.0125, PIC.cy]] as number[][]) box(easel, w, h, 0.04, x, y, WZ + 0.02, edge);
    // the ledge she stands on, the two legs under it, the mast and its clamp over her, the cross bar
    box(easel, 1.02, 0.05, 0.13, 0, y0 - 0.05, ez + 0.035, wood);
    for (const s of [-1, 1]) { limb(easel, [s * 0.3, y0 - 0.06, ez], [s * 0.5, 0, ez + 0.2], 0.03, 0.026, wood); limb(easel, [s * 0.24, y1 + 0.03, ez - 0.02], [s * 0.19, y1 + 0.42, ez - 0.02], 0.024, 0.022, wood); }
    box(easel, 0.56, 0.05, 0.05, 0, y1 + 0.36, ez - 0.02, wood); box(easel, 0.7, 0.045, 0.05, 0, 0.42, ez + 0.1, woodLo);
    box(easel, 0.08, 0.2, 0.06, 0, y1 + 0.11, ez, woodLo); box(easel, 0.16, 0.05, 0.08, 0, y1 + 0.045, ez + 0.01, wood);
  }
  // ----- the plate under the frame: two lines of text
  const plateCv = document.createElement("canvas"); plateCv.width = 512; plateCv.height = 160;
  const plateTex = new THREE.CanvasTexture(plateCv); plateTex.colorSpace = THREE.SRGBColorSpace; plateTex.anisotropy = 4;
  const plateG = new THREE.Group(); G.add(plateG);
  box(plateG, 0.34, 0.105, 0.012, 0, y0 - 0.13 - 0.12, WZ + 0.006, metal("#b8923c", 0.45), false);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.09), new THREE.MeshBasicMaterial({ map: plateTex, fog: false })); m.position.set(0, y0 - 0.25, WZ + 0.0125); m.layers.set(NOINK); plateG.add(m); }
  const plate = (a: string, b = "") => {
    const g = plateCv.getContext("2d")!; g.fillStyle = "#e9cf8a"; g.fillRect(0, 0, 512, 160); g.strokeStyle = "#7c5a1c"; g.lineWidth = 6; g.strokeRect(8, 8, 496, 144);
    g.fillStyle = "#4a3210"; g.textAlign = "center"; g.textBaseline = "middle"; const F = `FrSans, "Noto Sans SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif`;
    if (b) { g.font = `700 56px ${F}`; g.fillText(a, 256, 56); g.font = `700 44px ${F}`; g.fillText(b, 256, 114); } else { g.font = `700 64px ${F}`; g.fillText(a, 256, 82); }
    plateTex.needsUpdate = true;
  };
  plate("", "");

  // ----- on the picture (in its own frame, so it is lifted with it): the bare ground, his chalk, the cracks
  const pz = FRAME_Z - 0.05, ragged = (pts: [number, number][], seed: number, amp: number) => { const R = rng(seed); return pts.map(([x, y]) => new THREE.Vector2(x + (R() - 0.5) * amp, y + (R() - 0.5) * amp)); };
  const ground = new THREE.MeshBasicMaterial({ color: "#e4d5b4", fog: false });
  // state "head": everything bare but a rough patch round her head
  const sh = new THREE.Shape([new THREE.Vector2(OPEN.x0, OPEN.y0), new THREE.Vector2(OPEN.x1, OPEN.y0), new THREE.Vector2(OPEN.x1, OPEN.y1), new THREE.Vector2(OPEN.x0, OPEN.y1)]);
  const hole: [number, number][] = []; for (let i = 0; i < 40; i++) { const a = -(i / 40) * Math.PI * 2; hole.push([HEAD[0] + Math.cos(a) * HEAD[2], HEAD[1] + Math.sin(a) * HEAD[3] - (Math.sin(a) < -0.6 ? 0.03 : 0)]); }
  sh.holes.push(new THREE.Path(ragged(hole, 5, 0.03)));
  const bareHead = new THREE.Mesh(new THREE.ShapeGeometry(sh), ground); bareHead.position.z = pz; P.group.add(bareHead);
  // state "body": bare only below her wrists, the edge of the paint rough
  const low: [number, number][] = [[OPEN.x0, OPEN.y0], [OPEN.x1, OPEN.y0], [OPEN.x1, LOW]]; for (let i = 1; i < 22; i++) low.push([OPEN.x1 - (OW * i) / 22, LOW + 0.02 * Math.sin(i * 1.7)]); low.push([OPEN.x0, LOW]);
  const bareLow = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(OPEN.x0, OPEN.y0), new THREE.Vector2(OPEN.x1, OPEN.y0), ...ragged(low.slice(2), 7, 0.022)])), ground); bareLow.position.z = pz; P.group.add(bareLow);
  const chalkAll = flatPlane(P.group, OW, OH, 0, (OPEN.y0 + OPEN.y1) / 2, pz + 0.003, overTex((g, X, Y, S) => drawChalk(g, X, Y, S, "all")), 5);
  const chalkLow = flatPlane(P.group, OW, OH, 0, (OPEN.y0 + OPEN.y1) / 2, pz + 0.003, overTex((g, X, Y, S) => drawChalk(g, X, Y, S, "low")), 5);
  const cracksM = flatPlane(P.group, OW, OH, 0, (OPEN.y0 + OPEN.y1) / 2, pz + 0.006, overTex((g, X, Y, S) => {
    g.fillStyle = "rgba(170,120,30,0.16)"; g.fillRect(0, 0, OW * S, OH * S);
    const R = rng(1503); g.strokeStyle = "rgba(44,28,12,0.5)"; g.lineWidth = 1.3;
    for (let i = 0; i < 520; i++) {
      let x = R() * OW * S, y = R() * OH * S, a = R() < 0.5 ? (R() - 0.5) * 0.6 : Math.PI / 2 + (R() - 0.5) * 0.6;
      g.beginPath(); g.moveTo(x, y); for (let k = 0, n = 3 + Math.floor(R() * 6); k < n; k++) { a += (R() - 0.5) * 0.8; x += Math.cos(a) * S * 0.012; y += Math.sin(a) * S * 0.012; g.lineTo(x, y); } g.stroke();
    }
  }), 6, 0);

  // ----- the glass and what was thrown at it (world)
  const GW = 1.4, GH = 1.78, gz = FRAME_Z + 0.2, glassG = new THREE.Group(); G.add(glassG);
  const glassTex = (draw: (g: G, X: (x: number) => number, Y: (y: number) => number, S: number) => void) => overTex(draw, GW, GH, -GW / 2, PIC.cy - GH / 2);
  const glassM = flatPlane(glassG, GW, GH, 0, PIC.cy, gz, glassTex((g, X, Y, S) => {
    g.fillStyle = "rgba(190,215,240,0.07)"; g.fillRect(0, 0, GW * S, GH * S);
    g.filter = `blur(${0.02 * S}px)`;
    for (const [x, w, a] of [[-0.42, 0.16, 0.15], [-0.16, 0.05, 0.1], [0.36, 0.1, 0.09]] as number[][]) { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.moveTo(X(x), Y(PIC.cy + GH / 2)); g.lineTo(X(x + w), Y(PIC.cy + GH / 2)); g.lineTo(X(x + w - 0.5), Y(PIC.cy - GH / 2)); g.lineTo(X(x - 0.5), Y(PIC.cy - GH / 2)); g.closePath(); g.fill(); }
    g.filter = "none";
  }), 20, 1);
  { const m = metal("#3c3a3a", 0.5); for (const [w, h, x, y] of [[GW + 0.06, 0.035, 0, PIC.cy + GH / 2], [GW + 0.06, 0.035, 0, PIC.cy - GH / 2], [0.035, GH, -GW / 2, PIC.cy], [0.035, GH, GW / 2, PIC.cy]] as number[][]) box(glassG, w, h, 0.03, x, y, gz, m, false); }
  // the console under it, and the recess's sides
  box(glassG, 1.9, PIC.cy - GH / 2 - 0.02, 0.36, 0, (PIC.cy - GH / 2 - 0.02) / 2, WZ + 0.18, paint("#b8a888", 0.8));
  const stains = {
    stone: flatPlane(glassG, GW, GH, 0, PIC.cy, gz + 0.004, glassTex((g, X, Y, S) => {
      const R = rng(1956), cx = 0.17, cy = 1.33; g.strokeStyle = "rgba(245,250,255,0.9)"; g.lineCap = "round";
      for (let i = 0; i < 17; i++) { const a = (i / 17) * Math.PI * 2 + R() * 0.3; let r = 0.02, x = cx, y = cy; g.lineWidth = (0.003 + R() * 0.004) * S; g.beginPath(); g.moveTo(X(x), Y(y)); const len = 0.1 + R() * 0.34; while (r < len) { r += 0.04; const b = a + (R() - 0.5) * 0.25; x = cx + Math.cos(b) * r; y = cy + Math.sin(b) * r; g.lineTo(X(x), Y(y)); } g.stroke(); }
      for (const rr of [0.05, 0.11, 0.19]) { g.lineWidth = 0.003 * S; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, r = rr * (0.85 + R() * 0.3); i ? g.lineTo(X(cx + Math.cos(a) * r), Y(cy + Math.sin(a) * r)) : g.moveTo(X(cx + Math.cos(a) * r), Y(cy + Math.sin(a) * r)); } g.stroke(); }
      g.fillStyle = "rgba(250,252,255,0.85)"; g.beginPath(); g.arc(X(cx), Y(cy), 0.022 * S, 0, 7); g.fill();
    }), 21, 0, true),
    cake: flatPlane(glassG, GW, GH, 0, PIC.cy, gz + 0.005, glassTex((g, X, Y, S) => {
      const R = rng(2022); g.lineCap = "round";
      // one long swipe of cream from the upper left down to the right, with crumbs and a berry
      for (const [col, w] of [["rgba(120,90,60,0.25)", 0.3], ["#fbf4e4", 0.27], ["#fffdf4", 0.14]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = w * S; g.beginPath(); g.moveTo(X(-0.48), Y(1.5)); g.quadraticCurveTo(X(-0.1), Y(1.42), X(0.36), Y(1.02)); g.stroke(); }
      for (let i = 0; i < 26; i++) { const u = R(), x = -0.48 + u * 0.84 + (R() - 0.5) * 0.3, y = 1.5 - u * 0.46 + (R() - 0.5) * 0.3; g.fillStyle = ["#f6c2cc", "#fbf4e4", "#e8b470", "#fbf4e4"][Math.floor(R() * 4)]; g.beginPath(); g.arc(X(x), Y(y), (0.012 + R() * 0.03) * S, 0, 7); g.fill(); }
      for (const [x, y, l] of [[-0.25, 1.42, 0.3], [0.0, 1.3, 0.4], [0.2, 1.14, 0.24]]) { g.strokeStyle = "#fbf4e4"; g.lineWidth = 0.035 * S; g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x), Y(y - l)); g.stroke(); }
      g.fillStyle = "#c8323a"; g.beginPath(); g.arc(X(0.1), Y(1.3), 0.04 * S, 0, 7); g.fill(); g.fillStyle = "#5e8a3c"; g.beginPath(); g.arc(X(0.11), Y(1.34), 0.014 * S, 0, 7); g.fill();
    }), 22, 0, true),
    soup: flatPlane(glassG, GW, GH, 0, PIC.cy, gz + 0.006, glassTex((g, X, Y, S) => {
      const R = rng(2024), col = "#ec8a1c", hi = "#f8b048";
      for (const [cx, cy, r] of [[-0.3, 1.86, 0.24], [0.3, 1.36, 0.2]]) {
        g.fillStyle = col; g.beginPath(); for (let i = 0; i <= 30; i++) { const a = (i / 30) * Math.PI * 2, rr = r * (0.72 + R() * 0.5); i ? g.lineTo(X(cx + Math.cos(a) * rr), Y(cy + Math.sin(a) * rr)) : g.moveTo(X(cx + Math.cos(a) * rr), Y(cy + Math.sin(a) * rr)); } g.closePath(); g.fill();
        for (let i = 0; i < 9; i++) { const a = R() * Math.PI * 2, d = r * (1.1 + R() * 0.7); g.beginPath(); g.arc(X(cx + Math.cos(a) * d), Y(cy + Math.sin(a) * d), (0.012 + R() * 0.03) * S, 0, 7); g.fill(); }
        for (let i = 0; i < 6; i++) { const x = cx + (R() - 0.5) * r * 1.5, l = 0.25 + R() * 0.6; g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = (0.022 + R() * 0.02) * S; g.beginPath(); g.moveTo(X(x), Y(cy - r * 0.4)); g.lineTo(X(x), Y(cy - r * 0.4 - l)); g.stroke(); }
        g.fillStyle = hi; g.beginPath(); g.ellipse(X(cx - r * 0.2), Y(cy + r * 0.2), r * 0.4 * S, r * 0.22 * S, -0.4, 0, 7); g.fill();
      }
    }), 23, 0, true),
  };

  // ----- the crowd (the Louvre now): two rows of backs, painted flat, facing the picture
  const crowdG = new THREE.Group(); G.add(crowdG);
  // (the lens is at z 5, 1.5 high: seen from there her picture's lower edge lies at y 1.06 in the far row and at 1.13
  // in the near one, so the heads in the middle stay under that and the tall ones and the screens stand at the sides)
  const rowA: Head[] = [
    { x: -0.98, top: 1.22, r: 0.13, hair: "#1e1c20", coat: "#44506a" }, { x: -0.66, top: 1.34, r: 0.13, hair: "#3a2a22", coat: "#56627a", phone: [-0.47, 1.62] },
    { x: -0.36, top: 1.1, r: 0.125, hair: "#c8a45a", coat: "#a84a42", kind: 1 }, { x: -0.04, top: 1.0, r: 0.12, hair: "#2a2426", coat: "#3f6a5c", kind: 2 },
    { x: 0.3, top: 1.06, r: 0.125, hair: "#8a8a90", coat: "#6a5a7a" }, { x: 0.62, top: 1.3, r: 0.13, hair: "#5a3a26", coat: "#c8a24a", phone: [0.45, 1.58] },
    { x: 0.95, top: 1.2, r: 0.13, hair: "#1e1c20", coat: "#7a4a5a" },
  ];
  const rowB: Head[] = [
    { x: -0.5, top: 1.3, r: 0.15, hair: "#2a2226", coat: "#2e3a56", phone: [-0.33, 1.6] }, { x: -0.17, top: 1.07, r: 0.14, hair: "#7a4a2a", coat: "#7a8a5a", kind: 1 },
    { x: 0.16, top: 1.1, r: 0.145, hair: "#f0d8b8", coat: "#8a3a3a", kind: 3 }, { x: 0.5, top: 1.26, r: 0.15, hair: "#3a2c24", coat: "#3a5a6a", phone: [0.35, 1.56] },
  ];
  flatPlane(crowdG, 3.0, 1.8, 0, 0.9, 1.3, crowdTex(3.0, 1.8, rowA), 30, 1, true);
  flatPlane(crowdG, 2.4, 1.8, 0, 0.9, 1.9, crowdTex(2.4, 1.8, rowB), 31, 1, true);

  // ----- each room's own things
  const things = {} as Record<Room, THREE.Group>;
  for (const r of ROOMS) { things[r] = new THREE.Group(); things[r].name = `mona.room.${r}`; G.add(things[r]); }
  {
    // the studio: a shelf of colours at the right, a work table with a palette and brushes, a lute against the wall
    const T = things.studio, wood = paint("#6e4c2c", 0.8), woodLo = paint("#553a22", 0.85);
    box(T, 0.42, 0.035, 0.2, 0.66, 1.86, WZ + 0.1, wood); for (const x of [0.5, 0.82]) box(T, 0.03, 0.14, 0.16, x, 1.78, WZ + 0.08, woodLo);
    const pots: [number, string, number][] = [[0.52, "#2a4a9a", 0.11], [0.62, "#c8922e", 0.09], [0.72, "#a83a34", 0.12], [0.81, "#e9e4d6", 0.08]];
    for (const [x, c, h] of pots) { lathe(T, [[0, 0], [0.045, 0], [0.05, h * 0.7], [0.036, h], [0, h]], x, 1.878, WZ + 0.1, paint("#b8a888", 0.7)); lathe(T, [[0, 0], [0.034, 0], [0.034, 0.012], [0, 0.012]], x, 1.878 + h, WZ + 0.1, paint(c, 0.6)); }
    // the table
    const tx = 0.47, tz = 1.5, th = 0.6;
    box(T, 0.46, 0.045, 0.42, tx, th, tz, wood); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(T, 0.045, th - 0.02, 0.045, tx + sx * 0.19, (th - 0.02) / 2, tz + sz * 0.16, woodLo);
    // the palette: a board with dabs of colour; a jar with brushes; a mortar
    const pal = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 24), paint("#a8804e", 0.7)); pal.scale.set(1, 1, 0.72); pal.position.set(tx - 0.05, th + 0.03, tz + 0.05); mk(T, pal);
    ([[-0.16, 0.1, "#2a4a9a"], [-0.1, 0.0, "#a83a34"], [-0.02, -0.02, "#c8922e"], [0.0, 0.1, "#e9e4d6"], [-0.08, 0.1, "#4a7a4a"]] as [number, number, string][]).forEach(([dx, dz, c]) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 8), paint(c, 0.5)); d.scale.y = 0.4; d.position.set(tx + dx, th + 0.04, tz + dz); mk(T, d); });
    lathe(T, [[0, 0], [0.05, 0], [0.055, 0.12], [0.045, 0.13], [0, 0.13]], tx + 0.17, th + 0.022, tz - 0.08, paint("#8a6a4a", 0.7));
    for (const [dx, dz, c] of [[-0.02, 0.0, "#e9e4d6"], [0.02, 0.01, "#a83a34"], [0.0, -0.02, "#3a2a1c"]] as [number, number, string][]) { limb(T, [tx + 0.17 + dx * 0.5, th + 0.1, tz - 0.08 + dz * 0.5], [tx + 0.17 + dx * 3, th + 0.36, tz - 0.08 + dz * 3], 0.008, 0.008, paint("#c8a878", 0.7)); const tip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), paint(c, 0.6)); tip.scale.y = 1.6; tip.position.set(tx + 0.17 + dx * 3, th + 0.375, tz - 0.08 + dz * 3); mk(T, tip); }
    // the lute, leaning in the corner by the wall at the left
    const lute = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), paint("#a8733c", 0.6)); body.scale.set(0.82, 1.2, 0.5); body.position.y = 0.24; lute.add(body);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.012, 24), paint("#dcb878", 0.7)); face.rotation.x = Math.PI / 2; face.scale.set(0.82, 1, 1.2); face.position.set(0, 0.24, 0.06); lute.add(face);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 16), paint("#3a2414", 0.8)); rose.rotation.x = Math.PI / 2; rose.position.set(0, 0.3, 0.068); lute.add(rose);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.03), paint("#4a2e1a", 0.7)); neck.position.set(0, 0.66, 0.045); lute.add(neck);
    const peg = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.18, 0.035), paint("#4a2e1a", 0.7)); peg.position.set(0, 0.9, -0.03); peg.rotation.x = -1.15; lute.add(peg);
    lute.position.set(-0.72, 0.0, WZ + 0.2); lute.rotation.set(-0.14, 0.25, 0.1); mk(T, lute);
    // three juggling balls on the floor
    ([[0.1, 1.7, "#c83a34"], [0.3, 1.95, "#e8b83a"], [-0.08, 2.1, "#3a6ab8"]] as [number, number, string][]).forEach(([x, z, c]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), paint(c, 0.5)); b.position.set(x, 0.065, z); mk(T, b); });
  }
  {
    // Cloux: the master's high chair at the left (a rig seat: SPOTS.chair), a table with his books at the right
    const T = things.cloux, wood = paint("#5a3a22", 0.8), velvet = paint("#7c2a2e", 0.9), c = SPOTS.chair, ch = new THREE.Group();
    box(ch, 0.56, 0.06, 0.5, 0, c.top - 0.03, 0, velvet); box(ch, 0.6, 0.05, 0.54, 0, c.top - 0.085, 0, wood);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ch, 0.055, c.top - 0.1, 0.055, sx * 0.26, (c.top - 0.1) / 2, sz * 0.23, wood);
    box(ch, 0.6, 0.98, 0.06, 0, c.top + 0.46, -0.27, wood); box(ch, 0.46, 0.7, 0.03, 0, c.top + 0.5, -0.235, velvet);
    for (const sx of [-1, 1]) { box(ch, 0.055, 0.24, 0.055, sx * 0.275, c.top + 0.12, 0.2, wood); box(ch, 0.07, 0.045, 0.5, sx * 0.275, c.top + 0.25, 0, wood); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), metal("#b8923c")); kn.position.set(sx * 0.27, c.top + 0.98, -0.27); ch.add(kn); }
    ch.position.set(c.at[0], 0, c.at[2]); ch.rotation.y = c.yaw; mk(T, ch);
    const tx = 0.5, tz = 1.4, th = 0.56;
    box(T, 0.5, 0.045, 0.4, tx, th, tz, wood); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(T, 0.045, th - 0.02, 0.045, tx + sx * 0.2, (th - 0.02) / 2, tz + sz * 0.15, wood);
    box(T, 0.26, 0.05, 0.2, tx - 0.05, th + 0.048, tz, paint("#6a3a2c", 0.8)); box(T, 0.24, 0.04, 0.19, tx - 0.04, th + 0.093, tz + 0.01, paint("#3c4a3a", 0.8)); box(T, 0.2, 0.012, 0.15, tx - 0.04, th + 0.12, tz + 0.01, paint("#ead9b3", 0.9));
    lathe(T, [[0, 0], [0.05, 0], [0.05, 0.01], [0.016, 0.03], [0.016, 0.12], [0.03, 0.13], [0, 0.135]], tx + 0.16, th + 0.022, tz - 0.08, metal("#8e8a84", 0.5));
    lathe(T, [[0, 0], [0.014, 0], [0.014, 0.12], [0, 0.125]], tx + 0.16, th + 0.155, tz - 0.08, paint("#ece2c8", 0.7));
  }
  for (const r of ["palace0", "palace1"] as Room[]) {
    // the king's wall: a gilt candle stand at each side
    const T = things[r], gilt = metal("#c8a040", 0.42);
    for (const s of [-1, 1]) {
      lathe(T, [[0, 0], [0.16, 0], [0.16, 0.03], [0.06, 0.08], [0.035, 0.3], [0.06, 0.42], [0.03, 0.55], [0.03, 1.0], [0.07, 1.08], [0.03, 1.16], [0.11, 1.24], [0.11, 1.26], [0, 1.26]], s * 0.76, 0, WZ + 0.3, gilt);
      lathe(T, [[0, 0], [0.022, 0], [0.022, 0.2], [0, 0.21]], s * 0.76, 1.26, WZ + 0.3, paint("#ece2c8", 0.7));
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshBasicMaterial({ color: "#ffd27a" })); fl.scale.y = 1.9; fl.position.set(s * 0.76, 1.51, WZ + 0.3); fl.layers.set(NOINK); T.add(fl);
    }
  }
  {
    // the bedroom: the bed under the picture with its foot toward the lens, a night table with a candle
    const T = things.bedroom, mah = paint("#5a2a20", 0.6), gilt = metal("#c8a040", 0.42), b = SPOTS.bed, bz0 = WZ + 0.04;
    box(T, 1.5, 0.74, 0.08, 0, 0.37, bz0 + 0.04, mah);
    box(T, 1.5, 0.05, 0.1, 0, 0.76, bz0 + 0.04, gilt, false);
    box(T, 1.42, 0.2, 2.1, 0, 0.12, bz0 + 1.13, mah); box(T, 1.36, 0.14, 2.0, 0, b.top - 0.07, bz0 + 1.1, paint("#e9e2d2", 0.9));
    // pillows, and the cover: dark green with a gold band, drawn up over him
    for (const x of [-0.3, 0.32]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 12), paint("#f3eee2", 0.9)); p.scale.set(1.05, 0.36, 0.62); p.position.set(x, b.top + 0.07, bz0 + 0.27); mk(T, p); }
    const cov = paint("#5f8a6c", 0.9);
    box(T, 1.46, 0.1, 1.5, 0, b.top + 0.04, bz0 + 1.42, cov); box(T, 1.47, 0.035, 0.2, 0, b.top + 0.1, bz0 + 0.72, paint("#f3eee2", 0.9), false);
    { const hill = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), cov); hill.scale.set(0.85, 1.0, 1.4); hill.position.set(b.at[0], b.top + 0.06, b.at[2] + 0.5); mk(T, hill); }
    // the foot board
    box(T, 1.5, 0.5, 0.07, 0, 0.25, bz0 + 2.2, mah); box(T, 1.5, 0.045, 0.09, 0, 0.51, bz0 + 2.2, gilt, false);
    // the candle: a gilt arm on the wall at the left of the picture (MOODS.bedroom.glow is its light on her)
    const sx = -0.74, sy = 1.3, sz = WZ + 0.16;
    box(T, 0.09, 0.22, 0.02, sx, sy + 0.02, WZ + 0.01, gilt, false); limb(T, [sx, sy - 0.04, WZ + 0.02], [sx, sy, sz], 0.014, 0.014, gilt);
    lathe(T, [[0, 0], [0.02, 0], [0.05, 0.03], [0.05, 0.04], [0, 0.04]], sx, sy, sz, gilt);
    lathe(T, [[0, 0], [0.017, 0], [0.017, 0.16], [0, 0.165]], sx, sy + 0.04, sz, paint("#ece2c8", 0.7));
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), new THREE.MeshBasicMaterial({ color: "#ffd27a" })); fl.scale.y = 1.9; fl.position.set(sx, sy + 0.25, sz); fl.layers.set(NOINK); T.add(fl);
  }

  // ----- the dials
  let roomNow: Room = "louvre";
  const api: Stage = {
    group: G, pic: P,
    room(r) {
      roomNow = r;
      for (const w of walls) w.material = wallMats[r]; floor.material = floorMats[r];
      for (const k of ROOMS) things[k].visible = k === r;
      crowdG.visible = false; glassG.visible = false;
    },
    mount(m) { easel.visible = m === "easel"; P.frame.visible = m === "frame"; plateG.visible = m === "frame"; },
    state(s) { bareHead.visible = chalkAll.visible = s === "head"; bareLow.visible = chalkLow.visible = s === "body"; },
    cracks(k) { cracksM.visible = k > 0.001; (cracksM.material as THREE.MeshBasicMaterial).opacity = k; },
    glass(k) { glassG.visible = k > 0.001 && roomNow === "louvre"; (glassM.material as THREE.MeshBasicMaterial).opacity = k; },
    stain(n, k) { stains[n].visible = k > 0.001; (stains[n].material as THREE.MeshBasicMaterial).opacity = k; },
    crowd(k) { crowdG.visible = k > 0.001 && roomNow === "louvre"; crowdG.position.y = -(1 - k) * 1.6; },
    plate,
    torch: (x, y, r, k) => P.torch(x, y - LIFT, r, k),
    dim: (k) => P.dim(k),
  };
  api.room("louvre"); api.mount("frame"); api.state("done"); api.cracks(0); api.glass(0); api.crowd(0);
  for (const n of ["stone", "cake", "soup"] as const) api.stain(n, 0);
  return api;
};
/** her head in the picture's own frame: centre x, y and the half sizes of the painted patch round it (state "head") */
const HEAD: [number, number, number, number] = [0.0, 1.235, 0.27, 0.29];
/** the height (picture frame) under which the panel is still bare in state "body" */
const LOW = 0.9;

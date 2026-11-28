// THE CASE BOOKS (v6, owner's note 15 on v5: "maybe book can have name of the story? ... the visuals are very boring
// illustrated for his stories, ALL of them! Go back to the drawing board"). Each famous case is a thread-bound book
// (线装书) with the story's name on the label of its cover. Opened, a paper pop-up stands up off its pages: cut paper in
// flat colour with a cream paper margin and an ink edge painted round it (the film's outline, NOINK), in layers that
// rise from the page as the book opens, and each book plays its own gag:
//   niulang   《牛郎织女》 a magpie bridge between them over the Milky Way (the gutter); the magpies fly off one by one
//   liangzhu  《梁祝》     the two of them by the grave mound; they fold away and two butterflies flutter up off the page
//   baishe    《白蛇传》   许仙 under his umbrella and a white snake at the broken bridge; a concertina of approval slips
//             climbs out of the book, up and up
//   baodai    《红楼梦》   宝玉 between 黛玉 and 宝钗, his red thread to 黛玉; it swings over and lands on 宝钗; then the
//             readers' angry letters burst out
//   qixian    《天仙配》   bound in imperial yellow under the Jade Emperor's seal strip; opened a crack, his jade seal
//             springs up out of it
// A book is a prop: put(at, {yaw, pitch, roll, scale}) and set({ open, g, t }): open 0 shut .. 1 flat open, g = the gag
// 0..1 (each book reads it its own way), t = seconds (flutter, wobble). Its frame: the spine along local y at x 0, the
// open spread facing +z (x -PW..PW, y -PH/2..PH/2); shut, it lies on x -PW..0, bound on its right edge as a Chinese book
// is, its cover facing +z. Every piece is a pure function of the state: no state is kept between frames.
import * as THREE from "three";
import { Part, paint, NOINK, FONT, type Kit } from "../../kit/props/kit";

export type BookKind = "niulang" | "liangzhu" | "baishe" | "baodai" | "qixian";
export type BookState = { open: number; g?: number; t?: number };
export type PopBook = { group: THREE.Group; put(at: THREE.Vector3, o?: { yaw?: number; pitch?: number; roll?: number; scale?: number }): PopBook; set(s: BookState): PopBook };
/** page width (each half), page height, board and page-block thickness */
export const PB = { pw: 0.25, ph: 0.33, board: 0.005, block: 0.016 } as const;
export const BOOK_TITLE: Record<BookKind, string> = { niulang: "牛郎织女", liangzhu: "梁祝", baishe: "白蛇传", baodai: "红楼梦", qixian: "天仙配" };

const BRUSH = `"YL Brush", ${FONT}`, SONG = `"YL Song", ${FONT}`;
const INK = "#2b2630", PAPER = "#f4ead0";
const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
type G = CanvasRenderingContext2D;

// ----------------------------------------------------------------------------------------------------- cut paper
/** a canvas drawn by fn, returned as a canvas (for compositing) */
const canvasOf = (w: number, h: number, fn: (g: G, w: number, h: number) => void) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d")!, w, h); return c; };
/** the shape of a canvas in one colour */
const tinted = (src: HTMLCanvasElement, col: string) => canvasOf(src.width, src.height, (g) => { g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = col; g.fillRect(0, 0, src.width, src.height); });
/** CUT PAPER: what fn draws, with a cream paper margin (m px) round its shape and an ink edge (e px) round that */
const cut = (w: number, h: number, fn: (g: G, w: number, h: number) => void, m = 7, e = 4) => paint(w, h, (g) => {
  const art = canvasOf(w, h, fn), ink = tinted(art, INK), paper = tinted(art, "#fbf3e0");
  const ring = (src: HTMLCanvasElement, r: number) => { for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; g.drawImage(src, Math.cos(a) * r, Math.sin(a) * r); } };
  ring(ink, m + e); ring(ink, (m + e) * 0.6); ring(paper, m); ring(paper, m * 0.5); g.drawImage(art, 0, 0);
});
/** a round dot */
const dot = (g: G, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };

/** A PAPER DOLL (one of the story's people): a round head with dot eyes and blush, hair or a cap, a robe with wide
 *  sleeves, a sash; acc draws what they carry. All in proportion to the canvas (the figure fills its height). */
type Doll = { robe: string; robeLo: string; trim: string; hair: string; female?: boolean; cap?: "scholar" | "bun" | "crown" | "kerchief"; sleeves?: "down" | "out" | "fwd"; acc?: (g: G, W: number, H: number) => void; flip?: boolean };
const doll = (s: Doll) => (g: G, W: number, H: number) => {
  if (s.flip) { g.translate(W, 0); g.scale(-1, 1); }
  const cx = W / 2, hr = W * 0.17, hy = H * 0.2, neck = hy + hr * 0.9, hem = H * 0.93;
  // robe: a bell from the neck to the hem
  g.fillStyle = s.robe; g.beginPath(); g.moveTo(cx - W * 0.12, neck); g.quadraticCurveTo(cx - W * 0.2, H * 0.6, cx - W * 0.33, hem); g.lineTo(cx + W * 0.33, hem); g.quadraticCurveTo(cx + W * 0.2, H * 0.6, cx + W * 0.12, neck); g.closePath(); g.fill();
  g.fillStyle = s.robeLo; g.beginPath(); g.moveTo(cx, neck + H * 0.02); g.quadraticCurveTo(cx + W * 0.1, H * 0.65, cx + W * 0.06, hem); g.lineTo(cx + W * 0.33, hem); g.quadraticCurveTo(cx + W * 0.2, H * 0.6, cx + W * 0.12, neck); g.closePath(); g.fill();
  // hem band, collar V, sash
  g.fillStyle = s.trim; g.fillRect(cx - W * 0.33, hem - H * 0.035, W * 0.66, H * 0.035);
  g.strokeStyle = s.trim; g.lineWidth = W * 0.035; g.beginPath(); g.moveTo(cx - W * 0.09, neck); g.lineTo(cx + W * 0.02, H * 0.42); g.lineTo(cx + W * 0.1, neck); g.stroke();
  g.fillStyle = s.trim; g.fillRect(cx - W * 0.17, H * 0.5, W * 0.34, H * 0.035);
  // sleeves
  const sl = s.sleeves ?? "down";
  g.fillStyle = s.robe;
  for (const sd of [-1, 1]) {
    g.save(); g.translate(cx + sd * W * 0.13, neck + H * 0.03);
    g.rotate(sl === "out" ? sd * -0.9 : sl === "fwd" ? sd * -0.35 : sd * -0.12);
    g.beginPath(); g.moveTo(-W * 0.06, 0); g.quadraticCurveTo(sd * W * 0.02, H * 0.05, -W * 0.08 + sd * W * 0.06, H * 0.27); g.lineTo(W * 0.1 + sd * W * 0.06, H * 0.27); g.quadraticCurveTo(W * 0.08, H * 0.1, W * 0.06, 0); g.closePath(); g.fill();
    g.fillStyle = s.trim; g.fillRect(-W * 0.08 + sd * W * 0.06, H * 0.25, W * 0.18, H * 0.025); g.fillStyle = s.robe;
    dot(g, sd * W * 0.06 + W * 0.01, H * 0.295, W * 0.035, "#f6e8d0");   // the hand
    g.restore();
  }
  // feet
  dot(g, cx - W * 0.1, hem + H * 0.012, W * 0.045, INK); dot(g, cx + W * 0.1, hem + H * 0.012, W * 0.045, INK);
  // head
  dot(g, cx, hy, hr, "#f6e8d0");
  g.fillStyle = s.hair;
  if (s.female) {
    g.beginPath(); g.arc(cx, hy - hr * 0.1, hr * 1.04, Math.PI * 1.05, Math.PI * 1.95); g.fill();
    dot(g, cx, hy - hr * 1.15, hr * 0.5, s.hair); dot(g, cx - hr * 0.62, hy - hr * 0.95, hr * 0.32, s.hair); dot(g, cx + hr * 0.62, hy - hr * 0.95, hr * 0.32, s.hair);
    g.fillRect(cx - hr * 1.02, hy - hr * 0.2, hr * 0.28, hr * 1.2); g.fillRect(cx + hr * 0.74, hy - hr * 0.2, hr * 0.28, hr * 1.2);
    dot(g, cx + hr * 0.5, hy - hr * 1.05, hr * 0.14, s.trim);   // a hairpin
  } else {
    g.beginPath(); g.arc(cx, hy - hr * 0.05, hr * 1.02, Math.PI * 1.08, Math.PI * 1.92); g.fill();
    if (s.cap === "scholar") { g.fillStyle = INK; g.fillRect(cx - hr * 0.7, hy - hr * 1.45, hr * 1.4, hr * 0.6); g.fillRect(cx - hr * 1.05, hy - hr * 1.0, hr * 2.1, hr * 0.16); g.fillStyle = s.trim; g.fillRect(cx - hr * 0.7, hy - hr * 1.0, hr * 1.4, hr * 0.12); }
    else if (s.cap === "crown") { dot(g, cx, hy - hr * 1.05, hr * 0.36, s.hair); g.fillStyle = "#e2b03a"; g.fillRect(cx - hr * 0.42, hy - hr * 1.32, hr * 0.84, hr * 0.32); dot(g, cx, hy - hr * 1.38, hr * 0.14, "#c8322c"); }
    else if (s.cap === "kerchief") { g.fillStyle = s.trim; g.beginPath(); g.arc(cx, hy - hr * 0.2, hr * 1.06, Math.PI * 1.05, Math.PI * 1.95); g.fill(); g.fillRect(cx + hr * 0.6, hy - hr * 0.5, hr * 0.7, hr * 0.22); }
    else dot(g, cx, hy - hr * 1.1, hr * 0.38, s.hair);
  }
  // face: dot eyes, blush, a small mouth
  dot(g, cx - hr * 0.36, hy + hr * 0.08, hr * 0.1, INK); dot(g, cx + hr * 0.36, hy + hr * 0.08, hr * 0.1, INK);
  g.fillStyle = "rgba(232,120,110,0.45)"; g.beginPath(); g.ellipse(cx - hr * 0.55, hy + hr * 0.36, hr * 0.18, hr * 0.11, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx + hr * 0.55, hy + hr * 0.36, hr * 0.18, hr * 0.11, 0, 0, 7); g.fill();
  g.strokeStyle = INK; g.lineWidth = hr * 0.08; g.lineCap = "round"; g.beginPath(); g.arc(cx, hy + hr * 0.36, hr * 0.16, 0.2, Math.PI - 0.2); g.stroke();
  s.acc?.(g, W, H);
};

/** a stylized 祥云 cluster drawn in place (for backgrounds) */
const cloudRow = (g: G, x0: number, x1: number, base: number, rr: number, fill: string, edge: string) => {
  const n = Math.max(2, Math.round((x1 - x0) / (rr * 1.3)));
  g.fillStyle = edge; for (let i = 0; i < n; i++) { const x = x0 + ((i + 0.5) * (x1 - x0)) / n, r = rr * (0.75 + 0.35 * Math.sin(i * 2.3 + 1)); dot(g, x, base - r * 0.5, r + 5, edge); }
  g.fillRect(x0 - 5, base - rr * 0.5, x1 - x0 + 10, rr * 0.5 + 5);
  for (let i = 0; i < n; i++) { const x = x0 + ((i + 0.5) * (x1 - x0)) / n, r = rr * (0.75 + 0.35 * Math.sin(i * 2.3 + 1)); dot(g, x, base - r * 0.5, r, fill); }
  g.fillStyle = fill; g.fillRect(x0, base - rr * 0.5, x1 - x0, rr * 0.5);
};
/** a backdrop panel: an arch-topped card of colour (paint draws its picture inside), its edge inked */
const panel = (w: number, h: number, draw: (g: G, w: number, h: number) => void, arch = true) => paint(w, h, (g, W, H) => {
  const path = () => { g.beginPath(); if (arch) { g.moveTo(10, H - 10); g.lineTo(10, H * 0.32); g.quadraticCurveTo(10, 10, W * 0.5, 10); g.quadraticCurveTo(W - 10, 10, W - 10, H * 0.32); g.lineTo(W - 10, H - 10); g.closePath(); } else g.rect(10, 10, W - 20, H - 20); };
  g.save(); path(); g.clip(); draw(g, W, H); g.restore();
  g.strokeStyle = "#fbf3e0"; g.lineWidth = 10; path(); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 5; g.save(); g.translate(0, 0); path(); g.stroke(); g.restore();
});

// ----------------------------------------------------------------------------------------------------- the paintings
const ART = {
  // 《牛郎织女》
  nightSky: () => panel(768, 470, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1e2850"); gr.addColorStop(1, "#3a4a80"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // the Milky Way down the middle (it runs along the book's gutter): a pale band of dots
    const band = g.createLinearGradient(W * 0.38, 0, W * 0.62, 0); band.addColorStop(0, "rgba(220,226,255,0)"); band.addColorStop(0.5, "rgba(220,226,255,0.55)"); band.addColorStop(1, "rgba(220,226,255,0)");
    g.fillStyle = band; g.fillRect(0, 0, W, H);
    let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) { const x = W * (0.5 + (rnd() - 0.5) * 0.26 * (0.6 + rnd())), y = H * rnd(); dot(g, x, y, 1.5 + 3 * rnd(), "#f4f2ff"); }
    for (let i = 0; i < 40; i++) { const x = W * rnd(), y = H * rnd() * 0.7; const r = 3 + 5 * rnd(); g.fillStyle = "#f0d070"; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.3, y - r * 0.3); g.lineTo(x + r, y); g.lineTo(x + r * 0.3, y + r * 0.3); g.lineTo(x, y + r); g.lineTo(x - r * 0.3, y + r * 0.3); g.lineTo(x - r, y); g.lineTo(x - r * 0.3, y - r * 0.3); g.closePath(); g.fill(); }
    g.fillStyle = "#e9c060"; g.font = `700 34px ${SONG}`; g.textAlign = "center"; g.fillText("银 河", W / 2, H * 0.14);
  }),
  cloudBanks: () => cut(768, 170, (g, W, H) => { cloudRow(g, 20, W * 0.4, H - 10, 44, "#f8efdc", "#d8b878"); cloudRow(g, W * 0.6, W - 20, H - 10, 44, "#f8efdc", "#d8b878"); }, 4, 3),
  niulang: () => cut(256, 400, doll({ robe: "#3c6a8a", robeLo: "#2e5470", trim: "#e2b03a", hair: INK, cap: "kerchief", sleeves: "fwd", acc: (g, W, H) => {
    // the carrying pole over his shoulder, a basket at each end, a child's head peeping out of each
    g.strokeStyle = "#8a5a3a"; g.lineWidth = W * 0.04; g.beginPath(); g.moveTo(W * 0.02, H * 0.37); g.lineTo(W * 0.98, H * 0.33); g.stroke();
    for (const x of [W * 0.08, W * 0.92]) { g.strokeStyle = "#8a5a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, H * 0.36); g.lineTo(x - W * 0.06, H * 0.5); g.moveTo(x, H * 0.36); g.lineTo(x + W * 0.06, H * 0.5); g.stroke(); dot(g, x, H * 0.5, W * 0.06, "#f6e8d0"); dot(g, x, H * 0.47, W * 0.035, INK); g.fillStyle = "#c8a05a"; g.beginPath(); g.moveTo(x - W * 0.09, H * 0.52); g.lineTo(x + W * 0.09, H * 0.52); g.lineTo(x + W * 0.07, H * 0.6); g.lineTo(x - W * 0.07, H * 0.6); g.closePath(); g.fill(); }
  } })),
  zhinv: () => cut(256, 400, doll({ robe: "#d86a8a", robeLo: "#b8506e", trim: "#f6e0a0", hair: INK, female: true, sleeves: "out", acc: (g, W, H) => {
    // her floating silk ribbon (披帛) in a loop round her
    g.strokeStyle = "#f6e0a0"; g.lineWidth = W * 0.035; g.beginPath(); g.moveTo(W * 0.12, H * 0.62); g.bezierCurveTo(W * -0.05, H * 0.3, W * 0.5, H * 0.24, W * 0.9, H * 0.4); g.bezierCurveTo(W * 1.02, H * 0.5, W * 0.9, H * 0.7, W * 0.86, H * 0.74); g.stroke();
  } })),
  magpie: () => cut(160, 110, (g, W, H) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(W * 0.48, H * 0.55, W * 0.24, H * 0.17, -0.1, 0, 7); g.fill();          // body
    dot(g, W * 0.74, H * 0.42, W * 0.09, INK);                                                                              // head
    g.fillStyle = "#e9a03a"; g.beginPath(); g.moveTo(W * 0.82, H * 0.4); g.lineTo(W * 0.92, H * 0.43); g.lineTo(W * 0.82, H * 0.46); g.closePath(); g.fill();   // beak
    g.fillStyle = "#f4f2ea"; g.beginPath(); g.ellipse(W * 0.52, H * 0.62, W * 0.13, H * 0.08, -0.1, 0, 7); g.fill();     // white belly
    g.fillStyle = INK; g.beginPath(); g.moveTo(W * 0.28, H * 0.55); g.lineTo(W * 0.02, H * 0.42); g.lineTo(W * 0.05, H * 0.55); g.lineTo(W * 0.26, H * 0.62); g.closePath(); g.fill();   // tail
    g.fillStyle = "#3a4a6a"; g.beginPath(); g.moveTo(W * 0.42, H * 0.48); g.quadraticCurveTo(W * 0.4, H * 0.05, W * 0.62, H * 0.1); g.quadraticCurveTo(W * 0.6, H * 0.35, W * 0.56, H * 0.5); g.closePath(); g.fill();   // the raised wing
    g.fillStyle = "#f4f2ea"; g.beginPath(); g.moveTo(W * 0.48, H * 0.42); g.quadraticCurveTo(W * 0.5, H * 0.2, W * 0.58, H * 0.18); g.lineTo(W * 0.56, H * 0.4); g.closePath(); g.fill();
    dot(g, W * 0.77, H * 0.4, W * 0.018, "#f4f2ea");
  }, 5, 3),
  thread: () => cut(512, 48, (g, W, H) => { g.strokeStyle = "#c8332b"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(14, H * 0.3); g.quadraticCurveTo(W / 2, H * 0.95, W - 14, H * 0.3); g.stroke(); }, 3, 3),
  // 《梁祝》
  dusk: () => panel(768, 470, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#7a6aa8"); gr.addColorStop(0.6, "#d89ab0"); gr.addColorStop(1, "#f2c8a8"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    dot(g, W * 0.72, H * 0.3, W * 0.07, "#fbefd8");
    // willow strands from the top
    g.strokeStyle = "#3e6a4a"; g.lineWidth = 5; g.lineCap = "round";
    for (let i = 0; i < 16; i++) { const x = W * (0.03 + i * 0.062), len = H * (0.25 + 0.25 * Math.abs(Math.sin(i * 1.7))); g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 14, len * 0.5, x + 4, len); g.stroke(); for (let k = 1; k < 6; k++) { const yy = (len * k) / 6; g.fillStyle = "#5a8a5a"; g.beginPath(); g.ellipse(x + 8 + 3 * Math.sin(k), yy, 5, 11, 0.4, 0, 7); g.fill(); } }
  }),
  mound: () => cut(768, 200, (g, W, H) => {
    g.fillStyle = "#6a9a5a"; g.beginPath(); g.moveTo(0, H); g.quadraticCurveTo(W * 0.5, -H * 0.5, W, H); g.closePath(); g.fill();
    g.fillStyle = "#4e7a46"; g.beginPath(); g.moveTo(W * 0.2, H); g.quadraticCurveTo(W * 0.6, H * 0.1, W * 0.95, H); g.closePath(); g.fill();
    g.fillStyle = "#8a8a8a"; g.fillRect(W * 0.46, H * 0.3, W * 0.08, H * 0.5); g.fillStyle = "#b8b8b0"; g.fillRect(W * 0.47, H * 0.32, W * 0.06, H * 0.46);   // the stone
    for (let i = 0; i < 18; i++) { const x = W * (0.05 + 0.05 * i), y = H * (0.75 + 0.2 * Math.sin(i * 1.3)); dot(g, x, y, 7, ["#f2d060", "#f4a0b0", "#ffffff"][i % 3]); }
  }, 4, 3),
  liang: () => cut(256, 400, doll({ robe: "#5a8ab8", robeLo: "#4672a0", trim: "#f4ead0", hair: INK, cap: "scholar", sleeves: "fwd", acc: (g, W, H) => { g.fillStyle = "#f4ead0"; g.beginPath(); g.moveTo(W * 0.82, H * 0.58); g.arc(W * 0.82, H * 0.58, W * 0.16, -2.2, -0.9); g.closePath(); g.fill(); } })),
  zhu: () => cut(256, 400, doll({ robe: "#e8a0b8", robeLo: "#d0849e", trim: "#fbefd8", hair: INK, female: true, sleeves: "fwd", flip: true })),
  butterfly: (a: string, b: string) => cut(200, 150, (g, W, H) => {
    for (const sd of [-1, 1]) {
      g.fillStyle = a; g.beginPath(); g.ellipse(W / 2 + sd * W * 0.22, H * 0.36, W * 0.22, H * 0.26, sd * 0.5, 0, 7); g.fill();
      g.fillStyle = b; g.beginPath(); g.ellipse(W / 2 + sd * W * 0.17, H * 0.68, W * 0.15, H * 0.2, sd * -0.4, 0, 7); g.fill();
      dot(g, W / 2 + sd * W * 0.26, H * 0.34, W * 0.05, "#fbf3e0");
    }
    g.fillStyle = INK; g.beginPath(); g.ellipse(W / 2, H * 0.52, W * 0.03, H * 0.3, 0, 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, H * 0.25); g.quadraticCurveTo(W * 0.44, H * 0.08, W * 0.38, H * 0.04); g.moveTo(W / 2, H * 0.25); g.quadraticCurveTo(W * 0.56, H * 0.08, W * 0.62, H * 0.04); g.stroke();
  }, 4, 3),
  // 《白蛇传》
  lake: () => panel(768, 470, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#b8c8c8"); gr.addColorStop(1, "#7aa0a8"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = "#8aa4a0"; g.beginPath(); g.moveTo(0, H * 0.55); for (let i = 0; i <= 8; i++) g.lineTo((W * i) / 8, H * (0.38 + 0.12 * Math.abs(Math.sin(i * 1.9)))); g.lineTo(W, H * 0.55); g.closePath(); g.fill();
    g.fillStyle = "#6a8a88"; g.beginPath(); g.moveTo(0, H * 0.6); for (let i = 0; i <= 6; i++) g.lineTo((W * i) / 6, H * (0.48 + 0.1 * Math.abs(Math.cos(i * 1.3)))); g.lineTo(W, H * 0.6); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = (i * 53) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 26); g.stroke(); }   // rain
    // the broken bridge
    g.strokeStyle = "#e8e2d4"; g.lineWidth = 16; g.beginPath(); g.arc(W * 0.5, H * 0.95, W * 0.3, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  }),
  pagoda: () => cut(220, 470, (g, W, H) => {
    for (let k = 0; k < 6; k++) { const y = H * (0.9 - k * 0.13), w = W * (0.8 - k * 0.09); g.fillStyle = "#c8a878"; g.fillRect(W / 2 - w * 0.38, y - H * 0.1, w * 0.76, H * 0.1); g.fillStyle = "#7a4a3a"; g.beginPath(); g.moveTo(W / 2 - w / 2, y - H * 0.1); g.lineTo(W / 2 + w / 2, y - H * 0.1); g.lineTo(W / 2 + w * 0.3, y - H * 0.135); g.lineTo(W / 2 - w * 0.3, y - H * 0.135); g.closePath(); g.fill(); dot(g, W / 2, y - H * 0.05, W * 0.035, INK); }
    g.fillStyle = "#e2b03a"; g.fillRect(W / 2 - 4, H * 0.06, 8, H * 0.1);
  }, 5, 3),
  xuxian: () => cut(300, 400, doll({ robe: "#f0ecdc", robeLo: "#d8d2bc", trim: "#5a8ab8", hair: INK, cap: "scholar", sleeves: "fwd", acc: (g, W, H) => {
    // his oiled-paper umbrella
    g.strokeStyle = "#8a5a3a"; g.lineWidth = 5; g.beginPath(); g.moveTo(W * 0.66, H * 0.6); g.lineTo(W * 0.66, H * 0.02); g.stroke();
    g.fillStyle = "#c8332b"; g.beginPath(); g.moveTo(W * 0.66, H * 0.0); g.quadraticCurveTo(W * 1.02, H * 0.04, W * 1.0, H * 0.16); g.lineTo(W * 0.32, H * 0.16); g.quadraticCurveTo(W * 0.3, H * 0.04, W * 0.66, H * 0.0); g.fill();
    g.strokeStyle = "#e9c060"; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(W * 0.66, H * 0.01); g.lineTo(W * (0.34 + k * 0.16), H * 0.16); g.stroke(); }
  } })),
  snake: () => cut(300, 300, (g, W, H) => {
    // a white snake coiled up, head raised, a red hair ornament on top (she is 白娘子)
    g.lineCap = "round";
    g.strokeStyle = "#f4f2ea"; g.lineWidth = W * 0.13; g.beginPath(); g.ellipse(W * 0.5, H * 0.8, W * 0.32, H * 0.12, 0, 0, 7); g.stroke();
    g.beginPath(); g.ellipse(W * 0.5, H * 0.66, W * 0.22, H * 0.09, 0, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(W * 0.7, H * 0.62); g.quadraticCurveTo(W * 0.82, H * 0.35, W * 0.55, H * 0.26); g.stroke();
    g.strokeStyle = "#d8d4c8"; g.lineWidth = W * 0.035; g.beginPath(); g.ellipse(W * 0.5, H * 0.8, W * 0.32, H * 0.12, 0, 0.3, 2.6); g.stroke();
    dot(g, W * 0.48, H * 0.24, W * 0.12, "#f4f2ea");
    dot(g, W * 0.43, H * 0.22, W * 0.022, INK); dot(g, W * 0.55, H * 0.22, W * 0.022, INK);
    g.fillStyle = "rgba(232,120,110,0.5)"; dot(g, W * 0.4, H * 0.27, W * 0.025, "rgba(232,120,110,0.5)"); dot(g, W * 0.58, H * 0.27, W * 0.025, "rgba(232,120,110,0.5)");
    dot(g, W * 0.48, H * 0.11, W * 0.05, INK); dot(g, W * 0.52, H * 0.09, W * 0.025, "#c8332b");
  }, 5, 3),
  slip: (i: number) => cut(256, 96, (g, W, H) => {
    g.fillStyle = "#f2e2b0"; g.fillRect(6, 6, W - 12, H - 12);
    g.fillStyle = "#2a211c"; g.font = `700 30px ${SONG}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(["审批单", "复核单", "会签单", "备案单"][i % 4], 22, H / 2);
    g.strokeStyle = "rgba(42,33,28,0.4)"; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(130, 28 + k * 20); g.lineTo(W - 70, 28 + k * 20); g.stroke(); }
    g.save(); g.translate(W - 42, H / 2); g.rotate(-0.25 + 0.1 * (i % 3)); g.strokeStyle = "#c8332b"; g.lineWidth = 4; g.strokeRect(-24, -24, 48, 48); g.fillStyle = "#c8332b"; g.font = `900 30px ${SONG}`; g.textAlign = "center"; g.fillText(["批", "准", "驳", "阅"][i % 4], 0, 2); g.restore();
  }, 3, 3),
  // 《红楼梦》
  garden: () => panel(768, 470, (g, W, H) => {
    g.fillStyle = "#cfe0c8"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#f2ece0"; g.fillRect(0, H * 0.35, W, H * 0.65);
    g.fillStyle = "#3a3a44"; g.fillRect(0, H * 0.3, W, H * 0.06);   // the wall's tiled coping
    g.fillStyle = "#cfe0c8"; g.beginPath(); g.arc(W * 0.5, H * 0.72, H * 0.3, 0, 7); g.fill();   // the moon gate
    g.strokeStyle = "#8a8a90"; g.lineWidth = 8; g.beginPath(); g.arc(W * 0.5, H * 0.72, H * 0.3, 0, 7); g.stroke();
    g.strokeStyle = "#5a3a2a"; g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.08, H); g.quadraticCurveTo(W * 0.14, H * 0.5, W * 0.3, H * 0.2); g.moveTo(W * 0.92, H); g.quadraticCurveTo(W * 0.86, H * 0.5, W * 0.7, H * 0.18); g.stroke();
    for (let i = 0; i < 30; i++) { const s = i < 15 ? 0 : 1, u = (i % 15) / 15, x = s ? W * (0.92 - 0.22 * u) : W * (0.08 + 0.22 * u), y = H * (1 - 0.82 * u) + 18 * Math.sin(i * 2.1); dot(g, x + 10 * Math.cos(i), y, 8, i % 2 ? "#f4b0c0" : "#ffffff"); }
  }),
  daiyu: () => cut(256, 400, doll({ robe: "#a8c8c0", robeLo: "#8ab0a8", trim: "#f4ead0", hair: INK, female: true, sleeves: "fwd", acc: (g, W, H) => { g.strokeStyle = "#8a5a3a"; g.lineWidth = 5; g.beginPath(); g.moveTo(W * 0.12, H * 0.92); g.lineTo(W * 0.3, H * 0.5); g.stroke(); g.fillStyle = "#8a8a8a"; g.fillRect(W * 0.04, H * 0.88, W * 0.14, H * 0.05); } })),
  baoyu: () => cut(256, 400, doll({ robe: "#c8332b", robeLo: "#a82a26", trim: "#e2b03a", hair: INK, cap: "crown", sleeves: "out", acc: (g, W, H) => { dot(g, W * 0.5, H * 0.44, W * 0.04, "#7ac8a0"); } })),
  baochai: () => cut(256, 400, doll({ robe: "#e8c058", robeLo: "#d0a840", trim: "#fbf3e0", hair: INK, female: true, sleeves: "fwd", flip: true, acc: (g, W, H) => { dot(g, W * 0.5, H * 0.44, W * 0.045, "#e2b03a"); } })),
  tear: () => cut(40, 56, (g, W, H) => { g.fillStyle = "#8ac0e8"; g.beginPath(); g.moveTo(W / 2, 4); g.quadraticCurveTo(W - 6, H * 0.6, W / 2, H - 6); g.quadraticCurveTo(6, H * 0.6, W / 2, 4); g.fill(); }, 2, 2),
  letter: (i: number) => cut(150, 100, (g, W, H) => {
    g.fillStyle = "#fbf6ea"; g.fillRect(8, 8, W - 16, H - 16);
    g.strokeStyle = "rgba(42,33,28,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 8); g.lineTo(W / 2, H * 0.55); g.lineTo(W - 8, 8); g.stroke();
    g.fillStyle = "#c8332b"; g.font = `900 40px ${SONG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(["怒", "差评", "退钱", "改结局"][i % 4], W / 2, H * 0.62);
  }, 3, 3),
  // 《天仙配》: the jade seal's face
  sealFace: () => paint(256, 256, (g, W, H) => { g.fillStyle = "#c8332b"; g.fillRect(0, 0, W, H); g.fillStyle = "#fbefd8"; g.font = `900 92px ${SONG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("玉帝", W / 2, H * 0.3); g.fillText("御批", W / 2, H * 0.72); }),
};

/** the cover: cloth in its colour, a fine weave, the story's name on a cream label at the top left, the four stitches
 *  of the binding along its right edge; qixian adds the Jade Emperor's seal strip across it */
const coverTex = (kind: BookKind, cloth: string) => paint(256, 338, (g, W, H) => {
  g.fillStyle = cloth; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 1; for (let y = 0; y < H; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  if (kind === "qixian") {
    // imperial yellow silk: a faint pattern of small 如意 clouds
    g.strokeStyle = "rgba(150,100,24,0.45)"; g.lineWidth = 3; g.lineCap = "round";
    for (let y = 40; y < H; y += 70) for (let x = (y / 70) % 2 ? 40 : 75; x < W - 20; x += 70) { g.beginPath(); g.arc(x - 9, y, 8, Math.PI * 0.9, Math.PI * 2.6); g.stroke(); g.beginPath(); g.arc(x + 9, y, 8, Math.PI * 0.4, Math.PI * -1.1, true); g.stroke(); g.beginPath(); g.moveTo(x - 18, y + 9); g.quadraticCurveTo(x, y + 15, x + 18, y + 9); g.stroke(); }
  }
  // the label (题签): big enough to read on a phone when he holds the book up two metres from her lens (v6: the title
  // is the first thing the viewer reads of each case, so it is about the size of a subtitle character on screen)
  const lx = 18, ly = 18, lw = 92, lh = kind === "qixian" ? 250 : 296;   // (天仙配's stops above the seal strip)
  g.fillStyle = "#f4ead0"; g.fillRect(lx, ly, lw, lh); g.strokeStyle = "#8a6a3a"; g.lineWidth = 3; g.strokeRect(lx + 5, ly + 5, lw - 10, lh - 10);
  const t = BOOK_TITLE[kind], n = [...t].length, step = (lh - 26) / Math.max(3, n), px = Math.min(74, step * 0.92);
  g.fillStyle = "#2a211c"; g.font = `900 ${px}px ${BRUSH}`; g.textAlign = "center"; g.textBaseline = "middle";
  [...t].forEach((c, i) => g.fillText(c, lx + lw / 2, ly + 15 + step * (i + 0.5) + (lh - 30 - step * n) / 2));
  // the binding's stitches along the right edge
  g.strokeStyle = "#f4ead0"; g.lineWidth = 4;
  for (const y of [0.12, 0.37, 0.63, 0.88]) { g.beginPath(); g.moveTo(W - 22, H * y); g.lineTo(W, H * y); g.stroke(); dot(g, W - 22, H * y, 4, "#2a211c"); }
  g.beginPath(); g.moveTo(W - 3, 0); g.lineTo(W - 3, H); g.stroke();
  if (kind === "qixian") {
    // the seal strip: white paper across, red characters, a red seal
    g.save(); g.translate(W * 0.55, H * 0.8); g.rotate(-0.18);
    g.fillStyle = "#fbf6ea"; g.fillRect(-W * 0.7, -26, W * 1.4, 52);
    g.fillStyle = "#c8332b"; g.font = `900 30px ${SONG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("玉 帝 御 封", -12, 1);
    g.strokeStyle = "#c8332b"; g.lineWidth = 4; g.strokeRect(68, -20, 40, 40); g.font = `900 26px ${SONG}`; g.fillText("封", 88, 1);
    g.restore();
  }
});

const CLOTH: Record<BookKind, string> = { niulang: "#2e3c62", liangzhu: "#2e5a4a", baishe: "#7a9a90", baodai: "#7a2a3a", qixian: "#c8962e" };

// ----------------------------------------------------------------------------------------------------- the book
/** into: the props group (v6b: each book is a direct child named prop.book.<kind>, so the clearance checker sees it) */
export const buildPopBooks = (K: Kit, into?: THREE.Group) => {
  const group = into ?? new THREE.Group(); if (!into) group.name = "popbooks";
  const made = new Map<BookKind, PopBook>();
  const flatMat = (t: THREE.Texture) => { const m = K.flat("#ffffff", { map: t, rough: 0.95, side: THREE.DoubleSide }) as THREE.MeshStandardMaterial; m.alphaTest = 0.5; m.transparent = false; return m; };
  const quad = (w: number, h: number, u0: number, u1: number, v0 = 0, v1 = 1, ox = 0, oy = 0) => {
    const g = new THREE.PlaneGeometry(w, h).translate(ox, oy, 0), uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) { uv.setX(i, u0 + uv.getX(i) * (u1 - u0)); uv.setY(i, v0 + uv.getY(i) * (v1 - v0)); }
    return g;
  };
  const noink = (m: THREE.Object3D) => { m.traverse((o) => { o.layers.set(NOINK); (o as THREE.Mesh).castShadow = false; o.receiveShadow = false; o.frustumCulled = false; }); return m; };

  const make = (kind: BookKind): PopBook => {
    const root = new THREE.Group(); root.name = `prop.book.${kind}`; root.visible = false; group.add(root);
    const A = new THREE.Group(), B = new THREE.Group(); root.add(A, B);
    const { pw, ph, board, block } = PB;
    // the two halves: board, page block, the page's paper face
    const half = (into: THREE.Group, sd: -1 | 1) => {
      const P = new Part(K), x0 = sd < 0 ? -pw : 0, x1 = sd < 0 ? 0 : pw;
      P.add(K.flat(CLOTH[kind], { rough: 0.9 }), new THREE.BoxGeometry(pw, ph, board).translate((x0 + x1) / 2, 0, -block - board / 2), 0.004);
      P.add(K.flat("#efe2c0", { rough: 0.95 }), new THREE.BoxGeometry(pw - 0.006, ph - 0.008, block).translate((x0 + x1) / 2 + sd * -0.002, 0, -block / 2), 0.003);
      P.into(into, `popbook.${kind}.${sd < 0 ? "L" : "R"}`);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(pw - 0.008, ph - 0.012).translate((x0 + x1) / 2 + sd * -0.002, 0, 0.0004), K.flat(PAPER, { rough: 0.95 }));
      into.add(noink(face));
    };
    half(A, -1); half(B, 1);
    // the cover on B's outside (faces -z in B's frame: +z once shut); the back cover on A's outside
    const cover = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph).rotateY(Math.PI).translate(pw / 2, 0, -block - board - 0.0006), K.flat("#ffffff", { map: coverTex(kind, CLOTH[kind]), rough: 0.9 }));
    B.add(noink(cover));

    // ---- the pop-up's flats: rise from the page as the book opens; a flat across the gutter is two halves, one on each page
    type Flat = { parts: { m: THREE.Mesh; side: -1 | 1 }[]; d: number; i: number };
    const flats: Flat[] = [];
    let order = 0;
    /** a flat spanning x0..x1, y0..y1 (spread coords) at depth d once open */
    const flat = (t: THREE.Texture, x0: number, x1: number, y0: number, y1: number, d: number): Flat => {
      const mat = flatMat(t), parts: Flat["parts"] = [], w = x1 - x0, h = y1 - y0, yc = (y0 + y1) / 2;
      const piece = (a: number, b: number, side: -1 | 1) => {
        const u0 = (a - x0) / w, u1 = (b - x0) / w, m = new THREE.Mesh(quad(b - a, h, u0, u1), mat);
        m.position.set((a + b) / 2, yc, 0); (side < 0 ? A : B).add(noink(m)); parts.push({ m, side });
      };
      if (x1 <= 0) piece(x0, x1, -1); else if (x0 >= 0) piece(x0, x1, 1); else { piece(x0, 0, -1); piece(0, x1, 1); }
      const F = { parts, d, i: order++ }; flats.push(F); return F;
    };
    /** a small loose piece (a figure, a bird, a letter): its own mesh, pivot at its centre (or pivotY of its height
     *  below it), on the page of its side; it rises with the page like a flat, and a gag may move it after that */
    const bits: { m: THREE.Mesh; d: number; i: number }[] = [];
    const bit = (t: THREE.Texture, w: number, h: number, x: number, y: number, d: number, pivotY = 0) => {
      const m = new THREE.Mesh(quad(w, h, 0, 1, 0, 1, 0, -pivotY * h), flatMat(t)); m.position.set(x, y, d); (x <= 0 ? A : B).add(noink(m));
      bits.push({ m, d, i: order++ }); return m;
    };
    let gag: (s: Required<BookState>, rise: number) => void = () => {};

    // ======================================================================================== the five pop-ups
    if (kind === "niulang") {
      flat(ART.nightSky(), -0.235, 0.235, -0.125, 0.155, 0.012);
      flat(ART.cloudBanks(), -0.24, 0.24, -0.165, -0.08, 0.034);
      const nl = bit(ART.niulang(), 0.12, 0.19, -0.155, -0.13, 0.05, -0.5), zn = bit(ART.zhinv(), 0.12, 0.19, 0.155, -0.13, 0.05, -0.5);
      const th = flat(ART.thread(), -0.13, 0.13, -0.075, -0.055, 0.056);
      const birds = Array.from({ length: 7 }, (_, i) => {
        const u = i / 6, x = -0.1 + 0.2 * u, y = -0.045 + 0.085 * Math.sin(Math.PI * u), m = bit(ART.magpie(), 0.05, 0.035, x, y, 0.072);
        if (x > 0) m.scale.x = -1;
        return { m, x, y, i, base: Math.atan2(0.085 * Math.PI * Math.cos(Math.PI * u), 0.2) };
      });
      gag = (s, rise) => {
        for (const b of birds) {
          const inK = smooth((s.g - 0.02 - 0.025 * Math.abs(b.i - 3)) / 0.08) * rise;   // the bridge forms from both ends to the middle
          const go = clamp01((s.g - (0.3 + 0.035 * [3, 2, 4, 1, 5, 0, 6].indexOf(b.i))) / 0.12);   // and leaves from the middle out (g 0.3 .. 0.63)
          const sd = b.x > 0 || (b.i === 3 && b.i % 2) ? 1 : -1, flap = go > 0 ? 0.45 + 0.55 * Math.abs(Math.sin(s.t * 22 + b.i)) : 1;
          b.m.visible = inK > 0.01 && go < 1 && rise > 0.05;
          b.m.position.set(b.x + sd * 0.16 * go, b.y + 0.55 * go * go + 0.05 * go, 0.072 * rise + 0.25 * go);
          b.m.scale.set((b.x > 0 ? -1 : 1) * Math.max(0.01, inK) * flap, Math.max(0.01, inK), 1);
          b.m.rotation.z = b.base * (b.x > 0 ? -1 : 1) * (1 - go) + sd * 0.5 * go;
        }
        // once the bridge has gone they lean toward each other over the river (g 0.7 .. 0.9)
        const lean = smooth((s.g - 0.7) / 0.2);
        nl.rotation.z = -0.1 * lean; zn.rotation.z = 0.1 * lean;
        for (const p of th.parts) p.m.visible = rise > 0.6;
      };
      void nl; void zn;
    } else if (kind === "liangzhu") {
      flat(ART.dusk(), -0.235, 0.235, -0.125, 0.155, 0.012);
      flat(ART.mound(), -0.24, 0.24, -0.165, -0.06, 0.034);
      const lg = bit(ART.liang(), 0.11, 0.17, -0.09, -0.14, 0.052, -0.5), zh = bit(ART.zhu(), 0.11, 0.17, 0.09, -0.14, 0.052, -0.5);
      const bf = [bit(ART.butterfly("#5a8ab8", "#8ab0d8"), 0.09, 0.067, -0.09, -0.05, 0.06), bit(ART.butterfly("#e888a8", "#f4b8c8"), 0.09, 0.067, 0.09, -0.05, 0.06)];
      gag = (s, rise) => {
        // on 变蝴蝶了 the two of them fold down flat into the page, and two butterflies unfold where they stood and flutter up and off
        const fold = smooth((s.g - 0.3) / 0.12);
        for (const m of [lg, zh]) { m.scale.y = Math.max(0.01, 1 - fold); m.visible = fold < 0.98 && rise > 0.01; }
        bf.forEach((m, i) => {
          const k = clamp01((s.g - 0.36 - 0.05 * i) / 0.5), sd = i ? 1 : -1;
          m.visible = k > 0 && k < 1 && rise > 0.5;
          const flap = 0.35 + 0.65 * Math.abs(Math.sin(s.t * 18 + i * 1.7));
          // (v6: up and away fast enough to leave the top of her frame before he snaps the book shut; round each other as they go;
          //  v6b: they drift out past the book's fore-edge as they climb, so they go up beside his cheek, never across his mouth)
          m.position.set(sd * 0.09 * (1 - k) + 0.5 * Math.sqrt(k) + 0.05 * Math.sin(k * 10 + i * Math.PI), -0.05 + 1.5 * k * k + 0.25 * k, 0.06 + 0.35 * k);
          m.scale.set(flap * smooth(k * 6), smooth(k * 6), 1); m.rotation.z = 0.3 * Math.sin(k * 7 + i);
        });
      };
    } else if (kind === "baishe") {
      flat(ART.lake(), -0.235, 0.235, -0.125, 0.155, 0.012);
      bit(ART.pagoda(), 0.07, 0.15, -0.19, -0.04, 0.026);
      const xx = bit(ART.xuxian(), 0.14, 0.187, -0.07, -0.155, 0.05, -0.5), sn = bit(ART.snake(), 0.12, 0.12, 0.1, -0.155, 0.05, -0.5);
      // THE CONCERTINA of approval slips: folded flat on the left-hand page (as she sees it, the right), it climbs out of
      // the book's top, up and up, swaying, and leans away to that side as it goes, so the face of whoever holds the book
      // stays clear of it (v6: it had climbed straight up in front of his face)
      const N = 16, slips = Array.from({ length: N }, (_, i) => bit(ART.slip(i), 0.16, 0.06, 0.17, 0, 0.07));
      gag = (s, rise) => {
        const ext = smooth((s.g - 0.2) / 0.5) * (1 - smooth((s.g - 0.88) / 0.1)), sway = 0.06 * ext * Math.sin(s.t * 2.2);
        slips.forEach((m, i) => {
          const k = i / (N - 1), y = 0.02 + (0.003 + 0.09 * ext) * i, ang = (i % 2 ? 1 : -1) * (1.2 - 1.05 * ext);
          m.visible = rise > 0.3 && ext > 0.02;
          m.position.set(0.17 + 0.32 * Math.sqrt(k * ext) + sway * k * k * 3, Math.min(0.12, -0.03 + 0.01 * i) + (y - 0.02) * (ext > 0 ? 1 : 0), 0.07 * rise + 0.02 * Math.sin(ang));
          m.rotation.set(ang * 0.5, 0, -0.22 * ext * (1 - 0.5 * k) + sway * k * 2);
        });
        void xx; void sn;
      };
    } else if (kind === "baodai") {
      flat(ART.garden(), -0.235, 0.235, -0.125, 0.155, 0.012);
      const dy = bit(ART.daiyu(), 0.1, 0.16, -0.155, -0.145, 0.048, -0.5), bc = bit(ART.baochai(), 0.1, 0.16, 0.155, -0.145, 0.048, -0.5);
      flat(ART.baoyu(), -0.055, 0.055, -0.145, 0.03, 0.056);
      // his red thread, pivoting at 宝玉's hand (just left of the gutter): to 黛玉, then over to 宝钗
      const thr = new THREE.Mesh(quad(0.14, 0.012, 0, 1, 0, 1, -0.07, 0), flatMat(paint(256, 24, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 2, W, H - 4); g.fillStyle = "#d8362a"; g.fillRect(2, 5, W - 4, H - 10); })));
      thr.position.set(-0.012, -0.075, 0.06); A.add(noink(thr));
      const tear = bit(ART.tear(), 0.012, 0.017, -0.163, -0.025, 0.05);
      const letters = Array.from({ length: 12 }, (_, i) => bit(ART.letter(i), 0.06, 0.04, (i % 2 ? 1 : -1) * 0.01, 0.0, 0.07));
      gag = (s, rise) => {
        const shake = s.g > 0.15 && s.g < 0.42 ? 0.06 * Math.sin(s.t * 40) : 0, over = smooth((s.g - 0.3) / 0.12);
        thr.rotation.z = shake + Math.PI * over * 0.96; thr.visible = rise > 0.5;
        thr.position.z = 0.06 * rise;
        tear.visible = s.g > 0.45 && rise > 0.5; tear.position.y = -0.025 - 0.03 * clamp01((s.g - 0.45) / 0.15);
        letters.forEach((m, i) => {
          const k = clamp01((s.g - 0.6 - 0.018 * i) / 0.35), a = (i / 12) * Math.PI * 2;
          m.visible = k > 0 && k < 1 && rise > 0.5;
          m.position.set(Math.cos(a) * 0.35 * k, 0.05 + Math.sin(a) * 0.25 * k + 0.25 * k - 0.6 * k * k, 0.07 + 0.55 * k);
          m.rotation.set(0.25 * k, 0.2 * Math.sin(i), 0.5 * Math.sin(a + 5 * k));
          m.scale.setScalar(0.5 + 0.8 * smooth(k * 4));
        });
        void dy; void bc;
      };
    } else if (kind === "qixian") {
      // THE JADE SEAL on a paper spring: it shoots up out of the crack at the book's top edge, leaning out over the
      // fore-edge side (v6: straight up, it stood in front of his face), and drops back as it is slammed
      const seal = new THREE.Group(), P = new Part(K);
      P.add(K.flat("#e8efe0", { rough: 0.5 }), new THREE.BoxGeometry(0.09, 0.06, 0.09).translate(0, 0.03, 0), 0.004);
      P.add(K.flat("#d0dcc8", { rough: 0.5 }), new THREE.SphereGeometry(0.03, 12, 8).scale(1, 0.8, 1).translate(0, 0.075, 0), 0.004);
      P.add(K.flat("#c8332b", { rough: 0.6 }), new THREE.BoxGeometry(0.03, 0.025, 0.03).translate(0, 0.1, 0), 0.003);   // the tassel knot
      P.into(seal, "popbook.qixian.seal");
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.088, 0.088).rotateX(Math.PI / 2).translate(0, -0.0005, 0), flatMat(ART.sealFace())); seal.add(noink(face));
      const spring = new THREE.Mesh(quad(0.05, 1, 0, 1, 0, 1, 0, 0.5), flatMat(paint(64, 256, (g, W, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#f2e2b0" : "#d8c890"; g.fillRect(4, (i * H) / 16, W - 8, H / 16); } g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(4, 2, W - 8, H - 4); })));
      root.add(noink(seal)); root.add(noink(spring));
      gag = (s) => {
        const up = smooth((s.g - 0.15) / 0.12) * (1 - smooth((s.g - 0.6) / 0.06)), bob = up * 0.02 * Math.sin(s.t * 14) * Math.exp(-Math.max(0, s.g - 0.27) * 8);
        const h = 0.01 + 0.16 * up + bob;
        seal.visible = spring.visible = up > 0.02;
        // (v6b: from the fore-edge corner and leaning further out, so the spring and the seal stay clear of his cheek)
        const lean = 1.0, bx = -PB.pw + 0.01, by = PB.ph / 2;
        seal.position.set(bx - h * Math.sin(lean), by + h * Math.cos(lean), 0.012); seal.rotation.set(0, 0.3 * Math.sin(s.t * 3) * up, lean * 0.55 + 0.08 * Math.sin(s.t * 9) * up);
        spring.position.set(bx, by, 0.012); spring.rotation.set(0, 0, lean); spring.scale.set(1, Math.max(0.01, h), 1);
      };
    }

    const api: PopBook = {
      group: root,
      put(at, o = {}) { root.position.copy(at); root.rotation.set(o.pitch ?? 0, o.yaw ?? 0, o.roll ?? 0, "YXZ"); root.scale.setScalar(o.scale ?? 1); root.visible = true; return api; },
      set(st) {
        const s = { open: clamp01(st.open), g: st.g ?? 0, t: st.t ?? 0 };
        B.rotation.y = -Math.PI * (1 - s.open);
        const rise = smooth((s.open - 0.3) / 0.65);
        for (const F of flats) for (const p of F.parts) { p.m.position.z = 0.0015 * (F.i + 1) + F.d * rise; p.m.visible = rise > 0.01; }
        for (const b of bits) { b.m.position.z = 0.0015 * (b.i + 1) + b.d * rise; b.m.visible = rise > 0.01; }
        gag(s, rise);
        // the loose pieces on the page also rise with it (gag sets their full depth; scale by rise when they sit on the page)
        return api;
      },
    };
    api.set({ open: 0 });
    return api;
  };
  return {
    group,
    book(kind: BookKind) { let b = made.get(kind); if (!b) { b = make(kind); made.set(kind, b); } return b; },
    begin() { for (const b of made.values()) b.group.visible = false; },
  };
};

// THE OFFICE'S PAINTINGS FOR v6 (owner's note 13 on v5: "more fitting of the theme, too modern, more 神仙ly feeling in
// his office"; note 10: "more texture and detail"). The KPI board's modern sheet becomes a decree from heaven's Board
// of Personnel hung as a scroll; a lacquer plaque 千里姻缘一线牵 crowns the moon window between two couplets; the beams
// get painted 旋子 bands; the plaster carries a faint cloud stencil; clouds drift in at the floor and the windowsill.
// All text is drawn in the film's two faces (BRUSH, SONG: the skin's own, falling back to FONT until they are in).
import { paint, rng, css, mix, blotch, FONT } from "./common";

const BRUSH = `"YL Brush", ${FONT}`, SONG = `"YL Song", ${FONT}`;
type G = CanvasRenderingContext2D;

/** one character per column, top to bottom, centred on x */
const column = (g: G, s: string, x: number, y0: number, px: number, step = px * 1.08) => {
  g.textAlign = "center"; g.textBaseline = "middle";
  [...s].forEach((ch, i) => { if (ch !== " ") g.fillText(ch, x, y0 + step * (i + 0.5)); });
};
/** a square seal: red ground, the characters cut white, in columns from the right (n per column) */
const seal = (g: G, x: number, y: number, side: number, text: string, perCol: number, rot = 0, a = 0.92) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
  const r = rng(text.length * 97 + Math.round(side));
  g.fillStyle = "#c8332b"; g.beginPath();
  const j = (v: number) => v + (r() - 0.5) * side * 0.02;
  g.moveTo(j(-side / 2), j(-side / 2)); g.lineTo(j(side / 2), j(-side / 2)); g.lineTo(j(side / 2), j(side / 2)); g.lineTo(j(-side / 2), j(side / 2)); g.closePath(); g.fill();
  const cols = Math.ceil(text.length / perCol), cw = (side * 0.84) / cols, ch = (side * 0.84) / perCol;
  g.fillStyle = "#f6e6c8"; g.font = `700 ${Math.round(Math.min(cw, ch) * 0.86)}px ${SONG}`; g.textAlign = "center"; g.textBaseline = "middle";
  [...text].forEach((c, i) => { const col = Math.floor(i / perCol), row = i % perCol; g.fillText(c, side * 0.42 - cw * (col + 0.5), -side * 0.42 + ch * (row + 0.5)); });
  // the worn edge of a real seal: a few bites out of the red
  g.globalCompositeOperation = "destination-out";
  for (let k = 0; k < 14; k++) { g.beginPath(); g.arc((r() - 0.5) * side, (r() < 0.5 ? -1 : 1) * side / 2 * (0.9 + 0.1 * r()), side * 0.012 * (1 + 2 * r()), 0, 7); g.fill(); }
  g.restore();
};
/** a small 如意 cloud drawn as a line (a stencil on a wall, a pattern on brocade) */
const cloudMark = (g: G, x: number, y: number, s: number, col: string, a: number, w = 3) => {
  g.save(); g.translate(x, y); g.strokeStyle = css(col, a); g.lineWidth = w; g.lineCap = "round";
  const curl = (cx: number, cy: number, rr: number, dir: number) => { g.beginPath(); g.arc(cx, cy, rr, Math.PI * (dir > 0 ? 0.9 : 0.1), Math.PI * (dir > 0 ? 2.6 : -1.6), dir < 0); g.stroke(); g.beginPath(); g.arc(cx, cy, rr * 0.45, 0, 7); g.stroke(); };
  curl(-s * 0.32, 0, s * 0.22, 1); curl(s * 0.32, 0, s * 0.22, -1); curl(0, -s * 0.16, s * 0.26, 1);
  g.beginPath(); g.moveTo(-s * 0.56, s * 0.2); g.quadraticCurveTo(0, s * 0.34, s * 0.62, s * 0.18); g.stroke();
  g.restore();
};

/** THE DECREE (考绩令) of heaven's Board of Personnel, hung as a scroll on the +x wall where the KPI board was:
 *  yellow silk in a teal brocade mount, the title across the top, the order in columns, the Board's seal, and his own
 *  worry in red brush (done = false), or the Board's 考绩合格 seal stamped across it (done = true) */
export const DECREE_PX = { w: 1024, h: 1680 } as const;
export const decreeTex = (done: boolean) => paint(DECREE_PX.w, DECREE_PX.h, (g, W, H) => {
  const r = rng(done ? 1302 : 1301);
  // the brocade mount: deep teal with a faint gold cloud pattern
  g.fillStyle = "#24484a"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) blotch(g, W * r(), H * r(), W * 0.2, r() < 0.5 ? "#1c3c3e" : "#2e5658", 0.25);
  for (let y = 40; y < H; y += 120) for (let x = (y / 120) % 2 ? 60 : 120; x < W; x += 120) cloudMark(g, x, y, 60, "#d9a640", 0.22, 3);
  // the silk
  const sx0 = 92, sx1 = W - 92, sy0 = 250, sy1 = H - 170;
  g.fillStyle = "#c79a40"; g.fillRect(sx0 - 14, sy0 - 14, sx1 - sx0 + 28, sy1 - sy0 + 28);   // the gold border strip
  g.fillStyle = "#8a6420"; g.fillRect(sx0 - 3, sy0 - 3, sx1 - sx0 + 6, sy1 - sy0 + 6);
  const silk = g.createLinearGradient(0, sy0, 0, sy1); silk.addColorStop(0, "#efd896"); silk.addColorStop(1, "#e6c87c");
  g.fillStyle = silk; g.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
  for (let i = 0; i < 26; i++) blotch(g, sx0 + (sx1 - sx0) * r(), sy0 + (sy1 - sy0) * r(), 90, r() < 0.6 ? "#dcb868" : "#f6e4b0", 0.2);
  for (let y = sy0 + 90; y < sy1; y += 190) for (let x = sx0 + ((y / 190) % 2 ? 80 : 180); x < sx1 - 40; x += 200) cloudMark(g, x, y, 90, "#c9a24e", 0.3, 4);
  // the title across the top: the Board's name small, 考绩令 large, a red rule under it
  g.fillStyle = "#2a211c"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `700 54px ${SONG}`; g.fillText("天 庭 吏 部", W / 2, sy0 + 70);
  g.font = `900 168px ${BRUSH}`; g.fillText("考绩令", W / 2, sy0 + 210);
  g.fillStyle = css("#b8281f", 0.85); g.fillRect(W * 0.2, sy0 + 312, W * 0.6, 7);
  // the order, in columns from the right
  g.fillStyle = "#2a211c"; g.font = `700 70px ${SONG}`;
  const top = sy0 + 360, cols = ["姻缘司主管月下老人", "年终考绩限今晚子时", "全年指标未满者", "扣仙丹 写检讨"];
  cols.forEach((s, i) => column(g, s, sx1 - 80 - i * 112, top, 70, 80));
  // the Board's seal, lower left of the order
  seal(g, sx0 + 150, sy1 - 150, 190, "天庭吏部之印", 3, -0.04);
  if (!done) {
    // his own worry, in red brush in the space at the left: 就差一对！ with a circle round 未满
    g.save(); g.translate(sx0 + 190, top + 260); g.rotate(-0.05);
    g.fillStyle = "#b8281f"; g.font = `900 132px ${BRUSH}`; column(g, "就差", 0, 0, 132, 136); column(g, "一对", -150, 120, 132, 136);
    g.restore();
    g.strokeStyle = css("#b8281f", 0.9); g.lineWidth = 9; g.lineCap = "round";
    const cx = sx1 - 80 - 2 * 112, cy = top + 80 * 5.5;
    g.beginPath(); g.ellipse(cx, cy, 62, 104, 0.04, 0.3, Math.PI * 2 + 0.1); g.stroke();
  } else {
    seal(g, W * 0.4, sy1 - 520, 360, "考绩合格", 2, -0.12, 0.9);
  }
  // the lower mount and a fold shadow where the silk meets it
  g.fillStyle = css("#0e2224", 0.35); g.fillRect(sx0 - 14, sy1 + 14, sx1 - sx0 + 28, 8);
});

/** THE PLAQUE over the moon window: 千里姻缘一线牵 in gold on dark lacquer, in a carved red frame with gold edges and a
 *  cloud at each corner. It reads from the LEFT: an old plaque would read from the right, but on a phone, at a glance,
 *  牵线一缘姻里千 is what most viewers would read. */
export const PLAQUE_PX = { w: 2048, h: 400 } as const;
export const plaqueTex = () => paint(PLAQUE_PX.w, PLAQUE_PX.h, (g, W, H) => {
  const r = rng(1311);
  g.fillStyle = "#9c2a22"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(g, W * r(), H * r(), 60, r() < 0.5 ? "#7e1e18" : "#b43a2e", 0.25);
  // the frame's carved band: a running cloud line in gold
  for (let x = 70; x < W; x += 140) { cloudMark(g, x, 34, 48, "#e2b65a", 0.8, 4); cloudMark(g, x + 70, H - 34, 48, "#e2b65a", 0.8, 4); }
  g.strokeStyle = "#e2b65a"; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20);
  // the field
  const fx = 74, fy = 70, fw = W - 148, fh = H - 140;
  g.fillStyle = "#c79a40"; g.fillRect(fx - 10, fy - 10, fw + 20, fh + 20);
  g.fillStyle = "#2e2a2c"; g.fillRect(fx, fy, fw, fh);
  for (let i = 0; i < 24; i++) blotch(g, fx + fw * r(), fy + fh * r(), 70, r() < 0.5 ? "#3a3436" : "#262224", 0.3);
  const sheen = g.createLinearGradient(0, fy, 0, fy + fh); sheen.addColorStop(0, "rgba(255,240,220,0.08)"); sheen.addColorStop(0.5, "rgba(255,240,220,0)"); sheen.addColorStop(1, "rgba(0,0,0,0.12)");
  g.fillStyle = sheen; g.fillRect(fx, fy, fw, fh);
  // the seven characters, from the right; each with a dark cut edge under its gold
  const s = "千里姻缘一线牵", n = s.length, step = fw / (n + 0.6), px = Math.round(Math.min(step * 0.86, fh * 0.84));
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px ${BRUSH}`;
  [...s].forEach((ch, i) => {
    const x = fx + step * (i + 0.8), y = fy + fh / 2 + px * 0.03;
    g.fillStyle = "#6a4a18"; g.fillText(ch, x + 5, y + 6);
    g.fillStyle = "#e9c060"; g.fillText(ch, x, y);
  });
  // corner clouds over the frame
  for (const [x, y, sg] of [[44, 44, 1], [W - 44, 44, -1], [44, H - 44, 1], [W - 44, H - 44, -1]] as const) { g.save(); g.translate(x, y); g.scale(sg, 1); cloudMark(g, 0, 0, 70, "#f0d080", 0.95, 6); g.restore(); }
});

/** A COUPLET strip: red paper flecked with gold, a thin gold rule, the line in gold brush with a dark edge */
export const COUPLET_PX = { w: 256, h: 2048 } as const;
export const coupletTex = (line: string, seed: number) => paint(COUPLET_PX.w, COUPLET_PX.h, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#b8281f"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(g, W * r(), H * r(), 70, r() < 0.5 ? "#9c1e18" : "#c8382c", 0.25);
  for (let i = 0; i < 260; i++) { g.fillStyle = css("#e8c060", 0.35 + 0.4 * r()); g.fillRect(W * r(), H * r(), 2 + 4 * r(), 2 + 4 * r()); }   // 洒金
  g.strokeStyle = css("#e2b65a", 0.9); g.lineWidth = 6; g.strokeRect(16, 16, W - 32, H - 32);
  const n = [...line].length, step = (H - 120) / n, px = Math.round(Math.min(W * 0.72, step * 0.86));
  g.font = `900 ${px}px ${BRUSH}`;
  g.fillStyle = "#5a1a10"; column(g, line, W / 2 + 4, 64, px, step); g.translate(-4, -5);
  g.fillStyle = "#f0c860"; column(g, line, W / 2 + 4, 64, px, step);
});

/** THE BEAMS' PAINT: simplified 旋子彩画 in one 1.2 m unit (u along the beam, v across its face): teal ground, gold
 *  edges, a 箍头 of blue and green bands at each end, a 旋子 rosette in the middle */
export const beamTex = () => paint(512, 128, (g, W, H) => {
  const r = rng(1321);
  g.fillStyle = "#245a62"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) blotch(g, W * r(), H * r(), 40, r() < 0.5 ? "#1c4a52" : "#2c6a70", 0.2);
  // edges
  g.fillStyle = "#d9a640"; g.fillRect(0, 0, W, 8); g.fillRect(0, H - 8, W, 8);
  g.fillStyle = "#7a2418"; g.fillRect(0, 8, W, 5); g.fillRect(0, H - 13, W, 5);
  // the 箍头 at each end of the unit
  for (const x0 of [0, W - 46]) {
    g.fillStyle = "#d9a640"; g.fillRect(x0, 13, 4, H - 26); g.fillRect(x0 + 42, 13, 4, H - 26);
    g.fillStyle = "#2c4a8a"; g.fillRect(x0 + 4, 13, 19, H - 26);
    g.fillStyle = "#3c7a4e"; g.fillRect(x0 + 23, 13, 19, H - 26);
  }
  // the rosette: petals in two rings, white-edged, a red and gold heart
  const cx = W / 2, cy = H / 2;
  const ring = (n: number, R: number, pr: number, fill: string, edge: string) => {
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; g.fillStyle = fill; g.strokeStyle = edge; g.lineWidth = 2.5; g.beginPath(); g.ellipse(cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.92, pr, pr * 0.62, a, 0, 7); g.fill(); g.stroke(); }
  };
  ring(12, 40, 15, "#2c4a8a", "#f2ead8"); ring(8, 22, 11, "#3c7a4e", "#f2ead8");
  g.fillStyle = "#c8332b"; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.fill(); g.fillStyle = "#e9c060"; g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill();
  // the 找头 between: a gold-edged lozenge each side
  for (const s of [-1, 1]) { const x = cx + s * 132; g.strokeStyle = "#d9a640"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 40, cy); g.lineTo(x, cy - 34); g.lineTo(x + 40, cy); g.lineTo(x, cy + 34); g.closePath(); g.stroke(); g.fillStyle = css("#2c4a8a", 0.8); g.fill(); }
}, true);

/** the plaster: warm cream, blotched, a faint cloud stencil twice per 1.6 m tile */
export const wallTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(1331);
  g.fillStyle = "#d8c29c"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) blotch(g, W * r(), H * r(), W * (0.05 + 0.12 * r()), r() < 0.5 ? "#c4aa80" : "#e8d6b2", 0.2);
  cloudMark(g, W * 0.27, H * 0.3, 120, "#b08a52", 0.28, 5); cloudMark(g, W * 0.77, H * 0.8, 120, "#b08a52", 0.28, 5);
}, true);

/** the heap's mound under its cords: dark red, painted with loops so the gaps never show a plain blob */
export const moundTex = () => paint(512, 256, (g, W, H) => {
  const r = rng(1341);
  g.fillStyle = "#5c1418"; g.fillRect(0, 0, W, H);
  g.lineCap = "round";
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = r() < 0.55 ? "#3e0c10" : "#8a2226"; g.lineWidth = 6 + 6 * r();
    const x = W * r(), y = H * r(), rr = 16 + 40 * r();
    g.beginPath(); g.ellipse(x, y, rr, rr * (0.4 + 0.5 * r()), r() * 3, 0, Math.PI * (1.2 + 0.8 * r())); g.stroke();
  }
}, true);

/** A CLOUD (祥云) card: puffs with 如意 curls, cream with a warm tan outline, flat along its bottom (it sits on the floor
 *  or on a sill) fading out there. Drawn on alpha. */
export const CLOUD_PX = { w: 512, h: 256 } as const;
export const cloudTex = (seed: number) => paint(CLOUD_PX.w, CLOUD_PX.h, (g, W, H) => {
  const r = rng(seed), base = H * 0.86;
  const puffs: [number, number, number][] = [];
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, rr = H * (0.16 + 0.16 * Math.sin(Math.PI * u) + 0.06 * r()); puffs.push([W * (0.12 + 0.76 * u + 0.04 * (r() - 0.5)), base - rr * (0.55 + 0.3 * r()), rr]); }
  // outline: every puff and the base slab drawn a little larger in the outline colour, then the cream over it
  const slab = (grow: number) => { g.beginPath(); g.moveTo(W * 0.08 - grow, base + grow); g.lineTo(W * 0.92 + grow, base + grow); g.lineTo(W * 0.92 + grow, base - H * 0.12 - grow); g.lineTo(W * 0.08 - grow, base - H * 0.12 - grow); g.closePath(); g.fill(); };
  g.fillStyle = "#c79a5a"; for (const [x, y, rr] of puffs) { g.beginPath(); g.arc(x, y, rr + 6, 0, 7); g.fill(); } slab(6);
  g.fillStyle = "#f8efdc"; for (const [x, y, rr] of puffs) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } slab(0);
  // a warmer underside
  const sh = g.createLinearGradient(0, base - H * 0.3, 0, base); sh.addColorStop(0, "rgba(236,200,140,0)"); sh.addColorStop(1, "rgba(236,200,140,0.55)");
  g.globalCompositeOperation = "source-atop"; g.fillStyle = sh; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over";
  // the 如意 curls inside the two biggest puffs
  const big = [...puffs].sort((a, b) => b[2] - a[2]).slice(0, 2);
  g.strokeStyle = css("#c79a5a", 0.9); g.lineWidth = 5; g.lineCap = "round";
  for (const [x, y, rr] of big) { g.beginPath(); g.arc(x, y + rr * 0.1, rr * 0.55, Math.PI * 0.8, Math.PI * 2.3); g.stroke(); g.beginPath(); g.arc(x + rr * 0.1, y + rr * 0.05, rr * 0.25, Math.PI * 1.2, Math.PI * 2.6); g.stroke(); }
  // fade out at the bottom (it rests in the floor)
  g.globalCompositeOperation = "destination-out";
  const fade = g.createLinearGradient(0, base - H * 0.1, 0, base + 8); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)");
  g.fillStyle = fade; g.fillRect(0, base - H * 0.1, W, H);
  g.globalCompositeOperation = "source-over";
  void mix;
});

/** the desk's front apron: dark wood with a carved running cloud picked out in gold (a 2048 x 160 strip for 1.46 x 0.11 m) */
export const apronTex = () => paint(2048, 160, (g, W, H) => {
  const r = rng(1351);
  g.fillStyle = "#4e3020"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(g, W * r(), H * r(), 60, r() < 0.5 ? "#3c2418" : "#5e3c28", 0.25);
  g.fillStyle = css("#2a180e", 0.6); g.fillRect(0, H - 14, W, 14); g.fillStyle = css("#7a5236", 0.6); g.fillRect(0, 0, W, 8);
  g.strokeStyle = "#c9a04a"; g.lineWidth = 4; g.strokeRect(20, 18, W - 40, H - 40);
  for (let x = 110; x < W - 60; x += 180) cloudMark(g, x, H / 2 - 4, 70, "#d9b05a", 0.95, 5);
});

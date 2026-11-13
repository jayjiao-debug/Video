// SHARED PARTS of the Newton film's six places (sets/stairs.ts ... sets/elaboratory.ts; WP2): Cambridge 1686.
// The palette, the painted surfaces (oak panelling, limewash, brick, ashlar, leaded glass, raked gravel, cobbles,
// paper), walls with holes, windows (glass + a hidden shadow caster that throws the leading and the bars as a light
// pattern), a hinged panelled door, sun shafts with dust, a candle. The kit's rules hold (okit.ts header, parts/common.ts):
//   - fine detail is PAINT (mip-mapped canvas textures), never geometry; inked geometry is chunky and closed;
//   - small loose things are props-kit Parts (NOINK + their own hull outline);
//   - glass, glows, shafts and dust are NOINK; every animate is a pure function of t; seeded painting only.
// Nothing darker than #2b2530 except the ink; nothing brighter than #f4f1ea on a lit surface.
import * as THREE from "three";
import { paint, rng, css, mix, blotch, NOINK, clamp, type G2 } from "../../../../kit/sets/okit";
import { Part } from "../../../../kit/props/kit";
import { shade, wrapBlotch, boxG } from "./common";

export { NOINK, Part };

// =====================================================================================================================
// the palette (sRGB)
// =====================================================================================================================
export const NC = {
  // oak: the staircase and door (dark), the panelling (mid), the furniture (warm)
  oakDark: "#5c3c26", oakDarkLo: "#46301f", oak: "#7e5435", oakLo: "#64422a", oakHi: "#9a6c46", oakWarm: "#8c5e38",
  plaster: "#e6d9bf", plasterLo: "#cdbd9f", plasterShadow: "#b9a88c",
  brick: "#b25a3e", brickLo: "#97482f", brickHi: "#c56e4c", brickDark: "#7d3d2a", mortar: "#d6c6a8", mortarLo: "#bcab8e",
  stone: "#dccfb2", stoneLo: "#c2b495", stoneHi: "#e9dec6", stoneDark: "#a99a7c",
  tile: "#8e4a36", tileLo: "#723a2c",
  gravel: "#d8cba9", gravelLo: "#c3b590", gravelHi: "#e6dbbe",
  grass: "#86a352", grassLo: "#6f8e44", box: "#4f7d3c", boxLo: "#3f6631", boxHi: "#66944c",
  iron: "#3c3a42", ironHi: "#55525c", lead: "#4c4a54",
  glass: "#dfe9ee", glassHi: "#f1f5f2", glassLo: "#c4d6d6",
  paper: "#efe6cf", paperLo: "#d8c9a6", paperEdge: "#cbb995", ink: "#3a3440",
  linen: "#eee7d8", linenLo: "#d6ccb8",
  soot: "#4a3a34", ember: "#ff8a2a", fire: "#ffb04a", fireHi: "#ffe08a",
  night: "#3c4a78", nightLo: "#2e3a62",
  candle: "#efe4c8", flame: "#ffcf6a",
};

// =====================================================================================================================
// painted surfaces
// =====================================================================================================================
/** WAINSCOT PANELLING, one tile of `cols` x `rows` panels, tw x th metres: stiles and rails in `base`, the fields a
 *  touch darker with a painted bevel (light top / left, shadow bottom / right), the grain running up the stiles and
 *  across the rails. `px` per metre. The tile repeats. */
export const panelTex = (o: { seed: number; cols: number; rows: number; tw: number; th: number; base: string; lo: string; hi: string; px?: number; frame?: number }) => {
  const ppm = o.px ?? 360, W = Math.round(o.tw * ppm), H = Math.round(o.th * ppm);
  return paint(W, H, (g) => {
    const r = rng(o.seed), fr = (o.frame ?? 0.075) * ppm, cw = W / o.cols, rh = H / o.rows;
    g.fillStyle = o.base; g.fillRect(0, 0, W, H);
    // grain over the frame
    g.strokeStyle = css(o.lo, 0.28); g.lineWidth = Math.max(1, ppm / 220);
    for (let i = 0; i < 70; i++) { const y = r() * H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + (r() - 0.5) * 8, W * 0.6, y + (r() - 0.5) * 8, W, y + (r() - 0.5) * 6); g.stroke(); }
    for (let i = 0; i < o.cols; i++) for (let j = 0; j < o.rows; j++) {
      const x0 = i * cw + fr / 2, y0 = j * rh + fr / 2, w = cw - fr, h = rh - fr, b = Math.min(w, h) * 0.09;
      // the field
      g.fillStyle = shade(o.base, -0.1 + (r() - 0.5) * 0.06); g.fillRect(x0, y0, w, h);
      g.strokeStyle = css(o.lo, 0.3); g.lineWidth = Math.max(1, ppm / 260);
      for (let k = 0; k < 9; k++) { const x = x0 + w * r(); g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + (r() - 0.5) * w * 0.15, y0 + h * 0.4, x + (r() - 0.5) * w * 0.15, y0 + h * 0.7, x + (r() - 0.5) * w * 0.05, y0 + h); g.stroke(); }
      // the raised field's bevel: light on top and left, shadow on bottom and right
      g.fillStyle = css(o.hi, 0.75); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w, y0); g.lineTo(x0 + w - b, y0 + b); g.lineTo(x0 + b, y0 + b); g.closePath(); g.fill();
      g.fillStyle = css(o.hi, 0.45); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + b, y0 + b); g.lineTo(x0 + b, y0 + h - b); g.lineTo(x0, y0 + h); g.closePath(); g.fill();
      g.fillStyle = css(o.lo, 0.85); g.beginPath(); g.moveTo(x0, y0 + h); g.lineTo(x0 + w, y0 + h); g.lineTo(x0 + w - b, y0 + h - b); g.lineTo(x0 + b, y0 + h - b); g.closePath(); g.fill();
      g.fillStyle = css(o.lo, 0.6); g.beginPath(); g.moveTo(x0 + w, y0); g.lineTo(x0 + w, y0 + h); g.lineTo(x0 + w - b, y0 + h - b); g.lineTo(x0 + w - b, y0 + b); g.closePath(); g.fill();
      // the moulding line round the field
      g.strokeStyle = css(o.lo, 0.9); g.lineWidth = Math.max(1.5, ppm / 160); g.strokeRect(x0 - 1, y0 - 1, w + 2, h + 2);
    }
  }, true);
};
/** LIMEWASH PLASTER: a warm off-white with soft blotches and a faint darker band near the floor (`dado` metres of
 *  the tile's height, 0 = none) */
export const plasterTex = (seed: number, base: string = NC.plaster, lo: string = NC.plasterLo, s = 512) => paint(s, s, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) wrapBlotch(g, W, H, r() * W, r() * H, W * (0.05 + 0.12 * r()), r() < 0.55 ? lo : "#fbf3e2", 0.12);
  for (let i = 0; i < 12; i++) wrapBlotch(g, W, H, r() * W, r() * H, W * (0.02 + 0.04 * r()), lo, 0.1);
}, true);
/** BRICK in English bond (a course of headers, a course of stretchers), one tile `nx` stretchers wide (0.23 m + joint
 *  each) and `ny` courses high (0.075 m + joint): each brick its own tone, a few burnt headers, soft mottle; soot from
 *  above when `soot` > 0 (the top of the tile darkened: for a wall whose tile runs once up its height) */
export const BRICK = { w: 0.24, h: 0.085 };
export const brickTex = (o: { seed: number; base?: string; lo?: string; hi?: string; mortar?: string; nx?: number; ny?: number; px?: number; soot?: number; burnt?: number }) => {
  const nx = o.nx ?? 4, ny = o.ny ?? 8, ppm = o.px ?? 300, W = Math.round(nx * BRICK.w * ppm), H = Math.round(ny * BRICK.h * ppm);
  return paint(W, H, (g) => {
    const r = rng(o.seed), base = o.base ?? NC.brick, lo = o.lo ?? NC.brickLo, hi = o.hi ?? NC.brickHi, bw = BRICK.w * ppm, bh = BRICK.h * ppm, j = Math.max(2, 0.011 * ppm);
    g.fillStyle = o.mortar ?? NC.mortar; g.fillRect(0, 0, W, H);
    for (let row = 0; row < ny; row++) {
      const header = row % 2 === 0, w = header ? bw / 2 : bw, off = header ? bw / 4 : 0, y = H - (row + 1) * bh;
      for (let x = -w + off; x < W + w; x += w) {
        const burnt = header && r() < (o.burnt ?? 0.18);
        g.fillStyle = burnt ? css(mix(lo, "#4a3030", 0.35)) : css(mix(base, r() < 0.5 ? lo : hi, 0.15 + 0.5 * r()));
        const bx = x + j / 2, by = y + j / 2, bww = w - j, bhh = bh - j;
        g.fillRect(bx, by, bww, bhh);
        for (const dx of [-W, W]) if (bx + dx < W && bx + dx + bww > 0) g.fillRect(bx + dx, by, bww, bhh);
        blotch(g, bx + bww * r(), by + bhh * r(), bww * 0.4, r() < 0.5 ? hi : lo, 0.15);
        g.fillStyle = "rgba(255,240,220,0.10)"; g.fillRect(bx, by, bww, j * 0.6);           // a pale top arris
      }
    }
    if (o.soot) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, css(NC.soot, 0.75 * o.soot)); gr.addColorStop(0.55, css(NC.soot, 0.25 * o.soot)); gr.addColorStop(1, css(NC.soot, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  }, true);
};
/** ASHLAR (the chapel's clunch, the Schools' stone): courses of squared blocks, each its own tone, fine joints */
export const ashlarTex = (o: { seed: number; base?: string; lo?: string; hi?: string; nx?: number; ny?: number; bw?: number; bh?: number; px?: number; weather?: number }) => {
  const nx = o.nx ?? 3, ny = o.ny ?? 4, bw = o.bw ?? 0.6, bh = o.bh ?? 0.32, ppm = o.px ?? 200, W = Math.round(nx * bw * ppm), H = Math.round(ny * bh * ppm);
  return paint(W, H, (g) => {
    const r = rng(o.seed), base = o.base ?? NC.stone, lo = o.lo ?? NC.stoneLo, hi = o.hi ?? NC.stoneHi, j = Math.max(1.5, 0.008 * ppm);
    g.fillStyle = css(mix(lo, "#8a7c62", 0.4)); g.fillRect(0, 0, W, H);
    for (let row = 0; row < ny; row++) {
      const y = row * bh * ppm, off = row % 2 ? bw * ppm * 0.5 : 0;
      for (let x = -bw * ppm + off; x < W; x += bw * ppm) {
        g.fillStyle = css(mix(base, r() < 0.5 ? lo : hi, 0.1 + 0.4 * r()));
        const bx = x + j / 2, by = y + j / 2, w = bw * ppm - j, h = bh * ppm - j;
        g.fillRect(bx, by, w, h); if (bx + W < W) g.fillRect(bx + W, by, w, h);
        for (let k = 0; k < 2; k++) blotch(g, bx + w * r(), by + h * r(), w * 0.3, r() < 0.5 ? hi : lo, 0.12 * (o.weather ?? 1));
      }
    }
  }, true);
};
/** OAK BOARDS (a floor): n boards across the tile (u), the grain along v, butt joints staggered, soft wear */
export const oakBoardsTex = (o: { seed: number; n: number; base: string; lo: string; joint?: string; px?: number; len?: number }) =>
  paint(o.px ?? 512, o.px ?? 512, (g, W, H) => {
    const r = rng(o.seed), bw = W / o.n;
    for (let i = 0; i < o.n; i++) {
      g.fillStyle = css(mix(o.base, o.lo, 0.1 + 0.45 * r())); g.fillRect(i * bw, 0, bw + 1, H);
      g.strokeStyle = css(o.lo, 0.35); g.lineWidth = Math.max(1.2, W / 340);
      for (let k = 0; k < 5; k++) { const x = i * bw + bw * (0.1 + 0.8 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.1 * (r() - 0.5), H * 0.33, x + bw * 0.1 * (r() - 0.5), H * 0.66, x, H); g.stroke(); }
      blotch(g, i * bw + bw / 2, H * r(), bw * 0.8, "#fff1dc", 0.06);
      g.fillStyle = o.joint ?? css(o.lo, 0.9); g.fillRect(i * bw - 1.5, 0, 3, H);
      const y = H * ((i * 0.37 + 0.2 * r()) % 1); g.fillRect(i * bw, y - 1.5, bw, 3);
    }
  }, true);
/** LEADED GLASS: diamond quarries (or square panes) over a pane w x h metres, `q` metres across a quarry; the glass
 *  pale and a little uneven (old crown glass: you see light, not the view), lead `lead`. The canvas covers exactly
 *  one light (uv 0..1). `sky` tints the top. */
export const leadedTex = (o: { w: number; h: number; q?: number; glass?: string; hi?: string; lo?: string; lead?: string; square?: boolean; seed?: number; px?: number; frame?: number }) => {
  const ppm = o.px ?? 300, W = Math.max(32, Math.round(o.w * ppm)), H = Math.max(32, Math.round(o.h * ppm));
  return paint(W, H, (g) => {
    const r = rng(o.seed ?? 3), q = (o.q ?? 0.12) * ppm, lead = o.lead ?? NC.lead;
    const gr = g.createLinearGradient(0, 0, W * 0.3, H); gr.addColorStop(0, o.hi ?? NC.glassHi); gr.addColorStop(0.6, o.glass ?? NC.glass); gr.addColorStop(1, o.lo ?? NC.glassLo);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // each quarry its own tone
    const cells = Math.ceil(W / q) + 2, rowsN = Math.ceil(H / (q * 1.4)) + 2;
    for (let i = -1; i < cells; i++) for (let j = -1; j < rowsN; j++) {
      const cx = i * q + (j % 2 ? q / 2 : 0), cy = j * q * 0.7;
      g.fillStyle = css(r() < 0.5 ? "#ffffff" : (o.lo ?? NC.glassLo), 0.12 + 0.12 * r());
      g.beginPath();
      if (o.square) g.rect(cx - q / 2, cy - q * 0.7, q, q * 1.4);
      else { g.moveTo(cx, cy - q * 0.7); g.lineTo(cx + q / 2, cy); g.lineTo(cx, cy + q * 0.7); g.lineTo(cx - q / 2, cy); }
      g.closePath(); g.fill();
    }
    g.strokeStyle = lead; g.lineWidth = Math.max(2, 0.011 * ppm); g.lineCap = "round";
    if (o.square) {
      for (let x = q; x < W; x += q) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = q * 1.4; y < H; y += q * 1.4) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    } else {
      const k = 0.7 / 0.5;                                              // the diamond's slope (height / half width)
      for (let s = -H; s < W + H; s += q) {
        g.beginPath(); g.moveTo(s, 0); g.lineTo(s + H / k, H); g.stroke();
        g.beginPath(); g.moveTo(s, 0); g.lineTo(s - H / k, H); g.stroke();
      }
    }
    g.lineWidth = (o.frame ?? 0.025) * ppm; g.strokeStyle = lead; g.strokeRect(0, 0, W, H);
  });
};
/** the same leading as an ALPHA mask for the hidden shadow caster (opaque where lead or a bar is): alpha 1 = blocks */
export const leadMaskTex = (o: { w: number; h: number; q?: number; square?: boolean; bars?: number; barW?: number; frame?: number; px?: number; mullion?: number[]; rails?: number[] }) => {
  const ppm = o.px ?? 200, W = Math.max(32, Math.round(o.w * ppm)), H = Math.max(32, Math.round(o.h * ppm));
  const t = paint(W, H, (g) => {
    g.clearRect(0, 0, W, H);
    const q = (o.q ?? 0.12) * ppm;
    g.strokeStyle = "#000000"; g.fillStyle = "#000000"; g.lineWidth = Math.max(2, 0.014 * ppm);
    if (o.square) {
      for (let x = q; x < W; x += q) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = q * 1.4; y < H; y += q * 1.4) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    } else {
      const k = 0.7 / 0.5;
      for (let s = -H; s < W + H; s += q) { g.beginPath(); g.moveTo(s, 0); g.lineTo(s + H / k, H); g.stroke(); g.beginPath(); g.moveTo(s, 0); g.lineTo(s - H / k, H); g.stroke(); }
    }
    const bw = (o.barW ?? 0.03) * ppm;
    for (let i = 1; i <= (o.bars ?? 0); i++) { const x = (W * i) / ((o.bars ?? 0) + 1); g.fillRect(x - bw / 2, 0, bw, H); }
    for (const u of o.mullion ?? []) g.fillRect(u * W - 0.04 * ppm, 0, 0.08 * ppm, H);
    for (const v of o.rails ?? []) g.fillRect(0, (1 - v) * H - 0.04 * ppm, W, 0.08 * ppm);
    const fr = (o.frame ?? 0.03) * ppm; g.lineWidth = fr * 2; g.strokeRect(0, 0, W, H);
  });
  return t;
};
/** RAKED GRAVEL for a path running along v (u across): pale grit, and parallel rake lines (each a pale ridge beside a
 *  soft shadow groove) running along the path; `curl` bends them a little */
export const gravelTex = (o: { seed: number; lines?: number; px?: number; base?: string; along?: boolean }) => paint(o.px ?? 512, o.px ?? 512, (g, W, H) => {
  const r = rng(o.seed);
  g.fillStyle = o.base ?? NC.gravel; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { g.fillStyle = css(r() < 0.5 ? NC.gravelLo : NC.gravelHi, 0.55 + 0.4 * r()); g.beginPath(); g.arc(W * r(), H * r(), 0.8 + 1.6 * r(), 0, 7); g.fill(); }
  const n = o.lines ?? 9;
  for (let i = 0; i < n; i++) {
    const x = (W * (i + 0.5)) / n;
    g.strokeStyle = css("#9d8f6c", 0.35); g.lineWidth = W / n * 0.18;
    g.beginPath(); g.moveTo(x + W / n * 0.12, 0); g.lineTo(x + W / n * 0.12, H); g.stroke();
    g.strokeStyle = css("#f4ecd6", 0.45); g.lineWidth = W / n * 0.12;
    g.beginPath(); g.moveTo(x - W / n * 0.06, 0); g.lineTo(x - W / n * 0.06, H); g.stroke();
  }
}, true);
/** COBBLES: rounded stones in loose rows, mortar-dark joints, a pale top on each */
/** ROOF TILES (red-brown plain tiles in staggered rows, a shadow line under each row); one tile of 6 x 8 tiles, repeat */
export const roofTilesTex = (seed = 92, base: string = NC.tile, lo: string = NC.tileLo) => paint(256, 256, (g, W, H) => {
  const r = rng(seed), rows = 8, cols = 6;
  g.fillStyle = lo; g.fillRect(0, 0, W, H);
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols + 1; i++) {
    const x = (i + (j % 2) * 0.5) * (W / cols), y = j * (H / rows);
    g.fillStyle = css(mix(base, r() < 0.5 ? lo : "#a65a40", 0.2 + 0.5 * r())); g.fillRect(x + 1, y + 1, W / cols - 2, H / rows - 1);
    g.fillStyle = "rgba(40,20,16,0.35)"; g.fillRect(x + 1, y + H / rows - 4, W / cols - 2, 3);
  }
}, true);
/** a PLANK DOOR (five vertical boards, iron studs, two ledges), the whole leaf 0..1 */
export const plankTex = (base: string, seed: number) => paint(256, 512, (g, W, H) => {
  const r = rng(seed), n = 5;
  for (let i = 0; i < n; i++) { g.fillStyle = css(mix(base, "#3a2a20", 0.1 + 0.3 * r())); g.fillRect((W * i) / n, 0, W / n, H); g.fillStyle = "rgba(30,20,14,0.7)"; g.fillRect((W * i) / n - 1.5, 0, 3, H); }
  g.fillStyle = "#3a3438"; for (const y of [0.15, 0.5, 0.85]) for (let i = 0; i < n; i++) { g.beginPath(); g.arc((W * (i + 0.5)) / n, H * y, 4, 0, 7); g.fill(); }
  g.fillStyle = "rgba(30,20,14,0.6)"; for (const y of [0.15, 0.85]) g.fillRect(0, H * y - 6, W, 12);
});
export const cobblesTex = (seed: number, px = 512) => paint(px, px, (g, W, H) => {
  const r = rng(seed), n = 9, s = W / n;
  g.fillStyle = "#7d7266"; g.fillRect(0, 0, W, H);
  for (let j = 0; j < n + 1; j++) for (let i = -1; i < n + 1; i++) {
    const x = i * s + (j % 2 ? s / 2 : 0) + (r() - 0.5) * s * 0.15, y = j * s + (r() - 0.5) * s * 0.15, rx = s * (0.38 + 0.08 * r()), ry = s * (0.34 + 0.08 * r());
    const col = css(mix("#a89a86", r() < 0.5 ? "#8e8172" : "#c0b29c", 0.3 + 0.5 * r()));
    for (const [dx, dy] of [[0, 0], [W, 0], [-W, 0], [0, H], [0, -H]]) {
      g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, rx, ry, r() * 0.6, 0, 7); g.fill();
      g.fillStyle = "rgba(255,248,232,0.22)"; g.beginPath(); g.ellipse(x + dx - rx * 0.15, y + dy - ry * 0.2, rx * 0.55, ry * 0.45, 0, 0, 7); g.fill();
    }
  }
}, true);
/** a stack's SIDE (paper edges): fine horizontal lines, warm, a little uneven */
export const pageEdgeTex = (seed: number, base: string = NC.paper) => paint(128, 128, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 4) { g.fillStyle = css(r() < 0.5 ? "#a8946c" : NC.paperLo, 0.45 + 0.45 * r()); g.fillRect(0, y, W, 1.6); }
  for (let i = 0; i < 6; i++) { g.fillStyle = css("#9a845c", 0.5); g.fillRect(0, H * r(), W, 2.5); }
}, true);
/** A PILE OF PAPER into a Part: `n` slabs (each its own thickness, a centimetre or two out of line and a little
 *  turned, its own cream), a written sheet on top, sometimes a loose sheet skewed across it. (x, y0, z) = the floor
 *  of the pile's middle; h = its height; w x d = a sheet. Returns the top's height. */
export const paperPile = (Q: Part, m: { edges: THREE.Material[]; tops: THREE.Material[] }, x: number, y0: number, z: number, h: number, seed: number, o: { w?: number; d?: number; yaw?: number; loose?: boolean } = {}) => {
  const r = rng(seed), w = o.w ?? 0.23, d = o.d ?? 0.3, yaw0 = o.yaw ?? 0;
  const n = Math.max(1, Math.round(h / 0.025)), hs: number[] = [];
  for (let i = 0; i < n; i++) hs.push(0.6 + 0.8 * r());
  const sum = hs.reduce((a, b) => a + b, 0);
  let y = y0;
  for (let i = 0; i < n; i++) {
    const t = (hs[i] / sum) * h, dx = (r() - 0.5) * 0.03, dz = (r() - 0.5) * 0.03, yaw = yaw0 + (r() - 0.5) * 0.22;
    const g = boxG(-w / 2, w / 2, 0, t, -d / 2, d / 2).rotateY(yaw).translate(x + dx, y, z + dz);
    if (i === n - 1) {
      const top = new THREE.PlaneGeometry(w - 0.006, d - 0.006).rotateX(-Math.PI / 2).rotateY(yaw).translate(x + dx, y + t + 0.0015, z + dz);
      Q.shell([[m.edges[Math.floor(r() * m.edges.length)], g], [m.tops[Math.floor(r() * m.tops.length)], top]], 0.0035);
    } else Q.shell([[m.edges[Math.floor(r() * m.edges.length)], g]], 0.0035);
    y += t;
  }
  if (o.loose) {
    const yaw = yaw0 + 0.5 + r() * 0.6, dx = (r() - 0.5) * 0.08, dz = (r() - 0.5) * 0.08;
    const g = boxG(-w / 2, w / 2, 0, 0.004, -d / 2, d / 2).rotateY(yaw).translate(x + dx, y, z + dz);
    const top = new THREE.PlaneGeometry(w - 0.004, d - 0.004).rotateX(-Math.PI / 2).rotateY(yaw).translate(x + dx, y + 0.0055, z + dz);
    Q.shell([[m.edges[0], g], [m.tops[Math.floor(r() * m.tops.length)], top]], 0.003);
    y += 0.004;
  }
  return y;
};
/** a MANUSCRIPT page seen from above: lines of brown-black scribble, a geometry figure, a few blots */
export const pageTex = (seed: number, o: { figure?: boolean; lines?: number } = {}) => paint(256, 330, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = NC.paper; g.fillRect(0, 0, W, H);
  blotch(g, W * 0.3, H * 0.7, W * 0.5, NC.paperLo, 0.25);
  g.strokeStyle = css(NC.ink, 0.8); g.lineWidth = 1.6;
  const n = o.lines ?? 22, top = H * 0.08, bot = H * 0.94, fig = o.figure ? [W * 0.55, H * 0.32, W * 0.3] : null;
  for (let i = 0; i < n; i++) {
    const y = top + ((bot - top) * i) / n;
    let x = W * 0.08;
    const end = W * (0.86 + 0.06 * r());
    while (x < end) {
      const len = 6 + 18 * r();
      if (fig && y > fig[1] - fig[2] * 0.7 && y < fig[1] + fig[2] * 0.7 && x + len > fig[0] - fig[2] * 0.75) break;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k <= len; k += 2) g.lineTo(x + k, y + Math.sin((x + k) * 0.9 + i) * 1.6 - 1);
      g.stroke(); x += len + 4 + 3 * r();
    }
  }
  if (fig) {                                               // a circle with a triangle and a tangent: Principia-ish
    g.lineWidth = 2; g.beginPath(); g.arc(fig[0], fig[1], fig[2] * 0.5, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(fig[0] - fig[2] * 0.45, fig[1] + fig[2] * 0.2); g.lineTo(fig[0] + fig[2] * 0.3, fig[1] - fig[2] * 0.4); g.lineTo(fig[0] + fig[2] * 0.4, fig[1] + fig[2] * 0.3); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(fig[0] - fig[2] * 0.7, fig[1] - fig[2] * 0.55); g.lineTo(fig[0] + fig[2] * 0.7, fig[1] - fig[2] * 0.48); g.stroke();
  }
  for (let i = 0; i < 2; i++) blotch(g, W * r(), H * r(), 4 + 4 * r(), NC.ink, 0.5);
});
/** BOOK SPINES on a shelf (u along the shelf, v up): a row of leather spines in browns, reds and dull greens, gilt
 *  bands, leaning a little; `h` = the shelf's height in metres per tile, `w` metres per tile */
export const spinesTex = (seed: number, w = 1.0, h = 0.36) => paint(Math.round(w * 400), Math.round(h * 400), (g, W, H) => {
  const r = rng(seed), cols = ["#7a3a2a", "#5e3a26", "#8a5a34", "#4e4a32", "#6a2e2a", "#7a6040", "#3e4a3a", "#8c6a48"];
  g.fillStyle = "#3a2c26"; g.fillRect(0, 0, W, H);
  let x = 0;
  while (x < W) {
    const bw = W * (0.025 + 0.035 * r()), bh = H * (0.7 + 0.28 * r()), col = cols[Math.floor(r() * cols.length)];
    g.fillStyle = col; g.fillRect(x, H - bh, bw - 1, bh);
    g.fillStyle = "rgba(255,240,210,0.12)"; g.fillRect(x, H - bh, bw * 0.25, bh);
    g.fillStyle = "#c9a24e"; for (const v of [0.15, 0.22, 0.8]) g.fillRect(x + 1, H - bh + bh * v, bw - 3, Math.max(1.5, H * 0.012));
    x += bw;
  }
}, true);

// =====================================================================================================================
// geometry
// =====================================================================================================================
export type Hole = { u0: number; u1: number; y0: number; y1: number; arch?: number };
/** AN UPRIGHT WALL with rectangular (optionally four-centred-arched: `arch` = the rise of the head) HOLES, from floor
 *  point a to b (a = its LEFT end seen from the side it faces; normal = (b - a) x up), y0..y1. uv in metres / tile
 *  (u along from a, v = y). One-sided. */
export const holedWall = (a: [number, number], b: [number, number], y0: number, y1: number, holes: Hole[], tileU = 1, tileV = tileU) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const sh = new THREE.Shape([new THREE.Vector2(0, y0), new THREE.Vector2(len, y0), new THREE.Vector2(len, y1), new THREE.Vector2(0, y1)]);
  for (const h of holes) {
    const p = new THREE.Path();
    if (h.arch && h.arch > 0) {
      const n = 10, w = h.u1 - h.u0, top = h.y1, spring = h.y1 - h.arch;
      p.moveTo(h.u0, h.y0); p.lineTo(h.u1, h.y0); p.lineTo(h.u1, spring);
      for (let i = 1; i <= n; i++) { const t = i / n, x = h.u1 - w * t, y = spring + h.arch * Math.sin(Math.PI * t) ** 0.6; p.lineTo(x, Math.min(top, y)); }
      p.lineTo(h.u0, h.y0);
    } else { p.moveTo(h.u0, h.y0); p.lineTo(h.u1, h.y0); p.lineTo(h.u1, h.y1); p.lineTo(h.u0, h.y1); p.lineTo(h.u0, h.y0); }
    sh.holes.push(p);
  }
  const g = new THREE.ShapeGeometry(sh, 4);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tileU, p.getY(i) / tileV);
  const dx = (b[0] - a[0]) / len, dz = (b[1] - a[1]) / len;
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dx, 0, dz), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-dz, 0, dx)).setPosition(a[0], 0, a[1]);
  g.applyMatrix4(m); g.computeVertexNormals();
  return g;
};
/** A FLAT POLYGON on a wall line a..b (the same frame as holedWall: u metres along from a, y up; the face looks along
 *  (b - a) x up), standing `k` metres in front of that line; pts = [u, y] counter-clockwise seen from the front */
export const wallPoly = (a: [number, number], b: [number, number], pts: [number, number][], k = 0, tileU = 1, tileV = tileU, holes: [number, number][][] = []) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const sh = new THREE.Shape(pts.map(([u, y]) => new THREE.Vector2(u, y)));
  for (const h of holes) sh.holes.push(new THREE.Path(h.map(([u, y]) => new THREE.Vector2(u, y))));
  const g = new THREE.ShapeGeometry(sh, 4);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tileU, p.getY(i) / tileV);
  const dx = (b[0] - a[0]) / len, dz = (b[1] - a[1]) / len;
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dx, 0, dz), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-dz, 0, dx)).setPosition(a[0] - dz * k, 0, a[1] + dx * k);
  g.applyMatrix4(m); g.computeVertexNormals();
  return g;
};
/** THE REVEAL of a rectangular hole in a holedWall (a..b): its two jambs, the head soffit and the sill, `depth` m deep
 *  BEHIND the wall's face (away from the side it faces). uv metres / tile. Returns one geometry; `only` keeps some sides
 *  (0 left jamb, 1 right jamb, 2 head, 3 sill): a DOORWAY is built as three meshes (jambs, head) so the clearance
 *  checker sees each as its own box and a figure in the doorway stands free. */
export const revealG = (a: [number, number], b: [number, number], h: Hole, depth: number, tile = 1, only?: number[]) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-d[1], d[0]];
  const P = (u: number, y: number, k: number) => new THREE.Vector3(a[0] + d[0] * u - n[0] * k, y, a[1] + d[1] * u - n[1] * k);
  const quads: THREE.Vector3[][] = [
    [P(h.u0, h.y0, depth), P(h.u0, h.y0, 0), P(h.u0, h.y1, 0), P(h.u0, h.y1, depth)],     // left jamb (faces +d)
    [P(h.u1, h.y0, 0), P(h.u1, h.y0, depth), P(h.u1, h.y1, depth), P(h.u1, h.y1, 0)],     // right jamb (faces -d)
    [P(h.u0, h.y1, 0), P(h.u1, h.y1, 0), P(h.u1, h.y1, depth), P(h.u0, h.y1, depth)],     // head (faces down)
    [P(h.u0, h.y0, depth), P(h.u1, h.y0, depth), P(h.u1, h.y0, 0), P(h.u0, h.y0, 0)],     // sill (faces up)
  ];
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (const [qi, q] of quads.entries()) {
    if (only && !only.includes(qi)) continue;
    const base = pos.length / 3;
    const w = q[0].distanceTo(q[1]), hh = q[1].distanceTo(q[2]);
    for (const v of q) pos.push(v.x, v.y, v.z);
    uv.push(0, 0, w / tile, 0, w / tile, hh / tile, 0, hh / tile);
    idx.push(base, base + 2, base + 1, base, base + 3, base + 2);          // wound so each side faces INTO the hole
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
/** a point on a wall a..b: u metres along from a, at height y, k metres in FRONT of its face (negative = behind) */
export const onWall = (a: [number, number], b: [number, number], u: number, y: number, k = 0) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-d[1], d[0]];
  return new THREE.Vector3(a[0] + d[0] * u + n[0] * k, y, a[1] + d[1] * u + n[1] * k);
};
/** the yaw that turns a +z-facing thing to face along the wall a..b's normal */
export const wallYaw = (a: [number, number], b: [number, number]) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]; return Math.atan2(-d[1], d[0]); };

// =====================================================================================================================
// windows
// =====================================================================================================================
export type WindowMats = { glass: THREE.MeshBasicMaterial; frame: THREE.Material; bar?: THREE.Material };
/** A LEADED WINDOW in a hole of a holedWall: the glass (unlit painted leading, NOINK; its colour multiplier is the
 *  outside light: set glass.color per hour), the chunky frame / mullions / transom (inked, `frame` mat), iron bars
 *  (a Part: NOINK + hull) when `bars` > 0, and a HIDDEN SHADOW CASTER in the glass plane that throws the leading and
 *  the bars as a light pattern (alpha-tested, colorWrite off, NOINK). `inset` = how far behind the wall's face the
 *  glass sits. Returns the group (in world coordinates) and the glass material. */
export const leadedWindow = (K: import("../../../../kit/props/kit").Kit, o: {
  a: [number, number]; b: [number, number]; hole: Hole; inset: number; mats: WindowMats; lights?: number; transom?: number; bars?: number; barR?: number;
  q?: number; square?: boolean; name: string; mullionW?: number; glassMat?: THREE.MeshBasicMaterial;
}) => {
  const g = new THREE.Group(); g.name = o.name;
  const { a, b, hole: h } = o, len = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const yaw = Math.atan2(-d[1], d[0]), w = h.u1 - h.u0, hh = h.y1 - h.y0, mid = onWall(a, b, (h.u0 + h.u1) / 2, (h.y0 + h.y1) / 2, -o.inset);
  const lights = o.lights ?? 1, mw = o.mullionW ?? 0.07;
  // the glass: one quad per window with the leading painted across the whole light (the mullions sit in front)
  const glassTex = leadedTex({ w, h: hh, q: o.q, square: o.square, seed: 7 });
  const glassMat = o.glassMat ?? new THREE.MeshBasicMaterial({ map: glassTex, fog: false, color: "#ffffff" });
  if (!glassMat.map) glassMat.map = glassTex;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), glassMat);
  glass.position.copy(mid); glass.rotation.y = yaw; glass.layers.set(NOINK); glass.name = o.name + ".glass"; glass.castShadow = false; glass.receiveShadow = false;
  g.add(glass);
  // the hidden caster: the same plane, a hair outside, alpha = lead + bars + mullions
  const mull: number[] = []; for (let i = 1; i < lights; i++) mull.push(i / lights);
  const mask = leadMaskTex({ w, h: hh, q: o.q, square: o.square, bars: o.bars, barW: (o.barR ?? 0.014) * 2.2, mullion: mull, rails: o.transom ? [(o.transom - h.y0) / hh] : [] });
  const casterMat = new THREE.MeshBasicMaterial({ map: mask, alphaTest: 0.5, transparent: false, colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
  const caster = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), casterMat);
  caster.position.copy(mid).add(new THREE.Vector3(d[1], 0, -d[0]).multiplyScalar(0.012)); caster.rotation.y = yaw; caster.layers.set(NOINK);
  caster.castShadow = true; caster.receiveShadow = false; caster.name = o.name + ".caster"; caster.renderOrder = -10;
  g.add(caster);
  // the frame: chunky mullions and a transom, 7 cm, a little in front of the glass
  const fr: THREE.BufferGeometry[] = [];
  const box = (u0: number, u1: number, y0: number, y1: number, k0: number, k1: number) => {
    const c = onWall(a, b, (u0 + u1) / 2, (y0 + y1) / 2, -(k0 + k1) / 2);
    return new THREE.BoxGeometry(u1 - u0, y1 - y0, Math.abs(k1 - k0)).rotateY(yaw).translate(c.x, c.y, c.z);
  };
  for (let i = 1; i < lights; i++) { const u = h.u0 + (w * i) / lights; fr.push(box(u - mw / 2, u + mw / 2, h.y0, h.y1, o.inset - 0.05, o.inset + 0.04)); }
  if (o.transom) fr.push(box(h.u0, h.u1, o.transom - mw / 2, o.transom + mw / 2, o.inset - 0.05, o.inset + 0.04));
  for (const q of fr) { const m = new THREE.Mesh(q, o.mats.frame); m.castShadow = true; m.receiveShadow = true; m.name = o.name + ".frame"; g.add(m); }
  // the iron bars: inside the glass (a Part: NOINK + hull; they also throw their own shadow)
  if (o.bars && o.mats.bar) {
    const P = new Part(K), r = o.barR ?? 0.014;
    for (let i = 1; i <= o.bars; i++) {
      const u = h.u0 + (w * i) / (o.bars + 1), c = onWall(a, b, u, (h.y0 + h.y1) / 2, -o.inset + 0.05);
      P.add(o.mats.bar, new THREE.CylinderGeometry(r, r, hh + 0.04, 10).translate(c.x, c.y, c.z), 0.004);
    }
    P.into(g, o.name + ".bars", { cast: false });
  }
  return { group: g, glass: glassMat };
};

// =====================================================================================================================
// the door
// =====================================================================================================================
/** a PANELLED DOOR's face (w x h metres): the frame (stiles, rails) and `rows` x `cols` raised fields, painted */
export const doorTex = (o: { w: number; h: number; base: string; lo: string; hi: string; rows?: number; cols?: number; seed?: number }) => {
  const ppm = 300, W = Math.round(o.w * ppm), H = Math.round(o.h * ppm);
  return paint(W, H, (g) => {
    const r = rng(o.seed ?? 21);
    g.fillStyle = o.base; g.fillRect(0, 0, W, H);
    g.strokeStyle = css(o.lo, 0.3); g.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) { const x = r() * W; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6 * (r() - 0.5), H / 3, x + 6 * (r() - 0.5), 2 * H / 3, x, H); g.stroke(); }
    const rows = o.rows ?? 3, cols = o.cols ?? 2, st = 0.11 * ppm, rail = 0.11 * ppm, lock = 0.16 * ppm;
    const rowH = [0.3, 0.42, 0.28].slice(0, rows); const tot = rowH.reduce((s, v) => s + v, 0);
    let y = rail;
    const avail = H - rail * (rows + 1) - (lock - rail);
    for (let j = 0; j < rows; j++) {
      const ph = avail * rowH[j] / tot, cw = (W - st * (cols + 1)) / cols;
      for (let i = 0; i < cols; i++) {
        const x0 = st + i * (cw + st), b = Math.min(cw, ph) * 0.1;
        g.fillStyle = shade(o.base, -0.08); g.fillRect(x0, y, cw, ph);
        g.fillStyle = css(o.hi, 0.7); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + cw, y); g.lineTo(x0 + cw - b, y + b); g.lineTo(x0 + b, y + b); g.fill();
        g.fillStyle = css(o.hi, 0.4); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + b, y + b); g.lineTo(x0 + b, y + ph - b); g.lineTo(x0, y + ph); g.fill();
        g.fillStyle = css(o.lo, 0.85); g.beginPath(); g.moveTo(x0, y + ph); g.lineTo(x0 + cw, y + ph); g.lineTo(x0 + cw - b, y + ph - b); g.lineTo(x0 + b, y + ph - b); g.fill();
        g.fillStyle = css(o.lo, 0.6); g.beginPath(); g.moveTo(x0 + cw, y); g.lineTo(x0 + cw, y + ph); g.lineTo(x0 + cw - b, y + ph - b); g.lineTo(x0 + cw - b, y + b); g.fill();
        g.strokeStyle = css(o.lo, 0.95); g.lineWidth = 3; g.strokeRect(x0, y, cw, ph);
      }
      y += ph + (j === 0 ? lock : rail);
    }
  });
};
/** A HINGED DOOR LEAF: a box w x h x t whose hinge edge is at the group's origin; the leaf runs along +x from it (its
 *  faces look +z / -z), so group.rotation.y opens it. Iron strap hinges and a ring handle are a Part on the face. */
export const doorLeaf = (K: import("../../../../kit/props/kit").Kit, o: { w: number; h: number; t?: number; face: THREE.Material; back?: THREE.Material; edge: THREE.Material; iron: THREE.Material; name: string; handleSide?: number; gap?: number }) => {
  const t = o.t ?? 0.055, gp = o.gap ?? 0.012, grp = new THREE.Group(); grp.name = o.name;
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(o.w - 2 * gp, o.h - gp, t).translate(o.w / 2, (o.h - gp) / 2 + gp, 0), [o.edge, o.edge, o.edge, o.edge, o.face, o.back ?? o.face]);
  leaf.castShadow = true; leaf.receiveShadow = true; leaf.name = o.name + ".leaf"; grp.add(leaf);
  const P = new Part(K), z = t / 2 + 0.006;
  for (const y of [0.32, o.h - 0.36]) P.add(o.iron, boxG(0.02, 0.36, y - 0.025, y + 0.025, z - 0.006, z + 0.008), 0.003);        // strap hinges
  const hx = o.w - 0.12;
  P.add(o.iron, new THREE.TorusGeometry(0.045, 0.011, 8, 18).translate(hx, 1.0, z + 0.03), 0.003);                                  // ring handle
  P.add(o.iron, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14).rotateX(Math.PI / 2).translate(hx, 1.05, z + 0.005), 0.003);       // its boss
  P.add(o.iron, boxG(hx - 0.03, hx + 0.03, 1.12, 1.2, z - 0.006, z + 0.006), 0.003);                                                // the keyhole plate
  P.into(grp, o.name + ".iron", { cast: true });
  return grp;
};

// =====================================================================================================================
// light shafts, dust, candle
// =====================================================================================================================
/** a soft gradient texture for a shaft's sides: bright at v 0 (the window), fading to 0 at v 1; soft at the u edges */
const shaftTex = () => paint(64, 256, (g, W, H) => {
  for (let y = 0; y < H; y++) {
    const v = y / H, a = Math.pow(1 - v, 1.6);
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, `rgba(255,255,255,0)`); gr.addColorStop(0.2, `rgba(255,255,255,${a})`); gr.addColorStop(0.8, `rgba(255,255,255,${a})`); gr.addColorStop(1, `rgba(255,255,255,0)`);
    g.fillStyle = gr; g.fillRect(0, H - y - 1, W, 1);
  }
});
let _shaftT: THREE.Texture | null = null;
/** A SUN SHAFT: the window's rectangle (4 corners, in order round it) swept `len` metres along `dir` (the way the light
 *  travels): its 4 side faces, additive, NOINK, unlit, fading along the sweep. set opacity on the material per frame.
 *  With `floorY` each corner's sweep ends ON that floor instead (the beam lands on its patch: no cut line where a
 *  longer sweep would go through the floor). */
export const sunShaft = (corners: THREE.Vector3[], dir: THREE.Vector3, len: number, col: string, opacity: number, floorY?: number) => {
  _shaftT ??= shaftTex();
  const dn = dir.clone().normalize(), pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const end = (c: THREE.Vector3) => c.clone().addScaledVector(dn, floorY !== undefined && dn.y < -1e-3 ? (c.y - floorY) / -dn.y : len);
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4], base = pos.length / 3;
    for (const v of [a, b, end(b), end(a)]) pos.push(v.x, v.y, v.z);
    uv.push(0, 1, 1, 1, 1, 0, 0, 0);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const m = new THREE.MeshBasicMaterial({ map: _shaftT, color: col, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const mesh = new THREE.Mesh(g, m); mesh.layers.set(NOINK); mesh.castShadow = false; mesh.receiveShadow = false; mesh.renderOrder = 6; mesh.name = "shaft"; mesh.frustumCulled = false;
  return mesh;
};
let _moteT: THREE.Texture | null = null;
/** DUST MOTES turning in a shaft: n soft points inside the swept box (corners + dir x len), each on its own slow
 *  closed drift; update(t, k) moves them (pure in t) and fades them by k */
export const dustMotes = (n: number, corners: THREE.Vector3[], dir: THREE.Vector3, len: number, o: { size?: number; col?: string; seed?: number } = {}) => {
  _moteT ??= paint(32, 32, (g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, S, S); });
  const r = rng(o.seed ?? 31), d = dir.clone().normalize().multiplyScalar(len);
  const seeds = Array.from({ length: n }, () => [r(), r(), 0.05 + 0.85 * r(), r() * 6.28, 0.15 + 0.25 * r(), r() * 6.28]);
  const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: o.size ?? 0.012, map: _moteT, color: o.col ?? "#fff2d6", transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
  const pts = new THREE.Points(geo, mat); pts.layers.set(NOINK); pts.frustumCulled = false; pts.renderOrder = 7; pts.name = "dust";
  const [c0, c1, , c3] = corners, eu = c1.clone().sub(c0), ev = c3.clone().sub(c0), P = new THREE.Vector3();
  const update = (t: number, k: number) => {
    pts.visible = k > 0.001; mat.opacity = 0.85 * clamp(k);
    for (let i = 0; i < n; i++) {
      const [u, v, w, ph, sp, ph2] = seeds[i];
      const uu = clamp(0.15 + 0.7 * (u + 0.08 * Math.sin(t * sp + ph))), vv = clamp(0.15 + 0.7 * (v + 0.08 * Math.cos(t * sp * 0.8 + ph2))), ww = clamp(w + 0.05 * Math.sin(t * sp * 0.6 + ph2));
      P.copy(c0).addScaledVector(eu, uu).addScaledVector(ev, vv).addScaledVector(d, ww);
      P.y += 0.02 * Math.sin(t * 0.7 + ph);
      pos[3 * i] = P.x; pos[3 * i + 1] = P.y; pos[3 * i + 2] = P.z;
    }
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };
  update(0, 1);
  return { points: pts, update };
};
/** A SET CANDLE (a Part: wax column of length `len` on a pewter stick; the flame and its halo are separate so the
 *  candle can burn down): build(len) rebuilds the wax; flame = makeFlame-like tongues */
export const candleStick = (K: import("../../../../kit/props/kit").Kit, mats: { wax: THREE.Material; pewter: THREE.Material }) => {
  const g = new THREE.Group(); g.name = "candle";
  const P = new Part(K);
  P.add(mats.pewter, new THREE.CylinderGeometry(0.06, 0.07, 0.015, 20).translate(0, 0.0075, 0), 0.004);                      // the dish
  P.add(mats.pewter, new THREE.CylinderGeometry(0.018, 0.024, 0.06, 14).translate(0, 0.045, 0), 0.004);                      // the stem
  P.add(mats.pewter, new THREE.CylinderGeometry(0.024, 0.02, 0.012, 14).translate(0, 0.081, 0), 0.004);                      // the socket
  P.into(g, "candle.stick", { cast: true });
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0135, 1, 14).translate(0, 0.5, 0), mats.wax);
  wax.layers.set(NOINK); wax.castShadow = true; wax.position.y = 0.087; wax.name = "candle.wax"; g.add(wax);
  const waxInk = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0175, 1, 14).translate(0, 0.5, 0), K.ink);
  waxInk.layers.set(NOINK); waxInk.position.y = 0.087; waxInk.name = "candle.wax.ink"; g.add(waxInk);
  const flame = new THREE.Group(); flame.name = "candle.flame"; g.add(flame);
  const tongue = (rr: number, h: number, col: THREE.Color) => {
    const pts: THREE.Vector2[] = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(new THREE.Vector2(rr * Math.sin(Math.PI * Math.pow(u, 0.6)) * (1 - 0.3 * u), h * u)); }
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 12), new THREE.MeshBasicMaterial({ color: col, fog: false })); m.layers.set(NOINK); flame.add(m); return m;
  };
  const fa = tongue(0.011, 0.045, new THREE.Color(1.0, 0.62, 0.16)), fb = tongue(0.006, 0.026, new THREE.Color(1.0, 0.93, 0.62));
  fb.position.z = 0.002;
  /** len: the wax's length (m); t: seconds (the flicker) */
  const set = (len: number, t: number) => {
    const L = Math.max(0.012, len);
    wax.scale.set(1, L, 1); waxInk.scale.set(1, L + 0.004, 1); waxInk.position.y = 0.085;
    flame.position.y = 0.087 + L + 0.004;
    const k = 1 + 0.08 * Math.sin(t * 9.1) + 0.05 * Math.sin(t * 15.7 + 1.3);
    fa.scale.set(1 / Math.sqrt(k), k, 1); fb.scale.set(1, 1 + 0.06 * Math.sin(t * 11.3), 1); flame.rotation.z = 0.06 * Math.sin(t * 3.7);
  };
  set(0.18, 0);
  return { group: g, set };
};
/** the flicker of a fire (1 +- about 0.1): sums of sines of t only, never random */
export const fireFlicker = (t: number, ph = 0) => 1 + 0.06 * Math.sin(t * 6.1 + ph) + 0.04 * Math.sin(t * 10.3 + 1.7 + ph) + 0.03 * Math.sin(t * 17.9 + 0.6 + ph) + 0.02 * Math.sin(t * 2.3 + ph);

/** draws soft text-free wear (dark at the foot) over a painted wall: a vertical gradient helper for canvases */
export const footShade = (g: G2, W: number, H: number, col: string, a: number, frac = 0.25) => {
  const gr = g.createLinearGradient(0, H * (1 - frac), 0, H); gr.addColorStop(0, css(col, 0)); gr.addColorStop(1, css(col, a)); g.fillStyle = gr; g.fillRect(0, H * (1 - frac), W, H * frac);
};

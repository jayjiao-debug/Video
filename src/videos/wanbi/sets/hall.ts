// THE HALL 章台 (place "hall", island x 0): the King of Qin's detached hall, BLACK and GOLD (BIBLE 2, 3). Built from
// layout/hall.ts HALL_SET only (no number typed here that is a place: colours, painting and small proportions live
// here, sizes and positions in the layout). WP2's set; the exported names and buildHall's return shape are the
// contract of sets/index.ts: { group, ceremony(k), mapStand(on), view(camPos) } and HALL_LOOK (+ animate(t), which
// sways the ceremony banners: sets/index.ts does not call it yet, see the WP2 report).
//
// WHAT THERE IS
//   - the floor: dark stone flags (0.6 m) with a lighter grout grid, PAINTED (one mip-mapped texture, no geometry
//     seams); a 3 x 3 grid of level quads with shared corners whose middle strip is the mat runner's place: while the
//     ceremony is on the runner REPLACES that strip (one level: no sheet over the floor, no tie with the figures'
//     contact shadow, no z-fight);
//   - charcoal walls (painted: dark dado with a gold line, dark lacquer pilasters, a gold frieze band at 2.80-2.95),
//     one group per wall so view() can hide the walls the camera stands behind;
//   - the EAST DOOR: a black lacquer frame round the opening, the reveal, a stone sill, beyond it an unlit daylight
//     card (a pale courtyard) and an unlit sunlit ground; inside, a patch of warm daylight on the floor (an additive
//     sheet 1 mm over the floor, never inked, no depth written) and the place's point light at the door;
//   - the dais (black lacquer, gold edge band), its one step, the 榻 (black lacquer, gold edge, painted 壸门 arches),
//     the cushion ("hall.pad": the clearance checker's soft cushion), the curved 凭几 on the king's right;
//   - the GOLD SCREEN: muted gold, a black border with gold cloud scrolls, three leaves, on two lacquer feet;
//   - four vermilion PILLARS (Ø 0.44, painted lacquer streaks and the gold band at 2.6) on black stone plinths;
//   - mapStand(on): the black lacquer map stand (two posts on feet, the bar the scroll hangs from) and the official's
//     straw kneeling mat flush with the floor;
//   - ceremony(k): eight of the kit's banners (black field, gold edge, 秦; our own cloth picture, since the kit's two
//     bars under the character read as 二) in lacquer feet down both side walls, the woven mat runner (席) with a
//     black-and-gold border, a bronze-studded barrel drum on a lacquer cradle.
//   Rounded blocks (the cushion, the plinths, the banner feet) use roundBox below, not three's RoundedBoxGeometry
//   (that one builds a flat box far too thin: the cushion's top sat 3 cm low and the clearance seed read 12.3 cm).
//
// INK / FLICKER RULES this file keeps (src/kit/fx/README.md "Rules for set builders"):
//   - thin or fine things are PAINT: the grout grid, the trim, the pilasters, the screen's scrolls, the arches of the
//     榻, the runner's weave and border, the pillar band, the drum's studs (mip-mapped, anisotropic textures);
//   - the runner and the official's mat are level with the floor (the mat: 1 mm, FLOOR_SHEET_MAX); the door spill is
//     1 mm over the floor, additive, no depth, NOINK;
//   - round things have 24-32 sides; the banners (thin poles) are the kit's props with their own hull outline (NOINK);
//   - parts overlap by about a centimetre (hidden) or stand clearly apart; the door frame stands 4 cm proud (under
//     0.7 % of hallDoor's distance to it);
//   - walls the camera stands behind are HIDDEN by view() (never left to culling: a culled wall still inks).
// Determinism: seeded painting only; ceremony / mapStand / view / animate are pure functions of their argument.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { lightRig, paint, rng, NOINK, FONT, type G2 } from "../../../kit/sets/okit";
import { banner as kitBanner, type Hook } from "../../../kit/props/things";
import { HALL_SET as S } from "../layout/hall";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceLook } from "./index";

// ---------------------------------------------------------------------------------------------------- the look
/** the bt/pbr fill of the hall (dark, a warm box from the upper left) */
const HALL_FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.26, 0.22, 0.22]], [-12, [0.32, 0.27, 0.28]], [6, [0.42, 0.38, 0.42]], [40, [0.40, 0.36, 0.42]], [90, [0.34, 0.32, 0.40]]],
  boxes: [{ az: 125, el: 38, rot: 0, w: 40, h: 22, soft: 14, col: [1.0, 0.86, 0.66] }],
};
/** BLACK and GOLD, the hall dark but the figures NOT: a warm key from the upper left front, violet shade, gain a little
 *  under 1 so the teal robe and the white jade do not blow out against the dark walls */
export const HALL_LOOK: PlaceLook = {
  bg: "#16141b",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 2.0, color: "#1c1622" },
  cast: {
    key: [-0.45, 0.62, 0.64], tint: [1.0, 0.88, 0.7], tintK: 0.65, gain: 0.97, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
    shade: [1.06, 0.9, 1.5], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.14, lift: 0.04, contactLen: 0.3,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: HALL_FILL,
};

// ---------------------------------------------------------------------------------------------------- colours
const COL = {
  stone: "#47424d", grout: "#69636f", wall: "#3b3642", dado: "#2c2832", pilaster: "#2a2630", frieze: "#2b2731",
  lacquer: "#2b2730", lacquerHi: "#3a3540", gold: "#c9a24a", goldDim: "#9c7a34", trim: "#b8913a",
  screen: S.screen.col, screenDeep: "#a27d30", screenBorder: "#24212a",
  pillar: S.pillar.col, pillarLo: "#9e2a24", pillarHi: "#c63c32", plinth: "#2f2b33",
  cushion: "#7a6236", cushionLo: "#5e4a28", straw: "#a08a5a", strawLo: "#8a7548", strawHi: "#b49c68",
  banner: "#2a2630", bronze: "#8a6a3a", bronzeHi: "#b08a4a", hide: "#d8c8a0", wood: "#3a2e28",
  daylight: "#fff4dc", sunGround: "#f3e4c4", spill: "#ffd890",
};
const H = S.wallH;

// ---------------------------------------------------------------------------------------------------- painting
/** THE FLOOR: a 4 x 4 block of stone flags (one texture tile = 4 grid steps), each flag its own tone, the grout
 *  lighter; grout lines on the tile's edges (half on each side: tiled, they make one line) */
const floorTex = () => paint(1024, 1024, (g, W) => {
  const G = S.grid, n = 4, s = W / n, gr = (G.grout / G.size) * s, r = rng(7);
  g.fillStyle = COL.grout; g.fillRect(0, 0, W, W);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = i * s + gr / 2, y = j * s + gr / 2, w = s - gr, k = (r() - 0.5) * 0.10;
    g.fillStyle = shade(COL.stone, k); g.fillRect(x, y, w, w);
    g.save(); g.beginPath(); g.rect(x, y, w, w); g.clip();
    for (let b = 0; b < 5; b++) {                                    // a quiet mottle inside the flag
      const cx = x + r() * w, cy = y + r() * w, rad = w * (0.18 + 0.3 * r()), gd = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const c = r() < 0.5 ? "255,250,255" : "20,16,26";
      gd.addColorStop(0, `rgba(${c},0.045)`); gd.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gd; g.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad);
    }
    g.restore();
    g.fillStyle = "rgba(255,248,240,0.05)"; g.fillRect(x, y, w, gr * 0.6);   // a soft lit lip on each flag's north edge
  }
}, true);
/** a colour made lighter (k > 0) or darker (k < 0) */
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
/** THE WALL, one tile = S.wall.tile m wide, H high (repeats along the wall): charcoal plaster, the dark dado with a
 *  gold line, a dark lacquer pilaster centred on the tile's edge (u 0), the gold frieze band, dark above it */
const wallTex = () => paint(512, Math.round(512 * H / S.wall.tile), (g, W, Hp) => {
  const Wl = S.wall, py = (y: number) => (1 - y / H) * Hp, mx = W / Wl.tile, r = rng(13);
  g.fillStyle = COL.wall; g.fillRect(0, 0, W, Hp);
  for (let i = 0; i < 40; i++) {                                     // plaster mottle, wrapped along u
    const x = r() * W, y = r() * Hp, rad = 30 + 70 * r(), c = r() < 0.5 ? "255,246,250" : "14,10,20";
    for (const dx of [-W, 0, W]) { const gd = g.createRadialGradient(x + dx, y, 0, x + dx, y, rad); gd.addColorStop(0, `rgba(${c},0.035)`); gd.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gd; g.fillRect(x + dx - rad, y - rad, 2 * rad, 2 * rad); }
  }
  g.fillStyle = COL.dado; g.fillRect(0, py(Wl.dado), W, Hp - py(Wl.dado));
  g.fillStyle = COL.trim; g.fillRect(0, py(Wl.dado + 0.015), W, 0.03 * mx);
  g.fillStyle = COL.frieze; g.fillRect(0, 0, W, py(Wl.frieze[1]));
  g.fillStyle = COL.trim; g.fillRect(0, py(Wl.frieze[1]), W, (Wl.frieze[1] - Wl.frieze[0]) * mx);
  g.fillStyle = "rgba(40,30,20,0.55)";                                // a key-fret (回纹) on the frieze, tone on tone
  const fy0 = py(Wl.frieze[1]) + 0.025 * mx, fh = (Wl.frieze[1] - Wl.frieze[0] - 0.05) * mx, step = fh * 1.6;
  for (let x = 0; x < W; x += step) { g.fillRect(x, fy0, step * 0.55, fh * 0.22); g.fillRect(x + step * 0.42, fy0, step * 0.13, fh); g.fillRect(x + step * 0.12, fy0 + fh * 0.78, step * 0.43, fh * 0.22); g.fillRect(x + step * 0.12, fy0 + fh * 0.4, step * 0.13, fh * 0.6); }
  g.fillStyle = COL.trim; g.fillRect(0, py(3.08), W, 0.02 * mx);
  const pw = Wl.pilaster * mx;                                         // the pilaster (both halves: it wraps)
  for (const x0 of [-pw / 2, W - pw / 2]) {
    g.fillStyle = COL.pilaster; g.fillRect(x0, py(Wl.frieze[0]), pw, Hp - py(Wl.frieze[0]));
    g.fillStyle = "rgba(201,162,74,0.55)"; g.fillRect(x0 + 0.012 * mx, py(Wl.frieze[0]), 0.008 * mx, py(0) - py(Wl.frieze[0])); g.fillRect(x0 + pw - 0.02 * mx, py(Wl.frieze[0]), 0.008 * mx, py(0) - py(Wl.frieze[0]));
  }
}, true);
/** a lacquer band texture for the sides of the dais, the step, the 榻 (u along the side, v up): black lacquer, a gold
 *  band along the top (`band` of the height), a fine gold line under it; `arches` paints 壸门 openings (the 榻) */
const sideTex = (w: number, h: number, band: number, arches = 0) => paint(1024, Math.max(32, Math.round(1024 * h / w)), (g, W, Hp) => {
  g.fillStyle = COL.lacquer; g.fillRect(0, 0, W, Hp);
  g.fillStyle = "rgba(255,240,230,0.04)"; g.fillRect(0, Hp * 0.15, W, Hp * 0.25);
  g.fillStyle = COL.gold; g.fillRect(0, 0, W, Math.max(2, Hp * band));
  g.fillStyle = COL.goldDim; g.fillRect(0, Hp * band * 2.1, W, Math.max(1.5, Hp * band * 0.35));
  if (arches) {
    const aw = W / arches;
    for (let i = 0; i < arches; i++) {
      const x0 = i * aw + aw * 0.12, x1 = (i + 1) * aw - aw * 0.12, y0 = Hp * 0.42, y1 = Hp;
      g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + (y1 - y0) * 0.3); g.quadraticCurveTo(x0, y0, (x0 + x1) / 2 - aw * 0.06, y0); g.lineTo((x0 + x1) / 2, y0 - (y1 - y0) * 0.12); g.lineTo((x0 + x1) / 2 + aw * 0.06, y0); g.quadraticCurveTo(x1, y0, x1, y0 + (y1 - y0) * 0.3); g.lineTo(x1, y1); g.closePath();
      g.fillStyle = "#1a171e"; g.fill(); g.strokeStyle = COL.goldDim; g.lineWidth = Math.max(1.5, Hp * 0.05); g.stroke();
    }
  }
});
/** a plain lacquer top with a gold line `inset` (fraction) in from the edges */
const topTex = (inset: number) => paint(512, 512, (g, W) => {
  g.fillStyle = COL.lacquer; g.fillRect(0, 0, W, W);
  g.strokeStyle = COL.goldDim; g.lineWidth = 5; g.strokeRect(W * inset, W * inset, W * (1 - 2 * inset), W * (1 - 2 * inset));
});
/** THE GOLD SCREEN's face (S.screen.w x S.screen.h): a black lacquer frame, a black border with gold cloud scrolls,
 *  the muted gold field (a faint deeper-gold cloud pattern, quiet behind the king's head), three leaves */
const screenTex = () => paint(1024, Math.round(1024 * S.screen.h / S.screen.w), (g, W, Hp) => {
  const m = W / S.screen.w, fr = 0.05 * m, bd = 0.2 * m, r = rng(29);
  g.fillStyle = COL.screenBorder; g.fillRect(0, 0, W, Hp);
  g.fillStyle = COL.screen; g.fillRect(bd, bd, W - 2 * bd, Hp - 2 * bd);
  // the field: soft deeper-gold clouds (low contrast)
  g.save(); g.beginPath(); g.rect(bd, bd, W - 2 * bd, Hp - 2 * bd); g.clip();
  for (let i = 0; i < 26; i++) {
    const x = bd + r() * (W - 2 * bd), y = bd + r() * (Hp - 2 * bd), rad = 40 + 90 * r(), gd = g.createRadialGradient(x, y, 0, x, y, rad);
    gd.addColorStop(0, "rgba(140,104,40,0.16)"); gd.addColorStop(1, "rgba(140,104,40,0)"); g.fillStyle = gd; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }
  g.strokeStyle = "rgba(122,90,36,0.35)"; g.lineWidth = 4; g.lineCap = "round";
  for (let i = 0; i < 9; i++) cloud(g, bd + (0.1 + 0.8 * r()) * (W - 2 * bd), bd + (0.08 + 0.84 * r()) * (Hp - 2 * bd), 26 + 22 * r(), r() < 0.5 ? 1 : -1);
  g.restore();
  // the leaves: two seams with a thin lacquer line
  g.fillStyle = "rgba(60,44,20,0.55)"; for (const k of [1 / 3, 2 / 3]) g.fillRect(W * k - 2.5, bd, 5, Hp - 2 * bd);
  // the border: gold cloud scrolls, a gold line round the field and round the frame
  g.strokeStyle = COL.gold; g.lineWidth = 5;
  g.strokeRect(bd - 6, bd - 6, W - 2 * bd + 12, Hp - 2 * bd + 12); g.strokeRect(fr, fr, W - 2 * fr, Hp - 2 * fr);
  g.lineWidth = 4.5;
  const along = (x0: number, y0: number, x1: number, y1: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / (bd * 1.25)));
    for (let i = 0; i < n; i++) { const k = (i + 0.5) / n; cloud(g, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, (bd - fr) * 0.33, i % 2 ? 1 : -1); }
  };
  const c = (fr + bd) / 2;
  along(c, c, W - c, c); along(c, Hp - c, W - c, Hp - c); along(c, c + bd, c, Hp - c - bd); along(W - c, c + bd, W - c, Hp - c - bd);
});
/** a cloud scroll (云纹): a spiral with a tail, size s, turning dir */
const cloud = (g: G2, x: number, y: number, s: number, dir: number) => {
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const t = i / 40, a = dir * t * Math.PI * 3.2, rad = s * (0.12 + 0.88 * t); const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * 0.8; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.lineTo(x + dir * s * 1.9, y + s * 0.55);
  g.stroke();
};
/** a PILLAR's skin (u round, v up from the plinth's top to the pillar's top): vermilion lacquer with long streaks, the
 *  gold band at S.pillar.band with dark edge lines */
const pillarTex = () => paint(128, 1024, (g, W, Hp) => {
  const P = S.pillar, y0 = P.plinth.h, y1 = P.h, py = (y: number) => (1 - (y - y0) / (y1 - y0)) * Hp, r = rng(41);
  g.fillStyle = COL.pillar; g.fillRect(0, 0, W, Hp);
  for (let i = 0; i < 14; i++) { const x = r() * W, w = 3 + 9 * r(); g.fillStyle = r() < 0.5 ? "rgba(158,42,36,0.45)" : "rgba(214,72,58,0.22)"; g.fillRect(x, 0, w, Hp); g.fillRect(x - W, 0, w, Hp); }
  const b0 = py(P.band + 0.06), b1 = py(P.band - 0.06);
  g.fillStyle = COL.gold; g.fillRect(0, b0, W, b1 - b0);
  g.fillStyle = "#6e5222"; g.fillRect(0, b0, W, 3); g.fillRect(0, b1 - 3, W, 3);
  g.fillStyle = "rgba(255,236,180,0.35)"; g.fillRect(0, (b0 + b1) / 2 - 2, W, 4);
}, true);
/** the cushion's brocade: muted gold-brown with a small lozenge diaper */
const cushionTex = () => paint(256, 256, (g, W) => {
  g.fillStyle = COL.cushion; g.fillRect(0, 0, W, W);
  g.fillStyle = COL.cushionLo; const s = W / 8;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) { const x = i * s + s / 2, y = j * s + s / 2; g.beginPath(); g.moveTo(x, y - s * 0.32); g.lineTo(x + s * 0.32, y); g.lineTo(x, y + s * 0.32); g.lineTo(x - s * 0.32, y); g.closePath(); g.fill(); }
  g.strokeStyle = COL.gold; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, W - 20);
});
/** a woven straw mat 席 (w x d m): rows of strands across, a herringbone shimmer of tone (painted), a border of
 *  `border` m: black with a gold line inside */
const matTex = (w: number, d: number, border: number, seed: number) => paint(256, Math.round(256 * d / w), (g, W, Hp) => {
  const m = W / w, r = rng(seed);
  g.fillStyle = COL.straw; g.fillRect(0, 0, W, Hp);
  const row = 0.025 * m;
  for (let y = 0, i = 0; y < Hp; y += row, i++) { g.fillStyle = i % 2 ? COL.strawLo : COL.strawHi; g.globalAlpha = 0.28 + 0.12 * r(); g.fillRect(0, y, W, row * 0.5); }
  g.globalAlpha = 0.12; g.strokeStyle = "#5e4c2c"; g.lineWidth = 1.5;
  for (let x = -Hp; x < W; x += 0.05 * m) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + Hp, Hp); g.stroke(); }
  g.globalAlpha = 1;
  const b = border * m;
  g.strokeStyle = "#1e1b22"; g.lineWidth = b * 2; g.strokeRect(0, 0, W, Hp);
  g.strokeStyle = COL.gold; g.lineWidth = Math.max(2, 0.014 * m); g.strokeRect(b * 1.2, b * 1.2, W - 2.4 * b, Hp - 2.4 * b);
});
/** beyond the east door: a pale sunlit courtyard (a far wall with a roof line, the paved ground), unlit */
const doorLightTex = () => paint(256, 384, (g, W, Hp) => {
  const gd = g.createLinearGradient(0, 0, 0, Hp * 0.62); gd.addColorStop(0, "#fffaf0"); gd.addColorStop(1, COL.daylight);
  g.fillStyle = gd; g.fillRect(0, 0, W, Hp);
  g.fillStyle = "#efe2c8"; g.fillRect(0, Hp * 0.40, W, Hp * 0.24);                      // the far courtyard wall
  g.fillStyle = "#d9cbb0"; g.fillRect(0, Hp * 0.37, W, Hp * 0.035);                     // its tiled coping
  g.fillStyle = COL.sunGround; g.fillRect(0, Hp * 0.64, W, Hp * 0.36);                  // the paving
  g.fillStyle = "rgba(200,180,140,0.35)"; for (let y = Hp * 0.70; y < Hp; y += Hp * 0.07) g.fillRect(0, y, W, 2);
});
/** the warm patch of daylight on the floor inside the door: a soft-edged trapezoid widening into the hall */
const spillTex = () => paint(256, 256, (g, W, Hp) => {
  g.clearRect(0, 0, W, Hp);
  g.filter = "blur(10px)"; g.fillStyle = "rgba(255,214,140,1)";
  g.beginPath(); g.moveTo(W * 0.3, 6); g.lineTo(W * 0.7, 6); g.lineTo(W * 0.95, Hp - 10); g.lineTo(W * 0.05, Hp - 10); g.closePath(); g.fill();
  g.filter = "none";
  const fade = g.createLinearGradient(0, 0, 0, Hp); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = fade; g.fillRect(0, 0, W, Hp); g.globalCompositeOperation = "source-over";
});
/** the drum's barrel (u round, v along the axis): black lacquer, gold bands near both heads with a row of bronze studs */
const drumTex = () => paint(512, 128, (g, W, Hp) => {
  g.fillStyle = COL.lacquer; g.fillRect(0, 0, W, Hp);
  for (const v of [0.12, 0.88]) {
    g.fillStyle = COL.goldDim; g.fillRect(0, Hp * (v - 0.07), W, Hp * 0.14);
    g.fillStyle = COL.bronzeHi; for (let x = 8; x < W; x += 21) { g.beginPath(); g.arc(x, Hp * v, Hp * 0.045, 0, 2 * Math.PI); g.fill(); }
  }
  g.strokeStyle = "rgba(201,162,74,0.6)"; g.lineWidth = 4; for (let x = 0; x < W; x += W / 6) cloud(g, x + W / 12, Hp / 2, Hp * 0.16, 1);
});
/** a drumhead: pale hide, a gold ring and a darker centre */
const drumHeadTex = () => paint(256, 256, (g, W) => {
  g.fillStyle = COL.hide; g.fillRect(0, 0, W, W);
  const c = W / 2;
  g.strokeStyle = COL.goldDim; g.lineWidth = 9; g.beginPath(); g.arc(c, c, W * 0.42, 0, 2 * Math.PI); g.stroke();
  g.fillStyle = "rgba(120,96,60,0.25)"; g.beginPath(); g.arc(c, c, W * 0.16, 0, 2 * Math.PI); g.fill();
});

// ---------------------------------------------------------------------------------------------------- geometry
const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** the banners' cloth (the kit banner's 160 x 400 picture: field, gold edge, gold inner line, 秦), with a small gold
 *  lozenge under the character in place of the kit's two bars, which read as a second character 二 ("秦二") */
const bannerTex = (field: string, gold: string) => paint(160, 400, (c, cw, ch) => {
  c.fillStyle = field; c.fillRect(0, 0, cw, ch);
  c.strokeStyle = gold; c.lineWidth = 12; c.strokeRect(0, 0, cw, ch);
  c.lineWidth = 6; c.strokeRect(16, 16, cw - 32, ch - 32);
  c.fillStyle = gold; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `700 ${Math.round(cw * 0.62)}px ${FONT}`;
  c.fillText("秦", cw / 2, ch * 0.3);
  c.beginPath(); c.moveTo(cw / 2, ch * 0.55); c.lineTo(cw * 0.58, ch * 0.6); c.lineTo(cw / 2, ch * 0.65); c.lineTo(cw * 0.42, ch * 0.6); c.closePath(); c.fill();
});
/** a box w x h x d (centred on the origin) with its edges rounded to radius r. Not three's RoundedBoxGeometry: that
 *  one assumes a box near 1 m in every direction and builds a flat box (a cushion, a plinth) far too thin (the 10.5 cm
 *  cushion came out 4.1 cm, its top 3 cm under HALL_SET.cushion.top) */
const roundBox = (w: number, h: number, d: number, r: number, seg = 3) => {
  const n = seg * 2 + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), S = [w, h, d], half = S.map((v) => v / 2);
  r = Math.min(r, ...half);
  const pos = g.attributes.position as THREE.BufferAttribute, nor = g.attributes.normal as THREE.BufferAttribute;
  const p = [0, 0, 0], q = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    for (let a = 0; a < 3; a++) {
      const k = Math.round((pos.getComponent(i, a) + 0.5) * n);                // the grid line 0..n along this axis
      p[a] = (k <= seg ? (r * k) / seg : S[a] - (r * (n - k)) / seg) - half[a];  // seg lines in each rounded edge
      q[a] = p[a] - Math.max(-(half[a] - r), Math.min(half[a] - r, p[a]));   // the offset from the inner box
    }
    const L = Math.hypot(q[0], q[1], q[2]);
    if (L > 1e-9) { for (let a = 0; a < 3; a++) p[a] += (q[a] / L) * r - q[a]; nor.setXYZ(i, q[0] / L, q[1] / L, q[2] / L); }
    pos.setXYZ(i, p[0], p[1], p[2]);
  }
  return g;
};
/** a level quad at height y facing up, uv from uv(x, z) */
const levelQuad = (x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number]) => {
  const g = new THREE.BufferGeometry(), P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], pos: number[] = [], uvs: number[] = [];
  for (const [x, z] of P) { pos.push(x, y, z); uvs.push(...uv(x, z)); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
  return g;
};
/** an upright wall piece from floor point a to b (a = its LEFT end seen from the side it faces), y0..y1; u = (u0 + m
 *  along the wall) / tile, v = y / H */
const wallQuad = (a: [number, number], b: [number, number], y0: number, y1: number, u0: number, tile: number) => {
  const g = new THREE.BufferGeometry(), len = Math.hypot(b[0] - a[0], b[1] - a[1]), ua = u0 / tile, ub = (u0 + len) / tile;
  g.setAttribute("position", new THREE.Float32BufferAttribute([a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1]], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([ua, y0 / H, ub, y0 / H, ub, y1 / H, ua, y1 / H], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  return g;
};

// ---------------------------------------------------------------------------------------------------- the builder
export function buildHall(K: Kit) {
  const group = new THREE.Group(); group.name = "hall";
  const flat = (c: string, rough = 0.75) => K.flat(c, { rough });
  const tex = (map: THREE.Texture, rough = 0.8) => K.flat("#ffffff", { map, rough });
  const mesh = (name: string, geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], into: THREE.Object3D = group, cast = true) => {
    const o = new THREE.Mesh(geo, m); o.name = name; o.castShadow = cast; o.receiveShadow = true; into.add(o); return o;
  };
  const F = S.floor, Wl = S.wall;
  const lac = flat(COL.lacquer, 0.45), gold = K.flat(COL.gold, { rough: 0.45 });

  // =================================================================================================== the floor
  // 3 x 3 level quads with shared corners; the middle strip (1, 1) is where the runner lies: it swaps with the runner
  const G = S.grid, T = G.size * 4;
  const uvFloor = (x: number, z: number): [number, number] => [(x - G.ox) / T, (z - G.oz) / T];
  const mFloor = tex(floorTex(), 0.85);
  const R = S.ceremony.runner, xs = [F.x0, R.x0, R.x1, F.x1], zs = [F.z0, R.z0, R.z1, F.z1 + 4];
  let floorMid: THREE.Mesh | null = null;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const m = mesh(i === 1 && j === 1 ? "hall.floor.mid" : "hall.floor", levelQuad(xs[i], xs[i + 1], zs[j], zs[j + 1], 0, uvFloor), mFloor, group, false);
    if (i === 1 && j === 1) floorMid = m;
  }

  // =================================================================================================== the walls
  const mWall = tex(wallTex(), 0.9);
  const north = new THREE.Group(), east = new THREE.Group(), west = new THREE.Group(), south = new THREE.Group();
  north.name = "hall.wallN"; east.name = "hall.wallE"; west.name = "hall.wallW"; south.name = "hall.wallS";
  group.add(north, east, west, south);
  // u = metres along the wall from its left end (seen from inside) + u0, over the tile: the pilasters (on the tile's
  // edge, u = 0) stand in line with the pillar rows (z -1.10, -3.30, ...) on the side walls (tile 2.2) and at x
  // -2.45, 0 (behind the screen), 2.45 on the north wall (its tile 2.45: the pattern 11 % wider, unseen)
  const Pz = S.pillars.E1.z, tile = Wl.tile, tileN = 2.45;
  mesh("hall.wall.n", wallQuad([F.x0, F.z0], [F.x1, F.z0], 0, H, F.x0 + tileN, tileN), mWall, north, false);
  mesh("hall.wall.w", wallQuad([F.x0, F.z1], [F.x0, F.z0], 0, H, Pz - F.z1, tile), mWall, west, false);
  mesh("hall.wall.s", wallQuad([F.x1, F.z1], [F.x0, F.z1], 0, H, 0, tile), mWall, south, false);
  // the east wall round the door (seen from inside its left end is north): five pieces whose corners coincide (no
  // T-junction on the hole's corners)
  const D = S.door, dz0 = D.z - D.w / 2, dz1 = D.z + D.w / 2, ex = F.x1;
  const uAt = (z: number) => z - Pz;                                                           // u0 of a piece whose left end is at z
  for (const [y0, y1] of [[0, D.h], [D.h, H]] as [number, number][]) {
    mesh("hall.wall.e", wallQuad([ex, F.z0], [ex, dz0], y0, y1, uAt(F.z0), tile), mWall, east, false);
    mesh("hall.wall.e", wallQuad([ex, dz1], [ex, F.z1], y0, y1, uAt(dz1), tile), mWall, east, false);
  }
  mesh("hall.wall.e", wallQuad([ex, dz0], [ex, dz1], D.h, H, uAt(dz0), tile), mWall, east, false);
  // the reveal (the wall's thickness round the opening) and the sill, in the wall's dark and in stone
  const th = Wl.thick, mReveal = flat(COL.dado, 0.9);
  mesh("hall.door.reveal", wallQuad([ex, dz0], [ex + th, dz0], 0, D.h, 0, tile), mReveal, east, false);
  mesh("hall.door.reveal", wallQuad([ex + th, dz1], [ex, dz1], 0, D.h, 0, tile), mReveal, east, false);
  { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([ex, D.h, dz0, ex + th, D.h, dz0, ex + th, D.h, dz1, ex, D.h, dz1], 3)); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); mesh("hall.door.reveal", g, mReveal, east, false); }
  mesh("hall.door.sill", levelQuad(ex, ex + th, dz0, dz1, 0, uvFloor), mFloor, east, false);
  // the frame: two posts and a lintel round the opening, `proud` out of the wall, 1 cm over the opening's edge
  const fw = D.frame, pr = D.proud;
  mesh("hall.door.frame", boxG(ex - pr, ex + 0.06, 0, D.h + fw, dz0 - fw, dz0 + 0.01), lac, east);
  mesh("hall.door.frame", boxG(ex - pr, ex + 0.06, 0, D.h + fw, dz1 - 0.01, dz1 + fw), lac, east);
  mesh("hall.door.frame", boxG(ex - pr, ex + 0.06, D.h - 0.01, D.h + fw, dz0 - fw + 0.005, dz1 + fw - 0.005), lac, east);
  mesh("hall.door.frame.gold", boxG(ex - pr - 0.004, ex - pr + 0.01, D.h + fw * 0.35, D.h + fw * 0.6, dz0 - fw + 0.02, dz1 + fw - 0.02), gold, east, false);
  // beyond: the sunlit ground and the daylight card (unlit, NOINK, no shadow; "light" / "outside": the checker skips them)
  const outD = 1.4, card = new THREE.MeshBasicMaterial({ map: doorLightTex() });
  const light = mesh("door.light", new THREE.PlaneGeometry(D.w + 1.6, D.h + 0.8).rotateY(-Math.PI / 2).translate(ex + th + outD, (D.h + 0.8) / 2 - 0.02, D.z), card, east, false);
  light.layers.set(NOINK); light.receiveShadow = false;
  const og = mesh("hall.outside.ground", levelQuad(ex + th, ex + th + outD + 0.05, D.z - D.w / 2 - 0.8, D.z + D.w / 2 + 0.8, 0, () => [0.5, 0.5]), new THREE.MeshBasicMaterial({ color: COL.sunGround }), east, false);
  og.layers.set(NOINK); og.receiveShadow = false;
  // the warm patch of daylight on the floor inside the door (additive, 1 mm, no depth, NOINK)
  const sp = new THREE.MeshBasicMaterial({ map: spillTex(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const spill = mesh("hall.door.spill", levelQuad(ex - 1.7, ex, dz0 - 0.55, dz1 + 0.55, 0.001, (x, z) => [(z - (dz0 - 0.55)) / (D.w + 1.1), (x - (ex - 1.7)) / 1.7]), sp, east, false);
  spill.layers.set(NOINK); spill.receiveShadow = false; spill.renderOrder = 1;

  // =================================================================================================== the dais, the step, the 榻
  const Ds = S.dais, St = S.step, Ta = S.ta, C = S.cushion, A = S.armrest, Sc = S.screen;
  const faces = (side: THREE.Material, top: THREE.Material, end: THREE.Material = side) => [end, end, top, lac, side, lac];   // +x -x +y -y +z -z
  const daisSide = tex(sideTex(Ds.x1 - Ds.x0, Ds.top, 0.09), 0.45), daisEnd = tex(sideTex(Ds.z1 - Ds.z0, Ds.top, 0.09), 0.45);
  mesh("hall.dais", boxG(Ds.x0, Ds.x1, 0, Ds.top, Ds.z0, Ds.z1), faces(daisSide, tex(topTex(0.012), 0.45), daisEnd));
  const stepSide = tex(sideTex(St.x1 - St.x0, St.top, 0.12), 0.45), stepEnd = tex(sideTex(St.z1 - St.z0, St.top, 0.12), 0.45);
  mesh("hall.step", boxG(St.x0, St.x1, 0, St.top, St.z0, St.z1 + 0.0), faces(stepSide, lac, stepEnd));
  const taSide = tex(sideTex(Ta.x1 - Ta.x0, Ta.top - Ds.top, 0.16, 5), 0.4), taEnd = tex(sideTex(Ta.z1 - Ta.z0, Ta.top - Ds.top, 0.16, 3), 0.4);
  mesh("hall.ta", boxG(Ta.x0, Ta.x1, Ds.top - 0.005, Ta.top, Ta.z0, Ta.z1), faces(taSide, tex(topTex(0.03), 0.4), taEnd));
  // the cushion (its box = HALL_SET.cushion; soft rounded edges), name "hall.pad"
  const pad = roundBox(C.w, C.top - Ta.top + 0.005, C.d, 0.03).translate(C.x, (Ta.top - 0.005 + C.top) / 2, C.z);
  mesh("hall.pad", pad, tex(cushionTex(), 0.9));
  // the 凭几: a bar bowed toward the sitter (its ends 4 cm nearer him than its middle), the ends turned up a little,
  // on two splayed legs standing on the 榻
  {
    const n = 16, half = A.len / 2, bow = 0.04, wd = 0.07, tk = 0.035, pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, s = 2 * t - 1, z = A.z + s * half, x = A.x + bow * s * s, lift = 0.02 * s * s * s * s;
      const yT = A.top + lift, yB = yT - tk;
      pos.push(x - wd / 2, yB, z, x + wd / 2, yB, z, x + wd / 2, yT, z, x - wd / 2, yT, z);
    }
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const a = i * 4 + k, b = i * 4 + ((k + 1) % 4), c = a + 4, d = b + 4; idx.push(a, c, b, b, c, d); }
    idx.push(0, 1, 2, 0, 2, 3); const e = n * 4; idx.push(e, e + 2, e + 1, e, e + 3, e + 2);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const ng = g.toNonIndexed(); ng.computeVertexNormals();
    mesh("hall.armrest", ng, lac);
    for (const s of [-1, 1]) {
      const z = A.z + s * 0.17, x = A.x + bow * (0.17 / half) ** 2;
      mesh(`hall.armrest.leg`, boxG(x - 0.025, x + 0.025, Ta.top - 0.005, A.top - tk + 0.005, z - 0.016, z + 0.016), lac);
      mesh(`hall.armrest.foot`, boxG(x - 0.05, x + 0.05, Ta.top - 0.005, Ta.top + 0.02, z - 0.03, z + 0.03), lac);
    }
  }
  // the gold screen: one lacquer slab (front at Sc.z) with the painted face, on two feet standing on the dais
  const scBack = Math.max(Sc.z - 0.05, Ds.z0);
  mesh("hall.screen", boxG(-Sc.w / 2, Sc.w / 2, Ds.top - 0.005, Ds.top + Sc.h, scBack, Sc.z), [lac, lac, lac, lac, tex(screenTex(), 0.6), lac]);
  for (const s of [-1, 1]) mesh("hall.screen.foot", boxG(s * Sc.w * 0.38 - 0.16, s * Sc.w * 0.38 + 0.16, Ds.top - 0.005, Ds.top + 0.12, Ds.z0, Sc.z + 0.12), lac);

  // =================================================================================================== the pillars
  const P = S.pillar, mPillar = tex(pillarTex(), 0.5), mPlinth = flat(COL.plinth, 0.7);
  for (const [k, at] of Object.entries(S.pillars)) {
    mesh(`hall.plinth.${k}`, roundBox(P.plinth.w, P.plinth.h, P.plinth.w, 0.015, 2).translate(at.x, P.plinth.h / 2, at.z), mPlinth);
    mesh(`hall.pillar.${k}`, new THREE.CylinderGeometry(P.d / 2, P.d / 2, P.h - P.plinth.h + 0.01, 32, 1).translate(at.x, P.plinth.h - 0.01 + (P.h - P.plinth.h + 0.01) / 2, at.z), mPillar);
  }

  // =================================================================================================== the map stand (12b-15)
  const MS = S.mapStand, stand = new THREE.Group(); stand.name = "hall.mapStand"; group.add(stand);
  for (const s of [-1, 1]) {
    const x = MS.x + s * (MS.w / 2 + 0.03);
    mesh(`hall.mapStand.post`, boxG(x - 0.022, x + 0.022, 0, MS.bar + 0.09, MS.z - 0.022, MS.z + 0.022), lac, stand);
    mesh(`hall.mapStand.foot`, boxG(x - 0.03, x + 0.03, 0, 0.045, MS.z - 0.2, MS.z + 0.2), lac, stand);
    mesh(`hall.mapStand.cap`, new THREE.SphereGeometry(0.03, 16, 12).translate(x, MS.bar + 0.1, MS.z), gold, stand);
  }
  // the bar: its underside 5 mm into the scroll's top roller (prop mapScroll, r 0.02 at HALL.mapBar), so it hangs from it
  mesh("hall.mapStand.bar", boxG(MS.x - MS.w / 2 - 0.06, MS.x + MS.w / 2 + 0.06, MS.bar + 0.015, MS.bar + 0.055, MS.z - 0.022, MS.z + 0.022), lac, stand);
  // the official's spot: a straw kneeling mat, 1 mm over the floor (FLOOR_SHEET_MAX)
  const Mm = MS.mat, mMat = tex(matTex(Mm.w, Mm.d, 0.04, 61), 0.95);
  (mMat as THREE.Material).polygonOffset = true; (mMat as THREE.Material).polygonOffsetFactor = -1; (mMat as THREE.Material).polygonOffsetUnits = -1;
  mesh("hall.mapStand.mat", levelQuad(Mm.x - Mm.w / 2, Mm.x + Mm.w / 2, Mm.z - Mm.d / 2, Mm.z + Mm.d / 2, 0.001, (x, z) => [(x - (Mm.x - Mm.w / 2)) / Mm.w, (z - (Mm.z - Mm.d / 2)) / Mm.d]), mMat, stand, false);

  // =================================================================================================== the ceremony (17-22)
  const Ce = S.ceremony, cer = new THREE.Group(); cer.name = "hall.ceremony"; group.add(cer);
  // the runner, let into the floor (it replaces the floor's middle strip while the ceremony is on)
  const runner = mesh("hall.runner", levelQuad(R.x0, R.x1, R.z0, R.z1, 0, (x, z) => [(x - R.x0) / (R.x1 - R.x0), (z - R.z0) / (R.z1 - R.z0)]), tex(matTex(R.x1 - R.x0, R.z1 - R.z0, R.border, 53), 0.95), cer, false);
  // the eight banners (the kit's, black field, gold edge, 秦) in lacquer feet; the cloth hangs toward the hall's middle
  const hooks: { hook: Hook; g: THREE.Group }[] = [], cloths: THREE.Object3D[] = [];
  const clothW = bannerTex(COL.banner, COL.gold), clothE = clothW.clone(); clothE.repeat.x = -1; clothE.offset.x = 1; clothE.needsUpdate = true;
  for (const sx of [-1, 1]) for (const z of Ce.bannerZ) {
    const g = new THREE.Group(); g.name = "hall.banner";
    const hook = kitBanner(K, g, COL.banner, COL.gold, COL.gold, "秦");
    g.position.set(sx * Ce.bannerX, 0, z);
    if (sx > 0) g.scale.x = -1;                                     // east side: mirrored so the cloth hangs west
    g.traverse((o) => {                                             // our picture (no 二); flipped back on the east side
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (o.name !== "banner.cloth" || !m?.map) return;
      const t = sx > 0 ? clothE : clothW; t.colorSpace = m.map.colorSpace; m.map = t; m.needsUpdate = true;
    });
    g.traverse((o) => { if (o.name === "banner.cloth") cloths.push(o); });
    hook({ t: 0 }, g);
    cer.add(g); hooks.push({ hook, g });
    const fb = Ce.bannerFoot;
    mesh("hall.banner.foot", roundBox(fb, 0.12, fb, 0.02, 2).translate(sx * Ce.bannerX, 0.06, z), lac, cer);
  }
  // the drum on its cradle
  {
    const Dr = Ce.drumSize, at = Ce.drum, d = new THREE.Group(); d.name = "hall.drum"; cer.add(d);
    d.position.set(at.x, 0, at.z); d.rotation.y = Dr.yaw;
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, y = (t - 0.5) * Dr.len; prof.push(new THREE.Vector2(Dr.rh + (Dr.r - Dr.rh) * Math.sin(Math.PI * t), y)); }
    const barrel = new THREE.LatheGeometry(prof, 32).rotateX(Math.PI / 2).translate(0, Dr.y, 0);
    mesh("hall.drum", barrel, tex(drumTex(), 0.45), d);
    const headM = tex(drumHeadTex(), 0.8);
    mesh("hall.drum.head", new THREE.CircleGeometry(Dr.rh + 0.002, 32).translate(0, 0, Dr.len / 2 + 0.001).translate(0, Dr.y, 0), headM, d);
    mesh("hall.drum.head", new THREE.CircleGeometry(Dr.rh + 0.002, 32).rotateY(Math.PI).translate(0, Dr.y, -Dr.len / 2 - 0.001), headM, d);
    // the cradle: on each side (x = +-) two splayed legs from the floor to the barrel's waist, a rail between their feet
    const wood = flat(COL.wood, 0.6);
    const leg = (a: THREE.Vector3, b: THREE.Vector3, r = 0.028) => {
      const dv = b.clone().sub(a), len = dv.length(), g = new THREE.CylinderGeometry(r, r, len, 12);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dv.normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      return g;
    };
    for (const s of [-1, 1]) {
      const x = s * (Dr.r + 0.01), top = new THREE.Vector3(x, Dr.y - 0.05, 0);
      mesh("hall.drum.stand", leg(new THREE.Vector3(s * (Dr.r + 0.12), 0, Dr.len * 0.55), top), wood, d);
      mesh("hall.drum.stand", leg(new THREE.Vector3(s * (Dr.r + 0.12), 0, -Dr.len * 0.55), top), wood, d);
      mesh("hall.drum.stand", boxG(s * (Dr.r + 0.12) - 0.03, s * (Dr.r + 0.12) + 0.03, 0, 0.05, -Dr.len * 0.62, Dr.len * 0.62), wood, d);
    }
    mesh("hall.drum.stand", boxG(-Dr.r - 0.15, Dr.r + 0.15, 0.0, 0.05, -0.03, 0.03), wood, d);
  }

  // =================================================================================================== the lights
  // a warm key from the upper left front, a dim hemisphere, the point light = the daylight at the east door
  lightRig(group, {
    dir: [-0.45, 0.75, 0.5], k: 2.1, col: "#ffe2b8", at: [0, 0, -2.4], half: 5.5, hemi: ["#6c6272", "#2a2228", 0.85],
    point: { col: "#ffe6bc", k: 3.0, at: [ex - 0.35, 1.5, D.z], dist: 3.6 },
  });

  const walls: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [
    [north, (p) => p.z < F.z0 - 0.05], [east, (p) => p.x > F.x1 + 0.05], [west, (p) => p.x < F.x0 - 0.05], [south, (p) => p.z > F.z1 - 0.3],
  ];
  const set = {
    group,
    /** the ceremony dressing: 0 = off .. 1 = on (the banners' cloths unfurl down with k; the runner replaces the
     *  floor's middle strip from k > 0) */
    ceremony(k: number) {
      const e = Math.max(0, Math.min(1, k)), on = e > 0.001;
      cer.visible = on; runner.visible = on; if (floorMid) floorMid.visible = !on;
      for (const c of cloths) c.scale.y = Math.max(0.001, e);
    },
    /** the map stand and the official's mat (the prop mapScroll hangs from the stand's bar) */
    mapStand(on: boolean) { stand.visible = on; },
    /** hides every wall the camera stands behind (the south wall for every camera south of the hall) */
    view(camPos: THREE.Vector3) { for (const [g, behind] of walls) g.visible = !behind(camPos); },
    /** the banners sway (the kit banner's own cloth wave, a pure function of t seconds) */
    animate(t: number) { for (const { hook, g } of hooks) hook({ t }, g); },
  };
  set.ceremony(0); set.mapStand(false);
  return set;
}
export type HallSet = ReturnType<typeof buildHall>;

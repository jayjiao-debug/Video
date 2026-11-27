// THE OFFICE (place "office", island x 0): 天庭姻缘司, 月老's one-man marriage bureau in heaven, year-end morning.
// A 6 x 6 m clerk's room worked in for 1200 years: dark red lacquer pillars, cream plaster over dark wood wainscot,
// warm floor boards, a round moon window in the back wall (-z) with a blue-gold morning sky, a pale moon and clouds
// outside; the key comes in through it. RED THREAD EVERYWHERE: hanks from the beams, lines strung across the room,
// spools on the shelves, baskets and skeins against the walls; THE TANGLE heap on the floor. The case-file cabinet (a
// medicine chest of drawers) fills the -x wall; heaven's decree hangs on the +x wall; the burner stands by the door.
// v6 (owner's notes 1, 10 and 13 on v5: threads "too 3D", "more texture and detail", "too modern, more 神仙ly"): the
// KPI board is now a 考绩令 scroll from heaven's Board of Personnel; a lacquer plaque 千里姻缘一线牵 crowns the moon window
// between two couplets; the beams are painted, the pillars banded in gold, the plaster stencilled with clouds; clouds
// drift in at the floor and below the window; two coils of incense hang from the back beam; every thread in the room
// is the film's outlined cord (sets/cord.ts), and THE TANGLE is loose cord in lazy coils over a low mound.
// All marks: places.ts OFFICE (local; world x = ISLAND.office + x).
// PARAMS
//   kpi     0 | 1   the decree: 0 = his own red brush beside it, 就差一对; 1 = the Board's 考绩合格 seal across it
//   smoke   0..1    the burner's thin column of pale smoke (the prayers arriving)
//   tangle  0..1    THE TANGLE's height (0 hides it)
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { ceilQuad, lathe, boardsTex, sunShaft, dustMotes } from "../../romeo/sets/parts/b_common";
import { ISLAND, OFFICE as D } from "../places";
import { maker, boxG, paint, rng, css, mix, blotch, NOINK, levelQuad, tileUV, bar, FONT, lightRig, V, flatFace } from "./common";
import { cordMat, cordGeo, cordRing, sagPts, CORD_INK, CORD_REDS } from "./cord";
import { decreeTex, DECREE_PX, plaqueTex, PLAQUE_PX, coupletTex, COUPLET_PX, beamTex, wallTex, moundTex, cloudTex, CLOUD_PX, apronTex } from "./office_art";

const X0 = ISLAND.office, WT = 0.22;
const X = (x: number) => X0 + x;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** toward the key (through the moon window: from -z, a little from the left, high) */
const KEY: [number, number, number] = [-0.25, 0.8, -0.55];
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.34, 0.25, 0.18]], [0, [0.62, 0.52, 0.42]], [90, [0.82, 0.74, 0.62]]],
  boxes: [{ az: 195, el: 35, rot: 0, w: 30, h: 22, soft: 16, col: [1.15, 1.0, 0.8] }],
};
const LOOK: PlaceLook = {
  bg: "#3a2a20",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.35, color: "#3a2418" },
  cast: flatFace({ key: [-0.22, 0.7, 0.68], tint: [1.0, 0.93, 0.82], tintK: 0.5, gain: 1.06, grad: 0.2, bodyGrad: 0.14, sideTint: [1.0, 0.94, 0.88], shade: [1.0, 0.92, 1.18], shadeK: 0.38, wrap: [32, 64], edge: 0.16, broad: 0.26, bodySat: 0.12, sheen: 0.14, lift: 0.05, contactLen: 0.25, ...BAKED_LIGHT }) as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
const PARAMS: Record<string, ParamValue> = { kpi: 0, smoke: 0, tangle: 1 };

const REDS = ["#c3242b", "#9c1820", "#de4a4a"];
/** the decree scroll: its width along the wall and the height of its lower edge (above the wainscot's rail at 1.05) */
const DECREE = { w: 0.86, y0: 1.12 } as const;

// ===================================================================================================== paintings
const floorTex = () => boardsTex({ seed: 301, n: 5, base: "#9a6a44", lo: "#5e3a22" });
const wainTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(302); g.fillStyle = "#4e3020"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) blotch(g, W * r(), H * r(), W * (0.06 + 0.1 * r()), r() < 0.5 ? "#3c2418" : "#5e3c28", 0.16);
  // two sunk panels per tile, a lighter lip on top and left, a dark one below and right
  for (let k = 0; k < 2; k++) {
    const x0 = k * W / 2 + W * 0.06, x1 = (k + 1) * W / 2 - W * 0.06, y0 = H * 0.12, y1 = H * 0.86;
    g.fillStyle = css("#3a2216", 0.6); g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = css("#7a5236", 0.55); g.fillRect(x0, y0, x1 - x0, 6); g.fillRect(x0, y0, 6, y1 - y0);
    g.fillStyle = css("#24140c", 0.6); g.fillRect(x0, y1 - 6, x1 - x0, 6); g.fillRect(x1 - 6, y0, 6, y1 - y0);
  }
}, true);
const ceilTex = () => boardsTex({ seed: 303, n: 4, base: "#6a4630", lo: "#3e2618" });
const darkWoodTex = (seed: number, base = "#5a3622") => paint(256, 256, (g, W, H) => {
  const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, W, H);
  g.strokeStyle = css(mix(base, "#1e120a", 0.5), 0.25); g.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const y = H * r(); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + 8 * (r() - 0.5), W * 0.6, y + 8 * (r() - 0.5), W, y); g.stroke(); }
  for (let i = 0; i < 8; i++) blotch(g, W * r(), H * r(), W * 0.15, r() < 0.5 ? mix(base, "#000000", 0.25) : mix(base, "#ffffff", 0.1), 0.15);
}, true);
const lacquerTex = () => paint(128, 256, (g, W, H) => {
  const r = rng(304); g.fillStyle = "#6a2018"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) blotch(g, W * r(), H * r(), W * (0.2 + 0.3 * r()), r() < 0.6 ? "#4e1610" : "#86302a", 0.18);
  for (let i = 0; i < 6; i++) { g.fillStyle = css("#3a120c", 0.25); g.fillRect(W * r(), H * r(), 2 + 3 * r(), 20 + 40 * r()); }   // worn lacquer
}, true);

/** the sky in the moon window: blue going to gold at the bottom, clouds, a pale day moon, a plum branch */
const skyTex = () => paint(1024, 1024, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#7fa6cf"); gr.addColorStop(0.45, "#a9c3dc"); gr.addColorStop(0.72, "#efdcae"); gr.addColorStop(1, "#f2c784");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // the pale moon, upper right of the window
  const mx = W * 0.63, my = H * 0.38, mr = W * 0.1;
  const mg = g.createRadialGradient(mx, my, 0, mx, my, mr * 2.2); mg.addColorStop(0, "rgba(255,252,238,0.55)"); mg.addColorStop(1, "rgba(255,252,238,0)");
  g.fillStyle = mg; g.fillRect(0, 0, W, H);
  g.fillStyle = "#f8f3e2"; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
  g.fillStyle = css("#dcd6c6", 0.6); for (const [dx, dy, s] of [[-0.3, -0.2, 0.22], [0.25, 0.2, 0.16], [0.1, -0.4, 0.1]]) { g.beginPath(); g.arc(mx + dx * mr, my + dy * mr, s * mr, 0, 7); g.fill(); }
  // clouds: soft stacked puffs, lit gold underneath
  const r = rng(305);
  const cloud = (cx: number, cy: number, w: number) => {
    for (let i = 0; i < 9; i++) { const x = cx + w * (r() - 0.5), y = cy + w * 0.12 * (r() - 0.5), s = w * (0.12 + 0.12 * r()); blotch(g, x, y + s * 0.25, s * 1.1, "#f0c88e", 0.5); }
    for (let i = 0; i < 11; i++) { const x = cx + w * (r() - 0.5) * 0.9, y = cy - w * 0.05 + w * 0.1 * (r() - 0.5), s = w * (0.1 + 0.11 * r()); g.fillStyle = css("#fffaf0", 0.95); g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
  };
  cloud(W * 0.3, H * 0.5, W * 0.45); cloud(W * 0.15, H * 0.36, W * 0.25);
  // far palace roofs of heaven standing in the cloud sea (a mid-dark warm band behind the actors' heads)
  const roofs = (y0: number, col: string, n: number) => {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const cx = W * (i + 0.2 + 0.6 * r()) / n, w = W * (0.12 + 0.08 * r()), top = y0 - H * (0.03 + 0.06 * r());
      g.beginPath(); g.moveTo(cx - w * 0.62, top + H * 0.035); g.quadraticCurveTo(cx - w * 0.3, top + H * 0.02, cx - w * 0.22, top); g.lineTo(cx + w * 0.22, top);
      g.quadraticCurveTo(cx + w * 0.3, top + H * 0.02, cx + w * 0.62, top + H * 0.035); g.lineTo(cx + w * 0.4, top + H * 0.04); g.lineTo(cx + w * 0.4, H); g.lineTo(cx - w * 0.4, H); g.lineTo(cx - w * 0.4, top + H * 0.04); g.closePath(); g.fill();
    }
    g.fillRect(0, y0, W, H - y0);
  };
  roofs(H * 0.63, "#a88c80", 5);
  for (let i = 0; i < 16; i++) { const x = W * r(), y = H * (0.62 + 0.05 * r()), s2 = W * (0.05 + 0.06 * r()); g.fillStyle = css("#f0d6a8", 0.9); g.beginPath(); g.arc(x, y, s2, 0, 7); g.fill(); }
  roofs(H * 0.72, "#8a6c64", 4);
  for (let i = 0; i < 18; i++) { const x = W * r(), y = H * (0.72 + 0.06 * r()), s2 = W * (0.05 + 0.07 * r()); g.fillStyle = css("#e2bc88", 0.92); g.beginPath(); g.arc(x, y, s2, 0, 7); g.fill(); }
  g.fillStyle = "#7a5e58"; g.fillRect(0, H * 0.8, W, H * 0.2);
  // a plum branch across the lower left
  g.strokeStyle = "#4a2e22"; g.lineCap = "round";
  const br = (x: number, y: number, a: number, len: number, w: number, d: number) => {
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + 10, (y + y2) / 2 - 10, x2, y2); g.stroke();
    if (d > 0) { br(x2, y2, a - 0.5 + 0.3 * r(), len * 0.7, w * 0.65, d - 1); br(x2, y2, a + 0.4 + 0.3 * r(), len * 0.6, w * 0.6, d - 1); }
    else for (let k = 0; k < 3; k++) { g.fillStyle = r() < 0.5 ? "#f4c2c6" : "#ffffff"; g.beginPath(); g.arc(x2 + 14 * (r() - 0.5), y2 + 14 * (r() - 0.5), 7 + 4 * r(), 0, 7); g.fill(); }
  };
  br(-10, H * 0.82, -0.35, W * 0.2, 16, 3);
});

/** through the door: heaven's pale gold corridor of cloud */
const beyondTex = () => paint(512, 512, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#cfdcea"); gr.addColorStop(0.55, "#f4e4c0"); gr.addColorStop(1, "#f6ead2");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = rng(361);
  for (let i = 0; i < 26; i++) { const x = W * r(), y = H * (0.55 + 0.45 * r()), s = W * (0.06 + 0.1 * r()); blotch(g, x, y + s * 0.3, s * 1.1, "#e8c890", 0.35); g.fillStyle = css("#fffaf0", 0.9); g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
});
/** THE CASE-FILE CABINET's face: COLS x ROWS square drawers, each with a cream label and a painted pull's shadow */
const CAB = { cols: 14, rows: 8, y0: 0.12, y1: 2.2 } as const;
const LABELS = ["甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "唐", "宋", "元", "明", "清", "壬申", "癸酉", "甲戌", "乙亥", "开元", "贞观", "汴梁", "长安", "江南", "蜀", "姑苏"];
const cabTex = (len: number, hgt: number) => {
  const W = 2048, H = Math.round(W * hgt / len), py = (y: number) => H - (y / hgt) * H, ppm = W / len;
  return paint(W, H, (g) => {
    const r = rng(311);
    g.fillStyle = "#2c1a10"; g.fillRect(0, 0, W, H);
    // plinth and cornice
    g.fillStyle = "#3a2216"; g.fillRect(0, py(CAB.y0), W, H - py(CAB.y0)); g.fillRect(0, 0, W, py(CAB.y1));
    g.fillStyle = css("#6e4a30", 0.6); g.fillRect(0, py(CAB.y1) - 5, W, 5); g.fillRect(0, py(CAB.y0), W, 4);
    const cw = W / CAB.cols, rh = (py(CAB.y0) - py(CAB.y1)) / CAB.rows, gap = Math.max(5, cw * 0.05);
    let li = 0;
    for (let row = 0; row < CAB.rows; row++) for (let c = 0; c < CAB.cols; c++) {
      const x = c * cw + gap / 2, y = py(CAB.y1) + row * rh + gap / 2, w = cw - gap, h = rh - gap;
      const base = mix("#5a3824", r() < 0.5 ? "#3e2416" : "#6e4630", 0.2 + 0.5 * r());
      g.fillStyle = css(base); g.fillRect(x, y, w, h);
      blotch(g, x + w * r(), y + h * r(), w * 0.5, r() < 0.5 ? "#2e1a0e" : "#7a5236", 0.18);
      // bevel: light lip top-left, dark lip bottom-right
      g.fillStyle = css("#8a6040", 0.55); g.fillRect(x, y, w, 4); g.fillRect(x, y, 4, h);
      g.fillStyle = css("#1a0e08", 0.65); g.fillRect(x, y + h - 5, w, 5); g.fillRect(x + w - 5, y, 5, h);
      // worn patch round the pull (1200 years of hands)
      blotch(g, x + w / 2, y + h * 0.66, w * 0.22, "#8a6244", 0.3);
      // the label: cream paper, a little askew, foxed
      const lw = w * 0.52, lh = h * 0.24, lx = x + (w - lw) / 2 + (r() - 0.5) * 4, ly = y + h * 0.14;
      g.save(); g.translate(lx + lw / 2, ly + lh / 2); g.rotate((r() - 0.5) * 0.06);
      g.fillStyle = css(mix("#ead9b4", "#c8ad7e", r() * 0.6)); g.fillRect(-lw / 2, -lh / 2, lw, lh);
      g.fillStyle = css("#a0804e", 0.25); g.fillRect(-lw / 2, lh / 2 - 3, lw, 3);
      if (r() < 0.55) {
        const s = LABELS[li++ % LABELS.length];
        g.fillStyle = "#2a1c14"; g.font = `700 ${Math.round(lh * (s.length > 1 ? 0.62 : 0.72))}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(s, 0, lh * 0.04);
      } else {
        g.strokeStyle = css("#3a2a1e", 0.6); g.lineWidth = 2;
        for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(-lw * 0.32, (k - 0.5) * lh * 0.36); g.lineTo(-lw * 0.32 + lw * (0.3 + 0.34 * r()), (k - 0.5) * lh * 0.36); g.stroke(); }
      }
      if (r() < 0.12) { g.fillStyle = css("#b0242a", 0.85); g.beginPath(); g.arc(lw * 0.36, -lh * 0.2, lh * 0.18, 0, 7); g.fill(); }   // a red tick
      g.restore();
      // the pull's back plate (the knob itself is geometry)
      g.fillStyle = css("#2a180c", 0.55); g.beginPath(); g.arc(x + w / 2 + 3, y + h * 0.62 + 4, ppm * 0.024, 0, 7); g.fill();
      g.fillStyle = "#9c7a3c"; g.beginPath(); g.arc(x + w / 2, y + h * 0.62, ppm * 0.022, 0, 7); g.fill();
    }
    // three vertical stiles every few columns (the chest was built in sections)
    for (const c of [0, 5, 9, 14]) { g.fillStyle = "#24140a"; g.fillRect(c * cw - 5, py(CAB.y1), 10, py(CAB.y0) - py(CAB.y1)); }
  });
};

/** the 缘 on the wall: a red 斗方 (a square of red paper hung on its corner, as a 福 is), gold-edged, the character in gold.
 *  Drawn turned an eighth, so that it stands upright once the square hangs on its corner. */
const scrollTex = () => paint(512, 512, (g, W, H) => {
  g.fillStyle = "#b4222a"; g.fillRect(0, 0, W, H);
  const r = rng(331); for (let i = 0; i < 26; i++) blotch(g, W * r(), H * r(), 46, "#9a1a22", 0.22);
  g.strokeStyle = "#e2b65a"; g.lineWidth = 12; g.strokeRect(24, 24, W - 48, H - 48); g.lineWidth = 3; g.strokeRect(46, 46, W - 92, H - 92);
  for (const [x, y] of [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]]) { g.fillStyle = "#e2b65a"; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.save(); g.translate(W / 2, H / 2); g.rotate(Math.PI / 4);
  g.fillStyle = "#f6dc92"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 268px ${FONT}`; g.fillText("缘", 0, 10);
  g.restore();
});

/** the open 姻缘簿's spread: columns of tiny script, names joined by red lines */
const bookTex = () => paint(800, 540, (g, W, H) => {
  const r = rng(341);
  g.fillStyle = "#efe3c4"; g.fillRect(0, 0, W, H);
  const sh = g.createLinearGradient(W / 2 - 60, 0, W / 2 + 60, 0); sh.addColorStop(0, "rgba(120,90,50,0)"); sh.addColorStop(0.5, "rgba(120,90,50,0.45)"); sh.addColorStop(1, "rgba(120,90,50,0)");
  g.fillStyle = sh; g.fillRect(W / 2 - 60, 0, 120, H);
  g.strokeStyle = css("#b04030", 0.5); g.lineWidth = 2;
  for (const x0 of [24, W / 2 + 24]) {
    g.strokeRect(x0, 26, W / 2 - 48, H - 52);
    for (let c = 0; c < 11; c++) {
      const x = x0 + 18 + c * ((W / 2 - 84) / 10);
      g.strokeStyle = css("#b04030", 0.18); g.beginPath(); g.moveTo(x - 14, 26); g.lineTo(x - 14, H - 26); g.stroke();
      let y = 40;
      while (y < H - 50) { const l = 10 + 16 * r(); g.fillStyle = css("#2a1c14", 0.75); g.fillRect(x - 4, y, 8, l * 0.4); g.fillRect(x - 6, y + l * 0.45, 12, 3); y += l + 6; }
    }
    for (let k = 0; k < 3; k++) {
      const a = [x0 + 30 + r() * 300, 60 + r() * 380], b = [x0 + 30 + r() * 300, 60 + r() * 380];
      g.strokeStyle = css("#c01e22", 0.85); g.lineWidth = 4; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 50, b[0], b[1]); g.stroke();
      g.beginPath(); g.arc(a[0], a[1], 14, 0, 7); g.stroke(); g.beginPath(); g.arc(b[0], b[1], 14, 0, 7); g.stroke();
    }
  }
});
/** a pinned memo slip: tiny script, a red name or two */
const noteTex = (seed: number) => paint(128, 192, (g, W, H) => {
  const r = rng(seed); g.fillStyle = css(mix("#ecdcb6", "#d4bc8c", r() * 0.5)); g.fillRect(0, 0, W, H);
  for (let c = 0; c < 4; c++) { let y = 16; const x = W - 22 - c * 26; while (y < H - 20) { const l = 6 + 10 * r(); g.fillStyle = css(r() < 0.12 ? "#b8222a" : "#2a1c14", 0.8); g.fillRect(x - 3, y, 6, l); y += l + 5; } }
  g.strokeStyle = css("#a08050", 0.5); g.lineWidth = 3; g.strokeRect(4, 4, W - 8, H - 8);
});
const lanternTex = (base: string, seed: number) => paint(256, 128, (g, W, H) => {
  const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) blotch(g, W * r(), H * r(), 30, mix(base, "#ffffff", 0.25), 0.25);
  g.strokeStyle = css(mix(base, "#000000", 0.4), 0.5); g.lineWidth = 3;
  for (let i = 0; i < 12; i++) { const x = (i + 0.5) * W / 12; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
}, true);
const smokeTex = () => paint(64, 128, (g, W, H) => {
  const r = rng(351);
  for (let i = 0; i < 14; i++) { const y = H * (0.15 + 0.7 * r()), x = W / 2 + (r() - 0.5) * W * 0.3, s = W * (0.12 + 0.18 * r()); const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
});

// ===================================================================================================== build
const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "office";
  const Mk = maker(K, group);
  const mPlaster = Mk.tex(wallTex(), 0.95), mWain = Mk.tex(wainTex(), 0.85), mFloor = Mk.tex(floorTex(), 0.88), mCeil = Mk.tex(ceilTex(), 0.9);
  const mDark = Mk.tex(darkWoodTex(307), 0.8), mDesk = Mk.tex(darkWoodTex(308, "#62402a"), 0.7), mLac = Mk.tex(lacquerTex(), 0.6), mBeam = Mk.tex(darkWoodTex(309, "#4a2c1c"), 0.85);
  const mBrass = Mk.flat("#b08a44", 0.45), mBronze = Mk.flat("#7a6040", 0.5), mPaper = Mk.flat("#eadcb8", 0.95), mInk = Mk.flat("#1e1a1c", 0.6);
  const mRed = REDS.map((c) => Mk.flat(c, 0.9)), mCord = Mk.flat("#3a2618", 0.9);
  const RC = CORD_REDS.map((c) => cordMat(K, c)), mBeamPaint = Mk.tex(beamTex(), 0.8), mGold = Mk.flat("#c9a04a", 0.4);
  const wall = (name: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: THREE.Material = mPlaster) => Mk.mesh(name, tileUV(boxG(X(x0), X(x1), y0, y1, z0, z1), 1.6), m);
  const WAIN = 1.0;

  // ============================================================================================ the shell
  Mk.mesh("office.floor", levelQuad(X(D.x0 - WT), X(D.x1 + WT), D.z0 - WT, D.z1 + WT, 0, (x, z) => [x / 1.0, -z / 2.4]), mFloor, { cast: false });
  Mk.mesh("office.ceiling", ceilQuad(X(D.x0 - WT), X(D.x1 + WT), D.z0 - WT, D.z1 + WT, D.h, (x, z) => [z / 1.6, x / 2.4]), mCeil);
  Mk.mesh("office.slab", boxG(X(D.x0 - WT), X(D.x1 + WT), D.h + 0.02, D.h + 0.3, D.z0 - WT, D.z1 + WT), mBeam, { noink: true });
  // the back wall with the moon window (extruded with a round hole)
  {
    const sh = new THREE.Shape(); sh.moveTo(D.x0 - WT, 0); sh.lineTo(D.x1 + WT, 0); sh.lineTo(D.x1 + WT, D.h); sh.lineTo(D.x0 - WT, D.h); sh.closePath();
    const hole = new THREE.Path(); hole.absarc(D.moon.x, D.moon.y, D.moon.r, 0, Math.PI * 2, true); sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false, curveSegments: 56 }).translate(X0, 0, D.z0 - WT);
    Mk.mesh("office.back", tileUV(g, 1.6), mPlaster);
  }
  const back = Mk.mesh("office.back.wain", tileUV(boxG(X(D.x0), X(D.x1), 0, WAIN, D.z0, D.z0 + 0.02), 1.2), mWain);
  void back;
  const left = [wall("office.left", D.x0 - WT, D.x0, 0, D.h, D.z0 - WT, D.z1 + WT), Mk.mesh("office.left.wain", tileUV(boxG(X(D.x0), X(D.x0 + 0.02), 0, WAIN, D.cabinet.z1, D.z1), 1.2), mWain)];
  const right = [wall("office.right", D.x1, D.x1 + WT, 0, D.h, D.z0 - WT, D.z1 + WT), Mk.mesh("office.right.wain", tileUV(boxG(X(D.x1 - 0.02), X(D.x1), 0, WAIN, D.z0, D.z1), 1.2), mWain)];
  // the front wall (+z) with the door
  const DOOR = { w: 1.2, h: 2.3 };
  const front: THREE.Object3D[] = [
    wall("office.front", D.x0 - WT, D.door.x - DOOR.w / 2, 0, D.h, D.z1, D.z1 + WT), wall("office.front", D.door.x + DOOR.w / 2, D.x1 + WT, 0, D.h, D.z1, D.z1 + WT),
    wall("office.front", D.door.x - DOOR.w / 2, D.door.x + DOOR.w / 2, DOOR.h, D.h, D.z1, D.z1 + WT),
    Mk.mesh("office.front.wain", tileUV(boxG(X(D.x0), X(D.door.x - DOOR.w / 2 - 0.1), 0, WAIN, D.z1 - 0.02, D.z1), 1.2), mWain),
    Mk.mesh("office.front.wain", tileUV(boxG(X(D.door.x + DOOR.w / 2 + 0.1), X(D.x1), 0, WAIN, D.z1 - 0.02, D.z1), 1.2), mWain),
    Mk.mesh("office.door.post", boxG(X(D.door.x - DOOR.w / 2 - 0.12), X(D.door.x - DOOR.w / 2), 0, DOOR.h + 0.12, D.z1 - 0.06, D.z1 + WT + 0.04), mLac),
    Mk.mesh("office.door.post", boxG(X(D.door.x + DOOR.w / 2), X(D.door.x + DOOR.w / 2 + 0.12), 0, DOOR.h + 0.12, D.z1 - 0.06, D.z1 + WT + 0.04), mLac),
    Mk.mesh("office.door.lintel", boxG(X(D.door.x - DOOR.w / 2 - 0.12), X(D.door.x + DOOR.w / 2 + 0.12), DOOR.h, DOOR.h + 0.16, D.z1 - 0.06, D.z1 + WT + 0.04), mLac),
    Mk.mesh("office.door.beyond", new THREE.PlaneGeometry(4, 3.4).rotateY(Math.PI).translate(X(D.door.x), 1.4, D.z1 + 1.6), Mk.basic("#ffffff", { map: beyondTex() }), { cast: false, receive: false, noink: true }),
    Mk.mesh("office.door.clouds", levelQuad(X(D.door.x - 2), X(D.door.x + 2), D.z1 + WT, D.z1 + 1.7, -0.02), Mk.basic("#f6ead2"), { cast: false, receive: false, noink: true }),
    Mk.mesh("office.door.sill", boxG(X(D.door.x - DOOR.w / 2), X(D.door.x + DOOR.w / 2), 0, 0.05, D.z1 - 0.04, D.z1 + WT), mBeam),
  ];
  // pillars: the four corners and a pair flanking the moon window, half sunk in the walls
  const bands = (x: number, z: number, r: number) => [0.2, 2.98].map((y) => Mk.mesh("office.pillar.band", new THREE.CylinderGeometry(r + 0.012, r + 0.012, 0.055, 20).translate(X(x), y, z), mGold));
  const pil = (x: number, z: number, r = 0.13) => {
    Mk.mesh("office.pillar", tileUV(new THREE.CylinderGeometry(r, r, D.h, 20).translate(X(x), D.h / 2, z), 0.6), mLac);
    Mk.mesh("office.pillar.foot", new THREE.CylinderGeometry(r + 0.05, r + 0.07, 0.1, 20).translate(X(x), 0.05, z), mDark);
    bands(x, z, r);
  };
  pil(D.x0 + 0.1, D.z0 + 0.1); pil(D.x1 - 0.1, D.z0 + 0.1); pil(-1.25, D.z0 + 0.02, 0.12); pil(1.65, D.z0 + 0.02, 0.12);
  const frontPil = [D.x0 + 0.1, D.x1 - 0.1].map((x) => { const m = Mk.mesh("office.pillar", tileUV(new THREE.CylinderGeometry(0.13, 0.13, D.h, 20).translate(X(x), D.h / 2, D.z1 - 0.1), 0.6), mLac); return m; });
  front.push(...frontPil, ...[D.x0 + 0.1, D.x1 - 0.1].flatMap((x) => bands(x, D.z1 - 0.1, 0.13)));
  // beams across the room (x), under the ceiling, and a rail along the walls at the wainscot's top
  const BEAMS = [-1.55, 0.55, 2.45], BY = 3.06;
  for (const z of BEAMS) Mk.mesh("office.beam", bandUV(boxG(X(D.x0), X(D.x1), BY, D.h, z - 0.1, z + 0.1), 1.2), mBeamPaint);
  Mk.mesh("office.rail", boxG(X(D.x0), X(D.x1), WAIN, WAIN + 0.05, D.z0, D.z0 + 0.04), mDark);
  right.push(Mk.mesh("office.rail", boxG(X(D.x1 - 0.04), X(D.x1), WAIN, WAIN + 0.05, D.z0, D.z1), mDark));
  // the moon window: lacquer ring, the sky outside
  Mk.mesh("office.moon.ring", new THREE.TorusGeometry(D.moon.r + 0.03, 0.055, 10, 64).translate(X(D.moon.x), D.moon.y, D.z0 + 0.01), mLac);
  Mk.mesh("office.moon.ringout", new THREE.TorusGeometry(D.moon.r + 0.03, 0.05, 10, 64).translate(X(D.moon.x), D.moon.y, D.z0 - WT - 0.01), mLac);
  Mk.mesh("office.sky", new THREE.PlaneGeometry(6.5, 6.5).translate(X(D.moon.x), D.moon.y + 0.3, D.z0 - 2.6), Mk.basic("#ffffff", { map: skyTex() }), { cast: false, receive: false, noink: true });

  // ============================================================================================ dressing
  const P = new Part(K), r = rng(401);
  // ---------------------------------------------------------------- THE CASE-FILE CABINET (-x wall)
  {
    const cx = D.cabinetX, z0 = D.cabinet.z0, z1 = D.cabinet.z1, top = D.cabinet.top, len = z1 - z0;
    Mk.mesh("office.cab.body", boxG(X(D.x0), X(cx - 0.02), 0, top, z0, z1), mDark);
    Mk.mesh("office.cab.face", new THREE.PlaneGeometry(len, top).rotateY(Math.PI / 2).translate(X(cx), top / 2, (z0 + z1) / 2), Mk.tex(cabTex(len, top), 0.8));
    // end boards, cornice, plinth (proud of the face)
    Mk.mesh("office.cab.end", boxG(X(D.x0), X(cx + 0.04), 0, top + 0.06, z0 - 0.05, z0), mDark);
    Mk.mesh("office.cab.end", boxG(X(D.x0), X(cx + 0.04), 0, top + 0.06, z1, z1 + 0.05), mDark);
    Mk.mesh("office.cab.cornice", boxG(X(D.x0), X(cx + 0.08), top, top + 0.08, z0 - 0.08, z1 + 0.08), mDark);
    Mk.mesh("office.cab.plinth", boxG(X(D.x0), X(cx + 0.03), 0, CAB.y0 - 0.01, z0, z1), mBeam);
    // the knobs (brass), and a few drawers pulled out with thread spilling over their lips
    const cw = len / CAB.cols, rh = (CAB.y1 - CAB.y0) / CAB.rows;
    const open = new Map<string, number>([["3,2", 0.16], ["9,4", 0.22], ["11,1", 0.12], ["5,6", 0.1]]);
    for (let row = 0; row < CAB.rows; row++) for (let c = 0; c < CAB.cols; c++) {
      const zc = z1 - (c + 0.5) * cw, yTop = CAB.y1 - row * rh, yc = yTop - rh * 0.62;
      const out = open.get(`${c},${row}`) ?? 0;
      if (out) {
        const dz = cw * 0.47, dy = rh * 0.46, yd = yTop - rh / 2;
        P.add(mDesk, boxG(X(cx - 0.005), X(cx + out), yd - dy, yd + dy, zc - dz, zc + dz), 0.004);
        P.add(mPaper, new THREE.PlaneGeometry(cw * 0.5, rh * 0.22).rotateY(Math.PI / 2).translate(X(cx + out + 0.002), yTop - rh * 0.25, zc), 0);
        P.add(mBrass, new THREE.SphereGeometry(0.014, 10, 8).translate(X(cx + out + 0.015), yc, zc), 0.003);
        // thread over the lip
        // two cords over the drawer's front lip (they rest ON the lip, then hang), a coil lying on the drawer's top
        for (let k = 0; k < 2; k++) {
          const z = zc + (k - 0.5) * 0.06, hang = 0.12 + 0.25 * r(), lip = yd + dy + 0.0066;
          const cur = new THREE.CatmullRomCurve3([V(X(cx + out - 0.07), lip, z), V(X(cx + out - 0.005), lip, z + 0.005), V(X(cx + out + 0.012), lip - 0.02, z + 0.008), V(X(cx + out + 0.016), yd + dy - hang * 0.5, z + 0.02 * (r() - 0.5)), V(X(cx + out + 0.014 + 0.02 * r()), yd + dy - hang, z + 0.04 * (r() - 0.5))]);
          P.add(RC[k % 3], cordGeo(cur), CORD_INK);
        }
        P.add(RC[0], cordRing(0.045).rotateX(Math.PI / 2).translate(X(cx + out * 0.45), yd + dy + 0.0066, zc), CORD_INK);
      } else {
        P.add(mBrass, new THREE.CylinderGeometry(0.011, 0.014, 0.024, 10).rotateZ(Math.PI / 2).translate(X(cx + 0.012), yc, zc), 0.003);
      }
    }
    // on top: file boxes, a bundle of scrolls, spools, a thread basket
    P.add(mDesk, boxG(X(-2.98), X(-2.76), top + 0.08, top + 0.3, -2.0, -1.6), 0.005);
    P.add(mBeam, boxG(X(-2.96), X(-2.78), top + 0.3, top + 0.44, -1.95, -1.62), 0.005);
    for (let k = 0; k < 5; k++) P.add(mPaper, new THREE.CylinderGeometry(0.03, 0.03, 0.36, 10).rotateX(Math.PI / 2).rotateY(0.2 * (r() - 0.5)).translate(X(-2.86 + 0.02 * (k % 2)), top + 0.11 + 0.055 * Math.floor(k / 2), -0.9 + 0.06 * k), 0.003);
    for (let k = 0; k < 6; k++) addSpool(P, mRed[k % 3], mBeam, X(-2.84), top + 0.08, -0.1 + 0.13 * k, 1);
    threadBasket(P, mRed, RC, mCord, X(-2.85), top + 0.08, 0.85, 0.16, 0.14, 402);
  }

  // ---------------------------------------------------------------- the desk, the stool, the things on the desk
  {
    const d = D.desk, x0 = X(d.x - d.w / 2), x1 = X(d.x + d.w / 2), z0 = d.z - d.d / 2, z1 = d.z + d.d / 2, t = d.top;
    P.add(mDesk, boxG(x0 - 0.03, x1 + 0.03, t - 0.05, t, z0 - 0.03, z1 + 0.03), 0.006);
    for (const [lx, lz] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04], [x0 + 0.04, z1 - 0.04], [x1 - 0.04, z1 - 0.04]]) P.add(mDark, boxG(lx - 0.03, lx + 0.03, 0, t - 0.05, lz - 0.03, lz + 0.03), 0.005);
    P.add(mDark, boxG(x0 + 0.02, x1 - 0.02, t - 0.16, t - 0.05, z1 - 0.05, z1 - 0.02), 0.004);   // front apron, carved (below)
    Mk.mesh("office.desk.apron", new THREE.PlaneGeometry(x1 - x0 - 0.04, 0.11).translate((x0 + x1) / 2, t - 0.105, z1 - 0.0195), Mk.tex(apronTex(), 0.7), { cast: false, noink: true });
    P.add(mDark, boxG(x0 + 0.02, x1 - 0.02, t - 0.13, t - 0.05, z0 + 0.02, z0 + 0.05), 0.004);
    P.add(mDark, boxG(x0 + 0.04, x1 - 0.04, 0.1, 0.14, d.z - 0.02, d.z + 0.02), 0.004);           // foot stretcher
    // the side cupboard at the +x end: a stack of drawers
    P.add(mDesk, boxG(x1 - 0.42, x1 - 0.04, 0.06, t - 0.13, z0 + 0.06, z1 - 0.06), 0.005);
    for (const y of [0.2, 0.36]) P.add(mBrass, new THREE.SphereGeometry(0.014, 8, 6).translate(x1 - 0.23, y, z1 - 0.055), 0.003);
    // THE BOOK 姻缘簿, open in the middle, its spread read from his side (-z)
    const bx = X(d.x), bz = d.z - 0.13;
    P.add(Mk.flat("#7a1e20", 0.7), boxG(bx - 0.27, bx + 0.27, t, t + 0.012, bz - 0.18, bz + 0.18), 0.003);
    P.add(mPaper, boxG(bx - 0.255, bx - 0.005, t + 0.012, t + 0.03, bz - 0.17, bz + 0.17), 0.003);
    P.add(mPaper, boxG(bx + 0.005, bx + 0.255, t + 0.012, t + 0.03, bz - 0.17, bz + 0.17), 0.003);
    P.add(Mk.tex(bookTex(), 0.95), new THREE.PlaneGeometry(0.5, 0.34).rotateX(-Math.PI / 2).rotateY(Math.PI).translate(bx, t + 0.0315, bz), 0);
    // the ledgers' pile (left end), askew
    let y = t;
    for (let k = 0; k < 7; k++) {
      const h = 0.03 + 0.02 * r(), a = (r() - 0.5) * 0.35, col = ["#3c4a66", "#5a4a3a", "#6a2c26", "#4a5a50"][k % 4];
      const m = new THREE.Matrix4().makeRotationY(a).setPosition(X(-0.18) + 0.02 * (r() - 0.5), y + h / 2, d.z - 0.1 + 0.03 * (r() - 0.5));
      P.add(Mk.flat(col, 0.85), new THREE.BoxGeometry(0.26, h, 0.36), 0.003, m);
      P.add(mPaper, new THREE.BoxGeometry(0.255, h * 0.7, 0.352).translate(0.006, 0, 0), 0, m);
      y += h;
    }
    P.add(mPaper, new THREE.BoxGeometry(0.2, 0.004, 0.28).rotateY(0.6).translate(X(-0.15), y + 0.002, d.z - 0.1), 0.002);
    // the abacus (front right, lying flat)
    {
      const ax = X(0.88), az = d.z + 0.18, aw = 0.34, ad = 0.14, ay = t + 0.012;
      P.add(mDark, boxG(ax - aw / 2, ax + aw / 2, t, ay + 0.012, az - ad / 2, az - ad / 2 + 0.015), 0.003);
      P.add(mDark, boxG(ax - aw / 2, ax + aw / 2, t, ay + 0.012, az + ad / 2 - 0.015, az + ad / 2), 0.003);
      P.add(mDark, boxG(ax - aw / 2, ax - aw / 2 + 0.015, t, ay + 0.012, az - ad / 2, az + ad / 2), 0.003);
      P.add(mDark, boxG(ax + aw / 2 - 0.015, ax + aw / 2, t, ay + 0.012, az - ad / 2, az + ad / 2), 0.003);
      P.add(mDark, boxG(ax - aw / 2, ax + aw / 2, t, ay + 0.012, az - ad / 2 + 0.035, az - ad / 2 + 0.045), 0.002);
      const mBead = Mk.flat("#3a1e14", 0.6);
      for (let k = 0; k < 9; k++) {
        const x = ax - aw / 2 + 0.03 + k * ((aw - 0.06) / 8);
        P.add(mBrass, new THREE.CylinderGeometry(0.002, 0.002, ad - 0.02, 4).rotateX(Math.PI / 2).translate(x, ay + 0.006, az), 0);
        const up = r() < 0.4 ? 1 : 0;
        for (let b = 0; b < 2; b++) P.add(mBead, new THREE.SphereGeometry(0.011, 8, 6).scale(1, 0.7, 0.8).translate(x, ay + 0.006, az + ad / 2 - 0.03 - b * 0.018 - (up && b === 0 ? 0.02 : 0)), 0.002);
        P.add(mBead, new THREE.SphereGeometry(0.011, 8, 6).scale(1, 0.7, 0.8).translate(x, ay + 0.006, az - ad / 2 + 0.025 + (up ? 0.008 : 0)), 0.002);
      }
    }
    // the ink stone, a brush pot with brushes, a brush rest, the tea cup
    P.add(mInk, boxG(X(0.78), X(0.98), t, t + 0.025, d.z - 0.28, d.z - 0.14), 0.003);
    P.add(Mk.flat("#0c0a0c", 0.3), boxG(X(0.8), X(0.92), t + 0.025, t + 0.027, d.z - 0.26, d.z - 0.16), 0);
    P.add(Mk.flat("#3e5c4e", 0.5), lathe([[0, 0], [0.045, 0], [0.05, 0.02], [0.05, 0.13], [0.042, 0.13], [0.042, 0.02], [0, 0.02]], 16).translate(X(1.04), t, d.z - 0.12), 0.003);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7, lean = 0.08 + 0.05 * k;
      const b0 = V(X(1.04) + 0.015 * Math.cos(a), t + 0.03, d.z - 0.12 + 0.015 * Math.sin(a)), b1 = b0.clone().add(V(Math.cos(a) * lean * 0.3, 0.22, Math.sin(a) * lean * 0.3));
      P.add(Mk.flat("#b89a62", 0.7), bar(b0, b1, 0.005, 0.005, 6), 0.002);
      P.add(Mk.flat("#2a201a", 0.8), bar(b1, b1.clone().add(V(Math.cos(a) * 0.01, 0.035, Math.sin(a) * 0.01)), 0.007, 0.002, 6), 0.002);
    }
    P.add(Mk.flat("#ece4d2", 0.4), lathe([[0, 0], [0.025, 0], [0.04, 0.045], [0.037, 0.045], [0.022, 0.006], [0, 0.006]], 16).translate(X(-0.2), t, d.z + 0.2), 0.003);
    P.add(Mk.flat("#ece4d2", 0.4), new THREE.CylinderGeometry(0.06, 0.055, 0.008, 16).translate(X(-0.2), t + 0.004, d.z + 0.2), 0.003);
    P.add(Mk.flat("#8a6a2a", 0.4), new THREE.CylinderGeometry(0.034, 0.034, 0.002, 12).translate(X(-0.2), t + 0.035, d.z + 0.2), 0);
    // a loose cord across the desk: out from under the book's edge, lying ON the top, over the front edge, hanging
    {
      const cr = 0.0065, on = t + cr + 0.0005, edge = z1 + 0.03 + cr;
      P.add(RC[0], cordGeo([V(X(0.12), t + 0.012 + cr + 0.0005, d.z + 0.04), V(X(0.2), on, d.z + 0.1), V(X(0.42), on, d.z + 0.22), V(X(0.58), on, z1 + 0.015), V(X(0.62), t + 0.004, edge), V(X(0.64), t - 0.06, edge + 0.004), V(X(0.63), t - 0.3, edge + 0.006)], cr), CORD_INK);
    }
    // the stool
    const s = D.stool;
    P.add(mDesk, new THREE.CylinderGeometry(0.17, 0.17, 0.045, 20).translate(X(s.x), s.top - 0.0225, s.z), 0.005);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; P.add(mDark, bar(V(X(s.x) + 0.1 * Math.cos(a), s.top - 0.04, s.z + 0.1 * Math.sin(a)), V(X(s.x) + 0.14 * Math.cos(a), 0, s.z + 0.14 * Math.sin(a)), 0.02, 0.018, 8), 0.004); }
    P.add(mDark, new THREE.TorusGeometry(0.12, 0.012, 6, 20).rotateX(Math.PI / 2).translate(X(s.x), 0.12, s.z), 0.003);
  }

  // ---------------------------------------------------------------- shelves of spools (back wall, right of the window)
  {
    const z = D.z0 + 0.02, sx0 = 1.95, sx1 = 2.75;
    for (const y of [1.3, 1.72, 2.14]) {
      P.add(mDark, boxG(X(sx0), X(sx1), y - 0.03, y, z, z + 0.24), 0.005);
      for (const bx of [sx0 + 0.08, sx1 - 0.08]) P.add(mDark, boxG(X(bx - 0.015), X(bx + 0.015), y - 0.14, y - 0.03, z, z + 0.04), 0.003);
      const n = 6;
      for (let k = 0; k < n; k++) {
        if (r() < 0.15) continue;
        addSpool(P, mRed[Math.floor(r() * 3)], mBeam, X(sx0 + 0.07 + k * ((sx1 - sx0 - 0.14) / (n - 1))), y, z + 0.08 + 0.06 * r(), 0.9 + 0.3 * r());
      }
      // a hank drooping off the shelf's edge
      if (y < 2) P.add(RC[1], cordRing(0.06, 0.0065, 2.2).translate(X(sx0 + 0.35 + y * 0.1), y - 0.12, z + 0.25), CORD_INK);
    }
    // under them, a basket of skeins and a heap on the floor
    threadBasket(P, mRed, RC, mCord, X(2.3), 0, D.z0 + 0.32, 0.24, 0.32, 403);
    skeinHeap(P, RC, X(2.75), D.z0 + 0.4, 0.3, 404);
  }

  // ---------------------------------------------------------------- the 缘 (back wall, left of the window): a red 斗方 hung
  // HIGH, on its corner. (It was a tall scroll at head height: in most of scene A it sat right behind her camera's REC
  // clock. Up here it is above the clock in every framing, and the wall behind the clock is plain plaster.)
  {
    const sx = -2.0, cy = 2.77, side = 0.4, d = side * Math.SQRT1_2;
    Mk.mesh("office.scroll", new THREE.PlaneGeometry(side, side).rotateZ(Math.PI / 4).translate(X(sx), cy, D.z0 + 0.012), Mk.tex(scrollTex(), 0.95), { cast: false, noink: false });
    P.add(mBrass, new THREE.SphereGeometry(0.012, 8, 6).translate(X(sx), cy + d - 0.012, D.z0 + 0.02), 0.002);
    // a heap of skeins on the floor below it, by the desk's left
    skeinHeap(P, RC, X(-1.75), D.z0 + 0.4, 0.34, 405);
    threadBasket(P, mRed, RC, mCord, X(-0.95), 0, D.z0 + 0.3, 0.2, 0.26, 406);
  }

  // ---------------------------------------------------------------- THE PLAQUE over the moon window, THE COUPLETS beside it
  // 千里姻缘一线牵 in gold on dark lacquer in a carved red frame, between the window's ring and the ceiling; the two lines
  // of the old 月老祠 couplet on red paper flecked with gold, between the ring and the pillars, above the rail.
  {
    const pw = 1.7, ph = pw * PLAQUE_PX.h / PLAQUE_PX.w, py0 = D.moon.y + D.moon.r + 0.1, z = D.z0;
    P.add(mLac, boxG(X(D.moon.x - pw / 2 - 0.02), X(D.moon.x + pw / 2 + 0.02), py0 - 0.02, py0 + ph + 0.02, z, z + 0.05), 0.005);
    Mk.mesh("office.plaque", new THREE.PlaneGeometry(pw, ph).translate(X(D.moon.x), py0 + ph / 2, z + 0.0515), Mk.tex(plaqueTex(), 0.6), { cast: false, noink: true });
    const cw = 0.21, ch = cw * COUPLET_PX.h / COUPLET_PX.w, cy0 = 1.12;
    for (const [x, text, seed] of [[1.33, "愿天下有情人都成了眷属", 1361], [-0.93, "是前生注定事莫错过姻缘", 1362]] as const) {
      Mk.mesh("office.couplet", new THREE.PlaneGeometry(cw, ch).translate(X(x), cy0 + ch / 2, z + 0.012), Mk.tex(coupletTex(text, seed), 0.9), { cast: false });
      P.add(mDark, bar(V(X(x - cw / 2 - 0.012), cy0 + ch + 0.008, z + 0.02), V(X(x + cw / 2 + 0.012), cy0 + ch + 0.008, z + 0.02), 0.008, 0.008, 8), 0.003);
    }
  }

  // ---------------------------------------------------------------- THE DECREE (+x wall, where the KPI board hung)
  // 考绩令 from heaven's Board of Personnel, a hanging scroll: the painted silk and mount on one sheet just off the wall,
  // a top stick on a cord to a brass nail, a heavy roller with jade ends at the bottom. It hangs ABOVE the wall's rail.
  const kpiMeshes: THREE.Mesh[] = [];
  {
    const b = D.board, fx = X(D.x1), sw = DECREE.w, sh = sw * DECREE_PX.h / DECREE_PX.w, y0 = DECREE.y0, y1 = y0 + sh;
    for (const done of [false, true]) kpiMeshes.push(Mk.mesh("office.decree.sheet", new THREE.PlaneGeometry(sw, sh).rotateY(-Math.PI / 2).translate(fx - 0.014, (y0 + y1) / 2, b.z), Mk.tex(decreeTex(done), 0.95), { cast: false }));
    P.add(mDark, bar(V(fx - 0.02, y1 + 0.008, b.z - sw / 2 - 0.012), V(fx - 0.02, y1 + 0.008, b.z + sw / 2 + 0.012), 0.009, 0.009, 10), 0.004);
    P.add(mDark, bar(V(fx - 0.03, y0 - 0.014, b.z - sw / 2 - 0.015), V(fx - 0.03, y0 - 0.014, b.z + sw / 2 + 0.015), 0.018, 0.018, 12), 0.005);
    const mJade = Mk.flat("#5e9a7e", 0.4);
    for (const sg of [-1, 1]) P.add(mJade, new THREE.CylinderGeometry(0.024, 0.024, 0.045, 12).rotateX(Math.PI / 2).translate(fx - 0.03, y0 - 0.014, b.z + sg * (sw / 2 + 0.036)), 0.004);
    const nail = V(fx - 0.012, y1 + 0.2, b.z);
    P.add(mBrass, new THREE.SphereGeometry(0.014, 8, 6).translate(nail.x, nail.y, nail.z), 0.003);
    P.add(RC[1], cordGeo([V(fx - 0.02, y1 + 0.016, b.z - sw * 0.32), V(fx - 0.016, y1 + 0.11, b.z - sw * 0.15), nail, V(fx - 0.016, y1 + 0.11, b.z + sw * 0.15), V(fx - 0.02, y1 + 0.016, b.z + sw * 0.32)]), CORD_INK);
  }

  // memo slips pinned on the +x wall round the board
  for (const [z, y, w, h, rot, seed] of [[-1.62, 1.78, 0.2, 0.3, 0.06, 911], [-1.58, 1.36, 0.16, 0.24, -0.08, 912], [0.3, 1.7, 0.18, 0.27, -0.05, 913], [0.36, 1.32, 0.15, 0.22, 0.1, 914], [-0.95, 2.28, 0.17, 0.22, 0.04, 915]] as const) {
    Mk.mesh("office.memo", new THREE.PlaneGeometry(w, h).rotateZ(rot).rotateY(-Math.PI / 2).translate(X(D.x1 - 0.004), y, z), Mk.tex(noteTex(seed), 0.95), { cast: false });
    P.add(Mk.flat("#b8262a", 0.5), new THREE.SphereGeometry(0.011, 8, 6).translate(X(D.x1 - 0.01), y + h / 2 - 0.025, z), 0.002);
  }
  // ---------------------------------------------------------------- the burner on its low table (+x, by the door)
  const smokeCards: THREE.Mesh[] = [];
  const smokeBase = V(X(D.burner.x), D.burner.top + 0.26, D.burner.z);
  {
    const bu = D.burner, bx = X(bu.x), t = bu.top;
    P.add(mDesk, boxG(bx - 0.28, bx + 0.28, t - 0.04, t, bu.z - 0.24, bu.z + 0.24), 0.005);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.add(mDark, boxG(bx + dx * 0.24 - 0.025, bx + dx * 0.24 + 0.025, 0, t - 0.04, bu.z + dz * 0.2 - 0.025, bu.z + dz * 0.2 + 0.025), 0.004);
    P.add(mDark, boxG(bx - 0.24, bx + 0.24, 0.08, 0.11, bu.z - 0.2, bu.z + 0.2), 0.003);
    // the bronze ding: a round belly on three legs, two ear handles, a pierced lid
    P.add(mBronze, lathe([[0, 0.03], [0.07, 0.035], [0.1, 0.07], [0.1, 0.11], [0.085, 0.14], [0.09, 0.15], [0.07, 0.15], [0.065, 0.14], [0, 0.14]], 20).translate(bx, t, bu.z), 0.004);
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; P.add(mBronze, bar(V(bx + 0.06 * Math.cos(a), t + 0.05, bu.z + 0.06 * Math.sin(a)), V(bx + 0.08 * Math.cos(a), t, bu.z + 0.08 * Math.sin(a)), 0.012, 0.01, 6), 0.003); }
    for (const s of [-1, 1]) P.add(mBronze, new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI).translate(bx + s * 0.075, t + 0.15, bu.z), 0.003);
    P.add(mBronze, lathe([[0, 0.14], [0.07, 0.14], [0.05, 0.175], [0.015, 0.19], [0.02, 0.205], [0, 0.21]], 16).translate(bx, t, bu.z), 0.003);
    // three incense sticks with glowing tips
    for (let k = 0; k < 3; k++) {
      const a = V(bx + (k - 1) * 0.02, t + 0.14, bu.z + 0.03), b2 = a.clone().add(V((k - 1) * 0.015, 0.14, 0));
      P.add(Mk.flat("#8a3a2a", 0.8), bar(a, b2, 0.0025, 0.0025, 4), 0.0015);
      P.add(Mk.basic("#ffb070"), new THREE.SphereGeometry(0.004, 6, 4).translate(b2.x, b2.y, b2.z), 0);
    }
    // a small offering plate of red-thread-tied tokens beside it
    P.add(Mk.flat("#ece4d2", 0.4), new THREE.CylinderGeometry(0.09, 0.08, 0.012, 18).translate(bx - 0.16, t + 0.006, bu.z - 0.12), 0.003);
    for (let k = 0; k < 3; k++) P.add(Mk.flat("#e8c070", 0.5), new THREE.BoxGeometry(0.03, 0.012, 0.05).rotateY(k).translate(bx - 0.16 + 0.03 * (k - 1), t + 0.018, bu.z - 0.12), 0.002);
    // the smoke: soft cards turned to the camera
    const st = smokeTex();
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ map: st, color: "#f7f0e6", transparent: true, opacity: 0, depthWrite: false, fog: false }));
      m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.renderOrder = 6; m.name = "office.smoke"; m.frustumCulled = false; group.add(m); smokeCards.push(m);
    }
  }

  // ---------------------------------------------------------------- red thread: hanks from the beams, lines across, pegs
  {
    // hanks hanging from the beams
    const hankAt = (x: number, z: number, len: number, seed: number) => {
      const q = rng(seed), y0 = BY;
      const n = 3 + Math.floor(q() * 2), mat = RC[Math.floor(q() * 3)];
      for (let k = 0; k < n; k++) {
        const rr = 0.04 + 0.02 * q(), sy = len / (2 * rr);
        const g = cordRing(rr, 0.0065, sy).rotateY(q() * Math.PI).rotateZ((q() - 0.5) * 0.12).translate(X(x) + 0.02 * (q() - 0.5), y0 - len / 2 - 0.02, z + 0.02 * (q() - 0.5));
        P.add(k % 2 ? mat : RC[(Math.floor(q() * 3))], g, CORD_INK);
      }
      P.add(mCord, new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8).translate(X(x), y0 - 0.04, z), 0.002);   // the knot
    };
    const HANKS: [number, number, number][] = [[-1.9, BEAMS[0], 0.4], [-0.6, BEAMS[0], 0.62], [1.2, BEAMS[0], 0.5],
      [-2.4, BEAMS[1], 0.45], [-1.5, BEAMS[1], 0.6], [2.2, BEAMS[1], 0.55], [-2.2, BEAMS[2], 0.6], [1.3, BEAMS[2], 0.6]];
    HANKS.forEach(([x, z, l], i) => hankAt(x, z + (i % 2 ? 0.06 : -0.06), l, 500 + i));
    // lines strung across the room, sagging, with little paper name tags
    const line = (a: THREE.Vector3, b: THREE.Vector3, sag: number, mat: THREE.Material, tags: number, seed: number) => {
      const q = rng(seed), pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) { const s = i / 12; pts.push(a.clone().lerp(b, s).add(V(0, -sag * 4 * s * (1 - s), 0))); }
      const cur = new THREE.CatmullRomCurve3(pts);
      P.add(mat, cordGeo(cur), CORD_INK);
      for (let k = 0; k < tags; k++) {
        const p = cur.getPoint((k + 0.5 + 0.3 * (q() - 0.5)) / tags), ang = Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2;
        P.add(mPaper, new THREE.BoxGeometry(0.035, 0.07, 0.002).translate(0, -0.05, 0).rotateY(ang + (q() - 0.5) * 0.6).translate(p.x, p.y, p.z), 0.0015);
        P.add(mat, cordGeo([p.clone().add(V(0, -0.004, 0)), p.clone().add(V(0, -0.02, 0))], 0.006, false, 2), 0.002);
      }
    };
    line(V(X(-2.7), 2.75, -1.9), V(X(2.95), 2.6, 0.3), 0.35, RC[0], 5, 601);
    line(V(X(-2.7), 2.6, 1.6), V(X(2.95), 2.8, -1.8), 0.4, RC[1], 4, 602);
    line(V(X(0.6), BY, BEAMS[0]), V(X(2.5), BY, BEAMS[1]), 0.5, RC[2], 3, 604);
    // (v6: the garland over the moon window made way for the plaque)
    // pegs on the walls with loops hanging
    const peg = (x: number, y: number, z: number, nx: number, seed: number) => {
      const q = rng(seed), out = V(nx, 0, nx === 0 ? 1 : 0);
      const p0 = V(X(x), y, z), p1 = p0.clone().addScaledVector(out, 0.1).add(V(0, 0.015, 0));
      P.add(mDark, bar(p0, p1, 0.012, 0.012, 6), 0.003);
      for (let k = 0; k < 2 + Math.floor(q() * 2); k++) {
        const rr = 0.05 + 0.04 * q(), len = 0.2 + 0.25 * q();
        const g = cordRing(rr, 0.0065, len / (2 * rr)).rotateY(nx === 0 ? 0 : Math.PI / 2).rotateY((q() - 0.5) * 0.6).translate(p1.x - out.x * 0.04, p1.y - len / 2 + 0.01, p1.z - out.z * 0.04);
        P.add(RC[Math.floor(q() * 3)], g, CORD_INK);
      }
    };
    peg(D.x0 + 0.02, 1.95, 1.75, 1, 611); peg(D.x0 + 0.02, 1.95, 2.35, 1, 612); peg(D.x0 + 0.02, 1.7, 2.9, 1, 613);
    peg(D.x1 - 0.02, 1.95, 1.85, -1, 614); peg(D.x1 - 0.02, 1.95, 2.5, -1, 615); peg(D.x1 - 0.02, 1.9, -2.15, -1, 616); peg(D.x1 - 0.02, 2.15, 0.75, -1, 617);
    // baskets and heaps against the walls (the centre floor stays clear)
    threadBasket(P, mRed, RC, mCord, X(-2.55), 0, 1.75, 0.22, 0.3, 621);
    skeinHeap(P, RC, X(-2.6), 2.5, 0.32, 622);
    skeinHeap(P, RC, X(2.6), 2.4, 0.3, 623);
    threadBasket(P, mRed, RC, mCord, X(2.6), 0, 1.85, 0.2, 0.26, 624);
    skeinHeap(P, RC, X(1.4), D.z1 - 0.35, 0.26, 625);
    skeinHeap(P, RC, X(-1.5), D.z1 - 0.35, 0.3, 626);
    skeinHeap(P, RC, X(2.65), -2.0, 0.25, 627);
  }

  // ---------------------------------------------------------------- lanterns
  const lantern = (x: number, z: number, yb: number, col: string, seed: number) => {
    const mL = Mk.tex(lanternTex(col, seed), 0.8);
    const prof: [number, number][] = [[0.07, 0], [0.13, 0.04], [0.17, 0.12], [0.175, 0.2], [0.15, 0.28], [0.08, 0.32]];
    P.add(mL, lathe(prof, 20).translate(X(x), yb, z), 0.004);
    P.add(mDark, new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16).translate(X(x), yb - 0.01, z), 0.003);
    P.add(mDark, new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16).translate(X(x), yb + 0.33, z), 0.003);
    P.add(mCord, bar(V(X(x), yb + 0.35, z), V(X(x), BY, z), 0.004, 0.004, 4), 0.0015);
    for (let k = 0; k < 3; k++) P.add(RC[0], cordGeo([V(X(x) + 0.012 * (k - 1), yb - 0.02, z + 0.006 * (k % 2)), V(X(x) + 0.016 * (k - 1), yb - 0.21, z + 0.006 * (k % 2))], 0.006, false, 4), 0.003);
  };
  lantern(0.45, BEAMS[1], 2.55, "#e8c890", 701);   // (in the title's wide it hangs between the REC clock and the battery, not behind either)
  lantern(-1.9, BEAMS[2], 2.4, "#c84a34", 702);
  lantern(-0.6, BEAMS[0], 2.45, "#e8c890", 703);

  // ---------------------------------------------------------------- THE TANGLE (v6: loose cord in lazy coils, not noise)
  // A low mound painted with loops (so a gap never shows a plain blob), wound round with about thirty long lengths of the
  // film's cord: coils lying round it at different heights, each a little tilted, layered outward so they cross OVER
  // one another; arcs over its shoulders from floor to floor; flat coils on the floor round its foot; a few ends running
  // off. No cord comes within 0.33 m of the middle (where he stands waist-deep in scene A): nothing passes through him.
  const tangle = new THREE.Group(); tangle.name = "office.tangle"; tangle.position.set(X(D.tangle.x), 0, D.tangle.z); group.add(tangle);
  {
    const T = new Part(K), q = rng(801), R = D.tangle.r, H = D.tangle.h, a = R * 0.8, b = H * 0.86, cr = 0.0085, gap = cr * 2.3;
    const lump = (x: number, y: number, z: number) => 1 + 0.07 * Math.sin(x * 7 + 1.3) * Math.cos(z * 6) + 0.05 * Math.sin(y * 9 + x * 4);
    const core = new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), cp = core.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i), n = lump(x, y, z); cp.setXYZ(i, x * a * n, y * b * n, z * a * n); }
    core.computeVertexNormals();
    T.add(Mk.tex(moundTex(), 0.9), core, 0.004);
    /** a point on the mound at azimuth th and elevation phi, pushed out by `out` */
    const on = (th: number, phi: number, out: number) => {
      const ux = Math.cos(phi) * Math.cos(th), uy = Math.sin(phi), uz = Math.cos(phi) * Math.sin(th), n = lump(ux, uy, uz);
      return V(ux * a * n, uy * b * n, uz * a * n).addScaledVector(V(ux, (uy * a) / b, uz).normalize(), out);
    };
    /** out along the floor from a point at the mound's foot, lying on the floor */
    const floorRun = (from: THREE.Vector3, th: number, len: number, seed: number) => {
      const w = rng(seed), pts: THREE.Vector3[] = []; let ang = th;
      for (let k = 1; k <= 4; k++) { ang += (w() - 0.5) * 0.7; const rr = Math.hypot(from.x, from.z) + (len * k) / 4; pts.push(V(Math.cos(ang) * rr, cr, Math.sin(ang) * rr)); }
      return pts;
    };
    // coils round the mound
    for (let i = 0; i < 24; i++) {
      const phi0 = 0.1 + 0.72 * (i / 23) ** 0.85 + 0.04 * (q() - 0.5), tilt = 0.06 + 0.08 * q(), th0 = q() * Math.PI * 2, span = Math.PI * (1.3 + 0.7 * q()), out = cr + gap * (i % 3) + 0.002;
      const pts: THREE.Vector3[] = [], N = 40;
      for (let k = 0; k <= N; k++) { const th = th0 + (span * k) / N; pts.push(on(th, Math.max(0.05, phi0 + tilt * Math.sin(th - th0 * 1.7)), out)); }
      // one end drops off the mound to the floor and runs out a little
      if (i % 2 === 0) { const e = pts[pts.length - 1]; const foot = on(th0 + span + 0.15, 0.02, out); pts.push(V(foot.x, Math.max(cr, foot.y), foot.z), ...floorRun(foot, th0 + span + 0.15, 0.12 + 0.2 * q(), 900 + i)); void e; }
      T.add(RC[i % 3], cordGeo(pts, cr), CORD_INK);
    }
    // arcs over its shoulders, floor to floor, outermost: each along a chord that passes 0.36 to 0.5 m from the middle
    for (let i = 0; i < 9; i++) {
      const al = (i / 9) * Math.PI * 2 + 0.4 * q(), d = 0.36 + 0.14 * q(), half = Math.sqrt(Math.max(0.01, a * a - d * d)) * 0.98;
      const out = cr + gap * 3 + 0.003 + 0.002 * (i % 2), pts: THREE.Vector3[] = [], N = 26;
      for (let k = 0; k <= N; k++) {
        const sc = -half + (2 * half * k) / N, x = d * Math.cos(al) - sc * Math.sin(al), z = d * Math.sin(al) + sc * Math.cos(al);
        pts.push(on(Math.atan2(z, x), Math.acos(Math.min(0.999, Math.hypot(x, z) / a)), out));
      }
      const s0 = pts[0], s1 = pts[pts.length - 1];
      T.add(RC[(i + 1) % 3], cordGeo([...floorRun(s0, Math.atan2(s0.z, s0.x), 0.1 + 0.12 * q(), 950 + i).reverse(), V(s0.x, Math.max(cr, s0.y), s0.z), ...pts.slice(1, -1), V(s1.x, Math.max(cr, s1.y), s1.z), ...floorRun(s1, Math.atan2(s1.z, s1.x), 0.08 + 0.12 * q(), 970 + i)], cr), CORD_INK);
    }
    // flat coils on the floor round the foot (each rises a cord's width as it crosses itself)
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2 + 0.5 * q(), rr0 = a * (1.02 + 0.22 * q()), cx = Math.cos(ang) * rr0, cz = Math.sin(ang) * rr0;
      const rx = 0.07 + 0.08 * q(), rz = 0.05 + 0.06 * q(), turns = 1.25 + 0.3 * q(), N = 34, pts: THREE.Vector3[] = [];
      for (let k = 0; k <= N; k++) { const u = k / N, t = u * turns * Math.PI * 2 + ang; pts.push(V(cx + Math.cos(t) * rx * (1 - 0.25 * u), cr + gap * Math.max(0, (u * turns - 0.85) / (turns - 0.85)), cz + Math.sin(t) * rz * (1 - 0.25 * u))); }
      T.add(RC[i % 3], cordGeo(pts, cr), CORD_INK);
    }
    // ends running off across the floor
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + 0.9 + 0.4 * q(), foot = on(ang, 0.03, cr + 0.002);
      T.add(RC[(i + 2) % 3], cordGeo([V(foot.x, Math.max(cr, foot.y), foot.z), ...floorRun(foot, ang, 0.5 + 0.8 * q(), 990 + i)], cr), CORD_INK);
    }
    T.into(tangle, "office.tangle.part", { cast: true, receive: true });
  }

  // ---------------------------------------------------------------- INCENSE COILS hanging from the back beam
  {
    const mInc = Mk.flat("#8a5a3a", 0.85);
    for (const [x, seed] of [[-2.25, 1371], [2.45, 1372]] as const) {
      const q2 = rng(seed), top = V(X(x), BY - 0.02, BEAMS[0] + 0.0), yb = 2.42, N = 120, turns = 6, pts: THREE.Vector3[] = [];
      for (let k = 0; k <= N; k++) { const u = k / N, th = u * turns * Math.PI * 2 + q2(); void th; const t2 = u * turns * Math.PI * 2; pts.push(V(top.x + Math.cos(t2) * (0.15 - 0.12 * u), yb + 0.3 * u, top.z + Math.sin(t2) * (0.15 - 0.12 * u))); }
      P.add(mInc, cordGeo(pts, 0.006), 0.003);
      // three hangers from the beam to the coil's rim, a red tag under it, the ember at the outer end
      for (let k = 0; k < 3; k++) { const t2 = (k / 3) * Math.PI * 2; P.add(mCord, cordGeo([top.clone(), V(top.x + Math.cos(t2) * 0.15, yb, top.z + Math.sin(t2) * 0.15)], 0.006, false, 6), 0.002); }
      P.add(mRed[0], boxG(top.x - 0.03, top.x + 0.03, yb - 0.2, yb - 0.04, top.z - 0.002, top.z + 0.002), 0.003);
      P.add(Mk.basic("#ffb070"), new THREE.SphereGeometry(0.008, 8, 6).translate(pts[0].x, pts[0].y, pts[0].z), 0);
    }
  }

  // ---------------------------------------------------------------- CLOUDS: heaven comes in at the floor and under the window
  // flat 祥云 cards (their own painted outline, NOINK), standing in the floor along the walls (turned to the camera) and
  // just outside the moon window's lower rim (facing in); each drifts a little, a pure function of t.
  const clouds: { m: THREE.Mesh; x: number; amp: number; ph: number; sp: number; turn: boolean }[] = [];
  {
    const tex = [cloudTex(1401), cloudTex(1402), cloudTex(1403), cloudTex(1404)], ar = CLOUD_PX.h / CLOUD_PX.w;
    const put = (x: number, y: number, z: number, w: number, i: number, turn = true, amp = 0.06) => {
      const h = w * ar, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h * 0.36, 0), new THREE.MeshBasicMaterial({ map: tex[i % tex.length], color: "#efe6d8", transparent: true, depthWrite: false, fog: false }));
      m.position.set(X(x), y, z); m.name = "office.cloud.card"; m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.renderOrder = 4; group.add(m);
      clouds.push({ m, x: X(x), amp, ph: i * 1.7, sp: 0.18 + 0.05 * (i % 3), turn });
    };
    put(-1.9, -0.03, D.z0 + 0.36, 1.8, 0); put(0.25, -0.03, D.z0 + 0.3, 1.2, 3); put(1.45, -0.03, D.z0 + 0.36, 1.6, 1);   // along the back wall, behind the desk
    put(-2.42, -0.03, -2.1, 1.2, 2); put(-2.42, -0.03, 1.3, 1.3, 3);                        // at the cabinet's two ends
    put(2.48, -0.03, -2.0, 1.3, 1); put(2.45, -0.03, 2.15, 1.5, 2);                         // along the right wall
    put(-2.3, -0.03, D.z1 - 0.5, 1.4, 3); put(2.3, -0.03, D.z1 - 0.5, 1.4, 0);              // the front corners
    put(D.moon.x - 0.25, D.moon.y - D.moon.r - 0.1, D.z0 - WT - 0.06, 0.8, 1, false, 0.04); // outside the window, at its lower rim
    put(D.moon.x + 0.4, D.moon.y - D.moon.r - 0.06, D.z0 - WT - 0.12, 0.6, 2, false, 0.03);
  }

  P.into(group, "office.dressing", { cast: true, receive: true });

  // ============================================================================================ light
  const sdir = V(...KEY).normalize().negate();
  const s = D.moon.r * 0.62, mz = D.z0 + 0.03;
  const corners = [V(X(D.moon.x - s), D.moon.y - s, mz), V(X(D.moon.x + s), D.moon.y - s, mz), V(X(D.moon.x + s), D.moon.y + s, mz), V(X(D.moon.x - s), D.moon.y + s, mz)];
  const shaft = sunShaft(corners, sdir, 2.6, "#ffe8c0", 0.09); shaft.name = "office.shaft"; group.add(shaft);
  const dust = dustMotes(60, corners, sdir, 2.4, 811); dust.points.name = "office.dust"; group.add(dust.points);
  const Lr = lightRig(group, { dir: KEY, k: 2.6, col: "#ffe2b4", at: [X(0), 0, 0], half: 6, hemi: ["#f6e0bc", "#6e4c34", 1.25], point: { col: "#ffd9a8", k: 3.2, at: [X(0.3), 2.5, 1.4], dist: 8 } });
  Lr.point.decay = 1.4; Lr.key.shadow.bias = -0.0006;

  // ============================================================================================ params
  let smoke = 0, camYaw = 0;
  const applyKpi = (k: number) => { kpiMeshes[0].visible = k < 0.5; kpiMeshes[1].visible = k >= 0.5; };
  applyKpi(0);
  const smokeAt = (t: number) => {
    const n = smokeCards.length;
    smokeCards.forEach((m, i) => {
      m.visible = smoke > 0.001;
      if (!m.visible) return;
      const p = (t * 0.16 + i / n) % 1, sway = 0.035 * Math.sin(t * 0.8 + i * 1.9) * p + 0.05 * p * p;
      m.position.set(smokeBase.x + sway, smokeBase.y + p * 1.35, smokeBase.z - 0.04 * p);
      m.scale.set(0.05 + 0.3 * p, 0.28 + 0.25 * p, 1);
      m.rotation.set(0, camYaw, 0.15 * Math.sin(t * 0.5 + i));
      (m.material as THREE.MeshBasicMaterial).opacity = smoke * 0.7 * Math.sin(Math.PI * Math.min(1, p * 1.25)) ** 1.2 * (1 - 0.3 * p);
    });
  };
  let lastT = 0;
  smokeAt(0);
  return {
    group,
    view(c: THREE.Vector3) {
      const lx = c.x - X0;
      for (const o of front) o.visible = c.z < D.z1 - 0.5;
      for (const o of left) o.visible = lx > D.x0 + 0.3;
      for (const o of right) o.visible = lx < D.x1 - 0.3;
      camYaw = Math.atan2(c.x - smokeBase.x, c.z - smokeBase.z);
      for (const k of clouds) if (k.turn) k.m.rotation.set(0, Math.atan2(c.x - k.m.position.x, c.z - k.m.position.z), 0);
      smokeAt(lastT);
    },
    animate(t: number) { lastT = t; smokeAt(t); dust.update(t, 1); for (const k of clouds) k.m.position.x = k.x + k.amp * Math.sin(t * k.sp + k.ph); },
    setParam(name: string, v: ParamValue) {
      if (name === "kpi") applyKpi(Number(v));
      else if (name === "smoke") { smoke = clamp01(Number(v)); smokeAt(lastT); }
      else if (name === "tangle") { const k = clamp01(Number(v)); tangle.visible = k > 0.001; tangle.scale.set(1, 0.8 + 0.2 * k, 1); }   // (v6: the heap keeps its shape; it only settles a little once he is out)
    },
    cast(): Partial<CastLight> { return {}; },
  };
};

// ===================================================================================================== small props
/** a spool of red thread standing on a surface at y */
function addSpool(P: Part, red: THREE.Material, wood: THREE.Material, x: number, y: number, z: number, s = 1) {
  P.add(wood, new THREE.CylinderGeometry(0.042 * s, 0.042 * s, 0.012 * s, 14).translate(x, y + 0.006 * s, z), 0.002);
  P.add(red, new THREE.CylinderGeometry(0.034 * s, 0.034 * s, 0.07 * s, 14).translate(x, y + 0.047 * s, z), 0.002);
  P.add(wood, new THREE.CylinderGeometry(0.042 * s, 0.042 * s, 0.012 * s, 14).translate(x, y + 0.088 * s, z), 0.002);
}
/** a round wicker basket (radius, height) on y, heaped with loops of thread */
function threadBasket(P: Part, reds: THREE.Material[], cords: THREE.Material[], wicker: THREE.Material, x: number, y: number, z: number, rad: number, h: number, seed: number) {
  const q = rng(seed);
  P.add(wicker, lathe([[0, 0], [rad * 0.85, 0], [rad, h], [rad - 0.015, h], [rad * 0.85 - 0.015, 0.015], [0, 0.015]], 18).translate(x, y, z), 0.004);
  P.add(wicker, new THREE.TorusGeometry(rad, 0.012, 6, 24).rotateX(Math.PI / 2).translate(x, y + h, z), 0.003);
  P.add(reds[1], new THREE.SphereGeometry(rad * 0.92, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1).translate(x, y + h - 0.02, z), 0.002);
  for (let i = 0; i < 12; i++) {
    const a = q() * Math.PI * 2, rr = rad * 0.75 * Math.sqrt(q());
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(q() * 3, q() * 3, q() * 3)).setPosition(x + Math.cos(a) * rr, y + h + rad * 0.3 * (1 - rr / rad) - 0.01, z + Math.sin(a) * rr);
    P.add(cords[i % 3], cordRing(0.04 + 0.05 * q()), CORD_INK, m);
  }
  // one loop hanging over the rim
  const a = q() * Math.PI * 2;
  P.add(cords[0], cordRing(0.06, 0.0065, 1.8).rotateY(-a).translate(x + Math.cos(a) * (rad + 0.008), y + h - 0.07, z + Math.sin(a) * (rad + 0.008)), CORD_INK);
}
/** a heap of skeins (coiled hanks) lying on the floor */
function skeinHeap(P: Part, reds: THREE.Material[], x: number, z: number, rad: number, seed: number) {
  const q = rng(seed);
  for (let i = 0; i < 9; i++) {
    const a = q() * Math.PI * 2, rr = rad * 0.6 * Math.sqrt(q()), layer = Math.floor(i / 4);
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2 + (q() - 0.5) * 0.5, (q() - 0.5) * 0.5, q() * 3));
    const tr = 0.07 + 0.05 * q(), tube = 0.022 + 0.01 * q();
    m.setPosition(x + Math.cos(a) * rr, tube + layer * 0.04, z + Math.sin(a) * rr);
    P.add(reds[i % 3], cordRing(tr, tube, 1.6), 0.004, m);
  }
}

/** UVs for a painted beam (a box along x): u = x / unit along it, v = 0..1 across each long face */
function bandUV(g0: THREE.BufferGeometry, unit: number) {
  const g = g0.index ? g0.toNonIndexed() : g0; g.computeBoundingBox(); const bb = g.boundingBox!;
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[2 * i] = p.getX(i) / unit;
    uv[2 * i + 1] = Math.abs(n.getY(i)) > 0.5 ? (p.getZ(i) - bb.min.z) / (bb.max.z - bb.min.z) : (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

export const OFFICE_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };

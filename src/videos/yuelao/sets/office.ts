// THE OFFICE (place "office", island x 0): 天庭姻缘司, 月老's one-man marriage bureau in heaven, year-end morning.
// A 6 x 6 m clerk's room worked in for 1200 years: dark red lacquer pillars, cream plaster over dark wood wainscot,
// warm floor boards, a round moon window in the back wall (-z) with a blue-gold morning sky, a pale moon and clouds
// outside; the key comes in through it. RED THREAD EVERYWHERE: hanks from the beams, lines strung across the room,
// spools on the shelves, baskets and skeins against the walls; THE TANGLE heap on the floor. The case-file cabinet (a
// medicine chest of drawers) fills the -x wall; the KPI board hangs on the +x wall; the burner stands by the door.
// All marks: places.ts OFFICE (local; world x = ISLAND.office + x).
// PARAMS
//   kpi     0 | 1   the KPI board's sheet: 0 = 年度指标 / 还差 1 对 / 今晚子时截止; 1 = 年度指标 / 达标 + a red stamp
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
import { ceilQuad, lathe, plasterTex, boardsTex, sunShaft, dustMotes } from "../../romeo/sets/parts/b_common";
import { ISLAND, OFFICE as D } from "../places";
import { maker, boxG, paint, rng, css, mix, blotch, NOINK, levelQuad, tileUV, bar, FONT, lightRig, V, flatFace } from "./common";

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
  const mx = W * 0.6, my = H * 0.33, mr = W * 0.07;
  const mg = g.createRadialGradient(mx, my, 0, mx, my, mr * 2.4); mg.addColorStop(0, "rgba(255,252,238,0.55)"); mg.addColorStop(1, "rgba(255,252,238,0)");
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

/** THE KPI SHEET: 0 = 还差 1 对, 1 = 达标 with a stamp */
const kpiTex = (done: boolean) => paint(1040, 800, (g, W, H) => {
  const r = rng(done ? 322 : 321);
  g.fillStyle = "#efe2c2"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) blotch(g, W * r(), H * r(), W * (0.05 + 0.12 * r()), r() < 0.6 ? "#d8c49a" : "#f8eed6", 0.18);
  g.strokeStyle = css("#b04030", 0.7); g.lineWidth = 6; g.strokeRect(34, 34, W - 68, H - 68);
  g.strokeStyle = css("#b04030", 0.4); g.lineWidth = 2; g.strokeRect(48, 48, W - 96, H - 96);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#2a1c14"; g.font = `900 112px ${FONT}`; g.fillText("年度指标", W / 2, 150);
  g.fillStyle = css("#2a1c14", 0.6); g.fillRect(W * 0.2, 222, W * 0.6, 5);
  if (!done) {
    g.fillStyle = "#c01e22"; g.font = `900 230px ${FONT}`;
    g.save(); g.translate(W / 2, 430); g.rotate(-0.025); g.fillText("还差 1 对", 0, 0); g.restore();
    g.fillStyle = "#3a2a20"; g.font = `900 66px ${FONT}`; g.fillText("今晚子时截止", W / 2, 640);
  } else {
    g.fillStyle = "#c01e22"; g.font = `900 300px ${FONT}`;
    g.save(); g.translate(W / 2 - 130, 460); g.rotate(-0.03); g.fillText("达标", 0, 0); g.restore();
    // the round stamp, lower right, a little crooked
    g.save(); g.translate(W * 0.8, H * 0.73); g.rotate(-0.3); g.scale(0.9, 0.9);
    g.strokeStyle = css("#c8202a", 0.88); g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 135, 0, 7); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 108, 0, 7); g.stroke();
    g.fillStyle = css("#c8202a", 0.88); g.font = `900 74px ${FONT}`; g.fillText("姻缘司", 0, -14);
    g.font = `900 40px ${FONT}`; g.fillText("★ 准 ★", 0, 58);
    g.restore();
  }
});

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
  const mPlaster = Mk.tex(plasterTex(306, "#d6bf98", "#b49a72", "#ead8b4"), 0.95), mWain = Mk.tex(wainTex(), 0.85), mFloor = Mk.tex(floorTex(), 0.88), mCeil = Mk.tex(ceilTex(), 0.9);
  const mDark = Mk.tex(darkWoodTex(307), 0.8), mDesk = Mk.tex(darkWoodTex(308, "#62402a"), 0.7), mLac = Mk.tex(lacquerTex(), 0.6), mBeam = Mk.tex(darkWoodTex(309, "#4a2c1c"), 0.85);
  const mBrass = Mk.flat("#b08a44", 0.45), mBronze = Mk.flat("#7a6040", 0.5), mPaper = Mk.flat("#eadcb8", 0.95), mInk = Mk.flat("#1e1a1c", 0.6);
  const mRed = REDS.map((c) => Mk.flat(c, 0.9)), mRedDeep = Mk.flat("#741218", 0.95), mCord = Mk.flat("#3a2618", 0.9);
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
  const pil = (x: number, z: number, r = 0.13) => {
    Mk.mesh("office.pillar", tileUV(new THREE.CylinderGeometry(r, r, D.h, 20).translate(X(x), D.h / 2, z), 0.6), mLac);
    Mk.mesh("office.pillar.foot", new THREE.CylinderGeometry(r + 0.05, r + 0.07, 0.1, 20).translate(X(x), 0.05, z), mDark);
  };
  pil(D.x0 + 0.1, D.z0 + 0.1); pil(D.x1 - 0.1, D.z0 + 0.1); pil(-1.25, D.z0 + 0.02, 0.12); pil(1.65, D.z0 + 0.02, 0.12);
  const frontPil = [D.x0 + 0.1, D.x1 - 0.1].map((x) => { const m = Mk.mesh("office.pillar", tileUV(new THREE.CylinderGeometry(0.13, 0.13, D.h, 20).translate(X(x), D.h / 2, D.z1 - 0.1), 0.6), mLac); return m; });
  front.push(...frontPil);
  // beams across the room (x), under the ceiling, and a rail along the walls at the wainscot's top
  const BEAMS = [-1.55, 0.55, 2.45], BY = 3.06;
  for (const z of BEAMS) Mk.mesh("office.beam", tileUV(boxG(X(D.x0), X(D.x1), BY, D.h, z - 0.1, z + 0.1), 1.2), mBeam);
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
        for (let k = 0; k < 3; k++) {
          const z = zc + (k - 1) * 0.05, hang = 0.12 + 0.25 * r();
          const cur = new THREE.CatmullRomCurve3([V(X(cx + out - 0.06), yd + dy - 0.01, z), V(X(cx + out + 0.01), yd + dy + 0.01, z + 0.01), V(X(cx + out + 0.03), yd + dy - hang * 0.5, z + 0.03 * (r() - 0.5)), V(X(cx + out + 0.02 + 0.03 * r()), yd + dy - hang, z + 0.05 * (r() - 0.5))]);
          P.add(mRed[k % 3], new THREE.TubeGeometry(cur, 16, 0.006, 5), 0.002);
        }
        P.add(mRed[0], new THREE.TorusGeometry(0.05, 0.012, 6, 16).rotateX(Math.PI / 2).translate(X(cx + out * 0.5), yd + dy + 0.005, zc), 0.002);
      } else {
        P.add(mBrass, new THREE.CylinderGeometry(0.011, 0.014, 0.024, 10).rotateZ(Math.PI / 2).translate(X(cx + 0.012), yc, zc), 0.003);
      }
    }
    // on top: file boxes, a bundle of scrolls, spools, a thread basket
    P.add(mDesk, boxG(X(-2.98), X(-2.76), top + 0.08, top + 0.3, -2.0, -1.6), 0.005);
    P.add(mBeam, boxG(X(-2.96), X(-2.78), top + 0.3, top + 0.44, -1.95, -1.62), 0.005);
    for (let k = 0; k < 5; k++) P.add(mPaper, new THREE.CylinderGeometry(0.03, 0.03, 0.36, 10).rotateX(Math.PI / 2).rotateY(0.2 * (r() - 0.5)).translate(X(-2.86 + 0.02 * (k % 2)), top + 0.11 + 0.055 * Math.floor(k / 2), -0.9 + 0.06 * k), 0.003);
    for (let k = 0; k < 6; k++) addSpool(P, mRed[k % 3], mBeam, X(-2.84), top + 0.08, -0.1 + 0.13 * k, 1);
    threadBasket(P, mRed, mCord, X(-2.85), top + 0.08, 0.85, 0.16, 0.14, 402);
  }

  // ---------------------------------------------------------------- the desk, the stool, the things on the desk
  {
    const d = D.desk, x0 = X(d.x - d.w / 2), x1 = X(d.x + d.w / 2), z0 = d.z - d.d / 2, z1 = d.z + d.d / 2, t = d.top;
    P.add(mDesk, boxG(x0 - 0.03, x1 + 0.03, t - 0.05, t, z0 - 0.03, z1 + 0.03), 0.006);
    for (const [lx, lz] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04], [x0 + 0.04, z1 - 0.04], [x1 - 0.04, z1 - 0.04]]) P.add(mDark, boxG(lx - 0.03, lx + 0.03, 0, t - 0.05, lz - 0.03, lz + 0.03), 0.005);
    P.add(mDark, boxG(x0 + 0.02, x1 - 0.02, t - 0.13, t - 0.05, z1 - 0.05, z1 - 0.02), 0.004);   // front apron
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
    // a loose red thread across the desk, off its edge
    P.add(mRed[0], new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(X(0.1), t + 0.035, d.z - 0.05), V(X(0.4), t + 0.004, d.z + 0.22), V(X(0.6), t + 0.003, d.z + 0.3), V(X(0.68), t - 0.1, z1 + 0.04), V(X(0.62), t - 0.35, z1 + 0.05)]), 24, 0.004, 5), 0.0015);
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
      if (y < 2) P.add(mRed[1], new THREE.TorusGeometry(0.06, 0.008, 5, 18).scale(1, 2.2, 1).translate(X(sx0 + 0.35 + y * 0.1), y - 0.12, z + 0.25), 0.002);
    }
    // under them, a basket of skeins and a heap on the floor
    threadBasket(P, mRed, mCord, X(2.3), 0, D.z0 + 0.32, 0.24, 0.32, 403);
    skeinHeap(P, mRed, X(2.75), D.z0 + 0.4, 0.3, 404);
  }

  // ---------------------------------------------------------------- the 缘 (back wall, left of the window): a red 斗方 hung
  // HIGH, on its corner. (It was a tall scroll at head height: in most of scene A it sat right behind her camera's REC
  // clock. Up here it is above the clock in every framing, and the wall behind the clock is plain plaster.)
  {
    const sx = -2.0, cy = 2.77, side = 0.4, d = side * Math.SQRT1_2;
    Mk.mesh("office.scroll", new THREE.PlaneGeometry(side, side).rotateZ(Math.PI / 4).translate(X(sx), cy, D.z0 + 0.012), Mk.tex(scrollTex(), 0.95), { cast: false, noink: false });
    P.add(mBrass, new THREE.SphereGeometry(0.012, 8, 6).translate(X(sx), cy + d - 0.012, D.z0 + 0.02), 0.002);
    // a heap of skeins on the floor below it, by the desk's left
    skeinHeap(P, mRed, X(-1.75), D.z0 + 0.4, 0.34, 405);
    threadBasket(P, mRed, mCord, X(-0.95), 0, D.z0 + 0.3, 0.2, 0.26, 406);
  }

  // ---------------------------------------------------------------- THE KPI BOARD (+x wall)
  const kpiMeshes: THREE.Mesh[] = [];
  {
    const b = D.board, bx = D.boardX, fx = X(bx);
    Mk.mesh("office.kpi.board", boxG(fx, X(D.x1 - 0.01), b.y - b.h / 2, b.y + b.h / 2, b.z - b.w / 2, b.z + b.w / 2), mDesk);
    // frame: four bars proud of the board
    const fr = 0.06, fd = 0.035;
    for (const [y0, y1, z0, z1] of [[b.y + b.h / 2 - fr, b.y + b.h / 2, b.z - b.w / 2, b.z + b.w / 2], [b.y - b.h / 2, b.y - b.h / 2 + fr, b.z - b.w / 2, b.z + b.w / 2], [b.y - b.h / 2, b.y + b.h / 2, b.z - b.w / 2, b.z - b.w / 2 + fr], [b.y - b.h / 2, b.y + b.h / 2, b.z + b.w / 2 - fr, b.z + b.w / 2]])
      Mk.mesh("office.kpi.frame", boxG(fx - fd, fx, y0, y1, z0, z1), mDark);
    const pw = b.w - 0.2, ph = b.h - 0.2;
    for (const done of [false, true]) {
      const m = Mk.mesh("office.kpi.sheet", new THREE.PlaneGeometry(pw, ph).rotateY(-Math.PI / 2).translate(fx - 0.006, b.y - 0.01, b.z), Mk.tex(kpiTex(done), 0.95), { cast: false });
      kpiMeshes.push(m);
    }
    for (const [dz, dy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) P.add(Mk.flat("#b8262a", 0.5), new THREE.SphereGeometry(0.014, 8, 6).translate(fx - 0.012, b.y - 0.01 + dy * (ph / 2 - 0.03), b.z + dz * (pw / 2 - 0.03)), 0.002);
    // a little roof board over it, red thread tied in a bow at its top corners
    P.add(mDark, boxG(fx - 0.1, X(D.x1), b.y + b.h / 2 + 0.02, b.y + b.h / 2 + 0.06, b.z - b.w / 2 - 0.08, b.z + b.w / 2 + 0.08), 0.004);
    for (const dz of [-1, 1]) {
      const z = b.z + dz * (b.w / 2 + 0.02), y = b.y + b.h / 2 + 0.02;
      P.add(mRed[0], new THREE.TorusGeometry(0.035, 0.007, 5, 14).rotateY(Math.PI / 2).translate(fx - 0.05, y - 0.03, z - 0.03), 0.002);
      P.add(mRed[0], new THREE.TorusGeometry(0.035, 0.007, 5, 14).rotateY(Math.PI / 2).translate(fx - 0.05, y - 0.03, z + 0.03), 0.002);
      P.add(mRed[0], bar(V(fx - 0.05, y - 0.05, z), V(fx - 0.06, y - 0.3, z + 0.04 * dz), 0.006, 0.006, 5), 0.0015);
    }
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
      const n = 4 + Math.floor(q() * 3), mat = mRed[Math.floor(q() * 3)];
      for (let k = 0; k < n; k++) {
        const rr = 0.04 + 0.02 * q(), sy = len / (2 * rr);
        const g = new THREE.TorusGeometry(rr, 0.006, 5, 22).scale(1, sy, 1).rotateY(q() * Math.PI).rotateZ((q() - 0.5) * 0.12).translate(X(x) + 0.02 * (q() - 0.5), y0 - len / 2 - 0.02, z + 0.02 * (q() - 0.5));
        P.add(k % 2 ? mat : mRed[(Math.floor(q() * 3))], g, 0.0015);
      }
      P.add(mCord, new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8).translate(X(x), y0 - 0.04, z), 0.002);   // the knot
    };
    const HANKS: [number, number, number][] = [[-2.3, BEAMS[0], 0.55], [-1.9, BEAMS[0], 0.4], [-0.6, BEAMS[0], 0.62], [1.2, BEAMS[0], 0.5], [2.4, BEAMS[0], 0.6],
      [-2.4, BEAMS[1], 0.45], [-1.5, BEAMS[1], 0.6], [0.9, BEAMS[1], 0.42], [2.2, BEAMS[1], 0.55], [-2.2, BEAMS[2], 0.6], [-1.2, BEAMS[2], 0.4], [1.3, BEAMS[2], 0.6], [2.5, BEAMS[2], 0.45]];
    HANKS.forEach(([x, z, l], i) => hankAt(x, z + (i % 2 ? 0.06 : -0.06), l, 500 + i));
    // lines strung across the room, sagging, with little paper name tags
    const line = (a: THREE.Vector3, b: THREE.Vector3, sag: number, mat: THREE.Material, tags: number, seed: number) => {
      const q = rng(seed), pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) { const s = i / 12; pts.push(a.clone().lerp(b, s).add(V(0, -sag * 4 * s * (1 - s), 0))); }
      const cur = new THREE.CatmullRomCurve3(pts);
      P.add(mat, new THREE.TubeGeometry(cur, 36, 0.006, 5), 0.0015);
      for (let k = 0; k < tags; k++) {
        const p = cur.getPoint((k + 0.5 + 0.3 * (q() - 0.5)) / tags), ang = Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2;
        P.add(mPaper, new THREE.BoxGeometry(0.035, 0.07, 0.002).translate(0, -0.05, 0).rotateY(ang + (q() - 0.5) * 0.6).translate(p.x, p.y, p.z), 0.0015);
        P.add(mat, new THREE.CylinderGeometry(0.0015, 0.0015, 0.016, 3).translate(p.x, p.y - 0.008, p.z), 0);
      }
    };
    line(V(X(-2.7), 2.75, -1.9), V(X(2.95), 2.6, 0.3), 0.35, mRed[0], 6, 601);
    line(V(X(-2.7), 2.6, 1.6), V(X(2.95), 2.8, -1.8), 0.4, mRed[1], 5, 602);
    line(V(X(-2.0), BY, BEAMS[1]), V(X(-0.2), BY, BEAMS[2]), 0.45, mRed[2], 3, 603);
    line(V(X(0.6), BY, BEAMS[0]), V(X(2.5), BY, BEAMS[1]), 0.5, mRed[0], 3, 604);
    line(V(X(-2.95), 2.4, 2.4), V(X(-1.2), BY, BEAMS[2]), 0.25, mRed[1], 2, 605);
    line(V(X(-1.2), 2.9, D.z0 + 0.02), V(X(1.6), 2.9, D.z0 + 0.02), 0.32, mRed[0], 4, 606);   // a garland over the moon window
    // pegs on the walls with loops hanging
    const peg = (x: number, y: number, z: number, nx: number, seed: number) => {
      const q = rng(seed), out = V(nx, 0, nx === 0 ? 1 : 0);
      const p0 = V(X(x), y, z), p1 = p0.clone().addScaledVector(out, 0.1).add(V(0, 0.015, 0));
      P.add(mDark, bar(p0, p1, 0.012, 0.012, 6), 0.003);
      for (let k = 0; k < 3 + Math.floor(q() * 3); k++) {
        const rr = 0.05 + 0.04 * q(), len = 0.2 + 0.25 * q();
        const g = new THREE.TorusGeometry(rr, 0.006, 5, 20).scale(1, len / (2 * rr), 1).rotateY(nx === 0 ? 0 : Math.PI / 2).rotateY((q() - 0.5) * 0.6).translate(p1.x - out.x * 0.04, p1.y - len / 2 + 0.01, p1.z - out.z * 0.04);
        P.add(mRed[Math.floor(q() * 3)], g, 0.0015);
      }
    };
    peg(D.x0 + 0.02, 1.95, 1.75, 1, 611); peg(D.x0 + 0.02, 1.95, 2.35, 1, 612); peg(D.x0 + 0.02, 1.7, 2.9, 1, 613);
    peg(D.x1 - 0.02, 1.95, 1.85, -1, 614); peg(D.x1 - 0.02, 1.95, 2.5, -1, 615); peg(D.x1 - 0.02, 1.9, -2.15, -1, 616); peg(D.x1 - 0.02, 2.15, 0.75, -1, 617);
    // baskets and heaps against the walls (the centre floor stays clear)
    threadBasket(P, mRed, mCord, X(-2.55), 0, 1.75, 0.22, 0.3, 621);
    skeinHeap(P, mRed, X(-2.6), 2.5, 0.32, 622);
    skeinHeap(P, mRed, X(2.6), 2.4, 0.3, 623);
    threadBasket(P, mRed, mCord, X(2.6), 0, 1.85, 0.2, 0.26, 624);
    skeinHeap(P, mRed, X(1.4), D.z1 - 0.35, 0.26, 625);
    skeinHeap(P, mRed, X(-1.5), D.z1 - 0.35, 0.3, 626);
    skeinHeap(P, mRed, X(2.65), -2.0, 0.25, 627);
  }

  // ---------------------------------------------------------------- lanterns
  const lantern = (x: number, z: number, yb: number, col: string, seed: number) => {
    const mL = Mk.tex(lanternTex(col, seed), 0.8);
    const prof: [number, number][] = [[0.07, 0], [0.13, 0.04], [0.17, 0.12], [0.175, 0.2], [0.15, 0.28], [0.08, 0.32]];
    P.add(mL, lathe(prof, 20).translate(X(x), yb, z), 0.004);
    P.add(mDark, new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16).translate(X(x), yb - 0.01, z), 0.003);
    P.add(mDark, new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16).translate(X(x), yb + 0.33, z), 0.003);
    P.add(mCord, bar(V(X(x), yb + 0.35, z), V(X(x), BY, z), 0.004, 0.004, 4), 0.0015);
    for (let k = 0; k < 5; k++) P.add(mRed[0], new THREE.CylinderGeometry(0.004, 0.006, 0.18, 4).translate(X(x) + 0.01 * (k - 2), yb - 0.12, z + 0.006 * (k % 2)), 0.0015);
  };
  lantern(0.45, BEAMS[1], 2.55, "#e8c890", 701);   // (in the title's wide it hangs between the REC clock and the battery, not behind either)
  lantern(-1.9, BEAMS[2], 2.4, "#c84a34", 702);
  lantern(-0.6, BEAMS[0], 2.45, "#e8c890", 703);

  // ---------------------------------------------------------------- THE TANGLE
  const tangle = new THREE.Group(); tangle.name = "office.tangle"; tangle.position.set(X(D.tangle.x), 0, D.tangle.z); group.add(tangle);
  {
    const T = new Part(K), q = rng(801), R = D.tangle.r, H = D.tangle.h;
    // the lumpy core (dark red), never smooth
    const core = new THREE.SphereGeometry(1, 36, 18), cp = core.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cp.count; i++) {
      const v = V(cp.getX(i), cp.getY(i), cp.getZ(i)), n = 1 + 0.12 * Math.sin(v.x * 7 + 1.3) * Math.cos(v.z * 6) + 0.08 * Math.sin(v.y * 9 + v.x * 4);
      cp.setXYZ(i, v.x * R * 0.74 * n, Math.max(-0.05, v.y) * H * 0.8 * n, v.z * R * 0.74 * n);
    }
    core.computeVertexNormals();
    T.add(mRedDeep, core, 0);
    // the loops: many overlapping tori in three reds, mostly on the surface
    for (let i = 0; i < 380; i++) {
      const a = q() * Math.PI * 2, rad = Math.sqrt(q()) * R * 0.98, hmax = H * Math.sqrt(Math.max(0, 1 - (rad / R) ** 2));
      const y = Math.max(0.02, hmax * (0.6 + 0.4 * q())), tr = 0.035 + 0.11 * q() * q() + 0.03 * q();
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(q() * Math.PI, q() * Math.PI, q() * Math.PI));
      m.setPosition(Math.cos(a) * rad, y, Math.sin(a) * rad);
      T.add(mRed[i % 3], new THREE.TorusGeometry(tr, 0.005 + 0.004 * q(), 5, 22).scale(1, 0.6 + 0.6 * q(), 1), 0.0012, m);
    }
    // a skirt of loops round the foot of the heap (the core never shows at the floor)
    for (let i = 0; i < 140; i++) {
      const a = q() * Math.PI * 2, rad = R * (0.7 + 0.32 * q()), y = 0.03 + 0.2 * q() * (1.1 - rad / R) + 0.04 * q();
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(q() * Math.PI, q() * Math.PI, q() * Math.PI));
      m.setPosition(Math.cos(a) * rad, y, Math.sin(a) * rad);
      T.add(mRed[(i + 2) % 3], new THREE.TorusGeometry(0.04 + 0.08 * q(), 0.005 + 0.004 * q(), 5, 20).scale(1, 0.5 + 0.5 * q(), 1), 0.0012, m);
    }
    // wandering strands across the heap
    for (let i = 0; i < 26; i++) {
      const pts: THREE.Vector3[] = []; let a = q() * Math.PI * 2;
      for (let k = 0; k < 6; k++) {
        a += (q() - 0.5) * 1.6; const rad = R * (0.2 + 0.8 * q()), hmax = H * Math.sqrt(Math.max(0, 1 - (rad / R) ** 2));
        pts.push(V(Math.cos(a) * rad, hmax * (0.75 + 0.3 * q()) + 0.01, Math.sin(a) * rad));
      }
      T.add(mRed[(i + 1) % 3], new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.006, 5), 0.0015);
    }
    // trailing threads running off across the floor
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + q() * 0.5, l = 0.5 + 0.9 * q(), pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 5; k++) { const s = k / 5, rad = R * 0.9 + l * s; pts.push(V(Math.cos(a + 0.25 * Math.sin(s * 5 + i)) * rad, k === 0 ? 0.08 : 0.007, Math.sin(a + 0.25 * Math.sin(s * 5 + i)) * rad)); }
      T.add(mRed[i % 3], new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.005, 5), 0.0015);
    }
    T.into(tangle, "office.tangle.part", { cast: true, receive: true });
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
      smokeAt(lastT);
    },
    animate(t: number) { lastT = t; smokeAt(t); dust.update(t, 1); },
    setParam(name: string, v: ParamValue) {
      if (name === "kpi") applyKpi(Number(v));
      else if (name === "smoke") { smoke = clamp01(Number(v)); smokeAt(lastT); }
      else if (name === "tangle") { const k = clamp01(Number(v)); tangle.visible = k > 0.001; tangle.scale.set(0.85 + 0.15 * k, Math.max(0.001, k), 0.85 + 0.15 * k); }
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
function threadBasket(P: Part, reds: THREE.Material[], wicker: THREE.Material, x: number, y: number, z: number, rad: number, h: number, seed: number) {
  const q = rng(seed);
  P.add(wicker, lathe([[0, 0], [rad * 0.85, 0], [rad, h], [rad - 0.015, h], [rad * 0.85 - 0.015, 0.015], [0, 0.015]], 18).translate(x, y, z), 0.004);
  P.add(wicker, new THREE.TorusGeometry(rad, 0.012, 6, 24).rotateX(Math.PI / 2).translate(x, y + h, z), 0.003);
  P.add(reds[1], new THREE.SphereGeometry(rad * 0.92, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1).translate(x, y + h - 0.02, z), 0.002);
  for (let i = 0; i < 22; i++) {
    const a = q() * Math.PI * 2, rr = rad * 0.75 * Math.sqrt(q());
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(q() * 3, q() * 3, q() * 3)).setPosition(x + Math.cos(a) * rr, y + h + rad * 0.3 * (1 - rr / rad) - 0.01, z + Math.sin(a) * rr);
    P.add(reds[i % 3], new THREE.TorusGeometry(0.04 + 0.05 * q(), 0.007, 5, 18), 0.0015, m);
  }
  // one loop hanging over the rim
  const a = q() * Math.PI * 2;
  P.add(reds[0], new THREE.TorusGeometry(0.06, 0.007, 5, 18).scale(1, 1.8, 1).rotateY(-a).translate(x + Math.cos(a) * rad, y + h - 0.07, z + Math.sin(a) * rad), 0.0015);
}
/** a heap of skeins (coiled hanks) lying on the floor */
function skeinHeap(P: Part, reds: THREE.Material[], x: number, z: number, rad: number, seed: number) {
  const q = rng(seed);
  for (let i = 0; i < 9; i++) {
    const a = q() * Math.PI * 2, rr = rad * 0.6 * Math.sqrt(q()), layer = Math.floor(i / 4);
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2 + (q() - 0.5) * 0.5, (q() - 0.5) * 0.5, q() * 3));
    const tr = 0.07 + 0.05 * q(), tube = 0.022 + 0.01 * q();
    m.setPosition(x + Math.cos(a) * rr, tube + layer * 0.04, z + Math.sin(a) * rr);
    P.add(reds[i % 3], new THREE.TorusGeometry(tr, tube, 8, 22).scale(1, 1.6, 1), 0.003, m);
  }
}

export const OFFICE_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };
